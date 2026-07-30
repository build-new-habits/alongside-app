# Alongside: Move — Master Schedule
## 30 Jul 2026 v86

Build New Habits | Single source of truth for all build, business, website, and content tasks.
Supersedes `alongside_master_schedule_30jul2026_v85.md`. Remove v85 on upload.

**⚠️ Location:** the canonical copy of this document is `Documents/Admin/master_schedule.md` in the `alongside-app` repo, not project knowledge. If the repo and a project-knowledge copy ever disagree, the repo wins. This project-knowledge copy remains a searchable snapshot only. `Admin/Past MS/` in the repo holds every superseded version by date.

**This version's substantive changes:** A third, separate gym-related file found while testing `workout.js`'s exit-guard fix on-device — `gym-programme.js` (Graeme's real programme flow), not touched today. No exit protection of any kind (worse than `workout.js`'s pre-fix state), and doesn't write to `activityLog` at all — uses a separate `progressLog` store key via `recordSession()`. Deliberately not fixed same-session — raises a genuine open product question about intentional-vs-gap architecture. Logged as its own high-priority item needing a scoped session.

---

## ⭐ THIS WEEK — WB 27 Jul

- [x] ~~**Send solicitor pack to Alex**~~ — done, 24 Jul.
- [ ] **Safeguarding reviewer outreach** — still open.
- [ ] **HMRC sole trader registration** — untouched.
- [x] ~~**BUILD-5 fix session**~~ — 🟢 Closed, confirmed on-device 24 Jul. Three bugs, not one — see below.
- [ ] 🟡 **BUILD-3 on-device test pass** — code confirmed clean twice. Expected formality.
- [ ] **OUT-1 (reshaped) — Community validation reshaping session** — brief ready, not yet run.
- [ ] **Supabase account 2FA** — Graeme's own action, no session needed.
- [x] ~~**Thread scroll-bug audit**~~ — 🟢 **Done, 28 Jul.** Turned out to be mostly already resolved — see section below.
- [x] ~~**Meeting with Alex**~~ — 🟢 Held 29 Jul. Outcomes folded into v77 — see section below.
- [ ] **Friday: short review**.

## NEXT WEEK — WB 3 Aug

- [x] ~~**BUILD-4 (Schema Reconciliation)**~~ — 🟢 **Closed, 30 Jul, ahead of schedule.** `schema.md` v1.9 live in repo. See BUILD-4 Outcome section below.
- [x] ~~**Core Session `currentActivityEntry` data-integrity investigation**~~ — 🟢 **Closed, 30 Jul.** Never silently failing to log; genuine id-reuse bug found and fixed instead, in both `core-session.js` and (follow-up, same session) `yoga-session.js`. See Core Session Outcome section below.
- 🟠 **`gym-programme.js` — no exit protection, doesn't write to `activityLog` (new, 30 Jul, found on-device testing).** Graeme's real programme flow ("Build Your Base, Week 4, Session A") — separate file from `workout.js` (fixed today) and `core-session.js`. Confirmed: no `mountSessionGuard()` at all (back-gesture does nothing, no "Stay" option); on-screen Exit button has no confirmation of any kind, not even a browser `confirm()` — instant silent exit; completion writes to `progressLog` via `recordSession()`, never touches `activityLog` or `store.logActivity()` at all — architecturally separate from every other session type traced today. Needs its own scoped session, not a quick patch — open product question on whether `progressLog`-only tracking is intentional (older architecture) or a real gap. See Core Session Outcome section below for full trace detail.
- **Supabase schema design session** — now unblocked, BUILD-4 closed. Should factor in the BUILD-4 Appendix A follow-up (below) — worth deciding whether that follow-up runs first or alongside.
- **BUILD-4 Appendix A follow-up (new)** — ~18 fields found via grep during BUILD-4 but not individually triaged (`totalCredits`, `lastWorkoutName`/`lastWorkoutCredits`, `quietMode`, others). Same check-both-read-and-write method as the two corrections below. Recommended before Supabase schema design, not strictly blocking.
- BUILD-1's remaining sub-question
- BIZ-2, BIZ-3, INF-6, OUT-2, OUT-7
- **Org outreach category decision** (see Alex Meeting Outcomes below) — Graeme's call on whether workplace wellbeing reps and women's health groups join the Tier list, plus the "what's in it for them" messaging pass. Blocks OUT-2–OUT-8.

*Full six-week plan: Task Inventory doc, Section J (v5).*

---

## 🤝 Alex Meeting Outcomes — 29 Jul 2026

Captured in full in `alongside_alex_meeting_outcomes_29jul2026_v1.md`. Summary folded in here; that document remains the fuller record if detail is needed later.

**Legal — solicitor question refined.** Alex is reaching out to his solicitor contact with a specific framing: *"what's the minimum to be legally responsible?"* — with a working assumption that beta-stage requirements may be lighter than public-launch requirements. When the answer comes back, ask explicitly for the split rather than one combined answer. Relevant to BIZ-5, BIZ-6, BIZ-9 below.

**BIZ-9 (IP/trademark) — deprioritised.** Alex ran a logo unregistered for 20 years with no issue. Working position: don't worry about IP, especially the logo, not yet — if someone registers something similar first, the fallback is simply to change the logo. The product's actual IP (methodology, content, mechanics) is the genuinely distinct part, not the mark. Still worth a mention at the BIZ-5/6 solicitor consultation since it's a small add to an existing conversation, but no longer worth chasing separately.

**U18/safeguarding — genuinely open, not resolved.** Alex suggested "potentially we don't need to worry about U18." Graeme explained the safeguarding responsibility around collecting keywords from the mood meter; Alex understood the concern and will think on it and ask his solicitor. **This is not a decision — do not treat it as one.** Directly touches BUILD-9 (18+ age-gate), BIZ-6 (safeguarding sign-off), and the Crisis & Safeguarding Policy's own open item on parental notification (Section 9.4, unconfirmed as of v7). No schedule change until Alex/solicitor respond.

**Outreach — new categories suggested, plus a real gap surfaced.** Alex suggested workplaces with wellbeing reps, and women's health groups/communities, as additional outreach targets — he's thinking on this further too. He also raised the sharpest open question in the whole outreach effort: **"why would they do anything?"** — the current outreach messaging doesn't yet spell out the concrete benefit to the organisation itself. Two actions before any new-category outreach goes out: (1) Graeme's decision on whether these join the existing Tier list or run as a separate track, (2) a messaging pass answering "what's in it for them" per org type. This was already logged as "org outreach categories — undecided, blocks OUT-2–OUT-8" — still blocking, now with two named candidates and one clear open question instead of a vague undecided state.

**New task — LinkedIn presence.** Graeme wants a BNH business page and a personal profile, prompted by Alex's suggestion that LinkedIn plus direct email is a good channel for reaching both organisations and named individuals. Not yet scoped — Graeme has said he'll need help designing this properly. New item, no urgency attached yet, ready whenever Graeme wants to start.

**Deadlines — externally confirmed.** Alex agrees on two hard deadlines: **partner group/testing community + beta start, mid-September 2026**, and **public launch, January 2027** — the latter specifically because that's when people are most active in the "new year, new fitness" mindset, a named commercial rationale from Alex rather than just an internal target. This validates the dates already on this schedule; it doesn't resolve the underlying capacity risk (solo build/business load) flagged separately in Graeme's own meeting-prep review — both remain true at once.

---

## ✅ Core Session `currentActivityEntry` Data-Integrity Investigation: Closed, 30 Jul 2026

Full trace and reasoning in the session's own record (this PM chat, or `alongside_blueprint_coresession-integrity_30jul2026_v2.md` for the original brief). Summary:

**Diagnosis (code trace, no on-device pass yet — see below).** The blueprint's worry — that Core Session might never receive `currentActivityEntry` upstream and so might never have logged real completion data — was investigated by tracing every route into `core-session.js` (`library.js`, `home-threshold.js`, `today.js`, `coach-proposal.js` fallback options). **Confirmed: none of them set a pending entry.** Root structural reason: `intention.js`'s `ACTIVITIES` list doesn't include a "core" option at all — Core Session was never wired into that pattern. **But this was never actually blocking real data from being logged** — `finaliseSession()`/`savePartialSession()` both had a defensive fallback that called `store.logActivity()` with real `type`/`completedAt`/`status`/`exercisesCount`/`creditsEarned` regardless of whether a pending entry existed. So the original trust-critical worry doesn't hold: Core Session completions have been logging real data all along, just without the extra optional context fields (`sessionStart`, `energyBefore`, `duration`) that only exist when a session type is routed through `intention.js` — which core-session never was.

**A real bug was found and fixed instead.** Because `core-session.js` re-sets `currentActivityEntry` to its own completion result after every write (needed for `reflect.js`'s "How did that feel?" find-by-id flow), and both functions were spreading `pending` into new writes, **two back-to-back Core Sessions not separated by an `intention.js` visit could share one `activityLog` id** — the second completion's write would inherit the first's stale `id`. `core-session.js` v3 → v4: both functions now build the entry fresh, no `pending` spread, `logActivity()` always assigns a new id.

**Same bug confirmed and fixed in `yoga-session.js` as a same-session follow-up (on request).** Identical spread-pending pattern, and yoga is also reachable directly from `library.js`'s "Yoga / Pilates" card without going through `intention.js`. Fix had to be more surgical than core-session's, since yoga's `pending` *is* sometimes genuine (via `intention.js`): a pending entry carrying a `status` field is stale (every `logActivity()`-written entry has one; `intention.js`'s fresh entry never does), and is now discarded instead of spread — preserving legitimate upstream data when it exists, while still preventing id reuse. `yoga-session.js` v4 → v5.

**Code shipped:** `core-session.js` v3→v4, `yoga-session.js` v4→v5, `sw.js` v181→v183 (two bumps, one per fix, both deployed last). Changelog entries added for both. No schema change.

**Not yet done — logged as open:** on-device confirmation of a real completed Core Session (and ideally the back-to-back-completions scenario for both fixes) — the PM chat has no device access. Worth a quick check next time Graeme's on the phone; the fix is narrow enough that code-trace confidence is high, but "should work" is never the final gate per standing discipline.

**Also logged, not investigated this session:** whether `workout.js` (gym) has the same spread-pending pattern — out of this session's scope, not checked either way.

**Follow-up 1, same session (on request) — `workout.js` checked.** Traced `completeWorkout()`: it builds its `activityLog` entry fully from scratch every time (`date`, `completedAt`, `type`, `durationMins`, `moodAfter`, `isEvent`, `eventName`) and never reads `currentActivityEntry` beforehand — only sets it after writing, same "so reflect.js can find it" pattern as the others. **No spread-pending bug in gym.** Clean.

**Follow-up 2, same session (on request) — a different, more serious gap found while checking.** `workout.js` had **no `mountSessionGuard()` wiring at all.** Confirmed via `router.js`'s default popstate handler (only defers to session-guard state when a `sessionGuard` flag is present in history) — without it, a device back-gesture mid-workout navigated away **instantly, no confirmation card, no partial save**, `workoutProgress` left orphaned in the store. The on-screen Exit button's browser `confirm()` ("Your progress on this workout will be lost") was an honest, intentional discard-only design for that path — not itself a bug — but the back-gesture path had nothing at all. Worse than the gap BUILD-3 fixed in 6 other files (23 Jul): those all showed a confirmation card and just skipped the actual save; gym showed nothing.

Fixed to match `core-session.js` v4 / `yoga-session.js` v5's confirmed pattern: `mountSessionGuard()` wired, `savePartialSession()` added (built fresh, no `currentActivityEntry` spread — same discipline as the two id-reuse fixes above), on-screen Exit now shows a coach-voiced `showExitConfirm()` overlay instead of `confirm()`, `cleanupWorkout()` now calls `dismountSessionGuard()`. `workout.js` v5 → v6.

**Follow-up 3, found while fixing Follow-up 2 — missing CSS across 7 files, not just gym.** `.session-exit-overlay`/`.session-exit-card` (the on-screen overlay's own CSS — separate from `.sg-*`, which only covers the back-gesture card) had **no styles anywhere in the repo.** Affected all 7 files using this local `showExitConfirm()` pattern — `core-session.js`, `yoga-session.js`, `cycle-session.js`, `running-session.js`, `swim-session.js`, `walk-session.js` (all since BUILD-3, 23 Jul) — not a workout.js-only issue, it was rendering unstyled everywhere it existed. Fixed in `css/components/session-guard.css` v1 → v2, matching the existing `.sg-*` card's visual language exactly.

**Final code shipped this session, in full:** `core-session.js` v3→v4, `yoga-session.js` v4→v5, `workout.js` v5→v6, `css/components/session-guard.css` v1→v2, `sw.js` v181→v184 (four bumps total, each deployed last). Changelog fully updated. No schema changes.

**Still open — on-device confirmation** for all three JS fixes and the CSS render, plus the original id-reuse scenario, plus the newly-fixed gym back-gesture path. The PM chat has no device access. High code-trace confidence throughout, but this is the one remaining gate per standing discipline.

**On-device testing, 30 Jul 2026 (Graeme, on the phone) — Core Session basic sanity confirmed.** Real completion via Library → "At home" → Core → Stability → 15 min → 4 exercises produced a genuine `activityLog` entry: `type: "core-session"`, `status: "completed"`, `exercisesCount: 4`, `creditsEarned: 80` — matches the on-screen "+80 credits earned" exactly. First direct on-device confirmation of the original diagnosis. Remaining test steps (id-reuse scenarios, gym exit-guard, CSS visual check) not yet run.

Two new UI/UX findings surfaced incidentally while testing, unrelated to the Core Session fixes themselves — logged here, not actioned:

- **Screen styling inconsistency.** Three different visual styles across the ways into a session: Intention screen (card-based options), Library (plain text list), Coach Proposal (different card style again, with a "RECOMMENDED" badge). Not a bug, but a real inconsistency worth a design pass at some point.
- **Location can't be changed mid-flow.** Once inside Library's "At home" branch (or any location branch), there's no way to switch to a different location (e.g. decide to go to the gym instead) without exiting all the way back to the top of Library. Minor friction, not blocking.
- **Bottom nav bar covers content on multiple screens.** No buffer space above the persistent bottom nav bar — content (buttons, cards) runs right up against it or gets clipped underneath, on several screens (seen on Intention and Yoga's duration/focus pickers at minimum, likely wider than just those two). Needs a consistent bottom padding/safe-area fix across affected views.

**Yoga stuck-screen bug — found and fixed during this same on-device test run.** Real bug, unrelated to any of today's earlier fixes: completing a genuine yoga session via "Finish practice" left the screen frozen on the last pose. Root cause: `yoga-session.js`'s `finaliseSession()` set `phase = "done"` but never called `rerender()` — confirmed by direct comparison with `core-session.js`'s equivalent function, which already had both lines. The completion data itself was always correct (confirmed: `energyBefore: 7`, `creditsEarned: 120` on the first genuine attempt) — only the screen transition was broken, and a second tap (understandable, since the screen looked unresponsive) correctly triggered `logActivity()`'s dedupe guard rather than writing a duplicate. Fixed: one line added (`rerender();`). `yoga-session.js` v5 → v6, `sw.js` v184 → v185. **Re-tested on-device immediately after the fix — confirmed working:** "Practice done" screen now shows correctly, `+100 credits earned` on screen matches `creditsEarned: 100` in the new activityLog entry (`id: 5k2k`).

**Dedupe window fix — found continuing on-device testing, Route B (yoga direct from Library, no Intention visit).** Two genuinely different, real yoga completions 83 seconds apart were silently rejected by `logActivity()`'s dedupe guard as a duplicate — `finaliseSession()` still showed the normal "Practice done" success screen with credits, but the completion was never actually written to `activityLog`. Root cause: the guard's 2-minute default window was built to catch near-instantaneous accidental double-fires (a double-tap, or the stuck-screen re-tap bug just fixed above) — those happen within a second or two, not two minutes. Graeme's read, which the trace confirmed: two real, distinct full-session completions of the same type within 2 minutes of each other is realistically a testing-only scenario, not something a genuine user would trigger. Fixed: `store.js` v10 → v11, `dedupeWindowMs` default reduced to 10 seconds — still comfortably covers a slow-rendering device re-tap, no longer catches genuinely different completions. No caller overrides this default, so the fix applies uniformly across every activity type (gym, core, yoga, run, walk, swim, cycle). `sw.js` v185 → v186.

**Separately flagged, deliberately not fixed — silent failure on rejected writes.** When `logActivity()` rejects a write (dedupe or otherwise), the calling session view has no way of knowing and still shows its normal success screen with credits. This is a pre-existing gap across every activity type using the shared write path, not new. Needs a coach-voiced message (Nurturing tier) — a content/UX decision, not a code-only fix — so deliberately not invented on the spot. Needs its own scoped session.

**A third, separate gym-related file found while testing `workout.js`'s exit-guard fix — `gym-programme.js`, not touched today, needs its own session.** Graeme's real programme flow ("Build Your Base, Week 4, Session A") turned out to be a completely different file from both `workout.js` (fixed today) and `core-session.js` — multi-exercise-card layout with individual "Done" toggles and a single "Session done" bar, rather than the one-exercise-at-a-time flow the other two use. Traced on request:
- **No exit protection of any kind.** No `mountSessionGuard()` import at all — confirmed via grep, not present anywhere in the file. Back-gesture does nothing protective (matches Graeme's on-device report — no "Stay" option, it just exits).
- **The on-screen Exit button is worse than `workout.js`'s pre-fix state.** No confirmation of any kind, not even a browser `confirm()` — a single-line handler: tap Exit → `router.navigate('today')` → gone instantly.
- **Doesn't write to `activityLog` at all.** Finishing a session calls `recordSession()` (from `programmeEngine.js`), which writes to a completely different store key, `progressLog` — never calls `store.logActivity()`, never touches `activityLog`. This is architecturally separate from every other session type traced today (all of which converged on the shared `logActivity()` path via BUILD-3/B3-3).

**Not fixed — this needs its own scoped session, not a same-session patch.** Unlike the other fixes today, this raises a genuine open product question: is `progressLog`-only tracking for structured programmes intentional (a deliberate, older architecture separate from the ad-hoc `activityLog` types) or a real gap that should also feed `activityLog`? That's not something to guess at and patch quietly — needs a decision first.

---

## ✅ BUILD-4 — Schema Reconciliation: Closed, 30 Jul 2026

Full detail in `alongside_session_handoff_BUILD4_docsreorg_30jul2026_v1.md` (or the handoff pasted into this chat). Summary:

**`schema.md` v1.9** written and pushed to `Documents/Live State/Schema.md`, ground-truthed directly against live `store.js` v10. Supersedes and retires `schema.md` v1.3, `schema_v1_7_15jun2026.md`, `schema_md.docx`, and the v1.5/v1.8 delta notes — **all four should be removed from project knowledge** (Claude can't do this directly; needs Graeme to delete via the UI).

**Two corrections to the 28 Jul reconciliation note itself** — found by checking both read *and* write sides of each field, not inferring from one side alone:
- `todayIntensity` — previously assumed dead. **Actually live**: written by `checkin.js` + `coach-proposal.js`, read by `workoutGenerator.js`.
- `exerciseFeedback` — previously confirmed live (28 Jul pass). **Actually dormant**: `applyFeedbackWeighting()` reads it, but nothing writes it anywhere — no UI collects exercise-level feedback, always falls back to `[]`. This is the same "specified but never built" pattern as empathy transfer — worth remembering as a recurring failure mode, not a one-off.

Also resolved: `stats` isn't a store field at all (computed local var, never persisted — false alarm). `hardBeforeSelections`/`hardBeforeShownAt` confirmed to be the existing `onboarding.*` fields, not a new pair.

**Code shipped:** `workoutGenerator.js` v1.12→v1.13 (removed dead `todaysWorkouts`/`workoutsGeneratedAt` writes and the orphaned `needsRegeneration()`/`getTodaysWorkouts()` pair — confirmed uncalled anywhere). `sw.js` v180→v181, cache bump, deployed last. No behaviour change — dead code, zero live readers.

**Logged, not fixed this session (touch-once):**
- `checkin-mini.js` still writes `workoutsGeneratedAt`, now fully orphaned since its only reader was just removed.
- `activeProgramme.measurementsOptIn` — written via a `mergeWithDefaults()` copy-paste artefact from `strategicGoal.measurementsOptIn`; not part of `activeProgramme`'s own schema.
- `Changelog.md` confirmed stale in both repo and project knowledge (byte-identical, dated 8 Mar 2026). **Decided 30 Jul — resume maintenance.** A new entry for this session's BUILD-4 work has been added to `Documents/Live State/Changelog.md`, re-establishing the practice from here forward. **Full historical backfill for the Mar–Jul 2026 gap is explicitly not part of this decision** — that's a separate, larger job (many versions of `workoutGenerator.js`, `coach-proposal.js`, `sw.js` etc. shipped in that window without a changelog entry) and would need its own scoped session if wanted.

---

## 📁 Repo Documents Reorganisation — 30 Jul 2026

`alongside-app` repo's `Documents/` folder restructured into four folders, run in the same session as BUILD-4:

- **`Live State/`** — must track live code exactly: `Schema.md` (v1.9), `Changelog.md` (**maintenance resumed 30 Jul** — see BUILD-4 outcome above), `alongside_crisis_safeguarding_policy_23jul2026_v7.docx`.
- **`Admin/`** — `master_schedule.md` is now the **canonical live copy of this document** (see the location-change note at the top of this file). `Admin/Past MS/` holds every superseded version by date. `Admin/Templates/` holds reusable templates. This week's active blueprints/handoffs also live at `Admin/` root — **not yet backfilled with the historical archive** (dozens more exist in project knowledge back to March; a separate future job, not done this session).
- **`Business/`** — company/legal docs kept in the repo since no other copy exists elsewhere: business plan, setup guide, one-pager, portfolio, founding document, pricing model, HMRC status, privacy policy draft, ToS draft, IP/trademark sheet, solicitor letter.
- **`Archive/`** — stale March-2026-era architecture/spec docs and superseded handoffs. Kept, not deleted, matching the existing Cleanup Task List philosophy but for docs instead of code.

**Still needs Graeme:** remove the now-superseded master-schedule versions (v68–v78) and the four retired schema docs from project knowledge — Claude can't delete project knowledge entries directly.

---

## BUILD-5 — full resolution, 24 Jul 2026 (unchanged from v76/v77, retained for reference)

**Fix 1** — `workoutGenerator.js` v1.9→v1.10. `applyDurationCap()` only checked total session length against a fixed per-focus ceiling, never against the user's declared `availableTime`. Added `AVAILABLE_TIME_WINDOW_MINUTES`, capped against `min(focusCap, windowCap)`.

**Fix 2** — `coach-proposal.js` v11→v12. `_getAvailableTime()` read from fields `checkin.js` never actually wrote to, silently fell through to a hardcoded `30`, then wrote that back over the correct value before generation ran. Fixed to read `store.get('availableTime')` directly.

**Fix 3** — `workoutGenerator.js` v1.11→v1.12. With 1 and 2 live, sessions started undershooting instead. `selectExercises()` picked a fixed small exercise count regardless of real per-exercise duration. Fixed with a duration-aware fill loop, bounded by `MAIN_FILL_CEILING`. Verified in a Node simulation, then confirmed on-device: 3 tests, 3 results around 20 min.

**Cache bumps:** `sw.js` v176→v177→v178→v179.

**Residual, logged not fixed:** short-exercise focus types still land under target on average in simulation (~14 min vs a 20-min ask for strength/mobility). Graeme confirmed on-device result as good enough; revisit only if it resurfaces as a real complaint.

---

## B3-2-Test follow-ups — 2 items

1. ~~Duplicate `activityLog` entries~~ — resolved (B3-3).
2. ~~Breathing doesn't route to reflect screen~~ — resolved, confirmed by design.
3. **Check-in feeling-word chip row overflow/wrapping** — still open, untouched. Cosmetic.
4. 🟡 **Reflect textarea sizing/contrast** — code confirmed correct (contrast 11.87:1). Provisionally closed pending one on-device cache-clear confirmation.

---

## 🧹 Cleanup Task List — deferred to app sign-off, not actioned now

**Purpose:** things found along the way that are safely inert — not blocking anything, causing no active harm sitting there — worth a final pass once the whole app build is complete, rather than either forgetting them or interrupting a working session to chase something low-stakes. Nothing here gets actioned until Graeme explicitly says "we're at sign-off, let's clear this."

| Item | Found | What it is | Why it can wait |
|------|-------|------------|------------------|
| `js/data/exercises/index.js` | 28 Jul | Orphaned duplicate of `js/data/exercises.js` — identical content, only import paths differ (confirmed via diff). No direct or directory-style imports found anywhere in the codebase, checked twice. | Not imported, causing no active harm. Real risk is future confusion (someone edits the wrong copy), not present danger. Worth removing at sign-off via the GitHub web UI, not urgent today. |

**How to add to this list going forward:** any session that finds something safely inert — old code, superseded docs, an orphaned file, a deprecated pattern nothing depends on — logs it here instead of either fixing it mid-session (scope creep) or letting it quietly vanish. One line: what it is, why it's safe to leave, found-date.

**At sign-off:** work through top to bottom, re-confirm each item is still genuinely inert (don't assume nothing changed since logging), then remove.

---

## One-Page Dashboard — 30 Jul 2026

| Stream | Current position | Immediate next action | Blocker? |
|--------|-----------------|----------------------|----------|
| Product — BUILD-1 (Nav-gap fix) | 🟡 Core mechanism confirmed. Sub-question open. | Quick confirmation. | None. |
| Product — BUILD-2 (Proposal-loop fix) | 🟢 Closed 23 Jul. | — | None. |
| Product — BUILD-3 (Session-view audit) | 🟡 Code confirmed clean twice. Not yet on-device tested. | On-device pass, expected formality. | Needs phone only. |
| Product — BUILD-4 (Schema Reconciliation) | 🟢 **Closed, 30 Jul.** `schema.md` v1.9 live in repo. Two corrections to the 28 Jul note itself found (`todayIntensity` live not dead, `exerciseFeedback` dormant not live). | None — see Appendix A follow-up as a new, separate item. | None. |
| Product — BUILD-5 (available-time bug) | 🟢 Closed, confirmed on-device 24 Jul. Three fixes. | None. | None. |
| Product — BUILD-6 | Confirmed non-crashing. Decision still open, low priority. | Graeme's call. | Not booked. |
| Product — BUILD-9 (18+ age-gate) | Not yet scoped. **U18 safeguarding position genuinely open** — Alex suggested it may not be needed, unconfirmed, pending his solicitor (29 Jul). | Hold scoping until Alex/solicitor respond. | Waiting on Alex. |
| Product — Thread scroll-bug audit | 🟢 Closed, 28 Jul. 2 of 3 files already fixed, third checked and cleared. | None. | None. |
| Product — B3-2-Test follow-ups | 2 items remain (chip overflow, reflect.js cache-clear confirmation). | Fold into a future session. | Not booked, low priority. |
| Product — Core Session `currentActivityEntry` data-integrity question | 🟢 **Closed, 30 Jul, with two same-session follow-ups.** Never silently failing to log — id-reuse bug fixed in `core-session.js` v4 and `yoga-session.js` v5. `workout.js` checked (clean on this pattern) but found with a more serious, separate gap — zero back-gesture exit protection — fixed as `workout.js` v6, which also surfaced missing `.session-exit-*` CSS affecting all 7 files, fixed in `session-guard.css` v2. See Core Session Outcome section above. | On-device confirmation, next time on the phone. | None hard — code-trace confidence high throughout. |
| Product — BUILD-4 Appendix A follow-up | New, 30 Jul. ~18 fields found via grep during BUILD-4, not individually triaged. | Dedicated pass, same read+write check method. | Recommended before Supabase schema design, not strictly blocking. |
| Product/Infra — Supabase schema design | Scoped in conversation 27 Jul. **Unblocked — BUILD-4 closed.** | Run — decide whether Appendix A follow-up runs first. | None hard; Appendix A recommended first. |
| Website — Home/Products/Community/Impact | 🟢 Confirmed clean. | None unless BUILD-9 triggers a copy pass. | None. |
| Outreach — OUT-1 (reshaped) | Brief drafted, not yet run. | Run the session. | Blocks OUT-2–OUT-7. |
| Outreach — org category decision | New, 29 Jul. Alex suggested workplace wellbeing reps and women's health groups; "why would they do anything?" messaging gap identified. | Graeme's decision + messaging pass. | Blocks OUT-2–OUT-8. |
| Business — BIZ-9 (IP/trademark) | Deprioritised, 29 Jul, per Alex. No urgency to register logo/IP now. | Raise briefly at BIZ-5/6 solicitor consultation only. | None urgent. |
| Business — solicitor question framing | New, 29 Jul. Ask for beta-minimum vs launch-minimum legal requirements, not one combined answer, when Alex's solicitor responds. | Awaiting Alex/solicitor. | Awaiting Alex. |
| Marketing — LinkedIn presence | New, unscoped, 29 Jul. BNH business page + Graeme's personal profile. | Scope whenever Graeme's ready to start. | Not booked. |
| Infra — INF-7 (breach response process) | Reconfirmed open, 27 Jul. No procedure written. | Write short internal procedure. | Same trigger as BIZ-3. |
| Infra — Supabase account 2FA | New, 27 Jul. | Graeme's own action. | None. |
| Infra — GitHub fine-grained token workflow | 🟢 **Live, 30 Jul.** Token in project knowledge, 7-day expiry, already used for BUILD-4 + docs reorg. | Regenerate before expiry when needed. | None. |
| Infra/Admin — Changelog.md maintenance | 🟢 **Decided, 30 Jul — resume.** New entry added for BUILD-4 work, re-establishing the practice. | Keep it current from every future session onward. | None. |
| Infra/Admin — Changelog.md historical backfill (Mar–Jul gap) | New, 30 Jul. Explicitly separate from the resume decision above — not assumed as part of it. | Graeme's call whether this is worth a dedicated session. | Not booked, no urgency. |
| Cleanup — `checkin-mini.js` orphaned `workoutsGeneratedAt` write | Logged, 30 Jul. Now fully orphaned (its only reader removed this session). | Sign-off only. | None, deliberately deferred. |
| Cleanup — `activeProgramme.measurementsOptIn` anomaly | Logged, 30 Jul. Copy-paste artefact from `strategicGoal.measurementsOptIn` via `mergeWithDefaults()`. | Small fix, not urgent. | None, deliberately deferred. |
| Cleanup — `exercises/index.js` | Logged, 28 Jul. | Sign-off only. | None, deliberately deferred. |
| UI — Screen styling inconsistency (Intention / Library / Coach Proposal) | New, 30 Jul. Found during on-device testing. Three different visual styles across the ways into a session. | Design pass, not scoped. | Not booked, no urgency. |
| UI — Location not changeable mid-flow | New, 30 Jul. Found during on-device testing. Once inside a Library location branch, can't switch location without exiting to top of Library. | Minor UX fix, not scoped. | Not booked, no urgency. |
| UI — Bottom nav bar covers content, no buffer | New, 30 Jul. Found during on-device testing. No padding above the persistent bottom nav on several screens (Intention, Yoga pickers at minimum) — content runs against or under it. | Consistent bottom-padding/safe-area fix across affected views, not scoped. | Not booked, no urgency. |
| Product — Yoga stuck-screen bug (`finaliseSession()` missing `rerender()`) | 🟢 **Found and fixed, 30 Jul, on-device.** Real completion left the screen frozen on the last pose — data was always correct, only the screen transition was broken. Fixed `yoga-session.js` v5→v6, re-tested on-device immediately, confirmed working. | None — closed. | None. |
| Product — Dedupe window too wide (`logActivity()`) | 🟢 **Found and fixed, 30 Jul, on-device.** Two genuine, distinct completions 83 seconds apart were silently rejected as a duplicate — screen showed false success. Reduced `dedupeWindowMs` 2min→10sec, `store.js` v10→v11. Applies to all activity types. | None — closed. | None. |
| Product — Silent failure on rejected `logActivity()` writes | 🟠 **New, 30 Jul.** Found alongside the dedupe fix above. When a write is rejected, the session view still shows a false success screen — no indication to the user. Needs a coach-voiced message (Nurturing tier), a content/UX decision. Deliberately not fixed on the spot. | Scope a dedicated session. | Not booked, no urgency but a real trust gap. |
| Product — `gym-programme.js`: no exit protection, no `activityLog` write | 🟠 **New, 30 Jul, found on-device testing.** Graeme's real programme flow. No `mountSessionGuard()` at all (worse than `workout.js`'s pre-fix state — Exit has zero confirmation, not even `confirm()`). Doesn't write to `activityLog` — uses `progressLog` via `recordSession()` instead, architecturally separate from everything else. | Own scoped session — needs a product decision on `progressLog` vs `activityLog` first, not a quick patch. | Not booked. High priority given this is the real programme flow, but deliberately not rushed. |
| Admin — project knowledge cleanup | New, 30 Jul. Superseded master-schedule versions (v68–v78) and 4 retired schema docs need removing from project knowledge — Claude can't delete these directly. | Graeme, via the UI, whenever convenient. | None. |
| Admin — `Admin/` historical backfill | New, 30 Jul. Repo's `Admin/` folder has this week's blueprints/handoffs only; dozens more exist in project knowledge back to March, not yet moved. | Separate future session if wanted. | Not booked, no urgency. |

*All standing rules, Stream A/C/D/E detail not listed above are unchanged from v71–v78 — see those versions for full detail.*

---

## 🔑 Master Schedule → Repo Workflow — decided 30 Jul 2026

Graeme provided the fine-grained GitHub token directly in the PM chat so schedule updates can be pushed straight to the repo, rather than downloaded and uploaded manually via the GitHub web UI each time. From this version forward: the PM chat, at session close, writes the new version, pushes it to `Documents/Admin/master_schedule.md`, moves the previous version into `Documents/Admin/Past MS/`, and removes the superseded copy from project knowledge search results by uploading the new snapshot over it (the old project-knowledge entries themselves still need manual deletion by Graeme — Claude can't do that directly).

**Security note, worth having on record:** this token now lives in the PM chat's own conversation history, not just a build chat's. That's a wider exposure surface than the original "paste into the build chat that needs it" plan — mitigated by the same short expiry (7 days) already in place. Worth revisiting once the product's past the rapid-build phase, same as the original project-knowledge token storage trade-off already logged.

---

*Build New Habits · Alongside: Move · Master Schedule · 30 Jul 2026 v86*
