/**
 * tools/verify-assess1.mjs
 * 15 Aug 2026 v1
 *
 * ASSESS-1. The difficulty ceiling can move without the person editing
 * Settings — which is the thing every progression conversation has
 * stalled on.
 *
 * Asserted by BUILDING SESSIONS either side of a reassessment, not by
 * reading the field back. A stored level that does not change what is
 * served is the same defect one step along, and this project has shipped
 * that shape more than once.
 */
import fs from 'node:fs';
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const ci = await import(BASE + 'data/checkin.js');
const sb = await import(BASE + 'session-builder.js');
const ex = await import(BASE + 'data/exercises/index.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };
const byId = new Map(ex.EXERCISES.map(e=>[e.id,e]));
const idsOf = x=>{const a=(x&&(x.exercises||x.items||x))||[];return (Array.isArray(a)?a:[]).map(e=>e.id||e.exerciseId).filter(Boolean);};

function maxServed(runs = 40) {
  ci.saveCheckin({ energy: 7, mood: 7, sleepHours: 7.5, sleepQuality: 'good', unwell: false });
  let max = 0, n = 0, sum = 0;
  for (let i = 0; i < runs; i++)
    for (const id of idsOf(sb.buildSession({ sessionType: 'full', durationMins: 30 }))) {
      const d = byId.get(id)?.difficultyLevel;
      if (typeof d === 'number') { max = Math.max(max, d); sum += d; n++; }
    }
  return { max, mean: sum / n };
}

// ── Defaults ─────────────────────────────────────────────────
localStorage.clear(); store.init();
check('a fresh store has no baseline', store.get('assessment').baseline === null);
check('and defaults to coach-led', store.get('sessionMode') === 'coach-led');
check('history starts empty and is an array',
  Array.isArray(store.get('assessment').history) && store.get('assessment').history.length === 0);

// ── An unknown level is refused ──────────────────────────────
check('an unknown level is refused, not stored',
  store.recordAssessment({ measuredLevel: 'beginner' }) === null &&
  store.get('fitnessLevel') === null,
  "'beginner' reads plausibly and matches nothing — the vocabulary trap");

// ── THE POINT: the ceiling moves, and sessions change ────────
localStorage.clear(); store.init();
store.set('lifestyle.activityLevel', 'light');
store.set('equipment', ['dumbbells','barbell','bench','kettlebell']);
store.set('ageBand', '35-44');
store.recordAssessment({ measuredLevel: 'light', results: { squat: 'hard' } });
const before = maxServed();

store.recordAssessment({ measuredLevel: 'active', results: { squat: 'comfortable' }, week: 4 });
const after = maxServed();

console.log(`\n   max difficulty served: ${before.max} -> ${after.max}`);
console.log(`   mean difficulty:       ${before.mean.toFixed(2)} -> ${after.mean.toFixed(2)}\n`);

check('a reassessment raises what can be served',
  after.max > before.max,
  `${before.max} -> ${after.max}, without the person touching Settings`);
check('and it is the SAME field the engine already reads',
  store.get('fitnessLevel') === 'active',
  'no fourth level field for three readers to disagree about');

// ── It must read down too ────────────────────────────────────
store.recordAssessment({ measuredLevel: 'light', results: { squat: 'hard' }, week: 8 });
const back = maxServed();
check('an honest read down lowers it again', back.max < after.max,
  `${after.max} -> ${back.max} — a measure that only ratchets up is another thing to fall behind`);
check("and 'down' is reported as a direction, not a failure",
  store.assessmentChange()?.direction === 'down');

// ── No score, ever ───────────────────────────────────────────
const src = fs.readFileSync(new URL('../js/store.js', import.meta.url), 'utf8');
// Comments STRIPPED before scanning. The first version of this matched
// the sentence "There is no score here and there must never be one" in
// the doc comment above recordAssessment() and failed against correct
// code. Eighth time a check in this project has matched prose rather
// than code, and the fix is the same every time: read what executes.
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const block = strip(src.slice(src.indexOf('recordAssessment('), src.indexOf('declineAssessment(')));
check('nothing computes a score or percentage',
  !/score|percent|rating|rank|percentile/i.test(block),
  'a number invites comparison and becomes a target');
check('assessmentChange returns levels and a direction, not a delta',
  (() => { const c = store.assessmentChange();
    return c && 'from' in c && 'to' in c && 'direction' in c && !('delta' in c); })());

// ── Skipping is remembered ───────────────────────────────────
localStorage.clear(); store.init();
store.declineAssessment();
check('a skip is remembered so nobody is asked twice',
  store.get('assessment').declined === true);
check('and skipping leaves the ceiling exactly as it was',
  store.get('fitnessLevel') === null,
  'declining must not degrade the experience');

// ── History is bounded ───────────────────────────────────────
localStorage.clear(); store.init();
store.recordAssessment({ measuredLevel: 'light', results: {} });
for (let i = 0; i < 20; i++)
  store.recordAssessment({ measuredLevel: 'moderate', results: {}, week: i });
check('history is capped', store.get('assessment').history.length === 12,
  `${store.get('assessment').history.length} — a record of where somebody has been, not a dataset`);

console.log(failures === 0 ? '\nASSESS-1 GATE GREEN' : `\nASSESS-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
