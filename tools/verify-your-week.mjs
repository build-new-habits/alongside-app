/**
 * tools/verify-your-week.mjs
 * 05 Oct 2026 v2
 *
 * v2 - Start waits for the plan to reach the player (up to five seconds)
 *   instead of a fixed 900ms: under the parallel suite 5l read the plan
 *   before the steady one was handed over (fresh-clone run, 05 Oct).
 *
 * D-6 WEEK-SHAPE. Graeme, 05 Oct: plan what each day of the week is for
 * ("Monday is upper body and maybe some gentle trunk stuff, but mostly
 * upper ... Tuesday legs and core and balance ... the coach can then
 * create whatever it does based on that"), with how hard, favourites (his
 * cable Pallof press) and not only one area all week. On the mock-up:
 * "It will obviously need to count against the arc and progress."
 *
 * Through the real router and the real coach's plan:
 *   1. Free sees that Your week is part of the Plan; nothing else.
 *   2. Setting a week: a ready-made week; Build it with me (choose days,
 *      the rest are rest); each day shown with what it is for.
 *   3. A day's plan: the mix (a little / some / mostly), how hard, how
 *      long, where, extras, favourites; Save keeps it, Back keeps nothing;
 *      a plan used on two days says so.
 *   4. Home: "Today, from your week" leads the doors; a rest day says so;
 *      Tell me what to do is then not the filled door.
 *   5. The plan it opens is the day's: its kind and place, its length, the
 *      other focuses in it, the favourite in when the kit is there and
 *      said to be left out when it is not, gentle one set fewer, the
 *      sentence "From your week". Through the check-in too.
 *   6. Only 10 minutes: ten minutes, still the day.
 *   7. It counts: the arc credits the day's other kinds, Progress counts
 *      the session, the week shows the day done.
 *   8. Across the week: the gap is named, Add puts it in a day, Leave
 *      leaves it for the week.
 *   9. Read once: the next plan from Home's own door is the coach's.
 *  10. Store: a bad saved week is made safe; schema round trip.
 */
import { agreed } from "./agreed.mjs";
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
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");
const WS = await import(B + "data/week-shape.js");
const WM = await import(B + "data/week-shape-model.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const byId = new Map(EXERCISES.map(e => [e.id, e]));

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 500)}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = async (el, ms = 80) => { el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); await wait(ms); };
const view = () => router.currentView;

const GYM = ["dumbbells-medium", "barbell", "bench-flat", "kettlebell-medium", "band-light", "gym-membership"];
const HOME = ["dumbbells-light", "band-light"];
const TODAY = WS.dayKeyOf();
const ARC = { active: true, aimId: "floor-unaided", strands: ["leg-strength", "trunk-strength"], marker: "Up off the floor",
  startedAt: new Date(Date.now() - 20 * 864e5).toISOString().slice(0, 10), zonesWorked: {}, typesWorked: {}, provenance: "self" };

function fixture(tier = "personal", { checkedIn = true } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("homeEquipment", HOME); store.set("gymEquipment", GYM); store.set("equipment", [...HOME, ...GYM]);
  store.set("sessionLocation", "home");
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("arc", JSON.parse(JSON.stringify(ARC)));
  if (checkedIn) store.set("lastCheckin", { timestamp: new Date().toISOString(), energy: 4, sleep: 4 });
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}

/** Graeme's Monday, set as today, whatever today is. */
function upperDay(over = {}) {
  return { id: "upper-day", name: "Upper day", mix: [{ focus: "upper", level: 2 }, { focus: "trunk", level: 1 }, { focus: "balance", level: 1 }, { focus: "stretch", level: 0 }],
           intensity: "gentle", mins: 40, place: "gym", extras: ["sauna"], favourites: ["gym-cable-pallof-press"], ...over };
}
function setWeek(todayTemplate, rest = false) {
  const days = Object.fromEntries(WM.DAY_KEYS.map(k => [k, "rest"]));
  const templates = {};
  if (!rest) { templates[todayTemplate.id] = todayTemplate; days[TODAY] = todayTemplate.id; }
  // Two more session days so the week is a week.
  const legs = { id: "legs-day", name: "Legs day", mix: [{ focus: "legs", level: 2 }, { focus: "trunk", level: 1 }], intensity: "steady", mins: 30, place: "gym" };
  templates[legs.id] = legs;
  const others = WM.DAY_KEYS.filter(k => k !== TODAY);
  days[others[0]] = "legs-day"; days[others[2]] = "legs-day";
  store.set("weekShape", WM.sanitizeWeekShape({ templates, days, setAt: "2026-10-05" }));
}
const plan = () => store.get("generatedSession")?.session || null;
/** Start the plan on screen and wait until the player has it. */
async function start() {
  store.set("generatedSession", null);
  await click($("#cp-preview-start") || $("[data-action='start']"), 50);
  for (let i = 0; i < 100 && !plan(); i++) await wait(50);
  // The plan hands over after a short pause; let it land before the next test.
  for (let i = 0; i < 100 && view() === "coach-proposal"; i++) await wait(50);
}

// ── 1. Free ────────────────────────────────────────────────────────────
console.log("TEST 1 - Free sees it is part of the Plan");
fixture("free");
await router.navigate("your-week"); await wait(60);
ok("1a. Your week on Free says it is part of the Plan, with the way to see it", /part of the Plan/.test(txt(main)) && !!$('[data-go-route="upgrade"]'), txt(main).slice(0, 200));
ok("1b. and offers nothing to set", !$("[data-start]") && !$("[data-ready]") && !$("[data-day]"));
await router.navigate("today"); await wait(60);
ok("1c. Free Home has no week card", !$(".home-week"));

// ── 2. Setting a week ──────────────────────────────────────────────────
console.log("\nTEST 2 - setting a week");
fixture();
await router.navigate("today"); await wait(60);
const weekTile = $('[data-route="your-week"]');
ok("2a. Plan Home links to Plan your week", txt(weekTile) === "Plan your week");
ok("2a2. no week card before there is a week", !$(".home-week"));
await click(weekTile);
ok("2b. it opens Plan your week: build it, or three ready-made weeks", view() === "your-week" && txt($("h1")) === "Plan your week" &&
   !!$('[data-start="build"]') && $$("[data-ready]").length === 3, txt(main).slice(0, 200));
ok("2b2. the h1 has focus", document.activeElement === $("h1"));
await click($('[data-ready="rotation"]'));
let w = store.get("weekShape");
ok("2c. a ready-made week becomes the week (Three-way rotation: six days and a rest)", !!w && w.days.sun === "rest" && Object.values(w.days).filter(v => v !== "rest").length === 6);
ok("2d. the week shows seven days, each with what it is for", $$(".yw-day").length === 7 && txt($('[data-day="mon"]')).includes("Strength") && /Moderate · 30 min · gym/.test(txt($('[data-day="mon"]'))));
ok("2e. today is marked as today, in words", txt($(`[data-day="${TODAY}"]`)).includes("Today") && /today/.test($(`[data-day="${TODAY}"]`).getAttribute("aria-label")));
ok("2f. the status line says what happened", /is your week/.test(txt($("#yw-status"))));
await click($('[data-back="start"]'));
ok("2g. Change the week goes back to the ways to start, saying it replaces the week", /replaces your week/.test(txt(main)));
await click($('[data-start="build"]'));
await click($("#yw-pick-go"));
ok("2h. Build it with me: choosing no days says so, and keeps the week", /at least one day/.test(txt($("#yw-pick-error"))) && store.get("weekShape").days.mon === "strength");
await click($('[data-pick="mon"]')); await click($('[data-pick="tue"]')); await click($('[data-pick="thu"]'));
ok("2i. a chosen day is pressed (aria-pressed) and bold", $('[data-pick="mon"]').getAttribute("aria-pressed") === "true" && $('[data-pick="mon"]').classList.contains("is-on"));
await click($("#yw-pick-go"));
w = store.get("weekShape");
ok("2j. the days chosen get a plan each; the others are rest", w.days.mon && w.days.mon !== "rest" && w.days.wed === "rest" && w.days.sun === "rest" && Object.keys(w.templates).length === 3,
   JSON.stringify(w.days));

// ── 3. A day's plan ────────────────────────────────────────────────────
console.log("\nTEST 3 - a day's plan");
await click($('[data-day="mon"]'));
ok("3a. Monday opens with its own h1", view() === "your-week" && txt($("h1")) === "Monday");
const nameIn = $("#yw-name"); nameIn.value = "Upper day"; nameIn.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
await click($('[data-mix="full"][data-level="0"]'));
await click($('[data-addmix="upper"]'));
await click($('[data-mix="upper"][data-level="2"]'));
await click($('[data-addmix="trunk"]'));
await click($('[data-mix="trunk"][data-level="0"]'));
await click($('[data-unmix="full"]'));
await click($('[data-int="gentle"]'));
await click($('[data-mins="40"]'));
await click($('[data-place="gym"]'));
await click($('[data-extra="sauna"]'));
$("#yw-fav-in").value = "Not an exercise";
await click($("#yw-fav-add"));
ok("3b. an unknown favourite says to choose from the list", /from the list/.test(txt($("#yw-fav-error"))));
$("#yw-fav-in").value = "cable pallof press";
await click($("#yw-fav-add"));
ok("3c. before Save, nothing is kept", store.get("weekShape").templates[store.get("weekShape").days.mon].name === "Monday plan");
await click($("#yw-save"));
w = store.get("weekShape");
const mon = w.templates[w.days.mon];
ok("3d. Save keeps the name, the mix, how hard, how long, where, the extra and the favourite",
   mon.name === "Upper day" && JSON.stringify(mon.mix) === JSON.stringify([{ focus: "upper", level: 2 }, { focus: "trunk", level: 0 }]) &&
   mon.intensity === "gentle" && mon.mins === 40 && mon.place === "gym" && mon.extras.join() === "sauna" && mon.favourites.join() === "gym-cable-pallof-press",
   JSON.stringify(mon));
ok("3e. the week says it: Mostly upper body · a little core and trunk", txt($('[data-day="mon"]')).includes("Mostly upper body · A little core and trunk".replace("A little", "a little")) && /Saved Monday/.test(txt($("#yw-status"))),
   txt($('[data-day="mon"]')));
ok("3f. favourites are listed on the week", /Cable Pallof Press/.test(txt(main)));
await click($('[data-day="tue"]'));
await click($('[data-use="' + mon.id + '"]'));
ok("3g. Tuesday can use Monday's plan", $("#yw-name")?.value === "Upper day");
ok("3h. which then says a change here changes both", /used on Monday and Tuesday/.test(txt(main)));
await click($('[data-kind="rest"]'));
await click($('[data-back="week"]'));
ok("3i. Back keeps nothing (Tuesday is still its own plan)", store.get("weekShape").days.tue !== mon.id && store.get("weekShape").days.tue !== "rest");
await click($('[data-day="wed"]'));
await click($('[data-kind="session"]'));
await click($("#yw-save"));
ok("3j. a rest day can become a session day", store.get("weekShape").days.wed && store.get("weekShape").days.wed !== "rest");
await click($('[data-day="wed"]'));
await click($('[data-kind="rest"]'));
await click($("#yw-save"));
ok("3k. and back to rest; its unused plan is let go", store.get("weekShape").days.wed === "rest" && Object.keys(store.get("weekShape").templates).length === 3);
const buttons = $$(".yw-view button");
ok("3l. every button has words", buttons.every(b => txt(b) || b.getAttribute("aria-label")));

// ── 4. Home ────────────────────────────────────────────────────────────
console.log("\nTEST 4 - Home");
fixture();
setWeek(upperDay());
await router.navigate("today"); await wait(60);
const card = $(".home-week");
ok("4a. Today, from your week leads, with the day's name, mix and details", !!card && txt(card).includes("Today, from your week") && txt($("#home-week-h")) === "Upper day" &&
   /Mostly upper body/.test(txt(card)) && /Gentle · 40 min · gym/.test(txt(card)), txt(card));
ok("4b. three ways in: the plan, only 10 minutes, something else", !!$('[data-action="week-today"]') && !!$('[data-action="week-short"]') && !!$('[data-action="week-else"]'));
ok("4c. Tell me what to do is not the filled door now", !$('[data-action="start-today"]').classList.contains("home-door--primary"));
ok("4d. the doors are 'Or something else today'", txt($("#home-doors-label")) === "Or something else today");
await click($('[data-action="week-else"]'));
ok("4e. Something else today moves to the doors", document.activeElement === $("#home-doors-label"));
ok("4f. the link is Your week", txt($('[data-route="your-week"]')) === "Your week");
fixture(); setWeek(null, true);
await router.navigate("today"); await wait(60);
ok("4g. a rest day says so, and asks nothing", /Today is a rest day in your week. Rest counts./.test(txt($(".home-week"))) && !$('[data-action="week-today"]'));
ok("4h. and Tell me what to do is the filled door", $('[data-action="start-today"]').classList.contains("home-door--primary"));

// ── 5. The plan it opens ───────────────────────────────────────────────
console.log("\nTEST 5 - the day's plan");
async function openDay(action = "week-today", tmpl = upperDay(), opts = {}) {
  fixture("personal", opts); setWeek(tmpl);
  await router.navigate("today"); await wait(60);
  await click($(`[data-action="${action}"]`), 300);
}
await openDay();
ok("5a. it opens the coach's plan", view() === "coach-proposal" && !!$(".cp-plan__sentence"), view());
const sentence = txt($(".cp-plan__sentence"));
ok("5b. which says it is from the week, with the mix and how hard", /^From your week: Upper day\./.test(sentence) && /Mostly upper body/.test(sentence) && /Gentle: easy all the way/.test(sentence), sentence);
ok("5c. at the gym", /gym/i.test(txt($("#cp-loc"))), txt($("#cp-loc")));
ok("5d. the favourite is in, and said", $$(".cp-plan__row").some(r => r.dataset.exerciseId === "gym-cable-pallof-press") && /Cable Pallof Press is in/.test(sentence), sentence);
ok("5e. the sauna is offered after", /Then the sauna, if you want it/.test(sentence));
const ids = $$(".cp-plan__row").map(r => r.dataset.exerciseId);
const balanceIn = ids.some(id => WM.BALANCE_IDS.includes(id));
ok("5f. some balance is in the main part", balanceIn, ids.join(", "));
ok("5g. some core and trunk is in", ids.some(id => /core|plank|dead-bug|bird-dog|pallof|crunch|ab-|hollow|side-plank|trunk/.test(id)), ids.join(", "));
// Start, and look at what the player got.
await start();
const gs = plan();
ok("5i. Start hands the player the day (weekDay, creditTypes)", !!gs && gs.weekDay?.templateId === "upper-day" && Array.isArray(gs.creditTypes) && gs.creditTypes.includes("core"), JSON.stringify(gs && { wd: gs.weekDay, ct: gs.creditTypes }));
const main5 = (gs?.exercises || []).filter(e => e.section === "main");
const coolStretch = (gs?.exercises || []).filter(e => e.section === "cooldown" && e.weekFocus === "stretch");
ok("5j. a little stretching goes to the cool-down", coolStretch.length >= 1, JSON.stringify((gs?.exercises || []).map(e => `${e.section}:${e.id}:${e.weekFocus || ""}`)));
const count5 = main5.reduce((m, e) => (m[e.weekFocus || "upper"] = (m[e.weekFocus || "upper"] || 0) + 1, m), {});
ok("5k. mostly upper body: more upper body than any other focus in the main part", Object.entries(count5).every(([k, n]) => k === "upper" || k === "favourite" || n < count5.upper), JSON.stringify(count5));
// Gentle against steady: one set fewer.
const setsOf = s => (s.exercises || []).filter(e => e.section === "main" && !e.weekFocus).map(e => Number(e.sets) || 0);
await openDay("week-today", upperDay({ intensity: "steady" }));
await start();
const steadySets = setsOf(plan());
ok("5l. gentle is one set fewer than steady on the main exercises", setsOf(gs).length && steadySets.length &&
   setsOf(gs).reduce((a, b) => a + b, 0) < steadySets.reduce((a, b) => a + b, 0), `${setsOf(gs)} vs ${steadySets}`);
// At home, no cable machine: the favourite is left out and said.
await openDay("week-today", upperDay({ place: "home" }));
const homeSentence = txt($(".cp-plan__sentence"));
ok("5m. at home with no cable machine, the Pallof press is left out, and said", /at home|home/i.test(txt($("#cp-loc"))) &&
   !$$(".cp-plan__row").some(r => r.dataset.exerciseId === "gym-cable-pallof-press") && /Cable Pallof Press is left out today/.test(homeSentence), homeSentence);
// Through the check-in.
await openDay("week-today", upperDay(), { checkedIn: false });
ok("5n. not checked in: the check-in comes first", view() === "checkin", view());
store.set("lastCheckin", { timestamp: new Date().toISOString(), energy: 4, sleep: 4 });
const { clearPurpose } = await import(B + "data/purpose.js"); clearPurpose();   // what the check-in does
await router.navigate("coach-proposal"); await wait(300);
ok("5o. after it, the plan is still the day's (its kind, place and sentence)", /^From your week: Upper day/.test(txt($(".cp-plan__sentence"))) && /gym/i.test(txt($("#cp-loc"))) &&
   store.get("requestedSessionType") === "upper", txt($(".cp-plan__sentence")));

// ── 6. Only 10 minutes ─────────────────────────────────────────────────
console.log("\nTEST 6 - only 10 minutes");
await openDay("week-short");
const s6 = txt($(".cp-plan__sentence"));
ok("6a. the short version, said", /Upper day, the short version/.test(s6), s6);
ok("6b. today's length is ten minutes", store.getAvailableTimeMinutes?.() === 10 || /10 min/.test(txt(main)), txt(main).slice(0, 300));
const long = await (async () => { await openDay("week-today"); return $$(".cp-plan__row").length; })();
await openDay("week-short");
ok("6c. fewer exercises than the full day", $$(".cp-plan__row").length < long, `${$$(".cp-plan__row").length} vs ${long}`);

// ── 7. It counts ───────────────────────────────────────────────────────
console.log("\nTEST 7 - it counts for the arc and Progress");
await openDay();
await start();
const before = store.completedSessions(store.get("activityLog") || []).length;
store.logActivity({ type: "workout", status: "completed", date: new Date().toISOString(), completedAt: new Date().toISOString(), duration: 40, exercisesCompleted: 6 });
const arc = store.get("arc");
const today = new Date().toISOString().slice(0, 10);
ok("7a. the arc credits the day's kind (upper)", arc.typesWorked?.upper === today, JSON.stringify(arc.typesWorked));
ok("7b. and its other kinds (core and trunk)", arc.typesWorked?.core === today, JSON.stringify(arc.typesWorked));
ok("7c. Progress counts the session", store.completedSessions(store.get("activityLog") || []).length === before + 1);
ok("7d. the week shows today done", WS.doneThisWeek()[TODAY] === true);
await router.navigate("your-week"); await wait(60);
ok("7e. on screen: Done, in words, on today's row", /Done/.test(txt($(`[data-day="${TODAY}"]`))) && /done/.test($(`[data-day="${TODAY}"]`).getAttribute("aria-label")));

// ── 8. Across the week ─────────────────────────────────────────────────
console.log("\nTEST 8 - across the week");
fixture();
const T = (id, focus) => ({ id, name: id, mix: [{ focus, level: 2 }], intensity: "steady", mins: 30, place: "gym" });
store.set("weekShape", WM.sanitizeWeekShape({ templates: { a: T("a", "upper"), b: T("b", "legs"), c: T("c", "upper") },
  days: { mon: "a", tue: "b", wed: "rest", thu: "c", fri: "rest", sat: "rest", sun: "rest" } }));
await router.navigate("your-week"); await wait(60);
ok("8a. a week with no core is named, with where it could go", /Nothing yet for core and trunk/.test(txt(main)) && !!$("#yw-gap-add"), txt(main).slice(-300));
await click($("#yw-gap-add"));
const wk = store.get("weekShape");
ok("8b. Add puts a little core in a day plan", Object.values(wk.templates).some(t => t.mix.some(m => m.focus === "trunk" && m.level === 0)));
ok("8c. and then names the next gap, or none", !/core and trunk/.test(txt($("#yw-gap-h")?.parentElement)));
await click($("#yw-gap-leave"));
ok("8d. Leave it leaves that one for this week", !!store.get("weekShape").dismissed?.stretch && !/stretching or mobility/.test(txt(main)));
ok("8e. no score on the week", !/\b\d+ of \d+\b|%/.test(txt(main)));

// ── 9. Read once ───────────────────────────────────────────────────────
console.log("\nTEST 9 - read once");
await openDay();
ok("9pc. the day's plan opened", /^From your week/.test(txt($(".cp-plan__sentence"))));
await router.navigate("today"); await wait(60);
store.set("requestedSessionType", null);
await router.navigate("coach-proposal"); await wait(300);
ok("9a. the next plan, from elsewhere, is not the week's", !/From your week/.test(txt($(".cp-plan__sentence"))) && store.get("weekDayRequest") === null, txt($(".cp-plan__sentence")));
store.set("weekDayRequest", { day: TODAY, templateId: "upper-day", on: "2026-01-01", short: false });
ok("9b. a request from another day is not used", WS.takeWeekDayRequest() === null);

// ── 10. Store ──────────────────────────────────────────────────────────
console.log("\nTEST 10 - the store keeps it safe");
const bad = { templates: { "x y": { name: "<b>" }, ok: { id: "ok", name: "<script>Day", mix: [{ focus: "nope" }, { focus: "upper", level: 9 }], intensity: "max", mins: 7, place: "moon", extras: ["sauna", "sauna", "lava"], favourites: ["a b", "squat"] } },
  days: { mon: "ok", tue: "missing", wed: "rest", xyz: "ok" }, dismissed: { trunk: "nope" } };
const safe = WM.sanitizeWeekShape(bad);
ok("10a. unknown values dropped, missing ones defaulted", safe && Object.keys(safe.templates).join() === "ok" && safe.templates.ok.name === "scriptDay" &&
   JSON.stringify(safe.templates.ok.mix) === JSON.stringify([{ focus: "upper", level: 1 }]) && safe.templates.ok.intensity === "steady" &&
   safe.templates.ok.mins === 30 && safe.templates.ok.place === "gym" && safe.templates.ok.extras.join() === "sauna" &&
   safe.templates.ok.favourites.join() === "squat" && safe.days.tue === null && !("xyz" in safe.days) && !safe.dismissed.trunk, JSON.stringify(safe));
ok("10b. a week with no days set is no week", WM.sanitizeWeekShape({ templates: {}, days: {} }) === null);
localStorage.clear(); store.init();
store.set("weekShape", safe);
const raw = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => localStorage.getItem(k)?.includes('"weekShape"'))) || "{}");
ok("10c. it is saved and read back", !!raw.weekShape && store.get("weekShape").days.mon === "ok");
ok("10d. every ready-made week is a valid week", WM.READY_WEEKS.every(r => WM.weekFromReady(r.id)?.days.mon));
ok("10e. every balance exercise exists", WM.BALANCE_IDS.every(id => byId.has(id)), WM.BALANCE_IDS.filter(id => !byId.has(id)).join());

console.log(`\nYOUR-WEEK: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
