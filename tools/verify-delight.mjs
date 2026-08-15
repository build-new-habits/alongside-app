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
const cs = fs.readFileSync(new URL('../js/views/core-session.js', import.meta.url), 'utf8');
check('the done screen calls it', /firstSessionRecognition\(/.test(cs));
check('and actually renders it', /firstTime \?/.test(cs) && /firstTime\.heading/.test(cs),
  'a function nobody renders is how capability.* stayed dead for three days');
check('counted from completedSessions, not a raw log length',
  /completedSessions\(store\.get\("activityLog"\)/.test(cs));

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
check('the door grid is still never reordered',
  !/HOME_DOORS[\s\S]{0,200}\.sort\(/.test(today),
  'reordering would fix 2.11 by breaking 2.14');

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
const spread = {};
for (const d of ['2026-05-04','2026-05-22','2026-06-09','2026-06-28',
                 '2026-07-11','2026-07-30','2026-08-14'])
  spread[d] = { energy: 6, mood: 6, date: d };
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
const reflect = fs.readFileSync(
  new URL('../js/views/coach-reflection.js', import.meta.url), 'utf8');
check('coach-reflection still notices consecutive days to suggest EASING',
  /consecutive >= 3[\s\S]{0,200}proposalBias: "lighter"/.test(reflect),
  'load management, not reward — the opposite mechanic, and correct');

console.log(failures === 0 ? '\nDELIGHT GATE GREEN' : `\nDELIGHT GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
