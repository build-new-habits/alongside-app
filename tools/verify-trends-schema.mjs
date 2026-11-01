/**
 * tools/verify-trends-schema.mjs
 * 01 Nov 2026 v1
 *
 * P-19 TRENDS-SCHEMA (master schedule v610). Schema first: the store fields
 * the fitness-trend recipes (P-20) will read, before anything reads them.
 * Drives the real store (load, write helpers, logActivity), the real Restore
 * and the real Your week model, never the source text.
 *
 * Content approved 01 Nov (Graeme): the four P-17 drafts in BNH-Files
 * Product/alongside_content_trends-*_01nov2026_v2.md.
 *
 *  0. Positive control: a fixture written to storage is what init() loads.
 *  1. Defaults: trends is [] on a phone with no trend history.
 *  2. trends loads only as known trends, each once, with a local start day
 *     and an activity that trend allows (null for the rest).
 *  3. startTrend / changeTrendActivity / stopTrend / trendWeek.
 *  4. activityLog[] snack and counted: true or absent, never anything else;
 *     counted only on a snack; absent left absent (every older entry, Free).
 *  4b. activityLog[] trend and effort: a known trend and one of the talk
 *     test's words, or removed; absent left absent.
 *  5. setSnackCounted() marks one snack as a session, and takes it back.
 *  6. Your week: Hard is a level, saved and loaded; an unknown level is
 *     still Steady.
 *  7. Restore carries trends and the snack marks.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const R = await import(B + "data/restore.js");
const W = await import(B + "data/week-shape-model.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const J = v => JSON.stringify(v);
const today = store._localDay();
const saved = () => JSON.parse(localStorage.getItem(store.STORAGE_KEY));
function load(s) {
  localStorage.clear();
  localStorage.setItem(store.STORAGE_KEY, JSON.stringify(s));
  store.init();
}
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return store._localDay(d); };

console.log("\nTEST 0 - positive control");
load({ onboardingComplete: true, name: "Sentinel-19" });
ok("0a. the fixture reached the store", store.get("name") === "Sentinel-19", store.get("name"));
ok("0b. _localDay takes a date (the harness's daysAgo depends on it)", daysAgo(0) === today, J([daysAgo(0), today]));

console.log("\nTEST 1 - defaults");
ok("1a. trends defaults to []", J(store.getDefaults().trends) === "[]", J(store.getDefaults().trends));
load({ onboardingComplete: true });
ok("1b. an older phone loads trends as []", J(store.get("trends")) === "[]", J(store.get("trends")));

console.log("\nTEST 2 - trends loads only as known trends, each once, with a start day and an allowed activity");
load({ trends: [
  { id: "zone2", startedAt: "2026-10-01", activity: "run" },
  { id: "zone2", startedAt: "2026-10-05", activity: "walk" },
  { id: "cross", startedAt: "2026-10-02", activity: "workout" },
  { id: "hilit", startedAt: "2026-10-03", activity: "run" },
  { id: "hyrox", startedAt: "2026-10-03" },
  { id: "hybrid", startedAt: "3 Oct" },
  { id: "reformer", startedAt: "2026-10-04", activity: "swim" },
  "zone2",
] });
const t2 = store.get("trends");
ok("2a. the first zone2 is kept, the repeat dropped", t2.filter(t => t.id === "zone2").length === 1 && t2.find(t => t.id === "zone2").activity === "run", J(t2));
ok("2b. cross keeps a main activity it allows", t2.find(t => t.id === "cross")?.activity === "workout", J(t2));
ok("2c. hilit keeps no activity (null)", t2.find(t => t.id === "hilit")?.activity === null, J(t2));
ok("2d. an unknown trend is dropped (and never named HYROX)", !t2.some(t => t.id === "hyrox"), J(t2));
ok("2e. a start that is not YYYY-MM-DD drops the trend", !t2.some(t => t.id === "hybrid"), J(t2));
ok("2f. reformer keeps no activity", t2.find(t => t.id === "reformer")?.activity === null, J(t2));
ok("2g. a trend that is not an object is dropped", t2.every(t => t && typeof t === "object") && t2.length === 4, J(t2));
load({ trends: [{ id: "zone2", startedAt: "2026-10-01", activity: "workout" }] });
ok("2h. zone2 with an activity it does not allow keeps the trend, activity null", J(store.get("trends")) === J([{ id: "zone2", startedAt: "2026-10-01", activity: null }]), J(store.get("trends")));
load({ trends: { id: "zone2" } });
ok("2i. trends that is not an array loads as []", J(store.get("trends")) === "[]", J(store.get("trends")));

console.log("\nTEST 3 - startTrend, changeTrendActivity, stopTrend, trendWeek");
load({ onboardingComplete: true }); agreed(store);
ok("3a. startTrend('zone2','cycle') is accepted", store.startTrend("zone2", "cycle") === true);
ok("3b. it starts today and reaches the phone's storage", J(saved().trends) === J([{ id: "zone2", startedAt: today, activity: "cycle" }]), J(saved().trends));
ok("3c. an unknown trend is refused", store.startTrend("hyrox") === false && store.get("trends").length === 1);
ok("3d. an activity the trend does not allow is refused", store.startTrend("cross", "row") === false && !store.get("trends").some(t => t.id === "cross"), J(store.get("trends")));
store.startTrend("cross", "run");
ok("3e. a second trend sits beside the first", store.get("trends").map(t => t.id).join() === "zone2,cross", J(store.get("trends")));
ok("3f. trendWeek is 1 on the first day", store.trendWeek("zone2") === 1, store.trendWeek("zone2"));
ok("3g. trendWeek of a trend not followed is null", store.trendWeek("hilit") === null);
load({ ...saved(), trends: [{ id: "zone2", startedAt: daysAgo(13), activity: "run" }, { id: "hilit", startedAt: daysAgo(7), activity: null }] });
ok("3h. thirteen days in is week 2", store.trendWeek("zone2") === 2, store.trendWeek("zone2"));
ok("3i. seven days in is week 2", store.trendWeek("hilit") === 2, store.trendWeek("hilit"));
ok("3j. changeTrendActivity keeps the start day", store.changeTrendActivity("zone2", "swim") === true
   && store.get("trends").find(t => t.id === "zone2").startedAt === daysAgo(13) && store.get("trends").find(t => t.id === "zone2").activity === "swim", J(store.get("trends")));
ok("3k. changeTrendActivity refuses a disallowed activity", store.changeTrendActivity("zone2", "yoga") === false && store.get("trends").find(t => t.id === "zone2").activity === "swim");
store.startTrend("zone2", "walk");
ok("3l. starting a trend again starts it from today", store.get("trends").find(t => t.id === "zone2").startedAt === today && store.trendWeek("zone2") === 1, J(store.get("trends")));
store.stopTrend("hilit");
ok("3m. stopTrend removes it, in storage too", !saved().trends.some(t => t.id === "hilit"), J(saved().trends));
load({ ...saved(), trends: [{ id: "zone2", startedAt: "2099-01-01", activity: null }] });
ok("3n. a start day in the future reads as week 1, never 0 or less", store.trendWeek("zone2") === 1, store.trendWeek("zone2"));

console.log("\nTEST 4 - activityLog snack and counted: true or absent");
load({ activityLog: [
  { id: "a1", type: "workout", completedAt: "2026-10-20T10:00:00Z", snack: true, counted: true },
  { id: "a2", type: "workout", completedAt: "2026-10-21T10:00:00Z", snack: "yes", counted: false },
  { id: "a3", type: "workout", completedAt: "2026-10-22T10:00:00Z", counted: true },
  { id: "a4", type: "walk", completedAt: "2026-10-23T10:00:00Z" },
] });
const L = id => store.get("activityLog").find(e => e.id === id);
ok("4a. a counted snack keeps both marks", L("a1").snack === true && L("a1").counted === true, J(L("a1")));
ok("4b. marks that are not true are removed, not nulled", !("snack" in L("a2")) && !("counted" in L("a2")), J(L("a2")));
ok("4c. counted without snack is removed", !("counted" in L("a3")), J(L("a3")));
ok("4d. an older entry gains no keys", !("snack" in L("a4")) && !("counted" in L("a4")), J(L("a4")));
load({ onboardingComplete: true }); agreed(store);
store.logActivity({ type: "workout", completedAt: "2026-10-30T08:00:00Z", snack: true });
store.logActivity({ type: "workout", completedAt: "2026-10-30T12:00:00Z", snack: 1, counted: true });
store.logActivity({ type: "walk", completedAt: "2026-10-30T16:00:00Z" });
const log4 = store.get("activityLog");
ok("4e. logActivity keeps snack: true", log4.some(e => e.completedAt === "2026-10-30T08:00:00Z" && e.snack === true && !("counted" in e)), J(log4));
ok("4f. logActivity removes a snack that is not true, and its counted", log4.some(e => e.completedAt === "2026-10-30T12:00:00Z" && !("snack" in e) && !("counted" in e)), J(log4));
ok("4g. logActivity adds neither to an entry without them (Free, every session today)", log4.some(e => e.type === "walk" && !("snack" in e) && !("counted" in e)), J(log4));

console.log("\nTEST 4b - activityLog trend and effort: valid or removed");
load({ activityLog: [
  { id: "t1", type: "run", completedAt: "2026-10-20T10:00:00Z", trend: "zone2", effort: "hard" },
  { id: "t2", type: "run", completedAt: "2026-10-21T10:00:00Z", trend: "hyrox", effort: "brutal" },
  { id: "t3", type: "walk", completedAt: "2026-10-22T10:00:00Z" },
] });
ok("4b-a. a known trend and effort are kept", L("t1").trend === "zone2" && L("t1").effort === "hard", J(L("t1")));
ok("4b-b. an unknown trend and effort are removed", !("trend" in L("t2")) && !("effort" in L("t2")), J(L("t2")));
ok("4b-c. an entry without them gains none", !("trend" in L("t3")) && !("effort" in L("t3")), J(L("t3")));
load({ onboardingComplete: true }); agreed(store);
store.logActivity({ type: "run", completedAt: "2026-10-30T07:00:00Z", trend: "zone2", effort: "easy" });
store.logActivity({ type: "run", completedAt: "2026-10-30T09:00:00Z", trend: "zone9", effort: "max" });
const lg = store.get("activityLog");
ok("4b-d. logActivity keeps a valid trend and effort", lg.some(e => e.completedAt === "2026-10-30T07:00:00Z" && e.trend === "zone2" && e.effort === "easy"), J(lg));
ok("4b-e. logActivity removes invalid ones", lg.some(e => e.completedAt === "2026-10-30T09:00:00Z" && !("trend" in e) && !("effort" in e)), J(lg));
store.logActivity({ type: "workout", completedAt: "2026-10-30T08:00:00Z", snack: true });
store.logActivity({ type: "walk", completedAt: "2026-10-30T16:00:00Z" });

console.log("\nTEST 5 - setSnackCounted()");
const snackId = store.get("activityLog").find(e => e.snack === true).id;
const walkId = store.get("activityLog").find(e => e.type === "walk").id;
ok("5a. a snack can be counted as a session", store.setSnackCounted(snackId, true) === true && store.get("activityLog").find(e => e.id === snackId).counted === true);
ok("5b. it reaches the phone's storage", saved().activityLog.find(e => e.id === snackId).counted === true);
ok("5c. and can be taken back (the key removed)", store.setSnackCounted(snackId, false) === true && !("counted" in store.get("activityLog").find(e => e.id === snackId)));
ok("5d. an entry that is not a snack is refused", store.setSnackCounted(walkId, true) === false && !("counted" in store.get("activityLog").find(e => e.id === walkId)));
ok("5e. an unknown id is refused", store.setSnackCounted("nope", true) === false);

console.log("\nTEST 6 - Your week: Hard is a level");
const hard = W.INTENSITIES.find(i => i.id === "hard");
ok("6a. Hard is one of Your week's levels", !!hard, J(W.INTENSITIES.map(i => i.id)));
ok("6b. its words are the talk test's, as approved", hard?.label === "Hard" && hard?.line === "You can only say a few words at a time.", J(hard));
ok("6c. the three earlier levels are unchanged, in order, Hard last", W.INTENSITIES.map(i => i.id).join() === "gentle,steady,moderate,hard", J(W.INTENSITIES.map(i => i.id)));
const tpl = W.sanitizeTemplate({ id: "d1", name: "Run", mix: [{ focus: "cardio", level: 2 }], intensity: "hard", mins: 30, place: "outside" });
ok("6d. a day saved as Hard stays Hard", tpl?.intensity === "hard", J(tpl));
const tplX = W.sanitizeTemplate({ id: "d2", name: "Run", mix: [{ focus: "cardio", level: 2 }], intensity: "brutal", mins: 30, place: "outside" });
ok("6e. an unknown level is still Steady", tplX?.intensity === "steady", J(tplX));
load({ onboardingComplete: true, weekShape: { templates: { d1: { id: "d1", name: "Run", mix: [{ focus: "cardio", level: 2 }], intensity: "hard", mins: 30, place: "outside" } }, days: { mon: "d1" } } });
ok("6f. a stored Hard day loads as Hard", store.get("weekShape")?.templates?.d1?.intensity === "hard", J(store.get("weekShape")));

console.log("\nTEST 7 - Restore carries trends and the snack marks");
const file = {
  about: "Everything Alongside: Move keeps about you on this device, including your journal. Nothing here was sent anywhere to make this file.",
  exportedAt: "2026-11-01T07:00:00Z",
  store: { onboardingComplete: true, name: "From file",
           trends: [{ id: "cross", startedAt: "2026-10-20", activity: "swim" }],
           activityLog: [{ id: "s1", type: "workout", completedAt: "2026-10-31T08:00:00Z", snack: true, counted: true }] },
};
load({ onboardingComplete: true, name: "Here" }); agreed(store);
const read = R.readRestoreFile(JSON.stringify(file));
ok("7a. the file reads", read.ok, read.reason);
R.applyRestore(read.data);
ok("7b. the fixture restored (name from the file)", store.get("name") === "From file", store.get("name"));
ok("7c. trends come across", J(store.get("trends")) === J([{ id: "cross", startedAt: "2026-10-20", activity: "swim" }]), J(store.get("trends")));
ok("7d. a counted snack comes across", store.get("activityLog").some(e => e.id === "s1" && e.snack === true && e.counted === true), J(store.get("activityLog")));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
