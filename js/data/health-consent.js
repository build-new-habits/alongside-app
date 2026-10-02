/**
 * js/data/health-consent.js
 * 02 Oct 2026 v4
 *
 * v4 - W4-2 DELETE-LOOSENS. After Delete my health answers and the health
 *   consent given again, the next door that builds a session opens
 *   Settings › What your body can do first (capabilityToAsk). Until then
 *   sessions are planned carefully (store.capabilityProfile()).
 *
 * v3 - W4-1 GATE-OPEN. Never asked now means needed, whether or not the
 *   Privacy-and-Terms consent was given. Before, a person who had agreed to
 *   nothing (the house-button bypass) had health answers allowed.
 *
 * v2 - LEGAL-TRUE. The tick names what the app keeps about the person's body
 *   and how they have been (balance, standing, what they are coming back
 *   from), which Delete my health answers now deletes too.
 *
 * PT-2 HEALTH-CONSENT. Explicit consent for health answers, apart from
 * the Privacy-and-Terms tick, and the guard that asks for it before the
 * next health question.
 *
 * Health answers are what's sore and how much, check-ins, weight, the
 * journal and session notes. UK GDPR treats them as special category
 * data, which needs explicit consent; they were covered only by the one
 * combined tick, and the only way to withdraw was Reset all data.
 * Graeme, 30 Sep: a separate tick, and a delete control.
 *
 * WHO IS ASKED. consent.health.given:
 *   true  -> nothing to ask
 *   false -> withdrawn (Delete my health answers): ask before the next
 *            health question
 *   null  -> never asked. Asked only if the Privacy-and-Terms consent was
 *            given, i.e. an install from before this existed. A fresh
 *            install is asked in onboarding, with both ticks together.
 *
 * WHERE. Only routes whose purpose is a health question: the check-in,
 * I know what I want (it asks what's sore) and the journal. Everything
 * else -- classes, a run, Wellbeing's breathing -- is reached as before.
 * Screens that ask a health question in passing (the finish screen's note
 * and mood, Progress's weight entry) leave it out while consent is not
 * given; they read healthAllowed().
 */
import { store } from "../store.js";

export const HEALTH_CONSENT_VERSION = "2026-10-01";

/** The tick's own words, the same at onboarding and here. */
export const HEALTH_TICK =
  "I agree that Alongside keeps my health answers on this phone — what’s sore and how much, " +
  "what I tell it about my body and how I’ve been, my check-ins, my weight if I add it, and my journal — " +
  "and uses them to shape my sessions.";

export const HEALTH_NOTE =
  "Sessions are built from these answers, so the coach needs them. " +
  "You can delete them any time in Settings › Delete my health answers.";

export const HEALTH_ROUTES = new Set(["checkin", "checkin-mini", "know-what", "journal-entry"]);

export function healthConsentNeeded() {
  const c = store.get("consent") || {};
  const given = c.health ? c.health.given : null;
  return given !== true;
}

export const healthAllowed = () => !healthConsentNeeded();

export function giveHealthConsent() {
  store.set("consent.health", {
    given: true, at: new Date().toISOString(), version: HEALTH_CONSENT_VERSION, withdrawnAt: null
  });
}

let _pendingRoute = null;
export function setPendingRoute(r) { _pendingRoute = r; }
export function takePendingRoute() { const r = _pendingRoute; _pendingRoute = null; return r; }

// W4-2. Doors that build a session from what the person can do.
export const BUILD_ROUTES = new Set([
  "coach-proposal", "session-builder", "know-what", "core-session", "gym-programme", "yoga-session",
]);

/** Answers deleted, consent given again, not answered yet. */
export function capabilityToAsk() {
  const cap = store.get("capability") || {};
  return !!cap.clearedAt && !cap.askedAt && healthAllowed();
}

let _openCapability = false;
/** Settings reads this once: open What your body can do, and say why. */
export function takeOpenCapability() { const v = _openCapability; _openCapability = false; return v; }

/** Router guard: 'health-consent' in place of a health route, or null. */
export function guardRoute(route) {
  if (BUILD_ROUTES.has(route) && capabilityToAsk()) {
    _pendingRoute = route;
    _openCapability = true;
    return "settings";
  }
  if (!HEALTH_ROUTES.has(route)) return null;
  if (!healthConsentNeeded()) return null;
  _pendingRoute = route;
  return "health-consent";
}
