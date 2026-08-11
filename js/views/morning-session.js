/**
 * morning-session.js - Morning Session View
 *
 * 11 Aug 2026 v3
 *
 * v3 — PT-12. Three reads of "checkin.energy" corrected to
 *   "lastCheckin.energy". Nothing has ever written the former, so the
 *   session's energy input silently defaulted to 5 and energyBefore was
 *   always null on every logged entry.
 *
 * 23 Jul 2026 v2
 *
 * CHANGELOG
 * 23 Jul 2026 v2 - BUILD-3 Section 4. This file had no partial-save
 *   behaviour at all - exiting a genuine 20-40 minute, 5-block programme
 *   mid-way logged nothing, by explicit design (exit confirm read
 *   "Progress will not be saved"). Graeme's decision: add partial-save
 *   tracking, matching Gym/Core Session. Added savePartialSession()
 *   (mirrors logActivity()'s existing field conventions in this file).
 *   Wired mountSessionGuard() for back-gesture protection, which this
 *   file never had. On-screen Exit button updated to call
 *   savePartialSession() before exiting, and its confirm text now
 *   reflects that progress IS saved.
 *
 * 12 Jun 2026 v1 (S4-4 P3) - Back button pass:
 *   ms-back-btn (select screen "Today" button) and ms-exit-btn
 *   (mid-session exit confirm) now call router.back() instead of
 *   hardcoded window.router.navigate("intention") - both return to
 *   whatever page the user actually came from. ms-log-btn already
 *   correctly routes to "reflect" and is unchanged.
 *
 * 01 Jun 2026 v2
 *
 * v2 -- Session completion and UX fixes:
 *   logActivity(): type changed to "morning-session"; sets currentActivityEntry.
 *   renderCardioCard(): options styled as visual cards with play icon.
 *   renderSession(): progress counter enlarged, teal, semibold.
 *   ms-log-btn: routes to reflect instead of intention.
 *
 * v1 -- Auto-detect week and slot on first render:
 *   render() now initialises selectedWeek and selectedSlot before the
 *   first paint so the select screen arrives pre-populated. Previously
 *   onMount() set these AFTER render() had already produced a blank picker.
 *
 * Executes the six-week beach-fit morning programme.
 * Three slot types: mon (home), wed (gym), sat (gym).
 *
 * Flow:
 *   1. Week + slot selector (if not pre-set)
 *   2. Cardio routing card (options based on pain scores)
 *   3. Overview (all blocks listed before starting)
 *   4. Session execution - one exercise at a time:
 *        Warm-up \u2192 Cardio reminder \u2192 Upper body \u2192 Core \u2192 Cool-down
 *   5. Post-session: feel tap + coach closing line
 *   6. Activity logged to activityLog
 *
 * Pain routing:
 *   getZoneStatus("lower-limb") or ("spine") >= "moderate" \u2192 flare options
 *   energy <= 3 \u2192 fatigue options
 *   otherwise \u2192 clear options
 *
 * Route: morning-session
 * Nav: hidden (same as workout, gym-programme)
 */

import { store }         from "../store.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
import { getZoneStatus } from "../data/conditions.js";
import {
  MORNING_PROGRAMME,
  getMorningSession,
  getMorningPhase,
  getTodaySlot
} from "../data/morning-programme.js";

export const centered = false;

// -- Module state --------------------------------------------------------------
let selectedWeek    = 1;
let selectedSlot    = null;     // "mon" | "wed" | "sat"
let viewState       = "select"; // "select" | "overview" | "session" | "done"
let currentBlock    = "warmup"; // "warmup" | "cardio" | "upper" | "core" | "cooldown"
let currentIndex    = 0;        // index within the current block array
let completedBlocks = new Set();
let timerInterval   = null;
let timerRemaining  = 0;
let timerRunning    = false;
let postFeel        = null;     // "strong" | "right" | "struggled" | "tough"
let sessionStart    = null;

// Block display order and labels
const BLOCK_ORDER = ["warmup", "cardio", "upper", "core", "cooldown"];
const BLOCK_LABELS = {
  warmup:   "Warm-up",
  cardio:   "Cardio",
  upper:    "Upper Body",
  core:     "Core Finisher",
  cooldown: "Cool-down"
};

// Slot display names
const SLOT_LABELS = {
  mon: "Monday - Home",
  wed: "Wednesday - Gym",
  sat: "Saturday - Gym"
};

// -- Helpers -------------------------------------------------------------------

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0
    ? `${m}m ${s.toString().padStart(2, "0")}s`
    : `${s}s`;
}

function getCardioRoute() {
  // 11 Aug 2026 (PT-12) — "checkin.energy" is never written: store's checkin
  // object holds lastOpeningMode/openingModeHistory/feelingWordDepth/
  // lastMilestoneNoticed only. checkin.js's _checkin.energy is a local
  // variable, not a store path. The real field is lastCheckin.energy
  // (checkin-mini.js:389). This silently defaulted to 5 for everyone.
  const energy     = store.get("lastCheckin.energy") || 5;
  const lowerZone  = getZoneStatus("lower-limb");
  const spineZone  = getZoneStatus("spine");
  const hasFlare   = lowerZone === "moderate" || lowerZone === "severe" ||
                     spineZone === "moderate"  || spineZone === "severe";
  const hasFatigue = energy <= 3;

  if (hasFatigue) return "fatigue";
  if (hasFlare)   return "flare";
  return "clear";
}

function getCardioRouteLabel(route) {
  if (route === "flare")   return "Pain-aware options (glutes/back/hamstrings flagged)";
  if (route === "fatigue") return "Lower intensity options (energy is low today)";
  return "Full options";
}

function getBlockExercises(session) {
  // Returns an array of exercise objects for the current block.
  // Cardio block is special - one descriptive card.
  if (currentBlock === "warmup")   return session.cooldown ? [] : []; // handled below
  if (currentBlock === "upper")    return session.upper    || [];
  if (currentBlock === "core")     return session.core     || [];
  if (currentBlock === "cooldown") return session.cooldown || [];
  return [];
}

function getBlockArray(session, block) {
  switch (block) {
    case "warmup":   return []; // warmup is a fixed 5-min description card
    case "cardio":   return []; // cardio is a routing card
    case "upper":    return session.upper    || [];
    case "core":     return session.core     || [];
    case "cooldown": return session.cooldown || [];
    default:         return [];
  }
}

function countTotalSteps(session) {
  // warmup = 1 card, cardio = 1 card, then exercises
  return 2
    + (session.upper    || []).length
    + (session.core     || []).length
    + (session.cooldown || []).length;
}

function getCurrentStepNumber(session) {
  if (currentBlock === "warmup")   return 1;
  if (currentBlock === "cardio")   return 2;

  const upperLen   = (session.upper    || []).length;
  const coreLen    = (session.core     || []).length;

  if (currentBlock === "upper")    return 2 + currentIndex + 1;
  if (currentBlock === "core")     return 2 + upperLen + currentIndex + 1;
  if (currentBlock === "cooldown") return 2 + upperLen + coreLen + currentIndex + 1;
  return 1;
}

function logActivity(session, durationMins) {
  const entry = {
    id:          new Date().toISOString() + "-" + Math.random().toString(36).slice(2, 7),
    date:        new Date().toISOString().split("T")[0],
    type:         "morning-session",
    name:        session.title,
    duration:    durationMins,
    energyBefore: store.get("lastCheckin.energy") || null,
    feel:        postFeel || "right",
    painChange:  "none",
    source:      "coach-recommended",
    sessionId:   session.id
  };
  const log = store.get("activityLog") || [];
  log.push(entry);
  // Cap at 90 entries
  while (log.length > 90) log.shift();
  store.set("activityLog", log);
  // Set currentActivityEntry so reflect.js can personalise its question
  store.set("currentActivityEntry", entry);
}

/**
 * 23 Jul 2026 v2 (BUILD-3 Section 4): new function. This file previously
 * had no partial-save behaviour at all - exiting mid-programme (a genuine
 * 20-40 minute, 5-block session) logged nothing, by explicit design (the
 * exit confirm read "Progress will not be saved"). Graeme's decision:
 * add partial-save tracking, matching Gym/Core Session. Mirrors
 * logActivity()'s existing field conventions in this file (duration in
 * minutes, not durationMins - this file predates the store.logActivity()
 * shared function and was not migrated to it here, to avoid mixing field
 * naming conventions within a single file).
 */
function savePartialSession(session) {
  if (!session) return;
  const durationMins = sessionStart
    ? Math.round((Date.now() - sessionStart) / 60000)
    : null;
  const entry = {
    id:           new Date().toISOString() + "-" + Math.random().toString(36).slice(2, 7),
    date:         new Date().toISOString().split("T")[0],
    type:         "morning-session",
    name:         session.title,
    duration:     durationMins,
    status:       "partial",
    energyBefore: store.get("lastCheckin.energy") || null,
    feel:         null,
    painChange:   "none",
    source:       "coach-recommended",
    sessionId:    session.id
  };
  const log = store.get("activityLog") || [];
  log.push(entry);
  while (log.length > 90) log.shift();
  store.set("activityLog", log);
  store.set("currentActivityEntry", entry);
}

// -- Render --------------------------------------------------------------------

export function render() {
  // Initialise from store before first paint (onMount runs after render)
  if (!selectedWeek) selectedWeek = store.get("morningProgrammeWeek") || 1;
  if (!selectedSlot) selectedSlot = getTodaySlot();

  if (viewState === "select")   return renderSelect();
  if (viewState === "overview") return renderOverview();
  if (viewState === "session")  return renderSession();
  if (viewState === "done")     return renderDone();
  return renderSelect();
}

// -- 1. Select: week + slot ----------------------------------------------------

function renderSelect() {
  const autoSlot = getTodaySlot();
  const name     = (store.get("name") || "").split(" ")[0] || "";

  return `
    <div class="view">

      <!-- Header -->
      <div class="workout-header">
        <button class="btn btn-ghost" id="ms-back-btn" aria-label="Back to today">
          \u2190 Today
        </button>
        <span class="workout-progress-info">Morning Programme</span>
      </div>

      <div style="padding: var(--space-5) var(--space-4) var(--space-4);">

        <!-- Coach card -->
        <div class="card card-coach" style="margin-bottom: var(--space-5);">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
          <div>
            <p>${name ? "Good morning, " + name + "." : "Good morning."} Let me know which session you are doing today and I will walk you through it.</p>
          </div>
        </div>

        <!-- Week selector -->
        <h2 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-3);">
          Which week are you on?
        </h2>
        <div class="ms-week-grid" role="group" aria-label="Select programme week">
          ${MORNING_PROGRAMME.weeks.map(w => `
            <button class="ms-week-btn ${selectedWeek === w.week ? "selected" : ""}"
                    data-week="${w.week}"
                    aria-pressed="${selectedWeek === w.week}">
              <span class="ms-week-num">Week ${w.week}</span>
              <span class="ms-week-phase">${w.phase}</span>
            </button>
          `).join("")}
        </div>

        <!-- Slot selector -->
        <h2 style="font-size: var(--text-base); font-weight: 600; margin: var(--space-5) 0 var(--space-3);">
          Which session?
        </h2>
        <div class="ms-slot-grid" role="group" aria-label="Select session slot">
          ${["mon", "wed", "sat"].map(slot => `
            <button class="ms-slot-btn ${selectedSlot === slot ? "selected" : ""} ${autoSlot === slot ? "suggested" : ""}"
                    data-slot="${slot}"
                    aria-pressed="${selectedSlot === slot}">
              <span class="ms-slot-label">${SLOT_LABELS[slot]}</span>
              <span class="ms-slot-location">${slot === "mon" ? "\uD83C\uDFE0 Home" : "\uD83C\uDFCB\uFE0F Gym"}</span>
              ${autoSlot === slot ? '<span class="ms-slot-today-badge">Today</span>' : ""}
            </button>
          `).join("")}
        </div>

        <button class="btn btn-primary btn-large btn-full"
                id="ms-start-btn"
                style="margin-top: var(--space-6);"
                ${!selectedSlot ? "disabled" : ""}
                aria-disabled="${!selectedSlot}">
          See session overview \u2192
        </button>

      </div>
    </div>
  `;
}

// -- 2. Overview ---------------------------------------------------------------

function renderOverview() {
  const session    = getMorningSession(selectedWeek, selectedSlot);
  const phaseInfo  = getMorningPhase(selectedWeek);
  const cardioRoute = getCardioRoute();
  const cardioOptions = session.cardio.options[cardioRoute] || session.cardio.options.clear;

  if (!session) {
    return `<div class="view"><div class="card"><p>Session not found. Go back and try again.</p></div></div>`;
  }

  const total = countTotalSteps(session);

  return `
    <div class="view">

      <!-- Header -->
      <div class="workout-header">
        <button class="btn btn-ghost" id="ms-back-to-select" aria-label="Back to session select">
          \u2190 Back
        </button>
        <span class="workout-progress-info">${session.title}</span>
      </div>

      <div style="padding: var(--space-5) var(--space-4) var(--space-8);">

        <!-- Phase badge -->
        <div class="ms-phase-badge">
          <span class="ms-phase-label">Week ${selectedWeek} - ${phaseInfo.phase}</span>
          <span class="ms-duration-label">${session.duration}</span>
        </div>

        <!-- Coach line -->
        <div class="card card-coach" style="margin: var(--space-4) 0;">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
          <div>
            <p>${session.coachLine}</p>
          </div>
        </div>

        <!-- Phase note -->
        ${phaseInfo.phaseNote ? `
          <div class="ms-phase-note">
            <p>${phaseInfo.phaseNote}</p>
          </div>
        ` : ""}

        <!-- Session overview blocks -->
        <h2 style="font-size: var(--text-base); font-weight: 600; margin: var(--space-5) 0 var(--space-3);">
          What we are doing today
        </h2>

        <!-- Warm-up -->
        <div class="ms-overview-block">
          <div class="ms-overview-block-header">
            <span class="ms-block-icon" aria-hidden="true">\uD83D\uDD25</span>
            <span class="ms-block-title">Warm-up</span>
            <span class="ms-block-meta">5 mins</span>
          </div>
          <p class="ms-block-desc">March on the spot, arm circles, hip rotations. Gets the heart rate up and joints moving before we load anything.</p>
        </div>

        <!-- Cardio -->
        <div class="ms-overview-block">
          <div class="ms-overview-block-header">
            <span class="ms-block-icon" aria-hidden="true">\uD83C\uDFC3</span>
            <span class="ms-block-title">Cardio</span>
            <span class="ms-block-meta">${session.cardio.duration}</span>
          </div>
          <p class="ms-block-desc">${getCardioRouteLabel(cardioRoute)}</p>
          <ul class="ms-cardio-options" aria-label="Cardio options">
            ${cardioOptions.map(opt => `<li>${opt}</li>`).join("")}
          </ul>
        </div>

        <!-- Upper body -->
        ${(session.upper || []).length > 0 ? `
          <div class="ms-overview-block">
            <div class="ms-overview-block-header">
              <span class="ms-block-icon" aria-hidden="true">\uD83D\uDCAA</span>
              <span class="ms-block-title">Upper Body</span>
              <span class="ms-block-meta">${session.upper.length} exercises</span>
            </div>
            <ul class="ms-overview-list">
              ${session.upper.map(e => `<li>${e.name} <span class="ms-ex-meta">${e.sets > 0 ? e.sets + " \u00D7 " + e.reps : e.reps}</span></li>`).join("")}
            </ul>
          </div>
        ` : ""}

        <!-- Core -->
        ${(session.core || []).length > 0 ? `
          <div class="ms-overview-block">
            <div class="ms-overview-block-header">
              <span class="ms-block-icon" aria-hidden="true">\uD83C\uDFAF</span>
              <span class="ms-block-title">Core Finisher</span>
              <span class="ms-block-meta">${session.core.length} exercises</span>
            </div>
            <ul class="ms-overview-list">
              ${session.core.map(e => `<li>${e.name} <span class="ms-ex-meta">${e.sets > 0 ? e.sets + " \u00D7 " + e.reps : e.reps}</span></li>`).join("")}
            </ul>
          </div>
        ` : ""}

        <!-- Cool-down -->
        <div class="ms-overview-block">
          <div class="ms-overview-block-header">
            <span class="ms-block-icon" aria-hidden="true">\uD83C\uDF0A</span>
            <span class="ms-block-title">Cool-down</span>
            <span class="ms-block-meta">${(session.cooldown || []).length} stretches</span>
          </div>
          <p class="ms-block-desc">Hip flexor, chest, and back. Never skip the cool-down.</p>
        </div>

        <!-- Start -->
        <button class="btn btn-primary btn-large btn-full"
                id="ms-begin-btn"
                style="margin-top: var(--space-6);">
          Start session \u2192
        </button>

      </div>
    </div>
  `;
}

// -- 3. Session execution ------------------------------------------------------

function renderSession() {
  const session = getMorningSession(selectedWeek, selectedSlot);
  if (!session) return renderSelect();

  const total   = countTotalSteps(session);
  const current = getCurrentStepNumber(session);
  const pct     = Math.round((current / total) * 100);

  let content = "";

  if (currentBlock === "warmup") {
    content = renderWarmupCard(session);
  } else if (currentBlock === "cardio") {
    content = renderCardioCard(session);
  } else {
    const blockArr = getBlockArray(session, currentBlock);
    const ex = blockArr[currentIndex];
    if (!ex) {
      // Block exhausted - should not happen but guard it
      content = `<div class="card"><p>Block complete.</p></div>`;
    } else {
      content = renderExerciseCard(ex, session);
    }
  }

  return `
    <div class="view workout-view">

      <!-- Header -->
      <div class="workout-header">
        <button class="btn btn-ghost" id="ms-exit-btn" aria-label="Exit morning session">
          \u2715 Exit
        </button>
        <div class="workout-progress-info"
             aria-label="Step ${current} of ${total}"
             style="font-size:var(--text-lg);font-weight:var(--font-semibold);
                    color:var(--color-primary);">
          ${current} of ${total}
        </div>
      </div>

      <!-- Progress bar -->
      <div class="workout-progress-bar" role="progressbar"
           aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Session progress ${pct}%">
        <div class="workout-progress-fill" style="width: ${pct}%"></div>
      </div>

      <!-- Block label -->
      <div class="ms-block-label-bar">
        ${BLOCK_ORDER.map(b => `
          <span class="ms-block-pip ${b === currentBlock ? "active" : completedBlocks.has(b) ? "done" : ""}"
                aria-label="${BLOCK_LABELS[b]} ${b === currentBlock ? "(current)" : completedBlocks.has(b) ? "(done)" : ""}">
            ${completedBlocks.has(b) ? "\u2713" : BLOCK_LABELS[b].charAt(0)}
          </span>
        `).join("")}
        <span class="ms-block-current-label">${BLOCK_LABELS[currentBlock]}</span>
      </div>

      ${content}

    </div>
  `;
}

function renderWarmupCard(session) {
  return `
    <div class="exercise-display" style="padding: var(--space-5) var(--space-4);">

      <div class="exercise-role-badge warmup" aria-label="Warm-up">
        \uD83D\uDD25 Warm-up
      </div>

      <h1 class="exercise-name">5-Minute Warm-Up</h1>

      <div class="card" style="margin: var(--space-4) 0;">
        <p style="margin-bottom: var(--space-3);">Move through these before loading anything:</p>
        <ul style="padding-left: var(--space-4); line-height: 1.8;">
          <li>March on the spot - 60 seconds, swing the arms</li>
          <li>Hip circles - 10 each direction</li>
          <li>Arm circles - 10 forward, 10 back</li>
          <li>Shoulder rolls - 10 slow</li>
          <li>Ankle rotations - 10 each foot</li>
          <li>Gentle torso rotation - 10 each side</li>
        </ul>
      </div>

      <div class="card card-coach">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p>Take the full 5 minutes. A warm body performs better and recovers faster. There is no reward for starting cold.</p>
        </div>
      </div>

      <div class="workout-actions" style="margin-top: var(--space-5);">
        <button class="btn btn-primary btn-large btn-full" id="ms-next-btn">
          Warm-up done \u2192 Cardio
        </button>
      </div>

    </div>
  `;
}

function renderCardioCard(session) {
  const route   = getCardioRoute();
  const options = session.cardio.options[route] || session.cardio.options.clear;
  const allClear = route === "clear";

  return `
    <div class="exercise-display" style="padding: var(--space-5) var(--space-4);">

      <div class="exercise-role-badge cardio" aria-label="Cardio block">
        \uD83C\uDFC3 Cardio
      </div>

      <h1 class="exercise-name">Cardio Block</h1>

      <div class="exercise-meta">
        <span class="meta-tag">${session.cardio.duration}</span>
        <span class="meta-tag">${session.cardio.intensity}</span>
      </div>

      ${!allClear ? `
        <div class="ms-routing-notice" role="alert" aria-live="polite">
          <span class="ms-routing-icon" aria-hidden="true">${route === "flare" ? "\u26A0\uFE0F" : "\uD83D\uDC99"}</span>
          <p>${route === "flare"
            ? "I can see some pain flagged in your check-in. I have adjusted your cardio options to protect those areas."
            : "Energy is low today. I have given you gentler options - moving is still the right call."
          }</p>
        </div>
      ` : ""}

      <div style="display:flex;flex-direction:column;gap:var(--space-2);margin:var(--space-4) 0;"
           role="group" aria-label="Choose your cardio for today">
        <p style="font-size:var(--text-sm);color:var(--color-text-secondary);
                  margin-bottom:var(--space-1);">Choose one and go do it:</p>
        ${options.map(opt => `
          <div class="card"
               style="display:flex;align-items:center;gap:var(--space-3);
                      padding:var(--space-3) var(--space-4);
                      border:1.5px solid rgba(255,255,255,0.08);
                      border-radius:var(--radius-md,8px);">
            <span style="color:var(--color-primary);font-size:1.1rem;flex-shrink:0;"
                  aria-hidden="true">&#9654;</span>
            <span style="font-size:var(--text-sm);">${opt}</span>
          </div>
        `).join("")}
      </div>

      <div class="card card-coach">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p>Go and do your cardio. Come back when you are done and we will move into the upper body work.</p>
        </div>
      </div>

      <div class="workout-actions" style="margin-top: var(--space-5);">
        <button class="btn btn-primary btn-large btn-full" id="ms-next-btn">
          Cardio done \u2192 Upper Body
        </button>
        ${(session.core || []).length === 0 && (session.upper || []).length === 0 ? `
          <button class="btn btn-ghost btn-small" id="ms-skip-to-cooldown">
            Skip to cool-down
          </button>
        ` : ""}
      </div>

    </div>
  `;
}

function renderExerciseCard(ex, session) {
  const blockArr  = getBlockArray(session, currentBlock);
  const isLast    = currentIndex >= blockArr.length - 1;
  const blockLen  = blockArr.length;
  const hasTimer  = !!ex.duration;
  const guide     = ex.guide || null;

  // Next block label for button
  const blockIndex = BLOCK_ORDER.indexOf(currentBlock);
  let nextLabel = "Next exercise \u2192";
  if (isLast) {
    const nextBlock = BLOCK_ORDER[blockIndex + 1];
    nextLabel = nextBlock
      ? `${BLOCK_LABELS[currentBlock]} done \u2192 ${BLOCK_LABELS[nextBlock]}`
      : "Finish session \uD83C\uDF89";
  }

  return `
    <div class="exercise-display" style="padding: var(--space-5) var(--space-4);">

      <div class="exercise-role-badge ${currentBlock}" aria-label="${BLOCK_LABELS[currentBlock]}">
        ${currentIndex + 1} of ${blockLen} - ${BLOCK_LABELS[currentBlock]}
      </div>

      <h1 class="exercise-name">${ex.name}</h1>

      <div class="exercise-meta">
        ${ex.sets && ex.sets > 0 ? `<span class="meta-tag">${ex.sets} sets</span>` : ""}
        ${ex.reps ? `<span class="meta-tag">${ex.reps}</span>` : ""}
        ${ex.rest && ex.rest !== "-" ? `<span class="meta-tag">${ex.rest} rest</span>` : ""}
      </div>

      <!-- Coach note -->
      ${ex.coachNote ? `
        <div class="card card-coach" style="margin: var(--space-4) 0;">
          <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
          <div>
            <p>${ex.coachNote}</p>
          </div>
        </div>
      ` : ""}

      <!-- Timer for hold-based exercises -->
      ${hasTimer ? `
        <div class="exercise-target" style="margin: var(--space-4) 0;">
          <div class="timer-display">
            <div class="timer-circle">
              <span class="timer-value" id="ms-timer-display" aria-live="polite" aria-label="Timer: ${formatTime(ex.duration)}">${formatTime(ex.duration)}</span>
              <span class="timer-label">Hold</span>
            </div>
          </div>
        </div>
        <button class="btn btn-secondary btn-large btn-full ms-timer-btn"
                data-duration="${ex.duration}"
                id="ms-timer-btn"
                aria-label="Start hold timer for ${ex.name}">
          \u25B6 Start Timer
        </button>
      ` : ""}

      <!-- Guide (description + cues + YouTube) -->
      ${guide ? `
        <details class="ms-guide" style="margin: var(--space-4) 0;">
          <summary class="ms-guide-summary">How to do this exercise</summary>
          <div class="ms-guide-body">
            <p class="ms-guide-desc">${guide.description}</p>
            <ul class="ms-guide-cues">
              ${guide.cues.map(c => `<li>${c}</li>`).join("")}
            </ul>
            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(guide.youtube)}"
               target="_blank" rel="noopener noreferrer"
               class="gym-youtube-link"
               aria-label="Watch ${ex.name} demonstration on YouTube (opens in new tab)">
              \u25B6 Watch a demonstration
            </a>
          </div>
        </details>
      ` : ""}

      <!-- Actions -->
      <div class="workout-actions" style="margin-top: var(--space-5);">
        <button class="btn btn-primary btn-large btn-full" id="ms-next-btn">
          ${nextLabel}
        </button>
        <button class="btn btn-ghost btn-small" id="ms-skip-btn">
          Skip this one
        </button>
      </div>

    </div>
  `;
}

// -- 4. Done -------------------------------------------------------------------

function renderDone() {
  const session  = getMorningSession(selectedWeek, selectedSlot);
  const duration = sessionStart
    ? Math.round((Date.now() - sessionStart) / 60000)
    : null;

  const FEEL_OPTIONS = [
    { value: "strong",    label: "Strong \uD83D\uDCAA" },
    { value: "right",     label: "Just right \u2713" },
    { value: "tough",     label: "Tough but done \uD83D\uDD25" },
    { value: "struggled", label: "Struggled today \uD83D\uDC99" }
  ];

  // Build closing coach line
  const week = selectedWeek;
  let closingLine = "Session done. That is the habit building.";
  if (week <= 2) closingLine = "First steps of the programme complete. The water and the movement will do their work - give it a few days.";
  else if (week <= 4) closingLine = "Building week. You are stronger than you were in Week 1 - you might not feel it yet but the body keeps score.";
  else closingLine = "Challenge week done. You are six weeks of consistent mornings into this. That is not nothing.";

  return `
    <div class="view" style="padding: var(--space-5) var(--space-4);">

      <!-- Coach close -->
      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p>${closingLine}</p>
        </div>
      </div>

      <!-- Feel tap -->
      <h2 style="font-size: var(--text-base); font-weight: 600; margin-bottom: var(--space-3);">
        How did that feel?
      </h2>
      <div class="ms-feel-grid" role="group" aria-label="How did the session feel?">
        ${FEEL_OPTIONS.map(f => `
          <button class="ms-feel-btn ${postFeel === f.value ? "selected" : ""}"
                  data-feel="${f.value}"
                  aria-pressed="${postFeel === f.value}">
            ${f.label}
          </button>
        `).join("")}
      </div>

      <!-- Stats -->
      ${duration ? `
        <div class="ms-session-stats" style="margin: var(--space-4) 0;">
          <div class="ms-stat">
            <span class="ms-stat-value">${duration}</span>
            <span class="ms-stat-label">minutes</span>
          </div>
          <div class="ms-stat">
            <span class="ms-stat-value">Week ${selectedWeek}</span>
            <span class="ms-stat-label">${SLOT_LABELS[selectedSlot]}</span>
          </div>
        </div>
      ` : ""}

      <!-- Water reminder -->
      <div class="ms-water-reminder" role="note">
        <span aria-hidden="true">\uD83D\uDCA7</span>
        <p>Remember - 2.5 litres of water today. Start now if you have not already.</p>
      </div>

      <!-- Log and return -->
      <button class="btn btn-primary btn-large btn-full"
              id="ms-log-btn"
              style="margin-top: var(--space-5);">
        Log session and finish
      </button>

    </div>
  `;
}

// -- Rerender ------------------------------------------------------------------

function rerender() {
  const el = document.getElementById("main-content");
  if (!el) return;
  el.innerHTML = render();
  wireEvents();
}

// -- Navigation logic ----------------------------------------------------------

function advance(session) {
  // Move to the next exercise or next block
  const blockArr = getBlockArray(session, currentBlock);

  if (currentBlock === "warmup") {
    currentBlock = "cardio";
    currentIndex = 0;
    return;
  }

  if (currentBlock === "cardio") {
    // Skip upper if empty
    if ((session.upper || []).length > 0) {
      currentBlock = "upper";
    } else if ((session.core || []).length > 0) {
      currentBlock = "core";
    } else {
      currentBlock = "cooldown";
    }
    currentIndex = 0;
    return;
  }

  if (currentIndex < blockArr.length - 1) {
    currentIndex++;
    return;
  }

  // Block exhausted - mark done and move to next
  completedBlocks.add(currentBlock);
  const blockIndex = BLOCK_ORDER.indexOf(currentBlock);

  // Find next non-empty block
  for (let i = blockIndex + 1; i < BLOCK_ORDER.length; i++) {
    const nextBlock = BLOCK_ORDER[i];
    if (nextBlock === "warmup" || nextBlock === "cardio") continue;
    const nextArr = getBlockArray(session, nextBlock);
    if (nextArr.length > 0) {
      currentBlock = nextBlock;
      currentIndex = 0;
      return;
    }
  }

  // All blocks done
  completedBlocks.add(currentBlock);
  viewState = "done";
}

// -- Events --------------------------------------------------------------------

function wireEvents() {
  const el = document.getElementById("main-content");
  if (!el) return;

  el.addEventListener("click", handleClick);
}

function handleClick(e) {
  const session = getMorningSession(selectedWeek, selectedSlot);

  // -- Back to today (literal previous page) -------------------------------
  if (e.target.closest("#ms-back-btn")) {
    if (timerInterval) clearInterval(timerInterval);
    router.back();
    return;
  }

  // -- Back to select ---------------------------------------------------------
  if (e.target.closest("#ms-back-to-select")) {
    viewState = "select";
    rerender();
    return;
  }

  // -- Exit session (literal previous page) ----------------------------------
  // 23 Jul 2026 v2 (BUILD-3 Section 4): previously discarded progress
  // unconditionally on confirm. Now saves a partial entry first, and the
  // confirm text reflects that.
  if (e.target.closest("#ms-exit-btn")) {
    if (timerInterval) clearInterval(timerInterval);
    if (confirm("Exit the session? Your progress so far will be saved.")) {
      savePartialSession(session);
      dismountSessionGuard();
      router.back();
    }
    return;
  }

  // -- Week selector ----------------------------------------------------------
  const weekBtn = e.target.closest(".ms-week-btn");
  if (weekBtn) {
    selectedWeek = parseInt(weekBtn.dataset.week);
    store.set("morningProgrammeWeek", selectedWeek);
    rerender();
    return;
  }

  // -- Slot selector ----------------------------------------------------------
  const slotBtn = e.target.closest(".ms-slot-btn");
  if (slotBtn) {
    selectedSlot = slotBtn.dataset.slot;
    rerender();
    return;
  }

  // -- Start (overview) -------------------------------------------------------
  if (e.target.closest("#ms-start-btn")) {
    if (!selectedSlot) return;
    viewState = "overview";
    rerender();
    return;
  }

  // -- Begin session ----------------------------------------------------------
  if (e.target.closest("#ms-begin-btn")) {
    viewState    = "session";
    currentBlock = "warmup";
    currentIndex = 0;
    completedBlocks = new Set();
    sessionStart = Date.now();
    rerender();
    return;
  }

  // -- Next / skip ------------------------------------------------------------
  if (e.target.closest("#ms-next-btn") || e.target.closest("#ms-skip-btn")) {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerRemaining = 0;
    timerRunning   = false;

    if (!session) { viewState = "select"; rerender(); return; }

    if (viewState === "session") {
      advance(session);
    }

    if (viewState === "done") {
      // stay on done
    } else {
      rerender();
    }

    if (viewState === "done") {
      rerender();
    }
    return;
  }

  // -- Skip to cooldown -------------------------------------------------------
  if (e.target.closest("#ms-skip-to-cooldown")) {
    completedBlocks.add("warmup");
    completedBlocks.add("cardio");
    completedBlocks.add("upper");
    completedBlocks.add("core");
    currentBlock = "cooldown";
    currentIndex = 0;
    rerender();
    return;
  }

  // -- Timer ------------------------------------------------------------------
  const timerBtn = e.target.closest(".ms-timer-btn");
  if (timerBtn) {
    const duration = parseInt(timerBtn.dataset.duration);

    if (timerRunning) {
      // Pause
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning  = false;
      timerBtn.textContent = "\u25B6 Resume";
    } else {
      // Start or resume
      if (timerRemaining <= 0) timerRemaining = duration;
      timerRunning = true;
      timerBtn.textContent = "\u23F8 Pause";

      timerInterval = setInterval(() => {
        timerRemaining--;
        const display = document.getElementById("ms-timer-display");
        if (display) {
          display.textContent = formatTime(timerRemaining);
          display.setAttribute("aria-label", "Timer: " + formatTime(timerRemaining));
        }
        if (timerRemaining <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          timerRunning  = false;
          if (display) {
            display.textContent = "Done \u2713";
            display.setAttribute("aria-label", "Timer complete");
          }
          const btn = document.getElementById("ms-timer-btn");
          if (btn) btn.textContent = "\u2713 Complete";
        }
      }, 1000);
    }
    return;
  }

  // -- Feel tap (done screen) -------------------------------------------------
  const feelBtn = e.target.closest(".ms-feel-btn");
  if (feelBtn) {
    postFeel = feelBtn.dataset.feel;
    // Update pressed state without full rerender
    el.querySelectorAll(".ms-feel-btn").forEach(b => {
      b.classList.toggle("selected", b.dataset.feel === postFeel);
      b.setAttribute("aria-pressed", b.dataset.feel === postFeel);
    });
    return;
  }

  // -- Log and finish ---------------------------------------------------------
  if (e.target.closest("#ms-log-btn")) {
    if (session) {
      const duration = sessionStart
        ? Math.round((Date.now() - sessionStart) / 60000)
        : null;
      logActivity(session, duration);
    }
    dismountSessionGuard();
    // Reset state
    viewState      = "select";
    currentBlock   = "warmup";
    currentIndex   = 0;
    completedBlocks = new Set();
    sessionStart   = null;
    postFeel       = null;
    // Route to reflect.js for post-session acknowledgement
    window.router.navigate("reflect");
    return;
  }
}

// -- Lifecycle -----------------------------------------------------------------

export function onMount() {
  // Reset session state on fresh mount
  viewState      = "select";
  currentBlock   = "warmup";
  currentIndex   = 0;
  completedBlocks = new Set();
  timerRunning   = false;
  timerRemaining = 0;
  postFeel       = null;
  sessionStart   = null;

  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  // Pre-fill week from store
  selectedWeek = store.get("morningProgrammeWeek") || 1;

  // Pre-fill slot from today if obvious
  const todaySlot = getTodaySlot();
  selectedSlot = todaySlot;

  // 23 Jul 2026 v2 (BUILD-3 Section 4): back-gesture protection + partial-
  // save, added where none existed before. On-screen Exit button (above)
  // now also saves via savePartialSession(), so both exit paths behave
  // consistently.
  mountSessionGuard({
    isActive: () => viewState === "session",
    label:    "morning session",
    onExit:   () => {
      const session = getMorningSession(selectedWeek, selectedSlot);
      savePartialSession(session);
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      viewState       = "select";
      currentBlock    = "warmup";
      currentIndex    = 0;
      completedBlocks = new Set();
      sessionStart    = null;
      postFeel        = null;
      router.back();
    }
  });

  wireEvents();
}
