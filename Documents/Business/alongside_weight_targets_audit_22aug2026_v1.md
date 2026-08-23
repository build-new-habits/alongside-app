# Alongside: Move — Weight Targets: Audit and Decision
## 22 Aug 2026 v3

**Status:** 🔴 **v1's recommendation was REJECTED by Graeme, 22 Aug, and he was right.** §6 is retained for the record and superseded by **§9**, which is the decision. Still no code changed.

**Question:** does Alongside: Move support weight-based targets?

---

## 1. The short answer

**It already doesn't.** Not by decision — by four independent failures, none of which anybody chose, and no user has ever been able to set one.

Every finding below was confirmed by executing the code, not by reading it.

---

## 2. What a working weight target would need

| Step | Mechanism | State |
|---|---|---|
| 1. Pick "Lose weight" as a goal | `goals.js` → `GOALS` | 🟢 **Works.** Selectable, one of 26 |
| 2. Record current weight | `store.weight` | 🔴 **No writer anywhere** |
| 3. Record a target weight | `store.targetWeight` | 🔴 **No writer anywhere** |
| 4. Record a target date | `goal-setup.js:443` | 🔴 **Was in a view that never loaded.** Retired 22 Aug (CHOOSER-1) |
| 5. Mark the goal as target-bearing | `hasTarget` / `targetType` | 🔴 **Stripped at build time.** See §3 |
| 6. Warn if the pace is unsafe | `validateWeightTarget()` | 🔴 **Called by nothing** |
| 7. Log weight over time | `store.weightLog` | 🔴 **No writer, no reader** |

**Step 1 works and steps 2 through 7 do not.** A person can tell the coach that losing weight matters to them — and the coach does use that to shape sessions, through `engineGoalId: 'weight-loss'`. What cannot happen is a *number* or a *date* attached to it.

---

## 3. The one that is easy to miss

`js/data/goals.js:117–124` declares the weight goal with target metadata:

```
{ id: 'lose-weight', label: 'Lose weight', icon: '⚖️',
  engineGoalId: 'weight-loss', hasTarget: true, targetType: 'weight' }
```

The exported `GOALS` array is rebuilt by a `flatMap` at `:350–360` that copies six named fields — `id`, `label`, `icon`, `engineGoalId`, `name`, `category`. **`hasTarget` and `targetType` are not among them.**

Executed:

```
GOALS.filter(g => g.hasTarget).length      -> 0
GOALS.filter(g => g.targetType).length     -> 0
goalHasTarget('lose-weight')               -> false
getGoalTargetType('lose-weight')           -> null
```

**No goal in the product carries a target type at runtime.** Grep says otherwise — the source text is right there and reads correctly. Only execution shows it.

The comment above that block explains why: it was written for backward compatibility with `js/views/goal-setup.js` — the view retired on 22 Aug because it had never loaded. **The shim outlived the thing it was shimming, and quietly narrowed the data on its way through.**

### What this means for R1

`goal-review.js` tests three independent things: `targetType === "weight"`, `primaryGoal` against `["lose-weight", "weight-loss", "weight_loss"]`, and `targetUnit` against a list of weight units.

**The `targetType` leg is dead**, because nothing supplies a non-null `targetType`. The `primaryGoal` leg is live and catches `lose-weight`, so the exclusion holds.

⚠️ **R1's weight exclusion currently rests on one of its three legs.** It was written belt-and-braces and that is the only reason it works. `verify-hard1.mjs` asserts all three, and passes on all three, because it constructs `targetType` directly rather than sourcing it from `goals.js` — a gate testing the function faithfully while the caller can never supply that input. Worth recording as a gate-design lesson: **a pure function's gate proves the function, not the wiring.**

---

## 4. The safety warning that has never fired

`validateWeightTarget()` in `workoutGenerator.js:521` is a genuine piece of care. It checks whether the implied rate exceeds roughly 1 kg per week and returns a warm, non-judgemental message offering to move the date or keep the goal open-ended.

It is **called by nothing**. Even if it were, it returns `null` on line 531 because `weight` and `targetWeight` have no writers.

It also carries a repair from GOAL-2, which fixed a dead branch reading `goal.targetDate`. **A previous session repaired a function nobody calls** — the audit found the wrong layer, and that is a caution for how this decision is handled: it is possible to fix weight-target code all day without any of it reaching a user.

---

## 5. What is genuinely live

Two things, and neither is a weight target:

- **`weightUnit`** — read at `session-log.js:179` to label the resistance field. Nothing writes it, so it always defaults to `kg`. Cosmetic; a user logging in pounds sees the wrong label. Small, real, unrelated to this decision.
- **`engineGoalId: 'weight-loss'`** — flows into programme matching and session rationale. **This is the part that works**, and it is the directional version: *this matters to me*, shaping what the coach offers, with no number attached.

---

## 6. The recommendation

**Do not restore weight targets. Make their absence deliberate, and say so.**

### Why

**The code has already arrived where the philosophy points.** Every principle in the founding document argues against a number-and-date weight target: no shame mechanics, no comparison, behaviour is communication, variability is information. A target weight is the single most shame-loaded number in fitness culture, and the personas — people navigating hormonal change, chronic conditions, neurodivergence, and anyone failed by mainstream fitness — are exactly the population for whom it does most harm.

**The distinction already built is the right one.** Direction is supported: *losing weight matters to me* shapes the programme. Destination is not: *10 kg by 20 December* cannot be recorded. That is the same line as *"free has goals, the Plan has targets"* — applied to a goal class rather than a tier, and for a stronger reason.

**Restoring it means building seven things**, including a safety validator, an unsafe-pace intervention, weight logging, and a trend surface — each of which needs clinical review. Retiring it means deleting dead fields and writing one honest sentence.

**And R1 makes the decision urgent rather than theoretical.** R1 is the coach saying a date looks unlikely at the current rate. Aimed at a weight target, that is the app telling somebody they are not losing weight fast enough. The current exclusion is correct but rests on one live leg of three, and on `primaryGoal` string matching that a future refactor could quietly break — exactly as the `flatMap` broke `targetType`.

### What retiring looks like

1. Remove `weight`, `targetWeight`, `weightLog` from the schema — or mark them explicitly reserved and unused
2. Remove `hasTarget` / `targetType` from the weight goal in `goals.js`, so source and runtime agree
3. Retire `validateWeightTarget()` to `Documents/Archive/` — it is good writing, and belongs with whatever replaces it if this is ever revisited
4. Keep `lose-weight` as a **selectable goal**. Nobody is told their goal is unwelcome
5. Keep R1's exclusion as defence in depth, and add a gate asserting no goal exposes `targetType: 'weight'`
6. Fix `weightUnit` separately — a live labelling bug, not part of this
7. **Write the position down** — in the founding document and the safety one-pager. *Alongside supports weight as a direction and not as a destination, deliberately.*

### What I am not recommending

Not that weight is unmentionable, that people shouldn't have weight goals, or that this is settled. It is a defensible product position that needs a clinician's name against it before it becomes doctrine.

---

## 7. For the health professional review

Three questions worth adding to the nine-question document:

1. Is it clinically sound for a movement app to support weight as a **direction** but refuse to store a **target weight and date** — or does refusing the number push people to track it somewhere with no safeguards at all?
2. If a target weight were supported, is roughly 1 kg per week the right threshold for an unsafe-pace warning, and is a warm redirect the right response — or does it need something firmer?
3. Given the personas, does the presence of a target-weight field carry risk in itself, independent of what is done with it?

⚠️ **Question 3 is the one that decides this.** If the field is itself a risk, no amount of validation makes it safe, and retiring is not a shortcut but the correct answer.

---

## 8. Audit method

103 modules imported and executed. Every claim above was tested by running code, not by reading it — `hasTarget` in particular reads correctly in source and is false at runtime, and grep alone would have confirmed the opposite of the truth.

**Logged, not fixed:** `weightUnit` has no writer, so `session-log.js:179` always labels the field `kg`. Small, live, and outside this decision.

---

## 9. THE DECISION — 22 Aug 2026. Supersedes §6.

**Weight tracking is a feature, off by default, available on the Plan.**

Graeme: *"someone might want this and to deny them seems wrong."*

### Why v1 was wrong

v1 recommended retiring weight targets and dressed the codebase's accidental state as philosophy. Refusing to let an adult record their own goal is paternalism, and this product already treats self-direction as an accessibility feature rather than a risk. The four failures in §2 were **accidents, not decisions**, and reading them as intent was the error.

### What was decided

| # | Decision |
|---|---|
| 1 | Weight tracking is **off by default**, enabled in Settings |
| 2 | **All** weight recording is Plan-only — dated or undated, behind a locked screen. This removes the free branch entirely |
| 3 | **R1 speaks to weight targets when the option is on.** Turning it on IS the consent — telling the coach is the "I want you to do something with this" moment. A coach that holds the target but will not speak to it is the same paternalism one layer down |
| 4 | 🔴 **NON-NEGOTIABLE: the hard conversation never does arithmetic on the body.** R1 may say the date looks like a harder ask than it needs to be, and offer to move it. It must **never** state a rate, a projected weight, a shortfall, or a number of kilos or pounds. The three options are about the plan. **The body is not scored** |
| 5 | All existing R1 suppression applies unchanged — pain, burnout, care mode, bottom band. They matter more here, not less |
| 6 | `validateWeightTarget()` becomes **live**, checking pace at the moment a target is set. Distinct from R1: set-time intent versus review-time progress. Both are needed |

### The safety bands — TIGHTENED 22 Aug, and sourced

🔴 **The refusal is 3 lb/week, not 4.** Graeme: *"Let's be tough and not generous."*

| Implied rate | Behaviour |
|---|---|
| **≤ 2 lb/week** | Accept silently. **The top of the recommended range, not beyond it** |
| **> 2 to < 3 lb/week** | Accept. One gentle note. No obstruction |
| **≥ 3 lb/week** | 🔴 **Decline to store.** Signpost to a GP or registered dietitian, offer a sustainable date instead |
| **Observed rate** | Logged loss at ≥ 3 lb/week across **three consecutive weeks** → the coach raises it once |

**Sources, now cited in `js/data/weight-targets.js` itself:**

- **NHS / NICE CG189** — 0.5–1 kg (about 1–2 lb) per week, on roughly a 600 kcal daily deficit. So **2 lb/week is the top of the recommended range**, not beyond it.
- **Published trial protocols** (NCT03704064, NCT05635019, NCT03779048) treat loss above **3 lb/week sustained for 3–4 consecutive weeks** as a gallstone risk requiring intervention — weight monitored at every session, participants asked to slow or stop.
- Gallstone risk rises above roughly **1.5 kg (3.3 lb)/week** through changes in bile composition. Above **2 lb/week**, lean tissue and bone loss join fat loss.

**Why 3 and not 4.** 3 lb/week is where a **supervised** programme intervenes. This app supervises nothing — no bloods, no clinician, no weekly review. It refuses at the point a monitored programme would step in, because it has none of the monitoring that makes going further survivable.

🟢 **`CAP_WEEKS` and the 3–4 lb band are gone.** `CAP_WEEKS` was a number nobody could source. One line now governs both directions: **a target implying 3 lb a week is declined; observed loss at 3 lb a week for three weeks is raised.**

### Two further safeguards, added 22 Aug

- 🔴 **The app must NEVER prompt a weigh-in.** Frequent weighing is itself a risk behaviour. Logging is passive and user-initiated only — no reminders, no streaks, no "time to weigh in"
- 🔴 **The ≥ 4 lb refusal declines the FIELD, not the person.** It must never read as rejecting the goal or the person holding it

### Clinical sign-off: dropped, 22 Aug

**A refusal is not a clinical recommendation.** Declining to help is not practising medicine, and every claim not made is one that cannot be wrong — the safer regulatory position as well as the honest one.

Graeme: MyFitnessPal permits effectively unlimited targets behind a 1,200 kcal floor. **Asking permission to be stricter than the market was asking the wrong question**, and it would have delayed a *safety* feature while waiting for approval to be careful. The recommendation to seek sign-off was **over-caution dressed as rigour**.

Citations in published protocols are also better provenance than one clinician's agreement: checkable, and they do not expire.

⚠️ **No individual is named against these bands, deliberately.** A name implies a professional endorsement that was neither formally given nor needed.

🔴 **Still not clinical, and unchanged:** never prompt a weigh-in · no arithmetic on the body at review-time · the refusal declines the field, not the person.

🟢 The refusal copy still signposts outward to *"a GP or a registered dietitian"*. Pointing somebody outward costs nothing, and it is the one place naming a profession is right.

---

*Build New Habits · Alongside: Move · Weight Targets: Audit and Decision · 22 Aug 2026 v3*
