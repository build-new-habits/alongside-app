/**
 * workoutGenerator.js - Workout Generation Engine
 * Creates 3 daily workout options based on user profile and check-in
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
import { programmeEngine } from "./programmeEngine.js";
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

export const workoutGenerator = {

  /**
   * Generate today's 3 workout options
   */
  generateDailyOptions() {
    const profile   = this.getUserProfile();
    const checkin   = checkinData.getTodaysCheckin();
    const intensity = store.get("todayIntensity") || "moderate";
    const burnout   = checkinData.detectBurnout();

    // Build checkin data object for the filter engine.
    // painScores comes from store (written at check-in submission) so
    // the filter gets phase-aware condition resolution even if the workout
    // is regenerated later in the day without a fresh check-in.
    const checkinForFilter = {
      energy:       checkin?.energy        || 5,
      recoveryMode: burnout.level === "high",
      painScores:   store.get("conditionPainScores") || {}
    };

    // Get filtered exercise pool (unchanged from v1.0 calling convention)
    const suitable = getSuitableExercises(profile, checkinForFilter);

    // Apply programme phase bias to the pool (new in v1.1)
    const biasedPool = this.applyProgrammeBias(suitable);

    // Determine focus order based on programme phase (or default order)
    const [focus1, focus2, focus3] = this.getWorkoutFocusOrder();

    const options = [
      this.generateWorkout(focus1, biasedPool, intensity, burnout),
      this.generateWorkout(focus2, biasedPool, intensity, burnout),
      this.generateWorkout(focus3, biasedPool, intensity, burnout)
    ];

    store.set("todaysWorkouts", options);
    store.set("workoutsGeneratedAt", new Date().toISOString());

    return options;
  },

  /**
   * Get user profile data for the filter engine.
   * conditionPainScores is passed separately via checkinForFilter.
   */
  getUserProfile() {
    return {
      equipment:    store.get("equipment")    || [],
      conditions:   store.get("conditions")   || [],
      goals:        store.get("goals")        || [],
      fitnessLevel: store.get("activityLevel") || "moderate"
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
  generateWorkout(focus, suitableExercises, intensity, burnout) {
    const availableTime = store.get("availableTime") || null;
    const params        = this.getWorkoutParams(intensity, burnout, availableTime);
    const exercises     = this.selectExercises(focus, suitableExercises, params, availableTime);
    const capped        = this.applyDurationCap(exercises, focus, params);
    const duration      = this.calculateDuration(capped);
    const rationale     = this.generateRationale(focus, intensity, burnout);

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
   * Workout parameters by intensity level, with optional availableTime override.
   *
   * Priority rules:
   *   1. Burnout — overrides everything; returns Recovery Mode params.
   *   2. availableTime — if set, drives exerciseCount via lookup table.
   *   3. Intensity — always drives maxEnergy, warmup/cooldown, focusOnRecovery.
   *      Also drives exerciseCount when availableTime is null.
   *
   * @param {string}      intensity     - "recovery" | "gentle" | "moderate" | "challenging"
   * @param {object}      burnout       - result of checkinData.detectBurnout()
   * @param {string|null} availableTime - store value: "micro"|"quick"|"short"|"standard"|"long"|"open"|null
   * @returns {object} params
   */
  getWorkoutParams(intensity, burnout, availableTime) {
    // ── 1. Burnout override — highest priority ────────────────────────────────
    if (burnout.level === "high") {
      return {
        exerciseCount:   4,
        maxEnergy:       3,
        includeWarmup:   true,
        includeCooldown: true,
        focusOnRecovery: true
      };
    }

    // ── 2. Intensity-derived base params ──────────────────────────────────────
    const intensityParams = {
      recovery:    { exerciseCount: 4, maxEnergy: 3,  includeWarmup: true, includeCooldown: true, focusOnRecovery: true  },
      gentle:      { exerciseCount: 5, maxEnergy: 5,  includeWarmup: true, includeCooldown: true, focusOnRecovery: false },
      moderate:    { exerciseCount: 6, maxEnergy: 7,  includeWarmup: true, includeCooldown: true, focusOnRecovery: false },
      challenging: { exerciseCount: 7, maxEnergy: 10, includeWarmup: true, includeCooldown: true, focusOnRecovery: false }
    };

    const base = intensityParams[intensity] || intensityParams.moderate;

    // ── 3. availableTime overrides exerciseCount only ─────────────────────────
    // Intensity still owns maxEnergy, includeWarmup, includeCooldown, focusOnRecovery.
    const timeCount  = availableTime ? (AVAILABLE_TIME_COUNT[availableTime] ?? null) : null;
    const finalCount = timeCount !== null ? timeCount : base.exerciseCount;

    return {
      ...base,
      exerciseCount: finalCount
    };
  },

  /**
   * Trim exercises to fit within the maxDuration cap for this focus type.
   * Warmup (role: "warmup") and cooldown (role: "cooldown") are always protected.
   * Main and accessory/finisher exercises are trimmed from the end of the
   * middle block until duration is within the cap, or only 1 main exercise remains.
   *
   * @param {Array}  exercises - selected exercise list from selectExercises()
   * @param {string} focus     - workout focus type
   * @param {object} params    - result of getWorkoutParams()
   * @returns {Array} exercises, potentially trimmed
   */
  applyDurationCap(exercises, focus, params) {
    const cap = params.focusOnRecovery
      ? MAX_DURATION_BY_FOCUS.recovery
      : (MAX_DURATION_BY_FOCUS[focus] ?? MAX_DURATION_FALLBACK);

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
    const mainCount         = params.exerciseCount - 2;
    const mainExercises     = this.pickMultiple(appropriateEnergy, mainCount, selected);
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
   * Strategic line is appended when a programme is active.
   */
  generateRationale(focus, intensity, burnout) {
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

    const focusExplanations = {
      strength: "Building strength helps protect your joints and improves daily function.",
      mobility: "Mobility work reduces stiffness and helps prevent injury.",
      cardio:   "Cardio improves heart health and energy levels over time."
    };
    if (focusExplanations[focus]) parts.push(focusExplanations[focus]);

    if (checkin?.sleepQuality === "poor") {
      parts.push("I have adjusted for your poor sleep last night.");
    }

    // Strategic connection line (v1.1)
    const strategicLine = programmeEngine.getStrategicRationale(focus);
    if (strategicLine) parts.push(strategicLine);

    return parts.join(" ");
  },

  getWorkoutName(focus) {
    return { strength: "Strength Focus", mobility: "Mobility & Recovery", cardio: "Cardio Boost" }[focus] || "Workout";
  },

  getWorkoutIcon(focus) {
    return { strength: "💪", mobility: "🧘", cardio: "❤️" }[focus] || "🏃";
  },

  needsRegeneration() {
    const generatedAt = store.get("workoutsGeneratedAt");
    if (!generatedAt) return true;
    return new Date(generatedAt).toDateString() !== new Date().toDateString();
  },

  getTodaysWorkouts() {
    if (this.needsRegeneration()) return this.generateDailyOptions();
    return store.get("todaysWorkouts") || this.generateDailyOptions();
  }
};
