/**
 * settings.js - Settings view
 *
 * v1.1 — Conditions tab full rebuild:
 *   Add condition  — chip picker from full CONDITIONS list, grouped by area.
 *                    Conditions already active are shown as selected and excluded
 *                    from the add list so duplicates are impossible.
 *   Remove         — tap remove, confirm in an inline confirmation step.
 *                    Health data: no accidental deletes.
 *   Pause / resume — soft-disable without removing. Paused conditions are
 *                    shown greyed out with a "Resume" button. They remain in
 *                    conditions[] but conditionStatus[id] = "paused" signals
 *                    the generator to skip them (generator wire: Phase 3B).
 *   Story fields   — how long / what helps / professional involved.
 *                    Collapsed per condition, expand on tap.
 *                    Writes to conditionStories[id] in store on blur.
 *
 * v1.0 — Tabbed layout: Profile / Conditions / Equipment.
 */

import { store } from "../store.js";
import { CONDITIONS, getConditionName } from "../data/conditions.js";
import { EQUIPMENT_CATEGORIES } from "../data/equipment.js";

export const centered = false;

// ── Tab state ─────────────────────────────────────────────────────────────────
// Held at module level so switching tabs re-renders without losing scroll pos.
let activeTab = "profile";

// ── Conditions tab state ──────────────────────────────────────────────────────
// Tracks which condition story panel is currently expanded (one at a time).
let expandedStoryId = null;
// Tracks which condition is pending removal confirmation.
let pendingRemoveId = null;
// Whether the "add condition" picker is open.
let addPickerOpen = false;

// ── Coach style definitions ───────────────────────────────────────────────────
const COACH_STYLES = [
  {
    id:          "steady",
    label:       "Steady",
    description: "Calm, consistent, and supportive. Never rushed.",
    icon:        "🌿"
  },
  {
    id:          "energetic",
    label:       "Energetic",
    description: "Upbeat, motivating, and enthusiastic.",
    icon:        "⚡"
  },
  {
    id:          "minimal",
    label:       "Minimal",
    description: "Short, direct, and to the point. No fluff.",
    icon:        "🎯"
  },
  {
    id:          "nurturing",
    label:       "Nurturing",
    description: "Warm, gentle, and emotionally attentive.",
    icon:        "💛"
  }
];

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  return `
    <div class="view settings-view">

      <div class="view-header">
        <h1>Settings</h1>
      </div>

      <!-- ── Tab bar ──────────────────────────────────────────────────────── -->
      <div class="settings-tabs" role="tablist" aria-label="Settings sections">
        <button
          class="settings-tab ${activeTab === "profile"    ? "active" : ""}"
          role="tab"
          aria-selected="${activeTab === "profile"}"
          aria-controls="settings-tab-panel"
          id="tab-profile"
          data-tab="profile"
        >Profile</button>
        <button
          class="settings-tab ${activeTab === "conditions" ? "active" : ""}"
          role="tab"
          aria-selected="${activeTab === "conditions"}"
          aria-controls="settings-tab-panel"
          id="tab-conditions"
          data-tab="conditions"
        >Conditions</button>
        <button
          class="settings-tab ${activeTab === "equipment"  ? "active" : ""}"
          role="tab"
          aria-selected="${activeTab === "equipment"}"
          aria-controls="settings-tab-panel"
          id="tab-equipment"
          data-tab="equipment"
        >Equipment</button>
      </div>

      <!-- ── Tab panel ────────────────────────────────────────────────────── -->
      <div
        id="settings-tab-panel"
        role="tabpanel"
        aria-labelledby="tab-${activeTab}"
        class="settings-tab-panel"
      >
        ${renderActiveTab()}
      </div>

      <!-- ── Reset — always visible ───────────────────────────────────────── -->
      <div class="settings-reset-zone">
        <button class="btn btn-danger btn-full" id="reset-app-btn">
          Reset App (Start Over)
        </button>
      </div>

    </div>
  `;
}

// ── Tab content ───────────────────────────────────────────────────────────────

function renderActiveTab() {
  if (activeTab === "profile")    return renderProfileTab();
  if (activeTab === "conditions") return renderConditionsTab();
  if (activeTab === "equipment")  return renderEquipmentTab();
  return "";
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function renderProfileTab() {
  const name       = store.get("name")       || "Not set";
  const age        = store.get("age");
  const gender     = store.get("gender");
  const weight     = store.get("weight");
  const weightUnit = store.get("weightUnit") || "kg";
  const coachStyle = store.get("coachStyle") || "steady";

  return `
    <section aria-labelledby="profile-heading">

      <!-- Profile details — read only -->
      <h2 id="profile-heading" class="section-heading">Your profile</h2>
      <div class="card settings-profile-card">
        ${settingsRow("Name",   name)}
        ${settingsRow("Age",    age    ? `${age}`                      : "Not set")}
        ${settingsRow("Gender", gender ? formatGender(gender)          : "Not set")}
        ${settingsRow("Weight", weight ? `${weight}${weightUnit}`      : "Not set")}
      </div>

      <!-- Coach style selector -->
      <h2 class="section-heading" style="margin-top: var(--space-6);">Coach style</h2>
      <p class="text-secondary settings-coach-intro">
        Choose how your coach communicates with you.
        You can change this any time.
      </p>

      <div class="coach-style-grid" role="radiogroup" aria-label="Coach communication style">
        ${COACH_STYLES.map(style => `
          <button
            class="coach-style-card ${coachStyle === style.id ? "selected" : ""}"
            role="radio"
            aria-checked="${coachStyle === style.id}"
            data-style="${style.id}"
            aria-label="${style.label}: ${style.description}"
          >
            <span class="coach-style-icon" aria-hidden="true">${style.icon}</span>
            <span class="coach-style-label">${style.label}</span>
            <span class="coach-style-desc">${style.description}</span>
          </button>
        `).join("")}
      </div>

    </section>
  `;
}

// ── Conditions tab ────────────────────────────────────────────────────────────

function renderConditionsTab() {
  const conditions   = store.get("conditions")            || [];
  const statuses     = store.get("conditionStatus")       || {};
  const stories      = store.get("conditionStories")      || {};
  const customNames  = store.get("customConditionNames")  || {};

  // Group CONDITIONS by area for the add picker
  const AREA_LABELS = {
    lower:    "Lower body",
    back:     "Back",
    upper:    "Upper body",
    general:  "General health",
    hormonal: "Hormonal",
    other:    "Other"
  };

  return `
    <section aria-labelledby="conditions-heading">
      <h2 id="conditions-heading" class="section-heading">Your conditions</h2>

      <p class="text-secondary settings-conditions-intro">
        These are used to adapt your sessions. Pausing a condition keeps it
        saved but stops it affecting your workouts temporarily.
      </p>

      <!-- ── Active conditions list ──────────────────────────────────── -->
      ${conditions.length === 0 ? `
        <div class="card">
          <p class="text-secondary">No conditions recorded yet.</p>
        </div>
      ` : `
        <div class="conditions-list" aria-label="Your conditions">
          ${conditions.map(id => {
            const cond        = CONDITIONS.find(c => c.id === id);
            const defaultName = cond ? cond.name : id;
            const icon        = cond ? cond.icon : "?";
            const isOther     = id === "other";
            // Use custom name if set, otherwise default
            const displayName = (isOther && customNames[id]) ? customNames[id] : defaultName;
            const status      = statuses[id] || "active";
            const isPaused    = status === "paused";
            const story       = stories[id] || {};
            const isExpanded  = expandedStoryId === id;
            const isPending   = pendingRemoveId === id;

            return `
              <div class="condition-card ${isPaused ? "condition-card--paused" : ""}"
                   data-condition-id="${id}">

                <!-- ── Header row ────────────────────────────────── -->
                <div class="condition-card-header">
                  <span class="condition-card-icon" aria-hidden="true">${icon}</span>
                  <span class="condition-card-name">
                    ${displayName}
                    ${isPaused ? '<span class="condition-paused-badge">Paused</span>' : ""}
                  </span>
                  <div class="condition-card-actions">
                    <button
                      class="btn-text condition-pause-btn"
                      data-condition-id="${id}"
                      aria-label="${isPaused ? "Resume" : "Pause"} ${displayName}"
                    >${isPaused ? "Resume" : "Pause"}</button>
                    <button
                      class="btn-text condition-story-btn"
                      data-condition-id="${id}"
                      aria-expanded="${isExpanded}"
                      aria-controls="story-${id}"
                    >${isExpanded ? "Less" : "About this"}</button>
                    <button
                      class="btn-text btn-text--danger condition-remove-btn"
                      data-condition-id="${id}"
                      aria-label="Remove ${displayName}"
                    >Remove</button>
                  </div>
                </div>

                <!-- ── Remove confirmation ───────────────────────── -->
                ${isPending ? `
                  <div class="condition-remove-confirm" role="alert">
                    <p>Remove <strong>${displayName}</strong>? This will stop it affecting your sessions.</p>
                    <div class="condition-confirm-actions">
                      <button class="btn btn-danger btn-sm condition-remove-confirm-btn"
                              data-condition-id="${id}">Yes, remove</button>
                      <button class="btn btn-secondary btn-sm condition-remove-cancel-btn"
                              data-condition-id="${id}">Cancel</button>
                    </div>
                  </div>
                ` : ""}

                <!-- ── Story panel ───────────────────────────────── -->
                <div
                  id="story-${id}"
                  class="condition-story-panel ${isExpanded ? "" : "hidden"}"
                  aria-hidden="${!isExpanded}"
                >
                  <div class="condition-story-fields">

                    ${isOther ? `
                      <label class="condition-story-label" for="story-customname-${id}">
                        What is this condition?
                      </label>
                      <input
                        type="text"
                        id="story-customname-${id}"
                        class="condition-story-input"
                        placeholder="e.g. Fibromyalgia, hip replacement recovery"
                        value="${customNames[id] || ""}"
                        data-condition-id="${id}"
                        data-field="customName"
                        aria-label="Name your condition"
                      >
                    ` : ""}

                    <label class="condition-story-label" for="story-howlong-${id}">
                      How long have you had this?
                    </label>
                    <input
                      type="text"
                      id="story-howlong-${id}"
                      class="condition-story-input"
                      placeholder="e.g. About 6 months"
                      value="${story.howLong || ""}"
                      data-condition-id="${id}"
                      data-field="howLong"
                      aria-label="How long you have had ${displayName}"
                    >

                    <label class="condition-story-label" for="story-helps-${id}">
                      What tends to help?
                    </label>
                    <input
                      type="text"
                      id="story-helps-${id}"
                      class="condition-story-input"
                      placeholder="e.g. Heat, gentle movement, rest"
                      value="${story.whatHelps || ""}"
                      data-condition-id="${id}"
                      data-field="whatHelps"
                      aria-label="What helps with ${displayName}"
                    >

                    <label class="condition-story-label" for="story-professional-${id}">
                      Professional involved (optional)
                    </label>
                    <input
                      type="text"
                      id="story-professional-${id}"
                      class="condition-story-input"
                      placeholder="e.g. Physio, GP, consultant"
                      value="${story.professional || ""}"
                      data-condition-id="${id}"
                      data-field="professional"
                      aria-label="Professional involved with ${displayName}"
                    >
                  </div>
                </div>

              </div>
            `;
          }).join("")}
        </div>
      `}

      <!-- ── Add condition ────────────────────────────────────────────── -->
      <div class="condition-add-zone">
        <button
          class="btn btn-secondary btn-full condition-add-toggle-btn"
          aria-expanded="${addPickerOpen}"
          aria-controls="condition-add-picker"
        >
          ${addPickerOpen ? "Cancel" : "+ Add a condition"}
        </button>

        <div
          id="condition-add-picker"
          class="condition-add-picker ${addPickerOpen ? "" : "hidden"}"
          aria-hidden="${!addPickerOpen}"
        >
          <p class="text-secondary text-sm" style="margin-bottom: var(--space-3);">
            Tap a condition to add it to your profile.
          </p>

          ${Object.entries(AREA_LABELS).map(([area, label]) => {
            const available = CONDITIONS.filter(c =>
              c.area === area && !conditions.includes(c.id)
            );
            if (available.length === 0) return "";
            return `
              <div class="condition-picker-group">
                <h3 class="condition-picker-area-label">${label}</h3>
                <div class="condition-picker-chips" role="group" aria-label="Add ${label} condition">
                  ${available.map(c => `
                    <button
                      class="condition-picker-chip"
                      data-add-condition-id="${c.id}"
                      aria-label="Add ${c.name}"
                    >
                      <span aria-hidden="true">${c.icon}</span> ${c.name}
                    </button>
                  `).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

    </section>
  `;
}

  return `
    <section aria-labelledby="conditions-heading">
      <h2 id="conditions-heading" class="section-heading">Your conditions</h2>

      <p class="text-secondary settings-conditions-intro">
        These are used to adapt your sessions. Pausing a condition keeps it
        saved but stops it affecting your workouts temporarily.
      </p>

      <!-- ── Active conditions list ──────────────────────────────────── -->
      ${conditions.length === 0 ? `
        <div class="card">
          <p class="text-secondary">No conditions recorded yet.</p>
        </div>
      ` : `
        <div class="conditions-list" aria-label="Your conditions">
          ${conditions.map(id => {
            const cond        = CONDITIONS.find(c => c.id === id);
            const name        = cond ? cond.name : id;
            const icon        = cond ? cond.icon : "❓";
            const status      = statuses[id] || "active";
            const isPaused    = status === "paused";
            const story       = stories[id] || {};
            const isExpanded  = expandedStoryId === id;
            const isPending   = pendingRemoveId === id;

            return `
              <div class="condition-card ${isPaused ? "condition-card--paused" : ""}"
                   data-condition-id="${id}">

                <!-- ── Header row ────────────────────────────────── -->
                <div class="condition-card-header">
                  <span class="condition-card-icon" aria-hidden="true">${icon}</span>
                  <span class="condition-card-name">${name}${isPaused ? ' <span class="condition-paused-badge">Paused</span>' : ""}</span>
                  <div class="condition-card-actions">
                    <button
                      class="btn-text condition-pause-btn"
                      data-condition-id="${id}"
                      aria-label="${isPaused ? "Resume" : "Pause"} ${name}"
                    >${isPaused ? "Resume" : "Pause"}</button>
                    <button
                      class="btn-text condition-story-btn"
                      data-condition-id="${id}"
                      aria-expanded="${isExpanded}"
                      aria-controls="story-${id}"
                    >${isExpanded ? "Less" : "About this"}</button>
                    <button
                      class="btn-text btn-text--danger condition-remove-btn"
                      data-condition-id="${id}"
                      aria-label="Remove ${name}"
                    >Remove</button>
                  </div>
                </div>

                <!-- ── Remove confirmation ───────────────────────── -->
                ${isPending ? `
                  <div class="condition-remove-confirm" role="alert">
                    <p>Remove <strong>${name}</strong>? This will stop it affecting your sessions.</p>
                    <div class="condition-confirm-actions">
                      <button class="btn btn-danger btn-sm condition-remove-confirm-btn"
                              data-condition-id="${id}">Yes, remove</button>
                      <button class="btn btn-secondary btn-sm condition-remove-cancel-btn"
                              data-condition-id="${id}">Cancel</button>
                    </div>
                  </div>
                ` : ""}

                <!-- ── Story panel ───────────────────────────────── -->
                <div
                  id="story-${id}"
                  class="condition-story-panel ${isExpanded ? "" : "hidden"}"
                  aria-hidden="${!isExpanded}"
                >
                  <div class="condition-story-fields">
                    <label class="condition-story-label" for="story-howlong-${id}">
                      How long have you had this?
                    </label>
                    <input
                      type="text"
                      id="story-howlong-${id}"
                      class="condition-story-input"
                      placeholder="e.g. About 6 months"
                      value="${story.howLong || ""}"
                      data-condition-id="${id}"
                      data-field="howLong"
                      aria-label="How long you have had ${name}"
                    >

                    <label class="condition-story-label" for="story-helps-${id}">
                      What tends to help?
                    </label>
                    <input
                      type="text"
                      id="story-helps-${id}"
                      class="condition-story-input"
                      placeholder="e.g. Heat, gentle movement, rest"
                      value="${story.whatHelps || ""}"
                      data-condition-id="${id}"
                      data-field="whatHelps"
                      aria-label="What helps with ${name}"
                    >

                    <label class="condition-story-label" for="story-professional-${id}">
                      Professional involved (optional)
                    </label>
                    <input
                      type="text"
                      id="story-professional-${id}"
                      class="condition-story-input"
                      placeholder="e.g. Physio, GP, consultant"
                      value="${story.professional || ""}"
                      data-condition-id="${id}"
                      data-field="professional"
                      aria-label="Professional involved with ${name}"
                    >
                  </div>
                </div>

              </div>
            `;
          }).join("")}
        </div>
      `}

      <!-- ── Add condition ────────────────────────────────────────────── -->
      <div class="condition-add-zone">
        <button
          class="btn btn-secondary btn-full condition-add-toggle-btn"
          aria-expanded="${addPickerOpen}"
          aria-controls="condition-add-picker"
        >
          ${addPickerOpen ? "Cancel" : "+ Add a condition"}
        </button>

        <div
          id="condition-add-picker"
          class="condition-add-picker ${addPickerOpen ? "" : "hidden"}"
          aria-hidden="${!addPickerOpen}"
        >
          <p class="text-secondary text-sm" style="margin-bottom: var(--space-3);">
            Tap a condition to add it to your profile.
          </p>

          ${Object.entries(AREA_LABELS).map(([area, label]) => {
            const available = CONDITIONS.filter(c =>
              c.area === area && !conditions.includes(c.id)
            );
            if (available.length === 0) return "";
            return `
              <div class="condition-picker-group">
                <h3 class="condition-picker-area-label">${label}</h3>
                <div class="condition-picker-chips" role="group" aria-label="Add ${label} condition">
                  ${available.map(c => `
                    <button
                      class="condition-picker-chip"
                      data-add-condition-id="${c.id}"
                      aria-label="Add ${c.name}"
                    >
                      <span aria-hidden="true">${c.icon}</span> ${c.name}
                    </button>
                  `).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

    </section>
  `;
}

// ── Equipment tab ─────────────────────────────────────────────────────────────

function renderEquipmentTab() {
  const selected = store.get("equipment") || [];

  return `
    <section aria-labelledby="equipment-heading">
      <h2 id="equipment-heading" class="section-heading">Your equipment</h2>
      <p class="text-secondary settings-equipment-intro">
        Tap to add or remove. Changes take effect on your next workout.
      </p>

      ${EQUIPMENT_CATEGORIES.map(cat => {
        const selectedInCat = cat.items.filter(item => selected.includes(item.id)).length;
        return `
          <div class="equipment-settings-category">
            <h3 class="equipment-category-heading">
              <span aria-hidden="true">${cat.icon}</span>
              ${cat.name}
              ${selectedInCat > 0 ? `<span class="equipment-cat-count">${selectedInCat} selected</span>` : ""}
            </h3>
            <div class="equipment-chip-grid" role="group" aria-label="${cat.name} equipment">
              ${cat.items.map(item => `
                <button
                  class="equipment-chip ${selected.includes(item.id) ? "selected" : ""}"
                  data-equipment-id="${item.id}"
                  aria-pressed="${selected.includes(item.id)}"
                >
                  ${item.name}
                </button>
              `).join("")}
            </div>
          </div>
        `;
      }).join("")}

    </section>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function settingsRow(label, value) {
  return `
    <div class="settings-row">
      <span class="settings-label">${label}</span>
      <span class="settings-value">${value}</span>
    </div>
  `;
}

function formatGender(gender) {
  const map = {
    "female":     "Female",
    "male":       "Male",
    "non-binary": "Non-binary",
    "prefer-not": "Prefer not to say"
  };
  return map[gender] || "Not set";
}

// ── Re-render helpers (used by event handlers) ────────────────────────────────

/**
 * Re-render only the conditions tab panel content and re-wire it.
 * Used by all conditions interactions to avoid a full view reload.
 */
function rerenderConditionsPanel() {
  const panel = document.getElementById("settings-tab-panel");
  if (!panel) return;
  panel.innerHTML = renderConditionsTab();
  wirePanel();
  // Restore focus to the panel for keyboard users
  panel.setAttribute("tabindex", "-1");
  panel.focus();
}

/**
 * Switch to a different tab and re-render the panel in place.
 * Updates ARIA attributes on the tab buttons as well.
 * Resets conditions tab local state on tab switch to avoid stale UI.
 */
function switchTab(tabName) {
  // Reset conditions tab state when leaving / entering
  if (tabName !== "conditions") {
    expandedStoryId = null;
    pendingRemoveId = null;
    addPickerOpen   = false;
  }

  activeTab = tabName;

  // Update tab button ARIA and active class
  document.querySelectorAll(".settings-tab").forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive);
  });

  // Re-render panel content only
  const panel = document.getElementById("settings-tab-panel");
  if (panel) {
    panel.setAttribute("aria-labelledby", `tab-${tabName}`);
    panel.innerHTML = renderActiveTab();
    // Re-wire interactive elements inside the panel
    wirePanel();
  }
}

/**
 * Wire all interactive elements inside the tab panel.
 * Called after initial mount and after every tab switch.
 */
function wirePanel() {
  // Coach style cards
  document.querySelectorAll(".coach-style-card").forEach(card => {
    card.addEventListener("click", () => {
      const style = card.dataset.style;
      if (!style) return;
      store.set("coachStyle", style);
      document.querySelectorAll(".coach-style-card").forEach(c => {
        const isSelected = c.dataset.style === style;
        c.classList.toggle("selected", isSelected);
        c.setAttribute("aria-checked", isSelected);
      });
    });
  });

  // Equipment chips
  document.querySelectorAll(".equipment-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const id = chip.dataset.equipmentId;
      if (!id) return;
      const current    = store.get("equipment") || [];
      const isSelected = current.includes(id);
      const updated    = isSelected
        ? current.filter(e => e !== id)
        : [...current, id];
      store.set("equipment", updated);
      chip.classList.toggle("selected", !isSelected);
      chip.setAttribute("aria-pressed", !isSelected);
      updateCategoryCount(chip);
    });
  });

  // ── Conditions tab wiring ──────────────────────────────────────────────────

  // Pause / resume
  document.querySelectorAll(".condition-pause-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id      = btn.dataset.conditionId;
      if (!id) return;
      const current = store.get("conditionStatus") || {};
      const isPaused = (current[id] || "active") === "paused";
      const updated  = { ...current, [id]: isPaused ? "active" : "paused" };
      store.set("conditionStatus", updated);
      rerenderConditionsPanel();
    });
  });

  // Story expand / collapse
  document.querySelectorAll(".condition-story-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.conditionId;
      if (!id) return;
      expandedStoryId = expandedStoryId === id ? null : id;
      rerenderConditionsPanel();
    });
  });

  // Story field autosave on blur
  document.querySelectorAll(".condition-story-input").forEach(input => {
    input.addEventListener("blur", () => {
      const id    = input.dataset.conditionId;
      const field = input.dataset.field;
      if (!id || !field) return;

      if (field === "customName") {
        // Write to customConditionNames, not conditionStories
        const current = store.get("customConditionNames") || {};
        store.set("customConditionNames", { ...current, [id]: input.value.trim() });
        // Update the displayed name in the card header without full re-render
        const nameEl = input.closest(".condition-card")?.querySelector(".condition-card-name");
        if (nameEl) {
          const badge = nameEl.querySelector(".condition-paused-badge");
          nameEl.textContent = input.value.trim() || "Something else";
          if (badge) nameEl.appendChild(badge);
        }
      } else {
        const current = store.get("conditionStories") || {};
        const entry   = { ...(current[id] || {}), [field]: input.value.trim() };
        store.set("conditionStories", { ...current, [id]: entry });
      }
    });
  });

  // Remove — show confirmation
  document.querySelectorAll(".condition-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.conditionId;
      if (!id) return;
      pendingRemoveId = pendingRemoveId === id ? null : id;
      rerenderConditionsPanel();
    });
  });

  // Remove — confirm
  document.querySelectorAll(".condition-remove-confirm-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.conditionId;
      if (!id) return;
      // Remove from conditions array
      const conditions = store.get("conditions") || [];
      store.set("conditions", conditions.filter(c => c !== id));
      // Clean up status, story, and custom name entries
      const statuses = { ...(store.get("conditionStatus") || {}) };
      delete statuses[id];
      store.set("conditionStatus", statuses);
      const stories = { ...(store.get("conditionStories") || {}) };
      delete stories[id];
      store.set("conditionStories", stories);
      const customNames = { ...(store.get("customConditionNames") || {}) };
      delete customNames[id];
      store.set("customConditionNames", customNames);
      // Also remove any pain score for this condition
      const painScores = { ...(store.get("conditionPainScores") || {}) };
      delete painScores[id];
      store.set("conditionPainScores", painScores);
      pendingRemoveId = null;
      rerenderConditionsPanel();
    });
  });

  // Remove — cancel
  document.querySelectorAll(".condition-remove-cancel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      pendingRemoveId = null;
      rerenderConditionsPanel();
    });
  });

  // Add picker toggle
  document.querySelector(".condition-add-toggle-btn")?.addEventListener("click", () => {
    addPickerOpen = !addPickerOpen;
    rerenderConditionsPanel();
  });

  // Add condition chip
  document.querySelectorAll(".condition-picker-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const id = chip.dataset.addConditionId;
      if (!id) return;
      const conditions = store.get("conditions") || [];
      if (conditions.includes(id)) return;
      store.set("conditions", [...conditions, id]);
      addPickerOpen = false;
      rerenderConditionsPanel();
    });
  });
}

/**
 * Update the "N selected" count badge for the category containing a chip.
 * Called after each chip toggle to keep counts accurate without a full re-render.
 */
function updateCategoryCount(chip) {
  const categoryEl = chip.closest(".equipment-settings-category");
  if (!categoryEl) return;

  const chipsInCat  = categoryEl.querySelectorAll(".equipment-chip");
  const selectedCount = Array.from(chipsInCat).filter(c => c.classList.contains("selected")).length;
  const heading = categoryEl.querySelector(".equipment-category-heading");
  if (!heading) return;

  // Remove existing count badge if present
  const existing = heading.querySelector(".equipment-cat-count");
  if (existing) existing.remove();

  // Re-insert if any are selected
  if (selectedCount > 0) {
    const badge = document.createElement("span");
    badge.className = "equipment-cat-count";
    badge.textContent = `${selectedCount} selected`;
    heading.appendChild(badge);
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // Tab switching
  document.querySelectorAll(".settings-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const name = tab.dataset.tab;
      if (name && name !== activeTab) switchTab(name);
    });
  });

  // Wire panel elements on initial load
  wirePanel();

  // Reset app
  document.getElementById("reset-app-btn")?.addEventListener("click", () => {
    if (confirm("This will delete all your data and start fresh. Are you sure?")) {
      store.reset();
      activeTab = "profile"; // Reset tab state for next time
      document.getElementById("bottom-nav")?.classList.add("hidden");
      router.navigate("onboarding/welcome");
    }
  });
}
