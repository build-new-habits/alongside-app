/**
 * tools/verify-true-words.mjs
 * 02 Oct 2026 v1
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
ok("3b. control: legs ready, it still names them", /carrying/.test(OTD.generateIntentAck("maintain", { legsLoadable: true })));

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

console.log(`\nTRUE-WORDS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
