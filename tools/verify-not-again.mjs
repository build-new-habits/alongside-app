/**
 * tools/verify-not-again.mjs
 * 04 Oct 2026 v2
 *
 * v2 - D-1 EXERCISE-FOUR. Reaches Capture (the fourth step) before the set buttons; nothing it proves has changed.
 *
 * 29 Sep 2026 v1
 *
 * P18, "NOT AGAIN" (persona finding W2-13). Settings says: "When you skip
 * something, the coach offers to see it less often -- or not at all." The
 * core session has that offer; the player the coach's plan uses
 * (workout.js) had a Skip button and nothing after it. For persona 2.14,
 * removing an exercise he cannot face is the whole need.
 *
 * Through the real player, with a session the real builder made:
 *   1. skip a move -> the next card asks, by name, how often it should
 *      come up; "Not again" records it -> the builder never proposes it
 *      again (it was the move it proposed most often);
 *   2. "Less often" records that; "Leave it" records nothing;
 *   3. skipping the LAST move still asks, then finishes;
 *   4. the question never carries into the next session.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { router: realRouter } = await import(B + "router.js");
const SB = await import(B + "session-builder.js");
const workout = await import(B + "views/workout.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
let navs = [];
function paint() { main.innerHTML = workout.render(); try { workout.onMount(); } catch {} }
const nav = v => { navs.push(v); if (v === "workout") paint(); };
const _router = { navigate: nav, back() {} };
globalThis.window.router = _router;
Object.defineProperty(globalThis, "router", { value: _router, configurable: true, writable: true });
realRouter.navigate = nav;
const tap = sel => { const el = main.querySelector(sel); el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!el; };
const T = () => (main.textContent || "").replace(/\s+/g, " ").trim();
const nameNow = () => (main.querySelector("#wo-exercise-name")?.textContent || "").trim();

const KIT = ["dumbbells-light", "yoga-mat", "bands"];
function person() {
  localStorage.clear(); store.init();
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("tier", "personal"); store.set("onboardingComplete", true); store.set("name", "Sam");
  store.set("equipment", KIT); store.set("conditions", []);
}
const freq = () => {
  const n = new Map();
  for (let i = 0; i < 40; i++) SB.buildSession({ sessionType: "full", durationMins: 30, equipmentOverride: KIT }).exercises
    .forEach(e => n.set(e.id, (n.get(e.id) || 0) + 1));
  return n;
};
function play(exercises) {
  if (main.querySelector("#exit-workout-btn")) { tap("#exit-workout-btn"); document.querySelector("#exit-confirm-discard")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); }
  store.set("generatedSession", { session: { id: "s", name: "Full Body", sessionType: "full", exercises }, builtAt: new Date().toISOString(), inputs: {} });
  store.set("usingGeneratedSession", true);
  navs = []; paint();
}

// ── 1. SKIP → NOT AGAIN → NEVER PROPOSED ────────────────────────────────
console.log("\nTEST 1 - skip, \"Not again\", and it is never proposed again");
person();
const before = freq();
const [topId, topCount] = [...before.entries()].sort((a, b) => b[1] - a[1])[0];
let built = [];
for (let i = 0; i < 100 && !built.some(e => e.id === topId); i++) built = SB.buildSession({ sessionType: "full", durationMins: 30, equipmentOverride: KIT }).exercises;
const top = built.find(e => e.id === topId);
const session = [top, ...built.filter(e => e.id !== top.id)].slice(0, 5);
ok("1pc. the builder's most-proposed move, first in a real session", topCount >= 10 && session[0].id === topId, `${topId} in ${topCount} of 40`);
play(session);
ok("1pc2. the player is on it", nameNow() === session[0].name, nameNow());
tap("#skip-exercise-btn"); await wait(10);
const offer = main.querySelector("[data-skip-pref]") && T();
ok("1a. after Skip, the next card asks about it by name", nameNow() === session[1].name && !!offer && offer.includes(session[0].name) && /how often/i.test(offer), `${nameNow()} | ${T().slice(0, 160)}`);
ok("1b. three answers: less often, not again, leave it",
   ["less", "avoid", "dismiss"].every(v => main.querySelector(`[data-skip-pref="${v}"]`)));
tap('[data-skip-pref="avoid"]'); await wait(10);
const p = (store.get("exercisePreferences") || {})[topId] || {};
ok("1c. \"Not again\" is recorded, as coming from a skip", p.preference === "avoid" && p.source === "skip", JSON.stringify(p));
ok("1d. the question goes; the card stays on the next move", !main.querySelector("[data-skip-pref]") && nameNow() === session[1].name, nameNow());
const after = freq();
ok("1e. 40 rebuilds later it is never proposed", !after.has(topId), `${after.get(topId) || 0} of 40`);

// ── 2. THE OTHER ANSWERS ────────────────────────────────────────────────
console.log("\nTEST 2 - \"Less often\" and \"Leave it\"");
person(); play(session);
tap("#skip-exercise-btn"); await wait(10); tap('[data-skip-pref="less"]'); await wait(10);
ok("2a. \"Less often\" is recorded", ((store.get("exercisePreferences") || {})[topId] || {}).preference === "less");
person(); play(session);
tap("#skip-exercise-btn"); await wait(10); tap('[data-skip-pref="dismiss"]'); await wait(10);
ok("2b. \"Leave it\" records nothing, and the question goes", !(store.get("exercisePreferences") || {})[topId] && !main.querySelector("[data-skip-pref]"));

// ── 3. THE LAST MOVE ────────────────────────────────────────────────────
person(); play(session);
tap("#skip-exercise-btn"); await wait(10);
if (!main.querySelector("#wo-set-done-btn, #wo-done-btn, #complete-exercise-btn")) { tap('[data-step-go="capture"]:not([aria-current])'); await wait(10); }
for (let i = 0; i < 6 && main.querySelector("#wo-set-done-btn"); i++) tap("#wo-set-done-btn");
tap("#wo-done-btn"); tap("#complete-exercise-btn"); await wait(10);
ok("2c. not answered and carried on: the question goes, nothing recorded", !main.querySelector("[data-skip-pref]") && !(store.get("exercisePreferences") || {})[topId] && nameNow() === session[2].name, `${nameNow()} | offer ${!!main.querySelector("[data-skip-pref]")}`);

console.log("\nTEST 3 - skipping the last move still asks, then finishes");
person(); play(session.slice(0, 2));
tap("#skip-exercise-btn"); await wait(10);   // skip move 1
tap('[data-skip-pref="dismiss"]'); await wait(10);
ok("3pc. on the last move", nameNow() === session[1].name, nameNow());
tap("#skip-exercise-btn"); await wait(10);
ok("3a. it asks about the last move before the session ends", !!main.querySelector("[data-skip-pref]") && T().includes(session[1].name) && !navs.includes("reflect"), `${navs.join(",")} | ${T().slice(0, 120)}`);
tap('[data-skip-pref="avoid"]'); await wait(10);
ok("3b. answered, it records and finishes", ((store.get("exercisePreferences") || {})[session[1].id] || {}).preference === "avoid" && navs.at(-1) === "reflect", JSON.stringify(navs));

// ── 4. NOTHING CARRIES OVER ─────────────────────────────────────────────
console.log("\nTEST 4 - the question never carries into the next session");
person(); play(session);
tap("#skip-exercise-btn"); await wait(10);
ok("4pc. asked", !!main.querySelector("[data-skip-pref]"));
play(session);   // leave (discard) and start again
ok("4a. a new session opens without it", !main.querySelector("[data-skip-pref]") && nameNow() === session[0].name, `${nameNow()} | offer ${!!main.querySelector("[data-skip-pref]")}`);

console.log("");
if (fails) { console.log(`NOT-AGAIN: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`NOT-AGAIN: all ${passes} assertions pass\n`);
process.exit(0);
