# Alongside: Move — Home Navigation & Conditions Redesign — Blueprint
## 04 Aug 2026 v1

Build New Habits | Turns `alongside_spec_home-navigation-conditions_04aug2026_v2.md` into a scoped, touch-once file list, in build-discipline order. No code written this session — this is the blueprint. Ground-truthed against live code (04 Aug 2026), not assumed.

---

## 0. Decisions resolved this session

Five more decisions, on top of v2's five, closing every remaining open item before a build session can start:

1. **Coach-proposal.js's fate.** Not Graeme's call this session (asked, not answered) — Claude's judgement call, stated here for sign-off rather than guessed at silently. The file is **not retired**. It's reduced: `DOOR_COPY`, `renderDoorFront()`, `renderBypassDoor()` and the three-doors UI are removed. What stays — `buildProposal()`'s recommendation logic, the re-entry banner (`renderReturnDoor()`), the missed-session offer, the condition note (`buildConditionNote()`) — becomes the destination screen for Home's "Unsure? Coach decides" door only. Reasoning: that logic works and has nothing to do with the doors themselves; throwing it away to fully retire the screen would be pure loss for no gain. If Graeme disagrees, this is a small, isolated change to reverse before build starts.
2. **"Your programme" (activeProgramme/weekly-plan) placement.** Not a seventh door. It's the "Future, explicitly post-launch: a 'Build it' custom programme option" already reserved in spec v2 §3.1, inside the Cardio, Core & Strength door. Graeme's fuller vision for this (coach-built / coach-recommends-and-user-selects / user-builds-from-scratch, mirroring the Conditions Update three-tier model, 6–12 week span, gradual autonomy) is real and good — and explicitly **not built this session**. Logged as NEW-1 below.
3. **Reps/sets/weights authority — delegated to Claude, decided here for consistency across both the Conditions programme and the future general Programme Curation system (NEW-1), so it's one rule, not two.** When a user builds a programme entirely from scratch (full autonomy tier): the user enters reps/sets/weight themselves. When the coach recommends and the user selects from a filtered set (middle tier): the coach pre-fills reps/sets/weight as defaults sourced from the exercise's own data, editable by the user. Rationale: matches the "gradually more autonomy" framing directly — full autonomy means full authorship, assisted autonomy means a sensible starting point the user can override.
4. **Severity threshold fix — widened, confirmed by Graeme.** Not a single-constant change in `core-session.js` as v2 assumed. The real canonical source is `js/data/conditions.js`'s `getActiveConditionIds()` (and `getZoneStatus()`), which `workoutGenerator.js` also depends on for every session it generates — not just Core Sessions. Fixing only `core-session.js` would have created a *new* mismatch instead of closing the real one. Graeme confirmed the wider, correct fix: subacute threshold moves from `pain >= 4` to `pain >= 6` **in `conditions.js`**, the single source of truth for the whole app.
5. **Exercise pool consolidation — de-risked by a direct finding.** Every exercise in `core-session.js`'s private `EXERCISE_POOLS` already exists in the shared database (`js/data/exercises/strength.js`, `rehabilitation.js`) under identical IDs (`plank`, `side-plank-modified`, `pallof-press`, `mcgill-curl-up`, `ab-wheel-rollout`, `isometric-hollow-hold`, etc.) — it's not a second content set, it's a stale fork of the first one. See Section 2 for the consolidation approach this enables.

---

## 1. Grounding findings (04 Aug 2026 code trace)

**`core-session.js`'s private pool, confirmed and scoped.** `EXERCISE_POOLS` (line 125) duplicates shared-database exercises under a different field shape: `{ sets, reps, holdSeconds, rest, cues[], description, why }` vs the shared database's `{ instructions[], coaching, duration, energyRequired, difficultyLevel, credits, ... }`. The content isn't missing from the shared side — `plank`'s shared record already carries an equivalent `why` and `coaching` field, just shaped differently (single string vs array, `duration` vs `holdSeconds`/`sets`/`rest`). Two consolidation routes exist: (a) rewrite `core-session.js`'s renderer to consume the shared shape, or (b) add the small number of missing fields (`cues`, `sets`, `reps`, `holdSeconds`, `rest` where absent) to the ~24 specific shared-database records `core-session.js` actually uses, and point it at the shared array. **Recommending (b)** — far less invasive, keeps a working renderer, and the shared records already have most of what's needed. Also found, not fixed: shared-database exercises carry a `credits` field (Impact Credits) that `core-session.js`'s private records never had — worth checking whether Core Sessions have been under-crediting completions. Logged as a finding for the build session, not solved here.

**Selection logic, confirmed weak as the spec described.** `buildSession()`'s `safe.slice(0, targetCount)` — first N items of a filtered array, no shuffle, no variety logic, no search. Once pointed at the shared pool, this should pick up the same duration-aware/variety-aware selection pattern `workoutGenerator.js` already has, rather than being fixed in isolation.

**`activeProgramme` confirmed as a real, separate, already-working system** (`weekly-plan.js`, `gym-programme.js`, `programmeEngine.js`) — distinct from Conditions entirely, which is why "Your programme" needed its own placement decision (Section 0.2) rather than folding into the Conditions Update work.

**`prescribedExercises` confirmed as the correct existing store field** for the "user builds their own" condition-programme route (spec v2 §4.4, point 3) — `prescribed.js`/`prescribed-session.js` already read it; no new field needed for that route, only for the two additions below.

**No existing schema field for the fold-in dial or the free-text reflection field** — both are genuinely new (Section 3).

---

## 2. Explicitly out of scope this session — logged as new master-schedule items

Not silently bundled in. Both are real, both are good ideas, neither is needed to unblock this session's work.

**NEW-1 — General Programme Curation system.** Graeme's fuller vision: a non-condition-specific version of the same three-tier model (coach builds it / coach recommends, user selects / user builds their own from scratch), spanning a 6–12 week programme like `activeProgramme` already does, with a gradually-increasing autonomy gradient (his example: his daughter would build her own entirely; he might want coach-assisted recommendations). Lives inside the Cardio, Core & Strength door's reserved "Build it" slot (spec v2 §3.1). Reps/sets/weights authority rule already decided above (Section 0.3) so it doesn't need re-deciding when this gets scoped. Not yet a blueprint — needs its own session.

**NEW-2 — Coach fitness-level recalibration engine.** Graeme's question: can the coach notice, across all programme tiers, if a user's starting fitness self-assessment was too optimistic or too pessimistic, and adjust? Genuinely open — needs a dedicated design conversation on what data it would actually draw on, not decided here. Real candidate signals, found while grounding this session (not wired together, not a proposal): `exerciseFeedback` — a **dormant** field, never written by any UI, but `applyFeedbackWeighting()` already exists in the shared exercise index and is built to consume it the moment something does; completion/skip rates against prescribed reps/sets; `conditionPainScores` trend over time; `fitnessLevel` (flagged elsewhere on the master schedule as read but not consistently applied). Worth its own session once NEW-1 exists to recalibrate *against*.

---

## 3. Schema changes (schema-first, per standing rule)

New fields, both genuinely new — no existing field extended or renamed:

| Field | Type | Default | Notes |
|---|---|---|---|
| `conditionReflections` | `array` | `[]` | New, distinct from Journal (spec v2 §4.2). Not subject to the Journal Privacy Rule — coach-readable by design. Entries: `{ conditionId, text, loggedAt }`. |
| `conditionFoldInLevel` | `string \| null` | `null` | `'partial' \| 'mostly' \| 'all' \| null`. Per-condition-programme setting (Section 4). `null` = static-only, not folded into Cardio/Core/Strength. |

`js/store.js` and `Documents/Live State/Schema.md` are both updated in the same pass, before any view code that reads these fields — standing rule, not new.

`conditions.js` threshold change (Section 0.4) is a logic fix, not a schema change — no new field, existing `conditionPainScores` unchanged.

---

## 4. Fold-in dial — the actual algorithm (spec v2 left this as adjectives; this is the resolution)

Operates on exercise count against whatever `workoutGenerator.js`'s existing duration-aware fill loop has already sized the session at (`MAIN_FILL_CEILING`, confirmed live at 6).

```
applyConditionFoldIn(sessionSlots, conditionExercises, level):
  switch level:
    'partial':
      insert 1 conditionExercises[0] into warmup slot
    'mostly':
      maxCount = floor(sessionSlots.total / 2)
      fill warmup slot first, then early-main-block slots,
      from conditionExercises, up to maxCount
    'all':
      fill session slots from conditionExercises first, in slot order,
      up to sessionSlots.total
      if conditionExercises exhausted before slots are full,
      top up remaining slots from the general pool as normal
    null:
      no fold-in — Conditions Update programme stays static-only,
      reachable only via Mobility & Conditioning door
```

Hooks onto `selectExercises()` in `workoutGenerator.js` as a pre-selection step when `conditionFoldInLevel` is not `null`, ahead of the existing general-pool fill.

---

## 5. File list — touch-once, phased

Twelve files is too large for one sitting under the touch-once/on-device-confirmation discipline this project runs on — every prior session in this schedule has been 1–4 files. Splitting into four phases, each independently buildable and testable, each still touch-once within itself. No file appears in more than one phase.

| Phase | Files | What | Depends on |
|---|---|---|---|
| **A — Schema + shared-logic fix** | `js/store.js`, `Documents/Live State/Schema.md`, `js/data/conditions.js` | New fields (Section 3); threshold fix (Section 0.4) | None — do first |
| **B — Core Session pool consolidation** | `js/views/core-session.js`, `js/data/exercises/strength.js`, `js/data/exercises/rehabilitation.js` | Remove private `EXERCISE_POOLS`; add missing fields to the ~24 shared records it needs; point at shared pool + `getSuitableExercises()`/`filterByConditions()`; fix `.slice()` selection | Phase A (threshold + `conditions.js` already correct before this reads it) |
| **C — Home screen + entry-flow rebuild** | `js/views/today.js`, `js/router.js`, `js/views/coach-proposal.js` | Six-door Home; `coach-proposal.js` reduced per Section 0.1; routing for all six doors | Phase B (Cardio/Core/Strength door needs the consolidated pool live) |
| **D — Conditions Update screen** | `js/views/conditions-update.js` (new), `js/views/settings.js`, `js/data/workoutGenerator.js` | New dedicated screen (Section 6); Settings shortcut; fold-in dial wired into the generator (Section 4) | Phase A (fields must exist); can run parallel to Phase C if wanted |
| **Last, every phase that ships** | `sw.js` | Cache bump + changelog entry, once per phase deployed | — |

`prescribed.js`/`prescribed-session.js` — **no code change**, confirmed already correct (Section 1); Phase D's Conditions Update screen just adds a new caller into the existing, working flow.

---

## 6. Conditions Update screen — build contents (Phase D)

New file `js/views/conditions-update.js`. Contents, per spec v2 Section 4:

- Entry: reachable from Home Door 4 directly, and as a shortcut from `settings.js`'s existing Conditions panel (same destination, not a separate UI — settings.js's `renderConditionsPanel()` "Edit conditions" action re-points here instead of `onboarding/conditions`)
- Severity: reuses `checkin.js`'s existing Mild/Moderate/Severe picker pattern, writing to the existing `conditionPainScores`
- Free-text reflection: writes to new `conditionReflections` (Section 3) — never Journal
- Goals vs coach milestones: both offered every visit, no default (spec v2 §4.3) — reads `strategicGoal` and `activeProgramme.milestones`, both already live fields
- Three programme-build routes: coach builds it (new flow) / coach recommends, user selects (new flow) / user builds their own (routes into existing `prescribed.js`, unchanged)
- Placement: Mobility & Conditioning door (static) and/or fold-in into Cardio/Core/Strength via `conditionFoldInLevel` (Section 4)

---

## 7. Session Start Checklist — for whoever runs Phase A (first)

- [ ] Search project knowledge for `alongside_master_schedule`, confirm v107 (this blueprint's version) is current.
- [ ] Confirm live `store.js` is v11 before treating it as current — reconcile if not.
- [ ] Confirm live `conditions.js` and `core-session.js` versions match what's cited here (no dates changed since 04 Aug 2026 grounding).
- [ ] This phase only: `js/store.js`, `Documents/Live State/Schema.md`, `js/data/conditions.js`. No other files.
- [ ] Every file produced carries a `DD Mon YYYY vN` header.
- [ ] `sw.js` last, cache bump, one-line changelog entry.
- [ ] On-device confirmation before Phase B starts — the threshold change affects every user with logged conditions, app-wide.

---

## 8. What must not be repeated (per spec v2 §7, carried forward)

- A second, disconnected exercise pool — Phase B closes the one that exists; nothing in Phases C/D introduces a new one.
- Asking for the same input twice — Phase C's router work is the forcing function for the already-logged time/location double-ask bug; confirm it's actually fixed, not just newly not-triggered.
- A free-text field quietly inheriting Journal's privacy behaviour — `conditionReflections` is named and typed distinctly from any journal field, by design (Section 3).

---

## 9. Status

Fully scoped. Zero code written. Ready for Phase A to be run as its own session — recommend not treating this as one continuous four-phase sitting, consistent with how every other multi-file body of work on this schedule has actually run (BUILD-3 through BUILD-5, gym-programme, wake-lock-resume all shipped as separate, individually-confirmed sessions).

---

*Build New Habits · Alongside: Move · Session Blueprint · 04 Aug 2026 v1*
