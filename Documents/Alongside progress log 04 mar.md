# Alongside — Build Progress Log
## Session: 4 March 2026

---

## What We Built

- **Equipment UI bug fixed** — root cause was array mutation by reference in the equipment toggle function. Fixed with spread operator (`[...array]`) plus auto-init guard added to `store.get()`. Confirmed working via DevTools localStorage inspection — 6 equipment items persisting correctly.
- **Build Tracker v2 upgraded** — File System Access API replaces the old download/upload workflow. Save now writes directly back to the OneDrive JSON file in Chrome/Edge with no manual steps.
- **Strategic layer fully designed and built** — design session produced schema, architecture decisions, and 6 production files covering the entire goal-setting and programme system.
- **Goal setup flow live (Option A)** — onboarding now routes through a 3-step goal selector (primary goal → weekly sessions → programme choice) before reaching Today. Confirmed working end-to-end with real data in localStorage.
- **Three programme templates built** — Build Your Base, Couch to Cardio, Back to Strength — each with 4 phases, phase-specific coaching messages, focus bias, and milestone definitions.

---

## Decisions Made

| Decision | Detail |
|---|---|
| Option A for goal setup | Goal setup is part of onboarding (not a Today prompt). New users flow from profile completion directly into goal/programme selection before seeing the app. |
| Separate `strategicGoal` object | Kept distinct from flat `goals[]` array. `goals[]` drives exercise filtering (unchanged). `strategicGoal` drives programme selection, rationale, and dashboard. |
| `mergeWithDefaults()` for existing users | Store init merges saved data with new schema defaults — existing users get new fields without data loss or forced re-onboarding. |
| Programme bias is additive, not overriding | Phase bias adds a `programmeScore` weight to exercises. Burnout and energy still override everything. Programme nudges — never commands. |
| `programmeEngine` lives in `js/data/` | Consistent with existing data layer pattern alongside `workoutGenerator` and `programmes`. |
| Strategic rationale appended, not replacing | Daily context rationale lines are unchanged. Strategic line is appended as a final sentence when a programme is active. |

---

## Phase 2 Task Status

| ID | Task | Status |
|---|---|---|
| t2_1 | Fix equipment UI bug | ✅ Complete |
| t2_2 | Goal setting system | ✅ Complete |
| t2_3 | Progressive plan templates | ✅ Complete |
| t2_4 | Strategic rationale | ✅ Complete |
| t2_5 | Milestone celebration UI | ⬜ Next |
| t2_6 | Progress dashboard | ⬜ Pending |
| t2_7 | Post-workout redirect | ⬜ Next |
| t2_8 | Exercise database expansion | ⬜ Pending |
| t2_9 | Coach logo on all screens | ⬜ Pending |
| t2_10 | Teal headings consistency | ⬜ Pending |

---

## Files Created or Modified

### New files (create in repo)

| File | Location |
|---|---|
| `programmes.js` | `js/data/programmes.js` |
| `programmeEngine.js` | `js/data/programmeEngine.js` |
| `goal-setup.js` | `js/views/onboarding/goal-setup.js` |

### Modified files (replace in repo)

| File | Location | What changed |
|---|---|---|
| `store.js` | `js/store.js` | v1.1 — 3 new schema fields, `mergeWithDefaults()`, `logSession()`, auto-init guard |
| `workoutGenerator.js` | `js/data/workoutGenerator.js` | Phase bias weighting, strategic rationale line, focus order from phase |
| `complete.js` | `js/views/onboarding/complete.js` | Routes to `onboarding/goal-setup` instead of `today` |

---

## Confirmed in localStorage (Graeme test profile)

```json
{
  "activeProgramme": {
    "programmeId": "beginner-fitness",
    "programmeName": "Build Your Base",
    "currentWeek": 1,
    "currentPhase": "build"
  },
  "strategicGoal": {
    "primaryGoal": "lose-weight",
    "targetDescription": "Holiday",
    "targetDate": "2026-04-25",
    "targetValue": 168,
    "targetUnit": "lbs",
    "weeklySessionTarget": 3
  },
  "equipment": ["adjustable-dumbbells", "band-light", "band-medium", "band-heavy", "outdoor-bike", "yoga-mat"],
  "goals": ["lose-weight", "improve-cardio", "build-habit"],
  "progressLog": []
}
```

---

## Issues Discovered

| Severity | Issue |
|---|---|
| Low | `goal-setup.js` uses CSS classes not yet in stylesheet — `.goal-grid`, `.goal-card`, `.session-option`, `.programme-card`, `.phase-pill`, `.confirm-card`. Goal setup will render without layout styling until CSS is added. Not a functionality blocker. |
| Low | `weightUnit` is `"lbs"` — progress dashboard should display target weight in matching units. Check on build. |
| Low | `progressLog` is empty until a full session completes through the new flow. Progress dashboard cannot be meaningfully tested until t2_5 and t2_7 are done. |

---

## Next Session Priority

**t2_5 + t2_7 together** — milestone celebration in `workout-complete.js` and post-workout redirect to progress view.

Both touch the same file. `programmeEngine.recordSession()` is already written and waiting to be called. Completing this pair unlocks the progress log so t2_6 (dashboard) has real data to display.

---

## Docs to Update in GitHub /docs

| Document | What needs updating |
|---|---|
| `alongside-handoff-march2026.docx` | Full status update — 4 tasks completed, strategic layer now built |
| `05-system-architecture.docx` | Add 3 new files to file structure section |
| `07-active-coach-spec.docx` | Strategic layer section — mark as built, not "not yet built" |
| `08-data-schema.docx` | Add `strategicGoal`, `activeProgramme`, `progressLog` schema definitions |

---

## Technical Rules (unchanged)

- Import paths: use `../../store.js` not `./store.js` from `views/onboarding/`
- Import paths: use `../store.js` from `views/`
- Always `window.scrollTo(0, 0)` on new screens
- Timers: NEVER auto-start — user starts when ready
- Entire `.execution-set` is clickable (large tap target — accessibility)
- Exercise `category` field is added programmatically by `libraryLoader`, not in JSON
