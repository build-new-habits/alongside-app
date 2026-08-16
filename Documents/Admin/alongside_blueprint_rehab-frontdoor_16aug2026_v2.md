# Alongside: Move — The Rehab Front Door

## Blueprint · 16 Aug 2026 v2

Build New Habits | **STATUS: REVIEWED. Physiotherapist review received 16 Aug 2026 and folded in below. Buildable once the three pre-beta conditions in §11 are met.**

> ### v2 — what the review changed
>
> **Q1: my refusal to screen for red flags was wrong, and the reviewer's word was "indefensible".** The reasoning I missed: *asking "where does it hurt" and "how long" is already a triage interaction in the user's eyes.* Declining to screen after that is not neutrality — it is implicit false reassurance to somebody with cauda equina syndrome, progressive neurological deficit or malignancy. **A three-item screen with a hard stop is now the first thing the door does.** This is the single largest change in v2, and it is a reversal.
>
> **Q7 turned out not to be about this door at all.** See §10 — it is a live finding in the shipped product.
>
> Also changed: redirect threshold 12 weeks → **6 weeks, unified across chains**; chain programming constrained to isometric / sub-maximal closed-chain / mid-range; recurrent case classified as subacute with a low-friction redirect; professional exercises get an **8-week** expiry checkpoint; post-surgical becomes an absolute exclusion inside 6 months; **upper limb does not open**; pain bands must change; referral routing is now specific.

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

**Q1 — Red flags. ANSWERED: the refusal was indefensible. Screening is now mandatory and comes first.**

> *"If an app asks 'Where does it hurt?' and 'How long?', you have already entered a triage interaction in the user's eyes."*

That is the sentence that settles it. The screen runs **before chain entry**, three items:

1. Bladder or bowel incontinence, or numbness between the legs or groin. *(Cauda equina)*
2. Progressive muscle weakness, numbness, or loss of coordination.
3. Unexplained systemic symptoms — fever, unexplained weight loss, or unrelenting night pain unaffected by movement.

**Outcome on any yes: a hard stop.** Reviewer's wording, to be used close to verbatim:

> *"Your symptoms require an in-person medical evaluation before starting any movement program. Please contact your GP, call NHS 111, or attend A&E immediately."*

**This is the one place in the entire product where a hard stop is correct**, and it does not contradict §2.2's no-lock-out principle — that principle protects against being locked out for having *chronic pain*. This is an emergency-pathology stop, it is specific, it is rare, and it routes somewhere urgent rather than leaving the person nowhere. It must be built so that it cannot be dismissed into a workout.

**Q2 — ANSWERED: six weeks, unified across all chains.** Not twelve. Most soft-tissue and non-specific spinal presentations reach peak biological healing by six weeks, so any non-traumatic pain past six weeks without professional review triggers the redirect. **Do not segment by joint** — it adds clinical complexity without changing the need for human assessment. The duration bands in §4.2 change to: days / **under 6 weeks** / **over 6 weeks** / on and off for a long time.

**Q3 — ANSWERED: sound, and it is current best practice because it reduces tissue-threat hypervigilance — with one caveat that becomes a hard programming constraint.**

The blind spot is reactive structural pathology (patellar/achilles tendinopathy, labral impingement, disc extrusion with radiculopathy). Generic "lower body" work can inadvertently programme end-range loading or stretch-shortening cycles into acutely reactive tissue.

**So chain programming is constrained to:** isometrics, sub-maximal closed-chain variations, and mid-range movement. **Explicitly excluded:** end-range stretching, and high rate-of-force-development drills. This is a filter on exercise selection, not a note in the copy, and it needs its own gate.

**Q4 — ANSWERED: treat as subacute/maintenance (group B), not acute.** It is the hallmark of episodic mechanical low back pain and recurrent tendinopathy. Gentle movement today, plus a **low-friction** redirect — not the full one:

> *"Because this keeps coming back, a physio can help identify what triggers it so you aren't stuck in this cycle."*

**Q5 — ANSWERED: add an expiry checkpoint at 8 weeks.** A home exercise programme given six months ago for an acute tear is almost certainly obsolete and probably *underloading* for subacute remodelling. Never silently override — but do not let a static protocol become permanent dogma. At 8 weeks:

> *"It's been a while since these were prescribed. Are these still the exact exercises your physio wants you doing, or is it time for an updated check-in?"*

Schema implication: `prescribedExercises` entries need a prescribed-at date and a last-confirmed date. **Check whether `setAt` already carries this before adding a field.**

**Q6 — ANSWERED: absolute screening exclusion.** Surgical repairs run to structural healing timelines and surgeon-specific weight-bearing and range-of-motion protocols. **If the pain relates to surgery in the past 6 months, route out entirely** until there is explicit, written Phase IV discharge clearance from the surgical team or physio. This becomes a fourth screening item alongside the three red flags.

**Q7 — ANSWERED, and the answer is bigger than this door. See §10.**

> *"ME/CFS must never route through a standard load/pain adaptation model. Post-exertional malaise is not mechanical load intolerance; it is neuro-immune. Adapting volume to 'how you feel today' is the exact mechanism that triggers severe baseline crashes."*

The worry was right and understated. ME/CFS needs **pacing models — heart-rate ceilings, energy envelopes — not progressive rehab.** Decouple immediately.

**Hypermobility/EDS:** active control, proprioception, closed-chain stability. **Strictly avoid end-range passive stretching.**

**Q8 — ANSWERED. Three banned categories, now auditable:**

- **Structural/nocebic language:** "fix your bad posture", "realign your pelvis", "out of place", "wear and tear", "damaged chain".
- **Clinical metrics:** "your knee is 40% recovered". *(Already refused in §5.)*
- **Biomechanical dogma:** "safe vs dangerous movement". **All movement is neutral — it is current capacity versus applied load.**

**Audited against the live codebase, 16 Aug: clean.** Zero user-facing hits across all three categories. The only matches were the word "degenerates" in a code comment about selection logic, "misaligned" in a CSS comment about nav tabs, and "your weak side" in a swimming cue about bilateral breathing — which is a neutral technical term but is worth rewording, since it is the only place the product says "weak" to a person about their own body.

**Q9 — ANSWERED: do not open the upper limb.** Four rotator cuff and five wrist/elbow exercises cannot safely scale or regress around impingement, frozen shoulder or epicondylalgia. **Launch with lower body and spine only**, and say clearly on screen that upper-body support is in development — absent, not broken.

**Q10 — ANSWERED. Three structured routes, offered together:**

- In many NHS England and Scotland regions you can **self-refer directly to MSK physiotherapy online**, without seeing a GP first — check the local NHS Trust website.
- Or book with the GP surgery's **First Contact Practitioner (FCP) physio**.
- If going private, ensure the provider is **HCPC registered** and a member of the **Chartered Society of Physiotherapy**.

---

## 10. 🔴 The finding that is NOT about this door — systemic conditions in the shipped product

Q7's answer sent me to check the live code, and what is there is worse than the door being unbuilt.

**Four systemic conditions are collected at onboarding, trigger the exercise-clearance question, and then have no effect whatsoever on what the person is given.**

`getExerciseSafetyTier()` decides between `safe`, `caution` and `avoid` by matching active condition IDs against each exercise's `avoid`/`caution` lists. Grepped the entire exercise library:

| Condition | Exercises naming it in `avoid` or `caution` |
|---|---|
| `chronic-fatigue` (ME/CFS) | **0** |
| `fibromyalgia` | **0** |
| `hypermobility` (EDS) | **0** |
| `osteoporosis` | **0** |

**So every exercise in the library returns `safe` for all four.** The condition is asked about, acknowledged, and then discarded at the point it would have mattered — the same WRONG-vs-MISSING shape as everything else this week: nothing throws, the screen looks right, and only executing the filter shows that it does nothing.

For ME/CFS specifically, the reviewer's verdict makes this more than a gap. The product's core mechanic — adapt volume to how you feel today — is **the exact mechanism that triggers post-exertional crashes**. Somebody with ME/CFS is currently offered a product whose central promise is contraindicated for them, and the app has recorded that they have it.

**This is a live safety item, not a rehab-door item, and it is a beta blocker.** Options, for Graeme:

1. **Decouple ME/CFS entirely** — a pacing model with an energy envelope, not progressive rehab. Correct, and the largest build.
2. **Honest exclusion for now** — at onboarding, say plainly that the app is not built for ME/CFS yet and why. Small, shippable, and better than silent inaction.
3. **Populate `avoid`/`caution` where there is clinical backing — and ONLY there.**

   | Condition | What the reviewer actually said | Buildable now? |
   |---|---|---|
   | `hypermobility` / EDS | Active control, proprioception, closed-chain stability. **Strictly avoid end-range passive stretching.** | **Yes** — specific and actionable |
   | `chronic-fatigue` / ME-CFS | Never route through a load/pain adaptation model; needs pacing, HR ceilings, energy envelopes | **No** — needs its own model, not a filter |
   | `fibromyalgia` | **Nothing.** Named in the question, not addressed in the answer | **No — goes back to the reviewer** |
   | `osteoporosis` | **Nothing.** Not raised in the review at all | **No — goes back to the reviewer** |

   > **⚠️ CORRECTION, 16 Aug, same session.** An earlier draft of this line read *"with the reviewer's guidance: hypermobility → no end-range passive stretching, closed-chain only; osteoporosis → no loaded spinal flexion."* **The osteoporosis clause was mine, not the reviewer's.** It is plausible, it may well be correct, and none of that matters: it was written into a clinical-safety document as the stated view of a named professional who never said it.
   >
   > That is the worst instance of this week's recurring fault. Elsewhere it produced a wrong number in a schedule. Here it would have produced **invented clinical guidance carrying a physiotherapist's authority** — and it would have been indistinguishable from the real answers around it, because I had formatted it identically to them.
   >
   > **Standing rule: clinical content is quoted or attributed, never inferred, never extended, and never smoothed into a list of things somebody actually said. Where a reviewer was silent, the document says they were silent.**

**My recommendation: 2 and 3 before beta, 1 as its own stream — noting that 3 now covers hypermobility only.** Fibromyalgia and osteoporosis go back to the reviewer as a short follow-up, because the honest position is that we asked and did not get an answer. Option 2 is not a cop-out — telling somebody the truth about what a product cannot do for them is the same principle as the redirect, applied to ourselves.

---

## 11. Pre-beta conditions, set by the reviewer

Three, and they gate a beta involving anybody in pain:

1. **Red-flag hard stops** — automated cessation, not advisory copy.
2. **A defined pain scale.** MSK traffic-light: **0–3 acceptable discomfort · 4–5 monitor closely · 6+ back off.** **The live bands do not match this** — `getPainBand()` currently reads 0–2 none, 3–5 mild, 6–7 moderate, 8+ severe. The severe override that abandons the workout entirely fires at **8+**, where the reviewer puts "back off" at **6**. This needs a decision: align the bands, or keep two scales and be explicit about which is which.
3. **Clinical content audit of all 95 rehab exercise descriptions** — independent review, checking that cueing emphasises capacity and reassurance rather than fear-avoidance.

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

*Build New Habits · Alongside: Move · The Rehab Front Door · 16 Aug 2026 v2 · Physiotherapist review received and folded in · Buildable once §11's three pre-beta conditions are met*
