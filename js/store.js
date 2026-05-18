/**
 * store.js - Data persistence layer
 * Handles localStorage with simple get/set API
 *
 * 16 May 2026 v1
 *
 * v1.8 — NS-1 equipment architecture + supporting fields:
 *   homeEquipment[]       — equipment available at home
 *   gymEquipment[]        — equipment available at gym/facility
 *   equipmentByLocation{} — per-location equipment map (future-proof)
 *   movementIdentity[]    — multi-select (was single value)
 *   returnVisit           — flag for second+ visit same day (router.js)
 *   exercisePreferences{} — skip/dislike preference signals per exercise
 *   coachStyle            — coach personality ('nurturing' default)
 *   userTier              — 'free' | 'personal' | 'athlete'
 *   totalCredits          — impact credits balance
 *
 * v1.7 — checkInNotification schema (S3-6):
 *   Opted-in check-in reminder. Entirely user-initiated.
 *   Never shown without explicit opt-in. No shame-based framing permitted.
 *   Fields:
 *     enabled           — false by default; user must toggle on
 *     time              — "HH:MM" 24hr string; null until user sets one
 *     permissionGranted — true only after browser Notification API confirms
 *
 *   Distinguished in code and comments from prohibited shame-based notification
 *   patterns. This feature: warm, single type, user-set time, user-revocable.
 *   Prohibited patterns: streak reminders, guilt framing, re-prompting on deny.
 *
 * v1.6 — ageBand, conditionStatus/Stories/Names, consentGiven/At
 *
 * v1.2 — Schema additions:
 *   prescribedExercises  — externally prescribed exercises from physio/coach
 *                          Empty array in v1.2; UI built in Phase 3/4.
 *                          Added now so any user data captured in the field
 *                          from here forwards is correctly persisted.
 *
 *   conditionPainScores  — today's per-condition pain scores from check-in
 *                          { [conditionId]: 0-10 }
 *                          Used by the 3-tier condition filter to resolve
 *                          phase-aware condition variants (acute/subacute).
 *                          Replaces the previous approach of storing only
 *                          a flat conditions[] array with no pain context.
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
      activityLog:          Array.isArray(saved.activityLog)    ? saved.activityLog    : [],
      conditionPainScores:  (saved.conditionPainScores && typeof saved.conditionPainScores === 'object')
                              ? saved.conditionPainScores
                              : {},
      checkInNotification:  (saved.checkInNotification && typeof saved.checkInNotification === 'object')
                              ? { ...this.getDefaults().checkInNotification, ...saved.checkInNotification }
                              : this.getDefaults().checkInNotification,
      speechRate: (typeof saved.speechRate === "number") ? saved.speechRate : 0.9,

      // NS-1 equipment architecture
      homeEquipment:       Array.isArray(saved.homeEquipment)       ? saved.homeEquipment       : [],
      gymEquipment:        Array.isArray(saved.gymEquipment)        ? saved.gymEquipment        : [],
      equipmentByLocation: (saved.equipmentByLocation && typeof saved.equipmentByLocation === 'object')
                             ? saved.equipmentByLocation
                             : {},
      movementIdentity:    Array.isArray(saved.movementIdentity)
                             ? saved.movementIdentity
                             : (saved.movementIdentity ? [saved.movementIdentity] : []),  // migrate single string

      // Tier, credits, preferences
      userTier:            saved.userTier            || 'free',
      measurementUnit:     saved.measurementUnit     || 'cm',
      totalCredits:        typeof saved.totalCredits === 'number' ? saved.totalCredits : 0,
      exercisePreferences: (saved.exercisePreferences && typeof saved.exercisePreferences === 'object')
                             ? saved.exercisePreferences
                             : {},
      returnVisit:         false,  // always reset on fresh load
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
      measurementUnit: 'cm',  // 'cm' | 'in' — for waist, arms, etc.
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

      // ── LIFESTYLE — Step 7 ───────────────────────────────────
      lifestyle: {
        activityLevel: null,
        stressLevel: null,
        sleepQuality: null
      },

      // ── EQUIPMENT — Step 8 ───────────────────────────────────
      // equipment[] is kept as the union of home + gym for backward compatibility.
      // homeEquipment[] and gymEquipment[] are the canonical sources of truth.
      // equipmentByLocation{} maps location IDs to their equipment arrays —
      // used by coach-proposal and workout generator to read context-correct kit.
      equipment:           [],
      homeEquipment:       [],
      gymEquipment:        [],
      equipmentByLocation: {
        // e.g. { home: [...], gym: [...], pool: [], studio: [] }
      },

      // ── MOVEMENT IDENTITY ────────────────────────────────────
      // Multi-select array (was single string movementIdentity).
      // Coach rotates suggestions toward whichever type has been
      // done least recently from the selected set.
      // Values: 'gym' | 'yoga-pilates' | 'running' | 'walking' |
      //         'swimming' | 'classes' | 'mix'
      movementIdentity: [],

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

      // ── GYM PROGRAMME ────────────────────────────────────────
      gymProgrammeSession: "A",
      gymProgrammeWeek:    1,

      // ── ACTIVITY LOG ─────────────────────────────────────────
      // Every completed activity writes one entry here regardless
      // of path (coach-recommended, self-directed, quiet).
      // Schema per entry: id, date, type, name, energyBefore,
      // energyAfter, feel, painChange, note, source, completedAt
      activityLog: [],

      // Holds the in-progress activity entry during a session.
      // Written by intention.js, updated by reflect.js.
      currentActivityEntry: null,

      // ── TEXT-TO-SPEECH ────────────────────────────────────────
      // Coach card read-aloud feature. User-initiated only.
      // Rate: 0.75 = slow, 0.9 = normal, 1.2 = fast.
      // Never autoplays. Persists across sessions.
      speechRate: 0.9,

      // ── CHECK-IN NOTIFICATION ────────────────────────────────
      // Opted-in reminder only. User must explicitly enable.
      // PERMITTED: warm tone, user-set time, single type, user-revocable.
      // PROHIBITED: streak framing, guilt framing, re-prompting after deny.
      checkInNotification: {
        enabled:           false,  // false until user toggles on
        time:              null,   // "HH:MM" 24hr string; null until set
        permissionGranted: false   // true only after browser API confirms
      },

      // ── COACH + TIER ─────────────────────────────────────────
      // coachStyle: set during onboarding or Settings > Profile.
      // 'nurturing' is the default and the only style on Free tier.
      coachStyle: 'nurturing',

      // userTier: set by auth.js on subscription verification.
      // 'free' until Supabase auth is live.
      userTier: 'free',

      // ── CREDITS ──────────────────────────────────────────────
      totalCredits:       0,
      lastWorkoutCredits: 0,
      lastWorkoutName:    null,

      // ── RETURN VISIT ─────────────────────────────────────────
      // Set by router.js on second+ open same day.
      // Read by intention.js to show "anything changed?" prompt.
      returnVisit: false,

      // ── EXERCISE PREFERENCES ─────────────────────────────────
      // Per-exercise skip/dislike signals.
      // Written by skip flow (two-step: unavailable vs preference).
      // Read by workoutGenerator to filter or reduce frequency.
      // Schema: { [exerciseId]: { preference: 'avoid'|'less', setAt, source: 'user' } }
      exercisePreferences: {},

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
