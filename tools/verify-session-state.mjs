/**
 * tools/verify-session-state.mjs
 * 04 Oct 2026 v2
 *
 * v2 - D-1 EXERCISE-FOUR. Reaches Capture (the fourth step) before the set buttons;
 *   nothing it proves has changed.
 *
 * W5-9 SESSION-STATE (Wave 5 persona trace: 2.1, 2.15).
 *
 * In one app run: *Exit without saving* on the back-gesture card left the
 * checkpoint, so the part-session was saved later anyway ("rescued"), and
 * left the player where it was, so the next session started at "4 of 10".
 * *Carry on later*, then a different session from Home's *Or instead*:
 * "Something went wrong loading this page" (the old position past the end
 * of the new plan).
 *
 * Through the real router:
 *   1. Three moves into a plan, the phone's Back, *Exit without saving*:
 *      no checkpoint left, nothing saved then or later.
 *   2. The next session starts at "1 of N".
 *   3. *Carry on later* five moves in, then a shorter, different plan: it
 *      opens at "1 of 3", no error.
 *   4. Control: *Carry on later* then the same plan again carries on where
 *      it was.
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
const RES = await import(B + "session-resume.js");

function fixture(tier = "free") {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Jo"); store.set("tier", tier);
  store.set("equipment", ["dumbbells"]); store.set("homeEquipment", ["dumbbells"]);
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(40); }
const onView = () => router.currentView;
const pos = () => (txt(main).match(/(\d+) of (\d+)/) || []).slice(1).map(Number);
function plan(type, mins) {
  const s = SB.buildSession({ sessionType: type, durationMins: mins });
  store.set("usingGeneratedSession", true);
  return s;
}
async function advance(n) {
  for (let k = 0; k < n; k++) {
    const start = pos()[0];
    for (let i = 0; i < 12 && pos()[0] === start && onView() === "workout"; i++) {
      const b = main.querySelector("#complete-exercise-btn, #wo-done-btn, #wo-set-done-btn, #wo-step-capture, [data-card-next]");
      if (!b) break;
      click(b); await wait(15);
    }
  }
}

// ── 1 & 2. EXIT WITHOUT SAVING ──────────────────────────────────────────
console.log("\nTEST 1 - the phone's Back, Exit without saving");
fixture();
const s1 = plan("full", 30);
await go("today"); await go("workout");
await advance(3);
ok("1pc. three moves into a plan", onView() === "workout" && pos()[0] === 4 && s1.exercises.length >= 6, `${pos()} ${onView()}`);
ok("1pc2. a checkpoint was written", !!store.get("activeSessionCheckpoint"));
const logBefore = (store.get("activityLog") || []).length;
dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate", { state: { sessionGuard: true } }));
await wait(30);
click(document.getElementById("sg-exit-discard-btn")); await wait(60);
ok("1a. no checkpoint left", !store.get("activeSessionCheckpoint"), JSON.stringify(store.get("activeSessionCheckpoint"))?.slice(0, 120));
// Three hours on, Home saves any checkpoint still left (rescueStaleSession):
{ const cp = store.get("activeSessionCheckpoint"); if (cp) RES.rescueSession(cp); }
ok("1b. nothing saved, then or later", (store.get("activityLog") || []).length === logBefore && !store.get("rescuedSession"), `${logBefore} -> ${(store.get("activityLog") || []).length}`);

console.log("\nTEST 2 - the next session starts at the start");
const s2 = plan("upper", 30);
await go("today"); await go("workout");
ok("2a. \"1 of N\"", onView() === "workout" && pos()[0] === 1 && pos()[1] === s2.exercises.length, `${pos()} | ${txt(main).slice(0, 100)}`);

// ── 3. CARRY ON LATER, THEN ANOTHER SESSION ─────────────────────────────
console.log("\nTEST 3 - Carry on later, then a different, shorter session");
fixture("personal");
plan("full", 45);
await go("today"); await go("workout");
await advance(5);
ok("3pc. five moves in", pos()[0] === 6, String(pos()));
click(main.querySelector("#exit-workout-btn")); await wait(20);
click(document.getElementById("exit-confirm-later")); await wait(60);
ok("3pc2. Carry on later went Home", onView() === "today");
const short = SB.buildSession({ sessionType: "mobility", durationMins: 10 });
store.set("generatedSession", { session: { ...short, exercises: short.exercises.slice(0, 3) }, builtAt: new Date(Date.now() + 1000).toISOString(), inputs: {} });
store.set("usingGeneratedSession", true);
await go("workout");
ok("3a. no error, and the new plan from its start: \"1 of 3\"", onView() === "workout" && !/Something went wrong/i.test(txt(main)) && pos()[0] === 1 && pos()[1] === 3, `${pos()} | ${txt(main).slice(0, 120)}`);

// ── 4. CONTROL ──────────────────────────────────────────────────────────
console.log("\nTEST 4 - control: Carry on later, then the same plan");
fixture("personal");
plan("full", 45);
await go("today"); await go("workout");
await advance(4);
click(main.querySelector("#exit-workout-btn")); await wait(20);
click(document.getElementById("exit-confirm-later")); await wait(60);
await go("workout");
ok("4a. carries on where it was", onView() === "workout" && pos()[0] === 5, String(pos()));

// ── 5. THE GUARD ITSELF ─────────────────────────────────────────────────
console.log("\nTEST 5 - the back-gesture card, for any session that keeps a checkpoint");
const SG = await import(B + "session-guard.js");
fixture();
await go("today");
SG.mountSessionGuard({ isActive: () => true, onExit() {}, label: "run" });
RES.checkpointSession("run", { sessionId: "run-1", startedAt: new Date().toISOString() });
dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate", { state: { sessionGuard: true } }));
await wait(20);
click(document.getElementById("sg-exit-discard-btn")); await wait(40);
ok("5a. Exit without saving takes away the checkpoint this session wrote", !store.get("activeSessionCheckpoint"));
RES.checkpointSession("workout", { sessionId: "kept", startedAt: new Date().toISOString() });
SG.mountSessionGuard({ isActive: () => true, onExit() {}, label: "mindful session" });
dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate", { state: { sessionGuard: true } }));
await wait(20);
click(document.getElementById("sg-exit-discard-btn")); await wait(40);
ok("5b. control: one from before this session (Carry on later) stays", store.get("activeSessionCheckpoint")?.sessionId === "kept");

console.log("");
if (fails) { console.log(`SESSION-STATE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SESSION-STATE: all ${passes} assertions pass\n`);
process.exit(0);
