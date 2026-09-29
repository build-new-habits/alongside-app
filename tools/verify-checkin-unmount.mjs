/**
 * tools/verify-checkin-unmount.mjs
 * 29 Sep 2026 v4
 *
 * v4 - My v3 fault, found by a fresh-clone run under load. Tests 1 and 2
 *   counted lines in the check-in's OWN container after leaving -- a
 *   container the stubbed router never clears, though the real one does
 *   as the next screen mounts. A line already in flight landed there:
 *   invisible to anybody, red here. They now do what test 3 does: put the
 *   next screen in the container, and assert it stays alone.
 *
 * v3 - P14. The variety question was the last panel the check-in built on
 *   document.body, and it is gone: every answer is inline. The fault this
 *   gate measures -- something of the check-in outliving it -- now has
 *   one remaining shape: a coach line or answer scheduled before leaving
 *   and painted after. So the fixture leaves MID-QUESTION (the mood
 *   question on its way), and the gate asserts that nothing is left on
 *   the page outside the view, and nothing the check-in scheduled lands
 *   after the person has left. TEST 4's reversal is now the positive
 *   control: staying, the check-in does carry on to its next question.
 *   TEST 5 adds leaving and coming straight back: one conversation, not
 *   two interleaved (each CheckinView keeps its own state).
 *   Reversal note: with no panels left, un-setting _alive in onUnmount is
 *   no longer visible on the page -- a late line goes to the detached
 *   thread of a view the router has already replaced. TEST 1-3 hold the
 *   page; they are not a proof of _alive itself.
 *
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

// Everything on the page outside #app: where a leftover would sit.
const outside = () => [...document.body.children].filter(n => n.id !== "app").length;
const BASE_OUTSIDE = outside();

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
  // One answer; the next question is on its way (timers pending).
  return tapLabel(/^Okay$/);
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the fixture is mid-question, with the next one scheduled");
const answered = await startCheckin();
ok("0a. the first question was answered in the check-in", answered);

// ── 1. LEAVING BY THE HOUSE BUTTON ──────────────────────────────────────
console.log("\nTEST 1 - leave mid-question for Home");
await router.navigate("today");
// What the router does as the next screen mounts (stubbed above).
const nextScreen = () => { const a = document.getElementById("app"); a.innerHTML = "<p id='next-stand-in'>Next</p>"; };
const alone = () => { const a = document.getElementById("app"); return a.children.length === 1 && !!a.querySelector("#next-stand-in"); };
nextScreen();
await wait(2500);
ok("1a. nothing is left on the page outside the view", leftovers() === 0 && outside() === BASE_OUTSIDE,
   `${leftovers()} panel/overlay, ${outside() - BASE_OUTSIDE} extra node(s) on document.body`);
ok("1b. nothing the check-in scheduled lands on the next screen", alone(), document.getElementById("app").innerHTML.slice(0, 160));

// ── 2. EVERY OTHER WAY OUT ──────────────────────────────────────────────
console.log("\nTEST 2 - every other way out");
for (const dest of ["progress", "noticing", "settings", "coach-proposal", "session-builder"]) {
  await startCheckin();
  await router.navigate(dest);
  nextScreen();
  await wait(1500);
  ok(`2. leaving for ${dest} leaves nothing behind`, leftovers() === 0 && outside() === BASE_OUTSIDE && alone());
}

// ── 3. NOTHING OPENS LATER ──────────────────────────────────────────────
console.log("\nTEST 3 - a line scheduled before leaving never appears after");
localStorage.clear(); store.init(); store.set("onboardingComplete", true); store.set("name", "Test");
{
  const app = document.getElementById("app"); app.innerHTML = "";
  const view = CheckinView({ navigate: v => router.navigate(v), back() {} });
  router.viewCache = { checkin: view }; router.currentView = "checkin";
  view.mount(app);
  await router.navigate("today");           // leave immediately, timers still pending
  // What the router does as the next screen mounts (the mount itself is
  // stubbed above): the container is emptied. A late line written to the
  // check-in's detached thread is then written nowhere a person can see.
  app.innerHTML = "<p id='home-stand-in'>Home</p>";
  await wait(3000);
  ok("3a. nothing appears on the next screen from a timer set before leaving",
     leftovers() === 0 && outside() === BASE_OUTSIDE && app.children.length === 1 && !!app.querySelector("#home-stand-in"),
     app.innerHTML.slice(0, 160));
}

// ── 4. POSITIVE CONTROL ─────────────────────────────────────────────────
console.log("\nTEST 4 - control: staying, the check-in carries on");
await startCheckin();
ok("4a. while the check-in is open, its next question arrives", await tapLabel(/^Okay$/),
   "if staying does not reach the next question, TEST 1-3 measure nothing");

// ── 5. LEAVE AND COME STRAIGHT BACK ─────────────────────────────────────
console.log("\nTEST 5 - leave mid-opening and come straight back: one conversation");
{
  localStorage.clear(); store.init(); store.set("onboardingComplete", true); store.set("name", "Test");
  const app = document.getElementById("app"); app.innerHTML = "";
  const v1 = CheckinView({ navigate() {}, back() {} }); v1.mount(app);
  await wait(400); v1.onUnmount(); app.innerHTML = "";
  const v2 = CheckinView({ navigate() {}, back() {} }); v2.mount(app);
  await waitFor(() => app.querySelector(".ci-chips"), 9000); await wait(1500);
  const lines = [...app.querySelectorAll(".ci-bubble--coach")].map(b => b.textContent.trim());
  ok("5a. the energy question is asked once, with one row of answers",
     lines.filter(t => /energy today/.test(t)).length === 1 && app.querySelectorAll(".ci-chips").length === 1, JSON.stringify(lines));
  ok("5b. no opening line is said twice", new Set(lines).size === lines.length, JSON.stringify(lines));
}

console.log("");
if (fails) { console.log(`CHECKIN-UNMOUNT: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`CHECKIN-UNMOUNT: all ${passes} assertions pass\n`);
process.exit(0);
