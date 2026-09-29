/**
 * tools/verify-redflag.mjs
 * 29 Sep 2026 v3
 *
 * v3 - P0. 1d: fibromyalgia is retired; a scored id that is not a body area is never asked the spinal questions.
 *
 * 28 Sep 2026 v2
 *
 * v2 - SMOOTH-P3c. Twelve exercise routes: 'capture' (Make it up as I
 *   go) joins. 2a counts twelve and drives every one.
 *
 * RED-FLAG. The "before you start" safety screen and its hard stop,
 * built as approved (Graeme, 28 Sep: "Continue as if approved").
 *
 * Measured on v548: someone who says their lower back is sore could go
 * straight into a session. Nothing asked about the rare signs that need
 * a clinician before exercise. Clinical advice (CR-4): asking where it
 * hurts is already triage, and not screening afterwards is implicit
 * false reassurance.
 *
 * Driven through the REAL router (its guard) and the REAL view. The
 * locked 16 Aug design is asserted exactly: two levels, emergency is
 * question 1 = yes and only that, the unconditional emergency line in
 * both messages.
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
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const RF = await import(B + "data/red-flag.js");
const { RedFlagView } = await import(B + "views/red-flag.js");
const { router } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();

// The real navigate(), with mounting replaced: 'red-flag' mounts the real
// view; anything else is recorded as where the person landed.
let landed = [];
router._mountView = async name => {
  landed.push(name);
  if (name === "red-flag") { main.innerHTML = ""; RedFlagView(router).mount(main); }
};
const go = async r => { landed = []; await router.navigate(r); return landed.at(-1); };

function fixture({ conditions = [], scores = {} } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("tier", "personal");
  store.set("conditions", conditions); store.set("conditionPainScores", scores);
  RF.takePendingRoute();
  router.currentView = "today"; router.history = [];
}
async function answer(a) {
  for (const [q, v] of Object.entries(a)) {
    const input = main.querySelector(`input[name="${q}"][value="${v}"]`);
    if (input) { input.checked = true; input.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }
  }
  landed = [];
  main.querySelector(".rf-form")?.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 30));
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the screen is reached through the real router");
fixture({ conditions: ["lower-back"] });
ok("0a. a sore lower back, starting a session, lands on the screen first", await go("workout") === "red-flag", JSON.stringify(landed));
ok("0b. with three questions, nothing preselected", main.querySelectorAll("fieldset.rf-q").length === 3 && !main.querySelector("input:checked"));

// ── 1. WHO IS ASKED ─────────────────────────────────────────────────────
console.log("\nTEST 1 - only people who report pain are asked");
fixture();
ok("1a. nothing sore: straight into the session", await go("workout") === "workout");
fixture({ conditions: ["anxiety", "perimenopause"] });
ok("1b. a listed condition that is not pain: straight in", await go("workout") === "workout");
fixture({ scores: { knee: 4 } });
ok("1c. a sore knee in today's check-in: asked", await go("workout") === "red-flag");
fixture({ conditions: [], scores: { "cardiovascular-condition": 8 } });
ok("1d. P0: a scored id that is not a body area is never asked the spinal questions", await go("workout") !== "red-flag");

// ── 2. EVERY EXERCISE ROUTE, AND ONLY THOSE ─────────────────────────────
console.log("\nTEST 2 - every way into exercise goes through it; breathing does not");
const missed = [];
for (const r of RF.EXERTIONAL_ROUTES) { fixture({ conditions: ["lower-back"] }); if (await go(r) !== "red-flag") missed.push(r); }
ok("2a. all twelve exercise routes are guarded", RF.EXERTIONAL_ROUTES.size === 12 && RF.EXERTIONAL_ROUTES.has("capture") && missed.length === 0, missed.join(", "));
for (const r of ["quiet-session", "breathing-session", "practices", "noticing", "journal-entry"]) {
  fixture({ conditions: ["lower-back"] });
  ok(`2b. ${r} is not exercise and is never stopped`, await go(r) === r);
}

// ── 3. ALL NO: ON TO WHERE THEY WERE GOING ──────────────────────────────
console.log("\nTEST 3 - three No answers go straight on, and are not asked again");
fixture({ conditions: ["lower-back"] });
await go("workout");
await answer({ q1: "no", q2: "no", q3: "no" });
ok("3a. on to the session they chose", landed.includes("workout"), JSON.stringify(landed));
ok("3b. nothing flagged", RF.redFlagStop() === null && store.get("redFlag").level === null);
ok("3c. not asked again next time", await go("workout") === "workout");

// ── 4. EMERGENCY ────────────────────────────────────────────────────────
console.log("\nTEST 4 - question 1 yes: stop, A&E now, 999");
fixture({ conditions: ["lower-back"] });
await go("workout");
await answer({ q1: "yes", q2: "no", q3: "no" });
ok("4a. emergency level recorded", RF.redFlagStop() === "emergency");
ok("4b. the stop says A&E now, and 999 if they cannot get there", /A&E now/.test(txt(main)) && /999/.test(txt(main)) &&
   main.querySelector('a[href="tel:999"]'), txt(main).slice(0, 200));
ok("4c. the unconditional emergency line is there", txt(main).includes(RF.RED_FLAG_ALWAYS));
ok("4d. focus is on the heading", document.activeElement?.id === "rf-title");
ok("4e. exercise stays stopped", await go("workout") === "red-flag" && await go("class-player") === "red-flag");
ok("4f. breathing and Wellbeing stay open", await go("breathing-session") === "breathing-session" && await go("noticing") === "noticing");

// ── 5. ADVICE ───────────────────────────────────────────────────────────
console.log("\nTEST 5 - any other yes, or any not sure: stop, NHS 111");
for (const [label, a] of [["q2 yes", { q1: "no", q2: "yes", q3: "no" }], ["q3 not sure", { q1: "no", q2: "no", q3: "unsure" }],
                          ["q1 not sure", { q1: "unsure", q2: "no", q3: "no" }]]) {
  fixture({ conditions: ["lower-back"] });
  await go("workout");
  await answer(a);
  ok(`5. ${label}: advice (NHS 111), not emergency`, RF.redFlagStop() === "advice" && /NHS 111/.test(txt(main)) &&
     !!main.querySelector('a[href="tel:111"]') && txt(main).includes(RF.RED_FLAG_ALWAYS), txt(main).slice(0, 160));
}
ok("5r. REVERSAL: the level rule itself, both ways", RF.levelFor({ q1: "yes", q2: "no", q3: "no" }) === "emergency" &&
   RF.levelFor({ q1: "unsure", q2: "no", q3: "no" }) === "advice" && RF.levelFor({ q1: "no", q2: "no", q3: "no" }) === null);

// ── 6. CLEARING ─────────────────────────────────────────────────────────
console.log("\nTEST 6 - cleared only by confirming they have been checked");
fixture({ conditions: ["lower-back"] });
await go("workout");
await answer({ q1: "no", q2: "yes", q3: "no" });
landed = [];
main.querySelector("#rf-clear-btn")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await new Promise(r => setTimeout(r, 20));
ok("6a. without the confirmation, nothing clears and it says why", RF.redFlagStop() === "advice" &&
   /confirm/i.test(txt(main.querySelector("#rf-clear-error"))) && main.querySelector("#rf-clear-error")?.getAttribute("role") === "alert");
const box = main.querySelector("#rf-clear-box");
box.checked = true; box.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
main.querySelector("#rf-clear-btn")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await new Promise(r => setTimeout(r, 30));
ok("6b. confirmed: cleared, dated, and on to the session", RF.redFlagStop() === null && !!store.get("redFlag").clearedAt && landed.includes("workout"),
   JSON.stringify({ rf: store.get("redFlag"), landed }));

// ── 7. ASKED AGAIN ──────────────────────────────────────────────────────
console.log("\nTEST 7 - asked again for a new sore area, after 30 days, or new wording");
fixture({ conditions: ["lower-back"] });
await go("workout"); await answer({ q1: "no", q2: "no", q3: "no" });
store.set("conditionPainScores", { shoulder: 3 });
ok("7a. a NEW sore area asks again", RF.redFlagDue() === true);
store.set("conditionPainScores", {});
ok("7b. REVERSAL: the same areas do not", RF.redFlagDue() === false);
ok("7c. 31 days later it asks again", RF.redFlagDue(Date.now() + 31 * 86400000) === true);
store.set("redFlag", { ...store.get("redFlag"), textVersion: "old" });
ok("7d. new wording asks again", RF.redFlagDue() === true);

// ── 8. WHAT IS KEPT ─────────────────────────────────────────────────────
console.log("\nTEST 8 - the level is kept; the answers are not");
fixture({ conditions: ["lower-back"] });
await go("workout"); await answer({ q1: "yes", q2: "unsure", q3: "no" });
const raw = localStorage.getItem("alongside_user") || JSON.stringify(store.get("redFlag"));
ok("8a. no answer is stored anywhere", !/"q1"|"q2"|"q3"/.test(raw) && !("answers" in store.get("redFlag")));
ok("8b. what was asked is recorded (wording version)", store.get("redFlag").textVersion === RF.RED_FLAG_VERSION);

// ── 9. AN UNANSWERED QUESTION ───────────────────────────────────────────
console.log("\nTEST 9 - an unanswered question is said, not silently skipped");
fixture({ conditions: ["lower-back"] });
await go("workout");
await answer({ q1: "no", q3: "no" });
ok("9a. nothing recorded, still on the screen", !store.get("redFlag").screenedAt && !landed.includes("workout"));
ok("9b. it says so, in an alert, and focus goes to the unanswered one", /answer each question/i.test(txt(main.querySelector("#rf-error"))) &&
   document.activeElement?.name === "q2");
ok("9c. Continue is never disabled", !main.querySelector("#rf-continue")?.disabled);

console.log("");
if (fails) { console.log(`RED-FLAG: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`RED-FLAG: all ${passes} assertions pass\n`);
process.exit(0);
