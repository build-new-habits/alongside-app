/**
 * tools/verify-shared-polish.mjs
 * 31 Oct 2026 v2
 *
 * v2 - STAGE PATH Session 9 re-point (Graeme, 31 Oct: "‹ Back, Exit in a
 *   session", one word for going back on every Plan screen). 1a: on the
 *   Plan, Today's plan says "‹ Back", still named Back to Home and still
 *   going Home (1d); Free unchanged ("‹ Home"). Nothing loosened: the
 *   Plan's check is now an exact match.
 *
 * 12 Oct 2026 v1
 *
 * A-4 / A-5 / A-7 SHARED-POLISH (Stage AWARD). Graeme, 12 Oct: tidy the
 * screens both tiers share, and keep the difference in what the Plan does
 * ("Cool. I agree then. Do it."). Measured on v658:
 *
 *   Today's plan: an outlined ✕ beside the house, the greeting and
 *     yesterday's line repeated from Home, Where / Length / Focus as three
 *     labelled rows. Now "‹ Home" (named Back to Home), no greeting, the
 *     sore-area line still leading, the three as pills named by their label.
 *   The finish: on the Plan, the arc's strands worked today ("Your arc
 *     today: …", from the arc's own dates, never a count, never on Free);
 *     Keep this one? folded into "Keep to repeat".
 *   Progress before the first session: tabs over zeros. Now "Nothing here
 *     yet", one line, Start today's session.
 *   The bottom bar: emoji. Now line icons, hidden from screen readers, the
 *     buttons and names unchanged.
 *
 * The Plan's difference, held: Swap and Focus on the plan, Keep to repeat
 * and the arc line on the finish, are the Plan's only.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");
const { router: realRouter } = await import(B + "router.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const reflect = await import(B + "views/reflect.js");
const { ProgressView } = await import(B + "views/progress.js");
const { agreed } = await import(new URL("./agreed.mjs", import.meta.url).href);

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
let navs = [];
const rtr = { navigate: v => navs.push(v), back() {}, history: [] };
realRouter.navigate = rtr.navigate;
globalThis.window.router = rtr;
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const today = new Date().toISOString().slice(0, 10);

function fixture(tier, { checkedIn = true, sessions = true } = {}) {
  localStorage.clear(); store.init(); agreed(store); gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("homeEquipment", ["band-light"]); store.set("sessionLocation", "home");
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  if (checkedIn) store.set("checkinHistory", { [today]: { energy: 6, mood: 6, date: new Date().toDateString() } });
  if (sessions) store.set("activityLog", [{ id: "y1", type: "workout", sessionType: "lower", completedAt: new Date(Date.now() - 864e5).toISOString(), date: new Date(Date.now() - 864e5).toISOString(), durationMins: 30, completed: true }]);
  navs = [];
}

// ── 1. TODAY'S PLAN ─────────────────────────────────────────────────────
console.log("\nTEST 1 - Today's plan, both tiers");
for (const tier of ["personal", "free"]) {
  fixture(tier); main.innerHTML = "";
  CoachProposalView(rtr).mount(main);
  const back = main.querySelector("#cp-preview-close");
  // v2: on the Plan the visible word is "‹ Back" (Graeme, 31 Oct, Session 9: one word for going back on every Plan
  // screen); its spoken name still says where it goes. Free keeps "‹ Home".
  ok(`1a-${tier}. ${tier === "free" ? '"‹ Home"' : '"‹ Back"'}, named Back to Home`, (tier === "free" ? /Home/.test(txt(back)) : txt(back) === "‹ Back") && back?.getAttribute("aria-label") === "Back to Home" && !/✕/.test(txt(back)), txt(back));
  ok(`1b-${tier}. no greeting or yesterday's line on the plan`, !main.querySelector("#cp-preview-panel .cp-greeting, #cp-preview-panel .cp-reflection") && !/Morning, Test|Afternoon, Test|Evening, Test/.test(txt(main.querySelector("#cp-preview-panel"))));
  const pills = [...main.querySelectorAll(".cp-assumptions__change")];
  ok(`1c-${tier}. each pill is named by its label and value`, pills.length >= 2 && pills.every(p => /^(Where|Length|Focus): .+\. Change$/.test(p.getAttribute("aria-label") || "")), pills.map(p => p.getAttribute("aria-label")).join(" | "));
  navs = []; click(back);
  ok(`1d-${tier}. Back to Home goes Home`, navs.includes("today"), JSON.stringify(navs));
}
fixture("free"); main.innerHTML = ""; CoachProposalView(rtr).mount(main);
ok("1e. the Plan's difference: no Swap and no Focus on Free", !main.querySelector("[data-swap], #cp-focus"));
fixture("personal"); main.innerHTML = ""; CoachProposalView(rtr).mount(main);
ok("1f. and both on the Plan", !!main.querySelector("[data-swap]") && !!main.querySelector("#cp-focus"));
// A sore area still leads.
fixture("personal");
store.set("conditions", ["knee"]); store.set("conditionPainScores", { knee: 6 });
main.innerHTML = ""; CoachProposalView(rtr).mount(main);
ok("1g. a sore area is still said on the plan, in the person's word", /You said your knee is/.test(txt(main.querySelector("#cp-preview-panel"))), txt(main.querySelector("#cp-preview-panel")).slice(0, 200));

// ── 2. THE FINISH ───────────────────────────────────────────────────────
console.log("\nTEST 2 - the finish");
function finish(tier, worked) {
  fixture(tier);
  store.set("arc", { active: true, aimId: "sport-without-flaring", startedAt: new Date(Date.now() - 9 * 864e5).toISOString(),
                     strands: ["trunk-strength"], typesWorked: worked ? { core: today } : {}, zonesWorked: {} });
  // Worked: a core session (trunk strength takes core). Not worked: lower body.
  const entry = store.logActivity({ type: "workout", sessionType: worked ? "core" : "lower", completedAt: new Date().toISOString(), durationMins: 20, exercisesCount: 4, setsDone: 10, exerciseIds: ["dead-bug"] });
  store.set("currentActivityEntry", entry);
  store.set("lastFinishedSession", { at: new Date().toISOString(), session: { id: "s1", title: "Core", exercises: [{ id: "dead-bug", name: "Dead Bug", section: "main", sets: 3, reps: "8" }] } });
  store.set("generatedSession", { session: { id: "s1", title: "Core", exercises: [{ id: "dead-bug", name: "Dead Bug", section: "main", sets: 3, reps: "8" }] }, builtAt: new Date().toISOString() });
  main.innerHTML = reflect.render(); try { reflect.onMount(); } catch {}
}
finish("personal", true);
const arcLine = main.querySelector(".finish-arc");
ok("2pc. the finish rendered", /That.s today done|Saved what you did/.test(txt(main)), txt(main).slice(0, 80));
ok("2a. the Plan: Your arc today, naming the strand worked today", !!arcLine && /^Your arc today: .+\.$/.test(txt(arcLine)) && !/\d/.test(txt(arcLine)), txt(arcLine));
ok("2b. its icon is decorative", [...(arcLine?.querySelectorAll("svg") || [])].every(s => s.getAttribute("aria-hidden") === "true"));
const keep = main.querySelector("details.finish-keep");
ok("2c. Keep this one? is folded into Keep to repeat", !!keep && (txt(keep.querySelector("summary")) === "Keep to repeat" && !!keep.querySelector("#save-block-btn") && !keep.open));
ok("2d. no Keep this one? block standing open on the screen", !main.querySelector(".finish-view > .save-block, .finish-view > [data-save-block]"));
finish("personal", false);
ok("2e. REVERSAL: nothing worked today, no arc line", !main.querySelector(".finish-arc"));
finish("free", true);
ok("2f. Free: no arc line, no Keep to repeat (the Plan's)", !main.querySelector(".finish-arc, .finish-keep, #save-block-btn"));

// ── 3. PROGRESS BEFORE THE FIRST SESSION ───────────────────────────────
console.log("\nTEST 3 - Progress before the first session, both tiers");
for (const tier of ["personal", "free"]) {
  fixture(tier, { sessions: false, checkedIn: false });
  main.innerHTML = ""; ProgressView(rtr).mount(main);
  ok(`3a-${tier}. a heading, one line, one button; no tabs or charts`, txt(main.querySelector(".pr-empty h2")) === "Nothing here yet" && !!main.querySelector("#pr-empty-start") &&
     !main.querySelector('[role="tablist"], .pr-bar'), txt(main).slice(0, 120));
  ok(`3a2-${tier}. the rows one tap away are still there (Share your progress)`, /Share your progress/.test(txt(main)));
  navs = []; click(main.querySelector("#pr-empty-start"));
  ok(`3b-${tier}. Start today's session: the check-in, then the coach's plan`, navs.at(-1) === "checkin" && store.get("pendingDoorRoute") === "coach-proposal", JSON.stringify(navs));
}
fixture("personal");
main.innerHTML = ""; ProgressView(rtr).mount(main);
ok("3c. REVERSAL: with a session, Progress as before", !main.querySelector(".pr-empty") && !!main.querySelector('[role="tablist"]'));

// ── 4. THE BOTTOM BAR ──────────────────────────────────────────────────
console.log("\nTEST 4 - the bottom bar");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const nav = html.slice(html.indexOf('<nav id="bottom-nav"'), html.indexOf("</nav>", html.indexOf('<nav id="bottom-nav"')));
ok("4a. no emoji in the bar", !/\p{Extended_Pictographic}/u.test(nav.replace(/<!--[\s\S]*?-->/g, "")));
ok("4b. four line icons, each hidden from screen readers", (nav.match(/<span class="nav-icon" aria-hidden="true"><svg/g) || []).length === 4);
ok("4c. the four buttons and their names unchanged", ["Today", "Progress", "Wellbeing", "Settings"].every(n => nav.includes(`aria-label="${n}"`)) && (nav.match(/data-nav="/g) || []).length === 4);

console.log(`\nVERIFY-SHARED-POLISH: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
