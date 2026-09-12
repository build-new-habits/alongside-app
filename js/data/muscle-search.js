/**
 * js/data/muscle-search.js
 * 12 Sep 2026 v1
 *
 * SEARCH-1a. The words people actually use for parts of the body, mapped
 * to the 31 values `affectsAreas` uses. Vocabulary and a resolver. No UI:
 * the search input is SEARCH-1b, and it is deliberately not in this
 * session.
 *
 * ── WHY THIS COMES FIRST ────────────────────────────────────────────
 *
 * Graeme, in a gym on 12 Sep, wanted to search for lat pulldowns and
 * found there is no search anywhere -- only thirteen fixed body-area
 * groups in the swap sheet. He asked for muscle groups, "in both the
 * common language and the technical language".
 *
 * `affectsAreas` is the only muscle-level vocabulary the library has, and
 * it has no synonyms at all. Nothing maps "lats" to `upper-back`, "quads"
 * to `quadriceps`, or "abs" to `abdominals`. A search box shipped on top
 * of that returns nothing for the first word a gym-goer types, and one
 * empty result teaches somebody the search does not work. So the words
 * come before the box.
 *
 * ── WHAT "HONEST" MEANS HERE ────────────────────────────────────────
 *
 * Three kinds of mapping, and the difference matters:
 *
 *   EXACT      "quads" -> quadriceps. The same muscle, another name.
 *   BROADER    "lats" -> upper-back. The library has no latissimus area;
 *              upper-back is the area that contains it. The results are
 *              right but wider than the word.
 *   REFUSED    Anything not in this file returns []. A caller must say it
 *              does not know the word rather than quietly showing
 *              something adjacent. A silent near-miss is worse than "I
 *              don't know that one" -- it looks like an answer.
 *
 * Every BROADER mapping is marked below. SEARCH-1b should tell the person
 * which area it searched, so "lats" showing upper-back work is an
 * explanation rather than a surprise.
 *
 * ── EVERY TERM HAS TO FIND SOMETHING ────────────────────────────────
 *
 * Four areas are nearly empty: `cardiovascular` (1 entry), `sciatic-nerve`
 * (1), `sciatica` (1), `shin-splints` (2). A synonym that resolves to an
 * area with nothing in it is the same empty result in a longer sleeve, so
 * verify-search1 asserts every term reaches at least one real exercise,
 * and those thin areas are mapped alongside fuller ones rather than
 * alone.
 */

/**
 * area id -> the words people use for it.
 *
 * Lower case, no punctuation. Plurals are listed where somebody would
 * plausibly type them; the resolver does not stem, because stemming
 * "abs" and "ab" and "abdominal" correctly costs more than writing the
 * three words down.
 */
export const AREA_TERMS = {
  "abdominals":     ["abs", "ab", "abdominals", "abdominal", "stomach", "tummy", "belly", "six pack", "rectus abdominis"],
  "core":           ["core", "midsection", "trunk", "deep core", "transverse abdominis"],
  "pelvic-floor":   ["pelvic floor", "pelvic"],
  "obliques":       [],   // placeholder: see the note under BROADER, below

  "chest-pecs":     ["chest", "pecs", "pec", "pectorals", "pectoral"],
  "upper-back":     ["upper back", "back", "lats", "lat", "latissimus", "latissimus dorsi", "traps", "trap", "trapezius", "rhomboids", "rhomboid", "mid back"],
  "thoracic":       ["thoracic", "thoracic spine", "mid spine", "t spine"],
  "lower-back":     ["lower back", "low back", "lumbar", "erector spinae", "erectors"],
  "spine":          ["spine", "back extension", "vertebrae"],

  "shoulder":       ["shoulders", "shoulder", "delts", "delt", "deltoids", "deltoid", "front delts", "rear delts", "side delts"],
  "rotator-cuff":   ["rotator cuff", "cuff", "supraspinatus", "infraspinatus"],
  "triceps-biceps": ["arms", "arm", "triceps", "tricep", "tris", "biceps", "bicep", "bis", "guns"],
  "biceps-triceps": ["upper arms", "arm muscles"],
  "wrist-elbow":    ["wrists", "wrist", "elbow", "elbows", "forearms", "forearm", "grip"],

  "glutes":         ["glutes", "glute", "bum", "butt", "backside", "bottom", "gluteus", "gluteus maximus", "gluteus medius"],
  "hip":            ["hips", "hip", "hip joint"],
  "hip-flexor":     ["hip flexors", "hip flexor", "psoas", "iliopsoas"],
  "piriformis":     ["piriformis", "deep glute", "deep hip rotator"],
  "adductors":      ["inner thigh", "inner thighs", "adductors", "adductor", "groin"],
  "it-band":        ["it band", "iliotibial band", "outer thigh"],

  "quadriceps":     ["quads", "quad", "quadriceps", "thighs", "thigh", "front of thigh"],
  "hamstring":      ["hamstrings", "hamstring", "hams", "back of thigh", "back of leg"],
  "calves":         ["calves", "calf", "gastrocnemius", "soleus"],
  "achilles":       ["achilles", "achilles tendon", "heel cord"],
  "ankle-foot":     ["ankles", "ankle", "feet", "foot", "arches", "plantar"],
  "shin-splints":   ["shins", "shin", "tibialis", "shin splints"],
  "knee":           ["knees", "knee", "kneecap", "patella"],

  "full-body":      ["full body", "whole body", "everything", "total body", "all over"],
  "cardiovascular": ["cardio", "heart", "aerobic", "fitness", "stamina", "endurance", "conditioning"],
  "nervous-system": ["nervous system", "calm", "relaxation", "wind down", "breathing"],
  "sciatic-nerve":  ["sciatic nerve", "nerve"],
  "sciatica":       ["sciatica", "leg nerve pain"],
};

// BROADER, listed once so it is reviewable rather than buried:
//
//   lats, latissimus, traps, trapezius, rhomboids -> upper-back
//   The library has no separate latissimus or trapezius area. upper-back
//   is the area that contains them, so the results are right and wider
//   than the word. SEARCH-1b names the area it searched.
//
//   tris, bis, biceps, triceps -> triceps-biceps
//   One area covers both, so searching for one returns the other as well.
//
//   obliques -> nothing yet. Deliberately an empty list rather than a
//   mapping to `abdominals`: waist rotation and anti-rotation work is
//   spread across abdominals and core in ways that would need reading
//   entry by entry, and guessing here would put side bends in front of
//   somebody who asked for oblique work. It refuses until somebody does
//   that reading. verify-search1 permits an empty list only where this
//   comment names it.

/** Areas whose term lists are allowed to be empty, and why. */
export const KNOWN_UNMAPPED = ["obliques"];

/** Every term, lower-cased, pointing at its area. Built once. */
const _index = (() => {
  const map = new Map();
  for (const [area, terms] of Object.entries(AREA_TERMS)) {
    for (const term of terms) {
      const key = term.toLowerCase().trim();
      if (!map.has(key)) map.set(key, []);
      if (!map.get(key).includes(area)) map.get(key).push(area);
    }
  }
  return map;
})();

/**
 * Which body areas does this word mean?
 *
 * @param {string} query
 * @returns {string[]} area ids, or [] when the word is not known
 *
 * Exact match first, then a prefix match, so "hamstr" finds hamstrings
 * while somebody is still typing. No fuzzy matching: "quods" returns
 * nothing, and a caller that says so is more use than one that guesses.
 *
 * THE PREFIX GOES ONE WAY ONLY, and that was not the first draft. It also
 * matched when the QUERY started with a known term, which meant
 * "lattisimuss" matched "lat" and "backpack" would match "back" --
 * verify-search1 test 4a caught it. A typo that lands on a real answer is
 * exactly the silent near-miss this file is written to avoid.
 *
 * Three characters before prefix matching starts, so a single letter does
 * not resolve to half the body. Short real terms ("ab", "bis") still work
 * because they match exactly.
 */
export function areasForTerm(query) {
  const q = String(query || "").toLowerCase().trim().replace(/\s+/g, " ");
  if (!q) return [];

  if (_index.has(q)) return [..._index.get(q)];
  if (q.length < 3) return [];

  const hits = [];
  for (const [term, areas] of _index) {
    if (term.startsWith(q)) {
      for (const a of areas) if (!hits.includes(a)) hits.push(a);
    }
  }
  return hits;
}

/** True when this word means nothing to us. The caller says so out loud. */
export function isUnknownTerm(query) {
  return areasForTerm(query).length === 0;
}

/**
 * Exercises for a word.
 *
 * @param {string} query
 * @param {object[]} exercises
 * @returns {{ areas: string[], exercises: object[] }}
 *
 * Ordered by how central the area is to the exercise: an entry whose
 * FIRST area matches comes before one where the match is its fourth,
 * which is the same "what is this mostly for" rule swapGroupFor() uses.
 */
export function searchByTerm(query, exercises) {
  const areas = areasForTerm(query);
  if (!areas.length) return { areas: [], exercises: [] };

  const scored = [];
  for (const ex of exercises || []) {
    const own = ex.affectsAreas || [];
    let best = -1;
    for (const a of areas) {
      const i = own.indexOf(a);
      if (i !== -1 && (best === -1 || i < best)) best = i;
    }
    if (best !== -1) scored.push({ ex, rank: best });
  }
  scored.sort((a, b) => a.rank - b.rank);
  return { areas, exercises: scored.map(s => s.ex) };
}
