# Alongside: Move — Master Schedule
## 30 Jul 2026 v77

Build New Habits | Single source of truth for all build, business, website, and content tasks.
Supersedes `alongside_master_schedule_28jul2026_v76.md`. Remove v76 on upload.

**This version's substantive changes:** folds in outcomes from Graeme's 29 Jul meeting with Alex (Somerset Innovation Hub) — (1) solicitor question refined into a beta-minimum vs launch-minimum split; (2) BIZ-9 (IP/trademark) deprioritised on Alex's own experience; (3) U18/safeguarding position flagged as genuinely open, not resolved, pending Alex and his solicitor; (4) two new candidate outreach categories plus a real gap identified in the outreach messaging ("why would they do anything?"); (5) new unscoped task — LinkedIn business page + personal profile; (6) beta and public-launch dates now externally confirmed with Alex, with a named commercial rationale for the January 2027 launch window.

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
- [x] ~~**Meeting with Alex**~~ — 🟢 Held 29 Jul. Outcomes folded into this version — see new section below.
- [ ] **Friday: short review**.

## NEXT WEEK — WB 3 Aug

- **BUILD-4 (Schema Reconciliation) — promoted, now first, and now partially underway** (see below — a first pass of the field inventory is already done).
- **Supabase schema design session** — runs *after* BUILD-4 closes.
- Core Session data-integrity investigation
- BUILD-1's remaining sub-question
- BIZ-2, BIZ-3, INF-6, OUT-2, OUT-7
- **Org outreach category decision** (new, see Alex Meeting Outcomes below) — Graeme's call on whether workplace wellbeing reps and women's health groups join the Tier list, plus the "what's in it for them" messaging pass. Blocks OUT-2–OUT-8.

*Full six-week plan: Task Inventory doc, Section J (v5).*

---

## 🤝 Alex Meeting Outcomes — 29 Jul 2026

Captured in full in `alongside_alex_meeting_outcomes_29jul2026_v1.md`. Summary folded in here; that document remains the fuller record if detail is needed later.

**Legal — solicitor question refined.** Alex is reaching out to his solicitor contact with a specific framing: *"what's the minimum to be legally responsible?"* — with a working assumption that beta-stage requirements may be lighter than public-launch requirements. When the answer comes back, ask explicitly for the split rather than one combined answer. Relevant to BIZ-5, BIZ-6, BIZ-9 below.

**BIZ-9 (IP/trademark) — deprioritised.** Alex ran a logo unregistered for 20 years with no issue. Working position: don't worry about IP, especially the logo, not yet — if someone registers something similar first, the fallback is simply to change the logo. The product's actual IP (methodology, content, mechanics) is the genuinely distinct part, not the mark. Still worth a mention at the BIZ-5/6 solicitor consultation since it's a small add to an existing conversation, but no longer worth chasing separately.

**U18/safeguarding — genuinely open, not resolved.** Alex suggested "potentially we don't need to worry about U18." Graeme explained the safeguarding responsibility around collecting keywords from the mood meter; Alex understood the concern and will think on it and ask his solicitor. **This is not a decision — do not treat it as one.** Directly touches BUILD-9 (18+ age-gate), BIZ-6 (safeguarding sign-off), and the Crisis & Safeguarding Policy's own open item on parental notification (Section 9.4, unconfirmed as of v7). No schedule change until Alex/solicitor respond.

**Outreach — new categories suggested, plus a real gap surfaced.** Alex suggested workplaces with wellbeing reps, and women's health groups/communities, as additional outreach targets — he's thinking on this further too. He also raised the sharpest open question in the whole outreach effort: **"why would they do anything?"** — the current outreach messaging doesn't yet spell out the concrete benefit to the organisation itself. Two actions before any new-category outreach goes out: (1) Graeme's decision on whether these join the existing Tier list or run as a separate track, (2) a messaging pass answering "what's in it for them" per org type. This was already logged as "org outreach categories — undecided, blocks OUT-2–OUT-8" — still blocking, now with two named candidates and one clear open question instead of a vague undecided state.

**New task — LinkedIn presence.** Graeme wants a BNH business page and a personal profile, prompted by Alex's suggestion that LinkedIn plus direct email is a good channel for reaching both organisations and named individuals. Not yet scoped — Graeme has said he'll need help designing this properly. New item, no urgency attached yet, ready whenever Graeme wants to start.

**Deadlines — externally confirmed.** Alex agrees on two hard deadlines: **partner group/testing community + beta start, mid-September 2026**, and **public launch, January 2027** — the latter specifically because that's when people are most active in the "new year, new fitness" mindset, a named commercial rationale from Alex rather than just an internal target. This validates the dates already on this schedule; it doesn't resolve the underlying capacity risk (solo build/business load) flagged separately in Graeme's own meeting-prep review — both remain true at once.

---

## 🧹 Cleanup Task List — deferred to app sign-off, not actioned now

**Purpose:** things found along the way that are safely inert — not blocking anything, causing no active harm sitting there — worth a final pass once the whole app build is complete, rather than either forgetting them or interrupting a working session to chase something low-stakes. Nothing here gets actioned until Graeme explicitly says "we're at sign-off, let's clear this."

| Item | Found | What it is | Why it can wait |
|------|-------|------------|------------------|
| `js/data/exercises/index.js` | 28 Jul | Orphaned duplicate of `js/data/exercises.js` — identical content, only import paths differ (confirmed via diff). No direct or directory-style imports found anywhere in the codebase, checked twice. | Not imported, causing no active harm. Real risk is future confusion (someone edits the wrong copy), not present danger. Worth removing at sign-off via the GitHub web UI, not urgent today. |

**How to add to this list going forward:** any session that finds something safely inert — old code, superseded docs, an orphaned file, a deprecated pattern nothing depends on — logs it here instead of either fixing it mid-session (scope creep) or letting it quietly vanish. One line: what it is, why it's safe to leave, found-date.

**At sign-off:** work through top to bottom, re-confirm each item is still genuinely inert (don't assume nothing changed since logging), then remove.

---

## Thread scroll-bug audit — resolved status, 28 Jul 2026

This item has been sitting flagged-but-unactioned in various forms since 3 Jul (found in two files independently, an explicit recommendation to audit other thread-style views was never followed up). Checked properly today via direct repo analysis:

- **`checkin.js`** — **already fixed** (v5). Had the confirmed bug: `_scrollToBottom()` set `scrollTop = scrollHeight` unconditionally on every append, jumping past new content regardless of what was actually new. Replaced with `_scrollToNewElement(el)`, using `el.scrollIntoView({ block: "start" })` — the top of new content lands at the top of the visible thread.
- **`onboarding/thread.js`** — **already fixed** (v7), same root cause, same fix pattern, explicitly cross-referenced to the checkin.js v5 fix in its own changelog. Ten call sites consolidated into the one shared function.
- **`onboarding/reflection.js`** — **checked, does not have the same bug.** Uses a different pattern entirely — `scrollIntoView({ block: "nearest" })` — which doesn't share the blunt unconditional-jump mechanism the other two had. This file was swept into the original 24 Jul grep as a candidate on pattern-matching alone; on closer reading it's architecturally different. Not confirmed broken. No fix applied — applying the checkin.js/thread.js patch here without evidence of the same bug would be a change without a reason.

**Net finding: the audit is complete, and the situation is better than the schedule has shown for weeks** — 2 of 3 candidate files were already resolved (just never marked as such here), and the third doesn't need the fix it looked like it might. Closing this item.

---

## BUILD-4 (Schema Reconciliation) — first pass underway, 28 Jul 2026

Direct repo analysis (git clone, live `store.js` v10 vs `schema_v1_7` + the 16 Jul v1.8 delta note) produced real progress ahead of the formal align session:

**Confirmed: Error 1 from the 16 Jul delta note is real, exactly as flagged.** `todaysWorkouts`, `workoutsGeneratedAt`, `todayIntensity`, `activeWorkout` do not exist anywhere in live `store.js`. The real live mechanism is `generatedSession: { session, builtAt, inputs }`. Schema v1.7's "Workout Generation Cache" section describes a mechanism that was replaced and never updated in the docs.

**Resolved: Error 2 from the delta note, more nuanced than flagged.** Both `startDate` and `startedAt` genuinely exist live — not a documentation error, two different fields on two different objects. `activeProgramme.startDate` is correctly documented in v1.7. `unwellMode.startedAt` belongs to an entirely separate, **entirely undocumented** object (illness/recovery tracking: `active`, `kind`, `startedAt`, `recoveryStartedAt`, `daysHeld`, `kindAtRecovery`) — a missing feature area, not a wrong field name.

**Confirmed: `exerciseFeedback` is live, not dormant.** `applyFeedbackWeighting()` genuinely reads it and adjusts exercise scoring in `workoutGenerator.js`. Resolves one of the two open questions the 16 Jul delta note flagged for the reconciliation session — no "specified but never built" pattern here, unlike empathy transfer. (The other flagged question, `stats`, is still unconfirmed.)

**Scale, now a real number instead of an estimate:** 179 distinct fields in live `store.js`. 155 have no documentation trail across schema v1.7 and the v1.8 delta combined. Grouped into likely feature-area batches for whoever runs the align session: `unwellMode`, `hormonalTracking`, `gymProgrammeSession`/`gymProgrammeWeek`, `hardBeforeSelections`/`hardBeforeShownAt` (possibly a Noticing Hub naming mismatch, worth checking against Section 18 rather than assuming fully new), `chaptersUnlocked`/`dataUnlocked`, `annualReflection`, `castleShownAt`.

**Related finding, logged to the Cleanup Task List above, not BUILD-4 itself:** `js/data/exercises/index.js` is an orphaned duplicate of `exercises.js`.

**Not done in this pass, genuinely needs the full session:** writing an actual schema.md v1.9 (a judgement call on documentation depth per field, not mechanical); checking `stats` for the dormant-or-not pattern; resolving the three-competing-documents problem (frozen v1.3 schema.md, schema_v1_7, schema_md.docx).

---

## Supabase Scoping — commuter conversation, 27 Jul 2026

Informal scoping discussion, no files touched. Decisions ready to carry into the formal Supabase schema design session once BUILD-4 closes.

**Decision — full data sync, not account-only.** Reversed from the original account-only scope (profiles, subscription, payment status). Device continuity is core to the product's value — changing phones must not lose a multi-year coaching relationship. All coaching data now in scope, tied to the account. Materially increases the schema design session and RLS-policy work (every table, not two).

**Decision — anonymised research analysis split out as a separate, later system.** Full sync (user continuity) and anonymised aggregate research analysis are different systems, different consent bases, different technical requirements. Genuine anonymisation of behavioural health data is hard at small beta-cohort scale. Deferred until there's enough volume for aggregation to mean something.

**RLS clarified — protects users from each other, not from Build New Habits.** Row-Level Security stops one logged-in user seeing another's rows, and contains the blast radius of a leaked public API key. It does not restrict the `service_role` key or dashboard access, which bypass RLS entirely. Graeme confirmed this is intended — founder/team access for product management is not a privacy gap. **Action for the solicitor/Privacy Policy pass:** state plainly that the team can access data to operate and improve the service, rather than implying no one can — check current draft wording against this.

**Journal Privacy Rule cross-check.** Full sync includes journal content. Syncing for backup/continuity is fine; the sync/analysis pipeline must not become a route to signal detection on journal content. Re-state explicitly as a constraint when the schema session runs.

**Breach robustness — discussed, not fully closed.** Supabase baseline: AES-256 at rest, TLS in transit, SOC 2 Type 2. RLS contains the most common real-world mistake (leaked anon key). Does not cover `service_role` key compromise — must never appear client-side, only in a serverless function environment; single highest-value secret in the stack. Realistic weak point for a one-person company is founder credential hygiene, not Supabase's infrastructure. **INF-7 (breach incident response process) reconfirmed open** — not a formality, a real prerequisite before full sync of all coaching data is genuinely ready.

**Resulting build sequence:** 1. BUILD-4 (schema reconciliation, now partially underway — see above). 2. Supabase schema design (full-sync scope, RLS per table). 3. Tier gating (S-F1) and Supabase auth (S-F3) as previously sequenced.

---

## BUILD-5 — full resolution, 24 Jul 2026

Three bugs found and fixed, not the single targeted fix originally scoped — all confirmed on-device.

**Fix 1** — `workoutGenerator.js` v1.9→v1.10. `applyDurationCap()` only checked against a fixed per-focus ceiling, never `availableTime`. Capped against `min(focusCap, windowCap)`.

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

## One-Page Dashboard — 30 Jul 2026

| Stream | Current position | Immediate next action | Blocker? |
|--------|-----------------|----------------------|----------|
| Product — BUILD-1 (Nav-gap fix) | 🟡 Core mechanism confirmed. Sub-question open. | Quick confirmation. | None. |
| Product — BUILD-2 (Proposal-loop fix) | 🟢 Closed 23 Jul. | — | None. |
| Product — BUILD-3 (Session-view audit) | 🟡 Code confirmed clean twice. Not yet on-device tested. | On-device pass, expected formality. | Needs phone only. |
| Product — BUILD-4 (Schema Reconciliation) | 🟡 Partially underway, 28 Jul — field inventory done (179 fields, 155 undocumented), two delta-note errors resolved, `exerciseFeedback` confirmed live. Full align session still needed. | Align session — WB 3 Aug, before Supabase. | Not booked. |
| Product — BUILD-5 (available-time bug) | 🟢 Closed, confirmed on-device 24 Jul. Three fixes. | None. | None. |
| Product — BUILD-6 | Confirmed non-crashing. Decision still open, low priority. | Graeme's call. | Not booked. |
| Product — BUILD-9 (18+ age-gate) | Not yet scoped. **U18 safeguarding position genuinely open** — Alex suggested it may not be needed, unconfirmed, pending his solicitor (29 Jul). | Hold scoping until Alex/solicitor respond. | Waiting on Alex. |
| Product — Thread scroll-bug audit | 🟢 Closed, 28 Jul. 2 of 3 files already fixed, third checked and cleared. | None. | None. |
| Product — B3-2-Test follow-ups | 2 items remain (chip overflow, reflect.js cache-clear confirmation). | Fold into a future session. | Not booked, low priority. |
| Product — Core Session data-integrity question | Blueprint ready. | Run — next week. | Not booked. |
| Product/Infra — Supabase schema design | Scoped in conversation 27 Jul (see above). | Run after BUILD-4 closes. | Blocked on BUILD-4. |
| Website — Home/Products/Community/Impact | 🟢 Confirmed clean. | None unless BUILD-9 triggers a copy pass. | None. |
| Outreach — OUT-1 (reshaped) | Brief drafted, not yet run. | Run the session. | Blocks OUT-2–OUT-7. |
| Outreach — org category decision | New, 29 Jul. Alex suggested workplace wellbeing reps and women's health groups; "why would they do anything?" messaging gap identified. | Graeme's decision + messaging pass. | Blocks OUT-2–OUT-8. |
| Business — BIZ-9 (IP/trademark) | Deprioritised, 29 Jul, per Alex. No urgency to register logo/IP now. | Raise briefly at BIZ-5/6 solicitor consultation only. | None urgent. |
| Business — solicitor question framing | New, 29 Jul. Ask for beta-minimum vs launch-minimum legal requirements, not one combined answer, when Alex's solicitor responds. | Awaiting Alex/solicitor. | Awaiting Alex. |
| Marketing — LinkedIn presence | New, unscoped, 29 Jul. BNH business page + Graeme's personal profile. | Scope whenever Graeme's ready to start. | Not booked. |
| Infra — INF-7 (breach response process) | Reconfirmed open, 27 Jul. No procedure written. | Write short internal procedure. | Same trigger as BIZ-3. |
| Infra — Supabase account 2FA | New, 27 Jul. | Graeme's own action. | None. |
| Cleanup — `exercises/index.js` | Logged, 28 Jul. | Sign-off only. | None, deliberately deferred. |

*All standing rules, Stream A/C/D/E detail not listed above are unchanged from v71–v76 — see those versions for full detail.*

---

*Build New Habits · Alongside: Move · Master Schedule · 30 Jul 2026 v77*
