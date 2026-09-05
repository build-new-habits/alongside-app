/**
 * verify-dupesection.mjs — 05 Sep 2026 v1
 *
 * DUPE-SECTION. One exercise must appear ONCE in a session.
 *
 * ── THE FAULT THIS GATE WAS WRITTEN AGAINST ────────────────────────
 *
 * buildSessionFromSelection() filtered each section's categories against
 * the selected id set INDEPENDENTLY. An exercise matching two sections'
 * categories -- Hip Flexor Stretch is both a warm-up mobility entry and
 * a cool-down stretch -- satisfied both filters and was placed twice.
 *
 * Measured on 05 Sep 2026 BEFORE the fix, on a full equipment kit:
 *
 *     28 of 32 type x duration combinations affected
 *     stretch/60  13 duplicates in 28 exercises  (46% of the session)
 *     mobility/60 11 duplicates in 24 exercises
 *     mobility/15 Hip Flexor Stretch THREE times (warmup, main, cooldown)
 *
 * Stretch and mobility were the worst affected, and STRETCH-FLOW
 * (2 Sep) hardcoded stretch onto this builder -- so the single worst
 * case in the app was also the one path that reached it automatically.
 *
 * ── WHY THIS IS NOT A NEW RULE ─────────────────────────────────────
 *
 * buildSession() has never had this fault: 0 of 256 builds. It carries
 * an `alreadyChosen` Set across all three sections and says why, at
 * session-builder.js:3157 --
 *
 *     "a duplicate between warmup and main is just as wrong as one
 *      within a section."
 *
 * The rule was written, stated, and never applied to the second
 * function. This gate holds BOTH builders to it, so the policy cannot
 * go on existing in one place and being implied in the other.
 *
 * ── CLAIM ORDER, AND ONE PLACE IT IS DELIBERATELY NOT APPLIED ──────
 *
 * In buildSessionFromSelection() MAIN CLAIMS FIRST. Main is the
 * constrained section -- on an upper-body session at shoulder 7 the
 * main pool held 9 candidates against warm-up's 39 -- so a warm-up
 * taking a scarce main-eligible entry starves the section that matters
 * most, and warm-up absorbs the loss easily.
 *
 * buildSession()'s order is NOT changed. Measured over 280 builds with
 * a constrained persona (shoulder 7, hip 6): warm-up-first fills 6.31
 * main slots on average, main-first fills 6.32, and neither ever
 * produced a short session. Reordering would change every coach-built
 * session in the app for a hundredth of an exercise. Section 6 below
 * asserts buildSession's order is still warm-up-first, so that this
 * decision is a fact the suite holds rather than a comment that rots.
 *
 * Run: node tools/verify-dupesection.mjs
 */

import { readFileSync } from "node:fs";

const FAIL = [];
let checks = 0;
function ok(cond, label) {
  checks++;
  if (!cond) FAIL.push(label);
}

if (typeof globalThis.localStorage === "undefined") {
  const m = new Map();
  globalThis.localStorage = {
    getItem: k => (m.has(String(k)) ? m.get(String(k)) : null),
    setItem: (k, v) => { m.set(String(k), String(v)); },
    removeItem: k => { m.delete(String(k)); },
    clear: () => m.clear()
  };
}

const SB = await import("../js/session-builder.js");
const { store } = await import("../js/store.js");

const KIT = ["dumbbells", "bench", "resistance-bands", "pull-up-bar", "kettlebells"];
const TYPES = ["full", "lower", "upper", "core", "glute", "cardio", "mobility", "stretch"];
const MINS  = [15, 30, 45, 60];

function reset() {
  store.set("equipment", KIT);
  store.set("conditions", []);
  store.set("conditionPainScores", {});
  store.set("prescribedExercises", []);
}

function duplicatesIn(session) {
  const seen = new Map();
  const dupes = [];
  session.exercises.forEach(ex => {
    if (seen.has(ex.id)) dupes.push(`${ex.id} (${seen.get(ex.id)}+${ex.section})`);
    else seen.set(ex.id, ex.section);
  });
  return dupes;
}

function recommendedIdsFor(sessionType, durationMins) {
  const pools = SB.buildCandidatePools({
    sessionType, durationMins, equipmentOverride: KIT, preset: "balanced"
  });
  if (!pools) return null;
  return [...pools.warmup, ...pools.main, ...pools.cooldown]
    .filter(ex => ex.recommended)
    .map(ex => ex.id);
}

// ───────────────────────────────────────────────────────────────────
// 1. THE FIXTURE REACHES THE BRANCH.
//
// Five earlier gates in this project passed while testing nothing,
// because the fixture never got as far as the code it named. Before
// asserting that duplicates are absent, prove the OVERLAP that caused
// them is still present in the data -- otherwise a content change that
// removed every dual-category exercise would make sections 2 and 3 go
// green for a reason that has nothing to do with the fix.
// ───────────────────────────────────────────────────────────────────
reset();

const overlapProbe = (() => {
  const type = SB.SESSION_TYPES.find(t => t.id === "stretch");
  const pools = SB.buildCandidatePools({
    sessionType: "stretch", durationMins: 60, equipmentOverride: KIT, preset: "balanced"
  });
  if (!pools) return { warmupIds: new Set(), mainIds: new Set(), overlap: [] };
  const warmupIds = new Set(pools.warmup.map(e => e.id));
  const mainIds   = new Set(pools.main.map(e => e.id));
  const overlap   = [...warmupIds].filter(id => mainIds.has(id));
  return { warmupIds, mainIds, overlap, type };
})();

ok(overlapProbe.overlap.length >= 3,
   `1a. stretch/60 warm-up and main pools still overlap (got ${overlapProbe.overlap.length}, need >= 3) ` +
   `-- if this fails the data changed and sections 2-3 prove nothing`);

// ───────────────────────────────────────────────────────────────────
// 2. buildSessionFromSelection(): NO DUPLICATES, ANY TYPE, ANY LENGTH.
//
// This is the assertion that was red before the fix, in 28 of the 32
// combinations it walks.
// ───────────────────────────────────────────────────────────────────
reset();

let combosWalked = 0;
let biggestSession = 0;

for (const sessionType of TYPES) {
  for (const durationMins of MINS) {
    const ids = recommendedIdsFor(sessionType, durationMins);
    if (!ids || ids.length === 0) continue;
    const session = SB.buildSessionFromSelection({
      sessionType, durationMins, selectedIds: ids, equipmentOverride: KIT
    });
    if (!session) continue;
    combosWalked++;
    biggestSession = Math.max(biggestSession, session.exercises.length);
    const dupes = duplicatesIn(session);
    ok(dupes.length === 0,
       `2. ${sessionType}/${durationMins} built ${session.exercises.length} exercises ` +
       `with ${dupes.length} duplicate(s): ${dupes.join(", ")}`);
  }
}

ok(combosWalked >= 30,
   `2a. walked ${combosWalked} of 32 combinations (need >= 30) -- too few means the loop is not reaching the builder`);
ok(biggestSession >= 15,
   `2b. largest session built was ${biggestSession} exercises (need >= 15) -- ` +
   `short sessions cannot exhibit the fault, so passing on them proves nothing. ` +
   `15 is the DISTINCT count of the pre-fix worst case, not a lowered bar: ` +
   `stretch/60 shipped 28 entries of which only 15 were distinct.`);

// ───────────────────────────────────────────────────────────────────
// 3. THE WORST MEASURED CASE, NAMED.
//
// stretch/60 carried 13 duplicates in 28 exercises. mobility/15 placed
// Hip Flexor Stretch three times. Both are asserted by name so that a
// regression reports the case it broke rather than a bare count.
// ───────────────────────────────────────────────────────────────────
reset();

// The third number is the DISTINCT exercise count each case carried
// BEFORE the fix, measured 05 Sep 2026:
//
//     stretch/60   28 entries, 13 duplicates -> 15 distinct
//     mobility/60  24 entries, 11 duplicates -> 13 distinct
//     mobility/15   8 entries,  4 duplicates ->  4 distinct
//
// Asserting EXACT equality rather than a floor is the point. It proves
// the fix removed repetition and nothing else: if a duplicate had been
// deleted rather than never placed, these would come in low, and if the
// builder started inventing picks to fill the gap they would come in
// high. The person was always doing 15 stretches; they were shown some
// of them three times and told it would take an hour.
for (const [sessionType, durationMins, distinctBefore] of [["stretch", 60, 15], ["mobility", 60, 13], ["mobility", 15, 4]]) {
  const ids = recommendedIdsFor(sessionType, durationMins);
  const session = ids && SB.buildSessionFromSelection({
    sessionType, durationMins, selectedIds: ids, equipmentOverride: KIT
  });
  ok(!!session, `3. ${sessionType}/${durationMins} builds a session at all`);
  if (!session) continue;
  ok(session.exercises.length === distinctBefore,
     `3a. ${sessionType}/${durationMins} built ${session.exercises.length} exercises, expected exactly ` +
     `${distinctBefore} -- the distinct count it carried before the fix. Lower means a duplicate was ` +
     `deleted instead of never placed; higher means the builder is inventing picks the person did not choose.`);
  ok(duplicatesIn(session).length === 0,
     `3b. ${sessionType}/${durationMins} is free of duplicates: ${duplicatesIn(session).join(", ")}`);

  const counts = new Map();
  session.exercises.forEach(ex => counts.set(ex.id, (counts.get(ex.id) || 0) + 1));
  const worst = [...counts.values()].reduce((a, b) => Math.max(a, b), 0);
  ok(worst === 1,
     `3c. ${sessionType}/${durationMins}: no exercise appears more than once (worst was ${worst})`);
}

// ───────────────────────────────────────────────────────────────────
// 4. MAIN CLAIMS FIRST.
//
// Take an exercise the data places in BOTH the warm-up and the main
// pool, select it, and assert it lands in main. Asserting the outcome
// rather than the line order means a rewrite that keeps the behaviour
// stays green and one that quietly flips the order does not.
// ───────────────────────────────────────────────────────────────────
reset();

{
  const contested = overlapProbe.overlap[0];
  ok(!!contested, "4. a contested exercise exists in stretch/60 to test claim order with");

  if (contested) {
    const ids = recommendedIdsFor("stretch", 60) || [];
    const withContested = ids.includes(contested) ? ids : [...ids, contested];
    const session = SB.buildSessionFromSelection({
      sessionType: "stretch", durationMins: 60, selectedIds: withContested, equipmentOverride: KIT
    });
    ok(!!session, "4a. stretch/60 builds with the contested exercise selected");
    if (session) {
      const placements = session.exercises.filter(ex => ex.id === contested);
      ok(placements.length <= 1,
         `4b. the contested exercise ${contested} appears at most once (found ${placements.length})`);
      if (placements.length === 1) {
        ok(placements[0].section === "main",
           `4c. main claims first: ${contested} is eligible for warm-up and main, and landed in ` +
           `"${placements[0].section}" -- expected "main"`);
      }
    }
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. DISPLAY ORDER IS UNCHANGED BY CLAIM ORDER.
//
// Main is SELECTED first. It must still be SHOWN second. These are
// different things and conflating them would reorder every session.
// ───────────────────────────────────────────────────────────────────
reset();

{
  const ids = recommendedIdsFor("full", 45);
  const session = ids && SB.buildSessionFromSelection({
    sessionType: "full", durationMins: 45, selectedIds: ids, equipmentOverride: KIT
  });
  ok(!!session, "5. full/45 builds a session");
  if (session) {
    const rank = { warmup: 0, main: 1, cooldown: 2 };
    const seq = session.exercises.map(ex => rank[ex.section] ?? 1);
    const sorted = [...seq].sort((a, b) => a - b);
    ok(JSON.stringify(seq) === JSON.stringify(sorted),
       `5a. sections are still shown warm-up, then main, then cool-down (got ${seq.join("")})`);
    ok(seq.includes(0) && seq.includes(1),
       "5b. the session actually contains both a warm-up and a main section, so 5a is not vacuous");
  }
}

// ───────────────────────────────────────────────────────────────────
// 6. buildSession() IS CLEAN, AND ITS ORDER IS DELIBERATELY UNCHANGED.
//
// 6a is a regression guard on the builder that never had the fault.
// 6b holds the measured decision NOT to reorder it: if a later session
// changes buildSession to claim main first, this goes red and the
// person doing it has to justify the change against the measurement
// in this file's header rather than making it silently.
// ───────────────────────────────────────────────────────────────────
reset();

let coachBuilds = 0;
for (const sessionType of TYPES) {
  for (const durationMins of MINS) {
    for (let run = 0; run < 4; run++) {
      const session = SB.buildSession({
        sessionType, durationMins, equipmentOverride: KIT, preset: "balanced"
      });
      if (!session || session.gentleCare) continue;
      coachBuilds++;
      const dupes = duplicatesIn(session);
      ok(dupes.length === 0,
         `6a. buildSession ${sessionType}/${durationMins} produced duplicates: ${dupes.join(", ")}`);
    }
  }
}
ok(coachBuilds >= 100,
   `6a-i. walked ${coachBuilds} coach builds (need >= 100) -- weighted picking needs volume to expose a duplicate`);

{
  const src = readFileSync(new URL("../js/session-builder.js", import.meta.url), "utf8");
  const warmupAt = src.indexOf('selectFromCategories(type.warmupCategories,   "warmup"');
  const mainAt   = src.indexOf('selectFromCategories(mainCategories, "main"');
  ok(warmupAt > 0 && mainAt > 0,
     "6b. buildSession's three section calls are still findable in source");
  ok(warmupAt > 0 && mainAt > 0 && warmupAt < mainAt,
     "6b-i. buildSession still claims WARM-UP first. Measured 05 Sep 2026: reordering it moves " +
     "main slot fill from 6.31 to 6.32 over 280 constrained builds, i.e. nothing. If you are " +
     "changing this deliberately, re-run that measurement and update this gate with the result.");
}

// ───────────────────────────────────────────────────────────────────
// 7. THE WARM-UP FLOOR SURVIVES, AND ITS FALLBACK IS NOT A DUPLICATE.
//
// The floor picks a warm-up when the person selected none. Before the
// fix it took candidate [0] unconditionally, which could hand back an
// exercise main had already taken -- the floor creating the very fault
// the rest of this gate forbids.
// ───────────────────────────────────────────────────────────────────
reset();

{
  // FIXTURE CHOICE IS THE WHOLE TEST. This first ran on stretch/45 and
  // passed with the floor reverted to candidate [0] -- because there,
  // warm-up's first candidate simply was not one main had taken, so the
  // assertion held whether the code was right or wrong. glute/45 is used
  // instead because its warm-up candidate [0] is leg-swing-lateral,
  // which IS in the main pool: select main only, main claims it, the
  // warm-up empties, and an unguarded floor hands it straight back.
  //
  // Seventh recorded instance in this project of a fixture that never
  // reached the branch it named.
  const pools = SB.buildCandidatePools({
    sessionType: "glute", durationMins: 45, equipmentOverride: KIT, preset: "balanced"
  });
  ok(!!pools, "7. glute/45 candidate pools build");
  ok(!!pools && pools.warmup.length > 0 && pools.main.some(e => e.id === pools.warmup[0].id),
     "7-i. glute/45 warm-up candidate [0] is still also in the main pool -- " +
     "if this fails the fixture no longer reaches the floor and 7c proves nothing");

  if (pools) {
    // Select ONLY main-pool ids, so nothing is chosen for the warm-up
    // and the floor has to fire.
    const mainOnly = pools.main.map(e => e.id);
    const session = SB.buildSessionFromSelection({
      sessionType: "glute", durationMins: 45, selectedIds: mainOnly, equipmentOverride: KIT
    });
    ok(!!session, "7a. a main-only selection still builds");
    if (session) {
      const warmups = session.exercises.filter(ex => ex.section === "warmup");
      ok(warmups.length >= 1,
         "7b. the warm-up floor still fires on a main-only selection (found none)");
      ok(duplicatesIn(session).length === 0,
         `7c. the warm-up floor did not introduce a duplicate: ${duplicatesIn(session).join(", ")}`);
    }
  }
}

// ───────────────────────────────────────────────────────────────────
// 8. A PRESCRIBED EXERCISE IS NEVER ALSO PICKED BY A SECTION.
//
// ⚠️ HONEST LIMIT. Seeding `claimed` with prescribed ids is DEFENCE IN
// DEPTH, and this section does not prove it. Removing the seeding
// leaves this gate green: no fixture found on 05 Sep 2026 gets a
// prescribed id placed twice, because the section filters do not
// re-offer it in practice. The seeding stays -- buildSession() seeds
// the same way and prescribed work outranks everything -- but the
// reversal test says plainly that it has NOT been proved reachable,
// rather than a passing assertion implying it has.
//
// Prescribed work is placed by a specialist and is never trimmed. If
// the same exercise is also selected, the person must not be shown it
// twice -- once as their specialist's instruction and once as an
// engine pick.
// ───────────────────────────────────────────────────────────────────
reset();

{
  const pools = SB.buildCandidatePools({
    sessionType: "full", durationMins: 45, equipmentOverride: KIT, preset: "balanced"
  });
  const target = pools && pools.main[0];
  ok(!!target, "8. a main-pool exercise exists to prescribe");

  if (target) {
    store.set("prescribedExercises", [{
      id: target.id, name: target.name, sets: 3, reps: "10",
      active: true, prescribedBy: "Gate fixture"
    }]);

    const ids = [...pools.warmup, ...pools.main, ...pools.cooldown].map(e => e.id);
    const session = SB.buildSessionFromSelection({
      sessionType: "full", durationMins: 45, selectedIds: ids, equipmentOverride: KIT
    });
    ok(!!session, "8a. a session builds with a prescribed exercise present");
    if (session) {
      const hits = session.exercises.filter(ex => ex.id === target.id);
      ok(hits.length === 1,
         `8b. prescribed exercise ${target.id} appears exactly once (found ${hits.length})`);
      ok(hits.length === 1 && hits[0].isPrescribed === true,
         "8c. the surviving copy is the PRESCRIBED one, not an engine pick that displaced it");
      ok(session.exercises.some(ex => ex.isPrescribed === true),
         "8d. the session actually contains prescribed work, so 8b is not vacuous");
    }
    store.set("prescribedExercises", []);
  }
}

// ───────────────────────────────────────────────────────────────────
// 9. NO SLOT IS SILENTLY LOST.
//
// Removing a duplicate must not shrink the session. Sections here take
// every selected id that passes their filter and _trimToDuration()
// decides the final length, so dropping a second copy should leave the
// trim MORE room for the person's other picks -- not fewer exercises.
// ───────────────────────────────────────────────────────────────────
reset();

{
  const ids = recommendedIdsFor("stretch", 60) || [];
  const session = SB.buildSessionFromSelection({
    sessionType: "stretch", durationMins: 60, selectedIds: ids, equipmentOverride: KIT
  });
  ok(!!session, "9. stretch/60 builds");
  if (session) {
    // NOT "the session is as long as it was". It should not be: the old
    // length counted the same stretch three times. The invariant is that
    // every exercise the person SELECTED which is eligible for a section
    // still appears -- deduplication must remove repetition, never a
    // person's pick.
    const distinct = new Set(session.exercises.map(e => e.id)).size;
    ok(distinct === session.exercises.length,
       `9a. every entry in stretch/60 is distinct (${session.exercises.length} entries, ${distinct} distinct)`);

    const placed  = new Set(session.exercises.map(e => e.id));
    const dropped = ids.filter(id => !placed.has(id));
    ok(dropped.length === 0,
       `9b. no selected exercise was lost to deduplication: ${dropped.join(", ")}`);
    ok(ids.length >= 12,
       `9c. the selection under test held ${ids.length} ids (need >= 12), so 9b is not vacuous`);
  }
}

// ───────────────────────────────────────────────────────────────────

console.log(`verify-dupesection: ${checks} checks, ${FAIL.length} failed.`);
if (FAIL.length) {
  FAIL.forEach(f => console.log("  FAIL " + f));
  process.exit(1);
}
console.log("One exercise, one appearance. Both builders held to the same rule.");
