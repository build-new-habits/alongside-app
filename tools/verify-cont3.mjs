/**
 * tools/verify-cont3.mjs
 * 12 Aug 2026 v1
 *
 * CONT-3 / PRESC-1 / LOG-3 gate.
 *
 * The failures here were all silent. Nothing errored; sessions simply
 * never became familiar, and one of them was never recorded at all.
 */
import fs from "node:fs";
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/<!--[\s\S]*?-->/g, "")
                    .replace(/^\s*\/\/[^\n]*$/gm, "");
const read = f => strip(fs.readFileSync(`js/views/${f}.js`, "utf8"));

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

console.log("\nCONT-3 - every session view that completes exercises supplies their ids");
for (const v of ["workout", "gym-programme", "core-session", "yoga-session", "prescribed-session"])
  check(`${v} supplies exerciseIds`, () =>
    ok(/exerciseIds:/.test(read(v)),
       "logs a count only, so store.recordExercises() never fires and these exercises " +
       "never become familiar - continuity selection and the 21-day drop-in window cannot see them"));

console.log("\nPRESC-1 - a finished prescribed session is actually recorded");
const ps = read("prescribed-session");
check("completeSession() logs the session", () => {
  const fn = ps.slice(ps.indexOf("function completeSession"), ps.indexOf("function cleanupSession"));
  ok(/logActivity\(/.test(fn),
     "it awarded credits and navigated away - a FINISHED prescribed session was recorded " +
     "only if abandoned, and then only as partial");
  ok(/status:\s*"completed"/.test(fn), "must log as completed, not partial");
});
check("it has a session clock (PT-3)", () => {
  ok(/let sessionStartTime = null;/.test(ps), "no clock, so durationMins would be undefined");
  ok(/sessionStartTime === null\) sessionStartTime = Date\.now\(\)/.test(ps),
     "unguarded latch would restart the clock on every navigate back");
  ok(/sessionStartTime = null;\s*\/\/ PT-3/.test(fs.readFileSync("js/views/prescribed-session.js","utf8")),
     "clock must reset between sessions");
});

console.log("\nLOG-3 - session notes reach the card-shaped views");
for (const v of ["workout", "gym-programme", "core-session", "prescribed-session", "yoga-session"])
  check(`${v} renders the note block`, () =>
    ok(/renderLogBlock\(/.test(read(v)), "no way to write anything down"));
check("yoga alone uses gentle mode", () => {
  ok(/"gentle"/.test(read("yoga-session")), "yoga must not offer reps or levels");
  for (const v of ["core-session", "prescribed-session"])
    ok(!/"gentle"/.test(read(v)), `${v} should use the full field set`);
});
check("id prefixes are per-exercise everywhere", () => {
  for (const [v, p] of [["core-session","cs-log-"],["prescribed-session","ps-log-"],["yoga-session","ys-log-"]])
    ok(new RegExp(`${p}\\$\\{current`).test(read(v)),
       `${v}: a fixed id lets one exercise's numbers be written onto another`);
});

console.log("\nLOG-4 - single-activity views capture what the app cannot measure");
for (const [v, mode] of [["walk-session","distance"],["running-session","distance"],
                         ["cycle-session","distance"],["swim-session","lengths"]])
  check(`${v} captures ${mode}`, () => {
    const s = read(v);
    ok(new RegExp(`renderLogBlock\\(LOG_SUBJECT, "[a-z]+-log", "${mode}"\\)`).test(s),
       `no ${mode} capture on the completion screen`);
    ok(/attachLogEvents\(LOG_SUBJECT/.test(s), "block would render but never save");
    ok(/id: "activity-[a-z]+"/.test(s),
       "needs a stable synthetic id, or every session is an orphaned entry");
  });
check("these modes never ask for duration", () => {
  const shared = fs.readFileSync("js/session-log.js", "utf8");
  for (const mode of ["distance", "lengths"]) {
    const m = shared.match(new RegExp(`if \\(mode === "${mode}"\\) \\{[\\s\\S]*?\\n  \\}`));
    ok(m, `${mode} branch not found`);
    ok(!/durationMins/.test(m[0]),
       `${mode} must not ask for a number the live clock already writes`);
  }
});
check("the block sits before the actions, not after", () => {
  for (const v of ["walk-session","running-session","cycle-session","swim-session"]) {
    const s = read(v);
    const block = s.indexOf("renderLogBlock(LOG_SUBJECT");
    const btn   = s.indexOf("btn btn-primary btn-full", block);
    ok(block !== -1 && btn !== -1 && block < btn,
       `${v}: stranded underneath the buttons, where nobody fills it in`);
  }
});

console.log("\nRestoration views stay excluded");
for (const v of ["breathing-session", "quiet-session"])
  check(`${v} has no note block`, () =>
    ok(!/renderLogBlock/.test(read(v)), "these exist to stop measuring"));

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
