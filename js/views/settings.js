/**
 * settings.js - Settings view
 *
 * 8 May 2026 v1
 *
 * v2.0 — Library tab + My Movement + 10-level voice speed slider:
 *   Fourth tab added: Library.
 *   Library contains:
 *     - My Movement identity selector (7 options, writes to store.movementIdentity)
 *     - Log an Activity grid (16 options, grouped, navigates to activity-log)
 *     - Guided Sessions section (links to yoga-session, quiet-session etc.)
 *     - Programmes section (gym programme, prescribed exercises)
 *   Voice speed restored to 10-level slider (0.5–1.5 rate, maps to 10 steps).
 *   activeTab reads store.get("settingsTab") on render so Library can be
 *   deep-linked from coach-proposal's Library button.
 *
 * v1.4 — App version display and update check button (S3-6)
 * v1.3 — Check-in notification (S3-6)
 * v1.0 — Tabbed layout: Profile / Conditions / Equipment
 */

import { store } from "../store.js";
import { getConditionName } from "../data/conditions.js";
import { EQUIPMENT_CATEGORIES } from "../data/equipment.js";

export const centered = false;

// ── Tab state ─────────────────────────────────────────────────────────────────
let activeTab = "profile";

// ── Coach style definitions ───────────────────────────────────────────────────
const COACH_STYLES = [
  { id: "steady",    label: "Steady",    description: "Calm, consistent, and supportive. Never rushed.",    icon: "🌿" },
  { id: "energetic", label: "Energetic", description: "Upbeat, motivating, and enthusiastic.",              icon: "⚡" },
  { id: "minimal",   label: "Minimal",   description: "Short, direct, and to the point. No fluff.",         icon: "🎯" },
  { id: "nurturing", label: "Nurturing", description: "Warm, gentle, and emotionally attentive.",           icon: "💛" }
];

// ── Movement identity definitions ─────────────────────────────────────────────
const MOVEMENT_IDENTITIES = [
  { id: "gym",      label: "Gym / weights",  icon: "🏋" },
  { id: "yoga",     label: "Yoga / pilates", icon: "🧘" },
  { id: "running",  label: "Running",        icon: "🏃" },
  { id: "walking",  label: "Walking",        icon: "🚶" },
  { id: "swimming", label: "Swimming",       icon: "🏊" },
  { id: "classes",  label: "Classes",        icon: "🏥" },
  { id: "mixed",    label: "A mix of things",icon: "✨" },
];

// ── Activity log options ───────────────────────────────────────────────────────
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
      { id: "yoga",    label: "Yoga",        icon: "🧘" },
      { id: "pilates", label: "Pilates",     icon: "🧘" },
      { id: "tai-chi", label: "Tai chi",     icon: "🌿" },
      { id: "mindful", label: "Mindful walk",icon: "🌿" },
      { id: "custom",  label: "Something else", icon: "❔" },
    ]
  }
];

// ── Voice speed — 10 levels ───────────────────────────────────────────────────
// Maps slider positions 1–10 to speech rate values 0.5–1.5
// Position 4 = rate 0.83 ≈ Slow, Position 6 = rate 1.0 = Normal, Position 9 = rate 1.33 ≈ Fast
const SPEED_MIN  = 0.5;
const SPEED_MAX  = 1.5;
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
  // Read deep-link tab from store (set by coach-proposal Library button)
  const requestedTab = store.get("settingsTab");
  if (requestedTab) {
    activeTab = requestedTab;
    store.set("settingsTab", null);
  }

  return `
    <div class="view settings-view">

      <div class="view-header">
        <h1>Settings</h1>
      </div>

      <!-- ── Tab bar ──────────────────────────────────────────────────────── -->
      <div class="settings-tabs" role="tablist" aria-label="Settings sections">
        <button
          class="settings-tab ${activeTab === "profile" ? "active" : ""}"
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
          class="settings-tab ${activeTab === "equipment" ? "active" : ""}"
          role="tab"
          aria-selected="${activeTab === "equipment"}"
          aria-controls="settings-tab-panel"
          id="tab-equipment"
          data-tab="equipment"
        >Equipment</button>
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

        <!-- ── App version and update check ─────────────────────────────── -->
        <div class="settings-update-zone">
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
  if (activeTab === "equipment")  return renderEquipmentTab();
  if (activeTab === "library")    return renderLibraryTab();
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

      <h2 id="profile-heading" class="section-heading">Your profile</h2>
      <div class="card settings-profile-card">
        ${settingsRow("Name",   name)}
        ${settingsRow("Age",    age    ? String(age)               : "Not set")}
        ${settingsRow("Gender", gender ? formatGender(gender)      : "Not set")}
        ${settingsRow("Weight", weight ? `${weight}${weightUnit}`  : "Not set")}
      </div>

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

// ── Library tab ───────────────────────────────────────────────────────────────

function renderLibraryTab() {
  return `
    <section aria-labelledby="library-heading">
      <h2 id="library-heading" class="section-heading">My movement</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Tell the coach what kind of movement feels most like you.
        This shapes what the coach suggests first each day.
        You can change it any time.
      </p>
      ${renderMovementIdentity()}

      <h2 class="section-heading" style="margin-top: var(--space-6);">Guided sessions</h2>
      <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
        Start a guided session whenever you want — no check-in needed.
      </p>
      <div class="library-grid">

        <button class="library-card"
                data-navigate="gym-programme"
                aria-label="My gym programme">
          <span class="library-card-icon" aria-hidden="true">🏋</span>
          <span class="library-card-label">Gym programme</span>
        </button>

        <button class="library-card"
                data-navigate="prescribed"
                aria-label="My prescribed exercises">
          <span class="library-card-icon" aria-hidden="true">🩺</span>
          <span class="library-card-label">Prescribed exercises</span>
        </button>

        <button class="library-card"
                data-navigate="yoga-session"
                aria-label="Yoga or pilates session">
          <span class="library-card-icon" aria-hidden="true">🧘</span>
          <span class="library-card-label">Yoga / Pilates</span>
        </button>

        <button class="library-card"
                data-quiet="breathing"
                data-navigate="quiet-session"
                aria-label="Breathing practice">
          <span class="library-card-icon" aria-hidden="true">🌬</span>
          <span class="library-card-label">Breathing</span>
        </button>

        <button class="library-card"
                data-quiet="journal"
                data-navigate="quiet-session"
                aria-label="Journaling session">
          <span class="library-card-icon" aria-hidden="true">📝</span>
          <span class="library-card-label">Journal</span>
        </button>

        <button class="library-card"
                data-quiet="mindful"
                data-navigate="quiet-session"
                aria-label="Mindful movement">
          <span class="library-card-icon" aria-hidden="true">🌿</span>
          <span class="library-card-label">Mindful movement</span>
        </button>

        <button class="library-card"
                data-navigate="coach-proposal"
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
      <p class="text-sm text-muted" style="margin-top: var(--space-2);">
        The coach will lean toward ${MOVEMENT_IDENTITIES.find(i => i.id === current)?.label || current} suggestions.
        Your activity history will refine this over time.
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
                aria-live="polite" aria-atomic="true">
            ${label}
          </span>
          <span class="speech-rate-position text-sm text-muted" id="speech-rate-position"
                aria-hidden="true">
            ${currentPos} / ${SPEED_STEPS}
          </span>
        </div>

        <input
          type="range"
          id="speech-rate-slider"
          class="checkin-slider"
          min="1"
          max="${SPEED_STEPS}"
          step="1"
          value="${currentPos}"
          aria-label="Coach voice speed, ${currentPos} of ${SPEED_STEPS}, ${label}"
          aria-valuemin="1"
          aria-valuemax="${SPEED_STEPS}"
          aria-valuenow="${currentPos}"
          aria-valuetext="${label}"
        >

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

// ── Re-render helpers ─────────────────────────────────────────────────────────

function switchTab(tabName) {
  activeTab = tabName;

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

// ── Wire all interactive elements ─────────────────────────────────────────────

function wirePanel() {

  // ── Coach style cards ──────────────────────────────────────────────────────
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

  // ── Speech rate slider ─────────────────────────────────────────────────────
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

  // ── Notification controls ──────────────────────────────────────────────────
  wireNotificationControls();

  // ── Equipment chips ────────────────────────────────────────────────────────
  document.querySelectorAll(".equipment-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const id = chip.dataset.equipmentId;
      if (!id) return;
      const current   = store.get("equipment") || [];
      const isSelected = current.includes(id);
      const updated   = isSelected ? current.filter(e => e !== id) : [...current, id];
      store.set("equipment", updated);
      chip.classList.toggle("selected", !isSelected);
      chip.setAttribute("aria-pressed", !isSelected);
      updateCategoryCount(chip);
    });
  });

  // ── Movement identity ──────────────────────────────────────────────────────
  document.querySelectorAll("[data-identity]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.identity;
      if (!id) return;
      store.set("movementIdentity", id);
      document.querySelectorAll("[data-identity]").forEach(b => {
        const isSelected = b.dataset.identity === id;
        b.classList.toggle("library-card--selected", isSelected);
        b.setAttribute("aria-pressed", isSelected);
      });
      // Update the description text below the grid
      const identitySection = btn.closest("section");
      if (identitySection) {
        const existing = identitySection.querySelector(".movement-identity-note");
        if (existing) existing.remove();
        const identity = MOVEMENT_IDENTITIES.find(i => i.id === id);
        if (identity) {
          const note = document.createElement("p");
          note.className = "text-sm text-muted movement-identity-note";
          note.style.marginTop = "var(--space-2)";
          note.textContent = `The coach will lean toward ${identity.label} suggestions. Your activity history will refine this over time.`;
          btn.closest(".library-grid").after(note);
        }
      }
    });
  });

  // ── Library navigation cards ───────────────────────────────────────────────
  document.querySelectorAll("[data-navigate]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target    = btn.dataset.navigate;
      const quietMode = btn.dataset.quiet || null;
      if (!target) return;
      if (quietMode) store.set("quietMode", quietMode);
      router.navigate(target);
    });
  });

  // ── Log activity cards ─────────────────────────────────────────────────────
  document.querySelectorAll("[data-log-activity]").forEach(btn => {
    btn.addEventListener("click", () => {
      const activityId = btn.dataset.logActivity;
      if (!activityId) return;
      // Write a pending activity log entry so activity-log.js or reflect.js can pick it up
      store.set("pendingLogActivity", activityId);
      router.navigate("reflect");
    });
  });
}

function updateCategoryCount(chip) {
  const categoryEl = chip.closest(".equipment-settings-category");
  if (!categoryEl) return;
  const chipsInCat    = categoryEl.querySelectorAll(".equipment-chip");
  const selectedCount = Array.from(chipsInCat).filter(c => c.classList.contains("selected")).length;
  const heading       = categoryEl.querySelector(".equipment-category-heading");
  if (!heading) return;
  const existing = heading.querySelector(".equipment-cat-count");
  if (existing) existing.remove();
  if (selectedCount > 0) {
    const badge = document.createElement("span");
    badge.className   = "equipment-cat-count";
    badge.textContent = `${selectedCount} selected`;
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
        const currentTime = store.get("checkInNotification.time") || "08:00";
        saveNotificationState({ enabled: true, time: currentTime, permissionGranted: true });
        rerenderNotificationSection();
        startNotificationScheduler();
        return;
      }

      const permission  = await Notification.requestPermission();
      const granted     = permission === "granted";
      const currentTime = store.get("checkInNotification.time") || "08:00";
      saveNotificationState({ enabled: true, time: currentTime, permissionGranted: granted });
      rerenderNotificationSection();
      if (granted) startNotificationScheduler();
    });
  }

  if (timeInput) {
    timeInput.addEventListener("change", () => {
      const newTime = timeInput.value;
      if (!newTime) return;
      store.set("checkInNotification.time", newTime);
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

function rerenderNotificationSection() {
  const card = document.querySelector(".notification-card");
  if (card) {
    const wrapper = card.parentElement;
    if (wrapper) {
      wrapper.innerHTML = renderNotificationSection();
      wireNotificationControls();
    }
  }
}

// ── Notification scheduler ────────────────────────────────────────────────────

let _notifSchedulerInterval = null;
let _notifLastFiredMinute   = null;

const NOTIFICATION_MESSAGES = [
  { title: "Alongside", body: "Ready when you are. A quick check-in takes less than a minute." },
  { title: "Alongside", body: "How are you feeling today? Your coach is here whenever suits you." },
  { title: "Alongside", body: "Just a gentle nudge. Come check in whenever you're ready." },
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
    const nowHHMM = hh + ":" + mm;

    if (nowHHMM === notif.time && _notifLastFiredMinute !== nowHHMM) {
      _notifLastFiredMinute = nowHHMM;
      const start  = new Date(now.getFullYear(), 0, 0);
      const dayIdx = Math.floor((now - start) / 86400000) % NOTIFICATION_MESSAGES.length;
      const msg    = NOTIFICATION_MESSAGES[dayIdx];
      new Notification(msg.title, {
        body:     msg.body,
        icon:     "assets/images/logo-icon-192.png",
        tag:      "alongside-checkin",
        renotify: false
      });
    }
  }, 60000);

  window._alongsideNotifInterval = _notifSchedulerInterval;
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

  // Resume notification scheduler if already enabled
  const notif = store.get("checkInNotification");
  if (notif?.enabled && notif?.permissionGranted) {
    startNotificationScheduler();
  }

  // Check for updates
  document.getElementById("check-update-btn")?.addEventListener("click", async () => {
    const btn      = document.getElementById("check-update-btn");
    const statusEl = document.getElementById("update-check-status");
    if (btn)      { btn.textContent = "Checking..."; btn.disabled = true; }
    if (statusEl)   statusEl.textContent = "";
    const result = await window.App?.checkForUpdate?.() || "unavailable";
    window.App?.showUpdateCheckResult?.(result);
    if (btn) { btn.textContent = "Check for updates"; btn.disabled = false; }
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
