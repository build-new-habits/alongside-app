/**
 * tools/verify-taps.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * SMOOTH-P3c. The Smooth Path's headline number (spec §0): taps from
 * Home to the first exercise on the coach route.
 *
 * Measured on v540: 15 taps and 8 decisions for a returning Plan user,
 * 23 for a new one. Target: 5.
 *
 * Driven end to end through the REAL router (its red-flag guard
 * included) and the real views -- Home, the check-in, the plan, the
 * player -- counting every tap a person makes, and stopping when the
 * player shows the first exercise's name.
 *
 * THE ONE KNOWN EXCEPTION, KEPT ON PURPOSE. A new user in the safety
 * taper ticks "I have read this" on the plan before Start: one more tap,
 * six. That tick-box is the legal evidence the safety note was read
 * (kept on the plan, 28 Sep); it is asserted here as exactly one extra
 * tap, so it can never quietly grow. Likewise the red-flag screen for
 * somebody who has told the app something is sore: four more taps (three
 * answers and Continue), once, and asserted as such.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const gate = await import(B + "safety-gate.js");
const { TodayView } = await import(B + "views/today.js");
const { CheckinView } = await import(B + "views/checkin.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { RedFlagView } = await import(B + "views/red-flag.js");
const workout = await import(B + "views/workout.js");
const { router } = await import(B + "router.js");
globalThis.router = router; dom.window.router = router;

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms = 4000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = fn(); if (v) return v; await wait(15); }
  return null;
}
const app = () => document.getElementById("app");

// The real navigate(); only mounting is supplied here.
let path = [];
router._mountView = async name => {
  path.push(name);
  document.querySelectorAll(".ci-panel, .ci-overlay, #session-exit-overlay").forEach(n => n.remove());
  const c = app(); c.innerHTML = "";
  if (name === "today")          TodayView(router).mount(c);
  if (name === "checkin")        CheckinView(router).mount(c);
  if (name === "coach-proposal") CoachProposalView(router).mount(c);
  if (name === "red-flag")       RedFlagView(router).mount(c);
  if (name === "workout")        { c.innerHTML = workout.render(); try { workout.onMount(); } catch {} }
};

let taps = 0;
const visible = () => [...document.querySelectorAll("#app button, #app input, .ci-panel button")].filter(b => !b.disabled && !b.closest("[hidden]"));
async function tapText(re) {
  const b = await waitFor(() => visible().find(x => x.tagName === "BUTTON" && re.test(x.textContent.trim().replace(/\s+/g, " "))));
  if (!b) return false;
  taps++; b.click(); await wait(40); return true;
}
async function tapSel(sel) {
  const b = await waitFor(() => document.querySelector(sel));
  if (!b) return false;
  taps++;
  if (b.type === "checkbox" || b.type === "radio") { b.checked = true; b.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }
  else b.click();
  await wait(40);
  return true;
}

function fixture({ acks = 5, conditions = [] } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", "personal");
  store.set("gymEquipment", ["dumbbells-medium", "bench-flat", "gym-membership"]); store.set("homeEquipment", []);
  store.set("conditions", conditions);
  store.set("safetyAckLog", Array.from({ length: acks }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  path = []; taps = 0;
  router.currentView = null; router.history = ["somewhere"];
}
const firstExerciseShown = () => path.at(-1) === "workout" && (document.querySelector("#wo-exercise-name, .exercise-name")?.textContent || "").trim().length > 0;

async function coachRoute({ tick = false, redFlag = false } = {}) {
  await router.navigate("today");
  taps = 0;
  await tapSel('[data-action="start-today"]');                 // 1  Tell me what to do
  await tapText(/^Okay$/);                                      // 2  energy
  await tapText(/^Pretty good$/);                               // 3  mood
  await tapText(/^Nothing today$/);                             // 4  anything sore
  await waitFor(() => document.querySelector("#cp-preview-start"));
  if (tick) await tapSel("#cp-ack-box");                        //    the taper's tick-box
  await tapSel("#cp-preview-start");                            // 5  Start
  if (redFlag) {
    await waitFor(() => path.at(-1) === "red-flag");
    for (const q of ["q1", "q2", "q3"]) await tapSel(`input[name="${q}"][value="no"]`);
    await tapSel("#rf-continue");
  }
  await waitFor(firstExerciseShown);
}

// ── 1. RETURNING ────────────────────────────────────────────────────────
console.log("\nTEST 1 - a returning Plan user, past the safety taper");
fixture();
await coachRoute();
ok("1pc. positive control: the route really passed Home, check-in and plan", ["today", "checkin", "coach-proposal", "workout"].every(v => path.includes(v)),
   JSON.stringify(path));
ok("1a. the first exercise is on screen", firstExerciseShown(), JSON.stringify(path));
ok("1b. in FIVE taps (v540: 15)", taps === 5, `${taps} taps: ${JSON.stringify(path)}`);

// ── 2. NEW ──────────────────────────────────────────────────────────────
console.log("\nTEST 2 - a new user in the safety taper");
fixture({ acks: 0 });
await coachRoute({ tick: true });
ok("2a. the first exercise is on screen", firstExerciseShown(), JSON.stringify(path));
ok("2b. in six taps: five, plus the one tick that records the safety note was read (v540: 23)", taps === 6, `${taps} taps`);
fixture({ acks: 0 });
await router.navigate("today"); taps = 0;
await tapSel('[data-action="start-today"]'); await tapText(/^Okay$/); await tapText(/^Pretty good$/); await tapText(/^Nothing today$/);
await tapSel("#cp-preview-start");
await wait(100);
ok("2c. REVERSAL: without the tick, Start does not go in -- the tick is real, not ceremony", path.at(-1) === "coach-proposal",
   JSON.stringify(path));

// ── 3. SOMETHING SORE ───────────────────────────────────────────────────
console.log("\nTEST 3 - somebody who has told the app something is sore, the first time");
fixture({ conditions: ["lower-back"] });
await coachRoute({ redFlag: true });
ok("3a. the red-flag screen was asked, once, on the way", path.filter(v => v === "red-flag").length === 1, JSON.stringify(path));
ok("3b. and the first exercise is on screen", firstExerciseShown(), JSON.stringify(path));
ok("3c. in nine taps: five, plus three answers and Continue, once", taps === 9, `${taps} taps`);
fixture({ conditions: ["lower-back"] });
store.set("redFlag", { screenedAt: new Date().toISOString(), areas: ["lower-back"], textVersion: (await import(B + "data/red-flag.js")).RED_FLAG_VERSION,
  level: null, flaggedAt: null, clearedAt: null });
await coachRoute();
ok("3d. REVERSAL: already asked -- five taps again", taps === 5 && firstExerciseShown() && !path.includes("red-flag"), `${taps} taps ${JSON.stringify(path)}`);

console.log("");
if (fails) { console.log(`TAPS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`TAPS: all ${passes} assertions pass\n`);
process.exit(0);
