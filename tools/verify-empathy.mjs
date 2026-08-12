/**
 * tools/verify-empathy.mjs
 * 12 Aug 2026 v1
 *
 * Gate for EMP-1. Exercises the real matcher against real contexts --
 * this is behaviour, not a wiring check, so it simulates sessions rather
 * than grepping for strings.
 */
import fs from "node:fs";
import { EMPATHY_PROMPTS, selectEmpathyPrompt, MAX_RUN } from "../js/data/empathy-transfer.js";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const ctx = o => ({
  sessionCount: 10, struggled: false, lowEnergy: false, checkedInToday: true,
  returning: false, sustainedDifficulty: false, variablePattern: false,
  adjusting: false, gentleSession: false, ...o,
});
const NONE = { stage: 0, index: -1, runLength: 0 };

console.log("\nTEST 1 - prompt integrity (wording is owned by the source spec)");
check("21 prompts across 5 stages", () => {
  const n = Object.values(EMPATHY_PROMPTS).reduce((a, p) => a + p.length, 0);
  ok(n === 21, `expected 21, got ${n}`);
});
check("every prompt has text, requires and prefers", () => {
  for (const [s, pool] of Object.entries(EMPATHY_PROMPTS))
    pool.forEach((p, i) => {
      ok(typeof p.text === "string" && p.text.length > 40, `stage ${s}[${i}] text missing/short`);
      ok(Array.isArray(p.requires), `stage ${s}[${i}] requires not an array`);
      ok(Array.isArray(p.prefers),  `stage ${s}[${i}] prefers not an array`);
    });
});
check("no unknown condition tags (a typo must not silently disable a prompt)", () => {
  const known = new Set(["struggled","persisted","gentleSession","lowEnergy","goodEnergy",
    "checkedInToday","returning","sustainedDifficulty","variablePattern","adjusting"]);
  for (const [s, pool] of Object.entries(EMPATHY_PROMPTS))
    pool.forEach((p, i) => [...p.requires, ...p.prefers].forEach(c => {
      ok(c.startsWith("minSessions:") || known.has(c), `stage ${s}[${i}] unknown tag "${c}"`);
    }));
});

console.log("\nTEST 2 - every stage always returns something");
for (let s = 1; s <= 5; s++)
  check(`stage ${s} returns a prompt for a blank-slate context`, () =>
    ok(selectEmpathyPrompt(s, ctx({ sessionCount: 4 }), NONE) !== null, "returned null"));

console.log("\nTEST 3 - today's answers actually change the outcome");
check("struggling vs thriving pick DIFFERENT stage 1 prompts", () => {
  const hard = selectEmpathyPrompt(1, ctx({ struggled: true, lowEnergy: true }), NONE);
  const good = selectEmpathyPrompt(1, ctx({ struggled: false, lowEnergy: false }), NONE);
  ok(hard.index !== good.index, `both chose index ${hard.index} - selection is not condition-aware`);
});
check("a struggling session scores above zero (a fit was actually found)", () =>
  ok(selectEmpathyPrompt(1, ctx({ struggled: true, lowEnergy: true }), NONE).score > 0,
     "scored 0 - fell through to the catch-all"));
check("stage 4 picks the sustained-difficulty prompt after a rough patch", () => {
  const r = selectEmpathyPrompt(4, ctx({ sustainedDifficulty: true, sessionCount: 58 }), NONE);
  ok(r.score > 0, "no preference matched");
});

console.log("\nTEST 4 - requires are hard gates");
check("stage 1 prompt C (minSessions:6) cannot fire at session 4", () => {
  for (let i = 0; i < 40; i++) {
    const r = selectEmpathyPrompt(1, ctx({ sessionCount: 4, adjusting: true }), NONE);
    ok(r.index !== 2, "fired a prompt gated at 6+ sessions");
  }
});
check("stage 5 at session 80 falls back rather than returning null", () => {
  const r = selectEmpathyPrompt(5, ctx({ sessionCount: 80 }), NONE);
  ok(r !== null, "returned null - blank empathy screen");
  ok(r.fellBack === true, "should have flagged the stage 5 catch-all gap");
  ok(r.index === 0, "should take the nearest threshold (85+)");
});
check("stage 5 at session 100 does NOT fall back", () =>
  ok(selectEmpathyPrompt(5, ctx({ sessionCount: 100 }), NONE).fellBack === false,
     "flagged a fallback when all four prompts qualify"));

console.log("\nTEST 5 - the repeat cap (Graeme's decision: max 2 running)");
check(`the same prompt never fires more than ${MAX_RUN} times running`, () => {
  let last = NONE, run = 0, prev = null;
  for (let i = 0; i < 30; i++) {
    // Worst case: an unchanging hard context, which is exactly a rough fortnight.
    const r = selectEmpathyPrompt(1, ctx({ struggled: true, lowEnergy: true }), last);
    run = (prev !== null && r.index === prev) ? run + 1 : 1;
    ok(run <= MAX_RUN, `prompt ${r.index} fired ${run} times consecutively at iteration ${i}`);
    prev = r.index;
    last = { stage: r.stage, index: r.index, runLength: r.runLength };
  }
});
check("runLength increments on repeat and resets on change", () => {
  const a = selectEmpathyPrompt(1, ctx({ struggled: true }), NONE);
  ok(a.runLength === 1, `first fire should be runLength 1, got ${a.runLength}`);
  const b = selectEmpathyPrompt(1, ctx({ struggled: true }), { stage: 1, index: a.index, runLength: 1 });
  ok(b.index !== a.index || b.runLength === 2, "runLength did not advance on a repeat");
});
check("a tie never manufactures a repeat", () => {
  const flat = ctx({});                       // nothing preferred: several score 0
  const r = selectEmpathyPrompt(4, flat, { stage: 4, index: 2, runLength: 1 });
  ok(r.index !== 2 || r.score > 0, "tie-break chose the prompt that just fired");
});

console.log("\nTEST 6 - pool coverage (the fault a passing suite still missed)");
check("every prompt in every stage is reachable over a long arc", () => {
  for (let s = 1; s <= 5; s++) {
    const pool = EMPATHY_PROMPTS[s];
    const seen = new Set();
    let last = NONE;
    for (let i = 0; i < 200; i++) {
      // Session count high enough that no minSessions gate excludes anything.
      const r = selectEmpathyPrompt(s, ctx({ sessionCount: 200 }), last, i);
      seen.add(r.index);
      last = { stage: r.stage, index: r.index, runLength: r.runLength };
    }
    ok(seen.size === pool.length,
       `stage ${s}: only ${seen.size} of ${pool.length} prompts ever fire (${[...seen].sort()}). ` +
       `A stable sort on score alone always returns the lowest index.`);
  }
});
check("fit still overrides rotation", () => {
  // Rotation must not be able to hand back a prompt that scores lower.
  for (let i = 0; i < 12; i++) {
    const r = selectEmpathyPrompt(1, ctx({ struggled: true, lowEnergy: true }), NONE, i);
    ok(r.score > 0, `rotation offset ${i} chose a zero-scoring prompt over a fitting one`);
  }
});

console.log("\nTEST 7 - the unavailable condition is declared, not faked");
check("stage 2 prompt B carries an explicit note about its missing signal", () => {
  const p = EMPATHY_PROMPTS[2][1];
  ok(typeof p.note === "string" && /UNAVAILABLE/i.test(p.note),
     "the coach-adjusted condition should be visibly unmatchable, not quietly dropped");
  ok(p.requires.length === 0, "it must not require a condition that can never hold");
});

console.log("\nTEST 8 - reflect.js wiring");
const reflect = fs.readFileSync("js/views/reflect.js", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
check("fireEmpathyPrompt persists empathyLastPrompt", () =>
  ok(/store\.set\("empathyLastPrompt"/.test(reflect),
     "without this the repeat cap can never trigger"));
check("modulo selection is gone", () =>
  ok(!/atStage % pool\.length/.test(reflect), "old rotation still present"));
check("store.js declares empathyLastPrompt", () =>
  ok(fs.readFileSync("js/store.js", "utf8").includes("empathyLastPrompt:"),
     "reader without a writer, again"));
check("reflect.js passes atStage into the matcher", () =>
  ok(/selectEmpathyPrompt\(stageNum, ctx, lastFired, atStage\)/.test(reflect),
     "without the rotation offset only two prompts per stage ever fire"));

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
