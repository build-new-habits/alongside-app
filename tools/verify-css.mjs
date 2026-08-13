/**
 * tools/verify-css.mjs
 * 12 Aug 2026 v1
 *
 * CSS-1. Every class a view renders must have a rule somewhere.
 *
 * Graeme, from the device pass, on the run type picker: "Image 1 is
 * unstyled. We need to audit all pages. This was a previously known issue
 * in Library."
 *
 * He was right that it is a class of problem, not one screen. The audit
 * found 174 classes used in view templates with no rule anywhere -- and
 * the whole .ws-* family among them, so four session views rendered as
 * unstyled text on every screen.
 *
 * WHY IT HID. Nothing errors. A class with no rule is not a bug to any
 * tool: the markup is valid, the JS runs, the screen appears. It just
 * looks like a draft. The only detector was somebody opening the screen.
 *
 * BUDGETED, NOT ZERO. 174 cannot be fixed in one pass, and a gate that
 * fails from day one gets switched off. The budget is the current count,
 * so it can only go DOWN -- adding a new unstyled class fails
 * immediately, and every one fixed tightens the ratchet.
 */
import fs from "node:fs";
import path from "node:path";

const walk = (d, ext) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name), ext)
                  : (e.name.endsWith(ext) ? [path.join(d, e.name)] : []));

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "");

// Classes rendered by views
const used = new Map();
for (const f of [...walk("js/views", ".js"), "js/exercise-feedback.js", "js/session-log.js"]) {
  const src = strip(fs.readFileSync(f, "utf8"));
  for (const m of src.matchAll(/class="([^"${}]+)"/g))
    for (const c of m[1].split(/\s+/))
      if (c) (used.get(c) || used.set(c, new Set()).get(c)).add(path.basename(f));
}

// Classes defined in CSS
const defined = new Set();
for (const f of walk("css", ".css"))
  for (const m of strip(fs.readFileSync(f, "utf8")).matchAll(/\.([a-zA-Z][\w-]*)/g))
    defined.add(m[1]);

const missing = [...used.keys()].filter(c => !defined.has(c)).sort();

// Ratchet. Lower this as families are fixed; never raise it.
const BUDGET = 131;   // 174 -> 157 (CSS-1, .ws-*) -> 131 (CSS-2, .cs-*/.gym-*)

console.log(`\nclasses rendered by views: ${used.size}`);
console.log(`classes defined in CSS:    ${defined.size}`);
console.log(`undefined:                 ${missing.length}  (budget ${BUDGET})\n`);

let fails = 0;

if (missing.length > BUDGET) {
  fails++;
  console.log(`  FAIL  ${missing.length - BUDGET} MORE undefined class(es) than the budget allows.`);
  console.log(`        A class with no rule renders as unstyled text and errors nowhere.`);
  console.log(`        Either add the rule, or fix an existing one and lower BUDGET.\n`);
  for (const c of missing.slice(0, 25))
    console.log(`          .${c}  (${[...used.get(c)].join(", ")})`);
} else if (missing.length < BUDGET) {
  console.log(`  PASS  ${BUDGET - missing.length} fewer than budget \u2014 lower BUDGET to ${missing.length} to lock the gain in.`);
} else {
  console.log("  PASS  no new undefined classes");
}

// The families already fixed must stay fixed, whatever the budget says.
const LOCKED = ["ws-type-grid", "ws-type-card", "ws-type-icon", "ws-type-label",
                "ws-type-desc", "ws-duration-grid", "ws-duration-card",
                "ws-duration-label", "ws-timer-block", "ws-timer-value",
                "ws-timer-label", "ws-prompt-text", "ws-prompt-dismiss",
                "ws-active-card", "ws-controls",
                // CSS-2. The pickers Graeme saw rendering as plain text,
                // plus workout-header-title -- 41 uses, the largest single
                // gap, and why titles collided with the home icon.
                "cs-focus-grid", "cs-focus-card", "cs-focus-icon",
                "cs-focus-label", "cs-focus-desc", "cs-duration-grid",
                "cs-duration-card", "cs-duration-label", "cs-duration-desc",
                "cs-duration-count", "gym-exercise-card", "gym-exercise-name",
                "gym-exercises-list", "gym-card-meta-row", "gym-card-chevron",
                "workout-header-title", "exercise-cue", "yoga-session-view"];
const regressed = LOCKED.filter(c => !defined.has(c));
if (regressed.length) {
  fails++;
  console.log(`\n  FAIL  previously fixed classes are undefined again: ${regressed.join(", ")}`);
} else {
  console.log("  PASS  the .ws-* single-activity family stays defined");
}

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
