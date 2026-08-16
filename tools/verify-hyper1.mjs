/**
 * tools/verify-hyper1.mjs
 * 16 Aug 2026 v1
 *
 * HYPER-1. Hypermobility/EDS and end-range passive stretching.
 *
 * Physiotherapist review, 16 Aug 2026, verbatim:
 *
 *   "Hypermobility/EDS: Focus on active control, proprioception, and
 *    closed-chain stability, strictly avoiding end-range passive
 *    stretching."
 *
 * This gate runs the REAL filter over the REAL library — filterByConditions()
 * as session generation calls it, not getExerciseSafetyTier() in isolation.
 * The distinction matters: the rule could be perfectly correct and still
 * never fire, if the condition never reaches the filter. That is exactly
 * how the gap being closed here survived in the first place.
 *
 * It also PINS THE GAP ITSELF for the three conditions that are still
 * open, so nobody reads their silence as safety. Those assertions are
 * expected to fail the day somebody fixes them, which is the point:
 * they carry the reviewer follow-up as a failing test rather than a note
 * in a document.
 */
import fs from 'node:fs';
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const C  = await import(BASE + 'data/conditions.js');
const EX = await import(BASE + 'data/exercises/index.js');
const ALL = (await import(BASE + 'data/exercises.js'));

let failures = 0;
const check = (n, ok, d = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`);
  if (!ok) failures++;
};

// The library, however it is exported.
const pool = ALL.EXERCISES || ALL.default || ALL.ALL_EXERCISES;
check('the exercise library loaded', Array.isArray(pool) && pool.length > 400,
  `${Array.isArray(pool) ? pool.length : 'not an array'} entries`);

const stretches = pool.filter(e => e.movementPattern === 'stretch');
check('and it contains stretch-pattern exercises to exclude',
  stretches.length > 0, `${stretches.length} found`);

// ── The condition must actually REACH the filter ─────────────────────
//
// getActiveConditionIds() seeds from the declared list, so a systemic
// condition with no pain score is still active. Asserted rather than
// assumed, because if this stopped being true the rule below would
// silently never fire and every assertion after it would still pass.
const active = C.getActiveConditionIds(['hypermobility'], {});
check('a declared hypermobility reaches the filter with no pain score',
  active.includes('hypermobility'),
  'a rule the condition never reaches is not a rule');

// ── The rule, through the real filter ────────────────────────────────
const { safe, caution } = EX.filterByConditions(pool, active);
const servedIds = new Set([...safe, ...caution].map(e => e.id));
const stretchesServed = stretches.filter(e => servedIds.has(e.id));

check('no stretch-pattern exercise is served to somebody with hypermobility',
  stretchesServed.length === 0,
  stretchesServed.length ? stretchesServed.slice(0, 4).map(e => e.id).join(', ') : `${stretches.length} excluded`);

// The positive half. Without this, the assertion above would pass if
// the filter simply returned nothing at all.
check('and they are still served plenty of other work',
  safe.length + caution.length > 200,
  `${safe.length + caution.length} exercises still available`);

// And the exclusion must be specific to hypermobility, not a filter
// that has quietly started dropping stretches for everybody.
// Deliberately an UNRELATED condition rather than an empty list.
// filterByConditions() returns early on an empty list without running
// any rule at all, so `[]` would have proved nothing here — reversal
// testing caught exactly that: breaking the rule to fire for everybody
// left this assertion passing.
const other = C.getActiveConditionIds(['knee'], {});
const noneActive = EX.filterByConditions(pool, other);
const servedToAll = new Set([...noneActive.safe, ...noneActive.caution].map(e => e.id));
check('somebody without hypermobility still gets stretches',
  stretches.some(e => servedToAll.has(e.id)),
  'the rule is conditional, not a library-wide removal');

// ── The gap that is NOT fixed, pinned so it cannot be forgotten ──────
//
// These three are collected at onboarding, trigger the exercise-clearance
// question, and change nothing about what is served. The reviewer gave
// specific guidance for hypermobility only; inventing the rest would be
// worse than leaving them open. See the rehab blueprint §10.
//
// EXPECTED TO FAIL when somebody fixes them — that is the design. The
// message tells the next person what to do.
const src = fs.readFileSync('js/data/conditions.js', 'utf8');
for (const id of ['chronic-fatigue', 'fibromyalgia', 'osteoporosis']) {
  const referenced = pool.some(e =>
    (e.avoid || e.contraindications || []).includes(id) || (e.caution || []).includes(id)
  ) || new RegExp(`includes\\(['"]${id}['"]\\)`).test(src);
  check(`${id} is STILL unhandled, and that is recorded not forgotten`,
    !referenced,
    referenced
      ? 'somebody has handled it — good. Update the rehab blueprint §10 and delete this assertion.'
      : 'no exercise excludes it and no rule covers it; awaiting reviewer guidance');
}

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
