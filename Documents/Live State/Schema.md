# Alongside — Data Schema Reference
## 12 Aug 2026 v1.27

**File:** `js/store.js` (confirmed live version: **v32, 12 Aug 2026**)
**Storage:** `localStorage` key `alongside_user`

**This version supersedes:** v1.26 (12 Aug 2026).

**v1.27 (12 Aug 2026)** — EMP-1. One new field, `empathyLastPrompt`. `store.js` v31 → **v32**.

## `empathyLastPrompt` — **NEW, `store.js` v32, 12 Aug 2026**

```
empathyLastPrompt: { stage: number, index: number, runLength: number }
```

| Key | Meaning |
|---|---|
| `stage` | Stage the last-fired prompt belonged to. `0` = none yet |
| `index` | Position within that stage's pool. `-1` = none yet, distinct from a real index of `0` |
| `runLength` | How many times consecutively that same prompt has fired |

**Why it exists.** Empathy prompts were selected by `pool[atStage % pool.length]` — pure rotation — so nothing needed to remember *which* prompt fired, only how many had. Condition-aware selection can legitimately land on the same prompt several sessions running, because the pools hold four or five prompts and somebody can genuinely struggle repeatedly. `runLength` caps that at two consecutive firings before the next-best fitting prompt is taken instead.

**Written by:** `js/views/reflect.js` on fire. **Read by:** `js/data/empathy-transfer.js` during selection.

**Validated as a whole object**, not field by field. A partial object is worse than none here: `runLength` would be counting a prompt that `stage`/`index` no longer identifies.

**v1.26 (12 Aug 2026)** — DOC-2. The line below previously read *"No `store.js` change in this pass — `store.js` remains v21."* That was left over from the v1.20 text and was wrong from v1.21 onward: the header two lines above already said v30, so this document contradicted itself on its own front page. Corrected, and the supersedes line now points at the version it actually supersedes rather than at v1.20.

No `store.js` change in this pass either — it remains **v30**, and DIC-1 (12 Aug) deliberately introduced no new fields, writing the existing `sessionVariety` instead.

---

## `exerciseHistory` — **NEW, `store.js` v22, 11 Aug 2026**

`{ [exerciseId]: { n, first, last, best } }`, default `{}`.

| Key | Type | Meaning |
|---|---|---|
| `n` | `number` | Times completed, all time |
| `first` | ISO string | First completion |
| `last` | ISO string | Most recent completion |
| `best` | `{ weight, reps, unit, at }` \| absent | Optional performance note |

**Why it exists.** Until this field, the product recorded that a session happened and how many exercises it contained — `activityLog` entries carry `exercisesCount: 3` — and never which exercises they were. Nothing persisted what a person had actually done.

That single absence is why selection had to be `Math.random()` over 497 exercises, and therefore why there was no progressive overload (you cannot get stronger at an exercise you meet once), no skill acquisition (you cannot correct a fault you never repeat, which made the entire `watchOut` library decorative), and no familiarity (the nervous beginner needs to recognise the session).

**Written by** `store.recordExercises()`, called automatically by `logActivity()` when a completion supplies `exerciseIds`. Single write path, so no call site can log a session without logging its contents. **Partial exits are excluded deliberately** — an abandoned session did not teach anything and must not make an exercise look familiar.

**Read by** `session-builder.js` v11 for continuity-aware selection, via `store.exerciseStats()`.

**Shape choice:** a map rather than an append-only log, because selection needs "how often, how recently" for every candidate on every build, and scanning a growing array on a phone would not hold. The full narrative already lives in `activityLog`.

**P4 applies.** This is per-exercise behavioural data. `best` is a flat reference the person left themselves — nothing narrates it, nothing compares it, and it is never used to comment on consistency or decline.

**Call sites supplying `exerciseIds` so far:** `gym-programme.js` v9, `workout.js` v10. `core-session.js`, `yoga-session.js` and `prescribed-session.js` do not yet — they still log a count only, so their exercises never become familiar. Outstanding.

---

## `capability` — **NEW, `store.js` v25/v29, 11–12 Aug 2026**

Object, all keys default `null`.

| Key | Values | Question asked |
|---|---|---|
| `chairRise` | `'yes'` \| `'not-easily'` \| `'no'` | Can you get up from a chair without pushing off with your hands? |
| `floorAccess` | `'yes'` \| `'not-comfortably'` \| `'rather-not'` \| `'no'` | Can you get down to the floor and back up on your own? |
| `bothFeet` | `'yes'` \| `'no'` | Do you currently do anything where both feet leave the ground? |
| `balanceWorry` | `'no'` \| `'sometimes'` \| `'yes'` | Do you ever worry about losing your balance? |
| `legPower` | `'full'` \| `'limited'` \| `'none'` | Only asked when `chairRise` is `'no'` or `'not-easily'` |
| `askedAt` | ISO string | |

**Why it exists.** Answering *"if we are not age restricting, how do we ensure the appropriate level for that user?"* The instrument was wrong, not the policy: `lifestyle.activityLevel` measures **frequency**, not **capacity**. Somebody can garden daily, answer "moderate" honestly, and still not get off the floor unaided — which under the raised difficulty ceilings meant jump squats.

**Three-state, not boolean.** A yes/no pair forces a wheelchair user into a lie that also erases them. `'not easily'` and `'no'` are different answers: one is difficulty, the other is a different body.

**`legPower` is a separate axis from standing (v29).** "Can you rise from a chair" and "do your legs work" are different questions — somebody recovering from a hip replacement cannot stand safely and has full leg function. Conflating them is how a well-meaning adaptation still hands a person the thing they cannot do.

**Read by** `store.capabilityProfile()`, which returns `{ impactSafe, floorSafe, balanceSafe, needsSeated, legsUsable, legsLoadable, ceilingCap, asked }`. Consumed by `session-builder.js` v21. **Unasked is always treated as the cautious answer.** The screen can only ever *lower* a difficulty ceiling, never raise one.

**Collected by** `js/views/onboarding/lifestyle.js` v3.

---

## `trainingIntent` — **NEW, `store.js` v26, 11 Aug 2026**

`'improve' | 'maintain' | 'recover'`, default `'improve'`.

**We do not ask about trajectory, and we never announce it.** `exerciseHistory` and repeat capability screens make direction observable, but saying "you seem to be declining" is a verdict, breaches P4, and is exactly what would make somebody delete the app. **Trajectory may change what is offered. It never changes what is said.**

`'maintain'` is **not** a diluted `'improve'`. What is lost first is specific and known — power before strength, balance early, grip strength (which predicts independence better than almost anything), and floor transfer (which decides whether somebody keeps living in their own home). Maintenance *prioritises* those rather than doing less of everything.

**Read by** `session-builder.js` (main-section tilt) and `session-rationale.js` (arc). **Not yet collected — no screen asks the question.** Wording proposed, awaiting confirmation. See CAP-6.

---

## `sessionVariety` — **NEW, `store.js` v23, 11 Aug 2026**

`"familiar" | "balanced" | "varied"`, default `"balanced"`.

Persona 2.13 (ADHD, novelty-driven, abandons routine after ~2 weeks) and persona 2.14 (autistic, predictability-seeking) are opposite motivational shapes. The persona matrix has carried *"novelty vs predictability has no explicit preference capture"* as an open gap since 05 Jul 2026.

CONT-1 made that gap urgent rather than theoretical — continuity became a real force in selection, so a single default actively serves one persona at the other's expense. Traced live, both received 51–57% session-to-session overlap: one treatment serving neither well.

**Read by** `session-builder.js` v13, scaling the novelty rate (0.10 / 0.25 / 0.55).

**Never inferred from behaviour.** Guessing that somebody wants variety because they skipped a session would be exactly the silent judgement this product refuses. It is asked, or it stays at the honest default.

**Not yet collected in onboarding or Settings** — the field and the engine are live; the question is not. Outstanding.

---

## Cross-reference — exercise content fields

Static exercise entries in `js/data/exercises/*.js` are **not** store fields and are not documented here. Their canonical definition is `Documents/Live State/exercise_entry_standard.md` (11 Aug 2026 v1).

Two fields were added to that standard on 11 Aug 2026:

- `watchOut` — `string[]`, the failure modes and their correction. Previously absent from all 461 entries and all four private pools; had never existed.
- `load` — `string`, effort-relative weight guidance. **Never an absolute weight**, per Locked Principle P4: an absolute target is an interpretation of load, and a benchmark with a verdict attached.

Baseline at time of writing, from `Documents/Admin/Templates/validate-exercise-entries.mjs`: 461 entries, 0 carrying `watchOut`, 49 loaded exercises missing `load`/`sets`/`reps`. CON-9 backfills, equipment-requiring exercises first.

**Open finding, logged not fixed:** `contentType` is written on 368 of 461 exercise entries and read nowhere in the codebase. `category` is what the engines select on. Same writer-without-reader pattern already recorded here for `proposalBias`. Retire or wire up — separate decision.

---

**Previous supersession note:** `schema.md` v1.17 (09 Aug 2026). Adds the new nested `consent{}` object (`store.js` v19) — see Section 1. This closes a gap found by the Persona Tracing Wave 1 store audit: live onboarding had captured **no legal consent record at all** since the OB-THREAD rebuild retired `welcome.js`. Consent is now an affirmative tick with a recorded policy version, not implied consent. The age gate is built but inert pending A1.11.

**Previous version note (v1.17):** superseded `schema.md` v1.16 (04 Aug 2026). Two catch-ups in one pass: (1) `exercisePreferences` (`store.js` v17, 04 Aug) was never documented here — added below. (2) New `inStepProgress` (`store.js` v18, 09 Aug) for the "In Step" Noticing Hub feature (Personal tier) — four-movement scenario practice extending the empathy transfer arc. Full feature spec developed in PM chat, 09 Aug 2026.

**Carried forward from v1.15:** `prescribedExercises` entries: `conditionId` (singular) replaced with `conditionIds` (array) — real exercise reuse across conditions, not duplication. One entry can now genuinely serve more than one condition. Backward compatible — old singular-shaped entries still read correctly via the new `getEntryConditionIds()` helper, no migration step required. `js/data/conditionProgrammes.js` v2→v3 (not a schema file, but the reason this changed).

**Carried forward from v1.10, still relevant:** `proposalBias` is written in `coach-reflection.js` (12 sites) but read nowhere else in the codebase, including by `coach-reflection.js` itself. The reflection logic computes a `"lighter"`/`"rest"`/`null` bias per reflection type (severe pain, burnout risk, consecutive days, returning after absence) clearly intending to influence the next generated proposal — but nothing downstream ever consumes it. Same "specified but never wired up" pattern already on record for `exerciseFeedback` and Empathy Transfer's early stages. Still open, not fixed here — out of this session's scope.

**Resolved since v1.10:** `userTier` (previously flagged here as read-but-never-written, locking paying users out of session-builder options) was fixed 03 Aug — `session-builder-ui.js` v2 now reads `tier`, the genuine live field. No longer an open item.

All data lives in a single JSON object under this key. `store.js` provides typed get/set access — never manipulate `localStorage` directly. On initialisation, `mergeWithDefaults()` fills any missing keys so existing users receive new fields without data loss.

*(v1.9's own history — it superseded and retired `schema.md` v1.3, `schema_v1_7_15jun2026.md`, `schema_md.docx`, and the v1.5/v1.8 delta notes — is preserved below in Schema Version History.)*

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
| 1.9 | 30 Jul 2026 | Full ground-truth reconciliation (BUILD-4). Rewritten directly against live `store.js` v10. Documents all fields actually returned by `getDefaults()`, corrects two errors inherited from v1.7 (see below), resolves the `hardBeforeSelections` naming question, resolves `stats` and `exerciseFeedback` dormancy questions, and separates out an appendix of fields used via `store.get`/`store.set` but absent from `getDefaults()`. |
| 1.10 | 03 Aug 2026 | BUILD-4 Appendix A follow-up. All 18 previously-unclassified fields individually checked (reader + writer each) and folded into their proper sections. 11 confirmed live, 5 dormant (write-only), 2 dead. Two live bugs surfaced: `userTier` has no writer and its one reader always evaluates false, locking Personal-tier session-builder options for paying users; `proposalBias` is written but never read anywhere. Appendix A closed. |
| **1.11** | **04 Aug 2026** | **Home Nav & Conditions Redesign, Phase A.** Two new fields: `conditionReflections` (deliberately separate namespace from `journalEntries`, not subject to Journal Privacy Rule), `conditionFoldInLevel` (fold-in dial setting, `'partial'\|'mostly'\|'all'\|null`). `js/store.js` v11→v12. Also: `userTier` bug (flagged 1.10) confirmed fixed since 03 Aug, no longer open. |
| **1.12** | **04 Aug 2026** | **Pain Input Redesign, same day.** `conditionPainScores` clarified as genuine 0-10 continuous (was 4 discrete values from a button UI) — no field shape change. New canonical `js/data/conditions.js` function `getPainBand(score)` — the one source of truth for pain-severity display bands app-wide, replacing dead code `getPainContext()` (removed, never called anywhere, itself a fourth private duplicate carrying the pre-fix threshold). |
| **1.13** | **04 Aug 2026** | **Severe pain Rest/Adapt choice, same day.** New field `severePainChoices` — active choice record, one per date + exact severe-condition-id set. `js/store.js` v12→v13 (new `recordSeverePainChoice()`). `coach-proposal.js` v17: Severe pain now gates the whole proposal screen behind an explicit Rest/Adapt choice rather than silently deciding; `_checkSeverePain()`/`severePainOverride` (dead weight, computed but never used) removed entirely, genuinely superseded now rather than theoretically unused. |
| **1.14** | **04 Aug 2026** | **Phase D-1 (schema), Conditions Update.** Two new fields: `conditionGoals` (felt-sense condition-specific goal, `'healed'\|'cope'\|'improve'` + optional note, new `store.setConditionGoal()`) and `prescribedExercisesOrigin` (`'professional'\|'self'\|null`, lets `prescribed.js` branch its coach voice correctly). Also documented in the field-reference table: `pendingDoorRoute`, added earlier today (Phase C follow-up) but missed in Schema.md at the time. `js/store.js` v14→v15. |
| **1.15** | **04 Aug 2026** | **Condition programmes, real routes built.** `prescribedExercises` entries can now carry an optional `conditionId` — additive, nullable, existing entries unaffected. New `prescribedExercisesActiveCondition` — single-use context flag, cleared the instant it's read. `js/store.js` v15→v16. New module `js/data/conditionProgrammes.js` (not a schema file, but the reason these fields exist) — real, tested exercise-selection logic for "Coach builds it"/"Coach recommends, you select," built on `affectsAreas`/`rehabPhase`/`contraindications` data that already existed. |
| **1.16** | **04 Aug 2026** | **Cross-condition exercise reuse, not duplication.** `prescribedExercises` entries: `conditionId` (singular) replaced with `conditionIds` (array) — one entry can now genuinely serve more than one condition, so doing the same physical exercise once correctly counts once everywhere, rather than the same exercise appearing as two separate entries with independent completion state and double credits. Backward compatible — old singular-shaped entries read correctly via new `getEntryConditionIds()`, migrate naturally on rebuild, no explicit migration step. `js/data/conditionProgrammes.js` v2→v3. Smoke-tested against real overlapping conditions before shipping. |
| **1.17** | **09 Aug 2026** | **"In Step" (Noticing Hub, Personal tier) + drift catch-up.** New field `inStepProgress` (`unlockedAt`, `scenarioIndex`, `completedCount`, `choiceLog`) — four-movement scenario practice extending the empathy transfer arc, `js/store.js` v17→v18, new `js/data/in-step-scenarios.js` + `js/views/in-step.js`, new route `in-step`. Also documented `exercisePreferences` (`store.js` v17, 04 Aug), missed in Schema.md at the time — same drift pattern as `pendingDoorRoute` in 1.14, caught here rather than left open. |

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


### `capability.legPower` — **DECLARED, `store.js` v30, 12 Aug 2026**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `capability.legPower` | `'full'\|'limited'\|'none'\|null` | `null` | **Not yet asked.** The conditional question (fires when `chairRise !== 'yes'`) is built pending sign-off on its wording |

**C1, third-pass trace.** Read by `capabilityProfile()` and consumed by two filters in `session-builder.js`, but never declared, never written and never asked — so it always fell back to `'full'` and a wheelchair user was served Seated Leg Extension, the exact exercise the v29 note exists to prevent.

**The unknown-value default is now conditional:** `'limited'` when `needsSeated` is true (the person cannot rise from a chair or reach the floor), `'full'` otherwise. Fails safe for the one group at risk and assumes nothing about anyone else. **Do not simplify this back to a flat `'full'`.**

### `exerciseFeedback` — **DECLARED, `store.js` v21, 11 Aug 2026**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `exerciseFeedback` | `array` | `[]` | `{ exerciseId, feedback: 'too-hard'\|'too-easy', at }[]`. Capped 200 |

**Read since `exercises/index.js` v1.3, written by nothing until now** — `applyFeedbackWeighting()` always fell back to `[]`, so that weighting had never once run on real data. Writer: `store.logExerciseFeedback()`, called from `gym-programme.js`'s "Skip this one" (a signal already given, at the point of friction — locked principle P3). Binary, not a rating, matching the reader's contract.

### `absence.returnCapturedAt` — **DECLARED, `store.js` v21, 11 Aug 2026**

Written by `programmeEngine.js:268`, read at `:242`/`:263`, and absent from `getDefaults()` — surviving only via the `...saved` spread. Exactly the migration loss risk PT-10 flagged.

### `liftLog` / `liftLogEnabled` — **NEW, `store.js` v20, 11 Aug 2026**

PT-4. A **memory aid, not analytics** — Graeme's framing: knowing what you set the machine to last week, not tracking progress.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `liftLogEnabled` | `boolean` | **`true`** | **Changed to default-on in `store.js` v28** — "a recording feature that is off by default is one nobody uses". Supersedes the v20 default of `false`. Toggled in Settings > Equipment; `logLift()` no-ops while false. Note P4 is not breached by default-on: the protection lives in how the number is *presented* (no delta, no interpretation), not in whether it is recorded |
| `liftLog` | `object` | `{}` | `{ [exerciseId]: [{ at, weight, unit, reps }] }`. Newest last, capped at 20 per exercise |

**Helpers:** `store.logLift(exerciseId, { weight, unit, reps })` and `store.lastLift(exerciseId)`.

**Governed by locked principle P4** — the app may display load, the coach never interprets it. `lastLift()` returns the entry only and deliberately computes no delta, so there is nothing for a caller to narrate. No arrows, no colour-coding, no "new best". *The asymmetry is the reason: silence on a drop is only credible if there is also silence on a rise.* Do not add comparison logic here without revisiting P4.

**Tier:** recall in session is **free** (that is the coach remembering, and P1 says the coach never withholds what it can see). Analysis, trends and export are **Personal** — not yet built.

### `consent` (nested object) — **NEW, `store.js` v19, 11 Aug 2026**

Legal consent record. Restored after the PT-W1 store audit found it absent: `welcome.js:85-86` was the only writer of the old flat `consentGiven`/`consentAt`, and that route was retired from `router.js` VIEW_NAMES in v7. **Live onboarding captured no consent record at all between the OB-THREAD rebuild and 11 Aug 2026.**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `consent.given` | `boolean` | `false` | Affirmative tick only — **not** implied consent. Written by `thread.js`'s consent gate |
| `consent.at` | `string \| null` | `null` | ISO timestamp of the tick |
| `consent.policyVersion` | `string \| null` | `null` | Which documents were agreed to (`POLICY_VERSION` in `thread.js`). Without this, any policy revision silently invalidates every existing record |
| `consent.ageConfirmed` | `boolean \| null` | `null` | **Reserved and inert.** Age gate is built but switched off via `AGE_GATE_ENABLED` pending the ToS 13+/16+ contradiction (Stream A, A1.11) and Natalie's written advice |

**Deprecated, do not write:** flat `consentGiven` / `consentAt`. Superseded by the nested object above. Nesting was chosen deliberately for the coming Supabase migration, where PT-10 flagged undeclared flat fields as a real loss risk.

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
| `consentGiven` | `boolean` | — *(undocumented, resolved 03 Aug)* | Written once, in `welcome.js`, at onboarding. **No reader anywhere** — recorded but never checked/enforced by any gate. Likely intended as an audit-trail record rather than a live gate, but worth confirming that's the actual intent given ToS/consent has legal weight — flagged for Graeme's awareness, not fixed here. |
| `consentAt` | `string\|null` (ISO) | — *(undocumented, resolved 03 Aug)* | Timestamp paired with `consentGiven`, same file, same status — write-only, no reader. |

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
| `tier` | `string` | `'free'` | `free\|personal\|athlete`. Athlete unlocked within Personal, no extra charge. **This is the one genuine tier field** — see `userTier` bug note at the top of this document. Never write or read `userTier`; it does not exist in `getDefaults()` and has no writer anywhere. |
| `fitnessLevel` | `string\|null` | `null` | Read by `workoutGenerator.js`'s `getUserProfile()`. Written by Settings. |
| `weight` | `number\|null` | `null` | |
| `weightUnit` | `'kg'\|'lbs'` | `'kg'` | |
| `targetWeight` | `number\|null` | `null` | |
| `targetDate` | `string\|null` | `null` | ISO date |
| `targetDescription` | `string` | `''` | Plain text goal note |
| `goals` | `string[]` | `[]` | Goal IDs from `goals.js`. Drives exercise filter engine and `workoutGenerator.js`'s goal-aware bias. |
| `conditions` | `string[]` | `[]` | Condition IDs from `conditions.js`. Base IDs only — phase variants derived at runtime. |
| `conditionPainScores` | `object` | `{}` | Keyed by condition ID. Written at check-in submission. **04 Aug 2026:** values are now a genuine 0-10 continuous slider input (Pain Input Redesign) — previously only ever 4 representative discrete values (1/4/6/9) from a button UI. No shape change to the field itself; every consumer already used `>=`/`<` range comparisons, not exact-equality, so this needed no other schema or consumer changes. Band/label classification for display is now centralised in `conditions.js`'s `getPainBand()` — see that file. |
| `conditionReflections` | `array` | `[]` | **New, 04 Aug 2026 (Home Nav Phase A).** `{ conditionId, text, loggedAt }`. Deliberately a separate namespace from `journalEntries` below — **not** subject to the Journal Privacy Rule, coach-readable by design. Decided explicitly to avoid it silently inheriting journal privacy behaviour by accident (see `alongside_blueprint_home-navigation-conditions_04aug2026_v1.md` §3). |
| `conditionFoldInLevel` | `string\|null` | `null` | **New, 04 Aug 2026 (Home Nav Phase A).** `'partial'\|'mostly'\|'all'\|null`. Fold-in dial setting for the condition programme — whether/how much its exercises are woven into Cardio/Core/Strength sessions vs staying static-only in Mobility & Conditioning. `null` = static-only. |
| `conditionGoals` | `object` | `{}` | **New, 04 Aug 2026 (Phase D-1).** Keyed by condition ID: `{ goalType: 'healed'\|'cope'\|'improve', note, setAt }`. Felt-sense, not numeric — deliberately not reusing `strategicGoal` (single-value, general-purpose, already used for the overall fitness goal). Written by `store.setConditionGoal()`. Offered alongside `activeProgramme.milestones`, not replacing it — see `alongside_blueprint_phaseD_04aug2026_v2.md` §2, decision D-1. |
| `severePainChoices` | `array` | `[]` | **New, 04 Aug 2026.** `{ date, conditionIds (sorted), choice: 'rest'\|'adapt', chosenAt }`. Written by `store.recordSeverePainChoice()`, read by `coach-proposal.js` to gate whether the Severe-pain Rest/Adapt prompt shows again today. One record per date + exact severe-condition-id set — an active choice log, not a single latest-preference value. |
| `equipment` | `string[]` | `[]` | Equipment IDs from `equipment.js`. **Derived, not primary input** — see below. |
| `homeEquipment` | `string[]` | `[]` *(undocumented in `getDefaults()`)* | Live. Scope-specific onboarding input, written/read entirely within `equipment.js`. |
| `gymEquipment` | `string[]` | `[]` *(undocumented in `getDefaults()`)* | Live. Scope-specific onboarding input, written/read entirely within `equipment.js`. |
| `prescribedExercises` | `array` | `[]` | Entries can carry `conditionIds` (**array, updated 04 Aug 2026** — replaces the earlier singular `conditionId`) — scopes a coach-built/coach-recommended/self-built exercise to every condition it genuinely belongs to, not just one. One entry can now serve more than one condition (real exercise reuse, not duplication — see `js/data/conditionProgrammes.js` v3) when the same exercise is relevant to both. Additive, nullable; entries added before this existed, or added without a condition context, stay untagged and keep appearing unfiltered in `prescribed.js`. Old singular-`conditionId` entries still read correctly via `getEntryConditionIds()` — no migration step, rebuilding a programme naturally migrates them. Written by `commitProgramme()` for the two coach routes, or by `prescribed.js` itself (reading `prescribedExercisesActiveCondition`, below) for the manual "Build my own" route. |
| `prescribedExercisesOrigin` | `string\|null` | `null` | **New, 04 Aug 2026 (Phase D-2).** `'professional'\|'self'\|null`. Set once when `prescribedExercises` first goes empty → non-empty. Lets `prescribed.js`'s `buildCoachLine()` branch its two origin-referencing lines correctly when reached via Conditions Update's self-build route rather than a genuine physio/GP prescription — see `alongside_blueprint_phaseD_04aug2026_v2.md` §2, decision D-2. |
| `prescribedExercisesActiveCondition` | `string\|null` | `null` | **New, 04 Aug 2026.** Single-use context flag, not sticky — set by `conditions-update.js`'s "Build my own" right before navigating to `prescribed.js`, read and cleared immediately by that file so a later, unrelated visit can never be silently tagged with a stale condition. |
| `pendingDoorRoute` | `string\|null` | `null` | **New, 04 Aug 2026 (Phase C follow-up).** Route name to continue to once check-in/check-in-mini completes. Set by `today.js` when a session-generating Home door (Cardio/Core/Strength, Unsure? Coach decides) is tapped; read and cleared by `checkin.js`/`checkin-mini.js` on completion. |

**Resolved 03 Aug (was flagged as a possible naming overlap):** `homeEquipment` and `gymEquipment` are not duplicates of `equipment` — they're the two scope-specific inputs `equipment.js` collects during onboarding, which are then merged (`Array.from(new Set([...gym, ...home]))`) into the single combined `equipment` array that the rest of the app (`session-builder-ui.js` etc.) actually reads. All three are genuinely live; `equipment` is simply derived, not primary.

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
| `gymProgrammeWeek` | `number` | `1` | **Dormant, resolved 03 Aug.** Read once, in `reflect.js`, only as a rotation seed for picking a wellbeing-invitation line — not a real week number. **No writer anywhere**, so it always falls back to the default `1`. The genuine, actively-tracked programme week is `activeProgramme.currentWeek` (Section 3), maintained by `programmeEngine.js`. Not a naming clash — two real, distinct fields — but `gymProgrammeWeek` is dead weight, cosmetic-only, and never varies. Cleanup candidate, not fixed here. |
| `lastMilestone` | `string\|null` | `null` *(undocumented in `getDefaults()`)* | **Resolved 03 Aug.** Live — a single-value flag set by `workout.js` on milestone achievement, read and cleared by `workout-complete.js` to show the completion-screen milestone card. Confirmed genuinely distinct from `activeProgramme.milestones` (array of programme-phase milestones reached, Section 3) and `checkin.lastMilestoneNoticed` (Section 6, tracks which streak/week milestone the coach has already surfaced in an opening line) — three separate mechanisms, no overlap. |

---

## 5. Activity & Session Tracking

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `activityLog` | `array` | `[]` | Each entry: `{ id, date, type, durationMins, moodAfter, isEvent, eventName, completedAt, ... }`. Single write path since v10: `store.logActivity()`, with dedupe guard against same-type double-writes within 2 minutes. |
| `currentActivityEntry` | `null` | `null` | **Under active investigation** — separate blueprint (`alongside_blueprint_coresession-integrity_30jul2026_v1.md`) is checking whether Core Session ever populates this field upstream. Out of scope for BUILD-4; do not resolve here. |
| `generatedSession` (nested) | `object` | `{ session: null, builtAt: null, inputs: {} }` | The real "today's workout" mechanism — this is what replaced the old `todaysWorkouts`/`workoutsGeneratedAt` pattern (see corrections above). |
| `totalCredits` | `number` | `0` *(undocumented)* | **Resolved 03 Aug — live, 21 refs.** Running lifetime total, incremented at completion by every session-type view (walk/run/yoga/swim/core/cycle/gym/quiet/breathing/prescribed). Read by `workout-complete.js` for the completion screen. Confirmed genuinely distinct from `community.credits` (Section 18) — that's the separate Impact Credits mechanism (1–2 awarded per session depending on tier, via `awardCommunityCredit()`). Incidental finding: `community.credits` is written but has **no reader anywhere** — nothing displays it. Logged, not fixed. |
| `lastWorkoutName` | `string\|null` | `null` *(undocumented)* | **Resolved 03 Aug — live, 12 refs.** Paired with `lastWorkoutCredits`; written by every session-completion view, read by `workout-complete.js`, cleared on exit. |
| `lastWorkoutCredits` | `number` | `0` *(undocumented)* | **Resolved 03 Aug — live, 12 refs.** See `lastWorkoutName` above; written/read/cleared together at the same call sites. |
| `workoutProgress` | `array` | `[]` *(undocumented)* | **Resolved 03 Aug — live.** `workout.js`'s own in-progress per-exercise completion tracker, entirely self-contained (get/set/clear all within that file). Confirmed genuinely distinct from `prescribedSessionProgress` below, not a duplicate. |
| `prescribedSessionProgress` | `array` | `[]` *(undocumented)* | **Resolved 03 Aug — live.** Same pattern as `workoutProgress`, scoped entirely within `prescribed-session.js`. |
| `workoutHistory` | `array` | `[]` *(undocumented)* | **Resolved 03 Aug — live but write-only.** Appended by `completeWorkout()` in `workout.js` on every gym-type workout completion (`{ workoutId, name, focus, completedAt, exercisesCompleted, totalExercises, creditsEarned }`) — a genuine fourth history mechanism, distinct from `activityLog`, `progressLog`, and `activeProgramme.milestones`. **No reader anywhere confirmed** — nothing in Settings, Progress, or any history view displays it. Data is being collected with no consumer. Logged, not fixed. |
| `usingGeneratedSession` | `boolean` | — *(undocumented)* | **Resolved 03 Aug — write-only, 1 ref.** Set `true` in `session-builder-ui.js`; no reader anywhere. |

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

`returnVisit`: `boolean|'dismissed'`, undocumented in `getDefaults()`. **Resolved 03 Aug — live, 11 refs.** Three-state flag (`false`/`true`/`"dismissed"`) written by `intention.js` and `checkin-mini.js`, gating whether the return-visit check-in prompt shows again today.

`quietMode`: `string|null`, undocumented in `getDefaults()`. **Resolved 03 Aug — live, 10 refs.** Routing flag, not a check-in field per se — written by `library.js`/`noticing.js` before navigating into `quiet-session.js`, which reads it to select one of three quiet-session sub-modes (including the mindful/journal-mode path from S4-9/10). Cleared on exit/completion.

`todayEnergy`: `number|null`, undocumented in `getDefaults()`. **Resolved 03 Aug — dead.** Read once in `intention.js` as a fallback (`checkin.energy || store.get("todayEnergy") || 5`) but **has no writer anywhere in the codebase** — the read is unreachable in practice, always falling through to the hardcoded `5`. Confirmed superseded by `lastCheckin.energy` (below), which is the field genuinely written by `checkin-mini.js` and read by `gym-programme.js`/`coach-proposal.js`. Naming remnant, safe cleanup candidate, not fixed here.

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
| `proposalBias` | `'lighter'\|'rest'\|null` | — *(undocumented, resolved 03 Aug)* | Written by `coach-reflection.js` (severe-pain → `'rest'`; burnout-risk/consecutive-days/returning → `'lighter'`; else `null`). **See the write-only finding at the top of this document** — nothing downstream reads it. |

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

`exercisePreferences` (`object`, `{}`) — `{ [exerciseId]: { preference: 'avoid'|'less', setAt, source } }`. Binary signal, not a rating (no stars/scores). Added `store.js` v17 (04 Aug), undocumented here until now — catching up the drift. First consumer: `js/data/conditionProgrammes.js` candidate selection.

`inStepProgress` (nested object) — Personal tier "In Step" feature (Noticing Hub), added `store.js` v18 (09 Aug): `unlockedAt` (`object`, `{}` — `{ [movementId]: ISO }`, gates a 3-day anti-binge cooldown between scenarios in the same movement), `scenarioIndex` (`object`, `{}` — `{ [movementId]: int }`, cycles `js/data/in-step-scenarios.js`'s four-scenario pools per movement), `completedCount` (`object`, `{}` — display only), `choiceLog` (`array`, `[]` — `{ movementId, scenarioId, optionId, tag, at }[]`, aggregate research signal only, never read by coach logic or surfaced per-entry to the user). Deliberately not named "territory" — that word is already used, unrelated, by onboarding's `primaryTerritory`/`hardBeforeSelections`.

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

## Appendix A — Closed, 03 Aug 2026

All 18 fields flagged in the 30 Jul v1.9 follow-up list have been individually checked (reader and writer both, per field) and documented in their proper sections above. Summary:

| Field | Resolution | Documented in |
|-------|-----------|----------------|
| `totalCredits` | Live | §5 Activity & Session Tracking |
| `lastWorkoutName` | Live | §5 |
| `lastWorkoutCredits` | Live | §5 |
| `quietMode` | Live | §6 Check-In Engine |
| `lastMilestone` | Live | §4 Gym Programme |
| `prescribedSessionProgress` | Live | §5 |
| `returnVisit` | Live | §6 |
| `homeEquipment` | Live | §2 Profile |
| `workoutProgress` | Live | §5 |
| `gymEquipment` | Live | §2 |
| `morningProgrammeWeek` | Live | Self-contained in `morning-session.js`; confirmed no overlap with `gymProgrammeWeek` |
| `proposalBias` | **Dormant — write-only** | §7 Mindful Prompts & Empathy Transfer |
| `cycleLength` | Dead — always default | §2 (existing v1.9 entry) |
| `workoutHistory` | **Dormant — write-only** | §5 |
| `consentAt` | Dormant — write-only | §1 Onboarding |
| `consentGiven` | Dormant — write-only | §1 |
| `todayEnergy` | **Dead — no writer** | §6 |
| `userTier` | **Dead — no writer, live bug in one reader** | §2, see top-of-document note |
| `usingGeneratedSession` | Dormant — write-only | §5 |

**Net finding:** of 18 fields, 11 are genuinely live, 5 are dormant (written, never read), 2 are dead (`cycleLength` already known; `todayEnergy` newly confirmed), and one of the dead ones (`userTier`) has a live, user-facing consequence via its sole reader. No fields turned out to be pure naming duplicates once checked — every flagged "possible overlap" resolved to genuinely distinct mechanisms.

---

*Build New Habits · Alongside: Move · Data Schema Reference · 03 Aug 2026 v1.10*
