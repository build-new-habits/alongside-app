/**
 * tools/verify-link.mjs
 * 22 Aug 2026 v2
 * CHOOSER-1. Known-failure list emptied -- goal-setup.js retired.
 *
 * 21 Aug 2026 v1
 *
 * LINK-1 — every module must actually load.
 *
 * WHY THIS EXISTS.
 *
 * js/views/onboarding/goal-setup.js statically imports
 * `{ programmeEngine }` from js/data/programmeEngine.js. That module
 * exports twenty named functions and no such symbol, so the import is a
 * LINK-TIME SyntaxError: the module never loads at all. Five live
 * buttons navigate to that route -- today.js:734, settings.js:2229 and
 * :2233, gym-programme.js:596 and :601 -- and it sits in app.js's
 * NAV_VIEWS.
 *
 * This is BIAS-3's fault class one level worse. BIAS-3 was a missing
 * facade method that threw at RUNTIME on the third line of a function.
 * This throws at LINK time, so nothing in the file runs, ever.
 *
 * NO EXISTING GATE COULD HAVE CAUGHT IT. 43 of 77 gates are source-text
 * only, and the source text here is impeccable -- a correctly spelled
 * import of a plausibly named symbol. The only way to find it is to
 * import the module and watch it fail.
 *
 * WHAT THIS GATE DOES.
 *
 * Imports every .js file under js/ and separates two outcomes:
 *
 *   LINK failure (SyntaxError)  -- the module cannot load. Always a real
 *                                  fault. The import graph is wrong.
 *   RUNTIME throw (anything else) -- may be a real fault, or may be a
 *                                  browser API jsdom lacks. Reported,
 *                                  not failed, with the caveat attached.
 *
 * THE KNOWN-FAILURE LIST IS EXACT, NOT A CEILING.
 *
 * The gate asserts the set of link failures EQUALS the list below. A new
 * break turns it red, and so does FIXING goal-setup.js without removing
 * it from the list. An allowlist that only catches additions rots into
 * permanent permission; this one has to be maintained in both
 * directions.
 *
 * Run: node tools/verify-link.mjs
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

// Resolved from this file, never hardcoded. Fourteen gates in this suite
// hardcode /home/claude/repo and will read a copy you are not editing.
const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");

/**
 * Modules known not to link, each with the reason and the task that will
 * close it. REMOVE AN ENTRY WHEN IT IS FIXED -- the gate goes red if a
 * listed module starts linking.
 */
const KNOWN_LINK_FAILURES = new Map([
  // Empty as of 22 Aug 2026. goal-setup.js was RETIRED (CHOOSER-1), not
  // repaired: it moved to Documents/Archive/ and the 'goal-setup' route
  // now resolves to views/programme-select.js.
  //
  // Keep this list EXACT. A new break turns the gate red, and so does
  // fixing a listed module without delisting it.
]);

/* ─────────────────────────────────────────────────────────────────── */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://localhost/" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;

// jsdom lacks matchMedia. Stubbed so a missing browser API is not
// mistaken for a broken module -- without this, onboarding/thread.js
// reports a fault it does not have.
if (typeof dom.window.matchMedia !== "function") {
  dom.window.matchMedia = (q) => ({
    matches: false, media: q,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}
  });
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith(".js")) out.push(p);
  }
  return out;
}

const files = walk(path.join(REPO, "js")).sort();
const linkFailures = new Map();
const runtimeThrows = [];

for (const file of files) {
  const rel = path.relative(REPO, file).split(path.sep).join("/");
  try {
    await import(file);
  } catch (err) {
    const first = String(err.message).split("\n")[0];
    if (err instanceof SyntaxError) linkFailures.set(rel, first);
    else runtimeThrows.push([rel, `${err.constructor.name}: ${first}`]);
  }
}

let failures = 0;
let checks = 0;

function ok(label, condition, detail = "") {
  checks++;
  if (condition) console.log(`  PASS  ${label}`);
  else { failures++; console.log(`  FAIL  ${label}${detail ? "  --  " + detail : ""}`); }
}

console.log(`\nScanned ${files.length} modules under js/\n`);

// A positive control. If the walk found nothing, every assertion below
// would pass vacuously -- the failure mode that let verify-hard1-store
// go green against defaults it had never loaded.
console.log("0. Positive control");
ok("the sweep found a realistic number of modules", files.length > 50, `found ${files.length}`);
ok("store.js was among them", files.some(f => f.endsWith("/js/store.js")));

console.log("\n1. Link failures match the known list exactly");
{
  const found = [...linkFailures.keys()].sort();
  const known = [...KNOWN_LINK_FAILURES.keys()].sort();

  const unexpected = found.filter(f => !KNOWN_LINK_FAILURES.has(f));
  const fixed      = known.filter(k => !linkFailures.has(k));

  ok("no NEW module fails to link", unexpected.length === 0,
     unexpected.map(f => `${f} -> ${linkFailures.get(f)}`).join(" | "));
  ok("no listed module has been fixed without updating this list", fixed.length === 0,
     fixed.join(", ") + " now links -- remove from KNOWN_LINK_FAILURES");

  for (const f of found) console.log(`        known-broken: ${f}`);
}

console.log("\n2. Runtime throws on import (reported, not failed)");
{
  if (runtimeThrows.length === 0) {
    console.log("        none");
  } else {
    for (const [f, m] of runtimeThrows) console.log(`        ${f}  --  ${m}`);
    console.log("        NOTE: may be a browser API jsdom lacks rather than a fault.");
  }
  ok("runtime throws are reported", true);
}

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) {
  console.log(`verify-link: ${checks} checks, all green. ${linkFailures.size} known-broken module(s).`);
  process.exit(0);
} else {
  console.log(`verify-link: ${failures} of ${checks} checks RED.`);
  process.exit(1);
}
