/**
 * tools/verify-planpicker.mjs
 * 06 Sep 2026 v1
 *
 * PLAN-PICKER-TIER. The twelve-week programme is the paid product.
 *
 * WHAT WAS WRONG, measured. js/views/onboarding/plan-select.js had no
 * tier check anywhere in the file, and it was LIVE: equipment.js's
 * standalone finish button routed to onboarding/frequency, which routed
 * to onboarding/plan-select. That is the path Graeme met on 06 Sep --
 * asked to commit to a twelve-week programme and a weekly session target
 * before he had moved once.
 *
 * Worse, programmeEngine.js (49 activeProgramme references) and
 * workoutGenerator.js read the programme with no tier check either, so a
 * free user got chapter progression, week advancement and phase bias on
 * their sessions. "Free is today, the Plan is the arc" was not true.
 *
 * Same class as DATA-1b: one system gated carefully -- ARC-DOOR closed a
 * leak in `arc` the same week -- while its twin sat wide open beside it.
 *
 * GATED AT THE READ, not at the 49 references. plannedFocusToday() and
 * getPhaseBias() are the only two that reach session selection. One
 * place to check beats forty-nine places to remember, and an existing
 * free device stops being driven by its programme immediately, with no
 * migration.
 */

import { createRequire as __cr } from "node:module";
import fs from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store }      = await import(B + "store.js");
const { isPremium }  = await import(B + "auth.js");
const PE             = await import(B + "data/programmeEngine.js");
const { planOptionsFor } = await import(B + "data/plan-options.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const today = () =>
  ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];

function seed(tier) {
  localStorage.clear();
  store.init();
  store.set("tier", tier);
  // A programme that WOULD drive selection if it were read. Without this
  // the free assertions below would pass on an empty store and prove
  // nothing about gating.
  store.set("activeProgramme", {
    programmeId: "beginner-fitness",
    currentWeek: 3,
    sessionSequence: [{ day: today(), type: "cardio", completed: false }]
  });
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the fixture would drive selection if it were read");

seed("personal");
ok("0a. the Plan fixture is on Plan", isPremium() === true);
ok("0b. and its programme genuinely produces a focus",
   PE.plannedFocusToday() === "cardio",
   `plannedFocusToday() returned ${JSON.stringify(PE.plannedFocusToday())} - if this ` +
   `is null the free assertions below pass against a fixture that was never live`);

seed("free");
ok("0c. the free fixture is on free", isPremium() === false);

// ── 1. THE ARC DOES NOT DRIVE FREE SESSIONS ─────────────────────────────
console.log("\nTEST 1 - free is today, the Plan is the arc");

seed("free");
ok("1a. plannedFocusToday returns nothing on free",
   PE.plannedFocusToday() === null,
   "a free user is having their sessions shaped by a twelve-week programme");

const freeBias = PE.getPhaseBias();
seed("personal");
const planBias = PE.getPhaseBias();

ok("1b. getPhaseBias is neutral on free",
   freeBias.intensityBias === "moderate" &&
   JSON.stringify(freeBias.focusBias) === JSON.stringify(["strength", "mobility"]),
   `free got ${JSON.stringify(freeBias)}`);

// The two tiers must actually DIFFER, or 1b passes because the programme
// happens to produce the neutral shape anyway and nothing is gated.
ok("1c. and Plan's is genuinely different, so 1b is not a coincidence",
   JSON.stringify(freeBias) !== JSON.stringify(planBias),
   `both tiers returned ${JSON.stringify(freeBias)} - the gate may be doing nothing`);

// ── 2. THE PICKER LEFT ONBOARDING ───────────────────────────────────────
console.log("\nTEST 2 - nobody is asked to commit before they have moved");

const equip = fs.readFileSync("js/views/onboarding/equipment.js", "utf8");
const liveNav = equip.split("\n")
  .filter(l => !/^\s*(\*|\/\/)/.test(l))
  .filter(l => /navigate\(["']onboarding\/frequency["']\)/.test(l));
ok("2a. equipment no longer routes to the frequency step", liveNav.length === 0,
   "the standalone finish button still leads to frequency -> plan-select, which " +
   "is the path Graeme met");

const freq = fs.readFileSync("js/views/onboarding/frequency.js", "utf8");
const liveToPicker = freq.split("\n")
  .filter(l => !/^\s*(\*|\/\/)/.test(l))
  .filter(l => /navigate\(["']onboarding\/plan-select["']\)/.test(l));
ok("2b. and frequency no longer routes to the picker", liveToPicker.length === 0);

// Retired, not deleted. The file is the record of what onboarding asked.
ok("2c. plan-select.js still exists, retired not deleted",
   fs.existsSync("js/views/onboarding/plan-select.js"),
   "deleting it deletes the record of what new users were asked to commit to");

// ── 3. THE PICKER IS REACHABLE WHERE IT NOW BELONGS ─────────────────────
console.log("\nTEST 3 - Guided class is the way in");

const todaySrc = fs.readFileSync("js/views/today.js", "utf8");
const guidedBlock = todaySrc.slice(todaySrc.indexOf("id: 'guided', title: 'Guided class'"));
ok("3a. Guided class's empty state routes to the chooser",
   /data-route="goal-setup"/.test(guidedBlock.slice(0, 3000)),
   "the empty state points somewhere else, so the picker has no home");

ok("3b. and goal-setup is programme-select, not the retired picker",
   /'goal-setup':\s*\{\s*path:\s*'\.\/views\/programme-select\.js'/
     .test(fs.readFileSync("js/router.js", "utf8")),
   "goal-setup points at plan-select.js, which writes six activeProgramme " +
   "fields directly instead of calling startChapter()");

// ── 4. COMMIT-COPY ──────────────────────────────────────────────────────
console.log("\nTEST 4 - nothing on the picker is streak-shaped or pushes");

seed("personal");
store.set("strategicGoal.weeklySessionTarget", 3);
const opts = planOptionsFor ? planOptionsFor() : null;
// COMMENTS STRIPPED. The first version of this check greped raw source
// and went red on its own explanatory comments -- the ones recording
// what the copy USED to say. A gate that cannot tell a string from a
// note about a string will either be silenced or will silence the
// history, and both are worse than the fault it exists to catch.
const optSrc = fs.readFileSync("js/data/plan-options.js", "utf8")
  .split("\n").filter(l => !/^\s*(\*|\/\/|\/\*)/.test(l)).join("\n");

ok("4a. no option is framed as a commitment", !/Full commitment/.test(optSrc),
   `"commitment" frames a weekly number as a promise you can break, which is ` +
   `streak-shaped on a product with no streaks`);

ok("4b. and nothing tells anybody to push", !/ready to push/i.test(optSrc),
   "the coach voice is Nurturing only, permanently, and this product does not push");

ok("4c. the weekly note is an intention, not a quota",
   /aiming for/.test(optSrc),
   `"3 sessions a week" reads as a target - a number you can fall behind on`);

ok("4d. and the recommendation survives, quietly",
   /Suggested for you/.test(optSrc) && !/Highly Recommended/.test(optSrc),
   "either the recommendation was removed - it reduces decision load and this " +
   "audience needs it - or the shouty version is still there");

console.log(fails === 0
  ? "\nPLAN-PICKER-TIER: all assertions pass\n"
  : `\nPLAN-PICKER-TIER: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
