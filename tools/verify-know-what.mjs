/**
 * tools/verify-know-what.mjs
 * 03 Oct 2026 v5
 *
 * v5 - W5-11 USUAL-LENGTH. 2b: the length chosen is today's
 *   (availableTimeToday), not the usual (availableTime is left as it was).
 *
 * 02 Oct 2026 v4
 *
 * v4 - W4-20. 1e: the sentence says back what was asked, and when the plan's
 *   length differs by more than five minutes it says the plan's own (This
 *   one comes to about N minutes), which must match the plan. The builder's
 *   length varies, so the old exact match failed one run in five. Stricter,
 *   not looser: the length is now checked against the plan.
 *
 * 30 Sep 2026 v3
 *
 * v3 - W3-21 NAV-SMALL. Where? is handed to the plan (requestedLocation,
 *   read once), not written as the default. 2b reads the plan's Where.
 *
 * v2 - Work list 2e. The time windows are read from data/time-windows.js,
 *   where they now live; the old engine that held them is deleted. No
 *   assertion changed.
 *
 * SMOOTH-P3b. "I know what I want". Spec 4.6.
 *
 * Measured on v549: the door did not exist. The nearest thing was the
 * Quick build room (time chips, then a scaffold of four "Change" rows),
 * and saying "strength, 40 minutes, at the gym" took the builder's whole
 * type -> zone -> duration -> location -> kit walk.
 *
 * Driven through the real Home, the real KnowWhatView and the real plan
 * (CoachProposalView and the real builder).
 */
import { createRequire as __cr } from "node:module";
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
const { TodayView } = await import(B + "views/today.js");
const KW = await import(B + "views/know-what.js");
const { CoachProposalView } = await import(B + "views/coach-proposal.js");
const { AVAILABLE_TIME_WINDOW_MINUTES } = await import(B + "data/time-windows.js");
const { getActiveConditionIds, getExerciseSafetyTier } = await import(B + "data/conditions.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
const gate = await import(B + "safety-gate.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const click = el => el?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

const FULL_GYM = ["dumbbells-light", "dumbbells-medium", "dumbbells-heavy", "barbell", "bench-flat",
  "bench-adjustable", "pull-up-bar", "kettlebell-medium", "band-medium", "gym-membership"];

let navs = [];
let taps = 0;
const router = { history: ["somewhere"], navigate(v) { navs.push(v); paint(v); }, back() {} };
function paint(v) {
  main.innerHTML = "";
  if (v === "know-what") KW.KnowWhatView(router).mount(main);
  if (v === "coach-proposal") CoachProposalView(router).mount(main);
}
const tap = el => { if (el) taps++; click(el); return !!el; };
/** Choosing a radio or checkbox is one tap: check it and let change bubble. */
const choose = input => {
  if (!input) return false;
  taps++;
  input.checked = input.type === "checkbox" ? !input.checked : true;
  input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  return true;
};
const submit = () => { taps++; main.querySelector(".kw-form")?.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); };

function fixture({ time = "standard", conditions = [], scores = {}, saved = 0, location } = {}) {
  localStorage.clear(); store.init();
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", "personal");
  store.set("gymEquipment", FULL_GYM); store.set("homeEquipment", []);
  store.set("equipment", FULL_GYM);
  store.set("availableTime", time);
  store.set("conditions", conditions); store.set("conditionPainScores", scores);
  if (location) store.set("sessionLocation", location);
  store.set("savedSessions", Array.from({ length: saved }, (_, i) => ({ id: `s${i}`, name: `Mine ${i}`, exerciseIds: [EXERCISES[i].id], createdAt: new Date().toISOString() })));
  navs = []; taps = 0;
}
function fromHome() {
  main.innerHTML = "";
  TodayView(router).mount(main);
  navs = []; taps = 0;
  tap(main.querySelector('[data-action="know-what"]'));
}
const kindInput = id => main.querySelector(`input[name="kind"][value="${id}"]`);

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - Home's second door opens this screen");
fixture(); fromHome();
ok("0a. one tap from Home", navs[0] === "know-what" && !!main.querySelector(".kw-view"), JSON.stringify(navs));
ok("0b. six kinds, in the spec's order", [...main.querySelectorAll('input[name="kind"]')].map(i => txt(i.parentElement)).join(" | ") ===
   "Strength | Cardio | Core | Mobility | Stretch | Yoga & Pilates");
ok("0c. no kind chosen for them", !main.querySelector('input[name="kind"]:checked'));

// ── 1. THREE TAPS TO THE PLAN ───────────────────────────────────────────
console.log("\nTEST 1 - Home, Strength, Show me the plan: three taps to a plan");
fixture({ location: "gym" }); fromHome();
choose(kindInput("strength"));
ok("1a. Strength asks which part, Full body already chosen", !!main.querySelector("#kw-part") &&
   main.querySelector('input[name="part"]:checked')?.value === "full");
ok("1b. the length they last picked is chosen, and it says so", main.querySelector('input[name="length"]:checked')?.value === "40" &&
   /Last time you picked 40/.test(txt(main)));
ok("1c. where they last trained is chosen", main.querySelector('input[name="place"]:checked')?.value === "gym");
submit();
ok("1d. on to the plan in three taps", navs.at(-1) === "coach-proposal" && taps === 3, `${taps} taps, ${JSON.stringify(navs)}`);
const sentence = txt(main.querySelector(".cp-plan__sentence"));
// W4-20: when the plan's own length differs by more than five minutes it
// is said too ("This one comes to about N minutes."), and N is the plan's.
const planTotal = Number((txt(main).match(/About (\d+) min/) || [])[1]);
const said = (sentence.match(/^You asked for strength, full body, 40 minutes\.(?: This one comes to about (\d+) minutes\.)?$/) || []);
ok("1e. the plan says back what was asked, and any length it adds is the plan's own",
   said.length > 0 && (said[1] === undefined ? Math.abs(planTotal - 40) <= 5 : Math.abs(Number(said[1]) - planTotal) <= 5), `${sentence} | About ${planTotal}`);
ok("1f. and it is a full-body plan", /Full Body/.test(txt(main.querySelector(".cp-plan, .cp-preview, #main-content"))));
ok("1g. no energy or mood question on the way", !navs.includes("checkin") && !navs.includes("checkin-mini"));

// ── 2. CHANGING THE ANSWERS ─────────────────────────────────────────────
console.log("\nTEST 2 - every answer reaches the plan");
fixture({ time: null }); fromHome();
choose(kindInput("strength"));
choose(main.querySelector('input[name="part"][value="upper"]'));
choose(main.querySelector('input[name="length"][value="20"]'));
choose(main.querySelector('input[name="place"][value="home"]'));
submit();
ok("2b. upper body, 20 minutes, at home", store.get("requestedSessionType") === "upper" && store.get("availableTimeToday")?.cat === "quick" && store.get("availableTime") !== "quick" &&
   /home/i.test(txt(main.querySelector("#cp-loc"))) && store.get("requestedLocation") == null && txt(main.querySelector(".cp-plan__sentence")) === "You asked for strength, upper body, 20 minutes.",
   txt(main.querySelector(".cp-plan__sentence")));
fixture({ time: null }); fromHome();
ok("2c. REVERSAL: nothing picked before -- 30 chosen, no \"Last time\" line", main.querySelector('input[name="length"]:checked')?.value === "30" &&
   !/Last time/.test(txt(main)));
choose(kindInput("core")); submit();
ok("2d. Core goes straight to a core plan, no part asked", store.get("requestedSessionType") === "core" &&
   txt(main.querySelector(".cp-plan__sentence")) === "You asked for core, 30 minutes.", txt(main.querySelector(".cp-plan__sentence")));

// ── 3. ONLY LENGTHS THE BUILDER BUILDS ──────────────────────────────────
console.log("\nTEST 3 - every length offered is one the builder builds");
ok("3a. each offered length is the builder's own minutes for its category",
   KW.LENGTHS.every(l => AVAILABLE_TIME_WINDOW_MINUTES[l.cat] === l.mins), JSON.stringify(KW.LENGTHS));
fixture({ time: "long" }); fromHome();
ok("3b. a length not offered here (50) is not claimed as their pick", !/Last time/.test(txt(main)) &&
   !!main.querySelector('input[name="length"]:checked'));

// ── 4. SORE: THE CHECK-IN'S OWN WRITES ──────────────────────────────────
console.log("\nTEST 4 - the sore answer writes what the check-in writes, and excludes the same");
fixture({ conditions: ["knee"], scores: {} }); fromHome();
choose(kindInput("strength"));
choose(main.querySelector('input[name="sore"][value="knee"]'));
ok("4a. their own area is offered first, and naming it asks how sore", txt(main.querySelector("#kw-sore .kw-chip:nth-of-type(2)")) === "Knee" &&
   !!main.querySelector("#kw-how-knee"));
ok("4b. with the same three answers the check-in gives", [...main.querySelectorAll('input[name="how-knee"]')].map(i => `${txt(i.parentElement)}=${i.value}`).join(",") ===
   "A little=4,Quite sore=6,Bad=8");
ok("4c. the stop line is there once something is named", /doesn't feel right, stop/.test(txt(main)));
submit();
ok("4d. how sore is not skipped: it says so, in an alert, and focus goes there", /how sore your knee is/i.test(txt(main.querySelector("#kw-error"))) &&
   main.querySelector("#kw-error")?.getAttribute("role") === "alert" && document.activeElement?.name === "how-knee" && navs.at(-1) !== "coach-proposal");
choose(main.querySelector('input[name="how-knee"][value="6"]'));
const more = main.querySelector("#kw-sore-more");
more.value = "ankle-foot"; more.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
choose(main.querySelector('input[name="how-ankle-foot"][value="4"]'));
submit();
ok("4e. today's scores are exactly what was said", JSON.stringify(store.get("conditionPainScores")) === JSON.stringify({ knee: 6, "ankle-foot": 4 }),
   JSON.stringify(store.get("conditionPainScores")));
ok("4f. a new area joins their list, as the check-in's does", (store.get("conditions") || []).includes("ankle-foot") &&
   store.get("conditionMeta")?.["ankle-foot"]?.source === "checkin");
const active = getActiveConditionIds(store.get("conditions"), store.get("conditionPainScores"));
const byId = new Map(EXERCISES.map(e => [e.id, e]));
const planned = [...main.querySelectorAll("[data-exercise-id]")].map(r => byId.get(r.dataset.exerciseId)).filter(Boolean);
const avoided = planned.filter(ex => getExerciseSafetyTier(ex, active) === "avoid");
ok("4g. and the plan holds nothing the knee answer rules out", planned.length > 0 && avoided.length === 0,
   `${planned.length} planned; avoid: ${avoided.map(e => e.name).join(", ")}`);
fixture({ conditions: ["knee"], scores: {} }); fromHome();
choose(kindInput("strength")); choose(main.querySelector('input[name="sore"][value="knee"]'));
choose(main.querySelector('input[name="how-knee"][value="8"]')); submit();
ok("4g2. Bad asks the severe-pain choice before any plan, as after a check-in", !main.querySelector(".cp-plan__row") && !!main.querySelector("[data-severe-choice=\"rest\"]") &&
   /knee/i.test(txt(main)) && store.get("conditionPainScores").knee === 8, txt(main).slice(0, 200));
fixture({ conditions: ["knee"], scores: { knee: 6 } }); fromHome();
choose(kindInput("core")); choose(main.querySelector('input[name="sore-none"]')); submit();
ok("4h. Nothing clears today's scores, as the check-in's Nothing does", JSON.stringify(store.get("conditionPainScores")) === "{}");
fixture({ conditions: ["knee"], scores: { knee: 6 } }); fromHome();
choose(kindInput("core")); submit();
ok("4i. REVERSAL: left unanswered, today's check-in answer stands", JSON.stringify(store.get("conditionPainScores")) === JSON.stringify({ knee: 6 }));

// ── 5. NOTHING CHOSEN ───────────────────────────────────────────────────
console.log("\nTEST 5 - Show me the plan with no kind says so");
fixture(); fromHome();
ok("5a. the button is never disabled", !main.querySelector("#kw-go")?.disabled);
submit();
ok("5b. an alert, focus on the kinds, and no plan", /Pick what you're after/.test(txt(main.querySelector("#kw-error"))) &&
   document.activeElement?.name === "kind" && navs.at(-1) === "know-what");

// ── 6. YOGA & PILATES ───────────────────────────────────────────────────
console.log("\nTEST 6 - Yoga & Pilates goes to the yoga session");
fixture(); fromHome();
choose(kindInput("yoga"));
ok("6a. the other questions step aside and the button says where it goes", !main.querySelector("#kw-length") &&
   /Go to yoga & Pilates/.test(txt(main.querySelector("#kw-go"))));
submit();
ok("6b. the yoga session", navs.at(-1) === "yoga-session" && store.get("requestedSessionType") == null);

// ── 7. NOTHING LEFT BEHIND ──────────────────────────────────────────────
console.log("\nTEST 7 - what left Plan Home is here");
fixture({ saved: 3 }); fromHome();
const savedBtn = main.querySelector('[data-kw-route="saved-sessions"]');
ok("7a. saved sessions, counted", /Or one you saved \(3\)/.test(txt(savedBtn)));
fixture({ saved: 0 }); fromHome();
ok("7b. REVERSAL: none saved, no empty promise", !main.querySelector('[data-kw-route="saved-sessions"]'));
for (const [label, route] of [["Build your own, move by move", "session-builder"], ["Mobility & Conditioning", "mobility-conditioning"],
                              ["A twelve-week shape", "goal-setup"]]) {
  fixture(); fromHome(); navs = [];
  click([...main.querySelectorAll("[data-kw-route]")].find(b => txt(b) === label));
  ok(`7c. ${label}`, navs[0] === route, JSON.stringify(navs));
}

// ── 8. TELL ME WHAT TO DO MEANS THE COACH DECIDES ───────────────────────
console.log("\nTEST 8 - a request made here does not ride into Tell me what to do");
fixture(); fromHome(); choose(kindInput("cardio")); submit();
ok("8pc. positive control: the request was made", store.get("requestedSessionType") === "cardio");
const key = new Date().toISOString().split("T")[0];
store.set("checkinHistory", { [key]: { energy: 6, mood: 6, date: new Date().toDateString() } });
store.set("lastCheckin", { energy: 6, mood: 6, date: new Date().toDateString(), timestamp: new Date().toISOString() });
main.innerHTML = ""; TodayView(router).mount(main); navs = [];
click(main.querySelector('[data-action="start-today"]'));
ok("8a. Tell me what to do clears it", navs[0] === "coach-proposal" && store.get("requestedSessionType") === null);

console.log("");
if (fails) { console.log(`KNOW-WHAT: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`KNOW-WHAT: all ${passes} assertions pass\n`);
process.exit(0);
