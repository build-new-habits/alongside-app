/**
 * tools/agreed.mjs
 * 02 Oct 2026 v1
 *
 * W4-1 GATE-OPEN. From v626 the app sends anybody who has not answered the
 * age question and agreed to the policies back to onboarding, from every
 * route but the privacy summary. A check that describes somebody using the
 * app must describe somebody who got through onboarding: 18 or over, the
 * Privacy Policy and Terms agreed at the current version, and the health
 * answers agreed. agreed(store) records exactly that, with the app's own
 * version constants. Eighteen older checks built people who had agreed to
 * nothing, which the house-button bypass used to make possible.
 */
import { POLICY_VERSION } from "../js/data/consent-version.js";
import { AGE_CHECK_VERSION } from "../js/data/age-check.js";
import { HEALTH_CONSENT_VERSION } from "../js/data/health-consent.js";

export function agreed(store) {
  const at = new Date().toISOString();
  store.set("consent.ageConfirmed", true);
  store.set("consent.ageCheckedAt", at);
  store.set("consent.ageVersion", AGE_CHECK_VERSION);
  store.set("consent.given", true);
  store.set("consent.at", at);
  store.set("consent.policyVersion", POLICY_VERSION);
  store.set("consent.health", { given: true, at, version: HEALTH_CONSENT_VERSION, withdrawnAt: null });
}
