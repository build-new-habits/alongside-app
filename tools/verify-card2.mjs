/**
 * tools/verify-card2.mjs
 * 31 Aug 2026 v1
 *
 * Gate for CARD-2. Replaces verify-card1.mjs, whose disclosure model this
 * supersedes. The assertions that mattered there are carried over, not
 * dropped -- caution first, hazards not buried, no history count on
 * screen -- because the reason for each is unchanged even though the
 * mechanism is different.
 *
 * The risk specific to tabs: content behind a tab is MORE hidden than
 * content behind a collapsed section, because you must know the tab
 * exists. Anything safety-bearing therefore lives above the tablist, and
 * most of this file exists to keep it there.
 *
 * NO NEGATIVE DISTANCE WINDOWS. Positional assertions compare indexOf to
 * indexOf, which cannot pass by drifting.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const cardRaw = fs.readFileSync("js/exercise-card.js", "utf8");
const card    = strip(cardRaw);

const VIEWS = ["js/views/workout.js", "js/views/prescribed-session.js",
               "js/views/gym-programme.js", "js/views/core-session.js"];

console.log("\nTEST 1 - safety sits above the tabs, not inside them");

check("the pinned block holds the caution and renders before the tablist", () => {
  const pin = card.indexOf("const pinned =");
  ok(pin > -1, "no pinned block");
  const body = card.slice(pin, card.indexOf("`;", pin));
  ok(body.includes("exercise-caution"), "the caution is not pinned; it would sit inside a layer");
  ok(body.includes("xcard-lead-cue"), "the lead cue is not pinned");
});

check("caution precedes the tablist in both render paths", () => {
  for (const marker of ["exercise-card--flat", 'class="xcard-tabs"']) {
    const at = card.indexOf(marker);
    ok(at > -1, "missing render path: " + marker);
  }
  const tabs = card.indexOf('role="tablist"');
  const pinnedUse = card.indexOf("${pinned}");
  ok(pinnedUse > -1 && pinnedUse < tabs, "pinned content renders after the tablist");
});

check("no layer body can contain the caution", () => {
  for (const name of ["const before =", "const during ="]) {
    const i = card.indexOf(name);
    ok(i > -1, name + " missing");
    const body = card.slice(i, card.indexOf("].join", i));
    ok(!body.includes("caution"), name + " includes the caution; it must stay pinned");
  }
});

console.log("\nTEST 2 - the tablist is a real one");

check("tabs and panels carry the required ARIA", () => {
  for (const a of ['role="tablist"', 'role="tab"', 'role="tabpanel"',
                   "aria-selected", "aria-controls", "aria-labelledby"])
    ok(card.includes(a), "missing " + a);
});

check("roving tabindex, not three tab stops", () => {
  ok(/tabindex="\$\{l\.key === initial \? "0" : "-1"\}"/.test(card),
     "tabs do not use a roving tabindex");
});

check("arrow keys move between tabs", () => {
  ok(card.includes("ArrowRight") && card.includes("ArrowLeft"),
     "no arrow key handling - WCAG expects it of a tablist");
  ok(card.includes("Home") && card.includes("End"), "no Home/End handling");
});

check("hidden panels stay in the DOM", () => {
  ok(card.includes('"hidden"'), "panels are not hidden via the attribute");
  ok(!/display\s*:\s*none/.test(card), "uses display:none rather than the hidden attribute");
});

console.log("\nTEST 3 - P4. Nothing from exerciseHistory reaches this file at all.");

check("exercise-card.js does not read exerciseHistory", () => {
  ok(!/store\.get\(\s*["']exerciseHistory["']\s*\)/.test(card),
     "reads exerciseHistory - CARD-2 removed the familiarity model precisely to remove this exposure");
  ok(!card.includes("_seen("), "the familiarity helper is back");
});

console.log("\nTEST 4 - the layers are wired in every view");

for (const f of VIEWS) {
  const src = strip(fs.readFileSync(f, "utf8"));
  check(f + " uses the shared card", () => {
    ok(src.includes("renderExerciseCard("), "does not call the shared renderer");
    ok(!src.includes("exercise-section-list"), "still builds an inline setup list");
  });
  check(f + " does not render the feedback control outside the card", () => {
    const fb = src.indexOf("renderFeedbackControl(");
    if (fb === -1) return;
    const cardAt = src.indexOf("renderExerciseCard(");
    ok(cardAt > -1 && fb > cardAt,
       "feedback control renders before the card, so it is not in the After layer");
  });
}

check("no view hardcodes running:false on a live timer view", () => {
  for (const f of ["js/views/prescribed-session.js", "js/views/gym-programme.js"]) {
    const src = strip(fs.readFileSync(f, "utf8"));
    ok(!/running:\s*false/.test(src),
       f + " hardcodes running:false while holding real timer state; the layer would never open on During");
  }
});

check("gym-programme's log block is inside the After layer", () => {
  const src = strip(fs.readFileSync("js/views/gym-programme.js", "utf8"));
  const cardAt = src.indexOf("renderExerciseCard(");
  const logAt  = src.indexOf("renderLogBlock(");
  ok(cardAt > -1 && logAt > cardAt,
     "the log block renders before the card again - band, reps and Save before a single rep");
});

console.log("\nTEST 5 - holdSeconds is coaching, not a clock");

check("the card surfaces holdSeconds", () => {
  ok(card.includes("holdSeconds"), "holdSeconds is not shown anywhere; TIME-1 left it for the card");
});

check("the timing resolver still refuses it", () => {
  const timing = strip(fs.readFileSync("js/exercise-timing.js", "utf8"));
  ok(!timing.includes("holdSeconds"),
     "exercise-timing.js reads holdSeconds - a 90 second exercise would end after 3");
});

console.log(fails ? `\n${fails} FAILED\n` : "\nALL PASS\n");
process.exit(fails ? 1 : 0);
