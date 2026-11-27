/**
 * js/data/plan-trial.js
 * 27 Nov 2026 v2
 *
 * v2 - S2. The developer panel's controls live here, so this stays the only
 *   writer of planTrial: devForgetTrial(), devTwoDaysLeft().
 *
 * 27 Nov 2026 v1
 *
 * Row 17 / P-40, Try the Plan, S1 (spec docs/specs/alongside_plan-trial_
 * 27nov2026_v1.md; mock-up v2 approved by Graeme 27 Nov). The Plan for 14
 * days, no card, nothing ever charged; one notice two days before the end;
 * back to Free with everything kept. One trial per phone. The only writer
 * of planTrial (Schema v1.144).
 *
 *   trial()                  the record
 *   trialActive()            started, not ended
 *   trialEndsOn()            "YYYY-MM-DD" or null
 *   daysLeft(now)            whole local days to the end (0 on the last day)
 *   startTrial(now)          the Plan from now; false if not allowed
 *   endTrial(now, how)       back to Free ("ended" | "stopped")
 *   checkTrial(now)          on every open: ends it on or after its end day
 *   noticeDue(now)           the one notice: 2 days or fewer left, not a hard day
 *   markNoticed(now)
 *   offerDue({ sessionCount, now })   the finish's offer, Free only
 *   markOffered(now)
 */

import { store } from "../store.js";
import { canBuy } from "./age-version.js";
import { dayContext, localDay } from "./in-step-offer.js";

export const TRIAL_DAYS = 14;
export const NOTICE_DAYS_LEFT = 2;
export const OFFER_GAP_DAYS = 7;

export const trial = () => store.get("planTrial") || {};
export const trialActive = (t = trial()) => !!t.startedAt && !t.endedAt;
export const trialEnded = (t = trial()) => !!t.startedAt && !!t.endedAt;
export const trialEndsOn = (t = trial()) => t.endsOn || null;

const dayStart = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };

/** Whole local days from today to the end day (14 on the first day, 0 on the end day). */
export function daysLeft(now = new Date(), t = trial()) {
  if (!t.endsOn) return null;
  const today = dayStart(localDay(now));
  return Math.round((dayStart(t.endsOn) - today) / 86400000);
}

/** "Thursday 10 December": the end day, said as a date, never a countdown. */
export function endsOnWords(t = trial()) {
  if (!t.endsOn) return "";
  return dayStart(t.endsOn).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
/** "Thursday": the end day's name, for the notice. */
export function endsOnDay(t = trial()) {
  return t.endsOn ? dayStart(t.endsOn).toLocaleDateString("en-GB", { weekday: "long" }) : "";
}

/** May this phone start a trial? Free, never trialled, can buy here (adults). */
export function canStartTrial() {
  return store.get("tier") !== "personal" && !trial().startedAt && canBuy();
}

export function startTrial(now = new Date()) {
  if (!canStartTrial()) return false;
  store.set("planTrial", { ...trial(), startedAt: now.toISOString(), endsOn: localDay(addDays(now, TRIAL_DAYS)) });
  store.set("tier", "personal");
  return true;
}

export function endTrial(now = new Date(), how = "ended") {
  const t = trial();
  if (!trialActive(t)) return false;
  store.set("planTrial", { ...t, endedAt: now.toISOString(), endedHow: how === "stopped" ? "stopped" : "ended" });
  store.set("tier", "free");
  return true;
}

/** On every app open: a trial whose end day has come goes back to Free. */
export function checkTrial(now = new Date()) {
  const t = trial();
  if (trialActive(t) && t.endsOn && localDay(now) >= t.endsOn) return endTrial(now, "ended");
  return false;
}

const _hardOrLow = () => { const d = dayContext(); return d.badDay || d.lowMood || d.lowEnergy; };

/** The one notice, on Home: 2 days or fewer left, not yet shown, not on a hard day. */
export function noticeDue(now = new Date()) {
  const t = trial();
  if (!trialActive(t) || t.noticedAt) return false;
  const left = daysLeft(now, t);
  return left !== null && left <= NOTICE_DAYS_LEFT && !_hardOrLow();
}
export function markNoticed(now = new Date()) {
  const t = trial();
  if (trialActive(t)) store.set("planTrial", { ...t, noticedAt: now.toISOString() });
}

/** The finish's offer: on Free, from the first finished session, at most once a week, never on a hard, low or sore day. */
export function offerDue({ sessionCount = 0, partial = false, now = new Date() } = {}) {
  if (!canStartTrial()) return false;
  if (!(sessionCount >= 1) || partial) return false;
  const d = dayContext();
  if (d.badDay || d.lowMood || d.lowEnergy || d.soreToday) return false;
  const last = trial().offeredAt;
  if (last && (now - new Date(last)) < OFFER_GAP_DAYS * 86400000) return false;
  return true;
}
export function markOffered(now = new Date()) {
  store.set("planTrial", { ...trial(), offeredAt: now.toISOString() });
}

// ── S2. The developer panel's controls (the panel is off at release) ──
/** Forget the trial: none on this phone, and Free. */
export function devForgetTrial() {
  store.set("planTrial", {});
  if (store.get("tier") === "personal") store.set("tier", "free");
}
/** A running trial with two days left, the notice not yet shown. */
export function devTwoDaysLeft(now = new Date()) {
  const t = trial();
  if (!trialActive(t)) return false;
  const { noticedAt, ...rest } = t;
  store.set("planTrial", { ...rest, endsOn: localDay(addDays(now, NOTICE_DAYS_LEFT)) });
  return true;
}
