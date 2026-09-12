/**
 * tools/verify-prac2.mjs
 * 12 Sep 2026 v1
 *
 * PRAC-2. The 136 that fell between two rules, and the groups they need.
 *
 * ── THE FAULT ───────────────────────────────────────────────────────
 *
 * session-builder.js drops anything ten minutes or longer through
 * isSessionLength(). practice-library.js homed the long content by
 * excluding whatever "any session type can reach" -- computed from
 * category matches, WITHOUT that length rule. So a 20-minute rowing
 * session matched `conditioning`, was counted reachable, and was built by
 * nothing. Each rule assumed the other one had them.
 *
 * 136 entries appeared nowhere in the app: 90 cardio, 21 recovery, 9
 * mobility, 9 mindfulness, 7 strength. Brisk Walk, Steady Cycling, HIIT
 * 30:30, every couch-to-5K week. Practices showed 28.
 *
 * Third time this shape has appeared: 28 orphaned practices in August,
 * the machine blocks on 12 Sep, these now.
 *
 * ── WHY GROUPS SHIPPED IN THE SAME SESSION ──────────────────────────
 *
 * Closing the gap alone takes cardio from 5 items to 81 in one list.
 * That is the same "I could not get to what I wanted" problem in a
 * different room, which is why test 3 asserts no group is overwhelming.
 *
 * ── WHAT THIS GATE WATCHES MOST ─────────────────────────────────────
 *
 * The running split reads an id PREFIX, and prefixes are an authoring
 * convention rather than a guarantee. Test 4 pins named ids, so a change
 * of convention fails here instead of quietly emptying a group.
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM('<!doctype html><body></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const { store } = await import("../js/store.js");
store.init();
const { EXERCISES, isSessionLength, isCardioMachine } = await import("../js/data/exercises/index.js");
const { getStandalonePractices, getPracticeGroups, getPractice, practiceGroupFor }
  = await import("../js/data/practice-library.js");
const { SESSION_TYPES } = await import("../js/session-builder.js");

const standalone = getStandalonePractices();
const groups     = getPracticeGroups();
const allItems   = groups.flatMap(g => g.items);

console.log("\nPRAC-2 — the practices that were reachable by nothing\n");

console.log("TEST 0 — the fault was real, and the fixtures are real");

ok("0a. CONTROL: the library really does hold a lot of long content",
   EXERCISES.filter(isSessionLength).length > 150,
   `${EXERCISES.filter(isSessionLength).length} entries of ten minutes or more`);
ok("0b. the named casualties exist and are long",
   ["brisk-walk", "hiit-30-30", "cycling-steady", "c25k-week1"].every(id => {
     const e = EXERCISES.find(x => x.id === id);
     return e && isSessionLength(e);
   }));

console.log("\nTEST 1 — they are reachable now");

{
  const ids = new Set(standalone.map(e => e.id));
  const named = ["brisk-walk", "hiit-30-30", "cycling-steady", "c25k-week1", "walk-run-intervals"];
  const missing = named.filter(id => !ids.has(id));
  ok("1a. every entry Graeme's device test named is now reachable" +
     (missing.length ? "  [" + missing.join(", ") + "]" : ""), missing.length === 0);
  ok("1b. and the set is the size the diagnosis predicted, not a handful",
     standalone.length > 140, `${standalone.length} standalone practices (was 28)`);
  ok("1c. every one of them really is long — nothing short leaked in",
     standalone.every(isSessionLength),
     standalone.filter(e => !isSessionLength(e)).map(e => e.id).slice(0, 5).join(", "));
}

console.log("\nTEST 2 — nothing with a home is dragged in here");

{
  // The gym feature slot is the one place a long item IS buildable, so the
  // nine machine blocks are NOT stranded and must not appear as orphans.
  const machineBlocks = EXERCISES.filter(e => isCardioMachine(e) && isSessionLength(e));
  const wrongly = machineBlocks.filter(e => standalone.some(s => s.id === e.id));
  ok("2a. CONTROL: the gym type really does declare a feature slot",
     SESSION_TYPES.some(t => t.featureSlot?.allowSessionLength));
  ok("2b. machine blocks are not listed as stranded — the Gym type has them" +
     (wrongly.length ? "  [" + wrongly.map(e => e.id).join(", ") + "]" : ""),
     wrongly.length === 0);
  ok("2c. and there are enough of them for that to mean something",
     machineBlocks.length >= 8, `${machineBlocks.length}`);
}

console.log("\nTEST 3 — 155 items are navigable, not a wall");

{
  ok("3a. every standalone practice appears in exactly one group",
     allItems.length === standalone.length &&
     new Set(allItems.map(i => i.id)).size === standalone.length,
     `${allItems.length} placed, ${standalone.length} standalone`);
  const biggest = groups.reduce((a, g) => Math.max(a, g.items.length), 0);
  ok("3b. no group is overwhelming", biggest <= 40,
     groups.map(g => `${g.label} ${g.items.length}`).join(", "));
  ok("3c. no group is empty", groups.every(g => g.items.length > 0),
     groups.filter(g => !g.items.length).map(g => g.label).join(", "));
  ok("3d. every group has a real label and description, not a fallback",
     groups.every(g => g.label && g.description && g.description.length > 10),
     groups.filter(g => !g.description).map(g => g.label).join(", "));
  ok("3e. there are enough groups to be worth grouping", groups.length >= 6, `${groups.length}`);
}

console.log("\nTEST 4 — the running split, which leans on an id convention");

{
  const RUNS = ["c25k-week1", "c25k-week6", "run-intervals-400m", "run-hills",
                "run-cruise-intervals", "run-drill-cadence"];
  const misfiled = RUNS.filter(id => {
    const e = EXERCISES.find(x => x.id === id);
    return !e || practiceGroupFor(e) !== "running";
  });
  ok("4a. named running sessions land in Running" +
     (misfiled.length ? "  [" + misfiled.join(", ") + "]" : ""), misfiled.length === 0,
     "name-matching alone filed all six of these as conditioning");

  ok("4b. swimming is decided structurally, by movement pattern",
     EXERCISES.filter(e => e.movementPattern === "swim" && isSessionLength(e))
       .every(e => practiceGroupFor(e) === "swimming"));
  ok("4c. cycling is decided structurally, by needing a bike",
     practiceGroupFor(EXERCISES.find(e => e.id === "cycling-steady")) === "cycling");

  // A new cardio entry with no marker must land in the general group, not
  // vanish. Failing INTO a group is the safe direction.
  ok("4d. an unrecognised cardio practice falls into the general group",
     practiceGroupFor({ id: "brand-new-thing", name: "Brand New Thing", category: "cardio" }) === "cardio");
  ok("4e. and a non-cardio practice still groups by its own category",
     practiceGroupFor({ id: "x", name: "X", category: "recovery" }) === "recovery");
}

console.log("\nTEST 5 — the route still works end to end");

{
  const sample = allItems[0];
  const fetched = getPractice(sample.id);
  ok("5a. a practice can be opened by id", !!fetched && fetched.id === sample.id);
  ok("5b. and knows which group it came from", !!fetched?.group?.label);
  ok("5c. safety tiers are still applied", allItems.every(i => i.safety !== undefined));
}

console.log(`\n  ${fails === 0 ? "ALL PASS" : fails + " RED"}\n`);
process.exit(fails ? 1 : 0);
