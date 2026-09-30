/**
 * data/classes/index.js
 *
 * 30 Sep 2026 v5
 *
 * v5 - W3-0 (Wave 3, persona 2.11). A seated ALTERNATIVE no longer counts:
 *   nothing in js/views reads seatedAlternativeId, so the player never
 *   offers it. Getting Going stops saying "can be done seated" until its
 *   Sit to stand and Up on your toes words give the seated version.
 *
 * v4 - S1-SEATED. seatedThroughout() and unseatedSteps(): whether every
 *   movement step gives a seated version in its own words, alternative or
 *   position. The class list reads it.
 *
 * v3 - F8, CLASS-8. Classes 008-010 added: Putting the Day Down
 *   (winding-down), Getting Going (getting-going), From the Feet
 *   (ankle-range).
 *
 * 08 Sep 2026 v2
 *
 * v2 - TIMETABLE-1. blockedBy is de-duplicated. Steady Round uses a
 *   glute bridge in both rounds, and naming it twice in one sentence
 *   reads as a bug in the app rather than a fact about the class.
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
import { CLASS_BENDING_004 }        from './class-bending-004.js';
import { CLASS_STANDING_UP_005 }    from './class-standing-up-005.js';
import { CLASS_OUT_006 }            from './class-out-006.js';
import { CLASS_UNSTICKING_007 }     from './class-unsticking-007.js';
import { CLASS_PUTTING_DOWN_008 }   from './class-putting-down-008.js';
import { CLASS_GETTING_GOING_009 }  from './class-getting-going-009.js';
import { CLASS_FROM_THE_FEET_010 }  from './class-from-the-feet-010.js';

export const CLASSES = Object.freeze([
  CLASS_GROUND_001,
  CLASS_STEADY_ROUND_002,
  CLASS_STOPPING_EARLY_003,
  CLASS_BENDING_004,
  CLASS_STANDING_UP_005,
  CLASS_OUT_006,
  CLASS_UNSTICKING_007,
  CLASS_PUTTING_DOWN_008,
  CLASS_GETTING_GOING_009,
  CLASS_FROM_THE_FEET_010
]);

const byId = new Map(EXERCISES.map(e => [e.id, e]));

/** Every movement beat in a class, in order, wherever its section sits. */
export function movementBeats(cls) {
  return (cls.sections || [])
    .flatMap(s => s.beats || [])
    .filter(b => b.kind === 'movement' && b.exerciseId);
}

/**
 * S1-SEATED, 30 Sep 2026. Can somebody do this whole class sitting down,
 * going by what it SAYS? The player plays words only (seatedAlternativeId
 * has no reader there), so a declared seatedRoute is not enough: each
 * movement step needs a seated version the person can find. A step has
 * one when its movement is seated or position-free, when its own words
 * say how to do it sitting, when its
 * words make it optional ("if that's available"), or when it is a breath.
 * Returns the titles of the steps that have none.
 */
// Instructions, not mentions: "shortened in a chair" is not a way to do it.
const SEATED_WORDS   = /\b(seated|sitting|sit tall|or sit|stay (in the chair|sitting))\b/i;
const OPTIONAL_WORDS = /\bif (standing is fine|that['\u2019]?s available)\b/i;
const _seatedPos = id => { const p = byId.get(id)?.position; return p === 'seated' || p === 'any'; };
export function unseatedSteps(cls) {
  const out = [];
  for (const s of cls.sections || []) {
    const beats = s.beats || [];
    const moves = beats.filter(b => b.kind === 'movement' && b.exerciseId);
    if (!moves.length) continue;
    const said = [s.title || '', ...beats.flatMap(b => [b.screen || '', b.voice || ''])].join(' ');
    const fine = moves.every(b =>
      _seatedPos(b.exerciseId) ||
      // W3-0: not seatedAlternativeId. The player never reads it.
      /breath/i.test(byId.get(b.exerciseId)?.movementPattern || '') ||
      SEATED_WORDS.test(said) || OPTIONAL_WORDS.test(said));
    if (!fine) out.push(s.title);
  }
  return out;
}
export function seatedThroughout(cls) {
  // Nothing to check is not the same as seated: Out is a walk.
  if (!movementBeats(cls).length) return cls.position === 'seated';
  return unseatedSteps(cls).length === 0;
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

  // TIMETABLE-1. Unique. A class can use the same movement in two
  // sections -- Steady Round has a glute bridge in both rounds -- and
  // naming it twice in one sentence reads as a mistake in the app rather
  // than a fact about the class.
  return { offer: blockedBy.length === 0, blockedBy: [...new Set(blockedBy)] };
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
