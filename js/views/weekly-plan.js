/**
 * weekly-plan.js - My Week (Weekly Plan)
 *
 * 14 Jun 2026 v1 (S4-WP)
 *
 * New view. Builds the My Week day-grid and day configuration screen
 * directly against the finalised v1.6 weeklyPlan shape (store.js v3,
 * schema.md Section 13):
 *
 *   weeklyPlan: {
 *     days: {
 *       monday: { type, sessionType, durationMins, location,
 *                 classFocus, activityName, label, enabled },
 *       ... (all 7 days, same shape)
 *     },
 *     updatedAt: ISO string | null
 *   }
 *
 *   type: "workout" | "rest" | "recovery" | "event" | "open"
 *
 * No master "enable my plan" toggle. Per schema v1.6, a separate
 * enable/setup-tracking layer was deliberately judged unnecessary --
 * weeklyPlan.updatedAt (null until first save) distinguishes "never
 * configured" from "configured", and each day's own `enabled` flag
 * lets a day be switched off without losing its settings. This view
 * shows "Last saved" (from updatedAt) instead of a toggle.
 *
 * Tier gating (Free vs Personal/Athlete) follows the 21 May 2026
 * weekly plan spec Section 2: Free sees an explanatory coach card and
 * an upgrade prompt; Personal/Athlete get the full day grid and save.
 *
 * Reached via the "weekly-plan" route (pre-registered in router.js v2,
 * 12 Jun 2026 -- nav-visible, not in hideNavViews). settings.js v2
 * (14 Jun 2026) replaces its old inline My Week tab with a simple
 * entry card that navigates here.
 *
 * Realigning the existing weekly-plan branches in coach-proposal.js
 * (built against an earlier, pre-v1.6 shape) to this schema is tracked
 * separately as S4-WP2 -- not part of this file.
 */

import { store } from "../store.js";

export const centered = false;

// -- Days -----------------------------------------------------------------

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const DAY_LABELS = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday"
};

// -- Day types (schema v1.6 Section 13) ------------------------------------

const DAY_TYPES = [
  { id: "open",     label: "No plan",        desc: "Coach decides based on check-in",        icon: "&#8212;" },
  { id: "workout",  label: "Workout",        desc: "Gym, home training, or a structured session", icon: "&#127947;" },
  { id: "recovery", label: "Recovery",       desc: "Light movement -- walk, swim, yoga, mobility", icon: "&#127807;" },
  { id: "rest",     label: "Rest day",       desc: "Nothing planned -- rest is part of the work",  icon: "&#128564;" },
  { id: "event",    label: "Class / Event",  desc: "Tennis, football, a class, or anything named", icon: "&#129368;" },
];

// -- Session type options (workout days only) ------------------------------
// Matches SESSION_TYPE_LABELS in coach-proposal.js so the saved
// sessionType id feeds the session builder exactly as a same-day
// selection would.

const SESSION_TYPES = [
  { id: "full",     label: "Full Body" },
  { id: "upper",    label: "Upper Body" },
  { id: "lower",    label: "Lower Body" },
  { id: "core",     label: "Core & Stability" },
  { id: "cardio",   label: "Cardio" },
  { id: "hiit",     label: "HIIT" },
  { id: "mobility", label: "Mobility" },
];

// -- Location options (workout and event days) -----------------------------

const LOCATIONS = [
  { id: "home",    label: "Home",    icon: "&#127968;" },
  { id: "gym",     label: "Gym",     icon: "&#127970;" },
  { id: "outside", label: "Outside", icon: "&#127795;" },
];

const DURATION_OPTIONS = [20, 30, 45, 60, 75, 90];

const MAX_CLASS_FOCUS = 3;

// -- Local edit state (not saved until "Save my week") ---------------------

let draft          = null;
let configuringDay = null;
let saveMessage    = null;

function defaultDaySlot() {
  return {
    type: "open", sessionType: null, durationMins: null, location: null,
    classFocus: [], activityName: null, label: null, enabled: false
  };
}

function initDraft() {
  const saved = store.get("weeklyPlan") || { days: {}, updatedAt: null };
  draft = { updatedAt: saved.updatedAt || null, days: {} };
  DAYS.forEach(day => {
    const savedDay = (saved.days && saved.days[day]) || {};
    const slot = { ...defaultDaySlot(), ...savedDay };
    if (!Array.isArray(slot.classFocus)) slot.classFocus = [];
    draft.days[day] = slot;
  });
}

// -- Tier check -------------------------------------------------------------

function isPremium() {
  if (typeof store.isPremium === "function") return store.isPremium();
  return store.get("isPremium") || store.get("tier") === "personal" || store.get("tier") === "athlete" || false;
}

// -- Render -------------------------------------------------------------------

export function render() {
  if (!draft) initDraft();
  const premium = isPremium();

  return `
    <div class="view weekly-plan-view">

      <div class="view-header">
        <button class="btn btn-ghost btn-small" id="wp-back-btn" aria-label="Back to Settings">
          &larr; Back
        </button>
        <h1>My Week</h1>
      </div>

      <div style="padding: var(--space-4);">
        ${premium ? renderPremiumContent() : renderLockedContent()}
      </div>

    </div>
  `;
}

// -- Locked (Free tier) -------------------------------------------------------

function renderLockedContent() {
  return `
    <div class="card card-coach" style="margin-bottom: var(--space-4);">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <p class="text-sm">
        Did you know you can plan your whole week in advance? I will use your
        plan as a starting point each day and adapt around how you are feeling
        when the day comes.
      </p>
    </div>
    <div class="card" style="text-align: center; padding: var(--space-6);">
      <p class="text-secondary" style="margin-bottom: var(--space-3);">
        Weekly planning is available on the Personal plan.
      </p>
      <button class="btn btn-primary" id="wp-upgrade-btn" aria-label="Upgrade to Personal plan">
        Upgrade to Personal
      </button>
    </div>
  `;
}

// -- Full feature (Personal / Athlete) ----------------------------------------

function renderPremiumContent() {
  return `
    <p class="text-sm text-muted" style="margin-bottom: var(--space-4);">
      Set what's planned for each day. I will use this as my starting point and
      adapt around your check-in each morning -- today's coaching always takes
      precedence over the plan.
    </p>

    <div class="weekly-plan-table" role="list" aria-label="Weekly plan days">
      ${DAYS.map(day => renderDayRow(day)).join("")}
    </div>

    <button class="btn btn-primary btn-full btn-large" id="wp-save-btn"
            style="margin-top: var(--space-5);"
            aria-label="Save my week">
      Save my week
    </button>

    ${draft.updatedAt ? `
      <p class="text-xs text-muted" style="text-align: center; margin-top: var(--space-2);">
        Last saved ${formatRelativeDate(draft.updatedAt)}
      </p>
    ` : `
      <p class="text-xs text-muted" style="text-align: center; margin-top: var(--space-2);">
        Not saved yet -- days left as "No plan" fall back to normal daily coaching.
      </p>
    `}

    <div id="wp-save-message" role="status" aria-live="polite"
         style="text-align: center; margin-top: var(--space-2); min-height: 1.4em; color: var(--color-primary);">
      ${saveMessage || ""}
    </div>
  `;
}

// -- Day row (collapsed) -------------------------------------------------------

function renderDayRow(day) {
  const slot          = draft.days[day];
  const isConfiguring = configuringDay === day;
  const summary       = daySummary(slot);

  return `
    <div class="weekly-plan-row-wrap" role="listitem">
      <div class="weekly-plan-row ${!slot.enabled ? "weekly-plan-row--off" : ""} ${isConfiguring ? "weekly-plan-row--open" : ""}">

        <button class="weekly-plan-row-day" data-day="${day}"
                aria-expanded="${isConfiguring}"
                aria-label="${DAY_LABELS[day]}: ${summary}. Tap to configure">
          <span class="week-day-name">${DAY_LABELS[day]}</span>
          <span class="week-focus-line">${summary}</span>
        </button>

        <div class="weekly-plan-row-toggle">
          <label class="toggle-switch toggle-switch--sm"
                 aria-label="${slot.enabled ? "Disable" : "Enable"} ${DAY_LABELS[day]}">
            <input type="checkbox" class="weekly-day-toggle" data-day="${day}"
                   role="switch" aria-checked="${slot.enabled}" ${slot.enabled ? "checked" : ""}>
            <span class="toggle-track" aria-hidden="true"></span>
          </label>
        </div>

      </div>
      ${isConfiguring ? renderDayConfig(day) : ""}
    </div>
  `;
}

function daySummary(slot) {
  if (slot.type === "open") return "No plan";
  if (slot.label) return slot.label;

  if (slot.type === "rest")     return "Rest day";
  if (slot.type === "recovery") return "Recovery";

  if (slot.type === "workout") {
    const focus = SESSION_TYPES.find(s => s.id === slot.sessionType);
    return focus ? focus.label : "Workout";
  }

  if (slot.type === "event") {
    return slot.activityName || "Event";
  }

  return "No plan";
}

// -- Day config panel (opens inline below the row) -----------------------------

function renderDayConfig(day) {
  const slot = draft.days[day];

  return `
    <div class="weekly-plan-config-panel" id="day-config-panel-${day}"
         aria-label="Configure ${DAY_LABELS[day]}">

      <p class="config-section-label">What's planned?</p>
      <div class="day-type-list" role="group" aria-label="Day type">
        ${DAY_TYPES.map(t => `
          <button class="day-type-btn ${slot.type === t.id ? "day-type-btn--selected" : ""}"
                  data-day-type="${t.id}" aria-pressed="${slot.type === t.id}">
            <div class="day-type-btn-text">
              <span class="day-type-btn-label">${t.icon} ${t.label}</span>
              <span class="day-type-btn-desc">${t.desc}</span>
            </div>
            ${slot.type === t.id ? `<span class="day-type-btn-check" aria-hidden="true">&#10003;</span>` : ""}
          </button>
        `).join("")}
      </div>

      ${slot.type === "workout" ? renderWorkoutFields(slot) : ""}
      ${slot.type === "event"   ? renderEventFields(slot)   : ""}
      ${(slot.type === "workout" || slot.type === "event") ? renderLocationField(slot) : ""}
      ${slot.type !== "open" ? renderLabelField(slot) : ""}

      <button class="btn btn-primary btn-full" id="day-config-done-btn"
              style="margin-top: var(--space-4);"
              aria-label="Done configuring ${DAY_LABELS[day]}">
        Done
      </button>
    </div>
  `;
}

// -- Workout fields: sessionType (single), classFocus (up to 3), duration -----

function renderWorkoutFields(slot) {
  const otherTypes = SESSION_TYPES.filter(s => s.id !== slot.sessionType);

  return `
    <p class="config-section-label" style="margin-top: var(--space-4);">Today's focus</p>
    <div class="focus-chip-grid" role="group" aria-label="Session type">
      <button class="focus-chip ${!slot.sessionType ? "focus-chip--selected" : ""}"
              data-session-type="null" aria-pressed="${!slot.sessionType}">
        Coach decides
      </button>
      ${SESSION_TYPES.map(s => `
        <button class="focus-chip ${slot.sessionType === s.id ? "focus-chip--selected" : ""}"
                data-session-type="${s.id}" aria-pressed="${slot.sessionType === s.id}">
          ${s.label}
        </button>
      `).join("")}
    </div>

    ${otherTypes.length > 0 ? `
      <p class="config-section-label" style="margin-top: var(--space-4);">
        Add extra focus
        <span class="config-label-hint">optional, up to ${MAX_CLASS_FOCUS}</span>
      </p>
      <div class="focus-chip-grid" role="group" aria-label="Additional session focus">
        ${otherTypes.map(s => `
          <button class="focus-chip ${slot.classFocus.includes(s.id) ? "focus-chip--selected" : ""}"
                  data-class-focus="${s.id}" aria-pressed="${slot.classFocus.includes(s.id)}">
            ${s.label}
          </button>
        `).join("")}
      </div>
    ` : ""}

    ${renderDurationField(slot, "Target duration")}
  `;
}

// -- Event fields: activity name, duration estimate ----------------------------

function renderEventFields(slot) {
  return `
    <p class="config-section-label" style="margin-top: var(--space-4);">
      What is it?
      <span class="config-label-hint">e.g. Tennis, 5-a-side, Body Balance class</span>
    </p>
    <input type="text" id="wp-activity-name" class="form-input"
           placeholder="Activity name"
           value="${slot.activityName || ""}"
           aria-label="Activity name">

    ${renderDurationField(slot, "Estimated duration")}
  `;
}

// -- Duration field (shared by workout and event) -------------------------------

function renderDurationField(slot, heading) {
  return `
    <p class="config-section-label" style="margin-top: var(--space-4);">${heading}</p>
    <div class="focus-chip-grid" role="group" aria-label="${heading}">
      <button class="focus-chip ${!slot.durationMins ? "focus-chip--selected" : ""}"
              data-duration="null" aria-pressed="${!slot.durationMins}">
        Coach decides
      </button>
      ${DURATION_OPTIONS.map(d => `
        <button class="focus-chip ${slot.durationMins === d ? "focus-chip--selected" : ""}"
                data-duration="${d}" aria-pressed="${slot.durationMins === d}">
          ${d} min
        </button>
      `).join("")}
    </div>
  `;
}

// -- Location field (workout and event days) ------------------------------------

function renderLocationField(slot) {
  return `
    <p class="config-section-label" style="margin-top: var(--space-4);">Where</p>
    <div class="focus-chip-grid" role="group" aria-label="Location">
      <button class="focus-chip ${!slot.location ? "focus-chip--selected" : ""}"
              data-location="null" aria-pressed="${!slot.location}">
        Wherever works
      </button>
      ${LOCATIONS.map(l => `
        <button class="focus-chip ${slot.location === l.id ? "focus-chip--selected" : ""}"
                data-location="${l.id}" aria-pressed="${slot.location === l.id}">
          ${l.icon} ${l.label}
        </button>
      `).join("")}
    </div>
  `;
}

// -- Label field (optional nickname, any non-open day) ---------------------------

function renderLabelField(slot) {
  return `
    <p class="config-section-label" style="margin-top: var(--space-4);">
      Nickname
      <span class="config-label-hint">optional, e.g. "Leg day" or "Long run"</span>
    </p>
    <input type="text" id="wp-day-label" class="form-input"
           placeholder="Nickname for this day"
           value="${slot.label || ""}"
           aria-label="Day nickname">
  `;
}

// -- Helpers -----------------------------------------------------------------

function formatRelativeDate(isoString) {
  if (!isoString) return "";
  try {
    const d    = new Date(isoString);
    const now  = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return "today";
    if (diff === 1) return "yesterday";
    return diff + " days ago";
  } catch (e) {
    return "";
  }
}

// -- Wiring ---------------------------------------------------------------------

function rerender() {
  const view = document.querySelector(".weekly-plan-view");
  if (!view) return;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = render();
  const newView = wrapper.querySelector(".weekly-plan-view");
  if (newView) {
    view.replaceWith(newView);
    onMount();
  }
}

// Commit any open inline-input values (activity name / label) from the
// currently-open config panel into the draft before closing or saving.
function commitOpenInputs() {
  if (!configuringDay) return;
  const nameInput  = document.getElementById("wp-activity-name");
  const labelInput = document.getElementById("wp-day-label");
  if (nameInput)  draft.days[configuringDay].activityName = nameInput.value.trim() || null;
  if (labelInput) draft.days[configuringDay].label        = labelInput.value.trim() || null;
}

export function onMount() {
  // Back
  document.getElementById("wp-back-btn")?.addEventListener("click", () => {
    router.back();
  });

  // Upgrade prompt (Free tier)
  document.getElementById("wp-upgrade-btn")?.addEventListener("click", () => {
    router.navigate("upgrade");
  });

  // Row tap -- open/close config
  document.querySelectorAll(".weekly-plan-row-day").forEach(btn => {
    btn.addEventListener("click", () => {
      commitOpenInputs();
      const day = btn.dataset.day;
      configuringDay = configuringDay === day ? null : day;
      saveMessage = null;
      rerender();
    });
  });

  // Per-day enabled toggle
  document.querySelectorAll(".weekly-day-toggle").forEach(input => {
    input.addEventListener("change", () => {
      const day = input.dataset.day;
      if (!day || !draft.days[day]) return;
      draft.days[day].enabled = input.checked;
      rerender();
    });
  });

  // Day type selection
  document.querySelectorAll("[data-day-type]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!configuringDay) return;
      const type = btn.dataset.dayType;
      const slot = draft.days[configuringDay];

      const wasOpen = slot.type === "open";

      draft.days[configuringDay] = {
        ...slot,
        type,
        sessionType:  type === "workout" ? slot.sessionType  : null,
        classFocus:   type === "workout" ? slot.classFocus   : [],
        durationMins: (type === "workout" || type === "event") ? slot.durationMins : null,
        location:     (type === "workout" || type === "event") ? slot.location     : null,
        activityName: type === "event" ? slot.activityName : null,
        label:        type === "open"  ? null               : slot.label,
        // A day moving off "open" becomes active by default; moving to
        // "open" switches it off (nothing planned). Either way the user
        // can override with the per-day toggle.
        enabled: type === "open" ? false : (wasOpen ? true : slot.enabled)
      };

      rerender();
    });
  });

  // Session type (single-select)
  document.querySelectorAll("[data-session-type]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!configuringDay) return;
      const raw = btn.dataset.sessionType;
      const slot = draft.days[configuringDay];
      const newType = raw === "null" ? null : raw;
      // Remove the new sessionType from classFocus if it was there as an "extra"
      slot.sessionType = newType;
      slot.classFocus  = (slot.classFocus || []).filter(id => id !== newType);
      rerender();
    });
  });

  // Class focus (multi-select, up to MAX_CLASS_FOCUS) -- update without full rerender
  document.querySelectorAll("[data-class-focus]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!configuringDay) return;
      const id      = btn.dataset.classFocus;
      const slot    = draft.days[configuringDay];
      const current = slot.classFocus || [];
      const selected = current.includes(id);

      if (!selected && current.length >= MAX_CLASS_FOCUS) return; // cap reached, ignore

      slot.classFocus = selected ? current.filter(x => x !== id) : [...current, id];
      btn.classList.toggle("focus-chip--selected", !selected);
      btn.setAttribute("aria-pressed", String(!selected));
    });
  });

  // Duration chips
  document.querySelectorAll("[data-duration]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!configuringDay) return;
      const raw  = btn.dataset.duration;
      const slot = draft.days[configuringDay];
      slot.durationMins = raw === "null" ? null : parseInt(raw, 10);
      document.querySelectorAll("[data-duration]").forEach(b => {
        const sel = b.dataset.duration === raw;
        b.classList.toggle("focus-chip--selected", sel);
        b.setAttribute("aria-pressed", String(sel));
      });
    });
  });

  // Location chips
  document.querySelectorAll("[data-location]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!configuringDay) return;
      const raw  = btn.dataset.location;
      const slot = draft.days[configuringDay];
      slot.location = raw === "null" ? null : raw;
      document.querySelectorAll("[data-location]").forEach(b => {
        const sel = b.dataset.location === raw;
        b.classList.toggle("focus-chip--selected", sel);
        b.setAttribute("aria-pressed", String(sel));
      });
    });
  });

  // Done -- close config panel
  document.getElementById("day-config-done-btn")?.addEventListener("click", () => {
    commitOpenInputs();
    configuringDay = null;
    saveMessage = null;
    rerender();
  });

  // Save my week
  document.getElementById("wp-save-btn")?.addEventListener("click", () => {
    commitOpenInputs();
    draft.updatedAt = new Date().toISOString();
    store.set("weeklyPlan", {
      days: { ...draft.days },
      updatedAt: draft.updatedAt
    });
    configuringDay = null;
    saveMessage = "Your week is saved. I'll use this as my starting point each day.";
    rerender();
    setTimeout(() => {
      saveMessage = null;
      const msgEl = document.getElementById("wp-save-message");
      if (msgEl) msgEl.textContent = "";
    }, 4000);
  });
}
