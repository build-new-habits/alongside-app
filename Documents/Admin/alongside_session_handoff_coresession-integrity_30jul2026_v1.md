# Alongside: Move — Session Handoff
## 30 Jul 2026 v1

Build New Habits | Core Session `currentActivityEntry` Data-Integrity Investigation — full session record

---

## 1. What this session was

Diagnose-first investigation into whether Core Session completions had ever logged real `activityLog` data — a trust-critical question surfaced during BUILD-3 (23 Jul) but not chased at the time. Blueprint: `alongside_blueprint_coresession-integrity_30jul2026_v2.md`.

**Status: fully closed.** Diagnosis complete, fixes shipped, full on-device test pass complete across all 7 affected session files.

---

## 2. Original question — answered

**Core Session was never silently failing to log.** `core-session.js` isn't reachable via `intention.js`'s activity list at all (core was never wired into that pattern), so no route ever set a genuine pending `currentActivityEntry` upstream. But `finaliseSession()`/`savePartialSession()` both had a defensive fallback that called `store.logActivity()` with real data regardless — completions were always writing correctly.

**A real bug was found instead, and fixed:** id reuse across back-to-back completions of the same activity type.

---

## 3. Fixes shipped (all confirmed on-device)

| File | Version | What changed |
|---|---|---|
| `core-session.js` | v3 → v4 | Stopped spreading stale `currentActivityEntry` into new writes — was causing two back-to-back Core Sessions to share one `activityLog` id |
| `yoga-session.js` | v4 → v5 | Same id-reuse fix, more surgical (yoga's pending entry is sometimes genuine, via `intention.js`) — distinguishes stale vs. real by presence of a `status` field |
| `yoga-session.js` | v5 → v6 | **Bug found during on-device testing:** `finaliseSession()` never called `rerender()` after `phase = "done"` — real completions left the screen frozen. One-line fix |
| `workout.js` | v5 → v6 | Gym had **zero** back-gesture exit protection (worse than the BUILD-3 gap it resembled) — no confirmation, no partial save, silent instant exit. Wired `mountSessionGuard()`, added `savePartialSession()`, replaced the on-screen Exit's blunt `confirm()` with a coach-voiced overlay |
| `css/components/session-guard.css` | v1 → v2 | Found while fixing gym: `.session-exit-*` (the on-screen Exit overlay) had **no CSS anywhere in the repo** — affected all 7 files using this pattern, not just gym. Fixed once, fixes all 7 |
| `store.js` | v10 → v11 | **Bug found during on-device testing:** `logActivity()`'s 2-minute dedupe window was silently rejecting two genuinely different real completions (83 seconds apart) — screen showed false success. Reduced to 10 seconds |
| `sw.js` | v181 → v186 | Six cache bumps, one per fix above, each deployed last |

---

## 4. On-device test results

Full pass run live on Graeme's phone, all steps confirmed:

- ✅ Core Session basic sanity (real completion → real `activityLog` entry)
- ✅ Core Session id-reuse (two back-to-back, different ids)
- ✅ Yoga id-reuse, both routes (via Intention, and direct-from-Library bypass)
- ✅ Gym exit-guard, back-gesture path
- ✅ Gym exit-guard, on-screen Exit button
- ✅ CSS render — individually screenshotted and confirmed for `core-session.js`, `yoga-session.js`, `running-session.js`, `workout.js`; Graeme's own quick pass confirmed `walk-session.js`, `swim-session.js`, `cycle-session.js` match

Two real bugs were found *during* testing, not caught by code review — both fixed and re-verified same session (see table above).

---

## 5. Deliberately NOT fixed — logged for future sessions

**`gym-programme.js`** (Graeme's real "Build Your Base" programme flow) — a third, separate gym-related file, untouched today. Found to have:
- No exit protection of any kind — no `mountSessionGuard()`, and the on-screen Exit button has no confirmation whatsoever, not even a browser `confirm()`
- Doesn't write to `activityLog` at all — uses a separate `progressLog` store key via `recordSession()`, architecturally different from every other session type

**Needs its own scoped session** — raises a genuine open product question (is `progressLog`-only tracking intentional, or a gap?) that shouldn't be guessed at and patched quietly.

**Silent failure on rejected `logActivity()` writes** — when a write is rejected (dedupe or otherwise), the session view still shows a false success screen with credits. Pre-existing, affects every activity type. Needs a coach-voiced message (Nurturing tier) — a content decision, not a code-only fix.

---

## 6. Smaller UI findings logged (not actioned)

Found incidentally while testing, unrelated to the fixes above:

1. **Screen styling inconsistency** across Intention (cards), Library (plain list), Coach Proposal (different card style, "RECOMMENDED" badge)
2. **Location can't be changed mid-flow** — once inside a Library location branch, no way to switch without exiting to the top
3. **Bottom nav bar covers content** on several screens — no buffer/safe-area padding above it
4. **Exit button position may conflict with Android edge back-gesture** — a tap near the screen edge briefly triggered the back-gesture card instead of the on-screen button's own card; not confirmed as a definite bug, worth a design look given the button's position is shared across all 7 files

---

## 7. Repo state

All changes pushed and confirmed live via the GitHub API (not just the raw-URL CDN, which lagged behind at points this session). Working tree clean, no uncommitted or unpushed work as of session close.

**Master schedule:** v80 → v88 across this session (9 versions), every intermediate version correctly archived to `Documents/Admin/Past MS/`. Canonical copy at `Documents/Admin/master_schedule.md` fully reflects everything above.

**Changelog:** `Documents/Live State/Changelog.md` updated with an entry for every fix.

**One process note worth flagging:** twice this session, an editing sequence briefly caused the wrong content to get archived under an old version number (edited the live file, then archived it before restoring the true prior version). Both times caught and corrected before pushing, by recovering the true prior version from git history first. Repo is correct, but noting it since it's exactly the kind of silent-corruption risk the archive discipline exists to catch.

---

## 8. Suggested next steps

1. Scope a session for `gym-programme.js` — likely needs a product decision first (progressLog vs activityLog) before any code
2. Scope a session for the silent-failure UX message — needs coach-voice content input
3. Fold the 4 UI findings into a future design-pass session, or address individually as convenient
4. No further action needed on the Core Session investigation itself — closed

---

*Build New Habits · Alongside: Move · Session Handoff · 30 Jul 2026 v1*
