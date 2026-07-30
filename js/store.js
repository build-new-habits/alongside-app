/**
 * store.js - Data persistence layer
 * 30 Jul 2026 v11
 *
 * 30 Jul 2026 v11 - logActivity()'s dedupeWindowMs default reduced from
 *   2 minutes to 10 seconds. Found on-device testing yoga-session.js v6:
 *   two genuinely different real completions 83 seconds apart were
 *   silently rejected as a duplicate. See logActivity()'s own changelog
 *   comment below for full reasoning. No other changes.
 * 16 Jul 2026 v10 - logActivity() added (S4-B3-3). Confirmed on-device
 *   duplicate/phantom-write bug in activityLog, discovered during B3-2-Test
 *   and root-caused this session: coach-reflection.js was writing an
 *   incomplete entry the moment an activity type was SELECTED, not when
 *   it was completed. For Gym and Yoga specifically, this produced a
 *   permanent orphaned phantom entry plus a second, separate entry from
 *   genuine completion — two entries per real session, confirmed on-device.
 *   Root cause fixed at the call sites (coach-reflection.js no longer
 *   pre-writes; workout.js and yoga-session.js now create the entry only
 *   at genuine completion, via this new shared function). logActivity()
 *   is the defensive backstop: single write path, dedupe guard against
 *   same-type entries within a short time window. See changelog entries
 *   in coach-reflection.js, workout.js, yoga-session.js, and reflect.js
 *   (all touched this session) for the full picture. Full details:
 *   alongside_session_handoff (B3-3, 16 Jul).
 *
 * 16 Jul 2026 v9 - Empathy Transfer schema pass (S4-B3-2). Five new
 *   top-level fields added to support the 5-stage, session-count-gated
 *   empathy transfer prompt library (alongside_empathy_transfer_prompts_
 *   19may2026_v1.docx), confirmed fully dormant at the schema level by
 *   Session B3 (16 Jul):
 *     empathyTransferStage     integer / 1  - current stage (1-5)
 *     empathyPromptsFired      integer / 0  - total prompts fired, all time
 *     empathyPromptsAtStage    integer / 0  - prompts fired at current stage,
 *                                             resets to 0 on stage advance
 *     lastEmpathyPromptSession integer / 0  - session count at last fire,
 *                                             enforces the 3-4 session gap
 *     empathyPromptSkips       integer / 0  - consecutive skip streak (NOT
 *                                             lifetime total - resets to 0
 *                                             on any non-skip response; see
 *                                             reflect.js v2 comments for why)
 *   mergeWithDefaults() updated: all five given explicit type-checked merge
 *   entries, matching the pattern used for mindfulPromptDepth etc., rather
 *   than relying on the top-level spread alone.
 *   getDefaults() updated: all five added at their spec defaults.
 *   All other fields unchanged from v8.
 *
 * 05 Jul 2026 v8 - Schema-first change for My Movement rebuild (agreed
 *   13 May, never built — ground-truthed this session: the movement
 *   identity selector is currently absent from the live settings.js
 *   entirely, not merely single-select).
 *   movementIdentity: string|null -> string[]. Was a single value
 *   (gym|yoga|running|walking|swimming|classes|mixed); now an array so a
 *   user can hold several at once (e.g. gym + running + walking). The
 *   coach rotates suggestions toward whichever selected identity has
 *   been done least recently — computed from activityLog entries by
 *   type, not a new stored field.
 *   mergeWithDefaults() updated: existing single-string values (from
 *   any user who set this before today) are wrapped in a one-item array
 *   rather than discarded, so nobody's prior selection is silently lost.
 *   getDefaults() updated: movementIdentity: [] (was null).
 *   All other fields unchanged from v7.
 *
 * 29 Jun 2026 v7 - OB-THREAD schema pass. Three new fields added to the
 *   onboarding{} nested object:
 *     onboarding.primaryTerritory  (string|null)      — written by thread.js
 *       Step 3b (single territory selection). Read by beat3-scripts.js
 *       getDominantTerritory(). Replaces the old pattern of inferring
 *       dominant territory from hardBeforeSelections[0].
 *     onboarding.threadStartedAt   (ISO string|null)  — written when
 *       thread.js Step 1 renders. Analytics only.
 *     onboarding.threadCompletedAt (ISO string|null)  — written when
 *       thread.js Step 14 completes. Analytics only.
 *   mergeWithDefaults() updated: primaryTerritory, threadStartedAt, and
 *   threadCompletedAt picked up by the existing onboarding{} spread — no
 *   additional explicit handling needed beyond adding to defaults.
 *   All other fields unchanged from v6.
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
   * v9: empathyTransferStage, empathyPromptsFired, empathyPromptsAtStage,
   * lastEmpathyPromptSession, empathyPromptSkips are all new integer
   * fields — every existing user gets the spec defaults (stage 1, all
   * counters 0) since none of them can have fired a prompt that never
   * existed.
   * v8: movementIdentity migrated from string|null to string[]. Any
   * existing single value is wrapped, not dropped.
   * v7: primaryTerritory, threadStartedAt, threadCompletedAt are string|null
   * fields inside onboarding{}. They are picked up safely by the existing
   * onboarding{} spread — no additional explicit handling needed.
   */
  mergeWithDefaults(saved) {
    const defaults = this.getDefaults();
    return {
      ...defaults,
      ...saved,

      // ── ONBOARDING (top-level flags stay top-level) ───────────
      // v7: primaryTerritory, threadStartedAt, threadCompletedAt
      //     are string|null — picked up safely by the spread below.
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
      fitnessLevel: saved.fitnessLevel || null,

      // ── LIFESTYLE (existing spread + two new fields) ──────────
      lifestyle: {
        ...defaults.lifestyle,
        ...(saved.lifestyle || {}),
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
        sessionSequence: Array.isArray(saved.activeProgramme?.sessionSequence)
          ? saved.activeProgramme.sessionSequence
          : [],
        missedSessions: Array.isArray(saved.activeProgramme?.missedSessions)
          ? saved.activeProgramme.missedSessions
          : []
      },

      // ── STRATEGIC GOAL ────────────────────────────────────────
      strategicGoal: {
        ...defaults.strategicGoal,
        ...(saved.strategicGoal || {}),
        measurementsOptIn: Array.isArray(saved.strategicGoal?.measurementsOptIn)
          ? saved.strategicGoal.measurementsOptIn
          : []
      },

      // ── PROGRESS / ACTIVITY LOGS ──────────────────────────────
      progressLog:         Array.isArray(saved.progressLog)         ? saved.progressLog         : [],
      prescribedExercises: Array.isArray(saved.prescribedExercises) ? saved.prescribedExercises : [],
      activityLog:         Array.isArray(saved.activityLog)         ? saved.activityLog         : [],
      journalEntries:      Array.isArray(saved.journalEntries)       ? saved.journalEntries       : [],

      // ── CHECK-IN ENGINE ───────────────────────────────────────
      checkin: (saved.checkin && typeof saved.checkin === 'object')
        ? {
            ...defaults.checkin,
            ...saved.checkin,
            openingModeHistory: Array.isArray(saved.checkin.openingModeHistory)
              ? saved.checkin.openingModeHistory
              : []
          }
        : defaults.checkin,

      // ── MINDFUL PROMPT ENGINE ─────────────────────────────────
      mindfulPromptDepth:     typeof saved.mindfulPromptDepth === 'number'
                                ? saved.mindfulPromptDepth
                                : 1,
      mindfulPromptFrequency: saved.mindfulPromptFrequency || 'automatic',

      // ── EMPATHY TRANSFER (new, v9) ─────────────────────────────
      empathyTransferStage: typeof saved.empathyTransferStage === 'number'
        ? saved.empathyTransferStage
        : 1,
      empathyPromptsFired: typeof saved.empathyPromptsFired === 'number'
        ? saved.empathyPromptsFired
        : 0,
      empathyPromptsAtStage: typeof saved.empathyPromptsAtStage === 'number'
        ? saved.empathyPromptsAtStage
        : 0,
      lastEmpathyPromptSession: typeof saved.lastEmpathyPromptSession === 'number'
        ? saved.lastEmpathyPromptSession
        : 0,
      empathyPromptSkips: typeof saved.empathyPromptSkips === 'number'
        ? saved.empathyPromptSkips
        : 0,

      // ── LAST CHECK-IN ─────────────────────────────────────────
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

      // ── CHECK-IN HISTORY (plain object, not array) ────────────
      checkinHistory: (saved.checkinHistory
        && typeof saved.checkinHistory === 'object'
        && !Array.isArray(saved.checkinHistory))
          ? saved.checkinHistory
          : {},

      // ── ABSENCE AND RETURN ────────────────────────────────────
      absence: (saved.absence && typeof saved.absence === 'object')
        ? { ...defaults.absence, ...saved.absence }
        : defaults.absence,

      // ── NOTICING HUB ──────────────────────────────────────────
      noticingWeekInCycle:   saved.noticingWeekInCycle   || 1,
      noticingLastTriggered: saved.noticingLastTriggered || null,

      // ── NOTICING PROGRESS ─────────────────────────────────────
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

      // ── JOURNAL SETTINGS ──────────────────────────────────────
      journalSettings: (saved.journalSettings && typeof saved.journalSettings === 'object')
        ? {
            ...defaults.journalSettings,
            ...saved.journalSettings,
            categoryPrefs: Array.isArray(saved.journalSettings.categoryPrefs)
              ? saved.journalSettings.categoryPrefs
              : defaults.journalSettings.categoryPrefs
          }
        : defaults.journalSettings,

      // ── NOTICING PREFERENCES ──────────────────────────────────
      noticingPreferences: (saved.noticingPreferences && typeof saved.noticingPreferences === 'object')
        ? { ...defaults.noticingPreferences, ...saved.noticingPreferences }
        : defaults.noticingPreferences,

      // ── SESSION BUILDER ───────────────────────────────────────
      generatedSession: saved.generatedSession || { session: null, builtAt: null, inputs: {} },

      // ── CONDITION PAIN SCORES ─────────────────────────────────
      conditionPainScores: (saved.conditionPainScores && typeof saved.conditionPainScores === 'object')
        ? saved.conditionPainScores
        : {},

      // ── WEEKLY PLAN ───────────────────────────────────────────
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

      // ── NOTIFICATIONS ─────────────────────────────────────────
      checkInNotification: (saved.checkInNotification && typeof saved.checkInNotification === 'object')
        ? { ...defaults.checkInNotification, ...saved.checkInNotification }
        : defaults.checkInNotification,

      // ── WELLBEING ─────────────────────────────────────────────
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

      // ── WATER REMINDER ────────────────────────────────────────
      waterReminderEnabled: typeof saved.waterReminderEnabled === 'boolean'
        ? saved.waterReminderEnabled
        : false,
      lastWaterReminder: saved.lastWaterReminder || null,

      // ── COACH OFFERS / UNWELL MODE / FOOD ────────────────────
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

      // ── COMMUNITY AND IMPACT ──────────────────────────────────
      community: (saved.community && typeof saved.community === 'object')
        ? { ...defaults.community, ...saved.community }
        : defaults.community,

      // ── ANNUAL REFLECTION ─────────────────────────────────────
      annualReflection: (saved.annualReflection && typeof saved.annualReflection === 'object')
        ? { ...defaults.annualReflection, ...saved.annualReflection }
        : defaults.annualReflection,

      // ── PRACTICE HISTORY ──────────────────────────────────────
      practiceHistory: (saved.practiceHistory && typeof saved.practiceHistory === 'object')
        ? { ...defaults.practiceHistory, ...saved.practiceHistory }
        : defaults.practiceHistory,

      // ── PREFERENCES ───────────────────────────────────────────
      speechRate: (typeof saved.speechRate === 'number') ? saved.speechRate : 0.9,
      activityPreferences: (saved.activityPreferences && typeof saved.activityPreferences === 'object')
        ? saved.activityPreferences
        : {},

      // v8: movementIdentity migrated string|null -> string[]. Existing
      // single values are wrapped, not dropped, so nobody's prior
      // selection is silently lost on this deploy.
      movementIdentity: Array.isArray(saved.movementIdentity)
        ? saved.movementIdentity
        : (saved.movementIdentity ? [saved.movementIdentity] : []),

      lastProposalType: saved.lastProposalType || null,
      lastProposalDate: saved.lastProposalDate || null,

      coachStyle: saved.coachStyle || 'nurturing',
      tier:       saved.tier       || 'free'
    };
  },

  getDefaults() {
    return {

      // ── ONBOARDING (top-level flags) ─────────────────────────
      onboardingComplete: false,
      onboardingStep: 1,

      // ── ONBOARDING THREAD AND BEATS (nested object — v6 + v7) ─
      // v6 original: castleShownAt, hardBeforeSelections,
      //              hardBeforeShownAt, reflectionShownAt
      // v7 new:      primaryTerritory, threadStartedAt,
      //              threadCompletedAt
      onboarding: {
        // ── Thread timing (v7) ───────────────────────────────
        threadStartedAt:     null,  // ISO string|null — written when thread.js Step 1 renders
        threadCompletedAt:   null,  // ISO string|null — written when thread.js Step 14 completes

        // ── Hard Before territory (v6 + v7) ──────────────────
        hardBeforeSelections: [],   // string[]        — territory IDs selected in Step 3a
        hardBeforeShownAt:   null,  // ISO string|null — Step 3a timing
        primaryTerritory:    null,  // string|null     — single territory confirmed in Step 3b;
                                    //                   read by beat3-scripts.js
                                    //                   getDominantTerritory()

        // ── Beat 3 reflection (v6) ────────────────────────────
        reflectionShownAt:   null,  // ISO string|null — Step 4 timing

        // ── Beat 1: The Castle (v6 — field kept for analytics) ─
        castleShownAt:       null   // ISO string|null — arrival.js retired but field preserved
      },

      // ── PROFILE ───────────────────────────────────────────────
      name: '',
      ageBand: null,
      age: null,          // DEPRECATED — kept for migration only. Do not write new values.
      gender: null,
      hormonalTracking: false,

      // coachStyle: 'nurturing'|'steady'|'energetic'|'minimal'
      // Beta: Nurturing voice delivers for all style settings silently.
      // Free tier: Nurturing locked. Personal+: all styles selectable.
      coachStyle: 'nurturing',

      // tier: 'free'|'personal'|'athlete'
      // Athlete unlocked within Personal — no extra charge.
      tier: 'free',

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
        activityLevel:   null,  // sedentary|light|moderate|active|very-active
        stressLevel:     null,  // low|moderate|high|very-high
        sleepQuality:    null,  // poor|okay|good
        exerciseHistory: null,  // 'never'|'lapsed'|'returning'|'active'
        returningAfter:  null   // 'injury'|'illness'|'life'|'burnout'|null
      },

      // ── EQUIPMENT ────────────────────────────────────────────
      equipment: [],
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
        programmeId:              null,
        programmeName:            '',
        startDate:                null,
        currentWeek:              1,
        currentPhase:             null,
        sessionsThisWeek:         0,
        totalSessions:            0,
        milestones:               [],
        completed:                false,
        completedAt:              null,
        phase:                    1,
        weekPlan:                 null,
        sessionSequence:          [],
        missedSessions:           [],
        midProgrammeGlanceShown:  false,
        programmeReflectionShown: false
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

      // ── CHECK-IN ENGINE STATE ─────────────────────────────────
      checkin: {
        lastOpeningMode:      null,
        openingModeHistory:   [],
        feelingWordDepth:     1,
        lastMilestoneNoticed: null
      },

      // ── MINDFUL PROMPT ENGINE ─────────────────────────────────
      mindfulPromptDepth:     1,
      mindfulPromptFrequency: 'automatic',

      // ── EMPATHY TRANSFER (new, v9) ─────────────────────────────
      // 5-stage, session-count-gated prompt system. See
      // alongside_empathy_transfer_prompts_19may2026_v1.docx and
      // reflect.js v2 for the full mechanic. All defaults below match
      // the spec's "Store Schema Additions" table exactly.
      empathyTransferStage:     1,  // integer 1-5, current stage
      empathyPromptsFired:      0,  // integer, total prompts fired all time
      empathyPromptsAtStage:    0,  // integer, resets to 0 on stage advance
      lastEmpathyPromptSession: 0,  // integer, session count at last fire
      empathyPromptSkips:       0,  // integer, consecutive skip streak —
                                     // resets to 0 on any non-skip response

      // ── LAST CHECK-IN ─────────────────────────────────────────
      lastCheckin: {
        feelingWord:     null,
        feelingQuadrant: null,
        unwell:          false,
        timestamp:       null
      },

      // ── CHECK-IN HISTORY ──────────────────────────────────────
      // Plain object keyed by "YYYY-MM-DD". NOT an array.
      checkinHistory: {},

      // ── ABSENCE AND RETURN ────────────────────────────────────
      absence: {
        context:    null,
        capturedAt: null
      },

      // ── TEXT-TO-SPEECH ────────────────────────────────────────
      speechRate: 0.9,

      // ── ACTIVITY PREFERENCES ──────────────────────────────────
      activityPreferences: {},

      // v8: was string|null (single-select). Now string[] — multi-select,
      // agreed 13 May, rebuilt 05 Jul. e.g. ['gym','running','walking'],
      // or ['mixed'] for "a mix of things" (mutually exclusive with the
      // named identities — see settings.js renderMovementSection()).
      movementIdentity: [],

      sessionLocation:     null,
      lastProposalType:    null,
      lastProposalDate:    null,

      // ── CHECK-IN NOTIFICATION ────────────────────────────────
      checkInNotification: {
        enabled:           false,
        time:              null,
        permissionGranted: false
      },

      // ── NOTICING HUB ──────────────────────────────────────────
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
        time:     null
      },

      // ── NOTICING PROGRESS ─────────────────────────────────────
      noticingProgress: {
        territoriesVisited: [],
        seriesProgress:     {},
        seriesUnlockedAt:   {},
        lastTerritoryId:    null
      },

      // ── SESSION BUILDER ───────────────────────────────────────
      generatedSession: {
        session: null,
        builtAt: null,
        inputs:  {}
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

      // ── WEIGHT AND WATER LOGS ─────────────────────────────────
      weightLog: [],
      waterLog:  [],

      waterSettings: {
        dailyTargetMl:    2000,
        remindersEnabled: false,
        reminderCount:    2,
        windowStart:      9,
        windowEnd:        21
      },

      waterReminderEnabled: false,
      lastWaterReminder:    null,

      // ── COACH OFFERS ──────────────────────────────────────────
      coachOffers: {
        shown:    {},
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

      // ── COMMUNITY AND IMPACT ──────────────────────────────────
      community: {
        credits:             0,
        lastCreditAt:        null,
        quarterlyAllocation: null,
        lastAllocationAt:    null,
        totalAllocated:      0
      },

      // ── ANNUAL REFLECTION ─────────────────────────────────────
      annualReflection: {
        lastGeneratedAt:  null,
        lastReadAt:       null,
        chaptersUnlocked: 0
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
  },

  /**
   * logActivity(entry) — the single shared write path for activityLog.
   * 16 Jul 2026, v10 (S4-B3-3). Added to fix a confirmed duplicate/phantom-
   * write bug: coach-reflection.js, workout.js, and yoga-session.js were
   * each writing to activityLog directly, with no shared contract and no
   * protection against double-firing. Root cause (phantom write on mere
   * activity selection, before completion) is fixed at the call sites —
   * this function is the defensive backstop, not the primary fix.
   *
   * Assigns an id if the entry doesn't already have one. Rejects (returns
   * null, does not write) if an entry already exists with the same `type`
   * and a `completedAt` within `dedupeWindowMs` of the new entry's
   * completedAt — this catches genuine accidental double-fires.
   *
   * 30 Jul 2026 — dedupeWindowMs default reduced from 2 minutes to 10
   * seconds. Found on-device testing the yoga-session.js v6 fix (same
   * day): two genuinely different, real yoga completions 83 seconds
   * apart were rejected as a dupe — the 2-minute window was built to
   * catch near-instantaneous accidental double-fires (a double-tap, or
   * exactly the stuck-screen re-tap bug just fixed in yoga-session.js
   * v6), which happen within a second or two, not two minutes. 10
   * seconds still comfortably covers a slow-rendering device where
   * someone taps again after a couple seconds of apparent nothing,
   * while no longer catching two real, distinct completions as a false
   * positive. No caller overrides this default — applies to every
   * activity type uniformly. Separately flagged, NOT fixed here: when a
   * write is rejected, the calling session view still shows its normal
   * "done" success screen with credits — the person has no way to know
   * the completion wasn't actually saved. That needs a coach-voiced
   * message, a content/UX decision, not a code-only fix — logged on the
   * master schedule.
   *
   * @param {object} entry — activityLog entry fields (id optional)
   * @param {number} [dedupeWindowMs=10000]
   * @returns {object|null} the written entry, or null if rejected as a dupe
   */
  logActivity(entry, dedupeWindowMs = 10 * 1000) {
    if (!entry || !entry.type) {
      console.error('Store: logActivity called without a type', entry);
      return null;
    }

    const log = this.data.activityLog || [];
    const newCompletedAt = entry.completedAt ? new Date(entry.completedAt).getTime() : Date.now();

    const isDupe = log.some(e => {
      if (e.type !== entry.type) return false;
      if (!e.completedAt) return false;
      const existingTime = new Date(e.completedAt).getTime();
      return Math.abs(existingTime - newCompletedAt) < dedupeWindowMs;
    });

    if (isDupe) {
      console.warn('Store: logActivity rejected a likely duplicate write', entry);
      return null;
    }

    const finalEntry = {
      id: entry.id || (new Date().toISOString() + '_' + Math.random().toString(36).slice(2, 6)),
      ...entry
    };

    this.data.activityLog = [...log, finalEntry];
    this.data.updatedAt = new Date().toISOString();
    this.save();
    return finalEntry;
  },

  /**
   * Award community credits after a completed session.
   * Personal tier users receive 2 credits; Free tier users receive 1.
   * Prevents duplicate credits within the same session (same-day guard).
   */
  awardCommunityCredit() {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = this.data.community?.lastCreditAt?.split('T')[0];
    if (lastDate === today) return;

    const creditsToAdd = this.data.tier === 'personal' || this.data.tier === 'athlete' ? 2 : 1;
    this.data.community.credits = (this.data.community.credits || 0) + creditsToAdd;
    this.data.community.lastCreditAt = new Date().toISOString();
    this.data.updatedAt = new Date().toISOString();
    this.save();
  }
};
