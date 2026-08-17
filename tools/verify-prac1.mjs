/**
 * tools/verify-prac1.mjs
 * 18 Aug 2026 v1
 *
 * PRAC-1. The guided practice library.
 *
 * THIS GATE EXECUTES THE VIEWS. The whole reason this feature was
 * needed is that a COMMENT claimed the 28 standalone items were
 * "reached through the Library", and no gate could tell the difference
 * between a claim and a route. Source-text assertions cannot see
 * reachability — four of them read a deleted file and stayed green for
 * twelve days.
 *
 * So this mounts the Library in jsdom, CLICKS the new card, asserts
 * where the click lands, mounts the destination, clicks through to a
 * practice, and reads the text a person would actually see.
 *
 * The load-bearing assertion is #5: every standalone item the database
 * holds is reachable by clicking. Not "the file mentions them" — an
 * actual walk of the actual buttons. If somebody adds a practice with
 * no category home next month, this goes red on the day they add it
 * unless it also appears here.
 *
 * Every assertion below was reversal-tested — broken on purpose on a
 * copy first, and confirmed to go red. A gate that has never been made
 * to fail proves nothing.
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
const { store }          = await import(BASE + 'store.js');
const { router }         = await import(BASE + 'router.js');
const LibraryMod         = await import(BASE + 'views/library.js');
const { PracticesView }  = await import(BASE + 'views/practices.js');
const { getStandalonePractices } = await import(BASE + 'data/practice-library.js');

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

const el   = document.getElementById('main-content');
const flat = () => el.textContent.replace(/\s+/g, ' ').trim();

// Capture navigation instead of performing it. library.js holds a
// reference to this same singleton, so patching the method is enough.
//
// SEED NOTE, and it cost a false FAIL before it was understood.
// library.js does NOT import router. It reads the bare name and relies
// on `window.router = router`, which app.js sets at module level — so
// it works in a browser and throws ReferenceError in a bare harness.
// The first run of this gate reported the Library's navigation broken.
// It is not; the seed was missing the global the app provides.
//
// Worth naming rather than silently patching: nine other views import
// router explicitly and this one does not, so a future harness will hit
// the same wall. LOGGED for a later pass — the mechanism works and
// changing it is outside this session's scope.
// In a browser globalThis IS window, so app.js's `window.router = router`
// makes the bare name resolve. Under Node it does not, so both.
dom.window.router = router;
globalThis.router = router;
let navs = [];
const realNavigate = router.navigate.bind(router);
router.navigate = (v) => { navs.push(v); };

function seedFree() {
  localStorage.clear();
  store.init();
}

// ─────────────────────────────────────────────────────────────────────
// 1. The route exists and points at something real
// ─────────────────────────────────────────────────────────────────────

const routerSrc = fs.readFileSync('js/router.js', 'utf8');
const entry = routerSrc.match(/'practices':\s*\{\s*path:\s*'([^']+)',\s*fn:\s*'([^']+)'/);
check('the router declares a practices route', !!entry);
if (entry) {
  const filePath = 'js/' + entry[1].replace(/^\.\//, '');
  check('and its path points at a file that exists', fs.existsSync(filePath), filePath);
  check('and the file exports the factory the router names',
    fs.existsSync(filePath) && new RegExp(`export function ${entry[2]}\\b`).test(fs.readFileSync(filePath, 'utf8')),
    entry[2]);
}
check('the nav tab agrees with the door it is reached through',
  /'practices':\s*'today'/.test(routerSrc),
  'NAV-8: a tab that disagrees with the route is worse than absent');

// ─────────────────────────────────────────────────────────────────────
// 2. The Library offers it, to a FREE user, unlocked
// ─────────────────────────────────────────────────────────────────────

seedFree();
navs = [];
el.innerHTML = LibraryMod.render();
LibraryMod.onMount();
check('the Library mounts', flat().length > 0);

// Landing -> "Start a session"
el.querySelector('#lib-start-session-btn')?.click();
const card = el.querySelector('[data-guided="practices"]');
check('a free user is offered a Practices card', !!card);
check('it is a real button with an accessible name',
  !!card && card.tagName === 'BUTTON' && (card.getAttribute('aria-label') || '').length > 0);
check('it is NOT tier-locked',
  !!card && card.getAttribute('role') !== 'button' && !/locked/i.test(card.className),
  'safety and wellbeing practices are never paywalled');

// The claim that matters: tapping it goes somewhere.
if (card) {
  card.click();
  check('tapping it navigates to the practices route',
    navs.includes('practices'), navs.join(',') || 'went nowhere');
}

// ─────────────────────────────────────────────────────────────────────
// 3. The destination mounts and shows groups
// ─────────────────────────────────────────────────────────────────────

seedFree();
navs = [];
let threw = null;
try { PracticesView({ navigate: v => navs.push(v) }).mount(el); }
catch (e) { threw = e; }
check('practices mounts without throwing', !threw, threw ? String(threw) : '');

const groupBtns = [...el.querySelectorAll('[data-group]')];
check('it renders more than one group to choose from', groupBtns.length > 1,
  `${groupBtns.length} groups`);
check('every group button has an accessible name',
  groupBtns.length > 0 && groupBtns.every(b => (b.getAttribute('aria-label') || '').length > 0));
check('there is exactly one h1', el.querySelectorAll('h1').length === 1);

// ─────────────────────────────────────────────────────────────────────
// 4. Clicking through reaches a readable practice
// ─────────────────────────────────────────────────────────────────────

seedFree();
PracticesView({ navigate: () => {} }).mount(el);
el.querySelector('[data-group]')?.click();
const itemBtns = [...el.querySelectorAll('[data-practice]')];
check('choosing a group lists practices', itemBtns.length > 0, `${itemBtns.length} items`);

itemBtns[0]?.click();
const practiceText = flat();
check('opening one shows its steps', !!el.querySelector('.practices-steps li'));
check('and says why it helps', /Why this helps/.test(practiceText));
check('and shows a duration as a guide, not a countdown',
  /About \d+ minute/.test(practiceText));

// Back must work, both hops.
el.querySelector('#practices-back-btn')?.click();
check('back returns to the list of practices',
  el.querySelectorAll('[data-practice]').length > 0);
el.querySelector('#practices-back-btn')?.click();
check('back again returns to the groups',
  el.querySelectorAll('[data-group]').length > 1);

// ─────────────────────────────────────────────────────────────────────
// 5. EVERY standalone practice is reachable by clicking
//
// The load-bearing one. Walks the buttons rather than reading the file.
// ─────────────────────────────────────────────────────────────────────

seedFree();
PracticesView({ navigate: () => {} }).mount(el);
const reached = new Set();
const groupIds = [...el.querySelectorAll('[data-group]')].map(b => b.dataset.group);
for (const gid of groupIds) {
  seedFree();
  PracticesView({ navigate: () => {} }).mount(el);
  el.querySelector(`[data-group="${gid}"]`)?.click();
  el.querySelectorAll('[data-practice]').forEach(b => reached.add(b.dataset.practice));
}

const expected = getStandalonePractices().map(e => e.id);
const missed   = expected.filter(id => !reached.has(id));
check('every standalone practice in the database is reachable by clicking',
  expected.length > 0 && missed.length === 0,
  missed.length ? `unreachable: ${missed.slice(0, 6).join(', ')}` : `${reached.size} of ${expected.length}`);

// ─────────────────────────────────────────────────────────────────────
// 6. Condition safety is applied — not paywalled, not skipped
// ─────────────────────────────────────────────────────────────────────

localStorage.clear();
store.init();
store.set('conditions', ['lower-back']);
store.set('conditionPainScores', { 'lower-back': 9 });
PracticesView({ navigate: () => {} }).mount(el);
const unsafeReached = new Set();
for (const gid of [...el.querySelectorAll('[data-group]')].map(b => b.dataset.group)) {
  el.querySelector(`[data-group="${gid}"]`)?.click();
  el.querySelectorAll('[data-practice]').forEach(b => unsafeReached.add(b.dataset.practice));
  el.querySelector('#practices-back-btn')?.click();
}
check('a contraindicated circuit is withheld during an acute flare',
  !unsafeReached.has('circuit-emom-strength'),
  'getExerciseSafetyTier must run here too');
check('and the grounding practices are still offered',
  unsafeReached.has('five-four-three-two-one-grounding'),
  'withholding everything would be the wrong safe direction');

// ─────────────────────────────────────────────────────────────────────
// 7. No streaks, no counts, no evaluation
// ─────────────────────────────────────────────────────────────────────

seedFree();
PracticesView({ navigate: () => {} }).mount(el);
el.querySelector('[data-group]')?.click();
el.querySelector('[data-practice]')?.click();
// BOTH states. The first pass of this gate checked only the unlogged
// screen, so a reversal test that put "your 4th time this week" into
// the acknowledgement was NOT CAUGHT — the assertion was real, the seed
// never reached the text it was guarding. Counting language would live
// in the acknowledgement, which is precisely the screen it missed.
const COUNTS   = /\b(streak|in a row|\d+(st|nd|rd|th) time|times this week)\b/i;
const JUDGES   = /\b(well done|great job|you should|you failed|keep it up)\b/i;

const beforeAck = flat();
el.querySelector('#practices-did-btn')?.click();
const afterAck = flat();

check('nothing counts how many times you have done this',
  !COUNTS.test(beforeAck) && !COUNTS.test(afterAck),
  COUNTS.test(afterAck) ? 'in the acknowledgement' : '');
check('nothing evaluates the person',
  !JUDGES.test(beforeAck) && !JUDGES.test(afterAck));
check('there is no progress bar on a practice',
  !el.querySelector('[role="progressbar"]'),
  'a practice is not a countdown');
check('and the acknowledgement is actually the screen that was read',
  !!el.querySelector('.practices-ack'),
  'guards the seed above from silently missing the text');

// The copy-pasted breathing watchOut must not surface on a wellbeing
// practice. 44 database entries share it; on a cold shower protocol it
// is plainly wrong, and this screen is where a person would read it.
seedFree();
PracticesView({ navigate: () => {} }).mount(el);
el.querySelector('[data-group="recovery"]')?.click();
el.querySelector('[data-practice="cold-shower-protocol"]')?.click();
check('a recovery practice does not show the copy-pasted breathing watchOut',
  !/expanding the ribs/i.test(flat()));

// ...and it IS shown where it is genuine.
seedFree();
PracticesView({ navigate: () => {} }).mount(el);
el.querySelector('[data-group="strength"]')?.click();
el.querySelector('[data-practice="plyometric-med-ball-circuit"]')?.click();
check('a circuit does show its own specific watchOut',
  /locked joints/i.test(flat()));

// ─────────────────────────────────────────────────────────────────────
// 8. "I did this" records it, once, through the shared write path
// ─────────────────────────────────────────────────────────────────────

seedFree();
PracticesView({ navigate: () => {} }).mount(el);
el.querySelector('[data-group="mindfulness"]')?.click();
el.querySelector('[data-practice="five-four-three-two-one-grounding"]')?.click();
const before = (store.get('activityLog') || []).length;
el.querySelector('#practices-did-btn')?.click();
const log = store.get('activityLog') || [];
check('it writes exactly one activity entry', log.length === before + 1,
  `${before} -> ${log.length}`);
const last = log[log.length - 1] || {};
check('with the database id, so continuity can see it',
  Array.isArray(last.exerciseIds) && last.exerciseIds.includes('five-four-three-two-one-grounding'));
check('and with completedAt / durationMins, the names every other view writes',
  !!last.completedAt && typeof last.durationMins === 'number',
  'PT-3: duration/loggedAt made mindful sessions count as zero minutes');
check('the button is replaced by an acknowledgement, not a score',
  !!el.querySelector('.practices-ack') && !el.querySelector('#practices-did-btn'));

// ─────────────────────────────────────────────────────────────────────
// 9. No second source of practice content
// ─────────────────────────────────────────────────────────────────────

const viewSrc = fs.readFileSync('js/views/practices.js', 'utf8');
const anyId = getStandalonePractices().some(e => viewSrc.includes(`"${e.id}"`) || viewSrc.includes(`'${e.id}'`));
check('the view hardcodes no practice ids',
  !anyId,
  'a list here is the targetDate fault in a new costume');

router.navigate = realNavigate;
console.log(failures ? `\n${failures} FAILED` : '\nALL PASS');
process.exit(failures ? 1 : 0);
