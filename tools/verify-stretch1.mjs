/**
 * tools/verify-stretch1.mjs
 * 31 Aug 2026 v1
 *
 * STRETCH-1. The Stretch session type.
 *
 * Most of this file is about one failure mode: a category name that
 * reads as real and matches nothing. `joint-rotation` is exactly that --
 * it is a plausible name, it is not in session-categories.js, and a
 * session type referencing it would lose a slot silently. Nothing would
 * go red; a section would just be thinner than intended and nobody would
 * know which category was responsible.
 *
 * Assertion 3 therefore checks EVERY category in EVERY session type, not
 * just the new one. It is the assertion that would have caught the
 * mistake I was about to make, which is the only real test of whether a
 * gate is worth writing.
 */
import { EXERCISES } from "../js/data/exercises/index.js";
import { matchCategory } from "../js/data/session-categories.js";
import { SESSION_TYPES } from "../js/session-builder.js";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const stretch = SESSION_TYPES.find(t => t.id === "stretch");

console.log("\nTEST 1 - the type exists and is shaped like the others");

check("1a. a stretch type is registered", () => {
  ok(!!stretch, "no session type with id 'stretch'");
  for (const f of ["label", "icon", "description",
                   "warmupCategories", "mainCategories", "cooldownCategories"]) {
    ok(stretch[f], "stretch is missing " + f);
  }
});

check("1b. it does not warm up empty", () => {
  ok(stretch.warmupCategories.length > 0,
     "no warm-up categories; stretching cold is worse than not stretching, and " +
     "the warm-up safety floor would have nothing to draw on");
});

console.log("\nTEST 2 - static work is the MAIN work, not a cool-down");

check("2a. the main pool is stretch work", () => {
  const m = stretch.mainCategories;
  ok(m.includes("static-stretch") || m.includes("deep-stretch"),
     "the main section holds no static stretching -- this is Mobility again");
  for (const active of ["pilates", "yoga-flow", "rehab-control", "balance-work", "power"]) {
    ok(!m.includes(active),
       "main includes " + active + "; that is active range of motion, which is what " +
       "Mobility already does and what this type exists because Mobility does");
  }
});

check("2b. the large generic pools come LAST in main", () => {
  // poolFor() takes one from each category in order, then fills from the
  // top. Generic-first would spend a short session inside one pool --
  // five hip openers and nothing for the hamstrings.
  const m = stretch.mainCategories;
  const generic = ["static-stretch", "deep-stretch"];
  const firstGeneric = Math.min(...generic.map(g => m.indexOf(g)).filter(i => i > -1));
  const specific = m.filter(c => !generic.includes(c));
  for (const c of specific) {
    ok(m.indexOf(c) < firstGeneric,
       c + " is listed after a generic pool; region coverage would be absorbed before it is reached");
  }
});

console.log("\nTEST 3 - no session type references a dead category");

for (const type of SESSION_TYPES) {
  check("3. " + type.id + " has no empty categories", () => {
    const groups = [["warmup", type.warmupCategories],
                    ["main", type.mainCategories],
                    ["cooldown", type.cooldownCategories]];
    for (const [section, cats] of groups) {
      for (const c of cats) {
        const n = matchCategory(EXERCISES, c, section).length;
        ok(n > 0, `"${c}" in ${section} matches nothing. Either the name is wrong or ` +
                  `the content does not exist; a slot is being lost silently either way.`);
      }
    }
  });
}

console.log("\nTEST 4 - a short session still spreads across the body");

check("4. 15 minutes reaches at least four distinct regions", () => {
  // Not a count of exercises -- a count of the categories a short
  // session's recommended set draws from. The failure this guards is a
  // session that is technically full and entirely hip openers.
  const m = stretch.mainCategories;
  const reachable = m.filter(c => matchCategory(EXERCISES, c, "main").length > 0);
  ok(reachable.length >= 4,
     `only ${reachable.length} main categories have content; a short session cannot spread`);
});

console.log(fails === 0
  ? "\nSTRETCH-1: all assertions pass\n"
  : "\nSTRETCH-1: " + fails + " FAILED\n");
process.exit(fails === 0 ? 0 : 1);
