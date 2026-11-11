# Alongside: Move — How-To Guides

## 11 Nov 2026 v2

Build New Habits | Alongside: Move | Spec, agreed in outline, not built (master schedule row P-25)

**v2 (11 Nov 2026).** This version takes in the review of v1 (project doc `alongside_howto_guides_review_11nov2026_v1.md`) and Graeme's four decisions of 11 Nov:

1. **Help on both tiers.** This is an exception to Stage AWARD's and Stage PATH's rule of leaving Free alone, as In Step was.
2. **Help is hidden while a session is running.**
3. **Your week gets "Every day, as well" routines** (section 7), which go to a mock-up first.
4. **This v2 is recorded at P-25.**

Changes from v1:
- A2, B1, C1 and C2 corrected against the screen.
- Section 2.6 (counts) removed.
- `verify-guides` checks screens, not source.
- Guide text lives in a data file.
- The guide sheet has tier variants and placeholders.
- A1 and D1 written.
- Section 9 answered.

v1 is archived in BNH-Files, `Archive/P-25 HOW-TO GUIDES/`.

---

## 0. Why this exists

On 11 Nov 2026 Graeme imported a real plan (morning and evening routines plus three gym sessions). He needed three rounds of questions to get from "it's in the app" to "I'm doing my morning routine". He built the app and knows its words. A new user would most likely have stopped at that point.

Two things follow:

1. People need short, findable how-to guides, written around what they are trying to do.
2. **Every guide that has to explain a workaround is a design fault to fix.** The guides are also a record of where the app is hard to use (section 7).

There is no help content in the app today. The `guide-*.mp3` files are workout audio, not help. **This spec replaces P-25's first idea of help under Settings › Help.**

---

## 1. The principle

> **Guides follow what people are trying to do, not the screens.**

Nobody thinks "I need the Your week screen". They think "I want my physio exercises on Mondays". Every guide title is a question in the person's own words, covers one task, and takes 3–6 steps.

---

## 2. Where people get help

### 2.1 One Help button, drawn once, in the same place

- **"Help" in words, with a line icon** (`line-icons.js`, no emoji). Never the icon alone, which is a guess for dyslexic readers and for anyone new.
- **Drawn by the app shell, not by each screen.** There is no shared header: each of the 61 views draws its own, and Home, Progress, Wellbeing and Settings have no ‹ Back. The router draws Help once, as it already draws the 🏠 hatch. That way it sits in the same place and the same order on every screen where it is shown (WCAG 2.2 SC 3.2.6 *Consistent Help*, Level A).
- **Top right**, on the same row as ‹ Back or the screen's heading. It scrolls with the page and is never fixed over content (SC 2.4.11).
- At least 44 × 44 px. Its accessible name begins with its visible word, "Help" (SC 2.5.3).
- **Hidden while a session is running** (a timer or a set going, in any player: workout, yoga, core, class, Guide me, breathing and the rest). It shows on Today's plan and on each session's start screen. Mid-exercise there is nothing extra beside **Pause** and **Exit**. SC 3.2.6 asks for the same place and order where help is offered, not for help on every screen.
- **Shown in the check-in**, where first-timers are.
- **Both tiers.** On Free it follows Free's look. The Plan's look and Free's look differ only as they already do (`planLook()`).
- **Measured before it ships:** `chromium-text-fit.mjs` at text 1, 1.45 and 2 on every screen, both tiers. Free's centred headings at text 2 and Plan Home's fold at text 1 are the screens to watch. `chromium-under-bar.mjs` too.
- Closing a guide returns focus to the Help button (SC 2.4.3).

### 2.2 It opens a full "How do I…?" screen

Small pop-out menus are hard to use with a screen reader, a switch or large text. Instead there is one screen, with its own h1 that takes focus, like every other screen:

1. **On this screen.** The 2–3 guides for the screen the person came from, and only guides for what that person has. If there are none, this section is left out, never shown as "No guides".
2. **Categories.** The six groups in section 3. Guides about Plan features come last in each category, under **Part of the Plan**. This is the only mention of the Plan: no upselling in help.
3. **Search.** Plain matching on titles and each guide's `keywords` (the words people use: "physio", "sore", "missed"). Rules only, no AI. If nothing matches, the categories show; the page is never empty.
4. **Still stuck?**
   - **hello@buildnewhabits.co.uk** shown with a **Copy** button. The app sends nothing, and this waits for the domain's email (master schedule row 8).
   - For medical questions and anything urgent, the existing wording from `js/data/support-lines.js`. Safety wording is not rewritten without the clinical reviewer.

The screen stores nothing, so it needs no change to the Privacy Policy.

### 2.3 Every guide ends with "Did that work?"

- It is optional, never a gate.
- **Back to where I was** returns to the screen they came from.
- **Not quite** shows 2–4 likely answers at once, one level deep, each leading to a short guide. This is the branching: a small written decision tree, not free text. No branch leads back to where it started (checked, section 2.5).

### 2.4 Guide text in one data file; videos on the website

- **The guide text is written once, in `js/data/guides.js`,** as the app's other content is (`feel-programmes.js`, `in-step-programme.js`). It is precached, so it works offline and always matches the app version in your hand. It is drawn through the app's escaping, with no Markdown reader added. (v1 proposed Markdown in `docs/`. The app has no build step and no Markdown reader, and `docs/` is not precached.)
- **The website is a separate repository.** A small export script writes its guide pages from the same file, as `verify-website` already reads `../website`. The wording can't drift.
- **Videos live on the website.** Each guide in the app links to its video, and the link says it opens the browser. Videos never autoplay.

### 2.5 Guides can't go out of date silently: `tools/verify-guides.mjs`

The check works from the screens, not the source. A label in code that is never drawn must not pass. Plan Home's old week card still holds **Show me today's plan** in `today.js`, unreached since v61.

- **Screens and states.** Each guide names its `screens` and a `fixture` (the state the person is in). The check opens each screen in that state (jsdom in the `verify-*` loop; Chromium for the pictures).
- **Labels.** Each bold label must appear in that screen's visible text, or in a control's accessible name, for each tier the guide covers. The check:
  - matches `textContent`, not `innerText` (look-labels are uppercase in CSS);
  - treats straight and curly apostrophes as the same.
- **Placeholders.** For labels the app builds or the person writes, such as `**Save {day}**` and `**Start {your list's name}**`, the check matches a pattern.
- **Branches.** Every "Not quite" target exists, and none loops back.
- **Version.** It writes `checked_against` itself; never by hand.
- **Reversal-proven.** A label renamed in a copy turns it red and names the guide.
- **Before it is trusted:** Plan Home's unreached code in `today.js` (`_planDoors`, `_weekCard`, `_coachCard`) is archived under the archive rule, and the stale notes are corrected (`store.js` line 154; `week-shape.js` `askForToday({ short })`; the `today.js` header's "a shorter way in (QUICK-2)").

*(v1's section 2.6, anonymous counts of guide use, is withdrawn. Privacy Policy v12 says the app uses no analytics and sends nothing, and `verify-outbound` holds it to that. Feedback comes from tester sessions now. Later, one optional question can go in the B5 survey: "Which guides did you need?")*

---

## 3. Categories and guides

Six categories, each title in plain words. **P1** guides are needed before beta; the rest follow. "Plan" in the Tiers column means the guide is filed under **Part of the Plan** for Free.

### A. Getting started

| ID | Guide title | Shown on | Tiers | Priority |
| --- | --- | --- | --- | --- |
| A1 | I've just opened the app. What do I do? | today, checkin | both | P1 |
| A2 | Start today's session | today | both | P1 |
| A3 | What happens during a session? (pause, skip, finish) | coach-proposal, session start screens | both | P2 |
| A4 | Free and the Plan: what's the difference? | today, upgrade | both | P2 |

### B. Your exercises and plans

| ID | Guide title | Shown on | Tiers | Priority |
| --- | --- | --- | --- | --- |
| B1 | I've got exercises from a physio, a class or a sheet | prescribed, plan-import, your-week | Plan | P1 |
| B2 | Add one exercise by hand | prescribed | both | P2 |
| B3 | Change, rename or remove an exercise | prescribed | both | P2 |
| B4 | I can't, or won't, do this exercise | coach-proposal, prescribed | both | P2 |

### C. Your week

| ID | Guide title | Shown on | Tiers | Priority |
| --- | --- | --- | --- | --- |
| C1 | Put my sessions on set days | your-week, plan-import (done screen) | Plan | P1 |
| C2 | Do a daily routine as well as my sessions | your-week, prescribed | Plan | P1 |
| C3 | Change my week | your-week | Plan | P2 |

### D. When life gets in the way

| ID | Guide title | Shown on | Tiers | Priority |
| --- | --- | --- | --- | --- |
| D1 | I've missed days. Have I ruined it? | today, progress, coach-proposal | both | P1 |
| D2 | I've only got 10 minutes | today, coach-proposal | both | P2 |
| D3 | Something's sore today | today, checkin, bad-day-door | both | P2 |

### E. Your progress and your arc

| ID | Guide title | Shown on | Tiers | Priority |
| --- | --- | --- | --- | --- |
| E1 | I'm working towards a date | arc-setup, your-week | Plan | P2 |
| E2 | Am I getting anywhere? | progress | both | P2 |

### F. Account, privacy and the Plan

| ID | Guide title | Shown on | Tiers | Priority |
| --- | --- | --- | --- | --- |
| F1 | Delete my health answers | settings, privacy | both | P2 |
| F2 | Use the app on a new phone | settings | both | P2 |
| F3 | Make the text bigger, or the app quieter | settings | both | P2 |

D3 quotes the app's own safety lines and never paraphrases them. It goes to the clinical reviewer with row 12.

---

## 4. Guide sheet standard

Every guide follows this shape (an entry in `js/data/guides.js`; shown here as it reads).

```
id: C1
title: Put my sessions on set days
category: Your week
screens: [your-week, plan-import]
tiers: [plan]                     # or [free, plan]
keywords: [days, week, schedule, plan]
fixture: own-plan-imported        # the state verify-guides opens the screens in
video: https://<website>/help/c1
checked_against: (written by verify-guides)
```

- One line first: what you'll end up with.
- Then 3–6 steps, one action per step. Button names are in **bold**, exactly as the app says them. A label the app builds is written as a placeholder, `**Save {day}**`.
- A step can have `free:` and `plan:` wording where the two looks differ:
  - **‹ Back** on the Plan; **‹ Home** or **← Home** on Free.
  - **Not today** on the Plan; **Pick something else** on Free.
- When a guide shows both versions, it says which in words the person can see ("If Home says **Let me choose for you**…"), never by tier name alone.
- Then **Did that work?** with **Back to where I was** and **Not quite** branches.

**Writing rules:**

- Plain English, short lines, no all-caps, no jargon. Look-labels are uppercase on screen through CSS; guides write them in sentence case (parked: section 10).
- Speak to the reader as "you".
- No blame: "If you don't see it…", not "If you failed to…".
- Say where things are by name, never by colour or position (SC 1.3.3).
- The first time in each guide, Home is "Home (the **Today** tab)". The bottom bar says Today; buttons say Home.
- Names as `docs/glossary.md` has them: **Today's plan** (not "a coach-built session"), **My exercises**, **Your week**, **check-in**, **sore area**.
- Never health advice. Guides say how to use the app, not what exercise to do.
- **Pictures.**
  - In the app: text steps, and at most one picture per guide, where a control is hard to find.
  - On the website: one picture per step, with alt text that says what the step needs.
  - All pictures are made by a script from the guide's fixture, both looks, so they are remade whenever `verify-guides` fails.

---

## 5. Video standard

- **Length and content:** 60–90 seconds, one guide per video, with the same title and steps as the sheet. The sheet is the script.
- **Recording:** Claude records them as scripted Chromium screen recordings: 390 × 844, text size 1.45, touches drawn, the fixture person "Sam", no real data. They can be remade whenever the check fails. Each is recorded at the version in `checked_against`.
- **Narration:**
  - Voiced by Graeme in ElevenLabs, in a steady, calm voice. Recommended: a different voice from the coach's In Step voice, so help never sounds like the coach.
  - **The narration names every action** ("Tap **Read my plan**"), so no separate audio description is needed (SC 1.2.5).
  - No music under speech.
- **Captions:** edited for accuracy, not auto-captions alone (SC 1.2.2), plus a transcript, which is the guide sheet.
- **Hosting:** self-hosted MP4 files with caption tracks on the website, not third-party embeds, so the site stays free of tracking. No autoplay.

---

## 6. P1 guides (wording checked on screen, 11 Nov 2026, `alongside-v714`)

### A1 — I've just opened the app. What do I do?

`screens: [today, checkin]` · `tiers: [free, plan]` · `keywords: [start, begin, new, first, what now, lost]` · `fixture: first-day`

You'll end up doing one session, chosen for how you are today. It takes three quick questions.

**If Home says Let me choose for you**

1. Tap **Let me choose for you**.
2. Answer the three questions: your energy, your mood, and anything sore. Tap the word closest to how you are. **Okay** is fine.
3. If nothing is sore, tap **Nothing today**.
4. Today's plan opens, with what's in it and about how long it takes. The first time, tick **I have read this.**
5. Tap **Start**.

**If Home says What do you want to do today?**

1. Tap **Not sure? I'll pick something**. Or, if you know what you want, tap a session under **Move your body**, for example **Yoga & Pilates**.
2. Answer the questions the same way. **Okay** is fine.
3. The first time, tick **I have read this.** Then tap **Start**.

If Home shows **Carry on**, or a row starting **Today, from your week**, tap that instead. It's what you were doing, or what you planned for today.

**Did that work?**

- Back to where I was
- Not quite:
  - "I don't want to answer questions today" → *(plan)* tap **Not today** on the first question. Today won't ask again.
  - "I don't want this plan" → tap **‹ Back** *(plan)* or **Pick something else** *(free)*, then choose for yourself:
    - *plan:* **Get stronger**, **Keep moving**, **Stretch** or **Move to feel better**
    - *free:* a session under **Move your body**
  - "Something's sore" → D3
  - "I've only got a few minutes" → D2

### A2 — Start today's session

`screens: [today]` · `tiers: [free, plan]` · `fixture: week-day-set`

1. Open Home (the **Today** tab).
2. If today is in your week, the top row starts **Today, from your week**.
   - Your own exercises: tap **Start your list**.
   - A session the coach builds, or one you built: tap the row itself, for example **Today, from your week: {day plan's name}**.
3. When your list is finished, it says **All done today.**
4. Nothing set for today? Tap **Let me choose for you** *(plan)* or **Not sure? I'll pick something** *(free)* (guide A1).

**Did that work?**

- Back to where I was
- Not quite:
  - "There's no row for today" → C1
  - "I'd rather do something else today" → *(plan)* choose under **Or something else today**

*(v1 said "tap **Show me today's plan**". That button is in unreached code and has not been on screen since v61, 28 Oct.)*

### B1 — I've got exercises from a physio, a class or a sheet

`screens: [prescribed, plan-import, your-week]` · `tiers: [plan]` · `fixture: no-own-exercises`

You'll end up with your own exercises in the app, grouped by day, ready to play.

1. On Home (the **Today** tab), tap **Library**, then **My exercises**, then **Add a plan you already have**.
2. Paste your plan into the box called **Your plan**. Tap **Get the template** if you want to see the layout first.
3. Tap **Read my plan**.
4. Check **Here's what I read**. Ticked exercises were recognised. Where it asks **Which is it?**, choose the closest match.
5. Tap **Add the ticked ones to My exercises**.
6. You'll see **Added to My exercises**. Tap **Put them into your week** to choose which days they go on (guide C1).

**Did that work?**

- Back to where I was
- Not quite:
  - "It says **I couldn't read much of this**" → tap **Get the template** and copy its layout.
  - "I see **See the Plan** instead" → adding a plan is part of the Plan (A4).

*(v1 also started from Your week. There the button shows only before a week exists, or after **Change the week**, beside the line "Choosing one of these replaces your week as it is now", which would worry someone who only wants to add a plan.)*

### C1 — Put my sessions on set days

`screens: [your-week, plan-import]` · `tiers: [plan]` · `fixture: own-plan-imported`

You'll end up with each session waiting for you on its day.

1. Open **Your week** (Home › **Library** › **Your week**, or **Put them into your week** after adding a plan).
2. Tap a day, for example Monday.
3. Choose what the day is:
   - **My exercises**, then the session you want under **Which of My exercises**; or
   - **A session**, and the coach builds it on the day from what you set here.
4. Tap **Save {day}**, for example **Save Monday**.
5. Do the same for your other days. Set the days you don't want to train to **Rest**. Rest counts.
6. On the day, Home shows **Today, from your week**. Tap **Start your list**, or tap the row (guide A2).

**Did that work?**

- Back to where I was
- Not quite:
  - "**There is nothing in My exercises yet.**" → B1
  - "I want a routine every day as well" → C2

### C2 — Do a daily routine as well as my sessions

`screens: [your-week, prescribed]` · `tiers: [plan]` · `fixture: own-plan-imported`

Each day in Your week holds one thing for now. Keep your sessions in Your week, and start daily routines from My exercises.

1. On Home (the **Today** tab), tap **Library**, then **My exercises**.
2. Each part of your plan has its own heading and its own button.
3. Tap **Start {its name}**, for example **Start Morning routine**.

> **Design note:** this guide describes a workaround. It is rewritten when "Every day, as well" is built (section 7).

### D1 — I've missed days. Have I ruined it?

`screens: [today, progress, coach-proposal]` · `tiers: [free, plan]` · `keywords: [missed, away, holiday, ill, break, behind, ruined, start again]` · `fixture: away-ten-days`

No. Alongside never counts days in a row, so there is nothing to lose and nothing to catch up on.

1. Start as you usually do (guide A1).
2. If it has been a week or more, Today's plan asks about the last little while. It's optional and asked once. Tap the closest: **Life got full**, **Finding it harder**, **Was unwell** or **Was injured**. Or tap **Rather not say — let's just begin**.
3. If you chose **Life got full** or **Finding it harder**, it offers to start a notch gentler. Tap **Yes, ease me back in**, or **No, I feel fine — carry on as before**.
4. If you chose **Was unwell** or **Was injured**, your first session back is gentler without asking.
5. *(plan)* **Your week** carries on as it was. Missing a day is fine: the week does not keep score. Your arc doesn't need making up either.
6. *(free, following My programme)* If you've missed a couple of sessions, Today's plan asks how to fit the rest: **Stay in 12 weeks** or **Keep the same rhythm**.

**Did that work?**

- Back to where I was
- Not quite:
  - "I don't feel up to a full session" → D2
  - "Something's sore after the break" → D3
  - "I want to change my week" → C3
  - "It's more than missed days" → the **Wellbeing** tab has quieter things. **Still stuck?** says who to talk to.

*Check notes:*
- **Was unwell** and **Was injured** show only to someone who agreed to keep health answers (`returnChoices()`).
- The return question is asked only on Today's plan (parked, section 10).
- "Missing a day is fine: the week does not keep score." is Your week's own line.

### For D2 (P2): where a shorter or different session is offered now

*Only 10 minutes* and *Something else today* went from the Plan's week card in A-1 (v57). Here is what replaced them.

**Shorter**
- **Both tiers:** on Today's plan, the length shows as a button with the time, for example **30 min**. Tap it to choose 10–60 min. Its label, *Length*, is hidden on screen (section 7).
- **Plan:**
  - **Something different today** › **Shorter (20 min)**, **Easier**, **Harder**.
  - In a door, **How long have you got?** (Build it for me 10–50 min; Stretch 10 or 15; Move to feel better 5–20).
  - Classes: **Full** or **Shorter**.
- **Not offered:** a My exercises day is played as written (section 7).

**Something else**
- **Plan:** **Or something else today** above the doors. **Something different today** › **A different kind**, **Somewhere else**, **A class instead**, **Make it up as I go**.
- **Free:** **Pick something else** on Today's plan, which goes back to Home.

---

## 7. Design faults found while writing guides

| Found | Fault | Fix |
| --- | --- | --- |
| 11 Nov 2026 | A day in Your week holds one thing, so a daily routine can't sit beside a gym session (C2 is a workaround) | **Decided 11 Nov (Graeme): "Every day, as well"**, mock-up first. See below |
| 11 Nov 2026 | After importing, nothing says how to *do* the routines that aren't on a weekday | The **Added to My exercises** screen links to C1 and C2 (goes with "Every day, as well") |
| 11 Nov 2026 | On Today's plan the time button shows only "30 min"; its label *Length* (and *Where*) is hidden (`.cp-assumptions__label { display: none }`), so a guide can't name it | Show the labels, measured against the word budget; mock-up first |
| 11 Nov 2026 | A My exercises day has no shorter version | A **Shorter** choice (needs design) |
| 11 Nov 2026 | Unreached Plan Home code still holds old button words (`today.js`) | Archive before `verify-guides` (section 2.5) |

### "Every day, as well" (decided 11 Nov; mock-up before any build)

**What the person sets**
- Your week gains **Every day, as well** under the days: up to two routines.
- Each routine is a part of My exercises or a saved session, with **Morning** or **Evening**, on the days chosen (every day by default).
- It is set once, not seven times.

**Schema first**
- `weekShape.routines[]` (`{ id, own | saved, when, days }`).
- `weekShape.days[]` is untouched, so every existing week loads as it was.
- Readers: `week-shape.js` `todayInWeek()`, `plan-home.js` `todayState()`, Restore, `sanitizeWeekShape()`.
- Plan only; Free unchanged.

**Home**
- Still one row with one action, and six ways in.
- The row names the **next thing not done today, in the person's own order**: morning routine, then the day's session, then the evening routine.
- Its line says what else is on today ("Then Gym A, and Evening stretch").
- The order comes from what they set, never from the clock or a guess.

**Counting**
- A routine is logged as a snack (`snack: true`, P-19), so routines on one day count as one day moved unless the person ticks **Count this as a session**.
- This reuses existing fields; no new counting rule.

**Version 1 limit**
- A routine is once a day. My exercises marks each exercise `completedToday`, so a routine used morning and evening would show as done after the morning. The day screen says so.

**Rejected**
- A day holding a list of plans: every reader of `days[]` would change.
- Two cards on Home: this breaks one action per card and six ways in.

---

## 8. Build sequence

P-25's place in the order holds: **after the phone test's fixes, with BUNDLE-RESYNC.**

1. ✅ Agree this spec (11 Nov 2026, v2).
2. Archive Plan Home's unreached code in `today.js` and correct the stale notes (section 2.5).
3. Write the P1 guides into `js/data/guides.js` with their fixtures. Graeme approves the wording.
4. Build `tools/verify-guides.mjs`: red first, reversal-proven.
5. Build the Help button (app shell) and the **How do I…?** screen: on this screen, categories, search, still stuck. Both tiers, measured with text-fit and under-bar.
6. Add "Did that work?" branching.
7. The website: the `/help/` page from the export script. Record the P1 videos.
8. Test with 3–5 people from the core audience (ADHD, dyslexia, older users), watching where they still get stuck.
9. P2 guides.

"Every day, as well" (section 7) has its own row and mock-up. C2 is rewritten when it ships.

---

## 9. Questions from v1, answered (11 Nov 2026)

1. **Help in a running session:** hidden while running; shown on Today's plan and each session's start screen (Graeme, 11 Nov).
2. **The website's guides:** a `/help/` page linked from the footer and *How it works*. It uses the website's own styles, is written from `guides.js` by the export script, and each guide gets a short page within the 60-word rule.
3. **Anonymous counts:** no; they conflict with Privacy Policy v12 (section 2.5 note). Feedback comes from tester sessions, then the B5 survey.
4. **Videos:** Claude records them (scripted Chromium) and Graeme voices them, at the version in `checked_against`, self-hosted on the website (section 5).
5. **What Free sees:**
   - **On this screen:** only what they have.
   - **Categories:** everything, with Plan guides last under **Part of the Plan**.
   - **Search:** everything.
   - Help itself is on both tiers (Graeme, 11 Nov).

---

## 10. Parked (noted, not acted on)

1. Uppercase look-labels (CSS `text-transform`) and dyslexic readers: sentence case on screen.
2. One name for the place: the **Today** tab, or Home.
3. The return question ("the last little while") is asked only on Today's plan, not through Stretch, Move to feel better or a My exercises day.
4. `index.html`'s hidden, never-shown floating **Send feedback** button (`#feedback-fab`, with an emoji): tidy it under the archive rule.
5. An optional question in the B5 survey: "Which guides did you need?"
6. New glossary rows when built: **Help**, **How do I…?**, **Did that work?**, **Not quite**, **Still stuck?**, and Home.

---

*Build New Habits · Alongside: Move · How-To Guides · 11 Nov 2026 v2*
