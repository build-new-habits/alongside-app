# Alongside: Move — R1 and R2 Amendment
## 21 Aug 2026 v2

**Amends:** `Documents/Business/alongside_revenue_architecture_18aug2026_v1.md` §4, entries **R1** and **R2**.
**Status:** Decisions closed by Graeme, 21 Aug 2026. **v2 corrects two claims in v1** — see §1.10. The decisions themselves are unchanged; one of their stated reasons was wrong. This document is the build authority for R1 and for R2's boundary half. Where it conflicts with the revenue architecture, this document wins. Where it conflicts with `master_schedule.md`, the schedule wins.

---

## 0. Why this exists

R1's spec was written on 18 Aug against files that had not been opened. Ground-truthing it on 21 Aug found eleven points where the spec was wrong, undefined, or would have shipped a fault. A decision that lives only in a conversation has not been taken, so they are recorded here before any code is written.

Two of the eleven changed the product, not just the build.

---

## 1. Ground truth established 21 Aug 2026

Every finding below was confirmed by opening the file named. Line numbers are against the state at commit `74ca901`.

### 1.1 `targetDate` has two homes, and the second one is a weight-loss flow

| Field | Writer | Format |
|---|---|---|
| `strategicGoal.targetDate` | `js/views/today.js:710` — the CHAP-1 hinge | ISO string |
| `targetDate` (top level) | `js/views/onboarding/goal-setup.js:443`, inside `goalSetupSaveWeightTargetDate()` | Bare `YYYY-MM-DD` |

`js/store.js:662` migrates top level into `strategicGoal` on load, one way, and **only into an empty field**. `my-programme.js:392` already reads both, preferring the structured one — that was TARGET-3.

**Consequence:** R1 must read both homes and parse both formats. Reading only `strategicGoal.targetDate` repeats TARGET-3 in a new file.

⚠️ **Corrected in v2:** `goalSetupSaveWeightTargetDate()` is **unreachable** — `goal-setup.js` does not link (§1.10). So the top-level `targetDate` has no *reachable* writer, and the both-homes read is **defensive only**: it covers TARGET-4's migration and any historic install, not a live population. Still required, but v1 overstated what it was protecting.

### 1.2 `strategicGoal.setAt` does not record what R1 needs

Written only by `js/views/onboarding/plan-select.js:175` and `js/views/onboarding/thread.js:1260` — both at the moment the **weekly session frequency** is agreed. It is never written when a date is named.

So *"`setAt` is at least 21 days ago"* actually reads *"onboarding was at least 21 days ago"*, and gives no protection at all to a date named last week via the `today.js` hinge.

### 1.3 Top-level `targetDescription` has no writer anywhere

Read at `goal-setup.js:277`, `goal-setup.js:406`, and as `my-programme.js:392`'s fallback. Written by nothing in the codebase. Those two `goal-setup.js` reads are always empty.

**Logged, not fixed.** Outside R1's scope. Needs its own scoped task.

### 1.4 The pain threshold is two different numbers, deliberately

`getZoneStatus()` calls 7+ severe. `getPainBand()` calls 8+ severe. Both are live, both disagree, and `session-builder.js` surfaces the disagreement rather than resolving it, pending clinical review. SEVERE-1's Gentle Care bypass uses 8+.

### 1.5 Care Mode is not a queryable state

`careMode` appears only as per-opening flags in `checkin-openings.js`. SEVERE-1's Gentle Care is a build-time decision inside `session-builder.js`, not a persisted mode. There is no `store.get('careMode')` for R1 to suppress on.

### 1.6 No trailing-rate helper exists

Searched `sessionsPerWeek`, `weeklyRate`, `trailing`, `fourWeek`, `sessionsInLast`. Nothing. All new code.

### 1.7 `detectBurnout()` has no recency guard

It reads the last seven **recorded** check-in keys, not the last seven calendar days, so it can return a confident reading from three-week-old data.

For R1 this causes over-suppression, which is harmless. It matters for `today.js` and `coach-proposal.js`, which use it as an assertion.

**Logged, not fixed.** Separate scoped task.

### 1.8 Nothing records when the tier changed

`tier` is written at `js/views/upgrade.js:428` and `js/views/settings.js:2112`, with no timestamp at either site.

### 1.9 Target display is not tier-gated

`my-programme.js` imports `isPremium` and uses it at lines 324, 435 and 457 — none of them near the target section. `_whatYoureAimingAt()` renders the date and the countdown to free users. Nothing in the boundary ever sanctioned this; it accumulated.

### 1.10 `goal-setup.js` does not link — found 21 Aug, after v1 was written

`js/views/onboarding/goal-setup.js:29` statically imports `{ programmeEngine }`. `js/data/programmeEngine.js` exports twenty named functions and **no such symbol**, so the import is a link-time `SyntaxError` and the module never loads. Confirmed by execution, not by reading.

`programmeEngine.startProgramme()` at `:411` does not exist in any module either, so repairing the import alone would not make the view work.

**Reachable from five places:** `today.js:734`, `settings.js:2229`, `settings.js:2233`, `gym-programme.js:596`, `gym-programme.js:601`. It is in `app.js`'s `NAV_VIEWS` and routed at `router.js:189`.

**What is unreachable as a result:**

- The **12-week weight-target safety warning**. `validateWeightTarget()` also depends on `targetWeight`, which **has no writer anywhere in the codebase**, so it would return `null` on line 63 even if the module loaded. This has never fired for anyone.
- The date editor at `:443` — the only writer of top-level `targetDate`
- `goalSetupConfirm()`

A sweep of all 103 modules found **this is the only link failure**, and zero runtime failures. Now guarded permanently by `tools/verify-link.mjs` (LINK-1), whose known-failure list is exact in both directions: a new break turns it red, and so does fixing this one without delisting it.

Tracked as **GOAL-SETUP-1**. Repair-or-retire is a product decision, not a build one — `plan-select.js` already performs the live onboarding programme start, so this may be a superseded path that stayed routed.

---

## 2. Decisions closed, 21 Aug 2026

| # | Decision | Rationale |
|---|---|---|
| 1 | **Weight-based targets are excluded entirely in v1**, as a suppression condition with its own gate assertion | **Decision unchanged; reason corrected in v2.** v1 argued that a real population carries a weight goal plus a date. It cannot — the only writer of that pair is unreachable (§1.10), and `targetWeight` has no writer anywhere. The surviving argument is the one that does not depend on population: a weight target can still be set through `strategicGoal` at any time, and R1 commenting on progress toward one is a risk this product should not take for people it exists to serve. `goal-setup.js` already treated weight dates as needing a warning, so the codebase had decided this class was different before R1 was specified. Handling rather than excluding needs its own design. |
| 2 | **Maturity guard raised to 28 days**, matching the window | A 21-day window at three sessions a week expects nine sessions, so the 60% line sits at 5.4 and one bad week flips it. 28 days expects twelve and is steadier. The window is then always full, always the same length, no partial-window arithmetic, one number in the gate. Says out loud as: *the coach will not judge a target until it has had a full month to look at it.* |
| 3 | **New field `strategicGoal.targetSetAt`**, written at both date-write sites; falls back to `setAt` where absent | The guard exists to stop the coach judging a target it has barely seen. `setAt` records a different fact (§1.2). Using one for the other means the guard protects the wrong thing. |
| 4 | **`tierChangedAt` dropped** | It was a patch for a hole that decision 12 closes by construction. See §6. |
| 5 | **Both `targetDate` homes read; both formats parsed through one shared day-key helper** in `goal-review.js` | §1.1. A bare `YYYY-MM-DD` parses as UTC midnight and an ISO string as local, so mixed parsing flickers the 14-day boundary near midnight. |
| 6 | **A description is required for the trigger**, not just a date | `today.js:709` writes description and date independently — its own comment says a description without a date is common, and the reverse is equally possible. The copy requires the person's own words. Cleaner as a trigger condition than a fallback string. |
| 7 | **Where a date exists with no description**, `my-programme.js` renders a labelled text field inviting one | Real `<label for>`, never placeholder-as-label (WCAG 3.3.2). Framed as an invitation, never an error state. Writes to `strategicGoal.targetDescription`. |
| 8 | **Pain threshold for R1 is 7+**, via `getZoneStatus()` | Take the lower of the two live numbers. This is deliberately the opposite call from SEVERE-1: there, over-triggering strips someone's session, so the higher number was right. Here it defers a sentence by a fortnight. **R1 does not resolve the 7-vs-8 disagreement**, which stays a clinical review question, and its code comment must say so. |
| 9 | **Burnout suppresses at `moderate` and `high`** | Same asymmetry. Known cost, accepted: low rate and low energy correlate, so this may suppress a large share of true triggers. Somebody averaging 4/10 energy for five days is not the person to say this to. |
| 10 | **Partial sessions count** toward the trailing rate | Excluding them tells somebody who started three sessions that they managed one and a half — a shame mechanic arrived at by arithmetic. Including them only delays the conversation. **Confirm at build time that anything writes `status: "partial"`**; if nothing does, the branch is not built. |
| 11 | **Bottom band is mood or energy at 3 or below** | Anchored on the existing 1–10 labels, where 3 is "Low", rather than a number picked for the purpose. |
| 12 | **A dated target can only be recorded on the Plan.** Free keeps goals; targets move | See §6. This is R2's boundary half, and it is the decision that closes decision 4. |
| 13 | **Care Mode, for R1's purposes**, is severe pain today **or** today's check-in resolving to a `careMode: true` opening | §1.5. Confirm at build time that `checkin.lastOpeningMode` holds the opening id and is same-day; if it does not, R1 suppresses on the pain leg alone and the gap is logged. |

**Suppression is nearly free, and that asymmetry set decisions 2, 8, 9 and 11.** A suppressed offer leaves `lastOfferedAt` untouched and returns on the next open, and the trigger already requires the date to be more than 14 days out. So over-suppressing costs a conversation a fortnight later, which is better coaching anyway. Under-suppressing means telling somebody in a bad patch that their date is not going to work. Those are not comparable.

---

## 3. R1 trigger, restated in full

All of the following must hold. Any one failing means no offer, and no write.

1. `isPremium()` is true
2. A target date exists, read from `strategicGoal.targetDate` first, then top-level `targetDate`, parsed through the shared day-key helper
3. A target description exists in `strategicGoal.targetDescription`, non-empty after trimming
4. The goal class is **not** weight-based
5. `strategicGoal.targetSetAt` — or `setAt` where absent — is **at least 28 days ago**
6. `strategicGoal.weeklySessionTarget` has an agreed value, meaning `setAt` is non-null. **A default of 3 with `setAt: null` is not a target anybody chose** and must never be used as a denominator. This is HOME-1's rule and R1 inherits it absolutely.
7. The target date is **more than 14 days away**
8. The trailing 28-day completion rate is **below 60%** of the agreed weekly target, partials counted
9. No suppression condition holds — see §4
10. `strategicGoal.review.lastOfferedAt` is null or **more than 28 days ago**

---

## 4. Suppression, restated in full

Any one of these blocks the offer. The safety half outweighs the feature.

- Severe pain today, at **7 or above** via `getZoneStatus()`
- Today's check-in resolved to a `careMode: true` opening
- `detectBurnout()` returns `moderate` or `high`
- Today's mood **or** energy is **3 or below**
- The goal class is weight-based

---

## 5. The three options

Unchanged from the revenue architecture in intent. Restated because the surface changed.

All three resolve **inline in My Programme**, without navigating and without a modal.

| Option | Behaviour |
|---|---|
| **Move the date** | Opens a date input inline |
| **Reshape the target** | Opens both fields inline, **pre-filled with the person's existing words**. Blank would imply the old answer was wrong |
| **Leave it where it is** | One tap |

**"Leave it where it is" is a real choice.** Not nagged, not asked again inside the throttle, and never styled as the lesser option. That is a contrast and visual-weight requirement as well as a philosophy one.

All three write an outcome to `strategicGoal.review.outcomes` and set `lastOfferedAt`.

**Why not route to the Today hinge for reshaping:** it depends on local `_eventOpen` state and `programme.hingeOfferedAt`, and it throws the person onto a different screen mid-conversation. Any state that has to be re-established on arrival is somewhere it can fail.

**Known cost, accepted:** two editors writing the same two fields, which is the divergence that caused TARGET-3. Mitigated by both writing only to `strategicGoal.*`, never top level, with the gate asserting it. Converging them is a follow-up item, not something to attempt inside a feature build.

---

## 6. R2 — the boundary correction

### 6.1 What changes

**A dated target can only be recorded on the Plan.** Free keeps goals.

This is not a change to the boundary. `master_schedule.md` v213 already states it — *"free has goals, the Plan has targets"*, and *"the Plan adds a step at the point of upgrade; that is also the cleanest form of R2: the naming moment IS the upgrade, not a demonstration bolted near it."* The live code drifted from it (§1.9).

Graeme's framing, 21 Aug: **it is the act of telling the coach your goal that is the "I want you to do something with this" moment.** The person is welcome to own their goals on paper; the coach will not do anything with that. What the Plan buys is not permission to have a goal — it is the coach holding it.

### 6.2 What explicitly does not change

**Free onboarding is untouched.** `programmes.js` matches on goals and `workoutGenerator.js` uses them for the session rationale, so removing goals from free would degrade it — and it would break the anecdote, because the drop-in coach *does* ask what you want to do. What he does not hold is where you are going and by when.

Only the **dated target** surface moves: the `today.js` hinge and `goal-setup.js`'s weight-target-date editor.

### 6.3 Why this closes the grace-period problem

If a dated target can only be recorded on the Plan, then `targetSetAt` can only start on the Plan. The 28-day guard **is** the grace window, by construction rather than by special case. R1 cannot speak until the coach has held that target for a month.

This is why decision 4 drops `tierChangedAt`.

Against the beta timeline — free for roughly three weeks from early October, then the Plan free until payment in January — a target named on the first Plan day matures in early November, inside the free-Plan stretch. R1 gets six to eight weeks of live exercise before anyone pays. Against a six-week trial, a target named on day one matures at day 28, so R1 can speak in weeks four to six and never as an opening move.

### 6.4 The degradation question, answered

Removing a recording surface that free users currently have is a degradation, and the standing rule is that free is never degraded.

**There are no real users yet.** Decided before October, this costs nobody. Decided after, it is taking something back. That is the whole argument for doing it now.

### 6.5 Data rule

**Nothing deletes a recorded target or `strategicGoal.review.outcomes` on downgrade.** Somebody who moves their date in November and returns to free in January must find it intact if they come back. Nothing currently clears `strategicGoal` on tier change, so this is a "do not break it" assertion for the gate rather than new work.

### 6.6 What is still open

R2's **demonstration** half — what a person sees at the point of upgrade that they could not have seen before, drawn from real data and shown rather than described. Booked as R2-b. Needs a discovery session before a spec, and the revenue architecture's own acceptance criteria for it are written against the pre-correction boundary and will need restating.

---

## 7. Build sequence and touch-once

| Session | Files | Output |
|---|---|---|
| **R1-a** | `Documents/Live State/Schema.md` v1.38 · `js/store.js` v55 · `tools/verify-hard1.mjs` (new) · `js/data/goal-review.js` (new) · `sw.js` v393 | Detection ships dark. No view changes |
| **R2-a** | `js/views/today.js` · `js/views/onboarding/goal-setup.js` · gate · `sw.js` v394 | Target entry gated to the Plan; `targetSetAt` written at both sites |
| **R1-b** | `js/views/my-programme.js` · stylesheet · gate extension · `sw.js` v395 | Target display tier-gated **and** the R1 offer surface — one visit to that file |
| **R2-b** | To be scoped | The demonstration at upgrade |

**`my-programme.js` is touched once, in R1-b, doing both jobs.** That is why the tier-gating of the target display sits in R1-b rather than R2-a despite belonging to R2's decision.

**`targetSetAt`'s writers sit in R2-a, not R1-a**, because R2-a owns the date-write sites. R1-a therefore defines the field and reads it with a `setAt` fallback, and has no writer until R2-a lands. R1-a's gate tests the engine against synthetic state, which it would do regardless.

**Detection lives in `js/data/goal-review.js`, not in the view.** `verify-reentry2.mjs` executes because `programmeEngine.js` is importable without a router. A view full of `innerHTML` can only be asserted as *"did this string appear"*, which is the source-text failure wearing a costume. If detection lives in the view, the gate cannot execute — and executing is the one thing this gate exists to do.

**Known risk, accepted with a tracker:** a detection module with no consumer is an orphan, which is the pattern this codebase keeps producing. `verify-hard1.mjs` is its tracker, and **R1-b must be booked before R1-a closes.** If that is not done, do not split.

---

## 8. What `verify-hard1.mjs` must assert

**It must execute, not grep.** This is the class SWEEP-1 named: 43 of 77 gates are source-text only, and code that is present, correct and unreachable passes every one of them. Five green gates sat on broken behaviour in a single session, and BIAS-3 was fatal on the third line of the function `verify-bias1.mjs` declared healthy.

Every assertion below imports `goal-review.js` and calls it against constructed state.

1. Fires on a clean off-course case: premium, both fields present, 28+ days mature, date 30 days out, rate below 60%
2. Silent on **each** suppression condition independently — pain 7, care opening, burnout moderate, burnout high, mood 3, energy 3, weight goal
3. Silent when `weeklySessionTarget` has `setAt: null`, even where the arithmetic would otherwise trigger
4. Silent when a description is absent but a date is present
5. Silent when the date is 14 days out or nearer
6. Silent when maturity is 27 days; fires at 28
7. Reads a top-level `targetDate` in bare `YYYY-MM-DD` form, and a `strategicGoal.targetDate` in ISO form, to the same result
8. Suppression leaves `lastOfferedAt` untouched
9. Throttle holds at 27 days and releases at 28
10. Free never reaches the offer
11. Downgrade does not clear `review.outcomes`

**Every one of these must have its reversal confirmed to fail.** Break the thing deliberately on a throwaway copy and watch the gate go red. Two of nine reversals were missed on first writing in a prior session, and one assertion passed for the wrong reason.

---

## 9. Logged, not fixed

| Item | Where | Note |
|---|---|---|
| Top-level `targetDescription` has no writer | `goal-setup.js:277`, `:406` | Two reads that are always empty. Own scoped task |
| `detectBurnout()` has no recency guard | `js/data/checkin.js` | Reads the last seven recorded keys, not seven days. Matters for `today.js` and `coach-proposal.js` |
| Pain 7 vs 8 disagreement unresolved | `getZoneStatus()` / `getPainBand()` | Clinical review question. R1 picks 7 for its own purpose only |
| Two target editors after R1-b | `today.js`, `my-programme.js` | Converge as a follow-up, not inside a feature build |
| 14 gates hardcode `/home/claude/repo` | `tools/` | Same fault class as the known jsdom path hardcoding. "75 green on a fresh clone" is true only at that exact path |
| `verify-hard1.mjs` names the revenue architecture as its source of truth | new file | Adds a sixth reference to the mis-dated `18aug2026` filename. Goes on the rename task |

---

*Build New Habits · Alongside: Move · R1 and R2 Amendment · 21 Aug 2026 v2*
