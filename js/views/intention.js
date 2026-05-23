/**
 * intention.js - Intention Screen
 *
 * 22 May 2026 v2 --- Location interstitial added to "Suggest something for me" path (S4-3):
 *   Tapping "Suggest something for me" now shows a location question before
 *   navigating to coach-proposal. Location = intent, captured at moment of decision.
 *   Four options: At home / At the gym / Outside / Not sure.
 *   Stores to sessionLocation in store. "Not sure" stores null (coach uses history).
 *   Weekly plan check: if plan is enabled and today has a non-open type,
 *   location is skipped -- the plan already implies location context.
 *
 * 22 May 2026 v1 --- Gym session routes via coach-proposal gym-sub screen
 *                   instead of navigating directly to gym-programme.
 *
 * v1.0 --- Sits between check-in and activity.
 *   Reads check-in energy from store, responds with a dynamic
 *   coach line, then offers three paths:
 *     A -- Coach recommends (current Today experience)
 *     B -- I know what I'm doing (activity type selection)
 *     C -- Something quieter (mindfulness, journal, rest)
 */

import { store } from "../store.js";

export const centered = false;

// -- Location options (shown on "Suggest something for me" path) -------------

const LOCATION_OPTIONS = [
  { value: "home",     label: "At home",    icon: "H",  desc: "Home equipment, bodyweight, or outdoors nearby" },
  { value: "gym",      label: "At the gym", icon: "G",  desc: "Gym equipment, machines, pool" },
  { value: "outdoors", label: "Outside",    icon: "O",  desc: "Run, walk, cycle, sport, or nature" },
  { value: "skip",     label: "Not sure",   icon: "?",  desc: "Coach will decide based on your history" }
];

// -- Activity types for Path B -----------------------------------------------

const ACTIVITIES = [
  { id: "gym",     label: "Gym session",      icon: "W", hasName: false },
  { id: "run",     label: "Run",              icon: "R", hasName: false },
  { id: "walk",    label: "Walk",             icon: "K", hasName: false },
  { id: "swim",    label: "Swim",             icon: "S", hasName: false },
  { id: "cycle",   label: "Cycle",            icon: "C", hasName: false },
  { id: "class",   label: "Class / workshop", icon: "Y", hasName: true  },
  { id: "yoga",    label: "Yoga / Pilates",   icon: "P", hasName: false },
  { id: "other",   label: "Something else",   icon: "?", hasName: true  },
];

const QUIET_OPTIONS = [
  { id: "mindfulness", label: "Mindful movement",  icon: "M" },
  { id: "journal",     label: "Journal",            icon: "J" },
  { id: "rest",        label: "Rest day",           icon: "Z" },
  { id: "breathing",   label: "Breathing practice", icon: "B" },
];

// -- State -------------------------------------------------------------------

let selectedPath     = null;   // "coach" | "self" | "quiet" | "prescribed"
let selectedActivity = null;   // activity id from ACTIVITIES
let selectedQuiet    = null;   // quiet option id
let activityName     = "";     // free text name for class/other
let showingLocation  = false;  // true when location interstitial is visible
let selectedLocation = null;   // "home" | "gym" | "outdoors" | "skip"

// -- Helpers -----------------------------------------------------------------

function todayHasPlan() {
  const enabled = store.get("weeklyPlanEnabled");
  if (!enabled) return false;
  const day  = new Date().toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase();
  const plan = store.get("weeklyPlan")?.[day];
  return plan && plan.type && plan.type !== "open";
}

// -- Coach line --------------------------------------------------------------

function buildCoachLine() {
  const checkin    = store.get("lastCheckin") || {};
  const energy     = checkin.energy || store.get("todayEnergy") || 5;
  const conditions = store.get("conditions") || [];
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
  return greeting + "Your energy is lower today. That's fine -- there's something here for wherever you are. What feels right?";
}

// -- Render ------------------------------------------------------------------

export function render() {
  if (showingLocation) return renderLocationInterstitial();
  return renderPathSelector();
}

function renderPathSelector() {
  return `
    <div class="view intention-view">

      <div class="view-header">
        <h1>Today</h1>
      </div>

      <div class="card card-coach intention-coach-card">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${buildCoachLine()}</p>
      </div>

      <div class="intention-paths" role="group" aria-label="What would you like to do today?">

        <button class="intention-path ${selectedPath === "coach" ? "selected" : ""}"
                data-path="coach"
                aria-pressed="${selectedPath === "coach"}">
          <span class="intention-path-icon" aria-hidden="true">&#127919;</span>
          <div class="intention-path-text">
            <span class="intention-path-label">Suggest something for me</span>
            <span class="intention-path-sub">Coach recommends based on today</span>
          </div>
        </button>

        <button class="intention-path ${selectedPath === "self" ? "selected" : ""}"
                data-path="self"
                aria-pressed="${selectedPath === "self"}">
          <span class="intention-path-icon" aria-hidden="true">&#127947;</span>
          <div class="intention-path-text">
            <span class="intention-path-label">I know what I'm doing</span>
            <span class="intention-path-sub">Gym, run, class, swim, walk...</span>
          </div>
        </button>

        <button class="intention-path ${selectedPath === "quiet" ? "selected" : ""}"
                data-path="quiet"
                aria-pressed="${selectedPath === "quiet"}">
          <span class="intention-path-icon" aria-hidden="true">&#127807;</span>
          <div class="intention-path-text">
            <span class="intention-path-label">Something quieter</span>
            <span class="intention-path-sub">Mindfulness, journaling, rest</span>
          </div>
        </button>

        <button class="intention-path ${selectedPath === "prescribed" ? "selected" : ""}"
                data-path="prescribed"
                aria-pressed="${selectedPath === "prescribed"}">
          <span class="intention-path-icon" aria-hidden="true">&#129658;</span>
          <div class="intention-path-text">
            <span class="intention-path-label">My prescribed exercises</span>
            <span class="intention-path-sub">From your physio or consultant</span>
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
                ${q.label}
              </button>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Continue button -->
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

function renderLocationInterstitial() {
  return `
    <div class="view intention-view">

      <div class="view-header">
        <button class="btn btn-ghost btn-sm" id="location-back-btn"
                aria-label="Back to options"
                style="background:none;border:none;color:var(--color-text-secondary);
                       cursor:pointer;padding:0;font-size:var(--text-sm);">
          &larr; Back
        </button>
      </div>

      <div class="card card-coach intention-coach-card">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">One quick thing -- where are you planning to move today?</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-3);margin-top:var(--space-2);"
           role="group" aria-label="Where are you training today?">
        ${LOCATION_OPTIONS.map(opt => {
          const isSel = selectedLocation === opt.value;
          return `
            <button class="intention-location-btn"
                    data-location="${opt.value}"
                    aria-pressed="${isSel}"
                    aria-label="${opt.label}: ${opt.desc}"
                    style="display:flex;align-items:center;gap:var(--space-3);
                           padding:var(--space-4);border-radius:var(--radius-lg,12px);
                           text-align:left;width:100%;cursor:pointer;
                           background:${isSel ? "rgba(20,184,166,0.15)" : "var(--color-surface)"};
                           border:2px solid ${isSel ? "var(--color-primary)" : "rgba(255,255,255,0.08)"};
                           transition:background 0.15s,border-color 0.15s;">
              <div style="flex:1;min-width:0;">
                <p style="font-size:var(--text-base);font-weight:var(--font-semibold);
                           color:${isSel ? "var(--color-primary)" : "var(--color-text)"};
                           margin:0 0 2px;">${opt.label}</p>
                <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin:0;">
                  ${opt.desc}
                </p>
              </div>
              ${isSel ? `
                <span style="color:var(--color-primary);font-size:1.1rem;flex-shrink:0;"
                      aria-hidden="true">&#10003;</span>
              ` : ""}
            </button>
          `;
        }).join("")}
      </div>

      <div style="margin-top:var(--space-5);">
        <button class="btn btn-primary btn-large btn-full"
                id="location-continue-btn"
                ${!selectedLocation ? "disabled" : ""}
                aria-disabled="${!selectedLocation}">
          ${selectedLocation ? "See what I'm thinking" : "Choose where you are heading"}
        </button>
      </div>

    </div>
  `;
}

function canContinue() {
  if (selectedPath === "coach")      return true;
  if (selectedPath === "prescribed") return true;
  if (selectedPath === "self"  && selectedActivity) return true;
  if (selectedPath === "quiet" && selectedQuiet)    return true;
  return false;
}

function getContinueLabel() {
  if (selectedPath === "coach")      return "See what you suggest";
  if (selectedPath === "prescribed") return "Go to my prescribed exercises";
  if (selectedPath === "self") {
    const act = ACTIVITIES.find(a => a.id === selectedActivity);
    return "Let's go -- " + (act?.label || "activity");
  }
  if (selectedPath === "quiet") {
    const q = QUIET_OPTIONS.find(q => q.id === selectedQuiet);
    return q?.label || "Continue";
  }
  return "Continue";
}

// -- Navigation --------------------------------------------------------------

function handleCoachPath() {
  // If a weekly plan covers today, skip location -- plan implies context
  if (todayHasPlan()) {
    commitAndNavigateToCoach();
    return;
  }
  // Show location interstitial
  showingLocation = true;
  selectedLocation = null;
  rerender();
}

function commitAndNavigateToCoach() {
  logActivityEntry();
  router.navigate("coach-proposal");
}

function logActivityEntry() {
  const log     = store.get("activityLog") || [];
  const checkin = store.get("lastCheckin") || {};
  const entry   = {
    id:           new Date().toISOString() + "_" + Math.random().toString(36).slice(2, 6),
    date:         new Date().toISOString().split("T")[0],
    type:         selectedPath === "coach"      ? "coach-session" :
                  selectedPath === "prescribed" ? "prescribed-session" :
                  selectedPath === "quiet"      ? selectedQuiet :
                  selectedActivity,
    name:         activityName.trim() || null,
    energyBefore: checkin.energy || null,
    source:       selectedPath === "coach"      ? "coach-recommended" :
                  selectedPath === "prescribed" ? "prescribed" :
                  "self-directed",
    sessionStart: new Date().toISOString(),
  };
  store.set("activityLog", [...log, entry]);
  store.set("currentActivityEntry", entry);
}

function logAndNavigate() {
  logActivityEntry();

  if (selectedPath === "prescribed") {
    router.navigate("prescribed");
    return;
  }
  if (selectedPath === "self") {
    if (selectedActivity === "gym") {
      store.set("openGymSub", true);
      router.navigate("coach-proposal");
      return;
    }
    router.navigate("reflect");
    return;
  }
  if (selectedPath === "quiet") {
    router.navigate("reflect");
    return;
  }
}

// -- Mount -------------------------------------------------------------------

export function onMount() {
  const view = document.querySelector(".intention-view");
  if (!view) return;

  view.addEventListener("click", e => {

    // Back from location interstitial
    const locationBackBtn = e.target.closest("#location-back-btn");
    if (locationBackBtn) {
      showingLocation  = false;
      selectedLocation = null;
      rerender();
      return;
    }

    // Location option selected
    const locationBtn = e.target.closest(".intention-location-btn");
    if (locationBtn) {
      selectedLocation = locationBtn.dataset.location;
      // Update button styles without full rerender
      view.querySelectorAll(".intention-location-btn").forEach(b => {
        const isSel = b.dataset.location === selectedLocation;
        b.style.background   = isSel ? "rgba(20,184,166,0.15)" : "var(--color-surface)";
        b.style.borderColor  = isSel ? "var(--color-primary)" : "rgba(255,255,255,0.08)";
        b.setAttribute("aria-pressed", isSel);
        const nameEl = b.querySelector("p:first-child");
        if (nameEl) nameEl.style.color = isSel ? "var(--color-primary)" : "var(--color-text)";
      });
      // Enable continue button
      const continueBtn = document.getElementById("location-continue-btn");
      if (continueBtn) {
        continueBtn.disabled = false;
        continueBtn.removeAttribute("aria-disabled");
        continueBtn.textContent = "See what I'm thinking";
      }
      return;
    }

    // Location continue
    const locationContinueBtn = e.target.closest("#location-continue-btn");
    if (locationContinueBtn && selectedLocation) {
      // Save location --- "skip" means null (coach uses history)
      store.set("sessionLocation", selectedLocation === "skip" ? null : selectedLocation);
      showingLocation = false;
      commitAndNavigateToCoach();
      return;
    }

    // Path selection
    const pathBtn = e.target.closest(".intention-path");
    if (pathBtn) {
      const path = pathBtn.dataset.path;
      if (path === "coach") {
        selectedPath     = "coach";
        selectedActivity = null;
        selectedQuiet    = null;
        activityName     = "";
        // Coach path goes to location interstitial (unless plan covers today)
        handleCoachPath();
        return;
      }
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

    // Continue (non-coach paths)
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
