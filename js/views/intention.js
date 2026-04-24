/**
 * intention.js - Intention Screen
 *
 * v1.0 — Sits between check-in and activity.
 *   Reads check-in energy from store, responds with a dynamic
 *   coach line, then offers three paths:
 *     A — Coach recommends (current Today experience)
 *     B — I know what I'm doing (activity type selection)
 *     C — Something quieter (mindfulness, journal, rest)
 *
 *   Path B shows an activity type selector and optional name input.
 *   All paths write an activityLog entry to store on navigation.
 */

import { store } from "../store.js";

export const centered = false;

// ── Activity types for Path B ─────────────────────────────────────────────────

const ACTIVITIES = [
  { id: "gym",         label: "Gym session",       icon: "\uD83C\uDFCB", hasName: false },
  { id: "run",         label: "Run",                icon: "\uD83C\uDFC3", hasName: false },
  { id: "walk",        label: "Walk",               icon: "\uD83D\uDEB6", hasName: false },
  { id: "swim",        label: "Swim",               icon: "\uD83C\uDFCA", hasName: false },
  { id: "cycle",       label: "Cycle",              icon: "\uD83D\uDEB4", hasName: false },
  { id: "class",       label: "Class / workshop",   icon: "\uD83E\uDDD8", hasName: true  },
  { id: "yoga",        label: "Yoga / Pilates",     icon: "\uD83E\uDDD8", hasName: false },
  { id: "other",       label: "Something else",     icon: "\u2754",       hasName: true  },
];

const QUIET_OPTIONS = [
  { id: "mindfulness", label: "Mindful movement",   icon: "\uD83C\uDF3F" },
  { id: "journal",     label: "Journal",             icon: "\uD83D\uDCDD" },
  { id: "rest",        label: "Rest day",            icon: "\uD83D\uDECC" },
  { id: "breathing",   label: "Breathing practice",  icon: "\uD83C\uDF2C\uFE0F" },
];

// ── State ─────────────────────────────────────────────────────────────────────

let selectedPath     = null;   // "coach" | "self" | "quiet"
let selectedActivity = null;   // activity id from ACTIVITIES
let selectedQuiet    = null;   // quiet option id
let activityName     = "";     // free text name for class/other

// ── Coach line ────────────────────────────────────────────────────────────────

function buildCoachLine() {
  const checkin   = store.get("lastCheckin") || {};
  const energy    = checkin.energy    || store.get("todayEnergy") || 5;
  const conditions = store.get("conditions") || [];
  const painScores = store.get("conditionPainScores") || {};
  const hasPain   = conditions.some(id => (painScores[id] || 0) >= 3);
  const name      = store.get("name") || "";

  const greeting  = name ? name + ". " : "";

  if (hasPain) {
    return greeting + "I can see things are a bit harder today. I've got options that work with that. What feels right?";
  }
  if (energy >= 7) {
    return greeting + "You're feeling good today. What did you have in mind?";
  }
  if (energy >= 4) {
    return greeting + "A solid day. Not your highest, not your lowest. What are you thinking?";
  }
  return greeting + "Your energy is lower today. That's fine \u2014 there's something here for wherever you are. What feels right?";
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  return `
    <div class="view intention-view">

      <div class="view-header">
        <h1>Today</h1>
      </div>

      <!-- Coach line -->
      <div class="card card-coach intention-coach-card">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${buildCoachLine()}</p>
      </div>

      <!-- Path selector -->
      <div class="intention-paths" role="group" aria-label="What would you like to do today?">

        <button class="intention-path ${selectedPath === "coach" ? "selected" : ""}"
                data-path="coach"
                aria-pressed="${selectedPath === "coach"}">
          <span class="intention-path-icon" aria-hidden="true">\uD83C\uDFAF</span>
          <div class="intention-path-text">
            <span class="intention-path-label">Suggest something for me</span>
            <span class="intention-path-sub">Coach recommends based on today</span>
          </div>
        </button>

        <button class="intention-path ${selectedPath === "self" ? "selected" : ""}"
                data-path="self"
                aria-pressed="${selectedPath === "self"}">
          <span class="intention-path-icon" aria-hidden="true">\uD83C\uDFCB</span>
          <div class="intention-path-text">
            <span class="intention-path-label">I know what I'm doing</span>
            <span class="intention-path-sub">Gym, run, class, swim, walk\u2026</span>
          </div>
        </button>

        <button class="intention-path ${selectedPath === "quiet" ? "selected" : ""}"
                data-path="quiet"
                aria-pressed="${selectedPath === "quiet"}">
          <span class="intention-path-icon" aria-hidden="true">\uD83C\uDF3F</span>
          <div class="intention-path-text">
            <span class="intention-path-label">Something quieter</span>
            <span class="intention-path-sub">Mindfulness, journaling, rest</span>
          </div>
        </button>

      </div>

      <!-- Path B: activity type selector -->
      ${selectedPath === "self" ? `
        <div class="intention-activity-selector" id="activity-selector">
          <p class="intention-selector-label">What are you doing?</p>
          <div class="intention-activity-grid" role="group" aria-label="Activity type">
            ${ACTIVITIES.map(a => `
              <button class="intention-activity-chip ${selectedActivity === a.id ? "selected" : ""}"
                      data-activity="${a.id}"
                      aria-pressed="${selectedActivity === a.id}">
                <span aria-hidden="true">${a.icon}</span>
                ${a.label}
              </button>
            `).join("")}
          </div>

          ${selectedActivity && ACTIVITIES.find(a => a.id === selectedActivity)?.hasName ? `
            <div class="intention-name-field">
              <label class="profile-field-label" for="activity-name-input">
                What's it called?
              </label>
              <input type="text"
                     id="activity-name-input"
                     class="profile-field-input"
                     placeholder="${selectedActivity === "class" ? "e.g. Body Balance, Conditioning workshop" : "e.g. Morning swim"}"
                     value="${activityName}"
                     aria-label="Activity name">
            </div>
          ` : ""}
        </div>
      ` : ""}

      <!-- Path C: quiet options -->
      ${selectedPath === "quiet" ? `
        <div class="intention-activity-selector" id="quiet-selector">
          <p class="intention-selector-label">What feels right?</p>
          <div class="intention-activity-grid" role="group" aria-label="Quiet option">
            ${QUIET_OPTIONS.map(q => `
              <button class="intention-activity-chip ${selectedQuiet === q.id ? "selected" : ""}"
                      data-quiet="${q.id}"
                      aria-pressed="${selectedQuiet === q.id}">
                <span aria-hidden="true">${q.icon}</span>
                ${q.label}
              </button>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Continue button — shown when a valid selection is made -->
      ${canContinue() ? `
        <button class="btn btn-primary btn-large btn-full intention-continue-btn"
                id="intention-continue"
                style="margin-top: var(--space-5);">
          ${getContinueLabel()}
        </button>
      ` : ""}

    </div>
  `;
}

function canContinue() {
  if (selectedPath === "coach") return true;
  if (selectedPath === "self"  && selectedActivity) return true;
  if (selectedPath === "quiet" && selectedQuiet)    return true;
  return false;
}

function getContinueLabel() {
  if (selectedPath === "coach") return "See what you suggest";
  if (selectedPath === "self") {
    const act = ACTIVITIES.find(a => a.id === selectedActivity);
    return "Let's go \u2014 " + (act?.label || "activity");
  }
  if (selectedPath === "quiet") {
    const q = QUIET_OPTIONS.find(q => q.id === selectedQuiet);
    return q?.label || "Continue";
  }
  return "Continue";
}

// ── Navigation ────────────────────────────────────────────────────────────────

function logAndNavigate() {
  // Save activity log entry
  const log = store.get("activityLog") || [];
  const checkin = store.get("lastCheckin") || {};
  const entry = {
    id:            new Date().toISOString() + "_" + Math.random().toString(36).slice(2, 6),
    date:          new Date().toISOString().split("T")[0],
    type:          selectedPath === "coach" ? "coach-session" :
                   selectedPath === "quiet" ? selectedQuiet :
                   selectedActivity,
    name:          activityName.trim() || null,
    energyBefore:  checkin.energy || null,
    source:        selectedPath === "coach" ? "coach-recommended" : "self-directed",
    sessionStart:  new Date().toISOString(),
  };
  store.set("activityLog", [...log, entry]);
  store.set("currentActivityEntry", entry);

  // Navigate
  if (selectedPath === "coach") {
    router.navigate("today");
    return;
  }
  if (selectedPath === "self") {
    if (selectedActivity === "gym") {
      router.navigate("gym-programme");
      return;
    }
    // Other self-directed activities — activity in progress view (Phase 4)
    // For now, navigate to reflect directly with a timer option
    router.navigate("reflect");
    return;
  }
  if (selectedPath === "quiet") {
    // Store the mode so quiet-session.js knows which experience to render
    store.set("quietMode", selectedQuiet || "breathing");
    router.navigate("quiet-session");
    return;
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  const view = document.querySelector(".intention-view");
  if (!view) return;

  view.addEventListener("click", e => {

    // Path selection
    const pathBtn = e.target.closest(".intention-path");
    if (pathBtn) {
      const path = pathBtn.dataset.path;
      selectedPath     = path;
      selectedActivity = null;
      selectedQuiet    = null;
      activityName     = "";
      rerender();
      return;
    }

    // Activity chip
    const activityChip = e.target.closest(".intention-activity-chip[data-activity]");
    if (activityChip) {
      selectedActivity = activityChip.dataset.activity;
      activityName     = "";
      rerender();
      return;
    }

    // Quiet chip
    const quietChip = e.target.closest(".intention-activity-chip[data-quiet]");
    if (quietChip) {
      selectedQuiet = quietChip.dataset.quiet;
      rerender();
      return;
    }

    // Continue
    const continueBtn = e.target.closest("#intention-continue");
    if (continueBtn) {
      // Capture activity name if present
      const nameInput = document.getElementById("activity-name-input");
      if (nameInput) activityName = nameInput.value.trim();
      logAndNavigate();
    }
  });
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}
