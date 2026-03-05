/**
 * progress.js - Progress Dashboard
 *
 * Reads from:
 *   programmeEngine.getProgressStats() — programme counters, phase, % complete
 *   store('workoutHistory')            — recent sessions list
 *   store('activeProgramme.milestones')— achieved milestones
 *
 * Sections:
 *   1. Programme overview (week, phase, total sessions, progress bar)
 *   2. This week (session dot row, average energy)
 *   3. Recent sessions (last 7)
 *   4. Milestones timeline
 *
 * Fallback: no-programme state with CTA to goal-setup, still shows workout history
 */

import { store } from '../store.js';
import { programmeEngine } from '../data/programmeEngine.js';

export const centered = false;

export function render() {
  const stats      = programmeEngine.getProgressStats();
  const history    = store.get('workoutHistory') || [];
  const ap         = store.get('activeProgramme');
  const milestones = ap?.milestones || [];

  if (!stats) {
    return renderNoProgramme(history);
  }

  return `
    <div class="view progress-view">

      <div class="view-header">
        <h1>Your Progress</h1>
        <p class="text-secondary">${stats.programmeName}</p>
      </div>

      <section class="progress-section" aria-labelledby="overview-heading">
        <h2 id="overview-heading" class="section-heading">Programme overview</h2>
        <div class="card progress-overview-card">

          <div class="progress-meta-row">
            <div class="progress-meta-item">
              <span class="progress-meta-value">${stats.currentWeek}</span>
              <span class="progress-meta-label">of ${stats.totalWeeks} weeks</span>
            </div>
            <div class="progress-meta-item">
              <span class="progress-meta-value">${stats.currentPhase}</span>
              <span class="progress-meta-label">current phase</span>
            </div>
            <div class="progress-meta-item">
              <span class="progress-meta-value">${stats.totalSessions}</span>
              <span class="progress-meta-label">sessions done</span>
            </div>
          </div>

          <div class="progress-bar-wrapper"
               aria-label="Programme ${stats.pctComplete}% complete">
            <div class="progress-bar-track"
                 role="progressbar"
                 aria-valuenow="${stats.pctComplete}"
                 aria-valuemin="0"
                 aria-valuemax="100">
              <div class="progress-bar-fill" style="width: ${stats.pctComplete}%"></div>
            </div>
            <span class="progress-bar-label">${stats.pctComplete}% complete</span>
          </div>

          ${stats.daysUntilTarget != null ? `
            <p class="progress-target-hint text-secondary">
              ${stats.daysUntilTarget > 0
                ? `${stats.daysUntilTarget} days until your target date`
                : 'Target date reached — great work!'}
            </p>
          ` : ''}

        </div>
      </section>

      <section class="progress-section" aria-labelledby="thisweek-heading">
        <h2 id="thisweek-heading" class="section-heading">This week</h2>
        <div class="card">

          <div class="week-sessions-row"
               aria-label="${stats.sessionsThisWeek} of ${stats.weeklyTarget} sessions this week">
            ${renderWeekDots(stats.sessionsThisWeek, stats.weeklyTarget)}
          </div>

          <p class="week-sessions-label text-secondary">
            ${stats.sessionsThisWeek} of ${stats.weeklyTarget} sessions
            ${stats.sessionsThisWeek >= stats.weeklyTarget ? '— week target hit! ✨' : ''}
          </p>

          ${stats.avgEnergy != null ? `
            <div class="avg-energy-row">
              <span class="avg-energy-label text-secondary">Average energy (last 7 sessions):</span>
              <span class="avg-energy-value">${stats.avgEnergy} / 10</span>
            </div>
          ` : ''}

        </div>
      </section>

      <section class="progress-section" aria-labelledby="recent-heading">
        <h2 id="recent-heading" class="section-heading">Recent sessions</h2>
        ${history.length === 0
          ? `<div class="card"><p class="text-secondary">No sessions yet — your first will appear here.</p></div>`
          : renderRecentSessions(history)}
      </section>

      <section class="progress-section" aria-labelledby="milestones-heading">
        <h2 id="milestones-heading" class="section-heading">Milestones</h2>
        ${milestones.length === 0
          ? `<div class="card"><p class="text-secondary">Keep going — your first milestone is coming.</p></div>`
          : renderMilestones(milestones)}
      </section>

    </div>
  `;
}

function renderWeekDots(done, target) {
  const dots = [];
  for (let i = 0; i < target; i++) {
    const filled = i < done;
    dots.push(`
      <span class="week-dot ${filled ? 'week-dot--done' : 'week-dot--empty'}"
            aria-hidden="true"></span>
    `);
  }
  return `<div class="week-dots">${dots.join('')}</div>`;
}

function renderRecentSessions(history) {
  const rows = history.slice(-7).reverse().map(session => {
    const dateStr    = new Date(session.completedAt).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short'
    });
    const focusLabel = session.focus
      ? session.focus.charAt(0).toUpperCase() + session.focus.slice(1)
      : 'Workout';

    return `
      <li class="session-row">
        <div class="session-row-left">
          <span class="session-focus-badge session-focus--${session.focus || 'general'}">${focusLabel}</span>
          <span class="session-name">${session.name || 'Session'}</span>
        </div>
        <div class="session-row-right">
          <span class="session-date text-secondary">${dateStr}</span>
          <span class="session-credits">+${session.creditsEarned || 0} ⭐</span>
        </div>
      </li>
    `;
  }).join('');

  return `<ul class="session-list card" aria-label="Recent sessions">${rows}</ul>`;
}

function renderMilestones(milestones) {
  const items = [...milestones].reverse().map(m => {
    const dateStr = new Date(m.achievedAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    return `
      <li class="milestone-row">
        <span class="milestone-icon" aria-hidden="true">🏅</span>
        <div class="milestone-row-body">
          <span class="milestone-label">${m.label}</span>
          <span class="milestone-date text-secondary">${dateStr}</span>
        </div>
      </li>
    `;
  }).join('');

  return `<ul class="milestone-list card" aria-label="Achieved milestones">${items}</ul>`;
}

function renderNoProgramme(history) {
  return `
    <div class="view progress-view">

      <div class="view-header">
        <h1>Your Progress</h1>
      </div>

      <div class="card card-coach">
        <p>You haven't started a programme yet.</p>
        <p class="text-secondary">Set a goal to unlock your progress dashboard and milestone tracking.</p>
        <button class="btn btn-primary" onclick="router.navigate('onboarding/goal-setup')">
          Set a goal →
        </button>
      </div>

      ${history.length > 0 ? `
        <section class="progress-section" aria-labelledby="workouts-done-heading">
          <h2 id="workouts-done-heading" class="section-heading">Workouts completed</h2>
          ${renderRecentSessions(history)}
        </section>
      ` : ''}

    </div>
  `;
}

export function onMount() {
  // Read-only view — no event listeners needed yet
}
