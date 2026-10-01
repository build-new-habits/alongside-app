/**
 * js/data/evidence.js
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
const KIND_OF = {
  walk: "walk", run: "run",
  workout: "strength", gym: "strength", "core-session": "strength", "prescribed-session": "strength", "morning-session": "strength", freestyle: "strength",
  yoga: "mobility", stretch: "mobility", mobility: "mobility",
  breathing: "breathing", mindful: "breathing", mindfulness: "breathing", "quiet-session": "breathing",
  class: "class",
};

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
function _done() { return (store.get("activityLog") || []).filter(e => e && e.status !== "abandoned" && _when(e) != null); }

/** What Share my figures would send, worked out on the device. */
export function figuresPayload(now = Date.now()) {
  const log = _done();
  const DAY = 86400000, FOUR = 28 * DAY;
  const first = log.length ? Math.min(...log.map(_when)) : null;
  const inRange = (a, b) => log.filter(e => _when(e) >= a && _when(e) < b);
  const firstWeeks  = first == null ? 0 : _half(inRange(first, first + FOUR).length / 4);
  const latest      = inRange(now - FOUR, now + 1);
  const latestWeeks = _half(latest.length / 4);
  const kinds = KIND_LIST.filter(k => latest.some(e => KIND_OF[e.type] === k));
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
    store.set(payload.kind === "survey" ? "evidence.surveyDone" : "evidence.figuresDone", true);
    return true;
  } catch { return false; }
}

/** The two built-in research messages, while sending is on and they are unanswered. */
export function researchMessages() {
  if (!enabled()) return [];
  const ev = store.get("evidence") || {};
  const out = [];
  if (!ev.surveyDone) out.push({
    id: "survey-2026", kind: "research", action: "survey", publishedAt: "2026-10-01", audience: { tier: "any" },
    title: "A quick question, if you have a moment",
    body: "Two questions about how you move now. It’s up to you, and nothing is sent unless you press Send.",
  });
  if (!ev.figuresDone) out.push({
    id: "share-figures-2026", kind: "research", action: "share-figures", publishedAt: "2026-10-01", audience: { tier: "any", minSessions: 4 },
    title: "Share a few figures?",
    body: "A few counts of your sessions, worked out on this phone, to help us say truthfully what Alongside does. You see exactly what would be sent first.",
  });
  return out;
}

addBuiltIn(researchMessages);
