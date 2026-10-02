/**
 * tools/verify-wellbeing-suggest.mjs
 * 02 Oct 2026 v2
 *
 * v2 - W4-1 GATE-OPEN. The fixture person has agreed (tools/agreed.mjs): the
 *   app now sends anybody who has not back to onboarding. No assertion
 *   changed.
 *
 * SMOOTH-P4b. Wellbeing. Spec 4.9.
 *
 * Measured on v552: Wellbeing opened on "Good to see you" and a list;
 * nothing was suggested, so every visit began with a choice. Starting a
 * breathing practice took three taps (Breathing, a type, a length). The
 * journal's privacy was true and said nowhere a writer would see it.
 *
 * Driven through the real Wellbeing view, the real router and the real
 * breathing session. The absolute rule is asserted directly: the
 * suggestion reads today's check-in and NOTHING from the journal -- the
 * gate fills the journal with words a monitoring system would react to
 * and requires the suggestion to be byte-identical.
 */
import { agreed } from "./agreed.mjs";
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><div id="app"><div id="main-content"></div></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage", "HTMLElement", "Node", "CustomEvent", "Event", "MouseEvent", "KeyboardEvent"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });
dom.window.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
dom.window.scrollTo = () => {};
for (const [k, v] of [["requestAnimationFrame", cb => setTimeout(() => cb(Date.now()), 0)], ["cancelAnimationFrame", id => clearTimeout(id)]]) {
  dom.window[k] = v; Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.history = dom.window.history;
globalThis.location = dom.window.location;

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { HURT_AND_ACHE_VERSION } = await import(B + "exercise-card.js");
const W = await import(B + "views/noticing.js");
const BS = await import(B + "views/breathing-session.js");
const { JournalEntryView } = await import(B + "views/journal-entry.js").then(m => ({ JournalEntryView: m.JournalEntryView || Object.values(m).find(v => typeof v === "function") }));
const { router } = await import(B + "router.js");

let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const main = document.getElementById("main-content");
const txt = el => (el?.textContent || "").replace(/\s+/g, " ").trim();
const wait = ms => new Promise(r => setTimeout(r, ms));

let path = [];
router._mountView = async name => {
  path.push(name);
  main.innerHTML = "";
  if (name === "noticing") { main.innerHTML = W.render(); W.onMount(); }
  if (name === "breathing-session") { main.innerHTML = BS.render(); BS.onMount(); }
};

function fixture({ checkin = null, journal = [] } = {}) {
  BS.onUnmount?.();
  localStorage.clear(); store.init(); agreed(store);
  store.set("onboardingComplete", true); store.set("tier", "personal"); store.set("name", "Test");
  store.set("safetyAckLog", Array.from({ length: 5 }, () => ({ at: new Date().toISOString(), textVersion: HURT_AND_ACHE_VERSION, surface: "fixture" })));
  if (checkin) store.set("checkinHistory", { [new Date().toISOString().split("T")[0]]: checkin });
  store.set("journalEntries", journal);
  path = [];
}
const paint = () => { main.innerHTML = W.render(); W.onMount(); };
const suggestion = () => main.querySelector(".wb-coach")?.outerHTML + main.querySelector(".wb-suggest")?.outerHTML;

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - Wellbeing renders its heading, one line and one practice");
fixture(); paint();
ok("0a. the heading says Wellbeing, visibly", txt(main.querySelector("h1")) === "Wellbeing" && !main.querySelector("h1.sr-only"));
ok("0b. one coach line and a Suggested now card with Start", !!main.querySelector(".wb-coach") &&
   /Suggested now/.test(txt(main.querySelector(".wb-suggest"))) && !!main.querySelector("#wb-start"));

// ── 1. FROM TODAY'S CHECK-IN ────────────────────────────────────────────
console.log("\nTEST 1 - the line and the practice come from today's check-in");
fixture(); paint();
ok("1a. no check-in: a neutral line, and the default -- Box breathing, 3 min",
   txt(main.querySelector(".wb-coach")) === "Whenever you want a few minutes to settle, this is here." &&
   /^Box breathing · 3 min$/.test(txt(main.querySelector(".wb-suggest__name"))));
fixture({ checkin: { energy: 6, mood: 3 } }); paint();
ok("1b. a heavy day: the spec's line, and a slow practice",
   txt(main.querySelector(".wb-coach")) === "You said today's been heavy going. Three minutes of slow breathing might help settle it." &&
   /^Extended exhale · 3 min$/.test(txt(main.querySelector(".wb-suggest__name"))));
fixture({ checkin: { energy: 3, mood: 6 } }); paint();
ok("1c. low energy: something that asks nothing", /energy is low/.test(txt(main.querySelector(".wb-coach"))) &&
   /^Resonance breathing/.test(txt(main.querySelector(".wb-suggest__name"))));
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
fixture(); store.set("checkinHistory", { [yesterday]: { energy: 2, mood: 2 } }); paint();
ok("1d. REVERSAL: yesterday's check-in is not today's", /^Whenever you want/.test(txt(main.querySelector(".wb-coach"))));
const lines = [null, { energy: 2, mood: 2 }, { energy: 3, mood: 6 }, { energy: 8, mood: 8 }, { energy: 6, mood: 6 }].map(c => W.suggestNow(c).line);
ok("1e. no line claims what a practice does to the body (C1)", lines.every(l => !/nervous system|parasympathetic|vagus|HRV|cortisol|reduce(s)? stress|calm(s)? (you|your)|proven|research/i.test(l)), lines.join(" | "));

// ── 2. NEVER THE JOURNAL ────────────────────────────────────────────────
console.log("\nTEST 2 - the suggestion never reads the journal (Appendix D)");
const TRIGGERS = [
  { id: "j1", date: new Date().toISOString(), text: "I feel hopeless and exhausted. I can't cope. Everything is heavy.", tags: ["low"] },
  { id: "j2", date: new Date().toISOString(), text: "panic attack, can't breathe, anxious all day", tags: ["anxiety"] },
];
for (const c of [null, { energy: 6, mood: 6 }, { energy: 8, mood: 8 }, { energy: 2, mood: 2 }]) {
  fixture({ checkin: c }); paint(); const without = suggestion();
  fixture({ checkin: c, journal: TRIGGERS }); paint(); const withJ = suggestion();
  ok(`2a. identical with and without trigger words in the journal (check-in ${JSON.stringify(c)})`, without === withJ && !!without);
}
const src = fs.readFileSync(new URL("../js/views/noticing.js", import.meta.url), "utf8");
const fn = src.slice(src.indexOf("export function suggestNow"), src.indexOf("// ── Render"));
ok("2b. suggestNow() reads nothing but its argument -- no store, no journal", fn.length > 200 && !/store\.|journal/i.test(fn.replace(/^\s*(\*|\/\/).*$/gm, "")));
ok("2c. and Start asks it with today's check-in only", /suggestNow\(getTodaysCheckin\(\)\)/.test(src.slice(src.indexOf("export function onMount"))));

// ── 3. ONE TAP ──────────────────────────────────────────────────────────
console.log("\nTEST 3 - Start reaches a running practice in one tap");
fixture({ checkin: { energy: 6, mood: 3 } });
router.currentView = "noticing"; await router.navigate("noticing");
main.querySelector("#wb-start")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await wait(1300);
ok("3a. on the breathing session, running", path.at(-1) === "breathing-session" && !!main.querySelector("#bs-time-remaining") &&
   txt(main.querySelector("#bs-time-remaining")) !== "3:00", `${JSON.stringify(path)} ${txt(main.querySelector("#bs-time-remaining"))}`);
ok("3b. the practice suggested, at the length suggested", /Extended exhale/i.test(txt(main)), txt(main).slice(0, 120));
BS.onUnmount?.();
fixture({ checkin: { energy: 6, mood: 3 } }); store.set("safetyAckLog", []);
await router.navigate("noticing");
main.querySelector("#wb-start")?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await wait(300);
ok("3c. REVERSAL: the safety gate still stands in front when it is due", !!document.querySelector("[data-safety-gate]") && !main.querySelector("#bs-time-remaining"));
BS.onUnmount?.();

// ── 4. WORDS ────────────────────────────────────────────────────────────
console.log("\nTEST 4 - the journal says who can read it; the practices say what they are");
fixture(); paint();
ok("4a. the Journal tile: Write anything. Only you can read it.", /Write anything\. Only you can read it\./.test(txt(main.querySelector("#noticing-journal-btn"))));
const jr = document.createElement("div"); document.body.appendChild(jr);
JournalEntryView({ navigate() {}, back() {} }).mount(jr);
ok("4b. the journal screen: Only you can read your journal. The coach never reads it.",
   /Only you can read your journal\. The coach never reads it\./.test(txt(jr)) &&
   jr.querySelector("#je-text")?.getAttribute("aria-describedby") === "je-privacy");
const want = {
  box: /^Even counts: in, hold, out, hold/,
  "478": /A longer hold and a long, slow out-breath\.$/,
  sigh: /^Two breaths in through the nose/,
  resonance: /five and a half seconds/,
  exhale: /out/i,
};
ok("4c. every breathing type describes itself plainly", BS.BREATHING_TYPES.length === 5 &&
   BS.BREATHING_TYPES.every(t => want[t.id]?.test(t.description)), BS.BREATHING_TYPES.map(t => `${t.id}: ${t.description}`).join(" | "));
ok("4d. Anytime is one list: Breathing · Mindful movement · Journal · In Step",
   ["#noticing-breathe-btn", "#noticing-mindful-btn", "#noticing-journal-btn", "#noticing-in-step-btn"].every(s => main.querySelector(`[aria-labelledby="anytime-heading"] ${s}`)));

console.log("");
if (fails) { console.log(`WELLBEING-SUGGEST: ${fails} FAILED, ${passes} passed`); process.exit(1); }
console.log(`WELLBEING-SUGGEST: all ${passes} assertions pass\n`);
process.exit(0);
