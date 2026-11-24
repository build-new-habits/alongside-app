/**
 * tools/verify-free-classes.mjs
 * 24 Nov 2026 v7
 *
 * v7 - P-46 S4 FREE HOME. Classes moved to the Plan. Free gets the on-the-
 *   plan page (TEST 1); the knee rule (TEST 4) is checked on the Plan's list;
 *   Free's list checks are retired (git history v6).
 *
 * 12 Oct 2026 v6
 *
 * v6 - A-1 PLAN-HOME-PRUNE (Graeme approved the mock-up, 12 Oct). 3a: on
 *   the Plan, classes moved from a Home tile to the Library (Classes, the
 *   Plan's only). Still reached, now Home > Library > Classes. Free's own
 *   door (TEST 1) is unchanged.
 *
 *
 * v5 - W5-2 BAD-DAY-DOORS. At Bad (8) Classes now asks Rest today /
 *   Something gentler instead of listing classes; 4a holds the list's own
 *   filter at 7 (still a held list there) and 4b asks that 8 gives the
 *   choice and no class. Not loosened: at 8 nothing can be started at all.
 *
 * v4 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * v3 - W3-0. 2b's "both" example is Putting the Day Down (mixed): Getting
 *   Going no longer says seated (verify-s1-seated v2), so three classes do.
 *
 * 30 Sep 2026 v2
 *
 * v2 - S1-SEATED. 2a checked the list against each class's DECLARED seated
 *   route, and so agreed with the fault the S1 pack found: three classes
 *   declared one that four of their steps did not give. It now checks
 *   the list against seatedThroughout() -- what the class says -- and 2b
 *   uses Getting Going (standing, every step seated) for "both"; Ground's
 *   new state is proven in verify-s1-seated.
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
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("equipment", ["dumbbells", "bench"]); store.set("homeEquipment", ["dumbbells", "bench"]);
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(60); }
const { CLASSES, seatedThroughout } = await import(B + "data/classes/index.js");

// ── 1. FREE: CLASSES ARE THE PLAN'S (P-46 S4) ──────────────────────────
// Classes moved to the Plan (spec §5). The Free door and Free's list checks
// are retired (git history v6); the seated words on the Plan's list are
// verify-s1-seated TEST 2.
console.log("\nTEST 1 - Free: Classes are part of the Plan");
fixture("free");
await go("today");
ok("1a. no Classes door on Free Home", !/Classes/.test(txt(main)), txt(main).slice(0, 160));
await go("classes");
ok("1b. Free asking for Classes: the on-the-plan page, which says what they are", router.currentView === "on-the-plan" && /Follow-along classes/.test(txt(main)), router.currentView);
await go("class-player");
ok("1c. and the class player too", router.currentView === "on-the-plan", router.currentView);

// ── 3. CONTROL ──────────────────────────────────────────────────────────
console.log("\nTEST 3 - control: the Plan's \"Join a class\" is unchanged");
fixture("personal");
await go("today");
ok("3a. Plan Home's Library row is there", !!$$("button").find(b => b.dataset.route === "library"));
await go("library");
const libClasses = $$("button").find(b => b.dataset.guided === "classes");
ok("3b. and the Library offers Classes", !!libClasses);
libClasses?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); await wait(60);
ok("3c. which opens the classes", router.currentView === "classes", router.currentView);

// ── 4. A SEVERE SCORE HOLDS A CLASS BACK ────────────────────────────────
console.log("\nTEST 4 - a knee scored 8 today holds back the classes that load it");
{
  fixture("personal");   // P-46 S4: Classes are the Plan's; the safety rule is checked there
  store.set("conditions", ["knee"]);
  store.set("conditionPainScores", { knee: 0 });
  await go("classes");
  const offered = () => $$("[data-class]").map(b => txt(b.querySelector(".path-door__t")).replace(/ Your arc$/, ""));
  const held = () => $$(".class-list__row--held .class-list__name").map(txt);
  const quiet = offered();
  store.set("conditionPainScores", { knee: 7 });
  await go("today"); await go("classes");
  const sore = offered();
  ok("4pc. with the knee quiet, Standing Up and Unsticking are offered", quiet.includes("Standing Up") && quiet.includes("Unsticking"), quiet.join(", "));
  ok("4a. with the knee at 7, neither is offered, and both are named under \"Not today\"", !sore.includes("Standing Up") && !sore.includes("Unsticking") &&
     held().includes("Standing Up") && held().includes("Unsticking"), `offered: ${sore.join(", ")} | held: ${held().join(", ")}`);
  store.set("conditionPainScores", { knee: 8 });
  await go("today"); await go("classes");
  ok("4b. with the knee Bad (8), the Bad-day choice and no class to start", !!$('[data-bad-day="adapt"]') && !$("[data-start]") && !$("[data-class]"), txt(main).slice(0, 160));
}

console.log("");
if (fails) { console.log(`FREE-CLASSES: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FREE-CLASSES: all ${passes} assertions pass\n`);
process.exit(0);
