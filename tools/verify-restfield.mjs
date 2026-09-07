/**
 * tools/verify-restfield.mjs
 * 06 Sep 2026 v1
 *
 * DURATION-STR. `rest` is seconds as a number, and the rest timers run.
 *
 * WHAT WAS WRONG. 99 of 551 library entries carried `rest` as TEXT --
 * "45s", "0s", "90s active" -- against 32 as numbers, with
 * session-builder.js writing a third form ("As needed") on prescribed
 * exercises. The field had no contract, which is why three formats
 * coexisted without anything noticing.
 *
 * core-session.js and yoga-session.js both gated the in-session rest
 * timer on `ex.rest > 0`. **"60s" > 0 is false.** So on any text entry
 * the countdown silently never started -- no timer, no prompt, straight
 * on to the next set, and no error anywhere. That lands hardest on the
 * people relying on the app to hold the pacing for them.
 *
 * THE ITEM THIS REPLACES. The schedule's DURATION-STR described
 * calculateDuration() returning NaN and applyDurationCap() silently
 * returning untrimmed. Both live only inside workoutGenerator.js and are
 * reachable only through generateWorkout(), called only from
 * generateDailyOptions(), which TWO-ENGINE left with zero live callers.
 * That bug is now unreachable code. This gate covers the live fault that
 * was underneath it.
 */

import fs from "node:fs";

const B = new URL("../js/", import.meta.url).href;
const { EXERCISES } = await import(B + "data/exercises/index.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the library actually loaded");
ok("0a. exercises are present", EXERCISES.length > 400,
   `only ${EXERCISES.length} entries - an empty library would pass every ` +
   `"no bad values" assertion below while proving nothing`);
ok("0b. and a meaningful number of them declare a rest",
   EXERCISES.filter(e => e.rest != null).length > 50,
   `${EXERCISES.filter(e => e.rest != null).length} entries declare rest`);

// ── 1. THE VALUE ────────────────────────────────────────────────────────
console.log("\nTEST 1 - rest is a number of seconds, never text");

const nonNumeric = EXERCISES.filter(e => e.rest != null && typeof e.rest !== "number");
ok("1a. no entry carries rest as text", nonNumeric.length === 0,
   `${nonNumeric.length} entries: ` +
   nonNumeric.slice(0, 4).map(e => `${e.id}=${JSON.stringify(e.rest)}`).join(", "));

const nanRest = EXERCISES.filter(e => e.rest != null && !Number.isFinite(e.rest));
ok("1b. and none is NaN or Infinity", nanRest.length === 0,
   nanRest.slice(0, 4).map(e => e.id).join(", "));

const negative = EXERCISES.filter(e => typeof e.rest === "number" && e.rest < 0);
ok("1c. and none is negative", negative.length === 0,
   negative.slice(0, 4).map(e => `${e.id}=${e.rest}`).join(", "));

// A plausibility bound. Seconds mistaken for minutes is the obvious next
// version of this fault, and 45 minutes of rest between sets would pass
// every assertion above.
const absurd = EXERCISES.filter(e => typeof e.rest === "number" && e.rest > 600);
ok("1d. and none is longer than ten minutes", absurd.length === 0,
   `${absurd.length} entries over 600s - minutes entered where seconds were meant?`);

// ── 2. ACTIVE RECOVERY SURVIVED THE MIGRATION ───────────────────────────
console.log("\nTEST 2 - 'active' was moved, not deleted");

const active = EXERCISES.filter(e => e.restStyle === "active");
ok("2a. active-recovery entries still exist", active.length > 0,
   "restStyle is empty. The unit was stripped from '90s active' and the " +
   "coaching content went with it - a silent downgrade on every one of them");

ok("2b. and each still has a rest to be active through",
   active.every(e => typeof e.rest === "number" && e.rest > 0),
   active.filter(e => !(typeof e.rest === "number" && e.rest > 0))
     .map(e => e.id).join(", "));

const badStyle = EXERCISES.filter(e => e.restStyle != null && e.restStyle !== "active");
ok("2c. and restStyle holds nothing the contract does not allow",
   badStyle.length === 0,
   badStyle.slice(0, 4).map(e => `${e.id}=${JSON.stringify(e.restStyle)}`).join(", "));

// ── 3. THE TIMERS ───────────────────────────────────────────────────────
console.log("\nTEST 3 - the rest timers cannot be defeated by a value again");

for (const [label, file, v] of [
  ["3a. core-session", "js/views/core-session.js", "ex"],
  ["3b. yoga-session", "js/views/yoga-session.js", "pose"]
]) {
  const src = fs.readFileSync(file, "utf8");
  ok(`${label} coerces before comparing`,
     /const _rest = Number\(/.test(src) && /Number\.isFinite\(_rest\) && _rest > 0/.test(src),
     `${file} still compares the raw value`);
  ok(`${label} no longer gates on the raw field`,
     !new RegExp(`if \\(${v}\\.rest > 0\\)`).test(src),
     `${file} still contains \`if (${v}.rest > 0)\` - "60s" > 0 is false`);
}

// ── 4. THE DISPLAY ──────────────────────────────────────────────────────
console.log("\nTEST 4 - a number on screen carries its unit");

const gp = fs.readFileSync("js/views/gym-programme.js", "utf8");
ok("4a. rest is rendered through a labeller",
   /_restLabel\(exercise\)/.test(gp),
   "the raw number is printed, so a card reads '45 rest' with no unit. " +
   "The TEXT entries this replaced read correctly by accident, which is why " +
   "nobody caught the numeric ones - the broken half looked right");

ok("4b. and the labeller says 'active' in words",
   /restStyle === "active"/.test(gp) && /active rest/.test(gp),
   "active recovery is stored but never said, which is the same loss as " +
   "deleting it, one layer further on");

// ── 5. THE CONTRACT ─────────────────────────────────────────────────────
console.log("\nTEST 5 - the field is declared, so a fourth format cannot arrive quietly");

const fc = fs.readFileSync("js/data/field-contract.js", "utf8");
ok("5a. exercise.rest is in the field contract", /"exercise\.rest"/.test(fc),
   "three formats coexisted precisely because this field had no contract");
ok("5b. exercise.restStyle is too", /"exercise\.restStyle"/.test(fc));

console.log(fails === 0
  ? "\nDURATION-STR: all assertions pass\n"
  : `\nDURATION-STR: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
