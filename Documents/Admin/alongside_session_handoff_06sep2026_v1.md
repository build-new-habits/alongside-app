# Alongside: Move — Session Handoff
## 06 Sep 2026 v1

Written at the close of the 6 Sep build sessions. Assumes nothing from
chat history. Everything the next session needs is here or in the repo.

---

## 1. Paste this as the opening prompt

```
Alongside: Move — build session.

Clone fresh from build-new-habits/alongside-app.
PAT: /mnt/project/New_Token_-_End_4th_Oct (expires 4 Oct 2026).

Read in this order before doing anything:
1. Documents/Admin/master_schedule.md (canonical — wins over project
   knowledge on any conflict)
2. Documents/Admin/alongside_session_handoff_06sep2026_v1.md
3. git log --oneline -12

Opening state to VERIFY, not trust: alongside-v443, 109 gates,
session-builder-ui.js v14, settings.js v36, today.js v25, store.js v63,
Schema.md v1.45, master schedule v286, cold start blueprint v39.
Run the full gate suite and schedule-drift.mjs on the fresh clone
before touching anything.

House rules: file headers "DD Mon YYYY vN", read the clock before
writing one. Schema before code if any store field changes. Gate must
be red before it is green, every assertion reversal-proven, and the
fixture must actually reach the branch it names. Execute UI under jsdom
with real clicks. Python assert t.count(old)==1 before every string
replacement. Commit messages in a file via -F, never inline. sw.js
last, alone, header AND cache bumped together. Verify from a second
independent fresh clone. Update the master schedule at close.

Push back when the evidence warrants it, put decisions to me as options
rather than open questions, and surface consequences alongside
recommendations rather than after I have agreed.

Start at SKIP. Schema first.
```

---

## 2. Where the baton is

Graeme's position, unchanged and load-bearing: **the app must be
finished before anyone sees it.** Beta is being delayed and shortened
rather than run on a partial product. Beta and legal have their own
sessions booked — **do not propose admin work in a build session.** He
has said so directly and he was right to.

The end goal is a **full persona trace**. The framing is settled and
should not be relitigated in either direction:

> **Likely behavioural and emotional response, inferred from published
> evidence and explicitly labelled as inference.** Not invented ratings,
> not fabricated user testimony, not satisfaction scores or NPS. Those
> require testers, which is what beta is for.

---

## 3. What shipped on 6 Sep

| | what | gates |
|---|---|---|
| PICKER-EXIT | Record corrected; behaviour was already right | new `verify-picker-exit.mjs`, 13 |
| TIER-VISIBLE | Settings > Profile now shows "Your plan: Free / the Plan" | new `verify-tier-visible.mjs`, 20 |
| INSTEP-TIER | Record corrected; In Step free since 12 Aug | already covered |
| **ARC-DOOR** | **Real tier leak closed** — free could build and keep an arc | new `verify-arc-door.mjs`, 11 |
| STRETCH-VARY | Stretch moved to `buildSession()`; six builds, six sessions | new `verify-stretch-vary.mjs`, 15 |

Also `verify-sectionrules.mjs` v1 → v2 (9a and 9b updated, not relaxed,
after they correctly went red).

---

## 4. The two findings that matter more than the fixes

### 4a. The schedule cannot be used to judge completeness

**Three of nine "open defects" were stale entries, not faults** —
SURFACE-TOKEN, PICKER-EXIT, INSTEP-TIER. A third of the list.

INSTEP-TIER is the sharpest: `in-step.js:45` records a header wrongly
saying "Personal tier" being corrected on **13 Aug**. The schedule then
re-recorded that same wrong claim as a red conflict on 3 Sep and again
on 5 Sep. **Fixed in the code, reintroduced in the record, twice.**

And it cuts the other way. **ARC-DOOR was a live tier leak the record
did not know about at all.** So the schedule over-reports faults *and*
under-reports them.

> **STANDING RULE: no item is reported to Graeme as open until it has
> been driven.** Reading the schedule is not evidence. Reading the code
> is not evidence. Executing it is.

### 4b. Fixtures that do not reach the branch they name

**Eight instances on 6 Sep alone**, on top of seven previously recorded.
This is now the dominant failure mode of this project's testing, and it
is no longer treated as an occasional slip. Every gate written today
carries explicit `FIXTURE REACHES...` assertions rather than assuming
reach.

The ARC-DOOR case is the one to remember: a fixture set `arc.aimId` but
not `arc.active`, landed on the offer branch, rendered correctly, and
**reported no leak on a live defect.** A clean-looking pass concealed
the fault.

---

## 5. Traps, earned rather than guessed

- **Both builders write `store.generatedSession` as a side effect**
  (`session-builder.js:2522` and `:3329`). Any gate calling a builder
  mid-run silently overwrites live state. Capture, compare, restore.
- **`shoulders` is a ZONE name, not a condition id.** `conditions:
  ["shoulders"]` at 8 makes `severeZoneToday()` return null. Use
  `lower-back` at 8 → `spine`.
- **`exercisePreferences` shape is `{ [id]: { preference: 'avoid' |
  'less' } }`** — an object, not a string. A string silently does
  nothing.
- **The stretch path is not the ordinary path.** Zone picker after
  location; no equipment or build-mode screens; durations 15/30/45/60,
  there is no 20.
- **Module state persists between builds** in session-builder-ui. After
  a build the module sits on the preview, and zones stay chosen. Return
  via `#sb-rebuild-btn` and walk whatever screen is actually present.
- **Settings renders a three-row index, not a panel.** The plan line is
  Settings > Profile; the dev tier switcher is About > **about-app**
  (not `about-story`) behind a real triple-tap on the version label.
- **Strip comments before any source-slice assertion.** Three separate
  checks went red today because the explanation of a change named the
  thing it replaced, or because a character-counted window was pushed
  past its limit by a comment.
- **Anchor source slices on unique openers.** `selectedType ===
  "stretch"` appears twice; slicing from the first measured the wrong
  code entirely.
- **`tail -n +2` when assembling a gate from a draft strips the JSDOM
  import.** Happened twice. Assemble, then assert the import survived,
  *before* deleting the draft.
- **Gate the shell report on the edit succeeding.** A python
  `assert t.count(old)==1` can fail while the surrounding shell happily
  prints "GREEN (missed)". The assert did its job; the wrapper did not.
- **The sw.js bump is three things**, not one: `CACHE_NAME`, the file
  header, and the cold start blueprint's cache line. Missing the header
  put main red for one commit today.
- **A single failing gate inside a long suite loop is not a red gate
  until it reproduces.** `verify-cap6.mjs` failed once under container
  contention and passed five times in isolation.
- **Work lands from more than one session.** SURFACE-TOKEN arrived from
  a parallel session mid-conversation. Always `git pull` and reconcile
  before building.

---

## 6. Open work, in order

1. **SKIP** — `gym-programme.js:929` writes `too-hard` on every skip.
   **Graeme's ruling, already given: stop writing a reason at all.**
   Record the skip as a skip. Optional dismissible chips only where they
   change selection — *sore or painful / low energy / short on time /
   not today*. Never required, never shown back as a pattern.
   Evidence base: a systematic review and several studies give
   motivation, pain or discomfort, poor health, fatigue, lack of time,
   competing priorities, weather and fear of injury. "Too hard" barely
   features. **Store field change → Schema.md v1.45 first.**
2. **CONTENT-GAP-1** — 16 gap-closing exercise entries: pull,
   anti-extension, anti-lateral-flexion, resistance-band strength at
   difficulty 3–4. Claude's to write.
3. **RED-FLAG** — ⏳ **awaiting Graeme.** Recommended call: build the
   flow now, do not invent the content; question set based on **PAR-Q+**,
   the internationally used pre-exercise screening instrument; behind a
   flag until the clinical reviewer signs off. Never paywalled.
4. **Persona trace** — last, so it reports unknown faults rather than
   known ones.

**Session B2 (SWAP-1 retirement)** remains specified and unstarted.
⚠️ `triggerRecommendedBuild()` now has **exactly one caller** — the
retirement precondition, reached as a side effect of STRETCH-VARY.
⚠️ B2 must also update `verify-swap1`'s click-through: with the
build-mode screen gone, `#sb-build-btn` goes straight to build and three
screen assertions describe a screen that will not exist.

**Not Claude's to do:** BETA-3 (three WOW sessions never confirmed on a
real handset, ~20 minutes, Graeme only). HMRC registration, ICO, the
clinical pack, Natalie's review, the privacy and terms pages that
BETA-1's consent gate links to — all outside build sessions.

---

## 7. One thing for Graeme to check on the handset

Open **Settings > Profile**. It now states the plan. If it says **Free**
and Home still shows a full arc with strand chips, the device is running
a cached build older than **v442** — worth knowing before any device
testing, and it would explain the 6 Sep screenshot.

`DEV_PANEL_ENABLED` stays `true` through beta by the A1 decision of
13 Aug; it flips before public launch, January 2027. It is hidden behind
an undocumented triple-tap and was **wrongly described in this session
as shipping to any user who can find it** — that claim is withdrawn.
