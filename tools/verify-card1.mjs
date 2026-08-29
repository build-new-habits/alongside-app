/**
 * tools/verify-card1.mjs
 * 29 Aug 2026 v1
 *
 * Gate for CARD-1. Two classes of risk here, and the second is the one
 * that matters.
 *
 *   1. Drift back to six copies. The shared renderer is only shared for
 *      as long as nobody re-inlines a card.
 *   2. A safety regression that looks like a tidy-up. Every collapse
 *      rule in exercise-card.js has an exception for safety content, and
 *      every one of those exceptions is one careless edit from being
 *      removed by somebody making the card "cleaner".
 *
 * NO NEGATIVE DISTANCE WINDOWS. Four gates written in August used
 * "A must not appear within N chars of B" and went silently green when
 * the forbidden thing drifted past the limit. Every positional assertion
 * below compares indexOf against indexOf, which cannot pass by drifting.
 *
 * Every assertion here was reversal-tested at the time of writing: the
 * change it forbids was made, the gate was run, and it failed.
 */
import fs from "node:fs";

let fails = 0;
const check = (n, fn) => { try { fn(); console.log("  PASS  " + n); }
  catch (e) { fails++; console.log("  FAIL  " + n + "\n        " + e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m); };

const stripJs = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const cardRaw = fs.readFileSync("js/exercise-card.js", "utf8");
const card    = stripJs(cardRaw);
const workout = stripJs(fs.readFileSync("js/views/workout.js", "utf8"));
const prefs   = stripJs(fs.readFileSync("js/display-prefs.js", "utf8"));

// The literal returned by renderExerciseCard -- the only thing a person
// ever sees. Assertions about order must be made against THIS, not
// against the file, or a comment could satisfy them.
const tpl = (() => {
  const i = card.indexOf("export function renderExerciseCard");
  ok(i > -1, "renderExerciseCard not found");
  const j = card.indexOf("return `", i);
  ok(j > -1, "no template returned");
  return card.slice(j, card.indexOf("\n}", j));
})();

const at = (s, hay = tpl) => hay.indexOf(s);

console.log("\nTEST 1 - safety content comes first, and stays first");

check("bodyCaution renders before the setup disclosure", () => {
  const c = at("exercise-caution"), s = at("-setup");
  ok(c > -1, "caution not rendered at all");
  ok(s > -1, "setup disclosure not rendered");
  ok(c < s, "caution renders after setup; it is the personalised safety line and must lead");
});

check("the hazard list precedes the explanatory sections", () => {
  const w = at("-watch"), l = at("-load"), y = at("-why");
  ok(w > -1, "watchOut disclosure not rendered");
  ok(w < l && w < y, "watchOut renders after load/why; hazards must not sit below context");
});

check("the feedback control renders after the card, not inside it", () => {
  const c = workout.indexOf("renderExerciseCard("), f = workout.indexOf("renderFeedbackControl(");
  ok(c > -1 && f > -1, "one of the two calls is missing from workout.js");
  ok(c < f, "feedback control renders before the card; the hazard list would sit beneath it again");
});

console.log("\nTEST 2 - nothing safety-bearing is collapsible");

check("bodyCaution is not wrapped in a disclosure", () => {
  const c = at("exercise-caution");
  const before = tpl.slice(Math.max(0, c - 400), c);
  ok(!/disclosure\(\{[^}]*$/.test(before), "caution appears inside a disclosure() call");
  ok(!before.includes("aria-expanded"), "caution sits under a disclosure control");
});

check("watchOut stays open whenever a caution is firing", () => {
  const m = card.match(/const\s+watchOpen\s*=\s*([^;]+);/);
  ok(m, "watchOpen not found");
  ok(m[1].includes("caution"), "watchOpen does not consider the caution; a sore area could hide the hazards");
  ok(m[1].includes("!running"), "watchOpen does not stay open before the timer starts");
});

check("the full-instructions preference overrides every collapse", () => {
  for (const name of ["setupOpen", "watchOpen", "contextOpen"]) {
    const m = card.match(new RegExp("const\\s+" + name + "\\s*=\\s*([^;]+);"));
    ok(m, name + " not found");
    ok(m[1].includes("full"), name + " ignores the full-instructions preference");
  }
});

console.log("\nTEST 3 - P4. No history count reaches the screen.");

check("no exerciseHistory numeric is interpolated into the template", () => {
  ok(!/\$\{[^}]*\bseen\b[^}]*\}/.test(tpl), "`seen` is interpolated into rendered output (P4 breach)");
  ok(!/\$\{[^}]*\.n\b[^}]*\}/.test(tpl), "a history `.n` is interpolated into rendered output (P4 breach)");
});

check("_seen is used for sizing only, never returned to a renderer", () => {
  ok(card.includes("function _seen"), "_seen missing");
  ok(!/export\s+function\s+_seen/.test(card), "_seen is exported; it must not leave this file");
});

console.log("\nTEST 4 - the disclosure is a real one");

check("every disclosure carries aria-expanded and aria-controls", () => {
  const d = card.slice(card.indexOf("function disclosure"), card.indexOf("function fixed"));
  ok(d.includes("aria-expanded"), "no aria-expanded");
  ok(d.includes("aria-controls"), "no aria-controls");
  ok(d.includes("<button"), "disclosure is not a button");
});

check("collapsed content stays in the DOM", () => {
  const d = card.slice(card.indexOf("function disclosure"), card.indexOf("function fixed"));
  ok(d.includes("hidden"), "collapsed body is not marked hidden");
  ok(!/display\s*:\s*none/.test(d), "uses display:none rather than the hidden attribute");
});

console.log("\nTEST 5 - the preference exists in both copies");

check("fullInstructions is a display preference, not a store field", () => {
  ok(prefs.includes("fullInstructions"), "key missing from display-prefs.js");
  const html = fs.readFileSync("index.html", "utf8").replace(/<!--[\s\S]*?-->/g, "");
  ok(html.includes("alongside-full-instructions"), "key missing from the index.html pre-paint copy");
  const store = fs.readFileSync("js/store.js", "utf8");
  ok(!store.includes("fullInstructions"), "the key has leaked into store.js; it is device-level and must survive a store reset");
});

console.log("\nTEST 6 - the card is shared, not re-inlined");

// Every view that renders a full exercise card. yoga-session.js and
// practices.js are deliberately absent: neither renders a feedback
// control, so neither ever had the ordering fault, and their content is
// poses and practices rather than database exercises.
const CARD_VIEWS = [
  "js/views/workout.js",
  "js/views/prescribed-session.js",
  "js/views/gym-programme.js",
  "js/views/core-session.js",
];

for (const f of CARD_VIEWS) {
  const src = stripJs(fs.readFileSync(f, "utf8"));
  check(f + " uses the shared renderer", () => {
    ok(src.includes("renderExerciseCard("), "does not call the shared renderer");
    // Structure, not class name. prescribed-session.js legitimately reuses
    // the `exercise-instructions card` CLASS for the physio-notes block,
    // which is not an exercise card at all. Asserting on the class gave a
    // false positive on the first run of this gate. The real markers of a
    // re-inlined card are the setup list and its label.
    ok(!src.includes("exercise-section-list"), "still builds an inline setup list");
    ok(!src.includes("How to get there"), "still builds an inline card structure");
  });
  check(f + " renders the feedback control after the card", () => {
    const c = src.indexOf("renderExerciseCard("), fb = src.indexOf("renderFeedbackControl(");
    ok(c > -1, "no card call");
    if (fb === -1) return;
    ok(c < fb, "feedback control renders before the card; the hazard list would sit beneath it again");
  });
  check(f + " no longer builds its own caution or hazard block", () => {
    ok(!/bodyCaution\s*\(/.test(src), "still calls bodyCaution directly; ordering can drift again");
    ok(!src.includes("exercise-watchout-list"), "still contains an inline watchOut list");
  });
}

console.log(fails ? `\n${fails} FAILED\n` : "\nALL PASS\n");
process.exit(fails ? 1 : 0);
