# SWAP-0 — Cardio machine swap
## 26 Aug 2026 v2

*v2 — corrected during the build: `swapLog` removed after `verify-write1`
failed it. See §6a.*

Build New Habits · Alongside: Move · Session Blueprint

Supersedes nothing. Booked against the open, previously-unbooked row
*"Product — Full skip/dislike spec, in-session flow"* (🆕 New, 04 Aug).

---

## 1. Where this came from

Graeme, 26 Aug, after a session in a smaller-than-usual gym:

> *"There was equipment I couldn't get on because it was too busy. The app
> said treadmill but I had to use the cross trainer. There were machines I
> had to use instead of others the coach suggested. Can we add a 'swap'
> button to choose something else in that range?"*

This is the **"Not available right now"** branch of
`alongside_exercise_skip_dislike_spec_16may2026_v1.docx` — situational,
temporary, and explicitly **not** a preference the coach should learn.

---

## 2. The one change to the approved spec

The 16 May spec has the **coach** pick the substitute — *"No problem, I'll
find an alternative."* SWAP-0 has the **person** pick from a list.

This is the right way round and it is not a small distinction:

- Which machine is free is **the person's information, not the coach's**.
  The coach cannot see the gym floor. Picking for them would be the coach
  interpreting a fact it does not hold — Locked Principle **P4**.
- **Self-direction is free**, as an accessibility feature. Equipment being
  occupied is an access barrier, not a premium inconvenience. SWAP-0 is
  **not tier-gated.**

Recorded here rather than made quietly, because it edits an approved spec.

---

## 3. Why this stops at cardio machines — with the evidence

The instinct was a general swap on `movementPattern`. Run against the live
database, that fails, and it fails in two separate ways.

**Fault 1 — `locomotion` is a bucket, not a range.**
Treadmill Incline Walk is `locomotion` / `cardio` / d2. Matching on
`movementPattern` + `category` + owned equipment + a duration window
returns **43 candidates**, including *C25K Week 7*, *Marathon Pace Run* and
*5K Time Trial*. `locomotion` covers **133 of 551** entries.

**Fault 2 — `movementPattern` does not separate strength from plyometric.**
This one is a safety problem, not an ergonomics one.

| Asked for | Same rule returns |
|---|---|
| **Leg Press** (squat / strength / d3) | Jump Squat, Box Jump, **Depth Jump**, Tuck Jump, Skater Jumps |
| **Chest Press Machine** (push / strength / d2) | **Tricep Rope Pushdown** (different muscle entirely) |

Offering Depth Jump to somebody who wanted a leg press is wrong for anyone
and dangerous for this audience. **That gap is SWAP-1's whole job.**

**Where the rule does hold: cardio machines.** There are only **24
machine-equipped exercises in the entire database**, and the cardio ones
cluster cleanly and correctly:

| Machine | Entries |
|---|---|
| `treadmill` | 3 |
| `rowing-machine` | 4 |
| `elliptical` (cross trainer) | 2 |
| `exercise-bike` | 2 |
| `stair-climber` | 2 |

All `locomotion` / `cardio`, differing only by difficulty. They are
genuinely interchangeable — which is exactly why gyms put them in a row.

Verified output for Graeme's actual case, Treadmill Incline Walk (d2),
nearest-difficulty first:

```
Rowing Machine — Steady State   d2
Easy Row — 20 Minutes           d2
Rowing Intervals — 500m         d3
Assault Bike — Interval Session d3
Stationary Bike — Easy Spin     d1
Cross Trainer — Easy Pace       d1
Rowing Machine — Easy Technique d1
Cross Trainer Intervals         d3
```

Eight real options. That is a usable list and it is the problem he hit.

---

## 4. 🔴 Live fault found while scoping — logged, NOT fixed here

`gym-programme.js:929`:

```js
if (exercise?.id) store.logExerciseFeedback(exercise.id, 'too-hard');
```

**Every skip is recorded as "too hard."** When Graeme skipped the busy
treadmill this morning, the app learned that Treadmill Incline Walk is
beyond him and deprioritised it (`programmeScore` 0.5). Silently, with
nothing said to him.

This is precisely the fault the 16 May spec exists to prevent: *"The system
should not learn a permanent preference from it."* Live since PT-12,
11 Aug. Never logged.

**Deliberately out of scope for SWAP-0.** Redesigning Skip is the separate
in-session skip/dislike job, and folding it into a build approved for
something else is how scope goes wrong. Booked as its own row; Graeme's
decision.

**What SWAP-0 does do about it:** a swap is a *distinct path*. It writes
**nothing** to `exerciseFeedback`. Reversal-tested — see §7.

---

## 5. The rule, exactly

`getSwapCandidates(exercise, userEquipment)` returns `[]` unless the
exercise is a cardio machine. Otherwise:

1. Not the same exercise
2. **Is** a cardio machine
3. Same `category` **and** same `movementPattern`
4. Shares **no** equipment tag with the busy one — swapping a treadmill for
   another treadmill is not a swap
5. Sorted by **nearest difficulty**, then name, for a stable order

Then equipment: candidates matching the person's kit, **and if that leaves
none, all of them**.

The fallback is not laziness. The person is standing in the gym telling us
what is in front of them; the onboarding equipment list is older and less
informed than they are. Equipment is already *"a preference in selection,
not only a permission"* (CON-1→9). Hiding the cross trainer because it was
never ticked would be the list overruling the person.

---

## 6. Files — touch-once, in dependency order

**As built. This table was corrected during the session — see §6a.**

| # | File | v | Change |
|---|---|---|---|
| 1 | `js/data/exercises/index.js` | v1.8 → **v1.9** | `CARDIO_MACHINES`, `isCardioMachine()`, `getSwapCandidates()` |
| 2 | `js/views/gym-programme.js` | v6 → **v7** | Swap control + inline chooser + `applySwap()` |
| 3 | `css/components/workout.css` | v7 → **v8** | `.exercise-swap*` |
| 4 | `tools/verify-swap0.mjs` | **new** | Executing gate, 38 checks |
| 5 | `Documents/Admin/alongside_cold_start_blueprint_20aug2026_v1.md` | — | Gate count 88 → 89; cache v405 → v406 (`verify-blueprint` keeps these honest) |
| 6 | `sw.js` | v405 → **v406** | Cache bump, **last** |

`store.js` and `Schema.md` are **NOT touched** — see §6a.

No new shipped file, so no precache list change. `tools/` is build-time only.

---

## 6a. 🔴 The first draft added a store field. It was wrong.

v1 of this build added `swapLog` to `store.js` (v59) and documented it in
`Schema.md` (v1.42), with an argument in both about why it deliberately had
no reader.

**`tools/verify-write1.mjs` failed it, correctly:**

> *no NEW one-ended store field — swapLog — read without a writer, or
> written without a reader. proposalBias looked exactly like this for
> twelve days.*

The argument was wrong because the field was redundant, not because a
reader was missing. **CONT-1 (11 Aug) already logs `exerciseIds` from
`session.exercises` at completion.** `applySwap()` replaces the entry in
that array, so the cross trainer is *already* what gets recorded — because
it is what happened. `swapLog` was a second home for a fact already stored.

That is the exact reasoning that removed `targetWeight` on 22 Aug:
*"a second home for the same fact is precisely what caused TARGET-3."*

`store.js` and `Schema.md` were reverted to v58 / v1.41, untouched. §7 of
this blueprint was rewritten to pin the real contract instead.

**Worth keeping:** the gate caught a design error, not a typo, and it
caught it in a build whose whole argument was about not letting situational
facts leak into permanent ones. The instinct to record something is not the
same as the need for a new place to record it.

---

## 7. Gate — `tools/verify-swap0.mjs`

**Executing, not source-text.** Five green gates in this build have sat on
broken behaviour because they asserted what the source *said*. This one
imports the real registry and calls the real function.

Assertions, each with a reversal test:

1. Non-machine exercise → `[]`
2. Treadmill Incline Walk → ≥ 6 candidates, **all cardio machines**
3. **No candidate carries `treadmill`** (rule 4)
4. Nearest-difficulty ordering holds
5. Strength machines → `[]` (Leg Press must **not** return Depth Jump — the §3 fault, pinned so a later widening cannot reintroduce it silently)
6. Empty equipment → falls back rather than returning `[]`
7. The swap is recorded **by the session** — the swapped-in exercise is what `exerciseIds` would carry, the original is not; `section` preserved; the new entry carries its own guidance. `store` has **no** `logSwap` and **no** `swapLog`. `exerciseFeedback` and `exercisePreferences` both untouched — the §4 guarantee

**Result: 38 checks, all green.** The gate also failed itself once on first
run: the storage key was hand-typed rather than read off `store.STORAGE_KEY`.
A fixture invented rather than sourced tests the assumption, not the code.

---

## 8. On-device test — the only thing that closes this

Code passing is not the test. Required:

1. Build a gym session that contains a cardio machine
2. Confirm **Swap** appears on it and **not** on a bodyweight exercise
3. Tap Swap — confirm the list is machines only, no runs, no C25K
4. Pick the cross trainer — confirm the card becomes it, with its own
   instructions, coaching, watch-outs and timer
5. Finish; confirm the swapped exercise is what gets logged
6. Confirm **no** "too hard" was recorded against the original

Screenshot or console evidence per step. *"Should work"* does not close it.

---

## 9. Not in this build

- **SWAP-1** — the real swap family across all 551 entries. Post-beta.
  A content-design job, not a code job: someone must decide what makes two
  exercises genuinely interchangeable when `movementPattern` cannot.
- **Skip redesign** — §4. Own row, Graeme's call.
- Strength, mobility, yoga, pilates swaps — all SWAP-1.

---

**Deployed:** `alongside-v406`.

*Build New Habits · Alongside: Move · Session Blueprint · 26 Aug 2026 v2*
