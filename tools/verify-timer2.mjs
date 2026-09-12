/**
 * tools/verify-timer2.mjs
 * 12 Sep 2026 v1
 *
 * TIMER-2. The clock belongs to the exercise, not to lifting.
 *
 * NAMED TIMER-2 BECAUSE TIMER-1 IS TAKEN. The build plan called this
 * session TIMER-1; tools/verify-timer1.mjs has existed since 08 Sep and
 * covers something else entirely (the countdown's automatic move to NOTE
 * announcing itself). Renamed here rather than in the plan's favour, and
 * the schedule is corrected to match.
 *
 * ── WHAT WAS WRONG, AS GRAEME MET IT ────────────────────────────────
 *
 * Lat Pulldown, in a real gym session on v496: three sets of ten, and a
 * four-minute countdown labelled "Set 1 of 3". He started it thinking it
 * timed one set. Nothing ever advanced that label -- there is no set two.
 * When it reached zero the card moved to the reflection page, and he had
 * to navigate back to do sets two and three.
 *
 * resolveTiming() returned `duration` whenever it existed and never looked
 * at `reps`. gym-lat-pulldown carries duration 240 AND sets 3, reps "10",
 * so the reps branch of renderExerciseTarget() -- the one showing
 * sets x reps and rest -- was unreachable for it. He never saw "10 reps".
 *
 * ── GRAEME'S DECISION, 12 Sep ───────────────────────────────────────
 *
 * `duration` exists so the COACH can estimate how long a session takes.
 * It was never how long to lift for. The card ignores it on a counted
 * exercise; the builder goes on using it exactly as before. Test 5 holds
 * that second half: session length estimates must not move.
 *
 * ── WHY THE DATA ALREADY ANSWERS THIS ───────────────────────────────
 *
 * `reps` says which kind of exercise it is, on the live library:
 *   440 entries have no reps            -> clock from duration, unchanged
 *    86 are counted reps ("10")         -> NO clock
 *    31 are a time per set ("30 sec")   -> clock from the REPS, not duration
 *     3 are a distance ("20 metres")    -> no clock
 * Nothing new had to be authored.
 *
 * ── FIXTURES ARE REAL ENTRIES, AND PROVEN TO BE ─────────────────────
 *
 * Every case below asserts the shape of its fixture in the library FIRST.
 * A synthetic object would pass these tests against data that no longer
 * exists; test 0 is what stops that.
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM('<!doctype html><body></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const fs = await import("node:fs");
const { EXERCISES } = await import("../js/data/exercises/index.js");
const { resolveTiming, classifyReps } = await import("../js/exercise-timing.js");
const byId = id => EXERCISES.find(e => e.id === id);

console.log("\nTIMER-2 — the clock belongs to the exercise, not to lifting\n");

console.log("TEST 0 — the fixtures are the entries these tests claim");

const LAT   = byId("gym-lat-pulldown");
const SIDE  = byId("side-plank-full");
const SLED  = byId("gym-sled-push");
const TREAD = byId("gym-treadmill-intervals");
const PLANK = byId("plank");

ok("0a. gym-lat-pulldown: a duration AND counted sets and reps",
   !!LAT && LAT.duration > 0 && LAT.sets > 1 && /^\d+$/.test(String(LAT.reps).trim()),
   LAT && `duration ${LAT.duration}, sets ${LAT.sets}, reps ${JSON.stringify(LAT.reps)}`);
ok("0b. side-plank-full: reps are a time PER SET, shorter than its duration",
   !!SIDE && /second/i.test(String(SIDE.reps)) && SIDE.duration > 20,
   SIDE && `duration ${SIDE.duration}, reps ${JSON.stringify(SIDE.reps)}`);
ok("0c. gym-sled-push: reps are a distance", !!SLED && /metre/i.test(String(SLED.reps)));
ok("0d. gym-treadmill-intervals: reps are an interval prescription, not one clock",
   !!TREAD && /hard/i.test(String(TREAD.reps)));
ok("0e. plank: sets, no reps — the case that must NOT change",
   !!PLANK && !PLANK.reps && PLANK.duration > 0);

console.log("\nTEST 1 — classifyReps reads the four shapes");

const cases = [
  ["10", "counted"], ["12", "counted"], ["each side", "counted"],
  ["10 each side", "counted"], ["5 segments", "counted"],
  ["30 seconds", "timed"], ["45 seconds each side", "timed"], ["2 minutes", "timed"],
  ["20 seconds each side", "timed"], ["30s", "timed"],
  ["20 metres", "distance"], ["30 metres each side", "distance"],
  ["1 minute hard, 90 seconds easy", "interval"],
  ["45 seconds fast, 75 seconds easy", "interval"],
  ["", null], [null, null], [undefined, null]
];
const bad = [];
for (const [input, want] of cases) {
  const got = classifyReps(input);
  if (got !== want) bad.push(`${JSON.stringify(input)} -> ${got}, wanted ${want}`);
}
ok("1a. every shape classified correctly" + (bad.length ? "  [" + bad.join("; ") + "]" : ""), bad.length === 0);
ok("1b. metres are not minutes", classifyReps("30 metres") === "distance");

console.log("\nTEST 2 — the counted exercise loses its clock");

const lat = resolveTiming(LAT);
ok("2a. gym-lat-pulldown gets no clock", lat.seconds === null, `got ${lat.seconds} from ${lat.source}`);
ok("2b. and says why, so a view can render sets instead", lat.shape === "counted", `shape ${lat.shape}`);

const latAsPrescribed = resolveTiming(LAT, LAT.reps);
ok("2c. same answer when reps are passed as the prescription, as two other views do",
   latAsPrescribed.seconds === null && latAsPrescribed.shape === "counted",
   `got ${latAsPrescribed.seconds}/${latAsPrescribed.shape}`);

ok("2d. distance gets no clock", resolveTiming(SLED).seconds === null);
ok("2e. an interval prescription produces NO number rather than a wrong one",
   resolveTiming(TREAD).seconds === null, `got ${resolveTiming(TREAD).seconds}`);

console.log("\nTEST 3 — the timed exercise gets the RIGHT clock");

const side = resolveTiming(SIDE);
ok("3a. side-plank-full counts 20 seconds, not its 90-second duration",
   side.seconds === 20, `got ${side.seconds} from ${side.source}`);
ok("3b. sourced from the reps, not the duration", side.source === "reps", `source ${side.source}`);
ok("3c. plank is untouched: clock from duration", (() => {
  const t = resolveTiming(PLANK);
  return t.seconds === PLANK.duration && t.source === "duration";
})());
ok("3d. a clinician's prescription still overrides the database",
   resolveTiming(LAT, "45s").seconds === 45);

console.log("\nTEST 4 — the whole library behaves");

{
  const counted = EXERCISES.filter(e => classifyReps(e.reps) === "counted");
  const timed   = EXERCISES.filter(e => classifyReps(e.reps) === "timed");
  const noReps  = EXERCISES.filter(e => !e.reps);

  ok("4a. the counted set is not empty — the rule reaches real data", counted.length > 50, `${counted.length}`);
  ok("4b. no counted exercise anywhere gets a clock",
     counted.every(e => resolveTiming(e).seconds === null),
     counted.filter(e => resolveTiming(e).seconds !== null).map(e => e.id).slice(0, 5).join(", "));
  ok("4c. every timed-reps exercise gets a clock from its reps, never longer than its duration",
     timed.every(e => {
       const t = resolveTiming(e);
       return t.seconds > 0 && t.source === "reps" && t.seconds <= (e.duration || Infinity);
     }),
     timed.filter(e => { const t = resolveTiming(e); return !(t.seconds > 0 && t.source === "reps"); }).map(e => e.id).slice(0, 5).join(", "));
  ok("4d. nothing without reps changed: clock from duration, as before",
     noReps.every(e => {
       const t = resolveTiming(e);
       return e.duration > 0 ? (t.seconds === e.duration && t.source === "duration") : t.seconds === null;
     }));
}

console.log("\nTEST 5 — the builder's half of `duration` is untouched");

{
  const { store } = await import("../js/store.js");
  const { buildSession } = await import("../js/session-builder.js");
  store.init();
  const EQ = ["dumbbells", "resistance-band", "bench"];
  store.set("equipment", EQ); store.set("homeEquipment", EQ);
  const s = buildSession({ sessionType: "glute", durationMins: 30, equipmentOverride: EQ, preset: null });
  ok("5a. a session still reports a duration to the person",
     typeof s.duration === "string" && /\d/.test(s.duration), JSON.stringify(s.duration));
  ok("5b. and its exercises still carry the duration the estimate is built from",
     (s.exercises || []).every(e => typeof e.duration === "number"));
}

console.log("\nTEST 6 — the player, driven: sets one at a time, no false label");

/*
 * EXECUTING, not a regex over the source. The original fault was a label
 * that rendered correctly and never advanced -- a source check reading
 * "Set ${n} of ${sets}" would have passed on every day it was broken.
 * This taps through a real Lat Pulldown.
 *
 * Harness copied from verify-timer1.mjs, which already mounts this view.
 */
{
  for (const k of ["HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "navigator"])
    Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
  dom.window.matchMedia = (q) => ({ matches: false, media: q,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  dom.window.scrollTo = () => {};
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  globalThis.history = dom.window.history;
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);

  document.body.innerHTML = '<div id="main-content"></div>';
  const main = document.getElementById("main-content");

  const { store } = await import("../js/store.js");
  const sb        = await import("../js/session-builder.js");
  const workout   = await import("../js/views/workout.js");

  const paint = () => {
    main.innerHTML = workout.render();
    try { workout.onMount(); } catch { /* onMount touches APIs jsdom lacks */ }
  };
  const _router = { navigate: () => paint() };
  globalThis.window.router = _router;
  Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });

  const T   = () => (main.textContent || "").replace(/\s+/g, " ").trim();
  const tap = (sel) => {
    const el = main.querySelector(sel);
    if (!el) return false;
    el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    return true;
  };

  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("homeEquipment", ["dumbbells", "resistance-band"]);
  const built = sb.buildSession({ sessionType: "glute", durationMins: 30, equipmentOverride: null, preset: null });
  // One exercise, and it is the real Lat Pulldown from the library.
  built.exercises = [{ ...LAT, section: "main" }];
  store.set("generatedSession", { session: built, builtAt: new Date().toISOString(), inputs: {} });
  store.set("usingGeneratedSession", true);
  store.set("activeSession", built);
  paint();

  ok("6pc. POSITIVE CONTROL: the session mounted on Lat Pulldown",
     /Lat Pulldown/i.test(T()) && !!main.querySelector("#wo-begin-btn"),
     `screen reads: ${T().slice(0, 140)}`);

  tap("#wo-begin-btn");

  ok("6a. no clock on it at all", !main.querySelector("#timer-toggle-btn"),
     "a counted exercise must not offer a countdown");
  ok("6b. the sets and reps he never saw are on screen", /3\s*×\s*10/.test(T()), T().slice(0, 200));
  ok("6c. rest between sets is shown", /60s/.test(T()) && /rest/i.test(T()));
  ok("6d. the set counter starts at one", /Set 1 of 3/.test(T()), T().slice(0, 200));

  ok("6e. a per-set control exists", !!main.querySelector("#wo-set-done-btn"));

  tap("#wo-set-done-btn");
  ok("6f. tapping it ADVANCES the counter — the original fault", /Set 2 of 3/.test(T()), T().slice(0, 200));
  ok("6g. and does not jump to reflection after set one",
     !main.querySelector("#complete-exercise-btn"), "this is exactly what the countdown used to do");

  tap("#wo-set-done-btn");
  ok("6h. and again", /Set 3 of 3/.test(T()), T().slice(0, 200));

  tap("#wo-set-done-btn");
  ok("6i. the LAST set opens reflection", !!main.querySelector("#complete-exercise-btn"),
     `landed on: ${T().slice(0, 140)}`);

  // The counter must restart on the NEXT exercise. Without this the
  // reversal that deletes `currentSet = 1` from resetTimer() stayed green:
  // a one-exercise fixture can never see a counter carried over, and the
  // person would open their second lift already on set three.
  tap("#exit-workout-btn");
  document.querySelector("#exit-confirm-discard")
    ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

  const SECOND = EXERCISES.find(e => e.id === "gym-seated-row") || LAT;
  built.exercises = [{ ...LAT, section: "main" }, { ...SECOND, section: "main" }];
  store.set("generatedSession", { session: built, builtAt: new Date().toISOString(), inputs: {} });
  store.set("activeSession", built);
  paint();
  tap("#wo-begin-btn");
  tap("#wo-set-done-btn"); tap("#wo-set-done-btn"); tap("#wo-set-done-btn");
  ok("6l. CONTROL: the first exercise really did reach reflection on its last set",
     !!main.querySelector("#complete-exercise-btn"), T().slice(0, 140));
  tap("#complete-exercise-btn");
  tap("#wo-begin-btn");
  ok("6m. the next exercise starts at set one, not where the last one ended",
     /Set 1 of/.test(T()) && !/Set (2|3|4) of/.test(T()), T().slice(0, 200));

  tap("#exit-workout-btn");
  document.querySelector("#exit-confirm-discard")
    ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

  // A timed exercise must be untouched by all of this.
  //
  // Exit the open session FIRST. This view keeps its page in module state
  // and the app clears it through the exit path -- the first draft of this
  // fixture only re-painted, so the plank mounted on the NOTE page the Lat
  // Pulldown had just left, and 6j failed for a reason that had nothing to
  // do with planks. verify-timer1 carries the same warning.
  tap("#exit-workout-btn");
  document.querySelector("#exit-confirm-discard")
    ?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

  built.exercises = [{ ...PLANK, section: "main" }];
  store.set("activeSession", built);
  store.set("generatedSession", { session: built, builtAt: new Date().toISOString(), inputs: {} });
  paint();
  tap("#wo-begin-btn");
  ok("6j. a plank still gets its clock and no set buttons",
     !!main.querySelector("#timer-toggle-btn") && !main.querySelector("#wo-set-done-btn"),
     T().slice(0, 140));
  ok("6k. and is not labelled with a set number that cannot advance",
     !/Set 1 of/.test(T()), T().slice(0, 140));
}

console.log(`\n  ${fails === 0 ? "ALL PASS" : fails + " RED"}\n`);
process.exit(fails ? 1 : 0);
