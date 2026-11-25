import { createRequire as __cr } from "node:module";
/**
 * tools/verify-back-fixes.mjs
 * 25 Nov 2026 v1
 *
 * Two faults held since 12 Nov for the phone test's fixes (schedule rows
 * 11a and 11b; Graeme, 25 Nov: "why are they not already done?"):
 *   11a FREE-CHECKIN-HEAD: Free's check-in had no heading and no way back
 *       (WCAG 1.3.1, 2.4.6); someone who opened it by mistake was stuck.
 *       Now both tiers draw "Check in" as the page's one h1 and "‹ Back",
 *       which goes where they came from and leaves nothing waiting.
 *   11b ARC-BACK-2: Your arc's Back always went to Home (ARC-BACK, 05 Sep,
 *       when the arc lived on Home). The way in is now Progress' Change my
 *       arc, so Back goes where you came from, stepping over the arc's own
 *       screens (changing a part returns to the arc without a new step).
 * Drives the real views with a router whose back() is the real router's.
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
const { CheckinView } = await import(B + "views/checkin.js");
const { StretchArcView } = await import(B + "views/stretch-arc.js");
const { router: realRouter } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
// back() is the real router's own (pop one step, go there, push nothing).
const router = { history: [], navigate: (v) => navs.push(v), back: realRouter.back };
globalThis.window.router = router; realRouter.navigate = router.navigate;
const h1s = () => [...main.querySelectorAll("h1")].map(txt);
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const person = tier => {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
};

// ── 11a ─────────────────────────────────────────────────────────────────
for (const tier of ["free", "personal"]) {
  console.log(`\nTEST 11a - the check-in, ${tier === "free" ? "Free" : "the Plan"}`);
  person(tier);
  store.set("pendingDoorRoute", "path");
  router.history = ["today"]; navs = [];
  main.innerHTML = ""; let v; try { v = CheckinView(router); v.mount(main); } catch (e) { console.log("        mount:", e.message); }
  ok(`${tier}: one heading, "Check in"`, JSON.stringify(h1s()) === '["Check in"]', JSON.stringify(h1s()));
  const back = main.querySelector("#ci-back");
  ok(`${tier}: a way back, named ‹ Back`, !!back && txt(back) === "‹ Back", txt(back) || "(none)");
  click(back);
  ok(`${tier}: Back goes where they came from`, navs.join() === "today", JSON.stringify(navs));
  ok(`${tier}: and leaves nothing waiting`, store.get("pendingDoorRoute") == null, String(store.get("pendingDoorRoute")));
  try { v?.onUnmount?.(); } catch {}
}

// ── 11b ─────────────────────────────────────────────────────────────────
console.log("\nTEST 11b - Your arc's Back, the Plan");
person("personal");
store.set("arc", { active: true, aimId: null, startedAt: new Date().toISOString(), zonesWorked: {} });
const arcBack = (hist) => {
  router.history = [...hist]; navs = [];
  main.innerHTML = ""; StretchArcView(router).mount(main);
  click(main.querySelector("#sa-back-btn"));
  return navs.join();
};
ok("11b-1. opened from Progress (Change my arc), Back goes to Progress", arcBack(["today", "progress"]) === "progress", JSON.stringify(navs));
ok("11b-2. after changing a part (the arc came back without a new step), still Progress", arcBack(["today", "progress", "stretch-arc"]) === "progress", JSON.stringify(navs));
ok("11b-3. after the arc's own questions as well, still Progress", arcBack(["today", "progress", "stretch-arc", "arc-setup"]) === "progress", JSON.stringify(navs));
ok("11b-4. control: opened from Home, Back goes Home", arcBack(["today"]) === "today", JSON.stringify(navs));
ok("11b-5. control: with nowhere to go back to, Home", arcBack([]) === "today", JSON.stringify(navs));

console.log(`\n${"=".repeat(60)}\nVERIFY-BACK-FIXES: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
