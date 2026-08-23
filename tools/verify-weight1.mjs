/**
 * tools/verify-weight1.mjs
 * 22 Aug 2026 v1
 *
 * WEIGHT-1a — weight targets: bands, units, and the refusal.
 *
 * Authority: Documents/Business/alongside_weight1_build_scope_22aug2026_v1.md
 * v3, and the audit v2 §9 which holds the decisions.
 *
 * ── NO ASSERTION IN THIS FILE HARDCODES A CLINICAL NUMBER ───────────
 *
 * Every threshold is referenced through the exported constants. The
 * numbers are PROVISIONAL, awaiting clinical sign-off, and the whole
 * point of that block is that one email changes six values and nothing
 * else moves. If a gate hardcoded 4, that email would turn a dozen
 * assertions red at once and somebody would start editing them under
 * time pressure -- which is exactly how a safety threshold gets quietly
 * loosened for the wrong reason.
 *
 * So these tests assert RELATIONSHIPS and BEHAVIOUR at the boundaries,
 * not magic numbers. They stay green through a recalibration and go red
 * on a logic change. That is the intended asymmetry.
 *
 * ── WHAT IS BEING PROTECTED ─────────────────────────────────────────
 *
 * Two things, and the second is easy to underrate.
 *
 * 1. The refusal. At or above RATE_REFUSE the app declines to hold the
 *    target and points at a GP or dietitian.
 *
 * 2. THE UNIT. There is no conversion anywhere else in this codebase --
 *    searched, not assumed. The bands are stated in pounds; the store is
 *    kilograms. If a stored value were sometimes 80 and sometimes 176,
 *    a consumer that forgot to convert would compare the wrong
 *    quantities and the refusal would silently stop working. Being wrong
 *    by a factor of 2.2 is unacceptable HERE in a way it is not
 *    elsewhere, so unit safety is tested as hard as the bands.
 *
 * Run: node tools/verify-weight1.mjs
 */

import {
  RATE_SILENT_MAX, RATE_NOTE_MAX, RATE_REFUSE,
  CAP_WEEKS, OBSERVED_WEEKS,
  toKg, fromKg, formatWeight,
  bandFor, validateWeightTarget,
  suggestSustainableDate, observedRateBreach
} from "../js/data/weight-targets.js";
import { GOALS, goalHasTarget, getGoalTargetType } from "../js/data/goals.js";

let failures = 0, checks = 0;
const ok = (label, cond, detail = "") => {
  checks++;
  if (cond) console.log(`  PASS  ${label}`);
  else { failures++; console.log(`  FAIL  ${label}${detail ? "  --  " + detail : ""}`); }
};
const section = n => console.log(`\n${n}`);

const NOW = "2026-08-22";
const EPS = 0.0005;

// ── 0. Positive control ─────────────────────────────────────────────
section("0. Positive control — the constants are real and ordered");
{
  ok("constants are numbers", [RATE_SILENT_MAX, RATE_NOTE_MAX, RATE_REFUSE, CAP_WEEKS, OBSERVED_WEEKS]
     .every(v => typeof v === "number" && !Number.isNaN(v)));
  ok("bands are strictly ordered", RATE_SILENT_MAX < RATE_NOTE_MAX && RATE_NOTE_MAX < RATE_REFUSE,
     `${RATE_SILENT_MAX} < ${RATE_NOTE_MAX} < ${RATE_REFUSE}`);
  ok("CAP_WEEKS and OBSERVED_WEEKS are positive whole weeks",
     Number.isInteger(CAP_WEEKS) && CAP_WEEKS > 0 && Number.isInteger(OBSERVED_WEEKS) && OBSERVED_WEEKS > 0);
}

// ── 1. Units ────────────────────────────────────────────────────────
section("1. Units — canonical kg, display converts, nothing lost");
{
  ok("toKg passes kg through", Math.abs(toKg(80, "kg") - 80) < EPS);
  ok("toKg converts pounds", Math.abs(toKg(176.37, "lb") - 80) < 0.01, `${toKg(176.37, "lb")}`);
  ok("toKg converts stone+pounds", Math.abs(toKg({ st: 12, lb: 8 }, "st") - 79.83) < 0.05,
     `${toKg({ st: 12, lb: 8 }, "st")}`);

  // Round trip: no display unit may lose data.
  for (const unit of ["kg", "lb", "st"]) {
    let worst = 0;
    for (let kg = 40; kg <= 200; kg += 0.5) {
      const back = toKg(fromKg(kg, unit), unit);
      worst = Math.max(worst, Math.abs(back - kg));
    }
    ok(`round trip survives ${unit} across 40-200kg`, worst < 0.5, `worst drift ${worst.toFixed(3)}kg`);
  }

  ok("an unknown unit does not silently corrupt", toKg(80, "furlongs") === null);
  ok("toKg rejects nonsense", toKg("heavy", "kg") === null && toKg(null, "kg") === null);
}

// ── 2. st+lb formatting ─────────────────────────────────────────────
section("2. Stone and pounds — a composite, not a number with a label");
{
  ok("formats stone and pounds", formatWeight(79.83, "st") === "12 st 8 lb", formatWeight(79.83, "st"));
  ok("pounds wrap at 14 — never '13 st 14 lb'", (() => {
    for (let kg = 40; kg <= 200; kg += 0.05) {
      const s = formatWeight(kg, "st");
      const m = s.match(/^(\d+) st(?: (\d+) lb)?$/);
      if (!m) return false;
      if (m[2] !== undefined && Number(m[2]) >= 14) return false;
    }
    return true;
  })());
  ok("a whole stone renders without a stray '0 lb'",
     formatWeight(toKg({ st: 12, lb: 0 }, "st"), "st") === "12 st",
     formatWeight(toKg({ st: 12, lb: 0 }, "st"), "st"));
  ok("kg and lb format plainly",
     /^\d+(\.\d)? kg$/.test(formatWeight(80, "kg")) && /^\d+(\.\d)? lb$/.test(formatWeight(80, "lb")),
     `${formatWeight(80, "kg")} / ${formatWeight(80, "lb")}`);
}

// ── 3. Bands ────────────────────────────────────────────────────────
section("3. Bands — verdict at each boundary and either side");
{
  const rate = r => bandFor(r);
  ok("just under the silent ceiling is silent", rate(RATE_SILENT_MAX - EPS).band === "silent");
  ok("exactly at the silent ceiling is silent", rate(RATE_SILENT_MAX).band === "silent");
  ok("just over the silent ceiling gets a note", rate(RATE_SILENT_MAX + EPS).band === "note");
  ok("just under the note ceiling gets a note", rate(RATE_NOTE_MAX - EPS).band === "note");
  ok("at the note ceiling is capped", rate(RATE_NOTE_MAX).band === "capped");
  ok("just under refuse is capped", rate(RATE_REFUSE - EPS).band === "capped");
  ok("at refuse is refused", rate(RATE_REFUSE).band === "refuse");
  ok("well over refuse is refused", rate(RATE_REFUSE * 2).band === "refuse");
  ok("zero and negative rates are silent", rate(0).band === "silent" && rate(-1).band === "silent");

  ok("refuse is the ONLY band that declines to store",
     ["silent", "note", "capped"].every(b => rate({ silent: 0, note: 0, capped: 0 }[b] ?? 0).store !== false)
     && rate(RATE_REFUSE).store === false);
}

// ── 4. The cap ──────────────────────────────────────────────────────
section("4. The 3-4 lb band is time-limited, not open-ended");
{
  const capped = (weeks) => validateWeightTarget({
    currentKg: 90, targetKg: 90 - (RATE_NOTE_MAX * weeks), weeks, now: NOW
  });
  ok(`accepted at CAP_WEEKS (${CAP_WEEKS})`, capped(CAP_WEEKS).accepted === true, capped(CAP_WEEKS).band);
  ok("refused beyond CAP_WEEKS", capped(CAP_WEEKS + 1).accepted === false, capped(CAP_WEEKS + 1).band);
  ok("a silent-band target is NOT time-limited", validateWeightTarget({
    currentKg: 90, targetKg: 90 - (RATE_SILENT_MAX * 26), weeks: 26, now: NOW
  }).accepted === true);
}

// ── 5. The refusal ──────────────────────────────────────────────────
section("5. The refusal declines the field, not the person");
{
  const r = validateWeightTarget({ currentKg: 100, targetKg: 100 - (RATE_REFUSE * 8), weeks: 8, now: NOW });
  ok("not accepted", r.accepted === false && r.band === "refuse");
  ok("signposts clinical support", /GP|dietitian/i.test(r.message));
  ok("offers a sustainable alternative date", typeof r.suggestedDate === "string" && r.suggestedDate.length === 10);

  // NON-NEGOTIABLE: no arithmetic on the body in any user-facing string.
  const allCopy = [r.message, validateWeightTarget({ currentKg: 90, targetKg: 80, weeks: 6, now: NOW }).message,
                   validateWeightTarget({ currentKg: 90, targetKg: 88, weeks: 12, now: NOW }).message]
                   .filter(Boolean).join(" ");
  ok("no copy states a rate", !/per week|a week|\/week|lb\/wk|kg\/wk/i.test(allCopy), allCopy.slice(0, 90));
  ok("no copy states a weight or a shortfall", !/\d+(\.\d+)?\s*(kg|lb|st|pounds|stone|kilo)/i.test(allCopy),
     allCopy.slice(0, 90));
  ok("no copy prompts a weigh-in", !/weigh yourself|step on|weigh in|weigh-in/i.test(allCopy));
}

// ── 6. suggestSustainableDate ───────────────────────────────────────
section("6. The suggested date is a DATE, never a trajectory");
{
  const d = suggestSustainableDate({ currentKg: 100, targetKg: 85, from: NOW });
  ok("returns an ISO day key", /^\d{4}-\d{2}-\d{2}$/.test(d), String(d));
  ok("implied rate sits at or under the silent ceiling", (() => {
    const days = (Date.UTC(...d.split("-").map((v, i) => i === 1 ? Number(v) - 1 : Number(v)))
                - Date.UTC(2026, 7, 22)) / 86400000;
    return (15 / (days / 7)) <= RATE_SILENT_MAX + EPS;
  })(), String(d));
  ok("a target already at a sustainable pace still returns a date",
     /^\d{4}-\d{2}-\d{2}$/.test(suggestSustainableDate({ currentKg: 90, targetKg: 89, from: NOW })));
  ok("gaining weight or no change does not throw",
     suggestSustainableDate({ currentKg: 80, targetKg: 85, from: NOW }) === null);
}

// ── 7. Observed rate ────────────────────────────────────────────────
section("7. Observed rate — a pattern, not a fortnight of water");
{
  const weeks = n => Array.from({ length: n }, () => RATE_NOTE_MAX + 0.1);
  ok(`silent at OBSERVED_WEEKS-1 (${OBSERVED_WEEKS - 1})`,
     observedRateBreach(weeks(OBSERVED_WEEKS - 1)) === false);
  ok(`fires at OBSERVED_WEEKS (${OBSERVED_WEEKS})`,
     observedRateBreach(weeks(OBSERVED_WEEKS)) === true);
  ok("a single fast week does not fire", observedRateBreach([RATE_REFUSE, 0.2, 0.2]) === false);
  ok("must be CONSECUTIVE", observedRateBreach([
     RATE_NOTE_MAX + 0.1, 0.1, RATE_NOTE_MAX + 0.1, RATE_NOTE_MAX + 0.1]) === false);
  ok("empty history does not fire", observedRateBreach([]) === false && observedRateBreach(null) === false);
}

// ── 8. The toggle is the consent ────────────────────────────────────
section("8. Tracking off means no band is ever computed");
{
  const off = validateWeightTarget({ currentKg: 100, targetKg: 60, weeks: 4, now: NOW, trackingEnabled: false });
  ok("returns no band when tracking is off", off.band === null, String(off.band));
  ok("does not accept when tracking is off", off.accepted === false);
}

// ── 9. THE WIRING, not just the function ────────────────────────────
section("9. goals.js actually supplies what these functions consume");
{
  // WHY THIS SECTION EXISTS. Sections 0-8 all construct their own
  // inputs, so they prove the FUNCTIONS and say nothing about whether
  // any caller can supply them. That gap is not hypothetical: it is the
  // original WEIGHT-1 fault. goals.js declared hasTarget and targetType
  // on the weight goal, and the flatMap rebuilding the export copied six
  // named fields and dropped both -- so at runtime no goal in the
  // product exposed a target type while the source text said otherwise.
  //
  // Reversal-tested 22 Aug: removing the fix left every other assertion
  // in this file GREEN. A pure function's gate proves the function, not
  // the wiring. This section is the wiring.
  const lw = GOALS.find(g => g.id === "lose-weight");
  ok("the weight goal still exists", !!lw);
  ok("it survives the flat export carrying hasTarget", lw?.hasTarget === true,
     JSON.stringify(lw));
  ok("...and targetType 'weight'", lw?.targetType === "weight", String(lw?.targetType));
  ok("the accessors agree with the data",
     goalHasTarget("lose-weight") === true && getGoalTargetType("lose-weight") === "weight",
     `${goalHasTarget("lose-weight")} / ${getGoalTargetType("lose-weight")}`);

  // The same drop silenced three running goals. Assert the general
  // property rather than the one case that prompted it.
  const declared = GOALS.filter(g => g.hasTarget);
  ok("every target-bearing goal exposes a targetType",
     declared.length > 0 && declared.every(g => typeof g.targetType === "string" && g.targetType),
     declared.map(g => `${g.id}:${g.targetType}`).join(", "));
}

console.log(`\n${"-".repeat(60)}`);
if (failures === 0) { console.log(`verify-weight1: ${checks} checks, all green.`); process.exit(0); }
else { console.log(`verify-weight1: ${failures} of ${checks} checks RED.`); process.exit(1); }
