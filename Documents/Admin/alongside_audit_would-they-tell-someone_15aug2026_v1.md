# Alongside: Move — The Would-They-Tell-Someone Test

## 15 Aug 2026 v1

Build New Habits | The third and last of the audits. One sentence per person — the unprompted thing they would say to a friend, not the considered answer they would give an interviewer.

---

## What this is, and why the sentence matters more than the survey

An interview answer is a performance. Somebody who has been asked "what did you think of the app?" will list features, hedge, and be kind. The sentence they say to a friend in a pub is shorter, sharper and usually about one thing — and it is the sentence that actually moves other people.

So this audit asks one question per persona: **what is the single thing they would say without being asked?**

**A note on honesty, because it changes how much weight to put on each line.** Seven of the sixteen have been played forward through the real engine — 2.5, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15. Their sentences are grounded in what the code actually did to them. The rest are inference from the matrix profile plus the current behaviour of the relevant code paths, and I have marked them so. **Inferred sentences are hypotheses to test in beta, not findings.**

Persona 2.1's profile did not surface in project knowledge, so it is not covered here rather than invented.

---

## The sentences

### Traced — grounded in executed behaviour

**2.5 · Sister, 52, post-cardiac**
> *"It asked about my heart and then actually did something about it."*

This changed today. Before CARDIAC-1 her sentence was *"Bit weird that it asked about my heart and then never mentioned it again."* The clearance question turned the product's most-broken promise into its most specific one.

**2.10 · Dad, 76, frail**
> *"It hasn't tried to make me young again."*

Inferred tone, traced substance: W3-A means he is asked four questions and then never put on the floor or asked to balance. Before today, he was.

**2.11 · Mum, 76, mindfulness-led**
> *"It doesn't start with exercise, which is the only reason I opened it twice."*

ORIENT-1 gave her the wellbeing door line. The other chat's CAP-7 stopped her being confined to a chair by an answer about the floor.

**2.12 · Non-active early 30s, decision paralysis**
> *"There's a button that just decides for me."*

The strongest single sentence in the set, and it already worked before today.

**2.13 · ADHD, mid-30s, novelty-driven**
> *"It's the first one that didn't get boring by week three."*

42 distinct exercises, most-repeated five times. W2-6 deliberately left her setting untouched.

**2.14 · Autistic, late 20s, predictability-seeking**
> *"You can tell it you want the same thing every time, and it listens."*

Changed today. Her sentence this morning was *"It asks what I want and then does about forty per cent of it."* W2-6 took familiar from 40% to 62%, and W2-7 gave her a way to say which exercises she cannot stand.

**2.15 · Fit mid-20s, strength-focused**
> *"It programmes properly — I get my squat every week, not a different squat every week."*

Slot anchoring, from the other chat's Wave 2.

### Inferred — hypotheses, not findings

**2.4 · Wife, ex-national athlete, perimenopausal**
> *"It's fine. I already know what I'm doing."*

The weakest sentence in the set and the one I would worry about. She is self-directed, writes her own routine, and the product's core value — a coach that decides for you — is the thing she least needs. ORIENT-2 now speaks to her; nothing yet answers *why would she stay*.

**2.6 · Brother-in-law, the footballer**
> *"It's alright. Does what it says."*

Damning with faint praise, and probably accurate. He is the clean case: no condition, no history, nothing to compensate for. He gets a working session generator and none of the product's actual differentiation, because none of it is aimed at him.

**2.7 · Brother-in-law, the runner**
> *"No PB tracking, so I use something else for that bit."*

PB logging is decoupled and specced, not built. Until it is, he is a two-app user, and two-app users churn.

**2.8 · Niece, dyspraxia and autism, overcommits**
> *"It's the only one that hasn't let me overdo it."* — **if Proactive Pacing gets built.**

Today she would say something warmer than she used to, because the balance question now reaches her where no age or condition trigger would. But **Proactive Pacing has been agreed in principle since 5 July and does not exist.** Without it her real sentence is closer to *"I went too hard for two weeks and then stopped, same as always"* — and hers is the one failure mode in the set that is about harm rather than disappointment.

**2.16 · Fit mid-30s, time-poor parent**
> *"It talks too much."*

The bluntest sentence here and I believe it. The coach speaking first is a founding principle and a genuine differentiator — and for somebody with a nineteen-minute window between bedtime and collapse it is friction. Nothing in the product currently compresses.

### Out of scope at 18+

**2.2 (13, ballet) · 2.3 (15.5, sprinter) · 2.9 (14, academy footballer)** — no sentence, because they cannot use the product. Worth stating plainly: three of your sixteen personas are your daughters and niece, and the 18+ decision puts all three outside the launch.

---

## What the set says collectively

**The people the product was built for now say specific things.** 2.5, 2.10, 2.11, 2.12, 2.13, 2.14 all have a sentence that names something no competitor does. That is the thesis working, and four of those six sentences improved today.

**The people it was not built for say vague things.** 2.4, 2.6, 2.7, 2.16 produce "it's fine", "it's alright", "it talks too much". None of those spreads. None of them is a complaint either — these people are not badly served, they are *unremarkably* served, which for word of mouth is the same as being invisible.

**That is not obviously a problem.** A product for everyone is a product for no one, and the matrix says as much: the primary market is neurodivergent adults, the secondary is women navigating hormonal change. 2.6 and 2.7 are family, not market. **But 2.16 is squarely in the tertiary market** — a burnt-out time-poor parent is exactly who the thesis names — and she is currently served worse than the personas the product is not aimed at.

**The one that should worry you is 2.8.** She is the only persona whose bad outcome is harm rather than indifference, the fix has been agreed since July, and it is still not built.

---

## What would change the weak sentences

| Persona | Current sentence | What would change it | Status |
|---|---|---|---|
| **2.16** | *"It talks too much."* | A short-session path where the coach compresses without abandoning speaking first | Matrix gap 8, never built |
| **2.8** | *"I went too hard and stopped."* | Proactive Pacing — a soft daily cap, warmly framed, never a hard block | Agreed 5 Jul, never built |
| **2.7** | *"No PB tracking."* | Basic PB logging, already decoupled from Athlete | Specced, never built |
| **2.4** | *"I already know what I'm doing."* | An honest answer to why a self-directed person stays | Not yet articulated anywhere |

Three of those four are **specced and unbuilt**, which is a different and much better problem than "we do not know what to do".

---

## What I would do next, and why not more tracing

Wave 3 would tell you how these four *behave*. It would not tell you what to build for them, because the answer is already written down and waiting in the matrix.

**I would build 2.16's short path and 2.8's pacing before running Wave 3.** They are the two gaps where a persona trace would simply re-confirm what 5 July already concluded — and 2.8's is the only one in this document where the cost of waiting is somebody getting hurt rather than somebody getting bored.

Then trace 2.16, 2.8, 2.6 and 2.4 against a product that has answers for them.

---

## A note on the three audits, now they are finished

Six findings, and five were the same shape: **written, reviewed, warm copy or a deliberate design principle that no user could reach.** Three day-one openings behind an always-true condition. A streak claim in a product that promises no streaks. Three reflection branches reading the wrong object. A chosen target never recorded as chosen. A first session never marked as a first.

Thirty findings across three waves of persona tracing had found none of them, because a defect trace asks whether the code did the right thing and every one of these paths executed perfectly while reaching nobody.

**The writing and the thinking in this product are not the weak point. The wiring between them and the person is.** That is worth carrying into every future session as a first question rather than a last one.

---

*Build New Habits · Alongside: Move · The Would-They-Tell-Someone Test · 15 Aug 2026 v1*
