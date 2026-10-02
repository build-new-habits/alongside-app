/**
 * tools/verify-severe-true.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W5-2 BAD-DAY-DOORS (Wave 5 trace: 2.12, 2.14). TEST 6: Yoga and
 *   Classes ask the Bad-day choice first (Rest today / Something gentler),
 *   as Run and the coach do; no pose list, no class, no Start. At Quite
 *   sore, as before.
 *
 * W4-7 SEVERE-DAY-TRUE (Wave 4 persona trace: 2.1, 2.16).
 *
 * On a Bad day:
 *   - the builder said "You logged pain in your spine at 8 or above
 *     today". Nobody gives a number (the check-in offers three words), and
 *     "spine" is an internal zone name;
 *   - after Adapt and continue, the coach said "Your check-in flagged Lower
 *     Back as Severe today — I've kept things well clear of that area"
 *     (a word nobody chose, and "well clear" was taken off the Adapt
 *     button on the clinical reviewer's advice) and then "I'm not going to
 *     build you a session" above the gentle plan they had just chosen;
 *   - 10 minutes chosen gave "About 30 min · 3 movements";
 *   - after Rest today there was no way back to something gentle that day.
 *
 *   1. The builder's banner: the person's word and area, no number, no
 *      internal name.
 *   2. After Adapt on the coach's screen: no Severe, no well clear, no
 *      "not going to build"; the plan is the gentle one.
 *   3. The gentle plan fits the minutes chosen: 10, 20 and 30.
 *   4. After Rest today: Something gentle after all, which shows the
 *      gentle plan and a Start button.
 *   5. Controls: nothing sore builds an ordinary session; Quite sore is
 *      not a Bad day.
 */
import { createRequire as __cr } from "node:module";
import { agreed } from "./agreed.mjs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {}; globalThis.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
globalThis.requestAnimationFrame = cb => setTimeout(() => cb(0), 0);
dom.window.requestAnimationFrame = globalThis.requestAnimationFrame;
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const SB = await import(B + "session-builder.js");
const SBUI = await import(B + "views/session-builder-ui.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const gate = await import(B + "safety-gate.js");
const RF = await import(B + "data/red-flag.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const visible = el => !!el && !el.closest("[hidden]") && !el.disabled;
const startBtn = () => [...main.querySelectorAll("button")].find(b => /^Start\b/.test(txt(b)) && visible(b));

function fixture(conditions = [], scores = {}, time = "short") {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Jo"); store.set("tier", "free");
  store.set("equipment", []); store.set("homeEquipment", []);
  store.set("availableTime", time);
  store.set("conditions", conditions); store.set("conditionPainScores", scores);
  store.set("redFlag", { screenedAt: new Date().toISOString(), areas: conditions, textVersion: RF.RED_FLAG_VERSION, level: null, flaggedAt: null, clearedAt: null });
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
}
const UNTRUE = /\b\d+\s*(or above|out of|\/10)|\bspine\b|\bSevere\b|well clear|not going to build/i;

// ── 1. THE BUILDER'S BANNER ─────────────────────────────────────────────
console.log("\nTEST 1 - the builder's banner on a Bad day");
fixture(["lower-back"], { "lower-back": 8 });
main.innerHTML = SBUI.render();
const banner = txt(main);
ok("1pc. the gentle plan is shown", /changed|gentle/i.test(banner), banner.slice(0, 200));
ok("1a. no number, no internal name, no Severe", !UNTRUE.test(banner), banner.slice(0, 400));
ok("1b. the person's area and word", /lower back/i.test(banner) && /\bbad\b/i.test(banner), banner.slice(0, 400));

// ── 2. AFTER ADAPT ON THE COACH'S SCREEN ────────────────────────────────
console.log("\nTEST 2 - after Adapt and continue");
const router = { history: ["x"], navigate() {}, back() {} };
fixture(["lower-back"], { "lower-back": 8 });
main.innerHTML = ""; CoachProposalView(router).mount(main); await wait(30);
ok("2pc. the choice is asked first", !!main.querySelector('[data-severe-choice="adapt"]'), txt(main).slice(0, 160));
click(main.querySelector('[data-severe-choice="adapt"]')); await wait(30);
const after = txt(main);
ok("2a. no Severe, no well clear, no 'not going to build', no number", !UNTRUE.test(after), after.slice(0, 500));
ok("2b. the gentle plan, with a Start button", !!startBtn() && /breath/i.test(after), after.slice(0, 300));

// ── 3. THE MINUTES CHOSEN ───────────────────────────────────────────────
console.log("\nTEST 3 - the gentle plan fits the minutes chosen");
for (const mins of [10, 20, 30]) {
  fixture(["lower-back"], { "lower-back": 8 });
  const s = SB.buildSession({ sessionType: "full", durationMins: mins });
  const secs = (s?.exercises || []).reduce((n, e) => n + SB.exerciseSeconds(e), 0);
  ok(`3a. ${mins} minutes: the gentle plan totals ${mins} or less`, s?.gentleCare === true && secs <= mins * 60 && secs > 0, `${Math.round(secs / 60)} min`);
}
fixture(["lower-back"], { "lower-back": 8 }, "micro");
main.innerHTML = ""; CoachProposalView(router).mount(main); await wait(30);
click(main.querySelector('[data-severe-choice="adapt"]')); await wait(30);
const about = (txt(main).match(/About (\d+) min/) || [])[1];
ok("3b. the coach's plan says 10 minutes or less when 10 was chosen", about != null && Number(about) <= 10, `About ${about} min`);

// ── 4. AFTER REST TODAY ─────────────────────────────────────────────────
console.log("\nTEST 4 - after Rest today, something gentle is still there");
fixture(["lower-back"], { "lower-back": 8 });
main.innerHTML = ""; CoachProposalView(router).mount(main); await wait(30);
click(main.querySelector('[data-severe-choice="rest"]')); await wait(30);
ok("4pc. the rest screen", /resting is progress/i.test(txt(main)) && !startBtn(), txt(main).slice(0, 200));
const gentle = [...main.querySelectorAll("button")].find(b => /gentle after all/i.test(txt(b)));
ok("4a. Something gentle after all is offered", !!gentle, txt(main).slice(0, 300));
click(gentle); await wait(30);
ok("4b. it shows the gentle plan, with a Start button", !!startBtn() && /breath/i.test(txt(main)), txt(main).slice(0, 300));
ok("4c. and the choice is recorded", (store.get("severePainChoices") || []).at(-1)?.choice === "adapt", JSON.stringify((store.get("severePainChoices") || []).at(-1)));
main.innerHTML = ""; CoachProposalView(router).mount(main); await wait(30);
ok("4d. on coming back the same day, the gentle plan is still the answer (not the rest screen)", !!startBtn(), txt(main).slice(0, 200));

// ── 5. CONTROLS ─────────────────────────────────────────────────────────
console.log("\nTEST 5 - controls");
fixture([], {});
ok("5a. nothing sore: an ordinary session", !SB.buildSession({ sessionType: "full", durationMins: 30 })?.gentleCare);
fixture(["lower-back"], { "lower-back": 6 });
ok("5b. Quite sore is not a Bad day", !SB.buildSession({ sessionType: "full", durationMins: 30 })?.gentleCare);

// ── 6. YOGA AND CLASSES ─────────────────────────────────────────────────
console.log("\nTEST 6 - Yoga and Classes on a Bad day");
const YS = await import(B + "views/yoga-session.js");
const CL = await import(B + "views/class-list.js");
const noStart = () => ![...main.querySelectorAll("button")].some(b => /^Start\b/.test(txt(b)));
fixture(["lower-back"], { "lower-back": 8 });
main.innerHTML = YS.render(); YS.onMount();
ok("6a. Yoga: the Bad-day choice first", !!main.querySelector('[data-bad-day="rest"]') && !!main.querySelector('[data-bad-day="adapt"]'), txt(main).slice(0, 200));
ok("6b. Yoga: no pose list, no style choice, no Start", !main.querySelector("[data-target], [data-focus], [data-mins]") && noStart(), txt(main).slice(0, 200));
ok("6c. Yoga: in the person's words, nothing untrue", /lower back is bad today/i.test(txt(main)) && !UNTRUE.test(txt(main)), txt(main).slice(0, 200));
click(main.querySelector('[data-bad-day="rest"]')); await wait(60);
ok("6d. Yoga: Rest today is recorded as the coach records it", (store.get("severePainChoices") || []).at(-1)?.choice === "rest", JSON.stringify((store.get("severePainChoices") || []).at(-1)));
fixture(["lower-back"], { "lower-back": 8 });
main.innerHTML = CL.render(); CL.onMount();
ok("6e. Classes: the Bad-day choice first, no class to start", !!main.querySelector('[data-bad-day="adapt"]') && !main.querySelector("[data-start]") && noStart(), txt(main).slice(0, 200));
click(main.querySelector('[data-bad-day="adapt"]')); await wait(60);
ok("6f. Classes: Something gentler is recorded", (store.get("severePainChoices") || []).at(-1)?.choice === "adapt", JSON.stringify((store.get("severePainChoices") || []).at(-1)));
fixture(["lower-back"], { "lower-back": 6 });
main.innerHTML = YS.render();
ok("6g. Quite sore: Yoga opens as before", !main.querySelector("[data-bad-day]") && !!main.querySelector("[data-target]"), txt(main).slice(0, 160));
main.innerHTML = CL.render();
ok("6h. Quite sore: Classes as before", !main.querySelector("[data-bad-day]") && !!main.querySelector("[data-start]"), txt(main).slice(0, 160));

console.log(`\nSEVERE-TRUE: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
