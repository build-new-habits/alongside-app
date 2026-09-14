/**
 * tools/verify-equipstair.mjs
 * 13 Sep 2026 v1
 *
 * EQUIP-STAIR. Every machine an exercise needs can actually be declared.
 *
 * ── A CORRECTION TO MY OWN FINDING ──────────────────────────────────
 *
 * The 12 Sep device-test write-up said "stair-climber is in
 * CARDIO_MACHINES and on two entries, and NEITHER equipment picker
 * offers it". Half of that was wrong, and the error was mine: the probe
 * read `EQUIPMENT` from data/equipment.js, which does not exist -- the
 * export is EQUIPMENT_CATEGORIES -- so JSON.stringify(undefined) returned
 * undefined and the regex reported false. Onboarding has offered a stair
 * climber all along.
 *
 * The real gap was narrower: the session builder's own kit list carried
 * bike, treadmill, cross trainer and rowing machine but not the stair
 * climber, so the two stair entries were unreachable for anybody who set
 * their equipment there rather than in onboarding.
 *
 * ── WHY IT IS GATED RATHER THAN JUST FIXED ──────────────────────────
 *
 * This is the third reachability fault in a week: machine cardio
 * (GYM-REACH-1), 136 practices (PRAC-2), and this. Each was content
 * authored, shipped, and reachable by nothing. A one-line fix leaves the
 * next one to be found by somebody in a gym; a general assertion does
 * not.
 */
import { JSDOM } from "jsdom";
const dom = new JSDOM('<!doctype html><body></body>', { url: "https://x/" });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
import fs from "node:fs";

let fails = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) { if (detail) console.log(`        ${detail}`); fails++; }
};

const { EXERCISES, CARDIO_MACHINES } = await import("../js/data/exercises/index.js");
const { EQUIPMENT_CATEGORIES } = await import("../js/data/equipment.js");
const { resolveEquipment, exerciseIsAvailable } = await import("../js/data/equipment-map.js");

const onboardingIds = EQUIPMENT_CATEGORIES.flatMap(c => (c.items || []).map(i => i.id));
const builderSrc = fs.readFileSync("js/views/session-builder-ui.js", "utf8");
const builderIds = [...builderSrc.matchAll(/\{\s*id:\s*"([a-z-]+)",\s*label:/g)].map(m => m[1]);

console.log("\nEQUIP-STAIR — every machine can be declared\n");

console.log("TEST 0 — the fixtures are real lists");
ok("0a. onboarding offers a real number of items", onboardingIds.length > 30, `${onboardingIds.length}`);
ok("0b. the builder's kit list was found in source", builderIds.length > 10, `${builderIds.length}`);
ok("0c. CONTROL: and the two lists are genuinely different", 
   onboardingIds.length !== builderIds.length,
   "if they were the same list this whole gate would be redundant");

console.log("\nTEST 1 — the stair climber, both pickers");
ok("1a. onboarding offers it", onboardingIds.includes("stair-climber"));
ok("1b. the session builder offers it too", builderIds.includes("stair-climber"),
   "two stair entries were unreachable for anybody who set their kit here");

console.log("\nTEST 2 — every cardio machine an exercise needs is declarable");
{
  const declarable = new Set([
    ...onboardingIds.flatMap(id => [...resolveEquipment([id])]),
    ...builderIds.flatMap(id => [...resolveEquipment([id])]),
  ]);
  const missing = CARDIO_MACHINES.filter(m => !declarable.has(m));
  ok("2a. no cardio machine is unreachable from both pickers" +
     (missing.length ? `  [${missing.join(", ")}]` : ""), missing.length === 0);
  ok("2b. CONTROL: the list is not empty", CARDIO_MACHINES.length >= 5, CARDIO_MACHINES.join(", "));
}

console.log("\nTEST 3 — the two stair entries can actually be reached");
{
  const stairs = EXERCISES.filter(e => (e.equipment || []).includes("stair-climber"));
  ok("3a. CONTROL: there are stair-climber entries to reach", stairs.length >= 2,
     stairs.map(e => e.id).join(", "));
  const kit = resolveEquipment(["stair-climber"]);
  ok("3b. and declaring it makes them available",
     stairs.every(e => exerciseIsAvailable(e, kit)),
     stairs.filter(e => !exerciseIsAvailable(e, kit)).map(e => e.id).join(", "));
}

console.log(`\n  ${fails === 0 ? "ALL PASS" : fails + " RED"}\n`);
process.exit(fails ? 1 : 0);
