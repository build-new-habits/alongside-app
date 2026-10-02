/**
 * tools/verify-suite-pin.mjs
 * 02 Oct 2026 v1
 *
 * W4-0 SUITE-TRUE. On 01 Oct the suite was reported "258 green", but no
 * single jsdom version ran all 258: on 28 and 29 five onboarding checks
 * failed (two screens left in the page, one id twice; fixed with
 * tools/one-screen.mjs), and on 24-26 two download checks failed for want
 * of Blob.text(). Nothing pinned the version, so "green" depended on
 * whichever jsdom the machine happened to have.
 *
 *   1. package.json pins jsdom to one exact version (no ^ or ~).
 *   2. package-lock.json agrees.
 *   3. The jsdom a check actually loads (resolved from tools/, as every
 *      check resolves it) is that version. Red if npm ci was skipped and
 *      some other copy up the tree is used instead.
 *   4. The cold start blueprint names the same version.
 */
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";

const root = new URL("../", import.meta.url);
let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const read = p => { const u = new URL(p, root); return existsSync(u) ? readFileSync(u, "utf8") : null; };

const pkgText = read("package.json");
const pkg = pkgText ? JSON.parse(pkgText) : {};
const pin = pkg.devDependencies?.jsdom || pkg.dependencies?.jsdom || null;
ok("1. package.json pins jsdom to one exact version", !!pin && /^\d+\.\d+\.\d+$/.test(pin), `pin: ${pin}`);

const lockText = read("package-lock.json");
const lockV = lockText ? JSON.parse(lockText).packages?.["node_modules/jsdom"]?.version : null;
ok("2. package-lock.json agrees", !!pin && lockV === pin, `lock: ${lockV}`);

let usedV = null, usedAt = null;
try {
  const req = createRequire(new URL("tools/x.mjs", root));
  usedAt = req.resolve("jsdom/package.json");
  usedV = JSON.parse(readFileSync(usedAt, "utf8")).version;
} catch { /* not installed */ }
ok("3. the jsdom the checks load is the pinned one (run npm ci)", !!pin && usedV === pin, `loaded ${usedV} from ${usedAt}`);

const bp = read("docs/alongside_cold_start_blueprint_20aug2026_v1.md") || "";
ok("4. the cold start blueprint names the pinned version", !!pin && bp.includes(`jsdom ${pin}`));

console.log(`\nSUITE-PIN: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
