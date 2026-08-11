/**
 * gym-programme.js
 * 10 Aug 2026 v4
 *
 * v4 — Three silent field-name mismatches fixed, found auditing exercise-
 *   detail consistency (Graeme: "some exercises still look like Name,
 *   what to do, mark as done"). This file's "Why this" and video-link
 *   sections had genuinely never rendered for any exercise, ever:
 *   exercise.setup (real field: instructions), exercise.whyThis (real
 *   field: why), exercise.videoUrl (expecting a direct link — real field
 *   is .youtube, a search term, matching Graeme's own point about search
 *   terms vs discontinued direct links). All three fixed, reusing
 *   workout.js's proven pattern. The underlying data had instructions/
 *   coaching/why at 100% coverage the whole time — this was purely a
 *   display bug, not missing content.
 *
 * 31 Jul 2026 v3
 *
 * Gym programme session view. Renders the generated gym session and handles
 * the mid-programme and end-of-programme moments.
 *
 * v3 — Exit-guard + activity-visibility fix (31 Jul 2026 blueprint,
 *   ground-truthed against live code). Three confirmed issues fixed
 *   together, following the pattern already proven working in
 *   workout.js v6 (same investigation, same day):
 *
 *   1. No exit protection at all. Neither the on-screen Exit button
 *      (instant router.navigate('today'), no confirmation) nor the
 *      back-gesture path (no mountSessionGuard() call, so router.js's
 *      default popstate just navigated away) protected an in-progress
 *      session. Fixed: mountSessionGuard()/dismountSessionGuard() now
 *      guard the back-gesture path; the on-screen Exit button shows a
 *      showExitConfirm() Stay/Exit-and-save overlay instead of navigating
 *      instantly. Reuses the existing .session-exit-* class family from
 *      css/components/session-guard.css v2 — no CSS changes needed here.
 *
 *   2. Completions only wrote to progressLog, never activityLog.
 *      progressLog is read by exactly one place in the codebase (this
 *      file's own week-12 reflection observation text) — activityLog is
 *      read by 20 files, including today.js ("you moved today") and
 *      progress.js (recent-activity observations). A completed
 *      gym-programme session was invisible to both. Fixed additively —
 *      per Graeme's confirmed decision — recordSession()'s progressLog
 *      write is unchanged; a store.logActivity() call now runs alongside
 *      it at genuine completion, and at partial-exit via
 *      savePartialSession().
 *
 *   3. reflect.js's save logic is gated on store.get('currentActivityEntry')
 *      — this file never set it, so every reflect.js answer after a
 *      gym-programme session was silently discarded (or, worse, attached
 *      to a stale entry left over from an unrelated earlier session).
 *      Fixed: store.logActivity()'s returned entry is now written to
 *      currentActivityEntry at both completion and partial-exit.
 *
 *   Activity type deliberately set to "gym", not "workout" (workout.js's
 *   value, copied everywhere else this pattern's been applied). "gym" is
 *   an existing key in reflect.js's QUESTIONS/FEEL_OPTIONS maps — using
 *   it means the post-session question ("I want to know what it actually
 *   felt like in there") and feel options (Felt strong / About right /
 *   Struggled) are the ones actually written for gym content, not a
 *   fallback. "workout" isn't a key in either map, so workout.js's own
 *   sessions fall through to the "other"/"coach-session" defaults — that
 *   wasn't touched here (out of this session's file list, logged
 *   separately below), but there was no reason to propagate the same gap
 *   into a new call site when the correct key already exists and nothing
 *   else in the codebase keys off entry.type === "workout" specifically.
 *
 *   Checked before making this change: today.js and progress.js's
 *   activityLog reads don't filter by type at all (any entry counts as
 *   "moved today" / a recent activity) — so this choice doesn't affect
 *   either surface, only reflect.js's question personalisation.
 *
 * v2 — Phase 5 (P5-PROG-5, P5-PROG-6, P5-PROG-7):
 *   - Week 6 glance: brief mid-programme moment. Shows once. Coach pulls back,
 *     reviews first half, opens the second. Reads midProgrammeGlanceShown.
 *     Writes markMidProgrammeGlanceShown() after render. Never repeats.
 *   - Week 12 reflection: end-of-programme moment. Shows once. Coach narrates
 *     the arc. Three options: repeat, progress to harder, new goal.
 *     Reads programmeReflectionShown. Writes markProgrammeReflectionShown().
 *   - End of programme options: Repeat programme / Progress / New goal.
 *     Coach observations surface before the options — not after.
 *   - All programme moments: coach observations first, then choices.
 *
 * Existing behaviour preserved:
 *   - Renders generatedSession from store
 *   - A/B session alternation (gymProgrammeSession)
 *   - Week advance logic (advanceWeekIfNeeded from programmeEngine)
 *   - Exercise card rendering (setup / coach cues / why this)
 *   - Session completion routing to reflect.js
 *
 * Progression logic for "Progress to harder" end option:
 *   - If current programme has a natural successor (e.g. beginner-fitness →
 *     couch-to-cardio or build), coach suggests the most goal-matched next step
 *   - If no clear successor, routes to goal-setup for a new programme selection
 *
 * WCAG 2.2 AA:
 *   Glance and reflection overlays: role="dialog", aria-modal="true",
 *   aria-labelledby on heading, focus trap, Escape does NOT close these
 *   (they are one-time moments — the user must choose an option).
 *   Exercise cards: headings in logical order (h2 exercise name, h3 sections).
 *   Progress indicators: aria-valuenow/min/max on any progress bar.
 *   End-of-programme options: role="group" on option container.
 *   All touch targets minimum 44px.
 *   No colour-only meaning — all states have text labels.
 */

import { store }                    from '../store.js';
import { getProgramme }             from '../data/programmes.js';
import {
  getProgressStats,
  recordSession,
  markMidProgrammeGlanceShown,
  markProgrammeReflectionShown,
  advanceWeekIfNeeded,
}                                   from '../data/programmeEngine.js';
import { getActiveVoice }           from '../data/coach-voice.js';
import { mountSessionGuard, dismountSessionGuard } from '../session-guard.js';

// ─── View registration ────────────────────────────────────────────────────────

export function GymProgrammeView(router) {

  let sessionStarted    = false;
  let currentExerciseIndex = 0;
  let sessionStartTime  = null;

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    const weekResult = advanceWeekIfNeeded();
    const stats      = getProgressStats();

    // Week 6 glance — shows once, blocks session until dismissed
    if (weekResult.week6Trigger || (stats.currentWeek === 6 && !stats.midProgrammeGlanceShown)) {
      renderWeek6Glance(container, stats);
      return;
    }

    // Week 12 reflection — shows once, blocks session until option chosen
    if (weekResult.week12Trigger || (stats.currentWeek >= 12 && !stats.programmeReflectionShown)) {
      renderWeek12Reflection(container, stats);
      return;
    }

    // Normal session render
    renderSession(container, stats);
  }

  // ── Week 6 glance ──────────────────────────────────────────────────────────

  function renderWeek6Glance(container, stats) {
    const programme  = getProgramme(stats.programmeId);
    const voice      = getActiveVoice();
    const totalSessions = stats.totalSessions;

    container.innerHTML = `
      <div class="gp-moment gp-moment--glance"
           role="dialog"
           aria-modal="true"
           aria-labelledby="glance-title">

        <div class="gp-moment__content">

          <div class="gp-moment__programme-name" aria-hidden="true">
            ${_esc(stats.programmeName || 'Your programme')}
          </div>

          <h1 class="gp-moment__heading" id="glance-title">Halfway.</h1>

          <div class="gp-moment__coach-block">
            <p class="gp-moment__coach-line">
              Six weeks. ${totalSessions} session${totalSessions !== 1 ? 's' : ''}.
              That's not nothing.
            </p>
            <p class="gp-moment__coach-line">
              The first half of a programme is always the hardest.
              You're building something that didn't exist before.
            </p>
            <p class="gp-moment__coach-line">
              The second half builds on what you've already done.
              It gets to use everything you've earned.
            </p>
          </div>

          ${stats.milestones.length > 0 ? `
            <div class="gp-moment__milestones"
                 aria-label="Milestones you've reached">
              ${stats.milestones.slice(-3).map(m => `
                <p class="gp-moment__milestone">${_esc(m.label)}</p>
              `).join('')}
            </div>
          ` : ''}

          <p class="gp-moment__coach-line gp-moment__coach-line--forward">
            ${_buildGlanceForwardLine(programme, stats)}
          </p>

          <button class="btn btn-primary gp-moment__cta"
                  data-action="dismiss-glance"
                  aria-label="Continue to today's session">
            Let's keep going
          </button>

        </div>

      </div>
    `;

    // Mark shown immediately — even if user closes app, this won't repeat
    markMidProgrammeGlanceShown();

    // Focus the CTA
    const cta = container.querySelector('[data-action="dismiss-glance"]');
    if (cta) cta.focus();

    cta?.addEventListener('click', () => {
      renderSession(container, getProgressStats());
    });
  }

  function _buildGlanceForwardLine(programme, stats) {
    if (!programme) return 'Six weeks to go. You know how to do this now.';
    const phase = programme.phases?.find(p => p.weeks.includes(7));
    if (phase) {
      return phase.coachMessage || 'Six weeks to go. You know how to do this now.';
    }
    return 'Six weeks to go. You know how to do this now.';
  }

  // ── Week 12 reflection ─────────────────────────────────────────────────────

  function renderWeek12Reflection(container, stats) {
    const programme   = getProgramme(stats.programmeId);
    const totalSessions = stats.totalSessions;
    const progressLog = store.get('progressLog') || [];
    const observation = _buildEndObservation(progressLog, stats, programme);
    const options     = _buildEndOptions(programme, stats);

    container.innerHTML = `
      <div class="gp-moment gp-moment--reflection"
           role="dialog"
           aria-modal="true"
           aria-labelledby="reflection-title">

        <div class="gp-moment__content">

          <div class="gp-moment__programme-name" aria-hidden="true">
            ${_esc(stats.programmeName || 'Your programme')}
          </div>

          <h1 class="gp-moment__heading" id="reflection-title">
            Twelve weeks.
          </h1>

          <div class="gp-moment__coach-block">
            ${observation.map(line => `
              <p class="gp-moment__coach-line">${line}</p>
            `).join('')}
          </div>

          ${stats.milestones.length > 0 ? `
            <div class="gp-moment__milestones"
                 aria-label="Everything you achieved">
              <h2 class="gp-moment__milestones-label">What you built</h2>
              ${stats.milestones.map(m => `
                <p class="gp-moment__milestone">${_esc(m.label)}</p>
              `).join('')}
            </div>
          ` : ''}

          <div class="gp-moment__options"
               role="group"
               aria-label="What would you like to do next?">
            <h2 class="gp-moment__options-label">What's next?</h2>

            ${options.map(opt => `
              <button class="gp-moment__option"
                      data-end-option="${opt.id}"
                      aria-label="${_esc(opt.ariaLabel)}">
                <span class="gp-moment__option-label">${_esc(opt.label)}</span>
                <span class="gp-moment__option-desc">${_esc(opt.desc)}</span>
              </button>
            `).join('')}

          </div>

        </div>

      </div>
    `;

    // Mark shown immediately
    markProgrammeReflectionShown();

    // Focus first option
    const firstOption = container.querySelector('[data-end-option]');
    if (firstOption) firstOption.focus();

    // Wire end options
    container.querySelectorAll('[data-end-option]').forEach(btn => {
      btn.addEventListener('click', () => {
        handleEndOption(btn.dataset.endOption, stats, container);
      });
    });
  }

  function _buildEndObservation(progressLog, stats, programme) {
    const lines = [];
    const total = stats.totalSessions;

    // Line 1 — what was done
    lines.push(
      `${total} session${total !== 1 ? 's' : ''}. Twelve weeks. That's a complete thing.`
    );

    // Line 2 — what the programme was for
    if (programme?.description) {
      lines.push('You came to this because you wanted something to change. Something has.');
    }

    // Line 3 — data-backed, human-readable
    const recentLog = progressLog.slice(-12);
    const avgEnergy = recentLog.length
      ? recentLog.reduce((a, e) => a + (e.energyAtCheckin || 5), 0) / recentLog.length
      : null;

    if (avgEnergy && avgEnergy >= 6.5) {
      lines.push('Your energy scores across the programme have been good. The movement has been doing its work.');
    } else if (avgEnergy && avgEnergy <= 4.5) {
      lines.push('This was a hard twelve weeks. You showed up through it. That matters more than the numbers.');
    }

    // Line 4 — forward
    lines.push(
      'The programme is done. The habit is not. That part is yours to keep.'
    );

    return lines;
  }

  function _buildEndOptions(programme, stats) {
    const options = [];

    // Option 1 — Repeat
    options.push({
      id:        'repeat',
      label:     'Run it again',
      desc:      'Same programme, fresh start. You know how it works now.',
      ariaLabel: 'Run this programme again from week one',
    });

    // Option 2 — Progress (goal-matched next programme)
    const nextProgramme = _suggestNextProgramme(programme, stats);
    options.push({
      id:        'progress',
      label:     nextProgramme ? `Try ${nextProgramme.name}` : 'Choose something harder',
      desc:      nextProgramme ? nextProgramme.tagline : 'Pick a new programme that builds on this one.',
      ariaLabel: nextProgramme
        ? `Progress to ${nextProgramme.name} — ${nextProgramme.tagline}`
        : 'Choose a new programme that challenges you more',
      nextProgrammeId: nextProgramme?.id || null,
    });

    // Option 3 — New goal
    options.push({
      id:        'new-goal',
      label:     'Something different',
      desc:      'Pick a completely new direction. What do you want next?',
      ariaLabel: 'Choose a completely different programme or goal',
    });

    return options;
  }

  function _suggestNextProgramme(programme, stats) {
    if (!programme) return null;

    // Natural progression map
    const PROGRESSIONS = {
      'beginner-fitness':    'feel-good-foundation',
      'feel-good-foundation': 'build',
      'couch-to-cardio':     'move-more',
      'back-to-strength':    'build',
      'open':                'ground',
      'ground':              'build',
      'move-more':           'build',
      'build':               null,    // highest in strength track — coach decides
    };

    const nextId = PROGRESSIONS[programme.id];
    if (!nextId) return null;

    return getProgramme(nextId);
  }

  // ── End option handler ─────────────────────────────────────────────────────

  function handleEndOption(optionId, stats, container) {
    switch (optionId) {

      case 'repeat': {
        // Reset programme to week 1, keep history
        store.set('activeProgramme.currentWeek',      1);
        store.set('activeProgramme.currentPhase',     'build');
        store.set('activeProgramme.sessionsThisWeek', 0);
        store.set('activeProgramme.totalSessions',    0);
        store.set('activeProgramme.milestones',       []);
        store.set('activeProgramme.startDate',        new Date().toISOString());
        store.set('activeProgramme.completed',        false);
        store.set('activeProgramme.completedAt',      null);
        store.set('activeProgramme.midProgrammeGlanceShown',  false);
        store.set('activeProgramme.programmeReflectionShown', false);
        store.set('activeProgramme.missedSessions',   []);
        router.navigate('today');
        break;
      }

      case 'progress': {
        // Check if a specific next programme was suggested
        const programme = getProgramme(stats.programmeId);
        const options   = _buildEndOptions(programme, stats);
        const progOpt   = options.find(o => o.id === 'progress');

        if (progOpt?.nextProgrammeId) {
          // Start the next programme directly
          const next = getProgramme(progOpt.nextProgrammeId);
          if (next) {
            store.set('activeProgramme.programmeId',   next.id);
            store.set('activeProgramme.programmeName', next.name);
            store.set('activeProgramme.startDate',     new Date().toISOString());
            store.set('activeProgramme.currentWeek',   1);
            store.set('activeProgramme.currentPhase',  'build');
            store.set('activeProgramme.sessionsThisWeek', 0);
            store.set('activeProgramme.totalSessions',    0);
            store.set('activeProgramme.milestones',       []);
            store.set('activeProgramme.completed',        false);
            store.set('activeProgramme.completedAt',      null);
            store.set('activeProgramme.midProgrammeGlanceShown',  false);
            store.set('activeProgramme.programmeReflectionShown', false);
            store.set('activeProgramme.missedSessions',   []);
            router.navigate('today');
            break;
          }
        }
        // No specific successor — go to goal-setup
        router.navigate('goal-setup');
        break;
      }

      case 'new-goal':
        router.navigate('goal-setup');
        break;
    }
  }

  // ── Normal session render ──────────────────────────────────────────────────

  function renderSession(container, stats) {
    const generated   = store.get('generatedSession') || {};
    const session     = generated.session;
    const sessionType = store.get('gymProgrammeSession') || 'A';

    if (!session || !session.exercises || session.exercises.length === 0) {
      renderNoSession(container, stats);
      return;
    }

    sessionStartTime = Date.now();
    currentExerciseIndex = 0;
    sessionStarted = true;

    mountSessionGuard({
      isActive: () => sessionStarted,
      onExit:   () => {
        savePartialSession(container);
        cleanupSession();
        router.navigate('reflect');
      },
      label: 'gym session'
    });

    container.innerHTML = `
      <div class="gp-session" role="main" aria-label="Gym session">

        <header class="gp-session-header">
          <div class="gp-session-header__meta">
            <span class="gp-session-header__programme">${_esc(stats.programmeName || '')}</span>
            <span class="gp-session-header__week">Week ${stats.currentWeek}</span>
            <span class="gp-session-header__type">Session ${sessionType}</span>
          </div>
          <div class="gp-session-header__focus">${_esc(session.focus || '')}</div>
        </header>

        <!-- Exercise list -->
        <div class="gp-exercise-list"
             id="gp-exercise-list"
             aria-label="Today's exercises">
          ${session.exercises.map((ex, idx) => renderExerciseCard(ex, idx)).join('')}
        </div>

        <!-- Session complete button -->
        <div class="gp-session-footer">
          <button class="btn btn-primary gp-finish-btn"
                  data-action="finish-session"
                  aria-label="Finish session and reflect">
            Session done
          </button>
          <button class="btn btn-ghost gp-exit-btn"
                  data-action="exit-session"
                  aria-label="Exit session">
            Exit
          </button>
        </div>

      </div>
    `;

    attachSessionEvents(container, session, stats);
  }

  // ── Exercise card renderer ─────────────────────────────────────────────────

  function renderExerciseCard(exercise, index) {
    const sets    = exercise.sets    || 3;
    const reps    = exercise.reps    || '10–12';
    const rest    = exercise.rest    || '60s';
    const caution = exercise._cautionActive;

    return `
      <article class="gp-exercise-card ${caution ? 'gp-exercise-card--caution' : ''}"
               id="exercise-${index}"
               aria-label="${_esc(exercise.name)}${caution ? ' — modification available' : ''}">

        <h2 class="gp-exercise-card__name">${_esc(exercise.name)}</h2>

        <div class="gp-exercise-card__meta" aria-label="Sets, reps and rest">
          <span class="gp-exercise-card__chip">${sets} sets</span>
          <span class="gp-exercise-card__chip">${reps} reps</span>
          <span class="gp-exercise-card__chip">${rest} rest</span>
        </div>

        ${caution && exercise.modificationNote ? `
          <div class="gp-exercise-card__caution" role="note" aria-label="Modification note">
            ${_esc(exercise.modificationNote)}
          </div>
        ` : ''}

        ${exercise.instructions && exercise.instructions.length > 0 ? `
          <section class="gp-exercise-card__section" aria-labelledby="setup-${index}">
            <h3 class="gp-exercise-card__section-label" id="setup-${index}">Setup</h3>
            <ol class="gp-exercise-card__setup-list">
              ${exercise.instructions.map(step => `<li>${_esc(step)}</li>`).join('')}
            </ol>
          </section>
        ` : ''}

        ${exercise.cues && exercise.cues.length > 0 ? `
          <section class="gp-exercise-card__section" aria-labelledby="cues-${index}">
            <h3 class="gp-exercise-card__section-label" id="cues-${index}">Feel for</h3>
            <ul class="gp-exercise-card__cues-list">
              ${exercise.cues.map(cue => `<li>${_esc(cue)}</li>`).join('')}
            </ul>
          </section>
        ` : ''}

        ${exercise.why ? `
          <section class="gp-exercise-card__section gp-exercise-card__section--why"
                   aria-labelledby="why-${index}">
            <h3 class="gp-exercise-card__section-label" id="why-${index}">Why this</h3>
            <p class="gp-exercise-card__why">${_esc(exercise.why)}</p>
          </section>
        ` : ''}

        ${exercise.name ? `
          <a class="gp-exercise-card__video-link"
             href="https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtube || (exercise.name + ' exercise form'))}"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="Watch a demonstration of ${_esc(exercise.name)} (opens in new tab)">
            Watch a demonstration
          </a>
        ` : ''}

        <button class="gp-exercise-card__done"
                data-exercise-done="${index}"
                aria-pressed="false"
                aria-label="Mark ${_esc(exercise.name)} as done">
          Done
        </button>

      </article>
    `;
  }

  function renderNoSession(container, stats) {
    container.innerHTML = `
      <div class="gp-no-session" role="main">
        <p class="gp-no-session__message">
          No session generated yet. Go back and complete your check-in.
        </p>
        <button class="btn btn-primary"
                data-action="go-checkin"
                aria-label="Go to check-in">
          Check in
        </button>
      </div>
    `;
    container.querySelector('[data-action="go-checkin"]')?.addEventListener('click',
      () => router.navigate('checkin')
    );
  }

  // ── Session events ─────────────────────────────────────────────────────────

  function attachSessionEvents(container, session, stats) {
    // Exercise done buttons
    container.querySelectorAll('[data-exercise-done]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx     = parseInt(btn.dataset.exerciseDone);
        const isDone  = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', isDone ? 'false' : 'true');
        btn.textContent = isDone ? 'Done' : 'Undone';
        const card = container.querySelector(`#exercise-${idx}`);
        card?.classList.toggle('gp-exercise-card--done', !isDone);
      });
    });

    // Finish session
    container.querySelector('[data-action="finish-session"]')?.addEventListener('click', () => {
      const durationMins = sessionStartTime
        ? Math.round((Date.now() - sessionStartTime) / 60000)
        : 0;

      const doneCount = container.querySelectorAll('[aria-pressed="true"]').length;

      // Alternate session type A/B
      const currentType = store.get('gymProgrammeSession') || 'A';
      store.set('gymProgrammeSession', currentType === 'A' ? 'B' : 'A');

      // Record session — progressLog write, unchanged (v3 blueprint
      // Section 2: additive fix, this stays exactly as it was).
      recordSession({
        focus:           session.focus || 'strength',
        energy:          store.get('lastCheckin.energy'),
        durationMinutes: durationMins,
        exerciseCount:   doneCount,
        conditionScores: store.get('conditionPainScores') || {},
      });

      // v3 — shared activityLog write path, same pattern as workout.js
      // v6/core-session.js v4/yoga-session.js v5. Makes this session
      // visible to today.js/progress.js, and gives reflect.js a live
      // currentActivityEntry to save feel/painChange/note/moodAfter into
      // instead of silently discarding them.
      const nowIso = new Date().toISOString();
      const activityEntry = store.logActivity({
        type:           'gym',
        date:           nowIso,
        completedAt:    nowIso,
        status:         'complete',
        durationMins,
        exercisesCount: doneCount,
        moodAfter:      null,
        isEvent:        false,
        eventName:      null,
      });
      if (activityEntry) {
        store.set('currentActivityEntry', activityEntry);
      }

      cleanupSession();
      router.navigate('reflect');
    });

    // Exit — shows a Stay/Exit-and-save overlay instead of navigating
    // instantly, matching workout.js v6's confirmed-working pattern.
    container.querySelector('[data-action="exit-session"]')?.addEventListener('click', () => {
      showExitConfirm(container);
    });
  }

  // ── Exit confirmation overlay ──────────────────────────────────────────────
  // Added 31 Jul 2026 (v3). Replaces the old instant router.navigate('today')
  // with a coach-voiced in-app card, matching workout.js v6/core-session.js
  // v4/yoga-session.js v5's confirmed pattern. Reuses the shared
  // .session-exit-* class family from css/components/session-guard.css v2 —
  // no new CSS.

  function showExitConfirm(container) {
    const overlay = document.createElement('div');
    overlay.className = 'session-exit-overlay';
    overlay.id        = 'session-exit-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Exit gym session confirmation');
    overlay.innerHTML = `
      <div class="session-exit-card">
        <div class="session-exit-coach-row">
          <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="session-exit-coach-text">
            Hold on — if you leave now this session won't be saved. Are you sure?
          </p>
        </div>
        <div class="session-exit-actions">
          <button class="btn btn-primary btn-full" id="exit-confirm-stay"
                  aria-label="Stay in session">
            Stay in session
          </button>
          <button class="btn btn-ghost btn-full" id="exit-confirm-leave"
                  aria-label="Exit and save progress so far">
            Exit and save progress
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('exit-confirm-stay').addEventListener('click', () => {
      overlay.remove();
    });

    document.getElementById('exit-confirm-leave').addEventListener('click', () => {
      overlay.remove();
      savePartialSession(container);
      cleanupSession();
      router.navigate('reflect');
    });
  }

  /**
   * savePartialSession() — added 31 Jul 2026 (v3). Same pattern as
   * workout.js v6/core-session.js v4/yoga-session.js v5's partial-save
   * functions: builds the entry fresh via store.logActivity(), no spread
   * of a prior currentActivityEntry (avoids the id-reuse bug fixed
   * elsewhere in the 30 Jul Core Session investigation). Does NOT call
   * recordSession() — a partial session shouldn't count toward
   * programme week/milestone progress, only toward the visible activity
   * record.
   */
  function savePartialSession(container) {
    const doneCount = container
      ? container.querySelectorAll('[aria-pressed="true"]').length
      : 0;
    const durationMins = sessionStartTime
      ? Math.round((Date.now() - sessionStartTime) / 60000)
      : null;
    const nowIso = new Date().toISOString();

    const activityEntry = store.logActivity({
      type:           'gym',
      date:           nowIso,
      completedAt:    nowIso,
      status:         'partial',
      durationMins,
      exercisesCount: doneCount,
      moodAfter:      null,
      isEvent:        false,
      eventName:      null,
    });

    if (activityEntry) {
      store.set('currentActivityEntry', activityEntry);
    }
  }

  /**
   * cleanupSession() — added 31 Jul 2026 (v3). Mirrors workout.js v6's
   * cleanupWorkout(): dismounts the guard and resets local session state
   * so a stale isActive() doesn't linger into the next mount.
   */
  function cleanupSession() {
    dismountSessionGuard();
    sessionStarted   = false;
    sessionStartTime = null;
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  function _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { mount };
}
