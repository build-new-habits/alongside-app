# Alongside: Move — Build Session Blueprint
## 04 Aug 2026 v1

Build New Habits | Written by the PM chat, for a fresh session — either a build chat with repo access, or a joint PM-chat session with Graeme reviewing live screenshots. **This session has two halves that need different people doing them — read Section 1 before starting.**

---

## Session: Design Consistency Audit — "Clean Lines" Pass

**Not a bug hunt.** A pre-check already confirmed the newest screens have no missing-CSS issues and use the shared `--space-*` token scale and `.btn` classes correctly, not ad-hoc values. This session is about whether the app *feels* like one coherent product across screens built at very different times and speeds — some carefully, some in a marathon session — not about finding broken things.

---

## 1. Two halves, genuinely different work

### Half A — structural consistency (a chat with repo access can do this alone)

Checkable from code: does every screen reuse the same component patterns, or does each screen quietly reinvent its own version of the same thing (a card, a button row, an icon+label pattern)? Cross-reference class names, spacing patterns, and markup structure across the file list in Section 3. Produces a findings list, not fixes — see Section 4 for what counts as in-scope to actually change versus flag-only.

### Half B — visual judgment (needs Graeme, can't be done from markup alone)

Whether something *looks* coherent, has the right visual weight, or feels like it belongs isn't answerable from code. This half is a structured screenshot walkthrough — Section 5 gives the exact checklist to work through screen by screen. A build chat can prepare the questions and receive the answers; it cannot generate the answers itself.

**Recommended order: Half A first.** Whatever structural findings come out of the code pass should sharpen what Graeme's actually looking for in the screenshot review, rather than starting the visual pass blind.

---

## 2. Full screen list — old backlog plus everything shipped since, never reviewed

**Already flagged as inconsistent, still open (30 Jul finding):**
- Intention / Library / Coach Proposal — three visibly different visual styles across the ways into a session

**Already flagged, specific layout problems (not yet fixed):**
- `session-builder-ui.js` — the proposal screen
- `checkin.js` — bottom-sheet panel covers the coach's own message
- Library's "Start a session" activity-type list — icon, label, and description run together with poor hierarchy

**Never reviewed at all — shipped in the 04 Aug marathon session, zero design pass since:**
- `conditions-update.js` — collapsed condition cards, severity slider, felt-sense goal picker, trend display
- `today.js` — the six-door Home screen itself
- `mobility-conditioning.js` — the new landing page (three cards, collapsed/expand programme section)
- `checkin.js`/`checkin-mini.js` — the Pain Input Redesign sliders specifically (separate from the bottom-sheet panel issue above)
- `coach-proposal.js` — the Severe-pain Rest/Adapt choice screen

---

## 3. Files — ground-truthed today, re-confirm at session start regardless

| File | Live version confirmed 04 Aug | Note |
|---|---|---|
| `js/views/session-builder-ui.js` | v3 | |
| `js/views/checkin.js` | v11 | |
| `js/views/checkin-mini.js` | v6 | |
| `js/views/intention.js` | v8 (19 Jul — oldest file in this list, hasn't moved since the older complaint was logged) | |
| `js/views/library.js` | v2 | |
| `js/views/coach-proposal.js` | v19 | |
| `js/views/conditions-update.js` | v7 | |
| `js/views/today.js` | v12 | |
| `js/views/mobility-conditioning.js` | v2 | |
| `css/main.css` | v14 | |
| `css/layouts/conditions-update.css` | v7 | |
| `css/layouts/mobility-conditioning.css` | v1 | |
| `css/layouts/library.css` | v2 | |
| `css/components/coach-proposal.css` | v8 | |
| `css/components/checkin.css` | No version header found in the file — flag this itself as a small finding, confirm current content matches what's live rather than trusting any version number | |
| `sw.js` | cache `alongside-v219` | |

**Touch-once, with a real caveat this time:** this session may legitimately need to touch more files than usual if Half B's screenshot review surfaces things Half A's code pass didn't — that's expected for a design pass, not scope creep. What stays firm: don't touch anything **outside** the screen list in Section 2 without checking back first.

---

## 4. What's in scope to actually fix here, versus flag for later

**Fix in this session, if found:**
- Genuine component duplication (the same visual pattern implemented three different ways across screens) — consolidate to one shared pattern
- Spacing/token drift (a screen using a hardcoded pixel value where every other screen uses `--space-*`)
- The three already-specifically-flagged layout problems in Section 2, if they're still reproducible

**Flag, don't fix here — needs its own decision or session:**
- Anything requiring a genuine visual redesign (new colours, new component shapes) rather than consistency-matching to what already exists
- Anything that turns out to be a functional bug in disguise (if a "design" issue turns out to actually be broken logic, stop and log it as its own item rather than folding a bugfix into a design session)

---

## 5. Half B — screenshot review checklist

For each screen in Section 2's "never reviewed" list, plus the three already-flagged specific issues: a screenshot, plus these three questions, not open-ended "thoughts":

1. **Does this look like it belongs to the same app as [pick one already-confirmed-good screen, e.g. Settings]?** — a direct comparison anchor, not a vague coherence judgement
2. **Is there a single element pulling your eye first, and is it the right one?** — visual hierarchy check
3. **Would you change anything here even if nothing's "wrong"?** — captures taste/polish issues that aren't structural problems

Answers feed back into Section 4's fix-now-vs-flag split.

---

## 6. What "done" looks like

- Every screen in Section 2 has been through Half A's structural check, with findings recorded even where nothing needed fixing
- Every screen has been through Half B's three-question review with Graeme
- The three already-flagged specific layout issues (session-builder proposal, check-in panel, activity-list hierarchy) are either fixed or explicitly re-scoped if they turn out bigger than expected
- Any genuine component-duplication found is consolidated, not left as parallel implementations
- Anything deferred (Section 4's "flag, don't fix" category) is logged with enough detail that it doesn't need re-discovering next time

---

## 7. Session Start Checklist

- [ ] `Documents/Admin/master_schedule.md` in the repo is canonical — read in full first (should be v133 or later; re-confirm).
- [ ] Re-confirm every live version in Section 3's table — this blueprint is dated 04 Aug, confirm nothing shipped between then and session start.
- [ ] Use the fine-grained GitHub token — regenerate if expired.
- [ ] Complete Half A before starting Half B (Section 1).
- [ ] Every file produced/edited carries a `DD Mon YYYY vN` header.
- [ ] `node --check` on every changed `.js` file.
- [ ] `sw.js` last, cache bump, one-line changelog entry.

---

## 8. What to bring back to the PM chat

- Half A's structural findings list, in full, even the "nothing found" results
- Half B's screenshot-review answers for every screen
- Confirmed final versions of every file touched
- Explicit list of anything deferred to Section 4's "flag, don't fix" category, with enough context to act on later without re-investigating

---

*Build New Habits · Alongside: Move · Session Blueprint · 04 Aug 2026 v1*
