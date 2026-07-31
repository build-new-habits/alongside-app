# Alongside: Move — Build Session Blueprint
## 31 Jul 2026 v1

Build New Habits | Written by the PM chat, for a fresh build chat to execute independently (or run directly via repo access). Paste this whole document as the first message in a new chat.

---

## Session: BUILD-4 Appendix A — Field Triage Follow-Up

**Focus:** Classify the 18 fields listed in `Documents/Live State/Schema.md` v1.9 Appendix A as live, dead, or mis-named — same method that already caught two wrong assumptions during BUILD-4 itself (`todayIntensity`, `exerciseFeedback`). This is a documentation-accuracy session, same shape as BUILD-4, not a bugfix session — don't fix anything found along the way, log it instead (touch-once).

**Why now:** recommended before Supabase schema design so the new backend isn't designed against a schema with 18 known unknowns. Not a hard blocker — Graeme can choose to run Supabase design first if he prefers — but this is the smaller, lower-risk session and clears the ground.

---

## 1. The method — don't shortcut this

BUILD-4's own reconciliation note assumed two fields' status from partial evidence and got both wrong (`todayIntensity` looked dead but was live; `exerciseFeedback` looked live but was dormant). The lesson, stated explicitly in `Schema.md` v1.9: **a grep hit alone doesn't tell you whether a field is functioning — check every reader AND every writer, individually, per field.** Reference count is a rough prioritisation signal only, not a conclusion. Don't infer from count alone for any field in the table below, even the high-count ones.

For each field: `grep -rn "fieldName" js/` (and `css/` where relevant, though these are `store.js` fields so unlikely), then classify:
- **Live** — has both a real writer and a real reader in the current UI flow
- **Dormant** — has a reader but no writer (or vice versa) — document as such, matching the `exerciseFeedback` pattern
- **Dead** — no genuine reader or writer, only stale references (comments, unused imports) — candidate for removal, but removal itself needs Graeme's sign-off per file, don't remove unilaterally in this session
- **Naming overlap** — turns out to be the same underlying data as an already-documented field under a different name — resolve to the canonical name, don't document twice

---

## 2. The full field list — ground-truthed from live `Schema.md` v1.9 Appendix A today

| Field | Approx. references | Priority note |
|---|---|---|
| `totalCredits` | 18 | **Check first** — highest count, likely live and significant. Also **check for overlap with `community.credits`** — may be duplicated data under two names. |
| `lastWorkoutName` | 12 | Check together with `lastWorkoutCredits` — likely written at the same call site. |
| `lastWorkoutCredits` | 12 | See above. |
| `quietMode` | 10 | Check third — worth prioritising per the schema note. |
| `lastMilestone` | 5 | **Check for overlap** with `activeProgramme.milestones` or `checkin.lastMilestoneNoticed` before assuming genuinely new — the schema note flags this explicitly. |
| `prescribedSessionProgress` | 5 | Not yet investigated. |
| `returnVisit` | 5 | Not yet investigated. |
| `homeEquipment` | 4 | **Check for overlap** with the existing `equipment` array — may be a gym-programme-specific subset rather than a separate concept. |
| `workoutProgress` | 4 | Not yet investigated. Note: `workout.js` already reads/writes a `workoutProgress` key as part of its own session-tracking (confirmed today while tracing `gym-programme.js`, Section 3 of this doc) — check this is the same field, not a second unrelated one with a name collision. |
| `gymEquipment` | 3 | **Check for overlap** with `equipment`, same as `homeEquipment`. |
| `morningProgrammeWeek` | 3 | **Check for overlap** with `gymProgrammeWeek` — likely a naming variant of the same programme-week tracking. |
| `proposalBias` | 3 | Not yet investigated. |
| `cycleLength` | 2 | **Already resolved** — confirmed always falls back to default `28`, never written anywhere. Already documented under Profile in `Schema.md` v1.9. No action needed, listed here only for completeness — skip. |
| `workoutHistory` | 2 | **Check for overlap** with `activityLog` and/or `progressLog` (the field investigated in the 31 Jul `gym-programme.js` session) — three separate history-shaped fields would be worth knowing about explicitly if genuinely distinct. |
| `consentAt` | 1 | Not yet investigated. |
| `consentGiven` | 1 | Not yet investigated. Likely paired with `consentAt` — check together. |
| `todayEnergy` | 1 | **Check for overlap** with `lastCheckin.energy`, which is confirmed live and read elsewhere (seen directly in `gym-programme.js` v3 today: `store.get('lastCheckin.energy')`). |
| `userTier` | 1 | **Check for overlap** with `tier` (confirmed live, read in `settings.js`, `progress.js`, `coach-proposal.js`) — likely a naming duplicate, worth resolving before Supabase auth design assigns a canonical tier field. |
| `usingGeneratedSession` | 1 | Not yet investigated. |

**Six of these eighteen already have a specific overlap to check first** (marked above) — start there rather than working top-to-bottom by reference count alone, since resolving an overlap can eliminate two rows at once.

---

## 3. One piece of ground-truth from today, worth having before this session starts

While tracing `gym-programme.js` (31 Jul session), confirmed: `progressLog`, `activityLog`, and `workoutProgress` are three genuinely separate, distinct mechanisms already in live use — not a naming confusion. `workoutHistory` in this table is a fourth, unclarified name in similar territory. Worth resolving explicitly whether it's a fourth genuinely separate thing, an old name for one of the other three, or dead.

---

## 4. Files this session will touch

| File | Action needed |
|---|---|
| `Documents/Live State/Schema.md` | Main deliverable — update Appendix A with a resolved status per field, moving resolved fields into the main documented sections where they belong (same pattern as `todayIntensity`/`exerciseFeedback` in v1.9). Version bump to v1.10. |
| `js/store.js` | Read-only for classification. Only touch if a field is confirmed dead AND Graeme has explicitly signed off on removing it in this session — otherwise log as a Cleanup Task List candidate instead, same as BUILD-4's own `checkin-mini.js`/`measurementsOptIn` findings. |
| Any file identified as a genuine reader/writer during triage | Read-only — this is a classification session, not a refactor. |

**Touch-once applies.** If triage surfaces something that looks like an active bug (not just undocumented), log it for its own session rather than fixing it here — same discipline as BUILD-4 and the Core Session investigation.

---

## 5. What "done" looks like

- All 18 fields in the table above have a resolved classification (live/dormant/dead/naming-overlap), each with the specific evidence (reader + writer file/line references), not just a guess.
- `Schema.md` updated to v1.10, every resolved field documented in its proper section, Appendix A either cleared or reduced to genuinely-unresolved items only.
- Six flagged overlaps specifically addressed — either confirmed as duplicates (canonical name chosen, other name marked deprecated/candidate-for-removal) or confirmed genuinely distinct.
- Any newly-found dead code or anomalies logged to the Cleanup Task List in the master schedule, not fixed in-session.

---

## 6. Session Start Checklist

- [ ] `Documents/Admin/master_schedule.md` in the repo is canonical — read in full first.
- [ ] Read `Documents/Live State/Schema.md` v1.9 in full, especially the BUILD-4 outcome note and Appendix A — this blueprint's table above is a snapshot, re-confirm nothing's changed since 31 Jul.
- [ ] Confirm current live version of `store.js` before starting (should still be v11, 30 Jul — re-confirm, don't assume).
- [ ] Use the fine-grained GitHub token (regenerate if expired) — `git clone` for ground truth, commit/push directly.
- [ ] Every file produced carries a `DD Mon YYYY vN` header, verified against today's actual date.
- [ ] `node --check` on any `.js` file touched (unlikely this session, but confirm regardless if anything changes).

---

## 7. What to bring back to the PM chat

- Final classification table for all 18 fields, with evidence
- Confirmed `Schema.md` v1.10
- Resolution for each of the six flagged overlaps
- Anything logged to the Cleanup Task List
- Explicit confirmation of whether this session found anything that should change the Supabase schema design session's scope

---

*Build New Habits · Alongside: Move · Session Blueprint · 31 Jul 2026 v1*
