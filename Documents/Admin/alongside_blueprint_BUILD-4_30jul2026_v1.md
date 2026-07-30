# Alongside: Move — Build Session Blueprint
## 30 Jul 2026 v1

Build New Habits | Written by the PM chat, for a fresh build chat to execute independently. Paste this whole document as the first message in a new chat.

---

## Session: BUILD-4 — Schema Reconciliation

**Focus:** Bring `schema.md` up to date with what `store.js` actually contains, and retire dead code found along the way. This is a documentation-accuracy session first, code-cleanup second — the store itself is not expected to need much functional change.

**Why this matters now:** it's the confirmed blocker for the Supabase schema design session. Supabase can't be designed against a schema doc that's missing 155 of 179 real fields.

---

## 1. What's already done — don't redo this

A first-pass field inventory was run directly against the live repo on 28 Jul 2026 (full detail in `alongside_build4_reconciliation_28jul2026_v1.md` — read this in full before starting). Headline findings, already confirmed, do not re-investigate:

- **179 distinct fields** exist in live `store.js` (v10, 16 Jul 2026 — re-confirm this is still current at session start).
- **155 of those have no documentation trail** across `schema_v1_7_15jun2026.md` and the 16 Jul v1.8 delta note combined.
- **Confirmed dead:** `todaysWorkouts`, `workoutsGeneratedAt`, `todayIntensity`, `activeWorkout` do not exist in live `store.js` at all. The real live mechanism is `generatedSession: { session, builtAt, inputs }`. Schema v1.7's "Workout Generation Cache" section (Section 3) describes a replaced mechanism — needs rewriting, not preserving.
- **Resolved, not an error:** `activeProgramme.startDate` and `unwellMode.startedAt` are two genuinely different fields on two different objects, not a naming mismatch. `startDate` is already correctly documented. `unwellMode` as a whole (illness/recovery tracking: `active`, `kind`, `startedAt`, `recoveryStartedAt`, `daysHeld`, `kindAtRecovery`) is entirely undocumented — treat as a missing feature area, not a fix.
- **Confirmed live, not dormant:** `exerciseFeedback` — `applyFeedbackWeighting()` in `workoutGenerator.js` genuinely reads and uses it. No action needed beyond documenting it.
- **Separately, dead code found in `workoutGenerator.js`:** it still *writes* to `todaysWorkouts`/`workoutsGeneratedAt` on every `generateDailyOptions()` call, even though nothing reads them (see above). This is safe to remove in this session — it's writes with no reader, not a live contract.

**Known undocumented feature-area batches** (starting point for going through the 155, not an exhaustive breakdown):
- `unwellMode` — entirely undocumented, as above
- `hormonalTracking` — present, no schema entry
- `gymProgrammeSession` / `gymProgrammeWeek` — present, undocumented
- `hardBeforeSelections` / `hardBeforeShownAt` — present, undocumented. **Check against the Noticing Hub Section 18 schema first** — this may be a naming mismatch against already-documented onboarding fields (`onboarding.hardBeforeSelections`, `onboarding.hardBeforeShownAt` appear in the Phase 5 technical blueprint), not a genuinely new, undocumented pair. Confirm before treating as new.
- `chaptersUnlocked` / `dataUnlocked` — present, undocumented
- `annualReflection` — present, undocumented
- `castleShownAt` — present, undocumented, unclear feature without reading the relevant onboarding code

**Not yet checked — do this early in the session, same method as the `exerciseFeedback` check above:**
- `stats` — the 16 Jul v1.8 delta note flagged this as possibly "specified but never built." Confirm live/dormant status before anything else, since if it's dormant that changes how it should be documented (or whether it should be, at all).

---

## 2. The three-competing-documents problem — needs a decision this session

Three documents currently claim to be the schema reference:
- `schema.md` — frozen at v1.3, the oldest
- `schema_v1_7_15jun2026.md` — the most recently used as a diff baseline
- `schema_md.docx` — a Word version, unclear how current

**Decide and execute:** which one or two of these become the single canonical `schema.md` going forward, and which get removed from project knowledge. Don't leave three live candidates after this session closes — that's exactly the drift that caused this reconciliation to be needed.

---

## 3. Files this session will touch

| File | Ground-truth status | Action needed |
|------|---------------------|----------------|
| `store.js` | v10 (16 Jul) per last confirmation — **re-confirm live version at session start, don't trust this number** | Read-only for the inventory work. Only touch if the `todaysWorkouts`/`workoutsGeneratedAt` dead-write removal (Section 1) is done in this session — small, scoped edit, not a rewrite. |
| `schema.md` | v1.3, frozen | REWRITE → v1.9. This is the main deliverable. |
| `schema_v1_7_15jun2026.md` | Reference only | Decide whether retired (Section 2) |
| `schema_md.docx` | Reference only | Decide whether retired (Section 2) |
| `workoutGenerator.js` | Confirmed v1.12 (24 Jul, per BUILD-5 closure) — re-confirm | Small edit: remove dead `todaysWorkouts`/`workoutsGeneratedAt` writes in `generateDailyOptions()`, if doing this in-session |
| `sw.js` | Confirmed cache alongside-v179 (24 Jul) — re-confirm | Deploy LAST if `workoutGenerator.js` is touched. Cache bump + one-line changelog. If only `schema.md` changes (a docs file, not shipped to the app), `sw.js` doesn't need touching at all — confirm which is the case before assuming a deploy is needed. |

**Touch-once applies:** nothing else in the repo should be touched this session. If the `stats` check or the `hardBeforeSelections` naming check reveals something that needs a code fix beyond the dead-write removal above, log it rather than fixing it in-session — this is a documentation session, not a general bugfix session.

---

## 4. What "done" looks like, concretely

- `schema.md` v1.9 exists, documents all 179 live fields (or explicitly notes any deliberately left undocumented, with a reason), and is the only schema document remaining in project knowledge.
- The `stats` dormant-or-not question is answered with evidence, same rigour as the `exerciseFeedback` check.
- The `hardBeforeSelections`/`hardBeforeShownAt` naming question against Section 18 is resolved — either folded into existing documentation as the same fields, or confirmed genuinely new and documented as such.
- If the `workoutGenerator.js` dead-write removal is done: confirmed via `node --check`, `sw.js` bumped and deployed last, one-line changelog.
- The three-competing-documents problem is closed — old versions removed from project knowledge, `schema.md` v1.9 uploaded.

---

## 5. Session Start Checklist

- [ ] Search project knowledge for `alongside_master_schedule`, read the current version in full.
- [ ] Read `alongside_build4_reconciliation_28jul2026_v1.md` in full — this is the evidence base, don't re-derive it.
- [ ] Confirm current live version of `store.js` before treating v10 as current.
- [ ] If a GitHub fine-grained token is available for this session, `git clone` both repos for ground truth rather than relying on pasted files — faster and more reliable for a session this document-heavy. Otherwise, standard paste-based Ground Truth Rule applies.
- [ ] Every file produced carries a `DD Mon YYYY vN` header, verified against today's actual date.
- [ ] `sw.js` last (only if triggered — see Section 3), cache bump, one-line changelog entry.

---

## 6. What to bring back to the PM chat

A session handoff containing:
- Confirmed final version of `schema.md` (should be v1.9), and confirmation the other two competing documents were removed from project knowledge
- The `stats` dormant-or-not finding, with evidence
- The `hardBeforeSelections`/`hardBeforeShownAt` naming resolution
- Whether the `workoutGenerator.js` dead-write removal was done this session, and if so, confirmed live versions of `workoutGenerator.js` and `sw.js`
- Anything found along the way that wasn't expected — particularly if any of the 155 fields turn out to look like a genuinely dormant "specified but never built" feature, since that pattern has shown up before (empathy transfer) and is worth flagging explicitly rather than silently documenting as if it works

Paste that back here (or confirm uploaded to project knowledge) before the next planning conversation.

---

*Build New Habits · Alongside: Move · Session Blueprint · 30 Jul 2026 v1*
