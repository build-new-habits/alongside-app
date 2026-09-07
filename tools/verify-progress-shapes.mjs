/**
 * tools/verify-progress-shapes.mjs
 * 06 Sep 2026 v1
 *
 * PROGRESS. The shapes of session, counted. CLUB item 9.
 *
 * WHY IT EXISTS. renderActivitySummary()'s breakdown counts `e.type` --
 * the ACTIVITY type: workout, walk, quiet. So it read "Workout x 12",
 * which says almost nothing about what somebody actually did. The
 * SESSION type has been recorded on every built session since
 * TWO-ENGINE added activityLog[].sessionType, and until now only
 * chooseSessionType() read it.
 *
 * WHAT THIS GATE MOSTLY PROTECTS is not the feature. It is the three
 * permanent constraints the feature is closest to breaking:
 *
 *   DISPLAYS, NEVER INTERPRETS (P4). It says what happened. It does not
 *   say what that means, what is missing, or what to do about it. There
 *   must be no "you have not done any mobility lately" -- that is the
 *   app deciding a gap is a fault, and a gap is often the most sensible
 *   thing somebody did that month.
 *
 *   NO STREAK, EVER. No consecutive count, no longest run, no "keep it
 *   going". A permanent product constraint, not a preference.
 *
 *   NO COMPARISON, to other people or to a past self. Ordering by count
 *   is not ranking: nothing may be called most, least, top or best.
 */

import { createRequire as __cr } from "node:module";
import fs from "node:fs";
const __require = __cr(import.meta.url);
const { JSDOM } = __require("jsdom");

const dom = new JSDOM('<!doctype html><div id="c"></div>', { url: "https://x/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const k of ["navigator", "localStorage"])
  Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true });

const B = new URL("../js/", import.meta.url).href;
const { store }        = await import(B + "store.js");
const { SESSION_TYPES } = await import(B + "session-builder.js");
const { ProgressView }  = await import(B + "views/progress.js");

const src = fs.readFileSync("js/views/progress.js", "utf8");
const shapes = src.slice(src.indexOf("function renderSessionShapes"),
                         src.indexOf("// ── Programme progress"));
const shapesCode = shapes.split("\n").filter(l => !/^\s*(\*|\/\/|\/\*)/.test(l)).join("\n");

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const iso = d => new Date(Date.now() - d * 86400000).toISOString();

function view(tier, log) {
  localStorage.clear();
  store.init();
  store.set("tier", tier);
  store.set("activityLog", log);
  const c = document.createElement("div");
  document.body.appendChild(c);
  ProgressView({ navigate: () => {} }).mount(c);
  return c;
}

const LOG = [
  { id: "1", type: "workout", status: "complete", completedAt: iso(2), durationMins: 30, sessionType: "lower" },
  { id: "2", type: "workout", status: "complete", completedAt: iso(4), durationMins: 30, sessionType: "lower" },
  { id: "3", type: "workout", status: "complete", completedAt: iso(6), durationMins: 25, sessionType: "stretch" },
  // Predates TWO-ENGINE: no sessionType. Must be SKIPPED, not bucketed.
  { id: "4", type: "workout", status: "complete", completedAt: iso(8), durationMins: 20 }
];

// ── 0. FIXTURE REACH ────────────────────────────────────────────────────
console.log("\nTEST 0 - the section actually rendered");
const plan = view("personal", LOG);
const section = plan.querySelector(".progress-shapes");
ok("0a. the shapes section is on the page", !!section,
   "every assertion below would be reading an absent node and passing for free");
ok("0b. and the slice found the function", shapes.length > 200,
   "the source slice missed renderSessionShapes");

// ── 1. IT COUNTS THE RIGHT FIELD ────────────────────────────────────────
console.log("\nTEST 1 - session shape, not activity type");

const text = section.textContent.replace(/\s+/g, " ");
ok("1a. it reads sessionType", /e\.sessionType/.test(shapesCode),
   "it counts e.type again, which reads 'Workout x 12' and says almost nothing");

const lowerLabel = SESSION_TYPES.find(t => t.id === "lower").label;
ok("1b. and shows the shape by its real name", text.includes(lowerLabel), text.slice(0, 140));
ok("1c. with the right count", /2/.test(text), text.slice(0, 140));

ok("1d. labels come from SESSION_TYPES, not a private map",
   /SESSION_TYPES\.find/.test(shapesCode),
   "a second copy of the eight names drifts the first time one changes - which " +
   "is exactly what the retired getWorkoutName() did with its three");

// ── 2. THE UNRECORDED ARE SKIPPED, NOT BUCKETED ─────────────────────────
console.log("\nTEST 2 - entries predating TWO-ENGINE");

ok("2a. no synthetic bucket for entries with no sessionType",
   !/other|unknown|unrecorded/i.test(text),
   "an 'Other' row grows with history the person cannot see the shape of, and " +
   "looks like a KIND of session rather than an absence of a record");

const rows = [...section.querySelectorAll(".progress-shapes__row")];
ok("2b. and the row count matches only the recorded shapes", rows.length === 2,
   `${rows.length} rows for 2 recorded shapes across 4 log entries`);

// ── 3. THE THREE CONSTRAINTS ────────────────────────────────────────────
console.log("\nTEST 3 - displays, never interprets");

ok("3a. no streak language anywhere in the section",
   !/streak|in a row|consecutive|keep it going|day \d+/i.test(shapes + text),
   "no streaks, ever. A permanent product constraint, not a preference");

ok("3b. nothing is ranked",
   !/\b(most|least|top|best|worst|favourite)\b/i.test(shapes + text),
   "ordering by count is not ranking. Naming a top makes the shortest row a failing");

ok("3c. no gap is named as a fault",
   !/haven't|have not done|missing|neglect|behind|should/i.test(text),
   "'you have not done any mobility lately' is the app deciding a gap is a " +
   "fault - and a gap is often the most sensible thing somebody did that month");

ok("3d. and no comparison to anybody else",
   !/other people|average|others|than last/i.test(shapes + text));

// A bar chart invites comparison between rows. A list does not.
ok("3e. it is a list, not a chart",
   /progress-shapes__list/.test(shapesCode) && !/width:\s*\$\{/.test(shapesCode),
   "a proportional bar makes the shortest row look like a failing");

// ── 4. SILENT WHEN THERE IS NOTHING ─────────────────────────────────────
console.log("\nTEST 4 - no empty state on a screen for looking back");

const emptyPlan = view("personal", []);
ok("4a. the section is absent with no history",
   !emptyPlan.querySelector(".progress-shapes"),
   "an empty state here reads as an unfinished task on a screen somebody " +
   "opened to look back, not to be given something else to do");

// ── 5. TIER ─────────────────────────────────────────────────────────────
console.log("\nTEST 5 - Progress in the Plan remembers");

const free = view("free", LOG);
ok("5a. free does not get the section", !free.querySelector(".progress-shapes"));
ok("5b. and the gate is on tier, checked in the function",
   /tier === 'free'/.test(shapesCode),
   "gated somewhere else, so a new caller would render it on free");

console.log(fails === 0
  ? "\nPROGRESS: all assertions pass\n"
  : `\nPROGRESS: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
