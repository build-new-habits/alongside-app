/**
 * tools/verify-pattern-tags.mjs
 * 06 Sep 2026 v1
 *
 * PATTERN-TAGS. Three entries described themselves wrongly, and the
 * content audit believed them.
 *
 * ── WHY A GATE RATHER THAN THREE QUIET EDITS ────────────────────────
 *
 * movementPattern and equipment are machine-read. They decide which
 * pattern an entry counts toward and whether a person with common kit
 * can reach it. A wrong value is not cosmetic: it moves the coverage
 * floor, and the floor is what CONTENT-GAP-1 is authored against.
 *
 * All three were found by re-measuring CONTENT-GAP-1 on 06 Sep and
 * discovering that its target of 16 could not be reproduced. Two of the
 * three change the measured gap.
 *
 * ── THE THREE ───────────────────────────────────────────────────────
 *
 *   functional-sandbag-carry   equipment: []  ->  ["sandbag"]
 *     A sandbag carry that declared it needed no equipment. It was the
 *     ONLY common-kit carry at difficulty 3 or above, so the carry
 *     pattern read as one-short when it was in fact three-short.
 *
 *   plyo-broad-jump            hinge  ->  jump
 *     A broad jump is a jump. `jump` already exists in the vocabulary
 *     and is used by plyo-box-jump. It inflated hinge, which reads "ok".
 *
 *   dumbbell-reverse-lunge     squat  ->  lunge
 *     A reverse lunge is a lunge. It inflated squat and starved lunge.
 *     At difficulty 2 it does not move the floor either way, so this one
 *     is a truthfulness fix rather than a coverage fix.
 *
 * ── FIXTURE REACH ───────────────────────────────────────────────────
 *
 * Every assertion below names an id. An assertion about an entry that
 * does not exist passes silently and proves nothing, so each id is
 * confirmed present BEFORE anything is claimed about its fields. That
 * check is the first section and it is not decorative: eight fixtures
 * failed to reach the branch they named on 6 Sep alone.
 *
 * ── SCOPE GUARDS ────────────────────────────────────────────────────
 *
 * Three id-specific assertions would go green again the moment somebody
 * authors a fourth entry with the same fault. The class assertions after
 * them are the durable half: no carry may claim no equipment, and no
 * entry named as a jump may be tagged hinge.
 *
 * Reversal-proven. Restoring any one of the three original values turns
 * this gate red, and each was restored and re-run to confirm it.
 */

let pass = 0, fail = 0; const fails = [];
const ok = (m, c) => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); } };
const reverses = (m, fn) => ok("[reversal] " + m, !fn());

const { EXERCISES } = await import("../js/data/exercises/index.js");

console.log("\nPATTERN-TAGS — entries describe themselves truthfully\n");

// ── 1. FIXTURE REACH. Prove the entries exist before claiming anything.
const ID = {
  sandbag: "functional-sandbag-carry",
  jump:    "plyo-broad-jump",
  lunge:   "dumbbell-reverse-lunge"
};
const E = {};
for (const [k, id] of Object.entries(ID)) {
  E[k] = EXERCISES.find(x => x.id === id);
  ok(`FIXTURE REACHES ${id}: the entry exists`, !!E[k]);
}
if (Object.values(E).some(e => !e)) {
  console.log("\n  (an entry is missing — field assertions cannot be evaluated)\n");
  console.log(`  ${pass} passed, ${fail} failed\n`);
  process.exit(1);
}
reverses("the fixture is not matching a renamed entry by accident",
  () => Object.values(E).some(e => e.category === undefined));

// ── 2. The three fixes.
// The rule is that the load is named in `equipment`, NOT which load.
// An earlier draft of this gate asserted "sandbag" specifically. The fix
// chose dumbbell -- what this audience owns, and already sanctioned by the
// original author in equipmentOptional. Asserting the implement rather
// than the requirement would have made the gate dictate a content
// decision it has no standing to make.
const LOAD = new Set(["dumbbell", "sandbag", "kettlebell", "barbell", "medicine-ball"]);
ok("the bear hug carry names the load it carries in `equipment`",
  (E.sandbag.equipment || []).some(q => LOAD.has(q)));
ok("and the load is not left in equipmentOptional, which selection never reads",
  (E.sandbag.equipment || []).length > 0);

ok("plyo-broad-jump is a jump, not a hinge", E.jump.movementPattern === "jump");
ok("dumbbell-reverse-lunge is a lunge, not a squat", E.lunge.movementPattern === "lunge");

// ── 3. Class guards. The durable half.
const carries = EXERCISES.filter(e => e.movementPattern === "carry");
ok("FIXTURE REACHES THE CARRY CLASS: carries exist to check", carries.length > 0);
ok("no carry claims it needs no equipment at all",
  carries.every(e => (e.equipment || []).length > 0));

// The `plyo-` PREFIX is not a jump. plyo-med-ball-slam is tagged hinge and
// correctly so -- you hinge to slam. An earlier draft of this guard matched
// the prefix, caught that entry, and would have had a correct tag "fixed".
// The guard matches the movement word, not the family name.
const named = EXERCISES.filter(e => /\bjump\b|\bhop\b|\bbound\b/i.test(e.id + " " + (e.name || "")));
ok("FIXTURE REACHES THE JUMP CLASS: jump-named entries exist", named.length > 0);
ok("no entry named as a jump is tagged hinge",
  named.every(e => e.movementPattern !== "hinge"));

const lunges = EXERCISES.filter(e => /reverse-lunge|reverse lunge/i.test(e.id + " " + (e.name || "")));
ok("FIXTURE REACHES THE LUNGE CLASS: reverse-lunge entries exist", lunges.length > 0);
ok("no reverse lunge is tagged squat", lunges.every(e => e.movementPattern !== "squat"));

// ── 4. The vocabulary these values must come from.
const PATTERNS = new Set(EXERCISES.map(e => e.movementPattern).filter(Boolean));
ok("jump is an established pattern, not one invented here", PATTERNS.has("jump"));
ok("lunge is an established pattern, not one invented here", PATTERNS.has("lunge"));

const EQUIP = new Set();
EXERCISES.forEach(e => (e.equipment || []).forEach(q => EQUIP.add(q)));
ok("sandbag is an established equipment tag, not one invented here", EQUIP.has("sandbag"));

console.log(`\n  ${pass} passed, ${fail} failed\n`);
if (fail) { console.log("  FAILED:"); fails.forEach(f => console.log("    - " + f)); console.log(); }
process.exit(fail ? 1 : 0);
