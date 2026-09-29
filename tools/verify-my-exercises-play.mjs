/**
 * tools/verify-my-exercises-play.mjs
 * 29 Sep 2026 v1
 *
 * P5, PRESCRIBED-CRASH (persona finding W2-5). A person's own list of
 * exercises -- "My exercises", from their physio or anywhere else -- was
 * played by a view that skipped every other exercise when one was
 * finished, then read past the end of the list and crashed. Fixed inside
 * P0 (v567); this is the proof the P5 row asks for: play all eight to the
 * end, in order, and log all eight.
 *
 * Red first against v566 (the code before P0): see the master schedule.
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
const view = await import(B + "views/prescribed-session.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
let navs = [], crash = null;
function paint() {
  try { main.innerHTML = view.render(); view.onMount(); }
  catch (e) { crash = crash || e.message; }
}
const _router = { navigate: v => { navs.push(v); if (v === "prescribed-session") paint(); }, back() {} };
globalThis.window.router = _router;
Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });
const tap = id => { const el = document.getElementById(id); if (el) el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };

// Eight of their own: four matched to the library, four typed in.
const OWN = [
  { exerciseId: "glute-bridge", name: "Glute bridge" }, { name: "Calf raises" },
  { exerciseId: "clamshell", name: "Clamshell" }, { name: "Heel drops" },
  { exerciseId: "bird-dog", name: "Bird dog" }, { name: "Wall push" },
  { exerciseId: "dead-bug", name: "Dead bug" }, { name: "Band row" },
].map((e, i) => ({ id: `own-${i}`, sets: 2, reps: "10", notes: "", active: true, completedToday: false, ...e }));

localStorage.clear(); store.init();
store.set("onboardingComplete", true); store.set("tier", "free");
store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
store.set("prescribedExercises", OWN);
paint();

console.log("\nTEST 1 - all eight, in order, to the end");
const seen = [];
for (let i = 0; i < 200 && !navs.includes("reflect") && !crash; i++) {
  const name = main.querySelector(".exercise-name, h1, h2")?.textContent?.trim();
  if (name && OWN.some(e => e.name === name) && seen.at(-1) !== name) seen.push(name);
  if (!tap("ps-complete-btn") && !tap("ps-done-btn") && !tap("ps-watch-btn") && !tap("ps-begin-btn")) break;
}
ok("1pc. the player opened on the first exercise", seen[0] === OWN[0].name, JSON.stringify(seen));
ok("1a. no crash", !crash, crash);
ok("1b. every exercise, in order, none skipped", JSON.stringify(seen) === JSON.stringify(OWN.map(e => e.name)), JSON.stringify(seen));
ok("1c. it finished", navs.includes("reflect"), JSON.stringify(navs.slice(-3)));
const entry = (store.get("activityLog") || []).at(-1);
ok("1d. and logged all eight", entry?.exercisesCount === 8, JSON.stringify({ count: entry?.exercisesCount, type: entry?.type }));

console.log("");
if (fails) { console.log(`MY-EXERCISES-PLAY: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`MY-EXERCISES-PLAY: all ${passes} assertions pass\n`);
process.exit(0);
