/**
 * pacing.js - Proactive pacing
 * 15 Aug 2026 v1
 *
 * PACE-1 and PACE-2. Matrix decisions 4 and 4a, agreed 05 Jul 2026 and
 * unbuilt until now. Persona 2.8 — dyspraxia and autism, enthusiastic
 * but unregulated, "sets unrealistic expectations, burns hot and cold,
 * needs to trust the relationship rather than chase constant exercise".
 *
 * She is the only persona in the matrix whose failure mode is HARM
 * rather than disappointment. Everybody else who is badly served gets
 * bored; she overdoes it, hurts herself or crashes, and stops.
 *
 * TWO THINGS, BOTH SOFT
 *
 * PACE-1, the daily cap. A third logged exercise activity in one
 * calendar day gets a warm check-in. It never blocks a fourth, or a
 * tenth. Recovery items do not count. Mindful and Noticing activities
 * are uncapped entirely — someone doing three breathing practices in a
 * day is not overreaching, and treating it as a cap to be warned about
 * would be actively wrong for persona 2.11, who enters through that
 * door.
 *
 * PACE-2, the plan jump. When the weekly target is set sharply above
 * what the person has actually been doing, the coach names the gap and
 * offers to ease in. Also never blocking.
 *
 * WHY NEITHER OF THESE IS A LIMIT
 *
 * The whole product refuses to tell people what they cannot do. A hard
 * cap would be the shortest possible route to the thing 2.8 has already
 * had from everything else: being told she is doing it wrong. So the
 * coach says what it noticed, says what it would suggest, and then gets
 * out of the way. If she does a fourth session it says nothing further
 * that day.
 *
 * P4 (Locked) throughout: the coach displays what happened and offers a
 * next step. It does not diagnose overtraining, predict injury, or tell
 * her how her body feels.
 */

import { store } from '../store.js';

/**
 * Activity types that count toward the daily cap.
 *
 * Derived from the actual logActivity() call sites, not guessed — a
 * plausible-but-wrong type string here would silently make the cap
 * uncountable, which is the fault class this project has paid for
 * repeatedly. Verified 15 Aug against every view that logs.
 */
const EXERCISE_TYPES = new Set([
  'core-session', 'prescribed-session', 'workout', 'gym',
  'morning-session', 'yoga', 'run', 'walk', 'swim', 'cycle',
]);

/**
 * Explicitly NOT counted, per matrix decision 4a.
 *
 * 'mindful' and 'mindfulness' are the Noticing and breathing doors.
 * Uncapped entirely and deliberately: three breathing practices is not
 * overreaching, and warning somebody about it would punish exactly the
 * behaviour this product most wants to make easy.
 */
const UNCAPPED_TYPES = new Set(['mindful', 'mindfulness']);

/** Third activity in a day is the one that gets noticed. */
const DAILY_SOFT_CAP = 3;

/** A week between plan nudges. Twice would be nagging. */
const PLAN_NUDGE_COOLDOWN_DAYS = 7;

/** Below this, a jump is not sharp enough to be worth naming. */
const PLAN_JUMP_MIN_GAP = 2;

function _today() {
  return new Date().toISOString().split('T')[0];
}

function _dayOf(entry) {
  const ts = entry?.completedAt || entry?.loggedAt || entry?.date;
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d) ? null : d.toISOString().split('T')[0];
}

/**
 * How many capped exercise activities were completed today.
 *
 * Counts completions only. A partial exit is not a session the person
 * did, and counting it toward a cap would mean opening and closing a
 * screen three times triggered a pacing message.
 *
 * @returns {number}
 */
export function todaysExerciseCount() {
  const log = store.completedSessions(store.get('activityLog') || []);
  const today = _today();
  return log.filter(e =>
    _dayOf(e) === today &&
    EXERCISE_TYPES.has(e.type) &&
    !UNCAPPED_TYPES.has(e.type)
  ).length;
}

/**
 * Should the daily pacing line be shown right now?
 *
 * True on the day the count first reaches the cap, and only once. A
 * fourth and fifth session that day pass in silence — she has heard it,
 * and repeating it would turn a single observation into pressure.
 *
 * @returns {boolean}
 */
export function shouldNoticeDailyPace() {
  if ((store.get('pacing') || {}).noticedOn === _today()) return false;
  return todaysExerciseCount() >= DAILY_SOFT_CAP;
}

/**
 * The daily pacing block, or null.
 *
 * Call after logging a session. Records that it was shown, so it fires
 * once per day regardless of how many times the done screen renders.
 *
 * @returns {{heading:string, body:string}|null}
 */
export function noticeDailyPace() {
  if (!shouldNoticeDailyPace()) return null;
  const pacing = { ...(store.get('pacing') || {}) };
  pacing.noticedOn = _today();
  store.set('pacing', pacing);

  return {
    heading: "That's three today.",
    // Says what it noticed. Offers a view. Does not instruct, does not
    // predict, and explicitly does not close the door — "if you want a
    // fourth, have a fourth" is the line that stops this being a limit.
    body: "I'm not going to tell you to stop — if you want a fourth, have a fourth. I only mention it because rest is part of the work, and it's the part that's easiest to skip when you're enjoying yourself."
  };
}

/**
 * Average completed exercise sessions per week over the last N weeks.
 *
 * Returns null when there is not enough history to say anything, which
 * matters: telling somebody in week one that their plan is a big jump
 * from their history would be nonsense, and it would land on exactly the
 * enthusiasm the product wants to meet warmly.
 *
 * @param {number} weeks
 * @returns {number|null}
 */
export function recentWeeklyAverage(weeks = 3) {
  const log = store.completedSessions(store.get('activityLog') || []);
  const cutoff = Date.now() - weeks * 7 * 86400000;
  const recent = log.filter(e => {
    const ts = e.completedAt || e.loggedAt || e.date;
    return ts && new Date(ts).getTime() >= cutoff &&
           EXERCISE_TYPES.has(e.type) && !UNCAPPED_TYPES.has(e.type);
  });
  // Fewer than two weeks of anything is not a pattern.
  const first = store.get('createdAt');
  if (first && (Date.now() - new Date(first).getTime()) < 14 * 86400000) return null;
  return recent.length / weeks;
}

/**
 * Is the weekly plan a sharp jump from what has actually been happening?
 *
 * Matrix decision 4: "when a plan jumps sharply from recent actual
 * history, the coach names the gap warmly and offers to ease in — never
 * blocking."
 *
 * Only speaks about a target the person CHOSE. strategicGoal.setAt is
 * the honest test — the default of 3 is not a plan anybody made, and
 * naming a gap against it would invent a commitment as well as a
 * shortfall.
 *
 * @returns {{heading:string, body:string}|null}
 */
export function noticePlanJump() {
  if (!store.get('strategicGoal.setAt')) return null;

  const target = store.get('strategicGoal.weeklySessionTarget');
  if (typeof target !== 'number') return null;

  const avg = recentWeeklyAverage();
  if (avg === null) return null;

  const gap = target - avg;
  if (gap < PLAN_JUMP_MIN_GAP) return null;

  const last = (store.get('pacing') || {}).planNudgeAt;
  if (last && (Date.now() - new Date(last).getTime()) < PLAN_NUDGE_COOLDOWN_DAYS * 86400000) {
    return null;
  }

  const pacing = { ...(store.get('pacing') || {}) };
  pacing.planNudgeAt = new Date().toISOString();
  store.set('pacing', pacing);

  const rounded = avg < 1 ? 'not much' : `about ${Math.round(avg)} a week`;
  return {
    heading: "Can I say something about the plan?",
    // Names the gap using her own two numbers and nothing else. Offers
    // the smaller version as a suggestion she can ignore, and says
    // plainly that the ambitious version is allowed — otherwise this
    // reads as the app deciding she cannot manage it.
    body: `You've set ${target} a week, and lately it's been ${rounded}. That's a real jump. You can absolutely go for it — but if you'd rather build up to it, starting nearer where you are tends to be the version people are still doing in a month.`
  };
}

export const _EXERCISE_TYPES = EXERCISE_TYPES;
export const _UNCAPPED_TYPES = UNCAPPED_TYPES;
export const _DAILY_SOFT_CAP = DAILY_SOFT_CAP;
