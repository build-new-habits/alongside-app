# Alongside: Move — Session blueprint: TWO-ENGINE
## 06 Sep 2026 v1

Build New Habits | Item 1 of the CLUB build order. Everything else waits on this.

Live at blueprint time: `store.js` **v64**, `Schema.md` **v1.47**, `sw.js` **v451** / cache `alongside-v451`, **115 gates** green, master schedule **v297**.
Blueprint declares `sw.js` **v452** / cache `alongside-v452` and **116 gates**.

---

## 1. The coupling is one import and one call

Ground-truthed on a fresh clone, not assumed:

| | |
|---|---|
| `js/views/coach-proposal.js:401` | `import { workoutGenerator, AVAILABLE_TIME_WINDOW_MINUTES } from '../data/workoutGenerator.js'` |
| `js/views/coach-proposal.js:1418` | `return workoutGenerator.generateDailyOptions();` |

**That is the entire live coupling.** Every other mention of `workoutGenerator` across `js/` is a comment. `AVAILABLE_TIME_WINDOW_MINUTES` is a constant, not engine behaviour, and stays.

🟢 **This is a much smaller rewiring than the two-engine table implies.** The table describes the *consequences* of the split, which are large. The seam itself is one line.

---

## 2. The contracts, measured by driving both engines

```
workoutGenerator.generateDailyOptions()  →  3 objects
  { id, focus, name, icon, duration, exerciseCount, exercises, intensity, rationale, totalCredits }

session-builder.buildSession({sessionType, durationMins, equipmentOverride, preset})  →  1 object
  { id, title, subtitle, duration, coachLine, exercises, rationale }
```

| Field | Mismatch | Resolution |
|---|---|---|
| `name` / `title` | Different key, same meaning | Adapt at the seam |
| `duration` | 🔴 **Number (`33`) vs string range (`"25–35 mins"`)** | See §3 |
| `exerciseCount` | Absent | `exercises.length` |
| `icon`, `intensity`, `focus`, `totalCredits` | Absent | Confirm each is genuinely unused before dropping. **Grep both reader and writer — a read-only grep is not enough to classify a field as dead** |
| `inputs` | 🔴 **Absent from BOTH** | §6 |

**`buildSession` returns one session, not three.** Choosing what to offer is coach logic that does not exist yet. §4.

---

## 3. 🟢 The NaN duration disappears on this route, and the reason is worth keeping

`buildSession` reports duration as an honest range — **`"25–35 mins"`** — measured across all eight types. `workoutGenerator` reports a single number computed by `calculateDuration()`, which is the function that returns NaN on any session containing one of the 99 string-`rest` entries.

**So "NAN MIN" is not fixed by DURATION-STR on this route. It is deleted by the rewiring**, because the good engine never claimed false precision in the first place.

⚠️ **DURATION-STR does NOT close.** Its real damage is `applyDurationCap()` failing both NaN comparisons and returning untrimmed, so a declared available time is silently ignored. That survives everywhere `calculateDuration` is still used. **Item 2 stands.**

🔵 **A range is better for CLUB slot 4 than a number.** *"25–35 mins"* states honest bounds; *"33 min"* is false precision produced by broken arithmetic. **Slot 4 takes the range.**

---

## 4. 🔴 THE ONE DECISION THIS BLUEPRINT CANNOT MAKE

`buildSession` needs a `sessionType`. **What does the coach suggest, and why?** That is coach logic and a product decision.

Recommendation, in priority order, each falling through to the next:

1. **The programme's planned focus**, if a class is running. `programmeEngine` already computes this. The arc should lead when there is one
2. **Otherwise, what the arc says is thin** — the aim's own gap, which is what the arc is for
3. **Otherwise, what has not come up lately**, from `exerciseHistory`
4. **Severe zones are not a tiebreak.** `buildSession` already bypasses to Gentle Care before any pool is built, so this needs no new safety logic — **confirmed by reading `buildSession`'s opening, and to be reversal-proven, not assumed**

**Every input in that chain must be demonstrably used, or the coach line may not imply it.** FAULTLESS.

---

## 5. 🔴 Three options, or one?

CLUB v2 §6.2 specifies **one** suggestion in Personal training. The live screen shows three.

| | Keep three now, reduce in CLUB-SHELL | Go to one now |
|---|---|---|
| Failure localisation | Better — engine swap provable against an unchanged screen | Worse — engine and presentation move together |
| Wasted work | 🔴 **Builds three-option plumbing that CLUB-SHELL deletes** | None |
| Standing rule | Breaches *improvements extend what exists* in spirit — it is work with a known death date | Clean |

🟢 **Recommendation: go to one now**, with the safeguard that **the gate asserts on the returned session object, not on the DOM**, so an engine fault and a presentation fault cannot be confused for each other.

---

## 6. 🔴 The rewiring alone does NOT make the coach truthful

`handlePreviewStart()` writes `inputs: option.inputs || {}`. **Neither engine produces `inputs`**, so the record of what the coach used is empty on this route today and would stay empty after a naive swap.

**FAULTLESS is defined as: every input the coach implies it used, it demonstrably used.** A coach line naming the arc, the check-in and recent history, over an empty `inputs`, is the exact glibness the 1–3 Sep traces caught three times.

🟢 **In scope for this session:** the type-choice chain of §4 writes what it actually consulted into `inputs`, and the gate asserts the coach line names nothing absent from it.

---

## 7. Swaps must be mirrored exactly, not approximated

`triggerBuild()` in `session-builder-ui.js` is the reference implementation:

```
builtSession   = buildSession({ sessionType, durationMins, equipmentOverride, preset })
candidatePools = buildCandidatePools({ sessionType, durationMins, equipmentOverride, preset })
```

**Identical arguments to both calls.** `verify-swap1` asserts the two never disagree; passing different arguments would make that gate green while every swap affordance silently vanished.

⚠️ **Both builders write `store.generatedSession` as a side effect** and can overwrite live state mid-run in gate setup. Known, recorded, and to be handled in fixture ordering.

---

## 8. Files

| File | Change | Rule |
|---|---|---|
| `js/views/coach-proposal.js` | Drop the `workoutGenerator` import; build through `buildSession` + `buildCandidatePools`; adapt fields; write `inputs` | Touch-once |
| `js/session-builder.js` **or** a new small module | The §4 type-choice chain | Decide at build time; a new module if it exceeds ~60 lines |
| `js/data/workoutGenerator.js` | `generateDailyOptions()` **retired, not deleted**, with a zero-live-callers assertion | Retire ≠ delete |
| `tools/verify-twoengine.mjs` | **New, gate 116** | Driven under jsdom |
| `Schema.md` | Only if `inputs` gains declared fields | **Schema before code** |
| `sw.js` | v452, cache `alongside-v452` | **Last and alone** |

---

## 9. Gate: `tools/verify-twoengine.mjs`

0. **Fixture reach** before anything — the Plan tier is actually Plan, and each fixture reaches the branch it names
1. `coach-proposal.js` contains **no live import** of `workoutGenerator`
2. `generateDailyOptions` has **zero live callers** across `js/`
3. Driven: the coach route's session is **produced by `buildSession`** — asserted by a property only the good engine has, not by a name string
4. Driven: **stretch is reachable** as a coach suggestion given inputs that should produce it
5. Driven: `sessionVariety`, `exercisePreferences` and SECTION-RULES are **honoured on this route** — the three the old engine read zero times
6. Driven: `candidatePools` is populated and `buildCandidatePools` received **identical arguments** to `buildSession`
7. Driven: `inputs` is non-empty and the coach line **names nothing absent from it**
8. Driven: a severe zone still bypasses to Gentle Care

**Every assertion reversal-proven. Every fixture must demonstrably reach the branch it names** — nine recorded instances of that failing, plus two more in `verify-homedoors` on 06 Sep.

---

## 10. Order of work

Fresh clone → read `master_schedule.md` → confirm `store.js` v64 → §4 decision → type-choice chain → rewire `coach-proposal` → `inputs` → gate red before green → eight-plus reversals → full 116-gate suite → push application files → **`sw.js` last and alone** → verify from a **second independent fresh clone**.
