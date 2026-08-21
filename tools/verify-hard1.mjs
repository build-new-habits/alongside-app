/**
 * tools/verify-hard1.mjs
 * 21 Aug 2026 v1
 *
 * R1 — the hard conversation. Off-course detection.
 *
 * Authority: Documents/Business/alongside_r1_r2_amendment_21aug2026_v1.md
 * v1, which supersedes the revenue architecture's §4 in thirteen places.
 * The original spec was written against files nobody had opened.
 *
 * WHY THIS GATE EXECUTES RATHER THAN GREPS.
 *
 * SWEEP-1 found 43 of 77 gates are source-text only. BIAS-3 was fatal on
 * the THIRD LINE of generateDailyOptions(), and verify-bias1.mjs was
 * green throughout — it asserted the source text said the call was made,
 * which was true. The call was there, correct, and threw. A source-text
 * gate cannot tell a live call from a throwing one, and five green gates
 * sat on broken behaviour in a single session.
 *
 * So every assertion below imports the module and calls it against
 * constructed state. That is also why detection lives in a pure module
 * rather than in my-programme.js: a view full of innerHTML can only be
 * asserted as "did this string appear", which is the same failure in a
 * costume.
 *
 * WHAT THIS GATE IS REALLY PROTECTING.
 *
 * Not the offer. The SILENCE. Telling somebody in burnout that their
 * date is not going to happen is precisely the harm this product exists
 * to refuse, and the offer is worth nothing next to that. Suppression is
 * nearly free — a suppressed offer leaves lastOfferedAt untouched and
 * returns on the next open, and the trigger already requires the date to
 * be 14+ days out — so every threshold sits on the cautious side and
 * every suppression condition gets its own independent assertion.
 *
 * Run: node tools/verify-hard1.mjs
 */

import {
  evaluateGoalReview,
  toDayKey,
  daysBetween,
  trailingCompletionRate
} from "../js/data/goal-review.js";

let failures = 0;
let checks = 0;

function ok(label, condition, detail = "") {
  checks++;
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label}${detail ? "  --  " + detail : ""}`);
  }
}

function section(name) {
  console.log(`\n${name}`);
}

// ── Fixtures ────────────────────────────────────────────────────────
//
// A fixed "now" so nothing here depends on the day the gate is run.
const NOW = new Date("2026-08-21T10:00:00.000Z");

function daysAgo(n) {
  return new Date(NOW.getTime() - n * 86400000).toISOString();
}

function daysAhead(n) {
  return new Date(NOW.getTime() + n * 86400000).toISOString();
}

/**
 * An activity log with `count` completed sessions spread evenly across
 * the trailing 28 days.
 */
function logWith(count, { status = "completed" } = {}) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      type: "workout",
      status,
      completedAt: daysAgo(Math.floor((i * 27) / Math.max(count - 1, 1)))
    });
  }
  return out;
}

/**
 * The clean off-course case. Premium, both fields present, matured well
 * past 28 days, date 30 days out, weekly target of 3 agreed, and 5
 * sessions in 28 days — a rate of ~42%, well under the 60% line.
 */
function baseContext(overrides = {}) {
  return {
    isPremium: true,
    now: NOW,
    strategicGoal: {
      primaryGoal: "improve-cardio",
      targetDescription: "Walk the Quantocks ridge with Jen",
      targetDate: daysAhead(30),
      targetSetAt: daysAgo(60),
      setAt: daysAgo(60),
      weeklySessionTarget: 3,
      targetValue: null,
      targetUnit: null,
      review: { lastOfferedAt: null, outcomes: [] }
    },
    legacyTargetDate: null,
    targetType: null,
    activityLog: logWith(5),
    painLevel: 2,
    burnoutLevel: "none",
    mood: 6,
    energy: 6,
    careOpeningToday: false,
    ...overrides
  };
}

function sg(overrides) {
  const base = baseContext();
  return { ...base, strategicGoal: { ...base.strategicGoal, ...overrides } };
}

// ── 1. The clean case fires ─────────────────────────────────────────
section("1. Fires on a clean off-course case");
{
  const r = evaluateGoalReview(baseContext());
  ok("offer is true", r.offer === true, `reason=${r.reason}`);
  ok("carries the person's own words", r.targetDescription === "Walk the Quantocks ridge with Jen");
  ok("reports days until the target", r.daysUntilTarget === 30, `got ${r.daysUntilTarget}`);
  ok("reports the trailing rate", r.rate > 0.4 && r.rate < 0.45, `got ${r.rate}`);
}

// ── 2. Every suppression condition, independently ───────────────────
section("2. Silent on each suppression condition, independently");
{
  const cases = [
    ["pain at 7 (getZoneStatus severe)", { painLevel: 7 }, "pain"],
    ["pain at 9", { painLevel: 9 }, "pain"],
    ["care opening today", { careOpeningToday: true }, "care"],
    ["burnout moderate", { burnoutLevel: "moderate" }, "burnout"],
    ["burnout high", { burnoutLevel: "high" }, "burnout"],
    ["mood at 3", { mood: 3 }, "band"],
    ["energy at 3", { energy: 3 }, "band"],
    ["mood at 1", { mood: 1 }, "band"]
  ];
  for (const [label, override, expectReason] of cases) {
    const r = evaluateGoalReview(baseContext(override));
    ok(`silent — ${label}`, r.offer === false && r.reason.includes(expectReason),
       `offer=${r.offer} reason=${r.reason}`);
  }

  // Pain 6 is NOT severe. The threshold must be a threshold, not a mood.
  const notSevere = evaluateGoalReview(baseContext({ painLevel: 6 }));
  ok("pain at 6 does NOT suppress", notSevere.offer === true, `reason=${notSevere.reason}`);

  // Mood/energy 4 is above the bottom band.
  const above = evaluateGoalReview(baseContext({ mood: 4, energy: 4 }));
  ok("mood/energy at 4 does NOT suppress", above.offer === true, `reason=${above.reason}`);
}

// ── 3. Weight-based targets are excluded entirely ───────────────────
section("3. Weight-based targets excluded entirely");
{
  const byGoalId = evaluateGoalReview(sg({ primaryGoal: "lose-weight" }));
  ok("silent on primaryGoal lose-weight", byGoalId.offer === false && byGoalId.reason.includes("weight"),
     `reason=${byGoalId.reason}`);

  const byEngineId = evaluateGoalReview(sg({ primaryGoal: "weight-loss" }));
  ok("silent on engine id weight-loss", byEngineId.offer === false && byEngineId.reason.includes("weight"));

  const byTargetType = evaluateGoalReview(baseContext({ targetType: "weight" }));
  ok("silent on targetType weight", byTargetType.offer === false && byTargetType.reason.includes("weight"));

  const byUnit = evaluateGoalReview(sg({ targetUnit: "kg" }));
  ok("silent on a kg target unit", byUnit.offer === false && byUnit.reason.includes("weight"));
}

// ── 4. The denominator nobody agreed to ─────────────────────────────
section("4. A default of 3 is never a denominator");
{
  // HOME-1's rule. weeklySessionTarget defaults to 3 with setAt null --
  // the pair records that nobody chose it. The arithmetic below WOULD
  // trigger; the absence of consent is what stops it.
  const r = evaluateGoalReview(sg({ setAt: null }));
  ok("silent when setAt is null, though the rate is off-course",
     r.offer === false && r.reason.includes("unagreed"), `reason=${r.reason}`);

  // targetSetAt present but setAt null must still suppress: the two
  // fields answer different questions and one cannot stand in for the
  // weekly target's consent.
  const r2 = evaluateGoalReview(sg({ setAt: null, targetSetAt: daysAgo(60) }));
  ok("targetSetAt does not substitute for the weekly target's consent",
     r2.offer === false && r2.reason.includes("unagreed"));
}

// ── 5. Description required ─────────────────────────────────────────
section("5. A date without the person's own words does not fire");
{
  const empty = evaluateGoalReview(sg({ targetDescription: "" }));
  ok("silent on empty description", empty.offer === false && empty.reason.includes("description"));

  const spaces = evaluateGoalReview(sg({ targetDescription: "   " }));
  ok("silent on whitespace-only description", spaces.offer === false && spaces.reason.includes("description"));

  const missing = evaluateGoalReview(sg({ targetDescription: undefined }));
  ok("silent on missing description", missing.offer === false && missing.reason.includes("description"));
}

// ── 6. Horizon ──────────────────────────────────────────────────────
section("6. Horizon — 14 days is too close to be useful");
{
  ok("silent at 14 days out",
     evaluateGoalReview(sg({ targetDate: daysAhead(14) })).offer === false);
  ok("silent at 3 days out",
     evaluateGoalReview(sg({ targetDate: daysAhead(3) })).offer === false);
  ok("silent on a date already past",
     evaluateGoalReview(sg({ targetDate: daysAgo(5) })).offer === false);
  ok("fires at 15 days out",
     evaluateGoalReview(sg({ targetDate: daysAhead(15) })).offer === true);
}

// ── 7. Maturity — the guard IS the grace window ─────────────────────
section("7. Maturity guard at 28 days, not 21");
{
  ok("silent at 27 days mature",
     evaluateGoalReview(sg({ targetSetAt: daysAgo(27), setAt: daysAgo(27) })).offer === false);
  ok("fires at 28 days mature",
     evaluateGoalReview(sg({ targetSetAt: daysAgo(28), setAt: daysAgo(60) })).offer === true);

  // targetSetAt wins over setAt where both exist. An old setAt must not
  // mature a target named last week -- that is the whole reason the
  // field was added.
  const recent = evaluateGoalReview(sg({ targetSetAt: daysAgo(5), setAt: daysAgo(200) }));
  ok("a target named 5 days ago is silent despite an old setAt",
     recent.offer === false && recent.reason.includes("mature"), `reason=${recent.reason}`);

  // Fallback for installs predating R2-a.
  const fallback = evaluateGoalReview(sg({ targetSetAt: null, setAt: daysAgo(60) }));
  ok("falls back to setAt where targetSetAt is absent", fallback.offer === true);
}

// ── 8. Both date homes, both formats, one answer ────────────────────
section("8. Both targetDate homes, both formats, same result");
{
  // today.js writes ISO. goal-setup.js writes a bare YYYY-MM-DD.
  const bare = "2026-09-20";                       // 30 days out
  const iso  = "2026-09-20T00:00:00.000Z";

  const fromLegacy = evaluateGoalReview(sg({ targetDate: null }));
  ok("silent when no date exists in either home", fromLegacy.offer === false);

  const legacy = evaluateGoalReview({ ...baseContext(), legacyTargetDate: bare,
    strategicGoal: { ...baseContext().strategicGoal, targetDate: null } });
  ok("reads a bare YYYY-MM-DD from the legacy top-level home", legacy.offer === true,
     `reason=${legacy.reason}`);

  const structured = evaluateGoalReview(sg({ targetDate: iso }));
  ok("reads an ISO string from strategicGoal", structured.offer === true);

  ok("both formats resolve to the same day count",
     legacy.daysUntilTarget === structured.daysUntilTarget,
     `${legacy.daysUntilTarget} vs ${structured.daysUntilTarget}`);

  // strategicGoal wins where both are present, matching my-programme.js.
  const both = evaluateGoalReview({ ...baseContext(), legacyTargetDate: "2026-12-25" });
  ok("strategicGoal wins over the legacy home", both.daysUntilTarget === 30,
     `got ${both.daysUntilTarget}`);
}

// ── 9. Rate arithmetic, and partials ────────────────────────────────
section("9. Rate arithmetic — partials count here, and only here");
{
  // 3/week over 28 days = 12 expected. 60% of 12 is 7.2.
  ok("silent at 8 of 12 (67%)", evaluateGoalReview(baseContext({ activityLog: logWith(8) })).offer === false);
  ok("fires at 7 of 12 (58%)",  evaluateGoalReview(baseContext({ activityLog: logWith(7) })).offer === true);

  // Partials count. Every other consumer in the codebase excludes them
  // (community-impact.js:94, annual-reflection.js:41, store.js:2188).
  // This is a deliberate divergence, and the principle is: count
  // CONSERVATIVELY where the number rewards, GENEROUSLY where the number
  // judges. Excluding a partial here would tell somebody who started
  // three sessions that they managed one and a half.
  const withPartials = evaluateGoalReview(baseContext({
    activityLog: [...logWith(5), ...logWith(3, { status: "partial" })]
  }));
  ok("partial sessions count toward the rate", withPartials.offer === false,
     `8 total should clear the line; reason=${withPartials.reason}`);

  // Entries outside the window must not count.
  const stale = evaluateGoalReview(baseContext({
    activityLog: [{ type: "workout", status: "completed", completedAt: daysAgo(40) }]
  }));
  ok("entries older than 28 days are excluded", stale.offer === true);

  ok("trailingCompletionRate is exported and returns a number",
     typeof trailingCompletionRate(logWith(6), NOW, 28, 3) === "number");
}

// ── 10. Throttle ────────────────────────────────────────────────────
section("10. Throttle at 28 days, and suppression never touches it");
{
  ok("silent at 27 days since the last offer",
     evaluateGoalReview(sg({ review: { lastOfferedAt: daysAgo(27), outcomes: [] } })).offer === false);
  ok("fires at 28 days since the last offer",
     evaluateGoalReview(sg({ review: { lastOfferedAt: daysAgo(28), outcomes: [] } })).offer === true);

  // THE PROPERTY THAT MAKES OVER-SUPPRESSION SAFE. A suppressed offer
  // must not consume the throttle, or a fortnight of low mood would
  // silently spend the conversation.
  const suppressed = evaluateGoalReview(baseContext({ burnoutLevel: "high" }));
  ok("a suppressed evaluation does not report an offer to record",
     suppressed.offer === false && suppressed.recordOffer === false);
  const offered = evaluateGoalReview(baseContext());
  ok("a real offer does report one to record", offered.recordOffer === true);
}

// ── 11. Tier ────────────────────────────────────────────────────────
section("11. Free never reaches the offer");
{
  const free = evaluateGoalReview(baseContext({ isPremium: false }));
  ok("silent on free", free.offer === false && free.reason.includes("tier"));

  // Downgrade must not destroy the record.
  const outcomes = [{ at: daysAgo(40), choice: "moved", previousDate: daysAhead(5), newDate: daysAhead(60) }];
  const downgraded = evaluateGoalReview(sg({ review: { lastOfferedAt: daysAgo(40), outcomes } }));
  ok("evaluation never mutates the outcomes it was given",
     downgraded.offer === true && outcomes.length === 1);
}

// ── 12. Fail safe ───────────────────────────────────────────────────
section("12. Unknown is treated as unsafe, not as fine");
{
  // A careless caller in R1-b must get SILENCE, not a wrong offer. Every
  // suppression input that is missing or undefined suppresses.
  const cases = [
    ["painLevel undefined",    { painLevel: undefined }],
    ["burnoutLevel undefined", { burnoutLevel: undefined }],
    ["mood undefined",         { mood: undefined }],
    ["energy undefined",       { energy: undefined }],
    ["careOpeningToday undefined", { careOpeningToday: undefined }],
    ["isPremium undefined",    { isPremium: undefined }]
  ];
  for (const [label, override] of cases) {
    const r = evaluateGoalReview(baseContext(override));
    ok(`silent — ${label}`, r.offer === false, `reason=${r.reason}`);
  }

  ok("silent on an empty context", evaluateGoalReview({}).offer === false);
  ok("silent on null", evaluateGoalReview(null).offer === false);
  ok("does not throw on null", (() => { try { evaluateGoalReview(null); return true; } catch { return false; } })());
}

// ── 13. Helpers ─────────────────────────────────────────────────────
section("13. Day-key helper — the two formats must not drift");
{
  ok("bare YYYY-MM-DD passes through", toDayKey("2026-09-20") === "2026-09-20");
  ok("ISO string slices to the same key", toDayKey("2026-09-20T00:00:00.000Z") === "2026-09-20");
  ok("null returns null", toDayKey(null) === null);
  ok("nonsense returns null", toDayKey("not a date") === null);
  ok("daysBetween counts forward", daysBetween("2026-08-21", "2026-09-20") === 30);
  ok("daysBetween counts backward", daysBetween("2026-09-20", "2026-08-21") === -30);
  ok("daysBetween across a DST boundary is exact",
     daysBetween("2026-10-20", "2026-11-20") === 31);
}

// ── Result ──────────────────────────────────────────────────────────
console.log(`\n${"-".repeat(60)}`);
if (failures === 0) {
  console.log(`verify-hard1: ${checks} checks, all green.`);
  process.exit(0);
} else {
  console.log(`verify-hard1: ${failures} of ${checks} checks RED.`);
  process.exit(1);
}
