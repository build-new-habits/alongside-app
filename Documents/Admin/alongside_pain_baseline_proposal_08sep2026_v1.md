# Pain scoring — baseline or absolute?

**Proposal for review · 08 Sep 2026 · Alongside: Move**

Amy asked: *"I presume the scores are compared to baseline? If they have 3-4/10 baseline and today they are 6/10, that is different to if the pain score goes from 1-2/10 up to 6/10."*

**She is right about the clinical reality and my recommendation is still not to build it.** The reasoning is below, along with the one thing that genuinely is wrong and should be fixed.

---

## 1. What the app actually does today

Amy's document describes an older version. Two of the three things she flagged are already fixed:

| | Amy saw | Now |
|---|---|---|
| At 6, nothing happens | ✅ fixed | 6 is **subacute** — base + subacute contraindications active |
| 7 treated inconsistently | 🔴 **still live** | See below |
| 8–10 no session | Still true — breathing, mindfulness or a gentle walk |

**The live fault, exactly.** `getPainBand(7)` returns the label **"Moderate"**. `getActiveConditionIds()` treats **7 as acute** — the same tier as 10.

> **So somebody at 7 is shown the word "Moderate" and filtered as though they were severe.**

That is a real inconsistency and it is cheap to fix. It is also **not** the baseline question.

---

## 2. Why I would not build baseline-relative scoring

### 🔴 It is more clinical than what it replaces, not less

An absolute threshold is a filter on **a number the person just typed**. Baseline-relative scoring is the app **modelling an individual's pain trajectory over time** and deciding what a change means for them.

That is monitoring. It is much closer to assessment than anything the app currently does, and it sits against the line you drew:

> *"We are not diagnosing or prescribing… we remain a system that offers adaptation for movement of body and mind reflecting the mental and physical state of a person that day."*

⚫ **"That day" is the point.** Absolute scoring asks one question — how is it right now — and acts on the answer. Baseline scoring asks how today compares to a personal norm the app has computed, which is a claim about the person rather than about today.

### 🔴 The dangerous failure runs the wrong way

Consider somebody whose pain sits at 6–7 most days.

- **Absolute:** they get the safer variants. Blunt, and sometimes more cautious than they need.
- **Baseline:** 6 is *their normal*, so the app offers a full session — **it has decided that their chronic pain is fine.**

The second is the app forming a view about somebody's long-term condition and acting on it. It is exactly the judgement Amy said needs training, and exactly what she warned against for *"people with uncontrolled pain"*.

⚫ **The errors are not symmetrical.** Being too cautious costs somebody a harder session. Being too confident costs them a flare they did not need.

### 🔴 A baseline has to be defined, and defining it is a clinical judgement

How many days establish one? Rolling mean or median? What about somebody whose pain is genuinely variable — is their baseline 3, or 7, or both? What happens in week one, when there is no history?

Every one of those is a decision with clinical consequences, and Amy's own standard applies:

> *"I don't think you can be giving it from your own judgement/opinion. It needs to be backed up with facts/evidence/references."*

**I would be inventing those rules. So would you.**

---

## 3. The real problem baseline was trying to solve

There is a genuine case underneath Amy's question, and it should not be lost:

> **Somebody with chronic pain at 7 is permanently locked out of most of the app.**

That is real, and it is unfair, and absolute thresholds cause it.

### ⚫ But the app already solves it, and solves it better

At severe pain the coach **asks**, and records what the person chose — `recordSeverePainChoice()`, one record per date and per exact set of severe conditions, deliberately not a single remembered answer, *"so the coach always asks fresh."*

**Rest, or adapt. The person decides.**

That is the right shape, and it is better than baseline for the reason that matters here: **the person knows whether today's 7 is their ordinary 7 or a new one. The app does not, and cannot.** Asking them is not a workaround for missing data — it is the correct answer, and it keeps the judgement with the only person qualified to make it.

---

## 4. What I would do instead

| | | Size |
|---|---|---|
| **1** | **Fix the 7.** Either the band says what the filter does, or the filter does what the band says. My instinct: **move the severe band to 7–10** so the label matches the behaviour, since the behaviour is the cautious one and has been stable for a month | Small |
| **2** | **Extend the Rest/Adapt choice to 7**, not just 8+. That is where the chronic-pain lockout actually bites, and it hands the judgement to the person rather than computing it | Medium |
| **3** | **Do not build baseline** — and record why, so it is not revived as an obvious improvement | — |

⚫ **Item 2 is the one that answers Amy's concern.** It gives somebody with a long-standing 7 a way through that does not require the app to decide their pain is acceptable.

---

## 5. What I am not confident about

**Whether 7 should be the ease-off line at all.** Amy declined to give a number — *"this is tricky as very subjective for each individual"* — and she is the only person who has looked at this with training. The current 7 came from matching a check-in boundary, not from evidence.

🔴 **So item 1 makes the app self-consistent. It does not make it right.** Those are different, and only someone qualified can close the gap. That is the person you said you might be able to bring in.

---

## The question for you

**Fix the 7 so the label and the filter agree, extend Rest/Adapt down to 7, and leave baseline unbuilt?**

Or would you rather leave the pain bands entirely alone until somebody qualified has looked at them — on the grounds that a self-consistent wrong number is not obviously better than an inconsistent one, and changing it is itself a clinical judgement?

**I lean to the first**, because the inconsistency is a defect regardless of where the line belongs. But it is close, and it is yours.
