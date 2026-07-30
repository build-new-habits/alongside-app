# Session Handoff — BUILD-4 & Docs Reorganisation
## 30 Jul 2026 v1

Build New Habits | For the PM chat. Paste this whole document as the first message, or upload to project knowledge and reference it.

---

## What this session did

Two pieces of work, run back-to-back with a shared fine-grained GitHub token (7-day expiry, live in project knowledge):

1. **BUILD-4 closed** — schema reconciliation, per the 30 Jul blueprint.
2. **Documents reorganisation** — repo docs restructured into Live State / Admin / Business / Archive, and the Master Schedule's canonical home moved from project knowledge into the repo.

Both are pushed to `main` on `github.com/build-new-habits/alongside-app`.

---

## 1. BUILD-4 — outcome

**`schema.md` v1.9** written and pushed to `Documents/Live State/Schema.md`. Ground-truthed directly against live `store.js` v10 (not from prior schema docs). Supersedes and retires: `schema.md` v1.3, `schema_v1_7_15jun2026.md`, `schema_md.docx`, and the v1.5/v1.8 delta notes.

**Two corrections to the 28 Jul reconciliation note's own assumptions** — found by checking both read *and* write sides of each field, not just one:

| Field | Reconciliation note said | Ground truth |
|---|---|---|
| `todayIntensity` | Doesn't exist / dead | **Live.** Written by `checkin.js` + `coach-proposal.js`, read by `workoutGenerator.js`. |
| `exerciseFeedback` | Confirmed live | **Dormant.** Read by `applyFeedbackWeighting()`, but nothing anywhere writes it — no UI collects exercise-level feedback. Always falls back to `[]`. |

Other resolutions: `stats` confirmed not a store field at all (always a computed local var, never persisted — the "specified but never built" flag was a false alarm). `hardBeforeSelections`/`hardBeforeShownAt` confirmed to be `onboarding.hardBeforeSelections`/`onboarding.hardBeforeShownAt`, not a new pair.

**Code changes shipped:**
- `workoutGenerator.js` v1.12 → **v1.13** — removed dead `todaysWorkouts`/`workoutsGeneratedAt` writes and the orphaned `needsRegeneration()`/`getTodaysWorkouts()` function pair (confirmed uncalled anywhere in the app)
- `sw.js` v180 → **v181** — cache bump, deployed last, one-line changelog
- No behaviour change — this was dead code with zero live readers

**Found and logged, not fixed this session** (touch-once — outside the scheduled file list):
- `checkin-mini.js` still writes `workoutsGeneratedAt`, now fully orphaned since its only reader was removed. Small future cleanup.
- `activeProgramme.measurementsOptIn` — `mergeWithDefaults()` writes this from `strategicGoal.measurementsOptIn`, looks like a copy-paste artefact. `activeProgramme`'s own schema doesn't include this field. Worth a small fix.
- **`Changelog.md` is stale everywhere** — both the repo copy and the project-knowledge copy were byte-identical, dated 8 March 2026. Not actively maintained anywhere. Needs a decision: resume, or retire in favour of `git log`.
- Appendix A in `schema.md` v1.9 lists ~18 more fields found via grep but not individually triaged (`totalCredits` 18 refs, `lastWorkoutName`/`lastWorkoutCredits` 12 refs each, `quietMode` 10 refs, others lower). Recommend a dedicated pass before the Supabase schema design session — same method as the two corrections above (check every reader and writer, don't infer from reference count).

**Status tag:** 🟢 BUILD-4 — Schema Reconciliation — Completed, target was WB 3 Aug, closed 30 Jul.

---

## 2. Documents Reorganisation — outcome

Repo `Documents/` restructured into four folders. Full rationale and discussion in this chat's history if needed later.

- **`Live State/`** — docs that must track live code exactly: `Schema.md` (v1.9), `Changelog.md` (flagged stale, see above), `alongside_crisis_safeguarding_policy_23jul2026_v7.docx`
- **`Admin/`** — `master_schedule.md` is now the **canonical live copy**, overwritten on every update. `Admin/Past MS/` holds every superseded version by date (belt-and-suspenders against silent-edit risk, in addition to git history). `Admin/Templates/` holds reusable templates. Root of `Admin/` also holds this week's active blueprints and handoffs — not yet backfilled with the full historical archive (dozens more exist in project knowledge, back to March; flagged as a separate future job, not done this session).
- **`Business/`** — company/legal docs kept in the repo since no other copy exists elsewhere yet: business plan, setup guide, one-pager, portfolio, founding document, pricing model, HMRC status, privacy policy draft, ToS draft, IP/trademark sheet, solicitor letter.
- **`Archive/`** — stale March-2026-era architecture/spec docs and superseded handoffs. Kept, not deleted, per Graeme's preference — matches the existing Cleanup Task List philosophy but for docs instead of code.

**Rule going forward:** Master Schedule's single source of truth is now `Documents/Admin/master_schedule.md` in the repo, not project knowledge. If the two ever disagree, the repo wins. A project-knowledge copy can still be kept for searchability, but it's a snapshot, not the source.

**Not done — needs Graeme:**
- Project knowledge still holds the old master-schedule versions (v68–v77) and the four retired schema docs. Now that the repo has canonical copies, these should be removed from project knowledge. Claude can't delete project knowledge directly.
- Full historical backfill of `Admin/` (all handoffs/blueprints since March) — separate session if wanted.

---

## What to bring into the next Master Schedule update

- BUILD-4 → 🟢 Completed, 30 Jul
- New repo doc structure — note the canonical path change for future sessions' Session Start Checklist (search `Admin/master_schedule.md` in repo, or the project-knowledge snapshot, whichever is checked first — repo wins if they differ)
- Changelog maintenance — needs a decision, not yet actioned
- BUILD-4 Appendix A follow-up (field triage) — new candidate task before Supabase schema design
- Two small logged-not-fixed items (`checkin-mini.js` dead write, `activeProgramme.measurementsOptIn` anomaly) — candidates for a future small cleanup session

---

*Build New Habits · Alongside: Move · Session Handoff · 30 Jul 2026 v1*
