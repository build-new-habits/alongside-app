/**
 * tools/verify-free-builder.mjs
 * 29 Sep 2026 v1
 *
 * P3, FREE-BUILDER-UPGRADE (persona finding W2-3). A Free user with no
 * programme -- anybody who tapped "Decide later" at onboarding -- built a
 * session, pressed Let's go, and landed on the upgrade page. Back went to
 * the session screen, which sent them to the upgrade page again: a loop.
 *
 * gym-programme.js turned away every Free user without a programme, even
 * when what they were starting was a session they had built or saved
 * themselves. And its redirect stayed in the back stack, so Back re-entered
 * it and was redirected again.
 *
 * Drives the real router, the real builder and the real session screen:
 *   1. Free + no programme: build -> Let's go -> the first exercise.
 *   (Saved sessions are Plan-only -- the tier table -- so that door is
 *    covered on the Plan by verify-own-list.)
 *   3. Free, reaching the programme screen with nothing of their own to
 *      play: the upgrade page, and Back leaves it -- no loop.
 *   4. The Plan is unchanged (control).
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
async function go(view) { await router.navigate(view); await wait(40); }

async function buildAndGo() {
  await go("today");
  await go("session-builder");
  // The builder keeps its own place between visits; start from the picker.
  if (!$$(".sb-type-tile").length) { click($("#sb-rebuild-btn")); await wait(200); }
  click($$(".sb-type-tile").find(b => b.dataset.type === "full"));
  click($("#sb-location-continue-btn"));
  click($$(".sb-duration-btn").find(b => b.dataset.mins === "30"));
  click($("#sb-build-btn"));
  click($$(".sb-buildmode-btn").find(b => b.dataset.mode === "coach"));
  await wait(1400);
  const reached = !!$("#sb-go-btn");
  const first = store.get("generatedSession")?.session?.exercises?.[0]?.name;
  click($("#sb-go-btn")); await wait(300);
  return { reached, first };
}

// ── 1. FREE, NO PROGRAMME: WHAT THEY BUILT PLAYS ─────────────────────────
console.log("\nTEST 1 - Free, no programme: Let's go plays the session they built");
fixture("free");
ok("1pc. Free, and no programme (the Decide later state)", store.get("tier") === "free" && !store.hasActiveProgramme());
{
  const r = await buildAndGo();
  ok("1pc2. the builder reached Let's go with a session", r.reached && !!r.first, JSON.stringify(r));
  ok("1a. it lands on the session, not the upgrade page", router.currentView === "gym-programme", router.currentView);
  ok("1b. showing the first exercise of what they built", !!r.first && txt(main).includes(r.first) && !/upgrade|the plan costs|£/i.test(txt(main)), txt(main).slice(0, 160));
}

// ── 3. NOTHING OF THEIR OWN: UPGRADE, AND BACK LEAVES ────────────────────
console.log("\nTEST 3 - Free, nothing of their own to play: the upgrade page, and Back leaves it");
fixture("free");
store.set("generatedSession", null); store.set("usingGeneratedSession", false);
await go("today"); await go("progress"); await go("gym-programme");
ok("3pc. the programme screen still sends them to the upgrade page", router.currentView === "upgrade", router.currentView);
router.back(); await wait(60);
ok("3a. Back goes to where they were, not round again", router.currentView === "progress", `${router.currentView}; history ${JSON.stringify(router.history)}`);
await go("gym-programme");
click($("[data-action='upgrade-back']")); await wait(60);
ok("3b. and the page's own Back button does the same", router.currentView === "progress", router.currentView);

// ── 4. THE PLAN: UNCHANGED ───────────────────────────────────────────────
console.log("\nTEST 4 - the Plan (control)");
fixture("personal");
{
  const r = await buildAndGo();
  ok("4a. Let's go plays the session", router.currentView === "gym-programme" && !!r.first && txt(main).includes(r.first), `${router.currentView}`);
}

console.log("");
if (fails) { console.log(`FREE-BUILDER: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`FREE-BUILDER: all ${passes} assertions pass\n`);
process.exit(0);
