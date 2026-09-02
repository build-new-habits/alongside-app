/**
 * js/data/stretch-goal-zones.js
 * 31 Aug 2026 v1
 *
 * ARC-1. Which body zones a goal leans towards.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  PROVISIONAL. This mapping is OURS, not a clinician's.
 * ─────────────────────────────────────────────────────────────────────
 *
 * A brief went to a physiotherapist on 31 Aug asking exactly this
 * question. She has not answered yet, and has asked not to be named in
 * anything, so whatever comes back will be informal input rather than
 * clinical review. Until then every row here is our own reasoning, and
 * the product must not imply otherwise anywhere it is surfaced.
 *
 * THE WHOLE FILE EXISTS SO IT CAN BE THROWN AWAY. It is data with no
 * logic in it, and nothing outside it holds an opinion about which zones
 * suit which goal -- verify-arc1.mjs asserts that. Replacing it when the
 * answers arrive is an edit to this file and a version bump, not a
 * rebuild. If the answers never arrive, this ships as-is and is honest
 * about being ours.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  THE SAFETY LINE, AND WHY A PROVISIONAL MAP IS SAFE TO SHIP
 * ─────────────────────────────────────────────────────────────────────
 *
 * This map may only EMPHASISE. It orders candidates, exactly as ZONE-1's
 * picker does. It cannot:
 *
 *   - unlock an exercise a condition has ruled out
 *   - reach into an area someone has reported as sore
 *   - soften or bypass the pain-8 gate
 *   - add an exercise the difficulty ceiling excluded
 *
 * Every one of those filters runs before this is consulted. So the worst
 * a WRONG row here can do is produce a less useful session. It cannot
 * produce an unsafe one. That is the property that makes shipping our own
 * guesses defensible rather than reckless, and it is the property to
 * check first if this file is ever given more power.
 *
 * Zone ids come from STRETCH_ZONES in session-builder.js. A zone listed
 * here that has no content yet is harmless -- zonesWithCoverage() hides
 * it, and the emphasis simply finds nothing to promote.
 */

/**
 * @type {{ provisional: boolean, sourcedFrom: string, goals: Object.<string, string[]> }}
 */
export const STRETCH_GOAL_ZONES = {
  // Read by the UI so the coach never claims clinical backing it lacks.
  provisional: true,
  sourcedFrom: "Build New Habits, 31 Aug 2026. Not clinically reviewed.",

  goals: {
    // ── Running and cardio ───────────────────────────────────────────
    // Running loads the posterior chain and the calf-ankle complex hard,
    // and hip flexors shorten under repeated stride. Ankles matter more
    // than people expect: limited dorsiflexion changes how the whole leg
    // lands.
    "start-running":      ["calves-ankles", "hamstrings", "hips", "quads"],
    "run-5k":             ["calves-ankles", "hamstrings", "hips", "glutes"],
    "run-10k":            ["calves-ankles", "hamstrings", "hips", "glutes"],

    // Cycling holds a closed hip angle and a rounded upper back for long
    // stretches, so the front of the hip and the thoracic spine are where
    // it accumulates.
    "cycling":           ["hips", "quads", "upper-back", "neck-shoulders"],

    // Swimming is a shoulder sport before it is anything else.
    "swimming":          ["neck-shoulders", "upper-back", "hips"],

    // ── Mobility, flexibility and recovery ───────────────────────────
    // Deliberately broad. Somebody asking to be more flexible has not
    // told us where, and picking for them would be guessing twice.
    "flexibility":         ["hips", "hamstrings", "upper-back", "neck-shoulders", "glutes"],

    // Balance is ankle-led. Restricted ankles remove the first strategy
    // the body reaches for when it is tipped.
    "balance":            ["calves-ankles", "hips", "glutes"],

    // Posture: the front that has shortened and the back that has been
    // held long. Chest belongs here and has no content yet -- listed
    // anyway, so the day it clears the floor this row starts working.
    "improve-posture":    ["upper-back", "neck-shoulders", "chest", "hips"],

    // ── Getting back to it, and daily life ───────────────────────────
    // Graeme's example, 31 Aug: getting up and down from the floor. Hips,
    // ankles and thoracic rotation are what that actually asks for.
    "return-to-fitness":  ["hips", "calves-ankles", "upper-back"],
    "return-after-illness": ["hips", "upper-back", "neck-shoulders"],
    "move-more":          ["hips", "upper-back", "hamstrings"],

    // ── Strength ─────────────────────────────────────────────────────
    // Lifting shortens hip flexors and loads the thoracic spine; the
    // shoulders take the overhead work.
    "get-stronger":       ["hips", "upper-back", "neck-shoulders", "hamstrings"],
    "build-muscle":       ["hips", "upper-back", "neck-shoulders", "hamstrings"],

    // ── Feeling better ───────────────────────────────────────────────
    // Not anatomy. These are where people tend to hold tension, and the
    // rows most likely to be wrong -- flagged as the first to check when
    // the answers come back.
    "sleep-better":       ["neck-shoulders", "upper-back", "hips"],
    "reduce-stress":      ["neck-shoulders", "upper-back"],
    "improve-mood":       ["upper-back", "neck-shoulders"],
    "more-energy":        ["hips", "upper-back"],

    // ── Pain and injury ──────────────────────────────────────────────
    // The rows that most need a clinician's eye, and the ones where a
    // wrong answer matters most. Kept broad and gentle rather than
    // targeted: guessing at the site of somebody's pain is exactly the
    // guess we should not make.
    "reduce-pain":        ["hips", "upper-back", "neck-shoulders"],
    "injury-recovery":    ["hips", "upper-back"],
    "prevent-injury":     ["hips", "hamstrings", "calves-ankles", "neck-shoulders"],
    "feel-better":        ["hips", "upper-back", "neck-shoulders"],
  },
};

/**
 * Zones a goal leans towards, or [] when we have no view. An unknown goal
 * returning [] is correct and not a failure: the session simply is not
 * zone-led, which is what every stretch session did before ARC-1.
 */
export function zonesForGoal(goalId) {
  if (!goalId) return [];
  return STRETCH_GOAL_ZONES.goals[goalId] || [];
}
