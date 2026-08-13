/**
 * upgrade.js - Upgrade / Membership view (stub)
 * 13 Aug 2026 v3
 *
 * v3 - A1. Removed the two sentences telling every user to open the
 *   developer panel and triple-tap the version number to switch tiers.
 *   Found by the 13 Aug persona trace. Every locked feature in the
 *   product routes here -- six session types, three durations, the
 *   90-day progress tab, the export block, the In Step door -- so the
 *   single most-visited conversion surface published the tier bypass.
 *
 *   SCOPE NOTE, deliberate. The blueprint filed A1 against settings.js
 *   alone, which was wrong: the flag belongs there but the offending
 *   copy was here. Removing it now rather than waiting for A2 keeps
 *   verify-decisions.mjs green, and A2 replaces this file wholesale, so
 *   the two edits supersede rather than collide.
 *
 *   What remains is still a stub and still says so. A2 builds the real
 *   page from alongside_upgrade_page_architecture_09jul2026_v1.md.
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
