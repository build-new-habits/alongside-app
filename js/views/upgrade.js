/**
 * upgrade.js - Upgrade / Membership view (stub)
 *
 * 03 Aug 2026 v2 - Fixed crash: render() called store.getUserTier(),
 *   which doesn't exist anywhere in store.js - confirmed via direct grep
 *   03 Aug, found while checking tier-gating status. Every other live
 *   reader (settings.js, progress.js, session-builder-ui.js's isPremium()
 *   as of its own 31 Jul fix) uses store.get("tier"), which defaults to
 *   "free" in store.js's own default shape (line 455) - matched that
 *   pattern here rather than inventing a new one. This screen would have
 *   thrown the instant anyone navigated to it; not yet confirmed whether
 *   that happened in practice, no crash report exists, but the code path
 *   was unambiguous.
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
  const tier = store.get("tier") || "free";
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
