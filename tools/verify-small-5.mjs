/**
 * tools/verify-small-5.mjs
 * 03 Oct 2026 v1
 *
 * W5-21 SMALL-5 (Wave 5 persona trace: 2.4, 2.11, 2.13, 2.14, 2.1). One
 * assertion each, through the real views and store:
 *
 *   1. Every journal entry can be read (only the newest three could, and
 *      each was cut at 120 characters).
 *   2. A finished mindful practice counts its minutes (it counted 0).
 *   3. Reset display to defaults keeps Vibration as it was (it turned it on).
 *   4. Restore keeps "</3" in the journal (it became "‹/3"), and still lets
 *      no tag through.
 *   5. A breathing practice says it buzzes, with Vibration on.
 *   6. Mostly the same: the check-in opener does not change with the
 *      weekday and hour.
 *   7. One gentle plan a day, whichever door builds it (20 and 30 minutes).
 *   8. The update check-in starts from today's answers (it started at 5).
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
const until = async (fn, ms = 8000) => { const t = Date.now(); while (Date.now() - t < ms) { const v = fn(); if (v) return v; await wait(10); } return null; };

function person(extra = {}) {
  localStorage.clear(); store.init(); agreed(store); gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Lee"); store.set("tier", "free");
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  for (const [k, v] of Object.entries(extra)) store.set(k, v);
}
const ago = d => new Date(Date.now() - d * 86400000).toISOString();

// ── 1. JOURNAL ──────────────────────────────────────────────────────────
console.log("\nTEST 1 - every journal entry can be read");
const long = "A long entry. ".repeat(20) + "THE-END";
person({ journalEntries: [1, 2, 3, 4, 5].map(i => ({ id: "j" + i, date: ago(i), text: i === 5 ? long : `Entry number ${i}` })) });
const N = await import(B + "views/noticing.js");
main.innerHTML = N.render(); N.onMount();
click($("#journal-show-all")); await wait(10);
const shown = [1, 2, 3, 4].filter(i => txt(main).includes(`Entry number ${i}`)).length + (txt(main).includes("THE-END") ? 1 : 0);
ok("1a. all five readable, in full", shown === 5, `${shown} of 5 | button: ${txt($("#journal-show-all"))}`);

// ── 2. MINDFUL MINUTES ──────────────────────────────────────────────────
console.log("\nTEST 2 - a finished mindful practice counts its minutes");
person();
const QS = await import(B + "views/quiet-session.js");
main.innerHTML = QS.render(); QS.onMount();
click($('[data-mode="mindful"]')); await wait(20);
click($('.quiet-duration-btn[data-duration="5"]')); await wait(5);
const realSI = globalThis.setInterval;
globalThis.setInterval = dom.window.setInterval = (fn) => realSI(fn, 0);
click($("#quiet-mindful-start-btn"));
const done = await until(() => (store.get("activityLog") || []).find(a => a.type === "mindful" && a.status === "completed"), 20000);
globalThis.setInterval = dom.window.setInterval = realSI;
QS.onUnmount?.();
ok("2a. five minutes recorded, not 0", done && Number(done.durationMins) === 5, JSON.stringify(done && { durationMins: done.durationMins }));

// ── 3. RESET DISPLAY ────────────────────────────────────────────────────
console.log("\nTEST 3 - Reset display keeps Vibration");
const DP = await import(B + "display-prefs.js");
DP.setDisplayPref("vibration", "off"); DP.setDisplayPref("textSize", "120");
DP.resetDisplayPrefs();
ok("3a. Vibration stays off", DP.getDisplayPref("vibration") === "off", DP.getDisplayPref("vibration"));
DP.setDisplayPref("vibration", "on");

// ── 4. RESTORE ──────────────────────────────────────────────────────────
console.log("\nTEST 4 - Restore keeps the journal as written");
person();
const RS = await import(B + "data/restore.js");
const fileStore = JSON.parse(JSON.stringify(store.data));
fileStore.journalEntries = [{ id: "r1", date: ago(1), text: "</3 <sigh> long day" }];
RS.applyRestore({ store: fileStore, exportedAt: new Date().toISOString() });
const back = (store.get("journalEntries") || [])[0]?.text;
ok("4a. \"</3\" comes back as written, and no tag can open", /^<\/3 /.test(back || "") && /sigh/.test(back || "") && !/<\s*[a-zA-Z!?]|<\s*\/\s*[a-zA-Z]/.test(back || ""), back);
main.innerHTML = N.render(); N.onMount();
ok("4b. and Wellbeing shows it as text", txt(main).includes("</3") && !main.querySelector("sigh"), txt(main).slice(0, 80));

// ── 5. BREATHING SAYS IT BUZZES ─────────────────────────────────────────
console.log("\nTEST 5 - a breathing practice says it buzzes");
person();
const BS = await import(B + "views/breathing-session.js");
BS.startBreathing("box", 3);
const bsHtml = BS.render();
ok("5a. with Vibration on, it says so on the practice screen", /buzzes/.test(bsHtml) && /Vibration/.test(bsHtml));
DP.setDisplayPref("vibration", "off");
ok("5b. with it off, it does not", !/buzzes/.test(BS.render()));
DP.setDisplayPref("vibration", "on");

// ── 6. MOSTLY THE SAME OPENER ───────────────────────────────────────────
console.log("\nTEST 6 - Mostly the same: the opener does not follow the clock");
const CO = await import(B + "data/checkin-openings.js");
const hist = {}; for (let i = 1; i < 10; i++) hist[store._localDay(new Date(Date.now() - i * 86400000))] = { energy: 6, mood: 6 };
const lines = new Set();
const gH = Date.prototype.getHours, gD = Date.prototype.getDay, gM = Date.prototype.getMonth;
for (const [d, h, m] of [[1, 8, 9], [6, 9, 9], [4, 19, 10], [0, 18, 10], [3, 13, 0], [5, 7, 6]]) {
  person({ checkinHistory: hist, sessionVariety: "familiar" });
  Date.prototype.getHours = function () { return h; }; Date.prototype.getDay = function () { return d; }; Date.prototype.getMonth = function () { return m; };
  try { lines.add(CO.resolveOpening()?.b1); } finally { Date.prototype.getHours = gH; Date.prototype.getDay = gD; Date.prototype.getMonth = gM; }
}
ok("6a. one line across six days and hours", lines.size === 1 && ![...lines].some(l => /days since/.test(l || "")), [...lines].join(" | "));

// ── 7. ONE GENTLE PLAN A DAY ────────────────────────────────────────────
console.log("\nTEST 7 - one gentle plan a day, whichever door");
const SB = await import(B + "session-builder.js");
person({ conditions: ["knee"], conditionPainScores: { knee: 8 }, availableTime: "short", redFlag: { screenedAt: new Date().toISOString(), areas: ["knee"], textVersion: RF.RED_FLAG_VERSION, level: null, flaggedAt: null, clearedAt: null } });
const shape = s => (s?.exercises || []).map(e => `${e.id}:${e.duration || ""}:${e.sets || ""}`).join(",") + `|${s?.duration}`;
const fromBuilder = SB.buildSession({ sessionType: "full", durationMins: 20 });
const fromCoach   = SB.buildSession({ sessionType: "full", durationMins: 30 });
ok("7pc. both are the gentle plan", fromBuilder?.gentleCare && fromCoach?.gentleCare);
ok("7a. the same plan from both doors", shape(fromBuilder) === shape(fromCoach), `${shape(fromBuilder)} vs ${shape(fromCoach)}`);

// ── 8. THE UPDATE CHECK-IN ──────────────────────────────────────────────
console.log("\nTEST 8 - the update check-in starts from today's answers");
person();
const CK = await import(B + "data/checkin.js");
CK.saveCheckin({ energy: 6, mood: 7 });
const CM = await import(B + "views/checkin-mini.js");
main.innerHTML = CM.render(); CM.onMount();
const e8 = $("#mini-energy-slider")?.value;
click($("#mini-next-btn")); await wait(10);
const m8 = $("#mini-mood-slider")?.value;
ok("8a. energy and mood start at this morning's 6 and 7, not 5", e8 === "6" && m8 === "7", `${e8} / ${m8}`);

console.log("");
if (fails) { console.log(`SMALL-5: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SMALL-5: all ${passes} assertions pass\n`);
process.exit(0);
