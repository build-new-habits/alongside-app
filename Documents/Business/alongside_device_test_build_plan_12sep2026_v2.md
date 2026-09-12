# Alongside: Move — Device Test Improvements: Build Plan
## 12 Sep 2026 v2

Build New Habits | How the seven items from the 12 Sep device test get built, with Graeme's four decisions taken.

**v2 supersedes v1**, which was written while the decisions were open. What changed: all four are answered, two sessions merge into one, and the timer question turns out to be a data question with a clean answer.

Findings: `alongside_device_test_findings_12sep2026_v1.md`. Schedule rows: master schedule v337. **Nothing in this plan is built yet.**

---

## 1. The decisions, taken 12 Sep 2026

| | Decision | What Graeme said |
|---|---|---|
| **A** | The timer on lifting | **It should not be there.** `duration` exists to let the coach estimate how long a session takes. It was never how long to lift for. The card ignores it; the builder keeps using it |
| **B** | Hazards on their own page | **Yes** |
| **C** | Build the card before images exist | **Yes**, with a placeholder saying images will appear here — fine for beta, not for public launch |
| **D** | "Full body in a gym" | **Yes, a new session type** |

Decision A is the useful one. It is not "make the timer better"; it is that `duration` has two jobs and only one of them belongs on the card. Everything in section 3 follows from that.

---

## 2. Order of work

| # | Session | Blocked on | Before beta? |
|---|---|---|---|
| 1 | **TIMER-1** — the clock belongs to the exercise, not to lifting | Nothing | **Yes** |
| 2 | **GYM-REACH-1** — diagnose, do not fix | Nothing | **Yes** |
| 3 | **SEARCH-1a** — the muscle vocabulary, no UI | Nothing | **Yes** |
| 4 | **GYM-REACH-2** — fix reachability | Session 2 | During beta |
| 5 | **SEARCH-1b** — the search input | Session 3 | During beta |
| 6 | **CARD-4** — four pages, with an image placeholder | Session 1 | Beta → soft launch |
| 7 | **GYM-MIX-1** — the Gym session type | Session 4 | Beta → soft launch |
| — | **IMAGES-1** — the images themselves | Nothing technical | Content, in waves. **Must land before public launch**, since the placeholder says so |

**v1 had eight sessions; this has seven.** TIMER-SETS-1 and TIMER-SETS-2 were a stopgap and a proper fix of the same thing. Decision A makes the proper fix small enough to do in one go, so doing the stopgap first would be two deploys for one outcome.

---

## 3. Session 1 — TIMER-1. The clock belongs to the exercise, not to lifting

### What the data says

Every one of the 560 entries carries a `duration`. That is the planning number, and it stays exactly as it is. What varies is whether the entry is **counted** or **timed**, and `reps` already says which:

| Shape | Count | Example | What the card should show |
|---|---|---|---|
| No `reps` at all | **440** | Most stretches, holds, mobility. 11 of them carry `sets` as well — `plank`, the four machine warm-ups, `diaphragmatic-breathing-core` | Clock, from `duration`. **Unchanged** |
| `reps` is a count | **86** | `"10"`, `"12"`, `"10 each side"`, `"each side"` | **Sets × reps and rest. No clock** |
| `reps` is a time per set | **31** | `"30 seconds"`, `"45 seconds each side"`, `"2 minutes"` | Clock **per set**, from the reps string — not from `duration` |
| `reps` is a distance | **3** | `gym-sled-push` `"20 metres"`, `gym-farmers-carry-heavy`, `gym-kettlebell-suitcase-carry` | Sets and the distance. No clock |

Counts taken from the live library on 12 Sep and re-checked before this plan was filed; the session re-runs them rather than trusting these.

So the discriminator already exists in the data and nothing new has to be authored. **The bug is that `resolveTiming()` reads `duration` first and never looks at `reps` at all.**

### Three things this fixes at once

1. **Lat Pulldown loses its clock** and shows 3 × 10 with 60 seconds rest, which is what it always meant.
2. **"Set 1 of 3" stops appearing on a label that never advances.** It goes entirely rather than being made accurate, because with no clock there is nothing for it to count.
3. **The 31 time-per-set entries get the right clock.** Side Plank (Full) says `"20 seconds each side"` and currently counts down its `duration` of 90 — the whole entry, both sides, three sets. It should count 20.

### Sets, one at a time

Graeme's description: set one done, set two, set three, then reflection. With the clock gone from counted exercises, advancing is a tap — no timer to wait out, and reflection opens after the last set rather than after the first.

**Careful:** `parsePrescribedSeconds()` handles `"30s"`, `"30 sec"`, `"2 min"` and `"30-45s"`. It does **not** handle `"30 seconds"`, `"45 seconds each side"` or `"1 minute hard, 90 seconds easy"`. Extending it is part of this session, and `"1 minute hard, 90 seconds easy"` should parse to nothing rather than to a wrong number — an interval prescription is not one clock.

### Files

`js/exercise-timing.js` (the rule, in the one place it already lives), then the player that renders the target — **confirm at session start how many copies of `renderExerciseTarget()` exist across `workout.js`, `gym-programme.js`, `core-session.js` and `prescribed-session.js`. If there are several, collapsing them to one is the first move, not the last.** Then `sw.js`.

### Gate — `verify-timer1`, executing

- Real `gym-lat-pulldown`: no clock, no "Set 1 of", `3 × 10` and `60s` rest all present.
- Real `side-plank-full`: a 20-second clock, not its 90-second `duration`.
- Real stretch with no reps: clock unchanged from `duration`.
- `gym-sled-push`: no clock, distance shown.
- `gym-treadmill-intervals`: the interval string produces no clock and no wrong number.
- Sets advance one at a time; reflection opens after the last, not the first.
- **Control:** each fixture is asserted to be a real library entry with the shape the test claims, so a data change cannot quietly make these pass against nothing.
- **The builder is untouched:** session length estimates are identical before and after. Assert it, because that is the half of `duration`'s job this session must not disturb.

---

## 4. Sessions 2 and 4 — GYM-REACH

Unchanged from v1. Diagnosis first, no fix in the same session.

**Already ruled out by execution on 12 Sep:** the category matchers (118 conditioning entries include all five machines), equipment (`exerciseIsAvailable()` true for each with the gym set resolved), difficulty, energy, impact, balance, position, session length (16 candidates at 20, 40 and 60 minutes) and `sectionRules` (cardio declares none). **118 candidates become 16 inside `_filterCandidates` or the pool build, and that stage has not been named.**

Session 4 builds the gate the whole set needs: **declared, available, and still never offered.** Nothing tests for that shape today, and it should cover every equipment-gated entry rather than just the machines.

---

## 5. Sessions 3 and 5 — SEARCH

Unchanged from v1. Vocabulary first, with no UI: 31 `affectsAreas` values, no synonyms, so "lats" currently finds nothing. The gate asserts that every gym word resolves to an area **and to at least one exercise** — resolving to an empty area is the failure worth catching.

Open question for that session: "traps" and "delts" have no `affectsAreas` value. Either they map to the nearest honest area or the search says it does not know the word. Saying so beats a silent near-miss.

---

## 6. Session 6 — CARD-4. Four pages, with the image slot filled by a promise

**Decisions B and C are both yes**, so this is one rewrite of `exercise-card.js` rather than two.

| Page | Holds |
|---|---|
| 1. Overview | What you are doing and why. The coach's line |
| 2. Watch out | Both hazard blocks, the caution, "If it hurts" |
| 3. Do it | Instructions, video, **the image slot**, pace, "Other ways to do this" |
| 4. Reflection | The log, the feedback buttons, next |

**Three things that do not move:**

- `HURT_AND_ACHE` renders on **every** page (CR-5). Page 2 is where the hazards live; it is not where they are quarantined.
- The caution line stays pinned, and ADAPT-1's sore-area pointer follows it.
- The hazards still come before the instructions in page order, so somebody moving forward still passes them.

**The image placeholder.** Graeme's words: something like *images will appear here*, right for beta and not for public launch. Two things follow:

1. It is a **visible, honest placeholder**, not a grey box — it says what will be there, and it is not announced as an image to a screen reader, because there is no image to describe.
2. **It has an expiry, and the expiry is enforced.** A gate asserts the placeholder is absent once `IMAGES-1` marks the library complete, so "temporary" cannot quietly become permanent. That is the only reason this is safe to ship.

---

## 7. Session 7 — GYM-MIX-1. A Gym session type

**Decision D: a new type.** Its recipe, for the session to confirm against the slot vocabulary:

- **Warm-up:** a machine, easy pace — the four `cardio-warmup` entries already do this.
- **Conditioning:** a real machine block. **This is exactly what GYM-REACH has to unblock first** — today there is nothing to put here.
- **Main:** two or three loaded lifts, pulls and presses included.
- **Core:** one.
- **Cool-down:** a stretch or two.

It is Graeme's own session: cross trainer, lat pulldowns, dead bugs, treadmill.

**Depends on session 4.** A Gym type built now would have an empty conditioning slot, which is the same fault with a new name on it.

---

## 8. Against beta

**Before beta: sessions 1, 2 and 3.** One removes a falsehood from the screen, one is a diagnosis with no deploy, one is data and a gate.

**During beta: 4 and 5.** **Beta to soft launch: 6 and 7.** **IMAGES-1 runs in waves and must finish before public launch**, because session 6 puts a promise on the screen.

---

## 9. What is still open

Nothing is blocking sessions 1 to 3. Two things want an answer before the sessions that need them:

1. **Session 6:** the exact placeholder wording. "Images will appear here" is Graeme's phrasing and will do; if he wants something warmer, that is a two-minute decision and not a blocker.
2. **Session 3:** "traps" and "delts" — nearest honest area, or say we do not know the word.
