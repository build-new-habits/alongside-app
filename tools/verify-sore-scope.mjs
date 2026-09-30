/**
 * tools/verify-sore-scope.mjs
 * 30 Sep 2026 v1
 *
 * W3-4 SORE-SCOPE (Wave 3: personas 2.4, 2.11, 2.12, 2.13, 2.15). What the
 * app keeps about a sore area drifted towards tracking an injury:
 *   - one "A little" tap stayed listed for weeks: it lapsed only after
 *     three check-ins on CONSECUTIVE days, which an irregular user never
 *     gives;
 *   - while listed it brought the red-flag screen (bladder, bowel, groin)
 *     on a day the person had just said "Nothing today";
 *   - every finish asked "Better / About the same / Worse than usual" and
 *     stored it -- a pain record session by session;
 *   - "Quite sore" came back as "(6/10)", a number nobody gave;
 *   - Perimenopause was offered first under "Anything sore today?".
 * Schema v1.82 records the three semantics.
 *
 *   1. A tapped area lapses after three quiet check-ins however far apart;
 *      a check-in that names it again starts the count again.
 *   2. The red-flag screen counts a check-in area only on a sore day; an
 *      area the person listed themselves still counts.
 *   3. The check-in offers body areas only.
 *   4. The coach's plan shows no score out of ten.
 *   5. The finish asks about pain only when something is sore today.
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
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const Reflect = await import(B + "views/reflect.js");

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

function panelLabels() { return tappables().map(b => b.textContent.trim()); }

console.log("\nTEST 1 - three quiet check-ins, however far apart");
fresh();
await checkIn([/^Knee$/, /^A little$/, /^That's it$/]);
ok("1pc. the tap listed it from a check-in", listed("knee") && store.get("conditionMeta")?.knee?.source === "checkin");
nextDay(2); await checkIn(QUIET);
nextDay(3); await checkIn(QUIET);
ok("1a. two quiet check-ins, days apart: still listed", listed("knee"));
nextDay(4); await checkIn(QUIET);
ok("1b. the third, days later: it has left the list", !listed("knee"), JSON.stringify(store.get("conditions")));
fresh();
await checkIn([/^Knee$/, /^A little$/, /^That's it$/]);
nextDay(2); await checkIn(QUIET);
nextDay(2); await checkIn([/^Knee$/, /^A little$/, /^That's it$/]);
nextDay(2); await checkIn(QUIET);
nextDay(2); await checkIn(QUIET);
ok("1c. naming it again starts the count again", listed("knee"));

console.log("\nTEST 2 - the red-flag screen on a quiet day");
fresh();
await checkIn([/^Knee$/, /^A little$/, /^That's it$/]);
ok("2pc. the day it is sore, it counts", RF.reportedPainAreas().includes("knee"));
nextDay(); await checkIn(QUIET);
ok("2a. next day, Nothing today: it does not count, and the screen is not due", !RF.reportedPainAreas().includes("knee") && !RF.redFlagDue(), JSON.stringify(RF.reportedPainAreas()));
fresh(["lower-back"], { "lower-back": { addedAt: "2026-09-01", source: "onboarding", status: "active" } });
await checkIn(QUIET);
ok("2b. control: an area they listed themselves still counts", RF.reportedPainAreas().includes("lower-back"));

console.log("\nTEST 3 - the check-in offers body areas only");
fresh(["perimenopause", "knee"], { perimenopause: { source: "onboarding", status: "active" }, knee: { source: "onboarding", status: "active" } });
store.init();
document.querySelectorAll(".ci-panel, .ci-overlay").forEach(n => n.remove());
const app3 = document.getElementById("app"); app3.innerHTML = "";
CheckinView({ navigate() {}, back() {} }).mount(app3);
await tap(/^Okay$/); await tap(/^Okay$/);
const labels = await waitFor(() => { const l = panelLabels(); return l.includes("Nothing today") ? l : null; });
ok("3pc. the sore question is showing", !!labels, JSON.stringify(panelLabels()));
ok("3a. Knee is offered", (labels || []).includes("Knee"), JSON.stringify(labels));
ok("3b. Perimenopause is not", !(labels || []).some(l => /menopause/i.test(l)), JSON.stringify(labels));

console.log("\nTEST 4 - no score out of ten on the plan");
fresh(["knee", "lower-back"], {});
store.set("conditionPainScores", { knee: 6, "lower-back": 8 });
store.set("conditionPainScoresOn", store._localDay());
const app4 = document.getElementById("app"); app4.innerHTML = "";
CoachProposalView({ navigate() {}, back() {}, history: [] }).mount(app4);
await wait(50);
app4.querySelector('[data-severe-choice="adapt"]')?.click(); await wait(50);
ok("4pc. the plan's lines name the areas", /Knee|Lower Back/.test(app4.textContent), app4.textContent.slice(0, 200));
ok("4a. no /10 anywhere", !/\/10/.test(app4.textContent), (app4.textContent.match(/.{30}\/10.{10}/) || [""])[0]);

console.log("\nTEST 5 - the finish asks about pain only on a sore day");
fresh(["lower-back"], { "lower-back": { source: "onboarding", status: "active" } });
store.set("conditionPainScores", {});
store.set("currentActivityEntry", store.logActivity({ type: "walk", completedAt: new Date().toISOString(), status: "completed" }));
ok("5a. nothing sore today: no pain question", !/Any pain or discomfort/.test(Reflect.render()));
store.set("conditionPainScores", { "lower-back": 4 });
store.set("conditionPainScoresOn", store._localDay());
ok("5b. sore today: the question is there", /Any pain or discomfort/.test(Reflect.render()));

console.log("");
if (fails) { console.log(`SORE-SCOPE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SORE-SCOPE: all ${passes} assertions pass\n`);
process.exit(0);
