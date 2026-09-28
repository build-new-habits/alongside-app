/**
 * tools/verify-feed1.mjs
 * 28 Sep 2026 v3
 *
 * v3 - Work list 2e. TESTS 1-2 drove applyFeedbackWeighting(), which was
 *   called only by getSuitableExercises(), called only by the deleted
 *   workoutGenerator.js: a reader no session ever reached. Re-pointed at
 *   the two LIVE readers in data/session-rationale.js --
 *   tooHardRecently() (session-builder offers the move less often;
 *   exercise-card opens easier ways in) and tooEasyLast() (the player's
 *   log suggests a step up; verify-dead-generator TEST 5 drives it).
 *   Same thresholds: two of the last five for too-hard, so one hard day
 *   moves nothing (P4). TEST 3 unchanged.
 *
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 12 Aug 2026 v1
 *
 * FEED-1. The LAST reader-without-a-writer on the board.
 *
 * applyFeedbackWeighting() has read exerciseFeedback since v1.3 and
 * nothing ever wrote it, so the weighting has never once run on real
 * data -- it takes the array, finds it empty, returns the pool
 * untouched. store.logExerciseFeedback() was even built for it. The
 * response existed; the capture never did. Fifth confirmed instance.
 */

// ── GATE-PATH, 21 Aug 2026 ─────────────────────────────────────────
// Resolved from THIS FILE, never hardcoded. This gate previously
// imported an absolute /home/claude/repo path: cloned anywhere else it
// went red, and -- worse -- if that directory existed from an earlier
// session it read THAT copy and reported green on code nobody was
// editing. Five reversals of the merge guard passed exactly this way.
import { fileURLToPath as __f } from "node:url";
import { dirname as __d, resolve as __r } from "node:path";
const __REPO = __r(__d(__f(import.meta.url)), "..");
import fs from "node:fs";
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { store } = await import(__REPO + "/js/store.js");
store.init();
const { tooHardRecently, tooEasyLast } = await import(__REPO + "/js/data/session-rationale.js");

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


let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

console.log("\nTEST 1 - the live readers act on real data");
check("two 'too-hard' entries: the builder offers it less", () => {
  store.set("exerciseFeedback", []);
  store.logExerciseFeedback("squat", "too-hard");
  store.logExerciseFeedback("squat", "too-hard");
  ok(tooHardRecently("squat") === true, "the reader needs 2 of the last 5");
});
check("a 'too-easy' entry: the coach suggests a step up next time", () => {
  store.set("exerciseFeedback", []);
  store.logExerciseFeedback("row", "too-easy");
  ok(tooEasyLast("row") === true, "one tap is the person's own word; it changes a suggestion, not the offer");
});
check("ONE hard day changes nothing (P4)", () => {
  store.set("exerciseFeedback", []);
  store.logExerciseFeedback("press", "too-hard");
  ok(tooHardRecently("press") === false,
     "a single bad day must not move selection - two of five is the threshold");
});
check("the live readers are wired: the builder and the log", () => {
  const sb = fs.readFileSync(_gatePath("js/session-builder.js"), "utf8");
  const sr = fs.readFileSync(_gatePath("js/data/session-rationale.js"), "utf8");
  ok(/candidates\.filter\(e => !tooHardRecently\(e\.id\)\)/.test(sb), "session-builder no longer reads too-hard");
  ok(/const tooEasy = tooEasyLast\(exercise\.id\)/.test(sr), "progressionInvitation no longer reads too-easy");
});

console.log("\nTEST 2 - it can be withdrawn");
check("clearExerciseFeedback removes ALL entries for that exercise", () => {
  store.set("exerciseFeedback", []);
  store.logExerciseFeedback("plank", "too-hard");
  store.logExerciseFeedback("plank", "too-hard");
  store.logExerciseFeedback("other", "too-easy");
  store.clearExerciseFeedback("plank");
  const left = store.get("exerciseFeedback");
  ok(!left.some(e => e.exerciseId === "plank"),
     "leaving entries behind means the undo silently did nothing");
  ok(left.some(e => e.exerciseId === "other"), "must not clear other exercises");
});
check("after clearing, the readers let it go", () => {
  ok(tooHardRecently("plank") === false, "still read as too hard after being withdrawn");
  ok(tooEasyLast("other") === true, "and the other exercise keeps its word");
});
check("invalid values are rejected", () => {
  store.set("exerciseFeedback", []);
  ok(store.logExerciseFeedback("x", "brilliant") === null, "accepted a value outside the contract");
  ok(store.logExerciseFeedback("", "too-hard") === null, "accepted an empty id");
});

console.log("\nTEST 3 - it is NOT a rating");
const ctrl = fs.readFileSync(_gatePath("js/exercise-feedback.js"), "utf8");
check("no stars, scores or scales", () => {
  for (const w of ["star", "rating", "out of 10", "score this", "rate "])
    ok(!new RegExp(w, "i").test(ctrl.replace(/\/\*[\s\S]*?\*\//g, "")),
       `"${w}" - the skip/dislike spec section 6 rules this out`);
});
check("no 'about right' third option", () => {
  ok(!/about right/i.test(ctrl.replace(/\/\*[\s\S]*?\*\//g, "")),
     "silence already means about right; a third option makes it a question on every exercise");
});
check("exactly two feedback values, matching the reader's contract", () => {
  const vals = [...ctrl.matchAll(/data-feedback="([a-z-]+)"/g)].map(m => m[1]);
  ok(new Set(vals).size === 2 && vals.includes("too-hard") && vals.includes("too-easy"),
     `found ${JSON.stringify([...new Set(vals)])}`);
});

console.log("\nTEST 4 - rendered and wired on every card-shaped view");
for (const v of ["workout", "core-session", "prescribed-session", "gym-programme"])
  check(`${v}`, () => {
    const s = fs.readFileSync(_gatePath(`js/views/${v}.js`), "utf8");
    ok(/renderFeedbackControl\(/.test(s), "control not rendered");
    ok(/attachFeedbackEvents\(/.test(s), "rendered but never wired - taps would do nothing");
  });
check("NOT on restoration views", () => {
  for (const v of ["breathing-session", "quiet-session"])
    ok(!/renderFeedbackControl/.test(fs.readFileSync(_gatePath(`js/views/${v}.js`), "utf8")),
       `${v}: asking whether restoration was too easy is a category error`);
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
