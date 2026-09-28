/**
 * tools/verify-burn1.mjs
 * 28 Sep 2026 v3
 *
 * v3 - Work list 2e. TEST 4 read workoutGenerator.js, which nothing had
 *   called since 6 Sep. Re-pointed at every LIVE caller, found by
 *   scanning the app rather than typed: each passes the history, and the
 *   builder reads .level. "The recovery pool gate is reachable" is
 *   retired with the engine: the live builder treats moderate and high
 *   alike (a recorded decision, BURNOUT-LIVE), and verify-burnout-live
 *   drives the session it shapes. TESTS 1-3 unchanged.
 *
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
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

// ── GATE-PATH, 21 Aug 2026 ─────────────────────────────────────────
// Resolved from THIS FILE, never hardcoded. This gate previously
// imported an absolute /home/claude/repo path: cloned anywhere else it
// went red, and -- worse -- if that directory existed from an earlier
// session it read THAT copy and reported green on code nobody was
// editing. Five reversals of the merge guard passed exactly this way.
import { fileURLToPath as __f } from "node:url";
import { dirname as __d, resolve as __r } from "node:path";
const __REPO = __r(__d(__f(import.meta.url)), "..");
import fs from "node:fs";
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: k => { delete mem[k]; },
};
const { store } = await import(__REPO + "/js/store.js");
store.init();
const { detectBurnout } = await import(__REPO + "/js/data/checkin.js");

// GATE-PATH, 08 Sep 2026. Paths resolved from import.meta.url, not the
// working directory.
//
// 72 of 139 gates read files by a path relative to process.cwd(), so
// they were green from the repo root and read NOTHING from anywhere
// else. Not a live fault -- every session so far has run them from the
// root -- but an expensive trap: a session running the suite by full
// path from elsewhere sees most of it red and reasonably concludes the
// app is broken.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);


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
check("grades map to what the live callers branch on", () => {
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
const cp  = fs.readFileSync(_gatePath("js/views/coach-proposal.js"), "utf8");
const sb  = fs.readFileSync(_gatePath("js/session-builder.js"), "utf8");
const _strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/[^\n]*$/gm, "");
const _walk = d => fs.readdirSync(_gatePath(d), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? _walk(d + e.name + "/") : (e.name.endsWith(".js") ? [d + e.name] : []));
const callers = _walk("js/").filter(f => f !== "js/data/checkin.js")
  .map(f => [f, _strip(fs.readFileSync(_gatePath(f), "utf8"))])
  .filter(([, s]) => /detectBurnout\(/.test(s));
check("the scan finds the live callers (fixture reach)", () =>
  ok(callers.length >= 3 && callers.some(([f]) => f === "js/session-builder.js"),
     "found: " + callers.map(([f]) => f).join(", ")));
check("no argument-less call survives anywhere", () => {
  for (const [f, s] of callers)
    ok(!/detectBurnout\(\)/.test(s), `${f} still calls it with no argument`);
});
check("coach-proposal reads .level rather than truthiness", () =>
  ok(/burnoutState\.level !== 'none'/.test(cp),
     "an object is always truthy, so a raw truthy test would report burnout for everybody"));
check("and so does the builder that shapes the session", () =>
  ok(/detectBurnout\(store\.get\("checkinHistory"\) \|\| \{\}\)\.level !== "none"/.test(sb),
     "verify-burnout-live drives what this shapes"));

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
