/**
 * tools/verify-lift-unit.mjs
 * 27 Oct 2026 v1
 *
 * LIFT-UNIT (Graeme, 27 Oct 2026, with a screenshot of "Weight (st)" on a
 * Dumbbell Romanian Deadlift: "these exercises hold stone as the gym
 * weight. They need to be kg or pounds (for the American market)").
 *
 *  1. The lifting unit is never stone: someone whose body weight is shown
 *     in stone lifts in kg; in lb, lifts in lb; a phone set to the United
 *     States lifts in lb; a choice of kg or lb wins over both.
 *  2. The set logger's weight field says kg or lb, and its ± step is 2.5 kg
 *     or 5 lb.
 *  3. A logged lift is stamped kg or lb, never st.
 *  4. Lifts already saved as st load as kg (liftLog, personalBests, the
 *     exercise-history best); a liftUnit that is not kg or lb loads as null.
 *  5. Settings › Equipment offers "Weights you lift, in" kg and lb, on Free
 *     too, and a tap saves it; the body-weight picker says body weight.
 *  6. Nothing that logs a lift reads the body-weight unit.
 */
import fs from "node:fs";
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
import { oneScreen } from "./one-screen.mjs";
import { settingsFind } from "./settings-open.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SL = await import(B + "session-log.js");
const { SettingsView } = await import(B + "views/settings.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const setLang = l => Object.defineProperty(dom.window.navigator, "language", { value: l, configurable: true });
const rtr = { navigate() {}, back() {}, history: [] };
function person(tier = "personal") {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "G"); store.set("tier", tier);
  store.set("liftLogEnabled", true);
}
const rdl = EXERCISES.find(e => e.id === "dumbbell-rdl") || EXERCISES.find(e => /romanian/i.test(e.name) && (e.equipment || []).includes("dumbbell"));

console.log("\nTEST 1 - the lifting unit is never stone");
setLang("en-GB");
person(); store.set("weightUnit", "st");
ok("1a. body weight in stone: lifts in kg", store.liftUnit() === "kg", store.liftUnit());
store.set("weightUnit", "lb");
ok("1b. body weight in lb: lifts in lb", store.liftUnit() === "lb", store.liftUnit());
store.set("weightUnit", "kg"); setLang("en-US");
ok("1c. a phone set to the United States: lifts in lb", store.liftUnit() === "lb", store.liftUnit());
store.set("liftUnit", "kg");
ok("1d. a choice of kg wins", store.liftUnit() === "kg");
setLang("en-GB"); store.set("weightUnit", "st"); store.set("liftUnit", "lb");
ok("1e. a choice of lb wins over stone", store.liftUnit() === "lb");

console.log("\nTEST 2 - the set logger says kg or lb");
person(); setLang("en-GB"); store.set("weightUnit", "st");
ok("2a. a dumbbell exercise to test with", !!rdl, "none found");
let f = SL.performanceFields(rdl).find(x => x.key === "weight");
ok("2b. body weight in stone: the field says Weight (kg)", f?.label === "Weight (kg)", f?.label);
let html = SL.renderLogBlock(rdl, "t");
ok("2c. the ± steps say 2.5 kg", /2\.5 kg less/.test(html) && !/\bst less/.test(html));
store.set("liftUnit", "lb");
f = SL.performanceFields(rdl).find(x => x.key === "weight");
html = SL.renderLogBlock(rdl, "t");
ok("2d. lifting in lb: Weight (lb), 5 lb steps", f?.label === "Weight (lb)" && /5 lb more/.test(html), f?.label);

console.log("\nTEST 3 - a logged lift is stamped kg or lb");
person(); setLang("en-GB"); store.set("weightUnit", "st");
store.logLift(rdl.id, { weight: 10, reps: 10 });
ok("3a. body weight in stone: the lift is saved in kg", store.lastLift(rdl.id)?.unit === "kg", store.lastLift(rdl.id)?.unit);
store.logLift(rdl.id, { weight: 10, reps: 10, unit: "st" });
ok("3b. even if asked for st, it is saved in kg or lb", ["kg", "lb"].includes(store.lastLift(rdl.id)?.unit), store.lastLift(rdl.id)?.unit);

console.log("\nTEST 4 - lifts saved as st load as kg");
const saved = store.mergeWithDefaults({
  liftUnit: "st",
  liftLog: { [rdl.id]: [{ at: "2026-10-27T08:11:00Z", weight: 10, reps: 10, unit: "st" }] },
  personalBests: { [rdl.id]: { weight: { value: 10, unit: "st", at: "x" } } },
  exerciseHistory: { [rdl.id]: { best: { weight: 10, reps: 10, unit: "st", at: "x" } } },
});
ok("4a. liftLog", saved.liftLog[rdl.id][0].unit === "kg");
ok("4b. personal best", saved.personalBests[rdl.id].weight.unit === "kg");
ok("4c. exercise-history best", saved.exerciseHistory[rdl.id].best.unit === "kg");
ok("4d. a liftUnit of st loads as not chosen", saved.liftUnit === null);

console.log("\nTEST 5 - Settings › Equipment");
for (const tier of ["free", "personal"]) {
  person(tier); setLang("en-GB");
  const s = oneScreen(document.createElement("div")); SettingsView(rtr).mount(s); await wait(10);
  click(settingsFind(s, '[data-open="equipment"]')); await wait(10);
  const kg = s.querySelector('[data-lift-unit="kg"]'), lb = s.querySelector('[data-lift-unit="lb"]');
  const label = s.querySelector("#settings-lift-unit-label")?.textContent || "";
  ok(`5a. ${tier}: "Weights you lift, in" kg and lb, kg pressed`, !!kg && !!lb && /Weights you lift/.test(label) && kg.getAttribute("aria-pressed") === "true" && !s.querySelector('[data-lift-unit="st"]'));
  click(lb); await wait(10);
  ok(`5b. ${tier}: tapping lb saves it and shows it pressed`, store.get("liftUnit") === "lb" && s.querySelector('[data-lift-unit="lb"]')?.getAttribute("aria-pressed") === "true");
}
const st = fs.readFileSync(new URL("../js/views/settings.js", import.meta.url), "utf8");
ok("5c. the body-weight picker says body weight", /Show your body weight in/.test(st) && !/>Show weights in</.test(st));

console.log("\nTEST 6 - nothing that logs a lift reads the body-weight unit");
for (const p of ["session-log.js", "views/capture.js"]) {
  const src = fs.readFileSync(new URL("../js/" + p, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
  ok(`6. ${p}`, !/weightUnit/.test(src) && /liftUnit\(\)/.test(src));
}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
