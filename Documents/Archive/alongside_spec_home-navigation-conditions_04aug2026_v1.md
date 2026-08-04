# Alongside: Move — Home Navigation & Conditions Redesign
## 04 Aug 2026 v1

Build New Habits | Design specification, written for a future build session. This document is planning only — no code has been written against it yet.

---

## 1. The problem, evidenced

Traced directly against live code (03–04 Aug 2026), not assumed:

- The current home screen (`today.js`) funnels everyone through one path: check in → coach proposes one thing. There is no way to say "I know what I want" without going through the full check-in first, and the app has three doors (Check-in, Noticing, Library) where "Noticing" reads as Journal/Breathing, not the fuller wellbeing space it needs to be.
- The path to a *specific* targeted exercise (e.g. a glute stretch) is: Home → Library → "Start a session" split → category → "Mobility" card → **lands in `core-session.js`, which resets to its own focus picker and asks "Mobility" a second time** → duration → overview → session. Seven taps, and even then the actual exercise shown is `pool.slice(0, targetCount)` — the first N items of a fixed array, filtered for contraindications only. Not searchable, not user-targetable, not shuffled.
- `core-session.js` has its **own private exercise pool**, separate from the main exercise database that powers `workout.js`/`gym-programme.js`. Two content systems already exist where there should be one. This is the specific failure mode this redesign must not repeat.
- A real, already-shipped severity model exists and works: `checkin.js`'s Mild/Moderate/Severe picker (numeric 0–10 underneath), feeding `conditionPainScores`, read by `core-session.js`'s contraindication filtering. The new Conditions Update system should extend this, not replace it — see Section 4.
- Zero "see a professional" language exists anywhere in the conditions system today.

---

## 2. Home Page — six doors, not five

Graeme's original five, plus one added during discussion to resolve a specific gap: the current "choose for me" experience still asks the user to choose a category immediately afterward, which defeats the point of delegating.

1. **Cardio, Core & Strength**
2. **Mobility & Conditioning**
3. **Wellbeing**
4. **Conditions Update**
5. **Progress**
6. **Unsure? Coach decides** — new. The genuine zero-effort path: one tap, no category choice, no check-in required first unless the coach's own logic needs one. This preserves what the old funnel was trying to be, as an explicit choice rather than something every user is forced through. Matters most for the lowest-executive-function days — the audience this product is built around.

**Settings must be reachable from Home.** Not one of the six doors, but present on this screen (icon/corner affordance, not buried in a door).

---

## 3. Each door

### 3.1 Cardio, Core & Strength

- The default door for most sessions, most days. Closest to the current experience — deliberately not changing much here.
- Coach pulls from the full exercise range, with one caveat: it must adapt around whatever Conditions Update has on file (see Section 4's fold-in mechanism) and whatever today's check-in says.
- Concrete example of the adaptive behaviour, confirmed as the right shape: *"Glutes are Mild or Moderate — let's give those a good warmup today."* / *"Glutes are Severe — we're avoiding those entirely, resting them completely."* Graduated response by severity, not a binary block. This already exists in miniature in `core-session.js`'s contraindication logic (Section 1) — extend it, don't reinvent it.
- **Time and location must not be asked twice.** Already logged as a live bug (some session views ask again after check-in already captured it) — this redesign is the forcing function to actually fix it, not just note it.
- Future, explicitly post-launch: a "Build it" custom programme option living here; a small progress-reminder-before-you-start element, toggleable off, both screen-level and in Settings.

### 3.2 Mobility & Conditioning

- Generic mobility/conditioning work for anyone who feels they need it, not only people with an active logged condition. Yoga, Pilates, stretching, warmups live here.
- Pulls in whatever the Conditions Update programme has built (Section 4).
- Reflection data specific to mobility/condition progress — entered either post-exercise or directly in Conditions Update — displayed at the top of this door. Explicitly post-launch, not this phase.

### 3.3 Wellbeing

- The current "Noticing" space, retitled and reframed — same underlying content (journal, breathing), but the *movement* half needs a different tone here: mindful walk, yoga, Pilates as options that belong to *this* door's voice, not folded silently into Mobility & Conditioning's more clinical framing.
- Wellbeing-specific data surfaced here in future, same post-launch timing as the other doors' data displays.

### 3.4 Conditions Update

Full detail in Section 4 — this is the door with the most new design surface.

### 3.5 Progress

- Answers the "what if I only opened the app to check my progress" question directly — straight to the Progress page, no check-in gate.
- Check-in still available as a corner affordance on this screen, matching the "still need a fast path to the daily flow even from here" instinct.
- Displays everything the other doors' future progress-reminders show, plus pattern-noticing and whatever else is already spec'd for Progress.

### 3.6 Unsure? Coach decides

- One tap from Home. No forced category choice first.
- Internally, this can still use check-in data if available, and can still ask a check-in if none exists today — but the *user's* experience is "I tapped once and the coach is handling it," not "I said I don't know and got asked five more questions anyway." That gap is precisely what's being fixed.

---

## 4. Conditions Update — full detail

### 4.1 Entry and severity

- Opens the conditions selector — described as "maybe revamped." Whether that means new UI or the existing `settings.js` Conditions panel gets promoted to a full door entry point is an open implementation question, not resolved here.
- Severity flagging reuses the **existing Mild/Moderate/Severe scale** already live in `checkin.js` (0–10 underneath) rather than inventing a second one. **Open item, not blocking this doc:** `checkin.js`'s Moderate starts at level 6; `core-session.js`'s "subacute" contraindication flag currently triggers at level 4. These need to be reconciled to the same boundary before this ships — flagged here so it doesn't get silently inherited as-is.

### 4.2 Free-text reflection field — a new, distinct field, not Journal

**Decided:** this is not Journal content. It's a new, structured-input field, explicitly readable by coach logic — not subject to the Journal Privacy Rule (which remains absolute and unchanged for the actual journal). This needs to be a genuinely separate store field with its own name, not a variant or reuse of any existing journal-adjacent field, so there's no ambiguity later about which privacy rule applies to it. Whoever builds this should give it its own clearly-named field (e.g. `conditionReflections`, not anything sharing a namespace with journal entries) and document that distinction explicitly in `Schema.md` when it's built, precisely so this doesn't quietly drift the way `core-session.js`'s exercise pool did.

### 4.3 Goals and milestones

- User can set a goal for a condition; alternatively the coach can recommend milestones. Not yet specified which is the default or whether both are offered every time — open question for the build session, not resolved here.

### 4.4 Three ways to build a condition programme

1. **Coach builds it** — based on a question flow.
2. **Coach recommends, user selects** — coach proposes a set, user picks which go into their programme.
3. **User builds their own** — this is the existing Prescribed experience (`prescribed.js`/`prescribed-session.js`). These routes already exist and already work, but are currently **only reachable through coach-led flow branches** (`checkin.js`, `coach-reflection.js`, `intention.js` all route to it, but nothing lets a user jump there directly). Conditions Update becomes the direct, discoverable entry point this has been missing.

### 4.5 Where the programme lives, and the fold-in dial

Two placements, not exclusive:

- **"Use the Mobility & Conditioning door"** — the static version, reachable as its own programme within that door.
- **"Include this in Cardio, Core & Strength — Partially / Mostly / All of it"** — the adaptive version, folded into regular sessions based on the dial.

**One shared exercise pool, two doorways in.** This applies to the Yoga/Pilates-in-two-doors question too (Section 5) and to this fold-in mechanism — the condition programme is not a separate content set duplicated into Cardio/Core & Strength, it's the same underlying exercises, surfaced through both doors.

**Open item, explicitly not resolved by this document:** "Partially / Mostly / All" needs to become an actual rule before it can be built — percentage of session time? Exercise count? Warmup-only vs. threaded through the whole session? Graeme's own working hypothesis — mostly warmup or secondary-warmup material — is a reasonable starting assumption, but it needs to become a concrete algorithm during the build session, not stay a set of adjectives.

---

## 5. Cross-cutting architecture principle: one pool, multiple doorways

Confirmed as the intended shape for both the Yoga/Pilates question and the condition-programme fold-in: **one shared exercise database, surfaced through different doors with different framing** — not duplicated content per door. This directly avoids repeating the failure already found in `core-session.js` (its own disconnected exercise pool, invisible to the rest of the app). Any build session working on this must confirm it's adding *filtering and presentation* on top of the existing exercise database, not building a second one.

---

## 6. What already exists to build on

Confirmed live, don't rebuild:

- Mild/Moderate/Severe severity picker, `checkin.js`, feeding `conditionPainScores`
- 3-tier condition safety system in the exercise data (`contraindications` = avoid entirely; `caution` = included but deprioritised; no match = fully available)
- `prescribed.js` / `prescribed-session.js` — working views, just not directly reachable today
- `store.get("conditions")` / `store.get("conditionPainScores")` — the underlying data model condition-aware filtering already reads

## 7. What must not be repeated

- A second, disconnected exercise pool (as `core-session.js` currently has)
- Asking for the same input twice (the Mobility double-tap; the time/location double-ask)
- A free-text field that quietly inherits Journal's privacy behaviour without a deliberate decision (Section 4.2 makes that decision explicit precisely so this can't happen by accident)

---

## 8. Explicitly out of scope for this document

No code. No file list, no blueprint, no touch-once file table — those come once the open items in Sections 4.1, 4.3, and 4.5 have actual answers, not adjectives. This is the shared reference for that follow-up conversation, not a build session brief yet.

---

*Build New Habits · Alongside: Move · Design Spec · 04 Aug 2026 v1*
