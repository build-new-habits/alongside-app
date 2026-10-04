/**
 * tools/verify-progress-shapes.mjs
 * 04 Oct 2026 v3
 *
 * v3 - LOOK-2 (progress.js v26, approved by the product owner from the
 *   mock-up, 04 Oct). Three deliberate changes, each re-pointed:
 *
 *   3e REVERSES THE 06 SEP LIST-ONLY RULE. The kinds card is now a
 *   proportional bar above the list, by the product owner's approval of
 *   the mock-up on 04 Oct 2026. The 06 Sep intent -- a proportional bar
 *   must not make the shortest row read as a failing -- is what 3e now
 *   protects: the list is still there with every kind named and counted
 *   (each count matching the log), the bar is aria-hidden and decorative
 *   with one part per listed kind, nothing is ranked or called
 *   most/least/top (3b, unchanged), and colour is never the only carrier
 *   (every coloured part and dot sits beside its name and count in words).
 *
 *   6c: the heading is now the card title "What kinds of session" (h2),
 *   not "What you have been doing". Same check: an h2, like its siblings.
 *
 *   7b REVERSES TARGET-3's "with one set, it IS shown". The product owner
 *   approved dropping "N of T this week" from Progress on 04 Oct (it read
 *   as a score against a target on the screen opened to look back; the
 *   target is still kept and shown in Settings). 7b now asserts that with
 *   a target set, "of 4 this week" is NOT shown on Progress while
 *   "N this week" is.
 *
 *   REACH: test 7 opens the programme row first (the block is now on its
 *   own page, one tap away).
 *
 * 08 Sep 2026 v2
 *
 * v2 - PROGRESS-2. Test 6 asserts the heading OUTLINE, not just that
 *   headings exist. "What you have been doing" was an h3 among h2
 *   siblings, giving h1 > h3 > h2: a section arriving as a subsection of
 *   nothing, followed by one jumping back up a level. Checked on the
 *   rendered page, because a heading level is only wrong relative to its
 *   neighbours -- no amount of reading this file's source would show it.
 *   Also fixed this gate's own cwd-relative readFileSync.
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

// GATE-PATH. Was cwd-relative, so this gate read nothing from any
// directory but the repo root.
const src = fs.readFileSync(new URL("../js/views/progress.js", import.meta.url), "utf8");
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

// LOOK-2 (re-pointed, see header). The bar is approved; what it must not do
// is carry anything alone. The list, every kind named and counted, stays.
{
  const bar   = section.querySelector(".pr-kinds");
  const parts = bar ? [...bar.querySelectorAll(".pr-kinds__part")] : [];
  const named = rows.map(r => [
    (r.querySelector(".progress-shapes__name")?.textContent || "").trim(),
    (r.querySelector(".progress-shapes__count")?.textContent || "").trim()]);
  const stretchLabel = SESSION_TYPES.find(t => t.id === "stretch").label;
  ok("3e. the list is still there, every kind named and counted; the bar is decorative only",
     /progress-shapes__list/.test(shapesCode) && !!section.querySelector(".progress-shapes__list") &&
     named.length === 2 &&
     named.some(([n, c]) => n === lowerLabel && c === "2") &&
     named.some(([n, c]) => n === stretchLabel && c === "1") &&
     !!bar && bar.getAttribute("aria-hidden") === "true" &&
     parts.length === rows.length &&
     rows.every(r => r.querySelector(".pr-dot")?.getAttribute("aria-hidden") === "true"),
     `rows ${JSON.stringify(named)}, bar ${bar ? `aria-hidden=${bar.getAttribute("aria-hidden")}, ${parts.length} parts` : "missing"}` +
     " -- a proportional bar on its own makes the shortest row look like a failing");
}

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

// ── 6. THE HEADING OUTLINE ──────────────────────────────────────────────
console.log("\nTEST 6 - the outline holds together for somebody navigating by heading");

// "What you have been doing" was an h3 while its three siblings -- Your
// weight, the programme block, Share your progress -- were all h2. The
// outline read h1 > h3 > h2: the section arrived as a subsection of
// nothing, and the next one jumped back UP a level.
//
// WCAG 2.2 AA 1.3.1. The heading level IS the structure for anyone not
// seeing the layout, and heading navigation is how a screen-reader user
// skims a page they opened to look back over.
//
// Asserted on the RENDERED outline rather than the source, because a
// level is only wrong relative to its neighbours.

const outline = view("personal", LOG);
const heads = [...outline.querySelectorAll("h1,h2,h3,h4,h5,h6")]
  .map(h => ({ level: Number(h.tagName[1]), text: (h.textContent || "").trim() }));

ok("6pc. positive control: there are headings to check",
   heads.length >= 2,
   "nothing rendered with a heading, so 6a and 6b measure nothing");

ok("6a. exactly one h1",
   heads.filter(h => h.level === 1).length === 1,
   `h1 count: ${heads.filter(h => h.level === 1).length}`);

ok("6b. no level is skipped on the way down",
   heads.every((h, i) => i === 0 || h.level <= heads[i - 1].level + 1),
   `outline: ${heads.map(h => `h${h.level} ${h.text.slice(0, 24)}`).join(" > ")}`);

// LOOK-2: the section's heading is now its card title.
const shapesHead = heads.find(h => /what kinds of session/i.test(h.text));
ok("6c. the shapes section sits at the same level as its siblings",
   !!shapesHead && shapesHead.level === 2,
   shapesHead
     ? `it is an h${shapesHead.level}; Share your progress and Your weight are h2`
     : "the shapes heading is missing entirely");

// ── 7. NO TARGET IS CLAIMED THAT NOBODY SET ─────────────────────────────
console.log("\nTEST 7 - Progress does not invent a weekly target");

// TARGET-3, 08 Sep 2026. getProgressStats() returns
// strategicGoal.weeklySessionTarget or 3, with no check on whether it
// was ever chosen -- so Progress told somebody who had never set a
// target that they were "0 of 3 this week". A shortfall against a
// commitment they never made, on the screen they open to see how they
// are doing.
//
// today.js has guarded this since TARGET-2 and says why: "setAt is the
// honest test of whether it was ever a choice."

// view() clears localStorage itself, so anything set before calling it
// is wiped. The first version of this test did exactly that and threw.
function viewWith(extra) {
  localStorage.clear();
  store.init();
  store.set("tier", "personal");
  store.set("activityLog", []);
  for (const [k, v] of Object.entries(extra)) store.set(k, v);
  const c = document.createElement("div");
  document.body.appendChild(c);
  ProgressView({ navigate: () => {} }).mount(c);
  // LOOK-2: the programme block is one tap away, on its own page.
  c.querySelector('[data-pr-page="programme"]')?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  return c;
}

{
  // programmeId, not id. getProgressStats() early-returns on
  // `!ap?.programmeId`, so the first version of this fixture produced no
  // programme block at all -- and 7a passed VACUOUSLY, asserting the
  // absence of a line on a screen that was not rendering the block it
  // lives in. Checked because 7b failing made no sense otherwise.
  const prog = {
    programmeId: "build-your-base",
    startedAt:   new Date().toISOString(),
    currentWeek: 1
  };
  const c = viewWith({ activeProgramme: prog });
  const txt = (c.textContent || "").replace(/\s+/g, " ");

  ok("7pc. positive control: the programme block rendered",
     /this week/i.test(txt),
     "no weekly line at all, so 7a below would pass against a screen that " +
     "never rendered the block — which is exactly what it did first time");

  ok("7a. with no target set, none is named",
     !/of \d+ this week/.test(txt),
     `"${(txt.match(/\d+ of \d+ this week/) || [""])[0]}" — a target nobody ` +
     `chose, presented as theirs`);

  // LOOK-2 (re-pointed, see header). TARGET-3 said somebody who DID set a
  // target wants to see it; the product owner reversed that for Progress on
  // 04 Oct: the count stays, the target is kept in Settings, not shown here.
  const c2 = viewWith({
    activeProgramme: prog,
    strategicGoal: {
      weeklySessionTarget: 4,
      setAt: new Date().toISOString(),
      targetSetAt: new Date().toISOString()
    }
  });
  const txt2 = (c2.textContent || "").replace(/\s+/g, " ");
  ok("7b. and with one set, it is NOT shown on Progress, but this week's count is",
     !!c2.querySelector(".progress-programme") && !/of \d+ this week/.test(txt2) && /\b\d+ this week\b/.test(txt2),
     `"${(txt2.match(/[^.]{0,30}this week/) || [""])[0]}" — LOOK-2: "N of T this week" read as a score against a target`);
}

console.log(fails === 0
  ? "\nPROGRESS: all assertions pass\n"
  : `\nPROGRESS: ${fails} FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
