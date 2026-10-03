/**
 * tools/verify-mindful-timer.mjs
 * 03 Oct 2026 v1
 *
 * W5-10 MINDFUL-TIMER (Wave 5 persona trace: 2.11).
 *
 * Mindful awareness: Stop, then *Stay in session*, froze the practice for
 * good (the timer was cleared and nothing started it again). A practice
 * done with the eyes closed gave no cue when it moved on or ended. And the
 * countdown was a live region, so a screen reader spoke every second.
 *
 *   1. The clock runs.
 *   2. Stop, then Stay: it runs again (and Escape is Stay too).
 *   3. The countdown is not a live region; a status line speaks only at a
 *      change and at the end.
 *   4. A cue at the change and at the end: the next part named, and a
 *      vibration (which the Vibration switch governs, W4-22).
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
const RF = await import(B + "data/red-flag.js");
const SB = await import(B + "session-builder.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s);
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

// Intervals by hand, so five minutes take no time.
const live = new Map(); let nextId = 1;
const fakeSet = (fn) => { const id = nextId++; live.set(id, fn); return id; };
const fakeClear = (id) => { live.delete(id); };
const tick = (n = 1) => { for (let i = 0; i < n; i++) for (const fn of [...live.values()]) fn(); };
let buzzes = 0;
Object.defineProperty(dom.window.navigator, "vibrate", { value: () => { buzzes++; return true; }, configurable: true, writable: true });

const Q = await import(B + "views/quiet-session.js");
function fixture() {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Pat"); store.set("tier", "free");
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  store.set("quietMode", "mindful");
}
const clock = () => txt(main.querySelector("#quiet-mindful-time"));

fixture();
main.innerHTML = Q.render(); Q.onMount();
click(main.querySelector('.quiet-duration-btn[data-duration="5"]'));
const realSet = globalThis.setInterval, realClear = globalThis.clearInterval;
globalThis.setInterval = fakeSet; globalThis.clearInterval = fakeClear;
dom.window.setInterval = fakeSet; dom.window.clearInterval = fakeClear;
click(main.querySelector("#quiet-mindful-start-btn")); await wait(10);

// ── 1. THE CLOCK RUNS ───────────────────────────────────────────────────
console.log("\nTEST 1 - the clock runs");
ok("1pc. the practice started at 5:00", /^5:00$/.test(clock()), clock());
tick(1);
ok("1a. a second on: 4:59", clock() === "4:59", clock());

// ── 2. STOP, THEN STAY ──────────────────────────────────────────────────
console.log("\nTEST 2 - Stop, then Stay in session");
click(main.querySelector("#quiet-mindful-stop-btn")); await wait(10);
ok("2pc. the card is up and the clock paused", !!document.getElementById("sg-stay-btn") && (tick(3), clock() === "4:59"), clock());
click(document.getElementById("sg-stay-btn")); await wait(10);
tick(1);
ok("2a. Stay: the clock runs again", clock() === "4:58", clock());
click(main.querySelector("#quiet-mindful-stop-btn")); await wait(10);
document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape" })); await wait(10);
tick(1);
ok("2b. Escape is Stay too", clock() === "4:57" && !document.getElementById("sg-stay-btn"), clock());

// ── 3. NOT EVERY SECOND ─────────────────────────────────────────────────
console.log("\nTEST 3 - nothing spoken every second");
const ticking = main.querySelector("#quiet-mindful-time");
const liveAncestor = ticking?.closest("[aria-live], [role=status], [role=alert], [role=timer]");
ok("3a. the countdown is not inside a live region", !!ticking && !liveAncestor, liveAncestor?.outerHTML?.slice(0, 120));
ok("3b. a status line for changes", !!main.querySelector("#quiet-mindful-cue[role=status]"));

// ── 4. CUES ─────────────────────────────────────────────────────────────
console.log("\nTEST 4 - a cue at the change and at the end");
buzzes = 0;
tick(180 - 3);
ok("4a. at the change: the next part named, and a vibration", /Short Body Scan/.test(txt(main.querySelector("#quiet-mindful-cue"))) && buzzes >= 1, `${buzzes} | ${txt(main.querySelector("#quiet-mindful-cue"))}`);
const before = buzzes;
tick(120);
ok("4b. at the end: a vibration, and it says so", buzzes > before && /end|done|finished|complete/i.test(txt(main)), `${buzzes} | ${txt(main).slice(0, 160)}`);

globalThis.setInterval = realSet; globalThis.clearInterval = realClear;
console.log("");
if (fails) { console.log(`MINDFUL-TIMER: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`MINDFUL-TIMER: all ${passes} assertions pass\n`);
process.exit(0);
