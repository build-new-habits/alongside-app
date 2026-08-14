/**
 * tools/verify-c2.mjs
 * 13 Aug 2026 v1
 *
 * C2 GATE — the rehabilitation library reaches people who have a
 * condition, and nobody else.
 *
 * WHY. session-categories.js selects on movementPattern and affectsAreas
 * only; nothing read the entry's own library. So every rehabilitation
 * entry tagged movementPattern 'squat' was a valid squat candidate for
 * anybody -- 30 of 186 Full Body main candidates (16%) and 31 of 108
 * warm-up candidates (29%). Persona 2.12, a 33-year-old man with a desk
 * job and no injury, was served "Squat with Pelvic Floor Awareness" four
 * times in seven sessions.
 *
 * 61 of the 94 entries are genuinely general -- clamshells, glute
 * bridges, dead bugs, doorway chest stretches -- so a blanket exclusion
 * would have stripped real content from everybody. All 94 were triaged
 * individually and approved by Graeme on 13 Aug 2026
 * (alongside_c2_triage_13aug2026_v1.md).
 *
 * RUNS THE ENGINE, does not read source. The first version of this
 * filter tested `ex.category === "rehabilitation"`, ran on every single
 * candidate, and excluded NOTHING -- because _filterCandidates()
 * overwrites `category` with the session category before the filter
 * sees it. It read as correct and did nothing. Only building sessions
 * caught it.
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

const REHAB = new Map(EXERCISES.filter(e => e.category === "rehabilitation")
                               .map(e => [e.id, e]));
const ASKED = "2026-07-24T08:00:00.000Z";

function build(overrides, type = "full", mins = 30) {
  _mem["alongside_user"] = JSON.stringify({
    onboardingComplete: true, name: "Test", ageBand: "30-39", tier: "free",
    fitnessLevel: "beginner", goals: ["feel-good"], conditions: [],
    conditionPainScores: {}, trainingIntent: "improve", sessionVariety: "balanced",
    lifestyle: { activityLevel: "sedentary", stressLevel: "moderate",
                 sleepQuality: "okay", exerciseHistory: "never", returningAfter: null },
    capability: { chairRise: "yes", floorAccess: "yes", bothFeet: "yes",
                  balanceWorry: "no", legPower: "full", askedAt: ASKED },
    equipment: [], availableTime: mins, activityLog: [], checkinHistory: {},
    exerciseHistory: {}, createdAt: ASKED, updatedAt: ASKED, ...overrides
  });
  store.init();
  return (buildSession({ sessionType: type, durationMins: mins })?.exercises) || [];
}

console.log("\nC2 — the library is triaged");

check("every rehabilitation entry is decided either way", () => {
  // Comments stripped before counting: the file's own header explains the
  // tag and therefore contains the string, which made the count 62 the
  // moment the change note was written. A gate that counts its own
  // documentation is a gate that fails on a comment.
  const src = fs.readFileSync("js/data/exercises/rehabilitation.js", "utf8")
                .replace(/\/\*[\s\S]*?\*\//g, "")
                .replace(/^\s*\/\/[^\n]*$/gm, "");
  const tagged = (src.match(/generalPurpose: true/g) || []).length;
  ok(REHAB.size === 99, `expected 99 rehabilitation-tagged entries, found ${REHAB.size}`);
  ok(tagged === 61,
     `${tagged} entries tagged generalPurpose; the approved triage is 61 in this file. ` +
     "If the library changed, re-triage rather than adjusting this number");
});

check("absent means false — a new entry is condition-only by default", () => {
  const src = fs.readFileSync("js/session-builder.js", "utf8");
  ok(/generalPurpose !== true/.test(src),
     "the filter tests for something other than `!== true`, so an entry with " +
     "generalPurpose: undefined could pass. Absent must fail safe");
});

console.log("\nC2 — condition-only work does not reach people without a condition");

check("no condition-only rehab content in 12 sessions across all types", () => {
  const leaks = [];
  for (const type of ["full", "lower", "upper", "core"]) {
    for (let i = 0; i < 3; i++) {
      for (const ex of build({}, type, 30)) {
        const src = REHAB.get(ex.id);
        if (src && src.generalPurpose !== true) leaks.push(`${type}: ${ex.name}`);
      }
    }
  }
  ok(leaks.length === 0,
     `condition-only rehabilitation content reached a user with no declared ` +
     `condition: ${[...new Set(leaks)].join(" | ")}`);
});

check("the pelvic floor set never reaches a general session", () => {
  // Named specifically because this is the one that actually happened,
  // four times in seven sessions, to a 33-year-old man.
  const pf = EXERCISES.filter(e => /pelvic floor/i.test(e.name)).map(e => e.id);
  ok(pf.length > 0, "the pelvic floor entries have gone missing from the database");
  const hits = [];
  for (let i = 0; i < 10; i++)
    for (const ex of build({})) if (pf.includes(ex.id)) hits.push(ex.name);
  ok(hits.length === 0, `pelvic floor content in a general session: ${hits.join(", ")}`);
});

console.log("\nC2 — general content is NOT lost");

check("promoted entries still reach ordinary sessions", () => {
  // The over-correction this triage exists to avoid. If the filter had
  // been a blanket exclusion, clamshells, glute bridges, dead bugs and
  // doorway chest stretches would all have vanished from every session.
  const seen = new Set();
  for (const type of ["full", "lower", "upper", "core"])
    for (let i = 0; i < 5; i++)
      for (const ex of build({}, type, 30))
        if (REHAB.get(ex.id)?.generalPurpose === true) seen.add(ex.name);
  ok(seen.size >= 3,
     `only ${seen.size} general-purpose rehabilitation entries appeared across ` +
     "20 sessions. The filter has over-corrected into a blanket exclusion");
});

check("sessions are not thinned by the filter", () => {
  const ex = build({});
  ok(ex.length >= 6, `only ${ex.length} exercises — the pool has been starved`);
});

console.log("\nC2 — the overwrite trap stays closed");

check("the source library is preserved before category is reassigned", () => {
  const src = fs.readFileSync("js/session-builder.js", "utf8");
  ok(/sourceLibrary: ex\.category/.test(src),
     "matched.push no longer preserves the entry's own library. `category` is " +
     "overwritten with the SESSION category, so any filter reading ex.category " +
     "silently matches nothing — which is exactly how the first version of this " +
     "filter passed review while excluding nothing at all");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
