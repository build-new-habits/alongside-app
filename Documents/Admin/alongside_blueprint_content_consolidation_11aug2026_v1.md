# Exercise Content Consolidation — Task List

**11 Aug 2026 v1**

Build New Habits · Alongside: Move · Blueprint

Scope: one exercise source of truth, a real gym library, and the equipment
filter actually working. Delegated to Claude — Graeme's voice not required
for any task below. Findings PT-13 to PT-19 all resolve within this plan.

---

## Why this exists

Five separate exercise content sources were found in the repo, four of which
the session builder can never reach. Separately, 92 of the 124 exercises that
require equipment are permanently unreachable for every user because the tags
they carry do not exist in the vocabulary users tick from. The product has no
gym content at all: zero cable exercises, zero machine work beyond a single
rowing machine entry, and 73% of the database is bodyweight.

The lived symptom: a gym session that could have been done at home.

---

## Standing rules in force

- Schema first. `store.js` and `Schema.md` before any code that reads a new field.
- Touch-once per task. Files listed per task below; no file appears twice within a task block.
- Deploy order: application files first, `sw.js` last, in a separate commit, cache version incremented.
- Version header `DD Mon YYYY vN` on every file produced.
- WCAG 2.2 AA on all content and UI.
- On-device testing is the definitive gate. "Should work" is not acceptance.

---

## Task list

### CON-1 — Registry de-duplication 🟠

`js/data/exercises.js` and `js/data/exercises/index.js` are parallel copies of
the same registry and the same four filter functions, differing only in import
paths. Both are live: `workoutGenerator.js` imports the former, everything else
the latter. Every filter fix to date has had to be written twice, and the header
comments in both files admit it.

**Fix:** reduce `js/data/exercises.js` to a re-export shim over
`js/data/exercises/index.js`. No import path changes anywhere else, no
behaviour change, one copy of the filters from here on.

**Files:** `js/data/exercises.js`, `sw.js`.

**Prerequisite for CON-2** — otherwise the vocabulary fix gets written twice.

---

### CON-2 — Equipment vocabulary resolver 🟠

`equipment.js` offers users 66 granular ids (`dumbbells-medium`,
`band-heavy`, `bench-adjustable`). Exercises are tagged with 22 coarse ids
(`dumbbell`, `resistance-band`, `bench`). Fourteen of the 22 have no
counterpart in the vocabulary at all. Both filters use
`equipment.every(item => userEquipment.includes(item))`, so those tags can
never match.

**Measured impact:** 92 of 124 equipment-requiring exercises (74%) are
unreachable on every route, for every user, regardless of what they own.
Disproportionately the dumbbell, kettlebell, band and bench work.

**Fix:** a new `js/data/equipment-map.js` mapping granular vocabulary ids to
the coarse capability tags exercises use. Filters resolve the user's ticked
set through the map before comparing. Non-destructive: no stored user data
migrates, no exercise is re-tagged, granular ticks are preserved for later
load guidance.

**Files:** `js/data/equipment-map.js` (new), `js/data/exercises/index.js`,
`js/session-builder.js`, `sw.js`.

**Acceptance:** unreachable count falls from 92 to 0. Node assertion, then
fresh clone confirm, then on-device.

---

### CON-3 — Exercise entry standard, schema 🟡

Two new fields, agreed from Graeme's own description of what a gym exercise
needs: what to do, why, how to set up, what weight and sets, what to watch for.

- `watchOut` — `string[]`. The failure modes. Absent from all 461 entries and
  from all four private pools; never existed.
- `load` — `string`. Effort-relative prescription only, never absolute
  kilos. Rationale: we cannot know anyone's strength; effort language stays
  true across a beginner and a returning lifter; and an absolute number
  invites the comparison the product refuses under Locked Principle P4.

Existing fields unchanged: `instructions`, `why`, `coaching`, `youtube`,
`sets`, `reps`, `rest`, `tempo`.

**Files:** `Documents/Live State/Schema.md`, the Gym Entry Standard document.
No `store.js` change — these are static content fields, not store fields.

**Prerequisite for CON-4.**

---

### CON-4 — `js/data/exercises/gym.js` 🟠

Thirteenth discipline file, matching the existing model. Target ~55 entries
covering push, pull, squat, hinge, lunge, carry, core and the machines that
actually exist in a gym.

~17 come from `morning-programme.js` already written to real coaching depth
(cable chest press, seated cable row, cable lat pulldown, tricep rope
pushdown, incline dumbbell press, Arnold press, renegade row and others).
~40 authored new, to the full CON-3 standard.

**Files:** `js/data/exercises/gym.js` (new), `js/data/exercises/index.js`,
`sw.js`.

---

### CON-5 — Harvest and retire `morning-programme.js` 🟡

63 unique exercises, 44 not in the main database, 23 with complete guidance
already written. Gym content goes to CON-4; the remaining ~8 home entries go
to their discipline files. No live entry point was found for this programme
(PT-16) — nothing navigates to `morning-session`, no generator emits that
session type — but nothing is deleted until the port is complete and counted.

**Files:** `js/data/morning-programme.js`, `js/views/morning-session.js`,
`js/router.js`, discipline files as required, `sw.js`.

---

### CON-6 — Retire the session-builder private pool 🟠

65 hardcoded entries inside `js/session-builder.js`. 37 duplicate the main
database. 28 are unique and carry `description`, `cues` and `youtube` but none
of `instructions`, `why` or `coaching` — which is why the exercise card renders
blank on that route (PT-13). This pool is also why the difficulty ceiling had
to be fixed twice (PT-11) and why 139 practice entries and the whole yoga
library have never been reachable from the session builder.

**Fix:** port the 28 unique into their discipline files at the CON-3 standard,
delete the pool, point `_filterCandidates()` at `EXERCISES`. Category and
section tags carry the selection logic, as they already do.

**Files:** `js/session-builder.js`, discipline files as required, `sw.js`.

**Acceptance:** PT-13 resolves with no renderer change — `gym-programme.js`
already reads the fields the main database supplies.

---

### CON-7 — Retire the yoga and quiet private pools 🟡

`yoga-session.js` holds 30 entries, 21 already in the main database.
`quiet-session.js` holds 13, 4 already present. Port the remainder, delete the
pools, import from the registry.

**Files:** `js/views/yoga-session.js`, `js/views/quiet-session.js`,
discipline files as required, `sw.js`.

---

### CON-8 — Location preference, not permission 🟠

There is no location bias anywhere in the engine. Choosing "gym" swaps in a
larger equipment list, but equipment is only ever a permission check —
anything with `equipment: []` passes every time and nothing prefers a barbell
when the user is standing next to one. Warm-ups are therefore identical at
home and at the gym.

**Fix:** weight candidate selection toward equipment-requiring exercises when
location is gym, with a bodyweight floor so the result stays sane and the
warmup safety floor cannot be starved.

**Files:** `js/session-builder.js`, `sw.js`.

**Runs last** — pointless to tune selection over a pool that is about to change.

---

### CON-9 — `watchOut` backfill 🟡

Equipment-requiring exercises first, since that is where absence of a warning
carries real physical risk. Bodyweight remainder rolling through beta,
prioritised by what beta users are actually given.

**Files:** discipline files, `sw.js`.

---

## Order of execution

CON-1 → CON-2 → CON-3 → CON-4 → CON-5 → CON-6 → CON-7 → CON-8 → CON-9

CON-1 before CON-2 so the vocabulary fix is written once.
CON-3 before CON-4 so nothing is authored to the old standard.
CON-8 after CON-6 so it is tuned against the final pool.

---

## Note on the device pass

The standing recommendation at master schedule v149 is to stop building and
run the device pass. CON-1 and CON-2 change what the generator produces, so a
pass run before them would be testing a build in which 92 exercises are known
to be unreachable. Recommendation: land CON-1 and CON-2 first, then run the
device pass against a product where the equipment filter works. CON-3 onward
is content authoring and can proceed in parallel without disturbing the code
paths under test.

---

*Build New Habits · Alongside: Move · Content Consolidation Blueprint · 11 Aug 2026 v1*
