/**
 * tools/verify-empty-and-moments.mjs
 * 28 Oct 2026 v2
 *
 * v2 - STAGE PATH P-4 re-point (none loosened). The Plan answers the day's first question (day-open) before Home on a cold open, so the fixture has answered it. The new arc week is said on Plan Home's arc line (plan-home.js), still a day and never a count.
 *
 * 13 Oct 2026 v1
 *
 * A-7 EMPTY-AND-FIRST and A-5 SIGNATURE-MOMENTS, the rest (Stage AWARD;
 * Graeme, 13 Oct: "Yes please"). Measured on v661:
 *
 *   - Saved sessions, empty, on the Plan: "there is a save on the preview
 *     screen" -- untrue since A-5 put Keep to repeat on the finish; and the
 *     screen was headed "Your own sessions", one of three names for it
 *     (A-9 glossary, open decision 1, now "Saved sessions").
 *   - My exercises, empty: one line in a card, "Add an exercise with the
 *     button below", with no heading.
 *   - Plan Home, the first day of a new arc week: nothing marked it.
 *     Now "Week n starts today" on that day only (arc weeks start on a
 *     Monday; never on week 1, which is the arc starting). A date, never a
 *     count (ARC-1).
 *   - The first session's finish already says "That was your first one."
 *     (W3-20); not touched here.
 *
 * Messages, empty ("No messages at the moment."), already met the rule.
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
const { router: realRouter } = await import(B + "router.js");
const saved = await import(B + "views/saved-sessions.js");
const prescribed = await import(B + "views/prescribed.js");
const { TodayView } = await import(B + "views/today.js");
const { weekStart } = await import(B + "data/arc-readback.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const rtr = { navigate: v => navs.push(v), back() {}, history: ["x"] };
realRouter.navigate = rtr.navigate;
globalThis.window.router = rtr;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

function fixture(tier) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "T"); store.set("tier", tier);
  store.setDayOpen("checked");   // STAGE PATH P-4: the day's question answered, so Home is drawn
  store.set("activityLog", Array.from({ length: 6 }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "upper",
    completedAt: new Date(Date.now() - (i + 1) * 864e5).toISOString(), durationMins: 30 })));
  store.set("guidanceLastShownAt", new Date().toISOString());
  navs = [];
}
const mount = v => { main.innerHTML = v.render(); try { v.onMount(); } catch {} };

console.log("\nTEST 1 - Saved sessions");
fixture("personal"); mount(saved);
ok("1a. headed Saved sessions", txt(main.querySelector("h1")) === "Saved sessions", txt(main.querySelector("h1")));
ok("1b. empty: says where saving is (Keep to repeat, when you finish)", /Keep to repeat/.test(txt(main)) && /finish/i.test(txt(main)), txt(main).slice(0, 200));
ok("1c. no longer points to a preview screen", !/preview screen/i.test(txt(main)));
const start = main.querySelector("#saved-empty-start");
ok("1d. one way to start", !!start);
click(start);
ok("1e. which is the coach's session, through today's check-in", navs.at(-1) === "checkin" && store.get("pendingDoorRoute") === "coach-proposal", JSON.stringify(navs));
fixture("personal"); store.set("savedSessions", [{ id: "s1", name: "Mine", exerciseIds: ["goblet-squat"], createdAt: new Date().toISOString() }]); mount(saved);
ok("1f. with a session kept: still Saved sessions", txt(main.querySelector("h1")) === "Saved sessions" && /Mine/.test(txt(main)));
fixture("free"); mount(saved);
ok("1g. Free: Saved sessions, and that keeping them is the Plan's", txt(main.querySelector("h1")) === "Saved sessions" && /part of the Plan/.test(txt(main)), txt(main).slice(0, 200));

console.log("\nTEST 2 - My exercises, empty");
fixture("personal"); store.set("prescribedExercises", []); mount(prescribed);
const empty = main.querySelector(".prescribed-empty-card");
ok("2a. a heading", txt(empty?.querySelector("h2")) === "No exercises yet", txt(empty));
ok("2b. one line saying what goes here, as you wrote it", /as you wrote/i.test(txt(empty)) && !/button below/i.test(txt(empty)), txt(empty));
ok("2c. and the way to add one is there", !![...main.querySelectorAll("button")].find(b => /Add/.test(txt(b))));

console.log("\nTEST 3 - a new arc week, on Plan Home");
function homeWith(startedAt) {
  fixture("personal");
  store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: startedAt.toISOString(), strands: [] });
  main.innerHTML = ""; TodayView(rtr).mount(main);
  return txt(main.querySelector(".path-arcline"));   // P-4: the arc is said on its own line
}
const monday = weekStart(new Date());
const isMonday = monday.toDateString() === new Date().toDateString();
const threeWeeksAgo = new Date(monday); threeWeeksAgo.setDate(monday.getDate() - 14);
const t3 = homeWith(threeWeeksAgo);
ok(`3a. ${isMonday ? "today is a Monday: Week 3 starts today" : "not a Monday: Week 3, with no 'starts today'"}`,
   isMonday ? /Week 3 starts today/.test(t3) : (/Week 3/.test(t3) && !/starts today/.test(t3)), t3.slice(0, 160));
const thisWeek = new Date(monday);
const t1 = homeWith(thisWeek);
ok("3b. never on week 1 (that is the arc beginning)", !/starts today/.test(t1), t1.slice(0, 160));
// Driven both ways whatever today is: the rule, with "now" given.
const { arcWeekStartsToday } = await import(B + "views/today.js");
const mon = new Date(monday), tue = new Date(monday); tue.setDate(mon.getDate() + 1);
const arc3 = { active: true, startedAt: threeWeeksAgo.toISOString() };
ok("3c. the rule: a Monday after week 1 is a new week; a Tuesday is not", arcWeekStartsToday?.(arc3, mon) === true && arcWeekStartsToday?.(arc3, tue) === false && arcWeekStartsToday?.({ active: true, startedAt: mon.toISOString() }, mon) === false);

console.log(`\nVERIFY-EMPTY-AND-MOMENTS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
