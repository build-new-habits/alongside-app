/**
 * conditions.js - Onboarding Step 5: Select conditions
 *
 * v1.1 — Conditions grouped by body area with section headings.
 *   Replaces the flat alphabetical list which was overwhelming.
 *   Groups: Lower body / Back / Upper body / General health / Hormonal / Other
 *   Same grouping as Settings > Conditions tab for consistency.
 */

import { store } from "../../store.js";
import { CONDITIONS } from "../../data/conditions.js";

export const centered = false;

const AREA_GROUPS = [
  { area: "lower",    label: "Lower body",    icon: "🦵" },
  { area: "back",     label: "Back",          icon: "🔙" },
  { area: "upper",    label: "Upper body",    icon: "💪" },
  { area: "general",  label: "General health",icon: "💙" },
  { area: "hormonal", label: "Hormonal",      icon: "🌙" },
  { area: "other",    label: "Other",         icon: "❓" }
];

export function render() {
  const selected = store.get("conditions") || [];

  return `
    <div class="onboarding-view">
      <div class="onboarding-header">
        <button class="btn btn-ghost" onclick="router.navigate('onboarding/goals')"
                aria-label="Back">Back</button>
        <div class="progress-dots" aria-label="Step 5 of 7">
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot completed" aria-hidden="true"></span>
          <span class="dot active"    aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
          <span class="dot"           aria-hidden="true"></span>
        </div>
      </div>

      <div class="onboarding-content">
        <h1>Anything I should know about?</h1>

        <div class="onboarding-coach-line">
          <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="onboarding-coach-text">If there's anything going on with your body that I should know about, tell me here. I won't avoid movement — I'll make sure what I suggest works with where you are, not against it. Nothing here will surprise me. I've seen it all.</p>
        </div>

        ${AREA_GROUPS.map(group => {
          const groupConditions = CONDITIONS.filter(c => c.area === group.area);
          if (groupConditions.length === 0) return "";
          return `
            <div class="conditions-group">
              <h2 class="conditions-group-heading">
                <span aria-hidden="true">${group.icon}</span>
                ${group.label}
              </h2>
              <div class="conditions-chip-grid" role="group" aria-label="${group.label} conditions">
                ${groupConditions.map(c => `
                  <button
                    class="condition-chip ${selected.includes(c.id) ? "selected" : ""}"
                    data-condition="${c.id}"
                    onclick="toggleCondition('${c.id}')"
                    aria-pressed="${selected.includes(c.id)}"
                  >
                    <span aria-hidden="true">${c.icon}</span>
                    ${c.name}
                  </button>
                `).join("")}
              </div>
            </div>
          `;
        }).join("")}

        <p class="text-sm text-secondary" style="margin-top: var(--space-4); text-align: center;">
          It's okay to skip this — you can add conditions later in Settings.
        </p>
      </div>

      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full"
                onclick="saveConditions()"
                id="conditions-continue-btn">
          ${selected.length > 0 ? "Continue" : "Skip for now"}
        </button>
      </div>
    </div>
  `;
}

window.toggleCondition = function(conditionId) {
  const conditions = store.get("conditions") || [];
  const isSelected = conditions.includes(conditionId);
  const updated    = isSelected
    ? conditions.filter(c => c !== conditionId)
    : [...conditions, conditionId];

  store.set("conditions", updated);

  // Update chip state
  const chip = document.querySelector(`[data-condition="${conditionId}"]`);
  if (chip) {
    chip.classList.toggle("selected", !isSelected);
    chip.setAttribute("aria-pressed", !isSelected);
  }

  // Update continue button label
  const continueBtn = document.getElementById("conditions-continue-btn");
  if (continueBtn) {
    continueBtn.textContent = updated.length > 0 ? "Continue" : "Skip for now";
  }
};

window.saveConditions = function() {
  router.navigate("onboarding/lifestyle");
};
