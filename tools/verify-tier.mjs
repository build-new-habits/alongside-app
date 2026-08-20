/**
 * tools/verify-tier.mjs
 * 20 Aug 2026 v2
 *
 * TIER-A/B/C/F GATE — the free boundary is where the boundary document
 * says it is.
 *
 * SOURCE OF TRUTH: Documents/Business/alongside_revenue_architecture_18aug2026_v1.md
 * section 3, and Documents/Business/alongside_tier_boundary_12aug2026_v1.md
 * v3 section 4 — "Free is today. The Plan is the arc."
 *
 * R4, 20 Aug 2026. THIS GATE PREVIOUSLY ASSERTED THE OPPOSITE. v1 checked
 * that self-directed session shapes were LOCKED, because the 12 Aug
 * boundary charged for control: "Full body only. The coach decides."
 * That boundary is retired. Self-direction is an accessibility feature,
 * and charging for it penalised the person mainstream fitness culture
 * already fails worst. The paid act is naming a destination.
 *
 * The assertions are inverted rather than deleted. A gate that merely
 * stopped checking would let the old gating drift back in silently,
 * which is the exact failure this file was written to prevent — it just
 * points the other way now.
 *
 * WHY A GATE AND NOT A NOTE. Three separate surfaces reached paid
 * session shapes on the free tier for months, each looking perfectly
 * correct in isolation: the Library (no tier check at all), two Home
 * doors, and the entire twelve-week programme engine. Nothing failed,
 * because nothing was broken — the code did exactly what it said. The
 * boundary only existed in a document, and a boundary that lives in a
 * document is a boundary that drifts.
 *
 * THE TWO DIRECTIONS. This checks both, deliberately:
 *   - nothing PAID leaks to free (the revenue direction)
 *   - nothing SAFETY-CRITICAL becomes paid (the direction that matters
 *     more, and the one nobody would notice until somebody got hurt)
 */
import fs from "node:fs";

const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/<!--[\s\S]*?-->/g, "")
                    .replace(/^\s*\/\/[^\n]*$/gm, "");
const read = f => strip(fs.readFileSync(f, "utf8"));

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { fails++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

const library = read("js/views/library.js");
const today   = read("js/views/today.js");
const gymProg = read("js/views/gym-programme.js");
const sbUI    = read("js/views/session-builder-ui.js");

console.log("\nTIER-B — the Library knows about tiers");

check("library.js imports the shared paywall components", () => {
  ok(/isPremium/.test(library) && /lockedFeature/.test(library),
     "library.js has no tier awareness at all — this was the state that let a " +
     "free user tap 'Lower body' and silently receive Full Body 30");
});

check("exactly ONE Library surface is paid, and it is My programme", () => {
  // R4, 20 Aug 2026. v1 asserted `tags >= 11`. That was a FLOOR, and a
  // floor can be satisfied by the wrong eleven -- it would have stayed
  // green if the ten self-directed tags had been swapped for ten
  // others. Replaced with an exact count plus a named survivor, so both
  // directions of drift go red: re-gating anything, or ungating the one
  // thing that is genuinely the arc.
  const tags = (library.match(/tier:\s*["']personal["']/g) || []).length;
  ok(tags === 1,
     `${tags} paid Library surfaces tagged; expected exactly 1. ` +
     "Self-directed session types and activity categories are FREE " +
     "(revenue architecture section 3). Only 'My programme' is paid, " +
     "because a twelve-week programme is the arc, not a session");
  const line = library.split("\n").find(l => /My programme/.test(l));
  ok(line, "the 'My programme' card has gone missing from the gym category");
  ok(/tier:\s*["']personal["']/.test(line),
     "'My programme' is no longer paid. It is the twelve-week generative " +
     "programme -- the arc itself, and the one thing in the Library that " +
     "is a plan rather than a session");
});

check("the ten self-directed Library surfaces are FREE", () => {
  // Named individually, because this is the change R4 made and a count
  // alone cannot say WHICH survived. Two shapes: cards inside a
  // category, and whole categories with a directTarget.
  for (const label of ["Core", "HIIT", "Strength", "Cardio", "Mobility",
                       "Upper body", "Lower body", "Glute Focus"]) {
    const lines = library.split("\n").filter(l =>
      new RegExp(`label:\\s*"${label}"`).test(l));
    ok(lines.length > 0, `the "${label}" card has gone missing from the Library`);
    for (const l of lines) {
      ok(!/tier:\s*["']personal["']/.test(l),
         `the "${label}" card has been re-gated. Choosing which session you ` +
         "do today is self-direction, and self-direction is an accessibility " +
         "feature -- charging for it penalises the person who most needs to " +
         "override the default");
    }
  }
  for (const id of ["run", "walk", "swim", "cycle", "yoga"]) {
    const block = library.slice(library.indexOf(`id:          "${id}"`));
    const upToNext = block.slice(0, block.indexOf("},"));
    ok(!/tier:\s*["']personal["']/.test(upToNext),
       `the "${id}" category has been re-gated. Going for a run is not a plan`);
  }
});

check("the free Library surfaces are NOT tagged", () => {
  // These are free on ethical grounds, not commercial convenience.
  // Prescribed especially: 8 Mar 2026, "physio compliance is a health
  // issue, not a premium feature".
  for (const [id, why] of [
    ["prescribed", "physio compliance is a health issue, not a premium feature"],
    ["mindful",    "practices are free; journeys are paid"],
    ["coach",      "it IS the coach deciding, which is the free tier"]
  ]) {
    const block = library.slice(library.indexOf(`id:          "${id}"`));
    const upToNext = block.slice(0, block.indexOf("},"));
    ok(!/tier:\s*["']personal["']/.test(upToNext),
       `the "${id}" category has been made paid — ${why}`);
  }
});

check("no silent downgrade survives anywhere", () => {
  ok(!/selectedType\s*=\s*["']full["'];\s*selectedDuration\s*=\s*30/.test(sbUI),
     "session-builder-ui.js still substitutes Full Body 30 for a locked type. " +
     "Substituting silently is the behaviour TIER-B removed; route to upgrade");
});

console.log("\nTIER-A — Home doors follow the same boundary");

check("the two self-directed doors are FREE", () => {
  // R4, 20 Aug 2026. INVERTED. v1 required tier: 'personal' on both.
  for (const id of ["mobility-conditioning", "yoga"]) {
    const line = today.split("\n").find(l => l.includes(`id: '${id}'`));
    ok(line, `the ${id} door has gone missing from HOME_DOORS`);
    ok(!/tier:/.test(line),
       `the ${id} door has been re-gated. Free is today and the Plan is the ` +
       "arc -- choosing which session you do today is still a session");
  }
});

check("NO Home door is gated at all", () => {
  // The inverse, and the load-bearing half. Naming the two doors above
  // would stay green if a THIRD door were gated tomorrow. Every door on
  // Home is now free; the paid act is not reachable from this grid.
  const doors = today.slice(today.indexOf("const HOME_DOORS"));
  const block = doors.slice(0, doors.indexOf("\n  ];"));
  const gated = block.split("\n").filter(l => /^\s*\{ id:/.test(l) && /tier:/.test(l));
  ok(gated.length === 0,
     `${gated.length} Home door(s) still carry a tier tag: ` +
     gated.map(l => (l.match(/id: '([^']+)'/) || [])[1]).join(", "));
});

check("SAFETY: nothing safety-critical is ever gated", () => {
  // The direction that matters more. Conditions Update is how somebody
  // tells the coach they are hurting; the coach proposal is the free
  // tier's whole point; Wellbeing carries the crisis-adjacent content.
  for (const [id, why] of [
    ["conditions-update", "it is how somebody tells the coach they are hurting"],
    ["unsure",            "the coach deciding IS the free tier"],
    ["wellbeing",         "safety-critical features are never paywalled"],
    ["cardio-core-strength", "it is the free session"]
  ]) {
    const line = today.split("\n").find(l => l.includes(`id: '${id}'`));
    ok(line, `the ${id} door has gone missing from HOME_DOORS`);
    ok(!/tier:/.test(line),
       `the ${id} door has been made paid — ${why}. Safety-critical features ` +
       "are permanently free; this is a founding constraint, not a preference");
  }
});

console.log("\nTIER-I — the session builder does not gate its own steps");

check("no step of the builder is locked", () => {
  // R4, 20 Aug 2026. The type picker, duration picker, allocation
  // presets and build-mode step each rendered through lockedFeature()
  // for free users, and the location step was skipped entirely. All
  // four were CONTROL, which is now free.
  //
  // Asserted on the source rather than by render because
  // verify-tiergh.mjs already executes this view and counts what a free
  // user can press. This is the cheap companion check that catches a
  // lockedFeature() coming back before the behavioural gate has to.
  ok(!/lockedFeature/.test(sbUI),
     "session-builder-ui.js locks one of its steps again. Session type, " +
     "duration, the warm-up/work/cool-down split and how the session is " +
     "built are all self-direction, and self-direction is free");
  ok(!/phase\s*=\s*isPremium\(\)\s*\?/.test(sbUI),
     "a builder phase is still chosen by tier. The free path skipped the " +
     "location step entirely, so a free user was never asked whether they " +
     "were at home or at the gym -- the coach guessing instead of asking");
});

console.log("\nTIER-C — a plan is paid");

check("the programme engine checks tier", () =>
  ok(/isPremium/.test(gymProg),
     "gym-programme.js has no tier check — the full twelve-week generative " +
     "programme is reachable free, which is exactly what Personal is"));

check("a lapsed user is not ejected mid-programme", () =>
  ok(/hasActiveProgramme\(\)/.test(gymProg),
     "the tier check does not exempt someone with a programme already " +
     "running. Ejecting them mid-plan punishes a billing state, not a choice"));

console.log("\nTIER-D — the exercise database is never tier-gated");

check("no tier check reaches exercise selection", () => {
  for (const f of ["js/session-builder.js", "js/data/session-categories.js"]) {
    const src = read(f);
    ok(!/isPremium|store\.get\(["']tier["']\)/.test(src),
       `${f} gates exercises by tier. Capability decides what somebody gets — ` +
       "what is SAFE for them, never what they have paid. This is settled " +
       "(TIER-D, 13 Aug 2026) and should not be re-litigated in code");
  }
});

console.log("\nTIER-F — one destination, one name");

check("Wellbeing is called Wellbeing everywhere a user can read it", () => {
  const html = fs.readFileSync("index.html", "utf8")
                 .replace(/<!--[\s\S]*?-->/g, "");
  ok(!/<span class="nav-label">Noticing<\/span>/.test(html),
     "the bottom-nav tab still says 'Noticing' while the Home door says " +
     "'Wellbeing' — same route, two names, reads as two features");
  const noticing = fs.readFileSync("js/views/noticing.js", "utf8");
  ok(!/<h1 class="sr-only">Noticing<\/h1>/.test(noticing),
     "the screen-reader heading still says 'Noticing'. A sighted user never " +
     "sees it, which is how it drifted — but it is the first thing a screen " +
     "reader announces on arriving from a tab labelled Wellbeing");
});

console.log("\nTIER-E — Progress differs in KIND, not length");

const progress = read("js/views/progress.js");

check("EXPORT is free — a right of access does not depend on payment", () => {
  // R4/decision 7.2, 20 Aug 2026. UK GDPR gives a right of access and
  // portability regardless of payment, so gating export never removed
  // the right -- it converted a button into a support email, protecting
  // no revenue and manufacturing admin on a one-person business.
  ok(!/renderExportLocked/.test(progress),
     "the export lock is back. Gating export does not withhold the data, " +
     "it withholds the BUTTON, and the obligation survives either way");
  ok(/renderExportBlock\(\)/.test(progress),
     "the export block is gone entirely");
});

check("the export still differs by tier, in CONTENTS not existence", () => {
  // The differentiation is emergent and must stay that way: the export
  // is scoped by activeWindow (14 free, 30/90 paid) and its programme
  // lines drop out when there is no programme. No conditional required.
  // Asserted so a later "simplification" to a fixed window does not
  // quietly hand free users the paid horizon.
  const fn = progress.slice(progress.indexOf("function _handleExport"));
  const body = fn.slice(0, fn.indexOf("function _buildExportText"));
  ok(/_cutoffDate\(activeWindow\)/.test(body),
     "the export no longer scopes to activeWindow. Free exports a " +
     "fortnight and the Plan exports its horizon -- that difference IS " +
     "the tier boundary here, and it is the only one");
});

check("PERSONAL BESTS are free, and still off by default", () => {
  // R4/decision 7.1. A best is a fact about the person's own log, not a
  // coach read. But ungating is NOT switching on: for personas 2.5, 2.8
  // and 2.13 a visible best is a target to fall short of.
  const slog = read("js/session-log.js");
  const fn = slog.slice(slog.indexOf("export function bestLine"));
  const body = fn.slice(0, fn.indexOf("\n}"));
  ok(!/isPremium/.test(body),
     "bestLine() gates on tier again. 'Your best: 85 kg' is a fact the " +
     "person produced; 'up 5 since May' would be the arc, and P4 forbids " +
     "that separately");
  ok(/showPersonalBests'\)\s*!==\s*true/.test(body),
     "the showPersonalBests opt-in has gone. Ungating is not switching on " +
     "-- a visible best is a target to fall short of for the personas this " +
     "product exists to serve");
});

check("free is a fortnight", () =>
  ok(/const FREE_WINDOW\s*=\s*14/.test(progress),
     "the free window is not 14 days. Section 4.1: if free is fourteen days " +
     "and Personal is ninety, we are selling a bigger number"));

check("free RECORDS — no appraisal attached to a count", () => {
  // These fired on a number crossing a threshold: nine sessions got
  // "building something", ten got promoted to "a real habit". A verdict
  // on the person, delivered by arithmetic. P4 forbids it, and it was
  // doing the work that reading should do.
  for (const banned of [/a real habit/i, /consistent movement/i,
                        /consistency like that changes things/i,
                        /a lot of showing up/i]) {
    ok(!banned.test(progress),
       `an appraisal is attached to a session count: ${banned}. Free records; ` +
       "it states the number and stops");
  }
});

check("Personal READS — the observation free cannot produce exists", () =>
  ok(/_readShowedUpAnyway/.test(progress),
     "the read is gone. Personal without it is free with a bigger window, " +
     "which is exactly the failure section 4.1 names"));

check("the read waits until it has earned its closing line", () => {
  const fn = progress.slice(progress.indexOf("function _readShowedUpAnyway"));
  const body = fn.slice(0, fn.indexOf("function _detectEnergyPattern"));
  ok(/lowDays\.length < 3/.test(body),
     "no floor on low-energy arrivals — a read from two data points is a horoscope");
  ok(/finished < 3/.test(body),
     "no floor on COMPLETED sessions. Without it the line can read 'you came in " +
     "low 3 times, 2 of those you moved anyway' and then claim the person does " +
     "not know that about themselves, on top of a number that also says they " +
     "did not, once");
});

check("the window is initialised per tier", () =>
  ok(/activeWindow === null.*premium|premium \? PAID_DEFAULT : FREE_WINDOW/s.test(progress),
     "a single shared default leaves a Personal user on the 14-day window while " +
     "their tab strip offers only 30 and 90 — no tab reads as selected"));

console.log("\nORIENT-1 — Home reads what the person told onboarding");

check("the orientation line uses real goal ids", () => {
  // Five times on this project an invented-but-plausible id has silently
  // produced wrong behaviour. These are checked against the live list.
  const src = fs.readFileSync("js/views/today.js", "utf8");
  const m = src.match(/WELLBEING_GOALS = new Set\(\[([\s\S]*?)\]\)/);
  ok(m, "WELLBEING_GOALS is gone — Home no longer reads goals at all");
  const used = [...m[1].matchAll(/'([a-z-]+)'/g)].map(x => x[1]);
  const real = fs.readFileSync("js/data/goals.js", "utf8");
  const bad = used.filter(g => !new RegExp(`id: '${g}'`).test(real));
  ok(bad.length === 0,
     `goal id(s) that do not exist in js/data/goals.js: ${bad.join(", ")}`);
});

check("orientation stops once somebody has found their way", () => {
  const src = fs.readFileSync("js/views/today.js", "utf8");
  ok(/sessionsSoFar < ORIENTATION_SESSIONS/.test(src),
     "the orientation line has no session limit. It is orientation, not a nudge — " +
     "somebody who has been here a fortnight has found the doors, and a coach " +
     "that keeps pointing at one is a coach that is selling");
});

check("the door order is NOT reordered by goals", () => {
  // The obvious fix for persona 2.11 was to promote Wellbeing up the
  // grid. That would have fixed her by breaking persona 2.14, who is
  // autistic and predictability-seeking: a Home screen that rearranges
  // itself is precisely aversive. The grid is fixed for everybody and
  // the coach speaks instead.
  const src = read("js/views/today.js");
  const doors = src.slice(src.indexOf("HOME_DOORS"), src.indexOf("HOME_DOORS") + 2000);
  ok(!/sort\(|goals\.includes|reorder/i.test(doors),
     "HOME_DOORS is being sorted or filtered by preference. The order must be " +
     "identical for every user — persona 2.14 needs a layout that does not move");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
