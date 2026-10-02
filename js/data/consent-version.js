/**
 * js/data/consent-version.js
 * 02 Oct 2026 v3
 *
 * v3 - W4-13 CONSENT-VERSIONS. POLICY_HISTORY, per version; changesSince()
 *   lists only the versions after the one agreed, without a change the
 *   person already has (policyChangesFor). consentWaiting() for the router:
 *   no house button while the policy or first consent waits.
 *
 * 02 Oct 2026 v2
 *
 * v2 - W4-1 GATE-OPEN. Adult, but the Privacy Policy and Terms not yet
 *   agreed: every route but the privacy summary goes back to onboarding,
 *   which shows the consent screen. Settings is not open in this case (a
 *   name typed there used to make start-up skip onboarding for good).
 *
 * CONSENT-VERSION. Which version of the Privacy Policy and Terms somebody
 * agreed to, and asking again when it changes.
 *
 * consent.policyVersion has been recorded with every agreement since
 * 11 Aug 2026 so that a later change could tell who needs to agree again;
 * nothing ever read it. The Privacy Policy v6 says: if we change it in a
 * way that matters, the app asks you to agree to the new version before
 * you carry on. This is what makes that true.
 *
 * WHO IS ASKED. Somebody who agreed (consent.given) to an older version,
 * and who has passed the age check. Onboarding records the current version.
 * The privacy summary and Settings stay reachable, so somebody who does
 * not agree can still download or delete everything.
 */
import { store } from "../store.js";

export const POLICY_VERSION = "2026-10-01";

/**
 * W4-13 (Wave 4, 2.4). What changed, per version, oldest first. The policy
 * screen lists only the versions after the one the person agreed to (one
 * fixed list told somebody who agreed on day one that their health answers
 * "now" had a consent they had already given). A change the person
 * already has is left out (`unless`). Add a version here when POLICY_VERSION
 * changes; the last entry must be POLICY_VERSION (verify-consent-versions).
 */
export const POLICY_HISTORY = Object.freeze([
  { version: "2026-10-01", changes: [
    { text: "Your health answers now have their own consent, and Settings › Delete my health answers removes them.",
      unless: c => c?.health?.given === true || c?.health?.withdrawnAt != null || c?.health?.declinedAt != null },
    { text: "Alongside is for adults: it asks when you were born, and keeps only whether you are 18 or over." },
    { text: "Error reports to Sentry carry what broke, never what you told the app." },
    { text: "The privacy summary in the app says exactly what is kept on this phone and how to delete it." },
  ] },
]);

/** The changes since `agreed` (a version, or null for never recorded). */
export function changesSince(agreed, history = POLICY_HISTORY, consent = null) {
  const at = history.findIndex(h => h.version === agreed);
  return history.slice(at + 1)
    .flatMap(h => h.changes)
    .map(c => (typeof c === "string" ? { text: c } : c))
    .filter(c => !(consent && typeof c.unless === "function" && c.unless(consent)));
}

/** What this person is shown: the changes since what they agreed to. */
export function policyChangesFor() {
  const c = store.get("consent") || {};
  return changesSince(c.policyVersion ?? null, POLICY_HISTORY, c).map(x => x.text);
}

/** Somebody adult who is waiting on the policy or the first consent. */
export const consentWaiting = () => consentUpdateNeeded() || consentNeeded();

const OPEN = new Set(["consent-update", "privacy", "settings", "under-18", "age-check", "onboarding/thread"]);

export function consentUpdateNeeded() {
  const c = store.get("consent") || {};
  return c.given === true && c.ageConfirmed === true && c.policyVersion !== POLICY_VERSION;
}

let _pending = null;
export function takePendingRoute() { const r = _pending; _pending = null; return r; }

/** Adult, but nothing agreed yet. */
export const consentNeeded = () => {
  const c = store.get("consent") || {};
  return c.ageConfirmed === true && c.given !== true;
};
const BEFORE_CONSENT_OPEN = new Set(["onboarding/thread", "privacy"]);

export function guardRoute(route) {
  if (consentNeeded()) return BEFORE_CONSENT_OPEN.has(route) ? null : "onboarding/thread";
  if (OPEN.has(route) || !consentUpdateNeeded()) return null;
  _pending = route;
  return "consent-update";
}

export function agreeToCurrent() {
  store.set("consent.policyVersion", POLICY_VERSION);
  store.set("consent.at", new Date().toISOString());
}
