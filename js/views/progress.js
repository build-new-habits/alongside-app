/**
 * progress.js - Progress Dashboard
 *
 * v1.1 — Progress Layer 1: coach summary card
 *   buildProgressCoachMessage() assembles 1-2 coach-voice sentences from
 *   available session data. Coach card appears at the top of the view,
 *   above all data sections. Voice leads; numbers follow beneath.
 *   Graceful empty state if no sessions logged yet.
 *   Reads: workoutHistory, activeProgramme, name.
 *
 * Reads from:
 *   programmeEngine.getProgressStats()  -- programme counters, phase, pct
 *   store('workoutHistory')             -- recent sessions list
 *   store('activeProgramme.milestones') -- achieved milestones
 *
 * Renders:
 *   0. Coach summary card (new v1.1)
 *   1. Programme overview card (week / phase / % complete)
 *   2. This-week sessions bar
 *   3. Recent sessions list (last 7)
 *   4. Milestones timeline
 *   5. No-programme state (graceful fallback)
 */

import { store } from '../store.js';
import { programmeEngine } from '../data/programmeEngine.js';

export const centered = false;

export function render() {
  const stats    = programmeEngine.getProgressStats();
  const history  = store.get('workoutHistory') || [];
  const ap       = store.get('activeProgramme');
  const milestones = (ap?.milestones || []);
  const name     = store.get('name') || 'there';

  if (!stats) {
    return renderNoProgramme(history, name);
  }

  return `
    <div class="view progress-view">

      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <div class="view-header">
        <h1>Your Progress</h1>
        <p class="text-secondary">${stats.programmeName}</p>
      </div>

      <!-- ── 0. Coach summary card ─────────────────────────────────────── -->
      ${renderProgressCoachCard(history, stats, name)}

      <!-- ── 1. Programme overview ─────────────────────────────────────── -->
      <section class="progress-section" aria-labelledby="overview-heading">
        <h2 id="overview-heading" class="section-heading">Programme overview</h2>

        <div class="card progress-overview-card">

          <!-- Week / phase labels -->
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

          <!-- Overall progress bar -->
          <div class="progress-bar-wrapper" aria-label="Programme ${stats.pctComplete}% complete">
            <div class="progress-bar-track" role="progressbar"
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

      <!-- ── 2. This week ───────────────────────────────────────────────── -->
      <section class="progress-section" aria-labelledby="thisweek-heading">
        <h2 id="thisweek-heading" class="section-heading">This week</h2>

        <div class="card">
          <div class="week-sessions-row" aria-label="${stats.sessionsThisWeek} of ${stats.weeklyTarget} sessions this week">
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

      <!-- ── 3. Recent sessions ────────────────────────────────────────── -->
      <section class="progress-section" aria-labelledby="recent-heading">
        <h2 id="recent-heading" class="section-heading">Recent sessions</h2>

        ${history.length === 0
          ? `<div class="card"><p class="text-secondary">No sessions yet — your first will appear here.</p></div>`
          : renderRecentSessions(history)}
      </section>

      <!-- ── 4. Milestones ─────────────────────────────────────────────── -->
      <section class="progress-section" aria-labelledby="milestones-heading">
        <h2 id="milestones-heading" class="section-heading">Milestones</h2>

        ${milestones.length === 0
          ? `<div class="card"><p class="text-secondary">Keep going — your first milestone is coming.</p></div>`
          : renderMilestones(milestones)}
      </section>

    </div>
  `;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Dot row for weekly session target (filled vs empty circles)
 */
function renderWeekDots(done, target) {
  const dots = [];
  for (let i = 0; i < target; i++) {
    const filled = i < done;
    dots.push(`
      <span class="week-dot ${filled ? 'week-dot--done' : 'week-dot--empty'}"
            aria-hidden="true"
            title="${filled ? 'Session done' : 'Session remaining'}">
      </span>
    `);
  }
  return `<div class="week-dots">${dots.join('')}</div>`;
}

/**
 * Last 7 sessions as a simple list
 */
function renderRecentSessions(history) {
  const recent = history.slice(-7).reverse();

  const rows = recent.map(session => {
    const date = new Date(session.completedAt);
    const dateStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
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

/**
 * Milestones timeline — newest first
 */
function renderMilestones(milestones) {
  const sorted = [...milestones].reverse();

  const items = sorted.map(m => {
    const date = new Date(m.achievedAt);
    const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

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

/**
 * Fallback when no programme is active — still shows workout history if any.
 * Coach card leads with a warm message; data follows if sessions exist.
 */
function renderNoProgramme(history, name) {
  return `
    <div class="view progress-view">

      <div class="view-header">
        <h1>Your Progress</h1>
      </div>

      ${renderProgressCoachCard(history, null, name)}

      <div class="card">
        <p>You haven't started a programme yet.</p>
        <p class="text-secondary">Set a goal to unlock your progress dashboard and milestone tracking.</p>
        <button class="btn btn-primary" onclick="router.navigate('goal-setup')" aria-label="Set a goal">
          Set a goal
        </button>
      </div>

      ${history.length > 0 ? `
        <section class="progress-section" aria-labelledby="workouts-done-heading">
          <h2 id="workouts-done-heading" class="section-heading">Sessions completed</h2>
          ${renderRecentSessions(history)}
        </section>
      ` : ''}

    </div>
  `;
}

// ── Coach summary card ───────────────────────────────────────────────────────

/**
 * Render the coach summary card at the top of the Progress view.
 * Assembles 1-2 sentences from available session data.
 * Always renders -- empty state uses a warm first-session invitation.
 *
 * @param {Array}  history  - workoutHistory array from store
 * @param {Object|null} stats - programmeEngine.getProgressStats() result, or null
 * @param {string} name     - user's first name from store
 */
function renderProgressCoachCard(history, stats, name) {
  const message = buildProgressCoachMessage(history, stats, name);
  return `
    <div class="card card-coach" role="note" aria-label="Coach summary">
      <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-message-content">
        <p class="coach-message-text">${message}</p>
      </div>
    </div>
  `;
}

/**
 * Assemble a coach-voice summary from available progress data.
 * Rules:
 *   - Zero sessions: warm empty state, no pressure
 *   - 1-2 sessions: acknowledge they have started
 *   - 3+ sessions: note pattern, energy trend if available, next milestone or week context
 *   - Programme context added if stats available
 *
 * Returns a plain string (no HTML tags).
 */
function buildProgressCoachMessage(history, stats, name) {
  const total = history.length;
  const displayName = name && name !== "there" ? name : null;

  // ── Empty state ──────────────────────────────────────────────────────────
  if (total === 0) {
    if (displayName) {
      return `Your first session will appear here, ${displayName}. When you start moving, I will track what is working and let you know what I notice.`;
    }
    return "Your first session will appear here. When you start moving, I will track what is working and let you know what I notice.";
  }

  // ── Just getting started (1-2 sessions) ─────────────────────────────────
  if (total <= 2) {
    const plural = total === 1 ? "session" : "sessions";
    if (displayName) {
      return `You have completed ${total} ${plural} so far, ${displayName}. Every session is data I can use -- keep going and I will start to see patterns.`;
    }
    return `You have completed ${total} ${plural} so far. Every session is data I can use -- keep going and I will start to see patterns.`;
  }

  // ── 3+ sessions: build a meaningful summary ──────────────────────────────
  const parts = [];

  // Part 1: session count in context
  if (stats) {
    const week = stats.currentWeek;
    const phase = stats.currentPhase;
    if (phase) {
      const phaseLabel = phase.charAt(0).toUpperCase() + phase.slice(1);
      parts.push(`You are in week ${week} of your programme -- the ${phaseLabel} phase -- with ${total} sessions completed.`);
    } else {
      parts.push(`You have completed ${total} sessions across ${week} week${week !== 1 ? "s" : ""} of your programme.`);
    }
  } else {
    parts.push(`You have completed ${total} sessions.`);
  }

  // Part 2: energy trend if we have enough data
  const recentEnergy = history
    .filter(s => typeof s.energyAtCheckin === "number")
    .slice(-5)
    .map(s => s.energyAtCheckin);

  if (recentEnergy.length >= 3) {
    const avg = recentEnergy.reduce((a, b) => a + b, 0) / recentEnergy.length;
    const avgRounded = Math.round(avg * 10) / 10;

    if (avg >= 7) {
      parts.push("Your energy has been consistently strong going into sessions -- that is a good sign your body is responding well.");
    } else if (avg >= 5) {
      parts.push(`Your average energy before sessions has been ${avgRounded} out of 10 -- steady, and that is worth knowing.`);
    } else {
      parts.push("Your energy has been lower than I would like before sessions. That is useful information -- it may mean recovery or sleep is worth paying attention to.");
    }
  } else if (stats && stats.sessionsThisWeek >= stats.weeklyTarget) {
    parts.push("You have already hit your session target for the week. That is consistent work.");
  }

  return parts.join(" ");
}

export function onMount() {
  // Nothing interactive on this view currently — all read-only
  // Future: add export / share button here
}
