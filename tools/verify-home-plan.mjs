/**
 * tools/verify-home-plan.mjs
 * 04 Oct 2026 v2
 *
 * v2 - D-1 EXERCISE-FOUR. Reaches Capture (the fourth step) before the set buttons; nothing it proves has changed.
 *
 * 28 Sep 2026 v1
 *
 * SMOOTH-P3a. Plan Home is three doors, and coming back is one tap.
 * Spec 4.1.
 *
 * Measured on v549: Plan Home was the arc panel, four expandable rooms,
 * "Or go straight to" with four tiles and reference rows -- fifteen-odd
 * things before the first choice. "Carry on later" did not exist, and a
 * cold reopen inside ten minutes of accepting a proposal went back to
 * the proposal rather than to where the person was.
 *
 * Driven through the real TodayView and the real workout view.
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
const { TodayView } = await import(B + "views/today.js");
const workout = await import(B + "views/workout.js");
const { router: realRouter } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const paintWorkout = () => { main.innerHTML = workout.render(); try { workout.onMount(); } catch {} };
const fakeRouter = { history: ["somewhere"], navigate: v => { navs.push(v); if (v === "workout") paintWorkout(); }, back() {} };
globalThis.window.router = fakeRouter;
Object.defineProperty(globalThis, "router", { value: fakeRouter, configurable: true, writable: true });
realRouter.navigate = fakeRouter.navigate;
const tap = sel => { const el = main.querySelector(sel) || document.querySelector(sel); el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
// D-1: the set buttons live on the Capture step; reach it first when they are not on screen.
const toCapture = () => { if (!main.querySelector("#wo-set-done-btn, #wo-done-btn, #complete-exercise-btn, #timer-toggle-btn")) tap('[data-step-go="capture"]:not([aria-current])'); };
const tapSet = sel => { toCapture(); return tap(sel); };

function fixture({ tier = "personal", checkedIn = false } = {}) {
  if (document.querySelector("#exit-workout-btn")) { tap("#exit-workout-btn"); document.querySelector("#exit-confirm-discard")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); }
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  if (checkedIn) {
    const key = new Date().toISOString().split("T")[0];
    store.set("checkinHistory", { [key]: { energy: 6, mood: 6, date: new Date().toDateString() } });
    store.set("lastCheckin", { energy: 6, mood: 6, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  }
  navs = [];
}
function home(history = ["somewhere"]) {
  fakeRouter.history = history;
  main.innerHTML = "";
  TodayView(fakeRouter).mount(main);
}
const EX = (id, name) => ({ id, name, section: "main", role: "main", category: "horizontal-pull", movementPattern: "pull",
  equipment: [], affectsAreas: ["upper-back"], sets: 3, reps: "10", rest: 1, duration: 120, instructions: ["Pull"] });
function startSession() {
  store.set("generatedSession", { session: { id: "upper-9", title: "Upper Body", exercises: [EX("a", "Row"), EX("b", "Press"), EX("c", "Curl")] },
                                  builtAt: new Date().toISOString(), inputs: {} });
  navs = [];
  paintWorkout();
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - Plan Home renders");
fixture(); home();
ok("0a. the greeting is there", /Test/.test(txt(main.querySelector("h1"))));

// ── 1. THREE DOORS ──────────────────────────────────────────────────────
console.log("\nTEST 1 - three doors, nothing else in front of the choice");
const doors = [...main.querySelectorAll(".home-door")];
ok("1a. exactly three doors, in order", doors.map(d => txt(d.querySelector(".home-door__title"))).join(" | ") ===
   "Tell me what to do | I know what I want | Make it up as I go", doors.map(txt).join(" | "));
ok("1b. the first is the filled one", doors[0]?.classList.contains("home-door--primary") && !doors[1]?.classList.contains("home-door--primary"));
ok("1c. no rooms, no tile grid, no reference rows", !main.querySelector(".club-rooms, .club-row, .today-doors, .today-reference, .today-ref-row"));
ok("1d. each door says what happens next", doors.every(d => txt(d.querySelector(".home-door__sub")).length > 10));
ok("1e. the arc is one line", !!main.querySelector(".home-arc") && !main.querySelector(".today-arc"));

// ── 2. EACH DOOR, ONE TAP ───────────────────────────────────────────────
console.log("\nTEST 2 - every door and link reaches its screen in one tap");
const oneTap = (sel, fixtureOpts = {}) => { fixture(fixtureOpts); home(); navs = []; tap(sel); return navs.slice(); };
ok("2a. Tell me what to do, not checked in: the check-in", JSON.stringify(oneTap('[data-action="start-today"]')) === '["checkin"]' &&
   store.get("pendingDoorRoute") === "coach-proposal");
ok("2b. Tell me what to do, already checked in: straight to the plan", JSON.stringify(oneTap('[data-action="start-today"]', { checkedIn: true })) === '["coach-proposal"]');
ok("2c. I know what I want", JSON.stringify(oneTap('[data-action="know-what"]')) === '["know-what"]');
ok("2d. Make it up as I go", JSON.stringify(oneTap('[data-action="as-i-go"]')) === '["capture"]');
for (const [label, route] of [["Join a class", "classes"], ["Something for the mind", "noticing"], ["Library", "library"]]) {
  fixture(); home(); navs = [];
  [...main.querySelectorAll(".home-link")].find(b => txt(b) === label)?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  ok(`2e. ${label}`, navs[0] === route, JSON.stringify(navs));
}

// ── 3. CARRY ON LATER ───────────────────────────────────────────────────
console.log("\nTEST 3 - Carry on later, then carry on where they were");
fixture(); startSession();
tapSet("#wo-set-done-btn"); tapSet("#wo-set-done-btn"); tapSet("#wo-set-done-btn"); tapSet("#complete-exercise-btn");  // Row done
tapSet("#wo-set-done-btn");                                                                                    // Press, set 1
tap("#exit-workout-btn");
const later = document.querySelector("#exit-confirm-later");
ok("3a. the exit sheet offers Carry on later", !!later && /Carry on later/.test(txt(later)));
later?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("3b. it goes Home and saves nothing as done", navs.at(-1) === "today" && (store.get("activityLog") || []).length === 0);
home(["workout"]);
const card = main.querySelector(".home-carry");
ok("3c. Home leads with the Carry-on card: the session and what is next", !!card && /Upper Body/.test(txt(card)) && /Next: Press/.test(txt(card)) && /2 of 3/.test(txt(card)), txt(card));
ok("3d. the doors are still there, under \"Or instead\"", /Or instead/.test(txt(main)) && main.querySelectorAll(".home-door").length === 3 &&
   !main.querySelector(".home-door--primary"));
navs = [];
tap('[data-action="carry-on"]');
ok("3e. Carry on resumes at the same exercise and set", navs[0] === "workout" && main.querySelector(".exercise-name")?.textContent === "Press" && /Set 2 of 3/.test(txt(main)),
   `${main.querySelector(".exercise-name")?.textContent} ${txt(main.querySelector(".set-progress"))}`);

// ── 4. A COLD REOPEN ────────────────────────────────────────────────────
console.log("\nTEST 4 - the app closed mid-session and reopened comes back to the card, not the proposal");
fixture(); startSession();
tapSet("#wo-set-done-btn");
store.set("lastProposalDate", new Date().toISOString());   // accepted a moment ago: the state that bounced
store.set("lastProposalType", "door-1");
navs = [];
home([]);                                                    // a cold open: nothing behind it
ok("4a. Home renders with the Carry-on card", !!main.querySelector(".home-carry") && !navs.includes("home-threshold"), JSON.stringify(navs));
fixture();
store.set("lastProposalDate", new Date().toISOString()); store.set("lastProposalType", "door-1");
navs = []; home([]);
ok("4b. REVERSAL: with nothing to carry on, the cold-open bounce still works (EXIT-HOME)", navs.includes("home-threshold"), JSON.stringify(navs));

// ── 5. FINISH HERE ──────────────────────────────────────────────────────
console.log("\nTEST 5 - Finish here saves what was done and goes to the finish");
fixture(); startSession();
tapSet("#wo-set-done-btn"); tapSet("#wo-set-done-btn"); tapSet("#wo-set-done-btn"); tapSet("#complete-exercise-btn");
tap("#exit-workout-btn"); document.querySelector("#exit-confirm-later")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
home(["workout"]);
navs = [];
tap('[data-action="carry-finish"]');
await wait(50);
const log = store.get("activityLog") || [];
ok("5a. one part-session saved with what was done, and on to the finish", navs.includes("reflect") && log.length === 1 && log[0].status === "partial" && log[0].exercisesCount === 1,
   `${JSON.stringify(navs)} ${JSON.stringify(log[0] || {})}`);
home(["reflect"]);
ok("5b. and nothing is left to carry on", !main.querySelector(".home-carry"));

// ── 6. FREE ─────────────────────────────────────────────────────────────
console.log("\nTEST 6 - free Home is unchanged (P5 cross-checks it)");
fixture({ tier: "free" }); home();
ok("6a. free keeps its chooser, not the three doors", !main.querySelector(".home-door") && !!main.querySelector(".today-doors"));

console.log("");
if (fails) { console.log(`HOME-PLAN: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`HOME-PLAN: all ${passes} assertions pass\n`);
process.exit(0);
