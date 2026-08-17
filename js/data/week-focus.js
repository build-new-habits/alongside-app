/**
 * week-focus.js - The weekly focus
 * 17 Aug 2026 v1
 *
 * CHAP-1 step 4, per alongside_blueprint_chapters_15aug2026_v1.md §6.
 *
 * FOCUS, NOT GOAL, and the single word is the whole safety margin. A
 * weekly goal can be missed. A weekly focus cannot -- it describes what
 * the coach will lean into, not what the person must achieve. Required
 * weekly goal-setting is a weekly chore and loses 2.16; an unchangeable
 * focus is a prescription and loses 2.4. Proposed-and-editable is the
 * autonomy route.
 *
 * NEVER SCORED, NEVER COUNTED, ABSENCE NEVER MENTIONED. There is no
 * end-of-week report, no "you did 3 of your 4 focus sessions", and no
 * record of whether the focus was honoured. A focus reported on at week
 * end is a target wearing a different hat.
 *
 * ── THE THIRD ATTEMPT AT THE LEVER, and why the first two failed ────
 *
 * A coach that says "I'm leaning towards the hinging this week" and
 * changes nothing is making a claim the product does not honour, which
 * is worse than silence. So the tilt has to be real, and it has been
 * measured rather than assumed each time.
 *
 * ATTEMPT 1 -- tilt candidates inside pickFrom(). MEASURED: 39 focus
 * movements across 40 builds, against 40 without. No effect. pickFrom()
 * receives a pool ALREADY filtered to one category, so filtering it
 * again by movement pattern is close to a no-op -- the category has
 * already decided the pattern. Reverted.
 *
 * ATTEMPT 2 -- tilt the week's session types via getWeekShape().
 * TRACED BEFORE BUILDING: activeProgramme.weekPlan and sessionSequence
 * both had writers and no readers. It would have written to a field
 * nobody read. Not built; PLAN-1 fixed the underlying gap instead.
 *
 * ATTEMPT 3 -- this one. selectFromCategories() prioritises variety
 * "one from each category first", and drops later categories when slots
 * run out. So the ORDER of a session type's mainCategories decides what
 * actually gets a slot. Reordering it is a genuine, measurable
 * preference -- and it is a REORDER, never a filter, so nothing is
 * starved and the warm-up floor is untouched.
 *
 * The lesson is not that the first two were careless. It is that a
 * lever must be measured or traced before anything is built on it, and
 * that "the code runs" is not the same claim as "the code does
 * something".
 */

import { store } from '../store.js';
import { _PATTERN_QUESTIONS } from './assessment.js';

/**
 * The focuses on offer, from the same movement patterns the assessment
 * asks about -- one list, so the thing the coach leans into is always
 * something it can also ask about.
 *
 * `categories` is the bridge to session building. These are real
 * category names from the session types in session-builder.js; a focus
 * with no matching category would be a focus that cannot tilt anything.
 */
export const FOCUS_OPTIONS = [
  { key: 'squat',     categories: ['squat-pattern', 'single-leg', 'leg-isolation'] },
  { key: 'push',      categories: ['horizontal-push', 'shoulder-isolation'] },
  { key: 'pull',      categories: ['horizontal-pull', 'vertical-pull'] },
  { key: 'hinge',     categories: ['hip-hinge', 'bridge', 'loaded-carry'] },
  { key: 'endurance', categories: ['interval', 'easy-cardio', 'conditioning'] }
].map(f => {
  const q = _PATTERN_QUESTIONS.find(p => p.key === f.key);
  return { ...f, label: (q?.label || f.key).replace(/^the /, ''), patterns: q?.patterns || [] };
});

const byKey = k => FOCUS_OPTIONS.find(f => f.key === k) || null;

function _weekStart(d = new Date()) {
  const day  = d.getDay();
  const back = day === 0 ? 6 : day - 1;   // Monday-anchored
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - back).toISOString();
}

function _isThisWeek(iso) {
  if (!iso) return false;
  const then = new Date(iso).getTime();
  return !isNaN(then) && then >= new Date(_weekStart()).getTime();
}

/** The focus for this week, read-only. Null when there is none, and the
 *  caller then says NOTHING -- §6: its absence is never mentioned. */
export function currentWeekFocus() {
  const wf = store.get('weekFocus') || {};
  if (!wf.key || !_isThisWeek(wf.proposedAt)) return null;
  return byKey(wf.key);
}

/**
 * Propose a focus for this week, if there is not one already.
 *
 * It will NOT overwrite a focus the person chose themselves this week --
 * `editedByUser` exists precisely so a proposal cannot quietly undo an
 * adjustment, which would make "the coach proposes, the person adjusts"
 * untrue by the second day.
 *
 * And it proposes nothing without a read to propose from. Picking one at
 * random would be the coach inventing a reason, which is worse than
 * silence.
 */
export function proposeWeekFocus() {
  const existing = currentWeekFocus();
  if (existing) return existing;

  const a = store.get('assessment') || {};
  const last = (a.history && a.history.length) ? a.history[a.history.length - 1] : a.baseline;
  const results = last && last.results ? last.results : null;
  if (!results) return null;

  // The hardest thing they reported, 'too-much' before 'hard'.
  // Deliberately NOT the easiest: leaning into what somebody already
  // finds comfortable is how a programme quietly stops asking anything.
  let chosen = null;
  for (const level of ['too-much', 'hard']) {
    const hit = FOCUS_OPTIONS.find(f => results[f.key] === level);
    if (hit) { chosen = hit; break; }
  }
  if (!chosen) return null;

  store.set('weekFocus', {
    key: chosen.key,
    proposedAt: new Date().toISOString(),
    editedByUser: false
  });
  return chosen;
}

/** The person adjusts it. `key` may be null -- "no focus this week" has
 *  to stay available, because a focus nobody can decline is a
 *  prescription. */
export function setWeekFocus(key) {
  if (key === null) {
    store.set('weekFocus', { key: null, proposedAt: new Date().toISOString(), editedByUser: true });
    return null;
  }
  const focus = byKey(key);
  if (!focus) return currentWeekFocus();
  store.set('weekFocus', { key: focus.key, proposedAt: new Date().toISOString(), editedByUser: true });
  return focus;
}

/**
 * Reorder a session type's main categories so the focus leads.
 *
 * A REORDER, NEVER A FILTER. Every original category stays in the list
 * and in the same relative order behind the focus ones. selectFromCategories()
 * takes one from each category in turn and drops the tail when slots run
 * out, so leading with the focus changes what gets a slot without
 * starving anything -- and a week where somebody's focus simply is not
 * in this session type's categories returns the list untouched.
 *
 * @param {string[]} categories  a session type's mainCategories
 * @returns {string[]} the same categories, possibly reordered
 */
export function focusOrderedCategories(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return categories;
  const focus = currentWeekFocus();
  if (!focus) return categories;

  const lead = categories.filter(c => focus.categories.includes(c));
  if (lead.length === 0) return categories;      // nothing to lead with
  return [...lead, ...categories.filter(c => !lead.includes(c))];
}

/**
 * The coach's line. Invitational, and it says WHY.
 *
 * No "your goal this week", no "make sure you", nothing that could be
 * ticked off. "Leaning towards" is deliberately soft because that is
 * exactly what it is: a tilt in what gets offered.
 */
export function focusLine() {
  const f = currentWeekFocus();
  if (!f) return null;
  const wf = store.get('weekFocus') || {};
  return wf.editedByUser
    ? `You've asked me to lean towards ${f.label} this week.`
    : `I'm leaning towards ${f.label} this week — it came up as the harder one last time I asked.`;
}
