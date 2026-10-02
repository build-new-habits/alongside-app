/**
 * tools/verify-health-consent.mjs
 * 02 Oct 2026 v7
 *
 * v7 - W4-1 GATE-OPEN. 2h asserted the bypass itself: a fresh install that
 *   had agreed to nothing reached the check-in. It now lands on onboarding,
 *   which asks the age and both consents; never on this screen and never on
 *   the check-in. Stricter, not loosened.
 *
 * v6 - LEGAL-TRUE 3. 3l: the day's intensity and lighter-day choice, both
 *   from check-in energy, go too.
 *
 * v5 - LEGAL-TRUE 2. 3j: a target weight, and check-in energy and soreness
 *   copied into session records, are deleted too; a non-weight target stays.
 *
 * v4 - LEGAL-TRUE. What the person said about their body and how they have
 *   been is a health answer: Delete my health answers now deletes it (3g
 *   reversed: capability, assessment, onboarding and lifestyle answers, lift
 *   notes), the tick names it (1a), and Settings › What your body can do
 *   asks for the health consent first (TEST 6).
 *
 * v3 - AGE-CHECK. Onboarding asks when you were born before consent; the
 *   fixture answers as an adult (January 1990), and fixtures with consent
 *   record an adult age. No assertion changed.
 *
 * v2 - Onboarding is mounted in its own element: its timers outlive test 1
 *   and crashed the run once in a parallel suite when main was repainted.
 *   Stress-run 10 at once, all green. No assertion changed.
 *
 * PT-2 HEALTH-CONSENT. Health answers have their own, explicit consent,
 * and a way to take it back.
 *
 * Found preparing 12g (30 Sep): sore areas, pain, check-ins, weight and
 * the journal were covered only by the one combined "Privacy Policy and
 * Terms" tick; the only way to withdraw was Reset all data; a journal
 * entry could not be deleted. Graeme, 30 Sep: a separate tick and a
 * delete control.
 *
 *   1. Onboarding asks two ticks; the second names the health answers.
 *      One tick is not enough; both record consent, and the health
 *      consent carries its own time and wording version.
 *   2. Someone who agreed before this existed (consent given, no health
 *      record) is asked once, through the real router, before the
 *      check-in, I know what I want, or the journal. Classes are not
 *      health questions. "Not now" records nothing.
 *   3. Settings › Delete my health answers deletes check-ins, sore areas
 *      and scores, weight, the journal and session notes; sessions and
 *      lifts stay, a red-flag stop stays in force, and the health consent
 *      is marked withdrawn, so the next check-in asks again.
 *   4. While it is withdrawn nothing health-related is asked elsewhere:
 *      the finish screen has no note or mood, Progress no weight entry.
 *   5. A journal entry can be deleted from Wellbeing, and only that one.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { router } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

let HC = null;
try { HC = await import(B + "data/health-consent.js"); } catch { /* red first */ }

// The real navigate(), mounting the health-consent view for real.
let landed = [];
router._mountView = async name => {
  landed.push(name);
  if (name === "health-consent") {
    const m = await import(B + "views/health-consent.js");
    main.innerHTML = ""; m.HealthConsentView(router).mount(main);
  }
};
const go = async r => { landed = []; await router.navigate(r); await wait(10); return landed.at(-1); };

function fixture({ consent = true, health } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Sam"); store.set("tier", "personal");
  if (consent) { store.set("consent.given", true); store.set("consent.at", new Date().toISOString()); store.set("consent.ageConfirmed", true); store.set("consent.policyVersion", "2026-10-01"); }
  if (health !== undefined) store.set("consent.health", health);
  HC?.takePendingRoute?.();
  router.currentView = "today"; router.history = [];
}

// ── 1. ONBOARDING: TWO TICKS ────────────────────────────────────────────
console.log("\nTEST 1 - onboarding asks for health consent on its own");
localStorage.clear(); store.init();
const tv = await import(B + "views/onboarding/thread.js");
const View = tv.OnboardingThreadView || tv.ThreadView || Object.values(tv).find(v => typeof v === "function");
// Its own element, as verify-consent2 does: the thread keeps its own
// timers running after this test, and must not lose its container when
// later tests repaint main (seen once under a parallel run).
const obEl = document.createElement("div"); document.body.appendChild(obEl);
const thread = View({ navigate() {}, back() {} }); thread.mount(obEl); await wait(2600);
  { const mo = obEl.querySelector("#ob-age-month"), yr = obEl.querySelector("#ob-age-year"); if (mo && yr) { mo.value = "1"; yr.value = "1990"; obEl.querySelector("#ob-age-continue").dispatchEvent(new dom.window.Event("click")); await wait(20); } }
const t1 = obEl.querySelector("#ob-consent-check"), t2 = obEl.querySelector("#ob-consent-health");
ok("1pc. positive control: the consent screen is up", !!t1);
ok("1a. a second tick, for health answers, with its own label",
   !!t2 && /health answers/i.test(txt(obEl.querySelector('label[for="ob-consent-health"]'))) &&
   /sore/i.test(txt(obEl.querySelector('label[for="ob-consent-health"]'))) && /journal/i.test(txt(obEl.querySelector('label[for="ob-consent-health"]'))) &&
   /your body|my body/i.test(txt(obEl.querySelector('label[for="ob-consent-health"]'))),
   txt(obEl.querySelector('label[for="ob-consent-health"]')));
if (t1) { t1.checked = true; t1.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }
click(obEl.querySelector("#ob-consent-continue")); await wait(10);
ok("1b. one tick is not enough: nothing recorded, and it says so",
   store.get("consent.given") !== true && /both/i.test(txt(obEl.querySelector("#ob-consent-error"))) && !obEl.querySelector("#ob-consent-error")?.hidden,
   txt(obEl.querySelector("#ob-consent-error")));
if (t2) { t2.checked = true; t2.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }
click(obEl.querySelector("#ob-consent-continue")); await wait(10);
const h = store.get("consent")?.health || {};
ok("1c. both ticks record consent, and the health consent has its own time and version",
   store.get("consent.given") === true && h.given === true && !!h.at && !!h.version, JSON.stringify(store.get("consent")));

// ── 2. ASKED ONCE, BEFORE HEALTH QUESTIONS ──────────────────────────────
console.log("\nTEST 2 - someone who agreed before is asked once, before health questions");
fixture({ consent: true });
ok("2pc. the guard exists", !!HC?.guardRoute);
let at = await go("checkin");
ok("2a. the check-in first asks for health consent", at === "health-consent" && /health answers/i.test(txt(main)), `${at} ${txt(main).slice(0, 80)}`);
for (const r of ["know-what", "journal-entry"]) {
  fixture({ consent: true });
  ok(`2b. so does ${r}`, (await go(r)) === "health-consent");
}
fixture({ consent: true });
ok("2c. a class is not a health question", (await go("classes")) === "classes");
fixture({ consent: true });
await go("checkin");
click(main.querySelector("#hc-not-now")); await wait(20);
ok("2d. Not now goes Home and records nothing", landed.includes("today") && store.get("consent")?.health?.given !== true, JSON.stringify(landed));
fixture({ consent: true });
await go("checkin");
click(main.querySelector("#hc-continue")); await wait(10);
ok("2e. Continue without the tick says what is needed", store.get("consent")?.health?.given !== true && !!txt(main.querySelector("#hc-error")));
const box = main.querySelector("#hc-check");
if (box) { box.checked = true; box.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }
landed = [];
click(main.querySelector("#hc-continue")); await wait(20);
ok("2f. ticked: recorded, and on to the check-in", store.get("consent")?.health?.given === true && landed.includes("checkin"), JSON.stringify(landed));
ok("2g. and not asked again", (await go("checkin")) === "checkin");
fixture({ consent: false });
ok("2h. a fresh install that has agreed to nothing goes to onboarding (which asks), never the check-in", (await go("checkin")) === "onboarding/thread");

// ── 3. DELETE MY HEALTH ANSWERS ─────────────────────────────────────────
console.log("\nTEST 3 - Settings › Delete my health answers");
fixture({ consent: true, health: { given: true, at: new Date().toISOString(), version: "x", withdrawnAt: null } });
const day = new Date().toISOString().slice(0, 10);
store.set("checkinHistory", { [day]: { energy: 6, mood: 3, conditionLevels: { "lower-back": 6 } } });
store.set("lastCheckin", { energy: 6, mood: 3, timestamp: new Date().toISOString() });
store.set("conditions", ["lower-back"]); store.set("conditionMeta", { "lower-back": { addedAt: "x" } });
store.set("conditionPainScores", { "lower-back": 6 }); store.set("conditionsResolved", [{ id: "knee", resolvedAt: "x" }]);
store.set("severePainChoices", [{ date: day, conditionIds: ["lower-back"], choice: "rest" }]);
store.set("weight", 80); store.set("weightLog", [{ at: "x", kg: 80 }]);
store.set("journalEntries", [{ id: "j1", date: new Date().toISOString(), text: "Back flared again", tags: [] }]);
store.set("activityLog", [{ id: "a1", date: new Date().toISOString(), type: "workout", status: "completed", durationMins: 30, feel: "strong", painChange: "worse", note: "Back flared again", moodAfter: 3 }]);
store.set("absence", { context: "injury", capturedAt: "x" });
store.set("redFlag", { screenedAt: "x", areas: ["lower-back"], textVersion: "v", level: "advice", flaggedAt: "x", clearedAt: null });
store.set("capability", { ...(store.get("capability") || {}), balanceWorry: "yes", askedAt: "x" });
store.set("liftLog", { "barbell-back-squat": [{ at: "x", weight: 60, reps: 5, note: "Back flared again" }] });
store.set("assessment", { ...(store.get("assessment") || {}), completedAt: "x" });
store.set("lifestyle", { ...(store.get("lifestyle") || {}), returningAfter: "injury", stressLevel: "high" });
store.set("onboarding", { ...(store.get("onboarding") || {}), hardBeforeSelections: ["body-relationship"], primaryTerritory: "body" });
store.set("strategicGoal", { ...(store.get("strategicGoal") || {}), targetValue: 70, targetUnit: "kg", weightTargetBand: "gentle", weeklySessionTarget: 4 });
store.set("todayIntensity", "low"); store.set("lighterDayDeclinedOn", "2026-10-01");
store.set("progressLog", [{ date: "x", week: 1, focus: "legs", energyAtCheckin: 6, conditionScores: { "lower-back": 6 }, durationMinutes: 30 }]);
store.set("activityLog", [...(store.get("activityLog") || []).map(e => ({ ...e, energyBefore: 6 }))]);
const { SettingsView } = await import(B + "views/settings.js");
main.innerHTML = ""; SettingsView({ navigate(v) { landed.push(v); }, back() {} }).mount(main); await wait(20);
const del = main.querySelector('[data-action="delete-health"]');
ok("3a. a Delete my health answers row that says what it covers",
   !!del && /Delete my health answers/.test(txt(del)) && /journal/i.test(txt(del)), txt(del));
click(del); await wait(10);
ok("3b. it asks first, saying what goes and what stays",
   /check-ins/i.test(txt(document.querySelector('[role="dialog"], [role="alertdialog"]'))) && /stay/i.test(txt(document.querySelector('[role="dialog"], [role="alertdialog"]'))),
   txt(document.querySelector('[role="dialog"], [role="alertdialog"]')));
click(document.querySelector("#confirm-ok")); await wait(20);
const a = store.get("activityLog")?.[0] || {};
ok("3c. check-ins, sore areas, scores, choices, weight and journal are gone",
   Object.keys(store.get("checkinHistory") || {}).length === 0 && !store.get("lastCheckin")?.mood &&
   (store.get("conditions") || []).length === 0 && Object.keys(store.get("conditionMeta") || {}).length === 0 &&
   Object.keys(store.get("conditionPainScores") || {}).length === 0 && (store.get("conditionsResolved") || []).length === 0 &&
   (store.get("severePainChoices") || []).length === 0 && store.get("weight") == null && (store.get("weightLog") || []).length === 0 &&
   (store.get("journalEntries") || []).length === 0 && store.get("absence")?.context == null,
   JSON.stringify({ c: store.get("conditions"), w: store.get("weight"), j: (store.get("journalEntries") || []).length }));
ok("3d. sessions stay, without their notes, pain or mood answers",
   a.id === "a1" && a.durationMins === 30 && a.feel === "strong" && a.note == null && a.painChange == null && a.moodAfter == null, JSON.stringify(a));
ok("3e. nothing a person wrote is left anywhere in the store", !/Back flared/.test(JSON.stringify(store.data || {})));
ok("3f. a red-flag stop stays in force (only the areas go)",
   store.get("redFlag")?.level === "advice" && !store.get("redFlag")?.clearedAt && (store.get("redFlag")?.areas || []).length === 0);
const lift = (store.get("liftLog") || {})["barbell-back-squat"]?.[0] || {};
ok("3g. what they said about their body and how they have been goes; lifts stay without notes",
   store.get("capability")?.balanceWorry !== "yes" && !store.get("capability")?.askedAt &&
   !store.get("assessment")?.completedAt &&
   store.get("lifestyle")?.returningAfter == null && store.get("lifestyle")?.stressLevel == null &&
   (store.get("onboarding")?.hardBeforeSelections || []).length === 0 && store.get("onboarding")?.primaryTerritory == null &&
   lift.weight === 60 && lift.note == null,
   JSON.stringify({ cap: store.get("capability"), lift, ob: store.get("onboarding")?.hardBeforeSelections }));
const pl = store.get("progressLog")?.[0] || {}, sg = store.get("strategicGoal") || {};
ok("3j. a target weight, and check-in energy and soreness kept with sessions, go too",
   sg.targetValue == null && sg.targetUnit == null && sg.weightTargetBand == null && sg.weeklySessionTarget === 4 &&
   pl.energyAtCheckin == null && pl.conditionScores == null && pl.durationMinutes === 30 &&
   store.get("activityLog")?.[0]?.energyBefore == null,
   JSON.stringify({ sg: { v: sg.targetValue, u: sg.targetUnit, b: sg.weightTargetBand }, pl, eb: store.get("activityLog")?.[0]?.energyBefore }));
ok("3l. the day's intensity and lighter-day choice (from check-in energy) go too", store.get("todayIntensity") == null && store.get("lighterDayDeclinedOn") == null);
store.set("strategicGoal", { ...(store.get("strategicGoal") || {}), targetValue: 30, targetUnit: "min" });
store.deleteHealthAnswers();
ok("3k. REVERSAL: a target that is not a weight stays", store.get("strategicGoal")?.targetValue === 30);
const hc = store.get("consent")?.health || {};
ok("3h. the health consent is marked withdrawn", hc.given === false && !!hc.withdrawnAt, JSON.stringify(hc));
router.currentView = "settings";
ok("3i. so the next check-in asks again", (await go("checkin")) === "health-consent");

// ── 4. NOTHING ASKED WHILE WITHDRAWN ────────────────────────────────────
console.log("\nTEST 4 - while withdrawn, nothing health-related is asked elsewhere");
const reflect = await import(B + "views/reflect.js?w=1");
store.set("activityLog", [{ id: "a2", date: new Date().toISOString(), type: "workout", status: "completed", durationMins: 20 }]);
store.set("currentActivityEntry", "a2");
main.innerHTML = reflect.render(); try { reflect.onMount(); } catch {}
ok("4pc. positive control: the finish screen is up", /today done|Saved what you did/.test(txt(main)));
ok("4a. no note and no mood question", !main.querySelector("#reflect-open-text") && !main.querySelector("#reflect-mood-slider"));
store.set("consent.health", { given: true, at: "x", version: "x", withdrawnAt: null });
const reflect2 = await import(B + "views/reflect.js?w=2");
main.innerHTML = reflect2.render(); try { reflect2.onMount(); } catch {}
ok("4b. REVERSAL: with consent, the note and mood are there", !!main.querySelector("#reflect-open-text") && !!main.querySelector("#reflect-mood-slider"));
store.set("consent.health", { given: false, at: null, version: null, withdrawnAt: "x" });
store.set("weightTracking", true);
const prog = await import(B + "views/progress.js");
const PV = prog.ProgressView || Object.values(prog).find(v => typeof v === "function" && /View/.test(v.name));
main.innerHTML = ""; try { PV({ navigate() {}, back() {} }).mount(main); } catch (e) { console.log("        progress mount", e.message); }
await wait(20);
ok("4c. Progress offers no weight entry", !main.querySelector("#weight-log-input"));

// ── 5. A JOURNAL ENTRY CAN BE DELETED ───────────────────────────────────
console.log("\nTEST 5 - a journal entry can be deleted from Wellbeing");
fixture({ consent: true, health: { given: true, at: "x", version: "x", withdrawnAt: null } });
store.set("journalEntries", [
  { id: "j1", date: "2026-09-29T10:00:00Z", text: "First", tags: [] },
  { id: "j2", date: "2026-09-30T10:00:00Z", text: "Second", tags: [] },
]);
const nm = await import(B + "views/noticing.js?w=1");
const paint = () => { main.innerHTML = nm.render(); try { nm.onMount(); } catch {} };
paint();
const delBtn = main.querySelector('[data-journal-delete="j2"]');
ok("5a. each entry has a Delete", !!delBtn && main.querySelectorAll("[data-journal-delete]").length === 2);
click(delBtn); await wait(10);
ok("5b. it asks first, and nothing is gone yet", (store.get("journalEntries") || []).length === 2 && !!main.querySelector('[data-journal-delete-yes="j2"]'));
click(main.querySelector('[data-journal-delete-yes="j2"]')); await wait(10);
const left = (store.get("journalEntries") || []).map(e => e.id);
ok("5c. only that entry goes", JSON.stringify(left) === '["j1"]', JSON.stringify(left));
ok("5d. and it says so", /deleted/i.test(txt(main)));

// ── 6. WHAT YOUR BODY CAN DO ASKS FIRST ─────────────────────────────────
console.log("\nTEST 6 - Settings › What your body can do asks for the health consent first");
fixture({ consent: true, health: { given: false, at: null, version: null, withdrawnAt: "x" } });
landed = [];
main.innerHTML = ""; SettingsView({ navigate(v) { landed.push(v); }, back() {} }).mount(main); await wait(20);
const capRow = [...main.querySelectorAll(".settings-row")].find(b => /What your body can do/.test(txt(b)));
ok("6pc. positive control: the row is there", !!capRow);
ok("6a. withdrawn: it does not open the answers", !capRow?.hasAttribute("data-open"));
click(capRow); await wait(20);
ok("6b. it asks for the health consent", landed.includes("health-consent"), JSON.stringify(landed));
fixture({ consent: true, health: { given: true, at: "x", version: "x", withdrawnAt: null } });
main.innerHTML = ""; SettingsView({ navigate(v) { landed.push(v); }, back() {} }).mount(main); await wait(20);
const capRow2 = [...main.querySelectorAll(".settings-row")].find(b => /What your body can do/.test(txt(b)));
ok("6c. REVERSAL: with consent, it opens the answers", capRow2?.getAttribute("data-open") === "capability");

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
