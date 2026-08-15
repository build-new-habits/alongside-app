/**
 * tools/verify-mood1.mjs
 * 15 Aug 2026 v1
 *
 * MOOD-1. moodAfter reaches the object that reads it, and the three
 * coach branches that depend on it can fire.
 *
 * Asserted by producing the OPENING, not by checking the field exists.
 * A mirrored field that still does not reach a branch would be the same
 * defect one step along.
 */
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const openings  = await import(BASE + 'data/checkin-openings.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };
const dayKey = d => d.toISOString().split('T')[0];

/** Build N days of check-ins ending today, each with an optional moodAfter. */
function seed(days) {
  localStorage.clear(); store.init();
  store.set('ageBand', '45-54');
  const today = new Date();
  days.forEach((d, i) => {
    const date = new Date(today.getTime() - (days.length - 1 - i) * 86400000);
    const key  = dayKey(date);
    const h = { ...(store.get('checkinHistory') || {}) };
    h[key] = { energy: d.energy, mood: d.mood, date: key };
    store.set('checkinHistory', h);
    if (typeof d.moodAfter === 'number') {
      store.logActivity({ type: 'core-session', status: 'completed',
        completedAt: date.toISOString(), durationMins: 20,
        exercisesCount: 6, moodAfter: d.moodAfter });
    }
  });
}

// ── The mirror ───────────────────────────────────────────────
seed([{ energy: 3, mood: 3, moodAfter: 8 }]);
const k = dayKey(new Date());
check('moodAfter reaches the day it belongs to',
  store.get('checkinHistory')[k]?.moodAfter === 8);

// Last write wins, honestly — not the best of the day.
// Timestamps spaced beyond logActivity()'s 10s dedupe window: the first
// version of this fired three writes in the same second and two were
// correctly rejected as duplicates, so the test failed against right
// behaviour rather than wrong.
store.logActivity({ type: 'core-session', status: 'completed',
  completedAt: new Date(Date.now() + 60000).toISOString(), durationMins: 20,
  exercisesCount: 6, moodAfter: 4 });
check('a later session overwrites, rather than the day keeping its best',
  store.get('checkinHistory')[k]?.moodAfter === 4,
  'taking the highest would let one good session paper over a hard one');

// A null must not erase a real answer.
store.logActivity({ type: 'core-session', status: 'completed',
  completedAt: new Date(Date.now() + 120000).toISOString(), durationMins: 20,
  exercisesCount: 6, moodAfter: null });
check('a session logged without a reflection does not erase one',
  store.get('checkinHistory')[k]?.moodAfter === 4);

// A partial exit taught nothing and must not record a mood.
seed([{ energy: 5, mood: 5 }]);
store.logActivity({ type: 'core-session', status: 'partial',
  completedAt: new Date().toISOString(), durationMins: 20,
  exercisesCount: 2, moodAfter: 9 });
check('an abandoned session does not record a mood',
  store.get('checkinHistory')[dayKey(new Date())]?.moodAfter === undefined);

// Moving on a day with no check-in must not invent one.
localStorage.clear(); store.init();
store.logActivity({ type: 'core-session', status: 'completed',
  completedAt: new Date().toISOString(), durationMins: 20,
  exercisesCount: 6, moodAfter: 7 });
check('no check-in that day means no invented entry',
  Object.keys(store.get('checkinHistory') || {}).length === 0,
  'inventing one would put words in their mouth on every other field');

// ── The branch that has never been shown to anybody ──────────
// Arrived low, left better — yesterday. Today's opening should be able
// to say so. Seeded across enough days for the reflection mode to be
// eligible, with no gap and no milestone.
let found = null;
for (let attempt = 0; attempt < 40 && !found; attempt++) {
  seed([
    { energy: 6, mood: 6, moodAfter: 6 },
    { energy: 5, mood: 5, moodAfter: 6 },
    { energy: 3, mood: 3, moodAfter: 8 },   // yesterday: low in, better out
    { energy: 5, mood: 5 },                 // today
  ]);
  store.set('checkin.lastOpeningMode', 'real-world');  // make reflection eligible
  const o = openings.resolveOpening();
  if (/felt better after|better after|weren't sure you wanted to start/i.test(o?.b1 || '')) found = o;
}
check("'low in, better out' can now be said at all", found !== null,
  found ? found.b1.slice(0, 70) : 'never surfaced in 40 attempts');

console.log(failures === 0 ? '\nMOOD-1 GATE GREEN' : `\nMOOD-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
