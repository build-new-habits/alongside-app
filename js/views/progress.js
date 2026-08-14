/**
 * progress.js
 * 13 Aug 2026 v6
 *
 * v6 - E2. The export counted partials while every on-screen count did
 *   not. Last raw activityLog read in the file, now routed through
 *   store.completedSessions() like the rest.
 *
 * 13 Aug 2026 v5
 *
 * v5 - TIER-E. Progress must differ in KIND, not length.
 *
 * Source: Documents/Business/alongside_tier_boundary_12aug2026_v1.md
 * section 4.1, which is blunt about what was wrong here:
 *
 *   "If free is fourteen days and Personal is ninety, we are selling a
 *    bigger number, and bigger numbers are easy to shrug at."
 *
 *   Free RECORDS.  "That's four this fortnight." What you did. True,
 *                  useful, complete.
 *   Personal READS. "You've come in low-energy eleven times. Nine of
 *                  those, you finished. I don't think you know that
 *                  about yourself."
 *
 * That is not more data. It is a different act, and it is only possible
 * when there is a destination to read toward.
 *
 * WHAT CHANGED, AND WHAT I ARGUED WITH.
 *
 * The window drops 30 -> 14 for free. This partly reverses WOW-4
 * (11 Aug), which lifted free from 7 to 30 with a good argument: a
 * 7-day slice showed persona 2.12 a single entry and no shape at all,
 * making free "a different product with the coaching removed". That
 * reasoning was right about 7 and is not right about 14. Danny trains
 * roughly twice a week, so a fortnight holds about four sessions --
 * enough to have a shape. The boundary document is dated one day AFTER
 * WOW-4 and specifies fourteen, and its own copy says "fortnight", so
 * the number is deliberate rather than incidental. WOW-4's principle
 * survives intact; only its number moves.
 *
 * If free were ONLY losing sixteen days this would be a worse product.
 * It isn't: the point of the change is the second half.
 *
 * Free line 1 also loses its appraisals -- "That's a real habit",
 * "That's consistent movement". Those read as verdicts on the person,
 * which P4 forbids ("the coach displays but never interprets"), and
 * they were doing the work that reading should do. A record states the
 * number and stops. Stripping them makes free MORE compliant with the
 * founding principle, not less generous.
 *
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

  // TIER-E, 13 Aug 2026. Free is a fortnight; Personal is 30 or 90.
  //
  // WOW-4's reasoning (11 Aug) still holds and is why this is 14 and not
  // 7: "variability is information", and a 7-day window is structurally
  // incapable of showing variability -- persona 2.12 saw one entry and no
  // shape at all. Fourteen days holds about four of his sessions, which
  // has a shape. The difference that matters is not the window; it is
  // what the coach DOES with it (see _buildObservation).
  const FREE_WINDOW = 14;
  const PAID_DEFAULT = 30;

  // Initialised per tier at first render rather than at module load.
  // A single shared default left a Personal user with activeWindow = 14
  // while their tab strip only offered 30 and 90 — so no tab read as
  // selected and aria-selected was false on all of them. Caught by
  // rendering both tiers rather than reading the code.
  let activeWindow = null;

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    render(container);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    const tier  = store.get('tier') || 'free';
    const premium = tier === 'personal' || tier === 'athlete';

    if (activeWindow === null) activeWindow = premium ? PAID_DEFAULT : FREE_WINDOW;

    // A user who lapses mid-session would otherwise keep a window they
    // are no longer entitled to. Clamp rather than reset, so somebody
    // upgrading does not lose the view they were looking at.
    if (!premium && activeWindow !== FREE_WINDOW) activeWindow = FREE_WINDOW;
    if (premium && activeWindow === FREE_WINDOW)  activeWindow = PAID_DEFAULT;
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
    // Free sees its fortnight, plus 30 and 90 as visible, tappable
    // locked options — not hidden features. WOW-4's principle that
    // nothing is a dead end: a locked control explains itself and offers
    // a route, rather than being absent or inert.
    const windows = premium ? [30, 90] : [FREE_WINDOW, 30, 90];
    return `
      <div class="progress-tabs"
           role="tablist"
           aria-label="Lookback window">
        ${windows.map(w => {
          const locked = !premium && w !== FREE_WINDOW;
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

    // ── Line 1 — the RECORD. What you did, stated plainly.
    //
    // TIER-E. The appraisals that used to hang off these counts --
    // "That's a real habit", "That's consistent movement", "Consistency
    // like that changes things" -- are gone. Two reasons, and the second
    // matters more than the first.
    //
    // P4: the coach displays but never interprets. "That's a real
    // habit" is a verdict on the person, delivered on the strength of a
    // number crossing ten. Somebody who did nine sessions through a
    // hard fortnight got told they were "building something"; somebody
    // who did ten got promoted to a habit. That is exactly the
    // arithmetic this product refuses everywhere else.
    //
    // And they were doing the work that READING should do. If the free
    // record already appraises, there is nothing left for Personal to
    // add but a bigger number -- which is the failure section 4.1
    // names. Stripping them is what makes room for the difference.
    const period = windowDays === 14 ? 'this fortnight'
                 : windowDays === 30 ? 'in the last 30 days'
                 : windowDays === 90 ? 'over the last 90 days'
                 : 'in this window';

    if (count === 0) {
      lines.push('Nothing logged in this window. Whenever you\'re ready — the app is here.');
    } else if (count === 1) {
      lines.push(`One session ${period}.`);
    } else {
      lines.push(`That\'s ${count} ${period}.`);
    }

    if (tier === 'free' || !lines.length) return { lines: lines.length ? lines : ['Keep going.'] };

    // ── Everything below is the READ, and Personal only. ──────────────
    //
    // Not more data — a different act. Line R comes first because it is
    // the one that says something a person could not have counted for
    // themselves.
    const showedUpAnyway = _readShowedUpAnyway(checkinHistory, recent, windowDays);
    if (showedUpAnyway) lines.push(showedUpAnyway);

    // Line 2 — energy pattern (Personal only).
    //
    // Suppressed when the read above already fired: that read is
    // ABOUT low energy, so following it with "Energy has been low in
    // this window. The sessions you did were worth more because of
    // that" says the same thing twice and blunts the better line.
    // Mechanical de-duplication only — the existing copy is unchanged.
    const energyPattern = showedUpAnyway ? null : _detectEnergyPattern(checkinHistory, windowDays);
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

  /**
   * The READ. TIER-E, 13 Aug 2026.
   *
   * The tier boundary document's own example of what Personal does that
   * free cannot:
   *
   *   "You've come in low-energy eleven times. Nine of those, you
   *    finished. I don't think you know that about yourself."
   *
   * Why THIS observation and not another: it is the one a person could
   * not have counted for themselves. Session totals they could tally.
   * The overlap between how they arrived and what they then did is
   * invisible from the inside, and it is the single most useful thing
   * this app knows about somebody -- it is the evidence for the whole
   * premise, that showing up when you feel bad is the actual skill.
   *
   * P4 COMPLIANCE, because this is the line most at risk of breaching
   * it. It points at what was noticed and attaches no verdict. It does
   * not say the person is resilient, disciplined, or doing well. The
   * closing sentence is about what they KNOW, not about their worth,
   * and it is Graeme's own wording from the boundary document.
   *
   * Deliberately silent unless there is something real to say: at least
   * three low-energy arrivals, at least three of them completed, and a
   * majority. A "read" manufactured from two data points is a
   * horoscope, and one that fires when the answer is unflattering would
   * be the coach keeping score.
   *
   * The three-COMPLETED floor was added after rendering it: with only
   * the arrivals floor, Danny's fortnight produced "you've come in low
   * 3 times, 2 of those you moved anyway" — technically true, and it
   * puts "I don't think you know that about yourself" on top of a
   * number that also says he did not, once. The line has to be worth
   * the weight of its closing sentence. It waits until it is.
   */
  function _readShowedUpAnyway(checkinHistory, recent, windowDays) {
    const cutoff = _cutoffDate(windowDays);

    // Low-energy arrivals: energy 4 or below at check-in.
    const lowDays = Object.entries(checkinHistory)
      .filter(([date, v]) =>
        new Date(date) >= cutoff && typeof v?.energy === 'number' && v.energy <= 4)
      .map(([date]) => date);

    if (lowDays.length < 3) return null;

    // Did a session land on that same day? activityLog timestamps are
    // ISO; checkinHistory keys are YYYY-MM-DD, so compare on the date
    // part only. Using the same field precedence the rest of this file
    // uses (completedAt || loggedAt || date) rather than a new one.
    const sessionDays = new Set(
      recent.map(e => {
        const ts = e.completedAt || e.loggedAt || e.date;
        return ts ? new Date(ts).toISOString().split('T')[0] : null;
      }).filter(Boolean)
    );

    const finished = lowDays.filter(d => sessionDays.has(d)).length;
    if (finished < 3) return null;
    if (finished < Math.ceil(lowDays.length / 2)) return null;

    const times = `${lowDays.length} times`;   // floor of 3 above
    const done  = finished === lowDays.length
      ? 'Every one of those'
      : `${finished} of those`;

    return `You've come in low on energy ${times}. ${done}, you moved anyway. ` +
           `I don't think you know that about yourself.`;
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
    // E2, 13 Aug 2026. This was the last raw activityLog read in the
    // file. Every count ON SCREEN routes through completedSessions()
    // (:156, :178, and today.js :285/:451/:501) and this one did not --
    // so the document a Personal user copies out, plausibly to show a
    // physio or a GP, reported a HIGHER session count than the screen it
    // came from, by the number of partials in the window.
    //
    // verify-count1.mjs missed it because it asserted `via >= 2` -- that
    // AT LEAST TWO reads are compliant, not that all are. progress.js
    // had three, two compliant, gate green. A threshold gate cannot
    // detect the case it exists for; the gate is corrected alongside this.
    const activityLog    = store.completedSessions(store.get('activityLog'));
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
