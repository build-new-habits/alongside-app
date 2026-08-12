/**
 * views/annual-reflection.js
 * 11 Aug 2026 v1
 *
 * WHY THIS EXISTS NOW, A YEAR AND A HALF BEFORE ANYBODY CAN REACH IT
 *
 * The route was registered and pointed at a file that had never been
 * written, so anything navigating there failed at import. The obvious
 * fix was to remove the route and rebuild it when the feature was due --
 * beta runs Sept to Nov 2026, public launch Jan 2027, and nobody can
 * have a year of history before roughly Jan 2028.
 *
 * Graeme pushed back: "what if I forget? Is it not worth just having it
 * there from the start?"
 *
 * He is right, and for a better reason than the one he gave. Removing it
 * relies on somebody remembering, and schedules get archived. But a
 * broken route was not a reminder either -- it never prompted anybody,
 * it just failed. Building it now costs little, removes the crash, and
 * means the first person to reach it in 2028 finds something finished
 * rather than something rushed to meet the moment.
 *
 * THE EMPTY STATE IS THE MAIN STATE, for now
 *
 * Almost everybody who opens this before 2028 will not have a year of
 * history. That state is written as the real thing, not as a fallback:
 * it says plainly that there is not enough yet, says when there will be,
 * and shows how far in they are without turning it into a countdown to
 * be measured against.
 *
 * P4 throughout. It displays what happened. It does not grade the year,
 * compare it to anything, or draw conclusions about the person from it.
 */

import { store }  from '../store.js';
import { router } from '../router.js';

const DAY = 86400000;

export function AnnualReflectionView(container) {
  const log = (store.get('activityLog') || []).filter(e => e.status !== 'partial');

  const dates = log
    .map(e => new Date(e.completedAt || e.date).getTime())
    .filter(t => !Number.isNaN(t))
    .sort((a, b) => a - b);

  const firstAt  = dates[0] || null;
  const daysIn   = firstAt ? Math.floor((Date.now() - firstAt) / DAY) : 0;
  const hasYear  = daysIn >= 365;

  container.innerHTML = `
    <div class="view annual-reflection-view" role="main" aria-labelledby="ar-title">

      <div class="workout-header">
        <button class="btn btn-ghost" id="ar-back-btn" aria-label="Go back">
          &larr; Back
        </button>
        <span class="workout-header-title">Your year</span>
      </div>

      ${hasYear ? _renderYear(log, dates) : _renderNotYet(firstAt, daysIn)}

    </div>
  `;

  container.querySelector('#ar-back-btn')?.addEventListener('click', () => {
    router.navigate('progress');
  });
}

/**
 * Not enough history yet. Written as a real state rather than an error.
 *
 * Deliberately not a progress bar towards 365 days. A bar would turn
 * "you have been here a while" into "you are 40% of the way to being
 * allowed something", which is a small unkindness this product does not
 * do.
 */
function _renderNotYet(firstAt, daysIn) {
  if (!firstAt) {
    return `
      <div class="card card-coach">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          There is nothing to look back on yet, which is only because you are
          at the start. Once you have been moving for a while, this is where
          the whole year will be.
        </p>
      </div>
    `;
  }

  const months = Math.floor(daysIn / 30);
  const since  = new Date(firstAt).toLocaleDateString('en-GB',
                   { month: 'long', year: 'numeric' });

  return `
    <div class="card card-coach">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <p class="coach-message-text">
        Not quite yet. You started in ${since}, so there is a good stretch
        here already &mdash; just not a full year to look back across.
      </p>
    </div>

    <div class="card ar-sofar">
      <p class="ar-sofar__line">
        ${months < 1
          ? 'You have been going a few weeks.'
          : `You have been going about ${months} month${months === 1 ? '' : 's'}.`}
      </p>
      <p class="ar-sofar__note">
        Come back around this time next year and there will be a proper year
        to read. In the meantime, Progress has the shorter view.
      </p>
    </div>
  `;
}

/**
 * A full year exists. States what happened, plainly.
 *
 * No superlatives, no "best month", no comparison between periods. A
 * year in which somebody moved eleven times and a year in which they
 * moved two hundred are both years, and this page is not the place that
 * decides which was better.
 */
function _renderYear(log, dates) {
  const yearAgo  = Date.now() - 365 * DAY;
  const inYear   = log.filter(e => {
    const t = new Date(e.completedAt || e.date).getTime();
    return !Number.isNaN(t) && t >= yearAgo;
  });

  const sessions = inYear.length;
  const minutes  = inYear.reduce((sum, e) => sum + (e.durationMins || 0), 0);
  const hours    = Math.round(minutes / 60);

  const kinds = {};
  inYear.forEach(e => { kinds[e.type] = (kinds[e.type] || 0) + 1; });
  const topKinds = Object.entries(kinds)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, n]) => `${k} (${n})`);

  const months = new Set(inYear.map(e =>
    new Date(e.completedAt || e.date).toISOString().slice(0, 7)));

  return `
    <div class="card card-coach">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <p class="coach-message-text">
        Here is your year. Not a score &mdash; just what happened.
      </p>
    </div>

    <div class="card ar-figures">
      <dl class="ar-figures__list">
        <div class="ar-figures__row">
          <dt>Sessions</dt><dd>${sessions}</dd>
        </div>
        <div class="ar-figures__row">
          <dt>Time moving</dt><dd>${hours} hour${hours === 1 ? '' : 's'}</dd>
        </div>
        <div class="ar-figures__row">
          <dt>Months you moved in</dt><dd>${months.size} of 12</dd>
        </div>
      </dl>
    </div>

    ${topKinds.length ? `
      <div class="card ar-kinds">
        <h2 class="ar-kinds__heading">What you did most</h2>
        <p>${topKinds.join(' &middot; ')}</p>
      </div>
    ` : ''}

    <div class="card ar-close">
      <p>
        Some of those months will have been easier than others. Both kinds
        count the same here.
      </p>
    </div>
  `;
}
