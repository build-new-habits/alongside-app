/**
 * settings.js - Settings view
 *
 * 13 May 2026 v1
 *
 * v2.1 — Editable profile, facility presets, add/remove conditions, Morning Routine:
 *   Profile tab: inline edit for name, age, gender, weight.
 *   Equipment tab: Facility Presets at top — tap to auto-fill matching equipment.
 *   Conditions tab: add from full list + remove existing.
 *   Library: Morning Routine card added under Guided Sessions.
 *   Voice speed: 10-level slider (0.5–1.5 range).
 *   Library tab deep-link: reads store.get("settingsTab") on render.
 *
 * v2.0 — Library tab + My Movement + 10-level voice speed slider
 * v1.4 — App version display and update check button (S3-6)
 * v1.3 — Check-in notification (S3-6)
 * v1.0 — Tabbed layout: Profile / Conditions / Equipment
 */

import { store }                        from "../store.js";
import { getConditionName, CONDITIONS } from "../data/conditions.js";
import { EQUIPMENT_CATEGORIES }         from "../data/equipment.js";

export const centered = false;

// ── Tab state ─────────────────────────────────────────────────────────────────
let activeTab    = "profile";
let editingField = null;

// ── Coach styles ──────────────────────────────────────────────────────────────
const COACH_STYLES = [
  { id: "steady",    label: "Steady",    description: "Calm, consistent, and supportive. Never rushed.",    icon: "🌿" },
  { id: "energetic", label: "Energetic", description: "Upbeat, motivating, and enthusiastic.",              icon: "⚡" },
  { id: "minimal",   label: "Minimal",   description: "Short, direct, and to the point. No fluff.",         icon: "🎯" },
  { id: "nurturing", label: "Nurturing", description: "Warm, gentle, and emotionally attentive.",           icon: "💛" }
];

// ── Movement identities ───────────────────────────────────────────────────────
const MOVEMENT_IDENTITIES = [
  { id: "gym",      label: "Gym / weights",  icon: "🏋" },
  { id: "yoga",     label: "Yoga / pilates", icon: "🧘" },
  { id: "running",  label: "Running",        icon: "🏃" },
  { id: "walking",  label: "Walking",        icon: "🚶" },
  { id: "swimming", label: "Swimming",       icon: "🏊" },
  { id: "classes",  label: "Classes",        icon: "🏥" },
  { id: "mixed",    label: "A mix of things",icon: "✨" },
];

// ── Log activity groups ───────────────────────────────────────────────────────
const LOG_ACTIVITIES = [
  {
    group: "Cardio",
    items: [
      { id: "run",    label: "Run",    icon: "🏃" },
      { id: "walk",   label: "Walk",   icon: "🚶" },
      { id: "cycle",  label: "Cycle",  icon: "🚴" },
      { id: "swim",   label: "Swim",   icon: "🏊" },
      { id: "row",    label: "Row",    icon: "🚣" },
      { id: "hiking", label: "Hike",   icon: "🥾" },
    ]
  },
  {
    group: "Classes and sessions",
    items: [
      { id: "boxing",       label: "Boxing",       icon: "🥊" },
      { id: "spin",         label: "Spin",         icon: "🚴" },
      { id: "hiit",         label: "HIIT",         icon: "⚡" },
      { id: "body-balance", label: "Body Balance", icon: "🧘" },
      { id: "class",        label: "Other class",  icon: "🏥" },
    ]
  },
  {
    group: "Mindful and gentle",
    items: [
      { id: "yoga",    label: "Yoga",          icon: "🧘" },
      { id: "pilates", label: "Pilates",       icon: "🧘" },
      { id: "tai-chi", label: "Tai chi",       icon: "🌿" },
      { id: "mindful", label: "Mindful walk",  icon: "🌿" },
      { id: "custom",  label: "Something else",icon: "❔" },
    ]
  }
];

// ── Facility presets ──────────────────────────────────────────────────────────

// ── Equipment tab state ───────────────────────────────────────────────────────
let equipmentScreen = "facilities";  // "facilities" | facility-id (e.g. "home", "gym-full")

// Facility definitions — each has a scope and an equipment subset
const FACILITY_DEFS = [
  {
    id:          "gym-full",
    label:       "Full gym",
    icon:        "\uD83C\uDFCB",
    scope:       "gym",
    description: "Fully-equipped gym — weights, machines, cardio",
    equipment:   [
      "dumbbells-light", "dumbbells-medium", "dumbbells-heavy", "adjustable-dumbbells",
      "kettlebell-light", "kettlebell-medium", "kettlebell-heavy",
      "barbell", "ez-curl-bar",
      "band-light", "band-medium", "band-heavy",
      "treadmill", "exercise-bike", "rowing-machine", "elliptical",
      "bench-flat", "bench-adjustable",
      "pull-up-bar", "dip-station",
      "stability-ball", "ab-wheel",
      "foam-roller", "massage-gun",
      "gym-membership"
    ]
  },
  {
    id:          "swimming-pool",
    label:       "Swimming pool",
    icon:        "\uD83C\uDFCA",
    scope:       "gym",
    description: "Pool access — lane swimming, aqua fitness",
    equipment:   ["swimming-pool"]
  },
  {
    id:          "fitness-studio",
    label:       "Fitness studio",
    icon:        "\uD83C\uDFE5",
    scope:       "gym",
    description: "Studio classes — yoga, pilates, spin, circuits",
    equipment:   ["fitness-studio", "yoga-mat", "band-light", "band-medium", "step-platform"]
  },
  {
    id:          "home",
    label:       "Home setup",
    icon:        "\uD83C\uDFE0",
    scope:       "home",
    description: "What you have at home",
    equipment:   []  // home is fully customisable — no preset fill
  },
  {
    id:          "no-equipment",
    label:       "Bodyweight only",
    icon:        "\uD83D\uDEB6",
    scope:       "home",
    description: "No equipment — floor space is enough",
    equipment:   []
  },
];

// Get the equipment list currently stored for a given facility scope
function getEquipmentForScope(scope) {
  if (scope === "home") return store.get("homeEquipment") || [];
  return store.get("gymEquipment") || [];
}

// Save equipment list for a given scope — keeps union in equipment[]
function saveEquipmentForScope(scope, items) {
  if (scope === "home") {
    store.set("homeEquipment", items);
  } else {
    store.set("gymEquipment", items);
  }
  const gym  = store.get("gymEquipment")  || [];
  const home = store.get("homeEquipment") || [];
  store.set("equipment", Array.from(new Set([...gym, ...home])));
}

// Check if a facility is currently "active" (has any equipment from its preset)
function isFacilityActive(facility) {
  if (facility.equipment.length === 0) {
    // bodyweight or home — active if scope has any items
    const items = getEquipmentForScope(facility.scope);
    return items.length >= 0 && store.get(facility.scope === "home" ? "homeEquipment" : "gymEquipment") !== null;
  }
  const current = getEquipmentForScope(facility.scope);
  return facility.equipment.some(eq => current.includes(eq));
}

// Toggle a facility — if active remove its equipment, if inactive add it
function toggleFacility(facilityId) {
  const facility = FACILITY_DEFS.find(f => f.id === facilityId);
  if (!facility) return;
  const current = getEquipmentForScope(facility.scope);
  const isActive = facility.equipment.length > 0
    ? facility.equipment.some(eq => current.includes(eq))
    : false;

  if (isActive && facility.equipment.length > 0) {
    // Deselect — remove this facility's equipment
    // Only remove items that were in this preset, not all gym equipment
    const updated = current.filter(eq => !facility.equipment.includes(eq));
    saveEquipmentForScope(facility.scope, updated);
  } else if (!isActive && facility.equipment.length > 0) {
    // Select — add preset equipment
    const updated = Array.from(new Set([...current, ...facility.equipment]));
    saveEquipmentForScope(facility.scope, updated);
  }
}

// ── Facility presets — correct IDs from equipment.js ─────────────────────────
// IDs verified against EQUIPMENT_CATEGORIES in js/data/equipment.js
// Full gym fills both equipment[] (gym) and gymEquipment[] store keys.
// Home setup fills homeEquipment[] store key separately.

const FACILITY_PRESETS = [
  {
    id:    "gym-full",
    label: "Full gym",
    icon:  "\uD83C\uDFCB",
    scope: "gym",   // writes to gymEquipment
    fills: [
      "dumbbells-light", "dumbbells-medium", "dumbbells-heavy", "adjustable-dumbbells",
      "kettlebell-light", "kettlebell-medium", "kettlebell-heavy",
      "barbell", "ez-curl-bar",
      "band-light", "band-medium", "band-heavy",
      "treadmill", "exercise-bike", "rowing-machine", "elliptical",
      "bench-flat", "bench-adjustable",
      "pull-up-bar", "dip-station",
      "stability-ball", "ab-wheel",
      "foam-roller", "massage-gun",
      "gym-membership"
    ]
  },
  {
    id:    "home-setup",
    label: "Home setup",
    icon:  "\uD83C\uDFE0",
    scope: "home",  // writes to homeEquipment
    fills: [
      "dumbbells-light", "dumbbells-medium",
      "band-light", "band-medium",
      "yoga-mat", "pull-up-bar",
      "bench-adjustable", "foam-roller"
    ]
  },
  {
    id:    "swimming-pool",
    label: "Swimming pool",
    icon:  "\uD83C\uDFCA",
    scope: "gym",
    fills: ["swimming-pool"]
  },
  {
    id:    "fitness-studio",
    label: "Fitness studio",
    icon:  "\uD83C\uDFE5",
    scope: "gym",
    fills: ["fitness-studio", "yoga-mat", "band-light", "band-medium", "step-platform"]
  },
  {
    id:    "no-equipment",
    label: "No equipment",
    icon:  "\uD83D\uDEB6",
    scope: "home",
    fills: []
  }
];

// ── Voice speed — 10 levels ───────────────────────────────────────────────────
const SPEED_MIN   = 0.5;
const SPEED_MAX   = 1.5;
const SPEED_STEPS = 10;

function rateToPosition(rate) {
  const pos = Math.round(((rate - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * (SPEED_STEPS - 1)) + 1;
  return Math.max(1, Math.min(SPEED_STEPS, pos));
}

function positionToRate(pos) {
  const rate = SPEED_MIN + ((pos - 1) / (SPEED_STEPS - 1)) * (SPEED_MAX - SPEED_MIN);
  return Math.round(rate * 100) / 100;
}

function speedLabel(rate) {
  if (rate <= 0.6)  return "Very slow";
  if (rate <= 0.75) return "Slow";
  if (rate <= 0.9)  return "Steady";
  if (rate <= 1.05) return "Normal";
  if (rate <= 1.2)  return "Brisk";
  if (rate <= 1.35) return "Fast";
  return "Very fast";
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const requestedTab = store.get("settingsTab");
  if (requestedTab) {
    activeTab    = requestedTab;
    editingField = null;
    store.set("settingsTab", null);
  }

  return `
    <div class="view settings-view">

      <div class="view-header">
        <h1>Settings</h1>
      </div>

      <div class="settings-tabs" role="tablist" aria-label="Settings sections">
        <button class="settings-tab ${activeTab === "profile"    ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "profile"}"
                aria-controls="settings-tab-panel" id="tab-profile" data-tab="profile"
        >Profile</button>
        <button class="settings-tab ${activeTab === "conditions" ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "conditions"}"
                aria-controls="settings-tab-panel" id="tab-conditions" data-tab="conditions"
        >Conditions</button>
        <button class="settings-tab ${activeTab === "equipment"  ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "equipment"}"
                aria-controls="settings-tab-panel" id="tab-equipment" data-tab="equipment"
        >Equipment</button>
        <button class="settings-tab ${activeTab === "library"    ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "library"}"
                aria-controls="settings-tab-panel" id="tab-library" data-tab="library"
        >Library</button>
      </div>

      <div id="settings-tab-panel" role="tabpanel"
           aria-labelledby="tab-${activeTab}" class="settings-tab-panel">
        ${renderActiveTab()}
      </div>

      <div class="settings-reset-zone">
        <div class="settings-update-zone">
          <div class="settings-version-row">
            <span class="text-sm text-muted">Version</span>
            <span class="text-sm text-muted" id="settings-version-label">
              ${(typeof window !== "undefined" && window.App?.version) ? window.App.version : ""}
            </span>
          </div>
          <button class="btn btn-ghost btn-full" id="check-update-btn"
                  style="margin-top: var(--space-2);" aria-label="Check for app updates">
            Check for updates
          </button>
          <p id="update-check-status" class="update-check-status text-sm"
             aria-live="polite" style="margin-top: var(--space-2); min-height: 1.4em;"></p>
        </div>

        <button class="btn btn-text-link btn-full" id="privacy-btn"
                onclick="router.navigate('privacy')"
                aria-label="Read Privacy Policy and Terms of Service"
                style="margin-top: var(--space-4);">
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
  if (activeTab === "library")    return renderLibraryTab();
  return "";
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function renderProfileTab() {
  const name       = store.get("name")       || "";
  const age        = store.get("age")        || "";
  const gender     = store.get("gender")     || "";
  const weight     = store.get("weight")     || "";
  const weightUnit = store.get("weightUnit") || "kg";
  const coachStyle = store.get("coachStyle") || "steady";

  function editableRow(fieldId, label, displayValue, inputType, extraAttrs) {
    if (editingField === fieldId) {
      const isGender = fieldId === "gender";
      return `
        <div class="settings-row settings-row--editing">
          <span class="settings-label">${label}</span>
          <div class="profile-edit-wrap">
            ${isGender ? `
              <select id="profile-edit-input" class="profile-edit-input profile-edit-select"
                      aria-label="Edit ${label}">
                <option value="male"       ${gender === "male"       ? "selected" : ""}>Male</option>
                <option value="female"     ${gender === "female"     ? "selected" : ""}>Female</option>
                <option value="non-binary" ${gender === "non-binary" ? "selected" : ""}>Non-binary</option>
                <option value="prefer-not" ${gender === "prefer-not" ? "selected" : ""}>Prefer not to say</option>
              </select>
            ` : `
              <input id="profile-edit-input" class="profile-edit-input"
                     type="${inputType || "text"}"
                     value="${displayValue === "Not set" ? "" : (displayValue || "")}"
                     aria-label="Edit ${label}"
                     ${extraAttrs || ""}>
            `}
            <div class="profile-edit-actions">
              <button class="btn btn-primary btn-sm" id="profile-save-btn"
                      data-field="${fieldId}" aria-label="Save ${label}">Save</button>
              <button class="btn btn-ghost btn-sm" id="profile-cancel-btn"
                      aria-label="Cancel">Cancel</button>
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div class="settings-row">
        <span class="settings-label">${label}</span>
        <div class="settings-value-wrap">
          <span class="settings-value">${displayValue || "Not set"}</span>
          <button class="btn-text profile-edit-btn" data-field="${fieldId}"
                  aria-label="Edit ${label}">Edit</button>
        </div>
      </div>
    `;
  }

  return `
    <section aria-labelledby="profile-heading">

      <h2 id="profile-heading" class="section-heading">Your profile</h2>
      <div class="card settings-profile-card" id="profile-card">
        ${editableRow("name",   "Name",   name   || "Not set", "text")}
        ${editableRow("age",    "Age",    age    ? String(age) : "Not set", "number", 'min="1" max="120"')}
        ${editableRow("gender", "Gender", formatGender(gender), "text")}
        ${editableRow("weight", "Weight", weight ? `${weight}${weightUnit}` : "Not set", "number", 'min="1" max="500" step="0.1"')}
      </div>

      <h2 class="section-heading" style="margin-top: var(--space-6);">Coach style</h2>
      <p class="text-secondary settings-coach-intro">
        Choose how your coach communicates with you. You can change this any time.
      </p>
      <div class="coach-style-grid" role="radiogroup" aria-label="Coach communication style">
        ${COACH_STYLES.map(style => `
          <button class="coach-style-card ${coachStyle === style.id ? "selected" : ""}"
                  role="radio" aria-checked="${coachStyle === style.id}"
                  data-style="${style.id}"
                  aria-label="${style.label}: ${style.description}">
            <span class="coach-style-icon" aria-hidden="true">${style.icon}</span>
            <span class="coach-style-label">${style.label}</span>
            <span class="coach-style-desc">${style.description}</span>
          </button>
        `).join("")}
      </div>

      <h2 class="section-heading" style="margin-top: var(--space-6);">Coach voice speed</h2>
      ${renderSpeechRateSection()}

      <h2 class="section-heading" style="margin-top: var(--space-6);">Check-in reminder</h2>
      ${renderNotificationSection()}

    </section>
  `;
}

// ── Conditions tab ────────────────────────────────────────────────────────────

function renderConditionsTab() {
  const conditions = store.get("conditions") || [];
  const available  = CONDITIONS.filter(c => !conditions.includes(c.id));

  return `
    <section aria-labelledby="conditions-heading">
      <h2 id="conditions-heading" class="section-heading">Your conditions</h2>
      <p class="text-secondary text-sm settings-conditions-intro">
        The coach uses these to filter exercises and adjust its approach.
        Pain levels are updated each day at check-in.
      </p>

      ${conditions.length === 0 ? `
        <div class="card">
          <p class="text-secondary">No conditions recorded.</p>
        </div>
      ` : `
        <div class="card conditions-list" id="conditions-list">
          ${conditions.map(id => {
            const cond = CONDITIONS.find(c => c.id === id);
            return `
              <div class="condition-settings-row" data-condition-id="${id}">
                <span class="condition-settings-icon" aria-hidden="true">${cond?.icon || ""}</span>
                <span class="condition-settings-name">${getConditionName(id)}</span>
                <button class="btn-text btn-text--danger condition-remove-btn"
                        data-condition-id="${id}"
                        aria-label="Remove ${getConditionName(id)}">
                  Remove
                </button>
              </div>
            `;
          }).join("")}
        </div>
      `}

      ${available.length > 0 ? `
        <h3 class="section-heading"
            style="margin-top: var(--space-5); font-size: var(--text-sm);">
          Add a condition
        </h3>
        <div class="condition-add-grid" role="group" aria-label="Add a condition">
          ${available.map(cond => `
            <button class="condition-add-btn" data-condition-id="${cond.id}"
                    aria-label="Add ${cond.name}">
              <span aria-hidden="true">${cond.icon}</span>
              ${cond.name}
            </button>
          `).join("")}
        </div>
      ` : ""}
    </section>
  `;
}

// ── Equipment tab ─────────────────────────────────────────────────────────────

function renderEquipmentTab() {
  // Two-screen equipment flow:
  //   Screen 1 (facilities): Shows all facilities as tappable cards.
  //   Screen 2 (sub-screen): Shows equipment picker for a specific facility.
  if (equipmentScreen !== "facilities") {
    return renderFacilitySubScreen(equipmentScreen);
  }

  const gymFacilities  = FACILITY_DEFS.filter(f => f.scope === "gym");
  const homeFacilities = FACILITY_DEFS.filter(f => f.scope === "home");

  return `
    <section class="settings-tab-panel" id="panel-equipment" role="tabpanel">

      <div class="card settings-coach-card">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="text-sm text-secondary">
          Tell me where you train and what you have available. I will use this to
          make sure I never suggest equipment you do not have access to.
        </p>
      </div>

      <!-- Gym and facilities -->
      <h3 class="section-heading" style="margin-bottom: var(--space-3);">
        At the gym or facility
      </h3>
      <div class="equipment-facility-grid">
        ${gymFacilities.map(f => {
          const active = isFacilityActive(f);
          return `
            <button class="equipment-facility-card ${active ? "equipment-facility-card--active" : ""}"
                    data-facility="${f.id}"
                    aria-label="${f.label}: ${f.description}. ${active ? "Active — tap to manage or deselect" : "Tap to add"}">
              <span class="equipment-facility-icon" aria-hidden="true">${f.icon}</span>
              <span class="equipment-facility-label">${f.label}</span>
              ${active ? `<span class="equipment-facility-check" aria-hidden="true">\u2713</span>` : ""}
            </button>
          `;
        }).join("")}
      </div>

      <!-- Home -->
      <h3 class="section-heading" style="margin: var(--space-5) 0 var(--space-3);">
        At home
      </h3>
      <div class="equipment-facility-grid">
        ${homeFacilities.map(f => {
          const homeItems = store.get("homeEquipment") || [];
          const active = homeItems.length > 0 || f.id === "no-equipment";
          return `
            <button class="equipment-facility-card ${f.id !== "no-equipment" && homeItems.length > 0 ? "equipment-facility-card--active" : ""}"
                    data-facility="${f.id}"
                    aria-label="${f.label}: ${f.description}">
              <span class="equipment-facility-icon" aria-hidden="true">${f.icon}</span>
              <span class="equipment-facility-label">${f.label}</span>
              ${f.id !== "no-equipment" && homeItems.length > 0 ? `<span class="equipment-facility-check" aria-hidden="true">\u2713</span>` : ""}
            </button>
          `;
        }).join("")}
      </div>

      <p class="text-xs text-muted" style="margin-top: var(--space-4);">
        Tap any location to see and edit the equipment available there.
      </p>

      <div class="settings-reset-zone">
        <button class="btn btn-ghost btn-full" id="settings-reset-btn"
                style="color: var(--color-danger);">
          Reset App (Start Over)
        </button>
      </div>
    </section>
  `;
}

function renderFacilitySubScreen(facilityId) {
  const facility = FACILITY_DEFS.find(f => f.id === facilityId);
  if (!facility) return renderEquipmentTab();

  const currentItems = getEquipmentForScope(facility.scope);
  const isPreset     = facility.equipment.length > 0;
  const presetActive = isPreset && facility.equipment.some(eq => currentItems.includes(eq));

  // For home facility — show the full EQUIPMENT_CATEGORIES picker
  // For gym facilities with presets — show what's in the preset, toggle individual items
  // Get the relevant categories from the equipment data
  const relevantIds = new Set(facility.scope === "home" ? currentItems : [...facility.equipment, ...currentItems]);

  return `
    <section class="settings-tab-panel" id="panel-equipment-sub" role="tabpanel">

      <div class="equipment-sub-header">
        <button class="btn btn-ghost equipment-sub-back" id="equip-back-btn"
                aria-label="Back to locations">
          \u2190 Back
        </button>
        <h2 class="equipment-sub-title">${facility.icon} ${facility.label}</h2>
      </div>

      <p class="text-sm text-secondary" style="margin-bottom: var(--space-4);">
        ${facility.description}
      </p>

      ${isPreset ? `
        <!-- Preset toggle for gym/pool/studio -->
        <div class="equipment-preset-toggle card" style="margin-bottom: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p class="text-sm" style="font-weight: var(--font-semibold);">
                Use ${facility.label} preset
              </p>
              <p class="text-xs text-muted">
                Auto-fills ${facility.equipment.length} items
              </p>
            </div>
            <button class="btn ${presetActive ? "btn-secondary" : "btn-primary"} btn-sm"
                    id="equip-preset-toggle"
                    data-facility="${facility.id}"
                    aria-pressed="${presetActive}">
              ${presetActive ? "Remove preset" : "Add preset"}
            </button>
          </div>
        </div>
      ` : ""}

      <!-- Individual equipment chips from relevant categories -->
      ${EQUIPMENT_CATEGORIES.map(cat => {
        const catItems = cat.items.filter(item =>
          facility.scope === "home" || facility.equipment.includes(item.id) || currentItems.includes(item.id)
        );
        if (catItems.length === 0) return "";
        const catCount = catItems.filter(item => currentItems.includes(item.id)).length;
        return `
          <div class="equipment-settings-category">
            <div class="equipment-category-heading">
              <span>${cat.icon} ${cat.label}</span>
              ${catCount > 0 ? `<span class="equipment-cat-count">${catCount} selected</span>` : ""}
            </div>
            <div class="equipment-chip-grid">
              ${catItems.map(item => `
                <button class="equipment-chip ${currentItems.includes(item.id) ? "selected" : ""}"
                        data-equipment="${item.id}"
                        data-scope="${facility.scope}"
                        aria-pressed="${currentItems.includes(item.id)}">
                  ${item.name}
                </button>
              `).join("")}
            </div>
          </div>
        `;
      }).join("")}

      ${facility.scope === "home" && currentItems.length === 0 ? `
        <div class="card" style="text-align: center; padding: var(--space-6);">
          <p class="text-secondary">
            No home equipment yet. Tap items above to add them.
          </p>
          <p class="text-sm text-muted" style="margin-top: var(--space-2);">
            A clear floor is enough. I will never assume you have something you have not told me about.
          </p>
        </div>
      ` : ""}

    </section>
  `;
}


function renderLibraryTab() {
  return `
    <section aria-labelledby="library-heading">

      <h2 id="library-heading" class="section-heading">My movement</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Tell the coach what kind of movement feels most like you.
        This shapes what the coach suggests first each day. You can change it any time.
      </p>
      ${renderMovementIdentity()}

      <h2 class="section-heading" style="margin-top: var(--space-6);">Guided sessions</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Start a session whenever you want — no check-in needed.
      </p>
      <div class="library-grid">

        <button class="library-card" data-navigate="gym-programme"
                aria-label="My gym programme">
          <span class="library-card-icon" aria-hidden="true">🏋</span>
          <span class="library-card-label">Gym programme</span>
        </button>

        <button class="library-card" data-navigate="morning-session"
                aria-label="My morning routine">
          <span class="library-card-icon" aria-hidden="true">🌅</span>
          <span class="library-card-label">Morning routine</span>
        </button>

        <button class="library-card" data-navigate="prescribed"
                aria-label="My prescribed exercises">
          <span class="library-card-icon" aria-hidden="true">🩺</span>
          <span class="library-card-label">Prescribed exercises</span>
        </button>

        <button class="library-card" data-navigate="yoga-session"
                aria-label="Yoga or pilates session">
          <span class="library-card-icon" aria-hidden="true">🧘</span>
          <span class="library-card-label">Yoga / Pilates</span>
        </button>

        <button class="library-card" data-quiet="breathing" data-navigate="quiet-session"
                aria-label="Breathing practice">
          <span class="library-card-icon" aria-hidden="true">🌬</span>
          <span class="library-card-label">Breathing</span>
        </button>

        <button class="library-card" data-quiet="journal" data-navigate="quiet-session"
                aria-label="Journaling session">
          <span class="library-card-icon" aria-hidden="true">📝</span>
          <span class="library-card-label">Journal</span>
        </button>

        <button class="library-card" data-quiet="mindful" data-navigate="quiet-session"
                aria-label="Mindful movement">
          <span class="library-card-icon" aria-hidden="true">🌿</span>
          <span class="library-card-label">Mindful movement</span>
        </button>

        <button class="library-card" data-navigate="coach-proposal"
                aria-label="Ask the coach to recommend a session">
          <span class="library-card-icon" aria-hidden="true">🤝</span>
          <span class="library-card-label">Coach recommends</span>
        </button>

      </div>

      <h2 class="section-heading" style="margin-top: var(--space-6);">Log an activity</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Done something? Log it and the coach will reflect on it with you.
      </p>
      <button class="library-card" style="width: 100%; flex-direction: row; gap: var(--space-3); justify-content: flex-start; padding: var(--space-4);"
              data-log-activity="open"
              aria-label="Log an activity">
        <span class="library-card-icon" aria-hidden="true">➕</span>
        <span class="library-card-label" style="font-size: var(--text-sm);">Log what you did</span>
      </button>

    </section>
  `;
}

// ── Movement identity ─────────────────────────────────────────────────────────

function renderMovementIdentity() {
  const current = (() => { const v = store.get("movementIdentity"); return Array.isArray(v) ? v : (v ? [v] : []); })();
  return `
    <div class="library-grid" role="group" aria-label="My movement identity">
      ${MOVEMENT_IDENTITIES.map(item => `
        <button class="library-card ${current.includes(item.id) ? "library-card--selected" : ""}"
                data-identity="${item.id}"
                aria-pressed="${current === item.id}"
                aria-label="${item.label}">
          <span class="library-card-icon" aria-hidden="true">${item.icon}</span>
          <span class="library-card-label">${item.label}</span>
        </button>
      `).join("")}
    </div>
    ${current ? `
      <p class="text-sm text-muted movement-identity-note" style="margin-top: var(--space-2);">
        The coach will lean toward ${MOVEMENT_IDENTITIES.find(i => i.id === current)?.label || current} suggestions.
        Your activity history refines this over time.
      </p>
    ` : ""}
  `;
}

// ── Voice speed — 10-level slider ─────────────────────────────────────────────

function renderSpeechRateSection() {
  const currentRate = store.get("speechRate") || 0.9;
  const currentPos  = rateToPosition(currentRate);
  const label       = speedLabel(currentRate);

  return `
    <div class="card speech-rate-card">
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Sets the speed of the read-aloud feature on coach cards.
        Tap the speaker icon on any coach message to listen.
      </p>
      <div class="speech-rate-slider-wrap">
        <div class="speech-rate-value-row">
          <span class="speech-rate-current-label" id="speech-rate-label"
                aria-live="polite" aria-atomic="true">${label}</span>
          <span class="text-sm text-muted" id="speech-rate-position"
                aria-hidden="true">${currentPos} / ${SPEED_STEPS}</span>
        </div>
        <input type="range" id="speech-rate-slider" class="checkin-slider"
               min="1" max="${SPEED_STEPS}" step="1" value="${currentPos}"
               aria-label="Coach voice speed"
               aria-valuemin="1" aria-valuemax="${SPEED_STEPS}"
               aria-valuenow="${currentPos}" aria-valuetext="${label}">
        <div class="checkin-slider-ends" aria-hidden="true">
          <span>Slower</span>
          <span>Faster</span>
        </div>
      </div>
    </div>
  `;
}

// ── Notification section ──────────────────────────────────────────────────────

function renderNotificationSection() {
  const notif   = store.get("checkInNotification") || { enabled: false, time: null, permissionGranted: false };
  const enabled = !!notif.enabled;
  const denied  = enabled && !notif.permissionGranted
                  && "Notification" in window
                  && Notification.permission === "denied";

  return `
    <div class="card notification-card">
      <div class="notification-toggle-row">
        <div class="notification-toggle-label">
          <span class="notification-label-text">Daily check-in reminder</span>
          <span class="notification-label-sub text-sm text-muted">
            A gentle nudge at the time you choose
          </span>
        </div>
        <label class="toggle-switch" aria-label="Enable daily check-in reminder">
          <input type="checkbox" id="notif-toggle" role="switch"
                 aria-checked="${enabled}" ${enabled ? "checked" : ""}>
          <span class="toggle-track" aria-hidden="true"></span>
        </label>
      </div>

      ${enabled ? `
        <div class="notification-time-row" id="notif-time-row">
          <label class="form-label" for="notif-time">Remind me at</label>
          <input type="time" id="notif-time" class="form-input notif-time-input"
                 value="${notif.time || "08:00"}" aria-label="Check-in reminder time">
        </div>
        ${denied ? `
          <div class="notification-denied-banner" role="alert">
            <p class="text-sm">
              Your device has blocked notifications for this app.
              To receive reminders, go to your browser or device settings
              and allow notifications for this site.
            </p>
          </div>
        ` : (!notif.permissionGranted && "Notification" in window && Notification.permission !== "granted") ? `
          <p class="text-sm text-muted notification-permission-note">
            Your browser will ask for permission to show notifications.
          </p>
        ` : ""}
      ` : `
        <p class="text-sm text-muted" style="margin-top: var(--space-3);">
          Turn on to set a daily reminder to check in. You can change or
          turn off the reminder any time.
        </p>
      `}
    </div>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatGender(gender) {
  const map = {
    "female":     "Female",
    "male":       "Male",
    "non-binary": "Non-binary",
    "prefer-not": "Prefer not to say"
  };
  return map[gender] || "";
}

function switchTab(tabName) {
  activeTab    = tabName;
  editingField = null;
  document.querySelectorAll(".settings-tab").forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive);
  });
  const panel = document.getElementById("settings-tab-panel");
  if (panel) {
    panel.setAttribute("aria-labelledby", `tab-${tabName}`);
    panel.innerHTML = renderActiveTab();
    wirePanel();
  }
}

function rerenderTab() {
  const panel = document.getElementById("settings-tab-panel");
  if (panel) {
    panel.innerHTML = renderActiveTab();
    wirePanel();
  }
}

function rerenderEquipment() {
  // Re-render the entire equipment tab panel
  // Used when switching between facility landing and sub-screens
  const panel = document.getElementById("panel-equipment")
             || document.getElementById("panel-equipment-sub");
  if (!panel) return;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = equipmentScreen === "facilities"
    ? renderEquipmentTab()
    : renderFacilitySubScreen(equipmentScreen);
  const newPanel = wrapper.querySelector("section");
  if (newPanel) {
    panel.replaceWith(newPanel);
    onMount();
  }
}

function rerenderEquipmentChips() {
  const section  = document.getElementById("equipment-chip-section");
  if (!section) return;
  const selected = store.get("equipment") || [];
  section.querySelectorAll(".equipment-chip").forEach(chip => {
    const id         = chip.dataset.equipmentId;
    const isSelected = selected.includes(id);
    chip.classList.toggle("selected", isSelected);
    chip.setAttribute("aria-pressed", isSelected);
  });
  // Update all category count badges
  section.querySelectorAll(".equipment-settings-category").forEach(catEl => {
    const chips      = catEl.querySelectorAll(".equipment-chip");
    const count      = Array.from(chips).filter(c => c.classList.contains("selected")).length;
    const heading    = catEl.querySelector(".equipment-category-heading");
    const badge      = heading?.querySelector(".equipment-cat-count");
    if (badge) badge.remove();
    if (count > 0 && heading) {
      const b = document.createElement("span");
      b.className   = "equipment-cat-count";
      b.textContent = `${count} selected`;
      heading.appendChild(b);
    }
  });
}

// ── Wire all panel elements ───────────────────────────────────────────────────

function wirePanel() {

  // Profile: open edit
  document.querySelectorAll(".profile-edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      editingField = btn.dataset.field;
      rerenderTab();
    });
  });

  // Profile: save
  document.getElementById("profile-save-btn")?.addEventListener("click", () => {
    const input = document.getElementById("profile-edit-input");
    if (!input || !editingField) return;
    const val = input.value.trim();
    if (editingField === "name")   store.set("name",   val || null);
    if (editingField === "age")    store.set("age",    val ? parseInt(val) : null);
    if (editingField === "gender") store.set("gender", val || null);
    if (editingField === "weight") store.set("weight", val ? parseFloat(val) : null);
    editingField = null;
    rerenderTab();
  });

  // Profile: cancel
  document.getElementById("profile-cancel-btn")?.addEventListener("click", () => {
    editingField = null;
    rerenderTab();
  });

  // Coach style
  document.querySelectorAll(".coach-style-card").forEach(card => {
    card.addEventListener("click", () => {
      const style = card.dataset.style;
      if (!style) return;
      store.set("coachStyle", style);
      document.querySelectorAll(".coach-style-card").forEach(c => {
        const isSel = c.dataset.style === style;
        c.classList.toggle("selected", isSel);
        c.setAttribute("aria-checked", isSel);
      });
    });
  });

  // Voice speed slider
  const slider = document.getElementById("speech-rate-slider");
  if (slider) {
    slider.addEventListener("input", () => {
      const pos   = parseInt(slider.value);
      const rate  = positionToRate(pos);
      const label = speedLabel(rate);
      store.set("speechRate", rate);
      const labelEl = document.getElementById("speech-rate-label");
      const posEl   = document.getElementById("speech-rate-position");
      if (labelEl) labelEl.textContent = label;
      if (posEl)   posEl.textContent   = `${pos} / ${SPEED_STEPS}`;
      slider.setAttribute("aria-valuenow",  pos);
      slider.setAttribute("aria-valuetext", label);
    });
  }

  // Notification controls
  wireNotificationControls();

  // Conditions: add
  document.querySelectorAll(".condition-add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.conditionId;
      if (!id) return;
      const current = store.get("conditions") || [];
      if (!current.includes(id)) store.set("conditions", [...current, id]);
      rerenderTab();
    });
  });

  // Conditions: remove
  document.querySelectorAll(".condition-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.conditionId;
      if (!id) return;
      const current = store.get("conditions") || [];
      store.set("conditions", current.filter(c => c !== id));
      const painScores = store.get("conditionPainScores") || {};
      delete painScores[id];
      store.set("conditionPainScores", painScores);
      rerenderTab();
    });
  });

  // Equipment: back button in sub-screen
  document.getElementById("equip-back-btn")?.addEventListener("click", () => {
    equipmentScreen = "facilities";
    rerenderEquipment();
  });

  // Equipment: facility card tap — open sub-screen
  document.querySelectorAll(".equipment-facility-card[data-facility]").forEach(btn => {
    btn.addEventListener("click", () => {
      equipmentScreen = btn.dataset.facility;
      rerenderEquipment();
    });
  });

  // Equipment: preset toggle in sub-screen
  document.getElementById("equip-preset-toggle")?.addEventListener("click", (e) => {
    const facilityId = e.currentTarget.dataset.facility;
    toggleFacility(facilityId);
    rerenderEquipment();
  });

  // Equipment: individual chip toggle in sub-screen
  document.querySelectorAll(".equipment-chip[data-equipment]").forEach(chip => {
    chip.addEventListener("click", () => {
      const id      = chip.dataset.equipment;
      const scope   = chip.dataset.scope;
      const current = getEquipmentForScope(scope);
      const updated = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id];
      saveEquipmentForScope(scope, updated);
      // Update chip state without full rerender
      chip.classList.toggle("selected", updated.includes(id));
      chip.setAttribute("aria-pressed", updated.includes(id));
      // Update category count
      const catEl   = chip.closest(".equipment-settings-category");
      const countEl = catEl?.querySelector(".equipment-cat-count");
      if (countEl) {
        const newCount = Array.from(catEl.querySelectorAll(".equipment-chip.selected")).length;
        countEl.textContent = newCount > 0 ? `${newCount} selected` : "";
      }
    });
  });

  // Equipment: facility presets (legacy — kept for backward compat)
  document.querySelectorAll(".facility-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const preset = FACILITY_PRESETS.find(p => p.id === btn.dataset.preset);
      if (!preset) return;

      // Write to the correct store key based on scope
      // "gym" scope → gymEquipment (what I have at the gym)
      // "home" scope → homeEquipment (what I have at home)
      // Also always write to equipment[] for backward compatibility
      if (preset.scope === "home") {
        const current = store.get("homeEquipment") || [];
        store.set("homeEquipment", Array.from(new Set([...current, ...preset.fills])));
      } else {
        const current = store.get("gymEquipment") || [];
        store.set("gymEquipment", Array.from(new Set([...current, ...preset.fills])));
      }
      // Keep equipment[] in sync (union of both)
      const gym  = store.get("gymEquipment")  || [];
      const home = store.get("homeEquipment") || [];
      store.set("equipment", Array.from(new Set([...gym, ...home])));

      document.querySelectorAll(".facility-preset-btn").forEach(b =>
        b.classList.remove("selected")
      );
      btn.classList.add("selected");
      rerenderEquipmentChips();
    });
  });

  // Equipment: individual chips
  document.querySelectorAll(".equipment-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const id = chip.dataset.equipmentId;
      if (!id) return;
      const current    = store.get("equipment") || [];
      const isSelected = current.includes(id);
      store.set("equipment", isSelected ? current.filter(e => e !== id) : [...current, id]);
      chip.classList.toggle("selected", !isSelected);
      chip.setAttribute("aria-pressed", !isSelected);
      updateCategoryCount(chip);
    });
  });

  // Library: navigation cards
  document.querySelectorAll("[data-navigate]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target    = btn.dataset.navigate;
      const quietMode = btn.dataset.quiet || null;
      if (!target) return;
      if (quietMode) store.set("quietMode", quietMode);
      router.navigate(target);
    });
  });

  // Library: movement identity
  document.querySelectorAll("[data-identity]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.identity;
      if (!id) return;
      store.set("movementIdentity", id);
      document.querySelectorAll("[data-identity]").forEach(b => {
        const isSel = b.dataset.identity === id;
        b.classList.toggle("library-card--selected", isSel);
        b.setAttribute("aria-pressed", isSel);
      });
      const grid = document.querySelector(".library-grid[aria-label='My movement identity']");
      if (grid) {
        const existing = grid.nextElementSibling;
        if (existing?.classList.contains("movement-identity-note")) existing.remove();
        const identity = MOVEMENT_IDENTITIES.find(i => i.id === id);
        if (identity) {
          const note = document.createElement("p");
          note.className   = "text-sm text-muted movement-identity-note";
          note.style.marginTop = "var(--space-2)";
          note.textContent = `The coach will lean toward ${identity.label} suggestions. Your activity history refines this over time.`;
          grid.after(note);
        }
      }
    });
  });

  // Library: log activity — navigate to activity-log view
  // activity-log.js is the single source of truth for logging activities
  // It shows the full category list and handles the log entry itself
  document.querySelectorAll("[data-log-activity]").forEach(btn => {
    btn.addEventListener("click", () => {
      router.navigate("activity-log");
    });
  });
}

function updateCategoryCount(chip) {
  const catEl = chip.closest(".equipment-settings-category");
  if (!catEl) return;
  const count   = Array.from(catEl.querySelectorAll(".equipment-chip"))
                       .filter(c => c.classList.contains("selected")).length;
  const heading = catEl.querySelector(".equipment-category-heading");
  if (!heading) return;
  const existing = heading.querySelector(".equipment-cat-count");
  if (existing) existing.remove();
  if (count > 0) {
    const badge = document.createElement("span");
    badge.className   = "equipment-cat-count";
    badge.textContent = `${count} selected`;
    heading.appendChild(badge);
  }
}

// ── Notification wiring ───────────────────────────────────────────────────────

function wireNotificationControls() {
  const toggle    = document.getElementById("notif-toggle");
  const timeInput = document.getElementById("notif-time");

  if (toggle) {
    toggle.addEventListener("change", async () => {
      const wantsEnabled = toggle.checked;
      if (!wantsEnabled) {
        saveNotificationState({ enabled: false, time: null, permissionGranted: false });
        rerenderNotificationSection();
        return;
      }
      if (!("Notification" in window)) {
        saveNotificationState({ enabled: false, time: null, permissionGranted: false });
        rerenderNotificationSection();
        return;
      }
      if (Notification.permission === "granted") {
        const t = store.get("checkInNotification.time") || "08:00";
        saveNotificationState({ enabled: true, time: t, permissionGranted: true });
        rerenderNotificationSection();
        startNotificationScheduler();
        return;
      }
      const permission = await Notification.requestPermission();
      const granted    = permission === "granted";
      const t          = store.get("checkInNotification.time") || "08:00";
      saveNotificationState({ enabled: true, time: t, permissionGranted: granted });
      rerenderNotificationSection();
      if (granted) startNotificationScheduler();
    });
  }

  if (timeInput) {
    timeInput.addEventListener("change", () => {
      if (timeInput.value) store.set("checkInNotification.time", timeInput.value);
    });
  }
}

function saveNotificationState(state) {
  store.set("checkInNotification", {
    enabled: state.enabled, time: state.time, permissionGranted: state.permissionGranted
  });
}

function rerenderNotificationSection() {
  const card = document.querySelector(".notification-card");
  if (card?.parentElement) {
    card.parentElement.innerHTML = renderNotificationSection();
    wireNotificationControls();
  }
}

// ── Notification scheduler ────────────────────────────────────────────────────

let _notifSchedulerInterval = null;
let _notifLastFiredMinute   = null;

const NOTIFICATION_MESSAGES = [
  { title: "Alongside", body: "Ready when you are. A quick check-in takes less than a minute." },
  { title: "Alongside", body: "How are you feeling today? Your coach is here whenever suits you." },
  { title: "Alongside", body: "Just a gentle nudge. Come check in whenever you are ready." },
  { title: "Alongside", body: "Your check-in is waiting. No rush — take it at your own pace." },
  { title: "Alongside", body: "A moment to check in whenever suits you today." }
];

function startNotificationScheduler() {
  if (_notifSchedulerInterval) clearInterval(_notifSchedulerInterval);
  _notifSchedulerInterval = setInterval(() => {
    const notif = store.get("checkInNotification");
    if (!notif?.enabled || !notif?.permissionGranted || !notif?.time) return;
    if (Notification.permission !== "granted") return;
    const now     = new Date();
    const hh      = String(now.getHours()).padStart(2, "0");
    const mm      = String(now.getMinutes()).padStart(2, "0");
    const nowHHMM = `${hh}:${mm}`;
    if (nowHHMM === notif.time && _notifLastFiredMinute !== nowHHMM) {
      _notifLastFiredMinute = nowHHMM;
      const start  = new Date(now.getFullYear(), 0, 0);
      const dayIdx = Math.floor((now - start) / 86400000) % NOTIFICATION_MESSAGES.length;
      const msg    = NOTIFICATION_MESSAGES[dayIdx];
      new Notification(msg.title, {
        body: msg.body, icon: "assets/images/logo-icon-192.png",
        tag: "alongside-checkin", renotify: false
      });
    }
  }, 60000);
  window._alongsideNotifInterval = _notifSchedulerInterval;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  document.querySelectorAll(".settings-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const name = tab.dataset.tab;
      if (name && name !== activeTab) switchTab(name);
    });
  });

  wirePanel();

  const notif = store.get("checkInNotification");
  if (notif?.enabled && notif?.permissionGranted) startNotificationScheduler();

  document.getElementById("check-update-btn")?.addEventListener("click", async () => {
    const btn      = document.getElementById("check-update-btn");
    const statusEl = document.getElementById("update-check-status");
    if (btn)      { btn.textContent = "Checking..."; btn.disabled = true; }
    if (statusEl)   statusEl.textContent = "";
    const result = await window.App?.checkForUpdate?.() || "unavailable";
    window.App?.showUpdateCheckResult?.(result);
    if (btn) { btn.textContent = "Check for updates"; btn.disabled = false; }
  });

  document.getElementById("reset-app-btn")?.addEventListener("click", () => {
    if (confirm("This will delete all your data and start fresh. Are you sure?")) {
      store.reset();
      activeTab    = "profile";
      editingField = null;
      document.getElementById("bottom-nav")?.classList.add("hidden");
      router.navigate("onboarding/welcome");
    }
  });
}
