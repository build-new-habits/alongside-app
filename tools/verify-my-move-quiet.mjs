import { createRequire as __cr } from "node:module";
/**
 * tools/verify-my-move-quiet.mjs
 * 23 Nov 2026 v1
 *
 * P-39 MAKING MY MOVE, S6 QUIET HOME (Graeme, 23 Nov: "I'd like them to
 * disappear off the main home page"; "be exceptional"). views/plan-home.js
 * v16, data/my-move.js v5, views/change-today.js v3, store.js v128.
 * Drives the real Home and the real Change today.
 *
 *   0  Free: no question on Home.
 *   1  A good day: nothing standing under Today.
 *   2  An in-between day (mood Low): one question, headed, two answers.
 *   3  Yes: today's hard day, focus on Show my usual Home; not asked again.
 *   4  No, as planned: the usual Home, focus on the doors; not asked again.
 *   5  Not asked: a hard day already, an okay day, not made, a sore area
 *      at Bad; yesterday's answer is not today's.
 *   6  Twelve weeks into an arc: Still what you want Alongside for? Not
 *      before week 12, not while Start your Plan shows, not on a hard day,
 *      and not beside the in-between question.
 *   7  Have a look / Yes, still right: kept for this turn; asked again at
 *      week 24, and at a new arc's week 12.
 *   8  Change today: It's a hard day, once made and not already hard.
 *   9  Help A3: from Settings once the list is closed.
 *
 * Red on alongside-v727 (the links stood on Home; no question).
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
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const WM = await import(B + "data/week-shape-model.js");
const ENG = await import(B + "data/path-engine.js");
const { TodayView } = await import(B + "views/today.js");
const { ChangeTodayView } = await import(B + "views/change-today.js");
const GD = await import(B + "data/guides.js");
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
const todayKey = new Date().toISOString().split("T")[0];

// An arc in its week n (week 1 is the week it began).
const ARC_AT = n => new Date(Date.now() - (n - 1) * 7 * 864e5).toISOString();

function fixture({ tier = "personal", open = false, arcWeeks = 3, arc = true, choice = undefined, checkin = null, pairs = 0, sore = null, week = null, done = false, carry = false, likes = [] } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("activityLog", Array.from({ length: 6 }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "upper", place: "gym",
    completedAt: new Date(Date.now() - (i + 1) * 864e5).toISOString(), durationMins: 30, completed: true })));
  store.set("guidanceShownAt", new Date().toISOString());
  if (arc) store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: ARC_AT(arcWeeks), strands: [] });
  if (!open) store.setMyMove({ startClosed: "2026-11-01T09:00:00.000Z" });
  if (choice !== undefined) store.setDayOpen(choice);
  if (checkin) {
    store.set("checkinHistory", { [todayKey]: { energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString() } });
    store.set("lastCheckin", { ...store.get("lastCheckin"), energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  }
  if (sore) store.set("conditionPainScores", sore);
  if (week) {
    const days = Object.fromEntries(WM.DAY_KEYS.map(k => [k, null]));
    if (week === "day") days[TODAY] = "upper-day";
    if (week === "rest") days[TODAY] = "rest";
    store.set("weekShape", WM.sanitizeWeekShape({ templates: { "upper-day": { id: "upper-day", name: "Upper day",
      mix: [{ focus: "upper", level: 2 }, { focus: "trunk", level: 1 }], intensity: "steady", mins: 30, place: "gym" } }, days, setAt: "2026-10-05" }));
  }
  if (done) store.set("activityLog", [...store.get("activityLog"), { id: "today1", type: "yoga-session", name: "Calming yoga", door: "feel",
    completedAt: new Date().toISOString(), durationMins: 15, completed: true, moodAfter: 7 }]);
  if (carry) {
    store.set("generatedSession", { builtAt: "b1", session: { id: "s1", title: "Upper body", exercises: [{ id: "push-up", name: "Push-up" }, { id: "childs-pose", name: "Child's Pose" }, { id: "plank", name: "Plank" }] } });
    store.set("activeSessionCheckpoint", { sessionType: "workout", sessionId: "s1|b1", index: 1, startedAt: new Date().toISOString(), checkpointedAt: new Date().toISOString() });
  }
  for (const id of likes) store.likeMovement(id);
  if (pairs) {   // finished sessions with the check-in's mood that day and the mood after
    const hist = { ...(store.get("checkinHistory") || {}) }, log = [...store.get("activityLog")];
    for (let i = 0; i < pairs; i++) { const d = new Date(Date.now() - (i + 2) * 864e5); hist[d.toISOString().split("T")[0]] = { energy: 6, mood: 3 };
      log.push({ id: "p" + i, type: "yoga-session", name: "Calming yoga", completedAt: d.toISOString(), durationMins: 15, completed: true, moodAfter: i === 0 ? 3 : 7 }); }
    store.set("checkinHistory", hist); store.set("activityLog", log);
  }
  navs = []; delete fakeRouter.pathStart;
}
function home() { main.innerHTML = ""; TodayView(fakeRouter).mount(main); }
// P-31 (Graeme, 14 Nov): Change today and its Undo count with the Today card; Little and often is the person's own choice.
const waysIn = () => [...main.querySelectorAll("button, a[href], [role=button]")].filter(b => !b.closest(".scope-notice, .today-hinge, .path-change, .path-lao, .path-mm") && !b.matches(".path-lao__all"));
const card = () => main.querySelector(".path-today");
const lead = () => main.querySelector(".path-coach, .path-today");
const doors = () => [...main.querySelectorAll(".path-doors .path-door[data-door]")];
const engineFor = (checkin, sore = []) => ENG.suggestToday({ checkin, place: "gym", sore, arcDoor: null });


const mmBar = () => main.querySelector(".path-mm");
const doorIds = () => doors().map(d => d.dataset.door).join();
const set = m => store.setMyMove({ made: "2026-11-23T10:00:00.000Z", step: null, ...m });
const MY = { purposes: ["stronger", "stretch", "calm", "instep"], most: "stronger", goodDay: "few", hardDay: ["coach", "walk"] };

const wait = ms => new Promise(r => setTimeout(r, ms));
const q = () => main.querySelector(".path-ask");
const qText = () => txt(main.querySelector(".path-ask__q"));
const LOWMOOD = { energy: 7, mood: 3 };
const HARDQ = "You said your mood is low today. Keep today to what you chose for hard days?";

console.log("\nTEST 0 - Free");
fixture({ tier: "free", checkin: LOWMOOD }); home();
ok("0a. Free: no question on Home", !q() && !/Keep today/.test(txt(main)));

console.log("\nTEST 1 - a good day");
fixture({ checkin: { energy: 7, mood: 7 } }); set(MY); home();
ok("1a. nothing standing under Today", !mmBar() && !q());
ok("1b. no It's a hard day, no Change what Alongside is for", !/It's a hard day|Change what Alongside is for/.test(txt(main)));

console.log("\nTEST 2 - an in-between day");
fixture({ checkin: LOWMOOD }); set(MY); home();
ok("2a. the question, in its words", qText() === HARDQ, qText());
ok("2b. a region named by the question", q()?.tagName === "SECTION" && document.getElementById(q().getAttribute("aria-labelledby")) === main.querySelector(".path-ask__q"));
ok("2c. two answers: Yes, No, as planned", [...q().querySelectorAll("button")].map(txt).join("|") === "Yes|No, as planned");
ok("2d. the usual Home under it (nothing decided for them)", doorIds() === "stronger,stretch" && !main.querySelector('.path-coach[data-state="hard"]'));
ok("2e. not a seventh way in (under Today, with Change today)", !!q().closest(".path-mm") && waysIn().length <= 6, waysIn().length);

console.log("\nTEST 3 - Yes");
click(main.querySelector('[data-action="ask-hard-yes"]'));
ok("3a. today's word is hard", JSON.stringify(store.get("myMove").day) === JSON.stringify({ date: store._localDay(), mode: "hard" }));
ok("3b. Home redrawn, focus for Show my usual Home", navs.at(-1) === "today" && fakeRouter.homeFocus === "mm");
home();
ok("3c. the hard-day Home, focus on Show my usual Home, no question", !!main.querySelector('.path-coach[data-state="hard"]') && document.activeElement === main.querySelector('[data-action="mm-usual"]') && !q());
click(main.querySelector('[data-action="mm-usual"]')); home();
ok("3d. Show my usual Home: not asked again today", !q() && doorIds() === "stronger,stretch");

console.log("\nTEST 4 - No, as planned");
fixture({ checkin: LOWMOOD }); set(MY); home();
click(main.querySelector('[data-action="ask-hard-no"]'));
ok("4a. today's word is usual, focus for the doors", store.get("myMove").day?.mode === "usual" && fakeRouter.homeFocus === "doors");
home();
ok("4b. not asked again; the usual Home; the doors heading focused", !q() && doorIds() === "stronger,stretch" && document.activeElement === main.querySelector("#path-doors-h"));

console.log("\nTEST 5 - not asked");
fixture({ checkin: { energy: 3, mood: 3 } }); set(MY); home();
ok("5a. a hard day already (energy Low): the hard-day Home, no question", !!main.querySelector('.path-coach[data-state="hard"]') && !q());
fixture({ checkin: { energy: 6, mood: 6 } }); set(MY); home();
ok("5b. an okay day: no question", !q());
fixture({ checkin: LOWMOOD }); home();
ok("5c. Making my Move not made: no question", !q());
fixture({ checkin: LOWMOOD, sore: { "lower-back": 8 } }); set(MY); home();
ok("5d. a sore area at Bad: its own choice, no question", !q());
fixture({ checkin: LOWMOOD }); set({ ...MY, day: { date: "2020-01-01", mode: "usual" } }); home();
ok("5e. another day's answer is not today's: asked", qText() === HARDQ);
fixture({ checkin: { energy: 7, mood: 7 } }); set({ ...MY, hardDay: ["rest"] }); home();
ok("5f. no check-in reason, no question (Rest alone too)", !q());

console.log("\nTEST 6 - twelve weeks into an arc");
const REVQ = n => `${n} weeks into your arc. Still what you want Alongside for?`;
fixture({ checkin: { energy: 7, mood: 7 }, arcWeeks: 11 }); set(MY); home();
ok("6a. week 11: not asked", !q());
fixture({ checkin: { energy: 7, mood: 7 }, arcWeeks: 12 }); set(MY); home();
ok("6b. week 12: asked, in its words", qText() === REVQ(12), qText());
ok("6c. two answers: Have a look, Yes, still right", [...q().querySelectorAll("button")].map(txt).join("|") === "Have a look|Yes, still right");
fixture({ checkin: { energy: 7, mood: 7 }, arcWeeks: 12, open: true }); set(MY); home();
ok("6d. not while Start your Plan shows (Making my Move is on it)", !q() && !!main.querySelector(".path-start"));
fixture({ checkin: { energy: 3, mood: 6 }, arcWeeks: 12 }); set(MY); home();
ok("6e. not on a hard day", !q() && !!main.querySelector('.path-coach[data-state="hard"]'));
fixture({ checkin: LOWMOOD, arcWeeks: 12 }); set(MY); home();
ok("6f. one question at a time: the in-between day's first", main.querySelectorAll(".path-ask").length === 1 && qText() === HARDQ);
fixture({ checkin: { energy: 7, mood: 7 }, arcWeeks: 12 }); home();
ok("6g. not before Making my Move is made", !q());

console.log("\nTEST 7 - answered");
fixture({ checkin: { energy: 7, mood: 7 }, arcWeeks: 12 }); set(MY); home();
click(main.querySelector('[data-action="ask-review-yes"]'));
const at = store.get("arc").startedAt;
ok("7a. Have a look: kept for this turn, opens Making my Move", JSON.stringify(store.get("myMove").review) === JSON.stringify({ arc: at, block: 1 }) && navs.at(-1) === "my-move");
home();
ok("7b. not asked again in this turn", !q());
fixture({ checkin: { energy: 7, mood: 7 }, arcWeeks: 13 }); set(MY); home();
click(main.querySelector('[data-action="ask-review-no"]'));
ok("7c. Yes, still right: kept, focus for the doors", store.get("myMove").review?.block === 1 && fakeRouter.homeFocus === "doors");
home();
ok("7d. ... and not asked again", !q());
fixture({ checkin: { energy: 7, mood: 7 }, arcWeeks: 24 }); set(MY);
store.setMyMove({ review: { arc: store.get("arc").startedAt, block: 1 } }); home();
ok("7e. week 24: asked again", qText() === REVQ(24), qText());
fixture({ checkin: { energy: 7, mood: 7 }, arcWeeks: 12 }); set({ ...MY, review: { arc: "2025-01-01T09:00:00.000Z", block: 3 } }); home();
ok("7f. a new arc: asked at its own week 12", qText() === REVQ(12));

console.log("\nTEST 8 - Change today");
const ct = () => { const el = document.createElement("div"); ChangeTodayView(fakeRouter).mount(el); return el; };
const hardChoice = el => [...el.querySelectorAll("button")].find(b => /It's a hard day/.test(txt(b)));
fixture({ checkin: { energy: 7, mood: 7 }, week: "day" }); set(MY);
let el = ct();
ok("8a. It's a hard day, with what it does", !!hardChoice(el) && /Home shows what you chose for days like this/.test(txt(hardChoice(el))), txt(el));
click(hardChoice(el));
ok("8b. it makes today a hard day and goes Home, focus for Show my usual Home", store.get("myMove").day?.mode === "hard" && navs.at(-1) === "today" && fakeRouter.homeFocus === "mm");
ok("8c. already a hard day: not offered", !hardChoice(ct()));
fixture({ checkin: { energy: 7, mood: 7 }, week: "day" });
ok("8d. Making my Move not made: not offered", !hardChoice(ct()));

console.log("\nTEST 9 - Help");
const A3 = GD.guideById("A3");
ok("9a. A3 from Start your Plan while it shows, from Settings once closed", A3?.ways.map(w => w.when).join() === "startOpen,startClosed" && A3.ways[1].parts[0].steps.slice(0, 3).map(s => s.target).join() === "nav:settings,settings-plan,mm-settings");
ok("9b. its answers no longer send anyone to a link on Home", !/Change what Alongside is for|On Home, tap \*\*It's a hard day/.test(JSON.stringify(A3)));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
