/**
 * js/exercise-timing.js
 * 31 Aug 2026 v1
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
 * Does this exercise need a clock, and for how long?
 *
 * @param {object} exercise            the database entry
 * @param {string} [prescribedReps]    the prescription's reps string, if any
 * @returns {{ seconds: number|null, source: "prescription"|"duration"|null }}
 *
 * seconds === null means reps-based: no clock, and the view should not
 * invent one.
 */
export function resolveTiming(exercise, prescribedReps) {
  const fromPrescription = parsePrescribedSeconds(prescribedReps);
  if (fromPrescription !== null && fromPrescription > 0) {
    return { seconds: fromPrescription, source: "prescription" };
  }

  const d = exercise && exercise.duration;
  if (typeof d === "number" && d > 0) {
    return { seconds: d, source: "duration" };
  }

  return { seconds: null, source: null };
}

/** m:ss. One implementation; gym-programme and workout each had their own. */
export function formatTime(seconds) {
  const n = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
}
