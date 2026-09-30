/**
 * tools/verify-short-sessions.mjs
 * 30 Sep 2026 v2
 *
 * v2 - session-builder v75. 3pc required that some warm-up be shortened
 *   at 10 minutes; the warm-up now CHOOSES moves that fit, so none needs
 *   shortening and 3pc found nothing to look at. Test 3 now checks the
 *   property itself: every warm-up and cool-down move at 10 minutes fits
 *   its share, or names its own length, or is counted in sets.
 *
 * W3-14 SHORT-SESSIONS (persona Wave 3: 2.16, the time-poor parent with
 * ten-minute windows). Measured on v603, 12 builds a length: "10 minutes"
 * built 15 to 18 minutes in every strength type at home and at the gym,
 * because the warm-up is a fixed five to nine minutes and the time step
 * trims only the main section, down to three moves. The Gym session was
 * 34 to 40 minutes at ANY length asked: its machine block (15 to 30
 * minutes) is exempt from trimming and, unlike Cardio's, had no rule
 * that it must leave room ("About 46 min" on a 30-minute plan).
 *
 *   1. Every type, every length offered (10 to 60), home and gym: the
 *      plan's "About N min" averages within 20% of the time asked, and
 *      no single plan is more than 30% over.
 *   2. The warm-up scales: at 10 minutes it is a few minutes, at 60 it is
 *      still a proper warm-up.
 *   3. A warm-up whose own words name its length is never shortened
 *      ("Easy jog: 3 minutes" stays three minutes); others never go
 *      below a minute.
 *   4. The Gym session takes a machine block only when it leaves room;
 *      short Gym sessions are the lifting.
 *   5. On the coach's screen, "I have 10 minutes" says about ten.
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
const SB = await import(B + "session-builder.js");
const { EXERCISES, isCardioMachine } = await import(B + "data/exercises/index.js");
const { AVAILABLE_TIME_WINDOW_MINUTES } = await import(B + "data/time-windows.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const HOME = ["dumbbells-light", "yoga-mat", "bands"];
const GYM = ["dumbbells-medium", "barbell", "bench-flat", "cable-machine", "treadmill", "bike", "rowing-machine", "kettlebell-medium", "gym-membership"];
function fresh(tier = "free") {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Sam");
}
const about = s => Number((String(s.duration).match(/\d+/) || [])[0]);
const sec = e => e.section || e.role || "main";
const mins = list => list.reduce((a, e) => a + SB.exerciseSeconds(e), 0) / 60;
const LENGTHS = [...new Set(Object.values(AVAILABLE_TIME_WINDOW_MINUTES))].sort((a, b) => a - b);
const RUNS = 8;

console.log(`\nTEST 1 - every type, every length (${LENGTHS.join(", ")}), home and gym`);
fresh();
const off = [], wild = [];
const warm = {};
let n = 0;
for (const [label, kit] of [["home", HOME], ["gym", GYM]]) for (const t of SB.SESSION_TYPES) for (const d of LENGTHS) {
  if (t.id === "gym" && label === "home") continue;
  const got = [];
  for (let i = 0; i < RUNS; i++) {
    let s; try { s = SB.buildSession({ sessionType: t.id, durationMins: d, equipmentOverride: kit }); } catch { continue; }
    if (!s || s.gentleCare) continue;
    n++; got.push(about(s));
    (warm[d] = warm[d] || []).push(mins(s.exercises.filter(e => sec(e) === "warmup")));
    if (about(s) > d * 1.3) wild.push(`${label} ${t.id} ${d}: ${about(s)}`);
  }
  if (!got.length) continue;
  const avg = got.reduce((a, b) => a + b, 0) / got.length;
  // Reviewed exception: at home, with no machine, Cardio runs out of
  // distinct moves past about 40 minutes (F5, 28 Sep); its plan then says
  // its true, shorter length. Logged in the schedule (W3-14), not hidden.
  const THIN = label === "home" && t.id === "cardio" && d >= 50;
  if (avg > d * 1.2 || (avg < d * 0.8 && !THIN)) off.push(`${label} ${t.id} ${d}: avg ${avg.toFixed(1)}`);
}
ok("1pc. plans built across the grid", n > 600, String(n));
ok("1a. every type and length averages within 20% of the time asked", off.length === 0, `${off.length}: ${off.slice(0, 8).join("; ")}`);
ok("1b. no plan is more than 30% over", wild.length === 0, `${wild.length}: ${wild.slice(0, 6).join("; ")}`);

console.log("\nTEST 2 - the warm-up scales with the time");
const avgW = d => warm[d].reduce((a, b) => a + b, 0) / warm[d].length;
ok("2a. at 10 minutes the warm-up averages 3 minutes or less", avgW(10) <= 3, avgW(10).toFixed(1));
ok("2b. at 60 minutes it is still a proper warm-up (4 minutes or more)", avgW(60) >= 4, avgW(60).toFixed(1));

console.log("\nTEST 3 - a warm-up that names its own length keeps it");
const NAMES = /\b\d+\s*(min|minute|sec|second)s?\b/i;
const words = e => [e.name, ...(e.instructions || []), e.description || "", ...(e.cues || [])].join(" ");
const libDur = Object.fromEntries(EXERCISES.map(e => [e.id, e.duration]));
const changedNamed = [], tooShort = [];
let shortened = 0, checked = 0;
const misfit = [];
fresh();
for (const t of SB.SESSION_TYPES) for (const kit of [HOME, GYM]) for (let i = 0; i < RUNS; i++) {
  if (t.id === "gym" && kit === HOME) continue;
  let s; try { s = SB.buildSession({ sessionType: t.id, durationMins: 10, equipmentOverride: kit }); } catch { continue; }
  for (const e of s.exercises.filter(x => sec(x) !== "main")) {
    checked++;
    const cap = Math.max(2, 10 * (sec(e) === "warmup" ? 0.2 : 0.15)) * 60;
    if (!(Number(e.duration) <= cap) && !NAMES.test(words(EXERCISES.find(x => x.id === e.id) || e)) && !(Number(e.sets) > 1)) misfit.push(`${e.id} ${e.duration}s`);
    const lib = EXERCISES.find(x => x.id === e.id);
    if (!lib || !(Number(libDur[e.id]) > 0) || e.duration === lib.duration) continue;
    shortened++;
    if (NAMES.test(words(lib))) changedNamed.push(e.id);
    if (Number(e.duration) < 60) tooShort.push(`${e.id} ${e.duration}s`);
  }
}
ok("3pc. warm-up and cool-down moves at 10 minutes were checked", checked > 50, String(checked));
ok("3c. every one fits its share, names its own length, or is counted in sets", misfit.length === 0, [...new Set(misfit)].slice(0, 6).join(", "));
ok("3a. none whose own words name its length", changedNamed.length === 0, [...new Set(changedNamed)].join(", "));
ok("3b. none below a minute", tooShort.length === 0, tooShort.slice(0, 5).join(", "));

console.log("\nTEST 4 - the Gym session's machine block leaves room");
fresh();
const blockAt = d => { let w = 0, k = 0; for (let i = 0; i < RUNS; i++) { const s = SB.buildSession({ sessionType: "gym", durationMins: d, equipmentOverride: GYM }); const b = s.exercises.find(e => e._feature); if (b) { k++; w = Math.max(w, SB.exerciseSeconds(b) / 60); } } return { k, w }; };
const b10 = blockAt(10), b30 = blockAt(30), b60 = blockAt(60);
ok("4a. 10 minutes: no machine block", b10.k === 0, JSON.stringify(b10));
ok("4b. 30 minutes: any block is 15 minutes or less", b30.w <= 15, JSON.stringify(b30));
ok("4c. control: 60 minutes still opens on a machine", b60.k > 0, JSON.stringify(b60));

console.log("\nTEST 5 - the coach's screen, 10 minutes");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const rtr = { navigate() {}, back() {}, history: [] };
globalThis.window.router = rtr;
const main = document.getElementById("main-content");
const said = [];
for (let i = 0; i < 6; i++) {
  fresh(i % 2 ? "personal" : "free");
  for (let k = 0; k < 5; k++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  store.set("homeEquipment", HOME); store.set("equipment", HOME); store.set("sessionLocation", "home");
  store.set("availableTime", "micro");
  store.set("lastCheckin", { date: new Date().toDateString(), completed: true, energy: 6 });
  main.innerHTML = ""; CoachProposalView(rtr).mount(main); await new Promise(r => setTimeout(r, 40));
  said.push(Number(((main.textContent || "").match(/About (\d+) min/) || [])[1] || 0));
}
ok("5a. the plan says about ten minutes (12 or less), every time", said.every(m => m > 0 && m <= 12), said.join(", "));

console.log("");
if (fails) { console.log(`SHORT-SESSIONS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SHORT-SESSIONS: all ${passes} assertions pass\n`);
process.exit(0);
