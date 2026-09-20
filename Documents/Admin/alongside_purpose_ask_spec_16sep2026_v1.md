# PURPOSE-ASK — Specification

**16 Sep 2026 v1**

Build New Habits · Alongside: Move · Stream A (Build)
Verified against a fresh clone: `alongside-v530`, `store.js` v72, `Schema.md` v1.65, master schedule v376, 165 gates.

---

## 1. What is wrong now

Graeme, across five days and at least four separate messages:

> *"Perhaps asking the kind of session before check-in would be good."*
> *"It seems to always be core."*
> *"How does the coach know I want core and not cardio or strength?"*
> *"The coach still doesn't ask what I want. Like, work towards my arc, conditions, body zone, general fitness, etc. There are lots of reasons to work out but the coach never asks."*

🔴 **The coach assumes the reason is always the arc.** That is the fault. Everything downstream follows from one hardcoded purpose, which is why the answer kept being core.

Three attempts were made at the wrong level before this was understood:

| | What was built | Why it missed |
|---|---|---|
| ALWAYS-CORE | Fixed the session-type rotation | Real bug. Not the question. And it only advances on **completed** sessions, so a person testing never sees it move |
| PROPOSAL-LOC | Built real alternates instead of canned ones | Real bug. Still three shapes of the same assumed purpose |
| ASK-KIND | "Something else today?" under the cards | **Answers a different question**, and buried. Graeme: *"almost invisible and completely the wrong thing"* |

⚫ **The repetition was the signal and it was read as a reminder.** A repeated report means the previous fix answered a different question. That is now in the master schedule as a standing note; this spec is the first thing written after it.

---

## 2. What replaces it

Two questions at the end of the check-in, in the coach's own voice, where the coach is already talking.

### Q1 — what is today for?

Five answers. This is the one that has never been asked.

| Answer | `purpose` |
|---|---|
| Working towards my arc | `arc` |
| Something's niggling | `niggle` |
| A particular area | `area` |
| General fitness | `general` |
| Just moving | `gentle` |

⚫ **`arc` is first and is what a returning Plan user will usually pick.** This is not demoting the arc — it is asking rather than assuming, and the arc still wins whenever it is chosen.

⚫ **`gentle` is a real answer, not a fallback.** "Just moving" is the whole product thesis for somebody who is not having a good day, and it must not read as the lesser option.

### Q1b — where? *(conditional)*

Only when the app does not already know.

- **`niggle`** — the areas flagged at check-in are already known. **Skip this question entirely if exactly one was flagged.** Ask only when none were flagged, or more than one was. Graeme's rule: asking again when he answered three questions ago is the coach not listening.
- **`area`** — **always asks.** The person is choosing something the check-in did not raise.
- `arc`, `general`, `gentle` — never asks.

Answers are the four `TARGET_AREAS` already used by the stretch door, plus the named conditions where those exist. One vocabulary, not a second.

### Q2 — what would help?

🔴 **This is a recommendation, not a menu.** Graeme's correction to the first mockup, and the better design:

> *"Coach should make a suggestion based on all the pain data etc like, 'I'd recommend we build strength around it rather than directly work it' or 'based on previous activities (read by activity type and recency) I would recommend...' and these are gold marked."*

**One option is gold-marked with a reason attached. The others sit below it, unmarked, and can be chosen freely.**

Four neutral options ask somebody to be their own physiotherapist. One marked option with a stated reason is the coach doing the job it exists for.

Options vary by `purpose`:

| Purpose | Options offered |
|---|---|
| `niggle` / `area` | Range of movement · Build strength around it · Stretch it out · Move gently, nothing loaded |
| `arc` | Strength · Mobility · Stretch · Mixed |
| `general` | Strength · Cardio · Mobility · Mixed |
| `gentle` | *Skipped.* "Just moving" has already answered it |

---

## 3. What the recommendation may reason from

All of it exists. Nothing new is tracked.

| Source | Field | Gives |
|---|---|---|
| Flag history | `checkinHistory[date].conditionLevels[id]` | How often and how recently an area was flagged, and whether it is trending. `_severityTrend()` in `conditions-update.js` already reads exactly this |
| Today's severity | `conditionPainScores` | The `>= 4` threshold `soreAreaLoaded()` already applies |
| Recent work | `activityLog[].sessionType` + `completedAt` | What has been done and when — **live since ALWAYS-CORE**, and this is its second consumer |
| Arc coverage | `arc.zonesWorked`, `arc.typesWorked` | Which strands have not been touched — **live since ARC-EVERYTHING** |

### 🔴 The honesty rule

**The reason must be something the person told the app, said back to them.**

- ✅ *"You've flagged this three times in a fortnight."*
- ✅ *"You've done strength twice this week and no mobility in nine days."*
- ✅ *"Trunk strength hasn't come up since you started this arc."*
- ❌ *"This is what your body needs."*
- ❌ *"Your back is weak."*
- ❌ Anything implying diagnosis, progression readiness, or clinical judgement.

Same rule as the caution line on the exercise cards, and the same reason: a physiotherapist would object to the second list, and correctly.

### 🔴 Day one says nothing

With no flag history and no activity types, there is nothing to reason from. **The coach makes no recommendation and offers the options unmarked.** Inventing confidence on day one is worse than offering a plain choice — and it is the exact failure mode of every fitness app this product exists as an alternative to.

The gold mark means *"I have a reason"*. It must never mean *"I have to pick something."*

---

## 4. What it changes downstream

The proposal screen already says *"Based on your arc — …"*. That line becomes the answer to Q1:

| Purpose | Line |
|---|---|
| `arc` | Because you're working towards "Build a core that actually holds me up", and asked for strength. |
| `niggle` | Because you flagged your lower back, and asked to build strength around it. |
| `general` | Because you asked for general fitness, and cardio. |
| `gentle` | Because you said just moving today. |

⚫ **One screen, one line, four meanings.** Not four screens.

**ASK-KIND's "Something else today?" is removed.** It answers a question that is now asked properly, and Graeme's verdict on it stands: *"almost invisible and completely the wrong thing."* 🟡 Its store field `requestedSessionType` is **kept** and becomes Q2's answer — the plumbing was right, the question was wrong.

---

## 5. Schema

`store.js` v72 → **v73**. `Schema.md` v1.65 → **v1.66**. Before any code reads them.

```js
// PURPOSE-ASK. Why today's session, as the person said it.
todayPurpose: null,      // arc | niggle | area | general | gentle
todayPurposeArea: null,  // a TARGET_AREAS id or condition id, or null
```

⚫ **Both cleared at the start of each check-in**, not carried. A purpose is a fact about today, like the check-in itself. Yesterday's reason is not a default.

⚫ **`requestedSessionType` is reused for Q2** rather than a third field.

---

## 6. Files

| Order | File | Change |
|---|---|---|
| 1 | `js/store.js` | v73 — two fields |
| 2 | `Documents/Live State/Schema.md` | v1.66 |
| 3 | `js/data/purpose.js` | **New.** The question definitions and the recommendation engine |
| 4 | `js/views/checkin.js` | Q1, Q1b, Q2 as check-in beats |
| 5 | `js/views/coach-proposal.js` | Reads purpose; the line; remove "Something else today?" |
| 6 | `css/components/checkin.css`, `coach-proposal.css` | Gold-marked option, question layout |
| 7 | `tools/verify-purpose-ask.mjs` | **New gate** |
| 8 | `sw.js` | Last, alone. New file precached |

---

## 7. What the gate must assert

Source checks would pass on every failure this feature can have, so the gate **drives** it.

1. Every purpose produces a different proposal line.
2. A recommendation is made **only** when there is evidence — **day one marks nothing.**
3. Every reason given traces to a stored fact. **No reason may contain a diagnostic claim** — asserted against a word list including "needs", "weak", "should be able to", "ready for".
4. Q1b is skipped when exactly one area was flagged, and asked when none or several were.
5. `gentle` skips Q2 entirely.
6. The gold-marked option is choosable **and** overrideable — the other three must remain selectable.
7. Both fields clear at the start of a check-in.
8. `requestedSessionType` still reaches the builder, as ASK-KIND left it.
9. **REVERSAL:** with rich history, a recommendation IS made — or test 2 passes by the feature never working.

---

## 8. What this does not do

- 🟡 It does not ask on the free tier. The free drop-in question is §8's and is untouched — **Locked Principles P1/P2**, and `verify-decisions` holds it.
- 🟡 It does not edit the arc. A purpose spends one session; the arc resumes tomorrow.
- 🟡 It does not replace the check-in's existing questions. It is added at the end, where the variety question sits on free.

---

*Build New Habits · Alongside: Move · PURPOSE-ASK Specification · 16 Sep 2026 v1*
