/**
 * workout.js - Workout Execution View
 * Displays exercises one by one with timer/counter
 *
 * Changes (t2_5):
 *   - Imports programmeEngine
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

export function render() {
  const workout = store.get('activeWorkout');

  if (!workout) {
    return renderNoWorkout();
  }

  const exercise = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;
  const progress = (currentExerciseIndex / workout.exercises.length) * 100;

  return `
    <div class="view workout-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="exit-workout-btn" aria-label="Exit workout">✕ Exit</button>
        <div class="workout-progress-info">
          <span aria-label="Exercise ${currentExerciseIndex + 1} of ${workout.exercises.length}">
            ${currentExerciseIndex + 1} of ${workout.exercises.length}
          </span>
        </div>
      </div>

      <div class="workout-progress-bar"
           role="progressbar"
           aria-valuenow="${Math.round(progress)}"
           aria-valuemin="0"
           aria-valuemax="100"
           aria-label="Workout progress">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>

      <div class="exercise-display">

        <div class="exercise-role-badge ${exercise.role}">
          ${formatRole(exercise.role)}
        </div>

        <h1 class="exercise-name">${exercise.name}</h1>

        <div class="exercise-meta">
          ${exercise.perSide ? '<span class="meta-tag">Each side</span>' : ''}
          <span class="meta-tag">${exercise.category}</span>
          <span class="meta-tag">+${exercise.credits} ⭐</span>
        </div>

        <div class="exercise-target">
          ${renderExerciseTarget(exercise)}
        </div>

        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' exercise form')}"
           target="_blank"
           rel="noopener noreferrer"
           class="youtube-link"
           aria-label="Watch how to do ${exercise.name} on YouTube, opens in new tab">
          <span aria-hidden="true">▶️</span>
          Watch how to do this
        </a>

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

        ${exercise.why ? `
          <div class="exercise-why">
            <h3>Why this exercise?</h3>
            <p>${exercise.why}</p>
          </div>
        ` : ''}

      </div>

      <div class="workout-actions">
        ${exercise.duration ? `
          <button class="btn btn-large btn-full ${timerStarted ? 'btn-secondary' : 'btn-accent'}"
                  id="timer-toggle-btn">
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
  }

  if (exercise.reps) {
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
    warmup:    '🔥 Warm Up',
    main:      '💪 Main',
    accessory: '🎯 Accessory',
    finisher:  '🏁 Finisher',
    cooldown:  '🧘 Cool Down'
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

  document.getElementById('exit-workout-btn')?.addEventListener('click', () => {
    if (confirm('Exit workout? Your progress on this workout will be lost.')) {
      cleanupWorkout();
      router.navigate('today');
    }
  });

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

  document.getElementById('complete-exercise-btn')?.addEventListener('click', () => {
    completeExercise();
  });

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
      timerInterval = null;
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
  const workout  = store.get('activeWorkout');
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
  if (currentExerciseIndex >= store.get('activeWorkout').exercises.length - 1) {
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

  // Tally credits
  const creditsEarned = progress.reduce((sum, e) => sum + (e.credits || 0), 0);
  store.set('totalCredits', (store.get('totalCredits') || 0) + creditsEarned);

  // Append to workout history
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

  // Record session with programme engine — returns earned milestone or null
  const milestone = programmeEngine.recordSession(workout.focus || null);
  store.set('lastMilestone',      milestone || null);
  store.set('lastWorkoutCredits', creditsEarned);
  store.set('lastWorkoutName',    workout.name);

  cleanupWorkout();
  router.navigate('workout-complete');
}

function cleanupWorkout() {
  pauseTimer();
  currentExerciseIndex = 0;
  timeRemaining        = 0;
  timerStarted         = false;
  store.set('activeWorkout',   null);
  store.set('workoutProgress', null);
}
