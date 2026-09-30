/**
 * tools/verify-s1-legs.mjs
 * 30 Sep 2026 v1
 *
 * S1-LEGS (found building the S1 clinical pack, 29 Sep). 400 real builds
 * as somebody who answers "Not easily" to the chair question (balance
 * "Sometimes", leg question skipped, floor "Yes") gave them moves the
 * leg, balance and impact gates exist to keep from them. The gates were
 * right; what they read was not:
 *   - one-leg movements not tagged balanceDemand (Standing Quad Stretch,
 *     Standing Hip Circles, Standing Hip Abduction, Hip CARs and more);
 *   - running tagged impact: false (Figure-8 Run, every run in the
 *     library: P16 checked jumps and sprints, never running itself);
 *   - Crescent Lunge, "back knee lowered to the floor", tagged standing;
 *   - held squats standing against a wall (Wall Sit, Wall Squat Hold)
 *     were not "loading the legs" because their pattern is isometric
 *     and their difficulty is 2 -- the proxy measured the wrong thing,
 *     exactly as C1 found for Seated Leg Extension on 12 Aug;
 *   - Wall Sit said "Hold as long as possible ... then extend further"
 *     and Standing Hip Circles "Maximise the range": maximal cues the
 *     clinical principle (CL-5, 16 Sep) rules out.
 *
 * Which moves suit whom stays the physio's question (pack section 4).
 * Whether a tag agrees with the card's own words is data, and whether a
 * held squat loads the legs is not a matter of opinion.
 *
 *   1. Words and tags agree: stands on one leg -> balanceDemand; runs or
 *      jogs -> impact; knee or body on the floor -> floor. Reviewed
 *      exceptions are listed with the words that make them one.
 *   2. No movement cue asks for a maximum.
 *   3. Through the real builder, for the pack's person: none of the named
 *      moves. Controls: a fit person still gets them (the filter, not a
 *      deletion, did it), and supported moves the pack's person should
 *      keep are still offered.
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
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const words = e => [...(e.instructions || []), e.description || "", ...(e.cues || []), e.setup || ""].join(" | ");
const byId = Object.fromEntries(EXERCISES.map(e => [e.id, e]));

// ── 1. WORDS AND TAGS ───────────────────────────────────────────────────
console.log("\nTEST 1 - one leg -> balance; running -> impact; knee on the floor -> floor");
const ONE_LEG = /\b(stand|standing|balance) on (one|your (left|right)|a single) (leg|foot)\b|\bsingle[- ]leg\b/i;
const ONE_LEG_OK = {
  "pilates-sequence-beginner": "Single Leg Stretch -- a Pilates move lying on the back",
  "pilates-sequence-core": "Single Leg Stretch -- a Pilates move lying on the back",
  "chair-supported-hip-abduction": "both hands resting on the back of a sturdy chair: support is the point (pack section 4)",
};
const RUNNING = /\b(run|runs|running|jog|jogging)\b/i;
const RUNNING_OK = {
  "hip-cars": "\"speed hides restriction\" -- no running",
  "sport-cooldown-general": "\"Easy walk or jog\" -- walking is offered",
  "swim-hard-200": "swimming",
};
const KNEE_FLOOR = /\b(back )?knee (lowered |down )?(to|on) the floor\b|\bhalf[- ]kneeling\b/i;
const balMis = [], runMis = [], kneeMis = [];
for (const e of EXERCISES) {
  const t = words(e);
  if (ONE_LEG.test(t) && e.balanceDemand !== true && !ONE_LEG_OK[e.id]) balMis.push(`${e.id} "${t.match(ONE_LEG)[0]}"`);
  if (RUNNING.test(t) && e.impact !== true && !RUNNING_OK[e.id]) runMis.push(`${e.id} "${t.match(RUNNING)[0]}"`);
  if (KNEE_FLOOR.test(t) && e.position !== "floor") kneeMis.push(`${e.id} [${e.position}]`);
}
ok("1pc. the library is read", EXERCISES.length > 500, String(EXERCISES.length));
ok("1a. every one-leg instruction is tagged balanceDemand", balMis.length === 0, `${balMis.length}: ${balMis.join("; ")}`);
ok("1b. every run or jog is tagged impact", runMis.length === 0, `${runMis.length}: ${runMis.join("; ")}`);
ok("1c. every knee-on-the-floor is tagged floor", kneeMis.length === 0, kneeMis.join("; "));
const stale = [...Object.keys(ONE_LEG_OK), ...Object.keys(RUNNING_OK)].filter(id => !byId[id]);
ok("1d. every reviewed exception still exists", stale.length === 0, stale.join(", "));

// ── 2. NO MAXIMUMS ──────────────────────────────────────────────────────
console.log("\nTEST 2 - no movement cue asks for a maximum");
const MAX = /as long as (you )?(possible|can)|then extend further|maximi[sz]e the range/i;
// Breath is not a range of movement: "breathe out ... as long as possible" is a breath.
const maxes = EXERCISES.filter(e => MAX.test(words(e)) && !/breath/i.test(e.movementPattern || ""))
  .map(e => `${e.id} "${words(e).match(MAX)[0]}"`);
ok("2a. no hold or range asks for a maximum", maxes.length === 0, maxes.join("; "));
ok("2b. Wall Sit still says how to hold it", /steady/i.test(words(byId["isometric-wall-sit"] || {})));

// ── 3. THE REAL BUILDER ─────────────────────────────────────────────────
console.log("\nTEST 3 - through the real builder, for the pack's person");
const KIT = ["dumbbells-light", "dumbbells-heavy", "yoga-mat", "bands", "kettlebell", "barbell",
             "cable-machine", "bench", "treadmill", "cross-trainer", "rowing-machine", "bike"];
function person(cap) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("capability", { askedAt: new Date().toISOString(), ...cap });
}
function sweep(runs) {
  const seen = new Set();
  for (const t of SB.SESSION_TYPES) for (let i = 0; i < runs; i++) {
    try { SB.buildSession({ sessionType: t.id, durationMins: 30, equipmentOverride: KIT }).exercises.forEach(x => seen.add(x.id)); } catch {}
  }
  return seen;
}
// Crescent Lunge's fault was its floor tag, so it is proven in 3d, for
// somebody who cannot get to the floor. For somebody who can, whether a
// kneeling lunge suits limited legs is the physio's question (pack s.4).
const NAMED = ["isometric-wall-sit", "drill-figure-8-run", "hip-cars",
               "hip-circles-standing", "standing-quad-stretch", "standing-hip-abduction"];
const WALL_SQUAT = EXERCISES.find(e => e.name === "Wall Squat Hold — Isometric")?.id;
ok("3pc. every named move exists", NAMED.every(id => byId[id]) && !!WALL_SQUAT, NAMED.filter(id => !byId[id]).join(", "));
const named = [...NAMED, WALL_SQUAT];

person({ balanceWorry: "sometimes", chairRise: "not-easily", legPower: null, floorAccess: "yes" });
const p = store.capabilityProfile();
ok("3pc2. the pack's person reads as the pack describes (legs usable, not loadable; balance and impact held)",
   p.legsUsable && !p.legsLoadable && !p.balanceSafe && !p.impactSafe && !p.needsSeated, JSON.stringify(p));
const careful = sweep(25);
ok("3pc3. the careful sweep still builds sessions", careful.size > 40, `${careful.size} distinct`);
const got = named.filter(id => careful.has(id));
ok("3a. none of the named moves reach them", got.length === 0, got.map(id => byId[id].name).join(", "));
ok("3b. they keep supported standing work (Supported Standing Hip Abduction or Supported Calf Raise)",
   ["chair-supported-hip-abduction"].some(id => careful.has(id)) ||
   EXERCISES.some(e => e.name === "Supported Calf Raise" && careful.has(e.id)));

person({ balanceWorry: "no", chairRise: "yes", legPower: "full", floorAccess: "yes" });
const fit = sweep(10);
const fitGot = [...named, "yoga-crescent-lunge"].filter(id => fit.has(id));
person({ balanceWorry: "sometimes", chairRise: "not-easily", legPower: null, floorAccess: "no" });
const noFloor = sweep(15);
ok("3d. cannot get to the floor: no Crescent Lunge", !noFloor.has("yoga-crescent-lunge"));

ok("3c. control: a fit person still gets several of them (the filter did it, not a deletion)", fitGot.length >= 3, fitGot.join(", "));

console.log("");
if (fails) { console.log(`S1-LEGS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`S1-LEGS: all ${passes} assertions pass\n`);
process.exit(0);
