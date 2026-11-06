/**
 * js/data/in-step-offer.js
 * 06 Nov 2026 v1
 *
 * P-28 EMPATHY-THREAD, S3. When In Step's programme is offered on a
 * finish, which episode, and where the person is in it. The proposal
 * (BNH-Files Product/alongside_empathy_thread_proposal_05nov2026_v1.md,
 * 3.3 to 3.7) and the build blueprint, both approved 05 Nov:
 *
 *   - Offered after a finished session (never part-way), from session 3,
 *     at most every second finished session and once a day. Never before a
 *     session, in the check-in or in Home's doors.
 *   - Not today is always there, and never pushes the next offer away: the
 *     cadence counts from when it was offered, whatever the answer.
 *   - Never on a Bad day (anything sore at Bad).
 *   - A low energy or low mood day: only Part 1's episode 6, Adjusting
 *     (Graeme, 06 Nov), with the proposal's line, "This one's short and
 *     about you today."
 *   - The order is kept (Graeme, 18 Aug: "I can access all of it and
 *     therefore none of it lands"): the offer is the next episode in order.
 *     Wellbeing keeps any episode already done open, any time.
 *   - B: on a finish where they checked in today and no episode is
 *     offered, now and then (every third finished session), one of the
 *     finish lines about other people's check-ins, only when true
 *     (empathy-transfer.js FINISH_B_LINES).
 *
 * Writes only Schema v1.123's inStepProgress.programme: the part and
 * episode, the episodes done, the last Carry it's id, the last tap after
 * "Did it come up?", and when it was last offered. Never words, never a
 * choice, never a score.
 */
import { store } from "../store.js";
import { getTodaysCheckin } from "./checkin.js";
import { bodyAreasOf, isBad } from "./conditions.js";
import { EPISODES, getEpisode, getPart, nextEpisodeId } from "./in-step-programme.js";
import { eligibleFinishBLines } from "./empathy-transfer.js";

export const OFFER_FROM_SESSION = 3;   // "The first episode can come after session 3"
export const OFFER_GAP          = 2;   // "every second finished session at most"
export const LOW_DAY_EPISODE    = "p1e6";
export const LOW_DAY_LINE       = "This one's short and about you today.";
export const B_EVERY            = 3;   // B lines "now and then"
export const LOW_ENERGY_MAX     = 4;   // as the finish lines (reflect.js)
export const LOW_MOOD_MAX       = 3;   // the check-in's Struggling and Low
export const ANSWER_IDS         = ["did", "not-yet", "didnt"];

const DEFAULT = Object.freeze({ part: 1, episode: 1, done: [], lastCarry: null, lastAnswer: null, offeredAt: null, offeredSession: 0 });

/** The programme record, always whole. */
export function programme() {
  const p = (store.get("inStepProgress") || {}).programme;
  return p && typeof p === "object" ? { ...DEFAULT, ...p, done: Array.isArray(p.done) ? p.done : [] } : { ...DEFAULT, done: [] };
}

function _save(p) {
  const isp = store.get("inStepProgress") || {};
  store.set("inStepProgress", { ...isp, programme: p });
}

/** The next episode in order, or null when all 24 are done. */
export function currentEpisodeId(p = programme()) {
  const id = `p${p.part}e${p.episode}`;
  if (!getEpisode(id)) return EPISODES[0].id;
  return p.done.includes(id) && nextEpisodeId(id) === null ? null : id;
}

/** Open from Wellbeing: done already, or the next in order. */
export function isOpen(id, p = programme()) {
  return !!getEpisode(id) && (p.done.includes(id) || id === currentEpisodeId(p));
}

/** The line that opens an episode: last time's Carry it, if there was one. */
export function lastTimeLine(p = programme()) {
  if (!p.lastCarry) return null;
  const next = nextEpisodeId(p.lastCarry);
  return next ? getEpisode(next).prev : null;
}

/** The tap after "Did it come up?". Only one of the three, nothing else. */
export function answerLastTime(answer) {
  if (!ANSWER_IDS.includes(answer)) return;
  _save({ ...programme(), lastAnswer: answer });
}

/** An episode reached its Carry it. The next in order moves on only when this was it. */
export function completeEpisode(id) {
  if (!getEpisode(id)) return;
  const p = programme();
  const wasCurrent = id === currentEpisodeId(p);
  const done = p.done.includes(id) ? p.done : [...p.done, id];
  let { part, episode } = p;
  if (wasCurrent) {
    const next = nextEpisodeId(id);
    if (next) { const e = getEpisode(next); part = e.part; episode = e.episode; }
  }
  _save({ ...p, done, part, episode, lastCarry: id, lastAnswer: null });
}

/** What today says about offering: from the check-in and the sore areas. */
export function dayContext() {
  const c = getTodaysCheckin() || {};
  const checkedInToday = typeof c.energy === "number" || typeof c.mood === "number";
  const scores = store.get("conditionPainScores") || {};
  const areas = bodyAreasOf(store.get("conditions") || []);
  const badDay = areas.some(id => isBad(scores[id]));
  const lowEnergy = checkedInToday && typeof c.energy === "number" && c.energy <= LOW_ENERGY_MAX;
  const lowMood = checkedInToday && typeof c.mood === "number" && c.mood <= LOW_MOOD_MAX;
  const soreToday = checkedInToday && areas.some(id => Number(scores[id]) > 0);
  const gen = store.get("generatedSession") || {};
  const builtToday = gen.builtAt && new Date(gen.builtAt).toDateString() === new Date().toDateString();
  const coachAdjusted = Boolean(builtToday && gen.session?.rationale?.adjusted);
  return { checkedInToday, badDay, lowEnergy, lowMood, soreToday, coachAdjusted };
}

const _sameDay = (iso, now) => !!iso && new Date(iso).toDateString() === now.toDateString();

/**
 * Pure. { id, low } for the episode to offer, or null.
 * ctx: { sessionCount, partial, badDay, lowEnergy, lowMood, programme, now }
 */
export function decideOffer(ctx) {
  const p = ctx.programme || programme();
  const now = ctx.now || new Date();
  if (!(ctx.sessionCount >= OFFER_FROM_SESSION)) return null;
  if (ctx.partial === true) return null;
  if (ctx.badDay === true) return null;
  if (_sameDay(p.offeredAt, now)) return null;
  if (p.offeredSession > 0 && ctx.sessionCount - p.offeredSession < OFFER_GAP) return null;
  if (ctx.lowEnergy === true || ctx.lowMood === true) return { id: LOW_DAY_EPISODE, low: true };
  const id = currentEpisodeId(p);
  return id ? { id, low: false } : null;
}

/**
 * The offer for this finish, recorded as offered, or null. Call once per
 * finished session (the card's own render must not call it again).
 * Returns { id, low, line, label, episode, part }.
 */
export function offerForFinish({ sessionCount, partial = false, now = new Date() } = {}) {
  const day = dayContext();
  const o = decideOffer({ sessionCount, partial, badDay: day.badDay, lowEnergy: day.lowEnergy, lowMood: day.lowMood, now });
  if (!o) return null;
  _save({ ...programme(), offeredAt: now.toISOString(), offeredSession: sessionCount });
  const e = getEpisode(o.id);
  return { ...o, episode: e, part: getPart(e.part), line: o.low ? LOW_DAY_LINE : null,
           label: `In Step · ${getPart(e.part).name} · Episode ${e.episode} · about 3 minutes` };
}

/** B: the finish line about other people's check-ins, or null. */
export function finishBLine({ sessionCount, episodeOffered = false } = {}) {
  if (!(sessionCount > 0) || sessionCount % B_EVERY !== 0) return null;
  const d = dayContext();
  const lines = eligibleFinishBLines({
    checkedInToday: d.checkedInToday, badDay: d.badDay, episodeOffered,
    lowEnergy: d.lowEnergy, lowMood: d.lowMood,
    planLighter: d.lowEnergy || d.coachAdjusted, soreLeftOut: d.soreToday,
  });
  return lines[0] || null;
}

// ── From a finish's Start to the player ────────────────────────────────
let _pending = null;
/** The finish's Start: the player opens on this episode. */
export function openEpisodeNext(id, { low = false } = {}) { _pending = getEpisode(id) ? { id, low } : null; }
/** The player takes it once. */
export function takePendingEpisode() { const p = _pending; _pending = null; return p; }
