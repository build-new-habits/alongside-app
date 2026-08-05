# Alongside: Move — Build Status & Tidy-Up
## 04 Aug 2026 v1

Build New Habits | A synthesis of `master_schedule.md` v132 — one clean read of where the build actually stands, what's still needed, and what can be cleared out. Not a replacement for the master schedule; a readable digest of it.

---

## Bottom line

**The core architecture is genuinely close to done. The confidence in it is not.** A huge amount shipped in the last 48 hours — the whole Home Nav & Conditions rebuild, tier-gating infrastructure, the Wake Lock fix, a website pass. Almost none of it has touched a real phone yet. The single biggest thing standing between "feels finished" and "confirmed finished" is one overdue, comprehensive on-device test pass — not more building.

Behind that, there are a handful of real, scoped, not-yet-started build items — none of them small, none of them blocking a beta on their own.

---

## 1. ✅ Done and confirmed — trust these

- BUILD-2, BUILD-4, BUILD-5 (proposal loop, schema reconciliation, available-time bug)
- Core Session data-integrity investigation — full on-device pass, all 7 files
- Thread scroll-bug audit
- Tier-gating infrastructure + the `upgrade.js` and `session-builder-ui.js` `userTier` crash fixes
- Website: WCAG contrast audit, `/upgrade` and `/who-its-for/` pages, cache-busting bug, footer "Ltd" fix
- NEW-1 (condition-specific programme routes) — Graeme's own on-device pass confirmed this working
- Check-in gating made optional — confirmed shipped, resolves a real standing complaint
- Home Nav Phases A–C — confirmed on-device

---

## 2. 🟡 Built, NOT yet on-device confirmed — the real priority

This is the list that matters most right now. Everything here is code-complete and pushed, but "should work" isn't "works" — and several of these are exactly the kind of thing that's only ever broken discoverable through real use (the Wake Lock bug being the proof of that).

**Suggested single test session, roughly in this order:**

1. **Force-update button** (Settings → Update app) — test this first; confirms you're even running current code for everything after it
2. **Wake Lock / resumable session** (`running-session.js`) — lock screen mid-run, force-refresh mid-run
3. **`prescribed-session.js` contraindication flag** — build a programme, bump a condition to Severe, confirm the flag appears (this is a genuine safety fix, worth confirming properly)
4. **Cross-condition exercise reuse** — two conditions that share exercises (e.g. glutes + hip), confirm one entry, not a duplicate
5. **Conditions Update screen, full pass** — add/expand a condition, severity slider, goal + trend, reflection field, both entry points (Home door and Settings)
6. **Mobility & Conditioning's new landing page** — all three cards, collapsed/expand programme section
7. **Pain Input Redesign arc** (sliders, multi-condition messaging, Severe pain Rest/Adapt choice) — covers 4 same-day builds in one pass
8. **`gym-programme.js`** and **BUILD-3's `prescribed-session.js`** exit-guard — both from earlier in the week, still genuinely unconfirmed (BUILD-3's own tracking had a gap — it claimed 7 files confirmed but its real scope was 11; `prescribed-session.js` was never actually tested)
9. Smaller items that piggyback on the above: Library's full-page styling, feeling-word chip fix, Add-to-programme button overflow, scroll-jump fix, `dead-bug`/`bird-dog` contraindication additions

---

## 3. 🔴 Real build work still needed — not started, not small

Ranked by what I'd actually prioritise, not just listed:

| Item | Why it matters |
|---|---|
| **Phase D-5 — fold-in dial's generator hook** | The last piece of the original Home Nav blueprint. The setting is stored but `workoutGenerator.js` doesn't read it yet — the dial currently does nothing. |
| **Exercise difficulty scale: 1–3 live → 1–5** | Real scope — ~500 exercises across 12 files, plus designing the level-selection/progression UX. Graeme's already decided this needs to happen. |
| **No difficulty-based gating exists at all** | Same root cause as above, likely one combined session. Free and Personal currently draw from an identical pool — the tier differentiation the website now describes isn't built yet. |
| **Full skip/dislike spec, in-session flow** | Only the browsing-list version shipped. `gym-programme.js`/`prescribed-session.js`/`core-session.js` still need the "not available today" vs "not keen" distinction mid-session. |
| **`gym-programme.js` guided walkthrough** | Currently a flat checklist while `workout.js` has the full timer/cue experience. Real consequence: Empathy Transfer prompts have nowhere to attach without an active session-flow moment. |
| **Aesthetics audit — 3 screens remain** | session-builder's proposal screen, check-in's bottom-sheet panel, "Start a session"'s activity list. Deliberately batched into one future pass rather than patched piecemeal. |
| **NEW-2 — coach fitness-recalibration engine** | Genuinely open design question, not just a build task. Real candidate data already exists (`exerciseFeedback`, completion/skip rates, `conditionPainScores` trend) but nothing's wired together yet. Sequence after NEW-1 exists to recalibrate against. |
| **`coach-reflection.js` cleanup** | Confirmed dead code (traced, not assumed). Just needs a decide-and-delete pass. |

---

## 4. 🗑️ Can genuinely be removed

Nothing urgent, but real candidates once you're ready for a sign-off pass:

- `js/data/exercises/index.js` — confirmed orphaned duplicate, nothing imports it
- `coach-reflection.js`'s four-option picker — confirmed unreachable, `checkin.js`'s fallback no longer routes here
- Dormant/write-only fields with no reader: `gymProgrammeWeek`, `todayEnergy` (safe removal candidates); `community.credits`, `workoutHistory` (need a decision: build a display, or leave backend-only)
- `coach-proposal.js`'s `renderBypassDoor(tier)` — unused parameter, needs a decision not a guess before touching

**Worth a quick sign-off, not urgent otherwise:** `consentGiven`/`consentAt` are written at onboarding but never checked anywhere — given consent has real legal weight, worth Graeme just confirming that's intentionally an audit trail and not meant to be a live gate.

---

## 5. Open decisions blocking things (not build work, but gating it)

- **Severity threshold mismatch** — `checkin.js`'s "Moderate" starts at pain level 6; `core-session.js`'s "subacute" flag starts at 4. Needs reconciling to one number before it's trusted further.
- **`proposalBias`** — computed by `coach-reflection.js`, never consumed anywhere. Decide: wire it into `coach-proposal.js`'s generation logic (looks like the original intent), or retire the write.
- **Severe pain Rest/Adapt liability question** — genuinely blocked on Alex's solicitor, not resolvable here. Same conversation as the wider BIZ-5/6 legal consultation.
- **Coach "remembers across time" website claim** — stated on `/who-its-for/` as a Personal-tier feature, not verified against live code either way.

---

## 6. Business/admin — brief, since you already know these

- HMRC registration, safeguarding reviewer outreach — both still untouched
- Solicitor consultation — three real questions now queued for it (beta-vs-launch legal minimum, IP/trademark, the Severe-pain liability question above)
- **One item worth surfacing explicitly, since it has a real deadline attached:** the website currently states some unbuilt features (exercise-level progression, periodised programmes) as if they're live Personal-tier benefits — a deliberate decision by Graeme, fine today since checkout is disabled, but it needs an explicit re-check before Stripe/Supabase checkout goes live. This should be its own line on the pre-beta checklist, not something that quietly rides along.

---

## 7. What I'd actually do next

Not more building. **One comprehensive on-device test session**, covering Section 2's list in the order given. Almost everything else on this document is either downstream of that (the real build items are genuinely separable and don't block a test pass) or a business item outside this chat's control. The app has more built-and-waiting than it has genuinely unstarted — the honest next move is confirming what's already there, not adding to the pile.

---

*Build New Habits · Alongside: Move · Build Status & Tidy-Up · 04 Aug 2026 v1*
