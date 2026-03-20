/**
 * workout.js - Workout Execution View
 * Displays exercises one by one with timer/counter
 *
 * v1.2 — Exercise exit routes (mild pain zones):
 *   When any body zone is Mild (pain 1-3), an inline nudge appears below
 *   each exercise card: "Not feeling this? You can skip it -- that is a
 *   valid choice." A secondary skip button is already present; this gives
 *   it a coach framing so the user understands skipping is not failure.
 *   Shown when any zone is Mild or Moderate -- Severe users should not be
 *   in a workout (generator upstream handles that). The Today view moderate
 *   banner explains the pool reduction; this nudge gives them permission to
 *   skip individual exercises once inside the workout.
 *   getZoneStatus() is called once at render time and passed through.
 *
 * v1.1 — Difficulty feedback prompt after main/finisher exercises.
 *
 * Changes (t2_5 / t2_7):
 *   - Import programmeEngine
 *   - completeWorkout() calls programmeEngine.recordSession(workout.focus)
 *   - Resulting milestone (or null) stored as 'lastMilestone' for workout-complete.js
 */

import { store } from '../store.js';
import { checkinData } from '../data/checkin.js';
import { programmeEngine } from '../data/programmeEngine.js';
import { getZoneStatus } from '../data/conditions.js';

export const centered = false;

let currentExerciseIndex = 0;
let timerInterval = null;
let timeRemaining = 0;
let timerStarted = false; // Timer doesn't start until user taps Start

export function render() {
  const workout = store.get('activeWorkout');

  if (!workout) {
    return renderNoWorkout();
  }

  const exercise = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;
  const progress = ((currentExerciseIndex) / workout.exercises.length) * 100;

  // Compute mild zone status once per render -- used for exit route nudges
  const conditions = store.get('conditions') || [];
  const painScores = store.get('conditionPainScores') || {};
  const zoneStatus = getZoneStatus(conditions, painScores);
  // Show exit route nudge for mild OR moderate zones.
  // Severe users should not be in a workout -- generator handles that upstream.
  const hasMildZone = Object.entries(zoneStatus).some(
    ([key, val]) => key !== 'combinedSevere' && (val === 'mild' || val === 'moderate')
  );

  return `
    <div class="view workout-view">
      <!-- Header with progress -->
      <div class="workout-header">
        <button class="btn btn-ghost" id="exit-workout-btn" aria-label="Exit workout">x Exit</button>
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
          <span class="meta-tag">+${exercise.credits} &#11088;</span>
        </div>

        <!-- Timer or Reps display -->
        <div class="exercise-target">
          ${renderExerciseTarget(exercise)}
        </div>

        <!-- Why this exercise — shown before instructions so rationale lands first -->
        ${exercise.why ? `
          <div class="exercise-why">
            <h3>Why this exercise?</h3>
            <p>${exercise.why}</p>
          </div>
        ` : ''}

        <!-- Exit route nudge -- shown early so user can bail before reading instructions -->
        ${hasMildZone ? renderExitRouteNudge() : ''}

        <!-- Instructions -->
        <div class="exercise-instructions card">
          <h3>How to do it</h3>
          <ol class="instruction-list">
            ${exercise.instructions.map(inst => `<li>${inst}</li>`).join('')}
          </ol>

          ${exercise.coaching ? `
            <div class="coaching-tip">
              <span class="tip-icon" aria-hidden="true">&#128161;</span>
              <p>${exercise.coaching}</p>
            </div>
          ` : ''}
        </div>

        <!-- YouTube Demo Link — supplementary reference, below instructions -->
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' exercise form')}"
           target="_blank"
           rel="noopener noreferrer"
           class="youtube-link"
           aria-label="Watch how to do ${exercise.name} on YouTube (opens in new tab)">
          <span class="youtube-icon" aria-hidden="true">&#9654;&#65039;</span>
          Watch how to do this
        </a>
      </div>

      <!-- Action buttons -->
      <div class="workout-actions">
        ${exercise.duration ? `
          <button class="btn btn-large btn-full ${timerStarted ? 'btn-secondary' : 'btn-accent'}" id="timer-toggle-btn" aria-live="polite">
            ${!timerStarted ? '&#9654; Start Timer' : (timerInterval ? '&#9646;&#9646; Pause' : '&#9654; Resume')}
          </button>
        ` : ''}

        <button class="btn btn-primary btn-large btn-full" id="complete-exercise-btn">
          ${isLastExercise ? '&#127881; Complete Workout' : 'Next Exercise &rarr;'}
        </button>

        <button class="btn btn-ghost btn-small" id="skip-exercise-btn">
          Skip this one
        </button>
      </div>
    </div>
  `;
}

/**
 * Render an inline exit route nudge when a mild pain zone is active.
 * Graeme's framing: have a go and see how you get on; if we need to adapt,
 * here are some options. Skipping is always valid -- this gives it a coach
 * voice so the user understands it is not failure.
 * Shown for mild zones only (pain 1-3). Moderate and severe zones have
 * their own messaging on the Today view before the workout starts.
 */
function renderExitRouteNudge() {
  return `
    <div class="exit-route-nudge" role="note" aria-label="Option to adapt this exercise">
      <div class="exit-route-nudge-body">
        <p class="exit-route-nudge-text">
          <strong>Not feeling this one?</strong>
          Have a go and see how it feels -- but if it does not feel right,
          skipping it is a completely valid choice. Use the button below.
        </p>
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

  if (currentExerciseIndex >= workout.exercises.length - 1) {
    completeWorkout();
  } else {
    currentExerciseIndex++;
    resetTimer();
    router.navigate('workout');
  }
}

function skipExercise() {
  const workout = store.get('activeWorkout');

  if (currentExerciseIndex >= workout.exercises.length - 1) {
    completeWorkout();
  } else {
    currentExerciseIndex++;
    resetTimer();
    router.navigate('workout');
  }
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
  store.set('activeWorkout',   null);
  store.set('workoutProgress', null);
}
