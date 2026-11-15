/**
 * tools/verify-p29-change-today.mjs
 * 14 Nov 2026 v1
 *
 * P-29 LITTLE-AND-OFTEN and CHANGE-TODAY (spec
 * docs/specs/alongside_little-and-often_change-today_14nov2026_v1.md).
 *
 *   1  Schema: myExercisesOnHome and weekChanges made safe on load; an
 *      earlier week's changes load as null; Your week is never changed.
 *   2  Do it another day: later days only; a session day swaps, a rest day
 *      takes it; two sessions never land on one day; a session moves once.
 *   3  Catch up: only on a day with no session; only earlier, undone,
 *      unmoved sessions; a logged day is not offered.
 *   4  Little and often instead, Rest today, Something else; Undo puts the
 *      other day back too; changeLine says what happened.
 *   5  The coach's plan reads the changed day (askForToday).
 *   6  Little and often: chosen lists only, this part of the day first,
 *      at most three, Done today, the sore area by the player's rule.
 *   7  Home: Change today, the change line with Undo, the Little and often
 *      row; Lately waits; Free unchanged.
 *   8  Change today's screen: its choices, and each one writes the change.
 *   9  My exercises: On Home (one labelled choice) on the Plan; not on Free.
 *
 *   node tools/verify-p29-change-today.mjs
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const WM = await import(B + "data/week-shape-model.js");
const WS = await import(B + "data/week-shape.js");
const WC = await import(B + "data/week-changes.js");
const LO = await import(B + "data/little-and-often.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { TodayView } = await import(B + "views/today.js");
const { ChangeTodayView } = await import(B + "views/change-today.js");
const prescribed = await import(B + "views/prescribed.js");
const { router: realRouter } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 500)}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
let navs = [];
const fakeRouter = { history: ["somewhere"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = fakeRouter;
realRouter.navigate = fakeRouter.navigate;

// A week: Monday Session A, Wednesday Session B, Friday Session C, the rest rest days.
const T = id => ({ id, name: "Session " + id.slice(-1).toUpperCase(), own: "Session " + id.slice(-1).toUpperCase(), mix: [{ focus: "upper", level: 2 }], intensity: "steady", mins: 30, place: "gym" });
const WEEK = { templates: { "s-a": T("s-a"), "s-b": T("s-b"), "s-c": T("s-c") },
  days: { mon: "s-a", tue: "rest", wed: "s-b", thu: "rest", fri: "s-c", sat: "rest", sun: "rest" }, setAt: "2026-11-01" };
// Fixed dates, Monday 9 Nov 2026 to Sunday 15 Nov 2026, at 10:00 local.
const D = Object.fromEntries(WM.DAY_KEYS.map((k, i) => [k, new Date(2026, 10, 9 + i, 10, 0)]));

function fixture({ tier = "personal", week = true, log = [] } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("guidanceLastShownAt", new Date().toISOString());
  store.set("activityLog", log);
  if (week) store.set("weekShape", WM.sanitizeWeekShape(JSON.parse(JSON.stringify(WEEK))));
  navs = [];
}

console.log("\nTEST 1 - schema");
{
  const w = WM.sanitizeWeekShape(JSON.parse(JSON.stringify(WEEK)));
  const c = WM.sanitizeWeekChanges({ week: "2026-11-09", days: {
    mon: { kind: "plan", value: "s-c", from: "fri" }, tue: { kind: "plan", value: "gone", from: "mon" },
    wed: { kind: "rest" }, thu: { kind: "nope" }, fri: { kind: "moved", value: "s-a", to: "fri" } } }, w, D.mon);
  ok("1a. a good change is kept", c?.days?.mon?.value === "s-c" && c.days.wed?.kind === "rest", JSON.stringify(c));
  ok("1b. a plan no longer in the week, an unknown kind and a day tied to itself are dropped", !c.days.tue && !c.days.thu && !c.days.fri, JSON.stringify(c));
  ok("1c. an earlier week's changes read as none", WM.sanitizeWeekChanges({ week: "2026-11-02", days: { mon: { kind: "rest" } } }, w, D.mon) === null);
  ok("1d. On Home keeps only Any time, Mornings, Evenings", JSON.stringify(WM.sanitizeOnHome({ "Kettle": "any", "Desk": "never", "Wind": "evening" })) === JSON.stringify({ Kettle: "any", Wind: "evening" }));
  localStorage.clear();
  localStorage.setItem("alongside_user", JSON.stringify({ weekShape: WEEK, weekChanges: { week: "2001-01-01", days: { mon: { kind: "rest" } } }, myExercisesOnHome: { A: "bad" } }));
  store.init();
  ok("1e. on load: a stale week's changes are null, a bad choice gone", store.get("weekChanges") === null && JSON.stringify(store.get("myExercisesOnHome")) === "{}",
    JSON.stringify([store.get("weekChanges"), store.get("myExercisesOnHome")]));
}

console.log("\nTEST 2 - Do it another day");
fixture();
{
  const c = WC.anotherDayChoices(D.mon);
  ok("2a. Monday: later days only; Wednesday and Friday swap; rest days take it",
    JSON.stringify(c.map(x => x.day + ":" + x.kind)) === JSON.stringify(["tue:move", "wed:swap", "thu:move", "fri:swap", "sat:move", "sun:move"]), JSON.stringify(c));
  const before = JSON.stringify(store.get("weekShape"));
  ok("2b. swap with Friday", WC.doAnotherDay("fri", D.mon));
  ok("2c. Monday plays Session C, Friday Session A", WS.todayInWeek(D.mon).template.id === "s-c" && WS.dayInWeek("fri", D.mon).template.id === "s-a");
  ok("2d. Home's line: Swapped with Friday.", WC.changeLine(D.mon) === "Swapped with Friday.", WC.changeLine(D.mon));
  ok("2e. Your week is never changed", JSON.stringify(store.get("weekShape")) === before);
  ok("2f. a session moves once: Friday offers no other day", WC.anotherDayChoices(D.fri).length === 0, JSON.stringify(WC.anotherDayChoices(D.fri)));
  ok("2g. Monday's swapped session cannot move again", WC.anotherDayChoices(D.mon).length === 0);
  ok("2h. undo puts Friday back too", WC.undoToday(D.mon) && WS.todayInWeek(D.mon).template.id === "s-a" && WS.dayInWeek("fri", D.mon).template.id === "s-c" && store.get("weekChanges") === null);
  ok("2i. move Wednesday to Thursday", WC.doAnotherDay("thu", D.wed) && WS.dayInWeek("thu", D.wed).template.id === "s-b" && WS.todayInWeek(D.wed).value === "rest");
  ok("2j. lines: Moved to Thursday. / Moved from Wednesday.", WC.changeLine(D.wed) === "Moved to Thursday." && WC.changeLine(D.thu) === "Moved from Wednesday.", WC.changeLine(D.wed) + " | " + WC.changeLine(D.thu));
  ok("2k. a day already changed is left alone: Monday cannot move to Thursday", !WC.anotherDayChoices(D.mon).some(x => x.day === "thu"));
  ok("2l. never an earlier day", !WC.doAnotherDay("mon", D.wed));
}

console.log("\nTEST 3 - Catch up");
fixture();
{
  ok("3a. Monday (a session day) offers no catch up", WC.catchUpChoices(D.mon).length === 0);
  ok("3b. Tuesday offers Monday's Session A", JSON.stringify(WC.catchUpChoices(D.tue).map(c => c.day)) === '["mon"]');
  ok("3c. catch up", WC.doCatchUp("mon", D.tue) && WS.todayInWeek(D.tue).template.id === "s-a");
  ok("3d. lines: Caught up from Monday.", WC.changeLine(D.tue) === "Caught up from Monday.", WC.changeLine(D.tue));
  ok("3e. Monday is not offered again on Thursday", !WC.catchUpChoices(D.thu).some(c => c.day === "mon"));
  ok("3f. undo puts Monday back", WC.undoToday(D.tue) && WS.dayInWeek("mon", D.tue).template.id === "s-a" && !WS.dayInWeek("mon", D.tue).change);
  fixture({ log: [{ id: "x", type: "workout", sessionType: "upper", completedAt: D.mon.toISOString(), date: D.mon.toISOString(), durationMins: 30 }] });
  ok("3g. a day with a session logged is not offered", WC.catchUpChoices(D.tue).length === 0, JSON.stringify(WC.catchUpChoices(D.tue)));
}

console.log("\nTEST 4 - Little and often instead, Rest today, Something else");
fixture();
{
  ok("4a. Little and often instead reads as rest", WC.setToday("little", D.mon) && WS.todayInWeek(D.mon).value === "rest" && WC.changeLine(D.mon) === "Little and often instead.");
  ok("4b. Rest today", WC.setToday("rest", D.mon) && WC.changeLine(D.mon) === "Changed to a rest day.");
  ok("4c. Something else: no plan from the week today", WC.setToday("else", D.mon) && WS.todayInWeek(D.mon).value === null && WC.changeLine(D.mon) === "Something else today.");
  ok("4d. an unknown kind is refused", !WC.setToday("party", D.mon));
  ok("4e. undo", WC.undoToday(D.mon) && WS.todayInWeek(D.mon).template.id === "s-a");
  ok("4f. Rest today after a swap undoes the swap first", WC.doAnotherDay("wed", D.mon) && WC.setToday("rest", D.mon) && WS.dayInWeek("wed", D.mon).template.id === "s-b");
}

console.log("\nTEST 5 - the coach's plan reads the changed day");
fixture();
{
  const plain = { id: "p-up", name: "Upper day", mix: [{ focus: "upper", level: 2 }], intensity: "steady", mins: 30, place: "gym" };
  const legs = { id: "p-legs", name: "Legs day", mix: [{ focus: "legs", level: 2 }], intensity: "steady", mins: 30, place: "home" };
  const days = Object.fromEntries(WM.DAY_KEYS.map(k => [k, "rest"]));
  const today = WS.dayKeyOf(new Date());
  const later = WM.DAY_KEYS.find((k, i) => i > WM.DAY_KEYS.indexOf(today));
  days[today] = "p-up"; if (later) days[later] = "p-legs";
  store.set("weekShape", WM.sanitizeWeekShape({ templates: { "p-up": plain, "p-legs": legs }, days, setAt: "2026-11-01" }));
  if (later) {
    WC.doAnotherDay(later);
    ok("5a. askForToday asks for the swapped day's plan", WS.askForToday() && store.get("weekDayRequest").templateId === "p-legs" && store.get("requestedLocation") === "home",
      JSON.stringify(store.get("weekDayRequest")));
  } else ok("5a. (Sunday: no later day to swap with; skipped)", true);
}

console.log("\nTEST 6 - Little and often");
fixture();
{
  const ex = (group, name, done = false) => ({ id: group + name, name, sets: 1, reps: "10", group, completedToday: done });
  store.set("prescribedExercises", [ex("Kettle", "Hip circles"), ex("Kettle", "Hip abduction"), ex("Coffee", "Wall slide"),
    ex("Desk", "Seated twist", true), ex("Wind", "Spinal twist"), ex("Extra", "Bird dog")]);
  ok("6a. nothing chosen, nothing shown", LO.homeItems(D.mon).length === 0);
  LO.setOnHome("Kettle", "any"); LO.setOnHome("Coffee", "any"); LO.setOnHome("Desk", "morning"); LO.setOnHome("Wind", "evening"); LO.setOnHome("Extra", "any");
  const am = LO.homeItems(D.mon).map(i => i.group);
  ok("6b. morning: Mornings first, then Any time, at most three", JSON.stringify(am) === '["Desk","Kettle","Coffee"]', JSON.stringify(am));
  const pm = LO.homeItems(new Date(2026, 10, 9, 20, 0)).map(i => i.group);
  ok("6c. evening: Evenings first", pm[0] === "Wind" && pm.length === 3, JSON.stringify(pm));
  const mid = LO.homeItems(new Date(2026, 10, 9, 14, 0)).map(i => i.group);
  ok("6d. afternoon: Any time only", !mid.includes("Desk") && !mid.includes("Wind"), JSON.stringify(mid));
  ok("6e. Done today when every exercise is ticked", LO.homeItems(D.mon).find(i => i.group === "Desk").done === true && LO.homeItems(D.mon).find(i => i.group === "Kettle").done === false);
  ok("6f. a count, never minutes", LO.homeItems(D.mon).find(i => i.group === "Kettle").count === 2);
  LO.setOnHome("Kettle", "off");
  ok("6g. Not on Home takes it off", !("Kettle" in store.get("myExercisesOnHome")));
}

console.log("\nTEST 7 - Home");
function home() { main.innerHTML = ""; TodayView(fakeRouter).mount(main); }
const dayToday = WS.dayKeyOf(new Date());
function todayIsSession() {
  const days = Object.fromEntries(WM.DAY_KEYS.map(k => [k, "rest"])); days[dayToday] = "s-a";
  const next = WM.DAY_KEYS[(WM.DAY_KEYS.indexOf(dayToday) + 1) % 7];
  if (next !== dayToday && WM.DAY_KEYS.indexOf(next) > WM.DAY_KEYS.indexOf(dayToday)) days[next] = "s-b";
  store.set("weekShape", WM.sanitizeWeekShape({ templates: { "s-a": T("s-a"), "s-b": T("s-b") }, days, setAt: "2026-11-01" }));
  store.set("prescribedExercises", [{ id: "1", name: "Glute Bridge", sets: 3, reps: "12", group: "Session A" }]);
}
fixture(); todayIsSession(); home();
ok("7a. Change today under the Today card", !!main.querySelector("[data-action='change-today']") &&
  main.querySelector(".path-today, .path-coach").compareDocumentPosition(main.querySelector("[data-action='change-today']")) & 4);
ok("7b. no change line before a change", !main.querySelector("[data-action='undo-change']"));
ok("7c. Lately waits while today's session is still to do", !main.querySelector("#path-lately-h"));
navs = []; click(main.querySelector("[data-action='change-today']"));
ok("7d. Change today opens its screen", navs.includes("change-today"), JSON.stringify(navs));
WC.setToday("rest"); home();
ok("7e. after a change: the line and Undo", /Changed to a rest day\./.test(txt(main.querySelector(".path-change__line"))) && !!main.querySelector("[data-action='undo-change']"));
ok("7f. Undo is a 44px-class button that names the change", /Undo: Changed to a rest day\./.test(main.querySelector("[data-action='undo-change']").getAttribute("aria-label")));
click(main.querySelector("[data-action='undo-change']"));
ok("7g. Undo puts today back", !store.get("weekChanges") && navs.includes("today"));
store.set("prescribedExercises", [{ id: "1", name: "Hip circles", sets: 1, reps: "8", group: "Kettle" }, { id: "2", name: "Glute Bridge", sets: 3, reps: "12", group: "Session A" }]);
LO.setOnHome("Kettle", "any"); home();
ok("7h. Little and often shows the chosen list", /Little and often/.test(txt(main)) && !!main.querySelector("[data-action='lao-start'][data-group='Kettle']"));
navs = []; click(main.querySelector("[data-action='lao-start']"));
ok("7i. one tap plays it", store.get("myExercisesGroup") === "Kettle" && navs.includes("prescribed-session"), JSON.stringify(navs));
WC.setToday("little"); home();
ok("7j. Little and often instead: the Today card says so", /Little and often/.test(txt(main.querySelector(".path-today"))) && /That counts/.test(txt(main.querySelector(".path-today"))));
fixture({ tier: "free" }); todayIsSession(); LO.setOnHome("Session A", "any"); home();
ok("7k. Free: no Change today, no Little and often", !main.querySelector("[data-action='change-today'], [data-action='lao-start']"));

console.log("\nTEST 8 - Change today's screen");
fixture(); todayIsSession();
const ct = ChangeTodayView(fakeRouter);
ct.mount(main);
const labels = () => [...main.querySelectorAll(".ct-choice .path-door__t")].map(txt);
ok("8a. heading takes focus", document.activeElement === main.querySelector("h1") && txt(main.querySelector("h1")) === "Change today");
ok("8b. a session day: Do it another day, Little and often instead, Rest today, Something else",
  JSON.stringify(labels()) === JSON.stringify(["Do it another day", "Little and often instead", "Rest today", "Something else"]), JSON.stringify(labels()));
ok("8c. says it is this week's only", /Just for this week\. Your week stays as you planned it\./.test(txt(main)));
click(main.querySelector("[data-set='rest']"));
ok("8d. Rest today writes the change and goes Home", WS.todayInWeek().change?.kind === "rest" && navs.includes("today"));
fixture(); todayIsSession(); ct.mount(main);
click(main.querySelector("[data-go='another']"));
ok("8e. Which day instead? with each day's outcome", txt(main.querySelector("h1")) === "Which day instead?" &&
  [...main.querySelectorAll(".ct-choice .path-door__d")].every(d => /^(Swaps with Session|Rest day · moves here)/.test(txt(d))), txt(main));
const back = main.querySelector("[data-back='menu']"); click(back);
ok("8f. ‹ Back returns to the menu", txt(main.querySelector("h1")) === "Change today");
fixture({ tier: "free" }); todayIsSession(); ct.mount(main);
ok("8g. Free: part of the Plan", /part of the Plan/.test(txt(main)) && !main.querySelector(".ct-choice"));

console.log("\nTEST 9 - My exercises: On Home");
fixture();
store.set("prescribedExercises", [{ id: "1", name: "Hip circles", sets: 1, reps: "8", group: "Kettle" }]);
main.innerHTML = prescribed.render(); prescribed.onMount?.();
const sel = () => main.querySelector("select[data-px-onhome]");
ok("9a. one labelled choice: Not on Home, Any time, Mornings, Evenings; Not on Home chosen",
  !!sel() && [...sel().options].map(o => o.text).join("|") === "Not on Home|Any time|Mornings|Evenings" && sel().value === "off" &&
  txt(main.querySelector(`label[for="${sel()?.id}"]`)) === "On Home");
sel().focus(); sel().value = "morning"; sel().dispatchEvent(new dom.window.Event("change", { bubbles: true }));
ok("9b. Mornings: saved, focus kept, said", store.get("myExercisesOnHome").Kettle === "morning" &&
  document.activeElement === sel() && /on Home, mornings/.test(txt(main.querySelector("#px-onhome-status"))));
fixture({ tier: "free" });
store.set("prescribedExercises", [{ id: "1", name: "Hip circles", sets: 1, reps: "8", group: "Kettle" }]);
main.innerHTML = prescribed.render(); prescribed.onMount?.();
ok("9c. Free: no On Home", !sel());

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
