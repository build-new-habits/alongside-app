/**
 * intention.js - Intention Screen
 *
 * 15 Jun 2026 v4 (S4-9/10) - "Something quieter > Breathing practice" now
 *   routes to breathing-session.js (the fully built 5-type/all-duration
 *   player) instead of straight to reflect.js, which previously did
 *   nothing breathing-related at all. No activityLog entry is written
 *   here for this case -- breathing-session.js logs its own entry on
 *   completion/exit and returns to "noticing", matching its existing
 *   behaviour from the Noticing tab. The other three quiet options
 *   (journal/rest/mindfulness) are unchanged -- journal and mindfulness
 *   have their own known gaps, flagged separately (S4-13/14 and the
 *   quiet-session.js mindful fix respectively), out of scope here.
 *
 * 15 Jun 2026 v3 (S4-6) - Game/sport logging flow:
 *   Path B (self-directed activities, non-gym) now shows a duration chip
 *   picker (15/30/45/60/90+ min, default 30 -- "pre-fill, let them adjust"
 *   pattern, same as sleep/mood elsewhere) once an activity is selected.
 *   logAndNavigate() writes this onto the new activityLog entry as
 *   `duration` -- matching the field name already used by reflect.js's
 *   buildSummary() and morning-session.js's logActivity(), NOT the
 *   `durationMins` name in schema.md (pre-existing doc/code mismatch,
 *   flagged for a future tidy-up, not fixed here).
 *
 *   Entries also gain `isEvent` / `eventName` (schema.md Section 12,
 *   added v1.4): true/set only for the "class" and "other" activity
 *   types when a name has been entered -- those are the only Path B
 *   types with a free-text name field, and a named activity is the
 *   natural definition of an "event" here. "Training vs match" is left
 *   to the free-text name itself (e.g. "Tennis match" vs "Tennis
 *   practice") rather than a separate UI step.
 *
 *   reflect.js needs no changes -- saveAndSummarise() spreads the
 *   original entry, so duration/isEvent/eventName pass through untouched
 *   and durRef in buildSummary() now picks up real values for these
 *   entries.
 *
 * 13 Jun 2026 v2 - Light-touch fix (S4-4 follow-up): removed the
 *   lastCheckin.timestamp fallback (ensureCheckinTimestamp()). checkin.js
 *   v2 now stamps this field directly at submission, which is the
 *   correct, permanent location per schema.md v1.5/v1.6 Section 2. The
 *   return-visit trigger below is unaffected - it just reads the field,
 *   which is now always reliably set by checkin.js.
 *
 * 12 Jun 2026 v1 (S4-4 P1) - Return-visit trigger added:
 *   If 2+ hours have passed since lastCheckin.timestamp and the user
 *   has not yet done a return-visit update today (returnVisit flag),
 *   a coach prompt offers "Yes, tell the coach" / "No, all good".
 *   "Yes" navigates to checkin-mini. "No" dismisses for the day.
 *
 * 22 May 2026 v1 - Gym session routes via coach-proposal gym-sub screen
 *                   instead of navigating directly to gym-programme.
 *
 * v1.0 - Sits between check-in and activity.
 *   Reads check-in energy from store, responds with a dynamic
 *   coach line, then offers three paths:
 *     A - Coach recommends (current Today experience)
 *     B - I know what I'm doing (activity type selection)
 *     C - Something quieter (mindfulness, journal, rest)
 *
 *   Path B shows an activity type selector and optional name input.
 *   All paths write an activityLog entry to store on navigation.
 */

import { store } from "../store.js";

export const centered = false;

// -- Constants ----------------------------------------------------------------

const RETURN_VISIT_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

const DEFAULT_DURATION = 30; // minutes

// -- Activity types for Path B -------------------------------------------------

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

// -- Duration options for Path B (non-gym) -------------------------------------
// "How long are you planning?" -- written to the activityLog entry as
// `duration` (matches reflect.js buildSummary() / morning-session.js
// logActivity(), not schema.md's `durationMins`). Default 30 -- pre-filled,
// adjustable, same pattern as sleep/mood pre-fills elsewhere.

const DURATION_OPTIONS = [
  { v: 15, l: "15 min"   },
  { v: 30, l: "30 min"   },
  { v: 45, l: "45 min"   },
  { v: 60, l: "1 hour"   },
  { v: 90, l: "1.5 hrs+" },
];

const QUIET_OPTIONS = [
  { id: "mindfulness", label: "Mindful movement",   icon: "\uD83C\uDF3F" },
  { id: "journal",     label: "Journal",             icon: "\uD83D\uDCDD" },
  { id: "rest",        label: "Rest day",            icon: "\uD83D\uDECC" },
  { id: "breathing",   label: "Breathing practice",  icon: "\uD83C\uDF2C\uFE0F" },
];

// -- State ---------------------------------------------------------------------

let selectedPath     = null;   // "coach" | "self" | "quiet"
let selectedActivity = null;   // activity id from ACTIVITIES
let selectedQuiet    = null;   // quiet option id
let activityName     = "";     // free text name for class/other
let selectedDuration = DEFAULT_DURATION; // minutes, Path B non-gym only
let returnVisitDismissedThisRender = false; // local-only, avoids re-prompt after "No"

// -- Return-visit detection ---------------------------------------------------

/**
 * Returns true if 2+ hours have passed since check-in and the user
 * hasn't already dismissed or completed a return-visit update today.
 */
function shouldOfferReturnVisit() {
  if (returnVisitDismissedThisRender) return false;

  const checkin = store.get("lastCheckin") || {};
  if (!checkin.timestamp) return false;

  const elapsed = Date.now() - new Date(checkin.timestamp).getTime();
  if (elapsed < RETURN_VISIT_THRESHOLD_MS) return false;

  // returnVisit === false means either not yet offered, or already
  // actioned (mini check-in completed clears it back to false too).
  // We use a separate "offered" marker via returnVisit:
  //   undefined/false -> not yet handled this window -> show prompt
  //   "dismissed"      -> user said "No, all good" -> don't re-show
  //   true             -> user tapped "Yes" (set just before navigating)
  const state = store.get("returnVisit");
  if (state === "dismissed") return false;

  return true;
}

// -- Coach line ----------------------------------------------------------------

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

// -- Render --------------------------------------------------------------------

export function render() {
  return `
    <div class="view intention-view">

      <div class="view-header">
        <h1>Today</h1>
      </div>

      <!-- Return-visit prompt -->
      ${shouldOfferReturnVisit() ? `
        <div class="card card-coach intention-coach-card" id="return-visit-card">
          <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
          <div>
            <p class="coach-message-text">
              It's been a little while since you checked in. Want to give me
              a quick update on how you're doing now?
            </p>
            <div class="intention-return-visit-actions">
              <button class="btn btn-secondary" id="return-visit-no">
                No, all good
              </button>
              <button class="btn btn-primary" id="return-visit-yes">
                Yes, tell the coach
              </button>
            </div>
          </div>
        </div>
      ` : ""}

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

        <button class="intention-path ${selectedPath === "prescribed" ? "selected" : ""}"
                data-path="prescribed"
                aria-pressed="${selectedPath === "prescribed"}">
          <span class="intention-path-icon" aria-hidden="true">\uD83E\uDE7A</span>
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

          ${selectedActivity && selectedActivity !== "gym" ? `
            <div class="intention-duration-field">
              <p class="intention-selector-label">How long are you planning?</p>
              <div class="reflect-chips" role="group" aria-label="Duration">
                ${DURATION_OPTIONS.map(o => `
                  <button class="chip ${selectedDuration === o.v ? "selected" : ""}"
                          data-duration="${o.v}"
                          aria-pressed="${selectedDuration === o.v}">
                    ${o.l}
                  </button>
                `).join("")}
              </div>
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

      <!-- Continue button - shown when a valid selection is made -->
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
    return "Let's go \u2014 " + (act?.label || "activity");
  }
  if (selectedPath === "quiet") {
    const q = QUIET_OPTIONS.find(q => q.id === selectedQuiet);
    return q?.label || "Continue";
  }
  return "Continue";
}

// -- Navigation ----------------------------------------------------------------

function logAndNavigate() {
  // Save activity log entry
  const log = store.get("activityLog") || [];
  const checkin = store.get("lastCheckin") || {};

  const act          = ACTIVITIES.find(a => a.id === selectedActivity);
  const trimmedName  = activityName.trim();
  // isEvent/eventName (schema.md Section 12, added v1.4, S4-6): only the
  // "class" and "other" Path B types have a free-text name field, and a
  // named activity is the natural definition of an "event" here.
  const isNamedEvent = selectedPath === "self" && act?.hasName && trimmedName.length > 0;

  const entry = {
    id:            new Date().toISOString() + "_" + Math.random().toString(36).slice(2, 6),
    date:          new Date().toISOString().split("T")[0],
    type:          selectedPath === "coach"      ? "coach-session" :
                   selectedPath === "prescribed" ? "prescribed-session" :
                   selectedPath === "quiet"      ? selectedQuiet :
                   selectedActivity,
    name:          trimmedName || null,
    energyBefore:  checkin.energy || null,
    source:        selectedPath === "coach"      ? "coach-recommended" :
                   selectedPath === "prescribed" ? "prescribed" :
                   "self-directed",
    sessionStart:  new Date().toISOString(),
    // -- S4-6 additions (Path B, non-gym only) --
    duration:      (selectedPath === "self" && selectedActivity !== "gym") ? selectedDuration : null,
    isEvent:       isNamedEvent,
    eventName:     isNamedEvent ? trimmedName : null,
  };
  store.set("activityLog", [...log, entry]);
  store.set("currentActivityEntry", entry);

  // Navigate
  if (selectedPath === "coach") {
    router.navigate("today");
    return;
  }
  if (selectedPath === "prescribed") {
    router.navigate("prescribed");
    return;
  }
  if (selectedPath === "self") {
    if (selectedActivity === "gym") {
      // Open gym sub-screen inside coach-proposal rather than going direct
      store.set("openGymSub", true);
      router.navigate("coach-proposal");
      return;
    }
    // Other self-directed activities - activity in progress view (Phase 4)
    // For now, navigate to reflect directly with a timer option
    router.navigate("reflect");
    return;
  }
  if (selectedPath === "quiet") {
    // S4-9/10: "Breathing practice" now goes to the real breathing player.
    // breathing-session.js logs its own activityLog entry on completion/
    // exit and returns to "noticing" -- the placeholder entry written
    // above (type: "breathing", source: "self-directed", never completed)
    // would otherwise sit orphaned in activityLog, so we don't write it
    // for this case. The other quiet options are unchanged.
    if (selectedQuiet === "breathing") {
      // Remove the placeholder entry just pushed for this selection.
      const trimmedLog = store.get("activityLog") || [];
      store.set("activityLog", trimmedLog.filter(e => e.id !== entry.id));
      store.set("currentActivityEntry", null);
      router.navigate("breathing-session");
      return;
    }
    if (selectedQuiet === "journal" || selectedQuiet === "rest" || selectedQuiet === "breathing") {
      router.navigate("reflect");
      return;
    }
    router.navigate("reflect");
  }
}

// -- Mount ---------------------------------------------------------------------

export function onMount() {
  const view = document.querySelector(".intention-view");
  if (!view) return;

  // Return-visit prompt actions
  document.getElementById("return-visit-yes")?.addEventListener("click", () => {
    store.set("returnVisit", true);
    router.navigate("checkin-mini");
  });

  document.getElementById("return-visit-no")?.addEventListener("click", () => {
    store.set("returnVisit", "dismissed");
    returnVisitDismissedThisRender = true;
    rerender();
  });

  view.addEventListener("click", e => {

    // Path selection
    const pathBtn = e.target.closest(".intention-path");
    if (pathBtn) {
      const path = pathBtn.dataset.path;
      selectedPath     = path;
      selectedActivity = null;
      selectedQuiet    = null;
      activityName     = "";
      selectedDuration = DEFAULT_DURATION;
      rerender();
      return;
    }

    // Activity chip
    const activityChip = e.target.closest(".intention-activity-chip[data-activity]");
    if (activityChip) {
      selectedActivity = activityChip.dataset.activity;
      activityName     = "";
      selectedDuration = DEFAULT_DURATION;
      rerender();
      return;
    }

    // Duration chip
    const durationChip = e.target.closest("[data-duration]");
    if (durationChip) {
      selectedDuration = parseInt(durationChip.dataset.duration, 10);
      view.querySelectorAll("[data-duration]").forEach(c => {
        const sel = parseInt(c.dataset.duration, 10) === selectedDuration;
        c.classList.toggle("selected", sel);
        c.setAttribute("aria-pressed", sel);
      });
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
