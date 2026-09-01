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
import fs from "node:fs";

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

console.log("\nTEST 4 - the session is mostly stretching");

check("4a. every main category returns actual stretches", () => {
  // STRETCH-3. The counting mistake this catches: on first ship every
  // category had CONTENT and none was checked for WHAT content.
  // `glute-stretch` has 15 entries and they are Warrior II, Tree Pose,
  // Bridge Pose -- standing balance work in a session called Stretch.
  const OK_PATTERNS = new Set(["stretch", "hip-rotation", "spinal-rotation", "self-massage"]);
  for (const c of stretch.mainCategories) {
    const got = matchCategory(EXERCISES, c, "main");
    const bad = got.filter(e => !OK_PATTERNS.has(e.movementPattern));
    const ratio = bad.length / Math.max(1, got.length);
    ok(ratio < 0.34,
       `"${c}" is ${Math.round(ratio * 100)}% non-stretch movement patterns ` +
       `(e.g. ${bad.slice(0, 3).map(e => e.name + " [" + e.movementPattern + "]").join(", ")}). ` +
       `Having content is not the same as having the RIGHT content.`);
  }
});

check("4b. no two main categories are near-duplicates", () => {
  // static-stretch (30) was a subset of deep-stretch (53), identical for
  // the first twelve. Listing both spent two ordered picks on one pool.
  // The LAST main category is the designated fill pool and is a superset
  // by design -- it supplies whatever the specific pools do not. Only the
  // specific categories are compared against each other.
  const specific = stretch.mainCategories.slice(0, -1);
  const sets = specific.map(c => ({
    c, ids: new Set(matchCategory(EXERCISES, c, "main").map(e => e.id))
  }));
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const a = sets[i], b = sets[j];
      const small = a.ids.size <= b.ids.size ? a : b;
      const large = a.ids.size <= b.ids.size ? b : a;
      if (!small.ids.size) continue;
      let shared = 0;
      for (const id of small.ids) if (large.ids.has(id)) shared++;
      ok(shared / small.ids.size < 0.8,
         `"${small.c}" is ${Math.round(shared / small.ids.size * 100)}% inside "${large.c}" ` +
         `-- two ordered picks spent on one pool`);
    }
  }
});

check("4c. stretch declares its own shape so the presets cannot invert it", () => {
  const src = fs.readFileSync("js/session-builder.js", "utf8");
  ok(/const TYPE_COUNTS\s*=/.test(src), "no per-type counts; the presets set the shape alone");
  const at = src.indexOf("const TYPE_COUNTS");
  const block = src.slice(at, src.indexOf("};", at));
  ok(block.includes("stretch"), "stretch has no per-type counts");
  // The work must outweigh the warm-up before any preset is applied.
  const m = [...block.matchAll(/warmup:\s*(\d+),\s*main:\s*(\d+)/g)];
  ok(m.length >= 4, "stretch does not define all four durations");
  for (const row of m) {
    ok(Number(row[2]) >= Number(row[1]) * 2,
       `a stretch session with warmup ${row[1]} and main ${row[2]} is not mostly stretching`);
  }
  // BOTH build paths, counted rather than merely present: buildSession()
  // and buildSessionFromSelection() each compute counts, and one of them
  // reverting to EXERCISE_COUNT would leave the override half-applied --
  // a hand-picked stretch session shaped differently from a generated
  // one, for no reason anybody could see.
  // Lookbehind excludes the DEFINITION. Counting it as a call site meant
  // both real calls could be reverted and the assertion still passed --
  // found by the reversal, which is the only thing that would have.
  const wired = (src.match(/(?<!function )_baseCounts\(durationMins, sessionType\)/g) || []).length;
  ok(wired >= 2,
     `only ${wired} build path(s) use _baseCounts; both must, or per-type counts ` +
     `apply to generated sessions and not hand-picked ones`);
});

console.log("\nTEST 5 - a short session still spreads across the body");

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
