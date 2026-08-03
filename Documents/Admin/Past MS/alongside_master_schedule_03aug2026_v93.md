# Alongside: Move — Master Schedule
## 03 Aug 2026 v93

Build New Habits | Single source of truth for all build, business, website, and content tasks.
Supersedes `alongside_master_schedule_31jul2026_v92.md`. Remove v92 on upload.

**⚠️ Location:** the canonical copy of this document is `Documents/Admin/master_schedule.md` in the `alongside-app` repo, not project knowledge. If the repo and a project-knowledge copy ever disagree, the repo wins. This project-knowledge copy remains a searchable snapshot only. `Admin/Past MS/` in the repo holds every superseded version by date.

**This version's substantive changes (03 Aug):** Website session — WCAG 2.2 AA contrast audit (brief: `alongside_blueprint_website1_14jul2026_v1`-style session, executed directly in PM chat) plus a live-screenshot review that grew into building the `/upgrade` page (W5) for the first time. Full detail in the new section below. Headline items: (1) confirmed scroll-arrow contrast fix plus 5 more elements sharing the same root cause, plus a new badge-contrast finding — all fixed, `site.css` v7→v11; (2) `/upgrade/index.html` built from the already-locked architecture doc — static content only, checkout wiring still blocked on Supabase/Stripe infra (S-F3/S-F4); (3) a real cache-busting bug found and fixed — 4 pages were still requesting `site.css?v=7` after the stylesheet had moved past v7; (4) new compliance finding, not yet fixed — the shared site footer (`js/site.js`) says "Build New Habits Ltd" on every page; the business is an unregistered sole trader (BIZ-1 still open) and must never be described as Ltd.

**Previous version's summary (31 Jul), retained for continuity:** Personal-tier readiness sweep, prompted by Graeme reviewing a live screenshot. Three real findings, all ground-truthed against live code today: (1) **`coach-proposal.js`'s "Your programme" and "Something different" doors are permanently disabled in production** (`enabled: false`, static "Being redesigned" copy) — this was scoped as P5-CP-1 in the 23 Jun technical blueprint but has no active BUILD-x tracking; (2) **`upgrade.js` calls `store.getUserTier()`, which does not exist anywhere in `store.js`** — a live crash risk on the upgrade/membership screen, found while checking tier-gating status; (3) **the full tier-gating architecture (S4-TG, 9 May 2026) was thoroughly scoped — `js/auth.js`, `store.js` helpers, a complete feature-gating audit table — but none of it was ever built.** `js/auth.js` doesn't exist; none of `getUserTier`/`isPremium`/`isAthlete`/`lockedFeature`/`setTier` exist in `store.js`. This is a significant gap now that Personal tier is the active build focus.

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
- 🟡 **`gym-programme.js` — code complete, 31 Jul, on-device test pending** (blueprint `alongside_blueprint_gymprogramme_31jul2026_v1.md`; build run same session, direct via repo access). Graeme's Section 2 decision (additive) implemented in full: exit-guard wired, `activityLog` write added alongside unchanged `progressLog` write, `currentActivityEntry` set so `reflect.js` stops discarding answers. `gym-programme.js` v2→v3, `sw.js` v186→v187, pushed and confirmed live on GitHub. **On-device confirmation is the only remaining gate** — see BUILD-GP Outcome section below for the test checklist.
- **Supabase schema design session** — now unblocked, BUILD-4 closed. Should factor in the BUILD-4 Appendix A follow-up (below) — worth deciding whether that follow-up runs first or alongside.
- **BUILD-4 Appendix A follow-up — 🟢 blueprint ready, 31 Jul** (`alongside_blueprint_build4-appendixA_31jul2026_v1.md`). All 18 fields ground-truthed against live `Schema.md` v1.9 today; 6 flagged with a specific likely naming-overlap to check first (`totalCredits`/`community.credits`, `userTier`/`tier`, `todayEnergy`/`lastCheckin.energy`, and three more — see blueprint Section 2).
- **Supabase schema & architecture design — 🟢 blueprint ready, 31 Jul** (`alongside_blueprint_supabase-schema-design_31jul2026_v1.md`). **Design-only, explicitly scoped** — not a live migration session. Two real dependencies confirmed today, not assumed: the DPA request needs BIZ-1 (HMRC) done first; tier gating doesn't exist as a system yet (checked directly — 4 scattered reads of `tier`, zero central gate mechanism anywhere in `js/`). Both logged as separate, not-yet-scoped sessions rather than silently bundled in.
- BUILD-1's remaining sub-question
- BIZ-2, BIZ-3, INF-6, OUT-2, OUT-7
- **Org outreach category decision** (see Alex Meeting Outcomes below) — Graeme's call on whether workplace wellbeing reps and women's health groups join the Tier list, plus the "what's in it for them" messaging pass. Blocks OUT-2–OUT-8.

*Full six-week plan: Task Inventory doc, Section J (v5).*

---

## 🌐 Website Session — WCAG Audit + Upgrade Page Build, 03 Aug 2026

Run directly in the PM chat, no separate build-chat brief — repo: `github.com/build-new-habits/website` (separate from `alongside-app`). Token confirmed valid (expires 06 Aug 2026 10:13 UTC). `css/site.css` v7 → v11 across the session.

**Part 1 — WCAG 2.2 AA contrast audit (site.css v7→v8).** The confirmed scroll-arrow issue (1.61:1, needed 3:1) was fixed — `.hero__scroll-signal` switched from `--color-border` at 0.6 opacity to `--color-text-muted` at 0.85 opacity (6.14:1). Tracing `--color-border`'s usage found it measures 1.15–2.36:1 against every background token in the system — it never clears 3:1 anywhere — on 5 more functional-boundary elements (nav layout-toggle, nav hamburger-toggle, `.btn--ghost`, `.form-input`, `.hero__pause`). All six switched to `--color-text-muted` (3.91–8.05:1 across all backgrounds). New finding, not in the original brief: `.badge--live`/`.badge--soon` text-vs-background fell as low as 3.24:1 inside `.card` contexts (Products/Impact pages) — the 15%-alpha tinted background was never verified against a card background. Fixed by making badge backgrounds solid `--color-bg-deep` instead of blended rgba (6.96–10.69:1 everywhere now). Checked, no fix needed: `--color-border-light` (decorative dividers, SC 1.4.11 exempt), focus indicator (already 4.66–9.59:1), disabled `cause-card__vote` inputs (genuinely and permanently disabled in markup, SC 1.4.11 exemption applies).

**Part 2 — Live-screenshot follow-up (site.css v8→v10).** Graeme reviewed the deployed fix and flagged two more things: the scroll-arrow was visually disconnected from the Pause button (position:absolute pinned it to the hero section's bottom, far from Pause's in-flow position on tall viewports) — fixed by making it a normal flex child directly after Pause (v9). Second, the coach-bubble context line (`text-muted` on `bg-card`, 4.67:1 — AA-passing but "close for comfort") was reviewed via a 3-option mockup (grey / teal / gold) — gold was deliberately not chosen since it's the paid-tier marker everywhere else in the system and this is a free/universal element; teal (`--color-primary-light`, 7.00:1) chosen (v10).

**Part 3 — Free vs Premium colour system + `/upgrade` page build (site.css v10→v11).** Graeme asked whether the site could flag free vs premium content with teal/gold consistently. Turned out this system was already a **confirmed, locked design decision** — `alongside_upgrade_page_architecture_09jul2026_v1` specifies gold (`#B8970A`) as the Personal-tier visual signal, with a full locked page copy that had simply never been built (W5 in the old 10 Jul website-stream tracking — never had its own BUILD-x ID here, hence the drop-off). Built `upgrade/index.html` v1 from that locked spec verbatim, plus new `site.css` classes (`.upgrade-hero`, `.upgrade-changes`, `.pricing-cards`, `.btn--gold`). Pricing pulled from the current `alongside_pricing_model_20jun2026_v2` (£7.99/mo, £49.99/yr launch year) — matches the architecture doc's own locked figures, no conflict. **Explicitly not built:** Stripe/Supabase checkout — S-F3 (Supabase auth) and S-F4 (Stripe setup) don't exist yet, so the CTA button is honestly disabled with a note, same pattern as the Community page's mailing-list placeholder. `js/site.js` v4→v5: added Upgrade to `NAV_LINKS` now the page is real.

**The broader ask — flagging every feature/reference site-wide as free vs premium, plus persona-tabbed pages per product — is only partly addressed.** Only Move has a confirmed Free vs Personal split (`alongside_move_overview_and_personas_25jul2026_v2`); Learn's is also documented, but Life, Rest, Love, Lead, Compass, Savvy are all "Proposed — no spec exists yet." A family-wide version of this needs those specs written first. Logged as an open item below, not actioned further this session.

**Real bug found and fixed, unrelated to the above:** `index.html`, `community/index.html`, `impact/index.html`, `products/index.html` were all still requesting `site.css?v=7` after the stylesheet had moved to v10 across this session's earlier edits — meaning browsers/CDN could have kept serving the pre-fix stylesheet indefinitely under the stale query string. All four bumped to `?v=11` (and `site.js?v=5`), version headers bumped to match.

**New compliance finding, not fixed this session (out of scope, flagged only):** `js/site.js`'s shared footer renders "© [year] Build New Habits Ltd. Alongside is a trading name of Build New Habits Ltd." on every page. Build New Habits is an unregistered sole trader (BIZ-1 still open) — per standing rule this must never be described as "Ltd." Live on every page right now.

---



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

**On-device testing status, updated 30 Jul 2026 — full test pass complete, all 7 files confirmed.** Core Session basic sanity ✅, Core Session id-reuse ✅, Yoga id-reuse (both routes) ✅, gym back-gesture exit-guard ✅, gym on-screen Exit-guard ✅. CSS render (`.session-exit-*`) individually eyeballed and confirmed correct for `core-session.js`, `yoga-session.js`, `running-session.js`, `workout.js` (screenshots), and Graeme's own quick pass confirmed `walk-session.js`, `swim-session.js`, `cycle-session.js` match as well — all 7 files now visually confirmed. Two real bugs found and fixed along the way (yoga stuck-screen, dedupe window) — see below. `gym-programme.js` (a separate, untouched file) found to have its own significant gaps, logged above as its own item, not fixed. **Nothing further outstanding from this investigation.**

**Small UX finding, 30 Jul — on-screen Exit button position may conflict with Android edge back-gesture.** First attempt at testing the on-screen Exit button (tapped near the screen's left edge, where the button sits) produced the *back-gesture* guard's card instead of the on-screen button's own card — consistent with an accidental edge-swipe being registered alongside the tap. A repeat tap, more centred, correctly showed the on-screen card. Not confirmed as a definite bug (could be device/gesture-nav-specific), but worth a design look since the Exit button's left-edge position is shared across all 7 files using this pattern, not just `workout.js`.

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

## 🟡 BUILD-GP — `gym-programme.js` exit-guard + activity fix: Code complete, 31 Jul 2026, on-device pending

Built the same session as the blueprint above, direct via repo access (git clone with the fine-grained token, edit, `node --check`, commit, push) rather than handing off to a separate build chat. Every file version in the blueprint's table was re-confirmed live before editing — all matched exactly.

**Graeme's Section 2 decision — additive, confirmed and implemented as recommended:**
- `recordSession()`'s `progressLog` write is untouched.
- `store.logActivity()` now runs alongside it at genuine completion (`finish-session` handler) and at partial-exit (new `savePartialSession()`), with the returned entry written to `currentActivityEntry`.

**All three confirmed issues fixed:**
1. **Exit protection** — `mountSessionGuard()`/`dismountSessionGuard()` wired for the back-gesture path; on-screen Exit now shows a coach-voiced `showExitConfirm()` Stay/Exit-and-save overlay instead of the old instant `router.navigate('today')`. Reused the existing `.session-exit-*` class family from `css/components/session-guard.css` v2 — confirmed no conflicting rules in `gym-programme.css`, no CSS file touched.
2. **`activityLog` visibility** — completions and partial exits now write to `activityLog` as well as `progressLog`, so `today.js` ("you moved today") and `progress.js` (recent-activity observations) will pick up gym-programme sessions for the first time.
3. **`reflect.js` silent discard** — `currentActivityEntry` is now set at both completion and partial-exit, so reflect answers (feel/painChange/note/moodAfter) save to a real, matching entry instead of being dropped or misattributed.

**One deliberate deviation from blind pattern-copy, made and logged in-session, not pre-agreed with Graeme:** activity `type` set to `"gym"`, not `"workout"` (the value `workout.js` uses for the identical pattern). Reasoning: `reflect.js`'s `QUESTIONS`/`FEEL_OPTIONS` maps have a `"gym"` key with tailored content ("I want to know what it actually felt like in there" / Felt strong / About right / Struggled) — `"workout"` isn't a key in either map and falls through to generic `"other"`/`"coach-session"` defaults. Checked first that `today.js`/`progress.js` don't filter `activityLog` by `type` at all, so this only affects which reflect question fires, nothing else. Flagged as a small, non-urgent follow-up for `workout.js` itself in the open-items table below — not fixed here, out of this session's file scope.

**Files changed, all pushed and confirmed live via raw GitHub fetch:**
- `js/views/gym-programme.js` v2 → v3
- `sw.js` v186 → v187 (deployed last, cache bump)
- `Documents/Live State/Changelog.md` — new entry added

**Verification done this session:** `node --check` passed on both changed `.js` files, non-ASCII byte scan confirmed only the pre-existing em-dash convention (no stray bytes, no smart quotes introduced), diff reviewed line-by-line before commit, raw GitHub fetch confirmed the cache-name bump and `mountSessionGuard` references are live on `main`.

**Not done — the actual gate before this can close:**
- [ ] Real gym-programme session, back-gesture exit mid-session → confirm Stay/Exit-and-save card appears, "Exit and save" saves a `status: "partial"` entry with correct `exercisesCount`.
- [ ] Real gym-programme session, on-screen Exit button → same card, same save behaviour.
- [ ] Real gym-programme session, genuine "Session done" completion → confirm Home says "you moved today," confirm it appears in Progress screen observations.
- [ ] After a genuine completion, answer reflect.js's questions → confirm the *matching* `activityLog` entry (not a stale one) now has `feel`/`painChange`/`note`/`moodAfter` populated. Confirm the question text is the gym-specific one ("I want to know what it actually felt like in there"), not the generic fallback.
- [ ] Quick regression check: Week 6 glance, Week 12 reflection, and A/B session-type alternation still work as before — none of today's changes touched that logic, but worth a glance per the blueprint's own "done" criteria.

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

## 📅 Six-Week Plan — Standing Section (folded in 31 Jul 2026, was Task Inventory Section J only)

Source: Task Inventory Section J v3 (23 Jul 2026 reprioritisation). Now maintained here going forward — update this table at session close alongside everything else, rather than letting it drift separately in the Task Inventory doc. Three fixed review checkpoints, not review-after-every-session: **27 Jul (held), 31 Aug (the honest go/no-go on mid-Sept beta), 14 Sept (pre-launch)**.

| Week beginning | Availability | Focus | Status |
|---|---|---|---|
| 27 Jul | Full | Safeguarding/HMRC start, BUILD-5, BUILD-3 | **Held.** BUILD-5 closed, BUILD-3 code-clean/on-device pending, safeguarding/HMRC still open. |
| 3 Aug | Full | Core Session investigation, Supabase scoping, BUILD-1 sub-question | **Ahead of schedule.** Core Session closed 30 Jul (early). BUILD-4 also closed early (wasn't due till this week). Supabase design blueprint ready. Two new findings this session (tier gating, coach-proposal doors) not yet reflected in original plan — see dashboard. |
| 10 Aug | Mon–Wed full, away Thu/Fri | Content audit (D-Audit), BUILD-4 align if time allows, national/local outreach, infra accounts, website building starts | Not yet started. BUILD-4 already closed (ahead of schedule), so this slot is now free for other priorities — worth revisiting given this week's tier-gating/coach-proposal findings. |
| 17 Aug | Mon only, then away (light laptop) | Admin only, close loose ends | Not yet reached. |
| 24 Aug | Away all week (light laptop) | Reactive only | Not yet reached. |
| 31 Aug | Full | **Review checkpoint — the real one.** Full reconciliation, honest go/no-go on mid-Sept beta. Device test programme, WCAG audit, follow-up outreach. | Not yet reached. |
| 7 Sept | Full | Final pre-beta admin/infra checks | Not yet reached. |
| 14 Sept | Full — target window | **Review checkpoint — pre-launch.** Pre-beta opens (target). | Not yet reached — this is the target date, not a confirmed one. |

**Worth flagging plainly:** the original plan didn't anticipate this week's tier-gating and coach-proposal-doors findings — both are now real candidates for the 10 Aug slot that BUILD-4 closing early has freed up. Not re-planning the whole six weeks over this, but worth a conscious decision rather than the slot silently filling with whatever comes up next.

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
| Product — Core Session `currentActivityEntry` data-integrity question | 🟢 **Fully closed, 30 Jul.** Complete on-device test pass across all 7 files — every fix confirmed working, CSS visually confirmed on all 7. Two real bugs found and fixed during testing itself (yoga stuck-screen, dedupe window too wide). `gym-programme.js` found separately broken, own item logged — now code-complete 31 Jul, see BUILD-GP Outcome section, on-device pending. | None — fully closed. | None. |
| Product — BUILD-4 Appendix A follow-up | 🟢 **Blueprint ready, 31 Jul** (`alongside_blueprint_build4-appendixA_31jul2026_v1.md`). All 18 fields ground-truthed today, 6 flagged with a specific overlap to check first. | Run session. | None. |
| Product/Infra — Supabase schema design | 🟢 **Blueprint ready, 31 Jul, design-only** (`alongside_blueprint_supabase-schema-design_31jul2026_v1.md`). Explicitly scoped to exclude live migration, DPA request, and tier-gating build — see the two dependency items below. | Run session — can run in either order relative to Appendix A, blueprint doesn't hard-require it first. | None hard; recommends reading whichever `Schema.md` version is current at session start. |
| Product — Tier gating (isPremium/isAthlete/lockedFeature) | 🟠 **New, 31 Jul.** Confirmed not built as a system — checked directly against live code (`tierGate`/`checkTierAccess`/`isPremium`/`hasAccess`: zero matches across `js/`; `tier` itself read in only 3 files with no gate logic). Flagged by the 27 Jul Supabase discussion as needing to exist before Supabase auth. **A full architecture was already scoped 9 May 2026** (S4-TG: `js/auth.js`, `store.js` helpers, complete feature-audit table) but never built. | Needs its own build session — the design work is already done, this is an implementation session. | Blocks live Supabase auth (not the design session). High priority — Personal tier is the active build focus. |
| Product — `upgrade.js` calls `store.getUserTier()`, which doesn't exist | 🔴 **New, 31 Jul, found while checking tier-gating status.** `upgrade.js`'s `render()` calls `store.getUserTier()` — confirmed absent from `store.js` entirely. Likely throws on navigation to the upgrade/membership screen. Not yet confirmed on-device (no crash report exists, but the code path is unambiguous). | Small standalone fix, or resolved automatically once the tier-gating build session (above) adds `getUserTier()` to `store.js` — check whether it's worth a quick isolated patch before then given it's a live crash risk. | None — ready to fix immediately. |
| Website — WCAG 2.2 AA contrast audit | 🟢 **Closed, 03 Aug.** Scroll-arrow + 5 more functional-border elements + badge backgrounds, all fixed and ratio-confirmed. `site.css` v7→v8. | None. | None. |
| Website — `/upgrade` page (W5) | 🟢 **Built, 03 Aug.** Static content complete from the already-locked architecture doc. `upgrade/index.html` v1, `site.css` v11, `js/site.js` v5. | Checkout wiring (Stripe/Supabase) — separate infra session, needs S-F3/S-F4 first. | Blocked on Supabase auth + Stripe setup, not on content. |
| Website — free vs premium colour system (broader ask) | 🟡 **Partially actioned, 03 Aug.** `/upgrade` page + coach-bubble colour decision cover Move. Family-wide version needs Learn/Life/etc. free-vs-premium specs written first — those don't exist yet for most products. | Graeme's call on whether to spec the other products or leave Move-only for now. | Not booked. |
| Website — cache-busting bug (`site.css?v=` stale on 4 pages) | 🟢 **Found and fixed, 03 Aug.** All 4 pages were still requesting `?v=7` after the stylesheet moved to v10 this session. | None — closed. | None. |
| Business — footer says "Build New Habits Ltd" | 🔴 **New, 03 Aug, found incidentally.** `js/site.js`'s shared footer renders "Ltd" on every website page. Business is an unregistered sole trader — must never be described as Ltd, per standing rule. Live right now. | Small text fix in `js/site.js`'s `FOOTER_LINKS`/copy string. | None — ready to fix immediately, just not done this session (found late, out of this session's scope). |
| Product — `coach-proposal.js` doors 2/3 ("Your programme" / "Something different") permanently disabled | 🟠 **New, 31 Jul, found via screenshot review.** `DOOR_COPY` hardcodes `enabled: false` and static "Being redesigned — check back soon." copy for 2 of the app's 3 main session-entry doors. Scoped as P5-CP-1 in the 23 Jun technical blueprint ("door framing rewrite... all three doors genuinely right") but has no current BUILD-x task ID — appears to have dropped off active tracking. Live right now, visible to any real user. | Needs scoping — is this the full P5-CP-1 door-framing rewrite, or a smaller "just re-enable these two with current copy" fix? Graeme's call. | Not booked. Worth prioritising — 2 of 3 main entry points into a session are currently dead ends. |
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
| Product — `gym-programme.js`: no exit protection, no `activityLog` write, reflect answers silently lost | 🟡 **Code complete, 31 Jul** — built same session as the blueprint, direct via repo access (clone/edit/push). Section 2 decision (additive) confirmed by Graeme and implemented exactly: `progressLog` write unchanged, `store.logActivity()` now runs alongside it at completion and partial-exit, `currentActivityEntry` set. Exit-guard wired (`mountSessionGuard`/`dismountSessionGuard`, `showExitConfirm()` overlay), matching `workout.js` v6 pattern. Activity type set to `"gym"` (not `"workout"`) — deliberate, logged in file header/changelog, see follow-up row below. `gym-programme.js` v2→v3, `sw.js` v186→v187, `Changelog.md` updated — all pushed and confirmed live via raw GitHub fetch. | **On-device confirmation** — no device available during the build session, code review + `node --check` only so far. Test checklist in BUILD-GP Outcome section below. | Booked as soon as Graeme can test on-device. |
| Product — `workout.js` activity type `"workout"` isn't a `reflect.js` question/feel-option key | New, 31 Jul, found while fixing `gym-programme.js`. `reflect.js`'s `QUESTIONS`/`FEEL_OPTIONS` maps have a `"gym"` key with tailored gym content but no `"workout"` key — `workout.js`'s own completions (`type: "workout"`) fall through to the generic `"other"`/`"coach-session"` fallback text instead. Not a data-loss bug (reflect still saves correctly) — a missed-specificity gap only. | Small fix if wanted: change `workout.js`'s `logActivity()` calls to `type: "gym"` to match, or add a `"workout"` key to `reflect.js`'s maps. Either works; not urgent. | Not booked, no urgency — logged for awareness. |
| Admin — project knowledge cleanup | New, 30 Jul. Superseded master-schedule versions (v68–v78) and 4 retired schema docs need removing from project knowledge — Claude can't delete these directly. | Graeme, via the UI, whenever convenient. | None. |
| Admin — `Admin/` historical backfill | New, 30 Jul. Repo's `Admin/` folder has this week's blueprints/handoffs only; dozens more exist in project knowledge back to March, not yet moved. | Separate future session if wanted. | Not booked, no urgency. |
| Product — Wellbeing-first entry point (new design idea) | 🆕 **New, 31 Jul, Graeme's idea.** Currently, reaching Notice/Wellbeing requires going through the coach → starting an activity → backing out. Proposed: a top-level "doorway" choice (Exercise / Wellbeing) before the coach path, so non-exercise-focused users aren't routed through session-shaped UI to reach reflection/journaling. Not yet scoped — genuinely new. See PM chat discussion 31 Jul for initial thoughts. | Needs a proper design conversation — architecture question, not a quick build. | Not booked. Worth prioritising given who this serves (e.g. a low-exercise-motivation persona) — currently a real access barrier, not just a UX nicety. |
| Product — Progress reflections (mood-delta, rest-reminder observations) | 🟡 **Partially built, confirmed 31 Jul.** `progress.js` v2 already generates real pattern observations — consistency, energy trend, activity-type, programme context (`_buildObservation()`, confirmed live). **Not yet built:** the two specific examples Graeme described — a same-session mood-entered-vs-finished delta observation, and an explicit "you've worked hard X times this week, you may need rest" overtraining-aware message. Both are natural extensions of the existing pattern, not a new system. | Small-to-medium build session, extending `_buildObservation()`'s existing pattern. | Not booked. |
| Product — Journal export (PDF) + Supabase sync | 🟡 **Fully spec'd, confirmed 31 Jul, not built.** `alongside_journal_export_template_spec.md` is a complete, detailed PDF export design (Premium tier). Noticing Hub spec's own implementation checklist has "Plan localStorage-to-Supabase sync logic" and "Settings > Wellbeing > Storage Location (local vs Supabase)" both still unchecked. Genuinely depends on the Supabase migration (see Supabase schema design blueprint) being live first — not a standalone gap. | Sequenced after Supabase auth/migration is live, not before. | Blocked on Supabase migration, not urgent until then. |

*All standing rules, Stream A/C/D/E detail not listed above are unchanged from v71–v78 — see those versions for full detail.*

---

## 🔑 Master Schedule → Repo Workflow — decided 30 Jul 2026

Graeme provided the fine-grained GitHub token directly in the PM chat so schedule updates can be pushed straight to the repo, rather than downloaded and uploaded manually via the GitHub web UI each time. From this version forward: the PM chat, at session close, writes the new version, pushes it to `Documents/Admin/master_schedule.md`, moves the previous version into `Documents/Admin/Past MS/`, and removes the superseded copy from project knowledge search results by uploading the new snapshot over it (the old project-knowledge entries themselves still need manual deletion by Graeme — Claude can't do that directly).

**Security note, worth having on record:** this token now lives in the PM chat's own conversation history, not just a build chat's. That's a wider exposure surface than the original "paste into the build chat that needs it" plan — mitigated by the same short expiry (7 days) already in place. Worth revisiting once the product's past the rapid-build phase, same as the original project-knowledge token storage trade-off already logged.

---

*Build New Habits · Alongside: Move · Master Schedule · 03 Aug 2026 v93*
