/**
 * onboarding/lifestyle.js
 * 12 Aug 2026 v5
 *
 * v5 - C1 copy corrected to Graeme's actual wording. v4 rendered his
 *   supporting sentence AS the question; he meant the question as the
 *   heading and that sentence beneath it. _renderRadioGroup() gains an
 *   optional `sub`, wired via aria-describedby so a screen reader hears
 *   the question first and the reason after, matching the visual order
 *   rather than running them together.
 *
 *   The copy is now defined ONCE, in _legPowerGroup(), and referenced by
 *   both render sites. v4 duplicated it across the initial render and the
 *   reveal handler -- the same drift pattern that has cost this build
 *   repeatedly, and worst of all here: two versions of the most sensitive
 *   question in the product, one of which nobody would read again.
 *
 * 12 Aug 2026 v4
 *
 * v4 - C1 second half. The conditional leg question, asked only of
 *   somebody who has just said getting out of a chair is not easy or not
 *   possible. Wording signed off by Graeme 12 Aug 2026. Optional by his
 *   decision, which is safe ONLY because store.js v33 widened the
 *   fail-safe to treat unanswered as 'limited' for exactly this group --
 *   before that change, 'not-easily' plus a declined question fell
 *   through to fully loaded leg work.
 *
 *   'skip' is a UI value only and is stored as null, so declining is
 *   treated identically to not answering rather than becoming a fourth
 *   capability state the profile does not understand.
 *
 *   Retracting the question clears the answer: somebody who says 'No'
 *   then corrects chairRise to 'Yes' must not leave legPower: 'none'
 *   behind on a question they can no longer see or change.
 *
 *   Also fixes a latent listener leak in attachEvents() that this change
 *   would otherwise have made worse -- see the guard there.
 *
 * 11 Aug 2026 v3
 *
 * CAP-2 RESOLVED 11 Aug 2026. This step was committed flagged "NOT
 * READY FOR BETA" because the selection gates matched on exercise names
 * and were verified missing things -- a wheelchair user who answered
 * "no" to the chair question was still served McGill Curl-Ups. All 497
 * entries now carry position, impact and balanceDemand tags and the
 * gates read those instead.
 *
 * CAP-4 RESOLVED 11 Aug 2026. seated.js adds 21 entries and the pool
 * is now 66. A wheelchair user answering honestly receives an
 * eight-exercise session with cardio, strength, core and mobility --
 * a programme, not a remainder.
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
    legPower:         null,
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
    selections.legPower     = savedCap.legPower     || null;
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
    const showLegPower = !!selections.chairRise && selections.chairRise !== 'yes';
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

        <!-- C1 second half. Asked only of somebody who has just said
             getting out of a chair is not easy, or not possible. Optional
             by Graeme's decision, which is only safe because store.js v33
             treats unanswered as 'limited' for exactly this group. -->
        <div id="leg-power-section"
             aria-live="polite"
             ${showLegPower ? '' : 'hidden'}>
          ${showLegPower ? _renderRadioGroup(_legPowerGroup()) : ''}
        </div>

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

  // C1 second half. Defined ONCE and referenced by both render sites --
  // the initial render and the reveal handler. Duplicating the copy is
  // exactly the drift pattern that has cost this build repeatedly, and it
  // would be worst here: two versions of the most sensitive question in
  // the product, one of which nobody would ever read again.
  //
  // Wording signed off by Graeme 12 Aug 2026. The question names a
  // concrete everyday action, matching the other capability questions
  // (chair, floor, both feet off the ground) rather than asking about an
  // abstract capacity. "Moving from a chair to somewhere else" describes
  // a transfer, an ordinary daily action for many wheelchair users -- it
  // includes them without naming them or assuming anything.
  //
  // The middle option carries "or on good days" because the screen
  // already promises bodies have good and bad spells; an option list that
  // forced a permanent verdict would contradict the page it sits on.
  function _legPowerGroup() {
    return {
      id:       'leg-power',
      heading:  'Can you take your weight through your legs \u2014 standing, or moving from a chair to somewhere else?',
      sub:      'Some exercises ask your legs to carry your weight.',
      field:    'legPower',
      optional: true,
      options: [
        { value: 'full',    label: 'Yes'                      },
        { value: 'limited', label: 'A little, or on good days' },
        { value: 'none',    label: 'No'                       },
        { value: 'skip',    label: 'I\'d rather not say'      },
      ],
      selected: selections.legPower,
    };
  }

  function _renderRadioGroup({ id, heading, sub, field, options, selected, optional }) {
    // `sub` added 12 Aug 2026 for the C1 leg question: a supporting line
    // under the question giving the reason for asking. Referenced by the
    // radiogroup's aria-describedby rather than folded into its label, so
    // a screen reader hears the question first and the reason after,
    // matching the visual order instead of running them together.
    return `
      <section class="lifestyle-group" aria-labelledby="lg-${id}">
        <h2 class="lifestyle-group__heading" id="lg-${id}">
          ${_esc(heading)}
          ${optional ? '<span class="lifestyle-group__optional">(optional)</span>' : ''}
        </h2>
        ${sub ? `<p class="lifestyle-group__sub" id="lg-${id}-sub">${_esc(sub)}</p>` : ''}
        <div class="lifestyle-chips"
             role="radiogroup"
             aria-labelledby="lg-${id}"
             ${sub ? `aria-describedby="lg-${id}-sub"` : ''}>
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
      // Idempotence guard, added 12 Aug 2026 with the C1 leg question.
      // This function re-attaches to EVERY [data-field] chip, and it is
      // called again from inside its own handler whenever a conditional
      // section is revealed. Without a guard each reveal adds another
      // listener to every chip already on screen, and since those
      // listeners can themselves trigger a reveal the count compounds.
      // Behaviour stayed correct only because the handler is idempotent.
      // The C1 question adds a second reveal trigger (chairRise), which
      // would have made a latent leak considerably less latent.
      if (btn.dataset.wired === '1') return;
      btn.dataset.wired = '1';
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

        // C1. Reveal or retract the leg question when chairRise changes.
        // Re-rendering the whole view would lose the person's scroll
        // position mid-form, so this mirrors the returningAfter pattern.
        //
        // Retracting CLEARS the answer. Somebody who answers 'No' and then
        // corrects chairRise to 'Yes' must not leave legPower: 'none'
        // behind on a hidden question they can no longer see or change.
        if (field === 'chairRise') {
          const legSection = container.querySelector('#leg-power-section');
          if (legSection) {
            if (value !== 'yes') {
              legSection.removeAttribute('hidden');
              legSection.innerHTML = _renderRadioGroup(_legPowerGroup());
              // Re-attach events for the new chips.
              attachEvents(container);
            } else {
              legSection.setAttribute('hidden', '');
              legSection.innerHTML = '';
              selections.legPower = null;
            }
          }
        }

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
        // C1. 'skip' is a UI answer, not a capability value. Writing it
        // would make capabilityProfile()'s `c.legPower || default` treat
        // the string "skip" as a real answer and skip the fail-safe
        // entirely -- truthy, and matching none of full/limited/none, so
        // legsLoadable would be false but legsUsable TRUE by accident.
        // Stored as null so the widened default in store.js v33 does its
        // job: declining is treated exactly like not answering.
        legPower:     selections.legPower === 'skip' ? null : selections.legPower,
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
