/**
 * tools/verify-cap6.mjs
 * 13 Aug 2026 v1
 *
 * CAP-6 (C3) GATE — adapted content reaches people who need it, and
 * does not crowd out people who don't.
 *
 * WHY IT EXISTS. The capability screen answers "what CAN this person
 * do?", and every gate built on it subtracts. Nothing ever asked "what
 * does this person NEED?" — so an engine that only subtracts hands
 * adapted work to everybody able to perform it. Persona 2.15 (26, four
 * gym sessions a week, full rack, capability all yes) performed Seated
 * Arm Cycling nine times in three weeks against Barbell Bench Press
 * five, and opened three of her last four sessions with seated shoulder
 * rolls. Nothing was broken; the code did what it said.
 *
 * BOTH DIRECTIONS, because only one of them is about revenue and the
 * other is about whether the app is usable at all:
 *   - a fully capable person is not handed adapted content
 *   - a person who NEEDS it still gets a real session, not four
 *     exercises and an apology (the CAP-4 regression this must not undo)
 *
 * Runs the real engine against real profiles rather than reading source.
 * The source read correctly for a whole build session while the reserved
 * cardio-warmup slot bypassed every preference rule.
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

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { fails++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

const ASKED = "2026-07-24T08:00:00.000Z";
const BASE = {
  onboardingComplete: true, name: "Test", ageBand: "30-39", tier: "free",
  fitnessLevel: "advanced", goals: ["get-stronger"], conditions: [],
  conditionPainScores: {}, trainingIntent: "improve", sessionVariety: "balanced",
  lifestyle: { activityLevel: "very-active", stressLevel: "moderate",
               sleepQuality: "good", exerciseHistory: "active", returningAfter: null },
  availableTime: 45, activityLog: [], checkinHistory: {}, exerciseHistory: {},
  createdAt: ASKED, updatedAt: ASKED
};

// Re-seed AND re-init between runs: session-builder.js imports the store
// unsuffixed, so a second profile otherwise reads the first one's state.
// That leak produced confidently wrong results during the C3 build.
function sessionFor(capability, equipment, type = "full", mins = 45) {
  _mem["alongside_user"] = JSON.stringify({ ...BASE, capability, equipment });
  store.init();
  return (buildSession({ sessionType: type, durationMins: mins })?.exercises) || [];
}
const adaptiveIn = ex => ex.filter(e => e.adaptive === true);

const FULL_KIT = ["barbell", "dumbbells", "bench", "squat-rack", "cable-machine",
                  "pull-up-bar", "kettlebell", "resistance-bands"];
const CAPABLE   = { chairRise: "yes", floorAccess: "yes", bothFeet: "yes",
                    balanceWorry: "no", legPower: "full", askedAt: ASKED };
const NEEDS_SEATED = { chairRise: "no", floorAccess: "no", bothFeet: "no",
                       balanceWorry: "yes", legPower: "none", askedAt: ASKED };
const NEVER_ASKED  = { chairRise: null, floorAccess: null, bothFeet: null,
                       balanceWorry: null, legPower: null, askedAt: null };

console.log("\nCAP-6 — the library is tagged");

check("every seated entry carries adaptive: true", () => {
  const src = fs.readFileSync("js/data/exercises/seated.js", "utf8");
  const ids  = (src.match(/\bid: '/g) || []).length;
  const tags = (src.match(/adaptive: true/g) || []).length;
  ok(tags >= ids,
     `${ids} entries, ${tags} tagged. An untagged entry is invisible to the ` +
     "de-prioritisation and goes straight back to crowding capable users");
});

console.log("\nCAP-6 — a capable person is not handed adapted content");

check("fully capable, full gym: no adaptive content across 8 builds", () => {
  // Repeated because selection is stochastic. A single clean build proves
  // nothing when the fault it guards is intermittent by nature.
  const hits = [];
  for (let i = 0; i < 8; i++) {
    const found = adaptiveIn(sessionFor(CAPABLE, FULL_KIT));
    if (found.length) hits.push(found.map(e => e.name).join(", "));
  }
  ok(hits.length === 0,
     `adapted content reached a fully capable user in ${hits.length} of 8 builds: ` +
     hits.join(" | ") + ". If the pool is genuinely empty this is correct " +
     "fallback — check the category before weakening this test");
});

check("fully capable, no equipment: still no adaptive content", () =>
  ok(adaptiveIn(sessionFor(CAPABLE, [])).length === 0,
     "a home user with no kit is still capable; equipment is not the signal"));

console.log("\nCAP-6 — SAFETY: people who need it still get a real session");

check("a seated user gets a full-length session, mostly adapted", () => {
  const ex = sessionFor(NEEDS_SEATED, []);
  ok(ex.length >= 6,
     `only ${ex.length} exercises. CAP-4 exists because this user was once ` +
     "given four exercises and no programme; that must not return");
  ok(adaptiveIn(ex).length >= 3,
     `only ${adaptiveIn(ex).length} adapted exercises for somebody who cannot ` +
     "rise from a chair — the de-prioritisation has leaked into an exclusion");
});

check("silence is never read as capability", () => {
  // Somebody who never saw the capability screen keeps the adapted pool
  // at full weight. Same fail-safe direction as every other gate: the
  // cost of being wrong here is a capable person seeing a seated warm-up;
  // the cost the other way is somebody who needs it not being offered it.
  const src = fs.readFileSync("js/session-builder.js", "utf8");
  // 13 Aug 2026: was fn.slice(0, 500) — a fixed character window that
  // broke the moment the function gained a comment explaining itself.
  // The assertion stayed true; the gate stopped being able to see it.
  // Same brittleness as the date-pinned sw1 check and the ordering-pinned
  // nav5 check found earlier today: a gate that measures position rather
  // than substance fails on correct code.
  //
  // Now reads to the function's closing brace.
  const start = src.indexOf("function _capabilityUnrestricted");
  const fn = src.slice(start, src.indexOf("\n}", start));
  ok(/cap\.asked\s*&&/.test(fn),
     "_capabilityUnrestricted() does not require cap.asked, so a user who was " +
     "never asked would be treated as unrestricted");
  ok(sessionFor(NEVER_ASKED, []).length >= 6, "unasked user got a thin session");
});

console.log("\nCAP-6 — the reserved cardio slot obeys the same rules");

check("the warm-up pulse slot does not shadow pickFrom", () => {
  const src = fs.readFileSync("js/session-builder.js", "utf8");
  ok(!/const pickFrom = machine\.length/.test(src),
     "the reserved cardio-warmup slot declares `const pickFrom`, shadowing the " +
     "selector function of the same name. That shadow is why the bypass read " +
     "as correct at the call site and survived three passes over this file");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
