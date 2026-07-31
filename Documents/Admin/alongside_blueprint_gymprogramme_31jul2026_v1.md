# Alongside: Move — Build Session Blueprint
## 31 Jul 2026 v1

Build New Habits | Written by the PM chat, for a fresh build chat to execute independently. Paste this whole document as the first message in a new chat. **This blueprint was written with full repo access (fine-grained token) — every finding below is ground-truthed against live code, not inferred from the master schedule note that originated it.**

---

## Session: `gym-programme.js` — Exit Protection & Activity Visibility

**This session needs one product decision before any code — see Section 2.** Everything else is ready to build the moment that's answered.

---

## 1. What's confirmed, and it's worse than originally flagged

The 30 Jul Core Session handoff flagged two things: no exit protection, and completions go to `progressLog` instead of `activityLog`. Both confirmed. **A third, more serious issue was found tracing the actual code paths — reflect answers are currently being silently lost for every gym-programme session.**

### 1a. Exit protection — confirmed absent, exactly as flagged

`js/views/gym-programme.js` v2 (23 Jun 2026), live, 593 lines. The on-screen Exit button (line 431-435):
```js
container.querySelector('[data-action="exit-session"]')?.addEventListener('click', () => {
  router.navigate('today');
});
```
No confirmation of any kind. No `mountSessionGuard`/`dismountSessionGuard` import anywhere in the file — meaning the back-gesture path is *also* completely unprotected (router's default popstate just navigates away). This is the same starting state `workout.js` was in this morning, before its own fix.

### 1b. `progressLog` vs `activityLog` — confirmed, and confirmed genuinely isolated

`recordSession()` in `js/data/programmeEngine.js` (v2, 23 Jun 2026) writes to `progressLog` — a real, functioning mechanism: it updates `activeProgramme.sessionsThisWeek`/`totalSessions`, appends a full entry (date, week, phase, focus, energy, condition scores, duration, exercise count), sets the anniversary date on first-ever session, awards a community credit, and checks milestones. This is not a stub — it's doing real, useful work.

**But `progressLog` is read by exactly one place in the entire codebase: `gym-programme.js` itself**, for the week-12 reflection observation text. Confirmed by grep — no other file reads it.

**Meanwhile `activityLog` is read by 20 files**, including the two that matter most here:
- `js/views/today.js` — the Home screen's "did you move today" detection and yesterday's-sessions summary
- `js/views/progress.js` — the Progress screen's recent-activity observations

**Concretely: a gym-programme session completed today will not make Home say "you moved today," will not appear in yesterday's sessions tomorrow, and won't show up in Progress screen observations.** This isn't a display gap on one screen — it's invisible to the app's two main "here's what you've been doing" surfaces.

### 1c. New finding — reflect.js is silently discarding gym-programme reflect answers

`gym-programme.js`'s "Session done" button calls `recordSession()` then navigates straight to `reflect.js`, same as every other activity type. But `reflect.js`'s save logic (confirmed, lines 546-568) is gated entirely on `currentActivityEntry`:

```js
const entry = store.get("currentActivityEntry");
if (entry) {
  // ... builds feel/painChange/note/moodAfter, saves to matching activityLog entry
}
// if (!entry) — nothing happens. Silently.
```

`gym-programme.js` never sets `currentActivityEntry` anywhere in the file. So when the user answers reflect.js's questions after a gym-programme session, **those answers are either silently discarded** (if `currentActivityEntry` happens to be empty) **or attached to a stale entry from an unrelated earlier session** (if an old value is still sitting in store from something else). Either outcome is a real trust problem, on top of the visibility gap above — the user is answering genuine questions and getting nothing, or the wrong thing, saved.

This wasn't in the original 30 Jul finding — it only surfaced by actually tracing where `router.navigate('reflect')` leads.

---

## 2. The decision this session needs first

**Not "progressLog vs activityLog" as an either/or — the evidence points toward "write to both."** `progressLog`'s programme-specific fields (week, phase, milestone tracking, the week-6/week-12 moment triggers) do real work that `activityLog` has no equivalent for, and nothing else depends on `progressLog` going away. The gap isn't that `progressLog` shouldn't exist — it's that gym-programme sessions never also write to the shared `activityLog` mechanism every other activity type uses, which is what `today.js`, `progress.js`, and `reflect.js` all actually key off.

**Recommended shape, for Graeme to confirm before this session starts building:**
- Keep `recordSession()` → `progressLog` exactly as it is (working, nothing else touches it, low risk to leave alone)
- **Add** a `store.logActivity()` call alongside it, following the exact pattern already proven working in `workout.js` v6 (Section 3) — set `currentActivityEntry` to the result, so `reflect.js` behaves correctly
- This is additive, not a migration — no existing `progressLog` data or logic changes

If Graeme wants a different shape (e.g. `progressLog` retired entirely in favour of `activityLog` alone, with programme-specific fields folded into `activityLog` entries instead), that's a bigger job than this blueprint scopes for — flag back to the PM chat rather than improvising it mid-session.

---

## 3. The reference pattern — already proven working today

`js/views/workout.js` v6 (30 Jul 2026, live) had this *exact* gap this morning and was fixed in the Core Session investigation. Use it as the template, not a fresh design:

- **Back-gesture protection:** `mountSessionGuard({ isActive, onExit, label })` from `js/session-guard.js` (v2, 21 Jul 2026) — `onExit` calls a local `savePartialSession()` then navigates away. See `workout.js` lines 334-338.
- **On-screen Exit button:** a locally-defined `showExitConfirm()` overlay (workout.js lines 371-410) using `.session-exit-*` classes — replaces a blunt `confirm()`/instant-navigate with a genuine two-option coach-voiced card (Stay / Exit-and-save).
- **Partial-save on exit:** a locally-defined `savePartialSession()` (workout.js lines 486-511) that builds a fresh entry via `store.logActivity()` — deliberately does NOT spread any prior `currentActivityEntry` (that spread was the exact cause of this morning's id-reuse bug, now fixed elsewhere — don't reintroduce it here).
- **Full completion:** `store.logActivity({...})` at the real "session done" point, result assigned to `currentActivityEntry`.

**No CSS work needed.** `showExitConfirm()`'s markup uses `.session-exit-overlay`/`.session-exit-card`/`.session-exit-coach-row`/`.session-exit-actions` — the exact class family already fixed once in `css/components/session-guard.css` v2 during the Core Session investigation, confirmed to cover all files using this pattern. Confirm this holds for `gym-programme.js` too once implemented (a quick visual check, not a rebuild), but don't budget CSS authoring time for it.

**One structural difference to design around, not copy blindly:** `gym-programme.js`'s "done" state is tracked per-exercise via `aria-pressed="true"` on `[data-exercise-done]` buttons (line 557: `doneCount = container.querySelectorAll('[aria-pressed="true"]').length`) — this is actually the same shape as `workout.js`'s own progress tracking, so `savePartialSession()`'s `exerciseCount`/`creditsEarned`-style partial fields map cleanly. Don't assume gym-programme has no meaningful "partial" state — it does, and it's countable the same way.

---

## 4. Files this session will touch

Ground-truthed today (31 Jul), re-confirm at session start regardless — time will have passed:

| File | Live version confirmed today | Action needed |
|---|---|---|
| `js/views/gym-programme.js` | v2, 23 Jun 2026 | Main edit: import `mountSessionGuard`/`dismountSessionGuard`, wire back-gesture guard, replace on-screen Exit's instant-navigate with a `showExitConfirm()`-style overlay, add `savePartialSession()`, add `store.logActivity()` + `currentActivityEntry` write at genuine completion (alongside the existing `recordSession()` call, not replacing it — see Section 2). |
| `js/data/programmeEngine.js` | v2, 23 Jun 2026 | Read-only unless Graeme's decision in Section 2 changes shape — `recordSession()` itself shouldn't need to change if the additive approach is confirmed. |
| `js/session-guard.js` | v2, 21 Jul 2026 | Read-only — reuse `mountSessionGuard`/`dismountSessionGuard` as-is, don't modify. |
| `js/store.js` | v11, 30 Jul 2026 | Read-only — reuse `logActivity()` as-is. |
| `css/components/gym-programme.css` | v1, 25 Jun 2026 | Almost certainly untouched (Section 3) — confirm with a visual check before assuming, don't skip the check. |
| `css/components/session-guard.css` | v2, 30 Jul 2026 | Read-only — should already cover the `.session-exit-*` classes this session reuses. |
| `sw.js` | cache `alongside-v186` | Deploy LAST, cache bump, one-line changelog entry — only if `gym-programme.js` (or, less likely, CSS) actually changes, which it will. |

**Touch-once applies.** `workout.js`, `core-session.js`, `yoga-session.js`, and the other 4 already-fixed session files are confirmed working — don't touch them. If this session's fix surfaces something that looks like it also affects one of those, log it and stop rather than expanding scope.

---

## 5. What "done" looks like, concretely

- Back-gesture exit during an active gym-programme session shows a Stay/Exit-and-save card, matching the confirmed-working pattern in the other 7 session files.
- On-screen Exit button shows the same two-option coach-voiced card, not an instant navigate.
- A genuine "Session done" completion writes to **both** `progressLog` (unchanged) and `activityLog` (new), with `currentActivityEntry` set correctly.
- **On-device confirmation, not just code review:** complete a real gym-programme session, then check — does Home say "you moved today"? Does it show up in Progress? Does answering reflect.js's questions afterward actually save (check the matching `activityLog` entry has `feel`/`painChange`/`note`/`moodAfter` populated, not just the bare completion fields)?
- Partial exit (mid-session, via either exit path) saves a `status: "partial"` entry with an accurate `exerciseCount` from the `aria-pressed` count, same convention as `workout.js`.
- Week-6 glance, week-12 reflection, and the A/B session-type alternation — all currently working, unrelated to this fix — confirmed still working after the change (quick regression check, not a full re-test).

---

## 6. Session Start Checklist

- [ ] `Documents/Admin/master_schedule.md` in the repo is canonical — read it in full first, not project knowledge.
- [ ] Re-confirm every live version in Section 4's table — this blueprint is dated 31 Jul, but confirm nothing shipped between then and session start.
- [ ] **Confirm Graeme's decision from Section 2 before writing any code.** If it hasn't been confirmed, stop and ask rather than assuming the recommended shape.
- [ ] Use the fine-grained GitHub token (regenerate if the one from 30 Jul has expired or been reused too many times) — `git clone` for ground truth and to commit/push directly.
- [ ] Every file produced carries a `DD Mon YYYY vN` header, verified against today's actual date.
- [ ] `node --check` on every changed `.js` file before handoff.
- [ ] `sw.js` last, cache bump, one-line changelog entry.

---

## 7. What to bring back to the PM chat

- Confirmed final versions of every file actually touched
- On-device confirmation results for every item in Section 5 — not "should work"
- Whether the CSS reuse assumption (Section 3) held, or needed a small addition
- Anything found along the way that wasn't expected — this file surfaced two extra bugs beyond what was originally flagged (Section 1), worth staying alert for a third

---

*Build New Habits · Alongside: Move · Session Blueprint · 31 Jul 2026 v1*
