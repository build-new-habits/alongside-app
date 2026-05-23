/**
 * settings.js - Settings view
 *
 * 22 May 2026 v2 --- Dev tier panel added:
 *   Triple-tap the version label to open tier switcher.
 *   Free / Personal / Athlete. Changes persist in store.
 *   No other changes from restored 22 May 2026 v1.
 *
 * 22 May 2026 v1 --- My Week tab added (S4-3):
 *   Fifth tab: "My Week" --- weekly plan builder.
 *   7-day grid (Mon-Sun), each day configurable with type, session type,
 *   duration, activity name (class type), and notification time.
 *   Free tier: toggle locked with upgrade prompt after 4th session.
 *   Personal tier: full access --- create, edit, save, toggle on/off.
 *   Save writes weeklyPlan, weeklyPlanSetAt, weeklyPlanEnabled to store.
 *   Day config is an inline modal-style panel below the grid.
 *
 * 18 May 2026 v1 --- Editable profile, facility presets, add/remove conditions,
 *   Morning Routine. Library tab deep-link. Voice speed 10-level slider.
 *
 * v2.0 --- Library tab + My Movement + 10-level voice speed slider
 * v1.4 --- App version display and update check button (S3-6)
 * v1.3 --- Check-in notification (S3-6)
 * v1.0 --- Tabbed layout: Profile / Conditions / Equipment
 */

import { store }                        from "../store.js";
import { getConditionName, CONDITIONS } from "../data/conditions.js";
import { EQUIPMENT_CATEGORIES }         from "../data/equipment.js";

export const centered = false;

// -- Tab state ----------------------------------------------------------------
let activeTab    = "profile";
let editingField = null;

// -- Coach styles -------------------------------------------------------------
const COACH_STYLES = [
  { id: "steady",    label: "Steady",    description: "Calm, consistent, and supportive. Never rushed.",    icon: "&#127807;" },
  { id: "energetic", label: "Energetic", description: "Upbeat, motivating, and enthusiastic.",              icon: "&#9889;" },
  { id: "minimal",   label: "Minimal",   description: "Short, direct, and to the point. No fluff.",         icon: "&#127919;" },
  { id: "nurturing", label: "Nurturing", description: "Warm, gentle, and emotionally attentive.",           icon: "&#128155;" }
];

// -- Movement identities ------------------------------------------------------
const MOVEMENT_IDENTITIES = [
  { id: "gym",      label: "Gym / weights",   icon: "&#127947;" },
  { id: "yoga",     label: "Yoga / pilates",  icon: "&#129368;" },
  { id: "running",  label: "Running",         icon: "&#127939;" },
  { id: "walking",  label: "Walking",         icon: "&#128694;" },
  { id: "swimming", label: "Swimming",        icon: "&#127946;" },
  { id: "classes",  label: "Classes",         icon: "&#127973;" },
  { id: "mixed",    label: "A mix of things", icon: "&#10024;" },
];

// -- Weekly plan constants ----------------------------------------------------
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const DAY_LABELS = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday"
};

const DAY_TYPES = [
  { id: "open",     label: "No plan",       desc: "Coach decides based on check-in",        icon: "&#8212;" },
  { id: "gym",      label: "Gym session",   desc: "Strength, cardio, or full body",          icon: "&#127947;" },
  { id: "rest",     label: "Rest day",      desc: "No movement planned",                     icon: "&#128564;" },
  { id: "recovery", label: "Recovery",      desc: "Light movement -- walk, swim, yoga",      icon: "&#127807;" },
  { id: "class",    label: "Class planned", desc: "Yoga, Body Balance, tennis, or similar",  icon: "&#129368;" },
];

const SESSION_TYPES = [
  { id: "upper",    label: "Upper Body" },
  { id: "lower",    label: "Lower Body" },
  { id: "full",     label: "Full Body" },
  { id: "core",     label: "Core & Stability" },
  { id: "cardio",   label: "Cardio" },
  { id: "hiit",     label: "HIIT" },
  { id: "mobility", label: "Mobility" },
];

const DURATION_OPTIONS = [20, 30, 45, 60, 75, 90];

// Weekly plan local edit state (not saved until "Save my week")
let weeklyPlanDraft = null;
let configuringDay  = null;

function initDraft() {
  const saved = store.get("weeklyPlan") || {};
  const defaultSlot = {
    type: "open", sessionType: null, durationMins: null,
    label: null, notificationEnabled: false, notificationTime: null, activityName: null
  };
  const draft = {};
  DAYS.forEach(day => {
    draft[day] = { ...defaultSlot, ...(saved[day] || {}) };
  });
  weeklyPlanDraft = draft;
}

function isPremium() {
  // Check store.isPremium() if available (store v3+), else fall back to legacy keys
  if (typeof store.isPremium === "function") return store.isPremium();
  return store.get("isPremium") || store.get("tier") === "personal" || store.get("tier") === "athlete" || false;
}

// -- Equipment tab state ------------------------------------------------------
let equipmentScreen = "facilities";

const FACILITY_DEFS = [
  {
    id: "gym-full", label: "Full gym", icon: "&#127947;", scope: "gym",
    description: "Fully-equipped gym -- weights, machines, cardio",
    equipment: [
      "dumbbells-light","dumbbells-medium","dumbbells-heavy","adjustable-dumbbells",
      "kettlebell-light","kettlebell-medium","kettlebell-heavy",
      "barbell","ez-curl-bar",
      "band-light","band-medium","band-heavy",
      "treadmill","exercise-bike","rowing-machine","elliptical",
      "bench-flat","bench-adjustable",
      "pull-up-bar","dip-station",
      "stability-ball","ab-wheel",
      "foam-roller","massage-gun","gym-membership"
    ]
  },
  { id: "swimming-pool",  label: "Swimming pool",  icon: "&#127946;", scope: "gym",  description: "Pool access -- lane swimming, aqua fitness", equipment: ["swimming-pool"] },
  { id: "fitness-studio", label: "Fitness studio", icon: "&#127973;", scope: "gym",  description: "Studio classes -- yoga, pilates, spin, circuits", equipment: ["fitness-studio","yoga-mat","band-light","band-medium","step-platform"] },
  { id: "home",           label: "Home setup",     icon: "&#127968;", scope: "home", description: "What you have at home", equipment: [] },
  { id: "no-equipment",   label: "Bodyweight only",icon: "&#128694;", scope: "home", description: "No equipment -- floor space is enough", equipment: [] },
];

const FACILITY_PRESETS = [
  { id: "gym-full",      label: "Full gym",      icon: "&#127947;", scope: "gym",  fills: ["dumbbells-light","dumbbells-medium","dumbbells-heavy","adjustable-dumbbells","kettlebell-light","kettlebell-medium","kettlebell-heavy","barbell","ez-curl-bar","band-light","band-medium","band-heavy","treadmill","exercise-bike","rowing-machine","elliptical","bench-flat","bench-adjustable","pull-up-bar","dip-station","stability-ball","ab-wheel","foam-roller","massage-gun","gym-membership"] },
  { id: "home-setup",    label: "Home setup",    icon: "&#127968;", scope: "home", fills: ["dumbbells-light","dumbbells-medium","band-light","band-medium","yoga-mat","pull-up-bar","bench-adjustable","foam-roller"] },
  { id: "swimming-pool", label: "Swimming pool", icon: "&#127946;", scope: "gym",  fills: ["swimming-pool"] },
  { id: "fitness-studio",label: "Fitness studio",icon: "&#127973;", scope: "gym",  fills: ["fitness-studio","yoga-mat","band-light","band-medium","step-platform"] },
  { id: "no-equipment",  label: "No equipment",  icon: "&#128694;", scope: "home", fills: [] }
];

function getEquipmentForScope(scope) {
  return scope === "home" ? (store.get("homeEquipment") || []) : (store.get("gymEquipment") || []);
}

function saveEquipmentForScope(scope, items) {
  if (scope === "home") store.set("homeEquipment", items);
  else                  store.set("gymEquipment",  items);
  const gym  = store.get("gymEquipment")  || [];
  const home = store.get("homeEquipment") || [];
  store.set("equipment", Array.from(new Set([...gym, ...home])));
}

function isFacilityActive(facility) {
  if (facility.equipment.length === 0) return false;
  const current = getEquipmentForScope(facility.scope);
  return facility.equipment.some(eq => current.includes(eq));
}

function toggleFacility(facilityId) {
  const facility = FACILITY_DEFS.find(f => f.id === facilityId);
  if (!facility) return;
  const current  = getEquipmentForScope(facility.scope);
  const isActive = facility.equipment.length > 0 && facility.equipment.some(eq => current.includes(eq));
  if (isActive && facility.equipment.length > 0) {
    saveEquipmentForScope(facility.scope, current.filter(eq => !facility.equipment.includes(eq)));
  } else if (!isActive && facility.equipment.length > 0) {
    saveEquipmentForScope(facility.scope, Array.from(new Set([...current, ...facility.equipment])));
  }
}

// -- Voice speed --------------------------------------------------------------
const SPEED_MIN = 0.5, SPEED_MAX = 1.5, SPEED_STEPS = 10;

function rateToPosition(rate) {
  return Math.max(1, Math.min(SPEED_STEPS,
    Math.round(((rate - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * (SPEED_STEPS - 1)) + 1));
}
function positionToRate(pos) {
  return Math.round((SPEED_MIN + ((pos - 1) / (SPEED_STEPS - 1)) * (SPEED_MAX - SPEED_MIN)) * 100) / 100;
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

// -- Render -------------------------------------------------------------------

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
                aria-controls="settings-tab-panel" id="tab-profile" data-tab="profile">
          Profile
        </button>
        <button class="settings-tab ${activeTab === "conditions" ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "conditions"}"
                aria-controls="settings-tab-panel" id="tab-conditions" data-tab="conditions">
          Conditions
        </button>
        <button class="settings-tab ${activeTab === "equipment"  ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "equipment"}"
                aria-controls="settings-tab-panel" id="tab-equipment" data-tab="equipment">
          Equipment
        </button>
        <button class="settings-tab ${activeTab === "library"    ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "library"}"
                aria-controls="settings-tab-panel" id="tab-library" data-tab="library">
          Library
        </button>
        <button class="settings-tab ${activeTab === "myweek"     ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "myweek"}"
                aria-controls="settings-tab-panel" id="tab-myweek" data-tab="myweek">
          My Week
        </button>
      </div>

      <div id="settings-tab-panel" role="tabpanel"
           aria-labelledby="tab-${activeTab}" class="settings-tab-panel">
        ${renderActiveTab()}
      </div>

      <div class="settings-reset-zone">
        <div class="settings-update-zone">
          <div class="settings-version-row">
            <span class="text-sm text-muted">Version</span>
            <span class="text-sm text-muted" id="settings-version-label"
                  style="cursor:pointer;user-select:none;"
                  title="Triple-tap to open dev panel">
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

// -- Tab content --------------------------------------------------------------

function renderActiveTab() {
  if (activeTab === "profile")    return renderProfileTab();
  if (activeTab === "conditions") return renderConditionsTab();
  if (activeTab === "equipment")  return renderEquipmentTab();
  if (activeTab === "library")    return renderLibraryTab();
  if (activeTab === "myweek")     return renderMyWeekTab();
  return "";
}

// -- Profile tab --------------------------------------------------------------

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
        ${editableRow("weight", "Weight", weight ? weight + weightUnit : "Not set", "number", 'min="1" max="500" step="0.1"')}
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

// -- Conditions tab -----------------------------------------------------------

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

// -- Equipment tab ------------------------------------------------------------

function renderEquipmentTab() {
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

      <h3 class="section-heading" style="margin-bottom: var(--space-3);">At the gym or facility</h3>
      <div class="equipment-facility-grid">
        ${gymFacilities.map(f => {
          const active = isFacilityActive(f);
          return `
            <button class="equipment-facility-card ${active ? "equipment-facility-card--active" : ""}"
                    data-facility="${f.id}"
                    aria-label="${f.label}: ${f.description}. ${active ? "Active" : "Tap to add"}">
              <span class="equipment-facility-icon" aria-hidden="true">${f.icon}</span>
              <span class="equipment-facility-label">${f.label}</span>
              ${active ? `<span class="equipment-facility-check" aria-hidden="true">&#10003;</span>` : ""}
            </button>
          `;
        }).join("")}
      </div>

      <h3 class="section-heading" style="margin: var(--space-5) 0 var(--space-3);">At home</h3>
      <div class="equipment-facility-grid">
        ${homeFacilities.map(f => {
          const homeItems = store.get("homeEquipment") || [];
          const active = homeItems.length > 0;
          return `
            <button class="equipment-facility-card ${f.id !== "no-equipment" && active ? "equipment-facility-card--active" : ""}"
                    data-facility="${f.id}"
                    aria-label="${f.label}: ${f.description}">
              <span class="equipment-facility-icon" aria-hidden="true">${f.icon}</span>
              <span class="equipment-facility-label">${f.label}</span>
              ${f.id !== "no-equipment" && active ? `<span class="equipment-facility-check" aria-hidden="true">&#10003;</span>` : ""}
            </button>
          `;
        }).join("")}
      </div>

      <p class="text-xs text-muted" style="margin-top: var(--space-4);">
        Tap any location to see and edit the equipment available there.
      </p>
    </section>
  `;
}

function renderFacilitySubScreen(facilityId) {
  const facility = FACILITY_DEFS.find(f => f.id === facilityId);
  if (!facility) return renderEquipmentTab();

  const currentItems = getEquipmentForScope(facility.scope);
  const isPreset     = facility.equipment.length > 0;
  const presetActive = isPreset && facility.equipment.some(eq => currentItems.includes(eq));

  return `
    <section class="settings-tab-panel" id="panel-equipment-sub" role="tabpanel">
      <div class="equipment-sub-header">
        <button class="btn btn-ghost equipment-sub-back" id="equip-back-btn"
                aria-label="Back to locations">
          &larr; Back
        </button>
        <h2 class="equipment-sub-title">${facility.icon} ${facility.label}</h2>
      </div>

      <p class="text-sm text-secondary" style="margin-bottom: var(--space-4);">
        ${facility.description}
      </p>

      ${isPreset ? `
        <div class="equipment-preset-toggle card" style="margin-bottom: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p class="text-sm" style="font-weight: var(--font-semibold);">
                Use ${facility.label} preset
              </p>
              <p class="text-xs text-muted">Auto-fills ${facility.equipment.length} items</p>
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

      ${EQUIPMENT_CATEGORIES.map(cat => {
        const catItems = cat.items.filter(item =>
          facility.scope === "home" || facility.equipment.includes(item.id) || currentItems.includes(item.id)
        );
        if (catItems.length === 0) return "";
        const catCount = catItems.filter(item => currentItems.includes(item.id)).length;
        return `
          <div class="equipment-settings-category">
            <div class="equipment-category-heading">
              <span>${cat.icon} ${cat.name}</span>
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
    </section>
  `;
}

// -- Library tab --------------------------------------------------------------

function renderLibraryTab() {
  return `
    <section aria-labelledby="library-heading">
      <h2 id="library-heading" class="section-heading">My movement</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Tell the coach what kind of movement feels most like you.
        This shapes what the coach suggests first each day.
      </p>
      ${renderMovementIdentity()}

      <h2 class="section-heading" style="margin-top: var(--space-6);">Library</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Sessions, programmes, and activity logging -- all in one place.
      </p>
      <button class="btn btn-primary btn-full btn-large" id="open-library-btn"
              aria-label="Open the Library">
        Open Library &rarr;
      </button>
    </section>
  `;
}

// -- My Week tab --------------------------------------------------------------

function renderMyWeekTab() {
  if (!weeklyPlanDraft) initDraft();
  const premium = isPremium();
  const enabled = store.get("weeklyPlanEnabled") || false;

  return `
    <section aria-labelledby="myweek-heading">
      <h2 id="myweek-heading" class="section-heading">My Week</h2>

      ${!premium ? `
        <div class="card settings-coach-card" style="margin-bottom: var(--space-4);">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="text-sm">
            Did you know you can plan your whole week in advance? I will use your
            plan as a starting point each day and adapt around how you are feeling.
          </p>
        </div>
        <div class="card" style="text-align:center; padding:var(--space-6);">
          <p class="text-secondary" style="margin-bottom:var(--space-3);">
            Weekly planning is available on the Personal plan.
          </p>
          <button class="btn btn-primary" id="upgrade-prompt-btn"
                  aria-label="Upgrade to Personal plan">
            Upgrade to Personal
          </button>
        </div>
      ` : `
        <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
          Set a movement type for each day. I will use this as my starting point
          and adapt around your check-in each morning.
        </p>

        <div class="card" style="margin-bottom:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p class="text-sm" style="font-weight:var(--font-semibold);">
                Use my weekly plan
              </p>
              <p class="text-xs text-muted">
                ${enabled ? "Plan is active -- I am reading it each day" : "Off -- I will decide fresh each day"}
              </p>
            </div>
            <label class="toggle-switch" aria-label="Enable weekly plan">
              <input type="checkbox" id="weekly-plan-toggle" role="switch"
                     aria-checked="${enabled}" ${enabled ? "checked" : ""}>
              <span class="toggle-track" aria-hidden="true"></span>
            </label>
          </div>
        </div>

        <div class="weekly-plan-grid" role="list" aria-label="Weekly plan days">
          ${DAYS.map(day => renderDayCard(day)).join("")}
        </div>

        ${configuringDay ? renderDayConfig(configuringDay) : ""}

        <button class="btn btn-primary btn-full btn-large" id="save-week-btn"
                style="margin-top:var(--space-5);"
                aria-label="Save weekly plan">
          Save my week
        </button>

        ${store.get("weeklyPlanSetAt") ? `
          <p class="text-xs text-muted" style="text-align:center;margin-top:var(--space-2);">
            Last saved ${formatRelativeDate(store.get("weeklyPlanSetAt"))}
          </p>
        ` : ""}
      `}
    </section>
  `;
}

function renderDayCard(day) {
  const slot    = weeklyPlanDraft?.[day] || { type: "open" };
  const typeObj = DAY_TYPES.find(t => t.id === slot.type) || DAY_TYPES[0];
  const isConfiguring = configuringDay === day;
  const label   = slot.label || (slot.type === "gym" && slot.sessionType
    ? SESSION_TYPES.find(s => s.id === slot.sessionType)?.label || typeObj.label
    : typeObj.label);

  return `
    <div class="weekly-plan-day-card ${isConfiguring ? "weekly-plan-day-card--active" : ""}"
         role="listitem">
      <button class="weekly-plan-day-btn"
              data-day="${day}"
              aria-expanded="${isConfiguring}"
              aria-label="Configure ${DAY_LABELS[day]}: currently ${label}">
        <div class="weekly-plan-day-info">
          <span class="weekly-plan-day-name">${DAY_LABELS[day]}</span>
          <span class="weekly-plan-day-type ${slot.type !== "open" ? "weekly-plan-day-type--set" : ""}">
            ${label}
          </span>
        </div>
        <span class="weekly-plan-day-chevron" aria-hidden="true">${isConfiguring ? "&#8593;" : "&#8595;"}</span>
      </button>
    </div>
  `;
}

function renderDayConfig(day) {
  const slot = weeklyPlanDraft?.[day] || { type: "open" };

  return `
    <div class="weekly-plan-config-panel card" id="day-config-panel"
         aria-label="Configure ${DAY_LABELS[day]}">
      <h3 class="section-heading" style="font-size:var(--text-base);margin-bottom:var(--space-3);">
        ${DAY_LABELS[day]}
      </h3>

      <p class="text-sm text-muted" style="margin-bottom:var(--space-2);">What is planned?</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-4);"
           role="group" aria-label="Day type">
        ${DAY_TYPES.map(t => `
          <button class="weekly-plan-type-btn ${slot.type === t.id ? "weekly-plan-type-btn--selected" : ""}"
                  data-day-type="${t.id}"
                  aria-pressed="${slot.type === t.id}"
                  style="display:flex;align-items:center;gap:var(--space-3);
                         padding:var(--space-3) var(--space-3);border-radius:var(--radius-md,8px);
                         text-align:left;cursor:pointer;width:100%;
                         background:${slot.type === t.id ? "rgba(20,184,166,0.12)" : "var(--color-surface-2,rgba(255,255,255,0.04))"};
                         border:1.5px solid ${slot.type === t.id ? "var(--color-primary)" : "transparent"};">
            <div style="flex:1;">
              <p style="font-size:var(--text-sm);font-weight:var(--font-semibold);
                        color:${slot.type === t.id ? "var(--color-primary)" : "var(--color-text)"};margin:0 0 2px;">
                ${t.label}
              </p>
              <p style="font-size:var(--text-xs);color:var(--color-text-secondary);margin:0;">${t.desc}</p>
            </div>
            ${slot.type === t.id ? `<span style="color:var(--color-primary);" aria-hidden="true">&#10003;</span>` : ""}
          </button>
        `).join("")}
      </div>

      ${slot.type === "gym" ? `
        <p class="text-sm text-muted" style="margin-bottom:var(--space-2);">Session focus</p>
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-4);"
             role="group" aria-label="Session type">
          ${SESSION_TYPES.map(s => `
            <button class="chip ${slot.sessionType === s.id ? "chip--selected" : ""}"
                    data-session-type="${s.id}"
                    aria-pressed="${slot.sessionType === s.id}"
                    style="padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm,6px);
                           font-size:var(--text-sm);cursor:pointer;
                           background:${slot.sessionType === s.id ? "rgba(20,184,166,0.15)" : "var(--color-surface-2,rgba(255,255,255,0.06))"};
                           border:1.5px solid ${slot.sessionType === s.id ? "var(--color-primary)" : "transparent"};">
              ${s.label}
            </button>
          `).join("")}
        </div>

        <p class="text-sm text-muted" style="margin-bottom:var(--space-2);">Target duration</p>
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-4);"
             role="group" aria-label="Session duration">
          <button class="chip ${!slot.durationMins ? "chip--selected" : ""}"
                  data-duration="null" aria-pressed="${!slot.durationMins}"
                  style="padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm,6px);
                         font-size:var(--text-sm);cursor:pointer;
                         background:${!slot.durationMins ? "rgba(20,184,166,0.15)" : "var(--color-surface-2,rgba(255,255,255,0.06))"};
                         border:1.5px solid ${!slot.durationMins ? "var(--color-primary)" : "transparent"};">
            Coach decides
          </button>
          ${DURATION_OPTIONS.map(d => `
            <button class="chip ${slot.durationMins === d ? "chip--selected" : ""}"
                    data-duration="${d}" aria-pressed="${slot.durationMins === d}"
                    style="padding:var(--space-2) var(--space-3);border-radius:var(--radius-sm,6px);
                           font-size:var(--text-sm);cursor:pointer;
                           background:${slot.durationMins === d ? "rgba(20,184,166,0.15)" : "var(--color-surface-2,rgba(255,255,255,0.06))"};
                           border:1.5px solid ${slot.durationMins === d ? "var(--color-primary)" : "transparent"};">
              ${d} min
            </button>
          `).join("")}
        </div>
      ` : ""}

      ${slot.type === "class" ? `
        <div style="margin-bottom:var(--space-4);">
          <label class="form-label" for="class-activity-name"
                 style="display:block;font-size:var(--text-sm);
                        color:var(--color-text-secondary);margin-bottom:var(--space-2);">
            Activity name (optional)
          </label>
          <input type="text" id="class-activity-name" class="form-input"
                 placeholder="e.g. Body Balance, Tennis, Aqua Aerobics"
                 value="${slot.activityName || ""}"
                 aria-label="Class or activity name">
        </div>
      ` : ""}

      <button class="btn btn-primary btn-full" id="day-config-done-btn"
              aria-label="Done configuring ${DAY_LABELS[day]}">
        Done
      </button>
    </div>
  `;
}

function formatRelativeDate(isoString) {
  if (!isoString) return "";
  try {
    const d    = new Date(isoString);
    const now  = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "today";
    if (diff === 1) return "yesterday";
    return diff + " days ago";
  } catch (e) {
    return "";
  }
}

// -- Movement identity --------------------------------------------------------

function renderMovementIdentity() {
  const current = (() => {
    const v = store.get("movementIdentity");
    return Array.isArray(v) ? v : (v ? [v] : []);
  })();
  const selectedLabels = MOVEMENT_IDENTITIES.filter(i => current.includes(i.id)).map(i => i.label);
  return `
    <div class="library-grid" role="group" aria-label="My movement identity">
      ${MOVEMENT_IDENTITIES.map(item => `
        <button class="library-card ${current.includes(item.id) ? "library-card--selected" : ""}"
                data-identity="${item.id}"
                aria-pressed="${current.includes(item.id)}"
                aria-label="${item.label}${current.includes(item.id) ? ", selected" : ""}">
          <span class="library-card-icon" aria-hidden="true">${item.icon}</span>
          <span class="library-card-label">${item.label}</span>
        </button>
      `).join("")}
    </div>
    ${selectedLabels.length > 0 ? `
      <p class="text-sm text-muted movement-identity-note" style="margin-top: var(--space-2);">
        The coach will lean toward
        ${selectedLabels.length === 1
          ? selectedLabels[0]
          : selectedLabels.slice(0, -1).join(", ") + " and " + selectedLabels[selectedLabels.length - 1]}
        suggestions.
      </p>
    ` : ""}
  `;
}

// -- Voice speed --------------------------------------------------------------

function renderSpeechRateSection() {
  const currentRate = store.get("speechRate") || 0.9;
  const currentPos  = rateToPosition(currentRate);
  const label       = speedLabel(currentRate);

  return `
    <div class="card speech-rate-card">
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Sets the speed of the read-aloud feature on coach cards.
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

// -- Notification section -----------------------------------------------------

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
          <span class="notification-label-sub text-sm text-muted">A gentle nudge at the time you choose</span>
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
              To receive reminders, go to your browser settings and allow notifications.
            </p>
          </div>
        ` : (!notif.permissionGranted && "Notification" in window && Notification.permission !== "granted") ? `
          <p class="text-sm text-muted notification-permission-note">
            Your browser will ask for permission to show notifications.
          </p>
        ` : ""}
      ` : `
        <p class="text-sm text-muted" style="margin-top: var(--space-3);">
          Turn on to set a daily reminder to check in.
        </p>
      `}
    </div>
  `;
}

// -- Helpers ------------------------------------------------------------------

function formatGender(gender) {
  const map = { "female": "Female", "male": "Male", "non-binary": "Non-binary", "prefer-not": "Prefer not to say" };
  return map[gender] || "";
}

function switchTab(tabName) {
  activeTab      = tabName;
  editingField   = null;
  configuringDay = null;
  document.querySelectorAll(".settings-tab").forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive);
  });
  const panel = document.getElementById("settings-tab-panel");
  if (panel) {
    panel.setAttribute("aria-labelledby", "tab-" + tabName);
    panel.innerHTML = renderActiveTab();
    wirePanel();
  }
}

function rerenderTab() {
  const panel = document.getElementById("settings-tab-panel");
  if (panel) { panel.innerHTML = renderActiveTab(); wirePanel(); }
}

function rerenderEquipment() {
  const panel = document.getElementById("panel-equipment") || document.getElementById("panel-equipment-sub");
  if (!panel) return;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = equipmentScreen === "facilities" ? renderEquipmentTab() : renderFacilitySubScreen(equipmentScreen);
  const newPanel = wrapper.querySelector("section");
  if (newPanel) { panel.replaceWith(newPanel); onMount(); }
}

function rerenderMyWeek() {
  const panel = document.getElementById("settings-tab-panel");
  if (panel) { panel.innerHTML = renderMyWeekTab(); wirePanel(); }
}

// -- Dev tier panel -----------------------------------------------------------
// Triple-tap the version label to open. Lets you switch Free / Personal / Athlete
// without Stripe. Available in all builds. Changes persist in localStorage.

let _devTapCount = 0;
let _devTapTimer = null;

function showDevPanel() {
  const existing = document.getElementById("dev-tier-panel");
  if (existing) { existing.remove(); return; }

  // Read current tier from store if methods exist, else from raw key
  const current = (typeof store.getUserTier === "function")
    ? store.getUserTier()
    : (store.get("userTier") || store.get("tier") || "free");

  const panel = document.createElement("div");
  panel.id = "dev-tier-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Developer tier switcher");
  panel.style.cssText = [
    "position:fixed;bottom:0;left:0;right:0;z-index:9999;",
    "background:var(--color-surface,#1e293b);",
    "border-top:2px solid var(--color-primary,#14b8a6);",
    "padding:var(--space-5,20px);",
    "box-shadow:0 -4px 24px rgba(0,0,0,0.5);"
  ].join("");

  const tiers = [
    { id: "free",     label: "Free",     desc: "Gated features locked" },
    { id: "personal", label: "Personal", desc: "All core features unlocked" },
    { id: "athlete",  label: "Athlete",  desc: "All features including athlete tier" },
  ];

  panel.innerHTML =
    "<p style=\"font-size:11px;letter-spacing:0.08em;font-weight:700;" +
    "color:var(--color-primary,#14b8a6);margin-bottom:12px;\">DEV -- TIER SWITCHER</p>" +
    "<p style=\"font-size:13px;color:var(--color-text-secondary,#94a3b8);margin-bottom:16px;\">" +
    "Current: <strong style=\"color:var(--color-text,#f1f5f9);\">" + current + "</strong>. " +
    "Changes take effect immediately.</p>" +
    tiers.map(t =>
      "<button data-set-tier=\"" + t.id + "\" style=\"display:block;width:100%;text-align:left;" +
      "padding:10px 14px;margin-bottom:8px;border-radius:8px;cursor:pointer;font-size:13px;" +
      "background:" + (current === t.id ? "rgba(20,184,166,0.15)" : "rgba(255,255,255,0.04)") + ";" +
      "border:1.5px solid " + (current === t.id ? "var(--color-primary,#14b8a6)" : "rgba(255,255,255,0.08)") + ";\">" +
      "<strong>" + t.label + "</strong> <span style=\"color:#94a3b8;\">-- " + t.desc + "</span>" +
      (current === t.id ? " <span style=\"color:var(--color-primary,#14b8a6);\">&#10003;</span>" : "") +
      "</button>"
    ).join("") +
    "<button id=\"dev-panel-close\" style=\"width:100%;padding:10px;margin-top:4px;" +
    "border-radius:8px;cursor:pointer;font-size:13px;" +
    "background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);\">Close</button>";

  document.body.appendChild(panel);

  // Tier buttons
  panel.querySelectorAll("[data-set-tier]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tier = btn.dataset.setTier;
      // Use store method if available, else write raw key
      if (typeof store.setTier === "function") {
        store.setTier(tier);
      } else {
        store.set("userTier", tier);
        store.set("tier", tier);
        store.set("isPremium", tier !== "free");
      }
      panel.remove();
      // Re-render My Week tab so gating updates immediately
      rerenderTab();
      // Toast
      const toast = document.createElement("div");
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.style.cssText = [
        "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);",
        "background:var(--color-primary,#14b8a6);color:#0f172a;",
        "padding:8px 20px;border-radius:999px;font-size:13px;",
        "font-weight:700;z-index:9999;white-space:nowrap;"
      ].join("");
      toast.textContent = "Tier: " + tier;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    });
  });

  document.getElementById("dev-panel-close")?.addEventListener("click", () => panel.remove());
}

// -- Wire all panel elements --------------------------------------------------

function wirePanel() {

  // Profile: open edit
  document.querySelectorAll(".profile-edit-btn").forEach(btn => {
    btn.addEventListener("click", () => { editingField = btn.dataset.field; rerenderTab(); });
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
    editingField = null; rerenderTab();
  });

  // Coach style
  document.querySelectorAll(".coach-style-card").forEach(card => {
    card.addEventListener("click", () => {
      const style = card.dataset.style;
      if (!style) return;
      store.set("coachStyle", style);
      document.querySelectorAll(".coach-style-card").forEach(c => {
        c.classList.toggle("selected", c.dataset.style === style);
        c.setAttribute("aria-checked", c.dataset.style === style);
      });
    });
  });

  // Voice speed
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
      if (posEl)   posEl.textContent   = pos + " / " + SPEED_STEPS;
      slider.setAttribute("aria-valuenow",  pos);
      slider.setAttribute("aria-valuetext", label);
    });
  }

  // Notification
  wireNotificationControls();

  // Conditions: add
  document.querySelectorAll(".condition-add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id      = btn.dataset.conditionId;
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
      store.set("conditions", (store.get("conditions") || []).filter(c => c !== id));
      const scores = store.get("conditionPainScores") || {};
      delete scores[id];
      store.set("conditionPainScores", scores);
      rerenderTab();
    });
  });

  // Equipment: back
  document.getElementById("equip-back-btn")?.addEventListener("click", () => {
    equipmentScreen = "facilities"; rerenderEquipment();
  });

  // Equipment: facility card
  document.querySelectorAll(".equipment-facility-card[data-facility]").forEach(btn => {
    btn.addEventListener("click", () => { equipmentScreen = btn.dataset.facility; rerenderEquipment(); });
  });

  // Equipment: preset toggle
  document.getElementById("equip-preset-toggle")?.addEventListener("click", e => {
    toggleFacility(e.currentTarget.dataset.facility); rerenderEquipment();
  });

  // Equipment: chip toggle
  document.querySelectorAll(".equipment-chip[data-equipment]").forEach(chip => {
    chip.addEventListener("click", () => {
      const id      = chip.dataset.equipment;
      const scope   = chip.dataset.scope;
      const current = getEquipmentForScope(scope);
      const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
      saveEquipmentForScope(scope, updated);
      chip.classList.toggle("selected", updated.includes(id));
      chip.setAttribute("aria-pressed", updated.includes(id));
    });
  });

  // Library: navigation
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
      const id       = btn.dataset.identity;
      if (!id) return;
      const existing = (() => {
        const v = store.get("movementIdentity");
        return Array.isArray(v) ? v : (v ? [v] : []);
      })();
      const updated = existing.includes(id) ? existing.filter(x => x !== id) : [...existing, id];
      store.set("movementIdentity", updated);
      document.querySelectorAll("[data-identity]").forEach(b => {
        b.classList.toggle("library-card--selected", updated.includes(b.dataset.identity));
        b.setAttribute("aria-pressed", updated.includes(b.dataset.identity));
      });
    });
  });

  // Library: open Library page
  document.getElementById("open-library-btn")?.addEventListener("click", () => {
    router.navigate("library");
  });

  // My Week: master toggle
  document.getElementById("weekly-plan-toggle")?.addEventListener("change", e => {
    store.set("weeklyPlanEnabled", e.target.checked);
    rerenderMyWeek();
  });

  // My Week: day card open/close
  document.querySelectorAll(".weekly-plan-day-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const day = btn.dataset.day;
      configuringDay = configuringDay === day ? null : day;
      rerenderMyWeek();
    });
  });

  // My Week: day type selection
  document.querySelectorAll("[data-day-type]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!configuringDay) return;
      const type = btn.dataset.dayType;
      weeklyPlanDraft[configuringDay] = {
        ...weeklyPlanDraft[configuringDay],
        type,
        sessionType:  type === "gym"   ? (weeklyPlanDraft[configuringDay].sessionType  || null) : null,
        durationMins: type === "gym"   ? (weeklyPlanDraft[configuringDay].durationMins || null) : null,
        activityName: type === "class" ? (weeklyPlanDraft[configuringDay].activityName || null) : null,
        label: null,
      };
      rerenderMyWeek();
    });
  });

  // My Week: session type chips
  document.querySelectorAll("[data-session-type]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!configuringDay) return;
      weeklyPlanDraft[configuringDay].sessionType = btn.dataset.sessionType;
      rerenderMyWeek();
    });
  });

  // My Week: duration chips
  document.querySelectorAll("[data-duration]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!configuringDay) return;
      const raw = btn.dataset.duration;
      weeklyPlanDraft[configuringDay].durationMins = raw === "null" ? null : parseInt(raw);
      rerenderMyWeek();
    });
  });

  // My Week: class activity name
  document.getElementById("class-activity-name")?.addEventListener("blur", e => {
    if (!configuringDay) return;
    weeklyPlanDraft[configuringDay].activityName = e.target.value.trim() || null;
  });

  // My Week: day config Done
  document.getElementById("day-config-done-btn")?.addEventListener("click", () => {
    const nameInput = document.getElementById("class-activity-name");
    if (nameInput && configuringDay) {
      weeklyPlanDraft[configuringDay].activityName = nameInput.value.trim() || null;
    }
    configuringDay = null;
    rerenderMyWeek();
  });

  // My Week: save
  document.getElementById("save-week-btn")?.addEventListener("click", () => {
    const nameInput = document.getElementById("class-activity-name");
    if (nameInput && configuringDay) {
      weeklyPlanDraft[configuringDay].activityName = nameInput.value.trim() || null;
    }
    store.set("weeklyPlan", { ...weeklyPlanDraft });
    store.set("weeklyPlanSetAt", new Date().toISOString());
    if (!store.get("weeklyPlanEnabled")) store.set("weeklyPlanEnabled", true);
    configuringDay = null;
    rerenderMyWeek();
    const panel = document.getElementById("settings-tab-panel");
    if (panel) {
      const msg = document.createElement("div");
      msg.setAttribute("role", "status");
      msg.setAttribute("aria-live", "polite");
      msg.style.cssText = "text-align:center;padding:var(--space-3);color:var(--color-primary);font-size:var(--text-sm);";
      msg.textContent = "Your week is saved. I'll use this as my starting point each day.";
      panel.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    }
  });

  // My Week: upgrade prompt
  document.getElementById("upgrade-prompt-btn")?.addEventListener("click", () => {
    router.navigate("upgrade");
  });
}

// -- Notification wiring ------------------------------------------------------

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
  store.set("checkInNotification", { enabled: state.enabled, time: state.time, permissionGranted: state.permissionGranted });
}

function rerenderNotificationSection() {
  const card = document.querySelector(".notification-card");
  if (card?.parentElement) {
    card.parentElement.innerHTML = renderNotificationSection();
    wireNotificationControls();
  }
}

// -- Notification scheduler ---------------------------------------------------

let _notifSchedulerInterval = null;
let _notifLastFiredMinute   = null;

const NOTIFICATION_MESSAGES = [
  { title: "Alongside", body: "Ready when you are. A quick check-in takes less than a minute." },
  { title: "Alongside", body: "How are you feeling today? Your coach is here whenever suits you." },
  { title: "Alongside", body: "Just a gentle nudge. Come check in whenever you are ready." },
  { title: "Alongside", body: "Your check-in is waiting. No rush -- take it at your own pace." },
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
    const nowHHMM = hh + ":" + mm;
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

// -- Mount --------------------------------------------------------------------

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
      activeTab       = "profile";
      editingField    = null;
      configuringDay  = null;
      weeklyPlanDraft = null;
      document.getElementById("bottom-nav")?.classList.add("hidden");
      router.navigate("onboarding/welcome");
    }
  });

  // Dev panel: triple-tap version label
  const versionLabel = document.getElementById("settings-version-label");
  if (versionLabel) {
    versionLabel.addEventListener("click", () => {
      _devTapCount++;
      clearTimeout(_devTapTimer);
      _devTapTimer = setTimeout(() => { _devTapCount = 0; }, 800);
      if (_devTapCount >= 3) {
        _devTapCount = 0;
        showDevPanel();
      }
    });
  }
}
