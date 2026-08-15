/**
 * tools/verify-diff1.mjs
 * 15 Aug 2026 v1
 *
 * DIFF-1. Technically demanding lifts are rated above the ceiling of the
 * people who should not be doing them unsupervised.
 *
 * Found by the Wave 3 trace of persona 2.6. Power Clean, Kettlebell
 * Snatch and Turkish Get-Up were all rated 3 — the same as a Barbell Hip
 * Thrust — and 'light' and 'returning' both cap at 3. So somebody who
 * said they do "some walking, gentle movement" was being served Olympic
 * lifts at home, unsupervised. The ceiling was working; the rating was
 * wrong.
 */
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

// Minimum rating for movements that carry a real technique cost.
const MIN_RATING = {
  'barbell-power-clean': 5,
  'kettlebell-snatch': 4,
  'kettlebell-clean': 4,
  'kettlebell-turkish-getup': 4,
  'bodyweight-pistol-squat-progression': 4,
  'bodyweight-nordic-curl-progression': 4,
};
for (const [id, min] of Object.entries(MIN_RATING)) {
  const e = byId.get(id);
  check(`${id} is rated at least ${min}`, e && e.difficultyLevel >= min,
    e ? `d${e.difficultyLevel}` : 'MISSING FROM DATABASE');
}

// The consequence, asserted behaviourally.
const idsOf = x=>{const a=(x&&(x.exercises||x.items||x))||[];return (Array.isArray(a)?a:[]).map(e=>e.id||e.exerciseId).filter(Boolean);};
const TECHNICAL = /power clean|snatch|turkish get|pistol|nordic curl/i;

for (const level of ['light', 'returning']) {
  localStorage.clear(); store.init();
  store.set('lifestyle.activityLevel', level);
  store.set('equipment', ['barbell','kettlebell','bench','pullup-bar','dumbbells']);
  store.set('ageBand', '45-54');
  ci.saveCheckin({ energy: 6, mood: 6, sleepHours: 7, sleepQuality: 'okay', unwell: false });
  const hits = [];
  for (let i = 0; i < 50; i++)
    for (const id of idsOf(sb.buildSession({ sessionType: 'full', durationMins: 40 }))) {
      const e = byId.get(id);
      if (e && TECHNICAL.test(e.name)) hits.push(e.name);
    }
  check(`a '${level}' user is served no Olympic or high-technique lifts`,
    hits.length === 0,
    hits.length ? [...new Set(hits)].join(', ') : '50 sessions, full gym available');
}

// A capable person must still be able to reach them.
localStorage.clear(); store.init();
store.set('lifestyle.activityLevel', 'very-active');
store.set('equipment', ['barbell','kettlebell','bench','pullup-bar','dumbbells']);
ci.saveCheckin({ energy: 8, mood: 8, sleepHours: 8, sleepQuality: 'good', unwell: false });
let reached = 0;
for (let i = 0; i < 80; i++)
  for (const id of idsOf(sb.buildSession({ sessionType: 'full', durationMins: 40 })))
    if (byId.get(id)?.difficultyLevel >= 4) reached++;
check('a very-active person can still reach difficulty 4+', reached > 0,
  `${reached} high-difficulty items in 80 sessions — raising ratings must not put them out of everyone's reach`);

console.log(failures === 0 ? '\nDIFF-1 GATE GREEN' : `\nDIFF-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
