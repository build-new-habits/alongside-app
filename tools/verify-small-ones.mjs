/**
 * tools/verify-small-ones.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * P26, SMALLER (persona finding W2-20). Seven small ones, each through
 * the screen it is on:
 *   1. No run door on Free (persona 2.1's main goal).
 *   2. Accepting a strength arc landed on a screen titled "Stretch arc",
 *      showing stretch zones and "Stretch now".
 *   3. The red-flag screen had no way out but answering.
 *   4. The activity log had no gym option.
 *   5. "Lose weight" cannot be chosen on Free (weight tracking is the
 *      Plan's, WEIGHT-1b; the goal needs it, spec section 8), and the Plan
 *      page never said weight tracking was there.
 *   6. A latent "You've moved N days in a row" line -- a streak, which the
 *      product never does -- hidden by a date bug that also switched off
 *      the lighter-day rule it belonged to.
 *   7. "Keep this one?" offered for a session already saved.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div><nav id="bottom-nav"></nav></div><div id="sr-announcer"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "Blob"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.CSS = { escape: s => String(s) };
dom.window.confirm = () => false; globalThis.confirm = () => false;
dom.window.alert = () => {}; globalThis.alert = () => {};

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");
globalThis.window.router = router;
Object.defineProperty(globalThis, "router", { value: router, configurable: true, writable: true });
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const $ = s => main.querySelector(s), $$ = s => [...main.querySelectorAll(s)];
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

function fixture(tier) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("equipment", ["dumbbells", "bench"]); store.set("homeEquipment", ["dumbbells", "bench"]);
  store.set("conditions", []); store.set("conditionPainScores", {});
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  router.history = []; router.currentView = null;
}
async function go(view) { await router.navigate(view); await wait(60); }

// ── 1. RUN ON FREE ──────────────────────────────────────────────────────
console.log("\nTEST 1 - Free Home has a door to running");
fixture("free");
await go("today");
{
  const group = main.querySelector('[aria-labelledby="today-group-body"]');
  const door = group && [...group.querySelectorAll("button")].find(b => /\bRun\b/.test(txt(b)));
  ok("1a. a Run door among \"Move your body\"", !!door, group ? [...group.querySelectorAll("button")].map(txt).join(" | ") : "");
  click(door); await wait(150);
  ok("1b. it opens a run, not the upgrade page", router.currentView === "running-session" || (router.currentView === "red-flag"), `${router.currentView} | ${txt(main).slice(0, 100)}`);
}

// ── 2. THE ARC SCREEN SAYS WHAT THE ARC IS ──────────────────────────────
console.log("\nTEST 2 - a strength arc lands on a screen about that arc");
fixture("personal");
{
  const { aimById } = await import(B + "data/aims.js");
  const aim = aimById("sport-without-flaring");
  store.set("arc", { aimId: aim.id, strands: ["trunk-strength", "leg-strength"], active: true, provenance: "self",
    acceptedAt: new Date().toISOString().slice(0, 10), startedAt: new Date(Date.now() - 5 * 864e5).toISOString().slice(0, 10),
    zonesWorked: {}, typesWorked: { lower: new Date(Date.now() - 864e5).toISOString().slice(0, 10) } });
  await go("stretch-arc");
  const t = txt(main);
  ok("2a. titled \"Your arc\", not \"Stretch arc\"", /Your arc/.test(t) && !/Stretch arc/.test(t), t.slice(0, 120));
  ok("2b. it names the aim and its strands", t.includes(aim.label) && /Trunk strength/.test(t) && /Leg strength/.test(t), t.slice(0, 260));
  ok("2c. each strand says when it last came up (a date, never a count)", /Leg strength[^.]*yesterday/i.test(t) && /Trunk strength[^.]*Not yet/i.test(t), t.slice(0, 300));
  ok("2d. no \"Stretch now\"; the way on is today's session", !/Stretch now/.test(t) && !!$$("button").find(b => /Start today.s session/.test(txt(b))), [...main.querySelectorAll("button")].map(txt).join(" | "));
  // Control: an arc with no aim is still the stretch tracker.
  store.set("arc", { active: true, zonesWorked: {}, startedAt: "2026-09-01" });
  await go("today"); await go("stretch-arc");
  ok("2e. control: an arc with no aim is still the stretch arc", /Stretch arc/.test(txt(main)) && /Stretch now/.test(txt(main)), txt(main).slice(0, 120));
}

// ── 3. A WAY OUT OF THE RED-FLAG SCREEN ─────────────────────────────────
console.log("\nTEST 3 - the red-flag screen has a way out");
fixture("personal");
{
  store.set("conditions", ["lower-back"]); store.set("conditionPainScores", { "lower-back": 6 });
  store.set("redFlag", null);
  await go("today");
  await router.navigate("running-session"); await wait(80);
  ok("3pc. going to a run with a sore back brings the screen first", router.currentView === "red-flag", router.currentView);
  const out = $$("button").find(b => /Not now/.test(txt(b)));
  ok("3a. a \"Not now\" beside Continue", !!out, $$("button").map(txt).join(" | "));
  click(out); await wait(80);
  ok("3b. it goes Home, without answering", router.currentView === "today", router.currentView);
  const RF = await import(B + "data/red-flag.js");
  ok("3c. and the run is not waiting to open later", RF.pendingRoute() === null);
  await router.navigate("running-session"); await wait(80);
  ok("3d. the screen still comes first next time", router.currentView === "red-flag", router.currentView);
}

// ── 4. GYM IN THE ACTIVITY LOG ──────────────────────────────────────────
console.log("\nTEST 4 - the activity log has a gym option");
fixture("free");
{
  const AL = await import(B + "views/activity-log.js");
  main.innerHTML = AL.render(); try { AL.onMount(); } catch {}
  const opt = $$("button, [data-type], label").find(b => /Gym or weights/.test(txt(b)));
  ok("4a. \"Gym or weights\" is offered", !!opt, txt(main).slice(0, 200));
  click(opt); await wait(20);
  main.innerHTML = AL.render(); try { AL.onMount(); } catch {}
  const save = $$("button").find(b => /^(Log it|Save|Log this|Log activity)/i.test(txt(b)));
  click(save); await wait(40);
  const last = (store.get("activityLog") || []).at(-1) || {};
  ok("4b. it logs as a gym session, which pacing counts", last.type === "gym", JSON.stringify(last).slice(0, 160));
  const AL2 = await import(B + "data/activity-labels.js");
  // A hand-logged gym visit reads as one; the builder's own "gym" entries
  // (gym-programme) stay "a session you built".
  ok("4c. and it reads in words", /gym/i.test(AL2.activityPhrase(last)), AL2.activityPhrase(last));
  ok("4d. control: a built session is still \"a session you built\"", AL2.activityPhrase({ type: "gym" }) === "a session you built", AL2.activityPhrase({ type: "gym" }));
}

// ── 5. WEIGHT, SAID WHERE IT LIVES ──────────────────────────────────────
console.log("\nTEST 5 - the Plan page says weight tracking is there");
fixture("free");
{
  await go("upgrade");
  ok("5a. the Plan page names weight tracking, and losing weight as a goal", /weight tracking/i.test(txt(main)) && /los(e|ing) weight/i.test(txt(main)), txt(main).slice(0, 200));
  ok("5b. and says it is off unless you turn it on", /off unless you turn it on/i.test(txt(main)));
}

// ── 6. NO STREAK ────────────────────────────────────────────────────────
console.log("\nTEST 6 - no \"days in a row\"; the lighter-day rule works");
fixture("free");
{
  const d = n => { const x = new Date(); x.setDate(x.getDate() - n); x.setHours(18, 0, 0, 0); return x.toISOString(); };
  // As the players write them: date as a full timestamp.
  store.set("activityLog", [1, 2, 3].map(n => ({ id: "w" + n, type: "workout", status: "completed", date: d(n), completedAt: d(n) })));
  const CK = await import(B + "data/checkin.js");
  ok("6a. three days running are counted (the date bug read 0)", CK.consecutiveActiveDays() === 3, String(CK.consecutiveActiveDays()));
  const SB = await import(B + "session-builder.js");
  const s = SB.buildSession({ sessionType: "full", durationMins: 30 });
  const line = [s.gentleLine, s.coachLine, s.reasonLine, s.note].filter(Boolean).join(" ") || JSON.stringify(s).match(/moving a lot lately[^"]*/)?.[0] || "";
  ok("6b. the lighter-day line is said, and counts nothing", /moving a lot lately/.test(line) && !/in a row|\d+ days/.test(line), line.slice(0, 160));
  const src = (await import("node:fs")).readFileSync(new URL("../js/session-builder.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  ok("6c. no \"in a row\" anywhere the builder can say", !/in a row/i.test(src));
}

// ── 7. NOT ASKED TO KEEP WHAT IS KEPT ───────────────────────────────────
console.log("\nTEST 7 - \"Keep this one?\" is not offered for a saved session");
fixture("personal");
{
  const SS = await import(B + "data/saved-sessions.js");
  const SB = await import(B + "session-builder.js");
  const SV = await import(B + "save-block.js");
  const built = SB.buildSession({ sessionType: "upper", durationMins: 20, equipmentOverride: ["dumbbells"] });
  const now = new Date().toISOString();
  const logIt = () => store.logActivity({ type: "workout", completedAt: new Date(Date.now() + Math.random() * 1e5).toISOString(), exerciseIds: built.exercises.map(e => e.id) }, 0);
  store.set("generatedSession", { session: built, builtAt: now, inputs: {} });
  logIt();
  ok("7pc. control: a new session just done is offered", !!SV.savableSession());
  const r = SS.saveSession("Tuesday upper", { ...built, durationMins: 20 });
  ok("7a. once saved, the same session is not offered again", r.ok && !SV.savableSession());
  // Started from the saved list.
  store.set("generatedSession", { session: { id: "upper", title: "Tuesday upper", exercises: SS.resolveSavedSession(r.saved).exercises }, builtAt: now, inputs: { savedSessionId: r.saved.id } });
  logIt();
  ok("7b. played from the saved list, it is not offered", !SV.savableSession());
}

console.log("");
if (fails) { console.log(`SMALL-ONES: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`SMALL-ONES: all ${passes} assertions pass\n`);
process.exit(0);
