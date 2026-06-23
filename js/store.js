/**
 * store.js - Data persistence layer
 *
 * 23 Jun 2026 v6 - Phase 5 schema pass. All 36 new fields added in a single
 *   write. Four new nested objects: onboarding{} (Beat fields — onboardingComplete
 *   and onboardingStep remain top-level), checkin{} (engine state — lastCheckin
 *   and checkinHistory unchanged), absence{} (return journey context),
 *   noticingProgress{} (territory and series tracking).
 *   New top-level fields: fitnessLevel, mindfulPromptDepth, mindfulPromptFrequency,
 *   waterReminderEnabled, lastWaterReminder.
 *   Nested additions: lifestyle.exerciseHistory, lifestyle.returningAfter,
 *   activeProgramme.weekPlan, activeProgramme.sessionSequence,
 *   activeProgramme.missedSessions, activeProgramme.phase,
 *   activeProgramme.midProgrammeGlanceShown, activeProgramme.programmeReflectionShown,
 *   community{} (credits, impact), annualReflection{}.
 *   journalEntries entries: hasProgressSignal (bool) added at save time by signal-words.js.
 *   coachStyle field added (was missing from v5 getDefaults — existed in store but
 *   not initialised). age field deprecated — kept for migration only.
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
 * Handles localStorage with simple get/set API.
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
   *
   * v6 additions are grouped by feature area and ordered to match getDefaults().
   */
  mergeWithDefaults(saved) {
    const defaults = this.getDefaults();
    return {
      ...defaults,
      ...saved,

      // ── ONBOARDING (top-level flags stay top-level) ───────────
      // New: onboarding{} nested object for Beat fields only.
      onboarding: (saved.onboarding && typeof saved.onboarding === 'object')
        ? {
            ...defaults.onboarding,
            ...saved.onboarding,
            hardBeforeSelections: Array.isArray(saved.onboarding.hardBeforeSelections)
              ? saved.onboarding.hardBeforeSelections
              : []
          }
        : defaults.onboarding,

      // ── PROFILE ───────────────────────────────────────────────
      // New: fitnessLevel (derived from lifestyle.activityLevel at onboarding).
      fitnessLevel: saved.fitnessLevel || null,

      // ── LIFESTYLE (existing spread + two new fields) ──────────
      lifestyle: {
        ...defaults.lifestyle,
        ...(saved.lifestyle || {}),
        // exerciseHistory and returningAfter picked up by spread if present.
        // Explicit fallbacks for safety on old installs:
        exerciseHistory: saved.lifestyle?.exerciseHistory || null,
        returningAfter:  saved.lifestyle?.returningAfter  || null
      },

      // ── ACTIVE PROGRAMME (existing spread + six new fields) ───
      activeProgramme: {
        ...defaults.activeProgramme,
        ...(saved.activeProgramme || {}),
        measurementsOptIn: Array.isArray(saved.strategicGoal?.measurementsOptIn)
          ? saved.strategicGoal.measurementsOptIn
          : [],
        // Array fields need explicit check:
        sessionSequence: Array.isArray(saved.activeProgramme?.sessionSequence)
          ? saved.activeProgramme.sessionSequence
          : [],
        missedSessions: Array.isArray(saved.activeProgramme?.missedSessions)
          ? saved.activeProgramme.missedSessions
          : []
      },

      // ── STRATEGIC GOAL (existing, kept for measurementsOptIn) ─
      strategicGoal: {
        ...defaults.strategicGoal,
        ...(saved.strategicGoal || {}),
        measurementsOptIn: Array.isArray(saved.strategicGoal?.measurementsOptIn)
          ? saved.strategicGoal.measurementsOptIn
          : []
      },

      // ── PROGRESS / ACTIVITY LOGS (existing) ──────────────────
      progressLog:         Array.isArray(saved.progressLog)         ? saved.progressLog         : [],
      prescribedExercises: Array.isArray(saved.prescribedExercises) ? saved.prescribedExercises : [],
      activityLog:         Array.isArray(saved.activityLog)         ? saved.activityLog         : [],
      journalEntries:      Array.isArray(saved.journalEntries)       ? saved.journalEntries       : [],

      // ── CHECK-IN ENGINE (new nested object — engine state only) ─
      // Separate from lastCheckin and checkinHistory (both preserved below).
      checkin: (saved.checkin && typeof saved.checkin === 'object')
        ? {
            ...defaults.checkin,
            ...saved.checkin,
            openingModeHistory: Array.isArray(saved.checkin.openingModeHistory)
              ? saved.checkin.openingModeHistory
              : []
          }
        : defaults.checkin,

      // ── MINDFUL PROMPT ENGINE (new top-level fields) ──────────
      mindfulPromptDepth:     typeof saved.mindfulPromptDepth === 'number'
                                ? saved.mindfulPromptDepth
                                : 1,
      mindfulPromptFrequency: saved.mindfulPromptFrequency || 'automatic',

      // ── LAST CHECK-IN (existing) ──────────────────────────────
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

      // ── CHECK-IN HISTORY (existing — plain object, not array) ─
      checkinHistory: (saved.checkinHistory
        && typeof saved.checkinHistory === 'object'
        && !Array.isArray(saved.checkinHistory))
          ? saved.checkinHistory
          : {},

      // ── ABSENCE AND RETURN (new nested object) ────────────────
      absence: (saved.absence && typeof saved.absence === 'object')
        ? { ...defaults.absence, ...saved.absence }
        : defaults.absence,

      // ── NOTICING HUB (existing fields) ───────────────────────
      noticingWeekInCycle:   saved.noticingWeekInCycle   || 1,
      noticingLastTriggered: saved.noticingLastTriggered || null,

      // ── NOTICING PROGRESS (new nested object) ─────────────────
      noticingProgress: (saved.noticingProgress && typeof saved.noticingProgress === 'object')
        ? {
            ...defaults.noticingProgress,
            ...saved.noticingProgress,
            territoriesVisited: Array.isArray(saved.noticingProgress.territoriesVisited)
              ? saved.noticingProgress.territoriesVisited
              : [],
            seriesProgress:   (saved.noticingProgress.seriesProgress
                                && typeof saved.noticingProgress.seriesProgress === 'object')
                                ? saved.noticingProgress.seriesProgress
                                : {},
            seriesUnlockedAt: (saved.noticingProgress.seriesUnlockedAt
                                && typeof saved.noticingProgress.seriesUnlockedAt === 'object')
                                ? saved.noticingProgress.seriesUnlockedAt
                                : {}
          }
        : defaults.noticingProgress,

      // ── JOURNAL SETTINGS (existing) ───────────────────────────
      journalSettings: (saved.journalSettings && typeof saved.journalSettings === 'object')
        ? {
            ...defaults.journalSettings,
            ...saved.journalSettings,
            categoryPrefs: Array.isArray(saved.journalSettings.categoryPrefs)
              ? saved.journalSettings.categoryPrefs
              : defaults.journalSettings.categoryPrefs
          }
        : defaults.journalSettings,

      // ── NOTICING PREFERENCES (existing) ───────────────────────
      noticingPreferences: (saved.noticingPreferences && typeof saved.noticingPreferences === 'object')
        ? { ...defaults.noticingPreferences, ...saved.noticingPreferences }
        : defaults.noticingPreferences,

      // ── SESSION BUILDER (existing) ────────────────────────────
      generatedSession: saved.generatedSession || { session: null, builtAt: null, inputs: {} },

      // ── CONDITION PAIN SCORES (existing) ─────────────────────
      conditionPainScores: (saved.conditionPainScores && typeof saved.conditionPainScores === 'object')
        ? saved.conditionPainScores
        : {},

      // ── WEEKLY PLAN (existing) ────────────────────────────────
      weeklyPlan: (saved.weeklyPlan && typeof saved.weeklyPlan === 'object')
        ? {
            ...defaults.weeklyPlan,
            ...saved.weeklyPlan,
            days: (saved.weeklyPlan.days && typeof saved.weeklyPlan.days === 'object')
              ? Object.fromEntries(
                  Object.keys(defaults.weeklyPlan.days).map(day => [
                    day,
                    { ...defaults.weeklyPlan.days[day], ...(saved.weeklyPlan.days[day] || {}) }
                  ])
                )
              : defaults.weeklyPlan.days
          }
        : defaults.weeklyPlan,

      // ── NOTIFICATIONS (existing) ──────────────────────────────
      checkInNotification: (saved.checkInNotification && typeof saved.checkInNotification === 'object')
        ? { ...defaults.checkInNotification, ...saved.checkInNotification }
        : defaults.checkInNotification,

      // ── WELLBEING (existing) ──────────────────────────────────
      safeguarding: (saved.safeguarding && typeof saved.safeguarding === 'object')
        ? { ...defaults.safeguarding, ...saved.safeguarding }
        : defaults.safeguarding,

      weeklyReview: (saved.weeklyReview && typeof saved.weeklyReview === 'object')
        ? { ...defaults.weeklyReview, ...saved.weeklyReview }
        : defaults.weeklyReview,

      weightLog: Array.isArray(saved.weightLog) ? saved.weightLog : [],
      waterLog:  Array.isArray(saved.waterLog)  ? saved.waterLog  : [],

      waterSettings: (saved.waterSettings && typeof saved.waterSettings === 'object')
        ? { ...defaults.waterSettings, ...saved.waterSettings }
        : defaults.waterSettings,

      // ── WATER REMINDER (new top-level fields) ─────────────────
      waterReminderEnabled: typeof saved.waterReminderEnabled === 'boolean'
        ? saved.waterReminderEnabled
        : false,
      lastWaterReminder: saved.lastWaterReminder || null,

      // ── COACH OFFERS / UNWELL MODE / FOOD (existing) ─────────
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
            lastBalanceAt:   Array.isArray(saved.foodPrompts.lastBalanceAt) ? saved.foodPrompts.lastBalanceAt : [],
            lastEducationAt: saved.foodPrompts.lastEducationAt ?? null
          }
        : defaults.foodPrompts,

      // ── COMMUNITY AND IMPACT (new nested object) ──────────────
      community: (saved.community && typeof saved.community === 'object')
        ? { ...defaults.community, ...saved.community }
        : defaults.community,

      // ── ANNUAL REFLECTION (new nested object) ─────────────────
      annualReflection: (saved.annualReflection && typeof saved.annualReflection === 'object')
        ? { ...defaults.annualReflection, ...saved.annualReflection }
        : defaults.annualReflection,

      // ── PRACTICE HISTORY (existing) ───────────────────────────
      practiceHistory: (saved.practiceHistory && typeof saved.practiceHistory === 'object')
        ? { ...defaults.practiceHistory, ...saved.practiceHistory }
        : defaults.practiceHistory,

      // ── PREFERENCES (existing) ────────────────────────────────
      speechRate: (typeof saved.speechRate === 'number') ? saved.speechRate : 0.9,
      activityPreferences: (saved.activityPreferences && typeof saved.activityPreferences === 'object')
        ? saved.activityPreferences
        : {},
      movementIdentity: saved.movementIdentity || null,
      lastProposalType: saved.lastProposalType || null,
      lastProposalDate: saved.lastProposalDate || null,

      // coachStyle: preserved if set, defaults to 'nurturing'.
      // In beta, Nurturing voice delivers silently for all style settings.
      coachStyle: saved.coachStyle || 'nurturing',

      // tier: preserved if set. 'free' | 'personal' | 'athlete'
      // athlete is unlocked within personal — not a paid upgrade.
      tier: saved.tier || 'free'
    };
  },

  getDefaults() {
    return {

      // ── ONBOARDING (top-level flags) ─────────────────────────
      onboardingComplete: false,
      onboardingStep: 1,

      // ── ONBOARDING BEATS (new nested object — v6) ─────────────
      // Beat 1: The Castle (arrival.js)
      // Beat 2: Hard Before (hard-before.js)
      // Beat 3: Reflection (reflection.js)
      onboarding: {
        castleShownAt:       null,  // ISO string|null — written when arrival.js renders
        hardBeforeSelections: [],   // string[]        — territory IDs selected in Beat 2
        hardBeforeShownAt:   null,  // ISO string|null — Beat 2 timing
        reflectionShownAt:   null   // ISO string|null — Beat 3 timing
      },

      // ── PROFILE ───────────────────────────────────────────────
      name: '',

      // ageBand replaces numeric age throughout the app.
      // Values: "Under 18"|"18–24"|"25–34"|"35–44"|"45–54"|"55–64"|"65+"|"Prefer not to say"
      // Used by coach engine for recovery multipliers and intensity ceilings.
      ageBand: null,
      age: null,          // DEPRECATED — kept for migration only. Do not write new values.
      gender: null,
      hormonalTracking: false,

      // coachStyle: 'nurturing' | 'steady' | 'energetic' | 'minimal'
      // Beta: Nurturing voice delivers for all style settings silently.
      // Free tier: Nurturing locked. Personal+: all styles selectable.
      coachStyle: 'nurturing',

      // tier: 'free' | 'personal' | 'athlete'
      // Athlete is unlocked within Personal — no extra charge.
      // Developer bypass: triple-tap version label in Settings to switch tiers.
      tier: 'free',

      // fitnessLevel: derived from lifestyle.activityLevel during onboarding.
      // 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'
      // Stored separately so it can be updated from Settings without re-running onboarding.
      fitnessLevel: null,

      // ── BODY AND TARGETS ─────────────────────────────────────
      weight: null,
      weightUnit: 'kg',
      targetWeight: null,
      targetDate: null,
      targetDescription: '',

      // ── GOALS ────────────────────────────────────────────────
      goals: [],

      // ── CONDITIONS ───────────────────────────────────────────
      conditions: [],
      conditionPainScores: {},

      // ── LIFESTYLE ────────────────────────────────────────────
      lifestyle: {
        activityLevel: null,       // sedentary | light | moderate | active | very-active
        stressLevel:   null,       // low | moderate | high | very-high
        sleepQuality:  null,       // poor | okay | good
        // New v6 fields:
        exerciseHistory: null,     // 'never' | 'lapsed' | 'returning' | 'active'
        returningAfter:  null      // 'injury' | 'illness' | 'life' | 'burnout' | null
        //                           Only set when exerciseHistory = 'returning'
      },

      // ── EQUIPMENT ────────────────────────────────────────────
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
        // v5 fields (preserved):
        programmeId:      null,
        programmeName:    '',
        startDate:        null,
        currentWeek:      1,
        currentPhase:     null,
        sessionsThisWeek: 0,
        totalSessions:    0,
        milestones:       [],
        completed:        false,
        completedAt:      null,
        // v6 new fields:
        phase:                      1,     // int — current phase within programme (1-3)
        weekPlan:                   null,  // object|null — session type plan for current week
        sessionSequence:            [],    // object[] — { week, day, type, completed }
        missedSessions:             [],    // object[] — { date, reason: 'life'|'illness'|'harder' }
        midProgrammeGlanceShown:    false, // bool — week 6 glance shown; never repeat
        programmeReflectionShown:   false  // bool — week 12 reflection shown; never repeat
      },

      // ── PROGRESS LOG ─────────────────────────────────────────
      progressLog: [],

      // ── GYM PROGRAMME ────────────────────────────────────────
      gymProgrammeSession: 'A',
      gymProgrammeWeek:    1,

      // ── ACTIVITY LOG ─────────────────────────────────────────
      // Each entry: { date, type, durationMins, moodAfter (int|null),
      //               isEvent (bool), eventName (string|null), ... }
      activityLog: [],
      currentActivityEntry: null,

      // ── CHECK-IN ENGINE STATE (new nested object — v6) ────────
      // Engine state only. lastCheckin and checkinHistory are separate (below).
      checkin: {
        lastOpeningMode:      null, // string|null — mode used in last check-in
        openingModeHistory:   [],   // string[]    — last 7 modes; prevents patterns
        feelingWordDepth:     1,    // int 1-5     — current vocabulary depth level
        lastMilestoneNoticed: null  // ISO string|null — prevents duplicate milestone
      },

      // ── MINDFUL PROMPT ENGINE (new top-level — v6) ────────────
      mindfulPromptDepth:     1,           // int 1-5    — current prompt depth
      mindfulPromptFrequency: 'automatic', // string     — automatic|session-start|mid-session|both

      // ── LAST CHECK-IN (existing) ──────────────────────────────
      lastCheckin: {
        feelingWord:     null,
        feelingQuadrant: null,
        unwell:          false,
        timestamp:       null
      },

      // ── CHECK-IN HISTORY (existing) ───────────────────────────
      // Plain object keyed by "YYYY-MM-DD" date strings.
      // { "2026-06-23": { energy, mood, feelingWord, feelingQuadrant, ... } }
      // NOT an array.
      checkinHistory: {},

      // ── ABSENCE AND RETURN (new nested object — v6) ───────────
      // Separate from unwellMode. Captures context when check-in flags absence.
      absence: {
        context:   null, // 'injury' | 'illness' | 'life' | 'burnout' | null
        capturedAt: null // ISO string|null — when absence was logged
      },

      // ── TEXT-TO-SPEECH ────────────────────────────────────────
      speechRate: 0.9,

      // ── ACTIVITY PREFERENCES ──────────────────────────────────
      activityPreferences: {},

      // ── MOVEMENT IDENTITY ─────────────────────────────────────
      movementIdentity: null,

      // ── SESSION LOCATION ──────────────────────────────────────
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

      // ── NOTICING HUB (existing fields) ───────────────────────
      journalEntries:        [],
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

      // ── NOTICING PROGRESS (new nested object — v6) ────────────
      noticingProgress: {
        territoriesVisited: [],  // string[]            — territory IDs visited at least once
        seriesProgress:     {},  // { [seriesId]: int } — current step per series
        seriesUnlockedAt:   {},  // { [seriesId]: ISO } — governs minimum-days gate
        lastTerritoryId:    null // string|null         — prevents immediate repeat territory
      },

      // ── SESSION BUILDER ───────────────────────────────────────
      generatedSession: {
        session:  null,
        builtAt:  null,
        inputs:   {}
      },

      // ── WEEKLY PLAN ───────────────────────────────────────────
      weeklyPlan: {
        days: {
          monday:    { type: 'open', sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          tuesday:   { type: 'open', sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          wednesday: { type: 'open', sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          thursday:  { type: 'open', sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          friday:    { type: 'open', sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          saturday:  { type: 'open', sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false },
          sunday:    { type: 'open', sessionType: null, durationMins: null, location: null, classFocus: [], activityName: null, label: null, enabled: false }
        },
        updatedAt: null
      },

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

      // ── WATER REMINDER (new top-level — v6) ───────────────────
      waterReminderEnabled: false, // bool         — pre-session water reminder toggle
      lastWaterReminder:    null,  // ISO string|null — prevents repeat in same session

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

      // ── COMMUNITY AND IMPACT (new nested object — v6) ─────────
      // Tesco coins model: 1 credit/session free; 2 credits/session Personal tier.
      // Quarterly allocation across three permanent cause categories.
      community: {
        credits:            0,    // int          — accumulated credits
        lastCreditAt:       null, // ISO string|null — prevents duplicate credits in same session
        quarterlyAllocation: null, // object|null  — { quarter: string, causes: { [id]: int } }
        lastAllocationAt:   null, // ISO string|null — when last allocation was made
        totalAllocated:     0     // int          — lifetime allocated credits
      },

      // ── ANNUAL REFLECTION (new nested object — v6) ────────────
      annualReflection: {
        lastGeneratedAt: null,  // ISO string|null — when last annual reflection was created
        lastReadAt:      null,  // ISO string|null — when user last opened it
        chaptersUnlocked: 0     // int             — chapters revealed (0-9)
      },

      // ── PRACTICE HISTORY ──────────────────────────────────────
      practiceHistory: {
        lastPlayed: {},   // { [practiceId]: ISO string }
        favourites: []    // string[] — practice IDs
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
  },

  /**
   * Award community credits after a completed session.
   * Personal tier users receive 2 credits; Free tier users receive 1.
   * Prevents duplicate credits within the same session (same-day guard).
   */
  awardCommunityCredit() {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = this.data.community?.lastCreditAt?.split('T')[0];
    if (lastDate === today) return; // already awarded today

    const creditsToAdd = this.data.tier === 'personal' || this.data.tier === 'athlete' ? 2 : 1;
    this.data.community.credits = (this.data.community.credits || 0) + creditsToAdd;
    this.data.community.lastCreditAt = new Date().toISOString();
    this.data.updatedAt = new Date().toISOString();
    this.save();
  }
};
