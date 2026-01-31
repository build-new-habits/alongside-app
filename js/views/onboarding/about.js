/**
 * about.js - Onboarding Step 3: Age, gender, hormonal tracking
 */

import { store } from '../../store.js';

export const centered = false;

const GENDER_OPTIONS = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'non-binary', label: 'Non-binary' },
  { id: 'prefer-not', label: 'Prefer not to say' }
];

export function render() {
  const name = store.get('name') || '';
  const age = store.get('age') || '';
  const gender = store.get('gender');
  const hormonalTracking = store.get('hormonalTracking');
  const showHormonalOption = ['female', 'non-binary'].includes(gender);
  
  return `
    <div class="onboarding-view">
      <div class="onboarding-header">
        <button class="btn btn-ghost" onclick="router.navigate('onboarding/name')">← Back</button>
        <div class="progress-dots">
          <span class="dot completed"></span>
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
      
      <div class="onboarding-content">
        <h1>A bit about you, ${name}</h1>
        <p class="text-secondary">This helps me personalise your experience.</p>
        
        <div class="form-section">
          <label class="form-label">Your age</label>
          <input 
            type="number" 
            id="user-age" 
            class="input-field"
            placeholder="e.g. 42"
            min="16"
            max="100"
            value="${age}"
          >
        </div>
        
        <div class="form-section">
          <label class="form-label">Gender</label>
          <div class="radio-group">
            ${GENDER_OPTIONS.map(opt => `
              <button class="btn-card radio-option ${gender === opt.id ? 'selected' : ''}"
                      onclick="setGender('${opt.id}')">
                ${opt.label}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div id="hormonal-option" class="form-section ${showHormonalOption ? '' : 'hidden'}">
          <label class="form-label">Would you like cycle-aware recommendations?</label>
          <p class="text-sm text-muted" style="margin-bottom: var(--space-3);">
            This helps me adapt workouts to your energy patterns throughout the month.
          </p>
          <div class="radio-group">
            <button class="btn-card radio-option ${hormonalTracking === true ? 'selected' : ''}"
                    onclick="setHormonalTracking(true)">
              Yes, that would help
            </button>
            <button class="btn-card radio-option ${hormonalTracking === false ? 'selected' : ''}"
                    onclick="setHormonalTracking(false)">
              No thanks
            </button>
          </div>
        </div>
      </div>
      
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="saveAbout()">
          Continue
        </button>
      </div>
    </div>
  `;
}

// Global functions for onclick handlers
window.setGender = function(genderId) {
  // Save current age value before re-rendering
  const ageInput = document.getElementById('user-age');
  if (ageInput && ageInput.value) {
    store.set('age', parseInt(ageInput.value));
  }
  
  store.set('gender', genderId);
  
  // Re-render to show/hide hormonal option
  router.navigate('onboarding/about');
};

window.setHormonalTracking = function(value) {
  store.set('hormonalTracking', value);
  // Update UI without full re-render
  document.querySelectorAll('#hormonal-option .radio-option').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.classList.add('selected');
};

window.saveAbout = function() {
  const ageInput = document.getElementById('user-age');
  const age = ageInput.value ? parseInt(ageInput.value) : null;
  
  store.set('age', age);
  router.navigate('onboarding/body');
};
