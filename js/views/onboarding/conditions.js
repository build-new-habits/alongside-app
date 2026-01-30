/**
 * conditions.js - Onboarding Step 6: Select conditions
 */

import { store } from '../../store.js';
import { CONDITIONS } from '../../data/conditions.js';

export const centered = false;

export function render() {
  const selectedConditions = store.get('conditions') || [];
  
  const conditionsHtml = CONDITIONS.map(condition => `
    <button class="btn-card condition-option ${selectedConditions.includes(condition.id) ? 'selected' : ''}" 
            data-condition="${condition.id}" 
            onclick="toggleCondition('${condition.id}')">
      <span class="condition-icon">${condition.icon}</span>
      <span class="condition-text">${condition.name}</span>
    </button>
  `).join('');
  
  return `
    <div class="onboarding-view">
      <div class="onboarding-header">
        <button class="btn btn-ghost" onclick="router.navigate('onboarding/goals')">← Back</button>
        <div class="progress-dots">
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
      
      <div class="onboarding-content">
        <h1>Anything I should know about?</h1>
        <p class="text-secondary">I'll adapt exercises to protect these areas.</p>
        
        <div class="conditions-grid">
          ${conditionsHtml}
        </div>
        
        <p class="text-sm text-muted" style="margin-top: var(--space-4);">
          💡 It's okay to skip this - you can add conditions later in Settings.
        </p>
      </div>
      
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="saveConditions()" id="conditions-continue-btn">
          ${selectedConditions.length > 0 ? 'Continue' : 'Skip for now'}
        </button>
      </div>
    </div>
  `;
}

// Global functions
window.toggleCondition = function(conditionId) {
  const conditions = store.get('conditions') || [];
  const index = conditions.indexOf(conditionId);
  
  if (index > -1) {
    conditions.splice(index, 1);
  } else {
    conditions.push(conditionId);
  }
  
  store.set('conditions', conditions);
  
  // Update UI
  const btn = document.querySelector(`[data-condition="${conditionId}"]`);
  if (btn) btn.classList.toggle('selected');
  
  const continueBtn = document.getElementById('conditions-continue-btn');
  if (continueBtn) {
    continueBtn.textContent = conditions.length > 0 ? 'Continue' : 'Skip for now';
  }
};

window.saveConditions = function() {
  router.navigate('onboarding/lifestyle');
};
