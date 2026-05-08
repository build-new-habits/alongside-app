/**
 * settings.js - Settings view
 *
 * 8 May 2026 v2
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
const FACILITY_PRESETS = [
  {
    id:    "gym-full",
    label: "Full gym",
    icon:  "🏋",
    fills: [
      "barbell", "dumbbells", "bench", "cable-machine", "leg-press",
      "pull-up-bar", "resistance-bands", "kettlebell", "foam-roller",
      "gym-membership"
    ]
  },
  {
    id:    "swimming-pool",
    label: "Swimming pool",
    icon:  "🏊",
    fills: ["swimming-pool"]
  },
  {
    id:    "fitness-studio",
    label: "Fitness studio",
    icon:  "🏥",
    fills: ["fitness-studio", "yoga-mat", "resistance-bands"]
  },
  {
    id:    "home-setup",
    label: "Home setup",
    icon:  "🏠",
    fills: ["dumbbells", "resistance-bands", "yoga-mat", "foam-roller", "pull-up-bar"]
  },
  {
    id:    "no-equipment",
    label: "No equipment",
    icon:  "🚶",
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
  const selected = store.get("equipment") || [];

  return `
    <section aria-labelledby="equipment-heading">
      <h2 id="equipment-heading" class="section-heading">Your equipment</h2>

      <p class="text-secondary text-sm settings-equipment-intro">
        Tap your setup to auto-fill common equipment, then adjust individually below.
      </p>
      <div class="facility-preset-grid" role="group" aria-label="Choose your setup type">
        ${FACILITY_PRESETS.map(preset => `
          <button class="facility-preset-btn" data-preset="${preset.id}"
                  aria-label="${preset.label} — auto-fill equipment">
            <span class="facility-preset-icon" aria-hidden="true">${preset.icon}</span>
            <span class="facility-preset-label">${preset.label}</span>
          </button>
        `).join("")}
      </div>

      <p class="text-secondary text-sm" style="margin: var(--space-5) 0 var(--space-2);">
        Or pick individually. Changes take effect on your next workout.
      </p>

      <div id="equipment-chip-section">
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
                  <button class="equipment-chip ${selected.includes(item.id) ? "selected" : ""}"
                          data-equipment-id="${item.id}"
                          aria-pressed="${selected.includes(item.id)}">
                    ${item.name}
                  </button>
                `).join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

// ── Library tab ───────────────────────────────────────────────────────────────

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

      ${LOG_ACTIVITIES.map(group => `
        <h3 class="library-group-heading">${group.group}</h3>
        <div class="library-grid library-grid--compact">
          ${group.items.map(item => `
            <button class="library-card library-card--compact"
                    data-log-activity="${item.id}"
                    aria-label="Log ${item.label}">
              <span class="library-card-icon" aria-hidden="true">${item.icon}</span>
              <span class="library-card-label">${item.label}</span>
            </button>
          `).join("")}
        </div>
      `).join("")}

    </section>
  `;
}

// ── Movement identity ─────────────────────────────────────────────────────────

function renderMovementIdentity() {
  const current = store.get("movementIdentity") || null;
  return `
    <div class="library-grid" role="group" aria-label="My movement identity">
      ${MOVEMENT_IDENTITIES.map(item => `
        <button class="library-card ${current === item.id ? "library-card--selected" : ""}"
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

  // Equipment: facility presets
  document.querySelectorAll(".facility-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const preset = FACILITY_PRESETS.find(p => p.id === btn.dataset.preset);
      if (!preset) return;
      const current = store.get("equipment") || [];
      store.set("equipment", Array.from(new Set([...current, ...preset.fills])));
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

  // Library: log activity
  document.querySelectorAll("[data-log-activity]").forEach(btn => {
    btn.addEventListener("click", () => {
      const activityId = btn.dataset.logActivity;
      if (!activityId) return;
      store.set("pendingLogActivity", activityId);
      router.navigate("reflect");
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
