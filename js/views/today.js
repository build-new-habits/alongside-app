/**
 * today.js - Today View
 * Shows check-in prompt or workout options after check-in
 */

import { store } from '../store.js';
import { checkinData } from '../data/checkin.js';
import { getGoalName } from '../data/goals.js';

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
        <div class="card card-warning" style="margin-bottom: var(--space-4);">
          <div class="warning-content">
            <span class="warning-icon">💛</span>
            <p>${burnout.message}</p>
          </div>
        </div>
      ` : ''}
      
      <div class="card card-coach checkin-prompt-card">
        <img src="assets/images/logo-icon-small.png" alt="Coach" class="coach-icon-small">
        <div class="checkin-prompt-content">
          <p><strong>Ready to check in?</strong></p>
          <p class="text-secondary">It only takes 30 seconds, and helps me suggest the right workout for today.</p>
        </div>
      </div>
      
      <button class="btn btn-primary btn-large btn-full" onclick="router.navigate('checkin')" style="margin-top: var(--space-4);">
        Start Check-In
      </button>
      
      <div class="today-summary" style="margin-top: var(--space-6);">
        <h3>Your recent check-ins</h3>
        ${renderRecentHistory()}
      </div>
    </div>
  `;
}

function renderTodaysDashboard(name) {
  const todaysCheckin = checkinData.getTodaysCheckin();
  const intensity = store.get('todayIntensity') || 'moderate';
  const burnout = checkinData.detectBurnout();
  
  // Build intensity message
  const intensityMessages = {
    recovery: "Based on how you're feeling, today is about gentle recovery.",
    gentle: "Let's keep it light today - movement without strain.",
    moderate: "You're ready for a solid session today.",
    challenging: "You've got great energy - let's make the most of it!"
  };
  
  const intensityEmojis = {
    recovery: '🧘',
    gentle: '🌱',
    moderate: '💪',
    challenging: '🔥'
  };
  
  return `
    <div class="view">
      <div class="view-header">
        <h1>Today's Plan</h1>
        <p class="text-secondary">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
      
      <!-- Check-in Summary -->
      <div class="card checkin-summary-card">
        <div class="checkin-summary-header">
          <h3>Your Check-In</h3>
          <button class="btn btn-ghost btn-small" onclick="router.navigate('checkin')">
            Update
          </button>
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
      <div class="card card-coach recommendation-card">
        <img src="assets/images/logo-icon-small.png" alt="Coach" class="coach-icon-small">
        <div class="recommendation-content">
          <div class="intensity-badge ${intensity}">
            ${intensityEmojis[intensity]} ${intensity.charAt(0).toUpperCase() + intensity.slice(1)}
          </div>
          <p>${intensityMessages[intensity]}</p>
          ${burnout.level !== 'none' ? `
            <p class="text-sm text-muted" style="margin-top: var(--space-2);">
              ${burnout.reasons.join('. ')}.
            </p>
          ` : ''}
        </div>
      </div>
      
      <!-- Workout Options Placeholder -->
      <div class="workout-options" style="margin-top: var(--space-4);">
        <h3>Today's Options</h3>
        <p class="text-secondary" style="margin-bottom: var(--space-4);">Choose what feels right:</p>
        
        <div class="workout-option-card card">
          <div class="option-header">
            <span class="option-icon">💪</span>
            <div class="option-info">
              <h4>Strength Focus</h4>
              <p class="text-sm text-muted">25 mins • 6 exercises</p>
            </div>
          </div>
          <p class="text-sm text-secondary">Build strength with compound movements matched to your energy.</p>
          <button class="btn btn-primary btn-full" style="margin-top: var(--space-3);" disabled>
            Coming Soon
          </button>
        </div>
        
        <div class="workout-option-card card" style="margin-top: var(--space-3);">
          <div class="option-header">
            <span class="option-icon">🧘</span>
            <div class="option-info">
              <h4>Mobility & Recovery</h4>
              <p class="text-sm text-muted">20 mins • 8 exercises</p>
            </div>
          </div>
          <p class="text-sm text-secondary">Gentle movement to ease tension and improve flexibility.</p>
          <button class="btn btn-secondary btn-full" style="margin-top: var(--space-3);" disabled>
            Coming Soon
          </button>
        </div>
        
        <div class="workout-option-card card" style="margin-top: var(--space-3);">
          <div class="option-header">
            <span class="option-icon">❤️</span>
            <div class="option-info">
              <h4>Cardio Boost</h4>
              <p class="text-sm text-muted">20 mins • 5 exercises</p>
            </div>
          </div>
          <p class="text-sm text-secondary">Get your heart pumping with exercises matched to your fitness level.</p>
          <button class="btn btn-secondary btn-full" style="margin-top: var(--space-3);" disabled>
            Coming Soon
          </button>
        </div>
      </div>
      
      <p class="text-sm text-muted text-center" style="margin-top: var(--space-6);">
        Workout generation coming in the next update!
      </p>
    </div>
  `;
}

function renderRecentHistory() {
  const history = checkinData.getHistory(5);
  
  if (history.length === 0) {
    return `
      <p class="text-sm text-muted">No check-ins yet. Start your first one above!</p>
    `;
  }
  
  return `
    <div class="history-mini">
      ${history.map(day => `
        <div class="history-day">
          <span class="history-date">${formatShortDate(day.date)}</span>
          <span class="history-emoji">${checkinData.getEnergyEmoji(day.energy)}</span>
          <span class="history-value">${day.energy}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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
