/**
 * tools/verify-practice-gate.mjs
 * 29 Sep 2026 v1
 *
 * P23, SAFETY-GATE HEADING (persona finding W2-19). Gating breathing and
 * mindful practice was a decision (GATE-ALL, 16 Sep: "somebody lying on
 * their back breathing is not a place where that stops being true"). The
 * wording was not: before a breathing practice the note said "Before your
 * first exercise" and "stop that movement", every time during the taper.
 *
 * Through the real breathing and quiet-session screens:
 *   1. breathing: the note is headed for a practice and says nothing
 *      about exercise or movement; acknowledged, the record says which
 *      wording was read, and the practice starts;
 *   2. mindful practice (quiet session): the same;
 *   3. control: before a workout the movement wording is unchanged;
 *   4. both wordings count toward the same taper (one advice, two
 *      phrasings): three practices and two workouts end it.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { router: realRouter } = await import(B + "router.js");
const breathing = await import(B + "views/breathing-session.js");
const quiet = await import(B + "views/quiet-session.js");
const workout = await import(B + "views/workout.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const T = () => (main.textContent || "").replace(/\s+/g, " ").trim();
const VIEWS = { "breathing-session": breathing, "quiet-session": quiet, "workout": workout };
let navs = [];
function paint(v) { const m = VIEWS[v]; if (!m) return; main.innerHTML = m.render(); try { m.onMount(); } catch {} }
const nav = v => { navs.push(v); paint(v); };
const _router = { navigate: nav, back() {} };
globalThis.window.router = _router;
Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });
realRouter.navigate = nav;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

function fresh() {
  localStorage.clear(); store.init(); gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "free");
  navs = [];
}
function acknowledge() {
  const box = main.querySelector("[data-gate-ack]"); if (box) { box.checked = true; box.dispatchEvent(new dom.window.Event("change")); }
  click(main.querySelector("[data-gate-start]"));
}
const MOVEMENT = /Before your first exercise|stop that movement|exercise/i;
// The note's own words: heading and advice. The occasional GP guidance
// line ("Before starting any exercise programme...") is about the app as a
// whole and is left as it is.
const noteText = () => { const g = main.querySelector("[data-safety-gate]"); if (!g) return ""; const c = g.cloneNode(true); c.querySelector(".gate-guidance")?.remove(); return (c.textContent || "").replace(/\s+/g, " ").trim(); };

// ── 1. BREATHING ────────────────────────────────────────────────────────
console.log("\nTEST 1 - before a breathing practice");
fresh();
breathing.startBreathing(breathing.BREATHING_TYPES[0].id, 3);
const g1 = main.querySelector("[data-safety-gate]");
const t1 = noteText();
ok("1pc. the note is up before the practice", !!g1, t1.slice(0, 120));
ok("1a. headed for a practice: \"Before your practice\"", /Before your practice/.test(t1), t1.slice(0, 160));
ok("1b. nothing about an exercise or \"that movement\"", !MOVEMENT.test(t1), t1.slice(Math.max(0, t1.search(MOVEMENT) - 120), t1.search(MOVEMENT) + 40));
ok("1c. the advice is still there: stop if something hurts, and get it looked at if it lasts", /If something hurts/.test(t1) && /worth getting someone to look at it/.test(t1));
acknowledge(); await wait(20);
const e1 = (store.get("safetyAckLog") || []).at(-1) || {};
ok("1d. the record says which wording was read", e1.variant === "practice" && e1.textVersion === HURT_AND_ACHE_VERSION && e1.surface === "breathing-session", JSON.stringify(e1));
ok("1e. and the practice starts", !main.querySelector("[data-safety-gate]"), T().slice(0, 120));

// ── 2. MINDFUL ──────────────────────────────────────────────────────────
console.log("\nTEST 2 - before a mindful practice");
fresh();
store.set("quietMode", "mindful");
paint("quiet-session");
const t2 = noteText();
ok("2pc. the note is up", !!main.querySelector("[data-safety-gate]"), t2.slice(0, 120));
ok("2a. headed for a practice, nothing about exercise or movement", /Before your practice/.test(t2) && !MOVEMENT.test(t2), t2.slice(0, 160));
acknowledge(); await wait(20);
ok("2b. recorded as the practice wording", ((store.get("safetyAckLog") || []).at(-1) || {}).variant === "practice");

// ── 3. CONTROL ──────────────────────────────────────────────────────────
console.log("\nTEST 3 - control: before a workout the movement wording stands");
fresh();
store.set("generatedSession", { session: { id: "s", name: "Full", exercises: [{ id: "push-up", name: "Push-Up", section: "main", sets: 2, reps: "8" }] }, builtAt: new Date().toISOString(), inputs: {} });
paint("workout");
const t3 = noteText();
ok("3a. \"Before your first exercise\" and \"stop that movement\"", /Before your first exercise/.test(t3) && /stop that movement/.test(t3), t3.slice(0, 160));
acknowledge(); await wait(20);
const e3 = (store.get("safetyAckLog") || []).at(-1) || {};
ok("3b. recorded with no practice variant", e3.textVersion === HURT_AND_ACHE_VERSION && !e3.variant, JSON.stringify(e3));

// ── 4. ONE TAPER ────────────────────────────────────────────────────────
console.log("\nTEST 4 - both wordings count toward the same taper");
fresh();
const mk = (variant, n) => Array.from({ length: n }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture", ...(variant ? { variant } : {}) }));
store.set("safetyAckLog", [...mk("practice", 3), ...mk(null, 1)]);
ok("4pc. four acknowledgements: still due", gate.isGateDue());
store.set("safetyAckLog", [...mk("practice", 3), ...mk(null, 2)]);
ok("4a. three practices and two workouts: the taper is over", !gate.isGateDue());

console.log("");
if (fails) { console.log(`PRACTICE-GATE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PRACTICE-GATE: all ${passes} assertions pass\n`);
process.exit(0);
