# Alongside — Build Progress Log
## Updated: 7 March 2026 | Phase 2 Complete → Phase 3 Ready

---

## OVERALL STATUS

| Metric | Value |
|--------|-------|
| **Current Phase** | Phase 3: Beta Preparation (starts 24 Mar) |
| **Phase 2 Status** | COMPLETE — delivered 7 March (16 days ahead of 23 March schedule) |
| **Overall Progress** | ~85% |
| **Next Milestone** | Beta opens early April 2026 |
| **On Track?** | YES — ahead of schedule |

---

## PHASE 2 FINAL SUMMARY (3 Mar – 7 Mar 2026)

### All Functional Tasks Complete

| Task | Status | Notes |
|------|--------|-------|
| t2_1 Equipment UI bug | ✅ COMPLETE | Spread operator fix. Equipment persists correctly. |
| t2_2 Goal setting system | ✅ COMPLETE | 3-step goal setup onboarding. strategicGoal in store. |
| t2_3 12-week programmes | ✅ COMPLETE | 3 templates in programmes.js |
| t2_4 Strategic rationale | ✅ COMPLETE | Links today's workout to long-term goal |
| t2_5 Milestone celebration | ✅ COMPLETE | workout-complete.js + progress view timeline |
| t2_6 Progress dashboard | ✅ COMPLETE | 4-section view: overview, week dots, sessions, milestones |
| t2_7 Post-workout redirect | ✅ COMPLETE | Completion → progress view |
| t2_8 Exercise database | ✅ COMPLETE | ~500 exercises across 11 category files (target was 150–200) |
| t2_9 Coach logo on all screens | → PHASE 3 | Intentional deferral — fits Phase 3 UI pass |
| t2_10 Teal headings + skip button | → PHASE 3 | Intentional deferral — fits Phase 3 UI pass |

### Additional Systems Built (Phase 2)

- **Condition system v2** — 29 conditions, phase-aware variants (acute/subacute), 3-tier safety filter (avoid/caution/safe)
- **Zone model** — conditions mapped to zones (lower-limb, spine, upper-limb, systemic)
- **Severe zone override** — generateSevereRestOptions() replaces full workout pool when any zone is severe
- **Pain fingerprint cache** — workouts regenerate when pain scores change, not just at midnight
- **Severe zone coach messaging** — today.js renders zone-specific messages + combined rest day message
- **mindful-walk exercise** — always available on severe days (except ankle-acute/knee-acute)
- **Multiple bug fixes** — duration display, perSide calculation, apostrophe syntax errors, pilates export corruption

---

## BUGS FIXED THIS SESSION (7 Mar)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| recovery.js SyntaxError line 689 | Unescaped apostrophes in single-quoted JS strings | Expanded contractions to full words |
| Severe zone not overriding workout options | Workout cache served stale options (date-only bust) | Pain fingerprint cache added — busts on pain change |
| Duration display showing raw seconds | formatExerciseDuration() not called | Helper added in today.js |
| perSide doubling total duration | Multiplied running total not individual exercise | Calculate each exercise independently |

**Rule established:** All human-readable JS strings (coaching text, instructions, why, labels) must use double quotes as the outer delimiter. Never apostrophes in single-quoted strings.

---

## SCHEMA CHANGES (store.js v1.3)

| Field | Type | Purpose |
|-------|------|---------|
| `conditionPainScores` | `{ [id]: 0–10 }` | Per-condition pain today. Drives phase-aware variant resolution. |
| `prescribedExercises` | `array` | Physio/coach prescribed exercises. Empty until Phase 3/4 UI. |
| `workoutsPainFingerprint` | `string` | Sorted key:value of conditionPainScores. Cache key for regeneration. |
| `strategicGoal` | `object` | User's primary goal — goalType, targetDetail, sessionsPerWeek, programmeId |
| `activeProgramme` | `object` | Active 12-week programme — id, currentWeek, currentPhase, startDate |
| `progressLog` | `array` | Session records written by programmeEngine.recordSession() |

**conditions.js additions:**
- `zone` field on all 29 conditions (lower-limb / spine / upper-limb / systemic)
- `getZoneStatus(conditionIds, painScores)` — derives zone severity, returns combinedSevere flag
- `getActiveConditionIds(conditionIds, painScores)` — expands to phase variants at runtime
- `getExerciseSafetyTier(exercise, activeConditions)` — returns avoid | caution | safe

---

## PHASE 3 TASK LIST (24 Mar – 13 Apr 2026)

### Deferred from Phase 2
- [ ] Coach logo on ALL screens — replace remaining teal boxes (polish)
- [ ] Teal headings consistency + Conditions skip button clarity (polish)

### New Phase 3 Items
- [ ] **Schema audit** — availableTime, prescribedExercises, weekly routine fields (run BEFORE building)
- [ ] **availableTime in check-in** — add today's time input, wire to workout generator params
- [ ] **Workout duration cap** — max per focus type (e.g. 60 min cardio) in getWorkoutParams()
- [ ] **prescribedExercises Level 1** — display physio exercises on today view (no generator integration)
- [ ] **Moderate pain zone coach messaging** — explain WHY pool is reduced, not silent
- [ ] **Exercise exit routes (Mild pain)** — inline alternative per exercise card
- [ ] **Settings view** — update equipment, blacklist, coachStyle post-onboarding
- [ ] **coachStyle wiring** — connect store key to milestone and coach messages
- [ ] **Condition story capture** — how it happened, what helps, professional involved

### Beta Preparation
- [ ] Landing page refresh (Formspree form exists)
- [ ] Email capture setup (ConvertKit / Mailchimp)
- [ ] Beta friend-code system
- [ ] Dev/staging environment setup (CRITICAL before real users)
- [ ] WCAG accessibility audit
- [ ] Body hotspot map for conditions (clickable SVG)

---

## DEFERRED PHASE ITEMS (NOT Phase 3)

| Item | Phase | Notes |
|------|-------|-------|
| prescribedExercises Level 2 (generator-aware) | Phase 4 | Complex — generator must know physio load |
| Weekly routine / schedule intelligence | Phase 3/4 | Schema exists. Possibly premium. Audit first. |
| Coach personality variants (Energetic, Minimal, Nurturing) | Phase 5 | Steady is built |
| Voice integration | Phase 5 | Coach speaks |
| Nutrition module | Phase 4 | |
| Student Life Hub | Post-launch | Separate B2B product |

---

## PHASE 3 START PROMPT

Copy this into a new Claude session to start Phase 3:

```
I am starting Phase 3 of the Alongside app build.

Phase 2 is complete as of 7 March 2026. The handoff document is in Project Files
(alongside_phase2_handoff_mar2026.docx). Please search project knowledge before
we start.

Phase 3 runs 24 March – 13 April 2026. Goal: app ready for Founding Member beta.

IMMEDIATE PRIORITY — Schema audit session:
Before writing any code, I want to review Alongside_json_schemas.md and discuss:
1. availableTime in check-in — should this be in the check-in UI now? How does it
   wire to getWorkoutParams()?
2. prescribedExercises — confirm Level 1 display design before building
3. Weekly routine / schedule fields — Phase 3 or premium feature?
4. Workout duration cap — what is the right approach in workoutGenerator?

After the schema audit, the next code task is the workout duration cap fix in
workoutGenerator.js getWorkoutParams().

Please search project knowledge and confirm what you find before we discuss.
```

---

## FILES NEEDING UPDATE / MANAGEMENT

### ADD to Claude Project Files
- `workoutGenerator.js` (v1.3 — severe zone override, pain fingerprint)
- `_js_data_conditions.js` (zone field, getZoneStatus, getActiveConditionIds)
- `_js_data_exercises_recovery.js` (mindful-walk added)
- `js_views_today.js` (zone messaging, formatExerciseDuration)
- `store.js` (v1.3 schema)
- `Alongside_progress_log_07_Mar.md` (this file)
- `alongside_phase2_handoff_mar2026.docx` (new handoff)

### REMOVE from Claude Project Files
- `alongside-handoff-march2026.docx` (superseded)
- `Alongside_progress_log_04_Mar.md` (superseded)

### UPDATE in GitHub /docs
- `docs/handoff.md` — Phase 2 complete, Phase 3 task list
- `docs/schema.md` — conditionPainScores, workoutsPainFingerprint, zone field
- `docs/changelog.md` — v1.3 entry

---

*Last updated: 7 March 2026*
*Phase 2 complete | Phase 3 starts 24 March 2026*
