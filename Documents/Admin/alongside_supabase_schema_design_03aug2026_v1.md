# Alongside: Move — Supabase Schema & Architecture Design
## 03 Aug 2026 v1

Build New Habits | Design-only session. No Supabase project created, no SQL run, no auth live. Output is a schema design and architecture decision record, ready for when the two real dependencies below clear.

---

## 0. Dependencies — reconfirmed today, not assumed

Both checked directly against live code again before starting, since this brief was written 31 Jul and things move fast here:

- **DPA/TIA request needs registered business details.** BIZ-1 (HMRC sole trader registration) is still untouched on the master schedule. No live Supabase project holding real user data should exist before this clears.
- **Tier gating still doesn't exist as a system.** Reconfirmed today: `js/auth.js` does not exist. No `tierGate`, `checkTierAccess`, `hasAccess`, or central gate mechanism anywhere in `js/`. `tier` itself is read correctly in `settings.js`, `progress.js`, `coach-proposal.js` — but there's no enforcement layer. Worse than the 31 Jul note assumed: today's BUILD-4 Appendix A follow-up found `session-builder-ui.js` reads a field (`userTier`) that doesn't exist at all, so its own local premium check always fails — a live bug, not just an absent system. This session designs the schema **with** tier gating in mind (a `tier` column, ready to be enforced later) but does not build tier gating itself — that's still a separate, not-yet-scoped session.

---

## 1. EU Region Decision

**Recommendation: Frankfurt (`eu-central-1`).**

Reasoning: the technical difference is genuinely marginal for this app — no latency-sensitive real-time feature exists or is planned (no live multiplayer, no streaming). Both regions are GDPR-compliant EU locations. Frankfurt is chosen on two soft factors: (1) it's Supabase's more heavily-used EU region, meaning marginally faster support/tooling maturity in practice; (2) Germany's data protection framework (BDSG alongside GDPR) is a known, well-documented quantity for a UK-based DPA/TIA process, and Ireland's DPC has a heavier current caseload profile that's occasionally cited as a factor in processing-time discussions for smaller controllers. Neither reason is decisive — Ireland (`eu-west-1`) is a perfectly reasonable alternative if Graeme has a preference. Flag for a quick sign-off, not a deep debate.

---

## 2. Table Design

Source of truth: `Schema.md` v1.10 (03 Aug), the first version produced after full field-level ground-truthing. Dormant/dead fields identified there (`proposalBias`, `workoutHistory`, `consentAt`, `consentGiven`, `usingGeneratedSession`, `todayEnergy`, `userTier`, `gymProgrammeWeek`) are still included in the design below where they represent real stored data — a dormant field is still data that needs a column if it exists in `localStorage` today, even if nothing currently reads it. Dead fields with no writer at all (`todayEnergy`, `userTier`) are excluded — there's nothing to migrate.

### 2.1 Core approach: hybrid relational + JSONB, not full normalisation

**Recommendation, not a silent choice — the tradeoff:**

- **Full relational** (a table per nested object, foreign keys everywhere) would be the "correct" long-term design, but `store.js`'s ~180 fields across 19 documented areas would mean 15–20 tables for a first migration, each needing its own RLS policy, its own migration-script mapping, and its own set of application-code read/write changes. High redesign risk for a first pass, done by a solo founder mid-build.
- **Pure JSONB** (one `user_data` column holding the whole current localStorage blob) is the fastest migration — almost no redesign — but loses queryability (no server-side filtering/aggregation on individual fields, e.g. can't easily query "all users with `tier = 'personal'`" without unpacking JSON) and makes RLS policies coarser (all-or-nothing per user row rather than per data-sensitivity-category).
- **Recommended: hybrid.** A small number of genuinely relational tables for data with real query needs (auth/profile, tier/billing-adjacent fields, activity history — the things that will actually get queried, joined, or reported on), with everything else kept as JSONB columns grouped by the existing Schema.md section boundaries. This roughly halves the redesign work of full normalisation while keeping the fields that matter (tier, activity dates, credits) genuinely queryable.

### 2.2 Proposed tables

**`profiles`** (relational — 1 row per user, replaces most of Schema.md §2)
`id` (uuid, FK to `auth.users`), `name`, `age_band`, `gender`, `hormonal_tracking` (bool), `coach_style`, `tier` (`free`/`personal`/`athlete`), `fitness_level`, `weight`, `weight_unit`, `target_weight`, `target_date`, `target_description`, `created_at`, `updated_at`.
Kept relational because `tier` needs to be genuinely queryable (billing, support, future admin tooling) and this is the table Stripe webhooks will eventually write to.

**`profile_data`** (JSONB — everything else from §2 that isn't queried directly)
`user_id` (FK), `goals` (jsonb array), `conditions` (jsonb array), `condition_pain_scores` (jsonb), `equipment` (jsonb array), `home_equipment` (jsonb), `gym_equipment` (jsonb), `prescribed_exercises` (jsonb), `lifestyle` (jsonb).

**`activity_log`** (relational, one row per completion — replaces §5's `activityLog`)
`id`, `user_id` (FK), `type`, `duration_mins`, `mood_after`, `is_event` (bool), `event_name`, `completed_at`, `created_at`.
Relational because this is the table `today.js`/`progress.js` genuinely query by date and type today, and it's the natural home for future reporting (community org-code cohort activity, if that's ever wanted).

**`activity_history_jsonb`** (JSONB — the other three history-shaped stores, kept separate from `activity_log` deliberately)
`user_id`, `progress_log` (jsonb array, `activeProgramme`-linked session history), `workout_history` (jsonb array, `workout.js`'s own gym-completion log — currently dormant/no reader, migrate the data but don't build a UI for it yet), `checkin_history` (jsonb object keyed by date).
**Explicit decision on the multi-history-field question:** don't merge these into `activity_log` with a discriminator column. They're structurally different (per-exercise progress vs per-session vs per-day-keyed) and none of the reading code expects a unified shape. Keep them as four separate concerns, matching what's actually live, rather than forcing a unification the app doesn't use yet.

**`active_programme`** (JSONB — §3, `activeProgramme` + `strategicGoal`)
`user_id`, `strategic_goal` (jsonb), `active_programme` (jsonb, including `milestones`, `currentWeek`, `sessionSequence`).

**`checkin_state`** (JSONB — §6)
`user_id`, `checkin` (jsonb, engine state), `last_checkin` (jsonb), `today_intensity`, `available_time`.

**`journal_entries`** (relational, one row per entry — §13)
`id`, `user_id` (FK), `content` (text), `has_progress_signal` (bool), `category_tags` (jsonb array), `created_at`.
Relational because journal entries are naturally list-queried (Noticing Hub, PDF export) and because the **Journal Privacy Rule needs a hard technical boundary, not just a policy statement** — see RLS section below.

**`app_state`** (JSONB — the long tail: §7 Mindful Prompts, §8 Absence, §11 Preferences, §12 Notifications, §14 Weekly Plan, §15 Safeguarding, §16 Weight/Water, §17 Coach Offers/Unwell/Food, §18 Community/Impact minus credits, §19 Practice History)
`user_id`, `data` (single jsonb blob for everything not broken out above). This is the pragmatic "don't over-engineer the long tail" bucket — none of it is currently queried server-side, all of it is read/written as a whole object client-side already.

**`community_credits`** (relational — §18, split out of `app_state`)
`user_id` (FK), `credits`, `last_credit_at`, `quarterly_allocation`, `total_allocated`.
Broken out because Impact Credits' quarterly voting (per the founding commitment) will need real cross-user aggregation eventually — keep it queryable from day one rather than migrating it later.

### 2.3 Fields deliberately excluded from migration

`userTier`, `todayEnergy` — confirmed dead (no writer anywhere) in today's BUILD-4 Appendix A follow-up. Nothing to migrate.

---

## 3. RLS (Row-Level Security) Design

**Default policy, all tables: `auth.uid() = user_id`** (or `= id` for `profiles`) for both `SELECT` and `UPDATE`/`INSERT`. No table in this design has a legitimate cross-user read need at the individual-row level.

**One exception, needing its own policy shape: `community_credits`.** The Impact Credits quarterly-voting mechanism (permanent 5%-of-revenue commitment) will eventually need an aggregate view — "how many total credits does the community have this quarter" — without exposing any individual user's row to any other user. Recommended shape: keep the RLS-protected per-user table as designed above, and expose the aggregate via a `SECURITY DEFINER` Postgres function (e.g. `get_quarterly_credit_total()`) that sums server-side and returns only the total, never touching per-row access. This keeps RLS simple (still just "your own row") while still enabling the one genuinely shared feature.

**Journal Privacy Rule, technically enforced, not just policy:** `journal_entries` gets the same `auth.uid() = user_id` RLS as everything else — but the Journal Privacy Rule (journal content is never subject to signal detection) needs to be enforced as **client-side-only signal detection**, exactly as it is today (`signal-words.js` runs in the browser before save, sets `hasProgressSignal`, and never touches free-text content for detection purposes). No server-side function, trigger, or edge function should ever read `journal_entries.content` for anything other than serving it back to its owner. This is worth stating explicitly in the design doc because Supabase makes server-side processing easy to add later without much friction — the constraint needs to be a documented rule for future-Graeme (or a future contributor), not just an absence of code today.

**Admin/dashboard access:** per the existing privacy-policy commitment (admin access to usage patterns is intentional and disclosed), Supabase dashboard access naturally bypasses RLS for anyone with project credentials. This is already accurately described as a privacy-policy matter, not an RLS matter — noted here only so it isn't assumed RLS solves it. Credential hygiene (2FA, already actioned) is the real control.

---

## 4. Auth Approach

**Confirmed: magic-link only, no password database — holds, no change.**

Supabase's built-in email OTP/magic-link auth (`supabase.auth.signInWithOtp()`) covers this natively — no custom flow needed. One implementation note for the future build session: Supabase's magic links default to a redirect-URL pattern that needs the PWA's exact deployed origin allow-listed in the Supabase Auth settings (GitHub Pages URL, plus `buildnewhabits.co.uk` if the domain is ever pointed at the app rather than just the marketing site). Worth listing as a checklist item for that session, not a design decision to make now.

---

## 5. Migration Strategy for Existing localStorage Users

At decision level, not built:

1. **Trigger point:** first login after Supabase auth ships. On successful magic-link auth, before rendering any screen, check whether a Supabase row exists for this user. If not, treat this as a first-sync migration.
2. **Source of truth during migration:** the device's existing `localStorage` blob is read once, mapped field-by-field into the table shapes above (a migration script needs to walk `Schema.md` v1.10 as its checklist — every documented field needs an explicit source→destination mapping, including the JSONB long-tail fields), and written to Supabase in a single transaction per user.
3. **Post-migration:** `localStorage` is not deleted immediately — kept as a local cache/offline fallback, with Supabase as the sync source of truth going forward. (This matches the already-logged Noticing Hub spec item, "Settings > Wellbeing > Storage Location (local vs Supabase)".)
4. **Multi-device consideration:** the whole reason this migration matters (per existing memory: "coaching relationship loss on device change was identified as a fundamental trust failure") — if a user's second device logs in and finds a Supabase row already exists (from device one), device two should pull from Supabase, not attempt its own separate migration from its own (likely empty or stale) localStorage.
5. **Failure handling:** if the migration write fails partway, the user should not see a broken/partial account — recommend the migration script write to a staging area first (or use a single Postgres transaction, atomic by nature) and only mark migration complete on full success, with a retry path if it fails. This is the kind of detail that becomes the actual build session's job, not this design session's — flagged so it isn't forgotten.

---

## 6. DPA / TIA — Ready Checklist for When BIZ-1 Clears

Documented now so it's an actionable list, not a fresh scoping conversation later:

- [ ] Request Supabase's standard DPA via their dashboard (Settings → Legal → Data Processing Agreement) — needs registered business legal name and address, hence the BIZ-1 gate.
- [ ] Confirm Supabase's sub-processor list (AWS, as their infra provider) is covered under the DPA's scope — standard, but worth a five-minute read once the DPA is in hand.
- [ ] Transfer Impact Assessment (TIA): only needed if any data leaves the EU/UK. With Frankfurt chosen (Section 1) and Sentry already confirmed EU/Frankfurt, this should be a short/negative-finding TIA (no third-country transfer) rather than a substantial one — but still needs writing up as a record, not just asserted.
- [ ] Update the privacy policy draft (`alongside_privacy_policy_draft_23jul2026_v3.docx`) to name Supabase specifically as a processor, with region, once the account exists.
- [ ] Cross-reference INF-7 (data breach incident response — still a genuine open gap, not a formality) — this needs to exist before real user data goes live in Supabase, not just before the DPA. Flagging the dependency here so it isn't missed once BIZ-1 clears and momentum wants to just "switch it on."

---

## 7. What This Session Did Not Do (confirmed at close)

- No Supabase project created.
- No SQL written or run.
- No code touched — `store.js`, `app.js`, and every view file are untouched.
- Tier gating was not built — this design assumes a future `tier` column and future enforcement layer, but building that enforcement layer is explicitly a separate, not-yet-scoped session (see Section 0).
- DPA was not requested — Section 6 is a checklist for later, not an action taken now.

---

## 8. Recommended Priority Order for the Three Downstream Sessions This Unblocks

1. **Tier gating build** (highest priority, independent of Supabase) — `js/auth.js` doesn't exist, `session-builder-ui.js` has a live bug locking paying users out of features they've paid for (found today, BUILD-4 Appendix A follow-up), and `upgrade.js` has a live crash risk. None of this needs Supabase to fix — it's pure `store.js`/`tier`-field correctness work and could be its own short session soon.
2. **DPA request + BIZ-1** — business-process work, not build work, but gates everything else in this document from going live.
3. **Actual Supabase project creation + migration build** — should come last of the three, once tier gating is correct (so the schema's `tier` column means something on day one) and the DPA is in hand (so real user data can legally sync).

---

*Build New Habits · Alongside: Move · Supabase Schema & Architecture Design · 03 Aug 2026 v1*
