/**
 * settings.js  —  Settings view
 *
 * v1.6  (S4-2 bug-fix, May 2026)
 *
 * Changes in this version:
 *   1. movementIdentity is now an ARRAY (multi-select).
 *      Store value: [] (empty = none selected) or ["gym","yoga",...].
 *      Legacy string values in store are tolerated on first render.
 *      The click handler toggles items in/out of the array.
 *      The coach engine (coach-proposal.js) reads identityArr.includes(type).
 *   2. My Movement tab — facility presets ("Where do you train?") appear
 *      ABOVE the movement-type identity chips, not below. Tapping a preset
 *      writes a curated equipment array to store and refreshes the chip grid.
 *      This mirrors the screenshot behaviour and gives onboarding users a
 *      one-tap setup path.
 *   3. All previously existing tabs preserved without changes:
 *      Profile / Conditions / Equipment / Library.
 *
 * Tab structure:
 *   Profile      — name, age, gender, weight. Coach style. Voice speed. Notification.
 *   Conditions   — read-only active conditions list.
 *   My Movement  — facility preset cards + movement-identity multi-select chips.
 *   Equipment    — full equipment chip grid (manual add/remove).
 *   Library      — guided sessions, programmes, log an activity.
 */

import { store }          from "../store.js";
import { router }         from "../router.js";
import { getConditionName }    from "../data/conditions.js";
import { EQUIPMENT_CATEGORIES } from "../data/equipment.js";

export const centered = false;

// ── Tab state ─────────────────────────────────────────────────────────────────

let activeTab = "profile";

// ── Coach style definitions ───────────────────────────────────────────────────

const COACH_STYLES = [
  { id: "steady",    label: "Steady",    description: "Calm, consistent, and supportive. Never rushed.",   icon: "\uD83C\uDF3F" },
  { id: "energetic", label: "Energetic", description: "Upbeat, motivating, and enthusiastic.",             icon: "\u26A1"       },
  { id: "minimal",   label: "Minimal",   description: "Short, direct, and to the point. No fluff.",        icon: "\uD83C\uDFAF" },
  { id: "nurturing", label: "Nurturing", description: "Warm, gentle, and emotionally attentive.",          icon: "\uD83D\uDC9B" },
];

// ── Movement identity definitions ─────────────────────────────────────────────

const IDENTITIES = [
  { id: "gym",      label: "Gym / weights",  icon: "\uD83C\uDFCB" },
  { id: "yoga",     label: "Yoga / pilates", icon: "\uD83E\uDDD8" },
  { id: "running",  label: "Running",        icon: "\uD83C\uDFC3" },
  { id: "walking",  label: "Walking",        icon: "\uD83D\uDEB6" },
  { id: "swimming", label: "Swimming",       icon: "\uD83C\uDFCA" },
  { id: "classes",  label: "Classes",        icon: "\uD83C\uDFE5" },
  { id: "mixed",    label: "A mix of things",icon: "\u2728"       },
];

// ── Facility presets ──────────────────────────────────────────────────────────
// Each preset writes a curated equipment array to store.equipment when tapped.
// The array contains item IDs from /js/data/equipment.js.

const FACILITY_PRESETS = [
  {
    id:          "commercial-gym",
    label:       "Commercial gym",
    subtitle:    "Nuffield, PureGym, or similar",
    icon:        "\uD83C\uDFCB",
    equipment:   [
      "barbell", "dumbbells", "cable-machine", "flat-bench", "incline-bench",
      "squat-rack", "leg-press", "kettlebells", "resistance-bands",
      "pull-up-bar", "dip-bars", "treadmill", "rowing-machine",
      "gym-membership", "sauna-steam", "swimming-pool"
    ]
  },
  {
    id:          "home-setup",
    label:       "Home setup",
    subtitle:    "Limited equipment at home",
    icon:        "\uD83C\uDFE0",
    equipment:   [
      "dumbbells", "resistance-bands", "mat", "pull-up-bar"
    ]
  },
  {
    id:          "no-equipment",
    label:       "No equipment",
    subtitle:    "Bodyweight only, anywhere",
    icon:        "\uD83E\uDD38",
    equipment:   []
  },
  {
    id:          "yoga-pilates",
    label:       "Yoga / pilates studio",
    subtitle:    "Mat-based studio",
    icon:        "\uD83E\uDDD8",
    equipment:   [
      "mat", "yoga-blocks", "yoga-wheel", "stretching-strap", "fitness-studio"
    ]
  },
];

// ── Speech rate options ───────────────────────────────────────────────────────

const SPEECH_RATES = [
  { value: 0.6,  label: "1",  description: "Slowest" },
  { value: 0.7,  label: "2",  description: "Very slow" },
  { value: 0.8,  label: "3",  description: "Slow" },
  { value: 0.85, label: "4",  description: "Gentle" },
  { value: 0.9,  label: "5",  description: "Calm" },
  { value: 1.0,  label: "6",  description: "Normal" },
  { value: 1.1,  label: "7",  description: "Brisk" },
  { value: 1.2,  label: "8",  description: "Quick" },
  { value: 1.35, label: "9",  description: "Fast" },
  { value: 1.5,  label: "10", description: "Fastest" },
];

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  // Read requested tab before generating HTML so the correct panel paints first
  const requestedTab = store.get("settingsTab");
  if (requestedTab) activeTab = requestedTab;

  return `
    <div class="view settings-view">

      <div class="view-header">
        <h1>Settings</h1>
      </div>

      <!-- ── Tab bar ──────────────────────────────────────────────────────── -->
      <div class="settings-tabs" role="tablist" aria-label="Settings sections">
        <button class="settings-tab ${activeTab === "profile"    ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "profile"}"
                aria-controls="settings-tab-panel" id="tab-profile"
                data-tab="profile">Profile</button>
        <button class="settings-tab ${activeTab === "conditions" ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "conditions"}"
                aria-controls="settings-tab-panel" id="tab-conditions"
                data-tab="conditions">Conditions</button>
        <button class="settings-tab ${activeTab === "movement"   ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "movement"}"
                aria-controls="settings-tab-panel" id="tab-movement"
                data-tab="movement">My Movement</button>
        <button class="settings-tab ${activeTab === "equipment"  ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "equipment"}"
                aria-controls="settings-tab-panel" id="tab-equipment"
                data-tab="equipment">Equipment</button>
        <button class="settings-tab ${activeTab === "library"    ? "active" : ""}"
                role="tab" aria-selected="${activeTab === "library"}"
                aria-controls="settings-tab-panel" id="tab-library"
                data-tab="library">Library</button>
      </div>

      <!-- ── Tab panel ────────────────────────────────────────────────────── -->
      <div id="settings-tab-panel"
           role="tabpanel"
           aria-labelledby="tab-${activeTab}"
           class="settings-tab-panel">
        ${renderActiveTab()}
      </div>

      <!-- ── Reset zone — always visible ─────────────────────────────────── -->
      <div class="settings-reset-zone">
        <button class="btn btn-primary btn-full" id="gym-programme-btn"
                aria-label="Open my gym programme">
          My Gym Programme
        </button>

        <div class="settings-update-zone" style="margin-top: var(--space-5);">
          <div class="settings-version-row">
            <span class="text-sm text-muted">Version</span>
            <span class="text-sm text-muted" id="settings-version-label">
              ${(typeof window !== "undefined" && window.App?.version) ? window.App.version : ""}
            </span>
          </div>
          <button class="btn btn-ghost btn-full" id="check-update-btn"
                  style="margin-top: var(--space-2);"
                  aria-label="Check for app updates">
            Check for updates
          </button>
          <p id="update-check-status"
             class="update-check-status text-sm"
             aria-live="polite"
             style="margin-top: var(--space-2); min-height: 1.4em;"></p>
        </div>

        <button class="btn btn-text-link btn-full" id="privacy-btn"
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

// ── Tab routing ───────────────────────────────────────────────────────────────

function renderActiveTab() {
  if (activeTab === "profile")    return renderProfileTab();
  if (activeTab === "conditions") return renderConditionsTab();
  if (activeTab === "movement")   return renderMovementTab();
  if (activeTab === "equipment")  return renderEquipmentTab();
  if (activeTab === "library")    return renderLibraryTab();
  return "";
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function renderProfileTab() {
  const name        = store.get("name")       || "Not set";
  const age         = store.get("age");
  const gender      = store.get("gender");
  const weight      = store.get("weight");
  const weightUnit  = store.get("weightUnit") || "kg";
  const coachStyle  = store.get("coachStyle") || "steady";
  const currentRate = parseFloat(store.get("speechRate") || "1.0");

  return `
    <section aria-labelledby="profile-heading">
      <h2 id="profile-heading" class="section-heading">Your profile</h2>
      <div class="card settings-profile-card">
        ${settingsRow("Name",   name)}
        ${settingsRow("Age",    age    ? String(age)             : "Not set")}
        ${settingsRow("Gender", gender ? formatGender(gender)   : "Not set")}
        ${settingsRow("Weight", weight ? weight + weightUnit    : "Not set")}
      </div>

      <h2 class="section-heading" style="margin-top: var(--space-6);">Coach style</h2>
      <p class="text-secondary settings-coach-intro">
        Choose how your coach communicates with you. You can change this any time.
      </p>
      <div class="coach-style-grid" role="radiogroup" aria-label="Coach communication style">
        ${COACH_STYLES.map(s => `
          <button class="coach-style-card ${coachStyle === s.id ? "selected" : ""}"
                  role="radio"
                  aria-checked="${coachStyle === s.id}"
                  data-style="${s.id}"
                  aria-label="${s.label}: ${s.description}">
            <span class="coach-style-icon" aria-hidden="true">${s.icon}</span>
            <span class="coach-style-label">${s.label}</span>
            <span class="coach-style-desc">${s.description}</span>
          </button>
        `).join("")}
      </div>

      <h2 class="section-heading" style="margin-top: var(--space-6);">Coach voice speed</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-3);">
        Tap the speaker icon on any coach message to listen.
      </p>
      <div class="speech-rate-grid" role="radiogroup" aria-label="Coach voice speed">
        ${SPEECH_RATES.map(r => `
          <button class="speech-rate-btn ${currentRate === r.value ? "selected" : ""}"
                  role="radio"
                  aria-checked="${currentRate === r.value}"
                  data-rate="${r.value}"
                  aria-label="Speed ${r.label}: ${r.description}">
            <span class="speech-rate-label">${r.label}</span>
            <span class="speech-rate-desc">${r.description}</span>
          </button>
        `).join("")}
      </div>

      <h2 class="section-heading" style="margin-top: var(--space-6);">Check-in reminder</h2>
      ${renderNotificationSection()}
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

// ── My Movement tab ───────────────────────────────────────────────────────────
//
// Layout:
//   1. MY MOVEMENT heading + "What kind of movement feels most like you?"
//      → Multi-select identity chips (FIX: now toggles array, not single value)
//   2. WHERE DO YOU TRAIN? heading
//      → Facility preset cards (tap to auto-populate equipment)
//   3. Current facility confirmation

function renderMovementTab() {
  // movementIdentity: tolerate legacy string OR new array
  const rawIdentity  = store.get("movementIdentity");
  const currentIds   = Array.isArray(rawIdentity)
    ? rawIdentity
    : (rawIdentity ? [rawIdentity] : []);

  const currentFacility = store.get("facilityPreset") || null;

  return `
    <section aria-labelledby="movement-heading">

      <!-- ── Movement identity ─────────────────────────────────────────── -->
      <h2 id="movement-heading" class="section-heading" style="color: var(--color-primary);">
        MY MOVEMENT
      </h2>
      <p class="text-secondary" style="margin-bottom: var(--space-4);">
        What kind of movement feels most like you?
      </p>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Select everything that applies. The coach uses this alongside your actual
        activity history to shape daily suggestions. You can change it any time.
      </p>

      <div class="library-grid"
           role="group"
           aria-label="Movement identity — select all that apply">
        ${IDENTITIES.map(item => `
          <button class="library-card ${currentIds.includes(item.id) ? "library-card--selected" : ""}"
                  data-identity="${item.id}"
                  aria-pressed="${currentIds.includes(item.id)}"
                  aria-label="${item.label}">
            <span class="library-card-icon" aria-hidden="true">${item.icon}</span>
            <span class="library-card-label">${item.label}</span>
          </button>
        `).join("")}
      </div>

      ${currentIds.length > 0 ? `
        <p class="text-sm text-muted" style="margin-top: var(--space-2);" id="identity-note">
          The coach will lean toward
          ${currentIds.map(id => IDENTITIES.find(i => i.id === id)?.label || id).join(", ")}.
          Your actual activity history will refine this over time.
        </p>
      ` : `
        <p class="text-sm text-muted" style="margin-top: var(--space-2);" id="identity-note">
          Nothing selected yet. The coach will balance suggestions across all types.
        </p>
      `}

      <!-- ── Facility presets ───────────────────────────────────────────── -->
      <h2 class="section-heading" style="margin-top: var(--space-7); color: var(--color-primary);">
        Where do you train?
      </h2>
      <p class="text-secondary" style="margin-bottom: var(--space-4);">
        Choose your facility to pre-fill your equipment. Adjust below as needed.
      </p>

      <div class="facility-preset-grid"
           role="group"
           aria-label="Training facility — choose to pre-fill equipment">
        ${FACILITY_PRESETS.map(preset => `
          <button class="facility-preset-card ${currentFacility === preset.id ? "facility-preset-card--selected" : ""}"
                  data-facility="${preset.id}"
                  aria-pressed="${currentFacility === preset.id}"
                  aria-label="${preset.label}: ${preset.subtitle}">
            <span class="facility-preset-icon" aria-hidden="true">${preset.icon}</span>
            <span class="facility-preset-label">${preset.label}</span>
            <span class="facility-preset-subtitle">${preset.subtitle}</span>
          </button>
        `).join("")}
      </div>

      ${currentFacility ? `
        <p class="text-sm text-muted" style="margin-top: var(--space-3);" id="facility-note">
          Equipment pre-filled for
          ${FACILITY_PRESETS.find(p => p.id === currentFacility)?.label || currentFacility}.
          Fine-tune individual items in the Equipment tab.
        </p>
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
      <p class="text-secondary settings-equipment-intro">
        Tap to add or remove. Changes take effect on your next workout.
        Use the <strong>My Movement</strong> tab to pre-fill by facility.
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
            <div class="equipment-chip-grid"
                 role="group"
                 aria-label="${cat.name} equipment">
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
    </section>
  `;
}

// ── Library tab ───────────────────────────────────────────────────────────────

function renderLibraryTab() {
  const GUIDED = [
    { label: "Breathing practice",  icon: "\uD83C\uDF2C", target: "quiet-session",   quietMode: "breathing", available: true  },
    { label: "Journaling",          icon: "\uD83D\uDCDD", target: "quiet-session",   quietMode: "journal",   available: true  },
    { label: "Mindful movement",    icon: "\uD83C\uDF3F", target: "quiet-session",   quietMode: "mindful",   available: true  },
    { label: "Rest day",            icon: "\uD83D\uDECC", target: "quiet-session",   quietMode: "rest",      available: true  },
    { label: "Yoga / Pilates",      icon: "\uD83E\uDDD8", target: "yoga-session",    quietMode: null,        available: false, comingSoon: true },
    { label: "Core session",        icon: "\uD83D\uDCAA", target: "core-session",    quietMode: null,        available: false, comingSoon: true },
    { label: "Home workout",        icon: "\uD83C\uDFE0", target: "home-workout",    quietMode: null,        available: false, comingSoon: true },
    { label: "Running session",     icon: "\uD83C\uDFC3", target: "running-session", quietMode: null,        available: false, comingSoon: true },
    { label: "Walk / Couch to 5K", icon: "\uD83D\uDEB6", target: "walk-programme",  quietMode: null,        available: false, comingSoon: true },
  ];

  const PROGRAMMES = [
    { label: "My gym programme",        icon: "\uD83C\uDFCB", target: "gym-programme" },
    { label: "My prescribed exercises", icon: "\uD83E\uDE7A", target: "prescribed"    },
  ];

  const LOG_ACTIVITIES = [
    { group: "Cardio", items: [
      { label: "Run",          icon: "\uD83C\uDFC3", id: "run"    },
      { label: "Walk",         icon: "\uD83D\uDEB6", id: "walk"   },
      { label: "Cycle",        icon: "\uD83D\uDEB4", id: "cycle"  },
      { label: "Swim",         icon: "\uD83C\uDFCA", id: "swim"   },
      { label: "Row",          icon: "\uD83D\uDEA3", id: "row"    },
    ]},
    { group: "Classes", items: [
      { label: "Body Balance", icon: "\uD83E\uDDD8", id: "body-balance" },
      { label: "Spin / cycle", icon: "\uD83D\uDEB4", id: "spin"         },
      { label: "Boxing",       icon: "\uD83E\uDD4A", id: "boxing"       },
      { label: "HIIT / circuits", icon: "\uD83D\uDD25", id: "hiit"      },
      { label: "Body Combat",  icon: "\uD83E\uDD4A", id: "body-combat"  },
      { label: "Other class",  icon: "\uD83C\uDFE5", id: "class"        },
    ]},
    { group: "Sport", items: [
      { label: "Tennis",       icon: "\uD83C\uDFBE", id: "tennis"   },
      { label: "Football",     icon: "\u26BD",       id: "football" },
      { label: "Golf",         icon: "\u26F3",       id: "golf"     },
      { label: "Other sport",  icon: "\uD83C\uDFC6", id: "sport"    },
    ]},
    { group: "Outdoor", items: [
      { label: "Hike",          icon: "\u26F0",      id: "hike"          },
      { label: "Outdoor cycle", icon: "\uD83D\uDEB4",id: "outdoor-cycle" },
      { label: "Other outdoor", icon: "\uD83C\uDF32",id: "outdoor"       },
    ]},
  ];

  return `
    <section class="settings-section library-section" aria-label="Library">

      <h2 class="section-heading">Guided Sessions</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        The coach leads. Tap any session to go straight in.
      </p>
      <div class="library-grid">
        ${GUIDED.map(item => `
          <button class="library-card ${!item.available ? "library-card--soon" : ""}"
                  ${item.available
                    ? `data-target="${item.target}" data-quiet="${item.quietMode || ""}"`
                    : `disabled aria-disabled="true"`}
                  aria-label="${item.label}${item.comingSoon ? " \u2014 coming soon" : ""}">
            <span class="library-card-icon" aria-hidden="true">${item.icon}</span>
            <span class="library-card-label">${item.label}</span>
            ${item.comingSoon ? `<span class="library-soon-badge" aria-hidden="true">Soon</span>` : ""}
          </button>
        `).join("")}
      </div>

      <h2 class="section-heading" style="margin-top: var(--space-6);">Programmes</h2>
      <div class="library-grid">
        ${PROGRAMMES.map(item => `
          <button class="library-card"
                  data-target="${item.target}"
                  aria-label="${item.label}">
            <span class="library-card-icon" aria-hidden="true">${item.icon}</span>
            <span class="library-card-label">${item.label}</span>
          </button>
        `).join("")}
      </div>

      <h2 class="section-heading" style="margin-top: var(--space-6);">My movement identity</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-3);">
        Tell the coach what kind of movement feels most like you.
        This shapes what the coach suggests first each day.
        Full settings in the My Movement tab.
      </p>
      ${renderMovementIdentityMini()}

      <h2 class="section-heading" style="margin-top: var(--space-6);">Log an Activity</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        You know what you are doing. Log it and the coach will reflect on it with you.
      </p>
      ${LOG_ACTIVITIES.map(group => `
        <h3 class="library-group-heading">${group.group}</h3>
        <div class="library-grid library-grid--compact">
          ${group.items.map(item => `
            <button class="library-card library-card--compact"
                    data-target="activity-log"
                    data-activity="${item.id}"
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

// Mini movement identity widget used inside the Library tab
function renderMovementIdentityMini() {
  const rawIdentity = store.get("movementIdentity");
  const currentIds  = Array.isArray(rawIdentity)
    ? rawIdentity
    : (rawIdentity ? [rawIdentity] : []);

  return `
    <div class="library-grid"
         role="group"
         aria-label="Movement identity — select all that apply">
      ${IDENTITIES.map(item => `
        <button class="library-card ${currentIds.includes(item.id) ? "library-card--selected" : ""}"
                data-identity="${item.id}"
                aria-pressed="${currentIds.includes(item.id)}"
                aria-label="${item.label}">
          <span class="library-card-icon" aria-hidden="true">${item.icon}</span>
          <span class="library-card-label">${item.label}</span>
        </button>
      `).join("")}
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
          <input type="checkbox"
                 id="notif-toggle"
                 role="switch"
                 aria-checked="${enabled}"
                 ${enabled ? "checked" : ""}>
          <span class="toggle-track" aria-hidden="true"></span>
        </label>
      </div>

      ${enabled ? `
        <div class="notification-time-row" id="notif-time-row">
          <label class="form-label" for="notif-time">Remind me at</label>
          <input type="time"
                 id="notif-time"
                 class="form-input notif-time-input"
                 value="${notif.time || "08:00"}"
                 aria-label="Check-in reminder time">
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

function settingsRow(label, value) {
  return `
    <div class="settings-row">
      <span class="settings-label">${label}</span>
      <span class="settings-value">${value}</span>
    </div>
  `;
}

function formatGender(g) {
  const map = { "female": "Female", "male": "Male", "non-binary": "Non-binary", "prefer-not": "Prefer not to say" };
  return map[g] || "Not set";
}

// ── Tab switching ─────────────────────────────────────────────────────────────

function switchTab(tabName) {
  activeTab = tabName;
  document.querySelectorAll(".settings-tab").forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });
  const panel = document.getElementById("settings-tab-panel");
  if (panel) {
    panel.setAttribute("aria-labelledby", "tab-" + tabName);
    panel.innerHTML = renderActiveTab();
    wirePanel();
  }
}

// ── wirePanel — event listeners for the active tab panel ─────────────────────

function wirePanel() {

  // Coach style (radio — single select)
  document.querySelectorAll(".coach-style-card").forEach(card => {
    card.addEventListener("click", () => {
      const style = card.dataset.style;
      if (!style) return;
      store.set("coachStyle", style);
      document.querySelectorAll(".coach-style-card").forEach(c => {
        const sel = c.dataset.style === style;
        c.classList.toggle("selected", sel);
        c.setAttribute("aria-checked", String(sel));
      });
    });
  });

  // Movement identity chips (multi-select — FIX)
  document.querySelectorAll("[data-identity]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id       = btn.dataset.identity;
      const rawVal   = store.get("movementIdentity");
      const current  = Array.isArray(rawVal) ? rawVal : (rawVal ? [rawVal] : []);
      const updated  = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id];
      store.set("movementIdentity", updated);

      // Update all identity buttons in the DOM (may appear in both My Movement and Library tabs)
      document.querySelectorAll("[data-identity]").forEach(b => {
        const sel = updated.includes(b.dataset.identity);
        b.classList.toggle("library-card--selected", sel);
        b.setAttribute("aria-pressed", String(sel));
      });

      // Refresh the note text if present
      const noteEl = document.getElementById("identity-note");
      if (noteEl) {
        if (updated.length > 0) {
          noteEl.textContent = "The coach will lean toward " +
            updated.map(i => IDENTITIES.find(x => x.id === i)?.label || i).join(", ") +
            ". Your actual activity history will refine this over time.";
        } else {
          noteEl.textContent = "Nothing selected yet. The coach will balance suggestions across all types.";
        }
      }
    });
  });

  // Facility preset cards (FIX — new)
  document.querySelectorAll("[data-facility]").forEach(card => {
    card.addEventListener("click", () => {
      const facilityId = card.dataset.facility;
      const preset     = FACILITY_PRESETS.find(p => p.id === facilityId);
      if (!preset) return;

      store.set("facilityPreset", facilityId);
      store.set("equipment", [...preset.equipment]);

      // Update selected state on all facility cards
      document.querySelectorAll("[data-facility]").forEach(c => {
        const sel = c.dataset.facility === facilityId;
        c.classList.toggle("facility-preset-card--selected", sel);
        c.setAttribute("aria-pressed", String(sel));
      });

      // Update the confirmation note
      const noteEl = document.getElementById("facility-note");
      if (noteEl) {
        noteEl.textContent = "Equipment pre-filled for " + preset.label +
          ". Fine-tune individual items in the Equipment tab.";
      } else {
        // Note may not exist yet (first tap) — re-render only the facility section
        const section = card.closest("section");
        if (section) {
          // Lightweight: just append the note paragraph
          const p = document.createElement("p");
          p.id = "facility-note";
          p.className = "text-sm text-muted";
          p.style.marginTop = "var(--space-3)";
          p.textContent = "Equipment pre-filled for " + preset.label +
            ". Fine-tune individual items in the Equipment tab.";
          card.closest(".facility-preset-grid").insertAdjacentElement("afterend", p);
        }
      }
    });
  });

  // Library cards — navigate to target
  document.querySelectorAll(".library-card[data-target]").forEach(card => {
    card.addEventListener("click", () => {
      const target    = card.dataset.target;
      const quietMode = card.dataset.quiet || null;
      const activity  = card.dataset.activity || null;
      if (quietMode) store.set("quietMode", quietMode);
      if (activity)  store.set("logActivityType", activity);
      router.navigate(target);
    });
  });

  // Speech rate
  document.querySelectorAll(".speech-rate-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const rate = parseFloat(btn.dataset.rate);
      if (isNaN(rate)) return;
      store.set("speechRate", rate);
      document.querySelectorAll(".speech-rate-btn").forEach(b => {
        const sel = parseFloat(b.dataset.rate) === rate;
        b.classList.toggle("selected", sel);
        b.setAttribute("aria-checked", String(sel));
      });
    });
  });

  // Notification controls
  wireNotificationControls();

  // Equipment chips
  document.querySelectorAll(".equipment-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const id         = chip.dataset.equipmentId;
      if (!id) return;
      const current    = store.get("equipment") || [];
      const isSelected = current.includes(id);
      const updated    = isSelected
        ? current.filter(e => e !== id)
        : [...current, id];
      store.set("equipment", updated);
      chip.classList.toggle("selected", !isSelected);
      chip.setAttribute("aria-pressed", String(!isSelected));
      updateCategoryCount(chip);
    });
  });
}

function updateCategoryCount(chip) {
  const categoryEl = chip.closest(".equipment-settings-category");
  if (!categoryEl) return;
  const chips    = categoryEl.querySelectorAll(".equipment-chip");
  const count    = Array.from(chips).filter(c => c.classList.contains("selected")).length;
  const heading  = categoryEl.querySelector(".equipment-category-heading");
  if (!heading) return;
  const existing = heading.querySelector(".equipment-cat-count");
  if (existing) existing.remove();
  if (count > 0) {
    const badge = document.createElement("span");
    badge.className   = "equipment-cat-count";
    badge.textContent = count + " selected";
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

      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
        saveNotificationState({ enabled: true, time: "08:00", permissionGranted: true });
        startNotificationScheduler();
      } else {
        saveNotificationState({ enabled: true, time: null, permissionGranted: false });
      }
      rerenderNotificationSection();
    });
  }

  if (timeInput) {
    timeInput.addEventListener("change", () => {
      const notif = store.get("checkInNotification") || {};
      notif.time  = timeInput.value;
      store.set("checkInNotification", notif);
    });
  }
}

function saveNotificationState(state) {
  store.set("checkInNotification", state);
}

function rerenderNotificationSection() {
  const card = document.querySelector(".notification-card");
  if (card) card.outerHTML = renderNotificationSection();
  wireNotificationControls();
}

let notifSchedulerInterval = null;

function startNotificationScheduler() {
  if (notifSchedulerInterval) clearInterval(notifSchedulerInterval);
  notifSchedulerInterval = setInterval(() => {
    const notif = store.get("checkInNotification");
    if (!notif?.enabled || !notif?.permissionGranted || !notif?.time) return;
    const now  = new Date();
    const hhmm = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
    if (hhmm === notif.time) {
      new Notification("Time to check in", {
        body: "A quick check-in takes under two minutes.",
        icon: "assets/images/logo-icon-128.png"
      });
    }
  }, 60000);
}

// ── onMount ───────────────────────────────────────────────────────────────────

export function onMount() {
  // Clear requested tab flag now that the panel has rendered
  const requestedTab = store.get("settingsTab");
  if (requestedTab) {
    store.set("settingsTab", null);
    if (requestedTab !== activeTab) {
      activeTab = requestedTab;
    }
  }

  // Tab switching
  document.querySelectorAll(".settings-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const name = tab.dataset.tab;
      if (name && name !== activeTab) switchTab(name);
    });
  });

  // Wire panel elements
  wirePanel();

  // Resume notification scheduler if already enabled
  const notif = store.get("checkInNotification");
  if (notif?.enabled && notif?.permissionGranted) {
    startNotificationScheduler();
  }

  // Gym programme shortcut
  document.getElementById("gym-programme-btn")?.addEventListener("click", () => {
    router.navigate("gym-programme");
  });

  // Check for updates
  document.getElementById("check-update-btn")?.addEventListener("click", async () => {
    const btn      = document.getElementById("check-update-btn");
    const statusEl = document.getElementById("update-check-status");
    if (btn)      { btn.textContent = "Checking..."; btn.disabled = true; }
    if (statusEl) statusEl.textContent = "";
    const result = await window.App?.checkForUpdate?.() || "unavailable";
    window.App?.showUpdateCheckResult?.(result);
    if (btn)      { btn.textContent = "Check for updates"; btn.disabled = false; }
  });

  // Privacy policy
  document.getElementById("privacy-btn")?.addEventListener("click", () => {
    router.navigate("privacy");
  });

  // Reset app
  document.getElementById("reset-app-btn")?.addEventListener("click", () => {
    if (confirm("This will delete all your data and start fresh. Are you sure?")) {
      store.reset();
      activeTab = "profile";
      document.getElementById("bottom-nav")?.classList.add("hidden");
      router.navigate("onboarding/welcome");
    }
  });
}
