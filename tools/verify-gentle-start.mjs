/**
 * tools/verify-gentle-start.mjs
 * 30 Sep 2026 v1
 *
 * W3-7 GENTLE-NOOP (Wave 3, persona 2.13). After a week or more away the
 * coach offers a gentler start, and taking it says "A notch gentler today,
 * as you chose, and we build from there." -- over an unchanged plan.
 * getReEntryIntensity() speaks the programme's scale (gentle / moderate /
 * challenging) and stores "gentle"; the builder's _todayIntensity() reads
 * only low / moderate / high, so "gentle" was read as nothing. In 30
 * builds each, gentle averaged 18.4 exercises, moderate 18.0, low 14.0.
 *
 *   1. Through the real coach screen: back after two weeks, "Life got
 *      full", "Yes, ease me back in": the plan is at least a fifth
 *      shorter than the same screen without it, averaged over mounts
 *      (a gentle plan keeps its moves and trims sets and minutes).
 *   2. The builder reads the programme's words as its own: gentle builds
 *      as low, challenging as high.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

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

const R = new URL("../", import.meta.url);
const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const rtr = { navigate() {}, back() {}, history: [] };
globalThis.window.router = rtr;
Object.defineProperty(globalThis, "router", { value: rtr, configurable: true, writable: true });

// Local calendar times, as the person lives them.
const at = (daysAgo, hour) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(hour, 0, 0, 0); return d.toISOString(); };
const nowHour = new Date().getHours();
const todayEarlier = at(0, Math.max(0, nowHour - 1));
function fixture(tier, log) {
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("equipment", ["dumbbells-light"]); store.set("homeEquipment", ["dumbbells-light"]);
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  store.set("activityLog", log.map((e, i) => ({ id: "e" + i, status: "completed", ...e, date: e.completedAt })));
}


const DOOR = /Anything you.d like me to know about the last little while/;
async function plan() { main.innerHTML = ""; CoachProposalView(rtr).mount(main); await wait(40); return txt(main); }
const click = sel => { const b = main.querySelector(sel); b?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); return !!b; };

const SB = await import(B + "session-builder.js");
const rows = () => main.querySelectorAll(".cp-plan__row").length;
const minutes = () => Number((txt(main).match(/About (\d+) min/) || [])[1] || 0);
async function planSize(accept) {
  fixture("free", [{ type: "workout", sessionType: "full", completedAt: at(15, 18) }]);
  store.set("availableTime", "standard");
  await plan();
  click('[data-return-context="life"]'); await wait(30);
  if (accept) { click('[data-gentler="yes"]'); await wait(30); }
  else { click('[data-gentler="no"]'); await wait(30); }
  return { n: rows(), m: minutes(), said: txt(main), stored: store.get("todayIntensity") };
}

console.log("\nTEST 1 - taking the gentler start makes the plan gentler");
const RUNS = 12;
let withIt = 0, without = 0, said = "", nWith = 0, nWithout = 0;
for (let i = 0; i < RUNS; i++) { const a = await planSize(true); withIt += a.m; nWith += a.n; said = a.said; }
for (let i = 0; i < RUNS; i++) { const b = await planSize(false); without += b.m; nWithout += b.n; }
ok("1pc. the gentler start was offered and taken", /A notch gentler today, as you chose/.test(said), said.slice(0, 200));
ok("1pc2. both plans have rows and a length", nWith > 0 && nWithout > 0 && withIt > 0 && without > 0, `${nWith} / ${nWithout} rows`);
ok("1a. the plan is gentler with it: at least a fifth shorter", withIt < without * 0.8, `with about ${(withIt / RUNS).toFixed(0)} min, without ${(without / RUNS).toFixed(0)} min`);

console.log("\nTEST 2 - the builder reads the programme's words");
function avg(v) {
  store.set("todayIntensity", v);
  let n = 0; for (let i = 0; i < 20; i++) n += SB.buildSession({ sessionType: "full", durationMins: 45, equipmentOverride: ["dumbbells-light"] }).exercises.length;
  return n / 20;
}
fixture("free", []);
const g = avg("gentle"), l = avg("low"), m = avg("moderate");
ok("2a. gentle builds like low, not like moderate", Math.abs(g - l) < Math.abs(g - m), `gentle ${g}, low ${l}, moderate ${m}`);

console.log("");
if (fails) { console.log(`GENTLE-START: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`GENTLE-START: all ${passes} assertions pass\n`);
process.exit(0);
