/**
 * tools/verify-delight.mjs
 * 15 Aug 2026 v1
 *
 * DELIGHT-1 and ORIENT-2, from the first-ninety-seconds audit.
 *
 * These are the first two fixes in the project that came from asking
 * "was that a good thing to happen to a person" rather than "did the
 * code do the right thing", so the gate has to check tone as well as
 * wiring — a recognition line that praised or promised would be a
 * regression even while rendering perfectly.
 */
import fs from 'node:fs';
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const FS = await import(BASE + 'data/first-session.js');
const GOALS = await import(BASE + 'data/goals.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };

// ── DELIGHT-1: fires once, ever ──────────────────────────────
check('fires on the first session', FS.firstSessionRecognition(1, 'wrong-fit') !== null);
check('does NOT fire on the second', FS.firstSessionRecognition(2, 'wrong-fit') === null);
check('does NOT fire on the fiftieth', FS.firstSessionRecognition(50, 'wrong-fit') === null);
check('does NOT fire at zero', FS.firstSessionRecognition(0, 'wrong-fit') === null);
check('somebody who skipped Hard Before still gets recognised',
  FS.firstSessionRecognition(1, null) !== null,
  'declining to say what was hard is not a reason to be owed less');

// Every territory the onboarding can write must have a line.
const TERRITORIES = ['trust-rupture','escalation-trap','life-interruption',
                     'wrong-fit','invisible-person','body-story','the-history'];
for (const terr of TERRITORIES) {
  const r = FS.firstSessionRecognition(1, terr);
  check(`territory ${terr} has its own line`,
    r !== null && r.body !== FS._FALLBACK_LINE.body);
}

// ── Tone. The part that matters more than the wiring ─────────
const allLines = [...Object.values(FS._TERRITORY_LINES), FS._FALLBACK_LINE];
const joined = allLines.map(l => l.heading + ' ' + l.body).join(' ');

check('no streak language', !/streak|in a row|day 1|days? one|keep it up|don't break/i.test(joined));
check('no comparison to other people', !/other people|most people|others|average/i.test(joined));
check('no escalation to the next session',
  !/tomorrow you|next session|next time you|see you again|come back tomorrow/i.test(joined),
  'a first session that becomes an obligation is the escalation trap');
check('no evaluation of the person',
  !/well done|amazing|proud of you|superstar|smashed it|you're a/i.test(joined),
  'P4: the coach displays, it does not evaluate');
check('no claim about who they now are',
  !/you're someone who|you are now|new you|transformed/i.test(joined),
  'an identity claim on the evidence of twenty minutes reads as flattery');
check('every territory line refers back to what THEY said',
  Object.values(FS._TERRITORY_LINES).every(l => /you told me/i.test(l.body)),
  'the personalisation is their own words, not praise');

// ── Wired in ─────────────────────────────────────────────────
// SHARED-1, 15 Aug: the recognition moved out of core-session.js, which
// reached one of eleven session views, into data/session-moments.js,
// rendered by reflect.js. These assertions follow it.
const cs = fs.readFileSync(new URL('../js/data/session-moments.js', import.meta.url), 'utf8');
check('the shared moments call it', /firstSessionRecognition\(/.test(cs));
check('and actually render it', /if \(first\)/.test(cs) && /first\.heading/.test(cs),
  'a function nobody renders is how capability.* stayed dead for three days');
check('counted from completedSessions, not a raw log length',
  /completedSessions\(log\)/.test(cs));

// ── ORIENT-2: nobody is left in silence ──────────────────────
const today = fs.readFileSync(new URL('../js/views/today.js', import.meta.url), 'utf8');
const ids = new Set();
(function walk(list) {
  for (const g of list || []) { if (g.id) ids.add(g.id); walk(g.goals || g.children || g.options); }
})(GOALS.GOAL_CATEGORIES);

for (const setName of ['WELLBEING_GOALS', 'STRENGTH_GOALS', 'MOVEMENT_GOALS']) {
  const m = today.match(new RegExp(`${setName} = new Set\\(\\[([\\s\\S]*?)\\]\\)`));
  const used = [...(m?.[1] || '').matchAll(/'([a-z0-9-]+)'/g)].map(x => x[1]);
  const bogus = used.filter(g => !ids.has(g));
  check(`${setName} contains only real goal ids`, bogus.length === 0,
    bogus.length ? `invented: ${bogus.join(', ')}` : `${used.length} ids, all present in goals.js`);
}

check('there is a fallback line, so no goal combination is silent',
  /Any door is a fine place to start/.test(today),
  'five of nine personas got null before this');
// SWEEP-1, 18 Aug 2026. This was a NEGATIVE {0,200} window, which is the
// dangerous direction. A positive window fails loudly when the gap grows;
// a negative one goes SILENTLY GREEN the moment the thing it forbids
// drifts 201 characters away. Adding one comment above a .sort() call
// would have disarmed this assertion without anybody noticing.
//
// The property is "the door grid is never reordered", so it is asserted
// against the whole HOME_DOORS region rather than a fixed distance from
// its name -- extracted from the declaration to its closing bracket.
//
// SEED NOTE, and it cost a false FAIL first. The replacement originally
// sliced to the next '\n];' and the array actually closes on an INDENTED
// '  ];', so the region swallowed hundreds of unrelated lines and found a
// .sort() in one of them. Bracket-matched now: the region is exactly the
// literal, and the assertion says so if it cannot find one.
{
  const decl = today.indexOf('HOME_DOORS');
  let region = '';
  if (decl !== -1) {
    const open = today.indexOf('[', decl);
    let depth = 0, i = open;
    for (; i < today.length; i++) {
      if (today[i] === '[') depth++;
      else if (today[i] === ']' && --depth === 0) break;
    }
    region = today.slice(open, i + 1);
  }
  check('the door grid is still never reordered',
    decl !== -1 && region.length > 50 && !/\.sort\(|\.reverse\(/.test(region),
    region.length <= 50 ? 'could not read the HOME_DOORS literal — assertion had nothing to test'
                        : 'reordering would fix 2.11 by breaking 2.14');
}

// ── STREAK-1: the product must not keep streaks ──────────────
const openingsSrc = fs.readFileSync(
  new URL('../js/data/checkin-openings.js', import.meta.url), 'utf8');
const openings = await import(BASE + 'data/checkin-openings.js');
const { store: store0 } = await import(BASE + 'store.js');

// Asserted BEHAVIOURALLY, at every count the trigger fires on. The first
// version of this checked the source for "days in a row" and failed on
// the comment explaining why that phrase was removed — source-matching
// again, in reverse. What matters is what the person is shown.
function milestoneAt(n) {
  localStorage.clear();
  store0.init();
  store0.set('ageBand', '45-54');
  const h = {};
  // Deliberately scattered — no two dates adjacent — but ENDING TODAY.
  // The first version of this ended months in the past, so the gap >= 7
  // Simple Arrival branch overrode the milestone and the test failed
  // against correct behaviour. Somebody returning after a month should be
  // met with "you came back", not a running total, and the ordering in
  // resolveOpening() already gets that right.
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today.getTime() - (n - 1 - i) * 3 * 86400000)
      .toISOString().split('T')[0];
    h[d] = { energy: 6, mood: 6, date: d };
  }
  store0.set('checkinHistory', h);
  return openings.resolveOpening();
}
check('nothing stores a key called streak-',
  !/`streak-\$\{/.test(openingsSrc) && !/'streak-'/.test(openingsSrc),
  'Settings promises the person in writing: "No streaks."');
check('the milestone count is substituted, not hardcoded',
  /\{n\}/.test(openingsSrc) && /replace\('\{n\}'/.test(openingsSrc),
  'the trigger fires at 7, 14 and 21; the copy said "Seven" every time');

// Behavioural: seven check-ins spread over months.
localStorage.clear();
const { store } = await import(BASE + 'store.js');
store.init();
store.set('ageBand', '45-54');
// Dates computed backwards from TODAY, not fixed literals. They were
// '2026-05-04' through '2026-08-14' — scattered, which is the point, but
// anchored to the week the test was written. The moment "today" drifts
// far enough past the last one, the gap-since-last-check-in branch
// overrides the milestone and this fails against correct behaviour.
// verify-chap2 and verify-sw1 have both already been fixed for exactly
// this, so it is a pattern rather than an accident.
//
// Still deliberately scattered — no two adjacent, spanning months — so
// "seven check-ins" can never be mistaken for seven days in a row.
const spread = {};
for (const gap of [104, 86, 68, 49, 36, 17, 2]) {
  const d = new Date(Date.now() - gap * 864e5).toISOString().split('T')[0];
  spread[d] = { energy: 6, mood: 6, date: d };
}
store.set('checkinHistory', spread);
const milestone = openings.resolveOpening();
check('a scattered seven is not described as a run',
  !/in a row\.|consecutive/i.test(milestone?.b1 || ''), milestone?.b1);
check('and it still says the true number',
  /7/.test(milestone?.b1 || ''), milestone?.b1);
for (const n of [7, 14, 21]) {
  const m = milestoneAt(n);
  const b1 = m?.b1 || '';
  check(`at ${n} scattered check-ins, no claim of consecutive days`,
    !/in a row\.|consecutive days/i.test(b1), b1.slice(0, 60));
  check(`at ${n}, the number shown is ${n}`,
    b1.includes(String(n)), b1.slice(0, 60));
}

check('the stored key is a count, not a streak',
  String(store.get('checkin.lastMilestoneNoticed')).startsWith('checkins-'),
  String(store.get('checkin.lastMilestoneNoticed')));

// The other consecutive-days reader is a REST prompt and must survive.
// BIAS-2, 16 Aug 2026. The consecutive-days EASING prompt moved out of
// coach-reflection.js, which is deleted, into checkin.js's coachBias()
// as a derived value. The mechanic is what matters and it survives:
// several days in a row makes the next session LIGHTER. Load
// management, not reward — the opposite of a streak, and correct.
const chk = fs.readFileSync(
  new URL('../js/data/checkin.js', import.meta.url), 'utf8');
check('several days in a row still makes the next session LIGHTER',
  /consecutiveActiveDays\(\) >= 3 \? 'lighter'/.test(chk),
  'load management, not reward — the opposite mechanic, and correct');
check('and it is still never rewarded as a streak',
  !/streak/i.test(chk),
  'the same days that soften a session must never be counted back at somebody');

console.log(failures === 0 ? '\nDELIGHT GATE GREEN' : `\nDELIGHT GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
