/**
 * tools/verify-cardlocal.mjs
 * 16 Sep 2026 v1
 *
 * CARD-LOCAL. Morning sessions tell you how to do the movements.
 *
 * A morning session showed the name, the sets and reps, and a coach
 * note. Every other session also showed how to do the movement, what to
 * watch for on that one, and how to ease off or go further. So this
 * screen handed somebody a movement they might not know and said
 * nothing about doing it.
 *
 * 🔴 IT WAS LOGGED AS A RENDERER MIGRATION SINCE 13 SEP. It was not.
 * morning-programme.js names its own exercises -- ids like "u1" mean
 * nothing to the library -- so only 93 of 190 resolved. Swapping the
 * renderer alone would have given half the movements full guidance and
 * left the other half bare, which on a 06:40 screen is worse than being
 * consistently sparse: you learn to expect help and then it stops.
 *
 * ⚫ AND AUTOMATIC MATCHING IS NOT AVAILABLE. A token-overlap matcher
 * was tried and offered "Dumbbell Shoulder Press" -> "Press-Up". This
 * gate therefore pins the COVERAGE NUMBER and prints what is still
 * missing, so the gap is visible on every run rather than discovered
 * again in three weeks.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const fs = __require("node:fs");

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { MORNING_PROGRAMME } = await import(B + "data/morning-programme.js");
const { libraryExerciseFor, MORNING_NAME_ALIASES, MORNING_MISSING_FROM_LIBRARY } =
  await import(B + "data/morning-library-map.js");
const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");

const all = [];
for (const w of MORNING_PROGRAMME.weeks) {
  for (const key of Object.keys(w.sessions || {})) {
    const s = w.sessions[key];
    for (const b of Object.keys(s)) {
      if (!Array.isArray(s[b])) continue;
      for (const ex of s[b]) if (ex && ex.name) all.push(ex);
    }
  }
}

console.log("\nCARD-LOCAL\n");

console.log("TEST 0 — FIXTURE REACH: there are movements to resolve");
ok("0.1 the programme has movements", all.length > 100);
const matched = all.filter(ex => libraryExerciseFor(ex, EXERCISES));
const pct = Math.round(matched.length / all.length * 100);
console.log("       coverage: " + matched.length + "/" + all.length + " (" + pct + "%)");
ok("0.2 and some of them resolve", matched.length > 0,
   "if nothing resolves, every assertion below passes while the screen is " +
   "exactly as bare as it was");

console.log("\nTEST 1 — coverage, pinned so it cannot quietly fall");
ok("1.1 at least 160 of the programme's movements resolve", matched.length >= 160,
   "got " + matched.length + ". Before the name map it was 93");
ok("1.2 REVERSAL: it is NOT claiming everything resolves", matched.length < all.length,
   "supersets and circuits are two movements or none, and eight movements " +
   "the library has yet to describe. Claiming 100% would mean something is " +
   "being matched that should not be");

{
  const unresolved = [...new Set(all.filter(ex => !libraryExerciseFor(ex, EXERCISES)).map(e => e.name))];
  console.log("       still unresolved (" + unresolved.length + "): " +
              unresolved.slice(0, 6).join(" | ") + (unresolved.length > 6 ? " …" : ""));
  ok("1.3 what is left is supersets, circuits, or a named absence", (() => {
    return unresolved.every(n =>
      /superset|circuit/i.test(n) ||
      MORNING_MISSING_FROM_LIBRARY.some(m => n.toLowerCase().includes(m.toLowerCase())));
  })(), "anything else is a naming problem that should have been in the alias " +
        "map, not left as a content gap");
}

console.log("\nTEST 2 — no alias points somewhere wrong");
{
  const names = new Set(EXERCISES.map(e => String(e.name).toLowerCase()));
  const dangling = Object.entries(MORNING_NAME_ALIASES)
    .filter(([, v]) => !names.has(String(v).toLowerCase()));
  if (dangling.length) console.log("      dangling: " + dangling.map(d => d.join(" -> ")).join(", "));
  ok("2.1 every alias resolves to a real library exercise", dangling.length === 0);

  // 🔴 The matcher that was rejected. Pinned so nobody reinstates it.
  const BANNED = [["Dumbbell Shoulder Press", "Press-Up"],
                  ["Dumbbell Bench Press", "Dumbbell Floor Press"]];
  ok("2.2 the known-wrong matches are NOT present", (() => {
    return BANNED.every(([from, to]) =>
      (MORNING_NAME_ALIASES[from] || "").toLowerCase() !== to.toLowerCase());
  })(), "a bench press and a floor press are different movements -- the " +
        "programme's own coach note says the floor stops the shoulder entering " +
        "the range that makes a bench press a bench press");

  ok("2.3 REVERSAL: a superset resolves to NOTHING, not to its first half",
     libraryExerciseFor({ name: "Arnold Press + Side Plank superset" }, EXERCISES) === null,
     "returning the first movement would put one movement's instructions on a " +
     "card describing two");
}

console.log("\nTEST 3 — the screen actually shows more");
{
  const view = read("js/views/morning-session.js");
  ok("3.1 it borrows the shared card for the movement body",
     /renderSharedBody\(merged/.test(view));
  ok("3.2 flattened, because it has no page model", /full: true/.test(view));
  ok("3.3 the programme's dose wins over the library's description",
     /\{ \.\.\.lib, \.\.\.ex/.test(view),
     "the library describes the movement; the programme prescribes THIS " +
     "session's sets, reps and rest");
  ok("3.4 an unresolved movement still gets the safety block",
     /if \(!lib\) return hurtBlock\(true\);/.test(view),
     "a superset must not silently lose the hurt-and-ache block along with " +
     "the instructions");
  ok("3.5 the view keeps its own screen renderer",
     /function renderExerciseCard\(ex, session\)/.test(view),
     "the block badge and the warmup/cardio/strength shape are genuinely " +
     "local; rewriting them was never the job");
}

console.log("\nTEST 4 — what a resolved movement now carries");
{
  const ex = all.find(e => libraryExerciseFor(e, EXERCISES));
  const lib = libraryExerciseFor(ex, EXERCISES);
  console.log("       e.g. " + ex.name + " -> " + lib.name);
  ok("4.1 the library entry has instructions", Array.isArray(lib.instructions) && lib.instructions.length > 0);
  ok("4.2 and exercise-specific hazards", Array.isArray(lib.watchOut) && lib.watchOut.length > 0,
     "this is the half that was a SAFETY gap, not just a content one: CARD-3's " +
     "rule is that these are never behind an interaction, and here they were " +
     "not behind anything, they were absent");
}

console.log("");
if (fail) { console.log("CARD-LOCAL: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("CARD-LOCAL: all " + pass + " assertions pass\n");
