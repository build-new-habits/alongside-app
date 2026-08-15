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

console.log(failures === 0 ? '\nDELIGHT GATE GREEN' : `\nDELIGHT GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
