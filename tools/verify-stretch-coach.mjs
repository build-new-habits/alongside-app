/**
 * tools/verify-stretch-coach.mjs
 * 16 Sep 2026 v1
 *
 * STRETCH-VIA-COACH. One target implementation, reached from both paths.
 *
 * Graeme, testing the 1-to-1 path: "I never get a chance to state what I
 * want to do with stretching... I didn't get any body part or shape
 * options for stretch."
 *
 * 🔴 The feature built on Monday was unreachable from the path he uses.
 * A coach-proposed stretch session routes to workout.js, the generic
 * exercise-list view; the target logic lived in yoga-session.js.
 *
 * The fix was NOT a reroute (yoga-session assembles its own queue and
 * would discard the built session) and NOT a second copy -- SAVE-ALL is
 * one day old and exists because a second implementation of saving
 * drifted from the first.
 *
 * ⚫ SO THIS GATE'S JOB IS TO KEEP IT ONE IMPLEMENTATION. Not "both paths
 * have a target" -- that is satisfiable by copying. The assertion is
 * that neither path carries the knowledge itself.
 */
import { createRequire as __cr } from "node:module";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");
const fs = __require("node:fs");

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "https://example.org/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c, d = "") => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); if (d) console.log("       " + d); } };

const B = new URL("../js/", import.meta.url).href;
const { store } = await import(B + "store.js");
const { TARGET_AREAS, impliedTarget, sortByTarget, targetById, isStretchLike } =
  await import(B + "stretch-target.js");

const read = p => fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const yoga = strip(read("js/views/yoga-session.js"));
const prop = strip(read("js/views/coach-proposal.js"));

store.init();
console.log("\nSTRETCH-VIA-COACH\n");

console.log("TEST 0 — FIXTURE REACH: the shared logic really works");
store.set("conditions", ["lower-back"]);
store.set("conditionPainScores", { "lower-back": 5 });
const implied = impliedTarget();
console.log("       implied from a sore lower back: " + JSON.stringify(implied));
ok("0.1 a sore area implies a target", implied === "back-hips",
   "every assertion below reads this returning something");
ok("0.2 and the sort moves matching poses forward", (() => {
  const list = [
    { id: "calf", affectsAreas: ["calves"] },
    { id: "cat-cow", affectsAreas: ["spine", "lower-back"] }
  ];
  return sortByTarget(list, implied)[0].id === "cat-cow";
})());

console.log("\nTEST 1 — ONE implementation, not two");

ok("1.1 the knowledge lives in the shared module",
   /export const TARGET_AREAS/.test(strip(read("js/stretch-target.js"))) &&
   /export function impliedTarget/.test(strip(read("js/stretch-target.js"))));

ok("1.2 yoga-session imports it and declares none of it itself",
   /from ['"]\.\.\/stretch-target\.js['"]/.test(yoga) &&
   !/const TARGET_AREAS\s*=/.test(yoga) &&
   !/function _impliedTarget/.test(yoga),
   "a local copy is how SAVE-ALL's drift started, one day earlier");

ok("1.3 coach-proposal imports it and declares none of it itself",
   /from ['"]\.\.\/stretch-target\.js['"]/.test(prop) &&
   !/const TARGET_AREAS\s*=/.test(prop));

ok("1.4 REVERSAL: no third copy anywhere in js/", (() => {
  const dirs = ["js", "js/views", "js/data"];
  const copies = [];
  for (const d of dirs) {
    let files = [];
    try { files = fs.readdirSync(new URL("../" + d + "/", import.meta.url)); } catch { continue; }
    for (const f of files) {
      if (!f.endsWith(".js") || (d === "js" && f === "stretch-target.js")) continue;
      let t = ""; try { t = read(d + "/" + f); } catch { continue; }
      if (/const TARGET_AREAS\s*=|function _impliedTarget/.test(t)) copies.push(d + "/" + f);
    }
  }
  if (copies.length) console.log("      copies: " + copies.join(", "));
  return copies.length === 0;
})());

console.log("\nTEST 2 — the coach path orders, and says so");

ok("2.1 a proposed stretch session is ordered", /_applyStretchTarget\(built\)/.test(prop));
ok("2.2 on BOTH the primary and the alternates",
   (prop.match(/_applyStretchTarget\(built\)/g) || []).length >= 2,
   "ordering only the suggestion leaves the other two cards unordered and " +
   "silently different");
ok("2.3 and the card says which target was applied",
   /_stretchTargetNote\(option\)/.test(prop) && /cp-preview-card__target/.test(prop),
   "ordering a session around a signal and not saying so is the same silence " +
   "Graeme reported about the arc");

ok("2.4 it is silent with no signal", (() => {
  store.set("conditions", []); store.set("conditionPainScores", {});
  return impliedTarget() === null;
})(), "reordering around a guess and then captioning it is the padding-loop " +
      "mistake in another costume");

ok("2.5 only stretch-like sessions are touched",
   isStretchLike({ sessionType: "stretch" }) &&
   isStretchLike({ sessionType: "mobility" }) &&
   !isStretchLike({ sessionType: "upper" }) &&
   !isStretchLike({}),
   "a strength session has a target in a different sense and must not get this");

console.log("\nTEST 3 — the properties the sort must keep");

ok("3.1 nothing is dropped", (() => {
  const list = Array.from({ length: 9 }, (_, i) => ({ id: "e" + i, affectsAreas: ["calves"] }));
  return sortByTarget(list, "back-hips").length === 9;
})(), "sort, do not filter -- a short session reads as the app having nothing " +
      "for you");

ok("3.2 all-over changes nothing", (() => {
  const list = [{ id: "a", affectsAreas: ["calves"] }, { id: "b", affectsAreas: ["spine"] }];
  return sortByTarget(list, "all").map(x => x.id).join() === "a,b";
})());

ok("3.3 it is stable, so a re-render does not reshuffle a session", (() => {
  const list = [
    { id: "a", affectsAreas: ["spine"] },
    { id: "b", affectsAreas: ["spine"] },
    { id: "c", affectsAreas: ["calves"] }
  ];
  const once = sortByTarget(list, "back-hips").map(x => x.id).join();
  return once === "a,b,c" && once === sortByTarget(list, "back-hips").map(x => x.id).join();
})(), "somebody halfway through a session must not have it reorder under them");

ok("3.4 an unknown target is a no-op, not a wipe",
   sortByTarget([{ id: "a" }], "not-a-target").length === 1);

ok("3.5 every target id in the list is resolvable",
   TARGET_AREAS.every(t => targetById(t.id) === t));

console.log("");
if (fail) { console.log("STRETCH-VIA-COACH: " + fail + " FAILED"); fails.forEach(f => console.log("  - " + f)); process.exit(1); }
console.log("STRETCH-VIA-COACH: all " + pass + " assertions pass\n");
