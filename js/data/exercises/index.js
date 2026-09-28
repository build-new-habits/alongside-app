/**
 * data/exercises/index.js
 * Central exercise registry — imports all category files and exports a
 * single EXERCISES array plus the filter functions the app uses.
 *
 * No changes needed elsewhere in the app when new category files are added —
 * just import the new array here and spread it into EXERCISES.
 *
 * 28 Sep 2026 v1.10
 *   Work list 2e. getSuitableExercises() and the chain only it called
 *   (filterByEnergy, filterToRecoveryPool, filterByFitnessLevel,
 *   applyFeedbackWeighting) and getCautionExercises() are removed with
 *   workoutGenerator.js, their only caller, and the ./exercises.js shim
 *   that forwarded here. The live builder (session-builder.js) filters
 *   with filterByEquipment, filterByConditions and isSessionLength, which
 *   stay. A too-hard tap is read live by session-rationale.js
 *   tooHardRecently(); a too-easy tap by tooEasyLast() (2e).
 *
 * 26 Aug 2026 v1.9
 *   SWAP-0. CARDIO_MACHINES, isCardioMachine() and getSwapCandidates().
 *
 *   Scoped to cardio machines deliberately, and the scope IS the design.
 *   movementPattern is not a swap axis on its own: 'locomotion' covers 133
 *   of 551 entries, so a treadmill matched against it returns marathon
 *   pace runs; and it does not separate strength from plyometric, so Leg
 *   Press returns Depth Jump. The second of those is a safety problem, not
 *   an ergonomics one. See alongside_blueprint_SWAP-0_26aug2026_v1.md §3.
 *
 *   The cardio machines are the one place the rule genuinely holds --
 *   treadmill, cross trainer, bike, rower and stair climber are all
 *   locomotion/cardio and differ only by difficulty, which is precisely
 *   why gyms put them in a row. 24 machine exercises exist in total.
 *
 * 16 Aug 2026 v1.8
 *   HYPER-1. filterByConditions() now delegates to conditions.js's
 *   getExerciseSafetyTier() instead of reimplementing the same decision
 *   inline. That function had ZERO callers and its own doc comment
 *   claimed this one used it. One definition now, so a clinical rule
 *   added to it takes effect everywhere by construction.
 *
 * 11 Aug 2026 v1.7
 *
 * v1.7 - CAP-4. New seated.js registered: 21 entries of seated cardio,
 *   seated strength, seated core, seated lower-body work and
 *   chair-supported standing. The seated pool was 29 entries, almost
 *   all rehabilitation drills and gym machines, and produced a
 *   four-exercise session for anyone who answered the capability
 *   screen honestly.
 *
 * 11 Aug 2026 v1.6
 *
 * v1.6 — CON-4. New gym.js registered: 31 entries covering cardio machines
 *   (treadmill, cross trainer, stair climber, ski erg), conditioning (sled,
 *   battle ropes, loaded carries), cable and machine strength, loaded core,
 *   medicine ball, balance kit and plyometrics. Before this the database
 *   held zero cable exercises, zero machine strength and no loaded core at
 *   all, and seven equipment ids were tickable but carried by nothing.
 *
 * 11 Aug 2026 v1.5
 *
 * v1.5 — CON-2. filterByEquipment() now resolves the user's ticked
 *   equipment through equipment-map.js before comparing. equipment.js
 *   offers 66 granular ids ("dumbbells-medium"); exercises are tagged with
 *   22 coarse ones ("dumbbell"), and fourteen of those had no counterpart
 *   in the vocabulary at all, so `.every(item => userEquipment.includes())`
 *   could never be true for them. 92 of the 124 equipment-requiring
 *   exercises were unreachable on every route for every user. Measured
 *   after the fix: a gym-membership user goes from 337 reachable exercises
 *   to 430. No exercise re-tagged, no stored user data migrated.
 *   NOTE: js/data/exercises.js is now a re-export shim over this file
 *   (CON-1), so filter changes are written once, not twice.
 *
 * v1.4 — PT-2/PT-9 (Persona Tracing Wave 1). filterByFitnessLevel()
 *   gains a "returning" ceiling (6) — the fifth ACTIVITY_CHIP option had
 *   no key and silently resolved to moderate. Paired with
 *   workoutGenerator.js v1.14, which is what finally makes any of these
 *   ceilings reachable. NOTE: this file and js/data/exercises.js are
 *   parallel copies of the same filters — both were changed.
 *
 * v1.3 — fitnessLevel structural ceiling (Gap 4)
 *   filterByFitnessLevel() applies an energyRequired ceiling based on the
 *   user's self-reported activityLevel from onboarding.
 *   This is a structural cap — who the person IS, not how they feel today.
 *   The daily energy gate (filterByEnergy) still applies on top.
 *   The lower of the two ceilings always wins.
 *
 *   Mapping:
 *     sedentary   → energyRequired ≤ 5
 *     light       → energyRequired ≤ 7
 *     moderate    → energyRequired ≤ 8  (default)
 *     active      → energyRequired ≤ 10 (full pool)
 *     very-active → energyRequired ≤ 10 (full pool, bias toward ≥ 5 handled in generator)
 *
 * v1.3 — exerciseFeedback weighting (Gap 2)
 *   applyFeedbackWeighting() reads exerciseFeedback from store and applies
 *   programmeScore penalties/bonuses before workout generator selection.
 *   Exercises with 2+ recent "too-hard" entries get score 0.5 (deprioritised).
 *   Exercises with 2+ recent "too-easy" entries get score 1.5 (upweighted).
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
import { GYM }               from './gym.js';
import { SEATED }            from './seated.js';

import { getExerciseSafetyTier } from '../conditions.js';
import { resolveEquipment, exerciseIsAvailable } from '../equipment-map.js';

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
  ...GYM,
  ...SEATED,
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
  // CON-2: resolve granular ticks ("dumbbells-medium") into the coarse
  // capability tags exercises actually carry ("dumbbell") before comparing.
  // Bodyweight exercises still always pass, exactly as before.
  const resolved = resolveEquipment(userEquipment || []);
  return exercises.filter(exercise => exerciseIsAvailable(exercise, resolved));
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

  // HYPER-1, 16 Aug 2026. This loop used to reimplement the avoid/caution
  // decision inline, and conditions.js exported getExerciseSafetyTier()
  // making the identical decision separately. Two implementations of one
  // rule, and the doc comment on getExerciseSafetyTier() claimed THIS
  // function called it -- which it never did.
  //
  // It had ZERO callers anywhere in the app. So a clinical rule added to
  // it, as HYPER-1's was, is a rule nothing in the product would ever
  // run. The gate caught that: the rule was correct, the filter served
  // all 30 stretches anyway, and every other assertion still passed.
  //
  // Now delegated, so there is one definition of "can this person do
  // this exercise" and a clinical rule added to it takes effect
  // everywhere by construction. The one behavioural difference is
  // deliberate: getExerciseSafetyTier() reads `avoid || contraindications`
  // where this read `contraindications` alone, so an entry using `avoid`
  // is now honoured rather than silently ignored.
  for (const exercise of exercises) {
    // Named `safety`, not `tier`. verify-contract.mjs reads any `tier`
    // as the subscription field (free|personal|athlete) and flagged the
    // comparison immediately -- correctly, because in this codebase
    // "tier" already means something else and a second meaning is how
    // two fields become one bug.
    const safety = getExerciseSafetyTier(exercise, activeConditionIds);
    if (safety === 'avoid') continue;
    if (safety === 'caution') caution.push({ ...exercise, _cautionActive: true });
    else safe.push(exercise);
  }

  return { safe, caution };
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
/**
 * DATA-1b, 12 Aug 2026. Is this a COMPONENT, or a whole session?
 *
 * Shared by both engines. session-builder.js had its own version of this
 * rule; workoutGenerator.js had none at all, and drew from a 340-exercise
 * pool containing 71 entries of 10+ minutes and 89 tagged 'practice'. So
 * a generated workout could hand somebody a 30-minute Brisk Walk as one
 * of its items.
 *
 * Two independent checks, because each catches what the other misses:
 *
 *   contentType 'practice'  — 140 entries, most under 10 minutes, so the
 *                             duration rule cannot see them
 *   duration >= 600s        — 28 entries carry NO contentType at all, and
 *                             eleven more are correctly tagged 'exercise'
 *                             and still are not components
 *
 * 600 and not 300: several legitimate components run to five minutes --
 * plank progressions, longer holds, some mobility flows.
 */
export function isSessionLength(ex) {
  return ex?.contentType === "practice" || (ex?.duration || 0) >= 600;
}

/**
 * SWAP-0, 26 Aug 2026.
 *
 * The cardio machines a person swaps between when one is occupied. These
 * are equipment tags as exercises carry them, NOT the granular ids ticked
 * in onboarding -- resolveEquipment() bridges the two, per CON-2.
 */
export const CARDIO_MACHINES = [
  'treadmill',
  'elliptical',
  'exercise-bike',
  'rowing-machine',
  'stair-climber'
];

export function isCardioMachine(ex) {
  return (ex?.equipment || []).some(q => CARDIO_MACHINES.includes(q));
}

/**
 * getSwapCandidates(exercise, userEquipment) — SWAP-0, 26 Aug 2026.
 *
 * "The app said treadmill but I had to use the cross trainer."
 *
 * Returns the machines the person could reasonably move to, nearest
 * difficulty first. Returns [] for anything that is not a cardio machine:
 * a partial answer here would be worse than none, because the exercises
 * this cannot serve are the ones where a wrong suggestion carries a risk.
 *
 * Equipment is a preference in the ordering, not a gate. If the person's
 * ticked kit leaves nothing, every candidate is returned instead. They are
 * standing in the gym telling us what is in front of them; the onboarding
 * list is older and less informed than they are, and hiding the cross
 * trainer because it was never ticked would be the list overruling the
 * person. Equipment has been "a preference in selection, not only a
 * permission" since CON-1..9.
 *
 * @param {object}   exercise       the one they cannot get on
 * @param {string[]} userEquipment  store 'equipment' (granular ids)
 * @param {object[]} [pool]         injectable for tests
 * @returns {object[]}
 */
export function getSwapCandidates(exercise, userEquipment = [], pool = EXERCISES) {
  if (!isCardioMachine(exercise)) return [];

  const busy = new Set(exercise.equipment || []);

  const matched = pool.filter(e =>
    e.id !== exercise.id &&
    isCardioMachine(e) &&
    e.category === exercise.category &&
    e.movementPattern === exercise.movementPattern &&
    // Rule 4: swapping a treadmill for another treadmill is not a swap.
    !(e.equipment || []).some(q => busy.has(q))
  );

  const byCloseness = (a, b) => {
    const d = Math.abs(a.difficultyLevel - exercise.difficultyLevel)
            - Math.abs(b.difficultyLevel - exercise.difficultyLevel);
    return d !== 0 ? d : String(a.name).localeCompare(String(b.name));
  };

  const resolved = resolveEquipment(userEquipment || []);
  const owned = matched.filter(e => exerciseIsAvailable(e, resolved));

  return (owned.length > 0 ? owned : matched).sort(byCloseness);
}


