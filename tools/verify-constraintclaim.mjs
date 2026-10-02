/**
 * tools/verify-constraintclaim.mjs
 * 02 Oct 2026 v3
 *
 * v3 - W4-9 SORE-WORDS. The coach's own narrative (_buildConditionNarrative)
 *   is gone: one sentence about a sore area now comes from the builder
 *   (data/conditions.js soreLine), on every door. Tests 1 and 2 follow it
 *   there, through real builds, and keep their bar: it names the area with
 *   no score, hands the judgement back, never says "worked around", and
 *   claims only what was done (the moves it names as left out carry the
 *   area's tag and are not in the plan). 2b asserted "I haven't changed
 *   anything" at the mild band; that was the untrue line (moves are left
 *   out from "A little", known decision 1), so 2b now asserts it is gone.
 *   On a Bad day there is no session at all, and the gentle plan says so in
 *   the person's word.
 *
 * v2 - W3-4 SORE-SCOPE. 1b required the score beside the name: "(6/10)"
 *   is a number nobody gave (the check-in chips are words) and brings back
 *   the 0-10 scale P0d removed. The line still names the area, which is
 *   what 1b protects: silence reads as not having been heard.
 *
 * 06 Sep 2026 v1
 *
 * CONSTRAINT-CLAIM. The coach claims only what it demonstrably did.
 *
 * WHAT WAS WRONG, driven rather than read. coach-proposal.js said
 * "I've worked around that" for any condition in the 6-6.9 band. At
 * lower-back 6, getActiveConditionIds() adds `lower-back-subacute` and
 * getExerciseSafetyTier(cat-cow, ...) returns SAFE -- nothing was worked
 * around. `caution` only appears at 7.
 *
 * And then session-rationale.js told the person on the very next screen
 * that the exercise WORKS that area. Two screens, two answers, and the
 * truthful one looked like the mistake. Graeme met exactly this on 06
 * Sep: a proposal saying it had worked around his lower back, followed
 * by a Cat-Cow card saying the opposite.
 *
 * THE BAR: every input the coach implies it used, it demonstrably used.
 * "Taken into account" is demonstrable -- the id is in the active list.
 * "Worked around" was not, because the subacute tier applies CARE, not
 * exclusion, and whether it changes the pool depends on the exercise.
 *
 * NOT FIXED BY GOING SILENT AT 6. The person told the coach about it,
 * and silence reads as not having been heard. The gate asserts the
 * condition is still named.
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
const { EXERCISES } = await import(B + "data/exercises/index.js");

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

const C             = await import(B + "data/conditions.js");
const { store }     = await import(B + "store.js");
const SB            = await import(B + "session-builder.js");
function lineAt(score) {
  localStorage.clear(); store.init();
  store.set("conditions", ["lower-back"]); store.set("conditionPainScores", { "lower-back": score });
  store.set("equipment", []); store.set("homeEquipment", []);
  const s = SB.buildSession({ sessionType: "full", durationMins: 30 });
  return { s, line: s?.coachLine || "", note: s?.conditionNote || "" };
}

const cp = fs.readFileSync(_gatePath("js/views/coach-proposal.js"), "utf8");
const code = cp.split("\n").filter(l => !/^\s*(\*|\/\/|\/\*)/.test(l)).join("\n");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

// ── 0. THE PREMISE, RE-DRIVEN ───────────────────────────────────────────
// The whole fix rests on 6 behaving differently from 7. If that stops
// being true, the wording below is answering a question nobody is
// asking any more -- so it is measured here rather than assumed from
// the comment.
console.log("\nTEST 0 - 6 and 7 still mean different things");

const cat = EXERCISES.find(e => e.id === "cat-cow");
ok("0a. the fixture exercise exists", !!cat,
   "cat-cow is gone from the library; pick another lower-back exercise " +
   "rather than deleting this test");

const at6 = C.getActiveConditionIds(["lower-back"], { "lower-back": 6 });
const at7 = C.getActiveConditionIds(["lower-back"], { "lower-back": 7 });

ok("0b. 6 adds the SUBACUTE tier", at6.includes("lower-back-subacute"), at6.join(", "));
ok("0c. 7 adds the ACUTE tier", at7.includes("lower-back-acute"), at7.join(", "));

const tier6 = C.getExerciseSafetyTier(cat, at6);
const tier7 = C.getExerciseSafetyTier(cat, at7);

ok("0d. and at 6 a lower-back exercise is still SAFE", tier6 === "safe",
   `tier at 6 is "${tier6}". If this is now "caution", subacute has started ` +
   `excluding and the moderate wording could honestly claim more`);
ok("0e. while at 7 it is not", tier7 !== "safe",
   `tier at 7 is "${tier7}" - if 7 is also safe then nothing is worked around ` +
   `at ANY band and the severe sentence is the overclaim`);

// ── 1. THE CLAIM MATCHES THE ACTION ─────────────────────────────────────
console.log("\nTEST 1 - the moderate band no longer claims an adaptation");

const at6b = lineAt(6), at4b = lineAt(4);
const left6 = EXERCISES.filter(e => (e.contraindications || []).includes("lower-back-subacute"));
const planIds = new Set((at6b.s?.exercises || []).map(e => e.id));

ok("1a. the sentence does not say 'worked around'", !/worked around/i.test(at6b.line), at6b.line);

ok("1b. it still names the area, with no score out of ten",
   /lower back/i.test(at6b.note) && /quite sore/i.test(at6b.note) && !/\d+\s*\/\s*10|\bout of ten\b/i.test(at6b.line),
   "going silent at 6 is worse than overclaiming: the person told the coach " +
   "about it, and silence reads as not having been heard. " + at6b.note);

ok("1c. and it hands the judgement back rather than asserting an outcome",
   /skip anything/i.test(at6b.note), at6b.note);

ok("1d. what it says it left out carries the area's tag and is not in the plan",
   left6.length > 0 && left6.every(e => !planIds.has(e.id)) && left6.every(e => at6b.note.includes(e.name)),
   `${left6.map(e => e.name).join(", ")} | ${at6b.note}`);

// ── 2. THE OTHER BANDS ──────────────────────────────────────────────────
console.log("\nTEST 2 - A little says the same true thing; Bad builds no session");
ok("2a. Bad: no session, the gentle plan, in the person's word (earned: nothing is trained)",
   (() => { const b = lineAt(8); return b.s?.gentleCare === true && /lower back is bad today/i.test(b.line); })());
ok("2b. A little: never \"I haven't changed anything\" while moves are left out",
   !/haven.t changed anything/i.test(at4b.line) && /a little sore/i.test(at4b.note) && left6.every(e => at4b.note.includes(e.name)),
   at4b.note);
ok("2c. coach-proposal.js keeps no sentence of its own about a sore area", !/function _buildConditionNarrative/.test(code));

const moderateBlock = at6b.line;

// ── 3. THE TWO SCREENS AGREE ────────────────────────────────────────────
console.log("\nTEST 3 - the proposal and the exercise card no longer contradict");

const rat = fs.readFileSync(_gatePath("js/data/session-rationale.js"), "utf8");
// CARD-6, 16 Sep 2026. AMENDED, AND THE GUARANTEE IS UNCHANGED.
//
// This pinned the literal string "is sore today, and this one works it".
// The guarantee it exists to hold is that THE CARD STILL SAYS THIS
// EXERCISE WORKS THE SORE AREA -- that the contradiction with the
// proposal was never repaired by silencing the honest half.
//
// What changed is only how that sentence is spelled. "is sore today"
// was ungrammatical for every plural area ("Your glutes IS sore"), and
// there are now three variants so two consecutive exercises do not read
// identically. Pinning one literal would have forced the grammar fault
// to stay in order to keep this green.
//
// So the assertion moves to the claim rather than the wording: every
// variant must still name the area AND say this exercise works it.
// Asserted across all three, so a future variant cannot quietly drop it.
const soreFn = rat.slice(rat.indexOf("function _soreLine"),
                         rat.indexOf("export function progressionInvitation"));
// Counted over the whole function, not per template literal: each
// variant is built by concatenating two strings, so a per-literal count
// finds six fragments rather than three sentences.
const labelRefs = (soreFn.match(/\$\{label\}/g) || []).length;
const areaClaims = (soreFn.match(/works it|works your|loads your/g) || []).length;
ok("3a. the exercise card still tells the truth about a sore area",
   labelRefs >= 3 && areaClaims >= 3,
   "the card was changed to match the proposal. THE CARD WAS THE TRUTHFUL ONE - " +
   "fixing the contradiction by silencing the honest half is the wrong repair");

ok("3a-r. REVERSAL: the ungrammatical original is gone from the file",
   !/is sore today/.test(rat),
   "\"Your glutes IS sore today\" -- specified as fixed on 15 Sep, reported as " +
   "done, listed in the testing schedule, and never committed until v515");

ok("3b. and the proposal no longer contradicts it",
   !/worked around/i.test(moderateBlock));

console.log(fails === 0
  ? "\nCONSTRAINT-CLAIM: all assertions pass\n"
  : `\nCONSTRAINT-CLAIM: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
