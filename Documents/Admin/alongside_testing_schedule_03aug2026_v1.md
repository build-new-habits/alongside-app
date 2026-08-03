# Alongside: Move — On-Device Testing Schedule
## 03 Aug 2026 v1

Build New Habits | Everything below is code-complete and pushed to `main`, waiting only on a real device. Ordered by how much is riding on each item, not by how long each takes — the `userTier` and `upgrade.js` items are quick even though they're listed first.

**Before starting:** confirm the app has pulled the latest service worker (`sw.js` should read `v188` — check via Settings' version label, or force-refresh/reinstall the PWA if it still shows an older number).

---

## 1. `userTier` fix — quick, 2 minutes

**What's being tested:** Personal-tier session-builder options should now unlock for Personal/Athlete tier, not show locked.

- [ ] Settings → triple-tap the version label to open the dev tier-switcher panel.
- [ ] Switch to **Personal**.
- [ ] Open the session builder (the "build your own session" flow, not the coach proposal).
- [ ] Confirm the previously-locked options (marked "Personal tier" in the aria-label) now render as available, not locked.
- [ ] Switch back to **Free** and confirm they correctly show locked again (the fix shouldn't have broken the free-tier gating itself).

**If this fails:** the fix was a one-line field-name change (`userTier` → `tier`) — if it's still locked on Personal, the most likely cause is a stale service worker still serving the old `session-builder-ui.js`. Force-refresh before assuming the code fix is wrong.

---

## 2. `upgrade.js` crash check — quick, 1 minute

**Not fixed yet** — this is a check to confirm the bug is real and reproducible before it gets scoped as its own fix, not a test of a fix.

- [ ] Navigate to the Upgrade/membership screen from wherever it's currently reachable (Settings, or a locked-feature prompt).
- [ ] Note whether it crashes, shows a blank screen, or silently fails.

Report back what actually happens — the code trace says it should throw on `store.getUserTier()` being undefined, but confirming the real on-screen behaviour (crash vs. silent blank vs. something else) will shape how urgently this needs fixing.

---

## 3. BUILD-GP — `gym-programme.js` exit-guard + activity fix — the longest item

**What's being tested:** the additive fix from 31 Jul — exit protection, `activityLog` visibility, and `reflect.js` no longer silently discarding answers, for a real structured-programme ("Build Your Base," etc.) session.

- [ ] **Back-gesture exit mid-session.** Start a real gym-programme session, get partway through, use the phone's back gesture. Confirm the Stay/Exit-and-save overlay appears (not an instant exit).
- [ ] **"Exit and save."** Choose it. Confirm a `status: "partial"` entry gets written with the correct `exercisesCount` (checkable via Settings' dev panel or by checking Progress shows something for today).
- [ ] **On-screen Exit button.** Same overlay, same save behaviour, this time from the button rather than back-gesture.
- [ ] **Genuine "Session done" completion.** Complete a full session properly. Confirm Home says "you moved today" (this previously didn't work — gym-programme sessions were invisible to `activityLog`).
- [ ] **Progress screen.** Confirm the completed session shows up in Progress's recent-activity observations.
- [ ] **Reflect answers.** After a genuine completion, answer `reflect.js`'s questions (feel / pain change / note / mood after). Confirm: (a) the *matching* `activityLog` entry gets the answers, not a stale one from a different session; (b) the question text is the gym-specific one ("I want to know what it actually felt like in there"), not a generic fallback.
- [ ] **Quick regression glance.** Week 6 mid-programme moment, Week 12 reflection, and A/B session-type alternation — none of today's changes touched this logic, but worth a glance since it's the same file.

---

## 4. BUILD-3 remaining session-view exit-guard files — batch, formality expected

**Already confirmed on-device (30 Jul), don't re-test:** `core-session.js`, `yoga-session.js` — both got a full pass during the 30 Jul testing session, including the id-reuse and stuck-screen fixes found along the way.

**Still needs a first on-device pass** — code confirmed clean twice via review, this is genuinely expected to be a formality, but "should work" isn't the standing to close on:

- [ ] `workout.js` (v6) — back-gesture and on-screen Exit both show the confirmation overlay; partial-exit saves correctly.
- [ ] `cycle-session.js`
- [ ] `running-session.js`
- [ ] `swim-session.js`
- [ ] `walk-session.js`
- [ ] `quiet-session.js`
- [ ] `breathing-session.js`
- [ ] `prescribed-session.js`

For each: start a session, back-gesture out partway through, confirm the overlay appears and "Exit and save" genuinely saves a partial entry. A quick pass per file — these all share the same fixed pattern, so if the first two or three pass cleanly the rest are very likely fine, but each one should still get an actual tap-through rather than being assumed from the others.

---

## 5. Small confirmations, low stakes

- [ ] **Reflect textarea sizing/contrast.** Code confirmed correct (11.87:1 contrast). Just needs a visual glance after a cache-clear/reinstall to close out — not expected to show anything.
- [ ] **Yoga/Core Session CSS visual check.** The `.session-exit-overlay`/`.session-exit-card` styling fix (30 Jul) was confirmed working in the core/yoga on-device pass — if you happen to be testing the other 8 files above anyway, a glance that the overlay looks right (not unstyled) on each is worth doing at the same time rather than a separate pass.

---

## 6. Suggested order for a single testing session

If doing this in one sitting rather than spread out: **1 → 2 → 3 → 4 → 5**, roughly 25–35 minutes total for a careful pass. Items 1 and 2 are genuinely quick and worth doing first since they're the most consequential (real bug, real paying-user impact) even though they're small. Item 3 is the longest single block. Item 4 is repetitive but low-risk. Item 5 can be folded into item 4's pass rather than done separately.

---

*Build New Habits · Alongside: Move · On-Device Testing Schedule · 03 Aug 2026 v1*
