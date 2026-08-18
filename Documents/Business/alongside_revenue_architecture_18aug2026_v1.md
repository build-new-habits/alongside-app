# Alongside: Move — Revenue Architecture
## 18 Aug 2026 v1

Build New Habits | What people pay for, why they stay, and the build order that makes it real.

**Status: governing.** This document sits beside `alongside_tier_boundary_12aug2026_v1.md` and supersedes its section 4 boundary (see §3 below). Any proposal that charges for something must pass this document.

---

## 0. How to use this document

This is written so a chat with no memory of the conversation that produced it can pick up and build. It states the reasoning, not only the conclusions, because the conclusions look arbitrary without it and get re-litigated.

**Read order for any session working on revenue, tiers or pricing:**

1. `Documents/Admin/master_schedule.md` — the plan of record, always first
2. This document — why the boundary is where it is
3. `Documents/Business/alongside_tier_boundary_12aug2026_v1.md` — the track analogy in full, still the source of the language
4. `Documents/Business/alongside_destination_architecture_12aug2026_v1.md` — the destination spine

**Standing rules apply unchanged:** version header on every file, schema before code, complete file replacements, touch-once, `sw.js` last in its own commit, WCAG 2.2 AA on all content and UI.

### A note on how this document came to be written

On 18 Aug a decision was taken in one chat — self-direction moves to free, the arc is the paid act — and **it never reached the repository.** No document, no schedule entry. Ten schedule versions then shipped on top of the superseded boundary, and a later session reading the repo correctly reported the old boundary as live, because it was.

That is the failure mode this document exists to close. **A decision that lives only in a conversation has not been taken.**

---

## 1. The finding: staying and paying are different questions

Graeme, 18 Aug: *"Why do people stay? It's because of the relationships."*

That is right, and it is a **retention** answer. It cannot be the **conversion** answer, and the difference is the whole of the commercial problem.

| Question | When it is answered | What answers it |
|---|---|---|
| Why does somebody **stay**? | Month 3 to month 24 | The relationship. History, adaptation, the hard conversations. Nothing else comes close. |
| Why does somebody **pay**? | Day 7 to day 30 | Not the relationship — they do not have one yet. |

The tier boundary document already recorded this and it remains the sharpest sentence in it: *deepening relationship over time — keep as retention, reject as conversion, 97% gone before day 30.*

Somebody deciding at day nine has had two sessions. They cannot feel four weeks of accumulated understanding. **Selling it to them is selling a promise, and this product does not sell promises.**

### The resolution, and it is in Graeme's own anecdote

What separates Anna from the Tuesday-night drop-in is **not accumulated data**. It is that she named a destination — and the moment she did, the coach could say things it could not say before. Her history matters *because there is now something to read it against*.

That is a **state change in a single conversation**, not a slow accrual.

> **Do not sell the relationship. Demonstrate its shape.**
>
> Naming a destination must visibly change what the coach can say — on the next screen, not in six weeks.

Everything in §4 follows from that one line.

---

## 2. What the money actually is

Graeme, 18 Aug, and this is the product thesis in his own words:

> *"All of the exercises, all the build-your-own plans — I can do that from the internet. What I can't get from other apps is a relationship over time, like a real-life coach. It would know my goals, how I perform on certain days, where my energy or mood is low or high, how I can be pushed, how I can be nurtured. It would carry the hard truths. If we're not on course and we can't achieve it, the coach would tell us, and we readjust the plan."*

Five capacities are named there. Ranked by how distinctive each is in the market, because that ranking is the build order:

| # | Capacity | Distinctiveness | Built? |
|---|---|---|---|
| 1 | **Carries the hard truths** — tells you when the target is not going to happen, and helps you move it | Very high. Competitors ignore the date or shame you about it. | ❌ **No code exists** |
| 2 | **Knows your goals and works toward them** | High | 🟡 Partial — target is stored, displayed, never reasoned against |
| 3 | **Knows how you are pushed vs nurtured** | High | 🟡 Partial — `assessment`, `sessionMode`, capability system |
| 4 | **Knows your history and reads it** | Medium — several apps claim it | 🟢 `progress.js` reads vs records (§4.1 of tier doc) |
| 5 | **Adapts to today** | Low — table stakes | 🟢 Free, and stays free |

**Capacity 1 is the money and it is unbuilt.** Ground-truthed 18 Aug: `strategicGoal.targetDate` is written by onboarding, persisted by `store.js`, and rendered by `my-programme.js` and `today.js`. Nothing anywhere compares it to progress. There is no off-course detection, no renegotiation, no path to moving a date.

### The 5% is not a feature, it is the same argument

Graeme, 18 Aug: *"The money you're putting in is about the human element."*

The five-percent social action commitment is **not** a conversion lever — this was tested and rejected on 12 Aug (*"why not just give them a pound?"*). It is part of the same proposition as the coaching relationship: both say the thing you are buying is human attention rather than a feature list. **Keep it, keep it visible, never price against it.**

---

## 3. The boundary, restated

This **supersedes** section 4 of `alongside_tier_boundary_12aug2026_v1.md`, which reads *"Full body only. The coach decides. No session-type or duration selection."* That sentence is retired.

> ### Free is today. The Plan is the arc.

**The two coaching relationships, neither lesser.** Graeme turns up at the athletics club on a Tuesday. The coach asks what he wants to do, and gives him a real session — properly judged, adapted, worth having. He comes back a second time and the coach says *"oh, hello — same as last time, or something different?"* That is warm, it is real coaching, and **it holds no arc.** Anna's coach holds her history, her injuries, her goals, and the hard conversations about moving a date.

### What is free

- Choosing what you do today — session type, duration, activity, how it is built. **Self-direction is an accessibility feature.** Charging for it penalises the person mainstream fitness culture already fails worst: the person who knows their own body better than any system does, and who needs to override the default because the default hurts.
- A real session, adapted to today: energy, pain, capability, equipment
- **Recognition between sessions without an arc** — see R3. Not currently built.
- Every safety feature, permanently. Care mode, condition-aware exclusion, red-flag escalation
- The empathy transfer arc, grounding moments, In Step, all wellbeing practices
- A record: fourteen days of what you did. Lift notes and recall

Free is **complete in itself and limited in horizon**. Nothing in it is degraded. What is missing is a destination, not quality.

### What the Plan is

- **You name what you are working toward, and the coach builds the road**
- **It carries the hard truths.** When the date is not going to happen, it says so, and helps you move it (R1)
- Every session arrives with its reason attached
- The road moves when life does — ill for a week, flat for a fortnight, ahead of schedule
- Chapters that follow on from one another
- Progress that **reads** rather than records (tier doc §4.1)
- Impact credits and the community vote

### Why this is more honest than the old boundary

The old boundary charged for **control**. Traced across personas on 18 Aug: the people the product serves best never met that paywall, and the people who would have paid for control hit a library that is 393 of 551 entries at difficulty 1–2. It was **charging the wrong people for the wrong thing**, and it made the free tier a place where the coach quietly refused to let you choose.

The new boundary charges for **continuity**, which is the only thing free genuinely cannot contain.

---

## 4. The build order — R1 to R5

Nothing here is blocked on anything except R5. R1 to R4 are buildable now.

---

### R1 — The hard conversation

**The single most distinctive thing in the product. Zero lines of code today.**

#### What it is

When somebody has named a target with a date, and the honest arithmetic says that date is not going to work, the coach says so — plainly, without shame, with real options.

Not a progress bar. Not a percentage. Not a notification. **A conversation offered once, at a sensible moment, that the person can decline.**

#### What the coach may honestly say

The coach may only speak to what it actually measures. It measures two things relevant here, and it must not imply a third:

1. **Rate** — sessions actually completed per week, against `strategicGoal.weeklySessionTarget` (default 3)
2. **Capability** — `assessment.history[].measuredLevel` movement over time against `assessment.baseline`

It does **not** measure performance against an external standard, so it must never predict whether somebody will run a given time or lift a given weight. Any copy implying prediction is out of scope and out of register.

#### Available fields — all live, none new required for detection

| Field | Shape | Use |
|---|---|---|
| `strategicGoal.targetDate` | ISO string \| null | The date under discussion |
| `strategicGoal.targetDescription` | string | What it is, in their words |
| `strategicGoal.weeklySessionTarget` | integer, default 3 | The rate they set |
| `strategicGoal.setAt` | ISO \| null | How long the target has stood |
| `activityLog` | array | Actual sessions, for the trailing rate |
| `assessment.baseline` / `.history` | see `store.js` v54 | Capability movement |
| `programme.chaptersDone` | array | Arc progress |

#### New schema — schema first, before any view code

Add to `strategicGoal`:

```
review: {
  lastOfferedAt: null,   // ISO | null — throttle
  outcomes:      []      // [{ at, choice, fromDate, toDate }]
}
```

`choice` is one of `"moved"`, `"reshaped"`, `"kept"`. `store.js` → v55, `Schema.md` → v1.37, `mergeWithDefaults()` so existing users receive it without data loss. **No code reads it until both are shipped.**

#### Trigger conditions — all must hold

- A `targetDate` exists and is more than 14 days away (inside 14 days there is nothing useful to move)
- `setAt` is at least 21 days ago — the coach does not judge a target it has barely seen
- Trailing four-week completed-session rate is **below 60%** of `weeklySessionTarget`
- `review.lastOfferedAt` is null or more than 28 days ago

#### Suppression conditions — any one blocks it, permanently for that session

**This is the safety half and it matters more than the feature.** Telling somebody in burnout that they are off course is precisely the harm this product exists to refuse.

- Care Mode active
- Burnout detected (`detectBurnout()`)
- Pain at or above the acute-safe threshold (see SEVERE-1)
- Today's check-in mood or energy in the bottom band
- Mid-session, mid-check-in, or anywhere inside a wellbeing practice

**Where it appears:** My Programme, on open. Never on Today, never as a push, never interrupting anything. The person navigates to it.

#### The three options — all three always offered

| Option | Meaning |
|---|---|
| **Move the date** | Same target, later. Date picker. |
| **Reshape the target** | Same date, different target. |
| **Leave it as it is** | A real, unpenalised, unnagged choice. Some people want the date to stay. |

"Leave it as it is" must not be styled as the lesser option, must not trigger a follow-up, and must set `lastOfferedAt` exactly like the others.

#### Voice — P4 is Locked, and this is the hardest place in the product to hold it

The coach **points at what it noticed and attaches no verdict.** State the arithmetic, offer the choices, stop.

Draft, for the copy pass, not final:

> You set **[target]** for **[date]**, and three sessions a week.
>
> Over the last month that has been about **one and a half**. At that rate, **[date]** is going to be a harder ask than it needs to be.
>
> Nothing has gone wrong. Life does this. But I would rather say it now than in February.
>
> **[ Move the date ]  [ Change the target ]  [ Leave it where it is ]**

**Banned throughout:** "behind", "failing", "falling short", "should", "only", "just", any percentage-complete against a goal, any comparison to other people, any exclamation mark. **Required:** the person's own words for their target, and a sentence that removes fault before the options appear.

#### Gate — `tools/verify-hard1.mjs`

**This gate must execute, not grep.** 43 of the 77 existing gates are source-text only, and this is exactly the class where that fails: the code can be present, correct, and unreachable.

Minimum assertions, each reversal-tested and confirmed to fail before shipping:

1. Every suppression condition blocks the offer — **mounted, seeded, one case each**
2. All three options render, and "Leave it where it is" is a real control with a handler
3. The throttle holds — a second mount inside 28 days offers nothing
4. Free tier never sees it
5. No banned word appears in any branch of the copy
6. A verdict is never attached to a count (same property `verify-tier` TIER-E already asserts for free progress)

**Do not write a negative distance window.** SWEEP-1's finding, 18 Aug: a negative window goes silently green the moment the thing it forbids drifts past the limit. Bracket-match or name the region.

---

### R2 — The naming moment

**The conversion mechanic. The only one that does not make the person wait.**

Onboarding already asks what the person is hoping for, and that question stays (tier doc §5). What is missing is the demonstration: **naming a destination must visibly change what the coach can say, in that session.**

The implementing chat must ground-truth `js/views/onboarding/goal-setup.js` and `js/views/my-programme.js` before designing anything — this spec deliberately states intent and acceptance criteria only, because the last thing this stream needs is another spec written against a file nobody opened.

**Acceptance criteria:**

- A free user who names a destination sees, before the end of that session, at least one thing the coach could not have said beforehand — drawn from real data, not a mock
- The difference is **shown, not described**. No feature list, no "with the Plan you would get…"
- It is the **P2 helper layer**, visibly distinct, never coach voice (tier doc §6)
- Declining is one tap and is never asked again in that session
- The free product is complete whether or not the person names anything

---

### R3 — Recognition without an arc, in free

**Cheap, warm, and it is what earns the recommendation.**

Graeme's session-two line: *"Oh, hello. What are you doing here? Do you want the same as last time, or something different?"*

Free currently has none of this. The second session looks like the first. The drop-in coach remembering you is **not** the arc — it is ordinary courtesy, it costs nothing, and it is the difference between a tool and somebody who knows your face.

**And it is the honest door.** The moment the coach says *"same as last time?"* is the moment the absence of a destination becomes **felt** rather than advertised. That is worth more than any locked badge.

- Reads the most recent `activityLog` entry only. **One session back, never a pattern.**
- Offers "same again" or "something different", both one tap
- Never counts, never scores, never says how many times
- Free, permanently. Gating this would be gating politeness.
- **Hard boundary:** if it ever reads more than one session back, it has become the arc and belongs behind the Plan. The gate must assert the single-entry read.

---

### R4 — Self-direction moves to free

The gate and code work. **Order is non-negotiable: document → gate → code**, because `verify-tier.mjs` names section 4 of the tier boundary document as its source of truth, and changing code first leaves a gate defending a claim the product no longer makes.

**Step 1 — the document.** `alongside_tier_boundary_12aug2026_v1.md` → v3. Replace §4 with §3 of this document.

**Step 2 — the gate.** `verify-tier.mjs`:

- TIER-A currently asserts by name that `mobility-conditioning` and `yoga` carry `tier: 'personal'`. **Invert it** — assert those doors are *not* gated.
- TIER-B currently asserts `library.js` has **at least 11** `tier: "personal"` tags. **A smaller floor is the wrong replacement** — a floor can be satisfied by the wrong eleven. Name the surfaces that stay paid and assert the **absence** of tags on those that move, the same load-bearing-absence shape `verify-name1` uses.
- The TIER-A **safety** half is unaffected and correct. Do not touch it.

**Step 3 — the code.**

| File | Change |
|---|---|
| `js/views/today.js` | Remove `tier: 'personal'` from `mobility-conditioning` and `yoga` in `HOME_DOORS` |
| `js/views/library.js` | Remove the tier tag from the five At-home session types, the five activity categories (Run, Walk, Swim, Cycle, Yoga) and the four gym session types. **Keep it on "My programme"** — that one is continuity, and a blanket untag frees it by accident |
| `js/views/session-builder-ui.js` | Unlock the session-type picker, duration picker, allocation presets and build-mode step. Free reaches the location step: `phase = isPremium() ? "location" : "equipment"` must go |
| `sw.js` | Last, alone, cache bump |

**Three still open — Graeme's call, listed so they are not decided by default:**

1. **`session-log.js` `bestLine()`** — personal bests gated. A best is a fact about the person's own log, and free already includes lift notes and recall. Recommendation: **move to free.**
2. **`progress.js` export lock** — exporting your own data. If self-direction is an accessibility argument, data portability is its strongest form. Recommendation: **move to free.**
3. **`library.js` "My programme"** — continuity, correctly paid. Recommendation: **stays paid.**

---

### R5 — Stripe

**The only item that literally takes money, and the only one that cannot be delegated.**

Stripe needs a business bank account, which needs **HMRC sole trader registration**. R1 to R4 are all buildable this week and none of them earns a penny until this moves.

`£44.99` is a **Stripe coupon**, December 2026, beta cohort only, locked once taken. It does **not** enter the app: no constant in `js/data/pricing.js`, no view, no date logic. It is what a specific set of accounts is charged, which is Stripe's job. Publishing it in the app would invite a view to render it to somebody who cannot have it.

---

## 5. Pricing — closed

| Term | Value |
|---|---|
| Monthly | **£7.99**, flat, from day one |
| Annual | **£59.99** from launch. Launch is **1 January 2027**, so "from launch" and "from January" name the same date — there is no conflict between the app, the schedule and the ToS |
| Beta annual | **£44.99**, December 2026 only, locked permanently once taken. Stripe coupon, not app code |
| Trial | 30 days, card at signup, no charge during |
| Rate rises | **Never, for anyone.** Every price set now is set permanently for the cohort that matters most |
| Year 2 | Deferred to Year 2, decided on real data |
| Community organisation | £39.99 Year 1, £49.99 Year 2+ |
| Taster code | 1 month free |

Truth lives in `js/data/pricing.js` (v1, `PRICE_MONTHLY` and `PRICE_ANNUAL`). Everything else in the repo must agree, or carry the visible superseded-pricing banner that `tools/verify-price.mjs` looks for. The gate enforces it.

🟠 **A gate fault found by this document, 18 Aug — logged, not fixed here.** `verify-price.mjs` excuses any file containing the banner string, and it read *this* file's description of the mechanism as a self-declaration. **A document that merely discusses the banner exempts itself from the sweep, silently.** That is the same shape SWEEP-1 named the same day: not a loud failure, a quiet green. The excuse should require the banner to be a banner — near the top, in a position a reader would see — rather than any occurrence anywhere in the file. Needs its own scoped session with a reversal test.

### The month-six offer

Graeme, 18 Aug: *"It's an offer rather than an upgrade. It's just offering to save you some cash. It's an honest thing."*

🟠 **This changes the brief.** The earlier 18 Aug note recorded *"framed as a longer relationship, never as a saving"*. Graeme's later instruction is the operative one: **the saving is the honest thing, and it is stated.** Recorded so the reversal is visible rather than looking like drift.

**It is the P2 helper layer, not the coach.** Billing does not speak in coach voice — no *"I've noticed"*.

Draft copy, for the build session:

> **About your subscription**
>
> You have been paying monthly for six months. The annual plan is £59.99 — about £36 less over a year than twelve payments of £7.99.
>
> Same plan, nothing changes. Just cheaper, if it suits you.
>
> **If you think you might stop before the year is out, stay monthly. It will cost you less.**
>
> [ Switch to annual ] [ Not now ]

**That last line is deliberate and should survive review.** It is the pub-test sentence — *my fitness app told me the cheaper option might not suit me* — and word of mouth is the only channel this business can afford. It costs almost nothing, because the people it protects are the ones you would not want locked in.

**Mechanics:** computable from the subscription start date at render time. No scheduled job, no cron, no email send, zero ongoing admin. Six months rather than twelve: at twelve you are discounting people you already have.

**Honest accounting, recorded so nobody re-derives it as a surprise:** £7.99 × 12 = £95.88 against £59.99. At the model's own 6% monthly churn, somebody still paying at month six has a long expected remaining life, so this **loses money** on anyone who would have stayed. It is an honesty move and the cost is the point. Detecting who is about to leave in order to pitch them is precisely what this product refuses to do.

🟠 **Open:** `£44.99` forever has **no cohort cap** — December bounds who can take it, nothing bounds how long it runs. Needs a line in the ToS. Natalie also still holds the trial / cooling-off question.

---

## 6. What the money is not

Recorded so these are not re-proposed. Each was argued and rejected with reasons.

| Rejected | Why |
|---|---|
| Manufactured friction | *"The pub test kills it."* 12 Aug |
| Impact allocation as the paid tier | *"Why not just give them a pound?"* 12 Aug |
| Deepening relationship as the **conversion** argument | 97% gone before day 30. Kept as retention — see §1 |
| Charging for control / self-direction | Penalises the person the product exists to serve. Superseded 18 Aug — see §3 |
| Monthly introductory rate | Put a 60% price rise at month four, in the churn window. Dropped 18 Aug |
| Progress as a bigger number (14 days vs 90) | Selling a bigger number. Must differ in **kind** — tier doc §4.1 |
| Gating any safety feature, ever | Founding constraint, not a preference |

---

## 7. Open decisions for Graeme

| # | Decision | Recommendation |
|---|---|---|
| 1 | Personal bests — free or paid? | Free |
| 2 | Data export — free or paid? | Free |
| 3 | Cohort cap on £44.99-forever | Cap by cohort as well as by December |
| 4 | Month-six copy — does the "stay monthly" line survive? | Keep it |

---

## 8. Schedule entries

Added to `master_schedule.md` v207 as a new stream. Status tags per the standing protocol.

| ID | Task | Status | Target |
|---|---|---|---|
| **R1** | The hard conversation — schema, detection, suppression, three options, `verify-hard1` | 🔵 Specified, not built | w/c 24 Aug 2026 |
| **R2** | The naming moment — demonstration at onboarding | 🔵 Specified, ground-truth first | w/c 24 Aug 2026 |
| **R3** | Recognition without an arc, in free | 🔵 Specified, not built | w/c 24 Aug 2026 |
| **R4** | Self-direction to free — doc, gate, code | 🔵 Specified, not built | w/c 24 Aug 2026 |
| **R5** | Stripe | 🔴 Blocked on HMRC sole trader registration | Blocked |
| **R6** | Month-six annual offer | 🔵 Specified, blocked on R5 | After R5 |

---

*Build New Habits · Alongside: Move · Revenue Architecture · 18 Aug 2026 v1*
