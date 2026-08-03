# Alongside — Changelog

**Date:** 8 March 2026  
All versions reflect `store.js` schema version and the primary files changed.

---

## v1.3 — 7 March 2026

### Severe Zone Override

- `workoutGenerator.js` — `generateDailyOptions()` now calls `getZoneStatus()` before building the exercise pool. If any body zone is at severe pain, the full pool is bypassed entirely.
- New `generateSevereRestOptions()` returns a single Gentle Care card containing: breathing-478, breathing-box, breathing-diaphragmatic, mindfulness-breath-anchor, mindfulness-body-scan, mindful-walk. Exercises pulled directly from database by ID, bypassing all filters.
- Gentle Care card carries `isSevereRestDay: true` flag for the workout view renderer.
- Mood, intensity, and programme phase have no effect when severe is detected.

### Pain Fingerprint Cache

- `workoutGenerator.js` — `needsRegeneration()` previously only busted cache on date change. Bug: mid-day check-in with severe pain still returned the morning's cached workout options.
- New `painScoreFingerprint()` method: sorted string of `conditionId:score` pairs joined by `|`.
- Fingerprint written to `store` (`workoutsPainFingerprint`) at generation time.
- `needsRegeneration()` returns `true` if stored fingerprint differs from current — forces immediate regeneration on any pain score change.
- `store.js` — `workoutsPainFingerprint` field added (string, default `null`).

### Zone Model (conditions.js)

- All 29 conditions now carry a `zone` field: `lower-limb | spine | upper-limb | systemic`.
- New `getZoneStatus(conditionIds, painScores)` — derives zone severity (`severe / moderate / mild / null`) per zone. Returns `combinedSevere: true` when both `lower-limb` and `spine` are severe, triggering rest day messaging.
- Thresholds: 7–10 = severe, 4–6 = moderate, 1–3 = mild.

### Severe Zone Coach Messaging (today.js)

- New `renderSevereZoneMessage()` in `today.js`.
- Zone-specific banners: lower-limb, spine, upper-limb, systemic.
- Combined severe (lower-limb + spine): dedicated rest day banner.
- Banners use `role="note"` and `aria-label` for accessibility.

### mindful-walk Exercise

- Added to `js/data/exercises/recovery.js`.
- `coachNote: "severe-pain-appropriate"` — always available on severe days.
- Contraindications: `ankle-foot-acute`, `knee-acute` only.
- Pulled into Gentle Care card by ID; not filtered through the normal pool.

### Bug Fixes

- `recovery.js` — apostrophes in single-quoted JS strings caused `SyntaxError` at line 689. Contractions expanded to full words.
- **Rule established:** all human-readable strings must use double quotes as the outer delimiter. Apostrophes in single-quoted strings cause runtime `SyntaxError`.

---

## v1.2 — 5 March 2026

### Condition System Expansion

- `conditions.js` expanded from ~15 to 29 conditions.
- All conditions carry `hasPhase` flag for phase variant support.
- `PHASE_AWARE_CONDITIONS` set defined: hamstring, glutes, knee, hip, ankle-foot, achilles, shin-splints, sciatica, lower-back, upper-back, shoulder, wrist-elbow.

### Phase-Aware Condition Variants

- New `getActiveConditionIds(conditionIds, painScores)` — expands base IDs to phase variants at runtime. Pain 7–10 → `acute`, pain 4–6 → `subacute`, pain 1–3 → base only.
- Phase variant IDs are internal only — never shown to users.

### 3-Tier Safety Filter

- New `getExerciseSafetyTier(exercise, activeConditions)` — returns `avoid | caution | safe`.
- `avoid`: `contraindications[]` match → exercise not generated.
- `caution`: `caution[]` match → exercise shown with modification note.

### conditionPainScores (store.js)

- New `conditionPainScores: {}` at top level of store. Written at check-in submission.
- Persists independently of `lastCheckin` reset — pain context survives mid-day.

### prescribedExercises (store.js)

- New `prescribedExercises: []` placeholder. Schema defined now to avoid future migration cost. Level 1 UI is Phase 3 scope.

### workoutGenerator.js v1.2

- `getUserProfile()` includes `conditionPainScores` from store.
- `checkinForFilter` passes `painScores` to `getSuitableExercises()` for phase-aware filtering.

### Bug Fixes

- `pilates.js` export statement corrupted by regex fix. File redeployed clean.
- `today.js` — `SyntaxError` from `we're` in single-quoted string. Replaced with `we are`.

---

## v1.1 — 3–4 March 2026

### Strategic Layer

- `programmes.js` (new) — three 12-week programme templates: Build Your Base, Couch to Cardio, Back to Strength. Each defines phases, milestones, weekly targets, and phase coaching messages.
- `programmeEngine.js` (new) — `recordSession()`, `getProgressStats()`, `getCurrentPhaseMessage()`, `getPhaseBias()`, `getMilestoneMessage()`.
- `goal-setup.js` (new) — 3-step onboarding view: goal → sessions per week → programme. Writes `strategicGoal` and `activeProgramme` to store.
- `onboarding/complete.js` — routes to `goal-setup` instead of directly to `today`.

### store.js Additions

- `strategicGoal`: `primaryGoal`, `targetDescription`, `targetDate`, `targetValue`, `targetUnit`, `weeklySessionTarget`, `setAt`.
- `activeProgramme`: `programmeId`, `programmeName`, `startDate`, `currentWeek`, `currentPhase`, `sessionsThisWeek`, `totalSessions`, `milestones`, `completed`, `completedAt`.
- `progressLog`: session history array. Maximum 90 entries.
- `mergeWithDefaults()` updated to deep-merge all three new objects.

### workoutGenerator.js v1.1

- `applyProgrammeBias()` — adds `programmeScore` weighting per exercise based on phase focus. Additive only; never overrides daily adaptation.
- `getWorkoutFocusOrder()` — adjusts order of three daily options by phase bias.
- `getStrategicRationale()` — appends goal-connection line to workout rationale.

### Milestones and Progress

- `workout-complete.js` — calls `programmeEngine.recordSession()`. Renders milestone celebration UI.
- `progress.js` — 4-section view: programme overview, week dot timeline, recent sessions, milestone badges.
- Router updated — workout completion redirects to `progress` view.

### Bug Fixes

- Duration display — `formatExerciseDuration()` added. Previously raw seconds shown.
- perSide duration — `calculateDuration()` was multiplying a running total; fixed to calculate per-exercise.

---

## v1.0 — February 2026

Initial working build.

- Onboarding — 8-step flow: welcome, name, about, body/targets, goals, conditions, lifestyle, equipment.
- Check-in — energy, mood, sleep, condition pain scores. Burnout detection from 7-day history.
- Workout generation — 3 daily options based on energy, goals, conditions, equipment. Recovery mode on burnout.
- Exercise database — initial set across strength, cardio, mobility, yoga, pilates, rehabilitation, running, mindfulness.
- Workout view — step-through exercise cards with timers (manual start), skip/complete.
- Settings view — read-only profile display.
- Router — hash-based navigation across all views.
- store.js — localStorage persistence with typed get/set API.
- Equipment UI bug — spread operator issue causing equipment not to persist. Fixed.

---

## ⚠️ Maintenance gap, 8 Mar 2026 – 30 Jul 2026

This changelog was not maintained during this window while build velocity was high — many versions of `workoutGenerator.js`, `coach-proposal.js`, `sw.js`, and others shipped without an entry. Confirmed stale (byte-identical in repo and project knowledge) during the 30 Jul 2026 BUILD-4 session. **Decision: resume maintenance from this point forward** — see `Documents/Admin/master_schedule.md` for the decision record. Historical backfill for this gap is a separate, not-yet-scheduled decision.

---

## Resumed — 30 Jul 2026

### BUILD-4 — Schema Reconciliation, dead code removal

- `Documents/Live State/Schema.md` — new v1.9, ground-truthed directly against live `store.js` v10. Supersedes `schema.md` v1.3, `schema_v1_7_15jun2026.md`, `schema_md.docx`, and the v1.5/v1.8 delta notes.
- Two corrections found to the 28 Jul reconciliation note's own assumptions: `todayIntensity` confirmed live (written by `checkin.js` + `coach-proposal.js`, read by `workoutGenerator.js`) — previously assumed dead. `exerciseFeedback` confirmed dormant (read by `applyFeedbackWeighting()`, nothing writes it) — previously assumed live.
- `stats` confirmed not a store field (computed local var, never persisted) — the "specified but never built" flag was a false alarm.
- `hardBeforeSelections`/`hardBeforeShownAt` confirmed to be the existing `onboarding.hardBeforeSelections`/`onboarding.hardBeforeShownAt` fields, not a new pair.
- `workoutGenerator.js` v1.12 → v1.13 — removed dead `todaysWorkouts`/`workoutsGeneratedAt` writes and the orphaned `needsRegeneration()`/`getTodaysWorkouts()` function pair (confirmed uncalled anywhere).
- `sw.js` v180 → v181 — cache bump, deployed last. No behaviour change; dead code, zero live readers.

### Documents Reorganisation

- `Documents/` restructured into `Live State/`, `Admin/`, `Business/`, `Archive/`. `Documents/Admin/master_schedule.md` is now the canonical Master Schedule location (was project knowledge).

### Core Session `currentActivityEntry` data-integrity investigation

- Diagnosis: Core Session completions were never silently failing — `logActivity()`'s fallback always fired with real data. But `core-session.js` isn't reachable via `intention.js`'s `ACTIVITIES` list (core was never wired into that pattern), so no route ever sets a genuine pending `currentActivityEntry` before entering this file.
- Bug found and fixed: `finaliseSession()` and `savePartialSession()` were spreading `pending` (stale from the file's own previous completion, re-set into store after every write) into new writes — so two back-to-back Core Sessions not separated by an `intention.js` visit could share one `activityLog` id.
- `core-session.js` v3 → v4 — both functions now build the entry fresh, no `pending` spread; `logActivity()` always assigns a new id. No schema change.
- `sw.js` v181 → v182 — cache bump, deployed last.
- Related, not fixed this session: `yoga-session.js` has the identical spread-pending pattern and is also reachable directly from `library.js` without going through `intention.js` — same latent risk, out of this session's file scope.

### Yoga id-reuse fix — same session, follow-up on request

- `yoga-session.js` v4 → v5 — same id-reuse bug as `core-session.js` above, fixed. Unlike core-session, yoga's `pending` is sometimes genuine (via `intention.js`), so the fix distinguishes rather than discarding outright: a pending entry carrying `status` is stale (every `logActivity()`-written entry has one; `intention.js`'s fresh entry never does) and is now discarded instead of spread.
- `sw.js` v182 → v183 — cache bump, deployed last.

### Gym exit-guard gap — same session, found while tracing "workout.js not checked"

- Traced on request: `workout.js` had no `mountSessionGuard()` wiring at all — confirmed via `router.js`'s default popstate handler, which only defers to session-guard state when a `sessionGuard` flag is present in history. Without it, back-gesture mid-workout navigated away instantly, no confirmation, no partial save, `workoutProgress` left orphaned in store. Worse than the pattern BUILD-3 fixed elsewhere (those 6 files showed a confirmation card but skipped the save; gym showed nothing at all).
- Fixed: `workout.js` v5 → v6. `mountSessionGuard()` wired, `savePartialSession()` added (built fresh, no `currentActivityEntry` spread, same discipline as the two id-reuse fixes above), on-screen Exit button now shows a coach-voiced `showExitConfirm()` overlay instead of a blunt `confirm()`, `cleanupWorkout()` now calls `dismountSessionGuard()`.
- Also found and fixed while here: `.session-exit-overlay`/`.session-exit-card` (the on-screen overlay's CSS, shared by all 7 files using this local-overlay pattern — core-session, yoga-session, cycle-session, running-session, swim-session, walk-session, and now workout) had no styles anywhere in the repo. Was rendering unstyled — no backdrop, no card containment. Fixed in `css/components/session-guard.css` v1 → v2, styled to match the existing `.sg-*` back-gesture card's visual language.
- `sw.js` v183 → v184 — cache bump, deployed last.

### Yoga stuck-screen bug — found and fixed during on-device testing

- On-device testing (Graeme, 30 Jul, Step 3 of the test guide) surfaced a real bug: completing a real yoga session via "Finish practice" left the screen frozen on the last pose. Root cause: `yoga-session.js`'s `finaliseSession()` set `phase = "done"` but never called `rerender()` — confirmed by comparison with `core-session.js`'s equivalent function, which already had both lines. Practical effect: the genuine completion wrote correctly to `activityLog` (confirmed — `energyBefore: 7`, `creditsEarned: 120`, all correct), but the screen never advanced, so a second tap fired the same flow again, which `logActivity()`'s dedupe guard correctly rejected (working as designed, not a new bug).
- Fixed: `yoga-session.js` v5 → v6, one line added (`rerender();`). Two other call sites of `finaliseSession()` checked and confirmed already correct — no other changes needed.
- `sw.js` v184 → v185 — cache bump, deployed last.

### Dedupe window fix — found continuing on-device testing, same session

- Testing yoga Route B (two direct-from-Library completions, no Intention visit between them): two genuinely different, real yoga completions 83 seconds apart were silently rejected by `logActivity()`'s dedupe guard as a duplicate. `finaliseSession()` still showed the normal "Practice done" success screen with credits — the completion was never actually written, with no indication to the user.
- Root cause: the guard's 2-minute default window was built to catch near-instantaneous accidental double-fires (a double-tap, or the stuck-screen re-tap bug just fixed above) — those happen within a second or two, not two minutes. The wide window meant any two real, distinct completions of the same type within 2 minutes got wrongly rejected.
- Fixed: `store.js` v10 → v11, `dedupeWindowMs` default reduced from 2 minutes to 10 seconds. No caller overrides this default, so the fix applies uniformly across every activity type. `sw.js` v185 → v186 — cache bump, deployed last.
- **Separately flagged, not fixed:** when a write is rejected, the session view still shows a false "success" screen. Needs a coach-voiced message — a content/UX decision, not a code-only fix. Logged on the master schedule as an open item.

---

## 31 Jul 2026

### `gym-programme.js` — exit-guard + activity-visibility fix

- Ground-truthed against live code per the 31 Jul blueprint (not just re-stating the 30 Jul finding). Confirmed three issues, one new:
  1. No exit protection at all — neither the on-screen Exit button (instant `router.navigate('today')`, no confirmation) nor the back-gesture path (no `mountSessionGuard()` call anywhere in the file) protected an in-progress session. Same starting state `workout.js` was in before its own v6 fix, same day.
  2. Completions wrote only to `progressLog`, never `activityLog`. `progressLog` is read by exactly one place (this file's own week-12 reflection text); `activityLog` is read by 20 files, including `today.js`'s "you moved today" detection and `progress.js`'s recent-activity observations — both invisible to completed gym-programme sessions.
  3. **New finding, not in the original 30 Jul flag:** `reflect.js`'s save logic is gated on `store.get('currentActivityEntry')`. `gym-programme.js` never set it, so every reflect answer after a gym-programme session was either silently discarded or attached to a stale entry from an unrelated session.
- Fixed additively, per Graeme's confirmed decision (blueprint Section 2): `recordSession()`'s `progressLog` write is unchanged. `mountSessionGuard()`/`dismountSessionGuard()` now wired (same pattern as `workout.js` v6/`core-session.js` v4/`yoga-session.js` v5), on-screen Exit shows a `showExitConfirm()` Stay/Exit-and-save overlay, `savePartialSession()` added, `store.logActivity()` called at both partial-exit and genuine completion with the result written to `currentActivityEntry`.
- Activity type set to `"gym"`, not `"workout"` — `"gym"` is an existing key in `reflect.js`'s `QUESTIONS`/`FEEL_OPTIONS` maps, giving the tailored gym question and feel options rather than the `"other"`/`"coach-session"` fallback `"workout"` falls through to. Checked first: `today.js`/`progress.js` don't filter `activityLog` by `type` at all, so this choice only affects `reflect.js`'s question personalisation, nothing else.
- No CSS change — reused the existing `.session-exit-*` class family from `css/components/session-guard.css` v2 (confirmed present, no conflicting rules in `gym-programme.css`).
- `gym-programme.js` v2 → v3. `sw.js` v186 → v187 — cache bump, deployed last.
- **Not fixed this session, logged separately:** `workout.js`'s own completions still use `type: "workout"`, which isn't a key in either `reflect.js` map and falls through to the generic fallback questions. Out of this session's file list — flag for a future small fix if it's worth a dedicated touch.
- **On-device confirmation still required** before this can be marked closed — code review and Node-level checks only; no device available in this session.

---

## 03 Aug 2026

### BUILD-4 Appendix A follow-up — 18-field triage

- All 18 fields flagged in v1.9's Appendix A checked individually for both reader and writer, per the method BUILD-4 itself established. 11 confirmed live, 5 dormant (write-only, no reader: `proposalBias`, `workoutHistory`, `consentAt`, `consentGiven`, `usingGeneratedSession`), 2 dead (`todayEnergy`, `userTier`). None of the six flagged "possible overlaps" turned out to be real naming duplicates once checked.
- `Documents/Live State/Schema.md` v1.9 → v1.10. Appendix A closed; all fields folded into their proper sections.
- Two live bugs found, logged not fixed at the time (see below for the `userTier` fix, same day, follow-up): `session-builder-ui.js`'s `isPremium()` read a field with no writer; `proposalBias`, written by `coach-reflection.js`, has no reader anywhere.
- No code files touched in this session — documentation only, per blueprint scope.

### `session-builder-ui.js` — `userTier` bug fix

- Same-day follow-up once the bug above was confirmed. `isPremium()` was reading `store.get("userTier")`, a field with no writer anywhere in the app — the check always evaluated `false`, so Personal-tier session-builder options rendered as locked for every user, including paying Personal/Athlete subscribers.
- Fixed: now reads `store.get("tier")`, the genuine live field (matching `settings.js`/`progress.js`/`coach-proposal.js`).
- `session-builder-ui.js` v1 → v2. `sw.js` v187 → v188 — cache bump, deployed last.
- **On-device confirmation not yet done** — code review + `node --check` only. Worth a quick real-device check (switch to Personal tier via Settings' dev tier-switcher, confirm session-builder options unlock) next time a device is available.

### Supabase schema & architecture design (documentation only, no code)

- `Documents/Admin/alongside_supabase_schema_design_03aug2026_v1.md` — new. Design-only per blueprint: EU region (Frankfurt recommended), hybrid relational+JSONB table design, RLS policy shapes, magic-link auth confirmed, migration strategy, DPA/TIA checklist. No Supabase project created, no code touched.

---

### Wake Lock + resumable session — pilot on running-session.js

Found via Graeme's real on-device run, same day: pause wouldn't resume, a refresh caused a full restart, prompts never fired the entire run, vibration only worked with the screen open. Traced to one root cause — `elapsed` was tick-counted, not wall-clock-anchored, and nothing persisted session state during a run, only at exit.

- New file `js/session-resume.js` — shared checkpoint/resume module, same pattern as `session-guard.js`. `checkpointSession()`, `getResumableSession()`, `clearCheckpoint()`, `computeElapsedSeconds()`.
- `js/views/running-session.js` v3 → v4 — `elapsed` now computed fresh from timestamps every tick instead of incremented; checkpoints written at session start/pause/resume/each prompt; on cold mount, an interrupted run is offered back via a coach-voiced resume-or-fresh card (reuses `.session-exit-*` CSS as-is, no new styles); Wake Lock requested on start/resume, released on end/exit, re-requested on `visibilitychange`.
- Same file, same session: interval-structure work/recovery cues fixed from exact-equality matching (`elapsed === at`, fragile even without backgrounding) to a `>=` check against a fired-index set.
- `sw.js` v188 → v189, `js/session-resume.js` added to `SHELL_URLS`.
- **Not yet on-device confirmed** — no device available this session. This bug was only ever found through real use, so on-device confirmation (screen-lock-mid-run, force-refresh-mid-run) is the actual test gate here, not code review.
- **Pilot only** — `workout.js`, `yoga-session.js`, `walk-session.js`, `cycle-session.js`, `swim-session.js`, `core-session.js` not yet touched. Generalise once proven on running.

---

*Alongside — Build New Habits — build-new-habits.github.io/alongside-app/*
