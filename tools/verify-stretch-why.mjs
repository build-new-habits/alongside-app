/**
 * tools/verify-stretch-why.mjs
 * 16 Sep 2026 v1
 *
 * STRETCH-WHY. Why THIS pose, in THIS session, today.
 *
 * 🔴 THIS GATE DRIVES THE FUNCTION. IT DOES NOT READ IT.
 *
 * The first draft of _poseWhy() had three branches. Two of them read
 * store fields that DO NOT EXIST -- `soreAreas`, and `strands` as
 * objects on activeProgramme. Both branches were present, commented,
 * plausible, and would have returned nothing for every user forever.
 *
 * A source-slice gate would have passed on both. That is the failure
 * mode this file is shaped against: the bug was not absent code, it was
 * code reading a field nobody had checked. So every assertion here sets
 * real store state and reads what comes back.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',
  { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { _poseWhy } = await import(B + "views/yoga-session.js");

const BACK  = { name: "Cat-Cow",      affectsAreas: ["spine", "lower-back", "upper-back"] };
const CALF  = { name: "Calf Stretch", affectsAreas: ["calves", "ankle-foot"] };
const reset = () => {
  localStorage.clear(); store.init();
  store.set("conditions", []); store.set("conditionPainScores", {});
  store.set("arc", {});
};

store.init();
console.log("\nSTRETCH-WHY\n");

console.log("TEST 0 — FIXTURE REACH: the function can say something at all");
reset();
store.set("conditions", ["lower-back"]);
store.set("conditionPainScores", { "lower-back": 5 });
const sore = _poseWhy(BACK);
console.log("       sore line: " + JSON.stringify(sore));
ok("0.1 a declared sore area produces a line", sore.length > 0,
   "every silence assertion below is worthless if the function never speaks");
ok("0.2 and it names the area in words, not an id",
   /lower back/.test(sore) && !/lower-back/.test(sore));

console.log("\nTEST 1 — the sore branch is LIVE, not dead code");
ok("1.1 it reads conditionPainScores, not an invented field", (() => {
  reset();
  store.set("conditions", ["lower-back"]);
  store.set("conditionPainScores", { "lower-back": 5 });
  return _poseWhy(BACK).length > 0;
})(), "the first draft read store.get('soreAreas'), which does not exist");

ok("1.2 REVERSAL: below the threshold it says nothing", (() => {
  reset();
  store.set("conditions", ["lower-back"]);
  store.set("conditionPainScores", { "lower-back": 2 });
  return _poseWhy(BACK) === "";
})(), "soreAreaLoaded() owns the >= 4 threshold; a hand-rolled copy would drift");

ok("1.3 it resolves through the area aliases", (() => {
  reset();
  store.set("conditions", ["lower-back"]);
  store.set("conditionPainScores", { "lower-back": 5 });
  // Tagged `spine` only -- no literal "lower-back" on the pose.
  return _poseWhy({ name: "Twist", affectsAreas: ["spine"] }).length > 0;
})(), "hand-matching ids would miss a back flagged as lower-back on a pose tagged spine");

ok("1.4 a sore area elsewhere does not claim this pose", (() => {
  reset();
  store.set("conditions", ["lower-back"]);
  store.set("conditionPainScores", { "lower-back": 5 });
  return !/flagged/.test(_poseWhy(CALF));
})());

console.log("\nTEST 2 — the arc branch is LIVE, not dead code");
ok("2.1 it reads store `arc` with strand IDS", (() => {
  reset();
  store.set("arc", { strands: ["hip-range"] });
  return /feeds/.test(_poseWhy({ name: "90-90", affectsAreas: ["hip", "glutes"] }));
})(), "the first draft read activeProgramme.strands as objects; activeProgramme " +
      "has no strands at all");

ok("2.2 REVERSAL: no arc, no line", (() => {
  reset();
  return _poseWhy({ name: "90-90", affectsAreas: ["hip", "glutes"] }) === "";
})());

ok("2.3 REVERSAL: an arc that does not touch this pose says nothing", (() => {
  reset();
  store.set("arc", { strands: ["ankle-range"] });
  return _poseWhy({ name: "Chest Opener", affectsAreas: ["chest-pecs"] }) === "";
})());

console.log("\nTEST 3 — priority, and silence where the answer is obvious");
ok("3.1 a sore area outranks the arc", (() => {
  reset();
  store.set("conditions", ["lower-back"]);
  store.set("conditionPainScores", { "lower-back": 5 });
  store.set("arc", { strands: ["hip-range"] });
  return /flagged/.test(_poseWhy(BACK));
})(), "what they said this morning outranks what the plan says");

ok("3.2 nothing is said when there is nothing to add", (() => {
  reset();
  return _poseWhy(BACK) === "";
})(), "a line on every pose is forty renders of the obvious -- the mistake " +
      "CARD-5 spent a week undoing");

ok("3.3 a pose with no areas at all is silent, not guessed at", (() => {
  reset();
  store.set("conditions", ["lower-back"]);
  store.set("conditionPainScores", { "lower-back": 5 });
  return _poseWhy({ name: "Unknown" }) === "";
})());

ok("3.4 at most ONE line, ever", (() => {
  reset();
  store.set("conditions", ["lower-back"]);
  store.set("conditionPainScores", { "lower-back": 5 });
  store.set("arc", { strands: ["hip-range"] });
  const s = _poseWhy(BACK);
  return s.split(". ").filter(Boolean).length <= 2 && !/feeds/.test(s);
})());

console.log("");
if (fail) { console.log("STRETCH-WHY: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("STRETCH-WHY: all " + pass + " assertions pass\n");
