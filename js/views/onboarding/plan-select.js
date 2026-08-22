/**
 * js/views/onboarding/plan-select.js
 * 22 Aug 2026 v2
 * CHOOSER-1. Option building and card markup moved to
 * js/data/plan-options.js so the post-onboarding chooser
 * (views/programme-select.js) presents the identical three options
 * rather than a second copy that can drift. No behaviour change here.
 *
 * NOTE, logged not fixed: this screen still writes six activeProgramme
 * fields directly instead of calling startChapter(). Harmless during
 * onboarding, where everything is already at its default, but it is a
 * second write path for one piece of state -- the divergence class that
 * produced TARGET-3. Tracked as PLAN-WRITE-1.
 *
 * 26 Jun 2026 v1
 *
 * Onboarding — plan selection screen.
 * Inserted between frequency.js and complete.js.
 *
 * Presents three curated programme options derived from the user's goals,
 * fitness level, and weekly frequency target. The best-match programme is
 * pre-selected and carries a "Highly Recommended" gold badge (#B8970A —
 * the locked personal tier gold token for this product).
 *
 * The other two options are character-differentiated, not difficulty-ranked:
 *   - [0] Best match — gold badge, pre-selected
 *   - [1] Gentle start — fewer sessions, more recovery, same destination
 *   - [2] Full commitment — more sessions, faster progression
 *
 * On confirm: writes activeProgramme fields, sets strategicGoal.setAt,
 * calls store.completeOnboarding(), routes to onboarding/complete.
 *
 * Back: routes to onboarding/frequency.
 *
 * WCAG 2.2 AA:
 *   - role="radiogroup" + aria-labelledby on plan card list.
 *   - role="radio" + aria-checked on each plan card.
 *   - 44px minimum touch target.
 *   - Focus-visible ring on all interactive elements.
 *   - Gold badge contrast: #1A1A1A text on #B8970A background — meets AA.
 */

import { store } from "../../store.js";
import {
  buildPlanOptions,
  renderPlanCard as renderSharedPlanCard,
  escapeHtml as _esc
} from "../../data/plan-options.js";

export function PlanSelectView(router) {

  let selectedIndex = 0; // Best match pre-selected

  function buildOptions() {
    return buildPlanOptions();
  }

  function mount(container) {
    render(container);
  }

  function render(container) {
    const options = buildOptions();

    if (options.length === 0) {
      // Graceful fallback — no programmes matched (shouldn't happen with 8 templates)
      store.completeOnboarding();
      router.navigate("onboarding/complete");
      return;
    }

    container.innerHTML = `
      <div class="onboarding-view" role="main">

        <div class="onboarding-header">
          <button class="btn btn-ghost" data-action="back"
                  aria-label="Back to frequency selection">
            &larr; Back
          </button>
          <div class="progress-dots" aria-label="Step 10 of 10">
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot active"    aria-hidden="true"></span>
          </div>
        </div>

        <div class="onboarding-content">
          <h1>Your plan options</h1>
          <p class="text-secondary" style="margin-bottom: var(--space-5);">
            Based on what you have shared, here is what I suggest.
          </p>

          <div class="plan-list"
               role="radiogroup"
               aria-labelledby="plan-list-label">
            <p class="sr-only" id="plan-list-label">Choose your training plan</p>

            ${options.map((opt, i) => renderPlanCard(opt, i)).join("")}

          </div>
        </div>

        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full"
                  data-action="confirm"
                  aria-label="Confirm your plan and continue">
            Confirm this plan
          </button>
        </div>

      </div>
    `;

    // Back
    container.querySelector("[data-action='back']")?.addEventListener("click", () => {
      router.navigate("onboarding/frequency");
    });

    // Plan card selection
    container.querySelectorAll(".plan-card").forEach(card => {
      card.addEventListener("click", () => {
        selectedIndex = parseInt(card.dataset.planIndex, 10);
        container.querySelectorAll(".plan-card").forEach((c, i) => {
          const isSelected = i === selectedIndex;
          c.classList.toggle("plan-card--selected", isSelected);
          c.setAttribute("aria-checked", isSelected);
        });
      });
    });

    // Confirm
    container.querySelector("[data-action='confirm']")?.addEventListener("click", () => {
      const chosen     = options[selectedIndex];
      const programme  = chosen.programme;
      const weeklyTarget = chosen.variant === "gentle"
        ? Math.max(1, (store.get("strategicGoal.weeklySessionTarget") || 3) - 1)
        : chosen.variant === "committed"
        ? Math.min(6, (store.get("strategicGoal.weeklySessionTarget") || 3) + 1)
        : store.get("strategicGoal.weeklySessionTarget") || 3;

      // Write programme selection
      store.set("activeProgramme.programmeId",      programme.id);
      store.set("activeProgramme.programmeName",    programme.name);
      store.set("activeProgramme.startDate",        new Date().toISOString());
      store.set("activeProgramme.currentWeek",      1);
      store.set("activeProgramme.currentPhase",     programme.phases?.[0]?.id || "build");
      store.set("activeProgramme.phase",            1);
      store.set("strategicGoal.weeklySessionTarget", weeklyTarget);
      store.set("strategicGoal.setAt",              new Date().toISOString());

      // Complete onboarding
      store.completeOnboarding();

      router.navigate("onboarding/complete");
    });
  }

  function renderPlanCard(opt, index) {
    return renderSharedPlanCard(opt, index, index === selectedIndex);
  }


  return { mount };
}
