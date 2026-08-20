# Alongside: Move — The Progression Boundary
## 20 Aug 2026 v2

**v2 adds §3.1 (goals versus targets), §4 (progression without a number) and §9 (the trial confirmation).** v1's finding and boundary are unchanged.

Build New Habits | Why the Plan is worth paying for, and why it needs no new paywall.

**Status: proposed.** Decision needed from Graeme — see §7. Sits under `alongside_revenue_architecture_18aug2026_v1.md` v2 and `alongside_tier_boundary_12aug2026_v1.md` v3.

---

## 1. The finding that produced this document

**Progression does not exist in this product. Not on the free tier, not on the Plan.**

Ground-truthed 20 Aug against `session-builder.js` v11 and `programmeEngine.js`:

- Sets default to `3`. Reps come from the exercise definition. **Nothing escalates either across sessions.**
- No load guidance exists. No complexity ladder exists.
- `CONT-1` (11 Aug) delivered **continuity** — the same movements recur, so form can be corrected and familiarity can build. **Continuity is not progression.** Meeting the same squat eight times is not the same as that squat getting harder.
- The file's own header states it: *"a person on a programme who uses the session-builder gets week 10 built the same as week 1."*
- One attempt at progression-by-difficulty-preference was made on 15 Aug, measured at a 3% difficulty change, and **written up as a finding.** Instrumenting it showed the block executed **zero times**. The 3% was run-to-run noise on unchanged behaviour. The idea remains untested.

### Why this matters more than the tier boundary

**The Plan already promises what this section says does not exist.** Tier boundary v3: *"You name what you're working toward. The coach builds the road."* Without progression the road is flat — week 10 is week 1 with different scenery.

So this is not primarily a paywall question. **It is a delivery question about something already being charged for.** The paywall follows from fixing it.

### Process finding, recorded because it is now a pattern

Three times in the 20 Aug session, work was specified against files that had not been opened:

| Item | Claimed | Actual |
|---|---|---|
| R3 (recognition) | "not built, cheap to build" | Shipped 12 Aug as DIC-1, gated, free |
| R1 (hard conversation) | "unbuilt" | Correct — but only confirmed after grepping |
| Progression | "machinery largely exists, would be gated not built" | **Does not exist for anyone** |

The R3 spec was written in the same document that warned R2 must not be specced before opening `goal-setup.js`. **Writing that warning is not the same as following it.** Rule, going forward: no item enters an R-stream spec until the files it names have been opened in that session and the finding recorded.

---

## 2. What progression is, precisely

Not difficulty tier. Not access to harder exercises. **The same movement getting harder in a way the person can feel and the coach can justify.**

Four honest axes, in the order they should be built:

| Axis | What changes | Example |
|---|---|---|
| **Load** | Weight, band tension, incline | Goblet squat 12 kg → 14 kg |
| **Volume** | Sets, reps, time under tension | 3×8 → 3×10 |
| **Complexity** | Stability, range, tempo, unilateral | Two-leg → split stance → single leg |
| **Density** | Rest between efforts | 90s rest → 60s rest |

**Load and volume first.** They are measurable, safe to reason about, and already have a data home in `liftLog`. Complexity needs an exercise-graph that does not exist. Density is the least useful for these personas and should be last, if ever.

### What progression is NOT, and must never become

- **Not a number that goes up on a screen.** No progression bar, no level, no percentage.
- **Not a streak.** See §5 — this is absolute.
- **Not a demand.** The coach proposes a step; the person may decline, and declining changes nothing about how they are spoken to.
- **Not automatic escalation.** Progression that only rises is a machine for producing failure. It must step down as readily as up.

---

## 3. The boundary — and it needs no new gate

> **You cannot progressively overload toward nothing.**

Progression requires a destination. It is the answer to *"harder in service of what?"* — and free has no destination by design. So the boundary is **structural, not conditional**, exactly like "My programme" in `library.js`: not gated by an `isPremium()` check, but unreachable because its precondition does not exist on the free tier.

| | Free | The Plan |
|---|---|---|
| Session quality | Full. Adapted to today | Full. Adapted to today |
| Continuity (CONT-1) | Yes — movements recur | Yes |
| Recognition (DIC-1) | Yes — "like last time?" | Yes |
| Safety, conditions, care mode | Yes, permanently | Yes |
| **Progression** | **No — nothing to progress toward** | **Yes — the road rises toward the target** |
| The hard conversation (R1) | No | Yes |

**This is the strongest available form of the boundary** because there is no paywall to resent. Nothing is withheld. The free user is not being denied progression; they have not asked for anywhere to go. The moment they name a destination, the road can rise — which is R2's demonstration, and this is what R2 should demonstrate.

### Why this beats a difficulty line

Argued 20 Aug against the live library (552 exercises):

| | Difficulty line | Progression |
|---|---|---|
| Free gets | 394 entries (71%) | Everything |
| Paid gets | 158 entries — **40 gym barbell, 27 rehabilitation** | A road that rises |
| Who converts | People who can get to a gym and lift | **Anyone with a destination** |
| Safety | 27 level-3+ **rehabilitation** entries behind a paywall | Nothing withheld |
| Reason to stay | **None — one-time unlock** | **Recurring — month four is better than month one** |
| Competes with | Strong, Hevy, Fitbod — ten-year head start | Nothing comparable |

The decisive line is the second from bottom. **A difficulty gate optimises acquisition; progression optimises churn** — and the pricing model's own conclusion is that *a 1% improvement in churn outweighs doubling acquisition.* A difficulty gate converts somebody once and then gives them a reason to leave.

`seated.js` is 43 entries, **all level 1–2**. `mobility.js` is 36, **all level 1–2**. Under a difficulty line the personas this product exists for live permanently in the free band with nothing to buy.

---

## 3.1 Goals are not targets — and only one of them is paid

Graeme, 20 Aug, proposed a Plan-tier onboarding that sets a destination across mental health, mindfulness, weight, general fitness, mobility and *"the feeling someone has around fitness"* — and asked whether free should therefore have no goals at all.

**Most of that already exists in data.** `goals.js` v2 categorises goals across exactly those domains: feel better day to day, more energy, reduce stress, improve mood, sleep better, build a consistent routine, build muscle, get stronger, lose weight, improve cardio, flexibility, balance, reduce pain, posture, return after illness, enjoy exercise. Four goals carry `hasTarget: true` with a `targetType` of weight, distance or programme.

🔴 **Nothing outside `goals.js` reads either field.** Both are declared on four goals and read only by their own accessors within that file; **no other module imports or calls either one.** Same class as `sessionVariety` before DIC-1 — a field waiting for the feature it was built for. **The taxonomy for this work was written in June and has been inert since.**

✅ Verified rather than assumed: `schedule-drift.mjs` flagged the first draft of this claim because the symbol appears five times in live code. All five are the declarations and the accessor inside `goals.js`. The claim holds; the wording now says where the uses are instead of denying they exist.

### The distinction

| | A goal | A target |
|---|---|---|
| Is | A **direction** | A **destination** |
| Example | *"I want to feel better"* | *"10K by March"* |
| Has a date | No | **Yes** |
| Has an end state | No | **Yes** |
| Tier | **Free** | **The Plan** |

> **Free has goals. The Plan has targets.**

**Free onboarding does not change.** Removing goals from free would degrade it: `programmes.js` matches programmes on goals via `getProgrammesForGoals()`, and `workoutGenerator.js` uses them for the session's rationale. Free sessions would become generic, which §4 of the tier boundary forbids.

It also breaks the anecdote. **The drop-in coach does ask what you want to do.** What he does not hold is where you are going and by when.

**The Plan adds a step at the point of upgrade**, where the direction becomes a destination. That is also the cleanest available form of R2: **the naming moment IS the upgrade**, rather than a demonstration bolted near it.

---

## 4. Progression without a number

Load progression is straightforward for *get stronger*. **This section is about the other two thirds of the goal list**, and it is the part that decides whether this product works for its actual market or only for lifters.

### 4.1 The problem, stated honestly

What does progression mean for *reduce stress*, *sleep better*, *improve mood*, *build a consistent routine*?

Three obvious answers are all forbidden, and each for a reason already settled:

| Tempting answer | Why it is out |
|---|---|
| Count consecutive weeks of practice | **A streak.** Absolute prohibition, §5 |
| Chart self-reported mood over time | For personas 2.5, 2.8 and 2.13, **a chart of how you feel becomes a chart you are failing.** It also breaks P4: a number with a trend attached is a verdict |
| Score whether the practice "worked" | The coach does not grade the person's interior. **We respond, they report** |

### 4.2 Three classes of goal, not two

The honest taxonomy has a third class, and naming it is what stops the Plan promising a road it cannot build.

| Class | Target is | Progression is | Examples |
|---|---|---|---|
| **Measured** | A number and a date | The number moves | Lose weight, run 5K/10K, get stronger |
| **Practised** | **A described end state, in their words, and a date** | **Range, depth, autonomy, integration** — see 4.3 | Reduce stress, sleep better, improve mood, mindfulness |
| **Directional** | **None. Ever.** | The coach keeps making sessions that suit you | Enjoy exercise, move more, feel better day to day |

**Directional goals must never acquire a target.** Putting a date on *"enjoy exercise"* is absurd and, for somebody whose relationship with exercise is the injury, actively harmful. **The Plan does not promise a road for everything**, and saying so plainly is worth more than pretending otherwise.

For **practised** goals the target is a sentence, not a metric: *"By March I want to be able to get through a bad week without it flattening me."* Not measurable. Still a destination — the coach can point at it, and R1's hard conversation still works against it.

### 4.3 What actually progresses — four axes

For practised goals, progression happens in **what the person does**, never in **how they feel**.

| Axis | What grows | Observable from |
|---|---|---|
| **Range** | How many practices they have that genuinely work, and knowing which suits which state | Which practices were opened and completed |
| **Depth** | Duration and subtlety. A two-minute body scan becomes ten. Breath awareness becomes breath regulation | Practice length chosen |
| **Autonomy** | **The big one.** Early on the coach suggests a practice. Later the person recognises the state and goes there unprompted | Whether entry was prompted or self-initiated |
| **Integration** | The practice attaches to movement rather than sitting beside it — grounding before a session, then during, then whenever it is needed | Where in the session it was used |

**Every one of those is behavioural.** None requires reading how the person felt, and none touches the journal — the Journal Privacy Rule is absolute and unaffected.

### 4.4 The design principle

> **For practised goals, progression is something the coach DOES, not something the person SEES.**

There is no bar, no level, no count, no chart. **There is no progression surface at all.**

What the person experiences is that the coach keeps offering things slightly beyond where they are, and gets it right more often as the months pass. That is exactly what a good therapist or coach does: they do not show you a graph, they keep meeting you a little ahead of yourself.

**Is invisible progression worth paying for?** Yes — but only if it is occasionally *named*, which is 4.5.

### 4.5 The observation — and this is the paid moment

Periodically, the coach says what it has noticed. Not a score. An observation the person can accept or reject.

> *Three months ago, I was the one suggesting you take a minute before we started. The last few times, you got there before I did.*

That is a **read**, not a record — precisely the free/Plan distinction of tier boundary §4.1, applied to wellbeing rather than to training. **Free records what happened. The Plan notices what changed.**

**The rules, and they are tight:**

- **Names a change in KIND, never a count.** *"You've started going there yourself"* — never *"you did that four times."* A count is a target in disguise, and the shortest road back to a streak.
- **No time comparison finer than "a while ago".** No *"in the last 30 days"*, no week-on-week.
- **Must be rejectable.** The person can say *that's not how it feels* and the coach accepts it without argument. It was an observation, not a finding.
- **Suppression is STRICTER than R1's.** Everything on R1's list — Care Mode, burnout, pain band, bottom mood or energy — plus: never at the start of a session, never within a wellbeing practice, and never on a day the person has reported a low mood at all. Telling somebody with depression what the app has noticed about them, at the wrong moment, is the harm this product exists to refuse.

### 4.6 It must run backwards too

If the pattern reverses, the coach can say so — and this is the wellbeing form of R1's hard conversation:

> *You've been reaching for these less lately. Nothing wrong with that. Has something changed, or shall we try something different?*

🟠 **This is the most sensitive sentence in the product** and I do not think it should ship on my judgement alone. It reads check-in mood and energy — not journal, which is protected absolutely — and check-in data already drives adaptation, so the reading itself is established. **Reflecting it back is the new act.** Recommend: build the forward direction (4.5) first, ship it, and hold 4.6 until there is real beta evidence about how the observation lands.

### 4.7 What this is NOT

- Not a wellbeing score, index, or streak of any kind
- Not a chart of mood, sleep or energy over time
- Not a claim that the person is better. **The coach reports what it did and what it noticed, never how the person is**
- Not therapy, and never phrased as though it were

---

## 4A. Build shape

**Not specified in detail here on purpose.** §1's process finding applies to this document too: the implementing session must open `session-builder.js`, `store.js` and `liftLog` first and record what it finds. What follows is scope and constraint, not a design.

### P-1 — Load progression (first, smallest, most valuable)

The person logs a lift. Next time that movement appears, the coach proposes a step **and says why**.

- Reads `liftLog` — already recorded on every tier, no schema change expected
- Steps **down** as readily as up. A fortnight of low energy lowers the proposal
- Proposal, never prescription. Declining is one tap and is not remarked on
- **Never fires without a target date**, which is what makes it the Plan's

### P-2 — Volume progression

Sets and reps escalate within a movement over a block. Needs a defensible ceiling per exercise — the schema has no field for it, so **schema first.**

### P-3 — Reversal on return

Somebody returning after three weeks away gets a **lower** proposal than they left on. Non-negotiable, and it must be built with P-1 rather than after it. Progression that only remembers the peak is how people get hurt.

### P-4 — The coach's account of it

Every proposed step arrives with its reason. *"You've done 12 kg four times without it costing you much. Shall we try 14?"* This is the sentence somebody quotes to a friend, and it is the whole product in one line.

### Explicitly out of scope

Complexity ladders (needs an exercise graph that does not exist), density, anything rendering progression as a number, and anything that fires on the free tier.

---

## 5. Absolute constraints

**NEVER STREAKS. EVER.** Graeme, 20 Aug: *"never ever ever streaks. Ever."* Recorded as an absolute alongside the safety constraints, not as a preference. No consecutive-session counting, no "don't break the chain", no calendar grid, no reference to a run of any length, in any tier, in any copy, forever. This is a founding constraint and belongs in the banned vocabulary of every gate that checks coach or helper copy.

Also absolute:

- No progression display on the free tier, ever — not as a locked teaser
- No progression proposal in Care Mode, burnout, or the bottom mood/energy band. Same suppression list as R1
- Nothing prescribed by a clinician is ever progressed by the app. `isPrescribed` entries are the specialist's, and `prescribedExercises` already bypasses trimming — progression must bypass them too
- No comparison to any other person, ever

---

## 6. Commercial position, honestly

**Progression is not what makes Year 1 money.** The five-scenario model shows 150–600 free users by end of Year 1 across realistic scenarios; at 4% that is 6 to 24 conversions. Scenario 2 reaches 33 paid users only because **80 come from organisational taster codes.** Year 1 revenue is an org-outreach business, and org outreach is currently blocked on Graeme confirming the categories.

Progression matters from **Year 2**, when the free base is large enough for a conversion rate to mean anything, and it matters most through **churn**, which the model identifies as the decisive variable in all five scenarios.

**What it fixes immediately, regardless of tiers:** the Plan currently under-delivers its own promise. That is a refund-and-bad-review risk in the December soft launch, and it is the reason to build this whether or not it becomes the boundary.

🟠 **Three faults in the pricing model, 20 Jun 2026 v2, found 20 Aug:**

1. It models a single **free-to-paid** rate of 3–6.5%. The funnel is now **two-stage** — free → trial start → paid, with a 30-day card-up-front trial at the *upgrade* point, not at signup. Collapsed into one number it cannot show which stage is losing people, and the fixes are opposite: a low trial-start rate is positioning, a low trial-conversion rate is product.
2. Its pricing is **superseded** throughout — a lower annual rate, a lower beta rate, and a monthly introductory rate since dropped. Needs a banner or a rewrite. **Figures deliberately not repeated here:** `verify-price.mjs` caught this document publishing one of them, which is the gate working as intended. A retired price in a current document is what PRICE-2 exists to stop, and the gate cannot tell quotation from publication.
3. It says **"Build New Habits Ltd"** throughout. The business is not registered.

---

## 7. Decisions for Graeme

| # | Decision | Recommendation |
|---|---|---|
| 1 | Progression as the paid act, structural rather than gated | **Yes** |
| 2 | Build P-1 (load) + P-3 (reversal) together as one item | **Yes — reversal is a safety requirement, not a phase two** |
| 3 | Where does this sit against R1 and R2? | **R1 first.** The hard conversation needs somewhere to point; a target with no rising road makes the conversation harder to have honestly |
| 4 | Difficulty line — finally closed? | **Close it.** §3 |
| 5 | **Free has goals, the Plan has targets** — free onboarding unchanged | **Yes.** §3.1 |
| 6 | **Three goal classes**, with directional goals never acquiring a target | **Yes.** §4.2. The honest limit is worth more than a promise |
| 7 | **Invisible progression** for practised goals, named occasionally (4.5) | **Yes** |
| 8 | The reverse observation (4.6) | **Hold until beta evidence.** Build 4.5 first |

---

## 8. Settled 20 Aug — the upgrade copy

**Impact Credits: no cadence stated.** Graeme: a quarterly vote on a small pot is *"pitching for £0.90 in total."* 🟠 **The vote triggers on pot size, not the calendar.** Threshold to be set. Until then, copy says only that the person gets a say.

**🔴 LEGAL — do not ship: "over double the statutory cancellation period."** Under the Consumer Contracts Regulations the 14-day cooling-off runs from **contract formation, not first payment**, so the statutory right may expire on **day 14, inside the trial**. The sentence would claim more protection than exists, at the moment of deciding. **Cut the comparison.** With Natalie, alongside the existing trial/cooling-off question.

**Approved wording** — states the facts, does no favours. Graeme, 20 Aug, preferring this over the gift-framed draft:

> **You're not the only one this pays for.** 5% of every subscription goes to social action projects, and you get a say in where.
>
> **We won't charge you for 30 days.** Not a penny until day 30. A coaching relationship takes longer than a week to be worth anything — so take the month.
>
> **Cancel any time and go back to free.** Free stays yours either way.

"5% of **every** subscription", not "this year" — the commitment is permanent and must not read as time-limited. P2 helper layer, never coach voice: billing does not speak as the coach.

---

## 9. The trial confirmation screen

🟢 **DECIDED 20 Aug — Graeme's commercial policy:** a **voluntary full refund for 14 days from FIRST PAYMENT**, in addition to any statutory right. This is his to grant and it is granted.

🔴 **STILL OPEN — Natalie's:** whether granting it resolves the CCR position. The schedule records the earlier entry as *"not legal advice and must not be treated as settled"*, and that has not changed. **The two must not be collapsed:** deciding to be generous is not the same as being advised that generosity fixes a statutory problem.

### Why a confirmation screen, not just terms

Under the Consumer Contracts Regulations a distance contract requires pre-contract information **before** the person is bound, and express acknowledgement that an obligation to pay follows. A trial that becomes a subscription without that is where subscription businesses get into difficulty. **The tickbox is the legally meaningful part** — express acknowledgement, not a link nobody opens.

### Draft — for Natalie to mark up, not to ship

> **Before you start your 30 days**
>
> Your Plan starts today. We won't take any payment until **[date]**, 30 days from now.
>
> Cancel before then and you won't be charged at all. You'll go back to the free tier and keep everything you've done.
>
> After **[date]** you'll be charged **£7.99 a month** until you cancel. You can cancel any time, and we'll also honour a full refund for 14 days after that first payment.
>
> ☐ I understand my Plan starts today and payment begins on **[date]**.
>
> **[ Start my 30 days ]  [ Not yet ]**

**Deliberately absent: any comparison to the statutory period.** The line *"over double the statutory cancellation period"* must not ship — under the CCRs the 14 days may run from contract formation and therefore expire on **day 14, inside the trial**. The voluntary refund stands in its place, so nobody has to be told a right quietly lapsed.

P2 helper layer. **Billing never speaks in coach voice.**

---

*Build New Habits · Alongside: Move · The Progression Boundary · 20 Aug 2026 v2*
