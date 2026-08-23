/**
 * js/data/weight-targets.js
 * 22 Aug 2026 v2
 *
 * v2 - BANDS TIGHTENED, and the numbers now carry citations instead of
 *   a pending sign-off.
 *
 *   The refusal moves from 4 lb/week to 3. Published clinical trial
 *   protocols use >3 lb/week sustained as the point at which a
 *   SUPERVISED programme intervenes -- monitoring weight at every group
 *   session, asking participants to slow or stop. This app supervises
 *   nothing: no bloods, no clinician, no weekly review. Refusing where a
 *   monitored programme would step in is the only defensible line for
 *   something that cannot monitor.
 *
 *   The 3-4 lb "capped" band and CAP_WEEKS are GONE. CAP_WEEKS was a
 *   number nobody could source. What replaces it is one line meaning the
 *   same thing whether planned or observed: 3 lb a week.
 *
 *   No clinical sign-off is pending and none is needed. A refusal is not
 *   a clinical recommendation -- declining to help is not practising
 *   medicine, and every claim not made is one that cannot be wrong.
 *   MyFitnessPal permits effectively unlimited targets behind a 1,200
 *   kcal floor. Asking permission to be stricter than that was asking
 *   the wrong question, and it would have delayed a safety feature while
 *   waiting for approval to be careful.
 *
 * 22 Aug 2026 v1
 *
 * WEIGHT-1a — weight targets: units, bands, validation.
 *
 * Authority: alongside_weight1_build_scope_22aug2026_v1.md v3.
 * Decisions: alongside_weight_targets_audit_22aug2026_v1.md v2 §9.
 *
 * ── WHY THIS FEATURE EXISTS AT ALL ──────────────────────────────────
 *
 * An audit on 22 Aug found weight targets were unbuildable through four
 * independent failures and recommended retiring them. Graeme rejected
 * that: "someone might want this and to deny them seems wrong."
 *
 * He was right. The failures were accidents, not decisions, and reading
 * them as intent dressed the codebase's accidental state as philosophy.
 * Refusing to let an adult record their own goal is paternalism, and
 * this product already treats self-direction as an accessibility feature
 * rather than a risk.
 *
 * So: a feature, OFF by default, Plan-only, with real safeguards.
 *
 * ── PURE MODULE. NO IMPORTS. ────────────────────────────────────────
 *
 * Same reasoning as goal-review.js. The gate must EXECUTE, and a safety
 * threshold guarded only by a source-text gate is not guarded --
 * verify-bias1 was green while the code it watched threw on line three.
 *
 * Everything here is a function of its arguments. The caller does the
 * wiring in WEIGHT-1b.
 */

/* ────────────────────────────────────────────────────────────────────
 * THE SAFETY BANDS — sourced, not provisional.
 *
 * Every assertion in tools/verify-weight1.mjs references these
 * constants. NO GATE HARDCODES A NUMBER, so a future recalibration
 * changes values here and nothing else moves.
 *
 * Stated in kg/week, derived once from the pound figures.
 *
 * SOURCES
 *
 *   NHS / NICE CG189 — 0.5-1 kg (about 1-2 lb) per week, on roughly a
 *   600 kcal daily deficit. So 2 lb/week is the TOP of the recommended
 *   range, not beyond it.
 *
 *   Published behavioural weight-loss trial protocols (e.g. NCT03704064,
 *   NCT05635019, NCT03779048) treat loss above 3 lb/week sustained for
 *   3-4 consecutive weeks as a gallstone risk requiring intervention:
 *   weight monitored at every group session, participants asked to slow
 *   or stop. Gallstone risk rises above roughly 1.5 kg (3.3 lb) per
 *   week through changes in bile composition.
 *
 *   Above 2 lb/week, lean tissue and bone loss become the concern
 *   alongside fat loss.
 *
 * WHY THE LINE IS 3 AND NOT 4
 *
 *   3 lb/week is where a SUPERVISED programme intervenes. This app
 *   supervises nothing -- no bloods, no clinician, no weekly review. So
 *   it refuses at the point a monitored programme would step in, because
 *   it has none of the monitoring that makes going further survivable.
 *
 *   The same number governs intent and reality. A target implying 3 lb a
 *   week is declined; observed loss at 3 lb a week for three consecutive
 *   weeks is raised. One line, both directions.
 * ──────────────────────────────────────────────────────────────────── */

/** 2 lb/wk. Top of NHS guidance. Accept silently. */
export const RATE_SILENT_MAX = 0.907;

/**
 * 3 lb/wk. The line, in both directions.
 *
 * At or above this a target is declined and observed loss is raised.
 * Below it, above RATE_SILENT_MAX, the target is accepted with one
 * gentle note and no obstruction.
 */
export const RATE_REFUSE = 1.361;

/**
 * Consecutive weeks of observed loss at or above RATE_REFUSE before the
 * coach raises it. Matches the 3-4 week window the trial protocols use,
 * and correctly ignores the initial drop, which is substantially water,
 * catching only a sustained pattern.
 */
export const OBSERVED_WEEKS = 3;

/* ────────────────────────────────────────────────────────────────────
 * NOT PROVISIONAL. Product philosophy, not clinical calibration.
 * These do not move even if the clinician has no view on them.
 *
 *   1. The app NEVER prompts a weigh-in. Logging is passive and
 *      user-initiated. No reminders, no badges, no empty state that
 *      reads as an unfinished task.
 *
 *   2. The hard conversation NEVER does arithmetic on the body.
 *      SET-TIME (planning) may compute and propose a DATE -- the person
 *      is deciding what to aim at and needs to know what is feasible.
 *      REVIEW-TIME (R1, judgement) may never state a rate, a
 *      projection, a shortfall or a weight. A number there is a verdict
 *      on the person. The rule protects the conversation where a number
 *      becomes a verdict, not the one where it is a plan.
 *
 *   3. The refusal declines the FIELD, not the person. It must never
 *      read as rejecting the goal or whoever is holding it.
 * ──────────────────────────────────────────────────────────────────── */

const KG_PER_LB = 0.45359237;
const LB_PER_STONE = 14;

/* ────────────────────────────────────────────────────────────────────
 * Units
 *
 * CANONICAL KILOGRAMS, ALWAYS. weightUnit is a display preference and
 * never affects what is stored.
 *
 * There is no other conversion anywhere in this codebase -- searched,
 * not assumed. If a stored value were sometimes 80 and sometimes 176
 * depending on a preference, any consumer that forgot to convert would
 * compare the wrong quantities, and the refusal would silently stop
 * working. Being wrong by a factor of 2.2 is unacceptable HERE in a way
 * it is not elsewhere.
 * ──────────────────────────────────────────────────────────────────── */

/**
 * @param {number|{st:number, lb:number}} value
 * @param {'kg'|'lb'|'st'} unit
 * @returns {number|null} kilograms, or null if the input is unusable
 */
export function toKg(value, unit) {
  if (unit === "st") {
    if (!value || typeof value !== "object") return null;
    const st = Number(value.st), lb = Number(value.lb ?? 0);
    if (!Number.isFinite(st) || !Number.isFinite(lb)) return null;
    return (st * LB_PER_STONE + lb) * KG_PER_LB;
  }
  const n = Number(value);
  if (value === null || value === "" || !Number.isFinite(n)) return null;
  if (unit === "kg") return n;
  if (unit === "lb") return n * KG_PER_LB;
  return null;
}

/**
 * @returns {number|{st:number, lb:number}|null}
 */
export function fromKg(kg, unit) {
  if (!Number.isFinite(Number(kg))) return null;
  const n = Number(kg);
  if (unit === "kg") return n;
  if (unit === "lb") return n / KG_PER_LB;
  if (unit === "st") {
    const totalLb = n / KG_PER_LB;
    let st = Math.floor(totalLb / LB_PER_STONE);
    let lb = Math.round(totalLb - st * LB_PER_STONE);
    // Rounding can push pounds to a full stone. Carry it, or the
    // display shows "13 st 14 lb", which is not a weight anyone says.
    if (lb >= LB_PER_STONE) { st += 1; lb -= LB_PER_STONE; }
    return { st, lb };
  }
  return null;
}

/** Display string. Stone renders as a composite, never a decimal. */
export function formatWeight(kg, unit) {
  const v = fromKg(kg, unit);
  if (v === null) return "";
  if (unit === "st") return v.lb === 0 ? `${v.st} st` : `${v.st} st ${v.lb} lb`;
  return `${Math.round(v * 10) / 10} ${unit}`;
}

/* ────────────────────────────────────────────────────────────────────
 * Bands
 * ──────────────────────────────────────────────────────────────────── */

/**
 * @param {number} kgPerWeek
 * @returns {{band: string, store: boolean, timeLimited: boolean}}
 */
export function bandFor(kgPerWeek) {
  const r = Number(kgPerWeek);
  if (!Number.isFinite(r) || r <= 0) return { band: "silent", store: true, timeLimited: false };
  if (r <= RATE_SILENT_MAX) return { band: "silent", store: true,  timeLimited: false };
  if (r <  RATE_REFUSE)     return { band: "note",   store: true,  timeLimited: false };
  return { band: "refuse", store: false, timeLimited: false };
}

/* ────────────────────────────────────────────────────────────────────
 * Set-time validation
 * ──────────────────────────────────────────────────────────────────── */

function addDays(dayKey, days) {
  const [y, m, d] = String(dayKey).split("-").map(Number);
  const t = Date.UTC(y, m - 1, d, 12) + days * 86400000;
  const dt = new Date(t);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

/**
 * A date by which the same target is reachable at a pace the app can
 * support. Returns a DATE, never a weight or a rate -- see rule 2.
 *
 * @returns {string|null} ISO day key, or null where there is nothing to lose
 */
export function suggestSustainableDate({ currentKg, targetKg, from }) {
  const loss = Number(currentKg) - Number(targetKg);
  if (!Number.isFinite(loss) || loss <= 0) return null;
  const weeks = Math.ceil(loss / RATE_SILENT_MAX);
  return addDays(from, weeks * 7);
}

/**
 * Check a target at the moment it is set.
 *
 * @returns {{accepted: boolean, band: string|null, message: string,
 *            suggestedDate: string|null}}
 */
export function validateWeightTarget({ currentKg, targetKg, weeks, now, trackingEnabled = true }) {
  if (trackingEnabled !== true) {
    return { accepted: false, band: null, message: "", suggestedDate: null };
  }

  const loss = Number(currentKg) - Number(targetKg);
  const w = Number(weeks);
  if (!Number.isFinite(loss) || !Number.isFinite(w) || w <= 0) {
    return { accepted: false, band: null, message: "", suggestedDate: null };
  }
  if (loss <= 0) {
    return { accepted: true, band: "silent", message: "", suggestedDate: null };
  }

  const rate = loss / w;
  const { band } = bandFor(rate);
  const suggestedDate = suggestSustainableDate({ currentKg, targetKg, from: now });

  // Rule 2 governs every string below: a DATE may appear, because this
  // is planning. A rate, a projection or a weight may not.
  if (band === "refuse") {
    return {
      accepted: false, band, suggestedDate,
      message: "That's faster than I can plan for safely — not a judgement on where you want " +
               "to get to, but at that pace I'd be guessing, and it's a conversation for a GP " +
               "or a registered dietitian. If it helps, I could aim for the same target further " +
               "out, at a pace I can support. Or leave it open-ended, and we just get moving."
    };
  }

  if (band === "note") {
    return {
      accepted: true, band, suggestedDate,
      message: "That's an ambitious one. I'll work with it — just so you know I've noticed."
    };
  }

  return { accepted: true, band, message: "", suggestedDate: null };
}

/**
 * Has observed loss run at or above RATE_REFUSE for OBSERVED_WEEKS
 * consecutive weeks?
 *
 * @param {number[]} weeklyRatesKg most recent last
 */
export function observedRateBreach(weeklyRatesKg) {
  if (!Array.isArray(weeklyRatesKg) || weeklyRatesKg.length < OBSERVED_WEEKS) return false;
  let run = 0;
  for (const r of weeklyRatesKg) {
    run = (Number(r) >= RATE_REFUSE) ? run + 1 : 0;
    if (run >= OBSERVED_WEEKS) return true;
  }
  return false;
}
