/**
 * conditions.js — Condition definitions for onboarding and check-in
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
  { id: 'hamstring',        name: 'Hamstring',              icon: '🦵', area: 'lower',    hasPhase: true },
  { id: 'knee',             name: 'Knee',                   icon: '🦵', area: 'lower',    hasPhase: true },
  { id: 'hip',              name: 'Hip',                    icon: '🦴', area: 'lower',    hasPhase: true },
  { id: 'ankle-foot',       name: 'Ankle / Foot',           icon: '🦶', area: 'lower',    hasPhase: true },
  { id: 'glutes',           name: 'Glutes / Buttocks',      icon: '🍑', area: 'lower',    hasPhase: true },
  { id: 'calves',           name: 'Calves / Lower Leg',     icon: '🦵', area: 'lower',    hasPhase: false },
  { id: 'achilles',         name: 'Achilles Tendon',        icon: '🦶', area: 'lower',    hasPhase: true },
  { id: 'shin-splints',     name: 'Shin Splints',           icon: '🦵', area: 'lower',    hasPhase: true },
  { id: 'it-band',          name: 'IT Band',                icon: '🦵', area: 'lower',    hasPhase: false },
  { id: 'plantar-fasciitis',name: 'Plantar Fasciitis',      icon: '🦶', area: 'lower',    hasPhase: false },
  { id: 'sciatica',         name: 'Sciatica',               icon: '⚡', area: 'lower',    hasPhase: true },

  // MUSCULOSKELETAL — BACK
  { id: 'lower-back',       name: 'Lower Back',             icon: '🔙', area: 'back',     hasPhase: true },
  { id: 'upper-back',       name: 'Upper Back / Neck',      icon: '🔙', area: 'back',     hasPhase: true },

  // MUSCULOSKELETAL — UPPER BODY
  { id: 'shoulder',         name: 'Shoulder',               icon: '💪', area: 'upper',    hasPhase: true },
  { id: 'wrist-elbow',      name: 'Wrist / Elbow',          icon: '✋', area: 'upper',    hasPhase: true },
  { id: 'chest-pecs',       name: 'Chest / Pecs',           icon: '💪', area: 'upper',    hasPhase: false },
  { id: 'biceps-triceps',   name: 'Biceps / Triceps',       icon: '💪', area: 'upper',    hasPhase: false },
  { id: 'abdominals',       name: 'Abdominals / Core',      icon: '🫁', area: 'upper',    hasPhase: false },

  // GENERAL HEALTH
  { id: 'chronic-fatigue',  name: 'Chronic fatigue / ME-CFS', icon: '😴', area: 'general', hasPhase: false },
  { id: 'anxiety',          name: 'Anxiety / Stress sensitivity', icon: '😰', area: 'general', hasPhase: false },
  { id: 'breathing',        name: 'Breathing / Asthma',     icon: '🌬️', area: 'general', hasPhase: false },
  { id: 'fibromyalgia',     name: 'Fibromyalgia',           icon: '⚡', area: 'general', hasPhase: false },
  { id: 'hypermobility',    name: 'Hypermobility / EDS',    icon: '🤸', area: 'general', hasPhase: false },
  { id: 'osteoporosis',     name: 'Osteoporosis / Low bone density', icon: '🦴', area: 'general', hasPhase: false },
  { id: 'cardiovascular-condition', name: 'Heart condition', icon: '❤️', area: 'general', hasPhase: false },
  { id: 'pelvic-floor',     name: 'Pelvic floor',           icon: '🫁', area: 'general', hasPhase: false },

  // HORMONAL
  { id: 'perimenopause',    name: 'Perimenopause symptoms', icon: '🌙', area: 'hormonal', hasPhase: false },
  { id: 'menopause',        name: 'Menopause symptoms',     icon: '🌙', area: 'hormonal', hasPhase: false },

  // CATCH-ALL
  { id: 'other',            name: 'Something else',         icon: '❓', area: 'other',    hasPhase: false }
];

// ─────────────────────────────────────────────────────────────
// PHASE-AWARE VARIANTS
//
// Conditions that have phase-aware exercise contraindications
// get expanded based on the user's reported pain score today.
//
// pain 1–3  → safe-ish. Only base ID active.
// pain 4–6  → subacute. Base + subacute variant active.
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
export function getActiveConditionIds(conditionIds = [], painScores = {}) {
  const active = new Set(conditionIds);

  for (const id of conditionIds) {
    if (!PHASE_AWARE_CONDITIONS.has(id)) continue;

    const pain = painScores[id] ?? 0;

    if (pain >= 7) {
      active.add(`${id}-acute`);
    } else if (pain >= 4) {
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
 * Get the pain threshold interpretation for display
 * Used by check-in UI to show contextual guidance
 */
export function getPainContext(conditionId, painScore) {
  if (painScore >= 7) return {
    phase: 'acute',
    message: 'Take it easy today — we\'ll keep things very gentle.',
    colour: 'danger'
  };
  if (painScore >= 4) return {
    phase: 'subacute',
    message: 'We\'ll work around this and avoid anything that could aggravate it.',
    colour: 'warning'
  };
  return {
    phase: 'managed',
    message: 'Noted — we\'ll keep an eye on this.',
    colour: 'neutral'
  };
}
