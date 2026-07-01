/**
 * workout.js - Workout Execution View
 * 01 Jul 2026 v2
 *
 * v2 — Fixed programmeEngine import (01 Jul 2026).
 *   programmeEngine.js v2 refactored to individual named exports
 *   (recordSession, getPhaseBias, etc.) — the namespace import
 *   { programmeEngine } was never updated to match, causing a hard
 *   SyntaxError on module load. Fixed:
 *     import { recordSession } from "../data/programmeEngine.js"
 *   Call site corrected: recordSession takes a sessionData object,
 *   returns { milestoneAchieved }. Store.set("lastMilestone") now
 *   receives result.milestoneAchieved rather than the whole result object.
 *
 * v1 — 12 Jun 2026 (S4-4 P3):
 *   Back button uses router.back(). completeWorkout() routes to "reflect".
 *   renderNoWorkout() fallback uses event listener. Double-quoted strings.
 *   Import programmeEngine, call recordSession on completion (t2_5/t2_7).
 */

import { store }         from "../store.js";
import { checkinData }   from "../data/checkin.js";
import { recordSession } from "../data/programmeEngine.js";

export const centered = false;

let currentExerciseIndex = 0;
let timerInterval = null;
let timeRemaining = 0;
let timerStarted = false; // Timer doesn't start until user taps Start

export function render() {
  const workout = store.get("activeWorkout");

  if (!workout) {
    return renderNoWorkout();
  }

  const exercise = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;
  const progress = ((currentExerciseIndex) / workout.exercises.length) * 100;

  return `
    <div class="view workout-view">
      <!-- Header with progress -->
      <div class="workout-header">
        <button class="btn btn-ghost" id="exit-workout-btn" aria-label="Exit workout">\u2715 Exit</button>
        <div class="workout-progress-info" aria-label="Exercise ${currentExerciseIndex + 1} of ${workout.exercises.length}">
          <span>${currentExerciseIndex + 1} of ${workout.exercises.length}</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="workout-progress-bar" role="progressbar" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100" aria-label="Workout progress">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>

      <!-- Exercise display -->
      <div class="exercise-display">
        <div class="exercise-role-badge ${exercise.role}" aria-label="Exercise type: ${formatRole(exercise.role)}">${formatRole(exercise.role)}</div>

        <h1 class="exercise-name">${exercise.name}</h1>

        <div class="exercise-meta">
          ${exercise.perSide ? "<span class=\"meta-tag\">Each side</span>" : ""}
          <span class="meta-tag">${exercise.category}</span>
          <span class="meta-tag">+${exercise.credits} \u2B50</span>
        </div>

        <!-- Timer or Reps display -->
        <div class="exercise-target">
          ${renderExerciseTarget(exercise)}
        </div>

        <!-- YouTube Demo Link -->
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " exercise form")}"
           target="_blank"
           rel="noopener noreferrer"
           class="youtube-link"
           aria-label="Watch how to do ${exercise.name} on YouTube (opens in new tab)">
          <span class="youtube-icon" aria-hidden="true">\u25B6\uFE0F</span>
          Watch how to do this
        </a>

        <!-- Exercise card - universal three-section structure -->
        <div class="exercise-instructions card" role="region" aria-label="Exercise guidance for ${exercise.name}">

          <!-- Section 1: How to get there -->
          ${exercise.instructions && exercise.instructions.length > 0 ? `
            <span class="exercise-section-label" id="section-setup-${currentExerciseIndex}">
              How to get there
            </span>
            <ul class="exercise-section-list" aria-labelledby="section-setup-${currentExerciseIndex}">
              ${exercise.instructions.map(inst => `<li>${inst}</li>`).join("")}
            </ul>
          ` : ""}

          <!-- Section 2: What to focus on -->
          ${exercise.coaching ? `
            <hr class="exercise-section-divider" aria-hidden="true">
            <span class="exercise-section-label" id="section-focus-${currentExerciseIndex}">
              What to focus on
            </span>
            <div class="coaching-tip" aria-labelledby="section-focus-${currentExerciseIndex}">
              <span class="tip-icon" aria-hidden="true">\uD83D\uDCA1</span>
              <p>${exercise.coaching}</p>
            </div>
          ` : ""}

          <!-- Section 3: Why this helps -->
          ${exercise.why ? `
            <hr class="exercise-section-divider" aria-hidden="true">
            <span class="exercise-section-label" id="section-why-${currentExerciseIndex}">
              Why this helps
            </span>
            <p class="exercise-why-text" aria-labelledby="section-why-${currentExerciseIndex}">
              ${exercise.why}
            </p>
          ` : ""}

        </div>
      </div>

      <!-- Action buttons -->
      <div class="workout-actions">
        ${exercise.duration ? `
          <button class="btn btn-large btn-full ${timerStarted ? "btn-secondary" : "btn-accent"}" id="timer-toggle-btn" aria-live="polite">
            ${!timerStarted ? "\u25B6 Start Timer" : (timerInterval ? "\u23F8 Pause" : "\u25B6 Resume")}
          </button>
        ` : ""}

        <button class="btn btn-primary btn-large btn-full" id="complete-exercise-btn">
          ${isLastExercise ? "\uD83C\uDF89 Complete Workout" : "Next Exercise \u2192"}
        </button>

        <button class="btn btn-ghost btn-small" id="skip-exercise-btn">
          Skip this one
        </button>
      </div>
    </div>
  `;
}

function renderNoWorkout() {
  return `
    <div class="view">
      <div class="card card-coach">
        <h2>No workout selected</h2>
        <p>Go back to choose a workout option.</p>
        <button class="btn btn-primary" id="no-workout-back-btn">
          Back
        </button>
      </div>
    </div>
  `;
}

function renderExerciseTarget(exercise) {
  if (exercise.duration) {
    const sets = exercise.sets || 1;
    return `
      <div class="timer-display">
        <div class="timer-circle">
          <span class="timer-value" id="timer-display">${formatTime(timeRemaining || exercise.duration)}</span>
          <span class="timer-label">${sets > 1 ? `Set 1 of ${sets}` : "Hold"}</span>
        </div>
      </div>
    `;
  } else if (exercise.reps) {
    const sets = exercise.sets || 3;
    const reps = exercise.reps || 10;
    return `
      <div class="reps-display">
        <div class="reps-info">
          <span class="reps-value">${sets} \u00D7 ${reps}</span>
          <span class="reps-label">sets \u00D7 reps</span>
        </div>
        ${exercise.rest ? `
          <div class="rest-info">
            <span class="rest-value">${exercise.rest}s</span>
            <span class="rest-label">rest between sets</span>
          </div>
        ` : ""}
      </div>
    `;
  }
  return "<p>Complete this exercise at your own pace.</p>";
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatRole(role) {
  const roles = {
    warmup:    "\uD83D\uDD25 Warm Up",
    main:      "\uD83D\uDCAA Main",
    accessory: "\uD83C\uDFAF Accessory",
    finisher:  "\uD83C\uDFC1 Finisher",
    cooldown:  "\uD83E\uDDD8 Cool Down"
  };
  return roles[role] || role;
}

export function onMount() {
  const workout = store.get("activeWorkout");

  document.getElementById("no-workout-back-btn")?.addEventListener("click", () => {
    router.back();
  });

  if (!workout) return;

  const exercise = workout.exercises[currentExerciseIndex];

  if (exercise.duration) {
    timeRemaining = exercise.duration;
    updateTimerDisplay();
  }

  document.getElementById("exit-workout-btn")?.addEventListener("click", () => {
    if (confirm("Exit workout? Your progress on this workout will be lost.")) {
      cleanupWorkout();
      router.back();
    }
  });

  document.getElementById("timer-toggle-btn")?.addEventListener("click", () => {
    if (!timerStarted) {
      timerStarted = true;
      startTimer();
    } else if (timerInterval) {
      pauseTimer();
    } else {
      startTimer();
    }
    router.navigate("workout");
  });

  document.getElementById("complete-exercise-btn")?.addEventListener("click", () => {
    completeExercise();
  });

  document.getElementById("skip-exercise-btn")?.addEventListener("click", () => {
    skipExercise();
  });
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
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
  const display = document.getElementById("timer-display");
  if (display) display.textContent = formatTime(timeRemaining);
}

function completeExercise() {
  const workout = store.get("activeWorkout");
  const exercise = workout.exercises[currentExerciseIndex];

  const completed = store.get("workoutProgress") || [];
  completed.push({
    exerciseId:  exercise.id,
    credits:     exercise.credits,
    completedAt: new Date().toISOString()
  });
  store.set("workoutProgress", completed);

  if (currentExerciseIndex >= workout.exercises.length - 1) {
    completeWorkout();
  } else {
    currentExerciseIndex++;
    resetTimer();
    router.navigate("workout");
  }
}

function skipExercise() {
  const workout = store.get("activeWorkout");

  if (currentExerciseIndex >= workout.exercises.length - 1) {
    completeWorkout();
  } else {
    currentExerciseIndex++;
    resetTimer();
    router.navigate("workout");
  }
}

function resetTimer() {
  pauseTimer();
  timeRemaining = 0;
  timerStarted  = false;
}

function completeWorkout() {
  const workout  = store.get("activeWorkout");
  const progress = store.get("workoutProgress") || [];

  // Credits
  const creditsEarned = progress.reduce((sum, e) => sum + (e.credits || 0), 0);
  const totalCredits  = (store.get("totalCredits") || 0) + creditsEarned;
  store.set("totalCredits", totalCredits);

  // Workout history
  const history = store.get("workoutHistory") || [];
  history.push({
    workoutId:          workout.id,
    name:               workout.name,
    focus:              workout.focus,
    completedAt:        new Date().toISOString(),
    exercisesCompleted: progress.length,
    totalExercises:     workout.exercises.length,
    creditsEarned
  });
  store.set("workoutHistory", history);

  // Record session with programme engine.
  // recordSession() takes a sessionData object and returns { milestoneAchieved }.
  // v1 passed workout.focus directly as the argument (wrong) and imported
  // a non-existent namespace object — both fixed here.
  const result    = recordSession({ focus: workout.focus || null });
  const milestone = result.milestoneAchieved || null;
  store.set("lastMilestone", milestone);

  // Stash data for the completion screen / reflection step
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    workout.name);

  cleanupWorkout();
  // Route through reflect.js for post-session reflection.
  router.navigate("reflect");
}

function cleanupWorkout() {
  pauseTimer();
  currentExerciseIndex = 0;
  timeRemaining = 0;
  timerStarted  = false;
  store.set("activeWorkout",   null);
  store.set("workoutProgress", null);
}
