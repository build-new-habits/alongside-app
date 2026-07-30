# Alongside — Data Schema Reference
## 30 Jul 2026 v1.9

**File:** `js/store.js` (confirmed live version: v10, 16 Jul 2026)
**Storage:** `localStorage` key `alongside_user`

All data lives in a single JSON object under this key. `store.js` provides typed get/set access — never manipulate `localStorage` directly. On initialisation, `mergeWithDefaults()` fills any missing keys so existing users receive new fields without data loss.

**This version supersedes and retires:** `schema.md` v1.3 (8 Mar 2026), `schema_v1_7_15jun2026.md`, `schema_md.docx` (v1.4 content, 12 Jun 2026), the v1.5 delta note (12 Jun), and the v1.8 delta note (16 Jul). All content from those documents has been folded in here, ground-truthed directly against live `store.js` v10 rather than carried forward. This is now the single canonical schema document.

---

## Schema Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial schema. Profile, check-in, workout, exercise feedback, credits, stats. |
| 1.1 | 3 Mar 2026 | Strategic layer: `strategicGoal`, `activeProgramme`, `progressLog`. |
| 1.2 | 5 Mar 2026 | Condition system: `conditionPainScores`, `prescribedExercises`. |
| 1.3 | 7 Mar 2026 | Workout cache: `workoutsPainFingerprint`. Conditions: `zone`, `getZoneStatus()`, `getActiveConditionIds()`, `getExerciseSafetyTier()`. |
| 1.4 | 12 Jun 2026 | Consolidated schema pass — all pending fields added in one go. |
| 1.5 | 12 Jun 2026 | `lastCheckin.timestamp` added (2-hour return-visit trigger). |
| 1.6 | 13 Jun 2026 | Weekly Plan shape finalised. |
| 1.7 | 15 Jun 2026 | Noticing Hub schema pass. |
| 1.8 | 16 Jul 2026 | Empathy Transfer schema pass: 5 new top-level fields (delta note only, never folded into a full file until now). |
| **1.9** | **30 Jul 2026** | **Full ground-truth reconciliation (BUILD-4).** Rewritten directly against live `store.js` v10. Documents all fields actually returned by `getDefaults()`, corrects two errors inherited from v1.7 (see below), resolves the `hardBeforeSelections` naming question, resolves `stats` and `exerciseFeedback` dormancy questions, and separates out an appendix of fields used via `store.get`/`store.set` but absent from `getDefaults()`. |

### Corrections made in this pass

- **`todaysWorkouts` / `activeWorkout` — confirmed dead**, as v1.8's delta note flagged. No live references anywhere (only in code comments describing past bugs). The real workout-caching mechanism is `generatedSession`.
- **`workoutsGeneratedAt` — dead write remains, found this session.** `workoutGenerator.js`'s only reader of this field was removed in this same BUILD-4 session (an orphaned `needsRegeneration()`/`getTodaysWorkouts()` pair, never called from anywhere). However, `checkin-mini.js` (line 373) still writes `store.set("workoutsGeneratedAt", null)` on check-in. Nothing reads it any more. **Not fixed this session** — `checkin-mini.js` wasn't in this session's scheduled file list (touch-once). Logging for a future small cleanup.
- **`todayIntensity` — corrected. This field is NOT dead**, contrary to the 28 Jul reconciliation note. It's genuinely live: written by `checkin.js` and `coach-proposal.js`, read by `workoutGenerator.js`. It's simply undocumented in `getDefaults()` (a "first write defines it" field — see Appendix A). Documented properly below under Check-In.
- **`exerciseFeedback` — corrected. This field is dormant, not live**, contrary to this session's own blueprint (which had called it "confirmed live, not dormant" based on the read side only). `applyFeedbackWeighting()` in `exercises.js` does read it — but nothing anywhere in the app ever writes it. No UI collects exercise-level like/dislike feedback. The read always falls back to `[]`, so the weighting logic runs but has zero effect. This is the same "specified but never built" pattern already confirmed for Empathy Transfer and (below) `stats` — the write side was likely planned (see `alongside_exercise_skip_dislike_spec_16may2026_v1.docx`) but never implemented.
- **`activeProgramme.startDate`** — confirmed correct as-is; v1.7 had this right.
- **`unwellMode.startedAt`** — confirmed a genuinely different field on a different object from `activeProgramme.startDate`, not a naming clash. Documented in full below.
- **`hardBeforeSelections` / `hardBeforeShownAt`** — confirmed to be `onboarding.hardBeforeSelections` / `onboarding.hardBeforeShownAt`, already live and documented under Onboarding below. Not a new, separate pair — the naming-mismatch concern raised in the BUILD-4 blueprint is resolved.
- **`stats` — confirmed not a store field, live or dormant.** It doesn't exist anywhere in `store.js`. Every `stats` reference in the app (`progress.js`, `programmeEngine.js`) is a local variable computed on the fly by `getProgressStats()`, built from `activityLog` / `checkinHistory` / `activeProgramme` at render time. There is nothing to document as a schema field — the v1.7/v1.8 "specified but never built" flag on this one turned out to be a false alarm, not a real gap.
- **`activeProgramme.measurementsOptIn` — anomaly found, not fixed.** `mergeWithDefaults()` writes a `measurementsOptIn` key onto `activeProgramme` sourced from `saved.strategicGoal?.measurementsOptIn` (line ~176) — this looks like a copy-paste artefact from the adjacent `strategicGoal` merge block. `activeProgramme`'s own `getDefaults()` shape does not include `measurementsOptIn` at all (only `strategicGoal` does). Net effect: a stray, likely-unused `measurementsOptIn` key can appear on `activeProgramme` at runtime, duplicating data that's meant to live only on `strategicGoal`. Not investigated further or fixed — outside this session's file scope (`store.js` was read-only this session except for the pre-approved dead-write removal). Flagging for a future small fix.

---

## 1. Onboarding

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `onboardingComplete` | `boolean` | `false` | Gates app entry |
| `onboardingStep` | `number` | `1` | Resume position if onboarding is interrupted |

### `onboarding` (nested object)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `threadStartedAt` | `string\|null` (ISO) | `null` | Written when `thread.js` Step 1 renders. Analytics only. |
| `threadCompletedAt` | `string\|null` (ISO) | `null` | Written when `thread.js` Step 14 completes. Analytics only. |
| `hardBeforeSelections` | `string[]` | `[]` | Territory IDs selected in Step 3a. Written/read by `thread.js`, `hard-before.js`, `reflection.js`, `beat3-scripts.js`. |
| `hardBeforeShownAt` | `string\|null` (ISO) | `null` | Step 3a timing. |
| `primaryTerritory` | `string\|null` | `null` | Single dominant territory confirmed in Step 3b. Read by `beat3-scripts.js` `getDominantTerritory()`. Replaced the old pattern of inferring dominant territory from `hardBeforeSelections[0]`. |
| `reflectionShownAt` | `string\|null` (ISO) | `null` | Step 4 timing. |
| `castleShownAt` | `string\|null` (ISO) | `null` | Beat 1 ("The Castle"). `arrival.js` retired but field preserved for analytics continuity. |

---

## 2. Profile

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `name` | `string` | `''` | Required. Used in all coach messages. |
| `ageBand` | `string\|null` | `null` | |
| `age` | `number\|null` | `null` | **Deprecated** — kept for migration only, do not write new values. |
| `gender` | `string\|null` | `null` | |
| `hormonalTracking` | `boolean` | `false` | Enables menstrual cycle overlay. See `cycleLength` in Appendix A — cycle length itself is never user-configurable; always defaults to 28. |
| `coachStyle` | `string` | `'nurturing'` | `nurturing\|steady\|energetic\|minimal`. Beta: Nurturing voice delivers for all style settings silently — this is permanent product policy, not a beta-only restriction (Free tier: locked to Nurturing; Personal+: all values selectable in UI but all render as Nurturing). |
| `tier` | `string` | `'free'` | `free\|personal\|athlete`. Athlete unlocked within Personal, no extra charge. |
| `fitnessLevel` | `string\|null` | `null` | Read by `workoutGenerator.js`'s `getUserProfile()`. Written by Settings. |
| `weight` | `number\|null` | `null` | |
| `weightUnit` | `'kg'\|'lbs'` | `'kg'` | |
| `targetWeight` | `number\|null` | `null` | |
| `targetDate` | `string\|null` | `null` | ISO date |
| `targetDescription` | `string` | `''` | Plain text goal note |
| `goals` | `string[]` | `[]` | Goal IDs from `goals.js`. Drives exercise filter engine and `workoutGenerator.js`'s goal-aware bias. |
| `conditions` | `string[]` | `[]` | Condition IDs from `conditions.js`. Base IDs only — phase variants derived at runtime. |
| `conditionPainScores` | `object` | `{}` | Keyed by condition ID. Written at check-in submission. |
| `equipment` | `string[]` | `[]` | Equipment IDs from `equipment.js` |
| `prescribedExercises` | `array` | `[]` | |

### `lifestyle` (nested object)

| Field | Type | Values |
|-------|------|--------|
| `activityLevel` | `string\|null` | `sedentary\|light\|moderate\|active\|very-active` |
| `stressLevel` | `string\|null` | `low\|moderate\|high\|very-high` |
| `sleepQuality` | `string\|null` | `poor\|okay\|good` |
| `exerciseHistory` | `string\|null` | `never\|lapsed\|returning\|active` |
| `returningAfter` | `string\|null` | `injury\|illness\|life\|burnout\|null` |

---

## 3. Strategic Layer

### `strategicGoal` (nested object)

| Field | Type | Default |
|-------|------|---------|
| `primaryGoal` | `string\|null` | `null` |
| `targetDescription` | `string` | `''` |
| `targetDate` | `string\|null` | `null` |
| `targetValue` | `number\|null` | `null` |
| `targetUnit` | `string\|null` | `null` |
| `weeklySessionTarget` | `number` | `3` |
| `setAt` | `string\|null` (ISO) | `null` |
| `planPresentedAt` | `string\|null` (ISO) | `null` |
| `measurementsOptIn` | `string[]` | `[]` |

### `activeProgramme` (nested object)

| Field | Type | Default |
|-------|------|---------|
| `programmeId` | `string\|null` | `null` |
| `programmeName` | `string` | `''` |
| `startDate` | `string\|null` | `null` |
| `currentWeek` | `number` | `1` |
| `currentPhase` | `string\|null` | `null` |
| `sessionsThisWeek` | `number` | `0` |
| `totalSessions` | `number` | `0` |
| `milestones` | `array` | `[]` |
| `completed` | `boolean` | `false` |
| `completedAt` | `string\|null` | `null` |
| `phase` | `number` | `1` |
| `weekPlan` | `object\|null` | `null` |
| `sessionSequence` | `array` | `[]` |
| `missedSessions` | `array` | `[]` |
| `midProgrammeGlanceShown` | `boolean` | `false` |
| `programmeReflectionShown` | `boolean` | `false` |

⚠️ See the `measurementsOptIn` anomaly note above — a stray copy of `strategicGoal.measurementsOptIn` can appear here at runtime due to a merge-logic artefact. Not part of the intended schema for this object.

`progressLog` (top-level, not nested): `array`, default `[]`. Session history, capped at 90 entries via `logSession()`.

---

## 4. Gym Programme

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `gymProgrammeSession` | `string` | `'A'` | |
| `gymProgrammeWeek` | `number` | `1` | |

---

## 5. Activity & Session Tracking

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `activityLog` | `array` | `[]` | Each entry: `{ id, date, type, durationMins, moodAfter, isEvent, eventName, completedAt, ... }`. Single write path since v10: `store.logActivity()`, with dedupe guard against same-type double-writes within 2 minutes. |
| `currentActivityEntry` | `null` | `null` | **Under active investigation** — separate blueprint (`alongside_blueprint_coresession-integrity_30jul2026_v1.md`) is checking whether Core Session ever populates this field upstream. Out of scope for BUILD-4; do not resolve here. |
| `generatedSession` (nested) | `object` | `{ session: null, builtAt: null, inputs: {} }` | The real "today's workout" mechanism — this is what replaced the old `todaysWorkouts`/`workoutsGeneratedAt` pattern (see corrections above). |

---

## 6. Check-In Engine

### `checkin` (nested object — engine state)

| Field | Type | Default |
|-------|------|---------|
| `lastOpeningMode` | `string\|null` | `null` |
| `openingModeHistory` | `array` | `[]` |
| `feelingWordDepth` | `number` | `1` |
| `lastMilestoneNoticed` | `string\|null` | `null` |

### `lastCheckin` (nested object)

| Field | Type | Default |
|-------|------|---------|
| `feelingWord` | `string\|null` | `null` |
| `feelingQuadrant` | `string\|null` | `null` |
| `unwell` | `boolean` | `false` |
| `timestamp` | `string\|null` (ISO) | `null` |

`checkinHistory`: `object`, default `{}`. Plain object keyed by `"YYYY-MM-DD"` — **not an array.** A v5 bug once reset this to `[]` on every load via an incorrect `Array.isArray()` check, destroying check-in history; fixed in v5, mentioned here as a cautionary note against reintroducing the same check.

`todayIntensity`: `string|null`, undocumented in `getDefaults()` (see Appendix A). **Corrected this session — genuinely live**, not dead. Written by `checkin.js` and `coach-proposal.js`; read by `workoutGenerator.js` (falls back to `"moderate"` if unset).

`availableTime`: `string|null`, undocumented in `getDefaults()` (see Appendix A). Live. `micro|quick|short|standard|long|open`. Written by `checkin.js` and `coach-proposal.js`; drives `workoutGenerator.js`'s exercise-count and duration-cap logic (BUILD-5, 24 Jul).

---

## 7. Mindful Prompts & Empathy Transfer

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `mindfulPromptDepth` | `number` | `1` | |
| `mindfulPromptFrequency` | `string` | `'automatic'` | |
| `empathyTransferStage` | `number` | `1` | 1–5, current stage of the 5-stage prompt library. |
| `empathyPromptsFired` | `number` | `0` | Total, all-time. |
| `empathyPromptsAtStage` | `number` | `0` | Resets to 0 on stage advance. |
| `lastEmpathyPromptSession` | `number` | `0` | Session count at last fire — enforces the 3–4 session gap. |
| `empathyPromptSkips` | `number` | `0` | **Consecutive** skip streak, not lifetime total — resets to 0 on any non-skip response. |

---

## 8. Absence & Return

`absence` (nested object): `context` (`string|null`, default `null`), `capturedAt` (`string|null`, default `null`).

---

## 9. Exercise Feedback *(dormant — see correction above)*

`exerciseFeedback`: `array`, undocumented in `getDefaults()`. **Read-only, effectively dormant.** `applyFeedbackWeighting()` reads it in `exercises.js`, but nothing anywhere writes it — no UI collects per-exercise like/dislike. Always falls back to `[]`, so the weighting logic runs with zero real effect. Likely a "spec exists, write side never built" gap — see `alongside_exercise_skip_dislike_spec_16may2026_v1.docx`.

---

## 10. Stats *(not a store field)*

There is no `stats` field, live or dormant, anywhere in `store.js`. Every `stats` reference in the app is a local variable computed on demand by `getProgressStats()` (`programmeEngine.js`), built from `activityLog`, `checkinHistory`, and `activeProgramme` at render time — not persisted. The "specified but never built" flag raised against this in the 16 Jul v1.8 delta note is resolved: there was never a gap to fill.

---

## 11. Preferences & Misc Top-Level

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `speechRate` | `number` | `0.9` | Text-to-speech. |
| `activityPreferences` | `object` | `{}` | |
| `movementIdentity` | `string[]` | `[]` | Migrated from `string\|null` in v8 (05 Jul) — existing single values are wrapped, not dropped, on merge. e.g. `['gym','running','walking']`, or `['mixed']` (mutually exclusive with named identities). |
| `sessionLocation` | `string\|null` | `null` | |
| `lastProposalType` | `string\|null` | `null` | |
| `lastProposalDate` | `string\|null` | `null` | |
| `createdAt` | `string\|null` | `null` | Set once, at `completeOnboarding()`. |
| `updatedAt` | `string\|null` | `null` | Set on every `store.set()` and every dedicated helper method. |

---

## 12. Notifications

`checkInNotification` (nested object): `enabled` (`boolean`, `false`), `time` (`string|null`, `null`), `permissionGranted` (`boolean`, `false`).

---

## 13. Noticing Hub

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `journalEntries` | `array` | `[]` | Each entry gets `hasProgressSignal` (boolean) added at save time by `signal-words.js`. **Journal Privacy Rule applies:** journal free-text content itself is never subject to signal detection — only the feeling-word selector and mood history are, no exceptions. |
| `noticingWeekInCycle` | `number` | `1` | |
| `noticingLastTriggered` | `string\|null` | `null` | |

`journalSettings` (nested object): `autoTagging` (`boolean`, `true`), `categoryPrefs` (`string[]`, `['life','movement','environment','nature','health']`).

`noticingPreferences` (nested object): `schedule` (`string`, `'automatic'`), `time` (`string|null`, `null`).

`noticingProgress` (nested object): `territoriesVisited` (`string[]`, `[]`), `seriesProgress` (`object`, `{}`), `seriesUnlockedAt` (`object`, `{}`), `lastTerritoryId` (`string|null`, `null`).

---

## 14. Weekly Plan

`weeklyPlan.days` is keyed by lowercase weekday name (`monday`…`sunday`); each day has the identical shape below. `weeklyPlan.updatedAt` sits alongside `days`, not per-day.

| Field (per day) | Type | Default |
|------|------|---------|
| `type` | `string` | `'open'` |
| `sessionType` | `string\|null` | `null` |
| `durationMins` | `number\|null` | `null` |
| `location` | `string\|null` | `null` |
| `classFocus` | `array` | `[]` |
| `activityName` | `string\|null` | `null` |
| `label` | `string\|null` | `null` |
| `enabled` | `boolean` | `false` |

`weeklyPlan.updatedAt`: `string|null`, default `null`.

---

## 15. Safeguarding & Weekly Review

`safeguarding` (nested object): `lastSignpostedAt` (`string|null`, `null`).

`weeklyReview` (nested object): `periodStart` (`string|null`, `null`), `periodEnd` (`string|null`, `null`), `generatedAt` (`string|null`, `null`), `narrative` (`string|null`, `null`), `readAt` (`string|null`, `null`), `dataUnlocked` (`boolean`, `false`).

---

## 16. Weight & Water

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `weightLog` | `array` | `[]` | |
| `waterLog` | `array` | `[]` | |
| `waterReminderEnabled` | `boolean` | `false` | |
| `lastWaterReminder` | `string\|null` | `null` | |

`waterSettings` (nested object): `dailyTargetMl` (`number`, `2000`), `remindersEnabled` (`boolean`, `false`), `reminderCount` (`number`, `2`), `windowStart` (`number`, `9`), `windowEnd` (`number`, `21`).

---

## 17. Coach Offers, Unwell Mode, Food Prompts

`coachOffers` (nested object): `shown` (`object`, `{}`), `declined` (`object`, `{}`).

### `unwellMode` (nested object) — *entirely undocumented until this pass*

Illness/recovery tracking. Genuinely separate from `activeProgramme.startDate` — not a naming clash (v1.7 was correct about `activeProgramme.startDate`; this object was simply missing from the docs entirely).

| Field | Type | Default |
|-------|------|---------|
| `active` | `boolean` | `false` |
| `kind` | `string\|null` | `null` |
| `startedAt` | `string\|null` | `null` |
| `recoveryStartedAt` | `string\|null` | `null` |
| `daysHeld` | `number` | `0` |
| `kindAtRecovery` | `string\|null` | `null` |

`foodPrompts` (nested object): `lastBalanceAt` (`array`, `[]`), `lastEducationAt` (`string|null`, `null`).

---

## 18. Community & Impact

### `community` (nested object)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `credits` | `number` | `0` | Awarded via `awardCommunityCredit()` — 2/session for Personal+Athlete, 1 for Free. Same-day guard prevents duplicates. |
| `lastCreditAt` | `string\|null` | `null` | |
| `quarterlyAllocation` | `null` | `null` | |
| `lastAllocationAt` | `string\|null` | `null` | |
| `totalAllocated` | `number` | `0` | |

`annualReflection` (nested object): `lastGeneratedAt` (`string|null`, `null`), `lastReadAt` (`string|null`, `null`), `chaptersUnlocked` (`number`, `0`).

---

## 19. Practice History

`practiceHistory` (nested object): `lastPlayed` (`object`, `{}`), `favourites` (`array`, `[]`).

---

## Appendix A — Fields used via `store.get`/`store.set` but absent from `getDefaults()`

These fields are genuinely referenced in live code but have no declared default — `store.get()` returns `undefined` until something calls `store.set()` for the first time. Two of these (`todayIntensity`, `availableTime`) are documented properly above, having been actively investigated and corrected this session. `exerciseFeedback` and `cycleLength` are documented above as confirmed-dormant/always-default. The remainder below were surfaced by a full-codebase grep this session but **not individually investigated** — classifying each as live/dead/mis-named needs real per-field checking (as `todayIntensity` and `exerciseFeedback` just demonstrated: a grep hit alone doesn't tell you whether a field is functioning), which was outside this session's scope. Reference-count is a rough signal only, not a conclusion.

| Field | Approx. references | Notes |
|-------|---------------------|-------|
| `cycleLength` | 2 | Confirmed always falls back to default `28` — never written anywhere. Documented under Profile above. |
| `consentAt` | 1 | Not investigated. |
| `consentGiven` | 1 | Not investigated. |
| `gymEquipment` | 3 | Not investigated. Possibly gym-programme-adjacent to `equipment`. |
| `homeEquipment` | 4 | Not investigated. Possibly gym-programme-adjacent to `equipment`. |
| `lastMilestone` | 5 | Not investigated. Possibly related to `activeProgramme.milestones` or `checkin.lastMilestoneNoticed` — worth checking for a naming overlap before assuming genuinely new. |
| `lastWorkoutCredits` | 12 | Higher reference count — worth prioritising in a follow-up pass. |
| `lastWorkoutName` | 12 | Higher reference count — worth prioritising in a follow-up pass. |
| `morningProgrammeWeek` | 3 | Not investigated. Possibly related to `gymProgrammeWeek`. |
| `prescribedSessionProgress` | 5 | Not investigated. |
| `proposalBias` | 3 | Not investigated. |
| `quietMode` | 10 | Higher reference count — worth prioritising in a follow-up pass. |
| `returnVisit` | 5 | Not investigated. |
| `todayEnergy` | 1 | Not investigated. |
| `totalCredits` | 18 | Highest reference count of this list — likely genuinely live and significant. Possibly distinct from `community.credits`; needs checking for overlap/duplication before documenting properly. |
| `userTier` | 1 | Not investigated. Possible naming duplicate of `tier` — worth checking before assuming a separate field. |
| `usingGeneratedSession` | 1 | Not investigated. |
| `workoutHistory` | 2 | Not investigated. Possible naming overlap with `activityLog` or `progressLog`. |
| `workoutProgress` | 4 | Not investigated. |

**Recommendation:** a short, dedicated follow-up pass through this table (same method as the `todayIntensity`/`exerciseFeedback` corrections above — check every reader and every writer per field, don't infer from reference count alone) before the Supabase schema design session, since several of these look likely to be genuinely live and simply missing a default.

---

*Build New Habits · Alongside: Move · Data Schema Reference · 30 Jul 2026 v1.9*
