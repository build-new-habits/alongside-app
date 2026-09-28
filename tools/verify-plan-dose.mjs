/**
 * tools/verify-plan-dose.mjs
 * 28 Sep 2026 v2
 *
 * v2 - FLAKY-PLANDOSE. Test 2 builds until it has a sample (at least
 *   eight default-dosed moves, up to forty builds). 2b had failed on an
 *   empty sample under load, never on a wrong dose. No assertion changed.
 *
 * SMOOTH-P2b, PLAN-DOSE and GYM-KIT. The plan says how much, fills the
 * time asked for, and a gym gets gym moves.
 *
 * Found building P2a, 28 Sep: most main-block strength moves in the
 * library carry no sets or reps, so the plan and the player said
 * "Barbell Hip Thrust · 2 min". A 40-minute request built about 21
 * minutes -- 40 is not a key in the count table, so it fell back to the
 * 30-minute shape -- while the coach line said "around 40 minutes".
 * Spec 4.3: at a gym, strength sessions prefer gym kit.
 *
 * Graeme, 28 Sep: "Default for exercises. Yes. Users can always put stuff
 * in notes or make changes." Three sets of ten by default; eight to
 * twelve on a harder day; two sets on a gentle one.
 *
 * Driven through the real buildSession() and swapExerciseInSession().
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};

const FULL_GYM = ["dumbbells-light","dumbbells-medium","dumbbells-heavy","adjustable-dumbbells",
  "kettlebell-light","kettlebell-medium","kettlebell-heavy","barbell","ez-curl-bar",
  "band-light","band-medium","band-heavy","treadmill","exercise-bike","rowing-machine","elliptical",
  "bench-flat","bench-adjustable","pull-up-bar","dip-station","stability-ball","ab-wheel",
  "foam-roller","massage-gun","gym-membership"];
const BANDS = new Set(["band-light","band-medium","band-heavy"]);
const SOFT  = new Set(["foam-roller","massage-gun","stability-ball","yoga-mat","gym-membership","step-platform"]);
const loaded = ex => (ex.equipment || []).some(q => !BANDS.has(q) && !SOFT.has(q) && !/band/.test(q));
const onlyBands = ex => (ex.equipment || []).length > 0 && (ex.equipment || []).every(q => BANDS.has(q) || /band/.test(q));

// The strength patterns that are counted in reps, not held or timed.
const COUNTED = new Set(["hinge","squat","lunge","push","pull","hip-extension","hip-abduction","calf-raise"]);
const TIMED   = new Set(["carry","isometric","proprioception","locomotion","stretch","yoga-pose","pilates-move","spinal-rotation"]);

function fresh(intensity = "moderate") {
  localStorage.clear(); store.init();
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("todayIntensity", intensity);
}
const mins = s => (s?.exercises || []).reduce((a, e) => a + SB.exerciseSeconds(e), 0) / 60;
const mainOf = s => (s?.exercises || []).filter(e => e.section === "main" && !e._feature && !e.isPrescribed);

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the fixture builds real sessions");
fresh();
const probe = SB.buildSession({ sessionType: "upper", durationMins: 40, equipmentOverride: FULL_GYM });
ok("0a. an Upper Body session builds at a full gym", mainOf(probe).length > 0);
ok("0b. the builder exposes one time estimate for the plan and itself", typeof SB.exerciseSeconds === "function");

// ── 1. EVERY STRENGTH MOVE SAYS HOW MANY ────────────────────────────────
console.log("\nTEST 1 - a counted strength move always has sets and reps");
const repless = new Set(), timedDosed = new Set();
let counted = 0;
for (const t of ["upper", "lower", "full", "glute", "core"]) for (let i = 0; i < 25; i++) {
  fresh();
  const s = SB.buildSession({ sessionType: t, durationMins: 40, equipmentOverride: FULL_GYM });
  for (const e of mainOf(s)) {
    if (COUNTED.has(e.movementPattern)) {
      counted++;
      if (e.reps == null || !(Number(e.sets) > 0)) repless.add(e.name);
    }
    if (TIMED.has(e.movementPattern) && e._defaultDose) timedDosed.add(e.name);
  }
}
ok("1pc. strength moves were built to inspect", counted > 100, `${counted}`);
ok("1a. none is left as \"2 min\"", repless.size === 0, [...repless].slice(0, 12).join(", "));
ok("1b. holds, carries, stretches and cardio keep their clock", timedDosed.size === 0, [...timedDosed].join(", "));

// ── 2. THE DEFAULT, BY DAY ──────────────────────────────────────────────
console.log("\nTEST 2 - three sets of ten; eight to twelve on a harder day; two sets on a gentle one");
// The default applies where the entry says nothing; where its own
// instructions state a dose, that wins (test 2f).
const doseOn = (intensity) => {
  const out = [];
  // FLAKY-PLANDOSE, 28 Sep: six builds on a high day sometimes held no
  // default-dosed main move at all (every pick carried its own written
  // dose), so 2b failed on an EMPTY sample. Build until there are at
  // least eight to inspect, up to forty builds. Every one is still held
  // to the same rule; only the sample is made sure to exist.
  for (let i = 0; i < 40 && (i < 6 || out.length < 8); i++) {
    fresh(intensity);
    const s = SB.buildSession({ sessionType: "full", durationMins: 40, equipmentOverride: FULL_GYM });
    out.push(...mainOf(s).filter(e => e._defaultDose && e._doseFrom !== "instructions"));
  }
  return out;
};
const mod = doseOn("moderate"), hi = doseOn("high"), lo = doseOn("low");
ok("2a. moderate: 3 × 10", mod.length > 0 && mod.every(e => e.sets === 3 && /^10\b/.test(e.reps)), JSON.stringify(mod.map(e => [e.sets, e.reps])));
ok("2b. harder day: 3 × 8–12", hi.length > 0 && hi.every(e => e.sets === 3 && /^8–12\b/.test(e.reps)), JSON.stringify(hi.map(e => [e.sets, e.reps])));
ok("2c. gentle day: 2 × 10", lo.length > 0 && lo.every(e => e.sets === 2 && /^10\b/.test(e.reps)), JSON.stringify(lo.map(e => [e.sets, e.reps])));
ok("2d. one-sided moves say each side", mod.length > 0 && [...mod, ...hi, ...lo].filter(e => e.perSide).every(e => /each side/.test(e.reps)));
ok("2e. the library entry itself is never changed (the dose is on the session's copy)",
   mod.length > 0 && mod.every(e => { const lib = EXERCISES.find(x => x.id === e.id); return lib && lib.reps == null && lib !== e; }));

const writtenLib = EXERCISES.filter(e => e.reps == null && (e.instructions || []).some(l => /\d+ sets? of \d+/.test(l)));
let wChecked = 0, wWrong = [];
for (const lib of writtenLib) {
  const d = SB.withDefaultDose({ ...lib, section: "main" }, "moderate");
  if (!d._defaultDose) continue;
  wChecked++;
  const m = (lib.instructions || []).join(" ").match(/(\d+) sets? of (\d+)/);
  if (!(d._doseFrom === "instructions" && String(d.sets) === m[1] && String(d.reps).startsWith(m[2]))) wWrong.push(`${lib.name}: ${d.sets} × ${d.reps}`);
}
ok("2f. where the entry's own instructions state a dose, the plan uses it", wChecked > 20 && wWrong.length === 0,
   `${wChecked} checked; ${wWrong.slice(0, 6).join("; ")}`);

// ── 3. THE TIME ASKED FOR ───────────────────────────────────────────────
console.log("\nTEST 3 - the session fills the time asked for (within 15% either way)");
for (const [label, kit] of [["full gym", FULL_GYM], ["bodyweight at home", []]]) {
  for (const d of [20, 30, 40, 50, 60]) {
    let inRange = 0, n = 0; const got = [];
    for (const t of ["upper", "lower", "full"]) for (let i = 0; i < 30; i++) {
      fresh();
      const s = SB.buildSession({ sessionType: t, durationMins: d, equipmentOverride: kit });
      const m = mins(s); got.push(Math.round(m)); n++;
      if (m >= d * 0.85 && m <= d * 1.15) inRange++;
    }
    // 90 builds each, so a real 3-4% miss rate (a bodyweight hour can run
    // out of distinct moves; the plan then says "About 50 min") cannot
    // flake this, and a broken fill cannot pass it.
    ok(`3. ${label}, ${d} min: at least 9 in 10 builds land within 15%`, inRange / n >= 0.9,
       `${inRange}/${n} in range; outside: ${got.filter(m => m < d * 0.85 || m > d * 1.15).join(",")}`);
  }
}
fresh("low");
const gentle = SB.buildSession({ sessionType: "full", durationMins: 40, equipmentOverride: FULL_GYM });
ok("3r. REVERSAL: a gentle day is shorter than the time asked for, never padded",
   mins(gentle) < 40 * 0.9, `${Math.round(mins(gentle))} min`);

// ── 4. A GYM GETS GYM MOVES ─────────────────────────────────────────────
console.log("\nTEST 4 - at a full gym, strength sessions lead with the kit that is there");
// Measured before the change: 72-74% of an Upper or Full main block at a
// full gym used weights or a machine; the rest were band moves beside an
// unused rack.
let bandsSeen = 0;
for (const t of ["upper", "full"]) {
  let L = 0, N = 0, short = 0;
  for (let i = 0; i < 40; i++) {
    fresh();
    const s = SB.buildSession({ sessionType: t, durationMins: 40, equipmentOverride: FULL_GYM });
    const m = mainOf(s);
    N += m.length; L += m.filter(loaded).length;
    bandsSeen += m.filter(onlyBands).length;
    if (m.filter(loaded).length < 2) short++;
  }
  ok(`4. ${t}: at least 90% of the main block is weights or machines`, N > 0 && L / N >= 0.9,
     `${Math.round(100 * L / N)}%`);
  ok(`4b. ${t}: and every build has at least two`, short === 0, `${short} of 40 had fewer`);
}
ok("4r. bands are still possible at a gym (preferred, not banned)", bandsSeen > 0, `${bandsSeen} band moves in 80 builds`);

// ── 5. A SWAP ARRIVES WITH A DOSE ───────────────────────────────────────
console.log("\nTEST 5 - swapping in a strength move gives it sets and reps");
fresh();
const base = SB.buildSession({ sessionType: "lower", durationMins: 40, equipmentOverride: FULL_GYM });
const pools = SB.buildCandidatePools({ sessionType: "lower", durationMins: 40, equipmentOverride: FULL_GYM });
const idx = base.exercises.findIndex(e => e.section === "main" && COUNTED.has(e.movementPattern));
const alt = (pools.main || []).find(e => COUNTED.has(e.movementPattern) && e.reps == null && e.id !== base.exercises[idx]?.id);
ok("5pc. there is a rep-less strength move to swap in", idx > -1 && !!alt);
const swapped = SB.swapExerciseInSession(base, idx, alt);
ok("5a. it arrives as sets × reps", Number(swapped.exercises[idx]?.sets) > 0 && swapped.exercises[idx]?.reps != null,
   JSON.stringify({ sets: swapped.exercises[idx]?.sets, reps: swapped.exercises[idx]?.reps }));

console.log("");
if (fails) { console.log(`PLAN-DOSE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PLAN-DOSE: all ${passes} assertions pass\n`);
process.exit(0);
