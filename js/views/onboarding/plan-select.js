/**
 * js/views/onboarding/plan-select.js
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

import { store }                 from "../../store.js";
import { getProgrammesForGoals } from "../../data/programmes.js";
import { toEngineGoals }         from "../../data/goals.js";

export function PlanSelectView(router) {

  let selectedIndex = 0; // Best match pre-selected

  function buildOptions() {
    const goals       = store.get("goals") || [];
    const weeklyTarget = store.get("strategicGoal.weeklySessionTarget") || 3;
    const engineGoals = toEngineGoals(goals);
    const programmes  = getProgrammesForGoals(engineGoals);
    const best        = programmes[0];

    if (!best) return [];

    // Derive three character-differentiated variants from the best match
    return [
      {
        programme:   best,
        badge:       "Highly Recommended",
        variant:     "recommended",
        tagOverride: null,
        noteOverride: null,
        weeklyNote:  `${weeklyTarget} session${weeklyTarget !== 1 ? "s" : ""} a week`,
      },
      {
        programme:   best,
        badge:       null,
        variant:     "gentle",
        tagOverride: "Gentle start",
        noteOverride: "Fewer sessions, more recovery time. The same destination, at your pace.",
        weeklyNote:  `${Math.max(1, weeklyTarget - 1)} session${weeklyTarget - 1 !== 1 ? "s" : ""} a week`,
      },
      {
        programme:   best,
        badge:       null,
        variant:     "committed",
        tagOverride: "Full commitment",
        noteOverride: "More sessions, faster progression. For when you are ready to push.",
        weeklyNote:  `${Math.min(6, weeklyTarget + 1)} session${weeklyTarget + 1 !== 1 ? "s" : ""} a week`,
      },
    ];
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
    const isSelected  = index === selectedIndex;
    const prog        = opt.programme;
    const name        = opt.tagOverride  || prog.name || "Your programme";
    const description = opt.noteOverride || prog.tagline || prog.description || "";
    const firstPhase  = prog.phases?.[0];
    const weeks       = prog.durationWeeks || 12;

    return `
      <div class="plan-card ${isSelected ? "plan-card--selected" : ""} ${opt.variant === "recommended" ? "plan-card--recommended" : ""}"
           data-plan-index="${index}"
           role="radio"
           aria-checked="${isSelected}"
           tabindex="${isSelected ? "0" : "-1"}">

        ${opt.badge ? `
          <div class="plan-badge" aria-label="${opt.badge}">
            ${opt.badge}
          </div>
        ` : ""}

        <div class="plan-card__body">
          <div class="plan-card__header">
            <span class="plan-card__icon" aria-hidden="true">
              ${prog.icon || "&#127793;"}
            </span>
            <div class="plan-card__titles">
              <p class="plan-card__name">${_esc(name)}</p>
              <p class="plan-card__weekly">${_esc(opt.weeklyNote)}</p>
            </div>
            <span class="plan-card__duration">${weeks}w</span>
          </div>

          <p class="plan-card__desc">${_esc(description)}</p>

          ${firstPhase && !opt.tagOverride ? `
            <p class="plan-card__phase-hint">
              First four weeks: ${_esc(firstPhase.description || firstPhase.name || "")}
            </p>
          ` : ""}
        </div>

        <div class="plan-card__select-indicator" aria-hidden="true">
          ${isSelected ? "&#10003;" : ""}
        </div>

      </div>
    `;
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
