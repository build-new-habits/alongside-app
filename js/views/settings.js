/**
 * settings.js - Settings view
 *
 * 21 Jun 2026 v3 (S4-15/16) — Wellbeing tab added:
 *   New sixth tab "Wellbeing" covering:
 *   1. Auto-tagging toggle (journalSettings.autoTagging) — all users.
 *      When on, journal entries are keyword-tagged on save. When off,
 *      tags is empty and user-only.
 *   2. Weekly reflection schedule (noticingPreferences.schedule + time)
 *      — all users. 'automatic' (default) fires on first check-in of
 *      the calendar week; any day name fires on that day at the chosen
 *      time (defaults to 10:00 if not set).
 *   3. Journal categories (journalSettings.categoryPrefs) — tier gated:
 *      Free: read-only display of the 5 always categories (life, movement,
 *      environment, nature, health). Personal+: can add from the 7 optional
 *      categories (relationships, work, creativity, sleep, body, gratitude,
 *      growth) one at a time. The 2 triggered categories (grief, joy) are
 *      never shown here — the coach surfaces them from check-in patterns.
 *   No schema changes — all fields were added in store.js v4 (S4-NH-SCHEMA).
 *
 * 14 Jun 2026 v2 --- My Week tab simplified (S4-WP).
 * 30 May 2026 v1 --- My Week tab redesign.
 * 22 May 2026 v2 --- Dev tier panel added.
 * 22 May 2026 v1 --- My Week tab added (S4-3).
 * 18 May 2026 v1 --- Editable profile, facility presets, conditions, Library.
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

// -- Journal categories -------------------------------------------------------

const JOURNAL_CATEGORIES_ALWAYS = [
  { id: "life",        label: "Life",        desc: "Day-to-day thoughts, priorities, what's on your mind" },
  { id: "movement",    label: "Movement",    desc: "Your relationship with physical activity" },
  { id: "environment", label: "Environment", desc: "The spaces you move and live in" },
  { id: "nature",      label: "Nature",      desc: "The world around you — weather, seasons, outdoor spaces" },
  { id: "health",      label: "Health",      desc: "Rest, recovery, how your body is doing" },
];

const JOURNAL_CATEGORIES_OPTIONAL = [
  { id: "relationships", label: "Relationships", desc: "People in your life, connection, support" },
  { id: "work",          label: "Work",          desc: "Your working life and what it costs or gives you" },
  { id: "creativity",    label: "Creativity",    desc: "Making things, play, what you do for yourself" },
  { id: "sleep",         label: "Sleep",         desc: "Rest quality, what disrupts or helps it" },
  { id: "body",          label: "Body",          desc: "Gratitude for what your body does, relationship with it" },
  { id: "gratitude",     label: "Gratitude",     desc: "What went right, who helped, what you appreciate" },
  { id: "growth",        label: "Growth",        desc: "What you're learning, where you're changing" },
];

// -- Noticing schedule --------------------------------------------------------

const SCHEDULE_OPTIONS = [
  { id: "automatic", label: "First check-in of the week", desc: "Prompt appears the day after your first check-in each week" },
  { id: "monday",    label: "Monday",    desc: "" },
  { id: "tuesday",   label: "Tuesday",   desc: "" },
  { id: "wednesday", label: "Wednesday", desc: "" },
  { id: "thursday",  label: "Thursday",  desc: "" },
  { id: "friday",    label: "Friday",    desc: "" },
  { id: "saturday",  label: "Saturday",  desc: "" },
  { id: "sunday",    label: "Sunday",    desc: "" },
];

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

// -- Tier helpers -------------------------------------------------------------

function isPremium() {
  if (typeof store.isPremium === "function") return store.isPremium();
  const tier = store.get("userTier") || store.get("tier") || "free";
  return tier !== "free";
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
        <button class="settings-tab ${activeTab === "wellbeing"  ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "wellbeing"}"
                aria-controls="settings-tab-panel" id="tab-wellbeing" data-tab="wellbeing">
          Wellbeing
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
  if (activeTab === "wellbeing")  return renderWellbeingTab();
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
  return `
    <section aria-labelledby="myweek-heading">
      <h2 id="myweek-heading" class="section-heading">My Week</h2>

      <div class="card settings-coach-card" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="text-sm">
          Plan what each day of your week looks like -- workouts, rest, recovery,
          classes, or events. I will use it as my starting point each day and
          adapt around how you are feeling when the day comes.
        </p>
      </div>

      <button class="btn btn-primary btn-full btn-large" id="open-myweek-btn"
              aria-label="Open My Week">
        Open My Week &rarr;
      </button>
    </section>
  `;
}

// -- Wellbeing tab ------------------------------------------------------------

function renderWellbeingTab() {
  const premium       = isPremium();
  const autoTagging   = store.get("journalSettings.autoTagging") !== false; // default true
  const categoryPrefs = store.get("journalSettings.categoryPrefs") ||
                        ["life", "movement", "environment", "nature", "health"];
  const schedule      = store.get("noticingPreferences.schedule") || "automatic";
  const scheduleTime  = store.get("noticingPreferences.time") || "10:00";

  return `
    <section aria-labelledby="wellbeing-heading">
      <h2 id="wellbeing-heading" class="section-heading">Wellbeing</h2>

      <!-- ── Journal tags ──────────────────────────────────────── -->
      <h3 class="section-heading"
          style="font-size: var(--text-sm); margin: var(--space-2) 0 var(--space-3);">
        Journal auto-tagging
      </h3>
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;
                    gap: var(--space-4);">
          <div style="flex: 1; min-width: 0;">
            <p class="text-sm" style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">
              Auto-tag journal entries
            </p>
            <p class="text-sm text-muted">
              When on, the coach adds keyword tags to your entries automatically.
              You can always remove tags manually.
            </p>
          </div>
          <label class="toggle-switch" aria-label="Enable auto-tagging">
            <input type="checkbox" id="wellbeing-autotag-toggle" role="switch"
                   aria-checked="${autoTagging}" ${autoTagging ? "checked" : ""}>
            <span class="toggle-track" aria-hidden="true"></span>
          </label>
        </div>
      </div>

      <!-- ── Journal categories ────────────────────────────────── -->
      <h3 class="section-heading"
          style="font-size: var(--text-sm); margin: var(--space-5) 0 var(--space-2);">
        Journal categories
      </h3>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-3);">
        These categories shape which prompts the coach offers in guided journalling.
      </p>

      <!-- Always-on categories (all users) -->
      <p class="text-xs text-muted" style="margin-bottom: var(--space-2);">
        Always included
      </p>
      <div class="equipment-chip-grid" style="margin-bottom: var(--space-4);"
           role="group" aria-label="Always included journal categories">
        ${JOURNAL_CATEGORIES_ALWAYS.map(cat => `
          <button class="equipment-chip selected"
                  style="cursor: default; opacity: 0.8;"
                  aria-pressed="true"
                  aria-label="${cat.label} — always included"
                  title="${cat.desc}"
                  disabled>
            ${cat.label}
          </button>
        `).join("")}
      </div>

      <!-- Optional categories (Premium only) -->
      ${premium ? `
        <p class="text-xs text-muted" style="margin-bottom: var(--space-2);">
          Optional — tap to add or remove
        </p>
        <div class="equipment-chip-grid" style="margin-bottom: var(--space-2);"
             role="group" aria-label="Optional journal categories">
          ${JOURNAL_CATEGORIES_OPTIONAL.map(cat => {
            const active = categoryPrefs.includes(cat.id);
            return `
              <button class="equipment-chip wellbeing-category-chip ${active ? "selected" : ""}"
                      data-category="${cat.id}"
                      aria-pressed="${active}"
                      aria-label="${cat.label}${active ? ", active" : ", tap to add"}"
                      title="${cat.desc}">
                ${cat.label}
              </button>
            `;
          }).join("")}
        </div>
        <p class="text-xs text-muted">
          Add categories that matter to you. The coach introduces them gradually,
          not all at once.
        </p>
      ` : `
        <div class="card" style="margin-bottom: var(--space-2);">
          <p class="text-sm text-muted">
            Seven additional categories — relationships, work, creativity, sleep,
            body, gratitude, and growth — are available on the Personal plan.
          </p>
          <button class="btn btn-ghost btn-small" id="wellbeing-upgrade-btn"
                  style="margin-top: var(--space-3);"
                  aria-label="Upgrade to Personal plan">
            Upgrade to Personal &rarr;
          </button>
        </div>
      `}

      <!-- ── Weekly reflection schedule ────────────────────────── -->
      <h3 class="section-heading"
          style="font-size: var(--text-sm); margin: var(--space-6) 0 var(--space-2);">
        Weekly reflection
      </h3>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-3);">
        When should your weekly noticing prompt appear?
      </p>

      <div class="card" style="padding: var(--space-1) 0;">
        ${SCHEDULE_OPTIONS.map(opt => `
          <label class="wellbeing-schedule-row"
                 style="display: flex; align-items: center; gap: var(--space-3);
                        padding: var(--space-3) var(--space-4); cursor: pointer;">
            <input type="radio" name="noticing-schedule" value="${opt.id}"
                   id="schedule-${opt.id}"
                   ${schedule === opt.id ? "checked" : ""}
                   aria-label="${opt.label}${opt.desc ? ": " + opt.desc : ""}"
                   class="wellbeing-schedule-radio">
            <span style="flex: 1;">
              <span class="text-sm" style="font-weight: ${schedule === opt.id ? "var(--font-semibold)" : "normal"};">
                ${opt.label}
              </span>
              ${opt.desc
                ? `<span class="text-xs text-muted" style="display: block; margin-top: 2px;">${opt.desc}</span>`
                : ""}
            </span>
          </label>
        `).join("")}
      </div>

      <!-- Time picker — only shown when a specific day is selected -->
      ${schedule !== "automatic" ? `
        <div class="card" style="margin-top: var(--space-3);">
          <label class="form-label" for="wellbeing-schedule-time"
                 style="font-size: var(--text-sm); font-weight: var(--font-semibold);
                        display: block; margin-bottom: var(--space-2);">
            Time
          </label>
          <input type="time" id="wellbeing-schedule-time"
                 class="form-input"
                 value="${scheduleTime}"
                 aria-label="Reflection reminder time"
                 style="width: 100%; box-sizing: border-box;">
          <p class="text-xs text-muted" style="margin-top: var(--space-2);">
            The reflection prompt will appear in the Noticing tab on
            ${schedule.charAt(0).toUpperCase() + schedule.slice(1)}s at this time.
          </p>
        </div>
      ` : ""}

    </section>
  `;
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

function rerenderWellbeing() {
  const panel = document.getElementById("settings-tab-panel");
  if (panel && activeTab === "wellbeing") {
    panel.innerHTML = renderWellbeingTab();
    wireWellbeingPanel();
  }
}

// -- Dev tier panel -----------------------------------------------------------

let _devTapCount = 0;
let _devTapTimer = null;

function showDevPanel() {
  const existing = document.getElementById("dev-tier-panel");
  if (existing) { existing.remove(); return; }

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

  panel.querySelectorAll("[data-set-tier]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tier = btn.dataset.setTier;
      if (typeof store.setTier === "function") {
        store.setTier(tier);
      } else {
        store.set("userTier", tier);
        store.set("tier", tier);
        store.set("isPremium", tier !== "free");
      }
      panel.remove();
      rerenderTab();
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

// -- Wellbeing panel wiring ---------------------------------------------------

function wireWellbeingPanel() {

  // Auto-tagging toggle
  const autotagToggle = document.getElementById("wellbeing-autotag-toggle");
  if (autotagToggle) {
    autotagToggle.addEventListener("change", () => {
      store.set("journalSettings.autoTagging", autotagToggle.checked);
    });
  }

  // Optional category chips (Premium only)
  document.querySelectorAll(".wellbeing-category-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const catId  = chip.dataset.category;
      if (!catId) return;
      const always = JOURNAL_CATEGORIES_ALWAYS.map(c => c.id);
      const current = store.get("journalSettings.categoryPrefs") || [...always];
      const updated = current.includes(catId)
        ? current.filter(id => id !== catId)
        : [...current, catId];
      // Never remove an always-on category
      const safe = [...new Set([...always, ...updated.filter(id => !always.includes(id))])];
      // But do allow optional ones to be toggled
      const final = safe.filter(id => always.includes(id) || updated.includes(id));
      store.set("journalSettings.categoryPrefs", final);
      chip.classList.toggle("selected", final.includes(catId));
      chip.setAttribute("aria-pressed", final.includes(catId));
    });
  });

  // Schedule radio buttons
  document.querySelectorAll(".wellbeing-schedule-radio").forEach(radio => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      store.set("noticingPreferences.schedule", radio.value);
      // Rerender to show/hide time picker
      rerenderWellbeing();
    });
  });

  // Time picker
  const timePicker = document.getElementById("wellbeing-schedule-time");
  if (timePicker) {
    timePicker.addEventListener("change", () => {
      if (timePicker.value) {
        store.set("noticingPreferences.time", timePicker.value);
      }
    });
  }

  // Upgrade button (Free tier)
  document.getElementById("wellbeing-upgrade-btn")?.addEventListener("click", () => {
    router.navigate("upgrade");
  });
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

  // My Week: open the My Week view
  document.getElementById("open-myweek-btn")?.addEventListener("click", () => {
    router.navigate("weekly-plan");
  });

  // Wellbeing tab
  if (activeTab === "wellbeing") wireWellbeingPanel();
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
