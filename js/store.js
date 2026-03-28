/**
 * store.js - Data persistence layer
 * Handles localStorage with simple get/set API
 *
 * v1.5 — Condition management additions:
 *   conditionStatus   — { [conditionId]: 'active' | 'paused' }
 *                       Allows conditions to be suspended from workout
 *                       filtering without deleting them from history.
 *   conditionStories  — { [conditionId]: { howLong, whatHelps, professional } }
 *                       Optional user-authored context per condition.
 *                       Not used by generator -- for user reference only.
 *
 * v1.4 — coachStyle scalar string added to getDefaults() and mergeWithDefaults().
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
   * for users who onboarded before this version was deployed.
   * Existing data is never overwritten — only missing keys are filled.
   */
  mergeWithDefaults(saved) {
    const defaults = this.getDefaults();
    return {
      ...defaults,
      ...saved,
      lifestyle:            { ...defaults.lifestyle,            ...(saved.lifestyle            || {}) },
      strategicGoal:        { ...defaults.strategicGoal,        ...(saved.strategicGoal        || {}) },
      activeProgramme:      { ...defaults.activeProgramme,      ...(saved.activeProgramme      || {}) },
      progressLog:          Array.isArray(saved.progressLog)    ? saved.progressLog    : [],
      prescribedExercises:  Array.isArray(saved.prescribedExercises) ? saved.prescribedExercises : [],
      conditionPainScores:  (saved.conditionPainScores && typeof saved.conditionPainScores === 'object')
                              ? saved.conditionPainScores
                              : {},
      conditionStatus:      (saved.conditionStatus && typeof saved.conditionStatus === 'object')
                              ? saved.conditionStatus
                              : {},
      conditionStories:     (saved.conditionStories && typeof saved.conditionStories === 'object')
                              ? saved.conditionStories
                              : {},
    };
  },

  getDefaults() {
    return {
      // ── ONBOARDING ───────────────────────────────────────────
      onboardingComplete: false,
      onboardingStep: 1,

      // ── PROFILE — Step 2 ─────────────────────────────────────
      name: '',

      // ── ABOUT — Step 3 ───────────────────────────────────────
      age: null,
      gender: null,
      hormonalTracking: false,

      // ── BODY & TARGETS — Step 4 ──────────────────────────────
      weight: null,
      weightUnit: 'kg',
      targetWeight: null,
      targetDate: null,
      targetDescription: '',

      // ── GOALS — Step 5 ───────────────────────────────────────
      // Flat array of goal IDs — drives exercise filter engine
      goals: [],

      // ── CONDITIONS — Step 6 ──────────────────────────────────
      // Flat array of condition IDs selected during onboarding.
      // Phase variants (acute/subacute) are derived at runtime from
      // conditionPainScores — never stored directly.
      conditions: [],

      // Today's pain scores per condition — updated at each check-in.
      // { [conditionId]: 0-10 }
      // Used by getActiveConditionIds() to resolve phase variants.
      conditionPainScores: {},

      // ── CONDITION STATUS ─────────────────────────────────────
      // Per-condition active/paused state managed from Settings.
      // Pausing a condition suspends its effect on workout filtering
      // without removing it from the conditions[] history.
      // { [conditionId]: 'active' | 'paused' }
      // Defaults to 'active' for any condition not present in this map.
      conditionStatus: {},

      // ── CONDITION STORIES ────────────────────────────────────
      // Optional context the user adds about each condition.
      // Captured in Settings > Conditions tab.
      // Not used by the workout generator — purely for user reference
      // and future coach personalisation.
      // Schema (per entry):
      //   howLong:      string  — e.g. "About 6 months"
      //   whatHelps:    string  — e.g. "Heat, gentle movement"
      //   professional: string  — e.g. "Physio at Taunton MSK"
      // { [conditionId]: { howLong, whatHelps, professional } }
      conditionStories: {},

      // ── LIFESTYLE — Step 7 ───────────────────────────────────
      lifestyle: {
        activityLevel: null,
        stressLevel: null,
        sleepQuality: null
      },

      // ── EQUIPMENT — Step 8 ───────────────────────────────────
      equipment: [],

      // ── PRESCRIBED EXERCISES ─────────────────────────────────
      // Exercises prescribed by an external professional (physio,
      // coach, consultant). These are surfaced in the workout view
      // alongside coach-generated exercises when relevant.
      //
      // Schema (per item):
      //   id:           string    — unique ID e.g. 'prescribed-001'
      //   exerciseId:   string    — ID from exercises database, or null
      //   name:         string    — display name (may differ from DB)
      //   description:  string    — what the professional prescribed
      //   frequency:    string    — e.g. '2x daily', 'after exercise'
      //   prescribedBy: string    — professional's name or role
      //   prescribedAt: string    — ISO date string
      //   active:       boolean   — whether still in current programme
      //
      // UI for entering prescribed exercises: Phase 3/4.
      // Array is empty and safe to leave empty until then.
      prescribedExercises: [],

      // ── STRATEGIC GOAL ───────────────────────────────────────
      // Richer than goals[] — drives programme selection and rationale.
      // goals[] still drives daily exercise filtering (unchanged).
      strategicGoal: {
        primaryGoal:         null,   // goal ID e.g. 'lose-weight'
        targetDescription:   '',     // plain text e.g. "Look great for holiday"
        targetDate:          null,   // ISO date string
        targetValue:         null,   // numeric e.g. 168
        targetUnit:          null,   // 'lbs' | 'kg' | 'km' | 'miles' | null
        weeklySessionTarget: 3,      // sessions per week commitment
        setAt:               null    // ISO timestamp
      },

      // ── ACTIVE PROGRAMME ─────────────────────────────────────
      activeProgramme: {
        programmeId:      null,    // e.g. 'beginner-fitness'
        programmeName:    '',      // display name
        startDate:        null,    // ISO date string
        currentWeek:      1,       // 1-12
        currentPhase:     null,    // 'build' | 'push' | 'peak' | 'recovery'
        sessionsThisWeek: 0,       // resets each Monday
        totalSessions:    0,       // lifetime on this programme
        milestones:       [],      // [{ id, label, achievedAt }]
        completed:        false,
        completedAt:      null
      },

      // ── PROGRESS LOG ─────────────────────────────────────────
      // One entry per completed session, max 90.
      // { date, week, phase, focus, energyAtCheckin, conditionScores,
      //   durationMinutes, exerciseCount, milestoneAchieved }
      progressLog: [],

      // ── METADATA ─────────────────────────────────────────────
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
   * Update pain scores from today's check-in.
   * Called by checkin.js when condition pain sliders are submitted.
   *
   * @param {Object} painScores — { [conditionId]: 0-10 }
   */
  updateConditionPainScores(painScores) {
    this.data.conditionPainScores = { ...painScores };
    this.data.updatedAt = new Date().toISOString();
    this.save();
  },

  /**
   * Log a completed session — called from workout-complete view.
   * conditionScores now stored as { [conditionId]: score } object
   * for richer progress tracking.
   */
  logSession(sessionData) {
    const log = [...(this.data.progressLog || [])];
    log.push({
      date:              new Date().toISOString(),
      week:              this.data.activeProgramme?.currentWeek  || 0,
      phase:             this.data.activeProgramme?.currentPhase || null,
      focus:             sessionData.focus             || null,
      energyAtCheckin:   sessionData.energy            || null,
      conditionScores:   sessionData.conditionScores   || {},
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
