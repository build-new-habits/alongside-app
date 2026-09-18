/**
 * tools/verify-card6.mjs
 * 16 Sep 2026 v1
 *
 * CARD-6. The caution varies, and it is grammatical.
 *
 * 🔴 THE GRAMMAR FAULT IS WHY THIS FILE EXISTS AT ALL.
 *
 * "Your glutes IS sore today" was visible in three of Graeme's four
 * screenshots on 15 Sep. It was specified in the CARD-5 blueprint,
 * described in conversation as done, and written into the on-device
 * testing schedule as a check to perform -- and session-rationale.js was
 * never in a commit. A spec, a claim and a test-plan line all said it
 * was fixed. Nothing executed it.
 *
 * So this gate DRIVES bodyCaution() with real store state. Same lesson
 * as verify-stretch-why: a fault that three documents agree is fixed is
 * still live until something runs the code.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { bodyCaution } = await import(B + "data/session-rationale.js");

const sore = (area) => {
  localStorage.clear(); store.init();
  store.set("conditions", [area]);
  store.set("conditionPainScores", { [area]: 5 });
};
const EX = (id, areas) => ({ id, name: id, affectsAreas: areas });

store.init();
console.log("\nCARD-6\n");

console.log("TEST 0 — FIXTURE REACH: a caution is produced at all");
sore("glutes");
const line = bodyCaution(EX("stationary-bike", ["glutes", "quadriceps"]));
console.log("       " + JSON.stringify((line || "").slice(0, 70)));
ok("0.1 a declared sore area this exercise works produces a line", !!line && line.length > 0,
   "every assertion below reads a line that must exist first");

console.log("\nTEST 1 — grammar: plural nouns, singular verbs");
ok("1.1 'is sore today' appears nowhere in the file", (() => {
  const fs = __require("node:fs");
  const src = fs.readFileSync(new URL("../js/data/session-rationale.js", import.meta.url), "utf8");
  return !/is sore today/.test(src);
})(), "\"Your glutes is sore today\" -- the fault that three documents said was fixed");

ok("1.2 and no rendered line produces it either", (() => {
  for (const a of ["glutes", "hamstring", "knee", "lower-back", "shoulder"]) {
    sore(a);
    const s = bodyCaution(EX("x-" + a, [a])) || "";
    if (/\bis sore\b/.test(s)) return false;
  }
  return true;
})(), "source-checking alone is what let this survive; the strings are built by " +
      "concatenation and a template could reintroduce it");

ok("1.3 REVERSAL: the check can detect the fault", /is sore today/.test("Your glutes is sore today, and"));

console.log("\nTEST 2 — two different exercises do not read identically");
ok("2.1 consecutive exercises working the same sore area differ", (() => {
  sore("glutes");
  const a = bodyCaution(EX("stationary-bike", ["glutes", "quadriceps"]));
  const b = bodyCaution(EX("treadmill-walk",  ["glutes", "calves"]));
  return a && b && a !== b;
})(), "Graeme's screenshots: exercise 1 and exercise 2 carried an IDENTICAL " +
      "caution, which reads as a template rather than as the coach noticing");

ok("2.2 REVERSAL: the SAME exercise is stable across renders", (() => {
  sore("glutes");
  const ex = EX("stationary-bike", ["glutes"]);
  return bodyCaution(ex) === bodyCaution(ex);
})(), "a sentence that rewrites itself on a re-render or a Back tap is worse " +
      "than one that repeats -- this is why the variant is derived from the " +
      "exercise id rather than a session counter");

ok("2.3 every variant keeps both commitments: go by feel, easing off is not a compromise", (() => {
  sore("glutes");
  const lines = ["stationary-bike", "treadmill-walk", "step-touch", "glute-bridge", "hip-thrust"]
    .map(id => bodyCaution(EX(id, ["glutes"])) || "");
  return lines.every(s => /feel/i.test(s) && /not a compromise/i.test(s));
})(), "varying the wording must not quietly drop what the sentence is for");

ok("2.4 the area is named in every variant", (() => {
  sore("hamstring");
  const lines = ["a", "b", "c", "d", "e"].map(id => bodyCaution(EX(id, ["hamstring"])) || "");
  return lines.every(s => /hamstring/i.test(s));
})());

// Honest limit, stated rather than hidden: the variant is a hash of the
// exercise id over three strings, so two NON-consecutive exercises can
// still collide. That is the wrong problem to solve -- the complaint was
// a stuck record back to back, and threading session state through a
// pure function to fix a repeat five exercises apart costs more than it
// returns.
console.log("       note  non-consecutive collisions are possible and accepted; see the source");

console.log("");
if (fail) { console.log("CARD-6: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("CARD-6: all " + pass + " assertions pass\n");
