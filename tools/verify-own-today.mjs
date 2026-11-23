import { createRequire as __cr } from "node:module";
/**
 * tools/verify-own-today.mjs
 * 23 Nov 2026 v1
 *
 * OWN-DONE-TODAY and OWN-NAMES (Graeme, 23 Nov, on his phone: My exercises
 * said "Completed today" for exercises he had not done; Progress named his
 * own exercises "Px 1794424682372 14"). store.js v129, prescribed.js,
 * prescribed-session.js, little-and-often.js, week-shape.js, today.js,
 * plan-home.js, progress.js, progress-share.js, progress-report.js.
 *
 *   1  store.ownDoneToday: ticked today, yes; ticked yesterday, no (the old
 *      flag still set); ticked just before midnight, no; no completedAt
 *      (older records), kept.
 *   2  My exercises: yesterday's ticks are back in the list, not under
 *      Completed today; today's are under it.
 *   3  Home's Little and often: a list ticked yesterday is not Done today.
 *   4  Progress, today's report: My exercises by their own names; one
 *      since deleted is "One of your own exercises"; never a px- id.
 *
 * Red on alongside-v728.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

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
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const PR = await import(B + "views/prescribed.js");
const LAO = await import(B + "data/little-and-often.js");
const { ProgressView } = await import(B + "views/progress.js");
const { readableId, ownName } = await import(B + "data/progress-report.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const main = document.getElementById("main-content");
const rtr = { history: [], navigate() {}, back() {} };
globalThis.window.router = rtr;

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 27).toISOString();
const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 19, 0).toISOString();
const lastMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59).toISOString();
const ex = (id, name, completedAt, extra = {}) => ({ id, name, sets: 1, reps: 8, group: "Evening Release", active: true, completedToday: !!completedAt, completedAt, ...extra });
const LIST = [
  ex("px-1794424682372-14", "Supine Spinal Twist", yesterday),
  ex("px-1794424682372-15", "Child's Pose", lastMinute),
  ex("px-1794424682372-16", "Cat-Cow Stretch", today),
  ex("px-1794424682372-18", "Dead Bug", null),
];
function fixture(tier = "personal", list = LIST) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("prescribedExercises", JSON.parse(JSON.stringify(list)));
}

console.log("\nTEST 1 - store.ownDoneToday");
fixture();
const L = store.get("prescribedExercises");
ok("1a. ticked today: done today", store.ownDoneToday(L[2]));
ok("1b. ticked yesterday, flag still set: not done today", L[0].completedToday === true && !store.ownDoneToday(L[0]));
ok("1c. ticked at 23:59 yesterday: not done today", !store.ownDoneToday(L[1]));
ok("1d. never ticked: not done", !store.ownDoneToday(L[3]));
ok("1e. an older record, flag with no completedAt: kept", store.ownDoneToday({ completedToday: true }));

console.log("\nTEST 2 - My exercises");
for (const tier of ["personal", "free"]) {
  fixture(tier);
  main.innerHTML = PR.render();
  const sec = [...main.querySelectorAll("h2")].find(h => /Completed today/.test(txt(h)));
  const doneList = sec ? txt(sec.nextElementSibling) + txt(sec.parentElement) : "";
  const doneNames = ["Supine Spinal Twist", "Child's Pose", "Cat-Cow Stretch"].filter(n => sec && [...main.querySelectorAll('[aria-label="Completed today"] *')].some(el => txt(el) === n || txt(el).endsWith(n)));
  ok(`2a. ${tier}: only today's tick is under Completed today`, JSON.stringify(doneNames) === JSON.stringify(["Cat-Cow Stretch"]), JSON.stringify(doneNames));
}

console.log("\nTEST 3 - Little and often on Home");
fixture("personal", LIST.slice(0, 2));
store.set("myExercisesOnHome", { "Evening Release": "any" });
const item = LAO.homeItems()[0];
ok("3a. a list ticked yesterday is not Done today", item && item.done === false, JSON.stringify(item));
fixture("personal", [ex("px-1-1", "A", today), ex("px-1-2", "B", today)]);
store.set("myExercisesOnHome", { "Evening Release": "any" });
ok("3b. ticked today, all of it: Done today", LAO.homeItems()[0]?.done === true);

console.log("\nTEST 4 - Progress names My exercises");
fixture();
store.set("activityLog", [{ id: "s1", type: "prescribed-session", source: "own", status: "completed", completed: true, completedAt: today, durationMins: 29,
  exercisesCount: 3, exerciseIds: ["px-1794424682372-14", "px-1794424682372-16", "px-999-1"] }]);
main.innerHTML = ""; ProgressView(rtr).mount(main); await wait(80);
const todayChip = [...main.querySelectorAll("button")].find(b => txt(b) === "Today");
todayChip?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(80);
ok("4pc. the Today window is open", !!todayChip && /One session today/.test(txt(main)), txt(main).slice(0, 160));
const t = txt(main);
ok("4a. by their own names", /Supine Spinal Twist/.test(t) && /Cat-Cow Stretch/.test(t), t.slice(0, 400));
ok("4b. never an id", !/Px \d|px-\d/.test(t));
ok("4c. one since deleted: One of your own exercises", /One of your own exercises/.test(t));
ok("4d. readableId keeps library ids readable", readableId("lat-pulldown") === "Lat pulldown" && readableId("px-1-2") === "One of your own exercises");
ok("4e. ownName", ownName("px-1794424682372-16", LIST) === "Cat-Cow Stretch" && ownName("x", LIST) === null);

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
