# Alongside: Move — Home Nav & Conditions Redesign — Phase D Blueprint
## 04 Aug 2026 v3

Build New Habits | Scopes Phase D (Conditions Update dedicated screen) of `alongside_blueprint_home-navigation-conditions_04aug2026_v1.md`. Supersedes v1 — all three open decisions now resolved (Section 2). No code written this session — blueprint only. Ground-truthed against live code (04 Aug 2026), not copied from the original blueprint's Section 6 unchanged — a lot has shipped since that was written, and three of its assumptions needed correcting.

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

## 2. Decisions — resolved 04 Aug 2026

All three decided (Graeme delegated D-1's design and D-3 fully; clarified and delegated D-2 once the question was explained).

**D-1. Condition-specific goals — new field, felt-sense not numeric.** Graeme's framing: "the aim to feel healed, or more able to cope, or improved" — not a target-date/target-value goal like `strategicGoal`, which is the wrong shape for this anyway (single-value, general-purpose, already spoken for). New field:

```
conditionGoals: {
  [conditionId]: {
    goalType: 'healed' | 'cope' | 'improve',
    note: string,      // optional free-text elaboration
    setAt: ISO string
  }
}
```

Three options only, matching Graeme's own three words — no numeric target, no date, nothing that turns into a pass/fail:
- **"Feel healed"** — recovery framing, implies eventual resolution
- **"Cope better day-to-day"** — chronic-management framing, doesn't imply resolution
- **"Feel stronger / improve"** — general progress framing

Skippable ("Not sure yet") — consistent with the app's standing "no shame" principle; forcing a goal choice on a condition someone's still processing would work against that. Offered alongside `activeProgramme.milestones` (the coach-generated alternative), per spec §4.3's "both offered every visit, no default" — this doesn't change that decision, just gives the "goal" side a real, condition-appropriate shape instead of borrowing `strategicGoal`.

**D-2. `prescribed.js` coach voice — new field, two lines swapped, not a rewrite.** Only two of the four coach-line branches actually reference professional origin (`buildCoachLine()`'s empty-state line and the default not-yet-done closing line) — the "done today"/"in progress" branches are already origin-neutral. New field:

```
prescribedExercisesOrigin: 'professional' | 'self' | null
```

Set once, the first time the list goes from empty to non-empty, based on entry point — Conditions Update's self-build route sets `'self'`, the existing entry path (physio-given) leaves it `'professional'` or `null` (unchanged default, preserves current behaviour for everyone already using this screen normally). `buildCoachLine()` swaps just those two lines on this flag:
- Self, empty state: *"Building your own plan for [condition]? Add exercises here — I'll track them with you, same as always."*
- Self, default state: *"These are the exercises you've chosen for [condition]. I'll keep them here, separate from your regular sessions — you know your body best, I'm just here to help you show up for them."*

Everything else in `prescribed.js` — the add-exercise form, session flow, credits — stays exactly as-is. This is copy-branching, not a rebuild.

**D-3. Fold-in dial scope — confirmed `workoutGenerator.js` only.** The spec's fold-in dial applies to "Cardio, Core & Strength" sessions (Home's Door 1, routed through `session-builder.js`/`workoutGenerator.js`) — a different thing from "Core Session" (`core-session.js`, the guided ab/stability session type Phase B just consolidated), despite the similar names. Confirmed: fold-in dial touches `workoutGenerator.js` only. `core-session.js` stays untouched, so Phase B's consolidation work isn't disturbed.

---

## 3. File list — touch-once, phased

| Phase | Files | What | Depends on |
|---|---|---|---|
| **D-1 — Schema** | `js/store.js`, `Documents/Live State/Schema.md` | New fields: `conditionGoals`, `prescribedExercisesOrigin` | None — ready to run |
| **D-2 — Conditions Update screen** | `js/views/conditions-update.js` (new) | Full screen per Section 1: severity slider, reflection field, goal picker (3 options + skip) + milestones, three programme routes, fold-in dial control | D-1 |
| **D-3 — Wiring** | `js/router.js`, `js/views/today.js`, `js/views/settings.js` | New `conditions-update` route registered; Home's door and Settings' "Edit conditions" both point at it instead of the `openSheet('onboarding/conditions')` bridge | D-2 |
| **D-4 — `prescribed.js` copy branch** | `js/views/prescribed.js` | Two coach-line branches swap on `prescribedExercisesOrigin`, per Section 2 D-2. Small, isolated. | D-1 (field must exist), can run parallel to D-2/D-3 |
| **D-5 — Fold-in dial generator hook** | `js/data/workoutGenerator.js` | Algorithm from the original blueprint (Section 4 there) | D-2, D-3 |
| **Last, whichever phases ship** | `sw.js` | Cache bump + changelog, once per phase deployed | — |

`prescribed-session.js` — no change needed at all; only `prescribed.js`'s coach-line function is touched.

---

## 4. Status

Fully scoped and decided. Ready to run Phase D-1 (schema) as its own session whenever Graeme wants to start building — no more open questions blocking it.

---

*Build New Habits · Alongside: Move · Phase D Blueprint · 04 Aug 2026 v2*

---

## 5. UX design — resolved 04 Aug 2026, same day

**Card structure:** one collapsed card per condition, always collapsed by default (including first-ever add) — but with an unambiguous chevron affordance (rotates on expand, respects reduced-motion) plus a subtle border/background shift on focus/hover, so it reads as interactive before the first tap. `aria-expanded` wired properly.

**Goal + severity combined for real progression.** Graeme's question: is a one-time felt-sense goal enough, or does it need to show movement? Resolved: yes, combine with a severity trend, and it's genuinely buildable with zero new tracking — full check-in already writes a dated snapshot of every condition's severity into `checkinHistory` (has done for a while). Check-in-mini doesn't add to that history, which works in favour of a clean trend line — one reading per day. Once a goal is set, the card shows something like *"Moderate → Mild over the last 2 weeks"* sourced from that existing history. Deliberately descriptive, not judgemental — no "good"/"bad" framing, since conditions fluctuate and editorialising a plateau as failure cuts against the app's own "no shame" principle. State the shape of it, let the person draw their own conclusion.

**Programme routes — ship one real option, not three tiles where two say "coming soon."** "Build your own" (`prescribed.js` + D-2's copy branch) is real and ships in D-2. "Coach builds it" / "coach recommends, you select" need actual programme-generation logic that doesn't exist yet — comparable in size to NEW-1 (Programme Curation) already logged as its own future item. Rather than inventing a condition-specific duplicate of that future work, D-2 ships with the one working option now; the three-way choice becomes real everywhere at once when NEW-1 lands.

