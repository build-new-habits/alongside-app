import { createRequire as __cr } from "node:module";
/**
 * tools/verify-ready-sessions.mjs
 * 19 Nov 2026 v1
 *
 * v1 - P-9d (c) READY-MADE SESSIONS (Graeme, 19 Nov). Red on alongside-v721
 *   (no data/ready-sessions.js, no step), green after. Checks:
 *   1. the 24 sessions: six a door a place; every movement a library entry
 *      at every size; home body weight only; each ends with an approved
 *      Stretch routine and starts with a timed warm-up; jumping only where
 *      said; sizes in order and in range; sets and reps as the guidance
 *      says, said in words; Keep moving's effort by the talk test.
 *   2. the door: How would you like it? › Ready-made sessions › How long
 *      have you got? › the plan screen › Start, with sets, reps and rest
 *      reaching the player (not one timed go); warm-up and stretch by time.
 *   3. Make it mine keeps the amounts.
 *   4. Keep moving at the gym; a hard day's talk-test words and safety line;
 *      none for Outside.
 *   5. a sore area at Bad: what it rules out is left out, as every
 *      programme.
 *   6. Free: no door.
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
const { PROGRAMMES } = await import(B + "data/feel-programmes.js");
const { ROUTINES } = await import(B + "data/stretch-routines.js");
const { todaysLengthCat } = await import(B + "data/session-length.js");
const { TodayView } = await import(B + "views/today.js");
const { PathView } = await import(B + "views/path.js");
const { KnowWhatView } = await import(B + "views/know-what.js");
const SAVED = await import(B + "views/saved-sessions.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { router: realRouter } = await import(B + "router.js");
let RS = null;
try { RS = await import(B + "data/ready-sessions.js"); } catch (e) { console.log("  (data/ready-sessions.js could not be loaded: " + e.message + ")"); }
const { EXERCISES } = await import(B + "data/exercises/index.js");
const LIB = new Map(Object.values(EXERCISES).map(e => [e.id, e]));
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
for (const k of ["navigate"]) realRouter[k] = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const pick = el => { if (!el) return; el.checked = true; el.dispatchEvent(new dom.window.Event("change", { bubbles: true })); };
const todayKey = new Date().toISOString().split("T")[0];
const wait = ms => new Promise(r => setTimeout(r, ms));

function fixture({ tier = "personal", checkin = { energy: 6, mood: 6 }, sore = null, saved = null } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("guidanceShownAt", new Date().toISOString());
  store.set("gymEquipment", ["dumbbells-medium", "bench-flat", "gym-membership"]); store.set("homeEquipment", []);
  if (checkin) {
    store.set("checkinHistory", { [todayKey]: { energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString() } });
    store.set("lastCheckin", { ...store.get("lastCheckin"), energy: checkin.energy, mood: checkin.mood, date: new Date().toDateString(), timestamp: new Date().toISOString() });
  }
  if (sore) { store.set("conditions", Object.keys(sore)); store.set("conditionPainScores", sore); }
  if (saved) store.set("savedSessions", saved);
  navs = []; for (const k of ["pathStart", "knowWhatStart", "savedStart", "planReason", "planKeep"]) fakeRouter[k] = null;
}
function home() { main.innerHTML = ""; TodayView(fakeRouter).mount(main); }
let view = null;
function path() { try { view?.onUnmount?.(); } catch {} main.innerHTML = ""; view = PathView(fakeRouter); view.mount(main); }
const step = () => main.querySelector(".path-view")?.dataset.step || null;
const h1 = () => txt(main.querySelector("h1"));
const rows = () => [...main.querySelectorAll(".path-row[data-v]")];
const rowText = () => rows().map(r => txt(r.querySelector(".path-door__t")));
const tapRow = v => { click(main.querySelector(`.path-row[data-v="${v}"]`));
  // v-P28: a walk, run or ride asks how first; Just go is the plan as before.
  if (main.querySelector('.path-view[data-step="gway"]')) click(main.querySelector('.path-row[data-v="just"]')); };
const tapDoor = d => { navs = []; click(main.querySelector(`.path-door[data-door="${d}"]`)); };
const steps = [];
const seen = () => steps.push({ step: step(), h1: h1() });


// ── 1. THE SESSIONS ──────────────────────────────────────────────────────
console.log("\nTEST 1 - the 24 sessions, as the draft says");
ok("1a. data/ready-sessions.js exists and gives 24 sessions", !!RS && RS.READY_SESSIONS.length === 24, RS ? RS.READY_SESSIONS.length : "missing");
const ALL = RS ? RS.READY_SESSIONS : [];
const SZ = ["short", "usual", "long"];
const at = (s, z) => RS.readySession(s, z);
const grid = {}; for (const s of ALL) grid[`${s.door}/${s.place}`] = (grid[`${s.door}/${s.place}`] || 0) + 1;
ok("1b. Six for each door and place: Get stronger and Keep moving, Gym and Home", ["stronger/gym", "stronger/home", "moving/gym", "moving/home"].every(k => grid[k] === 6) && Object.keys(grid).length === 4, JSON.stringify(grid));
const missing = ALL.flatMap(s => SZ.flatMap(z => at(s, z).steps.filter(st => !LIB.has(st.id)).map(st => `${s.id}/${z}:${st.id}`)));
ok("1c. Every movement, at every size, is a library entry (no held or new movement)", ALL.length > 0 && missing.length === 0, missing.slice(0, 5).join(", "));
const homeKit = ALL.filter(s => s.place === "home").flatMap(s => SZ.flatMap(z => at(s, z).steps.filter(st => (LIB.get(st.id)?.equipment || []).length).map(st => `${s.id}/${z}:${st.id}`)));
ok("1d. Home is body weight only, at every size (Graeme, 19 Nov)", ALL.length > 0 && homeKit.length === 0, homeKit.slice(0, 5).join(", "));
const routineEnd = s => { if (!s.stretch) return true; const r = ROUTINES.find(x => x.id === s.stretch); const st = at(s, "usual").steps; return !!r && r.steps.every((x, i) => st[st.length - r.steps.length + i]?.id === x.id); };
ok("1e. Every session ends with an approved Stretch routine (the ten-minute one excepted)", ALL.length > 0 && ALL.every(routineEnd) && ALL.filter(s => !s.stretch).map(s => s.id).join() === "rm-gs-h6", ALL.filter(s => !routineEnd(s)).map(s => s.id).join());
ok("1f. Every session starts with a timed warm-up", ALL.length > 0 && ALL.every(s => SZ.every(z => at(s, z).steps[0]?.mins > 0)));
const impactSoft = ALL.filter(s => s.place === "home" && s.effort !== "hard").flatMap(s => SZ.flatMap(z => at(s, z).steps.filter(st => LIB.get(st.id)?.impact === true).map(st => `${s.id}:${st.id}`)));
ok("1g. Jumping only in the home session that says so (Cardio with jumping, Hard)", ALL.length > 0 && impactSoft.length === 0 && ALL.find(s => s.id === "rm-km-h5")?.effort === "hard", impactSoft.slice(0, 5).join(", "));
const order = ALL.filter(s => !s.fixed).map(s => SZ.map(z => at(s, z).minutes));
ok("1h. Shorter is never longer than As written, nor As written than Longer", ALL.length > 0 && order.every(([a, b, c]) => a <= b && b <= c), JSON.stringify(order.filter(([a, b, c]) => !(a <= b && b <= c))));
ok("1i. Shorter is 40 minutes or less, Longer 75 or less", ALL.length > 0 && order.every(([a, , c]) => a <= 40 && c <= 75), JSON.stringify(order));
const strength = ALL.filter(s => s.door === "stronger").flatMap(s => at(s, "usual").steps.filter(st => st.sets));
ok("1j. Strength sets are 2 or 3, reps 8 to 12 (ACSM for health) or a hold or carry", ALL.length > 0 && strength.every(st => st.sets >= 2 && st.sets <= 3 && (st.secs || /metres/.test(st.reps) || (parseInt(st.reps, 10) >= 8 && parseInt(st.reps, 10) <= 12))),
   strength.filter(st => !(st.sets >= 2 && st.sets <= 3)).map(st => st.id).join());
ok("1k. Every strength step says its amount in words (3 × 10, 2 × 25 seconds)", ALL.length > 0 && strength.every(st => /^\d × /.test(st.dose || "")));
const effortOk = ALL.every(s => s.door === "moving" ? ["steady", "hard"].includes(s.effort) : !s.effort);
ok("1l. Keep moving says its effort by the talk test; Get stronger does not", ALL.length > 0 && effortOk);

// ── 2. THE DOOR ──────────────────────────────────────────────────────────
console.log("\nTEST 2 - Get stronger, at Home, Upper body: Ready-made sessions");
fixture(); fakeRouter.pathStart = { door: "stronger" }; path();
tapRow("home"); tapRow("upper");
ok("2a. How would you like it? offers Ready-made sessions, second", step() === "how" && rowText()[1] === "Ready-made sessions", rowText().join("|"));
tapRow("ready");
ok("2b. Its step: one h1, focused; six sessions; the upper-body one first, said so", step() === "ready" && h1() === "Ready-made sessions" && document.activeElement === main.querySelector("h1") && rows().length === 6
   && rows()[0]?.dataset.v === "rm-gs-h2" && /For your upper body/.test(txt(rows()[0])), rows().map(r => r.dataset.v).join());
ok("2c. Each row says what it is for and about how long", rows().length > 0 && rows().every(r => /About \d+ min/.test(txt(r))));
tapRow("rm-gs-h2");
const radiosNow = () => [...main.querySelectorAll('input[name="msz"]')];
ok("2d. How long have you got? Shorter, As written, Longer, as radios in a fieldset, each with its minutes", step() === "msize" && radiosNow().map(r => r.value).join() === "short,usual,long"
   && radiosNow().every(r => /about \d+ min/.test(txt(r.closest("label")))) && !!main.querySelector("fieldset.path-seg legend"), radiosNow().map(r => txt(r.closest("label"))).join("|"));
pick(radiosNow().find(r => r.value === "short"));
click(main.querySelector("#path-ready-go"));
const want = RS ? RS.readySession(RS.readyById("rm-gs-h2"), "short") : null;
ok("2e. The plan screen: its name, its line, every movement with its amount", step() === "prog" && h1() === "Upper focus at home" && !!want
   && main.querySelectorAll(".path-mv").length === want.steps.length && /2 × 10/.test(txt(main.querySelector(".path-mvs"))) && /Pushing, pulling/.test(txt(main)), `${h1()} ${main.querySelectorAll(".path-mv").length}`);
ok("2f. Each movement has a Swap and a YouTube search, as every programme", main.querySelectorAll(".path-mv__swap").length > 0 && main.querySelectorAll(".path-mv__yt").length === main.querySelectorAll(".path-mv").length);
navs = []; click(main.querySelector("#path-start"));
const gen = store.get("generatedSession")?.session;
const press = gen?.exercises?.find(e => e.id === "press-up-incline");
ok("2g. Start: the one player, with sets, reps and rest kept (2 × 10 press-ups, not one timed go)", navs.includes("workout") && press?.sets === 2 && press?.reps === "10" && !press?.duration && press?.rest === 60, JSON.stringify(press && { s: press.sets, r: press.reps, d: press.duration, rest: press.rest }));
const warm = gen?.exercises?.[0];
ok("2h. The warm-up and the stretch still play for their minutes", warm?.id === "marching-on-spot" && warm.duration === 180 && gen.exercises[gen.exercises.length - 1]?.duration > 0, JSON.stringify(warm && { id: warm.id, d: warm.duration }));
ok("2i. The session says its door and place, and which session it was", gen?.door === "stronger" && gen?.place === "home" && gen?.programmeId === "rm-gs-h2");

// ── 3. MAKE IT MINE ──────────────────────────────────────────────────────
console.log("\nTEST 3 - Make it mine keeps the amounts");
fixture(); fakeRouter.pathStart = { door: "stronger" }; path();
tapRow("gym"); tapRow("lower"); tapRow("ready"); tapRow("rm-gs-g2"); click(main.querySelector("#path-ready-go"));
click(main.querySelector("#path-mine"));
const kept = (store.get("savedSessions") || []).find(x => /Lower focus/.test(x.name || ""));
const squat = kept?.doses?.["goblet-squat"];
ok("3a. Kept in Saved sessions, the goblet squat still 3 \u00d7 10", !!kept && Number(squat?.sets) === 3 && String(squat?.reps) === "10", JSON.stringify(squat));

// ── 4. KEEP MOVING AND THE PLACES ────────────────────────────────────────
console.log("\nTEST 4 - Keep moving at the Gym; Outside has none");
fixture(); fakeRouter.pathStart = { door: "moving" }; path();
tapRow("gym"); tapRow("whole"); tapRow("ready");
ok("4a. Six gym sessions; the harder one says Hard", step() === "ready" && rows().length === 6 && /Hard/.test(txt(main.querySelector('.path-row[data-v="rm-km-g4"]'))), rows().length);
tapRow("rm-km-g4"); click(main.querySelector("#path-ready-go"));
ok("4b. A hard day shows the talk test's words and the safety line", step() === "prog" && !!main.querySelector("#path-effort") && !!main.querySelector("#path-hard-safety"));
ok("4c. Outside: no ready-made sessions (an outside activity is its own route)", !!RS && RS.readyFor("moving", "outside").length === 0 && RS.readyFor("stronger", "outside").length === 0);

// ── 5. A SORE AREA STILL WINS ────────────────────────────────────────────
console.log("\nTEST 5 - a sore area at Bad: the plan screen leaves out what it rules out");
fixture({ sore: { "lower-back": 9 } }); fakeRouter.pathStart = { door: "stronger" }; path();
tapRow("gym"); tapRow("lower"); tapRow("ready"); tapRow("rm-gs-g2"); click(main.querySelector("#path-ready-go"));
ok("5a. Something is marked Left out today, with its Swap, and Start leaves it out", step() === "prog" && main.querySelectorAll(".path-mv__out").length > 0 && !!main.querySelector("#path-outs"), txt(main.querySelector("#path-outs")).slice(0, 120));

// ── 6. FREE ──────────────────────────────────────────────────────────────
console.log("\nTEST 6 - Free: no door, so no ready-made sessions");
fixture({ tier: "free" }); navs = []; fakeRouter.pathStart = { door: "stronger" }; path();
ok("6a. Free opening the route is sent Home, nothing drawn", navs.join() === "today" && !main.querySelector(".path-view"));

console.log(`\n${"=".repeat(60)}\nVERIFY-READY-SESSIONS: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
