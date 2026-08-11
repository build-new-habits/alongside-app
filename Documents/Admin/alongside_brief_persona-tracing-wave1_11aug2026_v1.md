# Alongside: Move — Persona Tracing Brief: Wave 1
## 11 Aug 2026 v1

Build New Habits | **For a fresh, independent chat with no prior history of this project.** Paste this whole document as the first message. You are being asked to do something unusual: not build anything, not fix anything — trace the live app exactly as two specific real people would experience it, across weeks of irregular real-world use, and report back with total honesty about what you find. You were chosen precisely because you have no memory of this project's other conversations — don't try to guess what "should" be true from context clues. Everything you need is either in this document or in the repo itself.

---

## 1. What this actually is, and why it matters

Alongside: Move is a coaching app built on a specific promise: it adapts to real, irregular, human lives — not the idealised daily-user fantasy most fitness apps are built for. Nobody has ever checked, end to end, persona by persona, whether the live product actually keeps that promise. That's what this session is for.

You are not testing whether buttons work. You are answering a harder question: **if a real person matching this profile used this app for three weeks, on their actual terms — skipping days, changing their mind, getting bored, hitting a wall — what would they genuinely experience?** Some of that you'll find by reading code. Some of it requires you to simulate the passage of time by manipulating stored data directly, the same way a real returning user's data would look, and then trace what the app does with it.

**This has real value only if you're honest about the limits of tracing from code.** You cannot know for certain how something *feels* on a screen you haven't rendered — you can know, with precision, what the code produces, what data it reads, and where it silently fails or falls back to something generic. Say which is which, always.

---

## 2. The two personas for this wave

Sourced directly from `alongside_persona_usecase_matrix_05jul2026_v2.md` — read this document in full before starting, don't work from the summary below alone. Do not invent personas beyond these two for this wave.

### Persona A — 2.12: Non-active adult, early 30s, no starting point

Sedentary desk job. No injury, no diagnosed condition, no athletic past. Wants to start but has genuine decision paralysis — "I should exercise," with nothing specific to anchor onto. **Move (free) tier.**

**Why this one matters most:** every other persona in the matrix gives the coach *something* to personalise against — an injury, a goal, a history. This one has nothing. It's the real test of whether onboarding and the coach genuinely produce something tailored, or fall back to generic content the moment personalisation data runs out. The matrix flags this explicitly as unverified.

### Persona B — 2.15: Fit mid-20s, strength-focused, gym-literate

Gym four times a week, understands progressive overload, wants to track lifts and see numbers move. Doesn't need coaching on form or motivation — wants programming and visible progress. **Matrix-assigned tier: Personal.** Run her on **Move first, deliberately** (see Section 5) — the matrix's own open question about her is "whether Move alone can retain a genuinely fit, experienced user, or whether she disengages without visible progression from the very start."

---

## 3. Access — read-only, no credentials needed

The repo is public. `git clone https://github.com/build-new-habits/alongside-app.git` works with no token, or fetch individual files via `raw.githubusercontent.com`. **You do not need write access for this session** — you are reading code and simulating data, not shipping fixes. If you find yourself wanting to run the actual app in a browser rather than trace the source, that's a reasonable instinct but not the primary method here — this exercise is about tracing what the *code* would do, precisely, not a live device session.

`Documents/Admin/master_schedule.md` is the canonical current state of the whole project — read it in full before starting, so you understand what's genuinely live versus still in progress. Don't assume anything about feature status from this brief's own descriptions without checking the schedule and the code directly — this brief was written 11 Aug 2026 and the app moves fast.

---

## 4. Method — simulating the passage of time

You cannot wait three weeks. You need to simulate it precisely, the same way real return-visit state would look, then trace what the code does with that state — not imagine what "probably" happens.

**Technique:** clone the repo, and using Node (the app's `store.js` can be loaded standalone with a `localStorage` stub — check `js/store.js`'s `init()` for the exact shape it expects), construct realistic backdated state for each persona: `checkinHistory` entries with real gaps matching their profile's likely pattern, `activityLog` entries showing what they actually completed, `conditionPainScores`/`conditions` if relevant, onboarding fields, tier, equipment. Then trace — by reading the actual view files — what each screen would render against that exact state, at each simulated "day."

**Design a realistic three-week timeline per persona before you start tracing**, matching their profile, not a tidy even pattern. For Persona A (decision paralysis, blank slate): expect a hesitant, stop-start pattern — maybe two sessions in week one, nothing for four days, one wellbeing visit instead of exercise, a false start. For Persona B (gym-literate, self-directed): expect near-daily gym use early on, then a real test of whether the app still has anything to offer once the novelty of "a new app" wears off around day 10-12 — this is exactly where her "would she disengage" question should get tested.

**Same-day return, explicitly:** for at least one simulated day per persona, trace what happens if they complete a session, then reopen the app later the same day — does check-in gating behave correctly (only the day's first session should force it), does anything wrongly suggest they haven't done anything today, does the Home screen correctly reflect what already happened?

---

## 5. Persona B's tier switch — trace it as one continuous journey, not two separate tests

Don't test her once as free and once as Personal in isolation. Trace her real timeline: start on Move, let her hit whatever wall she's going to hit (or find she doesn't), then simulate her upgrading to Personal partway through the three weeks, and trace what genuinely changes for her from that point on — what she can now do that she couldn't, whether it was worth it from her specific perspective, not a generic tier-comparison table. Confirm what's actually tier-gated in the live code first (`js/auth.js`'s `isPremium()`, and anywhere else tier is checked — search for `store.get("tier")` and `store.get('tier')` across `js/views/`) rather than assuming the pricing docs' description of what Personal includes is what's actually live — some of that has been found to be aspirational-not-built before, more than once. Check current reality, don't assume.

---

## 6. What to actually trace — the real surface area

Not every persona needs every surface, but check what's genuinely relevant to each one's profile, and don't skip Wellbeing/Progress/Settings even for personas who'd primarily use the exercise side — the brief that led to this exercise specifically asked for those to be explored regardless:

- **Home** — the six-door screen, plus "Unsure? Coach decides"
- **Check-in flow**, including whether it's genuinely once-per-day-gated or asked redundantly
- **Coach Proposal** — does it feel tailored or generic, especially for Persona A
- **Library** and the **Gym Session Builder** (all five focus types, the three build modes — Coach builds it / Coach recommends / Build your own — the allocation presets, the location step)
- **`gym-programme.js`** if either persona would plausibly follow a structured programme — this file was rebuilt yesterday (11 Aug) to a new one-exercise-at-a-time flow and is explicitly **not yet on-device confirmed** — a fresh trace of it is valuable, not redundant
- **Mobility & Conditioning** and **Wellbeing/Noticing Hub** — explicitly requested, don't skip
- **Progress** — what the 7-day (free) vs 30/90-day (Personal) views actually show, confirmed against real code, not assumed
- **Settings** — equipment (does it show what's actually saved, per the 10 Aug fix), coach voice (confirm it's genuinely Nurturing-only with no picker), any tier/account info

---

## 7. Style and consistency — woven in, not a separate pass

A structural design-consistency audit already ran once (`alongside_design-audit-half-a-findings_04aug2026_v1.md` — read it, don't repeat its ground). As you trace each screen a persona would actually land on, note anything that looks or feels inconsistent with the rest of the app — different visual treatment for what should be the same kind of thing, a screen that feels like a different product. Note it in place, attached to the moment in the persona's journey where they'd hit it — don't produce a separate generic style report disconnected from the narrative.

---

## 8. The three deliverables

Write all three as separate files. Do not blend them — they have different audiences and different standards of evidence.

### 8a. Technical report — for a build chat to act on

Same discipline as any build blueprint in this project: every claim backed by an exact file and line reference, or a specific traced code path. Explicitly separate **"confirmed via code trace"** from **"would need on-device confirmation to be certain"** — don't blur the two. Structure: one section per genuine bug/gap found, each with severity, evidence, and which persona/moment surfaced it. No prose narrative here — this is a punch list a technical Claude session can pick up and fix without needing to re-derive anything.

### 8b. Plain-language summary — for Graeme, no jargon

What did we find, why does it matter, in sentences a non-technical person reads once and understands. No file names, no code terms, no "field mismatch" — describe what the *user* would have experienced instead ("the app showed the wrong information here" rather than "entry.createdAt was undefined"). This is the version he could show someone else without translating it first.

### 8c. Narrative — the persona's actual story

Written the way `alongside_canopy_pitch_and_personas_24jul2026_v1.md`'s walkthroughs are written — close, specific, grounded in what was actually traced, not generic flavour text. Cover: what they liked, what they didn't, what they used heavily versus never touched, what they'd say they valued if asked, and — for Persona B specifically — her honest, specific verdict on whether Personal tier was worth it from where she was standing, not a marketing angle. **Every claim in this narrative must trace back to something you actually found in Sections 4-7** — if you're inferring an emotional reaction, say plainly that you're inferring it from a traced behaviour, not stating it as observed fact.

---

## 9. What "done" looks like

- A realistic three-week simulated timeline exists for both personas, built from manipulated store data, not imagined
- Every major surface in Section 6 traced for both personas, including at least one same-day-return moment each
- Persona B's tier switch traced as one continuous journey with a genuine before/after
- Style/consistency observations woven into the trace, not separated out
- Three distinct files produced, each meeting its own section's standard
- Every technical claim traceable to a specific file/line or a specific simulated state — nothing asserted without evidence

---

## 10. What to bring back

All three documents, plus a short note on which of the two personas surfaced more genuine problems and why — useful for deciding what Wave 2 should prioritise. If anything in this brief turns out to be based on stale assumptions once you're actually in the code (feature status, tier boundaries, anything), say so plainly rather than working around it silently.

---

*Build New Habits · Alongside: Move · Persona Tracing Brief · 11 Aug 2026 v1*
