/**
 * tools/verify-library-tiles.mjs
 * 04 Oct 2026 v3
 *
 * v3 - D-5 LIBRARY-ONCE. REVERSAL, from Graeme's device test (asked home
 *   or gym twice; the builder's plan was not the coach's): Full Body,
 *   Upper body, Lower body and Mobility at home now open Today's plan
 *   (coach-proposal) with their kind as requestedSessionType, not the
 *   builder with a preselect. 1b reads the kind from there; everything it
 *   protects (each tile lands where its label says, only Core opens the
 *   core session) is unchanged.
 *
 * 02 Oct 2026 v2
 *
 * v2 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * LIBRARY-TILES (found making the core-door mock-up, 30 Sep). Library >
 * At home had four tiles that all opened the core session: Core (right),
 * HIIT ("High intensity intervals" -- the core session has none),
 * Strength ("Bodyweight or home weights") and Mobility ("Open and unlock
 * the body"). The same fault P17 fixed on the Home Mobility door: a label
 * promising a session it does not open.
 *
 * CORE-DOOR, decided the same day (Graeme: "follow your best
 * recommendations"): the core session keeps this as its one door, now
 * saying what it holds -- Stability, strength, mobility or gentle. Not
 * moved into "I know what I want": the core session plays in its own
 * older player, and P21 put every built session in one player.
 *
 *   1. Through the real router: every At home tile opens a destination no
 *      other tile opens, and each one's label matches where it goes.
 *   2. Core opens the core session and says its four focuses; no tile
 *      promises HIIT; Mobility, Upper body and Lower body open the builder
 *      at that type, a type the builder has.
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
async function go(view) { await router.navigate(view); await wait(60); }
const SB = await import(B + "session-builder.js");
// The builder reads the preselect and clears it as it opens, so the type
// is caught as Library sets it.
let lastPre = "";
const _set = store.set.bind(store);
store.set = (k, v, ...r) => { if (k === "sessionBuilderPreselect" && v) lastPre = v.type || ""; return _set(k, v, ...r); };

console.log("\nTEST 1 - Library > At home, through the real router");
fixture("personal");
await go("library");
click(main.querySelector("#lib-start-session-btn")); await wait(60);
click(main.querySelector('[data-guided="home"]')); await wait(60);
const tiles = () => $$(".library-session-card[data-target]");
const found = tiles().map(b => ({ label: txt(b.querySelector(".library-session-label")), note: txt(b.querySelector(".library-session-note")),
                                  target: b.dataset.target, pre: b.dataset.preselectType || "" }));
ok("1pc. the At home tiles are on screen", found.length >= 4, found.map(f => f.label).join(" | "));
const dest = found.map(f => `${f.target}:${f.pre}`);
const dupes = dest.filter((d, i) => dest.indexOf(d) !== i);
ok("1a. no two tiles open the same thing", dupes.length === 0, dupes.join(", "));

// Each label, clicked, lands where it says.
const landed = [];
for (const f of found) {
  fixture("personal"); await go("library");
  click(main.querySelector("#lib-start-session-btn")); await wait(40);
  click(main.querySelector('[data-guided="home"]')); await wait(40);
  const b = tiles().find(x => txt(x.querySelector(".library-session-label")) === f.label);
  lastPre = "";
  store.set("requestedSessionType", null);
  click(b); await wait(80);
  landed.push({ ...f, view: router.currentView, preStored: lastPre || store.get("requestedSessionType") || "" });
}
const EXPECT = { "Full Body": ["coach-proposal", "full"], "Core": ["core-session", ""], "Upper body": ["coach-proposal", "upper"],
                 "Lower body": ["coach-proposal", "lower"], "Mobility": ["coach-proposal", "mobility"] };
const wrong = [];
for (const [label, [view, pre]] of Object.entries(EXPECT)) {
  const l = landed.find(x => x.label === label);
  if (!l) { wrong.push(`${label}: no tile`); continue; }
  if (l.view !== view || (pre && l.preStored !== pre)) wrong.push(`${label}: landed ${l.view} (${l.preStored || "no type"})`);
}
ok("1b. Full Body, Core, Upper body, Lower body and Mobility each land where they say", wrong.length === 0, wrong.join("; "));

console.log("\nTEST 2 - what the tiles promise");
const core = found.find(f => f.label === "Core");
ok("2a. Core says what the core session holds", !!core && /stability/i.test(core.note) && /gentle/i.test(core.note), core?.note);
ok("2b. no tile promises HIIT", !found.some(f => /HIIT|high intensity/i.test(f.label + " " + f.note)), found.map(f => f.label).join(", "));
const intoCore = landed.filter(l => l.view === "core-session").map(l => l.label);
ok("2c. only Core opens the core session", intoCore.length === 1 && intoCore[0] === "Core", intoCore.join(", "));
const types = new Set(SB.SESSION_TYPES.map(t => t.id));
const unknown = found.filter(f => f.pre && !types.has(f.pre)).map(f => `${f.label}:${f.pre}`);
ok("2d. every preselected type is one the builder has", unknown.length === 0, unknown.join(", "));

console.log("");
if (fails) { console.log(`LIBRARY-TILES: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`LIBRARY-TILES: all ${passes} assertions pass\n`);
process.exit(0);
