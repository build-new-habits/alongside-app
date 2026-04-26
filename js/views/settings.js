/**
 * settings.js - Settings view
 *
 * v1.4 — App version display and update check button (S3-6):
 *   "Check for updates" button added to the reset zone (always visible,
 *   not inside a tab). Calls window.App.checkForUpdate() which triggers
 *   a service worker update check. Result shown inline below the button.
 *   Version string displayed from window.App.version (set in app.js).
 *
 * v1.3 — Check-in notification (S3-6):
 *   Opted-in reminder added to Profile tab.
 *   Toggle shows time picker only when enabled.
 *   Requests browser Notification permission on enable.
 *   If denied: calm explanation shown, no automatic re-prompt.
 *   Scheduling: setInterval polling every 60s checks against user's chosen time.
 *   Single notification type only. Warm tone. User-revocable.
 *   PROHIBITED patterns (never implemented here): streak framing, guilt framing,
 *   re-prompting after denial, multiple notification types.
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
  // Check if a specific tab was requested (e.g. Library from coach proposal).
  // Must be read here in render() — not just in onMount() — so the initial
  // HTML paint shows the correct tab panel without a flash of the wrong content.
  const requestedTab = store.get("settingsTab");
  if (requestedTab) {
    activeTab = requestedTab;
    // Do not clear here — onMount() will clear it after confirming
  }

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
        >My Movement</button>
        <button
          class="settings-tab ${activeTab === "library" ? "active" : ""}"
          role="tab"
          aria-selected="${activeTab === "library"}"
          aria-controls="settings-tab-panel"
          id="tab-library"
          data-tab="library"
        >Library</button>
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

        <!-- ── App version and update check ─────────────────────────────── -->
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
  if (activeTab === "equipment")  return renderMyMovementTab();
  if (activeTab === "library")    return renderLibraryTab();
  return "";
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function renderProfileTab() {
  const name       = store.get("name")       || "";
  const ageBand    = store.get("ageBand")    || "";
  const gender     = store.get("gender")     || "";
  const weight     = store.get("weight")     || "";
  const weightUnit = store.get("weightUnit") || "kg";
  const coachStyle = store.get("coachStyle") || "steady";

  const AGE_BANDS = [
    { id: "under-18",   label: "Under 18" },
    { id: "18-24",      label: "18-24" },
    { id: "25-34",      label: "25-34" },
    { id: "35-44",      label: "35-44" },
    { id: "45-54",      label: "45-54" },
    { id: "55-64",      label: "55-64" },
    { id: "65-plus",    label: "65+" },
    { id: "prefer-not", label: "Prefer not to say" }
  ];

  const GENDERS = [
    { id: "male",        label: "Male" },
    { id: "female",      label: "Female" },
    { id: "non-binary",  label: "Non-binary" },
    { id: "prefer-not",  label: "Prefer not to say" }
  ];

  return `
    <section aria-labelledby="profile-heading">

      <h2 id="profile-heading" class="section-heading">Your profile</h2>
      <div class="card settings-edit-card">

        <div class="settings-field">
          <label class="settings-field-label" for="profile-name">Name</label>
          <input type="text" id="profile-name" class="settings-field-input"
                 value="${name}" placeholder="Your name"
                 aria-label="Your name">
        </div>

        <div class="settings-field">
          <label class="settings-field-label">Age band</label>
          <div class="settings-chip-row" role="group" aria-label="Age band">
            ${AGE_BANDS.map(b => `
              <button class="settings-chip ${ageBand === b.id ? "selected" : ""}"
                      data-age-band="${b.id}"
                      aria-pressed="${ageBand === b.id}">
                ${b.label}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="settings-field">
          <label class="settings-field-label">Gender</label>
          <div class="settings-chip-row" role="group" aria-label="Gender">
            ${GENDERS.map(g => `
              <button class="settings-chip ${gender === g.id ? "selected" : ""}"
                      data-gender="${g.id}"
                      aria-pressed="${gender === g.id}">
                ${g.label}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="settings-field">
          <label class="settings-field-label" for="profile-weight">Weight</label>
          <div class="settings-weight-row">
            <input type="number" id="profile-weight" class="settings-field-input settings-weight-input"
                   value="${weight}" placeholder="e.g. 80"
                   inputmode="decimal" min="0" max="300"
                   aria-label="Body weight">
            <div class="settings-unit-toggle" role="group" aria-label="Weight unit">
              <button class="settings-unit-btn ${weightUnit === "kg" ? "selected" : ""}" data-unit="kg">kg</button>
              <button class="settings-unit-btn ${weightUnit === "lbs" ? "selected" : ""}" data-unit="lbs">lbs</button>
            </div>
          </div>
        </div>

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

      <!-- Coach voice speed -->
      <h2 class="section-heading" style="margin-top: var(--space-6);">Coach voice speed</h2>
      ${renderSpeechRateSection()}

      <!-- Check-in reminder -->
      <h2 class="section-heading" style="margin-top: var(--space-6);">Check-in reminder</h2>
      ${renderNotificationSection()}

    </section>
  `;
}

// ── Conditions tab ────────────────────────────────────────────────────────────

function renderConditionsTab() {
  const conditions = store.get("conditions") || [];
  const conditionStatus = store.get("conditionStatus") || {};

  // All available conditions for adding
  const ALL_CONDITION_IDS = [
    "knee-pain", "hip-pain", "hamstring", "lower-back", "upper-back",
    "shoulder-pain", "rotator-cuff", "elbow-pain", "wrist-pain", "neck-pain",
    "plantar-fasciitis", "achilles", "it-band", "shin-splints",
    "anxiety", "depression", "fatigue", "fibromyalgia",
    "pcos", "endometriosis", "menopause",
    "adhd", "autism", "dyspraxia",
    "asthma", "heart-condition", "diabetes-type-2",
    "other"
  ];

  const available = ALL_CONDITION_IDS.filter(id => !conditions.includes(id));

  return `
    <section aria-labelledby="conditions-heading">
      <h2 id="conditions-heading" class="section-heading">Your conditions</h2>
      <p class="text-secondary" style="margin-bottom:var(--space-4);">
        These are shared with the coach to adapt your sessions. Pain levels
        are updated each day at check-in.
      </p>

      ${conditions.length > 0 ? `
        <div class="card conditions-list" style="margin-bottom:var(--space-4);">
          ${conditions.map(id => {
            const paused = conditionStatus[id] === "paused";
            return `
              <div class="condition-settings-row">
                <span class="condition-settings-name ${paused ? "condition-paused" : ""}">
                  ${getConditionName(id)}
                  ${paused ? '<span class="condition-paused-badge">Paused</span>' : ""}
                </span>
                <div class="condition-settings-actions">
                  <button class="btn btn-ghost btn-xs condition-pause-btn"
                          data-condition-id="${id}"
                          aria-label="${paused ? "Resume" : "Pause"} ${getConditionName(id)}">
                    ${paused ? "Resume" : "Pause"}
                  </button>
                  <button class="btn btn-ghost btn-xs condition-remove-btn"
                          data-condition-id="${id}"
                          aria-label="Remove ${getConditionName(id)}">
                    Remove
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="card" style="margin-bottom:var(--space-4);">
          <p class="text-secondary">No conditions recorded yet.</p>
        </div>
      `}

      <h3 class="section-heading" style="margin-top:var(--space-5);">Add a condition</h3>
      <div class="conditions-add-grid">
        ${available.map(id => `
          <button class="condition-add-chip" data-add-condition="${id}"
                  aria-label="Add ${getConditionName(id)}">
            + ${getConditionName(id)}
          </button>
        `).join("")}
      </div>

    </section>
  `;
}

// ── Equipment tab ─────────────────────────────────────────────────────────────

// -- My Movement tab ----------------------------------------------------------

const FACILITY_PRESETS = [
  { id: "gym",       label: "Commercial gym",      icon: "\uD83C\uDFCB", desc: "Nuffield, PureGym, or similar",
    equipment: ["dumbbells-light","dumbbells-medium","dumbbells-heavy","barbell","ez-curl-bar",
                "kettlebell-light","kettlebell-medium","band-light","band-medium","band-heavy","mini-bands",
                "treadmill","exercise-bike","rowing-machine","elliptical","stair-climber",
                "cable-machine","smith-machine","pull-up-bar","bench-flat","bench-incline",
                "yoga-mat","foam-roller"] },
  { id: "home",      label: "Home setup",           icon: "\uD83C\uDFE0", desc: "Limited equipment at home",
    equipment: ["dumbbells-light","dumbbells-medium","band-light","band-medium","mini-bands","yoga-mat","foam-roller"] },
  { id: "bodyweight",label: "No equipment",         icon: "\uD83E\uDD38", desc: "Bodyweight only, anywhere",
    equipment: [] },
  { id: "studio",    label: "Yoga / pilates studio",icon: "\uD83E\uDDD8", desc: "Mat-based studio",
    equipment: ["yoga-mat","band-light","band-medium","foam-roller"] }
];

function renderMyMovementTab() {
  const selected = store.get("equipment") || [];
  const identity = store.get("movementIdentity") || null;

  const IDENTITIES = [
    { id: "gym",     label: "Gym",      icon: "\uD83C\uDFCB" },
    { id: "yoga",    label: "Yoga",     icon: "\uD83E\uDDD8" },
    { id: "running", label: "Running",  icon: "\uD83C\uDFC3" },
    { id: "walking", label: "Walking",  icon: "\uD83D\uDEB6" },
    { id: "swimming",label: "Swimming", icon: "\uD83C\uDFCA" },
    { id: "classes", label: "Classes",  icon: "\uD83C\uDFE5" },
    { id: "mixed",   label: "Mixed",    icon: "\u2728"        }
  ];

  return `
    <section aria-labelledby="movement-heading">
      <h2 id="movement-heading" class="section-heading">My Movement</h2>

      <p class="text-secondary" style="margin-bottom:var(--space-3);">
        What kind of movement feels most like you?
      </p>
      <div class="movement-identity-grid" role="group" aria-label="Movement identity">
        ${IDENTITIES.map(item => `
          <button class="movement-identity-tile ${identity === item.id ? "selected" : ""}"
                  data-identity="${item.id}" aria-pressed="${identity === item.id}">
            <span class="movement-tile-icon" aria-hidden="true">${item.icon}</span>
            <span class="movement-tile-label">${item.label}</span>
          </button>
        `).join("")}
      </div>

      <h3 class="section-subheading" style="margin-top:var(--space-6);">Where do you train?</h3>
      <p class="text-secondary text-sm" style="margin-bottom:var(--space-3);">
        Choose your facility to pre-fill equipment. Adjust below as needed.
      </p>
      <div class="facility-preset-grid" role="group" aria-label="Training facility">
        ${FACILITY_PRESETS.map(p => `
          <button class="facility-preset-card" data-facility="${p.id}"
                  aria-label="${p.label}: ${p.desc}">
            <span class="facility-preset-icon" aria-hidden="true">${p.icon}</span>
            <span class="facility-preset-label">${p.label}</span>
            <span class="facility-preset-desc">${p.desc}</span>
          </button>
        `).join("")}
      </div>

      <details class="equipment-detail-block" open>
        <summary class="equipment-detail-summary">
          Equipment detail
          <span class="equipment-count-badge">${selected.length} selected</span>
        </summary>
        <p class="text-secondary text-sm" style="margin:var(--space-3) 0;">
          Tap to add or remove. Changes take effect on your next workout.
        </p>
        ${EQUIPMENT_CATEGORIES.map(cat => {
          const n = cat.items.filter(i => selected.includes(i.id)).length;
          return `
            <div class="equipment-settings-category">
              <h4 class="equipment-category-heading">
                <span aria-hidden="true">${cat.icon}</span> ${cat.name}
                ${n > 0 ? "<span class=\"equipment-cat-count\">" + n + "</span>" : ""}
              </h4>
              <div class="equipment-chip-grid" role="group" aria-label="${cat.name}">
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
      </details>

    </section>
  `;
}


function renderLibraryTab() {
  const SECTIONS = [
    {
      title: "Guided Sessions", icon: "\uD83C\uDF1F",
      desc: "The coach leads. Tap any to start.",
      items: [
        { label: "Breathing",        icon: "\uD83C\uDF2C", target: "quiet-session",  quiet: "breathing", ok: true  },
        { label: "Mindful Movement", icon: "\uD83C\uDF3F", target: "quiet-session",  quiet: "mindful",   ok: true  },
        { label: "Journaling",       icon: "\uD83D\uDCDD", target: "quiet-session",  quiet: "journal",   ok: true  },
        { label: "Rest day",         icon: "\uD83D\uDECC", target: "quiet-session",  quiet: "rest",      ok: true  },
        { label: "Yoga / Pilates",   icon: "\uD83E\uDDD8", target: "yoga-session",   quiet: null,        ok: false },
        { label: "Core session",     icon: "\uD83D\uDCAA", target: "core-session",   quiet: null,        ok: false },
        { label: "Home workout",     icon: "\uD83C\uDFE0", target: "home-workout",   quiet: null,        ok: false },
        { label: "Running session",  icon: "\uD83C\uDFC3", target: "running-session",quiet: null,        ok: false },
        { label: "Walk / C25K",      icon: "\uD83D\uDEB6", target: "walk-programme", quiet: null,        ok: false }
      ]
    },
    {
      title: "Programmes", icon: "\uD83D\uDCCB",
      desc: "Structured multi-week plans.",
      items: [
        { label: "My Gym Programme",     icon: "\uD83C\uDFCB", target: "gym-programme", quiet: null, ok: true },
        { label: "Prescribed Exercises", icon: "\uD83E\uDE7A", target: "prescribed",     quiet: null, ok: true }
      ]
    }
  ];

  const LOG_GROUPS = [
    { group: "Cardio", items: [
      { label: "Run",    icon: "\uD83C\uDFC3", id: "run"    },
      { label: "Walk",   icon: "\uD83D\uDEB6", id: "walk"   },
      { label: "Cycle",  icon: "\uD83D\uDEB4", id: "cycle"  },
      { label: "Swim",   icon: "\uD83C\uDFCA", id: "swim"   },
      { label: "Row",    icon: "\uD83D\uDEA3", id: "row"    }
    ]},
    { group: "Classes", items: [
      { label: "Body Balance", icon: "\uD83E\uDDD8", id: "body-balance" },
      { label: "Spin",         icon: "\uD83D\uDEB4", id: "spin"         },
      { label: "Boxing",       icon: "\uD83E\uDD4A", id: "boxing"       },
      { label: "HIIT",         icon: "\uD83D\uDD25", id: "hiit"         },
      { label: "Other class",  icon: "\uD83C\uDFE5", id: "class"        }
    ]},
    { group: "Sport", items: [
      { label: "Tennis",   icon: "\uD83C\uDFBE", id: "tennis"   },
      { label: "Football", icon: "\u26BD",        id: "football" },
      { label: "Golf",     icon: "\u26F3",        id: "golf"     },
      { label: "Sport",    icon: "\uD83C\uDFC6", id: "sport"    }
    ]},
    { group: "Outdoor", items: [
      { label: "Hike",          icon: "\u26F0",        id: "hike"          },
      { label: "Outdoor cycle", icon: "\uD83D\uDEB4", id: "outdoor-cycle" },
      { label: "Outdoor",       icon: "\uD83C\uDF32", id: "outdoor"       }
    ]}
  ];

  return `
    <section aria-label="Library">

      ${SECTIONS.map(section => `
        <div class="library-section-block">
          <div class="library-section-header">
            <span class="library-section-icon" aria-hidden="true">${section.icon}</span>
            <div>
              <h2 class="library-section-title">${section.title}</h2>
              <p class="library-section-desc">${section.desc}</p>
            </div>
          </div>
          <div class="library-tile-grid">
            ${section.items.map(item => `
              <button class="library-tile ${!item.ok ? "library-tile--soon" : ""}"
                      ${item.ok ? `data-target="${item.target}" data-quiet="${item.quiet || ""}"` : ""}
                      aria-label="${item.label}${!item.ok ? ", coming soon" : ""}"
                      ${!item.ok ? 'disabled aria-disabled="true"' : ""}>
                <span class="library-tile-icon" aria-hidden="true">${item.icon}</span>
                <span class="library-tile-label">${item.label}</span>
                ${!item.ok ? '<span class="library-tile-soon">Soon</span>' : ""}
              </button>
            `).join("")}
          </div>
        </div>
      `).join("")}

      <div class="library-section-block">
        <div class="library-section-header">
          <span class="library-section-icon" aria-hidden="true">\uD83D\uDCDD</span>
          <div>
            <h2 class="library-section-title">Log an Activity</h2>
            <p class="library-section-desc">You know what you did. Log it and the coach will reflect.</p>
          </div>
        </div>
        ${LOG_GROUPS.map(group => `
          <h3 class="library-group-label">${group.group}</h3>
          <div class="library-tile-grid library-tile-grid--compact">
            ${group.items.map(item => `
              <button class="library-tile library-tile--compact"
                      data-target="activity-log" data-activity="${item.id}"
                      aria-label="Log ${item.label}">
                <span class="library-tile-icon" aria-hidden="true">${item.icon}</span>
                <span class="library-tile-label">${item.label}</span>
              </button>
            `).join("")}
          </div>
        `).join("")}
      </div>

    </section>
  `;
}


function renderMovementIdentity() {
  const current = store.get("movementIdentity") || null;

  const IDENTITIES = [
    { id: "gym",     label: "Gym / weights",   icon: "\uD83C\uDFCB" },
    { id: "yoga",    label: "Yoga / pilates",   icon: "\uD83E\uDDD8" },
    { id: "running", label: "Running",           icon: "\uD83C\uDFC3" },
    { id: "walking", label: "Walking",           icon: "\uD83D\uDEB6" },
    { id: "swimming",label: "Swimming",          icon: "\uD83C\uDFCA" },
    { id: "classes", label: "Classes",           icon: "\uD83C\uDFE5" },
    { id: "mixed",   label: "A mix of things",  icon: "\u2728"       },
  ];

  return `
    <div class="library-grid" role="group" aria-label="Movement identity">
      ${IDENTITIES.map(item => `
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
      <p class="text-sm text-muted" style="margin-top:var(--space-2);">
        The coach will lean toward ${IDENTITIES.find(i => i.id === current)?.label || current} suggestions.
        Your actual activity history will refine this over time.
      </p>
    ` : ""}
  `;
}

// ── Speech rate section ───────────────────────────────────────────────────────

/**
 * Render speed selector for coach card text-to-speech.
 * Three options: Slow / Normal / Fast.
 * Selection writes to store immediately. Takes effect on next tap of
 * a speaker button — no page reload needed.
 */
function renderSpeechRateSection() {
  const currentRate = store.get("speechRate") || 0.9;

  const rates = [
    { value: 0.75, label: "Slow",   description: "More time to process" },
    { value: 0.9,  label: "Normal", description: "Default" },
    { value: 1.2,  label: "Fast",   description: "Quick and efficient" }
  ];

  return `
    <div class="card speech-rate-card">
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Sets the speed of the read-aloud feature on coach cards.
        Tap the speaker icon on any coach message to listen.
      </p>
      <div class="speech-rate-grid" role="radiogroup" aria-label="Coach voice speed">
        ${rates.map(r => `
          <button
            class="speech-rate-btn ${currentRate === r.value ? "selected" : ""}"
            role="radio"
            aria-checked="${currentRate === r.value}"
            data-rate="${r.value}"
            aria-label="${r.label}: ${r.description}"
          >
            <span class="speech-rate-label">${r.label}</span>
            <span class="speech-rate-desc">${r.description}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

// ── Notification section ──────────────────────────────────────────────────────

/**
 * Render the check-in notification toggle and time picker.
 *
 * PERMITTED: warm tone, single type, user-set time, user-revocable.
 * PROHIBITED: streak framing, guilt framing, re-prompting after denial,
 *             multiple notification types, automatic scheduling changes.
 *
 * Two states:
 *   enabled=false  — toggle only; time picker hidden.
 *   enabled=true   — toggle + time picker; permission status shown if denied.
 *
 * Permission is requested via browser Notification API when the user
 * first enables the toggle. If denied, a calm explanation is shown
 * and permissionGranted remains false. We never re-prompt automatically.
 */
function renderNotificationSection() {
  const notif   = store.get("checkInNotification") || { enabled: false, time: null, permissionGranted: false };
  const enabled = !!notif.enabled;
  const denied  = enabled && !notif.permissionGranted && "Notification" in window && Notification.permission === "denied";

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
          <input
            type="checkbox"
            id="notif-toggle"
            role="switch"
            aria-checked="${enabled}"
            ${enabled ? "checked" : ""}
          >
          <span class="toggle-track" aria-hidden="true"></span>
        </label>
      </div>

      ${enabled ? `
        <div class="notification-time-row" id="notif-time-row">
          <label class="form-label" for="notif-time">Remind me at</label>
          <input
            type="time"
            id="notif-time"
            class="form-input notif-time-input"
            value="${notif.time || "08:00"}"
            aria-label="Check-in reminder time"
          >
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

  // ── Profile name ──────────────────────────────────────────────────────────
  document.getElementById("profile-name")?.addEventListener("blur", e => {
    store.set("name", e.target.value.trim());
  });

  // ── Age band chips ─────────────────────────────────────────────────────────
  document.querySelectorAll("[data-age-band]").forEach(btn => {
    btn.addEventListener("click", () => {
      store.set("ageBand", btn.dataset.ageBand);
      document.querySelectorAll("[data-age-band]").forEach(b => {
        b.classList.toggle("selected", b === btn);
        b.setAttribute("aria-pressed", b === btn);
      });
    });
  });

  // ── Gender chips ───────────────────────────────────────────────────────────
  document.querySelectorAll("[data-gender]").forEach(btn => {
    btn.addEventListener("click", () => {
      store.set("gender", btn.dataset.gender);
      document.querySelectorAll("[data-gender]").forEach(b => {
        b.classList.toggle("selected", b === btn);
        b.setAttribute("aria-pressed", b === btn);
      });
    });
  });

  // ── Weight input ───────────────────────────────────────────────────────────
  document.getElementById("profile-weight")?.addEventListener("blur", e => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) store.set("weight", val);
  });

  // ── Weight unit toggle ─────────────────────────────────────────────────────
  document.querySelectorAll("[data-unit]").forEach(btn => {
    btn.addEventListener("click", () => {
      store.set("weightUnit", btn.dataset.unit);
      document.querySelectorAll("[data-unit]").forEach(b => {
        b.classList.toggle("selected", b === btn);
      });
    });
  });

  // ── Conditions: pause/resume ───────────────────────────────────────────────
  document.querySelectorAll(".condition-pause-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.conditionId;
      const status = store.get("conditionStatus") || {};
      status[id] = status[id] === "paused" ? "active" : "paused";
      store.set("conditionStatus", status);
      switchTab("conditions");
    });
  });

  // ── Conditions: remove ─────────────────────────────────────────────────────
  document.querySelectorAll(".condition-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.conditionId;
      if (!confirm("Remove " + id.replace(/-/g, " ") + " from your conditions?")) return;
      const conditions = (store.get("conditions") || []).filter(c => c !== id);
      store.set("conditions", conditions);
      switchTab("conditions");
    });
  });

  // ── Conditions: add ────────────────────────────────────────────────────────
  document.querySelectorAll("[data-add-condition]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.addCondition;
      const conditions = store.get("conditions") || [];
      if (!conditions.includes(id)) {
        conditions.push(id);
        store.set("conditions", conditions);
      }
      switchTab("conditions");
    });
  });

  // ── Facility presets ──────────────────────────────────────────────────────
  document.querySelectorAll("[data-facility]").forEach(btn => {
    btn.addEventListener("click", () => {
      const preset = FACILITY_PRESETS.find(p => p.id === btn.dataset.facility);
      if (!preset) return;
      store.set("equipment", [...preset.equipment]);
      // Briefly show confirmation
      btn.textContent = "Applied";
      setTimeout(() => switchTab("equipment"), 800);
    });
  });

  // ── Equipment expand/collapse ──────────────────────────────────────────────
  // Using <details> element — native expand/collapse, no JS needed

  // Movement identity chips
  document.querySelectorAll("[data-identity]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.identity;
      store.set("movementIdentity", id);
      document.querySelectorAll("[data-identity]").forEach(b => {
        const isSelected = b.dataset.identity === id;
        b.classList.toggle("library-card--selected", isSelected);
        b.setAttribute("aria-pressed", isSelected);
      });
      // Update the confirmation text
      const note = btn.closest(".library-section")?.querySelector(".text-muted:last-of-type");
    });
  });

  // Library cards
  document.querySelectorAll(".library-card[data-target]").forEach(card => {
    card.addEventListener("click", () => {
      const target    = card.dataset.target;
      const quietMode = card.dataset.quiet || null;
      const activity  = card.dataset.activity || null;
      if (quietMode)  store.set("quietMode", quietMode);
      if (activity)   store.set("logActivityType", activity);
      router.navigate(target);
    });
  });

  // Speech rate buttons
  document.querySelectorAll(".speech-rate-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const rate = parseFloat(btn.dataset.rate);
      if (isNaN(rate)) return;
      store.set("speechRate", rate);
      document.querySelectorAll(".speech-rate-btn").forEach(b => {
        const isSelected = parseFloat(b.dataset.rate) === rate;
        b.classList.toggle("selected", isSelected);
        b.setAttribute("aria-checked", isSelected);
      });
    });
  });

  // Notification toggle and time picker
  wireNotificationControls();

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

// ── Notification wiring ───────────────────────────────────────────────────────

/**
 * Wire the notification toggle and time picker.
 * Called from wirePanel() on every profile tab render.
 *
 * Toggle on:
 *   1. Request browser Notification permission.
 *   2. If granted: save enabled=true, permissionGranted=true, re-render section.
 *   3. If denied:  save enabled=true, permissionGranted=false, re-render section
 *      (section shows a calm explanation — no re-prompt, no guilt framing).
 *   4. If unavailable ("Notification" not in window): save enabled=false,
 *      show a gentle "not supported" message.
 *
 * Toggle off:
 *   Save enabled=false. Scheduling loop will stop on next tick.
 *
 * Time picker change:
 *   Saves new time to store. Scheduling loop reads from store each tick.
 */
function wireNotificationControls() {
  const toggle   = document.getElementById("notif-toggle");
  const timeInput = document.getElementById("notif-time");

  if (toggle) {
    toggle.addEventListener("change", async () => {
      const wantsEnabled = toggle.checked;

      if (!wantsEnabled) {
        // User turned it off — save and re-render section
        saveNotificationState({ enabled: false, time: null, permissionGranted: false });
        rerenderNotificationSection();
        return;
      }

      // Browser notifications not supported
      if (!("Notification" in window)) {
        saveNotificationState({ enabled: false, time: null, permissionGranted: false });
        rerenderNotificationSection();
        return;
      }

      // Already granted — just enable
      if (Notification.permission === "granted") {
        const currentTime = store.get("checkInNotification.time") || "08:00";
        saveNotificationState({ enabled: true, time: currentTime, permissionGranted: true });
        rerenderNotificationSection();
        startNotificationScheduler();
        return;
      }

      // Request permission — ONLY done when user explicitly toggles on.
      // We never re-prompt automatically (prohibited pattern).
      const permission = await Notification.requestPermission();
      const granted    = permission === "granted";
      const currentTime = store.get("checkInNotification.time") || "08:00";

      saveNotificationState({ enabled: true, time: currentTime, permissionGranted: granted });
      rerenderNotificationSection();

      if (granted) {
        startNotificationScheduler();
      }
      // If denied: section re-renders with calm explanation. No further action.
    });
  }

  if (timeInput) {
    timeInput.addEventListener("change", () => {
      const newTime = timeInput.value;
      if (!newTime) return;
      store.set("checkInNotification.time", newTime);
      // Scheduler reads from store each tick — no restart needed.
    });
  }
}

function saveNotificationState(state) {
  store.set("checkInNotification", {
    enabled:           state.enabled,
    time:              state.time,
    permissionGranted: state.permissionGranted
  });
}

/**
 * Re-render only the notification card within the current profile tab.
 * Avoids a full tab switch which would reset scroll position.
 */
function rerenderNotificationSection() {
  const card = document.querySelector(".notification-card");
  if (card) {
    const section = card.closest(".card");
    if (section) {
      // Replace just the card content by re-rendering the notification section
      const wrapper = card.parentElement;
      if (wrapper) {
        wrapper.innerHTML = renderNotificationSection();
        // Re-wire the new elements
        wireNotificationControls();
      }
    }
  }
}

// ── Notification scheduler ────────────────────────────────────────────────────

/**
 * Scheduling approach: setInterval every 60 seconds.
 * On each tick, reads the user's chosen time from store and compares
 * to the current HH:MM. Fires a notification if they match and one
 * has not already been sent this minute.
 *
 * Single type only. Warm, non-urgent message. No streak framing.
 * No guilt framing. No urgency language.
 *
 * The interval is stored on window so it can be cleared if the user
 * disables the feature while the app is open.
 *
 * PROHIBITED messages (never use):
 *   - "You haven't checked in yet!"
 *   - "Don't break your streak!"
 *   - "You missed yesterday."
 *   - Any language implying failure or obligation.
 */
let _notifSchedulerInterval  = null;
let _notifLastFiredMinute    = null;

const NOTIFICATION_MESSAGES = [
  { title: "Alongside", body: "Ready when you are. A quick check-in takes less than a minute." },
  { title: "Alongside", body: "How are you feeling today? Your coach is here whenever suits you." },
  { title: "Alongside", body: "Just a gentle nudge. Come check in whenever you're ready." },
  { title: "Alongside", body: "Your check-in is waiting. No rush -- take it at your own pace." },
  { title: "Alongside", body: "A moment to check in whenever suits you today." }
];

function startNotificationScheduler() {
  // Clear any existing interval to avoid duplicates
  if (_notifSchedulerInterval) {
    clearInterval(_notifSchedulerInterval);
  }

  _notifSchedulerInterval = setInterval(() => {
    const notif = store.get("checkInNotification");
    if (!notif?.enabled || !notif?.permissionGranted || !notif?.time) return;
    if (Notification.permission !== "granted") return;

    const now    = new Date();
    const hh     = String(now.getHours()).padStart(2, "0");
    const mm     = String(now.getMinutes()).padStart(2, "0");
    const nowHHMM = hh + ":" + mm;

    // Only fire once per minute — track the last minute we fired
    if (nowHHMM === notif.time && _notifLastFiredMinute !== nowHHMM) {
      _notifLastFiredMinute = nowHHMM;

      // Pick a message variant using the day of year so it rotates daily
      const now2   = new Date();
      const start  = new Date(now2.getFullYear(), 0, 0);
      const dayIdx = Math.floor((now2 - start) / 86400000) % NOTIFICATION_MESSAGES.length;
      const msg    = NOTIFICATION_MESSAGES[dayIdx];

      // eslint-disable-next-line no-new
      new Notification(msg.title, {
        body: msg.body,
        icon: "assets/images/logo-icon-192.png",
        tag:  "alongside-checkin",  // replaces previous if still showing
        renotify: false
      });
    }
  }, 60000); // check every 60 seconds

  // Store interval reference globally so app.js can clear it on reset if needed
  window._alongsideNotifInterval = _notifSchedulerInterval;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // If navigated here with a specific tab request (e.g. from coach proposal Library button),
  // call switchTab() properly so the panel re-renders — not just setting activeTab variable.
  const requestedTab = store.get("settingsTab");
  if (requestedTab) {
    store.set("settingsTab", null);
    if (requestedTab !== activeTab) {
      activeTab = requestedTab;
      // Panel will render correctly below via wirePanel() reading activeTab
    }
  }

  // Tab switching
  document.querySelectorAll(".settings-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const name = tab.dataset.tab;
      if (name && name !== activeTab) switchTab(name);
    });
  });

  // Wire panel elements on initial load
  wirePanel();

  // If notification is already enabled and permission granted, resume scheduler
  const notif = store.get("checkInNotification");
  if (notif?.enabled && notif?.permissionGranted) {
    startNotificationScheduler();
  }

  // Check for updates
  document.getElementById("check-update-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("check-update-btn");
    const statusEl = document.getElementById("update-check-status");

    if (btn) {
      btn.textContent = "Checking...";
      btn.disabled    = true;
    }
    if (statusEl) statusEl.textContent = "";

    const result = await window.App?.checkForUpdate?.() || "unavailable";
    window.App?.showUpdateCheckResult?.(result);

    if (btn) {
      btn.textContent = "Check for updates";
      btn.disabled    = false;
    }
  });

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
