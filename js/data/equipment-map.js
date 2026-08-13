/**
 * data/equipment-map.js
 * 12 Aug 2026 v2
 *
 * v2 - EQUIP-3. The session equipment screen's own vocabulary added. CON-2
 *   reconciled two vocabularies and wired the resolver into exercise
 *   selection; the "Equipment today" screen has a third and consulted
 *   neither. Five of its fifteen options could ever be ticked.
 *
 * 11 Aug 2026 v1
 *
 * CON-2 — equipment vocabulary resolver.
 *
 * THE PROBLEM THIS SOLVES
 *
 * equipment.js offers the user 66 granular ids to tick during onboarding:
 * "dumbbells-medium", "band-heavy", "bench-adjustable", "kettlebell-light".
 * Exercises in the database are tagged with 22 coarse capability ids:
 * "dumbbell", "resistance-band", "bench", "kettlebell".
 *
 * Fourteen of those 22 exercise tags have no counterpart in the vocabulary
 * at all. Both equipment filters compare with:
 *
 *     exercise.equipment.every(item => userEquipment.includes(item))
 *
 * so an exercise requiring "dumbbell" could never match a user who owns
 * "dumbbells-medium". Measured on 11 Aug 2026: 92 of the 124
 * equipment-requiring exercises (74%) were unreachable on every route, for
 * every user, regardless of what they actually owned. Disproportionately the
 * dumbbell, kettlebell, band and bench work — which is why a gym session
 * came back as floor exercises.
 *
 * THE APPROACH
 *
 * Neither vocabulary is wrong, so neither is discarded. The granular ticks
 * carry real information we want later for load guidance ("light dumbbells"
 * is not "heavy dumbbells"). The coarse exercise tags are correct too: a
 * goblet squat needs a dumbbell, and does not care which one.
 *
 * So this file maps granular -> coarse and the filters resolve the user's
 * ticked set through it before comparing. Nothing is re-tagged, no stored
 * user data migrates, and granularity is preserved for CON-3's `load` field.
 *
 * A user's resolved set is the union of their literal ticks and every
 * capability those ticks imply, so ids that already match on both sides
 * (barbell, foam-roller, swimming-pool, rowing-machine) keep working
 * untouched.
 *
 * MAINTENANCE
 *
 * When a new id is added to equipment.js, add it here if it implies a coarse
 * capability. When a new coarse tag is used on an exercise, add the
 * vocabulary ids that should satisfy it. assertVocabularyCoverage() below
 * exists to catch the omission rather than letting it fail silently, which
 * is exactly how the original mismatch survived unnoticed.
 */

/**
 * Granular vocabulary id (as ticked in equipment.js)
 *   -> coarse capability tags it satisfies (as used on exercises).
 *
 * One tick may imply several capabilities. Anything not listed here resolves
 * to itself only.
 */
export const EQUIPMENT_IMPLIES = {
  // ── EQUIP-3, 12 Aug 2026. The SESSION SCREEN's vocabulary ─────────────
  //
  // Graeme, after two failed attempts at this: "If I have stated that I
  // have equipment then it needs to register that I have it. That's
  // simple." He was right that it was not a copy problem, and I had
  // patched the copy twice without touching the cause.
  //
  // CON-2 built this map to reconcile TWO vocabularies -- the granular
  // ids Settings saves, and the coarse tags the exercise database uses --
  // and wired it into exercise selection, where it works.
  //
  // There is a THIRD. session-builder-ui.js's "Equipment today" screen
  // offers its own plural ids (dumbbells, kettlebells, bike,
  // cross-trainer) which appear in neither of the other two. Measured: of
  // its 15 options, FIVE could ever be ticked from a saved list, and
  // those five matched by coincidence of spelling. Graeme selected a full
  // gym and saw Barbell, Pull-up bar and Foam roller -- exactly the
  // coincidences.
  //
  // Added here rather than in a new file: a second map is how a fourth
  // vocabulary starts.
  "dumbbells":        ["dumbbell"],
  "kettlebells":      ["kettlebell"],
  "resistance-bands": ["resistance-band"],
  "bike":             ["exercise-bike"],
  "stationary-bike":  ["exercise-bike"],
  "cross-trainer":    ["elliptical"],
  "box-or-step":      ["plyo-box"],

  // ── Weights ────────────────────────────────────────────────────────────
  "dumbbells-light":      ["dumbbell"],
  "dumbbells-medium":     ["dumbbell"],
  "dumbbells-heavy":      ["dumbbell"],
  "adjustable-dumbbells": ["dumbbell"],
  "kettlebell-light":     ["kettlebell"],
  "kettlebell-medium":    ["kettlebell"],
  "kettlebell-heavy":     ["kettlebell"],
  "barbell":              ["barbell"],
  "ez-curl-bar":          ["barbell"],
  "medicine-ball":        ["medicine-ball"],
  "cable-machine":        ["cable-machine"],
  "leg-press-machine":    ["leg-press-machine"],
  "leg-curl-machine":     ["leg-curl-machine"],
  "chest-press-machine":  ["chest-press-machine"],
  "slam-ball":            ["medicine-ball"],

  // ── Bands ──────────────────────────────────────────────────────────────
  // Therapy bands are flat rehabilitation bands. They genuinely substitute
  // for a resistance band in the low-load rehabilitation work that uses
  // this tag, so they are included deliberately rather than by oversight.
  "band-light":    ["resistance-band"],
  "band-medium":   ["resistance-band"],
  "band-heavy":    ["resistance-band"],
  "mini-bands":    ["resistance-band"],
  "therapy-band":  ["resistance-band"],

  // ── Cardio ─────────────────────────────────────────────────────────────
  "exercise-bike":  ["exercise-bike", "bicycle"],
  "outdoor-bike":   ["bicycle"],
  "air-bike":       ["exercise-bike", "bicycle"],
  "rowing-machine": ["rowing-machine"],
  "treadmill":      ["treadmill"],
  "elliptical":     ["elliptical"],
  "stair-climber":  ["stair-climber"],
  "ski-erg":        ["ski-erg"],
  "skipping-rope":  ["skipping-rope", "jump-rope"],

  // ── Home ───────────────────────────────────────────────────────────────
  "bench-flat":       ["bench"],
  "bench-adjustable": ["bench"],
  "plyo-box":         ["bench"],
  "step-platform":    ["bench", "step-platform"],
  "ab-wheel":         ["ab-wheel"],
  "pull-up-bar":      ["pull-up-bar"],
  "pull-up-assist":   ["pull-up-bar"],
  "dip-station":      ["dip-station"],
  "parallettes":      ["dip-station"],
  "gymnastic-rings":  ["gymnastic-rings", "trx"],
  "stability-ball":   ["stability-ball"],
  "sit-up-frame":     ["bench"],   // a decline sit-up frame IS a bench for our purposes
  "ankle-weights":    ["ankle-weights"],
  "weighted-vest":    ["weighted-vest"],
  "plyo-box":         ["plyo-box", "bench"],
  "bosu-ball":        ["bosu-ball", "balance-board"],
  "balance-board":    ["balance-board"],
  "wobble-cushion":   ["balance-board"],
  // yoga-mat is deliberately never required by any exercise: a mat is
  // comfort, not kit, and gating floor work behind owning one would
  // exclude somebody for the sake of a tidy audit. Graeme's call,
  // 11 Aug 2026 — "accept it as a comfort item".
  //
  // climbing-wall was removed from equipment.js entirely the same day.
  // It appeared once, was used by nothing, and is a sport rather than a
  // piece of equipment. A list that offers things the product cannot use
  // teaches people the list is decorative.
  //
  // Aliases added 11 Aug 2026. All three are unstable surfaces asking the
  // same thing of the ankle; writing separate content for each would be
  // three ways of saying "stand on something that moves".
  "balance-pad":      ["balance-board"],
  "indo-board":       ["balance-board"],
  "slackline":        ["balance-board"],

  // ── Recovery ───────────────────────────────────────────────────────────
  "foam-roller":     ["foam-roller"],
  "lacrosse-ball":   ["massage-ball"],
  "peanut-ball":     ["massage-ball"],
  "massage-gun":         ["massage-ball"],
  "percussion-massager": ["massage-ball"],
  "yoga-wheel":          ["foam-roller"],
  "stretching-strap":    ["stretching-strap"],
  "yoga-blocks":         ["yoga-blocks"],

  // ── Functional ─────────────────────────────────────────────────────────
  "trx":            ["trx"],
  "battle-ropes":   ["battle-ropes"],
  "sled":           ["sled"],
  "punching-bag":   ["punching-bag"],
  "speed-bag":      ["punching-bag"],
  "boxing-gloves":  ["punching-bag"],
  "sandbag":        ["sandbag"],
  "landmine":       ["landmine", "barbell"],

  // ── Facility ───────────────────────────────────────────────────────────
  // A gym membership implies the fixed kit a commercial gym reliably has.
  // Deliberately conservative: it does not imply a swimming pool, since
  // plenty of gyms have none, and that is offered as its own tick.
  "gym-membership": [
    "dumbbell",
    "kettlebell",
    "barbell",
    "squat-rack",
    "bench",
    "medicine-ball",
    "resistance-band",
    "rowing-machine",
    "exercise-bike",
    "bicycle",
    "foam-roller",
    // Added 11 Aug 2026 (CON-4). A commercial gym reliably has a cable
    // machine and the fixed-resistance wall. Deliberately conservative:
    // ski erg, sled, battle ropes, TRX and balance kit are NOT implied,
    // because plenty of ordinary gyms have none of them and a person who
    // has one can tick it directly.
    "cable-machine",
    "leg-press-machine",
    "leg-curl-machine",
    "chest-press-machine",
    "treadmill",
    "elliptical",
    "stair-climber",
    "plyo-box"
  ],
  "swimming-pool":  ["swimming-pool", "kickboard", "pull-buoy"],
  "sauna-steam":    ["sauna"],

  "outdoor-track":  ["agility-cones"],
  "fitness-studio": ["yoga-mat", "foam-roller", "resistance-band"]
};

/**
 * Coarse tags used on exercises that no vocabulary id can currently satisfy.
 *
 * These are genuine gaps rather than mapping errors: the user is never
 * offered a way to say they own them, so exercises requiring them stay
 * unreachable. Listed explicitly so they are visible rather than silently
 * absent, and so assertVocabularyCoverage() does not report them as
 * regressions.
 *
 * Resolution is a content decision, not a code one: either add the item to
 * equipment.js, or re-tag the small number of exercises that need it.
 * Logged for CON-4, not fixed here (touch-once).
 */
export const UNSATISFIABLE_TAGS = [
  "agility-ladder",
  "reaction-ball",
  "nordic-walking-poles"
];

/**
 * Expand a user's ticked equipment into the full set of capability tags
 * those ticks satisfy.
 *
 * Always returns a Set containing the original ids as well as everything
 * they imply, so ids that match on both sides continue to work.
 *
 * @param {string[]} userEquipment — ids as ticked in equipment.js
 * @returns {Set<string>} resolved capability set
 */
export function resolveEquipment(userEquipment) {
  const resolved = new Set();
  if (!Array.isArray(userEquipment)) return resolved;

  for (const id of userEquipment) {
    if (typeof id !== "string" || id.length === 0) continue;
    resolved.add(id);
    const implied = EQUIPMENT_IMPLIES[id];
    if (implied) {
      for (const tag of implied) resolved.add(tag);
    }
  }
  return resolved;
}

/**
 * Does a resolved capability set satisfy everything an exercise requires?
 *
 * Bodyweight exercises (no equipment, or an empty array) always pass, which
 * matches the behaviour of both filters before this change.
 *
 * @param {Object} exercise      — an exercise entry
 * @param {Set<string>} resolved — output of resolveEquipment()
 * @returns {boolean}
 */
export function exerciseIsAvailable(exercise, resolved) {
  const required = exercise?.equipment;
  if (!required || required.length === 0) return true;
  return required.every(tag => resolved.has(tag));
}

/**
 * Development guard. Returns every coarse tag used by the supplied exercise
 * pool that no vocabulary id can satisfy and that is not already recorded in
 * UNSATISFIABLE_TAGS.
 *
 * An empty array means the two vocabularies agree. A non-empty one means a
 * tag has been introduced on an exercise without a corresponding way for the
 * user to say they own it — the exact condition that made 92 exercises
 * unreachable, undetected, for months.
 *
 * Not called at runtime. Intended for build-time assertion and audits.
 *
 * @param {Object[]} exercises — the exercise pool to check
 * @returns {string[]} unsatisfiable tags not already known about
 */
export function assertVocabularyCoverage(exercises) {
  const satisfiable = new Set();
  for (const implied of Object.values(EQUIPMENT_IMPLIES)) {
    for (const tag of implied) satisfiable.add(tag);
  }

  const known = new Set(UNSATISFIABLE_TAGS);
  const missing = new Set();

  for (const exercise of exercises || []) {
    for (const tag of exercise?.equipment || []) {
      if (!satisfiable.has(tag) && !known.has(tag)) missing.add(tag);
    }
  }
  return Array.from(missing).sort();
}
