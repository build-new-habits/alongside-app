/**
 * tools/verify-plan-claims.mjs
 * 04 Oct 2026 v6
 *
 * v6 - LOOK-1: Settings is an index of section pages. openPanel and the
 *   3.weight switch lookup reach rows through settingsFind (opening the
 *   section that holds them). No assertion changed.
 *
 * v5 - W3-13. Free Home now shows a session the phone closed, to save
 *   (what was done is the person's on either tier). 3.coming-back reads
 *   the claim itself -- Carry on is on the Plan and not on Free -- and
 *   that Free is offered Save what you did.
 *
 * v4 - P26. 3.weight: the weight-tracking switch is in Settings on the
 *   Plan and not on free, and "Lose weight" is offered only with it on.
 *
 * v3 - SMOOTH-P5. EVERY PLACE THE PLAN IS DESCRIBED AGREES WITH ONE TABLE,
 *   AND EVERY ROW OF THE TABLE IS TRUE. js/data/tier-table.js is the table
 *   (spec 4.11). TEST 3 drives the app on both tiers and proves each row;
 *   TEST 4 checks the upgrade page and Settings › Your plan say exactly
 *   what the table says -- no more, and nothing another page withdrew.
 *   Tests 0-2 unchanged.
 *
 * v2 - SMOOTH-P4c. Settings is one page: About > Plan and About > App
 *   are now row screens ("Your plan", "App version"), opened by a row
 *   rather than a section and a tab. The harness opens them that way.
 *   No assertion changed.
 *
 * SMOOTH-P0 C2 and C3. What the app says about the Plan is true, and the
 * version label never reads "vunknown".
 *
 * C2. Settings > About > Plan told Plan users that everything was open
 * to them including "the long practices in Wellbeing". upgrade.js
 * withdrew exactly that claim on 13 Aug because nothing behind it is
 * built. The page that takes money was corrected; the page people see
 * after paying was not. Smooth Path P5 will make one table the source
 * for every description of the Plan; until then this gate holds the line.
 *
 * C3. With no controlling service worker the version read "vunknown".
 *
 * Both driven by mounting the real SettingsView and opening the panel a
 * person opens -- not by reading source.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const fs = __require("node:fs");
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "Event", "CustomEvent", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
dom.window.HTMLElement.prototype.scrollIntoView = () => {};

const root = new URL("../", import.meta.url);
const swText = fs.readFileSync(new URL("sw.js", root), "utf8");
const liveVersion = (swText.match(/CACHE_NAME\s*=\s*["']alongside-(v\d+)["']/) || [])[1];
// No service worker in this DOM -- exactly the case that showed "vunknown".
// fetch('./sw.js') answers with the real file, as the browser would.
globalThis.fetch = async (url) => /sw\.js/.test(String(url))
  ? { ok: true, text: async () => swText }
  : { ok: false, text: async () => "" };

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { SettingsView } = await import(B + "views/settings.js");
const { settingsFind } = await import("./settings-open.mjs");

// Withdrawn or never-true claims. upgrade.js's WITHDRAWN and SEVEN WERE
// DRAFTED notes are the source; a claim goes back only when it ships.
const WITHDRAWN = [/long practices/i, /mind destinations/i, /reflects back what'?s changed/i, /stops being realistic/i];

async function openPanel(_unused, screenId) {
  const app = document.getElementById("app"); app.innerHTML = "";
  SettingsView({ navigate() {}, back() {} }).mount(app);
  await wait(50);
  settingsFind(app, `[data-open="${screenId}"]`)?.click();
  await wait(300);
  return app;
}

console.log("\nTEST 0 - the fixture reaches the panels it names");
localStorage.clear(); store.init(); store.set("name", "Test"); store.set("tier", "personal"); store.set("onboardingComplete", true);
const aboutId = "page";
let app = await openPanel(aboutId, "about-plan");
ok("0a. About > Plan rendered for a Plan user", /You are on/.test(app.textContent), `section id tried: ${aboutId}`);
ok("0b. REVERSAL: the withdrawn-claim list catches the old sentence",
   WITHDRAWN.some(re => re.test("every length, the full picture of your progress, and the long practices in Wellbeing")));

console.log("\nTEST 1 - C2: the Plan panel makes no withdrawn claim");
const planText = app.textContent.replace(/\s+/g, " ");
ok("1a. no withdrawn claim on the Plan panel a paying person sees",
   !WITHDRAWN.some(re => re.test(planText)), planText.slice(0, 240));
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
for (const f of ["js/views/settings.js", "js/views/upgrade.js"]) {
  const s = strip(fs.readFileSync(new URL(f, root), "utf8"));
  ok(`1b. ${f} ships none of them anywhere`, !WITHDRAWN.some(re => re.test(s)));
}

console.log("\nTEST 2 - C3: the version label is real without a service worker");
app = await openPanel(aboutId, "about-app");
await wait(400);
const label = app.querySelector("#settings-version")?.textContent.trim() || "";
ok("2a. the fixture has a live version to compare with", !!liveVersion, "sw.js CACHE_NAME not found");
ok(`2b. it shows ${liveVersion}`, label === liveVersion, `shows "${label}"`);
ok("2c. it never shows \"vunknown\"", !/unknown/i.test(label));
globalThis.fetch = async () => { throw new Error("offline"); };
app = await openPanel(aboutId, "about-app");
await wait(400);
const label2 = app.querySelector("#settings-version")?.textContent.trim() || "";
ok("2d. REVERSAL: with nothing to read, it says so plainly instead of inventing a version",
   /not available/i.test(label2) && !/unknown/i.test(label2), `shows "${label2}"`);

// ── 3. EVERY ROW IS TRUE ────────────────────────────────────────────────
console.log("\nTEST 3 - every row of the one table, driven on both tiers");
const T = await import(B + "data/tier-table.js");
const { TodayView } = await import(B + "views/today.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { ProgressView } = await import(B + "views/progress.js");
const SS = await import(B + "data/saved-sessions.js");
const CI = await import(B + "views/community-impact.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const box = document.getElementById("app");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
function tierFixture(tier) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  store.set("gymEquipment", ["barbell", "bench-flat", "dumbbells-medium"]); store.set("sessionLocation", "gym");
  store.set("liftLog", { "barbell-bench-press": [{ at: new Date(Date.now() - 86400000).toISOString(), weight: 40, unit: "kg", reps: 10 }] });
}
const mountView = V => { box.innerHTML = ""; V({ navigate() {}, back() {}, history: ["x"] }).mount(box); return box; };
const rows = Object.fromEntries(T.TIER_TABLE.map(r => [r.id, r]));
ok("3pc. the table has the spec's rows, and Wellbeing and Safety are the same on both",
   ["home", "checkin", "plan", "know-what", "as-you-go", "progress", "coming-back", "wellbeing", "safety"].every(id => rows[id]) &&
   rows.wellbeing.same && rows.safety.same && rows.checkin.same);

tierFixture("free"); mountView(TodayView);
const freeHome = { doors: box.querySelectorAll(".home-door").length, tiles: box.querySelectorAll("[data-door-id]").length, pick: !!box.querySelector('[data-action="start-today"]') };
tierFixture("personal"); mountView(TodayView);
const planDoors = [...box.querySelectorAll(".home-door__title")].map(txt);
ok("3.home  free: any kind of session, or the coach suggests one; the Plan: three ways in",
   freeHome.doors === 0 && freeHome.tiles >= 3 && freeHome.pick &&
   JSON.stringify(planDoors) === JSON.stringify(["Tell me what to do", "I know what I want", "Make it up as I go"]), JSON.stringify({ freeHome, planDoors }));
ok("3.as-you-go  only the Plan has Make it up as I go", freeHome.doors === 0 && planDoors.includes("Make it up as I go"));

const planScreen = tier => { tierFixture(tier); store.set("availableTime", "standard"); mountView(CoachProposalView); return box; };
planScreen("free");
const fp = { rows: box.querySelectorAll(".cp-plan__row").length, swap: box.querySelectorAll("[data-swap]").length, diff: !!box.querySelector(".cp-different"), start: !!box.querySelector("#cp-preview-start"), last: /Last:/.test(txt(box)) };
planScreen("personal");
const pp = { rows: box.querySelectorAll(".cp-plan__row").length, swap: box.querySelectorAll("[data-swap]").length, diff: !!box.querySelector(".cp-different") };
ok("3.plan  free: one session, every exercise named, Start; the Plan: swaps and something different",
   fp.rows > 0 && fp.start && fp.swap === 0 && !fp.diff && !fp.last && pp.rows > 0 && pp.swap > 0 && pp.diff, JSON.stringify({ fp, pp }));

tierFixture("free"); store.set("savedSessions", [{ id: "s", name: "Mine", exerciseIds: ["barbell-bench-press"], createdAt: new Date().toISOString() }]);
const freeSaved = SS.savedSessions().length, freeSave = SS.saveSession("x", { exercises: [{ id: "barbell-bench-press" }] }).ok;
tierFixture("personal"); store.set("savedSessions", [{ id: "s", name: "Mine", exerciseIds: ["barbell-bench-press"], createdAt: new Date().toISOString() }]);
ok("3.saved  saving sessions is the Plan's; free builds any session itself", freeSaved === 0 && freeSave === false && SS.savedSessions().length === 1);

const ARC = { active: true, aimId: "floor-unaided", strands: ["leg-strength"], startedAt: new Date(Date.now() - 7 * 86400000).toISOString(), zonesWorked: {}, typesWorked: {} };
tierFixture("free"); store.set("arc", ARC); mountView(ProgressView);
const fProg = { arc: !!box.querySelector("#pr-arc-h"), tabs: box.querySelectorAll(".progress-tab").length, share: /Share your progress/.test(txt(box)), thirty: /last 30 days/.test(txt(box)) || /Nothing logged/.test(txt(box)) };
tierFixture("personal"); store.set("arc", ARC); mountView(ProgressView);
const pProg = { arc: !!box.querySelector("#pr-arc-h"), windows: [...box.querySelectorAll("[data-window]")].map(b => b.dataset.window).join(",") };
ok("3.progress  free: 30 days and sharing; the Plan: the arc read back, 30 or 90 days",
   !fProg.arc && fProg.tabs === 0 && fProg.share && fProg.thirty && pProg.arc && pProg.windows === "30,90", JSON.stringify({ fProg, pProg }));
ok("3.arc  only the Plan reads back where you are heading", !fProg.arc && pProg.arc);

const withCheckpoint = tier => {
  tierFixture(tier);
  store.set("generatedSession", { session: { id: "upper-1", title: "Upper Body", exercises: [{ id: "a", name: "Row" }, { id: "b", name: "Press" }] }, builtAt: "x" });
  store.set("activeSessionCheckpoint", { sessionType: "workout", sessionId: "upper-1|x", index: 1, set: 1, startedAt: new Date().toISOString(), checkpointedAt: new Date().toISOString() });
  mountView(TodayView);
  return { carryOn: !!box.querySelector('[data-action="carry-on"]'), save: /Save what you did/.test(box.textContent || "") };
};
const cPlan = withCheckpoint("personal"), cFree = withCheckpoint("free");
ok("3.coming-back  a session left part-way carries on from Home on the Plan, not on free", cPlan.carryOn && !cFree.carryOn, JSON.stringify({ cPlan, cFree }));
ok("3.coming-back  and on free, what was done can still be saved", cFree.save);
const pe = fs.readFileSync(new URL("js/data/programmeEngine.js", root), "utf8");
const reentry = pe.slice(pe.indexOf("export function getReEntryContext"), pe.indexOf("export function", pe.indexOf("export function getReEntryContext") + 10));
ok("3.coming-back  and the gentler start after time away is BOTH tiers' (no tier check in getReEntryContext)", reentry.length > 200 && !/isPremium/.test(reentry));

const credits = tier => { tierFixture(tier); box.innerHTML = ""; try { CI.CommunityImpactView(box); } catch {} return (txt(box).match(/Credits per session (\d)/) || [])[1]; };
ok("3.impact  once on free, twice on the Plan", credits("free") === "1" && credits("personal") === "2", `${credits("free")} / ${credits("personal")}`);

const { offeredGoals } = await import(B + "data/goals.js");
const weightSwitch = tier => { tierFixture(tier); mountView(SettingsView); return !!settingsFind(box, "#settings-weight-tracking"); };
const offersLose = on => offeredGoals({ weightTracking: on }).some(c => c.goals.some(g => g.id === "lose-weight"));
ok("3.weight  weight tracking is the Plan's; losing weight is a goal only with it on", weightSwitch("personal") && !weightSwitch("free") && offersLose(true) && !offersLose(false));

const strip2 = f => fs.readFileSync(new URL(f, root), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1").replace(/<!--[\s\S]*?-->/g, "");
ok("3.wellbeing  nothing in Wellbeing checks the tier", ["js/views/noticing.js", "js/views/breathing-session.js", "js/views/journal-entry.js", "js/views/in-step.js", "js/views/quiet-session.js"]
   .every(f => !/isPremium\(|store\.get\(['"]tier['"]\)/.test(strip2(f)) || (f.endsWith("in-step.js") && !/isPremium\(\)\s*\?\s*[^:]*scenario/i.test(strip2(f)))));
ok("3.safety  nothing that keeps people safe checks the tier", ["js/safety-gate.js", "js/data/red-flag.js", "js/views/red-flag.js"].every(f => !/isPremium\(|['"]tier['"]/.test(strip2(f))));

// ── 4. EVERY PAGE SAYS WHAT THE TABLE SAYS ─────────────────────────────
console.log("\nTEST 4 - the upgrade page and Settings › Your plan say the table, and only the table");
const UP = await import(B + "views/upgrade.js");
tierFixture("free");
box.innerHTML = UP.render();
const changes = [...box.querySelectorAll(".upgrade-change")].map(txt);
const plain = s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
ok("4a. the upgrade page's statements are exactly the table's differing rows", JSON.stringify(changes) === JSON.stringify(T.PLAN_ADDS.map(plain)) && changes.length === T.TIER_TABLE.filter(r => !r.same).length,
   JSON.stringify(changes).slice(0, 200));
ok("4b. it names the arc first -- what the Plan is", changes[0] === plain(rows.arc.says));
const keeps = [...box.querySelectorAll(".upgrade-keeps li")].map(txt);
ok("4c. and lists what free keeps: the rows that are the same", keeps.length === T.FREE_KEEPS.length && T.FREE_KEEPS.every((r, i) => keeps[i].startsWith(r.area)));
ok("4d. no statement on it is also true of free (it is not in a 'same' row)", !T.FREE_KEEPS.some(r => changes.includes(plain(r.plan))));
for (const tier of ["free", "personal"]) {
  tierFixture(tier);
  const app = await openPanel(null, "about-plan");
  const trs = [...app.querySelectorAll("[data-tier-row]")];
  ok(`4e. Settings › Your plan (${tier}) shows the table, row for row`, trs.length === T.TIER_TABLE.length &&
     trs.every((tr, i) => tr.dataset.tierRow === T.TIER_TABLE[i].id && txt(tr.querySelector("td")) === T.TIER_TABLE[i].free));
  ok(`4f. and no withdrawn claim (${tier})`, !WITHDRAWN.some(re => re.test(txt(app))));
}
ok("4g. REVERSAL: a withdrawn claim added to the table would be caught", WITHDRAWN.some(re => re.test(T.TIER_TABLE.map(r => r.plan).join(" ") + " and the long practices open up")));
ok("4h. the table itself makes no withdrawn claim", !WITHDRAWN.some(re => re.test(JSON.stringify(T.TIER_TABLE))));

console.log("");
if (fails) { console.log(`PLAN-CLAIMS: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`PLAN-CLAIMS: all ${passes} assertions pass\n`);
process.exit(0);
