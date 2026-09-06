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
import { generateConditionCaveats } from "../../data/onboarding-thread-data.js";

export const centered = false;

const AREA_GROUPS = [
  { area: "lower",    label: "Lower body",    icon: "🦵" },
  { area: "back",     label: "Back",          icon: "🔙" },
  { area: "upper",    label: "Upper body",    icon: "💪" },
  { area: "general",  label: "General health",icon: "💙" },
  { area: "hormonal", label: "Hormonal",      icon: "🌙" },
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
  const caveatText = generateConditionCaveats(selected);

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

      <!-- CR-3, 06 Sep 2026. The caveat region.
           This view is reached from Settings > Edit conditions as well as
           from onboarding, so someone declaring hypermobility months later
           gets the same words as someone declaring it on day one. The text
           comes from generateConditionCaveats() rather than being written
           again here: two versions of a safety caveat is one too many.
           aria-live so it is announced when it appears rather than only
           being findable by someone who happens to scroll back. -->
      <div class="conditions-caveat"
           id="conditions-caveat"
           role="status"
           aria-live="polite"
           ${caveatText ? "" : "hidden"}>${_esc(caveatText)}</div>

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

  // CR-3. Keep the caveat in step with the selection, in both directions.
  // Showing it on select and never clearing it on deselect would leave a
  // warning attached to a condition the person has just removed.
  const caveatEl = document.getElementById("conditions-caveat");
  if (caveatEl) {
    const text = generateConditionCaveats(updated);
    caveatEl.textContent = text;
    caveatEl.hidden = !text;
  }

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
