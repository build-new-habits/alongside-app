/**
 * tools/verify-chap2.mjs
 * 16 Aug 2026 v1
 *
 * CHAP-1 step 2. My Programme.
 *
 * THIS GATE EXECUTES THE VIEWS. Every other gate in this suite reads
 * source text, which is exactly why four end-of-session moments could
 * ship into one of eleven session views on 15 Aug with fifty-one gates
 * green: not one of them knew whether a person could reach the code it
 * was reading. A regex proves a string exists in a file. It does not
 * prove a screen renders it, and those are different claims.
 *
 * So this mounts Home in jsdom, finds the row, CLICKS it, and asserts
 * where the click goes. Then it mounts the destination across four real
 * user states and reads the text a person would actually see.
 *
 * The negative assertions carry most of the weight, because the failure
 * mode for this feature is not "it does not work" -- it is "it works and
 * quietly becomes a deadline". Blueprint §3: keep the milestone, remove
 * the countdown, show progress made and never distance remaining.
 *
 * Every assertion here was reversal-tested: made to fail on purpose
 * before being trusted. A gate that has never been made to fail proves
 * nothing, and "no output" is not "green".
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
const { store }           = await import(BASE + 'store.js');
const { TodayView }       = await import(BASE + 'views/today.js');
const { MyProgrammeView } = await import(BASE + 'views/my-programme.js');

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

const el = document.getElementById('main-content');
const flat = () => el.textContent.replace(/\s+/g, ' ').trim();

/** Mount a view for real, from a seeded store, and hand back what a
 *  person would see. Anything thrown is a FAIL rather than a crash:
 *  a gate that dies is not a gate that failed. */
function mountWith(View, seed) {
  localStorage.clear();
  store.init();
  if (seed) seed();
  const navs = [];
  try {
    View({ navigate: v => navs.push(v) }).mount(el);
  } catch (e) {
    return { navs, text: '', threw: e };
  }
  return { navs, text: flat(), threw: null };
}

// ─────────────────────────────────────────────────────────────────────
// 1. The route exists, and points at something real
// ─────────────────────────────────────────────────────────────────────

const routerSrc = fs.readFileSync('js/router.js', 'utf8');
const entry = routerSrc.match(/'my-programme':\s*\{\s*path:\s*'([^']+)',\s*fn:\s*'([^']+)'/);
check('the router declares a my-programme route', !!entry);
if (entry) {
  const filePath = 'js/' + entry[1].replace(/^\.\//, '');
  check('and its path points at a file that exists', fs.existsSync(filePath), filePath);
  // The 04 Aug session-builder bug: a route pointed at a filename that
  // had never existed, so import() threw before anything else ran and
  // the route could not have worked on any device, ever.
  check('and the file really exports the factory the router names',
    fs.existsSync(filePath) && new RegExp(`export function ${entry[2]}\\b`).test(fs.readFileSync(filePath, 'utf8')),
    entry[2]);
}
check('the nav tab agrees with how you got there',
  /'my-programme':\s*'today'/.test(routerSrc),
  "NAV-8: a tab that disagrees with the route is worse than absent");

// ─────────────────────────────────────────────────────────────────────
// 2. Home renders the row — executed, not read
// ─────────────────────────────────────────────────────────────────────

const home = mountWith(TodayView, () => {});
check('Home mounts without throwing', !home.threw, home.threw ? String(home.threw) : '');

const row = el.querySelector('.today-programme-row');
check('Home renders the My Programme row', !!row);
check('the row is a real button with an accessible name',
  !!row && row.tagName === 'BUTTON' && (row.getAttribute('aria-label') || '').length > 0);

const grid = el.querySelector('.today-doors');
check('the row sits ABOVE the six tiles',
  !!row && !!grid && !!(row.compareDocumentPosition(grid) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING),
  'full width above the grid, not a seventh tile');
check('and it is not styled as one of the tiles',
  !!row && !row.classList.contains('today-door'),
  'in the grid people tap it expecting a workout');

// The claim that matters: tapping it actually goes somewhere.
if (row) {
  const before = home.navs.length;
  row.click();
  check('clicking the row navigates to my-programme',
    home.navs.length === before + 1 && home.navs[home.navs.length - 1] === 'my-programme',
    home.navs.join(',') || 'nothing happened');
}

// ─────────────────────────────────────────────────────────────────────
// 3. The cog is gone, and Settings did not go with it
// ─────────────────────────────────────────────────────────────────────

check('the cog is gone from Home', !el.querySelector('.today-settings-link'));
check('and Settings is still reachable from the bottom nav',
  /data-nav="settings"/.test(fs.readFileSync('index.html', 'utf8')),
  'removing the only route to a screen would be a regression, not a tidy-up');
// Both branches, executed. The first fixture has not checked in today,
// so Home offers "Check in" -- I asserted "Update check-in" against it
// and the gate caught me, which is the whole argument for running one
// rather than reading it. The claim being defended is that NEITHER
// branch is icon-only, so both are mounted.
check('before checking in, the control says so in words',
  /Check in/.test(el.innerHTML) && !/Update check-in/.test(el.innerHTML));

const checkedIn = mountWith(TodayView, () => {
  store.set('lastCheckin.timestamp', new Date().toISOString());
});
check('"Update check-in" keeps a visible text label',
  !checkedIn.threw && /Update check-in/.test(el.innerHTML),
  'an icon-only control is the least discoverable thing on a screen, and a passport-and-pen has no meaning for "change how I said I am feeling"');
check('and it is still there for somebody who wants to update WITHOUT starting a session',
  !!el.querySelector('[data-action="checkin-mini"]'),
  'the case the contextual offer misses: checked in this morning, felt worse by evening');

// ─────────────────────────────────────────────────────────────────────
// 4. The destination renders, in every state a person can arrive in
// ─────────────────────────────────────────────────────────────────────

const seedNothing = () => { store.set('goals', []); };

// Tier is set EXPLICITLY in every fixture from here on. It was implicit
// before, which was fine until the successor line became Personal-only
// and two assertions that had passed for days started failing on a
// default nobody had chosen. A fixture that relies on a default is a
// fixture that changes meaning when the default does.
const seedFree = () => {
  store.set('tier', 'free');
  store.set('goals', ['get-stronger', 'feel-better']);
};

const seedChapter = () => {
  store.set('tier', 'personal');
  store.set('goals', ['get-stronger']);
  store.set('activeProgramme.programmeId', 'beginner-fitness');
  store.set('activeProgramme.startDate', new Date(Date.now() - 21 * 864e5).toISOString());
  store.set('activeProgramme.currentWeek', 4);
  store.set('activeProgramme.totalSessions', 9);
  store.recordAssessment({ measuredLevel: 'moderate', results: {} });
};

const seedEvent = () => {
  seedChapter();
  store.set('programme.presentation', 'blocks');
  store.set('activeProgramme.currentWeek', 8);
  store.set('strategicGoal.targetDescription', 'The coast path walk');
  store.set('strategicGoal.targetDate', new Date(Date.now() + 29 * 864e5).toISOString());
};

const nothing = mountWith(MyProgrammeView, seedNothing);
check('it mounts for somebody with nothing at all', !nothing.threw && nothing.text.length > 0,
  nothing.threw ? String(nothing.threw) : '');
check('and does not claim they are on a programme',
  /not following a chapter/i.test(nothing.text));

const free = mountWith(MyProgrammeView, seedFree);
check('a free user with no programme still sees what they are after',
  /Get stronger/.test(free.text) && /Feel better/.test(free.text),
  'goals, a level and sessions done are not Personal-tier facts');

const chapter = mountWith(MyProgrammeView, seedChapter);
check('the chapter is named', /Build Your Base/.test(chapter.text));
check('the arc names what would likely come next',
  /Back to Strength would likely come next/.test(chapter.text));
check('and says plainly that it is not settled',
  /Nothing is fixed/.test(chapter.text),
  'CHAIN-1 made it a rail; the blueprint makes it a default');

// ─────────────────────────────────────────────────────────────────────
// 5. Progress made, never distance remaining — the whole feature
// ─────────────────────────────────────────────────────────────────────

// currentWeek 4 means three weeks are BEHIND them. The forbidden number
// is 8, which is 12 minus 4, and the only way it appears is if somebody
// has written a countdown against a programme length.
check('weeks are counted forward', /3 weeks in/.test(chapter.text), 'week 4 of a programme = 3 weeks in');
check('and never backward against the programme length',
  !/\b8 weeks (left|remaining|to go)\b/i.test(chapter.text) &&
  !/weeks (left|remaining)\b/i.test(chapter.text),
  'a twelve-week bar is a manufactured deadline');

const BANNED = [
  [/\d+\s?% /,                       'a percentage complete'],
  [/progress-bar|progress-fill|__bar\b/, 'a progress bar'],
  [/\bstreak\b/i,                    'a streak'],
  [/\bday(s)? in a row\b/i,          'consecutive anything'],
  [/\bbehind\b/i,                    'telling somebody they are behind'],
  [/\bon track\b/i,                  'a track to fall off']
];
for (const [re, what] of BANNED) {
  check(`no ${what}`, !re.test(chapter.text) && !re.test(el.innerHTML));
}

// The blocks vocabulary is the same engine, and it must also count
// forward. If Blocks needs a countdown to feel like Blocks, the choice
// was cosmetic and that is worth discovering early.
const event = mountWith(MyProgrammeView, seedEvent);
check('the blocks vocabulary still counts weeks DONE',
  /Week 7 done/.test(event.text),
  'one flag, two vocabularies — never two engines');

// The one honest countdown, and the positive half of the assertion
// above. Without this, "no countdown" could pass simply because the
// branch never renders at all.
check('a date the PERSON supplied does get counted toward',
  /29 days to go/.test(event.text) && /The coast path walk/.test(event.text),
  'a hike on 14 September is a real deadline; the app is being useful about a fact');
// Computed, not hardcoded. This asserted "14 September" — the date 29
// days from when it was written — and went red the moment the clock
// rolled past midnight during a long session. A gate that fails because
// the calendar moved is a gate that will cry wolf, and verify-sw1.mjs
// was fixed for exactly this once already.
const expectedDate = new Date(Date.now() + 29 * 864e5)
  .toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
check('and the supplied date is shown in words, not as a bare number',
  event.text.includes(expectedDate), expectedDate);

// ─────────────────────────────────────────────────────────────────────
// 5b. Tier — show what they have, lock only what they do not
// ─────────────────────────────────────────────────────────────────────

// Graeme, 16 Aug: My Programme is Personal, but a free user still has
// goals and a level, and whatever they have should be there while they
// can still see what Personal offers.
//
// The assertion that carries the weight is the NEGATIVE one: a free
// user's own goals, sessions and read must never sit behind the lock.
// They are facts the person owns, not features.

const freeUser = mountWith(MyProgrammeView, seedFree);
const lockOf = () => el.querySelector('.locked-feature-wrap');

check('a free user is shown what Personal adds', !!lockOf());
check('and the lock routes somewhere rather than being inert',
  !!lockOf() && lockOf().dataset.route === 'upgrade' && lockOf().getAttribute('role') === 'button',
  'WOW-4: nothing is a dead end');
check('and the lock says what it unlocks, not just that it is locked',
  /Chapters that follow on from each other/.test(freeUser.text),
  'a locked control that cannot name its feature is a wall');
check("a free user's OWN goals are not behind the lock",
  !!lockOf() && !lockOf().textContent.includes('Get stronger') && /Get stronger/.test(freeUser.text),
  'their goals are a fact they own, not a feature');

// Data first, then tier. A free user who HAS a programme still sees it.
const freeWithProgramme = mountWith(MyProgrammeView, () => {
  seedChapter();
  store.set('tier', 'free');   // after seedChapter, which sets personal
});
check('a free user who has a programme still sees it',
  /Build Your Base/.test(freeWithProgramme.text) && /3 weeks in/.test(freeWithProgramme.text),
  'gating on tier before data would hide a fact from the person who owns it');

// The screen must not promise the chain above and sell it below.
check('and is not promised a successor chapter it then locks',
  !/would likely come next/.test(freeWithProgramme.text),
  'the successor IS the chain -- one side of the line or the other');

const paying = mountWith(MyProgrammeView, seedChapter);
check('a paying user sees the successor', /would likely come next/.test(paying.text));
check('and is not sold something they already have',
  !el.querySelector('.locked-feature-wrap'),
  'an upsell shown to a subscriber is an error, not a nudge');

// ─────────────────────────────────────────────────────────────────────
// 6. The weekly focus has NOT shipped
// ─────────────────────────────────────────────────────────────────────

// Nothing writes weekFocus.key yet — it is build step 4. If a section
// for it appears now, it is copy no user can reach, which is the fault
// that cost a day on 15 Aug. Seeded deliberately, so this fails the
// moment somebody renders it ahead of its writer.
const focus = mountWith(MyProgrammeView, () => {
  seedChapter();
  store.set('weekFocus.key', 'single-leg');
});
check('the weekly focus is not rendered before it has a writer',
  !/single-leg/i.test(focus.text) && !/focus/i.test(focus.text),
  'step 4 — the section arrives with the thing that fills it');

// ─────────────────────────────────────────────────────────────────────
// 7. It reads. It does not write.
// ─────────────────────────────────────────────────────────────────────

// Seeded so no week is due to turn (21 days elapsed, currentWeek
// already 4), which is the only write mount() is entitled to make.
localStorage.clear();
store.init();
seedChapter();
const before = localStorage.getItem('alongside_user');
MyProgrammeView({ navigate: () => {} }).mount(el);
const after = localStorage.getItem('alongside_user');
check('mounting the view writes nothing to the store',
  before === after,
  'step 2 is a display surface; a read-only screen that saves is a screen with a side effect nobody expects');

// ── TARGET-3, 17 Aug 2026 ────────────────────────────────────────────
//
// targetDate and targetDescription exist at TOP LEVEL and again inside
// strategicGoal. Onboarding's goal-setup.js writes the top-level pair;
// this view read only the strategicGoal pair, which nothing writes. So
// somebody who set a date at onboarding saw nothing in the section that
// exists to show what they are aiming at.
const onboardingOnly = mountWith(MyProgrammeView, () => {
  store.set('tier', 'personal');
  store.set('goals', ['get-stronger']);
  store.set('targetDescription', 'The coast path walk');
  store.set('targetDate', new Date(Date.now() + 29 * 864e5).toISOString());
});
check('a target set at ONBOARDING is shown on My Programme',
  /The coast path walk/.test(onboardingOnly.text),
  'the top-level pair is where goal-setup.js actually writes');
check('and its date is counted toward',
  /29 days to go/.test(onboardingOnly.text));

// strategicGoal wins when both are present — it is the structured home
// and where step 6 will write.
const both = mountWith(MyProgrammeView, () => {
  store.set('tier', 'personal');
  store.set('goals', ['get-stronger']);
  store.set('targetDescription', 'the old one');
  store.set('strategicGoal.targetDescription', 'the structured one');
});
check('strategicGoal takes precedence over the top-level pair',
  /the structured one/.test(both.text) && !/the old one/.test(both.text));


console.log(failures === 0
  ? `\nALL PASS — ${'my-programme'} renders from a real click on a real Home.\n`
  : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
