/**
 * tools/verify-bias1.mjs
 * 28 Sep 2026 v3
 *
 * v3 - Work list 2e. This gate proved the bias against workoutGenerator.js,
 *   which nothing had called since 6 Sep. Re-pointed:
 *   - TEST 1 (resolveIntensity's steps) RETIRED with the function: its
 *     only caller was the dead engine. The live rule is one reason at a
 *     time in session-builder.js _gentleReason(), DRIVEN by
 *     verify-gentle-signals (1.3 three days in a row -> gentler, 3.1 two
 *     is not enough). A unit test of a helper nothing calls is rule 5's
 *     exact fault.
 *   - TEST 2 now asserts proposalBias is RETIRED (store v79): not a
 *     default, dropped from stored data on load. It had no writer since
 *     16 Aug and its one reader went with the engine.
 *   - TEST 3 asserts the derived bias has a LIVE reader: the builder.
 *
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
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

console.log("\nTEST 2 - the stored field is retired, and stays gone");
check("proposalBias is not in store.js defaults", () =>
  ok(!("proposalBias" in store.getDefaults()),
     "a declared field nothing reads is how this went nine days the first time"));
check("a stored value from an old install is dropped on load", () => {
  mem["alongside_user"] = JSON.stringify({ ...JSON.parse(mem["alongside_user"] || "{}"), proposalBias: "lighter" });
  store.init();
  eq(store.get("proposalBias"), undefined, "a retired field must not ride along in every install for ever");
});

console.log("\nTEST 3 - reader and writer both exist (PT-12 pattern)");
const chk = fs.readFileSync(_gatePath("js/data/checkin.js"), "utf8");
const sb  = fs.readFileSync(_gatePath("js/session-builder.js"), "utf8");
// 2e: every app module, so "nothing stores it" means nothing, not two files.
const _walk = d => fs.readdirSync(_gatePath(d), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? _walk(d + e.name + "/") : (e.name.endsWith(".js") ? [fs.readFileSync(_gatePath(d + e.name), "utf8")] : []));
const all = _walk("js/").join("\n");

// BIAS-2, 16 Aug 2026. This test used to assert that coach-reflection.js
// CONTAINED a store.set("proposalBias") -- reading the file's source
// text. It passed for twelve days after that view's route was retired,
// because the writer was still in the file and nobody could reach it.
// A source-text assertion cannot see reachability.
//
// The field is now retired and the bias is DERIVED, which is the only
// version of this that cannot rot: a computed value has no writer to
// lose.
check("the bias is derived, not stored", () =>
  ok(/export function coachBias\(/.test(chk), "coachBias() gone"));
check("nothing stores it any more", () =>
  ok(!/store\.set\(['\"]proposalBias/.test(all),
     "a stored bias is a bias that can silently stop being written"));
// 2e. Were "workoutGenerator uses the derived value" and "it is
// combined, not substituted" -- both true of a file nothing ran. The
// live reader is the builder, and it is combined there too: coachBias()
// is ONE reason among five, and today's own words outrank it.
check("the live builder reads the derived value", () =>
  ok(/import\s*\{[^}]*\bcoachBias\b[^}]*\}\s*from\s*"\.\/data\/checkin\.js"/.test(sb) &&
     /coachBias\(\) === "lighter"/.test(sb),
     "session-builder.js must import coachBias and act on 'lighter'"));
check("it is one reason, below today's own energy", () => {
  const body = sb.slice(sb.indexOf("function _gentleReason()"));
  ok(body.indexOf('_todayIntensity() === "low"') > -1 &&
     body.indexOf('_todayIntensity() === "low"') < body.indexOf("coachBias()"),
     "today's words must outrank a run of days - verify-gentle-signals 2.x drives the order");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
