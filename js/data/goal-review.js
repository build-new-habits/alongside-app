/**
 * js/data/goal-review.js
 * 22 Aug 2026 v2
 *   WEIGHT-1a. The weight exclusion becomes CONDITIONAL on the person
 *   having turned weight tracking on. Turning it on IS the consent:
 *   telling the coach is the "I want you to do something with this"
 *   moment. A coach that holds the target but refuses to speak to it is
 *   paternalism one layer down.
 *
 *   Unknown still suppresses -- ctx.weightTrackingEnabled must be an
 *   explicit true. A caller that forgets the field gets silence.
 *
 *   NOTE for R1-b: rule 2 of weight-targets.js applies here in its
 *   STRICT form. This is review-time, which is judgement, so no rate,
 *   projection, shortfall or weight may appear in any string. Set-time
 *   may propose a date; this may not do arithmetic on the body at all.
 *
 * 21 Aug 2026 v1
 *
 * R1 — the hard conversation. Off-course detection.
 *
 * Authority: Documents/Business/alongside_r1_r2_amendment_21aug2026_v1.md
 * v1 (§3, §4), which supersedes the revenue architecture's §4.
 *
 * Graeme's line, and the reason this file exists: "if we're not on
 * course, the coach would tell us, and we readjust the plan." Until
 * today that capacity had zero lines of code -- strategicGoal.targetDate
 * was written, stored and displayed, and compared to progress by nothing
 * anywhere.
 *
 * ── THIS MODULE IS PURE. NO IMPORTS. ────────────────────────────────
 *
 * It reads nothing, writes nothing, and touches no DOM. Everything it
 * needs arrives in one context object, and the caller does the wiring.
 *
 * Two reasons, both load-bearing:
 *
 * 1. The gate must EXECUTE. verify-bias1.mjs was green while the code it
 *    guarded threw on the third line, because a source-text gate cannot
 *    tell a live call from a throwing one. A view full of innerHTML can
 *    only be asserted as "did this string appear", which is that same
 *    failure in a costume. A pure function can be called 60 times
 *    against constructed state, and is.
 *
 * 2. Suppression is the point. Keeping the safety logic in one readable
 *    place, with no I/O to hide behind, is how it stays auditable.
 *
 * ── UNKNOWN IS UNSAFE, NOT FINE ─────────────────────────────────────
 *
 * Every suppression input that is missing, undefined, or the wrong type
 * SUPPRESSES. A careless caller gets silence, never a wrong offer. This
 * is deliberate and the gate asserts it: the failure mode of a pure
 * function with a hand-assembled context is a forgotten field, and the
 * cost of that must land on the feature, never on the person.
 *
 * ── THE ASYMMETRY THAT SET EVERY THRESHOLD ──────────────────────────
 *
 * A suppressed offer leaves lastOfferedAt untouched and returns on the
 * next open, and the trigger already requires the date to be more than
 * 14 days out. So over-suppressing costs a conversation a fortnight
 * later, which is better coaching anyway. Under-suppressing means
 * telling somebody in a bad patch that their date is not going to work.
 * Those are not comparable, so every threshold sits on the cautious
 * side.
 *
 * WRITTEN BY NOTHING AND READ BY NOTHING THIS SESSION. R1-b is the
 * consumer. verify-hard1.mjs is the tracker until then.
 */

/* ────────────────────────────────────────────────────────────────────
 * Constants
 * ──────────────────────────────────────────────────────────────────── */

/** Trailing window for the completion rate, in days. */
export const WINDOW_DAYS = 28;

/** Below this share of the agreed weekly target, the date is at risk. */
export const RATE_FLOOR = 0.6;

/**
 * The coach does not judge a target until it has had a full month to
 * look at it. Raised from the spec's 21 so that the window is always
 * full: at three sessions a week a 21-day window expects nine sessions,
 * so the 60% line sits at 5.4 and one bad week flips it.
 *
 * This also IS the grace period after upgrade. Because a dated target
 * can only be recorded on the Plan (R2-a), targetSetAt can only start on
 * the Plan -- so this guard means R1 cannot be the first thing the paid
 * coach says. That property is structural, not a special case, and it is
 * why no tierChangedAt field was needed.
 */
export const MATURITY_DAYS = 28;

/** Nearer than this and moving the date is no longer a real option. */
export const HORIZON_DAYS = 14;

/** Days between offers. A suppressed offer does not consume this. */
export const THROTTLE_DAYS = 28;

/**
 * getZoneStatus() calls 7+ severe; getPainBand() calls 8+. Both are
 * live, both disagree, and session-builder.js surfaces that rather than
 * resolving it, pending clinical review.
 *
 * R1 takes the LOWER number, which is deliberately the opposite call
 * from SEVERE-1. There, over-triggering strips somebody's session, so
 * the higher number was right. Here it defers a sentence by a fortnight.
 *
 * THIS DOES NOT RESOLVE THE 7-vs-8 QUESTION. It picks a number for one
 * purpose. The clinical review still owns it.
 */
export const PAIN_SEVERE = 7;

/** Mood or energy at or below this. Anchored on the 1-10 label set,
 *  where 3 reads "Low", rather than a number picked for the purpose. */
export const BOTTOM_BAND = 3;

/** Burnout levels that suppress. Moderate is included knowingly: low
 *  rate and low energy correlate, so this may suppress a large share of
 *  true triggers. Somebody averaging 4/10 energy for five days is not
 *  the person to say this to. */
const BURNOUT_SUPPRESSING = ["moderate", "high"];
const BURNOUT_VALID = ["none", "low", "moderate", "high"];

/**
 * Weight-based targets are excluded entirely in v1.
 *
 * The only writer of a top-level targetDate is
 * goalSetupSaveWeightTargetDate() in onboarding/goal-setup.js -- a
 * weight-loss flow. So a real population carries a weight goal plus a
 * date, and R1 unamended would comment on their progress toward it, for
 * people this product exists for because fitness culture failed them.
 * goal-setup.js already treats weight dates as needing a warning: the
 * codebase had decided this class was different before R1 was specified.
 *
 * Handling rather than excluding needs its own design, not a copy
 * variant.
 */
const WEIGHT_GOAL_IDS = ["lose-weight", "weight-loss", "weight_loss"];
const WEIGHT_UNITS = ["kg", "kgs", "kilo", "kilos", "kilogram", "kilograms",
                      "lb", "lbs", "pound", "pounds", "st", "stone"];

/* ────────────────────────────────────────────────────────────────────
 * Date helpers
 *
 * ONE parser, because there are two storage formats and mixing them is
 * how the 14-day boundary flickers near midnight.
 *
 *   today.js:710               -> new Date(when).toISOString()  (ISO)
 *   onboarding/goal-setup.js:443 -> input.value                 (YYYY-MM-DD)
 *
 * A bare YYYY-MM-DD parses as UTC midnight. Converting that to local
 * time in a negative-offset timezone yields the PREVIOUS day, and the
 * ISO strings above were produced from exactly such bare values. So for
 * stored dates we slice the first ten characters and never parse at all.
 * Only `now` is read from clock components, and from LOCAL ones, because
 * "today" means the person's today.
 * ──────────────────────────────────────────────────────────────────── */

/**
 * Normalise a stored date, or a Date, to a YYYY-MM-DD day key.
 * @param {string|Date|null|undefined} value
 * @returns {string|null}
 */
export function toDayKey(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const month = Number(match[2]);
  const day   = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return value.slice(0, 10);
}

/**
 * Whole days from `fromKey` to `toKey`. Positive means `toKey` is later.
 * Both are anchored at UTC noon so no DST transition can shift the count.
 * @returns {number|null}
 */
export function daysBetween(fromKey, toKey) {
  const a = toDayKey(fromKey);
  const b = toDayKey(toKey);
  if (!a || !b) return null;
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ms = Date.UTC(by, bm - 1, bd, 12) - Date.UTC(ay, am - 1, ad, 12);
  return Math.round(ms / 86400000);
}

/* ────────────────────────────────────────────────────────────────────
 * Rate
 * ──────────────────────────────────────────────────────────────────── */

/**
 * Share of the agreed weekly target actually completed across the
 * trailing window.
 *
 * PARTIAL SESSIONS COUNT, and this is the only place in the codebase
 * where they do -- community-impact.js:94, annual-reflection.js:41 and
 * store.js:2188 all exclude them.
 *
 * The divergence is deliberate, and the principle is worth stating
 * because a future reader will otherwise read it as a bug: count
 * CONSERVATIVELY where the number rewards, and GENEROUSLY where the
 * number judges. Those surfaces celebrate, so over-counting there would
 * over-claim on the person's behalf. This one is the closest the coach
 * ever comes to a verdict, so under-counting here would tell somebody
 * who started three sessions that they managed one and a half -- a shame
 * mechanic arrived at by arithmetic, which is exactly what this product
 * refuses.
 *
 * @param {Array} activityLog
 * @param {Date|string} now
 * @param {number} windowDays
 * @param {number} weeklyTarget
 * @returns {number} 0..n
 */
export function trailingCompletionRate(activityLog, now, windowDays, weeklyTarget) {
  const nowKey = toDayKey(now);
  if (!nowKey || !Array.isArray(activityLog)) return 0;
  if (!(weeklyTarget > 0) || !(windowDays > 0)) return 0;

  let completed = 0;
  for (const entry of activityLog) {
    if (!entry || typeof entry !== "object") continue;
    const key = toDayKey(entry.completedAt);
    if (!key) continue;
    const age = daysBetween(key, nowKey);
    if (age === null || age < 0 || age >= windowDays) continue;
    completed++;
  }

  const expected = weeklyTarget * (windowDays / 7);
  return expected > 0 ? completed / expected : 0;
}

/* ────────────────────────────────────────────────────────────────────
 * Evaluation
 * ──────────────────────────────────────────────────────────────────── */

function silent(reason, extra = {}) {
  return {
    offer: false,
    recordOffer: false,
    reason,
    targetDescription: null,
    targetDate: null,
    daysUntilTarget: null,
    rate: null,
    weeklyTarget: null,
    ...extra
  };
}

function isWeightTarget(strategicGoal, targetType) {
  if (typeof targetType === "string" && targetType.toLowerCase() === "weight") return true;
  const goal = strategicGoal.primaryGoal;
  if (typeof goal === "string" && WEIGHT_GOAL_IDS.includes(goal.toLowerCase())) return true;
  const unit = strategicGoal.targetUnit;
  if (typeof unit === "string" && WEIGHT_UNITS.includes(unit.trim().toLowerCase())) return true;
  return false;
}

/**
 * Should the coach open the hard conversation?
 *
 * @param {object} ctx
 * @param {boolean} ctx.isPremium
 * @param {Date|string} ctx.now
 * @param {object} ctx.strategicGoal
 * @param {string|null} ctx.legacyTargetDate  top-level `targetDate`
 * @param {string|null} ctx.targetType        from goals.js, if known
 * @param {boolean} ctx.weightTrackingEnabled  store.weightTracking
 * @param {Array} ctx.activityLog
 * @param {number} ctx.painLevel              today, 0-10
 * @param {string} ctx.burnoutLevel           detectBurnout() level
 * @param {number} ctx.mood                   today, 1-10
 * @param {number} ctx.energy                 today, 1-10
 * @param {boolean} ctx.careOpeningToday      today's opening carries careMode
 * @returns {{offer: boolean, recordOffer: boolean, reason: string, ...}}
 */
export function evaluateGoalReview(ctx) {
  if (!ctx || typeof ctx !== "object") return silent("context-missing");

  // ── Tier ──────────────────────────────────────────────────────────
  if (ctx.isPremium !== true) return silent("tier-free");

  const strategicGoal = (ctx.strategicGoal && typeof ctx.strategicGoal === "object")
    ? ctx.strategicGoal
    : null;
  if (!strategicGoal) return silent("context-missing");

  const nowKey = toDayKey(ctx.now);
  if (!nowKey) return silent("context-missing");

  // ── Weight targets, before anything else looks at the numbers ─────
  //
  // Excluded ONLY where the person has not turned tracking on. With it
  // on, a weight target is treated like any other -- same trigger, same
  // maturity, same throttle, same three options.
  //
  // Unknown suppresses: an explicit true is required, so a caller that
  // forgets the field gets silence rather than an unwanted conversation.
  if (isWeightTarget(strategicGoal, ctx.targetType) && ctx.weightTrackingEnabled !== true) {
    return silent("weight-target-excluded");
  }

  // ── The target itself ─────────────────────────────────────────────
  //
  // Both homes, strategicGoal first, matching my-programme.js. Reading
  // only the structured one would repeat TARGET-3 in a new file.
  const targetKey = toDayKey(strategicGoal.targetDate) || toDayKey(ctx.legacyTargetDate);
  if (!targetKey) return silent("no-date");

  // The copy requires the person's own words. today.js writes the
  // description and the date independently, so a date with no words is
  // one tap away -- and R1-b renders a labelled invitation for it rather
  // than inventing a fallback phrase.
  const description = typeof strategicGoal.targetDescription === "string"
    ? strategicGoal.targetDescription.trim()
    : "";
  if (!description) return silent("no-description");

  // ── The denominator nobody agreed to ──────────────────────────────
  //
  // HOME-1's rule, inherited absolutely. weeklySessionTarget defaults to
  // 3 with setAt null, and the pair literally records that nobody chose
  // it. Persona 2.12 read "1 of 3 this week" and saw himself two short
  // of something he had never agreed to. A default is never a
  // denominator, and targetSetAt cannot stand in for this consent --
  // the two fields answer different questions.
  const weeklyTarget = strategicGoal.weeklySessionTarget;
  if (!strategicGoal.setAt || !(weeklyTarget > 0)) {
    return silent("unagreed-weekly-target");
  }

  // ── Maturity ──────────────────────────────────────────────────────
  const maturityAnchor = strategicGoal.targetSetAt || strategicGoal.setAt;
  const maturityDays = daysBetween(maturityAnchor, nowKey);
  if (maturityDays === null || maturityDays < MATURITY_DAYS) {
    return silent("target-immature");
  }

  // ── Horizon ───────────────────────────────────────────────────────
  const daysUntilTarget = daysBetween(nowKey, targetKey);
  if (daysUntilTarget === null || daysUntilTarget <= HORIZON_DAYS) {
    return silent("horizon-too-near");
  }

  // ── Throttle ──────────────────────────────────────────────────────
  const review = (strategicGoal.review && typeof strategicGoal.review === "object")
    ? strategicGoal.review
    : { lastOfferedAt: null, outcomes: [] };
  if (review.lastOfferedAt) {
    const since = daysBetween(review.lastOfferedAt, nowKey);
    if (since === null || since < THROTTLE_DAYS) return silent("throttled");
  }

  // ── Suppression. The safety half outweighs the feature. ───────────
  //
  // Each condition is independent and each is asserted independently in
  // verify-hard1.mjs. Unknown suppresses.

  if (typeof ctx.painLevel !== "number" || Number.isNaN(ctx.painLevel)) {
    return silent("pain-unknown");
  }
  if (ctx.painLevel >= PAIN_SEVERE) return silent("pain-severe");

  if (typeof ctx.careOpeningToday !== "boolean") return silent("care-unknown");
  if (ctx.careOpeningToday === true) return silent("care-mode");

  if (typeof ctx.burnoutLevel !== "string" || !BURNOUT_VALID.includes(ctx.burnoutLevel)) {
    return silent("burnout-unknown");
  }
  if (BURNOUT_SUPPRESSING.includes(ctx.burnoutLevel)) {
    return silent(`burnout-${ctx.burnoutLevel}`);
  }

  if (typeof ctx.mood !== "number" || Number.isNaN(ctx.mood)) return silent("bottom-band-unknown");
  if (typeof ctx.energy !== "number" || Number.isNaN(ctx.energy)) return silent("bottom-band-unknown");
  if (ctx.mood <= BOTTOM_BAND) return silent("bottom-band-mood");
  if (ctx.energy <= BOTTOM_BAND) return silent("bottom-band-energy");

  // ── The arithmetic, last ──────────────────────────────────────────
  const rate = trailingCompletionRate(ctx.activityLog, nowKey, WINDOW_DAYS, weeklyTarget);
  if (rate >= RATE_FLOOR) {
    return silent("on-course", { rate, daysUntilTarget, weeklyTarget });
  }

  return {
    offer: true,
    // Set lastOfferedAt ONLY when an offer was actually shown. A
    // suppressed offer must not consume the throttle, or a fortnight of
    // low mood would silently spend the conversation.
    recordOffer: true,
    reason: "off-course",
    targetDescription: description,
    targetDate: targetKey,
    daysUntilTarget,
    rate,
    weeklyTarget
  };
}
