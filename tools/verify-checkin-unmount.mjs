/**
 * tools/verify-checkin-unmount.mjs
 * 28 Sep 2026 v2
 *
 * v2 - SMOOTH-P1. The three questions are now answered inline, so the
 *   only panel the check-in still builds on document.body is the FREE
 *   drop-in question ("like last time, or something different?"). The
 *   fixture now reaches that panel: a free user, on the way to a session
 *   door, with recent exercise history. Every assertion is unchanged.
 *
 * SMOOTH-P0 F2, STALE-CHECKIN. Leaving a check-in leaves nothing behind.
 *
 * Found tracing the Plan route on 27 Sep: start a check-in, press the
 * house button mid-question, and the energy question stays open over
 * Home -- and over every screen after it. It covered Quick build's
 * "Build it" button: measured with elementFromPoint, the overlay was the
 * element under the button's centre.
 *
 * checkin.js builds its question panels on document.body, outside the
 * view's container, so the router wiping the container on navigation
 * never touches them. It had no onUnmount. A panel scheduled by a
 * pending timer could also open AFTER the person had left.
 *
 * Driven through the real CheckinView and the real router's onUnmount
 * call, by the route the trace used (the house button goes to Home).
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({ matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0)],
                      ["cancelAnimationFrame", (id) => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { CheckinView } = await import(B + "views/checkin.js");
const { router } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const leftovers = () => document.querySelectorAll(".ci-panel, .ci-overlay").length;

async function waitFor(fn, ms = 4000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (fn()) return true; await wait(20); }
  return false;
}

// Mount the real view in the real router's cache, so router.navigate()
// runs the real onUnmount path when the person leaves.
const tapLabel = async re => {
  const find = () => [...document.querySelectorAll("#app button")].find(x => re.test(x.textContent.trim()));
  await waitFor(find);
  const b = find();
  if (b) { b.click(); await wait(30); }
  return !!b;
};

async function startCheckin() {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", "free");
  store.set("pendingDoorRoute", "coach-proposal");
  store.recordExercises(["goblet-squat"]);
  document.querySelectorAll(".ci-panel, .ci-overlay").forEach(n => n.remove());
  const app = document.getElementById("app"); app.innerHTML = "";
  const view = CheckinView({ navigate: v => router.navigate(v), back() {} });
  router.viewCache = { checkin: view };
  router.currentView = "checkin";
  router.history = [];
  router._mountView = async () => {};           // the destination's mount is not under test
  view.mount(app);
  // Three answers, then the free drop-in question opens as a panel.
  await tapLabel(/^Okay$/); await tapLabel(/^Okay$/); await tapLabel(/^Nothing today$/);
  return waitFor(() => document.querySelector(".ci-panel"));
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the fixture reaches an open question panel");
const opened = await startCheckin();
ok("0a. a question panel is open on document.body", opened && leftovers() > 0,
   "if no panel opens, nothing below measures the fault");

// ── 1. LEAVING BY THE HOUSE BUTTON ──────────────────────────────────────
console.log("\nTEST 1 - leave mid-question for Home");
await router.navigate("today");
await wait(500);
ok("1a. no question panel or overlay is left on the page", leftovers() === 0,
   `${leftovers()} panel/overlay element(s) still on document.body after leaving`);

// ── 2. EVERY OTHER WAY OUT ──────────────────────────────────────────────
console.log("\nTEST 2 - every other way out");
for (const dest of ["progress", "noticing", "settings", "coach-proposal", "session-builder"]) {
  await startCheckin();
  await router.navigate(dest);
  await wait(500);
  ok(`2. leaving for ${dest} leaves nothing behind`, leftovers() === 0);
}

// ── 3. NOTHING OPENS LATER ──────────────────────────────────────────────
console.log("\nTEST 3 - a panel scheduled before leaving never opens after");
localStorage.clear(); store.init(); store.set("onboardingComplete", true); store.set("name", "Test");
document.querySelectorAll(".ci-panel, .ci-overlay").forEach(n => n.remove());
{
  const app = document.getElementById("app"); app.innerHTML = "";
  const view = CheckinView({ navigate: v => router.navigate(v), back() {} });
  router.viewCache = { checkin: view }; router.currentView = "checkin";
  view.mount(app);
  await router.navigate("today");           // leave immediately, timers still pending
  await wait(3000);
  ok("3a. no panel appears on Home from a timer set before leaving", leftovers() === 0);
}

// ── 4. REVERSAL ─────────────────────────────────────────────────────────
console.log("\nTEST 4 - reversal: staying on the check-in keeps its panel");
await startCheckin();
await wait(300);
ok("4a. while the check-in is open, its panel is there", leftovers() > 0,
   "the fix must not remove panels from a check-in that is still running");

console.log("");
if (fails) { console.log(`CHECKIN-UNMOUNT: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`CHECKIN-UNMOUNT: all ${passes} assertions pass\n`);
process.exit(0);
