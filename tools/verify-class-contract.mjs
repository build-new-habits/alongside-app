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

// ── 2b. WHAT A PERSON READS IS DERIVED, AND ROUNDS UP ───────────────────
console.log("\nTEST 2b - the stated length is derived, hedged, and never short");

// Graeme's call. Class 002's card said 18 while its own sections totalled
// 19, and reconciling those two would have been tidying a number that was
// misleading either way -- that class openly offers stopping after one
// round, so any single exact figure describes a session plenty of people
// will not have.
//
// The class keeps its true total and the sections still have to sum to
// it. What changed is that the true total is no longer what anybody
// reads.

for (const c of all) {
  const label = CONTRACT.durationLabel(c);
  const shown = Number((label.match(/about (\d+) minutes/) || [])[1]);

  ok(`2b. ${c.title}: reads "${label}"`, Number.isFinite(shown),
     "no readable label produced");

  // 🔴 THE DIRECTION IS THE POINT. To the NEAREST five, a 12-minute class
  // reads "about 10 minutes" and somebody with exactly ten minutes starts
  // it and runs over. Over-stating costs a pleasant surprise;
  // under-stating costs the thing they were protecting when they checked.
  ok(`2b. ${c.title}: never reads shorter than it is`,
     shown >= c.durationMins,
     `reads ${shown} for a class that runs ${c.durationMins}. Rounding to ` +
     `the nearest instead of up puts somebody over their own limit`);

  ok(`2b. ${c.title}: and is hedged, not precise`,
     /^about /.test(label),
     "a precise figure on a class whose length depends on what the person " +
     "does is precise and slightly false");
}

// The one place a number cannot carry the meaning: Class 002 is
// meaningfully shorter for anybody who takes the exit it offers.
ok("2b-note. a class whose SHAPE affects its length says so",
   /less if you stop after one round/.test(CONTRACT.durationLabel(
     all.find(c => c.id === "class-steady-round-002"))),
   "Steady Round offers stopping halfway, out loud, in the middle of " +
   "itself. A card reading only 'about 20 minutes' contradicts that");

// ── 2c. THE LIGHTER VARIANT ─────────────────────────────────────────────
console.log("\nTEST 2c - a lighter day gets a shorter class, not a fragment");

// Graeme's decision, 06 Sep: on a not-great day the class serves its
// lighter variant -- "you still get the class you came for" -- and only a
// genuinely-should-not day routes the person out of the room. None of the
// three written classes encoded one and the contract had no field, so a
// fourth written before this would have had one variant of a thing that
// is supposed to have two.

// Every class, not just the ones that happen to have one. Graeme's
// decision covers the format, so a class without a lighter variant has
// nothing to offer on a not-great day except the full thing or the door.
ok("2c-all. every class has a lighter variant",
   all.every(c => c.lighter),
   `missing on: ${all.filter(c => !c.lighter).map(c => c.title).join(", ")}`);

for (const c of all.filter(c => c.lighter)) {
  const light = CONTRACT.sectionsFor(c, { lighter: true });
  const full  = CONTRACT.sectionsFor(c);

  ok(`2c. ${c.title}: the lighter variant is genuinely shorter`,
     light.length < full.length && light.length > 0,
     `${light.length} sections against ${full.length}`);

  // A class that stops rather than ends is not a gentler version of one
  // that ends.
  ok(`2c. ${c.title}: and still ends`,
     light.flatMap(s => s.beats).some(b => b.kind === "closing"),
     "stripped back to its middle - that is a fragment, not a lighter day");

  // 🔴 The label has to be able to TELL THEM APART. Class 004's sections
  // first came to 10.5 minutes, which rounds up to "about 15" -- the same
  // words as its full class, so nothing a person read distinguished them.
  const fullLabel  = CONTRACT.durationLabel(c);
  const lightLabel = CONTRACT.durationLabel({ durationMins: CONTRACT.lighterMinutes(c) });
  ok(`2c. ${c.title}: and reads differently on the card`,
     fullLabel.replace(/ —.*/, "") !== lightLabel,
     `both read "${lightLabel}" — a lighter variant a person cannot tell ` +
     `apart from the full class is one they cannot choose`);
}

ok("2c-pc. positive control: at least one class has a lighter variant",
   all.some(c => c.lighter),
   "none defined, so every assertion above ran zero times");

// ── 2d. LINES THAT ARE ONLY TRUE ON THE FULL DAY ────────────────────────
console.log("\nTEST 2d - the lighter variant does not say untrue things");

// Found by searching every subtraction of Ground's sections: 38 satisfy
// the structural rules, and the best still left "is anything different
// from four minutes ago?" naming a stretch of time the person did not
// have. In a class about whether you can trust what your body reports,
// that is the wrong kind of small error.
//
// lighterVoice is the smallest fix that works: one alternative line on
// one beat. There is still exactly ONE class.

const withAlt = all.flatMap(c =>
  CONTRACT.sectionsFor(c, { lighter: true }).flatMap(sec =>
    sec.beats.filter(b => b.lighterVoice).map(b => ({ c, b }))));

ok("2d-pc. positive control: some beats carry an alternative line",
   withAlt.length > 0,
   "none found - either no class needed one, or sectionsFor is not " +
   "returning the sections that do");

for (const { c, b } of withAlt) {
  ok(`2d. ${c.title}: the alternative is used when lighter`,
     CONTRACT.voiceFor(b, { lighter: true }) === b.lighterVoice &&
     CONTRACT.voiceFor(b) === b.voice,
     "voiceFor did not swap the line, or swapped it on the full day too");
  ok(`2d. ${c.title}: and it actually differs`,
     b.lighterVoice !== b.voice,
     "an alternative identical to the line it replaces is dead weight");
}

// A beat that is OMITTED on a lighter day can never say its alternative.
for (const c of all.filter(c => c.lighter)) {
  const omitted = (c.sections || [])
    .filter(s => (c.lighter.omitSections || []).includes(s.id))
    .flatMap(s => s.beats)
    .filter(b => b.lighterVoice);
  ok(`2d. ${c.title}: no alternative line on an omitted section`,
     omitted.length === 0,
     `${omitted.length} beat(s) carry a lighterVoice in a section the ` +
     `lighter variant does not run - it can never be said`);
}

// ── 2e. A CLASS NOTHING CAN VET MUST SAY WHAT IT INVOLVES ───────────────
console.log("\nTEST 2e - a class the safety filter cannot see declares its own risks");

// CLASS-3. Found by drafting Class 006, the first class that leaves the
// room. classSafety() judges movement beats against the person's
// conditions -- so a class with NO movement beats passes trivially, for
// everybody, in every condition, including somebody who should not be
// walking alone today.
//
// Not a bug in the filter. That class's risks are weather, light,
// traffic and going out alone, none of which belong in an exercise
// library. But a class nothing can vet must at least say what it
// involves, or the person is warned from no direction at all.

const noMovement = all.filter(c =>
  !c.sections.flatMap(s => s.beats).some(b => b.kind === "movement"));

for (const c of noMovement) {
  ok(`2e. ${c.title}: declares flags despite having no movements`,
     Array.isArray(c.flags) && c.flags.length > 0,
     "nothing in this class is visible to classSafety(), and it names no " +
     "risks of its own — so no warning reaches the person from anywhere");
}

// The rule has to be enforceable whether or not such a class exists yet,
// so it is tested directly rather than only on the current set.
const invisible = {
  id: "probe", title: "probe", serves: "being-outside",
  formats: ["mindfulness"], intensityBias: "gentle", durationMins: 1,
  position: "walking", equipment: [], flags: [],
  sections: [{ id: "a", title: "a", durationSeconds: 60,
               beats: [{ kind: "closing", voice: "x" }] }]
};
ok("2e-rule. and the contract refuses one that does not",
   !CONTRACT.validateClass(invisible).ok &&
   CONTRACT.validateClass(invisible).problems.some(p => /invisible to the safety filter/.test(p)),
   "a class with no movements and no flags validated clean");

ok("2e-pos. walking is an allowed position",
   CONTRACT.POSITIONS.includes("walking"),
   "Class 006 is a walk; 'standing' is technically true and useless to " +
   "somebody deciding whether they can do it today");

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
