import { createRequire as __cr } from "node:module";
/**
 * tools/verify-path-finish.mjs
 * 29 Oct 2026 v1
 *
 * STAGE PATH Session 6 (P-6 FINISH; P-12's one proposal shape). Drives the
 * real views: the player (workout.js), the Plan's finish (plan-finish.js),
 * the door route's proposal (path.js), Saved sessions and Today's plan.
 *
 *   1. On the Plan every way of finishing goes to the Plan's finish, and the
 *      log entry carries the door, feeling and name. Free: reflect, no door.
 *   2. Swap this one on the Plan counts as less often (never over a like).
 *   3. A low mood this morning, on the Plan: no countdown anywhere (the
 *      line "No countdown timers, go at your own pace" is true). Controls:
 *      an okay mood, and Free, keep the clock.
 *   4. Quite sore this morning, on the Plan: "A quick check: still okay?" at
 *      the halfway point, once; carry on, or stop and save. Controls.
 *   5. The Plan's finish: one h1; How do you feel now? with this morning's
 *      word (health consent); the pain check only when sore today, Worse
 *      says the safety line; Loved it / Less often / Not again per movement;
 *      Keep to repeat; Your arc today; Add a note. Done saves only what was
 *      said. Free opening it is sent to reflect.
 *   6. One proposal shape: every programme movement has its figure and a
 *      Swap; Swap is said and keeps focus; Make it mine keeps the version in
 *      Saved sessions for its door; a kept session opens as a proposal with
 *      its own doses and starts as itself. Today's plan's rows have figures
 *      on the Plan (not on Free), and the door goes with what it starts.
 *   7. saveSession keeps purpose and place when the session says them.
 *   8. Free's finish (reflect.js, whose pieces the Plan's finish now uses) is
 *      byte for byte as it was on alongside-v685, for the same session.
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
if (!globalThis.CSS) globalThis.CSS = { escape: s => String(s).replace(/[^a-zA-Z0-9_-]/g, c => "\\" + c) };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const workout = await import(B + "views/workout.js");
const { PlanFinishView } = await import(B + "views/plan-finish.js");
const { PathView } = await import(B + "views/path.js");
const SAVED = await import(B + "views/saved-sessions.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { saveSession } = await import(B + "data/saved-sessions.js");
const { PROGRAMMES } = await import(B + "data/feel-programmes.js");
const { SAFETY_LINE } = await import(B + "data/purpose.js");
const { router: realRouter } = await import(B + "router.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const paintWorkout = () => { main.innerHTML = workout.render(); try { workout.onMount(); } catch (e) { console.log("        onMount:", e.message); } };
const fakeRouter = { history: ["today"], navigate: v => { navs.push(v); if (v === "workout") paintWorkout(); }, back() {} };
globalThis.window.router = fakeRouter;
Object.defineProperty(globalThis, "router", { value: fakeRouter, configurable: true, writable: true });
realRouter.navigate = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const pick = el => { if (!el) return; el.checked = true; el.dispatchEvent(new dom.window.Event("change", { bubbles: true })); };
const tap = sel => click(main.querySelector(sel) || document.querySelector(sel));
const todayKey = new Date().toISOString().split("T")[0];

function fixture({ tier = "personal", mood = 6, sore = null } = {}) {
  if (document.querySelector("#exit-workout-btn")) { tap("#exit-workout-btn"); click(document.querySelector("#exit-confirm-discard")); }
  document.querySelectorAll("#session-exit-overlay").forEach(n => n.remove());
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("checkinHistory", { [todayKey]: { energy: 6, mood, date: new Date().toDateString() } });
  store.set("lastCheckin", { ...store.get("lastCheckin"), energy: 6, mood, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  if (sore) { store.set("conditions", Object.keys(sore)); store.set("conditionPainScores", sore); }
  for (const k of ["pathStart", "planDoor", "planReason", "planKeep", "savedStart"]) fakeRouter[k] = null;
  navs = [];
}
const EX = (id, name, extra = {}) => ({ id, name, section: "main", role: "main", category: "horizontal-pull", movementPattern: "pull",
  equipment: [], affectsAreas: ["upper-back"], sets: 1, reps: "10", rest: 1, duration: 60, instructions: ["Pull"], ...extra });
function startSession({ exercises = [EX("a", "Row"), EX("b", "Press"), EX("c", "Curl")], door = "stronger", feeling = null, title = "Upper Body" } = {}) {
  store.set("generatedSession", { session: { id: "upper-9", title, exercises, door, feeling }, builtAt: new Date().toISOString(), inputs: {} });
  navs = []; paintWorkout();
}
const toCapture = () => { if (!main.querySelector("#wo-set-done-btn, #wo-done-btn, #complete-exercise-btn, #timer-toggle-btn")) tap('[data-step-go="capture"]:not([aria-current])'); };
function finishAll(n) { for (let i = 0; i < n; i++) { toCapture(); tap("#wo-set-done-btn"); tap("#wo-done-btn"); tap("#complete-exercise-btn"); } }

// ── 1 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - the finish, and what the log keeps");
fixture(); startSession(); finishAll(3);
const e1 = (store.get("activityLog") || []).at(-1);
ok("1a. Plan, all done: the Plan's finish", navs.at(-1) === "plan-finish", JSON.stringify(navs));
ok("1b. and the entry keeps the door and the name", e1?.door === "stronger" && e1?.name === "Upper Body", JSON.stringify(e1 && { door: e1.door, name: e1.name }));
fixture(); startSession(); toCapture(); tap("#wo-set-done-btn"); tap("#wo-done-btn"); tap("#complete-exercise-btn");
tap("#exit-workout-btn"); click(document.querySelector("#exit-confirm-leave"));
ok("1c. Plan, ended part-way and saved: the Plan's finish, with the door", navs.at(-1) === "plan-finish" && (store.get("activityLog") || []).at(-1)?.door === "stronger", JSON.stringify(navs));
fixture({ tier: "free" }); startSession(); finishAll(3);
const e1f = (store.get("activityLog") || []).at(-1);
ok("1d. Free: reflect, as before, and no door on the entry", navs.at(-1) === "reflect" && e1f && !("door" in e1f) && !("name" in e1f), JSON.stringify(navs));

// ── 2 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - Swap this one, on the Plan, is less often");
// Swap in the player is offered only for cardio machines; drive it through its own function's path.
fixture(); const { EXERCISES } = await import(B + "data/exercises/index.js"); const { getSwapCandidates } = await import(B + "data/exercises/index.js");
const machine = EXERCISES.find(e => getSwapCandidates(e, []).length > 0);
if (machine) {
  startSession({ exercises: [{ ...machine, section: "main" }, EX("b", "Press"), EX("c", "Curl")] });
  tap('[aria-controls*="swap"], #wo-swap-btn, .exercise-swap__toggle');
  const choice = main.querySelector("[data-swap-to], [data-swap-id], .exercise-swap__option button, .exercise-swap__option");
  click(choice);
  ok("2a. Plan: swapping a movement out marks it less often (source swap)", (store.get("exercisePreferences") || {})[machine.id]?.preference === "less", JSON.stringify((store.get("exercisePreferences") || {})[machine.id]));
  fixture({ tier: "free" }); startSession({ exercises: [{ ...machine, section: "main" }, EX("b", "Press"), EX("c", "Curl")] });
  tap('[aria-controls*="swap"], #wo-swap-btn, .exercise-swap__toggle'); click(main.querySelector("[data-swap-to], [data-swap-id], .exercise-swap__option button, .exercise-swap__option"));
  ok("2b. Free: a swap records nothing", !(store.get("exercisePreferences") || {})[machine.id]);
} else ok("2a. a swappable movement exists in the library", false);

// ── 3 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 3 - a low mood: no countdown");
const timedEx = [EX("t1", "Hold", { reps: null, duration: 90 }), EX("t2", "Hold two", { reps: null, duration: 45 }), EX("t3", "Hold three", { reps: null, duration: 60 })];
fixture({ mood: 3 }); startSession({ exercises: timedEx }); toCapture();
ok("3a. Plan, low mood: how long, no clock, no Start-the-timer", /About 2 min/.test(txt(main)) && /No countdown today\. Go at your own pace\./.test(txt(main)) && !main.querySelector("#timer-toggle-btn, #timer-display") && !!main.querySelector("#wo-done-btn"), txt(main.querySelector(".exercise-target")));
fixture({ mood: 6 }); startSession({ exercises: timedEx }); toCapture();
ok("3b. CONTROL, okay mood: the clock", !!main.querySelector("#timer-display") && !!main.querySelector("#timer-toggle-btn"));
fixture({ tier: "free", mood: 3 }); startSession({ exercises: timedEx }); toCapture();
ok("3c. CONTROL, Free on a low mood: the clock, as before", !!main.querySelector("#timer-display"));

// ── 4 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - quite sore: the halfway check");
const four = [EX("a", "Row"), EX("b", "Press"), EX("c", "Curl"), EX("d", "Fly")];
fixture({ sore: { "lower-back": 6 } }); startSession({ exercises: four }); finishAll(2);
ok("4a. Plan, quite sore: at the halfway point, A quick check: still okay?", txt(main.querySelector("h1")) === "A quick check: still okay?" && /lower back was quite sore this morning/.test(txt(main)), txt(main).slice(0, 160));
tap("#wo-half-ok");
ok("4b. Still okay: on to the next movement, and not asked again", txt(main.querySelector("h1")) === "Curl" && navs.at(-1) === "workout");
fixture({ sore: { "lower-back": 6 } }); startSession({ exercises: four }); finishAll(2); navs = [];
tap("#wo-half-stop");
const e4 = (store.get("activityLog") || []).at(-1);
ok("4c. Not so good: stop here, what was done is saved, the Plan's finish", navs.at(-1) === "plan-finish" && e4?.status === "partial" && e4.exerciseIds.join() === "a,b", JSON.stringify({ navs, ids: e4?.exerciseIds }));
fixture({ sore: { "lower-back": 3 } }); startSession({ exercises: four }); finishAll(2);
ok("4d. CONTROL, a little sore: no check", txt(main.querySelector("h1")) === "Curl");
fixture({ tier: "free", sore: { "lower-back": 6 } }); startSession({ exercises: four }); finishAll(2);
ok("4e. CONTROL, Free: no check", txt(main.querySelector("h1")) === "Curl");

// ── 5 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - the Plan's finish");
function finishScreen(opts = {}) {
  fixture(opts);
  store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: new Date(Date.now() - 15 * 864e5).toISOString(), strands: [] });
  startSession(); finishAll(3);
  main.innerHTML = ""; const v = PlanFinishView(fakeRouter); v.mount(main); return v;
}
finishScreen({ mood: 3 });
ok("5a. one heading, That's today done., focused", main.querySelectorAll("h1").length === 1 && txt(main.querySelector("h1")) === "That’s today done." && document.activeElement === main.querySelector("h1"));
ok("5b. How do you feel now? on the five words, with this morning's", [...main.querySelectorAll('input[name="pf-mood"]')].map(i => i.value).join() === "2,3,6,7,9" &&
   /This morning you said low\./.test(txt(main)) && !!main.querySelector('input[name="pf-mood"]')?.closest("fieldset")?.querySelector("legend"));
ok("5c. no pain check when nothing is sore", !main.querySelector('input[name="pf-pain"]'));
ok("5d. each movement: Loved it and Less often, pressed-state buttons naming it", main.querySelectorAll(".pf-fb__row").length === 3 &&
   [...main.querySelectorAll(".pf-tog")].every(b => b.hasAttribute("aria-pressed") && b.getAttribute("aria-describedby")));
ok("5e. Keep to repeat and Add a note are there, folded", /Keep to repeat/.test(txt(main)) && /Add a note/.test(txt(main)));
pick(main.querySelector('input[name="pf-mood"][value="7"]'));
click(main.querySelector('.pf-fb__row[data-id="a"] [data-act="like"]'));
click(main.querySelector('.pf-fb__row[data-id="b"] [data-act="less"]'));
pick(main.querySelector('.pf-fb__row[data-id="b"] input[value="never"]'));
click(main.querySelector('.pf-fb__row[data-id="c"] [data-act="less"]'));
ok("5f. Less often opens How much less?, and focus stays on the button", !!main.querySelector('.pf-fb__row[data-id="c"] fieldset') && document.activeElement?.dataset.act === "less");
navs = []; click(main.querySelector("#pf-done"));
const e5 = (store.get("activityLog") || []).at(-1); const prefs = store.get("exercisePreferences") || {};
ok("5g. Done: the mood after on the entry, Loved, Not again and Less often kept, then Home (or the occasional prompt)",
   e5?.moodAfter === 7 && !!(store.get("likedMovements") || {}).a && prefs.b?.preference === "avoid" && prefs.c?.preference === "less" && prefs.c?.source === "finish" &&
   (navs.at(-1) === "today" || /A thought before you go/.test(txt(main))), JSON.stringify({ m: e5?.moodAfter, prefs, navs }));
finishScreen();
navs = []; click(main.querySelector("#pf-done"));
const e5b = (store.get("activityLog") || []).at(-1);
ok("5h. nothing said: nothing saved (no mood, no preferences)", !("moodAfter" in e5b && e5b.moodAfter != null) && !Object.keys(store.get("exercisePreferences") || {}).length && !Object.keys(store.get("likedMovements") || {}).length);
finishScreen({ sore: { "lower-back": 6 } });
ok("5i. sore today: How's your lower back now?", txt(main.querySelector('input[name="pf-pain"]')?.closest("fieldset")?.querySelector("legend")) === "How’s your lower back now?");
pick(main.querySelector('input[name="pf-pain"][value="worse"]'));
ok("5j. Worse: the safety line, said", txt(main.querySelector("#pf-line")).includes(SAFETY_LINE));
fixture({ tier: "free" }); store.set("currentActivityEntry", { id: "x", type: "workout" });
navs = []; main.innerHTML = ""; PlanFinishView(fakeRouter).mount(main);
ok("5k. Free opening it is sent to reflect", navs.join() === "reflect" && !main.querySelector(".plan-finish"));

// ── 6 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 6 - one proposal shape");
let pv = null;
const path = () => { try { pv?.onUnmount?.(); } catch {} main.innerHTML = ""; pv = PathView(fakeRouter); pv.mount(main); };
const calm1 = PROGRAMMES.find(p => p.feeling === "calm");
fixture(); fakeRouter.pathStart = { door: "feel" }; path();
click(main.querySelector('.path-row[data-v="calm"]')); click(main.querySelector(`.path-row[data-v="${calm1.id}"]`));
const mv = [...main.querySelectorAll(".path-mv")];
ok("6a. every movement: its figure and, where there is another of its kind, a Swap that names it", mv.length === calm1.steps.length && mv.some(m => m.querySelector(".path-mv__swap")) &&
   [...main.querySelectorAll(".path-mv__swap")].every(b => b.getAttribute("aria-describedby")), `${mv.length} ${main.querySelectorAll(".path-mv__swap").length}`);
const sw = main.querySelector(".path-mv__swap"); const si = Number(sw.dataset.swap);
const before = txt(main.querySelectorAll(".path-mv__nm")[si]);
click(sw); await wait(60);
const after = txt(main.querySelectorAll(".path-mv__nm")[si]);
ok("6b. Swap: another movement in its place, said, and focus stays on that Swap", before !== after && /^Swapped /.test(txt(main.querySelector("#path-live"))) && document.activeElement?.id === `path-swap-${si}`, `${before} -> ${after}`);
click(main.querySelector("#path-mine"));
const kept = (store.get("savedSessions") || []).at(-1);
ok("6c. Make it mine: this version kept in Saved sessions for Move to feel better", kept?.name === `${calm1.name}, my version` && kept.purpose === "feel" && txt(main.querySelector("#path-mine")) === "Kept in Saved sessions",
   JSON.stringify(kept && { name: kept.name, purpose: kept.purpose }));
// A kept session opens as a proposal
fixture();
const rec = { id: "own1", name: "Tuesday legs", sessionType: "lower", doses: { "push-up": { section: "main", sets: 3, reps: "8" } }, durationMins: 30, equipment: [],
              exerciseIds: ["push-up", "plank"], createdAt: new Date().toISOString(), lastUsedAt: null, purpose: "stronger", place: "home" };
store.set("savedSessions", [rec]);
main.innerHTML = SAVED.render(); SAVED.onMount(); navs = [];
click(main.querySelector('[data-saved-id="own1"]'));
ok("6d. Saved sessions, Start on the Plan: the proposal first", navs.join() === "path" && realRouter.pathStart?.saved === "own1", JSON.stringify(navs));
fakeRouter.pathStart = realRouter.pathStart; realRouter.pathStart = null; path();
ok("6e. its movements, with their own doses, figures and Swap, then Start", txt(main.querySelector("h1")) === "Tuesday legs" && /3 × 8/.test(txt(main)) && !!main.querySelector("#path-start") && !main.querySelector("#path-mine"), txt(main).slice(0, 200));
navs = []; click(main.querySelector("#path-start"));
const g6 = store.get("generatedSession");
ok("6f. Start: as itself (its doses, its id), the one player", navs.join() === "workout" && g6.inputs.savedSessionId === "own1" && g6.session.exercises[0].reps === "8" && g6.session.door === "stronger", JSON.stringify(g6.session.exercises.map(e => [e.id, e.sets, e.reps])));
// Today's plan
fixture(); store.set("requestedSessionType", "full"); fakeRouter.planDoor = "stronger";
main.innerHTML = ""; CoachProposalView(fakeRouter).mount(main); await wait(50);
const rows = [...main.querySelectorAll(".cp-plan__row")];
ok("6g. Today's plan on the Plan: each row's figure beside its Swap (where there is a figure)", rows.some(r => r.querySelector(".cp-plan__fig svg")) && rows.every(r => !r.querySelector(".cp-plan__fig") || r.querySelector(".cp-plan__fig").getAttribute("aria-hidden") === "true"), `${rows.length} rows`);
navs = []; click(main.querySelector("#cp-preview-start")); await wait(1200);
ok("6h. and the door goes with what it starts, read once", store.get("generatedSession")?.session?.door === "stronger" && fakeRouter.planDoor === null, JSON.stringify(store.get("generatedSession")?.session?.door));
fixture({ tier: "free" }); store.set("requestedSessionType", "full");
main.innerHTML = ""; CoachProposalView(fakeRouter).mount(main); await wait(50);
ok("6i. Free: no figures added to the rows", !main.querySelector(".cp-plan__fig"));

// ── 7 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 7 - a kept session keeps its door and place");
fixture();
const res = saveSession("Mine", { title: "Mine", exercises: [EX("push-up", "Push-up")], door: "moving", place: "gym" });
const r7 = (store.get("savedSessions") || []).at(-1);
ok("7a. purpose and place kept from the session", res.ok && r7.purpose === "moving" && r7.place === "gym");
saveSession("Mine two", { title: "Mine two", exercises: [EX("plank", "Plank")] });
const r7b = (store.get("savedSessions") || []).at(-1);
ok("7b. absent when the session does not say", !("purpose" in r7b) && !("place" in r7b));

// ── 8 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 8 - Free's finish is as it was");
{
  const { execSync } = await import("node:child_process");
  const { writeFileSync, unlinkSync } = await import("node:fs");
  const ROOT = new URL("..", import.meta.url).pathname;
  let old = "";
  try { old = execSync(`git -C "${ROOT}" show 6afc87c:js/views/reflect.js`, { encoding: "utf8", maxBuffer: 1 << 26 }); } catch {}
  ok("8pc. reflect.js as it was on v685 is in the history", old.length > 20000);
  if (old) {
    const tmp = new URL("../js/views/__reflect_v685_check.js", import.meta.url);
    writeFileSync(tmp, old);
    let OLD; try { OLD = await import(tmp.href); } finally { unlinkSync(tmp); }
    const NOW = await import(B + "views/reflect.js");
    fixture({ tier: "free", sore: { "lower-back": 4 } }); startSession(); finishAll(3);
    const snap = JSON.stringify(store.data);
    const draw = mod => { store.data = JSON.parse(snap); store.save(); main.innerHTML = mod.render(); try { mod.onMount(); } catch {} return main.innerHTML; };
    const a = draw(OLD), b2 = draw(NOW);
    let at = 0; while (at < a.length && a[at] === b2[at]) at++;
    ok("8a. Free's finish, the same session: the same, byte for byte", a === b2 && a.length > 500, `differs at ${at}: ${a.slice(at - 40, at + 40)} | ${b2.slice(at - 40, at + 40)}`);
  }
}

console.log(`\n${"=".repeat(60)}\nVERIFY-PATH-FINISH: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
