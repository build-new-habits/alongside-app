# Alongside: Move — Meeting Prep Brief: Alex, Somerset Innovation Hub
## 28 Jul 2026 v1

Build New Habits | Prepared ahead of Graeme's meeting with Alex, tomorrow (29 Jul 2026).

---

## 1. Why this meeting, and what's changed since the last one

The relationship began at the Innovation Workout event (Firepool Centre, hosted by SETsquared/Exeter), 27 Feb 2026. The one substantive scoping conversation on record is **17 March 2026** — captured in `alongside_alex_meeting_notes_mar2026.docx`. That meeting left several things "pending Alex": Exeter University research partnership scoping, sequencing advice on legal/financial/technical setup, the Business Expansion Programme (Colin Dart) timing, and neurodivergent-market routes to market.

Since March, the single most concrete forward move has been the **solicitor introduction**, actioned this week (see Section 4). Everything else "pending Alex" from March appears to still be genuinely pending — worth confirming tomorrow rather than assuming silence means no movement.

---

## 2. Business development — where things actually stand

- **Business registration status:** Build New Habits is currently **neither a limited company nor a registered sole trader**. The move to sole trader is under way but incomplete — see Section 4.
- **Solicitor introduction:** Emailed to Alex **24 Jul 2026** — one covering letter plus the Product & Data Overview, asking him to broker an introduction to a solicitor contact. Deliberately held back the other four pack documents (Privacy Policy, ToS, Safeguarding one-pager, IP sheet) until the solicitor's specialism is known. **No response confirmed yet** — worth asking about directly.
- **Business Expansion Programme (Colin Dart):** Target start remains **October 2026**, per the March meeting. Alex was going to "look at the programme with Colin Dart" — status unconfirmed since.
- **Exeter University research partnership:** Alex was exploring departments/contacts, target September 2026 (per March notes) for first conversation. Status unconfirmed since.
- **Neurodivergent market routes:** Alex was exploring institutional/employer/community routes beyond standard consumer channels — status unconfirmed since March.
- **Beta outreach (separate from Alex, but relevant context if it comes up):** organisation-first outreach plan now confirmed — Tier 1 neurodivergent orgs (BANDs CIC, ADHD Somerset, ADHD Foundation, National Autistic Society), Tier 2 White Ribbon UK (Graeme's existing ambassador relationship), Tier 3 nature/rewilding (Somerset Wildlife Trust, Rewilding Britain). Outreach not yet started — targeted for early August.
- **Timeline:** Beta window mid-Sept–late Oct 2026, soft launch end Nov 2026, full public launch early Jan 2027.

---

## 3. App development — where things actually stand

Recent build work has been product-integrity fixes rather than new features — useful framing if Alex asks "what have you actually built lately."

- 🟢 **BUILD-5 (available-time bug)** — closed and confirmed on-device 24 Jul. Turned out to be three separate bugs (session length wasn't respecting the user's stated available time), all now fixed.
- 🟢 **Thread scroll-bug audit** — closed 28 Jul; mostly already resolved, one file checked and cleared.
- 🟢 **Nav-gap / proposal-loop fixes** — closed and verified on-device.
- 🟡 **BUILD-3 (session-view exit-guard audit)** — code confirmed clean by two independent static traces; on-device phone test still outstanding, expected to be a formality.
- 🟡 **BUILD-4 (schema reconciliation)** — partially under way: a full field inventory now exists (179 live data fields, 155 currently undocumented against the canonical schema). Full alignment session scheduled for the week of 3 Aug, ahead of Supabase migration planning.
- **Website** (marketing site, separate repo) — Home, Products, Community, and Impact pages confirmed clean 24 Jul: colour tokens match the app, no broken links, no youth-implying language.
- **Not yet scoped:** an 18+ age-gate requirement, surfaced 23 Jul (no stated age policy currently on the website either).

**Headline for Alex:** the product is stable and actively being hardened pre-beta, not newly broken or stalled — the open items are audit/confirmation work, not unresolved bugs in the user-facing experience.

---

## 4. Legal / solicitor review — where things actually stand

- **Solicitor introduction sent to Alex, 24 Jul 2026** — covering all three legal domains in one ask (data protection/consumer terms, safeguarding, IP/trademark), not three separate requests. Full six-document pack is ready to send on to whoever the solicitor turns out to be: Product & Data Overview, covering letter, Privacy Policy draft, Terms of Service draft, Safeguarding one-pager, IP/trademark question sheet.
- **Crisis & Safeguarding Policy** — complete (v7, 23 Jul 2026), **awaiting professional sign-off**. Three named reviewer roles exist in the policy structure; **none are currently filled**. Sarah Brady remains an informal adviser only, not a formal safeguarding reviewer. This is a live, urgent gap, not routine paperwork — worth flagging to Alex directly, since a safeguarding-specialist contact (particularly PAPYRUS-affiliated for the youth-safeguarding role) may be something his network can help with.
- **ICO registration** — deferred by design until immediately before real user data is collected (pre-beta trigger), but tracked as "critically overdue" on the internal schedule given how close that trigger now is.
- **HMRC sole trader registration** — **in progress, blocked**. Started 28 Jul; hit a genuine dead end at identity verification (an existing personal Government Gateway login from 2025 needs recovering via phone/webchat before registration can complete — not a build issue, a personal admin task). This is the highest-leverage outstanding item and gates the business bank account and accurate ICO registration wording.

**Headline for Alex:** the legal track has real, recent motion (solicitor ask sent this week) but two genuine blockers remain — safeguarding sign-off (needs a contact) and HMRC (needs a phone call) — both good candidates to mention if he's offering practical help rather than just information.

---

## 5. Possible asks / questions to raise with Alex

- Any movement on the solicitor introduction sent 24 Jul?
- Where do things stand on Exeter University and the Business Expansion Programme (Colin Dart) — still on track for their original windows?
- Does his network include anyone suited to the safeguarding reviewer roles (a formal safeguarding specialist, and separately someone PAPYRUS-affiliated for youth safeguarding)?
- Any further thoughts on neurodivergent-market routes to market, beyond the direct organisation outreach already under way?

---

## 6. Reference material — pull these in for intel before/during the meeting

**Documents (project knowledge):**
- `alongside_alex_meeting_notes_mar2026.docx` — full write-up of the March scoping conversation; the baseline for "what's changed since"
- `alongside_master_schedule_28jul2026_v76.md` — current live state of everything, all streams
- `alongside_hmrc_registration_status_28jul2026_v1.md` — HMRC blocker detail, if it comes up
- `alongside_outreach_organisation_list_27jul2026_v1.docx` — full outreach plan, if community/beta strategy comes up
- `alongside_crisis_safeguarding_policy_23jul2026_v7.docx` — safeguarding policy, if he asks to see it or wants to pass it to a contact
- `alongside-vision-mar2026.docx` — evidence base and business/partnership framing, useful if Alex brings anyone new into the conversation

**Past conversations (searchable in this project):**
- "Preparing for Somerset Innovation Hub meeting" (17 Mar 2026) — the original meeting-prep chat, full section-by-section notes
- "CONT - Solicitor Prep & Policies" (24 Jul 2026) — the solicitor pack build and the actual email sent to Alex
- "PM - oversight for builds and testing" (28 Jul 2026) — today's build/schedule state in full

---

*Build New Habits · Alongside: Move · Meeting Prep Brief · 28 Jul 2026 v1*
