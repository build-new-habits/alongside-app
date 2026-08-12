/**
 * onboarding/lifestyle.js
 * 11 Aug 2026 v3
 *
 * NOT READY FOR BETA. Verified 11 Aug 2026 by executing live code: the
 * screen collects and stores correctly and capabilityProfile() computes
 * correctly, but the SELECTION GATES DO NOT HOLD. Traced -- a wheelchair
 * user answering "no" to the chair question was still served McGill
 * Curl-Ups (floor work) and a man who cannot jump was still served Drop
 * Steps. Two blockers, both content rather than code:
 *
 *   CAP-2  No exercise carries a position, impact or balance tag.
 *          Gates match on names, and names miss. Deriving from
 *          instructions text was tested and leaves 197 of 497 unclear
 *          -- not good enough for a safety gate.
 *   CAP-4  needsSeated is computed and nothing acts on it, because the
 *          database holds 2 chair and 8 seated entries. Not enough to
 *          build a session from.
 *
 * Asking somebody four careful questions and then handing them the
 * thing they just said they cannot do is worse than not asking. This
 * step must not reach a beta user until both are closed.
 *
 * v3 - CAP-1 capability screen. Four questions measuring CAPACITY,
 *   where the questions above measure FREQUENCY. Somebody can garden
 *   every day, answer "moderate" honestly, and still not get off the
 *   floor unaided -- which under the raised difficulty ceilings meant
 *   being handed jump squats.
 *
 *   Answers Graeme's question: if we are not filtering by age, how do we
 *   get the level right? Every one of these is answerable honestly by a
 *   76-year-old AND by a deconditioned 36-year-old, and together they
 *   separate the fit 76-year-old from the frail one, which age never
 *   can. They ask what somebody CAN do rather than inferring it from
 *   what they are.
 *
 *   Answers are STRINGS. Graeme, on the first draft: "someone in a
 *   wheelchair might need to say No, otherwise it causes shame or
 *   frustration at being left out again." Booleans could not carry
 *   that, and making somebody round themselves off to fit our data
 *   model is the exclusion happening again, in the schema this time.
 *
 *   Placed after the activity question so it reads as refinement rather
 *   than doubt, and framed as being about fit rather than ability --
 *   four yes/no questions about chairs and floors can otherwise land as
 *   an assessment of decline. Not skippable: the safety consequence is
 *   real. Read by store.capabilityProfile().
 *
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
    chairRise:        null,
    floorAccess:      null,
    bothFeet:         null,
    balanceWorry:     null,
    stressLevel:      null,
    sleepQuality:     null,
    exerciseHistory:  null,
    returningAfter:   null,
  };

  function mount(container) {
    // Pre-populate from store
    const saved = store.get('lifestyle') || {};
    selections.activityLevel   = saved.activityLevel   || null;

    const savedCap = store.get('capability') || {};
    selections.chairRise    = savedCap.chairRise    || null;
    selections.floorAccess  = savedCap.floorAccess  || null;
    selections.bothFeet     = savedCap.bothFeet     || null;
    selections.balanceWorry = savedCap.balanceWorry || null;
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
      selections.exerciseHistory &&
      selections.chairRise &&
      selections.floorAccess &&
      selections.bothFeet &&
      selections.balanceWorry
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

        <!-- ── CAPABILITY SCREEN (CAP-1, 11 Aug 2026) ──────────────────
             Four questions measuring CAPACITY, where the questions above
             measure FREQUENCY. Somebody can garden every day, answer
             "moderate" honestly, and still not get off the floor unaided.

             Placed AFTER the activity question deliberately, so it reads
             as refinement rather than doubt, and framed as being about
             fit rather than ability -- four yes/no questions about chairs
             and floors can otherwise land as an assessment of decline.

             Answers are strings, not booleans, so that somebody who uses
             a wheelchair can say "No" rather than approximating
             themselves to "Not easily". Being made to round yourself off
             to fit a data model is the exclusion happening again.

             Not skippable: the safety consequence is real.
             ─────────────────────────────────────────────────────────── -->
        <section class="lifestyle-capability" aria-labelledby="cap-intro-heading">
          <h2 class="lifestyle-group__heading" id="cap-intro-heading">A few practical things</h2>
          <p class="lifestyle-capability__intro">
            So I don't hand you something that doesn't suit you. There are
            no right answers here &mdash; these just tell me what to leave out.
          </p>
        </section>

        ${_renderRadioGroup({
          id:      'chair-rise',
          heading: 'Can you get up from a chair without pushing off with your hands?',
          field:   'chairRise',
          options: [
            { value: 'yes',        label: 'Yes'         },
            { value: 'not-easily', label: 'Not easily'  },
            { value: 'no',         label: 'No'          },
          ],
          selected: selections.chairRise,
        })}

        ${_renderRadioGroup({
          id:      'floor-access',
          heading: 'Can you get down to the floor and back up on your own?',
          field:   'floorAccess',
          options: [
            { value: 'yes',             label: 'Yes'                    },
            { value: 'not-comfortably', label: 'Not comfortably'        },
            { value: 'rather-not',      label: 'I\'d rather not try'    },
            { value: 'no',              label: 'No'                     },
          ],
          selected: selections.floorAccess,
        })}

        ${_renderRadioGroup({
          id:      'both-feet',
          heading: 'Do you currently do anything where both feet leave the ground \u2014 running, jumping, skipping?',
          field:   'bothFeet',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no',  label: 'No'  },
          ],
          selected: selections.bothFeet,
        })}

        ${_renderRadioGroup({
          id:      'balance-worry',
          heading: 'Do you ever worry about losing your balance?',
          field:   'balanceWorry',
          options: [
            { value: 'no',        label: 'No'        },
            { value: 'sometimes', label: 'Sometimes' },
            { value: 'yes',       label: 'Yes'       },
          ],
          selected: selections.balanceWorry,
        })}

        <p class="lifestyle-capability__note">
          You can change any of this later. Bodies have good and bad spells.
        </p>

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
          selections.exerciseHistory &&
          selections.chairRise &&
          selections.floorAccess &&
          selections.bothFeet &&
          selections.balanceWorry
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
        selections.exerciseHistory &&
        selections.chairRise &&
        selections.floorAccess &&
        selections.bothFeet &&
        selections.balanceWorry
      );
      if (!canContinue) return;

      // CAP-1 capability screen. askedAt is what capabilityProfile()
      // reads to distinguish "answered" from "never asked" -- the latter
      // falls back to cautious defaults everywhere.
      store.set('capability', {
        chairRise:    selections.chairRise,
        floorAccess:  selections.floorAccess,
        bothFeet:     selections.bothFeet,
        balanceWorry: selections.balanceWorry,
        askedAt:      new Date().toISOString(),
      });

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
