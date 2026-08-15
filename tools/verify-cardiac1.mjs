/**
 * tools/verify-cardiac1.mjs
 * 14 Aug 2026 v1
 *
 * CARDIAC-1. The clearance question is asked of the right people, and the
 * answer changes what is built — without taking away the things somebody
 * frightened of their own heart most needs.
 */
import fs from 'node:fs';
import { JSDOM } from '/home/claude/node_modules/jsdom/lib/api.js';
const dom = new JSDOM('<!doctype html>', { url: 'https://build-new-habits.github.io/alongside-app/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true, writable: true });

const BASE = new URL('../js/', import.meta.url).href;
const { store } = await import(BASE + 'store.js');
const D  = await import(BASE + 'data/onboarding-thread-data.js');
const sb = await import(BASE + 'session-builder.js');
const ci = await import(BASE + 'data/checkin.js');
const ex = await import(BASE + 'data/exercises/index.js');

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — '+d:''}`); if(!ok) failures++; };
const byId = new Map(ex.EXERCISES.map(e=>[e.id,e]));
const idsOf = x => { const a=(x&&(x.exercises||x.items||x))||[]; return (Array.isArray(a)?a:[]).map(e=>e.id||e.exerciseId).filter(Boolean); };

// ── Who gets asked ───────────────────────────────────────────
const step = D.STEPS['8a'];
check('step 8a writes exerciseClearance', step?.storeField === 'exerciseClearance');
check('8a sits directly after the conditions sheet',
  D.STEP_ORDER[D.STEP_ORDER.indexOf(8) + 1] === '8a');
check('a heart condition triggers it',
  step.showIf({ conditions: ['cardiovascular-condition'] }) === true);
check('a stiff shoulder does NOT trigger it',
  step.showIf({ conditions: ['shoulder'] }) === false,
  'this must not become a list of "serious" conditions');
check('no conditions means the question is never asked',
  step.showIf({ conditions: [] }) === false);

// ── What the answer changes ──────────────────────────────────
function build(clearance, equipment) {
  localStorage.clear(); store.init();
  store.set('conditions', ['cardiovascular-condition']);
  store.set('lifestyle.activityLevel', 'light');
  store.set('equipment', equipment);
  store.set('exerciseClearance', clearance);
  ci.saveCheckin({ energy: 6, mood: 6, sleepHours: 7, sleepQuality: 'okay', unwell: false });
  let loaded = 0, total = 0, movement = 0;
  for (let i = 0; i < 40; i++) {
    for (const id of idsOf(sb.buildSession({ sessionType: 'full', durationMins: 30 }))) {
      const e = byId.get(id); if (!e) continue;
      total++;
      const eq = (e.equipment || []).join(' ');
      if (/barbell|dumbbell|kettlebell|weight|machine|cable/i.test(eq)) loaded++;
      if (e.category === 'mobility' || e.category === 'cardio' || (e.equipment||[]).length === 0) movement++;
    }
  }
  return { loaded, total, movement };
}

const GYM = ['dumbbells', 'barbell', 'bench'];
const cleared = build('cleared', GYM);
const notYet  = build('not-yet', GYM);
const notAsked = build(null, GYM);

console.log(`\n   loaded-strength items, 40 sessions, full gym available:`);
console.log(`   cleared    ${cleared.loaded}/${cleared.total}`);
console.log(`   not-yet    ${notYet.loaded}/${notYet.total}`);
console.log(`   not asked  ${notAsked.loaded}/${notAsked.total}\n`);

check("'not-yet' withholds loaded strength work",
  notYet.loaded === 0 && cleared.loaded > 0,
  `cleared ${cleared.loaded}, not-yet ${notYet.loaded}`);
check("null is NOT a gate — not-asked is not the same as not-cleared",
  notAsked.loaded > 0,
  'reading null as not-yet would quietly restrict everyone who declared nothing');
check("'not-yet' still gets a real session, not an empty one",
  notYet.total > 0 && notYet.movement > 0,
  `${notYet.total} items, ${notYet.movement} movement`);
check("'not-sure' is treated the same as 'not-yet'",
  build('not-sure', GYM).loaded === 0);

// ── The coach says so, and does not frighten anyone ──────────
const src = fs.readFileSync(new URL('../js/data/onboarding-thread-data.js', import.meta.url), 'utf8');
const ack = D.STEPS ? null : null;
const notYetAck = (await import(BASE + 'data/onboarding-thread-data.js')).generateClearanceAck('not-yet');
check('a not-yet answer names something we WILL do today',
  /walking|mobility|breathing|wellbeing/i.test(notYetAck),
  'a redirect, not a rejection');
check('it does not tell them they cannot exercise',
  !/you cannot|you can't exercise|not allowed/i.test(notYetAck));
check('the cleared answer commits to the talk test',
  /hold a conversation/i.test((await import(BASE + 'data/onboarding-thread-data.js')).generateClearanceAck('cleared')),
  'the standard for unsupervised moderate intensity');

// ── The promise at step 8 is now true ────────────────────────
check('the conditions question no longer over-promises alone',
  /It genuinely changes what/.test(src) && /8a/.test(src),
  'the line is only true because 8a follows it');

console.log(failures === 0 ? '\nCARDIAC-1 GATE GREEN' : `\nCARDIAC-1 GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
