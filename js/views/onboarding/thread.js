/**
 * js/views/onboarding/thread.js
 * 29 Jun 2026 v1
 *
 * OB-THREAD — the complete onboarding conversational experience.
 * One screen. The coach speaks first. The relationship begins here.
 *
 * Replaces the entire previous multi-screen onboarding flow.
 * Supersedes: arrival.js, hard-before.js, reflection.js, complete.js,
 *             frequency.js (all retired after this passes QA).
 *
 * Reuses (via sheet-manager.js): goals.js, conditions.js,
 *             equipment.js, plan-select.js — unchanged.
 *
 * Import paths: this file lives at js/views/onboarding/thread.js.
 *   store.js    → ../../store.js
 *   data files  → ../../data/
 *   sheet-mgr   → ./sheet-manager.js
 *
 * Architecture:
 *   - One scrollable thread. Coach bubbles left. User bubbles right.
 *   - Typing indicator before every coach message.
 *   - Inline chips for simple selections (Steps 3a, 3b, 6, 9, 10, 12).
 *   - Inline text input for name (Step 2).
 *   - 95% bottom sheet for complex forms (Steps 7, 8, 11, 13).
 *   - Sequential reveal for Beat 3 reflection (Step 4).
 *   - Begin button fades in after Step 14 coach message.
 *
 * WCAG 2.2 AA:
 *   - All interactive elements ≥ 44px touch target (via CSS).
 *   - Focus management: after each step completes, focus moves to
 *     the next interactive element or the thread scroll area.
 *   - aria-live="polite" on thread scroll area announces new bubbles.
 *   - Chip role="checkbox" (multi) / role="radio" (single) per group.
 *   - prefers-reduced-motion: typing indicator hidden, fade timings
 *     collapsed to 0ms.
 *   - Sheet focus trap handled by sheet-manager.js.
 */

import { store }              from '../../store.js';
import { getBeat3Script }     from '../../data/beat3-scripts.js';
import {
  STEPS,
  STEP_ORDER,
  HARD_BEFORE_CHIPS,
  HARD_BEFORE_PHRASE_MAP,
  AGE_CHIPS,
  ACTIVITY_CHIPS,
  ENERGY_CHIPS,
  FREQUENCY_CHIPS,
  FALLBACK_REFLECTION,
  generateSummary,
  generateConditionsAck,
  generateFrequencyAck,
}                             from '../../data/onboarding-thread-data.js';
import { openSheet }          from './sheet-manager.js';

// ─────────────────────────────────────────────────────────────────────────────
// MOTION PREFERENCE
// ─────────────────────────────────────────────────────────────────────────────

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Timing constants — collapsed to near-zero when motion is reduced
const T = {
  TYPING_SHOW:     REDUCED_MOTION ?   0 : 300,   // ms before typing indicator appears
  TYPING_MIN:      REDUCED_MOTION ?   0 : 800,   // ms typing indicator shown minimum
  BUBBLE_DELAY:    REDUCED_MOTION ?   0 : 120,   // ms after typing before bubble appears
  PART_DELAY:      REDUCED_MOTION ?   0 : 1800,  // ms between sequential reveal parts
  PART_FADE:       REDUCED_MOTION ?   0 : 400,   // ms fade per part
  AUTO_ADVANCE:    REDUCED_MOTION ?   0 : 1200,  // ms after last part before advancing
  INPUT_APPEAR:    REDUCED_MOTION ?   0 : 250,   // ms before input bar appears
  CHIP_APPEAR:     REDUCED_MOTION ?   0 : 200,   // ms before chip tray appears
  BEGIN_DELAY:     REDUCED_MOTION ?   0 : 600,   // ms before Begin button appears
  SCROLL_DELAY:    REDUCED_MOTION ?   0 :  80,   // ms before scroll-to-bottom
};

// ─────────────────────────────────────────────────────────────────────────────
// VIEW FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export function ThreadView(router) {

  // ── State ──────────────────────────────────────────────────────────────────
  let _container   = null;   // root container passed to mount()
  let _thread      = null;   // .ob-thread__scroll element
  let _currentStep = null;   // current step id
  let _skippedHardBefore = false; // true if user chose "I'd rather not say"

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    _container = container;

    container.innerHTML = `
      <div class="ob-thread" role="main" aria-label="Alongside onboarding">
        <div class="ob-thread__scroll"
             id="ob-thread-scroll"
             aria-live="polite"
             aria-atomic="false"
             aria-relevant="additions">
        </div>
      </div>
    `;

    _thread = container.querySelector('#ob-thread-scroll');

    // Run splash then begin the conversation
    _runSplash();
  }

  // ── Step 0 — Splash ────────────────────────────────────────────────────────

  function _runSplash() {
    const splash = document.createElement('div');
    splash.className = 'ob-splash';
    splash.setAttribute('aria-hidden', 'true');
    splash.innerHTML = `<span class="ob-splash__wordmark">alongside</span>`;
    document.body.appendChild(splash);

    requestAnimationFrame(() => {
      splash.classList.add('is-visible');
      setTimeout(() => {
        splash.classList.remove('is-visible');
        setTimeout(() => {
          splash.remove();
          _beginThread();
        }, 400);
      }, STEPS[0].durationMs);
    });
  }

  // ── Begin thread — Step 1 ──────────────────────────────────────────────────

  function _beginThread() {
    // Write threadStartedAt
    store.set('onboarding.threadStartedAt', new Date().toISOString());
    _runStep(1);
  }

  // ── Step runner ────────────────────────────────────────────────────────────

  async function _runStep(stepId) {
    _currentStep = stepId;
    const step = STEPS[stepId];
    if (!step) {
      console.error(`ThreadView: no step config for id "${stepId}"`);
      return;
    }

    switch (step.type) {

      case 'coach-only':
        await _showCoachBubble(step.coach);
        if (stepId === 5) {
          // Bridge step — auto-advance to Step 6
          _runStep(6);
        }
        break;

      case 'inline-text':
        await _showCoachBubble(step.coach.replace('[Name]', store.get('name') || ''));
        _showTextInput(step);
        break;

      case 'inline-chips-multi':
        await _showCoachBubble(step.coach);
        _showChipsMulti(step);
        break;

      case 'inline-chips-single':
        await _showCoachBubble(step.coach);
        _showChipsSingle(step);
        break;

      case 'inline-chips-primary':
        await _showCoachBubble(step.coach);
        _showChipsPrimary(step);
        break;

      case 'sequential-reveal':
        await _runSequentialReveal(step);
        break;

      case 'sheet':
        await _showCoachBubble(step.coach);
        _showSheetBar(step);
        break;

      case 'closing':
        await _showCoachBubble(
          step.coach.replace('[name]', store.get('name') || '')
        );
        _showBeginButton(step);
        break;

      default:
        console.warn(`ThreadView: unknown step type "${step.type}"`);
    }
  }

  // ── Typing indicator ───────────────────────────────────────────────────────

  function _showTyping() {
    const el = document.createElement('div');
    el.className = 'ob-typing';
    el.setAttribute('aria-label', 'Coach is typing');
    el.setAttribute('role', 'status');
    el.innerHTML = `
      <span class="ob-typing__dot" aria-hidden="true"></span>
      <span class="ob-typing__dot" aria-hidden="true"></span>
      <span class="ob-typing__dot" aria-hidden="true"></span>
    `;
    _thread.appendChild(el);
    _scrollToBottom();

    setTimeout(() => el.classList.add('is-visible'), T.TYPING_SHOW);
    return el;
  }

  function _removeTyping(el) {
    el.classList.remove('is-visible');
    setTimeout(() => el.remove(), 200);
  }

  // ── Coach bubble ───────────────────────────────────────────────────────────

  /**
   * Show typing indicator, then replace with a coach bubble.
   * Supports multi-paragraph text via \n\n (renders as separate paragraphs).
   * Returns a promise that resolves when the bubble is visible.
   */
  function _showCoachBubble(text) {
    return new Promise(resolve => {
      const typing = _showTyping();

      // Calculate a realistic typing delay based on text length
      const words   = (text || '').split(/\s+/).length;
      const typeMs  = Math.min(Math.max(words * 40, T.TYPING_MIN), 3000);

      setTimeout(() => {
        _removeTyping(typing);

        setTimeout(() => {
          const bubble = document.createElement('div');
          bubble.className = 'ob-bubble ob-bubble--coach';
          bubble.innerHTML = _formatCoachText(text);
          _thread.appendChild(bubble);
          _scrollToBottom();

          requestAnimationFrame(() => bubble.classList.add('is-visible'));
          resolve();
        }, T.BUBBLE_DELAY);

      }, REDUCED_MOTION ? 0 : typeMs);
    });
  }

  /**
   * Format coach text: \n\n → paragraph breaks, \n → <br>.
   */
  function _formatCoachText(text) {
    if (!text) return '';
    return text
      .split('\n\n')
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  // ── User bubble ────────────────────────────────────────────────────────────

  function _showUserBubble(text) {
    const bubble = document.createElement('div');
    bubble.className = 'ob-bubble ob-bubble--user';
    bubble.textContent = text;
    _thread.appendChild(bubble);
    _scrollToBottom();
    requestAnimationFrame(() => bubble.classList.add('is-visible'));
    return bubble;
  }

  // ── Scroll to bottom ───────────────────────────────────────────────────────

  function _scrollToBottom() {
    setTimeout(() => {
      if (_thread) {
        _thread.scrollTop = _thread.scrollHeight;
      }
    }, T.SCROLL_DELAY);
  }

  // ── Next step helper ───────────────────────────────────────────────────────

  function _nextStep(currentId) {
    const idx = STEP_ORDER.indexOf(currentId);
    if (idx === -1 || idx >= STEP_ORDER.length - 1) return null;
    return STEP_ORDER[idx + 1];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2 — Inline text input (name)
  // ─────────────────────────────────────────────────────────────────────────

  function _showTextInput(step) {
    const bar = document.createElement('div');
    bar.className = 'ob-input-bar';
    bar.innerHTML = `
      <input
        class="ob-input-bar__field"
        type="text"
        placeholder="${_esc(step.placeholder || '')}"
        autocomplete="given-name"
        aria-label="Your first name"
        maxlength="50"
      />
      <button class="ob-input-bar__send" aria-label="Send" disabled>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
        </svg>
      </button>
    `;
    _container.querySelector('.ob-thread').appendChild(bar);

    setTimeout(() => bar.classList.add('is-visible'), T.INPUT_APPEAR);

    const field  = bar.querySelector('.ob-input-bar__field');
    const sendBtn = bar.querySelector('.ob-input-bar__send');

    // Enable send only when field has content
    field.addEventListener('input', () => {
      sendBtn.disabled = field.value.trim().length === 0;
    });

    const submit = async () => {
      const name = field.value.trim();
      if (!name) return;

      // Lock input
      field.disabled  = true;
      sendBtn.disabled = true;
      bar.classList.remove('is-visible');

      // Write to store
      store.set('name', name);

      // User bubble
      _showUserBubble(name);

      // Remove input bar after animation
      setTimeout(() => bar.remove(), 300);

      // Coach response (uses name)
      const coachText = step.coach.replace(/\[Name\]/g, name);
      await _showCoachBubble(coachText);

      _runStep(_nextStep(step.id));
    };

    sendBtn.addEventListener('click', submit);
    field.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });

    // Focus the field
    setTimeout(() => field.focus(), T.INPUT_APPEAR + 50);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3a — Multi-select chips (Hard Before)
  // ─────────────────────────────────────────────────────────────────────────

  function _showChipsMulti(step) {
    const selected = new Set();

    const wrap = document.createElement('div');
    wrap.className = 'ob-chips';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'What made it hard before — select all that apply');

    wrap.innerHTML = `
      <div class="ob-chips__wrap" role="group" aria-label="Options">
        ${step.chips.map(chip => `
          <button
            class="ob-chip"
            role="checkbox"
            aria-checked="false"
            data-id="${_esc(chip.id)}"
            aria-label="${_esc(chip.label)}">
            ${_esc(chip.label)}
          </button>
        `).join('')}
        <button
          class="ob-chip ob-chip--skip"
          data-skip="true"
          aria-label="${_esc(step.skipLabel || "I'd rather not say")}">
          ${_esc(step.skipLabel || "I'd rather not say")}
        </button>
      </div>
      <button class="ob-chips__confirm" disabled aria-label="Confirm selections">
        Confirm
      </button>
    `;

    _thread.appendChild(wrap);
    _scrollToBottom();
    setTimeout(() => wrap.classList.add('is-visible'), T.CHIP_APPEAR);

    const confirmBtn = wrap.querySelector('.ob-chips__confirm');

    // Chip toggle
    wrap.querySelectorAll('.ob-chip:not(.ob-chip--skip)').forEach(btn => {
      btn.addEventListener('click', () => {
        const id      = btn.dataset.id;
        const checked = btn.getAttribute('aria-checked') === 'true';
        if (checked) {
          selected.delete(id);
          btn.setAttribute('aria-checked', 'false');
          btn.classList.remove('is-selected');
        } else {
          selected.add(id);
          btn.setAttribute('aria-checked', 'true');
          btn.classList.add('is-selected');
        }
        confirmBtn.disabled = selected.size === 0;
      });
    });

    // Skip
    wrap.querySelector('[data-skip]').addEventListener('click', async () => {
      _lockChips(wrap);
      _skippedHardBefore = true;
      _showUserBubble("I'd rather not say.");
      // Jump to Step 5 (bridge), skipping 3b and 4
      await _showCoachBubble("That's completely fine. Let's move on.");
      _runStep(5);
    });

    // Confirm
    confirmBtn.addEventListener('click', async () => {
      if (selected.size === 0) return;
      _lockChips(wrap);

      const selections = Array.from(selected);

      // Write to store
      store.set('onboarding.hardBeforeSelections', selections);
      store.set('onboarding.hardBeforeShownAt', new Date().toISOString());

      // User bubble — one phrase per selection
      const summaryText = generateSummary('hardBefore', selections);
      _showUserBubble(summaryText);

      // Advance to 3b or skip straight to 4 if only one selection
      if (selections.length === 1) {
        // Auto-write primaryTerritory and skip 3b
        store.set('onboarding.primaryTerritory', selections[0]);
        _runStep(4);
      } else {
        _runStep('3b');
      }
    });

    // Focus first chip
    setTimeout(() => wrap.querySelector('.ob-chip')?.focus(), T.CHIP_APPEAR + 50);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3b — Single select from own selections (primary territory)
  // ─────────────────────────────────────────────────────────────────────────

  function _showChipsPrimary(step) {
    // Build chips from the user's Step 3a selections only
    const selections = store.get('onboarding.hardBeforeSelections') || [];
    const chips = selections.map(id => ({
      id,
      label: HARD_BEFORE_PHRASE_MAP[id] || id
    }));

    const wrap = document.createElement('div');
    wrap.className = 'ob-chips';
    wrap.setAttribute('role', 'radiogroup');
    wrap.setAttribute('aria-label', 'Which has been the hardest — choose one');

    wrap.innerHTML = `
      <div class="ob-chips__wrap">
        ${chips.map(chip => `
          <button
            class="ob-chip"
            role="radio"
            aria-checked="false"
            data-id="${_esc(chip.id)}"
            aria-label="${_esc(chip.label)}">
            ${_esc(chip.label)}
          </button>
        `).join('')}
      </div>
    `;

    _thread.appendChild(wrap);
    _scrollToBottom();
    setTimeout(() => wrap.classList.add('is-visible'), T.CHIP_APPEAR);

    // Single tap — no confirm button
    wrap.querySelectorAll('.ob-chip').forEach(btn => {
      btn.addEventListener('click', async () => {
        _lockChips(wrap);
        const id = btn.dataset.id;
        store.set('onboarding.primaryTerritory', id);

        const phrase = HARD_BEFORE_PHRASE_MAP[id] || id;
        _showUserBubble(phrase);

        _runStep(4);
      });
    });

    setTimeout(() => wrap.querySelector('.ob-chip')?.focus(), T.CHIP_APPEAR + 50);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4 — Sequential reveal (Beat 3 reflection)
  // ─────────────────────────────────────────────────────────────────────────

  async function _runSequentialReveal(step) {
    // Write reflectionShownAt
    store.set('onboarding.reflectionShownAt', new Date().toISOString());

    // Get script parts
    let parts;
    if (_skippedHardBefore) {
      parts = FALLBACK_REFLECTION;
    } else {
      const territory = store.get('onboarding.primaryTerritory');
      const script    = getBeat3Script(territory);
      parts = script ? script.parts : FALLBACK_REFLECTION;
    }

    // Show typing indicator once before the first part
    const typing = _showTyping();
    const typeMs = REDUCED_MOTION ? 0 : T.TYPING_MIN;

    await new Promise(resolve => setTimeout(resolve, typeMs));
    _removeTyping(typing);
    await new Promise(resolve => setTimeout(resolve, T.BUBBLE_DELAY));

    // Reveal parts sequentially
    for (let i = 0; i < parts.length; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'ob-bubble ob-bubble--coach ob-bubble--part';
      bubble.innerHTML = _formatCoachText(parts[i]);
      _thread.appendChild(bubble);
      _scrollToBottom();

      await new Promise(resolve => setTimeout(resolve, T.PART_FADE));
      bubble.classList.add('is-visible');

      if (i < parts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, T.PART_DELAY));
      }
    }

    // Auto-advance after last part
    await new Promise(resolve => setTimeout(resolve, T.AUTO_ADVANCE));
    _runStep(5);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INLINE CHIPS — single select (Steps 6, 9, 10, 12)
  // ─────────────────────────────────────────────────────────────────────────

  function _showChipsSingle(step) {
    const wrap = document.createElement('div');
    wrap.className = 'ob-chips';
    wrap.setAttribute('role', 'radiogroup');
    wrap.setAttribute('aria-label', `Options for step ${step.id}`);

    const hasSkip = !!step.skipLabel;

    wrap.innerHTML = `
      <div class="ob-chips__wrap">
        ${step.chips.map(chip => `
          <button
            class="ob-chip"
            role="radio"
            aria-checked="false"
            data-id="${_esc(chip.id)}"
            aria-label="${_esc(chip.label)}">
            ${_esc(chip.label)}
          </button>
        `).join('')}
        ${hasSkip ? `
          <button
            class="ob-chip ob-chip--skip"
            data-skip="true"
            aria-label="${_esc(step.skipLabel)}">
            ${_esc(step.skipLabel)}
          </button>
        ` : ''}
      </div>
    `;

    _thread.appendChild(wrap);
    _scrollToBottom();
    setTimeout(() => wrap.classList.add('is-visible'), T.CHIP_APPEAR);

    // Chip tap — single select, immediate advance
    wrap.querySelectorAll('.ob-chip:not(.ob-chip--skip)').forEach(btn => {
      btn.addEventListener('click', async () => {
        _lockChips(wrap);
        const id = btn.dataset.id;

        // Write to store
        _writeStepValue(step, id);

        // User bubble
        const summaryText = generateSummary(step.summaryType, id);
        _showUserBubble(summaryText);

        // Coach response
        const ack = await _getCoachAck(step, id, false);
        if (ack) await _showCoachBubble(ack);

        _runStep(_nextStep(step.id));
      });
    });

    // Skip
    if (hasSkip) {
      wrap.querySelector('[data-skip]')?.addEventListener('click', async () => {
        _lockChips(wrap);
        _showUserBubble(step.skipLabel);
        if (step.coachAfter?.skipped) {
          await _showCoachBubble(step.coachAfter.skipped);
        }
        _runStep(_nextStep(step.id));
      });
    }

    setTimeout(() => wrap.querySelector('.ob-chip')?.focus(), T.CHIP_APPEAR + 50);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET BAR — Steps 7, 8, 11, 13
  // ─────────────────────────────────────────────────────────────────────────

  function _showSheetBar(step) {
    const bar = document.createElement('div');
    bar.className = 'ob-sheet-bar';
    bar.innerHTML = `
      <button class="ob-sheet-bar__open" data-action="open">
        ${_esc(step.openLabel || 'Show me')}
      </button>
      ${step.skipLabel ? `
        <button class="ob-sheet-bar__skip" data-action="skip">
          ${_esc(step.skipLabel)}
        </button>
      ` : ''}
    `;
    _container.querySelector('.ob-thread').appendChild(bar);
    setTimeout(() => bar.classList.add('is-visible'), T.INPUT_APPEAR);

    const openBtn = bar.querySelector('[data-action="open"]');
    const skipBtn = bar.querySelector('[data-action="skip"]');

    openBtn.addEventListener('click', async () => {
      bar.classList.remove('is-visible');
      setTimeout(() => bar.remove(), 300);

      openSheet(step.sheetView, async (result) => {
        await _handleSheetResult(step, result);
      }, openBtn);
    });

    skipBtn?.addEventListener('click', async () => {
      bar.classList.remove('is-visible');
      setTimeout(() => bar.remove(), 300);
      await _handleSheetResult(step, { skipped: true });
    });

    // Focus the open button
    setTimeout(() => openBtn.focus(), T.INPUT_APPEAR + 50);
  }

  async function _handleSheetResult(step, result) {
    if (result.skipped) {
      _showUserBubble(step.skipLabel || "I'll decide later.");
      if (step.coachAfter?.skipped) {
        await _showCoachBubble(step.coachAfter.skipped);
      }
    } else {
      // Read what the view wrote to store and build summary bubble
      const summaryValue = _readStoreForSummary(step);
      const summaryText  = generateSummary(step.summaryType, summaryValue);
      if (summaryText) _showUserBubble(summaryText);

      // plan-select.js calls store.completeOnboarding() — undo that here.
      // Thread.js completes onboarding at Step 14, not Step 13.
      if (step.id === 13) {
        store.data.onboardingComplete = false;
        store.save();
      }

      // Coach acknowledgement
      const ack = await _getCoachAck(step, summaryValue, false);
      if (ack) await _showCoachBubble(ack);
    }

    _runStep(_nextStep(step.id));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 14 — Begin button
  // ─────────────────────────────────────────────────────────────────────────

  function _showBeginButton(step) {
    // Write threadCompletedAt and complete onboarding
    store.set('onboarding.threadCompletedAt', new Date().toISOString());
    store.completeOnboarding();

    const wrap = document.createElement('div');
    wrap.className = 'ob-begin-wrap';
    wrap.innerHTML = `
      <button class="ob-begin" aria-label="${_esc(step.beginButtonLabel)}">
        ${_esc(step.beginButtonLabel)}
      </button>
    `;
    _thread.appendChild(wrap);
    _scrollToBottom();

    const btn = wrap.querySelector('.ob-begin');
    setTimeout(() => btn.classList.add('is-visible'), step.beginButtonDelayMs || 600);
    setTimeout(() => btn.focus(), (step.beginButtonDelayMs || 600) + 100);

    btn.addEventListener('click', () => {
      router.navigate('today');
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /** Lock a chip tray after selection — prevents double-tap */
  function _lockChips(wrap) {
    wrap.classList.add('is-locked');
    wrap.querySelectorAll('.ob-chip').forEach(btn => {
      btn.disabled = true;
    });
    const confirm = wrap.querySelector('.ob-chips__confirm');
    if (confirm) confirm.disabled = true;
  }

  /** Write a step's answer to store using the step's storeField */
  function _writeStepValue(step, value) {
    if (!step.storeField) return;
    // Convert frequency chip id to integer for weeklySessionTarget
    if (step.storeField === 'strategicGoal.weeklySessionTarget') {
      const n = value === '5plus' ? 5 : parseInt(value, 10);
      store.set(step.storeField, isNaN(n) ? 3 : n);
    } else {
      store.set(step.storeField, value);
    }
  }

  /**
   * Read the store value needed to build a summary bubble for sheet steps.
   * Each sheet step writes different fields — this maps step id to what to read.
   */
  function _readStoreForSummary(step) {
    switch (step.id) {
      case 7:  {
        // Goals: store.goals[] contains IDs — read labels from goals data
        // generateSummary expects human-readable labels for goals
        // goals.js writes IDs; we pass them and let generateSummary handle it
        return store.get('goals') || [];
      }
      case 8: {
        // Conditions: store.conditions[] contains IDs
        // For the summary we return the IDs — generateSummary maps them
        return store.get('conditions') || [];
      }
      case 11: {
        // Equipment: read facility (from store.lifestyle or equipment sheet output)
        // equipment.js writes store.equipment[] (ids) — for summary we build
        // a simple object from what's available
        return {
          facility:  store.get('sessionLocation') || 'At home',
          equipment: store.get('equipment') || []
        };
      }
      case 13: {
        // Programme: read from activeProgramme
        return {
          programmeName: store.get('activeProgramme.programmeName') || '',
          weeklyTarget:  store.get('strategicGoal.weeklySessionTarget') || 3
        };
      }
      default:
        return null;
    }
  }

  /**
   * Build the coach acknowledgement string for a step.
   * Handles static coachAfter strings and dynamic generators.
   */
  async function _getCoachAck(step, value, skipped) {
    if (skipped) return step.coachAfter?.skipped || null;

    // Step 8 — conditions: dynamic ack
    if (step.id === 8) {
      const conditions = store.get('conditions') || [];
      return generateConditionsAck(conditions);
    }

    // Step 12 — frequency: dynamic ack
    if (step.id === 12) {
      return generateFrequencyAck(value);
    }

    return step.coachAfter?.answered || null;
  }

  /** Escape HTML for safe rendering in innerHTML */
  function _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─────────────────────────────────────────────────────────────────────────

  return { mount };
}
