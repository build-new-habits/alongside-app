# Blueprint — CLINICAL-RESPONSE

## 06 Sep 2026 v1

Build New Habits | Alongside: Move | Opens against master schedule v288, `alongside-v444`

---

## 0. What this responds to

`alongside_Move_-_clinical_advice_-_nine_questions_21aug2026_v4.pdf`, returned annotated
by Amy, a physiotherapist, on or before 06 Sep 2026.

**Provenance, stated precisely because the last file that got this wrong is still being
corrected.** Amy is a named physiotherapist who read the nine-questions document and
answered seven of nine in writing. She is NOT a signed-off clinical reviewer, she
declined the reviewer role, and she declined to be named on the safety page. Nothing in
this blueprint may be attributed to "the reviewing physiotherapist" as authority. Where
her wording is used it is marked as her steer, not as clearance.

**Two questions were not answered at all:** Q3 (selection-rule ordering) and Q9 (home
equipment gaps). They remain exactly as open as they were before the pack went out.

**Her closing position, verbatim in substance:** the product needs a medical or exercise
professional to help develop it, and exercise advice should be avoided for CFS, long
covid, EDS and people with uncontrolled pain.

---

## 1. The decision taken, and by whom

**Graeme delegated the call on 06 Sep 2026.** The route chosen is **exclusion, not
caveat**, for the high-risk populations Amy names.

**The reasoning, so it can be argued with later.** Three routes were on the table:
exclude, caveat-and-keep, or hold beta for a paid clinical development role.
Caveat-and-keep was rejected because it requires someone to decide what remains safe to
serve an ME/CFS or hEDS user, and that decision would be invented rather than sourced.
Exclusion requires no clinical judgement: it is a statement about what this app cannot
do, which is a factual claim about the product, not a clinical one about the person.

**What this costs.** Hypermobility spectrum and hEDS are strongly comorbid with ADHD,
autism and chronic fatigue, which is Move's core audience and not an edge case (master
schedule v288, the HYPER-1 note). Excluding severe presentations removes real users who
the product was built for. That cost is accepted knowingly, not overlooked.

**What this does not do.** It does not make the product clinically reviewed. The
critical path in v288 read *clinical pack sent -> reviewer answers -> red-flag screen
built -> beta*. Amy's answers do not clear that path; they narrow what has to be
decided on it. A paid professional is still required before public launch.

---

## 2. Scope — six items

| ID | Item | Files | Clinical judgement required |
|---|---|---|---|
| CR-1 | Split `chronic-fatigue` into `persistent-fatigue` and `me-cfs`; add `long-covid` | `js/data/conditions.js`, `Schema.md`, `js/store.js` (migration) | None — Amy states they are different populations |
| CR-2 | Exclusion path for `me-cfs` and `long-covid` at onboarding | `js/data/onboarding-thread-data.js`, `js/views/onboarding/thread.js` | None — a statement of product limits |
| CR-3 | Caveat copy for `hypermobility` (keep the existing stretch block) | `js/data/onboarding-thread-data.js` | None — adapted from EDS Society published wording |
| CR-4 | General pre-start statement, added to the red-flag screen, not replacing it | RED-FLAG (zero code today) | **Yes, partially — see §4** |
| CR-5 | Standing pattern on rehab entries: what to do if it hurts during, expect to ache after | `js/data/exercises/*` | None — Amy's direct steer, generic |
| CR-6 | Record what stays open, loudly | `Documents/Admin/master_schedule.md` | n/a |

**Touch-once check.** No file in this list appears in another scheduled session in this
block. `sw.js` last and alone, one-line note, cache bump.

**Schema first.** CR-1 changes stored condition IDs. `Schema.md` (v1.45) and `store.js`
(v63) are updated before any code reads the new IDs. A migration is required: existing
`chronic-fatigue` entries must map to something. **They map to `persistent-fatigue`, not
to `me-cfs`** — migrating a user into an excluded state without asking is worse than
leaving them in the adaptive one, and the onboarding change catches new users. Existing
users are re-asked at next conditions update, not silently reclassified.

---

## 3. What each exclusion actually says

Copy is drafted in full at build time. The register, fixed here so it cannot drift:

- **Not medicalised, not apologetic.** "This app is not built for this" is the claim,
  not "you are too unwell for this."
- **A reason, not just a refusal.** The app adapts to how you feel today. For ME/CFS
  that mechanism is the problem, not the solution.
- **A destination.** NICE guideline signpost and the ME Association's activity and
  exercise page, both of which Amy cited.
- **Nurturing voice throughout.** No other register exists and none is added here.
- **Not paywalled.** Safety never is.
- **No streak, no shame, no comparison.** Standard.

The person keeps their account and everything not gated on the excluded condition. This
is a scope statement about sessions, not an ejection from the product.

---

## 4. Where this blueprint departs from Amy's advice, and why

**Q1, the red-flag screen.** Amy suggests the three questions cover only some red flags,
and that a general statement — the advice is generic, see your GP or an exercise
professional before starting — may serve better.

**The general statement is adopted. The screen is kept.** Her framing was explicitly
"to protect yourself," which is a different goal from protecting the user. Replacing a
cauda equina question with a disclaimer transfers risk to the person least equipped to
carry it. Keeping both costs one screen and no clinical claim.

**The honest weakness in this.** The three questions remain AI-derived and unverified.
Shipping them to a small invited beta, alongside the general statement and the §2
exclusions, is a judgement that the screen is better than no screen even unverified. It
is not a judgement that the wording is right. The code comment must say exactly that,
in the pattern `conditions.js` v1.5 already established. **This is the single item in
this blueprint that a professional should overturn if they disagree.**

---

## 5. What stays open — nothing here is closed by this session

| Open item | Status after Amy | Blocked on |
|---|---|---|
| Pain thresholds (the live 6/7/8 contradiction) | **Not answered.** She raised baseline instead: 1->6 is not the same event as 4->6 | Clinical input, plus a baseline field the app does not have |
| Sleep modification | Agreed in principle, refused a number, said it needs evidence not instinct | Sourced evidence review |
| Selection-rule order (Q3) | **Not answered** | Clinical input |
| Home equipment gaps (Q9) | **Not answered** | Content work, low clinical risk |
| Fibromyalgia, osteoporosis | Still zero entries in any avoid/caution list | Clinical input |
| Progression | Usable rules given: RPE-based, 6-8 weeks for strength, progress when 10 reps feel easy, ROM adapts faster, goal-dependent | Build capacity, not clinical input. **Post-beta** |
| Photo or video per exercise | Amy: always include one | 551 entries. Not pre-beta. Own stream |
| Named clinical reviewer | **Still unidentified.** Amy declined | Graeme |

**PROVENANCE remains open.** Most clinical guidance in this product is still AI-generated
and unverified. Seven answers from one physiotherapist who declined the role does not
close that, and this blueprint must not be cited as if it did.

---

## 6. Verification

- Gate must go red before green. Every assertion reversal-proven.
- New `tools/verify-clinical-response.mjs`: condition IDs exist and are distinct;
  migration maps `chronic-fatigue` to `persistent-fatigue` and never to `me-cfs`;
  selecting `me-cfs` or `long-covid` reaches the exclusion branch and no session builds;
  `hypermobility` still returns `avoid` for stretch-pattern exercises (HYPER-1
  regression); exclusion copy is not gated behind `isPremium()`.
- Every fixture must demonstrably reach the branch it names. Nine recorded instances of
  fixtures not reaching their branch make this a standing check, not a nicety.
- jsdom, real clicks, onboarding driven to the exclusion screen. Not a file read.
- Verified from a second independent fresh clone after push.
- WCAG 2.2 AA on all new copy and UI.

---

## 7. Not in this session

HMRC registration. ICO. Foot Anstey signatures. Domain switch. Beta recruitment.
DEV_PANEL_ENABLED (separate, and still a prerequisite before any tester install).

---

## 8. One thing for Graeme, not Claude

Amy gave real time to this and asked to be contacted with queries. Two things worth
sending back: a thank-you, and one question — whether she knows a physiotherapist or
exercise professional who would take this on as **paid** work. She declined on time
grounds, not on interest. That is the highest-leverage outstanding action now, ahead of
anything in §2.

---

Build New Habits | Alongside: Move | 06 Sep 2026 v1
