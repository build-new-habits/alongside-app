/**
 * tools/verify-one-home.mjs
 * 17 Oct 2026 v1
 *
 * D662-6 TWO-HOMES (Graeme's device check of v662, 13 Oct; "Can we fix
 * them now?", 17 Oct). The round house button (the escape hatch, shown on
 * every screen without the bottom bar) sat beside the screen's own way
 * home: "‹ Home" on Today's plan, "Back to Home" on the finish, the way
 * back on My exercises. One way home per screen: those three keep their
 * own, and the house is not drawn on them (Today's plan only while its
 * plan, with "‹ Home", is showing; its Bad-day choice has no Home of its
 * own and keeps the house). Everywhere else the house is
 * as it was (a session in progress, the check-in, the Library's players).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(`<!doctype html><body>
  <div id="loading"></div>
  <div id="app"><main id="main-content" tabindex="-1"></main></div>
  <nav id="bottom-nav" class="hidden"><a data-view="today" class="nav-item">Today</a><a data-view="settings" class="nav-item">Settings</a></nav>
  <button id="hidden-nav-home-btn" class="hidden" aria-label="Back to Today"></button>
</body>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "FileReader", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: true, json: async () => ({ messages: [] }), text: async () => "" });

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
await import(B + "app.js");
const { POLICY_VERSION } = await import(B + "data/consent-version.js");


let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
localStorage.clear(); store.init();
store.set("consent.ageConfirmed", true); store.set("consent.ageCheckedAt", new Date().toISOString());
store.set("consent.given", true); store.set("consent.at", new Date().toISOString()); store.set("consent.policyVersion", POLICY_VERSION);
store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", "personal");
store.set("checkinHistory", { [new Date().toISOString().split("T")[0]]: { energy: 6, mood: 6, date: new Date().toDateString() } });
const house = () => !document.getElementById("hidden-nav-home-btn").classList.contains("hidden");
const shown = {};
for (const r of ["coach-proposal", "reflect", "prescribed", "workout", "checkin", "walk-session"]) {
  try { await router._mountView(r); } catch { /* the view's own mount; visibility is set first */ }
  await wait(5);
  shown[r] = house();
}
ok("1a. Today's plan: its own ‹ Home, no house", shown["coach-proposal"] === false);
ok("1b. the finish: its own Back to Home, no house", shown["reflect"] === false);
ok("1c. My exercises: its own way home, no house", shown["prescribed"] === false);
ok("1pc. CONTROL: a session in progress keeps the house", shown["workout"] === true);
ok("1pc2. CONTROL: the check-in keeps the house", shown["checkin"] === true);
ok("1pc3. CONTROL: the walk keeps the house", shown["walk-session"] === true);
// The Bad-day choice on Today's plan has no Home of its own: the house stays.
const RF = await import(B + "data/red-flag.js").catch(() => null);
store.set("conditions", ["lower-back"]); store.set("conditionPainScores", { "lower-back": 8 });
if (RF?.RED_FLAG_VERSION) store.set("redFlag", { screenedAt: new Date().toISOString(), areas: ["lower-back"], textVersion: RF.RED_FLAG_VERSION, level: null, flaggedAt: null, clearedAt: null });
try { await router._mountView("coach-proposal"); } catch {}
await wait(5);
const choice = !!document.querySelector('[data-severe-choice="rest"]');
ok("1pc4. CONTROL: on the Bad-day choice (no ‹ Home there), the house stays", choice && house() === true, `choice ${choice}, house ${house()}`);
console.log(`\nVERIFY-ONE-HOME: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
