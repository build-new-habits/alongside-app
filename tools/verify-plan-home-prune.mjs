/**
 * tools/verify-plan-home-prune.mjs
 * 12 Oct 2026 v1
 *
 * A-1 PLAN-HOME-PRUNE (Stage AWARD). Graeme approved the mock-up, 12 Oct:
 * "This is perfect ... I love plan home."
 *
 * Plan Home leads with one Today card, then the doors, then one Library
 * row. Six ways in at most. Measured on v657: up to eleven (the arc card,
 * three doors, five tiles, and the week card's Only 10 minutes and
 * Something else today).
 *
 *   - A day of your week: the card is that day (Show me today's plan) with
 *     your arc on a line inside it; below, all three doors.
 *   - No week, or nothing set for today: the card leads with your arc and
 *     Tell me what to do (the coach chooses), so that door is not repeated
 *     below; Plan your week (or Your week) is on the card.
 *   - A rest day in your week: the card says so, with your arc; all three
 *     doors below for anyone who wants to move anyway.
 *   - Join a class, Go for a run, Something for the mind and Your week left
 *     Home: each is one tap from the Library on the Plan (Classes and Your
 *     week are new Library tiles, the Plan's only), the mind also the
 *     Wellbeing tab.
 *   - FREE IS LEFT ALONE (Graeme, 12 Oct): Free Home and Free's Library are
 *     as they were.
 *
 * Drives the real TodayView and the real Library.
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
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const WM = await import(B + "data/week-shape-model.js");
const { TodayView } = await import(B + "views/today.js");
const library = await import(B + "views/library.js");
const { router: realRouter } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const fakeRouter = { history: ["somewhere"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = fakeRouter;
realRouter.navigate = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const TODAY = WM.DAY_KEYS[(new Date().getDay() + 6) % 7];

function fixture({ tier = "personal", week = null, arc = true } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  // Past the first-days orientation and the monthly guidance line.
  store.set("activityLog", Array.from({ length: 6 }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "upper",
    completedAt: new Date(Date.now() - (i + 1) * 864e5).toISOString(), durationMins: 30 })));
  store.set("guidanceLastShownAt", new Date().toISOString());
  if (arc) store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: new Date(Date.now() - 15 * 864e5).toISOString(), strands: [] });
  if (week) {
    const days = Object.fromEntries(WM.DAY_KEYS.map(k => [k, null]));
    if (week === "day") days[TODAY] = "upper-day";
    if (week === "rest") days[TODAY] = "rest";
    if (week === "none-today") days[WM.DAY_KEYS.find(k => k !== TODAY)] = "upper-day";
    store.set("weekShape", WM.sanitizeWeekShape({ templates: { "upper-day": { id: "upper-day", name: "Upper day",
      mix: [{ focus: "upper", level: 2 }, { focus: "trunk", level: 1 }], intensity: "steady", mins: 30, place: "gym" } }, days, setAt: "2026-10-05" }));
  }
  navs = [];
}
function home() { main.innerHTML = ""; TodayView(fakeRouter).mount(main); }
// Ways in: anything on Home's own content that can be pressed (the bottom
// navigation is in index.html, not here).
const waysIn = () => [...main.querySelectorAll("button, a[href], [role=button]")].filter(b => !b.closest(".today-scope, .scope-notice"));
const card = () => main.querySelector(".home-week, .home-today");
const doorActions = () => [...main.querySelectorAll(".home-doors .home-door")].map(d => d.dataset.action);
const homeRoutes = () => [...main.querySelectorAll("[data-route]")].map(b => b.dataset.route);

console.log("\nTEST 1 - a day of your week");
fixture({ week: "day" }); home();
ok("1pc. the week card is there", !!main.querySelector(".home-week [data-action='week-today']"));
ok("1a. at most six ways in", waysIn().length <= 6, waysIn().map(b => txt(b).slice(0, 24) || b.dataset.action).join(" | "));
ok("1b. the arc is a line inside the card, opening the arc", !!card()?.querySelector("[data-route='stretch-arc']") && main.querySelectorAll("[data-route='stretch-arc']").length === 1);
ok("1c. no Only 10 minutes or Something else today on Home (Length on the plan does it)", !main.querySelector("[data-action='week-short'], [data-action='week-else']"));
ok("1d. all three doors below, in order", doorActions().join() === "start-today,know-what,as-i-go", doorActions().join());
ok("1e. one Library row, naming your week", homeRoutes().includes("library") && /your week/i.test(txt(main.querySelector("[data-route='library']"))));
ok("1f. no class, run, mind or week tiles on Home", !["classes", "running-session", "noticing", "your-week"].some(r => homeRoutes().includes(r)), homeRoutes().join());
navs = []; click(main.querySelector("[data-action='week-today']"));
ok("1g. Show me today's plan opens the plan", navs.length > 0, JSON.stringify(navs));

console.log("\nTEST 2 - no week set");
fixture(); home();
const c2 = card();
ok("2pc. a Today card leads", !!c2);
ok("2a. it leads with your arc and Tell me what to do", /Week \d/.test(txt(c2)) && !!c2?.querySelector("[data-action='start-today']") && !!c2?.querySelector("[data-route='stretch-arc']"), txt(c2));
ok("2b. Tell me what to do is on screen once", main.querySelectorAll("[data-action='start-today']").length === 1);
ok("2c. the other two doors below", doorActions().join() === "know-what,as-i-go", doorActions().join());
ok("2d. Plan your week is on the card", txt(c2?.querySelector("[data-route='your-week']")) === "Plan your week");
ok("2e. at most six ways in", waysIn().length <= 6, waysIn().map(b => txt(b).slice(0, 24)).join(" | "));
ok("2f. the Library row does not repeat your week", !/your week/i.test(txt(main.querySelector("[data-route='library']"))));

console.log("\nTEST 3 - no week and no arc yet");
fixture({ arc: false }); home();
ok("3a. the card offers to set the arc", !!card()?.querySelector("[data-route='arc-setup']"));
ok("3b. and Tell me what to do", !!card()?.querySelector("[data-action='start-today']"));
ok("3c. at most six ways in", waysIn().length <= 6, waysIn().map(b => txt(b).slice(0, 24)).join(" | "));

console.log("\nTEST 4 - a week, but nothing set for today");
fixture({ week: "none-today" }); home();
ok("4a. the coach's card leads, with Your week (not Plan your week)", txt(card()?.querySelector("[data-route='your-week']")) === "Your week");

console.log("\nTEST 5 - a rest day in your week");
fixture({ week: "rest" }); home();
ok("5a. the card says rest, with your arc", /Rest/.test(txt(card())) && !!card()?.querySelector("[data-route='stretch-arc']"));
ok("5b. all three doors below", doorActions().join() === "start-today,know-what,as-i-go", doorActions().join());
ok("5c. at most six ways in", waysIn().length <= 6);

console.log("\nTEST 6 - what left Home is one tap from the Library, on the Plan");
fixture();
main.innerHTML = library.render(); library.onMount();
const guided = [...main.querySelectorAll("[data-guided]")].map(b => b.dataset.guided);
ok("6a. Classes, Run, Your week and the mind in the Library", ["classes", "run", "week", "mindful"].every(g => guided.includes(g)), guided.join());
navs = []; click(main.querySelector("[data-guided='classes']"));
ok("6b. Classes opens the classes", navs.includes("classes"), JSON.stringify(navs));
main.innerHTML = library.render(); library.onMount();
navs = []; click(main.querySelector("[data-guided='week']"));
ok("6c. Your week opens your week", navs.includes("your-week"), JSON.stringify(navs));

console.log("\nTEST 7 - FREE IS LEFT ALONE");
fixture({ tier: "free" }); home();
ok("7a. Free Home has no Plan doors or Today card", !main.querySelector(".home-door, .home-today, .home-week"));
ok("7b. Free Home keeps its own tiles and Not sure? I'll pick something", /Cardio, Core/.test(txt(main)) && /Not sure\? I.ll pick something/.test(txt(main)));
main.innerHTML = library.render(); library.onMount();
const freeGuided = [...main.querySelectorAll("[data-guided]")].map(b => b.dataset.guided);
ok("7c. Free's Library has no new tiles", !freeGuided.includes("classes") && !freeGuided.includes("week"), freeGuided.join());

console.log(`\nVERIFY-PLAN-HOME-PRUNE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
