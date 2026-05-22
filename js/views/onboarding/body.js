/**
 * body.js - Onboarding Step 4: Weight, target weight, target date
 */

import { store } from '../../store.js';

export const centered = false;

export function render() {
  const weight = store.get('weight') || '';
  const weightUnit = store.get('weightUnit') || 'kg';
  const targetWeight = store.get('targetWeight') || '';
  const targetDescription = store.get('targetDescription') || '';
  const targetDate = store.get('targetDate') || '';
  
  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];
  
  return `
    <div class="onboarding-view">
      <div class="onboarding-header">
        <button class="btn btn-ghost" onclick="router.navigate('onboarding/about')">← Back</button>
        <div class="progress-dots">
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
      
      <div class="onboarding-content">
        <h1>Your body & targets</h1>
        <div class="onboarding-coach-line">
          <img src="assets/images/logo-icon-small.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="onboarding-coach-text">This is completely optional. If you have a weight or a target in mind, I can factor it in. If not, that's absolutely fine — we can focus on how you feel instead. There are no wrong answers here.</p>
        </div>
        
        <div class="form-section">
          <label class="form-label">Current weight</label>
          <div class="input-with-unit">
            <input 
              type="number" 
              id="user-weight" 
              class="input-field"
              placeholder="e.g. 75"
              min="30"
              max="300"
              step="0.1"
              value="${weight}"
            >
            <select id="weight-unit" class="unit-select" onchange="updateWeightUnit()">
              <option value="kg" ${weightUnit === 'kg' ? 'selected' : ''}>kg</option>
              <option value="lbs" ${weightUnit === 'lbs' ? 'selected' : ''}>lbs</option>
            </select>
          </div>
        </div>
        
        <div class="form-section">
          <label class="form-label">Target weight <span class="text-muted">(optional)</span></label>
          <div class="input-with-unit">
            <input 
              type="number" 
              id="user-target-weight" 
              class="input-field"
              placeholder="e.g. 70"
              min="30"
              max="300"
              step="0.1"
              value="${targetWeight}"
            >
            <span class="unit-display" id="target-unit-display">${weightUnit}</span>
          </div>
        </div>
        
        <div class="form-section">
          <label class="form-label">Got a target date or event? <span class="text-muted">(optional)</span></label>
          <input 
            type="text" 
            id="target-description" 
            class="input-field"
            placeholder="e.g. Holiday in April, Wedding in June"
            value="${targetDescription}"
          >
          <input 
            type="date" 
            id="target-date" 
            class="input-field"
            style="margin-top: var(--space-2); min-height: 52px; color-scheme: dark; color: var(--color-text); font-size: var(--text-base); padding: var(--space-3);"
            value="${targetDate}"
            min="${today}"
            aria-label="Target date"
          >
        </div>
      </div>
      
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="saveBody()">
          Continue
        </button>
        <button class="btn btn-ghost btn-full" onclick="saveBody()" style="margin-top: var(--space-2);">
          Skip for now
        </button>
      </div>
    </div>
  `;
}

// Global functions
window.updateWeightUnit = function() {
  const unit = document.getElementById('weight-unit').value;
  store.set('weightUnit', unit);
  document.getElementById('target-unit-display').textContent = unit;
};

window.saveBody = function() {
  const weight = document.getElementById('user-weight').value;
  const targetWeight = document.getElementById('user-target-weight').value;
  const targetDescription = document.getElementById('target-description').value;
  const targetDate = document.getElementById('target-date').value;
  
  if (weight) store.set('weight', parseFloat(weight));
  if (targetWeight) store.set('targetWeight', parseFloat(targetWeight));
  if (targetDescription) store.set('targetDescription', targetDescription.trim());
  if (targetDate) store.set('targetDate', targetDate);
  
  router.navigate('onboarding/goals');
};
