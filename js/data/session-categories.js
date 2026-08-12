/**
 * data/session-categories.js
 * 11 Aug 2026 v4
 *
 * v4 - EQ-1. New "balance-work" and "power" categories. Balance content
 *   was reachable by no session type at all; jumps, throws and skipping
 *   only through Cardio.
 *
 * 11 Aug 2026 v2
 *
 * v2 - New "loaded-carry" category. All six carry exercises were
 *   unreachable: nothing selected movementPattern "carry".
 *
 * 11 Aug 2026 v1
 *
 * CON-6 — maps the session builder's category vocabulary onto the main
 * exercise database, so the builder can select from all 461 entries instead
 * of the 70-entry private pool it carried inside session-builder.js.
 *
 * THE PROBLEM THIS SOLVES
 *
 * session-builder.js held its own EXERCISE_POOL: 70 hardcoded entries, of
 * which 61 were still authored in the retired description/cues shape and
 * rendered as a name and a set count and nothing else. Meanwhile the main
 * database held 461 entries with instructions, why and coaching at 100% —
 * including 139 practice entries and the entire yoga library — none of which
 * the session builder could ever reach.
 *
 * The pool was also the reason several fixes had to be made twice. The
 * difficulty ceiling (PT-11), the equipment vocabulary (CON-2) and the
 * cardio-warmup tags (PT-19) were each fixed in the shared filters first and
 * then again here, and each time the second fix was found only after
 * somebody hit the bug in the live product.
 *
 * WHY A MAPPING RATHER THAN RE-TAGGING
 *
 * The builder selects on 39 fine-grained categories — "hip-hinge",
 * "horizontal-push", "anti-rotation", "cardio-warmup". The main database
 * does not carry those, but it does carry `movementPattern` on all 461
 * entries, plus `category`, `contentType` and `affectsAreas`. Almost every
 * builder category is expressible as a query over those.
 *
 * Re-tagging 461 entries with a second, parallel category vocabulary would
 * have created exactly the duplication this whole task exists to remove: two
 * tagging systems, both needing maintenance, drifting apart silently. A
 * mapping keeps one source of truth for the data and one place to adjust how
 * the builder reads it.
 *
 * SECTION IS CONTEXTUAL, NOT INTRINSIC
 *
 * The pool stored section ("warmup" | "main" | "cooldown") on each entry.
 * That was never really a property of the exercise — a hip mobility drill is
 * a warm-up in a Lower Body session and main content in a Mobility session,
 * and the pool duplicated entries to express that. Section now comes from
 * which list in SESSION_TYPES the category appears in, and a difficulty
 * ceiling is applied to warm-ups so nothing strenuous can land there.
 */

/**
 * Each builder category maps to a predicate over a main-database entry.
 *
 * Predicates are deliberately readable rather than clever: someone adding a
 * category later should be able to see exactly what it will select without
 * running anything.
 */
const has = (ex, area) => (ex.affectsAreas || []).includes(area);
const pattern = (ex, ...values) => values.includes(ex.movementPattern);

export const CATEGORY_MATCHERS = {

  // ── Warm-up categories ──────────────────────────────────────────────────

  // Anything that raises the heart rate gently. Machines and bodyweight both.
  //
  // DURATION CEILING is the load-bearing part. Without it the first coverage
  // run returned "Easy Row - 20 Minutes", "Easy Spin - 30 Minutes" and a
  // C25K session as warm-up candidates -- all genuinely gentle cardio, all
  // complete sessions in their own right. A warm-up that takes thirty
  // minutes is not a warm-up. Six minutes is the ceiling: enough for a full
  // five-minute machine warm-up, not enough for anything that is really the
  // session itself.
  "cardio-warmup": ex =>
    ex.category === "cardio" &&
    (ex.duration || 0) > 0 && (ex.duration || 0) <= 360 &&
    (ex.energyRequired || 5) <= 5 &&
    (ex.difficultyLevel || 5) <= 4,

  // Waking a muscle up before loading it, rather than stretching it.
  "activation": ex =>
    ex.contentType === "activation" ||
    pattern(ex, "scapular-activation", "hip-abduction", "isometric"),

  "hip-mobility": ex =>
    (pattern(ex, "hip-rotation", "hip-flexion", "hip-extension", "hip-abduction") ||
     (ex.category === "mobility" && (has(ex, "hip") || has(ex, "hip-flexor")))),

  "thoracic-mobility": ex =>
    ex.category === "mobility" &&
    (has(ex, "thoracic") || has(ex, "upper-back") || pattern(ex, "spinal-rotation")),

  "ankle-mobility": ex =>
    pattern(ex, "ankle-mobility", "calf-raise") ||
    (ex.category === "mobility" && has(ex, "ankle-foot")),

  "shoulder-warmup": ex =>
    ex.category === "mobility" &&
    (has(ex, "shoulder") || has(ex, "rotator-cuff") || pattern(ex, "shoulder-rotation")),

  "band-warmup": ex =>
    (ex.equipment || []).includes("resistance-band") &&
    (ex.difficultyLevel || 5) <= 4,

  // Narrowed 11 Aug 2026 (RAT-1). This matched every breath and
  // breath-awareness practice, which meant meditation and body-scan work
  // qualified as a MOBILITY WARM-UP. A 76-year-old's session opened with
  // five of them. Capping category dominance cut it to three, which was
  // still three: the category itself was wrong, not just its share.
  //
  // A warm-up breath is short and preparatory. A twenty-minute breath
  // awareness meditation is a practice in its own right and belongs in a
  // Quiet session, not at the top of a mobility routine.
  "breathing-warmup": ex =>
    pattern(ex, "breath") &&
    (ex.duration || 0) <= 300 &&
    !/meditation|noting|awareness|scan/i.test(ex.name),

  "cat-cow": ex =>
    pattern(ex, "spinal-flexion-extension"),

  "lower-mobility": ex =>
    ex.category === "mobility" &&
    (has(ex, "hip") || has(ex, "hamstring") || has(ex, "quadriceps") || has(ex, "calves")),

  // ── Main categories ─────────────────────────────────────────────────────

  "hip-hinge":        ex => pattern(ex, "hinge"),
  "squat-pattern":    ex => pattern(ex, "squat"),
  "single-leg":       ex => pattern(ex, "lunge") ||
                            (pattern(ex, "squat", "hinge") && has(ex, "knee")),
  "bridge":           ex => pattern(ex, "hip-extension") ||
                            (pattern(ex, "isometric") && has(ex, "glutes")),
  "glute-isolation":  ex => has(ex, "glutes") &&
                            pattern(ex, "hip-abduction", "hip-extension", "isometric"),
  "leg-isolation":    ex => pattern(ex, "calf-raise") ||
                            (has(ex, "quadriceps") && pattern(ex, "isometric")),

  // Chest-led pressing. An earlier version excluded anything listing
  // "shoulder", which removed nearly every press: chest presses all name the
  // shoulder as a secondary area. Selecting ON the chest rather than
  // against the shoulder is what actually separates the two patterns.
  "horizontal-push":  ex => pattern(ex, "push") && has(ex, "chest-pecs"),
  "horizontal-pull":  ex => pattern(ex, "pull") && has(ex, "upper-back"),
  "vertical-pull":    ex => pattern(ex, "pull") && has(ex, "shoulder") &&
                            has(ex, "upper-back"),
  "shoulder-isolation": ex => has(ex, "shoulder") &&
                              pattern(ex, "push", "pull", "shoulder-rotation"),

  "anti-extension":   ex => pattern(ex, "anti-extension"),
  "anti-rotation":    ex => pattern(ex, "anti-rotation"),
  "anti-lateral":     ex => pattern(ex, "anti-lateral-flexion"),
  "core-stability":   ex => pattern(ex, "anti-extension", "anti-rotation",
                                    "anti-lateral-flexion") ||
                            (has(ex, "abdominals") && pattern(ex, "isometric")),

  // Added 11 Aug 2026 (CAP-3). All six carry exercises in the database
  // were unreachable: no category matcher selected movementPattern
  // "carry", so farmer's carries, suitcase carries and overhead carries
  // could never appear in any session. Found while implementing the
  // maintenance intent tilt, which prioritises exactly this pattern
  // because grip strength predicts independence better than almost
  // anything else we measure.
  // EQ-1 (11 Aug 2026). Two categories added after tracing a home user's
  // own equipment list against the engine.
  //
  // "balance-work" existed as content and as a tickable balance board,
  // and NO session type routed to it -- so somebody could tell the app
  // they owned a balance board and it would never once appear. The fifth
  // instance today of content that exists and nothing can select.
  //
  // "power" covers jumps, throws and skipping. It was reachable only
  // through a Cardio session, which meant a jump box and a skipping rope
  // were nearly as orphaned. Power is the quality that fades before
  // strength does, so it deserves a route into ordinary sessions rather
  // than only the one somebody picks when they want to get out of breath.
  //
  // Both respect the impact and balance gates, which are applied
  // downstream in _filterCandidates -- a category existing does not
  // override what somebody has told us they cannot do.
  "balance-work":     ex => ex.movementPattern === "balance" ||
                            ex.movementPattern === "proprioception" ||
                            ex.balanceDemand === true,

  "power":            ex => ex.movementPattern === "jump" ||
                            (ex.impact === true && (ex.difficultyLevel || 1) >= 3) ||
                            ((ex.equipment || []).includes("medicine-ball") &&
                             /throw|slam|pass/i.test(ex.name)),

  "loaded-carry":     ex => ex.movementPattern === "carry",

  "conditioning":     ex => ex.category === "cardio" && (ex.energyRequired || 5) >= 5,
  "interval":         ex => ex.category === "cardio" && (ex.energyRequired || 5) >= 6,

  "shoulder-mobility": ex => ex.category === "mobility" &&
                             (has(ex, "shoulder") || has(ex, "rotator-cuff")),

  // ── Cool-down categories ────────────────────────────────────────────────

  "static-stretch":      ex => pattern(ex, "stretch"),
  "deep-stretch":        ex => pattern(ex, "stretch", "yoga-pose"),
  "hip-flexor-stretch":  ex => pattern(ex, "stretch") && has(ex, "hip-flexor"),
  "hamstring-stretch":   ex => pattern(ex, "stretch") && has(ex, "hamstring"),
  // Both matched nothing on the first coverage run. The glute and piriformis
  // stretches in the database (pigeon, 90-90, seated figure-4) carry
  // movementPattern "hip-rotation" rather than "stretch" — reasonably, since
  // that is what they are. Matching on the area plus either pattern.
  "glute-stretch":       ex => pattern(ex, "stretch", "hip-rotation", "yoga-pose") &&
                               (has(ex, "glutes") || has(ex, "piriformis")),
  "figure-4":            ex => pattern(ex, "stretch", "hip-rotation") &&
                               has(ex, "piriformis"),
  "chest-stretch":       ex => pattern(ex, "stretch") && has(ex, "chest-pecs"),
  "lat-stretch":         ex => pattern(ex, "stretch") && has(ex, "upper-back"),
  "thread-needle":       ex => pattern(ex, "spinal-rotation", "stretch") &&
                               (has(ex, "thoracic") || has(ex, "upper-back")),
  "supine-rotation":     ex => pattern(ex, "spinal-rotation"),
  "child-pose":          ex => pattern(ex, "yoga-pose", "stretch") &&
                               (has(ex, "lower-back") || has(ex, "spine")),
  "breathing-cool":      ex => pattern(ex, "breath", "breath-awareness", "body-scan")
};

/**
 * Warm-ups must stay gentle regardless of what the category matcher returns.
 *
 * Under the old pool this was guaranteed by hand — an entry tagged
 * section:"warmup" was authored as a warm-up. Selecting from the shared
 * database means a genuinely hard exercise could satisfy a warm-up category,
 * so the constraint has to be explicit rather than implied by curation.
 */
const WARMUP_MAX_DIFFICULTY = 4;
const WARMUP_MAX_ENERGY     = 5;

/**
 * Select every database entry matching a builder category, for a section.
 *
 * @param {Object[]} exercises — the pool to select from (already safety-filtered)
 * @param {string}   category  — a key of CATEGORY_MATCHERS
 * @param {string}   section   — "warmup" | "main" | "cooldown"
 * @returns {Object[]}
 */
export function matchCategory(exercises, category, section) {
  const matcher = CATEGORY_MATCHERS[category];
  if (!matcher) return [];

  return exercises.filter(ex => {
    if (!matcher(ex)) return false;
    if (section === "warmup") {
      if ((ex.difficultyLevel || 1) > WARMUP_MAX_DIFFICULTY) return false;
      if ((ex.energyRequired  || 1) > WARMUP_MAX_ENERGY)     return false;
    }
    return true;
  });
}

/**
 * Development guard, mirroring assertVocabularyCoverage() in equipment-map.js.
 *
 * Returns any builder category that matches nothing in the database. An empty
 * category silently produces a shorter session rather than an error, which is
 * precisely how "cardio-warmup" went unnoticed for months, so this exists to
 * make the failure visible at build time instead.
 *
 * @param {Object[]} exercises
 * @param {string[]} categories — every category referenced by SESSION_TYPES
 * @returns {string[]} categories matching nothing
 */
export function assertCategoryCoverage(exercises, categories) {
  return categories
    .filter(cat => matchCategory(exercises, cat, "main").length === 0)
    .sort();
}
