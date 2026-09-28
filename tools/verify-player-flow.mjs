/**
 * tools/verify-player-flow.mjs
 * 28 Sep 2026 v4
 *
 * v4 - Work list 7, SAVE-HANDOFF. 4h: ending part-way records what was
 *   done, and the finish screen offers to keep the session. 4i: so does
 *   finishing it -- measured on v556, neither did, because the player
 *   cleared the plan before the finish screen read it.
 *
 * v3 - SMOOTH-P3a. The exit sheet has four choices: "Carry on later"
 *   joins it (4b). Nothing else changed.
 *
 * v2 - SMOOTH-P2e, REST-1 (test 5). Graeme, 28 Sep: "the suggestion
 *   should be given." A suggested rest after each set that ends on
 *   "Ready when you are", never moves the person on, never blocks the
 *   next set, and is not offered after the last set.
 *
 * SMOOTH-P2c. The coach's player: one screen per exercise, the dose up
 * front, last time already in the log, and an exit that always lands
 * somewhere known. Spec 4.4.
 *
 * Measured on v544: each exercise was four pages (Decide, Watch out, Do,
 * Note) -- three taps before the first rep -- with the full hurt-and-ache
 * text open at the top, a raw category id ("chest-stretch") and a points
 * badge under the name, an empty weight box every time, and an exit
 * dialog whose first line said the session "won't be saved" above a
 * button that saved it.
 *
 * Driven through the REAL workout view with a real built session.
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
globalThis.history = dom.window.history;   // session-guard.js pushes a state
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const workout = await import(B + "views/workout.js");
const { savableSession } = await import(B + "save-block.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
let navs = [];
function paint() {
  main.innerHTML = workout.render();
  try { workout.onMount(); } catch (e) { if (process.env.DBG) console.log("onMount threw", e.message); }
}
const _router = { navigate: v => { navs.push(v); if (v === "workout") paint(); }, back() {} };
globalThis.window.router = _router;
Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });
const tap = sel => { const el = (main.querySelector(sel) || document.querySelector(sel)); if (el) el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
const T = () => (main.textContent || "").replace(/\s+/g, " ").trim();

const GYM = ["dumbbells-medium", "barbell", "bench-flat", "kettlebell-medium", "band-light"];
const ROW = { id: "fixture-row", name: "Dumbbell Row", section: "main", role: "main", category: "horizontal-pull",
  movementPattern: "pull", equipment: ["dumbbell"], affectsAreas: ["upper-back"], credits: 20,
  sets: 3, reps: "10", rest: 60, duration: 220, instructions: ["Hinge", "Pull to the hip"],
  watchOut: ["Twisting as you pull"], coaching: "Keep the back flat." };

function fresh(exercises) {
  // leave any open session the way a person would
  if (document.querySelector("#exit-workout-btn")) { tap("#exit-workout-btn"); document.querySelector("#exit-confirm-discard")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); }
  localStorage.clear(); store.init();
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("tier", "personal"); store.set("liftLogEnabled", true);
  store.set("generatedSession", { session: { id: "s", name: "Upper Body", exercises }, builtAt: new Date().toISOString(), inputs: {} });
  navs = [];
  paint();
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the player mounts on a real exercise");
store.init(); store.set("todayIntensity", "moderate");
const built = SB.buildSession({ sessionType: "upper", durationMins: 30, equipmentOverride: GYM });
fresh(built.exercises);
ok("0a. the first exercise is on screen", main.querySelector(".exercise-name")?.textContent === built.exercises[0].name, T().slice(0, 120));

// ── 1. ONE SCREEN ───────────────────────────────────────────────────────
console.log("\nTEST 1 - one screen per exercise: what to do, then how");
ok("1a. no step before the exercise: Done is on the first screen, no Start-this-one, no page stepper",
   !!main.querySelector("#wo-done-btn") && !main.querySelector("#wo-begin-btn") && !main.querySelector(".xcard-stepper"));
ok("1b. no raw category id and no points badge", !main.querySelector(".meta-tag") && !/⭐/.test(main.innerHTML));
ok("1c. the section is a plain label", /^(Warm up|Main|Cool down)$/.test(main.querySelector(".wo-flow__section")?.textContent.trim() || ""));
ok("1d. \"If it hurts\" is on the screen, one tap away (closed)",
   !!main.querySelector("details.xcard-hurt") && !main.querySelector("details.xcard-hurt[open]"));

fresh([ROW, { ...ROW, id: "fixture-2", name: "Goblet Squat" }]);
const html = main.innerHTML;
ok("1e. the dose leads: 3 × 10 and Set 1 of 3, above the guidance",
   /3 × 10/.test(main.querySelector(".reps-value")?.textContent || "") && /Set 1 of 3/.test(T()) &&
   html.indexOf("reps-value") < html.indexOf("How to do it"));
ok("1f. what to watch for comes before how to do it, outside any disclosure",
   html.indexOf("What to watch for") > -1 && html.indexOf("What to watch for") < html.indexOf("How to do it") &&
   !main.querySelector("details .xcard-block--hazard:not(.xcard-hurt)"));

// ── 2. SETS, THEN NEXT ──────────────────────────────────────────────────
console.log("\nTEST 2 - a tap a set, then Next on the same screen");
tap("#wo-set-done-btn"); tap("#wo-set-done-btn");
ok("2a. the set counter moves", /Set 3 of 3/.test(T()), T().slice(0, 160));
tap("#wo-set-done-btn");
ok("2b. the last set finishes the exercise: Next names what is next", /Next: Goblet Squat/.test(main.querySelector("#complete-exercise-btn")?.textContent || ""));
ok("2c. and asks how it was, without a page turn", !!main.querySelector(".wo-flow__done") && /too hard/i.test(T()));
ok("2d. skip is gone once it is done", !main.querySelector("#skip-exercise-btn"));
tap("#complete-exercise-btn");
ok("2e. Next moves on and starts unfinished", main.querySelector(".exercise-name")?.textContent === "Goblet Squat" && !!main.querySelector("#skip-exercise-btn"));
ok("2f. the last exercise says Finish", (() => { tap("#wo-done-btn"); return /Finish the session/.test(main.querySelector("#complete-exercise-btn")?.textContent || ""); })());

// ── 3. LAST TIME, ALREADY IN THE LOG ────────────────────────────────────
console.log("\nTEST 3 - the log starts where they left off");
fresh([ROW]);
store.logLift("fixture-row", { weight: 16, reps: 10 });
paint();
const w = main.querySelector('[data-perf-key="weight"]');
ok("3a. the weight is pre-filled from last time", w && w.value === "16", `value "${w?.value}"`);
ok("3b. and so are the reps", main.querySelector('[data-perf-key="reps"]')?.value === "10");
const plus = main.querySelector('[data-step-for$="-weight"][data-step="2.5"]');
plus?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("3c. + adds a plate step (2.5 kg)", w?.value === "18.5", `value "${w?.value}"`);
ok("3d. the − and + are named for what they do", /2\.5 kg more/.test(plus?.getAttribute("aria-label") || ""));
fresh([ROW]);
ok("3e. REVERSAL: nothing logged, nothing pre-filled", (main.querySelector('[data-perf-key="weight"]')?.value || "") === "");

// ── 4. THE EXIT ─────────────────────────────────────────────────────────
console.log("\nTEST 4 - Exit: four choices, each lands somewhere known");
fresh([ROW, { ...ROW, id: "fixture-2", name: "Goblet Squat" }]);
tap("#exit-workout-btn");
const sheet = document.querySelector("#session-exit-overlay");
const labels = [...(sheet?.querySelectorAll("button") || [])].map(b => b.textContent.trim());
ok("4a. the sheet is a titled dialog", sheet?.getAttribute("role") === "dialog" && /Leave this session/.test(document.getElementById(sheet?.getAttribute("aria-labelledby") || "x")?.textContent || ""));
// v3: SMOOTH-P3a adds "Carry on later" (spec 4.1, coming back), second,
// after staying. Its landing and its resume are driven in verify-home-plan 3.
ok("4b. four plain choices", JSON.stringify(labels) === JSON.stringify(["Keep going", "Carry on later", "End it here and save", "Leave without saving"]), JSON.stringify(labels));
ok("4c. focus starts on Keep going", document.activeElement?.id === "exit-confirm-stay");
sheet?.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
ok("4d. Escape keeps going", !document.querySelector("#session-exit-overlay") && navs.length === 0);
ok("4e. and never says it will not be saved above a button that saves", !/won.t be saved/i.test(sheet?.textContent || ""));

const before = (store.get("activityLog") || []).length;
tap("#exit-workout-btn"); document.querySelector("#exit-confirm-discard")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("4f. Leave without saving goes Home and writes nothing", navs.at(-1) === "today" && (store.get("activityLog") || []).length === before, JSON.stringify(navs));

fresh([ROW, { ...ROW, id: "fixture-2", name: "Goblet Squat" }]);
tap("#wo-set-done-btn"); tap("#wo-set-done-btn"); tap("#wo-set-done-btn"); tap("#complete-exercise-btn");
const b2 = (store.get("activityLog") || []).length;
tap("#exit-workout-btn"); document.querySelector("#exit-confirm-leave")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const log = store.get("activityLog") || [];
ok("4g. End it here and save goes to the finish, saving what was done",
   navs.at(-1) === "reflect" && log.length === b2 + 1 && log.at(-1).status === "partial" && log.at(-1).exercisesCount === 1,
   `${JSON.stringify(navs)} ${JSON.stringify(log.at(-1))}`);
ok("4h. and records what was done, so the finish screen offers to keep this session",
   JSON.stringify(log.at(-1)?.exerciseIds) === JSON.stringify(["fixture-row"]) && !!savableSession(),
   `${JSON.stringify(log.at(-1)?.exerciseIds)}; offered: ${!!savableSession()}`);

// ── 5. REST-1: A SUGGESTED REST ─────────────────────────────────────────
console.log("\nTEST 5 - after a set, a suggested rest that never pushes");
fresh([{ ...ROW, rest: 2 }, { ...ROW, id: "fixture-2", name: "Goblet Squat", rest: 2 }]);
ok("5pc. REVERSAL: no rest before the first set", !main.querySelector(".wo-rest"));
tap("#wo-set-done-btn");
const rest = main.querySelector(".wo-rest");
ok("5a. after a set, the rest is suggested in words", !!rest && /Rest about 2s/.test(rest.textContent));
ok("5b. the next set is one tap away during it", /Set 2 done/.test(main.querySelector("#wo-set-done-btn")?.textContent || ""));
ok("5c. the count is not read out every second", main.querySelector("#wo-rest-count")?.getAttribute("aria-hidden") === "true" &&
   (main.querySelector("#wo-rest-ready")?.textContent || "") === "");
const navsBeforeRest = navs.length;
await new Promise(r => setTimeout(r, 3200));
ok("5d. at the end it says \"Ready when you are.\" once, politely",
   /Ready when you are/.test(main.querySelector("#wo-rest-ready")?.textContent || "") &&
   main.querySelector("#wo-rest-ready")?.getAttribute("aria-live") === "polite" &&
   main.querySelector("#wo-rest-count")?.hidden === true);
ok("5e. and nothing moved: same exercise, same set", main.querySelector(".exercise-name")?.textContent === "Dumbbell Row" && /Set 2 of 3/.test(T()) && navs.length === navsBeforeRest,
   `${main.querySelector(".exercise-name")?.textContent} ${JSON.stringify(navs)}`);
tap("#wo-set-done-btn"); tap("#wo-set-done-btn");
ok("5f. no rest after the last set: the exercise is done", !main.querySelector(".wo-rest") && !!main.querySelector("#complete-exercise-btn"));
tap("#complete-exercise-btn");
ok("5g. the next exercise starts without a rest", main.querySelector(".exercise-name")?.textContent === "Goblet Squat" && !main.querySelector(".wo-rest"));

// 4i sits last: finishing the session ends the player, and test 5 needs
// it running.
console.log("\nTEST 4i - finishing offers to keep it");
fresh([ROW]);
tap("#wo-set-done-btn"); tap("#wo-set-done-btn"); tap("#wo-set-done-btn"); tap("#complete-exercise-btn");
ok("4i. finishing the whole plan: the finish screen offers to keep it (it never could: the plan was cleared first)",
   navs.at(-1) === "reflect" && savableSession()?.exercises?.[0]?.id === "fixture-row",
   `${JSON.stringify(navs)}; offered: ${!!savableSession()}`);

console.log("");
if (fails) { console.log(`PLAYER-FLOW: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PLAYER-FLOW: all ${passes} assertions pass\n`);
process.exit(0);
