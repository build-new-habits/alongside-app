/**
 * store.js - Data persistence layer
 *
 * 22 Jun 2026 v5 - Critical bug fix: checkinHistory type check in
 *   mergeWithDefaults() was checking Array.isArray(saved.checkinHistory)
 *   which returned false for the correct object shape { "YYYY-MM-DD": {...} }
 *   and reset it to [] on every app initialisation, destroying all check-in
 *   data on reload. Fixed to preserve the object correctly.
 *   ageBand added to getDefaults() — was being used throughout but missing
 *   from defaults, causing undefined reads on fresh installs.
 *
 * 15 Jun 2026 v4 - Noticing Hub schema pass (S4-NH-SCHEMA).
 * 13 Jun 2026 v3 - Weekly Plan shape finalised (S4-WP prep, schema 1.6).
 * 12 Jun 2026 v2 - S4-4 addition: lastCheckin.timestamp.
 * 12 Jun 2026 v1 - Consolidated schema pass.
 *
 * Handles localStorage with simple get/set API
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
      strategicGoal:        {
                              ...defaults.strategicGoal,
                              ...(saved.strategicGoal || {}),
                              measurementsOptIn: Array.isArray(saved.strategicGoal?.measurementsOptIn)
                                                    ? saved.strategicGoal.measurementsOptIn
                                                    : []
                            },
      activeProgramme:      { ...defaults.activeProgramme,      ...(saved.activeProgramme      || {}) },
      progressLog:          Array.isArray(saved.progressLog)    ? saved.progressLog    : [],
      prescribedExercises:  Array.isArray(saved.prescribedExercises) ? saved.prescribedExercises : [],
      activityLog:          Array.isArray(saved.activityLog)    ? saved.activityLog    : [],
      journalEntries:       Array.isArray(saved.journalEntries)  ? saved.journalEntries  : [],
      noticingWeekInCycle:  saved.noticingWeekInCycle  || 1,
      noticingLastTriggered: saved.noticingLastTriggered || null,

      // ── Noticing Hub schema pass (v1.7, S4-NH-SCHEMA) ─────────
      journalSettings: (saved.journalSettings && typeof saved.journalSettings === 'object')
                          ? {
                              ...defaults.journalSettings,
                              ...saved.journalSettings,
                              categoryPrefs: Array.isArray(saved.journalSettings.categoryPrefs)
                                               ? saved.journalSettings.categoryPrefs
                                               : defaults.journalSettings.categoryPrefs
                            }
                          : defaults.journalSettings,

      noticingPreferences: (saved.noticingPreferences && typeof saved.noticingPreferences === 'object')
                              ? { ...defaults.noticingPreferences, ...saved.noticingPreferences }
                              : defaults.noticingPreferences,

      generatedSession:     saved.generatedSession || { session: null, builtAt: null, inputs: {} },
      conditionPainScores:  (saved.conditionPainScores && typeof saved.conditionPainScores === 'object')
                              ? saved.conditionPainScores
                              : {},
      checkInNotification:  (saved.checkInNotification && typeof saved.checkInNotification === 'object')
                              ? { ...defaults.checkInNotification, ...saved.checkInNotification }
                              : defaults.checkInNotification,
      speechRate: (typeof saved.speechRate === "number") ? saved.speechRate : 0.9,
      activityPreferences: (saved.activityPreferences && typeof saved.activityPreferences === "object")
                             ? saved.activityPreferences
                             : {},
      movementIdentity:    saved.movementIdentity || null,
      lastProposalType:    saved.lastProposalType || null,
      lastProposalDate:    saved.lastProposalDate || null,

      // ── S4-WP - Weekly Plan (v1.6 per-day field additions) ────
      weeklyPlan: (saved.weeklyPlan && typeof saved.weeklyPlan === 'object')
                    ? {
                        ...defaults.weeklyPlan,
                        ...saved.weeklyPlan,
                        days: (saved.weeklyPlan.days && typeof saved.weeklyPlan.days === 'object')
                                ? Object.fromEntries(
                                    Object.keys(defaults.weeklyPlan.days).map(day => [
                                      day,
                                      {
                                        ...defaults.weeklyPlan.days[day],
                                        ...(saved.weeklyPlan.days[day] || {})
                                      }
                                    ])
                                  )
                                : defaults.weeklyPlan.days
                      }
                    : defaults.weeklyPlan,

      // ── Wellbeing & Long-Horizon — lastCheckin additions ─────
      lastCheckin: (saved.lastCheckin && typeof saved.lastCheckin === 'object')
                    ? {
                        ...defaults.lastCheckin,
                        ...saved.lastCheckin,
                        feelingWord:     saved.lastCheckin.feelingWord     ?? null,
                        feelingQuadrant: saved.lastCheckin.feelingQuadrant ?? null,
                        unwell:          saved.lastCheckin.unwell          ?? false,
                        timestamp:       saved.lastCheckin.timestamp       ?? null
                      }
                    : defaults.lastCheckin,

      // ── BUG FIX v5: checkinHistory is a plain object keyed by ──
      // date strings { "YYYY-MM-DD": { energy, mood, ... } }.
      // Previous code used Array.isArray() which always returned
      // false for this shape, resetting history to [] on every
      // app load and destroying all check-in data on reload.
      checkinHistory: (saved.checkinHistory
                        && typeof saved.checkinHistory === 'object'
                        && !Array.isArray(saved.checkinHistory))
                          ? saved.checkinHistory
                          : (Array.isArray(saved.checkinHistory) ? {} : {}),

      // ── Wellbeing & Long-Horizon — top level additions ───────
      safeguarding: (saved.safeguarding && typeof saved.safeguarding === 'object')
                       ? { ...defaults.safeguarding, ...saved.safeguarding }
                       : defaults.safeguarding,

      weeklyReview: (saved.weeklyReview && typeof saved.weeklyReview === 'object')
                       ? { ...defaults.weeklyReview, ...saved.weeklyReview }
                       : defaults.weeklyReview,

      weightLog: Array.isArray(saved.weightLog) ? saved.weightLog : [],

      waterLog: Array.isArray(saved.waterLog) ? saved.waterLog : [],

      waterSettings: (saved.waterSettings && typeof saved.waterSettings === 'object')
                        ? { ...defaults.waterSettings, ...saved.waterSettings }
                        : defaults.waterSettings,

      coachOffers: (saved.coachOffers && typeof saved.coachOffers === 'object')
                      ? {
                          shown:    { ...(saved.coachOffers.shown    || {}) },
                          declined: { ...(saved.coachOffers.declined || {}) }
                        }
                      : defaults.coachOffers,

      unwellMode: (saved.unwellMode && typeof saved.unwellMode === 'object')
                     ? { ...defaults.unwellMode, ...saved.unwellMode }
                     : defaults.unwellMode,

      foodPrompts: (saved.foodPrompts && typeof saved.foodPrompts === 'object')
                      ? {
                          lastBalanceAt:  Array.isArray(saved.foodPrompts.lastBalanceAt) ? saved.foodPrompts.lastBalanceAt : [],
                          lastEducationAt: saved.foodPrompts.lastEducationAt ?? null
                        }
                      : defaults.foodPrompts,

      // ── Guided Practice Library — minimal usage tracking ─────
      practiceHistory: (saved.practiceHistory && typeof saved.practiceHistory === 'object')
                          ? { ...defaults.practiceHistory, ...saved.practiceHistory }
                          : defaults.practiceHistory,
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
      // ageBand replaces numeric age throughout the app.
      // Values match onboarding/about.js chip options:
      //   "Under 18" | "18–24" | "25–34" | "35–44" |
      //   "45–54" | "55–64" | "65+" | "Prefer not to say"
      // Used by coach engine for recovery multipliers, intensity
      // ceilings, and age-appropriate movement adaptations.
      ageBand: null,
      age: null,          // kept for migration; do not write new values here
      gender: null,
      hormonalTracking: false,

      // ── BODY & TARGETS — Step 4 ──────────────────────────────
      weight: null,
      weightUnit: 'kg',
      targetWeight: null,
      targetDate: null,
      targetDescription: '',

      // ── GOALS — Step 5 ───────────────────────────────────────
      goals: [],

      // ── CONDITIONS — Step 6 ──────────────────────────────────
      conditions: [],
      conditionPainScores: {},

      // ── LIFESTYLE — Step 7 ───────────────────────────────────
      lifestyle: {
        activityLevel: null,
        stressLevel: null,
        sleepQuality: null
      },

      // ── EQUIPMENT — Step 8 ───────────────────────────────────
      equipment: [],

      // ── PRESCRIBED EXERCISES ─────────────────────────────────
      prescribedExercises: [],

      // ── STRATEGIC GOAL ───────────────────────────────────────
      strategicGoal: {
        primaryGoal:         null,
        targetDescription:   '',
        targetDate:          null,
        targetValue:         null,
        targetUnit:          null,
        weeklySessionTarget: 3,
        setAt:               null,
        planPresentedAt:     null,
        measurementsOptIn:   []
      },

      // ── ACTIVE PROGRAMME ─────────────────────────────────────
      activeProgramme: {
        programmeId:      null,
        programmeName:    '',
        startDate:        null,
        currentWeek:      1,
        currentPhase:     null,
        sessionsThisWeek: 0,
        totalSessions:    0,
        milestones:       [],
        completed:        false,
        completedAt:      null
      },

      // ── PROGRESS LOG ─────────────────────────────────────────
      progressLog: [],

      // ── GYM PROGRAMME ────────────────────────────────────────
      gymProgrammeSession: "A",
      gymProgrammeWeek:    1,

      // ── ACTIVITY LOG ─────────────────────────────────────────
      activityLog: [],
      currentActivityEntry: null,

      // ── TEXT-TO-SPEECH ────────────────────────────────────────
      speechRate: 0.9,

      // ── ACTIVITY PREFERENCES ──────────────────────────────────
      activityPreferences: {},

      // ── MOVEMENT IDENTITY ─────────────────────────────────────
      movementIdentity: null,

      // ── SESSION LOCATION ─────────────────────────────────────
      sessionLocation: null,

      // ── COACH PROPOSAL ────────────────────────────────────────
      lastProposalType: null,
      lastProposalDate: null,

      // ── CHECK-IN NOTIFICATION ────────────────────────────────
      checkInNotification: {
        enabled:           false,
        time:              null,
        permissionGranted: false
      },

      // ── NOTICING HUB ─────────────────────────────────────────
      journalEntries: [],
      noticingWeekInCycle:   1,
      noticingLastTriggered: null,

      // ── JOURNAL SETTINGS ──────────────────────────────────────
      journalSettings: {
        autoTagging:   true,
        categoryPrefs: ['life', 'movement', 'environment', 'nature', 'health']
      },

      // ── NOTICING PREFERENCES ──────────────────────────────────
      noticingPreferences: {
        schedule: 'automatic',
        time: null
      },

      // ── SESSION BUILDER ──────────────────────────────────────
      generatedSession: {
        session:  null,
        builtAt:  null,
        inputs:   {}
      },

      // ── WEEKLY PLAN ──────────────────────────────────────────
      weeklyPlan: {
        days: {
          monday:    { type: "open", sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          tuesday:   { type: "open", sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          wednesday: { type: "open", sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          thursday:  { type: "open", sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          friday:    { type: "open", sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          saturday:  { type: "open", sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          sunday:    { type: "open", sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false }
        },
        updatedAt: null
      },

      // ── LAST CHECK-IN ─────────────────────────────────────────
      lastCheckin: {
        feelingWord:     null,
        feelingQuadrant: null,
        unwell:          false,
        timestamp:       null
      },

      // ── CHECK-IN HISTORY ──────────────────────────────────────
      // Plain object keyed by "YYYY-MM-DD" date strings.
      // { "2026-06-22": { energy, mood, sleepHours, ... } }
      // NOT an array — mergeWithDefaults preserves this correctly in v5.
      checkinHistory: {},

      // ── SAFEGUARDING ──────────────────────────────────────────
      safeguarding: {
        lastSignpostedAt: null
      },

      // ── WEEKLY REVIEW ─────────────────────────────────────────
      weeklyReview: {
        periodStart:  null,
        periodEnd:    null,
        generatedAt:  null,
        narrative:    null,
        readAt:       null,
        dataUnlocked: false
      },

      // ── WEIGHT LOG ────────────────────────────────────────────
      weightLog: [],

      // ── WATER LOG ─────────────────────────────────────────────
      waterLog: [],

      // ── WATER SETTINGS ────────────────────────────────────────
      waterSettings: {
        dailyTargetMl:    2000,
        remindersEnabled: false,
        reminderCount:    2,
        windowStart:      9,
        windowEnd:        21
      },

      // ── COACH OFFERS ──────────────────────────────────────────
      coachOffers: {
        shown: {},
        declined: {}
      },

      // ── UNWELL MODE ───────────────────────────────────────────
      unwellMode: {
        active:            false,
        kind:              null,
        startedAt:         null,
        recoveryStartedAt: null,
        daysHeld:          0,
        kindAtRecovery:    null
      },

      // ── FOOD PROMPTS ──────────────────────────────────────────
      foodPrompts: {
        lastBalanceAt:   [],
        lastEducationAt: null
      },

      // ── PRACTICE HISTORY ──────────────────────────────────────
      practiceHistory: {
        lastPlayed: {},
        favourites: []
      },

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

  updateConditionPainScores(painScores) {
    this.data.conditionPainScores = { ...painScores };
    this.data.updatedAt = new Date().toISOString();
    this.save();
  },

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
