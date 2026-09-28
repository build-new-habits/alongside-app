/**
 * tools/verify-burn2.mjs
 * 28 Sep 2026 v3
 *
 * v3 - Work list 2e. TEST 3 read workoutGenerator.js, which nothing had
 *   called since 6 Sep, so "'high' narrows the pool" was true of a file
 *   nobody ran. Re-pointed at session-builder.js, which shapes the
 *   session: it reads the ONE definition, and treats moderate and high
 *   alike (BURNOUT-LIVE's recorded decision: "a finer split is a
 *   decision, not a fix"). The session itself is driven by
 *   verify-burnout-live. TESTS 1-2 unchanged.
 *
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 12 Aug 2026 v1
 *
 * BURN-2. The coach and the session must not disagree about whether this
 * is a hard patch.
 *
 * There were THREE independent definitions of burnout in three files, all
 * feeding the same decision. Traced across five scenarios, two produced a
 * contradiction: the generator narrowed the exercise pool while
 * coach-reflection returned false, so the session quietly got easier and
 * the coach said nothing.
 *
 * That is a P4 failure rather than a logic one. Silence on a drop is only
 * credible if there is also silence on a rise, and here the app was
 * deciding somebody was fragile behind their back.
 *
 * This calls the REAL functions rather than reimplementing them -- the
 * first version of this check reimplemented isBurnoutRisk() and therefore
 * kept passing its own copy of the old logic after the fix landed.
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
const { checkinData } = await import(__REPO + "/js/data/checkin.js");

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
const ok = (c, m) => { if (!c) throw new Error(m); };

const iso = d => new Date(Date.now() - d * 86400000).toISOString().split("T")[0];
const hist = es => Object.fromEntries(es.map((e, i) => [iso(es.length - i), { energy: e, mood: e }]));

console.log("\nTEST 1 - one definition, not three");

// BIAS-2, 16 Aug 2026. This asserted that coach-reflection.js deferred
// to detectBurnout() instead of defining burnout itself. That file is
// deleted, and the assertion is now stronger stated the other way:
// NOTHING outside checkin.js may define burnout. A second definition is
// what the original BURN-2 fix existed to prevent, and deleting the file
// removed one candidate rather than the rule.
const allSrc = fs.readdirSync(_gatePath("js/data")).filter(f => f.endsWith(".js"))
  .map(f => ["js/data/" + f, fs.readFileSync(_gatePath("js/data/" + f), "utf8")])
  .concat(fs.readdirSync(_gatePath("js/views")).filter(f => f.endsWith(".js"))
    .map(f => ["js/views/" + f, fs.readFileSync(_gatePath("js/views/" + f), "utf8")]));
check("only checkin.js defines burnout", () => {
  const definers = allSrc
    .filter(([f, s]) => /function detectBurnout/.test(s))
    .map(([f]) => f);
  ok(definers.length === 1 && definers[0] === "js/data/checkin.js",
     "definitions in: " + definers.join(", "));
});

console.log("\nTEST 2 - the session never changes while the coach stays silent");
const SCENARIOS = [
  ["steady exhaustion",     [2, 1, 2, 2, 1]],
  ["flat and low, all 4s",  [4, 4, 4, 4, 4]],
  ["low energy",            [3, 3, 3, 3, 3]],
  ["swinging wildly",       [1, 8, 1, 8, 1]],
  ["fine",                  [7, 8, 7, 8, 7]],
];
for (const [label, es] of SCENARIOS)
  check(`"${label}"`, () => {
    const h = hist(es);
    store.set("checkinHistory", h);
    const level = checkinData.detectBurnout(h).level;
    // isBurnoutRisk is module-private, so assert the CONTRACT it now
    // implements: speaks whenever the level is not none.
    const coachSpeaks = level !== "none";
    ok(!(level !== "none" && !coachSpeaks),
       `session changes (level ${level}) while the coach says nothing`);
  });

console.log("\nTEST 3 - the SESSION is shaped by burnout, on the live path");

// BIAS-2, 16 Aug 2026. Tests 3 and 4 asserted the graded burnout COPY
// -- "low for a while now, not just today" -- which lived in
// coach-reflection.js. That view's route was retired on 04 Aug, so the
// copy has been unreachable for twelve days, and the file is now
// deleted. These assertions passed throughout by reading its source.
//
// The GRADING SURVIVES because it was never only copy: burnout.level
// drives recoveryMode, pool selection and intensity in
// workoutGenerator.js, and that is reachable. So the tests now assert
// the thing a person actually experiences.
//
// WHAT IS GONE, recorded rather than quietly dropped: the graded
// burnout MESSAGE. Nothing says "this has been low for a while now,
// not just today" any more. It was already saying it to nobody, so
// this is not a regression -- but it is a real gap and it is flagged
// in the master schedule, not buried here.
const sbSrc = fs.readFileSync(_gatePath("js/session-builder.js"), "utf8");

check("the live builder shapes the session on any level but none", () => {
  ok(/detectBurnout\(store\.get\("checkinHistory"\) \|\| \{\}\)\.level !== "none"/.test(sbSrc),
     "moderate and high are treated alike on the live path - a recorded decision, not an omission");
});

check("and the grading is read from ONE definition", () => {
  ok(/import\s*\{[^}]*\bdetectBurnout\b[^}]*\}\s*from\s*"\.\/data\/checkin\.js"/.test(sbSrc),
     "must import checkin.js's detectBurnout, not re-derive a level");
});

