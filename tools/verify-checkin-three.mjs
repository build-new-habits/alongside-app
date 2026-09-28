/**
 * tools/verify-checkin-three.mjs
 * 28 Sep 2026 v2
 *
 * v2 - FEELINGS-RETIRE. data/feelings.js is deleted; the word list 2a
 *   looks for is kept in this file. No assertion changed.
 *
 * 28 Sep 2026 v1
 *
 * SMOOTH-P1. The check-in is three questions, one tap each.
 *
 * Graeme, 27 Sep, after the prototype: "3 questions in that style is
 * perfect. Forget the word selection." Spec §4.2.
 *
 * Measured on v540: the coach route asked energy (slider + Next),
 * mood (slider + Next), a feeling word, sleep hours and quality, what
 * today is for and what would help -- behind an "I'm ready" opener and a
 * "See what I'm thinking" button. Both sliders started at 5, and 5
 * counted as low (F3).
 *
 * Walks the REAL conversation in CheckinView and asserts on what a
 * person taps and what is stored -- not on source text.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = (q) => ({ matches: /prefers-reduced-motion/.test(q), media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
for (const [k, v] of [["requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0)],
                      ["cancelAnimationFrame", (id) => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { CheckinView } = await import(B + "views/checkin.js");
const { checkinData, getQuadrant } = await import(B + "data/checkin.js");
// FEELINGS-RETIRE: data/feelings.js is deleted. The fifty words its sets
// held, kept here so this check still has something to look for.
const RETIRED_WORDS = ["energised","motivated","excited","alive","confident","ready","good","happy","strong","focused","capable","inspired","purposeful","joyful","tense","frustrated","anxious","overwhelmed","restless","irritable","stressed","wired","scattered","trapped","calm","content","settled","soft","grateful","restored","okay","peaceful","relaxed","grounded","drained","flat","heavy","sad","lonely","defeated","tired","foggy","low","exhausted","empty","numb","depleted","hopeless","desperate","worthless"];
const { SAFETY_LINE } = await import(B + "data/purpose.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const wait = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(fn, ms = 2500) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = fn(); if (v) return v; await wait(15); }
  return null;
}

// Every control a person could tap inside the conversation, wherever the
// view puts it (inline chips or a bottom panel).
const tappables = () => [...document.querySelectorAll("#app button, .ci-panel button")]
  .filter(b => !b.disabled && !b.closest("[hidden]"));
const labelsNow = () => tappables().map(b => b.textContent.trim().replace(/\s+/g, " "));
const threadText = () => (document.getElementById("app")?.textContent || "").replace(/\s+/g, " ");

function setup({ tier = "personal", conditions = [], prescribed = false, pending = "coach-proposal" } = {}) {
  localStorage.clear(); store.init();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", tier);
  store.set("conditions", conditions);
  if (prescribed) store.set("prescribedExercises", [{ id: "x", name: "Physio move" }]);
  store.set("pendingDoorRoute", pending);
  document.querySelectorAll(".ci-panel, .ci-overlay").forEach(n => n.remove());
  const app = document.getElementById("app"); app.innerHTML = "";
  const navs = [];
  const view = CheckinView({ navigate: v => navs.push(v), back() {} });
  view.mount(app);
  return { navs, view };
}

// Tap the control whose label matches; returns the label tapped.
async function tap(re) {
  const b = await waitFor(() => tappables().find(x => re.test(x.textContent.trim())));
  if (!b) return null;
  const label = b.textContent.trim();
  b.click();
  await wait(30);
  return label;
}

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the fixture reaches the first question");
let { navs } = setup({ conditions: ["lower-back"] });
const firstChoices = await waitFor(() => labelsNow().some(l => /^Okay$/i.test(l)) && labelsNow());
ok("0b. the coach speaks first: a coach line is in the thread before any answer",
   !!document.querySelector("#app .ci-bubble") &&
   (() => { const first = document.querySelector("#app .ci-bubble"), chips = document.querySelector("#app .ci-chips");
            return !!chips && !!(first.compareDocumentPosition(chips) & window.Node.DOCUMENT_POSITION_FOLLOWING); })());
ok("0a. the energy question appears with its five answers",
   !!firstChoices && ["Running on empty", "Low", "Okay", "Good", "Full of it"].every(l => firstChoices.includes(l)),
   `controls on screen: ${JSON.stringify(labelsNow())}`);

// ── 1. THREE TAPS ───────────────────────────────────────────────────────
console.log("\nTEST 1 - three taps from the first question to the plan");
ok("1a. no opener to tap first (\"I'm ready\" is gone)", !labelsNow().some(l => /i'?m ready/i.test(l)));
ok("1b. nothing is pre-selected", !document.querySelector('#app [aria-pressed="true"], #app .selected'));
let taps = 0;
if (await tap(/^Okay$/)) taps++;
if (await tap(/^Pretty good$/)) taps++;
if (await tap(/^Nothing today$/)) taps++;
await waitFor(() => navs.length > 0, 4000);
ok("1c. the third answer goes straight on to the plan", navs[0] === "coach-proposal",
   `navigated: ${JSON.stringify(navs)}; controls left: ${JSON.stringify(labelsNow())}`);
ok("1d. exactly three taps", taps === 3 && navs.length === 1, `taps ${taps}`);
const saved = checkinData.getTodaysCheckin() || {};
ok("1e. the answers are stored on the scale the engine reads",
   saved.energy === 6 && saved.mood === 7, JSON.stringify({ energy: saved.energy, mood: saved.mood }));

// ── 2. WHAT IS NO LONGER ASKED ──────────────────────────────────────────
console.log("\nTEST 2 - no feeling word, no purpose questions, sleep only if offered");
const allWords = RETIRED_WORDS;
const shown = threadText().toLowerCase();
ok("2a. no feeling-word question was asked", !/is there a word/i.test(shown) &&
   !allWords.some(w => new RegExp(`\\b${w}\\b`).test(labelsNow().join(" ").toLowerCase())));
ok("2b. no \"What's today for\" and no \"What would help\"", !/what's today for|what would help/i.test(shown));
ok("2c. sleep was not required, and is not recorded when not given",
   !/how (long )?did you sleep/i.test(shown) && (saved.sleepQuality == null));

// ── 3. THE MAPPING KEEPS EVERY THRESHOLD ON ITS SIDE ────────────────────
console.log("\nTEST 3 - each answer lands where the engine's thresholds expect");
const E = { "Running on empty": "low", "Low": "low", "Okay": "moderate", "Good": "high", "Full of it": "high" };
for (const [label, want] of Object.entries(E)) {
  ({ navs } = setup());
  await tap(new RegExp(`^${label}$`)); await tap(/^Okay$/); await tap(/^Nothing today$/);
  await waitFor(() => navs.length > 0, 4000);
  const c = checkinData.getTodaysCheckin() || {};
  ok(`3. energy "${label}" -> ${want} intensity`, checkinData.getSuggestedIntensity(c) === want,
     `stored energy ${c.energy} -> ${checkinData.getSuggestedIntensity(c)}`);
}
ok("3f. F3: \"Okay\" and \"Okay\" is not the low-low quadrant", getQuadrant(6, 6) !== "low-energy-unpleasant");

// ── 4. SORE: HOW BAD, AND THE SAFETY LINE ───────────────────────────────
console.log("\nTEST 4 - a sore area asks how bad, keeps the safety rules, and says the safety line");
({ navs } = setup({ conditions: ["lower-back"] }));
await tap(/^Okay$/); await tap(/^Okay$/);
const soreLabels = await waitFor(() => labelsNow().some(l => /Nothing today/.test(l)) && labelsNow());
ok("4a. the condition they told us about comes first", soreLabels && /lower back/i.test(soreLabels[0]),
   JSON.stringify(soreLabels));
ok("4b. with a note saying why", /because it's the one you've told me about/i.test(threadText()));
await tap(/^Lower Back$/i);
const howBad = await waitFor(() => labelsNow().includes("Bad") && labelsNow());
ok("4c. then one \"how bad\" question", !!howBad && ["A little", "Quite sore", "Bad"].every(l => howBad.includes(l)),
   JSON.stringify(labelsNow()));
await tap(/^Bad$/);
await waitFor(() => threadText().includes(SAFETY_LINE.slice(0, 20)));
ok("4d. the clinical safety line is said (CL-4)", threadText().includes(SAFETY_LINE));
await tap(/^That's it$/);
await waitFor(() => navs.length > 0, 4000);
const scores = store.get("conditionPainScores") || {};
ok("4e. \"Bad\" is stored in the severe band the safety rules read", (scores["lower-back"] ?? 0) >= 8,
   JSON.stringify(scores));
ok("4f. and the check-in still went on to the plan", navs[0] === "coach-proposal");

({ navs } = setup({ conditions: ["lower-back"] }));
await tap(/^Okay$/); await tap(/^Okay$/); await tap(/^Nothing today$/);
await waitFor(() => navs.length > 0, 4000);
ok("4g. REVERSAL: \"Nothing today\" records the listed condition as quiet",
   ((store.get("conditionPainScores") || {})["lower-back"] ?? 0) === 0);

// ── 5. OPTIONAL SLEEP ───────────────────────────────────────────────────
console.log("\nTEST 5 - sleep can be added, never required");
({ navs } = setup());
await tap(/^Okay$/); await tap(/^Okay$/);
ok("5a. the sore question offers \"Add how you slept\"", !!(await waitFor(() => labelsNow().some(l => /how you slept/i.test(l)))));
await tap(/how you slept/i); await tap(/^Poor$/); await tap(/^Nothing today$/);
await waitFor(() => navs.length > 0, 4000);
ok("5b. a given answer is stored", (checkinData.getTodaysCheckin() || {}).sleepQuality === "poor");

// ── 6. PRESCRIBED EXERCISES ─────────────────────────────────────────────
console.log("\nTEST 6 - someone with prescribed exercises still gets that choice");
({ navs } = setup({ prescribed: true }));
await tap(/^Okay$/); await tap(/^Okay$/); await tap(/^Nothing today$/);
const pres = await waitFor(() => labelsNow().some(l => /prescribed/i.test(l)));
ok("6a. the prescribed option is offered", !!pres && navs.length === 0, JSON.stringify(labelsNow()));

console.log("");
if (fails) { console.log(`CHECKIN-THREE: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`CHECKIN-THREE: all ${passes} assertions pass\n`);
process.exit(0);
