# Alongside: Move — The Rehab Front Door

## Blueprint · 16 Aug 2026 v1

Build New Habits | **STATUS: NOT FOR BUILD. Requires a physiotherapist's review before any of it ships.**

---

## 0. Why this document exists, and what it is not

Graeme raised this on 15 Aug and it was immediately the strongest differentiation of that day: **a front door for people who come to movement because something hurts.**

This document is the spec, the reasoning, and the questions a physiotherapist needs to answer before a line of it is built. It is deliberately written so that a clinician who has never seen the product can read it cold.

**What Alongside is not, and this must not drift:** Alongside is not a treatment service, not a diagnostic tool, and not a substitute for assessment. It is a coaching product that adapts general movement to how somebody says they feel. The rehab front door does not change that. It changes *how somebody enters* the product, not what the product is qualified to do.

The existing cardiac scope sets the precedent and the ceiling: **Phase IV maintenance, not treatment.** The rehab front door should sit at the same altitude.

---

## 1. The person this is for

Not a hypothetical. Graeme's own case is the design case: **nine months of pain**, and every mainstream fitness product either ignores it or refuses him.

Three people arrive at this door and they need three different answers.

| | Who | What they need |
|---|---|---|
| **A** | Something hurt recently and is settling | Movement that works around it, and does not make it worse |
| **B** | Something has hurt for months and has been seen by a professional | To keep moving *within* what they were told, without re-litigating it every session |
| **C** | Something has hurt for months and has **not** been seen | A route to a professional — offered as a door, never as a refusal |

**C is the one that matters most and is the easiest to get wrong.** A product that says "see a physio" and stops has abandoned somebody at the exact moment they finally asked for help. A product that says nothing and programmes around it may delay a diagnosis that matters.

---

## 2. The two principles Graeme set, and why

### 2.1 Name the CHAIN, never the condition

The door is not "Knee Rehab". It is the movement chain: *lower limb*, *spine*, *upper limb*.

**Why this is a safety decision, not a branding one.** Naming a condition implies the product has identified it. It has not — the person typed it in. "Knee programme" reads as a clinical claim about a knee. "Work around your lower body" reads as what it actually is: general movement, adapted.

It is also more honest to the biomechanics. Pain in one place is regularly driven by something adjacent, and a product organised by named conditions invites the person to treat their own guess as a diagnosis.

**The data already supports this.** `conditions.js` v2 carries a `zone` field on all 29 conditions — `lower-limb`, `spine`, `upper-limb`, `systemic` — with `getZoneStatus()` already resolving zone-level status from pain scores. The chain framing is not new work; it is surfacing a model that already exists.

### 2.2 Chronic routes to a professional as a REDIRECT, not a refusal

Graeme: nine months. That is not a niggle, and a product that programmes around it as though it were is doing something worse than nothing.

**But the difference between a redirect and a refusal is everything**, and it is a difference in what happens next, not in tone:

- **A refusal** ends the interaction. The person came for help and left with a rule.
- **A redirect** hands them something *and* opens a door. They still get movement that is safe for them today, and they get a clear, warm, specific route to somebody qualified.

The person must never be locked out of the app because they answered a question honestly. **If answering honestly costs you access, people stop answering honestly** — which destroys the safety data the whole system runs on. This is the single most important behavioural constraint in this document.

---

## 3. What already exists, checked rather than assumed

Verified against the live repo, 16 Aug 2026.

| Capability | State |
|---|---|
| 29 conditions with `zone` (lower-limb / spine / upper-limb / systemic) | **Live**, `conditions.js` v2 |
| `getZoneStatus()`, `getActiveConditionIds()`, `getExerciseSafetyTier()` | **Live** |
| Pain score per condition, 0–10 continuous, `getPainBand()` | **Live** |
| **Severe zone override** — any severe pain zone bypasses the whole workout pool and returns a single Gentle Care card (breathing, mindfulness, mindful walk) | **Live**, `workoutGenerator.js` v1.3 |
| Rehabilitation exercise library, phase-tagged `acute` / `subacute` / `maintenance` | **Live** — 95 exercises: 20 acute, 56 subacute, 19 maintenance |
| `prescribedExercisesOrigin`: `'professional'` \| `'self'` \| `null` | **Live** — the product already distinguishes an exercise a clinician gave you from one you chose |
| `conditionGoals`: `'healed'` \| `'cope'` \| `'improve'` + note | **Live** — Graeme's framing: *"feel healed, or more able to cope, or improved"* |
| Condition programme builder, cross-condition exercise reuse | **Live**, `conditionProgrammes.js` v3 |
| `exerciseClearance`: `'cleared'` \| `'not-yet'` \| `'not-sure'` \| `null` | **Live** (CARDIAC-1) — gates loaded strength only; `null` means NOT ASKED and is never read as "not yet" |

**The honest summary: most of the machinery exists. What does not exist is the front door, the duration question, and the redirect.** That is a smaller build than it looks, which is exactly why the review must come first — the constraint here is clinical judgement, not engineering.

### 3.1 Library coverage, which the physio should see

Rehab exercises by area (`affectsAreas`, 95 entries, an exercise may serve several):

- **Well covered:** glutes 32, hamstring 22, lower-back 21, hip 14, quadriceps 14, calves 12, shoulder 11, abdominals 11
- **Thin:** knee 9, achilles 7, upper-back 7, ankle-foot 6, wrist-elbow 5, rotator-cuff 4, pelvic-floor 4
- **Almost absent:** IT band 3, hip flexor 3, shin splints 2, sciatic nerve 1, adductors 1, chest/pecs 1, thoracic 1

**The lower limb and lumbar spine are genuinely served. The upper limb is not.** A shoulder door would currently be a thinner experience than a hamstring door, and the person cannot tell which they are getting.

---

## 4. The proposed design

### 4.1 The door

A single entry on Home: **"Something hurts"** — or the physio's preferred wording. Deliberately plain, deliberately not clinical, and it must not read as a warning sign.

It leads to a short conversation, not a form. The coach speaks first, as everywhere else in the product.

### 4.2 The three questions, in this order

**Q1 — Where?** Answered by chain, not by condition: *lower body*, *back or neck*, *arms or shoulders*, *something else*. Maps to the existing `zone` field.

**Q2 — How long?** This is the question the whole design turns on. Proposed bands:

- Days
- Weeks
- **Months** → the redirect path
- On and off for a long time → **the hardest case, see §6 Q4**

**Q3 — Has anyone looked at it?** Maps to existing fields: a professional's exercises (`prescribedExercisesOrigin: 'professional'`) sit above anything the product would choose, and are never overridden by it.

**Nothing here asks for a diagnosis, and nothing offers one.**

### 4.3 What happens next

| Answer | Outcome |
|---|---|
| Recent + not seen | Movement adapted to the chain. Gentle, and the coach says why it is gentle. |
| Recent + seen | As above, with the professional's exercises given priority. |
| **Months + seen** | Movement within what they were told, plus a prompt to check in with that professional if things have changed. |
| **Months + NOT seen** | **The redirect.** Movement they can safely do today, *and* a clear route to a professional, offered warmly and repeated at sensible intervals — never a block. |
| Severe pain today | **Already live and unchanged:** the Gentle Care card. This design does not touch that path. |

### 4.4 What the coach says at the redirect — draft, for the physio to correct

> "You have said this has been going on for months, and nobody has looked at it yet. I can keep you moving in ways that should be comfortable — but something that has lasted this long is worth having somebody qualified actually look at. It is not that I will not help; it is that they can do something I genuinely cannot."

**Register notes for whoever revises this:** no therapy-speak, no alarm, no implied diagnosis, and it must not imply the person has done anything wrong by not going. Invitational, not instructive — *"worth having somebody look at"* rather than *"you must see a physio"*.

---

## 5. What this design deliberately refuses to do

Recorded so the physio can challenge the refusals as readily as the inclusions.

- **No diagnosis, no triage, no red-flag screening questionnaire.** Screening implies competence to act on the result. *(But see §6 Q1 — this is the refusal most likely to be wrong.)*
- **No progress metric on pain.** No "your knee is 40% better". Pain scores drive exercise selection and are shown back as the person's own record, never as a score to improve.
- **No claim of therapeutic effect.** The product never says an exercise will heal anything.
- **No lock-out.** Answering honestly never removes access.
- **No condition names as programme names.** §2.1.

---

## 6. Questions for the physiotherapist

These are the blockers. Everything above is provisional until these are answered.

**Q1 — Red flags. Is the refusal to screen defensible, or is it the wrong call?**
The design deliberately asks no screening questions (night pain, unexplained weight loss, bladder or bowel change, saddle anaesthesia, trauma, fever, neurological deficit). The reasoning: asking implies competence to act on the answer, and a false reassurance is worse than no question. **The counter-argument is obvious and may well be stronger — that a handful of specific questions, with a single unambiguous "please seek urgent advice" outcome, is a duty rather than an overreach.** If so, we need to know exactly which questions, exactly what the app should say, and exactly how urgent it should sound.

**Q2 — Is "months" the right threshold for the redirect?** Twelve weeks is the common chronic-pain definition. Six weeks is a common physiotherapy review point. What should the band be, and should it differ by chain — is a shoulder that has hurt for six weeks a different case from a lower back that has?

**Q3 — Is chain-not-condition clinically sound, or is it hiding something that matters?** We think it is more honest. Is there a case where it is actively unsafe — where working "the lower limb" while a specific structure is irritated does harm that a condition-specific route would have avoided?

**Q4 — The recurrent case: "on and off for a long time."** Not acute, not straightforwardly chronic, and probably the most common honest answer. What should happen? Is it a redirect, a normal path, or something else?

**Q5 — Professional-prescribed exercises are given priority over anything the app would choose, indefinitely, with no expiry.** Is that right? Should the app ask, after some period, whether those exercises are still current? If so, when — and how does it ask without undermining the clinician?

**Q6 — Post-surgical.** Currently no path at all. Should the door screen for it and route out entirely, or is there a safe band with sufficient time elapsed and clearance obtained?

**Q7 — Hypermobility/EDS, fibromyalgia, chronic fatigue/ME-CFS.** All three exist as conditions today and all three are systemic rather than chain-based. Should they route through this door at all, or does a load-and-pain model actively mislead for them? **Post-exertional malaise in ME-CFS is a specific worry: a product that adapts to how you feel *today* may push somebody into a crash tomorrow.**

**Q8 — What must never appear on screen?** Any wording, framing or feature that a physiotherapist would consider a red line for a non-clinical product.

**Q9 — The upper limb gap (§3.1).** Should the door offer arms and shoulders at all until the library is deeper, or open with lower limb and spine only?

**Q10 — Referral routing.** When the app redirects, what should it actually say — self-refer to NHS physiotherapy, GP first, private? This varies by nation within the UK and we would rather be accurate than generic.

---

## 7. What Graeme should ask for alongside the answers

1. **Willingness to be named**, or not, in the product's safety page. Sarah Brady is an informal adviser only; three formal safeguarding reviewer roles remain unidentified, and this is the same gap.
2. **Whether they would review the coach's wording**, not just the logic. The register is where a product like this actually causes harm.
3. **What they would want to see before a beta** with real users who are in pain.

---

## 8. Build sequence, once and only once answers are in

1. Physio review → revise this document to v2, recording what changed and why.
2. Schema: the duration answer and the redirect state. `store.js` + `Schema.md` first, as always.
3. The door, the three questions, the routing.
4. The redirect content and its repeat cadence.
5. Gate: **the negative assertions carry the weight.** No lock-out on any path; the severe override still fires; professional exercises are never overridden; no condition name appears as a programme name.
6. Device check against the real routes, once the trace work is done.

---

## 9. Open, and not for the physio

- **Upper-limb library depth** (§3.1) — a product decision about the library question already open with Graeme.
- **Whether this door is Free or Personal.** Not decided. A strong argument exists for Free: somebody in pain is the person least well served by everything else, and putting the door behind a paywall would be the product contradicting its own reason for existing.

---

*Build New Habits · Alongside: Move · The Rehab Front Door · 16 Aug 2026 v1 · NOT FOR BUILD pending physiotherapist review*
