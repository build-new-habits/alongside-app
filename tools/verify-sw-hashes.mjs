/**
 * tools/verify-sw-hashes.mjs
 * 05 Oct 2026 v1
 *
 * SW-INCREMENTAL. Graeme, 05 Oct, after seven updates in a day: "Everything
 * is really really really slow to open and load." Each update downloaded
 * every shell file again (247 files, about 6 MB). Now an update copies each
 * file whose content hash is unchanged from the cache the phone already
 * has, and fetches only the files that changed.
 *
 * A stale hash would keep an old file on phones, so:
 *   1. Every shell file has a hash in sw.js, and it is the file's own
 *      (tools/sw-hashes.mjs --check).
 *   2. The REAL sw.js install, in a sandbox with Node's own Request,
 *      Response and Headers:
 *        a. a first install fetches every file, bypassing the browser's
 *           cache (SW-2), and stamps each with its hash;
 *        b. an update with one file changed fetches that file only and
 *           copies the rest;
 *        c. a copy with no hash, or the wrong one, is fetched again;
 *        d. a failed fetch does not stop the rest (as before).
 */
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { expected, written, shellUrls } from "./sw-hashes.mjs";

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 400)}`); }
};

const sw = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const urls = shellUrls(sw);
const want = expected(sw);
const have = written(sw) || {};

console.log("TEST 1 - the hashes are the files' own");
ok("1a. every shell file has a hash", urls.length > 200 && urls.every(u => typeof have[u] === "string"), urls.filter(u => !have[u]).slice(0, 5).join(", "));
const stale = urls.filter(u => have[u] !== want[u]);
ok("1b. and every hash matches its file (run node tools/sw-hashes.mjs before committing sw.js)", stale.length === 0, stale.slice(0, 8).join(", "));

// ── The real install, sandboxed ─────────────────────────────────────────
const CACHE_NAME = (sw.match(/const CACHE_NAME = "([^"]+)"/) || [])[1];
function makeCaches(stores) {
  const open = name => {
    stores[name] ||= new Map();
    const m = stores[name];
    return Promise.resolve({
      put: async (url, res) => { m.set(String(url), res); },
      match: async url => m.get(String(url)) || null,
      keys: async () => [...m.keys()],
    });
  };
  return { open, keys: async () => Object.keys(stores), delete: async n => delete stores[n], match: async () => null };
}
async function install({ stores, failUrl = null }) {
  const fetched = [];
  const handlers = {};
  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    caches: makeCaches(stores),
    fetch: async req => {
      fetched.push({ url: req.url, cache: req.cache });
      if (req.url === failUrl) throw new Error("offline");
      return new Response(`body of ${req.url}`, { status: 200, headers: { "content-type": "text/plain" } });
    },
    Request: function (u, o = {}) { this.url = u; this.cache = o.cache; },
    Response, Headers, URL, Promise, setTimeout, clearTimeout,
  };
  sandbox.self = {
    addEventListener: (t, fn) => { (handlers[t] ||= []).push(fn); },
    skipWaiting: async () => {}, clients: { claim: async () => {}, matchAll: async () => [] },
    registration: { scope: "https://x/" }, location: { origin: "https://x" },
  };
  vm.createContext(sandbox);
  vm.runInContext(sw, sandbox);
  const pending = [];
  for (const fn of handlers.install || []) fn({ waitUntil: p => pending.push(p) });
  await Promise.all(pending);
  return fetched;
}
const stamped = (body, hash) => new Response(body, { status: 200, headers: hash ? { "x-alongside-hash": hash } : {} });

console.log("\nTEST 2 - an update downloads only what changed");
{
  const stores = {};
  const fetched = await install({ stores });
  const mine = stores[CACHE_NAME];
  ok("2a. a first install fetches every file, past the browser's cache", fetched.length === urls.length && fetched.every(f => f.cache === "reload"), `${fetched.length} of ${urls.length}`);
  ok("2a2. and keeps each with its hash on it", !!mine && urls.every(u => mine.get(u)?.headers.get("x-alongside-hash") === want[u]));
}
{
  const changed = urls.find(u => u.endsWith("js/views/today.js")) || urls[5];
  const old = new Map(urls.map(u => [u, stamped(`old ${u}`, u === changed ? "0000000000000000" : want[u])]));
  const stores = { "alongside-v1": old };
  const fetched = await install({ stores });
  ok("2b. one file changed: only that file is fetched", fetched.length === 1 && fetched[0].url === changed, JSON.stringify(fetched.slice(0, 5)));
  const mine = stores[CACHE_NAME];
  ok("2b2. every other file is copied into the new cache", urls.every(u => mine.has(u)) && (await mine.get(urls.find(u => u !== changed)).text()).startsWith("old "));
  ok("2b3. the fetched one carries its new hash", mine.get(changed).headers.get("x-alongside-hash") === want[changed]);
}
{
  const noHeader = urls[3], wrong = urls[4];
  const old = new Map(urls.map(u => [u, stamped(`old ${u}`, u === noHeader ? null : u === wrong ? "ffffffffffffffff" : want[u])]));
  const fetched = await install({ stores: { "alongside-v1": old, "other-cache": new Map() } });
  ok("2c. a copy with no hash, or the wrong one, is fetched again (and only those)", fetched.map(f => f.url).sort().join() === [noHeader, wrong].sort().join(), JSON.stringify(fetched.map(f => f.url)));
}
{
  const stores = {};
  const fetched = await install({ stores, failUrl: urls[2] });
  ok("2d. one failed fetch does not stop the rest", fetched.length === urls.length && stores[CACHE_NAME].size === urls.length - 1);
}

console.log(`\nSW-HASHES: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
