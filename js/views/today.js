/**
 * today.js - Today View
 * Shows check-in prompt or generated workout options
 */

import { store } from '../store.js';
import { checkinData } from '../data/checkin.js';
import { workoutGenerator } from '../data/workoutGenerator.js';

export const centered = false;

export function render() {
  const name = store.get('name') || 'there';
  const hasCheckedIn = checkinData.hasCheckedInToday();
  
  if (!hasCheckedIn) {
    return renderCheckinPrompt(name);
  } else {
    return renderTodaysDashboard(name);
  }
}

function renderCheckinPrompt(name) {
  const greeting = getTimeGreeting();
  const burnout = checkinData.detectBurnout();
  
  return `
    <div class="view">
      <div class="view-header">
        <h1>${greeting}, ${name} 👋</h1>
        <p class="text-secondary">Let's check in before we plan your session.</p>
      </div>
      
      ${burnout.level !== 'none' ? `
        <div class="card card-warning">
          <div class="warning-content">
            <span class="warning-icon">💛</span>
            <p>${burnout.message}</p>
          </div>
        </div>
      ` : ''}
      
      <div class="card card-coach">
        <img src="assets/images/logo-icon-small.png" alt="Coach" class="coach-icon-small">
        <div class="coach-prompt-content">
          <p><strong>Ready to check in?</strong></p>
          <p class="text-secondary">It only takes 30 seconds, and helps me suggest the right workout for today.</p>
        </div>
      </div>
      
      <button class="btn btn-primary btn-large btn-full" id="start-checkin-btn" style="margin-top: var(--space-4);">
        Start Check-In
      </button>
      
      ${renderRecentHistory()}
    </div>
  `;
}

function renderTodaysDashboard(name) {
  const todaysCheckin = checkinData.getTodaysCheckin();
  const intensity = store.get('todayIntensity') || 'moderate';
  const burnout = checkinData.detectBurnout();
  
  // Generate or get workouts
  const workouts = workoutGenerator.getTodaysWorkouts();
  
  // Intensity display
  const intensityDisplay = {
    recovery: { label: 'Recovery', color: 'purple', message: 'Focus on gentle movement and rest.' },
    gentle: { label: 'Gentle', color: 'green', message: 'Light activity without strain.' },
    moderate: { label: 'Moderate', color: 'teal', message: 'A solid, balanced session.' },
    challenging: { label: 'Challenging', color: 'orange', message: 'Push yourself - you\'ve got the energy!' }
  };
  
  const display = intensityDisplay[intensity] || intensityDisplay.moderate;
  
  return `
    <div class="view">
      <div class="view-header">
        <h1>Today's Plan</h1>
        <p class="text-secondary">${formatDate(new Date())}</p>
      </div>
      
      <!-- Check-in Summary -->
      <div class="card checkin-summary-card">
        <div class="checkin-summary-header">
          <h3>Your Check-In</h3>
          <button class="btn btn-ghost btn-small" id="update-checkin-btn">Update</button>
        </div>
        <div class="checkin-summary-stats">
          <div class="stat">
            <span class="stat-emoji">${checkinData.getEnergyEmoji(todaysCheckin.energy)}</span>
            <span class="stat-label">Energy</span>
            <span class="stat-value">${todaysCheckin.energy}/10</span>
          </div>
          <div class="stat">
            <span class="stat-emoji">${checkinData.getMoodEmoji(todaysCheckin.mood)}</span>
            <span class="stat-label">Mood</span>
            <span class="stat-value">${todaysCheckin.mood}/10</span>
          </div>
          <div class="stat">
            <span class="stat-emoji">😴</span>
            <span class="stat-label">Sleep</span>
            <span class="stat-value">${todaysCheckin.sleepHours}h</span>
          </div>
        </div>
      </div>
      
      <!-- Coach Recommendation -->
      <div class="card card-coach">
        <img src="assets/images/logo-icon-small.png" alt="Coach" class="coach-icon-small">
        <div class="recommendation-content">
          <div class="intensity-badge ${intensity}">
            ${getIntensityIcon(intensity)} ${display.label}
          </div>
          <p>${display.message}</p>
          ${burnout.level !== 'none' ? `
            <p class="text-sm text-muted">${burnout.reasons.join('. ')}.</p>
          ` : ''}
        </div>
      </div>
      
      <!-- Workout Options -->
      <div class="workout-options">
        <h2>Today's Options</h2>
        <p class="text-secondary">Choose what feels right:</p>
        
        ${workouts.map((workout, index) => renderWorkoutCard(workout, index)).join('')}
      </div>
    </div>
  `;
}

function renderWorkoutCard(workout, index) {
  return `
    <div class="card workout-option-card" data-workout-index="${index}">
      <div class="option-header">
        <span class="option-icon">${workout.icon}</span>
        <div class="option-info">
          <h4>${workout.name}</h4>
          <p class="text-sm text-muted">${workout.duration} mins • ${workout.exerciseCount} exercises</p>
        </div>
        <span class="option-credits">+${workout.totalCredits} ⭐</span>
      </div>
      
      <p class="workout-rationale">${workout.rationale}</p>
      
    <div class="exercise-full-list">
      ${workout.exercises.map(e => `
        <div class="exercise-list-row">
          <span class="exercise-list-name">${e.name}</span>
          <span class="exercise-list-prescription">
            ${e.duration
              ? `${e.sets > 1 ? e.sets + ' × ' : ''}${e.duration}s`
              : `${e.sets || 3} × ${e.reps || 10} reps`}
          </span>
        </div>
      `).join('')}
    </div>
      
      <button class="btn btn-primary btn-full workout-start-btn" data-workout-index="${index}">
        Start Workout
      </button>
    </div>
  `;
}

function renderRecentHistory() {
  const history = checkinData.getHistory(5);
  
  if (history.length === 0) {
    return `
      <div class="card" style="margin-top: var(--space-6);">
        <h3>Your Recent Check-Ins</h3>
        <p class="text-sm text-muted">No check-ins yet. Start your first one above!</p>
      </div>
    `;
  }
  
  return `
    <div class="card" style="margin-top: var(--space-6);">
      <h3>Your Recent Check-Ins</h3>
      <div class="history-mini">
        ${history.map(day => `
          <div class="history-day">
            <span class="history-date">${formatShortDate(day.date)}</span>
            <span class="history-emoji">${checkinData.getEnergyEmoji(day.energy)}</span>
            <span class="history-value">${day.energy}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
}

function formatShortDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateString === today.toISOString().split('T')[0]) {
    return 'Today';
  }
  if (dateString === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday';
  }
  
  return date.toLocaleDateString('en-GB', { weekday: 'short' });
}

function getIntensityIcon(intensity) {
  const icons = {
    recovery: '🧘',
    gentle: '🌱',
    moderate: '💪',
    challenging: '🔥'
  };
  return icons[intensity] || '💪';
}

export function onMount() {
  // Start check-in button
  const startBtn = document.getElementById('start-checkin-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      router.navigate('checkin');
    });
  }
  
  // Update check-in button
  const updateBtn = document.getElementById('update-checkin-btn');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      router.navigate('checkin');
    });
  }
  
  // Workout start buttons
  document.querySelectorAll('.workout-start-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.workoutIndex;
      const workouts = store.get('todaysWorkouts');
      if (workouts && workouts[index]) {
        store.set('activeWorkout', workouts[index]);
        router.navigate('workout');
      }
    });
  });
}
