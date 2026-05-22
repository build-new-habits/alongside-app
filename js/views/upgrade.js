/**
 * upgrade.js - Upgrade / Membership view (stub)
 *
 * 22 May 2026 v1 --- Stub to prevent 404. Full Stripe integration: Phase F (August 2026).
 *
 * During beta, tier switching is done via the dev panel (triple-tap version
 * number in Settings). This view will become the full paywall/upgrade screen
 * when Stripe is live.
 */

import { store } from "../store.js";

export const centered = false;

export function render() {
  const tier = store.getUserTier();
  return `
    <div class="view" style="padding:var(--space-6);">

      <div class="view-header">
        <button class="btn btn-ghost" onclick="router.back()" aria-label="Go back">
          &larr; Back
        </button>
      </div>

      <div class="card card-coach" style="margin-top:var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">
            Subscriptions are coming soon. You are currently on the
            <strong>${tier}</strong> tier.
          </p>
          <p class="text-sm text-muted" style="margin-top:var(--space-2);">
            During beta, use the dev panel to switch tiers.
            Triple-tap the version number at the bottom of Settings.
          </p>
        </div>
      </div>

      <button class="btn btn-primary btn-full btn-large" style="margin-top:var(--space-6);"
              onclick="router.navigate('settings')"
              aria-label="Go to Settings">
        Go to Settings
      </button>

    </div>
  `;
}

export function onMount() {
  // No wiring needed for stub
}
