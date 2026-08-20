# Alongside: Move — The Gear Change
## 20 Aug 2026 v1

Build New Habits | How somebody sees they have changed, without a number they can fail.

**Status: proposed.** Decisions in §9. Sits under `alongside_progression_boundary_20aug2026_v1.md` v2 and `alongside_tier_boundary_12aug2026_v1.md` v3.

---

## 1. The gap this closes

The progression boundary (§4.2) says **directional goals never acquire a target** — dating *"enjoy exercise"* is absurd, and for somebody whose relationship with exercise is the injury, harmful.

Graeme, 20 Aug, spotted the consequence: *"what about the user seeing their own progress? Whether the coach reflects some kind of moment they changed a gear."* **Those people would have nothing to see at all**, and that is not the same as protecting them.

### The resolution

> **A target is a destination. A gear change is a noticing.**
>
> **Directional goals get no target — and still get gear changes.**

Nothing is promised, so nothing can be failed. The person whose goal is *"enjoy exercise"* never gets a date. They do get: *"You've started choosing this yourself."*

---

## 2. Why this is a business decision, not only a product one

**Honest position: this improves RETENTION, not conversion. It is second-order to R1 and to HMRC registration**, and it should not displace either.

But the pricing model's own conclusion is that **a 1% improvement in churn outweighs doubling acquisition** — and churn is where this works:

- **What makes somebody cancel a coaching subscription is the feeling that nothing is happening.** The gear change is the antidote, delivered without a metric that can be failed.
- **It is what people say out loud.** *"My app noticed I'd started doing this without being asked."* Word of mouth is the only channel this business can afford.
- **It is hard to copy.** Anyone can clone a progress bar. Nobody clones noticing well, because it needs the check-in history, the coaching logic and the discipline not to turn it into a score.

**What it is NOT:** a conversion mechanic. A free user cannot see gear changes (§6), so it cannot sell anything at day nine. R2 remains the conversion work.

---

## 3. The six properties

These are what make it safe, and they are why it can run across the entire app rather than living in one view.

| # | Property | Why |
|---|---|---|
| 1 | **Retrospective only** | Never announced in advance. **You cannot fail to reach something you did not know existed** |
| 2 | **Discrete, not continuous** | A moment, not a bar filling. Nothing to be part-way along |
| 3 | **Named, never numbered** | The instant they can be counted, they are a score. **No total, no list, no "your 4th"** |
| 4 | **Cannot be lost** | Once noticed, it stays noticed. Going backwards does not un-notice it. **This is precisely what separates it from a streak** |
| 5 | **Rejectable** | *"That's not how it felt"* is accepted without argument. It was an observation, not a finding |
| 6 | **Never comparative** | Nobody else's gears. Not against other users, not against a norm, not against the person's own best |

**Property 4 is the load-bearing one.** A streak is a thing you can break; a gear change is a thing that happened. If any future surface lets a gear change be revoked, downgraded or re-earned, **it has become a streak and must be removed.**

---

## 4. What counts, by domain

A gear change is always **a change in KIND**, never in quantity.

| Domain | The gear change | Observable from |
|---|---|---|
| **Capability** | A measured level moved at reassessment | `assessment.history[].measuredLevel`, `chaptersDone[].measuredLevelAtEnd` |
| **Autonomy** | A practice the coach used to suggest is now self-initiated | Prompted vs self-entered — progression boundary §4.3 |
| **Fluency** | A movement stopped needing its cues | `exerciseStats(id).n` past the mastery threshold |
| **Range** | A whole category entered for the first time and stayed | `activityLog` category first-appearance, then recurrence |
| **Context** | Training somewhere or with something new, and it stuck | `location`, equipment changes that persist |
| **Return** | Came back after a gap and kept going | `activityLog` gap followed by sustained recurrence |
| **Honesty** | Told the coach something they had not said before — a condition, a limit, an injury | Onboarding-thread and conditions updates |

**"and it stuck", "and kept going" are doing real work.** A gear change is a change that held, so **none of these may fire on first occurrence.** One yoga session is not a range change. Coming back once is not a return. The confirmation delay is what makes the observation true, and it is also what stops the app congratulating somebody for a thing they did once and abandoned.

### What is explicitly NOT a gear change

- Anything countable: sessions done, weeks active, minutes moved
- Anything the person could aim at deliberately
- Anything that could be said twice about the same change
- **Weight, in any form.** Weight is a target type for those who choose it; it is never a gear change, because weight moves for reasons that have nothing to do with the person's effort and this product must not imply otherwise

---

## 5. Where it attaches — the hinge

**Ground-truthed 20 Aug.** `programme.hingeOfferedAt` exists, with `isHingePending()` in `programmeEngine.js` and `_hingeCard()` in `today.js`. One offer per hinge; an unanswered hinge does not quietly disappear.

**The hinge is already the place the app pauses between chapters.** Today it asks a **forward** question — what next. **The gear change is the backward half of the same moment**, and it should sit there rather than acquiring a surface of its own.

`chaptersDone` already records `measuredLevelAtEnd` with the comment *"recorded, never shown as a score — it is what the next chapter's offer reasons from."* **A completed gear change is already being written and nothing reads it back to the person.** Same reader-less pattern as `sessionVariety` before DIC-1 and `goalHasTarget` today.

**Directional goals have no chapters**, so they need a second attachment point. Recommendation: **the check-in opening**, at most once per calendar month, using the same throttle discipline as R1. Not Today, not mid-session, never a notification.

🟠 **Not designed here.** The implementing session must open `checkin-openings.js` and `today.js` `_hingeCard()` before proposing a shape. §1 of the progression boundary applies: **three specs were written against unopened files on 20 Aug, and writing the rule is not following it.**

---

## 6. Tier

**A gear change is a READ.** Tier boundary §4.1: free records what happened, the Plan notices what changed.

| | Free | The Plan |
|---|---|---|
| The change happens | Yes | Yes |
| It is recorded | **Yes — fully.** Nothing is withheld from the log | Yes |
| The coach says it | **No** | **Yes** |

**Free loses nothing it had.** Somebody converting after four months brings four months of unremarked gear changes with them — and `store.js` has no tier gate on any write, so this is already true and needs no work. 🟠 **Whether the coach may then name changes that happened while the person was on free is an open question.** Recommendation: **yes** — the change is theirs, the record is theirs, and a coach who pretended not to have seen it would be lying. But it must never be delivered as a backlog of six at once. One at a time, at hinges, in order.

---

## 7. Voice, and the forms that must never appear

The coach **names what it noticed and attaches no verdict.** P4 applies unchanged.

> *When we started, I was the one suggesting you take a minute before we began. The last few times, you got there before I did.*

> *You've been coming back to the bike. First time that's stuck.*

**Required:** the person's own words where they exist. A sentence that states the change and stops. **Rejectable in one tap.**

**Banned outright:**

- **Any streak, in any form, forever.** No consecutive counting, no chain, no calendar grid, no run of any length. Absolute — Graeme, 20 Aug: *"never ever ever streaks. Ever."*
- Counts of any kind: *"four times"*, *"three weeks"*, *"your 2nd"*
- Time comparisons finer than *"when we started"* / *"lately"*
- Congratulation. **"Well done" is a grade.** The coach observed something; it did not award it
- Exclamation marks, confetti, badges, levels, unlocks, any celebratory animation
- Any implication the person should now maintain it

---

## 8. Safety

**Suppression is the progression boundary's list (§4.5), unchanged and non-negotiable:** Care Mode, burnout detected, pain at or above the acute-safe threshold, bottom band of today's mood or energy, mid-session, mid-check-in, inside any wellbeing practice — **plus** never on a day the person has reported low mood at all.

**Additional, specific to this:**

- **Never fires on the honesty gear change in the same session it was earned.** Somebody who has just disclosed a condition is not to be told the app noticed them disclosing it
- **Never more than one per hinge**, however many are pending
- **The Journal Privacy Rule is untouched.** No gear change may be derived from journal content, ever, under any circumstance

---

## 9. Decisions for Graeme

| # | Decision | Recommendation |
|---|---|---|
| 1 | Gear changes as the cross-app "you have changed" mechanic | **Yes** |
| 2 | Directional goals get gear changes but never targets | **Yes** — §1 |
| 3 | Gear changes are a read, therefore the Plan only | **Yes** — §6 |
| 4 | May the coach name changes that happened while on free? | **Yes**, one at a time, never as a backlog |
| 5 | Second attachment point for directional goals | **Check-in opening, monthly at most** — needs a discovery session first |
| 6 | Build order | **After R1.** This is retention; R1 is the product's most distinctive capacity and still has zero lines |

---

## 10. Honest scoping

**This is the fifth document produced on 20 Aug and no R-stream code has been written.** The order that serves the business:

1. **HMRC sole trader registration** — Graeme's, blocks Stripe, blocks all revenue
2. **R1, the hard conversation** — the most distinctive thing in the product, still zero lines
3. **P-1 + P-3, load progression with reversal** — the Plan currently under-delivers its own promise
4. **This**

**Nothing here should be built before those.** It is written now because the idea is cross-cutting and would otherwise be re-derived badly in three separate places — not because it is next.

---

*Build New Habits · Alongside: Move · The Gear Change · 20 Aug 2026 v1*
