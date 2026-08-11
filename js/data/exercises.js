/**
 * data/exercises.js
 * 11 Aug 2026 v1
 *
 * CON-1 — re-export shim.
 *
 * This file was, until now, a byte-for-byte parallel copy of
 * js/data/exercises/index.js, differing only in the relative import paths
 * to the twelve discipline files. Both were live: workoutGenerator.js
 * imports from here, every other consumer imports from exercises/index.js.
 *
 * The consequence was that every filter change had to be written twice, and
 * the header comments in both files openly said so. That duplication is the
 * same failure mode found in four separate private exercise pools during the
 * 11 Aug content audit: a second copy of content or logic that a fix reaches
 * only if someone remembers it exists.
 *
 * There is now one registry. This file forwards to it, so
 * workoutGenerator.js's existing import path keeps working unchanged and no
 * other file needs touching.
 *
 * Exports forwarded: EXERCISES, filterByEquipment, filterByConditions,
 * filterByEnergy, filterToRecoveryPool, filterByFitnessLevel,
 * applyFeedbackWeighting, getSuitableExercises, getCautionExercises.
 *
 * Do not add logic to this file. All registry and filter changes belong in
 * js/data/exercises/index.js.
 */

export * from './exercises/index.js';
