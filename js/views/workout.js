/**
 * workout.js - Workout Execution View
 * Displays exercises one by one with timer/counter
 *
 * v1.1 — Difficulty feedback (Gap 2):
 *   After completing a main or finisher exercise, a brief feedback prompt
 *   appears: "Too hard / About right / Too easy".
 *   Tapping any option writes to store.exerciseFeedback and advances.
 *   Warmup, cooldown, and accessory exercises are skipped (not difficulty-graded).
 *   The prompt is non-blocking — users can dismiss with "Skip" with no penalty.
 *
 * Changes (t2_5 / t2_7):
 *   - Import programmeEngine
 *   - completeWorkout() calls programmeEngine.recordSession(workout.focus)
 *   - Resulting milestone (or null) stored as 'lastMilestone' for workout-complete.js
 */

import { store } from '../store.js';
import { checkinData } from '../data/checkin.js';
import { programmeEngine } from '../data/programmeEngine.js';

export const centered = false;

let currentExerciseIndex = 0;
let timerInterval = null;
let timeRemaining = 0;
let timerStarted = false;
let showingFeedback = false; // true when feedback prompt is visible

export function render() {
  const workout = store.get('activeWorkout');

  if (!workout) {
    return renderNoWorkout();
  }

  const exercise = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;
  const progress = ((currentExerciseIndex) / workout.exercises.length) * 100;

  // ── Feedback prompt ───────────────────────────────────────────────────────
  // Shown after a main or finisher exercise is completed — before advancing.
  // Role check ensures we only ask about difficulty-graded exercises.
  if (showingFeedback) {
    const feedbackExercise = workout.exercises[currentExerciseIndex];
    return `
      <div class="view workout-view">
        <div class="workout-header">
          <button class="btn btn-ghost" id="exit-workout-btn" aria-label="Exit workout">✕ Exit</button>
          <div class="workout-progress-info" aria-label="Exercise ${currentExerciseIndex + 1} of ${workout.exercises.length}">
            <span>${currentExerciseIndex + 1} of ${workout.exercises.length}</span>
          </div>
        </div>
        <div class="workout-progress-bar" role="progressbar" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100" aria-label="Workout progress">
          <div class="workout-progress-fill" style="width: ${progress}%"></div>
        </div>

        <div class="feedback-prompt">
          <div class="card card-coach">
            <h2 class="feedback-title">How did that feel?</h2>
            <p class="feedback-subtitle">${feedbackExercise.name}</p>
            <p class="feedback-help">Your feedback helps me adapt future workouts for you.</p>
          </div>

          <div class="feedback-actions" role="group" aria-label="Difficulty feedback for ${feedbackExercise.name}">
            <button class="btn btn-feedback btn-feedback-hard" id="feedback-too-hard-btn" aria-label="Too hard — I struggled with this exercise">
              😅 Too hard
            </button>
            <button class="btn btn-feedback btn-feedback-right" id="feedback-about-right-btn" aria-label="About right — this exercise felt appropriate">
              ✓ About right
            </button>
            <button class="btn btn-feedback btn-feedback-easy" id="feedback-too-easy-btn" aria-label="Too easy — I want more challenge">
              💪 Too easy
            </button>
          </div>

          <button class="btn btn-ghost btn-small feedback-skip" id="feedback-skip-btn" aria-label="Skip feedback and continue">
            Skip
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="view workout-view">
      <!-- Header with progress -->
      <div class="workout-header">
        <button class="btn btn-ghost" id="exit-workout-btn" aria-label="Exit workout">✕ Exit</button>
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
          ${exercise.perSide ? '<span class="meta-tag">Each side</span>' : ''}
          <span class="meta-tag">${exercise.category}</span>
          <span class="meta-tag">+${exercise.credits} ⭐</span>
        </div>

        <!-- Timer or Reps display -->
        <div class="exercise-target">
          ${renderExerciseTarget(exercise)}
        </div>

        <!-- YouTube Demo Link -->
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' exercise form')}"
           target="_blank"
           rel="noopener noreferrer"
           class="youtube-link"
           aria-label="Watch how to do ${exercise.name} on YouTube (opens in new tab)">
          <span class="youtube-icon" aria-hidden="true">▶️</span>
          Watch how to do this
        </a>

        <!-- Instructions -->
        <div class="exercise-instructions card">
          <h3>How to do it</h3>
          <ol class="instruction-list">
            ${exercise.instructions.map(inst => `<li>${inst}</li>`).join('')}
          </ol>

          ${exercise.coaching ? `
            <div class="coaching-tip">
              <span class="tip-icon" aria-hidden="true">💡</span>
              <p>${exercise.coaching}</p>
            </div>
          ` : ''}
        </div>

        <!-- Why this exercise -->
        ${exercise.why ? `
          <div class="exercise-why">
            <h3>Why this exercise?</h3>
            <p>${exercise.why}</p>
          </div>
        ` : ''}
      </div>

      <!-- Action buttons -->
      <div class="workout-actions">
        ${exercise.duration ? `
          <button class="btn btn-large btn-full ${timerStarted ? 'btn-secondary' : 'btn-accent'}" id="timer-toggle-btn" aria-live="polite">
            ${!timerStarted ? '▶ Start Timer' : (timerInterval ? '⏸ Pause' : '▶ Resume')}
          </button>
        ` : ''}

        <button class="btn btn-primary btn-large btn-full" id="complete-exercise-btn">
          ${isLastExercise ? '🎉 Complete Workout' : 'Next Exercise →'}
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
        <p>Go back to Today and choose a workout option.</p>
        <button class="btn btn-primary" onclick="router.navigate('today')">
          Back to Today
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
          <span class="timer-label">${sets > 1 ? `Set 1 of ${sets}` : 'Hold'}</span>
        </div>
      </div>
    `;
  } else if (exercise.reps) {
    const sets = exercise.sets || 3;
    const reps = exercise.reps || 10;
    return `
      <div class="reps-display">
        <div class="reps-info">
          <span class="reps-value">${sets} × ${reps}</span>
          <span class="reps-label">sets × reps</span>
        </div>
        ${exercise.rest ? `
          <div class="rest-info">
            <span class="rest-value">${exercise.rest}s</span>
            <span class="rest-label">rest between sets</span>
          </div>
        ` : ''}
      </div>
    `;
  }
  return '<p>Complete this exercise at your own pace.</p>';
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatRole(role) {
  const roles = {
    warmup:   '🔥 Warm Up',
    main:     '💪 Main',
    accessory:'🎯 Accessory',
    finisher: '🏁 Finisher',
    cooldown: '🧘 Cool Down'
  };
  return roles[role] || role;
}

export function onMount() {
  const workout = store.get('activeWorkout');
  if (!workout) return;

  const exercise = workout.exercises[currentExerciseIndex];

  if (exercise.duration) {
    timeRemaining = exercise.duration;
    updateTimerDisplay();
  }

  // Exit button
  document.getElementById('exit-workout-btn')?.addEventListener('click', () => {
    if (confirm('Exit workout? Your progress on this workout will be lost.')) {
      cleanupWorkout();
      router.navigate('today');
    }
  });

  // Timer toggle
  document.getElementById('timer-toggle-btn')?.addEventListener('click', () => {
    if (!timerStarted) {
      timerStarted = true;
      startTimer();
    } else if (timerInterval) {
      pauseTimer();
    } else {
      startTimer();
    }
    router.navigate('workout');
  });

  // Complete exercise
  document.getElementById('complete-exercise-btn')?.addEventListener('click', () => {
    completeExercise();
  });

  // Skip exercise
  document.getElementById('skip-exercise-btn')?.addEventListener('click', () => {
    skipExercise();
  });

  // ── Gap 2: Feedback button listeners ─────────────────────────────────────
  // These buttons only exist in the DOM when showingFeedback is true.
  document.getElementById('feedback-too-hard-btn')?.addEventListener('click', () => {
    submitFeedback("too-hard");
  });
  document.getElementById('feedback-about-right-btn')?.addEventListener('click', () => {
    submitFeedback(null); // "About right" — no store entry needed
  });
  document.getElementById('feedback-too-easy-btn')?.addEventListener('click', () => {
    submitFeedback("too-easy");
  });
  document.getElementById('feedback-skip-btn')?.addEventListener('click', () => {
    submitFeedback(null);
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
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
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
  const display = document.getElementById('timer-display');
  if (display) display.textContent = formatTime(timeRemaining);
}

function completeExercise() {
  const workout = store.get('activeWorkout');
  const exercise = workout.exercises[currentExerciseIndex];

  const completed = store.get('workoutProgress') || [];
  completed.push({
    exerciseId:  exercise.id,
    credits:     exercise.credits,
    completedAt: new Date().toISOString()
  });
  store.set('workoutProgress', completed);

  // ── Gap 2: Show feedback prompt for main and finisher exercises ───────────
  // Warmup, cooldown, and accessory exercises are not difficulty-graded —
  // asking "was that too hard?" after a warmup would confuse users.
  const feedbackRoles = ["main", "finisher"];
  if (feedbackRoles.includes(exercise.role)) {
    showingFeedback = true;
    router.navigate('workout');
    return;
  }

  advanceExercise(workout);
}

/**
 * Write feedback to store and advance to the next exercise.
 * Called by feedback button handlers and the skip button.
 *
 * @param {"too-hard"|"too-easy"|null} feedback — null means user skipped
 */
function submitFeedback(feedback) {
  const workout = store.get('activeWorkout');
  const exercise = workout.exercises[currentExerciseIndex];

  if (feedback) {
    store.addExerciseFeedback(exercise.id, feedback);
  }

  showingFeedback = false;
  advanceExercise(workout);
}

function advanceExercise(workout) {
  if (currentExerciseIndex >= workout.exercises.length - 1) {
    completeWorkout();
  } else {
    currentExerciseIndex++;
    resetTimer();
    router.navigate('workout');
  }
}

function skipExercise() {
  showingFeedback = false;
  const workout = store.get('activeWorkout');
  advanceExercise(workout);
}

function resetTimer() {
  pauseTimer();
  timeRemaining = 0;
  timerStarted  = false;
}

function completeWorkout() {
  const workout  = store.get('activeWorkout');
  const progress = store.get('workoutProgress') || [];

  // Credits
  const creditsEarned = progress.reduce((sum, e) => sum + (e.credits || 0), 0);
  const totalCredits  = (store.get('totalCredits') || 0) + creditsEarned;
  store.set('totalCredits', totalCredits);

  // Workout history
  const history = store.get('workoutHistory') || [];
  history.push({
    workoutId:          workout.id,
    name:               workout.name,
    focus:              workout.focus,
    completedAt:        new Date().toISOString(),
    exercisesCompleted: progress.length,
    totalExercises:     workout.exercises.length,
    creditsEarned
  });
  store.set('workoutHistory', history);

  // ── t2_5: Record session with programme engine ──────────────────────────
  // recordSession returns a milestone object if one was just earned, or null.
  const milestone = programmeEngine.recordSession(workout.focus || null);
  store.set('lastMilestone', milestone || null);
  // ────────────────────────────────────────────────────────────────────────

  // Stash data for the completion screen
  store.set('lastWorkoutCredits', creditsEarned);
  store.set('lastWorkoutName',    workout.name);

  cleanupWorkout();
  router.navigate('workout-complete');
}

function cleanupWorkout() {
  pauseTimer();
  currentExerciseIndex = 0;
  timeRemaining = 0;
  timerStarted  = false;
  showingFeedback = false;
  store.set('activeWorkout',   null);
  store.set('workoutProgress', null);
}
