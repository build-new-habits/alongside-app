/**
 * tools/verify-pattern-floor.mjs
 * 06 Sep 2026 v1
 *
 * CONTENT-GAP-1. The movement-pattern floor, asserted rather than reported.
 *
 * audit-pattern-coverage.mjs has said since 18 Aug that it "reports, it
 * does not gate" and that the floor should be asserted once the content
 * lands. The content landed today. This is that assertion.
 *
 * ── THE FLOOR ───────────────────────────────────────────────────────
 *
 * Every primary strength pattern must offer at least THREE entries at
 * difficulty 3 or above that a person with common kit can actually
 * reach. Three is not ambitious. It is the point below which the engine
 * has no choice left to make and a twelve-week chapter repeats itself.
 *
 * ── WHAT COUNTS AS REACHABLE, AND WHY IT IS NOT category === strength ─
 *
 * The audit tool measured category === 'strength' alone for three weeks
 * and produced a target of 16 entries. Driven on the real candidate pool,
 * 43 rehabilitation entries reach a general full-body session, every one
 * carrying generalPurpose: true, because session-builder.js excludes a
 * rehabilitation entry only where that flag is absent. Four of them sit
 * at difficulty 3+ on common kit and filled holes the audit reported as
 * empty. The true gap was 9.
 *
 * Common kit is bodyweight, bench, dumbbell, resistance band. The audit's
 * own COMMON_KIT set listed ten tags and seven of them -- none, mat,
 * chair, towel, wall, step, and bodyweight -- are not library vocabulary
 * at all. Six were fake. 'bodyweight' is kept only because kitOf() emits
 * it as the sentinel for equipment: [].
 *
 * ── FIXTURE REACH ───────────────────────────────────────────────────
 *
 * A floor assertion passes trivially if the population it counts is
 * wrong: an empty filter clears no pattern, and an over-broad one clears
 * all of them for the wrong reason. So the population is proved first --
 * that strength entries are present, that generalPurpose rehabilitation
 * entries are present and reach the pool, and that the equipment tags
 * this gate names are real tags in the library.
 *
 * Reversal-proven: removing any one of the nine entries authored today
 * drops its pattern below the floor and turns this gate red.
 */

let pass = 0, fail = 0; const fails = [];
const ok = (m, c) => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); } };
const reverses = (m, fn) => ok("[reversal] " + m, !fn());

const { EXERCISES } = await import("../js/data/exercises/index.js");

console.log("\nPATTERN-FLOOR — every pattern offers a real choice on common kit\n");

const COMMON = new Set(["bench", "dumbbell", "resistance-band"]);
const FLOOR = 3;
const PATTERNS = ["squat", "hinge", "push", "pull", "lunge", "carry",
                  "anti-extension", "anti-rotation", "anti-lateral-flexion"];

const commonKit = e => {
  const k = (e.equipment || []).filter(Boolean);
  return k.length === 0 || k.every(q => COMMON.has(q));
};
const offered = e =>
  e.category === "strength" ||
  (e.category === "rehabilitation" && e.generalPurpose === true);

// ── 1. FIXTURE REACH. Prove the population before counting it. ───────
const strength = EXERCISES.filter(e => e.category === "strength");
const gpRehab  = EXERCISES.filter(e => e.category === "rehabilitation" && e.generalPurpose === true);
ok("FIXTURE REACHES THE STRENGTH LIBRARY: entries present", strength.length > 100);
ok("FIXTURE REACHES GENERAL-PURPOSE REHAB: entries present", gpRehab.length > 0);
ok("FIXTURE REACHES COMMON KIT: every tag named here is real library vocabulary",
  [...COMMON].every(tag => EXERCISES.some(e => (e.equipment || []).includes(tag))));
reverses("the offered population is not accidentally everything",
  () => EXERCISES.every(offered));
reverses("and not accidentally empty",
  () => EXERCISES.filter(offered).length === 0);

// The generalPurpose rule this gate depends on must still be the rule the
// builder applies. If that filter is ever inverted or dropped, this gate's
// population silently stops matching what a person is offered.
const fs = await import("node:fs");
const sb = fs.readFileSync("js/session-builder.js", "utf8");
ok("session-builder still excludes rehab entries only where generalPurpose is absent",
  /sourceLibrary\s*===\s*"rehabilitation"\s*&&\s*ex\.generalPurpose\s*!==\s*true/.test(sb));

// ── 2. THE FLOOR ────────────────────────────────────────────────────
const counts = {};
for (const p of PATTERNS) {
  counts[p] = EXERCISES.filter(e =>
    offered(e) && e.movementPattern === p && (e.difficultyLevel ?? 0) >= 3 && commonKit(e)).length;
  ok(`${p} offers at least ${FLOOR} at difficulty 3+ on common kit — has ${counts[p]}`,
    counts[p] >= FLOOR);
}

// ── 3. The two holes logged 22 Aug and never scheduled. ─────────────
const bandStrength = EXERCISES.filter(e =>
  e.category === "strength" && (e.equipment || []).includes("resistance-band") &&
  (e.difficultyLevel ?? 0) > 2);
ok("resistance-band strength exists above difficulty 2 — there was none at all",
  bandStrength.length > 0);

const homePull = EXERCISES.filter(e =>
  offered(e) && e.movementPattern === "pull" && (e.difficultyLevel ?? 0) >= 3 && commonKit(e));
ok("more than one challenging pull is reachable without a gym", homePull.length > 1);

// ── 4. Guards on the shape of what was authored. ───────────────────
const authored = ["band-bent-over-row", "dumbbell-single-arm-row",
  "dumbbell-front-rack-carry", "dumbbell-overhead-carry", "plank-shoulder-tap",
  "band-pallof-press-split-stance", "plank-single-arm-reach", "side-plank-full",
  "dumbbell-suitcase-hold"];
const found = authored.map(id => EXERCISES.find(e => e.id === id)).filter(Boolean);
ok("FIXTURE REACHES ALL NINE authored entries", found.length === authored.length);
ok("every one carries the watchOut the standard requires",
  found.every(e => Array.isArray(e.watchOut) && e.watchOut.length >= 2));
ok("no authored entry prescribes an absolute weight",
  found.every(e => !/\b\d+\s?(kg|lb|kilo|pound)/i.test(e.load || "")));
ok("every carry names the load it carries",
  EXERCISES.filter(e => e.movementPattern === "carry")
           .every(e => (e.equipment || []).length > 0));

console.log(`\n  ${pass} passed, ${fail} failed\n`);
if (fail) { console.log("  FAILED:"); fails.forEach(f => console.log("    - " + f)); console.log(); }
process.exit(fail ? 1 : 0);
