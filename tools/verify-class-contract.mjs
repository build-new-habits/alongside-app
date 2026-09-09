/**
 * tools/verify-class-contract.mjs
 * 08 Sep 2026 v1
 *
 * CLASS-1. The guided class data contract, and the three classes it was
 * fixed against.
 *
 * ── WHY THE CONTRACT IS CHECKED AGAINST THE CLASSES ──────────────────
 *
 * Class 001 proposed a shape from what it had actually used. 002 was
 * written as a circuit and 003 as seated mindfulness precisely to strain
 * it, and each records what it did to the contract. All three end with
 * the same instruction: "Fix it against these three before writing a
 * fourth."
 *
 * So the three classes are the fixture, not an illustration. A contract
 * checked only against itself would be a shape nobody had to live with.
 *
 * ── THE LINES THIS GATE PROTECTS ─────────────────────────────────────
 *
 * Some sentences in these classes are load-bearing and say so in the
 * documents. They are asserted here so that an edit which softens them
 * fails rather than ships:
 *
 *   "There might not be"           — a question that only accepts
 *                                    "yes, better" teaches people to
 *                                    report improvement, and evidence
 *                                    you have coached is worth nothing.
 *
 *   "your body did all of it"      — a fact, not a compliment. Anything
 *                                    warmer takes the conclusion off the
 *                                    person, which is the one thing
 *                                    trusting-body cannot afford.
 *
 *   "one round for six weeks"      — the exit offered in the middle, out
 *                                    loud, before anybody has to invent
 *                                    it.
 *
 *   "later in the week — not now"  — the honest form of the promise. The
 *                                    alternative is a claim the class
 *                                    cannot verify.
 *
 * A gate over prose is unusual and it is the right tool here. These are
 * not stylistic preferences; each one is the difference between the
 * class working and the class doing the opposite of what it is for.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);

const B = new URL("../js/", import.meta.url).href;
const CONTRACT = await import(B + "data/class-contract.js");
const CLASSES  = await import(B + "data/classes/index.js");
const { STRANDS } = await import(B + "data/aims.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const all = CLASSES.CLASSES;
const textOf = (cls) => JSON.stringify(cls);

// ── 0. THE FIXTURE IS THE THREE CLASSES ─────────────────────────────────
console.log("\nTEST 0 - the three written classes are present");

ok("0a. three classes", all.length === 3, `${all.length} loaded`);
ok("0b. and each has content",
   all.every(c => (c.sections || []).flatMap(s => s.beats || []).length > 5),
   "a class with almost no beats means the transcription did not land, and " +
   "every assertion below would be measuring an empty shape");

// ── 1. EVERY CLASS SATISFIES THE CONTRACT ───────────────────────────────
console.log("\nTEST 1 - every class validates against the contract");

for (const r of CLASSES.validateAll()) {
  ok(`1. ${r.id}`, r.ok, r.problems.join("\n        "));
}

// ── 2. THE STATED LENGTH IS CHECKABLE ───────────────────────────────────
console.log("\nTEST 2 - the card's length matches the content underneath it");

// The reason sections exist at all. Transcribed flat, Ground's pauses
// came to 7.4 minutes against a card promising 15 -- and nothing could
// have told anybody, because there was nothing to compare against.
for (const c of all) {
  const secs = c.sections.reduce((a, s) => a + (s.durationSeconds || 0), 0);
  ok(`2. ${c.title}: sections total ${(secs / 60).toFixed(1)} min`,
     secs === c.durationMins * 60,
     `the card says ${c.durationMins} min. A stated length nothing checks ` +
     `is a claim with nothing behind it`);
}

// ── 3. SERVES IS ONE STRAND, AND IT IS NOT TOUCHES ──────────────────────
console.log("\nTEST 3 - a class serves one strand and brushes others");

const strandIds = new Set(Object.keys(STRANDS));
for (const c of all) {
  ok(`3. ${c.title} serves a single real strand`,
     typeof c.serves === "string" && strandIds.has(c.serves),
     `serves = ${JSON.stringify(c.serves)}`);
}

// The distinction earning its keep. Stopping Early TOUCHES trusting-body
// and must not be offered to an arc that contains it: it is a class
// about stopping early that happens to brush against it.
const forTrusting = CLASSES.classesForStrand("trusting-body").map(c => c.id);
ok("3d. a touched strand does not pull a class in",
   forTrusting.includes("class-ground-001") &&
   !forTrusting.includes("class-stopping-early-003"),
   `classesForStrand("trusting-body") returned: ${forTrusting.join(", ")}. ` +
   `Stopping Early touches it and serves pacing — flattening serves and ` +
   `touches would offer it as though it were built for that arc`);

// ── 4. SPEECH SCALES, HOLD NEVER DOES ───────────────────────────────────
console.log("\nTEST 4 - a pacing choice cannot rewrite the workload");

// Class 002's plank is 35 seconds. At 1.5x that becomes 23, which is a
// harder exercise nobody asked for; at 0.5x it becomes 70, the opposite
// of what somebody choosing "slower" was asking for.
const held = all.flatMap(c => c.sections.flatMap(s => s.beats))
  .filter(b => typeof b.holdSeconds === "number");
ok("4pc. positive control: there is a hold to test", held.length > 0,
   "no holdSeconds anywhere - test 4 would be vacuous");

for (const rate of [0.5, 1, 1.5, 2]) {
  ok(`4. holdSeconds unchanged at ${rate}x`,
     held.every(b => CONTRACT.pacedBeat(b, rate).holdSeconds === b.holdSeconds),
     "a pacing control silently rewrote a held position");
}
ok("4e. and speechSeconds DOES scale",
   CONTRACT.pacedBeat({ speechSeconds: 40 }, 2).speechSeconds === 20,
   "if neither scales, the pacing control does nothing at all");

// ── 5. NO STOP CUE MAKES THE END OF A SET A FAILURE ─────────────────────
console.log("\nTEST 5 - stopping is never framed as failing");

const cues = all.flatMap(c => c.sections.flatMap(s => s.beats))
  .map(b => b.stopCue).filter(Boolean);
ok("5pc. positive control: there are stop cues", cues.length > 0);
ok("5a. none is phrased as working to failure",
   !cues.some(c => /can'?t (do )?any ?more|to failure|until failure|as many as you can/i.test(c)),
   `offending cues: ${cues.filter(c => /failure|any ?more/i.test(c)).join(" / ")}`);

// ── 6. THE LOAD-BEARING LINES ───────────────────────────────────────────
console.log("\nTEST 6 - the sentences the classes say must not change");

const LINES = [
  ["class-ground-001",         "There might not be",
   "a question that only accepts 'yes, better' teaches people to report improvement"],
  ["class-ground-001",         "your body did all of it",
   "a fact, not a compliment - anything warmer takes the conclusion off the person"],
  ["class-steady-round-002",   "one round for six weeks",
   "the exit offered in the middle, out loud, before anybody has to invent it"],
  ["class-stopping-early-003", "later in the week — not now",
   "the honest form of the promise, and the delay is what makes the delay survivable"]
];

for (const [id, line, why] of LINES) {
  const cls = all.find(c => c.id === id);
  ok(`6. ${id}: "${line}"`,
     !!cls && textOf(cls).includes(line),
     `${why}. Gone from ${id}`);
}

// ── 7. SAFETY IS THE LIBRARY'S, NOT A SECOND COPY ───────────────────────
console.log("\nTEST 7 - a class is filtered by the same rules as everything else");

const src = __cr(import.meta.url)("node:fs")
  .readFileSync(new URL("../js/data/classes/index.js", import.meta.url), "utf8");
ok("7a. it imports the shared safety functions",
   /getActiveConditionIds/.test(src) && /getExerciseSafetyTier/.test(src),
   "a second set of safety rules for classes would drift from conditions " +
   "data the first time either moved, and the failure mode is a movement " +
   "excluded from a built session and offered inside a class");

// A movement on the avoid list with no safe route withholds the class.
// Withheld, not silently edited: a class with a hole in it is worse than
// one not offered, because the person cannot see what is missing.
const clear   = CLASSES.getClasses().length;
const injured = CLASSES.getClasses({ conditionIds: ["lower-back"], painScores: { "lower-back": 9 } }).length;
ok("7pc. positive control: all three offered with nothing declared",
   clear === 3, `${clear} of 3`);
ok("7b. and a severe zone withholds the ones it should",
   injured < clear && injured > 0,
   `${injured} of ${clear} offered with a severe lower back. All three would ` +
   `mean the filter is not running; none would mean it is not discriminating`);

ok("7c. sitOut is not used as a safety route",
   !/sitOut/.test(src.split("classSafety")[1] || ""),
   "sitOut means the person MAY skip. Using it as the app's answer to an " +
   "unsafe movement turns a considered exclusion into a shrug");

console.log(fails === 0
  ? "\nCLASS-1: all assertions pass\n"
  : `\nCLASS-1: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
