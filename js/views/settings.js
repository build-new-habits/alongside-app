/**
 * settings.js - Settings view
 *
 * v1.0 — Tabbed layout: Profile / Conditions / Equipment.
 *   Three tabs replace the previous single-scroll card list.
 *   Tab state is held in a module-level variable (activeTab) and
 *   re-rendered on tab switch without a full router.navigate() call --
 *   this avoids the scroll-to-top and re-announce overhead for what
 *   is essentially a within-view state change.
 *
 *   Profile tab:
 *     Read-only display of name, age, gender, weight.
 *     coachStyle selector -- four options rendered as selectable cards.
 *     Selecting a style writes to store immediately (no save button needed).
 *
 *   Conditions tab:
 *     Read-only list of active conditions.
 *     "No conditions" graceful fallback.
 *     Story capture (how long, what helps, professional) deferred to Phase 3B.
 *
 *   Equipment tab:
 *     Full equipment chip selector by category.
 *     Chips toggle on/off and write to store on each tap.
 *     Mirrors the onboarding equipment step but live-editable.
 *
 *   Reset app button retained at bottom of all tabs.
 */

import { store } from "../store.js";
import { getConditionName } from "../data/conditions.js";
import { EQUIPMENT_CATEGORIES } from "../data/equipment.js";

export const centered = false;

// ── Tab state ─────────────────────────────────────────────────────────────────
// Held at module level so switching tabs re-renders without losing scroll pos.
let activeTab = "profile";

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
        <button class="btn btn-primary btn-full" id="gym-programme-btn"
                onclick="router.navigate('gym-programme')"
                aria-label="Open my gym programme">
          My Gym Programme
        </button>
        <button class="btn btn-text-link btn-full" id="privacy-btn"
                onclick="router.navigate('privacy')"
                aria-label="Read Privacy Policy and Terms of Service"
                style="margin-top: var(--space-2);">
          Privacy Policy &amp; Terms of Service
        </button>
        <button class="btn btn-danger btn-full" id="reset-app-btn"
                style="margin-top: var(--space-3);">
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
  const conditions = store.get("conditions") || [];

  return `
    <section aria-labelledby="conditions-heading">
      <h2 id="conditions-heading" class="section-heading">Your conditions</h2>

      ${conditions.length === 0 ? `
        <div class="card">
          <p class="text-secondary">No conditions recorded.</p>
          <p class="text-secondary" style="margin-top: var(--space-2);">
            If your circumstances change, you can add conditions here in a future update.
          </p>
        </div>
      ` : `
        <div class="card conditions-list">
          ${conditions.map(id => `
            <div class="condition-settings-row">
              <span class="condition-settings-name">${getConditionName(id)}</span>
            </div>
          `).join("")}
        </div>
        <p class="text-secondary text-sm settings-conditions-note">
          Pain levels are updated each day at check-in. Your conditions list can be
          edited in a future update.
        </p>
      `}
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
 * Switch to a different tab and re-render the panel in place.
 * Updates ARIA attributes on the tab buttons as well.
 */
function switchTab(tabName) {
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

      // Write to store
      store.set("coachStyle", style);

      // Update UI: toggle selected class and aria-checked on all cards
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

      const current  = store.get("equipment") || [];
      const isSelected = current.includes(id);
      const updated  = isSelected
        ? current.filter(e => e !== id)
        : [...current, id];

      store.set("equipment", updated);

      // Toggle this chip
      chip.classList.toggle("selected", !isSelected);
      chip.setAttribute("aria-pressed", !isSelected);

      // Update the category count badge
      updateCategoryCount(chip);
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
