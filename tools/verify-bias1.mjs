/**
 * tools/verify-bias1.mjs
 * 12 Aug 2026 v1
 *
 * BIAS-1 gate.
 *
 * coach-reflection.js has computed a proposalBias since 03 Aug -- 'rest'
 * or 'lighter', from severe pain, burnout risk, consecutive training days
 * and returning after time away -- written it to the store, and nothing
 * read it. Nine days.
 *
 * The consequence was not a crash. The coach could privately conclude
 * that today should be lighter because somebody is in a burnout pattern,
 * SAY SO in the reflection, and then hand them exactly the session their
 * energy score alone suggested. It knew, it said it, and it did not act
 * on it -- which is the specific failure that makes a coach feel like it
 * is not listening.
 */
import fs from "node:fs";
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { store } = await import("/home/claude/repo/js/store.js");
store.init();
const { resolveIntensity } = await import("/home/claude/repo/js/data/checkin.js");

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}\n        got: ${a}  want: ${b}`); };
const ok = (c, m) => { if (!c) throw new Error(m); };

console.log("\nTEST 1 - the bias actually changes the outcome");
check("no bias leaves intensity alone", () => {
  for (const i of ["low", "moderate", "high"]) eq(resolveIntensity(i, null), i, i);
});
check("'lighter' steps DOWN one notch, never to the floor", () => {
  eq(resolveIntensity("high", "lighter"), "moderate",
     "a good day in a burnout pattern must not be overridden entirely - P7, authority never scales");
  eq(resolveIntensity("moderate", "lighter"), "low", "moderate");
  eq(resolveIntensity("low", "lighter"), "low", "already at the floor");
});
check("'rest' goes to the gentlest available", () => {
  for (const i of ["low", "moderate", "high"]) eq(resolveIntensity(i, "rest"), "low", i);
});
check("garbage in resolves safely", () => {
  eq(resolveIntensity(undefined, undefined), "moderate", "no input");
  eq(resolveIntensity("chaos", "chaos"), "moderate", "unknown values");
  eq(resolveIntensity("high", "chaos"), "high", "unknown bias must not silently lighten");
});

console.log("\nTEST 2 - the store field is declared and validated");
check("proposalBias is in store.js defaults", () =>
  ok(/proposalBias:\s+null/.test(fs.readFileSync("js/store.js", "utf8")),
     "undeclared fields are invisible to anyone reading the field list - that is how this went nine days"));
check("only valid values survive a reload", () => {
  store.set("proposalBias", "chaos");
  store.init();
  eq(store.get("proposalBias"), null, "an invalid bias must not persist");
  store.set("proposalBias", "lighter");
  store.init();
  eq(store.get("proposalBias"), "lighter", "a valid bias must survive");
});

console.log("\nTEST 3 - reader and writer both exist (PT-12 pattern)");
const gen = fs.readFileSync("js/data/workoutGenerator.js", "utf8");
const ref = fs.readFileSync("js/views/coach-reflection.js", "utf8");
check("coach-reflection writes it", () =>
  ok(/store\.set\("proposalBias"/.test(ref), "writer gone"));
check("workoutGenerator reads it", () =>
  ok(/store\.get\("proposalBias"\)/.test(gen),
     "written and never read - the coach says lighter and hands over the same session"));
check("it is combined, not substituted", () =>
  ok(/resolveIntensity\(/.test(gen),
     "must combine with todayIntensity, not replace it - they encode different things"));

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
