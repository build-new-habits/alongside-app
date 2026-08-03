# Alongside: Move — Build Session Blueprint
## 03 Aug 2026 v1

Build New Habits | Written by the PM chat, for a fresh chat to execute independently against the repo. Paste this whole document as the first message in a new chat.

---

## Session: Wake Lock + Resumable Session — Pilot on `running-session.js`

**Approach, confirmed with Graeme:** two-layer fix. The resumable-state layer is the real fix; Wake Lock is a genuine but partial improvement layered on top, not a substitute for it — confirmed via research that Wake Lock is released the instant the OS locks the screen or the tab loses focus, and was outright broken in installed iOS PWAs until iOS 18.4. Don't build Wake Lock alone and call this closed.

**Scope:** pilot on `running-session.js` only. Build the shared logic as a reusable module so the other 6 session views can adopt it as a fast follow-up — but don't touch them this session.

---

## 1. Part One — Wall-clock-anchored, resumable session state (the real fix)

### The core change: stop counting ticks, start computing from timestamps

Currently `elapsed` is a plain counter, incremented once per `setInterval` tick, on the unstated assumption every tick fires exactly 1000ms apart. It doesn't, even under mild throttling — this is worth fixing regardless of the resume feature, since it's the same root cause behind the interval-structure prompt bug in Section 3.

Replace tick-counting with: store `sessionStartedAt` (ISO timestamp) at session start, and a running `totalPausedMs` accumulated across pause/resume cycles. Compute `elapsed` fresh, every time it's needed, as `Math.floor((Date.now() - startedAt - totalPausedMs) / 1000)`. The `setInterval` still drives the UI refresh cadence, but it's no longer the source of truth for elapsed time — it just triggers a recompute.

### New shared module: `js/session-resume.js`

Same pattern as `js/session-guard.js` — small, focused, imported by session views. Responsibilities:

- **`checkpointSession(sessionType, data)`** — writes a checkpoint to `store` at `activeSessionCheckpoint` (single slot, not per-type — only one session can be active at once, so no need for a namespaced collection). Shape: `{ sessionType, startedAt, totalPausedMs, checkpointedAt, ...sessionType-specific fields }`. Called at meaningful state changes only (session start, pause, resume, each prompt fired) — not every tick. Cheap by design.
- **`getResumableSession()`** — reads the checkpoint. Returns `null` if none exists, or if `checkpointedAt` is older than a sensible staleness window (recommend 3 hours — long enough to cover a genuine interruption-and-return, short enough that a checkpoint from yesterday isn't offered as if it's live). Returns the checkpoint object otherwise.
- **`clearCheckpoint()`** — called on genuine completion (`endSession`) and on deliberate exit-and-save (`savePartialSession`) — once the user has chosen to leave and progress is saved to `activityLog`, there's nothing left to "resume." Also called if the user explicitly chooses "start fresh" over a resume prompt.

### Wiring into `running-session.js`

- `startSession()`: set `sessionStartedAt = Date.now()`, `totalPausedMs = 0`, call `checkpointSession('run', { selectedType, selectedMins, promptIndex: 0 })`.
- `pauseSession()`: when pausing, record `pausedAt = Date.now()`. When resuming, add `Date.now() - pausedAt` to `totalPausedMs`, then re-checkpoint.
- `firePrompt()`: re-checkpoint with the current `promptIndex`.
- On `onMount()` at cold start (`phase === "type"`, nothing selected yet): call `getResumableSession()`. If one exists for `sessionType: 'run'`, don't render the normal type-selector — render a coach-voiced resume card instead (Section 2).
- `endSession()` and `savePartialSession()`: call `clearCheckpoint()` after the existing `store.logActivity()` call succeeds.

### The interval/timer itself

Keep the `setInterval` at 1000ms for UI responsiveness, but every tick now: recompute `elapsed` from timestamps (not increment it), and use that recomputed value for the timer display, progress bar, and all the phase-transition checks (warmup end, cooldown start, session complete). This means if the browser throttles ticks (fires every 5 or 30 seconds instead of every 1), the *next* tick that does fire will immediately show the correct true elapsed time — no drift accumulates, because nothing was ever counted incrementally.

---

## 2. The resume prompt — coach-voiced, not a system dialog

When `getResumableSession()` returns a checkpoint on mount, show a card in the same visual register as the existing `showExitConfirm()` overlay — reuse the `.session-exit-overlay`/`.session-exit-card`/`.session-exit-coach-row`/`.session-exit-actions` CSS classes directly rather than writing new ones. They're functionally a generic "coach-voiced two-option decision" pattern already; the class names being exit-specific is a minor naming smell, not a reason to duplicate the CSS. Flag it as a fast-follow rename candidate for the Cleanup Task List, don't fix it now.

**Copy, in the established Nurturing voice — no shame, no "you failed to finish" framing:**

> "Looks like your run got interrupted. Want to pick up where you left off, or start fresh?"
>
> **[Resume run]** — primary button
> **[Start fresh]** — ghost button

**On Resume:** restore `selectedType`/`selectedMins` from the checkpoint, recompute `elapsed` from the stored timestamps, set `phase = "running"`, recompute `promptIndex` and `inWarmup`/`inCooldown` from true elapsed (don't replay any prompts that would have fired during the gap — jump straight to whichever prompt is next from *now*, per Graeme's "behaviour is communication, no catch-up guilt" principle already established elsewhere in the product). Re-request Wake Lock (Section 4). Resume the interval.

**On Start fresh:** `clearCheckpoint()`, proceed to the normal type-selector as if nothing happened.

---

## 3. Part Two — fix the exact-equality prompt-matching bug

Found while tracing this: `INTERVAL_STRUCTURE`'s work/recovery cues currently match via `structure.find(s => s.at === elapsed)` — exact equality against a tick-counted `elapsed`. This is fragile even without backgrounding: miss a single tick for any reason and that cue silently never fires. Once `elapsed` becomes timestamp-derived (Section 1), a tick recompute could jump `elapsed` forward by more than 1 between ticks, making exact-equality matching even more likely to skip a cue entirely.

**Fix:** track which structure indices have already fired (a `firedStructureIndices` Set, reset on session start, included in the checkpoint), and on each tick check for any unfired entry where `elapsed >= s.at`, not `elapsed === s.at`. Fire the first such match, mark it fired. This is a small, self-contained fix — do it as part of this session since it's the same root cause and the same file, not a separate touch-once violation.

---

## 4. Part Three — Wake Lock, properly lifecycled

Add alongside the above, not instead of it:

- `if ('wakeLock' in navigator)` feature-detect — don't break on unsupported browsers/old iOS.
- Request (`navigator.wakeLock.request('screen')`) in `startSession()`, and again on Resume (Section 2).
- Wrap the request in `try...catch` — the device can refuse for reasons outside your control (low battery, user preference), per current best practice. A refusal should be silent, not surface an error to the user — the resumable-session fix is what actually protects them either way.
- Store the returned `WakeLockSentinel` in module state. Release it (`.release()`) in `endSession()`, `resetSession()`, and the exit-and-save path.
- Add a `visibilitychange` listener while a session is active: if the document becomes visible again and `phase === "running"`, re-request the lock — the browser silently drops it on backgrounding and won't restore it automatically.

---

## 5. Files this session will touch

| File | Live version confirmed today (03 Aug) | Action |
|---|---|---|
| `js/views/running-session.js` | v3, 23 Jul 2026 | Main edit — all of Sections 1–4 above. Version bump to v4. |
| `js/session-resume.js` | New file | Create — shared checkpoint/resume module per Section 1. |
| `js/session-guard.js` | v2, 21 Jul 2026 | Read-only — no changes needed, just confirming the pattern being mirrored. |
| `js/store.js` | v11, 30 Jul 2026 | Read-only — `get`/`set` already support the dot-path pattern `session-resume.js` needs (`activeSessionCheckpoint`), confirmed today. No changes needed. |
| `css/components/session-guard.css` | Confirmed has `.session-exit-*` classes, reusable as-is | Read-only, per Section 2's decision to reuse rather than duplicate. |
| `sw.js` | cache `alongside-v188` | Deploy LAST, cache bump, one-line changelog entry. |

**Touch-once applies.** Don't touch `workout.js`, `yoga-session.js`, or any other session view this session — this is the pilot, generalising comes after it's proven.

---

## 6. What "done" looks like

- `running-session.js` uses timestamp-derived elapsed time throughout, not tick-counting.
- A checkpoint is written at session start, pause, resume, and each prompt — confirmed by inspecting `store.get('activeSessionCheckpoint')` mid-session.
- **On-device confirmation, the real test this bug needs:** start a run, lock the screen, wait several minutes, unlock — confirm the timer shows the correct elapsed time immediately (not frozen, not jumped incorrectly), and that at least one prompt fired correctly despite the lock.
- **On-device:** start a run, force-refresh the page mid-run, confirm the resume card appears with correct copy, and that choosing Resume restores the session accurately.
- **On-device:** confirm Start Fresh correctly clears the checkpoint and behaves like a normal cold start.
- Interval-structure prompts (work/recovery cues) confirmed firing reliably via the `>=`-based match, not silently skippable.
- Wake Lock requested on start/resume, released on end/exit, re-requested on `visibilitychange` — confirmed via DevTools or console logging, since there's no visible UI indicator for wake lock state.
- `sw.js` bumped, deployed last, changelog entry added.

---

## 7. Session Start Checklist

- [ ] `Documents/Admin/master_schedule.md` in the repo is canonical — read in full first (should be v99 or later; re-confirm).
- [ ] Re-confirm every live version in Section 5's table — this blueprint is dated 03 Aug, confirm nothing shipped between then and session start.
- [ ] Use the fine-grained GitHub token — regenerate if expired.
- [ ] Every file produced carries a `DD Mon YYYY vN` header.
- [ ] `node --check` on every changed `.js` file.
- [ ] `sw.js` last, cache bump, one-line changelog entry.

---

## 8. What to bring back to the PM chat

- Confirmed final versions of every file touched, including the new `session-resume.js`
- On-device confirmation results for every item in Section 6 — this bug was only ever caught by real on-device use, so "should work" isn't sufficient here of all sessions
- Whether the `.session-exit-*` CSS reuse held visually for the resume card, or needed a small addition
- A recommendation on sequencing the rollout to the other 6 session views — same session-by-session approach as the exit-guard work, or a single combined session now the pattern's proven

---

*Build New Habits · Alongside: Move · Session Blueprint · 03 Aug 2026 v1*
