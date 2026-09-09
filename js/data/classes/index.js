/**
 * data/classes/index.js
 *
 * 08 Sep 2026 v1
 *
 * CLASS-1. The three written classes, and the safety filter over them.
 *
 * ── WHY THE SAFETY RULES ARE NOT WRITTEN HERE ────────────────────────
 *
 * A class is a sequence of movements, and every movement in it is an
 * exercise the library already knows how to judge. So this file imports
 * getActiveConditionIds() and getExerciseSafetyTier() -- the same two
 * functions practice-library.js uses, which are the same two the session
 * builder uses -- and writes no rule of its own.
 *
 * That is the whole "extend, do not build beside it" instruction. A
 * second set of safety rules for classes would be a second thing to keep
 * in step with conditions data, and it would drift the first time either
 * moved. The failure mode is not subtle: a movement excluded from a
 * built session and offered inside a class.
 *
 * ── WHAT AN 'AVOID' MOVEMENT DOES TO A CLASS ─────────────────────────
 *
 * 🔴 Not the same answer as for a practice, and this is the one real
 * decision in this file.
 *
 * A practice is a single item: if it is unsafe, it is dropped from the
 * list and nothing else changes. A class is fifteen minutes of structure
 * and voice, and dropping one movement out of the middle leaves a class
 * whose script refers to something the person was never shown.
 *
 * So a class is offered when EVERY 'avoid' movement in it has a route
 * round -- a seated alternative or an easier route that is itself safe --
 * and withheld when any does not. Withheld, not silently edited: a class
 * with a hole in it is worse than a class not offered, because the
 * person cannot see what is missing.
 *
 * ⚫ Sitting out is not the same thing and does not count here.
 * `sitOut: true` means the person may choose to skip; it is not the app
 * deciding a movement is unsafe for them and carrying on regardless.
 * Using it as a safety route would turn a considered exclusion into a
 * shrug.
 */

import { getActiveConditionIds, getExerciseSafetyTier } from '../conditions.js';
import { EXERCISES } from '../exercises/index.js';
import { validateClass } from '../class-contract.js';
import { STRANDS } from '../aims.js';

import { CLASS_GROUND_001 }         from './class-ground-001.js';
import { CLASS_STEADY_ROUND_002 }   from './class-steady-round-002.js';
import { CLASS_STOPPING_EARLY_003 } from './class-stopping-early-003.js';

export const CLASSES = Object.freeze([
  CLASS_GROUND_001,
  CLASS_STEADY_ROUND_002,
  CLASS_STOPPING_EARLY_003
]);

const byId = new Map(EXERCISES.map(e => [e.id, e]));

/** Every movement beat in a class, in order, wherever its section sits. */
export function movementBeats(cls) {
  return (cls.sections || [])
    .flatMap(s => s.beats || [])
    .filter(b => b.kind === 'movement' && b.exerciseId);
}

/**
 * Is this class safe to offer, and if not, why not?
 *
 * Returns { offer, blockedBy } where blockedBy names the movements that
 * have no safe route. Named rather than counted, because the caller that
 * eventually explains this to somebody needs the words.
 */
export function classSafety(cls, { conditionIds = [], painScores = {} } = {}) {
  const active = getActiveConditionIds(conditionIds, painScores);
  const tier = (id) => {
    const ex = byId.get(id);
    return ex ? getExerciseSafetyTier(ex, active) : null;
  };

  const blockedBy = [];
  for (const b of movementBeats(cls)) {
    if (tier(b.exerciseId) !== 'avoid') continue;

    // A route round has to be safe itself. An alternative that is also
    // on the avoid list is not an alternative.
    const routes = [b.seatedAlternativeId, b.easierRouteId].filter(Boolean);
    const safeRoute = routes.some(id => {
      const t = tier(id);
      return t !== null && t !== 'avoid';
    });
    if (!safeRoute) blockedBy.push(byId.get(b.exerciseId)?.name || b.exerciseId);
  }

  return { offer: blockedBy.length === 0, blockedBy };
}

/**
 * The classes that can be offered, safety applied.
 *
 * Sorted by nothing. Ordering a class list is a product decision -- by
 * strand, by length, by what the arc wants next -- and inventing one
 * here would be a default nobody chose.
 */
export function getClasses({ conditionIds = [], painScores = {} } = {}) {
  return CLASSES
    .map(cls => ({ ...cls, safety: classSafety(cls, { conditionIds, painScores }) }))
    .filter(c => c.safety.offer);
}

/** Classes that SERVE a strand. Not the ones that merely touch it. */
export function classesForStrand(strandId, opts = {}) {
  return getClasses(opts).filter(c => c.serves === strandId);
}

/**
 * Validates every class in the set against the contract, with the real
 * strand and exercise ids. Used by verify-class-contract; exported so a
 * content author can run the same check on a class they are writing
 * rather than discovering it in a gate.
 */
export function validateAll(classes = CLASSES) {
  const opts = {
    strandIds:   new Set(Object.keys(STRANDS)),
    exerciseIds: new Set(EXERCISES.map(e => e.id))
  };
  return classes.map(cls => ({
    id: cls.id,
    ...validateClass(cls, opts)
  }));
}
