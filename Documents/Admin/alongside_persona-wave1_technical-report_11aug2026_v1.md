# Alongside: Move — Persona Tracing Wave 1: Technical Report
## 11 Aug 2026 v1

Build New Habits | Punch list for a build chat. Every claim below is backed by a file/line reference or a specific executed trace. **Confirmed via code trace** and **Needs on-device confirmation** are marked separately on every finding — they are not blurred.

---

## 0. Method and its limits

Repo cloned public at `https://github.com/build-new-habits/alongside-app.git` (no token needed, read-only session). `Documents/Admin/master_schedule.md` read at **v146, 11 Aug 2026** — ahead of the project-knowledge snapshot at v141. Repo wins per standing rule. `js/store.js` confirmed live at **09 Aug 2026 v18**, matching expectation; no reconciliation required.

Simulation harness: `js/store.js` loaded standalone under Node with a `localStorage` stub (`init()` reads `localStorage.getItem('alongside_user')` at `js/store.js:183` and calls `mergeWithDefaults()` — no other DOM dependency). Persona state was constructed to match **what live onboarding actually writes**, established by reading `js/views/onboarding/thread.js`'s `_writeAnswer()` (lines 1032–1040) against the `storeField` declarations in `js/data/onboarding-thread-data.js` — not from the specs.

**What this method cannot tell you:** rendered layout, real contrast against a real screen, scroll behaviour, timer accuracy, Wake Lock behaviour, or anything requiring a paint. Every finding tagged *Needs on-device confirmation* is tagged that way for one of those reasons.

**One correction to the brief itself:** Section 6 refers to "all five focus types" in the Gym Session Builder. `js/session-builder.js:87` `SESSION_TYPES` exports **seven**: `glute, upper, lower, full, core, cardio, mobility`. The brief's figure is stale.

---

## 1. 🔴 CRITICAL — Day-one check-in contradicts the user's onboarding disclosure

**Severity: Critical.** Not a cosmetic mismatch — the coach states the opposite of what the user just told it, at the single highest-stakes moment in the product.

**Status: Confirmed via code trace, executed.**

**Surfaced by:** Persona A (2.12), first check-in. Affects **every user who has ever completed onboarding.**

### Evidence

`js/data/checkin-openings.js`, `_resolveDayOne()` (approx. lines 304–330) maps `onboarding.primaryTerritory` to a `trigger`:

```
'pain' | 'injury'            -> movement-pain
'social' | 'self-conscious'  -> self-consciousness
'motivation' | 'consistency' -> motivation
'time' | 'energy'            -> time-energy
'knowledge' | 'direction'    -> not-knowing
'belonging' | 'judgement'    -> judged
'history' | 'past-attempts'  -> past-failure
```

The territory IDs actually written are in `js/data/onboarding-thread-data.js:53–61`, `HARD_BEFORE_CHIPS`:

```
trust-rupture, escalation-trap, life-interruption,
wrong-fit, invisible-person, body-story, the-history
```

**Zero overlap between the two vocabularies.**

Executed against the live module, all seven real IDs:

| `primaryTerritory` | Opening actually served |
|---|---|
| `trust-rupture` | "This is the first real one." |
| `escalation-trap` | "This is the first real one." |
| `life-interruption` | "This is the first real one." |
| `wrong-fit` | "This is the first real one." |
| `invisible-person` | "This is the first real one." |
| `body-story` | "This is the first real one." |
| `the-history` | "This is the first real one." |

Full served text is the `generic` row at `checkin-openings.js:234`:
> b1: "This is the first real one."
> b2: "No history yet — just you, now. How are you today?"

Persona A selects **`the-history`** — "There's a longer history than any of that." The coach's next substantive line to him is *"No history yet."*

The `past-failure` row (`checkin-openings.js:227`) — *"Do you remember telling me that you've tried to build this before and it hasn't stuck?"* — was written for exactly this person and is unreachable.

### Collateral in the same function

Same file, the `ageBand` branch tests `['45-54','55-64','65+']`. Live values from `AGE_CHIPS` (`onboarding-thread-data.js:83–91`) are `under-20, 20s, 30s, 40s, 50s, 60s, 70plus`. Executed: `40s`, `50s`, `60s`, `70plus` all return `generic`. The `hormonal-change` opening (`checkin-openings.js:232`, `careMode: true`) can never fire.

### What is NOT broken

Traced and confirmed still reachable: the `conditions.length > 0` branch (`chronic-condition`), `lifestyle.returningAfter` (`injury-recovery`), `lifestyle.exerciseHistory` (`return-to-fitness`), `goals.includes('feel-good')`. Damage is confined to the territory and age branches. `js/data/beat3-scripts.js` uses the correct IDs (`beat3-scripts.js:40` `"trust-rupture"`) — onboarding itself is fine. The break is only at the handover into check-in.

### Fix shape

Remap the `_resolveDayOne()` territory branch to the seven live IDs, and the age branch to the seven live bands. Content decision required, not code-only: seven live territories vs. the existing DAY_ONE rows means some mapping is a judgement call (`the-history` → `past-failure` is obvious; `escalation-trap` and `invisible-person` may want their own rows). **Do not ship a code-only guess here.**

---

## 2. 🔴 CRITICAL — `fitnessLevel` has no live writer; every user is treated as "moderate"

**Severity: Critical.** Silently mis-scopes exercise difficulty for every user in both directions.

**Status: Confirmed via code trace, executed and quantified.**

**Surfaced by:** Both personas, from opposite directions.

### Evidence

Writers of `fitnessLevel`, exhaustive:
- `js/views/onboarding/lifestyle.js:268` — `store.set('fitnessLevel', selections.activityLevel)`
- `js/views/settings.js:978` — manual change only

`onboarding/lifestyle.js` is on route `onboarding/lifestyle`, **removed from `VIEW_NAMES` in `js/router.js` v7** (see the v7 changelog note at `router.js:75–78`: "Removed retired onboarding routes… lifestyle"). It is unreachable.

`js/views/onboarding/thread.js` writes via `_writeAnswer()` using `step.storeField`. The complete storeField list (`onboarding-thread-data.js`) is: `name`, `onboarding.hardBeforeSelections`, `onboarding.primaryTerritory`, `ageBand`, `goals`, `conditions`, `lifestyle.activityLevel`, `lifestyle.stressLevel`, `equipment`, `strategicGoal.weeklySessionTarget`, `activeProgramme`. **`fitnessLevel` is absent.**

Step 9 (`onboarding-thread-data.js:338–351`) *does* ask the question — *"How active have you been lately? And I mean actually…"* — and writes the answer to `lifestyle.activityLevel`. Nothing mirrors it to `fitnessLevel`.

`js/data/workoutGenerator.js:594`:
```js
fitnessLevel: store.get("fitnessLevel") || "moderate"
```

Executed: `fitnessLevel` is `null` for both personas after realistic onboarding. Every user resolves to `"moderate"`.

### Downstream — this resolves workoutGenerator v1.8's open question

The v1.8 header note (`workoutGenerator.js:137–150`) says: *"Not confirmed whether `getSuitableExercises()` in `exercises.js` actually uses `profile.fitnessLevel` downstream."*

**It does.** `js/data/exercises.js:272–273` calls `filterByFitnessLevel(pool, userProfile.fitnessLevel)`. Ceilings at `exercises.js:173–183`:

```
sedentary: 5, light: 7, moderate: 8, active: 10, very-active: 10
```

Measured against the real 461-exercise database:

| Persona | Answered at Step 9 | Live pool | Intended pool | Effect |
|---|---|---|---|---|
| A (Tom) | "Mostly sitting" (`sedentary`) | **329** | 253 | 76 exercises above his ceiling are served to him |
| B (Priya) | "Regularly training" (`active`) | **350** | 359 | 9 hardest exercises silently withheld |

v1.8 fixed the reader and never checked the writer — the exact failure mode already logged on the master schedule as recurring ("both reader and writer must be confirmed").

### Additional gap in the same function

`ACTIVITY_CHIPS` (`onboarding-thread-data.js:94–100`) includes a fifth option, **`returning`** ("Coming back after a break"). `filterByFitnessLevel`'s `ceilings` object has no `returning` key. Once the writer is fixed, `returning` will hit `?? ceilings["moderate"]` and silently behave as moderate. Needs an explicit ceiling decision — arguably it should be the *lowest*, given who selects it.

### Fix shape

Schema-first per standing rule. Either add `fitnessLevel` as a second write in `thread.js`'s Step 9 handling, or change `workoutGenerator.js:594` to read `lifestyle.activityLevel` with `fitnessLevel` as an override fallback. Recommend the latter — one field, one source of truth, and it keeps the Settings override working. Add the `returning` ceiling in the same change.

---

## 3. 🟠 HIGH — Progress under-reports minutes for most session types

**Status: Confirmed via code trace, executed.**

**Surfaced by:** Persona A, Progress screen at week 3.

`js/views/progress.js:138` and `:447`:
```js
const totalMins = recent.reduce((acc, e) => acc + (e.durationMins || 0), 0);
```

Writers that never supply `durationMins`:

| File | Line | Behaviour |
|---|---|---|
| `js/views/workout.js` | 507, 553 | writes `durationMins: null` explicitly |
| `js/views/core-session.js` | 811–819 | field omitted entirely on completion |
| `js/views/yoga-session.js` | 766–773 | field omitted on completion (present as `null` on partial, line 873) |
| `js/views/morning-session.js` | 178, 214 | writes `duration`, not `durationMins` |
| `js/views/quiet-session.js` | 931 | writes `duration: null` |

Writers that do supply it correctly: `gym-programme.js:833`, `walk/run/swim/cycle-session.js`, `breathing-session.js:248`, `session-builder-ui.js:638`.

Executed for Persona A's 21 days: 4 sessions logged, **1** carries a numeric `durationMins`. Three of four contribute zero minutes to every Progress total. `workout` — the type the coach proposal generates by default — is the worst affected.

**Needs on-device confirmation:** whether the Progress screen renders "0 minutes" literally or suppresses the row when zero. Code path suggests it renders the number.

---

## 4. 🟠 HIGH — No performance/lift capture exists anywhere

**Status: Confirmed via code trace (exhaustive search).**

**Surfaced by:** Persona B (2.15) — this is the answer to her matrix open question.

Searched across all of `js/`: no `personalBest`, no `oneRepMax`, no `weightLifted`, no `setsCompleted`. No `type="number"` or `inputmode="numeric"` in any session view.

`gym-programme.js:610` **displays** prescribed `sets × reps`:
```js
<span class="reps-value">${exercise.sets || 3} × ${_esc(exercise.reps)}</span>
```
It never captures what was actually lifted. No weight field exists at any point in any session flow.

Persona-matrix Section 4 decision 2 ("basic PB logging becomes a Personal-tier feature independent of the weekly programme builder") is **specified, not built.** Same "specified but never built" pattern already logged for empathy transfer and `exerciseFeedback`.

**Consequence for the tier proposition:** everything Personal actually unlocks (see §7) is orthogonal to progressive overload. Persona B upgrades and gets nothing that addresses why she came.

---

## 5. 🟡 MEDIUM — `store.logSession()` is dead code; `progressLog` is never shown

**Status: Confirmed via code trace (exhaustive search).**

`js/store.js:966` defines `logSession()`. **Zero callers** across `js/`.

`progressLog` is instead written by `js/data/programmeEngine.js:92` and `:112`, and read by `programmeEngine.js:125`, `:232`, and `gym-programme.js:288`.

`js/views/progress.js` never reads `progressLog` at all — it reads only `activityLog`. So the richer per-session record (`week`, `phase`, `focus`, `energyAtCheckin`, `durationMinutes`, `exerciseCount`, `milestoneAchieved`) exists and is displayed nowhere outside `gym-programme.js`'s end-of-session observation.

Note the field-name split: `logSession()` writes `durationMinutes`; `logActivity()` writes `durationMins`. `gym-programme.js:820` and `:833` write **both**, to different logs, in the same completion handler.

**Recommend:** retire `store.logSession()` (dead, confirmed) in a cleanup pass, or wire `progressLog` into Progress. Not both. Decision needed before code.

---

## 6. 🟡 MEDIUM — Four views bypass `store.logActivity()`, losing dedupe protection

**Status: Confirmed via code trace.**

`store.logActivity()` (`js/store.js:1021`) is documented as *"the single shared write path for activityLog"* with a 10-second dedupe guard. Four views write directly instead:

| File | Line |
|---|---|
| `js/views/morning-session.js` | 189, 226 |
| `js/views/breathing-session.js` | 253 |
| `js/views/quiet-session.js` | 934, 971 |
| `js/views/activity-log.js` | 221 |

`morning-session.js:200–203` documents this as deliberate ("this file predates the shared function and was not migrated to it here, to avoid mixing field naming conventions within a single file") — but the consequence is that the duplicate-write bug fixed in B3-3 remains possible in all four, and the field-naming divergence in §3 is the direct result.

`morning-session.js:175` also writes `date` as `"YYYY-MM-DD"` rather than ISO, and supplies no `completedAt`. Traced: `today.js:239` (`e.completedAt || e.loggedAt || e.date`) and `progress.js:133` both tolerate this. No live break — but it's one string-format change away from one.

---

## 7. 🟡 MEDIUM — Three different visual treatments for "locked", one of which is a dead end

**Status: Confirmed via code trace. Needs on-device confirmation for the contrast question.**

**Surfaced by:** Persona B, days 1–11 on free tier.

| Treatment | Where | Opacity | Tappable → `/upgrade`? | Keyboard reachable? |
|---|---|---|---|---|
| `lockedFeature()` + `tier-gating.css` | `auth.js:95`, `noticing.js:285` | 0.55 | ✅ yes | ✅ `tabindex="0"` |
| `progress.js` export lock | `progress.js:247–259` | — | ✅ yes (`data-route="upgrade"`) | ✅ `tabindex="0"` |
| Session-builder tiles | `session-builder-ui.js:230–252` | inline `0.45` | ❌ **no — `disabled`** | ❌ **no** |

`css/components/tier-gating.css` was built 03 Aug specifically for this purpose and is used by exactly one feature.

The session-builder treatment is the problem. Locked type tiles carry `aria-label="${t.label} -- Personal tier"` (line 235) but are rendered `disabled` (line 243), which removes them from the tab order entirely. A keyboard or screen-reader user cannot reach the label that explains why the option is unavailable. The fallback is a single line of `text-xs text-muted` at line 256 — *"All session types are available on the Personal plan."*

It is also a conversion dead end: in Wellbeing, the same concept taps through to `/upgrade`; here, tapping does nothing at all.

**Accessibility:** `opacity: 0.45` on `text-secondary` over `--color-surface` is very likely below 4.5:1. Disabled controls are technically exempt from WCAG 2.2 SC 1.4.3, so this is not a strict failure — but it is inconsistent with the 0.55 the design system chose, and the information-parity gap above is the real issue. **Needs on-device confirmation for the measured ratio.**

**Recommend:** replace the inline treatment with `lockedFeature()`. It already exists, already handles focus, keyboard, reduced-motion, and tap-through.

---

## 8. 🟡 MEDIUM — Session duration label is a string; short-focus types badly undershoot

**Status: Confirmed via code trace, executed.**

`buildSession()` returns `duration` as a **display string** ("55–65 mins"), not a number. Nothing downstream can compute against it.

Executed for Persona B, Personal tier, gym equipment, `durationMins: 60`, all seven types × three presets — every result labelled "55–65 mins":

| Type | balanced | strength | mobility |
|---|---|---|---|
| glute | 17 ex | 14 ex | 14 ex |
| lower | 17 ex | 14 ex | 15 ex |
| full | 17 ex | 15 ex | 15 ex |
| upper | 11 ex | 10 ex | 11 ex |
| core | 8 ex | 8 ex | 8 ex |
| mobility | 7 ex | 7 ex | 7 ex |
| **cardio** | **4 ex** | **4 ex** | **4 ex** |

A 4-exercise session labelled "55–65 mins" is not a 55–65 minute session. This is the BUILD-5 residual ("short-exercise focus types still land under target") resurfacing at longer durations, where it is far more visible.

**Needs on-device confirmation:** actual elapsed time for a 60-minute cardio build. The simulation gives exercise counts, not wall-clock.

---

## 9. 🟢 LOW — `yoga-crescent-lunge` has no `energyRequired`, so it is unreachable

**Status: Confirmed via code trace, executed.**

Of 461 exercises, exactly one has no `energyRequired`: `yoga-crescent-lunge` ("Crescent Lunge", category `mobility`).

`exercises.js:187`:
```js
return exercises.filter(ex => ex.energyRequired <= ceiling);
```
`undefined <= 8` evaluates `false`. The exercise is filtered out at every ceiling below 10 — i.e. for every user, given §2. One-line data fix.

---

## 10. 🟢 LOW — Undeclared store fields

**Status: Confirmed via code trace.**

Written and read but absent from `store.js` `getDefaults()`:

| Field | Written by | Read by |
|---|---|---|
| `totalCredits` | `walk`/`running`/`swim`/`yoga`/`prescribed-session`/`quiet-session.js` | `workout-complete.js:18` |
| `homeEquipment` | `onboarding/equipment.js:156` | `settings.js:634`, `session-builder-ui.js:338`, `:777` |
| `gymEquipment` | `onboarding/equipment.js:157` | `settings.js:635`, `session-builder-ui.js:339`, `:777` |

These survive only via the `...saved` spread in `mergeWithDefaults()` (`store.js:216`). They work today. They are invisible to `Schema.md` and would be silently dropped by any future migration that rebuilds from defaults — including the Supabase migration.

**Recommend:** add to `getDefaults()` and `Schema.md` before the Supabase schema work proceeds. Schema-first rule applies.

---

## 11. Confirmed working — traced and found correct

Recorded so a future session doesn't re-derive these.

| Behaviour | Evidence |
|---|---|
| **Same-day return gating** | `today.js:363–378`. Executed three scenarios (fresh morning / post-session same day / morning-session same day). First door tap of the day gates to `checkin`; subsequent taps route straight through. Home coach line correctly switches to "You moved today — that's done." Correct in all three. |
| **`pendingDoorRoute` round-trip** | Set at `today.js:375`, honoured and cleared at `checkin.js:667–669` and `checkin-mini.js:439–441`, `:527–529`. Skip path honours it too (`checkin-mini.js` v6). No leak found. |
| **Coach voice is Nurturing-only** | No picker in `settings.js` — removal documented at `settings.js:116–117`, `coachStyle` retained for internal architecture only. Matches the standing rule exactly. |
| **Equipment shown per-location in Settings** | `settings.js:633–652` reads `homeEquipment`/`gymEquipment` separately. The 10 Aug fix is live and correct. |
| **`gym-programme.js` v5 field names** | The three old names (`exercise.setup`/`whyThis`/`videoUrl`) appear **only** in the changelog comment at lines 53–54. Live code reads `instructions`/`why`/`youtube`. v4's fix held through the v5 rebuild. |
| **Exercise content coverage** | `instructions`, `why`, `coaching`, `youtube` all at **461/461 (100%)**. |
| **`sets`/`reps`/`rest` at build time** | Only 4–5% populated in the raw DB, but `buildSession()` assigns them. Executed: no `"3 × undefined"` render. Hypothesis tested and disproved. |
| **Invalid session type** | `buildSession({sessionType:'strength'})` returns `null`. `gym-programme.js:516` guards `!session \|\| !session.exercises` and falls to `renderNoSession()`. Degrades safely. |
| **Condition/return-based day-one openings** | Unaffected by §1. `chronic-condition`, `injury-recovery`, `return-to-fitness`, `feel-good` all still reachable. |

---

## 12. Suggested fix order

1. **§1** — content decision first (territory→trigger mapping), then code. Highest user-facing harm, affects everyone.
2. **§2** — one-line read change plus a `returning` ceiling decision. Schema-first.
3. **§3** — supply `durationMins` in `workout.js`, `core-session.js`, `yoga-session.js`. Touch-once: these three files only.
4. **§10** — before any Supabase schema work.
5. **§7** — swap session-builder tiles onto `lockedFeature()`.
6. **§9** — one-line data fix, fold into any exercise-data session.
7. **§5, §6, §8** — need decisions, not just code. Do not book as build work yet.

**Not scheduled here.** All of the above needs adding to the master schedule before any session is booked, per standing rule.

---

*Build New Habits · Alongside: Move · Persona Tracing Wave 1 — Technical Report · 11 Aug 2026 v1*
