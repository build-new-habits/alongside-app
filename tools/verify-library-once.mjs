/**
 * tools/verify-library-once.mjs
 * 24 Nov 2026 v3
 *
 * v3 - P-46 S4 FREE HOME. Free's Library moved to the Plan. The Free checks
 *   are retired (git history v2; screens archived in BNH-Files Archive/P-46):
 *   Free gets the on-the-plan page, the Plan its Library.
 *
 * 31 Oct 2026 v2
 *
 * v2 - P-13 re-point (Graeme, 29 Oct: the Library keeps "Only what doors
 *   don't hold"; 31 Oct: doors first, then trim). At home and At the gym are
 *   Free's Library categories now; on the Plan the same sessions come from
 *   Get stronger (where, which part, Build it for me: the place asked once,
 *   P-5) and My programme from Get stronger › Gym (verify-library-shelf 2d,
 *   2f). Every check here runs on Free, unchanged; 6c finds Free's My
 *   programme card, which is the Plan's (locked on Free) as before.
 *
 * D-5 LIBRARY-ONCE. Graeme, device test, 04 Oct, going through the Library:
 * "I'm asked home or gym twice" and "the look of the coach plan (where I can
 * switch out ...) isn't the same". At home / At the gym already say where;
 * their body sessions opened the step-by-step builder, which asked again
 * and ended on its own older plan.
 *
 * Through the real router, both tiers, every body session in At home and
 * At the gym:
 *   1. One tap opens Today's plan (the coach's plan screen), not the builder.
 *   2. Nothing asks At home or At the gym again on the way.
 *   3. The plan is for the place the Library said (its Where), and the kind
 *      tapped ("You asked for strength, upper body ..."; Focus on the Plan).
 *   4. It is the same plan screen: grouped rows, each exercise a button that
 *      opens its sheet; Swap on the Plan; Start.
 *   5. The place is read once: the next plan, from Home, is back to the
 *      default.
 *   6. The other cards (Core at home, Cardio, My programme) go where they
 *      went.
 *   7. The category page is in the LOOK cards: kind tiles with line icons,
 *      a chevron, no emoji.
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
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 400)}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = async el => { el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); await wait(80); };

const GYM = ["dumbbells-medium", "barbell", "bench-flat", "kettlebell-medium", "band-light", "gym-membership"];
const HOME = ["dumbbells-light", "band-light"];
function fixture(tier) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("homeEquipment", HOME); store.set("gymEquipment", GYM); store.set("equipment", [...HOME, ...GYM]);
  store.set("sessionLocation", "home");
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
const view = () => router.currentView;
// Anything that would ask where again: the builder's step, or a question naming both places.
const asksWhere = () => !!$(".sb-location-btn") || /home or (at )?the gym\?|where are you training/i.test(txt(main));

const CARDS = {
  home: [["Full Body", "full"], ["Upper body", "upper"], ["Lower body", "lower"], ["Mobility", "mobility"]],
  gym:  [["Core", "core"], ["Upper body", "upper"], ["Lower body", "lower"], ["Glute Focus", "glute"], ["Full Body", "full"]],
};
const WORDS = { full: "strength, full body", upper: "strength, upper body", lower: "strength, lower body", glute: "strength, glutes", core: "core", mobility: "mobility" };

// P-46 S4 FREE HOME. Every check here ran on Free's Library, which moved to the
// Plan (spec §5). Free asking for the Library opens the on-the-plan page; the
// Plan's Library is verify-library-shelf. The old checks are in git history
// (v2) and the Free screens in BNH-Files Archive/P-46.
console.log("\nTEST 1 - Free's Library is the Plan's now");
fixture("free");
await router.navigate("library"); await wait(60);
ok("1. Free asking for the Library: the on-the-plan page, which says what it is", view() === "on-the-plan" && /The Library/.test(txt(main)) && /Part of the Plan/.test(txt(main)), view());
fixture("personal");
await router.navigate("library"); await wait(60);
ok("2. the Plan: the Library, as before", view() === "library");

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
