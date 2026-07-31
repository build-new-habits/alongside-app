# Alongside: Move — Build Session Blueprint
## 31 Jul 2026 v1

Build New Habits | Written by the PM chat, for a fresh build chat to execute independently (or run directly via repo access). Paste this whole document as the first message in a new chat.

---

## Session: Supabase — Schema & Architecture Design

**Scope, stated plainly: this is a design session, not a live migration session.** No Supabase project is being created, no SQL is being run, no auth is going live. The output is a schema design document and an architecture decision record, ready for when the real dependencies (below) clear.

---

## 1. Why this is design-only, not build — two real, confirmed dependencies

Both confirmed today (31 Jul), not assumed from the master schedule note alone:

**1a. The DPA request needs registered business details.** Supabase's Data Processing Agreement flow is request-based, not automatic, and needs the registered entity's details — which means it's gated on BIZ-1 (HMRC sole trader registration), still open on the master schedule, blocked on identity recovery. No live Supabase project with real user data should exist before this is resolved.

**1b. Tier gating doesn't exist yet as a system.** Checked directly against live code today: `store.get('tier')` is read in exactly 3 files (`settings.js`, `progress.js`, `coach-proposal.js`), with no central gate/paywall mechanism found anywhere (`tierGate`, `checkTierAccess`, `isPremium`, `hasAccess` — zero matches across the whole `js/` tree). The 27 Jul Supabase discussion flagged tier gating as needing to exist *before* Supabase auth, since auth's job is just to write a confirmed `userTier` value — the gating logic needs to already be there to receive it. **This session should design the schema with tier gating in mind, but building tier gating itself is a separate, not-yet-scoped session.**

If Graeme wants to fold tier-gating scoping into this same session, that's a reasonable scope expansion — flag it back to the PM chat rather than assuming, since it changes what "done" looks like.

---

## 2. What this session should actually produce

1. **EU region decision** — Ireland (`eu-west-1`) or Frankfurt (`eu-central-1`). Not yet decided anywhere in project knowledge or the repo — needs a real choice, even though the technical difference is minor (data residency preference, latency is a non-issue either way for this app).
2. **Table design**, informed by the real live schema, not a guess:
   - Read `Documents/Live State/Schema.md` (v1.9, or v1.10 if the Appendix A follow-up has run by the time this session starts — **check which is current, don't assume**) as the source of truth for what fields actually exist and their live/dormant status. Don't design tables against dormant fields as if they're active data.
   - Map `store.js`'s current flat/nested localStorage shape to a relational (or JSONB-hybrid) design — this app's data is currently mostly nested objects and arrays in one blob (`activityLog`, `progressLog`, `checkinHistory` etc.) which will need a real decision: normalise into proper tables, or keep as JSONB columns per user row for a faster migration with less redesign risk. State the tradeoff, make a recommendation, let Graeme decide rather than picking silently.
   - Explicitly address the multiple "history-shaped" fields found in the last two sessions: `activityLog`, `progressLog`, `workoutHistory` (status TBD, in the Appendix A follow-up), `checkinHistory` — these likely need either separate tables or a clear discriminator column if merged. Don't design this away by accident.
3. **RLS (Row-Level Security) design** — every table needs a policy from day one, not retrofitted later. State the policy shape per table (typically "user can only read/write their own row," but confirm this holds for every table, including anything with cross-user implications like Impact Credits' quarterly voting, if that's in scope for this migration phase).
4. **Auth approach confirmation** — magic-link only, per existing product decision (no password database). Confirm this still holds and note anything Supabase-specific about implementing it (their built-in magic-link auth vs a custom flow).
5. **Migration strategy for existing localStorage users** — this app already has real usage (Graeme's own device data at minimum). Design the "existing user gets migrated on next login" flow at a decision level — don't build it, but the schema design should account for what a migration script would need.
6. **Data Processing Agreement + Transfer Impact Assessment** — document what needs requesting once BIZ-1 clears, so it's a checklist item ready to action, not a fresh scoping conversation in a few weeks.

---

## 3. What NOT to do this session

- Do not create a live Supabase project
- Do not write or run any SQL migrations
- Do not touch `store.js`, `app.js`, or any auth-related code
- Do not build tier gating (Section 1b) — design around its future existence, don't build it here
- Do not request the DPA (Section 1a) — document what will be needed, don't submit anything

This session's only output is documentation — a schema design doc and an architecture decision record, both new files.

---

## 4. Files this session will touch

| File | Action |
|---|---|
| `Documents/Live State/Schema.md` | Read-only — the source of truth for what fields genuinely exist. |
| New: `Documents/Admin/alongside_supabase_schema_design_[date]_v1.md` | Main deliverable — the actual table/RLS/migration design doc. |
| New: `Documents/Admin/alongside_supabase_architecture_decision_[date]_v1.md` (or folded into the same doc — session's call) | EU region choice, JSONB-vs-relational decision, auth approach confirmation, all with stated reasoning. |
| `Documents/Admin/master_schedule.md` | Update at session close — new design docs referenced, tier-gating dependency logged as its own item if not already, DPA request logged as ready-to-action once BIZ-1 clears. |

No code files touched this session at all — worth double-checking that's held true at session close, since it's an easy discipline to drift from once a design conversation starts generating "just quickly check how X currently works in code" moments.

---

## 5. What "done" looks like

- EU region decided and documented with reasoning
- Table design complete, explicitly addressing the multi-history-field question (Section 2.2)
- RLS policy shape stated per table
- Auth approach confirmed (magic-link, Supabase-native or custom — decided)
- Migration strategy for existing users designed at decision level
- DPA/TIA requirements documented as a ready checklist item, gated visibly on BIZ-1
- Tier-gating dependency explicitly logged as its own separate, not-yet-scoped session — not silently assumed as "someone else's problem"

---

## 6. Session Start Checklist

- [ ] `Documents/Admin/master_schedule.md` in the repo is canonical — read in full first.
- [ ] Read `Documents/Live State/Schema.md` — confirm whether v1.9 or a newer version (post-Appendix-A-follow-up) is current.
- [ ] Confirm BIZ-1 (HMRC registration) status on the master schedule before starting — if it's closed by the time this runs, Section 1a's constraint may have changed; re-read rather than assume it's still blocked.
- [ ] Confirm whether tier gating has been scoped/built in the meantime — if so, Section 1b's constraint changes too.
- [ ] Use the fine-grained GitHub token (regenerate if expired) — `git clone` for ground truth, commit/push directly.
- [ ] Every file produced carries a `DD Mon YYYY vN` header, verified against today's actual date.

---

## 7. What to bring back to the PM chat

- The two new design documents
- Explicit confirmation nothing outside documentation was touched
- A recommended priority/order for the three now-separate downstream sessions this unblocks: tier gating, the actual Supabase project creation, and the DPA request (once BIZ-1 clears)

---

*Build New Habits · Alongside: Move · Session Blueprint · 31 Jul 2026 v1*
