/**
 * tools/verify-tiergh.mjs
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

// ── TIER-H: the Library's "Start a session" screen ───────────────────

function mountGuidedLanding() {
  el.innerHTML = LibraryMod.render();
  LibraryMod.onMount();
  // Walk from the Library landing into "Start a session" by clicking,
  // never by reaching into module state.
  const start = document.getElementById('lib-start-session-btn');
  if (start) { start.click(); }
  return start;
}

setTier('free');
const startBtn = mountGuidedLanding();
check('1  Library landing offers "Start a session" as a real button',
  !!startBtn);

const homeCard = [...el.querySelectorAll('[data-guided], .locked-feature-wrap')]
  .find(n => /at home/i.test(n.textContent));
check('2  TIER-H: "At home" is present on the free tier',
  !!homeCard);
check('3  TIER-H: "At home" is NOT locked as a whole category',
  !!homeCard && !homeCard.classList.contains('locked-feature-wrap'),
  homeCard && homeCard.classList.contains('locked-feature-wrap')
    ? 'still wrapped in lockedFeature()' : '');

// R4: the five activity categories are self-direction and are now free.
// Asserted at the landing, where they live.
const activityLocked = [...el.querySelectorAll('.locked-feature-wrap')]
  .filter(n => /^(run|walk|swim|cycle|yoga)/i.test(n.textContent.trim()));
check('3b R4: Run, Walk, Swim, Cycle and Yoga are NOT locked',
  activityLocked.length === 0,
  `${activityLocked.length} still locked. Going for a run is not a plan`);

// Symmetry, asserted at the landing BEFORE walking into a sub-screen.
//
// SEED NOTE. The first run of this gate asserted this after clicking
// into "At home" and re-mounting, and it went red. The app was right and
// the seed was wrong: library.js holds `screen` at module level, so a
// re-mount without a navigate lands back on the sub-screen it was left
// on. In the app the router resets it; in a bare harness nothing does.
const gymCard = [...el.querySelectorAll('[data-guided]')]
  .find(n => /at the gym/i.test(n.textContent));
check('8  TIER-H: "At the gym" is open on free, same as "At home"',
  !!gymCard);

// Click into At home and count what a free user can actually press.
if (homeCard && homeCard.dataset.guided) homeCard.click();
const homeFree   = [...el.querySelectorAll('button[data-target]')];
const homeLocked = [...el.querySelectorAll('.locked-feature-wrap')];

check('4  R4: every door inside "At home" is free — all six',
  homeFree.length === 6,
  `found ${homeFree.length}: ${homeFree.map(b => b.getAttribute('aria-label') || '?').join(' | ')}`);
check('5  R4: the coach-built Full Body session is still among them',
  homeFree.some(b => b.dataset.target === 'session-builder' &&
                     b.dataset.preselectType === 'full'),
  'the free tier must still contain the session the COACH builds — ' +
  'self-direction being free does not mean self-direction is compulsory');
check('6  R4 (inverse): NOTHING inside "At home" is locked',
  homeLocked.length === 0,
  `${homeLocked.length} still locked: ` +
  homeLocked.map(n => n.getAttribute('aria-label') || '?').join(' | '));

// The retired dead route must not come back anywhere in the app.
const libSrc = fs.readFileSync(new URL('../js/views/library.js', import.meta.url), 'utf8');
check('7  "home-workout" is gone — it was never a route in router.js',
  !/target:\s*"home-workout"/.test(libSrc));

// ── R4: the gym category, where the ONE paid surface lives ───────────
//
// THE LOAD-BEARING INVERSE. v1's was "exactly one free door"; with the
// boundary moved, the check that carries the weight is the opposite --
// exactly one LOCKED door, and it must be My programme. Without this,
// removing the paywall entirely would pass every other assertion here.
// SEED NOTE, R4. The first draft of this block re-mounted the landing
// and clicked "At the gym" -- and every gym assertion reported the HOME
// cards instead. library.js holds `screen` at module level, so the
// re-mount landed back inside "At home" where the previous block left
// it, and "Start a session" was not on screen to be clicked. The app is
// right and the harness was wrong: in the app the router resets it.
//
// Walk back the way a person does, via the Back control, rather than
// reaching into module state -- then verify we actually arrived before
// asserting anything about what is locked. A gate that asserts against
// the wrong screen is worse than no gate: it was green on the count and
// wrong about the subject.
document.getElementById('lib-back-btn')?.click();
const gymCard2 = [...el.querySelectorAll('[data-guided]')]
  .find(n => /at the gym/i.test(n.textContent));
check('7z  harness: reached the gym category, not still inside "At home"',
  !!gymCard2, 'back-navigation failed — the assertions below would be ' +
  'reporting the wrong screen');
if (gymCard2 && gymCard2.dataset.guided) gymCard2.click();
const gymFree   = [...el.querySelectorAll('button[data-target]')];
const gymLocked = [...el.querySelectorAll('.locked-feature-wrap')];

check('7a R4 (inverse): exactly ONE locked door in "At the gym"',
  gymLocked.length === 1,
  `found ${gymLocked.length}: ` +
  gymLocked.map(n => n.getAttribute('aria-label') || '?').join(' | '));
check('7b R4: and it is My programme — the arc, not a session',
  gymLocked.length === 1 &&
  /my programme/i.test(gymLocked[0].getAttribute('aria-label') || ''),
  gymLocked.map(n => n.getAttribute('aria-label')).join(' | '));
check('7c R4: the five self-directed gym cards are pressable on free',
  gymFree.length === 6,
  `found ${gymFree.length}: ${gymFree.map(b => b.dataset.preselectType || b.dataset.target).join(', ')}`);

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
const exportBtns = [...progressEl.querySelectorAll('[data-export]')];

check('15 R4: a FREE user can reach the export buttons',
  exportBtns.length === 3,
  `found ${exportBtns.length}: ${exportBtns.map(b => b.dataset.export).join(', ')} ` +
  '— UK GDPR gives a right of access regardless of payment; gating this ' +
  'never withheld the data, only the button');

check('15b R4: including the professional export, for a physio or GP',
  exportBtns.some(b => b.dataset.export === 'professional'),
  'the person least able to pay is the person most likely to need to ' +
  'show a clinician what they have been doing');

// ── The exception, asserted so it cannot be "tidied up" later ─────────

const cuSrc = fs.readFileSync(new URL('../js/views/conditions-update.js', import.meta.url), 'utf8');
check('14 conditions-update.js is NOT tier-gated — prescribed work is free',
  !/isPremium|lockedFeature/.test(cuSrc),
  'condition programmes are permanently free on ethical grounds');

console.log(failures === 0
  ? `\nAll checks green.`
  : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
