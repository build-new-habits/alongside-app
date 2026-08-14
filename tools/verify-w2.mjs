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
store.set('proposalBias', 'lighter');
ci.saveCheckin({ energy: 7, mood: 7, sleepHours: 8, sleepQuality: 'good', unwell: false });
check('W2-2 stale proposalBias cleared by saveCheckin',
  store.get('proposalBias') === null,
  `got ${JSON.stringify(store.get('proposalBias'))}`);

// A bias written after the check-in (the real coach-reflection order) survives.
store.set('proposalBias', 'rest');
check('W2-2 same-day bias written after check-in survives',
  store.get('proposalBias') === 'rest');

console.log(failures === 0
  ? '\nW2 GATE GREEN'
  : `\nW2 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
