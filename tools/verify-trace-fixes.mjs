import { createRequire as __cr } from "node:module";
/**
 * tools/verify-trace-fixes.mjs
 * 29 Oct 2026 v1
 *
 * P-12 FIX-NOW (the consistency trace on v684, BNH-Files Product/
 * alongside_consistency_trace_29oct2026_v1.md; Graeme, 29 Oct: "As
 * proposed"). Two faults, on both tiers:
 *   1. three screens had no heading (WCAG 1.3.1, 2.4.6): Mobility &
 *      Conditioning, Morning Programme, and My programme with no session
 *      built. Each now has exactly one h1, naming it;
 *   2. Mobility & Conditioning's Log an event ("Capture something you've
 *      already done") opened the Library, wherever it was last left (the
 *      trace landed on the Mindful shelf). It opens Log an activity.
 * Drives the real views.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const { MobilityConditioningView } = await import(B + "views/mobility-conditioning.js");
const MS = await import(B + "views/morning-session.js");
const { GymProgrammeView } = await import(B + "views/gym-programme.js");
const { router: realRouter } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const router = { history: ["today"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = router; realRouter.navigate = router.navigate;
const h1s = () => [...main.querySelectorAll("h1")].map(txt);

for (const tier of ["free", "personal"]) {
  console.log(`\nTEST - ${tier === "free" ? "Free" : "the Plan"}`);
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  navs = [];

  main.innerHTML = ""; MobilityConditioningView(router).mount(main);
  ok(`${tier}: Mobility & Conditioning names itself in one heading`, JSON.stringify(h1s()) === '["Mobility & Conditioning"]', JSON.stringify(h1s()));
  navs = []; main.querySelector("#mc-log-event")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  ok(`${tier}: Log an event opens Log an activity, as it says`, navs.join() === "activity-log", JSON.stringify(navs));

  main.innerHTML = MS.render(); try { MS.onMount(); } catch {}
  ok(`${tier}: Morning Programme names itself in one heading`, JSON.stringify(h1s()) === '["Morning Programme"]', JSON.stringify(h1s()));

  if (tier === "free") continue;   // My programme (gym) is the Plan's (library.js tier "personal"); Free draws nothing here
  store.set("generatedSession", null);
  main.innerHTML = ""; try { GymProgrammeView(router).mount(main); } catch (e) { console.log("        mount:", e.message); }
  ok(`${tier}: My programme with no session built has one heading`, JSON.stringify(h1s()) === '["My programme"]' && /No session generated yet/.test(txt(main)), `${JSON.stringify(h1s())} ${txt(main).slice(0, 80)}`);
}

console.log(`\n${"=".repeat(60)}\nVERIFY-TRACE-FIXES: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
