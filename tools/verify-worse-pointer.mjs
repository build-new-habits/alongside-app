/**
 * tools/verify-worse-pointer.mjs
 * 30 Sep 2026 v1
 *
 * W3-5 WORSE-POINTER (Wave 3, persona 2.1). Answering "Worse than usual"
 * at the finish got "Things were harder today and you showed up anyway.
 * I have noted that." and then the empathy line "You moved through
 * something difficult today...". Praise, and no pointer to anyone who can
 * look at it -- against the scope statement every user sees: "if anything
 * is persisting, getting worse or hurting, stop and speak to a GP, physio
 * or other medical professional". "Better than usual" said "your body is
 * responding", which the app cannot know.
 *
 *   1. Worse: the coach's line is the stop-and-seek line, with no praise.
 *   2. Worse does not bring the "moved through something difficult" line.
 *   3. Better: glad, and no claim about the body.
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
const { router: realRouter } = await import(B + "router.js");
const workout = await import(B + "views/workout.js");
const reflect = await import(B + "views/reflect.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
let navs = [];
function paintWorkout() { main.innerHTML = workout.render(); try { workout.onMount(); } catch {} }
function paintReflect() { main.innerHTML = reflect.render(); try { reflect.onMount(); } catch (e) { console.log("reflect onMount threw", e.message); } }
const nav = v => { navs.push(v); if (v === "workout") paintWorkout(); if (v === "reflect") paintReflect(); };
const _router = { navigate: nav, back() {} };
globalThis.window.router = _router;
Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });
realRouter.navigate = nav;   // reflect.js imports the router module directly
const tap = sel => { const el = main.querySelector(sel) || document.querySelector(sel); el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
const T = () => (main.textContent || "").replace(/\s+/g, " ").trim();

const EX = (id, name) => ({ id, name, section: "main", role: "main", category: "horizontal-pull", movementPattern: "pull",
  equipment: ["dumbbell"], affectsAreas: ["upper-back"], sets: 3, reps: "10", rest: 60, duration: 220,
  instructions: ["Pull"], watchOut: ["Twisting"] });

function session({ conditions = [], finish = true, soreToday = false } = {}) {
  if (document.querySelector("#exit-workout-btn")) { tap("#exit-workout-btn"); document.querySelector("#exit-confirm-discard")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); }
  localStorage.clear(); store.init();
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("tier", "personal"); store.set("onboardingComplete", true); store.set("conditions", conditions);
  store.set("lastCheckin", { mood: 6, energy: 6, timestamp: new Date().toISOString() });
  if (soreToday) { store.set("conditionPainScores", Object.fromEntries(conditions.map(c => [c, 4]))); store.set("conditionPainScoresOn", store._localDay()); }
  store.set("generatedSession", { session: { id: "s", name: "Upper Body", exercises: [EX("a", "Row"), EX("b", "Press")] }, builtAt: new Date().toISOString(), inputs: {} });
  navs = [];
  paintWorkout();
  // Row: three sets, next. Press: three sets.
  tap("#wo-set-done-btn"); tap("#wo-set-done-btn"); tap("#wo-set-done-btn"); tap("#complete-exercise-btn");
  tap("#wo-set-done-btn"); tap("#wo-set-done-btn"); tap("#wo-set-done-btn");
  if (finish) tap("#complete-exercise-btn");
  else { tap("#exit-workout-btn"); document.querySelector("#exit-confirm-leave")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); }
}

console.log("\nTEST 1 - Worse than usual gets the pointer, not praise");
session({ conditions: ["lower-back"], soreToday: true });
ok("1pc. the finish is showing the pain question", main.querySelectorAll("[data-pain]").length === 4);
tap('[data-pain="worse"]');
const line = main.querySelector("#finish-coach")?.textContent.trim() || "";
ok("1a. it says to get it looked at", /worth getting someone to look at it/.test(line), line);
ok("1b. and to stop if it gets worse", /Stop if it gets worse/.test(line), line);
ok("1c. no praise for going on", !/showed up anyway|pushed|well done/i.test(line), line);

console.log("\nTEST 2 - no 'moved through something difficult' after Worse");
// Five earlier sessions, so the finish is due an empathy prompt, as a
// real person's fifth or sixth session is.
function earlier() {
  const l = store.get("activityLog") || [];
  const past = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(Date.now() - (12 - i * 2) * 864e5).toISOString();
    return { id: `past-${i}`, type: "workout", sessionType: "full", date: d, completedAt: d, status: "completed", exercisesCount: 6 };
  });
  store.set("activityLog", [...past, ...l]);
  store.set("lastEmpathyPromptSession", 0);
}
session({ conditions: ["lower-back"], soreToday: true });
earlier();
tap('[data-pain="worse"]');
tap("#reflect-done-btn"); await wait(30);
const prompt = document.querySelector("#empathy-prompt-text")?.textContent || "";
ok("2pc. an empathy prompt is given at this point", prompt.length > 20, document.body.textContent.slice(0, 160));
ok("2a. and it is not the difficult-day one, for more pain", !/moved through something difficult/.test(prompt), prompt);
session({ conditions: ["lower-back"], soreToday: true });
earlier();
store.set("lastCheckin", { mood: 6, energy: 2, timestamp: new Date().toISOString() });
tap('[data-feel="hard"]');
tap("#reflect-done-btn"); await wait(30);
ok("2b. control: a hard, low-energy day still gets it", /moved through something difficult/.test(document.querySelector("#empathy-prompt-text")?.textContent || ""), document.querySelector("#empathy-prompt-text")?.textContent);

console.log("\nTEST 3 - Better than usual");
session({ conditions: ["lower-back"], soreToday: true });
tap('[data-pain="better"]');
const b = main.querySelector("#finish-coach")?.textContent.trim() || "";
ok("3a. glad, with no claim about the body responding", /better/i.test(b) && !/body is responding/.test(b), b);

console.log("");
if (fails) { console.log(`WORSE-POINTER: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`WORSE-POINTER: all ${passes} assertions pass\n`);
process.exit(0);
