# Alongside: Move — Device Test Improvements: Build Plan
## 12 Sep 2026 v1

Build New Habits | How the seven items from the 12 Sep device test get built: order, sessions, gates, and what each one waits on.

Findings and evidence: `alongside_device_test_findings_12sep2026_v1.md`. Schedule rows: master schedule v335. **Nothing in this plan is built yet.**

---

## 1. The shape of it

Seven items, four decisions, and they are not equally ready. Two can be built tomorrow; two are blocked on an answer from Graeme; one is blocked on a diagnosis that has not been done; one is a content project with no code in it at all.

**The order below is by readiness and by harm, not by size.**

| # | Session | Blocked on | Why here |
|---|---|---|---|
| 1 | **TIMER-SETS-1** — the countdown stops lying | Nothing | The only one where the app currently states something untrue |
| 2 | **GYM-REACH-1** — diagnose, do not fix | Nothing | Cheap, and the answer changes what session 3 is |
| 3 | **GYM-REACH-2** — fix reachability | Session 2 | Cannot be scoped before the cause is known |
| 4 | **SEARCH-1a** — the muscle vocabulary | Nothing | Data and a gate. No UI. Must precede the search box |
| 5 | **TIMER-SETS-2** — set-by-set progression | **Decision A** | A real change to the player |
| 6 | **SEARCH-1b** — the search input | Session 4 | Useless without the vocabulary |
| 7 | **CARD-4** — four pages | **Decisions B and C** | Touches the same file as ADAPT-1; see §6 |
| 8 | **GYM-MIX-1** — a gym session shape | **Decision D**, session 3 | Design question, and pointless while machines are unreachable |
| — | **IMAGES-1** — images per exercise | Nothing technical | 560 entries. A content project, not a build session |

---

## 2. Sessions 1 to 4, which can start now

### Session 1 — TIMER-SETS-1. The countdown stops claiming to be a set

**Scope, deliberately narrow.** An exercise with a duration *and* multiple sets shows a countdown labelled "Set 1 of 3" that never advances, then ends the exercise. This session does not build set progression. It stops the label being false, and it shows the person the sets and reps they were never told.

**Proposed behaviour:** where an exercise has both a duration and more than one set, the countdown is labelled for what it is — the exercise, not a set — and the `sets × reps` and rest figures render alongside it rather than in a branch that entry never reaches.

**Files:** `js/views/workout.js` (`renderExerciseTarget`), and the same function in `gym-programme.js`, `core-session.js` and `prescribed-session.js` if they carry their own copy — **confirm at session start, because four copies of one decision is how they stop agreeing.** Then `sw.js`.

**Gate — `verify-timer-sets1`, executing.** Render a real `gym-lat-pulldown` and assert: no "Set 1 of" label on an exercise nothing advances; the sets and reps figures are present; a genuinely single-set timed exercise (a plank) is unchanged. **Control:** prove the fixture is a real library entry with both fields, or the test proves nothing.

**Reversals:** restore the old label; hide the reps figures; apply the new label to a single-set exercise.

**Not in scope:** whether the timer should exist at all on a lifting exercise. That is Decision A.

---

### Session 2 — GYM-REACH-1. Diagnose, and stop there

**Why a session of its own.** The cause is unknown, and a session that diagnoses and fixes in one pass will reach for the first plausible-looking line. Diagnosis first, written down, then a fix scoped to what was found.

**What is already ruled out**, by execution on 12 Sep:

- **Not the category rules.** `matchCategory(EXERCISES, "conditioning", "main")` returns 118 entries including all five machines.
- **Not equipment.** `resolveEquipment()` resolves the gym set, and `exerciseIsAvailable()` returns true for every machine entry.
- **Not difficulty, energy, impact, balance or position.** All five pass those gates; `rowing-machine` is difficulty 2 and still absent.
- **Not session length.** The pool holds 16 at 20, 40 and 60 minutes.
- **Not `sectionRules`.** The cardio type declares none.

**So the drop is between `matchCategory` and the returned pool: 118 candidates become 16.** The remaining suspects are inside `_filterCandidates` after those checks, and the variety or de-duplication logic in `buildCandidatePools`.

**Method:** instrument `_filterCandidates` locally, count survivors after each stage, and name the stage that removes them. Output is a written finding, not a patch.

**Deliverable:** a finding appended to the device-test document, and a scoped blueprint for session 3.

---

### Session 3 — GYM-REACH-2. The fix

Cannot be written until session 2 reports. Two shapes, roughly:

- **If it is a filter fault**, the fix is small and the gate asserts that every machine entry is reachable in a cardio main pool with the machine declared, and absent without it.
- **If it is deliberate** — if something is keeping long single-block work out of multi-slot sessions on purpose — then this is not a bug and it merges into GYM-MIX-1, because a 25-minute treadmill block genuinely does not fit a ten-slot session.

**The gate is the same either way, and it is the valuable part:** a reachability assertion over every equipment-gated entry. *Declared, available, and still never offered* is the shape of this fault, and nothing currently tests for it.

---

### Session 4 — SEARCH-1a. The vocabulary, with no search box

**Why first.** `affectsAreas` has 31 values and no synonyms. Nothing maps "lats" to `upper-back`, "quads" to `quadriceps`, or "thighs" to `quadriceps` + `hamstring`. A search box shipped on top of that returns nothing for the first word a gym-goer types, and one empty result teaches somebody the search does not work.

**Scope:** a synonym map — everyday and technical terms for each of the 31 areas — and a resolver. No UI. Data plus a pure function plus a gate.

**Gate — `verify-search1`.** Every one of the 31 areas has at least one everyday synonym; a list of real gym words ("lats", "quads", "hamstrings", "glutes", "abs", "calves", "traps", "pecs", "delts", "hip flexors") each resolves to at least one area **and to at least one exercise in the library**; no synonym resolves to nothing. **Resolving to an area that has no exercises is the failure this gate exists to catch.**

**Open question for the session:** "traps" and "delts" have no `affectsAreas` value at all. Either they map to the nearest honest area (`upper-back`, `shoulder`) or the search says plainly that it does not know that word. **Saying so is better than a silent near-miss**, and that choice belongs in the blueprint.

---

## 3. Sessions 5 to 8, which wait

### Session 5 — TIMER-SETS-2. Set by set

**Blocked on Decision A: what is the timer for on a lifting exercise?**

Three answers, and each builds something different:

| Answer | What gets built |
|---|---|
| **Rest between sets** | Set one, done; then the countdown runs as rest; then set two. The timer keeps its place and changes meaning |
| **Nothing** | Sets-and-reps exercises lose the clock. Done-per-set advances it. Simpler, and closer to how people lift |
| **Optional** | A rest timer the person starts if they want one. More work, and another control on a screen Graeme has already said is crowded |

**Recommendation: rest between sets.** The `rest` value already exists on these entries (Lat Pulldown carries 60), the person is standing at a machine with nothing to do for that minute, and it removes the clock from the part where a clock is wrong without removing the clock.

Whichever way it goes, the session also fixes the reflection jump: reaching the end of the last set opens NOTE, and the end of set one does not.

---

### Session 6 — SEARCH-1b. The input

Follows session 4. A text input in the swap sheet, searching the synonym map, the exercise names and the area labels, and filtering the groups already there rather than replacing them.

**Accessibility:** a labelled `<input type="search">`, results count announced in a polite live region, keyboard reachable, 44px targets, and **an empty result that says what it searched and offers the groups back** rather than an empty panel.

---

### Session 7 — CARD-4. Four pages

**Blocked on Decisions B and C.**

Graeme's structure: overview / what to watch out for / the exercise with instructions, video and images / reflection.

**The thing to settle before any code.** Today the hazards sit above the instructions on DO, so you pass them on the way to what you want. On their own page they can be swiped past. Graeme's argument is that a long page is skimmed anyway, which is fair — but "skimmed" and "swiped past without opening" are not the same, and the change has to be made knowing which one it is buying.

**Non-negotiable in any reshuffle:** `HURT_AND_ACHE` renders on **every** page (CR-5), the caution line stays pinned, and the sore-area pointer added by ADAPT-1 follows the caution wherever it goes.

**Sequencing note:** this rewrites `exercise-card.js`, which ADAPT-1 has just changed. One session touches that file, not two. If CARD-4 is happening, the image slot should be designed in even if it renders nothing yet — that is one rewrite instead of two.

---

### Session 8 — GYM-MIX-1. A session shape for a gym

**Blocked on Decision D and on session 3.**

Graeme's session was: cross trainer, lat pulldowns, dead bugs, treadmill. Every current type is a fixed recipe of slot categories and none of them has that shape.

| Option | What it means |
|---|---|
| **A new "Gym" session type** | One more recipe: a machine warm-up, machine conditioning, two or three lifts, core, stretch. Smallest change, and it is the session he actually wanted |
| **Let the existing types reach further** | Full body gains a machine block. Fewer types, but every type becomes a compromise |
| **Free choice** | The person picks any exercise for any slot. The biggest change, and it makes the coach's reasoning much weaker |

**Recommendation: a new type.** It fits what exists, it is testable, and the search work (sessions 4 and 6) covers most of what "free choice" was for.

---

### IMAGES-1 — a content project

Zero entries have an image field; all 560 have a video. Two or three images each, ours or properly licensed, each matching the coaching cue. **This is not a build session** — it is sourcing, rights, and a lot of checking. The build side is one optional field and a slot on the card, and it is an afternoon.

**Recommendation:** add the field and the slot inside CARD-4, then let the content arrive in waves, in the same order as the adaptations work — the exercises people meet most, first.

---

## 4. Where this sits against beta

Claude's pre-beta build scope was declared complete on 06 Sep, and since then ADAPT-1, PROPOSAL-3 and SCOPE-1 have all been added to it. That is not free: every session is a deploy, and the schedule's own warning is that a workstream that keeps growing is how dates go.

**Proposed split:**

- **Before beta:** sessions 1, 2 and 4. One is a falsehood on screen, one is a diagnosis, one is data with a gate. All three are small and none changes a shape a tester has already learned.
- **During beta:** sessions 3, 5 and 6, ordered by what testers actually hit.
- **After beta, before soft launch:** session 7 and the start of IMAGES-1.
- **Not dated:** session 8, which is a product decision first.

**If only one thing ships before beta, it is session 1.**

---

## 5. What the whole set needs, once

Two things are worth building once rather than per session:

1. **A reachability gate.** *Declared, available, and never offered* is what GYM-REACH-1 found, and nothing tests for it. Built in session 3, it should cover every equipment-gated entry, not just the machines.
2. **One definition of what an exercise's target is.** `renderExerciseTarget()` decides between a clock and reps, and the same decision may exist in four player files. Sessions 1 and 5 both touch it. **Confirm at the start of session 1 how many copies there are**, and if there are several, that is the first thing to fix.

---

## 6. Decisions needed, with recommendations

| | Decision | Blocks | Recommendation |
|---|---|---|---|
| **A** | What is the timer for on a lifting exercise? | Session 5 | **Rest between sets.** The `rest` value is already there and the person is standing at a machine with a minute to fill |
| **B** | Do the hazards get their own page? | Session 7 | **Yes, with `HURT_AND_ACHE` still on every page.** Your argument holds: a page people scroll past fast is not being read either |
| **C** | Build CARD-4 before there are images? | Session 7 | **Yes, with the slot empty.** One rewrite of `exercise-card.js`, not two |
| **D** | Is "full body in a gym" a new type or a change to the existing ones? | Session 8 | **A new type.** It fits what exists and it is the session you actually wanted |

**A and D are the two that genuinely need you.** B and C can go either way and the recommendation is a starting position, not a conclusion.
