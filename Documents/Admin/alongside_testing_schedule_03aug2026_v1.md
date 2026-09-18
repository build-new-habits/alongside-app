# Alongside: Move — On-Device Testing Schedule
## 16 Sep 2026 v3

Build New Habits | Everything below is code-complete, gated and pushed to `main`. It is waiting on a real device and nothing else.

**v1 (03 Aug) described `sw.js v188` and was 326 cache versions stale.** It has been replaced rather than appended to — a stale checklist is worse than none, because it gets worked through and believed.

**Before starting:** Settings → version label should read **`v515`**. If it does not, the service worker has not updated: force-refresh, or reinstall the PWA. Everything below tests `v506`–`v514` and will give false results against an older worker.

> 🔴 **Why this matters more than usual.** Nine pushes landed on 16 Sep and **not one has been on a phone.** The gates prove structure — that text is present, that a branch is reachable, that a field is written. They prove nothing about whether a checkbox sits above your thumb at 06:40, or whether four labels fit a 380px screen. **The last three card changes were all amended by device use, not by tests.**

---

## 0. The recorded decisions — read before judging anything below

Two items on this list will look wrong on device and are not.

- **The variety question during check-in** ("something like last time / different / mix it up") **is free, deliberately.** Destination architecture §8: *"Free is: the coach decides, but asks the one question a human coach would."* The boundary is *last time*, never *March*. If it feels like a Plan feature, that is 🟡 **DIC-SIGNAL** — a presentation question — not a tiering bug.
- **Saving a session is Plan-only, and free gets nothing rather than a locked control.** `savedSessions()` returns `[]` for free by design, so a teaser would be a door with no room behind it.

⚫ **If any behaviour here looks like a gap, check `Documents/Business/` and `tools/verify-decisions.mjs` before concluding it is one.** DIC-TIER was "fixed" on 16 Sep against a decision recorded on 12 Aug, and only `verify-decisions` caught it.

---

## 1. The safety gate — the big one, ~10 minutes

**What is being tested:** GATE-ALL, GATE-TAPER, CARD-DECIDE (`v507`, `v510`).

To see it, clear the acknowledgement: Settings → dev panel → clear `safetyAckLog`, or use a fresh install.

- [ ] Start any session. "Before you start" appears **before the first exercise**.
- [ ] The checkbox and "Start the session" are **both comfortably reachable with a thumb** — this is the one I most expect to be wrong.
- [ ] Press "Start the session" **without ticking**. The button is not disabled; an error appears and focus moves to the checkbox.
- [ ] "Not now" leaves the session rather than trapping you.
- [ ] Tick, start. The session begins.
- [ ] **Start a second session the same day. The gate appears again.** This is the taper, not a bug — first five sessions, then every 30 days.
- [ ] **Go to stretching specifically.** This is the one that had no gate at all until `v507`.
- [ ] Try a **guided class** and a **walk**. Both should gate.

**If the gate does NOT appear:** check `safetyAckLog` — five current-version entries means the taper is satisfied and it will not fire again for 30 days. That is correct behaviour, not a failure.

---

## 2. The exercise card — ~5 minutes

**What is being tested:** CARD-5, CARD-DECIDE, the stepper (`v506`, `v510`).

- [ ] On **Decide**, "If it hurts" is **open**.
- [ ] On **Watch out**, **Do** and **Note**, it is **closed** — one row, rose-coloured, with a chevron.
- [ ] Tapping the closed row opens it. It still reads as a warning, not as an ordinary accordion. 🔴 **If it reads as a generic expander, say so — that is the whole risk of collapsing it.**
- [ ] The stepper shows four labels: Decide · Watch out · Do · Note.
- [ ] **Four labels fit without wrapping badly at your screen width.**
- [ ] Passed steps are tappable; steps ahead are plain text and do nothing.
- [ ] The caution line reads **"felt sore"**, not "is sore". 🔴 This was reported fixed on 15 Sep and was not — `session-rationale.js` never reached a commit until `v515`.
- [ ] **Two consecutive exercises working the same sore area do not read identically.** Graeme's first screenshots had Stationary Bike and Treadmill carrying word-for-word the same caution.

---

## 3. Morning session — ~3 minutes

**What is being tested:** CARD-LOCAL (`v512`). Red since 13 Sep.

- [ ] Start a morning session. **"If it hurts" is on the exercise card, open.**
- [ ] Before `v512` this screen had no safety text at all. If it still has none, the fix did not reach the device.

---

## 4. The coach proposal — ~5 minutes

**What is being tested:** PROPOSAL-LOC (`v508`).

- [ ] Check in, say **at the gym**, 40 minutes.
- [ ] Three options appear, **all three plausible at a gym.**
- [ ] 🔴 **No breathing session. No short walk.** Those were the hardcoded fallbacks.
- [ ] Each card's movement count matches what the session actually contains.
- [ ] Repeat **at home** and confirm the alternates change accordingly.
- [ ] Fewer than three cards is **correct behaviour**, not a bug — a slot the engine could not fill is dropped rather than padded.

---

## 5. Stretch — ~5 minutes

**What is being tested:** STRETCH-FOCUS, STRETCH-WHY (`v509`, `v514`). This is the flow that started the week.

- [ ] Flag a sore area at check-in, then open a stretch session.
- [ ] **"What's this for today?" appears with your flagged area already selected.**
- [ ] Changing the target re-orders the poses; **nothing is removed** — the session length stays the same.
- [ ] Poses matching the target come first.
- [ ] A pose that does **not** match carries a line saying what it *is* for, and that skipping it is fine.
- [ ] A pose that **does** match says nothing extra. 🟡 **If every pose carries a line, that is the failure mode — tell me.**
- [ ] Where a pose works your flagged area, it says so.

---

## 6. Saving a session — ~3 minutes

**What is being tested:** SAVE-ALL, SAVE-HANDOFF (`v511`, `v513`).

- [ ] Finish **any** session. On the reflection screen, **"Keep this one?"** appears with a suggested name.
- [ ] Save it. The message says so, and the button becomes "Saved".
- [ ] It is in **Your own**.
- [ ] Clear the name and save. It refuses **and says why**.
- [ ] Finish a **yoga** session. Same block, same screen — it no longer has its own.
- [ ] Finish a **walk**. **No save block** — a walk has no movements to keep.
- [ ] On **free**, no block at all, not a locked one.

---

## 7. Suggested order for one session

1. §0 — read the two recorded decisions first.
2. §1 safety gate, from a cleared `safetyAckLog`.
3. §5 stretch — the flow that started all of this.
4. §4 proposal, at the gym.
5. §2 card, §3 morning, §6 saving as you pass through them.

**~30 minutes end to end.**

---

## 8. Still open, and not testable here

- 🔴 `DEV_PANEL_ENABLED` is hardcoded `true` at `settings.js:463`. **Must be fixed before any tester install.** The dev panel is how several checks above are performed, so it is deliberately still on for this pass.
- 🟠 Gate wording to Foot Anstey with the ToS bundle.
- 🔴 R12 — who acts if Graeme cannot.

---

*Build New Habits · Alongside: Move · On-Device Testing Schedule · 16 Sep 2026 v2*
