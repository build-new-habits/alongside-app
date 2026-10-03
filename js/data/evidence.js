/**
 * js/data/evidence.js
 * 02 Oct 2026 v3
 *
 * v3 - W5-13 RESEARCH-TRUE-2. noServerCopy(): the server words every screen
 *   uses, qualified while sending is on; Share my figures waits for eight
 *   weeks; gentle-care is breathing, stretch is mobility, the general
 *   routine none; research messages are never dated before install.
 *
 * 02 Oct 2026 v2
 *
 * v2 - W4-12 EVIDENCE-TRUE. Rates divide by the weeks that have passed (at
 *   most four). A stopped session (partial) is not counted. Kinds come from
 *   what the session was (kindOf; every activity type decided in KIND_OF).
 *   The survey waits for three sessions over a week, Share my figures for
 *   four weeks since the first. Answered stays answered across Reset all
 *   data (bnh-research-answered). researchPrivacyLine() for the privacy
 *   screens.
 *
 * 01 Oct 2026 v1
 *
 * B5 EVIDENCE. Two voluntary questions in Settings › Messages: a short
 * survey, and Share my figures. Each is offered once, can be dismissed, and
 * is never offered again on this device once answered or dismissed. Nothing
 * is sent until the person presses Send, after seeing exactly what will go.
 *
 * WHAT IS SENT (Planned changes before launch v3, §5.2), and nothing else:
 *   survey  - kind, tier (free or plan), the two answers, the month, the app
 *             release;
 *   figures - kind, tier, time on the Plan in bands, average sessions a week
 *             in the first and the latest four weeks (to the nearest half),
 *             which kinds of session in the latest four weeks from a fixed
 *             list (walk, run, strength, mobility, breathing, class), the
 *             month, the app release.
 * No name, email, Stripe reference, pass, device identifier, session dates,
 * health answers, journal or notes. Time on the Plan cannot be known until
 * payment and the pass exist, so a Plan member's band is "not-known" until
 * then.
 *
 * WHERE. An insert-only table at Supabase, Frankfurt. RECEIVER is empty
 * until Graeme sets the project up; while it is empty nothing is offered
 * and nothing can be sent. The request asks for no row back
 * (Prefer: return=minimal) and carries no cookies.
 *
 * The device remembers only that a question was answered (store.evidence).
 *
 * Tested by tools/verify-evidence.mjs.
 */
import { store } from "../store.js";
import { addBuiltIn } from "./messages.js";

/** Set both to switch sending on: the Supabase project URL and anon key. */
export const RECEIVER = { url: "", key: "", table: "evidence" };
export const enabled = () => !!(RECEIVER.url && RECEIVER.key && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(RECEIVER.url));

export const KIND_LIST = ["walk", "run", "strength", "mobility", "breathing", "class"];
// W4-12 (Wave 4, 2.18). Every activity type the app writes has a decided
// kind, or null where none of the six is true (a swim, a made-up session,
// your own exercises, a sport). "workout" and "coach-session" are SESSION
// shapes, not kinds: what they were is read from sessionType (kindOf).
// Before, every workout was sent as strength, a mobility or cardio one too.
export const KIND_OF = {
  walk: "walk", "walk-session": "walk", hike: "walk",
  run: "run", "running-session": "run",
  workout: "strength", "coach-session": "strength",
  gym: "strength", "gym-programme": "strength", "core-session": "strength",
  "morning-session": "mobility",
  yoga: "mobility", "yoga-session": "mobility", stretch: "mobility", mobility: "mobility",
  breathing: "breathing", "breathing-session": "breathing", mindful: "breathing", mindfulness: "breathing", "quiet-session": "breathing",
  class: "class", "body-balance": "class",
  freestyle: null, capture: null, "prescribed-session": null, practice: null, outdoor: null,
  swim: null, "swim-session": null, cycle: null, "cycle-session": null, "outdoor-cycle": null,
  row: null, spin: null, boxing: null, hiit: null, tennis: null, football: null, golf: null, sport: null,
};
const SHAPED = new Set(["workout", "coach-session"]);
/** The kind one session was, from the fixed list, or null. */
export function kindOf(e) {
  if (!e) return null;
  if (SHAPED.has(e.type) && e.sessionType) {
    // W5-13. The Bad day's gentle plan is breathing, a few quiet minutes and
    // a walk; a stretch session is mobility; the one gentle routine after a
    // second no to the health consent has no one kind. None is strength.
    if (e.sessionType === "gentle-care") return "breathing";
    if (e.sessionType === "general-routine") return null;
    if (e.sessionType === "mobility" || e.sessionType === "stretch") return "mobility";
    if (e.sessionType === "cardio") return null;
    return "strength";
  }
  return KIND_OF[e.type] ?? null;
}

export const SURVEY = {
  move: {
    legend: "How does your movement now compare with before you started using Alongside?",
    options: [["much-more", "Much more"], ["a-bit-more", "A bit more"], ["about-same", "About the same"], ["less", "Less"], ["rather-not", "I’d rather not say"]],
  },
  usedFor: {
    legend: "How long have you used Alongside?",
    options: [["under-1m", "Under a month"], ["1-3m", "1 to 3 months"], ["3-6m", "3 to 6 months"], ["over-6m", "Over 6 months"]],
  },
};

export const CANT_FIND = "Once this is sent, we can’t find it again to change or delete it, because it doesn’t say who it came from.";
export const NOT_SENT = "This couldn’t be sent. Nothing has been kept.";

const _month = (d = new Date()) => d.toISOString().slice(0, 7);
const _tier = () => ((store.get("tier") || "free") !== "free" ? "plan" : "free");
const _half = n => Math.round(n * 2) / 2;
function _when(e) { const t = Date.parse(e?.completedAt || e?.date || ""); return isNaN(t) ? null : t; }
// W4-12: a stopped session is written as status "partial"; the old filter
// looked for "abandoned", which nothing writes. One definition: the store's.
function _done() { return store.completedSessions(store.get("activityLog") || []).filter(e => _when(e) != null); }
const DAY = 86400000;
// Weeks that have passed since a start, at least one, at most four: six
// sessions in two weeks is three a week, not one and a half.
const _weeks = (from, now) => Math.min(4, Math.max(1, Math.ceil((now - from) / (7 * DAY))));

// W4-12: once answered, a question stays answered on this phone even after
// Reset all data (which clears every "alongside" key), so nobody is asked
// twice and nobody is counted twice. It holds no answer, only which
// question. The Reset dialog says so (W4-16).
const ANSWERED_KEY = "bnh-research-answered";
function _answered() { try { return JSON.parse(globalThis.localStorage?.getItem(ANSWERED_KEY) || "[]"); } catch { return []; } }
export function rememberAnswered(kind) {
  try { const a = new Set(_answered()); a.add(kind); globalThis.localStorage?.setItem(ANSWERED_KEY, JSON.stringify([...a])); } catch { /* storage off */ }
}
export const wasAnswered = kind => _answered().includes(kind);

/** What Share my figures would send, worked out on the device. */
export function figuresPayload(now = Date.now()) {
  const log = _done();
  const FOUR = 28 * DAY;
  const first = log.length ? Math.min(...log.map(_when)) : null;
  const inRange = (a, b) => log.filter(e => _when(e) >= a && _when(e) < b);
  const weeks       = first == null ? 1 : _weeks(first, now);
  const firstWeeks  = first == null ? 0 : _half(inRange(first, first + FOUR).length / weeks);
  const latest      = inRange(now - FOUR, now + 1);
  const latestWeeks = _half(latest.length / weeks);
  const kinds = KIND_LIST.filter(k => latest.some(e => kindOf(e) === k));
  return {
    kind: "figures",
    tier: _tier(),
    plan_band: _tier() === "plan" ? "not-known" : "none",
    first_weeks: firstWeeks,
    latest_weeks: latestWeeks,
    kinds,
    month: _month(new Date(now)),
  };
}

/** What the survey would send, from the two answers. Null if either is missing. */
export function surveyPayload(move, usedFor, now = Date.now()) {
  if (!SURVEY.move.options.some(o => o[0] === move) || !SURVEY.usedFor.options.some(o => o[0] === usedFor)) return null;
  return { kind: "survey", tier: _tier(), move, used_for: usedFor, month: _month(new Date(now)) };
}

/** The app release, read from this device's own offline copy's name. */
async function _release() {
  try {
    const keys = await globalThis.caches.keys();
    const n = keys.map(k => (/^alongside-v(\d+)$/.exec(k) || [])[1]).filter(Boolean).map(Number);
    return n.length ? `alongside-v${Math.max(...n)}` : "unknown";
  } catch { return "unknown"; }
}

/** Send one answer. True only if the receiver took it. Marks it done only then. */
export async function sendEvidence(payload, fetchImpl = globalThis.fetch) {
  if (!enabled() || !payload || typeof fetchImpl !== "function") return false;
  const body = { ...payload, app: await _release() };
  try {
    const res = await fetchImpl(`${RECEIVER.url}/rest/v1/${RECEIVER.table}`, {
      method: "POST",
      credentials: "omit",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        apikey: RECEIVER.key,
        Authorization: `Bearer ${RECEIVER.key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });
    if (!res || !res.ok) return false;
    if (payload.kind === "survey") store.set("evidence.surveyDone", true);
    else store.set("evidence.figuresDone", true);
    rememberAnswered(payload.kind);
    return true;
  } catch { return false; }
}

/** The two built-in research messages, while sending is on and they are unanswered. */
export function researchMessages() {
  if (!enabled()) return [];
  const ev = store.get("evidence") || {};
  const out = [];
  // W4-12 (Wave 4, 2.18). "How does your movement now compare with before?"
  // was offered on day one, to somebody who had done nothing yet, and Share
  // my figures after four sessions in five days, whose "first four weeks"
  // and "latest four weeks" were the same few days. The survey waits for
  // three sessions over a week; the figures for four weeks since the first.
  const log = _done();
  const first = log.length ? Math.min(...log.map(_when)) : null;
  const since = first == null ? 0 : (Date.now() - first) / DAY;
  // W5-13. Never dated before this phone had the app.
  const installed = String(store.get("createdAt") || "").slice(0, 10);
  const pub = installed > "2026-10-01" ? installed : "2026-10-01";
  if (!ev.surveyDone && !wasAnswered("survey") && log.length >= 3 && since >= 7) out.push({
    id: "survey-2026", kind: "research", action: "survey", publishedAt: pub, audience: { tier: "any" },
    title: "A quick question, if you have a moment",
    body: "Two questions about how you move now. It’s up to you, and nothing is sent unless you press Send.",
  });
  // W5-13. Eight weeks, so the first four weeks and the latest four are
  // never the same days (at 28 days they were: "3" then "2.5").
  if (!ev.figuresDone && !wasAnswered("figures") && since >= 56) out.push({
    id: "share-figures-2026", kind: "research", action: "share-figures", publishedAt: pub, audience: { tier: "any", minSessions: 4 },
    title: "Share a few figures?",
    body: "A few counts of your sessions, worked out on this phone, to help us say truthfully what Alongside does. You see exactly what would be sent first.",
  });
  return out;
}

/**
 * W5-13. Where answers are kept, said the same on every screen: with
 * sending on, "no copy on a server" sat beside the Frankfurt line.
 */
export function noServerCopy() {
  return enabled()
    ? "There is no account, and nothing you tell the app is copied to a server, apart from research answers you choose to send (below)."
    : "There is no account and no copy on a server.";
}

/**
 * W4-12. The one sentence every privacy screen adds while sending is on:
 * the survey and Share my figures are the only things that leave the phone
 * for research. Empty while the receiver is not set.
 */
export function researchPrivacyLine() {
  if (!enabled()) return "";
  return "If you answer the survey or use Share my figures in Messages, those answers go to a research table we keep in Frankfurt. They don\u2019t say who you are, so they can\u2019t be traced back to you, or taken back once sent.";
}

addBuiltIn(researchMessages);
