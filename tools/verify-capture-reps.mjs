/**
 * tools/verify-capture-reps.mjs
 * 30 Sep 2026 v1
 *
 * W3-15 CAPTURE-REPS (persona Wave 3, 2.4: an ex-athlete who writes her
 * own routine and logs it). In "Make it up as I go" -- and on the coach
 * player's log card, which asks the same function -- Push-up, Reverse
 * Lunge, Glute Bridge, Bulgarian Split Squat and dozens more asked only
 * for Minutes. performanceFields() read "has a duration" as "is a hold",
 * and almost every move in the library carries a duration (the time
 * estimate). Kit it did not list -- pull-up bar, dip station, TRX,
 * landmine, sandbag, weighted vest -- fell into the same branch.
 *
 *   1. Every strength move (push, pull, squat, hinge, lunge, carry, hip
 *      extension, calf raise, eccentric) asks for reps, unless it is a
 *      hold; with a load it can carry, weight too.
 *   2. Holds still ask for time: planks, wall sits, isometrics, and moves
 *      whose reps are given in seconds. Machines still ask level, minutes
 *      and distance.
 *   3. Through the real capture screen: a push-up logged as 12 reps is
 *      shown and saved as 12 reps.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const RealDate = Date;
let FIXED = new RealDate(2026, 8, 30, 9, 0, 0).getTime();
class FakeDate extends RealDate {
  constructor(...a) { if (a.length) super(...a); else super(FIXED); }
  static now() { return FIXED; }
}
globalThis.Date = FakeDate; dom.window.Date = FakeDate;
const later = mins => { FIXED += mins * 60000; };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { performanceFields } = await import(B + "session-log.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { resolveEquipment, exerciseIsAvailable } = await import(B + "data/equipment-map.js");
const { TodayView } = await import(B + "views/today.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const keys = e => performanceFields(e).map(f => f.key);
const STRENGTH = new Set(["push", "pull", "squat", "hinge", "lunge", "carry", "hip-extension", "calf-raise", "eccentric-control"]);
const HOLD = e => e.movementPattern === "isometric" || /\b(hold|plank|isometric|wall sit)\b/i.test(e.name || "") || /\bsec(ond)?s?\b|\bhold\b/i.test(String(e.reps || ""));
const LOAD = ["dumbbell", "kettlebell", "barbell", "medicine-ball", "cable-machine", "sandbag", "landmine", "weighted-vest", "ankle-weights", "leg-press-machine", "leg-curl-machine", "chest-press-machine", "sled"];
const MACHINE = ["treadmill", "exercise-bike", "elliptical", "stair-climber", "rowing-machine", "ski-erg", "bicycle"];

console.log("\nTEST 1 - strength moves ask for reps");
const strength = EXERCISES.filter(e => STRENGTH.has(e.movementPattern) && !HOLD(e) && !(e.equipment || []).some(q => MACHINE.includes(q)));
const noReps = strength.filter(e => !keys(e).includes("reps") && !keys(e).includes("tension"));
const noWeight = strength.filter(e => (e.equipment || []).some(q => LOAD.includes(q)) && !keys(e).includes("weight"));
ok("1pc. the library's strength moves are found", strength.length > 100, String(strength.length));
ok("1a. every one asks for reps", noReps.length === 0, `${noReps.length}: ${noReps.slice(0, 10).map(e => e.id).join(", ")}`);
ok("1b. with a load it can carry, weight too", noWeight.length === 0, `${noWeight.length}: ${noWeight.slice(0, 8).map(e => `${e.id} [${e.equipment}]`).join(", ")}`);
const named = ["push-up", "reverse-lunge", "glute-bridge", "bulgarian-split-squat", "inverted-row-table"].filter(id => EXERCISES.some(e => e.id === id));
ok("1c. the named ones: Push-up, Reverse Lunge, Glute Bridge, Bulgarian Split Squat, Inverted Row", named.length >= 4 && named.every(id => keys(EXERCISES.find(e => e.id === id)).includes("reps")),
   named.map(id => `${id}: ${keys(EXERCISES.find(e => e.id === id))}`).join("; "));

console.log("\nTEST 2 - controls: holds and machines");
const holds = EXERCISES.filter(e => (e.movementPattern === "isometric" || /\bplank\b|wall sit/i.test(e.name || "")) && !(e.equipment || []).some(q => LOAD.includes(q) || MACHINE.includes(q)));
ok("2pc. holds are found", holds.length >= 10, String(holds.length));
ok("2a. a hold still asks for time, not reps", holds.every(e => keys(e).includes("durationMins") && !keys(e).includes("reps")),
   holds.filter(e => !keys(e).includes("durationMins") || keys(e).includes("reps")).map(e => e.id).slice(0, 6).join(", "));
const machines = EXERCISES.filter(e => (e.equipment || []).some(q => MACHINE.includes(q)));
ok("2b. a machine still asks level or speed, and minutes", machines.every(e => keys(e).includes("durationMins")), machines.filter(e => !keys(e).includes("durationMins")).map(e => e.id).slice(0, 5).join(", "));

console.log("\nTEST 3 - through Make it up as I go");
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const FS = await import(B + "views/capture.js");
const router = { history: [], navigate() {}, back() {} };
globalThis.router = router; dom.window.router = router;
localStorage.clear(); store.init();
store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Sam");
store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
store.set("homeEquipment", ["yoga-mat"]); store.set("equipment", ["yoga-mat"]); store.set("sessionLocation", "home"); store.set("liftLogEnabled", true);
main.innerHTML = FS.render(); FS.onMount();
const pu = EXERCISES.find(e => e.id === "push-up");
const s = main.querySelector("#cap-search");
s.value = pu.name; s.dispatchEvent(new dom.window.Event("input", { bubbles: true })); await wait(300);
main.querySelector(`[data-pick="${pu.id}"]`)?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const repsIn = main.querySelector('[data-fs-key="reps"]');
ok("3a. picking Push-up offers a Reps box", !!repsIn, [...main.querySelectorAll("[data-fs-key]")].map(i => i.dataset.fsKey).join(","));
if (repsIn) repsIn.value = "12";
main.querySelector("#fs-log")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("3b. the set shows as 12 reps", /Set 1 12 reps/.test(txt(main.querySelector(".fs-sets"))), txt(main.querySelector(".fs-sets")) || "(no sets list)");
main.querySelector("#fs-finish")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const last = store.lastLift(pu.id) || {};
ok("3c. and it is kept as 12 reps", Number(last.reps) === 12, JSON.stringify(last));

console.log("");
if (fails) { console.log(`CAPTURE-REPS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`CAPTURE-REPS: all ${passes} assertions pass\n`);
process.exit(0);
