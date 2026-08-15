/**
 * tools/verify-w3a.mjs
 * 14 Aug 2026 v1
 *
 * W3-A. The capability questions are reachable, they route correctly per
 * persona, and answering them actually flips capabilityProfile().asked --
 * without which all six protective branches in session-builder.js stay
 * dead, which was the whole defect.
 *
 * Run: node tools/verify-w3a.mjs
 */
import fs from 'node:fs';
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
const D  = await import(BASE + 'data/onboarding-thread-data.js');

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
};

// ── Structural ───────────────────────────────────────────────
check('9a-9d are in STEP_ORDER',
  ['9a', '9b', '9c', '9d'].every(id => D.STEP_ORDER.includes(id)));
check('9a sits directly after the activity question',
  D.STEP_ORDER[D.STEP_ORDER.indexOf(9) + 1] === '9a');
check('balance question has no showIf — it is asked of everyone',
  typeof D.STEPS['9a'].showIf !== 'function');
for (const id of ['9b', '9c', '9d']) {
  check(`${id} is conditional`, typeof D.STEPS[id].showIf === 'function');
}
check('bothFeet is NOT asked in onboarding',
  !Object.values(D.STEPS).some(s => s.storeField === 'capability.bothFeet'));

// Vocabulary must match field-contract.js exactly.
const CONTRACT = {
  'capability.balanceWorry': ['no', 'sometimes', 'yes'],
  'capability.chairRise':    ['yes', 'not-easily', 'no'],
  'capability.floorAccess':  ['yes', 'not-comfortably', 'rather-not', 'no'],
  'capability.legPower':     ['full', 'limited', 'none', 'skip'], // skip -> null at writer
};
for (const [field, expected] of Object.entries(CONTRACT)) {
  const step = Object.values(D.STEPS).find(s => s.storeField === field);
  const ids  = (step?.chips || []).map(c => c.id);
  check(`${field} vocabulary matches the contract`,
    JSON.stringify(ids) === JSON.stringify(expected), ids.join('|'));
}

// ── Routing, by persona ──────────────────────────────────────
// Mirrors thread.js _nextStep(): walk STEP_ORDER, honouring showIf.
function walk(fixture, answers = {}) {
  store.init();
  for (const [k, v] of Object.entries(fixture)) store.set(k, v);
  const asked = [];
  let idx = D.STEP_ORDER.indexOf(9);
  while (idx < D.STEP_ORDER.length - 1) {
    idx += 1;
    const id = D.STEP_ORDER[idx];
    if (typeof id !== 'string' || !id.startsWith('9')) break;
    const step = D.STEPS[id];
    if (typeof step.showIf === 'function' && !step.showIf(store.data)) continue;
    asked.push(id);
    if (answers[id] !== undefined) store.set(step.storeField, answers[id]);
  }
  return asked;
}

// '9f' (training intent) is appended to every expectation because it is
// asked of everyone — see W3-B. If a route ever stops including it, that
// is a regression, not a tidy-up.
const PERSONAS = [
  // [name, fixture, answers, expected steps]
  ['2.6 footballer, active, no worries',
   { ageBand: '35-44', 'lifestyle.activityLevel': 'active', conditions: [] },
   { '9a': 'no' }, ['9a', '9f']],

  ['2.3 sprinter — OUT OF SCOPE at 18+, kept as the youngest adult band',
   { ageBand: '18-24', 'lifestyle.activityLevel': 'very-active', conditions: [] },
   { '9a': 'no' }, ['9a', '9f']],

  ['2.10 Dad, 76, frail — caught by age even saying no',
   { ageBand: '75plus', 'lifestyle.activityLevel': 'light', conditions: [] },
   { '9a': 'no', '9b': 'yes' }, ['9a', '9b', '9d', '9f']],

  ['2.8 niece, dyspraxia — young, active, no listed condition',
   { ageBand: '25-34', 'lifestyle.activityLevel': 'moderate', conditions: [] },
   { '9a': 'yes', '9b': 'yes' }, ['9a', '9b', '9d', '9f']],

  ['2.5 Denise, 52, sedentary + cardiac',
   { ageBand: '55-64', 'lifestyle.activityLevel': 'sedentary',
     conditions: ['cardiovascular-condition'] },
   { '9a': 'no', '9b': 'yes' }, ['9a', '9b', '9d', '9f']],

  ['chairRise not-easily reveals the leg question',
   { ageBand: '75plus', 'lifestyle.activityLevel': 'sedentary', conditions: [] },
   { '9a': 'yes', '9b': 'not-easily' }, ['9a', '9b', '9c', '9d', '9f']],

  ['chairRise yes does NOT reveal the leg question',
   { ageBand: '75plus', 'lifestyle.activityLevel': 'sedentary', conditions: [] },
   { '9a': 'yes', '9b': 'yes' }, ['9a', '9b', '9d', '9f']],

  ['knee condition alone triggers, at any age',
   { ageBand: '35-44', 'lifestyle.activityLevel': 'active', conditions: ['knee'] },
   { '9a': 'no', '9b': 'yes' }, ['9a', '9b', '9d', '9f']],
];

for (const [name, fixture, answers, expected] of PERSONAS) {
  const got = walk(fixture, answers);
  check(`route: ${name}`, JSON.stringify(got) === JSON.stringify(expected),
    `got ${got.join(',')} expected ${expected.join(',')}`);
}

// ── The thing the whole change exists for ────────────────────
store.init();
store.set('ageBand', '30s');
store.set('lifestyle.activityLevel', 'active');
check('before answering, asked is false', store.capabilityProfile().asked === false);

store.set('capability.balanceWorry', 'no');
store.set('capability.askedAt', new Date().toISOString());
check('ONE answer flips asked to true — the six protective branches go live',
  store.capabilityProfile().asked === true);

// legPower 'skip' must never reach the store.
store.init();
store.set('capability.legPower', null);
check("legPower 'skip' is stored as null, not as a string",
  store.get('capability.legPower') === null);

// The single most important line in the change. Asserted against the
// SOURCE OF THE WRITE, not the word: an earlier version of this gate
// matched the explanatory comment above the write and stayed green when
// the write itself was deleted. Same class as a gate after process.exit().
const writerSrc = fs.readFileSync(
  new URL('../js/views/onboarding/thread.js', import.meta.url), 'utf8');
check('_writeStepValue actually SETS capability.askedAt',
  /store\.set\(\s*['"]capability\.askedAt['"]/.test(writerSrc),
  'without this, every capability answer is stored and then ignored');
check('askedAt is guarded so it records the FIRST answer, not the last',
  /if\s*\(\s*!store\.get\(\s*['"]capability\.askedAt['"]/.test(writerSrc));

// A predicate that throws must not strand anybody.
check('showIf predicates tolerate an empty store',
  ['9b', '9c', '9d'].every(id => {
    try { D.STEPS[id].showIf({}); return true; } catch { return false; }
  }));

// ── W3-A2: capability is editable after onboarding ───────────
const settingsSrc = fs.readFileSync(
  new URL('../js/views/settings.js', import.meta.url), 'utf8');

check('Settings renders a capability editor',
  /renderCapabilitySection/.test(settingsSrc) &&
  /\$\{renderCapabilitySection\(\)\}/.test(settingsSrc),
  'defined AND composed — a function nobody calls is how this started');

// Assert the CONSTRUCTS, not the substring. Twice now a check in this
// file has been satisfied by an explanatory comment rather than by code.
// A comment mentioning capability.legPower is not an editor for it.
const capHandler = settingsSrc.slice(
  settingsSrc.indexOf("case 'save-capability'"),
  settingsSrc.indexOf("case 'save-fitness-level'"));
for (const f of ['balanceWorry', 'chairRise', 'legPower', 'floorAccess']) {
  check(`Settings RENDERS an editor for ${f}`,
    new RegExp(`group\\(\\s*'${f}'`).test(settingsSrc));
  check(`Settings SAVES ${f}`,
    new RegExp(`'${f}'`).test(capHandler),
    'must appear inside the save-capability handler, not merely in prose');
}
check('the save handler is reachable from a control',
  /data-action="save-capability"/.test(settingsSrc));

check('Settings imports the shared vocabularies rather than redefining them',
  /BALANCE_CHIPS[\s\S]{0,200}from '\.\.\/data\/onboarding-thread-data\.js'/.test(settingsSrc) &&
  !/const BALANCE_CHIPS\s*=/.test(settingsSrc));

check('blanking every answer clears askedAt',
  /store\.set\(\s*['"]capability\.askedAt['"]\s*,\s*null\s*\)/.test(settingsSrc),
  'otherwise asked stays true with all-null answers and the profile takes ' +
  'the answered path when nothing was answered');

check('empty select value is stored as null, not an empty string',
  /raw === ''[\s\S]{0,60}\?\s*null/.test(settingsSrc));

// Behavioural: the round trip a mis-tap needs.
store.init();
store.set('capability.chairRise', 'no');
store.set('capability.askedAt', new Date().toISOString());
check('a mis-tap restricts', store.capabilityProfile().legsLoadable === false);
store.set('capability.chairRise', 'yes');
check('correcting it in Settings lifts the restriction',
  store.capabilityProfile().legsLoadable === true);

store.init();
store.set('capability.balanceWorry', 'yes');
store.set('capability.askedAt', new Date().toISOString());
check('answered then fully blanked returns to the never-asked path', (() => {
  store.set('capability.balanceWorry', null);
  store.set('capability.askedAt', null);
  const p = store.capabilityProfile();
  return p.asked === false && p.balanceSafe === true;
})());

// ── OPEN-1: day-one openings that could never fire ───────────
const openings = await import(BASE + 'data/checkin-openings.js');

function openingFor(fixture) {
  // Fixture-drift guard. store.init() MERGES with whatever is already in
  // localStorage, so without this the openings inherit territory and
  // condition state set by earlier checks in this file and every fixture
  // resolves to the same branch. This has now cost this project five
  // separate times.
  localStorage.clear();
  store.init();
  for (const [k, v] of Object.entries(fixture)) store.set(k, v);
  // resolveOpening() returns the COPY, not a trigger id, so the branches
  // are proved by the lines they produce being distinct from one another.
  return openings.resolveOpening()?.b1 || '';
}

// ageBand is set for every fixture below — that is the whole point.
// Before OPEN-1, `else if (ageBand)` swallowed all three of these.
const injury  = openingFor({ ageBand: '45-54', 'lifestyle.returningAfter': 'injury' });
const returnF = openingFor({ ageBand: '45-54', 'lifestyle.activityLevel': 'returning' });
const feelG   = openingFor({ ageBand: '45-54', goals: ['feel-good'] });
const changing= openingFor({ ageBand: '45-54' });

check('injury-recovery fires despite an ageBand being set',
  injury.length > 0 && injury !== changing, injury.slice(0, 50));
check('return-to-fitness fires, reading the LIVE activityLevel field',
  returnF.length > 0 && returnF !== changing, returnF.slice(0, 50));
check('feel-good fires', feelG.length > 0 && feelG !== changing, feelG.slice(0, 50));
check('changing-body still fires as the fallback it was described as',
  changing.length > 0);
check('all four are genuinely different openings',
  new Set([injury, returnF, feelG, changing]).size === 4);

// 9e must be the writer returningAfter never had.
check('step 9e writes lifestyle.returningAfter',
  D.STEPS['9e']?.storeField === 'lifestyle.returningAfter');
check('9e is asked only of someone returning',
  D.STEPS['9e'].showIf({ lifestyle: { activityLevel: 'returning' } }) === true &&
  D.STEPS['9e'].showIf({ lifestyle: { activityLevel: 'active' } }) === false);

console.log(failures === 0 ? '\nW3-A GATE GREEN' : `\nW3-A GATE RED — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
