/**
 * tools/verify-sheet-close.mjs
 * 29 Sep 2026 v1
 *
 * P1, REDUCED-MOTION-SHEET (persona finding W2-2). With reduced motion on
 * (the phone's setting, or Display › Reduce motion) the bottom sheets
 * never finished closing: sheet-manager.js waited only for `transitionend`,
 * and with the transition removed that event never comes. Onboarding
 * stalled at the goals step; Settings › Equipment and the sore-areas sheet
 * stalled the same way. Confirmed in real Chromium on 28 Sep.
 *
 * jsdom never fires transition events, so it reproduces the stall exactly.
 * This gate drives the real sheet manager, and the real Settings screen
 * that opens it, and asserts that a sheet finishes closing:
 *   1. with no transition (reduced motion) — at once, by every way out;
 *   2. with a transition whose end never arrives — by a fallback;
 *   3. with a transition that ends normally — once, not twice;
 *   4. when a new sheet opens while the old one is still closing — the new
 *      one is not emptied and its callback is not fired by the old close.
 * The real-browser check under both motion settings is
 * tools/chromium-sheets.mjs (needs Chromium; not part of the suite).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/", pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob", "HTMLInputElement"])
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
dom.window.alert = () => {}; globalThis.alert = () => {};

// Transition length the panel reports. "0s" is what reduced motion gives.
let PANEL_TRANSITION = "0s";
const realGCS = dom.window.getComputedStyle.bind(dom.window);
const gcs = (el, ...a) => {
  const s = realGCS(el, ...a);
  if (el?.classList?.contains("sheet-panel")) {
    return new Proxy(s, { get: (t, p) => (p === "transitionDuration" ? PANEL_TRANSITION : p === "transitionDelay" ? "0s" : (typeof t[p] === "function" ? t[p].bind(t) : t[p])) });
  }
  return s;
};
dom.window.getComputedStyle = gcs; globalThis.getComputedStyle = gcs;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const SM = await import(B + "views/onboarding/sheet-manager.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
const key = k => document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: k, bubbles: true }));
const panel = () => document.querySelector(".sheet-panel");
const overlay = () => document.querySelector(".sheet-overlay");
const content = () => document.querySelector(".sheet-content");
const rtr = { navigate() {}, back() {}, history: [] }; globalThis.window.router = rtr; globalThis.router = rtr;

function fixture() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", "personal");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
}
fixture();

async function openAndWait(view, cb, trigger) {
  const p = SM.openSheet(view, cb, trigger);
  await p; await wait(20);
}

// ── 1. REDUCED MOTION: NO TRANSITION ───────────────────────────────────
console.log("\nTEST 1 - reduced motion: a sheet finishes closing at once, by every way out");
PANEL_TRANSITION = "0s";
for (const [how, act] of [["tap outside", () => click(overlay())], ["Escape", () => key("Escape")], ["closeSheet()", () => SM.closeSheet(true)]]) {
  const trigger = document.createElement("button"); trigger.textContent = "open"; main.appendChild(trigger);
  const calls = [];
  await openAndWait("onboarding/conditions", r => calls.push(r), trigger);
  const opened = panel()?.classList.contains("is-open") && content().children.length > 0;
  act(); await wait(30);
  ok(`1pc-${how}. the sheet opened with the real view in it`, opened);
  ok(`1a-${how}. the callback fired once, with the result`, calls.length === 1 && calls[0]?.skipped === true, JSON.stringify(calls));
  ok(`1b-${how}. the sheet emptied and focus went back to the button`, content().innerHTML === "" && document.activeElement === trigger);
  trigger.remove();
}

// ── 2. A TRANSITION THAT NEVER ENDS ─────────────────────────────────────
console.log("\nTEST 2 - a transition whose end never arrives still finishes");
PANEL_TRANSITION = "0.3s";
{
  const calls = [];
  await openAndWait("onboarding/conditions", r => calls.push(r));
  SM.closeSheet(true); await wait(40);
  ok("2rv. not finished before the transition could have ended (it does wait)", calls.length === 0);
  await wait(600);
  ok("2a. finished by the fallback, once", calls.length === 1 && content().innerHTML === "", JSON.stringify(calls));
}

// ── 3. A TRANSITION THAT ENDS NORMALLY ──────────────────────────────────
console.log("\nTEST 3 - a normal close finishes once, not twice");
{
  const calls = [];
  await openAndWait("onboarding/conditions", r => calls.push(r));
  SM.closeSheet(true); await wait(20);
  // One event per transitioned property (transform, then opacity), as a
  // real browser sends them.
  panel().dispatchEvent(new dom.window.Event("transitionend", { bubbles: true }));
  panel().dispatchEvent(new dom.window.Event("transitionend", { bubbles: true }));
  await wait(10);
  ok("3a. finished on transitionend", calls.length === 1);
  await wait(600);
  ok("3b. the fallback did not fire it a second time", calls.length === 1, `${calls.length} calls`);
}

// ── 4. REOPENED WHILE CLOSING ───────────────────────────────────────────
console.log("\nTEST 4 - a sheet opened while the last is closing is left alone");
{
  const a = [], b = [];
  await openAndWait("onboarding/conditions", r => a.push(r));
  SM.closeSheet(true);
  await openAndWait("onboarding/equipment", r => b.push(r));
  const bContent = content().innerHTML.length;
  await wait(600);
  ok("4a. the first sheet's callback fired once", a.length === 1, JSON.stringify(a));
  ok("4b. the new sheet was not emptied or answered by the old close", bContent > 0 && content().innerHTML.length > 0 && b.length === 0 && panel().classList.contains("is-open"),
     `content ${content().innerHTML.length}, b ${JSON.stringify(b)}`);
  PANEL_TRANSITION = "0s"; SM.closeSheet(true); await wait(30);
}

// ── 5. THE LIVE CALLER: SETTINGS ────────────────────────────────────────
console.log("\nTEST 5 - Settings › Equipment, as a person uses it, with reduced motion");
PANEL_TRANSITION = "0s";
{
  fixture();
  const { SettingsView } = await import(B + "views/settings.js");
  main.innerHTML = ""; SettingsView(rtr).mount(main); await wait(20);
  click(main.querySelector('[data-open="equipment"]')); await wait(20);
  const row = main.querySelector('[data-action="edit-equipment"]');
  ok("5pc. Settings shows the equipment row", !!row);
  click(row); await wait(60);
  const opened = panel()?.classList.contains("is-open") && content().children.length > 0;
  ok("5a. it opens the sheet", opened);
  main.innerHTML = "<p id='stale'>stale</p>";
  key("Escape"); await wait(40);
  ok("5b. closing hands back to Settings, which draws itself again", !panel().classList.contains("is-open") && content().innerHTML === "" && !main.querySelector("#stale") && /Equipment/.test(main.textContent));
}

console.log("");
if (fails) { console.log(`SHEET-CLOSE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SHEET-CLOSE: all ${passes} assertions pass\n`);
process.exit(0);
