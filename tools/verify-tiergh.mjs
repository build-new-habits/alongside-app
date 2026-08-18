/**
 * tools/verify-tiergh.mjs
 * 18 Aug 2026 v1
 *
 * TIER-G — the session builder's build-mode step had no tier check.
 * TIER-H — "At home" was locked whole while "At the gym" was open.
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
import fs from 'node:fs';
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';

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

check('4  TIER-H (inverse): exactly ONE free door inside "At home"',
  homeFree.length === 1,
  `found ${homeFree.length}: ${homeFree.map(b => b.getAttribute('aria-label') || '?').join(' | ')}`);
check('5  TIER-H: that door is the coach-built Full Body session',
  homeFree.length === 1 &&
  homeFree[0].dataset.target === 'session-builder' &&
  homeFree[0].dataset.preselectType === 'full');
check('6  TIER-H: the five self-directed cards are locked, not hidden',
  homeLocked.length === 5, `found ${homeLocked.length}`);

// The retired dead route must not come back anywhere in the app.
const libSrc = fs.readFileSync(new URL('../js/views/library.js', import.meta.url), 'utf8');
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

check('9  TIER-G (inverse): exactly ONE pressable build mode on free',
  freeModes.length === 1,
  `found ${freeModes.length}: ${freeModes.map(b => b.dataset.mode).join(', ')}`);
check('10 TIER-G: the free mode is "coach", not "recommend" or "own"',
  freeModes.length === 1 && freeModes[0].dataset.mode === 'coach');
check('11 TIER-G: the two composing routes are shown locked, not hidden',
  freeLocked.length === 2, `found ${freeLocked.length}`);
check('12 TIER-G: locked routes name what they are, for screen readers',
  freeLocked.every(n => /Personal plan feature/.test(n.getAttribute('aria-label') || '')));

await reachBuildMode('personal');
const paidModes = [...el.querySelectorAll('.sb-buildmode-btn')].map(b => b.dataset.mode);
check('13 TIER-G: all three routes remain pressable on Personal',
  paidModes.length === 3 &&
  ['coach', 'recommend', 'own'].every(m => paidModes.includes(m)),
  paidModes.join(', '));

// ── The exception, asserted so it cannot be "tidied up" later ─────────

const cuSrc = fs.readFileSync(new URL('../js/views/conditions-update.js', import.meta.url), 'utf8');
check('14 conditions-update.js is NOT tier-gated — prescribed work is free',
  !/isPremium|lockedFeature/.test(cuSrc),
  'condition programmes are permanently free on ethical grounds');

console.log(failures === 0
  ? `\nAll 14 checks green.`
  : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
