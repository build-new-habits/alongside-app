/**
 * session-moments.js - The things the coach says when a session ends
 * 15 Aug 2026 v1
 *
 * SHARED-1. Built after a device check found the fault.
 *
 * WHAT WENT WRONG
 *
 * On 15 Aug I added four end-of-session moments -- the first-session
 * recognition (DELIGHT-1), the post-skip preference offer (W2-7), the
 * daily pacing note (PACE-1) and the baseline questions (ASSESS-1) --
 * and put all four inside views/core-session.js.
 *
 * There are ELEVEN session views. core-session.js is reachable from one
 * Home door. Graeme tested through a different door, correctly reported
 * that none of it appeared, and none of it was there to appear.
 *
 * That is the same fault this project has spent two days finding in
 * other people's code: built correctly, reachable by almost nobody. I
 * shipped it eleven times without noticing, because every gate in the
 * suite reads view SOURCE and none of them executes a view or knows
 * which views a person can actually reach.
 *
 * WHY HERE
 *
 * views/reflect.js is already the shared completion route -- 33
 * navigations to it from at least ten session views. So the moments do
 * not need porting into eleven files; they need to live in the one place
 * every session already ends up. Anything added here in future lands
 * everywhere at once, which is the actual point of the refactor.
 *
 * ORDER MATTERS AND IS DELIBERATE
 *
 *   1. Recognition   the emotional moment, and the only one that can
 *                    never happen again. It earns the right to ask
 *                    something, so it comes before anything that asks.
 *   2. Baseline      calibration. Questions first would have diluted (1).
 *   3. Pacing        an observation about today, least personal, last.
 *
 * The summary line and the credits stay below all three, because they
 * are facts and the rest is the coach speaking.
 */

import { store } from '../store.js';
import { firstSessionRecognition } from './first-session.js';
import { noticeDailyPace } from './pacing.js';
import {
  questionsForSession, shouldOfferBaseline, recordBaseline,
  baselineIntro, baselineAck, EFFORT_CHIPS
} from './assessment.js';
import { EXERCISES } from './exercises/index.js';

// Module state, reset by resetSessionMoments() when a view mounts.
let baselineAnswers = {};
let baselineDone    = null;
let pacingNote      = null;
let pacingChecked   = false;

let _exMapCache = null;
function exMap() {
  if (!_exMapCache) _exMapCache = new Map(EXERCISES.map(e => [e.id, e]));
  return _exMapCache;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Call on mount. Without this the previous session's answers and the
 * previous session's pacing note leak into the next one -- the same
 * state-leak trap that has cost this project five times in fixtures.
 */
export function resetSessionMoments() {
  baselineAnswers = {};
  baselineDone    = null;
  pacingNote      = null;
  pacingChecked   = false;
}

function card(inner, cls) {
  return `
    <div class="card card-coach ${cls}">
      <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>${inner}</div>
    </div>`;
}

/**
 * The moments, as HTML, for a completed session.
 *
 * @param {object} opts
 * @param {string[]} [opts.exerciseIds]  what was actually done, for the
 *   baseline questions. Omitted for sessions that are not exercise-based
 *   (breathing, journalling), which correctly get no baseline.
 * @returns {string}
 */
export function renderSessionMoments({ exerciseIds } = {}) {
  const log = store.get('activityLog') || [];
  const completedCount = store.completedSessions(log).length;
  let out = '';

  // 1. Recognition — fires once, ever.
  const first = firstSessionRecognition(
    completedCount, store.get('onboarding.primaryTerritory')
  );
  if (first) {
    out += card(
      `<h2 class="sm-first__heading">${esc(first.heading)}</h2>
       <p class="coach-message-text">${esc(first.body)}</p>`, 'sm-first');
  }

  // 2. Baseline — only where there is something to ask about.
  const qs = questionsForSession(exerciseIds || [], exMap());
  if (baselineDone) {
    out += card(`<p class="coach-message-text">${esc(baselineDone)}</p>`, 'sm-baseline');
  } else if (shouldOfferBaseline(completedCount, qs)) {
    const intro = baselineIntro();
    out += card(`
      <h2 class="sm-baseline__heading">${esc(intro.heading)}</h2>
      <p class="coach-message-text">${esc(intro.body)}</p>
      ${qs.map(q => `
        <fieldset class="sm-baseline__group">
          <legend class="sm-baseline__legend">How was ${esc(q.label)}?</legend>
          <div class="sm-baseline__chips">
            ${EFFORT_CHIPS.map(c => `
              <button class="btn btn-ghost btn-small${baselineAnswers[q.key] === c.id ? ' is-selected' : ''}"
                      data-sm-q="${esc(q.key)}" data-sm-a="${esc(c.id)}"
                      aria-pressed="${baselineAnswers[q.key] === c.id ? 'true' : 'false'}">${esc(c.label)}</button>
            `).join('')}
          </div>
        </fieldset>`).join('')}
      <div class="sm-baseline__actions">
        <button class="btn btn-primary btn-small" data-sm-save>Done</button>
        <button class="btn btn-ghost btn-small" data-sm-skip>Skip this</button>
      </div>`, 'sm-baseline');
  }

  // 3. Pacing — computed once per render cycle, because noticeDailyPace()
  //    records that it has been shown and would otherwise fire and then
  //    hide itself on the very next re-render.
  if (!pacingChecked) { pacingNote = noticeDailyPace(); pacingChecked = true; }
  if (pacingNote) {
    out += card(
      `<h2 class="sm-pacing__heading">${esc(pacingNote.heading)}</h2>
       <p class="coach-message-text">${esc(pacingNote.body)}</p>`, 'sm-pacing');
  }

  return out;
}

/**
 * Wire the baseline controls. Call after every render of the container.
 *
 * @param {HTMLElement} container
 * @param {Function} rerender  the view's own re-render
 */
export function attachSessionMoments(container, rerender) {
  if (!container) return;

  container.querySelectorAll('[data-sm-q]').forEach(btn => {
    btn.addEventListener('click', () => {
      baselineAnswers[btn.dataset.smQ] = btn.dataset.smA;
      rerender && rerender();
    });
  });

  container.querySelector('[data-sm-save]')?.addEventListener('click', () => {
    // No answers at all is a skip, not a save. recordBaseline() returns
    // null and we must not report a read that did not happen.
    const entry = recordBaseline(baselineAnswers);
    if (!entry) { store.declineAssessment(); baselineDone = null; }
    else baselineDone = baselineAck(store.assessmentChange());
    rerender && rerender();
  });

  container.querySelector('[data-sm-skip]')?.addEventListener('click', () => {
    store.declineAssessment();
    baselineAnswers = {};
    baselineDone = null;
    rerender && rerender();
  });
}
