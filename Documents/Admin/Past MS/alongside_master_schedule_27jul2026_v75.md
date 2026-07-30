# Alongside: Move — Master Schedule
## 27 Jul 2026 v75

Build New Habits | Single source of truth for all build, business, website, and content tasks.
Supersedes `alongside_master_schedule_26jul2026_v74.md`. Remove v74 on upload.

**This version's substantive change:** Logged outcomes of a commuter-time Supabase scoping conversation (27 Jul) — full data sync decision, anonymised-research split, RLS/admin-access clarification, breach robustness notes, and a 2FA action. Also resequenced NEXT WEEK: BUILD-4 (Schema Reconciliation) now runs **before** Supabase schema design, not alongside or after it — Supabase can't be scoped "full and complete" against a schema that's still in three-way conflict.

---

## ⭐ THIS WEEK — WB 27 Jul

- [x] ~~**Send solicitor pack to Alex**~~ — done, 24 Jul.
- [ ] **Safeguarding reviewer outreach** — still open.
- [ ] **HMRC sole trader registration** — untouched.
- [x] ~~**BUILD-5 fix session**~~ — 🟢 **Closed, confirmed on-device 24 Jul.** Turned out to be three bugs, not one — see breakdown below.
- [ ] 🟡 **BUILD-3 on-device test pass** — code confirmed clean by a second, independent static trace, 24 Jul. On-device pass still the correct final gate, expected to be a formality.
- [ ] **OUT-1 (reshaped) — Community validation reshaping session** — brief ready (`alongside_brief_community_reshaping_26jul2026_v1.md`). Replaces the bare "confirm categories" task with a full org-first outreach + safeguarding co-design session in a separate chat.
- [ ] **Supabase account 2FA** — new, small, Graeme to set up directly. Not code, no session needed.
- [ ] **Friday: short review**.

## NEXT WEEK — WB 3 Aug

- **BUILD-4 (Schema Reconciliation) — promoted, now first.** Must close before Supabase schema design starts (see below).
- **Supabase schema design session** — runs *after* BUILD-4 closes, not alongside it. Full-sync scope (see Supabase Scoping section below) — larger than the originally-spec'd profiles/subscription_events tables.
- Core Session data-integrity investigation
- BUILD-1's remaining sub-question
- BIZ-2, BIZ-3, INF-6, OUT-2, OUT-7

*Full six-week plan: Task Inventory doc, Section J (v5).*

---

## Supabase Scoping — commuter conversation, 27 Jul 2026

Informal scoping discussion, no files touched. Decisions below are ready to carry into the formal Supabase schema design session once BUILD-4 closes.

**Decision — full data sync, not account-only.** Originally scoped Supabase to hold account-level data only (profiles, subscription tier, payment status), with coaching data (check-ins, journal, workout history) staying local. Reversed: device continuity is core to the product's value — a user changing phones must not lose a multi-year coaching relationship. All coaching data now in scope for Supabase, tied to the account. This materially increases the size of the schema design session and the RLS-policy work (every table, not just two).

**Decision — anonymised research analysis split out as a separate, later system.** Full sync (for the user's own continuity) and anonymised aggregate analysis (for proof-of-concept / research purposes) are two different systems with different consent bases and different technical requirements. Genuine anonymisation of behavioural health data is hard to get right, especially at small beta-cohort scale. Not scoped into the Supabase sync build — deferred until there's enough volume for aggregation to mean something.

**RLS clarified — protects users from each other, not from Build New Habits.** Row-Level Security (Postgres/Supabase feature) enforces that a logged-in user can only read/write their own rows — it stops one user seeing another's data, and contains the blast radius if a public API key leaks. It does **not** restrict the `service_role` key or dashboard access, which bypass RLS entirely. Graeme confirmed this is intended — founder/team access to usage data is necessary for product management, not a privacy gap. **Action for solicitor/privacy policy pass:** the Privacy Policy should say the team can access data to operate and improve the service, rather than implying no one can see it — current draft wording needs checking against this.

**Journal Privacy Rule cross-check.** Full sync includes journal content. Syncing for backup/continuity is fine; the sync/analysis pipeline design must not become a route to signal detection on journal content. Re-state explicitly as a constraint when the Supabase schema session runs.

**Breach robustness — discussed, not yet fully closed.**
- Baseline covered by Supabase: AES-256 at rest, TLS in transit, SOC 2 Type 2 certified infrastructure.
- RLS contains the most common real-world Supabase mistake (leaked anon/public key exposing all rows).
- Does **not** cover: `service_role` key compromise (bypasses RLS entirely) — must never appear in client-side code, only in a serverless function environment. This is the single highest-value secret in the stack.
- Realistic weak point for a one-person company is founder credential hygiene (phishing, compromised device, reused passwords), not Supabase's own infrastructure.
- **Gap confirmed still open:** INF-7 (data breach incident response process — who decides on ICO/user notification, a log to record decisions and timings) is not yet written. Flagged in the task inventory already; this conversation reconfirms it's a real prerequisite, not a formality, before "full sync of all coaching data" can be considered genuinely ready.

**Resulting build sequence (was: tier gating → Supabase setup → Supabase auth):**
1. BUILD-4 — schema reconciliation, closes the three-way schema.md conflict.
2. Supabase schema design — full-sync scope, RLS policy per table, informed by the points above.
3. Tier gating (S-F1) and Supabase auth (S-F3) as previously sequenced.

---

## BUILD-5 — full resolution, 24 Jul 2026

Blueprint (`alongside_blueprint_BUILD-5_24jul2026_v1.md`) scoped this as one targeted fix to `applyDurationCap()`. On-device testing surfaced two further, genuinely separate bugs in the same feature — all three now fixed and confirmed on-device across multiple runs.

**Fix 1 — `workoutGenerator.js` v1.9 → v1.10.** The originally-scoped fix. `applyDurationCap()` only ever checked total session length against a fixed per-focus ceiling (30–50 min), never against the user's declared `availableTime`. Added `AVAILABLE_TIME_WINDOW_MINUTES` and capped against `min(focusCap, windowCap)`.

**Fix 2 — `coach-proposal.js` v11 → v12 (found during testing, out of original file scope, fixed with sign-off).** `_getAvailableTime()` read from two store fields (`checkinHistory[today].availableTime`, `lastCheckin.availableTime`) that `checkin.js` never actually writes to — it always fell through to a hardcoded literal `30`, then wrote that straight back over the correct value on every mount of the proposal screen, before generation ever ran. This is why nothing tested correctly at first, and almost certainly the origin of the stray `30` found early in testing. Fixed to read `store.get('availableTime')` directly. `workoutGenerator.js` v1.10 → v1.11 alongside this, to export `AVAILABLE_TIME_WINDOW_MINUTES` for reuse rather than a second hardcoded copy.

**Fix 3 — `workoutGenerator.js` v1.11 → v1.12 (found during testing, same day).** With fixes 1 and 2 both live, sessions correctly stopped exceeding `availableTime` — but now undershot it instead ("Quick"/20-min sessions landing at 9–19 min). Root cause: `selectExercises()` picked a fixed, small number of main exercises (1, for "Quick") regardless of how short they were — real exercise data runs 60–90 sec for most strength/mobility items. Fixed with a duration-aware fill loop, bounded by a new `MAIN_FILL_CEILING` sanity max. Verified against real exercise-database durations in a Node simulation before handoff (not just read), and confirmed by Graeme on-device: 3 tests, 3 results landing around 20 min. Side effect: also resolved the previously-flagged "micro" floor issue (0 main exercises), since the fill loop now always adds at least 1.

**Cache bumps across the session:** `sw.js` v176 → v177 → v178 → v179, one per functional deploy.

**Residual, not fixed today, logged for awareness rather than action:** the duration-aware fill still lands under target on average for short-exercise focus types (strength/mobility ~14 min average against a 20-min ask in simulation) because most individual exercises are genuinely short and the sanity-max caps how many can be added. Getting closer still would mean weighting selection toward longer exercise variants within a category — a bigger change, not attempted. Graeme confirmed the current result as good enough on-device; revisit only if it resurfaces as a real complaint.

---

## B3-2-Test follow-ups — 2 items, one re-confirmed via static trace 24 Jul

1. ~~**Duplicate `activityLog` entries**~~ — resolved (B3-3).
2. ~~**Breathing doesn't route to reflect screen**~~ — resolved, confirmed by design.
3. **Check-in feeling-word chip row overflow/wrapping** — still open, untouched. Cosmetic.
4. 🟡 **Reflect textarea sizing/contrast** — **code confirmed correct, 24 Jul** (`reflect.css` imported, in `sw.js` SHELL_URLS, contrast 11.87:1 against `#1E293B`). The 23–24 Jul re-discovery is most likely a stale device cache, not a real regression. Before folding this back open: hard-reload the test device's service worker cache and re-check. If it still fails on-device after a clean cache, that's a genuinely new finding and needs its own look — but the code itself is not the problem.

**Going forward:** item 3 remains the only unambiguously open item in this bucket. Item 4 is provisionally closed pending one cache-clear confirmation.

---

## Static Analysis Session findings, 24 Jul — full detail in session handoff doc

- **BUILD-5** — see full resolution section above. Originally "Confirmed Broken, root cause found" from static analysis; now closed.
- **BUILD-3** — Confirmed Working (second independent pass, all 9 files).
- **BUILD-4** — schema drift confirmed larger than 16 Jul delta note estimated (100+ undocumented fields in store.js v10 vs schema v1.7). New sub-finding for the reconciliation session: retire dead `todaysWorkouts`/`workoutsGeneratedAt` cache writes in `workoutGenerator.js` — nothing reads them; `generatedSession` is the real live cache. **Now promoted ahead of Supabase schema design — see Supabase Scoping section above.**
- **BUILD-6** — confirmed guarded/non-crashing (`typeof` check present). Decision (build for real vs. strip dead reference) unchanged, still open, still low priority.
- **Orphaned code sweep** — no new dead code found. `getStrategicRationale()` remains the only confirmed case.
- **Website** — nav links, colour tokens, and copy all confirmed clean across all four live pages. No 404s, no youth-implying language attached to Move itself. Content gap flagged: no page currently states an explicit age policy for Move — relevant once BUILD-9 (18+ age-gate, DOB capture, not yet scoped) gets scoped; the website should get a matching copy pass at that point, not before.

---

## One-Page Dashboard — 27 Jul 2026

| Stream | Current position | Immediate next action | Blocker? |
|--------|-----------------|----------------------|----------|
| Product — BUILD-1 (Nav-gap fix) | 🟡 Core mechanism confirmed. Onboarding/thread/sheet visibility sub-question open. | Quick confirmation. | None. |
| Product — BUILD-2 (Proposal-loop fix) | 🟢 Closed 23 Jul, verified on-device. | — | None. |
| Product — BUILD-3 (Session-view audit) | 🟡 Code confirmed clean twice (23 Jul syntax pass + 24 Jul independent static trace). Not yet on-device tested. | On-device test session — **this week.** | Needs phone only, expected formality. |
| Product — B3-2-Test follow-ups | 2 items, 1 provisionally closed pending cache-clear confirmation (see above). | Fold into a future `checkin.js`/`reflect.js` session, or confirm item 4 closed on-device. | Not booked, low priority. |
| Product — Core Session data-integrity question | Found 23 Jul. Not investigated. Blueprint ready. | Run the investigation — **next week.** | Not booked. |
| Product — BUILD-4 (Schema Reconciliation) | Canonical confirmed (v1.7 vs live v10). Scope now confirmed larger than the 16 Jul estimate, plus one new dead-code item (`todaysWorkouts`). **Promoted to run first, WB 3 Aug — now blocks Supabase schema design.** | Align session — **WB 3 Aug, before Supabase.** | Not booked. |
| Product/Infra — Supabase schema design | 🟡 Scoped in conversation 27 Jul: full-sync (all coaching data, not just account/subscription), RLS per table, anonymised research split out as a later separate system, breach-response gap (INF-7) reconfirmed open. | Run **after** BUILD-4 closes, WB 3 Aug. | **Blocked on BUILD-4.** |
| Product — BUILD-5 (available-time bug) | 🟢 **Closed, confirmed on-device 24 Jul.** Three bugs found and fixed (see full breakdown above) — `workoutGenerator.js` now v1.12, `coach-proposal.js` now v12, `sw.js` now v179. | None. | None. |
| Product — BUILD-6 (`getStrategicRationale()`) | Confirmed non-crashing (guarded), 24 Jul. Decision on build-vs-strip still open, low priority, unchanged. | Graeme's call, whenever. | Not booked. |
| Product — BUILD-9 (18+ age-gate) | Surfaced 23 Jul, not yet scoped. Website content gap (no stated age policy) confirmed 24 Jul as the matching website-side item. | Scope into a blueprint. | Not booked. |
| Website — Home/Products/Community/Impact | 🟢 Confirmed clean 24 Jul: colour tokens match app, no broken internal links, no youth-implying language attached to Move. | None needed unless BUILD-9 scoping triggers a copy pass. | None. |
| Outreach — OUT-1 (reshaped): Community validation, org-first | 🟡 Brief drafted 26 Jul (`alongside_brief_community_reshaping_26jul2026_v1.md`). Replaces cold-post plan with org-first approach (White Ribbon UK, national neurodivergent orgs, national nature/rewilding orgs — same categories already in the beta engagement strategy, just not yet formally ticked as OUT-1). Not yet run. | Run the session (separate chat): plain-language safeguarding summary, outreach message drafts, reshaped validation plan, optional form, confirm category order. | Blocks OUT-2 through OUT-7 until categories are formally confirmed and messages drafted. |
| Infra — INF-7 (breach incident response process) | Reconfirmed open, 27 Jul, during Supabase breach-robustness discussion. No procedure written yet. | Write short internal procedure (detection → notification decision → log). | Same trigger as ICO registration (BIZ-3). |
| Infra — Supabase account 2FA | New, 27 Jul. Graeme to action directly, no session needed. | Set up before Supabase work begins in earnest. | None. |

*All streams and standing rules not listed above are unchanged from v71/v72/v73 — see those versions for full detail.*

---

*Build New Habits · Alongside: Move · Master Schedule · 27 Jul 2026 v75*
