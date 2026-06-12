/**
 * store.js - Data persistence layer
 *
 * 12 Jun 2026 v2 — S4-4 addition: lastCheckin.timestamp (ISO string | null).
 *   Anchors the 2-hour return-visit trigger in intention.js (checkin-mini
 *   wiring). Stamped by intention.js on first render of the day as an
 *   interim measure until checkin.js writes it directly at submission
 *   (see light-touch follow-up note). Schema bumped to 1.5 — see schema.md.
 *
 * 12 Jun 2026 v1 — Consolidated schema pass. Adds all fields required for:
 *   - S4-5 (moodAfter replaces energyAfter on activityLog entries)
 *   - S4-6 (isEvent, eventName on activityLog entries)
 *   - S4-WP (Weekly Plan — weeklyPlan object)
 *   - S4-8 (event reminders — handled via activityLog entries + sw.js, no new top-level field)
 *   - Wellbeing & Long-Horizon spec Section 5 (10 Jun 2026 v2):
 *       lastCheckin.feelingWord/feelingQuadrant/unwell, checkinHistory entry additions,
 *       safeguarding, weeklyReview, weightLog, waterLog, waterSettings, coachOffers,
 *       unwellMode, foodPrompts, strategicGoal.planPresentedAt/measurementsOptIn
 *   - Guided Practice Library spec (10 Jun 2026 v1): practiceHistory (minimal —
 *       confirm shape in build session, no explicit delta given in source spec)
 *
 * This is a single consolidated pass per the touch-once rule. No further
 * sessions should add fields to store.js individually — confirm against this
 * file's version header before any future schema change.
 *
 * ---- PRIOR HISTORY ----
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
 *
 * 21 May 2026 v1 — journalEntries, noticingWeekInCycle, noticingLastTriggered,
 *                   generatedSession schema added for Noticing Hub + Session Builder.
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

      // ── S4-WP — Weekly Plan ──────────────────────────────────
      weeklyPlan: (saved.weeklyPlan && typeof saved.weeklyPlan === 'object')
                    ? { ...defaults.weeklyPlan, ...saved.weeklyPlan }
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

      // checkinHistory entries gain feelingWord, feelingQuadrant, contextNote.
      // Existing entries are left as-is (mergeWithDefaults does not rewrite
      // history); new entries are written with the full shape by checkin.js.
      checkinHistory: Array.isArray(saved.checkinHistory) ? saved.checkinHistory : [],

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
      // Shape not specified in source spec. Confirm in build session.
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
        setAt:               null,   // ISO timestamp

        // — Wellbeing & Long-Horizon F9 —
        planPresentedAt:     null,   // ISO timestamp — when detailed plan card first shown
        measurementsOptIn:   []      // array of measurement type strings user opted into
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
      //
      // Schema per entry:
      //   id, date, type, name, energyBefore, feel, painChange, note,
      //   source, completedAt, durationMins
      //
      //   moodAfter:  integer 1-10 | null  — S4-5. Replaces energyAfter.
      //   isEvent:    boolean              — S4-6. True for logged
      //                                       games/sport/events.
      //   eventName:  string | null        — S4-6. Display name for
      //                                       the event when isEvent true.
      activityLog: [],

      // Holds the in-progress activity entry during a session.
      // Written by intention.js, updated by reflect.js.
      currentActivityEntry: null,

      // ── TEXT-TO-SPEECH ────────────────────────────────────────
      // Coach card read-aloud feature. User-initiated only.
      // Rate: 0.75 = slow, 0.9 = normal, 1.2 = fast.
      // Never autoplays. Persists across sessions.
      speechRate: 0.9,

      // ── ACTIVITY PREFERENCES ──────────────────────────────────
      // Lightweight preference signal built from accepted proposals.
      // Keys are proposal type strings (e.g. "gym", "yoga", "quiet").
      // Values are acceptance counts. Incremented in coach-proposal.js.
      // Never resets — represents lifetime preference signal.
      activityPreferences: {},

      // ── MOVEMENT IDENTITY ─────────────────────────────────────
      // User's self-declared movement identity. Set in Settings Library
      // tab or inferred from activity history after 14+ sessions.
      // Used as the prior before enough activity data exists, and to
      // retip the scales when the user changes their primary activity
      // (e.g. joins a gym mid-use).
      // Values: "gym" | "yoga" | "running" | "walking" | "swimming"
      //         | "classes" | "mixed" | null
      movementIdentity: null,

      // ── SESSION LOCATION ─────────────────────────────────────
      // Set at check-in. Used by coach proposal to tailor suggestions.
      // "home" | "gym" | "outdoors" | null (not specified)
      // Cleared at next day's check-in. Weekly plan overrides this.
      sessionLocation: null,

      // ── COACH PROPOSAL ────────────────────────────────────────
      // Tracks the last proposal made to avoid identical repetition.
      // { type, date } — cleared on new day.
      lastProposalType: null,
      lastProposalDate: null,

      // ── CHECK-IN NOTIFICATION ────────────────────────────────
      // Opted-in reminder only. User must explicitly enable.
      // PERMITTED: warm tone, user-set time, single type, user-revocable.
      // PROHIBITED: streak framing, guilt framing, re-prompting after deny.
      checkInNotification: {
        enabled:           false,  // false until user toggles on
        time:              null,   // "HH:MM" 24hr string; null until set
        permissionGranted: false   // true only after browser API confirms
      },

      // ── NOTICING HUB ─────────────────────────────────────────
      // Journal entries — all saved reflections.
      // Schema per entry:
      //   id:          string  — ISO timestamp + random suffix
      //   date:        string  — ISO date e.g. "2026-05-21"
      //   type:        string  — "guided" | "free" | "weekly-noticing"
      //   prompt:      string  — the prompt shown (guided only)
      //   category:    string  — prompt category e.g. "movement", "nature"
      //   body:        string  — the user's written content
      //   tags:        array   — auto-tags derived from body
      //   createdAt:   string  — ISO timestamp
      journalEntries: [],

      // 6-week Noticing reflection cycle tracker.
      // Resets when 6 weeks are complete (starts again at week 1).
      noticingWeekInCycle:   1,      // 1-6
      noticingLastTriggered: null,   // ISO date — prevents duplicate triggers

      // ── SESSION BUILDER ──────────────────────────────────────
      // Holds a coach-generated session object produced by session-builder.js.
      // Read by gym-programme.js when no hardcoded PROGRAMME is active.
      // Schema:
      //   session:  object  — full session object matching PROGRAMME.sessions[0]
      //   builtAt:  string  — ISO timestamp
      //   inputs:   object  — { sessionType, durationMins, equipment, conditions }
      generatedSession: {
        session:  null,
        builtAt:  null,
        inputs:   {}
      },

      // ── WEEKLY PLAN (S4-WP) ───────────────────────────────────
      // User's intent-only plan for the week, set in My Week (Settings).
      // The coach generates the actual session on the day using
      // sessionType + durationMins; days not set fall back to normal
      // coach-proposal rules.
      //
      // Schema:
      //   days: {
      //     monday..sunday: {
      //       sessionType:  string | null  — 'gym' | 'rest' | 'recovery' | 'class' | null
      //       durationMins: number | null
      //       location:     string | null  — 'home' | 'gym' | 'outside' | null
      //       classFocus:   array           — up to 3 session focuses (gym days)
      //       enabled:      boolean         — on/off toggle for the day
      //     }
      //   }
      //   updatedAt: string | null — ISO timestamp, last edited
      weeklyPlan: {
        days: {
          monday:    { sessionType: null, durationMins: null, location: null, classFocus: [], enabled: false },
          tuesday:   { sessionType: null, durationMins: null, location: null, classFocus: [], enabled: false },
          wednesday: { sessionType: null, durationMins: null, location: null, classFocus: [], enabled: false },
          thursday:  { sessionType: null, durationMins: null, location: null, classFocus: [], enabled: false },
          friday:    { sessionType: null, durationMins: null, location: null, classFocus: [], enabled: false },
          saturday:  { sessionType: null, durationMins: null, location: null, classFocus: [], enabled: false },
          sunday:    { sessionType: null, durationMins: null, location: null, classFocus: [], enabled: false }
        },
        updatedAt: null
      },

      // ── LAST CHECK-IN (Wellbeing & Long-Horizon F1, F2, F7) ───
      // Snapshot of the most recent check-in. Existing fields preserved;
      // additions below are new in this pass.
      //
      //   feelingWord:     string | null — chosen word from quadrant set
      //   feelingQuadrant: string | null — 'lowLow' | 'lowHigh' | 'highLow' | 'highHigh'
      //   unwell:          boolean       — true if unwell mode entered at this check-in
      lastCheckin: {
        feelingWord: null,
        feelingQuadrant: null,
        unwell: false,
        timestamp: null
      },

      // ── CHECK-IN HISTORY (F1, F3, F6) ─────────────────────────
      // Each entry gains feelingWord, feelingQuadrant, contextNote
      // alongside existing check-in fields. Written by checkin.js.
      // contextNote: string | null — re-entry note after 4+ day gap
      checkinHistory: [],

      // ── SAFEGUARDING (F2) ─────────────────────────────────────
      // Adult safeguarding signal layer. Tracks last time a signal
      // word triggered a signposting response, to avoid repetition.
      safeguarding: {
        lastSignpostedAt: null   // ISO timestamp | null
      },

      // ── WEEKLY REVIEW (F3) ─────────────────────────────────────
      // Narrative-gated weekly report. Generated on first check-in
      // on/after Monday. Reading the narrative unlocks the data
      // layer (line graphs) until the next reporting point.
      weeklyReview: {
        periodStart:  null,   // ISO date — start of reporting period
        periodEnd:    null,   // ISO date — end of reporting period
        generatedAt:  null,   // ISO timestamp
        narrative:    null,   // string — generated narrative text
        readAt:       null,   // ISO timestamp | null — set when user confirms read
        dataUnlocked: false   // boolean — true once readAt is set, until next period
      },

      // ── WEIGHT LOG (F3) ────────────────────────────────────────
      // Weekly weight entries. { date, value }. Capped at 104 (2 years).
      weightLog: [],

      // ── WATER LOG (F3, F4) ─────────────────────────────────────
      // Daily water intake. { date, ml }. One entry per day. Capped at 90.
      waterLog: [],

      // ── WATER SETTINGS (F4, F5) ────────────────────────────────
      waterSettings: {
        dailyTargetMl:    2000,
        remindersEnabled: false,
        reminderCount:    2,
        windowStart:      9,    // hour, 24hr
        windowEnd:        21    // hour, 24hr
      },

      // ── COACH OFFERS (F5) ──────────────────────────────────────
      // Tracks coach-initiated settings conversations (e.g. water
      // reminders offer). Each offer shown at most once; a decline
      // is never re-pitched.
      //
      //   shown:    { [offerId]: ISO timestamp }
      //   declined: { [offerId]: ISO timestamp }
      coachOffers: {
        shown: {},
        declined: {}
      },

      // ── UNWELL MODE (F7) ────────────────────────────────────────
      // Kind-to-posture model. kind values:
      //   'body' | 'sensory' | 'mind' | 'depleted' | 'unspecified'
      unwellMode: {
        active:           false,
        kind:             null,   // see kind values above
        startedAt:        null,   // ISO timestamp
        recoveryStartedAt: null,  // ISO timestamp | null
        daysHeld:         0,      // number of days unwell mode has been active
        kindAtRecovery:   null    // kind value captured when recovery began
      },

      // ── FOOD PROMPTS (F8) ────────────────────────────────────────
      // Behaviour-level food prompt boundaries. No calorie figures,
      // no macro guidance, no restriction-based content.
      foodPrompts: {
        lastBalanceAt:   [],    // array of ISO timestamps
        lastEducationAt: null   // ISO timestamp | null — hunger/thirst education cadence
      },

      // ── PRACTICE HISTORY (Guided Practice Library) ───────────────
      // Minimal usage tracking for the Practice Library (Noticing Hub,
      // coach proposal, background audio surfaces). Shape not specified
      // in source spec — confirm/extend in build session before relying
      // on this field.
      //
      //   lastPlayed:  { [practiceId]: ISO timestamp }
      //   favourites:  array of practiceId strings
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
