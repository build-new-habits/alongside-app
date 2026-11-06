/**
 * tools/verify-p28-audio-cache.mjs
 * 06 Nov 2026 v1
 *
 * P-28 EMPATHY-THREAD, S6 CLOSE. The coach's recordings in the service
 * worker (build blueprint: "Audio files are not precached. They are fetched
 * when a part or session is first opened, then kept in a separate cache. A
 * missing file is never an error."). Runs the real sw.js in a sandbox.
 *
 *   0  Positive control: sw.js runs and registers its handlers.
 *   1  Never precached: no audio/ file in the shell list or the install.
 *   2  The first play fetches the whole file once and keeps it in its own
 *      cache (alongside-audio), not the app's.
 *   3  After that it is answered from that cache, offline too.
 *   4  A media element's byte range is answered with 206 and the right
 *      bytes (Safari plays nothing otherwise); a range past the end is 416.
 *   5  A recording not there (404, or offline the first time) is passed on
 *      and kept nowhere: never an error, never a cached miss.
 *   6  An update deletes the old app caches and keeps the recordings.
 *   7  Everything else still answers from the app's own cache.
 *
 * Red on alongside-v709 (recordings go into the app cache, are deleted on
 * every update, and a range gets the whole file).
 */
import { readFileSync } from "node:fs";
import vm from "node:vm";

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 300)}`); }
};

const sw = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const CACHE_NAME = (sw.match(/const CACHE_NAME = "([^"]+)"/) || [])[1];
const ORIGIN = "https://x";
const BYTES = new Uint8Array(Array.from({ length: 100 }, (_, i) => i));

function makeCaches(stores) {
  const open = name => {
    stores[name] ||= new Map();
    const m = stores[name];
    return Promise.resolve({
      put: async (url, res) => { m.set(String(url.url || url), res); },
      match: async url => { const r = m.get(String(url.url || url)); return r ? r.clone() : undefined; },
      keys: async () => [...m.keys()],
    });
  };
  return { open, keys: async () => Object.keys(stores), delete: async n => delete stores[n], match: async () => undefined };
}
function load({ stores, net }) {
  const handlers = {}, fetched = [];
  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    caches: makeCaches(stores),
    fetch: async req => { const u = String(req.url || req); fetched.push(u); return net(u); },
    Request: function (u, o = {}) { this.url = u; this.cache = o.cache; },
    Response, Headers, URL, Promise, setTimeout, clearTimeout,
  };
  sandbox.self = {
    addEventListener: (t, fn) => { (handlers[t] ||= []).push(fn); },
    skipWaiting: async () => {}, clients: { claim: async () => {}, matchAll: async () => [] },
    registration: { scope: ORIGIN + "/" }, location: { origin: ORIGIN },
  };
  vm.createContext(sandbox);
  vm.runInContext(sw, sandbox);
  async function get(path, { range = null, mode = "cors" } = {}) {
    let p = null;
    const req = { url: ORIGIN + path, method: "GET", mode, headers: new Headers(range ? { range } : {}) };
    for (const fn of handlers.fetch || []) fn({ request: req, respondWith: x => { p = x; } });
    return p ? await p : "not answered";
  }
  async function activate() { const pend = []; for (const fn of handlers.activate || []) fn({ waitUntil: x => pend.push(x) }); await Promise.all(pend); }
  return { handlers, fetched, get, activate };
}
const online = u => /\/audio\/there\.mp3$/.test(u)
  ? new Response(BYTES, { status: 200, headers: { "Content-Type": "audio/mpeg" } })
  : /\/audio\//.test(u) ? new Response("nope", { status: 404 }) : new Response("shell " + u, { status: 200 });
const offline = () => { throw new Error("offline"); };

console.log("\nTEST 0 - positive control");
{
  const w = load({ stores: {}, net: online });
  ok("0a. sw.js runs and has its fetch and activate handlers", !!w.handlers.fetch?.length && !!w.handlers.activate?.length && !!CACHE_NAME);
}

console.log("\nTEST 1 - never precached");
{
  const shell = sw.slice(sw.indexOf("const SHELL_URLS = ["), sw.indexOf("];", sw.indexOf("const SHELL_URLS = [")));
  ok("1a. no recording in the shell list", !/audio\//.test(shell) && !/\.mp3/.test(shell));
}

console.log("\nTEST 2 - the first play");
const stores = {};
{
  const w = load({ stores, net: online });
  const r = await w.get("/audio/there.mp3");
  ok("2a. it plays: the whole file", r.status === 200 && (await r.arrayBuffer()).byteLength === 100);
  ok("2b. kept in its own cache, not the app's", stores["alongside-audio"]?.has(ORIGIN + "/audio/there.mp3") && !stores[CACHE_NAME]?.has(ORIGIN + "/audio/there.mp3"));
  ok("2c. fetched once, whole", w.fetched.filter(u => u.includes("there.mp3")).length === 1);
}

console.log("\nTEST 3 - after that, from the phone");
{
  const w = load({ stores, net: offline });
  const r = await w.get("/audio/there.mp3");
  ok("3a. offline, it still plays", r.status === 200 && (await r.arrayBuffer()).byteLength === 100 && w.fetched.length === 0);
}

console.log("\nTEST 4 - byte ranges");
{
  const w = load({ stores, net: offline });
  const r = await w.get("/audio/there.mp3", { range: "bytes=10-19" });
  const b = new Uint8Array(await r.arrayBuffer());
  ok("4a. 206 with the bytes asked for", r.status === 206 && b.length === 10 && b[0] === 10 && b[9] === 19 && r.headers.get("Content-Range") === "bytes 10-19/100", `${r.status} ${r.headers.get("Content-Range")}`);
  const o = await w.get("/audio/there.mp3", { range: "bytes=90-" });
  ok("4b. an open range runs to the end", o.status === 206 && (await o.arrayBuffer()).byteLength === 10 && o.headers.get("Content-Range") === "bytes 90-99/100");
  const z = await w.get("/audio/there.mp3", { range: "bytes=0-1" });
  ok("4c. Safari's first probe (bytes=0-1) gets two bytes", z.status === 206 && (await z.arrayBuffer()).byteLength === 2);
  const x = await w.get("/audio/there.mp3", { range: "bytes=200-" });
  ok("4d. past the end: 416", x.status === 416);
}

console.log("\nTEST 5 - not there yet");
{
  const s2 = {};
  const w = load({ stores: s2, net: online });
  const r = await w.get("/audio/missing.mp3");
  ok("5a. a missing recording is passed on as missing", r.status === 404);
  ok("5b. and kept nowhere", !s2["alongside-audio"]?.size && !s2[CACHE_NAME]?.has(ORIGIN + "/audio/missing.mp3"));
  const w2 = load({ stores: s2, net: offline });
  let r2; try { r2 = await w2.get("/audio/there.mp3"); } catch { r2 = null; }
  ok("5c. offline the first time: missing, not an error", r2 && r2.status === 404);
}

console.log("\nTEST 6 - an update");
{
  stores["alongside-v1"] = new Map([["x", new Response("old")]]);
  const w = load({ stores, net: online });
  await w.activate();
  ok("6a. the old app cache is deleted", !stores["alongside-v1"]);
  ok("6b. the recordings are kept", stores["alongside-audio"]?.has(ORIGIN + "/audio/there.mp3"));
}

console.log("\nTEST 7 - everything else as before");
{
  const s3 = {};
  const w = load({ stores: s3, net: online });
  const r = await w.get("/js/app.js");
  ok("7a. the app's files are answered as before (through the app's own handler)", r.status === 200 && (await r.text()).startsWith("shell "));
  ok("7b. and nothing of theirs goes to the recordings' cache", !s3["alongside-audio"]?.size);
}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
