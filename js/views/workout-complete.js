/**
 * workout-complete.js - Workout Completion Celebration
 *
 * Changes (t2_5 / t2_7):
 *   - Reads 'lastMilestone' from store; renders milestone card if present
 *   - Coach voice on milestone defaults to 'steady' (coachStyle not yet wired to store)
 *   - Button navigates to 'progress' instead of 'today'
 *   - Clears lastMilestone, lastWorkoutCredits, lastWorkoutName on exit
 */

import { store } from '../store.js';

export const centered = true;

export function render() {
  const creditsEarned = store.get('lastWorkoutCredits') || 0;
  const workoutName   = store.get('lastWorkoutName') || 'Workout';
  const totalCredits  = store.get('totalCredits') || 0;
  const milestone     = store.get('lastMilestone') || null;

  return `
    <div class="view completion-view">
      <div class="celebration-content">

        <div class="celebration-emoji" aria-hidden="true">🎉</div>

        <h1>Workout Complete!</h1>
        <p class="completion-workout-name">${workoutName}</p>

        <div class="credits-earned-display" aria-label="${creditsEarned} credits earned">
          <span class="credits-number" aria-hidden="true">+${creditsEarned}</span>
          <span class="credits-label" aria-hidden="true">credits earned</span>
        </div>

        <div class="total-credits-display">
          <span class="total-label">Total balance:</span>
          <span class="total-number">${totalCredits} ⭐</span>
        </div>

        ${milestone ? renderMilestone(milestone) : ''}

        <div class="completion-message card">
          <p>${getCompletionMessage()}</p>
        </div>

        <div class="completion-actions">
          <button class="btn btn-primary btn-large btn-full" id="view-progress-btn">
            See your progress →
          </button>
        </div>

      </div>
    </div>
  `;
}

function renderMilestone(milestone) {
  // coachStyle not yet stored — defaults to steady until wired up in settings
  const coachStyle = store.get('coachStyle') || 'steady';

  const voice = {
    steady: {
      prefix: 'Milestone reached:',
      suffix: "Take a moment to notice how far you've come."
    },
    energetic: {
      prefix: 'Milestone unlocked! 🎉',
      suffix: 'Seriously well done — this is the work paying off.'
    },
    nurturing: {
      prefix: "I'm really proud of you.",
      suffix: 'Take a moment and really feel this.'
    },
    minimal: {
      prefix: 'Milestone:',
      suffix: ''
    }
  }[coachStyle] || { prefix: 'Milestone reached:', suffix: "Take a moment to notice how far you've come." };

  return `
    <div class="milestone-card"
         role="status"
         aria-live="polite"
         aria-label="Milestone achieved: ${milestone.label}">
      <div class="milestone-badge" aria-hidden="true">🏅</div>
      <p class="milestone-prefix">${voice.prefix}</p>
      <p class="milestone-label">${milestone.label}</p>
      ${voice.suffix ? `<p class="milestone-suffix">${voice.suffix}</p>` : ''}
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
  triggerConfetti();

  document.getElementById('view-progress-btn')?.addEventListener('click', () => {
    store.set('lastWorkoutCredits', null);
    store.set('lastWorkoutName',    null);
    store.set('lastMilestone',      null);
    router.navigate('progress');
  });
}

function triggerConfetti() {
  const container = document.querySelector('.celebration-content');
  if (!container) return;

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.setAttribute('aria-hidden', 'true');
    piece.style.left            = `${Math.random() * 100}%`;
    piece.style.animationDelay  = `${Math.random() * 2}s`;
    piece.style.backgroundColor = getRandomColor();
    container.appendChild(piece);
  }
}

function getRandomColor() {
  const colors = ['#2DD4BF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
}
