/**
 * js/views/class-list.js
 *
 * 01 Nov 2026 v7
 *
 * v7 - P-13 Classes (mock-up v1 approved by Graeme, 01 Nov: "Yes, build
 *   it"; trace P-12 F2, F6). On the Plan only: one row per class (how
 *   long, where you'll be, what it is for; Your arc where it feeds it),
 *   no buttons until one is chosen (there were twenty); then the class's
 *   own page, the shape of Today's plan: Full or Shorter as one choice,
 *   Before you start in sentences (the flags were hyphenated words), its
 *   parts with their minutes and the stick figure where a part has one,
 *   and Start. Not today still names what is left out and why. Free
 *   unchanged.
 *
 * v6 - W5-2 BAD-DAY-DOORS. On a Bad day Classes asks Rest today / Something
 *   gentler first (views/bad-day-door.js).
 *
 * 02 Oct 2026 v5
 *
 * v5 - W4-9. A held class says the app is leaving the move out ("which I'm
 *   leaving out for you at the moment"), not that the person asked for it.
 *
 * 30 Sep 2026 v4
 *
 * v4 - W3-20. "They know what you're working towards" only when there is
 *   something they know: an arc. Free has none.
 *
 * v3 - S1-SEATED (found building the S1 clinical pack). "can be done
 *   seated" only where every movement step has a seated version in what
 *   the class says (seatedThroughout, data/classes v4). Ground, Bending and
 *   Unsticking declared a seated route that four of their steps did not
 *   give; until the physio's seated wording goes in, they do not say it.
 *
 * v2 - P22, CLASSES ON FREE (persona finding W2-18). The list gave a
 *   class's position ("floor") and never said it could be done seated,
 *   though the class declares it (seatedRoute, class-contract: "somebody
 *   who cannot get to the floor needs to know before they start"). Each
 *   class that declares a seated route, or is seated throughout, now says
 *   "can be done seated" on its line and in its Start button's name.
 *   Reached from Free Home too (today.js). And pain scores are read
 *   from conditionPainScores: the list read 'painScores', which does not
 *   exist, so a severe score never held a class back.
 *
 * 08 Sep 2026 v1
 *
 * TIMETABLE-1. Every class, on a board, pick one.
 *
 * ── WHY A TIMETABLE AND NOT A RECOMMENDATION ─────────────────────────
 *
 * Graeme: "When I go to Nuffield they have a timetable. I get to choose
 * which class I go to because I can see the timetable. Why don't we do
 * the same?"
 *
 * That is the difference between this room and One to one, stated in
 * one sentence. One to one is a coach who picks FOR you, around how you
 * are today. This is a wall with the classes on it. Somebody arriving
 * here has already decided they want to choose.
 *
 * ⚫ So there is no "suggested for today" badge and nothing is sorted by
 * what the coach thinks. The classes are listed in the order they were
 * written, which is the order that makes least claim.
 *
 * ── WHAT THE ARC DOES, AND DOES NOT, DO ──────────────────────────────
 *
 * Graeme again: "The difference is this is better, because it actually
 * knows my arc. Whereas if I go to my guided yoga class at Nuffield they
 * know nothing about me."
 *
 * So a class that serves a strand the person's arc contains SAYS SO --
 * and that is all it does. It is not moved up the list, not badged, not
 * chosen. Naming it is information; reordering would be the coach
 * picking, which is the other room.
 *
 * ── SAFETY IS A WITHHOLDING, NOT AN ADAPTATION ───────────────────────
 *
 * 🔴 A class whose movements are unsafe for a declared severe zone is
 * NOT shown with a warning, and NOT quietly edited. It is withheld, and
 * the reason is given.
 *
 * Graeme: "If someone says I've got a bad back and it's an eight, then
 * we're not gonna give them anything that has back work in it." This
 * app does not analyse anybody's health or prescribe around it; it
 * declines to offer things somebody has told it to avoid, which is a
 * different and much smaller claim.
 *
 * classSafety() does the judging, using the same two functions the
 * session builder and practice library use. Nothing here decides
 * anything about a body.
 */

import { store } from '../store.js';
import { router } from '../router.js';
import { CLASSES, classSafety, seatedThroughout } from '../data/classes/index.js';
import { durationLabel, sectionsFor, lighterMinutes } from '../data/class-contract.js';
import { isPremium } from '../auth.js';
import { lineIcon } from '../data/line-icons.js';
import { hasFigure, renderFigure } from '../figures.js';
import { STRANDS } from '../data/aims.js';
import { startClass } from './class-player.js';
import { badDayIds, renderBadDayDoor, wireBadDayDoor } from './bad-day-door.js';

export const centered = false;

function _esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * The strands this person's arc contains, or an empty set.
 *
 * `arc`, not `stretchArc` -- renamed in store.js v63, and the old name
 * would have read as an empty arc for everybody rather than failing. A
 * field that quietly returns nothing is worse than one that throws.
 */
function _arcStrands() {
  const arc = store.get('arc') || {};
  return new Set(Array.isArray(arc.strands) ? arc.strands : []);
}

function _conditions() {
  return {
    conditionIds: store.get('conditions') || [],
    // P22. The field is conditionPainScores; 'painScores' does not exist,
    // so a severe score never reached classSafety() and a class that should
    // be held for an acutely sore area was offered.
    painScores:   store.get('conditionPainScores') || {}
  };
}

// ── v7: the Plan's Classes ─────────────────────────────────────────────
let _chosen = null;          // the class whose page is open (the Plan's), or null for the list
let _short  = false;         // Full or Shorter, on that page

const WHERE = { floor: 'on the floor', seated: 'seated', standing: 'standing', walking: 'walking, outdoors', mixed: 'floor optional' };
// Each flag, said in a sentence (Before you start). An unknown flag is said in its own words.
const SAY = {
  'floor-transfer': "You'll get down onto the floor and back up.",
  'up-and-down-once': "You'll get down to the floor and up again, once.",
  'repeated-up-and-down': "You'll get down to the floor and back up more than once.",
  'getting-down-and-up': "You'll get down to the floor and back up.",
  'floor-position': 'Most of it is on the floor.',
  'floor-optional': 'The floor is optional.',
  'no-floor': 'Nothing on the floor.',
  'bending-forward': 'It bends forward.',
  'mostly-seated': 'Mostly seated.',
  'standing-with-support': 'Some standing, holding something steady.',
  'standing-throughout': 'Standing throughout.',
  'needs-a-chair': "You'll need a chair.",
  'one-held-position': 'One position is held for a while.',
  'holding-positions': 'Some positions are held for a while.',
  'eyes-closed-offered': 'Closing your eyes is offered, never needed.',
  'body-focused-attention': 'It asks you to notice your body.',
  'deliberately-stopping-short': 'It stops before the end of each movement, on purpose.',
  'outdoors': "It's outside.",
  'going-alone': 'You do it on your own.',
  'uneven-ground': 'The ground may be uneven.',
  'weather-and-light': 'Mind the weather and the light.',
};
const _say = f => SAY[f] || (String(f).replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()) + '.');
const _mins = secs => Math.max(1, Math.round(secs / 60));
// The part's stick figure: the first exercise in it that has one.
function _figFor(sec) {
  const id = (sec.beats || []).map(b => b.practiceId || b.exerciseId).find(x => x && hasFigure(x));
  if (!id) return '';
  const h = renderFigure(id); const i = h.indexOf('<svg'), j = h.indexOf('</svg>');
  return i < 0 || j < 0 ? '' : h.slice(i, j + 6);
}

function _planList(rows, open, held) {
  const chev = `<span class="path-door__chev" aria-hidden="true">${lineIcon('chevron', 20)}</span>`;
  return `
    <div class="view class-list is-plan">
      <button class="btn btn-ghost plan-back" id="cl-back" aria-label="Back to Home">‹ Back</button>
      <h1 class="class-list__title" tabindex="-1">Classes</h1>
      <p class="class-list__intro">Follow along, start to finish. Pick one to see what\u2019s in it.</p>
      ${open.length ? `<ul class="path-list">${open.map(r => `<li><button type="button" class="path-door path-row" data-class="${_esc(r.cls.id)}">
          <span class="kind-tile k-rose">${lineIcon('classes')}</span>
          <span class="path-door__text"><span class="path-door__t">${_esc(r.cls.title)}${r.inArc ? ' <span class="path-badge">Your arc</span>' : ''}</span>
            <span class="path-door__d">${Math.round(r.cls.durationMins)} min \u00b7 ${_esc(WHERE[r.cls.position] || r.cls.position)}${r.seatable && r.cls.position !== 'seated' ? ' \u00b7 can be done seated' : ''}</span>
            <span class="path-door__d">For ${_esc(r.strandLabel.charAt(0).toLowerCase() + r.strandLabel.slice(1))}</span></span>${chev}</button></li>`).join('')}</ul>` : `
        <p class="class-list__empty">Nothing here today, because of what you've told me to avoid. That isn't permanent.</p>`}
      ${held.length ? `
        <section class="class-list__held">
          <h2 class="look-label">Not today</h2>
          <ul class="class-list__board">${held.map(r => `
            <li class="class-list__row class-list__row--held">
              <h3 class="class-list__name">${_esc(r.cls.title)}</h3>
              <p class="class-list__why">Has ${_esc(r.safety.blockedBy.join(', '))} in it, which I'm leaving out for you at the moment.</p>
            </li>`).join('')}</ul>
        </section>` : ''}
    </div>`;
}

function _planClass(r) {
  const cls = r.cls;
  const shortOk = !!cls.lighter;
  const short = shortOk && _short;
  const secs = sectionsFor(cls, { lighter: short });
  const say = [...(cls.flags || []).map(_say), ...(r.seatable && cls.position !== 'seated' ? ['It can all be done seated.'] : [])];
  return `
    <div class="view class-list class-page is-plan">
      <button class="btn btn-ghost plan-back" id="cl-list" aria-label="Back to Classes">‹ Back</button>
      <h1 class="class-list__title" tabindex="-1">${_esc(cls.title)}</h1>
      <p class="class-list__intro">For ${_esc(r.strandLabel.charAt(0).toLowerCase() + r.strandLabel.slice(1))}.${r.inArc ? ' Part of your arc.' : ''}</p>
      ${shortOk ? `<fieldset class="path-seg"><legend>How long?</legend><div class="path-seg__opts">
        <label><input type="radio" name="cl-len" value="full"${short ? '' : ' checked'}><span>Full \u00b7 ${Math.round(cls.durationMins)} min</span></label>
        <label><input type="radio" name="cl-len" value="short"${short ? ' checked' : ''}><span>Shorter \u00b7 ${Math.round(lighterMinutes(cls))} min</span></label>
      </div></fieldset>` : ''}
      ${say.length ? `<section class="class-before" aria-labelledby="cl-before-h"><h2 class="class-before__h" id="cl-before-h">Before you start</h2>${say.map(t => `<p>${_esc(t)}</p>`).join('')}</section>` : ''}
      <h2 class="look-label" id="cl-parts-h">What\u2019s in it</h2>
      <ol class="class-parts" aria-labelledby="cl-parts-h">${secs.map(sec => { const fig = _figFor(sec); return `<li class="class-part">
          <span class="class-part__fig${fig ? '' : ' is-none'}" aria-hidden="true">${fig}</span>
          <span class="path-door__text"><span class="path-door__t">${_esc(sec.title)}</span><span class="path-door__d">${_mins(sec.durationSeconds || 0)} min</span></span></li>`; }).join('')}</ol>
      <button class="btn btn-primary btn-large btn-full" data-start="${_esc(cls.id)}"${short ? ' data-lighter="1"' : ''}>Start ${_esc(cls.title)}</button>
    </div>`;
}

export function render(stay = false) {
  // v7. Opened by the router: the list first, never a class left open from an earlier visit.
  if (!stay) { _chosen = null; _short = false; }
  // W5-2. A Bad day asks first, as Run and the coach do.
  if (badDayIds().length) return renderBadDayDoor('Before a class');
  const mine = _arcStrands();
  const opts = _conditions();

  const rows = CLASSES.map(cls => {
    const safety = classSafety(cls, opts);
    const secs = sectionsFor(cls);
    return {
      cls,
      safety,
      // P22. The class's own declaration (class-contract seatedRoute).
      // S1-SEATED (30 Sep). Only where every step says how to do it
      // sitting: a declared seatedRoute is not enough, the player plays words.
      seatable: seatedThroughout(cls),
      sections: secs.length,
      length: durationLabel(cls),
      // Named, never used to reorder. See the header.
      inArc: mine.has(cls.serves),
      strandLabel: (STRANDS[cls.serves] && STRANDS[cls.serves].label) || cls.serves
    };
  });

  const open = rows.filter(r => r.safety.offer);
  const held = rows.filter(r => !r.safety.offer);

  // v7. The Plan: the list, or the chosen class's own page.
  if (isPremium()) {
    const pick = _chosen && open.find(r => r.cls.id === _chosen);
    return pick ? _planClass(pick) : _planList(rows, open, held);
  }

  return `
    <div class="view class-list">
      <h1 class="class-list__title" tabindex="-1">Classes</h1>
      <p class="class-list__intro">
        Pick the one you want. They run the same for everybody${mine.length ? ` — the
        difference here is that they know what you're working towards` : ""}.
      </p>

      ${open.length ? `
        <ul class="class-list__board">
          ${open.map(r => `
            <li class="class-list__row">
              <h2 class="class-list__name">${_esc(r.cls.title)}</h2>
              <p class="class-list__facts">
                ${_esc(r.length)} · ${r.sections} parts · ${_esc(r.cls.position)}${r.seatable && r.cls.position !== 'seated' ? ' · can be done seated' : ''}
              </p>
              <p class="class-list__serves">
                ${r.inArc
                  ? `Part of your arc — ${_esc(r.strandLabel)}`
                  : _esc(r.strandLabel)}
              </p>
              ${(r.cls.flags || []).length ? `
                <p class="class-list__flags">${
                  (r.cls.flags || []).map(f => _esc(String(f).replace(/-/g, ' '))).join(' · ')
                }</p>` : ''}

              <div class="class-list__actions">
                <button class="btn btn-primary btn-full"
                        data-start="${_esc(r.cls.id)}"
                        aria-label="Start ${_esc(r.cls.title)}, ${_esc(r.length)}${r.seatable ? ', can be done seated' : ''}">
                  Start ${_esc(r.cls.title)}
                </button>
                ${r.cls.lighter ? `
                  <button class="btn btn-secondary btn-full"
                          data-start="${_esc(r.cls.id)}" data-lighter="1"
                          aria-label="Start the shorter version of ${_esc(r.cls.title)}">
                    Shorter version
                  </button>` : ''}
              </div>
            </li>`).join('')}
        </ul>` : `
        <p class="class-list__empty">
          Nothing here today, because of what you've told me to avoid.
          That isn't permanent.
        </p>`}

      ${held.length ? `
        <!--
          TIMETABLE-1. Withheld classes are NAMED, not hidden.
          A class that vanishes leaves somebody wondering whether it
          exists; a class that says why it is not on offer today is a
          fact they can do something with. It is also honest about the
          app declining rather than deciding.
        -->
        <section class="class-list__held">
          <h2 class="class-list__held-title">Not today</h2>
          <ul class="class-list__board">
            ${held.map(r => `
              <li class="class-list__row class-list__row--held">
                <h3 class="class-list__name">${_esc(r.cls.title)}</h3>
                <p class="class-list__why">
                  Has ${_esc(r.safety.blockedBy.join(', '))} in it, which I'm
                  leaving out for you at the moment.
                </p>
              </li>`).join('')}
          </ul>
        </section>` : ''}

      <button class="btn btn-ghost btn-full" id="cl-back">Back to today</button>
    </div>`;
}

export function onMount() {
  const root = document.getElementById('main-content');
  if (!root) return;
  if (badDayIds().length) { wireBadDayDoor(root); return; }

  // v7. The Plan: a row opens its class's page; Back returns to the list; the length is one choice.
  const redraw = focus => { root.innerHTML = render(true); onMount(); root.querySelector(focus)?.focus?.(); };
  root.querySelectorAll('[data-class]').forEach(btn => btn.addEventListener('click', () => { _chosen = btn.dataset.class; _short = false; redraw('h1'); }));
  root.querySelector('#cl-list')?.addEventListener('click', () => { const was = _chosen; _chosen = null; redraw(`[data-class="${was}"]`); });
  root.querySelectorAll('input[name="cl-len"]').forEach(i => i.addEventListener('change', () => { _short = i.value === 'short'; redraw(`input[name="cl-len"][value="${i.value}"]`); }));

  root.querySelectorAll('[data-start]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ok = startClass(btn.dataset.start, { lighter: btn.dataset.lighter === '1' });
      if (ok) { _chosen = null; router.navigate('class-player'); }
    });
  });

  root.querySelector('#cl-back')?.addEventListener('click', () => router.navigate('today'));
}
