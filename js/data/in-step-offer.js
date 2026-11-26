/**
 * js/data/in-step-offer.js
 * 26 Nov 2026 v4
 *
 * v4 - P-41 S2 rule 5. Never offered at the finish in the 16-17 version.
 *
 * 25 Nov 2026 v3
 *
 * v3 - P-29 INSTEP-RECAP. lastCarryAt (Schema v1.136): the local day an
 *   episode reached its Carry it, written with lastCarry. lastTime() gives
 *   the recap for that episode (its title, about, Carry it and third
 *   answer, from in-step-programme.js) with when it was in words
 *   (whenWords); Part 4's recaps are held for their read and keep the line
 *   they had. The answer ids are unchanged.
 *
 * 06 Nov 2026 v2
 *
 * v2 - P-28 FINISH (Graeme, 06 Nov). The low day's line is "This one's
 *   about you today." ("short" was not true: Adjusting is about 3
 *   minutes, as every episode is).
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
 *     (Graeme, 06 Nov), with "This one's about you today."
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
import { inStepOpen } from "./age-version.js";
import { store } from "../store.js";
import { getTodaysCheckin } from "./checkin.js";
import { bodyAreasOf, isBad } from "./conditions.js";
import { EPISODES, getEpisode, getPart, nextEpisodeId } from "./in-step-programme.js";
import { eligibleFinishBLines } from "./empathy-transfer.js";

export const OFFER_FROM_SESSION = 3;   // "The first episode can come after session 3"
export const OFFER_GAP          = 2;   // "every second finished session at most"
export const LOW_DAY_EPISODE    = "p1e6";
export const LOW_DAY_LINE       = "This one's about you today.";
export const B_EVERY            = 3;   // B lines "now and then"
export const LOW_ENERGY_MAX     = 4;   // as the finish lines (reflect.js)
export const LOW_MOOD_MAX       = 3;   // the check-in's Struggling and Low
export const ANSWER_IDS         = ["did", "not-yet", "didnt"];

const DEFAULT = Object.freeze({ part: 1, episode: 1, done: [], lastCarry: null, lastCarryAt: null, lastAnswer: null, offeredAt: null, offeredSession: 0 });

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

/** The local day, YYYY-MM-DD (P-29: lastCarryAt is the person's own day). */
export function localDay(d = new Date()) {
  const z = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * P-29. When last time was, in words: Earlier today, Yesterday, On Monday
 * (2 to 6 days), Last week (7 to 13), A while ago (14 or more). No date
 * kept (an episode finished before P-29 shipped): "Last time".
 */
export function whenWords(day, now = new Date()) {
  const m = typeof day === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return "Last time";
  const then = new Date(+m[1], +m[2] - 1, +m[3]);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const n = Math.round((today - then) / 86400000);
  if (n <= 0) return "Earlier today";
  if (n === 1) return "Yesterday";
  if (n <= 6) return `On ${DAYS[then.getDay()]}`;
  if (n <= 13) return "Last week";
  return "A while ago";
}

/**
 * P-29. Last time's recap, about the episode whose Carry it was given last,
 * or null (none yet, or the last one of all). { episode, when, held, line }:
 * held is true while that recap waits for Part 4's read, and line is then
 * the line it had before.
 */
export function lastTime(p = programme(), now = new Date()) {
  if (!p.lastCarry) return null;
  const e = getEpisode(p.lastCarry);
  const next = nextEpisodeId(p.lastCarry);
  if (!e || !next) return null;
  // Held: the line it had, without its old question (the screen now asks
  // "Did you get to try it?" once, for every recap).
  if (e.recapHeld) return { episode: e, when: whenWords(p.lastCarryAt, now), held: true, line: (getEpisode(next).prev || "").replace(/\s*Did it come up\?$/, "") || null };
  if (!e.about) return null;
  return { episode: e, when: whenWords(p.lastCarryAt, now), held: false, line: null };
}

/** True when an episode opens with last time's recap (kept for its callers). */
export function lastTimeLine(p = programme()) {
  const t = lastTime(p);
  if (!t) return null;
  return t.held ? t.line : `${t.when}, in “${t.episode.title}”, we talked about ${t.episode.about}.`;
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
  _save({ ...p, done, part, episode, lastCarry: id, lastCarryAt: localDay(), lastAnswer: null });
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
  if (!inStepOpen()) return null;   // P-41 S2 rule 5: never offered in the 16-17 version
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
