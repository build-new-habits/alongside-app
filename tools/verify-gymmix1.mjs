/**
 * tools/verify-gymmix1.mjs
 * 12 Sep 2026 v1
 *
 * GYM-MIX-1. A session type for a gym floor: one long machine block, then
 * lifting.
 *
 * ── WHAT COULD NOT BE BUILT ─────────────────────────────────────────
 *
 * Graeme, in a gym on 12 Sep, wanted cross trainer, lat pulldowns, dead
 * bugs and the treadmill. Full Body reached no machine past the warm-up.
 * Cardio reached no weights at all. A normal gym visit fell between two
 * session types and the app could not build it.
 *
 * GYM-REACH-1 then found why the machines were unreachable: every one is
 * 15 to 30 minutes, and isSessionLength() excludes anything ten minutes
 * or longer from session building. That rule is RIGHT -- it exists
 * because a 60-minute cardio build once returned two weeks of the same
 * couch-to-5K programme stacked -- so this session does not loosen it. It
 * adds one slot that may ask for an exemption, and asserts below that
 * nothing else gained one.
 *
 * ── THE TWO FAULTS THIS GATE EXISTS BECAUSE OF ──────────────────────
 *
 * Both found by BUILDING sessions, not by reading the code:
 *
 *   1. The first draft let any long cardio entry fill the slot, so a Gym
 *      session opened with HIIT 30:30, Run Strides, and -- with no machine
 *      declared -- Dance Freestyle. All real cardio; none of them a gym.
 *   2. _trimToDuration() removes the LONGEST item in main first, and the
 *      machine block is by definition the longest thing in the session. It
 *      was deleted on every build. Three test sessions came back as
 *      lifting with a warm-up on a bike, which is precisely the session
 *      Graeme complained about.
 *
 * Tests 3 and 4 hold those two. A source check would have passed both.
 *
 * ── ONE HONEST NOTE ON THE TRIM REVERSAL ────────────────────────────
 *
 * The block is protected twice over: _trimToDuration() skips it when
 * choosing what to remove, AND its MIN_MAIN floor counts working
 * movements rather than items. Either half alone holds at every duration
 * the app offers, so reversing ONE of them leaves this gate green.
 * Reversing both turns tests 2a, 2c and 3a red -- measured, with the
 * original trim deleting the block on 10 of 12 thirty-minute builds.
 * Recorded rather than papered over: a reader should know this gate does
 * not pin each half separately.
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
const SB = await import("../js/session-builder.js");
const { EXERCISES, isSessionLength, isCardioMachine } = await import("../js/data/exercises/index.js");

store.init();
const GYM = ["treadmill", "elliptical", "rowing-machine", "exercise-bike",
             "cable-machine", "dumbbells", "barbell", "bench"];
const setKit = (kit) => { store.set("equipment", kit); store.set("homeEquipment", kit); };

const build = (kit = GYM, mins = 45) =>
  SB.buildSession({ sessionType: "gym", durationMins: mins, equipmentOverride: kit, preset: null });
const feature = s => (s.exercises || []).find(e => e._feature);
const main    = s => (s.exercises || []).filter(e => e.section === "main");

console.log("\nGYM-MIX-1 — a machine block, then lifting\n");

console.log("TEST 0 — the type exists and the fixtures are real");

const type = SB.SESSION_TYPES.find(t => t.id === "gym");
ok("0a. the Gym type is in SESSION_TYPES", !!type);
ok("0b. and declares a feature slot that asks for the exemption",
   !!type?.featureSlot?.allowSessionLength && type.featureSlot.requiresEquipment === true);
ok("0c. CONTROL: the machine blocks really are over the ten-minute rule",
   EXERCISES.filter(e => isCardioMachine(e) && isSessionLength(e)).length >= 8,
   "if they were short, this whole feature would be unnecessary");

console.log("\nTEST 1 — the exemption is scoped, not a loosening");

{
  const others = SB.SESSION_TYPES.filter(t => t.id !== "gym");
  ok("1a. no other session type has a feature slot", others.every(t => !t.featureSlot));

  let leaked = [];
  setKit(GYM);
  for (const t of others) {
    for (let i = 0; i < 4; i++) {
      const s = SB.buildSession({ sessionType: t.id, durationMins: 45, equipmentOverride: GYM, preset: null });
      for (const ex of (s.exercises || [])) if (isSessionLength(ex)) leaked.push(t.id + ":" + ex.id);
    }
  }
  ok("1b. no other type ever builds a ten-minute-plus item" +
     (leaked.length ? "  [" + [...new Set(leaked)].slice(0, 6).join(", ") + "]" : ""),
     leaked.length === 0, "the rule this session exempts must still hold everywhere else");
}

console.log("\nTEST 2 — a gym session is a machine block AND lifting");

setKit(GYM);
{
  const runs = Array.from({ length: 6 }, () => build());
  const withFeature = runs.filter(s => !!feature(s));
  ok("2a. every build opens with a long block", withFeature.length === runs.length,
     `${withFeature.length} of ${runs.length}`);
  ok("2b. and it is on a machine every time",
     withFeature.every(s => isCardioMachine(feature(s))),
     withFeature.map(s => feature(s)?.id).join(", "));
  ok("2c. and it leads the main section, rather than turning up among the lifts",
     runs.every(s => main(s)[0]?._feature === true),
     runs.map(s => main(s)[0]?.id).join(", "));
  ok("2d. the lifting is still there: at least two loaded movements after it",
     runs.every(s => main(s).slice(1).length >= 2),
     runs.map(s => main(s).length - 1).join(", "));
  ok("2e. nothing is served twice",
     runs.every(s => new Set(s.exercises.map(e => e.id)).size === s.exercises.length));
}

console.log("\nTEST 3 — the block survives the duration trim");

{
  // _trimToDuration removes the longest main item first, and this block is
  // always the longest. It deleted the point of the session on every build.
  const longest = [];
  for (let i = 0; i < 8; i++) {
    const s = build(GYM, 30);          // the tightest case: a 20-30 min block in 30 mins
    const f = feature(s);
    if (f) longest.push(Math.round((f.duration || 0) / 60));
  }
  ok("3a. even a 30-minute session keeps its block", longest.length === 8,
     `${longest.length} of 8 survived`);
  ok("3b. CONTROL: the blocks really are longer than everything else in the session",
     longest.every(m => m >= 10), longest.join(", ") + " minutes");
  ok("3c. and the lifts are what gets trimmed instead, not stripped to nothing",
     Array.from({ length: 4 }, () => build(GYM, 30)).every(s => main(s).slice(1).length >= 2));
}

console.log("\nTEST 4 — no machine, no pretend machine");

{
  setKit(["dumbbells", "bench"]);
  const runs = Array.from({ length: 4 }, () => build(["dumbbells", "bench"]));
  ok("4a. no feature block at all", runs.every(s => !feature(s)),
     runs.map(s => feature(s)?.id).filter(Boolean).join(", "));
  ok("4b. and nothing long is substituted for it — no Dance Freestyle in a gym",
     runs.every(s => (s.exercises || []).every(e => !isSessionLength(e))),
     runs.flatMap(s => s.exercises.filter(isSessionLength).map(e => e.id)).join(", "));
  ok("4c. it is still a real session", runs.every(s => (s.exercises || []).length >= 4));
  setKit(GYM);
}

console.log("\nTEST 5 — the swap sheet can reach it (SWAP-1's proof still holds)");

{
  const pools = SB.buildCandidatePools({ sessionType: "gym", durationMins: 45, equipmentOverride: GYM });
  const mainPool = (pools?.main?.candidates || pools?.main || []);
  const ids = new Set(mainPool.map(e => e.id || e));
  ok("5a. the main candidate pool holds machine blocks",
     mainPool.some(e => isCardioMachine(e) && isSessionLength(e)),
     "without this the longest item in the session could not be swapped");

  const missing = [];
  for (let i = 0; i < 5; i++) {
    const s = build();
    for (const ex of main(s)) if (!ids.has(ex.id)) missing.push(ex.id);
  }
  ok("5b. every built main exercise is in that pool" +
     (missing.length ? "  [" + [...new Set(missing)].join(", ") + "]" : ""),
     missing.length === 0, "this is the assertion verify-swap1 makes for every other type");
}

console.log(`\n  ${fails === 0 ? "ALL PASS" : fails + " RED"}\n`);
process.exit(fails ? 1 : 0);
