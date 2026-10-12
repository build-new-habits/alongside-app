/**
 * tools/verify-one-week.mjs
 * 12 Oct 2026 v1
 *
 * A-3 RETIRE-WEEKLY-PLAN (Stage AWARD), as narrowed on 12 Oct.
 *
 * Two week concepts lived side by side. The old weekly plan
 * (views/weekly-plan.js, store weeklyPlan, read by the coach's "You planned
 * a walk today" and by plannedFocusToday()) and Your week (D-6, weekShape,
 * the Plan's). On the Plan, Settings › Your plan › Your week opened the OLD
 * screen, while Home's tile opened the new one; and with Your week set, the
 * old plan's walk day could still lead the coach's plan above
 * "From your week".
 *
 * The old weekly plan is also FREE's only week tool (no tier check), and
 * Stage AWARD takes nothing from Free. So the rule is one week per tier:
 *   - on the Plan, every way to the week opens Your week (Settings row, and
 *     the old route itself redirects);
 *   - on the Plan, once Your week is set, the old plan is not read (no
 *     "You planned …", plannedFocusToday() gives nothing);
 *   - on Free, and on the Plan before Your week is set, nothing changes.
 *
 * Driven through the real SettingsView, CoachProposalView, WeeklyPlanView
 * and programmeEngine.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.confirm = () => false;
globalThis.confirm = () => false;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");
const WM = await import(B + "data/week-shape-model.js");
const { plannedFocusToday } = await import(B + "data/programmeEngine.js");
const { SettingsView } = await import(B + "views/settings.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { WeeklyPlanView } = await import(B + "views/weekly-plan.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const { settingsFind } = await import(new URL("./settings-open.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

const LONG = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const SHORT = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const longToday = LONG[new Date().getDay()];
const TODAY = WM.DAY_KEYS[(new Date().getDay() + 6) % 7];

const navs = [];
const rtr = { navigate: (v, o) => navs.push({ v, o }), back() {}, history: [], currentView: null };
globalThis.window.router = rtr;

function fixture({ tier = "personal", oldWalk = false, oldUpper = false, week = false } = {}) {
  localStorage.clear(); store.init(); gate.endGateSession();
  agreed(store);
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", tier);
  store.set("homeEquipment", ["band-light"]); store.set("sessionLocation", "home");
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  const key = new Date().toISOString().split("T")[0];
  store.set("checkinHistory", { [key]: { energy: 6, mood: 6, date: new Date().toDateString() } });
  if (oldWalk) store.set(`weeklyPlan.days.${longToday}`, { ...store.get(`weeklyPlan.days.${longToday}`), type: "gym", sessionType: "walk", enabled: true });
  if (oldUpper) store.set("activeProgramme.sessionSequence", [{ day: SHORT[new Date().getDay()], type: "upper", chosen: true, completed: false }]);
  if (week) {
    const days = Object.fromEntries(WM.DAY_KEYS.map(k => [k, "rest"]));
    days[TODAY] = "legs-day";
    store.set("weekShape", WM.sanitizeWeekShape({
      templates: { "legs-day": { id: "legs-day", name: "Legs day", mix: [{ focus: "legs", level: 2 }], intensity: "steady", mins: 30, place: "home" } },
      days, setAt: "2026-10-05" }));
  }
}

// ── 1. Settings › Your week ─────────────────────────────────────────────
console.log("\nTEST 1 - Settings › Your plan › Your week opens the week this tier has");
for (const [tier, want] of [["personal", "your-week"], ["free", "weekly-plan"]]) {
  fixture({ tier });
  main.innerHTML = ""; SettingsView(rtr).mount(main);
  const row = settingsFind(main, '[data-action="open-weekly-plan"], [data-go="your-week"]');
  ok(`1pc-${tier}. the row is there`, !!row);
  navs.length = 0; click(row);
  ok(`1a-${tier}. it opens ${want}`, navs.some(n => n.v === want), `navigated: ${JSON.stringify(navs.map(n => n.v))}`);
}

// ── 2. The old route on the Plan ────────────────────────────────────────
console.log("\nTEST 2 - the old weekly-plan route on the Plan lands on Your week");
fixture({ tier: "personal" });
navs.length = 0; main.innerHTML = "";
WeeklyPlanView(rtr).mount(main);
ok("2a. the Plan is sent to your-week, replacing the old screen", navs.some(n => n.v === "your-week" && n.o && n.o.replace), JSON.stringify(navs));
fixture({ tier: "free" });
navs.length = 0; main.innerHTML = "";
WeeklyPlanView(rtr).mount(main);
ok("2b. CONTROL: Free still gets the weekly plan", !navs.some(n => n.v === "your-week") && main.querySelector("button") !== null);

// ── 3. The coach's "You planned …" ──────────────────────────────────────
console.log("\nTEST 3 - an old walk day does not lead the plan once Your week is set");
function planText(opts) {
  fixture(opts);
  main.innerHTML = "";
  CoachProposalView(rtr).mount(main);
  return { planned: !!main.querySelector("#cp-planned-start"), text: txt(main) };
}
let r = planText({ tier: "personal", oldWalk: true, week: true });
ok("3a. Plan + Your week: no \"You planned a walk\"", !r.planned && !/You planned a walk/.test(r.text));
r = planText({ tier: "personal", oldWalk: true });
ok("3b. CONTROL: Plan with no Your week keeps the old lead", r.planned);
r = planText({ tier: "free", oldWalk: true });
// WEEK-DOORS has always been Plan-only (coach-proposal: premium ? _renderPlanned()).
ok("3c. CONTROL: Free, as before, has no planned lead", !r.planned);

// ── 4. plannedFocusToday() ──────────────────────────────────────────────
console.log("\nTEST 4 - plannedFocusToday() reads the old plan only when Your week is not set");
fixture({ tier: "personal", oldUpper: true, week: true });
ok("4a. Plan + Your week: nothing from the old sequence", plannedFocusToday() === null, String(plannedFocusToday()));
fixture({ tier: "personal", oldUpper: true });
ok("4b. CONTROL: Plan with no Your week: the chosen day as before", plannedFocusToday() === "upper", String(plannedFocusToday()));

// ── 5. What Settings says about the week is true ────────────────────────
// Found building A-3: nothing on Free reads the old plan (WEEK-DOORS and
// plannedFocusToday() are Plan-only), yet the line said "The coach uses this
// as its starting point each day".
console.log("\nTEST 5 - Settings says only what the week actually does");
function weekScreenText(tier, shaped) {
  fixture({ tier });
  if (shaped) store.set("weeklyPlan.updatedAt", "2026-10-01T09:00:00.000Z");
  main.innerHTML = ""; SettingsView(rtr).mount(main);
  const row = settingsFind(main, '[data-open="programme"]');
  click(row);
  return txt(main);
}
for (const shaped of [false, true]) {
  const t = weekScreenText("free", shaped);
  ok(`5a-${shaped ? "shaped" : "new"}. Free: no claim that the coach uses the week`, !/coach (uses|will ask|will use)|starting point/i.test(t), t.slice(0, 200));
  ok(`5b-${shaped ? "shaped" : "new"}. Free: says the coach builds each day from the check-in`, /from your check-in/i.test(t));
}
const tp = weekScreenText("personal", false);
ok("5c. Plan: the week line is about Your week and Home", /Home will show today/i.test(tp), tp.slice(0, 200));

console.log(`\nVERIFY-ONE-WEEK: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
