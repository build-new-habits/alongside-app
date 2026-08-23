# Alongside: Move — WEIGHT-1 Build Scope
## 22 Aug 2026 v1

**Status:** 🟠 **Scope for agreement. No code written.** Nothing here is built until Graeme confirms §7.

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
| 4 | `js/data/weight-targets.js` | **NEW**. Constants, `toKg()`, `bandFor()`, `validateWeightTarget()`, `observedRateBreach()` |
| 5 | `js/data/goals.js` | The `flatMap` at `:350` carries `hasTarget` and `targetType` |
| 6 | `js/data/goal-review.js` | v1 → **v2**. `isWeightTarget()` becomes conditional on `ctx.weightTrackingEnabled` |
| 7 | `tools/verify-hard1.mjs` | Extended: weight suppressed when off, **not** suppressed when on |
| 8 | `js/data/workoutGenerator.js` | Remove the dead `validateWeightTarget()`; archive it |
| 9 | `sw.js` | → **v396**, alone, precache `weight-targets.js` |

### WEIGHT-1b — after R1-b

`js/views/settings.js` (toggle, first tier gate) · logging surface · `js/views/my-programme.js` (target surface) · stylesheet · gate extension · `sw.js`

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
9. Reversals for all of the above, each confirmed to fail

Plus in `verify-hard1.mjs`: R1 suppresses a weight target when tracking is **off**, and does **not** suppress when it is **on** — the second is the assertion that proves the toggle is really the consent.

---

## 7. What I need from you before writing code

1. **Storing canonical kg with display conversion** — confirm. It is forced by §1.1, but it is a data decision and it is yours.
2. **Does the toggle need anything at the point of enabling** — a sentence, a confirm step — or is a plain switch right? My instinct is a plain switch with honest helper text, since a confirmation dialogue implies the person is doing something wrong.
3. **Where weight logging lives.** Progress is the trend surface and the natural home; Settings is where the toggle is. I lean **Progress**, with the target itself in My Programme beside the other targets.
4. **The toggle's label and helper text** — coach voice, so yours. It is the moment somebody opts into being measured, and it is the most consequential copy in the feature.
5. **Confirm the split** — 1a dark now, 1b after R1-b.

---

## 8. Still blocking elsewhere

**R2-a** needs the hinge line signed off: naming a date currently *"changes nothing about how I work"*, which becomes untrue after R1-b.

---

*Build New Habits · Alongside: Move · WEIGHT-1 Build Scope · 22 Aug 2026 v1*
