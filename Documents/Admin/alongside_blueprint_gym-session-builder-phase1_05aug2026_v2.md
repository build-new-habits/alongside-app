# Alongside: Move — Build Session Blueprint
## 05 Aug 2026 v2

Build New Habits | Written by the PM chat, for a fresh build session. Paste this whole document as the first message in a new chat. **Supersedes `alongside_blueprint_gym-context-blend-warmup_04aug2026_v1.md`** — that version's Section 2 decisions have now been made (see below); this version reflects the real, fuller shape of what's needed, phased so tomorrow's session has a genuinely achievable scope.

---

## Session: Gym Session Builder — Phase 1 (tomorrow's work)

**The vision is bigger than one session's worth of building — split deliberately, not because the fuller version is wrong, but because half of it needs data that doesn't exist yet (Section 5).** This blueprint scopes only what's genuinely buildable tomorrow.

---

## 1. Decisions made — don't re-litigate these

**Routing:** Library's Upper/Lower/Strength/Core/Blend cards route into `session-builder.js`/`session-builder-ui.js`, not `gym-programme.js`. `gym-programme.js` stays untouched — it's Graeme's actual scripted programme, a different concern entirely.

**Location question:** asked once a session type is chosen (not tied to check-in — a morning check-in and an evening gym session shouldn't need to reconnect). Defaults to home every time, **not sticky** — no memory of yesterday's answer, so it can never go stale. One tap to override: *"Just one more thing — where are you for this?"*

**Warmup safety rule, non-negotiable:** no exercise that needs a warmup skips it by default. Nothing in Phase 1 should ever let someone land on a working set cold. This holds regardless of anything else built later.

---

## 2. What Phase 1 actually builds

### 2a. Proportional session control

Graeme wants control over how a session's time splits across elements (how much stretching vs. strength work), not just a fixed focus label. Concretely: extend `session-builder-ui.js`'s flow with a lightweight allocation step — doesn't need to be a fully custom slider system, could be as simple as 2-3 preset splits ("Mostly strength," "Balanced," "Mostly mobility") mapped to different proportions of `session-builder.js`'s `EXERCISE_POOLS` categories. Full custom percentage control is a nice-to-have, not required for Phase 1 — start with presets, this can grow later.

### 2b. Three build routes — mirror the working pattern, don't reinvent it

`conditionProgrammes.js` already has exactly this pattern, real and tested: `buildCoachProgramme()` (automatic), `buildRecommendedCandidates()` (coach suggests, wider pool, user picks — same underlying candidate logic, presented differently), and a genuine "build your own" path, plus real handling of `exercisePreferences` (avoid/less signals) and cross-programme exercise reuse via `_reuseFrom` annotation. **Read this file in full before building anything new** — the gym version should follow the same three-function shape, not a fresh design. Don't duplicate `conditionProgrammes.js`'s logic wholesale (it's condition-specific), but its *architecture* — three clearly-named build functions, shared candidate-filtering underneath, preference-aware — is the template.

### 2c. Blend option

Maps to `session-builder.js`'s existing `full` type — already exists, already free-tier available. Add the card to Library's gym category once 2a/2b's routing is live.

### 2d. Location question implementation

New lightweight step in `session-builder-ui.js`'s flow, shown once a type is picked, before duration/equipment. Simple boolean, defaults `home`, single tap to flip to `gym`. Feeds which of `homeEquipment`/`gymEquipment` the equipment step reads from — this is where the actual fix to `workoutGenerator.js`'s flat-merged-`equipment` problem lives, scoped down from "rewrite the shared function" to "session-builder passes the right scoped list explicitly."

### 2e. Small addition, low effort: Settings' Equipment panel shows nothing currently saved

Found while investigating this — `renderEquipmentPanel()` in `settings.js` is just a bare "Edit equipment" button with no summary of what's actually saved. Add a simple summary line (count of items per scope, or a short list) so Graeme (or any user) can glance at what's saved without stepping through the whole edit flow. Small, low-risk, worth including since it directly helps verify onboarding wasn't rushed without redoing it.

---

## 3. What Phase 1 deliberately does NOT include

**Smart same-day warmup skip logic — deferred, needs groundwork first, not part of tomorrow.** Checked directly: exercises have no muscle-group or body-area tagging anywhere in the data, and completed sessions are only logged at summary level (`type`, `durationMins`, `creditsEarned`) — not which specific exercises were done. Knowing "did I already warm up my posterior chain this morning" requires both of those to exist, and neither does. This is a real, separate data/content project — tagging the exercise database by muscle group/body area, and extending `logActivity()`'s entries to record which specific exercises were completed. Worth scoping properly once Phase 1 ships, not guessed at inside it.

**Full custom percentage-based session allocation** — start with presets (2a), build toward finer control later if the presets feel too coarse in practice.

---

## 4. Files — ground-truthed 05 Aug, re-confirm at session start regardless

| File | Live version confirmed 05 Aug | Role |
|---|---|---|
| `js/views/library.js` | v2 | Add Blend card, change Upper/Lower/Strength/Core routing |
| `js/views/session-builder-ui.js` | v3 | Add location step, allocation-preset step, pre-selected-type reading |
| `js/session-builder.js` | v1 (21 May — unchanged in months) | `SESSION_TYPES`/`EXERCISE_POOLS` — may need extending for allocation presets |
| `js/data/conditionProgrammes.js` | v3 | **Read-only reference** — the three-route pattern to mirror, not edit |
| `js/views/settings.js` | Confirm at session start | `renderEquipmentPanel()` — add saved-equipment summary (2e) |
| `js/data/workoutGenerator.js` | v1.13 | Only if 2d's scoped-equipment-read needs a shared-function change beyond what session-builder can handle on its own |
| `js/store.js` | v17 | Read-only expected — `homeEquipment`/`gymEquipment` fields already correct |
| `js/views/gym-programme.js` | v3 | **Not touched** |
| `sw.js` | cache `alongside-v220` | Deploy LAST, cache bump, one-line changelog |

**Touch-once:** if 2a's preset system or 2b's three-route build turns out to need more than a session's worth of work once actually started, stop and split rather than force-finishing — same discipline as every other multi-part session this week.

---

## 5. What "done" looks like for Phase 1

- Upper/Lower/Strength/Core/Blend all produce genuinely different sessions, confirmed by testing all five back to back
- The location question appears at the right moment, defaults correctly, and actually changes which equipment pool gets used — tested with real different home/gym equipment, not just code review
- At least one allocation preset works end-to-end
- All three build routes (coach builds / coach recommends / build your own) work, following `conditionProgrammes.js`'s pattern
- No session ever skips a needed warmup
- Settings' Equipment panel shows what's actually saved
- `gym-programme.js` unchanged, still works exactly as before

---

## 6. Session Start Checklist

- [ ] `Documents/Admin/master_schedule.md` in the repo is canonical — read in full first.
- [ ] Read `js/data/conditionProgrammes.js` in full before building 2b — the pattern to mirror, not reinvent.
- [ ] Re-confirm every live version in Section 4's table.
- [ ] Use the fine-grained GitHub token — regenerate if expired.
- [ ] Every file produced carries a `DD Mon YYYY vN` header.
- [ ] `node --check` on every changed `.js` file.
- [ ] `sw.js` last, cache bump, one-line changelog entry.

---

## 7. What to bring back to the PM chat

- On-device confirmation — this is exactly the category of thing that only ever breaks in real use (equipment-dependent, context-dependent)
- Whether the allocation-preset approach felt right in practice, or needs a follow-up toward finer control
- A recommendation on sequencing the deferred smart-warmup work (Section 3) — what the exercise-tagging project would actually need to look like, now that Phase 1's real usage patterns exist to inform it

---

*Build New Habits · Alongside: Move · Session Blueprint · 05 Aug 2026 v2*
