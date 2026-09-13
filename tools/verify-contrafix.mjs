/**
 * tools/verify-contrafix.mjs
 * 13 Sep 2026 v1
 *
 * CONTRA-FIX. The harder version of a movement is never allowed where the
 * gentler one is refused.
 *
 * ── THE FAULT ───────────────────────────────────────────────────────
 *
 * CONTRA-AUDIT (12 Sep) found seventeen pairs where the GENTLER entry
 * excluded a condition that its HARDER sibling allowed. Three hip
 * abductions all excluded `hip-acute` while the standing version -- which
 * loads the hip most -- did not. `barbell-overhead-press` allowed
 * `lower-back-acute` while the seated band press did not. `dead-bug`
 * carried NO contraindications at all, while the arms-only progression
 * written for a sore back excluded one.
 *
 * Nobody was exposed: each entry is filtered on its own, so nobody was
 * given something they had declared they could not do. The consequence
 * was narrower and still wrong -- on a bad day the app withheld the
 * easier option and kept the harder one.
 *
 * ── THE RULE, AND WHY IT COULD SHIP AHEAD OF REVIEW ─────────────────
 *
 * The harder version inherits the gentler version's exclusions. If
 * somebody wrote "not with an acute hip" on the seated hip abduction,
 * that judgement applies at least as much to the standing one.
 *
 * Graeme's decision, 13 Sep: ship it and seek approval after, rather than
 * hold it. What makes that defensible is the DIRECTION. This change only
 * ever REMOVES offers from people who have declared an acute condition.
 * It cannot put anything in front of anybody that was not already there.
 * Test 3 asserts that direction and is the most important test here: if a
 * future edit ever loosens an entry through this rule, it goes red.
 *
 * The real risk is the opposite one -- over-restriction, the app
 * withholding movement from somebody who could safely do it. Test 4 is
 * the carve-out: no condition may be left with nothing at all for a
 * movement pattern. Measured before shipping, the thinnest case left two
 * options.
 *
 * ── STILL FOR A REVIEWER ────────────────────────────────────────────
 *
 * The rule is a reasonable default, not a clinical judgement. Three
 * things still want a professional's eye, and none of them blocks this:
 * whether any pair should have loosened instead of tightened; whether
 * `dead-bug` should carry more than the one exclusion it now has; and the
 * two duplicate pairs, which are a content decision.
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

const { EXERCISES } = await import("../js/data/exercises/index.js");
const byId = id => EXERCISES.find(e => e.id === id);

// The same grouping the audit uses. A heuristic, and that is fine: it is
// finding CANDIDATE families to check, not deciding anything.
const MOD = /\b(modified|assisted|banded|band|resistance|wall|incline|decline|kneeling|knee|knees|seated|supported|single|one|two|arm|arms|leg|legs|weighted|progression|progressive|rehab|load|activation|box|elevated|tempo|pause|paused|jump|jumping|dumbbell|barbell|kettlebell|cable|machine|bodyweight|isometric|hold|standing|lying|supine|prone|side|chair|full|partial|deficit|goblet|alternating|reverse|lateral|slow|basic|advanced|beginner|gentle|light|heavy|drill|flow|series|pose|stretch|with|and|the|to|on|a|of|level|version|variation)\b/gi;
const stem = e => (e.name || "").toLowerCase().replace(/[()–—-]/g, " ")
  .replace(MOD, " ").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();

// The three the name heuristic cannot group, found by hand during the
// exercise-versions work. Named so they cannot drift back.
const HAND_PAIRS = [
  ["hip-hinge-drill", "romanian-deadlift-rehab"],
  ["dead-bug-progression-1", "dead-bug"],
  ["side-plank-modified", "side-plank-full"],
];

function inversions() {
  const out = [];
  const groups = {};
  for (const e of EXERCISES) {
    const s = stem(e);
    if (!s) continue;
    const k = (e.movementPattern || "?") + "|" + s;
    (groups[k] = groups[k] || []).push(e);
  }
  const check = (a, b) => {
    const extra = (a.contraindications || []).filter(c => !(b.contraindications || []).includes(c));
    if (extra.length) out.push(`${a.id}(d${a.difficultyLevel}) excludes ${extra.join("/")} that ${b.id}(d${b.difficultyLevel}) allows`);
  };
  for (const v of Object.values(groups)) {
    if (v.length < 2) continue;
    for (const a of v) for (const b of v) {
      if ((a.difficultyLevel ?? 0) < (b.difficultyLevel ?? 0)) check(a, b);
    }
  }
  for (const [g, h] of HAND_PAIRS) {
    const a = byId(g), b = byId(h);
    if (a && b) check(a, b);
  }
  return out;
}

console.log("\nCONTRA-FIX — the harder version is never the one left standing\n");

console.log("TEST 0 — the check reaches real data");

ok("0a. CONTROL: the grouping finds real families", (() => {
  const groups = {};
  for (const e of EXERCISES) { const s = stem(e); if (s) (groups[(e.movementPattern||"?")+"|"+s] = groups[(e.movementPattern||"?")+"|"+s] || []).push(e); }
  return Object.values(groups).filter(v => v.length > 1).length > 20;
})(), "if nothing groups, test 1 passes over an empty set");
ok("0b. the three hand-found pairs all still exist",
   HAND_PAIRS.every(([g, h]) => byId(g) && byId(h)),
   HAND_PAIRS.filter(([g, h]) => !byId(g) || !byId(h)).flat().join(", "));

console.log("\nTEST 1 — no inversions anywhere in the library");

{
  const found = inversions();
  ok("1a. zero pairs where the gentler entry is stricter than the harder one" +
     (found.length ? `  [${found.length}]` : ""), found.length === 0,
     found.slice(0, 6).join("\n        "));
}

console.log("\nTEST 2 — the seventeen are actually fixed, named one by one");

{
  const EXPECT = [
    ["standing-hip-abduction", "hip-acute"],
    ["barbell-overhead-press", "lower-back-acute"],
    ["dead-bug", "lower-back-acute"],
    ["side-plank-full", "abdominals-acute"],
    ["side-plank-full", "glutes-acute"],
    ["side-plank-full", "wrist-elbow-acute"],
    ["romanian-deadlift-rehab", "glutes-acute"],
    ["single-leg-deadlift-rehab", "glutes-acute"],
    ["single-leg-deadlift-rehab", "ankle-foot-acute"],
    ["single-leg-calf-raise", "ankle-foot-acute"],
    ["band-chest-press", "chest-pecs-acute"],
    ["barbell-deadlift", "ankle-foot-acute"],
    ["gym-cable-pallof-press", "glutes-acute"],
    ["gym-incline-dumbbell-press", "wrist-elbow-acute"],
    ["seated-hip-hinge", "hamstring-acute"],
    ["seated-hip-hinge", "glutes-acute"],
    ["seated-hamstring-curl-band", "lower-back-acute"],
    ["standing-hamstring-curl-band", "lower-back-acute"],
  ];
  const missing = EXPECT.filter(([id, cond]) =>
    !(byId(id)?.contraindications || []).includes(cond)).map(([id, c]) => `${id}:${c}`);
  ok("2a. every inherited exclusion is present" + (missing.length ? `  [${missing.join(", ")}]` : ""),
     missing.length === 0);
  ok("2b. dead-bug no longer carries an empty exclusion list",
     (byId("dead-bug")?.contraindications || []).length > 0,
     "an empty list on a core exercise meant it was offered to everybody, including a sore back");
}

console.log("\nTEST 3 — the direction. This change only ever removes offers");

{
  // The whole defence for shipping ahead of clinical review. Every entry
  // touched must have gained exclusions and lost none.
  const BEFORE = {
    "standing-hip-abduction": 1, "barbell-overhead-press": 1, "dead-bug": 0,
    "side-plank-full": 3, "romanian-deadlift-rehab": 2, "single-leg-deadlift-rehab": 2,
    "single-leg-calf-raise": 2, "band-chest-press": 1, "barbell-deadlift": 3,
    "gym-cable-pallof-press": 2, "gym-incline-dumbbell-press": 2, "seated-hip-hinge": 1,
    "seated-hamstring-curl-band": 2, "standing-hamstring-curl-band": 1,
  };
  const loosened = Object.entries(BEFORE).filter(([id, n]) =>
    (byId(id)?.contraindications || []).length < n).map(([id]) => id);
  ok("3a. no touched entry has FEWER exclusions than before" +
     (loosened.length ? `  [${loosened.join(", ")}]` : ""), loosened.length === 0,
     "loosening is the one direction that could put something in front of somebody");
  ok("3b. and every one gained at least one",
     Object.entries(BEFORE).every(([id, n]) => (byId(id)?.contraindications || []).length > n),
     Object.entries(BEFORE).filter(([id, n]) => (byId(id)?.contraindications || []).length <= n).map(([id]) => id).join(", "));
}

console.log("\nTEST 4 — the carve-out: this change emptied nothing");

{
  // FIRST DRAFT OF THIS TEST WAS WRONG, and recorded rather than quietly
  // fixed. It asserted that NO pattern is empty for any condition, and
  // went red on five combinations -- lunge/knee-acute, squat/knee-acute,
  // rotation/lower-back-acute, shoulder-rotation/shoulder-acute,
  // anti-lateral-flexion/lower-back-acute.
  //
  // All five were already like that before CONTRA-FIX touched anything,
  // measured by running the same check against the previous commit. They
  // are deliberate: nobody with an acutely painful knee should be
  // lunging. A test that fails on correct pre-existing content is a test
  // that gets switched off.
  //
  // The real question is narrower: did THIS change take the last option
  // away from anybody? For each entry that gained an exclusion, something
  // else in the same movement pattern must still be available for that
  // condition.
  const INHERITED = [
    ["standing-hip-abduction", "hip-acute"],
    ["barbell-overhead-press", "lower-back-acute"],
    ["dead-bug", "lower-back-acute"],
    ["side-plank-full", "abdominals-acute"],
    ["side-plank-full", "glutes-acute"],
    ["side-plank-full", "wrist-elbow-acute"],
    ["romanian-deadlift-rehab", "glutes-acute"],
    ["single-leg-deadlift-rehab", "glutes-acute"],
    ["single-leg-deadlift-rehab", "ankle-foot-acute"],
    ["single-leg-calf-raise", "ankle-foot-acute"],
    ["band-chest-press", "chest-pecs-acute"],
    ["barbell-deadlift", "ankle-foot-acute"],
    ["gym-cable-pallof-press", "glutes-acute"],
    ["gym-incline-dumbbell-press", "wrist-elbow-acute"],
    ["seated-hip-hinge", "hamstring-acute"],
    ["seated-hip-hinge", "glutes-acute"],
    ["seated-hamstring-curl-band", "lower-back-acute"],
    ["standing-hamstring-curl-band", "lower-back-acute"],
  ];

  const stranded = [];
  const counts = [];
  for (const [id, cond] of INHERITED) {
    const ex = byId(id);
    if (!ex) { stranded.push(`${id} missing`); continue; }
    const left = EXERCISES.filter(e =>
      e.movementPattern === ex.movementPattern &&
      !(e.contraindications || []).includes(cond));
    counts.push(left.length);
    if (left.length === 0) stranded.push(`${ex.movementPattern} / ${cond}`);
  }
  ok("4a. every tightened pattern still has something for that condition" +
     (stranded.length ? `  [${stranded.join("; ")}]` : ""), stranded.length === 0,
     "over-restriction is the real risk of this rule, and this is where it shows");
  ok("4b. CONTROL: the check ran over all eighteen inherited exclusions",
     counts.length === INHERITED.length, `${counts.length} of ${INHERITED.length}`);
  ok("4c. and the thinnest case is not down to its last option",
     Math.min(...counts) >= 2, `thinnest pattern leaves ${Math.min(...counts)}`);
}

console.log(`\n  ${fails === 0 ? "ALL PASS" : fails + " RED"}\n`);
process.exit(fails ? 1 : 0);
