# Alongside: Move — Session Handoff
## 12 Aug 2026 v1

**Build New Habits** | Next session starts here

---

## State

| | |
|---|---|
| Cache | **alongside-v314** |
| `store.js` | v38 |
| `Schema.md` | v1.31 |
| Master schedule | v183 |
| Verification gates | **30, all passing on a fresh clone of the remote** |
| Working tree | clean, everything pushed |

Repo `build-new-habits/alongside-app`, main. Website `build-new-habits/website`.

---

## Start-of-session ritual — do not skip

1. **Clone fresh.** `git clone --depth 1` into a new directory. Never work from an assumed state.
2. **Read `Documents/Admin/master_schedule.md`.** Reading it back is the ritual — writing to it is not. Three entries went stale on 12 Aug because it was quoted from memory.
3. **Run every gate:** `for g in tools/*.mjs; do node $g; done`. Thirty should pass.
4. **Verify any claim before acting on it.** An entry describing something as dead, missing or unbuilt must be re-checked against live code. Four such entries were wrong on 12 Aug.

---

## The three process rules

These came out of a bug that took four attempts. They are not optional.

### 1. Deep sweep before declaring anything done
Trace **every** file that touches the thing, not the ones that seem relevant. Each failed equipment fix stopped at the first plausible cause. The sweep that worked covered 42 files and found four catalogue items that had never existed.

### 2. Derive fixtures from the files, never type them
Three gates passed while the device failed because the ids were hand-typed. **A gate built from a hand-typed fixture cannot catch a wrong fixture.** And a gate must not *replicate* logic it could *exercise* — replication silently tests a path the code may no longer take.

### 3. Verify against a fresh clone, never the working directory
The v310 commit did not contain its own fix. Locally green, deployed broken.

**`git stash` to test a gate against old code stashes the gate too.** It reports zero failures and proves nothing. Revert the source file only.

---

## Deploy order

1. Application files first
2. `sw.js` **alone**, in its own commit, with the cache version incremented and a change note
3. Push, then **clone fresh and re-run every gate**

`sw.js`'s cache name and its file header must agree — `verify-sw1.mjs` checks this.

---

## Next, in the order I would take them

### Buildable now
- **CSS ratchet: 131 → 0.** `verify-css.mjs` is budgeted at the current count and can only go down. Biggest remaining blocks are `.privacy-*` (13) and `.walk-session-view` (23).
- **DISP-3 layout check** — 19 labels went 9px → 13px; several sit in tight absolutely-positioned corners.

### Needs Graeme
- **CAP-6** — `trainingIntent` has no writer, so the maintain and recover branches are unreachable. Needs question wording.
- **REST-1** — the 90s rest gap has no UI. Needs designing: a countdown is one wrong decision from being a shame mechanic.
- **DATA-2** — 49 loaded exercises carry no sets/reps; 44 state it in prose. Extraction is error-prone, deliberately not guessed at.
- **PT-4** — PB logging is specified and never built. Beta blocker or post-beta?
- **Wellbeing / Noticing** — the Home tile and the nav item are the same destination under two names. Naming decision, not a cleanup.

### Blocked on Natalie
- **BETA-1** — onboarding's consent gate links to `/privacy/` and `/terms/`. **Neither page exists** — confirmed against the website repo. People are agreeing to documents they cannot read.
- **BETA-2** — `POLICY_VERSION = '2026-08-11'`, pinned to those non-existent documents. Must be bumped when the real ones land.
- **BETA-4** — `AGE_GATE_ENABLED = false`.

### Sequenced after a device pass
- **NAV-2 goal-directed pointers.** The "missing front doors" half is done — yoga has a second door, Settings is three sections with sub-tabs. What remains answers *"what should I do today"*, not *"where is the thing I know exists"*, and is worth doing after Graeme has lived with the current changes.

---

## Closed by decision — do not re-raise

| | |
|---|---|
| **LANG-1 remainder** | 92 plain-language items. *"That's what we can discover in beta and user feedback in time."* Reference list kept |
| **DATA-1 retirement** | `contentType` is load-bearing in two live places |
| **PT-1, PT-7, PT-8** | All found already fixed or resolved by device evidence |

---

## Things that will bite

- **Two session engines.** `session-builder.js` and `workoutGenerator.js` do not share filters by default. Any rule about what may be selected must be checked in both, or placed where both must read it.
- **Three equipment vocabularies**, reconciled by `js/data/equipment-map.js`. The real catalogue is **`js/data/equipment.js`** (83 items) — *not* `js/views/onboarding/equipment.js`, which is the view. Reading the wrong one cost three attempts.
- **`js/data/exercises/` is the only source of exercise content.** P5. Views render. `verify-decisions.mjs` checks this by `id` + `name`, the weakest shared signal — an earlier version matched on `equipment` + `movementPattern` and missed 30 inline yoga poses.
- **Partials stay in `activityLog` and are never counted.** `store.completedSessions()` is the single definition.

---

*Build New Habits · Alongside: Move · Session Handoff · 12 Aug 2026 v1*
