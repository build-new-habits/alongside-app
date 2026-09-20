/**
 * js/data/morning-library-map.js
 * 16 Sep 2026 v1
 *
 * CARD-LOCAL. Morning-programme exercise names, resolved to the library.
 *
 * ── WHY THIS EXISTS ──────────────────────────────────────────────────
 *
 * A morning session showed the exercise name, sets and reps, and a coach
 * note. Every other kind of session also showed how to do the movement,
 * what to watch for on that specific exercise, and how to make it easier
 * or harder. So a morning session gave somebody a movement they might
 * not know and told them nothing about how to do it.
 *
 * That was logged since 13 Sep as a renderer migration -- a tidying job.
 * 🔴 IT WAS NOT. morning-programme.js names its own exercises, with ids
 * like "u1" that mean nothing to the library, so only 93 of 190 resolved
 * by name. Swapping the renderer alone would have given half the
 * movements full guidance and left the other half bare, which on a
 * 06:40 screen is worse than being consistently sparse: you learn to
 * expect help and then it stops.
 *
 * ── WHY IT IS HAND-WRITTEN ───────────────────────────────────────────
 *
 * 🔴 A token-overlap matcher was tried first and offered
 * "Dumbbell Shoulder Press" -> "Press-Up". Those are different
 * movements, and that match would have put press-up instructions on a
 * weight held over somebody's head.
 *
 * ⚫ AUTOMATIC MATCHING IS NOT AVAILABLE HERE. Every alias below is a
 * judgement that two names mean the same movement, and each one is
 * wrong in a way no test can see -- only a reader can. They are written
 * out for that reason.
 *
 * The single biggest cause was vocabulary, not omission: the library
 * says "Press-Up" where the programme says "Push-Up". UK naming.
 */

/**
 * Same movement, different name. Hand-checked, one at a time.
 *
 * 🟠 NOT INCLUDED, DELIBERATELY:
 *   Dumbbell Bench Press -> Dumbbell Floor Press. A bench press and a
 *   floor press are not the same movement -- the floor stops the
 *   shoulder entering the range that makes a bench press a bench press,
 *   which the programme's own coach note says out loud. Left unmatched.
 */
export const MORNING_NAME_ALIASES = {
  "Forearm Plank":                    "Plank",
  "Full Plank":                       "Plank",
  "Side Plank with Reach":            "Side Plank",
  "Glute Bridge Hold":                "Glute Bridge",
  "Kneeling Hip Flexor Stretch":      "Hip Flexor Stretch",
  "Hip Flexor Stretch (kneeling)":    "Hip Flexor Stretch",
  "Chest Opener":                     "Chest Opener \u2014 Arms Behind",
  "Chest Opener (band or arms)":      "Chest Opener \u2014 Arms Behind",
  "Push-Up":                          "Press-Up",
  "Push-Up (full)":                   "Press-Up",
  "Push-Up (box or full)":            "Press-Up",
  "Push-Up to failure":               "Press-Up",
  "Dumbbell Shoulder Press":          "Dumbbell Overhead Press",
  "Dumbbell Shoulder Press (seated)": "Dumbbell Overhead Press",
  "Dumbbell Shoulder Press (standing)": "Dumbbell Overhead Press",
  "Arnold Press":                     "Dumbbell Arnold Press",
  "Cable Lat Pulldown":               "Lat Pulldown",
  "Pallof Press + Hold 3s":           "Pallof Press",
  "Pallof Press + Hold (3s extended)": "Pallof Press",
  "Dead Bug + Dumbbell":              "Dead Bug",
  "Dead Bug + Light Dumbbell (2-4kg in extended hand)": "Dead Bug",
  "Bird Dog + Dumbbell":              "Bird Dog",
  "Bird Dog + Light Dumbbell":        "Bird Dog",
  "Band Row (heavy)":                 "Seated Band Row"
};

/**
 * A parenthetical is a PRESCRIPTION, not a different movement.
 *
 * "Pallof Press (band)", "Dead Bug (5s lower)", "Side Plank (feet
 * stacked)" are all the movement named before the bracket, done a
 * particular way. Stripping it is mechanical and safe, which is exactly
 * what token-overlap matching was not.
 *
 * It cannot invent a match: "Dumbbell Bench Press (with bench)" strips
 * to a name the library does not have, and stays unmatched.
 */
function _stripQualifier(name) {
  return String(name || "").replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

const _norm = s => String(s || "").toLowerCase().trim();

/**
 * The library entry for a morning-programme exercise, or null.
 *
 * ⚫ NULL IS A REAL ANSWER. Supersets ("Arnold Press + Side Plank
 * superset") are two movements, not one, and circuits are neither.
 * Returning the first half would put one movement's instructions on a
 * card describing two. Those keep the local card, which is honest about
 * showing less.
 */
export function libraryExerciseFor(morningExercise, EXERCISES) {
  const name = morningExercise && morningExercise.name;
  if (!name) return null;

  const byName = new Map(EXERCISES.map(e => [_norm(e.name), e]));

  const direct = byName.get(_norm(name));
  if (direct) return direct;

  const alias = MORNING_NAME_ALIASES[name];
  if (alias) {
    const hit = byName.get(_norm(alias));
    if (hit) return hit;
  }

  const stripped = _stripQualifier(name);
  if (stripped !== name) {
    const bare = byName.get(_norm(stripped));
    if (bare) return bare;
    const strippedAlias = MORNING_NAME_ALIASES[stripped];
    if (strippedAlias) {
      const hit = byName.get(_norm(strippedAlias));
      if (hit) return hit;
    }
  }

  return null;
}

/**
 * 🟠 STILL ABSENT FROM THE LIBRARY, for the content session with the clinical reviewer.
 *
 * These are movements the programme prescribes and the library does not
 * describe. They are not naming problems and must not be aliased to
 * something adjacent -- that is how a bench press becomes a floor press.
 *
 * Listed here rather than in a document so the gate can print them and
 * they cannot go quiet.
 */
export const MORNING_MISSING_FROM_LIBRARY = [
  "Bear Hold",
  "Hammer Curl",
  "EZ Bar Curl",
  // Written as an either/or in the programme -- "EZ Bar or Cable Curl".
  // Listed separately because that exact string is what appears on the
  // screen, and the gate matches on what appears.
  "EZ Bar or Cable Curl",
  "Cable Curl",
  "Dumbbell Bench Press",
  "Plank to Push-Up",
  "Tricep Dips",
  "Front Raise",
  "Lateral Raise"
];
