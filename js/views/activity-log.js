/**
 * activity-log.js - Universal Activity Logging View
 *
 * 22 May 2026 v1 (S4-3):
 *   Full activity group list: Cardio, Classes, Sport, Outdoor, Mindful and Gentle.
 *   Back button at top -- calls router.back() not localStorage fallback.
 *   Cancel and Done both call router.back().
 *   Duration and feel separated into distinct cards with clear headings.
 *   Hike moved to Outdoor (not Cardio). Mindful and Gentle group added.
 *   Pre-fill from store key "logActivityType" still supported.
 *   Pre-fill from store key "activityLogPrefill" (isEvent, eventName) supported
 *   for weekly plan class day logging.
 *   State reset on every render() call so back-and-forth works cleanly.
 */

import { store } from "../store.js";

export const centered = false;

const ACTIVITY_GROUPS = [
  { group: "Cardio", items: [
    { id: "run",           label: "Run",            icon: "\uD83C\uDFC3" },
    { id: "walk",          label: "Walk",           icon: "\uD83D\uDEB6" },
    { id: "cycle",         label: "Cycle",          icon: "\uD83D\uDEB4" },
    { id: "swim",          label: "Swim",           icon: "\uD83C\uDFCA" },
    { id: "row",           label: "Row",            icon: "\uD83D\uDEA3" },
  ]},
  { group: "Classes", items: [
    { id: "body-balance",  label: "Body Balance",   icon: "\uD83E\uDDD8" },
    { id: "spin",          label: "Spin class",     icon: "\uD83D\uDEB4" },
    { id: "boxing",        label: "Boxing",         icon: "\uD83E\uDD4A" },
    { id: "hiit",          label: "HIIT",           icon: "\u26A1" },
    { id: "class",         label: "Other class",    icon: "\uD83C\uDFE5" },
  ]},
  { group: "Sport", items: [
    { id: "tennis",        label: "Tennis",         icon: "\uD83C\uDFBE" },
    { id: "football",      label: "Football",       icon: "\u26BD" },
    { id: "golf",          label: "Golf",           icon: "\u26F3" },
    { id: "sport",         label: "Other sport",    icon: "\uD83C\uDFC6" },
  ]},
  { group: "Outdoor", items: [
    { id: "hike",          label: "Hike",           icon: "\uD83D\uDC5E" },
    { id: "outdoor-cycle", label: "Outdoor cycle",  icon: "\uD83D\uDEB4" },
    { id: "outdoor",       label: "Other outdoor",  icon: "\uD83C\uDF32" },
  ]},
  { group: "Mindful and Gentle", items: [
    { id: "yoga",          label: "Yoga",           icon: "\uD83E\uDDD8" },
    { id: "pilates",       label: "Pilates",        icon: "\uD83E\uDDD8" },
    { id: "stretching",    label: "Stretching",     icon: "\uD83C\uDF3F" },
    { id: "meditation",    label: "Meditation",     icon: "\uD83E\uDD14" },
    { id: "other",         label: "Something else", icon: "\u2754" },
  ]},
];

const ALL_ITEMS = ACTIVITY_GROUPS.flatMap(g => g.items);

const FEEL_LABELS = ["Very easy", "Easy", "Manageable", "Challenging", "Very hard"];

// ---- State ------------------------------------------------------------------
// Reset on every render() so navigating back and re-entering is clean.
let selectedType  = null;
let durationMins  = 30;
let feelRating    = 3;
let logSaved      = false;
let prefillEvent  = null;  // { isEvent, eventName } from activityLogPrefill

// ---- Helpers ----------------------------------------------------------------

function getTypeLabel(id) {
  return ALL_ITEMS.find(i => i.id === id)?.label || id;
}

// ---- Render -----------------------------------------------------------------

export function render() {
  // Reset state on entry
  selectedType = null;
  durationMins = 30;
  feelRating   = 3;
  logSaved     = false;
  prefillEvent = null;

  // Pre-fill from simple type key (Library / settings log button)
  const preType = store.get("logActivityType");
  if (preType) {
    selectedType = preType;
    store.set("logActivityType", null);
  }

  // Pre-fill from weekly plan class day logging
  const preFill = store.get("activityLogPrefill");
  if (preFill) {
    prefillEvent = preFill;
    if (preFill.type) selectedType = preFill.type;
    store.set("activityLogPrefill", null);
  }

  return renderShell();
}

function renderShell() {
  if (logSaved) return renderSaved();

  return `
    <div class="view activity-log-view">

      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:var(--space-3) 0;margin-bottom:var(--space-2);">
        <button class="btn btn-ghost btn-small" id="activity-back-btn"
                aria-label="Go back">
          &larr; Back
        </button>
        <h1 style="font-size:var(--text-lg);margin:0;">
          ${selectedType ? "Log " + getTypeLabel(selectedType) : "Log what I did"}
        </h1>
        <span style="width:60px;"></span>
      </div>

      <div class="card card-coach" style="margin-bottom:var(--space-4);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p>What did you do? I will note it and factor it into what I suggest next.</p>
      </div>

      ${!selectedType ? renderTypePicker() : renderLogForm()}
    </div>
  `;
}

function renderTypePicker() {
  return `
    <div class="activity-log-picker">
      ${ACTIVITY_GROUPS.map(group => `
        <h3 class="activity-group-heading"
            style="font-size:var(--text-xs);letter-spacing:0.08em;font-weight:var(--font-semibold);
                   color:var(--color-primary);text-transform:uppercase;
                   margin:var(--space-4) 0 var(--space-2);">
          ${group.group}
        </h3>
        <div class="activity-type-grid"
             style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);"
             role="group" aria-label="${group.group} activities">
          ${group.items.map(item => `
            <button class="activity-type-card card"
                    data-type="${item.id}"
                    aria-label="${item.label}"
                    style="display:flex;flex-direction:column;align-items:center;
                           justify-content:center;gap:var(--space-1);
                           padding:var(--space-3) var(--space-2);cursor:pointer;
                           min-height:72px;text-align:center;background:var(--color-surface);">
              <span style="font-size:1.5rem;line-height:1;" aria-hidden="true">${item.icon}</span>
              <span style="font-size:var(--text-xs);line-height:1.2;">${item.label}</span>
            </button>
          `).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function renderLogForm() {
  const typeLabel = getTypeLabel(selectedType);
  const feelText  = FEEL_LABELS[feelRating - 1];

  return `
    <div class="activity-log-form">

      <!-- Selected activity + change -->
      <div style="display:flex;align-items:center;justify-content:space-between;
                  margin-bottom:var(--space-4);">
        <span style="font-size:var(--text-lg);font-weight:var(--font-semibold);
                     color:var(--color-primary);">${typeLabel}</span>
        <button class="btn btn-ghost btn-small" id="activity-change-btn"
                aria-label="Change activity type">Change</button>
      </div>

      <!-- Duration card -->
      <div class="card" style="margin-bottom:var(--space-4);padding:var(--space-4);">
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);
                  margin-bottom:var(--space-4);">How long? (minutes)</p>
        <div style="display:flex;align-items:center;justify-content:center;
                    gap:var(--space-5);">
          <button class="checkin-sleep-btn" id="dur-minus"
                  aria-label="Decrease duration by 5 minutes"
                  style="width:44px;height:44px;flex-shrink:0;">&#8722;</button>
          <div style="text-align:center;min-width:80px;">
            <span class="checkin-sleep-number" id="dur-display"
                  style="font-size:3rem;font-weight:var(--font-semibold);
                         color:var(--color-primary);line-height:1;">${durationMins}</span>
            <span style="font-size:var(--text-sm);color:var(--color-text-secondary);
                         display:block;margin-top:4px;">mins</span>
          </div>
          <button class="checkin-sleep-btn" id="dur-plus"
                  aria-label="Increase duration by 5 minutes"
                  style="width:44px;height:44px;flex-shrink:0;">&#43;</button>
        </div>
      </div>

      <!-- Feel card -->
      <div class="card" style="padding:var(--space-4);">
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);
                  margin-bottom:var(--space-2);">How did it feel?</p>
        <p style="font-size:var(--text-base);font-weight:var(--font-semibold);
                  color:var(--color-text);margin-bottom:var(--space-4);"
           id="activity-feel-label"
           aria-live="polite">${feelText}</p>
        <input type="range" id="activity-feel-slider"
               class="checkin-slider"
               min="1" max="5" step="1" value="${feelRating}"
               aria-label="How did it feel, 1 very easy to 5 very hard"
               aria-valuetext="${feelText}">
        <div class="checkin-slider-ends" aria-hidden="true"
             style="margin-top:var(--space-2);">
          <span>Very easy</span><span>Very hard</span>
        </div>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="activity-save-btn"
              style="margin-top:var(--space-5);">
        Save activity
      </button>
      <button class="btn btn-ghost btn-full" id="activity-cancel-btn"
              style="margin-top:var(--space-3);">
        Cancel
      </button>
    </div>
  `;
}

function renderSaved() {
  const typeLabel = getTypeLabel(selectedType);
  return `
    <div class="view activity-log-view">
      <div class="card card-coach" style="margin-top:var(--space-8);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p style="font-weight:var(--font-semibold);margin-bottom:var(--space-1);">Logged.</p>
          <p>Good work. I will factor that in next time I suggest something.</p>
        </div>
      </div>
      <button class="btn btn-primary btn-full btn-large" id="activity-done-btn"
              style="margin-top:var(--space-5);">
        Done
      </button>
    </div>
  `;
}

// ---- Mount ------------------------------------------------------------------

export function onMount() {

  // Back button -- always router.back()
  document.getElementById("activity-back-btn")?.addEventListener("click", () => {
    resetState();
    router.back();
  });

  // Type picker
  document.querySelectorAll(".activity-type-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedType = card.dataset.type;
      rerender();
    });
  });

  // Change type
  document.getElementById("activity-change-btn")?.addEventListener("click", () => {
    selectedType = null;
    rerender();
  });

  // Duration
  document.getElementById("dur-minus")?.addEventListener("click", () => {
    durationMins = Math.max(5, durationMins - 5);
    const el = document.getElementById("dur-display");
    if (el) el.textContent = durationMins;
  });
  document.getElementById("dur-plus")?.addEventListener("click", () => {
    durationMins = Math.min(180, durationMins + 5);
    const el = document.getElementById("dur-display");
    if (el) el.textContent = durationMins;
  });

  // Feel slider
  const feelSlider = document.getElementById("activity-feel-slider");
  const feelLabel  = document.getElementById("activity-feel-label");
  if (feelSlider && feelLabel) {
    feelSlider.addEventListener("input", () => {
      feelRating = parseInt(feelSlider.value);
      const text = FEEL_LABELS[feelRating - 1];
      feelLabel.textContent = text;
      feelSlider.setAttribute("aria-valuetext", text);
    });
  }

  // Save
  document.getElementById("activity-save-btn")?.addEventListener("click", () => {
    if (!selectedType) return;

    const log = store.get("activityLog") || [];
    const entry = {
      id:       "act-" + Date.now(),
      type:     selectedType,
      name:     getTypeLabel(selectedType),
      source:   "self-logged",
      duration: durationMins,
      feel:     FEEL_LABELS[feelRating - 1].toLowerCase().replace(/ /g, "-"),
      loggedAt: new Date().toISOString(),
    };

    // Weekly plan class day: mark as event
    if (prefillEvent?.isEvent) {
      entry.isEvent   = true;
      entry.eventName = prefillEvent.eventName || getTypeLabel(selectedType);
    }

    log.push(entry);
    store.set("activityLog", log);

    logSaved = true;
    rerender();
  });

  // Done after save
  document.getElementById("activity-done-btn")?.addEventListener("click", () => {
    resetState();
    router.back();
  });

  // Cancel
  document.getElementById("activity-cancel-btn")?.addEventListener("click", () => {
    resetState();
    router.back();
  });
}

function resetState() {
  selectedType = null;
  durationMins = 30;
  feelRating   = 3;
  logSaved     = false;
  prefillEvent = null;
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) { main.innerHTML = renderShell(); onMount(); }
}
