/**
 * tools/verify-standing-floor.mjs
 * 17 Oct 2026 v1
 *
 * SUITE-FLAKE-7, found 13 Oct: verify-cap6's CAP-7 ("a floor restriction
 * does not confine somebody to a chair") failed once in a fresh-clone run
 * and passed alone. Not a flaky check: measured on v663, persona 2.11
 * (cannot get down to the floor, rises from a chair "not easily", able
 * to stand) received a full-body session with NO standing work in 7 of
 * 400 builds (1.75%), every move seated: the random picks happened to
 * land on adapted work. CAP-7 says she must not be confined to a chair.
 *
 * Rule (session-builder.js v85): in a strength session for somebody who
 * was asked and does not need to be seated, the main part holds at least
 * one standing move when the pool has one -- swapping a seated pick, never
 * adding. Somebody who needs seated work is untouched (CAP-4).
 *
 * 300 builds each way, so a 1.75% fault shows (chance of missing it 0.5%).
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

// GATE-PATH, 08 Sep 2026. Paths resolved from import.meta.url, not the
// working directory.
//
// 72 of 139 gates read files by a path relative to process.cwd(), so
// they were green from the repo root and read NOTHING from anywhere
// else. Not a live fault -- every session so far has run them from the
// root -- but an expensive trap: a session running the suite by full
// path from elsewhere sees most of it red and reasonably concludes the
// app is broken.
const _GATE_ROOT = new URL("../", import.meta.url);
const _gatePath = (p) => new URL(String(p).replace(/^\.\//, ""), _GATE_ROOT);



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


let fails = 0, passes = 0;
const ok = (name, cond, detail = "") => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
  if (cond) passes++; else { fails++; if (detail) console.log(`        ${detail}`); }
};
const N = 300;
const P211 = { chairRise: "not-easily", floorAccess: "no", bothFeet: "no", balanceWorry: "sometimes", legPower: "limited", askedAt: ASKED };
let none = 0;
for (let k = 0; k < N; k++) {
  const main = sessionFor(P211, [], "full", 30).filter(e => (e.section || e.role) === "main");
  if (!main.some(e => e.position === "standing")) none++;
}
ok(`1a. persona 2.11, ${N} full-body sessions: every one has standing work in the main part`, none === 0, `${none} of ${N} had none`);
const SEATED = { chairRise: "no", floorAccess: "no", bothFeet: "no", balanceWorry: "yes", legPower: "none", askedAt: ASKED };
let standing = 0;
for (let k = 0; k < 60; k++) standing += sessionFor(SEATED, [], "full", 30).filter(e => e.position === "standing").length;
ok("1b. SAFETY: somebody who cannot rise from a chair is given no standing move", standing === 0, `${standing} standing`);
console.log(`\nVERIFY-STANDING-FLOOR: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
