/**
 * coach-proposal.js
 * 13 Jul 2026 v9
 *
 * Coach proposal view. The hub. Doors that describe categories, not
 * pre-committed choices.
 *
 * v9 — Confirmed bug fix, Session A2. _generateOptions() looked up
 *   window._workoutGenerator at runtime and, if found, called
 *   generateDailyOptions() with a parameter object (energy/burnout/
 *   intensityBias/focusBias/availableTime). Two problems: (1) nothing in
 *   this codebase actually sets window._workoutGenerator — no global
 *   registration exists for it, so this lookup likely always failed and
 *   silently fell through to _getFallbackOptions(); (2) even if it had
 *   been found, workoutGenerator.generateDailyOptions() takes ZERO
 *   parameters — it reads everything itself from store/checkinData. The
 *   object was always discarded either way.
 *
 *   Ground-truthed against workoutGenerator.js v1.8 before fixing. Of
 *   the five values in the discarded object, three were harmless to
 *   lose — energy, burnout, and phase-bias focus order are already
 *   re-derived independently inside generateDailyOptions() via the same
 *   store/checkinData/programmeEngine calls this file uses. Only two
 *   genuinely had nowhere else to reach the generator: the re-entry
 *   gentler-start intensity override (effectiveIntensity, computed
 *   below in buildProposal() via getReEntryIntensity()), and the
 *   check-in's availableTime. The coach's re-entry text said "starting
 *   gently" while the actual generated session was unaffected by it —
 *   this is now fixed.
 *
 *   Fix: replaced the window._workoutGenerator runtime lookup with a
 *   direct top-level import (no circular dependency — workoutGenerator.js
 *   does not import this file). _generateOptions() now writes the
 *   re-entry-adjusted intensity and availableTime to store immediately
 *   before calling generateDailyOptions(), which picks them up through
 *   its existing store-read path (store.get("todayIntensity") and
 *   store.get("availableTime")) — no change to generateDailyOptions()'s
 *   own contract, no parameters added there. Dropped the now-unused
 *   burnout and phaseBias arguments from _generateOptions()'s signature
 *   and call site — both were already dead even before this fix.
 *
 *   ALSO INVESTIGATED, NOT A BUG: the sw.js v161 changelog flagged
 *   _routeForOption() as routing every real generated option to the
 *   generic 'workout' view regardless of framing, since real output only
 *   has option.focus, never option.type. Confirmed true, but this is
 *   correct behaviour, not a defect — generateWorkout() only ever
 *   produces generic exercise-list sessions shaped for workout.js
 *   (strength/mobility/cardio focus, never a yoga/walk/run session).
 *   Fallback options DO carry type and DO route correctly to their
 *   specialised views already. Giving real options a genuine non-workout
 *   type would require the generator itself to be able to produce those
 *   session shapes — the "Option A vs B" gap already logged in the
 *   master schedule (Appendix Q), not something fixable in
 *   _routeForOption() alone. No change made here.
 *
 *   NOT INVESTIGATED, FLAGGING FOR WHOEVER NEXT TOUCHES checkin.js OR
 *   schema.md: schema.md documents todayIntensity's value space as
 *   "low | moderate | high", but the code (both here and in
 *   workoutGenerator.js's intensityParams table) expects
 *   "recovery | gentle | moderate | challenging". Writing
 *   effectiveIntensity (already in the gentle/moderate/challenging space,
 *   per programmeEngine's getPhaseBias()/getReEntryIntensity()) into
 *   store.todayIntensity is internally consistent with this file and
 *   workoutGenerator.js, but if checkin.js writes todayIntensity in the
 *   low/moderate/high space documented in schema.md, there may be a
 *   separate, pre-existing mismatch there — not ground-truthed this
 *   session, checkin.js not opened.
 *
 * v8 — Door redesign (Door 1 only — Graeme's redesign brief, this session).
 *   Root problem being fixed: the old three-doors model computed one
 *   specific session per door and wrote coach lines implying a fully
 *   resolved, specific choice ("this session is built for that") —
 *   but under Option B (see coach-proposal.js v7 / master schedule
 *   Appendix Q), the generator can only ever produce strength/mobility/
 *   cardio sessions, so Door C's "something different" framing in
 *   particular was promising content that could never actually arrive.
 *
 *   New model: doors describe categories honestly. Door 1 ("Today's
 *   session") opens a right-slide preview panel showing the three
 *   generated options as selectable cards — duration, exercise count,
 *   and the existing rationale text as the "why" — with the top-ranked
 *   option (already first in the generator's priority order) marked
 *   "Recommended" in gold. User selects a card, taps "Start Session" to
 *   commit, or "Not today" to back out. This is the same select-then-
 *   commit pattern already used throughout Settings (goal chips + Save,
 *   movement chips + Save) and My Week (day-type chips + Save) — no new
 *   interaction pattern introduced, just a new panel shape.
 *
 *   Door 2 ("Your programme") and Door 3 ("Something different") are
 *   NOT yet built to their new spec — reusing old per-option logic for
 *   them under the new copy would be actively misleading (the old
 *   options don't map onto "programme adherence" or "something
 *   different" as concepts at all). Deliberately set to disabled,
 *   reusing the exact existing disabled-door treatment (aria-disabled,
 *   helper text) already used for the severe-pain override case. Real
 *   behaviour change, flagged explicitly rather than silently shipped:
 *   only one of three doors is functional until Door 2/3 are built in
 *   their own sessions (Door 2 needs a new "uninterrupted" bypass mode
 *   in workoutGenerator.js; Door 3 needs walk-session.js/yoga-session.js
 *   to accept a pre-selected type — neither exists yet).
 *
 *   Severe-pain handling changed in spirit, not mechanism: previously
 *   disabled the whole "Door A" when severe pain was flagged. Under the
 *   new model, Door 1 IS the adapted-for-you door — severe pain should
 *   show up in which of the three options gets generated (the generator
 *   already filters exercises by pain zone), not disable the door
 *   entirely. That old disabling behaviour is Door 2's territory now
 *   ("serious flags" adaptation vs "uninterrupted") — deliberately not
 *   reproduced here.
 *
 *   Removed as dead code: _buildDoors(), _doorALine(), _doorBLine(),
 *   _doorCLine() — the per-door dynamic coach-line logic that assumed
 *   one option per door. _buildAcknowledgement() trimmed to the two
 *   bypass-door cases only, since door-a/b/c keys no longer exist and
 *   the old three-branch version would have thrown if ever hit
 *   (referenced proposal.doors, which no longer exists).
 *
 *   handleDoorChoice() simplified: now only ever called for the bypass
 *   door (Help me build it / Take me to the library) — the generic
 *   "look up proposal.doors.find()" branch for a/b/c routing was
 *   removed as dead code that would have been a real bug if it had
 *   fired (proposal.doors doesn't exist any more).
 *
 * v7 — Confirmed bug fix: this file uses `import` at the top (ES modules,
 *   no bundler) but two functions were being pulled in via `require()`
 *   inside function bodies — `getReEntryIntensity` (in buildProposal(),
 *   re-entry gentler-start path) and `applyMissedSessionAdaptation` (in
 *   handleMissedAdaptation(), the "Stay in 12 weeks"/"Keep the same
 *   rhythm" buttons). `require()` does not exist in this environment —
 *   both would throw `require is not defined` the moment they ran.
 *   Fixed by adding both to the existing top-level import from
 *   programmeEngine.js. No other changes.
 *
 * v6 — Phase 5 door reframe (P5-CP-1, P5-CP-2, P5-CP-3). Superseded by
 *   v8's redesign above — see v6 in prior version history for the
 *   original door-reframe detail if needed for reference.
 *
 * v5 — workoutGenerator wired. run→running-session. walk→walk-session.
 *   availableTime drives session length. Cycle phase adaptation.
 *   Burnout override. Programme phase bias.
 *
 * WCAG 2.2 AA:
 *   Door buttons: aria-label describes the door. Disabled doors:
 *   aria-disabled="true", helper text in aria-describedby.
 *   Preview panel: role="dialog", aria-modal="true", focus trapped,
 *   Escape closes (treated as "Not today"), focus returns to the
 *   triggering door button on close.
 *   Preview cards: role="radio" within role="radiogroup", aria-checked,
 *   "Recommended" conveyed via a text badge (not colour alone) and
 *   echoed in the card's aria-label.
 *   Start Session: disabled (not just visually) until a card is
 *   selected — communicated via the disabled attribute, not opacity
 *   alone.
 *   Bypass door: same touch target (min 44px) and contrast as primary
 *   doors. Post-choice acknowledgement: aria-live="polite" region.
 *   All coach text rendered as <p> — not aria-hidden.
 *   prefers-reduced-motion: panel slide transition removed.
 */

import { store }             from '../store.js';
import { getActiveVoice, getTimingRules } from '../data/coach-voice.js';
import { getPhaseBias, getReEntryContext, getMissedSessionOffer,
         captureReturnContext, clearReturnContext,
         recordSession, advanceWeekIfNeeded,
         getReEntryIntensity, applyMissedSessionAdaptation }  from '../data/programmeEngine.js';
import { getProgramme }      from '../data/programmes.js';
import { detectBurnout }     from '../data/checkin.js';
import { getPrimaryEngineGoal } from '../data/goals.js';
import { workoutGenerator }  from '../data/workoutGenerator.js';   // v9 — direct import, replaces window._workoutGenerator lookup

// ─── Door copy (v8 — static, honest about category vs commitment) ────────────

const DOOR_COPY = {
  'door-1': {
    title: 'Today\u2019s session',
    line:  'This option works around your check-in. It\u2019s what I recommend based on where you are today.',
    enabled: true
  },
  'door-2': {
    title: 'Your programme',
    line:  'This option follows your programme with very limited adaptations. Where any major issues were flagged I\u2019ve tried to adapt it, but you can always choose \u201cuninterrupted\u201d to just follow the normal plan.',
    enabled: false,
    disabledReason: 'Being redesigned \u2014 check back soon.'
  },
  'door-3': {
    title: 'Something different',
    line:  'Perhaps today is one for something different. Come and have a look at some options.',
    enabled: false,
    disabledReason: 'Being redesigned \u2014 check back soon.'
  }
};

// ─── View registration ────────────────────────────────────────────────────────

export function CoachProposalView(router) {

  let proposal      = null;
  let choiceMade    = false;
  let reEntryCtx    = null;
  let missedOffer   = null;

  // ── Door 1 preview panel state (v8) ─────────────────────────────────────
  let previewOpen           = false;
  let currentPreviewOptions = [];
  let selectedOptionId      = null;

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    // Advance week if Monday
    advanceWeekIfNeeded();

    // Check re-entry and missed session contexts
    reEntryCtx  = getReEntryContext();
    missedOffer = getMissedSessionOffer();

    // Build the proposal
    proposal = buildProposal();

    render(container);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    const voice       = getActiveVoice();
    const name        = store.get('name') || '';
    const tier        = store.get('tier') || 'free';

    container.innerHTML = `
      <div class="cp-view" role="main" aria-label="Your coaching proposal for today">

        <!-- Re-entry banner (illness/long gap) -->
        ${reEntryCtx && !reEntryCtx.contextCaptured ? renderReturnDoor() : ''}

        <!-- Compress/extend offer -->
        ${missedOffer && !choiceMade ? renderMissedOffer(missedOffer) : ''}

        <!-- Coach message block -->
        <div class="cp-coach-block" aria-live="polite">
          <div class="cp-greeting">${proposal.greeting}</div>

          ${proposal.reflection ? `<p class="cp-reflection">${proposal.reflection}</p>` : ''}

          ${proposal.constraint ? `
            <div class="cp-constraint" role="status" aria-live="polite">
              <p>${proposal.constraint}</p>
            </div>` : ''}

          <p class="cp-proposal-intro">${proposal.intro}</p>
        </div>

        <!-- Three doors -->
        <div class="cp-doors" role="group" aria-label="Choose how you want to move today">
          ${renderDoorFront('door-1')}
          ${renderDoorFront('door-2')}
          ${renderDoorFront('door-3')}
        </div>

        <!-- Bypass door -->
        <div class="cp-bypass">
          ${renderBypassDoor(tier)}
        </div>

        <!-- Post-choice acknowledgement (hidden until choice made) -->
        <div class="cp-acknowledgement"
             id="cp-acknowledgement"
             aria-live="polite"
             role="status"
             style="display:none;">
        </div>

        <!-- Door 1 preview panel (v8) — always in the DOM, hidden until opened -->
        ${renderPreviewPanel()}

      </div>
    `;

    attachEvents(container);
  }

  // ── Door front renderer (v8) ────────────────────────────────────────────

  function renderDoorFront(key) {
    const d = DOOR_COPY[key];
    const isDisabled = !d.enabled;
    return `
      <button
        class="cp-door ${isDisabled ? 'cp-door--disabled' : ''}"
        id="${key}"
        ${isDisabled ? 'aria-disabled="true" disabled' : ''}
        aria-label="${d.title}${isDisabled ? ', ' + d.disabledReason : ''}"
        ${isDisabled ? `aria-describedby="${key}-helper"` : ''}
        data-door="${key}">
        <span class="cp-door__label">${d.title}</span>
        <span class="cp-door__line">${d.line}</span>
        ${isDisabled ? `<span class="cp-door__helper" id="${key}-helper">${d.disabledReason}</span>` : ''}
      </button>
    `;
  }

  // ── Door 1 preview panel (v8) ────────────────────────────────────────────

  function renderPreviewPanel() {
    return `
      <div id="cp-preview-panel"
           class="cp-preview-panel ${previewOpen ? 'is-open' : ''}"
           role="dialog"
           aria-modal="true"
           aria-labelledby="cp-preview-title"
           ${previewOpen ? '' : 'hidden'}>
        <div class="cp-preview-panel__backdrop"></div>
        <div class="cp-preview-panel__content">
          <button class="cp-preview-panel__close" id="cp-preview-close" aria-label="Close">\u2715</button>
          <h2 id="cp-preview-title" class="cp-preview-panel__title">Today\u2019s session</h2>
          <p class="cp-preview-panel__sub">
            Adapted for your check-in \u2014 pick the one that feels right.
          </p>
          <div class="cp-preview-cards" role="radiogroup" aria-label="Choose today's session">
            ${currentPreviewOptions.map((opt, i) => renderPreviewCard(opt, i === 0)).join('')}
          </div>
          <div class="cp-preview-panel__actions">
            <button class="btn btn-ghost" id="cp-preview-not-today" aria-label="Not today \u2014 close">
              Not today
            </button>
            <button class="btn btn-primary" id="cp-preview-start"
                    aria-label="Start session"
                    ${selectedOptionId ? '' : 'disabled'}>
              Start Session
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderPreviewCard(option, isRecommended) {
    const selected = option.id === selectedOptionId;
    return `
      <button class="cp-preview-card ${selected ? 'cp-preview-card--selected' : ''} ${isRecommended ? 'cp-preview-card--recommended' : ''}"
              role="radio"
              aria-checked="${selected ? 'true' : 'false'}"
              data-option-id="${option.id}"
              aria-label="${option.name}, about ${option.duration} minutes${isRecommended ? ', recommended' : ''}">
        ${isRecommended ? '<span class="cp-preview-card__badge">Recommended</span>' : ''}
        <span class="cp-preview-card__name">${option.name}</span>
        <span class="cp-preview-card__meta">${option.duration} min \u00b7 ${option.exerciseCount} exercises</span>
        <p class="cp-preview-card__why">${option.rationale}</p>
      </button>
    `;
  }

  // ── Preview panel open/close (v8) ───────────────────────────────────────

  function openPreviewPanel(options, container) {
    currentPreviewOptions = options;
    selectedOptionId      = null;
    previewOpen           = true;
    _rerenderPanel(container);
    document.addEventListener('keydown', _previewKeydown);
    _focusFirstInPanel(container);
  }

  function closePreviewPanel(container) {
    previewOpen      = false;
    selectedOptionId = null;
    document.removeEventListener('keydown', _previewKeydown);
    _rerenderPanel(container);
    const doorBtn = container.querySelector('#door-1');
    if (doorBtn) doorBtn.focus();
  }

  function _rerenderPanel(container) {
    const existing = container.querySelector('#cp-preview-panel');
    if (existing) {
      existing.outerHTML = renderPreviewPanel();
      attachPreviewEvents(container);
    }
  }

  function _previewKeydown(e) {
    if (e.key !== 'Escape') return;
    const container = document.getElementById('main-content');
    if (container) closePreviewPanel(container);
  }

  function _focusFirstInPanel(container) {
    setTimeout(() => {
      const panel = container.querySelector('#cp-preview-panel');
      const first = panel?.querySelector('button:not([disabled])');
      if (first) first.focus();
    }, 50);
  }

  function attachPreviewEvents(container) {
    const panel = container.querySelector('#cp-preview-panel');
    if (!panel) return;

    panel.querySelector('.cp-preview-panel__backdrop')?.addEventListener('click', () => closePreviewPanel(container));
    panel.querySelector('#cp-preview-close')?.addEventListener('click', () => closePreviewPanel(container));
    panel.querySelector('#cp-preview-not-today')?.addEventListener('click', () => closePreviewPanel(container));

    panel.querySelectorAll('[data-option-id]').forEach(card => {
      card.addEventListener('click', () => {
        selectedOptionId = card.dataset.optionId;
        _rerenderPanel(container);
      });
    });

    panel.querySelector('#cp-preview-start')?.addEventListener('click', () => {
      if (!selectedOptionId) return;
      const chosen = currentPreviewOptions.find(o => o.id === selectedOptionId);
      if (chosen) handlePreviewStart(chosen, container);
    });

    panel.addEventListener('keydown', _trapFocus);
  }

  function handlePreviewStart(option, container) {
    if (choiceMade) return;
    choiceMade = true;

    store.set('lastProposalType', 'door-1');
    store.set('lastProposalDate', new Date().toISOString());

    closePreviewPanel(container);

    const ackEl = container.querySelector('#cp-acknowledgement');
    if (ackEl) {
      ackEl.style.display = '';
      ackEl.textContent = 'Good. Let\u2019s go.';
      ackEl.focus();
    }

    store.set('generatedSession', {
      session: option,
      builtAt: new Date().toISOString(),
      inputs:  option.inputs || {}
    });

    const timingRules = getTimingRules({ difficultTopic: false });
    setTimeout(() => {
      if (reEntryCtx) clearReturnContext();
      router.navigate(_routeForOption(option));
    }, timingRules.delayMs + 400);
  }

  function _trapFocus(e) {
    if (e.key !== 'Tab') return;
    const panel = document.getElementById('cp-preview-panel');
    if (!panel) return;
    const focusable = [...panel.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )];
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  // ── Bypass door renderer ───────────────────────────────────────────────────

  function renderBypassDoor(tier) {
    // Two flavours:
    // 1. Coach facilitates — person knows direction, coach helps build
    // 2. Straight to library — person knows exactly what they want
    return `
      <div class="cp-bypass__label" id="cp-bypass-label">I know what I want today</div>
      <div class="cp-bypass__options" role="group" aria-labelledby="cp-bypass-label">
        <button class="cp-bypass__btn"
                data-door="bypass-facilitate"
                data-route="session-builder"
                aria-label="Help me build it — I know the direction, coach helps shape it">
          Help me build it
        </button>
        <button class="cp-bypass__btn"
                data-door="bypass-library"
                data-route="library"
                aria-label="Take me to the library — I know exactly what I want">
          Take me to the library
        </button>
      </div>
    `;
  }

  // ── Return door renderer ───────────────────────────────────────────────────

  function renderReturnDoor() {
    // Sideways door — never "why did you miss sessions?"
    // "Anything you'd like me to know about the last little while?"
    return `
      <div class="cp-return-door" role="region" aria-label="Welcome back">
        <p class="cp-return-door__message">
          It's good to see you. Anything you'd like me to know about the last little while?
          Completely optional — we can also just begin.
        </p>
        <div class="cp-return-door__chips"
             role="group"
             aria-label="What was the last little while like?">
          <button class="cp-chip" data-return-context="life"
                  aria-pressed="false">Life got full</button>
          <button class="cp-chip" data-return-context="illness"
                  aria-pressed="false">Was unwell</button>
          <button class="cp-chip" data-return-context="harder"
                  aria-pressed="false">Finding it harder</button>
          <button class="cp-chip cp-chip--skip" data-return-context="skip"
                  aria-pressed="false">Rather not say — let's just begin</button>
        </div>
      </div>
    `;
  }

  // ── Missed session offer renderer ──────────────────────────────────────────

  function renderMissedOffer(offer) {
    return `
      <div class="cp-missed-offer" role="region" aria-label="Session adaptation offer">
        <p class="cp-missed-offer__line">${offer.coachLine}</p>
        <div class="cp-missed-offer__choices"
             role="group"
             aria-label="How would you like to adapt?">
          <button class="cp-missed-offer__btn" data-adapt="compress"
                  aria-label="Stay in 12 weeks — ${offer.compressWeeklySessions} sessions per week">
            Stay in 12 weeks
            <span class="cp-missed-offer__sub">${offer.compressWeeklySessions} sessions a week from here</span>
          </button>
          <button class="cp-missed-offer__btn" data-adapt="extend"
                  aria-label="Keep the same rhythm — extend by ${offer.extendWeeksNeeded} week${offer.extendWeeksNeeded !== 1 ? 's' : ''}">
            Keep the same rhythm
            <span class="cp-missed-offer__sub">Extend by ${offer.extendWeeksNeeded} week${offer.extendWeeksNeeded !== 1 ? 's' : ''}</span>
          </button>
        </div>
      </div>
    `;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container) {
    // Door 1 opens the preview panel (v8)
    container.querySelector('[data-door="door-1"]')?.addEventListener('click', () => {
      if (choiceMade) return;
      openPreviewPanel(proposal.options, container);
    });

    // Bypass door choices (unchanged mechanism)
    container.querySelectorAll('[data-door="bypass-facilitate"], [data-door="bypass-library"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const doorKey = btn.dataset.door;
        const route   = btn.dataset.route;
        handleDoorChoice(doorKey, route, container);
      });
    });

    // Return context chips
    container.querySelectorAll('[data-return-context]').forEach(btn => {
      btn.addEventListener('click', e => {
        const context = btn.dataset.returnContext;
        handleReturnContext(context, container);
      });
    });

    // Missed session adaptation
    container.querySelectorAll('[data-adapt]').forEach(btn => {
      btn.addEventListener('click', e => {
        const choice = btn.dataset.adapt;
        handleMissedAdaptation(choice, container);
      });
    });

    // Door 1 preview panel — always present in the DOM (v8)
    attachPreviewEvents(container);
  }

  // ── Bypass door choice handler (v8 — simplified, bypass-only) ─────────────

  function handleDoorChoice(doorKey, route, container) {
    if (choiceMade) return;
    choiceMade = true;

    store.set('lastProposalType', doorKey);
    store.set('lastProposalDate', new Date().toISOString());

    const ack = _buildAcknowledgement(doorKey);
    const ackEl = container.querySelector('#cp-acknowledgement');
    if (ackEl) {
      ackEl.style.display = '';
      ackEl.textContent = ack;
      ackEl.focus();
    }

    const timingRules = getTimingRules({ difficultTopic: false });
    setTimeout(() => {
      if (route === 'library') {
        router.navigate('library');
      } else if (route === 'session-builder') {
        router.navigate('session-builder');
      }
    }, timingRules.delayMs + 400);
  }

  // ── Return context handler ─────────────────────────────────────────────────

  function handleReturnContext(context, container) {
    if (context !== 'skip') {
      captureReturnContext(context);
    }

    // Dismiss return door and rebuild proposal with re-entry context applied
    reEntryCtx = getReEntryContext();
    proposal   = buildProposal();

    const returnDoorEl = container.querySelector('.cp-return-door');
    if (returnDoorEl) {
      returnDoorEl.style.display = 'none';
    }

    // Rebuild just the doors section with adapted proposal
    const doorsEl = container.querySelector('.cp-doors');
    if (doorsEl) {
      doorsEl.innerHTML =
        renderDoorFront('door-1') +
        renderDoorFront('door-2') +
        renderDoorFront('door-3');
      attachEvents(container);
    }
  }

  // ── Missed adaptation handler ──────────────────────────────────────────────

  function handleMissedAdaptation(choice, container) {
    applyMissedSessionAdaptation(choice);

    const offerEl = container.querySelector('.cp-missed-offer');
    if (offerEl) offerEl.style.display = 'none';

    missedOffer = null;
  }

  // ── Proposal builder ───────────────────────────────────────────────────────

  /**
   * Build the full proposal object.
   * v8: returns the raw `options` array (for Door 1's preview panel) in
   * addition to everything previous versions returned. `doors` no longer
   * built here — door copy is now static (DOOR_COPY), not derived per
   * option. severePainOverride retained on the object for now (unused by
   * rendering directly) in case Door 2's build wants to reference it.
   */
  function buildProposal() {
    const voice        = getActiveVoice();
    const name         = store.get('name') || '';
    const energy       = store.get('lastCheckin.feelingWord')
                           ? store.get('lastCheckin.feelingWord')
                           : null;
    const energyScore  = _getCheckinEnergy();
    const moodScore    = _getCheckinMood();
    const painScores   = store.get('conditionPainScores') || {};
    const conditions   = store.get('conditions') || [];
    const goals        = store.get('goals') || [];
    const availTime    = _getAvailableTime();
    const burnout      = detectBurnout(store.get('checkinHistory') || {});
    const phaseBias    = getPhaseBias();
    const primaryGoal  = getPrimaryEngineGoal(goals);
    const feelingWord  = store.get('lastCheckin.feelingWord');

    // Pain override check
    const severePain   = _checkSeverePain(conditions, painScores);
    const moderatePain = _checkModeratePain(conditions, painScores);

    // Re-entry intensity adjustment
    let effectiveIntensity = phaseBias.intensityBias;
    if (reEntryCtx?.needsGentlerStart) {
      effectiveIntensity = getReEntryIntensity('illness', effectiveIntensity);
    }

    // Generate three options from workout generator — these become
    // Door 1's preview cards (v8), already returned in priority order.
    // v9: effectiveIntensity and availTime are now genuinely applied —
    // see _generateOptions().
    let options = _generateOptions(energyScore, effectiveIntensity, availTime);
    while (options.length < 3) {
      options.push(_getFallbackOption(options.length));
    }

    // Build greeting
    const greeting = _buildGreeting(name, feelingWord);

    // Build reflection (last 48h activity)
    const reflection = _buildReflection();

    // Build constraint message if pain is moderate
    const constraint = moderatePain.hasModerate
      ? _buildConstraintMessage(moderatePain, conditions, painScores)
      : null;

    // Build intro line
    const intro = _buildIntro(primaryGoal, feelingWord, burnout, reEntryCtx);

    return {
      greeting,
      reflection,
      constraint,
      intro,
      options,
      severePainOverride: severePain.hasSevere,
    };
  }

  // ── Post-choice acknowledgement (v8 — bypass-only) ─────────────────────────

  function _buildAcknowledgement(doorKey) {
    // One line. Treats the choice as real. Not a confirmation or summary.
    // v8: only the bypass door reaches this now — door-1's "Good. Let's
    // go." acknowledgement is set directly in handlePreviewStart().
    if (doorKey === 'bypass-facilitate') {
      return 'Let\'s build it together.';
    }
    if (doorKey === 'bypass-library') {
      return 'Go find what you need. I\'ll be here when you\'re done.';
    }
    return 'On your way.';
  }

  // ── Greeting ───────────────────────────────────────────────────────────────

  function _buildGreeting(name, feelingWord) {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Morning'
                       : hour < 17 ? 'Afternoon'
                       : 'Evening';
    const displayName = name ? `, ${name}` : '';

    // If re-entry, greeting acknowledges it without making the gap the subject
    if (reEntryCtx && !reEntryCtx.contextCaptured) {
      return `Good to see you${displayName}.`;
    }

    return `${timeGreeting}${displayName}.`;
  }

  // ── Reflection (last 48h activity) ────────────────────────────────────────

  function _buildReflection() {
    const activityLog = store.get('activityLog') || [];
    const cutoff      = Date.now() - (48 * 60 * 60 * 1000);
    const recent      = activityLog.filter(entry => {
      const ts = entry.completedAt || entry.loggedAt || entry.date;
      return ts && new Date(ts).getTime() > cutoff;
    });

    if (recent.length === 0) return null;

    const ACTIVITY_LABELS = {
      'workout':          'strength work',
      'morning-session':  'morning movement',
      'yoga-session':     'yoga',
      'walk-session':     'a walk',
      'running-session':  'a run',
      'cycle-session':    'cycling',
      'swim-session':     'swimming',
      'core-session':     'core work',
      'quiet-session':    'a breathing session',
      'breathing-session':'a breathing session',
      'gym-programme':    'gym work',
    };

    // Deduplicate by type
    const typesSeen = new Set();
    const uniqueTypes = [];
    recent.forEach(entry => {
      const type = entry.type || entry.activityType || 'movement';
      if (!typesSeen.has(type)) {
        typesSeen.add(type);
        uniqueTypes.push(ACTIVITY_LABELS[type] || type);
      }
    });

    const voice = getActiveVoice();

    if (uniqueTypes.length === 1) {
      return `Since yesterday, you did ${uniqueTypes[0]}.`;
    }
    if (uniqueTypes.length === 2) {
      return `Since yesterday, you did ${uniqueTypes[0]} and ${uniqueTypes[1]}.`;
    }
    const last = uniqueTypes.pop();
    return `Since yesterday, you did ${uniqueTypes.join(', ')}, and ${last}.`;
  }

  // ── Intro line ─────────────────────────────────────────────────────────────

  function _buildIntro(primaryGoal, feelingWord, burnout, reEntryCtx) {
    if (burnout) {
      return 'Your body has been running low. Today is for gentle movement only.';
    }
    if (reEntryCtx?.needsGentlerStart) {
      return 'Welcome back. Starting gently — that\'s the right call after being unwell.';
    }
    if (reEntryCtx && reEntryCtx.gapDays >= 7) {
      return 'Good to have you back. Here\'s what I\'d suggest for today.';
    }

    // Goal-connected intro
    const goalIntros = {
      'feel-good':       'Here\'s what might help you feel it today.',
      'build-muscle':    'Three options for today — the programme is building.',
      'weight-loss':     'Here\'s today — three different ways to move.',
      'improve-cardio':  'Three options. All of them move the cardio work forward.',
      'flexibility':     'Three ways to work on range and ease today.',
      'balance':         'Three options — all of them build the stability work.',
      'injury-recovery': 'Three options — all adapted to where your body is today.',
      'return-to-fitness': 'Three options for today. All of them count.',
    };

    return goalIntros[primaryGoal] || 'Here\'s what I\'d suggest for today.';
  }

  // ── Pain checks ────────────────────────────────────────────────────────────

  function _checkSeverePain(conditions, painScores) {
    const severeConditions = conditions.filter(id => (painScores[id] || 0) >= 7);
    if (severeConditions.length === 0) return { hasSevere: false };

    const worstId    = severeConditions[0];
    const painLevel  = painScores[worstId];

    return {
      hasSevere:     true,
      affectedZone:  worstId,
      painLevel,
    };
  }

  function _checkModeratePain(conditions, painScores) {
    const moderateConditions = conditions.filter(
      id => (painScores[id] || 0) >= 4 && (painScores[id] || 0) < 7
    );
    return { hasModerate: moderateConditions.length > 0, conditions: moderateConditions };
  }

  function _buildConstraintMessage(moderatePain, conditions, painScores) {
    const id        = moderatePain.conditions[0];
    const painLevel = painScores[id] || 4;
    return `Your check-in flagged ${id} today (${painLevel}/10). I\'ve worked around that.`;
  }

  // ── Option generation ──────────────────────────────────────────────────────

  /**
   * v9 — REWRITTEN. Was: look up window._workoutGenerator at runtime and
   * call it with a parameter object that the real function always
   * discarded (it takes zero parameters). Now: direct top-level import,
   * called with no arguments to match its real signature. The two values
   * that genuinely needed to reach the generator — the re-entry-adjusted
   * intensity and availableTime — are written to store immediately
   * before the call, which is how generateDailyOptions() actually reads
   * its inputs (store.get("todayIntensity"), store.get("availableTime")).
   * energyScore is kept as a parameter here only because _getFallbackOptions()
   * (the error/unavailable path) still needs it — it is not sent to the
   * real generator, which derives energy itself from checkinData.
   */
  function _generateOptions(energyScore, intensity, availTime) {
    try {
      if (intensity) {
        store.set('todayIntensity', intensity);
      }
      if (availTime) {
        store.set('availableTime', availTime);
      }
      return workoutGenerator.generateDailyOptions();
    } catch (e) {
      console.warn('coach-proposal: workoutGenerator unavailable, using fallbacks', e);
      return _getFallbackOptions(energyScore, intensity);
    }
  }

  function _getFallbackOptions(energyScore, intensity) {
    const availMins = _getAvailableTime() || 30;
    // v8: shape normalised to match real generator output — id, name,
    // duration, exerciseCount, rationale — since these now feed Door 1's
    // preview cards directly, not just old per-door coach lines.
    const raw = (energyScore <= 3 || intensity === 'gentle')
      ? [
          { label: 'Gentle movement',   type: 'workout',       durationMins: Math.min(20, availMins), exerciseCount: 4 },
          { label: 'Breathing session', type: 'quiet-session', durationMins: Math.min(15, availMins), exerciseCount: 3 },
          { label: 'Short walk',        type: 'walk-session',  durationMins: Math.min(20, availMins), exerciseCount: 1 },
        ]
      : [
          { label: 'Strength session',  type: 'workout',       durationMins: Math.min(35, availMins), exerciseCount: 6 },
          { label: 'Mobility work',     type: 'yoga-session',  durationMins: Math.min(25, availMins), exerciseCount: 5 },
          { label: 'Breathing session', type: 'quiet-session', durationMins: Math.min(15, availMins), exerciseCount: 3 },
        ];

    return raw.map((opt, i) => ({
      id:            `fallback-${opt.type}-${Date.now()}-${i}`,
      name:          opt.label,
      type:          opt.type,
      duration:      opt.durationMins,
      exerciseCount: opt.exerciseCount,
      rationale:     'A steady option for today.',
      exercises:     []
    }));
  }

  function _getFallbackOption(index) {
    const opt = [
      { label: 'Mobility',  type: 'yoga-session',  durationMins: 20, exerciseCount: 4 },
      { label: 'Breathing', type: 'quiet-session',  durationMins: 15, exerciseCount: 3 },
      { label: 'Short walk',type: 'walk-session',   durationMins: 20, exerciseCount: 1 },
    ][index] || { label: 'Movement', type: 'workout', durationMins: 20, exerciseCount: 4 };

    return {
      id:            `fallback-${opt.type}-${Date.now()}-${index}`,
      name:          opt.label,
      type:          opt.type,
      duration:      opt.durationMins,
      exerciseCount: opt.exerciseCount,
      rationale:     'A steady option for today.',
      exercises:     []
    };
  }

  function _routeForOption(option) {
    // v9: confirmed via ground-truthing workoutGenerator.js this session —
    // real generated options never carry `type` (only `focus`), so this
    // always falls through to 'workout' for real options. That is correct:
    // generateWorkout() only ever produces generic exercise-list sessions
    // shaped for workout.js, regardless of focus. Fallback options DO carry
    // type and route correctly already. See v9 changelog note above.
    const TYPE_TO_ROUTE = {
      'workout':          'workout',
      'morning-session':  'morning-session',
      'yoga-session':     'yoga-session',
      'walk-session':     'walk-session',
      'running-session':  'running-session',
      'cycle-session':    'cycle-session',
      'swim-session':     'swim-session',
      'core-session':     'core-session',
      'quiet-session':    'quiet-session',
      'gym-programme':    'gym-programme',
    };
    return TYPE_TO_ROUTE[option.type] || 'workout';
  }

  // ── Store helpers ──────────────────────────────────────────────────────────

  function _getCheckinEnergy() {
    const history = store.get('checkinHistory') || {};
    const today   = new Date().toISOString().split('T')[0];
    return history[today]?.energy || store.get('lastCheckin.energy') || 5;
  }

  function _getCheckinMood() {
    const history = store.get('checkinHistory') || {};
    const today   = new Date().toISOString().split('T')[0];
    return history[today]?.mood || store.get('lastCheckin.mood') || 5;
  }

  function _getAvailableTime() {
    const history = store.get('checkinHistory') || {};
    const today   = new Date().toISOString().split('T')[0];
    return history[today]?.availableTime
        || store.get('lastCheckin.availableTime')
        || 30;
  }

  // ── Public interface ───────────────────────────────────────────────────────

  return { mount };
}
