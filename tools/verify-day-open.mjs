import { createRequire as __cr } from "node:module";
/**
 * tools/verify-day-open.mjs
 * 28 Oct 2026 v1
 *
 * STAGE PATH P-4 (blueprint Session 4, spec §2 layer 1, C1 dayOpen). The
 * first time the Plan opens each day it asks how you are, before Home:
 * Check in, Just pick something for me, or Not now. Each is remembered for
 * the day (store.dayOpen), on a cold open (nothing behind Home; from
 * inside the app Home stays, EXIT-HOME, and its card asks). Not now: Home asks once more (Want to check in
 * now?), never again that day. Just pick something: Home has the coach's
 * steady suggestion without a check-in. Somebody who has already checked in
 * today is not asked. Free is never sent there.
 *
 * Mock-up v9: the greeting, the arc as a line, the card; the Lately tiles
 * come with Progress (Session 7, P-7), which draws them for both screens.
 *
 * Drives the real TodayView, the real DayOpenView and the real router table.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
import { readFileSync } from "node:fs";

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { TodayView } = await import(B + "views/today.js");
const { router: realRouter } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
let DayOpenView = null;
try { ({ DayOpenView } = await import(B + "views/day-open.js")); } catch (e) { /* red until it exists */ }

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const fakeRouter = { history: [], navigate: (v, o) => navs.push(o?.replace ? v + "(replace)" : v), back() {} };
globalThis.window.router = fakeRouter;
realRouter.navigate = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const todayKey = new Date().toISOString().split("T")[0];

function fixture({ tier = "personal", dayOpen = undefined, checkedIn = false } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("guidanceShownAt", new Date().toISOString());
  store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: new Date(Date.now() - 15 * 864e5).toISOString(), strands: [] });
  if (dayOpen === "yesterday") store.set("dayOpen", { date: "2020-01-01", choice: "checked" });
  else if (dayOpen !== undefined) store.setDayOpen(dayOpen);
  if (checkedIn) {
    store.set("checkinHistory", { [todayKey]: { energy: 6, mood: 6, date: new Date().toDateString() } });
    store.set("lastCheckin", { ...store.get("lastCheckin"), energy: 6, mood: 6, timestamp: new Date().toISOString() });
  }
  navs = []; fakeRouter.history = [];
}
const mountToday = () => { main.innerHTML = ""; TodayView(fakeRouter).mount(main); };
const mountDayOpen = () => { main.innerHTML = ""; const v = DayOpenView(fakeRouter); v.mount(main); return v; };

console.log("\nTEST 0 - positive control");
ok("0a. the view exists", typeof DayOpenView === "function");
if (typeof DayOpenView !== "function") { console.log(`\nVERIFY-DAY-OPEN: ${passes} passed, ${fails + 1} failed`); process.exit(1); }

console.log("\nTEST 1 - the first open of the day goes to the question");
fixture({ dayOpen: "yesterday" }); mountToday();
ok("1a. Home sends the Plan to day-open, in its place", navs[0] === "day-open(replace)", JSON.stringify(navs));
ok("1b. and draws nothing of Home first", !main.querySelector(".path-home"));
fixture(); mountToday();
ok("1c. never opened before: the same", navs[0] === "day-open(replace)", JSON.stringify(navs));
fixture({ dayOpen: "yesterday" }); fakeRouter.history = ["workout"]; mountToday();
ok("1d. reaching Home from inside the app: Home stays (EXIT-HOME), and its card asks", !navs.includes("day-open(replace)") && /How are you doing\?/.test(txt(main.querySelector(".path-today"))), JSON.stringify(navs));

console.log("\nTEST 2 - the screen");
fixture({ dayOpen: "yesterday" }); mountDayOpen();
ok("2a. one h1, the greeting", main.querySelectorAll("h1").length === 1 && /Test\./.test(txt(main.querySelector("h1"))), txt(main.querySelector("h1")));
ok("2b. the arc as a line, not a button", /Your arc · Week \d+( starts today)?\./.test(txt(main.querySelector(".path-arcline"))) && !main.querySelector(".path-arcline button"));
ok("2c. How are you doing?", /How are you doing\?/.test(txt(main)));
const btn = t => [...main.querySelectorAll("button")].find(b => txt(b) === t);
ok("2d. Check in, Just pick something for me, Not now: three ways, nothing else", !!btn("Check in") && !!btn("Just pick something for me") && !!btn("Not now") && main.querySelectorAll("button, a[href]").length === 3,
  [...main.querySelectorAll("button, a[href]")].map(txt).join(" | "));
ok("2e. shown today is remembered, with no choice yet", store.dayOpenToday()?.choice === null && store.dayOpenToday()?.date, JSON.stringify(store.get("dayOpen")));
ok("2f. no streak, count of days or score", !/streak|in a row|score|best/i.test(txt(main)));

console.log("\nTEST 3 - each answer");
fixture({ dayOpen: "yesterday" }); mountDayOpen(); click(btn("Not now"));
ok("3a. Not now is remembered and goes Home", store.dayOpenToday()?.choice === "not-now" && navs.includes("today"), JSON.stringify(navs));
navs = []; mountToday();
ok("3b. Home is not sent back", !navs.includes("day-open(replace)") && !!main.querySelector(".path-home"), JSON.stringify(navs));
ok("3c. Home asks once more: Want to check in now?", /Want to check in now\?/.test(txt(main.querySelector(".path-today"))));
fixture({ dayOpen: "yesterday" }); mountDayOpen(); click(btn("Just pick something for me"));
ok("3d. Just pick something for me is remembered and goes Home", store.dayOpenToday()?.choice === "pick" && navs.includes("today"), JSON.stringify(navs));
navs = []; mountToday();
ok("3e. Home has the coach's suggestion, without a check-in", main.querySelector(".path-today")?.dataset.state === "suggest" && /haven.t checked in with you today/.test(txt(main.querySelector(".path-today"))), txt(main.querySelector(".path-today")));
fixture({ dayOpen: "yesterday" }); mountDayOpen(); click(btn("Check in"));
ok("3f. Check in opens the check-in", navs.includes("checkin") && store.dayOpenToday()?.choice === "checked", JSON.stringify(navs));

console.log("\nTEST 4 - not asked twice");
fixture({ dayOpen: "yesterday", checkedIn: true }); mountToday();
ok("4a. already checked in today: straight to Home", !navs.includes("day-open(replace)") && !!main.querySelector(".path-home"), JSON.stringify(navs));
ok("4b. and the day is remembered as checked", store.dayOpenToday()?.choice === "checked");
fixture({ dayOpen: "not-now" }); mountToday();
ok("4c. later the same day: Home", !navs.includes("day-open(replace)"), JSON.stringify(navs));

console.log("\nTEST 5 - Free is never sent there");
fixture({ tier: "free", dayOpen: "yesterday" }); mountToday();
ok("5a. Free opens Free Home", !navs.includes("day-open(replace)") && !!main.querySelector(".today-view") && !main.querySelector(".path-home"), JSON.stringify(navs));
fixture({ tier: "free" }); mountDayOpen();
ok("5b. Free sent to day-open goes Home and writes nothing", navs.includes("today(replace)") && store.get("dayOpen")?.date == null, JSON.stringify(navs) + JSON.stringify(store.get("dayOpen")));

console.log("\nTEST 6 - the routes");
const src = readFileSync(new URL("../js/router.js", import.meta.url), "utf8");
// 'path' and 'plan-finish' are registered by Sessions 5 and 6, with their views (verify-mount-all).
for (const r of ["day-open"]) ok(`6. '${r}' is a route, under the Today tab`, new RegExp(`'${r}':\\s*\\{\\s*path:`).test(src) && new RegExp(`'${r}': 'today'`).test(src));

console.log(`\n${"=".repeat(60)}\nVERIFY-DAY-OPEN: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
