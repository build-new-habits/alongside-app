/**
 * tools/verify-finish-lines.mjs
 * 29 Sep 2026 v1
 *
 * P10, FINISH LINES (persona finding W2-10). What the coach says at the
 * end of a session must be true of that session:
 *   - "You finished it" after ending at move 2 of 10;
 *   - "Nothing was in your way today" after a sore check-in and an early
 *     finish (every "good day" reflection required only energy above 4);
 *   - "You adjust and continue. That's a particular kind of
 *     intelligence" on session count alone -- the "adjusting" pattern it
 *     describes was a preference, not a requirement;
 *   - "You told me Quads is sore" after the person said Knee.
 *
 * Driven through the real player, the real finish screen and the real
 * empathy step, and the real builder's zone screen.
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
const { EMPATHY_PROMPTS } = await import(B + "data/empathy-transfer.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
let navs = [];
function paintWorkout() { main.innerHTML = workout.render(); try { workout.onMount(); } catch {} }
function paintReflect() { main.innerHTML = reflect.render(); try { reflect.onMount(); } catch {} }
const nav = v => { navs.push(v); if (v === "workout") paintWorkout(); if (v === "reflect") paintReflect(); };
const _router = { navigate: nav, back() {} };
globalThis.window.router = _router;
Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });
realRouter.navigate = nav;
const tap = sel => { const el = main.querySelector(sel) || document.querySelector(sel); el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
const T = el => ((el || main).textContent || "").replace(/\s+/g, " ").trim();
const dayAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const EX = (id, name) => ({ id, name, section: "main", role: "main", movementPattern: "pull", equipment: ["dumbbell"],
  affectsAreas: ["upper-back"], sets: 3, reps: "10", rest: 60, duration: 220, instructions: ["Pull"], watchOut: ["Twisting"] });
const TEN = Array.from({ length: 10 }, (_, i) => EX("x" + i, "Move " + (i + 1)));

// A person eight sessions in, energy 7 today, and a steady week before.
function fixture({ sore = null, energies = [7, 7, 7, 7, 7], rotate = 0, checkedIn = true } = {}) {
  if (document.querySelector("#exit-workout-btn")) { tap("#exit-workout-btn"); document.querySelector("#exit-confirm-discard")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); }
  localStorage.clear(); store.init();
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("tier", "personal"); store.set("onboardingComplete", true);
  store.set("activityLog", Array.from({ length: 8 }, (_, i) => ({ id: "p" + i, type: "workout", status: "completed", completedAt: dayAgo(i + 2).toISOString(), date: dayAgo(i + 2).toISOString() })));
  const hist = {}; energies.forEach((e, i) => { hist[key(dayAgo(i + 1))] = { energy: e, mood: 6 }; });
  if (checkedIn) hist[key(new Date())] = { energy: 7, mood: 6 };
  store.set("checkinHistory", hist);
  if (checkedIn) store.set("lastCheckin", { energy: 7, mood: 6, timestamp: new Date().toISOString() });
  if (sore) { store.set("conditions", [sore]); store.set("conditionPainScores", { [sore]: 4 }); }
  store.set("empathyPromptsAtStage", rotate);
  store.set("generatedSession", { session: { id: "s", name: "Upper Body", exercises: TEN }, builtAt: new Date().toISOString(), inputs: {} });
  navs = [];
  paintWorkout();
}
function doMoves(n) { for (let i = 0; i < n; i++) { tap("#wo-set-done-btn"); tap("#wo-set-done-btn"); tap("#wo-set-done-btn"); tap("#complete-exercise-btn"); } }
function endEarly() { tap("#exit-workout-btn"); document.querySelector("#exit-confirm-leave")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); }
async function empathyText() {
  tap("#reflect-done-btn"); await wait(20);
  return T(main.querySelector("#empathy-prompt-text"));
}

// ── 1. "YOU FINISHED IT" ─────────────────────────────────────────────────
console.log("\nTEST 1 - \"You finished it\" only when they did");
fixture(); doMoves(2); endEarly(); await wait(10);
ok("1pc. two of ten moves, ended early, on the finish screen", navs.at(-1) === "reflect" && (store.get("currentActivityEntry") || {}).status === "partial", JSON.stringify(navs));
tap('[data-feel="hard"]'); await wait(10);
const early = T(main.querySelector("#finish-coach"));
ok("1a. a hard, part-finished session is not called finished", !!early && !/You finished it/.test(early), early);
fixture(); doMoves(10); await wait(10);
tap('[data-feel="hard"]'); await wait(10);
ok("1b. control: a hard session done to the end still hears it", /You finished it/.test(T(main.querySelector("#finish-coach"))), T(main.querySelector("#finish-coach")));

// ── 2. THE GOOD-DAY REFLECTIONS ─────────────────────────────────────────
console.log("\nTEST 2 - a \"good day\" reflection needs a good day");
const GOOD = Object.values(EMPATHY_PROMPTS).flat().filter(p => (p.requires || []).includes("goodEnergy")).map(p => p.text.slice(0, 40));
const saidGood = s => GOOD.some(g => s.startsWith(g));
{
  const seen = { plain: [], sore: [], early: [], none: [] };
  for (let r = 0; r < 8; r++) {
    fixture({ rotate: r }); doMoves(10); await wait(10); seen.plain.push(await empathyText());
    fixture({ rotate: r, sore: "knee" }); doMoves(10); await wait(10); seen.sore.push(await empathyText());
    fixture({ rotate: r }); doMoves(2); endEarly(); await wait(10); seen.early.push(await empathyText());
    fixture({ rotate: r, checkedIn: false }); doMoves(10); await wait(10); seen.none.push(await empathyText());
  }
  ok("2pc. control: on a plain good day the good-day reflections are reached", seen.plain.some(saidGood), seen.plain.map(s => s.slice(0, 30)).join(" | "));
  ok("2a. not after saying something is sore today", !seen.sore.some(saidGood), seen.sore.filter(saidGood).map(s => s.slice(0, 50)).join(" | "));
  ok("2b. not after ending early", !seen.early.some(saidGood), seen.early.filter(saidGood).map(s => s.slice(0, 50)).join(" | "));
  ok("2c. not when they have not said how their energy is today", !seen.none.some(saidGood), seen.none.filter(saidGood).map(s => s.slice(0, 50)).join(" | "));
}

// ── 3. THE CHARACTER LINE ────────────────────────────────────────────────
console.log("\nTEST 3 - \"You adjust and continue\" needs the adjusting it describes");
{
  const CHAR = /particular kind of intelligence/;
  const flat = [], varied = [];
  for (let r = 0; r < 8; r++) {
    fixture({ rotate: r, energies: [5, 5, 5, 5, 5], checkedIn: false }); doMoves(10); await wait(10); flat.push(await empathyText());
    fixture({ rotate: r, energies: [2, 8, 3, 7, 2], checkedIn: false }); doMoves(10); await wait(10); varied.push(await empathyText());
  }
  ok("3a. never said to somebody whose energy has been the same every day", !flat.some(s => CHAR.test(s)), flat.filter(s => CHAR.test(s)).length + " times");
  ok("3b. control: it can be said when their energy has varied and they kept coming", varied.some(s => CHAR.test(s)), varied.map(s => s.slice(0, 30)).join(" | "));
}

// ── 4. THE BUILDER NAMES WHAT THEY SAID ──────────────────────────────────
console.log("\nTEST 4 - the builder says the area the person named");
{
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal");
  store.set("equipment", ["dumbbells-light"]); store.set("conditions", ["knee"]); store.set("conditionPainScores", { knee: 4 });
  const ui = await import(B + "views/session-builder-ui.js");
  main.innerHTML = ui.render(); ui.onMount();
  const $$ = s => [...main.querySelectorAll(s)];
  const tile = $$(".sb-type-tile").find(b => b.dataset.type === "stretch") || $$(".sb-type-tile").find(b => b.dataset.type === "mobility");
  tile?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  await wait(20);
  main.querySelector("#sb-location-continue-btn")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  await wait(20);
  const note = T(main.querySelector(".sb-zone-note"));
  ok("4pc. the zone screen marks the sore area", !!note, T().slice(0, 160));
  ok("4a. it says the knee, as they said it -- not \"Quads\"", /knee/i.test(note) && !/Quads/.test(note), note);
}

console.log("");
if (fails) { console.log(`FINISH-LINES: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FINISH-LINES: all ${passes} assertions pass\n`);
process.exit(0);
