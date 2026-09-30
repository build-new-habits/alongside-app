/**
 * js/data/red-flag.js
 * 30 Sep 2026 v4
 *
 * v4 - W3-4 SORE-SCOPE. A check-in-sourced area counts only on a sore day.
 *
 * v3 - P0, SCOPE-MINOR. Fibromyalgia retired; a scored id counts only if
 *   it is a body area (persona 2.5: a heart condition triggered the
 *   spinal questions).
 *
 * v2 - SMOOTH-P3c. 'capture' (Make it up as I go) is guarded: it is
 *   exercise, and v1's list predates it being a session. Twelve routes.
 *
 * RED-FLAG. The red-flag screen: three questions, asked before exercise
 * of anyone who has told the app something is sore, and a hard stop on
 * the answers that need a clinician first.
 *
 * WHY NOW. Graeme, 28 Sep: "Continue as if approved." The screen had
 * been held since 07 Sep (CR-4b) on one legal question -- does this
 * wording give the app a medical purpose (MHRA-SCOPE)? That question now
 * goes to the solicitor in the covering letter, and the wording below
 * goes, word for word, into the Crisis & Safeguarding Policy, so it is
 * reviewed where people meet it.
 *
 * THE CLINICAL REASON (CR-4). Asking where it hurts and how badly is
 * already triage in the person's eyes, and not screening afterwards is
 * implicit false reassurance.
 *
 * A SAFETY NET, NOT AN ASSESSMENT. Carried verbatim from the 16 Aug lock:
 * "a red-flag screen is a safety-netting tool, not a diagnostic
 * assessment." It diagnoses nothing, names no condition, and refers on.
 * The wording is doing regulatory work, not just clinical work.
 *
 * TWO LEVELS, PERMANENTLY (Graeme, 16 Aug):
 *   EMERGENCY  question 1 answered yes        A&E now; 999 if you cannot
 *                                             get there safely
 *   ADVICE     any other yes, any "not sure"  stop exercising; NHS 111
 * and the unconditional emergency line in BOTH, so nobody has to
 * classify themselves into the emergency route to see it.
 *
 * DECISIONS TAKEN HERE, from the review pack's open questions (Q3-Q6),
 * each the conservative reading and each recorded in the schedule:
 *   WHO     only people who report pain -- a listed condition, or a sore
 *           area in today's check-in. Asking a healthy person about
 *           bladder control in their first minutes would alarm and teach
 *           people to click through.
 *   WHEN    before the first exercise after pain is reported; again when
 *           a NEW sore area appears; again after 30 days (GATE_DAYS) while
 *           pain is still reported. Symptoms can develop later; a monthly
 *           re-ask is the same cadence the safety note already uses.
 *   STOPS   exercise. Breathing, quiet practices and the journal stay:
 *           nobody is ejected from the app at the moment they have been
 *           told something worrying.
 *   CLEARS  by the person, confirming they have been checked by a
 *           health professional and told they can exercise. It cannot be
 *           verified; the confirmation is recorded with a date.
 */

import { store } from "../store.js";
import { CONDITIONS } from "./conditions.js";

/** Bumped whenever any string below changes. Stored as redFlag.textVersion. */
export const RED_FLAG_VERSION = "2026-09-28.1";

export const RED_FLAG_QUESTIONS = [
  { id: "q1", text: "Have you noticed any change in your bladder or bowel control, or numbness around your groin, buttocks or inner thighs?" },
  { id: "q2", text: "Has any weakness, numbness or loss of coordination been getting steadily worse?" },
  { id: "q3", text: "Have you had a fever, unexplained weight loss, or pain at night that stays the same however you move?" },
];

export const RED_FLAG_ANSWERS = [
  { v: "no",     l: "No" },
  { v: "yes",    l: "Yes" },
  { v: "unsure", l: "I'm not sure" },
];

export const RED_FLAG_INTRO =
  "You've told me something is sore, so before you exercise there are three quick questions. " +
  "They're about rare signs that need a health professional before exercise. " +
  "This is a safety check, not an assessment.";

/** In both messages, always. The 16 Aug lock, verbatim. */
export const RED_FLAG_ALWAYS =
  "If you have new bladder or bowel problems, numbness around your genitals or anus, " +
  "or weakness that is getting worse quickly — get emergency help now.";

export const RED_FLAG_MESSAGES = {
  emergency: {
    title: "Please stop and get help now",
    body:  "Please go to A&E now. If you can't get there safely, call 999.",
  },
  advice: {
    title: "Please stop exercising for now",
    body:  "Please call NHS 111 before you exercise again. They can tell you what to do next.",
  },
};

export const RED_FLAG_CLEAR_CONFIRM =
  "I've been checked by a health professional and told I can exercise.";

const DAYS_30 = 30 * 86400000;

/** Routes that are exercise. Breathing, quiet practices and the journal are not here. */
export const EXERTIONAL_ROUTES = new Set([
  "workout", "gym-programme", "morning-session", "core-session", "yoga-session",
  "walk-session", "running-session", "cycle-session", "swim-session",
  "prescribed-session", "class-player", "capture",
]);

/** Where somebody was going when the screen stepped in. Module state: a reload starts again from Home. */
let _pendingRoute = null;
export function pendingRoute() { return _pendingRoute; }
export function takePendingRoute() { const r = _pendingRoute; _pendingRoute = null; return r; }

function _record() {
  return store.get("redFlag") || { screenedAt: null, areas: [], textVersion: null, level: null, flaggedAt: null, clearedAt: null };
}

/**
 * Conditions that are pain in the body. Anxiety, breathing, the
 * menopause, fatigue and the like are real and listed, but they are not
 * what these three questions are about; asking someone who listed
 * perimenopause about bladder control before a walk would be alarming
 * and teach people to tap through. (Fibromyalgia was included until P0,
 * 29 Sep, which retired it with the other medical conditions.)
 */
const PAIN_CONDITIONS = new Set(
  CONDITIONS.filter(c => ["lower", "back", "upper"].includes(c.area)).map(c => c.id)
);

/** The pain areas the person has told us about: listed pain conditions and today's sore areas. */
export function reportedPainAreas() {
  const out = new Set();
  const scores = store.get("conditionPainScores") || {};
  const meta   = store.get("conditionMeta") || {};
  // W3-4 (Schema v1.82). An area that joined the list from a check-in tap
  // counts only on a day it is sore; one the person listed themselves
  // counts every day. A tap last Tuesday brought bladder and groin
  // questions a minute after "Nothing today".
  for (const c of (store.get("conditions") || [])) {
    if (!PAIN_CONDITIONS.has(c)) continue;
    if (meta[c]?.source === "checkin" && !(Number(scores[c]) > 0)) continue;
    out.add(c);
  }
  // P0: only body areas. A scored id outside them (a heart condition, in
  // Wave 2) sent people through bladder and groin questions.
  for (const [area, n] of Object.entries(scores)) if (Number(n) > 0 && PAIN_CONDITIONS.has(area)) out.add(area);
  return [...out];
}

/** An unresolved stop: exercise does not start until it is cleared. */
export function redFlagStop() {
  const r = _record();
  return !!r.level && !r.clearedAt ? r.level : null;
}

/** The screen should be asked before this exercise. */
export function redFlagDue(now = Date.now()) {
  const areas = reportedPainAreas();
  if (!areas.length) return false;
  const r = _record();
  if (!r.screenedAt) return true;
  if (r.textVersion !== RED_FLAG_VERSION) return true;
  if (areas.some(a => !r.areas.includes(a))) return true;
  const t = new Date(r.screenedAt).getTime();
  return !Number.isFinite(t) || now - t > DAYS_30;
}

/** Answers -> level. The 16 Aug lock: emergency is question 1 = yes, and only that. */
export function levelFor(answers) {
  if (answers?.q1 === "yes") return "emergency";
  if (RED_FLAG_QUESTIONS.some(q => answers?.[q.id] === "yes" || answers?.[q.id] === "unsure")) return "advice";
  return null;
}

/** Record a completed screen. The answers are not stored, only the level (Schema v1.68). */
export function recordScreen(answers) {
  const level = levelFor(answers);
  const now = new Date().toISOString();
  store.set("redFlag", {
    screenedAt: now,
    areas: reportedPainAreas(),
    textVersion: RED_FLAG_VERSION,
    level,
    flaggedAt: level ? now : null,
    clearedAt: null,
  });
  return level;
}

/** The person confirms they have been checked and told they can exercise. */
export function clearRedFlag() {
  const r = _record();
  if (!r.level) return;
  store.set("redFlag", { ...r, clearedAt: new Date().toISOString() });
}

/**
 * The router's one question. Returns "red-flag" when this route must go
 * through the screen first, and remembers where the person was going.
 */
export function guardRoute(route) {
  if (!EXERTIONAL_ROUTES.has(route)) return null;
  if (redFlagStop() || redFlagDue()) {
    _pendingRoute = route;
    return "red-flag";
  }
  return null;
}
