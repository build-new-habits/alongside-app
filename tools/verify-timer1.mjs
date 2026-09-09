/**
 * tools/verify-timer1.mjs
 * 08 Sep 2026 v1
 *
 * TIMER-1. The one automatic move in a session says so.
 *
 * WHAT SHIPPED. The countdown reaching zero moves the person from the DO
 * page to the NOTE page. CARD-3 calls it "the one automatic forward move;
 * every other transition is a tap" -- and it announced nothing. Focus did
 * not move. The live regions on the page it lands on were both empty. The
 * only signal was `navigator.vibrate`, which Safari on iOS does not
 * implement at all, so on an iPhone there was no signal of any kind.
 *
 * It changes the screen under somebody who, mid-exercise, is by
 * definition not looking at it. That is the whole point of a timer.
 *
 * WCAG 2.2 AA 4.1.3 Status Messages: a change of content that tells the
 * person something, given no focus and carrying no role, cannot be
 * presented by assistive technology.
 *
 * BOTH BRANCHES, AND THE POINT IS THE SECOND ONE. Test 2 asserts that
 * somebody who taps "Done" is NOT announced at. They already know the
 * exercise is over; a status message there is noise, and a live region
 * that fires when nothing surprising happened trains people to ignore it.
 * A fix that announced on every arrival at the note page would pass test
 * 1 and be worse than the defect.
 *
 * THE COUNTDOWN IS DRIVEN BY HAND. setInterval is replaced before
 * workout.js is imported and the callback is ticked directly. The
 * interval is module-private, so holding the callback is also the only
 * honest way to ask test 3's question: is it still running after the
 * person has left?
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({
  matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
});
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
for (const [k, v] of [
  ["requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0)],
  ["cancelAnimationFrame",  (id) => clearTimeout(id)]
]) {
  dom.window[k] = v;
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

// Hold the interval callback rather than waiting on a real clock.
const liveIntervals = new Map();
let _nextId = 1;
globalThis.setInterval  = (fn) => { const id = _nextId++; liveIntervals.set(id, fn); return id; };
globalThis.clearInterval = (id) => { liveIntervals.delete(id); };
const tick = (n = 1) => {
  for (let i = 0; i < n; i++) for (const fn of [...liveIntervals.values()]) fn();
};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const sb        = await import(B + "session-builder.js");
const workout   = await import(B + "views/workout.js");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const main = document.getElementById("main-content");
function paint() {
  main.innerHTML = workout.render();
  try { workout.onMount(); } catch { /* onMount touches APIs jsdom lacks */ }
}
const _router = { navigate: () => paint() };
globalThis.window.router = _router;
Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });

const T = () => (main.textContent || "").replace(/\s+/g, " ").trim();
const tap = (sel) => {
  const el = main.querySelector(sel);
  if (!el) return false;
  el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  return true;
};

/** Live regions with actual content in them. An empty one announces nothing. */
const spokenRegions = () =>
  [...main.querySelectorAll('[role="status"], [role="alert"], [aria-live]')]
    .map(e => (e.textContent || "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

function freshSession() {
  // Exit any session still open FIRST. This view keeps its page, its
  // timer and its notice in module state, and the app clears them through
  // cleanupWorkout() on exit -- so a fixture that only re-paints is
  // testing a state no person can be in. Two assertions here failed on
  // exactly that, and one of them was a real leak: cleanupWorkout() did
  // not clear the new notice flag.
  if (main.querySelector("#exit-workout-btn")) {
    tap("#exit-workout-btn");
    document.querySelector("#exit-confirm-discard")
      ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  }
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("homeEquipment", ["dumbbells", "resistance-band"]);
  const built = sb.buildSession({
    sessionType: "glute", durationMins: 30, equipmentOverride: null, preset: null
  });
  store.set("generatedSession", { session: built, builtAt: new Date().toISOString(), inputs: {} });
  store.set("usingGeneratedSession", true);
  store.set("activeSession", built);
  liveIntervals.clear();
  paint();
  return built;
}

// ── 1. THE AUTOMATIC MOVE ANNOUNCES ITSELF ──────────────────────────────
console.log("\nTEST 1 - the countdown running out is announced");

const built = freshSession();
ok("1pc. positive control: the session mounted on an exercise",
   /1 of/.test(T()) && !!main.querySelector("#wo-begin-btn"),
   `screen reads: ${T().slice(0, 120)}`);

tap("#wo-begin-btn");
ok("1a. and reaches the DO page with a timer",
   !!main.querySelector("#timer-toggle-btn"),
   "no timer on this exercise - the fixture must use one that has a duration");

tap("#timer-toggle-btn");
ok("1b. starting it registers a countdown", liveIntervals.size === 1,
   `${liveIntervals.size} intervals running`);

tick(1200);   // longer than any single exercise
ok("1c. running out moves the person to the NOTE page",
   !!main.querySelector("#complete-exercise-btn"),
   `landed on: ${T().slice(0, 120)}`);

const spoken = spokenRegions();
ok("1d. AND A STATUS MESSAGE SAYS SO",
   spoken.some(t => /time up/i.test(t)),
   "the screen changed under someone mid-exercise with nothing announced. " +
   "Focus does not move, and navigator.vibrate -- the only other signal -- " +
   "is not implemented by Safari on iOS, so on an iPhone there is none. " +
   `live regions with content: ${JSON.stringify(spoken)}`);

const notice = [...main.querySelectorAll('[role="status"]')]
  .find(e => /time up/i.test(e.textContent || ""));
ok("1e. carried by a role assistive tech can present",
   !!notice, "the words are on screen but in nothing that will be announced");
ok("1f. and it is visible, not screen-reader-only",
   !!notice && !notice.classList.contains("sr-only") &&
   !notice.classList.contains("hidden"),
   "a message only screen readers get is half a fix - the person who put " +
   "the phone on the mat gets nothing either");

// ── 2. THE MANUAL MOVE DOES NOT ────────────────────────────────────────
console.log("\nTEST 2 - tapping Done is not announced at");

freshSession();
tap("#wo-begin-btn");
tap("#wo-done-btn");
ok("2pc. positive control: Done reaches the same NOTE page",
   !!main.querySelector("#complete-exercise-btn"),
   `landed on: ${T().slice(0, 120)}`);
ok("2a. and says nothing about time being up",
   !spokenRegions().some(t => /time up/i.test(t)),
   "somebody who tapped Done already knows the exercise is over. A live " +
   "region that fires when nothing surprising happened trains people to " +
   "ignore it, so announcing on EVERY arrival is worse than the defect");

// ── 3. NOTHING KEEPS TICKING AFTER THEY LEAVE ───────────────────────────
console.log("\nTEST 3 - leaving mid-countdown stops the clock");

freshSession();
tap("#wo-begin-btn");
tap("#timer-toggle-btn");
ok("3pc. positive control: a countdown is running to be stopped",
   liveIntervals.size === 1);

tap("#exit-workout-btn");
const discard = document.querySelector("#exit-confirm-discard");
ok("3a. the exit sheet offers a way out", !!discard);
if (discard) discard.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

ok("3b. and the countdown is cleared", liveIntervals.size === 0,
   "the interval survives the exit - it would reach zero later and " +
   "navigate the person back into a session they left");

// ── 4. A NEW EXERCISE INHERITS NOTHING ──────────────────────────────────
console.log("\nTEST 4 - the notice does not follow the person to the next exercise");

freshSession();
tap("#wo-begin-btn");
tap("#timer-toggle-btn");
tick(1200);
ok("4pc. positive control: the notice is showing before we move on",
   spokenRegions().some(t => /time up/i.test(t)));
tap("#complete-exercise-btn");
ok("4a. the next exercise starts clean",
   !spokenRegions().some(t => /time up/i.test(t)),
   "the notice carried over to an exercise whose timer has not run");

console.log(fails === 0
  ? "\nTIMER-1: all assertions pass\n"
  : `\nTIMER-1: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
