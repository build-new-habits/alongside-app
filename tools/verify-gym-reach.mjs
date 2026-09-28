/**
 * tools/verify-gym-reach.mjs
 * 28 Sep 2026 v1
 *
 * Work list 5. GYM-REACH-1: cardio at the gym uses the machines, and the
 * treadmill appears.
 *
 * Measured on v556, full gym kit declared, 60 builds at each length:
 * Cardio 20, 30, 40 and 60 minutes offered ZERO machine blocks. Every
 * machine entry is 15-30 minutes, so isSessionLength() keeps it out of an
 * ordinary slot -- deliberately (DATA-1: a 25-minute treadmill block is
 * not one of ten slots). Gym (GYM-MIX-1) reaches them through a feature
 * slot; Cardio had none, and PURPOSE-ASK routes "general fitness" to
 * Cardio. So somebody who told the app they have a treadmill never saw it.
 *
 * The fix is Gym's own mechanism: Cardio declares a feature slot that
 * needs a machine. At home with no machine it is empty and Cardio is
 * unchanged. It only takes a block that leaves room for the warm-up,
 * some moves and the cool-down (15 minutes), so the session still fills
 * the time asked for rather than running over it.
 *
 * ⚫ "DECLARED, AVAILABLE, NEVER OFFERED". Test 4 is the general form the
 * 12 Sep plan asked for: every equipment-gated entry is offered by some
 * session type when its kit is declared. Measured: with every pickable
 * item declared at a very-active ceiling, 155 of 160 are in a pool; the
 * five that are not are rehabilitation entries, which arrive through a
 * condition programme (conditionProgrammes.js selects by the area worked),
 * not the general pools -- by design (session-builder keeps rehabilitation
 * out unless an entry is marked generalPurpose).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM("<!doctype html>", { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const EX = await import(B + "data/exercises/index.js");
const EQ = await import(B + "data/equipment.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};

const MACHINES = ["treadmill", "exercise-bike", "rowing-machine", "elliptical", "stair-climber"];
const LIFTING = ["dumbbells-light", "dumbbells-medium", "dumbbells-heavy", "kettlebell-medium", "barbell",
  "band-light", "band-medium", "bench-flat", "pull-up-bar", "foam-roller", "gym-membership"];
const GYM = [...LIFTING, ...MACHINES];
const fresh = () => {
  localStorage.clear(); store.init();
  store.set("conditions", []); store.set("conditionPainScores", {}); store.set("todayIntensity", "moderate");
};
const mins = s => (s?.exercises || []).reduce((a, e) => a + SB.exerciseSeconds(e), 0) / 60;
const blocks = EX.EXERCISES.filter(e => EX.isCardioMachine(e) && EX.isSessionLength(e));
// `level` sets the declared activity level: "available" includes being
// within the person's difficulty ceiling (active: 6), so the harder
// interval blocks are asked of somebody who said they are active.
const build = (d, kit, level = null) => {
  fresh(); if (level) { store.set("fitnessLevel", null); store.set("lifestyle.activityLevel", level); }
  return SB.buildSession({ sessionType: "cardio", durationMins: d, equipmentOverride: kit });
};
const machineIn = s => (s?.exercises || []).filter(e => EX.isCardioMachine(e) && EX.isSessionLength(e));

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the fixture builds real cardio sessions at a gym");
const probe = build(40, GYM);
ok("0a. a Cardio session builds with the gym kit", (probe?.exercises || []).length > 3);
ok("0b. the library holds long machine blocks for every machine", MACHINES.every(m => blocks.some(e => (e.equipment || []).includes(m))),
   blocks.map(e => `${e.id}[${e.equipment}]`).join(", "));

// ── 1. CARDIO AT THE GYM USES A MACHINE ─────────────────────────────────
console.log("\nTEST 1 - Cardio at the gym gets one machine block, and every machine is offered");
const seen = new Map(); let withBlock = 0, oneOnly = true, leads = true;
const N = 200;
for (let i = 0; i < N; i++) {
  const s = build(60, GYM, "active");
  const m = machineIn(s);
  if (m.length) withBlock++;
  if (m.length > 1) oneOnly = false;
  const main = s.exercises.filter(e => e.section === "main");
  if (m.length && main[0]?.id !== m[0].id) leads = false;
  for (const e of m) seen.set(e.id, (seen.get(e.id) || 0) + 1);
}
ok("1a. a 60-minute Cardio at the gym has a machine block every time", withBlock === N, `${withBlock}/${N}`);
ok("1b. exactly one, and it leads the main part", oneOnly && leads);
const never = blocks.filter(e => !seen.has(e.id)).map(e => e.id);
ok("1c. DECLARED, AVAILABLE, OFFERED: every machine block appears within 200 builds (an active person)", never.length === 0, `never: ${never.join(", ")}`);
let tread = 0, treadMod = 0;
for (let i = 0; i < 100; i++) if (machineIn(build(40, GYM, "active")).some(e => (e.equipment || []).includes("treadmill"))) tread++;
ok("1d. the treadmill appears in a 40-minute Cardio (an active person: the 25-minute intervals)", tread > 0, `${tread}/100`);
for (let i = 0; i < 100; i++) if (machineIn(build(50, GYM)).some(e => (e.equipment || []).includes("treadmill"))) treadMod++;
ok("1e. and in a 50-minute Cardio at the default level (the incline walk)", treadMod > 0, `${treadMod}/100`);

// ── 2. REVERSAL: NOT DECLARED, NEVER OFFERED ────────────────────────────
console.log("\nTEST 2 - a machine you did not declare never appears");
// Without "gym-membership": a membership implies the gym's machines
// (equipment-map EQUIPMENT_IMPLIES), so it would declare the treadmill.
const noTread = GYM.filter(k => k !== "treadmill" && k !== "gym-membership");
let treadLeak = 0, stillBlock = 0;
for (let i = 0; i < 150; i++) {
  const s = build(60, noTread, "active");
  if (s.exercises.some(e => (e.equipment || []).includes("treadmill"))) treadLeak++;
  if (machineIn(s).length) stillBlock++;
}
ok("2a. no treadmill without a treadmill", treadLeak === 0, `${treadLeak}/150`);
ok("2b. and another machine still takes the slot", stillBlock === 150, `${stillBlock}/150`);
let homeBlock = 0, homeLong = 0;
for (let i = 0; i < 60; i++) {
  const s = build(40, ["band-light", "dumbbells-light"]);
  if (machineIn(s).length) homeBlock++;
  if (s.exercises.some(e => EX.isSessionLength(e))) homeLong++;
}
ok("2c. at home with no machine, Cardio is as it was: no machine block, nothing session-length", homeBlock === 0 && homeLong === 0, `${homeBlock} / ${homeLong}`);

// ── 3. IT STILL FILLS THE TIME ASKED FOR ────────────────────────────────
console.log("\nTEST 3 - the machine block leaves room, and the session fits the time");
for (const d of [20, 30, 40, 50, 60]) {
  let inRange = 0, over = 0; const got = [];
  for (let i = 0; i < 40; i++) {
    const s = build(d, GYM);
    const m = mins(s); got.push(Math.round(m));
    if (m >= d * 0.85 && m <= d * 1.15) inRange++;
    if (machineIn(s).some(e => SB.exerciseSeconds(e) / 60 > d - 15)) over++;
  }
  ok(`3. ${d} min: no block longer than the time minus 15, and 9 in 10 land within 15%`,
     over === 0 && inRange / 40 >= 0.9, `over ${over}; ${inRange}/40 in range; ${got.join(",")}`);
}

// ── 4. EVERY DECLARED KIT IS OFFERED SOMEWHERE ──────────────────────────
console.log("\nTEST 4 - declared, available, never offered: the general audit");
const ALL = EQ.getAllEquipmentItems().map(i => i.id);
const pooled = new Set();
for (const { id } of SB.SESSION_TYPES) for (const d of [20, 40, 60]) {
  fresh(); store.set("fitnessLevel", null); store.set("lifestyle.activityLevel", "very-active");
  const p = SB.buildCandidatePools({ sessionType: id, durationMins: d, equipmentOverride: ALL }) || {};
  for (const list of Object.values(p)) if (Array.isArray(list)) list.forEach(e => pooled.add(e.id));
}
const gated = EX.EXERCISES.filter(e => (e.equipment || []).some(q => q && q !== "none" && q !== "bodyweight"));
const components = gated.filter(e => !EX.isSessionLength(e));
ok("4a. fixture reach: a real set of kit-gated entries", components.length > 120 && ALL.length > 40, `${components.length} entries, ${ALL.length} kit items`);
// The builder keeps rehabilitation entries out of the GENERAL pools unless
// marked generalPurpose; conditionProgrammes.js offers them by the area
// they work. So an exception must have an area, or nothing can reach it.
const rehab = e => e.category === "rehabilitation" && e.generalPurpose !== true;
const unoffered = components.filter(e => !pooled.has(e.id) && !rehab(e));
ok("4b. every kit-gated component is offered by some session type when its kit is declared",
   unoffered.length === 0, unoffered.map(e => `${e.id}[${e.equipment}]`).join(", "));
const rehabOnly = components.filter(e => !pooled.has(e.id) && rehab(e));
ok("4c. the only exceptions are rehabilitation entries, each with an area a condition programme can reach it by",
   rehabOnly.every(e => (e.affectsAreas || []).length > 0), rehabOnly.map(e => `${e.id}:${(e.affectsAreas || []).join("/")}`).join(", "));
const machineBlocksPooled = blocks.filter(e => pooled.has(e.id));
ok("4d. and every long machine block is in a pool (Gym's or Cardio's feature slot)", machineBlocksPooled.length === blocks.length,
   blocks.filter(e => !pooled.has(e.id)).map(e => e.id).join(", "));

console.log("");
if (fails) { console.log(`GYM-REACH: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`GYM-REACH: all ${passes} assertions pass\n`);
process.exit(0);
