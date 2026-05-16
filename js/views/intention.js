/**
 * intention.js - Intention Screen
 *
 * 13 May 2026 v1
 *
 * v1.3 — Return-visit abbreviated check-in prompt (NS-3):
 *   If store.returnVisit is true (set by router on second+ visit today),
 *   a soft coach card appears above the paths: "Anything changed since
 *   this morning?" with two options:
 *     "No, I'm good" — dismisses the card, proceeds normally
 *     "Yes, tell the coach" — navigates to checkin-mini (3 questions only)
 *   Once dismissed, the card does not appear again in this session
 *   (returnVisit is cleared from store).
 *
 * v1.2 — Single-tap navigation (no Continue button for most paths):
 *   - coach path: tap → navigate to coach-proposal immediately
 *   - prescribed path: tap → navigate to prescribed immediately
 *   - quiet path: tap path → show quiet options →
 *       tap quiet option → navigate immediately (no Continue)
 *   - self path: tap path → show activity picker →
 *       tap activity → navigate immediately (no Continue)
 *       EXCEPTION: class/other (hasName: true) shows name field + Continue
 *         so the user can type the name before proceeding
 *
 * v1.1 — coach path fixed to navigate to coach-proposal not today
 * v1.0 — Sits between check-in and activity
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
  { id: "mindfulness", label: "Mindful movement",  icon: "\uD83C\uDF3F"      },
  { id: "journal",     label: "Journal",            icon: "\uD83D\uDCDD"      },
  { id: "rest",        label: "Rest day",           icon: "\uD83D\uDECC"      },
  { id: "breathing",   label: "Breathing practice", icon: "\uD83C\uDF2C\uFE0F" },
];

// ── State ─────────────────────────────────────────────────────────────────────

let selectedPath     = null;
let returnPromptDismissed = false;  // tracks if user dismissed the "anything changed?" card
let selectedActivity = null;
let selectedQuiet    = null;
let activityName     = "";

// ── Coach line ────────────────────────────────────────────────────────────────

function buildCoachLine() {
  const checkin    = store.get("lastCheckin") || {};
  const energy     = checkin.energy || store.get("todayEnergy") || 5;
  const conditions = store.get("conditions") || [];
  const painScores = store.get("conditionPainScores") || {};
  const hasPain    = conditions.some(id => (painScores[id] || 0) >= 3);
  const name       = store.get("name") || "";
  const greeting   = name ? name + ". " : "";

  if (hasPain) {
    return greeting + "I can see things are a bit harder today. I\u2019ve got options that work with that. What feels right?";
  }
  if (energy >= 7) {
    return greeting + "You\u2019re feeling good today. What did you have in mind?";
  }
  if (energy >= 4) {
    return greeting + "A solid day. Not your highest, not your lowest. What are you thinking?";
  }
  return greeting + "Your energy is lower today. That\u2019s fine \u2014 there\u2019s something here for wherever you are. What feels right?";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns true if this activity requires a name input before navigating.
 * Only class and "other" need a name — everything else navigates immediately.
 */
function needsName(activityId) {
  return ACTIVITIES.find(a => a.id === activityId)?.hasName === true;
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const isReturnVisit = store.get("returnVisit") === true;
  return `
    <div class="view intention-view">

      <div class="view-header">
        <h1>Today</h1>
      </div>

      <div class="card card-coach intention-coach-card">
        <img src="assets/images/logo-icon-192.png" alt=""
             class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${buildCoachLine()}</p>
      </div>

      <!-- Return-visit prompt — shown on second+ visit same day -->
      ${isReturnVisit && !returnPromptDismissed ? `
        <div class="card card-coach intention-return-card" role="status">
          <img src="assets/images/logo-icon-192.png" alt=""
               class="coach-icon-small" aria-hidden="true">
          <div class="intention-return-body">
            <p class="coach-message-text">Anything changed since this morning?</p>
            <div class="intention-return-actions">
              <button class="btn btn-ghost btn-sm intention-return-no"
                      aria-label="No, nothing has changed, proceed to activity">
                No, I'm good
              </button>
              <button class="btn btn-secondary btn-sm intention-return-yes"
                      aria-label="Yes, update the coach on how I'm feeling">
                Yes, tell the coach
              </button>
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Main paths — all navigate immediately except "self" which expands -->
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

      <!-- Path B (self): activity type selector — navigates immediately on chip tap -->
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

          ${selectedActivity && needsName(selectedActivity) ? `
            <div class="intention-name-field">
              <label class="profile-field-label" for="activity-name-input">
                What\u2019s it called? <span class="text-muted">(optional)</span>
              </label>
              <input type="text"
                     id="activity-name-input"
                     class="profile-field-input"
                     placeholder="${selectedActivity === "class" ? "e.g. Body Balance, Conditioning" : "e.g. Morning session"}"
                     value="${activityName}"
                     aria-label="Activity name">
              <button class="btn btn-primary btn-large btn-full"
                      id="intention-continue"
                      style="margin-top: var(--space-4);">
                Let\u2019s go
              </button>
            </div>
          ` : ""}
        </div>
      ` : ""}

      <!-- Path C (quiet): options — navigates immediately on chip tap -->
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

    </div>
  `;
}

// ── Navigation ────────────────────────────────────────────────────────────────

function logAndNavigate() {
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
    status:       "started",
  };
  store.set("activityLog", [...log, entry]);
  store.set("currentActivityEntry", entry);

  // ── Route ──────────────────────────────────────────────────────────────────

  if (selectedPath === "coach") {
    router.navigate("coach-proposal");
    return;
  }

  if (selectedPath === "prescribed") {
    router.navigate("prescribed");
    return;
  }

  if (selectedPath === "self") {
    if (selectedActivity === "gym")  { router.navigate("gym-programme"); return; }
    if (selectedActivity === "yoga") { router.navigate("yoga-session");  return; }
    if (selectedActivity === "walk") { router.navigate("walk-session");  return; }
    if (selectedActivity === "run")  { router.navigate("activity-log");  return; }
    if (selectedActivity === "swim") { router.navigate("activity-log");  return; }
    if (selectedActivity === "cycle"){ router.navigate("activity-log");  return; }
    // class / other / remaining
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
    // rest day
    router.navigate("reflect");
    return;
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  const view = document.querySelector(".intention-view");
  if (!view) return;

  view.addEventListener("click", e => {

    // ── Return-visit prompt ───────────────────────────────────────────────────
    if (e.target.closest(".intention-return-no")) {
      returnPromptDismissed = true;
      store.set("returnVisit", false);
      rerender();
      return;
    }

    if (e.target.closest(".intention-return-yes")) {
      store.set("returnVisit", false);
      router.navigate("checkin-mini");
      return;
    }


    // ── Path tap ──────────────────────────────────────────────────────────────
    const pathBtn = e.target.closest(".intention-path");
    if (pathBtn) {
      const path = pathBtn.dataset.path;
      if (!path) return;

      // coach and prescribed → navigate immediately, no second tap needed
      if (path === "coach" || path === "prescribed") {
        selectedPath     = path;
        selectedActivity = null;
        selectedQuiet    = null;
        activityName     = "";
        logAndNavigate();
        return;
      }

      // self and quiet → show sub-options (they navigate on chip tap)
      selectedPath     = path;
      selectedActivity = null;
      selectedQuiet    = null;
      activityName     = "";
      rerender();
      return;
    }

    // ── Activity chip (self path) ─────────────────────────────────────────────
    const activityChip = e.target.closest(".intention-activity-chip[data-activity]");
    if (activityChip) {
      const id = activityChip.dataset.activity;
      selectedActivity = id;
      activityName     = "";

      if (needsName(id)) {
        // Show name field + Continue button — user needs to type name first
        rerender();
      } else {
        // Navigate immediately
        logAndNavigate();
      }
      return;
    }

    // ── Quiet chip ────────────────────────────────────────────────────────────
    const quietChip = e.target.closest(".intention-activity-chip[data-quiet]");
    if (quietChip) {
      selectedQuiet = quietChip.dataset.quiet;
      logAndNavigate();
      return;
    }

    // ── Continue button (only shown for class/other with name field) ──────────
    const continueBtn = e.target.closest("#intention-continue");
    if (continueBtn) {
      const nameInput = document.getElementById("activity-name-input");
      if (nameInput) activityName = nameInput.value.trim();
      logAndNavigate();
      return;
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
