/**
 * gym-programme.js
 * 11 Aug 2026 v8
 *
 * v8 - CON-3b. Renders the two fields added to the Exercise Entry
 *   Standard on 11 Aug: watchOut ("What to watch for") and load
 *   ("How heavy"). Neither had a renderer anywhere in the product, in
 *   any of the four card views, so content authored to the standard
 *   would have been invisible - the same failure as the field-name
 *   mismatch this file's v5 fixed, caught before authoring rather than
 *   after. Load sits directly beneath the sets/reps target, where the
 *   question "how heavy?" is actually asked. watchOut sits last, after
 *   why, because it is read before the first rep and glanced at during.
 *
 * 11 Aug 2026 v7
 *
 * v7 — PT-12. "Skip this one" now writes exerciseFeedback via
 *   store.logExerciseFeedback(). That field has been read by
 *   applyFeedbackWeighting() since exercises/index.js v1.3 with nothing
 *   writing it, so the weighting has never run on real data. A skip is a
 *   signal already being given at the point of friction — no new UI, and
 *   nothing is said back to the person about it.
 *
 * 11 Aug 2026 v6
 *
 * v6 — PT-4. Lift note added: a flat "Last: 60 kg \u00D7 8" reference line
 *   plus a weight/reps capture, shown only when store.liftLogEnabled is on
 *   (default false). A memory aid, not a scoreboard — Graeme's framing was
 *   knowing what to set the machine to, not tracking progress. Governed by
 *   locked principle P4: the app may display load, the coach never
 *   interprets it. No delta, no arrow, no "best", no coach voice around the
 *   number. See the long note at renderLiftBlock() for why the asymmetry
 *   matters and what must not be added later.
 *
 * 11 Aug 2026 v5
 *
 * v5 — Rebuilt the exercise walkthrough to match prescribed-session.js's
 *   and workout.js's proven one-exercise-at-a-time pattern, per Graeme's
 *   direct screenshot comparison: "Screenshots 2 and 3 are correct...
 *   dynamic and engaging. Screenshot 1 is flat and barely offers any
 *   interaction." Confirmed precisely: this file was still rendering
 *   every exercise as a scrollable list all at once (renderExerciseCard
 *   x N, one "Session done" button at the bottom), while
 *   prescribed-session.js walks through one exercise per screen with a
 *   progress header ("N of M"), a progress bar, a timer or big reps
 *   display, structured HOW TO GET THERE / WHAT TO FOCUS ON / WHY THIS
 *   HELPS sections, and a styled video button. v4 (10 Aug) fixed the
 *   *content* (three field-name bugs meant instructions/why/video never
 *   rendered) but never touched this structural gap — the screens still
 *   looked completely different in practice, exactly as the screenshots
 *   showed.
 *
 *   Rebuilt renderSession()/attachSessionEvents() to walk one exercise
 *   at a time, reusing the exact shared CSS classes prescribed-session.js
 *   and workout.js already use (workout-header, workout-progress-bar,
 *   exercise-display, exercise-role-badge, exercise-meta, timer-display/
 *   reps-display, exercise-instructions, coaching-tip, youtube-link,
 *   workout-actions) rather than gym-programme's own bespoke
 *   gp-exercise-card__* classes — so this genuinely looks like the same
 *   app, not a close approximation. parseHoldSeconds()/formatTime()
 *   copied directly from prescribed-session.js rather than reinvented,
 *   since exercises from session-builder.js's buildSession() use the
 *   same reps-string format ("30-45s" for holds, "12" for rep counts)
 *   prescribed-session.js's parser already handles correctly.
 *
 *   Completion tracking changed from DOM-scanning aria-pressed buttons
 *   (only possible when every exercise was visible at once) to a
 *   completedExerciseIndices Set, incremented on "Next Exercise"/
 *   "Finish Session" (which now double as the completion action, same
 *   as prescribed-session.js's ps-complete-btn), not on "Skip this one"
 *   — skipped exercises don't count toward the session's credits or
 *   doneCount, matching prescribed-session.js's skip behaviour exactly.
 *
 *   gp-exercise-card__* CSS classes and the old gp-session-header/
 *   gp-exercise-list/gp-session-footer markup are now unused by this
 *   file — not deleted from the CSS (out of scope, a separate cleanup
 *   decision, logged on the master schedule, not guessed at here).
 *
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
 *   - One-exercise-at-a-time walkthrough (11 Aug 2026 v5) — progress
 *     header, timer/reps display, instructions/coaching/why sections,
 *     video link, Next/Skip — matching prescribed-session.js exactly
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

  // 11 Aug 2026 v5 — one-exercise-at-a-time walkthrough state, matching
  // prescribed-session.js's pattern exactly.
  let timerInterval = null;
  let timeRemaining = 0;
  let timerStarted  = false;
  let completedExerciseIndices = new Set();

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
    completedExerciseIndices = new Set();
    sessionStarted = true;

    mountSessionGuard({
      isActive: () => sessionStarted,
      onExit:   () => {
        savePartialSession(container, session);
        cleanupSession();
        router.navigate('reflect');
      },
      label: 'gym session'
    });

    renderCurrentExercise(container, session, stats, sessionType);
  }

  // ── Current-exercise renderer (11 Aug 2026 v5) ─────────────────────────────
  // One exercise per screen, matching prescribed-session.js's and
  // workout.js's proven pattern exactly — same shared CSS classes, not a
  // close approximation. Header shows programme/week/session context
  // where prescribed-session.js shows a "Prescribed" badge, since that
  // context matters more here than it does for a standalone prescribed
  // exercise.

  // ── Lift log (11 Aug 2026, PT-4) ───────────────────────────────────────────
  //
  // A MEMORY AID, not a scoreboard. Graeme's framing: "I want to know what
  // weights I was lifting last week so I know what settings to add to the
  // machines, rather than working blind."
  //
  // GOVERNED BY LOCKED PRINCIPLE P4 — the app may display load, the coach
  // never interprets it. What renders is a flat, unnarrated reference line
  // sitting in the exercise meta:  Last: 60 kg × 8
  //
  // Deliberately absent, and not to be added later without revisiting P4:
  //   - any delta, arrow, colour-coding, or "up from"/"down from" wording
  //   - any "new best", "personal best", or celebration
  //   - any coach voice around the number at all
  // The asymmetry is the reason. Silence on a drop is only credible if
  // there is also silence on a rise. The moment the app cheers an increase,
  // its silence on a decrease becomes a judgement — and a flat or falling
  // number carries no information about whether today was a good day. It
  // was hot. They slept badly. They came anyway, which is the harder thing.
  //
  // Off by default (store.liftLogEnabled). Someone who turns it on has
  // asked for it, which is a different thing from being given it.

  function renderLiftBlock(exercise) {
    if (store.get('liftLogEnabled') !== true) return '';
    if (!exercise?.id) return '';

    const unit = store.get('weightUnit') || 'kg';
    const last = store.lastLift(exercise.id);

    // Flat reference line. No verb, no framing, no voice — a note the
    // person left themselves.
    const lastLine = last
      ? `<p class="gp-lift__last">Last: ${last.weight} ${_esc(last.unit || unit)}${last.reps ? ' \u00D7 ' + last.reps : ''}</p>`
      : `<p class="gp-lift__last gp-lift__last--empty">No note yet for this one.</p>`;

    return `
      <div class="gp-lift card" role="group" aria-label="Weight note for ${_esc(exercise.name)}">
        ${lastLine}
        <div class="gp-lift__row">
          <label class="gp-lift__label" for="gp-lift-weight">Weight (${_esc(unit)})</label>
          <input class="gp-lift__input" id="gp-lift-weight" type="number"
                 inputmode="decimal" min="0" step="0.5"
                 autocomplete="off"
                 data-exercise-id="${_esc(exercise.id)}">
          <label class="gp-lift__label" for="gp-lift-reps">Reps</label>
          <input class="gp-lift__input" id="gp-lift-reps" type="number"
                 inputmode="numeric" min="0" step="1"
                 autocomplete="off">
          <button class="btn btn-secondary gp-lift__save" id="gp-lift-save"
                  aria-label="Save this weight as a note for next time">Save</button>
        </div>
        <p class="gp-lift__status" id="gp-lift-status" role="status"></p>
      </div>
    `;
  }

  function attachLiftEvents(exercise) {
    const saveBtn = document.getElementById('gp-lift-save');
    if (!saveBtn || !exercise?.id) return;
    saveBtn.addEventListener('click', () => {
      const w = parseFloat(document.getElementById('gp-lift-weight')?.value);
      const r = parseInt(document.getElementById('gp-lift-reps')?.value, 10);
      const status = document.getElementById('gp-lift-status');
      if (isNaN(w) || w <= 0) {
        if (status) status.textContent = 'Add a weight first.';
        document.getElementById('gp-lift-weight')?.focus();
        return;
      }
      store.logLift(exercise.id, {
        weight: w,
        unit:   store.get('weightUnit') || 'kg',
        reps:   isNaN(r) ? null : r
      });
      // Neutral confirmation. States that it saved; says nothing about the
      // number itself — see P4 above.
      if (status) status.textContent = 'Noted.';
    });
  }

  function renderCurrentExercise(container, session, stats, sessionType) {
    const exercise    = session.exercises[currentExerciseIndex];
    const isLast      = currentExerciseIndex >= session.exercises.length - 1;
    const progress    = (currentExerciseIndex / session.exercises.length) * 100;
    const holdSecs    = parseHoldSeconds(exercise.reps);
    const hasTimer    = holdSecs !== null;
    const caution     = exercise._cautionActive;

    container.innerHTML = `
      <div class="view workout-view">

        <!-- Header -->
        <div class="workout-header">
          <button class="btn btn-ghost" id="gp-exit-btn" aria-label="Exit gym session">
            \u2715 Exit
          </button>
          <div class="workout-progress-info" aria-label="Exercise ${currentExerciseIndex + 1} of ${session.exercises.length}">
            <span>${currentExerciseIndex + 1} of ${session.exercises.length}</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="workout-progress-bar" role="progressbar"
             aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100"
             aria-label="Session progress">
          <div class="workout-progress-fill" style="width: ${progress}%"></div>
        </div>

        <!-- Exercise display -->
        <div class="exercise-display">
          <div class="exercise-role-badge main" aria-label="${_esc(stats.programmeName || 'Gym programme')}">
            \uD83C\uDFCB ${_esc(stats.programmeName || 'Your programme')} \u00B7 Week ${stats.currentWeek} \u00B7 Session ${sessionType}
          </div>

          <h1 class="exercise-name">${_esc(exercise.name)}</h1>

          ${caution && exercise.modificationNote ? `
            <div class="ps-contra-flag" role="status" aria-live="polite">
              <span class="ps-contra-flag__icon" aria-hidden="true">\uD83C\uDF31</span>
              <p>${_esc(exercise.modificationNote)}</p>
            </div>
          ` : ''}

          <div class="exercise-meta">
            <span class="meta-tag">${exercise.sets || 3} sets</span>
            ${exercise.reps ? `<span class="meta-tag">${_esc(exercise.reps)}</span>` : ''}
            ${exercise.rest ? `<span class="meta-tag">${_esc(exercise.rest)} rest</span>` : ''}
          </div>

          <!-- Timer (hold-based exercises) or reps display -->
          ${hasTimer ? `
            <div class="exercise-target">
              <div class="timer-display">
                <div class="timer-circle">
                  <span class="timer-value" id="gp-timer-display">${formatTime(timeRemaining || holdSecs)}</span>
                  <span class="timer-label">${exercise.sets > 1 ? "Set 1 of " + exercise.sets : "Hold"}</span>
                </div>
              </div>
            </div>
          ` : exercise.reps ? `
            <div class="exercise-target">
              <div class="reps-display">
                <div class="reps-info">
                  <span class="reps-value">${exercise.sets || 3} \u00D7 ${_esc(exercise.reps)}</span>
                  <span class="reps-label">sets \u00D7 reps</span>
                </div>
              </div>
            </div>
          ` : ''}

          ${renderLiftBlock(exercise)}

          <!-- Guidance — instructions / coaching / why, same structure and
               same real fields as prescribed-session.js/workout.js. -->
          ${exercise.instructions?.length || exercise.coaching || exercise.why ? `
            <div class="exercise-instructions card" role="region" aria-label="Exercise guidance for ${_esc(exercise.name)}">
              ${exercise.instructions && exercise.instructions.length > 0 ? `
                <span class="exercise-section-label" id="gp-section-setup">How to get there</span>
                <ul class="exercise-section-list" aria-labelledby="gp-section-setup">
                  ${exercise.instructions.map(step => `<li>${_esc(step)}</li>`).join('')}
                </ul>
              ` : ''}
              ${exercise.coaching ? `
                <hr class="exercise-section-divider" aria-hidden="true">
                <span class="exercise-section-label" id="gp-section-focus">What to focus on</span>
                <div class="coaching-tip" aria-labelledby="gp-section-focus">
                  <span class="tip-icon" aria-hidden="true">\uD83D\uDCA1</span>
                  <p>${_esc(exercise.coaching)}</p>
                </div>
              ` : ''}
              ${exercise.why ? `
                <hr class="exercise-section-divider" aria-hidden="true">
                <span class="exercise-section-label" id="gp-section-why">Why this helps</span>
                <p class="exercise-why-text" aria-labelledby="gp-section-why">${_esc(exercise.why)}</p>
              ` : ''}
            </div>
          ` : ''}

          <!-- How heavy - effort-relative only, never a weight. See the
               Exercise Entry Standard and Locked Principle P4. -->
          ${exercise.load ? `
            <div class="exercise-load" role="region" aria-label="How heavy for ${_esc(exercise.name)}">
              <span class="exercise-section-label" id="gp-section-load">How heavy</span>
              <p class="exercise-load-text" aria-labelledby="gp-section-load">${_esc(exercise.load)}</p>
            </div>
          ` : ''}

          <!-- What to watch for. A coach noticing something, not an alert. -->
          ${exercise.watchOut && exercise.watchOut.length > 0 ? `
            <div class="exercise-watchout" role="region" aria-label="What to watch for with ${_esc(exercise.name)}">
              <span class="exercise-section-label" id="gp-section-watchout">What to watch for</span>
              <ul class="exercise-watchout-list" aria-labelledby="gp-section-watchout">
                ${exercise.watchOut.map(item => `<li>${_esc(item)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtube || (exercise.name + ' exercise form'))}"
             target="_blank"
             rel="noopener noreferrer"
             class="youtube-link"
             aria-label="Watch how to do ${_esc(exercise.name)} on YouTube (opens in new tab)">
            <span class="youtube-icon" aria-hidden="true">\u25B6\uFE0F</span>
            Watch how to do this
          </a>
        </div>

        <!-- Actions -->
        <div class="workout-actions">
          ${hasTimer ? `
            <button class="btn btn-large btn-full ${timerStarted ? 'btn-secondary' : 'btn-accent'}"
                    id="gp-timer-btn" aria-live="polite">
              ${!timerStarted ? '\u25B6 Start Timer' : (timerInterval ? '\u23F8 Pause' : '\u25B6 Resume')}
            </button>
          ` : ''}

          <button class="btn btn-primary btn-large btn-full" id="gp-next-btn">
            ${isLast ? '\uD83C\uDF89 Finish Session' : 'Next Exercise \u2192'}
          </button>

          <button class="btn btn-ghost btn-small" id="gp-skip-btn">
            Skip this one
          </button>
        </div>

      </div>
    `;

    attachExerciseEvents(container, session, stats, sessionType);
  }

  function attachExerciseEvents(container, session, stats, sessionType) {
    const exercise = session.exercises[currentExerciseIndex];
    const holdSecs = parseHoldSeconds(exercise.reps);

    if (holdSecs) {
      timeRemaining = timeRemaining || holdSecs;
      updateTimerDisplay();
    }

    document.getElementById('gp-exit-btn')?.addEventListener('click', () => {
      showExitConfirm(container, session);
    });

    document.getElementById('gp-timer-btn')?.addEventListener('click', () => {
      if (!timerStarted) {
        timerStarted = true;
        startTimer();
      } else if (timerInterval) {
        pauseTimer();
      } else {
        startTimer();
      }
      renderCurrentExercise(container, session, stats, sessionType);
    });

    attachLiftEvents(exercise);

    document.getElementById('gp-next-btn')?.addEventListener('click', () => {
      completedExerciseIndices.add(currentExerciseIndex);
      advanceOrFinish(container, session, stats, sessionType);
    });

    document.getElementById('gp-skip-btn')?.addEventListener('click', () => {
      // 11 Aug 2026 (PT-12) — a skip is a real signal the person gave, at
      // the point of friction, with no new UI asked of them (locked
      // principle P3: offer at friction, never teach in the abstract).
      // It feeds applyFeedbackWeighting(), which has read exerciseFeedback
      // since exercises/index.js v1.3 and has never once had data to read.
      //
      // Recorded as 'too-hard' rather than 'disliked' deliberately: the
      // reader's contract is binary too-hard/too-easy, and the effect of a
      // too-hard signal (deprioritise, programmeScore 0.5) is the right
      // response to a skip either way. Nothing is said to the person about
      // it — no "noted", no "we'll make that easier". The adjustment is
      // silent, which is the whole point of it feeling like being known
      // rather than being surveyed.
      if (exercise?.id) store.logExerciseFeedback(exercise.id, 'too-hard');
      advanceOrFinish(container, session, stats, sessionType);
    });
  }

  function advanceOrFinish(container, session, stats, sessionType) {
    if (currentExerciseIndex >= session.exercises.length - 1) {
      finishSession(container, session, stats);
    } else {
      currentExerciseIndex++;
      resetTimer();
      renderCurrentExercise(container, session, stats, sessionType);
    }
  }

  // ── Timer (11 Aug 2026 v5, copied from prescribed-session.js's proven
  //    pattern rather than reinvented) ────────────────────────────────────

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      }
    }, 1000);
  }

  function pauseTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    const el = document.getElementById('gp-timer-display');
    if (el) el.textContent = formatTime(timeRemaining);
  }

  function resetTimer() {
    pauseTimer();
    timeRemaining = 0;
    timerStarted  = false;
  }

  /**
   * Parse a hold time in seconds from a reps/hold string. Copied directly
   * from prescribed-session.js rather than reinvented — session-builder.js's
   * buildSession() produces the exact same string format ("30-45s" for
   * holds, "12" for rep counts) prescribed-session.js's parser already
   * handles correctly.
   */
  function parseHoldSeconds(str) {
    if (!str) return null;
    const lower = String(str).toLowerCase().trim();
    const secMatch = lower.match(/^(\d+)\s*s(?:ec(?:onds?)?)?$/);
    if (secMatch) return parseInt(secMatch[1]);
    const rangeMatch = lower.match(/^(\d+)-(\d+)\s*s$/);
    if (rangeMatch) return parseInt(rangeMatch[2]);
    const minMatch = lower.match(/^(\d+)\s*min(?:utes?)?$/);
    if (minMatch) return parseInt(minMatch[1]) * 60;
    return null;
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // ── Session completion (11 Aug 2026 v5) ────────────────────────────────────
  // Extracted from the old attachSessionEvents()'s finish-session handler —
  // logic unchanged, just called from advanceOrFinish() now instead of a
  // single "Session done" button at the bottom of a scrollable list.

  function finishSession(container, session, stats) {
    const durationMins = sessionStartTime
      ? Math.round((Date.now() - sessionStartTime) / 60000)
      : 0;

    const doneCount = completedExerciseIndices.size;

    // Alternate session type A/B
    const currentType = store.get('gymProgrammeSession') || 'A';
    store.set('gymProgrammeSession', currentType === 'A' ? 'B' : 'A');

    // Record session — progressLog write, unchanged.
    recordSession({
      focus:           session.focus || 'strength',
      energy:          store.get('lastCheckin.energy'),
      durationMinutes: durationMins,
      exerciseCount:   doneCount,
      conditionScores: store.get('conditionPainScores') || {},
    });

    // Shared activityLog write path, same pattern as workout.js
    // v6/core-session.js v4/yoga-session.js v5.
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
  }

  // ── Exit confirmation overlay ──────────────────────────────────────────────
  // Added 31 Jul 2026 (v3). Replaces the old instant router.navigate('today')
  // with a coach-voiced in-app card, matching workout.js v6/core-session.js
  // v4/yoga-session.js v5's confirmed pattern. Reuses the shared
  // .session-exit-* class family from css/components/session-guard.css v2 —
  // no new CSS.

  function showExitConfirm(container, session) {
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
      savePartialSession(container, session);
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
   *
   * 11 Aug 2026 v5 — doneCount now reads completedExerciseIndices.size
   * instead of DOM-scanning aria-pressed buttons, since only one
   * exercise is ever visible in the DOM at a time now — the old scan
   * would have silently always returned 0 or 1 after this rebuild.
   */
  function savePartialSession(container, session) {
    const doneCount = completedExerciseIndices.size;
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
    pauseTimer();
    sessionStarted   = false;
    sessionStartTime = null;
    currentExerciseIndex = 0;
    timeRemaining    = 0;
    timerStarted     = false;
    completedExerciseIndices = new Set();
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
