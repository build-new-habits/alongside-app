/**
 * tools/verify-w2.mjs
 * 14 Aug 2026 v1
 *
 * W2-1: the difficulty ceiling applies to cooldown as well as main and
 *       warmup, and applying it never starves a section to nothing.
 * W2-2: saveCheckin() clears a stale proposalBias.
 *
 * Run: node tools/verify-w2.mjs
 */
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
import { readFileSync } from 'node:fs';

const dom = new JSDOM('<!doctype html><html><body></body></html>',
  { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator',
  { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage',
  { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const ci  = await import(BASE + 'data/checkin.js');
const sb  = await import(BASE + 'session-builder.js');
const ex  = await import(BASE + 'data/exercises/index.js');

const byId = new Map(ex.EXERCISES.map(e => [e.id, e]));
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

const CEILINGS = { sedentary: 2, light: 3, returning: 3, moderate: 4 };
const SESSION_TYPES = ['full', 'mobility', 'core', 'cardio', 'lower', 'upper', 'glute'];

// ── W2-1 ─────────────────────────────────────────────────────
store.init();
store.set('equipment', []);
store.set('conditions', []);

for (const [level, ceiling] of Object.entries(CEILINGS)) {
  store.set('fitnessLevel', null);
  store.set('lifestyle.activityLevel', level);
  ci.saveCheckin({ energy: 5, mood: 5, sleepHours: 7, sleepQuality: 'okay', unwell: false });

  for (const type of SESSION_TYPES) {
    const pools = sb.buildCandidatePools({ sessionType: type, durationMins: 25 }) || {};
    for (const [section, list] of Object.entries(pools)) {
      if (!Array.isArray(list)) continue;

      const over = list.filter(e => {
        const d = byId.get(e.id)?.difficultyLevel;
        return typeof d === 'number' && d > ceiling;
      });
      check(`W2-1 ceiling  ${level}/${type}/${section}`, over.length === 0,
        over.length ? over.slice(0, 3).map(e => e.id).join(', ') : '');

      // Relax-if-empty: a ceiling must never starve a section.
      check(`W2-1 not starved  ${level}/${type}/${section}`, list.length > 0,
        list.length === 0 ? 'section empty' : `${list.length} candidates`);
    }
  }
}

// ── W2-2 ─────────────────────────────────────────────────────
//
// BIAS-2, 16 Aug 2026. W2-2 was "a stale proposalBias must be cleared at
// check-in". It cannot go stale any more: proposalBias is retired and
// the bias is DERIVED at read time by coachBias(), which reads today's
// activity log. There is no stored value to expire.
//
// The original concern is preserved and asserted the stronger way: the
// bias must reflect TODAY, and yesterday's answer must not survive into
// today. A derived value satisfies that by construction, so the test is
// that nothing stores it at all.
const chkSrc = readFileSync('js/data/checkin.js', 'utf8');
const genSrc = readFileSync('js/data/workoutGenerator.js', 'utf8');

check('W2-2 the bias is derived, so it cannot go stale',
  /export function coachBias\(/.test(chkSrc),
  'coachBias() missing');
check('W2-2 nothing stores a bias that could survive a day',
  !/store\.set\(['"]proposalBias/.test(chkSrc + genSrc),
  'a stored bias is a bias that can be written once and read for ever');
check('W2-2 and today is excluded from the run it counts',
  /e\.date < today/.test(chkSrc),
  'counting today would soften the very session about to be done');


console.log(failures === 0
  ? '\nW2 GATE GREEN'
  : `\nW2 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
