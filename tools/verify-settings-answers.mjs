/**
 * tools/verify-settings-answers.mjs
 * 18 Oct 2026 v1
 *
 * GS-EDIT (Graeme, 18 Oct: "change three of the getting-started answers -
 * now"). What made exercise hard before, what you are coming back from and
 * how your energy has been could only be deleted (Delete my health
 * answers), never changed. Settings › Your body › What you told me at the
 * start changes each, saved as it changes, as every other Settings field
 * is. They are health answers: without the health consent the row asks
 * for it first.
 *
 * WEIGHT-RECHECK (Graeme, 18 Oct: "You do those things"). The 3 lb a week
 * check ran only when a target was saved with a weight and a date already
 * there. Now it runs again whenever the weight, the date or the target
 * changes: a target that has become faster than 3 lb a week is set aside
 * (nothing works towards it) and My programme says why, in the refusal's
 * own words. Never with weight tracking off; never a weigh-in asked for.
 */
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
const { SettingsView } = await import(B + "views/settings.js");
const { MyProgrammeView } = await import(B + "views/my-programme.js");
const TD = await import(B + "data/onboarding-thread-data.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const change = el => el?.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
const rtr = { navigate() {}, back() {}, history: [] };

function person({ consent = true } = {}) {
  localStorage.clear(); store.init();
  if (consent) agreed(store); else { agreed(store); store.set("consent.health", { given: false, at: null, version: null, withdrawnAt: null }); }
  store.set("onboardingComplete", true); store.set("name", "G"); store.set("tier", "personal");
}
async function screen() {
  const s = oneScreen(document.createElement("div")); SettingsView(rtr).mount(s); await wait(10);
  const row = settingsFind(s, '[data-open="background"], [data-action="health-background"]');
  return { s, row };
}

console.log("\nGS-EDIT - the three answers can be changed");
person();
store.set("onboarding.hardBeforeSelections", ["wrong-fit", "life-interruption"]);
store.set("onboarding.primaryTerritory", "wrong-fit");
store.set("lifestyle.returningAfter", "injury");
store.set("lifestyle.stressLevel", "running-low");
let { s, row } = await screen();
ok("1a. Your body has a row for what you told me at the start", !!row && /told me at the start/i.test(txt(row)), row ? txt(row) : "no row");
ok("1b. it says they are answered", /Answered/.test(txt(row)));
click(row); await wait(10);
const boxes = [...s.querySelectorAll('input[type="checkbox"][data-hard-before]')];
ok("2a. every \"what made it hard\" answer is a box, ticked as given", boxes.length === TD.HARD_BEFORE_CHIPS.length &&
   boxes.filter(b => b.checked).map(b => b.value).sort().join() === "life-interruption,wrong-fit", boxes.filter(b => b.checked).map(b => b.value).join());
const ret = s.querySelector('select[data-field="lifestyle.returningAfter"]');
const en = s.querySelector('select[data-field="lifestyle.stressLevel"]');
ok("2b. coming back from: the answer given", ret?.value === "injury");
ok("2c. energy: the answer given", en?.value === "running-low");
const wf = boxes.find(b => b.value === "wrong-fit"); wf.checked = false; change(wf);
const bs = boxes.find(b => b.value === "body-story"); bs.checked = true; change(bs);
ok("3a. ticking and unticking saves the list", (store.get("onboarding.hardBeforeSelections") || []).slice().sort().join() === "body-story,life-interruption", JSON.stringify(store.get("onboarding.hardBeforeSelections")));
ok("3b. the main one follows: not one no longer ticked", (store.get("onboarding.hardBeforeSelections") || []).includes(store.get("onboarding.primaryTerritory")), String(store.get("onboarding.primaryTerritory")));
ret.value = "illness"; change(ret);
ok("4a. coming back from: changed", store.get("lifestyle.returningAfter") === "illness");
ret.value = ""; change(ret);
ok("4b. Not answered clears it (null, not an empty string)", store.get("lifestyle.returningAfter") === null, JSON.stringify(store.get("lifestyle.returningAfter")));
en.value = "pretty-good"; change(en);
ok("5a. energy: changed", store.get("lifestyle.stressLevel") === "pretty-good");
person({ consent: false });
({ s, row } = await screen());
ok("6a. without the health consent the row asks for it first", !!row && row.dataset.action === "health-background", row ? row.outerHTML.slice(0, 120) : "no row");

console.log("\nWEIGHT-RECHECK - the 3 lb a week check runs again");
const weeksOut = n => new Date(Date.now() + n * 7 * 864e5).toISOString();
function weighed({ tracking = true } = {}) {
  person(); store.set("weightTracking", tracking); store.set("weightUnit", "kg");
}
weighed();
store.set("weight", 90);
store.set("strategicGoal.targetValue", 80); store.set("strategicGoal.targetUnit", "kg"); store.set("strategicGoal.weightTargetBand", null);
ok("7pc. a target held with no date (as before)", store.get("strategicGoal.targetValue") === 80);
store.set("strategicGoal.targetDate", weeksOut(2));
ok("7a. a date two weeks out (10 kg) sets it aside", store.get("strategicGoal.targetValue") === null && store.get("strategicGoal.weightTargetBand") === "set-aside", JSON.stringify(store.get("strategicGoal")));
weighed();
store.set("strategicGoal.targetDate", weeksOut(20));
store.set("weight", 82); store.set("strategicGoal.targetValue", 80); store.set("strategicGoal.targetUnit", "kg"); store.set("strategicGoal.weightTargetBand", "silent");
store.set("weight", 82);
ok("8pc. a sustainable target stays", store.get("strategicGoal.targetValue") === 80, JSON.stringify(store.get("strategicGoal")));
store.set("strategicGoal.targetDate", weeksOut(1));
ok("8a. the date brought close: set aside", store.get("strategicGoal.targetValue") === null && store.get("strategicGoal.weightTargetBand") === "set-aside");
weighed();
store.set("strategicGoal.targetDate", weeksOut(10));
store.set("weight", 82); store.set("strategicGoal.targetValue", 80); store.set("strategicGoal.targetUnit", "kg");
store.set("weight", 100);
ok("9a. a new, higher weight that makes it too fast: set aside", store.get("strategicGoal.targetValue") === null && store.get("strategicGoal.weightTargetBand") === "set-aside", JSON.stringify(store.get("strategicGoal")));
const main = document.getElementById("main-content");
main.innerHTML = ""; MyProgrammeView(rtr).mount(main); await wait(10);
const note = txt(main.querySelector("#weight-target-note"));
ok("9b. My programme says why, in the refusal's words", /set (it|your target) aside/i.test(note) && /faster than I can plan for safely/i.test(note), note || txt(main).slice(0, 200));
ok("9c. and never states a rate or a number about the body", !/\d+(\.\d+)?\s*(kg|lb|st)\b|a week/i.test(note), note);
weighed({ tracking: false });
store.set("strategicGoal.targetValue", 80); store.set("strategicGoal.targetUnit", "kg");
store.set("weight", 90); store.set("strategicGoal.targetDate", weeksOut(1));
ok("10a. weight tracking off: nothing is touched", store.get("strategicGoal.targetValue") === 80);

console.log(`\nVERIFY-SETTINGS-ANSWERS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
