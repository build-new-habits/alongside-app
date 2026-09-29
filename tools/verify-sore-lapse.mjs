/**
 * tools/verify-sore-lapse.mjs
 * 29 Sep 2026 v1
 *
 * P13, SORE-BECOMES-CONDITION (persona finding W2-11). One "a little
 * sore" tap at check-in made a permanent listed area: it led every later
 * check-in and brought the red-flag screen back monthly. And pain scores
 * had no date, so yesterday's answer was read as today's.
 *
 * Driven through the real check-in conversation on consecutive days (a
 * fixed clock, moved forward), with the store reloaded as a phone would:
 *   1. a knee tapped once, then three quiet check-ins: it leaves the list;
 *   2. an area the person listed themselves does not lapse;
 *   3. a missed day starts the count again (the rule Schema.md has always
 *      stated for quietRun);
 *   4. yesterday's scores are not today's;
 *   5. once lapsed, the knee no longer brings the red-flag screen.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(0), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

// A clock the app reads through `new Date()` and Date.now(). Timers still
// run on real time.
const RealDate = Date;
let FIXED = new RealDate(2026, 8, 20, 9, 0, 0).getTime();
class FakeDate extends RealDate {
  constructor(...a) { if (a.length) super(...a); else super(FIXED); }
  static now() { return FIXED; }
}
globalThis.Date = FakeDate;
const nextDay = (n = 1) => { FIXED += n * 864e5; };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { CheckinView } = await import(B + "views/checkin.js");
const RF = await import(B + "data/red-flag.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms = 3000) {
  const t0 = RealDate.now();
  while (RealDate.now() - t0 < ms) { const v = fn(); if (v) return v; await wait(15); }
  return null;
}
const tappables = () => [...document.querySelectorAll("#app button, .ci-panel button")].filter(b => !b.disabled && !b.closest("[hidden]"));
async function tap(re) {
  const b = await waitFor(() => tappables().find(x => re.test(x.textContent.trim())));
  if (!b) return null;
  b.click(); await wait(30);
  return b.textContent.trim();
}

// The app opening on a new day: the store loads from storage, then a check-in.
async function checkIn(answers) {
  store.init();
  document.querySelectorAll(".ci-panel, .ci-overlay").forEach(n => n.remove());
  const app = document.getElementById("app"); app.innerHTML = "";
  const navs = [];
  CheckinView({ navigate: v => navs.push(v), back() {} }).mount(app);
  await tap(/^Okay$/); await tap(/^Okay$/);
  for (const a of answers) await tap(a);
  await waitFor(() => navs.length > 0, 4000);
  return navs.length > 0;
}
function fresh(conditions = [], meta = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "free");
  store.set("conditions", conditions); store.set("conditionMeta", meta);
  store.set("pendingDoorRoute", "coach-proposal");
}
const listed = id => (store.get("conditions") || []).includes(id);
const QUIET = [/^Nothing today$/];

// ── 1. TAPPED ONCE, THEN QUIET ──────────────────────────────────────────
console.log("\nTEST 1 - a knee tapped once leaves the list after three quiet check-ins");
fresh();
ok("1pc. the first check-in reached the plan", await checkIn([/^Knee$/, /^A little$/, /^That's it$/]));
ok("1pc2. the tap listed it, as coming from a check-in", listed("knee") && store.get("conditionMeta")?.knee?.source === "checkin", JSON.stringify(store.get("conditionMeta")?.knee));
for (let d = 1; d <= 2; d++) { nextDay(); await checkIn(QUIET); }
ok("1a. after two quiet check-ins it is still listed", listed("knee"));
nextDay(); await checkIn(QUIET);
const m = store.get("conditionMeta")?.knee || {};
ok("1b. after the third it has left the list", !listed("knee"), JSON.stringify(store.get("conditions")));
ok("1c. its record is kept, dormant, not deleted", m.status === "dormant" && !!m.dormantAt && m.source === "checkin", JSON.stringify(m));

// ── 2. THEIR OWN LIST DOES NOT LAPSE ────────────────────────────────────
console.log("\nTEST 2 - an area the person listed themselves stays");
fresh(["lower-back"], { "lower-back": { addedAt: "2026-09-01", source: "onboarding", status: "active" } });
for (let d = 0; d < 4; d++) { nextDay(); await checkIn(QUIET); }
ok("2a. four quiet check-ins later, still listed", listed("lower-back"), JSON.stringify(store.get("conditions")));

// ── 3. A MISSED DAY STARTS THE COUNT AGAIN ──────────────────────────────
console.log("\nTEST 3 - quiet days must run on, as Schema.md has always said");
fresh();
await checkIn([/^Knee$/, /^A little$/, /^That's it$/]);
nextDay(); await checkIn(QUIET);
nextDay(); await checkIn(QUIET);
nextDay(2); await checkIn(QUIET);
ok("3a. two quiet, a day missed, one quiet: still listed", listed("knee"));

// ── 4. YESTERDAY'S SCORES ARE NOT TODAY'S ───────────────────────────────
console.log("\nTEST 4 - a score belongs to the day it was given");
fresh(["lower-back"], { "lower-back": { addedAt: "2026-09-01", source: "onboarding", status: "active" } });
await checkIn([/^Lower Back$/i, /^Quite sore$/, /^That's it$/]);
ok("4pc. today's score is kept today", Number((store.get("conditionPainScores") || {})["lower-back"]) > 0);
store.init();
ok("4a. and survives the app reopening the same day", Number((store.get("conditionPainScores") || {})["lower-back"]) > 0);
nextDay(); store.init();
ok("4b. next day, before any check-in, it is not read as today's", !Number((store.get("conditionPainScores") || {})["lower-back"]), JSON.stringify(store.get("conditionPainScores")));

// ── 5. THE RED-FLAG SCREEN ──────────────────────────────────────────────
console.log("\nTEST 5 - once lapsed, the knee no longer brings the red-flag screen");
fresh();
await checkIn([/^Knee$/, /^A little$/, /^That's it$/]);
ok("5pc. while sore, it is a reported area", RF.reportedPainAreas().includes("knee"));
for (let d = 1; d <= 3; d++) { nextDay(); await checkIn(QUIET); }
ok("5a. after it lapses, it is not", !RF.reportedPainAreas().includes("knee") && !RF.redFlagDue(), JSON.stringify(RF.reportedPainAreas()));
store.set("conditionPainScores", { "lower-back": 0, notABodyArea: 7 });
ok("5b. a scored id that is not a body area never counts", !RF.reportedPainAreas().includes("notABodyArea"));

globalThis.Date = RealDate;
console.log("");
if (fails) { console.log(`SORE-LAPSE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SORE-LAPSE: all ${passes} assertions pass\n`);
process.exit(0);
