/**
 * js/data/weight-targets.js
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
 * PROVISIONAL — awaiting clinical sign-off.
 *
 * Changing these numbers must not require touching logic or gates.
 * Every assertion in tools/verify-weight1.mjs references these
 * constants; NO GATE HARDCODES A NUMBER. One clinical email should
 * change values here and nothing else.
 *
 * Stated in kg/week, derived once from the agreed pound figures.
 * NHS guidance is 0.5-1 kg (about 1-2 lb) per week; NICE CG189 centres
 * on roughly a 600 kcal daily deficit. So 2 lb/week is the TOP of the
 * recommended range, not beyond it.
 * ──────────────────────────────────────────────────────────────────── */

/** 2 lb/wk. Top of NHS guidance. Accept silently. */
export const RATE_SILENT_MAX = 0.907;

/** 3 lb/wk. Above guidance. Accept with one gentle note below this. */
export const RATE_NOTE_MAX = 1.361;

/** 4 lb/wk. Decline to store. Clinical support, not this app. */
export const RATE_REFUSE = 1.814;

/**
 * Weeks a target in the 3-4 lb/wk band may run.
 *
 * Graeme proposed 3 and asked for it to be checked. The only time limit
 * in UK guidance is 12 weeks -- and that is the MAXIMUM for
 * very-low-energy diets UNDER SPECIALIST SUPERVISION, nutritionally
 * complete, with ongoing clinical support. This app has none of that, so
 * 12 weeks is the ceiling WITH a clinician and 3 weeks unsupervised is
 * conservative against it.
 */
export const CAP_WEEKS = 3;

/**
 * Consecutive weeks of observed loss at or above RATE_NOTE_MAX before
 * the coach raises it. Three also correctly ignores the initial drop,
 * which is substantially water, and catches only a sustained pattern.
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
  if (r <  RATE_NOTE_MAX)   return { band: "note",   store: true,  timeLimited: false };
  if (r <  RATE_REFUSE)     return { band: "capped", store: true,  timeLimited: true  };
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
  const { band, store, timeLimited } = bandFor(rate);
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

  if (band === "capped" && timeLimited && w > CAP_WEEKS) {
    return {
      accepted: false, band, suggestedDate,
      message: "That's a demanding pace to hold for this long. I'd rather give it more room — " +
               "I could aim for the same target further out, and we'd both be on surer ground. " +
               "Or keep the date and we'll see how it goes."
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
 * Has observed loss run at or above RATE_NOTE_MAX for OBSERVED_WEEKS
 * consecutive weeks?
 *
 * @param {number[]} weeklyRatesKg most recent last
 */
export function observedRateBreach(weeklyRatesKg) {
  if (!Array.isArray(weeklyRatesKg) || weeklyRatesKg.length < OBSERVED_WEEKS) return false;
  let run = 0;
  for (const r of weeklyRatesKg) {
    run = (Number(r) >= RATE_NOTE_MAX) ? run + 1 : 0;
    if (run >= OBSERVED_WEEKS) return true;
  }
  return false;
}
