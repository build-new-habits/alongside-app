/**
 * onboarding/goals.js
 * 23 Jun 2026 v2
 *
 * Onboarding step: goals. Full rewrite with expanded categorised goal list.
 * Uses GOAL_CATEGORIES from js/data/goals.js — single source of truth.
 *
 * v2 — Phase 5 (P5-OB-4):
 *   - Expanded goal list pulled from data/goals.js (30 surface goals, 5 categories)
 *   - Category headings separate the chip grid
 *   - Multi-select: any number of goals, minimum one required to proceed
 *   - "Just want to move more" always visible as a fallback option
 *   - Writes store.goals[] on continue
 *
 * v1 — flat list of 8 goals, no categories.
 *
 * WCAG 2.2 AA:
 *   Goal chips: role="checkbox", aria-checked per chip.
 *   Chip grid container: role="group" per category, aria-labelledby pointing to
 *   the category heading.
 *   Category headings: <h2> (page is a step within onboarding — h1 is the step title).
 *   Continue button: aria-disabled when no goals selected, not disabled (keeps focus).
 *   Minimum chip touch target: 44px height.
 *   Selected state: visual difference plus aria-checked — never colour alone.
 */

import { store }          from '../../store.js';
import { GOAL_CATEGORIES } from '../../data/goals.js';

export function GoalsView(router) {

  let selectedGoals = [];

  function mount(container) {
    // Pre-populate with existing goals if returning to step
    selectedGoals = [...(store.get('goals') || [])];
    render(container);
  }

  function render(container) {
    const hasSelection = selectedGoals.length > 0;

    container.innerHTML = `
      <div class="onboarding-view" role="main" aria-label="Your goals">

        <header class="onboarding-header">
          <h1 class="onboarding-step-title">What are you working towards?</h1>
          <p class="onboarding-step-sub">
            Choose as many as feel right. There's no wrong answer here.
          </p>
        </header>

        <div class="goals-categories">
          ${GOAL_CATEGORIES.map((cat, idx) => `
            <section class="goals-category"
                     aria-labelledby="goals-cat-${idx}">
              <h2 class="goals-category__heading"
                  id="goals-cat-${idx}">
                ${_esc(cat.label)}
              </h2>
              <div class="goals-chip-grid"
                   role="group"
                   aria-labelledby="goals-cat-${idx}">
                ${cat.goals.map(goal => `
                  <button
                    class="goals-chip ${selectedGoals.includes(goal.id) ? 'goals-chip--selected' : ''}"
                    role="checkbox"
                    aria-checked="${selectedGoals.includes(goal.id) ? 'true' : 'false'}"
                    data-goal="${goal.id}"
                    aria-label="${_esc(goal.label)}">
                    <span class="goals-chip__icon" aria-hidden="true">${goal.icon}</span>
                    <span class="goals-chip__label">${_esc(goal.label)}</span>
                  </button>
                `).join('')}
              </div>
            </section>
          `).join('')}
        </div>

        <footer class="onboarding-footer">
          <button
            class="btn btn-primary onboarding-continue"
            id="goals-continue"
            data-action="continue"
            aria-disabled="${hasSelection ? 'false' : 'true'}"
            aria-label="${hasSelection ? 'Continue' : 'Select at least one goal to continue'}">
            Continue
          </button>
          <p class="onboarding-footer__hint" aria-live="polite">
            ${hasSelection ? `${selectedGoals.length} selected` : 'Select at least one'}
          </p>
        </footer>

      </div>
    `;

    attachEvents(container);
  }

  function attachEvents(container) {
    container.querySelectorAll('[data-goal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const goalId  = btn.dataset.goal;
        const checked = btn.getAttribute('aria-checked') === 'true';

        if (checked) {
          selectedGoals = selectedGoals.filter(g => g !== goalId);
        } else {
          selectedGoals = [...selectedGoals, goalId];
        }

        btn.setAttribute('aria-checked', (!checked).toString());
        btn.classList.toggle('goals-chip--selected', !checked);

        // Update continue button and hint
        const continueBtn = container.querySelector('#goals-continue');
        const hint        = container.querySelector('.onboarding-footer__hint');
        const hasSelection = selectedGoals.length > 0;

        if (continueBtn) {
          continueBtn.setAttribute('aria-disabled', hasSelection ? 'false' : 'true');
          continueBtn.setAttribute('aria-label', hasSelection
            ? 'Continue'
            : 'Select at least one goal to continue'
          );
        }
        if (hint) {
          hint.textContent = hasSelection
            ? `${selectedGoals.length} selected`
            : 'Select at least one';
        }
      });
    });

    container.querySelector('[data-action="continue"]')?.addEventListener('click', () => {
      if (selectedGoals.length === 0) return;
      store.set('goals', selectedGoals);
      router.navigate('onboarding/conditions');
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
