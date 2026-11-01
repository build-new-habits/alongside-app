/**
 * tools/verify-trends-week.mjs
 * 01 Nov 2026 v1
 *
 * P-21 TRENDS-WEEK (master schedule v616; mock-up v1 approved 01 Nov,
 * Graeme: "Yes, build it"; other days "Ordinary sessions"). Drives the real
 * week model, Your week, the Plan's Home and the door route.
 *
 *  0. Controls: the Plan fixture; a ready-made week gains no trend key.
 *  1. weekFromTrend: HILIT and Hybrid at most two days, reformer-style three,
 *     never side by side (Sunday beside Monday), over all 127 choices of
 *     days; the other days picked ordinary sessions; Zone 2 one harder day
 *     mid-week; Mix it up one day; snacks each day, a different thing.
 *  2. A trend on a day plan is kept only when valid; a stored week keeps it.
 *  3. Your week › Plan your week › Follow a fitness trend: trend, activity,
 *     days; the week filled; the trend followed; a trend day made ordinary.
 *  4. Home names today's trend day, with the talk test's word, and one tap
 *     opens it behind its door (or the check-in first); Zone 2's harder day
 *     before week 5 said as an easy day.
 *  5. Free's Your week offers no trend.
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


const TR = await import(B + "data/trend-recipes.js");
const PH = await import(B + "views/plan-home.js");
const J = v => JSON.stringify(v);
const D = WM.DAY_KEYS;

// ── 0. Controls ─────────────────────────────────────────────────────────
console.log("TEST 0 - positive controls");
fixture();
ok("0a. the fixture is on the Plan", store.get("tier") === "personal");
{
  const w = WM.weekFromReady("rotation");
  ok("0b. a ready-made week still loads, and its days gain no trend key", !!w && Object.values(w.templates).every(t => !("trend" in t)), J(Object.values(w.templates).map(t => Object.keys(t))));
}

// ── 1. The rules that fill a week ───────────────────────────────────────
console.log("\nTEST 1 - weekFromTrend fills the week by each trend's rules");
const subsets = [];
for (let m = 1; m < 128; m++) subsets.push(D.filter((_, i) => m & (1 << i)));
const trendDaysOf = w => D.filter(d => w.days[d] !== "rest" && w.templates[w.days[d]]?.trend);
// The gate's own rule, not the app's: the week repeats, so Sunday is beside Monday.
const beside = (a, b) => { const d = Math.abs(D.indexOf(a) - D.indexOf(b)); return d === 1 || d === 6; };
for (const [id, most] of [["hilit", 2], ["hybrid", 2], ["reformer", 3]]) {
  let bad = [];
  for (const picked of subsets) {
    const w = WM.weekFromTrend(id, picked);
    const mine = trendDaysOf(w);
    const others = D.filter(d => picked.includes(d) && !mine.includes(d));
    if (mine.length > most || mine.length < 1) bad.push(`${picked}: ${mine.length} trend days`);
    if (mine.some((a, i) => mine.some((b, j) => i < j && beside(a, b)))) bad.push(`${picked}: side by side ${mine}`);
    if (D.some(d => !picked.includes(d) && w.days[d] !== "rest")) bad.push(`${picked}: an unpicked day filled`);
    if (others.some(d => w.templates[w.days[d]]?.name !== "Whole body")) bad.push(`${picked}: other days not ordinary sessions`);
  }
  ok(`1-${id}. at most ${most} days, never side by side (Sunday beside Monday), the other days picked ordinary sessions: all 127 choices of days`, bad.length === 0, bad.slice(0, 4).join("; "));
}
{
  const w = WM.weekFromTrend("zone2", ["mon", "wed", "fri", "sun"], { activity: "run" });
  const hard = D.filter(d => w.templates[w.days[d]]?.trend?.day === "hard");
  const easy = D.filter(d => w.templates[w.days[d]]?.trend?.day === "easy");
  ok("1-zone2a. Zone 2: one harder day mid-week, the rest easy, outside for a run", J(hard) === J(["wed"]) && J(easy) === J(["mon", "fri", "sun"]) && w.templates[w.days.mon].place === "outside" && w.templates[w.days.wed].intensity === "hard" && w.templates[w.days.mon].intensity === "gentle", J(w.days));
  const one = WM.weekFromTrend("zone2", ["tue"], { activity: "row" });
  ok("1-zone2b. one day picked: easy, no harder day; a row is at the gym", trendDaysOf(one).length === 1 && one.templates[one.days.tue].trend.day === "easy" && one.templates[one.days.tue].place === "gym", J(one));
}
{
  const w = WM.weekFromTrend("cross", ["mon", "wed", "fri", "sun"], { activity: "run" });
  const mine = trendDaysOf(w);
  ok("1-cross. Mix it up on one day; the other days are what they usually do (a run)", mine.length === 1 && D.filter(d => w.days[d] !== "rest" && !mine.includes(d)).every(d => w.templates[w.days[d]].name === "A run"), J(w.days));
}
{
  const w = WM.weekFromTrend("snack", ["mon", "tue", "wed", "thu", "fri", "sat"]);
  const q = D.filter(d => w.days[d] !== "rest").map(d => w.templates[w.days[d]].trend.day);
  ok("1-snack. a snack every day picked, a different thing each day, round again after five", J(q) === J(["legs", "pull", "middle", "balance", "breath", "legs"]) && w.days.sun === "rest", J(q));
}
ok("1z. nothing picked: no week", WM.weekFromTrend("hilit", []) === null);

console.log("\nTEST 2 - a trend on a day plan is kept only when valid");
ok("2a. an unknown trend is dropped, and the day plan keeps no key", !("trend" in WM.sanitizeTemplate({ id: "a", trend: { id: "hyrox" } })));
ok("2b. a snack without a quality is dropped", !("trend" in WM.sanitizeTemplate({ id: "a", trend: { id: "snack", day: "arms" } })));
ok("2c. Zone 2 keeps easy or hard, nothing else", WM.sanitizeTemplate({ id: "a", trend: { id: "zone2", day: "hard" } }).trend.day === "hard" && WM.sanitizeTemplate({ id: "a", trend: { id: "zone2", day: "max" } }).trend.day === "easy");
ok("2d. a stored week with a trend day loads with it", (() => { fixture(); store.set("weekShape", WM.weekFromTrend("hilit", ["mon", "thu"])); localStorage.setItem(store.STORAGE_KEY, JSON.stringify(store.data)); store.init(); return store.get("weekShape").templates["trend-day"]?.trend?.id === "hilit"; })());

// ── 3. Your week: Follow a fitness trend ────────────────────────────────
console.log("\nTEST 3 - Your week › Plan your week › Follow a fitness trend");
fixture();
await router.navigate("your-week"); await wait(60);
const way = $("[data-trendway]");
ok("3a. Plan your week offers Follow a fitness trend, with what it does", !!way && /Follow a fitness trend/.test(txt(way)) && /fill the week by its rules/.test(txt(way)), txt(main).slice(0, 300));
await click(way);
ok("3b. Which trend? lists the six, each with its rule", txt($("h1")) === "Which trend?" && $$("[data-trend]").length === 6 && /Two days a week at most/.test(txt(main)), txt(main).slice(0, 300));
ok("3b2. its h1 has focus", document.activeElement === $("h1"));
await click($('[data-trend="zone2"]'));
ok("3c. Zone 2 asks which activity to keep easy", txt($("h1")) === "Which do you want to keep easy?" && $$("[data-tact]").length === 5);
await click($('[data-tact="run"]'));
ok("3d. then which days, saying the rule", /Which days/.test(txt($("h1"))) && /one harder day mid-week/.test(txt(main)), txt(main).slice(0, 300));
for (const d of ["mon", "wed", "fri", "sun"]) await click($(`[data-pick="${d}"]`), 20);
await click($("#yw-pick-go"));
const w3 = store.get("weekShape");
ok("3e. the week is filled: Zone 2 easy days and one harder day", view() === "your-week" && w3 && D.filter(d => w3.templates[w3.days[d]]?.trend?.id === "zone2").length === 4 && w3.templates[w3.days.wed].trend.day === "hard", J(w3?.days));
ok("3f. and Zone 2 is followed, for running, from today", J(store.get("trends").map(t => [t.id, t.activity])) === J([["zone2", "run"]]));
ok("3g. the week says each trend day's words", /From your trend: Zone 2, mostly easy/.test(txt(main)) && /Zone 2: the harder day/.test(txt(main)), txt(main).slice(0, 400));
await click($('[data-day="wed"]'));
ok("3h. a trend day says so on its own screen, with a way to make it ordinary", /This day follows Zone 2, mostly easy/.test(txt(main)) && !!$("#yw-untrend"));
await click($("#yw-untrend"));
await click($("#yw-save"));
const w3b = store.get("weekShape");
ok("3i. made ordinary and saved: Wednesday has no trend, the other days keep theirs", !w3b.templates[w3b.days.wed].trend && w3b.templates[w3b.days.mon].trend?.id === "zone2", J(w3b.days));
// HILIT: two days, the rest ordinary
fixture();
await router.navigate("your-week"); await wait(60);
await click($("[data-trendway]")); await click($('[data-trend="hilit"]'));
ok("3j. HILIT goes straight to the days, saying two at most", /Which days/.test(txt($("h1"))) && /two of them at most, never side by side/.test(txt(main)));
for (const d of ["mon", "tue", "wed"]) await click($(`[data-pick="${d}"]`), 20);
await click($("#yw-pick-go"));
const w3c = store.get("weekShape");
ok("3k. Monday and Wednesday HILIT, Tuesday an ordinary session; HILIT followed", w3c.templates[w3c.days.mon].trend?.id === "hilit" && w3c.templates[w3c.days.wed].trend?.id === "hilit" && !w3c.templates[w3c.days.tue].trend && store.get("trends").some(t => t.id === "hilit"), J(w3c.days));

// ── 4. Home's row and the door ───────────────────────────────────────────
console.log("\nTEST 4 - Home names today's trend day, and one tap opens it");
function trendToday(id, day, activity) {
  fixture();
  if (id !== "snack") store.startTrend(id, activity || null);
  const days = Object.fromEntries(D.map(k => [k, "rest"]));
  const t = WM.trendTemplate("trend-day", { id, day }, { activity });
  days[TODAY] = "trend-day";
  store.set("weekShape", WM.sanitizeWeekShape({ templates: { "trend-day": t }, days, setAt: "2026-10-05" }));
}
trendToday("zone2", "easy", "run");
await router.navigate("today"); await wait(80);
const row4 = $('[data-action="week-trend"]');
ok("4a. the row names it: Zone 2: an easy day, Run, about 30 min, the talk test's word", !!row4 && /Today, from your week: Zone 2: an easy day/.test(txt(row4)) && /Run/.test(txt(row4)) && /About 30 min/.test(txt(row4)) && txt(row4).includes(TR.EFFORT.easy), txt(row4));
ok("4a2. and not the ordinary week row", !$('[data-action="week-today"]'));
await click(row4, 150);
ok("4b. one tap (checked in today) opens the proposal behind Keep moving, From your week", view() === "path" && $(".path-view")?.dataset.step === "prog" && $(".path-view")?.dataset.door === "moving" && /From your week\./.test(txt(main)) && /Run: an easy day/.test(txt($("h1"))), `${view()} ${$(".path-view")?.dataset.step} ${txt($("h1"))}`);
ok("4c. Start is there, and Back goes to the trend's day", !!$("#path-start") && !!$("#path-back"));
await click($("#path-back"));
ok("4d. Back: Zone 2's day, then the trends", $(".path-view")?.dataset.step === "z2day");
// Before week 5 the harder day is said as an easy day
trendToday("zone2", "hard", "cycle");
await router.navigate("today"); await wait(80);
ok("4e. before week 5, the harder day is said as an easy day", /Zone 2: an easy day/.test(txt($('[data-action="week-trend"]'))) && txt($('[data-action="week-trend"]')).includes(TR.EFFORT.easy), txt($('[data-action="week-trend"]')));
// From week 5, hard
fixture(); store.startTrend("zone2", "cycle");
store.set("trends", [{ id: "zone2", startedAt: new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10), activity: "cycle" }]);
{ const days = Object.fromEntries(D.map(k => [k, "rest"])); days[TODAY] = "h"; store.set("weekShape", WM.sanitizeWeekShape({ templates: { h: WM.trendTemplate("h", { id: "zone2", day: "hard" }, { activity: "cycle" }) }, days, setAt: "2026-10-05" })); }
await router.navigate("today"); await wait(80);
ok("4f. from week 5, the harder day is hard", /Zone 2: the harder day/.test(txt($('[data-action="week-trend"]'))) && txt($('[data-action="week-trend"]')).includes(TR.EFFORT.hard), txt($('[data-action="week-trend"]')));
await click($('[data-action="week-trend"]'), 150);
ok("4f2. and opens the harder ride", /Ride: the harder day/.test(txt($("h1"))), txt($("h1")));
// A snack, HILIT, Mix it up
trendToday("snack", "pull");
await router.navigate("today"); await wait(80);
await click($('[data-action="week-trend"]'), 150);
ok("4g. a snack day opens that snack's proposal, behind Get stronger", $(".path-view")?.dataset.step === "prog" && $(".path-view")?.dataset.door === "stronger" && /Snack: a pull/.test(txt($("h1"))), txt($("h1")));
trendToday("hilit");
await router.navigate("today"); await wait(80);
await click($('[data-action="week-trend"]'), 150);
ok("4h. a HILIT day opens HILIT's step, which asks how long", $(".path-view")?.dataset.step === "hilit" && !!main.querySelector('input[name="hlen"]'));
trendToday("cross", null, "run");
await router.navigate("today"); await wait(80);
await click($('[data-action="week-trend"]'), 150);
ok("4i. a Mix it up day opens its choices (the person chooses)", $(".path-view")?.dataset.step === "xopts", $(".path-view")?.dataset.step);
// Not checked in: through the check-in, then on to the trend
fixture({}); 
trendToday("zone2", "easy", "walk");
store.set("lastCheckin", null);
await router.navigate("today"); await wait(80);
const r4 = $('[data-action="week-trend"]');
if (r4) await click(r4, 150);
ok("4j. not checked in today: the check-in first, then on to the trend", view() === "checkin" && store.get("pendingDoorRoute") === "path" && router.pathStart?.trendDay?.id === "zone2", `${view()} ${store.get("pendingDoorRoute")} ${J(router.pathStart)}`);

// ── 5. Free ──────────────────────────────────────────────────────────────
console.log("\nTEST 5 - Free");
fixture("free");
await router.navigate("your-week"); await wait(60);
ok("5a. Free's Your week offers no trend", !$("[data-trendway]") && /part of the Plan/.test(txt(main)));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
