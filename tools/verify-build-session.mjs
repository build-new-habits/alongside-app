import { createRequire as __cr } from "node:module";
/**
 * tools/verify-build-session.mjs
 * 02 Nov 2026 v1
 *
 * P-26 ONE-BUILD-PAGE (master schedule v621). Graeme, 02 Nov: one page to
 * build a session, with coach help for any part, favourites first, a
 * balance suggestion he is free to ignore, and one Save that can put it on
 * a day. Mock-up v1 approved ("I like this. I think it works"); his three
 * answers: a sore area on the day leaves out what it rules out and offers
 * a swap; it opens from Build my own, Library › Saved sessions and Edit;
 * Lately looks back 7 days. The Plan only; Free unchanged.
 *
 * Red on alongside-v702 (none of it existed). Every test drives the real
 * code path the screen uses, through the real router where a screen is
 * opened:
 *   1. the schema: plannedFor kept only as a real day; a week day may be a
 *      saved session; planSavedSession() and savedForDay();
 *   2. Lately (data/build-lately.js): the mock-up's week says the mock-up's
 *      words; once chosen, quiet; nothing from older than 7 days;
 *   3. the page: heading, one way back, three parts; Free sent to its own
 *      builder; Help me fill this adds only what is ticked, favourites
 *      first; the heart is Loved it; Lately's Add and Leave it; Save needs
 *      a name; a date, every week on a day; Edit opens the session;
 *   4. Home: the session saved for today leads, one tap to its proposal;
 *      once done, it does not; a Your week day that is a saved session;
 *      one whose session has gone is no plan;
 *   5. the day itself: a move today's sore area rules out is marked, said,
 *      can be swapped, and Start leaves it out;
 *   6. the ways in: Build my own behind a door; Saved sessions' button;
 *   7. Your week: a saved day is not sent to the coach's plan, the balance
 *      line ignores it, its own screen names it and offers to change it.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM(`<!doctype html><body><div id="app"><main id="main-content"></main></div>
  <nav id="bottom-nav"></nav><button id="hidden-nav-home-btn" class="hidden-nav-escape hidden" aria-label="Back to Today"><span aria-hidden="true">H</span></button></body>`, { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement", "HTMLInputElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: false, text: async () => "", json: async () => ({}) });
dom.window.confirm = () => false; globalThis.confirm = () => false;
if (!globalThis.CSS) globalThis.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_-]/g, c => "\\" + c) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { router } = await import(B + "router.js");
window.router = router;

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const change = (el, checked) => { if (!el) return; if (checked !== undefined) el.checked = checked; el.dispatchEvent(new dom.window.Event("change", { bubbles: true })); };
const AT = new Date().toISOString();
const pad = n => String(n).padStart(2, "0");
const day = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const ago = n => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(9, 0, 0, 0); return d; };
const JS_KEY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** A Plan person, checked in today, with the gym kit the mock-up used. */
function person(tier = "personal", { log = [] } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Graeme"); store.set("tier", tier); store.set("guidanceShownAt", AT);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: AT, textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("gymEquipment", ["dumbbells-medium", "dumbbells-heavy", "bench-flat", "cable-machine", "resistance-band-medium", "gym-membership"]);
  store.set("homeEquipment", ["resistance-band-medium"]);
  store.set("activityLog", log);
  const k = new Date().toISOString().split("T")[0];
  store.set("checkinHistory", { [k]: { energy: 6, mood: 6 } }); store.set("lastCheckin", { ...store.get("lastCheckin"), energy: 6, mood: 6, timestamp: AT });
  router.history = ["today"]; router.pathStart = null; router.buildStart = null;
}
async function open(route) { await router.navigate(route); await wait(80); }
/** The mock-up's week: three upper body sessions, legs on the day before them. */
const MOCK_LOG = [1, 2, 3].map(n => ({ id: "u" + n, type: "workout", sessionType: "upper", place: "gym", completedAt: ago(n).toISOString(), durationMins: 40, completed: true, exerciseIds: ["dumbbell-bench-press"] }))
  .concat([{ id: "l4", type: "workout", sessionType: "lower", place: "gym", completedAt: ago(4).toISOString(), durationMins: 40, completed: true, exerciseIds: ["goblet-squat"] }]);

// ── 1 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - the schema (store.js v121, week-shape-model.js v5)");
person();
const rec = (id, extra = {}) => ({ id, name: "N" + id, sessionType: "upper", doses: {}, durationMins: 30, equipment: [], exerciseIds: ["dumbbell-bench-press"], createdAt: AT, lastUsedAt: null, ...extra });
localStorage.setItem(store.STORAGE_KEY, JSON.stringify({ ...JSON.parse(localStorage.getItem(store.STORAGE_KEY) || "{}"),
  savedSessions: [rec("own_a_x1", { plannedFor: "2026-11-04" }), rec("own_b_x2", { plannedFor: "next wednesday" }), rec("own_c_x3")] }));
store.init();
const loaded = store.get("savedSessions") || [];
ok("1a. a real day is kept as plannedFor", loaded[0]?.plannedFor === "2026-11-04", JSON.stringify(loaded[0]));
ok("1b. anything else is removed, never nulled", loaded[1] && !("plannedFor" in loaded[1]), JSON.stringify(loaded[1]));
ok("1c. a record without one gains no key", loaded[2] && !("plannedFor" in loaded[2]));
const { sanitizeTemplate, sanitizeWeekShape, mixLine, detailLine } = await import(B + "data/week-shape-model.js");
const tSaved = sanitizeTemplate({ id: "saved-1", name: "Wednesday gym", saved: "own_2026-11-02T16:30:00.000Z_ab12" });
ok("1d. a week day may be a saved session", tSaved?.saved === "own_2026-11-02T16:30:00.000Z_ab12", JSON.stringify(tSaved));
ok("1e. not a saved session's id: dropped", !("saved" in (sanitizeTemplate({ id: "x", saved: "<b>" }) || {})));
ok("1f. said as a session you built", mixLine(tSaved) === "A session you built" && detailLine(tSaved) === "As you built it", mixLine(tSaved) + " | " + detailLine(tSaved));
const SS = await import(B + "data/saved-sessions.js");
person(); store.set("savedSessions", [rec("own_d_x4")]);
const today = day();
ok("1g. planSavedSession puts the date on", SS.planSavedSession("own_d_x4", today).ok && store.get("savedSessions")[0].plannedFor === today);
ok("1h. savedForDay reads it", SS.savedForDay(today).length === 1);
ok("1i. a date that is not a day is refused", SS.planSavedSession("own_d_x4", "soon").ok === false && store.get("savedSessions")[0].plannedFor === today);
ok("1j. null takes it off, leaving no key", SS.planSavedSession("own_d_x4", null).ok && !("plannedFor" in store.get("savedSessions")[0]));
person("free"); store.set("savedSessions", [rec("own_e_x5")]);
ok("1k. Free cannot plan one", SS.planSavedSession("own_e_x5", today).ok === false && !("plannedFor" in store.get("savedSessions")[0]));

// ── 2 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - Lately (last 7 days, a suggestion)");
const { latelyFor } = await import(B + "data/build-lately.js");
const now = new Date();
const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][ago(4).getDay()];
const L = latelyFor({ log: MOCK_LOG, now });
ok("2a. the mock-up's week, in the mock-up's words", L?.line === `Your last three sessions were mostly upper body. Legs haven’t had a turn since ${dayName}.`, L?.line);
ok("2b. once legs are chosen, nothing more is said", latelyFor({ log: MOCK_LOG, now, chosen: ["legs"] }) === null);
ok("2c. one session is not a pattern", latelyFor({ log: MOCK_LOG.slice(0, 1), now }) === null);
const old = MOCK_LOG.map(e => ({ ...e, completedAt: new Date(Date.parse(e.completedAt) - 9 * 864e5).toISOString() }));
ok("2d. nothing from before the last 7 days", latelyFor({ log: old, now }) === null);
const noLegsWeek = MOCK_LOG.slice(0, 3);
ok("2e. no legs in the 7 days: in the last week", /Legs haven’t had a turn in the last week\.$/.test(latelyFor({ log: noLegsWeek, now })?.line || ""), latelyFor({ log: noLegsWeek, now })?.line);
ok("2f. never a score, a streak or a should", !/score|streak|in a row|should|must|need to/i.test(L?.line || "x"));

// ── 3 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - the page (the Plan)");
person("personal", { log: MOCK_LOG });
router.buildStart = { door: "stronger", part: "upper", place: "gym" };
await open("build-session");
const h1 = [...main.querySelectorAll("h1")];
ok("3a. Build a session, one heading", router.currentView === "build-session" && h1.length === 1 && txt(h1[0]) === "Build a session", router.currentView + " | " + h1.map(txt).join(","));
ok("3b. one way back, the Plan's", main.querySelectorAll(".plan-back").length === 1 && txt(main.querySelector(".plan-back")) === "‹ Back");
ok("3c. three parts, in order", [...main.querySelectorAll(".bs-part__h")].map(txt).join("|") === "Warm-up|Main|Cool-down", [...main.querySelectorAll(".bs-part__h")].map(txt).join("|"));
ok("3d. the door's part arrives chosen (Upper body), and the place (Gym)", main.querySelector('input[name="bs-area"][value="upper"]')?.checked && main.querySelector('input[name="bs-place"][value="gym"]')?.checked);
ok("3e. Lately says the mock-up's line", txt(main.querySelector(".bs-lately")).includes("Legs haven’t had a turn"), txt(main.querySelector(".bs-lately")));
// Help me fill this, Main, with a favourite in the pool
const { buildCandidatePools, equipmentForLocation } = await import(B + "session-builder.js");
const mainPool = buildCandidatePools({ sessionType: "upper", durationMins: 40, equipmentOverride: equipmentForLocation("gym").list }).main;
const favId = mainPool.find(e => !e.recommended)?.id || mainPool[mainPool.length - 1].id;
store.likeMovement(favId);
click(main.querySelector('[data-help="main"]')); await wait(20);
const picks = [...main.querySelectorAll("#bs-panel [data-pick]")];
ok("3f. Help me fill this opens for Main only", txt(main.querySelector("#bs-panel-h")) === "Help with Main" && main.querySelectorAll("#bs-panel").length === 1);
ok("3g. favourites first, and ticked", /Your favourites/.test(txt(main.querySelector("#bs-panel"))) && picks[0]?.checked && txt(picks[0].closest("label")).includes(mainPool.find(e => e.id === favId).name), txt(picks[0]?.closest("label")));
ok("3h. nothing goes in until Add", main.querySelectorAll('section[aria-labelledby="bs-h-main"] .bs-mv').length === 0);
const ticked = picks.filter(p => p.checked).length;
// untick the last ticked one: it must not go in
const lastOn = picks.filter(p => p.checked).at(-1);
change(lastOn, false);
click(main.querySelector("#bs-help-add")); await wait(20);
const mainNames = [...main.querySelectorAll('section[aria-labelledby="bs-h-main"] .bs-mv__nm')].map(txt);
ok("3i. Add puts in exactly what is ticked", mainNames.length === ticked - 1 && mainNames.includes(mainPool.find(e => e.id === favId).name), `${mainNames.length} of ${ticked - 1}: ${mainNames.join(", ")}`);
ok("3j. warm-up and cool-down untouched", main.querySelectorAll('section[aria-labelledby="bs-h-warmup"] .bs-mv').length === 0 && main.querySelectorAll('section[aria-labelledby="bs-h-cooldown"] .bs-mv').length === 0);
const heart = main.querySelector('section[aria-labelledby="bs-h-main"] .bs-fav:not([aria-pressed="true"])');
const heartId = heart?.dataset.fav;
click(heart); await wait(10);
ok("3k. the heart is Loved it (likedMovements)", !!heartId && !!store.get("likedMovements")[heartId] && heart.getAttribute("aria-pressed") === "true");
click(main.querySelector(`[data-fav="${heartId}"]`)); await wait(10);
ok("3l. and again takes it off", !store.get("likedMovements")[heartId]);
click(main.querySelector("#bs-lately-add")); await wait(20);
ok("3m. Lately's Add ticks Legs, and Lately goes quiet", main.querySelector('input[name="bs-area"][value="legs"]')?.checked && !main.querySelector(".bs-lately"));
person("personal", { log: MOCK_LOG }); router.buildStart = { door: "stronger", part: "upper", place: "gym" }; await open("build-session");
click(main.querySelector("#bs-lately-leave")); await wait(20);
ok("3n. Leave it: quiet, Legs not chosen", !main.querySelector(".bs-lately") && !main.querySelector('input[name="bs-area"][value="legs"]')?.checked);
// add one move by search, then save
click(main.querySelector('[data-add="warmup"]')); await wait(20);
const q = main.querySelector("#bs-add-find-q");
q.value = "band"; q.dispatchEvent(new dom.window.Event("input", { bubbles: true })); await wait(20);
click(main.querySelector("#bs-add-find-list [data-find-pick]")); await wait(20);
ok("3o. + Add a move adds to that part", main.querySelectorAll('section[aria-labelledby="bs-h-warmup"] .bs-mv').length === 1);
click(main.querySelector("#bs-add-close")); await wait(10);
click(main.querySelector('[data-help="main"]')); await wait(20); click(main.querySelector("#bs-help-add")); await wait(20);
click(main.querySelector("#bs-save")); await wait(20);
ok("3p. Save asks When's it for?", txt(main.querySelector("h1")) === "Save this session" && /When’s it for\?/.test(txt(main)));
click(main.querySelector("#bs-save-go")); await wait(20);
ok("3q. a name is needed, said and focused", /Give it a name/.test(txt(main)) && document.activeElement?.id === "bs-name" && (store.get("savedSessions") || []).length === 0);
main.querySelector("#bs-name").value = "Wednesday gym";
change(main.querySelector('input[name="bs-when"][value="date"]'), true); await wait(20);
const days = [...main.querySelectorAll('input[name="bs-date"]')];
change(days[2], true); await wait(20);
const want = days[2].value;
main.querySelector("#bs-name").value = "Wednesday gym";
click(main.querySelector("#bs-save-go")); await wait(20);
const kept = (store.get("savedSessions") || [])[0];
ok("3r. saved with its date, its place and door", kept?.name === "Wednesday gym" && kept.plannedFor === want && kept.place === "gym" && kept.purpose === "stronger", JSON.stringify(kept)?.slice(0, 200));
ok("3s. each move keeps its part", kept && Object.values(kept.doses).some(d => d.section === "warmup") && Object.values(kept.doses).some(d => d.section === "main"));
ok("3t. said, with one way on (Done)", txt(main.querySelector("h1")) === "Saved" && /Home will have it ready/.test(txt(main)) && !!main.querySelector("#bs-done"), txt(main));
// Every week, on a day
router.buildStart = { editId: kept.id, returnTo: "saved-sessions" }; await open("build-session");
ok("3u. Edit opens it, its moves in their parts", txt(main.querySelector("h1")) === "Change this session" && main.querySelectorAll('section[aria-labelledby="bs-h-warmup"] .bs-mv').length === 1 && main.querySelectorAll('section[aria-labelledby="bs-h-main"] .bs-mv').length >= 1);
click(main.querySelector("#bs-save")); await wait(20);
ok("3v. Edit keeps its name and date", main.querySelector("#bs-name")?.value === "Wednesday gym" && main.querySelector('input[name="bs-when"][value="date"]')?.checked);
change(main.querySelector('input[name="bs-when"][value="week"]'), true); await wait(20);
change(main.querySelector('input[name="bs-day"][value="wed"]'), true); await wait(20);
click(main.querySelector("#bs-save-go")); await wait(20);
const w = store.get("weekShape");
const tid = w?.days?.wed;
ok("3w. every Wednesday: Your week's Wednesday is this session", !!tid && w.templates[tid]?.saved === kept.id, JSON.stringify(w)?.slice(0, 200));
ok("3x. and the one date comes off", !("plannedFor" in store.get("savedSessions")[0]) && (store.get("savedSessions") || []).length === 1);
person("free");
await open("build-session");
ok("3y. Free is sent to its own builder", router.currentView === "session-builder", router.currentView);

// ── 4 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - Home");
const { TodayView } = await import(B + "views/today.js");
const home = () => { main.innerHTML = ""; TodayView(router).mount(main); };
const planned = id => rec(id, { name: "Wednesday gym", place: "gym", purpose: "stronger", durationMins: 40, exerciseIds: ["dumbbell-bench-press", "dead-bug"],
  doses: { "dumbbell-bench-press": { section: "main", sets: 3, reps: 10 }, "dead-bug": { section: "main", sets: 3, reps: 8 } } });
person(); store.set("savedSessions", [planned("own_f_x6")]); SS.planSavedSession("own_f_x6", today);
home();
const prow = main.querySelector('[data-action="planned"]');
ok("4a. saved for today: Home's one row names it", !!prow && /Today: Wednesday gym/.test(txt(prow)) && /You built this/.test(txt(prow)), txt(main.querySelector(".path-coach")));
ok("4b. still six ways in at most", main.querySelectorAll(".path-home button").length <= 6, main.querySelectorAll(".path-home button").length + "");
click(prow); await wait(80);
ok("4c. one tap: its proposal, behind its door", router.currentView === "path" && /Wednesday gym/.test(txt(main.querySelector("h1"))), router.currentView + " " + txt(main.querySelector("h1")));
ok("4d. and it can be changed from there", !!main.querySelector("#path-change"));
store.set("activityLog", [{ id: "done1", type: "workout", completedAt: new Date().toISOString(), durationMins: 40, completed: true, exerciseIds: ["dumbbell-bench-press", "dead-bug"] }]);
home();
ok("4e. once done today, it does not lead", !main.querySelector('[data-action="planned"]'));
person(); store.set("savedSessions", [planned("own_g_x7")]);
const key = JS_KEY[new Date().getDay()];
store.set("weekShape", sanitizeWeekShape({ templates: { "saved-1": { id: "saved-1", name: "Wednesday gym", saved: "own_g_x7" } }, days: { [key]: "saved-1" } }));
home();
const wrow = main.querySelector('[data-action="week-saved"]');
ok("4f. a Your week day that is a saved session", !!wrow && /Today, from your week: Wednesday gym/.test(txt(wrow)) && /As you built it/.test(txt(wrow)), txt(main.querySelector(".path-coach")));
store.set("savedSessions", []);
home();
ok("4g. its session gone: no plan for today (the coach's row)", !main.querySelector('[data-action="week-saved"]') && !!main.querySelector('[data-action="path-coach"]'));

// ── 5 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - on the day: what a sore area rules out");
const { soreRuledOut } = await import(B + "data/path-context.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const rdl = EXERCISES.find(e => e.id === "dumbbell-romanian-deadlift");
const press = EXERCISES.find(e => e.id === "dumbbell-bench-press");
person();
store.set("conditionPainScores", { "lower-back": 8 }); store.set("conditionPainScoresOn", store._localDay());
ok("5a. a Bad lower back rules out a Romanian deadlift", soreRuledOut(rdl).includes("lower-back"), JSON.stringify(soreRuledOut(rdl)));
ok("5b. and not a bench press", soreRuledOut(press).length === 0, JSON.stringify(soreRuledOut(press)));
store.set("savedSessions", [rec("own_h_x8", { name: "Legs day", exerciseIds: ["dumbbell-romanian-deadlift", "dumbbell-bench-press"],
  doses: { "dumbbell-romanian-deadlift": { section: "main", sets: 3, reps: 8 }, "dumbbell-bench-press": { section: "main", sets: 3, reps: 10 } } })]);
router.pathStart = { door: "stronger", saved: "own_h_x8" }; await open("path");
ok("5c. the proposal says which is left out, and why", /Left out today, because your lower back is sore: Dumbbell Romanian Deadlift/i.test(txt(main.querySelector("#path-outs"))), txt(main.querySelector("#path-outs")));
ok("5d. its row says so, and has its Swap", /Left out today/.test(txt(main.querySelector(".path-mv"))) && !!main.querySelector("#path-swap-0"));
click(main.querySelector("#path-start")); await wait(60);
const ids = (store.get("generatedSession")?.session?.exercises || []).map(e => e.id);
ok("5e. Start plays the rest, without it", ids.length === 1 && ids[0] === "dumbbell-bench-press", JSON.stringify(ids));
store.set("conditionPainScores", {});
router.pathStart = { door: "stronger", saved: "own_h_x8" }; await open("path");
ok("5f. nothing sore: nothing left out", !main.querySelector("#path-outs"));

// ── 6 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 6 - the ways in");
person();
router.pathStart = { door: "stronger" }; await open("path");
click(main.querySelector("#pr-gym")); await wait(20);
click(main.querySelector("#pr-lower")); await wait(20);
click(main.querySelector("#pr-own")); await wait(80);
ok("6a. Build my own opens Build a session, with the part and place", router.currentView === "build-session" && main.querySelector('input[name="bs-area"][value="legs"]')?.checked && main.querySelector('input[name="bs-place"][value="gym"]')?.checked, router.currentView);
person(); store.set("savedSessions", [planned("own_i_x9")]);
await open("saved-sessions");
ok("6b. Saved sessions has Build a session", txt(main.querySelector("#saved-build")) === "Build a session");
click(main.querySelector("#saved-build")); await wait(80);
ok("6c. which opens the page", router.currentView === "build-session");
await open("saved-sessions");
click(main.querySelector("[data-edit-id]")); await wait(80);
ok("6d. Edit opens the page with that session", router.currentView === "build-session" && txt(main.querySelector("h1")) === "Change this session");

person();
await open("know-what");
const kwRow = [...main.querySelectorAll("[data-kw-route]")].find(b => b.dataset.kwRoute === "build-session");
ok("6e. I know what I want, on the Plan: Build a session", !!kwRow && /Build a session/.test(txt(kwRow)) && ![...main.querySelectorAll("[data-kw-route]")].some(b => b.dataset.kwRoute === "session-builder"));
click(kwRow); await wait(80);
ok("6f. which opens the page", router.currentView === "build-session");
// Building is for any day: today's sore answer does not narrow + Add a move.
person(); store.set("conditionPainScores", { "lower-back": 8 }); store.set("conditionPainScoresOn", store._localDay());
router.buildStart = { place: "gym" }; await open("build-session");
click(main.querySelector('[data-add="main"]')); await wait(20);
const q2 = main.querySelector("#bs-add-find-q");
q2.value = "romanian"; q2.dispatchEvent(new dom.window.Event("input", { bubbles: true })); await wait(20);
ok("6g. building for any day: a move today's sore back rules out can still be added", /Romanian Deadlift/.test(txt(main.querySelector("#bs-add-find-list"))), txt(main.querySelector("#bs-add-find-list")));

// ── 7 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 7 - Your week, with a day that is a saved session");
const WS = await import(B + "data/week-shape.js");
person(); store.set("savedSessions", [planned("own_j_x10")]);
store.set("weekShape", sanitizeWeekShape({ templates: { "saved-1": { id: "saved-1", name: "Wednesday gym", saved: "own_j_x10" }, "up": { id: "up", name: "Upper day", mix: [{ focus: "upper", level: 2 }] } },
  days: { [key]: "saved-1", mon: key === "mon" ? "saved-1" : "up", tue: key === "tue" ? "saved-1" : "up", thu: key === "thu" ? "saved-1" : "up" } }));
ok("7a. the coach's plan is not asked for a saved day", WS.askForToday() === false && !store.get("weekDayRequest"));
const gap = WS.balanceGap();
ok("7b. the balance line does not read its default mix (legs still missing)", gap?.key === "legs", JSON.stringify(gap && { key: gap.key, t: gap.template.id }));
ok("7c. nor puts the gap into it", gap?.template?.id !== "saved-1");
await open("your-week");
click(main.querySelector(`[data-day="${key}"]`)); await wait(40);
ok("7d. its own screen names it", /This day is a session you built: Wednesday gym/.test(txt(main)), txt(main).slice(0, 200));
ok("7e. A session is not shown as chosen", main.querySelector('[data-kind="session"]')?.getAttribute("aria-pressed") === "false");
click(main.querySelector("#yw-edit-saved")); await wait(80);
ok("7f. Change this session opens Build a session with it", router.currentView === "build-session" && txt(main.querySelector("h1")) === "Change this session");

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
