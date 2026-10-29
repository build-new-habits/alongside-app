import { createRequire as __cr } from "node:module";
/**
 * tools/verify-path-routes.mjs
 * 29 Oct 2026 v1
 *
 * STAGE PATH Session 5 (P-5 DOOR-ROUTES; blueprint v6 D3, D4, Part G), as
 * mock-up v10 (Graeme, 29 Oct: "Yep. I like v10"). Drives the real views:
 * Home's doors (today.js -> plan-home.js), the door routes (views/path.js),
 * I know what I want, Saved sessions and Today's plan.
 *
 *   0. Free: no route behind the doors (sent Home).
 *   1. Get stronger: Where -> Which part -> How -> length -> Today's plan,
 *      for the door's kind, part and place (D4), at today's length; Back
 *      goes one step and puts focus back on what opened it.
 *   2. Keep moving: the whole body is cardio; Build my own opens I know what
 *      I want with the door's kind, part and place chosen (read once).
 *   3. Outside never offers the gym or yoga; Log it opens Log what I did.
 *   4. Stretch never asks Where: Where to stretch -> its routines; Not
 *      today (the floor) leaves out floor routines and the fresh one, and a
 *      routine with its own swap plays it; the fresh one is the builder's
 *      stretch for the area's zones.
 *   5. Move to feel better never asks Where, a part or How: the feelings
 *      (the coach's suggestion in their word, or Help me choose with one
 *      question), the programmes (How long have you got? marks one), and a
 *      programme plays in the one player, its movements in order for their
 *      minutes; A fresh one for me, Surprise me.
 *   6. The coach's Move to feel better choice: its programme open, the
 *      reason in their word, Change my check-in, and Wellbeing on a
 *      low-mood day only (Graeme, 29 Oct: "Agreed"); Back is its feeling's
 *      programmes, the programme marked.
 *   7. Back to the route with no hand-off: the last door's first step.
 *   8. Saved sessions from a door: that door's and the ones kept before
 *      doors, with Show all.
 *   9. Today's plan on the Plan: the coach's reason at the start of the
 *      plan's own sentence, What I've adjusted (only lines true in the app
 *      today), Change my check-in back to the same kind; Free unchanged.
 *  10. Part G on every step: one h1, focused; choices of one are radios in
 *      a fieldset with a legend; the step bar is named.
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
  if (sore) store.set("conditionPainScores", sore);
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
const tapRow = v => click(main.querySelector(`.path-row[data-v="${v}"]`));
const tapDoor = d => { navs = []; click(main.querySelector(`.path-door[data-door="${d}"]`)); };
const steps = [];
const seen = () => steps.push({ step: step(), h1: h1() });

// ── 0. FREE ──────────────────────────────────────────────────────────────
console.log("\nTEST 0 - Free has no route behind the doors");
fixture({ tier: "free" }); fakeRouter.pathStart = { door: "stretch" }; path();
ok("0a. Free opening it is sent Home, and nothing is drawn", navs.join() === "today" && !main.querySelector(".path-view"), JSON.stringify(navs));

// ── 1. GET STRONGER ──────────────────────────────────────────────────────
console.log("\nTEST 1 - Get stronger: Where, Which part, How, length, Today's plan");
fixture(); home(); tapDoor("stronger");
ok("1pc. the door hands over to the route (checked in today)", navs.join() === "path" && fakeRouter.pathStart?.door === "stronger", JSON.stringify(navs));
path();
ok("1a. it opens at Where are you?, step 1 of 3, and the hand-off is read once", step() === "where" && h1() === "Where are you?" && main.querySelector('.path-stepbar[aria-label="Step 1 of 3"]') && fakeRouter.pathStart === null);
ok("1b. Home, Gym, Outside, each with what it means", rowText().join("|") === "Home|Gym|Outside" && rows().every(r => txt(r.querySelector(".path-door__d"))));
tapRow("home");
ok("1c. Which part of you? Whole body, Upper, Lower, Core", step() === "area" && h1() === "Which part of you?" && rowText().join("|") === "Whole body|Upper body|Lower body|Core");
tapRow("upper");
ok("1d. How would you like it? Build it for me (set apart) and Build my own; no Saved sessions with none kept; no ready-made routine yet (no content)",
   step() === "how" && rowText().join("|") === "Build it for me|Build my own" && main.querySelector('.path-row[data-v="coach"]').classList.contains("is-tint"), rowText().join("|"));
const upperBtn = () => main.querySelector('.path-row[data-v="upper"]');
click(main.querySelector("#path-back"));
ok("1e. Back: one step, and focus on what opened it", step() === "area" && document.activeElement === upperBtn(), document.activeElement?.outerHTML?.slice(0, 80));
tapRow("upper"); tapRow("coach");
ok("1f. How long have you got? 10 to 50 minutes, as radios", step() === "buildlen" && [...main.querySelectorAll('input[name="blen"]')].map(i => i.value).join() === "micro,quick,short,standard,long" && !!main.querySelector("fieldset.path-seg legend"));
pick(main.querySelector('input[name="blen"][value="quick"]')); navs = [];
click(main.querySelector("#path-build"));
ok("1g. Build my session: Today's plan, for an upper session at home, 20 minutes today", navs.join() === "coach-proposal" && store.get("requestedSessionType") === "upper" && store.get("requestedLocation") === "home" && todaysLengthCat() === "quick",
   `${JSON.stringify(navs)} ${store.get("requestedSessionType")} ${store.get("requestedLocation")} ${todaysLengthCat()}`);

// ── 2. KEEP MOVING ───────────────────────────────────────────────────────
console.log("\nTEST 2 - Keep moving; Build my own");
fixture(); fakeRouter.pathStart = { door: "moving" }; path();
tapRow("gym"); tapRow("whole"); tapRow("coach"); navs = []; click(main.querySelector("#path-build"));
ok("2a. the whole body at the gym is a cardio session at the gym (D4)", store.get("requestedSessionType") === "cardio" && store.get("requestedLocation") === "gym" && navs.join() === "coach-proposal");
for (const [door, part, kind, wantPart] of [["moving", "whole", "cardio", "full"], ["stronger", "lower", "strength", "lower"], ["stronger", "core", "core", "full"]]) {
  fixture(); fakeRouter.pathStart = { door }; path(); tapRow("gym"); tapRow(part); navs = []; tapRow("own");
  const handed = fakeRouter.knowWhatStart;
  main.innerHTML = ""; KnowWhatView(fakeRouter).mount(main);
  ok(`2b. ${door}, ${part}: Build my own opens I know what I want, ${kind} at the gym already chosen, read once`,
     navs.join() === "know-what" && handed?.kind === kind && main.querySelector(`input[name="kind"][value="${kind}"]`)?.checked &&
     (kind !== "strength" || main.querySelector(`input[name="part"][value="${wantPart}"]`)?.checked) && main.querySelector('input[name="place"][value="gym"]')?.checked && fakeRouter.knowWhatStart === null,
     JSON.stringify(handed));
}
fixture(); main.innerHTML = ""; KnowWhatView(fakeRouter).mount(main);
ok("2c. opened any other way, I know what I want is as it was (nothing chosen)", ![...main.querySelectorAll('input[name="kind"]')].some(i => i.checked));

// ── 3. OUTSIDE ───────────────────────────────────────────────────────────
console.log("\nTEST 3 - Outside");
fixture(); fakeRouter.pathStart = { door: "stronger" }; path(); tapRow("outside");
ok("3a. What are you doing? Step 2 of 3, six activities", step() === "activity" && rows().length === 6 && !!main.querySelector('.path-stepbar[aria-label="Step 2 of 3"]'), rowText().join("|"));
ok("3b. never the gym, never yoga", !/gym|yoga/i.test(txt(main.querySelector(".path-list"))), txt(main.querySelector(".path-list")));
tapRow("run");
ok("3c. Enjoy your run, and one way on: Log it", h1() === "Enjoy your run" && rowText().join() === "Log it");
navs = []; tapRow("log");
ok("3d. Log it opens Log what I did", navs.join() === "activity-log");
fixture(); fakeRouter.pathStart = { door: "moving" }; path(); tapRow("outside");
ok("3e. the same from Keep moving", !/gym|yoga/i.test(txt(main.querySelector(".path-list"))) && rows().length === 6);

// ── 4. STRETCH ───────────────────────────────────────────────────────────
console.log("\nTEST 4 - Stretch never asks Where");
fixture(); home(); tapDoor("stretch"); path(); steps.length = 0; seen();
ok("4a. it opens at Where do you want to stretch? Four areas, step 1 of 2", step() === "sarea" && h1() === "Where do you want to stretch?" && rowText().join("|") === "Whole body|Neck and shoulders|Back and hips|Legs" && !!main.querySelector('.path-stepbar[aria-label="Step 1 of 2"]'));
tapRow("legs"); seen();
const legs = ROUTINES.filter(r => r.area === "legs");
ok("4b. Legs: its routines, A fresh one for me, and Can you get down to the floor today?", step() === "routines" && legs.every(r => rowText().includes(r.name)) && rowText().includes("A fresh one for me") &&
   txt(main.querySelector(".path-seg legend")) === "Can you get down to the floor today?", rowText().join("|"));
pick(main.querySelector('input[name="floor"][value="no"]')); await wait(60);
const noFloor = ROUTINES.filter(r => r.area === "legs" && (r.floor === false || r.withoutFloor));
ok("4c. Not today: only routines without the floor (or with their own swap), no fresh one, and it is said", rowText().join("|") === noFloor.map(r => r.name).join("|") && !rowText().includes("A fresh one for me") &&
   /without the floor/.test(txt(main.querySelector("#path-live"))) && document.activeElement?.value === "no", rowText().join("|"));
fixture(); fakeRouter.pathStart = { door: "stretch" }; path(); tapRow("whole"); pick(main.querySelector('input[name="floor"][value="no"]')); tapRow("wb1"); seen();
const shown = [...main.querySelectorAll(".path-mv__nm")].map(txt).join("|");
ok("4d. a routine with its own swap, without the floor: the swap is in, the floor moves are out", /Seated Spinal Decompression|seated/i.test(shown) && !/Child.s Pose|Cat.Cow/i.test(shown), shown);
navs = []; click(main.querySelector("#path-start"));
const gs = store.get("generatedSession")?.session;
ok("4e. Start: the one player, the routine's movements in order, each for its minutes", navs.join() === "workout" && gs?.exercises?.length && gs.door === "stretch" &&
   gs.exercises.every(e => e.duration > 0 && e.reps === null) && store.get("usingGeneratedSession") === true, JSON.stringify(gs?.exercises?.map(e => [e.id, e.duration])));
fixture(); fakeRouter.pathStart = { door: "stretch" }; path(); tapRow("legs"); navs = []; tapRow("fresh");
ok("4f. A fresh one for me: the builder's stretch for the legs' zones", navs.join() === "coach-proposal" && store.get("requestedSessionType") === "stretch" && JSON.stringify(store.get("sessionZoneFocus")) === '["hamstrings","quads","calves-ankles"]',
   JSON.stringify(store.get("sessionZoneFocus")));
ok("4g. across the route, no step asked Where, a part or How", steps.every(s => !["where", "area", "how"].includes(s.step)), JSON.stringify(steps));

// ── 5. MOVE TO FEEL BETTER ───────────────────────────────────────────────
console.log("\nTEST 5 - Move to feel better never asks Where, a part or How");
fixture({ checkin: { energy: 6, mood: 3 } }); home(); tapDoor("feel"); path(); steps.length = 0; seen();
ok("5a. How are you feeling? Five feelings, Surprise me; the coach's suggestion set apart, in their word", step() === "feel" && h1() === "How are you feeling?" &&
   rowText().slice(0, 5).map(t => t.replace(/ Suggested$/, "")).join("|") === "Grounded|Calmer|Worn out|Wake up|Ready for sleep" && rowText().includes("Surprise me") &&
   main.querySelector('.path-row[data-v="calm"]').classList.contains("is-tint") && /Suggested/.test(txt(main.querySelector('.path-row[data-v="calm"]'))) &&
   /You said you.re feeling low\./.test(txt(main.querySelector('.path-row[data-v="calm"]'))) && !rowText().includes("Help me choose"), rowText().join("|"));
fixture({ checkin: null }); fakeRouter.pathStart = { door: "feel" }; path();
ok("5b. no check-in: nothing suggested, and Help me choose is there", !main.querySelector(".path-badge") && rowText().includes("Help me choose"));
tapRow("help");
ok("5c. Help me choose asks one question, about energy", h1() === "How’s your energy?" && rowText().join("|") === "Running on empty|Low|Okay|Good|Full of it");
tapRow("2");
ok("5d. and comes back with a suggestion from the energy alone, said", step() === "feel" && main.querySelector('.path-row[data-v="worn"]')?.classList.contains("is-tint") && /You said you.re running on empty/.test(txt(main.querySelector('.path-row[data-v="worn"]'))));
fixture(); fakeRouter.pathStart = { door: "feel" }; path(); steps.length = 0; seen();
tapRow("calm"); seen();
const calm = PROGRAMMES.filter(p => p.feeling === "calm");
ok("5e. its programmes, step 2 of 2, each with length, style and position; and A fresh one for me", step() === "progs" && calm.every(p => rowText().some(t => t.startsWith(p.name))) &&
   rowText().includes("A fresh one for me") && !!main.querySelector('.path-stepbar[aria-label="Step 2 of 2"]') && txt(main.querySelector(".path-seg legend")) === "How long have you got?", rowText().join("|"));
pick(main.querySelector('input[name="flen"][value="10"]')); await wait(60);
const marked = main.querySelector(".path-row.is-tint");
const want10 = calm.filter(p => p.minutes <= 10).sort((a, b) => b.minutes - a.minutes)[0];
ok("5f. How long have you got? 10: the longest that fits is marked For today, with why, and it is said", !!marked && marked.dataset.v === want10?.id && /For today/.test(txt(marked)) && /Fits the 10 minutes you have/.test(txt(marked)) &&
   /^Marked /.test(txt(main.querySelector("#path-live"))), txt(marked));
tapRow(want10.id); seen();
const mvs = [...main.querySelectorAll(".path-mv")];
ok("5g. the programme: its name, every movement in order with its minutes and a video search that says it opens YouTube", h1() === want10.name && mvs.length === want10.steps.length &&
   mvs.every((m, i) => txt(m.querySelector(".path-mv__nm")).startsWith(`${i + 1}. `)) &&
   mvs.every(m => { const a = m.querySelector("a.path-mv__yt"); return a && a.target === "_blank" && /youtube\.com\/results/.test(a.href) && /opens YouTube/.test(txt(a)); }));
const startFirst = main.querySelector("#path-start")?.compareDocumentPosition(main.querySelector(".path-mvs")) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING;
ok("5g2. Start comes before the list of movements, so it is reached without scrolling past them", !!startFirst);
navs = []; click(main.querySelector("#path-start"));
const gf = store.get("generatedSession")?.session;
ok("5h. Start: the one player, in order, each movement for its minutes (the total is the programme's)", navs.join() === "workout" && gf?.door === "feel" && gf.feeling === "calm" &&
   gf.exercises.map(e => e.id).join() === want10.steps.map(s => s.id).join() && gf.exercises.reduce((n, e) => n + e.duration, 0) === want10.minutes * 60,
   JSON.stringify(gf?.exercises?.map(e => [e.id, e.duration])));
ok("5i. across the route, no step asked Where, a part or How", steps.every(s => !["where", "area", "how"].includes(s.step)), JSON.stringify(steps));
fixture(); fakeRouter.pathStart = { door: "feel" }; path(); tapRow("ground"); tapRow("fresh");
const freshOk = step() === "prog" && (h1() === "A fresh one for me" || /There isn.t enough for a fresh one here yet/.test(txt(main)));
ok("5j. A fresh one for me: a new sequence (arrive, middle, settle), or the nearest programme and why", freshOk && main.querySelectorAll(".path-mv").length >= 3, h1());
fixture(); fakeRouter.pathStart = { door: "feel" }; path(); tapRow("surprise");
ok("5k. Surprise me: a programme, said as a surprise that fits today", step() === "prog" && /A surprise that fits today\./.test(txt(main)) && PROGRAMMES.some(p => p.name === h1()));

// ── 6. THE COACH'S CHOICE ────────────────────────────────────────────────
console.log("\nTEST 6 - the coach's Move to feel better choice");
fixture({ checkin: { energy: 6, mood: 3 } }); home(); navs = [];
click(main.querySelector('.path-coach[data-action="path-coach"]'));
const handed6 = { ...fakeRouter.pathStart };
ok("6pc. Let me choose for you hands a feeling and a programme to the route", navs.join() === "path" && handed6.door === "feel" && handed6.feeling === "calm" && !!handed6.programmeId, JSON.stringify(handed6));
path();
const p6 = PROGRAMMES.find(p => p.id === handed6.programmeId);
ok("6a. its programme opens, with the reason in their word", step() === "prog" && h1() === p6.name && /You said you.re feeling low, so this is slow and steady\./.test(txt(main.querySelector(".path-coachline"))), txt(main).slice(0, 200));
ok("6b. a low-mood day: Wellbeing is offered, and opens Wellbeing", !!main.querySelector("#path-wellbeing") && (navs = [], click(main.querySelector("#path-wellbeing")), navs.join() === "noticing"));
fixture({ checkin: { energy: 6, mood: 3 } }); fakeRouter.pathStart = handed6; path(); navs = [];
click(main.querySelector("#path-redo"));
ok("6c. Change my check-in: the check-in, then straight on to the coach's choice", navs.join() === "checkin" && store.get("pendingDoorRoute") === "today" && fakeRouter.pathStart?.coach === true);
fixture({ checkin: { energy: 6, mood: 3 } }); fakeRouter.pathStart = handed6; path();
click(main.querySelector("#path-back"));
ok("6d. Back: that feeling's programmes, the programme marked For today", step() === "progs" && main.querySelector(".path-row.is-tint")?.dataset.v === p6.id && /For today/.test(txt(main.querySelector(".path-row.is-tint"))));
fixture({ checkin: { energy: 2, mood: 6 } }); home(); navs = []; click(main.querySelector('.path-coach[data-action="path-coach"]')); path();
ok("6e. CONTROL: running on empty, mood okay: the worn-out programme, no Wellbeing offer", step() === "prog" && /running on empty/.test(txt(main)) && !main.querySelector("#path-wellbeing"), txt(main).slice(0, 160));
fixture({ checkin: { energy: 6, mood: 6 } }); fakeRouter.pathStart = { door: "feel" }; path(); tapRow("calm"); tapRow(calm[0].id);
ok("6f. CONTROL: a programme chosen by the person: no reason line, no Change my check-in", !main.querySelector("#path-redo") && !main.querySelector(".path-coachline") && !main.querySelector("#path-wellbeing"));

// ── 7. BACK WITH NO HAND-OFF ─────────────────────────────────────────────
console.log("\nTEST 7 - back to the route with no hand-off");
fixture(); fakeRouter.pathStart = { door: "stretch" }; path(); tapRow("legs");
fakeRouter.pathStart = null; navs = []; path();
ok("7a. the last door's first step, not where it was", step() === "sarea" && navs.length === 0);

// ── 8. SAVED SESSIONS FROM A DOOR ────────────────────────────────────────
console.log("\nTEST 8 - Saved sessions, for the door they were opened from");
const rec = (id, name, purpose) => ({ id, name, sessionType: "stretch", doses: {}, durationMins: 15, equipment: [], exerciseIds: ["childs-pose"], createdAt: new Date().toISOString(), lastUsedAt: null, ...(purpose ? { purpose } : {}) });
const three = [rec("s1", "Legs stretch", "stretch"), rec("s2", "Upper strength", "stronger"), rec("s3", "Old one", null)];
fixture({ saved: three }); fakeRouter.pathStart = { door: "stretch" }; path(); tapRow("legs");
ok("8a. Stretch's routines offer Saved sessions when any fit, with how many", rowText().includes("Saved sessions") && /2 kept/.test(txt(main.querySelector('.path-row[data-v="saved"]'))));
navs = []; tapRow("saved");
ok("8b. it opens Saved sessions for Stretch", navs.join() === "saved-sessions" && fakeRouter.savedStart?.purpose === "stretch");
realRouter.savedStart = fakeRouter.savedStart;   // in the app the view is handed this same router; saved-sessions imports it
main.innerHTML = SAVED.render(); SAVED.onMount();
const names = () => [...main.querySelectorAll("[data-saved-id]")].map(b => b.dataset.savedId).sort().join();
ok("8c. Stretch's and the one kept before doors; not Get stronger's; Show all", names() === "s1,s3" && !!main.querySelector("[data-own-all]") && realRouter.savedStart === null, names());
click(main.querySelector("[data-own-all]"));
ok("8d. Show all shows all three", names() === "s1,s2,s3");
SAVED.onUnmount(); main.innerHTML = SAVED.render(); SAVED.onMount();
ok("8e. opened any other way: all of them, as it was", names() === "s1,s2,s3" && !main.querySelector("[data-own-all]"));
SAVED.onUnmount();

// ── 9. TODAY'S PLAN ON THE PLAN ──────────────────────────────────────────
console.log("\nTEST 9 - Today's plan: the reason, every true adjustment, Change my check-in");
fixture({ checkin: { energy: 6, mood: 3 }, sore: { "lower-back": 3 } });
store.set("requestedSessionType", "full");
fakeRouter.planReason = "It's the next step on what you're working towards.";
main.innerHTML = ""; CoachProposalView(fakeRouter).mount(main); await wait(50);
const sent = txt(main.querySelector(".cp-plan__sentence"));
ok("9a. the coach's reason starts the plan's own sentence, read once", sent.startsWith("It's the next step on what you're working towards. ") && fakeRouter.planReason === null, sent.slice(0, 120));
const adjList = [...main.querySelectorAll(".cp-adjusted__list li")].map(txt);
ok("9b. What I've adjusted: lines the app does now; never one it does not (no countdown timers, a halfway check)",
   adjList.includes("Easier options pointed out where something might niggle") && !adjList.some(l => /countdown|halfway/.test(l)), JSON.stringify(adjList));
navs = []; click(main.querySelector("#cp-redo-checkin"));
ok("9c. Change my check-in: the check-in, back to this plan, with its kind and place kept", navs.at(-1) === "checkin" && store.get("pendingDoorRoute") === "coach-proposal" && fakeRouter.planKeep?.type === "full", JSON.stringify(fakeRouter.planKeep));
store.set("requestedSessionType", null);
main.innerHTML = ""; CoachProposalView(fakeRouter).mount(main); await wait(50);
ok("9d. and the plan it comes back to is the same kind, read once", store.get("requestedSessionType") === "full" && fakeRouter.planKeep === null);
fixture({ tier: "free", checkin: { energy: 6, mood: 3 } });
fakeRouter.planReason = "It's the next step on what you're working towards.";
main.innerHTML = ""; CoachProposalView(fakeRouter).mount(main); await wait(50);
ok("9e. Free: no reason added, no adjustments block, no Change my check-in", !main.querySelector(".cp-adjusted") && !txt(main.querySelector(".cp-plan__sentence")).startsWith("It's the next step"));

// ── 10. PART G ───────────────────────────────────────────────────────────
console.log("\nTEST 10 - every step: one h1, focused; choices as radios with a legend");
const g = [];
for (const [door, taps] of [["stronger", ["home", "upper", "coach"]], ["moving", ["outside", "walk"]], ["stretch", ["back-hips", ROUTINES.find(r => r.area === "back-hips").id]], ["feel", ["sleep", PROGRAMMES.find(p => p.feeling === "sleep").id]]]) {
  fixture(); fakeRouter.pathStart = { door }; path();
  const check = () => g.push({ door, step: step(), h1s: main.querySelectorAll("h1").length, focused: document.activeElement === main.querySelector("h1"),
    radiosOk: [...main.querySelectorAll('input[type="radio"]')].every(r => r.closest("fieldset")?.querySelector("legend")) });
  check(); for (const t of taps) { tapRow(t); check(); }
}
ok("10a. every step has exactly one h1, and focus is on it", g.every(s => s.h1s === 1 && s.focused), JSON.stringify(g.filter(s => !(s.h1s === 1 && s.focused))));
ok("10b. every choice of one is a radio in a fieldset with a legend", g.every(s => s.radiosOk));
ok("10c. Back appears only once there is somewhere to go back to", (fixture(), fakeRouter.pathStart = { door: "feel" }, path(), !main.querySelector("#path-back")) && (tapRow("calm"), !!main.querySelector("#path-back")));

try { view?.onUnmount?.(); } catch {}
console.log(`\n${"=".repeat(60)}\nVERIFY-PATH-ROUTES: ${passes} passed, ${fails} failed\n${"=".repeat(60)}`);
process.exit(fails ? 1 : 0);
