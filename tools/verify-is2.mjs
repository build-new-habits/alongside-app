/**
 * tools/verify-is2.mjs
 * 18 Aug 2026 v1
 *
 * IS-2. In Step opens one movement at a time.
 *
 * THIS GATE EXECUTES THE VIEW. The v1 behaviour — all four open from
 * the start — was correct against its own header comment, which is
 * exactly why nothing caught that it was wrong on device. A source
 * assertion here would only prove the file mentions staging.
 *
 * The load-bearing assertion is #2: on a fresh state exactly ONE
 * movement is pressable. "Solo is available" would stay green if all
 * four were.
 *
 * #7 is the one that protects a person rather than the design: a
 * movement somebody already reached under v1 must not be taken away by
 * this change. Shipping a stage gate that closes a door somebody has
 * already walked through would be the product punishing them for our
 * sequencing.
 *
 * #9 and #10 guard the two rules the landing must keep no matter what
 * else changes: no score, and no state carried by dimmed text.
 *
 * Every assertion was reversal-tested.
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
const { store }     = await import(BASE + 'store.js');
const { router }    = await import(BASE + 'router.js');
dom.window.router = router;
globalThis.router = router;
const InStepMod     = await import(BASE + 'views/in-step.js');
const { MOVEMENTS } = await import(BASE + 'data/in-step-scenarios.js');

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

const el = document.getElementById('main-content');
const flat = () => el.textContent.replace(/\s+/g, ' ').trim();

function seed(progress) {
  localStorage.clear();
  store.init();
  if (progress) store.set('inStepProgress', progress);
}
function mount() {
  el.innerHTML = InStepMod.render();
  InStepMod.onMount();
}
const cards    = () => [...el.querySelectorAll('.is-movement-card')];
const openOnes = () => cards().filter(c => !c.disabled).map(c => c.dataset.movement);

// ── Fresh state ──────────────────────────────────────────────────────

seed(null);
mount();
check('1  the landing mounts and renders every movement as a card',
  cards().length === MOVEMENTS.length, `${cards().length} of ${MOVEMENTS.length}`);
check('2  IS-2 (inverse): exactly ONE movement is open on a fresh state',
  openOnes().length === 1, `open: ${openOnes().join(', ') || 'none'}`);
check('3  and it is the first in MOVEMENTS order, not an arbitrary one',
  openOnes()[0] === MOVEMENTS[0].id, openOnes()[0]);
check('4  a locked movement says what opens it, not just that it is shut',
  new RegExp(`Opens after ${MOVEMENTS[0].name}`).test(flat()),
  'the second card must name the first');

// ── Answering the first opens the second, and only the second ────────

const now = new Date().toISOString();
seed({ unlockedAt: { solo: now }, scenarioIndex: {}, completedCount: { solo: 1 }, choiceLog: [] });
mount();
check('5  answering Solo opens Partner',
  openOnes().includes(MOVEMENTS[1].id), `open: ${openOnes().join(', ')}`);
check('6  IS-2 (inverse): it does NOT open the two after it as well',
  !openOnes().includes(MOVEMENTS[2].id) && !openOnes().includes(MOVEMENTS[3].id),
  `open: ${openOnes().join(', ')}`);

// Solo itself is now in cooldown, which is the OTHER gate, still working.
check('7  Solo is now cooling down, so the two gates both apply',
  !openOnes().includes('solo') && /Ready again in \d+ day/.test(flat()));

// ── A v1 user keeps what they already reached ────────────────────────

seed({ unlockedAt: {}, scenarioIndex: {}, completedCount: { environment: 2 }, choiceLog: [] });
mount();
check('8  a movement already answered under v1 is NOT taken away',
  openOnes().includes('environment'), `open: ${openOnes().join(', ')}`);

// ── The two standing rules of this screen ────────────────────────────

seed({ unlockedAt: {}, scenarioIndex: {}, completedCount: { solo: 3 }, choiceLog: [] });
mount();
const soloCard = cards().find(c => c.dataset.movement === 'solo');
check('9  no bare count is rendered on a card — this product does not score',
  !!soloCard && !/\b3\b/.test(soloCard.textContent),
  soloCard ? soloCard.textContent.replace(/\s+/g, ' ').trim() : '');

const inStepSrc = fs.readFileSync(new URL('../js/views/in-step.js', import.meta.url), 'utf8');

// Asserted against the RENDERED DOM, not the source. The first version
// of this check read the file and went red on the word "opacity" inside
// the comment explaining why the opacity was removed — the assertion
// was matching my own prose about the fix. Reading what a browser would
// actually be handed is the only version of this that means anything.
seed({ unlockedAt: {}, scenarioIndex: {}, completedCount: {}, choiceLog: [] });
mount();
const dimmed = cards().filter(c => /opacity/i.test(c.getAttribute('style') || ''));
check('10 locked state is not carried by dimmed text (A11Y-LOCK)',
  dimmed.length === 0,
  'opacity on text drops --color-text-secondary from 5.97:1 to 2.95:1');

// ── The intro ────────────────────────────────────────────────────────

seed(null);
mount();
check('11 the landing explains what In Step is for, not just its format',
  /What this is/.test(flat()) && /nothing is fed back to you/i.test(flat()));
check('12 and it tells the person the movements open one at a time',
  /one at a time/i.test(flat()));
check('13 the intro is a labelled landmark, not an unattached paragraph',
  !!el.querySelector('section[aria-labelledby]'));

// ── The header must not still describe v1 ────────────────────────────

check('14 the file header no longer claims all four open from the start',
  !/there is no movement-to-movement gate/.test(
    inStepSrc.split('*/')[0] || ''),
  'a stale comment describing a mechanism that is not there is the onUnmount fault class');

console.log(failures === 0
  ? `\nAll 14 checks green.`
  : `\n${failures} FAILED.`);
process.exit(failures === 0 ? 0 : 1);
