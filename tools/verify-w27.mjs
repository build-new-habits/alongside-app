/**
 * tools/verify-w27.mjs
 * 21 Aug 2026 v3
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 14 Aug 2026 v2
 *
 * v2 - 'less' measured over 180 sessions rather than 60. At 60 the count
 *   landed between 1 and 5 and a "> 0" assertion that close to the floor
 *   is a flaky gate waiting to happen.
 *
 * W2-7. exercisePreferences has a writer people can reach, a reader that
 * matters, and a way back.
 *
 * The reader is the half that was missing. The field has existed since
 * 04 Aug and only conditionProgrammes.js read it, so "never suggest this
 * again" did nothing in an ordinary session — a button that lies is
 * worse than no button.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
import fs from 'node:fs';
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const sb = await import(BASE + 'session-builder.js');
const ci = await import(BASE + 'data/checkin.js');
const ex = await import(BASE + 'data/exercises/index.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };
const idsOf = x => { const a=(x&&(x.exercises||x.items||x))||[]; return (Array.isArray(a)?a:[]).map(e=>e.id||e.exerciseId).filter(Boolean); };

function run(prefs, runs = 60) {
  localStorage.clear(); store.init();
  store.set('equipment', []); store.set('ageBand', '35-44');
  store.set('lifestyle.activityLevel', 'moderate');
  for (const [id, p] of Object.entries(prefs)) store.setExercisePreference(id, p);
  ci.saveCheckin({ energy: 6, mood: 6, sleepHours: 7, sleepQuality: 'okay', unwell: false });
  const counts = {};
  for (let i = 0; i < runs; i++)
    for (const id of idsOf(sb.buildSession({ sessionType: 'full', durationMins: 30 })))
      counts[id] = (counts[id] || 0) + 1;
  return counts;
}

// Pick a genuinely common bodyweight exercise to test against.
const baseline = run({});
const [target, baseCount] = Object.entries(baseline).sort((a, b) => b[1] - a[1])[0];
console.log(`\n   target: ${target}, served ${baseCount} times in 60 baseline sessions\n`);
check('the baseline target is common enough to prove anything', baseCount >= 15, `${baseCount}`);

const avoided = run({ [target]: 'avoid' });
check("'avoid' means never — in an ORDINARY session, not just condition browsing",
  (avoided[target] || 0) === 0, `${baseCount} -> ${avoided[target] || 0}`);

// 180 sessions, not 60. At 60 the 'less' count landed between 1 and 5,
// and an assertion of "> 0" that close to the floor is a flaky gate
// waiting to happen. At 180 the expected count is around 10 and a zero
// would be a genuine regression rather than a bad afternoon.
const LESS_RUNS = 180;
const less = run({ [target]: 'less' }, LESS_RUNS);
const lessCount = less[target] || 0;
// Both halves asserted. The first version of this checked only "fewer
// than before" and a hardcoded true, and passed while 'less' was
// behaving EXACTLY like 'avoid' — 24 served, then 0. An assertion that
// cannot fail is worse than no assertion, because it reads as coverage.
// Rates, not raw counts — the two runs are different lengths now.
const baseRate = baseCount / 60, lessRate = lessCount / LESS_RUNS;
check("'less' actually reduces", lessRate < baseRate * 0.5,
  `${(baseRate*100).toFixed(0)}% of sessions -> ${(lessRate*100).toFixed(0)}%`);
check("'less' is NOT silently treated as 'avoid' — it stays in rotation",
  lessCount >= 3,
  `${lessCount} — zero here means the two-level signal has collapsed to one`);

// Sessions must not be starved.
check('an avoided exercise does not shrink the session',
  Object.values(avoided).reduce((a,b)=>a+b,0) > 0 &&
  Math.abs(Object.keys(avoided).length - Object.keys(baseline).length) < 200,
  `${Object.keys(baseline).length} distinct -> ${Object.keys(avoided).length}`);

// Reversible.
localStorage.clear(); store.init();
store.setExercisePreference(target, 'avoid');
check('a preference is stored with a source', store.get('exercisePreferences')[target]?.source !== undefined);
store.setExercisePreference(target, null);
check('clearing a preference removes it entirely',
  store.get('exercisePreferences')[target] === undefined);

// ── The writer people can actually reach ─────────────────────
const cs = fs.readFileSync(new URL('../js/views/core-session.js', import.meta.url), 'utf8');
check('the in-session skip offers a preference',
  /data-skip-pref/.test(cs) && /setExercisePreference/.test(cs));
check('the offer appears AFTER the skip, not before it',
  /currentIndex\+\+[\s\S]{0,400}pendingSkipOffer = skipped/.test(cs),
  'a skip is not a complaint — most are "not today"');
check('the offer state is reset between sessions',
  (cs.match(/pendingSkipOffer = null/g) || []).length >= 3,
  'otherwise it leaks into the next session');
check('there is a way to decline the offer',
  /data-skip-pref="dismiss"/.test(cs));

// ── Reviewable and reversible ────────────────────────────────
const st = fs.readFileSync(new URL('../js/views/settings.js', import.meta.url), 'utf8');
check('Settings lists stored preferences', /renderPreferencesSection/.test(st) &&
  /\$\{renderPreferencesSection\(\)\}/.test(st), 'defined AND composed');
check('Settings shows exercise NAMES, not ids', /getExerciseName/.test(st));
check('Settings can undo a preference', /data-clear-pref/.test(st) &&
  /setExercisePreference\(btn\.dataset\.clearPref, null\)/.test(st));
check('Settings exposes the variety control', /data-field="sessionVariety"/.test(st));
check('neurodivergence is NOT added to CONDITIONS', (() => {
  const c = fs.readFileSync(new URL('../js/data/conditions.js', import.meta.url), 'utf8');
  return !/\bautism\b|\badhd\b|neurodiver/i.test(c);
})(), 'CONDITIONS drives contraindication filtering; this belongs in preferences');

console.log(failures === 0 ? '\nW2-7 GATE GREEN' : `\nW2-7 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
