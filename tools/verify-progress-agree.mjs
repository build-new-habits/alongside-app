/**
 * tools/verify-progress-agree.mjs
 * 30 Sep 2026 v3
 *
 * v3 - W3-20 TRUE-WORDS. 1d protects that the coach line agrees with the count.
 *   It also required ", mostly", which is now said only when one kind is
 *   more than half; the count is what is checked.
 *
 * 29 Sep 2026 v2
 *
 * v2 - P0, SCOPE-MINOR. Test 2 inverted. "What you've told me about"
 *   charted each sore area week by week; charting an injury over time is
 *   monitoring it, so the section is gone. The gate now requires that it
 *   stays gone, on the Plan with sore areas and history present.
 *
 * 28 Sep 2026 v1
 *
 * SMOOTH-P4a. Progress, with the arc (Plan) and without (free). Spec 4.8.
 *
 * Measured on v551: Plan Progress had no arc on it at all -- the aim,
 * the strands, what the person had said about their knee, what their
 * logged weights showed: none of it. Free saw a fortnight with 30 and 90
 * padlocked beside it. And the Home arc chip opened a different screen
 * from the one the spec reads the arc back on.
 *
 * Driven through the real ProgressView and the real read-back functions.
 * The spec's acceptance: one sessions number (both tiers, the chart);
 * condition text never uses a judgement word (reversal: inject one and
 * the scan catches it); no weight card unless weight tracking is on; a
 * strand is never shown with a count.
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
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { ProgressView } = await import(B + "views/progress.js");
const { TodayView } = await import(B + "views/today.js");
const RB = await import(B + "data/arc-readback.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const router = { navigate: v => navs.push(v), history: [], back() {} };

const D = 86400000, NOW = Date.now();
const iso = daysAgo => new Date(NOW - daysAgo * D).toISOString();
const key = daysAgo => RB.dayKey(NOW - daysAgo * D);

const LOG = [
  { id: "c1", type: "workout",   sessionType: "lower", completedAt: iso(1),  durationMins: 30 },
  { id: "c2", type: "freestyle", completedAt: iso(3),  durationMins: 40, exercisesCount: 3, setsDone: 9 },
  { id: "c3", type: "class",     sessionType: "class", completedAt: iso(8),  durationMins: 15 },
  { id: "c4", type: "workout",   sessionType: "lower", completedAt: iso(12), durationMins: 30 },
  { id: "c5", type: "walk-session", completedAt: iso(20), durationMins: 25 },
  { id: "p1", type: "workout",   status: "partial", completedAt: iso(2), durationMins: 5 },
  { id: "p2", type: "workout",   status: "partial", completedAt: iso(9), durationMins: 3 },
  { id: "o1", type: "workout",   sessionType: "core", completedAt: iso(40), durationMins: 30 },
  { id: "o2", type: "workout",   sessionType: "core", completedAt: iso(55), durationMins: 30 },
  { id: "o3", type: "workout",   sessionType: "core", completedAt: iso(80), durationMins: 30 },
];

function fixture({ tier = "personal", weightTracking = false, arc = null, history = {}, conditions = [], meta = {}, liftLog = {} } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", tier); store.set("name", "Test");
  store.set("activityLog", LOG);
  store.set("weightTracking", weightTracking);
  if (weightTracking) store.set("weightLog", [{ at: iso(3), kg: 80 }]);
  if (arc) store.set("arc", arc);
  store.set("checkinHistory", history); store.set("conditions", conditions); store.set("conditionMeta", meta);
  store.set("liftLog", liftLog);
  navs = [];
}
function progress() { main.innerHTML = ""; const v = ProgressView(router); v.mount(main); return main; }
const number = () => Number(txt(main.querySelector(".progress-summary__number")));

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - both tiers render, and the fixture has partials in it");
fixture(); progress();
ok("0a. Plan Progress renders", !!main.querySelector(".progress-view"));
ok("0b. the fixture holds partials that must not count", LOG.filter(e => e.status === "partial").length === 2);

// ── 1. ONE SESSIONS NUMBER ──────────────────────────────────────────────
console.log("\nTEST 1 - one sessions number, from completedSessions() only");
const truth = days => store.completedSessions(LOG).filter(e => NOW - new Date(e.completedAt) < days * D).length;
fixture(); progress();
const plan30 = number();
ok("1a. Plan, 30 days: the completed sessions -- freestyle and a class included, partials not", plan30 === truth(30) && plan30 === 5, `${plan30} vs ${truth(30)}`);
main.querySelector('[data-window="90"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("1b. Plan, 90 days", number() === truth(90) && number() === 8, String(number()));
fixture({ tier: "free" }); progress();
ok("1c. free, 30 days: the same number as the Plan", number() === plan30);
ok("1d. the coach line agrees with it", new RegExp(`You've moved ${plan30} times in the last 30 days[,.]`).test(txt(main.querySelector(".progress-narrative"))),
   txt(main.querySelector(".progress-narrative")));
const weeks = RB.lastWeeks(6, new Date(NOW));
const inSix = store.completedSessions(LOG).filter(e => new Date(e.completedAt) >= weeks[0].start).length;
ok("1e. the six-week chart says the same total as the log", new RegExp(`^${inSix} sessions over the last six weeks`).test(txt(main.querySelector("#pr-sessions-cap"))),
   txt(main.querySelector("#pr-sessions-cap")));
const bars = RB.sessionsByWeek(store.completedSessions(LOG), { weeks: 6, now: new Date(NOW) });
ok("1f. and its bars add up to it", bars.reduce((n, b) => n + b.total, 0) === inSix);
ok("1g. REVERSAL: counted with partials it would not agree", LOG.filter(e => new Date(e.completedAt) >= weeks[0].start).length !== inSix);

// ── 2. CONDITIONS ───────────────────────────────────────────────────────
console.log("\nTEST 2 - P0: no chart of a sore area over time");
const hist = {};
// This week: 3 check-ins, knee on 1. When they started (5 weeks back): 5 check-ins, knee on 4.
const thisMon = RB.weekStart(new Date(NOW));
// As many of this week's days as have happened, up to three (a Monday has one).
const daysSoFar = Math.min(3, Math.floor((NOW - thisMon.getTime()) / D) + 1);
const dThis = Array.from({ length: daysSoFar }, (_, i) => new Date(thisMon.getTime() + i * D + 60000));
const startWeek = new Date(thisMon.getTime() - 5 * 7 * D);
dThis.forEach((d, i) => { hist[RB.dayKey(d)] = { energy: 6, mood: 6, conditionLevels: i === 0 ? { knee: 4 } : {} }; });
for (let i = 0; i < 5; i++) hist[RB.dayKey(startWeek.getTime() + i * D + 12 * 3600000)] = { energy: 5, mood: 5, conditionLevels: i < 4 ? { knee: 6 } : {} };
const metaK = { knee: { addedAt: RB.dayKey(startWeek), status: "active" }, "lower-back": { addedAt: RB.dayKey(startWeek), status: "active" } };
fixture({ conditions: ["knee", "lower-back", "anxiety"], history: hist, meta: metaK });
progress();
ok("2pc. positive control: the Plan read-back rendered, with sore areas and weeks of check-ins in the store",
   !!main.querySelector("#pr-arc-h") && Object.keys(hist).length >= 6);
ok("2a. no \"What you've told me about\" section", !main.querySelector('[aria-labelledby="pr-told-h"], #pr-told-h, .pr-condition'));
ok("2b. and no sentence anywhere on Progress tracks a sore area", !/mentioned on \d+ of|when you started\.|It isn’t a diagnosis/i.test(txt(main)), txt(main).slice(0, 160));

// ── 3. WEIGHT ───────────────────────────────────────────────────────────
console.log("\nTEST 3 - no weight card unless weight tracking is on");
fixture({ weightTracking: false }); progress();
ok("3a. Plan, tracking off: not in the DOM", !main.querySelector(".progress-weight"));
fixture({ tier: "free", weightTracking: false }); progress();
ok("3b. free, tracking off: not in the DOM", !main.querySelector(".progress-weight"));
fixture({ weightTracking: true }); progress();
ok("3c. REVERSAL: Plan, tracking on: there", !!main.querySelector(".progress-weight"));

// ── 4. STRANDS: A DATE, NEVER A COUNT ───────────────────────────────────
console.log("\nTEST 4 - what your arc works on: a date, never a count");
const ARC = { active: true, aimId: "floor-unaided", strands: ["leg-strength", "trunk-strength", "hip-range"],
  startedAt: iso(20), zonesWorked: { hips: key(3) }, typesWorked: { lower: key(1), core: key(25) } };
fixture({ arc: ARC }); progress();
const rows = [...main.querySelectorAll(".pr-strand")].map(li => [txt(li.querySelector(".pr-strand__name")), txt(li.querySelector(".pr-strand__when"))]);
ok("4pc. positive control: three strands", rows.length === 3, JSON.stringify(rows));
ok("4a. each is a date or Not yet", rows.every(([, w]) => /^(Worked (today|yesterday|\d+ days ago|on \d+ \w+)|Not yet)$/.test(w)), JSON.stringify(rows));
ok("4b. no strand carries a count", rows.every(([, w]) => !/\b(times?|sessions?|×|x\d)\b/i.test(w)));
ok("4c. core worked BEFORE the arc began does not light Trunk strength (ARC-COVERAGE)", rows.find(r => r[0] === "Trunk strength")?.[1] === "Not yet");
ok("4d. Leg strength from yesterday's lower session", rows.find(r => r[0] === "Leg strength")?.[1] === "Worked yesterday");
ok("4e. the arc's heading and aim", /^Your arc · week \d+$/.test(txt(main.querySelector("#pr-arc-h"))) && /Working towards “/.test(txt(main.querySelector(".pr-aim"))));
ok("4f. one coach sentence, and it is true", txt(main.querySelector(".pr-coach")) === "Leg strength came up most recently, yesterday.", txt(main.querySelector(".pr-coach")));
navs = []; main.querySelector(".pr-change")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
ok("4g. Change my arc", navs[0] === "stretch-arc");

// ── 5. LOGGED WEIGHTS ───────────────────────────────────────────────────
console.log("\nTEST 5 - from your logged weights: first and latest, facts only");
const L = { "barbell-bench-press": [{ at: iso(30), weight: 30, unit: "kg", reps: 10 }, { at: iso(10), weight: 35, unit: "kg" }, { at: iso(2), weight: 40, unit: "kg", reps: 8 }],
            "goblet-squat": [{ at: iso(5), weight: 16, unit: "kg" }] };
fixture({ liftLog: L }); progress();
const lifts = [...main.querySelectorAll(".pr-lift")].map(txt);
ok("5a. first → latest", lifts.length === 1 && /Barbell Bench Press 30 kg → 40 kg/.test(lifts[0]), JSON.stringify(lifts));
ok("5b. one entry only is not shown", !lifts.some(l => /Goblet/i.test(l)));
ok("5c. no judgement words on it", !RB.BANNED_WORDS.test(txt(main.querySelector('[aria-labelledby="pr-lifts-h"]'))) &&
   !/\b(up|down|more|less|stronger|weaker)\b/i.test(lifts.join(" ")));

// ── 6. FREE ─────────────────────────────────────────────────────────────
console.log("\nTEST 6 - free: 30 days, nothing locked, the Plan card last");
fixture({ tier: "free", arc: ARC, conditions: ["knee"], history: hist, meta: metaK, liftLog: L }); progress();
ok("6a. no padlocks, no locked tabs", !main.querySelector(".progress-tab--locked") && !/🔒/.test(main.innerHTML));
ok("6b. no arc read-back on free (the Plan's)", !main.querySelector("#pr-arc-h, #pr-told-h, #pr-lifts-h, #pr-strands-h"));
const last = [...main.querySelectorAll(".progress-body > *")].at(-1);
ok("6c. the quiet Plan card is last, and routes to what the Plan adds", last?.classList.contains("pr-plan-card") &&
   last.querySelector('[data-route="upgrade"]') && /What the Plan adds/.test(txt(last)));
fixture(); progress();
ok("6d. REVERSAL: the Plan does not get the Plan card", !main.querySelector(".pr-plan-card"));

// ── 7. HEADINGS ─────────────────────────────────────────────────────────
console.log("\nTEST 7 - read by heading");
fixture({ arc: ARC, conditions: ["knee"], history: hist, meta: metaK, liftLog: L }); progress();
const heads = [...main.querySelectorAll("h1,h2,h3")].map(h => Number(h.tagName[1]));
ok("7a. one h1, no level skipped", heads.filter(h => h === 1).length === 1 && heads.every((h, i) => i === 0 || h <= heads[i - 1] + 1), heads.join(","));
ok("7b. in the spec's order", (() => {
  const t = [...main.querySelectorAll("h2")].map(txt);
  const at = s => t.findIndex(x => x.startsWith(s));
  return at("Your arc") < at("From your logged weights") &&
         at("From your logged weights") < at("What your arc works on") && at("What your arc works on") < at("Everything you’ve done");
})(), [...main.querySelectorAll("h2")].map(txt).join(" | "));

// ── 8. HOME ─────────────────────────────────────────────────────────────
console.log("\nTEST 8 - Home's arc chip opens the arc read back");
fixture({ arc: ARC });
main.innerHTML = ""; TodayView(router).mount(main);
ok("8a. the chip routes to Progress", main.querySelector(".home-arc")?.dataset.route === "progress");

console.log("");
if (fails) { console.log(`PROGRESS-AGREE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PROGRESS-AGREE: all ${passes} assertions pass\n`);
process.exit(0);
