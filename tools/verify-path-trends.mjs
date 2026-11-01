import { createRequire as __cr } from "node:module";
/**
 * tools/verify-path-trends.mjs
 * 01 Nov 2026 v2
 *
 * v2 - P-20 session 2: HILIT joins both doors' lists (1a to 1c, the new
 *   order: Zone 2, Mix it up, HILIT, the snack), and TEST 8 holds it:
 *   five stations a round from the approved pools, never impact or a jump,
 *   the week's work and rest, two days a week at most and never the day
 *   after another, seated, Hard with the safety line, the held sliders
 *   never offered. Nothing loosened.
 *
 * P-20 TRENDS-BUILD, session 1: Zone 2, snacks and cross training, as
 * approved 01 Nov (Graeme): BNH-Files Product/
 * alongside_content_trends-zone2-snacks-cross_01nov2026_v2.md. Drives the
 * real views (views/path.js, the player's log write through store, the
 * Plan finish, Progress) and the real recipes, never the source text.
 *
 *  0. Free: no route (the doors are the Plan's); Free's completedSessions
 *     is unchanged with no snack in the log.
 *  1. How would you like it? offers Follow a fitness trend; Keep moving has
 *     Zone 2, Mix it up and the snack; Get stronger has Mix it up and the
 *     snack, never Zone 2.
 *  2. Zone 2: choosing an activity starts following it (store.trends);
 *     week 1 offers only the easy day and says why; the easy day is a
 *     proposal in the talk test's words, from the approved pool; Swap stays
 *     inside the pool; Start hands the session to the player with trend
 *     and effort; week 5 offers the harder day with the safety line; once
 *     done this week it is not offered again.
 *     No step's name says a length it is not ("Easy Run — 30 Minutes" on a
 *     5-minute step): a recipe step shows the plain name, in the proposal
 *     and the player.
 *  3. Snacks: each quality is three movements from its approved pool, the
 *     kit where they are respected (no band at home: no band move); seated
 *     gives seated moves; the session is marked a snack; Not again is never
 *     offered; the ten held movements never appear.
 *  4. Cross training: with no main activity in the log, What do you do
 *     most?; then two or three easy choices, each one the person picks.
 *     With four runs in the log, it knows they run.
 *  5. The log: a trend session's entry keeps trend, effort and snack.
 *  6. Snacks on one day are one day moved, minutes added; a counted one is
 *     a session; the Plan finish offers Count this as a session after a
 *     snack only, and saves it.
 *  7. Progress, the Plan, following Zone 2: the week in words, no number
 *     with a percent, no score.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "SVGElement"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
if (!globalThis.CSS) globalThis.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_-]/g, c => "\\" + c) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { PathView } = await import(B + "views/path.js");
const { PlanFinishView } = await import(B + "views/plan-finish.js");
const workout = await import(B + "views/workout.js");
const R = await import(B + "data/trend-recipes.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const { router: realRouter } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const J = v => JSON.stringify(v);
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const fakeRouter = { history: ["somewhere"], navigate: v => navs.push(v), back() {} };
globalThis.window.router = fakeRouter;
Object.defineProperty(globalThis, "router", { value: fakeRouter, configurable: true, writable: true });
realRouter.navigate = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const pick = el => { if (!el) return; el.checked = true; el.dispatchEvent(new dom.window.Event("change", { bubbles: true })); };
const todayKey = new Date().toISOString().split("T")[0];
const LIB = new Set(EXERCISES.map(e => e.id));
const POOL = q => new Set([...R.SNACK_POOLS[q].stand, ...R.SNACK_POOLS[q].seated, "marching-on-spot", "seated-marching-cardio"]);

function fixture({ tier = "personal", home = [], gym = ["dumbbells-medium", "bench-flat", "gym-membership"], log = [], prefs = {} } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("guidanceShownAt", new Date().toISOString());
  store.set("homeEquipment", home); store.set("gymEquipment", gym);
  store.set("checkinHistory", { [todayKey]: { energy: 6, mood: 6, date: new Date().toDateString() } });
  store.set("activityLog", log); store.set("exercisePreferences", prefs);
  navs = []; for (const k of ["pathStart", "knowWhatStart", "savedStart", "planDoor"]) fakeRouter[k] = null;
}
let view = null;
function path(door) { try { view?.onUnmount?.(); } catch {} main.innerHTML = ""; fakeRouter.pathStart = { door }; view = PathView(fakeRouter); view.mount(main); }
const step = () => main.querySelector(".path-view")?.dataset.step || null;
const h1 = () => txt(main.querySelector("h1"));
const rows = () => [...main.querySelectorAll(".path-row[data-v]")];
const vals = () => rows().map(r => r.dataset.v);
const tapRow = v => click(main.querySelector(`.path-row[data-v="${v}"]`));
const progIds = () => [...main.querySelectorAll(".path-mv__nm")].map(el => el.textContent);
const practice = () => store.get("generatedSession")?.session || null;
const daysAgoIso = n => new Date(Date.now() - n * 86400000).toISOString();
const toHow = (door, place = "home") => { path(door); tapRow(place); tapRow("whole"); };

// ── 0 ────────────────────────────────────────────────────────────────────
console.log("\nTEST 0 - Free");
fixture({ tier: "free" }); path("moving");
ok("0a. Free opening a door route is sent Home", navs.join() === "today" && !main.querySelector(".path-view"), J(navs));
const plain = [{ id: "a", type: "walk", completedAt: daysAgoIso(1), durationMins: 20 }, { id: "b", type: "run", completedAt: daysAgoIso(0), durationMins: 30, status: "partial" }];
ok("0b. completedSessions with no snack is as before (partials out, nothing merged)", J(store.completedSessions(plain)) === J([plain[0]]), J(store.completedSessions(plain)));

// ── 1 ────────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - Follow a fitness trend, in the two doors");
fixture(); toHow("moving");
ok("1pc. the route reaches How would you like it?", step() === "how", step());
ok("1a. How offers Follow a fitness trend, saying what is behind it", vals().includes("trend") && /Zone 2, cross training, HILIT, a 10-minute snack/.test(txt(main.querySelector('.path-row[data-v="trend"]'))), txt(main.querySelector('.path-row[data-v="trend"]')));
tapRow("trend");
ok("1b. Keep moving: Zone 2, Mix it up, HILIT, the snack", step() === "trends" && h1() === "Follow a fitness trend" && vals().join() === "zone2,cross,hilit,snack", vals().join());
fixture(); toHow("stronger"); tapRow("trend");
ok("1c. Get stronger: Mix it up, HILIT and the snack, never Zone 2", vals().join() === "cross,hilit,snack", vals().join());
ok("1d. no trademark anywhere on the step", !/hyrox|deka/i.test(main.textContent));

// ── 2 ────────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - Zone 2");
fixture(); toHow("moving"); tapRow("trend"); tapRow("zone2");
ok("2a. not followed yet: which activity", step() === "z2act" && vals().join() === "walk,run,cycle,row,swim", `${step()} ${vals()}`);
tapRow("run");
ok("2b. choosing one starts following it, from today", J((store.get("trends") || []).map(t => [t.id, t.activity, t.startedAt])) === J([["zone2", "run", store._localDay()]]), J(store.get("trends")));
ok("2c. week 1: the easy day only, and why", step() === "z2day" && /week 1/.test(h1()) && vals().includes("easy") && !vals().includes("hard") && /starts in week 5/.test(main.textContent), `${h1()} ${vals()}`);
tapRow("easy");
const easyIds = [...main.querySelectorAll(".path-mv")].length;
ok("2d. the easy day is a proposal, said in the talk test's words", step() === "prog" && txt(main.querySelector("#path-effort")).startsWith(R.EFFORT.easy) && !main.querySelector("#path-hard-safety") && easyIds === 1, txt(main.querySelector("#path-effort")));
ok("2e. its movement is the run pool's easy one", progIds()[0]?.includes("Easy Run"), progIds().join());
const swapBtn = main.querySelector("[data-swap]");
click(swapBtn);
const afterSwap = [...main.querySelectorAll(".path-mv__nm")].map(e => e.textContent).join();
ok("2f. Swap stays inside the pool (another easy run, or walk-run)", /Easy Run|Walk-Run/.test(afterSwap) && !/Deceleration|Sprint|Tempo/.test(afterSwap), afterSwap);
navs = []; click(main.querySelector("#path-start"));
ok("2g. Start hands the player a Zone 2 easy session", navs.join() === "workout" && practice()?.trend === "zone2" && practice()?.effort === "easy" && !practice()?.snack, J([navs, practice()?.trend, practice()?.effort]));
store.set("trends", [{ id: "zone2", startedAt: store._localDay(new Date(Date.now() - 30 * 86400000)), activity: "run" }]);
path("moving"); tapRow("home"); tapRow("whole"); tapRow("trend"); tapRow("zone2");
ok("2h. week 5: the harder day is offered", step() === "z2day" && /week 5/.test(h1()) && vals().includes("hard"), `${h1()} ${vals()}`);
tapRow("hard");
ok("2i. the harder day says Hard and the safety line", txt(main.querySelector("#path-effort")).startsWith(R.EFFORT.hard) && txt(main.querySelector("#path-hard-safety")) === R.HARD_SAFETY);
ok("2j. it warms up and finishes easy", progIds().length === 3 && /Easy Run/.test(progIds()[0]) && /Easy Run/.test(progIds()[2]), progIds().join());
ok("2j2. no step's name says a length (each says its own minutes)", progIds().every(n => !/\d+\s*Minutes?/i.test(n)), progIds().join());
navs = []; click(main.querySelector("#path-start"));
ok("2j3. nor in the player", (practice()?.exercises || []).every(e => !/\d+\s*Minutes?/i.test(e.name)) && practice()?.exercises?.length === 3, J((practice()?.exercises || []).map(e => [e.name, e.duration])));
store.logActivity({ type: "workout", completedAt: new Date().toISOString(), trend: "zone2", effort: "hard", durationMins: 25, exerciseIds: ["run-fartlek-25"] });
path("moving"); tapRow("home"); tapRow("whole"); tapRow("trend"); tapRow("zone2");
ok("2k. once done this week, not offered again, and said", !vals().includes("hard") && /harder day is done/.test(main.textContent), vals().join());
tapRow("stop");
ok("2l. Stop following Zone 2 removes it", !(store.get("trends") || []).some(t => t.id === "zone2") && step() === "trends", J(store.get("trends")));

// ── 3 ────────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - Snacks");
const HELD = new Set(R.HELD);
for (const q of ["legs", "pull", "middle", "balance"]) {
  fixture({ home: ["resistance-band-medium"] }); toHow("stronger"); tapRow("trend"); tapRow("snack");
  if (q === "legs") ok("3pc. the snack step: length and standing or seated, then the qualities", step() === "squal" && vals().join() === "legs,pull,middle,balance"
     && main.querySelectorAll('input[name="slen"]').length === 2 && main.querySelectorAll('input[name="sseat"]').length === 2, `${step()} ${vals()}`);
  tapRow(q);
  const s = R.snackSession({ quality: q, byId: new Map(EXERCISES.map(e => [e.id, e])) });
  const shown = [...main.querySelectorAll(".path-mv")].length;
  const moves = new Set((s?.steps || []).map(x => x.id));
  ok(`3a. ${q}: a proposal from its approved pool, about ten minutes`, step() === "prog" && shown >= 7 && [...moves].every(id => POOL(q).has(id) && LIB.has(id) && !HELD.has(id)), `${step()} ${shown} ${[...moves]}`);
  navs = []; click(main.querySelector("#path-start"));
  const ex = practice()?.exercises || [];
  ok(`3b. ${q}: the player gets a snack, its movements all from the pool`, practice()?.snack === true && ex.every(e => POOL(q).has(e.id)) && Math.round(ex.reduce((a, e) => a + e.duration, 0) / 60) === 10, J(ex.map(e => [e.id, e.duration])));
}
fixture({ home: [], gym: [] }); toHow("stronger"); tapRow("trend"); tapRow("snack"); tapRow("pull");   // gym empty too: the builder uses one list when the other is empty (equipmentForLocation)
const noKit = [...main.querySelectorAll(".path-mv__nm")].map(e => e.textContent).join();
ok("3c. a pull at home with no band: no band move", step() === "prog" && !/Band/.test(noKit), noKit);
fixture({ home: [] }); toHow("stronger"); tapRow("trend"); tapRow("snack"); pick(main.querySelector('input[name="sseat"][value="seated"]')); tapRow("middle");
const seatedNames = [...main.querySelectorAll(".path-mv__nm")].map(e => e.textContent).join();
ok("3d. seated: seated moves only", /Seated/.test(seatedNames) && !/Plank|Bird Dog/.test(seatedNames), seatedNames);
fixture({ home: [], prefs: { "dead-bug": { preference: "avoid", setAt: new Date().toISOString(), source: "skip" } } }); toHow("stronger"); tapRow("trend"); tapRow("snack"); tapRow("middle");
ok("3e. Not again is never offered", !/Dead Bug/.test(main.textContent));
fixture(); toHow("moving"); tapRow("trend"); tapRow("snack");
ok("3f. Keep moving's snacks: getting out of breath, and legs", vals().join() === "legs,breath", vals().join());
tapRow("breath");
ok("3g. out of breath: Hard work bits with the safety line, easy bits between", txt(main.querySelector("#path-effort")).startsWith(R.EFFORT.hard) && !!main.querySelector("#path-hard-safety"));

// ── 4 ────────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - Cross training");
fixture(); toHow("moving"); tapRow("trend"); tapRow("cross");
ok("4a. nothing in the log: What do you do most?", step() === "xmain" && h1() === "What do you do most?", `${step()} ${h1()}`);
tapRow("run");
ok("4b. then two or three easy choices, the person picks", step() === "xopts" && rows().filter(r => r.dataset.v.startsWith("trend-cross-")).length >= 2 && rows().filter(r => r.dataset.v.startsWith("trend-cross-")).length <= 3
   && /You usually run/.test(main.textContent) && /You choose/.test(main.textContent), rows().map(r => r.dataset.v).join());
ok("4c. it is followed, with run as the main activity", (store.get("trends") || []).find(t => t.id === "cross")?.activity === "run", J(store.get("trends")));
ok("4d. no choice is the same as what they usually do (a run)", !rows().some(r => /run/i.test(txt(r.querySelector(".path-door__t")))));
tapRow(rows().find(r => r.dataset.v.startsWith("trend-cross-")).dataset.v);
ok("4e. a choice opens as a proposal, Easy", step() === "prog" && txt(main.querySelector("#path-effort")).startsWith(R.EFFORT.easy));
ok("4f. no wording claims an injury effect", !/injur|rehab|protect/i.test(main.textContent));
fixture({ log: [0, 1, 2, 3].map(n => ({ id: `r${n}`, type: "run", completedAt: daysAgoIso(n + 1), durationMins: 25 })) });
toHow("moving"); tapRow("trend"); tapRow("cross");
ok("4g. four runs in the log: it knows they run, no question", step() === "xopts" && /You usually run/.test(main.textContent), step());

// ── 5 ────────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - the log keeps a trend session's marks");
// Played to the end in the real player, from the route's own Start.
const tap = sel => click(main.querySelector(sel) || document.querySelector(sel));
const paintWorkout = () => { main.innerHTML = workout.render(); try { workout.onMount(); } catch (e) { console.log("        onMount:", e.message); } };
const playOut = () => {
  // The player repaints itself by navigating to "workout", as in verify-path-finish.
  fakeRouter.navigate = realRouter.navigate = v => { navs.push(v); if (v === "workout") paintWorkout(); };
  paintWorkout();
  for (let i = 0; i < 40 && !navs.includes("plan-finish"); i++) {
    if (!main.querySelector("#wo-set-done-btn, #wo-done-btn, #complete-exercise-btn, #timer-toggle-btn")) { tap('[data-step-go="capture"]:not([aria-current])'); tap("#wo-step-capture"); }
    tap("#wo-set-done-btn"); tap("#wo-done-btn"); tap("#complete-exercise-btn");
  }
  fakeRouter.navigate = realRouter.navigate = v => navs.push(v);
};
fixture({ home: [] }); toHow("stronger"); tapRow("trend"); tapRow("snack"); tapRow("legs"); navs = []; click(main.querySelector("#path-start"));
{ // Counted reps rather than timers, so the harness can press through; the marks under test are the session's own.
  const g = store.get("generatedSession");
  store.set("generatedSession", { ...g, session: { ...g.session, exercises: g.session.exercises.slice(0, 3).map(e => ({ ...e, reps: "10", sets: 1, rest: 1 })) } }); }
playOut();
const played = (store.get("activityLog") || []).at(-1);
ok("5pc. the snack played to the Plan's finish", navs.includes("plan-finish"), J(navs));
ok("5b. the player's entry is a snack, and says nothing it was not", played?.snack === true && !("counted" in played) && !("trend" in played) && played?.effort === "steady", J(played && { snack: played.snack, trend: played.trend, effort: played.effort }));
fixture();
store.logActivity({ type: "workout", completedAt: new Date().toISOString(), trend: "zone2", effort: "easy", durationMins: 20 });
const last = store.get("activityLog").slice(-1)[0];
ok("5a. trend and effort on the entry", last.trend === "zone2" && last.effort === "easy", J(last));

// ── 6 ────────────────────────────────────────────────────────────────────
console.log("\nTEST 6 - snacks on one day are one day moved");
const morning = new Date(); morning.setHours(8, 0, 0, 0);
const at = h => new Date(morning.getTime() + h * 3600000).toISOString();
const snacks = [
  { id: "s1", type: "workout", completedAt: at(0), durationMins: 10, snack: true, exerciseIds: ["sit-to-stand"] },
  { id: "s2", type: "workout", completedAt: at(4), durationMins: 10, snack: true, exerciseIds: ["dead-bug"] },
  { id: "s3", type: "workout", completedAt: at(8), durationMins: 10, snack: true, exerciseIds: ["plank"] },
  { id: "w1", type: "walk", completedAt: at(9), durationMins: 30 },
];
const merged = store.completedSessions(snacks);
ok("6a. three snacks and a walk: two sessions", merged.length === 2, J(merged.map(e => e.id)));
ok("6b. the snacks' minutes are added, their movements joined", merged[0].durationMins === 30 && merged[0].snacksInDay === 3 && J(merged[0].exerciseIds) === J(["sit-to-stand", "dead-bug", "plank"]), J(merged[0]));
const withCounted = snacks.map(e => e.id === "s2" ? { ...e, counted: true } : e);
ok("6c. a counted snack is a session of its own", store.completedSessions(withCounted).length === 3 && store.completedSessions(withCounted).some(e => e.id === "s2" && !e.snacksInDay), J(store.completedSessions(withCounted).map(e => e.id)));
ok("6d. the stored log is not changed by counting", J(snacks.map(e => e.id)) === J(["s1", "s2", "s3", "w1"]));
fixture(); store.logActivity({ type: "workout", completedAt: new Date().toISOString(), snack: true, durationMins: 10, exerciseIds: ["sit-to-stand"] });
store.set("currentActivityEntry", store.get("activityLog").slice(-1)[0]);
main.innerHTML = ""; const fin = PlanFinishView(fakeRouter); fin.mount(main);
ok("6e. the Plan finish after a snack offers Count this as a session, unticked", !!main.querySelector("#pf-counted") && !main.querySelector("#pf-counted").checked && /Count this as a session/.test(main.textContent));
const box = main.querySelector("#pf-counted"); box.checked = true; box.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
navs = []; click(main.querySelector("#pf-done"));
ok("6f. ticked and Done: the snack is counted", store.get("activityLog").slice(-1)[0].counted === true, J(store.get("activityLog").slice(-1)[0]));
fixture(); store.logActivity({ type: "workout", completedAt: new Date().toISOString(), durationMins: 30, exerciseIds: ["plank"] });
store.set("currentActivityEntry", store.get("activityLog").slice(-1)[0]);
main.innerHTML = ""; PlanFinishView(fakeRouter).mount(main);
ok("6g. after any other session, no such box", !main.querySelector("#pf-counted"));

// ── 7 ────────────────────────────────────────────────────────────────────
console.log("\nTEST 7 - Progress says the Zone 2 week in words");
const { ProgressView } = await import(B + "views/progress.js");
fixture();
store.startTrend("zone2", "run");
store.logActivity({ type: "workout", completedAt: new Date().toISOString(), trend: "zone2", effort: "easy", durationMins: 25 });
main.innerHTML = ""; try { ProgressView(fakeRouter).mount(main); } catch (e) { console.log("        ", String(e)); }
await new Promise(r => setTimeout(r, 30));
const words = txt(main.querySelector("#pr-trend-words"));
ok("7a. the Plan, following Zone 2: Your Zone 2 week, in words", words === "This week: all easy.", words || main.textContent.slice(0, 120));
ok("7b. no percent, score or grade in it", !/%|score|grade/i.test(txt(main.querySelector(".pr-trend"))));
fixture({ tier: "free" }); store.startTrend("zone2", "run");
store.logActivity({ type: "workout", completedAt: new Date().toISOString(), trend: "zone2", effort: "easy", durationMins: 25 });
main.innerHTML = ""; try { ProgressView(fakeRouter).mount(main); } catch {}
await new Promise(r => setTimeout(r, 30));
ok("7c. Free: no Zone 2 week", !main.querySelector(".pr-trend"));

// ── 8 ────────────────────────────────────────────────────────────────────
console.log("\nTEST 8 - HILIT");
const BYID = new Map(EXERCISES.map(e => [e.id, e]));
const HPOOL = new Set(Object.values(R.HILIT_POOLS).flatMap(p => [...p.stand, ...(p.gym || []), ...p.seated]));
const WARM = new Set(["marching-on-spot", "seated-marching-cardio", "squat-to-reach", "step-jacks", "sport-cooldown-general"]);
fixture({ home: [], gym: [] }); toHow("stronger"); tapRow("trend"); tapRow("hilit");
ok("8a. week 1: 30 seconds on, 30 off, length and standing or seated, today's session", step() === "hilit" && /week 1/.test(h1()) && /30 seconds, then 30 seconds/.test(main.textContent)
   && [...main.querySelectorAll('input[name="hlen"]')].map(i => i.value).join() === "20,30,40" && vals().includes("go"), `${h1()} ${vals()}`);
pick(main.querySelector('input[name="hlen"][value="20"]')); tapRow("go");
const hp = st => [...main.querySelectorAll(".path-mv__nm")].map(e => e.textContent);
ok("8b. it is followed from today, and opens as a proposal: Hard, the safety line", (store.get("trends") || []).some(t => t.id === "hilit") && step() === "prog"
   && txt(main.querySelector("#path-effort")).startsWith(R.EFFORT.hard) && !!main.querySelector("#path-hard-safety"), J(store.get("trends")));
navs = []; click(main.querySelector("#path-start"));
const hx = practice()?.exercises || [];
const work = hx.filter(e => /hard/.test(e.pathNote || ""));
ok("8c. two rounds of five stations, each 30 seconds", work.length === 10 && work.every(e => e.duration === 30), J(work.map(e => [e.id, e.duration])));
ok("8d. every station from the approved pools, never impact or a jump, never a held slider", work.every(e => HPOOL.has(e.id) && BYID.get(e.id)?.impact === false && BYID.get(e.id)?.movementPattern !== "jump" && !R.HELD.includes(e.id)), J(work.map(e => e.id)));
ok("8e. everything else is the warm-up, rests and cool-down", hx.filter(e => !/hard/.test(e.pathNote || "")).every(e => WARM.has(e.id)));
ok("8f. it is marked HILIT and Hard for the log", practice()?.trend === "hilit" && practice()?.effort === "hard");
ok("8g. no kit: no band or dumbbell move", work.every(e => !(BYID.get(e.id)?.equipment || []).length), J(work.map(e => e.id)));
store.logActivity({ type: "workout", completedAt: new Date().toISOString(), trend: "hilit", effort: "hard", durationMins: 20 });
path("stronger"); tapRow("home"); tapRow("whole"); tapRow("trend"); tapRow("hilit");
ok("8h. done today: not offered, and why (a day off between)", !vals().includes("go") && /day off between/.test(txt(main.querySelector("#path-hilit-why"))), vals().join());
// The rule, on fixed days (Friday 30 Oct 2026, after Monday 26 and Wednesday 28): never vacuous on any weekday.
const fri = new Date(2026, 9, 30, 12);
const monWed = [26, 28].map(d => ({ trend: "hilit", effort: "hard", completedAt: new Date(2026, 9, d, 7).toISOString() }));
ok("8i. two this week already: not allowed, and said", !R.hilitDayAllowed(monWed, fri).ok && /two HILIT days this week/.test(R.hilitDayAllowed(monWed, fri).why));
ok("8i2. one this week, two days ago: allowed", R.hilitDayAllowed(monWed.slice(1), fri).ok);
ok("8i3. one yesterday: not allowed (a day off between)", !R.hilitDayAllowed([{ trend: "hilit", completedAt: new Date(2026, 9, 29, 18).toISOString() }], fri).ok);
ok("8i4. last week's do not count", R.hilitDayAllowed([19, 21, 23].map(d => ({ trend: "hilit", completedAt: new Date(2026, 9, d, 7).toISOString() })), fri).ok);
ok("8j. the week's shape: block 2 is 40 on, 20 off; block 3 four rounds; each fourth week easier", J([R.hilitWeek(5), R.hilitWeek(9).rounds, R.hilitWeek(4).rounds, R.hilitWeek(12).rounds])
   === J([{ week: 5, block: 2, easier: false, work: 40, rest: 20, rounds: 3 }, 4, 2, 3]));
fixture({ home: [], gym: [] }); toHow("stronger"); tapRow("trend"); tapRow("hilit");
pick(main.querySelector('input[name="hseat"][value="seated"]')); tapRow("go");
const seatedH = hp().join();
ok("8k. seated: seated stations only", /Seated/.test(seatedH) && !/Plank|Lunge|Press-Up|Sit to Stand/.test(seatedH), seatedH);
ok("8l. never a trademark", !/hyrox|deka/i.test(main.textContent));
const marked = new Map([...BYID].map(([id, e]) => [id, id === "sit-to-stand" ? { ...e, impact: true } : id === "reverse-lunge" ? { ...e, movementPattern: "jump" } : e]));
const guarded = R.hilitSession({ week: 1, minutes: 20, byId: marked });
ok("8m. a pool movement marked impact or jump is never used (the library can change)", guarded && !guarded.steps.some(s => s.id === "sit-to-stand" || s.id === "reverse-lunge"), J(guarded?.steps.map(s => s.id)));

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
