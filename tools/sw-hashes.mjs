/**
 * tools/sw-hashes.mjs
 * 05 Oct 2026 v1
 *
 * SW-INCREMENTAL. Writes SHELL_HASHES in sw.js: each shell file's content
 * hash (sha-256, first 16 hex). The worker copies a file from the cache a
 * phone already has when its hash is unchanged, so an update downloads only
 * what changed. Run it as the last step before committing sw.js:
 *
 *   node tools/sw-hashes.mjs          write the hashes into sw.js
 *   node tools/sw-hashes.mjs --check  exit 1 if any hash is missing or stale
 *
 * verify-sw-hashes runs the check in the suite: a stale hash would keep an
 * old file on phones, so it must never ship.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = new URL("../", import.meta.url);
const swPath = new URL("sw.js", ROOT);

export function shellUrls(sw) {
  const block = sw.slice(sw.indexOf("const SHELL_URLS = ["), sw.indexOf("];", sw.indexOf("const SHELL_URLS = [")));
  return [...block.matchAll(/"(\.\/[^"]*)"/g)].map(m => m[1]);
}
export function hashOf(url) {
  const file = url === "./" ? "index.html" : url.replace(/^\.\//, "");
  return createHash("sha256").update(readFileSync(new URL(file, ROOT))).digest("hex").slice(0, 16);
}
export function expected(sw) {
  return Object.fromEntries(shellUrls(sw).map(u => [u, hashOf(u)]));
}
export function written(sw) {
  const m = sw.match(/\/\/ SHELL_HASHES:BEGIN\n([\s\S]*?)\/\/ SHELL_HASHES:END/);
  if (!m) return null;
  const body = m[1].replace(/^const SHELL_HASHES = /, "").replace(/;\s*$/, "");
  try { return JSON.parse(body); } catch { return null; }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sw = readFileSync(swPath, "utf8");
  const want = expected(sw);
  if (process.argv.includes("--check")) {
    const have = written(sw) || {};
    const bad = Object.keys(want).filter(u => have[u] !== want[u]);
    console.log(bad.length ? `STALE or missing: ${bad.join(", ")}` : `OK: ${Object.keys(want).length} hashes match`);
    process.exit(bad.length ? 1 : 0);
  }
  const block = `// SHELL_HASHES:BEGIN\nconst SHELL_HASHES = ${JSON.stringify(want, null, 2)};\n// SHELL_HASHES:END`;
  writeFileSync(swPath, sw.replace(/\/\/ SHELL_HASHES:BEGIN\n[\s\S]*?\/\/ SHELL_HASHES:END/, block));
  console.log(`Wrote ${Object.keys(want).length} hashes into sw.js`);
}
