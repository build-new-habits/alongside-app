/**
 * progress.js
 * 11 Aug 2026 v4
 *
 * v4 - "Your year" link added. annual-reflection.js existed as a route
 *   pointing at nothing, and now exists as a view that nothing linked
 *   to. Progress is where somebody looking back would go.
 *
 * 11 Aug 2026 v3
 *
 * v3 — WOW-4 (Persona Tracing Wave 1). Free-tier lookback window lifted
 *   from 7 days to 30. A 7-day window cannot show variability, and
 *   "variability is information" is the product's founding principle — so
 *   the free tier was not a smaller version of the coaching, it was the
 *   coaching removed. Persona 2.12 saw one entry and no shape. 90 days
 *   stays Personal, but is now shown as a visible tappable locked tab
 *   routing to /upgrade rather than being hidden entirely — same "nothing
 *   is a dead end" principle applied to session-builder-ui.js v5.
 *
 * 23 Jun 2026 v2
 *
 * Progress view. Shows what the person has built — not as data, as narrative.
 *
 * v2 — Phase 5 (P5-PG-1, P5-PG-2, P5-PG-3, P5-PG-5):
 *   - 30-day and 90-day lookback views (Personal tier only — 7-day for Free)
 *   - Coach observations as narrative text, not data cards
 *   - Programme progress: missed sessions flagged, pace context, phase position
 *   - Export: three renders — self / friend / professional
 *   - Tier gating: 30/90 day views locked behind Personal; paywall route on tap
 *
 * Philosophy:
 *   Progress is not a dashboard. It is a mirror held at just the right angle.
 *   The coach narrates what the numbers mean — not what they are.
 *   Pattern detection is human-readable text. Never statistics.
 *   Missed sessions are context, not failure. No red indicators.
 *
 * Tier behaviour:
 *   Free:     7-day view only. Coach observation: one line. Export: none.
 *   Personal: 7 / 30 / 90 day views. Coach observations: full narrative.
 *             Export: self / friend / professional.
 *
 * WCAG 2.2 AA:
 *   Tab strip: role="tablist", each tab role="tab", aria-selected, aria-controls.
 *   Selected tab: aria-selected="true". Non-selected: aria-selected="false".
 *   Tab panel: role="tabpanel", aria-labelledby pointing to its tab.
 *   Locked content: aria-disabled="true" on locked tab, role="button" on
 *   paywall prompt, not a disabled button (disabled removes focus).
 *   All coach narrative text rendered as <p> — not aria-hidden.
 *   Export buttons: descriptive aria-label (what the export contains).
 *   No colour-only meaning anywhere. Missed sessions shown with text label,
 *   not red indicator alone.
 *   Touch targets: minimum 44px for all interactive elements.
 */

import { store }            from '../store.js';
import { getProgressStats } from '../data/programmeEngine.js';
import { getGoalLabel }     from '../data/goals.js';

// ─── View registration ────────────────────────────────────────────────────────

export function ProgressView(router) {

  // 11 Aug 2026 v3 (WOW-4) — free tier default lifted from 7 to 30 days.
  // Not generosity: coherence. The founding principle is "variability is
  // information", and a 7-day window is structurally incapable of showing
  // variability. Persona 2.12 trains roughly twice a week with gaps; in any
  // 7-day slice he saw one entry and no shape at all — which made the free
  // tier a different product with the coaching removed, rather than a
  // smaller version of it. Personal keeps 90 days, plus export and tools.
  let activeWindow = 30; // 30 (free) | 30 | 90 (Personal)

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    render(container);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    const tier  = store.get('tier') || 'free';
    const name  = store.get('name') || '';
    const stats = getProgressStats();

    container.innerHTML = `
      <div class="progress-view" role="main" aria-label="Your progress">

        <header class="progress-header">
          <h1 class="progress-title">Progress</h1>
          ${renderWindowTabs(tier)}
        </header>

        <div class="progress-body">
          ${renderCoachNarrative(stats, tier, name)}
          ${renderActivitySummary(tier)}
          ${stats.hasActiveProgramme ? renderProgrammeProgress(stats) : ''}
          ${tier === 'personal' || tier === 'athlete' ? renderExportBlock() : renderExportLocked()}

          <!-- Front door for the annual reflection, added 11 Aug 2026.
               The view existed and nothing navigated to it. Progress is
               where somebody looking back would go. It handles having
               no year of data gracefully, so it is safe to offer from
               day one rather than hidden until it fills. -->
          <button class="btn btn-ghost btn-full"
                  id="progress-year-btn"
                  style="margin-top: var(--space-4);"
                  aria-label="Look back across your year">
            Your year
          </button>
        </div>

      </div>
    `;

    attachEvents(container, tier);
  }

  // ── Window tabs (Personal only) ────────────────────────────────────────────

  function renderWindowTabs(tier) {
    const premium = tier === 'personal' || tier === 'athlete';
    // Free sees 30 days by default and 90 as a visible, tappable locked
    // option — not a hidden feature. Consistent with WOW-4's principle that
    // nothing is a dead end: a locked control explains itself and offers a
    // route, rather than being absent or inert.
    const windows = premium ? [30, 90] : [30, 90];
    return `
      <div class="progress-tabs"
           role="tablist"
           aria-label="Lookback window">
        ${windows.map(w => {
          const locked = !premium && w === 90;
          return `
          <button
            class="progress-tab ${activeWindow === w ? 'progress-tab--active' : ''}${locked ? ' progress-tab--locked' : ''}"
            role="tab"
            id="tab-${w}"
            aria-selected="${activeWindow === w ? 'true' : 'false'}"
            aria-controls="panel-${w}"
            ${locked ? 'data-route="upgrade"' : `data-window="${w}"`}
            aria-label="${w} days${locked ? ' \u2014 Personal plan feature, tap to learn more' : ''}">
            ${w} days${locked ? ' \uD83D\uDD12' : ''}
          </button>`;
        }).join('')}
      </div>
    `;
  }

  // ── Coach narrative ────────────────────────────────────────────────────────

  function renderCoachNarrative(stats, tier, name) {
    // COUNT-1. Partials excluded here too -- this feeds _buildObservation(),
    // which writes the "N sessions in the last 30 days" coach line. A coach
    // congratulating somebody on sessions they backed out of is worse than
    // a wrong number.
    const activityLog  = store.completedSessions(store.get('activityLog'));
    const checkinHistory = store.get('checkinHistory') || {};
    const goals        = store.get('goals') || [];
    const observation  = _buildObservation(activityLog, checkinHistory, stats, activeWindow, tier, name);

    return `
      <section class="progress-narrative"
               aria-label="Coach observations"
               id="panel-${activeWindow}"
               role="tabpanel"
               aria-labelledby="tab-${activeWindow}">
        <div class="progress-narrative__text">
          ${observation.lines.map(line => `<p>${line}</p>`).join('')}
        </div>
      </section>
    `;
  }

  // ── Activity summary ───────────────────────────────────────────────────────

  function renderActivitySummary(tier) {
    // COUNT-1. Partials excluded, matching Home and Build Your Base.
    const activityLog = store.completedSessions(store.get('activityLog'));
    const cutoff      = _cutoffDate(activeWindow);
    const recent      = activityLog.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts) >= cutoff;
    });

    const sessionCount  = recent.length;
    const totalMins     = recent.reduce((acc, e) => acc + (e.durationMins || 0), 0);
    const activityTypes = _countByType(recent);

    return `
      <section class="progress-summary" aria-label="Activity summary for last ${activeWindow} days">
        <div class="progress-summary__stat">
          <span class="progress-summary__number" aria-label="${sessionCount} sessions">${sessionCount}</span>
          <span class="progress-summary__label">sessions</span>
        </div>
        <div class="progress-summary__stat">
          <span class="progress-summary__number" aria-label="${totalMins} minutes total">${totalMins}</span>
          <span class="progress-summary__label">minutes</span>
        </div>
        ${tier !== 'free' ? `
        <div class="progress-summary__breakdown" aria-label="Session types">
          ${Object.entries(activityTypes).slice(0, 3).map(([type, count]) => `
            <span class="progress-summary__type">${_formatType(type)} × ${count}</span>
          `).join('')}
        </div>` : ''}
      </section>
    `;
  }

  // ── Programme progress ─────────────────────────────────────────────────────

  function renderProgrammeProgress(stats) {
    const missedSessions = store.get('activeProgramme.missedSessions') || [];
    const recentMissed   = missedSessions.filter(m => {
      const d = new Date(m.date);
      return d >= _cutoffDate(30);
    });

    return `
      <section class="progress-programme" aria-label="Programme progress">
        <h2 class="progress-programme__name">${stats.programmeName || 'Your programme'}</h2>

        <div class="progress-programme__track">
          <div class="progress-programme__bar"
               role="progressbar"
               aria-valuenow="${stats.percentComplete}"
               aria-valuemin="0"
               aria-valuemax="100"
               aria-label="${stats.percentComplete}% through the programme">
            <div class="progress-programme__fill"
                 style="width: ${stats.percentComplete}%"></div>
          </div>
          <span class="progress-programme__label">
            Week ${stats.currentWeek} of 12 — ${stats.phaseName}
          </span>
        </div>

        <p class="progress-programme__phase-message">${stats.phaseMessage}</p>

        <div class="progress-programme__stats">
          <span>${stats.totalSessions} sessions completed</span>
          <span>${stats.sessionsThisWeek} of ${stats.weeklyTarget} this week</span>
          <span>${stats.weeksRemaining} weeks remaining</span>
        </div>

        ${recentMissed.length > 0 ? `
          <p class="progress-programme__missed">
            ${recentMissed.length} session${recentMissed.length !== 1 ? 's' : ''} not completed
            in the last 30 days — that's normal. The programme adapts.
          </p>` : ''}

        ${stats.milestones.length > 0 ? `
          <div class="progress-programme__milestones" aria-label="Milestones reached">
            <h3 class="progress-programme__milestones-label">Milestones</h3>
            <ul class="progress-programme__milestone-list">
              ${stats.milestones.map(m => `
                <li class="progress-programme__milestone">
                  ${m.label}
                </li>
              `).join('')}
            </ul>
          </div>` : ''}

      </section>
    `;
  }

  // ── Export block ───────────────────────────────────────────────────────────

  function renderExportBlock() {
    return `
      <section class="progress-export" aria-label="Export your progress">
        <h2 class="progress-export__heading">Share your progress</h2>
        <p class="progress-export__intro">Three versions — each written for a different reader.</p>
        <div class="progress-export__buttons">
          <button class="progress-export__btn"
                  data-export="self"
                  aria-label="Export for yourself — your full picture, coach voice">
            For me
          </button>
          <button class="progress-export__btn"
                  data-export="friend"
                  aria-label="Export for a friend — plain English, no jargon">
            For a friend
          </button>
          <button class="progress-export__btn"
                  data-export="professional"
                  aria-label="Export for a professional — structured, clinical-friendly format">
            For a professional
          </button>
        </div>
      </section>
    `;
  }

  function renderExportLocked() {
    return `
      <section class="progress-export progress-export--locked" aria-label="Export your progress">
        <div class="progress-export__lock"
             role="button"
             tabindex="0"
             aria-label="Export is a Personal feature — tap to find out more"
             data-route="upgrade">
          <span class="progress-export__lock-label">Export your progress</span>
          <span class="progress-export__lock-sub">Personal feature</span>
        </div>
      </section>
    `;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container, tier) {
    // Window tabs
    container.querySelectorAll('[data-window]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeWindow = parseInt(btn.dataset.window);
        render(container);
        // Return focus to active tab after re-render
        const newTab = container.querySelector(`[data-window="${activeWindow}"]`);
        if (newTab) newTab.focus();
      });
    });

    // Export buttons
    container.querySelectorAll('[data-export]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.export;
        _handleExport(type);
      });
    });

    container.querySelector('#progress-year-btn')
      ?.addEventListener('click', () => router.navigate('annual-reflection'));

    // Locked export tap
    const lockedExport = container.querySelector('[data-route="upgrade"]');
    if (lockedExport) {
      lockedExport.addEventListener('click', () => router.navigate('upgrade'));
      lockedExport.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.navigate('upgrade');
        }
      });
    }
  }

  // ── Coach observation builder ──────────────────────────────────────────────

  /**
   * Build coach narrative lines for the current lookback window.
   * Pattern detection in plain English. Never statistics.
   *
   * Free tier: one observation line.
   * Personal: up to four observations, read as connected paragraphs.
   *
   * @returns {{ lines: string[] }}
   */
  function _buildObservation(activityLog, checkinHistory, stats, windowDays, tier, name) {
    const cutoff  = _cutoffDate(windowDays);
    const recent  = activityLog.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts) >= cutoff;
    });

    const lines = [];
    const count = recent.length;

    // Line 1 — consistency observation
    if (count === 0) {
      lines.push('Nothing logged in this window. Whenever you\'re ready — the app is here.');
    } else if (count === 1) {
      lines.push('One session in this window. A start, and starts matter.');
    } else if (count <= 4 && windowDays === 7) {
      lines.push(`${count} sessions this week. That\'s consistent movement.`);
    } else if (count >= 5 && windowDays === 7) {
      lines.push(`${count} sessions this week. That\'s a lot of showing up.`);
    } else if (windowDays === 30) {
      lines.push(`${count} sessions in the last 30 days.${count >= 10 ? ' That\'s a real habit.' : ' Building something here.'}`);
    } else if (windowDays === 90) {
      lines.push(`${count} sessions over 90 days.${count >= 24 ? ' Consistency like that changes things.' : ' The foundation is forming.'}`);
    }

    if (tier === 'free' || !lines.length) return { lines: lines.length ? lines : ['Keep going.'] };

    // Line 2 — energy pattern (Personal only)
    const energyPattern = _detectEnergyPattern(checkinHistory, windowDays);
    if (energyPattern) lines.push(energyPattern);

    // Line 3 — activity type pattern (Personal only)
    const typePattern = _detectTypePattern(recent);
    if (typePattern) lines.push(typePattern);

    // Line 4 — programme context (Personal only, if active)
    if (stats.hasActiveProgramme) {
      const programmeObs = _programmeObservation(stats, recent);
      if (programmeObs) lines.push(programmeObs);
    }

    return { lines };
  }

  function _detectEnergyPattern(checkinHistory, windowDays) {
    const cutoff = _cutoffDate(windowDays);
    const entries = Object.entries(checkinHistory)
      .filter(([date]) => new Date(date) >= cutoff)
      .map(([, v]) => v);

    if (entries.length < 3) return null;

    const energyValues = entries.map(e => e.energy).filter(v => typeof v === 'number');
    if (energyValues.length < 3) return null;

    const avg = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;

    if (avg >= 7) return 'Your energy scores have been high in this window. That\'s worth noting.';
    if (avg <= 4) return 'Energy has been low in this window. The sessions you did were worth more because of that.';

    // Check for trend
    const first = energyValues.slice(0, Math.floor(energyValues.length / 2));
    const last  = energyValues.slice(Math.floor(energyValues.length / 2));
    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const lastAvg  = last.reduce((a, b) => a + b, 0) / last.length;

    if (lastAvg - firstAvg >= 1.5) return 'Energy has been rising through this window. The movement is doing something.';
    if (firstAvg - lastAvg >= 1.5) return 'Energy has been lower towards the end of this window. Worth paying attention to.';

    return null;
  }

  function _detectTypePattern(recent) {
    if (recent.length < 3) return null;

    const types = _countByType(recent);
    const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);

    if (!sorted.length) return null;

    const [topType, topCount] = sorted[0];
    const fraction = topCount / recent.length;

    if (fraction >= 0.6) {
      return `Most sessions in this window have been ${_formatType(topType)}. A clear lean.`;
    }

    if (sorted.length >= 3) {
      return 'Good variety in this window — different kinds of sessions, different things asked of the body.';
    }

    return null;
  }

  function _programmeObservation(stats, recent) {
    if (stats.percentComplete >= 90) {
      return `Week ${stats.currentWeek} of 12 — the end is close. The habit is already built.`;
    }
    if (stats.currentWeek === 6 && !stats.midProgrammeGlanceShown) {
      return 'Halfway through the programme. That\'s a real marker.';
    }
    if (stats.sessionsThisWeek >= stats.weeklyTarget) {
      return `This week\'s sessions done. The programme is on track.`;
    }
    return null;
  }

  // ── Export handler ─────────────────────────────────────────────────────────

  function _handleExport(type) {
    const activityLog    = store.get('activityLog') || [];
    const checkinHistory = store.get('checkinHistory') || {};
    const goals          = store.get('goals') || [];
    const name           = store.get('name') || 'User';
    const stats          = getProgressStats();
    const cutoff         = _cutoffDate(activeWindow);
    const recent         = activityLog.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts) >= cutoff;
    });

    const goalLabels = goals.map(g => getGoalLabel(g)).join(', ');
    const text       = _buildExportText(type, name, recent, stats, goalLabels, activeWindow);

    // Write to clipboard — graceful fallback to alert
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        _showExportConfirmation(type);
      }).catch(() => {
        _fallbackExport(text);
      });
    } else {
      _fallbackExport(text);
    }
  }

  function _buildExportText(type, name, recent, stats, goalLabels, windowDays) {
    const date  = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const count = recent.length;
    const mins  = recent.reduce((acc, e) => acc + (e.durationMins || 0), 0);

    if (type === 'self') {
      return [
        `Progress — ${date}`,
        ``,
        `${count} sessions in the last ${windowDays} days. ${mins} minutes of movement.`,
        stats.hasActiveProgramme
          ? `Programme: ${stats.programmeName} — Week ${stats.currentWeek} of 12. ${stats.percentComplete}% complete.`
          : '',
        goalLabels ? `Working towards: ${goalLabels}.` : '',
        ``,
        `Generated by Alongside.`,
      ].filter(Boolean).join('\n');
    }

    if (type === 'friend') {
      return [
        `Here's what I've been up to with my movement practice:`,
        ``,
        `${count} sessions over the last ${windowDays} days — about ${Math.round(mins / 60)} hours of movement total.`,
        stats.hasActiveProgramme
          ? `I'm on week ${stats.currentWeek} of a 12-week programme called ${stats.programmeName}.`
          : '',
        ``,
        `Tracking it with an app called Alongside.`,
      ].filter(Boolean).join('\n');
    }

    if (type === 'professional') {
      return [
        `Movement summary for ${name}`,
        `Generated: ${date}`,
        `Period: last ${windowDays} days`,
        ``,
        `Sessions completed: ${count}`,
        `Total duration: ${mins} minutes`,
        stats.hasActiveProgramme
          ? [
              `Active programme: ${stats.programmeName}`,
              `Programme week: ${stats.currentWeek} / 12`,
              `Sessions this week: ${stats.sessionsThisWeek} (target: ${stats.weeklyTarget})`,
              `Total programme sessions: ${stats.totalSessions}`,
            ].join('\n')
          : 'No active programme.',
        goalLabels ? `Stated goals: ${goalLabels}` : '',
        ``,
        `Data source: Alongside (buildnewhabits.co.uk)`,
        `Note: self-reported data via PWA. No medical device.`,
      ].filter(Boolean).join('\n');
    }

    return '';
  }

  function _showExportConfirmation(type) {
    const labels = { self: 'your version', friend: 'the friend version', professional: 'the professional version' };
    // Announce to screen reader via existing aria-live region if present
    const narrative = document.querySelector('.progress-narrative');
    if (narrative) {
      const msg = document.createElement('p');
      msg.setAttribute('aria-live', 'polite');
      msg.textContent = `Copied to clipboard — ${labels[type] || 'your progress'}.`;
      msg.className = 'progress-export__confirm';
      narrative.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    }
  }

  function _fallbackExport(text) {
    // Last resort — show in a pre block in an accessible dialog
    alert('Copy the text below:\n\n' + text);
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  function _cutoffDate(windowDays) {
    const d = new Date();
    d.setDate(d.getDate() - windowDays);
    return d;
  }

  function _countByType(entries) {
    return entries.reduce((acc, e) => {
      const t = e.type || e.activityType || 'movement';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
  }

  function _formatType(type) {
    const MAP = {
      'workout':          'strength',
      'morning-session':  'morning movement',
      'yoga-session':     'yoga',
      'walk-session':     'walking',
      'running-session':  'running',
      'cycle-session':    'cycling',
      'swim-session':     'swimming',
      'core-session':     'core work',
      'quiet-session':    'breathing',
      'gym-programme':    'gym',
    };
    return MAP[type] || type;
  }

  return { mount };
}
