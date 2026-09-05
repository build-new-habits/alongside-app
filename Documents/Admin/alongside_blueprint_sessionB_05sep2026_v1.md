# Session B blueprint — retire build mode, add removal

**05 Sep 2026 v1**

Opening state: `alongside-v439`, `session-builder.js` v45, `session-builder-ui.js` v13, 104 gates green, `store.js` v63, `Schema.md` v1.45, schedule v278.

Written at the close of Session A, from a live trace rather than from the decision record. Everything below was verified by reading current `main`, not inferred.

---

## The coupling that must be handled first

`candidatePools` is a module-level variable in `session-builder-ui.js`. **It is populated in exactly one place:** `triggerRecommendedBuild()`, line ~1390.

The SWAP-1 sheet reads it for every alternative it offers. `triggerBuild()` — the coach route — **never populates it.**

So retiring `triggerRecommendedBuild()` without further change ships a preview where **every swap is dead**: the sheet opens with nothing in it, for every session type, for every user. SWAP-1 stops working silently.

No existing gate catches this, because all 121 SWAP-1 assertions reach the sheet through the recommend route. They would stay green while the feature was gone.

**Therefore: `triggerBuild()` must call `buildCandidatePools()` with the same inputs it passes to `buildSession()`, and assign `candidatePools`, before `phase = "preview"`.** Do this first, prove swapping still works from the coach route, and only then remove anything.

---

## What is actually wired today

| Route | Screen reached | Builder called | Populates `candidatePools`? |
|---|---|---|---|
| stretch | duration → **straight to build** (line ~1672) | `buildSessionFromSelection` | yes |
| everything else, "coach builds it" | equipment → buildmode | `buildSession` | **no** |
| everything else, "coach recommends" | equipment → buildmode | `buildSessionFromSelection` | yes |

Stretch was hardcoded onto the recommend route by STRETCH-FLOW on 2 Sep. Confirmed at line 1672: `buildMode = "recommend"; triggerRecommendedBuild(); return;`

**Consequence, still live at the close of Session A:** every stretch session in the app ignores `exercisePreferences` and returns the same picks every time, because `buildSessionFromSelection` takes `pool[0]` while `buildSession` weights by preference, novelty and continuity. DUPE-SECTION fixed the repetition on that route; it did not make it vary.

---

## The work

### 1. Populate `candidatePools` from `triggerBuild()`
As above. Nothing else changes until this is green.

### 2. Retire, do not delete
Per schedule v277 §1b. `buildSessionFromSelection()`, `triggerRecommendedBuild()` and the `recommended` flag **stay in the codebase**, out of the daily flow, for athlete self-build across stretch, mobility conditioning and programmes.

**The retirement is enforced, not hoped.** New gate assertion: both hold **zero callers reachable from the daily flow**. This makes `recommended` a writer-without-a-reader *on purpose with a check saying so*, turns a silent rewiring red, and makes athlete self-build's arrival a deliberate moment to update the gate rather than a quiet change.

Note the cost honestly in the file header: `session-builder-ui.js` v12 argues the opposite position, having deleted an unused paywall import precisely because dead code is a working example somebody copies.

### 3. Delete the build-mode screen
`renderBuildModeStep()`, `_buildModeOption()`, the `"buildmode"` phase, the `buildMode` variable, and the back-navigation branch at line ~1563. Every type now routes duration → equipment → build, and stretch keeps its shortcut.

⚠️ Line 1580 (`phase = selectedType === "stretch" ? "duration" : "buildmode"`) is back-navigation *out of* preview. It must not be left pointing at a deleted phase.

### 4. Removal, with its own floor
⚠️ **The warm-up floor runs at BUILD time only**, inside `buildSessionFromSelection()`. Removal happens after. So removal needs its own check, or a person can empty the warm-up one tap at a time and reach exactly the state that floor exists to prevent.

Removal takes one exercise and moves nothing else — decision 4. It does not rebuild.

### 5. Rewrite the empty state
Current copy — *"Keeping it is the honest answer today"* — was a product position taken without a mandate and is overturned. No rebuild offer: it contradicts decision 4 and would be a second mechanism firing in one unpredictable case.

### 6. SORE-LEGEND in the stretch zone picker
Same grammar as the swap sheet: the reason in words, per chip. `aria-disabled`, never the HTML `disabled` attribute — keeps the 48px target, tab order, and a reachable reason.

---

## Standing constraints

- Contrast: `--color-danger` #FB7185 on `--color-bg-card` #334155 is **3.85:1** — passes 1.4.11 non-text, **fails 1.4.3 text**. Rose for the ring, `--color-text` for the reason. `--color-surface` is undefined; do not anchor on it.
- Gate must be red before it is green, and every assertion reversal-proven.
- The fixture must reach the branch it claims to test. Seven recorded failures of this in the project so far; two were found inside Session A alone.
- Execute UI under jsdom with real clicks. `node --check` does not catch a dangling identifier.
- `sw.js` last, alone, cache bumped. Blueprint declares the version ahead of the bump.
- Verify from a second independent fresh clone.

## Logged, not in scope

- 🟠 **SURFACE-TOKEN** — `--color-surface` used 34 times with no fallback across 9 files, defined nowhere. Those surfaces render transparent.
- 🟠 **PRECACHE-GOAL-REVIEW** — `css/layouts/goal-review.css` on disk, not precached; offline launch fails.
- 🟡 **SKIP-MEANS-TOO-HARD** — every skip records `too-hard` at `gym-programme.js:929`. Needs a product ruling, not a patch.
