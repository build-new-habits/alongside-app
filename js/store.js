/**
 * store.js - Data persistence layer
 * 11 Aug 2026 v28
 *
 * 11 Aug 2026 v28 - logLift() generalised from weight-and-reps to any
 *   metric the exercise actually produces: speed, incline, resistance
 *   level, distance, duration, band tension, free note. liftLogEnabled
 *   now defaults true -- a recording feature that is off by default is
 *   one nobody uses.
 *
 * 11 Aug 2026 v27 - capability{} values are strings, not booleans, so a
 *   wheelchair user can answer "No" rather than approximating themselves
 *   to "not easily". Adds needsSeated to capabilityProfile().
 *
 * 11 Aug 2026 v26 - CAP-3. New trainingIntent field
 *   ('improve' | 'maintain' | 'recover'). Intent, never trajectory --
 *   the app may observe direction, it must never narrate it.
 *
 * 11 Aug 2026 v25 - CAP-1. New capability{} field and
 *   capabilityProfile(), answering "if we are not age restricting, how
 *   do we ensure the appropriate level for that user?". Four questions
 *   measuring capacity rather than frequency. See getDefaults().
 *
 * 11 Aug 2026 v24 - Empty-session guard in logActivity(). Opening a
 *   session and exiting without completing anything wrote an activity
 *   entry. Guarded at the single write path rather than across the ten
 *   views that share the savePartialSession() pattern.
 *
 * 11 Aug 2026 v23
 *
 * 11 Aug 2026 v23 - CONT-2. New field sessionVariety, closing the
 *   "novelty vs predictability has no explicit preference capture" gap
 *   the persona matrix has carried open since 05 Jul. See getDefaults()
 *   for the full reasoning.
 *
 * 11 Aug 2026 v22
 *
 * 11 Aug 2026 v22 - CONT-1. New field exerciseHistory, plus
 *   recordExercises()/exerciseStats()/lastPerformance() helpers.
 *
 *   WHY THIS EXISTS. Until now the product recorded that a session
 *   happened and how many exercises it contained -- activityLog entries
 *   carry `exercisesCount: 3`, a number -- and never which exercises
 *   they were. Nothing anywhere persisted what a person had actually
 *   done.
 *
 *   That single absence is why session selection had no choice but to
 *   be random over 497 exercises, and therefore why the product could
 *   not support progressive overload (you cannot get stronger at an
 *   exercise you meet once), skill acquisition (you cannot correct a
 *   fault you never repeat, which makes the whole watchOut library
 *   decorative), or familiarity (the nervous beginner needs to
 *   recognise the session, and constant novelty is exciting only for
 *   the already-confident).
 *
 *   exerciseHistory is a compact map keyed by exercise id:
 *     { [exerciseId]: { n, first, last, best } }
 *       n     - times completed, all time
 *       first - ISO timestamp of first completion
 *       last  - ISO timestamp of most recent completion
 *       best  - optional { weight, reps, unit, at } performance note
 *
 *   Deliberately a map rather than an append-only log: selection needs
 *   "how often, how recently" on every candidate on every build, and a
 *   growing array would mean scanning thousands of entries per session
 *   on a phone. The full narrative already lives in activityLog.
 *
 *   PRIVACY NOTE. This records movement only. It is not subject to the
 *   Journal Privacy Rule because it contains no written reflection --
 *   but it is per-exercise behavioural data, so it is never used to
 *   comment on a person's consistency or decline. Locked Principle P4
 *   applies: the app may display, the coach never interprets.
 *
 * 11 Aug 2026 v21 - PT-12, the reader-without-writer sweep. Three changes,
 *   all closing the same pattern rather than another instance of it:
 *   (1) new logExerciseFeedback() — exerciseFeedback has been READ by
 *       applyFeedbackWeighting() since exercises/index.js v1.3 with nothing
 *       ever writing it, so that weighting has never run on real data.
 *   (2) exerciseFeedback declared in getDefaults()/mergeWithDefaults() —
 *       it was read but never declared.
 *   (3) absence.returnCapturedAt declared — written by programmeEngine.js
 *       and surviving only via the ...saved spread, exactly the migration
 *       loss risk PT-10 flagged.
 *
 * 11 Aug 2026 v20 - New fields liftLogEnabled (bool, default false) and
 *   liftLog ({ [exerciseId]: entry[] }), plus logLift()/lastLift() helpers.
 *   PT-4, rescoped from analytics to a memory aid on Graeme's framing:
 *   knowing what you set the machine to last week, not tracking progress.
 *   Governed by locked principle P4 - the app may display load, the coach
 *   never interprets it. lastLift() returns the entry only and deliberately
 *   computes no delta, so there is nothing for a caller to narrate.
 *
 * 11 Aug 2026 v19 - New nested field consent{} (given, at, policyVersion,
 *   ageConfirmed), restoring the legal consent record that has been absent
 *   from live onboarding since OB-THREAD retired welcome.js. See the
 *   getDefaults() note for why it is nested, why it is an affirmative tick
 *   rather than implied consent, and why policyVersion matters. Added to
 *   getDefaults() and mergeWithDefaults() with an explicit guard so a real
 *   record is never overwritten by defaults. ageConfirmed is reserved and
 *   stays null while the age gate is inert.
 *
 * 09 Aug 2026 v18 - New field inStepProgress, for the "In Step" Noticing
 *   Hub feature (Personal tier). Deliberately NOT named with "territory"
 *   anywhere in it — onboarding already owns that word for an unrelated
 *   concept (primaryTerritory/hardBeforeSelections). Shape: unlockedAt
 *   ({ [movementId]: ISO } — gates the 3-day anti-binge cooldown between
 *   scenarios in the same movement), scenarioIndex ({ [movementId]: int }
 *   — cycles through js/data/in-step-scenarios.js's four-scenario pools),
 *   completedCount ({ [movementId]: int } — display only), choiceLog
 *   (array of { movementId, scenarioId, optionId, tag, at } — aggregate
 *   research signal only; never read by coach logic, never surfaced to
 *   the user per-entry, never used to change what's offered next — see
 *   in-step.js header note). Added to getDefaults() and
 *   mergeWithDefaults(), same pattern as noticingProgress (v7) below.
 * 04 Aug 2026 v17 - New field exercisePreferences + setExercisePreference()
 *   helper, applying the already-approved alongside_exercise_skip_
 *   dislike_spec_16may2026_v1.docx to the condition-programme candidate
 *   list. Binary signal only ('avoid'|'less'), not a rating — per spec
 *   §6, no stars, no scores. First real consumer: js/data/
 *   conditionProgrammes.js. The full spec's in-session Skip flow
 *   (gym-programme.js/prescribed-session.js/core-session.js) remains
 *   separate, larger future work — not attempted here.
 * 04 Aug 2026 v16
 *
 * 04 Aug 2026 v16 - Two additions, same day as the condition-programme
 *   build. (1) prescribedExercises entries can now carry an optional
 *   conditionId — additive, nullable, existing entries unaffected —
 *   so a coach-built/coach-recommended/self-built programme can be
 *   scoped to the condition it's actually for, not one shared flat
 *   list. No top-level schema change for this, just documented in
 *   Schema.md (the field lives inside array entries, not getDefaults()).
 *   (2) New top-level field prescribedExercisesActiveCondition —
 *   single-use context flag, set by conditions-update.js's "Build my
 *   own" right before navigating to prescribed.js, read and cleared
 *   immediately by that file so it can never leak into an unrelated
 *   later visit.
 * 04 Aug 2026 v15
 *
 * 04 Aug 2026 v15 - Phase D-1 (schema), Conditions Update. Two new fields:
 *   conditionGoals (felt-sense per-condition goal — 'healed'|'cope'|
 *   'improve' + optional note, new setConditionGoal() helper) and
 *   prescribedExercisesOrigin ('professional'|'self'|null, lets
 *   prescribed.js branch its coach voice correctly depending on entry
 *   context). See Phase D blueprint v2, decisions D-1/D-2. Also caught:
 *   Schema.md had fallen a step behind this file (pendingDoorRoute, v14,
 *   was never documented there) — corrected in the same pass.
 * 04 Aug 2026 v14 - New field pendingDoorRoute: remembers which Home
 *   door a person tapped when that door requires check-in first
 *   (Cardio/Core/Strength, Unsure? Coach decides). Set by today.js,
 *   read and cleared by checkin.js/checkin-mini.js on completion, so
 *   the person lands where they actually meant to go instead of the
 *   generic post-check-in default. Graeme's fix: reaching a session-
 *   generating screen without ever checking in defeats its adaptation.
 * 04 Aug 2026 v13 - New field severePainChoices + recordSeverePainChoice()
 *   helper, for the Severe pain Rest/Adapt choice (coach-proposal.js
 *   v17). One record per date + exact severe-condition-id set — an
 *   active choice log, not a single "last preference" value, so a
 *   changed severe set always re-prompts and history of what was
 *   actually chosen is preserved.
 * 04 Aug 2026 v12 - Home Nav & Conditions Redesign, Phase A (schema-first,
 *   per blueprint alongside_blueprint_home-navigation-conditions_04aug2026_v1.md).
 *   Two new fields: conditionReflections (array — deliberately separate
 *   namespace from journalEntries, NOT subject to the Journal Privacy
 *   Rule, coach-readable by design) and conditionFoldInLevel ('partial'|
 *   'mostly'|'all'|null — the condition-programme fold-in dial setting).
 *   Both added to getDefaults() and mergeWithDefaults(), same pattern as
 *   neighbouring fields. No behaviour change to any existing field.
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

      // ── LIFT LOG (v20) ────────────────────────────────────────
      // Default changed false -> true, 11 Aug 2026. Graeme: "I would like
      // an option to add details into the card... Not after the session,
      // straight in the card before clicking next. I'll never remember
      // otherwise." A recording feature that is off by default is a
      // recording feature nobody uses, and the note is only useful if it
      // exists by the time the exercise comes round again. Still
      // switchable off in Settings, and every field remains optional --
      // nothing is ever required to complete a session.
      liftLogEnabled: typeof saved.liftLogEnabled === 'boolean' ? saved.liftLogEnabled : true,
      liftLog: (saved.liftLog && typeof saved.liftLog === 'object' && !Array.isArray(saved.liftLog))
        ? saved.liftLog
        : {},

      // ── CONSENT (v19) ─────────────────────────────────────────
      // Never overwrite a real consent record with defaults — an existing
      // user's timestamp and policyVersion are a legal audit trail.
      consent: (saved.consent && typeof saved.consent === 'object')
        ? { ...defaults.consent, ...saved.consent }
        : defaults.consent,

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
      exerciseFeedback:    Array.isArray(saved.exerciseFeedback)    ? saved.exerciseFeedback    : [],
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

      // ── IN STEP PROGRESS ───────────────────────────────────────
      inStepProgress: (saved.inStepProgress && typeof saved.inStepProgress === 'object')
        ? {
            ...defaults.inStepProgress,
            ...saved.inStepProgress,
            unlockedAt:     (saved.inStepProgress.unlockedAt
                              && typeof saved.inStepProgress.unlockedAt === 'object')
                              ? saved.inStepProgress.unlockedAt
                              : {},
            scenarioIndex:  (saved.inStepProgress.scenarioIndex
                              && typeof saved.inStepProgress.scenarioIndex === 'object')
                              ? saved.inStepProgress.scenarioIndex
                              : {},
            completedCount: (saved.inStepProgress.completedCount
                              && typeof saved.inStepProgress.completedCount === 'object')
                              ? saved.inStepProgress.completedCount
                              : {},
            choiceLog: Array.isArray(saved.inStepProgress.choiceLog)
              ? saved.inStepProgress.choiceLog
              : []
          }
        : defaults.inStepProgress,

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

      // ── CONDITION REFLECTIONS / FOLD-IN (new 04 Aug 2026, Home Nav Phase A) ──
      // conditionReflections: deliberately separate from journalEntries above —
      // not Journal content, coach-readable by design. See schema.md.
      conditionReflections: Array.isArray(saved.conditionReflections) ? saved.conditionReflections : [],
      conditionFoldInLevel: ['partial', 'mostly', 'all'].includes(saved.conditionFoldInLevel)
        ? saved.conditionFoldInLevel
        : null,
      conditionGoals: (saved.conditionGoals && typeof saved.conditionGoals === 'object')
        ? saved.conditionGoals
        : {},

      // ── SEVERE PAIN CHOICE (new 04 Aug 2026, Pain Input Redesign follow-up) ──
      // { date: 'YYYY-MM-DD', conditionIds: [...sorted], choice: 'rest'|'adapt',
      //   chosenAt: ISO string }. An explicit, actively-made record — Graeme's
      // framing: the coach offers rest, the user actively chooses, and that
      // choice is logged. Keyed by date + exact severe-condition-id set, so
      // any change re-prompts rather than silently reusing a stale choice.
      severePainChoices: Array.isArray(saved.severePainChoices) ? saved.severePainChoices : [],
      pendingDoorRoute: typeof saved.pendingDoorRoute === 'string' ? saved.pendingDoorRoute : null,
      prescribedExercisesOrigin: ['professional', 'self'].includes(saved.prescribedExercisesOrigin)
        ? saved.prescribedExercisesOrigin
        : null,
      prescribedExercisesActiveCondition: typeof saved.prescribedExercisesActiveCondition === 'string'
        ? saved.prescribedExercisesActiveCondition
        : null,
      exerciseHistory: (saved.exerciseHistory && typeof saved.exerciseHistory === 'object' && !Array.isArray(saved.exerciseHistory))
        ? saved.exerciseHistory
        : {},

      sessionVariety: ['familiar', 'balanced', 'varied'].includes(saved.sessionVariety)
        ? saved.sessionVariety
        : 'balanced',

      trainingIntent: ['improve', 'maintain', 'recover'].includes(saved.trainingIntent)
        ? saved.trainingIntent
        : 'improve',

      capability: (saved.capability && typeof saved.capability === 'object')
        ? { ...defaults.capability, ...saved.capability }
        : { ...defaults.capability },

      exercisePreferences: (saved.exercisePreferences && typeof saved.exercisePreferences === 'object')
        ? saved.exercisePreferences
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

      // ── CONSENT (v19, 11 Aug 2026 — WOW-0) ───────────────────
      // Restores the legal consent record lost when OB-THREAD retired
      // welcome.js (its store.set("consentGiven"/"consentAt") calls at
      // welcome.js:85-86 were the ONLY writers, and that route left
      // router.js VIEW_NAMES in v7). Live onboarding has captured no
      // consent record at all since. Found by the PT-W1 store audit.
      //
      // Deliberate changes from welcome.js's version:
      //   - Nested, not two flat top-level keys. Cleaner for the coming
      //     Supabase migration, where PT-10 already flagged undeclared
      //     flat fields as a real loss risk.
      //   - given is set by an AFFIRMATIVE TICK, not by tapping a button
      //     under a line of text. welcome.js used implied consent ("by
      //     tapping Start you agree"); Graeme's decision, 11 Aug, is an
      //     active registered choice — it removes the "but I didn't know"
      //     problem.
      //   - policyVersion records WHICH documents were agreed to. Without
      //     it, any later revision silently invalidates every existing
      //     record and there is no way to tell who needs re-consent.
      consent: {
        given:         false,  // bool — affirmative tick only
        at:            null,   // ISO string|null
        policyVersion: null,   // string|null — see POLICY_VERSION in thread.js
        // Reserved. The age gate is built but INERT — see AGE_GATE_ENABLED
        // in thread.js. Stays null until the ToS 13+/16+ contradiction
        // (Stream A, A1.11) is resolved and Natalie's written advice lands.
        ageConfirmed:  null    // bool|null
      },

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
      conditionReflections: [],   // { conditionId, text, loggedAt } — NOT Journal. Deliberately distinct field/namespace so it can never inherit the Journal Privacy Rule by accident. Coach-readable by design.
      conditionFoldInLevel: null, // 'partial' | 'mostly' | 'all' | null — null = static-only, not folded into Cardio/Core/Strength sessions
      conditionGoals: {},         // { [conditionId]: { goalType: 'healed'|'cope'|'improve', note, setAt } } — felt-sense, not numeric; see Phase D blueprint v2, decision D-1
      severePainChoices: [],      // { date, conditionIds, choice: 'rest'|'adapt', chosenAt } — active choice record, see mergeWithDefaults() note
      pendingDoorRoute: null,     // route name to continue to once check-in/check-in-mini completes — set by today.js when a session-generating door is tapped, cleared by checkin.js/checkin-mini.js on completion

      // ── PRESCRIBED EXERCISES ORIGIN ───────────────────────────
      prescribedExercisesOrigin: null, // 'professional' | 'self' | null — set once when prescribedExercises first goes empty -> non-empty; see Phase D blueprint v2, decision D-2
      prescribedExercisesActiveCondition: null, // conditionId | null — single-use, set by conditions-update.js's "Build my own" right before navigating to prescribed.js, cleared immediately once read; tags the next-added entry with conditionId
      // Read by exercises/index.js applyFeedbackWeighting() since v1.3 and
      // never declared here — one of the undeclared fields PT-10 flagged as
      // a Supabase-migration loss risk. Declared v21, and given a writer
      // (logExerciseFeedback) in the same pass.
      exerciseFeedback: [], // { exerciseId, feedback: 'too-hard'|'too-easy', at }[]

      // Undeclared until v21. Written by programmeEngine.js:268, read at :242.
      // CONT-1 (11 Aug 2026). { [exerciseId]: { n, first, last, best } }
      // Written only by recordExercises(), which logActivity() calls
      // automatically when a completion supplies exerciseIds. Read by
      // session-builder.js for continuity-aware selection and by the
      // exercise card for the flat "Last:" reference line.
      exerciseHistory: {},

      // CONT-2 (11 Aug 2026). "familiar" | "balanced" | "varied".
      //
      // Persona 2.13 (ADHD, novelty-driven, abandons routine after ~2
      // weeks) and persona 2.14 (autistic, predictability-seeking,
      // dislikes surprises) are opposite motivational shapes, and the
      // persona matrix has carried "novelty vs predictability has no
      // explicit preference capture" as an open gap since 05 Jul.
      //
      // CONT-1 made that gap urgent rather than theoretical: continuity
      // is now a real force in selection, so a single default actively
      // serves one persona at the other's expense. Traced live, both
      // received ~51-57% session-to-session overlap -- one treatment
      // serving neither well.
      //
      // Default "balanced" because it is the honest answer when nobody
      // has asked yet. Never inferred from behaviour: guessing that
      // someone wants variety because they skipped a session would be
      // exactly the kind of silent judgement this product refuses.
      sessionVariety: 'balanced',

      // ── CAPABILITY SCREEN (11 Aug 2026) ───────────────────────────
      //
      // Graeme: "If we are not age restricting (agreed), how do we
      // ensure the appropriate level of exercise for that user? What my
      // dad can do at 76 is I would say standard. A 76 year old doing
      // what a 36 year old can do is very uncommon."
      //
      // He is right about the statistics and right that we cannot use
      // age. The resolution is that the instrument was wrong, not the
      // policy: "how active are you?" measures FREQUENCY, not CAPACITY.
      // Someone can garden every day and still not get off the floor
      // unaided, and answer "moderate" honestly -- which under the
      // raised ceilings meant jump squats.
      //
      // These four questions are what a good coach establishes in the
      // first five minutes. Every one is answerable honestly by a
      // 76-year-old AND by a deconditioned 36-year-old, and together
      // they separate the fit 76-year-old from the frail one, which age
      // never can. They also ask what a person CAN do rather than
      // inferring from what they are -- dignity as a design principle,
      // not a workaround for it.
      //
      //   chairRise   - stand from a chair without using hands
      //   floorAccess - get to the floor and back up unaided
      //   bothFeet    - currently does anything where both feet leave
      //                 the ground
      //   balanceWorry- worries about losing balance
      //
      // null means not yet asked, and is treated as the cautious answer
      // everywhere, consistent with how untagged difficulty and unknown
      // activity level are handled.
      // ── TRAINING INTENT (11 Aug 2026, CAP-3) ──────────────────────
      //
      // Graeme: the 36-year-old answering these four questions is
      // probably on the way up; the 76-year-old might be too, or might
      // be managing decline. How do we serve the difference?
      //
      // We do NOT ask about trajectory, and we do not announce it.
      // exerciseHistory and repeat capability screens make the direction
      // observable, but saying "you seem to be declining" is a verdict,
      // breaches P4, and is exactly what would make somebody delete the
      // app. Trajectory may change what is OFFERED. It never changes
      // what is SAID.
      //
      // So the question is about intent, which is the person's own and
      // is theirs to state:
      //
      //   'improve'  - get stronger and fitter than I am now
      //   'maintain' - keep hold of what I have got
      //   'recover'  - get back something I have lost
      //
      // All three are positively framed and functionally different.
      // 'recover' matters most: it is how somebody in decline actually
      // thinks about it -- as a goal, not a diagnosis -- and it is the
      // same sentence a 36-year-old post-injury would choose, which is
      // precisely why it works for both.
      //
      // CRITICALLY, 'maintain' is NOT a diluted 'improve'. What is lost
      // first is specific and known: power before strength, balance
      // early, grip strength (which predicts independence better than
      // almost anything), and floor transfer (which decides whether
      // somebody keeps living in their own home). Maintenance
      // PRIORITISES those four rather than doing less of everything.
      // See session-builder.js's INTENT_PRIORITY.
      //
      // Default 'improve' because that is what most people arriving at a
      // fitness product want, and because assuming decline unasked would
      // be its own kind of insult.
      trainingIntent: 'improve',

      // Values are STRINGS, not booleans. Graeme, on the first draft:
      // "someone in a wheelchair might need to say No, otherwise it
      // causes shame or frustration at being left out again."
      //
      // He is right, and booleans could not carry it. "Not easily" and
      // "No" are different answers, and forcing a wheelchair user to
      // pick "not easily" would make them approximate themselves to fit
      // our data model -- which is the exclusion happening again, in the
      // schema this time.
      //
      //   chairRise    'yes' | 'not-easily' | 'no'
      //   floorAccess  'yes' | 'not-comfortably' | 'rather-not' | 'no'
      //   bothFeet     'yes' | 'no'
      //   balanceWorry 'no'  | 'sometimes' | 'yes'
      //
      // "rather-not" is a legitimate answer, not a dodge -- it is the
      // honest one for somebody who genuinely does not know, and it is
      // treated as a no.
      capability: {
        chairRise:    null,
        floorAccess:  null,
        bothFeet:     null,
        balanceWorry: null,
        askedAt:      null
      },

      exercisePreferences: {}, // { [exerciseId]: { preference: 'avoid'|'less', setAt, source } } — per alongside_exercise_skip_dislike_spec_16may2026_v1.docx. Binary signal, not a rating (spec §6: "not a rating system... no stars, no thumbs, no scores"). First consumer: js/data/conditionProgrammes.js's candidate selection, 04 Aug 2026 — the full spec's in-session Skip flow (gym-programme.js/prescribed-session.js/core-session.js) remains separate future work.

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

      // ── LIFT LOG (v20, 11 Aug 2026 — PT-4) ───────────────────
      // A MEMORY AID, not analytics. Graeme's framing, 11 Aug: "I want to
      // know what weights I was lifting last week so I know what settings
      // to add to the machines, rather than working blind." That is a note
      // someone leaves themselves, not a scoreboard.
      //
      // GOVERNED BY LOCKED PRINCIPLE P4 — the app may display load, the
      // coach never interprets it. No commentary on the delta in either
      // direction, no arrows, no colour-coding, no "new best". The
      // asymmetry is the reason: silence on a drop is only credible if
      // there is also silence on a rise. Celebrating is what creates the
      // shame — you cannot have one without the other.
      //
      // Off by default. Someone who turns it on has asked for it, which is
      // a different thing from being given it.
      liftLogEnabled: true,

      // { [exerciseId]: [ { at: ISO, weight: number, unit: 'kg'|'lb',
      //                     reps: number|null } ] }
      // Newest last. Capped per exercise in logLift(). Keyed by exercise id
      // rather than by session so recall works across programmes.
      liftLog: {},

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
        context:          null,
        capturedAt:       null,
        // Undeclared until v21. Written by programmeEngine.js:268 and read
        // at :242/:263 — it worked only via the ...saved spread, and would
        // have been silently dropped by any migration rebuilding from
        // defaults. Same class as PT-10's undeclared fields.
        returnCapturedAt: null
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

      // ── IN STEP PROGRESS ───────────────────────────────────────
      inStepProgress: {
        unlockedAt:     {}, // { [movementId]: ISO } — 3-day cooldown gate
        scenarioIndex:  {}, // { [movementId]: int } — cycles the 4-scenario pool
        completedCount: {}, // { [movementId]: int } — display only
        choiceLog:      []  // { movementId, scenarioId, optionId, tag, at }[] — aggregate only, see in-step.js
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

  // Records an active severe-pain choice (04 Aug 2026, Pain Input
  // Redesign follow-up). One record per date + exact severe-condition-id
  // set — deliberately not a single "last choice" value, so the coach
  // always asks fresh if the severe set changes, and history of what
  // was actually chosen (not just what was offered) is preserved.
  recordSeverePainChoice(conditionIds, choice) {
    const date = new Date().toISOString().slice(0, 10);
    const entry = {
      date,
      conditionIds: [...conditionIds].sort(),
      choice,
      chosenAt: new Date().toISOString(),
    };
    this.data.severePainChoices = [...(this.data.severePainChoices || []), entry];
    this.save();
    return entry;
  },

  // Sets or clears a per-condition goal (04 Aug 2026, Phase D-1). Felt-sense,
  // not numeric — see Phase D blueprint v2, decision D-1. goalType null
  // clears the goal for that condition (the "not sure yet" / skip path).
  setConditionGoal(conditionId, goalType, note = '') {
    const goals = { ...(this.data.conditionGoals || {}) };
    if (!goalType) {
      delete goals[conditionId];
    } else {
      goals[conditionId] = { goalType, note, setAt: new Date().toISOString() };
    }
    this.data.conditionGoals = goals;
    this.save();
  },

  // Sets or clears a per-exercise preference (04 Aug 2026). Binary
  // signal per alongside_exercise_skip_dislike_spec_16may2026_v1.docx
  // — 'avoid' (never suggest again) or 'less' (offer less often), not
  // a rating. preference=null clears it (reversible, per spec §2.2).
  setExercisePreference(exerciseId, preference, source = 'user') {
    const prefs = { ...(this.data.exercisePreferences || {}) };
    if (!preference) {
      delete prefs[exerciseId];
    } else {
      prefs[exerciseId] = { preference, setAt: new Date().toISOString(), source };
    }
    this.data.exercisePreferences = prefs;
    this.save();
  },

  /**
   * logLift(exerciseId, { weight, unit, reps }) — PT-4, 11 Aug 2026.
   * Appends one entry. No-ops when liftLogEnabled is false, so callers do
   * not each need to check. Caps at 20 entries per exercise: this is a
   * memory aid, not a training history, and the only read is the most
   * recent one.
   */
  logLift(exerciseId, entry) {
    if (!exerciseId || !entry) return null;
    if (this.data.liftLogEnabled !== true) return null;

    // Generalised 11 Aug 2026 from weight-and-reps to whatever the
    // exercise actually produces. Graeme: "the weight, time, tension,
    // etc as discussed."
    //
    // A treadmill session produces a speed and an incline; a cross
    // trainer produces a resistance level; a band produces a colour; a
    // plank produces a duration. Recording only weight meant that for
    // most of the database there was nothing to write down, and a
    // person came back next week with nothing to go on.
    //
    // Every field is optional and free-form within its type. Nothing is
    // computed from them, nothing is compared, and nothing is narrated
    // -- P4 applies: these are notes the person left themselves.
    const NUMERIC = ['weight', 'reps', 'speed', 'incline', 'level',
                     'distance', 'durationMins'];
    const TEXT    = ['tension', 'note'];

    const record = { at: new Date().toISOString() };
    let hasValue = false;
    for (const k of NUMERIC) {
      if (typeof entry[k] === 'number' && !Number.isNaN(entry[k])) {
        record[k] = entry[k]; hasValue = true;
      }
    }
    for (const k of TEXT) {
      if (typeof entry[k] === 'string' && entry[k].trim()) {
        record[k] = entry[k].trim().slice(0, 60); hasValue = true;
      }
    }
    if (!hasValue) return null;
    if (record.weight !== undefined) {
      record.unit = entry.unit || this.data.weightUnit || 'kg';
    }

    const log = { ...(this.data.liftLog || {}) };
    const list = [...(log[exerciseId] || [])];
    list.push(record);
    if (list.length > 20) list.splice(0, list.length - 20);
    log[exerciseId] = list;
    this.data.liftLog = log;
    this.data.updatedAt = new Date().toISOString();
    this.save();
    return list[list.length - 1];
  },

  /**
   * lastLift(exerciseId) — most recent entry, or null.
   * Deliberately returns the entry only. No delta, no comparison, no
   * "best" — see P4 and the liftLog note in getDefaults().
   */
  lastLift(exerciseId) {
    const list = (this.data.liftLog || {})[exerciseId];
    if (!Array.isArray(list) || list.length === 0) return null;
    return list[list.length - 1];
  },

  /**
   * logExerciseFeedback(exerciseId, feedback) — PT-12, 11 Aug 2026.
   *
   * Writes the field applyFeedbackWeighting() (exercises/index.js:219) has
   * been reading since v1.3 with NOTHING ever writing it — so the weighting
   * logic has never once run on real data, always falling back to []. The
   * response was built; the capture never was. Fifth confirmed instance of
   * that pattern in this codebase.
   *
   * feedback: 'too-hard' | 'too-easy'. Binary, matching the reader's
   * contract exactly — not a rating. Consistent with exercisePreferences
   * (v17) and the skip/dislike spec's §6: no stars, no scores.
   *
   * Capped at 200 entries globally; the reader only ever looks at the last
   * 5 per exercise.
   */
  logExerciseFeedback(exerciseId, feedback) {
    if (!exerciseId) return null;
    if (feedback !== 'too-hard' && feedback !== 'too-easy') return null;

    const log = [...(this.data.exerciseFeedback || [])];
    log.push({ exerciseId, feedback, at: new Date().toISOString() });
    if (log.length > 200) log.splice(0, log.length - 200);
    this.data.exerciseFeedback = log;
    this.data.updatedAt = new Date().toISOString();
    this.save();
    return log[log.length - 1];
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

    // EMPTY-SESSION GUARD (11 Aug 2026). Graeme: "I opened a session and
    // without completing one session at all I exited. It saved it."
    //
    // Ten views carry the same savePartialSession() pattern and all of
    // them logged unconditionally, so opening a session and backing
    // straight out wrote a record of something that never happened.
    //
    // That is worse than untidy now that exerciseHistory exists: a
    // phantom entry would make exercises look familiar and skew
    // continuity-aware selection toward movements the person never
    // performed. It also quietly misrepresents someone's own record back
    // to them, which is the opposite of what an honest activity log is
    // for.
    //
    // Guarded here rather than in each view, so no future session type
    // can reintroduce it. Only genuinely empty partials are dropped:
    // three minutes of a walk is a real partial and is kept.
    const isEmptyPartial =
      finalEntry.status === 'partial' &&
      !(finalEntry.exercisesCount > 0) &&
      !(finalEntry.durationMins   >= 1) &&
      !(finalEntry.distanceKm     > 0);

    if (isEmptyPartial) return null;

    this.data.activityLog = [...log, finalEntry];
    this.data.updatedAt = new Date().toISOString();
    this.save();

    // CONT-1: a completion that names its exercises also updates
    // exerciseHistory. Single write path, so no call site can record a
    // session without recording what was in it. Partial exits are
    // excluded deliberately -- an abandoned session did not teach
    // anything and must not make an exercise look familiar.
    if (finalEntry.status !== 'partial' && Array.isArray(finalEntry.exerciseIds)) {
      this.recordExercises(finalEntry.exerciseIds, finalEntry.performance);
    }

    return finalEntry;
  },

  /**
   * Record that a set of exercises was genuinely completed.
   *
   * Called automatically by logActivity() when a completion entry
   * supplies `exerciseIds`, so call sites add one field rather than
   * learning a second write path. Can also be called directly.
   *
   * Only completions should reach here. A session that was built and
   * abandoned did not teach the person anything and must not make an
   * exercise look familiar.
   *
   * @param {string[]} exerciseIds
   * @param {Object}   [performance] optional { [exerciseId]: {weight,reps,unit} }
   */
  recordExercises(exerciseIds, performance) {
    if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) return;
    const now = new Date().toISOString();
    const history = { ...(this.data.exerciseHistory || {}) };

    for (const id of exerciseIds) {
      if (typeof id !== 'string' || !id) continue;
      const prev = history[id] || { n: 0, first: now, last: now };
      const entry = {
        n:     (prev.n || 0) + 1,
        first: prev.first || now,
        last:  now
      };
      if (prev.best) entry.best = prev.best;

      const perf = performance && performance[id];
      if (perf && typeof perf.weight === 'number' && perf.weight > 0) {
        // "best" is a flat reference the person left themselves, not a
        // score. Nothing narrates it and nothing compares it (P4).
        const prevWeight = prev.best && typeof prev.best.weight === 'number' ? prev.best.weight : 0;
        if (perf.weight >= prevWeight) {
          entry.best = { weight: perf.weight, reps: perf.reps || null, unit: perf.unit || 'kg', at: now };
        }
      }
      history[id] = entry;
    }

    this.data.exerciseHistory = history;
    this.data.updatedAt = now;
    this.save();
  },

  /**
   * Capability profile derived from the four screen answers.
   *
   * Returns the three gates selection needs. Each defaults to the
   * cautious answer when unasked, matching how untagged difficulty and
   * unknown activity level are treated: an unknown is assumed to need
   * protecting, never assumed to be fine.
   *
   * @returns {{ impactSafe:boolean, floorSafe:boolean, balanceSafe:boolean, ceilingCap:number|null, asked:boolean }}
   */
  capabilityProfile() {
    const c = this.data.capability || {};
    const asked = c.askedAt !== null && c.askedAt !== undefined;

    // Impact needs an affirmative yes. Someone who does not currently do
    // anything with both feet off the ground should not be handed
    // plyometrics by default, whatever their age.
    const impactSafe = c.bothFeet === 'yes';

    // Floor work needs floor access. Without it, half the database --
    // every supine, prone and kneeling movement -- is not merely hard
    // but unusable, and being handed it repeatedly is how somebody
    // decides the app is not for them.
    const floorSafe = c.floorAccess === 'yes' || c.floorAccess === null;

    // Balance is its own axis, not a difficulty band. Warrior III is low
    // impact and moderate difficulty and completely wrong for someone
    // worried about falling.
    const balanceSafe = c.balanceWorry === 'no' || c.balanceWorry === null;

    // Difficulty cap where the answers indicate genuine deconditioning.
    // Never raises a ceiling, only lowers one: the screen protects, it
    // does not promote.
    let ceilingCap = null;
    if (c.chairRise === 'no' || c.chairRise === 'not-easily') ceilingCap = 2;
    else if (c.floorAccess === 'no' || c.floorAccess === 'not-comfortably') ceilingCap = 3;

    // Somebody who cannot rise from a chair or reach the floor needs
    // seated and supported variants, not merely gentler standing ones.
    // Surfaced honestly rather than silently: the database currently
    // holds 2 chair and 8 seated entries, which is not enough to build
    // a session from, and pretending otherwise would deliver exactly the
    // exclusion this schema change exists to avoid. Logged as CAP-4.
    const needsSeated = c.chairRise === 'no' || c.floorAccess === 'no';

    return { impactSafe, floorSafe, balanceSafe, ceilingCap, needsSeated, asked };
  },

  /**
   * How well does this person know this exercise?
   * @returns {{ n:number, last:string|null, daysSince:number|null, seen:boolean }}
   */
  exerciseStats(exerciseId) {
    const h = (this.data.exerciseHistory || {})[exerciseId];
    if (!h) return { n: 0, last: null, daysSince: null, seen: false };
    const daysSince = h.last
      ? Math.floor((Date.now() - new Date(h.last).getTime()) / 86400000)
      : null;
    return { n: h.n || 0, last: h.last || null, daysSince, seen: true };
  },

  /**
   * The flat reference line for the exercise card: what they last
   * recorded. No verb, no framing, no comparison (P4).
   */
  lastPerformance(exerciseId) {
    const h = (this.data.exerciseHistory || {})[exerciseId];
    return h && h.best ? h.best : null;
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
