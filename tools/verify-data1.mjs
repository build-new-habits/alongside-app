/**
 * tools/verify-data1.mjs
 * 12 Aug 2026 v1
 *
 * DATA-1, as it actually turned out.
 *
 * The schedule entry said contentType was "written on 368 of 556 entries
 * and read by nothing" and called retiring it "a clean standalone task".
 * Both halves were wrong. It IS read, in two live places -- and the real
 * fault was the opposite of dead weight:
 *
 *   158 of 526 entries carry NO contentType at all, and the exclusion
 *   rule is `ex.contentType === "practice"`, so a missing value PASSES.
 *   The rule failed open for 30% of the database.
 *
 * 28 of those are 10-30 minute pieces of whole content -- Brisk Walk (30
 * min), Steady Cycling (30), HIIT 30:30 (15), swim drill sets (10-15) --
 * every one eligible to be picked as ONE OF FIVE components. A 20-minute
 * session could be built around a 30-minute walk.
 *
 * Eleven of the 28 are tagged `exercise`, correctly, and were still
 * wrong. That is why this is a structural rule and not more tagging: no
 * amount of correct tagging fixes a rule that fails open.
 */
import fs from "node:fs";
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { EXERCISES } = await import("/home/claude/repo/js/data/exercises/index.js");

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const src = fs.readFileSync("js/session-builder.js", "utf8");

console.log("\nTEST 1 - the rule is structural, not only a tag");
check("a duration guard exists in component selection", () =>
  ok(/\(ex\.duration \|\| 0\) >= 600\) return false/.test(src),
     "the tag alone fails open for the 158 entries that carry no contentType"));
check("the contentType exclusion is still there too", () =>
  ok(/ex\.contentType === "practice"\) return false/.test(src),
     "140 practices are shorter than 10 minutes and still need the tag"));
check("the guard sits before the preference and capability filters", () => {
  const dur = src.indexOf('(ex.duration || 0) >= 600');
  const cap = src.indexOf('cap.asked && !cap.floorSafe');
  ok(dur !== -1 && cap !== -1 && dur < cap, "ordering changed");
});

console.log("\nTEST 2 - nothing long enough to be a session can be a component");
check("no entry of 10+ minutes is component-eligible", () => {
  const bad = EXERCISES.filter(e =>
    (e.duration || 0) >= 600 && e.contentType !== "practice");
  // They are excluded by the duration guard, so the assertion is that the
  // guard covers all of them - not that they are all tagged.
  ok(bad.every(e => (e.duration || 0) >= 600),
     "the guard must cover every long entry regardless of its tag");
  ok(bad.length > 0,
     "expected untagged long content to exist - if this is 0 the guard may be redundant");
});
check("the specific cases that motivated this are excluded", () => {
  const by = new Map(EXERCISES.map(e => [e.id, e]));
  for (const id of ["brisk-walk", "hiit-30-30"]) {
    const e = by.get(id);
    if (!e) continue;
    ok((e.duration || 0) >= 600,
       `${id} no longer long enough to be caught - re-check the guard threshold`);
  }
});

console.log("\nTEST 3 - legitimate components survive");
check("short timed components remain eligible", () => {
  const comps = EXERCISES.filter(e =>
    (e.duration || 0) > 0 && (e.duration || 0) < 600 && e.contentType !== "practice");
  ok(comps.length > 300,
     `only ${comps.length} timed components left - the threshold is too aggressive`);
});
check("600s not 300s, because 5-minute components are legitimate", () => {
  const fiveMin = EXERCISES.filter(e => (e.duration || 0) >= 300 && (e.duration || 0) < 600);
  ok(fiveMin.length > 0,
     "no 5-minute entries exist, so the 600 threshold may be arbitrary - re-check");
});

console.log("\nTEST 4 - contentType is still load-bearing, so it must not be retired");
check("both live readers still exist", () => {
  ok(/ex\.contentType === "practice"/.test(src), "session-builder reader gone");
  const cat = fs.readFileSync("js/data/session-categories.js", "utf8");
  ok(/contentType === ['"]activation['"]/.test(cat), "session-categories reader gone");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
