/**
 * workoutGenerator.js - Workout Generation Engine
 * Creates 3 daily workout options based on user profile and check-in
 *
 * 11 Aug 2026 v1.14
 *
 * v1.14 — PT-2 (Persona Tracing Wave 1). getUserProfile()'s fitnessLevel
 *   read now falls through to lifestyle.activityLevel, the field live
 *   onboarding (thread.js Step 9) actually writes. "fitnessLevel" itself
 *   has had no live writer since OB-THREAD retired lifestyle.js, so this
 *   always resolved to "moderate" for every user regardless of their
 *   answer. See the full note at getUserProfile(). Reader AND writer both
 *   confirmed this time — v1.8 fixed the reader alone and said so.
 *
 * 30 Jul 2026 v1.13
 *
 * v1.13 — BUILD-4 dead-code removal. Removed generateDailyOptions()'s
 *   writes to todaysWorkouts/workoutsGeneratedAt (nothing live read them —
 *   the real mechanism is generatedSession) and removed the orphaned
 *   needsRegeneration()/getTodaysWorkouts() function pair, confirmed
 *   uncalled from anywhere else in the app. No behaviour change — this
 *   code was already dead. Documentation-accuracy session, not a fix.
 *
 * 24 Jul 2026 v1.12
 *
 * v1.12 — BUILD-5 undershoot fix, same day, found while on-device testing
 *   v1.11 with coach-proposal.js v12's fix confirmed live. Sessions were
 *   correctly never exceeding the declared availableTime window (v1.10's
 *   fix), but routinely landing well under it — e.g. "Quick" (20 min)
 *   sessions landing at 9-19 min across repeated tests. Root cause: the old
 *   selectExercises() picked exactly `exerciseCount - 2` main exercises and
 *   stopped, regardless of how short they turned out to be. Real exercise
 *   data runs 60-100s for most strength/mobility items, so for "quick"
 *   (mainCount = 1) there was only ever one main exercise — nowhere near
 *   enough content to fill 20 minutes, no matter which one got picked.
 *
 *   Fixed: selectExercises()'s main-block selection is now duration-aware
 *   when availableTime is set — fills toward getDurationCap()'s target one
 *   exercise at a time (new shared method, extracted from applyDurationCap()
 *   so the fill-target and the trim-ceiling can never drift apart), bounded
 *   by a new MAIN_FILL_CEILING sanity max. mainCount is kept as a floor
 *   (try to reach at least this many), which also resolves the previously-
 *   flagged "micro" floor issue as a side effect — the fill loop always adds
 *   at least 1 main exercise unconditionally, where mainCount = 0 previously
 *   produced zero. Behaviour when availableTime is null is unchanged
 *   (original fixed-count selection, untouched).
 *
 *   applyDurationCap() remains as-is and still runs afterward — now more of
 *   a safety net for edge cases (e.g. one unusually long exercise) than the
 *   primary mechanism, since selection now aims at the target directly.
 *
 * 24 Jul 2026 v1.11
 *
 * v1.11 — BUILD-5 follow-up, same session. Exported AVAILABLE_TIME_WINDOW_MINUTES
 *   (previously a private const) so coach-proposal.js's fallback-path minutes
 *   calculation can reuse the same numbers instead of duplicating them. No
 *   change to any existing behaviour — this is an export addition only.
 *   Root cause this unblocks: coach-proposal.js's _getAvailableTime() was
 *   reading availableTime from the wrong store fields (checkinHistory /
 *   lastCheckin, neither of which ever held it) and always fell through to
 *   a hardcoded literal 30 — silently overwriting the correct value on every
 *   mount of the proposal screen, before generateDailyOptions() ever ran.
 *   That bug lived entirely in coach-proposal.js; this file's v1.10 fix was
 *   correct throughout but could never be exercised via the real UI because
 *   of it. See coach-proposal.js v12 changelog for the actual fix.
 *
 * 24 Jul 2026 v1.10
 *
 * v1.10 — BUILD-5 fix, confirmed via static analysis (24 Jul) then live
 *   ground-truth before editing. Root cause: applyDurationCap() only ever
 *   checked total session length against the fixed per-focus ceiling
 *   (MAX_DURATION_BY_FOCUS) — it never referenced availableTime at all.
 *   So someone selecting "Quick — 20 min" still got a session capped only
 *   at the focus's 30–50 min ceiling, not their actual declared window.
 *
 *   Fix: added AVAILABLE_TIME_WINDOW_MINUTES, a total-session-duration
 *   lookup (in minutes) per availableTime category. These values were
 *   already documented in the v1.5 changelog comment below (the 40%-of-
 *   window relationship that produces AVAILABLE_TIME_MAX_EXERCISE_DURATION)
 *   but had never been captured as an actual constant or used anywhere.
 *   applyDurationCap() now takes availableTime as a parameter and caps
 *   against min(focusCap, windowMinutes) — the tighter of the two —
 *   preserving the existing per-focus sanity ceiling for generous
 *   availableTime values while actually respecting a short one.
 *
 *   Trimming mechanism unchanged and re-confirmed safe for more frequent
 *   triggering: exercises are removed from the end of the middle block,
 *   warmup and cooldown stay protected, loop exits once under cap or only
 *   one main exercise remains. No adjustment needed here.
 *
 *   FLOOR ISSUE FOUND, NOT FIXED HERE (logged separately, out of this
 *   session's scope per blueprint Section 2): selectExercises() computes
 *   mainCount = params.exerciseCount - 2 (reserving 2 slots for warmup +
 *   cooldown). For availableTime = "micro", exerciseCount is 2, so
 *   mainCount = 0 — a Micro (10 min) session gets zero main-focus
 *   exercises, just a warmup and a cooldown, regardless of focus type.
 *   This is a pre-existing gap in selectExercises(), not in
 *   applyDurationCap() (which cannot fix it — there's nothing to trim),
 *   and touching selectExercises()'s count logic was not in this
 *   session's file scope. Flagging for a separate fix.
 *
 * v1.9 — Confirmed Critical bug fix, Session A2 follow-up. This file has
 *   carried `import { programmeEngine } from "./programmeEngine.js";`
 *   since at least v1.1 — but programmeEngine.js has never exported a
 *   `programmeEngine` binding (confirmed by reading the real file this
 *   session): it exports individual named functions only
 *   (getPhaseBias, getReEntryContext, getMissedSessionOffer, etc.), no
 *   default export, no bundled object. This is a SyntaxError at module
 *   load time in a strict ES module environment — not a runtime error,
 *   a load-time one — which means this file could never have loaded
 *   successfully as an ES module, ever, until today.
 *
 *   It was never caught because nothing ever actually imported this
 *   file via a real `import` statement before coach-proposal.js v9
 *   (13 Jul, Session A2) — the old code used a `window._workoutGenerator`
 *   runtime property lookup, which never triggered module resolution.
 *   generateDailyOptions() was therefore ALWAYS running the fallback
 *   path in coach-proposal.js, silently, this entire time. Door 1 has
 *   likely never once shown a real generated session to a user.
 *
 *   Fixed: changed to `import * as programmeEngine from "./programmeEngine.js"`.
 *   This captures the real named exports as a namespace object, so the
 *   three existing `programmeEngine.getPhaseBias()` call sites
 *   (applyProgrammeBias, getWorkoutFocusOrder, generateDailyOptions)
 *   continue to work completely unchanged — getPhaseBias does exist.
 *
 *   SECOND bug found while fixing the first, same root cause (never
 *   reachable before today): generateRationale() calls
 *   `programmeEngine.getStrategicRationale(focus)` unconditionally.
 *   getStrategicRationale does NOT exist anywhere in programmeEngine.js
 *   — confirmed by reading the full file. It's referenced in this
 *   file's own v1.1 changelog ("getStrategicRationale() adds a
 *   goal-connection line to each rationale") as though it was built,
 *   but it isn't there. Namespace imports don't error on missing
 *   properties at import time — this would have thrown
 *   "programmeEngine.getStrategicRationale is not a function" on every
 *   single call to generateRationale(), i.e. every generated session,
 *   the moment the import fix above let the module actually load.
 *   Guarded with a typeof check rather than invented — this looks like
 *   a planned-but-never-built feature (not something I should fabricate
 *   a replacement for), flagging for Graeme to decide whether to build
 *   it for real or drop the dead reference. Currently: the strategic
 *   connection line is silently omitted from every rationale, same as
 *   it always has been in practice (since this code path was never
 *   reachable before today either).
 *
 * v1.8 — Confirmed bug fix. getUserProfile() was reading
 *   store.get("activityLevel") for fitnessLevel — but store.js has no
 *   top-level activityLevel field. The field Settings actually writes
 *   to (settings.js's save-fitness-level action) is fitnessLevel, a
 *   different key entirely. There's also a *nested* lifestyle.activityLevel,
 *   which made this an easy mix-up, but neither matched what was being
 *   read here. Practical effect: store.get("activityLevel") always
 *   returned undefined, so fitnessLevel in the generator's profile was
 *   ALWAYS "moderate" — the Activity Level dropdown in Settings has
 *   never actually changed anything about generated sessions. Fixed to
 *   read the correct key. Not confirmed whether getSuitableExercises()
 *   in exercises.js actually uses profile.fitnessLevel downstream — that
 *   file hasn't been ground-truthed this session — but the read here was
 *   wrong regardless of downstream usage.
 *
 * v1.7 — Goal-aware session bias + core guarantee + weight safeguarding:
 *
 *   getGoalProfile()
 *     Reads primaryGoal and goals[] from store. Returns a structured object
 *     { primaryGoal, wantsWeightLoss, wantsCardio, wantsStrength, wantsMobility }
 *     used by bias and rationale logic throughout generation.
 *
 *   applyGoalBias(pool, focusOrder, goalProfile)
 *     Adjusts workout focus order and pool weighting by goal.
 *     Weight-loss and body-composition users: cardio surfaced first,
 *     higher-MET exercises weighted up (goalScore boosted).
 *     Improve-cardio users: same cardio-first ordering.
 *     Build-strength users: strength first, as before.
 *     Additive — never overrides burnout or cycle phase.
 *
 *   applyCoreGuarantee(exercises, pool)
 *     After selection, checks whether any exercise touches the confirmed
 *     core area list. If not, swaps one main exercise for the highest-
 *     scored core-affecting exercise available in the pool.
 *     Silent. Always on. For every user, every session.
 *     Core areas: core, abdominals, lower-back, glutes, hip-flexor,
 *     hamstring, adductors, hip-abductors, pelvic-floor.
 *
 *   validateWeightTarget()
 *     Reads weight, targetWeight, targetDate from store.
 *     Returns a coach message string if implied rate exceeds ~1 kg/week.
 *     Returns null if target is safe or insufficient data.
 *     Used by UI to surface a warm, non-blocking intervention.
 *
 *   generateRationale() extended:
 *     Goal-aware lines added — weight-loss users see a coach line
 *     connecting today's session to their goal.
 *
 * v1.6 — SOLO taxonomy / difficulty progression (Gap 1):
 *   difficultyLevel (1/2/3) added to all exercises.
 *   getPhaseBias() now returns intensityBias ('gentle'|'moderate'|'challenging').
 *   getWorkoutParams() accepts intensityBias and applies a difficultyFloor
 *   that rises with programme phase — additive to daily adaptation.
 *   selectExercises() filters by difficultyLevel using the floor from params.
 *
 *   Phase → preferred difficulty:
 *     Weeks 1-4  (gentle)      → prefer 1, allow 2
 *     Weeks 5-8  (moderate)    → prefer 1-2, allow 3
 *     Weeks 9-10 (challenging) → prefer 2-3, allow 1
 *     Weeks 11-12 (moderate)   → prefer 1-2
 *     No programme active      → no difficulty floor (full pool)
 *
 *   Burnout always overrides: difficulty floor is ignored when burnout is high.
 *   Low energy always wins: energyRequired gate is applied first.
 *
 * v1.6 — Menstrual cycle adaptation (Gap 3):
 *   getCyclePhase(cycleDay, cycleLength) returns phase string.
 *   generateDailyOptions() reads cycleDay + hormonalTracking from store.
 *   getWorkoutParams() accepts cyclePhase and adjusts maxEnergy + focusOnRecovery.
 *   generateRationale() adds a cycle-aware coach line when phase is active.
 *
 * v1.5 — Per-exercise duration ceiling when availableTime is set:
 *   selectExercises() now filters out any exercise whose individual
 *   duration exceeds 40% of the declared available window before
 *   selection happens. This prevents a single long exercise (e.g. a
 *   30-minute pilates sequence) from consuming the entire window.
 *
 *   Ceiling values (40% of window, in seconds):
 *     micro    (10 min) -> 240s  (4 min max per exercise)
 *     quick    (20 min) -> 480s  (8 min max per exercise)
 *     short    (30 min) -> 720s  (12 min max per exercise)
 *     standard (40 min) -> 960s  (16 min max per exercise)
 *     long     (50 min) -> 1200s (20 min max per exercise)
 *     open     (60 min) -> 1440s (24 min max per exercise)
 *     null              -> no per-exercise ceiling applied
 *
 *   applyDurationCap() remains as a post-selection safety net.
 *
 * v1.5 — Per-exercise duration ceiling when availableTime is set:
 *   getWorkoutParams() now accepts availableTime from the store.
 *   When set, availableTime drives exerciseCount via a lookup table;
 *   intensity still exclusively drives maxEnergy, warmup/cooldown
 *   inclusion, and focusOnRecovery.
 *
 *   A maxDuration cap (minutes) is applied per focus type after exercise
 *   selection. If calculateDuration() exceeds the cap, main-block
 *   exercises are trimmed from the end until the session fits. Warmup
 *   and cooldown are never trimmed.
 *
 *   availableTime lookup:
 *     "micro"    (10 min)  → 2 exercises
 *     "quick"    (20 min)  → 3 exercises
 *     "short"    (30 min)  → 4 exercises
 *     "standard" (40 min)  → 5 exercises
 *     "long"     (50 min)  → 6 exercises
 *     "open"     (60+ min) → 7 exercises
 *     null                 → intensity-derived (existing behaviour)
 *
 *   maxDuration caps per focus:
 *     cardio   → 45 min
 *     strength → 50 min
 *     mobility → 40 min
 *     recovery → 30 min  (burnout / focusOnRecovery path)
 *     fallback → 50 min
 *
 * v1.3 — Severe zone override:
 *   Any severe pain zone bypasses the full workout pool and returns a
 *   single Gentle Care card (breathing + mindfulness + mindful walk).
 *   Pain fingerprint cache busts workouts on pain score change.
 *
 * v1.2 — Condition pain score wiring:
 *   getUserProfile() now includes conditionPainScores from store.
 *   getSuitableExercises() receives them via checkinData.painScores so
 *   the 3-tier condition filter can correctly resolve phase-aware variants
 *   (hamstring-acute, knee-subacute, etc.) based on today's pain levels.
 *
 * v1.1 — Strategic layer:
 *   applyProgrammeBias()     weights exercise selection toward the current phase
 *   getStrategicRationale()  adds a goal-connection line to each rationale
 *   getProgrammeFocus()      nudges the 3 workout option ordering by phase bias
 *
 * IMPORTANT: Daily adaptation logic is unchanged.
 * Burnout always overrides. Energy always gates intensity.
 * The programme adds a bias, not a command.
 * availableTime overrides exerciseCount only — never intensity logic.
 */

import { store }           from "../store.js";
import { checkinData }     from "./checkin.js";
import * as programmeEngine from "./programmeEngine.js";   // v1.9 — was `import { programmeEngine }`, which does not exist as a named export
import {
  getSuitableExercises,
} from "./exercises.js";

// ── Duration caps (minutes) per workout focus ─────────────────────────────────
const MAX_DURATION_BY_FOCUS = {
  cardio:   45,
  strength: 50,
  mobility: 40,
  recovery: 30
};

const MAX_DURATION_FALLBACK = 50;

// ── availableTime → exerciseCount lookup ──────────────────────────────────────
const AVAILABLE_TIME_COUNT = {
  micro:    2,
  quick:    3,
  short:    4,
  standard: 5,
  long:     6,
  open:     7
};

// Hard sanity max for selectExercises()'s duration-aware main-block fill
// loop (BUILD-5 undershoot fix, 24 Jul 2026) — prevents a very generous
// availableTime window from filling with an unreasonably long exercise
// list if individual exercises happen to run short. The loop should
// normally stop well before this on duration; this is a backstop, not
// the primary constraint.
const MAIN_FILL_CEILING = 6;

// ── availableTime → per-exercise duration ceiling (seconds) ───────────────────
// 40% of available window. Prevents a single long exercise (e.g. a 30-minute
// pilates sequence) from consuming the entire declared time slot.
// Applied as a pre-selection filter in selectExercises() when availableTime is set.
// null means no ceiling — long exercises allowed when user has no time declared.
const AVAILABLE_TIME_MAX_EXERCISE_DURATION = {
  micro:    240,   // 4 min
  quick:    480,   // 8 min
  short:    720,   // 12 min
  standard: 960,   // 16 min
  long:     1200,  // 20 min
  open:     1440   // 24 min
};

// ── availableTime → total session duration window (minutes) ──────────────────
// BUILD-5 (24 Jul 2026): the actual declared time window, matching the labels
// shown in checkin.js (Micro/Quick/Short/Standard/Long/Open). This is the
// figure AVAILABLE_TIME_MAX_EXERCISE_DURATION above was always 40% of — it
// just was never captured as its own constant or used anywhere before now.
// Used by applyDurationCap() as the tighter of two constraints, alongside the
// existing per-focus MAX_DURATION_BY_FOCUS ceiling. Exported (v1.11) so
// coach-proposal.js's fallback path can convert a category to minutes using
// the same numbers, rather than a second hardcoded copy.
export const AVAILABLE_TIME_WINDOW_MINUTES = {
  micro:    10,
  quick:    20,
  short:    30,
  standard: 40,
  long:     50,
  open:     60
};

// ── Core area affectsAreas values ──────────────────────────────────────────────
// Every session should touch at least one of these. applyCoreGuarantee()
// enforces this silently after exercise selection.
const CORE_AREAS = new Set([
  "core", "abdominals", "lower-back", "glutes",
  "hip-flexor", "hamstring", "adductors", "hip-abductors", "pelvic-floor"
]);

// Goals that shift session bias toward higher-MET / cardio work
const WEIGHT_LOSS_GOALS = new Set(["lose-weight", "feel-better"]);
const CARDIO_GOALS      = new Set(["improve-cardio", "run-5k", "more-energy"]);
const STRENGTH_GOALS    = new Set(["build-strength", "build-muscle"]);
const MOBILITY_GOALS    = new Set(["improve-flexibility", "reduce-pain", "reduce-stress"]);

export const workoutGenerator = {

  // ── Cycle phase helper ──────────────────────────────────────────────────────

  /**
   * Map cycleDay to a named phase.
   * Returns null if hormonalTracking is off or cycleDay is invalid.
   *
   * @param {number|null} cycleDay    — 1-based day in cycle (from check-in)
   * @param {number}      cycleLength — user's cycle length (default 28)
   * @returns {"menstruation"|"follicular"|"ovulation"|"luteal"|null}
   */
  getCyclePhase(cycleDay, cycleLength = 28) {
    if (!cycleDay || cycleDay < 1 || cycleDay > cycleLength) return null;

    if (cycleDay <= 5)                               return "menstruation";
    if (cycleDay <= 13)                              return "follicular";
    if (cycleDay <= 16)                              return "ovulation";
    return "luteal";
  },

  // ── Goal profile ────────────────────────────────────────────────────────────

  /**
   * Read goal state from store and return a structured profile.
   * Used by applyGoalBias() and generateRationale().
   *
   * @returns {{ primaryGoal: string|null, wantsWeightLoss: boolean,
   *             wantsCardio: boolean, wantsStrength: boolean, wantsMobility: boolean }}
   */
  getGoalProfile() {
    const goals       = store.get("goals") || [];
    const primaryGoal = store.get("goal.primaryGoal") || goals[0] || null;
    const goalSet     = new Set(goals);

    return {
      primaryGoal,
      wantsWeightLoss: goals.some(g => WEIGHT_LOSS_GOALS.has(g)),
      wantsCardio:     goals.some(g => CARDIO_GOALS.has(g)),
      wantsStrength:   goals.some(g => STRENGTH_GOALS.has(g)),
      wantsMobility:   goals.some(g => MOBILITY_GOALS.has(g)),
      goalSet
    };
  },

  // ── Goal-aware session bias ─────────────────────────────────────────────────

  /**
   * Adjust focus order and pool scoring based on user goals.
   * Weight-loss / cardio goals: cardio first, higher-MET exercises boosted.
   * Strength goals: strength first (if not already from programme bias).
   * Mobility goals: mobility surfaced alongside recovery.
   * Additive to programme bias — never overrides burnout.
   *
   * @param {Array}  pool        — exercise pool (may already have programmeScore)
   * @param {Array}  focusOrder  — ["strength","mobility","cardio"] or programme-ordered
   * @param {object} goalProfile — result of getGoalProfile()
   * @returns {{ pool: Array, focusOrder: Array }}
   */
  applyGoalBias(pool, focusOrder, goalProfile) {
    let order = [...focusOrder];
    let biasedPool = pool;

    if (goalProfile.wantsWeightLoss || goalProfile.wantsCardio) {
      // Cardio to front if not already there
      order = ["cardio", ...order.filter(f => f !== "cardio")];

      // Boost higher-MET exercises in the pool
      biasedPool = pool.map(ex => ({
        ...ex,
        programmeScore: (ex.programmeScore || 1) + (ex.energyRequired >= 6 ? 1 : 0)
      }));
    } else if (goalProfile.wantsStrength && order[0] !== "strength") {
      order = ["strength", ...order.filter(f => f !== "strength")];
    } else if (goalProfile.wantsMobility && !goalProfile.wantsStrength && !goalProfile.wantsCardio) {
      order = ["mobility", ...order.filter(f => f !== "mobility")];
    }

    return { pool: biasedPool, focusOrder: order };
  },

  // ── Core guarantee ──────────────────────────────────────────────────────────

  /**
   * Ensure every session touches the core/carrier chain.
   * If no selected exercise has an affectsAreas value in CORE_AREAS,
   * replaces one main-role exercise with the best core-affecting exercise
   * available in the pool.
   * Warmup and cooldown are never replaced.
   * Silent — no UI signal. Always runs for every user.
   *
   * @param {Array} exercises — selected exercises from selectExercises()
   * @param {Array} pool      — full suitable exercise pool
   * @returns {Array}         — exercises, possibly with one swap applied
   */
  applyCoreGuarantee(exercises, pool) {
    const hasCore = exercises.some(ex =>
      (ex.affectsAreas || []).some(area => CORE_AREAS.has(area))
    );
    if (hasCore) return exercises;

    // Find the best core-affecting exercise not already selected
    const selectedIds = new Set(exercises.map(e => e.id));
    const coreOptions = pool
      .filter(ex =>
        !selectedIds.has(ex.id) &&
        (ex.affectsAreas || []).some(area => CORE_AREAS.has(area))
      )
      .sort((a, b) => (b.programmeScore || 1) - (a.programmeScore || 1));

    if (!coreOptions.length) return exercises;

    const replacement = { ...coreOptions[0], role: "main" };

    // Replace the last main-role exercise (never warmup or cooldown)
    const lastMainIdx = exercises.map(e => e.role).lastIndexOf("main");
    if (lastMainIdx === -1) return exercises;

    const result = [...exercises];
    result[lastMainIdx] = replacement;
    return result;
  },

  // ── Weight target safeguarding ──────────────────────────────────────────────

  /**
   * Validate the user's weight target against a safe rate of change.
   * Safe rate: ~0.5-1 kg per week (1-2 lbs).
   * Returns a warm coach message string if the target is unsafe.
   * Returns null if the target is safe, or if data is insufficient to check.
   *
   * @returns {string|null}
   */
  validateWeightTarget() {
    const currentWeight = store.get("weight");
    const targetWeight  = store.get("targetWeight");
    const targetDate    = store.get("targetDate") ||
                          store.get("goal.targetDate");

    if (!currentWeight || !targetWeight || !targetDate) return null;

    const current = parseFloat(currentWeight);
    const target  = parseFloat(targetWeight);
    if (isNaN(current) || isNaN(target)) return null;

    const weightDiff = Math.abs(current - target);
    if (weightDiff < 0.5) return null; // Already at or near target

    const today      = new Date();
    const end        = new Date(targetDate);
    const msPerWeek  = 7 * 24 * 60 * 60 * 1000;
    const weeksLeft  = (end - today) / msPerWeek;

    if (weeksLeft <= 0) return null; // Date already passed — no intervention

    const kgPerWeek = weightDiff / weeksLeft;

    if (kgPerWeek <= 1.0) return null; // Safe rate — no message needed

    return "That is a meaningful goal and I want to help you get there. That timeline concerns me a little though — a pace of around 0.5 to 1 kg a week tends to be more sustainable and kinder to your body. Want to adjust the date, or keep the goal open-ended for now?";
  },

  // ── Daily options ───────────────────────────────────────────────────────────

  /**
   * Generate today's 3 workout options
   */
  generateDailyOptions() {
    const profile     = this.getUserProfile();
    const checkin     = checkinData.getTodaysCheckin();
    const intensity   = store.get("todayIntensity") || "moderate";
    const burnout     = checkinData.detectBurnout();
    const goalProfile = this.getGoalProfile();

    // ── Gap 3: Menstrual cycle phase ───────────────────────────────────────
    // Read cycleDay from today's check-in only when hormonalTracking is on.
    // getCyclePhase() returns null when tracking is off — all downstream
    // logic gracefully ignores a null cyclePhase.
    const hormonalTracking = store.get("hormonalTracking") || false;
    const cycleDay         = hormonalTracking ? (checkin?.cycleDay || null) : null;
    const cycleLength      = store.get("cycleLength") || 28;
    const cyclePhase       = this.getCyclePhase(cycleDay, cycleLength);

    // ── Gap 1: Programme intensity bias ────────────────────────────────────
    // getPhaseBias() already returns intensityBias — extract it here so
    // getWorkoutParams() can use it to set a difficulty floor.
    const phaseBias      = programmeEngine.getPhaseBias();
    const intensityBias  = phaseBias?.intensityBias || null;
    const currentWeek    = store.get("activeProgramme.currentWeek") || null;

    // Build checkin data object for the filter engine.
    // painScores comes from store (written at check-in submission) so
    // the filter gets phase-aware condition resolution even if the workout
    // is regenerated later in the day without a fresh check-in.
    const checkinForFilter = {
      energy:       checkin?.energy        || 5,
      recoveryMode: burnout.level === "high",
      painScores:   store.get("conditionPainScores") || {}
    };

    // Get filtered exercise pool
    const suitable = getSuitableExercises(profile, checkinForFilter);

    // Apply programme phase bias to the pool (v1.1)
    const biasedPool = this.applyProgrammeBias(suitable);

    // Determine focus order based on programme phase (or default order)
    const rawFocusOrder = this.getWorkoutFocusOrder();

    // v1.7: Apply goal bias — adjusts focus order and pool MET weighting.
    // Only applied when burnout is not high (burnout overrides everything).
    const { pool: goalPool, focusOrder: goalFocusOrder } = burnout.level === "high"
      ? { pool: biasedPool, focusOrder: rawFocusOrder }
      : this.applyGoalBias(biasedPool, rawFocusOrder, goalProfile);

    const [focus1, focus2, focus3] = goalFocusOrder;

    const options = [
      this.generateWorkout(focus1, goalPool, intensity, burnout, cyclePhase, intensityBias, currentWeek, goalProfile),
      this.generateWorkout(focus2, goalPool, intensity, burnout, cyclePhase, intensityBias, currentWeek, goalProfile),
      this.generateWorkout(focus3, goalPool, intensity, burnout, cyclePhase, intensityBias, currentWeek, goalProfile)
    ];

    return options;
  },

  /**
   * Get user profile data for the filter engine.
   * conditionPainScores is passed separately via checkinForFilter.
   *
   * v1.8: fitnessLevel now reads the correct store key. Was reading
   * "activityLevel" (doesn't exist at top level — always undefined,
   * always fell back to "moderate"). Settings writes to "fitnessLevel".
   */
  getUserProfile() {
    // v1.14 (11 Aug 2026, PT-2) — READER AND WRITER BOTH CONFIRMED.
    //
    // v1.8 fixed this read from "activityLevel" to "fitnessLevel" and
    // explicitly did not check the write side. Persona tracing found the
    // writer: js/views/onboarding/lifestyle.js:268 is the only place that
    // ever set "fitnessLevel", and that route was retired from router.js
    // VIEW_NAMES in v7 (OB-THREAD). thread.js's storeField list does not
    // include it. So "fitnessLevel" has been null for every user who
    // onboarded via the live thread, and this fell back to "moderate"
    // regardless of what the person answered at Step 9.
    //
    // Measured effect against the live 461-exercise database:
    //   sedentary user -> pool of 329 instead of 253 (76 exercises above
    //                     his ceiling, i.e. sessions too hard)
    //   active user    -> pool of 350 instead of 359 (the 9 hardest
    //                     silently withheld, i.e. sessions too easy)
    //
    // Step 9 DOES ask the question and writes lifestyle.activityLevel.
    // Read that as the source of truth. "fitnessLevel" is retained as an
    // explicit override so the Settings > Activity Level control keeps
    // working (settings.js:978 is its only other writer) — deliberately
    // ordered override-first so a manual change always wins over the
    // onboarding answer.
    const declared = store.get("fitnessLevel")
                  || store.get("lifestyle.activityLevel")
                  || "moderate";

    return {
      equipment:    store.get("equipment")    || [],
      conditions:   store.get("conditions")   || [],
      goals:        store.get("goals")        || [],
      fitnessLevel: declared
    };
  },

  /**
   * Apply programme phase bias to exercise pool.
   * Adds a programmeScore to each exercise (1 = neutral, 2 = phase-preferred).
   * pickMultiple() uses this to weight selection.
   * Returns original pool unchanged if no programme is active.
   */
  applyProgrammeBias(exercisePool) {
    const bias = programmeEngine.getPhaseBias();
    if (!bias) return exercisePool;

    return exercisePool.map(ex => ({
      ...ex,
      programmeScore: bias.primaryFocus === ex.category ? 3
        : bias.secondaryFocus === ex.category ? 2
        : 1
    }));
  },

  /**
   * Determine the order of workout focus options.
   * Phase bias puts the programme-preferred focus first.
   * Falls back to default order (strength / mobility / cardio) if no programme.
   */
  getWorkoutFocusOrder() {
    const bias = programmeEngine.getPhaseBias();
    if (!bias || !bias.primaryFocus) {
      return ["strength", "mobility", "cardio"];
    }

    const all     = ["strength", "mobility", "cardio"];
    const primary = bias.primaryFocus === "strength" ? "strength"
                  : bias.primaryFocus === "cardio"   ? "cardio"
                  : "mobility";
    const rest    = all.filter(f => f !== primary);
    return [primary, ...rest];
  },

  /**
   * Generate a single workout with a specific focus.
   * Reads availableTime from store and passes it into getWorkoutParams().
   */
  generateWorkout(focus, suitableExercises, intensity, burnout, cyclePhase = null, intensityBias = null, currentWeek = null, goalProfile = null) {
    const availableTime = store.get("availableTime") || null;
    const params        = this.getWorkoutParams(intensity, burnout, availableTime, cyclePhase, intensityBias, currentWeek);
    const raw           = this.selectExercises(focus, suitableExercises, params, availableTime);

    // v1.7: Core guarantee — ensure every session touches the core/carrier chain.
    // Silent swap of one main exercise if nothing in the selection does.
    const exercises     = this.applyCoreGuarantee(raw, suitableExercises);

    const capped        = this.applyDurationCap(exercises, focus, params, availableTime);
    const duration       = this.calculateDuration(capped);
    const rationale     = this.generateRationale(focus, intensity, burnout, cyclePhase, goalProfile);

    return {
      id:            `workout-${focus}-${Date.now()}`,
      focus,
      name:          this.getWorkoutName(focus),
      icon:          this.getWorkoutIcon(focus),
      duration,
      exerciseCount: capped.length,
      exercises:     capped,
      intensity,
      rationale,
      totalCredits:  capped.reduce((sum, e) => sum + (e.credits || 30), 0)
    };
  },

  /**
   * Workout parameters by intensity level, with optional overrides.
   *
   * Priority rules (highest → lowest):
   *   1. Burnout        — overrides everything; returns Recovery Mode params.
   *   2. cyclePhase     — menstruation reduces maxEnergy; ovulation raises it.
   *                       Luteal and follicular are nudges, not hard overrides.
   *   3. availableTime  — if set, drives exerciseCount via lookup table.
   *   4. intensityBias  — programme phase sets a difficultyFloor (additive nudge).
   *   5. Intensity      — always drives maxEnergy base, warmup/cooldown, focusOnRecovery.
   *
   * difficultyFloor: minimum difficultyLevel exercises must meet.
   *   1 = no floor (all exercises eligible)
   *   2 = intermediate and above preferred (selectExercises filters/weights by this)
   *   The floor is a preference signal, not a hard block — if the pool has no
   *   exercises above the floor, the floor is ignored.
   *
   * @param {string}      intensity     — "recovery"|"gentle"|"moderate"|"challenging"
   * @param {object}      burnout       — result of checkinData.detectBurnout()
   * @param {string|null} availableTime — "micro"|"quick"|"short"|"standard"|"long"|"open"|null
   * @param {string|null} cyclePhase    — "menstruation"|"follicular"|"ovulation"|"luteal"|null
   * @param {string|null} intensityBias — "gentle"|"moderate"|"challenging" from programme phase
   * @param {number|null} currentWeek   — current programme week (1-12), or null
   * @returns {object} params
   */
  getWorkoutParams(intensity, burnout, availableTime, cyclePhase = null, intensityBias = null, currentWeek = null) {
    // ── 1. Burnout override — highest priority ──────────────────────────────
    if (burnout.level === "high") {
      return {
        exerciseCount:   4,
        maxEnergy:       3,
        includeWarmup:   true,
        includeCooldown: true,
        focusOnRecovery: true,
        difficultyFloor: 1
      };
    }

    // ── 2. Intensity-derived base params ────────────────────────────────────
    const intensityParams = {
      recovery:    { exerciseCount: 4, maxEnergy: 3,  includeWarmup: true, includeCooldown: true, focusOnRecovery: true  },
      gentle:      { exerciseCount: 5, maxEnergy: 5,  includeWarmup: true, includeCooldown: true, focusOnRecovery: false },
      moderate:    { exerciseCount: 6, maxEnergy: 7,  includeWarmup: true, includeCooldown: true, focusOnRecovery: false },
      challenging: { exerciseCount: 7, maxEnergy: 10, includeWarmup: true, includeCooldown: true, focusOnRecovery: false }
    };

    const base = { ...( intensityParams[intensity] || intensityParams.moderate ), difficultyFloor: 1 };

    // ── 3. Cycle phase modifiers — additive, never override burnout ─────────
    // Menstruation: reduce maxEnergy, favour recovery focus
    // Follicular: no change (normal to high energy)
    // Ovulation: slight energy ceiling lift
    // Luteal: modest energy reduction, no focusOnRecovery
    if (cyclePhase === "menstruation") {
      base.maxEnergy       = Math.min(base.maxEnergy, 5);
      base.focusOnRecovery = true;
    } else if (cyclePhase === "ovulation") {
      // Peak phase — allow slightly higher energy if intensity would support it
      base.maxEnergy = Math.min(base.maxEnergy + 1, 10);
    } else if (cyclePhase === "luteal") {
      base.maxEnergy = Math.min(base.maxEnergy, 7);
    }
    // follicular: no modifier needed

    // ── 4. Programme difficulty floor — additive nudge, not hard block ──────
    // Maps programme phase intensityBias to a difficultyFloor.
    // The floor is used in selectExercises() to prefer higher-difficulty exercises
    // as the programme progresses. It never forces hard exercises on tired users.
    if (intensityBias && burnout.level !== "high") {
      const floorByBias = {
        "gentle":      1,
        "moderate":    1,
        "challenging": 2
      };
      base.difficultyFloor = floorByBias[intensityBias] ?? 1;

      // Further refine by week within challenging phase (weeks 9-10 → prefer 2-3)
      if (intensityBias === "challenging" && currentWeek && currentWeek >= 9) {
        base.difficultyFloor = 2;
      }
    }

    // ── 5. availableTime overrides exerciseCount only ────────────────────────
    const timeCount  = availableTime ? (AVAILABLE_TIME_COUNT[availableTime] ?? null) : null;
    const finalCount = timeCount !== null ? timeCount : base.exerciseCount;

    return {
      ...base,
      exerciseCount: finalCount
    };
  },

  /**
   * Single source of truth for the total-session-duration cap: the tighter
   * of the fixed per-focus sanity ceiling and the user's declared
   * availableTime window, when set. Shared by applyDurationCap() (the
   * ceiling — trims if over) and selectExercises()'s main-block fill logic
   * (the floor — fills toward it) so both always agree on the same number.
   * Previously this formula was duplicated in applyDurationCap() alone;
   * extracted here (24 Jul 2026, BUILD-5 undershoot fix) before a second
   * copy could be added and drift out of sync with the first.
   *
   * @param {string}      focus         - workout focus type
   * @param {object}      params        - result of getWorkoutParams()
   * @param {string|null} availableTime - "micro"|"quick"|"short"|"standard"|"long"|"open"|null
   * @returns {number} cap in minutes
   */
  getDurationCap(focus, params, availableTime = null) {
    const focusCap = params.focusOnRecovery
      ? MAX_DURATION_BY_FOCUS.recovery
      : (MAX_DURATION_BY_FOCUS[focus] ?? MAX_DURATION_FALLBACK);

    const windowCap = availableTime
      ? (AVAILABLE_TIME_WINDOW_MINUTES[availableTime] ?? null)
      : null;

    return windowCap !== null ? Math.min(focusCap, windowCap) : focusCap;
  },

  /**
   * Trim exercises to fit within the maxDuration cap for this focus type.
   * Warmup (role: "warmup") and cooldown (role: "cooldown") are always protected.
   * Main and accessory/finisher exercises are trimmed from the end of the
   * middle block until duration is within the cap, or only 1 main exercise remains.
   *
   * BUILD-5 (24 Jul 2026): the cap is now the tighter of two constraints —
   * the fixed per-focus sanity ceiling (MAX_DURATION_BY_FOCUS), and the
   * user's actual declared availableTime window (AVAILABLE_TIME_WINDOW_MINUTES),
   * when set. Previously this only ever checked the per-focus ceiling, so a
   * short availableTime selection (e.g. "Quick — 20 min") was never actually
   * enforced at the total-duration stage.
   *
   * @param {Array}       exercises     - selected exercise list from selectExercises()
   * @param {string}      focus         - workout focus type
   * @param {object}      params        - result of getWorkoutParams()
   * @param {string|null} availableTime - "micro"|"quick"|"short"|"standard"|"long"|"open"|null
   * @returns {Array} exercises, potentially trimmed
   */
  applyDurationCap(exercises, focus, params, availableTime = null) {
    const cap = this.getDurationCap(focus, params, availableTime);

    if (this.calculateDuration(exercises) <= cap) return exercises;

    const firstIsWarmup  = exercises.length > 0 && exercises[0].role === "warmup";
    const lastIsCooldown = exercises.length > 0 && exercises[exercises.length - 1].role === "cooldown";

    const protectStart = firstIsWarmup  ? 1 : 0;

    let trimmed = [...exercises];

    // Remove from the last unprotected position until under cap or only 1 main remains
    while (this.calculateDuration(trimmed) > cap) {
      const removeIdx = lastIsCooldown ? trimmed.length - 2 : trimmed.length - 1;
      if (removeIdx < protectStart) break;
      trimmed.splice(removeIdx, 1);
    }

    return trimmed;
  },

  /**
   * Select exercises for a workout.
   * Uses programmeScore weighting when a programme is active.
   *
   * When availableTime is set, exercises whose individual duration exceeds
   * 40% of the declared window are excluded before any selection happens.
   * This prevents a single long exercise filling the entire slot.
   * applyDurationCap() remains as a post-selection safety net for total duration.
   */
  selectExercises(focus, suitableExercises, params, availableTime = null) {
    // Pre-filter: remove exercises too long for the declared window
    const maxExDuration = availableTime
      ? (AVAILABLE_TIME_MAX_EXERCISE_DURATION[availableTime] ?? null)
      : null;

    const pool = maxExDuration
      ? suitableExercises.filter(e => !e.duration || e.duration <= maxExDuration)
      : suitableExercises;

    const selected = [];

    // Warmup
    if (params.includeWarmup) {
      const warmup = this.pickOne(
        pool.filter(e => e.category === "mobility" && e.energyRequired <= 3)
      );
      if (warmup) selected.push({ ...warmup, role: "warmup" });
    }

    // Main focus
    const focusExercises = pool.filter(e => {
      if (params.focusOnRecovery) return e.category === "recovery" || e.category === "mobility";
      return e.category === focus;
    });

    const appropriateEnergy = focusExercises.filter(e => e.energyRequired <= params.maxEnergy);

    // Apply difficulty floor — prefer exercises at or above the floor level.
    // If the floor would leave the pool empty, fall back to the full energy-filtered pool.
    // This ensures the floor is a nudge, never a hard block.
    const floor = params.difficultyFloor || 1;
    const aboveFloor = floor > 1
      ? appropriateEnergy.filter(e => (e.difficultyLevel || 1) >= floor)
      : appropriateEnergy;
    const mainPool = aboveFloor.length >= 2 ? aboveFloor : appropriateEnergy;
    const mainCount = params.exerciseCount - 2;
    let mainExercises;

    if (availableTime) {
      // BUILD-5 undershoot fix (24 Jul 2026). Was: pick exactly mainCount
      // exercises (exerciseCount - 2), full stop — regardless of how short
      // they turned out to be. Real exercise data runs 60-100s for most
      // strength/mobility items, so for "quick" (mainCount = 1) a session
      // routinely landed at 9-19 min against a 20-min declared window: right
      // direction, wrong side, and not a cache/plumbing issue like the
      // earlier finding this session — a genuine gap in this function.
      // This is also where the previously-flagged floor issue lived: for
      // "micro", mainCount = 0, so zero main exercises were ever selected.
      // Fix: fill the main block toward getDurationCap()'s target, one
      // exercise at a time, instead of picking a fixed count up front.
      // mainCount is kept as a floor (always try to reach at least this
      // many, matching the original per-category "how much content is
      // reasonable" intent) and MAIN_FILL_CEILING as a hard sanity max so a
      // very generous window can't produce an unreasonably long list. This
      // also guarantees at least 1 main exercise unconditionally, which
      // resolves the "micro" floor gap as a side effect of the same fix.
      const target = this.getDurationCap(focus, params, availableTime);
      let remaining = mainPool.filter(e => !selected.some(s => s.id === e.id));
      mainExercises = [];

      while (remaining.length > 0 && mainExercises.length < MAIN_FILL_CEILING) {
        const provisional = [...selected, ...mainExercises.map(e => ({ ...e, role: "main" }))];
        const soFar = this.calculateDuration(provisional);
        if (mainExercises.length >= Math.max(mainCount, 1) && soFar >= target) break;

        const next = this.pickOne(remaining);
        if (!next) break;
        mainExercises.push(next);
        remaining = remaining.filter(e => e.id !== next.id);
      }
    } else {
      // Unchanged — no time declared, original fixed-count behaviour.
      mainExercises = this.pickMultiple(mainPool, mainCount, selected);
    }

    mainExercises.forEach(e => selected.push({ ...e, role: "main" }));

    // Accessory (strength focus only)
    if (focus === "strength" && !params.focusOnRecovery) {
      const mobility = this.pickOne(
        pool.filter(e => e.category === "mobility" && !selected.some(s => s.id === e.id))
      );
      if (mobility && selected.length < params.exerciseCount) {
        selected.push({ ...mobility, role: "accessory" });
      }
    }

    // Finisher (cardio focus only)
    if (focus === "cardio" && !params.focusOnRecovery) {
      const cardio = this.pickOne(
        pool.filter(e =>
          e.category === "cardio" &&
          e.energyRequired <= params.maxEnergy &&
          !selected.some(s => s.id === e.id)
        )
      );
      if (cardio && selected.length < params.exerciseCount) {
        selected.push({ ...cardio, role: "finisher" });
      }
    }

    // Cooldown
    if (params.includeCooldown) {
      const cooldown = this.pickOne(
        pool.filter(e =>
          e.category === "recovery" &&
          e.energyRequired <= 2 &&
          !selected.some(s => s.id === e.id)
        )
      );
      if (cooldown) selected.push({ ...cooldown, role: "cooldown" });
    }

    return selected;
  },

  /**
   * Pick one exercise — programme-score weighted when available
   */
  pickOne(exercises) {
    if (!exercises || exercises.length === 0) return null;

    const hasScores = exercises.some(e => e.programmeScore);
    if (hasScores) {
      const totalWeight = exercises.reduce((s, e) => s + (e.programmeScore || 1), 0);
      let rand = Math.random() * totalWeight;
      for (const ex of exercises) {
        rand -= (ex.programmeScore || 1);
        if (rand <= 0) return ex;
      }
    }

    return exercises[Math.floor(Math.random() * exercises.length)];
  },

  /**
   * Pick multiple unique exercises — programme-score weighted
   */
  pickMultiple(exercises, count, alreadySelected = []) {
    const available = exercises.filter(e => !alreadySelected.some(s => s.id === e.id));
    const hasScores = available.some(e => e.programmeScore);

    if (hasScores) {
      const weighted = available.map(e => ({
        ex:   e,
        sort: Math.random() * (e.programmeScore || 1)
      }));
      weighted.sort((a, b) => b.sort - a.sort);
      return weighted.slice(0, count).map(w => w.ex);
    }

    return [...available].sort(() => Math.random() - 0.5).slice(0, count);
  },

  /**
   * Calculate total workout duration in minutes.
   * This is the single source of truth used by both generateWorkout()
   * and applyDurationCap() — they must remain in sync.
   */
  calculateDuration(exercises) {
    let totalSeconds = 0;

    exercises.forEach(exercise => {
      if (exercise.duration) {
        const sets = exercise.sets || 1;
        const rest = exercise.rest || 30;
        totalSeconds += (exercise.duration * sets) + (rest * (sets - 1));
      } else if (exercise.reps) {
        const sets = exercise.sets || 3;
        const reps = exercise.reps || 10;
        const rest = exercise.rest || 45;
        totalSeconds += (reps * 4 * sets) + (rest * (sets - 1));
      }
      if (exercise.perSide) totalSeconds *= 2;
    });

    return Math.round(totalSeconds / 60);
  },

  /**
   * Generate rationale — daily context lines + strategic connection line.
   * Daily adaptation lines are unchanged from v1.0.
   * Cycle-aware line added when cyclePhase is active (v1.6).
   * Strategic line is appended when a programme is active (v1.1).
   *
   * v1.9: strategic connection line guarded — programmeEngine.getStrategicRationale
   * does not exist in programmeEngine.js. See v1.9 changelog above. Silently
   * omitted rather than thrown, consistent with the "programme adds a bias,
   * not a command" principle already stated at the top of this file.
   */
  generateRationale(focus, intensity, burnout, cyclePhase = null, goalProfile = null) {
    const checkin = checkinData.getTodaysCheckin();
    const parts   = [];

    if (checkin) {
      if (checkin.energy <= 3) {
        parts.push("Your energy is low today, so I have kept things gentle.");
      } else if (checkin.energy >= 7) {
        parts.push("You have got good energy — perfect for making progress.");
      } else {
        parts.push("Based on your energy level, this should feel manageable.");
      }
    }

    if (burnout.level === "high") {
      parts.push("I have noticed you have been struggling recently. Today is about recovery, not pushing.");
    } else if (burnout.level === "moderate") {
      parts.push("Let us take it a bit easier — your body needs some care.");
    }

    // ── Cycle phase coach line ──────────────────────────────────────────────
    if (cyclePhase) {
      const cycleMessages = {
        "menstruation": "You are in your menstrual phase — I have kept intensity low and focused on gentle movement. Rest is productive right now.",
        "follicular":   "You are in your follicular phase — energy tends to build through this period. Good time for steady progress.",
        "ovulation":    "You are around ovulation — energy is typically at its peak right now. I have reflected that in today's options.",
        "luteal":       "You are in your luteal phase — I have kept intensity moderate. Steady, consistent effort works well here."
      };
      const msg = cycleMessages[cyclePhase];
      if (msg) parts.push(msg);
    }

    // ── Goal-aware coach line (v1.7) ─────────────────────────────────────────
    // Connects today's session to the user's stated goal.
    // Only shown when not in burnout recovery mode.
    if (goalProfile && burnout.level !== "high") {
      if (goalProfile.wantsWeightLoss && focus === "cardio") {
        parts.push("Cardio is one of the most effective tools for your weight goal — I have made sure today's session works hard for you.");
      } else if (goalProfile.wantsWeightLoss && focus === "strength") {
        parts.push("Strength work builds the muscle that keeps your metabolism working for you — this session supports your weight goal even without being a cardio session.");
      } else if (goalProfile.wantsCardio && focus === "cardio") {
        parts.push("This is exactly what builds the cardiovascular fitness you are working towards.");
      } else if (goalProfile.wantsStrength && focus === "strength") {
        parts.push("Every session like this one moves you closer to the strength you are building.");
      }
    }

    const focusExplanations = {
      strength: "Building strength helps protect your joints and improves daily function.",
      mobility: "Mobility work reduces stiffness and helps prevent injury.",
      cardio:   "Cardio improves heart health and energy levels over time."
    };
    if (focusExplanations[focus]) parts.push(focusExplanations[focus]);

    if (checkin?.sleepQuality === "poor") {
      parts.push("I have adjusted for your poor sleep last night.");
    }

    // Strategic connection line (v1.1) — v1.9: guarded, see changelog above.
    if (typeof programmeEngine.getStrategicRationale === "function") {
      const strategicLine = programmeEngine.getStrategicRationale(focus);
      if (strategicLine) parts.push(strategicLine);
    }

    return parts.join(" ");
  },

  getWorkoutName(focus) {
    return { strength: "Strength Focus", mobility: "Mobility & Recovery", cardio: "Cardio Boost" }[focus] || "Workout";
  },

  getWorkoutIcon(focus) {
    return { strength: "💪", mobility: "🧘", cardio: "❤️" }[focus] || "🏃";
  },

};
