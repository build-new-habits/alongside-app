/**
 * js/data/arc-readback.js
 * 02 Oct 2026 v5
 *
 * v5 - W5-15 ARC-TRUE. Mind strands light from a breathing, mindful or quiet
 *   practice (arc.typesWorked.practice); nothing lit them, so a mind-only
 *   arc read "Not yet" for ever.
 *
 * 02 Oct 2026 v4
 *
 * v4 - W4-20. sessionsByWeek(…, { since }) leaves out weeks that ended
 *   before the person started.
 *
 * 30 Sep 2026 v3
 *
 * v3 - W3-20. sessionsInWindow() names a topKind only when it is more than
 *   half of the sessions: "mostly X" was said on a tie.
 *
 * v2 - P25 (persona finding W2-20). liftReadback() compares each day's
 *   BEST set -- heaviest, then most reps -- on the first day and the
 *   latest. It compared the first and last entries logged, and the last
 *   set of a day is often the lighter one: 70 kg one day, 75 then 55 the
 *   latest, read "60 kg -> 55 kg". And no limit by default: Progress
 *   decides how many to show at once, not this.
 *
 * 28 Sep 2026 v1
 *
 * SMOOTH-P4a. What Progress reads back. Spec 4.8.
 *
 * Pure functions over data the app already keeps -- checkinHistory,
 * activityLog, liftLog, arc, conditionMeta. NO NEW TRACKING. Every input
 * is a parameter, so each is testable without a store, and `now` is a
 * parameter too, so weeks are the same weeks in a test and on a phone.
 *
 * THE RULES THE WORDS FOLLOW, all from the spec and the product's own:
 *   - Conditions: what the person TOLD us at check-in, counted as
 *     mentions. Never improving, healing, better, recovered -- the person
 *     marks a condition better (Settings); the app never concludes it.
 *     BANNED_WORDS is exported so the gate can hold every string to it.
 *   - Logged weights: first and latest, as facts. No up, down, gain,
 *     progress or PB words (P4).
 *   - Strands: a DATE, never a count (ARC-1). "Worked 2 days ago", or
 *     "Not yet". Coverage only counts from when the arc began
 *     (ARC-COVERAGE): an arc cannot have covered something before it
 *     existed.
 *   - Sessions: COUNT-1 -- completed sessions only; partials are a
 *     record, not a session you did.
 */

import { STRANDS } from "./aims.js";

export const BANNED_WORDS = /\b(improv\w*|heal\w*|better|recover\w*|worse|progress\w*|gain\w*|streak\w*|behind|failed|well done|great job)\b/i;

const DAY = 86400000;

/** YYYY-MM-DD of a Date, local. */
export function dayKey(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

/** Monday 00:00 (local) of the week holding `d`. */
export function weekStart(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = (x.getDay() + 6) % 7;          // Monday = 0
  x.setDate(x.getDate() - dow);
  return x;
}

/** The last `n` weeks, oldest first, each { start: Date, end: Date }. */
export function lastWeeks(n = 6, now = new Date()) {
  const thisWeek = weekStart(now);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(thisWeek); start.setDate(start.getDate() - i * 7);
    const end   = new Date(start);    end.setDate(end.getDate() + 7);
    out.push({ start, end });
  }
  return out;
}

export function shortDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function _entries(history) {
  return Object.entries(history || {})
    .map(([key, v]) => ({ key, t: new Date(`${key}T12:00:00`).getTime(), v: v || {} }))
    .filter(e => Number.isFinite(e.t))
    .sort((a, b) => a.t - b.t);
}
const _mentioned = (v, id) => Number((v.conditionLevels || {})[id]) > 0;

/**
 * One condition, read back from check-ins.
 * Returns { id, since, weeks: [{start, mentioned, checkins}], thisWeek,
 * firstWeek|null, lastMentioned|null, lines: [string] }.
 */
export function conditionReadback(id, { history = {}, meta = {}, now = new Date(), weeks = 6 } = {}) {
  const all   = _entries(history);
  const since = meta?.[id]?.addedAt || null;
  const fromT = since ? new Date(`${since}T00:00:00`).getTime() : -Infinity;
  const count = (a, b) => {
    const inWin = all.filter(e => e.t >= a && e.t < b);
    return { mentioned: inWin.filter(e => _mentioned(e.v, id)).length, checkins: inWin.length };
  };
  const W = lastWeeks(weeks, now).map(w => ({ start: w.start, ...count(w.start.getTime(), w.end.getTime()) }));
  const thisWeek = W[W.length - 1];

  // "When you started": the first week, on or after it was added, that had check-ins.
  let firstWeek = null;
  const first = all.find(e => e.t >= fromT);
  if (first) {
    const ws = weekStart(first.t);
    if (ws.getTime() !== weekStart(now).getTime()) {
      const we = new Date(ws); we.setDate(we.getDate() + 7);
      firstWeek = { start: ws, ...count(Math.max(ws.getTime(), fromT), we.getTime()) };
      if (!firstWeek.checkins) firstWeek = null;
    }
  }
  const lastHit = [...all].reverse().find(e => _mentioned(e.v, id));
  const lastMentioned = lastHit ? lastHit.key : null;

  const lines = [];
  if (thisWeek.checkins) {
    lines.push(`Mentioned on ${thisWeek.mentioned} of ${thisWeek.checkins} check-in${thisWeek.checkins === 1 ? "" : "s"} this week.`);
  } else {
    lines.push("No check-ins yet this week.");
  }
  if (firstWeek) lines.push(`It was ${firstWeek.mentioned} of ${firstWeek.checkins} when you started.`);
  if (lastMentioned && now - new Date(`${lastMentioned}T12:00:00`) > 7 * DAY) {
    lines.push(`Not mentioned since ${shortDate(`${lastMentioned}T12:00:00`)}.`);
  } else if (!lastMentioned) {
    lines.push("Not mentioned at a check-in yet.");
  }
  return { id, since, weeks: W, thisWeek, firstWeek, lastMentioned, lines };
}

/** Flat text of one logged set's headline: weight, else reps, else level/time/distance. */
function _headline(e, kind) {
  if (kind === "weight")   return `${e.weight} ${e.unit || "kg"}`;
  if (kind === "reps")     return `${e.reps} reps`;
  if (kind === "level")    return `level ${e.level}`;
  if (kind === "duration") return `${e.durationMins} min`;
  if (kind === "distance") return `${e.distance}`;
  return "";
}

/**
 * First day logged -> latest day, per exercise logged on two or more days.
 * [{ id, name, first, latest, text }] newest first, at most `limit`.
 * Each day is its best set (P25): heaviest, then most reps; for other
 * measures, the most. The measure compared is the first one BOTH days
 * carry, so a row never sets a weight against a rep count.
 */
const _KINDS = ["weight", "reps", "level", "durationMins", "distance"];
function _localDay(at) {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function _bestOfDay(entries) {
  const num = (e, k) => (typeof e[k] === "number" ? e[k] : -Infinity);
  return entries.slice().sort((a, b) => {
    for (const k of _KINDS) { const d = num(b, k) - num(a, k); if (d) return d; }
    return String(b.at).localeCompare(String(a.at));
  })[0];
}
export function liftReadback(liftLog = {}, exercises = [], limit = Infinity) {
  const byId = new Map((exercises || []).map(e => [e.id, e]));
  const rows = [];
  for (const [id, list] of Object.entries(liftLog || {})) {
    const days = new Map();
    for (const e of (list || [])) {
      if (!e || !e.at) continue;
      const k = _localDay(e.at);
      if (!days.has(k)) days.set(k, []);
      days.get(k).push(e);
    }
    if (days.size < 2) continue;
    const keys = [...days.keys()].sort();
    const first = _bestOfDay(days.get(keys[0])), latest = _bestOfDay(days.get(keys[keys.length - 1]));
    const kind = _KINDS.find(k => typeof first[k] === "number" && typeof latest[k] === "number");
    if (!kind) continue;
    const k = kind === "durationMins" ? "duration" : kind;
    const name = byId.get(id)?.name;
    if (!name) continue;
    rows.push({ id, name, first, latest, text: `${_headline(first, k)} \u2192 ${_headline(latest, k)}` });
  }
  return rows.sort((a, b) => String(b.latest.at).localeCompare(String(a.latest.at))).slice(0, limit);
}

/** "today", "yesterday", "3 days ago", or "on 2 Sep" past a fortnight. */
export function agoText(dateStr, now = new Date()) {
  const d = new Date(`${String(dateStr).slice(0, 10)}T12:00:00`);
  const days = Math.round((weekStartDay(now) - weekStartDay(d)) / DAY);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return `on ${shortDate(d)}`;
}
function weekStartDay(d) { const x = new Date(d); x.setHours(12, 0, 0, 0); return x.getTime(); }

/**
 * Each strand of the arc with the date it was last worked since the arc
 * began, or null. Body strands light from zones, capability strands from
 * session types (ARC-EVERYTHING); either counts.
 */
export function strandReadback(arc = {}, now = new Date()) {
  const from = arc.startedAt ? String(arc.startedAt).slice(0, 10) : "";
  const zones = arc.zonesWorked || {}, types = arc.typesWorked || {};
  return (arc.strands || []).map(id => {
    const s = STRANDS[id];
    if (!s) return null;
    const dates = [
      ...(s.zones || []).map(z => zones[z]),
      ...(s.sessionTypes || []).map(t => types[t]),
      // W5-15. A mind strand lights from a breathing or mindful practice.
      ...(s.kind === "mind" ? [types.practice] : []),
    ].filter(d => d && String(d).slice(0, 10) >= from).map(d => String(d).slice(0, 10)).sort();
    const last = dates.length ? dates[dates.length - 1] : null;
    return { id, label: s.label, last, text: last ? `Worked ${agoText(last, now)}` : "Not yet" };
  }).filter(Boolean);
}

/** Week n of the arc, counted from when it began (week 1 is the first). */
export function arcWeek(arc = {}, now = new Date()) {
  if (!arc.startedAt) return null;
  const d = Math.floor((weekStart(now) - weekStart(arc.startedAt)) / (7 * DAY));
  return Math.max(1, d + 1);
}

/**
 * Completed sessions per week for the last `weeks` weeks, and the kinds.
 * `completed` must already be store.completedSessions() -- COUNT-1.
 */
export function sessionsByWeek(completed = [], { weeks = 6, now = new Date(), kindOf = e => e.sessionType || e.type, since = null } = {}) {
  // W4-20. Weeks that ended before `since` (when the person started) are
  // not shown: they could only ever be empty.
  const from = since ? new Date(since).getTime() : -Infinity;
  const W = lastWeeks(weeks, now).filter(w => w.end.getTime() > from).map(w => ({ start: w.start, end: w.end, total: 0 }));
  for (const e of completed) {
    const t = new Date(e.completedAt || e.loggedAt || e.date).getTime();
    const w = W.find(x => t >= x.start.getTime() && t < x.end.getTime());
    if (w) w.total++;
  }
  return W.map(({ start, total }) => ({ start, total }));
}

/** Sessions in the last `days` days (COUNT-1) and the most common kind. */
export function sessionsInWindow(completed = [], { days = 30, now = new Date(), kindOf = e => e.sessionType || e.type } = {}) {
  const cutoff = now.getTime() - days * DAY;
  const recent = completed.filter(e => new Date(e.completedAt || e.loggedAt || e.date).getTime() >= cutoff);
  const kinds = {};
  for (const e of recent) { const k = kindOf(e); if (k) kinds[k] = (kinds[k] || 0) + 1; }
  const top = Object.entries(kinds).sort((a, b) => b[1] - a[1])[0];
  // W3-20. "Mostly" means more than half, never a tie.
  const most = top && top[1] * 2 > recent.length ? top[0] : null;
  return { count: recent.length, recent, topKind: most, kinds };
}
