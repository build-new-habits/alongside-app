/**
 * tools/verify-freestyle-reload.mjs
 * 28 Sep 2026 v1
 *
 * F1, FREESTYLE-RELOAD. "Make it up as I go" survives the app closing.
 *
 * Found building P3c: the session lived in module memory only. Moving
 * around the app kept it; closing the app (or the phone reclaiming it
 * between sets) lost every set. The coach's player has carried on across
 * a close since P3a, through the one active-session slot
 * (session-resume.js). This one now uses the same slot.
 *
 * The close is simulated for real: the view is imported a SECOND time
 * under a new URL, so it is a fresh module with empty memory -- what a
 * reopened app has -- and only the store carries anything across.
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

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
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
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const wait = ms => new Promise(r => setTimeout(r, ms));

let FS = null;   // the capture view module currently "running"
let n = 0;
async function openApp() { FS?.onUnmount?.(); FS = await import(B + `views/capture.js?open=${++n}`); }
let navs = [];
const router = { history: [], navigate(v) { navs.push(v); if (v === "capture") paint(); if (v === "today") home(); }, back() {} };
globalThis.router = router; dom.window.router = router;
function paint() { main.innerHTML = FS.render(); FS.onMount(); }
function home() { main.innerHTML = ""; TodayView(router).mount(main); }

const GYM = ["barbell", "bench-flat", "dumbbells-medium", "gym-membership"];
const avail = new Set(EXERCISES.filter(e => exerciseIsAvailable(e, resolveEquipment(GYM))).map(e => e.id));
const [M1, M2] = EXERCISES.filter(e => avail.has(e.id) && (e.equipment || []).some(t => ["barbell", "dumbbell"].includes(t)));

async function fixture() {
  document.getElementById("session-exit-overlay")?.remove();
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "T");
  store.set("gymEquipment", GYM); store.set("equipment", GYM); store.set("sessionLocation", "gym");
  store.set("liftLogEnabled", true);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  await openApp(); navs = []; paint();
}
async function pick(id) {
  let b = main.querySelector(`[data-pick="${id}"]`);
  if (!b) {
    const s = main.querySelector("#cap-search");
    s.value = EXERCISES.find(e => e.id === id).name;
    s.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await wait(300);
    b = main.querySelector(`[data-pick="${id}"]`);
  }
  click(b);
}
function logSet(values) {
  for (const [k, v] of Object.entries(values)) { const i = main.querySelector(`[data-fs-key="${k}"]`); if (i) i.value = String(v); }
  click(main.querySelector("#fs-log"));
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - a real freestyle session with sets logged");
await fixture();
await pick(M1.id); logSet({ weight: 20, reps: 10 }); logSet({ weight: 22.5, reps: 10 });
await pick(M2.id); logSet({ weight: 12, reps: 12 });
ok("0a. two moves, three sets on screen", /20 kg × 10 · 22.5 × 10/.test(txt(main.querySelector(".fs-done"))), txt(main.querySelector(".fs-done")));

// ── 1. THE APP CLOSES ───────────────────────────────────────────────────
console.log("\nTEST 1 - the app closes and reopens: the sets are still there");
await openApp();   // a fresh module: nothing in memory
paint();
ok("1a. reopened, every set is still there", /20 kg × 10 · 22.5 × 10/.test(txt(main.querySelector(".fs-done"))) && new RegExp(`${M2.name}`).test(txt(main)),
   txt(main).slice(0, 200));
ok("1b. and it says it carried on, politely", /Carried on where you were/.test(txt(main.querySelector("[role='status'], [aria-live]"))) || /Carried on where you were/.test(txt(main)));
logSet({ weight: 12, reps: 10 });
click(main.querySelector("#fs-finish"));
const log = store.get("activityLog") || [];
ok("1c. Finish counts the whole session, before and after the close", log.length === 1 && log[0].type === "freestyle" && log[0].setsDone === 4 &&
   JSON.stringify(log[0].exerciseIds) === JSON.stringify([M1.id, M2.id]), JSON.stringify(log[0] || {}));
ok("1d. and nothing is left to carry on", store.get("activeSessionCheckpoint") == null);

// ── 2. HOME OFFERS IT ───────────────────────────────────────────────────
console.log("\nTEST 2 - after a close, Home leads with it");
await fixture();
await pick(M1.id); logSet({ weight: 20, reps: 10 }); logSet({ weight: 20, reps: 10 });
await openApp(); navs = []; home();
const card = main.querySelector(".home-carry");
ok("2a. the Carry-on card names it and what is done", !!card && /Make it up as I go/.test(txt(card)) && /1 move · 2 sets so far/.test(txt(card)), txt(card));
click(main.querySelector('[data-action="carry-on"]'));
ok("2b. Carry on goes back into it, sets intact", navs.at(-1) === "capture" && /Set 1 20 kg × 10 ?Set 2 20 kg × 10/.test(txt(main)) && /Log set 3/.test(txt(main)), JSON.stringify(navs) + " " + txt(main).slice(0, 300));
await openApp(); navs = []; home();
click(main.querySelector('[data-action="carry-finish"]')); await wait(50);
const log2 = store.get("activityLog") || [];
ok("2c. Finish here and save saves it and goes to the finish", navs.at(-1) === "reflect" && log2.length === 1 && log2[0].setsDone === 2, `${JSON.stringify(navs)} ${JSON.stringify(log2[0] || {})}`);
home();
ok("2d. and the card has gone", !main.querySelector(".home-carry"));

// ── 3. LEAVING WITHOUT SAVING ───────────────────────────────────────────
console.log("\nTEST 3 - leaving without saving leaves nothing to come back to");
await fixture();
await pick(M1.id); logSet({ weight: 20, reps: 10 });
click(main.querySelector("#fs-exit")); click(document.querySelector("#exit-confirm-discard"));
await openApp(); home();
ok("3a. no card, nothing saved", !main.querySelector(".home-carry") && (store.get("activityLog") || []).length === 0);
await fixture();
ok("3c. opening it fresh with no sets writes no checkpoint", store.get("activeSessionCheckpoint") == null);

// ── 4. ONE SLOT, NOT TWO SESSIONS ───────────────────────────────────────
console.log("\nTEST 4 - it never throws away the coach's session");
await fixture();
store.set("activeSessionCheckpoint", { sessionType: "workout", sessionId: "x|y", index: 1, set: 1, name: "Upper", startedAt: new Date().toISOString(), checkpointedAt: new Date().toISOString() });
await openApp(); paint();
click(main.querySelector("#fs-exit")); click(document.querySelector("#exit-confirm-discard"));
ok("4a. leaving an empty freestyle does not clear a workout's carry-on", store.get("activeSessionCheckpoint")?.sessionType === "workout");

console.log("");
if (fails) { console.log(`FREESTYLE-RELOAD: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FREESTYLE-RELOAD: all ${passes} assertions pass\n`);
process.exit(0);
