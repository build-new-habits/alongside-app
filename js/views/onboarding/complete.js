/**
 * complete.js - Onboarding Step 9: Summary and start
 *
 * v1.1 — Option A: "Let's go!" now routes to onboarding/goal-setup
 * instead of directly to today. Goal setup is the final onboarding step.
 *
 * File location: js/views/onboarding/complete.js
 */

import { store } from '../../store.js';
import { getGoalName } from '../../data/goals.js';

export const centered = true;

export function render() {
  const name            = store.get('name');
  const ageBand         = store.get('ageBand');

  // Format age band for display
  const AGE_BAND_LABELS = {
    'under-18':   'Under 18',
    '18-24':      '18 - 24',
    '25-34':      '25 - 34',
    '35-44':      '35 - 44',
    '45-54':      '45 - 54',
    '55-64':      '55 - 64',
    '65+':        '65 and over',
    'prefer-not': 'Prefer not to say'
  };
  const ageBandLabel = ageBand ? (AGE_BAND_LABELS[ageBand] || ageBand) : 'Not set';
  const weight          = store.get('weight');
  const weightUnit      = store.get('weightUnit') || 'kg';
  const targetWeight    = store.get('targetWeight');
  const targetDescription = store.get('targetDescription');
  const targetDate      = store.get('targetDate');
  const goals           = store.get('goals') || [];
  const equipment       = store.get('equipment') || [];

  // Build target text
  let targetText = 'No specific target set';
  if (targetDescription) {
    targetText = targetDescription;
    if (targetDate) targetText += ` (${formatDate(targetDate)})`;
  } else if (targetWeight) {
    targetText = `Reach ${targetWeight}${weightUnit}`;
    if (targetDate) targetText += ` by ${formatDate(targetDate)}`;
  }

  const goalsText = goals.map(g => getGoalName(g)).join(', ') || 'None selected';

  return `
    <div class="onboarding-view">
      <div class="onboarding-content">

        <div class="coach-greeting">
          <div class="completion-icon">🎉</div>
          <h1>Almost there, ${name}!</h1>
          <p class="lead">Your profile is set. One more step — we'll build your 12-week plan together.</p>
        </div>

        <div class="coach-message-card card card-coach">
          <img src="assets/images/logo-icon-small.png" alt="Coach" class="coach-message-icon">
          <div class="coach-message-text">
            <p>Each day, I'll check in with you and suggest movement that matches how you're feeling.</p>
            <p class="text-muted">No pressure. No judgment. Just support.</p>
          </div>
        </div>

        <div class="summary-card card">
          <h3>Your profile</h3>
          <div class="summary-row">
            <span class="summary-label">Age group:</span>
            <span class="summary-value">${ageBandLabel}</span>
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
        <button class="btn btn-primary btn-large btn-full" onclick="proceedToGoalSetup()">
          Build my plan →
        </button>
      </div>
    </div>
  `;
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

window.proceedToGoalSetup = function() {
  // Mark profile onboarding complete, then proceed to goal setup
  store.completeOnboarding();
  router.navigate('onboarding/goal-setup');
};
