/**
 * lifestyle.js - Onboarding Step 7: Activity level, stress, sleep
 */

import { store } from '../../store.js';

export const centered = false;

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise, desk job' },
  { id: 'light', label: 'Lightly active', desc: 'Light exercise 1-2 days/week' },
  { id: 'moderate', label: 'Moderately active', desc: 'Exercise 3-4 days/week' },
  { id: 'active', label: 'Very active', desc: 'Hard exercise 5-6 days/week' }
];

const STRESS_LEVELS = [
  { id: 'low', label: 'Low' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'high', label: 'High' }
];

const SLEEP_QUALITIES = [
  { id: 'good', label: 'Good' },
  { id: 'okay', label: 'Okay' },
  { id: 'poor', label: 'Poor' }
];

export function render() {
  const lifestyle = store.get('lifestyle') || {};
  const activityLevel = lifestyle.activityLevel;
  const stressLevel = lifestyle.stressLevel;
  const sleepQuality = lifestyle.sleepQuality;
  
  return `
    <div class="onboarding-view">
      <div class="onboarding-header">
        <button class="btn btn-ghost" onclick="router.navigate('onboarding/conditions')">← Back</button>
        <div class="progress-dots">
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot active"></span>
          <span class="dot"></span>
        </div>
      </div>
      
      <div class="onboarding-content">
        <h1>Your lifestyle</h1>
        <p class="text-secondary">This helps me match workouts to your energy.</p>
        
        <div class="form-section">
          <label class="form-label">Current activity level</label>
          <div class="radio-group stacked">
            ${ACTIVITY_LEVELS.map(level => `
              <button class="btn-card radio-option stacked-option ${activityLevel === level.id ? 'selected' : ''}"
                      onclick="setLifestyle('activityLevel', '${level.id}')">
                <span class="option-label">${level.label}</span>
                <span class="option-desc">${level.desc}</span>
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="form-section">
          <label class="form-label">Stress level lately</label>
          <div class="radio-group horizontal">
            ${STRESS_LEVELS.map(level => `
              <button class="btn-card radio-option compact ${stressLevel === level.id ? 'selected' : ''}"
                      onclick="setLifestyle('stressLevel', '${level.id}')">
                ${level.label}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="form-section">
          <label class="form-label">Sleep quality</label>
          <div class="radio-group horizontal">
            ${SLEEP_QUALITIES.map(level => `
              <button class="btn-card radio-option compact ${sleepQuality === level.id ? 'selected' : ''}"
                      onclick="setLifestyle('sleepQuality', '${level.id}')">
                ${level.label}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-large btn-full" onclick="saveLifestyle()">
          Continue
        </button>
      </div>
    </div>
  `;
}

// Global functions
window.setLifestyle = function(field, value) {
  store.set(`lifestyle.${field}`, value);
  
  // Update UI - find the parent section and update selected states
  const section = event.target.closest('.form-section');
  section.querySelectorAll('.radio-option').forEach(btn => btn.classList.remove('selected'));
  event.target.classList.add('selected');
};

window.saveLifestyle = function() {
  router.navigate('onboarding/equipment');
};
