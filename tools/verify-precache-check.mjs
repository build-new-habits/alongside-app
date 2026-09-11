/**
 * tools/verify-precache-check.mjs
 * 12 Aug 2026 v1
 *
 * INF-CACHE gate. Walks the filesystem and compares it to SHELL_URLS in
 * both directions, because both directions failed silently:
 *
 *   MISSING  25 of 98 JS modules were absent, including the whole
 *            onboarding flow. Online they load from network and nobody
 *            notices; offline the dynamic import fails.
 *   DEAD     3 entries pointed at files that do not exist, two of them
 *            hyphen/underscore typos that made real exercise categories
 *            look cached when they never were.
 *
 * Install uses Promise.allSettled(), which is right for resilience and
 * is exactly why neither was ever noticed. A gate is the only way this
 * stays true.
 */
import fs from "node:fs";
import path from "node:path";

// GATE-PATH, 08 Sep 2026. Paths resolved from import.meta.url, not the
// working directory.
//
// 72 of 139 gates read files by a path relative to process.cwd(), so
// they were green from the repo root and read NOTHING from anywhere
// else. Not a live fault -- every session so far has run them from the
// root -- but an expensive trap: a session running the suite by full
// path from elsewhere sees most of it red and reasonably concludes the
// app is broken.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);


const PREFIX = "/alongside-app/";
const sw = fs.readFileSync(_gatePath("sw.js"), "utf8");

// Only SHELL_URLS itself, not comments elsewhere in the file.
const block = sw.slice(sw.indexOf("const SHELL_URLS"), sw.indexOf("];", sw.indexOf("const SHELL_URLS")));
const urls = new Set(
  [...block.replace(/\/\/[^\n]*/g, "").matchAll(new RegExp(`"${PREFIX}([^"]+)"`, "g"))].map(m => m[1])
);

const walk = (dir, exts) => {
  const out = [];
  for (const e of fs.readdirSync(_gatePath(dir), { withFileTypes: true })) {
    const p = path.join(dir, e.name).replace(/\\/g, "/");
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (exts.some(x => e.name.endsWith(x))) out.push(p);
  }
  return out;
};

const onDisk = [...walk("js", [".js"]), ...walk("css", [".css"])];

const missing = onDisk.filter(f => !urls.has(f));
const dead    = [...urls].filter(u => !u.startsWith("http") && !fs.existsSync(_gatePath(u)) && u !== "" && u !== "index.html");

let fails = 0;
console.log(`\nSHELL_URLS: ${urls.size} entries · on disk: ${onDisk.length} js/css files\n`);

if (missing.length) {
  fails++;
  console.log(`  FAIL  ${missing.length} file(s) on disk but NOT precached — offline launch would fail:`);
  missing.forEach(m => console.log("          " + m));
} else console.log("  PASS  every js/css file on disk is precached");

if (dead.length) {
  fails++;
  console.log(`  FAIL  ${dead.length} precached path(s) do not exist — silently 404 on every install:`);
  dead.forEach(d => console.log("          " + d));
} else console.log("  PASS  no precached path points at a missing file");

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
