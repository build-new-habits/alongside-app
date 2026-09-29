/**
 * tools/verify-free-classes.mjs
 * 29 Sep 2026 v1
 *
 * P22, CLASSES ON FREE (persona finding W2-18). Classes run the same for
 * everybody, and suit personas 2.11 and 2.14 best -- but Free Home had no
 * door to them (the Plan has "Join a class"). And the class list gave a
 * class's position ("floor") and never said it could be done seated,
 * though the class itself declares a seated route (seatedRoute).
 *
 * Decision (accepted 28 Sep): classes are the same for everybody, so Free
 * gets the door.
 *
 * Through the real router:
 *   1. Free Home: a Classes door among "Move your body"; it opens the
 *      class list, not the upgrade page; a class starts.
 *   2. The list says "can be done seated" for every class that declares a
 *      seated route or is seated throughout, and for no other.
 *   3. Control: the Plan's "Join a class" is unchanged.
 *   4. Found on the way: the list read pain scores from 'painScores', a
 *      field that does not exist, so a severe score (a knee at 8) never
 *      held a class back. It reads conditionPainScores now.
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
const { CLASSES } = await import(B + "data/classes/index.js");

// ── 1. THE DOOR ─────────────────────────────────────────────────────────
console.log("\nTEST 1 - Free Home has a door to classes");
fixture("free");
await go("today");
const moveGroup = main.querySelector('[aria-labelledby="today-group-body"]');
const door = moveGroup && [...moveGroup.querySelectorAll("button")].find(b => /Classes/.test(txt(b)));
ok("1pc. Free Home, \"Move your body\"", !!moveGroup, txt(main).slice(0, 160));
ok("1a. a Classes door is among them", !!door, moveGroup ? [...moveGroup.querySelectorAll("button")].map(txt).join(" | ") : "");
click(door); await wait(120);
ok("1b. it opens the class list, not the upgrade page", router.currentView === "classes" && /Classes/.test(txt(main)) && !/the plan costs|£/i.test(txt(main)), `${router.currentView} | ${txt(main).slice(0, 120)}`);
const start = $("[data-start]");
click(start); await wait(200);
ok("1c. and a class starts", router.currentView === "class-player", router.currentView);

// ── 2. SEATED ───────────────────────────────────────────────────────────
console.log("\nTEST 2 - the list says which classes can be done seated");
fixture("free");
await go("classes");
const rows = $$(".class-list__row").map(li => ({ name: txt(li.querySelector(".class-list__name")), facts: txt(li.querySelector(".class-list__facts")), label: li.querySelector("[data-start]")?.getAttribute("aria-label") || "" }));
const byTitle = new Map(CLASSES.map(c => [c.title, c]));
const wrong = [];
let seatedShown = 0;
for (const r of rows) {
  const c = byTitle.get(r.name); if (!c) continue;
  const should = c.seatedRoute === true || c.position === "seated";
  const says = /can be done seated|\bseated\b/i.test(r.facts);
  if (should !== says) wrong.push(`${r.name}: declares ${c.seatedRoute}/${c.position}, list says "${r.facts}"`);
  if (should) { seatedShown++; if (!/seated/i.test(r.label)) wrong.push(`${r.name}: Start's name does not say seated`); }
}
ok("2pc. the list shows the classes", rows.length >= 8, `${rows.length}`);
ok("2a. \"can be done seated\" exactly where the class declares it", wrong.length === 0 && seatedShown >= 4, `${seatedShown} seated; ${wrong.join("; ")}`);
const ground = rows.find(r => r.name === "Ground");
ok("2b. Ground (a floor class with a seated route) says both", !!ground && /floor/.test(ground.facts) && /can be done seated/.test(ground.facts), ground?.facts);

// ── 3. CONTROL ──────────────────────────────────────────────────────────
console.log("\nTEST 3 - control: the Plan's \"Join a class\" is unchanged");
fixture("personal");
await go("today");
ok("3a. \"Join a class\" is on Plan Home", !!$$("button").find(b => /Join a class/.test(txt(b)) && b.dataset.route === "classes"));

// ── 4. A SEVERE SCORE HOLDS A CLASS BACK ────────────────────────────────
console.log("\nTEST 4 - a knee scored 8 today holds back the classes that load it");
{
  fixture("free");
  store.set("conditions", ["knee"]);
  store.set("conditionPainScores", { knee: 0 });
  await go("classes");
  const offered = () => $$(".class-list__row:not(.class-list__row--held)").filter(li => li.querySelector("[data-start]")).map(li => txt(li.querySelector(".class-list__name")));
  const held = () => $$(".class-list__row--held .class-list__name").map(txt);
  const quiet = offered();
  store.set("conditionPainScores", { knee: 8 });
  await go("today"); await go("classes");
  const sore = offered();
  ok("4pc. with the knee quiet, Standing Up and Unsticking are offered", quiet.includes("Standing Up") && quiet.includes("Unsticking"), quiet.join(", "));
  ok("4a. with the knee at 8, neither is offered, and both are named under \"Not today\"", !sore.includes("Standing Up") && !sore.includes("Unsticking") &&
     held().includes("Standing Up") && held().includes("Unsticking"), `offered: ${sore.join(", ")} | held: ${held().join(", ")}`);
}

console.log("");
if (fails) { console.log(`FREE-CLASSES: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FREE-CLASSES: all ${passes} assertions pass\n`);
process.exit(0);
