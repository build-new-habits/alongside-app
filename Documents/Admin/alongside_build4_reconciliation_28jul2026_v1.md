# Alongside: Move — BUILD-4 Schema Reconciliation
## 28 Jul 2026 v1 — Working Document, Phase 1 (field inventory + confirmed errors)

Produced directly against the live repo (`git clone`, `store.js` v10) in the PM chat, using remaining session time before reset. This is the raw reconciliation material BUILD-4 needs — not a finished schema.md v1.9, but the evidence base for writing one without guessing.

---

## Confirmed: the two errors flagged in the 16 Jul v1.8 delta note, checked against live code

**Error 1 — CONFIRMED, exactly as flagged.** `todaysWorkouts`, `workoutsGeneratedAt`, `todayIntensity`, `activeWorkout` do not exist anywhere in live `store.js`. Zero matches. The real live mechanism is `generatedSession: { session, builtAt, inputs }`, confirmed present. Schema v1.7's Section 3 ("Workout Generation Cache") is describing a mechanism that was replaced at some point and never updated in the docs.

**Error 2 — RESOLVED, more nuanced than the delta note suggested.** Both `startDate` and `startedAt` genuinely exist live — they're not the same field under dispute, they're two different fields on two different objects:
- `activeProgramme.startDate` — confirmed live, matches what schema v1.7 documents. **v1.7 was actually right about this one.**
- `unwellMode.startedAt` — confirmed live, on a completely different object (illness/unwell-mode tracking: `active`, `kind`, `startedAt`, `recoveryStartedAt`, `daysHeld`, `kindAtRecovery`). **This entire object is undocumented in schema v1.7** — not a wrong field name, a missing feature.

---

## The actual scale: raw field inventory

179 distinct field names found in live `store.js`. Cross-referenced against everything documented in schema v1.7 plus the 16 Jul v1.8 delta note (27 fields covered between them): **155 fields in live `store.js` have no documentation trail at all.**

This isn't 155 genuinely new decisions to make — most are legitimate, already-shipped fields that were simply never written up as later schema passes happened faster than the docs did. But it's the honest number, not the "100+" estimate from the 16 Jul static analysis — now a confirmed, listable set rather than an estimate.

**Known undocumented feature areas found in this pass** (not built during this analysis, just surfaced — each is a real chunk of the reconciliation work):
- `unwellMode` (illness tracking) — entirely undocumented, as above
- `hormonalTracking` — present in store.js, no schema entry found
- `gymProgrammeSession` / `gymProgrammeWeek` — present, undocumented
- `hardBeforeSelections` / `hardBeforeShownAt` — present, undocumented (likely Noticing Hub-adjacent, worth checking against the Section 18 Noticing Hub schema for a possible naming mismatch rather than assuming fully new)
- `chaptersUnlocked` / `dataUnlocked` — present, undocumented
- `annualReflection` — present, undocumented
- `castleShownAt` — present, undocumented, unclear feature without further reading

The full raw diff (155 fields, alphabetical, no annotation yet) is captured in this session's working files — next session should start from this list rather than re-deriving it, and go through it in feature-area batches (the groupings above are a reasonable starting split) rather than one field at a time.

---

## What this session did NOT do — genuinely out of scope for a first pass

- Did not write a finished schema.md v1.9 — that requires deciding what level of detail each of the 155 fields deserves, which is a judgement call, not a mechanical one.
- Did not check Sections 9 (`exerciseFeedback`) and 10 (`stats`) for the "specified but never built" pattern the v1.8 delta flagged as unconfirmed — worth checking early in the next session, same method as the empathy transfer discovery.
- Did not touch the three-competing-documents problem (schema.md frozen at v1.3, schema_v1_7, schema_md.docx) — still needs a decision on which one or two get retired.

---

*Build New Habits · Alongside: Move · BUILD-4 Working Document · 28 Jul 2026 v1*
