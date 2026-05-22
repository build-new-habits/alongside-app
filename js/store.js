/**
 * store.js - Data persistence layer
 *
 * 22 May 2026 v2 --- weeklyPlan schema added (S4-3):
 *   weeklyPlanEnabled      --- master toggle (default false)
 *   weeklyPlan             --- seven day slots keyed by day name
 *   weeklyPlanSetAt        --- ISO timestamp of last save
 *   weeklyPlanPromptShown  --- true after coach nudge shown once (Personal tier)
 *
 *   Each day slot: { type, sessionType, durationMins, label,
 *                    notificationEnabled, notificationTime, activityName }
 *   type values: "gym" | "rest" | "recovery" | "class" | "open" (default)
 *
 * 21 May 2026 v1 --- journalEntries, noticingWeekInCycle, noticingLastTriggered,
 *                   generatedSession schema added for Noticing Hub + Session Builder.
 *
 * v1.7 --- checkInNotification schema (S3-6):
 *   Opted-in check-in reminder. Entirely user-initiated.
 *   Never shown without explicit opt-in. No shame-based framing permitted.
 *   Fields:
 *     enabled           --- false by default; user must toggle on
 *     time              --- "HH:MM" 24hr string; null until user sets one
 *     permissionGranted --- true only after browser Notification API confirms
 *
 *   Distinguished in code and comments from prohibited shame-based notification
 *   patterns. This feature: warm, single type, user-set time, user-revocable.
 *   Prohibited patterns: streak reminders, guilt framing, re-prompting on deny.
 *
 * v1.6 --- ageBand, conditionStatus/Stories/Names, consentGiven/At
 *
 * v1.2 --- Schema additions:
 *   prescribedExercises  --- externally prescribed exercises from physio/coach
 *                          Empty array in v1.2; UI built in Phase 3/4.
 *                          Added now so any user data captured in the field
 *                          from here forwards is correctly persisted.
 *
 *   conditionPainScores  --- today's per-condition pain scores from check-in
 *                          { [conditionId]: 0-10 }
 *                          Used by the 3-tier condition filter to resolve
 *                          phase-aware condition variants (acute/subacute).
 *                          Replaces the previous approach of storing only
 *                          a flat conditions[] array with no pain context.
 *
 * v1.1 --- Strategic layer additions:
 *   strategicGoal   --- user's primary goal with target details
 *   activeProgramme --- which plan they're on + current week/phase
 *   progressLog     --- session history for the progress dashboard
 */

export const store = {

  STORAGE_KEY: "alongside_user",
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
      console.error("Store: Error loading data", e);
      this.data = this.getDefaults();
    }
    console.log("---- Store initialised");
  },

  /**
   * Merge saved data with defaults so new schema fields appear
   * for users who onboarded before this version was deployed.
   * Existing data is never overwritten --- only missing keys are filled.
   */
  mergeWithDefaults(saved) {
    const defaults = this.getDefaults();

    // Build default day slot for any missing day in weeklyPlan
    const defaultDay = defaults.weeklyPlan.monday;
    const mergedWeeklyPlan = {};
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const savedPlan = (saved.weeklyPlan && typeof saved.weeklyPlan === "object") ? saved.weeklyPlan : {};
    days.forEach(day => {
      mergedWeeklyPlan[day] = { ...defaultDay, ...(savedPlan[day] || {}) };
    });

    return {
      ...defaults,
      ...saved,
      lifestyle:             { ...defaults.lifestyle,            ...(saved.lifestyle            || {}) },
      strategicGoal:         { ...defaults.strategicGoal,        ...(saved.strategicGoal        || {}) },
      activeProgramme:       { ...defaults.activeProgramme,      ...(saved.activeProgramme      || {}) },
      progressLog:           Array.isArray(saved.progressLog)          ? saved.progressLog          : [],
      prescribedExercises:   Array.isArray(saved.prescribedExercises)  ? saved.prescribedExercises  : [],
      activityLog:           Array.isArray(saved.activityLog)          ? saved.activityLog          : [],
      journalEntries:        Array.isArray(saved.journalEntries)        ? saved.journalEntries        : [],
      noticingWeekInCycle:   saved.noticingWeekInCycle   || 1,
      noticingLastTriggered: saved.noticingLastTriggered || null,
      generatedSession:      saved.generatedSession      || { session: null, builtAt: null, inputs: {} },
      conditionPainScores:   (saved.conditionPainScores && typeof saved.conditionPainScores === "object")
                               ? saved.conditionPainScores
                               : {},
      checkInNotification:   (saved.checkInNotification && typeof saved.checkInNotification === "object")
                               ? { ...defaults.checkInNotification, ...saved.checkInNotification }
                               : defaults.checkInNotification,
      speechRate:            (typeof saved.speechRate === "number") ? saved.speechRate : 0.9,
      activityPreferences:   (saved.activityPreferences && typeof saved.activityPreferences === "object")
                               ? saved.activityPreferences
                               : {},
      movementIdentity:      saved.movementIdentity   || null,
      lastProposalType:      saved.lastProposalType   || null,
      lastProposalDate:      saved.lastProposalDate   || null,
      // ------ WEEKLY PLAN ------------------------------------------------------------------------------------------------------------------------------------------------------------
      weeklyPlanEnabled:     (typeof saved.weeklyPlanEnabled === "boolean") ? saved.weeklyPlanEnabled : false,
      weeklyPlan:            mergedWeeklyPlan,
      weeklyPlanSetAt:       saved.weeklyPlanSetAt       || null,
      weeklyPlanPromptShown: saved.weeklyPlanPromptShown || false,
    };
  },

  getDefaults() {
    // Default structure for a single day slot in the weekly plan
    const defaultDaySlot = {
      type:                "open",   // "gym" | "rest" | "recovery" | "class" | "open"
      sessionType:         null,     // session builder type id e.g. "lower", "full" --- gym days only
      durationMins:        null,     // target duration --- gym days only; null = coach decides
      label:               null,     // user-facing label e.g. "Lower body" --- optional
      notificationEnabled: false,    // whether a notification is set for this day
      notificationTime:    null,     // "HH:MM" 24hr --- null until user sets one
      activityName:        null,     // for class type: e.g. "Body Balance", "Tennis"
    };

    return {
      // ------ ONBOARDING ---------------------------------------------------------------------------------------------------------------------------------
      onboardingComplete: false,
      onboardingStep: 1,

      // ------ PROFILE --- Step 2 ---------------------------------------------------------------------------------------------------------------
      name: "",

      // ------ ABOUT --- Step 3 ---------------------------------------------------------------------------------------------------------------------
      age: null,
      gender: null,
      hormonalTracking: false,

      // ------ BODY & TARGETS --- Step 4 ------------------------------------------------------------------------------------------
      weight: null,
      weightUnit: "kg",
      targetWeight: null,
      targetDate: null,
      targetDescription: "",

      // ------ GOALS --- Step 5 ---------------------------------------------------------------------------------------------------------------------
      // Flat array of goal IDs --- drives exercise filter engine
      goals: [],

      // ------ CONDITIONS --- Step 6 ------------------------------------------------------------------------------------------------------
      // Flat array of condition IDs selected during onboarding.
      // Phase variants (acute/subacute) are derived at runtime from
      // conditionPainScores --- never stored directly.
      conditions: [],

      // Today's pain scores per condition --- updated at each check-in.
      // { [conditionId]: 0-10 }
      // Used by getActiveConditionIds() to resolve phase variants.
      conditionPainScores: {},

      // ------ LIFESTYLE --- Step 7 ---------------------------------------------------------------------------------------------------------
      lifestyle: {
        activityLevel: null,
        stressLevel: null,
        sleepQuality: null
      },

      // ------ EQUIPMENT --- Step 8 ---------------------------------------------------------------------------------------------------------
      equipment: [],

      // ------ PRESCRIBED EXERCISES ---------------------------------------------------------------------------------------------------
      // Exercises prescribed by an external professional (physio,
      // coach, consultant). These are surfaced in the workout view
      // alongside coach-generated exercises when relevant.
      //
      // Schema (per item):
      //   id:           string    --- unique ID e.g. "prescribed-001"
      //   exerciseId:   string    --- ID from exercises database, or null
      //   name:         string    --- display name (may differ from DB)
      //   description:  string    --- what the professional prescribed
      //   frequency:    string    --- e.g. "2x daily", "after exercise"
      //   prescribedBy: string    --- professional's name or role
      //   prescribedAt: string    --- ISO date string
      //   active:       boolean   --- whether still in current programme
      prescribedExercises: [],

      // ------ STRATEGIC GOAL ---------------------------------------------------------------------------------------------------------------------
      // Richer than goals[] --- drives programme selection and rationale.
      // goals[] still drives daily exercise filtering (unchanged).
      strategicGoal: {
        primaryGoal:         null,   // goal ID e.g. "lose-weight"
        targetDescription:   "",     // plain text e.g. "Look great for holiday"
        targetDate:          null,   // ISO date string
        targetValue:         null,   // numeric e.g. 168
        targetUnit:          null,   // "lbs" | "kg" | "km" | "miles" | null
        weeklySessionTarget: 3,      // sessions per week commitment
        setAt:               null    // ISO timestamp
      },

      // ------ ACTIVE PROGRAMME ---------------------------------------------------------------------------------------------------------------
      activeProgramme: {
        programmeId:      null,    // e.g. "beginner-fitness"
        programmeName:    "",      // display name
        startDate:        null,    // ISO date string
        currentWeek:      1,       // 1-12
        currentPhase:     null,    // "build" | "push" | "peak" | "recovery"
        sessionsThisWeek: 0,       // resets each Monday
        totalSessions:    0,       // lifetime on this programme
        milestones:       [],      // [{ id, label, achievedAt }]
        completed:        false,
        completedAt:      null
      },

      // ------ PROGRESS LOG ---------------------------------------------------------------------------------------------------------------------------
      // One entry per completed session, max 90.
      // { date, week, phase, focus, energyAtCheckin, conditionScores,
      //   durationMinutes, exerciseCount, milestoneAchieved }
      progressLog: [],

      // ------ GYM PROGRAMME ------------------------------------------------------------------------------------------------------------------------
      gymProgrammeSession: "A",
      gymProgrammeWeek:    1,

      // ------ ACTIVITY LOG ---------------------------------------------------------------------------------------------------------------------------
      // Every completed activity writes one entry here regardless
      // of path (coach-recommended, self-directed, quiet).
      // Schema per entry: id, date, type, name, energyBefore,
      // energyAfter, feel, painChange, note, source, completedAt
      activityLog: [],

      // Holds the in-progress activity entry during a session.
      // Written by intention.js, updated by reflect.js.
      currentActivityEntry: null,

      // ------ TEXT-TO-SPEECH ------------------------------------------------------------------------------------------------------------------------
      // Coach card read-aloud feature. User-initiated only.
      // Rate: 0.75 = slow, 0.9 = normal, 1.2 = fast.
      // Never autoplays. Persists across sessions.
      speechRate: 0.9,

      // ------ ACTIVITY PREFERENCES ------------------------------------------------------------------------------------------------------
      // Lightweight preference signal built from accepted proposals.
      // Keys are proposal type strings (e.g. "gym", "yoga", "quiet").
      // Values are acceptance counts. Incremented in coach-proposal.js.
      // Never resets --- represents lifetime preference signal.
      activityPreferences: {},

      // ------ MOVEMENT IDENTITY ---------------------------------------------------------------------------------------------------------------
      // User's self-declared movement identity. Set in Settings Library
      // tab or inferred from activity history after 14+ sessions.
      // Values: "gym" | "yoga" | "running" | "walking" | "swimming"
      //         | "classes" | "mixed" | null
      movementIdentity: null,

      // ------ SESSION LOCATION ---------------------------------------------------------------------------------------------------------------
      // Set at intention screen ("Suggest something for me" path).
      // Used by coach proposal to tailor suggestions.
      // "home" | "gym" | "outdoors" | null (not specified)
      // Cleared at next day's check-in. Weekly plan overrides this.
      sessionLocation: null,

      // ------ OPEN GYM SUB FLAG ---------------------------------------------------------------------------------------------------------------
      // Set by intention.js when user taps Gym session chip.
      // Read by coach-proposal.js render() to jump straight to gym-sub state.
      openGymSub: false,

      // ------ COACH PROPOSAL ------------------------------------------------------------------------------------------------------------------------
      // Tracks the last proposal made to avoid identical repetition.
      // { type, date } --- cleared on new day.
      lastProposalType: null,
      lastProposalDate: null,

      // ------ CHECK-IN NOTIFICATION ------------------------------------------------------------------------------------------------
      // Opted-in reminder only. User must explicitly enable.
      // PERMITTED: warm tone, user-set time, single type, user-revocable.
      // PROHIBITED: streak framing, guilt framing, re-prompting after deny.
      checkInNotification: {
        enabled:           false,  // false until user toggles on
        time:              null,   // "HH:MM" 24hr string; null until set
        permissionGranted: false   // true only after browser API confirms
      },

      // ------ NOTICING HUB ---------------------------------------------------------------------------------------------------------------------------
      // Journal entries --- all saved reflections.
      // Schema per entry:
      //   id:        string --- ISO timestamp + random suffix
      //   date:      string --- ISO date e.g. "2026-05-22"
      //   type:      string --- "guided" | "free" | "weekly-noticing"
      //   prompt:    string --- the prompt shown (guided only)
      //   category:  string --- prompt category e.g. "movement", "nature"
      //   body:      string --- the user's written content
      //   tags:      array  --- auto-tags derived from body
      //   createdAt: string --- ISO timestamp
      journalEntries: [],

      // 6-week Noticing reflection cycle tracker.
      // Resets when 6 weeks are complete (starts again at week 1).
      noticingWeekInCycle:   1,     // 1-6
      noticingLastTriggered: null,  // ISO date --- prevents duplicate triggers

      // ------ SESSION BUILDER ------------------------------------------------------------------------------------------------------------------
      // Holds a coach-generated session object produced by session-builder.js.
      // Read by gym-programme.js when no hardcoded PROGRAMME is active.
      // Schema:
      //   session:  object --- full session object matching PROGRAMME.sessions[0]
      //   builtAt:  string --- ISO timestamp
      //   inputs:   object --- { sessionType, durationMins, equipment, conditions }
      generatedSession: {
        session:  null,
        builtAt:  null,
        inputs:   {}
      },

      // ------ WEEKLY PLAN ------------------------------------------------------------------------------------------------------------------------------
      // Optional movement template --- tells the coach what is planned
      // each day of the week. Toggle off = coach ignores it entirely.
      // Toggle on = coach reads today's slot and proposes accordingly.
      // Partial plans work: unset days fall back to normal rules.
      //
      // weeklyPlanEnabled: master toggle --- false by default.
      // weeklyPlan: seven day slots keyed by lowercase day name.
      // weeklyPlanSetAt: ISO timestamp of last save --- used for coach nudge logic.
      // weeklyPlanPromptShown: true after Personal-tier nudge has been shown once.
      //
      // Per-day slot schema:
      //   type               --- "gym" | "rest" | "recovery" | "class" | "open"
      //   sessionType        --- session builder type id (gym days only)
      //   durationMins       --- target duration in minutes (gym days only; null = coach decides)
      //   label              --- user-facing label e.g. "Lower body" (optional)
      //   notificationEnabled --- whether a notification is set for this day
      //   notificationTime   --- "HH:MM" 24hr string; null until set
      //   activityName       --- class name e.g. "Body Balance" (class type only)
      weeklyPlanEnabled:     false,
      weeklyPlan: {
        monday:    { ...defaultDaySlot },
        tuesday:   { ...defaultDaySlot },
        wednesday: { ...defaultDaySlot },
        thursday:  { ...defaultDaySlot },
        friday:    { ...defaultDaySlot },
        saturday:  { ...defaultDaySlot },
        sunday:    { ...defaultDaySlot },
      },
      weeklyPlanSetAt:       null,
      weeklyPlanPromptShown: false,

      // ------ METADATA ---------------------------------------------------------------------------------------------------------------------------------------
      createdAt: null,
      updatedAt: null
    };
  },

  get(path) {
    if (!this.data) this.init();
    if (!path) return this.data;
    const keys = path.split(".");
    let value = this.data;
    for (const key of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[key];
    }
    return value;
  },

  set(path, value) {
    if (!path) return;
    const keys = path.split(".");
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
      console.error("Store: Error saving data", e);
    }
  },

  reset() {
    this.data = this.getDefaults();
    this.save();
    console.log("---- Store reset");
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
   * @param {Object} painScores --- { [conditionId]: 0-10 }
   */
  updateConditionPainScores(painScores) {
    this.data.conditionPainScores = { ...painScores };
    this.data.updatedAt = new Date().toISOString();
    this.save();
  },

  /**
   * Log a completed session --- called from workout-complete view.
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
