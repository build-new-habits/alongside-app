/**
 * js/views/goal-review-thread.js
 * 22 Aug 2026 v1
 *
 * THREAD-1a — the hard conversation's own screen.
 *
 * ENTERED, NEVER EMBEDDED. My Programme shows a quiet invitation and
 * this opens when the person taps it. A typing indicator starting while
 * somebody is mid-scroll on a browsable screen is an ambush, and this is
 * the one conversation in the product that must never ambush.
 *
 * The view owns PERSISTENCE. thread-runner.js renders and knows nothing
 * about the store; goal-review-script.js is copy and knows nothing about
 * either. Three files, three jobs.
 *
 * ── THE THROTTLE ────────────────────────────────────────────────────
 *
 * lastOfferedAt is written when the person ANSWERS, not when the thread
 * opens. Opening and backing out costs nothing -- somebody who is not
 * ready to have this conversation today should not have spent it.
 */

import { store }    from '../store.js';
import { isPremium } from '../auth.js';
import { runThread } from './thread-runner.js';
import { GOAL_REVIEW_SCRIPT, GOAL_REVIEW_START } from '../data/goal-review-script.js';

export function GoalReviewThreadView(router) {

  let _runner = null;

  function mount(container) {
    // Belt and braces. My Programme will not show the invitation to a
    // free user, but a route can be reached directly and the tier
    // boundary must not depend on the screen that linked here.
    if (!isPremium()) { router.navigate('my-programme'); return; }

    const sg = store.get('strategicGoal') || {};
    const targetDescription = sg.targetDescription || store.get('targetDescription') || '';
    const targetDate = _dayKey(sg.targetDate || store.get('targetDate'));

    if (!targetDescription || !targetDate) { router.navigate('my-programme'); return; }

    const context = {
      targetDescription,
      targetDate,
      previousDate: targetDate,
      newDate: null,
      choice: null
    };

    container.innerHTML = `
      <div class="goal-review-view" role="region" aria-label="Looking at your date together">
        <div id="goal-review-thread"></div>
        <button class="btn btn-ghost btn-full goal-review-back"
                data-action="back" aria-label="Back to My Programme">Back</button>
      </div>
    `;

    _runner = runThread(container.querySelector('#goal-review-thread'), {
      script: GOAL_REVIEW_SCRIPT,
      start: GOAL_REVIEW_START,
      context,
      ariaLabel: 'Looking at your date together',
      onAnswer: (stepId, answer, ctx) => _persist(stepId, answer, ctx),
      onEnd: () => {}
    });

    container.querySelector('[data-action="back"]')
      ?.addEventListener('click', () => {
        _runner?.destroy();
        router.navigate('my-programme');
      });
  }

  /**
   * Every write goes to strategicGoal.* and NEVER to the top-level
   * targetDate/targetDescription pair. Two editors for one field is what
   * caused TARGET-3; this does not add a third writer to the legacy home.
   */
  function _persist(stepId, answer, ctx) {
    if (stepId === 'open') {
      ctx.choice = answer.id === 'move' ? 'moved'
                 : answer.id === 'reshape' ? 'reshaped'
                 : 'kept';
      // "Leave it where it is" is a complete answer and ends here, so
      // the outcome is recorded now rather than waiting for a step that
      // will never come.
      if (ctx.choice === 'kept') _record(ctx, ctx.previousDate);
      return;
    }

    if (stepId === 'move' || stepId === 'reshape-when') {
      const v = _dayKey(answer);
      if (v) {
        store.set('strategicGoal.targetDate', v);
        // Maturity restarts from the new date. Without this the coach
        // could reopen the conversation about a date agreed yesterday.
        store.set('strategicGoal.targetSetAt', new Date().toISOString());
        ctx.newDate = v;
        ctx.targetDate = v;
      }
      _record(ctx, v || ctx.previousDate);
      return;
    }

    if (stepId === 'reshape-what') {
      const what = String(answer || '').trim();
      if (what) {
        store.set('strategicGoal.targetDescription', what);
        ctx.targetDescription = what;
      }
    }
  }

  function _record(ctx, newDate) {
    const review = store.get('strategicGoal.review') || { lastOfferedAt: null, outcomes: [] };
    const outcomes = Array.isArray(review.outcomes) ? review.outcomes.slice() : [];
    outcomes.push({
      at: new Date().toISOString(),
      choice: ctx.choice,
      previousDate: ctx.previousDate || null,
      newDate: newDate || null
    });
    store.set('strategicGoal.review', {
      lastOfferedAt: new Date().toISOString(),
      outcomes
    });
  }

  /** Both storage formats resolve to one day key. See goal-review.js. */
  function _dayKey(v) {
    if (typeof v !== 'string') return null;
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? v.slice(0, 10) : null;
  }

  return { mount };
}
