/**
 * goal-setup.js — Strategic goal and programme selection
 *
 * 14 May 2026 v1
 *
 * v1.1 — navigate to checkin not today (today.js no longer exists)
 *
 * This view runs immediately after onboarding/complete.
 * The user picks their primary goal, commits to a weekly session count,
 * and chooses a programme.
 *
 * Route: onboarding/goal-setup
 * File location: js/views/onboarding/goal-setup.js
 * Import paths use ../../  (two levels up from onboarding/)
 */

import { store }           from '../../store.js';
import { programmeEngine } from '../../data/programmeEngine.js';
import { PROGRAMMES, getProgrammesForGoals } from '../../data/programmes.js';
import { GOALS }           from '../../data/goals.js';

export const centered = false;

// Local state for this view — does not persist until confirmation
let selectedGoalId       = null;
let selectedSessions     = 3;
let selectedProgrammeId  = null;
let currentStep          = 1; // 1 = goal, 2 = sessions, 3 = programme, 4 = confirm

export function render() {
  // Pre-select from onboarding goals if possible
  const onboardingGoals = store.get('goals') || [];
  if (!selectedGoalId && onboardingGoals.length > 0) {
    selectedGoalId = onboardingGoals[0];
  }

  const name = store.get('name') || 'there';

  return `
    <div class="onboarding-view" id="goal-setup-view">

      <div class="onboarding-header">
        <div class="progress-dots">
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot completed"></span>
          <span class="dot active"></span>
        </div>
      </div>

      <div class="onboarding-content" id="goal-setup-content">
        ${renderStep(name)}
      </div>

      <div class="onboarding-actions" id="goal-setup-actions">
        ${renderActions()}
      </div>

    </div>
  `;
}

export function onMount() {
  // nothing — all handlers are window.* globals
}

// ─── STEP RENDERER ───────────────────────────────────────────────────────────

function renderStep(name) {
  switch (currentStep) {
    case 1: return renderGoalStep(name);
    case 2: return renderSessionsStep(name);
    case 3: return renderProgrammeStep();
    case 4: return renderConfirmStep(name);
    default: return renderGoalStep(name);
  }
}

function renderActions() {
  if (currentStep === 4) {
    return `
      <button class="btn btn-primary btn-large btn-full" onclick="goalSetupConfirm()">
        Start my programme
      </button>
      <button class="btn btn-ghost" onclick="goalSetupBack()" style="margin-top: 8px; width: 100%;">
        ← Change something
      </button>
    `;
  }
  const isFirstStep = currentStep === 1;
  const isLastStep  = currentStep === 3;
  return `
    ${!isFirstStep ? `<button class="btn btn-ghost" onclick="goalSetupBack()" style="margin-bottom:8px;width:100%">← Back</button>` : ''}
    <button class="btn btn-primary btn-large btn-full" onclick="goalSetupNext()" id="goal-setup-next-btn">
      ${isLastStep ? 'Review my plan →' : 'Continue →'}
    </button>
    ${isFirstStep ? `<button class="btn btn-ghost" style="margin-top:8px;width:100%" onclick="goalSetupSkip()">Skip for now</button>` : ''}
  `;
}

// ─── STEP 1 — Primary goal ───────────────────────────────────────────────────

function renderGoalStep(name) {
  const goals = GOALS;
  const onboardingGoals = store.get('goals') || [];

  return `
    <h1>What's your main focus, ${name}?</h1>
    <p class="text-secondary">I'll build your 12-week plan around this. Pick the one that matters most right now.</p>

    <div class="goal-grid" role="group" aria-label="Select your primary goal">
      ${goals.map(g => `
        <button
          class="goal-card ${selectedGoalId === g.id ? 'selected' : ''} ${onboardingGoals.includes(g.id) ? 'onboarding-match' : ''}"
          onclick="goalSetupSelectGoal('${g.id}')"
          aria-pressed="${selectedGoalId === g.id}"
          aria-label="${g.name}">
          <span class="goal-card-icon">${g.icon}</span>
          <span class="goal-card-name">${g.name}</span>
          ${onboardingGoals.includes(g.id) ? '<span class="goal-card-tag">from your goals</span>' : ''}
        </button>
      `).join('')}
    </div>
  `;
}

// ─── STEP 2 — Weekly session commitment ──────────────────────────────────────

function renderSessionsStep(name) {
  const options = [
    { value: 2, label: '2 sessions',  desc: 'Steady and sustainable'   },
    { value: 3, label: '3 sessions',  desc: 'The sweet spot for most people' },
    { value: 4, label: '4 sessions',  desc: 'Committed — with room to adapt' },
    { value: 5, label: '5 sessions',  desc: 'Ambitious — listen to your body' }
  ];

  return `
    <h1>How often can you realistically move each week?</h1>
    <p class="text-secondary">Be honest with yourself — this sets your weekly target. You can always do more on good weeks.</p>

    <div class="session-options" role="group" aria-label="Weekly session commitment">
      ${options.map(o => `
        <button
          class="session-option ${selectedSessions === o.value ? 'selected' : ''}"
          onclick="goalSetupSelectSessions(${o.value})"
          aria-pressed="${selectedSessions === o.value}">
          <span class="session-option-label">${o.label} a week</span>
          <span class="session-option-desc">${o.desc}</span>
        </button>
      `).join('')}
    </div>

    <p class="text-sm text-muted" style="margin-top: var(--space-4); text-align: center;">
      💡 3 sessions a week is the evidence-backed minimum for building a lasting habit
    </p>
  `;
}

// ─── STEP 3 — Programme selection ────────────────────────────────────────────

function renderProgrammeStep() {
  const onboardingGoals  = store.get('goals') || [];
  const relevantGoals    = selectedGoalId ? [selectedGoalId, ...onboardingGoals] : onboardingGoals;
  const suggestions      = getProgrammesForGoals(relevantGoals);

  // Default selection to first suggestion if none chosen
  if (!selectedProgrammeId && suggestions.length > 0) {
    selectedProgrammeId = suggestions[0].id;
  }

  return `
    <h1>Your 12-week plan</h1>
    <p class="text-secondary">I've picked the best match for your goal. You can switch if you prefer something different.</p>

    <div class="programme-list" role="group" aria-label="Choose your programme">
      ${suggestions.map(p => `
        <button
          class="programme-card ${selectedProgrammeId === p.id ? 'selected' : ''}"
          onclick="goalSetupSelectProgramme('${p.id}')"
          aria-pressed="${selectedProgrammeId === p.id}">
          <div class="programme-card-header">
            <span class="programme-card-icon">${p.icon}</span>
            <div class="programme-card-titles">
              <div class="programme-card-name">${p.name}</div>
              <div class="programme-card-tagline">${p.tagline}</div>
            </div>
            ${selectedProgrammeId === p.id ? '<span class="programme-card-check" aria-hidden="true">✓</span>' : ''}
          </div>
          <p class="programme-card-desc">${p.description}</p>
          <div class="programme-card-meta">
            <span>12 weeks</span>
            <span>·</span>
            <span>${p.weeklySessions} sessions/week target</span>
          </div>
          <div class="programme-phases">
            ${p.phases.map(ph => `
              <div class="phase-pill">${ph.label}</div>
            `).join('<span class="phase-arrow">→</span>')}
          </div>
        </button>
      `).join('')}
    </div>
  `;
}

// ─── STEP 4 — Confirm ────────────────────────────────────────────────────────

function renderConfirmStep(name) {
  const programme  = PROGRAMMES.find(p => p.id === selectedProgrammeId);
  const goal       = GOALS.find(g => g.id === selectedGoalId);
  const targetDesc = store.get('targetDescription') || '';
  const targetDate = store.get('targetDate')        || '';

  let targetText = '';
  if (targetDesc) {
    targetText = targetDesc;
    if (targetDate) targetText += ` (${formatDate(targetDate)})`;
  }

  return `
    <div class="confirm-icon">🎯</div>
    <h1>Here's your plan, ${name}</h1>
    <p class="text-secondary">This is what we're building toward. Every session connects to this.</p>

    <div class="confirm-card card">
      <div class="confirm-row">
        <span class="confirm-label">Primary goal</span>
        <span class="confirm-value">${goal ? goal.icon + ' ' + goal.name : '—'}</span>
      </div>
      ${targetText ? `
      <div class="confirm-row">
        <span class="confirm-label">Target</span>
        <span class="confirm-value">${targetText}</span>
      </div>` : ''}
      <div class="confirm-row">
        <span class="confirm-label">Programme</span>
        <span class="confirm-value">${programme ? programme.icon + ' ' + programme.name : '—'}</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">Duration</span>
        <span class="confirm-value">12 weeks</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">Weekly target</span>
        <span class="confirm-value">${selectedSessions} sessions</span>
      </div>
    </div>

    <div class="coach-message-card card card-coach" style="margin-top: var(--space-4);">
      <img src="assets/images/logo-icon-small.png" alt="Coach" class="coach-message-icon">
      <div class="coach-message-text">
        <p>${programme ? programme.phases[0].coachMessage : 'Let\'s get started.'}</p>
        <p class="text-muted" style="margin-top: var(--space-2);">Your first session sets the habit. Let's go.</p>
      </div>
    </div>
  `;
}

// ─── GLOBAL EVENT HANDLERS ───────────────────────────────────────────────────

window.goalSetupSelectGoal = function(goalId) {
  selectedGoalId = goalId;
  // Reset programme selection when goal changes
  selectedProgrammeId = null;
  refreshContent();
};

window.goalSetupSelectSessions = function(count) {
  selectedSessions = count;
  refreshContent();
};

window.goalSetupSelectProgramme = function(programmeId) {
  selectedProgrammeId = programmeId;
  refreshContent();
};

window.goalSetupNext = function() {
  if (currentStep === 1 && !selectedGoalId) {
    showError('Please pick a goal to continue');
    return;
  }
  if (currentStep === 3 && !selectedProgrammeId) {
    showError('Please choose a programme');
    return;
  }
  currentStep = Math.min(currentStep + 1, 4);
  refreshContent();
  window.scrollTo(0, 0);
};

window.goalSetupBack = function() {
  currentStep = Math.max(currentStep - 1, 1);
  refreshContent();
  window.scrollTo(0, 0);
};

window.goalSetupConfirm = function() {
  if (!selectedProgrammeId || !selectedGoalId) {
    showError('Something went wrong — please go back and check your selections');
    return;
  }

  // Read target details from onboarding store data
  const targetDescription = store.get('targetDescription') || '';
  const targetDate        = store.get('targetDate')        || null;
  const targetWeight      = store.get('targetWeight')      || null;
  const weightUnit        = store.get('weightUnit')        || 'kg';

  const success = programmeEngine.startProgramme(selectedProgrammeId, {
    primaryGoal:         selectedGoalId,
    targetDescription,
    targetDate,
    targetValue:         targetWeight,
    targetUnit:          weightUnit,
    weeklySessionTarget: selectedSessions
  });

  if (success) {
    // Show bottom nav and go to today
    document.getElementById('bottom-nav')?.classList.remove('hidden');
    router.navigate('checkin');
  } else {
    showError('Could not start programme — please try again');
  }
};

window.goalSetupSkip = function() {
  // User skips goal setup — go straight to today without a programme
  document.getElementById('bottom-nav')?.classList.remove('hidden');
  router.navigate('checkin');
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function refreshContent() {
  const name    = store.get('name') || 'there';
  const content = document.getElementById('goal-setup-content');
  const actions = document.getElementById('goal-setup-actions');
  if (content) content.innerHTML = renderStep(name);
  if (actions) actions.innerHTML = renderActions();
}

function showError(msg) {
  // Re-use existing toast if available, otherwise alert
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  } else {
    alert(msg);
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}
