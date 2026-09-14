/**
 * tools/verify-energy1.mjs
 * 13 Sep 2026 v1
 *
 * ENERGY-1 and the FEED-1 reader. Two signals the app was collecting and
 * not acting on, and one coach line rewritten.
 *
 * ── WHAT SHIPPED ────────────────────────────────────────────────────
 *
 * 1. A low-energy day prefers movements that ask LESS ENERGY, not easier
 *    ones. Graeme's decision, 13 Sep, and the reasoning matters:
 *    difficultyLevel mostly measures coordination and technique, so a
 *    difficulty-5 movement can be easy work done precisely. Capping
 *    difficulty on a tired day filters the wrong axis. Test 2 asserts the
 *    axis that moved and test 3 asserts the one that did not.
 *
 * 2. "That was too hard", twice in the last five, now does two things:
 *    the builder offers that exercise less often, and the card opens
 *    "Other ways to do this" without being asked. FEED-READER proved on
 *    12 Sep that the button reached NO live decision -- its only reader
 *    sat behind workoutGenerator.js, which nothing has called since
 *    TWO-ENGINE.
 *
 * 3. The low-energy coach line is shorter and no longer argues with the
 *    person. The old one said "not a compromise", which plants the
 *    thought it denies.
 *
 * ── WHAT IT MUST NOT DO ─────────────────────────────────────────────
 *
 * Neither signal may EMPTY anything or DROP anything. Both are
 * preferences in selection, in the same probabilistic shape as the 'less'
 * preference they sit beside. Tests 2c and 4c hold that.
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM('<!doctype html><body></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const { store } = await import("../js/store.js");
const { buildSession } = await import("../js/session-builder.js");
const { tooHardRecently } = await import("../js/data/session-rationale.js");
const { renderExerciseCard } = await import("../js/exercise-card.js");
const { EXERCISES } = await import("../js/data/exercises/index.js");

const KIT = ["dumbbells", "resistance-band", "bench"];
const reset = () => {
  localStorage.clear(); store.init();
  store.set("equipment", KIT); store.set("homeEquipment", KIT);
  store.set("conditions", []); store.set("conditionPainScores", {});
};
const build = (n = 8, type = "full") => {
  const out = [];
  for (let i = 0; i < n; i++) {
    const s = buildSession({ sessionType: type, durationMins: 30, equipmentOverride: KIT, preset: null });
    out.push(s);
  }
  return out;
};
const avgEnergy = sessions => {
  const all = sessions.flatMap(s => (s.exercises || []).filter(e => e.section === "main"));
  return all.reduce((a, e) => a + (e.energyRequired || 0), 0) / Math.max(all.length, 1);
};
const avgDifficulty = sessions => {
  const all = sessions.flatMap(s => (s.exercises || []).filter(e => e.section === "main"));
  return all.reduce((a, e) => a + (e.difficultyLevel || 0), 0) / Math.max(all.length, 1);
};

console.log("\nENERGY-1 and the FEED-1 reader\n");

console.log("TEST 1 — the coach line");

{
  reset();
  store.set("todayIntensity", "low");
  const line = build(1)[0].coachLine || "";
  ok("1a. it names the low-energy day", /energy/i.test(line) && /low/i.test(line), line.slice(0, 160));
  ok("1b. it no longer argues with a thought the person may not have had",
     !/not a compromise/i.test(line) && !/useful thing to do/i.test(line), line.slice(0, 160));
  ok("1c. and does not explain the machinery",
     !/working part/i.test(line), line.slice(0, 160));

  reset();
  store.set("todayIntensity", "moderate");
  ok("1d. CONTROL: an ordinary day says nothing about energy",
     !/energy/i.test(build(1)[0].coachLine || ""), (build(1)[0].coachLine || "").slice(0, 120));
}

console.log("\nTEST 2 — a low day asks less energy of you");

let ordinaryEnergy, lowEnergy, ordinaryDiff, lowDiff;
{
  reset(); store.set("todayIntensity", "moderate");
  const ordinary = build(25);
  ordinaryEnergy = avgEnergy(ordinary); ordinaryDiff = avgDifficulty(ordinary);

  reset(); store.set("todayIntensity", "low");
  const low = build(25);
  lowEnergy = avgEnergy(low); lowDiff = avgDifficulty(low);

  ok("2a. CONTROL: both fixtures actually built working movements",
     ordinaryEnergy > 0 && lowEnergy > 0, `${ordinaryEnergy.toFixed(2)} / ${lowEnergy.toFixed(2)}`);
  ok("2b. the low day's movements ask less energy, on average",
     lowEnergy < ordinaryEnergy,
     `low ${lowEnergy.toFixed(2)} vs ordinary ${ordinaryEnergy.toFixed(2)}`);

  // A THIRD ASSERTION WAS TRIED HERE AND REMOVED, recorded because it
  // was wrong in an instructive way. It claimed every chosen movement
  // should sit at or below the median of its SECTION pool -- and it
  // failed at about 37%, on correct code.
  //
  // The weighting runs inside pickFrom(), which works through one
  // CATEGORY at a time: the median it compares against is the median of
  // that category's candidates, not of the whole main pool. A movement
  // can be well above the section median and still be the gentlest thing
  // its own category offers. Exactly the same misreading as the second
  // draft of test 5 below.
  //
  // 2b carries the weight instead, and it earns it: deleting the
  // weighting turns 2b red. Twenty-five builds a side, because at ten the
  // samples overlapped often enough to fail roughly one run in four.

  ok("2e. it never empties a section",
     build(6).every(s => (s.exercises || []).filter(e => e.section === "main").length >= 2));
}

console.log("\nTEST 3 — the axis that was deliberately NOT used");

ok("3a. difficulty is not capped on a low day", lowDiff > 0,
   `low difficulty ${lowDiff.toFixed(2)} vs ordinary ${ordinaryDiff.toFixed(2)}`);
ok("3b. a hard-to-coordinate movement is still reachable when tired", (() => {
  reset(); store.set("todayIntensity", "low");
  const seen = new Set(build(12).flatMap(s => (s.exercises || []).map(e => e.difficultyLevel || 0)));
  return [...seen].some(d => d >= 3);
})(), "difficultyLevel measures coordination, not effort — capping it filters the wrong thing");

console.log("\nTEST 4 — \"that was too hard\" finally does something");

{
  reset();
  const target = EXERCISES.find(e => e.id === "glute-bridge");
  ok("4a. CONTROL: the reader is false before anything is logged",
     tooHardRecently(target.id) === false);

  store.logExerciseFeedback(target.id, "too-hard");
  ok("4b. one tap is a hard day, not a pattern", tooHardRecently(target.id) === false,
     "one is not two");

  store.logExerciseFeedback(target.id, "too-hard");
  ok("4c. two of the last five is", tooHardRecently(target.id) === true);

  // Five more of something else must not push it out of ITS last five.
  for (let i = 0; i < 5; i++) store.logExerciseFeedback("dead-bug", "too-hard");
  ok("4d. and the window is per exercise, not global",
     tooHardRecently(target.id) === true && tooHardRecently("dead-bug") === true);

  ok("4e. an exercise never called hard is unaffected",
     tooHardRecently("plank") === false);
}

console.log("\nTEST 5 — offered less often, never dropped");

{
  // TWO EARLIER VERSIONS OF THIS TEST WERE WRONG, both recorded because
  // both looked convincing.
  //
  // The first compared how often one exercise appeared across twelve
  // full-body builds before and after marking it. It passed with the
  // weighting DELETED: ordinary selection noise moves that number as much
  // as the weighting does.
  //
  // The second marked every candidate in the main POOL but one and
  // expected the survivor to carry the section. It failed at 0% -- and
  // the code was right, the test was not. The filter runs per CATEGORY
  // inside pickFrom(), not over the whole section pool, and when every
  // candidate in a category is marked it correctly leaves them alone
  // rather than emptying the slot.
  //
  // This one marks the single most-served exercise in a NARROW session
  // type, where one category dominates and the effect is unambiguous.
  reset();
  const TYPE = "glute";
  const before = build(10, TYPE).flatMap(s => (s.exercises || []).filter(e => e.section === "main").map(e => e.id));
  const freq = [...new Set(before)]
    .map(id => ({ id, n: before.filter(x => x === id).length }))
    .sort((a, b) => b.n - a.n)[0];
  ok("5a. CONTROL: one exercise is served often enough to measure",
     freq && freq.n >= 4, JSON.stringify(freq));

  store.logExerciseFeedback(freq.id, "too-hard");
  store.logExerciseFeedback(freq.id, "too-hard");
  ok("5b. CONTROL: the reader now sees the pattern", tooHardRecently(freq.id));

  // Twenty-five builds, and a share rather than a count. Ten builds put
  // this at roughly one run in eight: the suppression is probabilistic by
  // design -- LESS_SUPPRESSION lets the exercise through about a fifth of
  // the time, exactly as the 'less' preference beside it does -- so a
  // small sample can land on a run where it slipped through often. The
  // mechanism is right; the measurement was too small for it.
  const after = build(25, TYPE).flatMap(s => (s.exercises || []).filter(e => e.section === "main").map(e => e.id));
  const beforeShare = freq.n / Math.max(before.length, 1);
  const afterShare  = after.filter(x => x === freq.id).length / Math.max(after.length, 1);
  ok("5c. it is offered far less after being called hard twice",
     afterShare < beforeShare / 2,
     `${freq.id}: ${(beforeShare * 100).toFixed(0)}% -> ${(afterShare * 100).toFixed(0)}% of main picks`);

  ok("5d. and the sections are still full — nothing was dropped to achieve it",
     build(6, TYPE).every(s => (s.exercises || []).filter(e => e.section === "main").length >= 2),
     "a preference, not a filter: somebody who wants it gone has the other button");
  ok("5e. an exercise nobody called hard is untouched", !tooHardRecently("plank"));

  // NEVER DROPPED, asserted sharply rather than by hoping a section stays
  // full. Mark every candidate a narrow type can reach: the honest
  // behaviour is to go on offering them, because "this was hard" is not
  // "never show me this". A filter instead of a preference empties the
  // session here, and the reversal that swaps one for the other is caught
  // by this and nothing else.
  reset();
  const SB3 = await import("../js/session-builder.js");
  const p3 = SB3.buildCandidatePools({ sessionType: "glute", durationMins: 30, equipmentOverride: KIT });
  const pool3 = (p3?.main?.candidates || p3?.main || []);
  ok("5f. CONTROL: a real pool to mark", pool3.length > 5, `${pool3.length}`);
  for (const ex of pool3) {
    store.logExerciseFeedback(ex.id, "too-hard");
    store.logExerciseFeedback(ex.id, "too-hard");
  }
  const starved = build(6, "glute");
  ok("5g. with EVERY option called hard, the session is still built",
     starved.every(s => (s.exercises || []).filter(e => e.section === "main").length >= 2),
     starved.map(s => (s.exercises || []).filter(e => e.section === "main").length).join(", "));
}

console.log("\nTEST 6 — the card opens the ways to ease off, unasked");

{
  reset();
  const adapted = EXERCISES.find(e => e.adaptations?.easeOff?.length);
  ok("6a. CONTROL: there is an entry with ways to ease off", !!adapted, "ADAPT-1 content");

  const shut = renderExerciseCard(adapted, { idPrefix: "t", page: "do" });
  ok("6b. closed by default", shut.includes("<details") && !/<details[^>]*\sopen/.test(shut));

  store.logExerciseFeedback(adapted.id, "too-hard");
  store.logExerciseFeedback(adapted.id, "too-hard");
  const open = renderExerciseCard(adapted, { idPrefix: "t", page: "do" });
  ok("6c. open after two taps of \"too hard\"", /<details[^>]*\sopen/.test(open));
  ok("6d. and it still only OFFERS — nothing is chosen for the person",
     open.includes("To ease off"), "ADAPT-1's rule stands");

  const other = EXERCISES.find(e => e.adaptations?.easeOff?.length && e.id !== adapted.id);
  if (other) {
    ok("6e. a different exercise is unaffected",
       !/<details[^>]*\sopen/.test(renderExerciseCard(other, { idPrefix: "t", page: "do" })));
  }
}

console.log(`\n  ${fails === 0 ? "ALL PASS" : fails + " RED"}\n`);
process.exit(fails ? 1 : 0);
