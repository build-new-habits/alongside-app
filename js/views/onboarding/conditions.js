/**
 * conditions.js - Onboarding Step 5: Select conditions
 *
 * 01 Oct 2026 v1.4
 *   BUNDLE-TRUE. "Tell me where, and I'll leave out movements..." is tied to
 *   a bad day, as the plan works (see onboarding-thread-data.js v19).
 *
 * 01 Oct 2026 v1.3
 *   PT-3. No Hormonal group: Perimenopause and Menopause are not sore areas.
 *
 * 29 Sep 2026 v1.2
 *
 * v1.2 - P0, SCOPE-MINOR (Graeme, 29 Sep). Asks about sore or injured
 *   areas, not medical conditions; "General health" is now "Everyday";
 *   the scope statement (data/scope-statement.js) replaces the per-
 *   condition caveat region, and is shown to everybody who opens this,
 *   from onboarding or from Settings.
 *
 * v1.1 — Conditions grouped by body area with section headings.
 *   Replaces the flat alphabetical list which was overwhelming.
 *   Groups: Lower body / Back / Upper body / General health / Hormonal / Other
 *   Same grouping as Settings > Conditions tab for consistency.
 */

import { store } from "../../store.js";
import { CONDITIONS } from "../../data/conditions.js";
import { scopeStatementHTML } from "../../data/scope-statement.js";

export const centered = false;

const AREA_GROUPS = [
  { area: "lower",    label: "Lower body",    icon: "🦵" },
  { area: "back",     label: "Back",          icon: "🔙" },
  { area: "upper",    label: "Upper body",    icon: "💪" },
  { area: "general",  label: "Everyday",      icon: "💙" },
  { area: "other",    label: "Other",         icon: "❓" }
];

// CR-3. Text is interpolated into markup, so it is escaped at the point
// of insertion rather than trusted for being ours today.
function _esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function render() {
  const selected   = store.get("conditions") || [];

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
        <h1>Anything sore, or an injury you're careful around?</h1>

        <div class="onboarding-coach-line">
          <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="onboarding-coach-text">Tell me where. When you check in, you can tell me how it is that day, and on a day it's bad I'll leave out movements that are likely to make it worse. You'll still move — just not in the way that aggravates it.</p>
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
              <div class="conditions-chip-grid" role="group" aria-label="${group.label}">
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
          It's okay to skip this — you can add these later in Settings.
        </p>
      </div>

      ${scopeStatementHTML({ heading: "h2", id: "conditions-scope" })}

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
