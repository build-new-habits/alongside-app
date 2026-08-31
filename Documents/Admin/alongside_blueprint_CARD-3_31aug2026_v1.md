# CARD-3 — Three-Page Exercise Flow
## 31 Aug 2026 v1

Build New Habits | Alongside: Move | Build blueprint. Spec only, no code written.

**Supersedes CARD-2's tab model**, shipped the same morning as `alongside-v410`. The shared renderer, the pinned caution and the safety ordering all survive; the tablist does not.

---

## 1. Why the tabs failed

Graeme device-tested `alongside-v410` and moved between exercises without ever opening During or After. That is not a discipline problem. **Tabs are optional lateral navigation** — the design said "here are three places you may go", and the honest response to that is to go to none of them.

Two things follow, and the second is a fault I introduced:

**Pages fix it without gating.** You pass through During because the timer lives there, not because a checklist made you. Forcing progression would be coercive and would punish exactly the person the product is for — somebody who knows the exercise, is having a bad day, and wants to move.

**🔴 CARD-2 put the hazard list behind a tab.** Under CARD-1 `watchOut` was always open before the timer started. In v2 it sits inside During, so an exercise can be started without it ever being on screen. That is a safety regression and it is closed here.

### The pattern being broken

Three attempts, and the first two rearranged rather than removed:

| | What it did | Why it failed |
|---|---|---|
| CARD-1 | Collapsed sections into disclosures | Reorganised. Removed no words |
| CARD-2 | Sorted sections into tabs | Reorganised. Removed no words |
| CARD-3 | Splits by task, and each page carries a budget | To be proven |

**A page budget is part of this spec, not a follow-up.** Without it, page 1 becomes the new wall by Thursday.

---

## 2. The three pages

Each page has one job. If content does not serve that job it does not go on that page.

### Page 1 — DECIDE

Everything that lets the person change what is about to happen. **This is where agency lives**, and it is the thing Bend does better than Move today.

- Name, sets, target, section (warm-up / main / cool-down)
- `bodyCaution` if it fires
- **Last time** — see §4
- Adjust: less time / more time, swap, make it easier
- **Skip lives here and nowhere else.** You decide before you start, not halfway through

**Budget: caution + last time + at most 4 controls. No `why`, no `load`, no instructions.**

### Page 2 — DO

- Timer, or a rep target where there is no clock
- **Hazards, unhidden.** One line, specific to this exercise
- Instructions
- Video link

**Budget: hazard line + instructions + one action. No `why`, no `load`, no reflection.**

### Page 3 — NOTE

- The log block — band, reps, minutes, note
- Too hard / too easy
- Not a fan
- Next exercise

**Budget: log block + 3 controls.**

### Where `why` and `load` go

Neither is on any page by default. They are the two fields Graeme skims, and on a warm-up nobody needs a paragraph on gluteus medius activation. Reachable from page 1 behind a single quiet control, closed by default, no count, no badge.

---

## 3. Navigation and advance rules

**Forward is automatic where the app already knows. Backward is always available.**

| From | Trigger | To |
|---|---|---|
| 1 | Start | 2 |
| 1 | Skip | Next exercise, page 1 |
| 2 | Timer completes | 3 |
| 2 | Done (reps-based, no clock) | 3 |
| 2 | Back | 1 |
| 3 | Next exercise | Next exercise, page 1 |
| 3 | Back | 2 |

**🔴 Landing on page 2 must NOT auto-start the timer.** You read how to get into position, then you start. Auto-starting punishes reading, which is the opposite of the point.

**Page count.** Ten exercises across three pages is thirty screens if every step is a tap. It must not be. Two of the six transitions above are automatic, so the real interaction is decide, do, note — with taps at the decision points only.

**Page state is per exercise index and resets on exercise change.** Nobody lands on page 3 of a movement they have not done.

---

## 4. "Last time" — the strongest part, and the one on the P4 line

The thing that makes page 1 worth landing on rather than tapping past. It is also where Move beats Bend outright: Bend has no memory of the person at all.

**🟢 No new data work.** `session-log.js` already exports `lastLine(exercise)`, built on `store.lastLift(id)`, returning band/weight, reps, speed, incline, level, distance, minutes, tension and the person's own note. It is already flat and display-only, and the file already carries the reasoning: *"Last: 85 kg" is a fact about their own log; "up 5 since May!" would be the coach interpreting, and P4 is Locked.*

**🔴 The boundary, restated because page 1 is a tempting place to break it.**

| Allowed | Forbidden |
|---|---|
| "Blue band, 8 reps. 'Felt fine, could go longer.'" | "You're getting stronger" |
| Their own words, verbatim | Any trend, delta or arrow |
| Silence when there is no entry | Any count of sessions or times done |

`bestLine()` stays behind its existing opt-in, off by default. For personas 2.5, 2.8 and 2.13 a visible best is a target to fall short of.

Gate assertion with a reversal.

---

## 5. Technical design

### 5.1 Preserve the button ids

The views own the action-bar event handlers and bind them by id — `timer-toggle-btn`, `skip-exercise-btn`, `gp-next-*`. **The card renders the action bar per page but keeps those exact ids**, so existing view wiring continues to work untouched. This is the single decision that keeps the blast radius survivable.

### 5.2 Module

`js/exercise-card.js` **v3**. Not a new file — a third module for the same object would be the drift this renderer was created to end.

```js
renderExerciseCard(exercise, {
  idPrefix,
  page,          // "decide" | "do" | "note"
  timing,        // from resolveTiming(), TIME-1
  lastTime,      // lastLine(exercise) output, or ""
  adjustSlot,    // view-supplied: less time, swap, easier
  doSlot,        // view-supplied: timer, video
  noteSlot       // view-supplied: log block, feedback, not-a-fan
})
```

`attachCardEvents(root)` gains page navigation. Delegated and idempotent, as now.

### 5.3 Page state

Lives in the view, beside `currentExerciseIndex`, not in the store. It is ephemeral UI state; surviving a reload would put somebody back on page 3 of an exercise they have not done.

### 5.4 🔴 What must not regress

- `bodyCaution` renders on **all three pages**. It is the personalised safety line and it is not page-scoped
- Hazards are **visible on page 2 without interaction** — the CARD-2 regression
- `exercise-card.js` still does not read `exerciseHistory` (CARD-2 removed the P4 exposure; do not reintroduce it for "last time" — that comes from `lastLine`)
- `exercise-timing.js` still does not read `holdSeconds` (TIME-1)
- No view hardcodes `running: false`

---

## 6. Files — touch-once, confirm every header against a fresh clone

| File | Action |
|---|---|
| `js/exercise-card.js` | v2 → v3, page model |
| `js/views/workout.js` | Page state, slots, action bar |
| `js/views/prescribed-session.js` | Same |
| `js/views/gym-programme.js` | Same |
| `js/views/core-session.js` | Same, both surfaces |
| `css/components/workout.css` | Page styles, retire `.xcard-tab*` |
| `tools/verify-card3.mjs` | New; replaces `verify-card2.mjs` |
| `sw.js` | **Last, alone, own commit, cache bump** |

No new store field. No `Schema.md` change. Schema-first does not apply.

---

## 7. Gate — `tools/verify-card3.mjs`

Replaces `verify-card2.mjs`, which is deleted rather than left passing against a dead model.

| # | Assertion | Reversal |
|---|---|---|
| 1 | `bodyCaution` renders on all three pages | Scope it to decide → must fail |
| 2 | Hazards render on page 2 with no interaction | Put them behind a control → must fail |
| 3 | Skip appears on page 1 only | Add it to page 2 → must fail |
| 4 | Page 2 does not auto-start the timer | Call start on render → must fail |
| 5 | No trend, delta or count in the last-time panel | Inject "up 5 since May" → must fail |
| 6 | `exercise-card.js` never reads `exerciseHistory` | Reintroduce the read → must fail |
| 7 | `exercise-timing.js` never reads `holdSeconds` | Carried from TIME-1 |
| 8 | No view hardcodes `running: false` on a live-timer view | Carried from CARD-2 |
| 9 | Existing action-bar ids still present | Rename one → must fail |
| 10 | Each page respects its budget | Add a fifth control to decide → must fail |

Fixture fault check on each: does it reach the branch it claims to test? No negative distance windows.

---

## 8. Build order

1. `exercise-card.js` v3 — page model, action bar with preserved ids
2. `workout.js` first; prove the flow on one view before spreading it
3. Gate written, all reversals confirmed failing
4. Remaining three views
5. CSS, retiring `.xcard-tab*`
6. Full suite — `npm install jsdom` first
7. `sw.js` last, alone

---

## 9. Open for Graeme

1. **Does "make it easier" exist yet?** Page 1 lists it as an adjust control. Swap is SWAP-0 and shipped for cardio machines only; less/more time exists. "Easier" may be new scope — **discovery before it goes on the mockup as though it works.**
2. **Reps-based page 2** needs a "done" path that is not a clock. Proposed: a plain "Done" under the rep target.
3. **`why` and `load` behind one control on page 1** — or off the card entirely and into the library?

---

## 10. Not in scope

- The app-wide text problem. The session proposal screen is two coach paragraphs and three section descriptions before the button, and no card design touches it. Needs its own row.
- The content pass reducing `watchOut` from four generic lines to one specific line across 551 exercises. **This is the change that actually removes text**, and it is a content job, not a code one.
- CHECKIN-2b.

---

*Build New Habits · Alongside: Move · CARD-3 Blueprint · 31 Aug 2026 v1*
