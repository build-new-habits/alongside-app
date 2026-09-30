/**
 * tools/verify-gym-quality.mjs
 * 30 Sep 2026 v1
 *
 * W3-18 GYM-QUALITY (persona Wave 3: 2.4 and 2.15, both gym-literate).
 * Measured on v608, 30 builds each at a gym with a barbell, dumbbells and
 * a kettlebell:
 *   - Lower Body had NO strength hinge in 30 of 30 -- no deadlift, RDL or
 *     hip thrust -- and a Power Clean in every one: the clean's pattern is
 *     "hinge", so it filled the hinge slot. An explosive lift stood in for
 *     the strength it depends on.
 *   - Every lift rested 60 seconds, a barbell squat as a band pull-apart.
 *   - Upper Body was off balance (pushing against pulling by more than
 *     one move) in 7 of 30, and "Coach recommends" picks the first match
 *     of each category, so it can be too.
 *
 *   1. Lower, Glute and Full Body: a strength hinge whenever the kit
 *      allows one; a swing, clean or snatch never instead of it, and after
 *      it. At the gym and at home with dumbbells.
 *   2. Upper Body: pushing and pulling within one of each other, built by
 *      the coach and as "Coach recommends" suggests it.
 *   3. Rest suits the lift: a heavy barbell lift 2 minutes, an explosive
 *      one 90 seconds, the rest as before. A move's own rest is kept.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const GYM = ["barbell", "bench-flat", "dumbbells-medium", "dumbbells-heavy", "kettlebell-medium", "cable-machine", "squat-rack", "gym-membership"];
const HOME = ["dumbbells-medium", "yoga-mat", "bands"];
function person() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
  store.set("fitnessLevel", "active"); store.set("goals", ["get-stronger"]);
  store.set("capability", { askedAt: new Date().toISOString(), balanceWorry: "no", chairRise: "yes", legPower: "full", floorAccess: "yes" });
}
const BALLISTIC = /swing|snatch|\bclean\b|jerk|throw|slam|jump/i;
const main = s => s.exercises.filter(e => (e.section || e.role) === "main" && !e._feature);
const strengthHinge = e => e.movementPattern === "hinge" && !BALLISTIC.test(e.name);
const ballistic = e => e.movementPattern === "hinge" && BALLISTIC.test(e.name);
const RUNS = 30;

console.log("\nTEST 1 - a strength hinge, and never an explosive one instead");
for (const [label, kit] of [["gym", GYM], ["home", HOME]]) for (const t of ["lower", "glute", "full"]) {
  person();
  let without = 0, before = 0, n = 0; const eg = [];
  for (let i = 0; i < RUNS; i++) {
    const m = main(SB.buildSession({ sessionType: t, durationMins: 45, equipmentOverride: kit })); n++;
    const hi = m.findIndex(strengthHinge), bi = m.findIndex(ballistic);
    if (hi < 0) { without++; if (eg.length < 1) eg.push(m.map(e => e.name).join(", ")); }
    if (bi >= 0 && (hi < 0 || bi < hi)) before++;
  }
  ok(`1a-${label}-${t}. every plan has a strength hinge`, without === 0, `${without}/${n} without, e.g. ${eg[0] || ""}`);
  ok(`1b-${label}-${t}. no explosive hinge before (or instead of) it`, before === 0, `${before}/${n}`);
}

console.log("\nTEST 2 - Upper Body: pushing and pulling in balance");
const pp = m => ({ push: m.filter(e => e.movementPattern === "push").length, pull: m.filter(e => e.movementPattern === "pull").length });
for (const [label, kit] of [["gym", GYM], ["home", HOME]]) {
  person();
  let off = 0, offRec = 0; const eg = [];
  for (let i = 0; i < RUNS; i++) {
    const c = pp(main(SB.buildSession({ sessionType: "upper", durationMins: 40, equipmentOverride: kit })));
    if (Math.abs(c.push - c.pull) > 1) { off++; eg.push(`${c.push}/${c.pull}`); }
  }
  const pools = SB.buildCandidatePools({ sessionType: "upper", durationMins: 40, equipmentOverride: kit });
  const ids = ["warmup", "main", "cooldown"].flatMap(sec => pools[sec].filter(e => e.recommended).map(e => e.id));
  const rec = SB.buildSessionFromSelection({ sessionType: "upper", durationMins: 40, selectedIds: ids, equipmentOverride: kit });
  const r = pp(main(rec));
  ok(`2a-${label}. built by the coach: within one, 30 of 30`, off === 0, `${off}/${RUNS} off (push/pull ${eg.slice(0, 5).join(" ")})`);
  ok(`2b-${label}. as Coach recommends suggests it: within one`, Math.abs(r.push - r.pull) <= 1 && r.push + r.pull > 0, `${r.push}/${r.pull}`);
}

console.log("\nTEST 3 - rest suits the lift");
person();
const dose = n => SB.withDefaultDose({ ...EXERCISES.find(e => e.name === n), section: "main" });
const bb = ["Barbell Back Squat", "Barbell Deadlift", "Barbell Hip Thrust"].map(dose);
ok("3a. a heavy barbell lift rests 2 minutes", bb.every(e => e.rest >= 120), bb.map(e => `${e.name} ${e.rest}s`).join(", "));
const pc = dose("Power Clean");
ok("3b. an explosive lift rests 90 seconds", pc.rest === 90, `${pc.rest}s`);
const bw = EXERCISES.find(e => e.id === "push-up");
ok("3c. control: a bodyweight move rests as before", SB.withDefaultDose({ ...bw, section: "main" }).rest === 60);
const own = EXERCISES.find(e => Number(e.rest) > 0 && e.movementPattern === "squat" && (e.equipment || []).includes("barbell"));
ok("3d. a move with its own rest keeps it", !own || SB.withDefaultDose({ ...own, section: "main" }).rest === Number(own.rest), own ? `${own.name} ${own.rest}` : "none in the library");

console.log("");
if (fails) { console.log(`GYM-QUALITY: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`GYM-QUALITY: all ${passes} assertions pass\n`);
process.exit(0);
