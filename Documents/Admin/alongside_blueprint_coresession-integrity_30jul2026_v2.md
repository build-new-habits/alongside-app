# Alongside: Move — Build Session Blueprint
## 30 Jul 2026 v2

Supersedes `alongside_blueprint_coresession-integrity_30jul2026_v1.md` — updated for the new repo-based workflow (canonical Master Schedule location, fine-grained GitHub token). No change to the investigation itself.

Build New Habits | Written by the PM chat, for a fresh build chat to execute independently. Paste this whole document as the first message in a new chat.

---

## Session: Core Session — `currentActivityEntry` Data-Integrity Investigation

**This session has two phases: diagnose first, fix second.** Don't jump to a fix before the root cause is confirmed with evidence — same discipline as BUILD-5 and B3-3.

---

## 1. Why this matters

`currentActivityEntry` is the pending-activity record set in the store when a user selects an activity, and read/completed by whichever view handles that activity's genuine completion — normally `reflect.js` (run/walk/swim/cycle/class/other), `workout.js` (gym), or `yoga-session.js` (yoga). Each of those confirmed writers sets `currentActivityEntry` on selection and the corresponding session view reads/updates it on completion.

**The open question, surfaced during the BUILD-3 exit-guard audit (23–24 Jul) but not chased at the time:** `core-session.js` may never actually receive a `currentActivityEntry` upstream. If true, this means **Core Session completions may never have logged real data** — not a rare edge case, a structural gap in one entire activity type, silently sitting alongside the ones that do work correctly.

This is a genuine trust-critical question in the same category as BUILD-5 (available-time) and B3-3 (duplicate writes) — both of which turned out to be real, and both of which were undiscovered until someone actually traced the data path rather than assuming it worked because the UI looked fine.

---

## 2. What's already known — don't re-investigate this part

BUILD-3 (23–24 Jul) confirmed the **exit side** of Core Session works correctly: `core-session.js` calls `savePartialSession()` on `onExit`, same pattern as `cycle-session.js`, `running-session.js`, `swim-session.js`, `walk-session.js`. That part is not in question.

**What's in question is the entry side** — whether `currentActivityEntry` is ever actually created and set before `core-session.js` mounts, the same way it demonstrably is for gym, yoga, and the `reflect.js`-routed types.

---

## 3. How to investigate — method, not guesswork

### 3a. Establish the working pattern first (the comparison baseline)

1. Find where `currentActivityEntry` is set for a type that's confirmed working — likely `intention.js` (or its current equivalent — confirm actual filename/location) and `workout.js`'s completion path. Read the exact code that sets `selectedActivity` / calls `store.set("currentActivityEntry", entry)` for gym and yoga.
2. Confirm what triggers navigation into `core-session.js` — is Core Session reachable from the same selection screen as gym/yoga/walk/run, or via a different route (e.g. directly from Noticing Hub, Today screen, or a programme)? **Don't assume it's the same entry point as the other types — trace it explicitly.**

### 3b. Trace whether Core Session's route sets the entry

1. For every code path that can navigate to `core-session.js`, check whether `currentActivityEntry` is set before or during that navigation — same way it is for gym/yoga.
2. If it's not set anywhere: confirm this with a `grep`-style search across the repo for every write to `currentActivityEntry`, and check `core-session` / `"core"` isn't among the types covered by any of them.
3. **On a disposable test account**, reproduce directly: launch a Core Session, complete it fully, then check in DevTools — was `currentActivityEntry` ever set, and does a corresponding `activityLog` entry exist afterward with plausible data (not just any entry, but one that actually reflects the Core Session just done)?

### 3c. If the gap is confirmed

Trace what `core-session.js` currently does with `currentActivityEntry` on completion — does it read it expecting data that was never set (silently failing or writing incomplete/null-heaventry values), or does it write its own entry independently without ever touching `currentActivityEntry` at all? The fix differs depending on which of these it turns out to be — don't assume before checking.

### 3d. If the gap is NOT confirmed

Equally valid outcome — if `currentActivityEntry` turns out to be set correctly via a route not yet considered, say so plainly with evidence, and close this as "investigated, not a bug." Per standing discipline: label findings honestly (Confirmed Working / Confirmed Broken / Inconclusive), don't upgrade a clean trace to "confirmed fine" without on-device confirmation, and don't leave a genuine gap under-stated either.

---

## 4. What to build once the cause is confirmed

**If confirmed broken:** wire `currentActivityEntry` creation into whatever launches Core Session, following the same pattern already proven for gym/yoga. Use the shared `store.logActivity()` function (introduced in B3-3, 16 Jul) for the actual write if `core-session.js`'s completion path isn't already using it — don't introduce a second direct-push pattern.

**Also check while in this code:** since B3-3 found this exact class of bug (writers not going through the shared function, or writing at the wrong moment) in gym once already, do a quick check that `core-session.js`'s own completion write — if it has one — isn't itself vulnerable to the same "writes on selection, not completion" pattern B3-3 fixed elsewhere. Don't assume it's clean just because it's a different file.

---

## 5. Files this session will touch

No live versions pre-filled — ground-truth every one of these from scratch, per the Ground Truth Rule.

| File | Why it's in scope |
|------|---------------------|
| `core-session.js` | The file in question — read fully, confirm what it does with `currentActivityEntry` on completion |
| `intention.js` (or current equivalent — confirm filename) | Where `currentActivityEntry` is set for other activity types — needed as the comparison baseline |
| `store.js` | Read-only, to confirm `logActivity()`'s current signature and dedupe logic before reusing it |
| Whichever file(s) Section 3b's trace identifies as the actual Core Session entry point, if different from `intention.js` | Wherever the fix needs to land |

**Do not touch:** `reflect.js`, `workout.js`, `yoga-session.js` — all confirmed working, out of scope unless the trace finds a genuine shared root cause, in which case flag and stop rather than silently expanding scope. BUILD-4 (schema reconciliation) is now **closed** (30 Jul, `schema.md` v1.9) — don't touch `Documents/Live State/Schema.md` or attempt to document any newly-discovered fields here. If this investigation surfaces a genuinely new `store.js` field (e.g. something added to support the fix), log it for the BUILD-4 Appendix A follow-up pass rather than editing the schema doc directly in this session.

---

## 6. What "done" looks like, concretely

- The exact code path that launches Core Session is identified and traced end-to-end for `currentActivityEntry` handling, with evidence — not assumed from reading one file in isolation.
- The question is explicitly answered: does Core Session currently log real, accurate completion data, or has it never worked correctly? Either answer is a valid outcome, but it must be evidenced, not assumed.
- If broken: fixed following the established gym/yoga pattern, using the shared `store.logActivity()` function, confirmed on-device with a real completed Core Session showing correct data in `activityLog`.
- If working: closed with the trace that proves it, so this doesn't sit as an open question indefinitely.

---

## 7. Session Start Checklist

- [ ] **Master Schedule location has changed.** The canonical copy is now `Documents/Admin/master_schedule.md` in the `alongside-app` repo, not project knowledge — if the repo and a project-knowledge copy ever disagree, the repo wins. Clone/fetch it from there first; only fall back to `project_knowledge_search` for `alongside_master_schedule` if repo access fails.
- [ ] Read the BUILD-3 handoff/summary referencing this open question (search conversation history for "core-session.js currentActivityEntry" if not in project knowledge) so the original finding's exact wording isn't lost.
- [ ] Confirm current live version of `core-session.js`, `intention.js`, and `store.js` before touching anything.
- [ ] **A fine-grained GitHub token is now live in project knowledge** (7-day expiry, set up 30 Jul) — use it to `git clone` the repo for ground truth and to commit/push directly, rather than pasted files. Standard paste-based Ground Truth Rule is still the fallback if the token has expired or isn't working.
- [ ] Every file produced carries a `DD Mon YYYY vN` header, verified against today's actual date.
- [ ] `sw.js` last if any shipped file changes, cache bump, one-line changelog entry.
- [ ] `node --check` on every changed `.js` file before handoff, per standing build discipline.

---

## 8. What to bring back to the PM chat

A session handoff containing:
- The trace evidence for how (or whether) `currentActivityEntry` reaches Core Session
- Confirmed Working / Confirmed Broken / Inconclusive label for this specific question
- If fixed: on-device confirmation of a real completed Core Session logging correct data, plus confirmed final versions of every file touched
- Any related finding — particularly if the same "shared entry-point pattern" gap turns out to affect any other activity type not yet checked

Paste that back here (or confirm uploaded to project knowledge) before the next planning conversation.

---

*Build New Habits · Alongside: Move · Session Blueprint · 30 Jul 2026 v2*
