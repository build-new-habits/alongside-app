/**
 * tools/verify-search1.mjs
 * 12 Sep 2026 v1
 *
 * SEARCH-1a. The words people use, mapped to the areas the library has.
 *
 * ── WHAT THIS IS FOR ────────────────────────────────────────────────
 *
 * Graeme, in a gym on 12 Sep: no search anywhere, and what he wanted was
 * muscle groups, in everyday and technical language. `affectsAreas` is
 * the only muscle-level vocabulary and has no synonyms, so "lats" found
 * nothing.
 *
 * ── THE FAILURE THIS GATE EXISTS TO CATCH ───────────────────────────
 *
 * Not "does the word resolve" -- a word can resolve perfectly to an area
 * that holds no exercises, and the person still gets an empty screen. So
 * every assertion below ends at a REAL EXERCISE. `cardiovascular` has one
 * entry, `sciatica` one, `shin-splints` two: those are exactly where a
 * term can resolve and still show nothing.
 *
 * ── AND THE OPPOSITE FAILURE ────────────────────────────────────────
 *
 * A vocabulary that quietly matches everything is no better. Test 4
 * asserts that nonsense returns nothing, so SEARCH-1b can say "we don't
 * know that word" rather than showing an adjacent guess.
 */
import { EXERCISES } from "../js/data/exercises/index.js";
import { AREA_TERMS, KNOWN_UNMAPPED, areasForTerm, isUnknownTerm, searchByTerm }
  from "../js/data/muscle-search.js";

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const LIBRARY_AREAS = [...new Set(EXERCISES.flatMap(e => e.affectsAreas || []))].sort();
const countFor = area => EXERCISES.filter(e => (e.affectsAreas || []).includes(area)).length;

console.log("\nSEARCH-1a — the words people use\n");

console.log("TEST 0 — the vocabulary covers the library, and nothing else");

{
  const missing = LIBRARY_AREAS.filter(a => !(a in AREA_TERMS));
  ok("0a. every area the library actually uses has an entry" +
     (missing.length ? "  [" + missing.join(", ") + "]" : ""), missing.length === 0);

  const invented = Object.keys(AREA_TERMS)
    .filter(a => !LIBRARY_AREAS.includes(a) && !KNOWN_UNMAPPED.includes(a));
  ok("0b. no area invented that the library does not have" +
     (invented.length ? "  [" + invented.join(", ") + "]" : ""), invented.length === 0,
     "an area with no entries can only ever produce an empty result");

  const empty = Object.entries(AREA_TERMS)
    .filter(([a, t]) => t.length === 0 && !KNOWN_UNMAPPED.includes(a))
    .map(([a]) => a);
  ok("0c. no silently empty term list" + (empty.length ? "  [" + empty.join(", ") + "]" : ""),
     empty.length === 0, "empty is allowed only where KNOWN_UNMAPPED names it and a comment says why");
}

console.log("\nTEST 1 — CONTROL: this is a real problem, and the fixture proves it");

ok("1a. the library really does hold no synonym of its own",
   !LIBRARY_AREAS.includes("lats") && !LIBRARY_AREAS.includes("quads") && !LIBRARY_AREAS.includes("abs"),
   "if the library ever gains these as areas, this whole file is redundant");
ok("1b. the thin areas this gate worries about are still thin",
   countFor("cardiovascular") <= 3 && countFor("sciatica") <= 3,
   `cardiovascular ${countFor("cardiovascular")}, sciatica ${countFor("sciatica")}`);

console.log("\nTEST 2 — the words a person in a gym would actually type");

const GYM_WORDS = [
  "lats", "quads", "hamstrings", "glutes", "abs", "calves", "traps", "delts",
  "pecs", "chest", "shoulders", "biceps", "triceps", "forearms", "core",
  "lower back", "upper back", "hip flexors", "inner thigh", "groin",
  "bum", "tummy", "thighs", "shins", "ankles", "knees", "arms", "back"
];
{
  const noArea = [], noExercise = [];
  for (const w of GYM_WORDS) {
    const { areas, exercises } = searchByTerm(w, EXERCISES);
    if (!areas.length) noArea.push(w);
    else if (!exercises.length) noExercise.push(`${w} -> ${areas.join("/")}`);
  }
  ok("2a. every one resolves to an area" + (noArea.length ? "  [" + noArea.join(", ") + "]" : ""),
     noArea.length === 0);
  ok("2b. AND to at least one real exercise" + (noExercise.length ? "  [" + noExercise.join("; ") + "]" : ""),
     noExercise.length === 0, "resolving to an empty area is the same blank screen in a longer sleeve");
}

ok("2c. the word that started this finds lat pulldowns", (() => {
  const { exercises } = searchByTerm("lats", EXERCISES);
  return exercises.some(e => /lat.?pulldown/i.test(e.id));
})(), "Graeme was looking for lat pulldowns");

ok("2d. \"quads\" leads with exercises that are mostly quads", (() => {
  const { exercises } = searchByTerm("quads", EXERCISES);
  return exercises.length > 10 &&
         (exercises[0].affectsAreas || []).indexOf("quadriceps") === 0;
})());

console.log("\nTEST 3 — every term in the file, not just the sample");

{
  const dead = [];
  for (const [area, terms] of Object.entries(AREA_TERMS)) {
    for (const term of terms) {
      const { exercises } = searchByTerm(term, EXERCISES);
      if (!exercises.length) dead.push(`${term} (${area})`);
    }
  }
  ok("3a. no term in the whole vocabulary leads to an empty result" +
     (dead.length ? "  [" + dead.slice(0, 8).join("; ") + (dead.length > 8 ? ` +${dead.length - 8}` : "") + "]" : ""),
     dead.length === 0);

  const total = Object.values(AREA_TERMS).reduce((n, t) => n + t.length, 0);
  ok("3b. CONTROL: the vocabulary is a real size, not a stub", total > 100, `${total} terms`);
}

console.log("\nTEST 4 — it refuses what it does not know");

{
  // "lattisimuss" and "backpack" are here because the first draft of
  // areasForTerm() matched when the QUERY started with a known term, so
  // both resolved. A typo that lands on a real answer is the exact failure
  // this vocabulary exists to avoid.
  const NONSENSE = ["quods", "zzzz", "lattisimuss", "backpack", "banana", "xyz", "7"];
  const guessed = NONSENSE.filter(w => !isUnknownTerm(w));
  ok("4a. nonsense returns nothing, so a caller can say so" +
     (guessed.length ? "  [" + guessed.map(w => `${w} -> ${areasForTerm(w).join("/")}`).join("; ") + "]" : ""),
     guessed.length === 0,
     "a silent near-miss looks like an answer and is worse than admitting the gap");
  ok("4b. an empty query returns nothing rather than everything",
     areasForTerm("").length === 0 && areasForTerm(null).length === 0 && areasForTerm("   ").length === 0);
  ok("4c. obliques refuses on purpose rather than guessing at abdominals",
     areasForTerm("obliques").length === 0,
     "mapping it would put side bends in front of somebody who asked for oblique work");
}

console.log("\nTEST 5 — typing, and the shapes of a word");

ok("5a. a prefix finds it mid-type", areasForTerm("hamstr").includes("hamstring"));
// Deleting the three-character floor left the gate green until this went
// in: one letter resolved to a dozen areas and nothing noticed.
ok("5a-ii. but a single letter does not resolve to half the body",
   areasForTerm("a").length === 0 && areasForTerm("b").length === 0,
   `"a" -> ${areasForTerm("a").join("/")}`);
ok("5a-iii. short real terms still work, because they match exactly",
   areasForTerm("ab").includes("abdominals") && areasForTerm("bis").includes("triceps-biceps"));
ok("5b. case and spacing do not matter",
   areasForTerm("  Lower BACK ").includes("lower-back"));
ok("5c. singular and plural both work",
   areasForTerm("calf").includes("calves") && areasForTerm("calves").includes("calves"));
ok("5d. technical names work alongside everyday ones",
   areasForTerm("gastrocnemius").includes("calves") &&
   areasForTerm("latissimus dorsi").includes("upper-back") &&
   areasForTerm("psoas").includes("hip-flexor"));

console.log("\nTEST 6 — a broader match is still a right one");

ok("6a. \"lats\" resolves to upper-back, the area that contains them",
   areasForTerm("lats").includes("upper-back"),
   "the library has no latissimus area; the results are wider than the word, and SEARCH-1b says so");
ok("6b. and every exercise returned really does carry that area", (() => {
  const { areas, exercises } = searchByTerm("lats", EXERCISES);
  return exercises.every(e => areas.some(a => (e.affectsAreas || []).includes(a)));
})());

console.log(`\n  ${fails === 0 ? "ALL PASS" : fails + " RED"}\n`);
process.exit(fails ? 1 : 0);
