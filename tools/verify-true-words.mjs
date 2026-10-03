/**
 * tools/verify-true-words.mjs
 * 03 Oct 2026 v3
 *
 * v3 - W5-20 TRUE-WORDS-5 (Wave 5 trace). 3b re-pointed: no carrying,
 *   gripping, getting up and down promised to anybody. TESTs 18-28, one per
 *   line: balance Sometimes, Stress taken off, the Mostly the same line, the
 *   red-flag introduction, leave cards, the tier table, Make it up as I go
 *   on Free, screen names, heart and lungs, nowhere to answer, restore.
 *
 * 03 Oct 2026 v2
 *
 * v2 - W5-12 LENGTH-TRUE-2 (Wave 5 trace: 2.1, 2.4, 2.11, 2.13, 2.15,
 *   2.16). TESTs 13-17: on low and lighter days the plan's own lines state
 *   the minutes built; Yoga's lengths are what it builds, with no "Full
 *   practice" or "30 minutes ago"; Core's finish says the minutes done; a
 *   run says how many prompts it will give and lists those; the check-in's
 *   length line follows today's answers.
 *
 * W4-20 TRUE-WORDS-4 (Wave 4 persona trace, findings §4). Each line the
 * trace found untrue, in the state it was untrue in:
 *
 *   1. The coach's plan sentence: the length it states is the plan's own
 *      (it said "40 minutes" over "About 25 min").
 *   2. The check-in: "I'll plan for your usual 30 minutes" before a plan
 *      made shorter (a low day, poor sleep, a lighter reason).
 *   3. Getting started: "carrying, gripping, getting up and down" promised
 *      to somebody whose legs are not ready for load.
 *   4. "Mindful movement" opens sitting and breathing practices only.
 *   5. "lately it's been not much" to somebody with a month of breathing
 *      and mindful practice that the count leaves out.
 *   6. "Runs that feel tough…" after a steady run.
 *   7. "You told me it always ramps up until it breaks": they chose "It
 *      moved too fast, too soon".
 *   8. "Fitness slips in that time whatever the reason".
 *   9. "Five percent of what you pay" to a beta member who pays nothing.
 *  10. "The plan stays as it is" over a plan the coach made lighter.
 *  11. "1 weeks in, 1 sessions".
 *  12. Progress's weeks start before the person did.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
import { agreed } from "./agreed.mjs";
import { oneScreen } from "./one-screen.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><body><div id="app"><main id="main-content"></main></div></body>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;
globalThis.fetch = dom.window.fetch = async () => ({ ok: false, text: async () => "", json: async () => ({}) });

const ROOT = new URL("../", import.meta.url);
const B = new URL("js/", ROOT).href;
const src = p => readFileSync(new URL(p, ROOT), "utf8");
// What the app can show: the file without its comment lines (history notes
// quote the old words).
const code = p => src(p).split("\n").filter(l => !/^\s*(\*|\/\/|\/\*\*)/.test(l)).join("\n");
const { store } = await import(B + "store.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const ago = d => new Date(Date.now() - d * 86400000).toISOString();
function person(extra = {}) {
  localStorage.clear(); store.init(); agreed(store); gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Pat"); store.set("tier", "personal");
  store.set("equipment", []); store.set("homeEquipment", []);
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
  for (const [k, v] of Object.entries(extra)) store.set(k, v);
}

// ── 1. THE PLAN SENTENCE ────────────────────────────────────────────────
console.log("\nTEST 1 - the plan sentence states the plan's own length");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const off = [];
let tried = 0;
for (const type of ["full", "upper", "lower", "glute", "core", "cardio", "mobility", "stretch"]) for (const time of ["standard", "long"]) {
  person({ availableTime: time, requestedSessionType: type }); tried++;
  const el = oneScreen(document.createElement("div"));
  CoachProposalView({ history: ["x"], navigate() {}, back() {} }).mount(el); await wait(30);
  const all = txt(el);
  const total = Number((all.match(/About (\d+) min/) || [])[1]);
  const sent = (all.match(/You asked for [^.]*\.(?: This one comes to about \d+ minutes\.)?/) || [""])[0];
  const stated = Number((sent.match(/comes to about (\d+)/) || sent.match(/(\d+) minutes/) || [])[1]);
  if (!sent) off.push(`${time}: no sentence`);
  else if (!(Math.abs(stated - total) <= 5)) off.push(`${type} ${time}: "${sent.slice(0, 70)}" over About ${total} min`);
}
ok(`1a. the length said is within five minutes of the plan's total (${tried} plans: eight kinds, 40 and 50 minutes)`, off.length === 0, off.join(" | "));

// ── 2. THE CHECK-IN'S LENGTH LINE ───────────────────────────────────────
console.log("\nTEST 2 - the check-in does not promise the usual length on a shorter day");
const CKV = await import(B + "views/checkin.js");
const L = CKV.lengthLine;
ok("2pc. the line is one function", typeof L === "function");
ok("2a. a low day: not \"I'll plan for your usual\"", !!L && !/plan for your usual/.test(L("short", { shorter: true })) && /shorter/.test(L("short", { shorter: true })), L && L("short", { shorter: true }));
ok("2b. control: an ordinary day keeps it", !!L && /plan for your usual 30 minutes/.test(L("short", { shorter: false })));

// ── 3. GETTING STARTED'S PROMISE ────────────────────────────────────────
console.log("\nTEST 3 - no carrying and getting up and down promised to legs not ready for load");
const OTD = await import(B + "data/onboarding-thread-data.js");
const notReady = OTD.generateIntentAck("maintain", { legsLoadable: false });
ok("3a. legs not ready: no carrying, gripping, getting up and down", !/carrying|getting up and down/i.test(notReady), notReady);
// W5-20: nor to anybody (360 builds of a ready profile gave none of the three).
ok("3b. legs ready: no carrying, gripping, getting up and down promised either", !/carrying|gripping|getting up and down/i.test(OTD.generateIntentAck("maintain", { legsLoadable: true })));

// ── 4. MINDFUL ──────────────────────────────────────────────────────────
console.log("\nTEST 4 - the sitting practices are not called movement");
const where = ["js/views/library.js", "js/views/noticing.js", "js/views/quiet-session.js", "js/data/tier-table.js"].filter(f => /Mindful movement|mindful movement/.test(code(f)));
ok("4a. no \"Mindful movement\" for them", where.length === 0, where.join(", "));

// ── 5. "NOT MUCH" ───────────────────────────────────────────────────────
console.log("\nTEST 5 - the plan-jump line with a month of breathing and mindful practice");
const P = await import(B + "data/pacing.js");
person({ createdAt: ago(40), "strategicGoal.setAt": ago(30), "strategicGoal.weeklySessionTarget": 4,
  activityLog: Array.from({ length: 12 }, (_, i) => ({ id: "m" + i, type: i % 2 ? "mindfulness" : "breathing", status: "completed", completedAt: ago(1 + i * 2) })) });
const jump = P.noticePlanJump();
ok("5pc. the line is offered", !!jump, JSON.stringify(jump));
ok("5a. no \"not much\"; it says breathing and mindful practice aren't counted", !!jump && !/not much/.test(jump.body) && /breathing/i.test(jump.body), jump?.body);

// ── 6. A STEADY RUN ─────────────────────────────────────────────────────
console.log("\nTEST 6 - the finish line follows the feel answer");
const R = await import(B + "views/reflect.js");
person();
const steady = R.buildSummary?.({ type: "run" }, "steady", null, null) || "";
ok("6a. a steady run: not \"Runs that feel tough\"; it says steady", !!steady && !/feel tough/.test(steady) && /steady/i.test(steady), steady);
ok("6b. control: a tough run still gets it", /feel tough/.test(R.buildSummary?.({ type: "run" }, "tough", null, null) || ""));

// ── 7. THEIR OWN WORDS ──────────────────────────────────────────────────
console.log("\nTEST 7 - said back in the words they chose");
ok("7a. no \"always ramps up until it breaks\"; their \"too fast\"", !/ramps up until it breaks/.test(code("js/data/first-session.js")) && /too fast/.test(code("js/data/first-session.js")));

// ── 8. FITNESS SLIPS ────────────────────────────────────────────────────
console.log("\nTEST 8 - no \"Fitness slips\"");
ok("8a. the coming-back offer makes no claim about their fitness", !/Fitness slips/.test(code("js/views/coach-proposal.js")));

// ── 9. WHAT YOU PAY ─────────────────────────────────────────────────────
console.log("\nTEST 9 - nobody paying is told what they pay");
const U = await import(B + "views/upgrade.js");
person();
const up = document.createElement("div"); up.innerHTML = U.render();
ok("9a. upgrade: no \"Five percent of what you pay goes\"", !/Five percent of what you pay goes/.test(txt(up)) && /percent/.test(txt(up)), txt(up).slice(0, 300));
ok("9b. settings: the same", !/Five percent of what you pay goes/.test(code("js/views/settings.js")));

// ── 10. THE PLAN STAYS AS IT IS ─────────────────────────────────────────
console.log("\nTEST 10 - not \"stays as it is\" over a plan made lighter");
const SB = await import(B + "session-builder.js");
ok("10pc. the builder says why a plan is lighter", typeof SB.gentleReason === "function");
const cp = src("js/views/coach-proposal.js");
void cp;
const todayKey = new Date().toISOString().split("T")[0];
async function goodDay(sleep) {
  person({ checkinHistory: { [todayKey]: { energy: 8, mood: 7, sleepQuality: sleep } }, lastCheckin: { energy: 8, mood: 7, timestamp: new Date().toISOString() }, todayIntensity: "high" });
  const el = oneScreen(document.createElement("div"));
  CoachProposalView({ history: ["x"], navigate() {}, back() {} }).mount(el); await wait(30);
  return txt(el.querySelector(".cp-offer"));
}
const slept = await goodDay("poor");
ok("10a. good energy after a poor night (a lighter plan): not \"stays as it is\"", !!SB.gentleReason?.() && !/stays as it is/.test(slept) && /lighter/.test(slept), slept);
const fine = await goodDay("good");
ok("10b. control: good energy and a good night, it stays as it is", /stays as it is/.test(fine), fine);

// ── 11. PLURALS ─────────────────────────────────────────────────────────
console.log("\nTEST 11 - plurals");
ok("11a. no \"${n} weeks in, ${n} sessions\" without a plural", !/\$\{stats\.weeksIn\} weeks in, \$\{stats\.totalSessions\} sessions/.test(src("js/views/progress.js")));

// ── 12. PROGRESS FROM THE START ─────────────────────────────────────────
console.log("\nTEST 12 - Progress's weeks start when the person did");
const AR = await import(B + "data/arc-readback.js");
const weeks = AR.sessionsByWeek([{ completedAt: ago(1) }], { weeks: 6, since: new Date(ago(9)) });
ok("12a. installed nine days ago: two weeks shown, not six", weeks.length <= 2 && weeks.length >= 1, String(weeks.length));
ok("12b. control: no start given, six", AR.sessionsByWeek([], { weeks: 6 }).length === 6);
person({ createdAt: ago(9), activityLog: [{ id: "w1", type: "walk", status: "completed", completedAt: ago(1) }] });
const { ProgressView } = await import(B + "views/progress.js");
const pel = oneScreen(document.createElement("div")); ProgressView({ navigate() {}, back() {} }).mount(pel); await wait(20);
const chart = pel.querySelector('[aria-label="Sessions, week by week"]');
ok("12c. Progress, nine days in: no more than two weeks drawn, said as since you started",
   !!chart && chart.querySelectorAll("li").length <= 2 && /since you started/.test(txt(pel.querySelector("#pr-sessions-cap"))),
   `${chart?.querySelectorAll("li").length} weeks; ${txt(pel.querySelector("#pr-sessions-cap"))}`);

// ── 13. LOW AND LIGHTER DAYS (W5-12) ────────────────────────────────────
console.log("\nTEST 13 - on a low day every stated length is the plan's own");
const SB13 = await import(B + "session-builder.js");
const off13 = [];
let built13 = 0;
for (const type of ["full", "upper", "lower", "glute", "core", "cardio", "mobility", "stretch"]) for (const mins of [30, 40]) {
  person({ todayIntensity: "low" });
  const s = SB13.buildSession({ sessionType: type, durationMins: mins });
  if (!s || s.gentleCare) continue;
  built13++;
  const total = Math.round(s.exercises.reduce((n, e) => n + SB13.exerciseSeconds(e), 0) / 60);
  const said = [s.coachLine, s.subtitle].join(" ");
  const nums = [...said.matchAll(/(\d+)[- ]min(?:ute)?s?\b/g)].map(m => Number(m[1]));
  for (const n of nums) if (Math.abs(n - total) > 5) off13.push(`${type} ${mins}: "${n} minutes" over ${total}`);
}
ok(`13a. every length the plan states is within five of what it built (${built13} low-day plans)`, built13 >= 12 && off13.length === 0, off13.slice(0, 6).join(" | "));

// ── 14. YOGA (W5-12) ────────────────────────────────────────────────────
console.log("\nTEST 14 - Yoga's lengths are what it builds");
const YS14 = await import(B + "views/yoga-session.js");
person();
const ym = document.createElement("div"); document.body.appendChild(ym);
const paintY = () => { document.getElementById("main-content").innerHTML = YS14.render(); try { YS14.onMount(); } catch {} };
paintY();
const mainY = document.getElementById("main-content");
mainY.querySelector('[data-focus="flexibility"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(10); paintY();
if (!mainY.querySelector("[data-mins]") && mainY.querySelector("[data-target]")) { mainY.querySelector("[data-target]").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(10); paintY(); }
const cards14 = [...mainY.querySelectorAll("[data-mins]")].map(txt);
ok("14pc. length cards offered", cards14.length >= 1, cards14.join(" | "));
ok("14a. no card names a practice it is not (Short session, Full practice, Deep session)", !cards14.some(c => /Full practice|Short session|Deep session/.test(c)), cards14.join(" | "));
ok("14b. each card says about how long it is, and how many poses", cards14.every(c => /About \d+ min/.test(c) && /\d+ poses?/.test(c)), cards14.join(" | "));
ok("14c. the finish never says \"30 minutes ago\"", !/minutes ago/.test(code("js/views/yoga-session.js")));

// ── 15. CORE'S FINISH (W5-12) ───────────────────────────────────────────
console.log("\nTEST 15 - Core's finish says the minutes done");
const CS15 = await import(B + "views/core-session.js");
person();
const paintC = () => { document.getElementById("main-content").innerHTML = CS15.render(); try { CS15.onMount(); } catch {} };
const m15 = document.getElementById("main-content");
const q15 = sel => m15.querySelector(sel);
paintC();
q15("[data-focus]")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(10); paintC();
q15('[data-mins="20"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(10); paintC();
q15("#cs-start-btn")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(10); paintC();
for (let i = 0; i < 60 && !/core session done/i.test(txt(m15)); i++) {
  const b = q15("#cs-skip-btn") || q15("#cs-next-btn") || q15("#cs-done-btn") || q15("#cs-begin-btn") || q15("#cs-rest-skip-btn");
  if (!b) break; b.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(5); paintC();
}
const done15 = txt(m15);
ok("15pc. reached the finish", /core session done/i.test(done15), done15.slice(0, 160));
ok("15a. it does not claim the 20 minutes chosen when a minute was done", !/20 minutes/.test(done15) && /\b1 minute\b/.test(done15), done15.slice(0, 200));

// ── 16. A RUN'S PROMPTS (W5-12) ─────────────────────────────────────────
console.log("\nTEST 16 - a run says how many prompts it gives, and lists those");
const RS16 = await import(B + "views/running-session.js");
person();
const m16 = document.getElementById("main-content");
const paintR = () => { m16.innerHTML = RS16.render(); try { RS16.onMount(); } catch {} };
paintR();
m16.querySelector('.ws-type-card[data-type="easy"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(10); paintR();
m16.querySelector('.ws-duration-card[data-mins="20"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); await wait(10); paintR();
const over16 = txt(m16);
const said16 = Number((over16.match(/prompt you (\d+) times?/) || over16.match(/(\d+) prompts?/) || [])[1]);
// An easy run prompts every 7 minutes, never in the 3-minute cooldown: 20 minutes gives 7 and 14.
ok("16pc. the overview", /Easy|easy/.test(over16) && /20 min/.test(over16), over16.slice(0, 120));
ok("16a. says 2, the number it will give", said16 === 2, over16.slice(0, 300));
ok("16b. and lists no prompt it will not give", !/more prompts during your run/.test(over16) && !/Halfway|miles to go/i.test(over16), over16.slice(0, 500));

// ── 17. THE CHECK-IN, AFTER TODAY'S ANSWERS (W5-12) ─────────────────────
console.log("\nTEST 17 - the check-in's length line follows today's answers");
dom.window.matchMedia = q => ({ matches: /prefers-reduced-motion/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const day = n => store._localDay(new Date(Date.now() - n * 86400000));
person({ availableTime: "short", checkinHistory: { [day(2)]: { energy: 2, mood: 4 }, [day(1)]: { energy: 2, mood: 4 } }, pendingDoorRoute: "coach-proposal" });
const host17 = document.createElement("div"); document.getElementById("app").appendChild(host17);
const navs17 = [];
CKV.CheckinView({ navigate: v => navs17.push(v), back() {} }).mount(host17);
const tap17 = async re => {
  for (let t = 0; t < 400; t++) {
    const b = [...document.querySelectorAll("#app button, .ci-panel button")].find(x => !x.disabled && re.test(txt(x)));
    if (b) { b.click(); await wait(30); return true; }
    await wait(15);
  }
  return false;
};
await tap17(/^Okay$/); await tap17(/^Pretty good$/); await tap17(/^Nothing today$/);
for (let t = 0; t < 200 && !navs17.length; t++) await wait(15);
const thread17 = txt(host17);
ok("17pc. the check-in finished", navs17.length > 0, JSON.stringify(navs17));
ok("17a. a low week with today: not \"I'll plan for your usual\"", !/plan for your usual/.test(thread17) && /shorter/.test(thread17), thread17.slice(-260));
host17.remove(); document.querySelectorAll(".ci-panel, .ci-overlay").forEach(n => n.remove());

// ════ W5-20 TRUE-WORDS-5 ═══════════════════════════════════════════════
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));

// ── 18. BALANCE ─────────────────────────────────────────────────────────
console.log("\nTEST 18 - after balance Sometimes");
const bal = OTD.generateBalanceAck("sometimes");
ok("18a. not \"it doesn't rule anything out\" (balance work is left out)", !/rule anything out/i.test(bal) && /leave out/i.test(bal), bal);

// ── 19. STRESS, TAKEN OFF ───────────────────────────────────────────────
console.log("\nTEST 19 - Take it off on Stress");
const { SettingsView } = await import(B + "views/settings.js");
person({ conditions: ["knee", "anxiety"] });
const s19 = document.getElementById("main-content"); s19.innerHTML = "";
SettingsView({ navigate() {}, back() {} }).mount(s19); await wait(10);
click(s19.querySelector('[data-open="conditions"]')); await wait(10);
click(s19.querySelector('[data-resolve="anxiety"]')); await wait(10);
ok("19a. not \"moved to Better now\", not under Better now", !/Stress moved to Better now/.test(txt(s19)) && !(store.get("conditionsResolved") || []).some(r => r.id === "anxiety") && !(store.get("conditions") || []).includes("anxiety"), txt(s19).slice(0, 200));

// ── 20. THE MOSTLY THE SAME HINT ────────────────────────────────────────
console.log("\nTEST 20 - the line under How much should sessions change");
person();
s19.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(s19); await wait(10);
click(s19.querySelector('[data-open="preferences"]')); await wait(10);
const sel = s19.querySelector("#settings-pref-variety");
if (sel) { sel.value = "familiar"; sel.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }
await wait(10);
ok("20a. follows the answer at once", !!sel && /starts the same way/.test(txt(s19.querySelector("#pref-variety-now"))) && !/This is the default/.test(txt(s19.querySelector("#pref-variety-now"))), txt(s19.querySelector("#pref-variety-now")));

// ── 21. THE RED-FLAG INTRODUCTION ───────────────────────────────────────
console.log("\nTEST 21 - the red-flag introduction after Nothing today");
const RF = await import(B + "data/red-flag.js");
ok("21a. not \"You've told me something is sore\"", !/told me something is sore/.test(RF.RED_FLAG_INTRO) && /listed a sore/.test(RF.RED_FLAG_INTRO), RF.RED_FLAG_INTRO);

// ── 22. LEAVE CARDS ─────────────────────────────────────────────────────
console.log("\nTEST 22 - leave cards above Exit and save progress");
ok("22a. the session card: not \"won't be saved\"", !/won.t be saved|won&rsquo;t be saved/.test(code("js/session-guard.js")));
ok("22b. the run card: not \"won't be saved\"", !/won.t be saved/.test(code("js/views/running-session.js")));

// ── 23. THE TIER TABLE ──────────────────────────────────────────────────
console.log("\nTEST 23 - the tier table on I know what I want");
const TT = await import(B + "data/tier-table.js");
const kw = TT.TIER_TABLE.find(r => r.id === "know-what");
ok("23a. Free: Not included (the door is the Plan's)", !!kw && /^Not included/.test(kw.free), kw?.free);

// ── 24. MAKE IT UP AS I GO ON FREE ──────────────────────────────────────
console.log("\nTEST 24 - Make it up as I go on Free says why");
person({ tier: "free" });
const { router } = await import(B + "router.js");
window.router = router;
router.redirectReason = "capture";
const U24 = U;
const up24 = U24.render();
ok("24a. the page says why it is here", /Make it up as I go is part of the Plan/.test(up24) && /Log what I did/.test(up24));
router.redirectReason = null;
ok("24b. and not when reached otherwise", !/Make it up as I go is part of the Plan/.test(U24.render()));

// ── 25. SCREEN NAMES ────────────────────────────────────────────────────
console.log("\nTEST 25 - Mindful awareness, Back to Wellbeing");
ok("25a. no \"Mindful Movement\" on screen", !/Mindful Movement/.test(code("js/views/quiet-session.js")));
ok("25b. no \"Back to Noticing\"", !/Back to Noticing/.test(code("js/views/breathing-session.js")));

// ── 26. HEART AND LUNGS ─────────────────────────────────────────────────
console.log("\nTEST 26 - heart and lungs");
const SR = await import(B + "data/session-rationale.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const pickEx = id => ({ ...EXERCISES.find(e => e.id === id), section: "main" });
person();
const r26 = SR.buildRationale({ exercises: ["seated-shoulder-rolls-warmup", "seated-scapular-retraction", "seated-side-bend"].map(pickEx) });
ok("26a. not from Seated Shoulder Rolls", !/heart and lungs/.test(r26.opening), r26.opening);

// ── 27. "TELL ME WHY YOU'VE BEEN AWAY" ─────────────────────────────────
console.log("\nTEST 27 - nowhere to answer");
ok("27a. no opener asks to be told why they were away", !/tell me why you.ve been away/i.test(code("js/data/checkin-openings.js")));

// ── 28. RESTORE ─────────────────────────────────────────────────────────
console.log("\nTEST 28 - restore says what came across");
const RS = await import(B + "data/restore.js");
ok("28a. the confirmation: the Plan does not come with a file", /does not come with the file/.test(RS.confirmMessage({}, true)) && !/stay as they are on this phone: your plan/.test(RS.confirmMessage({}, true)));
ok("28b. a Plan file onto Free: said", /on this phone you are on Free/.test(RS.restoredMessage({ healthCameAcross: true, planLeft: true })));
ok("28c. getting started's restore says the result before Home", /onRestored: r =>[\s\S]{0,400}restoredMessage\(r\)/.test(code("js/views/onboarding/thread.js")));

console.log(`\nTRUE-WORDS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
