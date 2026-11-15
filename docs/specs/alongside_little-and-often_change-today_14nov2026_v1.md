# Alongside: Move — Little and often, and Change today (P-29)

## 14 Nov 2026 v1

Build New Habits | Alongside: Move | The Plan only (Free unchanged) | Ships as `alongside-v715`, `store.js` v124, Schema v1.125

---

## 0. Where this came from

On 11–14 Nov 2026 Graeme imported a real plan (hip and back care, posture, three gym sessions) and used it. Two things were missing:

1. **Short routines through the day.** Graeme's own words: "snacking options for stretching. 5 or 10 minute stretches in the day as I wait for coffee or the kettle… better than a session in the morning or at night." They lived in My exercises, three taps and a scroll away. A day in Your week holds one thing, so a routine could not sit beside a gym session.
2. **Changing a day at the last minute.** A door could do something else today, but the planned session was not moved anywhere, and editing Your week changed every week.

The design went through five mock-ups on 14 Nov (published privately as an artifact, "Alongside: Move — Little and often and Change today"). Graeme approved v5 and asked for the spec and the build in one pull request.

**Decisions taken by Graeme, 14 Nov:**

- The new words go in the glossary (section 6).
- Catching up a missed session is allowed, as a choice, never a reminder.
- It must be an elevation on what is already there, not a regression.

---

## 1. Principles

- **Nothing on Home is lost.** Plan Home keeps the greeting, arc line, Lately, the Today card, the four ways in and the Library, in that order. Two things are added.
- **The person chooses; Home never asks.** Nothing shows under Little and often until a list is put on Home. Catch up is offered only inside Change today.
- **This week only.** Change today never edits Your week. Next week is as planned.
- **Nothing keeps score.** Anything undone at the end of the week simply was not done. Nothing rolls into next week, and there are no streaks or counts against anyone.
- **Rules, not judgement.** Every behaviour is a plain rule that can be read and tested. No AI, no invented thresholds.
- **Undo is always visible.** A change says what it did, with Undo beside it.

---

## 2. Little and often

### 2.1 What the person sees

On Plan Home, between the Today card (and Change today) and the four ways in:

- A label, **Little and often**, then at most **three** rows in the existing `.path-door` style. Each row: the list's own name, "*n* exercises", and "This morning" or "This evening" when it is set for that part of the day.
- On a sore day, a row whose list works the sore area says "**Works your** *area*". Tapping it still plays it; the list's player warns before that exercise, as it already does, and the person chooses.
- When every exercise in a list is ticked today, its row says **Done today**, has a tick and a dashed border, and is not a button.
- **All of My exercises**, a link, under the rows.

### 2.2 Choosing what shows

In **My exercises**, under each named list's Start button: **On Home**, one labelled choice (a select, one row): **Not on Home**, **Any time**, **Mornings**, **Evenings**. It is saved as it changes, focus stays on it, and a status line says "*List* is on Home, mornings." A select was chosen over four chips after the browser check on 14 Nov: chips under every list made My exercises much longer, which would have been a regression.

### 2.3 Rules

- Mornings show before midday; Evenings from 6pm; Any time always.
- Order: the lists set for this part of the day first, then Any time, each in My exercises' order. At most three.
- No minutes are claimed. A list's length is the person's own.
- The sore rule is the player's own (`prescribed-session.js` `_checkContraindication`), so Home and the player never disagree.

---

## 3. Change today

### 3.1 Where

A link, **Change today**, centred under the Today card (or Home's one row), when the person has a week and today is not already done, carried on, or a session saved for today. It is a quiet link so **Start your list** stays the clear main action.

### 3.2 The screen (`change-today`)

Heading **Change today**, then: "Just for this week. Your week stays as you planned it." Choices, each a row with a line under it:

| Choice | Shown when | What happens |
| --- | --- | --- |
| **Do it another day** | Today has a session that has not already moved | Opens **Which day instead?** |
| **Catch up** | Today has no session, and an earlier session this week was not done and has not moved | Opens **Catch up which one?** |
| **Little and often instead** | Always | Today becomes a Little and often day |
| **Rest today** | Not already a rest day | Today becomes a rest day. Rest counts. |
| **Something else** | Always | No plan from the week today: Home's row becomes **Let me choose for you**, and the four ways in read **Or choose for yourself** |

**Which day instead?** lists each *later* day this week with what will happen there, so there is no swap-or-move decision first:

- a day with a session (not done, not already changed): "**Swaps with** *Session C*"
- a rest day, or a day with nothing planned: "**Rest day · moves here**"
- a day already changed this week is not offered

**Catch up which one?** lists each earlier day's session: "*Monday's Session A* — Do it today", under "Only this week. Do it today if you'd like to. There's no need to."

### 3.3 Back on Home

Home says what happened, in one line with **Undo** beside it, and focus goes to Undo so a screen reader hears it:

| Change | Line |
| --- | --- |
| Swap | Swapped with Friday. |
| Move (the other day) | Moved to Thursday. / Moved from Wednesday. |
| Catch up | Caught up from Monday. / Done on Tuesday instead. |
| Little and often | Little and often instead. (The Today card: "Little and often. Just the short ones today. That counts.") |
| Rest | Changed to a rest day. |
| Something else | Something else today. |

**Undo** puts today back as planned, and the other day it was tied to.

### 3.4 Rules

- Later days only for Do it another day; earlier days only for Catch up.
- Two sessions never land on one day: a session day swaps, a free day takes it.
- **A session moves once.** A day already playing another day's session offers no Do it another day ("*Session A* has moved once this week already, so it stays today").
- Catch up counts as that session's one move.
- A day with a session logged counts as done (`doneThisWeek`), so it is never offered to catch up.
- Choosing Little and often, Rest or Something else first undoes any swap or move today was part of.
- The changed day is what everything reads: Home, the coach's plan (`askForToday`, `applyWeekDay`) and every other reader go through `todayInWeek()`, which applies the change.

---

## 4. Lately

Lately moves out of the way while today's session is still to do: it shows once today's session is done, on a rest day, or on a day without a plan. On a small phone this keeps the Today card, Change today and the four ways in above the fold.

---

## 5. Data (Schema v1.125, `store.js` v124)

Two additions, nothing removed, the Plan only. Both made safe on every load by `data/week-shape-model.js` v6.

**`myExercisesOnHome`** `{ "<list name>": "any" | "morning" | "evening" }`, default `{}`. Which lists from My exercises show on Home, and when. Absent means Not on Home. Keys are list names (up to 40 characters, `<` and `>` removed), at most 40 entries; anything else is dropped. Written by My exercises' On Home (`little-and-often.js` `setOnHome`). Read by `homeItems()`.

**`weekChanges`** `{ week: "<this week's Monday, YYYY-MM-DD>", days: { <day>: change } }` or `null`. This week's changes from Change today. A change is one of:

- `{ kind: "plan", value: <day plan id>, from: <day>, caught?: true }`: this day plays another day's plan
- `{ kind: "moved", value: <day plan id>, to: <day>, caught?: true }`: this day's plan went to another day
- `{ kind: "little" }`, `{ kind: "rest" }`, `{ kind: "else" }`

On load (`sanitizeWeekChanges`): an earlier week's changes are `null`; a change whose day plan is no longer in Your week, whose other day is itself or not a day, or whose kind is unknown is dropped. Written only by `data/week-changes.js`. Read by `week-shape.js` `dayInWeek()` / `todayInWeek()`. **`weekShape` is never written by either.**

---

## 6. Glossary (agreed by Graeme, 14 Nov)

| Thing | Use | Not |
| --- | --- | --- |
| The Home row of short lists from My exercises | **Little and often** | snack, routine (as its name) |
| The choice on a list in My exercises | **On Home**: **Not on Home**, **Any time**, **Mornings**, **Evenings** | Pin, Show on Home |
| The link under the Today card, and its screen | **Change today** | Edit today, Swap day |
| Its choices | **Do it another day**, **Catch up**, **Little and often instead**, **Rest today**, **Something else** | Swap, Move (as choices) |

"Snack" stays the word for the trend's 10-minute snack (P-20). A person's own list can be called anything, including "Kettle Snack".

---

## 7. Files

| File | Change |
| --- | --- |
| `js/data/week-shape-model.js` v6 | `ON_HOME`, `sanitizeOnHome`, `CHANGE_KINDS`, `mondayOf`, `sanitizeWeekChanges` |
| `js/data/week-shape.js` v4 | `weekChangesNow`, `dayInWeek`; `todayInWeek` applies today's change |
| `js/data/week-changes.js` v1 (new) | Change today's rules: choices, swap, move, catch up, little, rest, else, undo, the line |
| `js/data/little-and-often.js` v1 (new) | On Home choices and Home's items |
| `js/views/change-today.js` v1 (new) | The Change today screen |
| `js/views/plan-home.js` v10 | Change today and its line, Little and often, a changed rest day's words, Lately's timing, focus after a change |
| `js/views/prescribed.js` v1.13 | On Home under each list (the Plan) |
| `js/router.js` v55 | Route `change-today`, tab Home |
| `js/store.js` v124 | The two fields, made safe on load |
| `css/components/path.css` v14, `your-week.css` v5 | Styles, from existing tokens |
| `sw.js` v715 | Three new files precached, hashes |
| `tools/verify-p29-change-today.mjs` v1 (new) | 59 checks: schema, every rule, Home, the screen, My exercises, Free |
| `docs/glossary.md` v5, `docs/Schema.md` v1.125 | As above (release notes are in `sw.js`'s version log) |

---

## 8. Accessibility (WCAG 2.2 AA)

- Every choice is a real button with its words, or a native select with a visible label; nothing relies on colour alone.
- Each screen has one `h1` that takes focus; ‹ Back on each step.
- After a change, focus goes to **Undo**, whose name says what it undoes ("Undo: Swapped with Friday.").
- My exercises' On Home is saved as it changes, so focus is not lost; a status line says the result.
- At the largest text, the change line wraps and Undo drops below it rather than squeezing the words.
- Targets are at least 44 px. Styles use the app's tokens, so the light, dark and black looks all hold.
- Rows wrap at the largest text (`min-width: 0` on row text).

---

## 9. Not in this release (parked)

- **Plan import headings** (`Routine: … | morning`, `Snack: …`) so an imported plan can put lists on Home directly. Today the person chooses On Home after importing.
- **Your arc noting Little and often** ("Little and often today: …"), as the mock-ups showed. Needs a decision on how it is counted without becoming a score.
- **App icon shortcuts** (Android only), never the main way in.
- **How-to guides** for Change today and Little and often (see the how-to guides spec, PR #1).
- **User testing** with three tasks: "Move Monday's session to Friday", "Put your morning stretch on Home", "Find your week". Anyone needing help, or taking longer than about 30 seconds, means that part is simplified.

---

## 10. Decision: six ways in (Stage AWARD A-1)

A-1 caps Plan Home at six ways in. Change today made seven on any day with a week, and lists under Little and often add more.

**Graeme, 14 Nov: "Count Change today with the Today card."** Six stays the default. Change today and its Undo (`.path-change`) count as part of the Today card. Little and often (`.path-lao`, and All of My exercises) is what the person chose to put on Home, so it is not counted. Encoded in `verify-plan-home-prune` v4 and `verify-plan-home-path` (test 2); nothing else in either check was loosened.

## 11. Checks (14 Nov 2026)

- **New:** `tools/verify-p29-change-today.mjs`, 59 checks, all pass.
- **Full suite**, `main` against this branch, every `tools/verify-*.mjs` (jsdom 28.1.0): no check that passed on `main` fails here. The same 12 fail on both, for reasons outside the code: this was a shallow clone without `../bnh-files` or the website, so checks that read the private repository, the website or older versions from git history cannot run. Inside those 12, the failure counts are unchanged.
- **Updated to match:** `verify-css` (a class with no rule, removed), `verify-schema-check` (Schema.md's confirmed version), `verify-blueprint` (the cold start blueprint's version rows), `verify-sw-hashes` (rehashed).
- **In a real browser** (Chrome, the app served locally, a Plan user with a week and four short lists), at 320 and 390 px, text at 1× and 2×, in the dark, light and high-contrast looks: Home, Change today, Which day instead?, a swap and its Undo, a list started from Little and often, and My exercises' On Home. axe-core (WCAG 2.0, 2.1, 2.2 A and AA) found no violations on any of them, and nothing overflowed sideways.
- **Not done:** a screen reader on a real phone (VoiceOver, TalkBack), and user testing (section 9).
