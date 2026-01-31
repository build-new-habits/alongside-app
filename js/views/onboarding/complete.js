/**
 * complete.js - Onboarding Step 9: Summary and start
 */

import { store } from '../../store.js';
import { getGoalName } from '../../data/goals.js';

export const centered = true;

export function render() {
  const name = store.get('name');
  const age = store.get('age');
  const weight = store.get('weight');
  const weightUnit = store.get('weightUnit') || 'kg';
  const targetWeight = store.get('targetWeight');
  const targetDescription = store.get('targetDescription');
  const targetDate = store.get('targetDate');
  const goals = store.get('goals') || [];
  const equipment = store.get('equipment') || [];
  
  // Build target text
  let targetText = 'No specific target set';
  if (targetDescription) {
    targetText = targetDescription;
    if (targetDate) targetText += ` (${formatDate(targetDate)})`;
  } else if (targetWeight) {
    targetText = `Reach ${targetWeight}${weightUnit}`;
    if (targetDate) targetText += ` by ${formatDate(targetDate)}`;
  }
  
  // Build goals text
  const goalsText = goals.map(g => getGoalName(g)).join(', ') || 'None selected';
  
  return `
    <div class="onboarding-view">
      <div class="onboarding-content">
        <div class="coach-greeting">
          <div class="completion-icon">🎉</div>
          <h1>You're all set, ${name}!</h1>
          <p class="lead">I've got everything I need to start helping you.</p>
        </div>
        
        <div class="welcome-message card card-coach">
          <div class="coach-message-content">
            <img src="assets/images/logo-icon-small.png" alt="Coach" class="coach-icon-small">
            <div>
              <p>Each day, I'll check in with you and suggest movement that matches how you're feeling.</p>
              <p class="text-secondary">No pressure. No judgment. Just support.</p>
            </div>
          </div>
        </div>
        
        <div class="summary-card card">
          <h3>Your profile</h3>
          <div class="summary-row">
            <span class="summary-label">Age:</span>
            <span class="summary-value">${age || 'Not set'}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Current weight:</span>
            <span class="summary-value">${weight ? weight + weightUnit : 'Not set'}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Target:</span>
            <span class="summary-value">${targetText}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Goals:</span>
            <span class="summary-value">${goalsText}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Equipment:</span>
            <span class="summary-value">${equipment.length > 0 ? equipment.length + ' items' : 'Bodyweight only'}</span>
          </div>
        </div>
      </div>
      
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="startApp()">
          Let's go!
        </button>
      </div>
    </div>
  `;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

window.startApp = function() {
  document.getElementById('bottom-nav').classList.remove('hidden');
  router.navigate('today');
};
