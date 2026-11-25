/**
 * tools/verify-tiergh.mjs
 * 24 Nov 2026 v8
 *
 * v8 - S4b TIDY. P-46 S4b TIDY. TIER-H: Free never reaches the Library
 *   (FREE_MOVED), so Free's At home and At the gym lists and their locks are
 *   gone; it checks the route and that nothing in the Library is locked.
 *
 * 06 Oct 2026 v7
 *
 * v7 - D-11 PROGRESS-SHARE. 15/15b RE-POINTED, nothing loosened: the export
 *   is the share screen now. A free user taps Share your progress on the
 *   real Progress, lands on progress-share, and the real ProgressShareView
 *   mounted on the free tier offers all four formats; 15b: the report (the
 *   page for a trainer, a dietitian or a doctor) among them, and it renders.
 *
 * v6 - LOOK-4: the Library's first page now shows the categories itself
 *   (the Start a session step is folded in, Graeme approved 04 Oct). Check
 *   1 asserts the categories are real buttons on the first page; checks 2
 *   onward read the same cards as before, one tap sooner.
 *
 * 04 Oct 2026 v5 (LOOK-2)
 *
 * v5 - LOOK-2: the export buttons are on the Share page, one tap away
 *   (progress.js v26). REACH only: 15/15b click the Share row on the free
 *   tier first, then look for the three buttons. Same expected values.
 *
 * v4 - P0. Check 14 reads My exercises (prescribed.js, prescribed-session.js) now Conditions Update is retired.
 *
 * 21 Aug 2026 v3
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 20 Aug 2026 v2
 *
 * TIER-G/H/I — what a free user can actually reach in the Library and
 * the session builder.
 *
 * R4, 20 Aug 2026. INVERTED. v1 asserted the 12 Aug boundary: exactly
 * ONE free door inside "At home", five self-directed cards locked, and
 * exactly ONE pressable build mode. That boundary charged for CONTROL
 * and is retired -- self-direction is an accessibility feature, and
 * charging for it penalised the person mainstream fitness culture
 * already fails worst.
 *
 * The load-bearing inverse moves rather than disappears. It used to be
 * "there is exactly one free door". It is now "there is exactly one
 * LOCKED door, and it is My programme" -- because a gate that only
 * asserted things are open would stay green if the whole paywall fell
 * out, and the twelve-week programme is genuinely the arc.
 *
 * THIS GATE EXECUTES THE VIEWS. Both faults were invisible to source
 * text. TIER-G's screen read as correct because the three routes are
 * genuinely correct on the paid tier; TIER-H's asymmetry was two
 * `tier` fields three lines apart, each defensible alone. Neither is a
 * missing string. Both are "what does a free user actually reach",
 * which only a render at a seeded tier can answer.
 *
 * The load-bearing assertions are the inverses, #4 and #9: not "the
 * locked thing is locked" but "there is exactly one free door, and it
 * is the coach-built one." A gate asserting only presence would stay
 * green if a second free route were added tomorrow.
 *
 * Every assertion was reversal-tested — reverted on a copy first and
 * confirmed to go red.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
import fs from 'node:fs';
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>',
  { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store }  = await import(BASE + 'store.js');
const { router } = await import(BASE + 'router.js');

// library.js reads the bare name `router` and relies on app.js setting
// window.router. Documented in verify-prac1.mjs, where it produced a
// false FAIL before it was understood. Set it before importing.
dom.window.router = router;
globalThis.router = router;

const LibraryMod = await import(BASE + 'views/library.js');
const SBMod      = await import(BASE + 'views/session-builder-ui.js');
// Compared against the live list rather than a hardcoded count, so
// adding a session type cannot silently leave one gated.
const { SESSION_TYPES } = await import(BASE + 'session-builder.js');

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

const el = document.getElementById('main-content');

let navigatedTo = null;
router.navigate = (r) => { navigatedTo = r; };

function setTier(tier) {
  localStorage.clear();
  store.init();
  store.set('tier', tier);
}

// ── TIER-H: the Library ──────────────────────────────────────────────
// P-46 S4b TIDY. Since P-46 S4 Free never reaches the Library (router.js
// FREE_MOVED sends Free to Part of the Plan), so Free's At home and At the
// gym lists, and their locks, were removed. What TIER-H and R4 guarded (a
// Free person shut out of a room, or charged for self-direction inside one)
// cannot happen in a room Free does not enter; verify-tier holds the free
// surfaces by route.
setTier('free');
const libSrc = fs.readFileSync(new URL('../js/views/library.js', import.meta.url), 'utf8');
const routerSrc = fs.readFileSync(new URL('../js/router.js', import.meta.url), 'utf8');
const moved = (routerSrc.match(/const FREE_MOVED = new Set\(\[([\s\S]*?)\]\)/) || [, ''])[1];
check('1  the Library is the Plan\'s: the router sends Free to Part of the Plan',
  /'library'/.test(moved));
check('2  and it holds no lock: nothing in it is half-open',
  !/lockedFeature|locked-feature-wrap|tier:\s*["']personal["']/.test(libSrc.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')));
el.innerHTML = LibraryMod.render(); LibraryMod.onMount();
check('3  its categories are real buttons (LOOK-4)',
  el.querySelectorAll('button[data-guided]').length > 0 && !el.querySelector('.locked-feature-wrap'));
check('7  "home-workout" is gone — it was never a route in router.js',
  !/target:\s*"home-workout"/.test(libSrc));

// ── TIER-G: the build-mode step ──────────────────────────────────────

// Drive session-builder-ui to its buildmode phase the way a person
// does: preselect Full Body from the Library, then walk the steps.
async function reachBuildMode(tier) {
  setTier(tier);
  store.set('sessionBuilderPreselect', { type: 'full' });
  navigatedTo = null;
  el.innerHTML = SBMod.render();
  SBMod.onMount();
  // preselect triggers a rerender into equipment (free) or location.
  for (let i = 0; i < 6; i++) {
    const buildBtn = document.getElementById('sb-build-btn');
    if (buildBtn) { buildBtn.click(); break; }
    const cont = document.getElementById('sb-location-continue-btn');
    if (cont) { cont.click(); continue; }
    const dur = el.querySelector('.sb-duration-btn');
    if (dur) { dur.click(); continue; }
    break;
  }
}

await reachBuildMode('free');
const freeModes  = [...el.querySelectorAll('.sb-buildmode-btn')];
const freeLocked = [...el.querySelectorAll('.locked-feature-wrap')];

// SWAP-1, 05 Sep 2026. This asserted THREE modes. There are now two:
// "Build my own" was deleted, and NOT for a tier reason — it opened the
// 188-item candidate list, which that build removed from the daily flow
// altogether.
//
// Rewritten to assert what R4 actually claims rather than a count that
// happened to be true when it was written. R4's claim is that no build
// route is withheld by tier. A hardcoded 3 made this gate go red on a
// change that had nothing to do with tiers, which is the definition of
// measuring the wrong thing.
check('9  R4: every build mode offered is pressable on free',
  freeModes.length > 0 && freeLocked.length === 0,
  `found ${freeModes.length}: ${freeModes.map(b => b.dataset.mode).join(', ')}, ` +
  `${freeLocked.length} locked`);
check('9b SWAP-1: "own" is absent on free — and absent for everyone',
  !freeModes.some(b => b.dataset.mode === 'own'),
  'the flat candidate list is back in the daily flow');
check('10 R4: and "coach builds it" is still one of them',
  freeModes.some(b => b.dataset.mode === 'coach'),
  'the coach-built route is the default and the product centre — it must ' +
  'survive self-direction becoming free');
check('11 R4 (inverse): NOTHING in the build-mode step is locked',
  freeLocked.length === 0,
  `${freeLocked.length} still locked: ` +
  freeLocked.map(n => n.getAttribute('aria-label') || '?').join(' | '));

// R4: the free path reached equipment directly, skipping location, so a
// free user was never asked whether they were at home or at the gym --
// the coach GUESSING instead of asking.
//
// SEED NOTE, R4. The first draft seeded a preselect and re-rendered, and
// went red against a correct app. session-builder-ui.js holds BOTH
// `phase` and `preselectChecked` at module level, and resetState() is
// not exported -- so the re-render landed on whatever screen the
// previous block left (buildmode), with the preselect branch already
// spent. Same class as the harness fault at check 7z.
//
// Walk back to the type picker the way a person does, by pressing Back,
// then take the journey forwards. Slower, and it tests the route a real
// free user actually travels rather than a state we injected.
setTier('free');
for (let i = 0; i < 8; i++) {
  if (el.querySelector('.sb-type-tile')) break;
  const back = document.getElementById('sb-back-btn');
  if (!back) break;
  back.click();
  el.innerHTML = SBMod.render();
  SBMod.onMount();
}
check('12a harness: reached the type picker before testing the journey',
  !!el.querySelector('.sb-type-tile'),
  'could not walk back — the assertion below would be testing nothing');

// Counted BEFORE clicking, while the picker is still on screen. Compared
// against the live SESSION_TYPES length rather than a hardcoded number,
// so adding a session type cannot silently leave one gated.
const typeTiles  = [...el.querySelectorAll('.sb-type-tile')];
const typeLocked = [...el.querySelectorAll('.locked-feature-wrap')];
check('12b R4: EVERY session type is pressable on free, not just Full Body',
  typeTiles.length === SESSION_TYPES.length && typeLocked.length === 0,
  `${typeTiles.length} pressable of ${SESSION_TYPES.length}, ` +
  `${typeLocked.length} locked: ${typeTiles.map(b => b.dataset.type).join(', ')}`);

// The journey itself: pick a NON-full type, the one a free user could
// not previously choose, and confirm it reaches the location step.
const lowerTile = typeTiles.find(b => b.dataset.type !== 'full') || typeTiles[0];
if (lowerTile) { lowerTile.click(); el.innerHTML = SBMod.render(); SBMod.onMount(); }
check('12 R4: a free user is ASKED where they are, not guessed at',
  !!document.getElementById('sb-location-continue-btn') ||
  !!el.querySelector('.sb-location-btn'),
  'the location step is still skipped on free — the coach assumed home');

await reachBuildMode('personal');
const paidModes = [...el.querySelectorAll('.sb-buildmode-btn')].map(b => b.dataset.mode);
// SWAP-1, 05 Sep 2026. Was "all three routes". PARITY is the property
// TIER-G and R4 were both really about, and parity is now asserted
// directly: free and Personal must see the SAME routes, whatever those
// routes are. That cannot go stale when a route is added or removed for
// a non-tier reason, and it fails the moment a tier hides one — which
// is the only thing this check was ever for.
check('13 TIER-G: Personal sees exactly the routes free sees',
  paidModes.length === freeModes.length &&
  freeModes.every(b => paidModes.includes(b.dataset.mode)),
  `free: ${freeModes.map(b => b.dataset.mode).join(', ')} | personal: ${paidModes.join(', ')}`);
check('13b and "coach builds it" is among them on both',
  paidModes.includes('coach') && freeModes.some(b => b.dataset.mode === 'coach'),
  paidModes.join(', '));

// R4: the SECOND route into the builder -- arriving from the Library
// with a preselected type. Reversal-testing found check 12 did not cover
// it: check 12 walks the type picker, and the preselect branch is a
// different code path that sets `phase` independently. Reverting only
// that branch left both gates green while a free user coming from the
// Library skipped the location step.
//
// Two paths set the same state; both must be asserted. This is the same
// shape as the render-and-handler disagreement library.js was carrying.
for (let i = 0; i < 8; i++) {
  if (el.querySelector('.sb-type-tile')) break;
  const back = document.getElementById('sb-back-btn');
  if (!back) break;
  back.click();
  el.innerHTML = SBMod.render();
  SBMod.onMount();
}
// Reaching the type picker and pressing Back once more runs resetState()
// -- which clears preselectChecked, so the branch below can fire.
document.getElementById('sb-back-btn')?.click();
store.set('sessionBuilderPreselect', { type: 'lower' });
navigatedTo = null;
el.innerHTML = SBMod.render();
SBMod.onMount();

check('12c R4: arriving from the Library with a preselect is NOT paywalled',
  navigatedTo !== 'upgrade',
  `routed to "${navigatedTo}" — a free user tapping "Lower body" in the ` +
  'Library now has every right to be there');
check('12d R4: and that route asks where they are too',
  !!document.getElementById('sb-location-continue-btn') ||
  !!el.querySelector('.sb-location-btn'),
  'the preselect path still skips the location step on free');

// ── R4 / decision 7.2: export is reachable on the free tier ──────────
//
// WHY THIS IS HERE AND NOT IN verify-tier.mjs. The source-text version
// asserts that renderExportLocked() has not come back. Reversal-testing
// found that insufficient: re-locking the export as
//   ${tier === 'personal' ? renderExportBlock() : ''}
// contains no locked renderer, so the text gate stayed GREEN while a
// free user lost the button. A named absence only catches the return of
// the thing by name.
//
// The only assertion that cannot be routed around is mounting the view
// on the free tier and looking for the buttons.
const { ProgressView } = await import(BASE + 'views/progress.js');
setTier('free');
const progressEl = document.createElement('div');
document.body.appendChild(progressEl);
ProgressView(router).mount(progressEl);
// D-11: a free user taps Share your progress, which opens the share screen.
navigatedTo = null;
progressEl.querySelector('[data-share-open]')?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const reachedShare = navigatedTo === 'progress-share';
const { ProgressShareView } = await import(BASE + 'views/progress-share.js');
const shareEl = document.createElement('div');
document.body.appendChild(shareEl);
ProgressShareView(router).mount(shareEl);
const exportBtns = [...shareEl.querySelectorAll('input[name="sh-format"]')];

check('15 R4: a FREE user can reach the export (Share your progress, every format)',
  reachedShare && exportBtns.length === 4,
  `reached: ${reachedShare}; formats ${exportBtns.length}: ${exportBtns.map(b => b.value).join(', ')} ` +
  '— UK GDPR gives a right of access regardless of payment; gating this ' +
  'never withheld the data, only the button');

const reportBtn = exportBtns.find(b => b.value === 'report');
reportBtn?.dispatchEvent(new window.Event('change', { bubbles: true }));
check('15b R4: including the report, for a physio or GP',
  !!reportBtn && !!shareEl.querySelector('.sh-report'),
  'the person least able to pay is the person most likely to need to ' +
  'show a clinician what they have been doing');

// ── The exception, asserted so it cannot be "tidied up" later ─────────

// P0 (29 Sep 2026): conditions-update.js is retired. The same principle
// now holds for My exercises (prescribed.js / prescribed-session.js).
const cuSrc = ['../js/views/prescribed.js', '../js/views/prescribed-session.js']
  .map(f => fs.readFileSync(new URL(f, import.meta.url), 'utf8')).join('\n');
check('14 My exercises is NOT tier-gated — somebody\'s own list is free',
  !/isPremium|lockedFeature/.test(cuSrc),
  'somebody\'s own exercises are permanently free on ethical grounds');

console.log(failures === 0
  ? `\nAll checks green.`
  : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
