/**
 * tools/verify-card-tdz.mjs
 * 06 Sep 2026 v1
 *
 * CARD-TDZ. The exercise card is executed, not read.
 *
 * ── WHAT WAS BROKEN ─────────────────────────────────────────────────
 *
 * renderExerciseCard() threw ReferenceError: Cannot access 'cueBlock'
 * before initialization, on EVERY call. `const decide = [cueBlock, ...]`
 * sat at line 144; `const cueBlock` was declared at line 183. One
 * function body, no branch between them. Five option shapes tried, five
 * threw.
 *
 * The throw is not caught anywhere. It propagates out through
 * renderCurrentExercise -> renderSession -> mount, so the whole view
 * fails to mount. Not a degraded card: a dead screen, in all four
 * session runners -- workout, gym-programme, core-session,
 * prescribed-session.
 *
 * Introduced by CUE-UNPIN, commit 71ae19d, 3 Sep 2026. The same commit
 * added the use and the declaration and put the declaration below the
 * use. Live for three days.
 *
 * ── WHY 109 GATES AND node --check ALL PASSED ───────────────────────
 *
 * The only mention of renderExerciseCard anywhere in tools/ was a regex
 * over source text in verify-core1.mjs:126. Not one gate CALLED it. And
 * a temporal dead zone is a runtime error, not a syntax error, so
 * `node --check` passes cleanly on a file that cannot run.
 *
 * That is the whole reason this gate exists and the reason it executes.
 * A source-slice assertion could not have caught this and a second one
 * would not catch the next of its kind. So the first assertions below
 * CALL the function; the positional source check at the end is a
 * secondary guard, not the primary one.
 *
 * ── THE FIX MUST NOT SILENTLY UNDO CUE-UNPIN ────────────────────────
 *
 * Moving the declaration up is one line, and the cheap wrong version of
 * it is to hoist the lead cue back into `pinned`, which would restore
 * the exact fault CUE-UNPIN fixed on 2 Sep: the same coaching paragraph
 * on DECIDE, DO and NOTE. So this gate pins CUE-UNPIN's intent as well
 * as the crash: lead cue on DECIDE only, caution on all three.
 *
 * ── FIXTURE REACH ───────────────────────────────────────────────────
 *
 * Eight fixtures failed to reach the branch they named on 6 Sep. So the
 * fixture is proved before anything is concluded from it: the exercise
 * really does carry a lead cue, and the store really does produce a
 * caution, BEFORE any assertion about where they appear. A fixture with
 * no cue would pass "no cue on the DO page" while proving nothing.
 *
 * Reversals: re-declaring cueBlock below its use; moving the lead cue
 * into `pinned`; emptying the cue fixture.
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: "https://example.org/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let pass = 0, fail = 0; const fails = [];
const ok = (m, c) => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); } };
const reverses = (m, fn) => ok("[reversal] " + m, !fn());
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const fs = await import("node:fs");
const { store } = await import("../js/store.js");
const { renderExerciseCard } = await import("../js/exercise-card.js");

const LEAD_CUE = "Chest tall and proud";
const EX = {
  id: "goblet-squat", name: "Goblet squat", reps: "8", sets: 3,
  load: "12 kg", holdSeconds: 2,
  cues: [LEAD_CUE, "Breathe out on the way up"],
  watchOut: ["Knees falling inwards"],
  instructions: ["Hold the weight at your chest", "Sit down between your hips"],
};

// A sore condition, so bodyCaution() returns a line. `lower-back` is a
// real condition id -- `shoulders` is a ZONE name and would produce
// nothing, which is the 6 Sep trap.
store.set("conditions", ["lower-back"]);
store.set("conditionPainScores", { "lower-back": 5 });

console.log("\nCARD-TDZ — the exercise card actually runs\n");

// ── 1. IT RUNS AT ALL. This is the assertion that was missing. ──────
const SHAPES = [{}, { page: "decide" }, { page: "do" }, { page: "note" }, { full: true }];
const out = [];
let threw = null;
for (const opts of SHAPES) {
  try { out.push(renderExerciseCard(EX, opts)); }
  catch (e) { threw = threw || (JSON.stringify(opts) + " -> " + e.message); out.push(null); }
}
ok("renderExerciseCard() does not throw on any option shape"
   + (threw ? "  [threw: " + threw + "]" : ""), threw === null);
ok("every option shape returns a non-empty string",
   out.every(h => typeof h === "string" && h.length > 0));

// Guard the empty-exercise contract while we are here: it returns "",
// it does not throw either.
let emptyOk = true;
try { emptyOk = renderExerciseCard(null) === ""; } catch { emptyOk = false; }
ok("a missing exercise returns \"\" rather than throwing", emptyOk);

if (threw !== null) {
  console.log("\n  (card throws — page-scope assertions cannot be evaluated)\n");
  console.log("  " + pass + " passed, " + fail + " failed\n");
  process.exit(1);
}

const decideHtml = renderExerciseCard(EX, { page: "decide" });
const doHtml     = renderExerciseCard(EX, { page: "do" });
const noteHtml   = renderExerciseCard(EX, { page: "note" });
const flatHtml   = renderExerciseCard(EX, { full: true });

// ── 2. FIXTURE REACH, before any conclusion is drawn from absence ───
ok("FIXTURE REACHES A LEAD CUE: the cue text renders on DECIDE",
   decideHtml.includes(LEAD_CUE));
ok("FIXTURE REACHES A CAUTION: bodyCaution produced a line",
   /exercise-caution/.test(decideHtml));
reverses("the cue fixture is not silently empty (which would pass every absence test below)",
   () => LEAD_CUE.trim() === "" || !EX.cues.length);

// ── 3. CUE-UNPIN's intent, which the fix must not undo ──────────────
ok("lead cue does NOT appear on DO", !doHtml.includes(LEAD_CUE));
ok("lead cue does NOT appear on NOTE", !noteHtml.includes(LEAD_CUE));
ok("caution IS pinned to DECIDE", /exercise-caution/.test(decideHtml));
ok("caution IS pinned to DO", /exercise-caution/.test(doHtml));
ok("caution IS pinned to NOTE", /exercise-caution/.test(noteHtml));
ok("the flat \"show everything\" card carries the lead cue once",
   (flatHtml.match(new RegExp(LEAD_CUE, "g")) || []).length === 1);

// ── 4. Safety order survives: hazards before instructions on DO ─────
const iWatch = doHtml.indexOf("Knees falling inwards");
const iInstr = doHtml.indexOf("Hold the weight at your chest");
ok("FIXTURE REACHES BOTH: hazard and instruction are on the DO page",
   iWatch > -1 && iInstr > -1);
ok("hazards render before instructions on DO", iWatch < iInstr);

// ── 5. Secondary source guard: declaration precedes use ─────────────
// Positional, indexOf against indexOf, on comment-stripped source, so a
// comment naming the thing it replaced cannot move it.
const src = strip(fs.readFileSync(new URL("../js/exercise-card.js", import.meta.url), "utf8"));
const iDecl = src.indexOf("const cueBlock");
const iUse  = src.indexOf("const decide");
ok("FIXTURE REACHES THE SOURCE: both cueBlock and decide are declared",
   iDecl > -1 && iUse > -1);
ok("cueBlock is declared before the array that uses it", iDecl < iUse);
reverses("cueBlock is not declared after its use", () => iDecl > iUse);

console.log("\n  " + pass + " passed, " + fail + " failed");
if (fail) { console.log("\n  FAILED:\n" + fails.map(f => "    - " + f).join("\n") + "\n"); process.exit(1); }
console.log("");
