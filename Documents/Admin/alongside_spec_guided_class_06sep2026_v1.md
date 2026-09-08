# Alongside: Move — Guided Class content programme
## 06 Sep 2026 v3

Build New Habits | The room where somebody else already decided.

Specification. No content exists yet. Production order at §9.

---

## 1. What is behind that door today

**Nothing followable.** All eight entries in `programmes.js` have an empty `sessionSequence`. What a "programme" actually holds is four phases, each carrying a **bias** — `intensityBias: 'gentle'`, `focusBias: ['mobility','strength']` — plus a label, a coach message and milestones.

So a class is a twelve-week *tuning of the generator*, not a course. **CLUB-SHELL's card copy — "A set course. Same shape each week" — is a promise the data cannot keep.** It was written against a room nobody had looked inside.

Graeme, 06 Sep, on device: *"There is no Class content to follow. No programme."* There is not.

🔴 **Immediate, independent of everything below:** the card copy must stop describing a course until one exists. See §10.

---

## 2. Why this room needs real content and cannot generate it

Every other room generates. **A class is the one thing where somebody else already decided and you just turn up and follow.**

That is a different psychological offer, not a different filter — no decisions, no configuring, be told. For a lot of this audience it is the easier one, and it is the reason the door feels empty: it promises the single thing the generator structurally cannot do.

**A generated class is a contradiction.** A class is fixed, repeatable, and made by someone.

---

## 3. Scope: three formats, and the reason is safety not effort

**Mindfulness · Yoga and Pilates · Stretching.** Circuits later; spinning not at all for now.

🔴 **These are the three formats where being FIXED is safe.** A fixed spinning class is a hazard for somebody mid-flare. A fixed stretching sequence is not. **Dropping circuits is the format matching the audience, not a compromise on ambition.**

🔵 They are also the three things mainstream fitness does worst for people it has already failed — so this is differentiating rather than a thinner version of a gym app.

**Circuits, when they come**, draw on the equipment the person has recorded and stay a separate decision. Recorded here so the omission is deliberate rather than forgotten.

---

## 4. 🔴 SCRIPT FIRST. Screens are a rendering of the script, not a substitute for it.

Beta is screen-guided. Voice follows, hopefully by launch.

**Write the spoken script now and render it to screen.** If short screen cues are written first and voice added later, everything gets rewritten — **voice needs pacing, breath and silence, and it reads completely differently on the page.**

🟢 **The beta content then IS the launch content, and the voice pass is production rather than a rewrite.** ElevenLabs is the intended route.

⚫ **The screen renders the script's beats, not a summary of them.** A class that reads as a bullet list on screen and a flowing script in audio is two products.

---

## 4b. 🔴 HOW A CLASS IS PACED. The person drives, not the class.

Added 06 Sep 2026 after Graeme asked whether video-style speed controls (0.5x … 2x) would solve the pace problem. **They solve a different one, and built the obvious way they break the class.**

### Two different pace problems

| | |
|---|---|
| **Structural pace** — solved in Class 002 | A clock and a rep count are ways of falling behind. Removed: no timer shown, no reps counted aloud, no round-two target, every movement ending on a **stated signal** rather than "when you can't do any more" |
| **Delivery pace** — not yet solved | How fast the coach talks and how long the gaps are. **Processing speed varies enormously across this audience**, and a class currently sets one tempo and expects you to match it |

### 🔴 A single playback rate silently rewrites the workload

**Speed must scale the SPEECH, never the HOLDS.**

At 1.5x, Class 002's 35-second plank becomes 23 seconds — a different and harder exercise. At 0.5x it becomes 70 seconds, which for the person who chose *slower* is exactly the wrong outcome. **One rate over a whole class changes the work in both directions, and neither is what the person asked for.**

🟢 **So a beat carries TWO durations and only one of them scales:**

```
speechSeconds   number   // narration and the gaps between cues -- SCALES
holdSeconds     number   // how long a position is held -- NEVER SCALES
```

⚫ **Cheap now, expensive later.** Retrofitting this once classes are written means revisiting every beat in every class to work out which number was which.

### 🟢 THE DEFAULT IS TAP-TO-ADVANCE, NOT A TIMER

Beta is screen-first, so there is no audio to speed up yet — **the immediate need is not a rate at all.**

**Every beat waits.** The hold is still stated in words — *"about thirty seconds"* — and nothing moves on until the person taps.

🔴 **This is a better answer than a speed control, and the reason is the same reason the clock went.** A speed control still assumes the class drives and the person keeps up; it only changes how fast they have to. **Tap-to-advance means the person drives.** For somebody with fatigue or slow processing, that is the difference between a class being usable and being another thing that got away from them.

It is also consistent with everything else already decided: no clock, no rep count, the exit offered in the middle, sitting out counting as doing the round.

| Mode | When |
|---|---|
| **Tap to advance** | **Default.** The class waits. Beta ships with only this |
| **Timed** | An option, not the default. For somebody who wants it running by itself |
| **Speed control** | **Only once there is audio to apply it to.** Scales `speechSeconds` only |

### 🟡 If speed control ships, cap it and label it by effect

**0.75 / 1 / 1.25**, not 0.5 to 2. Two-times exists for getting through content quickly, and **a class is not content to get through** — a 2x movement class is worse and slightly unsafe.

**Label by effect, not multiplier.** *"More time between cues"* reads as a setting. *"0.5x"* reads as an admission.

---

## 5. 🔴 NO BEGINNER / INTERMEDIATE / ADVANCED

Those label **the person**. This product does not rank people.

*Advanced* is a fitness-culture word for an audience defined by having been failed by fitness culture. In practice many will pick *beginner* permanently, and some will overreach to prove something. **Both are failures of the label, not of the person.**

🟢 **Label what the class ASKS OF YOU, and reuse the vocabulary that is already live:** `intensityBias` is **`gentle` / `moderate` / `challenging`** across `programmes.js` and the generator.

⚫ **A parallel ladder would be a second vocabulary to keep in step with the first — DATA-1b, applied to content instead of code.**

---

## 6. 🔴 VISIBLE, NOT LOCKED

The whole twelve weeks is visible from the start. **The coach says which one is next; nothing is withheld until a date.**

Releasing one at a time is a gate on the person, and it is **streak-shaped**: miss a week and you are behind. It is also the fault CLUB spec v2 §3.1 reversed — *"find out by doing" is an implicit demand*, and for a neurodivergent user **knowing what is coming is the thing that lowers the barrier.**

🟢 **Skipping costs nothing.** No "you missed one", no rescheduling, no catch-up. A course that punishes a skipped week is a streak with a syllabus.

---

## 7. The exit route already exists

Graeme: *"if they don't wanna do yoga, then they can go, nah."*

**No new selector is needed.** One to one, Your own and Quick build are all on Home, one tap away. What Guided class needs is only that **stepping out today costs nothing** — which is §6.

⚫ **Building a second chooser here would be a corridor, and a second thing to keep in step with the four rooms.**

---

## 8. 🔴 THE MAPPING UNIT IS THE STRAND, NOT THE AIM

Measured: **33 aims, 30 strands.** Strands are shared — `pacing`, `trusting-body`, `getting-going`, `self-kindness` recur across many aims.

So: **a class declares which strands it serves. A twelve-week programme is a path through the strands the person's arc actually contains.** That makes 33 aims coverable without 33 programmes.

**Map DOWNWARD from the arcs.** Starting from the content already to hand produces classes that fit the data model rather than classes somebody needs.

### The 30 strands

`hip-range` · `ankle-range` · `hamstring-range` · `upper-back-range` · `neck-shoulders` · `leg-strength` · `upper-strength` · `trunk-strength` · `hip-hinge` · `aerobic-base` · `balance` · `getting-going` · `confidence-floor` · `pacing` · `being-outside` · `winding-down` · `meeting-people` · `self-kindness` · `steadiness` · `trusting-body` · `not-overdoing` · `showing-up` · `at-home-in-body` · `power` · `sport-specific` · `load-tolerance` · `back-resilience` · `shoulder-health` · `keep-walking` · `gentle-capacity`

⚫ **Not every strand needs a class.** `meeting-people`, `being-outside` and `sport-specific` are not served by a mat. Coverage is a decision per strand, recorded, not an obligation.

---

## 9. What already exists and must be extended, not replaced

`js/data/practice-library.js` holds **4 groups and 28 standalone practices**, already carrying `position`, `impact` and `balanceDemand` — the fields the safety filter reads.

🔴 **Improvements extend what exists. The class library is not a second content system beside this one.** A class is a *sequence* of practices with pacing and a script; the practices themselves should come from here, or the safety filtering has to be built twice.

---

## 10. Order

| # | Item | Notes |
|---|---|---|
| 1 | 🔴 **GUIDED-COPY** | Card copy stops describing a course. *"A twelve-week shape. I adjust your sessions to fit it."* **Small, pre-beta, independent of all content work** |
| 2 | **Strand coverage decision** | Which of the 30 get classes, which do not, recorded per strand with the reason |
| 3 | **Class data contract** | `strands[]`, `intensityBias`, `format`, `durationMins`, `practiceIds[]`, `script[]`. **Schema before content** |
| 4 | **One strand, properly** | Six to eight classes forming a real progression. **A library with three classes is worse than none** — it promises a category and delivers a sample |
| 5 | **Programme assembly** | A path through an arc's strands |
| 6 | **Screen renderer** | Renders the script's beats |
| 7 | **Voice pass** | Production, not rewrite |
| 8 | **Circuits** | Equipment-driven, separate decision |

---

## 11. Open, and needing Graeme

🟢 **RESOLVED, 06 Sep 2026. First strand set: Graeme's own arc, then expand outward.** *"Use my arc first then expand from there."* Gilly is testing it, so it gets the deepest scrutiny — worth more on a first pass than the widest coverage.

🟢 **RESOLVED, 06 Sep 2026. BOTH, not either.** *"A lighter version with a bad day pointing somewhere else."*

A generated session adapts to the check-in. **A class cannot — that is what makes it a class.** So there are two tiers of not pretending otherwise:

| Day | Response |
|---|---|
| **Not great** | The class's **lighter variant**. You still get the class you came for |
| **Genuinely should not** | **Routed out** of the room, to One to one or Quick build |

🔵 **The threshold already exists.** `buildSession()` resolves `severeZoneToday()` before any pool is built and diverts to Gentle Care at 7+. **The class equivalent maps straight onto it** — below → lighter variant, at or above → route out. **One threshold, one place to check**, rather than a second clinical rule for classes to keep in step with the first.

⚠️ **The lighter variant roughly doubles the writing.** Recorded so the volume is not a surprise once production starts.

🟡 **Timeline.** This is weeks of writing, and it is the work most likely to eat a date. Currently placed **between beta and the November soft launch**, not before beta.
