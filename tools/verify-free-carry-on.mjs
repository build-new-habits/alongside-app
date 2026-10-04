/**
 * tools/verify-free-carry-on.mjs
 * 04 Oct 2026 v2
 *
 * v2 - D-1 EXERCISE-FOUR. Reaches Capture (the fourth step) before the set
 *   buttons; nothing it proves has changed.
 *
 * 29 Sep 2026 v1
 *
 * P4, FREE-CARRY-ON (persona finding W2-4, seen by six of eight).
 *
 *   - The exit sheet offered "Carry on later" on Free, where nothing can
 *     carry on: the Carry-on card is on Plan Home only (the tier table).
 *   - A session left without finishing (the app closed, or Carry on later
 *     never taken up) left workoutProgress behind. The NEXT session then
 *     finished with the old moves counted in ("13 moves" for 10) and the
 *     wrong count logged.
 *   - On the Plan, carry-on quietly expired after 3 hours and nothing said so.
 *
 * Graeme accepted the recommendation (28 Sep, "I'll take your best
 * recommendations"): hide Carry on later on Free; always clear progress
 * that belongs to another session; on the Plan, say it keeps for 3 hours.
 *
 * Driven through the real player. A closed app is a fresh copy of the
 * player module: module memory gone, the store kept, as on a phone.
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
const SB = await import(B + "session-builder.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
let navs = [];
let workout = await import(B + "views/workout.js");
function paint() { main.innerHTML = workout.render(); try { workout.onMount(); } catch { /* player-flow owns this */ } }
const _router = { navigate: v => { navs.push(v); if (v === "workout") paint(); }, back() {} };
globalThis.window.router = _router;
Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });
const tap = sel => { const el = main.querySelector(sel) || document.querySelector(sel); if (el) el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
let cold = 0;
async function reopen() { workout = await import(B + `views/workout.js?cold=${++cold}`); document.getElementById("session-exit-overlay")?.remove(); }

const GYM = ["dumbbells-medium", "barbell", "bench-flat", "kettlebell-medium", "band-light"];
function start(tier, built, builtAt = new Date().toISOString()) {
  store.set("tier", tier);
  store.set("generatedSession", { session: built, builtAt, inputs: {} });
  navs = [];
  paint();
}
function fixture(tier) {
  localStorage.clear(); store.init();
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("tier", tier); store.set("liftLogEnabled", true);
}
// Finish the exercise on screen, whatever kind it is.
function doOne() {
  const name = main.querySelector(".exercise-name")?.textContent;
  for (let i = 0; i < 12 && main.querySelector(".exercise-name")?.textContent === name && !navs.includes("reflect"); i++) {
    if (!tap("#wo-set-done-btn") && !tap("#complete-exercise-btn") && !tap("#wo-done-btn") && !tap('[data-step-go="capture"]:not([aria-current])')) break;
  }
}
const A = SB.buildSession({ sessionType: "upper", durationMins: 30, equipmentOverride: GYM });
const Bs = SB.buildSession({ sessionType: "lower", durationMins: 30, equipmentOverride: GYM });

// ── 1. THE EXIT SHEET ────────────────────────────────────────────────────
console.log("\nTEST 1 - the exit sheet offers Carry on later only where it can carry on");
for (const tier of ["free", "personal"]) {
  fixture(tier); await reopen(); start(tier, A);
  tap("#exit-workout-btn");
  const sheet = document.getElementById("session-exit-overlay");
  const later = document.getElementById("exit-confirm-later");
  ok(`1pc-${tier}. the sheet opened with its other choices`, !!sheet && !!document.getElementById("exit-confirm-stay") && !!document.getElementById("exit-confirm-leave") && !!document.getElementById("exit-confirm-discard"));
  if (tier === "free") ok("1a. Free: no Carry on later", !later, sheet?.textContent.replace(/\s+/g, " "));
  else {
    const desc = later && document.getElementById(later.getAttribute("aria-describedby") || "-");
    ok("1b. the Plan: Carry on later, and it says it keeps for 3 hours", !!later && /3 hours/.test(desc?.textContent || ""), desc?.textContent || "(no description)");
  }
  document.getElementById("exit-confirm-stay")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}

// ── 2. A LEFT SESSION DOES NOT LEAK INTO THE NEXT ─────────────────────────
for (const tier of ["free", "personal"]) {
  console.log(`\nTEST 2 (${tier}) - the app closed mid-session; the next session counts only itself`);
  fixture(tier); await reopen();
  start(tier, A, new Date(Date.now() - 3600e3).toISOString());
  doOne(); doOne(); doOne();
  const left = (store.get("workoutProgress") || []).length;
  ok(`2pc-${tier}. three moves done, then the app closes`, left === 3, `${left}`);
  await reopen();
  start(tier, Bs);
  ok(`2a-${tier}. the new session starts at its own first move`, main.querySelector(".exercise-name")?.textContent === Bs.exercises[0].name, main.querySelector(".exercise-name")?.textContent);
  for (let i = 0; i < 40 && !navs.includes("reflect"); i++) doOne();
  const entry = (store.get("activityLog") || []).at(-1);
  ok(`2b-${tier}. finished, it counts only its own moves`, navs.includes("reflect") && entry?.exercisesCount === Bs.exercises.length && entry?.exercisesCount <= Bs.exercises.length,
     `logged ${entry?.exercisesCount}, session has ${Bs.exercises.length}`);
}

// ── 3. THE PLAN STILL CARRIES ON (CONTROL) ────────────────────────────────
console.log("\nTEST 3 - the Plan: Carry on later still resumes the same session where it was");
fixture("personal"); await reopen();
start("personal", A);
doOne(); doOne();
const at = main.querySelector(".exercise-name")?.textContent;
tap("#exit-workout-btn"); tap("#exit-confirm-later");
await reopen();
paint();
ok("3a. reopened, it is back on the same move", !!at && main.querySelector(".exercise-name")?.textContent === at && (store.get("workoutProgress") || []).length === 2,
   `${main.querySelector(".exercise-name")?.textContent} vs ${at}; progress ${(store.get("workoutProgress") || []).length}`);

console.log("");
if (fails) { console.log(`FREE-CARRY-ON: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FREE-CARRY-ON: all ${passes} assertions pass\n`);
process.exit(0);
