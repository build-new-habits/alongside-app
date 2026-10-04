/**
 * tools/verify-session-type-live.mjs
 * 04 Oct 2026 v2
 *
 * v2 - D-1 EXERCISE-FOUR. Reaches Capture (the fourth step) before the set buttons;
 *   nothing it proves has changed.
 *
 * P2, SESSION-TYPE-ID (persona finding W2-1, seen by all eight).
 * "The coach picks Glute Focus every time."
 *
 * Two faults behind one symptom:
 *   1. The coach's plan recorded `sessionType: built.id` -- a session id,
 *      "glute-1791180600000", not a type. session-choice.js rejects it, so
 *      history always read empty and the chooser always gave the first
 *      type: Glute Focus on Free, the arc's first strand on the Plan.
 *      Progress printed "mostly glute 1791180600000".
 *   2. logActivity() filled a missing type from lastFinishedSession --
 *      which, at the moment of logging, is the PREVIOUS session. Walks,
 *      breathing and everything else inherited the last strength session.
 *
 * verify-always-core stayed green because it fed a bare "glute" through
 * lastFinishedSession: a shape the app never writes, down the path that
 * was stamping stale types. So this gate writes nothing by hand. It runs
 * the real plan, taps Start, plays the real player to the end, and asks
 * the real plan again -- four times, on Free and on the Plan.
 */
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
const gate = await import(B + "safety-gate.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const workout = await import(B + "views/workout.js");
const { SESSION_TYPES } = await import(B + "session-builder.js");
const { recentSessionTypes } = await import(B + "data/session-choice.js");
const { AIMS } = await import(B + "data/aims.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const TYPE_IDS = SESSION_TYPES.map(t => t.id);
const isType = v => TYPE_IDS.includes(v);

let navs = [];
function paint() { main.innerHTML = workout.render(); try { workout.onMount(); } catch { /* player-flow owns this */ } }
const rtr = { navigate: v => { navs.push(v); if (v === "workout") paint(); }, back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });
const tap = sel => { const el = main.querySelector(sel) || document.querySelector(sel); if (el) el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };

const AIM = AIMS.list.find(a => a.id === "sport-without-flaring") || AIMS.list[0];
function fixture(tier) {
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("homeEquipment", ["band-light", "dumbbells-light"]); store.set("gymEquipment", []);
  store.set("equipment", ["band-light", "dumbbells-light"]); store.set("sessionLocation", "home");
  store.set("availableTime", "standard");
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  if (tier === "personal") store.set("arc", { aimId: AIM.id, strands: AIM.strands, startedAt: new Date().toISOString() });
}

// One real session: the plan, Start, the player to the end.
async function oneSession() {
  navs = [];
  main.innerHTML = "";
  CoachProposalView(rtr).mount(main);
  await wait(30);
  const start = main.querySelector("#cp-preview-start");
  if (!start) return { error: "no Start", text: txt(main).slice(0, 160) };
  const proposedTitle = txt(main.querySelector("#cp-preview-panel h1"));
  start.click();
  await wait(2500);
  const gs = store.get("generatedSession")?.session;
  if (!navs.includes("workout")) return { error: "did not start", navs };
  if (process.env.DBG) console.log("PLAYER:", txt(main).slice(0, 300), [...main.querySelectorAll("button")].map(b => b.id || b.className).join(","));
  for (let i = 0; i < 400 && !navs.includes("reflect"); i++) {
    // A set-based exercise has a button a set; a timed one, "Done". Each
    // move opens at Why: "go to capture" reaches the set buttons.
    if (!tap("#wo-set-done-btn") && !tap("#complete-exercise-btn") && !tap("#wo-done-btn") && !tap("#wo-step-capture")) break;
    await wait(0);
  }
  // Four sessions a person does on four occasions, not inside the store's
  // ten-second duplicate guard: the entry is moved back in time.
  const log = store.get("activityLog") || [];
  const at = new Date(Date.now() - (10 - (store.get("activityLog") || []).length) * 3600e3).toISOString();
  if (log.length) { log[log.length - 1] = { ...log.at(-1), completedAt: at, date: at }; store.set("activityLog", log); }
  return { finished: navs.includes("reflect"), proposedTitle, planType: gs?.sessionType, planId: gs?.id, entry: log.at(-1) };
}

// ── 1. FREE AND THE PLAN: FOUR SESSIONS IN A ROW ────────────────────────
for (const tier of ["free", "personal"]) {
  console.log(`\nTEST 1 (${tier}) - four real sessions: recorded as a type, and the coach moves on`);
  fixture(tier);
  const runs = [];
  for (let i = 0; i < 4; i++) runs.push(await oneSession());
  const r0 = runs[0];
  ok(`1pc-${tier}. the plan started and the player finished, every time`, runs.every(r => r.finished), JSON.stringify(runs.map(r => r.error || r.finished)));
  ok(`1a-${tier}. the plan carries a type, not an id`, runs.every(r => isType(r.planType)), JSON.stringify(runs.map(r => r.planType)));
  ok(`1b-${tier}. the log records the type`, runs.every(r => isType(r.entry?.sessionType) && r.entry.sessionType === r.planType),
     JSON.stringify(runs.map(r => r.entry?.sessionType)));
  ok(`1c-${tier}. the chooser can read that history`, recentSessionTypes().length === 4, JSON.stringify(recentSessionTypes()));
  const titles = runs.map(r => r.planType);
  console.log("        " + titles.join(" → "));
  ok(`1d-${tier}. four sessions are not four of the same`, new Set(runs.map(r => String(r.planType).replace(/-\d+$/, ""))).size >= 3, titles.join(" → "));
}

// ── 2. NOTHING BORROWS THE LAST SESSION'S TYPE ──────────────────────────
console.log("\nTEST 2 - a walk, breathing or a class logged afterwards carries no strength type");
{
  const before = (store.get("activityLog") || []).at(-1);
  ok("2pc. a strength session was just finished", isType(before?.sessionType) && !!store.get("lastFinishedSession"));
  const now = Date.now();
  const walk = store.logActivity({ type: "walk", completedAt: new Date(now + 60000).toISOString(), status: "completed", durationMins: 20 });
  const breath = store.logActivity({ type: "mindfulness", completedAt: new Date(now + 120000).toISOString(), status: "completed", durationMins: 5 });
  ok("2a. the walk and the breathing carry no borrowed type", walk && breath && [walk, breath].every(e => !TYPE_IDS.some(ty => String(e.sessionType).startsWith(ty))),
     `walk ${walk?.sessionType}, breathing ${breath?.sessionType}`);
}

// ── 3. PROGRESS NAMES A WORD ────────────────────────────────────────────
console.log("\nTEST 3 - Progress says what kind of sessions, in words");
{
  const { ProgressView } = await import(B + "views/progress.js");
  main.innerHTML = ""; ProgressView(rtr).mount(main); await wait(30);
  const names = [...main.querySelectorAll(".progress-shapes__name")].map(txt);
  ok("3pc. the section is there", names.length > 0, txt(main).slice(0, 160));
  ok("3a. every row is a word, with no id or number in it", names.length > 0 && names.every(n => !/\d/.test(n) && !/-/.test(n)), JSON.stringify(names));
}

// ── 4. WHAT INSTALLS ALREADY HOLD ───────────────────────────────────────
console.log("\nTEST 4 - stored ids are repaired on load");
{
  const iso = d => new Date(Date.now() - d * 864e5).toISOString();
  const saved = {
    onboardingComplete: true, tier: "free",
    activityLog: [
      { id: "a1", type: "workout", status: "completed", completedAt: iso(5), sessionType: "glute-1791180600000" },
      { id: "a2", type: "walk", status: "completed", completedAt: iso(4), sessionType: "glute-1791180600000" },
      { id: "a3", type: "mindfulness", status: "completed", completedAt: iso(3), sessionType: "lower" },
      { id: "a4", type: "workout", status: "completed", completedAt: iso(2), sessionType: "upper" },
      { id: "a5", type: "yoga", status: "completed", completedAt: iso(1), sessionType: "yoga" },
      { id: "a6", type: "workout", status: "completed", completedAt: iso(1), sessionType: "gentle-care" }
    ],
    arc: { aimId: AIM.id, strands: AIM.strands, typesWorked: { "glute-1791180600000": "2026-09-20", glute: "2026-09-10", "core-1791180700000": "2026-09-22" } }
  };
  localStorage.clear();
  localStorage.setItem(store.STORAGE_KEY, JSON.stringify(saved));
  store.init();
  const log = store.get("activityLog");
  const by = id => log.find(e => e.id === id)?.sessionType ?? null;
  ok("4a. an id becomes its type", by("a1") === "glute", String(by("a1")));
  ok("4b. a strength type on a walk or breathing is cleared", by("a2") === null && by("a3") === null, `${by("a2")}, ${by("a3")}`);
  ok("4c. a real type, and a type that is not a strength type, are kept", by("a4") === "upper" && by("a5") === "yoga" && by("a6") === "gentle-care");
  const tw = store.get("arc").typesWorked;
  ok("4d. the arc's record is merged under the type, keeping the latest date", tw.glute === "2026-09-20" && tw.core === "2026-09-22" && !Object.keys(tw).some(k => /\d/.test(k)), JSON.stringify(tw));
  ok("4f. the store's list of types is the builder's list", JSON.stringify(store.SESSION_TYPE_IDS) === JSON.stringify(TYPE_IDS), JSON.stringify(store.SESSION_TYPE_IDS));
  ok("4e. and the chooser reads it", JSON.stringify(recentSessionTypes()) === JSON.stringify(["upper", "glute"]), JSON.stringify(recentSessionTypes()));
}

console.log("");
if (fails) { console.log(`SESSION-TYPE-LIVE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SESSION-TYPE-LIVE: all ${passes} assertions pass\n`);
process.exit(0);
