/**
 * data/practice-library.js
 *
 * 12 Sep 2026 v2
 *
 * v2 - PRAC-2. The reachability test now applies the builder's OWN length
 * rule, and cardio splits into groups.
 *
 *   WHAT WAS WRONG. reachableByAnySessionType() asked "does any session
 *   type match this by category" and stopped. session-builder.js then
 *   drops anything ten minutes or longer through isSessionLength(). So a
 *   20-minute rowing session matched `conditioning`, was counted
 *   reachable, and was built by nothing. Each rule assumed the other one
 *   held them, and 136 entries appeared NOWHERE in the app -- 90 cardio,
 *   21 recovery, 9 mobility, 9 mindfulness, 7 strength. Brisk Walk,
 *   Steady Cycling, HIIT 30:30, every couch-to-5K week. This route showed
 *   28 of 164.
 *
 *   Third time this shape has appeared: the 28 that created this file in
 *   August, the machine blocks on 12 Sep, and these.
 *
 *   GROUPS SHIPPED IN THE SAME CHANGE, and had to. Closing the gap alone
 *   takes cardio from 5 items to 81 in a single list, which is the same
 *   "I could not get to what I wanted" problem in a different room.
 *
 * 18 Aug 2026 v1
 *
 * PRAC-1. The way in to the whole practices — the items the exercise
 * database holds that no session can be built from.
 *
 * ── WHY THIS FILE EXISTS ──────────────────────────────────────────────
 *
 * 28 items in EXERCISES were referenced by no view at all. Not the
 * Library, not Mobility & Conditioning, not the single-activity views.
 * A comment in exercises/index.js said they were "reached through the
 * Library", which is why the gap survived for as long as it did: the
 * code claimed the route existed, so nobody looked.
 *
 * getSuitableExercises() filters them out through isSessionLength(),
 * and that filter is CORRECT and is not touched here. A twenty-minute
 * EMOM circuit cannot be one of four picks in a main section. Whole
 * sessions are not components. What was missing was never the filter.
 * It was the door.
 *
 * ── HOW THE SET IS DEFINED, AND WHY NOT AS A LIST ─────────────────────
 *
 * The obvious implementation is an array of 28 ids in this file. That
 * is the exact shape of the fault that cost most of 16–17 Aug: one idea
 * held in two places, drifting apart silently. Four names for
 * targetDate. A comment describing a route that was never built.
 *
 * So the set is DERIVED, never listed:
 *
 *   session-length  AND  matched by no category any session type uses
 *
 * Both halves come from code that already exists and is already the
 * authority for its half — isSessionLength() and matchCategory() over
 * SESSION_TYPES. This is the same rule tools/audit-content-reachability
 * uses to report standalone content, so the audit and the route cannot
 * disagree about what is stranded.
 *
 * It also fails in the safe direction. Add a practice tomorrow with no
 * category home and it appears here on the day it is added, with no
 * list to remember to update. That is the property the 28 needed and
 * did not have.
 *
 * ── THE OTHER SOURCE, AND WHY IT STAYS WHERE IT IS ────────────────────
 *
 * quiet-session.js keeps its own BREATHING_EXERCISES and
 * MINDFUL_SESSIONS arrays. It is worth being precise about whether that
 * is the same fault, because it looks like it.
 *
 * It is not. Zero of the ids in this set appear in either array, and
 * neither array can be replaced by the database: they carry phase
 * timings and guided sequence text the database does not hold, and
 * quiet-session's DB_ID map already reconciles the two vocabularies in
 * one direction, with one owner. Two places holding DIFFERENT facts
 * about DIFFERENT items is not duplication. Two places holding the same
 * fact is.
 *
 * The consequence for this route: it reads the database and only the
 * database. It copies no entry into a local array, and it does not
 * absorb the breathing patterns, which have no database equivalent to
 * absorb.
 *
 * ── SAFETY ────────────────────────────────────────────────────────────
 *
 * Practices are free and are never gated. They are not exempt from
 * condition safety. Three of the circuits carry real contraindications,
 * so the same canonical path every session view uses —
 * getActiveConditionIds() then getExerciseSafetyTier() — runs here too.
 * 'avoid' is removed; 'caution' is surfaced to the person rather than
 * silently dropped.
 *
 * Capability is deliberately NOT filtered. Hiding a circuit from
 * somebody because of an energyRequired ceiling would be a silent
 * downgrade on a self-directed screen, which is the pattern TIER-B was
 * raised to remove. The intensity is stated on the group instead.
 */

import { EXERCISES, isSessionLength, isCardioMachine } from './exercises/index.js';
import { matchCategory } from './session-categories.js';
import { getActiveConditionIds, getExerciseSafetyTier } from './conditions.js';
import { SESSION_TYPES } from '../session-builder.js';

/**
 * Every exercise id any session type can reach through a category.
 * Computed once per call rather than cached, because SESSION_TYPES is
 * static and the whole pass is a few milliseconds — a stale cache is a
 * worse failure than a recomputation.
 */
function reachableByAnySessionType() {
  const reachable = new Set();
  for (const type of SESSION_TYPES) {
    const cats = [
      ...(type.warmupCategories   || []),
      ...(type.mainCategories     || []),
      ...(type.cooldownCategories || [])
    ];
    for (const cat of cats) {
      for (const section of ['warmup', 'main', 'cooldown']) {
        for (const ex of matchCategory(EXERCISES, cat, section)) {
          // PRAC-2, 12 Sep 2026. THE BUILDER'S OWN LENGTH RULE, APPLIED HERE.
          //
          // This function asked "does any session type match this by
          // category" and stopped there -- but session-builder.js then drops
          // anything ten minutes or longer through isSessionLength(). So a
          // 20-minute rowing session matched `conditioning`, was counted
          // reachable, and was never built by anything. 136 entries fell
          // into that gap and appeared NOWHERE: 90 cardio, 21 recovery, 9
          // mobility, 9 mindfulness, 7 strength. Brisk Walk, Steady Cycling,
          // HIIT 30:30, Walk-Run Intervals, every couch-to-5K week.
          //
          // Each rule had assumed the other one held them. Reachable now
          // means BUILDABLE, which is what the word was always claiming.
          if (!isSessionLength(ex)) reachable.add(ex.id);
        }
      }
    }

    // GYM-MIX-1's feature slot is the one place a long item IS buildable,
    // so the nine machine blocks genuinely do have a home now and are not
    // stranded. Reading the slot rather than naming the type keeps this
    // true for the next type that declares one.
    const slot = type.featureSlot;
    if (slot?.allowSessionLength) {
      for (const cat of (slot.categories || [])) {
        for (const ex of matchCategory(EXERCISES, cat, 'main')) {
          if (!slot.requiresEquipment || isCardioMachine(ex)) reachable.add(ex.id);
        }
      }
    }
  }
  return reachable;
}

/**
 * PRAC-2. Which group a practice belongs in.
 *
 * Everything is grouped by its library category, as before, EXCEPT cardio.
 * Closing the gap above took cardio from 5 items to 81, and one list of 81
 * is the same "I could not get to what I wanted" problem in a different
 * room. So cardio splits by what you would actually be doing.
 *
 * HOW EACH SPLIT IS DECIDED, AND HOW SURE IT IS:
 *
 *   Swimming   movementPattern === 'swim'. Structural; certain.
 *   Cycling    needs a bike. Structural; certain.
 *   Running    THE ID PREFIX, then the name. The only heuristic here --
 *              running and cycling are both `locomotion` and nothing
 *              structural separates them.
 *
 *              Name alone was the first attempt and it was not good
 *              enough: it put "C25K - Week 1 Session", "400m Intervals",
 *              "Hill Repeat Session", "Cadence Drill" and "Stride-Outs"
 *              in the general cardio group. Twelve running sessions filed
 *              as conditioning. The `run-` and `c25k-` id prefixes are an
 *              authoring convention rather than a guarantee, which is why
 *              verify-prac2 pins a named list of running ids: if the
 *              convention changes, that gate fails rather than the group
 *              quietly emptying.
 *   Cardio     everything else, which is where a new entry lands by
 *              default. Failing INTO the general group is the safe
 *              direction: a new practice is visible in the wrong group
 *              rather than invisible in the right one.
 */
export function practiceGroupFor(ex) {
  if (!ex) return 'cardio';
  if (ex.category !== 'cardio') return ex.category;
  if (ex.movementPattern === 'swim') return 'swimming';
  if ((ex.equipment || []).includes('bicycle')) return 'cycling';
  if (/^(run|c25k)-/.test(ex.id || '')) return 'running';
  if (/\b(run|runs|running|jog|jogging|sprint|sprints|couch to 5k|c25k|5k|10k|parkrun|strides)\b/i.test(ex.name || '')) return 'running';
  return 'cardio';
}

/**
 * The standalone practices: whole items with no other home in the
 * product. Derived, never listed. See the header.
 */
export function getStandalonePractices() {
  const reachable = reachableByAnySessionType();
  return EXERCISES.filter(ex => isSessionLength(ex) && !reachable.has(ex.id));
}

/**
 * Presentation for the groups we currently hold content for.
 *
 * `movement: true` means the practice is a physical session with a form
 * to get wrong, which decides whether watchOut and load are shown — see
 * practices.js for why that distinction is drawn on presentation rather
 * than on the data.
 *
 * A category with no entry here still appears, under its own name. New
 * content becoming invisible is the fault this whole route exists to
 * fix; it must not be reintroduced by a lookup table.
 */
const GROUP_META = {
  recovery: {
    label: 'Recovery',
    description: 'Ways to help your body settle after effort, or on a day with none.',
    movement: false,
    order: 1
  },
  mindfulness: {
    label: 'Grounding and calm',
    description: 'Short practices for when things feel loud, tight or far away.',
    movement: false,
    order: 2
  },
  mobility: {
    label: 'Warm-ups',
    description: 'Full warm-ups to do before a match, a class or a session elsewhere.',
    movement: true,
    order: 3
  },
  strength: {
    label: 'Circuits',
    description: 'Whole circuit sessions, start to finish. These are hard work by design.',
    movement: true,
    order: 4
  },
  // PRAC-2, 12 Sep 2026. The groups that arrived when the gap closed.
  running: {
    label: 'Running',
    description: 'Whole runs, from first-week walk-runs to longer efforts.',
    movement: true,
    order: 5
  },
  cardio: {
    label: 'Cardio and conditioning',
    description: 'Whole sessions to get your heart going. Walks, intervals, circuits and games.',
    movement: true,
    order: 6
  },
  swimming: {
    label: 'Swimming',
    description: 'Pool sessions and drill sets, start to finish.',
    movement: true,
    order: 7
  },
  cycling: {
    label: 'Cycling',
    description: 'Rides and turbo sessions. You will need a bike.',
    movement: true,
    order: 8
  }
};

function metaFor(category) {
  return GROUP_META[category] || {
    label: category.charAt(0).toUpperCase() + category.slice(1),
    description: '',
    movement: true,
    order: 99
  };
}

/**
 * Groups, with safety already applied.
 *
 * @param {object} opts
 * @param {string[]} opts.conditionIds  from store 'conditions'
 * @param {object}   opts.painScores    from store 'conditionPainScores'
 * @returns {Array<{id,label,description,movement,items}>}
 *          items carry an added `safety` of 'safe' | 'caution'.
 *          'avoid' never appears.
 */
export function getPracticeGroups({ conditionIds = [], painScores = {} } = {}) {
  const active = getActiveConditionIds(conditionIds, painScores);

  const byCategory = new Map();
  for (const ex of getStandalonePractices()) {
    const safety = getExerciseSafetyTier(ex, active);
    if (safety === 'avoid') continue;
    // PRAC-2. Grouped by practiceGroupFor(), not raw category.
    const groupId = practiceGroupFor(ex);
    if (!byCategory.has(groupId)) byCategory.set(groupId, []);
    byCategory.get(groupId).push({ ...ex, safety });
  }

  return [...byCategory.entries()]
    .map(([category, items]) => {
      const meta = metaFor(category);
      return {
        id:          category,
        label:       meta.label,
        description: meta.description,
        movement:    meta.movement,
        order:       meta.order,
        items:       items.sort((a, b) => (a.duration || 0) - (b.duration || 0))
      };
    })
    .filter(g => g.items.length > 0)
    .sort((a, b) => a.order - b.order);
}

/**
 * One practice by id, safety-checked, or null. Used by the player so a
 * direct route into a practice cannot bypass the exclusion the list
 * applies.
 */
export function getPractice(id, { conditionIds = [], painScores = {} } = {}) {
  for (const group of getPracticeGroups({ conditionIds, painScores })) {
    const hit = group.items.find(item => item.id === id);
    if (hit) return { ...hit, group };
  }
  return null;
}
