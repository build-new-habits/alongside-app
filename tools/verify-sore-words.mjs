/**
 * tools/verify-sore-words.mjs
 * 02 Oct 2026 v1
 *
 * W4-9 SORE-WORDS (Wave 4 persona trace: 2.1, 2.11, 2.15, 2.16).
 *
 * At "A little" the coach said "I've noted Lower Back as Mild — I haven't
 * changed anything there", while the builder had left out Spinal CARs and
 * Spine Twist (known decision 1) and the plan's own line said "nothing in
 * this plan loads it heavily": three statements about one area on one
 * screen, one of them untrue, in a word ("Mild") the person never chose.
 * And the doors disagreed on what "A little" means: the builder counted 4
 * as sore, conditions.js and Core counted from 6, Yoga only from 7, so the
 * same answer left movements out at one door and not at the next.
 *
 *   1. One classifier, in data/conditions.js: the three words and their
 *      scores, which level a score is, and the tags the doors filter on.
 *   2. No other file compares a sore score with a number.
 *   3. Every door leaves out the same moves at "A little": the builder,
 *      Core, Yoga and My exercises' check all read the one classifier.
 *   4. At A little and Quite sore, on the coach's plan: the person's own
 *      word, no "Mild", no "Severe", no "haven't changed anything" when a
 *      move was left out, at most one sentence that names the area
 *      (outside the row marks); the moves left out are named, read from
 *      the library, and none of them is in the plan.
 *   5. Settings says what getting started says (left out on a bad day).
 *   6. A held class says the app chose, not the person.
 */
import { createRequire as __cr } from "node:module";
import { readFileSync } from "node:fs";
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
const C = await import(B + "data/conditions.js");
const SB = await import(B + "session-builder.js");
const { EXERCISES } = await import(B + "data/exercises/index.js");
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

const KIT = ["dumbbells-light", "dumbbells-medium", "bench-flat", "band-medium", "yoga-mat", "kettlebell-medium"];
function fixture(conditions = [], scores = {}) {
  localStorage.clear(); store.init(); agreed(store);
  gate.endGateSession();
  store.set("onboardingComplete", true); store.set("name", "Test"); store.set("tier", "personal");
  store.set("equipment", KIT); store.set("homeEquipment", KIT); store.set("gymEquipment", KIT);
  store.set("conditions", conditions); store.set("conditionPainScores", scores);
  store.set("redFlag", { screenedAt: new Date().toISOString(), areas: conditions, textVersion: RF.RED_FLAG_VERSION, level: null, flaggedAt: null, clearedAt: null });
  for (let i = 0; i < 5; i++) gate.recordAcknowledgement("fixture");
  gate.endGateSession();
}
// The moves the library itself says to leave out below Bad, per area.
const leftOut = area => EXERCISES.filter(e => (e.contraindications || []).includes(`${area}-subacute`));

// ── 1. ONE CLASSIFIER ───────────────────────────────────────────────────
console.log("\nTEST 1 - one classifier, in data/conditions.js");
ok("1a. the three words and their scores",
   JSON.stringify((C.SORE_LEVELS || []).map(l => [l.label, l.value])) === JSON.stringify([["A little", 4], ["Quite sore", 6], ["Bad", 8]]),
   JSON.stringify(C.SORE_LEVELS));
ok("1b. which word a score is", C.soreWord?.(4) === "A little" && C.soreWord?.(6) === "Quite sore" && C.soreWord?.(8) === "Bad" && C.soreWord?.(0) == null);
const tags = C.getActiveConditionIds?.(["lower-back", "knee"], { "lower-back": 4, knee: 8 }) || [];
ok("1c. the tags: sore below Bad -> subacute; acute from the acute line",
   tags.includes("lower-back-subacute") && tags.includes("knee-acute") && !tags.includes("lower-back-acute"), JSON.stringify(tags));
const check = readFileSync(new URL("../js/views/checkin.js", import.meta.url), "utf8");
const kw = readFileSync(new URL("../js/views/know-what.js", import.meta.url), "utf8");
ok("1d. the check-in and I know what I want offer the words from conditions.js", /SORE_LEVELS/.test(check) && /SORE_LEVELS/.test(kw));

// ── 2. NO OTHER FILE COMPARES A SORE SCORE WITH A NUMBER ────────────────
console.log("\nTEST 2 - no other file compares a sore score with a number");
const FILES = ["session-builder.js", "views/coach-proposal.js", "views/yoga-session.js", "views/core-session.js",
  "views/running-session.js", "views/walk-session.js", "data/session-rationale.js", "views/class-list.js",
  "views/prescribed-session.js", "views/session-builder-ui.js"];
const CMP = /(painScores\[[^\]]+\]\s*\|\|\s*0\)|\b(pain|score|scores\[\w+\])|\bp)\s*(>=|<=|>|<)\s*\d/;
const hits = [];
for (const f of FILES) {
  readFileSync(new URL(`../js/${f}`, import.meta.url), "utf8").split("\n").forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, "");
    if (/^\s*\*/.test(line)) return;
    if (CMP.test(code) && /pain|score|sore/i.test(code)) hits.push(`${f}:${i + 1}`);
  });
}
ok("2a. every door asks conditions.js", hits.length === 0, hits.join(", "));

// ── 3. EVERY DOOR LEAVES OUT THE SAME MOVES ─────────────────────────────
console.log("\nTEST 3 - every door leaves out the same moves at A little");
const back = leftOut("lower-back").map(e => e.id);
ok("3pc. the library names moves to leave out for a sore lower back", back.length >= 2, back.join(", "));
fixture(["lower-back"], { "lower-back": 4 });
const builderTags = [...(SB.activeConditionTags?.() || [])];
ok("3a. the builder tags a lower back at A little", builderTags.includes("lower-back-subacute"), JSON.stringify(builderTags));
const yogaSrc = readFileSync(new URL("../js/views/yoga-session.js", import.meta.url), "utf8");
const coreSrc = readFileSync(new URL("../js/views/core-session.js", import.meta.url), "utf8");
ok("3b. Yoga and Core take their tags from the one classifier",
   /getActiveConditionIds\(/.test(yogaSrc) && /getActiveConditionIds\(/.test(coreSrc) && !/-acute`\)/.test(yogaSrc));
const cTags = C.getActiveConditionIds(["lower-back"], { "lower-back": 4 });
ok("3c. conditions.js at A little rules out the same moves as the builder",
   back.every(id => (EXERCISES.find(e => e.id === id).contraindications || []).some(t => cTags.includes(t))), JSON.stringify(cTags));

// ── 4. ON THE COACH'S PLAN ──────────────────────────────────────────────
console.log("\nTEST 4 - the coach's plan, at A little and Quite sore");
const router = { history: ["x"], navigate() {}, back() {} };
async function plan(cond, score) {
  fixture([cond], { [cond]: score });
  main.innerHTML = ""; CoachProposalView(router).mount(main); await wait(30);
  const rows = [...main.querySelectorAll(".cp-plan__row")];
  const rowText = rows.map(txt).join(" ");
  const clone = main.cloneNode(true);
  clone.querySelectorAll(".cp-plan__row, .cp-plan__list, [hidden]").forEach(n => n.remove());
  return { all: txt(main), outside: txt(clone), rowText, names: rows.map(r => txt(r.querySelector(".cp-plan__name, .cp-plan__row-name, strong") || r)) };
}
const AREA = { "lower-back": /lower back/i, knee: /\bknee\b/i };
for (const [cond, score, word] of [["lower-back", 4, "a little sore"], ["lower-back", 6, "quite sore"], ["knee", 4, "a little sore"], ["knee", 6, "quite sore"]]) {
  const p = await plan(cond, score);
  const label = `${cond} at ${score}`;
  ok(`4pc. ${label}: a plan is shown`, p.rowText.length > 0, p.all.slice(0, 120));
  ok(`4a. ${label}: the person's own word`, new RegExp(word, "i").test(p.outside), p.outside.slice(0, 400));
  ok(`4b. ${label}: no Mild, no Severe, no "haven't changed anything"`, !/\bMild\b|\bSevere\b|haven.t changed anything/i.test(p.all), p.outside.slice(0, 400));
  const sentences = p.outside.split(/(?<=[.!?])\s+/).filter(s => AREA[cond].test(s));
  ok(`4c. ${label}: one sentence names the area`, sentences.length <= 1, sentences.join(" | "));
  const lo = leftOut(cond);
  if (lo.length) {
    ok(`4d. ${label}: the moves left out are named`, lo.every(e => p.outside.includes(e.name)), lo.map(e => e.name).join(", "));
    ok(`4e. ${label}: and none of them is in the plan`, !lo.some(e => p.rowText.includes(e.name)));
  } else {
    ok(`4d. ${label}: it says nothing is left out for it`, /nothing is left out/i.test(p.outside), p.outside.slice(0, 300));
  }
}

// ── 5. SETTINGS SAYS WHAT GETTING STARTED SAYS ──────────────────────────
console.log("\nTEST 5 - Settings says what getting started says");
fixture(["knee"], {});
const { SettingsView } = await import(B + "views/settings.js");
main.innerHTML = ""; SettingsView({ navigate() {}, back() {} }).mount(main); await wait(10);
main.querySelector('[data-open="conditions"]')?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
await wait(10);
const st = txt(main);
ok("5a. no claim that listing an area leaves movements out", !/leaves out movements likely to load what.s listed here/i.test(st), st.slice(0, 300));
ok("5b. it says it is on a bad day", /bad/i.test(st) && /leave out/i.test(st), st.slice(0, 300));

// ── 6. A HELD CLASS ─────────────────────────────────────────────────────
console.log("\nTEST 6 - a held class says the app chose");
const cl = readFileSync(new URL("../js/views/class-list.js", import.meta.url), "utf8");
ok("6a. no \"you've told me to steer clear\"", !/told me to steer clear/.test(cl));

console.log(`\nSORE-WORDS: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
