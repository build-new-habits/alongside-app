/**
 * onboarding/complete.js
 * 28 Jun 2026 v5
 *
 * v5 (28 Jun 2026):
 *   Routes to onboarding/arrival now that D6 content is deployed
 *   and arrival.js, hard-before.js, reflection.js are built.
 *   Removes the D6 content gate comment — gate is cleared.
 *
 * v4 (26 Jun 2026):
 *   Routes directly to today instead of onboarding/arrival.
 *   arrival.js was content-gated (D6) — now resolved.
 *
 * v3 (26 Jun 2026):
 *   - Programme selection removed — plan-select.js owns it.
 *   - store.completeOnboarding() removed — called by plan-select.js on confirm.
 *   - Journey card now reads from already-written activeProgramme fields.
 *   - Back button removed — this is a terminal celebration, not revisitable.
 *
 * v2 (23 Jun 2026 S4-3):
 *   - Journey outline card, planPresentedAt, routes to arrival.js.
 *
 * v1: original completion screen.
 *
 * WCAG 2.2 AA:
 *   Journey card: role="region", aria-label.
 *   Continue button: descriptive aria-label.
 *   All text meets 4.5:1 contrast ratio on background.
 *   Touch target: minimum 44px.
 */

import { store } from "../../store.js";

export function CompleteView(router) {

  function mount(container) {
    if (!store.get("strategicGoal.planPresentedAt")) {
      store.set("strategicGoal.planPresentedAt", new Date().toISOString());
    }
    render(container);
  }

  function render(container) {
    const name          = store.get("name") || "";
    const programmeName = store.get("activeProgramme.programmeName") || "";
    const weeklyTarget  = store.get("strategicGoal.weeklySessionTarget") || 3;

    container.innerHTML = `
      <div class="onboarding-view onboarding-view--complete"
           role="main"
           aria-label="You are ready">

        <div class="onboarding-content">
          <h1 class="onboarding-step-title">
            ${name ? "You are set, " + _esc(_cap(name)) + "." : "You are set."}
          </h1>
          <p class="text-secondary" style="margin-bottom: var(--space-5);">
            Here is what the first few weeks look like.
          </p>

          <div class="complete-journey-card"
               role="region"
               aria-label="Your programme plan">

            <div class="complete-journey-card__programme">
              <span class="complete-journey-card__icon" aria-hidden="true">&#127793;</span>
              <div>
                <p class="complete-journey-card__programme-name">
                  ${_esc(programmeName || "Your programme")}
                </p>
                <p class="complete-journey-card__programme-tagline">
                  Chosen by you. Shaped by how you feel each day.
                </p>
              </div>
            </div>

            <div class="complete-journey-card__detail">
              <div class="complete-journey-card__stat">
                <span class="complete-journey-card__stat-number">${weeklyTarget}</span>
                <span class="complete-journey-card__stat-label">sessions a week</span>
              </div>
              <div class="complete-journey-card__stat">
                <span class="complete-journey-card__stat-number">12</span>
                <span class="complete-journey-card__stat-label">weeks</span>
              </div>
            </div>

            <div class="complete-journey-card__coach-note">
              <p>
                Every session adapts to how you feel that day.
                The plan is the structure — what actually happens is always yours to shape.
              </p>
            </div>

          </div>
        </div>

        <div class="onboarding-actions">
          <button
            class="btn btn-primary btn-large btn-full"
            data-action="continue"
            aria-label="Continue to meet your coach">
            Let's begin
          </button>
        </div>

      </div>
    `;

    container.querySelector("[data-action='continue']")?.addEventListener("click", () => {
      router.navigate("onboarding/arrival");
    });
  }

  function _cap(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function _esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return { mount };
}
