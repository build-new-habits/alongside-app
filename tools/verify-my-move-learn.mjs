import { createRequire as __cr } from "node:module";
/**
 * tools/verify-my-move-learn.mjs
 * 23 Nov 2026 v1
 *
 * P-39 MAKING MY MOVE, S4 AIM AND SUGGESTIONS (data/my-move.js v3,
 * views/my-move.js v2, views/arc-setup.js v8, views/plan-home.js v14;
 * spec sections 4 and 5, as built: what matters most leads the arc's aims,
 * the arc's own questions stay).
 *
 *   1  The aims for each purpose all exist, none is held; nothing is led
 *      before Making my Move is made.
 *   2  The arc's "What do you want to be able to do?" leads with them and
 *      says why; None of these still shows everything; without Making my
 *      Move it is as before.
 *   3  Home offers Set what you're working towards (made, something
 *      matters most, no arc), and not once an arc is set.
 *   4  A suggestion: five or more starts behind a door not on Home in the
 *      last 30 days; not four, not older, not said no to, not with "Just
 *      tell me what to do" or "Show me everything", not a door on Home.
 *   5  Making my Move, opened again: the suggestion, Add it puts it on Home,
 *      No thanks is kept and never asked again.
 *
 * Red on alongside-v725.
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


const { AIMS_FOR, aimsForMost, suggestion } = await import(B + "data/my-move.js");
const { aimById, HELD_AIMS } = await import(B + "data/aims.js");
const { ArcSetupView } = await import(B + "views/arc-setup.js");
const { MyMoveView } = await import(B + "views/my-move.js");
const set = m => store.setMyMove({ made: "2026-11-23T10:00:00.000Z", step: null, ...m });
const MY = { purposes: ["stronger", "stretch", "instep"], most: "stretch", goodDay: "few", hardDay: ["coach"] };
const runs = (door, n, daysAgo = 2) => Array.from({ length: n }, (_, i) => ({ id: door + i, type: "workout", door, completed: true, durationMins: 20,
  completedAt: new Date(Date.now() - (daysAgo + i * 0.1) * 864e5).toISOString() }));
const withLog = extra => store.set("activityLog", [...(store.get("activityLog") || []), ...extra]);

console.log("\nTEST 1 - the aims for each purpose");
const all = Object.values(AIMS_FOR).flat();
const heldIds = (HELD_AIMS || []).map(a => (a && a.id) || a);
ok("1a. every aim named exists", all.every(id => !!aimById(id)), all.filter(id => !aimById(id)).join());
ok("1b. none is held for the clinical read", all.every(id => !heldIds.includes(id)));
ok("1c. all eight purposes have aims", ["stronger", "moving", "stretch", "feel", "yoga", "calm", "trend", "instep"].every(p => (AIMS_FOR[p] || []).length));
fixture(); store.setMyMove({ purposes: ["stretch"], most: "stretch" });
ok("1d. nothing led before it is made", aimsForMost().length === 0);
set(MY);
ok("1e. once made, Stretch's aims", JSON.stringify(aimsForMost()) === JSON.stringify(AIMS_FOR.stretch));

console.log("\nTEST 2 - the arc's aims");
const arcScreen = () => { main.innerHTML = ""; ArcSetupView(fakeRouter).mount(main); };
const aimOrder = () => [...main.querySelectorAll("[data-aim]")].map(b => b.dataset.aim);
fixture({ arc: false }); arcScreen();
ok("2a. without Making my Move: as before, no line", !main.querySelector("#as-most") && aimOrder().length > 0);
set(MY); arcScreen();
ok("2b. Stretch's aims lead, in order", JSON.stringify(aimOrder().slice(0, 4)) === JSON.stringify(AIMS_FOR.stretch), aimOrder().join());
ok("2c. eight at most, no repeats", aimOrder().length <= 8 && new Set(aimOrder()).size === aimOrder().length);
ok("2d. one line says why", txt(main.querySelector("#as-most")) === "The first ones fit what you said matters most: Stretch.", txt(main.querySelector("#as-most")));
click(main.querySelector("#as-all-btn"));
ok("2e. None of these still shows everything", aimOrder().length > 8, aimOrder().length);

console.log("\nTEST 3 - Home offers the arc");
fixture({ arc: false, checkin: { energy: 7, mood: 7 } }); set(MY); home();
const arcLink = () => main.querySelector('.path-mm [data-action="mm-arc"]');
ok("3a. Set what you're working towards, under Today", txt(arcLink()) === "Set what you're working towards", txt(main.querySelector(".path-mm")));
click(arcLink());
ok("3b. it opens the arc's questions", navs.at(-1) === "arc-setup", navs.at(-1));
fixture({ arc: true, checkin: { energy: 7, mood: 7 } }); set(MY); home();
ok("3c. not once an arc is set", !arcLink());
fixture({ arc: false, checkin: { energy: 7, mood: 7 } }); home();
ok("3d. not before Making my Move is made", !arcLink());

console.log("\nTEST 4 - a suggestion");
fixture(); set(MY); withLog(runs("feel", 5));
ok("4a. five starts behind Move to feel better: suggested", suggestion()?.id === "feel", JSON.stringify(suggestion()));
fixture(); set(MY); withLog(runs("feel", 4));
ok("4b. four: not yet", suggestion() === null);
fixture(); set(MY); withLog(runs("feel", 5, 31));
ok("4c. older than 30 days: not counted", suggestion() === null);
fixture(); set({ ...MY, dismissed: ["feel"] }); withLog(runs("feel", 6));
ok("4d. said no to: never again", suggestion() === null);
fixture(); set({ ...MY, goodDay: "one" }); withLog(runs("feel", 6));
ok("4e. not with Just tell me what to do", suggestion() === null);
fixture(); set({ ...MY, goodDay: "all" }); withLog(runs("feel", 6));
ok("4f. not with Show me everything", suggestion() === null);
fixture(); set(MY); withLog(runs("stretch", 9));
ok("4g. not a door already on Home", suggestion() === null);

console.log("\nTEST 5 - Making my Move, opened again");
const mm = () => { main.innerHTML = ""; MyMoveView(fakeRouter).mount(main); };
const sug = () => main.querySelector(".mm-suggest");
fixture(); set(MY); withLog(runs("feel", 5)); mm();
ok("5a. the suggestion leads What's it for?", /You've used Move to feel better often lately\. Put it on Home\?/.test(txt(sug())) && txt(main.querySelector("h1")) === "What's it for?", txt(sug()));
ok("5b. labelled by its line", sug()?.getAttribute("aria-labelledby") === "mm-suggest-h");
click(main.querySelector("[data-sug-yes]"));
ok("5c. Add it puts it on Home", store.get("myMove").purposes.includes("feel") && !sug());
fixture(); set(MY); withLog(runs("feel", 5)); mm();
click(main.querySelector("[data-sug-no]"));
ok("5d. No thanks is kept", JSON.stringify(store.get("myMove").dismissed) === JSON.stringify(["feel"]) && !sug());
mm();
ok("5e. and not asked again", !sug());
ok("5f. Which matters most says what it does", /The aims that fit it come first when you set what you're working towards\./.test(txt(main.querySelector(".mm-field"))), txt(main.querySelector(".mm-field")));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
