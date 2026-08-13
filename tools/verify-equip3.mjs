/**
 * tools/verify-equip3.mjs
 * 12 Aug 2026 v1
 *
 * EQUIP-3. One equipment vocabulary, everywhere.
 *
 * Graeme, after two failed attempts: "If I have stated that I have
 * equipment then it needs to register that I have it. That's simple. Call
 * for the data into this page or redesign everything about equipment for
 * gym and home so it does. This shouldn't be a back and forth problem
 * like this."
 *
 * He was right that it was not a copy problem. EQUIP-1 named the scope and
 * EQUIP-2 added a fallback; neither touched the cause, which is that three
 * parts of the app used three different names for the same objects.
 *
 * Of the 15 options on the session equipment screen, FIVE could ever be
 * ticked from a saved list -- and those five matched by coincidence of
 * spelling. He selected a full gym and saw Barbell, Pull-up bar and Foam
 * roller: exactly the coincidences.
 */
import fs from "node:fs";
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { resolveEquipment } = await import("/home/claude/repo/js/data/equipment-map.js");

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const sb = fs.readFileSync("js/views/session-builder-ui.js", "utf8");
const OPTIONS = [...sb.matchAll(/\{ id: "([a-z-]+)",\s+label: "/g)].map(m => m[1]);
const GYM_FULL = ["dumbbells-light","dumbbells-medium","dumbbells-heavy","adjustable-dumbbells",
  "kettlebell-light","kettlebell-medium","kettlebell-heavy","barbell","ez-curl-bar",
  "band-light","band-medium","band-heavy","treadmill","exercise-bike","rowing-machine",
  "elliptical","bench-flat","bench-adjustable","pull-up-bar","dip-station",
  "stability-ball","ab-wheel","foam-roller","massage-gun","gym-membership"];

const ticks = (saved, opt) => {
  const r = resolveEquipment(saved);
  return [...resolveEquipment([opt])].some(tag => r.has(tag));
};

console.log("\nTEST 1 - a saved full gym ticks the whole screen");
check(`all ${OPTIONS.length} options tick`, () => {
  ok(OPTIONS.length >= 15, `only found ${OPTIONS.length} options - regex drift`);
  const missed = OPTIONS.filter(o => !ticks(GYM_FULL, o));
  ok(missed.length === 0,
     `still unreachable after selecting a full gym: ${missed.join(", ")}`);
});

console.log("\nTEST 2 - the granular ids resolve to the plural ones");
for (const [saved, opt] of [
  ["dumbbells-heavy",  "dumbbells"],
  ["kettlebell-light", "kettlebells"],
  ["band-medium",      "resistance-bands"],
  ["exercise-bike",    "bike"],
  ["elliptical",       "cross-trainer"],
  ["bench-adjustable", "bench"],
])
  check(`"${saved}" ticks "${opt}"`, () =>
    ok(ticks([saved], opt), "the two screens use different names for the same object"));

console.log("\nTEST 3 - it does not over-tick");
check("owning dumbbells does not tick a treadmill", () =>
  ok(!ticks(["dumbbells-heavy"], "treadmill"), "resolution must not be a free-for-all"));
check("an empty list ticks nothing", () =>
  ok(OPTIONS.every(o => !ticks([], o)), "empty should stay empty"));

console.log("\nTEST 4 - the screen actually asks the resolver");
check("session-builder-ui imports it", () =>
  ok(/import \{ resolveEquipment \}/.test(sb),
     "the map existed since 11 Aug and this screen never consulted it"));
check("tick state goes through it", () => {
  ok(/const checked = isTicked\(opt\.id\)/.test(sb), "still comparing raw ids");
  ok(!/equipSet\.has\(/.test(sb), "old raw comparison remains");
});
check("an override stays literal", () =>
  ok(/equipmentOverride\s*\?\s*\n?\s*equipmentOverride\.includes\(optId\)/.test(sb.replace(/\s+/g, " ")) ||
     /equipmentOverride\.includes\(optId\)/.test(sb),
     "resolving an override would re-tick what somebody just unticked"));

console.log("\nTEST 5 - one map, not several");
check("no second equipment map exists", () => {
  const maps = fs.readdirSync("js/data").filter(f => /equipment.*map|equip.*vocab/i.test(f));
  ok(maps.length === 1, `${maps.length} maps: ${maps.join(", ")} - a second map is how a fourth vocabulary starts`);
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
