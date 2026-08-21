/**
 * tools/verify-countdown1.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 16 Aug 2026 v1
 *
 * COUNTDOWN-1. No countdown, anywhere.
 *
 * (Named COUNTDOWN, not COUNT: COUNT-1 is the 12 Aug gate that gave the
 * product one definition of "a session that happened". I nearly wrote
 * this file over it.)
 *
 * The chapters blueprint, agreed in full with Graeme:
 *
 *   Keep the milestone. Remove the countdown. Show progress made,
 *   never distance remaining.
 *
 * My Programme shipped on 16 Aug with a gate that fails if a progress
 * bar appears. progress.js had been rendering a real one for weeks -- a
 * filled bar, "N% complete", and "8 weeks remaining" beneath it, on a
 * screen every user sees. Two screens, opposite rules, and only the
 * newer one had a test.
 *
 * So this gate is deliberately PRODUCT-WIDE rather than scoped to one
 * view. A rule enforced only on the screen that already obeys it is not
 * a rule; it is a coincidence with a gate attached.
 *
 * The milestones are NOT removed, and this gate does not ask for their
 * removal -- endowed progress and the goal gradient are real effects.
 * What goes is the mechanism that works by amplifying perceived
 * obligation, which is persona 2.5's declared territory with a bar
 * drawn on it.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
import fs from 'node:fs';
import path from 'node:path';
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: 'https://x/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const PE = await import(BASE + 'data/programmeEngine.js');
const { ProgressView } = await import(BASE + 'views/progress.js');

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

// 1. The countdown fields are gone AT SOURCE. This is the assertion
//    that prevents recurrence; the rest check today's symptoms.
localStorage.clear();
store.init();
store.set('tier', 'personal');
store.set('activeProgramme.programmeId', 'beginner-fitness');
store.set('activeProgramme.programmeName', 'Build Your Base');
store.set('activeProgramme.startDate', new Date(Date.now() - 56 * 864e5).toISOString());
store.set('activeProgramme.currentWeek', 9);
store.set('activeProgramme.totalSessions', 22);
store.set('activeProgramme.sessionsThisWeek', 2);

const stats = PE.getProgressStats();
check('getProgressStats no longer offers percentComplete', !('percentComplete' in stats),
  'a field offering a countdown will eventually be rendered as one');
check('and no longer offers weeksRemaining', !('weeksRemaining' in stats));
check('it offers weeksIn instead', stats.weeksIn === 8, `week 9 = 8 weeks in, got ${stats.weeksIn}`);
check('and weeksIn can never go negative', stats.weeksIn >= 0);

// 2. Execute Progress and read what a person would actually see.
const el = document.getElementById('c');
let threw = null;
try { ProgressView({ navigate: () => {} }).mount(el); } catch (e) { threw = e; }
check('Progress mounts', !threw, threw ? String(threw) : '');

const html = el.innerHTML;
const text = el.textContent.replace(/\s+/g, ' ');

check('the programme section still renders', /progress-programme/.test(html));
check('and says how many weeks are BEHIND them', /8 weeks in/.test(text));

const BANNED = [
  [/progress-programme__bar|progress-programme__fill/, 'the progress bar markup'],
  [/role="progressbar"/,                               'a progressbar role'],
  [/weeks remaining/i,                                 '"weeks remaining"'],
  [/\d+% complete/i,                                   '"N% complete"'],
  [/\d+% through/i,                                    '"N% through"'],
  [/\bof 12\b/,                                        '"week N of 12" — the week count is the deadline'],
  [/the end is close/i,                                '"the end is close"'],
  [/halfway through/i,                                 '"halfway through"'],
  [/style="width: \d+%/,                               'a percentage-width fill'],
];
for (const [re, what] of BANNED) {
  check(`no ${what}`, !re.test(html), 'distance remaining, not progress made');
}

// 3. The milestone is KEPT. Without this the gate would pass on a
//    screen that had simply been emptied, which is a different failure.
check('the sessions-completed count is still shown', /22 sessions completed/.test(text));
check('and the weekly count is still shown', /this week/.test(text));

// 3b. Render the LATE state too, where the milestone copy lives.
//
// Reversal testing found this hole: restoring "the end is close" was not
// caught, because that branch only fires from week 10 and the fixture
// above sits at week 9. Every banned string was being checked against a
// render that could not contain it. A fixture that never reaches the
// branch is a fixture that never tests it.
localStorage.clear();
store.init();
store.set('tier', 'personal');
store.set('activeProgramme.programmeId', 'beginner-fitness');
store.set('activeProgramme.programmeName', 'Build Your Base');
store.set('activeProgramme.startDate', new Date(Date.now() - 77 * 864e5).toISOString());
store.set('activeProgramme.currentWeek', 12);
store.set('activeProgramme.totalSessions', 31);

const el2 = document.getElementById('c');
let threw2 = null;
try { ProgressView({ navigate: () => {} }).mount(el2); } catch (e) { threw2 = e; }
check('Progress mounts in the late state', !threw2, threw2 ? String(threw2) : '');

const lateHtml = el2.innerHTML;
for (const [re, what] of BANNED) {
  check(`no ${what}, late in a chapter either`, !re.test(lateHtml));
}
check('and the late milestone faces backwards',
  /11 weeks in/.test(el2.textContent.replace(/\s+/g, ' ')),
  'the milestone is kept — it just stops describing what is left');

// 4. Product-wide. The scoped version of this gate is what let the
//    contradiction live: My Programme was tested, Progress was not.
const viewDir = 'js/views';
const offenders = [];
for (const f of fs.readdirSync(viewDir)) {
  if (!f.endsWith('.js')) continue;
  const src = fs.readFileSync(path.join(viewDir, f), 'utf8');
  // Comments stripped, so a file explaining why it has NO countdown does
  // not read as one having a countdown. A gate must survive its own
  // documentation.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  // PROGRAMME-level countdowns only. Twelve views carry a
  // role="progressbar", and every one of them is WITHIN-SESSION
  // position -- "Session progress, 40%" during a workout somebody
  // started four minutes ago.
  //
  // That is a different object and the blueprint does not forbid it.
  // The rule is about a MANUFACTURED deadline stretched over months:
  // "8 weeks remaining" is pressure applied to a person's life, while
  // "3 exercises left" is orientation inside something finite they
  // chose and are currently doing. Removing the second would also cost
  // real accessibility -- knowing where you are in a session is exactly
  // what a progressbar role is for.
  //
  // Flagged to Graeme rather than changed, because narrowing this rule
  // is a judgement and the wrong call here removes something useful.
  for (const [re, what] of [
    [/weeksRemaining/,       'weeksRemaining'],
    [/percentComplete/,      'percentComplete'],
    [/weeks remaining/i,     '"weeks remaining"'],
    [/weeks left/i,          '"weeks left"'],
    // Anchored on WEEK. An earlier version matched any "N of 12" and
    // flagged annual-reflection.js's "Months you moved in: 7 of 12" --
    // which counts months BEHIND somebody across a year and is the
    // opposite of a countdown. A gate that cannot tell those apart
    // would have had me delete the right thing.
    [/[Ww]eek [^<\n]{0,24}of 12/, 'a week-of-twelve count'],
  ]) {
    if (re.test(code)) offenders.push(`${f}: ${what}`);
  }
}
check('no view anywhere renders a countdown', offenders.length === 0, offenders.join(' · '));

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
