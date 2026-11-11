# Alongside: Move — How-To Guides

## 11 Nov 2026 v1

Build New Habits | Alongside: Move | Draft spec for discussion

---

## 0. Why this exists

On 11 Nov 2026 Graeme imported a real plan (morning and evening routines plus three gym sessions) and needed three rounds of questions to get from "it's in the app" to "I'm doing my morning routine". He built the app and knows its words. A new user would most likely have stopped at that point.

Two things follow:

1. People need short, findable how-to guides, written around what they are trying to do.
2. **Every guide that has to explain a workaround is a design fault to fix.** The guides are also a record of where the app is hard to use.

There is no help content in the app today. The `guide-*.mp3` files are workout audio, not help.

---

## 1. The principle

> **Guides follow what people are trying to do, not the screens.**

Nobody thinks "I need the Your week screen". They think "I want my physio exercises on Mondays". Every guide title is a question in the person's own words, covers one task, and takes 3–6 steps.

---

## 2. Where people get help

Graeme's starting idea (11 Nov): a small manual icon that pops out with a menu of likely behaviours, perhaps grouped as categories, which can branch. Guides and videos live on the website; you can reach them from both the website and the app.

**Kept:** categories, branching, the website as the home for videos, and a way in from both places.

**Refined:**

### 2.1 A labelled button, always in the same place

- **"Help" with the icon, never the icon alone.** An icon on its own is a guess for dyslexic readers and for anyone new.
- **The same place on every screen**, in the header next to ‹ Back. WCAG 2.2 SC 3.2.6 *Consistent Help* (Level A) requires a help mechanism to sit in the same relative order across pages.
- **Not a floating button over the content.** A floating button can cover the thing the person is trying to tap, and can hide focused elements (SC 2.4.11 *Focus Not Obscured*). In a session the button stays in the header and doesn't interrupt timers.
- Target size at least 44 × 44 px (well above SC 2.5.8's 24 px minimum).

### 2.2 It opens a full "How do I…?" screen, not a small pop-out menu

Small pop-out menus are hard to use with a screen reader, a switch, or large text. One screen with its own h1 that takes focus, like every other Alongside screen:

1. **On this screen** — the 2–3 guides tagged to the screen the person came from. This is the "branch" most people need, and it needs no searching.
2. **Categories** — the six groups in section 3.
3. **Search** — plain keyword matching on titles and the words people use ("physio", "sore", "missed"). Rules only, no AI.
4. **Still stuck?** — one way to tell us, which also says what we can't help with (medical questions).

### 2.3 Every guide ends with "Did that work?"

- **Yes** → back to where you were.
- **Not quite** → "What happened?" with 2–4 likely answers, each leading to a short fix guide. This is the branching: a small, written decision tree, not free text.

### 2.4 Text in the app, videos on the website

- **Guide text is written once as Markdown in this repo** (`docs/guides/`). The app bundles it, so it works offline (the app is a PWA) and always matches the app version in your hand. The website publishes the same files.
- **Videos live on the website**, and each guide in the app links to its video. Videos never autoplay.
- One source means the wording can't drift between app and website.

### 2.5 Guides can't go out of date silently

Add `tools/verify-guides.mjs`: every button or screen name written in **bold** in a guide must exist as a label in `js/`. When a label changes, the check fails and names the guide to update. (The same approach checked Graeme's plan import against `plan-reader.js` on 11 Nov.) The check must treat straight and curly apostrophes as the same: the app writes **Show me today’s plan** with a curly one.

### 2.6 Learn from use, without watching people

If, and only if, it fits the privacy policy: count guide opens and "Not quite" taps, anonymously, with nothing about the person. The most-opened guides are the next design fixes. If this can't be done within the privacy policy, ask testers instead.

---

## 3. Categories and guides

Six categories, each title in plain words. **P1** guides are needed before beta; the rest follow.

### A. Getting started

| ID | Guide title | Shown on | Priority |
| --- | --- | --- | --- |
| A1 | I've just opened the app. What do I do? | today, check-in | P1 |
| A2 | Start today's session | today | P1 |
| A3 | What happens during a session? (pause, skip, finish) | session players | P2 |
| A4 | Free and the Plan: what's the difference? | today, upgrade | P2 |

### B. Your exercises and plans

| ID | Guide title | Shown on | Priority |
| --- | --- | --- | --- |
| B1 | I've got exercises from a physio, a class or a sheet | prescribed, plan-import, your-week | P1 |
| B2 | Add one exercise by hand | prescribed | P2 |
| B3 | Change, rename or remove an exercise | prescribed | P2 |
| B4 | I can't, or won't, do this exercise | session players, prescribed | P2 |

### C. Your week

| ID | Guide title | Shown on | Priority |
| --- | --- | --- | --- |
| C1 | Put my sessions on set days | your-week, plan-import (done screen) | P1 |
| C2 | Do a daily routine as well as my sessions | your-week, prescribed | P1 |
| C3 | Change my week | your-week | P2 |

### D. When life gets in the way

| ID | Guide title | Shown on | Priority |
| --- | --- | --- | --- |
| D1 | I've missed days. Have I ruined it? | today, progress | P1 |
| D2 | I've only got 10 minutes | today | P2 |
| D3 | Something's sore today | today, check-in, bad-day-door | P2 |

### E. Your progress and your arc

| ID | Guide title | Shown on | Priority |
| --- | --- | --- | --- |
| E1 | I'm working towards a date | arc-setup, your-week | P2 |
| E2 | Am I getting anywhere? | progress | P2 |

### F. Account, privacy and the Plan

| ID | Guide title | Shown on | Priority |
| --- | --- | --- | --- |
| F1 | Delete my health answers | settings, privacy | P2 |
| F2 | Use the app on a new phone | settings | P2 |
| F3 | Make the text bigger, or the app quieter | settings | P2 |

Guides about Plan features show to everyone, marked "Part of the Plan". No upselling inside help beyond that line.

---

## 4. Guide sheet standard

Every guide follows this shape.

```markdown
---
id: C1
title: Put my sessions on set days
category: Your week
screens: [your-week, plan-import]
plan_only: true
video: https://<website>/guides/c1
checked_against: alongside-v<version>
---

# Put my sessions on set days

One line: what you'll end up with.

1. One action per step. Button names in **bold**, exactly as the app says them.
2. Say where things are by name, never by colour or position
   ("tap **Save Monday**", not "tap the green button at the bottom").
3. ...

**Did that work?**
- Yes
- Not quite:
  - "I can't see My exercises" → B1
  - "I want two things on one day" → C2
```

**Writing rules:**

- Plain English, short lines, no all-caps, no jargon.
- Speak to the reader as "you".
- No blame. "If you don't see it…", not "If you failed to…".
- One screenshot per step, with alt text that says what the step needs ("The Your week screen, with Monday showing 'Tap to say what this day is for'").
- Never health advice. Guides say how to use the app, not what exercise to do.

---

## 5. Video standard

- 60–90 seconds, one guide per video, same title and steps as the sheet. The sheet is the script.
- A screen recording with touches shown, and a steady, calm voice.
- **The narration names every action** ("Tap **Read my plan**"), so the video needs no separate audio description (SC 1.2.5).
- Captions edited for accuracy, not auto-captions alone (SC 1.2.2), plus a transcript, which is the guide sheet.
- No music under speech. No autoplay. Recorded at a large text size, so the screen is readable on a phone.
- Re-record when `verify-guides` fails for that guide.

---

## 6. First P1 drafts (wording checked against the code, 11 Nov 2026)

These four use labels found in `js/views/` on 11 Nov 2026. A1 and D1 still need writing, after their screens are checked.

### B1 — I've got exercises from a physio, a class or a sheet

You'll end up with your own exercises in the app, grouped by day, ready to play.

1. Go to **Your week** or **My exercises**, and tap **Add a plan you already have**.
2. Paste your plan into the box called **Your plan**. Tap **Get the template** if you want to see the layout first.
3. Tap **Read my plan**.
4. Check **Here's what I read**. Ticked exercises were recognised. Where it asks **Which is it?**, choose the closest match.
5. Tap **Add the ticked ones to My exercises**.
6. You'll see **Added to My exercises**. Tap **Put them into your week** to choose which days they go on (guide C1).

**Did that work?**
- Not quite:
  - "It says **I couldn't read much of this**" → tap **Get the template** and copy its layout.
  - "I see **See the Plan** instead" → adding a plan is part of the Plan (A4).

### C1 — Put my sessions on set days

You'll end up with each session waiting for you on its day.

1. Open **Your week**.
2. Tap a day, for example Monday.
3. Choose **My exercises**, then the session you want under **Which of My exercises**.
4. Tap **Save Monday**.
5. Do the same for your other days. Set the days you don't want to train to **Rest**. Rest counts.
6. On the day, Home shows **Today, from your week**. Tap **Start your list**.

**Did that work?**
- Not quite:
  - "**There is nothing in My exercises yet**" → B1
  - "I want a routine every day as well" → C2

### C2 — Do a daily routine as well as my sessions

Each day in Your week holds one thing. Keep your sessions in Your week, and start daily routines from My exercises.

1. On Home, tap **My exercises**.
2. Each day of your plan has its own heading and its own Start button.
3. Tap **Start** followed by the routine's name, for example **Start Morning Mobility**.

> **Design note:** this guide describes a workaround. The fix is to let a day hold a short routine as well as a main session (section 7).

### A2 — Start today's session

1. Open the app.
2. If today is in your week, Home shows **Today, from your week**.
   - For your own exercises, tap **Start your list**.
   - For a coach-built session, tap **Show me today's plan**.
3. If your list is finished, the card says **All done today.**

> **Still to check:** older notes in `today.js` mention **Only 10 minutes** and **Something else today** on this card, but they are not on it in the current code. Before writing D2, find where a shorter or different session is now offered.

---

## 7. Design faults found while writing guides

| Found | Fault | Suggested fix |
| --- | --- | --- |
| 11 Nov 2026 | A day in Your week holds one thing, so a daily routine can't sit beside a gym session (guide C2 is a workaround) | Let a day hold a short routine (morning or evening) as well as its main session, shown as two cards on Today |
| 11 Nov 2026 | After importing, nothing says how to *do* the routines that aren't on a weekday | The **Added to My exercises** screen links to C1 and C2 |

---

## 8. Build sequence

1. Agree this spec: categories, the Help button's placement, and where the guide text lives.
2. Write P1 guide sheets (A1, A2, B1, C1, C2, D1) in `docs/guides/`, and check the open ones against the code.
3. Build `tools/verify-guides.mjs`.
4. Build the Help button and the **How do I…?** screen (on this screen, categories, search, still stuck).
5. Add "Did that work?" branching.
6. Publish to the website. Record P1 videos.
7. Test with 3–5 people from the core audience (ADHD, dyslexia, older users), watching where they still get stuck.
8. P2 guides.

---

## 9. Open questions

1. Is the Help button in the header on every screen, including inside a running session, or is it hidden during sessions with a way back to it?
2. Where is the website's guides section, and does it share styles with the app?
3. Can anonymous guide counts be done within the privacy policy (section 2.6), or is user testing the only feedback loop?
4. Who records the videos, on which device, and at which app version?
5. Should Free users see the full guide list, or only Free features with a single "Part of the Plan" note?
