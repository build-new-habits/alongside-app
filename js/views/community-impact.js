/**
 * views/community-impact.js
 * 18 Aug 2026 v3
 *
 * v3 - ATHLETE-RETIRE. Credits no longer branch on a tier nobody holds.
 *
 *
 * v2 - NAME-1. The paid tier is "the Plan", not "Personal".
 *   Graeme's decision, 18 Aug. Copy only -- no logic, no gating
 *   and no tier boundary moved. Reasoning in js/auth.js v2.
 *
 * 11 Aug 2026 v1
 *
 * WHY THIS EXISTS
 *
 * The route 'community-impact' was registered in router.js and in the
 * nav-highlight map, and pointed at a file that had never been written.
 * Anything navigating there failed at import. Found by the navigation
 * reachability audit on 11 Aug 2026.
 *
 * It matters more than the other two orphans. Five percent of revenue to
 * causes the community chooses is a founding commitment, it is on the
 * website, and the credits machinery has been running in store.js all
 * along. Somebody who chose Alongside partly because of that promise,
 * who then goes looking in the app and finds nothing, learns something
 * specific: that the promise lives in marketing and not in the product.
 *
 * WHAT IT SHOWS
 *
 *   1. The credit total, and the breakdown of how it was built
 *   2. The three pillars those credits vote across
 *   3. How to use them, with a route to the website
 *
 * THREE DELIBERATE CHOICES
 *
 * NO ORGANISATIONS ARE NAMED. Graeme, 11 Aug: "don't name the
 * organisations, just the 3 pillars... We changed it to be philosophy
 * driven and not organisation driven." The pillars are the commitment;
 * the organisations filling them change each quarter and are announced
 * at launch. Naming one here would quietly turn a principle back into a
 * partnership.
 *
 * NO GAMIFICATION. No progress bars towards a donation total, no "you
 * are 60% of the way to funding X". That turns a principle into a
 * mechanic and cheapens both. The number is stated; nothing is made of
 * it. P4 applies as it does everywhere: display, never interpret.
 *
 * VOTING IS NOT LIVE, AND SAYS SO. The website is explicit that real
 * causes and real voting arrive at launch. Implying otherwise in-app
 * would be the one dishonesty that costs everything this page is for.
 */

import { store }  from '../store.js';
import { router } from '../router.js';

const WEBSITE_IMPACT_URL = 'https://buildnewhabits.co.uk/impact/';

/**
 * The three pillars, in the website's language.
 *
 * These are what a credit votes across. Each quarter one organisation
 * fills each slot; the pillar is the constant and the organisation is
 * not, which is why only the pillar appears here.
 */
const PILLARS = [
  {
    id: 'dignity',
    title: 'Dignity and being seen',
    body: 'Causes that protect people\u2019s dignity and make sure they are truly seen.'
  },
  {
    id: 'support',
    title: 'Everyone deserves support',
    body: 'Causes that make sure support reaches the people who need it.'
  },
  {
    id: 'connection',
    title: 'We are not separate',
    body: 'Causes that reflect our connection to the world around us.'
  }
];

export function CommunityImpactView(container) {
  const community = store.get('community') || {};
  const credits   = community.credits || 0;
  const tier      = store.get('tier') || 'free';
  const perSession = tier === 'personal' ? 2 : 1;   // ATHLETE-RETIRE

  // The breakdown. Graeme asked for "what their credit score is and how
  // it was developed" -- a number nobody can account for is a number
  // nobody trusts. Derived from the activity log rather than stored
  // separately, so it can never drift from the sessions it describes.
  const log       = store.get('activityLog') || [];
  const completed = log.filter(e => e.status !== 'partial').length;

  container.innerHTML = `
    <div class="view community-impact-view" role="main" aria-labelledby="ci-title">

      <div class="workout-header">
        <button class="btn btn-ghost" id="ci-back-btn" aria-label="Go back">
          &larr; Back
        </button>
        <span class="workout-header-title">Your impact</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          Every time you move, you earn credits. Not points. Not rewards. Votes.
        </p>
      </div>

      <!-- The number, stated. Nothing is made of it (P4). -->
      <section class="card ci-total" aria-labelledby="ci-total-heading">
        <h2 class="ci-total__heading" id="ci-total-heading">Your credits</h2>
        <p class="ci-total__number" aria-label="${credits} credits">${credits}</p>
        <p class="ci-total__sub">
          ${credits === 0
            ? 'Your first session will start this off.'
            : 'Waiting for you to decide where they go.'}
        </p>
      </section>

      <!-- The breakdown. A number nobody can account for is a number
           nobody trusts. -->
      <section class="card ci-breakdown" aria-labelledby="ci-breakdown-heading">
        <h2 class="ci-breakdown__heading" id="ci-breakdown-heading">How that adds up</h2>
        <dl class="ci-breakdown__list">
          <div class="ci-breakdown__row">
            <dt>Sessions completed</dt>
            <dd>${completed}</dd>
          </div>
          <div class="ci-breakdown__row">
            <dt>Credits per session</dt>
            <dd>${perSession}${tier === 'free' ? ' (Free)' : ' (Plan)'}</dd>
          </div>
          <div class="ci-breakdown__row ci-breakdown__row--total">
            <dt>Your total</dt>
            <dd>${credits}</dd>
          </div>
        </dl>
        <p class="ci-breakdown__note">
          One credit per completed session, two on the Plan. Sessions
          you started and did not finish do not count &mdash; and neither does
          anything you did before credits were switched on.
        </p>
      </section>

      <!-- The pillars. No organisation is named: the pillar is the
           commitment, the organisation filling it changes each quarter. -->
      <section class="ci-pillars" aria-labelledby="ci-pillars-heading">
        <h2 class="ci-pillars__heading" id="ci-pillars-heading">What you are voting on</h2>
        <p class="ci-pillars__intro">
          Five percent of everything Alongside earns goes to causes this
          community chooses. Each quarter, three causes are selected &mdash;
          one for each of the things Alongside stands for.
        </p>
        ${PILLARS.map(p => `
          <div class="card ci-pillar">
            <h3 class="ci-pillar__title">${p.title}</h3>
            <p class="ci-pillar__body">${p.body}</p>
          </div>
        `).join('')}
      </section>

      <!-- How to use them. Honest that voting is not live yet: implying
           otherwise is the one dishonesty that would cost everything
           this page exists for. -->
      <section class="card ci-howto" aria-labelledby="ci-howto-heading">
        <h2 class="ci-howto__heading" id="ci-howto-heading">Using your credits</h2>
        <p>
          You can split them across all three, give them all to one, or carry
          them forward and let them build until something moves you enough to
          commit.
        </p>
        <p>
          Voting is not live yet. Real causes and real voting arrive at launch,
          and your credits keep building until then &mdash; nothing is lost by
          waiting.
        </p>
        <a class="btn btn-secondary btn-full"
           href="${WEBSITE_IMPACT_URL}"
           target="_blank" rel="noopener"
           aria-label="Read more about how impact works, opens our website in a new tab">
          How this works
        </a>
      </section>

      <!-- The commitment, stated as a fact about the business rather
           than as a marketing line. -->
      <section class="card ci-commitment" aria-labelledby="ci-commitment-heading">
        <h2 class="ci-commitment__heading" id="ci-commitment-heading">The commitment</h2>
        <p>
          Five percent is where we start. Not where we stop. As Alongside
          grows, so does the commitment.
        </p>
        <p class="ci-commitment__note">
          Every quarter we publish where the credits went and what they funded.
        </p>
      </section>

    </div>
  `;

  container.querySelector('#ci-back-btn')?.addEventListener('click', () => {
    router.navigate('settings');
  });
}
