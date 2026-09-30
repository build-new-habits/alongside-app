/**
 * tools/verify-severe-adapt.mjs
 * 30 Sep 2026 v1
 *
 * W3-1 SEVERE-ADAPT (Wave 3, persona 2.1). On a severe day the coach asks
 * Rest today or Adapt and continue. Choosing Adapt built the gentler plan
 * and then left it in a hidden panel: handleSevereChoice() never opened
 * the preview, which only mount() and the other banners' handlers do.
 * The person's worst day ended on a screen with nothing to tap.
 *
 *   1. Through the real Home and "I know what I want" (the Plan), a knee
 *      at Bad, then Adapt: a plan with rows and a Start button, visible.
 *      No row works the severe area.
 *   2. On Free, after a check-in with a Bad back: the same.
 *   3. Rest still gives the rest options and no Start.
 *   4. Control: with nothing severe, the plan opens on first view.
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
const { TodayView } = await import(B + "views/today.js");
const KW = await import(B + "views/know-what.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { AVAILABLE_TIME_WINDOW_MINUTES } = await import(B + "data/time-windows.js");
const { getActiveConditionIds, getExerciseSafetyTier } = await import(B + "data/conditions.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

const FULL_GYM = ["dumbbells-light", "dumbbells-medium", "dumbbells-heavy", "barbell", "bench-flat",
  "bench-adjustable", "pull-up-bar", "kettlebell-medium", "band-medium", "gym-membership"];

let navs = [];
let taps = 0;
const router = { history: ["somewhere"], navigate(v) { navs.push(v); paint(v); }, back() {} };
function paint(v) {
  main.innerHTML = "";
  if (v === "know-what") KW.KnowWhatView(router).mount(main);
  if (v === "coach-proposal") CoachProposalView(router).mount(main);
}
const tap = el => { if (el) taps++; click(el); return !!el; };
/** Choosing a radio or checkbox is one tap: check it and let change bubble. */
const choose = input => {
  if (!input) return false;
  taps++;
  input.checked = input.type === "checkbox" ? !input.checked : true;
  input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  return true;
};
const submit = () => { taps++; main.querySelector(".kw-form")?.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); };

function fixture({ time = "standard", conditions = [], scores = {}, saved = 0, location } = {}) {
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", "personal");
  store.set("gymEquipment", FULL_GYM); store.set("homeEquipment", []);
  store.set("equipment", FULL_GYM);
  store.set("availableTime", time);
  store.set("conditions", conditions); store.set("conditionPainScores", scores);
  if (location) store.set("sessionLocation", location);
  store.set("savedSessions", Array.from({ length: saved }, (_, i) => ({ id: `s${i}`, name: `Mine ${i}`, exerciseIds: [EXERCISES[i].id], createdAt: new Date().toISOString() })));
  navs = []; taps = 0;
}
function fromHome() {
  main.innerHTML = "";
  TodayView(router).mount(main);
  navs = []; taps = 0;
  tap(main.querySelector('[data-action="know-what"]'));
}
const kindInput = id => main.querySelector(`input[name="kind"][value="${id}"]`);
const visible = el => !!el && !el.closest("[hidden]") && !el.disabled;
const startBtn = () => [...main.querySelectorAll("button")].find(b => /^Start\b/.test(txt(b)) && visible(b));
const rows = () => [...main.querySelectorAll(".cp-plan__row")].filter(r => !r.closest("[hidden]"));
const LOADS = { knee: /\bknee\b/i, "lower-back": /lower back/i };

console.log("\nTEST 1 - the Plan: I know what I want, a knee at Bad, Adapt");
fixture({ conditions: ["knee"], scores: {} }); fromHome();
choose(kindInput("strength")); choose(main.querySelector('input[name="sore"][value="knee"]'));
choose(main.querySelector('input[name="how-knee"][value="8"]')); submit();
ok("1pc. the severe choice is asked first", !!main.querySelector('[data-severe-choice="adapt"]'), txt(main).slice(0, 160));
tap(main.querySelector('[data-severe-choice="adapt"]'));
ok("1a. after Adapt there is a plan to see", rows().length > 0, txt(main).slice(0, 240));
ok("1b. and a Start button that can be pressed", !!startBtn(), [...main.querySelectorAll("button")].map(b => `${txt(b).slice(0,20)}${b.closest("[hidden]") ? "(hidden)" : ""}`).join(" | "));
ok("1c. no row works the knee", !rows().some(r => /works your knee/i.test(txt(r))), rows().map(txt).join(" / ").slice(0, 300));

console.log("\nTEST 2 - Free: after a check-in with a Bad back, Adapt");
fixture({ conditions: ["lower-back"], scores: { "lower-back": 8 } });
store.set("tier", "free");
store.set("lastCheckin", { date: new Date().toISOString().slice(0, 10), energy: 5, mood: 5 });
paint("coach-proposal");
ok("2pc. the severe choice is asked", !!main.querySelector('[data-severe-choice="adapt"]'), txt(main).slice(0, 160));
tap(main.querySelector('[data-severe-choice="adapt"]'));
ok("2a. a plan and a Start button, visible", rows().length > 0 && !!startBtn(), txt(main).slice(0, 240));

console.log("\nTEST 3 - Rest still rests");
fixture({ conditions: ["lower-back"], scores: { "lower-back": 8 } });
paint("coach-proposal");
tap(main.querySelector('[data-severe-choice="rest"]'));
ok("3a. rest options, and no Start", !!main.querySelector("[data-rest-action]") && !startBtn(), txt(main).slice(0, 200));

console.log("\nTEST 4 - control: nothing severe, the plan opens on first view");
fixture({ conditions: ["lower-back"], scores: { "lower-back": 4 } });
paint("coach-proposal");
ok("4a. plan and Start without any choice", rows().length > 0 && !!startBtn() && !main.querySelector("[data-severe-choice]"));

console.log("");
if (fails) { console.log(`SEVERE-ADAPT: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SEVERE-ADAPT: all ${passes} assertions pass\n`);
process.exit(0);
