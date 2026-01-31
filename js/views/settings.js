/**
 * settings.js - Settings view
 */

import { store } from '../store.js';
import { getGoalName } from '../data/goals.js';
import { getConditionName } from '../data/conditions.js';

export const centered = false;

export function render() {
  const name = store.get('name');
  const age = store.get('age');
  const gender = store.get('gender');
  const weight = store.get('weight');
  const weightUnit = store.get('weightUnit') || 'kg';
  const goals = store.get('goals') || [];
  const conditions = store.get('conditions') || [];
  const equipment = store.get('equipment') || [];
  
  return `
    <div class="view">
      <div class="view-header">
        <h1>Settings</h1>
      </div>
      
      <div class="card-list">
        <div class="card">
          <h3>Profile</h3>
          <div class="settings-row">
            <span class="settings-label">Name:</span>
            <span class="settings-value">${name || 'Not set'}</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Age:</span>
            <span class="settings-value">${age || 'Not set'}</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Gender:</span>
            <span class="settings-value">${formatGender(gender)}</span>
          </div>
          <div class="settings-row">
            <span class="settings-label">Weight:</span>
            <span class="settings-value">${weight ? weight + weightUnit : 'Not set'}</span>
          </div>
        </div>
        
        <div class="card">
          <h3>Goals</h3>
          <div class="settings-row">
            <span class="settings-label">Selected:</span>
            <span class="settings-value">${goals.length} goals</span>
          </div>
          <p class="text-sm text-secondary" style="margin-top: var(--space-2);">
            ${goals.map(g => getGoalName(g)).join(', ') || 'None set'}
          </p>
        </div>
        
        <div class="card">
          <h3>Conditions</h3>
          <div class="settings-row">
            <span class="settings-label">Tracking:</span>
            <span class="settings-value">${conditions.length} areas</span>
          </div>
          <p class="text-sm text-secondary" style="margin-top: var(--space-2);">
            ${conditions.map(c => getConditionName(c)).join(', ') || 'None'}
          </p>
        </div>
        
        <div class="card">
          <h3>Equipment</h3>
          <div class="settings-row">
            <span class="settings-label">Available:</span>
            <span class="settings-value">${equipment.length > 0 ? equipment.length + ' items' : 'Bodyweight only'}</span>
          </div>
        </div>
        
        <button class="btn btn-danger btn-full" onclick="resetApp()" style="margin-top: var(--space-4);">
          Reset App (Start Over)
        </button>
      </div>
    </div>
  `;
}

function formatGender(gender) {
  const genderMap = {
    'female': 'Female',
    'male': 'Male',
    'non-binary': 'Non-binary',
    'prefer-not': 'Prefer not to say'
  };
  return genderMap[gender] || 'Not set';
}

window.resetApp = function() {
  if (confirm('This will delete all your data and start fresh. Are you sure?')) {
    store.reset();
    document.getElementById('bottom-nav').classList.add('hidden');
    router.navigate('onboarding/welcome');
  }
};
