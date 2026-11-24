import { createRequire as __cr } from "node:module";
/**
 * tools/verify-p46-ask-later.mjs
 * 24 Nov 2026 v1
 *
 * P-46 FREE-AND-FIRST, S3 ASK LATER (spec
 * docs/specs/alongside_free-and-first_24nov2026_v1.md, v2, section 4).
 * Drives the real Home (TodayView) on both tiers.
 *
 *   0  Controls: the fixture is a short start; nothing asked before a session.
 *   1  activity after the first finished session; writes the old step 9's
 *      values; Coming back asks From what? with the health consent only.
 *   2  goals after the third, Free only; up to three; Done.
 *   3  weekly a week after getting started; writes the target and setAt.
 *   4  Never on a hard day; Not now is final; one question a day.
 *   5  Only for the short start; an answered field is never asked.
 *   6  The Plan: placed under Today, not on a hard day, not beside another
 *      question; six ways in unchanged.
 *
 * Red on alongside-v739.
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
const HC = await import(B + "data/health-consent.js");

function fixture({ tier = "free", flow = "short", sessions = 0, startedDaysAgo = 1, checkin = null, health = true } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  if (!health) HC.declineHealthConsent();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", tier);
  if (flow) store.set("onboarding.flow", flow);
  store.set("onboarding.threadCompletedAt", new Date(Date.now() - startedDaysAgo * 864e5).toISOString());
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("guidanceShownAt", new Date().toISOString());
  store.set("activityLog", Array.from({ length: sessions }, (_, i) => ({ id: "a" + i, type: "workout", sessionType: "full", completedAt: new Date(Date.now() - (i + 1) * 3600e3).toISOString(), durationMins: 15, completed: true })));
  if (tier === "personal") store.setMyMove({ made: new Date().toISOString(), purposes: ["stronger", "moving", "instep"], most: "stronger", goodDay: "few", hardDay: ["coach"], startClosed: new Date().toISOString() });
  if (checkin) {
    store.set("checkinHistory", { [todayKey]: { energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString() } });
    store.set("lastCheckin", { energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  }
  navs = []; delete fakeRouter.pathStart;
}
function home() { main.innerHTML = ""; TodayView(fakeRouter).mount(main); }
const card = () => main.querySelector("[data-al]");
const pick = v => click(main.querySelector(`[data-al-pick="${v}"]`));

console.log("\nTEST 0 - controls");
fixture({ sessions: 0 }); home();
ok("0a. the fixture reaches Free Home", !!main.querySelector('[data-action="start-today"]'), txt(main).slice(0, 100));
ok("0b. before any session: no question (nothing is asked before a first session)", !card());

console.log("\nTEST 1 - activity, after the first finished session");
fixture({ sessions: 1 }); home();
ok("1a. after one session: How active have you been lately? with the old step 9's five answers", card()?.dataset.al === "activity" && /How active have you been lately\?/.test(txt(card())) && main.querySelectorAll("[data-al-pick]").length === 5 && /Not now/.test(txt(card())), txt(card()));
ok("1b. shown today is recorded", !!store.get("askLater").activity?.shownAt);
pick("moderate");
ok("1c. an answer writes lifestyle.activityLevel as step 9 did, marks it answered, Home redrawn", store.get("lifestyle.activityLevel") === "moderate" && !!store.get("askLater").activity.answeredAt && navs.includes("today"));
ok("1d. it lifts the safe default (declaredLevel follows the answer)", store.declaredLevel() === "moderate");
home();
ok("1e. answered: not asked again", !card());
fixture({ sessions: 1 }); home(); pick("returning");
ok("1f. Coming back, with the health consent: From what? next, in the same card", card()?.dataset.alStage === "returning" && /Coming back from what\?/.test(txt(card())) && store.get("lifestyle.activityLevel") === "returning" && !store.get("askLater").activity.answeredAt);
pick("injury");
ok("1g. From what? writes lifestyle.returningAfter and finishes", store.get("lifestyle.returningAfter") === "injury" && !!store.get("askLater").activity.answeredAt);
fixture({ sessions: 1, health: false }); home(); pick("returning");
ok("1h. without the health consent: no From what? (a health answer)", !card()?.dataset.alStage && store.get("lifestyle.returningAfter") == null && !!store.get("askLater").activity.answeredAt);

console.log("\nTEST 2 - goals, after the third, Free only");
fixture({ sessions: 3 }); store.set("lifestyle.activityLevel", "light"); home();
ok("2a. three sessions, activity answered: What do you most want from this? Pick up to 3.", card()?.dataset.al === "goals" && /Pick up to 3\./.test(txt(card())));
pick("get-stronger"); pick("balance"); pick("reduce-stress"); pick("more-energy");
ok("2b. up to three, in the order picked; a fourth is not added", JSON.stringify(store.get("goals")) === JSON.stringify(["get-stronger", "balance", "reduce-stress"]), JSON.stringify(store.get("goals")));
pick("balance");
ok("2c. tapping again takes one off; aria-pressed follows", JSON.stringify(store.get("goals")) === JSON.stringify(["get-stronger", "reduce-stress"]) && main.querySelector('[data-al-pick="balance"]').getAttribute("aria-pressed") === "false");
click(main.querySelector("[data-al-done]"));
ok("2d. Done marks it answered", !!store.get("askLater").goals?.answeredAt);
fixture({ tier: "personal", sessions: 3 }); store.set("lifestyle.activityLevel", "light"); home();
ok("2e. the Plan is never asked goals (Making my Move)", !card(), card()?.dataset.al);

console.log("\nTEST 3 - weekly, a week after getting started");
fixture({ sessions: 0, startedDaysAgo: 8 }); home();
ok("3a. a week on: How many times a week feels realistic? (the old step 12's answers)", card()?.dataset.al === "weekly" && main.querySelectorAll("[data-al-pick]").length === 5, card()?.dataset.al);
pick("5plus");
ok("3b. 5 or more writes 5 and setAt, as step 12 did", store.get("strategicGoal.weeklySessionTarget") === 5 && !!store.get("strategicGoal.setAt") && !!store.get("askLater").weekly.answeredAt);
fixture({ sessions: 0, startedDaysAgo: 6 }); home();
ok("3c. six days on: not yet", !card());

console.log("\nTEST 4 - the rules");
fixture({ sessions: 1, checkin: { energy: 3, mood: 6 } }); home();
ok("4a. a hard day (energy Low): no question", !card());
fixture({ sessions: 1, checkin: { energy: 6, mood: 2 } }); home();
ok("4b. a hard day (mood Struggling): no question", !card());
fixture({ sessions: 3, startedDaysAgo: 8 }); home();
ok("4c. three due at once: the first in order (activity)", card()?.dataset.al === "activity");
click(main.querySelector("[data-al-not]"));
ok("4d. Not now is recorded and final", !!store.get("askLater").activity.notNowAt && store.get("lifestyle.activityLevel") == null);
home();
ok("4e. one question a day: after Not now, nothing else today", !card());
store.setAskLater("activity", { shownAt: new Date(Date.now() - 2 * 864e5).toISOString() }); home();
ok("4f. another day: the next question (goals), activity never again", card()?.dataset.al === "goals", card()?.dataset.al);
fixture({ sessions: 1 }); home(); home();
ok("4g. shown, unanswered, opened again the same day: still that one", card()?.dataset.al === "activity");

console.log("\nTEST 5 - only for the short start, only what is unanswered");
fixture({ flow: null, sessions: 3, startedDaysAgo: 8 }); home();
ok("5a. the old conversation's people: never asked (their skips stand)", !card());
fixture({ sessions: 3, startedDaysAgo: 8 }); store.set("lifestyle.activityLevel", "active"); store.set("goals", ["get-stronger"]); store.set("strategicGoal.setAt", new Date().toISOString()); home();
ok("5b. everything answered elsewhere (Settings): nothing asked", !card());

console.log("\nTEST 6 - the Plan");
fixture({ tier: "personal", sessions: 1 }); home();
ok("6a. the Plan asks activity, in its Home", card()?.dataset.al === "activity" && !!main.querySelector(".path-home"));
{ const withCard = [...main.querySelectorAll(".path-home button:not([data-al-pick]):not([data-al-not]):not([data-al-done])")].length;
  store.setAskLater("activity", { notNowAt: new Date().toISOString() }); home();
  const without = [...main.querySelectorAll(".path-home button")].length;
  ok("6b. the card adds only its own answers: every other button on Home is the same with it or without", withCard === without, `${withCard} vs ${without}`);
  fixture({ tier: "personal", sessions: 1 }); home(); }
pick("light");
ok("6c. answered on the Plan the same way", store.get("lifestyle.activityLevel") === "light" && !!store.get("askLater").activity.answeredAt);
fixture({ tier: "personal", sessions: 1, checkin: { energy: 2, mood: 6 } }); home();
ok("6d. the Plan on a hard day: no question", !card());
fixture({ tier: "personal", sessions: 1 }); store.set("liveInbox", [{ id: "m1", at: new Date().toISOString(), noticed: false, lists: [] }]); home();
ok("6e. another question is asking (a physio's changes): it shows, and this one waits", !!main.querySelector('[data-action="ask-live-yes"]') && !card(), `live=${!!main.querySelector('[data-action="ask-live-yes"]')} card=${!!card()}`);

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
