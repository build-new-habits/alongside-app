/**
 * tools/verify-dedupe.mjs
 * 13 Aug 2026 v1
 *
 * DEDUPE-1 — one name, one exercise; and no session shows a name twice.
 *
 * Fourteen exercise names each existed twice under different ids:
 * Burpee, High Knees, Romanian Deadlift, 4-7-8 Breathing, World's
 * Greatest Stretch and nine others. Two faults in one:
 *
 *   1. THE DATA. Some were true duplicates. Some were genuinely
 *      different exercises sharing a name -- `romanian-deadlift` was a
 *      DUMBBELL rdl at difficulty 2 while `barbell-rdl` was a barbell
 *      one at 3, and `ab-wheel-rollout` and `gym-ab-wheel-rollout` had
 *      identical equipment and difficulty 3 versus 6. A database that
 *      disagrees with itself about how hard something is matters,
 *      because difficulty IS the capability ceiling.
 *
 *   2. THE SELECTION. `chosen` is a Set of IDS, so nothing stopped both
 *      members of a pair landing in one session. A person could read
 *      "Burpee" twice on one screen.
 *
 * Both are fixed. This gate holds both closed, and the second check
 * matters more than the first: three legitimate pairs remain by design
 * (Pigeon Pose and Pigeon Pose — Yoga), so the selection guard is what
 * stops a future import reintroducing the visible fault.
 */
import fs from "node:fs";

const _mem = {};
globalThis.localStorage = {
  getItem: k => (k in _mem ? _mem[k] : null),
  setItem: (k, v) => { _mem[k] = String(v); },
  removeItem: k => { delete _mem[k]; }, clear() {}
};
globalThis.window = globalThis;
try {
  Object.defineProperty(globalThis, "navigator",
    { value: { onLine: true, userAgent: "node" }, configurable: true });
} catch {}

const { store }        = await import("../js/store.js");
const { buildSession } = await import("../js/session-builder.js");
const { EXERCISES }    = await import("../js/data/exercises/index.js");

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { fails++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

console.log("\nDEDUPE-1 — the database");

check("no exercise name is used twice", () => {
  const byName = {};
  EXERCISES.forEach(e => (byName[e.name] = byName[e.name] || []).push(e.id));
  const dupes = Object.entries(byName).filter(([, v]) => v.length > 1);
  ok(dupes.length === 0,
     `${dupes.length} duplicate name(s): ` +
     dupes.map(([n, v]) => `${n} (${v.join(", ")})`).join(" | ") +
     ". If two entries are genuinely different, the NAME has to say so — " +
     "the person reads the name, not the id");
});

check("every entry still has id, name and instructions", () => {
  // The deduplication removed eleven object literals from six files. A
  // first attempt at that stripped two lines from each entry instead of
  // removing the entry, leaving exercises with no id — reverted, but the
  // shape of that mistake is why this check exists.
  for (const f of ["id", "name"])
    ok(EXERCISES.every(e => e[f]), `an entry is missing its ${f}`);
  ok(EXERCISES.every(e => Array.isArray(e.instructions) && e.instructions.length),
     "an entry has no instructions");
});

check("nothing references a retired id", () => {
  const ids = new Set(EXERCISES.map(e => e.id));
  const RETIRED = ["plyo-burpee", "run-drill-high-knees", "cardio-stair-climbing",
    "cardio-shadow-boxing", "seated-band-row", "hip-flexor-sofa-stretch",
    "breathing-478", "gym-hip-thrust-barbell", "ab-wheel-rollout",
    "world-greatest-stretch", "romanian-deadlift"];
  const walk = d => fs.readdirSync(d, { withFileTypes: true })
    .flatMap(e => e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]);
  const files = walk("js").filter(f => f.endsWith(".js") && !f.includes("data/exercises"));
  const hits = [];
  for (const f of files) {
    const s = fs.readFileSync(f, "utf8");
    for (const r of RETIRED)
      if (new RegExp(`["']${r}["']`).test(s)) hits.push(`${f} -> ${r}`);
  }
  ok(hits.length === 0,
     `live code points at a retired exercise: ${hits.join(" | ")}. ` +
     "core-session.js hardcoded ab-wheel-rollout and needed repointing");
  for (const r of RETIRED) ok(!ids.has(r), `${r} is back in the database`);
});

console.log("\nDEDUPE-1 — selection never shows a name twice");

check("no session repeats a name, across 7 types x 4 builds", () => {
  _mem["alongside_user"] = JSON.stringify({
    onboardingComplete: true, name: "Test", tier: "personal",
    fitnessLevel: "advanced", goals: ["get-stronger"], conditions: [],
    conditionPainScores: {}, trainingIntent: "improve", sessionVariety: "balanced",
    capability: { chairRise: "yes", floorAccess: "yes", bothFeet: "yes",
                  balanceWorry: "no", legPower: "full", askedAt: "2026-07-24T08:00:00.000Z" },
    equipment: ["barbell", "dumbbells", "bench", "squat-rack", "cable-machine",
                "pull-up-bar", "kettlebell", "resistance-bands"],
    activityLog: [], checkinHistory: {}, exerciseHistory: {}
  });
  store.init();
  const bad = [];
  for (const type of ["full", "lower", "upper", "core", "cardio", "mobility", "glute"])
    for (let i = 0; i < 4; i++) {
      const names = (buildSession({ sessionType: type, durationMins: 45 })?.exercises || [])
        .map(e => e.name);
      const seen = new Set();
      names.forEach(n => { if (seen.has(n)) bad.push(`${type}: ${n}`); seen.add(n); });
    }
  ok(bad.length === 0, `a name appeared twice in one session: ${[...new Set(bad)].join(" | ")}`);
});

check("the name guard is present in selection", () =>
  ok(/usedNames/.test(fs.readFileSync("js/session-builder.js", "utf8")),
     "pickFrom() no longer filters on name. `chosen` is a Set of IDS, so " +
     "identity is checked by id while the person reads the name — three " +
     "legitimate same-movement pairs remain by design and this is what " +
     "keeps them out of the same session"));

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
