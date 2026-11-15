import { createRequire as __cr } from "node:module";
/**
 * tools/verify-p32-stretch-stiffness.mjs
 * 15 Nov 2026 v1
 *
 * P-32 STRETCH-FOR-STIFFNESS (spec docs/specs/alongside_stretch-for-stiffness_15nov2026_v1.md).
 *
 *   1  The rules: spots per area, Works your …, the order, the fresh one's
 *      zones, Very stiff's gentle start and shorter holds, the minutes.
 *   2  The boundary: a sore area never sets either question; It hurts never
 *      leads to a stretch; no treatment words; nothing new is kept.
 *   3  The Stretch door: the two questions, the lines, the rows, It hurts.
 *   4  Before Start: the ease-in line; Very stiff; the hand-over.
 *   5  The finish: How do your … feel now?, Put this on Home (P-31).
 *   6  Free: unchanged.
 *
 *   node tools/verify-p32-stretch-stiffness.mjs
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = await import("node:fs");

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
if (!globalThis.CSS) globalThis.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_-]/g, c => "\\" + c) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { ROUTINES } = await import(B + "data/stretch-routines.js");
const SS = await import(B + "data/stretch-stiffness.js");
const { PathView } = await import(B + "views/path.js");
const { PlanFinishView } = await import(B + "views/plan-finish.js");
const { router: realRouter } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${String(detail).slice(0, 500)}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const fakeRouter = { history: ["somewhere"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = fakeRouter;
realRouter.navigate = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const pick = el => { if (!el) return; el.checked = !el.checked || el.type === "radio"; el.dispatchEvent(new dom.window.Event("change", { bubbles: true })); };
const todayKey = new Date().toISOString().split("T")[0];

function fixture({ tier = "personal", sore = null } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("guidanceShownAt", new Date().toISOString());
  store.set("checkinHistory", { [todayKey]: { energy: 6, mood: 6, date: new Date().toDateString() } });
  store.set("lastCheckin", { ...store.get("lastCheckin"), energy: 6, mood: 6, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  if (sore) { store.set("conditions", Object.keys(sore)); store.set("conditionPainScores", sore); }
  navs = []; for (const k of ["pathStart", "stretchCheck"]) fakeRouter[k] = null;
}
let view = null;
function path() { try { view?.onUnmount?.(); } catch {} main.innerHTML = ""; view = PathView(fakeRouter); view.mount(main); }
const step = () => main.querySelector(".path-view")?.dataset.step || null;
const rowsT = () => [...main.querySelectorAll(".path-row[data-v]")].map(r => txt(r.querySelector(".path-door__t")));
const tapRow = v => click(main.querySelector(`.path-row[data-v="${v}"]`));
const checked = name => [...main.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);
const toArea = (area, sore) => { fixture({ sore }); fakeRouter.pathStart = { door: "stretch" }; path(); tapRow(area); };

console.log("\nTEST 1 - the rules");
{
  ok("1a. spots: none for Whole body; Back and hips: Lower back, Hips, Glutes, Upper back; Legs has Outside of the thigh",
    SS.spotsFor("whole").length === 0 && SS.spotsFor("back-hips").map(s => s.label).join("|") === "Lower back|Hips|Glutes|Upper back" &&
    SS.spotsFor("legs").some(s => s.id === "outside-thigh"));
  const legs = ROUTINES.filter(r => r.area === "legs");
  const o = SS.routinesForSpots(legs, "legs", ["outside-thigh"]);
  ok("1b. Outside of the thigh: the routine that works it first, tagged; the rest after, untagged, in order",
    o[0].routine.id === "l1" && o[0].tag === "Works the outside of your thigh" && o.slice(1).every(x => !x.tag) &&
    o.slice(1).map(x => x.routine.id).join() === legs.filter(r => r.id !== "l1").map(r => r.id).join(), JSON.stringify(o.map(x => [x.routine.id, x.tag])));
  const two = SS.routinesForSpots(ROUTINES.filter(r => r.area === "back-hips"), "back-hips", ["hips", "glutes"]);
  ok("1c. two spots join with and", two[0].tag === "Works your hips and your glutes", two[0].tag);
  ok("1d. no spot ticked: the routines as they were, no tags", SS.routinesForSpots(legs, "legs", []).every((x, i) => x.routine === legs[i] && !x.tag));
  ok("1e. a spot from another area is ignored", SS.cleanSpots("legs", ["hips", "calves"]).map(s => s.id).join() === "calves");
  ok("1f. A fresh one for me: the spots' stretch zones, or null for the area's own",
    SS.zonesForSpots("back-hips", ["hips", "lower-back"]).join() === "lower-back,hips" && SS.zonesForSpots("legs", []) === null);
  const bh1 = ROUTINES.find(r => r.id === "bh1");
  const v = SS.stiffPractice({ ...bh1 }, "back-hips", "very");
  ok("1g. Very stiff: Standing Hip Circles first, two minutes, and the minutes add up",
    v.steps[0].id === "hip-circles-standing" && v.steps[0].mins === 2 && v.minutes === bh1.minutes + 2 && SS.minutesAt(bh1, "very") === bh1.minutes + 2);
  ok("1h. Very stiff: every later step says Shorter holds", v.steps.slice(1).every(s => s.note.includes(SS.SHORTER_HOLDS)));
  ok("1i. Fine, A little and Quite stiff leave the routine as it is",
    ["fine", "little", "quite", undefined].every(l => SS.stiffPractice(bh1, "back-hips", l) === bh1) && SS.minutesAt(bh1, "quite") === bh1.minutes);
  const has = { ...bh1, steps: [{ id: "hip-circles-standing", mins: 1 }, ...bh1.steps] };
  ok("1j. a routine that already holds the gentle start is not given it twice", SS.stiffPractice(has, "back-hips", "very").steps.filter(s => s.id === "hip-circles-standing").length === 1);
  const { EXERCISES } = await import(B + "data/exercises/index.js");
  ok("1k. every gentle start is a library movement, standing or seated (so Not today on the floor still fits)",
    Object.values(SS.GENTLE_START).every(id => ["standing", "seated"].includes(EXERCISES.find(e => e.id === id)?.position)));
}

console.log("\nTEST 2 - the boundary (spec section 1)");
{
  const words = SS.allWords().join(" · ").toLowerCase();
  const hit = SS.BOUNDARY_WORDS.filter(w => words.includes(w));
  ok("2a. no treatment words in anything this feature says", hit.length === 0, hit.join(", "));
  const src = fs.readFileSync(new URL("../js/data/stretch-stiffness.js", import.meta.url), "utf8");
  ok("2b. the rules read no sore area (no conditionPainScores, conditions, soreToday or checkin)",
    !/conditionPainScores|["']conditions["']|soreToday|checkinToday|getTodaysCheckin/.test(src));
  toArea("back-hips", { "lower-back": 7, "hip": 6 });
  ok("2c. with the lower back and hip sore: How does it feel today? starts at Fine, and nothing is ticked",
    checked("stiff").join() === "fine" && checked("spot").length === 0, JSON.stringify([checked("stiff"), checked("spot")]));
  ok("2d. ... and no row says Works your …", !main.querySelector(".path-row__works"));
  tapRow("hurts");
  ok("2e. It hurts: no routine, no Start, no stretch row",
    step() === "hurts" && !main.querySelector("#path-start") && rowsT().join() === SS.HURTS.other, rowsT().join("|"));
  const before = JSON.stringify(Object.keys(JSON.parse(localStorage.getItem("alongside_user") || "{}")).sort());
  toArea("legs");
  pick(main.querySelector('input[name="stiff"][value="very"]'));
  pick(main.querySelector('input[name="spot"][value="calves"]'));
  const after = JSON.stringify(Object.keys(JSON.parse(localStorage.getItem("alongside_user") || "{}")).sort());
  const saved = localStorage.getItem("alongside_user") || "";
  ok("2f. nothing new is kept: no store field, and the answers are not in it", before === after && !/"(stiff|spots|stiffness)"/.test(saved));
}

console.log("\nTEST 3 - the Stretch door");
toArea("back-hips");
{
  ok("3a. after the area: How does it feel today? (four choices, Fine first) and Anywhere in particular?, both fieldsets with legends",
    [...main.querySelectorAll('input[name="stiff"]')].map(i => txt(i.closest("label"))).join("|") === "Fine, just a stretch|A little stiff|Quite stiff|Very stiff" &&
    /How does it feel today\?/.test(txt(main.querySelector('input[name="stiff"]').closest("fieldset").querySelector("legend"))) &&
    /Anywhere in particular\?/.test(txt(main.querySelector('input[name="spot"]').closest("fieldset").querySelector("legend"))) &&
    main.querySelector('input[name="spot"]').type === "checkbox");
  pick(main.querySelector('input[name="spot"][value="hips"]'));
  ok("3b. Hips: each routine that works the hips says so", [...main.querySelectorAll(".path-row__works")].every(e => txt(e) === "Works your hips") && main.querySelectorAll(".path-row__works").length >= 1);
  ok("3c. focus stays on the choice, and it is said", document.activeElement === main.querySelector('input[name="spot"][value="hips"]'));
  ok("3d. A fresh one for me: built for your hips", /Built by the coach for your hips/.test(txt(main.querySelector('.path-row[data-v="fresh"]'))));
  pick(main.querySelector('input[name="stiff"][value="quite"]'));
  ok("3e. Quite stiff: its line", txt(main.querySelector("#path-stiff-line")) === SS.stiffLine("quite"));
  pick(main.querySelector('input[name="stiff"][value="very"]'));
  ok("3f. Very stiff: its line, and the minutes include the gentle start",
    txt(main.querySelector("#path-stiff-line")) === SS.stiffLine("very") && /^12 min/.test(txt(main.querySelector('.path-row[data-v="bh1"] .path-door__d'))),
    txt(main.querySelector('.path-row[data-v="bh1"] .path-door__d')));
  ok("3g. ticked spots stay ticked when the stiffness changes", checked("spot").join() === "hips");
  navs = []; tapRow("fresh");
  ok("3h. A fresh one for me is built for the spot's zone", navs.includes("coach-proposal") && JSON.stringify(store.get("sessionZoneFocus")) === '["hips"]', JSON.stringify(store.get("sessionZoneFocus")));
  toArea("whole");
  ok("3i. Whole body: no Anywhere in particular?", !main.querySelector('input[name="spot"]') && !!main.querySelector('input[name="stiff"]'));
  ok("3j. It hurts is its own row, last", rowsT().slice(-1)[0] === SS.HURTS.row);
  tapRow("hurts");
  ok("3k. It hurts: heading, the words, Tell the check-in, the note",
    txt(main.querySelector("h1")) === "It hurts" && txt(main).includes(SS.HURTS.line) && txt(main).includes(SS.HURTS.what) &&
    txt(main.querySelector("#path-hurts-checkin")) === "Tell the check-in" && txt(main.querySelector("#path-hurts-note")) === SS.HURTS.note);
  ok("3l. the heading takes focus", document.activeElement === main.querySelector("h1"));
  navs = []; click(main.querySelector("#path-hurts-checkin"));
  ok("3m. Tell the check-in opens the check-in", navs.includes("checkin") && store.get("pendingDoorRoute") === "today");
  toArea("legs"); tapRow("hurts"); tapRow("other");
  ok("3n. Stretch somewhere else: back to Where do you want to stretch?", step() === "sarea", step());
  tapRow("legs");
  ok("3o. a new area starts with nothing ticked", checked("spot").length === 0);
}

console.log("\nTEST 4 - before Start");
toArea("back-hips"); tapRow("bh1");
{
  ok("4a. every Stretch routine: the ease-in line", txt(main.querySelector("#path-ease-in")) === SS.EASE_IN);
  navs = []; click(main.querySelector("#path-start"));
  ok("4b. Fine: no question at the finish (nothing handed over)", fakeRouter.stretchCheck === null && navs.includes("workout"));
}
toArea("back-hips"); pick(main.querySelector('input[name="stiff"][value="very"]')); tapRow("bh1");
{
  ok("4c. Very stiff: starts gently, Standing Hip Circles first, and about 12 minutes",
    /About 12 minutes/.test(txt(main.querySelector(".path-small"))) && /Very stiff: starts gently/.test(txt(main)) &&
    /Standing Hip Circles/.test(txt(main.querySelector(".path-mv__nm"))), txt(main.querySelector(".path-mvs")).slice(0, 200));
  navs = []; click(main.querySelector("#path-start"));
  const gs = store.get("generatedSession")?.session;
  ok("4d. Start plays it, gentle start first", gs?.exercises?.[0]?.id === "hip-circles-standing" && navs.includes("workout"));
  ok("4e. the finish's question is handed over in memory", fakeRouter.stretchCheck?.name === "Back and hips" && fakeRouter.stretchCheck?.area === "Back and hips");
}
toArea("back-hips", { "lower-back": 8 }); pick(main.querySelector('input[name="stiff"][value="very"]')); tapRow("bh1");
{
  const first = main.querySelector(".path-mv");
  ok("4f. sore rules unchanged: the gentle start goes through them too (a bad lower back leaves out Standing Hip Circles)",
    /Standing Hip Circles/.test(txt(first?.querySelector(".path-mv__nm"))) && !!first?.querySelector(".path-mv__out"), txt(first).slice(0, 200));
}

console.log("\nTEST 5 - the finish");
function finish(check, entry = { id: "e1", door: "stretch", name: "Back and hips", exerciseIds: [], completedAt: new Date().toISOString() }) {
  store.logActivity(entry); store.set("currentActivityEntry", (store.get("activityLog") || []).find(e => e.id === entry.id) || entry);
  fakeRouter.stretchCheck = check; main.innerHTML = ""; PlanFinishView(fakeRouter).mount(main);
}
{
  fixture();
  const practice = SS.stiffPractice({ ...ROUTINES.find(r => r.id === "bh1") }, "back-hips", "very");
  finish({ name: "Back and hips", area: "Back and hips", practice });
  ok("5a. How do your back and hips feel now?, Easier, About the same, Worse",
    /How do your back and hips feel now\?/.test(txt(main.querySelector(".pf-stiff legend"))) &&
    [...main.querySelectorAll('input[name="pf-stiff"]')].map(i => txt(i.closest("label"))).join("|") === "Easier|About the same|Worse");
  ok("5b. read once", fakeRouter.stretchCheck === null);
  pick(main.querySelector('input[name="pf-stiff"][value="worse"]'));
  ok("5c. Worse: leave it today, and the check-in", txt(main.querySelector("#pf-stiff-line")) === SS.AFTER.worse && !main.querySelector("#pf-onhome"));
  pick(main.querySelector('input[name="pf-stiff"][value="easier"]'));
  ok("5d. Easier: its line and Put this on Home", txt(main.querySelector("#pf-stiff-line")) === SS.AFTER.easier && !!main.querySelector("#pf-onhome"));
  click(main.querySelector("#pf-onhome"));
  const list = (store.get("prescribedExercises") || []).filter(e => e.group === "Back and hips");
  ok("5e. Put this on Home: the routine in My exercises under its name, On Home any time",
    list.length === practice.steps.length && store.get("myExercisesOnHome")["Back and hips"] === "any" &&
    /Back and hips is on Home, under Little and often\./.test(txt(main.querySelector("#pf-onhome-done"))) && document.activeElement === main.querySelector("#pf-onhome-done"));
  ok("5f. each movement for its seconds, each side where it says so",
    list.some(e => / seconds each side$/.test(e.reps)) && list.every(e => /^\d+ seconds/.test(e.reps) && e.exerciseId));
  const n = (store.get("prescribedExercises") || []).length;
  SS.addToHome(practice);
  ok("5g. again: a list of that name is not added twice", (store.get("prescribedExercises") || []).length === n);
  fixture(); finish(null);
  ok("5h. no stiffness said: no question", !main.querySelector(".pf-stiff"));
  fixture(); finish({ name: "Something else", area: "Legs", practice });
  ok("5i. a different session: no question", !main.querySelector(".pf-stiff"));
  fixture(); finish({ name: "Back and hips", area: "Back and hips", practice }, { id: "e2", door: "stronger", name: "Back and hips", exerciseIds: [], completedAt: new Date().toISOString() });
  ok("5j. not a Stretch session: no question", !main.querySelector(".pf-stiff"));
}

console.log("\nTEST 6 - Free");
fixture({ tier: "free" }); fakeRouter.pathStart = { door: "stretch" }; navs = []; path();
ok("6a. Free has no doors: sent Home, so it never sees this", navs.includes("today") && !main.querySelector('input[name="stiff"]'));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
