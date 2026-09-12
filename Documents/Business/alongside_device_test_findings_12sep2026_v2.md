# Alongside: Move — Device Test Findings
## 12 Sep 2026 v2

Build New Habits | Graeme's own gym session on `alongside-v496`. Four findings, each checked against the live code before it was written down. **Nothing has been changed.**

---

## 0. What happened

Graeme went to build a full-body gym session and found he could not put the session he wanted together. He then did the session and found two more things: the timer on a sets-and-reps exercise does not do what it appears to do, and the card makes him scroll past warnings to reach the exercise itself.

All four are reproducible. Three are faults; the fourth is a design change he has asked for.

---

## 1. You cannot mix cardio with anything else

**What he said.** He wanted to warm up on the cross trainer, do dead bugs and lat pulldowns, and use the running machine — a normal gym session. Building "full body" gave him no way to add the treadmill or cross trainer. Building "cardio" gave him no way to add stretches or weights.

**What is actually true.** Worse than reported, and in a specific way.

| Session type | What the pools hold, with every machine declared |
|---|---|
| Full body, and the other four strength types | Machines appear **only in the warm-up pool**, and only the four "easy" entries: `treadmill-easy-walk-warmup`, `cross-trainer-easy-warmup`, `bike-easy-spin-warmup`, `rower-easy-warmup`. The main pool has 106 candidates and not one is a machine |
| Cardio | **No machine in any pool, at any duration.** 16 main candidates: jumping jacks, mountain climbers, shadow boxing, and eleven sport agility drills |

So in a fully equipped gym, `gym-treadmill-intervals`, `gym-cross-trainer-intervals`, `gym-treadmill-incline-walk`, `rowing-machine` and `cardio-assault-bike` are **unreachable from the generative builder entirely**. A cardio session in a gym offers a mirror drill and a defensive slide.

**It is not the category rules.** Those are fine: `matchCategory(EXERCISES, "conditioning")` returns 118 entries and five of them are the machines. Something in `_filterCandidates` removes them between the category match and the pool. **The exact filter has not been identified and should not be guessed at** — the fix session finds it by execution.

**The other half is a design question, not a bug.** Cardio sessions do carry stretches (`static-stretch`, `breathing-cool` cooldowns), so that part of the report is not quite right. What no session type does is mix a machine block with weights and stretches, because every type is a fixed recipe of slot categories. That is the "full body in a gym" session, and the builder has no shape for it.

---

## 2. There is no way to search, by anything

**What he said.** He could not search or filter. He would have liked to search by muscle group — "lats", "quads" — in both everyday and technical language.

**What is actually true.** Confirmed. The swap sheet is the only way to reach an alternative and it offers **thirteen fixed groups**: neck and shoulders, upper back, chest, lower back, hips, glutes, hamstrings, quads, inner thigh, calves and ankles, wrists and arms, core, whole body. No text input anywhere in the builder.

**What a search would have to be built on.** `affectsAreas` is the only muscle-level vocabulary in the library — 31 values, including `adductors`, `piriformis`, `rotator-cuff`, `it-band`, `quadriceps`, `upper-back`. It is close to what he wants but it is not a synonym map: nothing maps "lats" to `upper-back`, or "thighs" to `quadriceps` and `hamstring`. A search that returns nothing for "lats" is worse than no search, so the vocabulary work comes before the input box.

---

## 3. The timer on a sets-and-reps exercise is wrong, and it is lying

**What he said.** He was told three sets, given a timer, and assumed the timer was one set. When it ran out he was taken straight to the reflection page, and had to navigate back to do sets two and three.

**What is actually true.** All of it, and the cause is one line.

`resolveTiming()` returns an exercise's `duration` whenever it exists, and only falls through to reps when it does not. `gym-lat-pulldown` carries `duration: 240` **and** `sets: 3, reps: 10`. So:

- The player shows a 4-minute countdown — the whole exercise, not one set.
- It labels it **"Set 1 of 3"**. Nothing ever advances that label. There is no set two.
- When it reaches zero it moves the card to the NOTE page.
- `sets × reps` and rest between sets render in the **other** branch, which this exercise never reaches. He never saw "10 reps" at all.

**Scale: 131 entries carry both a duration and sets or reps. 118 of those have more than one set.** Every one behaves this way. And **no entry in the library lacks a `duration`** — 560 checked, 0 without one — so `renderExerciseTarget()`'s reps branch is unreachable with today's data. It is not dead code: it is correct code that the data never reaches, which is a different fix.

**The label is the part to fix first.** A countdown that says "Set 1 of 3" and then ends the exercise is not a rough edge; it tells somebody something untrue about what they are doing.

**What he wants instead:** set one, done; set two, done; set three, done; then reflection. That is a real change to the player, not a copy fix, and it needs his decision on what the timer is for on a lifting exercise — whether it becomes a rest timer between sets, or goes.

---

## 4. The card should be four pages, and needs images

**What he said.** The exercise card should be four sub-cards rather than three: what you are doing; what to watch out for; the exercise itself with instructions, video and images; then reflection. At the moment the warnings make a long scroll before the content, so people will flick past them. And exercises need images, as Bend does.

**What is actually true.** The card is three pages — DECIDE, DO, NOTE — and DO carries everything: caution, both hazard blocks, "If it hurts", how to get there, pace, and now "Other ways to do this". It is the long page he describes.

**On images: there are none.** Zero entries carry any image field. All 560 carry a `youtube` value.

**Two things to weigh before this is built, both his call:**

1. **Splitting the hazards onto their own page makes them skippable.** Today they sit above the instructions, so you pass them on the way to what you want. On their own page they can be swiped past without reading. The strongest argument for the split is his own: a page people scroll past fast is not being read either. But "harder to ignore" is the reason the current order exists, and CR-5's rule is that `HURT_AND_ACHE` renders on **every** page — that must survive any reshuffle.
2. **Images are a content project, not a card change.** 560 entries, two or three images each, all needing to be ours or properly licensed, and all needing to match the coaching cue. The card work can be done first with the image slot empty, or the project can wait until there are images to show.

---

## 5. What this adds up to

Three of the four are faults in things that already exist:

- Machines unreachable (section 1) — a filter, findable by execution.
- No search (section 2) — a gap, and the vocabulary work comes first.
- The timer label (section 3) — one line, and it is telling people something untrue.

The fourth is a redesign with two decisions inside it.

**The one to do first is the timer label**, because it is small and because it is the only one where the app currently says something false.

---

## 6. Proposed schedule rows

| Task | What | Status | Notes |
|---|---|---|---|
| **GYM-REACH-1** | Find, by execution, why machine cardio entries never reach a candidate pool. Diagnosis first, no fix in the same session | 🟠 Flagged Issue | The category matchers are not the cause; that has been checked |
| **GYM-MIX-1** | A session shape that mixes a machine block, weights and stretches — the "full body in a gym" session | 🟡 Double Check | Design decision, Graeme's |
| **SEARCH-1** | Muscle-group synonyms over `affectsAreas`, then a search input in the swap sheet | 🟡 Double Check | Vocabulary before input box |
| **TIMER-SETS-1** | The countdown on a sets exercise stops claiming to be "Set 1 of 3" | 🟠 Flagged Issue | Smallest, and the only one where the app says something untrue |
| **TIMER-SETS-2** | Set-by-set progression: set one done, set two, set three, then reflection | 🟡 Double Check | Needs Graeme's answer on what the timer is for |
| **CARD-4** | Four pages: overview, watch out, do it (instructions, video, images), reflection | 🟡 Double Check | `HURT_AND_ACHE` on every page must survive |
| **IMAGES-1** | Images per exercise | 🟡 Double Check | 560 entries, ours or licensed. A content project |

---

## 7. For Graeme

1. **What is the timer for on a lifting exercise** — rest between sets, or nothing at all?
2. **Do the hazards get their own page**, knowing that makes them swipeable?
3. **Do you want the four-page card built before there are images**, with the slot empty?
4. **Is "full body in a gym" a new session type, or a change to how the existing ones are built?**

---

## 9. GYM-REACH-1: the diagnosis. Added 12 Sep 2026, `v497`

**No fix in this session**, as the plan required. The cause is named, and it is not what section 1 assumed.

### 9.1 The cause: `isSessionLength()`

`js/data/exercises/index.js`:

```javascript
export function isSessionLength(ex) {
  return ex?.contentType === "practice" || (ex?.duration || 0) >= 600;
}
```

`session-builder.js` drops anything it returns true for. **Every machine cardio block is 15 to 30 minutes**, so every one is excluded:

| Entry | Duration |
|---|---|
| `gym-treadmill-incline-walk`, `cardio-rowing-intervals` | 1800s |
| `gym-treadmill-intervals` | 1500s |
| `rowing-machine`, `cardio-rowing-easy`, `cardio-assault-bike`, `gym-cross-trainer-intervals`, `gym-stair-climber-steady` | 1200s |
| `gym-stair-climber-intervals` | 900s |

And the four machine entries that **do** appear are the four under ten minutes: the easy warm-ups, 240 to 300 seconds. That is the whole of it.

**This rule is deliberate and it is right.** DATA-1, 12 Aug: a 25-minute treadmill block is not one of ten slots in a 40-minute session, and the rule exists because a single 60-minute cardio build once returned two different weeks of the same couch-to-5K programme stacked on top of each other. **So GYM-REACH-2 as scoped — "fix the filter" — is the wrong fix.** Nothing is broken in `_filterCandidates`.

### 9.2 The real fault: 136 entries fall between two rules

Long content is supposed to have a home. `practice-library.js` derives it:

```javascript
return EXERCISES.filter(ex => isSessionLength(ex) && !reachable.has(ex.id));
```

`reachable` is computed from category matches across every session type — **and it does not apply the builder's own length rule.** So the machines match `conditioning`, the practice library concludes a session type can reach them, and the builder then drops them for length. Each rule assumes the other has them.

**Measured: 136 entries sit in that gap.** By library category: cardio 90, recovery 21, mobility 9, mindfulness 9, strength 7. Among them: `brisk-walk`, `cycling-steady`, `hiit-30-30`, `walk-run-intervals`, `stair-climbing`, `dance-freestyle`, `mobility-flow-5min`, and all nine machine blocks.

**Zero of the 136 appear under Practices**, which shows 28. Authored content, reachable by nothing.

This is the same shape as PRAC-1 in August, which found 28 whole practices no view referenced. The door built then only fits what the derivation lets through.

### 9.3 One smaller thing

`stair-climber` is in `CARDIO_MACHINES` and on two entries, but **neither equipment picker offers it** — not onboarding, not the session builder. Those two entries are unavailable to everybody regardless of the length rule.

**Not a fault:** the builder UI's `bike` and `cross-trainer` ids resolve correctly to the data's `exercise-bike` and `elliptical` through `EQUIPMENT_IMPLIES`. Checked, because a vocabulary mismatch was the obvious suspect.

### 9.4 What follows

| Row | Revised |
|---|---|
| **GYM-REACH-2** | **Rescoped.** Not a filter fix. Make `reachableByAnySessionType()` honest — apply the same length rule the builder applies — so the 136 stop falling between the two. Expect the Practices list to grow from 28 to around 164, which is a content-shape question before it is a code change |
| **GYM-MIX-1** | **Unblocked, and now the right home for the machines.** A Gym session type needs a shape with room for one long block, rather than ten short slots. That is what Graeme wanted: cross trainer, lat pulldowns, dead bugs, treadmill |
| **New: EQUIP-STAIR** | Add `stair-climber` to both equipment pickers, or retire the two entries |
