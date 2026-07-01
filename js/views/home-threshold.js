/**
 * home-threshold.js - The moment between choosing and beginning
 * 01 Jul 2026 v1
 *
 * v1 — Stub. home-threshold is a D3 content-gated view — the threshold
 *   moment between accepting a coach proposal and beginning the session.
 *   This stub routes directly to the session without a threshold moment.
 *   D3 content build will replace this with the real experience.
 *
 *   Why this file exists: router.js v7 registers 'home-threshold' and
 *   today.js v3 navigates here after a proposal is accepted. Without
 *   this file the dynamic import throws a 404 and the router error
 *   handler shows the crash screen. The today.js try/catch fallback
 *   cannot rescue this because router.navigate() itself succeeds —
 *   the failure only surfaces inside the async _mountView() call.
 *
 * Route: home-threshold
 * Nav: hidden (core flow)
 */

import { store } from "../store.js";

export function HomeThresholdView(router) {

  function mount(container) {
    // Brief loading state — prevents blank flash during async navigate
    container.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        color: var(--color-text-muted);
        font-size: var(--text-sm);
      " aria-live="polite" aria-label="Loading session">
      </div>
    `;

    // Resolve the session route from store and navigate
    const sessionRoute = _resolveSessionRoute();
    router.navigate(sessionRoute);
  }

  function _resolveSessionRoute() {
    // Check for a generated session with a known type
    const generated = store.get("generatedSession");
    if (generated?.session?.type) {
      const TYPE_ROUTE = {
        "workout":         "workout",
        "gym-programme":   "gym-programme",
        "morning-session": "morning-session",
        "yoga-session":    "yoga-session",
        "walk-session":    "walk-session",
        "running-session": "running-session",
        "cycle-session":   "cycle-session",
        "swim-session":    "swim-session",
        "core-session":    "core-session",
        "quiet-session":   "quiet-session",
        "breathing-session": "breathing-session",
      };
      const route = TYPE_ROUTE[generated.session.type];
      if (route) return route;
    }

    // Fall back to proposal type
    const proposalType = store.get("lastProposalType");
    const PROPOSAL_ROUTE = {
      "bypass-library":    "library",
      "bypass-facilitate": "session-builder",
    };
    return PROPOSAL_ROUTE[proposalType] || "coach-proposal";
  }

  return { mount };
}
