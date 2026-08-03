# Alongside: Move — PM Briefing
## 03 Aug 2026 v1

Build New Habits | Session handoff, written by the PM chat for the PM chat's own record — today combined three planned sessions from the 31 Jul combined session runner, one same-day follow-up fix, and this briefing itself.

---

## 1. What ran today, in order

1. **BUILD-4 Appendix A follow-up** (Session 1 of the 31 Jul runner) — closed.
2. **Supabase schema & architecture design** (Session 2 of the runner) — closed, design-only as scoped.
3. **Website WCAG audit** (Session 3 of the runner) — **skipped.** Already run in full, earlier the same day, directly in this chat, before the runner was pasted in. Re-running it would have redone finished work against a repo state that had already moved (`site.css` was at v17, not the v7 the brief assumed).
4. **`userTier` bug fix** — same-day follow-up, not part of the original runner, done in response to a direct request once the bug was surfaced.
5. **This briefing.**

---

## 2. State of the repo now

- `Documents/Live State/Schema.md` — **v1.10**. All 18 previously-unclassified fields resolved.
- `Documents/Admin/master_schedule.md` — **v98**. Superseded versions v95–v97 archived to `Documents/Admin/Past MS/`.
- `Documents/Admin/alongside_supabase_schema_design_03aug2026_v1.md` — new.
- `Documents/Live State/Changelog.md` — updated with today's entries.
- `js/views/session-builder-ui.js` — **v2** (was v1 since creation, 01 Jun — never version-bumped until today).
- `sw.js` — **v188**.

All version bumps confirmed live via a fresh clone, not just `git push`'s exit code — worth noting since `raw.githubusercontent.com` showed stale content for a few minutes after each push today (CDN caching lag, not a real problem, but a reminder not to trust that specific verification method alone if it disagrees with a fresh clone).

---

## 3. Real findings today, ranked by how much they matter

**Fixed:**
- `session-builder-ui.js`'s `isPremium()` read a field (`userTier`) nothing ever wrote, so it always evaluated `false` — **paying Personal/Athlete subscribers were seeing Personal-tier session-builder options rendered as locked.** Now reads the genuine field, `tier`. Live, not yet on-device confirmed.

**Found, not fixed (touch-once, logged for later):**
- `proposalBias`, written by `coach-reflection.js` for every reflection type (severe pain → rest, burnout/consecutive-days/returning → lighter), is **never read anywhere.** The coach's reflection logic computes a signal intended to soften the next proposal and nothing acts on it. Same "specified but never wired up" pattern as `exerciseFeedback`.
- Five dormant fields (write-only, no reader): `workoutHistory`, `consentAt`, `consentGiven`, `usingGeneratedSession`, and (found earlier, unrelated to the 18) `community.credits`.
- `gymProgrammeWeek` is a dead cosmetic rotation seed in `reflect.js` — real programme-week tracking is `activeProgramme.currentWeek`.

**Still open from before today, not touched:**
- `upgrade.js` calls `store.getUserTier()`, which doesn't exist anywhere in `store.js` — a **separate, still-live crash risk** on the upgrade/membership screen. Different bug from the one fixed today (that was a field-name mismatch inside a local function; this is a call to a method that was never built at all). Not fixed this session — wasn't in scope, and fixing it well probably wants to happen alongside the tier-gating build below, not as an isolated patch.
- The full tier-gating architecture (S4-TG, scoped 9 May 2026) was never built. `js/auth.js` doesn't exist. Today's two findings (`userTier` field confusion, `upgrade.js` crash) are both symptoms of this same underlying gap, not two unrelated bugs.

---

## 4. Recommended next priorities

In order, per the reasoning already logged in the Supabase design doc's Section 8:

1. **Tier-gating build** — highest priority, independent of Supabase. Now has two concrete symptoms to fix (`upgrade.js` crash, and confirming today's `userTier` fix on-device) plus the underlying gap (no `js/auth.js`, no enforcement layer) to actually close. Not yet scoped as its own blueprint.
2. **BIZ-1 (HMRC registration)** — still untouched, still gates the Supabase DPA request and the whole real-migration timeline. Business-process work, not build work, but the longest pole in the tent right now.
3. **Supabase project creation + migration build** — design is ready (`alongside_supabase_schema_design_03aug2026_v1.md`), but shouldn't start until 1 and 2 above are further along, per the design doc's own reasoning.

---

## 5. What needs Graeme, not further automated work

- **On-device testing** — see the separate testing schedule, this is the single largest block of "can't be closed from this chat."
- **`consentGiven`/`consentAt` intent check** — these are written at onboarding but never read back anywhere. Likely fine as an audit-trail record, but worth a quick confirmation given consent has legal/ToS weight, not just product weight.
- **`community.credits` display decision** — Impact Credits are being earned (1–2 per session) but nothing anywhere shows a user their own total or the community total. Worth a decision on whether that's a near-term build item or fine to leave backend-only for now.
- **Project knowledge cleanup** — v95, v96, v97 master schedule snapshots are now superseded in project knowledge; only the repo copy needs to stay current, but the stale project-knowledge entries can't be removed from this side.

---

*Build New Habits · Alongside: Move · PM Briefing · 03 Aug 2026 v1*
