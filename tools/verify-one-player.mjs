/**
 * tools/verify-one-player.mjs
 * 04 Oct 2026 v3
 *
 * v3 - D-1 EXERCISE-FOUR. Reaches Capture (the fourth step) before the set
 *   buttons. REVERSAL, approved in the four-step mock-up (Option B): 1b was
 *   at most two taps a move (Done, Next); the four steps add one, "I know
 *   this one: go to capture", so it is at most three. Nothing else changed.
 *
 * v2 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * P21, PLAYERS (persona finding W2-17). Three players: the coach's (one
 * card per move) and an older one, four pages per move and 40+ taps a
 * session, for the builder and saved sessions. And saved sessions said
 * "Not done yet" after being done: "last done" was stamped when a saved
 * session was STARTED (abandoned or not), and never when one was saved
 * from the finish screen straight after doing it.
 *
 * Decision (accepted 28 Sep): one player; the saved list reads the log.
 * The Plan's programme sessions keep their own screen (week, phase,
 * programme record); the core session keeps its own and has no door.
 *
 * Through the real router:
 *   1. Builder -> Let's go -> the coach's player, Free and the Plan; the
 *      whole session in at most three taps a move (D-1: two before).
 *   2. Saved -> Start -> the coach's player; done, the list says "Last
 *      done today"; saved from the finish screen straight after doing it,
 *      the same; started and abandoned, still "Not done yet".
 *   3. The machine swap came across: a busy treadmill can be swapped for
 *      another machine the person has, and the session keeps the change.
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

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

function fixture(tier) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("equipment", ["dumbbells", "bench"]); store.set("homeEquipment", ["dumbbells", "bench"]);
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(40); }
const onView = () => router.currentView;

async function buildAndGo() {
  await go("today");
  await go("session-builder");
  if (!$$(".sb-type-tile").length) { click($("#sb-rebuild-btn")); await wait(200); }
  click($$(".sb-type-tile").find(b => b.dataset.type === "full"));
  click($("#sb-location-continue-btn"));
  click($$(".sb-duration-btn").find(b => b.dataset.mins === "30"));
  click($("#sb-build-btn"));
  click($$(".sb-buildmode-btn").find(b => b.dataset.mode === "coach"));
  await wait(1400);
  const s = store.get("generatedSession")?.session;
  click($("#sb-go-btn")); await wait(300);
  return s;
}
// Play to the finish by the fewest taps the player offers; count them.
async function playThrough(max = 200) {
  let taps = 0;
  for (let i = 0; i < max && onView() !== "reflect"; i++) {
    const b = $("#complete-exercise-btn") || $("#wo-done-btn") || $("#wo-step-capture") || $("#gp-next-btn") || $("#gp-done-btn") || $("[data-card-next]") || $("#gp-complete-btn");
    if (!b) break;
    click(b); taps++; await wait(15);
  }
  return taps;
}

// ── 1. THE BUILDER ──────────────────────────────────────────────────────
console.log("\nTEST 1 - a session from the builder plays in the coach's player");
for (const tier of ["free", "personal"]) {
  fixture(tier);
  const s = await buildAndGo();
  ok(`1pc-${tier}. the builder made a session`, !!s && s.exercises.length >= 5, `${s?.exercises?.length}`);
  ok(`1a-${tier}. Let's go opens the coach's player on its first move`, onView() === "workout" && txt(main).includes(s.exercises[0].name), `${onView()} | ${txt(main).slice(0, 100)}`);
  const taps = await playThrough();
  ok(`1b-${tier}. the whole session in at most three taps a move (go to capture, Done, Next)`, onView() === "reflect" && taps <= 3 * s.exercises.length, `${taps} taps for ${s.exercises.length} moves; ended on ${onView()}`);
}

// ── 2. SAVED SESSIONS ───────────────────────────────────────────────────
console.log("\nTEST 2 - saved sessions: the coach's player, and \"last done\" from the log");
const SS = await import(B + "data/saved-sessions.js");
const label = () => txt($("[data-saved-id]")?.closest("li, .saved-session, article") || main);
{
  fixture("personal");
  const built = (await import(B + "session-builder.js")).buildSession({ sessionType: "upper", durationMins: 20, equipmentOverride: ["dumbbells"] });
  const r = SS.saveSession("Tuesday upper", { ...built, durationMins: 20 });
  ok("2pc. a saved session", r.ok, JSON.stringify(r));
  await go("saved-sessions");
  ok("2pc2. listed, never done", /Not done yet/.test(label()), label().slice(0, 140));
  click($("[data-saved-id]")); await wait(300);
  ok("2a. Start opens the coach's player", onView() === "workout" && txt(main).includes(SS.resolveSavedSession(r.saved).exercises[0].name), onView());
  // Started, and left without finishing.
  await go("today");
  await go("saved-sessions");
  ok("2b. started and left, not finished: still \"Not done yet\"", /Not done yet/.test(label()), label().slice(0, 140));
  click($("[data-saved-id]")); await wait(300);
  await playThrough();
  await go("saved-sessions");
  ok("2c. finished: \"Last done today\"", /Last done today/.test(label()) && !/Not done yet/.test(label()), label().slice(0, 140));
}
{
  // Done first (a builder session), saved afterwards from the finish screen.
  fixture("personal");
  const s = await buildAndGo();
  await playThrough();
  const r = SS.saveSession("After the fact", { ...s, durationMins: 30 });
  await go("saved-sessions");
  ok("2d. saved straight after doing it: \"Last done today\", not \"Not done yet\"", r.ok && /Last done today/.test(label()), label().slice(0, 140));
}

// ── 3. THE MACHINE SWAP ─────────────────────────────────────────────────
console.log("\nTEST 3 - a busy machine can still be swapped in the coach's player");
{
  fixture("personal");
  const { EXERCISES, getSwapCandidates, isCardioMachine } = await import(B + "data/exercises/index.js");
  const KIT = ["treadmill", "exercise-bike", "elliptical", "rowing-machine", "dumbbells"];
  store.set("equipment", KIT);
  const machine = EXERCISES.find(e => isCardioMachine(e) && getSwapCandidates(e, KIT).length > 0);
  const other = EXERCISES.find(e => e.id === "push-up") || EXERCISES[0];
  store.set("generatedSession", { session: { id: "full", name: "Full", sessionType: "full", exercises: [{ ...machine, section: "main" }, { ...other, section: "main" }] }, builtAt: new Date().toISOString(), inputs: {} });
  await go("workout");
  ok("3pc. on a cardio machine with alternatives", txt(main).includes(machine.name) && !!$("#wo-swap-btn"), txt(main).slice(0, 120));
  click($("#wo-swap-btn")); await wait(20);
  const opt = $("[data-swap-to]");
  ok("3a. \"Can't get on this? Swap it\" opens the machines they have", !!opt && document.activeElement === opt, txt($("#wo-swap-panel")).slice(0, 120));
  const to = opt?.getAttribute("data-swap-to");
  click(opt); await wait(20);
  const toName = (EXERCISES.find(e => e.id === to) || {}).name;
  ok("3b. the card is the new machine, and the session keeps it", !!toName && txt(main).includes(toName) &&
     store.get("generatedSession").session.exercises[0].id === to && store.get("generatedSession").session.exercises[0].section === "main", `${toName} | ${store.get("generatedSession").session.exercises[0].id}`);
}

console.log("");
if (fails) { console.log(`ONE-PLAYER: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`ONE-PLAYER: all ${passes} assertions pass\n`);
process.exit(0);
