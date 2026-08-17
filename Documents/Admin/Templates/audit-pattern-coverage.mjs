/**
 * Documents/Admin/Templates/audit-pattern-coverage.mjs
 * 18 Aug 2026 v1
 *
 * THE LIBRARY QUESTION, made mechanical.
 *
 * "393 of 551 entries sit at difficulty 1–2" is a number that sounds
 * alarming and tells you nothing about what one person experiences. It
 * counts the shelf, not the reach. This counts the reach.
 *
 * ── WHY THIS EXISTS, AND THE MISTAKE IT CORRECTS ──────────────────────
 *
 * On 18 Aug I reported that the database has "no movement-pattern
 * taxonomy at all". That was FALSE. `movementPattern` is present on all
 * 551 entries and has been throughout. I had grepped for
 * `movementPatterns` and `patterns`, found nothing, and reported an
 * absence from a failed guess at a field name.
 *
 * Same fault as the four gates that read a deleted file and stayed
 * green: a null result treated as evidence without confirming the probe
 * was pointed at the right thing. A number is not evidence until you
 * know which code produced it, and neither is a zero.
 *
 * So this tool exists partly so the question is never answered from a
 * grep again. It reads the field.
 *
 * ── WHAT IT MEASURES ──────────────────────────────────────────────────
 *
 * For each primary strength pattern, how many items exist at difficulty
 * 3+ that a person can actually reach with equipment they plausibly own.
 * A pattern with eleven options at difficulty 4 that all need a barbell
 * and a squat rack is, for most of this product's audience, a pattern
 * with zero options.
 *
 * COMMON_KIT is a judgement and is stated here rather than buried:
 * bodyweight, dumbbells, resistance bands, a chair or bench, a mat.
 * That is the floor a time-poor parent or somebody avoiding gyms is
 * likely to have. Kettlebell and pull-up bar are counted separately as
 * "one step up" rather than as common.
 *
 * ── HOW TO USE IT ─────────────────────────────────────────────────────
 *
 *   node Documents/Admin/Templates/audit-pattern-coverage.mjs
 *
 * It reports, it does not gate. It is deliberately NOT in tools/,
 * because the honest current answer is "there are holes" and a suite
 * that is red by design teaches people to ignore red. Promote it to a
 * gate once the content lands — the floor to assert is at the bottom.
 */
import { EXERCISES } from '../../../js/data/exercises/index.js';

const PRIMARY = [
  'squat', 'hinge', 'push', 'pull', 'lunge', 'carry',
  'anti-extension', 'anti-rotation', 'anti-lateral-flexion'
];

// Free, or cheap and portable. The floor most people actually have.
const COMMON_KIT = new Set([
  'none', 'bodyweight', 'mat', 'chair', 'bench',
  'dumbbell', 'resistance-band', 'towel', 'wall', 'step'
]);

// Owned by the committed, not by the median.
const ONE_STEP_UP = new Set(['kettlebell', 'pull-up-bar', 'stability-ball']);

const kitOf = ex => {
  const q = (ex.equipment || []).filter(Boolean);
  return q.length ? q : ['bodyweight'];
};
const reach = ex => {
  const k = kitOf(ex);
  if (k.every(q => COMMON_KIT.has(q))) return 'common';
  if (k.every(q => COMMON_KIT.has(q) || ONE_STEP_UP.has(q))) return 'one-step-up';
  return 'gym-or-rare';
};

// The floor a pattern needs before a twelve-week chapter stops repeating
// itself. Three is not ambitious; it is the point below which the engine
// has no choice left to make.
const FLOOR = 3;

const strength = EXERCISES.filter(e => e.category === 'strength');

console.log('MOVEMENT PATTERN COVERAGE — strength, difficulty 3 and above\n');
console.log('pattern'.padEnd(24) + 'common  +1 step  gym/rare   total   floor');
console.log('-'.repeat(70));

const holes = [];
for (const p of PRIMARY) {
  const set = strength.filter(e => e.movementPattern === p && e.difficultyLevel >= 3);
  const c = set.filter(e => reach(e) === 'common').length;
  const u = set.filter(e => reach(e) === 'one-step-up').length;
  const g = set.filter(e => reach(e) === 'gym-or-rare').length;
  const ok = c >= FLOOR;
  if (!ok) holes.push({ pattern: p, have: c, need: FLOOR - c });
  console.log(
    p.padEnd(24) +
    String(c).padStart(6) + String(u).padStart(9) + String(g).padStart(10) +
    String(set.length).padStart(8) + '   ' + (ok ? 'ok' : `SHORT by ${FLOOR - c}`)
  );
}

console.log('\nWhat a person with common kit can reach, by difficulty:');
for (const d of [3, 4, 5, 6]) {
  const n = strength.filter(e => e.difficultyLevel === d && reach(e) === 'common').length;
  const t = strength.filter(e => e.difficultyLevel === d).length;
  console.log(`  difficulty ${d}: ${n} of ${t}`);
}

if (holes.length) {
  console.log('\nCONTENT GAP — new entries needed at difficulty 3–4, common kit only:');
  let total = 0;
  for (const h of holes) {
    console.log(`  ${h.pattern.padEnd(24)} has ${h.have}, needs ${h.need} more`);
    total += h.need;
  }
  console.log(`\n  ${total} entries would close the floor.`);
} else {
  console.log('\nEvery primary pattern clears the floor on common kit.');
}

console.log('\nNOTE: this reports, it does not gate. See the header.');
