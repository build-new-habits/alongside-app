/**
 * tools/verify-lift-order.mjs
 * 17 Oct 2026 v1
 *
 * W6-11 LIFT-ORDER (Wave 6, persona 2.15: a strong lifter at the gym;
 * Stage W6 session 6). Power Clean, Kettlebell Snatch and Kettlebell Clean
 * came 4th or later in the main section, after carries and throws (38 of
 * 40 Lower 60), and a back squat was sometimes appended last; the plan's
 * minutes left out the warm-up sets a barbell lift needs. Now the main
 * section is ordered by demand after the top-up, the explosive lifts still
 * after the strength hinge (W3-18), and a heavy barbell lift's estimate
 * carries three minutes of warm-up sets.
 */
import fs from "node:fs";

const _mem = {};
globalThis.localStorage = {
  getItem: k => (k in _mem ? _mem[k] : null),
  setItem: (k, v) => { _mem[k] = String(v); },
  removeItem: k => { delete _mem[k]; }, clear() {}
};
globalThis.window = globalThis;
try {
  Object.defineProperty(globalThis, "navigator",
    { value: { onLine: true, userAgent: "node" }, configurable: true });
} catch {}

const { store }        = await import("../js/store.js");
const { buildSession } = await import("../js/session-builder.js");

// GATE-PATH, 08 Sep 2026. Paths resolved from import.meta.url, not the
// working directory.
//
// 72 of 139 gates read files by a path relative to process.cwd(), so
// they were green from the repo root and read NOTHING from anywhere
// else. Not a live fault -- every session so far has run them from the
// root -- but an expensive trap: a session running the suite by full
// path from elsewhere sees most of it red and reasonably concludes the
// app is broken.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);



const ASKED = "2026-07-24T08:00:00.000Z";
const BASE = {
  onboardingComplete: true, name: "Test", ageBand: "30-39", tier: "free",
  fitnessLevel: "advanced", goals: ["get-stronger"], conditions: [],
  conditionPainScores: {}, trainingIntent: "improve", sessionVariety: "balanced",
  lifestyle: { activityLevel: "very-active", stressLevel: "moderate",
               sleepQuality: "good", exerciseHistory: "active", returningAfter: null },
  availableTime: 45, activityLog: [], checkinHistory: {}, exerciseHistory: {},
  createdAt: ASKED, updatedAt: ASKED
};

// Re-seed AND re-init between runs: session-builder.js imports the store
// unsuffixed, so a second profile otherwise reads the first one's state.
// That leak produced confidently wrong results during the C3 build.
function sessionFor(capability, equipment, type = "full", mins = 45) {
  _mem["alongside_user"] = JSON.stringify({ ...BASE, capability, equipment });
  store.init();
  return (buildSession({ sessionType: type, durationMins: mins })?.exercises) || [];
}
const adaptiveIn = ex => ex.filter(e => e.adaptive === true);

const FULL_KIT = ["barbell", "dumbbells", "bench", "squat-rack", "cable-machine",
                  "pull-up-bar", "kettlebell", "resistance-bands"];
const CAPABLE   = { chairRise: "yes", floorAccess: "yes", bothFeet: "yes",
                    balanceWorry: "no", legPower: "full", askedAt: ASKED };
const NEEDS_SEATED = { chairRise: "no", floorAccess: "no", bothFeet: "no",
                       balanceWorry: "yes", legPower: "none", askedAt: ASKED };
const NEVER_ASKED  = { chairRise: null, floorAccess: null, bothFeet: null,
                       balanceWorry: null, legPower: null, askedAt: null };


let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const { equipmentForLocation, exerciseSeconds } = await import("../js/session-builder.js");
_mem["alongside_user"] = JSON.stringify({ ...BASE, capability: { chairRise: "yes", floorAccess: "yes", bothFeet: "yes", balanceWorry: "no", legPower: "full", askedAt: ASKED },
  equipment: ["gym-membership"], gymEquipment: ["gym-membership"], sessionLocation: "gym", trainingIntent: "improve" });
store.init();
const kit = equipmentForLocation("gym").list;
const POWER = e => /\b(clean|snatch|jerk)\b|swing/i.test(e.name || "");
const LATE  = e => /carry|throw|slam/i.test(e.name || "") || ["carry", "isometric"].includes(e.movementPattern);
const BARBELL = e => (e.equipment || []).includes("barbell") && ["squat", "hinge", "push", "pull", "lunge"].includes(e.movementPattern) && !/clean|snatch|jerk|swing|throw|jump/i.test(e.name || "");
const HINGE_STR = e => e.movementPattern === "hinge" && !/swing|snatch|\bclean\b|jerk|throw|slam|jump/i.test(e.name || "");
const HINGE_BAL = e => e.movementPattern === "hinge" && /swing|snatch|\bclean\b|jerk|throw|slam|jump/i.test(e.name || "");
let seenPower = 0, afterLate = [], barbellLast = [], hingeOrder = [], warm = 0, warmBad = [];
for (const type of ["lower", "full"]) for (let i = 0; i < 40; i++) {
  const s = buildSession({ sessionType: type, durationMins: 60, equipmentOverride: kit, preset: null });
  const main = s.exercises.filter(e => (e.section || "main") === "main" && !e._feature && !e.isPrescribed);
  const firstLate = main.findIndex(LATE);
  main.forEach((e, k) => { if (POWER(e)) { seenPower++; if (firstLate >= 0 && k > firstLate) afterLate.push(`${type}: ${main.map(x => x.name).join(" > ")}`); } });
  if (main.length > 2 && BARBELL(main[main.length - 1]) && main.some(e => !BARBELL(e))) barbellLast.push(main.map(x => x.name).join(" > "));
  const hs = main.findIndex(HINGE_STR), hb = main.findIndex(HINGE_BAL);
  if (hs >= 0 && hb >= 0 && hb < hs) hingeOrder.push(main.map(x => x.name).join(" > "));
  for (const e of main.filter(BARBELL)) { warm++; const bare = exerciseSeconds({ ...e, equipment: [] }); if (exerciseSeconds(e) - bare !== 180) warmBad.push(e.name); }
}
ok("pc. the gym builds include explosive lifts", seenPower > 10, String(seenPower));
ok("a. no clean, snatch, jerk or swing after a carry, throw or hold (80 builds)", afterLate.length === 0, afterLate.slice(0, 2).join("\n        "));
ok("b. a heavy barbell lift is never left last", barbellLast.length === 0, barbellLast.slice(0, 2).join("\n        "));
ok("c. W3-18 kept: the strength hinge before the explosive one", hingeOrder.length === 0, hingeOrder.slice(0, 2).join("\n        "));
ok("d. a heavy barbell lift's minutes include its warm-up sets", warm > 0 && warmBad.length === 0, `${warm} seen; without: ${[...new Set(warmBad)].join(", ")}`);
console.log(`\nVERIFY-LIFT-ORDER: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
