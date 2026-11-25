import { createRequire as __cr } from "node:module";
/**
 * tools/verify-p46-free-home.mjs
 * 24 Nov 2026 v2
 *
 * v2 - P-46 WAVE 8 FIX. The list ends with A walk or a run, which opens the
 *   guided run (Wave 8, persona 2.1).
 *
 * 24 Nov 2026 v1
 *
 * P-46 FREE-AND-FIRST, S4 FREE HOME (spec
 * docs/specs/alongside_free-and-first_24nov2026_v1.md, v2, section 5).
 * Drives the real Home (TodayView), the real steps (PathView) and the real
 * router on Free.
 *
 *   0  Controls: Free Home reached; the Plan's Home unchanged.
 *   1  The Today card: check in; then today's session; then Done today.
 *   2  Something gentler: mobility, the shortest length, the place given;
 *      through the check-in when today has none.
 *   3  Six ready-made sessions, by place; the length; Start in the player.
 *   4  Log what I did; Your exercises only with a list; what the Plan adds.
 *   5  The door tiles, the arc row and the Library row are gone from Free.
 *   6  Kept word for word: the advice line, the scope notice, the rescued
 *      note, the low-mood line.
 *   7  Free routes that moved open one page; In Step and the players stay.
 *
 * Red on alongside-v740.
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
const realNavigate = realRouter.navigate.bind(realRouter);
const { PathView } = await import(B + "views/path.js");
const RS = await import(B + "data/ready-sessions.js");
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
const todayKey = new Date().toISOString().split("T")[0];
const HC = await import(B + "data/health-consent.js");

function fixture({ tier = "free", sessions = 0, today = false, checkin = null, place = null, list = false } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  store.set("onboarding.flow", "short");
  store.set("onboarding.threadCompletedAt", new Date(Date.now() - 864e5).toISOString());
  store.set("askLater", { activity: { notNowAt: new Date().toISOString() }, goals: { notNowAt: new Date().toISOString() }, weekly: { notNowAt: new Date().toISOString() } });
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("guidanceShownAt", new Date().toISOString());
  const log = Array.from({ length: sessions }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "full", name: "Gentle full body", completedAt: new Date(Date.now() - (i + 1) * 864e5 - 3600e3).toISOString(), durationMins: 15, completed: true }));
  if (today) log.push({ id: "t", type: "workout", sessionType: "full", name: "Gentle full body", completedAt: new Date().toISOString(), durationMins: 15, completed: true });
  store.set("activityLog", log);
  if (place) store.set("sessionLocation", place);
  if (list) store.set("prescribedExercises", [{ id: "px1", name: "Calf raise", sets: 2, reps: 10 }]);
  if (tier === "personal") store.setMyMove({ made: new Date().toISOString(), purposes: ["stronger", "moving", "instep"], most: "stronger", goodDay: "few", hardDay: ["coach"], startClosed: new Date().toISOString() });
  if (checkin) {
    store.set("checkinHistory", { [todayKey]: { energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString() } });
    store.set("lastCheckin", { energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  }
  navs = []; delete fakeRouter.pathStart; delete fakeRouter.freeGentler;
}
function home() { main.innerHTML = ""; TodayView(fakeRouter).mount(main); }
const today = () => main.querySelector(".path-today");
const q = s => main.querySelector(s);

console.log("\nTEST 0 - controls");
fixture(); home();
ok("0a. the fixture reaches Free Home", !!q("h1") && /Sam/.test(txt(q("h1"))), txt(main).slice(0, 80));
fixture({ tier: "personal" }); home();
ok("0b. the Plan's Home is unchanged: its doors (Get stronger)", !!q(".path-door[data-door]") && !q(".free-home"));

console.log("\nTEST 1 - the Today card, in the Plan's look");
fixture(); home();
ok("1a. Free Home is the Plan's look (path-home), coach-led", !!q(".path-home.free-home") && !!q("h1.path-greeting"));
ok("1b. not checked in: How are you today? Three taps, then your session. Check in",
  today()?.dataset.state === "checkin" && /How are you today\?/.test(txt(today())) && /Three taps, then your session\./.test(txt(today())) && txt(today().querySelector("button")) === "Check in", txt(today()));
click(today().querySelector('[data-action="start-today"]'));
ok("1c. Check in goes to the check-in, then on to today's session", navs.includes("checkin") && store.get("pendingDoorRoute") === "coach-proposal");
fixture({ checkin: { energy: 6, mood: 6 } }); home();
ok("1d. checked in: Your session is ready, Show me my session", today()?.dataset.state === "ready" && txt(today().querySelector("button")) === "Show me my session");
click(today().querySelector("button"));
ok("1e. Show me my session opens Today's plan, no second check-in", navs.includes("coach-proposal") && !navs.includes("checkin"));
ok("1f. checked in: Update check-in is offered", !!q('[data-action="checkin-mini"]'));
fixture({ today: true }); home();
ok("1g. a session done today: Done today, its name", today()?.dataset.state === "done" && /Done today/.test(txt(today())) && /Gentle full body/.test(txt(today())));

console.log("\nTEST 2 - Something gentler");
fixture({ checkin: { energy: 6, mood: 6 }, place: "gym" }); home();
const gent = q('[data-action="free-gentler"]');
ok("2a. Something gentler: A short, easy session", /Something gentler/.test(txt(gent)) && /A short, easy session/.test(txt(gent)));
click(gent);
ok("2b. checked in: Today's plan, mobility, about ten minutes, at the place given",
  navs.includes("coach-proposal") && store.get("requestedSessionType") === "mobility" && store.get("requestedLocation") === "gym", JSON.stringify([navs, store.get("requestedSessionType"), store.get("requestedLocation")]));
const { lengthCatForToday } = await import(B + "data/session-length.js");
ok("2c. its length is the shortest (micro)", lengthCatForToday() === "micro", lengthCatForToday());
fixture(); home(); click(q('[data-action="free-gentler"]'));
ok("2d. no check-in yet: the check-in first, back to Home after", navs.includes("checkin") && store.get("pendingDoorRoute") === "today" && fakeRouter.freeGentler === true);
store.set("checkinHistory", { [todayKey]: { energy: 6, mood: 6, date: new Date().toDateString() } });
store.set("lastCheckin", { energy: 6, mood: 6, date: new Date().toDateString(), timestamp: new Date().toISOString() });
store.set("requestedSessionType", null); navs = []; home();
ok("2e. back from the check-in: on to the gentle session (the check-in cleared the request; Home asks again)", navs.includes("coach-proposal") && store.get("requestedSessionType") === "mobility" && !fakeRouter.freeGentler);
fixture(); home(); click(q('[data-action="free-gentler"]')); navs = []; home();
ok("2f. ‹ Back from the check-in (nothing answered): Home, and nothing waiting", !navs.includes("coach-proposal") && !!today() && !fakeRouter.freeGentler);

console.log("\nTEST 3 - six ready-made sessions");
fixture(); home();
const rdy = q('[data-action="free-ready"]');
ok("3a. Ready-made sessions: Six sessions, or a run", /Ready-made sessions/.test(txt(rdy)) && /Six sessions, or a run/.test(txt(rdy)));
click(rdy);
ok("3b. it opens the six at home (no gym given)", navs.includes("path") && fakeRouter.pathStart?.free === true && fakeRouter.pathStart.place === "home");
ok("3c. the six at home, as the spec names them", JSON.stringify(RS.FREE_READY.home) === JSON.stringify(["rm-gs-h1", "rm-gs-h5", "rm-gs-h6", "rm-km-h1", "rm-km-h2", "rm-km-h6"]));
ok("3d. with a gym, four take the place of the first four", JSON.stringify(RS.FREE_READY.gym.slice(0, 4)) === JSON.stringify(["rm-gs-g3", "rm-gs-g6", "rm-km-g2", "rm-km-g3"]) && JSON.stringify(RS.FREE_READY.gym.slice(4)) === JSON.stringify(RS.FREE_READY.home.slice(4)));
ok("3e. every one is a real session", RS.freeReady("home").length === 6 && RS.freeReady("gym").length === 6);
fixture({ place: "gym" }); home(); click(q('[data-action="free-ready"]'));
ok("3f. with a gym given at the start: the gym six", fakeRouter.pathStart?.place === "gym");
// The view itself, on Free. First, before Free has opened the six this session:
fixture(); navs = []; delete fakeRouter.pathStart;
main.innerHTML = ""; PathView(fakeRouter).mount(main);
ok("3l. any other way into the steps on Free: Home, as before", navs.includes("today"));
// The view itself, on Free.
fixture(); navs = [];
fakeRouter.pathStart = { free: true, place: "home" };
main.innerHTML = ""; const pv = PathView(fakeRouter); pv.mount(main);
const rows = [...main.querySelectorAll(".path-list button")];
ok("3g. the list: six, by name, each with its warm-up and stretch said, then A walk or a run (v2, Wave 8)", rows.length === 7 && /A walk or a run/.test(txt(rows[6])) && /Whole body at home/.test(txt(rows[0])) && /warm-up and ends with a stretch/.test(txt(main)), txt(main).slice(0, 200));
click(rows[0]);
ok("3h. then How long have you got?", /How long have you got\?/.test(txt(main)));
click(main.querySelector("#path-ready-go"));
ok("3i. then the session, with Start", !!main.querySelector("#path-start") && /Whole body at home/.test(txt(main.querySelector("h1"))));
ok("3j. Make it mine (Saved sessions) and Swap stay the Plan's", !main.querySelector("#path-mine") && !main.querySelector("[data-swap]"));
click(main.querySelector("#path-start"));
ok("3k. Start plays it in the one player", navs.includes("workout") && store.get("generatedSession")?.session?.id === "rm-gs-h1");
fixture(); navs = []; delete fakeRouter.pathStart;
main.innerHTML = ""; PathView(fakeRouter).mount(main);
ok("3m. mounted again with the hand-off spent (Back from the player): the six again, as the Plan's doors do", !navs.includes("today") && main.querySelectorAll(".path-list button").length === 7);
click([...main.querySelectorAll(".path-list button")].find(b => /A walk or a run/.test(txt(b))));
ok("3n. A walk or a run opens the guided run (it plays on both tiers): Wave 8, persona 2.1", navs.includes("running-session"));

console.log("\nTEST 4 - Log what I did, Your exercises, what the Plan adds");
fixture(); home();
const log = q('[data-route="activity-log"]');
ok("4a. Log what I did", /Log what I did/.test(txt(log)));
click(log);
ok("4b. it opens Log what I did, no check-in", navs.includes("activity-log") && !navs.includes("checkin"));
ok("4c. no list: no Your exercises", !q('[data-route="prescribed"]'));
fixture({ list: true }); home();
ok("4d. a list (a physio's stays Free, P-40): Your exercises", /Your exercises/.test(txt(q('[data-route="prescribed"]'))));
const up = q('[data-route="upgrade"]');
ok("4e. one line: Want more choice? See what the Plan adds", txt(up) === "Want more choice? See what the Plan adds");
click(up);
ok("4f. it opens the upgrade page", navs.includes("upgrade"));

console.log("\nTEST 5 - what moved to the Plan is gone from Free Home");
fixture(); home();
const t5 = txt(main);
ok("5a. no door tiles (Cardio, Core & Strength; Yoga & Pilates; Run; Classes)", !q(".today-door") && !/Cardio, Core & Strength|Yoga & Pilates|Mobility & Conditioning/.test(t5));
ok("5b. no arc row", !q(".today-arc") && !/Your arc/.test(t5));
ok("5c. no Library row, no What do you want to do today?", !q('[data-route="library"]') && !/What do you want to do today\?/.test(t5));
ok("5d. one h1, h2 under it (heading order)", main.querySelectorAll("h1").length === 1 && [...main.querySelectorAll("h2")].length >= 2);

console.log("\nTEST 6 - kept, word for word");
fixture(); store.set("guidanceShownAt", null); home();
ok("6a. the monthly advice line when due", !!q(".today-guidance"));
fixture(); store.set("scopeNoticeDue", true); home();
ok("6b. the scope notice when due, and Understood", !!q("[data-scope-notice]") && !!q('[data-action="scope-ok"]'));
fixture(); store.set("rescuedSession", { moves: 3 }); home();
ok("6c. the rescued note, once", /I saved what you did in your last session, 3 moves, just as it was\./.test(txt(main)));
fixture({ checkin: { energy: 6, mood: 2 } }); home();
ok("6d. a low mood: the coach says so, in their word (the website quotes it)", /You said you're struggling today\. Wellbeing has the quieter things, if that's more like it\./.test(txt(main)));

console.log("\nTEST 7 - Free routes that moved open one page");
const { OnThePlanView, PLAN_ONLY } = await import(B + "views/on-the-plan.js");
realRouter.navigate = realNavigate; window.router = realRouter;
fixture();
for (const r of ["library", "session-builder", "classes", "know-what", "your-week", "arc-setup"]) {
  await realRouter.navigate(r);
}
ok("7a. Free to the Library: the page, told which", realRouter.currentView === "on-the-plan" && realRouter.planOnly === "arc-setup");
await realRouter.navigate("library");
ok("7b. it says what it is in one line, Part of the Plan, See what the Plan adds, ‹ Back (to Home)",
  /The Library/.test(txt(main)) && /Every exercise, practice and session, to browse\./.test(txt(main)) && /Part of the Plan/.test(txt(main)) && !!q("#otp-plan") && txt(q("#otp-home")) === "‹ Back" && q("#otp-home").getAttribute("aria-label") === "Back to Home", txt(main));
await realRouter.navigate("in-step");
ok("7c. In Step stays on Free", realRouter.currentView === "in-step");
await realRouter.navigate("capture");
ok("7d. Make it up as I go still says why on the upgrade page", realRouter.currentView === "upgrade" && /Log what I did, on Home/.test(txt(main)));
await realRouter.navigate("yoga-session");
ok("7e. a session player stays (Today's plan can choose yoga)", realRouter.currentView === "yoga-session");
fixture({ tier: "personal" });
await realRouter.navigate("library");
ok("7f. the Plan: the Library as before", realRouter.currentView === "library");
ok("7g. every moved route has its line", ["session-builder", "mobility-conditioning", "classes", "class-player", "library", "know-what", "my-programme", "weekly-plan", "your-week", "arc-setup", "stretch-arc", "goal-setup"].every(r => PLAN_ONLY[r]?.[1]));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
