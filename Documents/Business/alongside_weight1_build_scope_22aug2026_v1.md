# Alongside: Move — WEIGHT-1 Build Scope
## 22 Aug 2026 v3

**Status:** 🟢 **All five points CONFIRMED by Graeme, 22 Aug. WEIGHT-1a is cleared to build.** v3 records the confirmations, one correction, and one change Graeme made that improves the design. Copy for 1b remains his.

**Authority:** `alongside_weight_targets_audit_22aug2026_v1.md` v2 §9 holds the decisions. This document holds the build.

---

## 1. Ground truth established 22 Aug

Confirmed by opening the files, at commit `72bb42d`.

### 1.1 No unit conversion exists anywhere in the codebase

Searched `2.2046`, `0.4536`, `lbToKg`, `kgToLb`, `toKg`. **Nothing.** `weightUnit` defaults to `'kg'` and has no writer, so `session-log.js:179` labels every resistance field `kg` regardless.

🔴 **This makes UNIT-1 inseparable from WEIGHT-1.** The agreed safety bands are stated in **pounds**; the store's default unit is **kilograms**. Shipping a band check without a canonical unit means a threshold that silently means different things to different people — and the ≥4 lb refusal is the one place in this product where being wrong by a factor of 2.2 is unacceptable.

**Consequence:** all weights are stored in **kg**, canonical, always. Display converts. Bands are computed in kg from constants derived once from the agreed pound figures. UNIT-1 folds in here and closes.

### 1.2 `settings.js` has no tier gate at all

It does not import `isPremium` or `lockedFeature` — the two matches are comments. **WEIGHT-1 introduces the first tier gate in Settings**, which is a precedent, not just a line. `library.js:144` and `my-programme.js:99` are the pattern to copy.

### 1.3 The toggle pattern already exists and should not be forked

`hormonalTracking` (`settings.js:727–742`) is the exact analogue: `role="switch"`, `aria-checked`, `data-toggle="<storeField>"`, handled generically at `:1983–1992`. The handler writes on click and re-renders the panel for one named field (`checkInNotification.enabled`).

**Reuse it.** Weight tracking adds one branch to that re-render condition so enabling reveals the fields beneath. No new handler.

### 1.4 The `goals.js` flatMap fix is safe

`GOALS` (flat) is consumed by `settings.js`, `today.js`, `progress.js`, `coach-proposal.js`, `session-rationale.js` and `onboarding/goals.js`. Every one reads `id`, `label`, `name` or `category`. **None reads `hasTarget` or `targetType`**, so adding the two fields to the `flatMap` at `:350` cannot change existing behaviour. `workoutGenerator.js:368` uses its own hardcoded `WEIGHT_LOSS_GOALS` set and is untouched.

### 1.5 `validateWeightTarget()` should be rewritten, not moved

It lives in `workoutGenerator.js:521`, is called by nothing, and returns `null` unconditionally because its inputs have no writers. Moving it means touching `workoutGenerator.js` — a large, live file — to relocate dead code.

**Cleaner:** implement fresh in a new pure module, retire the original to `Documents/Archive/`. Its copy is good and should be reused; its wiring should not.

### 1.6 `my-programme.js` is spoken for

R1-b owns that file's single visit. WEIGHT-1's target surface belongs beside the other targets, which are there. **So WEIGHT-1 splits**, and its surface half lands after R1-b.

---

## 2. Shape: WEIGHT-1a dark, WEIGHT-1b surfaces

| | Contents | Depends on |
|---|---|---|
| **WEIGHT-1a** | Constants, banding, validator, unit conversion, schema, `goals.js` fix, R1 conditionality, gates. **No views.** | Nothing |
| **WEIGHT-1b** | Settings toggle, logging surface, target surface | R1-b landed |

WEIGHT-1a can start immediately. **Nothing reaches a user until 1b**, which is the honest reading of *"ship nothing before the clinical reply"* — 1a is inert by construction.

---

## 3. The constants block

New `js/data/weight-targets.js`, pure, zero imports — same reasoning as `goal-review.js`: the gate must execute, and a threshold that only a source-text gate guards is not guarded.

```
// ── PROVISIONAL. Awaiting clinical sign-off. ──
// Changing these numbers must not require touching logic or gates.
// Every gate references these constants; NO GATE HARDCODES A NUMBER.
// Stated in kg, derived once from the agreed pound figures.
RATE_SILENT_MAX   0.91   //  2 lb/wk — top of NHS guidance, accept silently
RATE_NOTE_MAX     1.36   //  3 lb/wk — accept, one gentle note
RATE_CAP_MAX      1.81   //  4 lb/wk — accept only if duration <= CAP_WEEKS
CAP_WEEKS         3      //  weeks a 3-4 lb/wk target may run
OBSERVED_WEEKS    3      //  consecutive weeks at >= RATE_NOTE_MAX before the coach speaks
```

```
// ── NOT PROVISIONAL. Product philosophy, not clinical calibration. ──
// These do not move even if the clinician has no view on them.
//   1. The app NEVER prompts a weigh-in.
//   2. The hard conversation NEVER does arithmetic on the body.
//   3. The >= 4 lb refusal declines the FIELD, not the person.
```

⚠️ **The two blocks are separated deliberately.** A future session tuning numbers must not read the three rules as tunable. This is the single most important line in the file.

---

## 4. Files, in order

### WEIGHT-1a

| # | File | Change |
|---|---|---|
| 1 | `Documents/Live State/Schema.md` | → **v1.39** |
| 2 | `js/store.js` | v55 → **v56**. `weightTracking` (bool, default false), `weightUnit` gains a writer, `weightLog` documented, `strategicGoal.weightTargetBand` |
| 3 | `tools/verify-weight1.mjs` | **NEW**, red first |
| 4 | `js/data/weight-targets.js` | **NEW**. Constants, `toKg()`, `fromKg()`, `formatWeight()` (kg / lb / st+lb), `bandFor()`, `validateWeightTarget()`, `suggestSustainableDate()`, `observedRateBreach()` |
| 5 | `js/data/goals.js` | The `flatMap` at `:350` carries `hasTarget` and `targetType` |
| 6 | `js/data/goal-review.js` | v1 → **v2**. `isWeightTarget()` becomes conditional on `ctx.weightTrackingEnabled` |
| 7 | `tools/verify-hard1.mjs` | Extended: weight suppressed when off, **not** suppressed when on |
| 8 | `js/data/workoutGenerator.js` | Remove the dead `validateWeightTarget()`; archive it |
| 9 | `sw.js` | → **v396**, alone, precache `weight-targets.js` |

### WEIGHT-1b — after R1-b

`js/views/settings.js` (toggle, first tier gate, **display-unit picker**) · `js/views/progress.js` (log surface) · `js/views/my-programme.js` (target surface, **composite st+lb input**) · stylesheet · gate extension · `sw.js`

---

## 5. `strategicGoal.weightTargetBand`

Written once at set-time, recording which band accepted the target: `silent` | `note` | `capped`.

**Why it is worth a field.** If a threshold ever tightens, this is the difference between a clean audit — *these targets were accepted under the old band* — and re-deriving intent from dates and arithmetic months later. Cheap now, impossible retrospectively.

---

## 6. What `verify-weight1.mjs` must assert

Every assertion imports the module and calls it. **No assertion hardcodes a threshold** — all reference the exported constants, so one clinical email changes six numbers and no gate turns red for the wrong reason.

1. Each band returns the right verdict at its boundary, and one step either side
2. `≥ RATE_CAP_MAX` returns **refuse**, and refuse is the only verdict that declines to store
3. A 3–4 lb/wk target is accepted at `CAP_WEEKS` and refused beyond it
4. `observedRateBreach()` fires at `OBSERVED_WEEKS` consecutive weeks and not at `OBSERVED_WEEKS - 1`
5. **Unit safety:** the same target expressed in lb and in kg yields the identical band — the §1.1 fault made impossible
6. Bands are computed from kg regardless of the user's display unit
7. `weightTracking` false ⇒ no band is ever computed
8. **Copy assertions:** no refusal string contains a projected weight, a rate, or a shortfall figure; no string in the module prompts a weigh-in
9. **Round-trip:** `fromKg(toKg(x, unit), unit)` returns `x` for `kg`, `lb` and `st+lb` across a realistic range, so no display unit loses data
10. **`st+lb` formatting:** pounds wrap at 14, never renders `13 st 14 lb`, and a whole-stone value renders without a stray `0 lb`
11. `suggestSustainableDate()` returns a date at or under `RATE_SILENT_MAX`, and **never returns a weight or a rate**
12. Reversals for all of the above, each confirmed to fail

Plus in `verify-hard1.mjs`: R1 suppresses a weight target when tracking is **off**, and does **not** suppress when it is **on** — the second is the assertion that proves the toggle is really the consent.

---

## 7. The five open points — recommendations, 22 Aug

🟠 **All five are proposals awaiting confirmation.** None is a decision yet.

### 7.1 Canonical kg, display converts — 🟢 CONFIRMED, after a correction

⚠️ **v2 explained this badly and Graeme read it as forcing users into kilograms.** It does not. **Canonical kg is a STORAGE decision. Display is unchanged and unconstrained.**

Somebody who works in stone and pounds enters and sees **12 st 4 lb**; the value in the store is kg. The same arrangement as storing dates in ISO and showing "Thursday". **Nobody is asked to think in kilograms.**

🔴 **New scope Graeme surfaced: stone-and-pounds is a COMPOSITE display.** It needs a genuine two-part input and formatter — `st` + `lb`, with the pounds part wrapping at 14 — not one number with a unit label beside it. Three display units, not two: `kg`, `lb`, `st+lb`. This is real UI work and it belongs in **1b**; the conversion and formatting functions belong in **1a** with the rest of the pure logic, and are gated there.

🟢 **Also confirmed:** an implied rate of 4 lb/week or more is **not advisable and belongs with clinical support, not this app.**

Forced by §1.1. Store one unit, convert at the edge. `weightUnit` becomes a display preference with a real writer, and every band, every comparison and every stored value is kg.

**The alternative — storing whatever the person typed alongside a unit flag — means every consumer must convert correctly, forever.** One that forgets compares 80 against 176 and the ≥4 lb refusal silently stops working. A single canonical unit makes that class of fault impossible rather than merely unlikely.

### 7.2 A plain switch, no confirmation step — 🟢 CONFIRMED

A confirmation dialogue would be the app implying the person is about to do something questionable. That is shame wearing a safety costume, and it contradicts the reason this feature was reinstated: refusing an adult their own goal is paternalism.

**The honesty belongs in the helper text, not in a barrier.** Say plainly what turning it on does, then get out of the way. The real safeguards — the bands, the refusal, never prompting a weigh-in — sit deeper and do not require the person to click through a warning to reach their own data.

### 7.3 Logging in Progress, target in My Programme — 🟢 DECIDED. **This should not have been asked.**

Graeme: *"What do you need me for here?"* — correct. Placement follows from distinctions already in the product, and the passive entry point follows from the never-prompt rule already agreed. **Asking cost him a decision he had effectively already made.**

⚠️ **Worth noticing as a pattern:** a question that only restates existing principles is not a decision point, it is a summary. Decisions to escalate are the ones where the principles genuinely conflict or run out.

- **The target** goes in My Programme, beside the other targets. It is a target; it belongs where targets live, and R1 reads it from there.
- **The log** goes in Progress. It is a trend, and Progress is the trend surface.
- **Settings holds the toggle only** — the switch, not the data.

This follows the existing distinction rather than inventing one: My Programme is *what you are aiming at*, Progress is *what has happened*. Putting the log in Settings would file a person's own record under configuration.

⚠️ **Entry point must be passive.** A control that is there when looked for, never a card that appears asking to be filled in. No badge, no empty state that reads as an unfinished task.

### 7.4 Toggle copy — 🟢 AGREED AS DRAFTED

**Label:** Weight tracking

**Helper text:**

> Off unless you want it. Turn it on to record your weight and set a target, and I'll take it into account. I'll never ask you to weigh yourself.

**Why each line is there.** *"Off unless you want it"* states the default as a stance, not a setting. *"I'll take it into account"* is the honest consequence — this is the toggle that lets R1 speak, and saying so is what makes it consent. *"I'll never ask you to weigh yourself"* turns an internal rule into a promise made to the person, which is the strongest form it can take and the hardest to quietly drop later.

**What it deliberately avoids:** any suggestion that tracking helps, works, or is recommended. The app is opening a door, not encouraging anyone through it.

### 7.5 The 1a / 1b split — 🟢 CONFIRMED (delegated: *"do what you think is best"*)

1a is inert by construction, so *"ship nothing before the clinical reply"* is satisfied by the shape of the work rather than by remembering not to deploy. 1b needs R1-b landed because `my-programme.js` gets one visit.

---

## 7A. The ≥ 4 lb response — Graeme's change, and the rule it clarified

🟢 **Graeme improved the draft.** A flat decline leaves somebody stuck. The coach should **offer a recalculated date at a sustainable pace** — same target, longer horizon.

> That's faster than I can plan for safely — not a judgement on where you want to get to, but at that pace I'd be guessing, and it's a conversation for a GP or a registered dietitian.
>
> If it helps, I could aim for the same target around **[date]** instead, at a pace I can support. Or leave it open-ended, and we just get moving.

### 🔴 The rule this clarified, which a future session could get backwards

**Recalculating a date IS arithmetic.** The non-negotiable says the hard conversation never does arithmetic on the body. Those appear to collide. They do not, and the distinction must be written down:

| | | |
|---|---|---|
| **Set-time** | Planning | **May** compute and propose a date. The person is deciding what to aim at and needs to know what is feasible |
| **Review-time (R1)** | Judgement | **May never** state a rate, a projection, a shortfall, or a weight. A number here is a verdict on the person |

**The rule protects the conversation where a number becomes a verdict, not the one where it is a plan.**

Set-time must still **offer**, never impose — the person may decline the suggested date and keep their own, subject to the bands. And it proposes a **date**, never a weight trajectory.

---

## 8. Still blocking elsewhere

**R2-a** needs the hinge line signed off: naming a date currently *"changes nothing about how I work"*, which becomes untrue after R1-b.

---

*Build New Habits · Alongside: Move · WEIGHT-1 Build Scope · 22 Aug 2026 v3*
