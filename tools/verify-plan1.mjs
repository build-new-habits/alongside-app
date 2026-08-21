/**
 * tools/verify-plan1.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 17 Aug 2026 v1
 *
 * PLAN-1. The weekly plan finally does something.
 *
 * activeProgramme.sessionSequence had a writer and no reader.
 * getWeekShape() derived session types, weekly-plan.js filled declared
 * gym days with them, and nothing consumed the result -- so somebody
 * could declare Tuesday as core work and be offered whatever the phase
 * bias felt like. The screen recorded intentions nobody acted on.
 *
 * NOTE ON SCOPE, worth recording: verify-write1.mjs did NOT catch this,
 * because sessionSequence is nested under activeProgramme and that gate
 * only walks TOP-LEVEL store fields. The reader/writer fault class is
 * guarded one level deep, not all the way down. Extending it is real
 * work and is flagged rather than pretended.
 */

// GATE-PATH, 21 Aug 2026. jsdom resolved through Node rather than by
// absolute path into one machine's node_modules.
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html>', { url: 'https://x/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true,writable:true});
Object.defineProperty(globalThis,'localStorage',{value:dom.window.localStorage,configurable:true,writable:true});

const B = new URL('../js/', import.meta.url).href;
const { store } = await import(B + 'store.js');
const PE = await import(B + 'data/programmeEngine.js');
const WG = (await import(B + 'data/workoutGenerator.js')).default
        || (await import(B + 'data/workoutGenerator.js')).workoutGenerator;

let failures = 0;
const check = (n, ok, d='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${d?' — ':''}${d}`); if(!ok) failures++; };

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const today = DAYS[new Date().getDay()];

function seed(seq) {
  localStorage.clear(); store.init();
  store.set('tier','personal');
  store.set('activeProgramme.programmeId','beginner-fitness');
  store.set('activeProgramme.currentWeek', 3);
  store.set('activeProgramme.sessionSequence', seq);
}

// ── 1. A declared day is read ────────────────────────────────────────
seed([{ day: today, type: 'cardio', completed: false }]);
check('a plan declared for today is read at all',
  PE.plannedFocusToday() === 'cardio',
  'the first reader sessionSequence has ever had');

seed([{ day: today, type: 'mobility', completed: false }]);
check('mobility maps to mobility', PE.plannedFocusToday() === 'mobility');

seed([{ day: today, type: 'glute', completed: false }]);
check('a body-part session maps to strength', PE.plannedFocusToday() === 'strength',
  'the map is coarse on purpose — a wrong guess costs a reordered list, not a wrong session');

// ── 2. It reaches the generator's ORDERING ───────────────────────────
seed([{ day: today, type: 'cardio', completed: false }]);
check('and the planned focus leads the coach\'s three options',
  WG.getWorkoutFocusOrder()[0] === 'cardio',
  WG.getWorkoutFocusOrder().join(' > '));

check('while the other two are still offered',
  WG.getWorkoutFocusOrder().length === 3 &&
  new Set(WG.getWorkoutFocusOrder()).size === 3,
  'a preference, not a replacement — a plan made on Sunday must not trap somebody on Tuesday');

// ── 3. It does NOT fire when there is no plan ────────────────────────
seed([]);
check('no sequence, no override', PE.plannedFocusToday() === null);
check('and the phase bias still decides',
  WG.getWorkoutFocusOrder().length === 3);

seed([{ day: 'Thursday' === today ? 'Friday' : 'Thursday', type: 'cardio', completed: false }]);
check('a plan for a DIFFERENT day is not applied today',
  PE.plannedFocusToday() === null,
  'Tuesday\'s plan is not Wednesday\'s instruction');

seed([{ day: today, type: 'cardio', completed: true }]);
check('and a session already done today is not re-offered',
  PE.plannedFocusToday() === null,
  'the plan is what is left to do, not a log');

// ── 4. Malformed data cannot break the coach ─────────────────────────
for (const bad of [null, 'not-an-array', [null], [{}], [{ day: today }]]) {
  seed(bad);
  let threw = null;
  try { PE.plannedFocusToday(); WG.getWorkoutFocusOrder(); } catch (e) { threw = e; }
  check(`malformed sequence does not break the coach: ${JSON.stringify(bad)}`,
    !threw, threw ? String(threw) : '');
}

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
