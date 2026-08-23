/**
 * js/views/thread-runner.js
 * 22 Aug 2026 v1
 *
 * THREAD-1a — the coach's conversation, as a component.
 *
 * Authority: alongside_thread1_build_scope_22aug2026_v1.md v1.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────
 *
 * R1-b shipped with copy that asks "Shall we look at it together?" and a
 * UI that answered with a date input and a Save button. The mismatch was
 * the small problem. The real one: the coach speaks in bubbles while
 * getting to know somebody, then hands them a form the moment the
 * conversation turns difficult. The interaction that most needs to feel
 * like a person was built most like an admin screen.
 *
 * ── WHAT THIS IS, AND WHAT IT REFUSES TO KNOW ───────────────────────
 *
 * Bubbles, typing, chips, inline input, reduced motion, scroll and
 * focus. It takes a SCRIPT and a WRITE HANDLER and knows nothing about
 * any particular flow -- no store writes, no routing, no onboarding.
 * Consumers own their own script and their own persistence, which is why
 * the same component can carry onboarding and the hard conversation
 * without either leaking into the other.
 *
 * ── LIFTED FROM onboarding/thread.js v12, NOT REINVENTED ────────────
 *
 * The timings, the typing-delay-from-word-count, the scroll-to-top-of-
 * new-element and the ob- class names are all carried over deliberately.
 *
 * The class names especially: sharing `ob-bubble` means both renderers
 * share ONE stylesheet. If the runner had its own classes, the coach
 * could start looking subtly different in different places -- which is a
 * philosophy problem wearing a CSS costume.
 *
 * ⚠️ TWO RENDERERS EXIST UNTIL THREAD-1b. onboarding/thread.js is
 * untouched on purpose: it captures legal consent and breaking it before
 * beta is the one unrecoverable mistake available here. The duplication
 * is TRACKED, not tolerated -- tools/verify-thread1.mjs asserts the two
 * agree on timings, reduced motion, aria-live and bubble semantics, and
 * goes red if they drift. Duplication that nothing watches is exactly
 * what produced goal-setup.js.
 *
 * ── SCRIPT SHAPE ────────────────────────────────────────────────────
 *
 *   { id, coach, type, chips?, input?, next }
 *
 *     coach   string | (ctx) => string
 *     type    'coach-only' | 'chips' | 'input' | 'end'
 *     chips   [{ id, label }] | (ctx) => [...]
 *     input   { kind: 'text'|'date', label, value?, maxlength? }
 *     next    stepId | (answer, ctx) => stepId | null   (null ends it)
 */

const REDUCED_MOTION =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

/**
 * Timing. EVERY value collapses to zero under prefers-reduced-motion --
 * that is not decoration, it is the accessibility contract, and the gate
 * asserts all of them.
 *
 * Kept identical to onboarding/thread.js v12's T block. If these drift,
 * the coach's pace changes between screens.
 */
export const T = {
  TYPING_SHOW:  REDUCED_MOTION ? 0 : 300,
  TYPING_MIN:   REDUCED_MOTION ? 0 : 800,
  BUBBLE_DELAY: REDUCED_MOTION ? 0 : 120,
  INPUT_APPEAR: REDUCED_MOTION ? 0 : 250,
  CHIP_APPEAR:  REDUCED_MOTION ? 0 : 200,
  READ_PAUSE:   REDUCED_MOTION ? 0 : 400,
  SCROLL_DELAY: REDUCED_MOTION ? 0 : 80
};

export const IS_REDUCED_MOTION = REDUCED_MOTION;

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * @param {HTMLElement} container
 * @param {object} opts
 * @param {object} opts.script      keyed by step id
 * @param {string|number} opts.start
 * @param {object} [opts.context]   passed to every function in the script
 * @param {(stepId, answer, ctx) => void} [opts.onAnswer]  persistence
 * @param {(ctx) => void} [opts.onEnd]
 * @param {string} [opts.ariaLabel]
 */
export function runThread(container, {
  script, start, context = {}, onAnswer, onEnd,
  ariaLabel = 'Conversation with your coach'
} = {}) {

  container.innerHTML = `
    <div class="ob-thread" role="main" aria-label="${_attr(ariaLabel)}">
      <div class="ob-thread__scroll" id="thread-scroll" aria-live="polite"></div>
    </div>
  `;
  const thread = container.querySelector('#thread-scroll');
  let cancelled = false;

  const resolve = (v, ...args) => (typeof v === 'function' ? v(...args) : v);

  /* ── Primitives ─────────────────────────────────────────────────── */

  function scrollToNew(el) {
    setTimeout(() => {
      if (!el) return;
      el.scrollIntoView?.({ block: 'start', behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    }, T.SCROLL_DELAY);
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'ob-typing';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', 'Coach is typing');
    el.innerHTML =
      '<span class="ob-typing__dot" aria-hidden="true"></span>' +
      '<span class="ob-typing__dot" aria-hidden="true"></span>' +
      '<span class="ob-typing__dot" aria-hidden="true"></span>';
    thread.appendChild(el);
    scrollToNew(el);
    setTimeout(() => el.classList.add('is-visible'), T.TYPING_SHOW);
    return el;
  }

  function removeTyping(el) {
    el.classList.remove('is-visible');
    setTimeout(() => el.remove(), 200);
  }

  function formatCoachText(text) {
    if (!text) return '';
    return String(text)
      .split('\n\n')
      .map(p => `<p>${_esc(p).replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  /**
   * Typing delay scales with length, exactly as onboarding does it: the
   * coach appears to take longer over a longer thought. Collapses to
   * nothing under reduced motion.
   */
  async function coachBubble(text) {
    const typing = showTyping();
    const words = String(text || '').split(/\s+/).length;
    const typeMs = REDUCED_MOTION ? 0 : Math.min(Math.max(words * 40, T.TYPING_MIN), 3000);
    await sleep(typeMs);
    if (cancelled) return;
    removeTyping(typing);
    await sleep(T.BUBBLE_DELAY);
    if (cancelled) return;
    const bubble = document.createElement('div');
    bubble.className = 'ob-bubble ob-bubble--coach';
    bubble.innerHTML = formatCoachText(text);
    thread.appendChild(bubble);
    scrollToNew(bubble);
    requestAnimationFrame?.(() => bubble.classList.add('is-visible'));
    bubble.classList.add('is-visible');
    return bubble;
  }

  function userBubble(text) {
    const bubble = document.createElement('div');
    bubble.className = 'ob-bubble ob-bubble--user';
    bubble.textContent = text;
    thread.appendChild(bubble);
    scrollToNew(bubble);
    bubble.classList.add('is-visible');
    return bubble;
  }

  /* ── Interaction blocks ─────────────────────────────────────────── */

  /**
   * Chips. All options carry the SAME class -- a runner must not be able
   * to style one answer as preferable, because in the hard conversation
   * "leave it where it is" has to weigh the same as the other two.
   */
  function askChips(step) {
    return new Promise(async res => {
      await sleep(T.CHIP_APPEAR);
      if (cancelled) return;
      const tray = document.createElement('div');
      tray.className = 'ob-chips';
      tray.setAttribute('role', 'group');
      tray.setAttribute('aria-label', 'Choose a reply');
      const chips = resolve(step.chips, context) || [];
      for (const c of chips) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ob-chip';
        b.dataset.chip = c.id;
        b.textContent = c.label;
        b.addEventListener('click', () => {
          tray.remove();
          userBubble(c.label);
          res({ id: c.id, label: c.label });
        });
        tray.appendChild(b);
      }
      thread.appendChild(tray);
      scrollToNew(tray);
      tray.querySelector('button')?.focus();
    });
  }

  function askInput(step) {
    return new Promise(async res => {
      await sleep(T.INPUT_APPEAR);
      if (cancelled) return;
      const cfg = resolve(step.input, context) || {};
      const id = `thread-input-${step.id}`;
      // Existing onboarding classes, so both renderers share ONE
      // stylesheet and the coach cannot start looking different in
      // different places. Verified against css/ before use -- the four
      // classes I first invented (.ob-input*) did not exist, and would
      // have rendered an unstyled input with no focus ring, silently.
      //
      // NO VISIBLE LABEL, deliberately. In a thread the coach's bubble
      // IS the question, so a label would print it twice. The accessible
      // name comes from aria-label instead -- an accessible name is
      // required (WCAG 4.1.2), a duplicated one is not.
      const wrap = document.createElement('div');
      wrap.className = 'ob-input-bar';
      wrap.innerHTML = `
        <input class="ob-input-bar__field" id="${_attr(id)}"
               type="${_attr(cfg.kind || 'text')}"
               aria-label="${_attr(cfg.label || 'Your reply')}"
               ${cfg.maxlength ? `maxlength="${_attr(cfg.maxlength)}"` : ''}
               value="${_attr(cfg.value || '')}">
        <button class="ob-input-bar__send" type="button">${_esc(cfg.send || 'Send')}</button>
      `;
      thread.appendChild(wrap);
      scrollToNew(wrap);
      const field = wrap.querySelector('input');
      // Focus lands where the person is being asked to type. WCAG 2.4.3.
      field?.focus();
      const submit = () => {
        const v = field.value;
        if (!v) return;
        wrap.remove();
        userBubble(cfg.display ? cfg.display(v) : v);
        res(v);
      };
      wrap.querySelector('button').addEventListener('click', submit);
      field.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    });
  }

  /* ── The loop ───────────────────────────────────────────────────── */

  async function run(stepId) {
    while (stepId !== null && stepId !== undefined && !cancelled) {
      const step = script[stepId];
      if (!step) break;

      const text = resolve(step.coach, context);
      if (text) await coachBubble(text);
      if (cancelled) return;

      let answer = null;
      if (step.type === 'chips') { await sleep(T.READ_PAUSE); answer = await askChips(step); }
      else if (step.type === 'input') { await sleep(T.READ_PAUSE); answer = await askInput(step); }
      else if (step.type === 'end') { onEnd?.(context); return; }

      if (cancelled) return;
      if (answer !== null) onAnswer?.(step.id, answer, context);

      stepId = resolve(step.next, answer, context);
    }
    onEnd?.(context);
  }

  run(start);

  return { destroy() { cancelled = true; } };
}

function _esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const _attr = _esc;
