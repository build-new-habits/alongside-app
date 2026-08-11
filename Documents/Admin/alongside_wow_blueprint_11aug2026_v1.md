# Alongside: Move — The Wow Blueprint
## 11 Aug 2026 v1

Build New Habits | Everything needed to turn Tom's and Priya's traced three weeks into an experience worth talking about. Sequenced into build sessions, touch-once respected, decision-gated items flagged rather than booked.

**Companion to:** `alongside_persona-wave1_technical-report_11aug2026_v1.md` (evidence), `_narrative_` (the lived version), `_plain-language-summary_` (the readable version).

---

## 1. The standard

Agreed in conversation, 11 Aug: **Disney, not Alton Towers.**

Alton Towers works. Rides run, you get on them, it never once forgets it's a car park with rides in it. Disney's difference isn't spectacle — it's that the bins match the land they're in and nothing breaks the spell.

Applied here, the operative test on every item below is not *"how many users are affected"* but:

> **Can the user see the machinery?**

That test reordered the severity model. Under it, a data bug that makes a man's four sessions read as one outranks a missing delight, because the first actively produces shame and the second is only an absence.

**The silent promise this product makes is "don't worry, trust me, I've got you."** Every item below is a place that promise currently has a crack in it.

---

## 2. Locked principles

Three decided in conversation on 11 Aug. Every item in this blueprint conforms to them, and any future proposal must pass them.

**2.1 — The coach never sells, and never withholds what it can see.**
If the coach has noticed something, it says it. Free. Personal buys **tools** (choose session type, choose duration, log lifts, export, longer windows) — never *deeper coaching*. The moment the coach's helpfulness becomes tier-dependent, "I've got you" becomes "I've got you up to a point," and a conditional promise is not a promise.

**2.2 — The coach never talks about the app. A separate, visually distinct helper layer can.**
Disney's cast members are visibly not characters; the frame holds *because* of the distinction. What would break it is Mickey discussing queue times. So: the coach coaches, and a legibly-different helper layer teaches the interface.

**2.3 — The app never teaches in the abstract. It offers at the point of friction, triggered by something the person did, never on a timer.**
With one deliberate exception, established in §5: the periodic re-ask, which is coaching rather than teaching.

---

## 3. The dominant failure mode

Four separate confirmed instances, plus this session's audit, point at one pattern:

**Content and logic get written against a data shape that was never wired up.** The response exists; the capture doesn't. Or the reader exists; the writer doesn't.

| Instance | Status |
|---|---|
| `checkin-openings.js` territory vocabulary | Never matched any onboarding, old or new |
| `fitnessLevel` | Reader fixed in v1.8, writer never existed post-OB-THREAD |
| `exerciseFeedback` | `applyFeedbackWeighting()` reads it, nothing writes it |
| `absence.capturedAt` | Written by `programmeEngine.js`, read nowhere |

This matters for sequencing: **for most of what follows, the expensive part is already built.** These are wiring jobs, not feature builds. That is the good news the technical report undersold.

### 3.1 — Systematic audit run this session, with its blind spot declared

A full `store.get()` / `store.set()` path diff was run across `js/`, comments stripped.

**Declared blind spot:** `thread.js` writes dynamically via `store.set(step.storeField, value)` (line 1040). A static scan cannot see those eleven onboarding writes, so every field written only by live onboarding appears orphaned. All `lifestyle.*` results were discarded for this reason. **Any future audit of this kind must special-case `thread.js` or it will produce confident nonsense.**

**Checked and cleared** (graceful fallbacks, not bugs — verified, not assumed):
- `workoutGenerator.js:387` reads `goal.primaryGoal`; falls back to `goals[0]`. Dead path, harmless.
- `workoutGenerator.js:492` reads `goal.targetDate`; falls back to `targetDate` first. Dead path, harmless.
- `weeklyPlan` is a real field (`store.js:431`). False positive.

**Genuinely orphaned, low priority:** `openGymSub`, `pendingLogActivity`, `usingGeneratedSession`, `workoutsGeneratedAt`, `proposalBias`, `strategicGeal.setAt`, `todayEnergy`, `cycleLength`, `checkin.energy`. Cleanup, not urgent.

### 3.2 — 🔴 Out of scope here, but must not be lost

`consentGiven` and `consentAt` are written **only** by `js/views/onboarding/welcome.js` — a route retired from `router.js` VIEW_NAMES in v7 — and are read **nowhere**. `thread.js`'s storeField list does not include them.

If that holds, **live onboarding captures no consent record at all.** Against the already-logged ToS age contradiction (13+ vs 16+, Stream A item A1.11) and a beta five weeks out, this needs its own look. It is a legal/safeguarding matter, not a persona-experience one, and it is deliberately not folded into the sessions below. **Flagged, not scoped.**

---

## 4. What Tom and Priya should experience

The target, so the work below has something to be measured against.

### Tom — the wow is being remembered

**Day one.** He tells the app there's a longer history than any of the options can hold. Next morning the coach opens with something that could only be said to him: *"You told me there's a longer history than any of that. I haven't forgotten. How's that sitting this morning?"* Nobody has ever had that from a fitness app.

**Every session.** Built for a man who told it he sits down all day. Nothing above his ceiling. He never once thinks *that was harder than I expected* — the most common reason a beginner quietly stops.

**Week three.** He opens Progress. It says four sessions. Because he did four sessions.

**Week eight.** He's fitter than he was. The coach asks — briefly, once, without ceremony — whether anything's changed. He says he's more active now. The sessions move with him. He never sees a settings menu.

**Nothing anywhere makes him feel behind.** That part already works and must survive every change below.

### Priya — the wow is being taken seriously

**Day one.** She taps "Lower body." Something happens. It explains itself, offers, and lets her decide. It does not ignore her.

**Every session.** The full pool, including the nine hardest movements currently withheld from her.

**After every set.** A field. She types what she lifted. It takes two seconds and she stops reaching for her Notes app.

**Week four.** Progress shows her squat going up. Not sessions. Not minutes. **Load.** That is the only thing she came for.

**Her verdict changes** from *"the coaching's better than anything else I've used but I'm still typing lifts into Notes"* to something worth telling someone about.

**Honest note:** the last two require a real build (§6, WOW-6). Without it Priya has no wow — only the removal of irritations. Everything else here improves her experience; none of it addresses why she came.

---

## 5. The work — sequenced build sessions

Touch-once respected: no file appears in more than one session. Every session ends with `sw.js` last, cache bump, one-line change note. Schema-first where any field changes.

---

### WOW-1 — Stop the harm 🔴 First, ahead of everything

**Why first:** this is the only item actively producing the feeling the entire product exists to prevent. Tom did four sessions; the app tells him one. The guilt architecture arrived by accident, through a data bug, and it is worse than a streak counter because a streak is at least honest about what it measures.

| | |
|---|---|
| **Fixes** | PT-3 |
| **Files** | `js/views/workout.js`, `js/views/core-session.js`, `js/views/yoga-session.js`, `Documents/Live State/Schema.md`, `sw.js` |
| **Change** | Supply a real `durationMins` on completion. `workout.js:507,553` currently writes explicit `null`; `core-session.js:811` and `yoga-session.js:766` omit it. All three need an elapsed-time tracker — `session-resume.js`'s tick-counted elapsed pattern already solves this correctly and should be reused, not reinvented. |
| **Gate** | On-device: complete one of each type, confirm Progress minutes are non-zero and plausible. |
| **State** | 🟠 Build-ready |

**Deliberately excluded** to hold touch-once: `morning-session.js` and `quiet-session.js` have the same fault plus the `duration`/`durationMins` naming split (PT-6). They belong with the `logActivity()` migration, not here.

---

### WOW-2 — Sessions that fit the person 🔴

**Why second:** silent in both directions. Tom gets 76 exercises above his ceiling and stops because it's too hard. Priya loses the 9 hardest and drifts because it's too easy. Neither could tell you why. Highest ratio of harm-removed to lines-changed in the codebase.

| | |
|---|---|
| **Fixes** | PT-2, PT-9 |
| **Files** | `js/data/workoutGenerator.js`, `js/data/exercises.js`, `js/data/exercises/index.js`, `Documents/Live State/Schema.md`, `sw.js` |
| **Change** | `workoutGenerator.js:594` reads `lifestyle.activityLevel`, with `fitnessLevel` retained as an explicit override so the Settings control keeps working. One source of truth, no new field. Add a `returning` ceiling to `filterByFitnessLevel()` — the fifth ACTIVITY_CHIP currently has no key and would silently resolve to moderate. **Recommend `returning: 6`** — below moderate, above light: someone coming back after a break has capacity but shouldn't be met at their old level on day one. Fix `yoga-crescent-lunge`'s missing `energyRequired` in the same pass. |
| **Note** | `exercises.js` and `exercises/index.js` are byte-parallel duplicates of `filterByFitnessLevel()`. **Both must change.** Whether the duplication should exist at all is a separate question — do not resolve it here. |
| **Gate** | Node: pool sizes 253 (sedentary) and 359 (active), matching the traced targets. Then on-device. |
| **State** | 🟠 Build-ready, schema-first |

---

### WOW-3 — The coach remembers 🔴 Decision-gated

**Why third rather than first:** highest emotional return in the product, but it is a *missing* wow rather than active harm, and it cannot be built until the content decision lands. Booking it ahead of that decision would stall a session.

| | |
|---|---|
| **Fixes** | PT-1 |
| **Files** | `js/data/checkin-openings.js`, `sw.js` |
| **Blocked on** | Graeme's mapping of the seven live territories to openings. `the-history` → `past-failure` is obvious. `escalation-trap` ("It moved too fast, too soon") and `invisible-person` ("I never felt like it knew I was there") have no existing row that fits and likely need new content written. **A code-only guess must not ship here** — this is the single most emotionally loaded line in the product. |
| **Also in scope** | The age branch tests `['45-54','55-64','65+']`; live bands are `40s`…`70plus`. The `hormonal-change` opening (careMode) has never fired. Same file, same session. |
| **Also worth resolving** | The return-after-absence opening (`long-absence`, line 233) — whether it fires is **untraced**. `absence.capturedAt` is written and read nowhere, which is not encouraging. Trace before opening the file, so it lands in this session rather than reopening it later. |
| **State** | 🟠 **Decision-gated. Not build-ready.** |

---

### WOW-4 — Nothing is a dead end 🟠

**Why:** Priya taps "Lower body," wanting it enough to reach for it, and the app ignores her. An app that doesn't respond to a tap isn't "I've got you" — it's absent. This is simultaneously the spell-fix and the best conversion moment in the product, currently doing nothing at all.

| | |
|---|---|
| **Fixes** | PT-7, plus the Progress window decision |
| **Files** | `js/views/session-builder-ui.js`, `js/views/progress.js`, `sw.js` |
| **Change A** | Replace the inline `opacity:0.45` + `disabled` treatment (lines 230–252) with `lockedFeature()` from `auth.js`. Already built, already handles focus, keyboard, reduced-motion and tap-through to `/upgrade`, and already used by `noticing.js`. Removes the third competing visual language for "locked" and restores keyboard/screen-reader reach to the explanation — currently unreachable because `disabled` strips the element from the tab order. |
| **Change B** | **Free tier Progress window 7 → 30 days.** Not generosity — coherence. The founding principle is *variability is information*, and a seven-day window is structurally incapable of showing variability. Tom trains twice weekly with gaps; in any seven-day slice he sees one entry and no shape. Personal keeps 90 days, export, and tools. |
| **Consequence** | Pricing copy and the website comparison table both need updating. Not this session. |
| **Gate** | On-device, plus a contrast measurement on the `lockedFeature()` treatment (WCAG 2.2 AA, 4.5:1 for the badge label). |
| **State** | 🟠 Build-ready |

---

### WOW-5 — The coach asks again 🟠 New build, schema-first

**Why this exists:** Graeme's point, and it reframed the problem correctly. Tom gets fitter, buys a kettlebell, develops back pain. Nothing in the app ever re-asks anything — confirmed by search. Onboarding takes a snapshot and the app treats it as permanent.

**This is not a discoverability problem and cannot be solved by tips or by friction, because there is no signal.** Tom won't generate one. Someone has to ask.

**And the third case is a safety gap, not a UX gap.** The condition-safety filtering (avoid/caution/safe) is genuinely good and only runs on conditions the app knows about. A man who develops back pain and doesn't know Conditions Update exists gets confidently-generated sessions built on the assumption he has none.

| | |
|---|---|
| **New concept** | Profile staleness. Schema first: a `lastConfirmedAt` per re-askable field, or a single `profileReviewedAt` — **decide before any code.** |
| **Re-askable** | `lifestyle.activityLevel`, `equipment`, `conditions`. Not goals (they have their own flow), not name, not age band. |
| **Register** | **Coach voice.** This is coaching, not teaching — the deliberate exception to principle 2.3. A coach who asked once in March and never again isn't a coach. |
| **Shape** | One question, one moment, never a form. Skippable without consequence and without re-prompting the same week. Conditions get the shortest interval on safety grounds. **Cadence needs deciding** — recommend 8 weeks for activity/equipment, 4 for conditions. |
| **Must not** | Read as an audit, a form, or a nag. If it feels like admin, it fails 2.3's spirit even while being a permitted exception. |
| **State** | 🟠 **Spec needed before build.** Recommend writing this next — the safety edge outranks the helper layer. |

---

### WOW-6 — Priya's actual wow 🟠 Decision-gated

**Why it's separate:** everything above improves Priya's experience. **None of it addresses why she came.** She wants numbers to move; the app captures no numbers. It tells her three sets of twelve and never asks what she did — which is a coach giving an instruction and not caring about the answer.

Persona-matrix Section 4 decision 2 (basic PB logging as a Personal-tier feature, decoupled from Athlete self-build) is **decided and never built.**

| | |
|---|---|
| **Decision needed** | Beta blocker, or post-beta? |
| **The case for beta** | Without it, Personal is a bundle of conveniences. Priya's traced verdict — *"what I'm paying for is being allowed to choose 'legs' instead of 'full body'… that isn't nine quid of improvement"* — is a pricing problem as much as a product one, and beta is where it gets tested. |
| **The case against** | It is a real build, not a wiring fix: capture UI in session views, schema, and a Progress surface that plots load. Five weeks to beta. |
| **Scope if built** | Weight/reps per set on gym exercises only. Not every session type. Not a full analytics suite. |
| **State** | 🔴 **Decision-gated. Recommend deciding this week** — it shapes pricing copy, website comparison table, and beta expectations. |

---

### WOW-7 — The helper layer 🟢 Deliberately last

Per principle 2.2. **No tips, tour, coachmark or help mechanism exists anywhere** — confirmed by search. This is a genuine build.

**Design, as agreed:**
- Visually distinct from the coach. Never in coach voice.
- Every tip fires **at most once, ever.** Not on a cadence.
- **Suppressed for anything already used.** If he's opened Library, he never hears about Library.
- One tap to dismiss, permanently. Three dismissals in a row and the layer goes quiet on its own.
- Global off in Settings, plainly worded, not buried.
- **One persistent, always-available helper affordance** — the cast member. One place, never interrupts, always there. This is how explorers and non-explorers are served by the same system: the pull mechanism is permanent and silent, the push mechanism is finite and self-extinguishing.

**Why last:** we are designing for two simulated people. Plausible is already wired for custom events and beta starts mid-September. Build the friction-triggered offers below because each fixes a *traced* problem — then let beta say whether a discoverability gap remains. Designing a prompt system for an unmeasured problem five weeks before beta is how interruption creep starts.

**Friction-triggered offers, coach voice, each fixing something already traced:**

| Signal already available | Offer |
|---|---|
| Session exited early or marked hard | *"That looked like a hard one. Want me to ease things off for a bit?"* → adjusts activity level. Settings never mentioned. |
| Equipment empty, thin pool | *"I'm working with bodyweight only at the moment. Want to tell me what you've got?"* |
| Same session type 6× running | *"You've been doing full body every time. Want to try something more specific?"* |

**Prerequisite:** the first row needs a "that was too hard" signal. One is half-built — `exerciseFeedback` is read by `applyFeedbackWeighting()` and written by nothing, so the weighting logic has never run on real data. Wiring the capture is the cheapest route to *"the app noticed and adjusted without me telling it,"* which is the Disney version of this entire problem. **Recommend as its own small session, before WOW-7.**

---

## 6. Sequence

| Order | Session | State | Gate |
|---|---|---|---|
| 1 | **WOW-1** Stop the harm | Build-ready | — |
| 2 | **WOW-2** Sessions that fit | Build-ready | — |
| 3 | **WOW-4** No dead ends | Build-ready | Pricing copy follows |
| 4 | **WOW-3** Coach remembers | Decision-gated | Territory mapping |
| 5 | **WOW-5** Coach asks again | Spec needed | Cadence + schema shape |
| 6 | **WOW-6** Priya's wow | Decision-gated | Beta blocker? |
| 7 | `exerciseFeedback` capture | Build-ready, small | — |
| 8 | **WOW-7** Helper layer | Post-beta measurement | — |

Sessions 1–3 can run back-to-back with no decisions from Graeme. That is roughly 60% of the traced harm removed without a single meeting.

**Not in this blueprint, still open:** `gym-programme.js` v5 on-device confirmation (unchanged, still the highest-priority test on the board), PT-5, PT-6, PT-8, PT-10, and §3.2's consent finding.

---

## 7. What I am deliberately not proposing

- **No celebration animations, confetti, badges or streaks.** The wow here is being known, not being congratulated.
- **No coach-voiced upgrade nudges.** Principle 2.1.
- **No timed tips.** Principle 2.3.
- **No new Home doors.** Tom's defining trait is decision paralysis and he already has seven. If anything, that number should come down — worth its own conversation, not a change slipped into a fix session.

---

## 8. Open questions for Graeme

1. **Territory mapping** (blocks WOW-3) — offered: a drafted proposal of all seven with reasoning, to react to rather than generate cold.
2. **PB logging: beta blocker or post-beta?** (blocks WOW-6) — shapes pricing copy and the website table.
3. **`returning` ceiling** — recommend 6. Confirm or overrule.
4. **Re-ask cadence** — recommend 8 weeks activity/equipment, 4 weeks conditions.
5. **Consent capture** (§3.2) — needs its own session, separate from all of the above.

---

*Build New Habits · Alongside: Move · The Wow Blueprint · 11 Aug 2026 v1*
