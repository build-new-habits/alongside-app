/**
 * tools/verify-skip.mjs
 * 06 Sep 2026 v1
 *
 * SKIP. A skip is a skip. It is not a difficulty rating.
 *
 * ── WHAT WAS WRONG ──────────────────────────────────────────────────
 *
 * gym-programme.js's "Skip this one" called
 * store.logExerciseFeedback(id, 'too-hard') on every press.
 *
 * Two things follow from that, and the second is the worse one.
 *
 * Skip lives on the DECIDE page -- it is offered BEFORE the exercise is
 * attempted. So the app recorded a judgement about difficulty that the
 * person had not made and, having not done the exercise, could not have
 * made.
 *
 * And the signal is not inert. applyFeedbackWeighting() drops an
 * exercise's programmeScore to 0.5 on two 'too-hard' entries in the last
 * five. So skipping twice for any reason at all -- short on time, wrong
 * room, changed their mind, someone at the door -- quietly deprioritised
 * that exercise exactly as if the person had twice pressed "That was too
 * hard" on purpose.
 *
 * The evidence base does not support the inference either. A systematic
 * review and several studies give motivation, pain or discomfort, poor
 * health, fatigue, lack of time, competing priorities, weather and fear
 * of injury as the reasons people skip. "Too hard" barely features.
 *
 * ── PT-12's REASONING WAS TRUE FOR ONE DAY ──────────────────────────
 *
 * The skip write was added on 11 Aug because exerciseFeedback was read
 * by applyFeedbackWeighting() and written by nothing. That was correct
 * on 11 Aug. FEED-1 shipped the explicit two-button control on 12 Aug,
 * imported, rendered and attached in all four session runners, and the
 * justification expired -- but the code and the schema entry both stayed.
 *
 * So this removal does NOT return the reader to empty data. It leaves
 * exactly one writer: the one where the person chose to say something.
 * The first assertions below prove that, because a removal that silently
 * broke the weighting would be a worse fault than the one it fixed.
 *
 * ── WHAT REPLACES IT: NOTHING ───────────────────────────────────────
 *
 * Graeme's ruling. No reason is written at all. The skip is still
 * recorded as a skip -- activityLog.exerciseIds carries what was DONE,
 * so a skipped exercise is absent from it. That is a fact about what
 * happened and carries no claim about why.
 *
 * No prompt, no "why did you skip?", no chip shown on skip. A question
 * at the point of friction is measurement pressure, which is the thing
 * this product is built against.
 *
 * ── FIXTURE REACH ───────────────────────────────────────────────────
 *
 * Eight fixtures failed to reach their branch on 6 Sep. "No feedback was
 * written" passes trivially if the button was never found, if the view
 * never mounted, or if the store was already frozen. So this gate proves
 * the click LANDED before it concludes anything from silence: the view
 * mounts, the button exists on DECIDE, and the click demonstrably
 * advances the card. Only then does absence mean anything.
 *
 * Reversals: restoring the too-hard write; asserting the explicit
 * control still writes; asserting the weighting still moves on real
 * explicit feedback.
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM('<!doctype html><html><body><div id="main-content"></div></body></html>',
  { url: "https://example.org/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
globalThis.history = dom.window.history; globalThis.location = dom.window.location;
globalThis.requestAnimationFrame = cb => setTimeout(cb, 0);
globalThis.scrollTo = () => {};

let pass = 0, fail = 0; const fails = [];
const ok = (m, c) => { if (c) { pass++; console.log("  ok   " + m); }
  else { fail++; fails.push(m); console.log("  FAIL " + m); } };
const reverses = (m, fn) => ok("[reversal] " + m, !fn());
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const click = el => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

const fs = await import("node:fs");
const { store } = await import("../js/store.js");
const { router } = await import("../js/router.js");
const gp = await import("../js/views/gym-programme.js");

const SESSION = { session: { exercises: [
  { id: "goblet-squat", name: "Goblet squat", reps: "8", sets: 3, cues: ["Chest tall"] },
  { id: "band-row",     name: "Band row",     reps: "10", sets: 3, cues: ["Elbows back"] },
] } };
const el = document.getElementById("main-content");
const mount = () => {
  store.set("tier", "personal");
  store.set("generatedSession", JSON.parse(JSON.stringify(SESSION)));
  store.set("gymProgrammeSession", "A");
  store.set("exerciseFeedback", []);
  gp.GymProgrammeView(router).mount(el);
};

console.log("\nSKIP — a skip records no reason\n");

// ── 1. FIXTURE REACH. Prove the click lands before reading silence. ─
mount();
ok("FIXTURE REACHES THE VIEW: the session screen mounted", el.innerHTML.length > 500);
const skip = document.getElementById("gp-skip-btn");
ok("FIXTURE REACHES THE BUTTON: gp-skip-btn is on the DECIDE page", !!skip);
if (!skip) { console.log("\n  cannot proceed without the button\n"); process.exit(1); }

const firstName = el.innerHTML.includes("Goblet squat");
ok("FIXTURE REACHES EXERCISE ONE: the first exercise is on screen", firstName);

const before = JSON.stringify(store.get("exerciseFeedback") || []);
click(skip);
const movedOn = el.innerHTML.includes("Band row");
ok("THE CLICK LANDED: the card advanced to the next exercise", movedOn);
reverses("the click is not a no-op (which would make every absence below meaningless)",
  () => !movedOn);

// ── 2. The fix itself. ──────────────────────────────────────────────
const after = store.get("exerciseFeedback") || [];
ok("a skip writes NOTHING to exerciseFeedback", after.length === 0);
ok("and specifically no 'too-hard' against the skipped exercise",
  !after.some(e => e.exerciseId === "goblet-squat"));
ok("exerciseFeedback is unchanged across the skip", JSON.stringify(after) === before);
reverses("the skipped exercise did not acquire a difficulty rating it never earned",
  () => after.some(e => e.feedback === "too-hard"));

// Skipping repeatedly must stay silent -- two was the threshold that
// moved programmeScore, so two is the number to press.
mount();
click(document.getElementById("gp-skip-btn"));
const second = document.getElementById("gp-skip-btn");
ok("FIXTURE REACHES A SECOND SKIP: the button is present on the next card", !!second);
if (second) click(second);
ok("two consecutive skips still write nothing",
  (store.get("exerciseFeedback") || []).length === 0);

// ── 3. The source, so a future edit cannot quietly reinstate it. ────
const src = strip(fs.readFileSync(new URL("../js/views/gym-programme.js", import.meta.url), "utf8"));
ok("gym-programme.js calls logExerciseFeedback nowhere",
  !/logExerciseFeedback\s*\(/.test(src));
ok("and writes no reason string on the skip path",
  !/["']too-hard["']/.test(src));

// ── 4. The reader is NOT starved. This is the risk of the removal. ──
const feedbackSrc = strip(fs.readFileSync(new URL("../js/exercise-feedback.js", import.meta.url), "utf8"));
ok("the explicit control is still a writer of exerciseFeedback",
  /store\.logExerciseFeedback\s*\(/.test(feedbackSrc));
for (const v of ["workout", "gym-programme", "core-session", "prescribed-session"]) {
  const vs = strip(fs.readFileSync(new URL(`../js/views/${v}.js`, import.meta.url), "utf8"));
  ok(`${v}.js still renders the explicit feedback control`,
    /renderFeedbackControl\s*\(/.test(vs) && /attachFeedbackEvents\s*\(/.test(vs));
}

// And it still MOVES the weighting, on data the person actually gave.
const ex = await import("../js/data/exercises/index.js");
const weight = ex.applyFeedbackWeighting;
ok("FIXTURE REACHES THE READER: applyFeedbackWeighting is exported",
  typeof weight === "function");
if (typeof weight === "function") {
  const now = new Date().toISOString();
  store.set("exerciseFeedback", [
    { exerciseId: "goblet-squat", feedback: "too-hard", at: now },
    { exerciseId: "goblet-squat", feedback: "too-hard", at: now },
  ]);
  const pool = weight([{ id: "goblet-squat", programmeScore: 1 },
                       { id: "band-row",     programmeScore: 1 }]);
  const squat = pool.find(e => e.id === "goblet-squat");
  const row   = pool.find(e => e.id === "band-row");
  ok("two EXPLICIT too-hard entries still deprioritise that exercise",
    squat && squat.programmeScore === 0.5);
  ok("and an untouched exercise is left alone", row && row.programmeScore === 1);
  reverses("the weighting is not inert (which would make the removal look safe wrongly)",
    () => squat && squat.programmeScore === 1);
}

console.log("\n  " + pass + " passed, " + fail + " failed");
if (fail) { console.log("\n  FAILED:\n" + fails.map(f => "    - " + f).join("\n") + "\n"); process.exit(1); }
console.log("");
