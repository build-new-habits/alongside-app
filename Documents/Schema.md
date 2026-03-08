# Alongside — Data Schema Reference

**Version:** 1.3  
**Date:** 8 March 2026  
**File:** `js/store.js`  
**Storage:** `localStorage` key `alongside_user`

All data lives in a single JSON object under this key. `store.js` provides typed get/set access — never manipulate `localStorage` directly. On initialisation, `mergeWithDefaults()` fills any missing keys so existing users receive new fields without data loss.

---

## Schema Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial schema. Profile, check-in, workout, exercise feedback, credits, stats. |
| 1.1 | 3 Mar 2026 | Strategic layer: `strategicGoal`, `activeProgramme`, `progressLog`. |
| 1.2 | 5 Mar 2026 | Condition system: `conditionPainScores`, `prescribedExercises` (empty placeholder). |
| 1.3 | 7 Mar 2026 | Workout cache: `workoutsPainFingerprint`. conditions.js: `zone` field, `getZoneStatus()`, `getActiveConditionIds()`, `getExerciseSafetyTier()`. |

Migration note: `mergeWithDefaults()` handles all version upgrades automatically for simple field additions. Destructive changes (rename, remove) require an explicit migration function and a version bump.

---

## 1. Profile

Set during onboarding. Updated via Settings (Phase 3).

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `onboardingComplete` | `boolean` | `false` | Gates app entry |
| `onboardingStep` | `number` | `1` | Resume position if onboarding is interrupted |
| `name` | `string` | `''` | Required. Used in all coach messages. |
| `age` | `number\|null` | `null` | |
| `gender` | `string\|null` | `null` | |
| `hormonalTracking` | `boolean` | `false` | Enables menstrual cycle overlay |
| `weight` | `number\|null` | `null` | |
| `weightUnit` | `'kg'\|'lbs'` | `'kg'` | |
| `targetWeight` | `number\|null` | `null` | |
| `targetDate` | `string\|null` | `null` | ISO date |
| `targetDescription` | `string` | `''` | Plain text goal note |
| `goals` | `string[]` | `[]` | Goal IDs from `goals.js`. Drives exercise filter engine. |
| `conditions` | `string[]` | `[]` | Condition IDs from `conditions.js`. Base IDs only — phase variants derived at runtime. |
| `equipment` | `string[]` | `[]` | Equipment IDs from `equipment.js` |
| `coachStyle` | `string\|null` | `null` | `steady \| energetic \| minimal \| nurturing`. Store key exists; not yet wired to UI — Phase 3. |

### lifestyle (nested object)

| Field | Type | Values |
|-------|------|--------|
| `activityLevel` | `string\|null` | `sedentary \| light \| moderate \| active \| very-active` |
| `stressLevel` | `string\|null` | `low \| moderate \| high \| very-high` |
| `sleepQuality` | `string\|null` | `poor \| okay \| good` |

---

## 2. Check-In

Stored at `lastCheckin`. Resets automatically on the next app open after a date change. Comparison uses `new Date().toDateString()` format — e.g. `"Sun Mar 8 2026"`. Do not change this format.

| Field | Type | Notes |
|-------|------|-------|
| `date` | `string` | `toDateString()` format |
| `completed` | `boolean` | |
| `energy` | `1–10` | 1 = exhausted, 10 = peak |
| `mood` | `1–10` | 1 = struggling, 10 = fantastic |
| `sleep` | `number` | Hours as decimal |
| `sleepQuality` | `string` | `poor \| okay \| good` |
| `availableTime` | `number\|null` | Minutes available today. In schema spec; not yet wired to check-in UI or workout generator. **Phase 3.** |
| `menstrualDay` | `number\|null` | 1–28 or null |

### conditionPainScores (object) — added v1.2

Stored separately from `lastCheckin` at the top level.

```
conditionPainScores: { [conditionId]: 0–10 }
```

Written at check-in submission. Persists across the day so workouts regenerated mid-day still have pain context. Read by `getActiveConditionIds()` to resolve phase-aware condition variants, and by `getZoneStatus()` to derive zone severity.

---

## 3. Workout Generation Cache

| Field | Type | Notes |
|-------|------|-------|
| `todaysWorkouts` | `array\|null` | Array of generated workout option objects |
| `workoutsGeneratedAt` | `string\|null` | ISO timestamp of last generation |
| `workoutsPainFingerprint` | `string\|null` | Sorted `conditionId:score` pairs joined by `\|`. Compared on every `getTodaysWorkouts()` call. Cache busts when this differs from stored value — ensures pain score changes mid-day trigger immediate regeneration, not just at midnight. **Added v1.3.** |
| `todayIntensity` | `string\|null` | `low \| moderate \| high`. Derived from check-in energy. |
| `activeWorkout` | `object\|null` | The specific workout option the user selected. Written when they tap a card. |

---

## 4. Strategic Goal — added v1.1

Richer than `goals[]`. Drives programme selection and coach rationale. `goals[]` continues to drive the daily exercise filter engine unchanged — the two are kept strictly separate.

```
strategicGoal: {
  primaryGoal:         null,   // goal ID e.g. 'lose-weight'
  targetDescription:   '',     // plain text e.g. "Look great for holiday"
  targetDate:          null,   // ISO date string
  targetValue:         null,   // numeric e.g. 75
  targetUnit:          null,   // 'kg' | 'lbs' | 'km' | 'miles' | null
  weeklySessionTarget: 3,      // sessions per week commitment
  setAt:               null    // ISO timestamp
}
```

---

## 5. Active Programme — added v1.1

```
activeProgramme: {
  programmeId:      null,    // e.g. 'beginner-fitness'
  programmeName:    '',      // display name
  startDate:        null,    // ISO date string
  currentWeek:      1,       // 1–12
  currentPhase:     null,    // 'build' | 'push' | 'peak' | 'recovery'
  sessionsThisWeek: 0,       // resets each Monday
  totalSessions:    0,       // lifetime sessions on this programme
  milestones:       [],      // [{ id, label, achievedAt: ISO string }]
  completed:        false,
  completedAt:      null     // ISO string
}
```

Phase bias: `workoutGenerator` reads `currentPhase` to apply additive weighting to the exercise pool. This is additive only — daily adaptation logic (energy, burnout, conditions) always takes precedence.

---

## 6. Progress Log — added v1.1

Array of session records. Written by `programmeEngine.recordSession()` on workout completion. Maximum 90 entries; older entries pruned automatically.

Each entry shape:

```
{
  date:              'Sun Mar 8 2026',   // toDateString() format
  week:              3,                  // programme week number
  phase:             'build',            // programme phase
  focus:             'strength',         // workout focus type
  energyAtCheckin:   7,
  conditionScores:   { 'knee': 3 },      // snapshot of pain scores at time of session
  durationMinutes:   35,
  exerciseCount:     8,
  milestoneAchieved: null                // milestone ID string or null
}
```

---

## 7. Prescribed Exercises — added v1.2

Exercises prescribed by an external professional (physiotherapist, GP, coach). Empty array in v1.3. Level 1 display UI is Phase 3 scope.

```
prescribedExercises: [
  {
    id:           'prescribed-001',          // unique local ID
    exerciseId:   'hip-flexor-stretch',      // ID from exercise DB, or null if custom
    name:         'Hip flexor stretch',
    description:  'As prescribed by physio',
    frequency:    '2x daily',
    prescribedBy: 'NHS Physio',
    prescribedAt: '2026-03-01',              // ISO date string
    active:       true
  }
]
```

Integration levels (for reference — only Level 1 is in Phase 3 scope):

| Level | Scope | Description |
|-------|-------|-------------|
| 1 | Phase 3, free | Display prescribed exercises on today view. No generator integration. |
| 2 | Phase 4 | Generator-aware — reduce generated load on same body area as prescription. |
| 3 | Phase 5 | Full programme integration — 12-week plan accounts for physio protocol periods. |

---

## 8. Check-In History

Stored at `checkinHistory`. Array of completed check-in objects, most recent last. Maximum 30 entries; older entries pruned. The burnout detection algorithm reads the last 7 entries.

---

## 9. Exercise Feedback History

Stored at `exerciseFeedback`. Never pruned. Used by the Active Coach to avoid re-recommending exercises the user found harmful or dislikes.

```
{
  exerciseId:  'goblet-squat',
  difficulty:  'too-hard',
  reason:      'injury' | 'hate-it' | 'just-today',
  conditionId: 'knee',
  recordedAt:  ISO string
}
```

`reason` field behaviour:
- `injury` — triggers a permanent condition note; exercise avoided long-term
- `hate-it` — adds to blacklist; exercise not generated again
- `just-today` — temporarily deprioritises exercise for 7 days

---

## 10. Stats

Stored at `stats`. Should be computable from raw history data as a fallback.

| Field | Type | Notes |
|-------|------|-------|
| `totalWorkouts` | `number` | |
| `totalExercisesCompleted` | `number` | |
| `totalMinutesActive` | `number` | |
| `daysActiveLast30` | `number` | Preferred consistency metric — replaces streaks |
| `weeklyConsistencyScore` | `number` | Sessions this week divided by weekly target |

**Remove before beta:** `currentStreak` and `longestStreak` are legacy fields that conflict with the no-streaks design principle. Replace with `daysActiveLast30` and `weeklyConsistencyScore`.

---

## 11. Metadata

| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | `string\|null` | ISO timestamp. Set on first onboarding completion. |
| `updatedAt` | `string\|null` | ISO timestamp. Updated on every `store.set()` call. |

---

## conditions.js Reference

### Condition object shape

```javascript
{
  id:       'hamstring',
  name:     'Hamstring',
  icon:     '🦵',
  area:     'lower',       // lower | upper | back | general | hormonal | other
  hasPhase: true,          // supports acute/subacute phase variants
  zone:     'lower-limb'   // lower-limb | spine | upper-limb | systemic — added v1.3
}
```

### Zone mapping

| Zone | Conditions |
|------|-----------|
| `lower-limb` | hamstring, knee, hip, ankle-foot, glutes, calves, achilles, shin-splints, it-band, plantar-fasciitis |
| `spine` | sciatica, lower-back, upper-back, abdominals |
| `upper-limb` | shoulder, wrist-elbow, chest-pecs, biceps-triceps |
| `systemic` | chronic-fatigue, anxiety, breathing, fibromyalgia, hypermobility, osteoporosis, cardiovascular-condition, pelvic-floor, perimenopause, menopause, other |

### Phase-aware conditions

Conditions with `hasPhase: true` expand based on today's pain score:

| Pain score | Active IDs example |
|-----------|-------------------|
| 0 | none (condition not active today) |
| 1–3 | `hamstring` |
| 4–6 | `hamstring`, `hamstring-subacute` |
| 7–10 | `hamstring`, `hamstring-acute` |

Phase variants are internal only — never shown to users.

### Exported functions

```javascript
// Derive zone severity from today's conditions and pain scores.
// Returns { 'lower-limb': 'severe'|'moderate'|'mild'|null, ..., combinedSevere: boolean }
// combinedSevere = true when BOTH lower-limb AND spine are severe → triggers rest day.
getZoneStatus(conditionIds, painScores)

// Expand base condition IDs to include phase variants based on today's pain.
// Returns string[] — used as the active condition set for exercise filtering.
getActiveConditionIds(conditionIds, painScores)

// Determine exercise safety given a user's active conditions.
// Returns 'avoid' | 'caution' | 'safe'
getExerciseSafetyTier(exercise, activeConditions)

// Lookup helpers
getCondition(id)              // condition object by base ID
getConditionName(id)          // display name, handles phase suffix gracefully
getConditionsByArea(area)     // used by body-map UI grouping
getPainContext(conditionId, painScore)  // { phase, message } for check-in UI
```

---

## Exercise Object Shape

Category is added programmatically by `libraryLoader` at runtime — it is not stored in the JSON exercise files.

```javascript
{
  id:                'goblet-squat',
  name:              'Goblet Squat',
  category:          'strength',          // injected by libraryLoader, not in JSON
  contentType:       'practice',          // practice | guided | flow
  movementPattern:   'squat',
  equipment:         ['dumbbells'],        // required equipment IDs
  equipmentOptional: ['kettlebell'],       // usable but not required
  affectsAreas:      ['glutes', 'quadriceps', 'core'],
  contraindications: ['knee-acute'],       // hard block — exercise not generated
  caution:           ['knee-subacute'],    // soft block — shown with modification note
  energyRequired:    5,                   // 1–10, gates by check-in energy level
  duration:          null,                // seconds, for timed exercises (null = rep-based)
  sets:              3,
  reps:              12,
  rest:              60,                  // seconds between sets
  perSide:           false,
  instructions:      ['Step 1...'],
  coaching:          'Shown during exercise.',
  why:               'Science rationale shown in card.',
  credits:           60
}
```

---

*Alongside — Build New Habits — build-new-habits.github.io/alongside-app/*
