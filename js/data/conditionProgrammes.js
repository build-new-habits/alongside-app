/**
 * conditionProgrammes.js - Condition Programme Selection
 *
 * 04 Aug 2026 v2
 *
 * v2 — Applies exercisePreferences (store.js v17) — 'avoid' exercises
 *   excluded entirely in buildConditionCandidates(), the one place
 *   every other function here draws from; 'less' exercises stay
 *   eligible (this is a browsing/choosing context, not a proactive
 *   suggestion) but sort toward the end in buildCoachProgramme() and
 *   buildRecommendedCandidates(). Smoke-tested: an avoided exercise
 *   confirmed absent from both a real recommended-candidates call and
 *   a real coach-built programme before this was wired into the UI.
 *
 * 04 Aug 2026 v1
 *
 * New module. Scoped in alongside_scoping_condition_programmes_04aug2026_v1.md,
 * built same day per Graeme's decisions:
 *   - Programmes are generated once, not silently regenerated — a
 *     manual "ask the coach to rebuild this" action is the only way to
 *     replace one (not built this pass; nothing calls this file on a
 *     schedule).
 *   - Flat list, not week-by-week progression — deliberately simple
 *     for now. A full periodised engine is separate, larger scope
 *     (part of the general Programme Curation vision) — CAPTURED here
 *     explicitly so it isn't lost: this module's shape (a flat
 *     exercise-selection function) is where week-by-week progression
 *     would need to be layered in later, not a redesign from scratch.
 *   - 8 exercises per programme, not 4-6 — Graeme: "more substantial
 *     ... we should be helping the user work towards caring for and
 *     improving their condition." Also serves the fold-in dial well —
 *     a pool this size gives real variety to rotate through, rather
 *     than "Partially" (1 exercise) feeling thin against a 4-exercise
 *     total.
 *
 * Draws entirely on data that already existed in the exercise
 * database before this file was written (affectsAreas, rehabPhase,
 * contraindications) — confirmed during scoping, not assumed.
 */

import { store } from "../store.js";
import { EXERCISES } from "./exercises/index.js";
import { getActiveConditionIds, getPainBand } from "./conditions.js";

export const PROGRAMME_SIZE = 8;

const REHAB_PHASE_ORDER = ["acute", "subacute", "maintenance"];

function _rehabPhaseForBand(bandId) {
  if (bandId === "severe")   return "acute";
  if (bandId === "moderate") return "subacute";
  return "maintenance"; // mild or none
}

/**
 * Safe candidate pool for a condition: exercises that touch the
 * affected area, with anything contraindicated for the condition's
 * current phase already excluded.
 */
export function buildConditionCandidates(conditionId) {
  const painScores = store.get("conditionPainScores") || {};
  const score       = painScores[conditionId] || 0;
  const band        = getPainBand(score);
  const activeIds   = getActiveConditionIds([conditionId], painScores);
  const prefs       = store.get("exercisePreferences") || {};

  const pool = EXERCISES.filter(ex => (ex.affectsAreas || []).includes(conditionId));

  const safeIgnoringPrefs = pool.filter(ex => {
    const contra = ex.contraindications || [];
    return !contra.some(c => activeIds.includes(c));
  });

  // 'avoid' exercises never appear here at all, per spec — this is the
  // one place every downstream function in this file draws from, so
  // excluding here covers "coach builds it" and "coach recommends"
  // both, in one place. 'less' exercises stay in the pool (the person
  // is actively browsing/choosing here, not being proactively
  // suggested something) but get sorted toward the end — see
  // buildCoachProgramme()/buildRecommendedCandidates().
  const safe = safeIgnoringPrefs.filter(ex => prefs[ex.id]?.preference !== "avoid");

  return { band, safe };
}

function _isLessPreferred(ex, prefs) {
  return prefs[ex.id]?.preference === "less";
}

/**
 * "Coach builds it" — automatic selection, biased by the condition's
 * current phase and the person's stated goal (conditionGoals).
 */
export function buildCoachProgramme(conditionId, goalType) {
  const { band, safe } = buildConditionCandidates(conditionId);
  const phase      = _rehabPhaseForBand(band.id);
  const phaseIndex = REHAB_PHASE_ORDER.indexOf(phase);
  const prefs      = store.get("exercisePreferences") || {};

  // Same phase or gentler (later in REHAB_PHASE_ORDER = gentler).
  // Non-rehab exercises (no rehabPhase at all) are always eligible —
  // they were never phase-restricted to begin with.
  const phaseFiltered = safe.filter(ex => {
    if (!ex.rehabPhase) return true;
    return REHAB_PHASE_ORDER.indexOf(ex.rehabPhase) >= phaseIndex;
  });

  const pool = phaseFiltered.length > 0 ? phaseFiltered : safe;

  const sorted = [...pool].sort((a, b) => {
    // 'less'-preferred exercises sort to the end regardless of
    // everything else — a real but soft preference signal, not a
    // hard exclusion (that's 'avoid', already filtered out upstream
    // in buildConditionCandidates()).
    const aLess = _isLessPreferred(a, prefs) ? 1 : 0;
    const bLess = _isLessPreferred(b, prefs) ? 1 : 0;
    if (aLess !== bLess) return aLess - bLess;

    if (goalType === "improve") {
      // Lean toward more challenging options where safe.
      return (b.difficultyLevel || 1) - (a.difficultyLevel || 1);
    }
    // "cope"/"healed"/no goal set: lean toward explicit rehab-phase
    // matches over general exercises that merely happen to touch the area.
    const aRehab = ex => ex.rehabPhase ? 0 : 1;
    return aRehab(a) - aRehab(b);
  });

  return sorted.slice(0, PROGRAMME_SIZE);
}

/**
 * "Coach recommends, you select" — same safe pool, wider (not sliced
 * to programme size), presented as choosable candidates instead of
 * an automatic pick.
 */
export function buildRecommendedCandidates(conditionId) {
  const { safe } = buildConditionCandidates(conditionId);
  const prefs    = store.get("exercisePreferences") || {};
  // Same soft de-prioritisation as buildCoachProgramme() — 'less'
  // exercises still appear (this is a browsing list, not a proactive
  // suggestion), just sorted toward the end rather than hidden.
  const sorted = [...safe].sort((a, b) => {
    const aLess = _isLessPreferred(a, prefs) ? 1 : 0;
    const bLess = _isLessPreferred(b, prefs) ? 1 : 0;
    return aLess - bLess;
  });
  return sorted.slice(0, PROGRAMME_SIZE * 2);
}

/**
 * Writes a set of exercises into prescribedExercises, tagged with the
 * condition they belong to. Replaces any existing entries for this
 * same conditionId (a fresh "coach builds it" run replaces the old
 * one) — entries for OTHER conditions, and any untagged entries added
 * the original way, are left untouched.
 */
export function commitProgramme(conditionId, exercises, prescribedBy) {
  const existing = store.get("prescribedExercises") || [];
  const kept     = existing.filter(e => e.conditionId !== conditionId);

  const newEntries = exercises.map(ex => ({
    id:             "px-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    exerciseId:     ex.id,
    name:           ex.name,
    description:    ex.description || "",
    frequency:      "",
    active:         true,
    completedToday: false,
    completedAt:    null,
    prescribedAt:   new Date().toISOString(),
    conditionId,
    ...(ex.sets    ? { sets: ex.sets }   : {}),
    ...(ex.reps    ? { reps: ex.reps }   : {}),
    ...(ex.coaching ? { notes: ex.coaching } : {}),
    prescribedBy,
  }));

  store.set("prescribedExercises", [...kept, ...newEntries]);
}
