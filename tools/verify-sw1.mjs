/**
 * tools/verify-sw1.mjs
 * 12 Aug 2026 v1
 *
 * SW-1. The current cache is the only one that may answer a fetch.
 *
 * The fetch handler used caches.match(request) -- a GLOBAL lookup across
 * every cache this origin holds, oldest first. An old alongside-v2xx
 * cache could answer for settings.js while the worker was v304.
 *
 * Graeme, on a fresh browser fetch: "It's still serving the old look but
 * it's v304." Both statements were true. sw.js was v304; settings.js came
 * from a cache the activate handler had not deleted yet.
 *
 * This is the bug behind every "close it fully and reopen, maybe twice"
 * instruction given all day. That advice was never reliable -- whether a
 * fix appeared depended on which cache answered first.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const sw = fs.readFileSync("sw.js", "utf8");
const code = sw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/[^\n]*$/gm, "");

console.log("\nTEST 1 - no global cache lookups");
check("fetch handler is scoped to CACHE_NAME", () => {
  ok(/caches\.open\(CACHE_NAME\)\.then\(cache =>/.test(code),
     "must open the current cache explicitly");
  ok(/cache\.match\(event\.request\)/.test(code), "must match within it");
});
check("caches.match() appears nowhere", () => {
  const hits = (code.match(/caches\.match\(/g) || []).length;
  ok(hits === 0,
     `${hits} global lookup(s) remain - a global match searches EVERY cache ` +
     `oldest-first, so a version from twelve builds ago can answer while ` +
     `sw.js honestly reports the newest`);
});
check("the offline fallback is also scoped", () => {
  ok(/cache\.match\("\/alongside-app\/index\.html"\)/.test(code),
     "an offline navigation must get THIS version's shell, not any older one");
});

console.log("\nTEST 2 - old caches are still cleaned up");
check("activate deletes everything but the current cache", () => {
  ok(/keys\s*\n?\s*\.filter\(key => key !== CACHE_NAME\)/.test(code),
     "without this, old caches accumulate forever");
  ok(/caches\.delete\(key\)/.test(code), "no deletion");
});
check("clients.claim() still runs", () => {
  ok(/self\.clients\.claim\(\)/.test(code),
     "without it the new worker waits for every tab to close");
});

console.log("\nTEST 3 - the version reported is this worker's own");
check("GET_VERSION answers from CACHE_NAME", () => {
  ok(/CACHE_NAME\.replace\("alongside-", ""\)/.test(code),
     "must report its own constant, not scan caches - scanning is what made " +
     "About report a build the page was not running");
});
check("cache name and file header agree", () => {
  const cacheV  = sw.match(/const CACHE_NAME = "alongside-v(\d+)"/);
  const headerV = sw.match(/\* 12 Aug 2026 v(\d+)\n/);
  ok(cacheV && headerV, "could not read both versions");
  ok(cacheV[1] === headerV[1],
     `cache says v${cacheV[1]}, header says v${headerV[1]} - the header is ` +
     `the change note somebody reads to know what shipped`);
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
