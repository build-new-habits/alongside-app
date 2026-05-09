/**
 * intention.js - Intention Screen
 *
 * 9 May 2026 v1
 *
 * v1.1 — Coach path routes to coach-proposal (not today):
 *   "Suggest something for me" now navigates to coach-proposal.js
 *   which reads today's lastCheckin data and builds a personalised
 *   proposal. Previously routed to today.js (old coach view) which
 *   had no check-in data and produced generic suggestions.
 *
 * v1.0 — Sits between check-in and activity.
 *   Reads check-in energy from store, responds with a dynamic
 *   coach line, then offers three paths:
 *     A — Coach recommends (coach-proposal — reads today's check-in)
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

let selectedPath     = null;
let selectedActivity = null;
let selectedQuiet    = null;
let activityName     = "";

// ── Coach line ────────────────────────────────────────────────────────────────

function buildCoachLine() {
  const checkin    = store.get("lastCheckin") || {};
  const energy     = checkin.energy    || store.get("todayEnergy") || 5;
  const conditions = store.get("conditions")        || [];
  const painScores = store.get("conditionPainScores") || {};
  const hasPain    = conditions.some(id => (painScores[id] || 0) >= 3);
  const name       = store.get("name") || "";
  const greeting   = name ? name + ". " : "";

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
          <span class="intention-path-icon" aria-hidden="true">\uD83D\uDCAA</span>
          <div class="intention-path-text">
            <span class="intention-path-label">I know what I want to do</span>
            <span class="intention-path-sub">Pick your activity and go</span>
          </div>
        </button>

        <button class="intention-path ${selectedPath === "quiet" ? "selected" : ""}"
                data-path="quiet"
                aria-pressed="${selectedPath === "quiet"}">
          <span class="intention-path-icon" aria-hidden="true">\uD83C\uDF43</span>
          <div class="intention-path-text">
            <span class="intention-path-label">Something quieter today</span>
            <span class="intention-path-sub">Mindfulness, journaling, or rest</span>
          </div>
        </button>

        <button class="intention-path ${selectedPath === "prescribed" ? "selected" : ""}"
                data-path="prescribed"
                aria-pressed="${selectedPath === "prescribed"}">
          <span class="intention-path-icon" aria-hidden="true">\uD83E\uDE7A</span>
          <div class="intention-path-text">
            <span class="intention-path-label">My prescribed exercises</span>
            <span class="intention-path-sub">From your physio or specialist</span>
          </div>
        </button>

      </div>

      <!-- Sub-options for Path B (self) -->
      ${selectedPath === "self" ? renderSelfOptions() : ""}

      <!-- Sub-options for Path C (quiet) -->
      ${selectedPath === "quiet" ? renderQuietOptions() : ""}

      <!-- Continue button — shown when a valid selection is made -->
      ${canContinue() ? `
        <button class="btn btn-primary btn-full intention-continue"
                id="intention-continue"
                style="margin-top: var(--space-6);">
          ${getContinueLabel()}
        </button>
      ` : ""}

    </div>
  `;
}

// ── Sub-option renderers ──────────────────────────────────────────────────────

function renderSelfOptions() {
  return `
    <div class="intention-sub-options" aria-label="Choose your activity">
      <p class="text-sm text-muted intention-sub-label">What are you doing?</p>
      <div class="intention-activity-grid" role="group" aria-label="Activity type">
        ${ACTIVITIES.map(act => `
          <button class="intention-activity-chip ${selectedActivity === act.id ? "selected" : ""}"
                  data-activity="${act.id}"
                  aria-pressed="${selectedActivity === act.id}"
                  aria-label="${act.label}">
            <span aria-hidden="true">${act.icon}</span>
            ${act.label}
          </button>
        `).join("")}
      </div>
      ${selectedActivity && ACTIVITIES.find(a => a.id === selectedActivity)?.hasName ? `
        <label class="form-label" for="activity-name-input"
               style="margin-top: var(--space-3);">
          Give it a name (optional)
        </label>
        <input type="text" id="activity-name-input" class="form-input"
               placeholder="e.g. Spin class, Body Balance"
               value="${activityName}"
               aria-label="Activity name">
      ` : ""}
    </div>
  `;
}

function renderQuietOptions() {
  return `
    <div class="intention-sub-options" aria-label="Choose a quiet option">
      <p class="text-sm text-muted intention-sub-label">What feels right?</p>
      <div class="intention-activity-grid" role="group" aria-label="Quiet option">
        ${QUIET_OPTIONS.map(q => `
          <button class="intention-activity-chip ${selectedQuiet === q.id ? "selected" : ""}"
                  data-quiet="${q.id}"
                  aria-pressed="${selectedQuiet === q.id}"
                  aria-label="${q.label}">
            <span aria-hidden="true">${q.icon}</span>
            ${q.label}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

// ── Can continue? ─────────────────────────────────────────────────────────────

function canContinue() {
  if (selectedPath === "coach")      return true;
  if (selectedPath === "prescribed") return true;
  if (selectedPath === "self")       return !!selectedActivity;
  if (selectedPath === "quiet")      return !!selectedQuiet;
  return false;
}

function getContinueLabel() {
  if (selectedPath === "coach")      return "See what you suggest";
  if (selectedPath === "prescribed") return "Go to my prescribed exercises";
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
  // Write activity log entry so the session is tracked from the start
  const log     = store.get("activityLog") || [];
  const checkin = store.get("lastCheckin") || {};
  const entry   = {
    id:           new Date().toISOString() + "_" + Math.random().toString(36).slice(2, 6),
    date:         new Date().toISOString().split("T")[0],
    type:         selectedPath === "coach"      ? "coach-session"      :
                  selectedPath === "prescribed" ? "prescribed-session" :
                  selectedPath === "quiet"      ? selectedQuiet        :
                  selectedActivity,
    name:         activityName.trim() || null,
    energyBefore: checkin.energy || null,
    source:       selectedPath === "coach"      ? "coach-recommended" :
                  selectedPath === "prescribed" ? "prescribed"        :
                  "self-directed",
    sessionStart: new Date().toISOString(),
  };
  store.set("activityLog", [...log, entry]);
  store.set("currentActivityEntry", entry);

  // ── Route ─────────────────────────────────────────────────────────────────

  // Coach path → coach-proposal (reads today's lastCheckin data)
  // Previously routed to "today" which had no check-in context.
  if (selectedPath === "coach") {
    router.navigate("coach-proposal");
    return;
  }

  if (selectedPath === "prescribed") {
    router.navigate("prescribed");
    return;
  }

  if (selectedPath === "self") {
    if (selectedActivity === "gym") {
      router.navigate("gym-programme");
      return;
    }
    if (selectedActivity === "yoga") {
      router.navigate("yoga-session");
      return;
    }
    // Other self-directed activities — reflect for now (activity-in-progress Phase 5)
    router.navigate("reflect");
    return;
  }

  if (selectedPath === "quiet") {
    if (selectedQuiet === "journal") {
      store.set("quietMode", "journal");
      router.navigate("quiet-session");
      return;
    }
    if (selectedQuiet === "breathing") {
      store.set("quietMode", "breathing");
      router.navigate("quiet-session");
      return;
    }
    if (selectedQuiet === "mindfulness") {
      store.set("quietMode", "mindful");
      router.navigate("quiet-session");
      return;
    }
    // Rest day — go to reflect
    router.navigate("reflect");
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
      const path   = pathBtn.dataset.path;
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
