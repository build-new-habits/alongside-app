/**
 * tools/verify-bad-day-doors.mjs
 * 04 Oct 2026 v1
 *
 * W6-1 BAD-DAY-BUILDER-2 and W6-2 LIBRARY-BAD-DAY (Wave 6 persona trace:
 * 2.1, 2.14, 2.15, 2.16). On a Bad day the builder (Cardio, Core &
 * Strength; Mobility & Conditioning) showed the gentle plan with no choice,
 * "this is not the session you asked for", "20 · 3 exercises" and its own
 * length (20 minutes beside the coach's 30); the Library's walk, core, ride
 * and swim started with no choice ("Your knee has some discomfort today");
 * the coach's own choice said "Adapt and continue" and was named "Severe
 * pain".
 *
 *   1. Knee Bad: the builder, walk, core, cycle and swim each ask Rest today
 *      / Something gentler first, in the person's word.
 *   2. Something gentler from the builder: the coach's gentle plan, the one
 *      plan of the day (the builder builds and stores nothing itself), and
 *      a door's preselect is cleared.
 *   3. The coach's choice uses the same labels, named by them.
 *   4. Controls: Quite sore opens each door as before.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.alert = () => {}; globalThis.alert = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");
const RF = await import(B + "data/red-flag.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s);
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

function fixture(score) {
  localStorage.clear(); store.init(); agreed(store); gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Robin"); store.set("tier", "free");
  store.set("equipment", ["dumbbells"]); store.set("homeEquipment", ["dumbbells"]);
  store.set("conditions", ["knee"]); store.set("conditionPainScores", { knee: score });
  store.set("redFlag", { screenedAt: new Date().toISOString(), areas: ["knee"], textVersion: RF.RED_FLAG_VERSION, level: null, flaggedAt: null, clearedAt: null });
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
const go = async v => { await router.navigate(v); await wait(40); };
const DOORS = ["session-builder", "walk-session", "core-session", "cycle-session", "swim-session"];

console.log("\nTEST 1 - knee Bad: every door asks first");
for (const d of DOORS) {
  fixture(8);
  await go("today"); await go(d);
  ok(`1. ${d}: Rest today / Something gentler, in their word`, !!$('[data-bad-day="adapt"]') && !!$('[data-bad-day="rest"]') && /knee is bad today/i.test(txt(main)) && !/some discomfort/i.test(txt(main)) && !$(".sb-severe-banner"), `${router.currentView} | ${txt(main).slice(0, 160)}`);
}

console.log("\nTEST 2 - Something gentler from the builder");
fixture(8);
store.set("sessionBuilderPreselect", { type: "mobility", returnTo: "mobility-conditioning" });
const storedBefore = JSON.stringify(store.get("generatedSession"));
await go("today"); await go("session-builder");
ok("2a. the builder builds and stores nothing itself", JSON.stringify(store.get("generatedSession")) === storedBefore);
click($('[data-bad-day="adapt"]')); await wait(80);
ok("2b. the choice is recorded; the coach shows the gentle plan", (store.get("severePainChoices") || []).at(-1)?.choice === "adapt" && router.currentView === "coach-proposal" && /breath/i.test(txt(main)), `${router.currentView} | ${txt(main).slice(0, 160)}`);
ok("2c. the door's preselect is cleared", store.get("sessionBuilderPreselect") == null, JSON.stringify(store.get("sessionBuilderPreselect")));

console.log("\nTEST 3 - the coach's own choice");
fixture(8);
await go("today"); await go("coach-proposal");
const region = main.querySelector('[data-severe-choice]')?.closest('[role="region"]');
const adapt = main.querySelector('[data-severe-choice="adapt"]');
ok("3a. Something gentler, named by its words; no Severe pain / Adapt and continue", !!adapt && /^Something gentler/.test(txt(adapt)) && !adapt.hasAttribute("aria-label") && !/Severe pain|Adapt and continue/.test(main.innerHTML), `${txt(adapt)} | ${region?.getAttribute("aria-label")}`);

console.log("\nTEST 4 - controls: Quite sore");
for (const d of DOORS) {
  fixture(6);
  await go("today"); await go(d);
  ok(`4. ${d}: opens as before`, !$('[data-bad-day]') && router.currentView === d, txt(main).slice(0, 120));
}

console.log("");
if (fails) { console.log(`BAD-DAY-DOORS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`BAD-DAY-DOORS: all ${passes} assertions pass\n`);
process.exit(0);
