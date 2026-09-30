/**
 * tools/verify-interruptions.mjs
 * 30 Sep 2026 v1
 *
 * W3-13 INTERRUPTIONS (persona Wave 3: 2.4, 2.15, 2.16 -- the parent
 * whose sessions are cut short by a child).
 *   - Free: the phone closed the app mid-session and Home said nothing;
 *     the moves done were lost without a word.
 *   - After 3 hours the waiting session (the coach's, or "Make it up as I
 *     go") was deleted without a word, sets and all.
 *   - Starting another session pushed the waiting one out, unsaved.
 *   - Minutes counted the time away: forty minutes with a child were
 *     forty minutes of training.
 *
 *   1. Free Home: "Save what you did" (not Carry on, which is the Plan's)
 *      and "Don't save it".
 *   2. After 3 hours, what was done is saved as it was, and Home says so
 *      once.
 *   3. Another session started: the waiting one is saved first.
 *   4. The coach's player: minutes are the time in the session, not the
 *      time away, and time before a close still counts.
 *   5. Make it up as I go: said up front; saved after 3 hours; minutes
 *      leave out a long gap between sets.
 *
 * A closed app is a fresh copy of the view module (store kept), as in
 * verify-free-carry-on and verify-freestyle-reload. The clock is moved.
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
const SB = await import(B + "session-builder.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { resolveEquipment, exerciseIsAvailable } = await import(B + "data/equipment-map.js");
const { TodayView } = await import(B + "views/today.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
let navs = [];
let workout = await import(B + "views/workout.js");
let FS = await import(B + "views/capture.js");
function paint() { main.innerHTML = workout.render(); try { workout.onMount(); } catch {} }
function paintCap() { main.innerHTML = FS.render(); FS.onMount(); }
function home() { main.innerHTML = ""; TodayView(router).mount(main); }
const router = { history: [], navigate(v) { navs.push(v); if (v === "workout") paint(); if (v === "capture") paintCap(); if (v === "today") home(); }, back() {} };
globalThis.router = router; dom.window.router = router;
const tap = sel => { const el = main.querySelector(sel) || document.querySelector(sel); if (el) el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
let cold = 0;
async function closeApp() {
  workout = await import(B + `views/workout.js?cold=${++cold}`);
  FS?.onUnmount?.(); FS = await import(B + `views/capture.js?cold=${cold}`);
  document.getElementById("session-exit-overlay")?.remove();
}

const GYM = ["dumbbells-medium", "barbell", "bench-flat", "kettlebell-medium", "band-light", "gym-membership"];
function fixture(tier) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Sam");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("tier", tier); store.set("liftLogEnabled", true);
  store.set("gymEquipment", GYM); store.set("equipment", GYM); store.set("sessionLocation", "gym");
  store.set("lastCheckin", { date: new Date().toDateString(), completed: true, energy: 6 });
}
function start(built) {
  store.set("generatedSession", { session: built, builtAt: new Date().toISOString(), inputs: {} });
  navs = []; paint();
}
function doOne(mins = 0) {
  const name = main.querySelector(".exercise-name")?.textContent;
  for (let i = 0; i < 12 && main.querySelector(".exercise-name")?.textContent === name && !navs.includes("reflect"); i++) {
    if (!tap("#wo-set-done-btn") && !tap("#complete-exercise-btn") && !tap("#wo-done-btn")) break;
  }
  if (mins) later(mins);
}
const A = SB.buildSession({ sessionType: "upper", durationMins: 30, equipmentOverride: GYM });
const Bs = SB.buildSession({ sessionType: "lower", durationMins: 30, equipmentOverride: GYM });
const log = () => store.get("activityLog") || [];

// ── 1. FREE HOME ────────────────────────────────────────────────────────
console.log("\nTEST 1 - Free: the phone closed the app mid-session");
fixture("free"); await closeApp(); start(A);
doOne(3); doOne(3); doOne(3);
await closeApp(); home();
const card = main.querySelector(".home-carry");
ok("1pc. three moves done before the close", (store.get("workoutProgress") || []).length === 3);
ok("1a. Free Home shows the session, with Save what you did", !!card && /Save what you did/.test(txt(card)), txt(card) || txt(main).slice(0, 200));
ok("1b. and no Carry on (the Plan's)", !main.querySelector('[data-action="carry-on"]'));
ok("1c. and Don't save it", !!main.querySelector('[data-action="carry-drop"]'));
tap('[data-action="carry-finish"]'); await wait(30);
const saved = log().at(-1) || {};
ok("1d. Save what you did saves the three moves as a part session", saved.status === "partial" && saved.exercisesCount === 3, JSON.stringify(saved).slice(0, 200));

fixture("free"); await closeApp(); start(A); doOne(); doOne();
await closeApp(); home();
tap('[data-action="carry-drop"]'); await wait(30);
ok("1e. Don't save it: nothing saved, nothing waiting", log().length === 0 && !store.get("activeSessionCheckpoint") && !main.querySelector(".home-carry"), `${log().length} entries`);

// ── 2. AFTER THREE HOURS ────────────────────────────────────────────────
console.log("\nTEST 2 - after 3 hours, what was done is saved, and Home says so once");
fixture("free"); await closeApp(); start(A);
doOne(4); doOne(4); doOne(4);
const lastTouch = store.get("activeSessionCheckpoint")?.checkpointedAt;
await closeApp(); later(240); home();
const r = log().at(-1) || {};
ok("2a. the three moves are saved as a part session", r.status === "partial" && r.exercisesCount === 3 && r.rescued === true, JSON.stringify(r).slice(0, 220));
ok("2b. dated when they were done, not when Home opened", r.completedAt === lastTouch, `${r.completedAt} vs ${lastTouch}`);
ok("2c. Home says so", /saved what you did/i.test(txt(main)), txt(main).slice(0, 240));
home();
ok("2d. once", !/saved what you did/i.test(txt(main)) && log().length === 1, `${log().length} entries`);

// ── 3. ANOTHER SESSION STARTED ──────────────────────────────────────────
console.log("\nTEST 3 - another session started: the waiting one is saved first");
fixture("free"); await closeApp(); start(A);
doOne(); doOne(); doOne();
await closeApp(); start(Bs);
const first = log()[0] || {};
ok("3a. the three moves of the first are saved", log().length === 1 && first.status === "partial" && first.exercisesCount === 3, JSON.stringify(log()).slice(0, 200));
ok("3b. and the new session starts at its own first move", main.querySelector(".exercise-name")?.textContent === Bs.exercises[0].name);

// ── 4. MINUTES ──────────────────────────────────────────────────────────
console.log("\nTEST 4 - the coach's player: minutes are the time in the session");
fixture("personal"); await closeApp(); start(A);
doOne(5); doOne(5);                                  // ten minutes in
tap("#exit-workout-btn"); tap("#exit-confirm-later");
later(40);                                           // forty minutes with a child
paint();                                             // Carry on, same app
doOne(5);
tap("#exit-workout-btn"); tap("#exit-confirm-later");
await closeApp(); later(30);                         // the phone closed it; half an hour away
paint();
doOne(5);
for (let i = 0; i < 40 && !navs.includes("reflect"); i++) doOne();
const done = log().at(-1) || {};
ok("4pc. finished", navs.includes("reflect") && done.type === "workout", JSON.stringify(navs.slice(-3)));
ok("4a. about twenty minutes of training, not ninety", done.durationMins >= 18 && done.durationMins <= 24, `${done.durationMins} min`);

// ── 5. MAKE IT UP AS I GO ───────────────────────────────────────────────
console.log("\nTEST 5 - Make it up as I go");
const avail = new Set(EXERCISES.filter(e => exerciseIsAvailable(e, resolveEquipment(GYM))).map(e => e.id));
const [M1] = EXERCISES.filter(e => avail.has(e.id) && (e.equipment || []).some(t => ["barbell", "dumbbell"].includes(t)));
async function pick(id) {
  let b = main.querySelector(`[data-pick="${id}"]`);
  if (!b) {
    const s = main.querySelector("#cap-search");
    s.value = EXERCISES.find(e => e.id === id).name;
    s.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await wait(300);
    b = main.querySelector(`[data-pick="${id}"]`);
  }
  b?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}
function logSet(values) {
  for (const [k, v] of Object.entries(values)) { const i = main.querySelector(`[data-fs-key="${k}"]`); if (i) i.value = String(v); }
  main.querySelector("#fs-log")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}
fixture("personal"); await closeApp(); navs = []; paintCap();
ok("5a. it says up front what happens if you stop", /3 hours/.test(txt(main)) && /save what you.ve logged/i.test(txt(main)), txt(main).slice(0, 300));
await pick(M1.id); logSet({ weight: 20, reps: 10 }); later(3); logSet({ weight: 20, reps: 10 });
await closeApp(); later(240); home();
const fr = log().at(-1) || {};
ok("5b. after 3 hours the sets are saved", fr.type === "freestyle" && fr.setsDone === 2 && fr.rescued === true, JSON.stringify(fr).slice(0, 200));
ok("5c. and Home says so", /saved what you did/i.test(txt(main)));

fixture("personal"); await closeApp(); navs = []; paintCap();
await pick(M1.id); logSet({ weight: 20, reps: 10 }); later(4); logSet({ weight: 20, reps: 10 });
later(60);                                            // an hour away
logSet({ weight: 20, reps: 8 }); later(2);
main.querySelector("#fs-finish")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const fm = log().at(-1) || {};
ok("5d. minutes leave out the hour between sets", fm.type === "freestyle" && fm.durationMins >= 5 && fm.durationMins <= 10, `${fm.durationMins} min`);

console.log("");
if (fails) { console.log(`INTERRUPTIONS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`INTERRUPTIONS: all ${passes} assertions pass\n`);
process.exit(0);
