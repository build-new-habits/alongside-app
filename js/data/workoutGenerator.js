/**
 * workoutGenerator.js - Workout Generation Engine
 * Creates 3 daily workout options based on user profile and check-in
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
 */

import { store }           from '../store.js';
import { checkinData }     from './checkin.js';
import { programmeEngine } from './programmeEngine.js';
import {
  getSuitableExercises,
} from './exercises.js';

export const workoutGenerator = {

  /**
   * Generate today's 3 workout options
   */
  generateDailyOptions() {
    const profile   = this.getUserProfile();
    const checkin   = checkinData.getTodaysCheckin();
    const intensity = store.get('todayIntensity') || 'moderate';
    const burnout   = checkinData.detectBurnout();

    // Build checkin data object for the filter engine.
    // painScores comes from store (written at check-in submission) so
    // the filter gets phase-aware condition resolution even if the workout
    // is regenerated later in the day without a fresh check-in.
    const checkinForFilter = {
      energy:       checkin?.energy        || 5,
      recoveryMode: burnout.level === 'high',
      painScores:   store.get('conditionPainScores') || {}
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

    store.set('todaysWorkouts', options);
    store.set('workoutsGeneratedAt', new Date().toISOString());

    return options;
  },

  /**
   * Get user profile data for the filter engine.
   * conditionPainScores is passed separately via checkinForFilter.
   */
  getUserProfile() {
    return {
      equipment:    store.get('equipment')    || [],
      conditions:   store.get('conditions')   || [],
      goals:        store.get('goals')        || [],
      fitnessLevel: store.get('activityLevel') || 'moderate'
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
      return ['strength', 'mobility', 'cardio'];
    }

    const all     = ['strength', 'mobility', 'cardio'];
    const primary = bias.primaryFocus   === 'strength' ? 'strength'
                  : bias.primaryFocus   === 'cardio'   ? 'cardio'
                  : 'mobility';
    const rest    = all.filter(f => f !== primary);
    return [primary, ...rest];
  },

  /**
   * Generate a single workout with a specific focus
   */
  generateWorkout(focus, suitableExercises, intensity, burnout) {
    const params    = this.getWorkoutParams(intensity, burnout);
    const exercises = this.selectExercises(focus, suitableExercises, params);
    const duration  = this.calculateDuration(exercises);
    const rationale = this.generateRationale(focus, intensity, burnout);

    return {
      id:            `workout-${focus}-${Date.now()}`,
      focus,
      name:          this.getWorkoutName(focus),
      icon:          this.getWorkoutIcon(focus),
      duration,
      exerciseCount: exercises.length,
      exercises,
      intensity,
      rationale,
      totalCredits:  exercises.reduce((sum, e) => sum + (e.credits || 30), 0)
    };
  },

  /**
   * Workout parameters by intensity level.
   * Burnout overrides everything — Recovery Mode.
   */
  getWorkoutParams(intensity, burnout) {
    if (burnout.level === 'high') {
      return { exerciseCount: 4, maxEnergy: 3, includeWarmup: true, includeCooldown: true, focusOnRecovery: true };
    }

    const params = {
      recovery:    { exerciseCount: 4, maxEnergy: 3,  includeWarmup: true, includeCooldown: true, focusOnRecovery: true  },
      gentle:      { exerciseCount: 5, maxEnergy: 5,  includeWarmup: true, includeCooldown: true, focusOnRecovery: false },
      moderate:    { exerciseCount: 6, maxEnergy: 7,  includeWarmup: true, includeCooldown: true, focusOnRecovery: false },
      challenging: { exerciseCount: 7, maxEnergy: 10, includeWarmup: true, includeCooldown: true, focusOnRecovery: false }
    };

    return params[intensity] || params.moderate;
  },

  /**
   * Select exercises for a workout.
   * Uses programmeScore weighting when a programme is active.
   */
  selectExercises(focus, suitableExercises, params) {
    const selected = [];

    // Warmup
    if (params.includeWarmup) {
      const warmup = this.pickOne(
        suitableExercises.filter(e => e.category === 'mobility' && e.energyRequired <= 3)
      );
      if (warmup) selected.push({ ...warmup, role: 'warmup' });
    }

    // Main focus
    const focusExercises = suitableExercises.filter(e => {
      if (params.focusOnRecovery) return e.category === 'recovery' || e.category === 'mobility';
      return e.category === focus;
    });

    const appropriateEnergy = focusExercises.filter(e => e.energyRequired <= params.maxEnergy);
    const mainCount         = params.exerciseCount - 2;
    const mainExercises     = this.pickMultiple(appropriateEnergy, mainCount, selected);
    mainExercises.forEach(e => selected.push({ ...e, role: 'main' }));

    // Accessory (strength focus only)
    if (focus === 'strength' && !params.focusOnRecovery) {
      const mobility = this.pickOne(
        suitableExercises.filter(e => e.category === 'mobility' && !selected.some(s => s.id === e.id))
      );
      if (mobility && selected.length < params.exerciseCount) {
        selected.push({ ...mobility, role: 'accessory' });
      }
    }

    // Finisher (cardio focus only)
    if (focus === 'cardio' && !params.focusOnRecovery) {
      const cardio = this.pickOne(
        suitableExercises.filter(e =>
          e.category === 'cardio' &&
          e.energyRequired <= params.maxEnergy &&
          !selected.some(s => s.id === e.id)
        )
      );
      if (cardio && selected.length < params.exerciseCount) {
        selected.push({ ...cardio, role: 'finisher' });
      }
    }

    // Cooldown
    if (params.includeCooldown) {
      const cooldown = this.pickOne(
        suitableExercises.filter(e =>
          e.category === 'recovery' &&
          e.energyRequired <= 2 &&
          !selected.some(s => s.id === e.id)
        )
      );
      if (cooldown) selected.push({ ...cooldown, role: 'cooldown' });
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
   * Calculate total workout duration in minutes
   */
  calculateDuration(exercises) {
    let totalSeconds = 0;

    exercises.forEach(exercise => {
      let exerciseSeconds = 0;
      if (exercise.duration) {
        const sets = exercise.sets || 1;
        const rest = exercise.rest || 30;
        exerciseSeconds = (exercise.duration * sets) + (rest * (sets - 1));
      } else if (exercise.reps) {
        const sets = exercise.sets || 3;
        const reps = exercise.reps || 10;
        const rest = exercise.rest || 45;
        exerciseSeconds = (reps * 4 * sets) + (rest * (sets - 1));
      }
      // perSide doubles THIS exercise only — not the running total
      if (exercise.perSide) exerciseSeconds *= 2;
      totalSeconds += exerciseSeconds;
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
        parts.push("Your energy is low today, so I've kept things gentle.");
      } else if (checkin.energy >= 7) {
        parts.push("You've got good energy — perfect for making progress.");
      } else {
        parts.push("Based on your energy level, this should feel manageable.");
      }
    }

    if (burnout.level === 'high') {
      parts.push("I've noticed you've been struggling recently. Today is about recovery, not pushing.");
    } else if (burnout.level === 'moderate') {
      parts.push("Let's take it a bit easier — your body needs some care.");
    }

    const focusExplanations = {
      strength: 'Building strength helps protect your joints and improves daily function.',
      mobility: 'Mobility work reduces stiffness and helps prevent injury.',
      cardio:   'Cardio improves heart health and energy levels over time.'
    };
    if (focusExplanations[focus]) parts.push(focusExplanations[focus]);

    if (checkin?.sleepQuality === 'poor') {
      parts.push("I've adjusted for your poor sleep last night.");
    }

    // Strategic connection line (v1.1)
    const strategicLine = programmeEngine.getStrategicRationale(focus);
    if (strategicLine) parts.push(strategicLine);

    return parts.join(' ');
  },

  getWorkoutName(focus) {
    return { strength: 'Strength Focus', mobility: 'Mobility & Recovery', cardio: 'Cardio Boost' }[focus] || 'Workout';
  },

  getWorkoutIcon(focus) {
    return { strength: '💪', mobility: '🧘', cardio: '❤️' }[focus] || '🏃';
  },

  needsRegeneration() {
    const generatedAt = store.get('workoutsGeneratedAt');
    if (!generatedAt) return true;
    return new Date(generatedAt).toDateString() !== new Date().toDateString();
  },

  getTodaysWorkouts() {
    if (this.needsRegeneration()) return this.generateDailyOptions();
    return store.get('todaysWorkouts') || this.generateDailyOptions();
  }
};
