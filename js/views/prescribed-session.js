/**
 * prescribed-session.js - Prescribed Exercise Session View
 *
 * 9 May 2026 v1
 *
 * v1.2 — Weight history + exercise card redesign (S-A1, S-A2):
 *   Weight input now appears beneath the exercise for weighted exercises.
 *   Last 5 weights logged per exercise are shown as a history row —
 *   helps user set up correctly and choose progression.
 *   Weight is saved to weightHistory[] on the exercise object in the store.
 *   Card structure now matches coach-recommended activity cards:
 *     - Note (above name, if present)
 *     - Exercise name (h1, teal)
 *     - Sets x reps / hold info
 *     - Description paragraph
 *     - Coaching cues (bullet list)
 *     - "Watch how to do this" button (if youtubeUrl present)
 *   Weight unit respects store.weightUnit (kg / lbs).
 *
 * v1.1 — Timer-based exercises, skip, session credits, workout-complete reuse.
 * v1.0 — Basic walk-through with sets/reps display.
 *
 * Route: "prescribed-session"
 * Nav: hidden (same as workout view)
 */

import { store } from "../store.js";

export const centered = false;

// ── Credit constants ──────────────────────────────────────────────────────────
const CREDITS_PER_EXERCISE = 35;
const CREDITS_MAX          = 150;

// ── Session state ─────────────────────────────────────────────────────────────
let currentIndex  = 0;
let timerInterval = null;
let timeRemaining = 0;
let timerStarted  = false;

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const exercises = store.get("prescribedExercises") || [];
  const active    = exercises.filter(e => e.active !== false && !e.completedToday);

  if (active.length === 0) return renderAlreadyDone();

  // Guard against out-of-bounds index (e.g. after navigating back)
  if (currentIndex >= active.length) currentIndex = active.length - 1;

  const ex       = active[currentIndex];
  const isLast   = currentIndex >= active.length - 1;
  const progress = (currentIndex / active.length) * 100;
  const holdSecs = parseHoldSeconds(ex.reps);
  const hasTimer = holdSecs !== null;
  const unit     = store.get("weightUnit") || "kg";
  const history  = ex.weightHistory || [];

  return `
    <div class="view workout-view">

      <!-- Header -->
      <div class="workout-header">
        <button class="btn btn-ghost" id="ps-exit-btn" aria-label="Exit prescribed session">
          Exit
        </button>
        <div class="workout-progress-info" aria-label="Exercise ${currentIndex + 1} of ${active.length}">
          <span>${currentIndex + 1} of ${active.length}</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="workout-progress-bar" role="progressbar"
           aria-valuenow="${Math.round(progress)}"
           aria-valuemin="0" aria-valuemax="100"
           aria-label="Session progress, ${Math.round(progress)}%">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>

      <!-- Exercise card — matches coach-recommended card structure -->
      <div class="card exercise-card">

        <!-- Note (above name — e.g. "1-2 inches only") -->
        ${ex.note ? `
          <p class="exercise-card-note text-sm text-muted">
            Note: ${ex.note}
          </p>
        ` : ""}

        <!-- Badge -->
        <div class="exercise-role-badge prescribed" aria-label="Prescribed exercise">
          🩺 Prescribed
        </div>

        <!-- Exercise name -->
        <h1 class="exercise-name">${ex.name}</h1>

        <!-- Sets / reps / credits -->
        <div class="exercise-meta">
          ${ex.sets && !hasTimer ? `<span class="meta-tag">${ex.sets} sets</span>` : ""}
          ${ex.reps             ? `<span class="meta-tag">${ex.reps}</span>` : ""}
          ${ex.restSeconds      ? `<span class="meta-tag">${ex.restSeconds}s rest</span>` : ""}
          <span class="meta-tag">+${creditsForIndex(currentIndex, active.length)} ⭐</span>
        </div>

        <!-- Timer (hold-based) -->
        ${hasTimer ? `
          <div class="exercise-target">
            <div class="timer-display">
              <div class="timer-circle">
                <span class="timer-value" id="ps-timer-display">
                  ${formatTime(timeRemaining || holdSecs)}
                </span>
                <span class="timer-label">
                  ${ex.sets > 1 ? "Set 1 of " + ex.sets : "Hold"}
                </span>
              </div>
            </div>
          </div>
        ` : ""}

        <!-- Description -->
        ${ex.description ? `
          <p class="exercise-description">${ex.description}</p>
        ` : ""}

        <!-- Cues -->
        ${Array.isArray(ex.cues) && ex.cues.length > 0 ? `
          <ul class="exercise-cues" aria-label="Coaching cues">
            ${ex.cues.map(cue => `<li>${cue}</li>`).join("")}
          </ul>
        ` : ""}

        <!-- Physio notes -->
        ${ex.notes ? `
          <div class="exercise-instructions card" style="margin-top: var(--space-3);">
            <h3 class="text-sm" style="margin-bottom: var(--space-2);">
              Notes from your physio
            </h3>
            <p class="text-sm">${ex.notes}</p>
          </div>
        ` : ""}

        <!-- YouTube link -->
        ${ex.youtubeUrl ? `
          <a href="${ex.youtubeUrl}"
             target="_blank"
             rel="noopener noreferrer"
             class="btn btn-outline btn-full exercise-youtube-btn"
             aria-label="Watch how to do ${ex.name} — opens YouTube">
            Watch how to do this
          </a>
        ` : ""}

        <!-- Weight input + history -->
        ${!hasTimer ? renderWeightSection(ex, unit, history) : ""}

      </div>

      <!-- Actions -->
      <div class="workout-actions">

        ${hasTimer ? `
          <button class="btn btn-large btn-full ${timerStarted ? "btn-secondary" : "btn-accent"}"
                  id="ps-timer-btn"
                  aria-live="polite"
                  aria-label="${!timerStarted ? "Start timer" : (timerInterval ? "Pause timer" : "Resume timer")}">
            ${!timerStarted ? "Start Timer" : (timerInterval ? "Pause" : "Resume")}
          </button>
        ` : ""}

        <button class="btn btn-primary btn-large btn-full" id="ps-complete-btn">
          ${isLast ? "Complete Session" : "Done — Next"}
        </button>

        <button class="btn btn-ghost btn-small" id="ps-skip-btn"
                aria-label="Skip ${ex.name}">
          Skip this one
        </button>

      </div>

    </div>
  `;
}

// ── Weight section ────────────────────────────────────────────────────────────

function renderWeightSection(ex, unit, history) {
  const lastWeight = history.length > 0 ? history[history.length - 1].weight : "";
  const recent     = history.slice(-5).reverse(); // show most recent first, max 5

  return `
    <div class="ps-weight-section" style="margin-top: var(--space-4);">
      <label class="form-label" for="ps-weight-input">
        Weight used (${unit})
        <span class="text-muted text-sm" aria-hidden="true"> — optional</span>
      </label>

      <div class="ps-weight-row">
        <input type="number"
               id="ps-weight-input"
               class="form-input ps-weight-input"
               placeholder="${lastWeight || "0"}"
               value="${lastWeight || ""}"
               min="0"
               step="0.5"
               aria-label="Weight used in ${unit}">
        <button class="btn btn-secondary btn-sm" id="ps-weight-save-btn"
                data-exercise-id="${ex.id}"
                aria-label="Save weight">
          Save
        </button>
      </div>

      ${recent.length > 0 ? `
        <div class="ps-weight-history" aria-label="Previous weights used">
          <span class="ps-weight-history-label text-xs text-muted">
            Previous:
          </span>
          <div class="ps-weight-history-chips">
            ${recent.map((entry, i) => `
              <button class="ps-weight-chip"
                      data-weight="${entry.weight}"
                      aria-label="Use ${entry.weight}${unit} from ${formatHistoryDate(entry.date)}">
                ${entry.weight}${unit}
                <span class="ps-weight-chip-date text-xs" aria-hidden="true">
                  ${i === 0 ? "last time" : formatHistoryDate(entry.date)}
                </span>
              </button>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <p class="text-xs text-muted" style="margin-top: var(--space-1);">
        Saved weights help you set up and track progression over time.
      </p>
    </div>
  `;
}

function formatHistoryDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ── Already done ──────────────────────────────────────────────────────────────

function renderAlreadyDone() {
  return `
    <div class="view">
      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h2>All done for today</h2>
          <p>You have already completed all your prescribed exercises today.
             See you tomorrow.</p>
          <button class="btn btn-primary" id="ps-back-btn"
                  style="margin-top: var(--space-4);">
            Back to choices
          </button>
        </div>
      </div>
    </div>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse hold seconds from a reps/hold string.
 * "30s" → 30, "2 min" → 120, "10 reps" → null, "10" → null
 */
function parseHoldSeconds(str) {
  if (!str) return null;
  const lower = str.toLowerCase().trim();
  const secMatch = lower.match(/^(\d+)\s*s(?:ec(?:onds?)?)?$/);
  if (secMatch) return parseInt(secMatch[1]);
  const minMatch = lower.match(/^(\d+)\s*min(?:utes?)?$/);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  return null;
}

function creditsForIndex(index, total) {
  const sessionTotal = Math.min(total * CREDITS_PER_EXERCISE, CREDITS_MAX);
  const base         = Math.floor(sessionTotal / total);
  const remainder    = sessionTotal - (base * total);
  return index === total - 1 ? base + remainder : base;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ── Save weight to exercise history ──────────────────────────────────────────

/**
 * Saves a weight entry to the exercise's weightHistory[].
 * History is stored on the exercise object itself in prescribedExercises[].
 * Max 20 entries per exercise — oldest pruned first.
 */
function saveWeight(exerciseId, weightValue) {
  const weight = parseFloat(weightValue);
  if (isNaN(weight) || weight <= 0) return;

  const all = store.get("prescribedExercises") || [];
  const idx = all.findIndex(e => e.id === exerciseId);
  if (idx === -1) return;

  const history = Array.isArray(all[idx].weightHistory)
    ? [...all[idx].weightHistory]
    : [];

  history.push({
    weight,
    date: new Date().toISOString()
  });

  // Keep max 20 entries
  if (history.length > 20) history.splice(0, history.length - 20);

  all[idx] = { ...all[idx], weightHistory: history };
  store.set("prescribedExercises", all);

  // Visual feedback — briefly show "Saved"
  const btn = document.getElementById("ps-weight-save-btn");
  if (btn) {
    const original = btn.textContent;
    btn.textContent = "Saved";
    btn.disabled    = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled    = false;
    }, 1500);
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  const exercises = store.get("prescribedExercises") || [];
  const active    = exercises.filter(e => e.active !== false && !e.completedToday);

  // Already-done state
  document.getElementById("ps-back-btn")?.addEventListener("click", () => {
    router.navigate("intention");
  });

  if (active.length === 0) return;

  if (currentIndex >= active.length) currentIndex = active.length - 1;

  const ex       = active[currentIndex];
  const holdSecs = parseHoldSeconds(ex.reps);

  // Initialise timer
  if (holdSecs) {
    timeRemaining = timeRemaining || holdSecs;
    updateTimerDisplay();
  }

  // Exit
  document.getElementById("ps-exit-btn")?.addEventListener("click", () => {
    if (confirm("Exit session? Your progress on this exercise will be lost.")) {
      cleanupSession();
      router.navigate("intention");
    }
  });

  // Timer toggle
  document.getElementById("ps-timer-btn")?.addEventListener("click", () => {
    if (!timerStarted) {
      timerStarted = true;
      startTimer();
    } else if (timerInterval) {
      pauseTimer();
    } else {
      startTimer();
    }
    // Re-render just the timer button label
    const btn = document.getElementById("ps-timer-btn");
    if (btn) {
      btn.textContent  = timerInterval ? "Pause" : "Resume";
      btn.setAttribute("aria-label", timerInterval ? "Pause timer" : "Resume timer");
    }
  });

  // Weight: save button
  document.getElementById("ps-weight-save-btn")?.addEventListener("click", () => {
    const input = document.getElementById("ps-weight-input");
    if (input?.value) {
      saveWeight(ex.id, input.value);
    }
  });

  // Weight: chip tap — fills input with that weight
  document.querySelectorAll(".ps-weight-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const weight = chip.dataset.weight;
      const input  = document.getElementById("ps-weight-input");
      if (input && weight) {
        input.value = weight;
        input.focus();
      }
    });
  });

  // Complete
  document.getElementById("ps-complete-btn")?.addEventListener("click", () => {
    // Auto-save weight if something is in the input and unsaved
    const input  = document.getElementById("ps-weight-input");
    const saveBtn = document.getElementById("ps-weight-save-btn");
    if (input?.value && !saveBtn?.disabled) {
      saveWeight(ex.id, input.value);
    }
    completeExercise(active);
  });

  // Skip
  document.getElementById("ps-skip-btn")?.addEventListener("click", () => {
    advanceSession(active);
  });
}

// ── Timer ─────────────────────────────────────────────────────────────────────

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
      // Update button to show timer finished
      const btn = document.getElementById("ps-timer-btn");
      if (btn) {
        btn.textContent = "Done";
        btn.setAttribute("aria-label", "Timer complete");
      }
    }
  }, 1000);
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const el = document.getElementById("ps-timer-display");
  if (el) el.textContent = formatTime(timeRemaining);
}

function resetTimer() {
  pauseTimer();
  timeRemaining = 0;
  timerStarted  = false;
}

// ── Exercise flow ─────────────────────────────────────────────────────────────

function completeExercise(active) {
  const ex      = active[currentIndex];
  const credits = creditsForIndex(currentIndex, active.length);

  const all          = store.get("prescribedExercises") || [];
  const globalIndex  = all.findIndex(e => e.id === ex.id);
  if (globalIndex !== -1) {
    all[globalIndex] = {
      ...all[globalIndex],
      completedToday: true,
      completedAt:    new Date().toISOString()
    };
    store.set("prescribedExercises", all);
  }

  const progress = store.get("prescribedSessionProgress") || [];
  progress.push({ exerciseId: ex.id, credits });
  store.set("prescribedSessionProgress", progress);

  advanceSession(active);
}

function advanceSession(active) {
  if (currentIndex >= active.length - 1) {
    completeSession(active);
  } else {
    currentIndex++;
    resetTimer();
    router.navigate("prescribed-session");
  }
}

function completeSession(active) {
  const progress      = store.get("prescribedSessionProgress") || [];
  const creditsEarned = Math.min(
    progress.reduce((sum, e) => sum + (e.credits || 0), 0),
    CREDITS_MAX
  );

  store.set("totalCredits",       (store.get("totalCredits") || 0) + creditsEarned);
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    "Prescribed Session");

  cleanupSession();
  router.navigate("workout-complete");
}

function cleanupSession() {
  pauseTimer();
  currentIndex  = 0;
  timeRemaining = 0;
  timerStarted  = false;
  store.set("prescribedSessionProgress", null);
}
