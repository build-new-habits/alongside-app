/**
 * js/views/class-list.js
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
import { CLASSES, classSafety } from '../data/classes/index.js';
import { durationLabel, sectionsFor } from '../data/class-contract.js';
import { STRANDS } from '../data/aims.js';
import { startClass } from './class-player.js';

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
    painScores:   store.get('painScores') || {}
  };
}

export function render() {
  const mine = _arcStrands();
  const opts = _conditions();

  const rows = CLASSES.map(cls => {
    const safety = classSafety(cls, opts);
    const secs = sectionsFor(cls);
    return {
      cls,
      safety,
      sections: secs.length,
      length: durationLabel(cls),
      // Named, never used to reorder. See the header.
      inArc: mine.has(cls.serves),
      strandLabel: (STRANDS[cls.serves] && STRANDS[cls.serves].label) || cls.serves
    };
  });

  const open = rows.filter(r => r.safety.offer);
  const held = rows.filter(r => !r.safety.offer);

  return `
    <div class="view class-list">
      <h1 class="class-list__title" tabindex="-1">Classes</h1>
      <p class="class-list__intro">
        Pick the one you want. They run the same for everybody — the
        difference here is that they know what you're working towards.
      </p>

      ${open.length ? `
        <ul class="class-list__board">
          ${open.map(r => `
            <li class="class-list__row">
              <h2 class="class-list__name">${_esc(r.cls.title)}</h2>
              <p class="class-list__facts">
                ${_esc(r.length)} · ${r.sections} parts · ${_esc(r.cls.position)}
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
                        aria-label="Start ${_esc(r.cls.title)}, ${_esc(r.length)}">
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
                  Has ${_esc(r.safety.blockedBy.join(', '))} in it, and you've
                  told me to steer clear of that at the moment.
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

  root.querySelectorAll('[data-start]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ok = startClass(btn.dataset.start, { lighter: btn.dataset.lighter === '1' });
      if (ok) router.navigate('class-player');
    });
  });

  root.querySelector('#cl-back')?.addEventListener('click', () => router.navigate('today'));
}
