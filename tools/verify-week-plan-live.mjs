/**
 * tools/verify-week-plan-live.mjs
 * 16 Sep 2026 v1
 *
 * WEEK-PLAN-LIVE. Work list item 2c.
 *
 * 🔴 A planned CARDIO or MOBILITY day was honoured. A planned CORE or
 * UPPER day got FULL BODY. plannedFocusToday() turned every other type
 * into "strength", which is not a session type, so the chooser fell to
 * "programme-default". That is the fault PLAN-1 fixed on 12 Aug --
 * "somebody could declare Tuesday as core work and be offered whatever"
 * -- back again, because PLAN-1's gate (verify-plan1) tested it through
 * workoutGenerator.js, which nothing calls.
 *
 * ⚫ DRIVES chooseSessionType(), the function coach-proposal calls to
 * decide what to build, and asserts that call is live.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.org/" });
globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { chooseSessionType } = await import(B + "data/session-choice.js");
const { SESSION_TYPES } = await import(B + "session-builder.js");

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const today = DAYS[new Date().getDay()];
const other = DAYS[(new Date().getDay() + 3) % 7];

function plan(type, day = today, chosen = true) {
  localStorage.clear(); store.init();
  store.set("tier", "personal");
  store.set("activeProgramme", { ...(store.get("activeProgramme") || {}),
    sessionSequence: [{ day, type, chosen, completed: false }] });
}

store.init();
console.log("\nWEEK-PLAN-LIVE\n");

console.log("TEST 0 — FIXTURE REACH");
ok("0.1 the proposal calls chooseSessionType, so this is the live path",
   /chooseSessionType\(\)/.test(fs.readFileSync(new URL("../js/views/coach-proposal.js", import.meta.url), "utf8")));
plan("cardio");
ok("0.2 a planned day is seen at all", chooseSessionType().inputs.plannedFocus === "cardio",
   "if nothing is seen, every assertion below is vacuous");

// ⚫ The first version of this gate asserted EVERY planned type is
// honoured. That contradicted a recorded decision -- PLAN-1: "a wrong
// guess costs a reordered list, not a wrong session" -- and verify-plan1
// went red. The distinction that was missing is WHO decided. A person's
// choice is honoured; the app's guess stays coarse.
console.log("\nTEST 1 — a type the PERSON chose is what they get");
// "gym" says WHERE, not what; it is not a planned focus.
const TYPES = SESSION_TYPES.map(t => t.id).filter(id => id !== "gym");
for (const t of TYPES) {
  plan(t);
  const c = chooseSessionType();
  ok(`1.${TYPES.indexOf(t) + 1} planned ${t} -> ${t}`, c.sessionType === t,
     `got ${c.sessionType} (reason: ${c.reason}). A declared ${t} day must be a ${t} session`);
}

console.log("\nTEST 1b — a type the APP guessed stays coarse, as PLAN-1 decided");
plan("core", today, false);
ok("1b.1 a guessed core day is NOT forced to core",
   chooseSessionType().reason !== "programme" || chooseSessionType().sessionType !== "core",
   "PLAN-1: a wrong guess should cost a reordered list, not a wrong session");
localStorage.clear(); store.init(); store.set("tier", "personal");
store.set("activeProgramme", { ...(store.get("activeProgramme") || {}),
  sessionSequence: [{ day: today, type: "core", completed: false }] });
ok("1b.2 an OLD plan with no record of who chose is treated as a guess",
   chooseSessionType().sessionType !== "core" || chooseSessionType().reason !== "programme",
   "the safe default, and the behaviour it had before");

console.log("\nTEST 2 — reversals");
plan("core", other);
ok("2.1 a plan for ANOTHER day does not steer today",
   chooseSessionType().reason !== "programme",
   "the plan is a plan for that day, not a standing preference");
plan("core");
store.set("tier", "free");
ok("2.2 free tier is not steered by a plan", chooseSessionType().inputs.plannedFocus == null,
   "the weekly plan is a Plan feature");
plan("strength");
ok("2.3 an old-style 'strength' slot still gets something sensible",
   TYPES.includes(chooseSessionType().sessionType));

console.log("");
if (fail) { console.log("WEEK-PLAN-LIVE: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("WEEK-PLAN-LIVE: all " + pass + " assertions pass\n");
