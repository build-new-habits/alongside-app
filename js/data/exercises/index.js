/**
 * data/exercises/index.js
 * Central exercise registry — imports all category files and exports a
 * single EXERCISES array plus the filter functions the app uses.
 *
 * workoutGenerator.js imports from './exercises.js' which maps to this file.
 * No changes needed elsewhere in the app when new category files are added —
 * just import the new array here and spread it into EXERCISES.
 *
 * Category files:
 *   mobility.js      — stretching, joint prep, dynamic warm-up
 *   strength.js      — bodyweight, dumbbell, kettlebell, core
 *   cardio.js        — bodyweight cardio, HIIT, low-impact
 *   recovery.js      — yoga poses, self-massage, all breathwork
 *   rehabilitation.js — condition-specific rehab and activation (Batch 2+)
 *   mindfulness.js   — meditation, body scan, grounding (Batch 3+)
 */

import { MOBILITY }       from './mobility.js';
import { STRENGTH }       from './strength.js';
import { CARDIO }         from './cardio.js';
import { RECOVERY }       from './recovery.js';

// Future category files — uncomment as each batch is added:
import { REHABILITATION } from './rehabilitation.js';
import { MINDFULNESS }    from './mindfulness.js';
import { YOGA }           from './yoga.js';
import { PILATES }        from './pilates.js';
// import { PROGRAMMES }     from './programmes.js';

export const EXERCISES = [
  ...MOBILITY,
  ...STRENGTH,
  ...CARDIO,
  ...RECOVERY,
  ...REHABILITATION,
  ...MINDFULNESS,
  ...YOGA,
  ...PILATES,
  // ...PROGRAMMES,
];

// ─── Filter functions ─────────────────────────────────────────────────────────
// These are imported by workoutGenerator.js — signatures unchanged.

/**
 * Filter by equipment the user has available.
 * An exercise passes if every item in its equipment array is in userEquipment,
 * or if equipment is empty (bodyweight).
 */
export function filterByEquipment(exercises, userEquipment) {
  return exercises.filter(exercise => {
    if (!exercise.equipment || exercise.equipment.length === 0) return true;
    return exercise.equipment.every(item => userEquipment.includes(item));
  });
}

/**
 * Filter by user conditions.
 * Uses contraindications[] for hard blocks.
 * (Future: conditions.avoid / conditions.caution tiers from Doc 06 schema.)
 */
export function filterByConditions(exercises, userConditions) {
  if (!userConditions || userConditions.length === 0) return exercises;
  return exercises.filter(exercise => {
    const contraindications = exercise.contraindications || [];
    return !contraindications.some(c => userConditions.includes(c));
  });
}

/**
 * Filter by energy level from daily check-in.
 * Five-tier scale (Doc 06b):
 *   1–2  Rest day  — energy ≤ 2 only
 *   3–4  Easy      — energy ≤ 4
 *   5–6  Steady    — energy ≤ 6
 *   7–8  Good      — energy ≤ 8
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
 */
export function getSuitableExercises(userProfile, checkinData) {
  let suitable = [...EXERCISES];

  suitable = filterByEquipment(suitable, userProfile.equipment || []);
  suitable = filterByConditions(suitable, userProfile.conditions || []);

  if (checkinData?.energy) {
    suitable = filterByEnergy(suitable, checkinData.energy);
  }

  // Recovery Mode override — burnout detection
  if (checkinData?.recoveryMode) {
    suitable = filterToRecoveryPool(suitable);
  }

  return suitable;
}
