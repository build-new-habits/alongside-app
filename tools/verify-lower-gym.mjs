/**
 * tools/verify-lower-gym.mjs
 * 03 Oct 2026 v1
 *
 * W5-22 LOWER-BODY-GYM (Wave 5 persona trace: 2.15). Lower Body says
 * "Squat, hinge, single-leg", but in 40 of 40 gym builds the hinge was a
 * Turkish Get-Up (tagged a hinge and rated hardest, so always picked
 * first), never a deadlift or RDL, and the same four accessories came
 * every time (Box Step-Up, Waiter Walk, Pallof Press, Med Ball Throw).
 *
 *   1. 40 gym Lower Body 45 builds: a deadlift or RDL in most.
 *   2. The Get-Up is not the hinge (it is a carry, whole-body).
 *   3. No single accessory set every time.
 *
 * Math.random is seeded (SEED=<n> for another), as verify-mostly-same.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.alert = () => {}; globalThis.alert = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { checkinData } = await import(B + "data/checkin.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const SEED = Number(process.env.SEED) || 20261003;
console.log(`seed ${SEED} (another: SEED=<n> node tools/verify-lower-gym.mjs)`);
Math.random = (() => { let a = SEED >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; })();

const GYM = ["dumbbells-light", "dumbbells-medium", "dumbbells-heavy", "adjustable-dumbbells", "kettlebell-light", "kettlebell-medium", "kettlebell-heavy", "barbell", "ez-curl-bar", "band-light", "band-medium", "band-heavy", "treadmill", "exercise-bike", "rowing-machine", "elliptical", "bench-flat", "bench-adjustable", "pull-up-bar", "dip-station", "stability-ball", "ab-wheel", "foam-roller", "massage-gun", "gym-membership"];
localStorage.clear(); store.init(); agreed(store);
store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "free");
store.set("gymEquipment", GYM); store.set("equipment", GYM);
store.set("goals", ["get-stronger", "build-muscle", "improve-cardio", "prevent-injury"]);
store.set("capability", { chairRise: "yes", floorAccess: null, bothFeet: null, balanceWorry: "no", legPower: null, askedAt: new Date().toISOString(), clearedAt: null });
checkinData.saveCheckin({ energy: 8, mood: 6 });

const eq = SB.equipmentForLocation("gym").list;
const DL = /deadlift|\brdl\b|romanian/i;
let withDL = 0, tguHinge = 0;
const sets = new Map();
for (let i = 0; i < 40; i++) {
  const main = SB.buildSession({ sessionType: "lower", durationMins: 45, equipmentOverride: eq }).exercises.filter(e => e.section === "main");
  if (main.some(e => DL.test(e.name) || DL.test(e.id))) withDL++;
  if (main.some(e => /turkish/i.test(e.name) && e.movementPattern === "hinge")) tguHinge++;
  const acc = main.filter(e => !["squat", "hinge", "lunge"].includes(e.movementPattern)).map(e => e.name).sort().join(" + ");
  sets.set(acc, (sets.get(acc) || 0) + 1);
}
console.log("\nTEST 1 - a deadlift or RDL");
ok("1a. in most of 40 gym Lower Body builds", withDL >= 24, `${withDL} of 40`);
console.log("\nTEST 2 - the Get-Up");
const tgu = EXERCISES.find(e => e.id === "kettlebell-turkish-getup");
ok("2a. not tagged a hinge", tgu && tgu.movementPattern !== "hinge", tgu?.movementPattern);
ok("2b. never the hinge in a build", tguHinge === 0, `${tguHinge} of 40`);
console.log("\nTEST 3 - accessories vary");
if (process.env.SHOW) for (const [k, v] of sets) console.log("   ", v, k);
const top = [...sets.entries()].sort((a, b) => b[1] - a[1])[0];
const each = new Map();
for (const [k, v] of sets) for (const n of k.split(" + ").filter(Boolean)) each.set(n, (each.get(n) || 0) + v);
const always = [...each.entries()].filter(([, v]) => v === 40).map(([n]) => n);
ok("3a. no accessory in every build", always.length === 0, always.join(", "));
ok("3b. no accessory set in more than half", top[1] <= 20, `${top[1]}x: ${top[0]}`);

console.log("");
if (fails) { console.log(`LOWER-GYM: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`LOWER-GYM: all ${passes} assertions pass\n`);
process.exit(0);
