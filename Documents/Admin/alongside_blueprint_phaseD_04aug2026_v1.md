# Alongside: Move — Home Nav & Conditions Redesign — Phase D Blueprint
## 04 Aug 2026 v1

Build New Habits | Scopes Phase D (Conditions Update dedicated screen) of `alongside_blueprint_home-navigation-conditions_04aug2026_v1.md`. No code written this session — blueprint only, per Graeme's request. Ground-truthed against live code (04 Aug 2026), not copied from the original blueprint's Section 6 unchanged — a lot has shipped since that was written, and three of its assumptions needed correcting.

---

## 0. What's changed since the original blueprint was written

The original Phase D scope (Section 6) assumed a codebase state from earlier today. Re-grounding found:

1. **Severity input is a slider now, not a chip picker.** Section 6 said "reuses checkin.js's existing Mild/Moderate/Severe picker pattern." That picker was replaced today (Pain Input Redesign) with a 0-10 slider using the canonical `getPainBand()` from `conditions.js`. The Conditions Update screen's severity input should match this, not the retired chip pattern.
2. **`prescribed.js` is framed as external-professional exercises, not general self-authoring.** Its own header: "exercises prescribed by an external professional (physiotherapist, consultant, GP, specialist)." Functionally, its Add Exercise form (name, sets, reps/hold, notes, prescribed-by) works fine as a general manual exercise-list builder — but the coach's spoken copy throughout assumes professional origin. Reusing it for "user builds their own condition programme from scratch" (no professional involved) will need a conditional copy variant, not just a new caller. Flagged, not solved here.
3. **`strategicGoal.primaryGoal` is a single value, general-purpose, not condition-specific.** Already used for the user's overall fitness goal (set in onboarding). Section 6 said Conditions Update should offer "a user-set goal" — if that means a *condition-specific* goal, it can't reuse this field directly without either overwriting the general goal or needing a new condition-scoped field. Real design question, not decided here.
4. **The Conditions Update door currently bridges to a sheet, not a route.** Fixed today, same session as this blueprint: `today.js` was navigating directly to `onboarding/conditions`, which caused the exact bottom-nav/Back-button bug `settings.js` v9 already found and fixed once. Now uses `openSheet()`, matching `settings.js`'s pattern. This interim bridge gets replaced by Phase D's real screen, not extended.

---

## 1. Screen contents (confirmed still accurate from the original spec)

Per `alongside_spec_home-navigation-conditions_04aug2026_v2.md` §4, all still intended:

- **Entry**: reachable from Home's Conditions Update door directly, and as a shortcut from `settings.js`'s existing Conditions panel — same destination, not a separate UI (§4.1)
- **Severity**: now via slider + `getPainBand()`, writing to the existing `conditionPainScores` — not new, just using today's updated pattern instead of the retired chips
- **Free-text reflection**: writes to `conditionReflections` (already exists, `store.js` v12, unused until now) — never Journal, by design
- **Goals vs coach milestones**: both offered every visit, no default (§4.3) — **needs Section 0.3's question resolved first**: is this the general `strategicGoal`, or does it need a new condition-scoped field?
- **Three programme-build routes** (§4.4): coach builds it (new) / coach recommends, user selects (new) / user builds their own (existing `prescribed.js`, needs the copy-variant work noted in Section 0.2)
- **Fold-in dial**: Partially/Mostly/All, writing to `conditionFoldInLevel` (already exists, `store.js` v12, unused until now) — algorithm already specified in the original blueprint (exercise-count based, hooks onto `workoutGenerator.js`'s `MAIN_FILL_CEILING` fill loop, confirmed still at line 307, unchanged)

---

## 2. Decisions needed before building (not Claude's to decide alone)

Three real open questions, surfaced by re-grounding, genuinely different from anything already settled:

**D-1. Condition-specific goals — new field, or reuse `strategicGoal`?**
If a condition needs its own goal (e.g. "get my knee moving without pain") separate from the general fitness goal already in `strategicGoal.primaryGoal`, that's a new field — `conditionGoals: { [conditionId]: { goal, setAt } }` or similar, schema-first when Phase D actually builds. If "goal" in this context was always meant to just be the general one, no new field needed, but the UI copy should say so plainly rather than implying it's condition-specific.

**D-2. `prescribed.js`'s coach voice — conditional on entry context?**
If Conditions Update's "user builds their own" route sends someone into `prescribed.js` who has no external prescription at all, the coach's existing copy ("acknowledges this is not their territory," assumes professional origin) will read oddly. Needs either a new entry-context flag `prescribed.js` can read, or accepting the copy mismatch as a minor, known rough edge.

**D-3. Fold-in dial's interaction with `core-session.js`'s consolidated pool (Phase B).**
Phase B pointed `core-session.js` at the shared exercise database. The fold-in dial's job is folding a condition programme's exercises into Cardio/Core/Strength sessions specifically (per spec, not Core Sessions) — confirm this only touches `workoutGenerator.js`, not `core-session.js`, before building, so Phase B's consolidation work isn't disturbed.

---

## 3. File list — touch-once, phased

| Phase | Files | What | Depends on |
|---|---|---|---|
| **D-1 — Schema (if D-1/D-2 resolve to new fields)** | `js/store.js`, `Documents/Live State/Schema.md` | Any new fields D-1/D-2 require | Graeme's decisions on Section 2 |
| **D-2 — Conditions Update screen** | `js/views/conditions-update.js` (new) | Full screen per Section 1: severity slider, reflection field, goals/milestones, three programme routes, fold-in dial control | D-1 (fields must exist first) |
| **D-3 — Wiring** | `js/router.js`, `js/views/today.js`, `js/views/settings.js` | New `conditions-update` route registered; Home's door and Settings' "Edit conditions" both point at it instead of the `openSheet('onboarding/conditions')` bridge | D-2 |
| **D-4 — Fold-in dial generator hook** | `js/data/workoutGenerator.js` | Algorithm from the original blueprint (Section 4 there), gated on Section 2's D-3 confirmation it doesn't touch `core-session.js` | D-2, D-3 |
| **Last, whichever phases ship** | `sw.js` | Cache bump + changelog, once per phase deployed | — |

`prescribed.js`/`prescribed-session.js` — no structural change unless D-2 resolves toward needing a copy-context flag; otherwise reused exactly as-is.

---

## 4. Status

Scoped, not built. Three real decisions (Section 2) need Graeme's input before Phase D-1 can start — recommend resolving those in conversation rather than guessing, since D-1 (schema) is silently wrong once shipped if guessed incorrectly and later needs a migration.

The interim `openSheet()` bridge (today's fix) is stable and not broken — no urgency pressure on these decisions from a "currently live and bad" standpoint, just from wanting the real experience the spec describes.

---

*Build New Habits · Alongside: Move · Phase D Blueprint · 04 Aug 2026 v1*
