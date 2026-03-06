/**
 * exercises.js - Exercise Database (barrel re-export)
 *
 * The exercise library now lives in js/data/exercises/ as split category files.
 * This file re-exports everything from the index so workoutGenerator.js and
 * any other consumers can continue to import from './exercises.js' unchanged.
 *
 * To add exercises: edit the relevant category file in js/data/exercises/
 * and add it to js/data/exercises/index.js — nothing else needs to change.
 */

export {
  EXERCISES,
  filterByEquipment,
  filterByConditions,
  filterByEnergy,
  filterToRecoveryPool,
  getSuitableExercises,
  getCautionExercises
} from './exercises/index.js';
