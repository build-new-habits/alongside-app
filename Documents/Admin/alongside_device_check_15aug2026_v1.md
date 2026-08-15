# Alongside: Move — Device Check

## 15 Aug 2026 v1

Build New Habits | Everything shipped 14–15 Aug, staged. Roughly 35 minutes if nothing is broken. Stop after any stage and pick it up later.

---

## Why this matters more than usual

Fifty-one gates are green and **not one of them runs a view.** They read source. That is how a `ReferenceError` in the Skip button shipped this afternoon and stayed green through eleven commits.

So the checks below are ordered by **what is most likely to be broken**, not by what is most interesting. Stage 1 is the highest-risk thing in the app right now.

**How to record it.** Each check has a box. `[ ]` untested, `[x]` fine, `[!]` wrong. If something is `[!]`, note what you saw — screenshot is ideal. Do not fix anything; just record it.

---

## Stage 0 — Get the new version. Two minutes.

Everything below tests code from `alongside-v359`. If your phone is holding an older service worker you will be testing yesterday's app and every result will be wrong.

**0.1** `[ ]` Settings → scroll to the bottom → tap **Force update**. It should say *"Reloading with the latest version…"* and reload.

**0.2** `[ ]` After the reload, confirm the app still opens normally to Home.

> If Force update does nothing, close the app fully (swipe it away), reopen, and try once more. If it still does nothing, stop and tell me — nothing below is meaningful until this works.

---

## Stage 1 — The known defect. Five minutes. Do this first.

`pendingSkipOffer` was assigned without ever being declared, which throws in a module. This is the fix.

**1.1** `[ ]` Start any session from Home. On the **second or third exercise**, tap **Skip**.

- **Expected:** the exercise is skipped and the next card appears.
- **If it does nothing at all**, or the screen freezes, the fix did not take. Stop and tell me.

**1.2** `[ ]` After that skip, look **below the Skip button** on the next card. You should see a quiet line:

> *Want me to change how often [exercise name] comes up?*

with three buttons: **Less often · Not again · Leave it**.

**1.3** `[ ]` Tap **Leave it**. The strip should disappear and nothing else should change.

**1.4** `[ ]` Skip another exercise and this time tap **Not again**. The strip should disappear.

**1.5** `[ ]` Finish or abandon the session. Go to **Settings → How you like things**. Under *"Exercises you have asked me to change"* you should see that exercise by **name** (not an id like `bodyweight-glute-bridge`), tagged **Not again**, with an **Undo** button.

**1.6** `[ ]` Tap **Undo**. The row disappears and a message says it will be offered again.

---

## Stage 2 — Settings. Ten minutes. No side effects.

Everything here is safe to poke at.

**2.1 — Your age** `[ ]` Settings → Profile. The age dropdown should read **18 – 24 / 25 – 34 / 35 – 44 / 45 – 54 / 55 – 64 / 65 – 74 / 75 and over / Prefer not to say**.

- If you see **"Under 20"** or **"70+"**, you are on the old build. Go back to Stage 0.
- Whatever your age already showed, it should have carried across sensibly rather than gone blank.

**2.2 — What your body can do today** `[ ]` A section with that heading and four dropdowns: balance, chair, legs, floor. Each should have **"Not answered"** as a selectable option.

**2.3** `[ ]` Change the balance one to **"Yes"**, tap **Save**. You should get a confirmation message.

**2.4** `[ ]` Change it back to **"Not answered"**, blank the others too, tap **Save**. This should be allowed — no error, no forced answer.

**2.5 — How you like things** `[ ]` A section with that heading, containing:
- *How much should sessions change?* — three options
- *How much should the coach ask before a session?* — two options
- the exercise list from Stage 1

**2.6** `[ ]` Set *"How much should the coach ask"* to **Short — energy and mood only**. Save.

**2.7 — Show your best** `[ ]` A toggle labelled **Show your best**, and it should be **off**. Turn it on, turn it off again.

> **What I am checking here:** that four separate new panels render, that nothing overlaps or overflows on your screen width, and that Save actually confirms rather than silently doing nothing.

---

## Stage 3 — The short check-in. Three minutes.

You set this in 2.6.

**3.1** `[ ]` Start a check-in. It should ask **energy**, then **mood**, and then go straight to the session — **no** feeling word, **no** sleep, **no** "same or different" question.

**3.2** `[ ]` The coach should still speak first and still respond to both answers. If it has gone silent, that is a fail — brevity was never meant to cost the coach's voice.

**3.3** `[ ]` Go back to Settings and set it to **The usual**. Start another check-in and confirm the longer version returns.

> **If you have a condition recorded**, the pain question must appear on **both** settings. That one is not compressible and I would want to know immediately if it is missing.

---

## Stage 4 — Home. Five minutes.

**4.1** `[ ]` On Home, read the coach line above the four doors. There should **be** one. Note what it says.

**4.2** `[ ]` Complete a session today, then return to Home. The line should change to acknowledge that you moved.

**4.3** `[ ]` Check the session counter under it. If it shows *"1 of 3 this week"*, you chose a weekly target. If it shows *"1 session this week"*, you did not — both are correct, they just tell me which path you took.

---

## Stage 5 — The first-session moment. Ten minutes, and it needs a wipe.

**This stage deletes everything.** Do it last, and only when you are ready to lose your current data.

**5.1** `[ ]` Settings → bottom → **Reset all data** → confirm. You should land in onboarding.

**5.2 — Onboarding** `[ ]` Work through it. Watch for:

- After the activity question: **"Do you ever worry about losing your balance?"** — three options.
- Answer **"No, not really"**, and give a young age band and an active answer → you should **not** be asked about chairs or floors.
- **"What are we actually aiming at?"** — three options ending *"Come back from something"*.
- If you tick a condition like a heart condition or breathing at the conditions step, you should then be asked **"Has a doctor, physio or rehab team told you it's okay for you to exercise on your own?"**

**5.3** `[ ]` Do a first session and finish it properly.

**5.4** `[ ]` On the done screen you should see, **in this order**:
1. A block beginning **"That was your first one."** referring back to what you said had made this hard before.
2. A block beginning **"Can I ask about that one?"** with up to three questions about the movements you just did, and **Done** / **Skip this** side by side.
3. The usual exercise count and credits.

**5.5** `[ ]` Answer the questions and tap **Done**. The block should be replaced by a short line about what it changed.

**5.6** `[ ]` Do a second session and finish it. The **"That was your first one"** block must **not** appear again.

---

## Stage 6 — Optional, if you have the patience

**6.1** `[ ]` Do **three** sessions in one day. On the third done screen you should see **"That's three today."** — and it must **not** stop you doing a fourth.

**6.2** `[ ]` Do a fourth. Nothing further should be said about it that day.

---

## What I cannot ask you to test

Honest about the gaps.

- **Programme chaining (CHAIN-1)** needs a completed twelve-week programme. Untestable by hand.
- **Reassessment** is not built yet — step 3.
- **The plan-jump line** needs a fortnight of history before it can fire.
- **The short-check-in offer** appears after six check-ins, so it will not show today.

---

## When you are done

Send me the list with boxes filled, or just tell me the ones marked `[!]`. If Stage 1 fails I would rather know that on its own, immediately, than wait for the rest.

---

*Build New Habits · Alongside: Move · Device Check · 15 Aug 2026 v1*
