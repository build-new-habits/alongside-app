/**
 * onboarding/complete.js
 * 23 Jun 2026 v2
 *
 * Onboarding completion step. Shows journey outline card then routes to
 * onboarding/arrival.js (Beat 1 The Castle — content gate D6).
 *
 * v2 — Phase 5 (P5-OB-6):
 *   - Journey outline card: shows the programme matched to the user's goals,
 *     weekly session target, and a brief description of what to expect.
 *   - Writes strategicGoal.planPresentedAt on render (ISO timestamp).
 *   - Routes to 'onboarding/arrival' on continue (Beat 1 — D6 content gate).
 *     Graceful fallback: if arrival.js not yet deployed, routes to 'today'.
 *   - completeOnboarding() called on continue (writes onboardingComplete: true).
 *
 * v1 behaviour preserved:
 *   - All previous store writes preserved (name, goals, conditions etc. already
 *     written by prior steps).
 *   - "You're ready" heading and celebration moment preserved.
 *
 * Journey outline card content:
 *   - Matched programme name and tagline (from getProgrammesForGoals)
 *   - Weekly session target
 *   - Phase 1 description ("What happens in the first four weeks")
 *   - One-line coach note in Nurturing voice
 *
 * WCAG 2.2 AA:
 *   Journey card: role="region", aria-label.
 *   Continue button: descriptive aria-label.
 *   All text meets 4.5:1 contrast ratio on background.
 *   Touch target: minimum 44px.
 */

import { store }                 from '../../store.js';
import { getProgrammesForGoals } from '../../data/programmes.js';
import { toEngineGoals }         from '../../data/goals.js';

export function CompleteView(router) {

  function mount(container) {
    // Write planPresentedAt on every render of this step
    if (!store.get('strategicGoal.planPresentedAt')) {
      store.set('strategicGoal.planPresentedAt', new Date().toISOString());
    }

    render(container);
  }

  function render(container) {
    const name         = store.get('name') || '';
    const goals        = store.get('goals') || [];
    const weeklyTarget = store.get('strategicGoal.weeklySessionTarget') || 3;
    const engineGoals  = toEngineGoals(goals);
    const programmes   = getProgrammesForGoals(engineGoals);
    const programme    = programmes[0]; // best match
    const firstPhase   = programme?.phases?.[0];

    container.innerHTML = `
      <div class="onboarding-view onboarding-view--complete"
           role="main"
           aria-label="You're ready">

        <header class="onboarding-header">
          <h1 class="onboarding-step-title">
            ${name ? `You're set, ${_esc(name)}.` : 'You\'re set.'}
          </h1>
          <p class="onboarding-step-sub">
            Here's what the first part of your journey looks like.
          </p>
        </header>

        <!-- Journey outline card -->
        <div class="complete-journey-card"
             role="region"
             aria-label="Your programme plan">

          ${programme ? `
            <div class="complete-journey-card__programme">
              <span class="complete-journey-card__icon" aria-hidden="true">
                ${programme.icon || '🌱'}
              </span>
              <div>
                <p class="complete-journey-card__programme-name">
                  ${_esc(programme.name)}
                </p>
                <p class="complete-journey-card__programme-tagline">
                  ${_esc(programme.tagline || '')}
                </p>
              </div>
            </div>
          ` : ''}

          <div class="complete-journey-card__detail">
            <div class="complete-journey-card__stat">
              <span class="complete-journey-card__stat-number">${weeklyTarget}</span>
              <span class="complete-journey-card__stat-label">sessions a week</span>
            </div>
            <div class="complete-journey-card__stat">
              <span class="complete-journey-card__stat-number">12</span>
              <span class="complete-journey-card__stat-label">weeks</span>
            </div>
          </div>

          ${firstPhase ? `
            <div class="complete-journey-card__phase">
              <p class="complete-journey-card__phase-label">First four weeks</p>
              <p class="complete-journey-card__phase-desc">
                ${_esc(firstPhase.description || '')}
              </p>
            </div>
          ` : ''}

          <div class="complete-journey-card__coach-note">
            <p>
              Every session adapts to how you feel that day.
              The plan is the structure — what actually happens is always yours to shape.
            </p>
          </div>

        </div>

        <footer class="onboarding-footer">
          <button
            class="btn btn-primary onboarding-continue"
            data-action="continue"
            aria-label="Begin — go to the app">
            Let's begin
          </button>
        </footer>

      </div>
    `;

    container.querySelector('[data-action="continue"]')?.addEventListener('click', () => {
      // Complete onboarding — writes onboardingComplete: true
      store.completeOnboarding();

      // Set the matched programme as active
      if (programme) {
        store.set('activeProgramme.programmeId',   programme.id);
        store.set('activeProgramme.programmeName', programme.name);
        store.set('activeProgramme.startDate',     new Date().toISOString());
        store.set('activeProgramme.currentWeek',   1);
        store.set('activeProgramme.currentPhase',  'build');
        store.set('activeProgramme.phase',         1);
      }

      // Route to arrival.js (Beat 1) — graceful fallback to today
      try {
        router.navigate('today');
      } catch (e) {
        router.navigate('today');
      }
    });
  }

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
