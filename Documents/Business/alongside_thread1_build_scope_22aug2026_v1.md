# Alongside: Move — THREAD-1 Build Scope
## 22 Aug 2026 v1

**Status:** 🟠 **Scope. No code written.** One decision inside it is genuinely risky and is flagged in §5.

**Cause:** R1-b shipped 22 Aug with copy that asks *"Shall we look at it together?"* and a UI that answers with a date input and a Save button.

---

## 1. What is actually wrong

Two things, and the second is worse.

**The mismatch.** Copy promising an interaction the UI does not provide. This is the fault class `verify-plain1` exists to catch — and R1-b was gated on nine things and not on that one.

🔴 **The inconsistency.** The coach speaks in bubbles while getting to know somebody, then hands them a form the moment the conversation turns difficult. **The interaction that most needs to feel like a person is the one built most like an admin screen.** That is backwards, and no amount of copy fixes it.

The cheap repair is to soften the copy to match the form. That is the wrong repair: it would resolve the contradiction by making the product smaller.

---

## 2. Ground truth, 22 Aug

| | |
|---|---|
| `js/views/onboarding/thread.js` | **1,395 lines**, v12 |
| `js/data/onboarding-thread-data.js` | `STEPS` as data — script already separated |
| Timing | 11 constants in `T`, each collapsing to `0` under `prefers-reduced-motion` |
| A11y | `aria-live="polite"` on the scroll area |

🟢 **The good news: the script/render split already exists.** `STEPS` is data and `thread.js` renders it. The pattern is proven and does not need inventing.

🔴 **The bad news: `thread.js` is not a component.** It imports onboarding data, `sheet-manager`, `beat3-scripts`, and writes `consent.given`, `consent.policyVersion`, `name`, `onboarding.*` and `strategicGoal.setAt` directly — at least a dozen hardcoded store writes inside the renderer.

---

## 3. Shape

**`js/views/thread-runner.js`** — bubbles, typing indicator, chips, inline input, reduced-motion, scroll and focus management. Takes a **script** and a **write handler** as arguments and knows nothing about any particular flow.

Consumers supply the script. `onboarding-thread-data.js` is the model.

---

## 4. The R1 conversation: entered, never embedded

🔴 **My Programme keeps a quiet invitation. Tapping it opens the thread.**

A typing indicator starting while somebody is mid-scroll on a browsable screen is an ambush, and **this is the one conversation in the product that must never ambush.** The person opts in, then the coach speaks.

**Short — three or four beats, not twelve.** Threads are right for onboarding partly *because* onboarding happens once. Somebody moving a date by a fortnight does not want a conversation about it every time. The three options become branches of the thread rather than three buttons on a card.

**Unchanged and non-negotiable:** no arithmetic on the person; "leave it where it is" is a real answer with equal weight; suppression never consumes the throttle; every branch writes to `strategicGoal.*` only.

---

## 5. 🔴 THE RISKY DECISION — one renderer, or two for a while?

Extracting a runner and leaving `thread.js` alone means **two renderers for the coach's voice**. That is not merely a maintenance cost: it is how a product ends up with the coach sounding subtly different in different places, which is a philosophy problem.

But migrating onboarding means editing the flow that captures **legal consent**, weeks before beta, in a 1,395-line file.

**Recommendation — split, and accept the duplication briefly with a tracker:**

| | | |
|---|---|---|
| **THREAD-1a** | Extract the runner. **R1 consumes it. `thread.js` untouched.** | Before beta |
| **THREAD-1b** | Migrate onboarding onto the runner. Delete the second renderer | **After beta** |

**Why this way round.** Onboarding is the funnel and it captures consent; breaking it before beta is the one unrecoverable mistake available here. R1's thread is new, so a fault in it costs a feature, not a launch.

⚠️ **The duplication must be tracked, not tolerated.** A gate asserts the two renderers agree on what matters — the eleven timing constants, reduced-motion collapsing every one to zero, `aria-live="polite"`, and coach-left/user-right bubble semantics. **If they drift, it goes red.** Duplication that nothing watches is exactly what produced `goal-setup.js`.

---

## 6. Files

### THREAD-1a
`js/views/thread-runner.js` **NEW** · `js/data/goal-review-script.js` **NEW** (the R1 script as data) · `js/views/goal-review-thread.js` **NEW** · `js/views/my-programme.js` v6 → **v7** (card becomes an invitation) · `router.js` · `css/layouts/thread-shared.css` **NEW** · `tools/verify-thread1.mjs` **NEW** · `tools/verify-hard1b.mjs` extended · `sw.js`

### THREAD-1b — after beta
`js/views/onboarding/thread.js` migrated · second renderer deleted · divergence gate retired

---

## 7. What the gates must assert

**Executing, mounted against jsdom, reading the DOM** — same standard as `verify-hard1b.mjs`.

1. The runner renders a supplied script without knowing anything about it — a synthetic three-step script drives it
2. Coach bubbles left, user bubbles right, in order
3. `prefers-reduced-motion` collapses **all eleven** timings to zero
4. The scroll area carries `aria-live="polite"`; focus moves to the input when one appears
5. The R1 script offers all three branches, each writes the right outcome, `strategicGoal.*` only, never the legacy top-level pair
6. **No arithmetic on the person** in any bubble in any branch — carried over from `verify-hard1b`
7. The invitation on My Programme does **not** auto-open, and free never sees it
8. **Divergence:** the runner and `thread.js` agree on timings, reduced-motion, aria-live and bubble semantics
9. Reversals for all of the above

---

## 8. What I am not proposing

**Not** that goal-setting becomes a conversation everywhere. That was raised as a possibility and it deserves its own look — a recurring interaction wanting six bubbles every time is friction, not warmth. Booked as **THREAD-2**, undecided.

---

## 9. Cost, plainly

R1-b's render half gets rewritten. `verify-hard1b.mjs` largely survives, because it asserts behaviour rather than markup — which is the return on having written it that way.

The extraction is the real work and it is not small. **If it does not fit before beta, the honest fallback is to soften R1's copy to match the form and ship the thread after** — a worse product, but an intact schedule. That call is Graeme's and it should be made deliberately rather than discovered in September.

---

*Build New Habits · Alongside: Move · THREAD-1 Build Scope · 22 Aug 2026 v1*
