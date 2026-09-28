/**
 * tools/verify-plan-offers.mjs
 * 28 Sep 2026 v1
 *
 * SMOOTH-P2e. Two of Graeme's 28 Sep decisions, on the plan screen.
 *
 * GOOD-DAY. "The offer of suggestion should be there." A good day gets
 * the same plan (boom-and-bust is the documented risk for the fatigue
 * and perimenopause personas) and is OFFERED more, one tap. Never given.
 *
 * WEEK-DOORS. "I think maybe yes" -- to offering both. Measured on v547:
 * plan a walk for today and the coach proposes Full Body, because a walk
 * is not a type the coach builds and plannedFocusToday() falls back to
 * "strength". Now the plan leads with what they planned, and the coach's
 * session is underneath as the alternative.
 *
 * Driven through the real CoachProposalView.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="main-content"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const today = DAYS[new Date().getDay()];

function fixture({ tier = "personal", energy = 6, planned = null } = {}) {
  localStorage.clear(); store.init(); gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("homeEquipment", ["band-light"]); store.set("sessionLocation", "home");
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  const key = new Date().toISOString().split("T")[0];
  store.set("checkinHistory", { [key]: { energy, mood: 6, date: new Date().toDateString() } });
  if (planned) store.set(`weeklyPlan.days.${today}`, { ...store.get(`weeklyPlan.days.${today}`), type: "gym", sessionType: planned, enabled: true });
}
function mount() {
  const main = document.getElementById("main-content"); main.innerHTML = "";
  const navs = [];
  CoachProposalView({ navigate: v => navs.push(v), back() {} }).mount(main);
  return { main, navs };
}
const mainSets = main => [...main.querySelectorAll('.cp-plan__row[data-section="main"]')].map(r => Number(r.dataset.sets));

// ── 1. GOOD-DAY ─────────────────────────────────────────────────────────
console.log("\nTEST 1 - a good day is offered more, never given it");
fixture({ energy: 6 });
let { main } = mount();
const ordinarySets = mainSets(main);
ok("1pc. an ordinary day builds a plan to compare", ordinarySets.length > 0);
ok("1a. REVERSAL: an ordinary day is offered nothing", !main.querySelector("#cp-offer-more"));

fixture({ energy: 9 });
({ main } = mount());
const offer = main.querySelector("#cp-offer-more");
ok("1b. a good day (\"Full of it\") is offered more", !!offer && /you said/i.test(txt(main.querySelector(".cp-offer"))), txt(main.querySelector(".cp-offer")));
const before = mainSets(main);
ok("1c. and nothing is added until they say so (Harder is not already on)", before.length > 0 &&
   main.querySelector('[data-different="harder"]')?.getAttribute("aria-pressed") === "false");
offer?.click();
const after = mainSets(main);
ok("1d. one tap adds a set to each main exercise", after.length === before.length && after.every((s, i) => s === before[i] + 1),
   `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
ok("1e. and the offer is not made again once taken", !main.querySelector("#cp-offer-more"));
fixture({ energy: 9, tier: "free" });
({ main } = mount());
ok("1f. free gets the simple plan, no offer", !main.querySelector("#cp-offer-more"));

// ── 2. WEEK-DOORS ───────────────────────────────────────────────────────
console.log("\nTEST 2 - a planned walk, run, swim, cycle, yoga or mindfulness day leads with that");
const ROUTES = { walk: "walk-session", run: "running-session", swim: "swim-session",
                 cycle: "cycle-session", yoga: "yoga-session", mindfulness: "quiet-session" };
for (const [kind, route] of Object.entries(ROUTES)) {
  fixture({ planned: kind });
  let navs;
  ({ main, navs } = mount());
  const lead = main.querySelector(".cp-planned");
  const go = main.querySelector("#cp-planned-start");
  ok(`2. ${kind}: the plan leads with what they planned`, !!lead && new RegExp(`planned`, "i").test(txt(lead)) &&
     main.innerHTML.indexOf("cp-planned") < main.innerHTML.indexOf("cp-plan__title"), txt(lead));
  go?.click();
  ok(`2. ${kind}: one tap starts it`, navs.includes(route), JSON.stringify(navs));
}
fixture({ planned: "walk" });
({ main } = mount());
ok("2b. and the coach's session is still there, as the alternative", main.querySelectorAll(".cp-plan__row").length > 0 &&
   /or the coach/i.test(txt(main.querySelector(".cp-planned"))));
fixture({ planned: "core" });
({ main } = mount());
ok("2c. REVERSAL: a planned session the coach builds (core) is just the plan", !main.querySelector(".cp-planned"));
fixture({ planned: null });
({ main } = mount());
ok("2d. REVERSAL: nothing planned, nothing offered", !main.querySelector(".cp-planned"));

console.log("");
if (fails) { console.log(`PLAN-OFFERS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PLAN-OFFERS: all ${passes} assertions pass\n`);
process.exit(0);
