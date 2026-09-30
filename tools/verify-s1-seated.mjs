/**
 * tools/verify-s1-seated.mjs
 * 30 Sep 2026 v2
 *
 * v2 - W3-0 (Wave 3, persona 2.11). v1 counted a step's seatedAlternativeId
 *   as its seated version -- but nothing in js/views reads that field, so
 *   the player never offers it. Getting Going's "Sit to stand" and "Up on
 *   your toes" give only standing words, and it said "can be done seated".
 *   Now only words, position, an optional step or a breath count; Getting
 *   Going joins the three that do not say it, and Ground's Thread the
 *   Needle and Unsticking's Hip circles are named with them.
 *
 * S1-SEATED (found building the S1 clinical pack, 29 Sep). The class list
 * says "can be done seated" wherever a class DECLARES a seated route
 * (P22). A class plays by its words alone -- seatedAlternativeId has no
 * reader in the player -- and four steps in three declaring classes give
 * only floor or standing directions: Ground "Knees side to side", Bending
 * "Pelvic tilt" and "Glute bridge", Unsticking "Hip flexor". So the line
 * promised something the class does not say how to do.
 *
 * Recommended and taken (Graeme, 30 Sep: "follow your best
 * recommendations"): the line shows only where every movement step has a
 * seated version -- the movement is seated, its seated alternative is,
 * the step's own words say how to do it sitting, or the words make the
 * step optional ("if standing is fine today"). When the physio answers
 * pack section 5, the seated words go in and the line comes back.
 *
 *   1. seatedThroughout() is true for exactly Getting Going, From the
 *      Feet, Putting the Day Down and Stopping Early, and false for
 *      Ground, Bending and Unsticking, naming the steps.
 *   2. The real class list, through the router, says "can be done
 *      seated" exactly there, on the line and in the Start button's name.
 */
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

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

function fixture(tier) {
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("equipment", ["dumbbells", "bench"]); store.set("homeEquipment", ["dumbbells", "bench"]);
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(60); }
const { CLASSES, seatedThroughout, unseatedSteps } = await import(B + "data/classes/index.js");

console.log("\nTEST 1 - which classes can be done seated, from their own words");
const YES = ["From the Feet", "Putting the Day Down", "Stopping Early"];
const NO  = { "Ground": ["Thread the Needle", "Knees side to side"], "Bending": ["Pelvic tilt", "Glute bridge"],
              "Unsticking": ["Hip circles", "Hip flexor"],
              "Getting Going": ["Sit to stand", "Up on your toes"] };
const byTitle = new Map(CLASSES.map(c => [c.title, c]));
ok("1pc. every named class exists", [...YES, ...Object.keys(NO)].every(t => byTitle.has(t)));
for (const t of YES) ok(`1a. ${t}: every step has a seated version`, seatedThroughout(byTitle.get(t)) === true, JSON.stringify(unseatedSteps(byTitle.get(t))));
for (const [t, steps] of Object.entries(NO)) {
  const got = unseatedSteps(byTitle.get(t));
  ok(`1b. ${t}: not seated throughout, and the steps are named`, seatedThroughout(byTitle.get(t)) === false && steps.every(s => got.includes(s)) && got.length === steps.length, JSON.stringify(got));
}

console.log("\nTEST 2 - the real class list says it exactly there");
fixture("free");
await go("classes");
const rows = $$(".class-list__row").map(li => ({ name: txt(li.querySelector(".class-list__name")), facts: txt(li.querySelector(".class-list__facts")), label: li.querySelector("[data-start]")?.getAttribute("aria-label") || "" }));
ok("2pc. the list shows every class", rows.length === CLASSES.length, `${rows.length} of ${CLASSES.length}`);
const wrong = [];
for (const r of rows) {
  const c = byTitle.get(r.name);
  const should = YES.includes(r.name);
  const says = /can be done seated/i.test(r.facts) || (c?.position === "seated");
  const label = /seated/i.test(r.label);
  if (should !== says || should !== label) wrong.push(`${r.name}: facts "${r.facts}", Start "${r.label}"`);
}
ok("2a. \"can be done seated\" on the line and the Start button, exactly where every step has a seated version", wrong.length === 0, wrong.join("; "));
const ground = rows.find(r => r.name === "Ground");
ok("2b. Ground still says floor, and no longer says seated", !!ground && /floor/.test(ground.facts) && !/seated/i.test(ground.facts + ground.label), ground && (ground.facts + " | " + ground.label));

console.log("");
if (fails) { console.log(`S1-SEATED: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`S1-SEATED: all ${passes} assertions pass\n`);
process.exit(0);
