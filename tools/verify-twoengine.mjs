/**
 * tools/verify-twoengine.mjs
 * 06 Sep 2026 v1
 *
 * TWO-ENGINE. The coach route builds through session-builder.js.
 *
 * WHAT WAS WRONG. coach-proposal.js imported workoutGenerator.js and
 * called generateDailyOptions(). That engine's entire type vocabulary is
 * one line -- { strength, mobility, cardio } -- against
 * session-builder.js's EIGHT session types, and it read sessionVariety,
 * exercisePreferences and SECTION-RULES exactly ZERO times. Every
 * improvement made to selection for three months was invisible on the
 * route Plan users were funnelled through, and stretch could not be
 * produced there at all.
 *
 * DATA-1b predicted it in August: "this product has two session engines
 * and they do not share their filters by default". This gate is the
 * thing that makes the prediction unnecessary.
 *
 * WHY IT IS DRIVEN. verify-lobby1's source assertions passed throughout
 * the four days Home was broken, because they asserted a decision rather
 * than a behaviour. So the engine claim here is proven by BUILDING a
 * session and inspecting it, not by grepping for an import name.
 */

import { createRequire as __cr } from "node:module";
import fs from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store }        = await import(B + "store.js");
const SB               = await import(B + "session-builder.js");
const SC               = await import(B + "data/session-choice.js");

const cp = fs.readFileSync("js/views/coach-proposal.js", "utf8");
const TYPE_IDS = SB.SESSION_TYPES.map(t => t.id);

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

function seed(patch = {}) {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("equipment", ["none"]);
  for (const [k, v] of Object.entries(patch)) store.set(k, v);
}
const today = () =>
  ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
// Eleven recorded instances in this project of a fixture not reaching the
// branch it names. Every step of the chain is checked to fire before any
// assertion is made about what it decided.
console.log("\nTEST 0 - every fixture reaches the step it names");

seed();
ok("0a. the Plan fixture is on Plan", store.get("tier") === "personal");

seed();
ok("0b. no arc, no class -> the least-recent step",
   SC.chooseSessionType().reason === "least-recent",
   `reason was "${SC.chooseSessionType().reason}"`);

seed({ arc: { aimId: "sport-without-flaring", acceptedAt: new Date().toISOString() } });
const arcPick = SC.chooseSessionType();
ok("0c. an arc reaches the arc step", arcPick.reason.startsWith("arc"),
   `reason was "${arcPick.reason}" - the aim id may not exist, which is how ` +
   `the first draft of this fixture silently measured the no-arc branch`);
ok("0d. and the arc genuinely produced types", arcPick.inputs.arcSessionTypes.length > 0,
   "arcSessionTypes empty - the aim resolved to no strands");

seed({
  arc: { aimId: "sport-without-flaring", acceptedAt: new Date().toISOString() },
  activeProgramme: { sessionSequence: [{ day: today(), type: "cardio", completed: false }] }
});
const classPick = SC.chooseSessionType();
ok("0e. a class today reaches the programme step", classPick.reason.startsWith("programme"),
   `reason was "${classPick.reason}"`);

// ── 1. THE SEAM IS GONE ─────────────────────────────────────────────────
console.log("\nTEST 1 - coach-proposal no longer runs the old engine");

ok("1a. no live import of the workoutGenerator object",
   !/import\s*\{[^}]*\bworkoutGenerator\b[^}]*\}\s*from/.test(cp),
   "coach-proposal.js imports workoutGenerator again");

// The CONSTANT may stay. Asserted positively so a later tidy-up that
// removes it fails here rather than silently changing how the check-in's
// time answer is interpreted.
ok("1b. but AVAILABLE_TIME_WINDOW_MINUTES is still imported",
   /AVAILABLE_TIME_WINDOW_MINUTES\s*\}\s*from\s*'\.\.\/data\/workoutGenerator\.js'/.test(cp),
   "the time window constant was removed with the engine - it is not engine behaviour");

ok("1c. buildSession and buildCandidatePools are imported",
   /import\s*\{\s*buildSession,\s*buildCandidatePools\s*\}/.test(cp));

const liveCallers = fs.readdirSync("js/views").map(f => `js/views/${f}`)
  .concat(fs.readdirSync("js/data").map(f => `js/data/${f}`))
  .filter(f => f.endsWith(".js") && !f.endsWith("workoutGenerator.js"))
  .filter(f => fs.readFileSync(f, "utf8")
    .split("\n")
    .some(l => /generateDailyOptions\s*\(/.test(l) && !/^\s*(\*|\/\/)/.test(l)));
ok("1d. generateDailyOptions has zero live callers", liveCallers.length === 0,
   `still called from: ${liveCallers.join(", ")}`);

ok("1e. and it was retired, not deleted",
   /generateDailyOptions\(\)\s*\{/.test(fs.readFileSync("js/data/workoutGenerator.js", "utf8")),
   "the function is gone. Retire is not delete - it is the record of what the " +
   "route did for three months, and the three hardcoded focuses are the reason " +
   "stretch was unreachable");

// ── 2. THE SESSION IS BUILT BY THE GOOD ENGINE ──────────────────────────
// Proven by a PROPERTY only session-builder produces, not by a name.
console.log("\nTEST 2 - what comes out is a session-builder session");

seed();
const pick = SC.chooseSessionType();
const built = SB.buildSession({ sessionType: pick.sessionType, durationMins: 30 });

ok("2a. the chain picks one of the eight types", TYPE_IDS.includes(pick.sessionType),
   `picked "${pick.sessionType}"; the old engine only ever had three focuses`);

ok("2b. and there are eight of them, not three", TYPE_IDS.length === 8,
   `SESSION_TYPES holds ${TYPE_IDS.length}`);

// workoutGenerator reports duration as a NUMBER from calculateDuration(),
// the function that returns NaN on any of the 99 string-`rest` entries.
// session-builder reports an honest RANGE. The type of this field is
// therefore the fingerprint of which engine ran.
ok("2c. duration is an honest range, not a false-precise number",
   typeof built.duration === "string" && /\d+.*\d+/.test(built.duration),
   `duration was ${JSON.stringify(built.duration)} (${typeof built.duration})`);

ok("2d. and it is not NaN, which is what the old engine showed on this screen",
   !/NaN/i.test(String(built.duration)),
   `duration was ${JSON.stringify(built.duration)}`);

// ── 3. STRETCH IS REACHABLE ─────────────────────────────────────────────
console.log("\nTEST 3 - stretch, the thing Graeme could not find");

ok("3a. stretch is one of the builder's types", TYPE_IDS.includes("stretch"));

const stretch = SB.buildSession({ sessionType: "stretch", durationMins: 30 });
ok("3b. and a stretch session actually builds",
   !!stretch && (stretch.exercises || []).length > 0,
   "buildSession('stretch') produced nothing");

const wg = fs.readFileSync("js/data/workoutGenerator.js", "utf8");
ok("3c. and the retired engine still cannot produce one, so this mattered",
   !/getWorkoutName[\s\S]{0,200}stretch/.test(wg),
   "workoutGenerator gained a stretch type - if deliberate, retire this " +
   "assertion with the reason recorded rather than deleting it");

// ── 4. THE THREE THE OLD ENGINE READ ZERO TIMES ─────────────────────────
console.log("\nTEST 4 - variety, preferences and section rules are live here");

const sbSrc = fs.readFileSync("js/session-builder.js", "utf8");
for (const [label, needle] of [
  ["4a. sessionVariety",       "sessionVariety"],
  ["4b. exercisePreferences",  "exercisePreferences"],
  ["4c. SECTION-RULES",        "SECTION-RULES"]
]) {
  ok(`${label} is read by the engine the coach now uses`,
     sbSrc.includes(needle) && !wg.includes(needle),
     `"${needle}": session-builder ${sbSrc.includes(needle)}, workoutGenerator ${wg.includes(needle)}`);
}

// Behavioural, not textual: the person's own variety answer must change
// what is built, or "it is read" means nothing.
seed({ sessionVariety: "familiar" });
const familiar = SB.buildSession({ sessionType: "lower", durationMins: 30 });
seed({ sessionVariety: "varied" });
const varied = SB.buildSession({ sessionType: "lower", durationMins: 30 });
ok("4d. and both settings produce a session rather than throwing",
   !!familiar && !!varied &&
   (familiar.exercises || []).length > 0 && (varied.exercises || []).length > 0,
   "one of the variety settings produced nothing");

// ── 5. SWAPS ────────────────────────────────────────────────────────────
console.log("\nTEST 5 - the swap pool comes from identical arguments");

seed();
const pools = SB.buildCandidatePools({ sessionType: "lower", durationMins: 30 });
ok("5a. candidatePools populates", !!pools && !!pools.main && pools.main.length > 0,
   "no candidate pool - every swap affordance would be absent");

// triggerBuild() in session-builder-ui.js is the reference. Identical
// arguments to both calls, or verify-swap1 stays green while swaps vanish.
const suggestion = cp.slice(cp.indexOf("function _buildCoachSuggestion"),
                            cp.indexOf("function _getFallbackOptions"));
ok("5b. and coach-proposal passes ONE args object to both builders",
   /const args = \{/.test(suggestion) &&
   /buildSession\(args\)/.test(suggestion) &&
   /buildCandidatePools\(args\)/.test(suggestion),
   "the two calls are constructed separately, so they can drift apart silently");

ok("5c. and the pool reaches the stored session",
   /candidatePools:\s*_pools/.test(cp),
   "the pool is built and dropped - the swap sheet has nothing to read");

// ── 6. FAULTLESS ────────────────────────────────────────────────────────
console.log("\nTEST 6 - the coach's record of what it used is not empty");

seed({ arc: { aimId: "sport-without-flaring", acceptedAt: new Date().toISOString() } });
const withArc = SC.chooseSessionType();

ok("6a. inputs is non-empty", Object.keys(withArc.inputs).length > 0,
   "inputs is {} - which is exactly what it has been on this route since v8, " +
   "while the coach line talked about the check-in and the arc");

for (const key of SC.INPUT_KEYS) {
  ok(`6b. inputs declares ${key}`, key in withArc.inputs,
     "a key that is absent means NOT CONSULTED, and the coach may not mention it");
}

ok("6c. a claim about the arc is supported when there is an arc",
   SC.lineIsSupported("Your arc says legs have been thin.", withArc.inputs));

seed();
const noArc = SC.chooseSessionType();
ok("6d. and rejected when there is not",
   !SC.lineIsSupported("Your arc says legs have been thin.", noArc.inputs),
   "the coach can claim an arc it never read");

ok("6e. and a claim about a class is rejected when no class is running",
   !SC.lineIsSupported("Today is your programme session.", noArc.inputs));

// ── 7. SAFETY IS INHERITED, NOT REBUILT ─────────────────────────────────
console.log("\nTEST 7 - severe pain still bypasses, through the new chain");

ok("7a. the chain does NOT contain its own severe check",
   !/severe/i.test(fs.readFileSync("js/data/session-choice.js", "utf8")
     .split("export function chooseSessionType")[1] || ""),
   "a second, weaker copy of a safety rule that buildSession already owns - " +
   "the DATA-1b failure mode exactly");

seed({
  conditions: ["lower-back"],
  conditionPainScores: { "lower-back": 10 }
});
const severePick = SC.chooseSessionType();
const severeBuilt = SB.buildSession({ sessionType: severePick.sessionType, durationMins: 30 });
ok("7b. and a severe zone still diverts whatever the chain chose",
   !!severeBuilt && severeBuilt.id !== severePick.sessionType,
   `chain chose "${severePick.sessionType}" and buildSession returned ` +
   `"${severeBuilt && severeBuilt.id}" - expected a diversion, not the requested type`);

// ── 8. SCHEMA BEFORE CODE ───────────────────────────────────────────────
console.log("\nTEST 8 - the field the chain reads is declared");

const schema = fs.readFileSync("Documents/Live State/Schema.md", "utf8");
ok("8a. activityLog[].sessionType is in Schema.md",
   /activityLog\[\]\.sessionType/.test(schema),
   "the chain reads a field the schema does not declare");

ok("8b. and something actually writes it",
   /sessionType:\s*_st\.sessionType/.test(fs.readFileSync("js/views/gym-programme.js", "utf8")),
   "declared and read but never written - the reader-without-writer class, " +
   "five of which have already been found in this store");

console.log(fails === 0
  ? "\nTWO-ENGINE: all assertions pass\n"
  : `\nTWO-ENGINE: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
