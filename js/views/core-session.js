/**
 * core-session.js - Guided Core Session
 *
 * 11 Aug 2026 v8
 *
 * v8 - CON-3b. Renders watchOut ("What to watch for") and load ("How
 *   heavy") on the active exercise card, matching gym-programme.js v8
 *   and workout.js v9. Deliberately NOT added to the preview list
 *   (renderSessionPreview) - that screen is a scannable overview
 *   before starting, and watch-outs belong at the point of doing, not
 *   stacked twelve-deep in a list someone reads while deciding.
 *
 * 11 Aug 2026 v7
 *
 * v7 — WOW-1 (PT-3, Persona Tracing Wave 1). Added a session-level
 *   clock (sessionStartTime + elapsedMins()) and wired it into every
 *   activityLog write. This view previously reported no duration at all,
 *   so progress.js:138 summed the person's real sessions as 0 minutes —
 *   the app telling someone who showed up that they hadn't. Set once at
 *   genuine session start, cleared on reset/cleanup. Floor of 1 minute so
 *   a real completion never reports zero.
 *
 * 10 Aug 2026 v6
 *
 * CHANGELOG
 * 10 Aug 2026 v6 — Added missing instructions/coaching/youtube sections
 *   (exercise-detail consistency audit, Graeme's direct request). This
 *   file already showed description/cues/why for its fixed 23-exercise
 *   pool (confirmed safe — every exercise it can select genuinely has
 *   these fields, no "undefined" risk), but instructions and coaching
 *   were never rendered despite 100% data coverage, and no video link
 *   existed at all. Also fixed a second silent field-name bug in the
 *   pre-session overview list: exercise.cue (singular, never existed
 *   anywhere) should have been exercise.cues (plural array) — same
 *   class of bug as gym-programme.js's, found in the same pass.
 *
 * 04 Aug 2026 v5 — Phase B, Home Nav & Conditions Redesign (blueprint
 *   alongside_blueprint_home-navigation-conditions_04aug2026_v1.md).
 *   Removed the private, duplicated EXERCISE_POOLS (23 exercise objects,
 *   fully forked from the shared exercise database) — replaced with
 *   EXERCISE_POOL_IDS, a lightweight id-reference map resolved against
 *   the shared EXERCISES array (js/data/exercises/index.js) in
 *   buildSession(). All 23 exercises confirmed to already exist in the
 *   shared database; the sets/reps/holdSeconds/rest/cues/description
 *   fields this file's renderer needs were migrated onto those shared
 *   records, additively — no existing shared field changed. Two
 *   genuine id-collision bugs found and fixed in the process: the
 *   "stability" pool's classic two-limb Dead Bug and Bird Dog were
 *   incorrectly sharing ids with a different, gentler rehab-pool
 *   variant of each — both existed as genuinely distinct shared
 *   records under different ids ("dead-bug"/"bird-dog" vs
 *   "dead-bug-progression-1"/"bird-dog-rehab"), now correctly resolved.
 *   buildSession() also rewritten: the private duplicated severity
 *   threshold (pain >= 4 subacute — the pre-Phase-A value, never
 *   updated) replaced with conditions.js's canonical
 *   getActiveConditionIds()/filterByConditions(), same functions
 *   workoutGenerator.js already uses. Selection changed from always
 *   the first N items of a fixed-order array to a shuffle before
 *   slicing — the "not searchable, not shuffled" gap the original
 *   redesign spec flagged. Caution-tier exercises folded into the
 *   available pool rather than excluded (no caution-badge UI built
 *   this pass — logged as a reasonable future addition, not required
 *   for consolidation). Flagged, not silently resolved: shared
 *   "dead-bug"/"bird-dog" records' contraindications differ from what
 *   this file previously excluded them for — real content-accuracy
 *   question for Graeme, left as the shared data's existing values
 *   per single-source-of-truth. End-to-end smoke-tested (Node, all 23
 *   ids resolve with full field set; contraindication filtering
 *   verified against a real condition/pain-score pair) before commit.
 *
 * 30 Jul 2026 v4 — Core Session `currentActivityEntry` data-integrity
 *   investigation. Diagnosis: no route into this file ever set a genuine
 *   pending currentActivityEntry upstream (core-session isn't reachable
 *   via intention.js's ACTIVITIES list at all) — completions were never
 *   silently failing, logActivity()'s fallback always fired with real
 *   type/completedAt/status/exercisesCount/creditsEarned. But finaliseSession()
 *   and savePartialSession() were both spreading `pending` into the write,
 *   which — since this file re-sets currentActivityEntry to its own
 *   completion result after every write — meant two back-to-back Core
 *   Sessions not separated by an intention.js visit spread the FIRST
 *   session's stale entry (including its id) into the second, and
 *   logActivity() honoured the reused id. Fixed: both functions now build
 *   the entry fresh, no pending spread, so logActivity() always assigns a
 *   new id. Full trace in alongside_blueprint_coresession-integrity_
 *   30jul2026_v2.md's session handoff. Note: yoga-session.js has the
 *   identical spread-pending pattern and is also reachable directly from
 *   library.js without going through intention.js — same latent risk,
 *   NOT fixed here (out of this session's file scope, logged for a
 *   future targeted pass).
 * 23 Jul 2026 v3 — BUILD-3 exit-guard audit fix. onExit (mountSessionGuard)
 *   was navigating to reflect.js without ever calling savePartialSession()
 *   first — the on-screen Exit button (showExitConfirm) called it
 *   correctly, but the device back-gesture path silently dropped partial
 *   progress. Fixed to match yoga-session.js v4's confirmed-working
 *   pattern exactly. Bundled while the file was open: finaliseSession()
 *   and savePartialSession() migrated from direct activityLog writes to
 *   store.logActivity() (dedupe-guarded shared path, store.js v10).
 *   savePartialSession() also referenced an undeclared `elapsed` variable
 *   for durationMins (this file has no running elapsed-time tracker,
 *   only per-exercise hold timers) — left explicitly null with a comment,
 *   matching yoga-session.js v4's same fix, rather than fabricated.
 * 18 May 2026 v2 — prior version.
 *
 * Four focus types, three durations. Draws from strength and rehabilitation
 * exercise databases. Condition-aware — automatically avoids exercises
 * contraindicated by the user's active conditions and pain scores.
 *
 * Focus types:
 *   stability  — anti-extension, anti-rotation, anti-lateral-flexion
 *   strength   — loaded core, progressive difficulty
 *   mobility   — spinal mobility, hip flexor, thoracic
 *   rehab      — gentle, low-load, suitable for back pain and acute conditions
 *
 * Durations: 15 / 20 / 30 minutes
 *
 * Session flow:
 *   1. Focus selector screen
 *   2. Duration selector
 *   3. Condition-aware coach intro card
 *   4. Exercise sequence (one at a time, timer or reps display)
 *   5. Rest card between exercises
 *   6. Completion screen
 *
 * Route: "core-session"
 * Nav: hidden (session view)
 * Credits: 20 per exercise completed
 */

import { store } from "../store.js";
import { bodyCaution } from "../data/session-rationale.js";
import { renderLogBlock, attachLogEvents } from "../session-log.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
import { EXERCISES, filterByConditions } from "../data/exercises/index.js";
import { getActiveConditionIds } from "../data/conditions.js";

export const centered = false;

// ── Session state ─────────────────────────────────────────────────────────────
let phase         = "focus";    // "focus" | "duration" | "overview" | "intro" | "session" | "rest" | "done"
let selectedFocus = null;
let selectedMins  = null;
let sessionQueue  = [];
let currentIndex  = 0;
let timerInterval = null;
let timeRemaining = 0;
let timerRunning  = false;
let creditsEarned = 0;
let restRemaining = 0;

// 11 Aug 2026 — WOW-1 (PT-3). Session-level elapsed time. This view had
// no session clock at all, so every completion wrote durationMins null/
// absent and progress.js:138 summed it as 0 — a person's real sessions
// read back as zero minutes. Pattern mirrors gym-programme.js:806, which
// already does this correctly. Set once at genuine session start, cleared
// on reset, so rest-timer re-entries into the session phase can't reset it.
let sessionStartTime = null;

function elapsedMins() {
  if (!sessionStartTime) return null;
  return Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
}

let restInterval  = null;

// ── Focus definitions ─────────────────────────────────────────────────────────

const FOCUS_TYPES = [
  {
    id:          "stability",
    label:       "Stability",
    icon:        "\uD83E\uDDD8",
    description: "Anti-extension, anti-rotation, anti-lateral-flexion. The core's real job is to resist unwanted movement.",
    coachIntro:  "Stability work is the foundation of everything. We're not training the core to crunch — we're training it to hold. These exercises are slow, controlled, and more demanding than they look.",
    colour:      "var(--color-primary)"
  },
  {
    id:          "strength",
    label:       "Strength",
    icon:        "\uD83D\uDCAA",
    description: "Progressive loaded core work. Builds genuine mid-section strength across all planes.",
    coachIntro:  "Core strength sessions move beyond the basics. Expect a progression through difficulty — some of these will challenge you. Quality of movement matters more than completing every rep.",
    colour:      "#818CF8"
  },
  {
    id:          "mobility",
    label:       "Mobility",
    icon:        "\uD83C\uDF3F",
    description: "Spinal mobility, hip flexor opening, thoracic rotation. Unlocks movement quality.",
    coachIntro:  "Mobility work is active, not passive. We're building range of motion you can control, not just stretching. Move slowly and breathe into restriction.",
    colour:      "#34D399"
  },
  {
    id:          "rehab",
    label:       "Rehab",
    icon:        "\uD83E\uDE7A",
    description: "Gentle, low-load. Safe for back pain, post-injury, or when everything feels sensitive.",
    coachIntro:  "This session is gentle by design. We're working with your body, not against it. If anything feels sharp rather than achy, stop. There is nothing here that requires pushing through pain.",
    colour:      "#FB923C"
  }
];

// ── Exercise pool by focus (04 Aug 2026, Phase B consolidation) ────────────────
// Previously a private, duplicated copy of ~23 exercise objects, fully
// forked from the shared exercise database. Confirmed during blueprinting
// (alongside_blueprint_home-navigation-conditions_04aug2026_v1.md) that
// every exercise here already existed in js/data/exercises/{strength,
// mobility,rehabilitation}.js under the same or a corrected id — this is
// now just an id-reference map, resolved against the shared EXERCISES
// array in buildSession() below. The extra fields this file's renderer
// needs (sets/reps/holdSeconds/rest/cues) were migrated onto those 23
// shared records, additively — no existing shared field was changed.
//
// Two id corrections made during migration, not present in the old
// private pool: the "stability" pool's classic two-limb Dead Bug and
// Bird Dog were incorrectly sharing ids ("dead-bug-progression-1",
// "bird-dog-rehab") with a completely different, gentler rehab-pool
// variant of each — a genuine pre-existing bug in this file's own data,
// found while matching against the shared database's distinct
// "dead-bug"/"bird-dog" ids. Corrected below.
//
// Flagged, not silently resolved: the shared "dead-bug" and "bird-dog"
// records' existing `contraindications` differ from what this file
// previously excluded them for (dead-bug: was ["lower-back-acute"],
// shared has none; bird-dog: was ["lower-back-acute","wrist-elbow-acute"],
// shared has ["glutes-acute","lower-back-acute"]). Shared data left
// untouched per the single-source-of-truth principle — this is a real
// content-accuracy question for Graeme, not a code bug to guess at.

const EXERCISE_POOL_IDS = {
  stability: ["dead-bug", "bird-dog", "plank", "side-plank-modified", "pallof-press", "mcgill-curl-up"],
  strength:  ["ab-wheel-rollout", "isometric-hollow-hold", "dead-bug-progression-3", "band-pallof-press", "glute-bridge-single-leg"],
  mobility:  ["thoracic-rotation", "hip-flexor-stretch", "thoracic-extension-foam-roll", "90-90-hip-stretch", "hip-cars", "prone-thoracic-rotation"],
  rehab:     ["pelvic-tilt", "glute-bridge-activation", "dead-bug-progression-1", "clamshell-activation", "diaphragmatic-breathing-core", "bird-dog-rehab"]
};

// ── Duration options ──────────────────────────────────────────────────────────

const DURATIONS = [
  { mins: 15, label: "15 min",  description: "Quick and focused" },
  { mins: 20, label: "20 min",  description: "A proper session" },
  { mins: 30, label: "30 min",  description: "Full programme" }
];

// exercises per duration (approx — actual count varies by exercise length)
const EXERCISE_COUNT = { 15: 4, 20: 5, 30: 7 };

// ── Session builder ───────────────────────────────────────────────────────────

function buildSession(focusId, durationMins) {
  const poolIds     = EXERCISE_POOL_IDS[focusId] || [];
  const pool        = poolIds
    .map(id => EXERCISES.find(ex => ex.id === id))
    .filter(Boolean); // defensive — should never actually drop anything
  const conditions  = store.get("conditions")         || [];
  const painScores  = store.get("conditionPainScores") || {};
  const targetCount = EXERCISE_COUNT[durationMins]    || 5;

  // Single source of truth (04 Aug 2026, Phase B) — was a private,
  // duplicated threshold here (pain >= 4 subacute, matching the
  // pre-fix value Phase A corrected everywhere else). Now defers to
  // conditions.js's canonical getActiveConditionIds()/filterByConditions(),
  // same functions workoutGenerator.js already uses for every other
  // session type. Caution-tier exercises (soft block — included but
  // would ideally carry a modification note) are folded into the
  // available pool rather than excluded, matching a hard-block-only
  // policy for now; a dedicated caution-badge UI is a reasonable
  // future addition, not built here — scope stayed to consolidation.
  const activeConditionIds   = getActiveConditionIds(conditions, painScores);
  const { safe, caution }    = filterByConditions(pool, activeConditionIds);
  const available             = [...safe, ...caution];

  // Variety fix (04 Aug 2026, Phase B) — was always the first N items
  // of a fixed-order array, every time, for every user. Shuffled here
  // instead; still bounded by targetCount.
  const shuffled = [...available];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, targetCount);
}

// ── Coach intro for conditions ────────────────────────────────────────────────

function buildConditionNote() {
  const conditions = store.get("conditions")         || [];
  const painScores = store.get("conditionPainScores") || {};

  const relevant = conditions.filter(id => {
    const pain = painScores[id] || 0;
    return pain >= 3 && (
      id.includes("lower-back") || id.includes("hip") ||
      id.includes("abdominal")  || id.includes("sciatica") ||
      id.includes("hamstring")  || id.includes("wrist")
    );
  });

  if (relevant.length === 0) return null;

  const notes = relevant.map(id => {
    const pain = painScores[id] || 0;
    if (id.includes("lower-back")) {
      return pain >= 7
        ? "Your lower back is flagging high pain today. I've removed all loaded and rotational exercises. Everything here is gentle and safe."
        : "Your lower back has some discomfort. I've adjusted the session away from anything that loads the spine under flexion.";
    }
    if (id.includes("sciatica")) {
      return "Sciatica is present. I've avoided deep hip flexor loading and any exercises that compress the lumbar spine.";
    }
    if (id.includes("hamstring")) {
      return "With your hamstring, I've kept hip extension loading light. Stop if you feel any pulling sensation down the back of the leg.";
    }
    if (id.includes("hip")) {
      return "Your hip has been considered. The session avoids deep hip rotation and single-leg loading at end range.";
    }
    return null;
  }).filter(Boolean);

  return notes.length > 0 ? notes.join(" ") : null;
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (phase === "focus")    return renderFocusSelector();
  if (phase === "duration") return renderDurationSelector();
  if (phase === "overview") return renderSessionOverview();
  if (phase === "intro")    return renderSessionIntro();
  if (phase === "session")  return renderExercise();
  if (phase === "rest")     return renderRest();
  if (phase === "done")     return renderDone();
  return renderFocusSelector();
}

// ── Phase 1: Focus selector ───────────────────────────────────────────────────

function renderFocusSelector() {
  const name = store.get("name") || "";
  return `
    <div class="view core-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Back">
          Exit
        </button>
        <span class="workout-header-title">Core Session</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          ${name ? name + ". " : ""}What kind of core work feels right today?
        </p>
      </div>

      <div class="cs-focus-grid" role="group" aria-label="Choose your core session focus">
        ${FOCUS_TYPES.map(f => `
          <button class="cs-focus-card" data-focus="${f.id}"
                  aria-label="${f.label}: ${f.description}">
            <span class="cs-focus-icon" aria-hidden="true">${f.icon}</span>
            <span class="cs-focus-label">${f.label}</span>
            <span class="cs-focus-desc">${f.description}</span>
          </button>
        `).join("")}
      </div>

    </div>
  `;
}

// ── Phase 2: Duration selector ────────────────────────────────────────────────

function renderDurationSelector() {
  const focus = FOCUS_TYPES.find(f => f.id === selectedFocus);
  return `
    <div class="view core-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Back to focus">
          Back
        </button>
        <span class="workout-header-title">${focus?.label || "Core"}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">How long have you got?</p>
      </div>

      <div class="cs-duration-grid" role="group" aria-label="Choose session duration">
        ${DURATIONS.map(d => `
          <button class="cs-duration-card" data-mins="${d.mins}"
                  aria-label="${d.label}: ${d.description}">
            <span class="cs-duration-label">${d.label}</span>
            <span class="cs-duration-desc">${d.description}</span>
            <span class="cs-duration-count text-xs text-muted">
              ${EXERCISE_COUNT[d.mins]} exercises
            </span>
          </button>
        `).join("")}
      </div>

    </div>
  `;
}

// ── Phase 3: Session overview — all exercises visible before starting ────────────

function renderSessionOverview() {
  const focus    = FOCUS_TYPES.find(f => f.id === selectedFocus);
  const condNote = buildConditionNote();

  return `
    <div class="view core-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Back to duration">
          ← Back
        </button>
        <span class="workout-header-title">${focus?.label || "Core"} — ${selectedMins} min</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">${focus?.coachIntro || ""}</p>
          ${condNote ? `<p class="text-sm text-muted" style="margin-top: var(--space-3);">${condNote}</p>` : ""}
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">
            ${sessionQueue.length} exercises. You can review them all below before starting.
            Do them in any order that suits your equipment.
          </p>
        </div>
      </div>

      <!-- Exercise list — expandable cards, same pattern as gym programme -->
      <div class="gym-exercises-list" role="list">
        ${sessionQueue.map((ex, i) => `
          <div class="card gym-exercise-card" role="listitem">
            <button class="gym-exercise-header" data-ex-index="${i}"
                    aria-expanded="false"
                    aria-controls="core-ex-detail-${i}"
                    aria-label="${ex.name}: ${ex.sets || ""} sets${ex.reps ? ", " + ex.reps : ""}${ex.holdSeconds > 0 ? ", " + ex.holdSeconds + "s hold" : ""}">
              <div class="gym-exercise-header-left">
                <span class="exercise-role-badge core-overview-badge" aria-hidden="true">
                  ${focus?.label || "Core"}
                </span>
                <div class="gym-card-meta-row">
                  ${ex.sets ? `<span class="meta-tag">${ex.sets} sets</span>` : ""}
                  ${ex.reps ? `<span class="meta-tag">${ex.reps}</span>` : ""}
                  ${ex.holdSeconds > 0 ? `<span class="meta-tag">${ex.holdSeconds}s hold</span>` : ""}
                  ${ex.rest > 0 ? `<span class="meta-tag">rest ${ex.rest}s</span>` : ""}
                  ${ex.tempo ? `<span class="meta-tag">${ex.tempo}</span>` : ""}
                </div>
                <h3 class="gym-exercise-name">${ex.name}</h3>
              </div>
              <span class="gym-card-chevron" aria-hidden="true">▼</span>
            </button>

            <div class="gym-exercise-detail" id="core-ex-detail-${i}" hidden>
              ${ex.instructions && ex.instructions.length > 0 ? `
                <ul class="exercise-cues" aria-label="How to get there">
                  ${ex.instructions.map(inst => `<li>${inst}</li>`).join("")}
                </ul>
              ` : ""}
              ${ex.cues?.length ? `<p class="exercise-cue">${ex.cues[0]}</p>` : ""}
              ${ex.coaching ? `
                <div class="coaching-tip">
                  <span class="tip-icon" aria-hidden="true">\uD83D\uDCA1</span>
                  <p>${ex.coaching}</p>
                </div>
              ` : ""}
              ${ex.why ? `
                <div class="exercise-why">
                  <p class="exercise-why-label">Why this exercise</p>
                  <p class="exercise-why-text">${ex.why}</p>
                </div>
              ` : ""}
            </div>
          </div>
        `).join("")}
      </div>

      <button class="btn btn-primary btn-large btn-full" id="cs-start-btn"
              style="margin-top: var(--space-6);">
        Let’s go
      </button>

    </div>
  `;
}

// ── Phase 4: Session intro card (brief, shown after Let's go) ────────────────────

function renderSessionIntro() {
  const focus       = FOCUS_TYPES.find(f => f.id === selectedFocus);
  const condNote    = buildConditionNote();
  const exCount     = sessionQueue.length;

  return `
    <div class="view core-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Exit session">
          Exit
        </button>
        <span class="workout-header-title">${focus?.label || "Core"} — ${selectedMins} min</span>
      </div>

      <div class="card card-coach">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">${focus?.coachIntro || ""}</p>
          ${condNote ? `
            <p class="coach-message-text" style="margin-top: var(--space-3);
               font-size: var(--text-sm); color: var(--color-text-muted);">
              ${condNote}
            </p>
          ` : ""}
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">
            ${exCount} exercises. Take your time between each one.
          </p>
        </div>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="cs-start-btn"
              style="margin-top: var(--space-6);">
        Let's go
      </button>

    </div>
  `;
}

// ── Phase 4: Exercise ─────────────────────────────────────────────────────────

function renderExercise() {
  if (currentIndex >= sessionQueue.length) {
    phase = "done";
    return renderDone();
  }

  const ex       = sessionQueue[currentIndex];
  const total    = sessionQueue.length;
  const progress = Math.round((currentIndex / total) * 100);
  const isLast   = currentIndex >= total - 1;
  const hasTimer = ex.holdSeconds > 0;

  return `
    <div class="view core-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-exit-btn" aria-label="Exit session">
          Exit
        </button>
        <div class="workout-progress-info"
             aria-label="Exercise ${currentIndex + 1} of ${total}">
          <span>${currentIndex + 1} of ${total}</span>
        </div>
      </div>

      <div class="workout-progress-bar" role="progressbar"
           aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Session progress, ${progress}%">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>

      <div class="card exercise-card">

        <div class="exercise-role-badge main" aria-hidden="true">
          Core — ${FOCUS_TYPES.find(f => f.id === selectedFocus)?.label || ""}
        </div>

        <h1 class="exercise-name">${ex.name}</h1>

        <div class="exercise-meta">
          ${ex.sets ? `<span class="meta-tag">${ex.sets} sets</span>` : ""}
          ${ex.reps ? `<span class="meta-tag">${ex.reps}</span>` : ""}
          ${ex.holdSeconds > 0 ? `<span class="meta-tag">${ex.holdSeconds}s hold</span>` : ""}
          ${ex.rest > 0 ? `<span class="meta-tag">${ex.rest}s rest</span>` : ""}
        </div>

        ${hasTimer ? `
          <div class="exercise-target">
            <div class="timer-display">
              <div class="timer-circle">
                <span class="timer-value" id="cs-timer-display">
                  ${formatTime(timeRemaining || ex.holdSeconds)}
                </span>
                <span class="timer-label">Hold</span>
              </div>
            </div>
          </div>
        ` : ""}

        <p class="exercise-description">${ex.description}</p>

        ${ex.instructions && ex.instructions.length > 0 ? `
          <ul class="exercise-cues" aria-label="How to get there">
            ${ex.instructions.map(inst => `<li>${inst}</li>`).join("")}
          </ul>
        ` : ""}

        ${ex.cues?.length ? `
          <ul class="exercise-cues" aria-label="Coaching cues">
            ${ex.cues.map(cue => `<li>${cue}</li>`).join("")}
          </ul>
        ` : ""}

        ${ex.coaching ? `
          <div class="coaching-tip">
            <span class="tip-icon" aria-hidden="true">\uD83D\uDCA1</span>
            <p>${ex.coaching}</p>
          </div>
        ` : ""}

        ${ex.why ? `
          <details class="cs-why-details">
            <summary class="text-sm text-muted">Why this exercise?</summary>
            <p class="text-sm text-muted" style="margin-top: var(--space-2);">
              ${ex.why}
            </p>
          </details>
        ` : ""}

        ${ex.load ? `
          <div class="exercise-load" role="region" aria-label="How heavy for this exercise">
            <span class="exercise-section-label" id="cs-section-load">How heavy</span>
            <p class="exercise-load-text" aria-labelledby="cs-section-load">${ex.load}</p>
          </div>
        ` : ""}

        ${(() => {
          // CORE-1. Fires when this exercise loads an area flagged sore today
          // and is NOT contraindicated -- contraindicated ones never reach a
          // card. Names the area, per P7: a coach told something specific that
          // then hedges is pretending not to know. Invitation, not instruction.
          const _c = bodyCaution(ex);
          return _c ? `<p class="exercise-caution" role="note">${_c}</p>` : "";
        })()}

        ${ex.watchOut && ex.watchOut.length > 0 ? `
          <div class="exercise-watchout" role="region" aria-label="What to watch for with this exercise">
            <span class="exercise-section-label" id="cs-section-watchout">What to watch for</span>
            <ul class="exercise-watchout-list" aria-labelledby="cs-section-watchout">
              ${ex.watchOut.map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(ex.youtube || (ex.name + " exercise form"))}"
           target="_blank"
           rel="noopener noreferrer"
           class="youtube-link"
           aria-label="Watch how to do ${ex.name} on YouTube (opens in new tab)">
          <span class="youtube-icon" aria-hidden="true">\u25B6\uFE0F</span>
          Watch how to do this
        </a>

        <!-- LOG-3. Card-shaped view, so the shared block applies. Full
             field set: core work is loaded and repped like any other
             strength exercise, unlike yoga's gentle mode. -->
        ${renderLogBlock(ex, `cs-log-${currentIndex}`)}

      </div>

      <div class="workout-actions">

        ${hasTimer ? `
          <button class="btn btn-large btn-full ${timerRunning ? "btn-secondary" : "btn-accent"}"
                  id="cs-timer-btn"
                  aria-live="polite"
                  aria-label="${timerRunning ? "Pause hold timer" : "Start hold timer"}">
            ${timerRunning ? "Pause" : (timeRemaining > 0 && timeRemaining < ex.holdSeconds ? "Resume" : "Start hold")}
          </button>
        ` : ""}

        <button class="btn btn-primary btn-large btn-full" id="cs-next-btn">
          ${isLast ? "Finish session" : "Done — Next"}
        </button>

        <button class="btn btn-ghost btn-small" id="cs-skip-btn"
                aria-label="Skip ${ex.name}">
          Skip
        </button>

      </div>

    </div>
  `;
}

// ── Phase 5: Rest card ────────────────────────────────────────────────────────

function renderRest() {
  const nextEx = sessionQueue[currentIndex];
  return `
    <div class="view core-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-exit-btn" aria-label="Exit">Exit</button>
        <span class="workout-header-title">Rest</span>
      </div>

      <div class="card" style="margin-top: var(--space-6); text-align: center; padding: var(--space-8);">
        <div class="timer-display" style="justify-content: center; margin-bottom: var(--space-4);">
          <div class="timer-circle">
            <span class="timer-value" id="cs-rest-display">
              ${formatTime(restRemaining)}
            </span>
            <span class="timer-label">Rest</span>
          </div>
        </div>
        <p class="text-secondary">
          ${nextEx ? `Up next: ${nextEx.name}` : "Last exercise coming up"}
        </p>
      </div>

      <button class="btn btn-primary btn-full" id="cs-rest-skip-btn"
              style="margin-top: var(--space-4);">
        Skip rest
      </button>
    </div>
  `;
}

// ── Phase 6: Done ─────────────────────────────────────────────────────────────

function renderDone() {
  const name        = store.get("name") || "";
  const focus       = FOCUS_TYPES.find(f => f.id === selectedFocus);
  const exercisesDone = currentIndex;

  return `
    <div class="view core-session-view" style="text-align: center;">
      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h2 style="color: var(--color-primary); margin-bottom: var(--space-2);">
            That's your core session done.
          </h2>
          <p class="coach-message-text">
            ${name ? name + " — " : ""}${exercisesDone} exercises, ${selectedMins} minutes of ${focus?.label?.toLowerCase() || "core"} work.
            ${selectedFocus === "rehab"
              ? "Consistent gentle work adds up. This matters."
              : selectedFocus === "stability"
              ? "Stability work is quiet work. You won't always feel it during — you'll notice it in everything else you do."
              : "Good work."}
          </p>
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">
            +${creditsEarned} credits earned
          </p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);">
        <button class="btn btn-primary btn-full" id="cs-reflect-btn">
          How did that feel?
        </button>
        <button class="btn btn-ghost btn-full" id="cs-home-btn">
          Back to today
        </button>
      </div>
    </div>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function startExerciseTimer(holdSecs) {
  if (timerInterval) clearInterval(timerInterval);
  timeRemaining = timeRemaining || holdSecs;
  timerRunning  = true;
  timerInterval = setInterval(() => {
    timeRemaining--;
    const el = document.getElementById("cs-timer-display");
    if (el) el.textContent = formatTime(timeRemaining);
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning  = false;
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
      const btn = document.getElementById("cs-timer-btn");
      if (btn) {
        btn.textContent = "Hold complete";
        btn.disabled    = true;
      }
    }
  }, 1000);
}

function pauseExerciseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
}

function startRestTimer(seconds, onComplete) {
  restRemaining = seconds;
  if (restInterval) clearInterval(restInterval);
  restInterval = setInterval(() => {
    restRemaining--;
    const el = document.getElementById("cs-rest-display");
    if (el) el.textContent = formatTime(restRemaining);
    if (restRemaining <= 0) {
      clearInterval(restInterval);
      restInterval = null;
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      onComplete();
    }
  }, 1000);
}

function awardCredits() {
  creditsEarned += 20;
}

function completeExercise() {
  awardCredits();
  const ex = sessionQueue[currentIndex];
  currentIndex++;
  timeRemaining = 0;
  timerRunning  = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  if (currentIndex >= sessionQueue.length) {
    // Session complete
    finaliseSession();
    return;
  }

  // Show rest card if rest > 0
  if (ex.rest > 0) {
    phase         = "rest";
    restRemaining = ex.rest;
    rerender();
    startRestTimer(ex.rest, () => {
      phase = "session";
      rerender();
    });
  } else {
    phase = "session";
    rerender();
  }
}

function finaliseSession() {
  const total = (store.get("totalCredits") || 0) + creditsEarned;
  store.set("totalCredits",       total);
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    "Core Session");

  // 30 Jul 2026 v4 (Core Session data-integrity investigation): stopped
  // spreading `pending` (currentActivityEntry) into this write. Confirmed
  // this session — no route into core-session.js ever sets a genuine
  // pending entry upstream (core isn't in intention.js's ACTIVITIES list
  // at all), so `pending` here was never legitimate same-session data. It
  // was, however, whatever this file's own PREVIOUS completion wrote back
  // (see the re-set below) — meaning two back-to-back Core Sessions not
  // separated by an intention.js visit spread the first entry's `id` into
  // the second, and store.logActivity() honoured `entry.id` if present,
  // producing two real, different completions sharing one activityLog id.
  // Fix: build the entry fresh every time, always let logActivity() assign
  // a new id. The re-set of currentActivityEntry after the write (below)
  // is unchanged and still needed for reflect.js's "How did that feel?"
  // find-by-id flow.
  const nowIso = new Date().toISOString();

  const activityEntry = store.logActivity({
    type:           "core-session",
    source:         "self-directed",
    sessionEnd:     nowIso,
    completedAt:    nowIso,
    status:         "completed",
    durationMins:   elapsedMins(),
    exercisesCount: currentIndex,
    // CONT-3, 12 Aug 2026. This view logged a COUNT and never the ids, so
    // store.logActivity() had nothing to forward to recordExercises() and
    // exerciseHistory never learned a single core exercise. Consequence:
    // continuity-aware selection could not build familiarity from core
    // work, and the drop-in coach question's 21-day window never saw it.
    // Sliced to currentIndex because that is how many were actually done.
    exerciseIds:    sessionQueue.slice(0, currentIndex).map(e => e.id).filter(Boolean),
    creditsEarned
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }

  phase = "done";
  rerender();
}

function resetSession() {
  dismountSessionGuard();
  sessionStartTime = null;
  phase         = "focus";
  selectedFocus = null;
  selectedMins  = null;
  sessionQueue  = [];
  currentIndex  = 0;
  creditsEarned = 0;
  timeRemaining = 0;
  timerRunning  = false;
  restRemaining = 0;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (restInterval)  { clearInterval(restInterval);  restInterval  = null; }
}

// ── Exit confirmation overlay ──────────────────────────────────────────────
// Shown when user taps Exit during an active session.
// Replaces browser confirm() with a coach-voiced in-app card.

function showExitConfirm() {
  // Pause any running timer

  const overlay = document.createElement("div");
  overlay.className = "session-exit-overlay";
  overlay.id        = "session-exit-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Exit session confirmation");
  overlay.innerHTML = `
    <div class="session-exit-card">
      <div class="session-exit-coach-row">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="session-exit-coach-text">
          Hold on — if you leave now this session won’t be saved. Are you sure?
        </p>
      </div>
      <div class="session-exit-actions">
        <button class="btn btn-primary btn-full" id="exit-confirm-stay"
                aria-label="Stay in session">
          Stay in session
        </button>
        <button class="btn btn-ghost btn-full" id="exit-confirm-leave"
                aria-label="Exit and save progress so far">
          Exit and save progress
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Stay — remove overlay and resume
  document.getElementById("exit-confirm-stay").addEventListener("click", () => {
    overlay.remove();
  });

  // Leave — save partial entry and navigate to reflect
  document.getElementById("exit-confirm-leave").addEventListener("click", () => {
    overlay.remove();
    savePartialSession();
    resetSession();
    router.navigate("reflect");
  });
}

/**
 * 23 Jul 2026 v3 (BUILD-3): REWRITTEN. Two fixes bundled here —
 * (1) migrated to store.logActivity(), matching yoga-session.js v4's
 * confirmed-working pattern, and (2) this function previously referenced
 * an undeclared variable `elapsed` for durationMins. Like yoga-session.js,
 * core-session.js has no running elapsed-time tracker (only per-exercise
 * hold timers) — durationMins is left explicitly null with a comment
 * rather than fabricated. A real elapsed-time tracker would be a
 * separate, larger addition for a future session.
 *
 * 30 Jul 2026 v4 (Core Session data-integrity investigation): stopped
 * spreading `pending` here too, same id-reuse fix and same reasoning as
 * finaliseSession() above.
 */
function savePartialSession() {
  const nowIso = new Date().toISOString();

  const activityEntry = store.logActivity({
    type:           "core-session",
    source:         "self-directed",
    sessionEnd:     nowIso,
    completedAt:    nowIso,
    status:         "partial",
    // 11 Aug 2026 (WOW-1): a real session clock now exists in this file,
    // so a partial exit reports genuine elapsed time instead of null.
    durationMins:   elapsedMins(),
    exercisesCount: currentIndex,
    creditsEarned:  typeof creditsEarned !== "undefined" ? creditsEarned : 0
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }
}


function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // LOG-3. Re-wired per render; attachLogEvents() guards double-binding.
  if (phase === "session" && sessionQueue[currentIndex]) {
    attachLogEvents(sessionQueue[currentIndex], `cs-log-${currentIndex}`);
  }

  mountSessionGuard({
    isActive: () => phase === "session" || phase === "rest",
    label:    "core session",
    onExit:   () => { savePartialSession(); resetSession(); router.navigate("reflect"); }
  });

  // Back / Exit
  document.getElementById("cs-back-btn")?.addEventListener("click", () => {
    if (phase === "focus") {
      resetSession();
      router.navigate("intention");
    } else if (phase === "duration") {
      phase = "focus";
      rerender();
    } else {
      showExitConfirm();
    }
  });

  document.getElementById("cs-exit-btn")?.addEventListener("click", () => {
    showExitConfirm();
  });

  // Focus cards
  document.querySelectorAll(".cs-focus-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedFocus = btn.dataset.focus;
      phase         = "duration";
      rerender();
    });
  });

  // Duration cards
  document.querySelectorAll(".cs-duration-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMins = parseInt(btn.dataset.mins);
      sessionQueue = buildSession(selectedFocus, selectedMins);
      phase        = "intro";
      rerender();
    });
  });

  // Start
  document.getElementById("cs-start-btn")?.addEventListener("click", () => {
    currentIndex  = 0;
    creditsEarned = 0;
    timeRemaining = 0;
    timerRunning  = false;
    sessionStartTime = Date.now();
    phase         = "session";
    rerender();
  });

  // Exercise timer
  document.getElementById("cs-timer-btn")?.addEventListener("click", () => {
    const ex = sessionQueue[currentIndex];
    if (!timerRunning) {
      startExerciseTimer(ex?.holdSeconds || 0);
    } else {
      pauseExerciseTimer();
    }
    // Update button label
    const btn = document.getElementById("cs-timer-btn");
    if (btn) {
      btn.textContent = timerRunning ? "Pause" : "Resume";
      btn.setAttribute("aria-label", timerRunning ? "Pause hold timer" : "Resume hold timer");
    }
  });

  // Next / complete
  document.getElementById("cs-next-btn")?.addEventListener("click", () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerRunning = false;
    completeExercise();
  });

  // Skip
  document.getElementById("cs-skip-btn")?.addEventListener("click", () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerRunning  = false;
    timeRemaining = 0;
    currentIndex++;
    if (currentIndex >= sessionQueue.length) {
      finaliseSession();
    } else {
      phase = "session";
      rerender();
    }
  });

  // Skip rest
  document.getElementById("cs-rest-skip-btn")?.addEventListener("click", () => {
    if (restInterval) { clearInterval(restInterval); restInterval = null; }
    phase = "session";
    rerender();
  });

  // Completion buttons
  document.getElementById("cs-reflect-btn")?.addEventListener("click", () => {
    router.navigate("reflect");
  });

  document.getElementById("cs-home-btn")?.addEventListener("click", () => {
    resetSession();
    router.navigate("intention");
  });
}
