/**
 * activity-log.js - Universal Activity Logging View
 *
 * v0.1 — Stub (S4-3 full build pending)
 *
 * Allows manual logging of any Tier 2 activity.
 * Full build includes: activity type picker, duration, intensity,
 * feel rating, coach reflection, activityLog write.
 */

import { store } from "../store.js";

export const centered = false;

// Pre-set activity type if navigated from Library
let activityType = null;

const ACTIVITY_GROUPS = [
  { group: "Cardio", items: [
    { id: "run", label: "Run", icon: "\uD83C\uDFC3" },
    { id: "walk", label: "Walk", icon: "\uD83D\uDEB6" },
    { id: "cycle", label: "Cycle", icon: "\uD83D\uDEB4" },
    { id: "swim", label: "Swim", icon: "\uD83C\uDFCA" },
    { id: "row", label: "Row", icon: "\uD83D\uDEA3" },
  ]},
  { group: "Classes", items: [
    { id: "body-balance", label: "Body Balance", icon: "\uD83E\uDDD8" },
    { id: "spin", label: "Spin / cycle class", icon: "\uD83D\uDEB4" },
    { id: "boxing", label: "Boxing", icon: "\uD83E\uDD4A" },
    { id: "hiit", label: "HIIT / circuits", icon: "\uD83D\uDD25" },
    { id: "class", label: "Other class", icon: "\uD83C\uDFE5" },
  ]},
  { group: "Sport", items: [
    { id: "tennis", label: "Tennis", icon: "\uD83C\uDFBE" },
    { id: "football", label: "Football", icon: "\u26BD" },
    { id: "golf", label: "Golf", icon: "\u26F3" },
    { id: "sport", label: "Other sport", icon: "\uD83C\uDFC6" },
  ]},
  { group: "Outdoor", items: [
    { id: "hike", label: "Hike", icon: "\u26F0" },
    { id: "outdoor-cycle", label: "Outdoor cycle", icon: "\uD83D\uDEB4" },
    { id: "outdoor", label: "Other outdoor", icon: "\uD83C\uDF32" },
  ]},
];

const FEEL_LABELS = ["Very easy", "Easy", "Manageable", "Challenging", "Very hard"];

let selectedType   = null;
let durationMins   = 30;
let feelRating     = 3;
let logSaved       = false;

export function render() {
  activityType = store.get("logActivityType") || null;
  if (activityType) selectedType = activityType;

  if (logSaved) return renderSaved();

  return `
    <div class="view activity-log-view">
      <div class="view-header">
        <h1>Log an Activity</h1>
        <p class="text-secondary">You did the work. Let's capture it.</p>
      </div>

      <div class="card card-coach" style="margin-bottom:var(--space-5);">
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
        <h3 class="activity-group-heading">${group.group}</h3>
        <div class="activity-type-grid">
          ${group.items.map(item => `
            <button class="activity-type-card" data-type="${item.id}"
                    aria-label="${item.label}">
              <span aria-hidden="true">${item.icon}</span>
              <span>${item.label}</span>
            </button>
          `).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function renderLogForm() {
  const typeLabel = ACTIVITY_GROUPS
    .flatMap(g => g.items)
    .find(i => i.id === selectedType)?.label || selectedType;

  return `
    <div class="activity-log-form">
      <div class="activity-log-selected">
        <span class="activity-log-type">${typeLabel}</span>
        <button class="btn btn-ghost btn-small" id="activity-change-btn">Change</button>
      </div>

      <div class="card" style="margin-top:var(--space-4);">
        <div class="form-field">
          <label class="form-label">How long? (minutes)</label>
          <div class="activity-duration-row">
            <button class="checkin-sleep-btn" id="dur-minus" aria-label="Less">&#8722;</button>
            <div style="flex:1;text-align:center;">
              <span class="checkin-sleep-number" id="dur-display">${durationMins}</span>
              <span class="checkin-sleep-unit">mins</span>
            </div>
            <button class="checkin-sleep-btn" id="dur-plus" aria-label="More">&#43;</button>
          </div>
        </div>

        <div class="form-field" style="margin-top:var(--space-4);">
          <label class="form-label" for="activity-feel-slider">
            How did it feel?
            <span id="activity-feel-label" class="text-muted"> — ${FEEL_LABELS[feelRating - 1]}</span>
          </label>
          <input type="range" id="activity-feel-slider"
                 class="checkin-slider"
                 min="1" max="5" step="1" value="${feelRating}"
                 aria-label="How did it feel, 1 very easy to 5 very hard"
                 aria-valuetext="${FEEL_LABELS[feelRating - 1]}">
          <div class="checkin-slider-ends" aria-hidden="true">
            <span>Very easy</span><span>Very hard</span>
          </div>
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
  return `
    <div class="view activity-log-view">
      <div class="card card-coach" style="margin-top:var(--space-8);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h3>Logged.</h3>
          <p>Good work. I will factor that in next time I suggest something.</p>
        </div>
      </div>
      <button class="btn btn-primary btn-full" id="activity-done-btn"
              style="margin-top:var(--space-5);">
        Done
      </button>
    </div>
  `;
}

export function onMount() {
  store.set("logActivityType", null); // clear the pre-set

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
      feelLabel.textContent = " \u2014 " + FEEL_LABELS[feelRating - 1];
      feelSlider.setAttribute("aria-valuetext", FEEL_LABELS[feelRating - 1]);
    });
  }

  // Save
  document.getElementById("activity-save-btn")?.addEventListener("click", () => {
    if (!selectedType) return;

    // PT-6 / PT-3, 12 Aug 2026. Bypassed store.logActivity(), and wrote
    // `duration` and `loggedAt` where progress.js reads `durationMins`
    // and `completedAt`.
    //
    // This is the worst place for that fault to sit: it is the screen
    // where somebody manually logs a session they were pleased with -- a
    // swim, a long walk, a game of football -- and Progress then counted
    // every one of them as zero minutes. Somebody deliberately telling
    // the app what they did, and the app not hearing it.
    const nowIso = new Date().toISOString();
    store.logActivity({
      id:            "act-" + Date.now(),
      type:          selectedType,
      name:          ACTIVITY_GROUPS.flatMap(g => g.items).find(i => i.id === selectedType)?.label || selectedType,
      source:        "self-logged",
      status:        "completed",
      durationMins:  durationMins,
      feel:          FEEL_LABELS[feelRating - 1].toLowerCase().replace(" ", "-"),
      creditsEarned: 20,
      completedAt:   nowIso,
      sessionEnd:    nowIso
    });
    store.set("totalCredits", (store.get("totalCredits") || 0) + 20);

    logSaved = true;
    rerender();
  });

  // Done / cancel
  function goBack() {
    logSaved = false; selectedType = null;
    const prev = localStorage.getItem("alongside_previousView") || "settings";
    router.navigate(prev);
  }
  document.getElementById("activity-done-btn")?.addEventListener("click", goBack);
  document.getElementById("activity-cancel-btn")?.addEventListener("click", goBack);
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) { main.innerHTML = render(); onMount(); }
}
