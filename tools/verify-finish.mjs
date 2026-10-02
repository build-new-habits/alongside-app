/**
 * tools/verify-finish.mjs
 * 02 Oct 2026 v4
 *
 * v4 - W4-8 PAIN-NUMBERS. 3c: the finish's Better / About the same / Worse
 *   is no longer kept with the session; feel and mood still are. Stricter:
 *   it asserts the answer is absent.
 *
 * 02 Oct 2026 v3
 *
 * v3 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * v2 - W3-4 SORE-SCOPE (Schema v1.82). The pain question is asked only
 *   when something is sore today, so test 3's fixture scores its listed
 *   area today; verify-sore-scope proves it is not asked otherwise.
 *
 * 28 Sep 2026 v1
 *
 * SMOOTH-P2d. One finish screen. Spec 4.4: "That's today done -- moves,
 * sets logged, minutes; How did that feel? (optional); Back to Home. The
 * existing reflect step's feel/pain questions are folded into this
 * optional line; the free-text reflection stays available but is not a
 * required stop."
 *
 * Measured on v545: finishing a session opened "So, how was that?" with
 * a feel question, a pain question, a mood slider already set to a value
 * nobody chose (and saved as their mood), a writing prompt, then "Done"
 * -- and then a second screen, "Done", with a coach line and "Back to
 * Today". Two screens and a stored answer the person never gave.
 *
 * Driven through the real workout view into the real reflect view.
 */
import { agreed } from "./agreed.mjs";
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
  localStorage.clear(); store.init(); agreed(store);
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
const lastEntry = () => (store.get("activityLog") || []).at(-1) || {};

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - finishing a session reaches the finish screen");
session();
ok("0a. the session ended on the finish screen", navs.at(-1) === "reflect" && !!main.querySelector(".reflect-view"), JSON.stringify(navs));

// ── 1. ONE SCREEN THAT SAYS WHAT WAS DONE ───────────────────────────────
console.log("\nTEST 1 - \"That's today done\", and what was done");
ok("1a. the heading says it is done", /That.s today done/.test(main.querySelector("h1")?.textContent || ""), main.querySelector("h1")?.textContent);
const stats = main.querySelector(".finish-stats")?.textContent.replace(/\s+/g, " ").trim() || "";
ok("1b. and what was done: 2 moves, 6 sets", /2 moves/.test(stats) && /6 sets/.test(stats), `"${stats}"`);
ok("1c. how it felt is offered, optional", main.querySelectorAll("[data-feel]").length === 3);
ok("1d. the note and mood are one tap away, not a required stop",
   !!main.querySelector("details.finish-more") && !main.querySelector("details.finish-more[open]") &&
   !!main.querySelector("details.finish-more #reflect-open-text"));
ok("1e. one way on, named for where it goes", /Back to Home/.test(main.querySelector("#reflect-done-btn")?.textContent || "") &&
   !main.querySelector("#reflect-skip-btn"));

// ── 2. ONE TAP HOME, AND NOTHING STORED THAT WAS NOT SAID ───────────────
console.log("\nTEST 2 - one tap home; nothing recorded that was not said");
navs = [];
tap("#reflect-done-btn");
await wait(20);
ok("2a. Back to Home goes Home -- no second \"Done\" screen", navs.includes("today") || !!main.querySelector("#empathy-continue-btn"),
   `navs ${JSON.stringify(navs)}; screen: ${T().slice(0, 80)}`);
const e1 = lastEntry();
ok("2b. an untouched mood is not recorded as their mood", e1.moodAfter == null, `moodAfter ${e1.moodAfter}`);
ok("2c. an unanswered feel is not recorded", e1.feel == null);

// ── 3. WHAT THEY DO SAY IS KEPT ─────────────────────────────────────────
console.log("\nTEST 3 - an answer is kept, and the coach answers it on the same screen");
session({ conditions: ["lower-back"], soreToday: true });
tap('[data-feel="strong"]');
const said = main.querySelector("#finish-coach")?.textContent.trim() || "";
ok("3a. tapping how it felt gets the coach's line straight away", said.length > 10 && main.querySelector("#finish-coach")?.getAttribute("aria-live") === "polite", `"${said}"`);
ok("3b. with an area sore today, the pain question is there", main.querySelectorAll("[data-pain]").length === 4);
tap('[data-pain="worse"]');
const slider = main.querySelector("#reflect-mood-slider");
slider.value = "3"; slider.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
tap("#reflect-done-btn"); await wait(20);
const e2 = lastEntry();
ok("3c. feel and a moved mood are stored; the sore answer is not (W4-8)", e2.feel === "strong" && e2.painChange === undefined && e2.moodAfter === 3, JSON.stringify({ f: e2.feel, p: e2.painChange, m: e2.moodAfter }));

// ── 4. A SAVED PART-SESSION ─────────────────────────────────────────────
console.log("\nTEST 4 - ending early says what was saved");
session({ finish: false });
ok("4a. the heading does not claim a finished session", !/That.s today done/.test(main.querySelector("h1")?.textContent || "") &&
   /Saved/.test(main.querySelector("h1")?.textContent || ""), main.querySelector("h1")?.textContent);
ok("4b. and counts what was done (2 moves, 6 sets)", /2 moves/.test(main.querySelector(".finish-stats")?.textContent || "") && /6 sets/.test(main.querySelector(".finish-stats")?.textContent || ""),
   main.querySelector(".finish-stats")?.textContent);

// ── 5. THE COACH PROMISES NOTHING IT DOES NOT DO ────────────────────────
console.log("\nTEST 5 - the coach's line promises nothing it does not do");
{
  const fs = __require("node:fs");
  const src = fs.readFileSync(new URL("../js/views/reflect.js", import.meta.url), "utf8");
  const body = src.slice(src.indexOf("function buildSummary("), src.indexOf("\n}\n", src.indexOf("function buildSummary(")));
  const readers = (dir => {
    const out = [];
    for (const f of fs.readdirSync(dir, { recursive: true })) {
      if (!/\.js$/.test(f) || /views[\\/]reflect\.js$/.test(f)) continue;
      const t = fs.readFileSync(new URL(`../js/${f}`, import.meta.url), "utf8");
      // A READ of the stored answer: entry.feel, e.painChange -- not a
      // DOM dataset.feel, and not a write of painChange: "none".
      if (/(?<!dataset)\.(feel|painChange)\b(?!\s*=[^=])/.test(t)) out.push(f);
    }
    return out;
  })(new URL("../js/", import.meta.url));
  ok("5pc. nothing in the app reads the feel or pain answers (so no line may promise to)", readers.length === 0, readers.join(", "));
  ok("5a. no line promises to remember, factor in, or use it next time",
     body.length > 200 && !/I will remember|factor it in|use it next time|when I plan/i.test(body));
}

console.log("");
if (fails) { console.log(`FINISH: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FINISH: all ${passes} assertions pass\n`);
process.exit(0);
