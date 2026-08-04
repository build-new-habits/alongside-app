# Alongside: Move — Coach-Built & Coach-Recommended Condition Programmes — Scoping
## 04 Aug 2026 v1

Build New Habits | Scopes the two programme-build routes deliberately deferred from Phase D-2 ("Coach builds it" / "Coach recommends, you select" — see `alongside_blueprint_phaseD_04aug2026_v3.md` §5). No code written this session — scoping only, per Graeme's request to resolve this properly before building. This is functionally NEW-1 (Programme Curation), already logged on the master schedule, now being scoped for real rather than left as a placeholder.

---

## 1. Grounding — the database already has real, usable data for this

Checked before writing anything, not assumed. The shared exercise database (`js/data/exercises/*.js`) already carries:

- **`affectsAreas`** (461 exercise records) — which body areas an exercise touches. Confirmed a strong, direct naming overlap with condition IDs (`lower-back`, `glutes`, `hamstring`, `hip`, `abdominals`, `achilles`, `calves` all appear identically on both sides). One minor naming inconsistency found, not yet reconciled: `biceps-triceps` (conditions) vs `triceps-biceps` (some exercise records) — small, fixable when this gets built, not a blocker to scoping.
- **`rehabPhase`** (95 exercise records, all in `rehabilitation.js`) — `'acute' | 'subacute' | 'maintenance'`, the exact same three-phase model `getActiveConditionIds()` already uses for severity-based contraindication filtering.
- **`contraindications`** — already the safety-filtering mechanism every session type uses.

This means both new routes can be built on existing, real data — not a fresh content-authoring project. That significantly de-risks this compared to how it might have looked from the outside.

---

## 2. The real schema question, found while grounding this

`prescribedExercises` is a flat, ungrouped array — not condition-scoped. If Condition A gets a coach-built programme and Condition B gets a different one, they'd currently collide into one shared list with no way to tell them apart. This needs resolving before either new route can write anything.

**Proposed fix:** add a `conditionId` field to each `prescribedExercises` entry (nullable — entries added the existing way, with no condition context, stay `null`, fully backward compatible). Conditions Update's "Your programme" section then filters the shared list by `conditionId` per card instead of showing one undifferentiated list for everyone. Small, additive schema change, no migration needed for existing entries.

---

## 3. What "coach builds it" actually does — proposed algorithm

1. Take the condition's current severity → resolve to `rehabPhase`-equivalent band (mild → maintenance-leaning, moderate → subacute, severe → acute — mirroring the same bands `getPainBand()` already defines, not a new scale).
2. Filter the shared exercise database: `affectsAreas` includes the condition's ID, `contraindications` doesn't include the condition's current phase-variant, `rehabPhase` matches or is gentler than the resolved band.
3. Select a small starting set (proposed: 4–6 exercises — matches the size of a real Core Session or Cardio/Core/Strength session, not an overwhelming list).
4. Goal type (`conditionGoals`, Phase D-1) biases selection, not the exercise pool itself: "improve" leans toward `maintenance`-phase/higher-`difficultyLevel` options where safe; "cope"/"healed" lean toward `rehabPhase`-matched, gentler options.
5. Write the result to `prescribedExercises` with the new `conditionId` field set.

**"Coach recommends, you select"** is the same filtering (steps 1–2) stopped short of automatic selection — presents the filtered candidate list as choosable cards, person picks which ones become their programme. Genuinely the lighter-touch version of the same underlying logic, not a separate build.

---

## 4. Open decisions — need Graeme's call before D-1 (schema) for this piece

**P-1. Does "coach builds it" ever re-run, or is it one-time?** Conditions change severity over time (that's the whole point of the trend view). Does the coach ever propose rebuilding the programme, or is it a one-time generation the person then manages manually via "View / edit" from there on? Recommend: one-time generation, with a manual "Ask the coach to rebuild this" action available later — avoids the programme silently changing under someone without them asking, which would work against trust in exactly the way "Behaviour is communication" is meant to protect.

**P-2. Does this progress week to week, or is it a flat list?** The wider spec's Programme Curation concept (NEW-1) implied 6–12 week progression elsewhere in the app. Recommend keeping THIS piece — condition-specific programmes — deliberately flat and simple (a fixed set of exercises, no built-in week-by-week progression) for now, since a full periodised engine is real, separate scope already logged as its own future item. Revisit if it turns out to feel too static in practice.

**P-3. Exercise count — is 4–6 right?** Matches existing session sizes app-wide, but worth confirming this isn't meant to feel bigger/more comprehensive than a normal session, given it's specifically about addressing a condition.

---

## 5. File list — touch-once, phased (once decisions are made)

| Phase | Files | What |
|---|---|---|
| **P-1 — Schema** | `js/store.js`, `Documents/Live State/Schema.md` | `conditionId` added to `prescribedExercises` entries (additive, nullable) |
| **P-2 — Selection logic** | `js/data/conditions.js` or a new `js/data/conditionProgrammes.js` | The filtering/selection algorithm from Section 3 |
| **P-3 — UI** | `js/views/conditions-update.js` | Two new options in "Your programme," replacing the current single "Build your own" tile with three; "coach recommends" needs a lightweight selection UI (reusing `.cu-goal-pill`-style cards, not a new component) |
| **Last** | `sw.js` | Cache bump |

---

*Build New Habits · Alongside: Move · Scoping Note · 04 Aug 2026 v1*
