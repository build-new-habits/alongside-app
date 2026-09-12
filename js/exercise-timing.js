/**
 * js/exercise-timing.js
 * 12 Sep 2026 v2
 *
 * v2 -- TIMER-2. The clock belongs to the exercise, not to lifting.
 *
 *   WHAT WAS WRONG. resolveTiming() returned `duration` whenever it
 *   existed and never looked at `reps`. gym-lat-pulldown carries
 *   duration 240 AND sets 3, reps "10", so in a real gym session Graeme
 *   got a four-minute countdown labelled "Set 1 of 3" -- a label nothing
 *   ever advanced -- which then ended the exercise and dropped him on the
 *   reflection page with two sets still to do. He never saw "10 reps" at
 *   all: that renders in a branch this resolver made unreachable.
 *
 *   GRAEME'S DECISION, 12 Sep. `duration` exists so the COACH can
 *   estimate how long a session takes. It was never how long to lift for.
 *   The card ignores it on a counted exercise; session-builder.js goes on
 *   using it exactly as before, and verify-timer2 test 5 holds that.
 *
 *   THE DATA ALREADY SAID WHICH IS WHICH, which is why nothing new had to
 *   be authored: 440 entries have no reps (clock from duration,
 *   unchanged), 86 are counted reps (no clock), 31 express reps as a time
 *   PER SET (clock from the reps -- side-plank-full says "20 seconds each
 *   side" and was counting its 90-second duration), 3 are a distance.
 *
 *   WHY classifyReps() CHECKS DISTANCE FIRST. "30 metres" starts with a
 *   number and ends with a unit beginning with m. Checked after time, it
 *   reads as thirty minutes.
 *
 *   WHY AN INTERVAL PRESCRIPTION RETURNS NOTHING. "1 minute hard, 90
 *   seconds easy" is not one clock, and a resolver that picks the first
 *   number it can see returns 60 with no sign that it has thrown the rest
 *   away. Eight entries are written this way. They get no clock until
 *   something can time an interval properly.
 *
 * TIME-1. One answer to "does this exercise need a clock, and for how
 * long", shared by every session view.
 *
 * WHAT WAS WRONG. Three views, three unrelated answers:
 *
 *   workout.js            read exercise.duration
 *   prescribed-session.js parsed a duration out of the PRESCRIPTION REPS
 *                         STRING, and read exercise.duration not at all
 *   gym-programme.js      same, with its own copy of the parser
 *
 * So an exercise carrying `duration: 60` got a clock in one view and
 * nothing in another. Same exercise, same data, different answer
 * depending on the route in. The two reps-string parsers had already
 * drifted: gym-programme's handles ranges like "30-45s", prescribed
 * -session's does not, so the same prescription timed in one and not the
 * other.
 *
 * WHAT holdSeconds IS, AND IS NOT. It looked at first like a second,
 * ignored source of truth. It is not. Checked across the database: 15
 * exercises carry both fields and 14 of those "disagree" -- bird-dog
 * holds 3 against a duration of 90, pallof-press 2 against 90, plank 30
 * against 60. They were never measuring the same thing. `duration` is the
 * total time for the exercise; `holdSeconds` is how long to hold each
 * rep. Nothing carries holdSeconds alone.
 *
 * So holdSeconds is COACHING DETAIL, not a clock. It belongs on the card
 * ("hold each one for three seconds"), and driving a session timer from
 * it would have turned a 90-second exercise into a 3-second one. This
 * file deliberately does not read it.
 *
 * PRECEDENCE. The prescription wins over the database, because a physio
 * writing "45s" for this person means 45 seconds for this person. The
 * database duration is the fallback, not the override.
 */

/**
 * Seconds parsed out of a prescription string. One implementation --
 * previously two, which had drifted.
 *
 * Handles "30s", "30 sec", "30 seconds", "2 min", "2 minutes", and the
 * range form "30-45s", where the UPPER bound wins: a range is a target to
 * work toward, and cutting somebody off at the lower bound would end the
 * exercise while they were still doing it.
 */
export function parsePrescribedSeconds(str) {
  if (!str) return null;
  const s = String(str).toLowerCase().trim();

  const range = s.match(/^(\d+)\s*-\s*(\d+)\s*s(?:ec(?:onds?)?)?$/);
  if (range) return parseInt(range[2], 10);

  const sec = s.match(/^(\d+)\s*s(?:ec(?:onds?)?)?$/);
  if (sec) return parseInt(sec[1], 10);

  const min = s.match(/^(\d+)\s*min(?:utes?)?$/);
  if (min) return parseInt(min[1], 10) * 60;

  return null;
}

/**
 * TIMER-2. What KIND of thing does this reps string describe?
 *
 * @param {string|number} reps
 * @returns {"counted"|"timed"|"distance"|"interval"|null}
 *
 *   counted   "10", "12", "10 each side", "each side", "5 segments"
 *   timed     "30 seconds", "45 seconds each side", "2 minutes", "30s"
 *   distance  "20 metres", "30 metres each side"
 *   interval  "1 minute hard, 90 seconds easy"
 *   null      nothing there
 *
 * Order matters: interval before timed (it contains time words), and
 * distance before timed (see the header note on metres and minutes).
 */
export function classifyReps(reps) {
  if (reps === null || reps === undefined) return null;
  const s = String(reps).trim().toLowerCase();
  if (!s) return null;

  if (/\b(hard|easy|fast|slow|sprint|jog|walk)\b/.test(s) && /\d/.test(s)) return "interval";
  if (/\d\s*(m|metre|meter|metres|meters|km|kilometre|kilometres)\b/.test(s)) return "distance";
  if (/\d\s*(s|sec|secs|second|seconds|min|mins|minute|minutes)\b/.test(s)) return "timed";
  return "counted";
}

/**
 * Seconds out of a reps string that describes a time PER SET, tolerating
 * what follows it: "45 seconds each side" is 45 seconds, once, for that
 * side. parsePrescribedSeconds() cannot do this -- it is anchored end to
 * end on purpose, because a prescription that does not parse cleanly
 * should not be half-read.
 */
function _repSeconds(reps) {
  const s = String(reps).trim().toLowerCase();
  const m = s.match(/(\d+)\s*(s|sec|secs|second|seconds|min|mins|minute|minutes)\b/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return /^m/.test(m[2]) ? n * 60 : n;
}

/**
 * Does this exercise need a clock, and for how long?
 *
 * @param {object} exercise            the database entry
 * @param {string} [prescribedReps]    the prescription's reps string, if any
 * @returns {{ seconds: number|null, source: "prescription"|"reps"|"duration"|null, shape: string|null }}
 *
 * seconds === null means no clock, and the view must not invent one.
 * `shape` says WHY, so a view can render sets and reps instead of
 * guessing from the absence of a number.
 */
export function resolveTiming(exercise, prescribedReps) {
  const shape = classifyReps(exercise && exercise.reps);

  // A clinician's prescription still wins over everything -- but only when
  // it is a clean, whole time. gym-programme.js and prescribed-session.js
  // both pass the entry's OWN reps in this argument, so without the shape
  // check below a counted "10" would fall through to duration here and the
  // three views would disagree again, which is the fault TIME-1 ended.
  const fromPrescription = parsePrescribedSeconds(prescribedReps);
  if (fromPrescription !== null && fromPrescription > 0) {
    return { seconds: fromPrescription, source: "prescription", shape: shape || "timed" };
  }

  // TIMER-2. Counted reps, a distance, and an interval prescription all
  // mean: no clock. The exercise still has a `duration`, and the coach
  // still uses it to estimate the session -- it is just not a countdown.
  if (shape === "counted" || shape === "distance" || shape === "interval") {
    return { seconds: null, source: null, shape };
  }

  if (shape === "timed") {
    const n = _repSeconds(exercise.reps);
    if (n !== null && n > 0) return { seconds: n, source: "reps", shape: "timed" };
  }

  const d = exercise && exercise.duration;
  if (typeof d === "number" && d > 0) {
    return { seconds: d, source: "duration", shape: "timed" };
  }

  return { seconds: null, source: null, shape: shape || null };
}

/** m:ss. One implementation; gym-programme and workout each had their own. */
export function formatTime(seconds) {
  const n = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
}
