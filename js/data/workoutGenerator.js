/**
 * workoutGenerator.js - Workout Generation Engine
 * Creates 3 daily workout options based on user profile and check-in
 */

import { store } from '../store.js';
import { checkinData } from './checkin.js';
import { 
  EXERCISES, 
  getSuitableExercises, 
  getExercisesByCategory,
  filterByEquipment,
  filterByConditions,
  filterByEnergy
} from './exercises.js';

export const workoutGenerator = {
  
  /**
   * Generate today's 3 workout options
   */
  generateDailyOptions() {
    const profile = this.getUserProfile();
    const todaysCheckin = checkinData.getTodaysCheckin();
    const intensity = store.get('todayIntensity') || 'moderate';
    const burnout = checkinData.detectBurnout();
    
    // Get suitable exercises
    const suitable = getSuitableExercises(profile, todaysCheckin);
    
    // Generate 3 different workout focuses
    const options = [
      this.generateWorkout('strength', suitable, intensity, burnout),
      this.generateWorkout('mobility', suitable, intensity, burnout),
      this.generateWorkout('cardio', suitable, intensity, burnout)
    ];
    
    // Store generated workouts
    store.set('todaysWorkouts', options);
    store.set('workoutsGeneratedAt', new Date().toISOString());
    
    return options;
  },
  
  /**
   * Get user profile data for filtering
   */
  getUserProfile() {
    return {
      equipment: store.get('equipment') || [],
      conditions: store.get('conditions') || [],
      goals: store.get('goals') || [],
      fitnessLevel: store.get('activityLevel') || 'moderate'
    };
  },
  
  /**
   * Generate a single workout with specific focus
   */
  generateWorkout(focus, suitableExercises, intensity, burnout) {
    // Determine workout parameters based on intensity
    const params = this.getWorkoutParams(intensity, burnout);
    
    // Select exercises for this workout
    const exercises = this.selectExercises(focus, suitableExercises, params);
    
    // Calculate total duration
    const totalDuration = this.calculateDuration(exercises);
    
    // Generate rationale
    const rationale = this.generateRationale(focus, intensity, burnout);
    
    return {
      id: `workout-${focus}-${Date.now()}`,
      focus: focus,
      name: this.getWorkoutName(focus),
      icon: this.getWorkoutIcon(focus),
      duration: totalDuration,
      exerciseCount: exercises.length,
      exercises: exercises,
      intensity: intensity,
      rationale: rationale,
      totalCredits: exercises.reduce((sum, e) => sum + (e.credits || 30), 0)
    };
  },
  
  /**
   * Get workout parameters based on intensity
   */
  getWorkoutParams(intensity, burnout) {
    // If burnout detected, override to recovery
    if (burnout.level === 'high') {
      return {
        exerciseCount: 4,
        maxEnergy: 3,
        includeWarmup: true,
        includeCooldown: true,
        focusOnRecovery: true
      };
    }
    
    const params = {
      recovery: {
        exerciseCount: 4,
        maxEnergy: 3,
        includeWarmup: true,
        includeCooldown: true,
        focusOnRecovery: true
      },
      gentle: {
        exerciseCount: 5,
        maxEnergy: 5,
        includeWarmup: true,
        includeCooldown: true,
        focusOnRecovery: false
      },
      moderate: {
        exerciseCount: 6,
        maxEnergy: 7,
        includeWarmup: true,
        includeCooldown: true,
        focusOnRecovery: false
      },
      challenging: {
        exerciseCount: 7,
        maxEnergy: 10,
        includeWarmup: true,
        includeCooldown: true,
        focusOnRecovery: false
      }
    };
    
    return params[intensity] || params.moderate;
  },
  
  /**
   * Select exercises for a workout
   */
  selectExercises(focus, suitableExercises, params) {
    const selected = [];
    
    // Always start with a warmup mobility exercise
    if (params.includeWarmup) {
      const warmup = this.pickOne(
        suitableExercises.filter(e => 
          e.category === 'mobility' && e.energyRequired <= 3
        )
      );
      if (warmup) {
        selected.push({ ...warmup, role: 'warmup' });
      }
    }
    
    // Get main focus exercises
    const focusExercises = suitableExercises.filter(e => {
      if (params.focusOnRecovery) {
        return e.category === 'recovery' || e.category === 'mobility';
      }
      return e.category === focus;
    });
    
    // Filter by max energy
    const appropriateEnergy = focusExercises.filter(e => 
      e.energyRequired <= params.maxEnergy
    );
    
    // Pick main exercises (avoiding duplicates)
    const mainCount = params.exerciseCount - 2; // Reserve for warmup + cooldown
    const mainExercises = this.pickMultiple(appropriateEnergy, mainCount, selected);
    mainExercises.forEach(e => {
      selected.push({ ...e, role: 'main' });
    });
    
    // Add complementary exercises if strength focus
    if (focus === 'strength' && !params.focusOnRecovery) {
      // Try to add one mobility exercise for balance
      const mobility = this.pickOne(
        suitableExercises.filter(e => 
          e.category === 'mobility' && 
          !selected.some(s => s.id === e.id)
        )
      );
      if (mobility && selected.length < params.exerciseCount) {
        selected.push({ ...mobility, role: 'accessory' });
      }
    }
    
    // Add cardio finisher if cardio focus
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
    
    // Always end with cooldown/recovery
    if (params.includeCooldown) {
      const cooldown = this.pickOne(
        suitableExercises.filter(e => 
          e.category === 'recovery' && 
          e.energyRequired <= 2 &&
          !selected.some(s => s.id === e.id)
        )
      );
      if (cooldown) {
        selected.push({ ...cooldown, role: 'cooldown' });
      }
    }
    
    return selected;
  },
  
  /**
   * Pick one random exercise from array
   */
  pickOne(exercises) {
    if (!exercises || exercises.length === 0) return null;
    return exercises[Math.floor(Math.random() * exercises.length)];
  },
  
  /**
   * Pick multiple unique exercises
   */
  pickMultiple(exercises, count, alreadySelected = []) {
    const available = exercises.filter(e => 
      !alreadySelected.some(s => s.id === e.id)
    );
    
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },
  
  /**
   * Calculate total workout duration in minutes
   */
  calculateDuration(exercises) {
    let totalSeconds = 0;
    
    exercises.forEach(exercise => {
      if (exercise.duration) {
        // Timed exercise
        const sets = exercise.sets || 1;
        const rest = exercise.rest || 30;
        totalSeconds += (exercise.duration * sets) + (rest * (sets - 1));
      } else if (exercise.reps) {
        // Rep-based exercise (estimate ~4 seconds per rep)
        const sets = exercise.sets || 3;
        const reps = exercise.reps || 10;
        const rest = exercise.rest || 45;
        totalSeconds += (reps * 4 * sets) + (rest * (sets - 1));
      }
      
      // Add per-side time if applicable
      if (exercise.perSide) {
        totalSeconds *= 2;
      }
    });
    
    return Math.round(totalSeconds / 60);
  },
  
  /**
   * Generate rationale for workout
   */
  generateRationale(focus, intensity, burnout) {
    const checkin = checkinData.getTodaysCheckin();
    const parts = [];
    
    // Energy-based
    if (checkin) {
      if (checkin.energy <= 3) {
        parts.push('Your energy is low today, so I\'ve kept things gentle.');
      } else if (checkin.energy >= 7) {
        parts.push('You\'ve got good energy - perfect for making progress.');
      } else {
        parts.push('Based on your energy level, this should feel manageable.');
      }
    }
    
    // Burnout warning
    if (burnout.level === 'high') {
      parts.push('I\'ve noticed you\'ve been struggling recently. Today is about recovery, not pushing.');
    } else if (burnout.level === 'moderate') {
      parts.push('Let\'s take it a bit easier - your body needs some care.');
    }
    
    // Focus explanation
    const focusExplanations = {
      strength: 'Building strength helps protect your joints and improves daily function.',
      mobility: 'Mobility work reduces stiffness and helps prevent injury.',
      cardio: 'Cardio improves heart health and energy levels over time.'
    };
    
    if (focusExplanations[focus]) {
      parts.push(focusExplanations[focus]);
    }
    
    // Sleep factor
    if (checkin?.sleepQuality === 'poor') {
      parts.push('I\'ve adjusted for your poor sleep last night.');
    }
    
    return parts.join(' ');
  },
  
  /**
   * Get workout display name
   */
  getWorkoutName(focus) {
    const names = {
      strength: 'Strength Focus',
      mobility: 'Mobility & Recovery',
      cardio: 'Cardio Boost'
    };
    return names[focus] || 'Workout';
  },
  
  /**
   * Get workout icon
   */
  getWorkoutIcon(focus) {
    const icons = {
      strength: '💪',
      mobility: '🧘',
      cardio: '❤️'
    };
    return icons[focus] || '🏃';
  },
  
  /**
   * Check if we need to regenerate workouts
   */
  needsRegeneration() {
    const generatedAt = store.get('workoutsGeneratedAt');
    if (!generatedAt) return true;
    
    const generated = new Date(generatedAt);
    const now = new Date();
    
    // Regenerate if different day or check-in has changed
    return generated.toDateString() !== now.toDateString();
  },
  
  /**
   * Get today's workouts (generate if needed)
   */
  getTodaysWorkouts() {
    if (this.needsRegeneration()) {
      return this.generateDailyOptions();
    }
    return store.get('todaysWorkouts') || this.generateDailyOptions();
  }
};
