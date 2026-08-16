/**
 * tools/verify-assess3.mjs
 * 16 Aug 2026 v1
 *
 * ASSESS-1 step 3. The read stops being a one-off.
 *
 * The claim under test is NOT "shouldOfferReassessment() returns true at
 * twelve weeks". That is a function returning a boolean. The claim is
 * that a person who has been training for three months is actually
 * ASKED -- so this drives renderSessionMoments(), the same function
 * every session view calls, and reads the HTML a person would see.
 *
 * That distinction is the whole lesson of 15 Aug, and it caught a real
 * bug again the same week: HYPER-1's rule was correct and lived in a
 * function with no callers.
 *
 * The negative assertions carry as much weight as the positive ones.
 * The failure mode here is not "it never asks" -- it is "it asks too
 * often", which turns a calibration into nagging, and for personas 2.5
 * and 2.13 that closes the app for good.
 */
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: 'https://x/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const SM = await import(BASE + 'data/session-moments.js');
const A  = await import(BASE + 'data/assessment.js');
const { EXERCISES } = await import(BASE + 'data/exercises/index.js');

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

const WEEK = 7 * 24 * 60 * 60 * 1000;
const ago = w => new Date(Date.now() - w * WEEK).toISOString();

// Real exercises with real movement patterns, so questionsForSession()
// has something to derive from. Picked by executing the library rather
// than by naming ids from memory.
const idsFor = pats => EXERCISES.filter(e => pats.includes(e.movementPattern)).slice(0, 6).map(e => e.id);
const SESSION_IDS = idsFor(['squat', 'push', 'hinge']);
check('the fixture uses real exercises with usable patterns', SESSION_IDS.length >= 3,
  `${SESSION_IDS.length} found`);

/** Seed a store, then render the moments a person would actually see. */
function renderFor(seed, ids = SESSION_IDS) {
  localStorage.clear();
  store.init();
  SM.resetSessionMoments();
  seed();
  return SM.renderSessionMoments({ exerciseIds: ids });
}

/** Log entries that store.completedSessions() will actually count. */
function log(n) {
  const entries = [];
  for (let i = 0; i < n; i++) {
    entries.push({ type: 'workout', completed: true, date: new Date(Date.now() - i * 86400000).toISOString() });
  }
  store.set('activityLog', entries);
}

const baselineAt = (weeksAgo, level = 'moderate') => {
  store.set('assessment', {
    baseline: { at: ago(weeksAgo), measuredLevel: level, results: {} },
    history: [], lastOfferedAt: ago(weeksAgo), declined: false
  });
  store.set('fitnessLevel', level);
};

// ── 1. The baseline path still works, and only fires once ────────────

const first = renderFor(() => log(1));
check('a first session still offers the baseline', /sm-baseline/.test(first) && /Can I ask about that one\?/.test(first));

const second = renderFor(() => { log(2); baselineAt(0); });
check('and it is not offered again the next session', !/sm-baseline/.test(second));

// ── 2. The reassessment is REACHED, through the real render ──────────

const stale = renderFor(() => { log(40); baselineAt(13); });
check('somebody thirteen weeks past their last read is asked again',
  /sm-baseline/.test(stale) && /Can I ask about those again\?/.test(stale),
  'rendered through renderSessionMoments(), not by calling the gate function');

check('and it is asked in the reassessment voice, not the baseline one',
  /instead of where you are/.test(stale) && !/where to start you/.test(stale),
  '"about where I would have started you" is meaningless three months in');

check('the questions themselves are unchanged', /data-sm-q=/.test(stale) && /Skip this/.test(stale),
  'same three questions, same chips, same skip');

// ── 3. It does NOT nag. The failure mode that matters. ───────────────

const fresh = renderFor(() => { log(40); baselineAt(4); });
check('somebody four weeks past their last read is NOT asked', !/sm-baseline/.test(fresh));

const justUnder = renderFor(() => { log(40); baselineAt(11.5); });
check('and nor is somebody just under the twelve-week mark', !/sm-baseline/.test(justUnder));

const declinedRecently = renderFor(() => {
  log(40);
  baselineAt(20);
  store.set('assessment.declined', true);
  store.set('assessment.lastOfferedAt', ago(1));
});
check('a decline last week is respected even though a read is overdue',
  !/sm-baseline/.test(declinedRecently),
  'checked before the due test, so nothing can override a recent no');

const declinedLongAgo = renderFor(() => {
  log(40);
  baselineAt(20);
  store.set('assessment.declined', true);
  store.set('assessment.lastOfferedAt', ago(6));
});
check('but a decline six weeks ago has lapsed',
  /sm-baseline/.test(declinedLongAgo),
  'a skip mid-session is not opting out forever');

// ── 4. Never both, and never before there is a baseline ──────────────

const noBaselineYet = renderFor(() => { log(40); });
check('somebody with no baseline is never offered a REassessment',
  !/Can I ask about those again\?/.test(noBaselineYet));
check('the two offers can never appear together',
  !(/Can I ask about that one\?/.test(stale) && /Can I ask about those again\?/.test(stale)));

// ── 5. A non-exercise session asks nothing ───────────────────────────

const breathing = renderFor(() => { log(40); baselineAt(20); }, []);
check('a breathing or journalling session is never asked about lifting',
  !/sm-baseline/.test(breathing),
  'no movement patterns, nothing to calibrate against');

// ── 6. The hinge integration point exists and is inert for now ───────

// A proper pair, not an `||` that passes on either arm. Same store, same
// questions, ONE variable: a read taken two weeks ago is nowhere near
// due, so chapterEnded is the only thing that can change the answer.
localStorage.clear(); store.init(); baselineAt(2);
const Q = [{ key: 'squat' }];
check('a recent read is not due on time alone',
  A.shouldOfferReassessment(Q, { chapterEnded: false }) === false);
check('but the hinge can force it early when CHAP-1 step 3 passes it',
  A.shouldOfferReassessment(Q, { chapterEnded: true }) === true,
  'the integration point is real and defaults to off');

// ── 6b. Drive the actual DOM. Render, tap, save, read the answer. ────
//
// Added after reversal testing found TWO holes here that everything
// above missed: swapping the reassessment acknowledgement for the
// baseline one, and dropping offerKind from resetSessionMoments(), both
// left all twenty-two assertions green. Nothing was exercising the save
// handler, so the whole reason offerKind exists was untested.
//
// The lesson repeats: rendering is half the path. The other half is
// what happens when somebody presses the button.

function driveSave(seed, ids = SESSION_IDS) {
  localStorage.clear();
  store.init();
  SM.resetSessionMoments();
  seed();
  const el = document.getElementById('c');
  const paint = () => {
    el.innerHTML = SM.renderSessionMoments({ exerciseIds: ids });
    SM.attachSessionMoments(el, paint);
  };
  paint();
  // Answer every question the session actually produced.
  const keys = [...new Set([...el.querySelectorAll('[data-sm-q]')].map(b => b.dataset.smQ))];
  for (const k of keys) {
    el.querySelector(`[data-sm-q="${k}"][data-sm-a="comfortable"]`)?.click();
  }
  el.querySelector('[data-sm-save]')?.click();
  return { html: el.innerHTML, answered: keys.length };
}

const savedRe = driveSave(() => { log(40); baselineAt(13, 'light'); });
check('answering a reassessment and pressing Done is acknowledged',
  savedRe.answered > 0 && /coach-message-text/.test(savedRe.html),
  `${savedRe.answered} question(s) answered`);
check('and acknowledged in the REASSESSMENT voice',
  /moved on from last time/.test(savedRe.html),
  'the baseline voice says "more than I would have given you" — wrong three months in');
check('and never in the baseline voice',
  !/I'd have started you|I&#39;d have started you|would have given you/.test(savedRe.html));

// A first baseline has nothing to compare against, so assessmentChange()
// returns null and baselineAck() takes its 'same' branch. I asserted the
// 'up' wording here and the gate caught me -- worth leaving on record,
// because it is the second time today an assertion was written against
// the state I imagined rather than the one the code produces.
const savedBase = driveSave(() => { log(1); });
check('a first-session save is still acknowledged in the BASELINE voice',
  /about where/.test(savedBase.html) && /started you/.test(savedBase.html),
  'the two voices must not have collapsed into one');

// And the state must not survive into the next mount. Reassessment
// first, then a baseline user: a leaked offerKind would acknowledge the
// baseline as a reassessment, silently.
driveSave(() => { log(40); baselineAt(13, 'light'); });
const afterLeak = driveSave(() => { log(1); });
check('offerKind does not leak across mounts',
  !/moved on from last time/.test(afterLeak.html),
  'resetSessionMoments() must clear it with the rest');

// ── 7. It records a read, and it moves the ceiling ───────────────────

localStorage.clear(); store.init();
baselineAt(20, 'light');
const before = store.get('fitnessLevel');
const entry = A.recordAssessmentAnswers({ squat: 'comfortable', push: 'comfortable', hinge: 'comfortable' });
check('a reassessment records an entry', !!entry);
check('and moves the difficulty ceiling', store.get('fitnessLevel') !== before,
  `${before} -> ${store.get('fitnessLevel')}`);
check('and it moves at most one step', store.get('fitnessLevel') === 'moderate',
  'three taps can correct a read, not replace one');
check('it lands in history, not as a second baseline',
  (store.get('assessment').history || []).length === 1 &&
  store.get('assessment').baseline.measuredLevel === 'light');

const down = A.recordAssessmentAnswers({ squat: 'too-much', push: 'too-much', hinge: 'too-much' });
check('an honest read down is recorded and lowers the ceiling',
  !!down && store.get('fitnessLevel') === 'light',
  'a measure that only ratchets up becomes one more thing to fall behind');
check("and 'down' is reported as a direction, never a failure",
  store.assessmentChange().direction === 'down' &&
  !/back|worse|declin|drop/i.test(A.reassessmentAck(store.assessmentChange())));

// ── 8. No score, anywhere ────────────────────────────────────────────
const allAcks = ['same', 'up', 'down'].map(d => A.reassessmentAck({ direction: d })).join(' ');
check('the coach never reports a score, level or percentage',
  !/%|\bscore\b|\blevel\b|sedentary|moderate|very.active/i.test(allAcks),
  'P4 — it reports what it will do, not what somebody is');

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
