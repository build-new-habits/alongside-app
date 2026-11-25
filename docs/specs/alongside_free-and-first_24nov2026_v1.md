# Alongside: Move — Free and first (P-46) spec
## 25 Nov 2026 v6

**v6 (S7, built; P-46 complete):** Help guide **A4** *I want to change a move while I'm doing it* (both tiers, read only, walks A1), and D1's Free answer *Something gentler*. Glossary v15 (the new words, and decision 8: about 15 words before the first button). BNH-Files: device checklist v34 **Sitting Z**; `Legal/alongside_privacy_line_free-and-first_25nov2026_v1.md` (three proposed Privacy Policy edits and two questions for Foot Anstey; nothing new leaves the device). Then the Wave 8 persona trace.

**v5 (S6, built):** (1) `tools/chromium-word-budget.mjs` v2: budget 15 on every screen the router opens, both tiers; safety and scope words are not counted (the advice line, the scope notice, the support lines); the safety note before a first exercise, the Plan's own page, the first-session finish and the pages to read are listed with a reason each. (2) Sixteen screens cut, the meaning kept, nothing about safety touched: Wellbeing, Log what I did, In Step, Breathing, Quiet, the morning session, Practices, My exercises (empty), Privacy (the summary's lead-in only), Making my Move, Plan your week, Share your plan, a link from a physio, Classes, the programme page, the session builder. (3) Saved sessions joins the Plan's routes (its Free page took 22 words to say so). (4) The byte-for-byte Free checks apply the approved changes to the old drawing only (`tools/p46-words.mjs`), as they did for v7's one rename.

**v4 (S5, built):** (1) The player is one screen per move on both tiers (`workout.js` v42; `exercise-card.js` layout `one`). (2) The main button keeps today's set counting: **Set n done** per set, or **Finish this one** for all of them; a 12-move session takes 24 taps that way (one-tap Finish, one-tap Next), within the 25 target. Reps and weight are typed in the sets block on the same screen (the sheet on the button is not built: the block was already there and one tap less). (3) *Watch out* is folded under *More about this move* with Why, How and Easier or harder, as in the mock-up; today's caution for a sore area stays on screen, above the cue, never folded; *If it hurts* stays on screen, one tap away. (4) Free's old cardio-machine-only Swap is replaced by the one Swap. (5) *Watch how to do this* is a bordered link without the emoji (one look).

**v3 (S4, built):** (1) Free Home is `views/free-home.js` in the Plan's look; *Something gentler* is Today's plan for mobility at the shortest length (about 10 minutes) at the last place, through the check-in when today has none. (2) The six open in the Plan's own steps (`path.js`): the list, *How long have you got?*, the session, Start; *Make it mine* and *Swap* stay the Plan's until S5. (3) Kept on Free Home as well as §5's list: the pacing, brief-path, flat-fortnight and low-mood lines (the website quotes the low-mood one). (4) The on-the-plan page's way back is *‹ Back* (to Home), the one look's back, not *‹ Home*. (5) The tier table and the website's *When I want to choose for myself* table say Free has six ready-made sessions and choosing the kind is the Plan's; the website's Free video there still shows the old Home and is to be recorded again. (6) Free-only code no longer reachable (the session builder, Free's Library tiles and class list, Mobility & Conditioning) is left in place for a later tidy; its gates now check it on the Plan or check Free gets *Part of the Plan*.

**v2 (S2, built):** three corrections found building it. (1) The red-flag questions are **not** asked in getting started, now or before: the route guard asks them before the first session with a sore area (`data/red-flag.js`), so screen 2 only records the areas and the guard does the rest. (2) Screen 4's button is **Show me my session**, which opens Today's plan with the request set (whole body, gentle, at the chosen place, about 15 minutes): one way into a session (A-2), with its own safety note; the card names no move count. (3) The old conversation stays for anyone part-way through it (resumes past the name); everyone else gets the one-minute start, so its checks now start part-way (`tools/part-way.mjs`).

Build New Habits | Graeme, 24 Nov, after the Wave 7 trace: *"we do need to look at the Free level … I wanted to improve Onboarding anyway because I thought it was too much … I also have way too many words - so we need to simplify. no one needs a lecture or a sermon."* Four decisions the same day (all recommended options) and mock-up v1 approved: *"I think the designs are exceptional … I love all of it."*

Mock-up: claude.ai Design canvas *Alongside: Move — Free, getting started and fewer words (mock-up v1)*. Where this spec and the mock-up differ, this spec says why.

---

## 1. What it is, in one line

A new person reaches their first session in about a minute; Free is the coach, today, in the Plan's look; the player is one screen per move on both tiers; and no screen says more than one short line before its first button.

## 2. Getting started (about a minute)

**Unchanged and first:** the age question, the Privacy Policy and Terms agreement, and the health-answers consent, as they are (legal; their words are not touched here).

Then four screens, each with *‹ Back* and *n of 4*:

| # | Screen | Writes | Notes |
|---|---|---|---|
| 1 | *Hi. What should I call you?* · *About a minute, then your first session.* · First name · Next | `name` | Blank allowed (the coach then uses no name, as today) |
| 2 | *Anything sore at the moment?* · *Pick any. I'll work around them.* · the pain areas the conditions sheet lists (lower body, back, upper body) · the scope statement word for word · *Nothing sore* / *Next* | `conditions` | The red-flag questions follow before the first session, through the route guard, as they always have; how sore on the day is the check-in's. Without the health consent, the screen is skipped (as the conditions sheet was) |
| 3 | *Where will you move?* Home · Gym · Outside · A mix. *So I keep it safe:* up from a chair without your hands? · down to the floor and back up? · worried about your balance? | `equipment`, `homeEquipment`, `gymEquipment`, `sessionLocation`, `capability.chairRise`, `capability.floorAccess`, `capability.balanceWorry`, `capability.askedAt` | **Where:** Home → bodyweight (`[]`); Gym → the *Full gym* set (`FACILITY_DEFS` `gym-full`), changeable in Settings › Equipment; Outside → bodyweight, `sessionLocation` home; A mix → both. **Ability:** *Not easily* or *No* on the chair asks the existing leg question (`capability.legPower`) on the same screen, as today's 9c. Impact (`capability.bothFeet`) is **not asked**: unanswered already means no jumping (`impactGated`), the safe side |
| 4 | *Your first session, {name}* · one line in their words (*Gentle, at home, working around your lower back and knee.*) · the card (figure, *Whole body, gentle*, *About 15 minutes*) · **Show me my session** · *Not now, take me Home* | `onboardingComplete`, `onboarding.flow = "short"`, `onboarding.threadCompletedAt`; with Show me: `requestedSessionType` full, `requestedLocation`, today's length *short* | Show me opens Today's plan, built gentle (§3) at the place chosen, with its safety note word for word, read once as now |

**No longer asked before the first session** (each stays changeable where it already is, and §4 asks some later):

| Answer | Store field | Readers today | Without it |
|---|---|---|---|
| What made exercise hard before (3a, 3b, 4) | `onboarding.hardBeforeSelections`, `onboarding.primaryTerritory` | check-in openings, session moments, first session's lines | Those lines use their existing defaults. Settings › Your body › *What you told me at the start* (GS-EDIT) already edits them |
| Age band (6) | `ageBand` | check-in openings, aims | Defaults as for *Prefer not to say* |
| Goals (7) | `goals` | many (builder, arc set-up, tier table) | Asked later (§4). Plan: Making my Move covers what it's for |
| Activity level (9), coming back from (9e) | `lifestyle.activityLevel`, `lifestyle.returningAfter` | builder ceiling and impact, assessment, aims, openings | **Safe default (§3)**, then asked later (§4) |
| Training intent (9f) | `trainingIntent` | builder | Defaults to *improve*, as today when unanswered |
| Energy lately (10) | `lifestyle.stressLevel` | check-in | The daily check-in asks energy anyway |
| Times a week (12) | `strategicGoal.weeklySessionTarget` | Home, Progress, pacing | Asked later (§4); readers already handle none |
| Programme choice (13) | `activeProgramme` | Free's twelve-week programme | Not offered: Free is the coach (§5) |

**Mock-up difference:** none on screen. One rule added: §3's safe default, so a short start never builds harder than the old long one could.

## 3. A safe first session

Today an unanswered activity level reads as *moderate* (`_difficultyCeiling()`: ceiling 4), which is how a returning runner with no level was offered Pistol Squat Progression in the Wave 7 trace. For a person who came through the short start (`onboarding.flow === "short"`) **with no activity level yet**, the builder reads it as **light** (ceiling 3) until they answer. Everyone else is unchanged (their gates and fixtures stay as they are). Impact stays gated while unanswered, as now. The *too easy / about right / too hard* answer the finish already asks (assessment) moves the level up or down as it does today.

## 4. Asked later, once, when it matters

One question at a time, as a small card on Home (both tiers' Homes), never before a session and never on a hard day (the check-in's hard-day rule), with the answer chips and *Not now*. *Not now* is final for that question (it stays in Settings). At most one a day.

| When | Question | Writes |
|---|---|---|
| After the first finished session | *How active have you been lately?* (the existing five chips; *Coming back after a break* asks *From what?* next) | `lifestyle.activityLevel`, `lifestyle.returningAfter` |
| After the third | Free: *What do you most want from this?* (the goals list, up to three). The Plan: not asked (Making my Move) | `goals` |
| After a week | *How many times a week feels realistic?* | `strategicGoal.weeklySessionTarget` |

Nothing else is asked later; what made exercise hard before and the age band stay in Settings for anyone who wants to say.

## 5. Free Home: the coach, today

As the mock-up: the greeting and Help; the **Today card** (*How are you today?* · *Three taps, then your session.* · Check in; once checked in, today's session named with Start; once done, *Done today*); **Something gentler** (*A short, easy session*: Today's plan at light intensity, about 10 minutes, at the last place); **Ready-made sessions** (*Six to choose from*: home `rm-gs-h1`, `rm-gs-h5`, `rm-gs-h6`, `rm-km-h1`, `rm-km-h2`, `rm-km-h6`; with a gym, `rm-gs-g3`, `rm-gs-g6`, `rm-km-g2`, `rm-km-g3` take the place of the first four); **Log what I did**; **Your exercises** only when the person has a list (a physio's list stays Free, P-40); *Want more choice? See what the Plan adds* (Upgrade). Wellbeing, Progress and Settings in the bottom bar, line icons.

**Keeps, word for word:** the monthly general-advice line and the scope notice when due (safety and scope wording); the Bad-day choice when a sore area is at *Bad*; the halfway *still okay?* check; every support line.

**Moves to the Plan** (reachable from Free only through *See what the Plan adds*): choosing any kind of session (Cardio, Core & Strength; Mobility & Conditioning; Yoga & Pilates; Run; Classes), the arc row, the Library's shelves, I know what I want, Make it up as I go, Free's twelve-week programme and weekly plan. A Free route to any of them opens one page: what it is in one line, *Part of the Plan*, *See what the Plan adds*, *‹ Home*. In Step stays on both tiers (decided 05 Nov).

**Archive rule** before anything is removed (BNH-Files `Archive/P-46/`). This changes Free by Graeme's decision (P-40 confirmed 24 Nov), an exception to leaving Free alone.

## 6. The player: one screen per move, both tiers

As the mock-up: *Exit* · *n of N* · *What's left*; the bar; the name; the dose (*3 sets of 10 · rest 45 sec*); the figure; one cue line (the entry's first coaching cue); the main button (*Start* for a timed move; *Set n done* for sets, with reps and weight editable on the button's sheet, which is today's Capture); Swap, Do later, Skip; *More about this move* folded (Why, Watch out, How, Easier or harder, from the entry as now).

- **Kept:** the sore-area line on a move that works a sore area (*Works your lower back, which you said is sore today*) stays above the cue, unfolded (safety); the first-exercise safety note; hold voice (P-28); the halfway check; the timer sound and vibration; Reduce motion; the Plan's and Free's own finishes.
- **New on Free:** Swap (same kind, then search), Do later and What's left, which the Plan has had since P-22–P-24 (shown in the approved mock-up).
- **Gone:** the four tabs and *I know this one: go to capture*.
- Target: a 12-move session in about 25 taps (76 in the Wave 7 trace).

## 7. One short line

Every screen: **at most about 15 words above the first button**. Longer text moves behind *More*, *Why?* or into the next screen. Measured by `tools/chromium-word-budget.mjs` (budget 60 → 15), every screen, both tiers. **Exempt, listed in the tool with a reason each:** safety and scope wording until the clinical reviewer reads it (the safety note, red-flag questions, the scope notice, the monthly advice line, support lines); the first-session finish (Graeme kept it); In Step's episodes (scripted, voiced). The coach's spoken version (*Hear from your coach*) is decided with the voices next month; nothing here depends on it.

## 8. Store (schema first, S1)

- `onboarding.flow`: `"short"` for anyone who completes §2; absent for anyone who completed the old conversation (nothing about them changes).
- `askLater`: `{ [id]: { shownAt, answeredAt, notNowAt } }` for `activity`, `goals`, `weekly` (§4).
- No field removed: the old answers keep their fields, Settings and Restore unchanged.
- Privacy Policy (BUNDLE-RESYNC): getting started now stores less at the start; the later questions say when they are asked.

## 9. Build sessions

| S | Name | Files (expected) | Gate (red first) |
|---|---|---|---|
| S1 | SCHEMA + SAFE DEFAULT | `store.js`, `Schema.md`, `session-builder.js` (§3), `restore.js` if needed | `verify-p46-schema`: the fields; a short-flow person with no level never gets above ceiling 3 or any impact, a long-flow person unchanged |
| S2 | GETTING STARTED | new `views/onboarding/start.js`, `router.js`, the conditions sheet's red-flag part reused (not copied), `css` | `verify-p46-start`: four screens through the real view; what each writes; red flags run on an area; health consent declined skips screen 2; first session built gentle at the chosen place; under 18 and the agreements unchanged; the old thread archived |
| S3 | ASK LATER | `data/ask-later.js` (new), `plan-home.js`, Free Home | `verify-p46-ask-later`: when each appears, never on a hard day, one a day, Not now final |
| S4 | FREE HOME | `views/today.js` (Free), new `views/on-the-plan.js`, `router.js` | `verify-p46-free-home`: the rows; the six ready-mades by place; every moved route lands on *Part of the Plan*; safety lines still shown; the Plan's Home byte for byte |
| S5 | PLAYER | `views/workout.js`, `exercise-card.js`, `workout.css` | `verify-p46-player`: one screen per move, both tiers; tap count for a 12-move session; sore line, safety note, halfway check and hold voice still there |
| S6 | WORDS | copy across views; `chromium-word-budget.mjs` | every screen ≤ 15 words before the first button, exemptions listed with reasons; `verify-true-words` green |
| S7 | CLOSE | `sw.js`, glossary, device checklist sitting, Help guides that walk changed screens | full suite from a fresh clone; real browser at text 1, 1.45, 2; then the **Wave 8 persona trace** |

## 10. Not in this spec

The voices and *Hear from your coach* (next month); payments and the 14-day trial (P-40, row 14); the 14+ age change (P-41); Free's Progress window (P-40 says 30 days, unchanged here).

*Build New Habits · Alongside: Move · P-46 spec · 25 Nov 2026 v6*
