/**
 * js/views/class-player.js
 *
 * 08 Sep 2026 v2
 *
 * v2 - PACING-1. Runs on the contract's timing model, and gains a
 *   PAUSE that resumes mid-beat rather than restarting the line.
 *
 * 08 Sep 2026 v1
 *
 * PLAYER-1. The view that plays a guided class.
 *
 * ── WHY THIS EXISTS ──────────────────────────────────────────────────
 *
 * Seven classes were written and encoded and gated, and NOTHING COULD
 * PLAY THEM. No view imported the data, no route reached it, and the
 * only code in the repo calling sectionsFor() was their own gate. The
 * Guided class room had already been through this once: GUIDED-COPY made
 * that card stop promising "a set course, same shape each week" because
 * the programmes had empty sequences. Graeme, on device: "There is no
 * Class content to follow. No programme." There was content and still no
 * way to follow it.
 *
 * ── THE THING THIS VIEW IS NOT ───────────────────────────────────────
 *
 * 🔴 It is not workout.js. A session is a list of exercises with a timer
 * on each. A class is a SCRIPT: mostly silence, some questions, a few
 * movements, and an argument running through it that only works in
 * order. The beats are the unit, not the exercises, and half of them
 * have no exercise at all.
 *
 * ⚫ So it advances on a CLOCK, not on a tap. Every other session view in
 * this app waits for the person; a class does not, because a class where
 * you tap through the silences is not a class, it is a document. The one
 * exception is the beat that ends a section, which is where somebody
 * catching up gets a moment.
 *
 * ── WHAT IT REFUSES TO DO ────────────────────────────────────────────
 *
 * 🔴 holdSeconds is never scaled. pacedBeat() in the contract is the only
 * thing that applies a rate, and it touches speechSeconds alone. This
 * view calls it rather than doing its own arithmetic, so there is one
 * place that could ever get it wrong and it is not here.
 *
 * 🔴 `lighter` is read ONCE, at start, from the store. Switching variants
 * mid-class would drop somebody into a section they had not been shown
 * or repeat one they had.
 *
 * ⚫ No progress bar across the whole class, and no count of classes
 * done. Four of the seven exist to argue that today's result is not the
 * evidence; a bar creeping towards a finish line contradicts them from
 * the corner of the screen. The section name and "3 of 8" is enough to
 * know where you are, and that is a different thing from a score.
 *
 * ── ACCESSIBILITY ────────────────────────────────────────────────────
 *
 * The screen changes on a timer, under somebody who may be lying on the
 * floor with their eyes shut. That is TIMER-1's problem again, at the
 * scale of a whole class:
 *
 *   · Each beat's text lands in a role="status" region, so a change is
 *     announced rather than silently swapped.
 *   · One h1 for the class, one h2 for the section. The outline is what
 *     a screen reader user navigates by.
 *   · prefers-reduced-motion collapses transitions; the TIMINGS are not
 *     animation and are left alone.
 *   · The exit is a real button, always present, never behind a hold.
 */

import { store } from '../store.js';
import { router } from '../router.js';
import { CLASSES } from '../data/classes/index.js';
import { sectionsFor, voiceFor, durationLabel,
         beatSeconds, silenceTailSeconds } from '../data/class-contract.js';

export const centered = false;

// ── Module state. Position lives in the STORE (see schema v1.57); this
// is only what cannot survive a reload anyway.
let _timer     = null;
let _sections  = [];
let _cls       = null;
let _lighter   = false;
/**
 * PACING-1. Paused, and how much of the current beat is left.
 *
 * Graeme's call, arrived at while deciding how to round the class
 * length: the case for padding the number was transition time, and the
 * better answer is that the person can stop the clock themselves. "Round
 * it up to the nearest minute, but also tell them they can pause."
 *
 * So the number is honest to the minute and the slack lives here, where
 * the person controls it, instead of being added to a figure on their
 * behalf.
 */
let _paused    = false;
let _remaining = 0;   // ms left of the current beat when paused
let _startedAt = 0;   // when the current beat's timer began

const REDUCED = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function _esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _state() {
  return store.get('activeClass') || {};
}

function _load() {
  const st = _state();
  _cls = CLASSES.find(c => c.id === st.id) || null;
  _lighter = !!st.lighter;
  _sections = _cls ? sectionsFor(_cls, { lighter: _lighter }) : [];
}

/** The beat being shown, or null when the class has finished. */
function _currentBeat() {
  const { sectionIndex = 0, beatIndex = 0 } = _state();
  const sec = _sections[sectionIndex];
  if (!sec) return null;
  return sec.beats[beatIndex] || null;
}

/**
 * PACING-1. How long this beat holds the screen: SAYING IT, then the
 * pause written after it.
 *
 * The first version used speechSeconds alone and ran a fifteen minute
 * class in eight and a half, because nothing accounted for the time to
 * say the line. beatSeconds() in the contract is the single place that
 * knows, so this view does no arithmetic of its own — including none on
 * holdSeconds, which is added and never scaled.
 */
function _beatMs(beat) {
  const rate = Number(store.get('speechRate')) || 1;
  return beatSeconds(beat, { lighter: _lighter, rate }) * 1000;
}

/**
 * PACING-1. The silence at the end of a section.
 *
 * A section runs for its stated duration. Beats consume time inside it
 * and the remainder is quiet — which in a class is not dead air but the
 * part where somebody lies still, and it is why the number on the card
 * is now true rather than aspirational.
 */
function _tailMs() {
  const { sectionIndex = 0 } = _state();
  const sec = _sections[sectionIndex];
  if (!sec) return 0;
  const rate = Number(store.get('speechRate')) || 1;
  return silenceTailSeconds(sec, { lighter: _lighter, rate }) * 1000;
}

// ── Render ────────────────────────────────────────────────────────────

export function render() {
  _load();

  if (!_cls) {
    return `
      <div class="view class-player">
        <h1 tabindex="-1">No class open</h1>
        <p class="text-secondary">
          That class is no longer available. Nothing has been lost — pick
          another whenever you want to.
        </p>
        <button class="btn btn-primary btn-full" id="cp-home">Back to today</button>
      </div>`;
  }

  const st  = _state();
  const sec = _sections[st.sectionIndex];

  if (!sec) return _renderDone();

  // beatIndex === beats.length is the SILENCE TAIL, not an error.
  const beat = sec.beats[st.beatIndex];
  const inTail = !beat;
  const spoken = beat ? voiceFor(beat, { lighter: _lighter }) : '';
  const held = typeof beat?.holdSeconds === 'number';

  return `
    <div class="view class-player">
      <div class="class-player__head">
        <button class="btn btn-ghost" id="cp-exit"
                aria-label="Leave ${_esc(_cls.title)}">✕ Leave</button>
        <span class="class-player__where">
          ${st.sectionIndex + 1} of ${_sections.length}
        </span>
      </div>

      <h1 class="class-player__title" tabindex="-1">${_esc(_cls.title)}</h1>
      <h2 class="class-player__section">${_esc(sec.title)}</h2>

      <!--
        PLAYER-1. role="status" because the beat changes ON A TIMER, under
        somebody who may be lying on the floor with their eyes shut. Same
        fault TIMER-1 fixed on the in-session card, at the scale of a whole
        class: a screen that changes by itself and announces nothing.
      -->
      <div class="class-player__beat" role="status" aria-live="polite">
        ${beat?.screen ? `<p class="class-player__screen">${_esc(beat.screen)}</p>` : ''}
        ${spoken ? `<p class="class-player__voice">${_esc(spoken)}</p>` : ''}
        ${inTail ? `
          <p class="class-player__quiet">Nothing to do for a moment.</p>` : ''}
        ${held ? `
          <p class="class-player__held">
            Holding for ${beat.holdSeconds} seconds. Come out of it whenever you need to.
          </p>` : ''}
      </div>

      <!--
        PACING-1. Pause first, because it is the one the person needs
        when something happens in the room -- the door, the phone,
        somebody talking to them. The class holds where it is.
      -->
      <button class="btn btn-primary btn-full" id="cp-pause"
              aria-pressed="${_paused ? 'true' : 'false'}">
        ${_paused ? 'Carry on' : 'Pause'}
      </button>

      <!--
        A SKIP rather than a next: the class advances on its own, so this
        is for somebody ready before it is. Never behind a hold.
      -->
      <button class="btn btn-secondary btn-full" id="cp-skip">Move on</button>

      <p class="class-player__pausenote">
        You can pause this whenever you need to. It waits.
      </p>
    </div>`;
}

function _renderDone() {
  return `
    <div class="view class-player">
      <h1 class="class-player__title" tabindex="-1">${_esc(_cls.title)}</h1>
      <p class="class-player__voice">That's the class.</p>
      <button class="btn btn-primary btn-full" id="cp-home">Back to today</button>
    </div>`;
}

// ── Mount ─────────────────────────────────────────────────────────────

export function onMount() {
  _load();

  const root = document.getElementById('main-content');
  if (!root) return;

  root.querySelector('#cp-exit')?.addEventListener('click', leave);
  root.querySelector('#cp-home')?.addEventListener('click', leave);
  root.querySelector('#cp-skip')?.addEventListener('click', () => advance());
  root.querySelector('#cp-pause')?.addEventListener('click', togglePause);

  const st = _state();
  if (!_sections[st.sectionIndex]) { _stop(); return; }

  const beat = _currentBeat();

  // The clock. Cleared first every time, because a re-render that leaves
  // the old timer running advances the class twice as fast and the second
  // one is invisible.
  _stop();
  if (_paused) return;   // held where it is, deliberately, until asked

  // No beat means the silence tail: hold until the section's stated end.
  // _remaining survives a pause so carrying on resumes MID-BEAT rather
  // than restarting the line, which would repeat words already said.
  const ms = _remaining > 0 ? _remaining : (beat ? _beatMs(beat) : _tailMs());
  _remaining = 0;
  _startedAt = Date.now();
  _timer = setTimeout(() => advance(), Math.max(200, ms));
}

/** Next beat, next section, or done. */
export function advance() {
  _stop();
  const st = { ..._state() };
  const sec = _sections[st.sectionIndex];
  if (!sec) return;

  if (st.beatIndex + 1 < sec.beats.length) {
    st.beatIndex += 1;
  } else if (st.beatIndex < sec.beats.length) {
    // Past the last beat, into the section's silence tail.
    st.beatIndex = sec.beats.length;
  } else {
    st.sectionIndex += 1;
    st.beatIndex = 0;
  }
  store.set('activeClass', st);
  _rerender();
}

/**
 * PLAYER-1. Leaving is one tap and asks nothing.
 *
 * ⚫ The session views confirm before exiting, and rightly: a workout has
 * a partial record worth keeping. A class has no record to lose. Asking
 * "are you sure?" of somebody who has decided to stop halfway through a
 * gentle class is a small argument at the exact moment they least want
 * one, in an app whose classes spend their whole length saying that
 * stopping is allowed.
 */
export function leave() {
  _stop();
  _paused = false; _remaining = 0;
  store.set('activeClass', {
    id: null, lighter: false, sectionIndex: 0, beatIndex: 0, startedAt: null
  });
  router.navigate('today');
}

/**
 * PACING-1. Stops the clock where it is, and starts it again from there.
 *
 * ⚫ Resuming does NOT restart the beat. Somebody who paused eight
 * seconds into a forty second pause does not want the line said again;
 * they want the forty seconds to carry on. _remaining is what makes that
 * true, and it is why pause is not just a flag.
 */
export function togglePause() {
  if (_paused) {
    _paused = false;
    _rerender();
    return;
  }
  _paused = true;
  const elapsed = Date.now() - _startedAt;
  const beat = _currentBeat();
  const full = beat ? _beatMs(beat) : _tailMs();
  _remaining = Math.max(200, full - elapsed);
  _stop();
  _rerender();
}

function _stop() {
  if (_timer) { clearTimeout(_timer); _timer = null; }
}

function _rerender() {
  const root = document.getElementById('main-content');
  if (!root) return;
  root.innerHTML = render();
  onMount();
}

/**
 * Opens a class. The only way in.
 *
 * `lighter` is fixed HERE and never read again: switching variants
 * mid-class would drop somebody into a section they had not been shown,
 * or repeat one they had.
 */
export function startClass(classId, { lighter = false } = {}) {
  const cls = CLASSES.find(c => c.id === classId);
  if (!cls) return false;
  _paused = false; _remaining = 0;
  store.set('activeClass', {
    id: cls.id,
    lighter: !!lighter,
    sectionIndex: 0,
    beatIndex: 0,
    startedAt: new Date().toISOString()
  });
  return true;
}

/** What the card should say about a class, without opening it. */
export function classCard(cls, { lighter = false } = {}) {
  const secs = sectionsFor(cls, { lighter });
  const mins = secs.reduce((a, s) => a + (s.durationSeconds || 0), 0) / 60;
  return {
    id:       cls.id,
    title:    cls.title,
    length:   lighter ? durationLabel({ durationMins: mins }) : durationLabel(cls),
    sections: secs.length,
    flags:    cls.flags || []
  };
}
