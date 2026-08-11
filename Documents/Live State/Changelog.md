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

### upgrade.js crash fix

Flagged 31 Jul as a live crash risk, confirmed still present 03 Aug when directly re-checked (a separate tier-gating fix that day had actually landed in `session-builder-ui.js`, not this file — worth noting since it's easy to assume a bug's fixed once a similarly-described one is).

- `js/views/upgrade.js` v1 → v2 — `render()` called `store.getUserTier()`, which doesn't exist anywhere in `store.js`. Would have thrown the instant anyone navigated to the upgrade/membership screen. Fixed to `store.get("tier") || "free"`, matching every other live reader.
- `sw.js` v189 → v190.
- Confirmed no other `getUserTier()` calls exist anywhere else in the app.
- `upgrade.js` isn't in `sw.js`'s `SHELL_URLS` precache list — pre-existing, separate, left alone.

---

### Tier-gating infrastructure (S4-TG, 9 May 2026 scope, built 03 Aug)

Flagged 31 Jul as the highest-priority gap ahead of Supabase auth. Full architecture had already been scoped 9 May but never implemented. Ground-truthed against live code before building — reality had moved on from the spec in several real ways.

- New `js/auth.js` — `getUserTier()`, `isPremium()`, `isAthlete()`, `lockedFeature(html, tier, context)`, `initPaywallListener()`. Uses the live `tier` field (not `userTier`, which the May spec assumed but was never actually used anywhere).
- New `css/components/tier-gating.css` — locked-feature wrapper styling, every variable confirmed against `css/base/variables.css` before use.
- `js/app.js` v7 → v8 — one new import, one new call (`initPaywallListener()`) in `init()`. Tapping a locked feature navigates straight to `/upgrade` — no toast, since a real upgrade page now exists (built and polished earlier today) and the May spec's toast plan predated it.
- **Deliberately not touched:** `progress.js`'s existing tier gating (30/90-day lock, export lock, tiered observation depth) — already working, left alone rather than churned for no functional gain.
- **Deliberately not implemented — confirmed no longer applicable:** "coach style variants" (explicitly killed, Nurturing-only permanently, `settings.js` v7); "prescribed exercises Level 2+" (no difficulty-level concept exists in either prescribed file); "custom programme builder"/"Athlete analytics" (no generative programme engine exists); "mindful audio prompts mid-session" (no such feature found).
- Found, not fixed: `coach-proposal.js`'s `renderBypassDoor(tier)` has an unused `tier` parameter. Original intent unclear — logged rather than guessed at.
- `lockedFeature()` is not yet wrapped around any live feature — the infrastructure is real and syntax-verified, but no currently-ungated real feature was confirmed to exist to apply it to. Ready for whichever genuinely new premium feature needs it next.
- `sw.js` v190 → v191, `main.css` v10 → v11.

---

### Home Nav & Conditions Redesign — Phase A (schema + single-source-of-truth logic fix)

Blueprint: `alongside_blueprint_home-navigation-conditions_04aug2026_v1.md`. First of 4 touch-once phases. No view files touched — pure schema/logic foundation for Phases B-D.

- `js/store.js` v11 → v12 — two new fields: `conditionReflections` (array, `{ conditionId, text, loggedAt }`, deliberately separate namespace from `journalEntries`, not subject to the Journal Privacy Rule) and `conditionFoldInLevel` (`'partial'|'mostly'|'all'|null`, the condition-programme fold-in dial setting). Added to both `getDefaults()` and `mergeWithDefaults()`.
- `js/data/conditions.js` v1.2 → v1.3 — subacute severity threshold raised from `pain >= 4` to `pain >= 6` in both `getActiveConditionIds()` and `getZoneStatus()`, matching `checkin.js`'s existing Moderate boundary (`level > 5`). This is the canonical function `workoutGenerator.js` depends on for every session it generates, not just Core Sessions — widened from the original single-file (`core-session.js`) assumption in the spec after ground-truthing found the same threshold logic duplicated there, not unique to it. Confirmed with Graeme before widening scope. Acute/severe threshold (`pain >= 7`) left unchanged; a minor boundary edge case at exactly `pain == 7` (checkin.js still calls it "Moderate", this file now treats it as acute) is flagged, not fixed — out of this session's decided scope.
- `Documents/Live State/Schema.md` v1.10 → v1.11 — new fields documented; `userTier` bug (open as of v1.10) confirmed fixed 03 Aug, marked resolved.
- `sw.js` v191 → v192, deployed last.
- **On-device confirmation needed before Phase B** — the threshold change affects condition-aware filtering app-wide, for every user with logged conditions.

---

### checkin-mini.js severity-score alignment — same day, follow-up on request

While checking a report against the Phase A threshold fix, found `checkin-mini.js` has always had its own private, duplicate `PAIN_LEVELS` definition — same class of problem as `core-session.js`'s private exercise pool, just smaller. Its "Severe" chip wrote `score: 8` to `conditionPainScores`; `checkin.js`'s "Severe" button writes `9`. No live behavioural bug — both values already cleared every threshold that exists (`>= 6` subacute, `>= 7` acute) — pure single-source-of-truth cleanup, not a functional fix.

- `js/views/checkin-mini.js` v2 → v3 — `PAIN_LEVELS`'s `severe` entry: `score: 8` → `score: 9`. `"Moderate"` (`score: 6`) already matched `checkin.js` exactly, not touched.
- `sw.js` v192 → v193, deployed last.
- Out of Phase A's original file list — logged explicitly rather than silently bundled in.

---

### .ci-pain-chip text-overflow fix — same day, found on-device

Graeme sent a screenshot while confirming the Phase A threshold fix: "Moderate" text overflowing its pill, encroaching into the "Severe" chip next to it. Real, pre-existing CSS bug, unrelated to any of today's other changes — just surfaced by testing that button specifically.

- `css/components/checkin-conversation.css` v2 → v3 — `.ci-pain-chip` given `min-width: 0`. Root cause: flex items default to `min-width: auto`, so a `flex: 1` chip won't shrink below the width of an unbreakable word ("Moderate") — it was overflowing instead of wrapping. Also added `line-height: 1.2` to keep two-line wrapped text readable. `.ci-pain-chips`' existing `align-items: stretch` (flex default) keeps all four chips in a row the same height either way.
- Checked `checkin-mini.js`'s equivalent chips (`.ci-quality-chip`) for the same bug — not affected, that file already uses `flex-wrap` on the container instead of forcing four equal-width columns. No change needed there.
- `sw.js` v193 → v194, deployed last.

---

### Real bug found + three UI fixes — same day, from Graeme's on-device screenshots testing the Phase A threshold change

**The real one:** `coach-proposal.js`'s `_checkModeratePain()` had its own private, *third* copy of the severity threshold — `pain >= 4` — completely untouched by Phase A's fix to `conditions.js`. This is the direct cause of Mild (score 4) still showing "Your check-in flagged X today... I've worked around that." after the fix — this file never deferred to the canonical threshold in the first place, it had its own. Same class of problem as `core-session.js`'s private exercise pool and `checkin-mini.js`'s private pain scale — a third independent occurrence of the same pattern.

- `js/views/coach-proposal.js` v12 → v13 — `_checkModeratePain()` threshold corrected from `>= 4` to `>= 6 && < 7`, matching `conditions.js` and `checkin.js` exactly. Not refactored to import `conditions.js`'s functions this session — a minimal, safe constant fix; this file is already staged for a bigger rework in Home Nav Phase C, better to consolidate properly then.
- `css/components/checkin-conversation.css` v3 → v4 — two more overflow fixes. `.ci-pain-chip`'s earlier `min-width: 0` fix wasn't quite complete on its own (a single unbreakable word has nowhere to wrap without `overflow-wrap: break-word` too — added). `.ci-quality-chip` (the feeling-word selector — "energise", "confident", etc.) had the same overflow symptom but a different cause: it deliberately sets `min-width: 44px` for WCAG 2.2 touch-target compliance, so the pain-chip fix wasn't applicable — `overflow-wrap: break-word` added instead, touch target kept.
- `css/layouts/onboarding.css` v1 → v2 (first version header on this file) — `.onboarding-view`'s `min-height` calc never subtracted `--nav-height`, so it claimed nearly full viewport height on its own, before `#main-content`'s nav-clearance padding could help — the Continue button landed under the fixed bottom nav on every onboarding screen (Conditions, Goals, Equipment, Plan Select — anything sharing this class), not just where it was spotted. Real root-cause fix, not a padding patch on top of a padding patch.
- `css/components/coach-proposal.css` v5 → v6 — `.cp-constraint` (the "flagged" message) strengthened: 8%→14% background opacity, full border added, 4px left accent, subtle shadow, icon, body-size semibold text instead of small regular. Graeme reported missing it almost every time at the old styling. Contrast confirmed still WCAG AA.
- `sw.js` v194 → v195, deployed last.

---

### Pain Input Redesign — same day, Graeme's own instinct

Prompted by the chip-overflow bug above still looking "awful and unprofessional" once wrapped, plus a real product question: was Mild pain being silently ignored? Both true. Rather than patch the chip component a third time, replaced it — condition pain input now matches the app's own existing Energy/Mood slider pattern.

- `js/data/conditions.js` v1.3 → v1.4 — new `getPainBand(score)`, the one canonical function for pain-severity display bands (none 0-2, mild 3-5, moderate 6-7, severe 8-10) app-wide. Removed dead code `getPainContext()` — confirmed uncalled anywhere in `js/`, itself a **fourth** independent private duplicate of severity-threshold logic found today, still carrying the pre-fix `pain >= 4` value.
- `js/views/checkin.js` v8 → v9 — conditions panel converted from the 4-button `.ci-pain-chip` row to per-condition sliders (0-10), reusing `.ci-slider-wrap`/`.ci-value-row` exactly as Energy/Mood already do. Default for an unset condition changed from `1` to a genuine `0`, using explicit `!== undefined` checks throughout instead of `||` fallbacks, to avoid a falsy-zero bug now that real `0` values are reachable.
- `js/views/checkin-mini.js` v3 → v4 — same conversion. This file's own private `PAIN_LEVELS`/`painLevelForScore` — the fifth occurrence, counting today's earlier `checkin-mini.js` severity-score fix as a variant of the same pattern — retired in favour of `getPainBand()`.
- `js/views/coach-proposal.js` v13 → v14 — new Mild acknowledgment tier: `_checkMildPain()`/`_buildMildMessage()`, correctly prioritised under the existing Moderate message. Previously Mild pain produced no coach acknowledgment at all. Wording close to Graeme's own proposal: *"I've noted X as Mild today. I haven't changed anything in the programme, but keep an eye on it — if it starts feeling worse, please adapt what you're doing, or stop."* Existing Moderate message also upgraded to use `getConditionName()` for a real display name instead of the raw condition id.
- `css/components/checkin-conversation.css` v4 → v5 — new `.ci-slider-wrap--condition` (compact multi-slider variant) and colour-coded `.ci-value-label--none/mild/moderate/severe`. `.ci-pain-chip`/`.ci-pain-chips` removed entirely — confirmed unused anywhere in `js/` once the conversion landed.
- `Documents/Live State/Schema.md` v1.11 → v1.12 — `conditionPainScores` field note clarified (genuine 0-10 now, was 4 discrete values; no shape change, every consumer already used range comparisons).
- `sw.js` v195 → v196, deployed last.
- **Not yet on-device confirmed** — this touches both check-in entry points and the coach's response to them. Needs a full pass: log a condition via each slider, confirm the live label updates correctly at each band boundary, confirm Mild now shows the new acknowledgment message and Moderate still shows its own.

---

### Multi-condition message fix — same day, Graeme's follow-up question

Confirmed the screenshot working ("I've noted Glutes / Buttocks as Mild today...") and asked the right next question: does the condition name change per condition (yes, already dynamic), and what happens with more than one? Checked — both the Mild and Moderate messages were silently using only the first matching condition, dropping any others entirely from the message (never from workout filtering, which was unaffected — this was purely a messaging gap).

- `js/views/coach-proposal.js` v14 → v15 — new shared `_joinNames()` helper for natural-language lists ("X", "X and Y", "X, Y, and Z" — Oxford comma on 3+, not a raw dump). `_buildMildMessage()` now mentions every Mild condition, pluralising "it"/"them" and "starts"/"start" correctly. `_buildConstraintMessage()` (Moderate) now mentions every Moderate condition, folding each one's own score into its name ("Glutes / Buttocks (6/10) and Lower Back (7/10)") rather than showing one number that would misdescribe whichever condition it wasn't actually about. Single-condition wording unchanged from v14.
- **Known simplification, flagged not built:** if Mild and Moderate conditions both exist the same day, only the Moderate message shows — any Mild ones go unmentioned that day. Real, but a smaller gap than the one just fixed; logged for later.
- `sw.js` v196 → v197, deployed last.

---

### Mixed-severity condition narrative — same day, Graeme's follow-up

Real point, not just a wording request: the coach needs to narrate each condition by its own state — Moderate and Mild together on the same day, both said correctly — not one tier winning and the rest going silent. Checked first rather than assumed: exercise/recommendation adaptation already does this correctly, per-condition, via `conditions.js`'s `getActiveConditionIds()` — untouched, wasn't broken. The gap was narrative-only.

- `js/views/coach-proposal.js` v15 → v16 — replaced the old moderate-or-mild priority chain (`_checkMildPain`/`_checkModeratePain`/`_buildMildMessage`/`_buildConstraintMessage`, all removed) with one `_buildConditionNarrative()` that groups every logged condition by band (severe/moderate/mild) and builds a single combined, severity-ordered message. Example with two conditions in different bands: *"Your check-in flagged Lower Back (6/10) today. I've worked around that. I've noted Glutes / Buttocks as Mild — I haven't changed anything there, but keep an eye on it: if it starts feeling worse, please adapt what you're doing, or stop."*
- **Real finding, surfaced not absorbed:** Severe pain has no rest-day override anywhere live. `severePainOverride` is computed in `buildProposal()` but never consumed by anything; an old changelog reference to a "Severe Zone Override"/`generateSevereRestOptions()` doesn't exist in current `workoutGenerator.js` — removed or superseded at some point, unclear when. Severe conditions now get their own narrative line for the first time (*"...as Severe today — I've kept things well clear of that area."*), deliberately worded to match what the app actually does (acute-tier exercise exclusion) rather than implying a full rest day that isn't real. Whether Severe should get a genuine rest-day override is flagged to Graeme as its own decision, not built here.
- `sw.js` v197 → v198, deployed last.

---

### Severe pain: active Rest/Adapt choice — same day, Graeme's proposal

Real feature, not a copy tweak: Graeme proposed the coach explicitly ask, when pain is Severe, whether to rest or adapt — framed around genuine informed-choice/liability reasoning, not just UX polish. Built as an actual gate, not a suggestion the app quietly overrides either way.

- `js/store.js` v12 → v13 — new field `severePainChoices` (schema-first) and `recordSeverePainChoice()`. One record per date + exact severe-condition-id set: `{ date, conditionIds, choice: 'rest'|'adapt', chosenAt }`. Deliberately a log, not a single "last preference" — a changed severe set always re-prompts, and the history of what was actually chosen (not just offered) is preserved. This is what makes the liability framing real: an audit trail, not just a screen that flashed past once.
- `js/views/coach-proposal.js` v16 → v17 — `mount()` now checks for unresolved Severe pain before building anything. If present and no matching choice recorded yet today, `render()` shows only the coach's question — *"I noted that X is Severe today. I can adapt around it, or we can call today a rest day — what would you like to do?"* — plus two buttons, no doors, no options. "Rest today" records the choice and shows a gentle Wellbeing-or-done screen, no session generated. "Adapt and continue" records the choice and proceeds to the normal proposal, still narrating the Severe condition via the existing `_buildConditionNarrative()` as confirmation. Reused existing `.cp-missed-offer` CSS classes for the choice buttons — no new CSS needed.
- Cleanup, same pass: `_checkSeverePain()`/`severePainOverride` removed entirely from `buildProposal()`. This was flagged 04 Aug as dead placeholder code (computed, never used by rendering) for a "Severe Zone Override" feature that turned out not to exist live anywhere — now genuinely superseded by real handling, not just theoretically unused.
- **Explicitly not decided by Claude, flagged in the code comments:** whether this interaction pattern actually reduces legal liability is a real legal question, not a UX one. Built because the design is sound on its own merits (informed choice, respects autonomy, matches "behaviour is communication") — worth Graeme raising with Alex's solicitor contact alongside the other BIZ-5/6 items already queued, not assumed correct just because it feels safer.
- `Documents/Live State/Schema.md` v1.12 → v1.13.
- `sw.js` v198 → v199, deployed last.
- **Not yet on-device confirmed.** Needs a full pass: log a condition as Severe, confirm the choice screen appears and blocks the normal doors; choose Rest, confirm the gentle screen and no session; return same day, confirm no re-prompt; choose Adapt on a fresh severe set, confirm the normal proposal appears with the Severe line in the narrative.

---

### Phase B — core-session.js pool consolidation (Home Nav & Conditions Redesign)

Per `alongside_blueprint_home-navigation-conditions_04aug2026_v1.md`. The exercise-pool duplication the original redesign spec flagged as a "must not be repeated" failure — `core-session.js` had its own private, fully-forked copy of 23 exercises, separate from the shared database everything else in the app reads from.

- Confirmed by direct check: all 23 exercises `core-session.js` used already existed in the shared database (`js/data/exercises/{strength,mobility,rehabilitation}.js`), under the same or (in two cases) a corrected id. Not a second content set — a stale fork of the first one.
- `js/views/core-session.js` v4 → v5 — `EXERCISE_POOLS` (23 full duplicate objects) replaced with `EXERCISE_POOL_IDS`, a lightweight id-reference map resolved against the shared `EXERCISES` array in `buildSession()`.
- `js/data/exercises/strength.js`, `mobility.js`, `rehabilitation.js` — all v1 → v2 (first-ever version headers added to all three). Fields `sets`/`reps`/`holdSeconds`/`rest`/`cues`/`description` migrated onto the 23 relevant shared records, purely additively — no existing field on any shared record was changed. `description` was a second, follow-up migration pass — the shared records use `instructions[]`/`coaching`, not `description`, which the renderer actually needed; caught before it could ship as a live bug, not after.
- **Two genuine pre-existing bugs found and fixed:** `core-session.js`'s "stability" pool had a classic two-limb Dead Bug and Bird Dog incorrectly sharing ids ("dead-bug-progression-1", "bird-dog-rehab") with a completely different, gentler rehab-pool variant of each. Both variants already existed as distinct, correctly-detailed records in the shared database under their own ids (`dead-bug`/`bird-dog` vs the rehab-pool ids) — resolved by pointing each variant at its real shared id instead of the collided one.
- `buildSession()` rewritten: the private duplicated severity threshold (`pain >= 4` subacute — the pre-Phase-A value, never updated because this file was deliberately deferred to Phase B) replaced with `conditions.js`'s canonical `getActiveConditionIds()`/`filterByConditions()` — the same functions `workoutGenerator.js` already uses for every other session type. Selection also fixed: was always the first N items of a fixed-order array for every user, every time — now shuffled before slicing. Caution-tier exercises folded into the available pool rather than excluded (no caution-badge UI built this pass — a reasonable future addition, not required for consolidation).
- **Flagged, not silently resolved:** the shared `dead-bug`/`bird-dog` records' existing `contraindications` differ from what `core-session.js` previously excluded them for (dead-bug: was `["lower-back-acute"]`, shared has none; bird-dog: was `["lower-back-acute","wrist-elbow-acute"]`, shared has `["glutes-acute","lower-back-acute"]`). Shared data left untouched per single-source-of-truth — a real content-accuracy question for Graeme, not something to guess at.
- **Verified end-to-end, not just syntax-checked.** Ran an actual Node smoke test resolving all 23 ids against the live shared database, confirming every required field is present, and confirming contraindication filtering against a real condition/pain-score pair (lower-back at 8/10 correctly excluded 4 of 6 stability exercises, correctly left `dead-bug` unexcluded per the flagged discrepancy above).
- `sw.js` v199 → v200, deployed last.
- **Not yet on-device confirmed.** Needs a full pass across all four Core Session focus types (Stability, Strength, Mobility, Rehab), each duration, and at least one run with an active condition logged to confirm filtering and variety both work as expected on a real device.

---

### Phase C — Home screen and entry-flow rebuild (Home Nav & Conditions Redesign)

Per `alongside_blueprint_home-navigation-conditions_04aug2026_v1.md`. The single "Check in" CTA + gated funnel is gone — Home is now the six doors themselves, not a corridor leading to them.

- `js/views/today.js` v4 → v5 — full rewrite. Six always-visible doors: **Cardio, Core & Strength** (→ session-builder), **Mobility & Conditioning** (→ library), **Wellbeing** (→ noticing), **Conditions Update** (→ the existing conditions editor), **Progress** (→ progress), **Unsure? Coach decides** (→ coach-proposal). No forced check-in gate before doors 1–3, matching the spec's zero-effort principle. Settings now reachable directly from Home via a corner affordance. Deliberate behaviour change: the old auto-redirect to coach-reflection whenever a check-in existed for today is removed — auto-redirecting away from Home contradicted "Home IS the doors UI"; the coach line now reflects check-in/session status instead of the screen itself changing.
- **Two door routes are honest bridges, flagged not hidden:** Conditions Update points at the existing conditions editor until Phase D builds the real dedicated screen the spec describes; Mobility & Conditioning points at Library until it can pull from an actual Conditions Update programme. Both logged on the master schedule, not silently treated as final.
- **Real, previously-undiscovered bug found and fixed while wiring Door 1:** `js/router.js`'s `'session-builder'` route pointed at `./views/session-builder.js`, which doesn't exist — the real view file is `session-builder-ui.js` (`js/session-builder.js`, no "-ui" suffix, is a separate data/logic module that view imports from, not the view itself). `import(path)` would have thrown before the router's pattern-detection logic ever ran — this route could never have worked, on any device, until now. `router.js` v10 → v11.
- `js/views/coach-proposal.js` v17 → v18 — the three-doors-plus-bypass UI removed entirely, per the blueprint's Section 0.1 decision (reduce, don't retire). `DOOR_COPY`, `renderDoorFront()`, `renderBypassDoor()`, `handleDoorChoice()` all removed, along with their now-dead callers/helpers (`_buildAcknowledgement()`, `openPreviewPanel()`). This screen is only reached via Home's "Unsure? Coach decides" door now, so the session-options panel (previously "door-1," opened by a tap) opens automatically as part of the first render — no second choice on top of the choice already made by tapping the door from Home. `handleReturnContext()` updated to do a full re-render instead of patching the now-gone `.cp-doors` element. `closePreviewPanel()` ("Not today"/backdrop/close) now navigates back to Home instead of leaving an empty coach message with nothing actionable underneath.
- `css/layouts/today.css` v1 → v2 — new door-grid styling; old CTA/secondary-action/done-state rules removed, confirmed unused. `css/components/coach-proposal.css` v6 → v7 — `.cp-door*`/`.cp-bypass*` rule sets removed, same reasoning.
- `sw.js` v200 → v201, deployed last.
- **Known, not fixed this pass:** `today.js`'s and `home-threshold.js`'s `_doorToRoute()`-style fallback maps still carry `'bypass-library'`/`'bypass-facilitate'` entries from the retired bypass row — harmless (unreachable now, not broken), left alone since `home-threshold.js` wasn't in this phase's file list; touch-once discipline, not an oversight.
- **Not yet on-device confirmed.** Needs a full pass: all six doors from Home, Settings reachable and returns cleanly, "Unsure? Coach decides" shows the recommendation immediately with no extra tap, re-entry banner still works and correctly refreshes the panel, "Not today" returns to Home cleanly.

---

### Graeme's on-device pass on Phase C — 4 real fixes, same day

Seven screenshots, real findings across the board.

**1. Real regression, found via screenshot.** Phase C's auto-opened session panel is a full-screen fixed overlay (`z-index: 9999`) — Graeme reached the coach-proposal screen and completely missed the flagged condition/severity constraint message sitting right behind it, covered before he could read it.

- `js/views/coach-proposal.js` v18 → v19 — coach message content (greeting/reflection/constraint) now renders *inside* the panel when it's open, not just underneath it. Same latent bug also existed for the re-entry banner and missed-session offer, not yet triggered but real: `mount()` no longer auto-opens the panel while either is unresolved; `handleReturnContext()`/`handleMissedAdaptation()` open it themselves once resolved, each checking the other banner isn't also still pending.
- `css/components/coach-proposal.css` v7 → v8 — new `.cp-coach-block--in-panel` styling.

**2. The big one — check-in now genuinely gates the doors that need it.** Graeme's point: reaching a session-generating screen without ever checking in defeats the entire premise of it adapting to "where you are today."

- `js/store.js` v13 → v14 — new field `pendingDoorRoute`: remembers which Home door was tapped when it requires check-in first.
- `js/views/today.js` v5 → v6 — Cardio/Core/Strength and Unsure? Coach decides now route through full check-in (if not done today) or check-in-mini (if already done) before their real destination. The other four doors (Mobility & Conditioning, Wellbeing, Conditions Update, Progress) stay ungated — informational/self-directed, not generative. **Flagged for Graeme to confirm** this split is what he meant, not assumed settled.
- `js/views/checkin.js` v9 → v10, `js/views/checkin-mini.js` v4 → v5 — completion now honours `pendingDoorRoute` if set, continuing to the door's real destination instead of always landing on the generic default (`coach-reflection`/`intention`). Explicit alternate choices (prescribed exercises, skip) clear it rather than force-completing the door without real data.

**3. Equipment step copy mismatch.** `js/views/session-builder-ui.js` v2 → v3 — with no equipment saved in settings, every checkbox correctly rendered unticked, but the copy still said "untick anything you don't have" — confusing against an empty list with nothing to untick. Now says "tick anything you have today" when nothing's saved, keeping the "untick" framing only when there's real saved equipment to start from.

**4. Logged, not built this pass — two real gaps, properly scoped as their own future items, not squeezed in:**
- Cosmetic polish needed on the session-builder proposal screen (and likely others) — flagged for a future dedicated pass, per Graeme's own instruction not to fix ad hoc.
- `gym-programme.js` has no guided walkthrough — no timers, form cues, or video links, just a flat "tick when done" checklist. `workout.js` already has the full guided experience (timer, Start/Next/Skip, exercise detail). Real gap: without it, Empathy Transfer moments have nothing to attach to in gym-programme sessions. Scoped as its own future build, not attempted here.

- `sw.js` v201 → v202, deployed last.
- **Not yet on-device confirmed** — needs a full pass covering the panel-covering fix, both check-in gating paths (fresh check-in and check-in-mini), and the equipment copy in both saved/unsaved states.

---

### Conditions Update door bug — found while scoping Phase D, fixed immediately

Real, currently-live bug, not left broken while Phase D gets built. `today.js`'s Conditions Update door was calling `router.navigate('onboarding/conditions')` directly — the exact bug `settings.js` v9 already found and fixed once (documented in that file's own changelog): `onboarding/conditions.js` is built for the onboarding sequence, with Back/Continue hardcoded to onboarding-sequence destinations (Back literally calls `router.navigate('onboarding/goals')`), so a direct navigate() there loses the bottom nav and Back leads somewhere nonsensical.

- `js/views/today.js` v6 → v7 — same fix as `settings.js`: `openSheet()` from `sheet-manager.js` instead of a direct `router.navigate()`. Intercepts the hardcoded navigate() call and just closes the sheet.
- Interim only — Phase D replaces this bridge with the real Conditions Update screen the spec describes.
- `sw.js` v202 → v203, deployed last.

---

### Phase D-1 — schema (Conditions Update)

Both remaining decisions resolved same day they were logged (Graeme delegated D-1's design with a steer — "the aim to feel healed, or more able to cope, or improved" — and clarified-then-delegated D-2). Schema-first, per standing rule, ahead of any view code.

- `js/store.js` v14 → v15 — two new fields. `conditionGoals` (keyed by condition ID: `{ goalType: 'healed'|'cope'|'improve', note, setAt }`) — felt-sense, not numeric, deliberately not reusing `strategicGoal` (single-value, general-purpose, already spoken for). New `store.setConditionGoal()` helper. `prescribedExercisesOrigin` (`'professional'|'self'|null`) — set once when `prescribedExercises` first goes empty → non-empty, lets `prescribed.js`'s `buildCoachLine()` branch its two origin-referencing lines correctly when reached via Conditions Update's self-build route instead of a genuine prescription.
- `Documents/Live State/Schema.md` v1.13 → v1.14 — both new fields documented. Also caught and corrected: Schema.md had fallen a step behind `store.js` — `pendingDoorRoute` (shipped earlier today, Phase C follow-up) was never added to the field-reference table. Fixed in the same pass.
- `sw.js` v203 → v204, deployed last.
- No view code touched this phase — foundation only, per the phased file list in the Phase D blueprint. Phase D-2 (the actual Conditions Update screen) needs a UX design pass first, not just falling out of the file list — genuinely new screen surface (severity slider, reflection field, goal picker, milestones, three programme-build routes, fold-in dial control all on one screen).

---

### Phase D-2/D-3/D-4 — Conditions Update, the real screen

UX designed in conversation before any code (per the note above), then built straight through same day — Graeme's own words: *"I have a sore hip and need support, so I have a vested interest in sorting this now."*

- `js/views/conditions-update.js` (new) — one collapsed card per logged condition. Collapsed by default always, including the first time a condition is added, but with an unambiguous chevron affordance (rotates open, respects reduced-motion) plus a hover/focus background shift, so it reads as interactive before the first tap — direct response to "it needs to be really clear that it expands, not just quiet."
  - **Severity** — slider, reusing `checkin.js`'s exact pattern and CSS classes (`.ci-slider-wrap--condition` etc.), not a new component.
  - **Reflection** — one open text field, writes to `conditionReflections`.
  - **Goal** — three felt-sense pills (Feel healed / Cope better day-to-day / Feel stronger, improve) + skip, writes to `conditionGoals` via the new `store.setConditionGoal()`.
  - **Progress, combined with the goal** — once a goal is set, a severity trend shows alongside it (e.g. *"Moderate → Mild over the last 2 days"*), sourced from `checkinHistory`, which already recorded a daily snapshot of every condition's severity — no new tracking needed, confirmed before designing around it rather than assumed. Deliberately descriptive, not judgemental — no "good"/"bad" framing on a plateau, since conditions fluctuate and that would cut against the app's own "no shame" principle.
  - **Your programme** — one shared section below the cards, not duplicated per condition. Real finding while building: `prescribedExercises` is a flat, ungrouped list in the live schema, not condition-scoped — confirmed before designing, not assumed. Only "Build your own" ships (routes into `prescribed.js`); "coach builds it"/"coach recommends, you select" need real programme-generation logic that doesn't exist yet, comparable in size to NEW-1 (Programme Curation, already logged separately) — deliberately not shown as tiles that say "coming soon," the exact pattern removed elsewhere today (door-2/door-3).
  - **Fold-in dial** — shown once a programme exists, writes `conditionFoldInLevel`. The generator hook that reads it (Phase D-5) isn't built this pass; the setting is stored correctly regardless of when that lands.
- `css/layouts/conditions-update.css` (new), registered in `css/main.css` v11 → v12.
- `js/router.js` v11 → v12 — new `conditions-update` route. Not added to `hideNavViews` — management screen, not a session flow, same treatment as `settings`.
- `js/views/today.js` v7 → v8 — Conditions Update door now routes straight to the real screen; the interim `openSheet('onboarding/conditions')` bridge (today's earlier fix) is fully superseded, removed along with the now-unused `openSheet` import.
- `js/views/settings.js` v11 → v12 — "Edit conditions" now routes to the same real screen instead of the old limited onboarding sheet, which only ever let you toggle which conditions exist. Matches the original spec: Settings' panel is a shortcut into the same destination, not a separate UI. "Edit equipment" untouched. Known small rough edge, not a bug: `conditions-update.js`'s own Back button returns to Home rather than back to Settings specifically — no vanished nav, no nonsensical destination, unlike the bug this replaces.
- `js/views/prescribed.js` v1.0 → v1.1 — coach voice now origin-aware. Only 2 of 4 `buildCoachLine()` branches actually referenced professional origin; those two now check the new `prescribedExercisesOrigin` field and speak correctly when reached via Conditions Update's self-build route instead of a genuine prescription. Everything else (form, session flow, credits) unchanged.
- `sw.js` v204 → v205, deployed last, both new files added to `SHELL_URLS`.
- **Not yet on-device confirmed.** Needs a full pass: add/expand a condition, move the severity slider, set a goal and confirm the trend appears (or the "not enough history yet" message if too new), add a reflection, tap "Build your own" and confirm the coach line reads correctly, reach the screen both from Home and from Settings.

---

### Remove-condition fix — same day, found by Graeme after the on-device pass

Real gap: there was no way to remove a condition from `conditions-update.js`. The underlying toggle-off mechanism already existed (the "Add a condition" sheet lets you untick an already-selected condition), but nothing on this screen surfaced that as a "delete" action anyone would find.

- `js/views/conditions-update.js` v1 → v2 — explicit "Remove [condition]" action per expanded card, with a confirm dialog reusing `settings.js`'s existing `_confirmDestructive()` pattern (`.settings-dialog` CSS, already loaded app-wide) instead of a jarring native `confirm()`. Same minimal-cleanup approach as the existing toggle: removes the id from `conditions` only — severity history, reflections, and goal data stay in place, harmlessly orphaned, consistent with how the existing toggle already behaves.
- `css/layouts/conditions-update.css` v1 → v2.
- `sw.js` v205 → v206, deployed last.

---

### Check-in gating made optional, and real condition-programme routes built — same conversation

**Check-in gating fix.** Graeme: *"today's check-in gating means you now hit check-in-mini every single time you do a second session in a day - we should fix this so it's optional not fixed."*

- `js/views/today.js` v8 → v9 — session-generating doors (Cardio/Core/Strength, Unsure? Coach decides) now only force check-in the very first time today, when there genuinely isn't any data to adapt around yet. Once checked in today, doors go straight to their destination. A new "Update check-in" link replaces the "Check in" link on Home once already checked in — voluntary, not a gate.
- `js/views/checkin-mini.js` v5 → v6 — Skip now honours `pendingDoorRoute` the same way completing does, instead of always clearing it and dumping to the generic `intention` picker. Between this and the `today.js` change, check-in-mini is now genuinely optional rather than an unavoidable stop between every door tap and every session.

**Condition-programme routes — scoped, decided, and built.** Four of Graeme's decisions, all landed: programmes are one-time, not auto-regenerating (his confirmed instinct); flat list for now, explicitly captured in code comments as a deliberate placeholder rather than lost; 8 exercises per programme, not 4–6, because *"we should be helping the user work towards caring for and improving their condition"*; and the check-in fix above.

- `js/data/conditionProgrammes.js` (new) — real, tested exercise-selection logic. `buildConditionCandidates()` filters the shared exercise database by `affectsAreas` matching the condition and excludes anything contraindicated for its current phase. `buildCoachProgramme()` further filters by `rehabPhase` (matching or gentler than the condition's current severity) and biases the final 8 by goal type — "improve" leans toward more challenging options, "cope"/"healed" lean toward explicit rehab-phase matches. `buildRecommendedCandidates()` is the same safe pool, wider (16), presented as choosable rather than automatic. `commitProgramme()` writes to `prescribedExercises`, tagged with `conditionId`, replacing any existing programme for that same condition (a deliberate rebuild, not silent drift). Smoke-tested against real data before being wired into anything: lower-back at Moderate correctly returned 68 safe candidates and an 8-exercise programme of genuinely relevant rehab exercises.
- `js/store.js` v15 → v16 — `prescribedExercises` entries can now carry an optional `conditionId` (additive, nullable). New single-use context flag `prescribedExercisesActiveCondition`.
- `js/views/conditions-update.js` v2 → v3 — "Your programme" moved from one shared section at the bottom into each condition's own card, now that entries can be scoped. Three real routes per card: **Coach builds it** (automatic), **Coach recommends, I'll choose** (checkbox selection from the wider candidate pool), **Build my own** (routes into `prescribed.js`, passing which condition via the new context flag). "Ask the coach to rebuild this" appears once a programme exists, for a deliberate re-run.
- `js/views/prescribed.js` v1.1 → v1.2 — reads the context flag to tag new entries with `conditionId`, clears it immediately after (single-use, can't leak into an unrelated later visit); each exercise card shows a small "For: [condition]" tag when one is set.
- `css/layouts/conditions-update.css` v2 → v3 — programme section restyled for its new per-card home; new styling for the recommend-and-select checkbox list.
- `Documents/Live State/Schema.md` v1.14 → v1.15.
- `sw.js` v206 → v207, deployed last, new data file added to `SHELL_URLS`.
- **Not yet on-device confirmed.** Needs a full pass: tap a door for the first time today (still gates on check-in), tap a second door same day (should go straight through, no forced check-in-mini), "Update check-in" link works voluntarily, all three programme routes on a real condition, "For:" tags show correctly if exercises exist for more than one condition.

---

### Four screenshots from Graeme, same day — three real fixes, one confirmed finding

**Feeling-word chip wrapping.** `css/components/checkin-conversation.css` v5 → v6 — "energised"/"motivated"/"confident" etc. were breaking across 3 ugly lines each, cramped into a 6-across flex row even after today's earlier overflow-wrap fix. Converted `.ci-quality-chips` from flex+flex-wrap to a 2-column grid — each chip gets roughly double the width, so words fit in at most 2 lines. Graeme: *"perhaps we use more lines to make it fit ok"* — more rows, not more mid-word breaks inside one cramped chip.

**Invisible checkbox selection.** Real bug found immediately after shipping the "coach recommends" selection UI in the same conversation — Graeme: *"I can't tell which of these exercises I've selected."* Native checkboxes on this dark theme had no explicit colour, easy to miss at 20px, and nothing else on the row signalled state either.

- `js/views/conditions-update.js` v3 → v4 — each `.cu-recommend-item` label now gets an `is-selected` class matching its checkbox.
- `css/layouts/conditions-update.css` v3 → v4 — `accent-color` on the checkbox itself, plus a row-level background/border change on `.is-selected`, matching how every other selection control in this app already shows state (`.cu-goal-pill`, `.cu-foldin-btn`) rather than relying on the tiny native control alone.

**`coach-reflection.js` confirmed obsolete — traced, not assumed.** Graeme: *"I think this page is now obsolete?"* Checked before agreeing: the four-option "Your Session" picker (Suggest something for me / I have something in mind / My plans / Noticing) was reachable from exactly one place in the entire app — `checkin.js`'s completion handler, only when no `pendingDoorRoute` was set (i.e. reached via the standalone "Check in" link, not through a Home door). Its four options substantially duplicate what Home's six doors already offer directly.

- `js/views/checkin.js` v10 → v11 — that fallback now goes to `today` (Home) instead. `coach-reflection.js` itself left in place, not deleted — genuinely unreachable now, worth a proper look before removing the file outright rather than deleting it in the same pass as finding it dead.

**Logged, not fixed this pass:** a full aesthetics audit — Graeme noticed the check-in bottom-sheet panel (Energy/Mood/etc. sliders) covers the coach's message at the top of the screen when it opens. Real, but "we need to do a full audit of aesthetics" is a properly scoped future session, not a piecemeal patch — logged on the master schedule as its own item.

- `sw.js` v207 → v208, deployed last.
- **Not yet on-device confirmed.**

---

### Rationale + dislike signal for condition-programme candidates — Graeme's two ideas, both real, both built

Two questions asked in passing ("just asking") turned out to both have real, existing groundwork rather than needing anything invented from scratch.

**One-line rationale per exercise.** Checked before building: every one of 461 exercises in the shared database already carries a `why` field — zero gap, zero new content authoring. Now shown directly under each exercise name in the "Coach recommends, I'll choose" candidate list.

**Favourite/dislike.** Found something better than inventing a new mechanic: a full, already-approved spec exists — `alongside_exercise_skip_dislike_spec_16may2026_v1.docx` — deliberately not a rating system (its own words: "no stars, no thumbs, no scores"), just a binary signal: **Avoid entirely** or **Show less often**. Applied that exact model rather than a new one.

- `js/store.js` v16 → v17 — new field `exercisePreferences` (`{ [exerciseId]: { preference: 'avoid'|'less', setAt, source } }`), matching the spec's shape exactly. New `setExercisePreference()` helper.
- `js/data/conditionProgrammes.js` v1 → v2 — `buildConditionCandidates()` (the one function every other route in this file draws from) now excludes `'avoid'` exercises entirely. `buildCoachProgramme()` and `buildRecommendedCandidates()` both sort `'less'`-preferred exercises toward the end rather than hiding them — this is a browsing/choosing context, not a proactive suggestion, so soft de-prioritisation is the right behaviour, not exclusion. Smoke-tested against real data before wiring into the UI: an avoided exercise confirmed absent from both a real recommended-candidates call and a real coach-built programme.
- `js/views/conditions-update.js` v4 → v5 — "Not keen on this one" appears under each candidate; tapping it reveals "Avoid entirely" / "Show less often" inline. Choosing either writes the preference and, if the exercise had just been ticked, removes it from the pending selection too — avoiding the confusing contradiction of avoiding something you'd just chosen.
- `css/layouts/conditions-update.css` v4 → v5 — styling for the rationale line and the not-keen controls.
- **Explicitly out of scope, noted in code comments:** the full spec also covers skipping *during* an active session (`gym-programme.js`, `prescribed-session.js`, `core-session.js`), with a "not available today" vs "not keen" distinction that doesn't apply to a browsing list the way it does mid-workout. Not built here — real, separate, larger future work.
- `sw.js` v208 → v209, deployed last.
- **Not yet on-device confirmed.**

---

### Mobility & Conditioning — real programme link, last open bridge from Phase C closed

Per the original spec: "Mobility & Conditioning... pulls in whatever the Conditions Update programme has built" / "reachable as its own programme within that door." Since a real condition programme now exists (built earlier today), this door's interim Library-only bridge was genuinely out of date, not just theoretically incomplete.

- `js/views/today.js` v9 → v10 — the door now checks for condition-tagged `prescribedExercises` entries specifically (not just any entry — an untagged one could be an old-style physio prescription unrelated to Conditions Update). Routes to `prescribed.js` (which already has a working "Start Session" into `prescribed-session.js`) when a programme exists; falls back to Library exactly as before when there's nothing to pull in — no behaviour change for anyone without a condition programme. The door tile shows a small "Your programme" hint when this applies, so the routing isn't silent.
- `css/layouts/today.css` v2 → v3 — `.today-door__hint` styling.
- **Known small rough edge, not fixed:** `prescribed.js`'s own Back button returns to the general activity picker rather than Home when reached this way — pre-existing design on that screen (not introduced here), low-impact enough not to warrant a fix in this pass.
- `sw.js` v209 → v210, deployed last.
- **Not yet on-device confirmed.**

---

### "Add to my programme" button overflow — real bug, likely explains a second report too

Found via screenshot: "Add N to my programme" was overflowing its own pill shape — the same `white-space: nowrap` + `flex: 1`'s default `min-width: auto` bug found repeatedly today, in a button that had never been screenshotted at that specific count value before.

- `css/layouts/conditions-update.css` v5 → v6 — `min-width: 0` + `white-space: normal` on `.cu-recommend-actions .btn`, same fix pattern used everywhere else this was found today. Checked the screen's other buttons for the same latent risk first — none share it (`.cu-programme-options` is a full-width column, `.cu-foldin-options` already wraps correctly).
- **Likely explains a second, separate-looking report**: Mobility & Conditioning routing to Library instead of the condition programme just built. Re-verified the routing logic itself is correct — it only routes to the programme when a condition-tagged `prescribedExercises` entry genuinely exists. If the confirm button couldn't be tapped cleanly because of the overflow, the exercise may never have actually saved, which would fully explain the routing "failure" without there being a second bug at all. Flagged for Graeme to retest the full flow now that the button's fixed, not assumed resolved without confirmation.
- `sw.js` v210 → v211, deployed last.
- **Not yet on-device confirmed.**

---

### Library added as its own Home door

Real gap Graeme caught: "Don't we still want a library?" Once Mobility & Conditioning started smart-routing to the condition programme whenever one exists, Library lost its only path from Home in that case — genuinely unreachable, not just harder to find.

- `js/views/today.js` v10 → v11 — Library added as its own door, positioned before "Unsure? Coach decides" in the grid. Library is broader than mobility/conditioning content anyway (every session type, prescribed exercises, coach recommends), so it earns a real, always-present door rather than only surfacing as Mobility & Conditioning's conditional fallback. "Unsure? Coach decides" keeps its existing distinct treatment — spans both grid columns, dashed border, sits visually underneath — not counted as one of the "real" doors, exactly as before.
- No CSS changes needed — the 2-column grid and "Unsure?"'s full-width layout both already accommodate the extra tile automatically.
- `sw.js` v211 → v212, deployed last.
- **Not yet on-device confirmed.**

---

### Library landing screen — real missing-styles bug, not a design decision

Graeme's follow-up clarified the earlier report: Mobility & Conditioning correctly falls back to Library ("Start a session") when no condition programme exists — confirmed working as intended, not a bug. But tapping the new Library door landed on the same plain landing screen either way, which he'd hoped would look different now that it's a proper Home door.

Checked before treating this as a redesign: `library.js`'s own file comment describes the landing as "two large cards," but `.library-landing-grid`/`-card`/`-icon`/`-label`/`-sub` had zero CSS anywhere in the codebase. Genuine missing-styles bug — the intended design was already specified, just never built.

- `css/layouts/library.css` (new) — the two landing options ("Start a session," "Log what I did") now render as actual large, bordered, tappable cards with icon/label/subtitle, matching the app's established card language elsewhere (`.today-door`, `.cu-card`).
- `css/main.css` v12 → v13 — new file registered.
- Scope deliberately contained to just the landing screen, per Graeme's explicit choice — the full aesthetics audit (now 4 other confirmed screens) remains separate, future work.
- `sw.js` v212 → v213, deployed last.
- **Not yet on-device confirmed.**

---

### Rest of the Library page styled

Graeme: "Now we need to improve the cosmetics of the library page itself." Checked every class `library.js` actually uses before touching anything, not just the one screen already fixed.

- **"Start a session"'s category grid and its per-category session sub-screen** had zero CSS anywhere — same bug as the landing screen, just not yet found. `css/layouts/library.css` v1 → v2: added `.library-view` (page padding — the base `.view` class has none of its own, every other view sets it explicitly), `.library-sub-header`, `.library-category-grid`/`-card`/`-icon`/`-label`/`-sub`, `.library-session-grid`/`-card`/`-icon`/`-text`/`-label`/`-note`.
- **"Log what I did" checked and confirmed already styled** — it reuses `.library-card`/`.library-grid` from `settings-library.css`, genuinely fine as-is. Left untouched rather than re-styled unnecessarily.
- `js/views/library.js` v1 → v2 — session-card markup restructured slightly (label + note now wrapped in a `.library-session-text` span) so the icon-left/text-stacked-right layout works correctly; the two spans were previously flex siblings with nothing grouping them for that. No behaviour change, markup only.
- `sw.js` v213 → v214, deployed last.
- **Not yet on-device confirmed.**

---

### Force-update button + scroll-position fix

**Force update.** Graeme's laptop was on the latest version while his phone kept showing old, unstyled screens — checked before building anything: `sw.js`'s fetch handler is pure cache-first, so a stale file is served without the network even being consulted until a new service worker fully takes over.

- `js/views/settings.js` v12 → v13 — new "Update app" button in the About panel. Goes further than the existing `checkForUpdate()`/`applyUpdate()` in `app.js` (which only politely asks the current SW registration to check) — this also clears every cache directly and hard-reloads regardless of SW state, so it works even if the SW itself is what's stuck.
- `css/components/settings.css` v5 → v6.

**Scroll position.** Graeme: "when I'm selecting it stays where I am for continuity." Every state change in Conditions Update (severity, goal, checkbox, fold-in) calls a full `render()`, which was silently resetting scroll to the top each time.

- `js/views/conditions-update.js` v5 → v6 — `window.scrollY` captured and restored around every `render()`.
- `sw.js` v214 → v215, deployed last.
- **Not yet on-device confirmed.**

---

### Mobility & Conditioning's real landing page

Built to Graeme's confirmed design, replacing the smart-routing hack shipped earlier today.

- `js/views/mobility-conditioning.js` (new) — three cards. **Start a Mobility Session** routes to `core-session.js`, already condition-aware via Phase B's consolidated pool — genuinely adaptive, not a static list. **My Conditions Programme** collapsed by default (count + "tap to find out more"), expands to show exercises grouped by condition, a note pointing to Conditions Update for editing, and a "Start this programme" action into `prescribed-session.js`. Shows "Not created yet" with a direct link into Conditions Update when nothing exists. **Log an event** routes to Library's existing log flow.
- `js/router.js` v12 → v13 — new `mobility-conditioning` route.
- `js/views/today.js` v11 → v12 — door now routes straight to the new screen; the programme-or-Library smart-routing hack (and the Home tile's "Your programme" hint, now redundant) both removed.
- `js/views/prescribed.js` v1.2 → v1.3 — "Back to choices" no longer hardcoded to the confusing `intention` screen. Real fix Graeme flagged, more relevant now that this screen's primary entry point is the new landing page — both back buttons go to Home instead.
- New `css/layouts/mobility-conditioning.css`, `main.css` v13 → v14.
- `sw.js` v215 → v216, deployed last.
- **Not yet on-device confirmed.**

---

### Safety fix — `prescribed-session.js` now checks contraindications in real time

The most important item from Graeme's earlier feedback batch, prioritised over the cosmetic/design items ahead of it. Confirmed by direct check, not assumption: this file read zero condition or pain data at all — unlike `core-session.js` and `workoutGenerator.js`, which both check contraindications live at generation time. A programme built while a condition was Moderate could walk someone through now-contraindicated exercises after a later flare, with nothing flagging it.

- `js/views/prescribed-session.js` v2 → v3 — new `_checkContraindication()`. For exercises with a real `exerciseId` (coach-built or coach-recommended entries — manually added ones have no database record to check against, and are correctly left alone rather than false-flagged), compares that exercise's `contraindications` against `getActiveConditionIds()` for today's actual state. Doesn't silently hide or block the exercise — surfaces a clear flag above it and lets the person decide, same "behaviour is communication" pattern as `coach-proposal.css`'s existing constraint message, reused visually rather than reinvented.
- Smoke-tested against real exercise data before shipping: simulated severe pain on a condition correctly flagged an exercise with a matching contraindication; simulated mild pain on the same condition correctly did not.
- `css/components/workout.css` v2 → v3 — `.ps-contra-flag` styling.
- `sw.js` v216 → v217, deployed last.
- **Not yet on-device confirmed** — this one's worth testing carefully: build a programme, note a condition's severity, bump it to Severe via Conditions Update, then re-open the session and confirm the flag appears on the right exercise.

---

### Cross-condition programme integration — Graeme's recommendation, refined once before building

Graeme asked for a recommendation on whether the coach should reuse exercises across conditions rather than treating each programme in total isolation. First draft (tag one exercise to two conditions as two separate entries) was reconsidered before building: it would have meant completing an exercise once wouldn't mark it done under both conditions, credits would double-count it, and it would show up twice in any combined view — duplication wearing a nicer name, not real reuse.

**What got built instead:** one exercise entry can now genuinely belong to more than one condition.

- `js/data/conditionProgrammes.js` v2 → v3 — `prescribedExercises` entries: `conditionId` (singular) replaced with `conditionIds` (array). New `getEntryConditionIds()` reads both the new array shape and the old singular shape, so existing entries keep working with no migration step; rebuilding a programme naturally migrates them. `commitProgramme()` now detects when a candidate exercise already has an entry anywhere (matched by `exerciseId`, any condition) and adds the new condition to its `conditionIds` instead of creating a duplicate. `buildCoachProgramme()`/`buildRecommendedCandidates()` both bias toward reuse — an exercise already in the programme for another condition sorts ahead of a fresh one, *before* slicing to `PROGRAMME_SIZE` so it can actually make the cut, not just get reordered within a list that already excluded it — and annotate each candidate with `_reuseFrom` for the UI.
- `js/views/conditions-update.js` v6 → v7 — per-card "mine" filter and the "Coach recommends" candidate list both updated; candidates now show "Already in your X programme" when reused.
- `js/views/mobility-conditioning.js` v1 → v2 — the expanded "My Conditions Programme" view now correctly shows a shared exercise under every condition heading it belongs to, not just one.
- `js/views/prescribed.js` v1.3 → v1.4 — "For:" tag lists every condition an entry serves. Manual "Build my own" additions write the new array shape; no reuse-detection for these specifically (free-text entries have no `exerciseId` to match against — that mechanism only applies to coach-built/recommended entries).
- `css/layouts/conditions-update.css` v6 → v7, `Documents/Live State/Schema.md` v1.15 → v1.16.
- **Smoke-tested against real data before shipping, not assumed correct:** simulated two genuinely overlapping conditions (glutes/hip) — 4 exercises correctly ended up shared as single entries rather than duplicated (12 total instead of what would have been 16), and the auto-builder correctly preferred the reused ones first. Backward compatibility also confirmed: an old singular-`conditionId` entry read correctly, and rebuilding migrated it to the new shape without incident.
- `sw.js` v217 → v218, deployed last.
- **Not yet on-device confirmed.**

---

### `dead-bug`/`bird-dog` contraindications — content decision resolved

Flagged during Phase B pool consolidation, resolved now — Graeme's call, with a recommendation offered first.

- **Dead Bug** — empty contraindications confirmed correct as-is. It's a standard anti-extension stabilisation exercise, commonly used specifically as a safe option during low-back issues, not one typically avoided.
- **Bird Dog** — its lower-back/glutes exclusions also confirmed correct as-is (same anti-extension logic). But a real, separate gap was found and fixed: it puts real weight through the wrists in its hands-and-knees position, which nothing previously captured. Added `wrist-elbow-acute`.
- `js/data/exercises/strength.js` v2 → v3.
- Smoke-tested against the real contraindication-check logic before shipping — confirmed Bird Dog now correctly flags for severe wrist/elbow pain, Dead Bug unchanged.
- Worth noting: this data now feeds `prescribed-session.js`'s real-time safety check directly (built earlier today), not just descriptive content — flagged to Graeme as reasoned exercise-science judgement, not a clinical sign-off, given the stakes changed.
- `sw.js` v218 → v219, deployed last.
- **Not yet on-device confirmed.**

---

### Design Consistency Audit — Half A (structural pass)

Run solo while Graeme was at the gym, per the blueprint's own split (Half A is code-checkable, Half B needs his screenshots).

- **Real bug found and fixed:** `--color-bg-elevated` was referenced 46+ times across 14 CSS files with no definition anywhere in the codebase — confirmed exhaustively, not assumed. Every "elevated surface" app-wide (nested cards in Settings, Conditions Update, Mobility & Conditioning, Today's hover states, Progress, Library, journal entries, onboarding, `gym-programme.js`) was rendering with no background at all.
- Added `--color-bg-elevated: #3E4C63` to `base/variables.css`, matched to `--color-bg-hover`'s tier based on a real usage site's confirmed role, not picked arbitrarily.
- `main.css` v14 → v15, `sw.js` v219 → v220.
- Confirmed, not fixed: five-plus screens (`mobility-conditioning.js`, `conditions-update.js`, `coach-proposal.js`, `today.js`, `library.js`) each reinvent their own "card" component from scratch rather than sharing one base. No visible bug from this today, but it's exactly the kind of drift that produced the bug above — flagged as a real consolidation candidate, not a solo call to make.
- Full findings: `alongside_design-audit-half-a-findings_04aug2026_v1.md`.
- **Half B (screenshot review) not started — needs Graeme.** Should happen after this fix, not against a mental image from before it — several screens now look different than they did this morning.

---

### Gym Session Builder — Phase 1

Full blueprint run: `alongside_blueprint_gym-session-builder-phase1_05aug2026_v2.md`. Root cause confirmed 04 Aug: Library's "At the gym" Core/Upper body/Lower body/Strength cards all navigated to `gym-programme` with no parameter, and `gym-programme.js` had no way to receive one — all four produced the identical result regardless of which was tapped.

- **Fix:** these now route into `session-builder.js`/`session-builder-ui.js` instead — the already-working generative engine — with the matching type pre-selected via `sessionBuilderPreselect` (read once, cleared, same pattern as `running-session.js`'s resume checkpoint).
- **Allocation presets** — Balanced / Mostly strength / Mostly mobility, scaling the warmup/main/cooldown split. Warmup floors at 1 exercise regardless of preset — the safety rule holds structurally, not by convention.
- **Location step** — "Just one more thing — where are you for this?", shown once a session type is picked, not tied to check-in. Defaults home, never sticky, one tap to switch to gym. This is the actual fix for the flat-merged-equipment bug — now reads `homeEquipment`/`gymEquipment` based on today's answer.
- **Three build routes** — Coach builds it / Coach recommends, I'll choose / Build my own — mirroring `conditionProgrammes.js`'s architecture (not its persistent-storage model; still a one-off `generatedSession`). New `buildCandidatePools()`/`buildSessionFromSelection()` in `session-builder.js`, sharing the same equipment/contraindication filtering as the existing auto-build path rather than duplicating it.
- **Real cardio-warmup content** — bike, treadmill, cross-trainer, rowing machine — genuinely didn't exist anywhere before. Four new exercise entries, wired into Upper/Lower/Full/Glute's warmup categories, correctly equipment-gated (confirmed via test: appears with equipment, absent without).
- **"Strength" retired** from Library — never mapped to any real `SESSION_TYPES` id. Replaced with **"Glute Focus"**, which already existed in the engine and was never surfaced anywhere before now.
- **Settings' Equipment panel** now shows a saved-equipment summary (Home: N items / Gym: N items) instead of a bare button.
- **Pre-existing precache gap fixed while touching `sw.js`:** `session-builder.js`/`session-builder-ui.js` were never in the precache list at all, despite existing since May — more consequential now this path is reachable directly from Library.
- `session-builder.js` v1→v2, `session-builder-ui.js` v3→v4, `library.js` v2→v3, `settings.js` v13→v14, `sw.js` v220→v221.

**Real bug caught by testing, not shipped:** an earlier edit adding cardio-warmup to Glute Focus's warmup categories accidentally deleted its `mainCategories` line in the same replace. Found by a smoke test exercising all 7 session types — not by inspection — fixed before commit, re-confirmed working afterward.

**Found, not fixed — pre-existing content gap:** lower-body main exercise categories have no bodyweight-only options in the existing pool (confirmed via direct count — every tagged exercise requires equipment). A user with no equipment selecting Lower Body currently gets 0 main exercises. Predates this session, not introduced by it. Logged, not guessed at with new content.

**Not yet on-device confirmed** — no device available this session. Tested extensively via Node smoke tests against real store data (all 7 session types, the safety floor, equipment gating, the full preselect-to-build contract) — but this is exactly the category of thing (real day-to-day flow, equipment-dependent, multi-step) that's only ever fully proven through actual use.

---

### Overnight autonomous session — 10 Aug 2026

Graeme: "make decisions following my previous decision behaviours and move this forward." Scoped deliberately narrow — small, well-evidenced fixes that reduce untested surface area, not new speculative features on top of an already-large unconfirmed backlog.

- **Two real bugs fixed, `noticing.js`'s "Your reflections":** since `journal-entry.js` v3's privacy rewrite (14 Jul), entries have been written as `{date, text, tags}`, but `noticing.js` was still reading `entry.createdAt`/`category`/`body` (all undefined since 14 Jul) and `entry.type === "weekly-noticing"` (never written, always false). Reflections were showing blank date/text for every entry; `getRecentEntries()`'s sort compared `new Date(undefined)` for everything, meaning entries were never actually sorted by recency at all. Both fixed; the always-false "This week" badge removed rather than a working version guessed at. `noticing.js` v4→v5.
- **`journalEntryType` investigated, not fixed** — found bigger than the schedule's note suggested: the v3 rewrite dropped the whole pre-selected-screen mechanism, not just a field read. A real screen-design decision, left for Graeme.
- **Bodyweight-only lower-body content gap closed** — four new exercises across hip-hinge/single-leg/squat-pattern/leg-isolation, matching existing format and safety conventions exactly. Confirmed via test: no-equipment Lower Body went from 0 main exercises to 4. Full 7-type regression clean afterward. `session-builder.js` v2→v3.
- **Corrected, not executed:** the "orphaned duplicate, safe to delete" note on `exercises/index.js` is stale — three live features now import from it (`conditionProgrammes.js`, `core-session.js`, `prescribed-session.js`), all built after that note was written. Diffed directly against `exercises.js`: currently byte-identical in logic, only import-path depth differs — a real structural risk (manual sync required forever) but not something to merge unilaterally overnight. Documented, neither file touched.
- **Safety trace, Severe-pain Rest/Adapt flow** — read closely, no bugs found. One minor, non-urgent note: `severePainChoices` has no cap, unlike `activityLog`'s 200-entry limit.
- **Deliberately not touched** (all need real product judgment, not a defensible autonomous call): `coach-reflection.js` deletion, `renderBypassDoor()`'s unused parameter, the difficulty-scale migration, `gym-programme.js`'s missing walkthrough, NEW-2, Wellbeing-first entry.
- `sw.js` v222→v223.

---

### YouTube links restored + exercise-detail consistency audit — 10 Aug 2026

Two connected requests from Graeme. "I've noticed all the exercises have lost the YouTube links using key search words rather than direct videos" + "audit all exercise UX and UI to check they all look the same... what, how, why and with support."

**Part 1 — YouTube links, all 461 exercises.** Previously zero coverage across the whole main database. Traced content style per file before writing anything (`running.js` mixes technique drills with paced training sessions — 35 hand-crafted, not formula-generated). Three quality passes after the initial insert, each catching real issues: stray roman numerals ("warrior i" → "warrior 1"), duplicated words ("technique technique", "yoga yoga"), a genuine duplicate database entry for the same stretch under two ids. Confirmed via import test: 461/461, zero remaining issues.

**Part 2 — the connected finding that mattered most.** All 461 exercises already had `instructions`/`coaching`/`why` at 100% coverage *before* this session — the content was always there. The "Name, what to do, mark as done" screens had silent field-name bugs, not missing content:
- `workout.js` — regenerated a generic query instead of using each exercise's tailored term.
- `gym-programme.js` — three mismatches in one block (`setup`/`whyThis`/`videoUrl` checking fields that never existed; real fields `instructions`/`why`/`youtube`).
- `core-session.js` — instructions/coaching/video link never rendered despite full data coverage; separate singular/plural `.cue` bug in the overview list.
- `prescribed-session.js` — the most concerning, zero guidance for any prescribed exercise ever. Fixed by reusing the existing safety-check's `EXERCISES` lookup — database-linked exercises now show full guidance, manually-added ones correctly show notes only.
- `yoga-session.js` — its own separate 30-pose pool (a third exercise database, flagged not fixed) had no youtube coverage at all; added and wired up. `why` content doesn't exist in this pool — genuine authoring, left as a clean follow-up rather than rushed.

**Confirmed correctly out of scope:** `walk`/`run`/`swim`/`cycle-session.js` — continuous-activity pattern, not itemized exercises, traced directly rather than assumed.

- `js/data/exercises/*.js` (11 files), `workout.js` v6→v7, `gym-programme.js` v3→v4, `core-session.js` v5→v6, `prescribed-session.js` v3→v4, `yoga-session.js` v6→v7, `sw.js` v223→v224.
- Full syntax check clean across all 16 touched files. **Not yet on-device confirmed.**

---

### gym-programme.js rebuilt to match prescribed-session.js's UX — 11 Aug 2026

Graeme, with side-by-side screenshots: "Screenshot 1 is flat and barely offer any interaction... They all need to be like S2&3." Confirmed precisely: yesterday's fix (10 Aug) made the why/instructions/video content actually render, but never touched the real gap — this file was still a scrollable list of every exercise at once, one "Session done" button at the bottom, while `prescribed-session.js` and `workout.js` walk through one exercise per screen with a progress header, timer/reps display, and structured guidance.

- Rebuilt the render/event logic to walk one exercise at a time, reusing `prescribed-session.js`'s and `workout.js`'s exact proven markup and shared CSS classes (`workout-header`, `exercise-display`, `timer-circle`, `reps-display`, `exercise-instructions`, `coaching-tip`, `youtube-link`, `workout-actions`) instead of gym-programme's own bespoke classes — confirmed all already defined and globally loaded, no new CSS needed.
- `parseHoldSeconds()`/`formatTime()` copied directly from `prescribed-session.js` rather than reinvented.
- Completion tracking moved from DOM-scanning (`aria-pressed` buttons, only worked when every exercise was visible at once) to a `completedExerciseIndices` Set — "Next Exercise"/"Finish Session" mark completion, "Skip this one" doesn't, matching `prescribed-session.js` exactly.
- Week 6 glance, Week 12 reflection, programme progression, A/B alternation, activityLog/progressLog writes, exit-guard/partial-save — all unchanged, only the per-exercise walkthrough was touched.
- Old `gp-exercise-card__*` CSS now unused by this file, deliberately not deleted (the `gp-moment` glance/reflection styles in the same file are still needed) — logged as a separate cleanup decision.
- `gym-programme.js` v4→v5, `sw.js` v224→v225.

**Not yet on-device confirmed** — this is a structural rebuild of the core session-walkthrough flow, the highest-priority thing to test next.

---

*Alongside — Build New Habits — build-new-habits.github.io/alongside-app/*
