/**
 * js/views/onboarding/thread.js
 * 14 Aug 2026 v11
 *
 * v11 - CARDIAC-1. Step 8a acknowledgement wired.
 *
 * 14 Aug 2026 v10
 *
 * v10 - W3-B. Step 9f acknowledgement wired. trainingIntent is a
 *   top-level field, so _writeStepValue()'s generic store.set path
 *   already handles the write -- only the ack needed adding.
 *
 * 14 Aug 2026 v9
 *
 * v9 - W3-A. Capability steps 9a-9d wired in. Three changes:
 *   _nextStep() now walks past steps whose showIf() does not apply,
 *   reading store fresh at each hop because 9a decides 9b/9d and 9b
 *   decides 9c; _writeStepValue() converts legPower 'skip' to null and
 *   sets capability.askedAt on the first capability answer, without
 *   which every answer is stored and then ignored; and 9a gets a dynamic
 *   acknowledgement that displays the answer without interpreting it.
 *
 * 11 Aug 2026 v8
 *
 * v8 — WOW-0. Consent gate added before Step 1. Live onboarding had
 *   captured NO legal consent record since this file superseded
 *   welcome.js — welcome.js:85-86 was the only writer of consentGiven/
 *   consentAt and its route left router.js VIEW_NAMES in v7. Found by the
 *   PT-W1 store audit, not by anyone noticing.
 *
 *   Affirmative tick, not implied consent (Graeme, 11 Aug). Records
 *   POLICY_VERSION so a later revision does not silently invalidate every
 *   existing record. Skipped entirely once given, so resuming onboarding
 *   never re-asks. Continue uses aria-disabled, never the HTML disabled
 *   attribute — see the note at _renderConsentGate() for why.
 *
 *   AGE_GATE_ENABLED is present and false. Do not flip it until A1.11
 *   (ToS 13+ vs business-doc 16+) is resolved and Natalie's advice lands.
 *
 * 03 Jul 2026 v7
 *
 * v7 — Appendix M fix, applied here for the first time. Graeme reported
 *   the onboarding "Hard Before" chip screen scrolling to the bottom of
 *   the container and hiding the coach's message above (screenshot).
 *   Ground-truthed against this file and confirmed the same root cause
 *   already found and fixed in checkin.js: _scrollToBottom() set
 *   _thread.scrollTop = _thread.scrollHeight unconditionally after
 *   every append — typing indicator, coach bubble, user bubble, every
 *   chip tray, the reflection gate, the Continue button, the Begin
 *   button. Ten call sites, all sharing the one blunt function. This
 *   file had never had the fix applied.
 *
 *   Replaced _scrollToBottom() with _scrollToNewElement(el), calling
 *   el.scrollIntoView({ block: "start" }) on the specific element just
 *   appended — same fix, same reasoning, as checkin.js v5.
 *
 *   Two further fixes applied preventively, without waiting for them to
 *   be separately reported, since they're the exact same shape as two
 *   bugs already found and fixed in checkin.js this session:
 *     1. Step 14 (closing → _showBeginButton) showed a coach bubble
 *        immediately followed by the Begin button, no reading pause —
 *        identical shape to the checkin.js summary/action-buttons bug.
 *        Added a 400ms pause between the coach bubble resolving and the
 *        Begin button wrap being appended.
 *     2. Every .focus() call in this file (8 of them: name input, four
 *        chip trays, the reflection gate, the Continue button, the
 *        sheet-bar open button, the Begin button) lacked
 *        { preventScroll: true } — exactly the gap that let checkin.js's
 *        submit-button focus fight its own deliberate scroll position.
 *        Added to all eight call sites.
 *
 * v6 — Step 11 (equipment) summary reader was reading store.sessionLocation,
 *   a field equipment.js never writes — confirmed against the real
 *   source, which only writes homeEquipment[], gymEquipment[], and the
 *   combined equipment[]. There is no separate "facility name" stored
 *   anywhere; the facility choice is implicit in which equipment IDs
 *   ended up selected. Fixed to read only the combined list.
 *
 * v5 — Fade trigger rule corrected (S3, screenshot review). v3's fix
 *   (moving the fade call into _showCoachBubble) was still wrong: it
 *   faded the first of two back-to-back coach bubbles within the same
 *   step whenever there was no user interaction between them — e.g. an
 *   acknowledgement bubble immediately followed by the next question
 *   (Step 8's conditions ack → Step 9's activity question is the
 *   reported example). Removed the fade call from _showCoachBubble
 *   entirely. The fade is now triggered ONLY from inside genuine
 *   user-interaction handlers — chip taps, text submits, sheet closes,
 *   gate answers, Continue taps — each one calling
 *   _markPreviousStepsPast() explicitly at the exact moment the user's
 *   action is confirmed. See the corrected doc comment on
 *   _markPreviousStepsPast() for the full reasoning.
 *
 * v4 — Two further fixes from screenshot review:
 *   1. Name capitalisation: store.set('name', ...) now capitalises the
 *      first letter before writing, correcting the common case of
 *      someone typing their own name lowercase on a phone keyboard.
 *      Fixed at the point of entry (Step 2 submit handler) so every
 *      other view reading store.get('name') inherits the correction —
 *      not just the thread's own bubbles.
 *   2. Missing interaction gate: Step 2 was advancing straight into
 *      Step 3a with no pause, which is also why the past-fade looked
 *      wrong in the previous screenshot — there was no real step
 *      boundary for it to land in. Added Step 2b: a single light-touch
 *      "Ready to get started?" chip between the name response and Hard
 *      Before. The second half of Step 2's original coach message (the
 *      settings reassurance line) moved here too, so the pacing reads
 *      as two distinct beats instead of one wall of text immediately
 *      followed by another.
 *
 * v3 — Two bugs found in screenshot review:
 *   1. Premature fade: _markPreviousStepsPast() was called at the top of
 *      _runStep, but Step 2's submit handler calls _runStep again
 *      internally right after showing its own coach response — so that
 *      bubble was fading before the user had a chance to read it. Moved
 *      the fade call into _showCoachBubble itself, at the moment typing
 *      begins for new content — the one correct chokepoint, since it's
 *      the exact instant something new is about to become "current".
 *   2. Contrast failure: the fade was implemented as opacity: 0.45 on the
 *      whole bubble. Because the bubble background is already dark,
 *      reducing opacity shrinks the gap between text and background
 *      rather than preserving it — measured contrast dropped to ~3.9:1,
 *      below the WCAG AA 4.5:1 minimum for normal text. Fixed in
 *      onboarding-thread.css v3: solid colour swap instead of opacity.
 *
 * v2 — Post-QA revision:
 *   Step 1 fix: coach-only steps now correctly auto-advance only when
 *     there is genuinely no user input in that step (was previously
 *     firing the Step 2 coach response before the user had typed
 *     their name — wrong order, reported in testing).
 *   Step 4 reworked: was an unconsented, fully auto-revealing five-part
 *     sequence — reported as overwhelming in testing. Now a consent
 *     gate ("read it now, or find it in settings later") followed by
 *     an actively-paced reveal — each part requires an explicit
 *     Continue tap, never a timeout or passive auto-advance, since
 *     silently assuming disengagement is the exact pattern this
 *     product exists to be the antidote to.
 *   Past-step fade added: completed steps' coach bubbles recede to 45%
 *     opacity once the conversation moves past them, applied centrally
 *     at the top of every _runStep call. User bubbles never fade —
 *     they remain the permanent full-opacity record.
 *   Header added: "Alongside: Move" sticky wordmark at top of thread.
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
  generateBalanceAck,
  generateIntentAck,
  generateClearanceAck,
  BALANCE_CHIPS,
  CHAIR_RISE_CHIPS,
  FLOOR_ACCESS_CHIPS,
  LEG_POWER_CHIPS,
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
  READ_PAUSE:      REDUCED_MOTION ?   0 : 400,   // ms reading pause before an action block appears (v7)
  SCROLL_DELAY:    REDUCED_MOTION ?   0 :  80,   // ms before scroll-to-new-element
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
      <header class="ob-header" aria-label="Alongside: Move">
        <span class="ob-header__wordmark">Alongside: Move</span>
      </header>
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
          // 11 Aug 2026 (WOW-0): consent is a gate, not a step. It runs
          // before Step 1 and is skipped entirely once already given, so
          // returning mid-onboarding never re-asks.
          if (_needsConsent()) _renderConsentGate();
          else                 _beginThread();
        }, 400);
      }, STEPS[0].durationMs);
    });
  }

  // ── Consent gate (11 Aug 2026, WOW-0) ──────────────────────────────────────
  //
  // Restores the legal consent record absent from live onboarding since
  // OB-THREAD retired welcome.js. Found by the PT-W1 store audit: nothing
  // has written consentGiven/consentAt since router.js v7.
  //
  // Three deliberate differences from welcome.js's version:
  //
  //  1. AFFIRMATIVE TICK, not implied consent. welcome.js used "By tapping
  //     Start you agree" under the button. Graeme's decision, 11 Aug: an
  //     active registered choice, because implied consent leaves the
  //     "but I didn't know" problem open.
  //
  //  2. aria-disabled, NOT the disabled attribute. Continue stays in the
  //     tab order and stays announced; tapping it untickled explains what
  //     is needed and moves focus to the checkbox. The HTML disabled
  //     attribute removes an element from the tab order entirely, which is
  //     exactly the PT-7 bug found in session-builder-ui.js — a keyboard
  //     or screen-reader user gets a dead control and no explanation. Not
  //     rebuilding that here, of all places.
  //
  //  3. A plain-language summary of what is being agreed to, on the page
  //     itself, above the links. Graeme: people should not have to open a
  //     policy document to know what they just consented to.
  //
  // POLICY_VERSION is recorded with the tick. Without it, any later
  // revision silently invalidates every existing record and there is no
  // way to tell who needs re-consent.
  const POLICY_VERSION = '2026-08-11';

  // AGE GATE — BUILT BUT INERT. Do not switch on until the ToS 13+ vs
  // business-doc 16+ contradiction (Stream A, A1.11) is resolved AND
  // Natalie's written advice has landed. Flipping this to true without
  // that is worse than leaving it off: it produces an audit trail
  // asserting an eligibility check that has no agreed rule behind it.
  const AGE_GATE_ENABLED = false;

  function _needsConsent() {
    return store.get('consent.given') !== true;
  }

  function _renderConsentGate() {
    _thread.innerHTML = `
      <section class="ob-consent" role="group" aria-labelledby="ob-consent-heading">
        <h1 class="ob-consent__heading" id="ob-consent-heading">Before we start</h1>

        <div class="ob-consent__summary">
          <h2 class="ob-consent__subheading">What you are agreeing to</h2>
          <ul class="ob-consent__list">
            <li>Your answers stay on your device. We do not sell them, and we do not share them with advertisers.</li>
            <li>We use what you tell us to shape your sessions — that is the whole point of asking.</li>
            <li>You can change or delete anything, any time, in Settings.</li>
            <li>You can stop using Alongside whenever you like and take your data with you.</li>
          </ul>
          <p class="ob-consent__links">
            The full detail is in our
            <a href="https://buildnewhabits.co.uk/privacy/" class="ob-consent__link"
               target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            and
            <a href="https://buildnewhabits.co.uk/terms/" class="ob-consent__link"
               target="_blank" rel="noopener noreferrer">Terms of Service</a>
            (both open in a new tab), or
            <button type="button" class="btn-inline-link" id="ob-consent-inapp">read a summary here</button>.
          </p>
        </div>

        <div class="ob-consent__tick">
          <input type="checkbox" id="ob-consent-check" class="ob-consent__checkbox">
          <label for="ob-consent-check" class="ob-consent__label">
            I have read and agree to the Privacy Policy and Terms of Service.
          </label>
        </div>

        <p class="ob-consent__error" id="ob-consent-error" role="status" hidden>
          Please tick the box above to agree before continuing.
        </p>

        <button class="btn btn-primary btn-large btn-full"
                id="ob-consent-continue"
                aria-disabled="true"
                aria-describedby="ob-consent-error">
          Continue
        </button>
      </section>
    `;

    const check    = document.getElementById('ob-consent-check');
    const continueBtn = document.getElementById('ob-consent-continue');
    const error    = document.getElementById('ob-consent-error');

    check?.addEventListener('change', () => {
      const ok = check.checked;
      continueBtn.setAttribute('aria-disabled', ok ? 'false' : 'true');
      continueBtn.classList.toggle('is-inactive', !ok);
      if (ok) error.hidden = true;
    });
    continueBtn.classList.add('is-inactive');

    document.getElementById('ob-consent-inapp')?.addEventListener('click', () => {
      router.navigate('privacy');
    });

    continueBtn?.addEventListener('click', () => {
      if (!check?.checked) {
        // Not a dead button: say what is needed and put focus where it is.
        error.hidden = false;
        check?.focus();
        return;
      }
      store.set('consent.given',         true);
      store.set('consent.at',            new Date().toISOString());
      store.set('consent.policyVersion', POLICY_VERSION);
      if (AGE_GATE_ENABLED) {
        // Reserved. Nothing writes ageConfirmed while the gate is inert.
      }
      _beginThread();
    });

    document.getElementById('ob-consent-check')?.focus();
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
        // Steps 1 and 5 have no user input — advance automatically.
        // Step 1: coach opens with name question; Step 2 shows the text input.
        // Step 5: bridge into practical questions; Step 6 follows immediately.
        if (stepId === 1 || stepId === 5) {
          _runStep(_nextStep(stepId));
        }
        break;

      case 'inline-text':
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

      case 'reflection-gate':
        await _runReflectionGate(step);
        break;

      case 'sheet':
        await _showCoachBubble(step.coach);
        _showSheetBar(step);
        break;

      case 'closing':
        await _showCoachBubble(
          step.coach.replace('[name]', store.get('name') || '')
        );
        // v7: reading pause before the Begin button appears — same shape
        // as the checkin.js summary/action-buttons fix. Without this,
        // the button block's own scroll-to-top yanks this final coach
        // message out of view before it can be read.
        await new Promise(resolve => setTimeout(resolve, T.READ_PAUSE));
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
    _scrollToNewElement(el);

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
   *
   * IMPORTANT: this function does NOT trigger the past-bubble fade.
   * Earlier versions called _markPreviousStepsPast() here, on the
   * assumption that "about to show new coach content" was the right
   * moment to fade what came before. That was wrong: several steps show
   * two or more coach bubbles back to back with no user interaction
   * between them (e.g. an acknowledgement bubble immediately followed by
   * the next question) — calling the fade here faded the first bubble
   * before the user had even read it, with no action of theirs causing
   * it. The fade must only ever be triggered by genuine user interaction
   * (a chip tap, a sheet closing, a text submit, a gate answer) — see the
   * individual step handlers, each of which calls _markPreviousStepsPast()
   * explicitly at the point the user actually does something.
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
          _scrollToNewElement(bubble);

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
    _scrollToNewElement(bubble);
    requestAnimationFrame(() => bubble.classList.add('is-visible'));
    return bubble;
  }

  // ── Scroll to newly-appended element ──────────────────────────────────────
  // v7 (Appendix M fix, applied to onboarding). Scrolls so the TOP of the
  // element just appended aligns with the top of the thread's visible
  // area — never a blind jump to container bottom. Replaces the old
  // _scrollToBottom(), which set scrollTop = scrollHeight after every
  // append regardless of what was new, and could hide the very content
  // it was meant to reveal (reported: Hard Before chip screen hid the
  // coach's question above it). See checkin.js v5 for the original fix
  // this mirrors.

  function _scrollToNewElement(el) {
    setTimeout(() => {
      if (!el) return;
      el.scrollIntoView({ block: 'start', behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    }, T.SCROLL_DELAY);
  }

  // ── Next step helper ───────────────────────────────────────────────────────

  function _nextStep(currentId) {
    let idx = STEP_ORDER.indexOf(currentId);
    if (idx === -1) return null;

    // W3-A. A step may declare showIf(storeData). Walk forward past any
    // step that does not apply to this person, rather than rendering it
    // and hiding it -- a hidden-but-present step still takes a turn in
    // the thread and still counts toward progress.
    //
    // store.data is read fresh on each hop, because 9a's answer decides
    // whether 9b and 9d apply and 9b's answer decides whether 9c does.
    while (idx < STEP_ORDER.length - 1) {
      idx += 1;
      const nextId = STEP_ORDER[idx];
      const step   = STEPS[nextId];
      if (!step || typeof step.showIf !== 'function') return nextId;
      let applies;
      try {
        applies = step.showIf(store.data);
      } catch (err) {
        // A predicate that throws must not strand somebody mid-onboarding.
        // Failing OPEN is correct here: these are protective questions, and
        // asking one unnecessarily is a far smaller harm than skipping one
        // that was needed.
        console.warn('[thread] showIf threw for step', nextId, err);
        applies = true;
      }
      if (applies) return nextId;
    }
    return null;
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

      // Genuine user action — fade everything shown before this point.
      _markPreviousStepsPast();

      // Lock input
      field.disabled  = true;
      sendBtn.disabled = true;
      bar.classList.remove('is-visible');

      // Capitalise before writing to store — corrects the common case of
      // someone typing their own name lowercase on a phone keyboard.
      // Fixed at the point of entry so every other view that reads
      // store.get('name') inherits the correction automatically.
      const displayName = _capitalise(name);
      store.set('name', displayName);

      // User bubble
      _showUserBubble(displayName);

      // Remove input bar after animation
      setTimeout(() => bar.remove(), 300);

      // Coach response (uses name)
      const coachText = step.coach.replace(/\[Name\]/g, displayName);
      await _showCoachBubble(coachText);

      _runStep(_nextStep(step.id));
    };

    sendBtn.addEventListener('click', submit);
    field.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });

    // Focus the field
    setTimeout(() => field.focus({ preventScroll: true }), T.INPUT_APPEAR + 50);
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
    _scrollToNewElement(wrap);
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
      _markPreviousStepsPast();
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
      _markPreviousStepsPast();
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
    setTimeout(() => wrap.querySelector('.ob-chip')?.focus({ preventScroll: true }), T.CHIP_APPEAR + 50);
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
    _scrollToNewElement(wrap);
    setTimeout(() => wrap.classList.add('is-visible'), T.CHIP_APPEAR);

    // Single tap — no confirm button
    wrap.querySelectorAll('.ob-chip').forEach(btn => {
      btn.addEventListener('click', async () => {
        _markPreviousStepsPast();
        _lockChips(wrap);
        const id = btn.dataset.id;
        store.set('onboarding.primaryTerritory', id);

        const phrase = HARD_BEFORE_PHRASE_MAP[id] || id;
        _showUserBubble(phrase);

        _runStep(4);
      });
    });

    setTimeout(() => wrap.querySelector('.ob-chip')?.focus({ preventScroll: true }), T.CHIP_APPEAR + 50);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4 — Reflection gate + active sequential reveal (Beat 3)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Resolve the Beat 3 script parts for the current user.
   * Falls back to FALLBACK_REFLECTION if Hard Before was skipped or no
   * territory was set.
   */
  function _resolveReflectionParts() {
    if (_skippedHardBefore) return FALLBACK_REFLECTION;
    const territory = store.get('onboarding.primaryTerritory');
    // getBeat3Script expects string[] — wrap in array so getDominantTerritory()
    // returns territory correctly. primaryTerritory is always a single string.
    const script = territory ? getBeat3Script([territory]) : null;
    return script ? script.parts : FALLBACK_REFLECTION;
  }

  /**
   * Step 4 entry point. Shows the consent gate first. The reflection itself
   * only begins once the user actively chooses "Read it now" — never shown
   * unprompted, never auto-advanced past without explicit action.
   */
  async function _runReflectionGate(step) {
    // Record that the reflection was offered, regardless of the answer.
    store.set('onboarding.reflectionShownAt', new Date().toISOString());

    await _showCoachBubble(step.gateText);

    const wrap = document.createElement('div');
    wrap.className = 'ob-gate';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Read your reflection now or later');
    wrap.innerHTML = `
      <div class="ob-gate__wrap">
        <button class="ob-gate__btn ob-gate__btn--primary" data-gate="yes">
          ${_esc(step.gateYesLabel)}
        </button>
        <button class="ob-gate__btn" data-gate="no">
          ${_esc(step.gateNoLabel)}
        </button>
      </div>
    `;
    _thread.appendChild(wrap);
    _scrollToNewElement(wrap);
    setTimeout(() => wrap.classList.add('is-visible'), T.CHIP_APPEAR);

    const lockGate = () => {
      wrap.querySelectorAll('.ob-gate__btn').forEach(b => { b.disabled = true; });
    };

    wrap.querySelector('[data-gate="yes"]').addEventListener('click', async () => {
      _markPreviousStepsPast();
      lockGate();
      _showUserBubble(step.gateYesLabel);
      await _runReflectionParts(step);
    });

    wrap.querySelector('[data-gate="no"]').addEventListener('click', async () => {
      _markPreviousStepsPast();
      lockGate();
      _showUserBubble(step.gateNoLabel);
      await _showCoachBubble(step.declineCoach);
      _runStep(5);
    });

    setTimeout(() => wrap.querySelector('.ob-gate__btn').focus({ preventScroll: true }), T.CHIP_APPEAR + 50);
  }

  /**
   * Active sequential reveal. Part 1 shows automatically after the gate
   * answer. Every subsequent part requires an explicit "Continue" tap —
   * there is no timeout and no passive auto-advance. Going quiet and
   * assuming disengagement is the exact pattern this product promises
   * never to repeat, so the only way forward is the user choosing to
   * continue, every time.
   */
  async function _runReflectionParts(step) {
    const parts = _resolveReflectionParts();

    for (let i = 0; i < parts.length; i++) {
      const typing = _showTyping();
      const typeMs = REDUCED_MOTION ? 0 : T.TYPING_MIN;
      await new Promise(resolve => setTimeout(resolve, typeMs));
      _removeTyping(typing);
      await new Promise(resolve => setTimeout(resolve, T.BUBBLE_DELAY));

      const bubble = document.createElement('div');
      bubble.className = 'ob-bubble ob-bubble--coach ob-bubble--part';
      bubble.innerHTML = _formatCoachText(parts[i]);
      _thread.appendChild(bubble);
      _scrollToNewElement(bubble);
      requestAnimationFrame(() => bubble.classList.add('is-visible'));

      const isLast = i === parts.length - 1;

      if (!isLast) {
        // Wait for explicit Continue tap before revealing the next part.
        await _waitForContinue(step.continueLabel);
      }
    }

    // Brief pause after the final part, then advance — this one is fine
    // to be automatic since there's no further content being withheld.
    await new Promise(resolve => setTimeout(resolve, step.autoAdvanceAfterMs || T.AUTO_ADVANCE));
    _runStep(5);
  }

  /**
   * Show a single "Continue" button under the most recent bubble and
   * resolve the returned promise only when the user taps it.
   */
  function _waitForContinue(label) {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'ob-continue-wrap';
      wrap.innerHTML = `
        <button class="ob-continue-btn" aria-label="${_esc(label)} to the next part">
          ${_esc(label)}
        </button>
      `;
      _thread.appendChild(wrap);
      _scrollToNewElement(wrap);
      setTimeout(() => wrap.classList.add('is-visible'), T.CHIP_APPEAR);

      const btn = wrap.querySelector('.ob-continue-btn');
      setTimeout(() => btn.focus({ preventScroll: true }), T.CHIP_APPEAR + 50);

      btn.addEventListener('click', () => {
        // Genuine user action — fade the part just read. This is the one
        // place progressive within-step fading is intentional: each
        // reflection part recedes only once the user has actively chosen
        // to move past it, never automatically.
        _markPreviousStepsPast();
        wrap.classList.remove('is-visible');
        setTimeout(() => wrap.remove(), 200);
        resolve();
      });
    });
  }

  /**
   * Fade all currently-visible coach bubbles to "past" opacity.
   *
   * RULE: call this only from inside a genuine user-interaction handler —
   * a chip tap, a text submit, a sheet closing, a gate answer, a Continue
   * tap — never automatically inside _showCoachBubble or at step
   * boundaries. Earlier versions tried both of those approaches and both
   * were wrong: calling it at the top of _runStep faded a bubble before
   * the user had read it (some steps call _runStep again internally
   * right after showing their own response); calling it inside
   * _showCoachBubble faded the first of two back-to-back coach bubbles
   * within the same step, with no user action between them at all (an
   * acknowledgement immediately followed by the next question, for
   * example). The only thing that should ever cause a fade is the user
   * actually doing something — see the call sites throughout this file,
   * each placed at the exact moment a user action is confirmed.
   * Idempotent: only targets bubbles not already faded, so it's safe to
   * call more than once without double-fading anything.
   * User bubbles are never faded — they remain the full-opacity record.
   */
  function _markPreviousStepsPast() {
    return new Promise(resolve => {
      const coachBubbles = _thread.querySelectorAll('.ob-bubble--coach:not(.is-past)');
      coachBubbles.forEach(b => b.classList.add('is-past'));
      setTimeout(resolve, REDUCED_MOTION ? 0 : 150);
    });
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
    _scrollToNewElement(wrap);
    setTimeout(() => wrap.classList.add('is-visible'), T.CHIP_APPEAR);

    // Chip tap — single select, immediate advance
    wrap.querySelectorAll('.ob-chip:not(.ob-chip--skip)').forEach(btn => {
      btn.addEventListener('click', async () => {
        // Genuine user action — this is the exact moment that should
        // fade everything shown before it (e.g. tapping "A little
        // walking" should grey out both the conditions acknowledgement
        // and the activity question above it, not just one or the other).
        _markPreviousStepsPast();
        _lockChips(wrap);
        const id = btn.dataset.id;

        // Write to store (no-ops safely if step.storeField is null —
        // Step 2b is a pacing beat with no real data to collect)
        _writeStepValue(step, id);

        // User bubble: if the step has no summaryType (Step 2b), echo the
        // chip label directly rather than routing through generateSummary,
        // which would return an empty string for an unhandled type.
        const summaryText = step.summaryType
          ? generateSummary(step.summaryType, id)
          : btn.textContent.trim();
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
        _markPreviousStepsPast();
        _lockChips(wrap);
        _showUserBubble(step.skipLabel);
        if (step.coachAfter?.skipped) {
          await _showCoachBubble(step.coachAfter.skipped);
        }
        _runStep(_nextStep(step.id));
      });
    }

    setTimeout(() => wrap.querySelector('.ob-chip')?.focus({ preventScroll: true }), T.CHIP_APPEAR + 50);
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
    setTimeout(() => openBtn.focus({ preventScroll: true }), T.INPUT_APPEAR + 50);
  }

  async function _handleSheetResult(step, result) {
    // Genuine user action — the sheet has closed because the user either
    // completed it or explicitly skipped it. Either way, that's the
    // moment to fade what came before.
    _markPreviousStepsPast();

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
    _scrollToNewElement(wrap);

    const btn = wrap.querySelector('.ob-begin');
    setTimeout(() => btn.classList.add('is-visible'), step.beginButtonDelayMs || 600);
    setTimeout(() => btn.focus({ preventScroll: true }), (step.beginButtonDelayMs || 600) + 100);

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
      return;
    }

    // ── W3-A capability writes ────────────────────────────────────────
    if (step.storeField && step.storeField.startsWith('capability.')) {
      // 'skip' is a UI answer, not a capability value. Stored as null so
      // store.js's widened default treats declining exactly like not
      // answering. Writing the string would be truthy and match none of
      // full/limited/none, making legsLoadable false but legsUsable TRUE
      // by accident -- defeating the C1 fail-safe it exists to protect.
      const v = (step.storeField === 'capability.legPower' && value === 'skip')
        ? null
        : value;
      store.set(step.storeField, v);

      // askedAt is the ONLY thing capabilityProfile() reads to tell
      // "answered" from "never asked". Without it every answer above is
      // stored and then ignored, and all six protective branches in
      // session-builder.js stay dead -- which is exactly the state this
      // whole change exists to fix. Set on the first capability answer so
      // it is correct even if the person abandons partway through.
      if (!store.get('capability.askedAt')) {
        store.set('capability.askedAt', new Date().toISOString());
      }
      return;
    }

    store.set(step.storeField, value);
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
        // Equipment: equipment.js (confirmed against real source) writes
        // homeEquipment[], gymEquipment[], and the combined equipment[]
        // — it never writes sessionLocation, which the previous version
        // of this reader incorrectly assumed. There's no separate
        // "facility name" stored anywhere; the facility choice is
        // implicit in which equipment IDs ended up selected. For the
        // summary bubble we just report the combined list — generateSummary
        // handles an empty list as "bodyweight only" already.
        return {
          facility:  null,
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

    // Step 9a — balance: dynamic ack (W3-A)
    if (step.id === '9a') {
      return generateBalanceAck(value);
    }

    // Step 9f — training intent: dynamic ack (W3-B)
    if (step.id === '9f') {
      return generateIntentAck(value);
    }

    // Step 8a — exercise clearance: dynamic ack (CARDIAC-1)
    if (step.id === '8a') {
      return generateClearanceAck(value);
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

  /**
   * Capitalise the first letter of a name as typed. People often type
   * their own name lowercase on a phone keyboard without thinking about
   * it — this is purely a display correction, the store keeps whatever
   * the user actually typed unmodified, and this is applied wherever the
   * name is shown back to them (user bubble, coach response, settings).
   */
  function _capitalise(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ─────────────────────────────────────────────────────────────────────────

  return { mount };
}
