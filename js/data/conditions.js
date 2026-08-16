/**
 * conditions.js — Condition definitions for onboarding and check-in
 *
 * 16 Aug 2026 v1.5
 *   HYPER-1. Clinical guidance, 16 Aug: hypermobility/EDS must strictly
 *   avoid end-range passive stretching.
 *
 *   SOURCE, stated precisely because it matters: an AI-generated
 *   clinical review, cross-checked across several models by Graeme. NOT
 *   a named physiotherapist, and not clinically signed off. Human
 *   physiotherapy review is scheduled before public launch. An earlier
 *   version of this comment said "Physiotherapist review, verbatim" —
 *   that was wrong, and it was wrong in the exact way this file's own
 *   §10 blueprint entry warns about: clinical authority attached to
 *   something that had not earned it. getExerciseSafetyTier()
 *   now returns 'avoid' for stretch-pattern exercises when hypermobility
 *   is declared.
 *
 *   Closes a real gap rather than adding a nicety: hypermobility
 *   appeared in the avoid/caution lists of ZERO of 551 exercises, so
 *   every exercise returned 'safe' for it. The condition was collected,
 *   it triggered the clearance question, and then it changed nothing.
 *   chronic-fatigue, fibromyalgia and osteoporosis are in the same state
 *   and are deliberately NOT fixed here — the reviewer gave specific
 *   guidance for hypermobility only. See the rehab front door blueprint
 *   §10.
 *
 * 04 Aug 2026 v1.4
 *   Pain Input Redesign, same day as v1.3's threshold fix. New
 *   getPainBand(score) — the one canonical source of pain-severity
 *   display bands (none 0-2, mild 3-5, moderate 6-7, severe 8-10) for
 *   check-in sliders and coach messaging. Explicitly documented as
 *   separate from getActiveConditionIds()/getZoneStatus()'s 2-tier
 *   subacute/acute exercise-safety system above — different purpose,
 *   not required to align at every boundary (see that function's own
 *   comment for the known pain==7 edge case, now genuinely reachable
 *   via the slider rather than theoretical). Removed dead code
 *   getPainContext() — confirmed uncalled anywhere in js/, itself a
 *   fourth private severity-threshold duplicate, still carrying the
 *   pre-fix pain >= 4 value. Superseded by getPainBand().
 *
 * 04 Aug 2026 v1.3
 *   Home Nav & Conditions Redesign, Phase A (blueprint
 *   alongside_blueprint_home-navigation-conditions_04aug2026_v1.md).
 *   Single-source-of-truth severity threshold fix: subacute band raised
 *   from pain >= 4 to pain >= 6 in both getActiveConditionIds() and
 *   getZoneStatus(), to match checkin.js's existing Moderate boundary
 *   (level > 5). This is the canonical function workoutGenerator.js
 *   depends on for every session, not just Core Sessions — fixing only
 *   core-session.js's now-removed private copy of this logic (Phase B)
 *   would have created a new mismatch instead of closing the real one.
 *   Confirmed with Graeme before widening scope beyond the original
 *   single-file assumption. Acute/severe threshold (pain >= 7) left
 *   unchanged — not part of this decision. Note: this leaves a minor
 *   boundary edge case at exactly pain == 7, where checkin.js still
 *   labels it "Moderate" (level <= 7) but this file now treats it as
 *   acute (pain >= 7) — flagged, not fixed, out of this session's
 *   decided scope.
 *
 * v1.2 — Full conditions list from spec (Doc 06b)
 *   - 16 new conditions added (hamstring, glutes, calves, chest-pecs,
 *     biceps-triceps, abdominals, it-band, achilles, shin-splints,
 *     sciatica, plantar-fasciitis, fibromyalgia, hypermobility,
 *     osteoporosis, pelvic-floor, cardiovascular-condition)
 *   - Phase-aware condition variants:
 *       hamstring-acute      used as contraindication in exercises
 *       hamstring-subacute   used as contraindication in exercises
 *       achilles-acute       used as contraindication in exercises
 *       achilles-subacute    used as contraindication in exercises
 *       knee-acute           used as contraindication in exercises
 *       lower-back-acute     used as contraindication in exercises
 *       shoulder-acute       used as contraindication in exercises
 *       ankle-foot-acute     used as contraindication in exercises
 *       wrist-elbow-acute    used as contraindication in exercises
 *       hip-acute            used as contraindication in exercises
 *       shin-splints-acute   used as contraindication in exercises
 *       sciatica-acute       used as contraindication in exercises
 *     These are derived from the base condition + today's pain score.
 *     They are never shown to users — only used internally by the filter.
 *
 * PHASE MAPPING
 *   pain 1–3 → base ID only (e.g. 'hamstring')
 *   pain 4–6 → base + subacute variant (e.g. 'hamstring', 'hamstring-subacute')
 *   pain 7+  → base + acute variant (e.g. 'hamstring', 'hamstring-acute')
 *
 * The workout generator calls getActiveConditionIds(conditions, painScores)
 * to convert user conditions + today's pain into the expanded ID set
 * that exercise contraindications reference.
 */

// ─────────────────────────────────────────────────────────────
// CONDITIONS SHOWN TO USERS IN ONBOARDING / SETTINGS
// ─────────────────────────────────────────────────────────────

export const CONDITIONS = [

  // MUSCULOSKELETAL — LOWER BODY
  { id: 'hamstring',        name: 'Hamstring',              icon: '🦵', area: 'lower',    hasPhase: true, zone: 'lower-limb' },
  { id: 'knee',             name: 'Knee',                   icon: '🦵', area: 'lower',    hasPhase: true, zone: 'lower-limb' },
  { id: 'hip',              name: 'Hip',                    icon: '🦴', area: 'lower',    hasPhase: true, zone: 'lower-limb' },
  { id: 'ankle-foot',       name: 'Ankle / Foot',           icon: '🦶', area: 'lower',    hasPhase: true, zone: 'lower-limb' },
  { id: 'glutes',           name: 'Glutes / Buttocks',      icon: '🍑', area: 'lower',    hasPhase: true, zone: 'lower-limb' },
  { id: 'calves',           name: 'Calves / Lower Leg',     icon: '🦵', area: 'lower',    hasPhase: false, zone: 'lower-limb' },
  { id: 'achilles',         name: 'Achilles Tendon',        icon: '🦶', area: 'lower',    hasPhase: true, zone: 'lower-limb' },
  { id: 'shin-splints',     name: 'Shin Splints',           icon: '🦵', area: 'lower',    hasPhase: true, zone: 'lower-limb' },
  { id: 'it-band',          name: 'IT Band',                icon: '🦵', area: 'lower',    hasPhase: false, zone: 'lower-limb' },
  { id: 'plantar-fasciitis',name: 'Plantar Fasciitis',      icon: '🦶', area: 'lower',    hasPhase: false, zone: 'lower-limb' },
  { id: 'sciatica',         name: 'Sciatica',               icon: '⚡', area: 'lower',    hasPhase: true, zone: 'spine' },

  // MUSCULOSKELETAL — BACK
  { id: 'lower-back',       name: 'Lower Back',             icon: '🔙', area: 'back',     hasPhase: true, zone: 'spine' },
  { id: 'upper-back',       name: 'Upper Back / Neck',      icon: '🔙', area: 'back',     hasPhase: true, zone: 'spine' },

  // MUSCULOSKELETAL — UPPER BODY
  { id: 'shoulder',         name: 'Shoulder',               icon: '💪', area: 'upper',    hasPhase: true, zone: 'upper-limb' },
  { id: 'wrist-elbow',      name: 'Wrist / Elbow',          icon: '✋', area: 'upper',    hasPhase: true, zone: 'upper-limb' },
  { id: 'chest-pecs',       name: 'Chest / Pecs',           icon: '💪', area: 'upper',    hasPhase: false, zone: 'upper-limb' },
  { id: 'biceps-triceps',   name: 'Biceps / Triceps',       icon: '💪', area: 'upper',    hasPhase: false, zone: 'upper-limb' },
  { id: 'abdominals',       name: 'Abdominals / Core',      icon: '🫁', area: 'upper',    hasPhase: false, zone: 'spine' },

  // GENERAL HEALTH
  { id: 'chronic-fatigue',  name: 'Chronic fatigue / ME-CFS', icon: '😴', area: 'general', hasPhase: false, zone: 'systemic' },
  { id: 'anxiety',          name: 'Anxiety / Stress sensitivity', icon: '😰', area: 'general', hasPhase: false, zone: 'systemic' },
  { id: 'breathing',        name: 'Breathing / Asthma',     icon: '🌬️', area: 'general', hasPhase: false, zone: 'systemic' },
  { id: 'fibromyalgia',     name: 'Fibromyalgia',           icon: '⚡', area: 'general', hasPhase: false, zone: 'systemic' },
  { id: 'hypermobility',    name: 'Hypermobility / EDS',    icon: '🤸', area: 'general', hasPhase: false, zone: 'systemic' },
  { id: 'osteoporosis',     name: 'Osteoporosis / Low bone density', icon: '🦴', area: 'general', hasPhase: false, zone: 'systemic' },
  { id: 'cardiovascular-condition', name: 'Heart condition', icon: '❤️', area: 'general', hasPhase: false, zone: 'systemic' },
  { id: 'pelvic-floor',     name: 'Pelvic floor',           icon: '🫁', area: 'general', hasPhase: false, zone: 'systemic' },

  // HORMONAL
  { id: 'perimenopause',    name: 'Perimenopause symptoms', icon: '🌙', area: 'hormonal', hasPhase: false, zone: 'systemic' },
  { id: 'menopause',        name: 'Menopause symptoms',     icon: '🌙', area: 'hormonal', hasPhase: false, zone: 'systemic' },

  // CATCH-ALL
  { id: 'other',            name: 'Something else',         icon: '❓', area: 'other',    hasPhase: false, zone: 'systemic' }
];

// ─────────────────────────────────────────────────────────────
// PHASE-AWARE VARIANTS
//
// Conditions that have phase-aware exercise contraindications
// get expanded based on the user's reported pain score today.
//
// pain 1–5  → safe-ish. Only base ID active.
// pain 6    → subacute. Base + subacute variant active. (raised from the
//             old 4–6 band to match checkin.js's Moderate boundary,
//             level > 5 — see conditions.js v1.3 changelog, 04 Aug 2026)
// pain 7–10 → acute.    Base + acute variant active.
//
// Exercises list these variants in their contraindications[] array.
// e.g. Nordic curl: contraindications: ['hamstring-acute', 'hamstring-subacute']
//      Running: contraindications: ['hamstring-acute']
// ─────────────────────────────────────────────────────────────

const PHASE_AWARE_CONDITIONS = new Set([
  'hamstring',
  'glutes',
  'knee',
  'hip',
  'ankle-foot',
  'achilles',
  'shin-splints',
  'sciatica',
  'lower-back',
  'upper-back',
  'shoulder',
  'wrist-elbow'
]);

/**
 * Convert user conditions + today's pain scores into the full set
 * of condition IDs that exercise contraindications can reference.
 *
 * @param {string[]} conditionIds  — from store.get('conditions')
 * @param {Object}   painScores    — { 'hamstring': 6, 'knee': 2, ... }
 *                                    from today's check-in
 * @returns {string[]} expanded set of condition IDs
 *
 * Example:
 *   conditionIds = ['hamstring', 'knee']
 *   painScores   = { hamstring: 8, knee: 2 }
 *   → returns ['hamstring', 'hamstring-acute', 'knee']
 */

/**
 * Get the severity status of each body zone for today's check-in.
 * Used by today.js to show severe-zone coach messaging.
 *
 * Returns an object: { 'lower-limb': 'severe'|'moderate'|'mild'|null, ... }
 * Zone is 'severe' if any condition in it has pain >= 7
 * Zone is 'moderate' if any condition has pain 6 (matches checkin.js's
 *   Moderate boundary, level > 5 — see 04 Aug 2026 v1.3 changelog)
 * Zone is 'mild' if any condition has pain 1-5
 * Zone is null if no conditions in it
 *
 * Special: if BOTH lower-limb AND spine are severe → returns combinedSevere: true
 *
 * @param {string[]} conditionIds  — user's conditions
 * @param {Object}   painScores    — { conditionId: 0-10 }
 * @returns {Object} zoneStatus
 */
export function getZoneStatus(conditionIds = [], painScores = {}) {
  const zoneMax = {};

  for (const id of conditionIds) {
    const cond = CONDITIONS.find(c => c.id === id);
    if (!cond) continue;
    const zone = cond.zone || 'systemic';
    const pain = painScores[id] ?? 0;
    if (pain === 0) continue;

    const severity = pain >= 7 ? 'severe' : pain >= 6 ? 'moderate' : 'mild';
    const order = { severe: 3, moderate: 2, mild: 1 };

    if (!zoneMax[zone] || order[severity] > order[zoneMax[zone]]) {
      zoneMax[zone] = severity;
    }
  }

  // Flag the combined-severe case — both lower-limb and spine severe → rest day
  const combinedSevere =
    zoneMax['lower-limb'] === 'severe' && zoneMax['spine'] === 'severe';

  return { ...zoneMax, combinedSevere };
}

export function getActiveConditionIds(conditionIds = [], painScores = {}) {
  const active = new Set(conditionIds);

  for (const id of conditionIds) {
    if (!PHASE_AWARE_CONDITIONS.has(id)) continue;

    const pain = painScores[id] ?? 0;

    if (pain >= 7) {
      active.add(`${id}-acute`);
    } else if (pain >= 6) {
      active.add(`${id}-subacute`);
    }
    // pain 1–3: only the base ID stays — no phase variant added
  }

  return [...active];
}

// ─────────────────────────────────────────────────────────────
// CAUTION TIER — conditions that allow exercise with modification
//
// These are used by the 3-tier filter in index.js.
// Any condition ID (including phase variants) not in AVOID_CONDITIONS
// but listed here triggers caution mode: exercise is shown but
// deprioritised and a modification note is surfaced.
// ─────────────────────────────────────────────────────────────

/**
 * Returns whether an exercise should be fully blocked (avoid)
 * or shown with caution, given the user's active condition IDs.
 *
 * Used by filterByConditions() in exercises/index.js.
 *
 * @param {Object}   exercise        — exercise object from the database
 * @param {string[]} activeConditions — from getActiveConditionIds()
 * @returns {'avoid' | 'caution' | 'safe'}
 */
export function getExerciseSafetyTier(exercise, activeConditions) {
  if (!activeConditions || activeConditions.length === 0) return 'safe';

  // ── HYPER-1, 16 Aug 2026. ─────────────────────────────────────────
  //
  // SOURCE: AI-generated clinical review, cross-checked across several
  // models. NOT a named physiotherapist. Human review before public
  // launch. Quoted as written:
  //
  //   "Hypermobility/EDS: Focus on active control, proprioception, and
  //    closed-chain stability, strictly avoiding end-range passive
  //    stretching."
  //
  // The rule is kept despite the unverified source because the direction
  // of its error is safe: it withholds 30 stretches from one group and
  // leaves 521 exercises available. A wrong exclusion costs somebody
  // some stretching. A wrong inclusion costs somebody a joint.
  //
  // Implemented as a RULE rather than as a tag on individual entries,
  // for two reasons. One entry-by-entry pass would be thirty separate
  // clinical claims made by me; this is one claim, made by the
  // reviewer, applied consistently. And a rule cannot drift as the
  // library grows -- a stretch added next month is covered on the day
  // it is added, where a hand-tagged list silently stops being true.
  //
  // WHY THIS EXISTED AS A GAP AT ALL. Before today, `hypermobility`
  // appeared in the avoid/caution list of exactly ZERO of the 551
  // exercises, so every exercise in the library returned 'safe' for it.
  // The condition was collected at onboarding, it triggered the
  // exercise-clearance question, and then it changed nothing. Same for
  // chronic-fatigue, fibromyalgia and osteoporosis -- see the rehab
  // front door blueprint §10; those three are NOT fixed here, because
  // the reviewer gave specific guidance only for this one and inventing
  // the rest would be worse than leaving them open.
  //
  // THE PROXY, STATED HONESTLY. `movementPattern: 'stretch'` is not the
  // same claim as "end-range passive stretching" -- some stretches are
  // mid-range. It is the closest thing the data can express today, and
  // it errs toward excluding a safe exercise rather than serving an
  // unsafe one, which is the right direction for the error. Sharpening
  // it needs a field the library does not have.
  if (activeConditions.includes('hypermobility') && exercise.movementPattern === 'stretch') {
    return 'avoid';
  }

  const avoid   = exercise.avoid   || exercise.contraindications || [];
  const caution = exercise.caution || [];

  // Hard block: any active condition matches the avoid list
  if (avoid.some(c => activeConditions.includes(c))) return 'avoid';

  // Soft block: any active condition matches the caution list
  if (caution.some(c => activeConditions.includes(c))) return 'caution';

  return 'safe';
}

// ─────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Get a condition definition by ID (base IDs only — not phase variants)
 */
export function getCondition(id) {
  return CONDITIONS.find(c => c.id === id);
}

/**
 * Get display name for a condition ID
 * Handles phase variant IDs gracefully (strips suffix)
 */
export function getConditionName(id) {
  // Strip phase suffix if present
  const baseId = id.replace(/-(acute|subacute)$/, '');
  const condition = getCondition(baseId);
  if (!condition) return id;

  // Add phase suffix to display name when relevant
  if (id.endsWith('-acute'))    return `${condition.name} (acute)`;
  if (id.endsWith('-subacute')) return `${condition.name} (subacute)`;
  return condition.name;
}

/**
 * Get all conditions for a given area
 * Used by body-map UI to group conditions
 */
export function getConditionsByArea(area) {
  return CONDITIONS.filter(c => c.area === area);
}

/**
 * Canonical pain-severity band + label, for DISPLAY purposes only
 * (check-in slider live-label, coach acknowledgment messaging).
 *
 * Deliberately a separate, 4-tier system from getActiveConditionIds()/
 * getZoneStatus() above, which is a 2-tier system (subacute/acute) for
 * exercise-contraindication filtering — a different purpose, coarser on
 * purpose. The two systems are NOT required to align at every boundary:
 * pain 7 displays as "Moderate" here but already gets acute-level
 * exercise caution above (pain >= 7) — that's a deliberate, previously
 * signed-off decision (04 Aug 2026, Home Nav Phase A), not a bug. Flag
 * to Graeme if this should ever be unified; not touched here.
 *
 * Bands match what checkin.js's and checkin-mini.js's chip UIs already
 * used before this file existed: none 0-2, mild 3-5, moderate 6-7,
 * severe 8-10.
 *
 * @param {number} score — 0-10
 * @returns {{ id: string, label: string }}
 */
export function getPainBand(score) {
  const s = score ?? 0;
  if (s <= 2) return { id: 'none',     label: 'None' };
  if (s <= 5) return { id: 'mild',     label: 'Mild' };
  if (s <= 7) return { id: 'moderate', label: 'Moderate' };
  return       { id: 'severe',   label: 'Severe' };
}
