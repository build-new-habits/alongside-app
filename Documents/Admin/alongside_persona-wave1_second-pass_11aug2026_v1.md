# Alongside: Move — Persona Tracing Wave 1, Second Pass
## 11 Aug 2026 v1

Build New Habits | Re-trace of personas 2.12 (Tom) and 2.15 (Priya) against the shipped code, after nine fix sessions. Companion to `alongside_persona-wave1_technical-report_11aug2026_v1.md` (the first pass) and `alongside_wow_blueprint_11aug2026_v1.md` (the plan).

**Method unchanged:** live modules executed under Node with a `localStorage` stub, seeded with the same backdated three-week persona state as the first pass, run against a **fresh clone of the live remote** rather than the working copy.

**Standing caveat, unchanged:** this can tell you precisely what the code produces. It cannot tell you how anything looks or feels on a screen. Nothing here is on-device confirmed.

---

## 1. Headline

Both personas' primary complaints are resolved. **The second pass also found a bug bigger than most of the first pass** — see §4.

Tom's day one, the moment the whole product is built around:

| | |
|---|---|
| **Before** | *"This is the first real one." / "No history yet — just you, now."* |
| **Now** | *"Do you remember telling me there's a longer history here than any of the rest of it?"* / *"None of that needs revisiting today. I was wondering how it sits with you, standing here before the first one."* |

`careMode: true`.

---

## 2. Measured delta

Every figure produced by executing the shipped code, not asserted.

### Tom — 2.12, blank slate, Move (free)

| | First pass | Second pass |
|---|---|---|
| Day-one opening | generic fallback | `the-history`, careMode |
| Coach reads him as | `moderate` | **`sedentary`** |
| Exercise pool | 330 | 254 |
| **Exercises above his ceiling** | **76** | **0** |
| Session Builder pool (see §4) | unfiltered 65 | capped at difficulty 1 |
| Progress, three weeks | 22 min, 1 of 4 counted | **87 min, 4 of 4** |
| Progress window (free) | 7 days | **30 days** |
| 90-day view | hidden | visible, locked, taps through |
| Consent record | **none** | tick + timestamp + policy version |

### Priya — 2.15, gym-literate

| | First pass | Second pass |
|---|---|---|
| Coach reads her as | `moderate` | **`active`** |
| Exercise pool | 350 | 359 |
| **Hardest tier available** | **0** | **8** |
| Taps "Lower body" (free) | nothing happens | routes to `/upgrade`, focusable, announced |
| Knows last week's load | nowhere in the app | **`Last: 60 kg × 8`** |
| Tier for that recall | — | **free** (P1) |

### Confirmed unchanged

Same-day return still correct in all three scenarios. Warmup safety floor intact for both personas across all 7 session types × 3 presets. `generic` still reachable for someone who skipped the age question.

---

## 3. What Priya still doesn't have

Load recall is live. **Analysis is not** — no trend view, no load-over-time, no export of lift data. That was the agreed Personal-tier half of PT-4 and it isn't built.

So her verdict improves but doesn't complete: she can stop using her Notes app at the machine, which was the actual stated need. She still cannot see load move over a month, which was the stated desire. Worth being honest that these are different things and only one is done.

---

## 4. 🔴 NEW — PT-11: a fourth exercise pool, never filtered on fitness

**Found by the trace, not by reading code.** One anomalous line in the output — `energyRequired 0` on Tom's built session — led here.

`js/session-builder.js` carries its own `EXERCISE_POOL` of **65 exercises**, entirely separate from the 461-exercise database. `_filterCandidates()` filtered on section, category, equipment and acute contraindications — and **not on fitness at all**.

**Consequence:** the WOW-2 fix reached `workoutGenerator.js` (coach-proposal sessions) but **not the "Cardio, Core & Strength" Home door**, which routes here. A sedentary beginner and a gym-literate lifter were handed the identical pool. The fix looked complete and covered roughly half the surface.

`difficultyLevel` (1–3) was already written on all 65 exercises and **read nowhere** — the same pattern again.

**Fixed** (`session-builder.js` v3→v4): ceiling applied in `_filterCandidates()` using the existing field. `sedentary: 1, light/returning/moderate: 2, active/very-active: 3`. Warmup and cooldown exempt so the warmup safety floor cannot be starved.

**Verified:** Tom capped at difficulty 1 with an intact 8-exercise session; Priya reaches 3; all 21 type/preset combinations still build for the most constrained user.

**Not fixed, logged:** merging the four parallel pools (main database, `session-builder.js`'s 65, `yoga-session.js`'s private pose pool, and the historical `core-session.js` one already consolidated in v112). That is real architecture, not a fix session.

---

## 5. 🔴 PT-12 — the pattern itself, closed

Five confirmed instances made this the codebase's characteristic failure mode rather than a series of one-offs: **content and logic written against a data shape that was never wired up.**

| Instance | Resolution |
|---|---|
| `checkin-openings.js` territory vocabulary | Fixed, PT-1 |
| `fitnessLevel` | Fixed, WOW-2 |
| `difficultyLevel` | Fixed, PT-11 |
| `exerciseFeedback` | **Fixed, PT-12** |
| `journalEntryType` | **Fixed, PT-12** |
| `checkin.energy` | **Fixed, PT-12** |
| `todayEnergy` | **Fixed, PT-12** |
| `absence.returnCapturedAt` | **Declared, PT-12** |

**`exerciseFeedback`** was read by `applyFeedbackWeighting()` (`exercises/index.js:219`) from v1.3 onward with nothing writing it — the weighting had never once run on real data. New `store.logExerciseFeedback()`, wired to `gym-programme.js`'s existing **"Skip this one"**: a signal the person is already giving, at the point of friction, with no new UI and nothing said back to them (P3). Verified the reader now receives data and deprioritises correctly.

**`journalEntryType`** was written by three call sites and read by none since the v3 privacy rewrite; entries saved fine but always landed on the generic prompt. `journal-entry.js` v4 reads it and clears it after. **The Journal Privacy Rule is untouched — this changes the prompt only.**

**`checkin.energy`** was never written anywhere. `morning-session.js` read it in **three** places, so its energy input silently defaulted to 5 and `energyBefore` was `null` on every entry ever logged. The third site was found by a failing assertion, not by reading — the first grep missed it because it used a different variable name.

---

## 6. Verification notes worth keeping

Across nine sessions today, **the first verification run was wrong and the code was correct five separate times**: Crescent Lunge changing an expected pool size, an override test comparing two personas with different equipment, regex length caps too short for multi-line templates, a comment matching its own prohibition, and a blank-slate assertion made obsolete by an intended change.

The discipline that mattered was checking the source before accepting the failure. **Two real bugs were caught by assertions that would have shipped otherwise** — `core-session.js`'s second `durationMins: null` on the partial-exit path, and `morning-session.js`'s third `checkin.energy` site.

---

## 7. Still open

| | |
|---|---|
| **On-device confirmation** | Nothing shipped today has been seen to run. Consent gate has never rendered. `gym-programme.js` still the oldest untested item |
| **PT-4 analysis half** | Load trends / export — the Personal-tier case for Priya |
| **WOW-5** periodic re-ask | Spec needed. Carries the safety edge: condition filtering only runs on conditions the app knows about, and nothing ever re-asks |
| **WOW-7** helper layer | Post-beta by design |
| **BETA-1/2** | Policy pages don't exist; `POLICY_VERSION` pinned to unpublished drafts |
| **Pool merge** | Four parallel exercise pools. Architecture, not a fix |
| **PT-5, PT-6, PT-8, PT-10** | Logged, lower priority |

---

## 8. Recommendation

**Stop building and run the device pass.** Twenty-two files have changed today across eleven sessions, none confirmed on a real screen. The next genuine risk is not a missing feature — it is that something shipped today doesn't render, and the longer the queue grows the harder it is to attribute.

Wave 2 (persona 2.5, post-cardiac) should wait until after that pass.

---

*Build New Habits · Alongside: Move · Persona Tracing Wave 1, Second Pass · 11 Aug 2026 v1*
