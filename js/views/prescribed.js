/**
 * prescribed.js - Prescribed Exercises View
 *
 * v1.0 — Dedicated full view for exercises prescribed by an external
 *   professional (physiotherapist, consultant, GP, specialist).
 *
 *   This is a separate space from coach-recommended workouts.
 *   The coach acknowledges this is not their territory and speaks
 *   accordingly — supportive, not directive.
 *
 *   Contains:
 *     - Coach card (warm, condition-aware, acknowledges external origin)
 *     - Exercise list with sets, reps/hold, notes, weekly completion history
 *     - Add exercise form: name, sets, reps/hold, notes, prescribed-by
 *     - Start Session button (navigates to prescribed-session.js)
 *     - Back to choices (top header link + bottom button) -> intention view
 *
 *   Route: 'prescribed'
 *   Nav: shown (user is in the main app, not mid-session)
 *
 *   Credits: 35 per exercise, max 150 per session (matches prescribed-session.js).
 */

import { store } from "../store.js";

export const centered = false;

// ── Credit constants (must match prescribed-session.js) ───────────────────────
const CREDITS_PER_EXERCISE = 35;
const CREDITS_MAX          = 150;

// ── View state ────────────────────────────────────────────────────────────────
let showAddForm = false;

// ── Coach lines ───────────────────────────────────────────────────────────────

/**
 * Returns a coach line appropriate to the prescribed context.
 * The coach is supportive but clear that these exercises come from
 * the user's professional, not from the coach. Varies by state.
 *
 * @param {Array}  exercises - full prescribedExercises array
 * @param {number} energy    - today's energy score
 */
function buildCoachLine(exercises, energy) {
  const active = exercises.filter(e => !e.completedToday);
  const done   = exercises.filter(e => e.completedToday);

  if (exercises.length === 0) {
    return "If your physio or consultant has given you exercises to do, you can add them here. I'll keep them separate from your regular sessions and remind you they're here each time you check in.";
  }

  if (done.length > 0 && active.length === 0) {
    return "You've done all your prescribed exercises today. That matters -- consistency with these is exactly what your professional is counting on. Well done.";
  }

  if (done.length > 0 && active.length > 0) {
    return "Good progress -- you've completed " + done.length + " so far today. " + active.length + " still to go. Take your time.";
  }

  // None done yet
  if (energy !== null && energy <= 3) {
    return "I know your energy is low today. These exercises matter -- even a gentle run-through at low effort is better than skipping. But listen to your body and do what you can.";
  }

  return "These are your prescribed exercises. I'll keep them here, separate from everything else. Your professional knows your situation -- I'm just here to help you show up for them.";
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  const exercises  = store.get("prescribedExercises") || [];
  const active     = exercises.filter(e => !e.completedToday);
  const done       = exercises.filter(e => e.completedToday);
  const checkin    = store.get("lastCheckin") || {};
  const energy     = checkin.energy || null;
  const coachLine  = buildCoachLine(exercises, energy);
  const creditsAvail = Math.min(active.length * CREDITS_PER_EXERCISE, CREDITS_MAX);

  return `
    <div class="view prescribed-view">

      <!-- ── Header with back link ────────────────────────────────────────── -->
      <div class="view-header prescribed-view-header">
        <button class="btn btn-ghost btn-small prescribed-back-top"
                id="prescribed-back-top"
                aria-label="Back to choices">
          &larr; Back to choices
        </button>
        <h1>Prescribed Exercises</h1>
      </div>

      <!-- ── Coach card ───────────────────────────────────────────────────── -->
      <div class="card card-coach">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${coachLine}</p>
      </div>

      <!-- ── Exercise list ────────────────────────────────────────────────── -->
      ${exercises.length === 0
        ? renderEmptyState()
        : renderExerciseList(active, done, creditsAvail)
      }

      <!-- ── Add exercise form ────────────────────────────────────────────── -->
      <div class="prescribed-add-section" style="margin-top: var(--space-5);">
        <button class="btn btn-ghost btn-full" id="px-toggle-form-btn"
                aria-expanded="${showAddForm}"
                aria-controls="px-add-form-wrap">
          ${showAddForm ? "Cancel" : "+ Add prescribed exercise"}
        </button>

        <div id="px-add-form-wrap" class="${showAddForm ? "" : "hidden"}" aria-live="polite">
          ${renderAddForm()}
        </div>
      </div>

      <!-- ── Bottom back button ───────────────────────────────────────────── -->
      <div style="margin-top: var(--space-6); margin-bottom: var(--space-4);">
        <button class="btn btn-ghost btn-full" id="prescribed-back-bottom"
                aria-label="Back to choices">
          Back to choices
        </button>
      </div>

    </div>
  `;
}

// ── Empty state ───────────────────────────────────────────────────────────────

function renderEmptyState() {
  return `
    <div class="card prescribed-empty-card" role="note">
      <p class="text-secondary">
        No prescribed exercises added yet. Use the button below to add the
        exercises your physio or consultant has given you.
      </p>
    </div>
  `;
}

// ── Exercise list ─────────────────────────────────────────────────────────────

function renderExerciseList(active, done, creditsAvail) {
  return `
    <div class="prescribed-list-section">

      ${active.length > 0 ? `
        <div class="prescribed-list-header">
          <h2 class="section-heading">To do today</h2>
          ${creditsAvail > 0
            ? `<span class="prescribed-credits-badge" aria-label="Up to ${creditsAvail} credits available">
                Up to +${creditsAvail} &#11088;
               </span>`
            : ""}
        </div>

        <ul class="prescribed-exercise-list" aria-label="Prescribed exercises to do today">
          ${active.map((ex, i) => renderExerciseCard(ex, i, false)).join("")}
        </ul>

        <button class="btn btn-primary btn-large btn-full" id="px-start-session-btn"
                style="margin-top: var(--space-4);"
                aria-label="Start prescribed exercise session">
          Start Session
        </button>
      ` : `
        <div class="card" role="note" style="margin-bottom: var(--space-4);">
          <p class="text-secondary">All prescribed exercises done for today.</p>
        </div>
      `}

      ${done.length > 0 ? `
        <h2 class="section-heading" style="margin-top: var(--space-6);">Completed today</h2>
        <ul class="prescribed-exercise-list prescribed-exercise-list--done"
            aria-label="Completed prescribed exercises">
          ${done.map((ex, i) => renderExerciseCard(ex, i, true)).join("")}
        </ul>
      ` : ""}

    </div>
  `;
}

/**
 * Render a single prescribed exercise card.
 * Shows: name, sets x reps/hold, notes from physio, prescribed-by,
 * weekly completion count (how many times done this week).
 *
 * @param {object}  ex       - prescribed exercise object from store
 * @param {number}  index    - position in list (for aria labels)
 * @param {boolean} isDone   - whether completed today
 */
function renderExerciseCard(ex, index, isDone) {
  const weeklyCount = getWeeklyCompletionCount(ex.id);
  const prescriptionStr = formatPrescription(ex);

  return `
    <li class="prescribed-exercise-card ${isDone ? "prescribed-exercise-card--done" : ""}"
        aria-label="${ex.name}${isDone ? ", completed" : ""}">

      <div class="prescribed-exercise-top">
        <div class="prescribed-exercise-name-wrap">
          ${isDone
            ? `<span class="prescribed-done-tick" aria-hidden="true">&#10003;</span>`
            : ""}
          <span class="prescribed-exercise-name">${ex.name}</span>
        </div>
        ${!isDone ? `
          <button class="btn btn-ghost btn-xs prescribed-remove-btn"
                  data-exercise-id="${ex.id}"
                  aria-label="Remove ${ex.name} from prescribed exercises">
            Remove
          </button>
        ` : ""}
      </div>

      ${prescriptionStr ? `
        <p class="prescribed-exercise-prescription text-sm text-muted">
          ${prescriptionStr}
        </p>
      ` : ""}

      ${ex.notes ? `
        <div class="prescribed-exercise-notes">
          <span class="prescribed-notes-label text-sm">Physio notes:</span>
          <p class="text-sm">${ex.notes}</p>
        </div>
      ` : ""}

      ${ex.prescribedBy ? `
        <p class="prescribed-by text-sm text-muted">Prescribed by: ${ex.prescribedBy}</p>
      ` : ""}

      <div class="prescribed-exercise-history text-sm text-muted"
           aria-label="Completed ${weeklyCount} time${weeklyCount === 1 ? "" : "s"} this week">
        This week: ${renderWeekDots(weeklyCount)}
        <span class="sr-only">${weeklyCount} session${weeklyCount === 1 ? "" : "s"} completed this week</span>
      </div>

    </li>
  `;
}

/**
 * Format the sets/reps prescription as a readable string.
 * Handles: sets x reps, hold time, sets only, reps only.
 */
function formatPrescription(ex) {
  const parts = [];
  if (ex.sets) parts.push(ex.sets + " sets");
  if (ex.reps) parts.push(ex.reps);
  return parts.join(" x ");
}

/**
 * Render small dot indicators for weekly completion.
 * 7 dots, filled for each session completed this week.
 * Max 7 displayed regardless of actual count.
 */
function renderWeekDots(count) {
  const max   = 7;
  const dots  = [];
  for (let i = 0; i < max; i++) {
    dots.push(
      `<span class="week-dot ${i < count ? "week-dot--filled" : ""}" aria-hidden="true"></span>`
    );
  }
  return `<span class="week-dots" aria-hidden="true">${dots.join("")}</span>`;
}

/**
 * Count how many times a prescribed exercise has been completed this week.
 * Reads from activityLog entries where type === "prescribed-session"
 * and the date falls within the current ISO week (Mon-Sun).
 *
 * Note: prescribed-session.js marks individual exercises completedToday
 * but does not write per-exercise history to activityLog yet.
 * Until Phase 4 adds that, we count workout-complete navigations from
 * prescribed sessions using lastWorkoutName in store.
 *
 * For now: count days this week where completedToday was true for this exercise.
 * This is approximated from the prescribedExercises completedAt timestamps.
 */
function getWeeklyCompletionCount(exerciseId) {
  const exercises = store.get("prescribedExercises") || [];
  const ex = exercises.find(e => e.id === exerciseId);
  if (!ex?.completedAt) return 0;

  // Count unique calendar days this week that have a completedAt for this exercise.
  // completedAt is a single ISO timestamp (last completion).
  // Phase 4 will extend this to a full history array per exercise.
  const completed = new Date(ex.completedAt);
  const now       = new Date();
  const weekStart = getWeekStart(now);

  if (completed >= weekStart) return 1;
  return 0;
}

function getWeekStart(date) {
  const d   = new Date(date);
  const day = d.getDay();
  // ISO week: Monday = start
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Add form ──────────────────────────────────────────────────────────────────

function renderAddForm() {
  return `
    <form id="px-add-form" class="prescribed-add-form" novalidate
          aria-label="Add prescribed exercise">

      <div class="form-field" style="margin-top: var(--space-4);">
        <label class="form-label" for="px-name">
          Exercise name <span class="form-required" aria-hidden="true">*</span>
        </label>
        <input
          type="text"
          id="px-name"
          class="form-input"
          placeholder="e.g. Calf raises, Single leg deadlift"
          required
          aria-required="true"
          autocomplete="off"
        >
      </div>

      <div class="form-row">
        <div class="form-field form-field-half">
          <label class="form-label" for="px-sets">Sets</label>
          <input
            type="number"
            id="px-sets"
            class="form-input"
            placeholder="3"
            min="1"
            max="20"
            inputmode="numeric"
          >
        </div>
        <div class="form-field form-field-half">
          <label class="form-label" for="px-reps">Reps or hold time</label>
          <input
            type="text"
            id="px-reps"
            class="form-input"
            placeholder="10 or 30s or 2 min"
            autocomplete="off"
          >
        </div>
      </div>

      <div class="form-field">
        <label class="form-label" for="px-notes">Notes from your physio</label>
        <textarea
          id="px-notes"
          class="form-input form-textarea"
          rows="2"
          placeholder="Instructions, what to watch for, how it should feel..."
        ></textarea>
      </div>

      <div class="form-field">
        <label class="form-label" for="px-prescribed-by">Prescribed by</label>
        <input
          type="text"
          id="px-prescribed-by"
          class="form-input"
          placeholder="e.g. Sarah at PhysioPlus, Mr Jones (consultant)"
          autocomplete="off"
        >
      </div>

      <p class="form-required-note text-sm text-muted">
        <span aria-hidden="true">*</span> Required
      </p>

      <div class="prescribed-form-actions">
        <button type="submit" class="btn btn-primary btn-full">
          Add Exercise
        </button>
      </div>

    </form>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // ── Auto-open form from checkin shortcut ───────────────────────────────────
  // checkin.js shortcut sets this flag. Consume once then clear.
  const shouldAutoOpen = store.get("openPrescribedForm");
  if (shouldAutoOpen) {
    store.set("openPrescribedForm", false);
    showAddForm = true;
    rerender();
    return; // rerender calls onMount again
  }

  // ── Back buttons ──────────────────────────────────────────────────────────
  document.getElementById("prescribed-back-top")?.addEventListener("click", () => {
    router.navigate("intention");
  });
  document.getElementById("prescribed-back-bottom")?.addEventListener("click", () => {
    router.navigate("intention");
  });

  // ── Start session ─────────────────────────────────────────────────────────
  document.getElementById("px-start-session-btn")?.addEventListener("click", () => {
    router.navigate("prescribed-session");
  });

  // ── Toggle add form ───────────────────────────────────────────────────────
  document.getElementById("px-toggle-form-btn")?.addEventListener("click", () => {
    showAddForm = !showAddForm;
    rerender();
  });

  // ── Form submission ───────────────────────────────────────────────────────
  document.getElementById("px-add-form")?.addEventListener("submit", e => {
    e.preventDefault();
    saveExercise();
  });

  // ── Remove exercise ───────────────────────────────────────────────────────
  document.querySelectorAll(".prescribed-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.exerciseId;
      if (!id) return;
      removeExercise(id);
    });
  });
}

// ── Actions ───────────────────────────────────────────────────────────────────

function saveExercise() {
  const nameEl         = document.getElementById("px-name");
  const setsEl         = document.getElementById("px-sets");
  const repsEl         = document.getElementById("px-reps");
  const notesEl        = document.getElementById("px-notes");
  const prescribedByEl = document.getElementById("px-prescribed-by");

  const name = nameEl?.value?.trim();
  if (!name) {
    nameEl?.setCustomValidity("Please enter an exercise name.");
    nameEl?.reportValidity();
    return;
  }
  if (nameEl) nameEl.setCustomValidity("");

  const sets        = setsEl?.value        ? parseInt(setsEl.value)         : null;
  const reps        = repsEl?.value?.trim()         || null;
  const notes       = notesEl?.value?.trim()        || null;
  const prescribedBy = prescribedByEl?.value?.trim() || null;

  const exercise = {
    id:             "px-" + Date.now(),
    exerciseId:     null,
    name,
    description:    "",
    frequency:      "",
    active:         true,
    completedToday: false,
    completedAt:    null,
    prescribedAt:   new Date().toISOString(),
    ...(sets         !== null ? { sets }         : {}),
    ...(reps         !== null ? { reps }         : {}),
    ...(notes        !== null ? { notes }        : {}),
    ...(prescribedBy !== null ? { prescribedBy } : {})
  };

  const existing = store.get("prescribedExercises") || [];
  store.set("prescribedExercises", [...existing, exercise]);

  showAddForm = false;
  rerender();
}

/**
 * Remove a prescribed exercise after confirmation.
 * Health data — always confirms before deleting.
 */
function removeExercise(id) {
  const exercises = store.get("prescribedExercises") || [];
  const ex = exercises.find(e => e.id === id);
  if (!ex) return;

  if (!confirm("Remove \"" + ex.name + "\" from your prescribed exercises?")) return;

  store.set("prescribedExercises", exercises.filter(e => e.id !== id));
  rerender();
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}
