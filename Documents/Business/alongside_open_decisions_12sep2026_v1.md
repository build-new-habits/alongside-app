# Alongside: Move — Four Open Decisions
## 12 Sep 2026 v1

Build New Habits | Options and a recommendation for each of the four things left from the 12 Sep device test. **Nothing here is built.**

Read against `alongside-v498`, master schedule v340, 144 gates. Numbers measured on the live library today, not carried over.

---

## Decision 1 — Practices: 28 today, 164 if the gap is closed

### The situation

`isSessionLength()` excludes anything ten minutes or longer from session building, because a 25-minute treadmill block is not one of ten slots in a 40-minute session. **164 entries meet that bar.** The Practices route is supposed to home them, but it excludes whatever a session type "can reach" by category — without applying the length rule — so **136 fall in the gap and appear nowhere.** Practices shows 28.

What is in the 136:

| | |
|---|---|
| By library category | cardio 90, recovery 21, mobility 9, mindfulness 9, strength 7 |
| By length | 45 are 10–15 min, 17 are 15–20, 48 are 20–30, 26 are over 30 |
| Equipment-gated | 45 of 136 |
| Examples | Brisk Walk, Steady Cycling, HIIT 30:30, Walk-Run Intervals, Stair Climbing, Dance Freestyle, all nine machine blocks |

Current groups are Recovery (11), Grounding and calm (12), Warm-ups (2), Circuits (3).

### The options

**A. Close the gap, show all 164 in the existing four groups.** One rule change. But 90 cardio entries would land in groups that have no home for them, and a list of 164 with no filtering is the "restricted by the way I could get to them" problem in a different room.

**B. Close the gap, add groups for what arrives.** The rule change plus new groups — Cardio, Machines, Longer sessions — sized so nothing holds 90. More content work, and the group names are a product decision.

**C. Close the gap, filter by equipment.** Only show what the person can actually do. Drops roughly 45 for somebody with nothing, which fixes the 164-item wall for them and leaves it for a gym member.

**D. Leave it. Fix only the machines, through the Gym session type (decision 4).** The 136 stay invisible. Honest about capacity, and it leaves authored content unreachable for months.

### Recommendation: **B, then C as a second session**

Close the rule gap and add groups in one session, because the rule change without groups produces a worse screen than today. Equipment filtering is a separate, smaller change and it needs its own thought about whether "you cannot do this" should hide a thing or mark it.

**One thing to decide inside B: what the groups are.** A proposal, sized so none is overwhelming:

| Group | Roughly |
|---|---|
| Cardio and conditioning | 60 |
| Machines | 13 |
| Recovery | 32 |
| Grounding and calm | 21 |
| Mobility | 11 |
| Strength circuits | 10 |
| Warm-ups | 2 |

Cardio is still the big one at 60. If that is too many, it splits by length — under 20 minutes and over — which is the split a person actually makes.

**What it is worth:** 136 pieces of authored content currently reachable by nothing. This is the third time this shape has appeared — 28 orphaned practices in August, the machines this week, these 136 now.

---

## Decision 2 — SEARCH-1b: the search box

Vocabulary shipped today. What is left is where the box goes and what it does when it fails.

### The options for placement

**A. In the swap sheet only.** Where Graeme hit the wall. Smallest change; the thirteen groups stay and search filters them.

**B. In the swap sheet and the Library.** Two entry points, one component. More useful, more surface to get right.

**C. A search route of its own.** Biggest, and it competes with Practices and the Library for the same job.

### Recommendation: **A now, B after beta**

He hit this while swapping, and the swap sheet is where a person is already looking for something specific. The Library can adopt the same component once it has earned its place.

### Three things it must do, whichever placement

1. **Name the area it searched.** "Lats" returns upper-back work. Without a line saying so, the results look wrong.
2. **Say when it does not know a word**, rather than showing an empty panel. The vocabulary refuses unknown words on purpose so the box can say "I don't know that one" and offer the groups back.
3. **Never return an empty result silently.** Every term in the vocabulary is gated to reach at least one real exercise, but a filter combination (equipment, condition) can still empty it — and that needs its own sentence.

---

## Decision 3 — CARD-4: the placeholder wording

Both structural decisions are taken: four pages, hazards on their own page, built before the images exist. What is left is one line of copy and one safeguard.

### Options for the placeholder

**A. "Images will appear here."** Graeme's own phrasing. Plain, and says nothing about when.

**B. "Photographs are being added — for now, the video shows the movement."** Points at what already exists. Every entry has a video link, so this is true today and useful.

**C. Nothing at all — no slot until there are images.** Then CARD-4 is rebuilt when images arrive, which is the two-rewrites outcome the decision to build now was meant to avoid.

### Recommendation: **B**

It is honest about the state and it hands the person something that works instead. The video is already on the DO page; the placeholder should point at it rather than sit beside it apologising.

**The safeguard, which is not optional:** a gate asserts the placeholder is gone once the image library is marked complete. Without it, "right for beta, not for public launch" becomes permanent by default. That is the only thing that makes shipping a promise on screen safe.

---

## Decision 4 — GYM-MIX-1: the shape of a Gym session

Agreed as a new session type. What it needs is a recipe, and the recipe is the decision.

Graeme's own session: cross trainer, lat pulldowns, dead bugs, treadmill.

### The options

**A. One long block plus lifts.** Machine warm-up (5 min), one machine conditioning block (15–25 min), 2–3 lifts, one core, one stretch. Closest to what he did.

**B. Two short machine blocks, one at each end.** Machine warm-up, lifts, machine finisher. Fits the existing slot model better — but there are no short machine blocks. Every one is 15–30 minutes, so this needs new content.

**C. Lifts only, machines reached separately through Practices.** No new type. The machine is a whole thing you choose, the session is the lifting. Smallest, and it matches how gyms actually work — but it is two taps for one visit to the gym.

### Recommendation: **A**

It is the session he described, and it is the only one that needs no new content. The work is a slot shape that tolerates one long item, which is exactly what `isSessionLength()` currently forbids — so the type needs an explicit exemption for its own conditioning slot, rather than the rule being loosened everywhere.

**A dependency worth naming:** option A works whether or not decision 1 is taken. The machines reach the Gym type through its own slot, not through Practices.

---

## In one line each

| | Decision | Recommendation |
|---|---|---|
| **1** | Practices, 28 → 164 | **Close the gap and add groups in one session.** Equipment filtering separately |
| **2** | Search box | **Swap sheet first**, Library after beta. It must name the area it searched |
| **3** | Image placeholder | **Point at the video** that already exists, with a gate that removes the placeholder when images land |
| **4** | Gym session shape | **One long machine block plus lifts**, with an exemption scoped to that slot |

**If only one is taken now: decision 4.** It is the one Graeme met in a gym, the content already exists, and it needs no other decision to proceed.
