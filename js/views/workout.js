/**
 * workout.js - Workout Execution View
 * Displays exercises one by one with timer/counter
 */

import { store } from '../store.js';
import { checkinData } from '../data/checkin.js';

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
  
  return `
    <div class="view workout-view">
      <!-- Header with progress -->
      <div class="workout-header">
        <button class="btn btn-ghost" id="exit-workout-btn">✕ Exit</button>
        <div class="workout-progress-info">
          <span>${currentExerciseIndex + 1} of ${workout.exercises.length}</span>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="workout-progress-bar">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>
      
      <!-- Exercise display -->
      <div class="exercise-display">
        <div class="exercise-role-badge ${exercise.role}">${formatRole(exercise.role)}</div>
        
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
           rel="noopener"
           class="youtube-link">
          <span class="youtube-icon">▶️</span>
          Watch how to do this
        </a>
        
        <!-- Instructions -->
        <div class="exercise-instructions card">
          <h3>How to do it</h3>
          <ol class="instruction-list">
            ${exercise.instructions.map(inst => `
              <li>${inst}</li>
            `).join('')}
          </ol>
          
          ${exercise.coaching ? `
            <div class="coaching-tip">
              <span class="tip-icon">💡</span>
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
          <button class="btn btn-large btn-full ${timerStarted ? 'btn-secondary' : 'btn-accent'}" id="timer-toggle-btn">
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
    // Timed exercise
    const sets = exercise.sets || 1;
    const totalTime = exercise.duration * sets;
    
    return `
      <div class="timer-display">
        <div class="timer-circle">
          <span class="timer-value" id="timer-display">${formatTime(timeRemaining || exercise.duration)}</span>
          <span class="timer-label">${sets > 1 ? `Set 1 of ${sets}` : 'Hold'}</span>
        </div>
      </div>
    `;
  } else if (exercise.reps) {
    // Rep-based exercise
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
    warmup: '🔥 Warm Up',
    main: '💪 Main',
    accessory: '🎯 Accessory',
    finisher: '🏁 Finisher',
    cooldown: '🧘 Cool Down'
  };
  return roles[role] || role;
}

export function onMount() {
  const workout = store.get('activeWorkout');
  if (!workout) return;
  
  const exercise = workout.exercises[currentExerciseIndex];
  
  // Initialize timer value but DON'T start it automatically
  if (exercise.duration) {
    timeRemaining = exercise.duration;
    updateTimerDisplay();
    // Timer will start when user taps "Start Timer"
  }
  
  // Exit button
  document.getElementById('exit-workout-btn')?.addEventListener('click', () => {
    if (confirm('Exit workout? Your progress on this workout will be lost.')) {
      cleanupWorkout();
      router.navigate('today');
    }
  });
  
  // Timer toggle - Start/Pause/Resume
  document.getElementById('timer-toggle-btn')?.addEventListener('click', () => {
    if (!timerStarted) {
      // First tap - start the timer
      timerStarted = true;
      startTimer();
    } else if (timerInterval) {
      // Timer running - pause it
      pauseTimer();
    } else {
      // Timer paused - resume it
      startTimer();
    }
    // Re-render to update button text
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
      // Play sound or vibrate
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
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
  const display = document.getElementById('timer-display');
  if (display) {
    display.textContent = formatTime(timeRemaining);
  }
}

function completeExercise() {
  const workout = store.get('activeWorkout');
  const exercise = workout.exercises[currentExerciseIndex];
  
  // Track completed exercise
  const completed = store.get('workoutProgress') || [];
  completed.push({
    exerciseId: exercise.id,
    credits: exercise.credits,
    completedAt: new Date().toISOString()
  });
  store.set('workoutProgress', completed);
  
  // Check if workout complete
  if (currentExerciseIndex >= workout.exercises.length - 1) {
    completeWorkout();
  } else {
    // Move to next exercise
    currentExerciseIndex++;
    resetTimer();
    router.navigate('workout');
  }
}

function skipExercise() {
  const workout = store.get('activeWorkout');
  
  if (currentExerciseIndex >= workout.exercises.length - 1) {
    // Last exercise - complete workout
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
  timerStarted = false;
}

function completeWorkout() {
  const workout = store.get('activeWorkout');
  const progress = store.get('workoutProgress') || [];
  
  // Calculate total credits earned
  const creditsEarned = progress.reduce((sum, e) => sum + (e.credits || 0), 0);
  
  // Add to total credits
  const totalCredits = (store.get('totalCredits') || 0) + creditsEarned;
  store.set('totalCredits', totalCredits);
  
  // Save workout to history
  const history = store.get('workoutHistory') || [];
  history.push({
    workoutId: workout.id,
    name: workout.name,
    focus: workout.focus,
    completedAt: new Date().toISOString(),
    exercisesCompleted: progress.length,
    totalExercises: workout.exercises.length,
    creditsEarned: creditsEarned
  });
  store.set('workoutHistory', history);
  
  // Clean up
  cleanupWorkout();
  
  // Navigate to completion screen
  store.set('lastWorkoutCredits', creditsEarned);
  store.set('lastWorkoutName', workout.name);
  router.navigate('workout-complete');
}

function cleanupWorkout() {
  pauseTimer();
  currentExerciseIndex = 0;
  timeRemaining = 0;
  timerStarted = false;
  store.set('activeWorkout', null);
  store.set('workoutProgress', null);
}
