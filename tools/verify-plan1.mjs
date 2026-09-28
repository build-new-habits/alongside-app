/**
 * tools/verify-plan1.mjs
 * 28 Sep 2026 v3
 *
 * v3 - Work list 2e. TESTS 2-4 asked workoutGenerator.getWorkoutFocusOrder()
 *   -- an engine nothing had called since 6 Sep. Re-pointed at the chooser
 *   the coach route runs, data/session-choice.js chooseSessionType():
 *   a planned day leads (reason "programme"), no plan leaves the rest of
 *   the chain to decide, malformed data never throws. "The other two are
 *   still offered" is now "Something different today" on the plan,
 *   driven by verify-plan-list; a planned core or upper day being THAT
 *   session is verify-week-plan-live. TEST 1 unchanged.
 *
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
const SC = await import(B + 'data/session-choice.js');

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

// ── 2. It reaches the chooser the coach route runs ───────────────────
seed([{ day: today, type: 'cardio', completed: false }]);
{ const pick = SC.chooseSessionType();
  check('and the planned day is the session the coach picks',
    pick.sessionType === 'cardio' && pick.reason === 'programme',
    `${pick.sessionType} (${pick.reason})`); }

// ── 3. It does NOT fire when there is no plan ────────────────────────
seed([]);
check('no sequence, no override', PE.plannedFocusToday() === null);
{ const pick = SC.chooseSessionType();
  check('and the rest of the chain decides',
    !!pick.sessionType && !String(pick.reason).startsWith('programme'),
    `${pick.sessionType} (${pick.reason})`); }

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
  try { PE.plannedFocusToday(); SC.chooseSessionType(); } catch (e) { threw = e; }
  check(`malformed sequence does not break the coach: ${JSON.stringify(bad)}`,
    !threw, threw ? String(threw) : '');
}

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
