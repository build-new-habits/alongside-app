/**
 * js/views/saved-sessions.js
 * 08 Sep 2026 v2
 *
 * v2 - SAVED-1b. A session whose movements have ALL been retired offered
 *   a Start button that did nothing. The handler ends
 *   `if (!exercises.length) return;` -- a silent no-op -- and the warning
 *   above it said the session "will start without them", so the copy
 *   promised precisely what the button refused. A dead control with no
 *   explanation is the shape STUCK-1 was. Found by mounting this view
 *   with ids that resolve to nothing.
 *
 *   No button now, and a line that says why. The row stays: it is still
 *   the person's session, and making it vanish answers a question they
 *   did not ask.
 *
 *   The same silent return sits in today.js's copy of this handler, on
 *   the Home room's featured session. Logged, not changed here.
 *
 * SAVED-1. The list the Your own room has been counting all along.
 *
 * ── WHAT WAS WRONG ─────────────────────────────────────────────────────
 *
 * YOUR-OWN (06 Sep) shipped saving from the build preview and showed the
 * NEWEST saved session on Home, with the rest behind a counted button --
 * "Your other 2 sessions". That button carried
 * `data-route="session-builder"`. It opened the BUILDER: a screen for
 * making a new session, reached by tapping a control that names sessions
 * you already have.
 *
 * And there was nowhere for it to go instead. `savedSessions` was
 * referenced in exactly one file, `today.js`. No list view existed, no
 * route pointed at one, and nothing in the app could show you something
 * you saved a fortnight ago. Graeme, on a handset: "I can't seem to be
 * able to save my own series of sessions. No place for history to exist
 * of recall."
 *
 * A room that counts things it will not show you is worse than one that
 * plainly does not have them, because the count is a promise.
 *
 * ── WHAT THIS IS ───────────────────────────────────────────────────────
 *
 * Every saved session, newest first, in the order `savedSessions()`
 * already returns them. Each one starts from here by the same path
 * today.js uses -- resolve ids against the LIVE library, mark it used,
 * write `generatedSession`, go. One start path, not two: a second copy
 * would be a second thing to keep in step with a library that changes.
 *
 * MISSING MOVEMENTS ARE SAID OUT LOUD. `resolveSavedSession()` has
 * always returned `missing` alongside the exercises, for a reason
 * written into that module: "a session that quietly comes back four
 * movements shorter than the person wrote is worse than one that says
 * so." Its only caller, today.js, destructures `{ exercises }` and drops
 * `missing` on the floor. This view honours what that module already
 * says it does. (today.js is not changed here -- that is its own fix,
 * logged, and this file is not the place to make it silently.)
 *
 * NO DELETE. `deleteSavedSession()` exists in the module with no caller
 * anywhere, and a list is the obvious home for it. It is deliberately
 * not wired up: adding a destructive control to somebody's own authored
 * work is a product decision, not an implementation one. Raised as an
 * option instead.
 *
 * ── TIER ───────────────────────────────────────────────────────────────
 *
 * `savedSessions()` returns [] for a free account by design -- free
 * composes freely, the Plan is what KEEPS it (R4, 20 Aug, which reversed
 * TIER-G on exactly that point). So [] has two entirely different
 * meanings and they must not share a screen. "You have not saved
 * anything yet" told to somebody who cannot save is a lie, and
 * "Upgrade to keep sessions" told to somebody who simply has none is a
 * sales pitch answering a question they did not ask.
 *
 * ── THE TOP-RIGHT CORNER ───────────────────────────────────────────────
 *
 * Nothing is placed there. The escape hatch is fixed, top-right,
 * z-index 10000, and STUCK-1 (08 Sep) was a screen that could not be
 * left because a close control was put under it. The header here follows
 * activity-log.js: h1 on the left, no corner control, nothing to
 * collide. If anything is ever added to that corner on this screen it
 * goes in the `corners` list in verify-hatchoverlap.mjs.
 */

import { store } from '../store.js';
// 18 Aug 2026, library.js v6. Imported explicitly rather than read as a
// bare name off app.js's window.router: that works in a browser and
// fails anywhere else, which is how verify-prac1 reported the Library's
// navigation broken and was right about the mechanism.
import { router } from '../router.js';
import { isPremium } from '../auth.js';
import {
  savedSessions,
  resolveSavedSession,
  markSavedSessionUsed
} from '../data/saved-sessions.js';

export const centered = false;

function _esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * "3 days ago" rather than a date. The question somebody asks of their
 * own list is how long it has been, not which Tuesday it was.
 */
function _agoLabel(iso) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return null;
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7)  return `${days} days ago`;
  if (days < 14) return 'last week';
  if (days < 61) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function _row(rec) {
  const { exercises, missing } = resolveSavedSession(rec);
  const count = Array.isArray(rec.exerciseIds) ? rec.exerciseIds.length : 0;

  // SAVED-1b, 08 Sep 2026. EVERY movement gone is not the same as some.
  //
  // The start handler ends `if (!exercises.length) return;` -- a silent
  // no-op. Tapping Start on a session whose movements have all been
  // retired did NOTHING: no navigation, no message, nothing on screen.
  // A dead control with no explanation, which is the shape STUCK-1 was.
  //
  // Worse, the warning above it said the session "will start without
  // them", so the copy promised exactly what the button would not do.
  //
  // So: no Start button when there is nothing to start, and a line that
  // says so plainly. The row stays -- the session is still the person's,
  // and hiding it would answer a question they did not ask.
  const runnable = exercises.length > 0;

  const facts = [
    rec.durationMins ? `${rec.durationMins} minutes` : null,
    `${count} movement${count === 1 ? '' : 's'}`,
    rec.lastUsedAt ? `Last done ${_agoLabel(rec.lastUsedAt)}` : 'Not done yet'
  ].filter(Boolean);

  // The accessible name carries the same facts the eye gets from the
  // list beneath the title, because a screen reader landing on this
  // button otherwise hears a name with no idea how long it is or
  // whether it has ever been done. WCAG 2.2 AA 2.4.6.
  const startLabel = `Start ${rec.name}. ${facts.join('. ')}.`;

  // Reuses the club-room classes rather than introducing a saved-row set.
  // Those styles already encode the decisions this list needs and the
  // reasons are written into club-rooms.css: facts STACKED one per line
  // because a middle-dot meta string scans as one blob, and .club-room__go
  // carrying a 44px floor for WCAG 2.2 AA 2.5.8 Target Size. A parallel
  // set of classes would be a second set to keep in step with those, and
  // the first divergence would be silent.
  //
  // The name is an <h2> so this list is navigable by heading, which is
  // how a screen reader user moves through a list of things they are
  // looking for one of. It carries the club-room__name class, so it
  // looks identical to the room it was reached from.
  return `
    <li class="club-room">
      <h2 class="club-room__name">${_esc(rec.name)}</h2>
      <ul class="club-room__facts">
        ${facts.map(f => `<li>${_esc(f)}</li>`).join('')}
      </ul>
      ${!runnable ? `
        <p class="ps-contra-flag" role="status">
          None of the movements in this one are in the library any more,
          so there is nothing left to start. It is still here, and still
          yours — nothing has been deleted.
        </p>
      ` : missing > 0 ? `
        <p class="ps-contra-flag" role="status">
          ${missing} movement${missing === 1 ? '' : 's'} from this session
          ${missing === 1 ? 'is' : 'are'} no longer in the library, so it
          will start without ${missing === 1 ? 'it' : 'them'}.
        </p>
      ` : ''}
      ${runnable ? `
        <button class="btn btn-primary btn-full club-room__go"
                data-saved-id="${_esc(rec.id)}"
                aria-label="${_esc(startLabel)}">
          Start ${_esc(rec.name)}
        </button>
      ` : ''}
    </li>
  `;
}

export function render() {
  const list = savedSessions();

  // Two different empty states. See the TIER note in the file header.
  if (!list.length) {
    return isPremium()
      ? `
        <div class="view saved-sessions-view">
          <div class="view-header">
            <h1>Your own sessions</h1>
            <p class="text-secondary">Sessions you put together yourself.</p>
          </div>
          <div class="card">
            <p>Nothing saved yet. When you build a session you like, there is
               a save on the preview screen — name it whatever makes sense to
               you, and it will be here.</p>
          </div>
        </div>
      `
      : `
        <div class="view saved-sessions-view">
          <div class="view-header">
            <h1>Your own sessions</h1>
            <p class="text-secondary">Sessions you put together yourself.</p>
          </div>
          <div class="card">
            <p>You can build your own sessions on any plan. Keeping them is
               part of the Plan tier, so this list stays empty until then.</p>
          </div>
        </div>
      `;
  }

  return `
    <div class="view saved-sessions-view">
      <div class="view-header">
        <h1>Your own sessions</h1>
        <p class="text-secondary">
          ${list.length} saved, newest first.
        </p>
      </div>

      <ul class="club-rooms" style="list-style:none;padding:0;">
        ${list.map(_row).join('')}
      </ul>
    </div>
  `;
}

export function onMount() {
  const root = document.getElementById('main-content');
  if (!root) return;

  // SAVED-1. The same start path today.js uses, deliberately identical:
  // resolve against the LIVE library so a saved session picks up safety
  // corrections instead of carrying a frozen copy of the database, mark
  // it used, then hand over. An exercise that has since gone is dropped
  // and the session still starts -- refusing would punish somebody for a
  // library change they did not make.
  root.querySelectorAll('[data-saved-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const rec = savedSessions().find(s => s.id === btn.dataset.savedId);
      if (!rec) return;
      const { exercises } = resolveSavedSession(rec);
      if (!exercises.length) return;
      markSavedSessionUsed(rec.id);
      store.set('generatedSession', {
        session: {
          id:          rec.sessionType || 'own',
          title:       rec.name,
          duration:    rec.durationMins ? `${rec.durationMins} mins` : null,
          exercises,
          sessionType: rec.sessionType || null
        },
        builtAt: new Date().toISOString(),
        inputs:  { savedSessionId: rec.id }
      });
      store.set('usingGeneratedSession', true);
      router.navigate('gym-programme');
    });
  });
}
