# Alongside: Move — Assessment, Reassessment and Self-Direction

## Blueprint · 15 Aug 2026 v1

Build New Habits | From Graeme, 15 Aug: *"There needs to be a better baseline assessment of fitness, and like a teacher would, milestone assessments to ensure the programme is the right fit."* And: *"2.4 — there should be that ability to do that though, coach supported through recommendations, or free hand."*

---

## 1. Why this is the keystone, not a nice-to-have

Three fields describe the person's level today. **None of them measures capacity, and none of them can move.**

| Field | What it actually is | Writer |
|---|---|---|
| `lifestyle.activityLevel` | Self-reported **frequency** — how often you move | Onboarding step 9 |
| `capability.*` | What you **can** do — chair, floor, balance. Safety, binary | Onboarding steps 9a–9d |
| `fitnessLevel` | Same vocabulary as activityLevel, overrides it when set | **Settings only** |

The difficulty ceiling resolves as `fitnessLevel || activityLevel || "moderate"`. So **how hard your sessions are is decided by how often you say you exercise** — a proxy for capacity, not a measure of it. And the only way it ever changes is if you go into Settings and change it yourself.

Two consequences that have both shown up in tracing:

**A twelve-week programme cannot progress anyone.** Phases declare an `intensityBias` that climbs, but the ceiling it operates under never moves. PROG-1 tried to add phase preference and it was the wrong end of the problem — a preference inside a fixed ceiling is decoration. **Reassessment is what makes twelve weeks mean twelve weeks.**

**Capable people are under-served invisibly.** Persona 2.6, active, full gym, ceiling 6 — served a mean difficulty of 1.80. Nothing ever finds out what he can do, so nothing ever pushes toward it.

This is also the answer to persona 2.4. An assessment gives a self-directed person the one thing they cannot do for themselves: an outside read. She does not need deciding for. She might well want measuring.

---

## 2. What an assessment must not become

The whole product refuses to grade people. An assessment is the single feature most likely to break that, so the constraints come before the design.

**It is calibration, never a test.** For personas 2.5, 2.8, 2.13 and 2.11, a "fitness test" is precisely the shame trigger they came here to escape. The framing is *"so I know where to start you"*, never *"let's see how you do"*. There is no pass, no fail, no percentile, and nothing is ever compared to anybody else.

**No score, ever.** A number invites comparison and becomes a target to defend. Same reasoning that keeps personal bests off by default and killed the streak. What is shown is what it **changes**: *"That tells me to start you around here."*

**Skippable, with no penalty.** Skipping falls back to self-report exactly as today. Somebody who declines has not opted out of a good experience.

**It is a session, not a chore.** The worst version is a separate screen of tests before you are allowed to train. The best version is that the first session *is* the assessment, and the coach says so.

**Reassessment is an offer, never a gate.** *"Shall we see where you are?"* — not *"reassessment due"*. Declining continues the programme unchanged.

**It can lower as well as raise.** Somebody coming back after illness gets an honest read down, framed without loss. If it only ever ratchets up it becomes another thing to fall behind.

---

## 3. The design

### 3.1 Baseline — `assessment.baseline`

Runs as the first session of a programme, or on request. The coach names three or four movements it already serves and asks how they went, using the vocabulary the app already has rather than inventing a new one:

- a squat pattern — *comfortable / hard work / not today*
- a push pattern — same
- a hinge or carry — same
- optionally a two-minute continuous movement — *easy conversation / breathing hard / had to stop*

Four taps, inside a session she was doing anyway.

**Output is a `measuredLevel` on the existing five-value vocabulary** (`sedentary | light | moderate | active | very-active`), so nothing downstream needs to learn a new scale, and `fitnessLevel` gains its first non-Settings writer.

### 3.2 Reassessment — `assessment.history[]`

Offered at phase boundaries — weeks 4, 8 and 12 of a twelve-week programme, which is where `phases[]` already changes. The same three or four movements, so the comparison is real.

The coach reports **what changed and what it unlocks**, not a number:

> *"The squat was hard work in week one and it's comfortable now. That opens up a few things I've been holding back."*

That sentence is the product's answer to *"is there more?"* — more arrives because you earned it, visibly, in your own words.

### 3.3 Self-direction — persona 2.4

A third mode alongside the existing doors:

- **Coach-led** — today's default. The coach decides.
- **Coach-supported** — the coach recommends, she chooses. Recommendations shown with reasoning, nothing auto-selected.
- **Free hand** — she builds it. The coach stays quiet except where safety applies: the capability gates, the condition filter and the clearance question are **not** optional in any mode.

Assessment matters most in this mode. A self-directed person is not buying decisions; she is buying an outside read on herself. That is also a defensible Personal-tier feature in a way "we choose your workout" never will be for her.

---

## 4. Schema (schema-first, per protocol)

```
assessment: {
  baseline:    { at, measuredLevel, results: { squat, push, hinge, endurance } } | null,
  history:     [ { at, week, measuredLevel, results, changedFrom } ],
  lastOfferedAt: null,     // reassessment offer throttle
  declined:      false     // skipped baseline — never ask twice in a programme
}
sessionMode: 'coach-led' | 'coach-supported' | 'free-hand'   // default 'coach-led'
```

`fitnessLevel` stays the field the engine reads. Assessment becomes its authoritative writer; Settings remains an override, because somebody who disagrees with the read must be able to say so.

---

## 5. Build order

1. **Schema + `measuredLevel` writing to `fitnessLevel`.** Nothing visible; makes the ceiling movable for the first time.
2. **Baseline inside the first session.** Four taps, skippable.
3. **Reassessment at phase boundaries**, offer not gate, with the what-changed line.
4. **Retry PROG-1** — now against a ceiling that moves. This is the point at which phase intensity is worth wiring to the second door.
5. **`sessionMode`**, and the filter library that free-hand needs to be worth using.

**One and two are worth doing before anything else in the product**, because every progression conversation stalls on the same thing: nothing knows where the person is.

---

## 6. On the library, recorded because Graeme corrected the framing

> *"I'm adding so we can better serve, not compete."*

That is the right test and better than my version. The distinction that matters is **filter depth**, not catalogue size: enough at each difficulty and equipment combination that the engine has real choice, rather than matching anybody's exercise count.

Concretely, the shortage is at the top: 29 of 551 entries above difficulty 3, against 393 at 1–2. Roughly 40–60 well-chosen entries at difficulty 4–6 would give the engine somewhere to progress people **to** — which is the same gap assessment exposes from the other side. The two pieces of work are the same piece of work.

---

*Build New Habits · Alongside: Move · Assessment, Reassessment and Self-Direction · 15 Aug 2026 v1*
