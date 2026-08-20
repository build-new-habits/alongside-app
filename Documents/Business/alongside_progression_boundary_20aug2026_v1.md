# Alongside: Move — The Progression Boundary
## 20 Aug 2026 v1

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

## 4. Build shape

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

*Build New Habits · Alongside: Move · The Progression Boundary · 20 Aug 2026 v1*
