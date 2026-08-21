/**
 * tools/verify-count1.mjs
 * 21 Aug 2026 v2
 * GATE-PATH. Path resolution only -- no assertion changed.
 *
 * 12 Aug 2026 v1
 *
 * COUNT-1. One definition of "a session that happened".
 *
 * Graeme, device pass part 4: "7 out of 3 sessions registered on both
 * home and progress pages, but not in the 'Build your base' section in
 * progress which is the reliable data. These need to match and I would
 * guess the 'build your base' data collection is correct."
 *
 * He was right. Three surfaces, three rules:
 *   today.js         every activityLog entry, partials included    -> 7
 *   progress.js      every entry in the window, partials included  -> 7
 *   programmeEngine  activeProgramme.totalSessions, completions    -> 2
 *
 * The two prominent numbers were inflated by every session opened and
 * backed out of, and the accurate one was buried inside a programme card.
 * Nothing errored; the person just had three answers and no way to know
 * which to believe.
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

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}\n        got: ${a}  want: ${b}`); };
const ok = (c, m) => { if (!c) throw new Error(m); };

console.log("\nTEST 1 - the shared definition");
check("partials are excluded", () => {
  const log = [
    { id: "a", status: "completed" },
    { id: "b", status: "partial"   },
    { id: "c", status: "completed" },
    { id: "d", status: "partial"   },
  ];
  eq(store.completedSessions(log).length, 2, "a partial is not a session you did");
});
check("entries with no status still count", () => {
  // Self-logged and older entries predate the field. Absence of "partial"
  // is not absence of a session.
  eq(store.completedSessions([{ id: "x" }, { id: "y", status: "completed" }]).length, 2,
     "excluding unstatused entries would silently drop every self-logged walk");
});
check("junk in resolves to empty, not a crash", () => {
  eq(store.completedSessions(null).length, 0, "null");
  eq(store.completedSessions([null, undefined]).length, 0, "holes");
});

console.log("\nTEST 2 - every surface uses it");
for (const [f, label] of [["js/views/today.js", "Home"], ["js/views/progress.js", "Progress"]])
  check(`${label} counts completions only`, () => {
    const s = fs.readFileSync(f, "utf8");
    ok(/store\.completedSessions\(/.test(s), "still counting raw activityLog");
    // E2, 13 Aug 2026. This was `ok(via >= 2, ...)` -- a FLOOR, asserting
    // that at least two reads were compliant rather than that all were.
    // progress.js had three reads, two compliant, and the gate stayed
    // green while the export quietly counted partials for weeks. A
    // threshold gate cannot detect the case it exists for.
    //
    // Now: the number of raw reads NOT wrapped in completedSessions()
    // must be zero. Comments stripped first, because this file's own
    // change notes quote the pattern they warn about.
    const src = s.replace(/\/\*[\s\S]*?\*\//g, "")
                 .replace(/^\s*\/\/[^\n]*$/gm, "");
    const total = (src.match(/store\.get\('activityLog'\)/g) || []).length;
    const via   = (src.match(/store\.completedSessions\(store\.get\('activityLog'\)\)/g) || []).length;
    ok(via >= 1, "no read goes through the shared rule at all");
    ok(total === via,
       `${total - via} of ${total} activityLog reads bypass store.completedSessions(). ` +
       "Every count a person can see -- on screen OR in an export they hand to a " +
       "clinician -- must come from one rule");
  });
check("Home and Progress agree by construction", () => {
  const a = fs.readFileSync("js/views/today.js", "utf8");
  const b = fs.readFileSync("js/views/progress.js", "utf8");
  ok(/completedSessions/.test(a) && /completedSessions/.test(b),
     "if either counts differently the two screens disagree again");
});

console.log("\nTEST 2b - the empathy arc counts real sessions only");
check("reflect.js getSessionCount excludes partials", () => {
  const s = fs.readFileSync("js/views/reflect.js", "utf8");
  const fn = s.slice(s.indexOf("function getSessionCount"), s.indexOf("// EMP-1 thresholds"));
  ok(/completedSessions/.test(fn),
     "a session opened and abandoned moved somebody toward their next empathy " +
     "prompt AND toward the next stage of the arc - so a prompt meant to arrive " +
     "after accumulated experience could arrive after none");
});

console.log("\nTEST 3 - partials are still RECORDED, just not counted");
check("nothing filters partials out of activityLog itself", () => {
  const s = fs.readFileSync("js/store.js", "utf8");
  ok(!/activityLog.*filter.*status !== 'partial'/.test(s),
     "a partial is a real record - it is how the app knows you started, " +
     "and continuity reads it. It is just not a session you did");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
