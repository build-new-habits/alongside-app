/**
 * tools/verify-chap3.mjs
 * 16 Aug 2026 v1
 *
 * CHAP-1 step 3, part one: the chapter can END.
 *
 * Before this it could not. currentWeek was capped at twelve and nothing
 * ever set `completed`, so somebody seventeen weeks into a twelve-week
 * chapter sat at "11 weeks in" for ever, with chaptersDone empty and
 * currentChapterId null. Found by executing advanceWeekIfNeeded() at 120
 * days elapsed and reading every completion field, rather than by
 * reading the function and believing it.
 *
 * The next-chapter OFFER is not built. This gate covers the state and
 * the reassessment trigger only, and says so, so nobody reads a green
 * suite as "the hinge is done".
 */
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: 'https://x/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true,writable:true});
Object.defineProperty(globalThis,'localStorage',{value:dom.window.localStorage,configurable:true,writable:true});

const B = new URL('../js/', import.meta.url).href;
const { store } = await import(B + 'store.js');
const PE = await import(B + 'data/programmeEngine.js');
const SM = await import(B + 'data/session-moments.js');
const { EXERCISES } = await import(B + 'data/exercises/index.js');
const { MyProgrammeView } = await import(B + 'views/my-programme.js');

let failures = 0;
const check = (n, ok, d = '') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if (!ok) failures++; };
const ago = d => new Date(Date.now() - d * 864e5).toISOString();

function seed(daysElapsed, week = 12) {
  localStorage.clear(); store.init();
  store.set('tier', 'personal');
  store.set('activeProgramme.programmeId', 'beginner-fitness');
  store.set('activeProgramme.programmeName', 'Build Your Base');
  store.set('activeProgramme.startDate', ago(daysElapsed));
  store.set('activeProgramme.currentWeek', week);
  store.set('activeProgramme.totalSessions', 30);
  store.set('fitnessLevel', 'moderate');
}

// ── 1. It ends ───────────────────────────────────────────────────────
seed(120);
const r = PE.advanceWeekIfNeeded();
check('past twelve weeks, the chapter completes', r.chapterComplete === true);
check('and the completion is recorded', store.get('activeProgramme.completed') === true
  && !!store.get('activeProgramme.completedAt'));

const done = store.get('programme.chaptersDone');
check('it lands in the arc', Array.isArray(done) && done.length === 1, JSON.stringify(done));
check('with the chapter name, not the programme id',
  done[0]?.name === 'Build Your Base');
check('and where they were when it ended',
  done[0]?.measuredLevelAtEnd === 'moderate',
  'what the next chapter offer will reason from');
check('currentChapterId is set', store.get('programme.currentChapterId') === 'beginner-fitness');

// ── 2. The week number does NOT run past the data ────────────────────
check('currentWeek stays capped at twelve', store.get('activeProgramme.currentWeek') === 12,
  'it feeds getPhaseForWeek(), which only defines twelve weeks');
check('and weeksIn never becomes a countdown', PE.getProgressStats().weeksIn === 11);

// ── 3. Once, not every launch ────────────────────────────────────────
const again = PE.advanceWeekIfNeeded();
check('completing is idempotent', again.chapterComplete === false
  && (store.get('programme.chaptersDone') || []).length === 1,
  'opening the app twice must not record two finished chapters');

// ── 4. It does NOT fire early ────────────────────────────────────────
seed(70, 11);
const early = PE.advanceWeekIfNeeded();
check('ten weeks in, nothing has ended', early.chapterComplete === false
  && store.get('activeProgramme.completed') === false);
check('and the arc stays empty', (store.get('programme.chaptersDone') || []).length === 0);

seed(83, 12);
const boundary = PE.advanceWeekIfNeeded();
check('at exactly twelve weeks it has not ended yet', boundary.chapterComplete === false,
  'the twelfth week is a week to train in, not a deadline that has passed');

// ── 5. Somebody with no programme is untouched ───────────────────────
localStorage.clear(); store.init();
const none = PE.advanceWeekIfNeeded();
check('no programme, no hinge', none.chapterComplete !== true
  && PE.isHingePending() === false);

// ── 6. The hinge brings the reassessment FORWARD ─────────────────────
//
// ASSESS-1 step 3 shipped with a chapterEnded argument hardcoded false
// at every call site — an integration point nothing integrated with.
// This is the assertion that it now carries something.
const ids = EXERCISES.filter(e => ['squat','push','hinge'].includes(e.movementPattern)).slice(0,6).map(e => e.id);

function momentsAfter(daysElapsed, weeksSinceRead) {
  seed(daysElapsed);
  store.set('assessment', {
    baseline: { at: ago(weeksSinceRead * 7), measuredLevel: 'moderate', results: {} },
    history: [], lastOfferedAt: ago(weeksSinceRead * 7), declined: false
  });
  store.set('activityLog', Array.from({ length: 30 }, (_, i) =>
    ({ type: 'workout', completed: true, date: ago(i) })));
  PE.advanceWeekIfNeeded();
  SM.resetSessionMoments();
  return SM.renderSessionMoments({ exerciseIds: ids });
}

const atHinge = momentsAfter(120, 3);
check('a chapter ending asks for a read even three weeks after the last one',
  /Can I ask about those again\?/.test(atHinge),
  'chapterEnded is passed, not hardcoded false');
check('and the hinge is reported as pending', PE.isHingePending() === true);

const noHinge = momentsAfter(70, 3);
check('but mid-chapter, three weeks is still far too soon',
  !/Can I ask about those again\?/.test(noHinge),
  'the hinge brings it forward; it does not remove the throttle');

// ── 6b. The hinge must not override a recent "no" ────────────────────
//
// Reversal testing found this: moving the chapterEnded check above the
// decline check passed every assertion. It would mean somebody who
// skipped the questions last week gets asked again the moment their
// chapter ends — nagging at the exact moment the coach is asking most
// of them. The order in shouldOfferReassessment() is load-bearing, so
// it needs an assertion rather than a comment.
seed(120);
store.set('assessment', {
  baseline: { at: ago(140), measuredLevel: 'moderate', results: {} },
  history: [], lastOfferedAt: ago(7), declined: true
});
store.set('activityLog', Array.from({ length: 30 }, (_, i) =>
  ({ type: 'workout', completed: true, date: ago(i) })));
PE.advanceWeekIfNeeded();
SM.resetSessionMoments();
const declinedAtHinge = SM.renderSessionMoments({ exerciseIds: ids });
check('a chapter ending does NOT override a decline from last week',
  !/Can I ask about those again\?/.test(declinedAtHinge),
  'the hinge brings a read forward; it does not overrule a no');
check('and the hinge is still pending, waiting rather than nagging',
  PE.isHingePending() === true);

// ── 7. The arc is VISIBLE, through the real view ─────────────────────
momentsAfter(120, 3);
const el = document.getElementById('c');
MyProgrammeView({ navigate: () => {} }).mount(el);
check('the finished chapter shows on My Programme',
  /Build Your Base/.test(el.textContent),
  'chaptersDone was already rendered — completion needed no new surface');

// ── 8. THE OFFER. Part two — on Home, reached by everyone. ───────────
//
// It existed before this, inside gym-programme.js, gated on
// currentWeek >= 12 and reachable through ONE of thirteen session
// views. So it is asserted HERE, on the surface everybody reaches,
// rather than on the view that happened to have it.

const { TodayView } = await import(B + 'views/today.js');

function home(seedFn) {
  seedFn();
  const c = document.getElementById('c');
  const navs = [];
  TodayView({ navigate: v => navs.push(v) }).mount(c);
  return { c, navs, text: c.textContent.replace(/\s+/g, ' ') };
}

const atHingeHome = home(() => { seed(120); PE.advanceWeekIfNeeded(); });
check('the hinge appears on HOME, not one session view in thirteen',
  !!atHingeHome.c.querySelector('.today-hinge'));
check('and it names the chapter that finished',
  /That's Build Your Base done/.test(atHingeHome.text));
check('and suggests the successor from the SHARED chain',
  /Back to Strength would be my suggestion/.test(atHingeHome.text),
  'programmes.js, not the deleted private map that said Feel Good Foundation');
check('with all three ways out offered',
  atHingeHome.c.querySelectorAll('[data-hinge]').length === 3);

// It must not block. Somebody opened the app to move.
// Presence alone is not enough: hiding the grid with an inline style
// left this passing, because jsdom does not compute CSS and the nodes
// are still there. Reversal testing caught it. Check they are present
// AND visible AND actually clickable.
const doorsGrid = atHingeHome.c.querySelector('.today-doors');
const doorsHidden = !doorsGrid
  || doorsGrid.hasAttribute('hidden')
  || /display:\s*none|visibility:\s*hidden/.test(doorsGrid.getAttribute('style') || '');
check('the doors still work underneath it',
  atHingeHome.c.querySelectorAll('[data-door-id]').length > 0 && !doorsHidden,
  'gym-programme blocked the session until an option was chosen');

// No countdown and no verdict, at the moment most likely to produce one.
for (const [re, what] of [
  [/\d+%/,                'a percentage'],
  [/\bcomplete[d]?\b.*\d/, 'a completion figure'],
  [/well done|congratulations|smashed|crushed/i, 'a verdict'],
  [/weeks remaining|weeks left/i, 'a countdown'],
]) {
  check(`the hinge shows no ${what}`, !re.test(atHingeHome.c.innerHTML));
}

// Answering it. Executed: click, then read the store and the re-render.
// Guarded, so a missing card FAILS rather than throwing. A gate that
// crashes is not a gate that failed — removing the card from Home
// produced a TypeError here rather than a red assertion, which is the
// difference between a gate reporting a fault and a gate falling over
// next to one.
const nextBtn = atHingeHome.c.querySelector('[data-hinge="next"]');
check('there is a button to start the next chapter', !!nextBtn);
const before = store.get('activeProgramme.programmeId');
nextBtn?.click();
check('choosing the next chapter starts it',
  store.get('activeProgramme.programmeId') === 'back-to-strength' &&
  store.get('activeProgramme.programmeId') !== before);
check('and answers the hinge', PE.isHingePending() === false);
check('and the new chapter starts at week one',
  store.get('activeProgramme.currentWeek') === 1 &&
  store.get('activeProgramme.totalSessions') === 0);
check('while the arc keeps the finished chapter',
  (store.get('programme.chaptersDone') || []).length === 1,
  'a new chapter adds to the arc; it does not replace it');
check('and the card is gone once answered',
  !document.getElementById('c').querySelector('.today-hinge'));

const repeatHome = home(() => { seed(120); PE.advanceWeekIfNeeded(); });
repeatHome.c.querySelector('[data-hinge="repeat"]')?.click();
check('running it again restarts the same chapter',
  store.get('activeProgramme.programmeId') === 'beginner-fitness' &&
  store.get('activeProgramme.currentWeek') === 1 &&
  PE.isHingePending() === false);

const differentHome = home(() => { seed(120); PE.advanceWeekIfNeeded(); });
differentHome.c.querySelector('[data-hinge="different"]')?.click();
check('something different routes somewhere to choose',
  differentHome.navs.includes('goal-setup'));
check('and leaves the hinge standing until they actually choose',
  PE.isHingePending() === true,
  'a hinge that can be dismissed leaves somebody between chapters with nothing to say so');

// And nobody mid-chapter ever sees it.
const midHome = home(() => { seed(70, 11); PE.advanceWeekIfNeeded(); });
check('nobody mid-chapter sees a hinge',
  !midHome.c.querySelector('.today-hinge'));

// ── 9. One chain, not two ────────────────────────────────────────────
check('gym-programme no longer carries its own chain map',
  !/const PROGRESSIONS\s*=/.test(
    (await import('node:fs')).readFileSync('js/views/gym-programme.js', 'utf8')),
  'four of eight entries disagreed with programmes.js');
check('and the shared successor matches what My Programme renders',
  PE.chapterSuccessor('beginner-fitness')?.id === 'back-to-strength' &&
  PE.chapterSuccessor('feel-good-foundation')?.id === 'ground' &&
  PE.chapterSuccessor('build') === null);

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
