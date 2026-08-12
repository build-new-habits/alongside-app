/**
 * tools/verify-burn1.mjs
 * 12 Aug 2026 v1
 *
 * BURN-1. Found by tracing the perimenopause persona -- somebody whose
 * whole profile is unpredictable energy, and precisely who burnout
 * detection exists for.
 *
 * Two faults, stacked, neither of which errored:
 *   1. workoutGenerator.js called detectBurnout() with NO ARGUMENT, so it
 *      returned false on the first line, every time, for everybody.
 *   2. Seven places then read burnout.level on that boolean -- undefined,
 *      so every comparison was false, including the one gating
 *      filterToRecoveryPool().
 *
 * The shape mismatch hid the missing argument and the missing argument
 * hid the shape mismatch. The recovery path had never run.
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
const { detectBurnout } = await import("/home/claude/repo/js/data/checkin.js");

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}\n        got: ${a}  want: ${b}`); };
const ok = (c, m) => { if (!c) throw new Error(m); };

const iso = d => new Date(Date.now() - d * 86400000).toISOString().split("T")[0];
const hist = energies => Object.fromEntries(energies.map((e, i) => [iso(energies.length - i), { energy: e }]));

console.log("\nTEST 1 - it returns a graded object, which is what callers read");
check("shape is { level, avgEnergy }", () => {
  const r = detectBurnout(hist([7, 7, 7, 7, 7]));
  ok(typeof r === "object" && r !== null, "a boolean makes every .level read undefined");
  ok("level" in r && "avgEnergy" in r, "missing keys");
});
check("grades map to what workoutGenerator branches on", () => {
  eq(detectBurnout(hist([8, 7, 8, 7, 8])).level, "none",     "good week");
  eq(detectBurnout(hist([4, 3, 4, 4, 3])).level, "moderate", "a rough patch");
  eq(detectBurnout(hist([2, 2, 3, 2, 1])).level, "high",     "sustained exhaustion");
});

console.log("\nTEST 2 - the missing-argument fault cannot recur");
check("no argument falls back to the store, not to false", () => {
  store.set("checkinHistory", hist([2, 2, 2, 2, 2]));
  eq(detectBurnout().level, "high",
     "this returned false for everybody, forever - the original bug");
});
check("junk argument also falls back rather than failing open", () => {
  store.set("checkinHistory", hist([2, 1, 2, 2, 1]));
  eq(detectBurnout("nonsense").level, "high", "failed open");
});

console.log("\nTEST 3 - not enough data says nothing, rather than guessing");
check("fewer than 3 check-ins -> none", () => {
  eq(detectBurnout({ [iso(1)]: { energy: 1 } }).level, "none", "two days is not a pattern");
});
check("the original boolean threshold still registers", () => {
  ok(detectBurnout(hist([4, 4, 4, 4, 4])).level !== "none",
     "avg 4 registered before this change and must still register");
});

console.log("\nTEST 4 - call sites");
const gen = fs.readFileSync("js/data/workoutGenerator.js", "utf8");
const cp  = fs.readFileSync("js/views/coach-proposal.js", "utf8");
check("workoutGenerator passes the history", () =>
  ok(/detectBurnout\(store\.get\("checkinHistory"\)/.test(gen),
     "an argument-less call returns none for everybody"));
check("no argument-less call survives anywhere", () => {
  for (const [f, s] of [["workoutGenerator.js", gen], ["coach-proposal.js", cp]])
    ok(!/detectBurnout\(\)/.test(s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/[^\n]*$/gm, "")),
       `${f} still calls it with no argument`);
});
check("coach-proposal reads .level rather than truthiness", () =>
  ok(/burnoutState\.level !== 'none'/.test(cp),
     "an object is always truthy, so a raw truthy test would report burnout for everybody"));
check("the recovery pool gate is reachable", () =>
  ok(/recoveryMode: burnout\.level === "high"/.test(gen),
     "this is what filterToRecoveryPool() hangs off"));

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
