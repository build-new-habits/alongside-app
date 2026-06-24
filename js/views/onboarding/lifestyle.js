/**
 * onboarding/lifestyle.js
 * 23 Jun 2026 v2
 *
 * Onboarding step: lifestyle. Captures activity level, stress, sleep,
 * and v2 additions: fitnessLevel, exerciseHistory, returningAfter.
 *
 * v2 — Phase 5 (P5-OB-5):
 *   - fitnessLevel chip: derives from activityLevel selection on continue.
 *     Stored separately so it can be updated from Settings without re-running
 *     onboarding. Mapping: sedentary → sedentary, light → light,
 *     moderate → moderate, active → active, very-active → very-active.
 *   - exerciseHistory chip: 'never' | 'lapsed' | 'returning' | 'active'
 *     "Returning" reveals the returningAfter chips.
 *   - returningAfter chips (conditional): 'injury' | 'illness' | 'life' | 'burnout'
 *     Writes to lifestyle.returningAfter — read by programmeEngine re-entry logic.
 *
 * v1 behaviour preserved:
 *   - activityLevel, stressLevel, sleepQuality chips unchanged
 *   - Routes to onboarding/equipment on continue
 *
 * WCAG 2.2 AA:
 *   All chip groups: role="radiogroup" (single select), each chip role="radio"
 *   aria-checked. exerciseHistory group: role="radiogroup".
 *   returningAfter conditional section: aria-live="polite" region, expands
 *   on "Returning" selection, collapses on other selections.
 *   Continue button: aria-disabled until all required fields selected.
 *   Touch targets: 44px minimum.
 */

import { store } from '../../store.js';

export function LifestyleView(router) {

  let selections = {
    activityLevel:    null,
    stressLevel:      null,
    sleepQuality:     null,
    exerciseHistory:  null,
    returningAfter:   null,
  };

  function mount(container) {
    // Pre-populate from store
    const saved = store.get('lifestyle') || {};
    selections.activityLevel   = saved.activityLevel   || null;
    selections.stressLevel     = saved.stressLevel     || null;
    selections.sleepQuality    = saved.sleepQuality    || null;
    selections.exerciseHistory = saved.exerciseHistory || null;
    selections.returningAfter  = saved.returningAfter  || null;
    render(container);
  }

  function render(container) {
    const showReturningAfter = selections.exerciseHistory === 'returning';
    const canContinue = !!(
      selections.activityLevel &&
      selections.stressLevel &&
      selections.sleepQuality &&
      selections.exerciseHistory
    );

    container.innerHTML = `
      <div class="onboarding-view" role="main" aria-label="About your lifestyle">

        <header class="onboarding-header">
          <h1 class="onboarding-step-title">A little about your lifestyle</h1>
          <p class="onboarding-step-sub">
            This helps the coach get the sessions right from day one.
          </p>
        </header>

        <!-- Activity level -->
        ${_renderRadioGroup({
          id:      'activity-level',
          heading: 'How active are you right now?',
          field:   'activityLevel',
          options: [
            { value: 'sedentary',   label: 'Mostly sitting — desk job or limited movement' },
            { value: 'light',       label: 'Light activity — some walking, gentle movement' },
            { value: 'moderate',    label: 'Moderate — exercise a few times a week'         },
            { value: 'active',      label: 'Active — regular training, several times a week' },
            { value: 'very-active', label: 'Very active — intensive training most days'      },
          ],
          selected: selections.activityLevel,
        })}

        <!-- Exercise history (v2) -->
        ${_renderRadioGroup({
          id:      'exercise-history',
          heading: 'What\'s your exercise background?',
          field:   'exerciseHistory',
          options: [
            { value: 'never',     label: 'Just starting out — never really exercised regularly' },
            { value: 'lapsed',    label: 'Used to exercise — it\'s been a while'                 },
            { value: 'returning', label: 'Returning after a break'                               },
            { value: 'active',    label: 'Been active — this is a continuation'                  },
          ],
          selected: selections.exerciseHistory,
        })}

        <!-- Returning after (conditional — v2) -->
        <div class="lifestyle-returning-after"
             id="returning-after-section"
             aria-live="polite"
             ${showReturningAfter ? '' : 'hidden'}>
          ${showReturningAfter ? _renderRadioGroup({
            id:      'returning-after',
            heading: 'What were you returning from?',
            field:   'returningAfter',
            options: [
              { value: 'injury',  label: 'An injury'               },
              { value: 'illness', label: 'Illness or health issues' },
              { value: 'life',    label: 'Life got in the way'      },
              { value: 'burnout', label: 'Burnout or exhaustion'    },
            ],
            selected: selections.returningAfter,
            optional: true,
          }) : ''}
        </div>

        <!-- Stress level -->
        ${_renderRadioGroup({
          id:      'stress-level',
          heading: 'How\'s your stress level generally?',
          field:   'stressLevel',
          options: [
            { value: 'low',       label: 'Low — life feels pretty manageable'       },
            { value: 'moderate',  label: 'Moderate — some stress but coping'        },
            { value: 'high',      label: 'High — stressed a fair amount of the time' },
            { value: 'very-high', label: 'Very high — struggling with stress'        },
          ],
          selected: selections.stressLevel,
        })}

        <!-- Sleep quality -->
        ${_renderRadioGroup({
          id:      'sleep-quality',
          heading: 'How\'s your sleep?',
          field:   'sleepQuality',
          options: [
            { value: 'good', label: 'Good — usually sleep well'              },
            { value: 'okay', label: 'Okay — some good nights, some bad'      },
            { value: 'poor', label: 'Poor — often struggle with sleep'       },
          ],
          selected: selections.sleepQuality,
        })}

        <footer class="onboarding-footer">
          <button
            class="btn btn-primary onboarding-continue"
            data-action="continue"
            aria-disabled="${canContinue ? 'false' : 'true'}"
            aria-label="Continue to equipment">
            Continue
          </button>
        </footer>

      </div>
    `;

    attachEvents(container);
  }

  function _renderRadioGroup({ id, heading, field, options, selected, optional }) {
    return `
      <section class="lifestyle-group" aria-labelledby="lg-${id}">
        <h2 class="lifestyle-group__heading" id="lg-${id}">
          ${_esc(heading)}
          ${optional ? '<span class="lifestyle-group__optional">(optional)</span>' : ''}
        </h2>
        <div class="lifestyle-chips"
             role="radiogroup"
             aria-labelledby="lg-${id}">
          ${options.map(opt => `
            <button
              class="lifestyle-chip ${selected === opt.value ? 'lifestyle-chip--selected' : ''}"
              role="radio"
              aria-checked="${selected === opt.value ? 'true' : 'false'}"
              data-field="${field}"
              data-value="${opt.value}"
              aria-label="${_esc(opt.label)}">
              ${_esc(opt.label)}
            </button>
          `).join('')}
        </div>
      </section>
    `;
  }

  function attachEvents(container) {
    container.querySelectorAll('[data-field]').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.dataset.field;
        const value = btn.dataset.value;

        // Deselect siblings in this group
        container.querySelectorAll(`[data-field="${field}"]`).forEach(b => {
          b.setAttribute('aria-checked', 'false');
          b.classList.remove('lifestyle-chip--selected');
        });

        // Select this one
        btn.setAttribute('aria-checked', 'true');
        btn.classList.add('lifestyle-chip--selected');
        selections[field] = value;

        // Handle exerciseHistory → show/hide returningAfter
        if (field === 'exerciseHistory') {
          const returningSection = container.querySelector('#returning-after-section');
          if (returningSection) {
            if (value === 'returning') {
              returningSection.removeAttribute('hidden');
              returningSection.innerHTML = _renderRadioGroup({
                id:      'returning-after',
                heading: 'What were you returning from?',
                field:   'returningAfter',
                options: [
                  { value: 'injury',  label: 'An injury'               },
                  { value: 'illness', label: 'Illness or health issues' },
                  { value: 'life',    label: 'Life got in the way'      },
                  { value: 'burnout', label: 'Burnout or exhaustion'    },
                ],
                selected: selections.returningAfter,
                optional: true,
              });
              // Re-attach events for new chips
              attachEvents(container);
            } else {
              returningSection.setAttribute('hidden', '');
              returningSection.innerHTML = '';
              selections.returningAfter = null;
            }
          }
        }

        // Update continue button
        const canContinue = !!(
          selections.activityLevel &&
          selections.stressLevel &&
          selections.sleepQuality &&
          selections.exerciseHistory
        );
        const continueBtn = container.querySelector('[data-action="continue"]');
        if (continueBtn) {
          continueBtn.setAttribute('aria-disabled', canContinue ? 'false' : 'true');
        }
      });
    });

    container.querySelector('[data-action="continue"]')?.addEventListener('click', () => {
      const canContinue = !!(
        selections.activityLevel &&
        selections.stressLevel &&
        selections.sleepQuality &&
        selections.exerciseHistory
      );
      if (!canContinue) return;

      // Write lifestyle fields
      store.set('lifestyle.activityLevel',   selections.activityLevel);
      store.set('lifestyle.stressLevel',     selections.stressLevel);
      store.set('lifestyle.sleepQuality',    selections.sleepQuality);
      store.set('lifestyle.exerciseHistory', selections.exerciseHistory);
      store.set('lifestyle.returningAfter',  selections.returningAfter);

      // Derive and store fitnessLevel (separate field — can be updated from Settings)
      store.set('fitnessLevel', selections.activityLevel);

      router.navigate('onboarding/equipment');
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
