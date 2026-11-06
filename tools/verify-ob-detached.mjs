/**
 * tools/verify-ob-detached.mjs
 * 06 Nov 2026 v1
 *
 * P-28 FINISH. A fault found by chromium-p28's harness (both tiers): the
 * getting-started thread draws its next step on a timer, and when the
 * thread had been left before the step was due, drawing it into a page
 * that had gone threw "Cannot read properties of null (reading
 * 'appendChild')" (onboarding/thread.js, _showTextInput). Real timings
 * here (reduced motion off), because the fault is a timing.
 *
 *   0  Positive control: left alone, the thread reaches the name box.
 *   1  Left before that step is due: nothing throws, and nothing is drawn
 *      into the page that replaced it.
 *
 * Red on alongside-v710 (the TypeError).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/", pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.HTMLElement.prototype.focus = function () {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.requestAnimationFrame = cb => setTimeout(cb, 0);

const errors = [];
process.on("uncaughtException", e => errors.push(String(e && e.message)));
process.on("unhandledRejection", e => errors.push(String(e && e.message)));

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
router.navigate = () => {};
const { ThreadView } = await import(B + "views/onboarding/thread.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 8000) { for (let t = 0; t < ms; t += 50) { if (fn()) return true; await wait(50); } return false; }
// Agreed already (the age and consent screens done), so the conversation starts at once.
function fresh() { localStorage.clear(); store.init(); agreed(store); const m = document.getElementById("main-content"); m.innerHTML = ""; return m; }

console.log("\nTEST 0 - positive control");
{
  const main = fresh();
  ThreadView(router).mount(main);
  const reached = await until(() => !!main.querySelector(".ob-input-bar__field"));
  ok("0a. left alone, the thread reaches the name box", reached, (main.textContent || "").slice(0, 80));
  ok("0b. without an error", errors.length === 0, errors.join(" | "));
}

console.log("\nTEST 1 - left before the next step is due");
{
  errors.length = 0;
  const main = fresh();
  ThreadView(router).mount(main);
  await wait(30);
  // Somebody goes elsewhere: the router draws the next screen into the same
  // element (container.innerHTML), so the thread is gone from it.
  main.innerHTML = "<h1>Today</h1>";
  const next = main;
  await wait(6000);
  ok("1a. nothing throws when the step comes due", errors.length === 0, errors.join(" | "));
  ok("1b. nothing is drawn into the page that replaced it", !next.querySelector(".ob-input-bar, .ob-thread"), next.innerHTML.slice(0, 120));
}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
