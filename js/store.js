/**
 * store.js - Data persistence layer
 * Handles localStorage with simple get/set API
 *
 * v1.1 — Strategic layer additions:
 *   strategicGoal   — user's primary goal with target details
 *   activeProgramme — which plan they're on + current week/phase
 *   progressLog     — session history for the progress dashboard
 */

export const store = {

  STORAGE_KEY: 'alongside_user',
  data: null,

  init() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.data = this.mergeWithDefaults(parsed);
      } else {
        this.data = this.getDefaults();
      }
    } catch (e) {
      console.error('Store: Error loading data', e);
      this.data = this.getDefaults();
    }
    console.log('📦 Store initialised');
  },

  /**
   * Merge saved data with defaults so new schema fields appear
   * for users who onboarded before the strategic layer was added
   */
  mergeWithDefaults(saved) {
    const defaults = this.getDefaults();
    return {
      ...defaults,
      ...saved,
      lifestyle:       { ...defaults.lifestyle,       ...(saved.lifestyle       || {}) },
      strategicGoal:   { ...defaults.strategicGoal,   ...(saved.strategicGoal   || {}) },
      activeProgramme: { ...defaults.activeProgramme, ...(saved.activeProgramme || {}) },
      progressLog:     Array.isArray(saved.progressLog) ? saved.progressLog : [],
    };
  },

  getDefaults() {
    return {
      // ONBOARDING
      onboardingComplete: false,
      onboardingStep: 1,

      // PROFILE — Step 2
      name: '',

      // ABOUT — Step 3
      age: null,
      gender: null,
      hormonalTracking: false,

      // BODY & TARGETS — Step 4
      weight: null,
      weightUnit: 'kg',
      targetWeight: null,
      targetDate: null,
      targetDescription: '',

      // GOALS — Step 5
      // Flat array of goal IDs — used by exercise filter engine
      goals: [],

      // CONDITIONS — Step 6
      conditions: [],

      // LIFESTYLE — Step 7
      lifestyle: {
        activityLevel: null,
        stressLevel: null,
        sleepQuality: null
      },

      // EQUIPMENT — Step 8
      equipment: [],

      // STRATEGIC GOAL
      // Richer than goals[] — drives programme selection and rationale.
      // goals[] still drives daily exercise filtering (unchanged).
      strategicGoal: {
        primaryGoal:         null,  // goal ID e.g. 'lose-weight'
        targetDescription:   '',    // plain text e.g. "Look great for holiday"
        targetDate:          null,  // ISO date string
        targetValue:         null,  // numeric e.g. 168
        targetUnit:          null,  // 'lbs' | 'kg' | 'km' | 'miles' | null
        weeklySessionTarget: 3,     // sessions per week commitment
        setAt:               null   // ISO timestamp
      },

      // ACTIVE PROGRAMME
      activeProgramme: {
        programmeId:      null,   // e.g. 'beginner-fitness'
        programmeName:    '',     // display name
        startDate:        null,   // ISO date string
        currentWeek:      1,      // 1-12
        currentPhase:     null,   // 'build' | 'push' | 'peak' | 'recovery'
        sessionsThisWeek: 0,      // resets each Monday
        totalSessions:    0,      // lifetime on this programme
        milestones:       [],     // [{ id, label, achievedAt }]
        completed:        false,
        completedAt:      null
      },

      // PROGRESS LOG — one entry per completed session, max 90
      // { date, week, phase, focus, energyAtCheckin, conditionScores,
      //   durationMinutes, exerciseCount, milestoneAchieved }
      progressLog: [],

      // METADATA
      createdAt: null,
      updatedAt: null
    };
  },

  get(path) {
    if (!this.data) this.init();
    if (!path) return this.data;
    const keys = path.split('.');
    let value = this.data;
    for (const key of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[key];
    }
    return value;
  },

  set(path, value) {
    if (!path) return;
    const keys = path.split('.');
    let obj = this.data;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!obj[key]) obj[key] = {};
      obj = obj[key];
    }
    obj[keys[keys.length - 1]] = value;
    this.data.updatedAt = new Date().toISOString();
    this.save();
  },

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Store: Error saving data', e);
    }
  },

  reset() {
    this.data = this.getDefaults();
    this.save();
    console.log('📦 Store reset');
  },

  isOnboardingComplete() {
    return this.data.onboardingComplete === true;
  },

  hasActiveProgramme() {
    return !!(this.data.activeProgramme?.programmeId);
  },

  completeOnboarding() {
    this.data.onboardingComplete = true;
    this.data.createdAt = this.data.createdAt || new Date().toISOString();
    this.save();
  },

  /**
   * Log a completed session — called from workout-complete view
   */
  logSession(sessionData) {
    const log = [...(this.data.progressLog || [])];
    log.push({
      date:              new Date().toISOString(),
      week:              this.data.activeProgramme?.currentWeek  || 0,
      phase:             this.data.activeProgramme?.currentPhase || null,
      focus:             sessionData.focus             || null,
      energyAtCheckin:   sessionData.energy            || null,
      conditionScores:   sessionData.conditionScores   || [],
      durationMinutes:   sessionData.durationMinutes   || 0,
      exerciseCount:     sessionData.exerciseCount      || 0,
      milestoneAchieved: sessionData.milestoneAchieved || null
    });
    if (log.length > 90) log.splice(0, log.length - 90);
    this.data.progressLog = log;
    this.data.updatedAt = new Date().toISOString();
    this.save();
  }
};
