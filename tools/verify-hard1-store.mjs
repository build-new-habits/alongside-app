/**
 * tools/verify-hard1-store.mjs
 * 21 Aug 2026 v1
 *
 * R1-a — store.js v55. The strategicGoal.review merge guard.
 *
 * SEPARATE FROM verify-hard1.mjs ON PURPOSE. That gate is pure and
 * imports nothing but the detection module. This one needs jsdom for
 * localStorage, and folding it in would have made the pure gate depend
 * on the jsdom path hardcoding that already costs this suite time.
 *
 * WHY THIS EXISTS.
 *
 * The strategicGoal merge is an IIFE that spreads saved.strategicGoal
 * over the defaults, so a corrupt saved `review` -- a string, null, an
 * object missing `outcomes` -- passes straight through and throws at the
 * first outcomes.push(). store.js v55 guards it explicitly, the same
 * treatment measurementsOptIn already gets.
 *
 * AND A NEAR-MISS WORTH RECORDING. The first version of this test wrote
 * to localStorage key `alongside_data`. The real key is `alongside_user`
 * (store.js:501). Every assertion passed -- against DEFAULTS, having
 * never loaded the corrupt data at all. It was caught only because one
 * case returned null where a valid string should have survived. A test
 * that constructs its own state must prove the state actually arrived,
 * which is why the first assertion below is a positive control.
 *
 * Run: node tools/verify-hard1-store.mjs
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Resolve jsdom and store.js RELATIVE TO THIS FILE, never by absolute
// path. Fourteen gates in this suite hardcode /home/claude/repo and go
// red on any other clone path -- and the first version of this gate did
// the same, which meant every reversal test of the merge guard passed
// while reading the PRISTINE copy in another directory. A gate that
// cannot see the file it guards is worse than no gate.
const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://localhost/" });
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;

const STORE_PATH = path.join(REPO, "js", "store.js");
const STORAGE_KEY = "alongside_user";

let failures = 0;
let checks = 0;

function ok(label, condition, detail = "") {
  checks++;
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label}${detail ? "  --  " + detail : ""}`);
  }
}

async function loadWith(savedState) {
  localStorage.clear();
  if (savedState !== undefined) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
  }
  const mod = await import(`${STORE_PATH}?bust=${Math.random()}`);
  const store = mod.store || mod.default;
  if (store.init) store.init();
  return store;
}

console.log("\n0. Positive control — the saved state must actually load");
{
  // If this fails, every assertion below is testing defaults and proves
  // nothing. This is the assertion that caught the wrong-key bug.
  const store = await loadWith({ name: "Control", strategicGoal: { targetDescription: "loaded" } });
  ok("a saved value reaches the store", store.get("strategicGoal.targetDescription") === "loaded",
     `got ${JSON.stringify(store.get("strategicGoal.targetDescription"))}`);
  ok("the storage key is the live one", store.STORAGE_KEY === STORAGE_KEY,
     `store says ${store.STORAGE_KEY}`);
}

console.log("\n1. Defaults");
{
  const store = await loadWith(undefined);
  const sg = store.get("strategicGoal");
  ok("targetSetAt defaults to null", sg.targetSetAt === null);
  ok("review.lastOfferedAt defaults to null", sg.review.lastOfferedAt === null);
  ok("review.outcomes defaults to an empty array",
     Array.isArray(sg.review.outcomes) && sg.review.outcomes.length === 0);
}

console.log("\n2. Corrupt review shapes are all survivable");
{
  const corrupt = [
    ["review is a string",        "wrecked"],
    ["review is null",            null],
    ["review is a number",        42],
    ["review is an array",        []],
    ["outcomes is a string",      { lastOfferedAt: null, outcomes: "nope" }],
    ["outcomes is missing",       { lastOfferedAt: "2026-08-01T00:00:00.000Z" }],
    ["lastOfferedAt is a number", { lastOfferedAt: 12345, outcomes: [] }],
    ["lastOfferedAt is an object", { lastOfferedAt: {}, outcomes: [] }]
  ];

  for (const [label, value] of corrupt) {
    const store = await loadWith({ strategicGoal: { review: value } });
    const r = store.get("strategicGoal.review");
    const shapeOk = r && typeof r === "object" && !Array.isArray(r)
      && Array.isArray(r.outcomes)
      && (r.lastOfferedAt === null || typeof r.lastOfferedAt === "string");
    let pushOk = true;
    try { r.outcomes.push({ at: "x" }); } catch { pushOk = false; }
    ok(`survives — ${label}`, shapeOk && pushOk, JSON.stringify(r));
  }
}

console.log("\n3. Valid saved values are preserved, not flattened");
{
  // The guard must not be so blunt it discards good data. This is the
  // case that exposed the wrong-key bug.
  const outcomes = [{ at: "2026-07-01T00:00:00.000Z", choice: "moved",
                      previousDate: "2026-08-01", newDate: "2026-10-01" }];
  const store = await loadWith({
    strategicGoal: { review: { lastOfferedAt: "2026-08-01T00:00:00.000Z", outcomes } }
  });
  const r = store.get("strategicGoal.review");
  ok("a valid lastOfferedAt survives", r.lastOfferedAt === "2026-08-01T00:00:00.000Z",
     JSON.stringify(r.lastOfferedAt));
  ok("existing outcomes survive intact", r.outcomes.length === 1 && r.outcomes[0].choice === "moved");

  // outcomes missing but lastOfferedAt valid: keep one, default the other.
  const partial = await loadWith({
    strategicGoal: { review: { lastOfferedAt: "2026-08-01T00:00:00.000Z" } }
  });
  const pr = partial.get("strategicGoal.review");
  ok("a half-written review keeps the good half and defaults the rest",
     pr.lastOfferedAt === "2026-08-01T00:00:00.000Z" && Array.isArray(pr.outcomes) && pr.outcomes.length === 0,
     JSON.stringify(pr));
}

console.log("\n4. targetSetAt");
{
  const store = await loadWith({ strategicGoal: { targetSetAt: "2026-07-15T00:00:00.000Z" } });
  ok("a saved targetSetAt survives the merge",
     store.get("strategicGoal.targetSetAt") === "2026-07-15T00:00:00.000Z");

  // TARGET-4's one-way migration must be untouched by v55.
  const migrated = await loadWith({ targetDate: "2026-09-20", targetDescription: "Ridge walk" });
  ok("TARGET-4 migration still runs", migrated.get("strategicGoal.targetDate") === "2026-09-20"
     && migrated.get("strategicGoal.targetDescription") === "Ridge walk");

  const noOverwrite = await loadWith({
    targetDate: "2026-12-25",
    strategicGoal: { targetDate: "2026-09-20" }
  });
  ok("TARGET-4 still refuses to overwrite a later answer",
     noOverwrite.get("strategicGoal.targetDate") === "2026-09-20");
}

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) {
  console.log(`verify-hard1-store: ${checks} checks, all green.`);
  process.exit(0);
} else {
  console.log(`verify-hard1-store: ${failures} of ${checks} checks RED.`);
  process.exit(1);
}
