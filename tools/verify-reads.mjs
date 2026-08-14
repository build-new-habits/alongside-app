/**
 * tools/verify-reads.mjs
 * 13 Aug 2026 v1
 *
 * D2 / VOICE-3 GATE — no coach line asserts a fact without a signal.
 *
 * Graeme, 13 Aug 2026: "I assumed, because it was so obvious to all
 * other similar types of coach voice, it would be gated in data
 * signals."
 *
 * He was right to assume it. Every line in personal-reads.js makes a
 * factual claim about somebody's history -- "you've had a gap", "you've
 * been coming in at a lower energy this fortnight", "two of these have
 * been in your last four sessions". An ungated line there is not a
 * stylistic weakness; it is the coach lying, and one caught lie costs
 * more than fifty good lines gain.
 *
 * The failure this guards is the easy one: somebody adds a beautiful
 * line, forgets the predicate, and nothing anywhere notices — because a
 * string with no `when` looks exactly like a string with one until it
 * is read closely.
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

const { store } = await import("../js/store.js");
const { PERSONAL_READS, buildReads, buildSignals } =
  await import("../js/data/personal-reads.js");

let fails = 0;
const check = (name, fn) => {
  try { fn(); console.log(`  PASS  ${name}`); }
  catch (e) { fails++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};
const ok = (c, m) => { if (!c) throw new Error(m); };

const seed = obj => { _mem["alongside_user"] = JSON.stringify(obj); store.init(); };
const BLANK = {
  onboardingComplete: true, name: "Test", tier: "personal",
  activityLog: [], checkinHistory: {}, exerciseHistory: {},
  goals: [], conditions: [], conditionPainScores: {}
};

console.log("\nVOICE-3 — every read is gated on real data");

check("no read exists without a predicate", () => {
  const missing = PERSONAL_READS.filter(r => typeof r.when !== "function")
                                .map(r => r.id || r.text.slice(0, 40));
  ok(missing.length === 0,
     `these lines assert a fact with nothing behind them: ${missing.join(" | ")}. ` +
     "A read with no signal is the coach lying about the person's own history");
});

check("every read has a stable id", () =>
  ok(PERSONAL_READS.every(r => r.id) &&
     new Set(PERSONAL_READS.map(r => r.id)).size === PERSONAL_READS.length,
     "reads need unique ids so a failing one can be named in a trace"));

check("a brand-new user gets no reads at all", () => {
  // The most important single assertion here. Every one of these lines
  // refers to a history that does not exist yet, so on day one they must
  // all be silent. A read firing for somebody with no past is the
  // clearest possible version of the fault.
  seed(BLANK);
  const got = buildReads([{ id: "x", section: "main", difficultyLevel: 2 }]);
  ok(got.length === 0,
     `${got.length} read(s) fired for a user with no history: ` +
     got.map(r => r.id).join(", "));
});

check("empty inputs do not throw", () => {
  seed(BLANK);
  ok(Array.isArray(buildReads()), "buildReads() threw or returned a non-array");
  ok(typeof buildSignals() === "object", "buildSignals() threw on no arguments");
});

check("junk in the log resolves to silence, not a crash", () => {
  seed({ ...BLANK, activityLog: [{}, { completedAt: "not-a-date" }, null].filter(Boolean) });
  ok(buildReads([]).length === 0, "junk data produced a read");
});

console.log("\nVOICE-3 — signals are real, not decorative");

check("the gap read requires an actual gap", () => {
  const day = 86400000, now = Date.now();
  const mk = daysAgo => ({
    id: `s${daysAgo}`, type: "workout", status: "complete",
    completedAt: new Date(now - daysAgo * day).toISOString(),
    durationMins: 45, exerciseIds: []
  });
  // Two sessions a day apart: no gap, must stay silent.
  seed({ ...BLANK, activityLog: [mk(0), mk(1), mk(2), mk(3), mk(4)] });
  ok(!buildReads([]).some(r => r.id === "after-gap"),
     "the gap read fired for somebody who trained yesterday");

  // Fourteen days apart: a real gap.
  seed({ ...BLANK, activityLog: [mk(0), mk(14), mk(15), mk(16)] });
  ok(buildReads([]).some(r => r.id === "after-gap"),
     "the gap read did not fire after a genuine fourteen-day break");
});

check("free users never reach a read", () => {
  const sr = fs.readFileSync("js/data/session-rationale.js", "utf8");
  ok(/tier === "free"\) return null/.test(sr) || /if \(tier === "free"\)/.test(sr),
     "session-rationale.js does not gate the read on tier. These lines are the " +
     "Personal-tier difference in kind; free must not receive them");
});

console.log("\nVOICE-3 — withheld lines stay withheld until their data exists");

check("lines with no honest signal are documented, not quietly dropped", () => {
  const src = fs.readFileSync("js/data/personal-reads.js", "utf8");
  ok(/WITHHELD/.test(src),
     "the WITHHELD block is gone. Three approved lines have no computable " +
     "signal yet; deleting the record of why means somebody re-writes them " +
     "from scratch or, worse, ships them ungated");
});

console.log(fails === 0 ? "\nALL PASS\n" : `\n${fails} FAILURE(S)\n`);
process.exit(fails === 0 ? 0 : 1);
