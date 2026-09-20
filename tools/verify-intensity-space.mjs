/**
 * tools/verify-intensity-space.mjs
 * 16 Sep 2026 v1
 *
 * INTENSITY-SPACE. The energy slider has to change the session.
 *
 * 🔴 TWO VOCABULARIES MET IN getWorkoutParams() AND ONE WAS DISCARDED.
 *
 * `intensity` arrives from checkinData.resolveIntensity() as
 * "low" | "moderate" | "high" -- the space Schema.md documents and
 * store.todayIntensity holds. intensityParams is keyed
 * "recovery" | "gentle" | "moderate" | "challenging".
 *
 * Only "moderate" existed in both. "low" and "high" matched nothing, the
 * `|| intensityParams.moderate` fallback fired, and A CHECK-IN SAYING
 * EXHAUSTED AND ONE SAYING FLYING PRODUCED THE IDENTICAL SESSION.
 *
 * ⚫ It was flagged in coach-proposal.js v9 as "NOT INVESTIGATED" and sat
 * there. A fallback that silently absorbs two thirds of a documented
 * value space is the most expensive kind of default: everything keeps
 * working, and nothing responds.
 *
 * So this gate DRIVES the function with each value and asserts the
 * results DIFFER. A source check would have passed on the broken code --
 * the table was well formed, the fallback was deliberate, and every
 * individual line was correct.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const wg = await import(B + "data/workoutGenerator.js");
const { getSuggestedIntensity, resolveIntensity } = await import(B + "data/checkin.js");

const gen = wg.workoutGenerator || wg.default;
const NONE = { level: "none" };
const params = i => gen.getWorkoutParams(i, NONE, null);

store.init();
console.log("\nINTENSITY-SPACE\n");

console.log("TEST 0 — FIXTURE REACH: the function answers at all");
const mid = params("moderate");
ok("0.1 a known value returns params", !!mid && typeof mid.exerciseCount === "number");
console.log("       low / moderate / high -> " +
  ["low", "moderate", "high"].map(i => {
    const p = params(i); return `${p.exerciseCount}@${p.maxEnergy}`;
  }).join("  "));

console.log("\nTEST 1 — the documented space produces three different sessions");
{
  const lo = params("low"), md = params("moderate"), hi = params("high");

  ok("1.1 low is lighter than moderate",
     lo.exerciseCount < md.exerciseCount && lo.maxEnergy < md.maxEnergy,
     "low fell through to the moderate fallback, so an exhausted check-in " +
     "produced a standard session");

  ok("1.2 high is harder than moderate",
     hi.exerciseCount > md.exerciseCount && hi.maxEnergy > md.maxEnergy,
     "so did high -- the slider was decorative in both directions");

  ok("1.3 all three differ", new Set([lo.exerciseCount, md.exerciseCount, hi.exerciseCount]).size === 3);

  ok("1.4 REVERSAL: an unknown value STILL falls back to moderate",
     JSON.stringify(params("not-a-real-intensity")) === JSON.stringify(md),
     "the fallback is correct behaviour for genuinely unknown input; what was " +
     "wrong was two thirds of the documented space landing there");
}

console.log("\nTEST 2 — both vocabularies are accepted");
{
  ok("2.1 the programme-phase space still works", (() => {
    const g = params("gentle"), c = params("challenging");
    return g.exerciseCount < params("moderate").exerciseCount &&
           c.exerciseCount > params("moderate").exerciseCount;
  })(), "intensityBias uses gentle/moderate/challenging per the JSDoc; renaming " +
        "the keys would have broken that instead");

  ok("2.2 low and gentle agree, so the two names mean one thing",
     JSON.stringify(params("low")) === JSON.stringify(params("gentle")));

  ok("2.3 high and challenging agree",
     JSON.stringify(params("high")) === JSON.stringify(params("challenging")));
}

console.log("\nTEST 3 — recovery stays a coach decision");
{
  ok("3.1 low does NOT map to recovery", (() => {
    return JSON.stringify(params("low")) !== JSON.stringify(params("recovery"));
  })(), "recovery is burnout or a programme phase saying so. Somebody having a " +
        "flat morning gets a lighter session, not a recovery protocol");

  ok("3.2 but burnout still overrides everything", (() => {
    const p = gen.getWorkoutParams("high", { level: "high" }, null);
    return p.focusOnRecovery === true && p.exerciseCount === 4;
  })(), "the burnout override is the highest-priority branch and must not have " +
        "been disturbed");
}

console.log("\nTEST 4 — the chain end to end, from a check-in");
{
  // Not a source read: the real path is check-in energy -> intensity ->
  // params, and that is what was broken in the middle.
  const flat   = resolveIntensity(getSuggestedIntensity({ energy: 2 }), null);
  const flying = resolveIntensity(getSuggestedIntensity({ energy: 9 }), null);
  console.log("       energy 2 -> " + flat + ", energy 9 -> " + flying);

  ok("4.1 a flat check-in and a flying one resolve differently", flat !== flying);
  ok("4.2 and produce different sessions",
     params(flat).exerciseCount !== params(flying).exerciseCount,
     "this is the assertion that would have caught the original bug, and the " +
     "only one that tests what the person experiences");
}

console.log("\nTEST 5 — the stale flag is gone");
ok("5.1 coach-proposal.js no longer carries the uninvestigated note",
   !/NOT INVESTIGATED, FLAGGING FOR WHOEVER NEXT TOUCHES/
     .test(fs.readFileSync(new URL("../js/views/coach-proposal.js", import.meta.url), "utf8")),
   "a flag left standing after the thing is fixed sends the next person " +
   "looking for a bug that is not there");

console.log("");
if (fail) { console.log("INTENSITY-SPACE: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("INTENSITY-SPACE: all " + pass + " assertions pass\n");
