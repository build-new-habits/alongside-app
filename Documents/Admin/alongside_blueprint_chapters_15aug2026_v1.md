# Alongside: Move — Chapters, Hinge Points and My Programme

## Blueprint · 15 Aug 2026 v1

Build New Habits | The programme layer, redesigned. Supersedes the chaining approach shipped as CHAIN-1 without discarding it — the chains become defaults at a hinge rather than a fixed track.

---

## 1. Where this came from

Graeme, 15 Aug: *"I wonder whether your instinct to ask about being 'ready' is correct? Does it move too quickly? Can we extend the programmes to 52 weeks of something?"*

And then, decisively: *"What if we give users the choice of the two different programme choices?"*

That is the design. What follows is the reasoning and the shape.

---

## 2. What already exists, and is empty

Checked before designing anything, because two assumptions today turned out wrong.

| Field | State |
|---|---|
| `strategicGoal.weeklySessionTarget` | Live — 23 readers |
| `strategicGoal.setAt` | Live — 8 readers |
| `strategicGoal.primaryGoal` | **Declared, written by nothing** |
| `strategicGoal.targetDescription` | **Declared, written by nothing** |
| `strategicGoal.targetDate` | **Declared, written by nothing** |
| `strategicGoal.targetValue` / `targetUnit` | **Declared, written by nothing** |

A goal-with-a-date structure has been sitting unused. That is exactly the "something coming up" case, and it means this work fills a shape rather than inventing one.

The ten destination shapes from the tier model are **not built** — `goals.js` is the onboarding list only. Not needed for this blueprint; noted so nobody assumes otherwise.

---

## 3. The evidence, because it changed the design

Searched rather than assumed.

**Milestones work.** The goal-gradient effect — motivation rises as perceived distance to a goal shrinks — has held since Hull, 1932. Kivetz, Urminsky and Zheng showed endowed progress in people: a twelve-stamp card with two stamps pre-filled completes faster than a ten-stamp card needing the same ten purchases.

**So a purely open-ended state loses something real.** My first instinct — dissolve programmes into one continuous arc — was half wrong.

**But the standard implementation is the escalation trap.** Progress visualisation accelerates behaviour near completion *by amplifying perceived obligation*, working by ensuring completion is always visible, always close and rarely final. That is a progress bar doing to somebody exactly what persona 2.5 named as her territory.

**And the comparable data favours autonomy.** Down Dog's flexible weekly goals — rather than requiring daily participation — produced a 20% rise in 90-day retention. A 2,771-user study found retention higher among people with autonomous (intrinsic and identified) motivation.

**The synthesis, and the rule for this whole feature:**

> **Keep the milestone. Remove the countdown. Show progress made, never distance remaining.**

---

## 4. Two presentations, one engine

Graeme's call, and it is better than either single model.

Underneath, both are identical: *assessment → chapter → hinge → reassessment → next chapter.* Only the framing differs.

| | **Chapters** (default) | **Blocks** |
|---|---|---|
| Framing | Ongoing, no end date | Defined, twelve weeks |
| Progress | Backward — "three chapters in" | Backward — "week 9 done" |
| At the hinge | Coach offers what is next | "That's complete", then choose |
| Suits | 2.5, 2.8, 2.11, 2.13 | 2.6, 2.7, 2.15 |

**One flag, two vocabularies. Not two engines.** Two engines is two places for a moment to land in only one, which is the fault shipped eleven times on 15 Aug and fixed by SHARED-1.

**Even in Blocks, weeks COMPLETED — never weeks remaining.** If Blocks needs a countdown to feel like Blocks, the choice was cosmetic and that is worth discovering early.

**Offered at the first hinge, never at signup.** Choosing between two structural models you have not experienced is a decision nobody can make well, and it is the pre-session friction 2.16 already objects to. Same pattern as QUICK-2: the coach notices and offers when the difference is real.

**Default is Chapters** — safer for the primary market, and somebody who wants a defined block will show it long before week twelve.

---

## 5. Chapters, not twelve-week programmes

CHAIN-1 shipped six programmes chained into three journeys. Those chains stay, with two changes:

**The week count leaves the name.** "Back to Strength" is a chapter. "12-Week Back to Strength" is a deadline. Dropping the number stops the hinge reading as an expiry.

**The chain becomes a default, not a rail.** Graeme: *"I might change my priorities, I might develop quicker, or not."* So the next chapter is chosen AT the hinge, informed by what the reassessment just found — offered with reasoning, and changeable. Someone who has moved fast gets a different offer from someone who has not, from the same starting chapter.

**52 weeks becomes the honest unit.** Three or four chapters, chosen one at a time.

---

## 6. The weekly focus, and the single word that makes it safe

Graeme: *"Could the coach engage the user in setting goals within their programme each week?"*

**Focus, not goal.** A weekly goal can be missed. A weekly focus cannot — it describes what the coach will lean into, not what the person must achieve.

> *"This week I'm leaning towards single-leg work — it came up as the thing your last read found hardest."*

**The coach proposes; the person adjusts.** Required weekly goal-setting is a weekly chore and loses 2.16. An unchangeable focus is a prescription and loses 2.4. Proposed-and-editable is the autonomy route, and it is the pattern `sessionVariety` already uses.

**It is never scored, never counted, and its absence is never mentioned.** A focus that gets reported on at week end is a target wearing a different hat.

---

## 7. Where a countdown becomes honest

The one exception, and the reason `targetDate` exists.

A twelve-week bar is a **manufactured** deadline. A hike on 14 September is a **real** one — the person brought it, and counting toward it is the app being useful about a fact rather than applying pressure.

> **Countdowns only ever against a date the person supplied. Never against a programme length.**

Offered at the first hinge, not at signup: most people have no event, and asking implies they ought to.

---

## 8. My Programme — the missing surface

Graeme's design, and the reasoning is the same as his Settings observation: things exist and nothing shows them. A person has goals, a level, a chapter and a target spread across four screens, visible nowhere.

### Layout — agreed 15 Aug

```
  Morning, Graeme.                    [no cog — Settings is in the nav bar]
  <coach line>
  2 of 3 this week

  ┌──────────────────────────────────────┐
  │  My Programme                        │   full width
  └──────────────────────────────────────┘

  [ six tiles, unchanged ]

  ┌──────────────────────────────────────┐
  │  Unsure? Coach decides               │   full width
  └──────────────────────────────────────┘

  Update check-in                            labelled text link, stays
```

**Full width, not a seventh tile.** The six tiles answer *"what shall I do now?"*. My Programme answers *"where am I going?"*. In the grid it reads as another kind of session and people tap it expecting a workout.

**The cog goes.** Duplicated in the nav bar; removing it quietens the header.

**"Update check-in" keeps its label.** An icon-only control is the least discoverable element on a screen, a passport-and-pen has no established meaning for "change how I said I'm feeling", and hiding it repeats the exact fault Graeme found in Settings. It also needs an accessible name under WCAG 2.2 regardless.

It ALSO gets offered contextually after a door is chosen, as Graeme proposed — that is the better half of the idea. But the link stays, because of one case the contextual path misses: somebody who checked in this morning, felt worse by evening, and wants to say so **without starting a session**. Rare, and exactly the low-energy personas.

### Contents, in this order

1. **Where you are** — chapter, and what the last reassessment found
2. **This week's focus** — proposed, editable
3. **The arc** — chapters done, chapter now, what is likely next
4. **What you are aiming at** — the goal, and the date if there is one

---

## 9. Milestones toward a goal, never toward a week

The moment attaches to the **goal**, not the calendar:

- *"That's ten sessions with strength in them since you said that's what you were after."*
- *"Your last read moved. That opens up a few things I'd been holding back."*

Both give the goal-gradient something to work on. Both are backward-looking and cannot be failed.

**Nothing counts consecutive anything.** STREAK-1 removed the one streak this product had; this feature must not reintroduce it by the back door.

---

## 10. Schema

```
strategicGoal: {
  primaryGoal:       null,   // EXISTING, unused — a goals.js id
  targetDescription: '',     // EXISTING, unused — "the coast path walk"
  targetDate:        null,   // EXISTING, unused — the ONLY legitimate countdown
  ...
}

programme: {
  presentation: 'chapters',  // 'chapters' | 'blocks'
  chaptersDone: [],          // [{ id, name, completedAt, measuredLevelAtEnd }]
  currentChapterId: null,
  hingeOfferedAt: null       // throttle: one offer per hinge
}

weekFocus: {
  key:        null,          // movement pattern or capacity
  proposedAt: null,
  editedByUser: false        // did they change it? tells us if the proposal lands
}
```

---

## 11. Build order

1. **Schema**, and `programme.presentation` defaulting to `'chapters'`.
2. **My Programme view** — reads what already exists. Visible value on day one, no engine change.
3. **Hinge mechanic** — reassessment at the chapter boundary (ASSESS-1 step 3), then the next-chapter offer.
4. **Weekly focus** — proposed and editable.
5. **Blocks presentation**, offered at the first hinge.
6. **Event goals** — `targetDescription` and `targetDate`, offered at the first hinge.

Steps 1 and 2 stand alone and are worth shipping before the rest.

---

## 12. Open

- **Rehab front door** — separate blueprint. Name the chain, never the condition; chronic routes to a professional. Needs a physio to read the spec before it ships.
- **ASSESS-1 step 3** is a prerequisite for the hinge and is not built.
- **Device check** needs rewriting against the real routes before anybody retests.

---

*Build New Habits · Alongside: Move · Chapters, Hinge Points and My Programme · 15 Aug 2026 v1*
