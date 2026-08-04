# Alongside: Move — Home Navigation & Conditions Redesign
## 04 Aug 2026 v2

Build New Habits | Design specification. Supersedes `alongside_spec_home-navigation-conditions_04aug2026_v1.md`. This version resolves all five open items flagged in v1 as blocking a build session — no code has been written against it yet.

---

## 0. Decisions resolved this version

Five decisions made 04 Aug 2026, closing every open item v1 flagged:

1. **Severity threshold mismatch (was open in §4.1)** — `core-session.js`'s subacute contraindication flag moves from level 4 to level 6, matching `checkin.js`'s existing Moderate boundary. `checkin.js` is canonical (it's the scale the user actually sets); `core-session.js`'s filter now defers to it. Implementation note: single constant change, not a rewrite.
2. **Fold-in dial mechanic (was open in §4.5)** — exercise count, not session-time percentage or placement-only. Sits naturally on top of `workoutGenerator.js`'s existing duration-aware fill loop rather than requiring new percentage logic.
3. **Fold-in dial numbers (was open in §4.5)** — proportional, not fixed:
   - **Partially** — 1 condition exercise, placed in warmup
   - **Mostly** — up to half of the session's total exercise slots, condition exercises given warmup + early-main-block priority
   - **All** — condition programme exercises fill the session first; remaining slots (if any) filled from the general pool as normal
4. **Conditions Update entry point (was open in §4.1)** — a new dedicated screen is the door's destination, matching the weight of the other five Home doors. `settings.js`'s existing Conditions panel is kept, but becomes a shortcut into that same screen rather than its own separate UI — one destination, two doorways in, consistent with the pool/doorway principle already set for exercises (§5).
5. **Goals vs coach milestones default (was open in §4.3)** — both offered every time, no default. Genuine either/or choice at the point of entry on every visit.

---

## 1. The problem, evidenced

Traced directly against live code (03–04 Aug 2026), not assumed:

- The current home screen (`today.js`) funnels everyone through one path: check in → coach proposes one thing. There is no way to say "I know what I want" without going through the full check-in first, and the app has three doors (Check-in, Noticing, Library) where "Noticing" reads as Journal/Breathing, not the fuller wellbeing space it needs to be.
- The path to a *specific* targeted exercise (e.g. a glute stretch) is: Home → Library → "Start a session" split → category → "Mobility" card → **lands in `core-session.js`, which resets to its own focus picker and asks "Mobility" a second time** → duration → overview → session. Seven taps, and even then the actual exercise shown is `pool.slice(0, targetCount)` — the first N items of a fixed array, filtered for contraindications only. Not searchable, not user-targetable, not shuffled.
- `core-session.js` has its **own private exercise pool**, separate from the main exercise database that powers `workout.js`/`gym-programme.js`. Two content systems already exist where there should be one. This is the specific failure mode this redesign must not repeat.
- A real, already-shipped severity model exists and works: `checkin.js`'s Mild/Moderate/Severe picker (numeric 0–10 underneath), feeding `conditionPainScores`, read by `core-session.js`'s contraindication filtering. The new Conditions Update system extends this, not replaces it — see Section 4. **Threshold now reconciled — see Section 0, decision 1.**
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

- **Decided (Section 0, decision 4):** Conditions Update is a new dedicated screen — the door's destination, matching the weight of the other five Home doors. `settings.js`'s existing Conditions panel is kept as a shortcut into this same screen, not a separate UI.
- Severity flagging reuses the **existing Mild/Moderate/Severe scale** already live in `checkin.js` (0–10 underneath) rather than inventing a second one. **Resolved (Section 0, decision 1):** `core-session.js`'s subacute contraindication flag moves to level 6, matching `checkin.js`'s Moderate boundary.

### 4.2 Free-text reflection field — a new, distinct field, not Journal

**Decided:** this is not Journal content. It's a new, structured-input field, explicitly readable by coach logic — not subject to the Journal Privacy Rule (which remains absolute and unchanged for the actual journal). This needs to be a genuinely separate store field with its own name, not a variant or reuse of any existing journal-adjacent field, so there's no ambiguity later about which privacy rule applies to it. Whoever builds this should give it its own clearly-named field (e.g. `conditionReflections`, not anything sharing a namespace with journal entries) and document that distinction explicitly in `Schema.md` when it's built, precisely so this doesn't quietly drift the way `core-session.js`'s exercise pool did.

### 4.3 Goals and milestones

**Decided (Section 0, decision 5):** both a user-set goal and coach-recommended milestones are offered every time, no default. A genuine either/or choice at the point of entry on every visit — not one path privileged over the other.

### 4.4 Three ways to build a condition programme

1. **Coach builds it** — based on a question flow.
2. **Coach recommends, user selects** — coach proposes a set, user picks which go into their programme.
3. **User builds their own** — this is the existing Prescribed experience (`prescribed.js`/`prescribed-session.js`). These routes already exist and already work, but are currently **only reachable through coach-led flow branches** (`checkin.js`, `coach-reflection.js`, `intention.js` all route to it, but nothing lets a user jump there directly). Conditions Update becomes the direct, discoverable entry point this has been missing.

### 4.5 Where the programme lives, and the fold-in dial

Two placements, not exclusive:

- **"Use the Mobility & Conditioning door"** — the static version, reachable as its own programme within that door.
- **"Include this in Cardio, Core & Strength — Partially / Mostly / All of it"** — the adaptive version, folded into regular sessions based on the dial.

**Decided (Section 0, decisions 2 and 3):** the dial operates on exercise count, not session-time percentage or placement-only:
- **Partially** — 1 condition exercise, placed in warmup
- **Mostly** — up to half of the session's total exercise slots, condition exercises given warmup + early-main-block priority
- **All** — condition programme exercises fill the session first; remaining slots (if any) filled from the general pool as normal

Proportional to whatever `workoutGenerator.js`'s existing duration-aware fill loop has already sized the session at — not a fixed count that would feel wrong on a 15-min day vs a 45-min day.

**One shared exercise pool, two doorways in.** This applies to the Yoga/Pilates-in-two-doors question too (Section 5) and to this fold-in mechanism — the condition programme is not a separate content set duplicated into Cardio/Core & Strength, it's the same underlying exercises, surfaced through both doors.

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

## 8. Status — ready for a blueprint session

All open items from v1 are resolved (Section 0). Still explicitly not done in this document: no file list, no touch-once file table, no code. That's the next step — a dedicated blueprint session that turns Sections 2–5 into a scoped set of file changes, in build-discipline order (schema first, then views, `sw.js` last).

---

*Build New Habits · Alongside: Move · Design Spec · 04 Aug 2026 v2*
