/**
 * tools/verify-w3b.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 14 Aug 2026 v1
 *
 * W3-B. trainingIntent has a writer, and choosing 'maintain' measurably
 * changes what a person is given.
 *
 * The second half matters more than the first. A writer that stores a
 * value nothing acts on is the same defect in a different place, and
 * intentPriority() only TILTS selection rather than filtering it, so the
 * effect has to be measured across many sessions rather than asserted
 * from one.
 *
 * Run: node tools/verify-w3b.mjs
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
import fs from 'node:fs';
const { JSDOM } = __require("jsdom");

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
const D  = await import(BASE + 'data/onboarding-thread-data.js');
const sb = await import(BASE + 'session-builder.js');
const ci = await import(BASE + 'data/checkin.js');
const ex = await import(BASE + 'data/exercises/index.js');

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

// ── There is a writer ────────────────────────────────────────
const step = D.STEPS['9f'];
check('step 9f exists and writes trainingIntent',
  step?.storeField === 'trainingIntent');
check('9f is in STEP_ORDER', D.STEP_ORDER.includes('9f'));
check('9f is asked of everyone — no showIf',
  typeof step.showIf !== 'function',
  'reviewed against all sixteen personas: none of the three options is a verdict');

const ids = (step.chips || []).map(c => c.id);
check('vocabulary matches the contract',
  JSON.stringify(ids) === JSON.stringify(['improve', 'maintain', 'recover']), ids.join('|'));

check('intent is never inferred from age or activity level',
  typeof step.showIf !== 'function' &&
  !/ageBand/.test(String(step.coach)),
  'deriving maintain from 70plus is the age filtering this product refuses');

// ── The value changes something ──────────────────────────────
const byId = new Map(ex.EXERCISES.map(e => [e.id, e]));
const idsOf = x => {
  const a = (x && (x.exercises || x.items || x)) || [];
  return (Array.isArray(a) ? a : []).map(e => e.id || e.exerciseId).filter(Boolean);
};
const MAINTAIN = /carry|grip|hold|balance|single-leg|sit-to-stand|chair|step-up|get ?up|floor|calf raise|power|throw|slam|reach/i;

function share(intent, matcher) {
  localStorage.clear();          // fixture drift: store.init() MERGES
  store.init();
  store.set('equipment', []);
  store.set('lifestyle.activityLevel', 'light');
  store.set('trainingIntent', intent);
  ci.saveCheckin({ energy: 6, mood: 6, sleepHours: 7, sleepQuality: 'okay', unwell: false });
  let hit = 0, total = 0;
  for (let i = 0; i < 60; i++) {
    for (const id of idsOf(sb.buildSession({ sessionType: 'full', durationMins: 30 }))) {
      const e = byId.get(id);
      if (!e) continue;
      total++;
      if (matcher.test(e.name + ' ' + e.id) ||
          ['carry', 'balance', 'proprioception'].includes(e.movementPattern)) hit++;
    }
  }
  return total ? (hit / total) * 100 : 0;
}

const improve  = share('improve',  MAINTAIN);
const maintain = share('maintain', MAINTAIN);
console.log(`\n   independence-capacity share of exercises, 60 sessions each:`);
console.log(`   improve  ${improve.toFixed(1)}%`);
console.log(`   maintain ${maintain.toFixed(1)}%\n`);

check("'maintain' measurably raises independence-capacity work",
  maintain > improve + 3,
  `${improve.toFixed(1)}% -> ${maintain.toFixed(1)}%`);

const RECOVER = /rehab|progression|activation|isometric|controlled|range/i;
function rehabShare(intent) {
  localStorage.clear();
  store.init();
  store.set('equipment', []);
  store.set('lifestyle.activityLevel', 'light');
  store.set('trainingIntent', intent);
  ci.saveCheckin({ energy: 6, mood: 6, sleepHours: 7, sleepQuality: 'okay', unwell: false });
  let hit = 0, total = 0;
  for (let i = 0; i < 60; i++) {
    for (const id of idsOf(sb.buildSession({ sessionType: 'full', durationMins: 30 }))) {
      const e = byId.get(id);
      if (!e) continue;
      total++;
      if (RECOVER.test(e.name + ' ' + e.id) || e.category === 'rehabilitation') hit++;
    }
  }
  return total ? (hit / total) * 100 : 0;
}
const rImprove = rehabShare('improve');
const rRecover = rehabShare('recover');
console.log(`   rehab-leaning share:  improve ${rImprove.toFixed(1)}%  recover ${rRecover.toFixed(1)}%\n`);
check("'recover' measurably leans on the rehabilitation library",
  rRecover > rImprove + 3, `${rImprove.toFixed(1)}% -> ${rRecover.toFixed(1)}%`);

// ── The person is told, in a way that is not consolation ─────
const src = fs.readFileSync(new URL('../js/data/onboarding-thread-data.js', import.meta.url), 'utf8');
check('each intent gets its own acknowledgement',
  /generateIntentAck/.test(src) && /maintain/.test(src) && /recover/.test(src));
check("the 'maintain' acknowledgement does not read as settling",
  /rather than quietly making everything easier/.test(src),
  'maintain unlocks harder work for a deconditioned person, not less');

const threadSrc = fs.readFileSync(new URL('../js/views/onboarding/thread.js', import.meta.url), 'utf8');
check('the acknowledgement is actually wired into the thread',
  /generateIntentAck\(/.test(threadSrc) && /step\.id === '9f'/.test(threadSrc),
  'a generator nobody calls is how capability.* stayed dead for three days');

console.log(failures === 0 ? '\nW3-B GATE GREEN' : `\nW3-B GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
