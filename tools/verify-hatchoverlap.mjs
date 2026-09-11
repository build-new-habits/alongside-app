/**
 * tools/verify-hatchoverlap.mjs
 * 06 Sep 2026 v1
 *
 * HATCH-OVERLAP. The way out does not sit on top of the content.
 *
 * ESCAPE-Z raised #hidden-nav-home-btn to z-index 10000 so it could be
 * tapped from the coach-proposal panel. That fixed reachability and made
 * the overlap worse: it now sits on top of whatever is in the top-right
 * corner of every screen. Graeme's screenshots show the house over
 * "1 of 6" on the exercise card, with the text legible THROUGH a 55%
 * background -- both readable at once, neither actually readable.
 *
 * TWO HALVES, and fixing one without the other leaves it broken:
 *
 *   1. OPAQUE. Content showing through a control is not subtlety.
 *   2. RESERVED. A fixed element is invisible to the layout, so the
 *      layout has to be told about it. One variable, declared beside the
 *      rule that positions the hatch, so the reserved space and the
 *      actual size cannot drift -- which is how a magic 56px in one
 *      stylesheet stops matching a 44px button in another.
 *
 * WCAG 2.2: content permanently obscured by a fixed element is a real
 * failure, not an aesthetic complaint. And the 44px target (2.5.8) must
 * survive the fix -- shrinking the hatch would "solve" the overlap by
 * breaking something else.
 */

import fs from "node:fs";

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


const html = fs.readFileSync(_gatePath("index.html"), "utf8");
const hatch = html.slice(html.indexOf(".hidden-nav-escape {"),
                         html.indexOf("}", html.indexOf(".hidden-nav-escape {")));

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the block being measured is the right one");
ok("0a. the hatch rule was found", hatch.length > 40 && /position:\s*fixed/.test(hatch),
   "the slice did not land on .hidden-nav-escape, so every assertion below " +
   "is measuring an empty string and passes for free");

// ── 1. OPAQUE ───────────────────────────────────────────────────────────
console.log("\nTEST 1 - nothing shows through the button");

const bg = (hatch.match(/background:\s*([^;]+);/) || [])[1] || "";
ok("1a. the background is not translucent",
   !/rgba\([^)]*,\s*0?\.\d+\s*\)/.test(bg),
   `background is ${bg.trim()} - content reads THROUGH the control, which is ` +
   `how the house and "1 of 6" were both legible and neither readable`);

ok("1b. and it still reads as a control, not a hole",
   /box-shadow|border:/.test(hatch),
   "opaque with no edge on a dark surface is a dark circle, not a button");

// ── 2. THE CORNER IS RESERVED ───────────────────────────────────────────
console.log("\nTEST 2 - the layout is told about the fixed element");

ok("2a. a gutter variable is declared", /--escape-hatch-gutter:/.test(html));

// Derived, not a magic number. A hardcoded gutter stops matching the
// button the first time the button changes.
ok("2b. and it is DERIVED from the hatch's own size",
   /--escape-hatch-gutter:\s*calc\([^)]*--escape-hatch-size/.test(html),
   "the gutter is a literal, so it silently stops matching the button the " +
   "first time the button's size changes");

// Was an OR against the literal 44px, which passed while the button
// still hardcoded its size -- the assertion hedged on exactly the drift
// it exists to catch.
ok("2c. and the hatch's size comes from the same variable",
   /width:\s*var\(--escape-hatch-size\)/.test(hatch),
   "the size variable is declared but the button does not use it, so the two " +
   "can disagree while both look right");

// ── 3. THE SURFACES THAT NEEDED IT, AND ONLY THOSE ──────────────────────
console.log("\nTEST 3 - reserved where content actually sits, on selectors that exist");

const gutterRules = html.slice(html.indexOf("--escape-hatch-gutter"))
  .match(/\.[a-z-]+(?=\s*\{[^}]*--escape-hatch-gutter)/g) || [];

for (const sel of [".workout-header", ".ci-thread"]) {
  ok(`3a. ${sel} reserves the gutter`,
     new RegExp(`\\${sel}\\s*\\{[^}]*escape-hatch-gutter`).test(html),
     `${sel} is where the counter and the message bubbles sit`);
}

// EVERY selector given the gutter must exist in the markup. The first
// draft of this rule named .checkin-header, .cp-preview-panel__head and
// .session-header -- three selectors that appear nowhere in the app. The
// gutter would have been reserved on nothing while the rule looked
// thorough.
const viewSrc = fs.readdirSync(_gatePath("js/views"))
  .filter(f => f.endsWith(".js"))
  .map(f => fs.readFileSync(_gatePath(`js/views/${f}`), "utf8")).join("\n");
const ghosts = gutterRules.filter(sel => !viewSrc.includes(`class="${sel.slice(1)}`));
ok("3b. and no gutter is reserved on a class that does not exist",
   ghosts.length === 0,
   `${ghosts.join(", ")} appear in no view. A rule that names nothing looks ` +
   `thorough and reserves nothing`);

// A blanket rule would indent screens with nothing in the corner. An
// unexplained gutter down the whole app is a worse fault than the one
// being fixed.
ok("3c. and it is not applied to everything",
   gutterRules.length <= 4,
   `${gutterRules.length} selectors carry the gutter - a blanket indent is a ` +
   `worse fault than the overlap`);

// ── 4. THE FIX DID NOT BREAK THE THING IT WAS BUILT ON ──────────────────
console.log("\nTEST 4 - reachability and target size survive");

const z = Number((hatch.match(/z-index:\s*(\d+)/) || [])[1]);
ok("4a. the hatch is still above the modals", z > 9999,
   `z-index is ${z}. ESCAPE-Z raised this so it could be tapped at all; ` +
   `lowering it to "fix" the overlap would restore the trap`);

ok("4b. and still a 44px target",
   /min-width:\s*44px/.test(hatch) && /min-height:\s*44px/.test(hatch),
   "shrinking the hatch would solve the overlap by breaking WCAG 2.5.8");

// ── 6. STUCK-1 ──────────────────────────────────────────────────────────
// The hatch and the coach-proposal panel's close button both sat
// top-right, on top of each other, and NEITHER worked. Graeme could not
// leave the screen.
//
// Test 3 asserted that every gutter names a class that EXISTS. It could
// not assert the reverse -- that every screen needing one has one -- so
// dropping .cp-preview-panel__head instead of finding the real selector
// passed silently. This is that reverse check, for every control that
// parks itself in the top-right corner.
console.log("\nTEST 6 - STUCK-1: nothing else lives in the hatch's corner");

const corners = [
  [".cp-preview-panel__close", "css/components/coach-proposal.css",
   "the coach-proposal panel - the screen with no other way out"]
];

for (const [sel, file, why] of corners) {
  const src = fs.readFileSync(_gatePath(file), "utf8");
  const rule = src.slice(src.indexOf(sel + " {"),
                         src.indexOf("}", src.indexOf(sel + " {")));
  ok(`6a. ${sel} clears the hatch`,
     /escape-hatch-gutter/.test(rule),
     `${sel} sits under the escape hatch on ${why}. Both controls become ` +
     `untappable and the screen cannot be left.`);
  ok(`6b. ${sel} clears it by the hatch's OWN measurement`,
     /var\(--escape-hatch-gutter\)/.test(rule),
     "cleared by a literal, so it stops matching the first time the hatch changes size");
}

console.log(fails === 0
  ? "\nHATCH-OVERLAP: all assertions pass\n"
  : `\nHATCH-OVERLAP: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
