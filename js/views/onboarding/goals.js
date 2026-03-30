/**
 * goals.js - Onboarding Step 5: Select goals
 */

import { store } from '../../store.js';
import { GOALS } from '../../data/goals.js';

export const centered = false;

export function render() {
  const selectedGoals = store.get('goals') || [];
  
  const goalsHtml = GOALS.map(goal => `
    <button class="btn-card goal-option ${selectedGoals.includes(goal.id) ? 'selected' : ''}" 
            data-goal="${goal.id}" 
            onclick="toggleGoal('${goal.id}')">
      <span class="goal-icon">${goal.icon}</span>
      <span class="goal-text">${goal.name}</span>
    </button>
  `).join('');
  
  return `
    <div class="onboarding-view">
      <div class="onboarding-header">
        <button class="btn btn-ghost" onclick="router.navigate('onboarding/body')">← Back</button>
        <div class="progress-dots">
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
      
      <div class="onboarding-content">
        <h1>What brings you here?</h1>
        <div class="onboarding-coach-line">
          <img src="assets/images/logo-icon-small.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="onboarding-coach-text">What matters most to you right now? There's no right answer — just whatever feels true today. I'll lean your sessions in that direction, and you can always change your mind. This is your plan, not mine.</p>
        </div>
        
        <div class="goals-grid">
          ${goalsHtml}
        </div>
      </div>
      
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" 
                onclick="saveGoals()" 
                id="goals-continue-btn"
                ${selectedGoals.length === 0 ? 'disabled' : ''}>
          Continue
        </button>
        <p class="text-sm text-secondary text-center" id="goals-count" style="margin-top: var(--space-3);">
          ${selectedGoals.length} selected
        </p>
      </div>
    </div>
  `;
}

// Global functions
window.toggleGoal = function(goalId) {
  const goals = store.get('goals') || [];
  const index = goals.indexOf(goalId);
  
  if (index > -1) {
    goals.splice(index, 1);
  } else {
    goals.push(goalId);
  }
  
  store.set('goals', goals);
  
  // Update UI
  const btn = document.querySelector(`[data-goal="${goalId}"]`);
  if (btn) btn.classList.toggle('selected');
  
  const continueBtn = document.getElementById('goals-continue-btn');
  if (continueBtn) continueBtn.disabled = goals.length === 0;
  
  const countText = document.getElementById('goals-count');
  if (countText) countText.textContent = `${goals.length} selected`;
};

window.saveGoals = function() {
  const goals = store.get('goals') || [];
  if (goals.length === 0) return;
  router.navigate('onboarding/conditions');
};
