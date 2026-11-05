import { createRequire as __cr } from "node:module";
/**
 * tools/verify-tidy-trace.mjs
 * 05 Nov 2026 v1
 *
 * P-27 TIDY (Graeme, 05 Nov 2026: "a really thorough look over the app for
 * quality in terms of just tidiness, and purpose"). One gate for the faults
 * the trace found that no other gate holds, each driven through the code the
 * screen uses. Graeme's four decisions (05 Nov, all "Recommended"): retire
 * the twelve-week programme on the Plan; one log picker; the Plan's finish
 * for every player; tidy Settings › Your plan. And two more: sleep "Remove
 * it", My programme "Remove it".
 *
 *   1  The bottom bar: the room left above it is at least its own height.
 *   2  Today's plan from a door: ‹ Back returns to the door's length step,
 *      every choice kept; Not today still goes Home.
 *   3  The coach chose: the plan never says "You asked for".
 *   4  A lighter plan says why, above Keep my usual plan (the Plan); Free's
 *      offer unchanged.
 *   5  The Library: Rest day opens the quiet room's Rest (it reopened the last
 *      finish and overwrote it); Breathing opens Wellbeing's player; Log what
 *      I did opens the logger.
 *   6  Settings: Log what I did (was Activity log, a form); on the Plan one
 *      Goals and activity level row and a page without the programme,
 *      Sessions per week, a second Your week or Your coach. Free unchanged.
 *   7  Every Plan session ends on the Plan's finish (router); an entry a
 *      player left for the old finish is logged there, once.
 *   8  The arc's Start today's session is Home's Let me choose for you.
 *   9  The check-in goes straight on to a waiting Plan door with My exercises
 *      set; Free's choice is kept.
 *  10  The finish names the real Settings path to undo Not again.
 *  11  Every item on the one log picker has its words, a kind and a colour.
 *
 * Red on alongside-v703. Run from the repository root.
 */
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
import { readFileSync } from "node:fs";
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
const ROOT = new URL("..", import.meta.url).pathname;
const { store } = await import(B + "store.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const { PathView } = await import(B + "views/path.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const LIB = await import(B + "views/library.js");
const { SettingsView } = await import(B + "views/settings.js");
const { StretchArcView } = await import(B + "views/stretch-arc.js").catch(() => ({}));
const { router: realRouter } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
let navs = [];
const fakeRouter = { history: [], navigate: v => navs.push(v), back() { navs.push("<back>"); } };
globalThis.window.router = fakeRouter;
Object.defineProperty(globalThis, "router", { value: fakeRouter, configurable: true, writable: true });
const realNavigate = realRouter.navigate.bind(realRouter);
realRouter.navigate = fakeRouter.navigate;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const today = () => new Date().toISOString().split("T")[0];
function fixture(tier = "personal", { checkin = true } = {}) {
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("gymEquipment", ["dumbbells-medium", "bench-flat", "gym-membership"]);
  if (checkin) {
    store.set("checkinHistory", { [today()]: { energy: 6, mood: 6 } });
    store.set("lastCheckin", { ...store.get("lastCheckin"), energy: 6, mood: 6, timestamp: new Date().toISOString() });
  }
  for (const r of [fakeRouter, realRouter]) { r.pathStart = null; r.pathBack = null; r.pathReturn = null; r.planReason = null; r.planDoor = null; }
  navs = [];
}

// ── 1 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 1 - the bottom bar never covers the last card");
{
  const css = readFileSync(`${ROOT}css/components/nav-fix.css`, "utf8");
  const vars = readFileSync(`${ROOT}css/base/variables.css`, "utf8");
  const navH = Number((vars.match(/--nav-height:\s*(\d+)px/) || [])[1]);
  const rule = (strip(css).match(/#main-content,\s*\.main-content\s*\{[^}]*padding-bottom:\s*([^;]+);/) || [])[1] || "";
  const fixed = rule.match(/^calc\((\d+)px/);
  ok("1pc. control: the bar's height is read (72px)", navH === 72, String(navH));
  ok("1a. the room above the bar is the bar's own height plus a gap, not a fixed 64px", /var\(--nav-height/.test(rule) && /var\(--space-|\+\s*\d+px/.test(rule) && !(fixed && Number(fixed[1]) < navH), rule);
}

// ── 2 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 2 - ‹ Back on Today's plan returns to the door, every choice kept");
{
  fixture();
  main.innerHTML = ""; fakeRouter.pathStart = { door: "stronger" };
  let pv = PathView(fakeRouter); pv.mount(main);
  click(main.querySelector('.path-row[data-v="gym"]')); click(main.querySelector('.path-row[data-v="upper"]'));
  click(main.querySelector('.path-row[data-v="coach"]'));
  const blen = main.querySelector('input[name="blen"][value="standard"]');
  if (blen) { blen.checked = true; blen.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }
  navs = []; click(main.querySelector("#path-build"));
  ok("2pc. Build my session opened Today's plan", navs.join() === "coach-proposal", JSON.stringify(navs));
  try { pv.onUnmount?.(); } catch {}
  main.innerHTML = ""; navs = [];
  const cp = CoachProposalView(fakeRouter); cp.mount(main); await wait(60);
  click(main.querySelector("#cp-preview-close"));
  ok("2a. ‹ Back goes to the door's steps, not Home", navs.at(-1) === "path" && !!fakeRouter.pathReturn, JSON.stringify(navs));
  main.innerHTML = ""; pv = PathView(fakeRouter); pv.mount(main);
  ok("2b. and it opens on How long have you got?, at the length chosen", /How long have you got/.test(txt(main)) && main.querySelector('input[name="blen"][value="standard"]')?.checked === true, txt(main).slice(0, 120));
  const back = main.querySelector(".plan-back, .path-back");
  click(back);
  ok("2c. and its own ‹ Back still steps back through the choices (How would you like it?)", /How would you like it/.test(txt(main)), txt(main).slice(0, 100));
  try { pv.onUnmount?.(); } catch {}
  // Not today: still Home.
  fixture();
  main.innerHTML = ""; fakeRouter.pathStart = { door: "stronger" }; pv = PathView(fakeRouter); pv.mount(main);
  click(main.querySelector('.path-row[data-v="gym"]')); click(main.querySelector('.path-row[data-v="upper"]')); click(main.querySelector('.path-row[data-v="coach"]'));
  click(main.querySelector("#path-build")); try { pv.onUnmount?.(); } catch {}
  main.innerHTML = ""; navs = []; CoachProposalView(fakeRouter).mount(main); await wait(60);
  click(main.querySelector("#cp-preview-not-today"));
  ok("2d. Not today still leaves for Home", navs.at(-1) === "today", JSON.stringify(navs));
  // From Home's coach row (no door steps): ‹ Back is Home.
  fixture(); store.set("requestedSessionType", "cardio"); fakeRouter.planReason = "A steady session to keep you moving.";
  main.innerHTML = ""; navs = []; CoachProposalView(fakeRouter).mount(main); await wait(60);
  const sent = txt(main.querySelector(".cp-plan__sentence"));
  click(main.querySelector("#cp-preview-close"));
  ok("2e. from Home's coach row, ‹ Back is Home", navs.at(-1) === "today", JSON.stringify(navs));

  // ── 3 ─────────────────────────────────────────────────────────────────
  console.log("\nTEST 3 - the coach chose: no \"You asked for\"");
  ok("3a. the coach's reason leads", sent.startsWith("A steady session to keep you moving."), sent.slice(0, 120));
  ok("3b. and nobody is said to have asked", !/You asked for/.test(sent), sent);
  fixture(); store.set("requestedSessionType", "cardio");
  main.innerHTML = ""; CoachProposalView(fakeRouter).mount(main); await wait(60);
  ok("3c. control: a request the person made is still said back", /You asked for cardio/.test(txt(main.querySelector(".cp-plan__sentence"))), txt(main.querySelector(".cp-plan__sentence")));
}

// ── 4 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 4 - a lighter plan says why");
{
  const src = strip(readFileSync(`${ROOT}js/views/coach-proposal.js`, "utf8"));
  const body = src.slice(src.indexOf("function _renderLighterOffer"), src.indexOf("function _declineLighter"));
  ok("4a. the offer carries the builder's own lighter-day sentence, on the Plan", /GENTLE_LINES\.busy\(\)/.test(body) && /isPremium\(\)/.test(body) && /cp-offer__text/.test(body));
  const SB = await import(B + "session-builder.js");
  ok("4b. and that sentence says why", /moving a lot lately/.test(SB.GENTLE_LINES.busy()));
}

// ── 5 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 5 - the Library's rows go where they say");
for (const tier of ["personal", "free"]) {
  fixture(tier); main.innerHTML = LIB.render(); LIB.onMount();
  click(main.querySelector('[data-guided="mindful"]'));
  main.innerHTML = LIB.render(); LIB.onMount();
  const row = label => [...main.querySelectorAll("[data-target]")].find(b => new RegExp(`^${label}`).test(txt(b)));
  navs = []; store.set("quietMode", null); click(row("Rest day"));
  ok(`5a. ${tier}: Rest day opens the quiet room's Rest, not the last session's finish`, navs.at(-1) === "quiet-session" && store.get("quietMode") === "rest", `${JSON.stringify(navs)} ${store.get("quietMode")}`);
  main.innerHTML = LIB.render(); LIB.onMount(); click(main.querySelector('[data-guided="mindful"]')); main.innerHTML = LIB.render(); LIB.onMount();
  navs = []; click(row("Breathing"));
  ok(`5b. ${tier}: Breathing opens the breathing player Wellbeing opens`, navs.at(-1) === "breathing-session", JSON.stringify(navs));
  main.innerHTML = LIB.render(); LIB.onMount(); click(main.querySelector("#lib-back-btn")); main.innerHTML = LIB.render(); LIB.onMount();
  navs = []; click(main.querySelector("#lib-log-activity-btn"));
  ok(`5c. ${tier}: Log what I did opens the logger itself`, navs.at(-1) === "activity-log", JSON.stringify(navs));
}

// ── 6 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 6 - Settings");
async function settingsPage(tier, section) {
  fixture(tier); main.innerHTML = ""; SettingsView(fakeRouter).mount(main); await wait(20);
  click(main.querySelector(`[data-section-open="${section}"]`)); await wait(20);
  return main;
}
{
  for (const tier of ["personal", "free"]) {
    const m = await settingsPage(tier, "data");
    const labels = [...m.querySelectorAll(".settings-row__label")].map(txt);
    ok(`6a. ${tier}: Your data says Log what I did, not Activity log`, labels.includes("Log what I did") && !labels.includes("Activity log"), labels.join(" | "));
  }
  let m = await settingsPage("personal", "plan");
  let labels = [...m.querySelectorAll(".settings-row__label")].map(txt);
  ok("6b. Plan: Your plan has Your arc, Your week and one Goals and activity level row", labels.includes("Your week") && labels.includes("Goals and activity level") && labels.filter(l => /^(Goals|Sessions per week|Activity level|Programme)$/.test(l)).length === 0, labels.join(" | "));
  click(m.querySelector('[data-open="programme"]')); await wait(20);
  const page = txt(m);
  ok("6c. Plan: the page is goals and activity level, nothing else", /Your goals/.test(page) && /Activity level/.test(page) &&
     !/Your programme|Choose a programme|Sessions per week|Plan my week|Your coach|won.t be affected until you next review/.test(page), page.slice(0, 240));
  m = await settingsPage("free", "plan");
  labels = [...m.querySelectorAll(".settings-row__label")].map(txt);
  ok("6d. Free unchanged: Goals, Sessions per week, Your week, Activity level, Programme", ["Goals", "Sessions per week", "Your week", "Activity level", "Programme"].every(l => labels.includes(l)), labels.join(" | "));
  click(m.querySelector('[data-open="programme"]')); await wait(20);
  ok("6e. Free unchanged: its page still has the programme, the target and Your coach", /Your programme/.test(txt(m)) && /Sessions per week/.test(txt(m)) && /Your coach/.test(txt(m)));
}

// ── 7 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 7 - every Plan session ends on the Plan's finish");
{
  realRouter.navigate = realNavigate;
  const entry = { id: "run-p27", type: "run", durationMins: 20, completedAt: new Date().toISOString(), status: "complete" };
  fixture("personal"); store.set("activityLog", []); store.set("currentActivityEntry", entry);
  realRouter.history = ["today"];
  await realRouter.navigate("reflect"); await wait(80);
  ok("7a. Plan: a player's way to the old finish lands on the Plan's finish", realRouter.currentView === "plan-finish", realRouter.currentView);
  ok("7b. with How do you feel now? in the open", !!main.querySelector('input[name="pf-mood"]'));
  const log = store.get("activityLog") || [];
  ok("7c. and the run the player left for the old finish to log is logged, once", log.filter(e => e && e.type === "run").length === 1, JSON.stringify(log.map(e => e.type)));
  fixture("free"); store.set("activityLog", []); store.set("currentActivityEntry", { ...entry, id: "run-free" });
  await realRouter.navigate("reflect"); await wait(80);
  ok("7d. Free unchanged: the old finish", realRouter.currentView === "reflect", realRouter.currentView);
  realRouter.navigate = fakeRouter.navigate;
}

// ── 8 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 8 - the arc's Start today's session is Home's coach choice");
{
  const src = strip(readFileSync(`${ROOT}js/views/stretch-arc.js`, "utf8"));
  const h = src.slice(src.indexOf("#sa-today-btn"), src.indexOf("#sa-stretch-btn"));
  ok("8a. it calls startCoachChoice and builds no request of its own", /startCoachChoice\(router\)/.test(h) && !/coach-proposal/.test(h), h.slice(0, 200));
  const PH = await import(B + "views/plan-home.js");
  fixture("personal", { checkin: false }); navs = [];
  PH.startCoachChoice(fakeRouter);
  ok("8b. not checked in: the check-in, which comes back for the coach", navs.at(-1) === "checkin" && store.get("pendingDoorRoute") === "today" && fakeRouter.pathStart?.coach === true, JSON.stringify(navs));
  fixture("personal"); navs = []; store.set("requestedSessionType", "stretch");
  PH.startCoachChoice(fakeRouter);
  ok("8c. checked in: the coach's own kind, never a stale request", navs.at(-1) === "coach-proposal" && store.get("requestedSessionType") !== "stretch" && !!store.get("availableTimeToday")?.cat,
     `${JSON.stringify(navs)} ${store.get("requestedSessionType")}`);
}

// ── 9 ───────────────────────────────────────────────────────────────────
console.log("\nTEST 9 - a waiting Plan door goes straight on");
{
  const src = strip(readFileSync(`${ROOT}js/views/checkin.js`, "utf8"));
  const c = src.slice(src.indexOf("function _continue()"), src.indexOf("function _continue()") + 900);
  ok("9a. with My exercises set, the extra stop is skipped only when a Plan door waits", /pendingTo === "path"/.test(c) && /pathStart\?\.coach/.test(c) && /&& !doorWaiting\) return _showActionButtons\(\)/.test(c), c.slice(0, 300));
  ok("9b. and it never asks the tier (the check-in never does)", !/isPremium|planLook\(\)\s*&&\s*!!store/.test(c));
}

// ── 10 ──────────────────────────────────────────────────────────────────
console.log("\nTEST 10 - the finish names the real place to undo Not again");
{
  const src = readFileSync(`${ROOT}js/views/plan-finish.js`, "utf8");
  ok("10a. Settings › Sessions › Exercises you asked to change", /Settings \\u203a Sessions \\u203a Exercises you asked to change/.test(src) && !/Settings, How you like things/.test(src));
  const SET = readFileSync(`${ROOT}js/views/settings.js`, "utf8");
  ok("10b. control: that row exists in Settings › Sessions", /label: 'Exercises you asked to change'/.test(SET) && /case 'sessions'/.test(SET));
}

// ── 11 ──────────────────────────────────────────────────────────────────
console.log("\nTEST 11 - every item on the one log picker is named, has a kind and a colour");
{
  const AL = readFileSync(`${ROOT}js/views/activity-log.js`, "utf8");
  const block = AL.slice(AL.indexOf("const ACTIVITY_GROUPS = ["), AL.indexOf("];", AL.indexOf("const ACTIVITY_GROUPS = [")));
  const ids = [...block.matchAll(/\{ id: "([a-z-]+)"/g)].map(m => m[1]);
  const LBL = await import(B + "data/activity-labels.js");
  const EV = await import(B + "data/evidence.js");
  const KC = await import(B + "data/kind-colours.js");
  ok("11pc. control: the picker's items were read, the mindful ones among them", ids.length > 20 && ["yoga", "pilates", "stretch", "mindful", "other"].every(i => ids.includes(i)), ids.join(","));
  const unnamed = ids.filter(i => !LBL.ACTIVITY_TYPES.includes(i));
  ok("11a. each has its words (\"you did ...\")", unnamed.length === 0, unnamed.join(", "));
  const undecided = ids.filter(i => !(i in EV.KIND_OF));
  ok("11b. each has a decided kind (or none)", undecided.length === 0, undecided.join(", "));
  const grey = ["pilates", "stretch"].filter(i => KC.kindOf({ type: i }) !== "violet");
  ok("11c. Pilates and stretching are violet, as yoga is", grey.length === 0, grey.join(", "));
}

console.log(`\nVERIFY-TIDY-TRACE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
