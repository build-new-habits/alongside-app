/**
 * data/exercises/index.js
 * Central exercise registry — imports all category files and exports a
 * single EXERCISES array plus the filter functions the app uses.
 *
 * workoutGenerator.js imports from './exercises.js' which maps to this file.
 * No changes needed elsewhere in the app when new category files are added —
 * just import the new array here and spread it into EXERCISES.
 *
 * v1.2 — 3-tier condition safety system
 *   filterByConditions() now takes activeConditionIds (from conditions.js
 *   getActiveConditionIds()) rather than raw condition IDs.
 *   Returns { safe, caution } pools instead of a flat array.
 *   getSuitableExercises() handles this internally — calling code unchanged.
 *
 *   Tier 1 — Avoid:   exercise.contraindications includes an active condition
 *                     → removed from pool entirely
 *   Tier 2 — Caution: exercise.caution includes an active condition
 *                     → included but flagged, deprioritised in selection
 *   Tier 3 — Safe:    no match → full availability
 *
 * Category files:
 *   mobility.js           — stretching, joint prep, dynamic warm-up
 *   strength.js           — bodyweight, dumbbell, kettlebell, barbell, bands
 *   cardio.js             — bodyweight cardio, HIIT, rowing, cycling, dance
 *   recovery.js           — breathwork, sleep, hydration, self-care
 *   rehabilitation.js     — condition-specific rehab and activation
 *   mindfulness.js        — meditation, body scan, ACT, somatic
 *   yoga.js               — yoga poses, flows, yin, restorative
 *   pilates.js            — pilates exercises and sequences
 *   running.js            — C25K, 5K performance, drills, endurance
 *   swimming_cycling.js   — swim technique, pool sessions, cycling
 *   sport_conditioning.js — agility, SAQ, circuits, sport warm-up
 */

import { MOBILITY }           from './mobility.js';
import { STRENGTH }           from './strength.js';
import { CARDIO }             from './cardio.js';
import { RECOVERY }           from './recovery.js';
import { REHABILITATION }     from './rehabilitation.js';
import { MINDFULNESS }        from './mindfulness.js';
import { YOGA }               from './yoga.js';
import { PILATES }            from './pilates.js';
import { RUNNING }            from './running.js';
import { SWIMMING_CYCLING }   from './swimming_cycling.js';
import { SPORT_CONDITIONING } from './sport_conditioning.js';

import { getActiveConditionIds } from '../conditions.js';

export const EXERCISES = [
  ...MOBILITY,
  ...STRENGTH,
  ...CARDIO,
  ...RECOVERY,
  ...REHABILITATION,
  ...MINDFULNESS,
  ...YOGA,
  ...PILATES,
  ...RUNNING,
  ...SWIMMING_CYCLING,
  ...SPORT_CONDITIONING,
];

// ─── Filter functions ─────────────────────────────────────────────────────────
// getSuitableExercises() is the primary entry point for workoutGenerator.js.
// Individual filter functions are exported for testing and direct use.

/**
 * Filter by equipment the user has available.
 * An exercise passes if every required item is in userEquipment,
 * or if equipment array is empty (bodyweight).
 */
export function filterByEquipment(exercises, userEquipment) {
  return exercises.filter(exercise => {
    if (!exercise.equipment || exercise.equipment.length === 0) return true;
    return exercise.equipment.every(item => userEquipment.includes(item));
  });
}

/**
 * 3-tier condition safety filter.
 *
 * Takes the expanded activeConditionIds (already phase-resolved by
 * getActiveConditionIds()) and splits the pool into:
 *   safe    — fully available exercises
 *   caution — exercises shown with modification notes, deprioritised
 *
 * Avoid-tier exercises are excluded entirely.
 *
 * @param {Object[]} exercises         — the exercise pool
 * @param {string[]} activeConditionIds — from getActiveConditionIds()
 * @returns {{ safe: Object[], caution: Object[] }}
 */
export function filterByConditions(exercises, activeConditionIds) {
  if (!activeConditionIds || activeConditionIds.length === 0) {
    return { safe: exercises, caution: [] };
  }

  const safe    = [];
  const caution = [];

  for (const exercise of exercises) {
    const avoid   = exercise.contraindications || [];
    const cautionList = exercise.caution || [];

    // Hard block
    if (avoid.some(c => activeConditionIds.includes(c))) continue;

    // Soft block — include but flag
    if (cautionList.some(c => activeConditionIds.includes(c))) {
      caution.push({ ...exercise, _cautionActive: true });
    } else {
      safe.push(exercise);
    }
  }

  return { safe, caution };
}

/**
 * Filter by energy level from daily check-in.
 * Five-tier scale:
 *   1–2  Rest day  — energyRequired ≤ 2 only
 *   3–4  Easy      — energyRequired ≤ 4
 *   5–6  Steady    — energyRequired ≤ 6
 *   7–8  Good      — energyRequired ≤ 8
 *   9–10 High      — all exercises available
 */
export function filterByEnergy(exercises, userEnergy) {
  return exercises.filter(exercise => exercise.energyRequired <= userEnergy);
}

/**
 * Filter to Recovery Mode pool — used when burnout is detected.
 * Returns only exercises with energyRequired ≤ 3.
 */
export function filterToRecoveryPool(exercises) {
  return exercises.filter(exercise => exercise.energyRequired <= 3);
}

/**
 * Get suitable exercises based on all user factors.
 * Primary entry point used by workoutGenerator.js.
 *
 * Returns a flat array of exercises. Caution-tier exercises are included
 * (flagged with _cautionActive: true) and are available to the workout
 * generator — the UI surfaces modification notes for flagged exercises.
 *
 * @param {Object} userProfile   — { equipment, conditions, goals, fitnessLevel }
 * @param {Object} checkinData   — { energy, painScores, recoveryMode }
 *   painScores: { [conditionId]: 0-10 } — from today's check-in sliders
 * @returns {Object[]} suitable exercises (safe + caution, no avoid)
 */
export function getSuitableExercises(userProfile, checkinData) {
  let pool = [...EXERCISES];

  // 1. Equipment filter
  pool = filterByEquipment(pool, userProfile.equipment || []);

  // 2. Condition safety filter — 3-tier
  //    Resolve phase-aware condition IDs from base conditions + today's pain
  const painScores = checkinData?.painScores || {};
  const activeConditionIds = getActiveConditionIds(
    userProfile.conditions || [],
    painScores
  );
  const { safe, caution } = filterByConditions(pool, activeConditionIds);

  // Combine safe and caution pools — caution exercises carry _cautionActive flag
  // The workout generator can deprioritise or modify them as needed
  pool = [...safe, ...caution];

  // 3. Energy filter
  if (checkinData?.energy) {
    pool = filterByEnergy(pool, checkinData.energy);
  }

  // 4. Recovery Mode override — burnout detection
  if (checkinData?.recoveryMode) {
    pool = filterToRecoveryPool(pool);
  }

  return pool;
}

/**
 * Get caution exercises only — used by workout view to display
 * modification notes alongside exercises that have _cautionActive: true.
 *
 * @param {Object[]} exercises — the final workout exercise list
 * @returns {Object[]} exercises with active caution flags
 */
export function getCautionExercises(exercises) {
  return exercises.filter(ex => ex._cautionActive === true);
}
