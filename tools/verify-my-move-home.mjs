import { createRequire as __cr } from "node:module";
/**
 * tools/verify-my-move-home.mjs
 * 23 Nov 2026 v2
 *
 * v2 - S5 (plan-home v15): the fixture closes Start your Plan, so this
 *   gate keeps testing the Home after it; verify-my-move-close tests the
 *   list itself.
 *
 * P-39 MAKING MY MOVE, S3 HOME (views/plan-home.js v13, data/my-move.js v2;
 * spec docs/specs/alongside_making-my-move_23nov2026_v1.md section 3).
 * Drives the real Home (TodayView on the Plan), as verify-plan-home-path.
 *
 *   0  Controls: Free Home has none of it; the fixture reaches the Plan.
 *   1  Not made yet: Home as before (four doors), and Making my Move's way
 *      in under Today, which opens it.
 *   2  A good day, "my doors": only the chosen doors, the Calm my mind row
 *      into Wellbeing, six ways in at most; It's a hard day and Change
 *      what Alongside is for.
 *   3  Just tell me what to do: no doors, the coach's row and the Library.
 *   4  Show me everything with Calm: four doors, no Calm row (six ways in).
 *   5  A hard day from the check-in (energy Low): the one line, only the
 *      hard-day choices, no doors, no Change today; Show my usual Home.
 *   6  ... from mood Struggling too; not from an okay day.
 *   7  It's a hard day and Show my usual Home: saved for today only, Home
 *      redrawn, focus on the toggle; yesterday's word is not today's.
 *   8  Rest alone: said, with nothing to press.
 *   9  A sore area at Bad: the usual Home, its own choice first.
 *  10  Each hard-day choice goes where it says.
 *  11  Done today on a hard day keeps its card, under the one line.
 *
 * Red on alongside-v724 (Home did not read myMove).
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

function fixture({ tier = "personal", arc = true, choice = undefined, checkin = null, pairs = 0, sore = null, week = null, done = false, carry = false, likes = [] } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("activityLog", Array.from({ length: 6 }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "upper", place: "gym",
    completedAt: new Date(Date.now() - (i + 1) * 864e5).toISOString(), durationMins: 30, completed: true })));
  store.set("guidanceShownAt", new Date().toISOString());
  store.setMyMove({ startClosed: "2026-11-23T09:00:00.000Z" });   // S5: Start your Plan closed; verify-my-move-close tests it open
  if (arc) store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: new Date(Date.now() - 15 * 864e5).toISOString(), strands: [] });
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

console.log("\nTEST 0 - controls");
fixture({ tier: "free" }); home();
ok("0a. Free Home has no Making my Move line", !mmBar() && !main.querySelector(".path-home"));
fixture(); home();
ok("0b. the fixture reaches the Plan's Home", !!main.querySelector(".path-home"));

console.log("\nTEST 1 - not made yet");
fixture(); home();
ok("1a. four doors, as before", doorIds() === "stronger,moving,stretch,feel", doorIds());
ok("1b. Make Home yours, in about a minute, with Making my Move", /Make Home yours, in about a minute\./.test(txt(mmBar())) && txt(mmBar().querySelector("button")) === "Making my Move", txt(mmBar()));
click(main.querySelector('[data-action="mm-open"]'));
ok("1c. it opens Making my Move", navs.at(-1) === "my-move", JSON.stringify(navs));

console.log("\nTEST 2 - a good day, my doors");
fixture({ checkin: { energy: 7, mood: 7 } }); set(MY); home();
ok("2a. only the chosen doors", doorIds() === "stronger,stretch", doorIds());
const calm = main.querySelector('.path-doors [data-route="noticing"]');
ok("2b. Calm my mind, a row into Wellbeing", !!calm && /Calm my mind/.test(txt(calm)) && calm.dataset.requiresCheckin === "false", txt(calm));
ok("2c. six ways in at most", waysIn().length <= 6, waysIn().map(b => txt(b).slice(0, 20)).join(" | "));
ok("2d. It's a hard day and Change what Alongside is for", [...mmBar().querySelectorAll("button")].map(txt).join("|") === "It's a hard day|Change what Alongside is for", txt(mmBar()));
click(main.querySelector('[data-action="mm-change"]'));
ok("2e. Change opens Making my Move", navs.at(-1) === "my-move");
ok("2f. no hard-day line on a good day", !main.querySelector(".path-mm__note"));

console.log("\nTEST 3 - Just tell me what to do");
fixture({ checkin: { energy: 7, mood: 7 } }); set({ ...MY, goodDay: "one", purposes: ["stronger", "instep"] }); home();
ok("3a. no doors", doors().length === 0);
ok("3b. the coach's row and the Library", !!main.querySelector('.path-coach[data-state="coach"]') && !!main.querySelector('[data-route="library"]'));
ok("3c. the list is called More", txt(main.querySelector("#path-doors-h")) === "More");

console.log("\nTEST 4 - Show me everything, with Calm");
fixture({ checkin: { energy: 7, mood: 7 } }); set({ ...MY, goodDay: "all" }); home();
ok("4a. four doors", doorIds() === "stronger,moving,stretch,feel");
ok("4b. no Calm row, so six ways in hold", !main.querySelector('.path-doors [data-route="noticing"]') && waysIn().length <= 6, waysIn().length);

console.log("\nTEST 5 - a hard day from the check-in");
fixture({ checkin: { energy: 3, mood: 6 } }); set(MY); home();
ok("5a. the one line", txt(main.querySelector(".path-mm__note")) === "A hard day. Here's what you chose for days like this.");
const hardRows = [...main.querySelectorAll('.path-coach[data-state="hard"]')];
ok("5b. only their hard-day choices", hardRows.map(r => txt(r.querySelector(".path-coach__t"))).join("|") === "Let the coach pick something gentle|A short walk", hardRows.map(txt).join(" | "));
ok("5c. no doors, no coach's usual row", doors().length === 0 && !main.querySelector('.path-coach[data-state="coach"]'));
ok("5d. no Change today on a hard day", !main.querySelector(".path-change"));
ok("5e. Show my usual Home", !!main.querySelector('.path-mm [data-action="mm-usual"]') && !main.querySelector('[data-action="mm-hard"]'));
ok("5f. no Calm row from the good day", !main.querySelector('.path-doors [data-route="noticing"]'));
ok("5g. every way in counted, six at most", main.querySelectorAll(".path-home button").length <= 6, main.querySelectorAll(".path-home button").length);

console.log("\nTEST 6 - mood");
fixture({ checkin: { energy: 7, mood: 2 } }); set(MY); home();
ok("6a. mood Struggling makes a hard day", !!main.querySelector('.path-coach[data-state="hard"]'));
fixture({ checkin: { energy: 5, mood: 5 } }); set(MY); home();
ok("6b. an okay day is not a hard day", !main.querySelector('.path-coach[data-state="hard"]') && doorIds() === "stronger,stretch");

console.log("\nTEST 7 - It's a hard day, Show my usual Home");
fixture({ checkin: { energy: 7, mood: 7 } }); set(MY); home();
fakeRouter.homeFocus = null;
click(main.querySelector('[data-action="mm-hard"]'));
ok("7a. saved for today", JSON.stringify(store.get("myMove").day) === JSON.stringify({ date: store._localDay(), mode: "hard" }), JSON.stringify(store.get("myMove").day));
ok("7b. Home is redrawn", navs.at(-1) === "today" && fakeRouter.homeFocus === "mm");
home();
ok("7c. now the hard day, focus on Show my usual Home", !!main.querySelector('.path-coach[data-state="hard"]') && document.activeElement === main.querySelector('[data-action="mm-usual"]'));
click(main.querySelector('[data-action="mm-usual"]')); home();
ok("7d. Show my usual Home: the good day again", store.get("myMove").day.mode === "usual" && doorIds() === "stronger,stretch");
fixture({ checkin: { energy: 3, mood: 6 } }); set({ ...MY, day: { date: store._localDay(), mode: "usual" } }); home();
ok("7f. their word wins over a low check-in", !main.querySelector('.path-coach[data-state="hard"]') && doorIds() === "stronger,stretch");
fixture({ checkin: { energy: 7, mood: 7 } }); set({ ...MY, day: { date: "2020-01-01", mode: "hard" } }); home();
ok("7e. another day's word is not today's", !main.querySelector('.path-coach[data-state="hard"]'));

console.log("\nTEST 8 - Rest alone");
fixture({ checkin: { energy: 2, mood: 5 } }); set({ ...MY, hardDay: ["rest"] }); home();
const rest = main.querySelector('.path-today[data-state="hard"]');
ok("8a. Rest, and that's fine, said", !!rest && /Rest, and that's fine/.test(txt(rest)) && /Rest counts\./.test(txt(rest)), txt(rest));
ok("8b. nothing to press in it", rest && !rest.querySelector("button"));

console.log("\nTEST 9 - a sore area at Bad");
fixture({ checkin: { energy: 3, mood: 6 }, sore: { "lower-back": 8 } }); set(MY); home();
ok("9a. the usual Home, not the hard day's", !main.querySelector('.path-coach[data-state="hard"]'));
ok("9b. its own choice leads", !!main.querySelector('.path-coach[data-state="coach"]'), txt(lead()));

console.log("\nTEST 10 - where each hard-day choice goes");
fixture({ checkin: { energy: 3, mood: 6 } }); set({ ...MY, hardDay: ["walk", "calm"] }); home();
click(main.querySelector('[data-action="hard-walk"]'));
ok("10a. A short walk opens the walk", navs.at(-1) === "walk-session", navs.at(-1));
click(main.querySelector('[data-action="hard-calm"]'));
ok("10b. Calm my mind opens Wellbeing", navs.at(-1) === "noticing", navs.at(-1));
fixture({ checkin: { energy: 3, mood: 6 } }); set({ ...MY, hardDay: ["stretch", "coach"] }); home();
click(main.querySelector('[data-action="hard-stretch"]'));
ok("10c. A gentle stretch opens the Stretch door", navs.at(-1) === "path" && fakeRouter.pathStart?.door === "stretch", JSON.stringify(fakeRouter.pathStart));
click(main.querySelector('[data-action="hard-coach"]'));
ok("10d. the coach's gentle pick goes through the coach's choice", ["coach-proposal", "path"].includes(navs.at(-1)), navs.at(-1));

console.log("\nTEST 11 - done today on a hard day");
fixture({ checkin: { energy: 3, mood: 6 }, done: true }); set(MY); home();
ok("11a. the done card stays, under the one line", !!main.querySelector('.path-today[data-state="done"]') && !!main.querySelector(".path-mm__note"));
ok("11b. no doors", doors().length === 0);

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
