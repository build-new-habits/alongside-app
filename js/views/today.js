/**
 * today.js - Today View
 * Shows check-in prompt or generated workout options
 *
 * v1.2 — Programme phase banner:
 *   When a programme is active, a soft teal banner is shown between the
 *   check-in summary and workout options. It shows the current phase name
 *   and the phase coaching message from the programme template.
 *   This makes the strategic layer visible to the user day-to-day.
 */

import { store }           from '../store.js';
import { checkinData }     from '../data/checkin.js';
import { workoutGenerator } from '../data/workoutGenerator.js';
import { programmeEngine } from '../data/programmeEngine.js';
import { getZoneStatus }   from '../data/conditions.js';

export const centered = false;

export function render() {
  const name         = store.get('name') || 'there';
  const hasCheckedIn = checkinData.hasCheckedInToday();

  if (!hasCheckedIn) {
    return renderCheckinPrompt(name);
  } else {
    return renderTodaysDashboard(name);
  }
}

function renderCheckinPrompt(name) {
  const greeting = getTimeGreeting();
  const burnout  = checkinData.detectBurnout();

  return `
    <div class="view">
      <div class="view-header">
        <h1>${greeting}, ${name} 👋</h1>
        <p class="text-secondary">Let's check in before we plan your session.</p>
      </div>

      ${burnout.level !== 'none' ? `
        <div class="card card-warning" role="note">
          <div class="warning-content">
            <span class="warning-icon" aria-hidden="true">💛</span>
            <p>${burnout.message}</p>
          </div>
        </div>
      ` : ''}

      <div class="card card-coach">
        <img src="assets/images/logo-icon-small.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div class="coach-prompt-content">
          <p><strong>Ready to check in?</strong></p>
          <p class="text-secondary">It only takes 30 seconds, and helps me suggest the right workout for today.</p>
        </div>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="start-checkin-btn" style="margin-top: var(--space-4);">
        Start Check-In
      </button>

      ${renderRecentHistory()}
    </div>
  `;
}

function renderTodaysDashboard(name) {
  const todaysCheckin = checkinData.getTodaysCheckin();
  const intensity     = store.get('todayIntensity') || 'moderate';
  const burnout       = checkinData.detectBurnout();
  const workouts      = workoutGenerator.getTodaysWorkouts();

  const intensityDisplay = {
    recovery:    { label: 'Recovery',    color: 'purple', message: 'Focus on gentle movement and rest.' },
    gentle:      { label: 'Gentle',      color: 'green',  message: 'Light activity without strain.' },
    moderate:    { label: 'Moderate',    color: 'teal',   message: 'A solid, balanced session.' },
    challenging: { label: 'Challenging', color: 'orange', message: "Push yourself — you've got the energy!" }
  };

  const display = intensityDisplay[intensity] || intensityDisplay.moderate;

  return `
    <div class="view">

      <div class="view-header">
        <h1>Today's Plan</h1>
        <p class="text-secondary">${formatDate(new Date())}</p>
      </div>

      <!-- ── Check-in summary ───────────────────────────────────────────── -->
      <div class="card checkin-summary-card">
        <div class="checkin-summary-header">
          <h3>Your Check-In</h3>
          <button class="btn btn-ghost btn-small" id="update-checkin-btn" aria-label="Update today's check-in">Update</button>
        </div>
        <div class="checkin-summary-stats">
          <div class="stat">
            <span class="stat-emoji" aria-hidden="true">${checkinData.getEnergyEmoji(todaysCheckin.energy)}</span>
            <span class="stat-label">Energy</span>
            <span class="stat-value">${todaysCheckin.energy}/10</span>
          </div>
          <div class="stat">
            <span class="stat-emoji" aria-hidden="true">${checkinData.getMoodEmoji(todaysCheckin.mood)}</span>
            <span class="stat-label">Mood</span>
            <span class="stat-value">${todaysCheckin.mood}/10</span>
          </div>
          <div class="stat">
            <span class="stat-emoji" aria-hidden="true">😴</span>
            <span class="stat-label">Sleep</span>
            <span class="stat-value">${todaysCheckin.sleepHours}h</span>
          </div>
        </div>
      </div>

      <!-- ── Programme phase banner ─────────────────────────────────────── -->
      ${renderPhaseBanner()}
      ${renderSevereZoneMessage()}

      <!-- ── Coach recommendation ───────────────────────────────────────── -->
      <div class="card card-coach">
        <img src="assets/images/logo-icon-small.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div class="recommendation-content">
          <div class="intensity-badge ${intensity}" aria-label="Today's intensity: ${display.label}">
            ${getIntensityIcon(intensity)} ${display.label}
          </div>
          <p>${display.message}</p>
          ${burnout.level !== 'none' ? `
            <p class="text-sm text-muted">${burnout.reasons.join('. ')}.</p>
          ` : ''}
        </div>
      </div>

      <!-- ── Workout options ────────────────────────────────────────────── -->
      <div class="workout-options">
        <h2>Today's Options</h2>
        <p class="text-secondary">Choose what feels right:</p>

        ${workouts.map((workout, index) => renderWorkoutCard(workout, index)).join('')}
      </div>

    </div>
  `;
}

/**
 * Phase banner — shown when a programme is active.
 * Reads the current phase's coaching message from programmeEngine.
 * Returns empty string if no programme is active.
 */

/**
 * Render a coach message when a body zone is severely impacted.
 *
 * If lower-limb AND spine are both severe → combined rest day message.
 * Otherwise each severe zone gets a targeted message.
 * Systemic conditions (chronic fatigue, anxiety etc) get their own message.
 * If no severe zones → returns empty string.
 */
function renderSevereZoneMessage() {
  const savedCheckin   = store.get('lastCheckin') || {};
  const conditions     = store.get('conditions') || [];
  const painScores     = store.get('conditionPainScores') || {};
  const zoneStatus     = getZoneStatus(conditions, painScores);

  const hasSevere = Object.values(zoneStatus).some(v => v === 'severe');
  if (!hasSevere) return '';

  // Combined severe (lower-limb + spine) → rest day message
  if (zoneStatus.combinedSevere) {
    return `
      <div class="severe-zone-banner combined-rest" role="note" aria-label="Rest day recommended">
        <span class="severe-zone-icon" aria-hidden="true">🛌</span>
        <div class="severe-zone-body">
          <span class="severe-zone-label">Rest day recommended</span>
          <p class="severe-zone-message">With both your lower body and spine under significant strain, today is about rest — not exercise. Breathing, mindfulness, and a slow mindful walk if you feel up to it. That's more than enough.</p>
        </div>
      </div>`;
  }

  // Zone-specific messages
  const messages = {
    'lower-limb': {
      icon: '🦵',
      label: 'Lower body — take it easy today',
      text: 'Your legs and hips need protection right now. Upper body, breathing, and gentle seated work are all still available. A slow mindful walk is an option if it feels right — no targets, no distance.'
    },
    'spine': {
      icon: '🔙',
      label: 'Spine — careful movement only',
      text: 'With significant back pain today, we\'re keeping things very gentle. Upper body work in supported positions, breathing, and mindfulness are your safest options. Listen closely to what your body is telling you.'
    },
    'upper-limb': {
      icon: '💪',
      label: 'Upper body — lower body is still yours',
      text: 'Your arms or shoulders need rest today — but your legs, core, and cardiovascular system are all available. Walking, lower body strength, and breathing work are all on the table.'
    },
    'systemic': {
      icon: '💙',
      label: 'Go gently with yourself today',
      text: 'When the whole system is under strain, gentle is the only speed. Breathing, mindfulness, and slow movement are genuinely enough. Showing up for a few minutes is a win.'
    },
  };

  const parts = [];
  for (const [zone, severity] of Object.entries(zoneStatus)) {
    if (zone === 'combinedSevere' || severity !== 'severe') continue;
    const msg = messages[zone];
    if (!msg) continue;
    parts.push(`
      <div class="severe-zone-banner" role="note" aria-label="${msg.label}">
        <span class="severe-zone-icon" aria-hidden="true">${msg.icon}</span>
        <div class="severe-zone-body">
          <span class="severe-zone-label">${msg.label}</span>
          <p class="severe-zone-message">${msg.text}</p>
        </div>
      </div>`);
  }

  return parts.join('\n');
}

function renderPhaseBanner() {
  const ap = store.get('activeProgramme');
  if (!ap?.programmeId || !ap?.currentPhase) return '';

  const stats = programmeEngine.getProgressStats();
  if (!stats) return '';

  // Phase coaching messages (from programme templates via engine)
  const phaseMessage = programmeEngine.getCurrentPhaseMessage?.() || null;
  if (!phaseMessage) return '';

  const phaseIcons = {
    build:    '🌱',
    push:     '💪',
    peak:     '🔥',
    recovery: '🧘'
  };

  const icon = phaseIcons[ap.currentPhase] || '📍';
  const label = `Week ${stats.currentWeek} · ${ap.currentPhase.charAt(0).toUpperCase() + ap.currentPhase.slice(1)} phase`;

  return `
    <div class="phase-banner" role="note" aria-label="${label}: ${phaseMessage}">
      <span class="phase-banner-icon" aria-hidden="true">${icon}</span>
      <div class="phase-banner-body">
        <span class="phase-banner-label">${label}</span>
        <p class="phase-banner-message">${phaseMessage}</p>
      </div>
    </div>
  `;
}

function renderWorkoutCard(workout, index) {
  return `
    <div class="card workout-option-card" data-workout-index="${index}">
      <div class="option-header">
        <span class="option-icon" aria-hidden="true">${workout.icon}</span>
        <div class="option-info">
          <h4>${workout.name}</h4>
          <p class="text-sm text-muted">${workout.duration} mins · ${workout.exerciseCount} exercises</p>
        </div>
        <span class="option-credits" aria-label="${workout.totalCredits} credits">+${workout.totalCredits} ⭐</span>
      </div>

      <p class="workout-rationale">${workout.rationale}</p>

      <div class="exercise-full-list" aria-label="Exercise list">
        ${workout.exercises.map(e => `
          <div class="exercise-list-row">
            <span class="exercise-list-name">${e.name}</span>
            <span class="exercise-list-prescription">
              ${e.duration
                ? `${e.sets > 1 ? e.sets + ' × ' : ''}${formatExerciseDuration(e.duration)}`
                : `${e.sets || 3} × ${e.reps || 10} reps`}
            </span>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-primary btn-full workout-start-btn" data-workout-index="${index}"
              aria-label="Start ${workout.name}">
        Start Workout
      </button>
    </div>
  `;
}

function renderRecentHistory() {
  const history = checkinData.getHistory(5);

  if (history.length === 0) {
    return `
      <div class="card" style="margin-top: var(--space-6);">
        <h3>Your Recent Check-Ins</h3>
        <p class="text-sm text-muted">No check-ins yet. Start your first one above!</p>
      </div>
    `;
  }

  return `
    <div class="card" style="margin-top: var(--space-6);">
      <h3>Your Recent Check-Ins</h3>
      <div class="history-mini" aria-label="Recent check-in history">
        ${history.map(day => `
          <div class="history-day">
            <span class="history-date">${formatShortDate(day.date)}</span>
            <span class="history-emoji" aria-hidden="true">${checkinData.getEnergyEmoji(day.energy)}</span>
            <span class="history-value" aria-label="Energy ${day.energy}">${day.energy}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}


/**
 * Format exercise duration for display in workout cards.
 * Shows seconds for short durations, minutes for longer ones.
 * Both must be consistent: individual exercise times and workout total must agree.
 *
 * < 60s  → "45s"
 * 60s    → "1 min"
 * 90s    → "1m 30s"
 * 120s   → "2 mins"
 * 1800s  → "30 mins"
 */
function formatExerciseDuration(seconds) {
  if (!seconds) return '';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return mins === 1 ? '1 min' : `${mins} mins`;
  return `${mins}m ${secs}s`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day:     'numeric',
    month:   'long'
  });
}

function formatShortDate(dateString) {
  const date      = new Date(dateString);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateString === today.toISOString().split('T')[0])     return 'Today';
  if (dateString === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { weekday: 'short' });
}

function getIntensityIcon(intensity) {
  return { recovery: '🧘', gentle: '🌱', moderate: '💪', challenging: '🔥' }[intensity] || '💪';
}

export function onMount() {
  document.getElementById('start-checkin-btn')?.addEventListener('click', () => {
    router.navigate('checkin');
  });

  document.getElementById('update-checkin-btn')?.addEventListener('click', () => {
    router.navigate('checkin');
  });

  document.querySelectorAll('.workout-start-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const index   = parseInt(e.currentTarget.dataset.workoutIndex);
      const workouts = store.get('todaysWorkouts');
      if (workouts?.[index]) {
        store.set('activeWorkout', workouts[index]);
        router.navigate('workout');
      }
    });
  });
}
