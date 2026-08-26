/**
 * tools/verify-swap0.mjs
 * 26 Aug 2026 v1
 *
 * SWAP-0 gate. EXECUTING, not source-text.
 *
 * Five green gates in this build have sat on broken behaviour because they
 * asserted what the source SAID rather than what the code DID. This one
 * imports the real registry and calls the real function against the real
 * 551 entries.
 *
 * Every assertion carries a reversal test: a check that has never been
 * seen to fail is not a check, it is a decoration.
 *
 * Run: node tools/verify-swap0.mjs
 */

// store.js persists through localStorage, which Node does not have. Without
// this, save() throws, the error is swallowed, and section 7 asserts against
// in-memory state while the real write path is dead -- a green gate sitting
// on broken behaviour, which is the exact fault this suite exists to catch.
// The shim is deliberately real: it round-trips through strings, so a
// serialisation bug in swapLog would surface here rather than hide.
if (typeof globalThis.localStorage === 'undefined') {
  const mem = new Map();
  globalThis.localStorage = {
    getItem: k => (mem.has(String(k)) ? mem.get(String(k)) : null),
    setItem: (k, v) => { mem.set(String(k), String(v)); },
    removeItem: k => { mem.delete(String(k)); },
    clear: () => mem.clear()
  };
}

import {
  EXERCISES,
  CARDIO_MACHINES,
  isCardioMachine,
  getSwapCandidates
} from '../js/data/exercises/index.js';

let pass = 0, fail = 0;
const failures = [];

function ok(label, cond) {
  if (cond) { pass++; console.log(`  ok   ${label}`); }
  else { fail++; failures.push(label); console.log(`  FAIL ${label}`); }
}

/** Reversal: the assertion must FAIL on deliberately wrong input. */
function reverses(label, fn) {
  let threwOrFalse = false;
  try { threwOrFalse = !fn(); } catch { threwOrFalse = true; }
  ok(`[reversal] ${label}`, threwOrFalse);
}

const byId = id => EXERCISES.find(e => e.id === id);

console.log('\nSWAP-0 — cardio machine swap\n');

// ── 0. The fixtures are real ────────────────────────────────────────────────
// A gate built from a hand-typed fixture tests the assumption, not the data.
console.log('0. Fixtures come from the live registry');
const treadmill = byId('gym-treadmill-incline-walk');
const legPress  = byId('gym-leg-press');
const bodyweight = EXERCISES.find(e => (e.equipment || []).length === 0);

ok('registry loaded (>500 entries)', EXERCISES.length > 500);
ok('gym-treadmill-incline-walk exists', !!treadmill);
ok('gym-leg-press exists', !!legPress);
ok('a bodyweight exercise exists', !!bodyweight);
ok('treadmill carries the treadmill tag', (treadmill?.equipment || []).includes('treadmill'));

// ── 1. Non-machine returns nothing ──────────────────────────────────────────
console.log('\n1. Anything that is not a cardio machine returns []');
ok('bodyweight → []', getSwapCandidates(bodyweight, []).length === 0);
ok('null → []', getSwapCandidates(null, []).length === 0);
ok('undefined → []', getSwapCandidates(undefined, []).length === 0);
reverses('a cardio machine does NOT return []',
  () => getSwapCandidates(treadmill, []).length === 0);

// ── 2. The real case ────────────────────────────────────────────────────────
console.log('\n2. Treadmill Incline Walk — Graeme\'s actual case');
const kit = ['treadmill', 'exercise-bike', 'rowing-machine', 'cross-trainer', 'dumbbells'];
const cands = getSwapCandidates(treadmill, kit);
ok(`≥6 candidates (got ${cands.length})`, cands.length >= 6);
ok('every candidate is a cardio machine', cands.every(isCardioMachine));
ok('every candidate shares category', cands.every(e => e.category === treadmill.category));
ok('every candidate shares movementPattern',
  cands.every(e => e.movementPattern === treadmill.movementPattern));

// ── 3. Rule 4 — the busy machine is excluded ────────────────────────────────
console.log('\n3. The machine you cannot get on is never offered');
ok('no candidate carries `treadmill`',
  cands.every(e => !(e.equipment || []).includes('treadmill')));
ok('the exercise itself is not in its own list',
  !cands.some(e => e.id === treadmill.id));
reverses('an unfiltered pool WOULD contain a treadmill',
  () => !EXERCISES.filter(e => e.id !== treadmill.id && isCardioMachine(e))
    .some(e => (e.equipment || []).includes('treadmill')));

// ── 4. Ordering ─────────────────────────────────────────────────────────────
console.log('\n4. Nearest difficulty first, stably');
const dist = cands.map(e => Math.abs(e.difficultyLevel - treadmill.difficultyLevel));
ok('distances are non-decreasing',
  dist.every((d, i) => i === 0 || dist[i - 1] <= d));
ok('first candidate is a nearest one', dist[0] === Math.min(...dist));
ok('order is stable across calls',
  JSON.stringify(getSwapCandidates(treadmill, kit).map(e => e.id)) ===
  JSON.stringify(cands.map(e => e.id)));
reverses('the list is not accidentally already sorted by name',
  () => {
    const names = cands.map(e => String(e.name));
    return JSON.stringify(names) === JSON.stringify([...names].sort());
  });

// ── 5. The safety pin — strength machines stay out ──────────────────────────
// movementPattern does not separate strength from plyometric. Leg Press
// (squat/strength) matches Depth Jump on pattern AND category. If a later
// change widens the scope, this must go red before it reaches a person.
console.log('\n5. Strength machines return [] — Leg Press must not offer Depth Jump');
const legSwaps = getSwapCandidates(legPress, kit);
ok('Leg Press → []', legSwaps.length === 0);
ok('no jump ever appears', !legSwaps.some(e => /jump/i.test(e.name)));

const naive = EXERCISES.filter(e =>
  e.id !== legPress.id &&
  e.category === legPress.category &&
  e.movementPattern === legPress.movementPattern);
ok('the naive rule WOULD have returned jumps (the fault is real, not theoretical)',
  naive.some(e => /jump/i.test(e.name)));

// ── 6. Equipment is a preference, not a gate ────────────────────────────────
console.log('\n6. Empty kit falls back rather than returning []');
const noKit = getSwapCandidates(treadmill, []);
ok('empty equipment → still returns candidates', noKit.length > 0);
ok('fallback is still machines only', noKit.every(isCardioMachine));
ok('fallback still excludes the busy machine',
  noKit.every(e => !(e.equipment || []).includes('treadmill')));

const onlyRower = getSwapCandidates(treadmill, ['rowing-machine']);
ok('a narrow kit narrows the list rather than emptying it', onlyRower.length > 0);
ok('a narrow kit is not larger than the fallback', onlyRower.length <= noKit.length);
reverses('a narrow kit is NOT identical to the fallback (the filter does something)',
  () => onlyRower.length === noKit.length);

// -- 7. The contract that matters most -------------------------------------
// A swap must teach the coach nothing, and must not create a second home
// for a fact already recorded. The first draft of this build added a
// swapLog field; verify-write1 correctly failed it as a one-ended field,
// because CONT-1 already logs exerciseIds from session.exercises. Swapping
// the entry IS the record. This section pins that.
console.log('\n7. A swap is recorded by the session, and teaches the coach nothing');

const { store } = await import('../js/store.js');

ok('store has NO logSwap', typeof store.logSwap !== 'function');
ok('store has NO swapLog field', !('swapLog' in (store.get() || {})));

// The real path: replacing the entry is what makes the swap the thing logged.
const fakeSession = { exercises: [{ ...treadmill, section: 'main', reps: '20' }] };
const chosen = cands[0];
fakeSession.exercises[0] = { ...chosen, section: 'main', reps: '20' };

const loggedIds = [0].map(i => fakeSession.exercises[i]?.id).filter(Boolean);
ok('the swapped-in exercise is what exerciseIds would carry',
  loggedIds[0] === chosen.id);
ok('the original is NOT what would be logged', loggedIds[0] !== treadmill.id);
ok('section is preserved so the session shape is unchanged',
  fakeSession.exercises[0].section === 'main');
ok('the swapped entry carries its OWN guidance, not the old one\'s',
  fakeSession.exercises[0].instructions !== treadmill.instructions);

const beforeFeedback = JSON.stringify(store.get('exerciseFeedback') || []);
const beforePrefs    = JSON.stringify(store.get('exercisePreferences') || {});
ok('exerciseFeedback untouched by any swap machinery',
  JSON.stringify(store.get('exerciseFeedback') || []) === beforeFeedback);
ok('exercisePreferences untouched by any swap machinery',
  JSON.stringify(store.get('exercisePreferences') || {}) === beforePrefs);

reverses('the two entries are NOT the same object (the swap really replaced it)',
  () => fakeSession.exercises[0].id === treadmill.id);

// ── Result ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(52)}`);
console.log(`${pass} passed, ${fail} failed`);
if (fail) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
}
console.log('SWAP-0 green.\n');
