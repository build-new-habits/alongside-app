/**
 * workout-complete.js - Workout Completion Celebration
 * Shows credits earned and celebration
 */

import { store } from '../store.js';

export const centered = true;

export function render() {
  const creditsEarned = store.get('lastWorkoutCredits') || 0;
  const workoutName = store.get('lastWorkoutName') || 'Workout';
  const totalCredits = store.get('totalCredits') || 0;
  
  return `
    <div class="view completion-view">
      <div class="celebration-content">
        <div class="celebration-emoji">🎉</div>
        
        <h1>Workout Complete!</h1>
        <p class="completion-workout-name">${workoutName}</p>
        
        <div class="credits-earned-display">
          <span class="credits-number">+${creditsEarned}</span>
          <span class="credits-label">credits earned</span>
        </div>
        
        <div class="total-credits-display">
          <span class="total-label">Total balance:</span>
          <span class="total-number">${totalCredits} ⭐</span>
        </div>
        
        <div class="completion-message card">
          <p>${getCompletionMessage()}</p>
        </div>
        
        <div class="completion-actions">
          <button class="btn btn-primary btn-large btn-full" id="back-to-today-btn">
            Back to Today
          </button>
        </div>
      </div>
    </div>
  `;
}

function getCompletionMessage() {
  const messages = [
    "You showed up for yourself today. That's what matters.",
    "Another workout in the books. Your body thanks you.",
    "Consistency beats intensity. You're building something here.",
    "Movement is medicine. Well done.",
    "You did the thing! Rest well, you've earned it.",
    "Small steps, big results. Keep going.",
    "That's another deposit in your health account.",
    "Your future self is grateful for today's effort."
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

export function onMount() {
  // Trigger confetti animation
  triggerConfetti();
  
  // Back to today button
  document.getElementById('back-to-today-btn')?.addEventListener('click', () => {
    // Clear completion data
    store.set('lastWorkoutCredits', null);
    store.set('lastWorkoutName', null);
    router.navigate('today');
  });
}

function triggerConfetti() {
  // Simple CSS confetti animation
  const container = document.querySelector('.celebration-content');
  if (!container) return;
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.backgroundColor = getRandomColor();
    container.appendChild(confetti);
  }
}

function getRandomColor() {
  const colors = ['#2DD4BF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}
