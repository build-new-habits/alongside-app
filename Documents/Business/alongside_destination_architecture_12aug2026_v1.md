# Alongside: Move — Destination Architecture
## 12 Aug 2026 v1

Build New Habits | How a person names where they're going, how the coach builds the road, and how the road moves when life does. This is the specification for the paid tier's spine.

Companion to `alongside_tier_boundary_12aug2026_v1.md` (why someone pays) and `alongside_experience_blueprint_22jun2026_v1.md` (the map of the park).

**Status: specification, not built.** `programmes.js` holds eight fixed programmes and `programmeEngine.js` tracks weeks and phases. Neither is a destination-driven adaptive road. This is a real build.

---

## 1. The principle

> **Free is the session. Personal is the plan.**

A plan requires a destination. Without one there is nothing to build a road to — which is why the boundary is honest rather than withheld: for someone who has not named a destination, the plan does not exist.

**Naming a destination is the paid act.** This holds identically for body and mind. Free users have full access to everything in Wellbeing — In Step, the empathy arc, grounding moments, journalling — but no personal journey through it. Same rule, no exceptions to explain.

---

## 2. What a destination is

### 2.1 The trap to avoid

There are infinite human *reasons*: ready for the beach, a wedding in June, a marathon, a walking holiday, mostly sedentary and need to move more, back after a heart scare. Free-text parsing of those reasons is not viable — the interpretation burden is unbounded and the failure mode is a coach that misunderstands you, which is worse than one that never asked.

### 2.2 The insight

**The app does not need the reason. It needs the training implication.**

"Ready for the beach" and "wedding in June" are the *same training problem* once you ask one more question. Infinite reasons collapse into a small set of **shapes**. Branching logic gets there in three questions.

### 2.3 The ten shapes

**Body**

| Shape | The training problem | Maps from existing goals |
|---|---|---|
| **Endurance** | Sustain effort for longer | `improve-cardio`, `start-running`, `run-5k`, `run-10k`, `cycling`, `swimming` |
| **Strength** | Produce more force | `get-stronger`, `build-muscle` |
| **Return** | Rebuild after injury, illness or a long gap | `mobility-recovery` cluster |
| **Consistency** | Show up regularly at all | `build-habit` |
| **Composition** | Change how the body is made up | `lose-weight`, `tone-up` |
| **Preservation** | Keep what you have — mobility, independence | (no current goal maps cleanly — gap) |

**Mind**

| Shape | The problem | Maps from existing goals |
|---|---|---|
| **Steadiness** | Less reactive, more regulated | `reduce-stress`, `improve-mood` |
| **Restoration** | Recovering from burnout or depletion | (no current goal — see §7) |
| **Presence** | Attention; being here rather than elsewhere | (partially `feel-better`) |
| **Connection** | Noticing other people; the empathy arc as a named road | (none — entirely new) |

### 2.4 Destinations carry both

**Most real destinations are body and mind at once.** "Ready for the wedding" is frequently as much Steadiness as Composition. "Back after burnout" is Restoration and Return together.

A destination therefore holds **one body shape and/or one mind shape**. The branching must permit both and must never force a choice between them. A mind-only destination is entirely valid and must not be treated as a lesser answer.

**This is not a category addition. It is a correction.** An earlier draft of this architecture offered body shapes only — which reproduced exactly the mind/body split the product exists to refuse.

---

## 3. The branching

Three questions. Never more. Each has a "not sure" path that reaches a valid destination rather than a dead end.

### Q1 — Is there a date?

> *"Is there something specific you're working toward? A day in the diary, or just something you want to get to?"*

- **A date** → *dated road*. Backwards-planned from the date. Phases sized to fit
- **No date** → *open road*. Milestone-driven, no end point, adapts indefinitely

### Q2 — What does ready mean to you?

The shape-finder, and the question that collapses infinite reasons into ten shapes. Asked in the person's terms, not ours.

> *"When you get there, what do you want to be able to do?"*

Chips, single or multi-select:

| Chip | Shape |
|---|---|
| Keep going for longer without flagging | Endurance |
| Lift or carry more | Strength |
| Get back to where I was | Return |
| Just do it regularly | Consistency |
| Change how I look or feel in my body | Composition |
| Keep what I've got | Preservation |
| Be less on edge | Steadiness |
| Have something left in the tank | Restoration |
| Be here, rather than somewhere else | Presence |
| Notice other people more | Connection |

**Free text is offered and echoed, never parsed.** *"Tell me in your own words if you'd rather"* — stored verbatim, replayed for context (*"You said you want to feel like yourself again at the wedding. I've got that."*), and never interpreted. Recommendation still comes from the chips.

### Q3 — Where are you starting?

**Already answered.** Capability screen, `trainingIntent`, conditions, `lifestyle.activityLevel`. Do not re-ask. If capability was skipped, ask then — not before.

### Q1–Q3 produce

```
destination = {
  dateISO,               // null for open roads
  bodyShape,             // one of six, or null
  mindShape,             // one of four, or null
  ownWords,              // verbatim, never parsed
  namedAt
}
```

---

## 4. Building the road

**Dated road.** Work backwards. Sized to the weeks available, phased — base, build, sharpen, taper — with phase proportions varying by shape. A 6-week road and a 6-month road to the same shape are different roads, not the same road compressed.

**Open road.** Forward phases with milestones instead of an end. Advances on demonstrated capacity, never on the calendar alone.

**Every session carries its place on the road.** This is the paid experience, felt every single session:

> *"Week three. Today's a lighter one on purpose — you went hard on Saturday, and the point of this week is recovery, not effort."*

**Mind-shape roads have no finish line and must not manufacture one** — see §6.

---

## 5. The road moves when life does

### 5.1 A gap is a question, not a reset

Nothing resumes silently after a gap of a week or more. Silence here is not neutral — it is dangerous. Someone returning from a hamstring tear who is picked up where they left off gets reinjured, because the conditions page was never updated.

The coach asks. Warmly, once:

> *"You've been away a couple of weeks. No problem at all — but it helps me to know roughly what happened, so I can pitch this right."*

Chips: **Illness · Injury · Life got busy · Away · Didn't feel like it**

**"Didn't feel like it" must be an offered option and must be met with zero friction.** Behaviour is communication. The person who selects it is telling the coach something valuable, and this product does not punish honesty.

### 5.2 What each branch does

**Injury** → the one place the coach is firm, because the alternative is harm. Not a redirect — an offer to work around it: *"Tell me what's going on and I'll build around it."* Straight to conditions capture.

**Illness, life, away, didn't feel like it** → the coach explains its thinking, recommends, and hands over the choice.

### 5.3 Re-entry: how fast, not where

**An earlier draft said "illness → rebuild base."** That was prescriptive and wrong on the facts. Week 12 does not become week 1 because of a chest infection.

The real question is not *where do you restart* but **how fast do you come back**. You do not return to week 12's *load* — but you have not lost week 12's *base* either.

> *"Two weeks out with that. Your fitness hasn't gone anywhere — but the first sessions back will feel harder than they should, and that's normal rather than a sign of anything.*
>
> *I'd pick up around week ten and work back up over a fortnight. But you know how you feel better than I do — want to go straight back in at twelve, or take it slower than that?"*

**Reasoning stated. Recommendation given. Choice theirs.** Then it adapts again from what actually happens in the first session back — a stated plan that ignores the evidence of the first session is not adaptive.

Ramp heuristic, to be tuned: gaps under 1 week, no change. 1–3 weeks, step back ~15% of elapsed progress, recover over the same number of weeks as the gap. Over 3 weeks, offer a genuine restart as one option among several — never imposed.

---

## 6. Mind progress — the coach does not measure

### 6.1 The model

A psychologist does not score their client. They invite practice; the client keeps the journal; the journal belongs to the client. If they want to show it to a professional, that is their choice.

**Applied here: the coach creates the opportunity. The record belongs to the person. Nothing is measured.**

This is not a limitation. It is the only defensible design — scoring someone's mental state would be the single worst thing this product could do, and **P4** forbids interpretation anyway.

### 6.2 What Personal actually provides for a mind shape

- **Prompts that create the moment** — placed with intent, deepening over months, shaped by what the person has been noticing
- **Somewhere to put it**, if they want it. Journal, diary, or nothing at all
- **Export**, so a real professional could read it if the person chooses
- **No score. No streak. No progress bar. No verdict.**

Model prompts, in the register agreed:

> *"Have you noticed anyone struggling today?"*
>
> *"Did you find yourself adjusting how you were, so someone else could be at their best?"*

**Neither requires an answer.** Someone who walks away thinking *"huh — I hadn't thought about that"* has had a complete outcome. Someone who writes 500 words has also had a complete outcome. Neither is better and neither is recorded as better.

### 6.3 Journal Privacy Rule — unchanged

Journal entries are **never** subject to signal detection. No exceptions. Nothing in this architecture touches that.

---

## 7. Restoration — declaration, not gate

### 7.1 The position

**Crisis is not burnout.** Crisis is acute, clinical, and outside what this product does. Burnout is a sustained state that mindful practice and deliberate life choices genuinely help with — a position supported both by Claire Plumbly's published work and by direct founder experience.

Restoration is **structured practice with rationale attached**, plus a plain declaration of what it is not. That is defensible. It is not gated.

**An earlier draft proposed holding Restoration behind safeguarding sign-off. That was over-cautious and is withdrawn.**

### 7.2 What is required

**A declaration that is not a one-time footnote.** Someone naming Restoration on a good day may be somewhere very different in week six. The declaration appears at naming, and remains accessible throughout the journey — not buried in terms.

> *"I'm a coach, not a clinician. I can't give medical or psychological support, and I'm not a substitute for someone who can.*
>
> *What I can do is the practical side — mindful practice, deliberate choices, and somewhere to put what you notice.*
>
> *If things are harder than that, please talk to someone properly qualified."*

With a visible route to real help — NHS 111, GP, Samaritans, Mind — one tap, always reachable, never buried.

**Crisis detection stays live throughout.** `alongside_crisis_safeguarding_policy_23jul2026_v7.docx` must be explicitly wired to this journey, not assumed to cover it.

**Copy rule, written into the spec rather than left to whoever writes the prompts: company on the road, never recovery.** Never *"get through burnout"*. Always *"somewhere to put this while you do."* The product does not promise an outcome it cannot deliver and must not imply clinical efficacy.

---

## 8. Free — the drop-in coach

The boundary is not "coach decides" versus "you choose." It is closer to a human coach than that, and it comes from the track:

> *"He'll probably ask me — do you want to do the stuff you did last time, or something different?"*

**Free is: the coach decides, but asks the one question a human coach would.**

After check-in, three options:

> *"Want to do something like last time, or shall we do something different today?"*
>
> **Something like last time · Something different · Mix it up**

This gives free genuine variety, uses the continuity data that already exists (`exerciseHistory`, `sessionVariety`), and is unmistakably a *coach* rather than a generator.

**And it keeps the boundary honest.** He asks about *last time*. He never asks about *March* — because you have not told him about March.

Free sessions must vary. Identical Monday/Wednesday/Friday is a *poor* session, not a limited one, and nobody returns for week two.

---

## 9. The door — always open

Per `alongside_tier_boundary_12aug2026_v1.md` §6. Visible at all times, never triggered by our judgement of readiness, walked through when the person chooses.

**In Step is free, and is the best door in the product** — because someone who has just finished a scenario has *felt* the shape of the thing.

> *"That's In Step — four movements, one thing at a time, each going a bit deeper.*
>
> *There's a longer version of the same idea. You pick something you'd like to get better at — being steadier, being more present, noticing other people more — and I build it out over months, shaped around what you're actually noticing rather than a fixed course.*
>
> *That's part of the paid plan, if you ever fancy it."*

Deliberately soft, because it fires straight after something reflective and a hard call-to-action would break the moment.

---

## 10. Copy rules — non-negotiable

Three rules, each earned from a specific mistake made while writing this specification.

**10.1 Never use an internal term in user-facing copy.**
*Destination, shape, journey, arc, empathy transfer, Connection journey* — all ours, none theirs. A draft offer read *"A Connection journey works the same way"*, using a term invented an hour earlier that no user has ever seen.

**10.2 Every offer answers three questions, in order: what is it, what would it do for me, how do I get it.**
The same draft answered the first, half the second, and none of the third.

**10.3 The read-it-cold test.**
Read every user-facing line as someone who has never seen this document. If a phrase only makes sense because of something we decided, it fails. This test caught *"I don't know where yours is"* in the check-in openings, and it caught the Connection line above.

Also carried from existing locked principles: **P1** the coach never sells — offers come from the visibly distinct helper layer. **P4** the app may display, the coach never interprets.

---

## 11. Build sequence

| # | Item | Depends on |
|---|---|---|
| 1 | **Schema** — `destination{}`, road state, re-entry state | — |
| 2 | **Branching UI** — Q1/Q2, free-text capture, shape resolution | 1 |
| 3 | **Road builder** — dated and open, phased by shape | 1, 2 |
| 4 | **Session-to-road connection** — every session states its place | 3 |
| 5 | **Re-entry** — gap detection, the question, the ramp | 3 |
| 6 | **Mind roads** — prompt sequencing, journal, export | 1, 2 |
| 7 | **Restoration** — declaration, help routing, crisis wiring | 6 |
| 8 | **Free drop-in question** — last time / different / mix | independent, can run first |

Item 8 is independent of everything else, improves the free tier immediately, and is the cheapest thing here. **Recommend building it first** regardless of when the paid spine starts.

---

## 12. Open questions

1. **Preservation has no existing goal that maps to it** — and it is likely the most common real destination for older users. Needs a goal added, in the person's words, never inferred from age.
2. **Multi-shape roads** — how does a road serve Endurance *and* Steadiness simultaneously? Alternate sessions, or a body road with mind prompts woven through? Recommend the latter, needs confirming.
3. **Destination change mid-road.** People change their minds. Does the road rebuild, or fork?
4. **Ramp heuristics in §5.3** need real tuning, ideally against beta data rather than intuition.

---

*Build New Habits · Alongside: Move · Destination Architecture · 12 Aug 2026 v1*
