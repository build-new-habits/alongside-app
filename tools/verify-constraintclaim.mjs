/**
 * tools/verify-constraintclaim.mjs
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

const narrative = code.slice(code.indexOf("function _buildConditionNarrative"));
const moderateBlock = narrative.slice(narrative.indexOf("if (moderateIds.length > 0)"),
                                      narrative.indexOf("if (mildIds.length > 0)"));

ok("1a. the moderate sentence does not say 'worked around'",
   !/worked around/i.test(moderateBlock),
   "at 6 nothing is worked around - subacute applies care, not exclusion, and " +
   "the exercise card says so on the very next screen");

ok("1b. it still names the condition and the score",
   /_joinNames\(parts\)/.test(moderateBlock) && /painScores\[id\]/.test(moderateBlock),
   "going silent at 6 is worse than overclaiming: the person told the coach " +
   "about it, and silence reads as not having been heard");

ok("1c. and it hands the judgement back rather than asserting an outcome",
   /how it feels|ease off/i.test(moderateBlock),
   moderateBlock.replace(/\s+/g, " ").slice(0, 160));

// ── 2. THE OTHER TWO BANDS ARE UNCHANGED ────────────────────────────────
// A fix that quietly softened the severe sentence too would be a
// clinical loosening, and is not a wording decision.
console.log("\nTEST 2 - severe and mild were not touched");

const severeBlock = narrative.slice(narrative.indexOf("if (severeIds.length > 0)"),
                                    narrative.indexOf("if (moderateIds.length > 0)"));
ok("2a. severe still says it kept clear", /kept things well clear/.test(severeBlock),
   "the severe wording changed. At 7+ the acute tier genuinely excludes, so " +
   "that claim is earned - softening it would be a clinical loosening");

const mildBlock = narrative.slice(narrative.indexOf("if (mildIds.length > 0)"));
ok("2b. mild still says nothing was changed",
   /haven\\?'t changed anything/.test(mildBlock),
   "mild's honesty was the model for this fix; it must not drift");

// ── 3. THE TWO SCREENS AGREE ────────────────────────────────────────────
console.log("\nTEST 3 - the proposal and the exercise card no longer contradict");

const rat = fs.readFileSync(_gatePath("js/data/session-rationale.js"), "utf8");
ok("3a. the exercise card still tells the truth about a sore area",
   /is sore today, and this one works it/.test(rat),
   "the card was changed to match the proposal. THE CARD WAS THE TRUTHFUL ONE - " +
   "fixing the contradiction by silencing the honest half is the wrong repair");

ok("3b. and the proposal no longer contradicts it",
   !/worked around/i.test(moderateBlock));

console.log(fails === 0
  ? "\nCONSTRAINT-CLAIM: all assertions pass\n"
  : `\nCONSTRAINT-CLAIM: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
