# Alongside: Move — Master Schedule
## 23 Jul 2026 v68

Build New Habits | Single source of truth for all build, business, website, and content tasks.
Supersedes `alongside_master_schedule_23jul2026_v67.md`. Remove v67 on upload.

---

## ⭐ THIS WEEK — WB 27 Jul (tick off as you go, or tell me and I'll tick it here next update)

- [ ] **Safeguarding reviewer outreach** — contact all 3 roles (Sarah, PAPYRUS-affiliated youth reviewer, third TBD). No session needed, start any time.
- [ ] **HMRC sole trader registration** — highest-leverage outstanding task.
- [ ] **BUILD-5 discovery session** — available-time bug. Trust-critical, don't let this slip.
- [ ] **BUILD-3 on-device test pass** — code's done, this just closes it.
- [ ] **Send solicitor pack to Alex** — introduction email drafted 23 Jul; attach Product & Data Overview + covering letter.
- [ ] **Friday: short review** — reconcile whatever the two sessions above produced.

## NEXT WEEK — WB 3 Aug (for context — jump ahead on any of these if the mood strikes)

- Core Session data-integrity investigation
- Supabase scoping session
- **Supabase DPA request** — new, targeted this week specifically (sub-task of INF-1, needs BIZ-1 done first)
- BUILD-1's remaining sub-question (onboarding/thread/sheet icon visibility)
- BIZ-2 Starling, BIZ-3 ICO, INF-6 Kit mailing list, OUT-2 White Ribbon, OUT-7 Beta pitch (org version)

*Full six-week plan with all review checkpoints: Task Inventory doc, Section J (v5, 23 Jul 2026).*

---

**Status key:**

| Symbol | Meaning |
|--------|---------|
| ✅ | Done / closed. |
| 🔄 | Active — in progress. |
| ⚡ | Next up. |
| ⬜ | Pending. |
| 🚫 | Blocked. |
| ❓ | Verify. |
| 🟡 | Double check. |
| 🟠 | Flagged issue. |
| 🟢 | Completed (strike-through in Graeme's own checklist). |

---

## One-Page Dashboard — 23 Jul 2026

| Stream | Current position | Immediate next action | Blocker? |
|--------|-----------------|----------------------|----------|
| Product — BUILD-1 (Nav-gap fix) | 🟡 Core mechanism confirmed. Onboarding/thread/sheet visibility sub-question open. | Quick confirmation. | None. |
| Product — BUILD-2 (Proposal-loop fix) | 🟢 Closed 23 Jul, verified on-device. | — | None. |
| Product — BUILD-3 (Session-view audit) | 🟠 Code complete, syntax-verified, NOT on-device tested (9 files). | On-device test session — **this week.** | Needs phone only. |
| Product — Core Session data-integrity question | Found 23 Jul. Not investigated. Blueprint ready. | Run the investigation — **next week.** | Not booked. |
| Product — BUILD-4 (Schema Reconciliation) | Canonical confirmed (v1.7 vs live v1.3). | Align session — WB 10 Aug. | Not booked. |
| Product — BUILD-5 (Session-length / available-time bug) | Graeme's own report, 17 Jul. **Not yet investigated.** | Discovery session — **this week.** | Not booked. Trust-critical. |
| Product — BUILD-6 (`getStrategicRationale()` decision) | Low priority, open since March. | Graeme's call, whenever. | Not booked. |
| Product — BUILD-7 (duplication review) | Two-screens question partially answered by B3-3. Full review not done. | Low priority. | Not booked. |
| Product — BUILD-8 (Full device test programme) | Final pre-beta pass. | WB 31 Aug. | Depends on BUILD-1/2/3. |
| Product — BUILD-9 (18+ age-gate in onboarding) | 🟡 New, surfaced 23 Jul from the age-restriction decision. Not scoped. | Blueprint session — WB 10 Aug. | Depends on 18+ decision (now final) and schema-first rule. |
| Product — Thread scroll-bug pattern audit | Found twice independently, audit recommendation never actioned since 03 Jul. | WB 17 Aug if room, else WB 31 Aug. | Not booked. |
| Product — B3-2-Test follow-ups (4 items) | Needs re-adding to active tracking. | Triage. | Not booked. |
| Product — Feeling-word/signal-word remaining wiring | `feelingWord` not wired into `coach-proposal.js`; quadrant/trapped logic incomplete. | Blocked on sign-off for the live response; wiring itself may not be. | Blocked (partial). |
| Product — T20 pain chip colour verification | Pending since 02 Jul. | Fold into any `checkin.js` session. | Not booked. |
| Product — `home-threshold.js` stub status | Still a stub per 02 Jul comment; D3 content exists but wiring unverified. | Folds into D-Audit, WB 10 Aug. | Not booked. |
| Product — Supabase (INF-1) | Not scoped. Largest unscoped risk. DPA request now a distinct tracked sub-step. | Scoping session — **next week.** | Not booked. |
| Business — Safeguarding sign-off | Seven specific items (was six — see below), three reviewer roles, none filled. See Stream A. | Outreach — **this week.** | Blocks Safety page entirely. |
| Business — BIZ-1 (HMRC) | Not actioned. | **This week.** | Blocks BIZ-2, BIZ-3. |
| Business — BIZ-9 (IP/trademark) | 🟡 New, 23 Jul. Question sheet prepared. | Bring to same solicitor meeting as BIZ-5/6. | None — piggybacks on existing meeting. |
| Business — solicitor pack | 🟢 Complete 23 Jul, v2 pass done: Product & Data Overview (v1), covering letter (v2), Privacy Policy (v2), ToS (v2), Safeguarding one-pager (v1), IP/trademark question sheet (v1). v2 pass added data-breach notification, PECR/marketing clause, MHRA medical-device framing, and the mandatory Consumer Rights Act negligence-liability carve-out. | Send to Alex for introduction. | Awaiting Alex's response / solicitor identity. |
| Business — INF-7 (data breach incident response process) | 🟡 New, 23 Jul. Privacy Policy Section 8 promises this; doesn't exist yet. | Write a short internal procedure — pairs naturally with BIZ-3 (ICO). | Not booked. |
| Business — org outreach categories | Undecided — two conflicting lists. | Graeme's decision, whenever convenient. | Blocks OUT-2–OUT-8. |
| Website | Four pages live. Philosophy/Research/Privacy/Terms outstanding. | WB 10 Aug onward, per Section J. | Photo/Kit for Home/Community; sign-off for Safety. |
| Content (Stream D) | D2/D3/D6 may have usable content; `home-threshold.js` wiring unverified. | D-Audit, WB 10 Aug. | Not booked. |

---

## Stream A — Business & Legal

### Crisis & Safeguarding Policy — full detail

Policy **v7 (23 Jul 2026)** complete, ready for professional sign-off — **not yet approved.** Seven items block approval, all in the policy's own Section 10 (item 7 added 23 Jul):

1. Verify the flagged-word list against the live `checkin.js` word bank.
2. Formal PAPYRUS-guidance review of the teen message, named youth-safeguarding sign-off.
3. Legal confirmation: Article 22 automated-decision-making position.
4. Legal/safeguarding guidance: parental notification for under-18 users.
5. Confirmation: DPIA requirement and scope.
6. Confirmation: Online Safety Act applicability for Learn's multi-user structure.
7. **New (v7):** Confirmation that retaining the 13–17 response pathway as a fallback safety net — while Move's front-door minimum age moves to 18+ — is the correct approach, rather than removing the teen pathway from Move entirely.

**Why v7 exists:** v6 stated Move was available to users 13 and above. That's no longer accurate — Move's intended minimum age is moving to 18+, discovered and corrected during the 23 Jul solicitor-pack session. The 13–17 pathway itself hasn't been removed, just reframed as a fallback in case a declared age is inaccurate. Full reasoning in the policy's own v7 change note.

**Three reviewer roles, none filled:** Sarah Brady (informal adviser only), a named PAPYRUS-affiliated youth-safeguarding reviewer, a third reviewer not yet identified.

**Blocks:** the Safety/contact page (architecture complete, 09 Jul); the live-facing crisis response in the feeling-word selector (correctly dormant by design until sign-off).

### Solicitor review pack — complete 23 Jul 2026, two passes

A free solicitor consultation opportunity (via Alex, Somerset Innovation Hub) prompted a full document-prep session, followed by a self-review pass that caught real gaps before anything was sent. Final state, six documents:

- Product & Data Overview — v1
- Solicitor covering letter (routed via Alex) — v2
- Privacy Policy (draft) — v2
- Terms of Service (draft) — v2
- Safeguarding one-pager — v1
- IP/trademark question sheet — v1

**What the self-review pass caught and fixed (now resolved, not open items):** the Terms of Service was missing the mandatory Consumer Rights Act 2015 s.65 carve-out (liability for death/personal injury from negligence cannot be excluded — the original cap was technically unenforceable as written); Alongside's "not a medical device" position wasn't stated explicitly, only implied; the Privacy Policy had no data-breach notification clause and no PECR/marketing-consent section; and Kit (the mailing list tool) was missing from the sub-processor list entirely.

**One genuine new task this produced:** account authentication was confirmed as magic-link-only (no password/passphrase), specifically to minimise what a future breach could expose — this closes a discussion, not opens one, and is now reflected in BUILD-9's scope. The Privacy Policy's new breach clause commits to an incident response process that doesn't exist yet — that's **INF-7**, new this session (see dashboard).

Two follow-on tasks from the first pass: **BIZ-9** (IP/trademark) and **BUILD-9** (18+ age-gate), both in their respective streams below.

Sole trader registration (BIZ-1) not yet actioned — blocks BIZ-2, BIZ-3. Org outreach categories undecided between two conflicting lists — blocks OUT-2 through OUT-8. Full task-by-task detail: Task Inventory doc, Section A.

## Stream B — Product Build

BUILD-1 through BUILD-8 per the dashboard above, plus new **BUILD-9** (18+ age-gate: DOB capture and email/magic-link activation in onboarding, plus the `ageBand` schema/routing update this implies). Surfaced 23 Jul from the age-restriction decision; not yet scoped into a blueprint. Full BUILD-3 file-by-file record (9 files) unchanged from v66. Full task-by-task detail: Task Inventory doc, Section C.

## Stream C — Website

Four pages live and confirmed: Home, Products, Community, Impact. Philosophy, Research, Privacy, Terms outstanding, each with its own blocker. Safety page architecture complete, blocked entirely on safeguarding sign-off above. Full task-by-task detail: Task Inventory doc, Section D.

## Stream D — Content

D-Audit (CONT-1) not booked, scheduled WB 10 Aug. `home-threshold.js` wiring status now an explicit part of that audit's scope. Full task-by-task detail: Task Inventory doc, Section E.

## Stream E — Infrastructure

**INF-1 (Supabase)** now carries an explicit DPA sub-step: once BIZ-1 (HMRC registration) is done, request Supabase's DPA + Transfer Impact Assessment (a request-based process, not automatic — distinct from Stripe, whose DPA is incorporated automatically into its standard terms). Targeted for WB 3 Aug. No other change. Full task-by-task detail: Task Inventory doc, Section B.

---

## Standing rules — current, full set

- File versioning: every file `DD Mon YYYY vN`, no exceptions.
- Ground Truth Rule: never edit a file without confirming its live version first.
- Ground-truth method: `raw.githubusercontent.com` via sandbox bash (`curl`) recommended default; paste-based fallback otherwise.
- Verify file state with `md5sum`/`wc -l` after any gap within a session.
- Touch-once rule: each session touches only files/pages listed in its blueprint.
- Schema-first: no store field read before it's declared in `store.js` and `schema.md`.
- `sw.js` always last, cache bump + changelog every deploy.
- WCAG 2.2 AA required throughout — Safety page aims higher.
- Status tagging protocol: any task discussed in chat gets an explicit colour tag, task ID, target week.
- **Journal Privacy Rule (non-negotiable):** signal-word detection applies only to feeling-word selector choices and mood history — never the journal.
- Known minor issue, low priority: "Stay in session" on exit-confirmation cards has never resumed a paused timer.
- This document opens with a tickable This Week / Next Week snapshot. Update it at the start of every session — move completed items to struck-through, roll the following week up when a week closes out. The full six-week plan and its reasoning live in the Task Inventory doc, Section J — don't duplicate that reasoning here, just the actionable snapshot.

---

## Launch definitions (proposed 22 Jul, still open to challenge)

**Soft launch (end Nov 2026):** beta converts to paying users, taster codes go live for contacted organisations. **Full launch (early Jan 2027):** cold traffic, public marketing, PR, Play Store listing.

---

## Key Dates

| Date | Milestone |
|------|-----------|
| This week | HMRC registration, safeguarding outreach, BUILD-5, BUILD-3, solicitor pack sent to Alex (now v2, ready to send) |
| Ongoing | ICO registration — critically overdue |
| Ongoing | Safeguarding sign-off — critically overdue |
| 31 Aug | **Milestone review — go/no-go on beta window** |
| Mid–end September 2026 | Beta opens |
| End October 2026 | Beta closes, conversion offer |
| End November 2026 | Soft launch |
| Early January 2027 | Full launch |

---

## Reference documents

- **`Alongside_Move_Task_Inventory_Accessible_Word_Resource_v5.docx`** (23 Jul 2026 v5) — full task inventory; Sections A, B, C updated with BIZ-9, BUILD-9, INF-7, and the Supabase DPA sub-step.
- **`alongside_weekly_checklist_22jul2026_v1.docx`** — static, tickable, Graeme-edited directly.
- **`alongside_crisis_safeguarding_policy_23jul2026_v7.docx`** — complete, awaiting sign-off. Supersedes v6 — remove v6 from project knowledge.
- **Solicitor review pack (23 Jul 2026, six documents, mixed versions)** — Product & Data Overview (v1), covering letter (v2), Privacy Policy draft (v2), Terms of Service draft (v2), Safeguarding one-pager (v1), IP/trademark question sheet (v1).

---

*Build New Habits · Alongside: Move · Master Schedule · 23 Jul 2026 v68*
