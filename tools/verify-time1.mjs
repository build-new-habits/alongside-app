/**
 * tools/verify-time1.mjs
 * 31 Aug 2026 v1
 *
 * Gate for TIME-1.
 *
 * The fault this closes was invisible from inside any one view. Each of
 * the three looked correct on its own; the bug only existed in the
 * difference between them, which is why nothing caught it for months.
 * So most of what follows asserts that there is ONE answer, not that any
 * particular answer is right.
 *
 * The holdSeconds assertion is the one to keep. It looked like a second
 * source of truth and it is not: `duration` is the total time for the
 * exercise, `holdSeconds` is how long to hold each rep. bird-dog holds 3
 * against a duration of 90. Driving a timer from holdSeconds would have
 * turned a 90-second exercise into a 3-second one, and it would have
 * looked like a tidy-up.
 *
 * NO NEGATIVE DISTANCE WINDOWS.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const VIEWS = ["js/views/workout.js", "js/views/prescribed-session.js", "js/views/gym-programme.js"];
const { resolveTiming, parsePrescribedSeconds, formatTime } = await import("../js/exercise-timing.js");

console.log("\nTEST 1 - one resolver, no local copies");

for (const f of VIEWS) {
  const src = strip(fs.readFileSync(f, "utf8"));
  check(f + " uses the shared resolver", () => {
    ok(src.includes("resolveTiming("), "does not call resolveTiming");
  });
  check(f + " has no local duration parser", () => {
    ok(!/function\s+parseHoldSeconds/.test(src), "still defines its own parseHoldSeconds");
    ok(!/function\s+formatTime/.test(src), "still defines its own formatTime");
  });
}

check("no view reads exercise.duration directly for timing", () => {
  for (const f of VIEWS) {
    const src = strip(fs.readFileSync(f, "utf8"));
    ok(!/if\s*\(\s*exercise\.duration\s*\)/.test(src),
       f + " branches on exercise.duration directly, bypassing the resolver");
  }
});

console.log("\nTEST 2 - the resolver's contract");

check("prescription wins over the database duration", () => {
  ok(resolveTiming({ duration: 60 }, "45s").seconds === 45,
     "database duration overrode the prescription; a physio writing 45s for this person must win");
});

check("database duration is used when there is no prescribed time", () => {
  ok(resolveTiming({ duration: 90 }).seconds === 90, "duration ignored - this was the original bug");
});

check("a reps-based exercise gets no clock", () => {
  ok(resolveTiming({ reps: "15" }, "15 reps").seconds === null, "invented a timer for a reps exercise");
});

check("ranges resolve to the upper bound", () => {
  ok(parsePrescribedSeconds("30-45s") === 45,
     "range not handled, or lower bound used - cutting somebody off at the lower bound ends the exercise while they are still doing it");
});

console.log("\nTEST 3 - holdSeconds is never a clock");

check("holdSeconds alone produces no timer", () => {
  ok(resolveTiming({ holdSeconds: 30 }).seconds === null,
     "holdSeconds drove a timer; it is the per-rep hold, not the exercise length");
});

check("bird-dog runs for 90 seconds, not 3", () => {
  ok(resolveTiming({ duration: 90, holdSeconds: 3 }).seconds === 90,
     "holdSeconds beat duration - a 90 second exercise would end after 3 seconds");
});

check("the resolver never reads holdSeconds at all", () => {
  const src = strip(fs.readFileSync("js/exercise-timing.js", "utf8"));
  ok(!src.includes("holdSeconds"), "exercise-timing.js references holdSeconds; it must not");
});

console.log("\nTEST 4 - formatting");

check("m:ss, zero padded", () => {
  ok(formatTime(90) === "1:30", "got " + formatTime(90));
  ok(formatTime(5) === "0:05", "got " + formatTime(5));
  ok(formatTime(null) === "0:00", "null should floor to 0:00, got " + formatTime(null));
});

console.log(fails ? `\n${fails} FAILED\n` : "\nALL PASS\n");
process.exit(fails ? 1 : 0);
