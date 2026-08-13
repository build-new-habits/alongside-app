# Device Pass — Alongside: Move
## 12 Aug 2026 v1

Cache to expect: **v294**

Work top to bottom. Each step says what to tap and what you should see. If something looks wrong, note the step number and move on — don't stop to investigate.

---

## 0 · Get the new version (2 min)

1. Open the app.
2. Close it fully — swipe it away from the app switcher, don't just background it.
3. Reopen.
4. **Settings → About.** You should see **v294**.

**If it still says an older number:** close it fully again and wait 30 seconds. The service worker updates on the second launch, not the first.

> ⚠️ Nothing below is valid until this says v293.

---

## 1 · The five things that changed on screen (5 min)

These are elements that were visible and are now hidden. **I need to know if any of them left a hole.**

| Go to | What changed | You should see |
|---|---|---|
| **Noticing** (Anytime → Noticing) | A heading was removed | Screen starts cleanly. **No awkward gap at the top** |
| **Reflect** (finish any session) | A heading was removed | Same — no gap where a title used to be |
| **Prescribed session** | A line was removed | No gap above the exercise |

**Then, in onboarding** — you can't easily re-run this, so just note it: two instruction labels are now hidden. If you ever reset a device, check the plan-select and frequency screens still make sense without them.

**Report:** for each — *fine* / *leaves a gap*.

---

## 2 · Small text got bigger (5 min)

19 labels were below your own 13px minimum and are now 13px. **They may now overflow their boxes.**

Look specifically at:

1. **Home** — any small badges or corner labels
2. **Weekly Plan** — the day labels (Mon, Tue…). These were 9px, now 13px. **Most likely to break.**
3. **Morning session** — the small timing text
4. **Settings → Library** — the small category labels
5. **Any locked/premium badge**

**You should see:** text that fits its box. **Report anything clipped, wrapped oddly, or overlapping.**

---

## 3 · Cardio session length (5 min)

1. **Home → Cardio, Core & Strength.**
2. Check in as normal.
3. Choose **cardio**, and set the duration to **60 minutes**.
4. **Count the exercises.** Note the number.
5. **Start it and note the actual clock time when you finish.**

**Expected:** the label says 55–65 minutes. Cardio builds only 4 exercises, so it may finish far short.

**Report:** exercise count, and real elapsed time.

---

## 4 · Doors you can't find (10 min) — this is the important one

This unlocks the navigation work. **Don't use your knowledge of the app.**

Pretend you've just installed it. From **Home only**, try to reach each of these. Time yourself roughly.

| Try to find | Found in… |
|---|---|
| A yoga session | |
| Your past sessions | |
| Somewhere to log a walk you did earlier | |
| The Noticing Hub | |
| Changing your equipment | |
| Turning on session notes | |

**For each:** *found immediately* / *found after hunting* / *couldn't find it*.

**This matters more than anything else on the list.** Anything in the last two columns is a hidden door, and hidden doors are what NAV-2 has to fix.

---

## 5 · Today's new things (10 min)

Quick confirmation each one appears and works.

1. **Settings → Display.** Move the **Text size** slider. **You should see** the sample paragraph resize as you drag, and the rest of the app follow.
2. Same screen — tap **Light**. **You should see** the whole app go light, immediately, with all text still readable. Tap **Dark** to go back.
3. **Check in**, then choose a session. **You should see** a question: *"Want to do something like last time, or shall we do something different today?"*
4. **Start a gym or coach session.** On the exercise card you should see:
   - a **note field** (weight/reps, or minutes for a hold)
   - **That was too hard / That was too easy**
   - sometimes a **grounding moment** — a short line inviting you to notice something
5. Tap **That was too hard**. **You should see** the label change to *"Noted — I'll ease this off."* Tap it again — it should go back.

**Report:** anything that doesn't appear, or appears in an odd place.

---

## 6 · If you have 5 more minutes

**Yoga session** — check the pose card shows a "watch out for" line. That data reached yoga for the first time today, so it's the newest thing on the screen.

---

## What to send back

Just the step numbers and a word or two each. Something like:

> 1 — Noticing fine, Reflect leaves a gap
> 2 — weekly plan day labels now clipped
> 3 — 4 exercises, finished in 22 min
> 4 — couldn't find log-a-walk or noticing hub
> 5 — all fine, grounding moment didn't appear

That's enough for me to work from.

---

*Build New Habits · Alongside: Move · Device Pass · 12 Aug 2026 v1*
