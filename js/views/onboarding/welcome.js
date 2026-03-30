/**
 * welcome.js - Onboarding Screen 0: Welcome and consent
 *
 * v2.0 — Replaces feature-list welcome with coach-led consent screen.
 *   Coach icon and voice lead. Consent text appears above the Start
 *   button so users read it before tapping. Tapping Start constitutes
 *   informed consent under GDPR. Consent timestamp written to store.
 */

import { store } from "../../store.js";

export const centered = false;

export function render() {
  return `
    <div class="onboarding-view onboarding-welcome">

      <div class="onboarding-content onboarding-welcome-content">

        <!-- Coach icon -->
        <div class="welcome-coach-icon">
          <img src="assets/images/logo-icon-small.png"
               alt="Alongside coach"
               width="96" height="96"
               class="welcome-coach-img">
        </div>

        <!-- Coach voice -->
        <h1 class="welcome-heading">Welcome to Alongside</h1>

        <div class="welcome-coach-text">
          <p>I'm here to support your movement — not to judge it, time it, or score it.</p>
          <p>Over the next few minutes I'll ask you a few things so I can start to
             understand what you and your body need. Everything you share stays private
             and is only ever used to make your sessions feel right for you.</p>
          <p>You can change or delete anything at any time.</p>
        </div>

        <!-- What to expect — light, not a feature list -->
        <div class="welcome-pillars">
          <div class="welcome-pillar">
            <span class="welcome-pillar-icon" aria-hidden="true">🌱</span>
            <span class="welcome-pillar-text">No streaks. No shame. No judgement.</span>
          </div>
          <div class="welcome-pillar">
            <span class="welcome-pillar-icon" aria-hidden="true">💙</span>
            <span class="welcome-pillar-text">I adapt to your energy, your body, and your life.</span>
          </div>
          <div class="welcome-pillar">
            <span class="welcome-pillar-icon" aria-hidden="true">🔒</span>
            <span class="welcome-pillar-text">Your data is private. Always.</span>
          </div>
        </div>

      </div>

      <div class="onboarding-actions">

        <!-- Consent text — above button so it is read before tapping -->
        <p class="welcome-consent-text">
          By tapping Start you agree to our
          <button class="btn-inline-link" onclick="router.navigate('onboarding/privacy')"
                  aria-label="Read our Privacy Policy and Terms of Service">
            Privacy Policy and Terms of Service
          </button>.
        </p>

        <button class="btn btn-primary btn-large btn-full"
                onclick="startOnboarding()"
                aria-label="Start — agree to Privacy Policy and Terms of Service">
          Start
        </button>

        <p class="text-sm text-secondary text-center" style="margin-top: var(--space-3);">
          Takes about 3 - 4 minutes
        </p>

      </div>
    </div>
  `;
}

window.startOnboarding = function() {
  // Record consent timestamp — GDPR audit trail
  store.set("consentGiven", true);
  store.set("consentAt", new Date().toISOString());
  router.navigate("onboarding/name");
};
