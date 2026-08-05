/**
 * conditionProgrammes.js - Condition Programme Selection
 *
 * 04 Aug 2026 v3
 *
 * v3 — Real exercise reuse across conditions, not duplication. Graeme
 *   asked for a recommendation on cross-condition programme
 *   integration; first draft (tag one exercise to two conditions
 *   separately) would have created two entries for the same physical
 *   exercise — completing it under one condition wouldn't mark it
 *   done under the other, credits would double-count it, it'd show
 *   up twice in any combined view. Reworked: conditionId (singular)
 *   replaced with conditionIds (array) on prescribedExercises entries
 *   — one entry can now genuinely belong to more than one condition.
 *   New getEntryConditionIds() reads both the new array shape and the
 *   old singular shape, so existing entries keep working without a
 *   migration step; rebuilding a programme naturally migrates them.
 *   commitProgramme() now detects when a candidate exercise already
 *   has an entry (matched by exerciseId, any condition) and adds this
 *   condition to its conditionIds instead of creating a duplicate.
 *   buildCoachProgramme()/buildRecommendedCandidates() both bias
 *   toward reuse — an exercise already in the programme for another
 *   condition sorts ahead of a fresh one, before slicing to
 *   PROGRAMME_SIZE so it can actually make the cut — and annotate
 *   each candidate with _reuseFrom for the UI to show "Already in
 *   your X programme" rather than presenting a reused exercise as if
 *   it just appeared from nowhere. Smoke-tested against real
 *   overlapping conditions (glutes/hip) before shipping: reuse fired
 *   correctly, entries correctly ended up serving both conditions
 *   without duplication, and backward compatibility with an old
 *   singular-conditionId entry confirmed working, including on rebuild.
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
import { getActiveConditionIds, getPainBand, getConditionName } from "./conditions.js";

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
 * Returns the names of OTHER conditions (not conditionId itself) that
 * already have this exercise in the saved programme, or null if none.
 * Used both to bias candidate ordering toward reuse and to let the UI
 * show "Already in your X programme" rather than presenting a reused
 * exercise as if it just appeared from nowhere.
 */
function _reuseInfo(exerciseId, conditionId) {
  const existing = store.get("prescribedExercises") || [];
  const entry = existing.find(e => e.exerciseId === exerciseId);
  if (!entry) return null;
  const otherIds = getEntryConditionIds(entry).filter(id => id !== conditionId);
  if (otherIds.length === 0) return null;
  return otherIds.map(id => getConditionName(id));
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

    // Reuse preference next: exercises already in the programme for
    // another condition sort ahead of fresh ones — applied here,
    // before slicing to PROGRAMME_SIZE, so a genuinely reusable
    // exercise can actually make it into the built programme rather
    // than only being reordered within a list that already excluded it.
    const aReuse = _reuseInfo(a.id, conditionId) ? 0 : 1;
    const bReuse = _reuseInfo(b.id, conditionId) ? 0 : 1;
    if (aReuse !== bReuse) return aReuse - bReuse;

    if (goalType === "improve") {
      // Lean toward more challenging options where safe.
      return (b.difficultyLevel || 1) - (a.difficultyLevel || 1);
    }
    // "cope"/"healed"/no goal set: lean toward explicit rehab-phase
    // matches over general exercises that merely happen to touch the area.
    const aRehab = ex => ex.rehabPhase ? 0 : 1;
    return aRehab(a) - aRehab(b);
  });

  const top = sorted.slice(0, PROGRAMME_SIZE);
  return top.map(ex => ({ ...ex, _reuseFrom: _reuseInfo(ex.id, conditionId) }));
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
  // suggestion), just sorted toward the end rather than hidden. Reuse
  // preference next: exercises already in the programme for another
  // condition sort toward the front, and before slicing so a
  // genuinely reusable one can actually make the cut.
  const sorted = [...safe].sort((a, b) => {
    const aLess = _isLessPreferred(a, prefs) ? 1 : 0;
    const bLess = _isLessPreferred(b, prefs) ? 1 : 0;
    if (aLess !== bLess) return aLess - bLess;

    const aReuse = _reuseInfo(a.id, conditionId) ? 0 : 1;
    const bReuse = _reuseInfo(b.id, conditionId) ? 0 : 1;
    return aReuse - bReuse;
  });
  const top = sorted.slice(0, PROGRAMME_SIZE * 2);
  return top.map(ex => ({ ...ex, _reuseFrom: _reuseInfo(ex.id, conditionId) }));
}

/**
 * Writes a set of exercises into prescribedExercises, tagged with the
 * condition they belong to. Replaces any existing entries for this
 * same conditionId (a fresh "coach builds it" run replaces the old
 * one) — entries for OTHER conditions, and any untagged entries added
 * the original way, are left untouched.
 */
/**
 * Returns the array of condition IDs an entry belongs to, handling
 * both shapes: the new conditionIds array, and the old single
 * conditionId string from before this file's multi-condition support
 * (04 Aug 2026) — existing entries are read correctly without a
 * migration step, not silently orphaned.
 */
export function getEntryConditionIds(entry) {
  if (Array.isArray(entry.conditionIds)) return entry.conditionIds;
  if (entry.conditionId) return [entry.conditionId];
  return [];
}

/**
 * Writes a set of exercises into prescribedExercises for a condition.
 *
 * 04 Aug 2026 — reworked for real exercise reuse across conditions,
 * not duplication. If a candidate exercise already has an entry
 * (matched by exerciseId, regardless of which condition it was
 * originally for), this condition is ADDED to that entry's
 * conditionIds instead of creating a second, duplicate entry for the
 * same physical exercise. Without this, doing the same exercise once
 * wouldn't mark it done under both conditions, credits would double-
 * count it, and it would show up twice in any combined view — none of
 * which reflects what actually happened. Only genuinely new exercises
 * (no existing entry with that exerciseId, across any condition) get
 * a fresh entry.
 *
 * Rebuilding an existing programme for THIS condition (the "Ask the
 * coach to rebuild this" action) removes conditionId from any of its
 * old entries — deleting the entry outright only if this was the
 * only condition it served, otherwise leaving it in place for
 * whichever other condition still needs it.
 */
export function commitProgramme(conditionId, exercises, prescribedBy) {
  const existing = store.get("prescribedExercises") || [];

  // Detach this condition from its previous entries — delete outright
  // only if it was the sole condition an entry served.
  const detached = existing
    .map(e => {
      const ids = getEntryConditionIds(e);
      if (!ids.includes(conditionId)) return e;
      const remaining = ids.filter(id => id !== conditionId);
      return remaining.length > 0
        ? { ...e, conditionIds: remaining, conditionId: undefined }
        : null;
    })
    .filter(Boolean);

  const result = [...detached];

  exercises.forEach(ex => {
    const reuse = result.find(e => e.exerciseId && e.exerciseId === ex.id);
    if (reuse) {
      const ids = getEntryConditionIds(reuse);
      if (!ids.includes(conditionId)) reuse.conditionIds = [...ids, conditionId];
      return;
    }

    result.push({
      id:             "px-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      exerciseId:     ex.id,
      name:           ex.name,
      description:    ex.description || "",
      frequency:      "",
      active:         true,
      completedToday: false,
      completedAt:    null,
      prescribedAt:   new Date().toISOString(),
      conditionIds:   [conditionId],
      ...(ex.sets     ? { sets: ex.sets }      : {}),
      ...(ex.reps     ? { reps: ex.reps }      : {}),
      ...(ex.coaching ? { notes: ex.coaching } : {}),
      prescribedBy,
    });
  });

  store.set("prescribedExercises", result);
}
