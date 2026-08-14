# Alongside: Move — The Route to Exceptional

## 14 Aug 2026 v1

Build New Habits | What to fix, what to build, and how to trace it — so that every persona gets an experience worth talking about, not just one without defects.

---

## Part 0 — An honest reframe before any of it

You asked for perfection. I want to push back on the word, because chasing it would cost you the beta date and still not get you what you actually want.

**Three waves of persona tracing have now produced roughly thirty findings. Every single one is a thing that was wrong.** A filter that over-read an answer. A screen a user could not reach. A ceiling that leaked. That is what a defect trace is *for*, and this project has run it exceptionally well.

**But not one finding was a thing that was missing and should have existed.** No trace has ever reported "she finished her first session and nothing happened, and something should have." A defect trace cannot find the absence of delight, because absence does not throw an error and does not read as wrong when you execute it.

So the honest position is this:

- **The app is close to having no defects that matter.** That is a real achievement and it is nearly done.
- **The app has not yet been designed for its best moments.** That is a separate exercise with a separate instrument, and it has not been run once.

"Exceptional" lives almost entirely in the second one. The plan below does both, in that order, because a delightful moment sitting on top of a broken filter is worse than neither.

**And one hard constraint.** Beta is mid-September — roughly four weeks. Everything below is scoped to that. I have marked what I would cut if the date moves closer, and I would rather tell you now than discover it on 10 September.

---

## Part 1 — The blocker, and it is bigger than it looks

### Two chats have now spent a day fixing code that no user can reach

There are **eight CAP work items** in the codebase — CAP-1 through CAP-7 plus CAP-6b — representing the capability screen, the leg-power fail-safe, the seated-user protections, and the two fixes the other chat shipped today from their own Wave 2 trace.

All of it sits behind `cap.asked`. Executed against current `main`, for a user who completes live onboarding:

```
capability   { chairRise:null, floorAccess:null, bothFeet:null,
               balanceWorry:null, legPower:null, askedAt:null }
asked        false
```

**Six of the eight `cap.asked` branches never run for anybody.** Floor safety, balance safety, seated-only, legs usable, legs loadable, and `_capabilityUnrestricted()` are all dead in production. Only the impact gate survives, because it has an explicit `!cap.asked` fallback.

The sole writer of `capability.*` remains `views/onboarding/lifestyle.js`, which is not registered in `router.js` and whose only two inbound `navigate()` calls are swallowed by `sheet-manager.js`. That is unchanged on current `main`.

### Why this reframes everything

The other chat's Wave 2 report describes CAP-6b as persona 2.12 receiving fourteen seated items across nine sessions, and CAP-7 as persona 2.11 being confined to a chair with a pool of seven exercises. Both are real bugs and both fixes are correct.

**But no live user can currently produce those states**, because no live user has ever answered the four questions. Those personas were traced with fixture values that the live app has no writer for — which is precisely the fixture-drift trap the Wave 2 brief warns about, and which their own schedule names as having cost the project four times.

I want to be careful here: **this does not make their work wrong or wasted.** The fixes are correct and they will be needed the moment D-1 lands. It makes the work *pending* rather than *shipped*, and it means the capability system has never been tested end-to-end by anyone.

### This is the highest-leverage item in the product

Wiring the capability screen does not just protect frail users. It **converts a day of two chats' work from dead code into live behaviour**, and it is the only item on this plan with that property.

**It is also the only thing blocking a truthful Wave 3.** Tracing 2.10 or 2.8 again without it would produce another set of findings about code paths nobody reaches.

---

## Part 2 — Close the gap between "fixed" and "experienced"

Before Wave 3 runs, these need to be true, or the trace measures old bugs instead of the new experience.

| ID | Item | Why it must precede the trace | Cut if short of time? |
|---|---|---|---|
| **W3-A** | Capability questions reachable (D-1) | Six protective branches are dead until this lands | **No.** This is the plan |
| **W3-B** | `trainingIntent` gets a writer | Always `'improve'`; the `'maintain'` path serving 2.10 and 2.5 is unreachable | No |
| **W3-C** | Decide the two-doors question (D-5) | Check-in is compulsory before a door that discards it | No — but the *decision* is enough, the build can follow |
| **W3-D** | `field-contract.js` covers lookup-table keys | The gate scans `=== "x"` comparisons, not object keys, so `DIFFICULTY_CEILINGS["returning"]` is invisible to it. `'returning'` is live proof, undeclared and green | No — cheap, and it guards the class |
| **W3-E** | `exercisePreferences` writable outside `gym-programme.js` | 2.14's sensory aversions cannot be expressed; 2.8 and 2.16 will hit the same wall | Yes, if forced |
| **W3-F** | `sessionVariety: 'familiar'` anchoring raised | 40% mean overlap, range 11–70%, for someone who asked nine times for the same thing | Yes, if forced |
| **W3-G** | Conditions sheet stops rendering its own Back and "Step 5 of 7" | Two progress models on one screen; first impression | Yes, if forced |

---

## Part 3 — Wave 3: who has never been traced

Across all waves, seven personas have been traced: **2.5, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15.**

Nine have not.

### Blocked, and not by code

**2.2 (13, ballet), 2.3 (15.5, sprinter), 2.9 (14, academy footballer)** cannot be traced, because the matrix states plainly that they cannot be safely onboarded: the drafted Terms say 13+ with parental consent, a business-setup document says 16+, and the two contradict. That is **A1.11**, it is a legal question rather than a build one, and it has been open since 5 July.

Three of your sixteen personas are your own children and nieces, and the product currently cannot tell you whether it is allowed to serve them. I would raise this with Natalie in the same thread as the outstanding solicitor response rather than treating it as a persona-trace item at all.

### Traceable, and chosen for what each one would teach

| Persona | The question only they answer | Why now |
|---|---|---|
| **2.16 Fit mid-30s, time-poor parent** | Can the coach *compress* without abandoning "coach speaks first"? | The only persona who is actively annoyed by the product's core stylistic commitment. Highest chance of surfacing a design tension rather than a bug |
| **2.8 Niece — dyspraxia and autism, overcommits** | Does anything moderate someone who burns hot then vanishes? | Proactive Pacing was agreed in principle on 5 July and never built. She is the safety case that is not about exercise selection at all |
| **2.6 Brother-in-law, the footballer** | Does the engine work at all with nothing to compensate for? | The matrix calls him "the cleanest test of whether basic exercise generation works." Nobody has ever run the clean case |
| **2.4 Wife — perimenopausal, self-directed** | Does the perimenopause flag exist, and does a self-directed woman get anything she cannot write herself? | Decision 3 resolved the model in July. Unverified since |

I would trace **2.16 and 2.8 first**. They are the two most different from each other, and both stress the parts of the product that are about *relationship* rather than *selection* — which is where the remaining findings are.

### What Wave 3 must trace that no wave has

Their own schedule flags this, and it is right: **four of the six personas in their Wave 2 had only their sessions traced.** Home, check-in, Progress, Wellbeing and upgrade are untraced for 2.10, 2.11, 2.13, 2.14.

Both fully-traced personas surfaced most of their findings *outside* the session engine. My Denise trace found her four biggest problems in onboarding, condition handling, and a promise the coach made — not in a workout.

**Wave 3 traces the whole surface or it is not worth running.**

---

## Part 4 — The instrument you do not yet have

This is the part that actually answers "exceptional", and it is not a trace.

### Three audits, none of which have ever been run

**1. The first ninety seconds.** Not onboarding — the ninety seconds *after* it. What does a person see the moment they finish? Is there a session ready, or a screen asking them to choose again? For every persona, what is the first thing that happens, and is it *good*, not merely correct?

**2. The moment-of-delight inventory.** Walk the product and list every place where something better-than-expected could happen, then check what is actually there. Finishing a first session. Coming back after a gap. The first time the coach says something that could only be about you. Right now I know of one — the burnout reflection, which is genuinely good — and I would expect a product of this quality to have eight.

**3. The would-they-tell-someone test.** For each persona, name the single sentence they would say unprompted to a friend. If it is a description of features, there isn't one yet. Sam's was *"It asks what I want and then does about forty per cent of it."* Denise's was *"Bit weird that it asked about my heart and then never mentioned it again."* Neither is a bug report. Both are the actual product experience.

### Why this is not more tracing

A trace asks *did the code do the right thing*. These ask *was that a good thing to happen to a person*. The second question has never been asked systematically about this app, and it is the entire distance between "no defects" and "exceptional."

**My recommendation: run audit 1 and 3 before Wave 3, not after.** They take a fraction of the time, they will change what Wave 3 looks for, and audit 3 in particular will tell you what the beta cohort is going to say before they say it.

---

## Part 5 — Sequencing against mid-September

| Week | Focus | Ends with |
|---|---|---|
| **This week** | D-1 decided. W3-A and W3-B built. W3-D contract gap closed | Capability live end-to-end; the CAP work finally reaching users |
| **Week 2** | Audits 1 and 3 across all sixteen personas. D-5 decided | A named list of missing moments — the first time this product has one |
| **Week 3** | Build the three or four best moments from audit 2. W3-E, W3-F, W3-G | The delight items, not just the defect ones |
| **Week 4** | Wave 3 full-surface trace: 2.16, 2.8, 2.6, 2.4 | Findings against the *new* experience |
| **Buffer** | Fixes from Wave 3 | Beta |

**What I would cut first if the date tightens:** 2.6 and 2.4 from Wave 3, then W3-E/F/G. **What I would not cut under any circumstances:** W3-A, the audits, and 2.8 — because she is the persona whose failure mode is harm rather than disappointment.

---

## Part 6 — Decisions, one at a time

I am asking for **one**. The rest are listed so you can see what is coming, not so you answer them now.

### D-1, and it is the only one that matters this week

**Where do the four capability questions live?**

- **(a) Four steps in the onboarding thread.** Complete and honest. Costs 14 steps → 18 at the highest drop-off moment, and executive-function load is the documented reason 2.13 abandons things.
- **(b) A conditional branch** — asked only when the answer could change something.
- **(c) Settings, plus one warm offer after the first session.**

**I am changing my recommendation from (c) to (b).** Last time I argued the `activityLevel` ceiling already holds the safety floor, so this was a refinement. That was before I knew six protective branches were dead for everyone and that both chats' CAP work depends on it. A refinement can live in Settings; a system this load-bearing cannot, because most people never open Settings.

(b) costs perhaps two extra steps for the people it protects and none for everyone else. The objection — that it half-implements "we do not filter on age" — is answerable: age selects who gets *asked a question*, it does not decide what they can do. Their answer does that. That distinction is exactly the one the codebase already makes and defends well.

### Waiting behind it

**D-5** two doors, two amounts of listening · **D-2** the cardiac promise · **D-3** neurodivergence in `CONDITIONS` · **D-4** the variety dial · **A1.11** the 13+/16+ contradiction, for Natalie, not for me.

---

## Part 7 — What I need from you to keep going

1. **D-1** — (a), (b) or (c).
2. **Whether the other chat is still running.** We have now collided twice on version numbers. If both are live, we should split by file, not by task.
3. **Whether I update `master_schedule.md`** — it is at v191 from their session and I have deliberately not touched it. W2-1 and W2-2 need a row.

---

*Build New Habits · Alongside: Move · The Route to Exceptional · 14 Aug 2026 v1*
