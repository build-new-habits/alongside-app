/**
 * js/views/onboarding/frequency.js
 * 26 Jun 2026 v1
 *
 * Onboarding — weekly frequency selection.
 * Inserted between equipment.js and plan-select.js.
 *
 * Asks how many days a week the user wants to train.
 * Pre-selects 3 (the statistical mode and store default).
 * Writes to strategicGoal.weeklySessionTarget.
 * Routes forward to onboarding/plan-select.
 * Routes back to onboarding/equipment.
 *
 * WCAG 2.2 AA:
 *   - role="group" + aria-labelledby on card grid.
 *   - aria-pressed on each frequency card.
 *   - 44px minimum touch target on all interactive elements.
 *   - Focus-visible ring on all interactive elements.
 */

import { store } from "../../store.js";

export function FrequencyView(router) {

  let selected = store.get("strategicGoal.weeklySessionTarget") || 3;

  const OPTIONS = [
    { days: 1, label: "1 day",  note: "One session a week, done well"         },
    { days: 2, label: "2 days", note: "Twice a week, steady and sustainable"  },
    { days: 3, label: "3 days", note: "Three sessions — the most common start"},
    { days: 4, label: "4 days", note: "Four days — building real momentum"    },
    { days: 5, label: "5 days", note: "Five days — a serious commitment"      },
    { days: 6, label: "6 days", note: "Six days — high output, high recovery" },
  ];

  function mount(container) {
    render(container);
  }

  function render(container) {
    container.innerHTML = `
      <div class="onboarding-view" role="main">

        <div class="onboarding-header">
          <button class="btn btn-ghost" data-action="back"
                  aria-label="Back to equipment">
            &larr; Back
          </button>
          <div class="progress-dots" aria-label="Step 9 of 10">
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot completed" aria-hidden="true"></span>
            <span class="dot active"    aria-hidden="true"></span>
            <span class="dot"           aria-hidden="true"></span>
          </div>
        </div>

        <div class="onboarding-content">
          <h1>How many days a week?</h1>
          <div class="onboarding-coach-line">
            <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
            <p class="onboarding-coach-text">
              There is no right answer here — just an honest one.
              Pick what you can genuinely commit to, not what sounds impressive.
              We can always adjust.
            </p>
          </div>

          <div class="freq-grid"
               role="group"
               aria-labelledby="freq-grid-label">
            <p class="sr-only" id="freq-grid-label">Select number of training days per week</p>
            ${OPTIONS.map(opt => `
              <button class="freq-card ${selected === opt.days ? "freq-card--selected" : ""}"
                      data-days="${opt.days}"
                      aria-pressed="${selected === opt.days}">
                <span class="freq-card__number" aria-hidden="true">${opt.days}</span>
                <span class="freq-card__label">${opt.label}</span>
                <span class="freq-card__note">${opt.note}</span>
              </button>
            `).join("")}
          </div>
        </div>

        <div class="onboarding-actions">
          <button class="btn btn-primary btn-large btn-full"
                  data-action="continue"
                  aria-label="Continue to plan selection">
            See my plan options
          </button>
        </div>

      </div>
    `;

    // Back
    container.querySelector("[data-action='back']")?.addEventListener("click", () => {
      router.navigate("onboarding/equipment");
    });

    // Frequency card selection
    container.querySelectorAll(".freq-card").forEach(card => {
      card.addEventListener("click", () => {
        selected = parseInt(card.dataset.days, 10);
        store.set("strategicGoal.weeklySessionTarget", selected);
        // Update UI in-place
        container.querySelectorAll(".freq-card").forEach(c => {
          const isSelected = parseInt(c.dataset.days, 10) === selected;
          c.classList.toggle("freq-card--selected", isSelected);
          c.setAttribute("aria-pressed", isSelected);
        });
      });
    });

    // Continue
    container.querySelector("[data-action='continue']")?.addEventListener("click", () => {
      store.set("strategicGoal.weeklySessionTarget", selected);
      router.navigate("onboarding/plan-select");
    });
  }

  return { mount };
}
