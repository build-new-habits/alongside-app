# Alongside: Move — Master Schedule
## 12 Aug 2026 v154

Build New Habits | Single source of truth for all build, business, website, and content tasks.
Supersedes `master_schedule_12aug2026_v153.md`. Remove v153 on upload.

**⚠️ Location:** the canonical copy of this document is `Documents/Admin/master_schedule.md` in the `alongside-app` repo, not project knowledge. If the repo and a project-knowledge copy ever disagree, the repo wins. This project-knowledge copy remains a searchable snapshot only. `Admin/Past MS/` in the repo holds every superseded version by date.

---

## What happened in the 12 Aug build session (recorded at v150)

**One very long session. 62 commits, 43 files, ~12,900 lines added. `sw.js` v235 → v253, cache `alongside-v253` → `alongside-v263`. Exercise database 461 → 556.**

v149's standing recommendation was *stop building, run the device pass*. That is not what happened, and the reason is worth recording honestly: Graeme opened the app, found the exercise cards had no guidance, and every subsequent finding came from following that thread. The session was driven by use, not by plan.

**On-device confirmation — corrected 12 Aug (v151).** Earlier versions of this document repeatedly said "none of it is on-device confirmed", which was wrong and unfair. Graeme has been testing throughout and sharing screenshots in other chats — the exercise-card guidance gap that drove this entire session came from him opening the app. The accurate claim is narrower: **these specific changes have not been confirmed against the persona paths they were built for.**

**The agreed sequence is Graeme's, and it is deliberate:** trace it clean through code first, fix, re-trace, and only then verify on screen. His reasoning — using the product himself mid-build pulls the work onto tangents and away from the thing being fixed. Claude should not push for a device pass ahead of that sequence.

### The pattern that ran through the whole day

The same defect appeared **eight times in eight different costumes**: content that exists, is correct, is written to standard, and that nothing in the product can ever select.

| # | Instance | Scale |
|---|---|---|
| 1 | Equipment vocabulary mismatch | 92 of 124 equipment exercises unreachable for every user |
| 2 | Difficulty ceiling capped at 3/10 | 14 exercises above every possible ceiling |
| 3 | Private exercise pool in `session-builder.js` | 139 practice entries + entire yoga library invisible |
| 4 | Loaded carries | All 6; no category selected `movementPattern: carry` |
| 5 | Cardio warm-up tags | 2 of 4 machine warm-ups untickable |
| 6 | Balance board | Content and equipment both present, no route |
| 7 | Contraindications naming non-existent conditions | 13 safety exclusions that never fired |
| 8 | Category coverage | 85 of 544 exercises — 15.6% of the database |

**Every one was found by a person using the product or by a persona trace. None was found by the code.** That gap is now closed by a permanent audit — see INF-AUDIT below.

### Streams completed

**CON-1 → CON-9 — exercise content consolidation.** Single registry (the parallel copy in `js/data/exercises.js` is now a shim). Equipment vocabulary resolver. Exercise Entry Standard written, with `watchOut` and effort-relative `load` added and backfilled across all 556 entries. New `gym.js` (machines, conditioning, cable and machine strength, loaded core, medicine ball, balance, plyometrics). Private pool retired. Equipment became a preference in selection, not only a permission — gym Full Body went from 0–1 equipment exercises out of 13 to 11 of 13.

**CONT-1 / CONT-2 — the app now remembers what you did.** Every session view wrote `exercisesCount: 3` — a number — and never which exercises. That single absence is why selection had to be `Math.random()` over 500+ exercises, and therefore why there was no progressive overload, no skill acquisition (making the whole `watchOut` library decorative), and no familiarity. New `exerciseHistory`, and continuity-aware selection bounded by a 21-day recency window, an 8-session mastery ceiling and a variety preference (`sessionVariety`).

**CAP-1 → CAP-5 — the capability screen.** Answering "if we are not age restricting, how do we ensure the appropriate level for that user?" The instrument was wrong, not the policy: *how active are you* measures frequency, not capacity. Four questions replace it, three-state so a wheelchair user can answer "No" to the chair question rather than being forced into "not easily". `legPower` added as a separate axis after a trace found a wheelchair user served seated *leg* exercises. All 556 entries tagged `position` / `impact` / `balanceDemand`. New `seated.js`, 38 entries.

**The coach explains the programme.** New `session-rationale.js`. Opening, per-section purpose, and a longer arc — connected to the person's stated goals and training intent. Progression is **invited, never directed**, reads the day (a flare invites less, a low-energy day invites the same), and never states a number.

**Graeme's six UX items**, all shipped: duplicate time question removed, check-in scroll and pacing fixed, in-card performance notes generalised to what each exercise actually produces, "Not a fan" control, coach rationale, empty-session guard.

**Navigation and integrity sweep.** Three routes pointed at view files that had never been written. `about` removed, `community-impact` and `annual-reflection` built, front doors added.

---

---

---

## 🔬 Persona tracing — status at v151

| Pass | Date | Outcome |
|---|---|---|
| First | 11 Aug | PT-1 to PT-10. Three deliverables in `Admin/` |
| Second | 11 Aug | PT-11 (fourth private exercise pool), PT-12 (reader-without-writer sweep) |
| Third | 12 Aug | C1–C4 + A1–A3. **All shipped.** Report in `outputs`, not yet filed to `Admin/` |

**Owed to Graeme, explicitly requested:** the third pass produced only the technical punch list. **The next trace must produce the full three-document set** — technical, plain-language, and above all the **narrative**: what these people would actually say, what they liked, what they never touched, what they would tell a friend. That narrative is the deliverable Graeme values most and it was missed.

**Also never traced: `reflect.js`.** Three passes walked past the post-session reflection, which is where the empathy transfer fires — the thing Graeme considers the heart of the product. A session does not end at the last exercise; it ends at reflection. **Trace it next time.**

**Wave 2 candidate on evidence:** persona 2.5 (post-cardiac, total beginner). The blank-slate persona surfaced every critical first, so "least data given to the app" is the confirmed selection criterion.

**Fixture note:** the Node harness and persona fixtures are reusable but were built pre-capability-screen. They need `capability{}` added before the next run.

## 🟢 A11Y-1 + the two logged items: ALL CLOSED, 12 Aug 2026

**Target WB 10 Aug 2026. All three of DIC-1's "logged, not fixed" items are now fixed.**

`css/base/variables.css` v1 → **v2**. `css/components/checkin-conversation.css` v8 → **v9**. `js/store.js` v30 → **v31**. `Documents/Live State/Schema.md` v1.25 → **v1.26**. New `tools/contrast-check.mjs`. `sw.js` v265 → v266 → **v267**, cache **alongside-v267**. Confirmed on a fresh clone.

### The process lesson, which matters more than the fixes

Graeme's question was *"why not?"* and two of the three answers did not survive it. **Touch-once was cited, not applied.** The rule means a file appears in one session's scope; it does not mean scope can never grow — and neither `store.js` nor `Schema.md` had been opened this session. The scope was self-declared at session start and then treated as an external constraint. **That is how a discipline rule turns into a place to put work you would rather not do.**

Worth keeping alongside P5–P7 as a working note: *a build-discipline rule is a constraint on how work is done, never a reason for work not to be done. If a rule is being cited rather than applied, that is the tell.*

The third item did have a real reason — it changes how every screen looks, which is Graeme's call — **but that reason was never given**. The failure was bringing a log entry instead of two costed options.

### 🟢 A11Y-1 — elevated-surface contrast, fixed at the token

**The measured failure:** 56 rules set `--color-bg-elevated`, and 15 put `--color-text-secondary` or `--color-text-muted` directly on it — 4.30:1 and 3.91:1 against the 4.5:1 AA floor. `--color-bg-hover` is the same value (`#3E4C63`), so **every card hover state failed the same way**. Affected chips, cards, inputs, toasts, trends and milestones across onboarding, settings, progress, gym, journal and weekly plan.

**Graeme chose Option A** — lighten the text tokens rather than darken the surface:

| Token | Was | Now | On elevated |
|---|---|---|---|
| `--color-text-secondary` | `#A8B8CC` | **`#B9C6D6`** | 4.30 → **5.01** |
| `--color-text-muted` | `#A0B0C0` | **`#B2C0D0`** | 3.91 → **4.69** |

Option B (darkening `--color-bg-elevated`) was rejected on measurement: the value needed brings it to **1.00:1 against `--color-bg-card`**, so "elevated" becomes visually identical to "card" and every raised element in the app flattens.

**Stated cost, on record:** secondary and muted are now close enough to be nearly indistinguishable, so the palette carries **two** text weights rather than three. That was already the honest position — a palette that cannot support three weights on its own lightest surface at AA has two, and pretending otherwise is what produced 15 failing rules.

**New permanent gate: `tools/contrast-check.mjs`.** Reads live token values out of `variables.css` rather than restating them, and asserts all three text tokens against all five surface tokens, plus five accent and boundary pairs at 3:1. Exits 1 on drift, so it can gate a commit like `schema-check.mjs`. **All pass.**

### 🟢 The other two, closed

- **`store.js` v31** — `set()` now lazily inits the way `get()` already did. Verified against the exact condition that threw (write before any read, no `init()`). Never reachable live because `app.js` :150 inits on boot, but an asymmetry with no reason behind it.
- **`Schema.md` v1.26** — DOC-2. The front page said `store.js` v30 in the header and v21 four lines down. Supersedes line also repointed from v1.20 to v1.25.

### 🟠 NEW — A11Y-2: light mode is unreachable, and broken

Found while auditing A11Y-1's blast radius. **Nothing in any JS file or `index.html` ever adds the `light-mode` class**, and no Settings toggle exists — despite the block's own comment reading *"User toggle in Settings. Default: dark."*

Worse, if it were switched on it would not work. **Six surface and text tokens are defined in the dark palette and never overridden in the light-mode block**: `--color-bg-deep`, `--color-bg-elevated`, `--color-bg-hover`, `--color-border-focus`, `--color-border-light`, `--color-text-inverse`. So an elevated surface would stay `#3E4C63` (dark slate) while text became dark:

| Light-mode text on `#3E4C63` | Contrast |
|---|---|
| `--color-text` `#0f172a` | **2.06** |
| `--color-text-secondary` `#334155` | **1.19** |
| `--color-text-muted` `#64748b` | **1.82** |

**Severity is low because it is unreachable** — this is dead CSS, not a live user-facing failure. But it is the P6 defect in its ninth costume: content that exists, is written to standard, and that nothing in the product can ever reach.

**🟢 RESOLVED same day — code removed, decision kept open.** `css/base/global.css` block removed and archived in full to `Documents/Archive/alongside_light_mode_removed_css_12aug2026_v1.md`, with reasoning, the verbatim CSS, and what a real implementation needs. `sw.js` v268, cache **alongside-v268**. Zero live effect — every rule was scoped under a class never applied. Also removed `--color-bg-surface`, a token defined only inside that block and read by nothing.

**The initial recommendation to delete on the grounds that "light mode is not on any roadmap" was wrong reasoning and is corrected here.** Dark-only is a genuine accessibility limitation, not a preference: light text on dark surfaces causes halation for people with astigmatism (the text appears to smear), and light sensitivity runs in both directions. **Alongside: Move is built for neurodivergent adults, people navigating hormonal change, and people with chronic conditions and burnout — precisely the audience for whom display mode is functional rather than cosmetic.** Roadmap absence was the wrong test; audience need is the right one.

**Fixing the six tokens was rejected on its own merits**, separately from that. It yields a *reachable* broken light mode instead of an unreachable one, which is strictly worse, and overriding six tokens does not restyle 25 component stylesheets. What existed was 37 lines covering four components.

### 🔵 NEW SCOPED FEATURE — Light mode, for the beta conversation

**Not a bug fix. A feature with an accessibility rationale strong enough to justify the scope.** Not booked; needs a decision on whether it lands before or after public launch.

What it requires, recorded so it is not re-derived:
1. All eleven surface and text tokens overridden, not five — including the six that were missing
2. `tools/contrast-check.mjs` extended to run its full matrix against **both** palettes, gating on both
3. A component sweep for hardcoded hex values that bypass tokens
4. A Settings control plus a persisted store field
5. `prefers-color-scheme` as the initial default, with an explicit choice overriding it

⚠️ **A revival must start from `variables.css` v2**, not the archived block — that palette predates A11Y-1.

---

## 🟢 DIC-1 — The drop-in coach question: SHIPPED, 12 Aug 2026

**Build sequence item 1 of the tier boundary. Target WB 10 Aug 2026. Code complete and confirmed on a fresh clone of the live remote; on-device confirmation outstanding.**

`js/views/checkin.js` v13 → **v14**. `css/components/checkin-conversation.css` v7 → **v8**. New `tools/verify-dic1.mjs`. `sw.js` v253-header/v264-cache → **v265**. No `store.js` change, so `Schema.md` untouched at v1.25.

### The finding that made this cheap

**`sessionVariety` was a reader without a writer.** `store.js` declares it (default `'balanced'`, validated against `familiar | balanced | varied`) and `session-builder.js` reads it to set the novelty rate — `familiar: 0.10, balanced: 0.25, varied: 0.55`. **Nothing in the codebase ever wrote it.** No Settings control, no onboarding question, no view. The `store.js` comment reads *"the person's own answer, never inferred from behaviour"* — and the person had never been asked. Selection has been running on a default nobody chose.

So this was not a new mechanism bolted onto existing machinery. **It was the missing writer.** Third recurrence of the PT-12 reader-without-writer pattern in two days, which makes `tools/schema-check.mjs`-style gating look better value each time it appears.

### Decisions taken with Graeme

| # | Decision | Outcome |
|---|---|---|
| 1 | Where does it fire? | **End of check-in**, gated on a pending session door. One file, covers both session-generating doors, stays out of `coach-proposal`'s auto-opening options panel (where the v19 overlay bug lived) |
| 2 | What does it write? | **`sessionVariety` directly.** No per-session override field — the question fires before every coach-built session, so "today's answer" and "standing preference" converge, and a second self-clearing field would be two sources of truth for one concept |
| 3 | When is it skipped? | **Outside the 21-day window.** Precisely `session-builder.js`'s own `isAnchor()` cutoff. Outside it nothing is an anchor, so `familiar` and `varied` produce near-identical sessions and the coach would have asked a question it cannot act on |

**Recorded consequence of Decision 2, so it is not discovered later:** if a Settings control for variety ever lands, this question overwrites it every session. That is intended — what you say today beats what you set in March — but it is a decision, not an accident.

**Reasoning behind Decision 3, worth keeping:** a question that changes nothing is worse than no question, because it teaches the person the coach is reading a script rather than reading them. The spec says the same thing in its own words — *"he asks about last time, he never asks about March."*

### Copy as shipped

Coach bubble: *"Want to do something like last time, or shall we do something different today?"*

| Choice | Sub-line | Writes |
|---|---|---|
| Something like last time | Stay with the movements you've been building on | `familiar` |
| Something different | A change of pace, with movements you've not done lately | `varied` |
| Mix it up | Some of each | `balanced` |

No `.ci-panel-q` inside the panel — the coach has already asked in the thread, and asking again is the duplication v12 removed for the time question. Copy rule 10.1 holds: *variety*, *novelty* and *anchor* are ours, and none appears on screen.

### 🟠 Accessibility finding — existing failure in `coach-proposal.css`, NOT fixed (touch-once)

The nearest existing pattern, `.cp-missed-offer__btn`, puts `--color-text-muted` (`#A0B0C0`) on `--color-bg-elevated` (`#3E4C63`). **Measured 3.91:1 — below the 4.5:1 AA floor for normal text.** `--color-text-secondary` (`#A8B8CC`) on the same surface is 4.30:1 and also fails. `bg-elevated` is simply too light a surface for either muted token, and it is referenced 46+ times.

`.ci-choice` therefore **recesses rather than elevates**: surface `--color-bg` (`#1E293B`) against the `--color-bg-card` (`#334155`) panel. Label 11.87:1, sub-line 7.24:1. The surface-to-panel step is only 1.41:1, under 1.4.11's 3:1 for component boundaries, so the border carries it — `--color-text-muted` measures 4.04:1 against the panel. **Hover moves the border only**; lightening the background would push the sub-line back under 4.5:1.

**🟢 A11Y-1 — CLOSED same day.** Raised here, then fixed at the token once Graeme chose Option A. See the A11Y-1 section above for measurements, the rejected alternative, and the new `tools/contrast-check.mjs` gate.

### 🟠 Logged, not fixed (touch-once)

- **`store.set()` does not lazily init the way `store.get()` does** (`store.js` :1223 vs :1212). `get()` self-heals with `if (!this.data) this.init()`; `set()` throws `TypeError: Cannot set properties of null`. **Unreachable in the live app** — `app.js` :150 calls `store.init()` on boot — but it is a latent trap for any future call site that writes before it reads. Found by the verification harness, which is the point of having one.
- **🟠 DOC-2 — `Schema.md` v1.25** correctly states store.js v30 in its header, but a body line two paragraphs down still reads *"`store.js` remains v21"*, left over from the v1.20 text. One-line fix, not booked.

### ✅ DOC-1 closed

`sw.js` header entries had stopped at v253 while `CACHE_NAME` reached v264 — eleven bumps during the long 12 Aug session went in without header entries. **Recorded as a stated gap rather than eleven reconstructed entries**, since inventing them after the fact would be worse than saying so. The counter is correct from v265 forward.

### Verification

`tools/verify-dic1.mjs`, 12 assertions, written before the change was trusted. Cross-file value contract (`checkin.js` ↔ `session-builder.js` ↔ `store.js` whitelist), the window constant, `SESSION_DOORS` against `today.js`'s `requiresCheckin: true` doors, `exerciseStats` boundary maths at 20/21/22 days, and validation round-trip including rejection of a bogus value. **All pass on a fresh clone of the live remote.**

Two harness failures occurred and **both were the harness, not the code** — a relative import path, and the `store.init()` omission above. Consistent with v151's note that the first verification run was wrong and the code right six times out of six on 11–12 Aug. Checking the source before accepting a failure remains the rule.

### Still open on DIC-1

- **On-device confirmation.** Sits behind Graeme's agreed sequence: trace clean through code, fix, re-trace, then verify on screen
- **Tier question not asked, and built for everyone deliberately.** The spec says *free users get* the drop-in question. Gating it to free would leave Personal users with a worse coach than free, since the plan (build item 5) does not exist yet — and P1 says the coach never withholds what it can see. Built unconditionally. **Flagged for Graeme to overrule if he wants it free-only**
- **Build item 2** — condition-aware empathy selection — is the next cheapest item and is unblocked

---

## 🎯 THE TIER BOUNDARY — decided 12 Aug 2026

**Two new documents in `Documents/Business/`. These now govern all product decisions and every future proposal must pass them.**

- `alongside_tier_boundary_12aug2026_v1.md` (**v2**) — why someone pays
- `alongside_destination_architecture_12aug2026_v1.md` (**v1**) — the specification for the paid spine

### The answer

> **Free is the session. Personal is the plan.**
> Free gives you a coach for today. Personal gives you a coach who knows where you're going.

From Graeme's track analogy: you turn up and ask his daughter's athletics coach for a session. He gives you a real one, properly judged, genuinely worth having. **He withholds nothing — there is nothing to withhold, because you named no destination.** Anna named one, so she has a plan that adapts every week. **Naming a destination is the paid act**, identically for body and mind.

### Three answers rejected as conversion arguments — but KEPT as retention

Recorded in full in the tier document so no future session deletes them as dead ends:

| Concept | Stay | Pay |
|---|---|---|
| Deepening relationship over time | ✅ Keep | ✗ 97% gone before day 30 |
| Impact allocation and the vote | ✅ Keep | ✗ *"Why not just give them a pound?"* |
| Transfer outward to real life | ✅ Keep (the arc) | ✗ Patronising; assumes the app knows your life |

**Common fault: all three priced feelings. Feelings are why people stay and talk. Capability is why they pay.**

### Ten destination shapes — body AND mind

**Body:** Endurance · Strength · Return · Consistency · Composition · Preservation
**Mind:** Steadiness · Restoration · Presence · Connection

A destination carries one body shape and/or one mind shape. **A mind-only destination is not a lesser answer.** An earlier draft offered body only, which reproduced exactly the mind/body split the product exists to refuse.

### Decisions that changed existing behaviour

- **In Step moves to FREE.** It is a practice, not a journey. The paid act is naming a destination, not access to content
- **Free gains the drop-in coach question** — *"Something like last time, or something different?"* This is what makes free a coach rather than a generator
- **The upgrade door is visible at ALL times**, never triggered by our judgement of readiness. Graeme's correction: *"That's us deciding when the user is ready. I might have got bored at day nine and gone."* P3 governs interruptions; a permanent non-interrupting surface is not one
- **Never say "upgrade to Personal" in-product** — the possessive collision makes it read as *"you shouldn't ask me that."* Offer the capability in plain English; name the tier only where money changes hands
- **Restoration is declared, not gated.** Crisis is not burnout. Requires a declaration that is not a one-time footnote, visible routing to real help, crisis policy v7 wired live throughout, and the copy rule **"company on the road, never recovery"**
- **Mind progress is never measured.** Graeme's psychologist framing: invite the practice, the journal belongs to the person, export for a real professional if they choose

### Three copy rules — non-negotiable, each earned from a real mistake

1. **No internal terms in user-facing copy.** A draft used *"a Connection journey"* — a term invented an hour earlier that no user has ever seen
2. **Every offer answers three questions in order:** what is it, what would it do for me, how do I get it
3. **The read-it-cold test.** Read every line as someone who has never seen the document. This caught *"I don't know where yours is"* in the check-in openings, and then caught the Connection line

### Build sequence

| # | Item | Tier | Notes |
|---|---|---|---|
| **1** | **Drop-in coach question** | Free | **Start here.** Independent of everything, uses existing `exerciseHistory` |
| 2 | Condition-aware empathy selection | Free | Prompts/stages/conditions all exist; only the matcher is missing |
| 3 | The always-visible door | Both | Cheap; stops losing people at day nine |
| 4 | Grounding moments | Free | In-exercise layer. Earns the pub sentence |
| 5 | **The plan** | Paid | **Largest piece. Does not exist yet** |
| 6 | Progress that reads | Paid | Depends on 5 |

**⚠️ §9 of the tier document is the important line: the plan does not exist yet.** `programmes.js` and `programmeEngine.js` are not a destination-driven adaptive road.

---

## 🔧 Third-pass trace fixes — shipped 12 Aug 2026

`sw.js` v263 → **v264**. `session-builder.js` → **v22**, `store.js` v29 → **v30**, `Schema.md` v1.24 → **v1.25**, new `tools/schema-check.mjs`.

| ID | Finding | Resolution |
|---|---|---|
| **C1** | 🔴 **Safety.** `capability.legPower` read by `capabilityProfile()`, never declared/written/asked — always fell back to `'full'`, so a wheelchair user was served **Seated Leg Extension**, the exact exercise the v29 note exists to prevent | Declared; default now conditional (`'limited'` when `needsSeated`). Gate then caught a second fault: `_loadsLegs()` proxied "loads legs" as "has equipment OR difficulty 3+", so a bodyweight leg extension passed. Leg movement patterns now count on their own account |
| **C2** | 🔴 140 of 556 entries are `contentType: 'practice'` (complete standalone sessions) and `session-builder.js` never read the field — a 60-min cardio build returned **C25K Week 1 AND Week 2 AND a 20-minute run** | Practices excluded from component selection |
| **C3** | 🔴 `ex.sets \|\| 3` tripled duration-based exercises; 60-min request labelled **"552–562 mins"** | Fixed at both parallel call sites |
| **C4** | 🔴 Found because C3 exposed it: fixed exercise counts ignore how long each takes; 60-min request produced 104 min of work | Sessions trimmed to requested duration. **Never trims warmup, cooldown or prescribed** |
| **A1/A2** | 🟠 `Schema.md` claimed store v21 when live was v29; documented `liftLogEnabled` default `false` when live is `true` | Reconciled to v30. **`liftLogEnabled` default-on needs Graeme's confirm or overrule** |
| **A3** | 🟠 A store-path audit would not have caught C1 or C2 | `tools/schema-check.mjs` — exits 1 on drift, can gate a commit |

**Retracted:** third-pass §3 ("exercise count no longer responds to duration") was **wrong**. `EXERCISE_COUNT` sets 60 min = 17. That is the allocation working as designed; earlier variation was pools running dry pre-CON.

### Still open from the third pass

- **C1 second half** — the conditional question (*"Do your legs take weight?"*, fires when `chairRise !== 'yes'`). **Wording needs Graeme's sign-off before it ships**
- **A2** — confirm or overrule `liftLogEnabled` default-on
- **Ten mis-tagged practices** (Savasana, pre-sport warm-ups) genuinely are components. Data pass, not a fix session
- **Practices must remain reachable** via Coach decides / Library / Mobility — confirm, or 140 entries became invisible

---

## 🔒 Locked Principles — agreed 11–12 Aug 2026

Seven principles agreed with Graeme in conversation. **Every future proposal must pass all seven.** They exist because the product's differentiation is a set of refusals, and refusals decay silently unless written down.

**P1 — The coach never sells, and never withholds what it can see.**
If the coach has noticed something, it says it. Free. Personal buys **tools** (choose session type, choose duration, log lifts, export, longer windows), never *deeper coaching*. The moment the coach's helpfulness becomes tier-dependent, "trust me, I've got you" becomes "I've got you up to a point," and a conditional promise is not a promise.

**P2 — The coach never talks about the app. A separate, visually distinct helper layer can.**
Graeme's Disney point, and it corrected an over-absolute position. Disney's cast members are visibly not characters; the frame holds *because* of the distinction. What would break it is Mickey discussing queue times. So the coach coaches, and a legibly different helper layer teaches the interface.

**P3 — The app never teaches in the abstract. It offers at the point of friction, triggered by something the person did, never on a timer.**
One deliberate exception: the periodic re-ask (WOW-5), which is coaching rather than teaching.

**P4 — The app may display load. The coach never interprets it.**
Graeme's point, and the most important thing agreed in the whole conversation. No commentary on the delta in either direction. No "slightly lighter today," no "up from last week," no arrows, no colour-coding, no "new best" badge. **The asymmetry is the reason:** silence on a drop is only credible if there is also silence on a rise. The moment the app cheers an increase, its silence on a decrease becomes a judgement. Celebrating is what creates the shame — you cannot have one without the other, which is why default-none is structural rather than a preference. Presentation is a flat unnarrated reference line (`Last: 60kg`) in the exercise meta, not coach voice. A Settings "Celebrations" group may sit on top, **default off** — someone who turns it on has asked for it, which is a different thing entirely.

**Framing note that produced P4, worth keeping:** *"Here's what you did"* has a comparison buried in it, and the comparison has a verdict attached. Behind it sits *"here's what you failed to achieve against last time."* There are British sprinters who have not PB'd in years; it does not eradicate their progress, commitment or quality. A flat or falling number carries no information about whether today was a good day — it was hot, they slept badly, they came anyway, which is the harder thing.

---


**P5 — No view defines exercise content. Views render; `js/data/exercises/` is the only source.**
Agreed 11 Aug after the third recurrence in two days. A fix applied to the database must not need applying twice. The private pool in `session-builder.js` cost three separate double-fixes (PT-11, CON-2, PT-19), each second application found only after somebody hit the bug live.

**P6 — Content existing is not the same as content being reachable.**
Agreed 12 Aug after the same defect appeared eight times in one day, in eight different forms, none of them found by the code. Any change to categories, equipment vocabulary, session types or routes must be followed by `Documents/Admin/Templates/audit-content-reachability.mjs`. A tick that unlocks nothing, a category that matches nothing, a route pointing at a missing file, and a contraindication naming a condition that does not exist are all the same defect wearing different clothes.

**P7 — Confidence scales with information; authority never does.**
Agreed 12 Aug. When the coach has been told something — a named sore area, and an exercise that loads it — it says so specifically rather than hedging, because hedging what we have been told is a coach pretending not to know. But the adjustment itself stays an invitation: *"consider taking some weight off"*, never *"take some weight off"*. The coach knows which exercise works which area; the person knows how it feels today. Naming the first without commanding the second is what respects both.

## 🛠️ WOW Build Sessions — 11 Aug 2026

Built from `alongside_wow_blueprint_11aug2026_v1.md`. All three verified by Node assertion and confirmed on a **fresh clone of the live remote**, per standing practice. **None is on-device confirmed** — that gate remains outstanding for all three.

### WOW-2 — Sessions that fit the person 🟢 Shipped (PT-2, PT-9)

`workoutGenerator.js` v1.13→**v1.14**, `exercises.js` + `exercises/index.js` v1.3→**v1.4**, `exercises/yoga.js` v1→**v2**, `sw.js` v225→**v226**.

`getUserProfile()` now falls through to `lifestyle.activityLevel` — the field live onboarding actually writes — with `fitnessLevel` retained as an explicit override so the Settings control still wins. Added a `returning: 6` ceiling (the fifth ACTIVITY_CHIP had no key and silently resolved to moderate). `yoga-crescent-lunge` given `energyRequired: 3`, making it reachable for the first time.

**Measured delta:** Tom's pool 330→254, exercises above his ceiling **76→0**. Priya's pool 350→359, hardest tier (energyRequired 9) available **0→8**.

**Note for the record:** the first verification run reported two FAILs. Both were the test's assertions being wrong, not the code — Tom's pool was +1 because Crescent Lunge became reachable, and the override test compared Tom (no equipment) against Priya's figure (six gym items). Re-run with corrected assertions rather than waved through.

### WOW-1 — Stop the under-reporting of effort 🟢 Shipped (PT-3)

`workout.js` v7→**v8**, `core-session.js` v6→**v7**, `yoga-session.js` v7→**v8**, `sw.js` v226→**v227**.

None of the three had a session-level clock, so every completion wrote `durationMins` null or absent and `progress.js:138` summed it as zero. Added `sessionStartTime` + `elapsedMins()` to each, mirroring `gym-programme.js:806`. Latched once at genuine session start, cleared on reset — necessary because `workout.js`'s `onMount()` re-fires on every timer toggle and rest timers re-enter the session phase. One-minute floor so a real completion never reports zero.

**All six `activityLog` write paths** across the three files now supply a real duration, including the three partial-exit paths that previously wrote explicit `null`.

**Measured delta:** Tom's three-week Progress **22→87 minutes**, four sessions all counted.

**Two things the verification caught that would otherwise have shipped wrong:** `core-session.js` had a *second* `durationMins: null` on its partial-exit path missed by the first pass, and `workout.js` needed the latch guard or the clock would reset mid-session on every timer tap.

### WOW-0 — Restore the legal consent record 🟢 Shipped, ⚠️ dependencies open

`store.js` v18→**v19**, `Schema.md` v1.17→**v1.18**, `thread.js` v7→**v8**, `privacy.js`→**v2**, `onboarding-thread.css` v4→**v5**, `sw.js` v227→**v228**. Schema first, per standing rule.

**The gap:** live onboarding had captured **no legal consent record at all** since OB-THREAD retired `welcome.js`. `welcome.js:85-86` was the only writer of the flat `consentGiven`/`consentAt`, and that route left `router.js` VIEW_NAMES in v7. Found by the PT-W1 store audit, not by anyone noticing.

New nested `consent{ given, at, policyVersion, ageConfirmed }`. Nested rather than flat for the coming Supabase migration, where PT-10 already flagged undeclared flat fields as a real loss risk. `mergeWithDefaults()` guards it so a real record is never overwritten by defaults — an existing user's timestamp is a legal audit trail.

**Affirmative tick, not implied consent** (Graeme's decision). `welcome.js` used "by tapping Start you agree", which leaves the "but I didn't know" problem open.

**Accessibility:** Continue uses `aria-disabled` + `.is-inactive`, **never** the HTML `disabled` attribute — that removes an element from the tab order entirely, which is exactly the PT-7 bug found in `session-builder-ui.js`. Tapping unticked shows an inline message and moves focus to the checkbox. Checkbox 24px in a 44px row (SC 2.5.8); links underlined not colour-only (SC 1.4.1); inactive opacity 0.55 matching `tier-gating.css` rather than a third value.

**Age gate: built and INERT.** `AGE_GATE_ENABLED = false` in `thread.js`. **Do not flip** until A1.11 (ToS 13+ vs business-doc 16+) resolves and Natalie's written advice lands. Flipping it early is worse than leaving it off — it produces an audit trail asserting an eligibility check with no agreed rule behind it.

**Two false statements found live in `privacy.js` and removed:**
- **"Build New Habits Ltd"** — sole trader, no limited company exists. Same error fixed on the website 03 Aug and missed here.
- **"ICO registered"** — it is not. Gated on BIZ-1 (HMRC), still open. The app was telling users their data sat under a registration that does not exist, on the one screen where accuracy matters most. Removed, not softened.

Footer now reads "Build New Habits · Somerset, United Kingdom". `privacy.js` reframed as an explicit *summary* pointing at canonical website documents.

---

---

## 🛠️ WOW Build Sessions — continued, 11 Aug 2026

### WOW-4 — Nothing is a dead end 🟢 Shipped (PT-7)
`session-builder-ui.js` v4→**v5**, `progress.js` v2→**v3**, `progress.css` v2→**v3**, `sw.js`→**v229**.
Locked types/durations moved onto `auth.js`'s `lockedFeature()` — the HTML `disabled` attribute removed them from the tab order, so the "Personal tier" label was unreachable and tapping did nothing. Also removed `session-builder-ui.js`'s private `isPremium()` duplicate (which had already caused one real bug, the v2 `userTier`/`tier` fix). **Free Progress window 7→30 days** — coherence, not generosity: a 7-day window cannot show variability, so the free tier was the coaching removed rather than a smaller version of it. 90 days now a visible locked tab.

### WOW-3 / PT-1 — The coach remembers 🟢 Shipped
`checkin-openings.js` v2→**v3**, `sw.js`→**v230**, **v231**, **v232**.
The territory branch matched IDs that have never existed anywhere — the retired `hard-before.js` used the same seven live IDs, so this never matched at any point in the product's life. Five of seven given purpose-written rows rather than approximated: mapping `trust-rupture` onto `past-failure` would put the failure on the person, the opposite of what they said.
**Two follow-ups after Graeme's review:** `escalation-trap` dropped "We're not doing that" (a guarantee the app cannot keep); `hormonal-change` → **`changing-body`**, reframed after Graeme's point that bodies change at every age for a hundred reasons. That reframe also fixed a second fault — the row said *"Do you remember telling me…"* but fired on an inference from `ageBand`, so the coach claimed a disclosure that never happened. Now an observation, not a recollection, and no longer age-gated.
**Copy audit** of all 19 rows after Graeme flagged an orphan referent. One real fault fixed, one grammatical tidy. Established for future copy work: **"one" meaning "session" is a house convention** in this file, predating today.

### PT-4 / WOW-6 — Lift notes 🟢 Shipped
`store.js` v19→**v20**, `Schema.md` v1.18→**v1.19**, `gym-programme.js` v5→**v6**, `settings.js` v14→**v15**, `gym-programme.css` v1→**v2**, `sw.js`→**v233**.
Rescoped from analytics to a **memory aid** on Graeme's framing. Flat unnarrated `Last: 60 kg × 8` plus a weight/reps capture. Off by default; Settings → Equipment.
**P4 enforced in code, not just intended:** `lastLift()` returns the entry only and no delta is computed anywhere, so a future caller has nothing to narrate. The test greps the rendered block for banned language. **Tier: recall free** (the coach remembering is not something to charge for, P1); analysis/trends/export Personal, **not built**.

### PT-11 — Fourth exercise pool, never filtered on fitness 🟢 Shipped
`session-builder.js` v3→**v4**, `sw.js`→**v234**.
**Found by the second trace, not by reading.** This file carries its own 65-exercise pool, separate from the 461-exercise database, and never filtered on fitness — so WOW-2 reached `workoutGenerator.js` but **not the "Cardio, Core & Strength" Home door**. A sedentary beginner and a gym-literate lifter got the identical pool. `difficultyLevel` was written on all 65 and read nowhere. Ceiling applied using the existing field; warmup/cooldown exempt so the safety floor cannot be starved. **Pool merge logged, not attempted** — four parallel pools is architecture.

### PT-12 — The reader-without-writer pattern, closed 🟢 Shipped
`store.js` v20→**v21**, `Schema.md` v1.19→**v1.20**, `gym-programme.js` v6→**v7**, `journal-entry.js` v3→**v4**, `morning-session.js`, `intention.js`, `sw.js`→**v235**.
Five confirmed instances made this the codebase's characteristic failure mode. Swept the remainder:
- **`exerciseFeedback`** — read by `applyFeedbackWeighting()` since v1.3, written by nothing, so the weighting had never run on real data. New `store.logExerciseFeedback()` wired to the existing "Skip this one" — a signal already given at the point of friction, no new UI, nothing said back (P3).
- **`journalEntryType`** — written by three call sites, read by none since the v3 privacy rewrite. Now read and cleared. **Journal Privacy Rule untouched** — prompt only.
- **`checkin.energy`** — never written. **Three** reads in `morning-session.js`; energy silently defaulted to 5 and `energyBefore` was always null. Third site found by a failing assertion, not by reading.
- **`todayEnergy`** — never written. Fallback retired.
- **`exerciseFeedback` and `absence.returnCapturedAt` declared** — previously surviving only via the `...saved` spread, the exact PT-10 migration risk.

---

## 🔬 Second Persona Trace — 11 Aug 2026

Full report: `Admin/alongside_persona-wave1_second-pass_11aug2026_v1.md`.

**Tom:** exercises above his ceiling **76 → 0**; Progress **22 → 87 minutes** (4 of 4 sessions counted, was 1 of 4); window 7 → 30 days; consent record none → tick + timestamp + version; day one now answers what he actually said.
**Priya:** hardest tier available **0 → 8**; "Lower body" tap now routes instead of doing nothing; `Last: 60 kg × 8` where the app previously captured no numbers at all.
**Unchanged and confirmed:** same-day return correct; warmup floor intact across all 21 type/preset combinations; `generic` still reachable for someone who skipped the age question.

**Still not resolved for Priya:** the analysis half of PT-4. She can stop using her Notes app at the machine (the stated need) but still cannot see load move over a month (the stated desire). Different things; one is done.

**Verification note worth keeping:** across today's sessions the first verification run was wrong and the code correct **five times**. Two real bugs were caught by assertions that would otherwise have shipped — `core-session.js`'s second `durationMins: null`, and `morning-session.js`'s third `checkin.energy`. The discipline that mattered was checking the source before accepting a failure.

---

## 🛑 RECOMMENDATION ON RECORD — run the device pass, and it is now overdue

**Restated 12 Aug, stronger than at v149.** v149 said stop building and run the device pass. Instead, 62 further commits shipped across 18 cache versions. Every one is verified by node assertion, fresh-clone check and regression matrix — and **none by a human holding a phone.**

That is not a criticism of the work; every finding came from Graeme using the product, which is exactly the right source. But the gap between "verified" and "confirmed working" is now eighteen cache versions wide, and beta starts mid-September.

**The single highest-value path through everything shipped today:** clear cache → build a gym Full Body → complete it. That one route exercises the pulse-raiser, equipment preference, watch-outs, load guidance, in-card notes, not-a-fan, session rationale and the progression invitation together. Then a check-in, for the scroll fix and the "I'm ready" pacing buttons — both judgement calls that cannot be tested any other way.

---

## 🔬 Third Persona Trace — 12 Aug 2026

Eight personas run against live code over simulated 6–8 week periods, not read but **executed**. Findings, all fixed the same day:

| Persona | Finding |
|---|---|
| **2.10 Dad, 76, frail** | Served **High Knees** as his opening pulse-raiser. The difficulty ceiling applied to `main` only; warm-ups were exempt on reasoning that held while they came from 70 hand-written warm-ups and stopped holding at CON-6. |
| **2.11 Mum, 76, low confidence** | Served **Warrior III**, a single-leg balance pose and a genuine fall risk. Root cause: 30 entries carried no `difficultyLevel`, and every read was `(ex.difficultyLevel \|\| 1)` — treating untagged as the *easiest possible*, which is backwards for safety. Separately, her Mobility session opened with **five breathing practices in a row**. |
| **2.15 Priya, 27, gym 4×/week** | Her eight most-repeated exercises after eight weeks were three cardio warm-ups and five accessories — **not one barbell lift**. CONT-1 anchored uniformly, and thin categories repeat while deep ones rotate, so it anchored what did not matter. |
| **Wheelchair user** | Correctly given seated work, then handed **Seated Leg Extension and Seated Hamstring Curl**. The screen asked whether he could rise from a chair; it never asked whether his legs work. Also 68% session-to-session overlap — the identical workout for eight weeks. |
| **2.13 / 2.14 ADHD vs autistic** | Both received ~51–57% overlap: one treatment serving neither. `sessionVariety` now separates them (23% vs 45%). |
| **All sessions** | **12% contained a duplicate exercise.** CON-6's per-category object spread defeated the identity-based dedupe guard. |

**Selection criterion confirmed again:** the personas with the least data and the most constraint surface the most defects. A wheelchair user and two 76-year-olds found six of the eight.

---

## 📁 Canonical documents and tools — current as of 12 Aug 2026

Every artefact below is committed to `build-new-habits/alongside-app`. This index exists because several were written on 12 Aug and referenced nowhere, which is the document version of the reachability defect this session spent the day fixing.

| Document | Location | Version | What it is |
|---|---|---|---|
| **Master schedule** | `Documents/Admin/master_schedule.md` | v150 | This document. Source of truth; wins over project knowledge on any conflict. |
| **Schema** | `Documents/Live State/Schema.md` | v1.24 | Canonical store field reference. Ground-truthed against `store.js` v29. |
| **Exercise Entry Standard** | `Documents/Live State/exercise_entry_standard.md` | v2 | Canonical definition of every content field on an exercise. Includes the `watchOut` rules, the effort-relative `load` rule, and the no-time-stamped-horizons rule. **Anything authored from now is written to this.** |
| **Content consolidation blueprint** | `Documents/Admin/alongside_blueprint_content_consolidation_11aug2026_v1.md` | v1 | CON-1 to CON-9 plan. All nine now complete. |
| **Entry validator** | `Documents/Admin/Templates/validate-exercise-entries.mjs` | v1 | Checks all 556 entries against the Entry Standard. Build-time only. |
| **Reachability audit** | `Documents/Admin/Templates/audit-content-reachability.mjs` | v1 | Categories, exercise reachability, equipment vocabulary both ways, contraindication validity, missing view files, orphaned routes. Build-time only. |

**Key code files introduced or restructured on 12 Aug** — all live, all in `js/`:

`data/equipment-map.js` (equipment vocabulary resolver), `data/session-categories.js` v5 (maps the builder's 49 categories onto the shared database), `data/session-rationale.js` (the coach explaining the programme, plus the progression invitation), `data/exercises/gym.js` v3, `data/exercises/seated.js` v2, `views/community-impact.js`, `views/annual-reflection.js`.

**Run before any deploy touching content, categories, equipment or routes:**
```
node "Documents/Admin/Templates/validate-exercise-entries.mjs"
node "Documents/Admin/Templates/audit-content-reachability.mjs"
```

---

## 📋 New task rows — 12 Aug 2026

| Task | Status | Notes | Next |
|---|---|---|---|
| **INF-AUDIT — content and navigation reachability audit** | 🟢 **Built and in use, 12 Aug.** `Documents/Admin/Templates/audit-content-reachability.mjs`. Checks categories, exercise reachability, equipment vocabulary both ways, contraindication validity, missing view files and orphaned routes. | Caught two defects *while being used to fix others* — a reintroduced `chest-acute`, and a `breathing-warmup` narrowing that left one candidate. | Run after any content, category, equipment or route change. |
| **BUILD-DEVICE — on-device confirmation pass** | 🔴 **Overdue.** Eighteen cache versions unconfirmed. | Gym Full Body end to end, then a check-in. | **Next session. Nothing else should precede it.** |
| **CONT-3 — remaining session views log a count, not exercise ids** | 🟠 **Open.** `core-session.js`, `yoga-session.js`, `prescribed-session.js` still write `exercisesCount` only, so their exercises never become familiar and CONT-1 does not apply to them. | One field each, same change as `gym-programme.js` v9 and `workout.js` v10. | Book after the device pass. |
| **CAP-6 — intent and variety questions have no screen** | 🟠 **Open.** `trainingIntent` and `sessionVariety` are live in the engine and read by selection. Nothing asks either question, so every user runs on defaults and the maintain/recover branches are unreachable. | Wording proposed for intent ("What are you hoping for right now?") and variety; **both need Graeme's confirmation before build.** | Decision, then build. |
| **DATA-1 — `contentType` retirement** | 🟠 **Decided, not done.** Written on 368 of 556 entries, read by nothing anywhere. `category` is what the engines select on. | Deliberately not bundled into the 12 Aug session — it touches 368 entries across 12 files for no functional gain, and that is how mistakes get made. | Clean standalone task. |
| **DATA-2 — 49 loaded exercises carry no `sets`/`reps` fields** | 🟡 **Open.** The card shows a duration where a gym user expects 3 × 10. 44 of the 49 state it in their `instructions` prose, so the information exists in the wrong place. | Extraction from prose is error-prone and has deliberately not been guessed at. | Manual pass, or a per-entry decision. |
| **NAV-1 — two orphaned views remain** | 🟡 **Open.** `coach-reflection` and `mobility-conditioning` have views and nothing navigates to them. | Down from 6. | Decide: front door, or retire. |
| **NAV-2 — first-run navigation and goal-directed pointers** | 🟠 **Designed in conversation, not built.** Four bottom-nav items for 42 routes. Agreed approach: fix missing front doors first (done), then goal-directed pointers ("given what you told me, start here"), then a short skippable tour last — a tour of a product with hidden doors just teaches people the doors are hidden. | Graeme's idea, refined in conversation 12 Aug. | Book after device pass. |
| **CAP-7 — seated pool depth** | 🟡 **Improved, not solved.** A seated user with no leg function sees 53% session-to-session overlap against a gym-goer's much lower figure, because the eligible pool is structurally smaller (61 vs 500+). | 38 seated entries now. Genuine parity needs roughly 30 more. | Content session in its own right. |
| **RAT-2 — recovery protocols have no surface** | 🟡 **Open.** 28 exercises remain unreachable by any session type — cold showers, hydration, nutrition timing, nap protocols, visualisation practice. These are correctly *not* session items. | They need their own place in the product rather than a category. | Design decision. |

---

## 🚦 New action points from the WOW sessions

| ID | Item | Severity | Detail | Target |
|----|------|----------|--------|--------|
| **BETA-1** | **Consent gate links to two pages that do not exist** | 🟠 **Pre-beta blocker** | `thread.js`'s gate links to `buildnewhabits.co.uk/privacy/` and `/terms/`. Neither page has been built. **Graeme's decision, 11 Aug: acceptable as placeholders for now, wire later.** Not defensible at beta — asking someone to tick a box agreeing to documents they demonstrably cannot read is weaker than the implied consent it replaced. Drafts exist (`alongside_privacy_policy_draft_23jul2026_v3.docx`, `alongside_terms_of_service_draft_23jul2026_v2.docx`), both awaiting Natalie. In-app summary (`privacy.js` v2) is a working fallback and the gate does link to it, so nothing is broken today. | **Before beta start (mid-Sept)** |
| **BETA-2** | **`POLICY_VERSION` must be bumped when real policies publish** | 🟠 **Pre-beta, easy to miss** | Currently `'2026-08-11'` in `thread.js`, pinned to documents that do not exist yet and have not been through Natalie. When the real policies land, this constant **must** be bumped — otherwise every beta tester's record asserts agreement to a version that was never published, and there is no way afterwards to tell who needs re-consent. One-line change, expensive to reconstruct retrospectively. | **Same session as BETA-1** |
| **BETA-3** | **On-device confirmation of all three WOW sessions** | 🟡 | Nine files across WOW-0/1/2, none on-device confirmed. Consent gate has never been seen to render. Hard-reload past the service worker (now `alongside-v228`). Joins `gym-programme.js` v5, still the oldest outstanding test on the board. | Next device session |
| **BETA-4** | **Age gate activation** | 🟠 | `AGE_GATE_ENABLED` false in `thread.js`. Blocked on A1.11 + Natalie. Tracked here so it is not forgotten behind a code flag. | On A1.11 resolution |

---

## 📌 Still outstanding from PT-W1

Unchanged from v147 — see that version for full evidence on each.

- **PT-1** 🔴 **Decision-gated, blocking the highest-emotional-return fix.** Needs Graeme's mapping of the seven live territories to check-in openings. `the-history` → `past-failure` is obvious; `escalation-trap` and `invisible-person` likely need new content written. A code-only guess must not ship. **Offered: a drafted proposal of all seven with reasoning, to react to rather than generate cold.**
- **PT-4** 🟠 **Decision-gated.** PB logging — beta blocker or post-beta? **Rescoped 11 Aug** from analytics to a *memory aid* on Graeme's framing ("I want to know what weights I was lifting last week so I know what settings to add to the machines, rather than working blind"). Far smaller build. **Tier split agreed:** recall in session free (that is coaching, per P1), analysis/trends/export Personal (that is a tool). Presentation must conform to P4.
- **PT-5, PT-6, PT-8, PT-10** — logged, unchanged.
- **PT-7 / WOW-4** — build-ready, not yet run. Includes the free-tier Progress window 7→30 days (coherence with *variability is information*, not generosity) and swapping session-builder's locked tiles onto `lockedFeature()`.
- **WOW-5** (periodic re-ask) — spec needed. Carries the **safety edge**: condition-safety filtering only runs on conditions the app knows about, and nothing in the app ever re-asks anything. Recommended cadence 8 weeks activity/equipment, 4 weeks conditions — **unconfirmed by Graeme**.
- **WOW-7** (helper layer) — deliberately post-beta measurement.
- **`exerciseFeedback` capture** — build-ready, small. `applyFeedbackWeighting()` reads it, nothing writes it. Cheapest route to "the app noticed and adjusted without me telling it."

---
- **v146, Persona Tracing Wave 1 brief:** logged as a new brief, sourced from the existing 17-persona QA matrix rather than inventing new personas. Wave 1: persona 2.12 (blank-slate) and 2.15 (gym-literate, run as one continuous free-to-Personal journey). Method specified simulating three weeks of realistic irregular use via direct store manipulation. Three required outputs with separate evidence standards. **Now executed — see PT-W1 below.**
- **v145, `gym-programme.js` UX rebuild:** confirmed by Graeme's direct screenshot comparison that 10 Aug's content fix wasn't enough — the screen structure was still a flat scrollable list, not the one-exercise-at-a-time walkthrough every other guided session type uses. Rebuilt to match `prescribed-session.js`/`workout.js` exactly, reusing their proven markup and shared CSS classes. Week 6/12 moments, programme progression, A/B alternation, exit-guard all unchanged. Not yet on-device confirmed — the highest-priority test on the board.
- **v144, YouTube links + exercise-detail consistency audit:** all 461 exercises given tailored YouTube search terms (previously zero coverage). Connected finding: `instructions`/`coaching`/`why` were already at 100% data coverage — five views had silent field-name bugs (`gym-programme.js` alone had three) meaning content never rendered despite existing. `prescribed-session.js` fixed too (was showing zero guidance for any prescribed exercise). `walk`/`run`/`swim`/`cycle-session.js` confirmed correctly out of scope. `yoga-session.js`'s private pose pool flagged as a third parallel exercise database, not merged.
- **v143, overnight autonomous session:** small, well-evidenced fixes reducing untested surface area rather than new speculative features — matching the established pattern (phase, defer, confirm before building more). Two real bugs fixed in `noticing.js`'s reflections display (blank text and broken sort, both from a field-name mismatch since the 14 Jul journal privacy rewrite). Bodyweight-only lower-body content gap closed. One important correction, not an execution: the "orphaned duplicate" note on `exercises/index.js` was stale — it's genuinely load-bearing now, three live features depend on it, documented rather than deleted.
- **v142, Philosophy page:** built and pushed, the website's first new page since 03 Aug. Built verbatim from the locked 10 Jul architecture doc (never built until now — same quiet drop-off `/upgrade/` had). Pure prose per the locked design principles. `philosophy/index.html` v1, `site.css` v18→v19, `site.js` v6→v7 (added to nav, placed first), `sitemap.xml` v3→v4. Nav decision confirmed by Graeme: `/who-its-for/` stays out of the nav (Move-specific), Philosophy earns its slot for being family-wide. Real gap found and fixed in passing: `sitemap.xml` had never listed `/upgrade/` or `/who-its-for/` — under-listing the live site by two pages for a week. Two open questions logged for Graeme, not decided unilaterally (h1 wording, a possible attribution line for Beat 4). Not yet reviewed on a real browser.
- **v141:** Solicitor consultation held (Natalie, 30-min introductory call) — first legal conversation on record. Qualification call, not an advice call; no substantive advice given. Awaiting written response on priorities and costs. Five follow-up actions logged. Also fixed a header/footer version drift.
- **v140:** "In Step" (Noticing Hub, Personal tier) built and pushed — four movements, 16 scenarios, 3-day anti-binge cooldown, aggregate-only choice logging. `store.js` v18, `Schema.md` v1.17, `sw.js` v222. Not on-device confirmed. Two pre-existing bugs found and logged, not fixed.
- **v139:** Gym Session Builder Phase 1 built in full the same day it was scoped — location step, allocation presets with a structural warmup safety floor, three build routes, real cardio-warmup content. Node smoke tests caught a real bug pre-ship (a replace that deleted Glute Focus's entire `mainCategories` line). Also fixed a pre-existing gap: `session-builder.js`/`session-builder-ui.js` were never in the service worker precache list. `sw.js` v221. Not on-device confirmed.
- **v122:** On-device pass confirmed for today's whole body of work. Exercise rationale (already existed, now shown) and Avoid/Less-often dislike signal (applied from an already-approved spec) shipped for condition-programme candidates.
- **v121:** Feeling-word chip wrapping and invisible checkbox selection both fixed. `coach-reflection.js`'s four-option picker confirmed genuinely obsolete and retired. Aesthetics audit now tracking two confirmed instances.
- **v120:** Check-in gating made genuinely optional (session-generating doors only force check-in the first time today). Real condition-programme routes built — "Coach builds it" and "Coach recommends, I'll choose" join "Build my own," backed by a new tested selection module.
- **v117:** Phase D-1 (schema) closed — `conditionGoals`, `prescribedExercisesOrigin`. No view code yet.
- **v116:** All three Phase D decisions resolved same day they were logged — `conditionGoals` (felt-sense, matching Graeme's own framing), `prescribedExercisesOrigin` (coach-voice branch), fold-in dial scope confirmed. Blueprint at v2, fully unblocked.
- **v115:** Phases A–C confirmed on-device. Phase D blueprinted with 3 open decisions logged. Real bug found and fixed while scoping — Conditions Update door's bottom-nav/Back bug, same fix `settings.js` used once before.
- **v114:** Graeme's first on-device pass on Phase C, seven screenshots, four real fixes: auto-opened panel was covering the coach's constraint message (fixed), check-in now gates the two session-generating doors, equipment copy matched to its actual saved/empty state. Two real gaps logged not built: cosmetic polish needed, `gym-programme.js` lacks a guided walkthrough.
- **v113:** Home Nav Phase C closed — six-door Home screen, `coach-proposal.js` doors-UI removed, real `session-builder` route bug found and fixed.
- **v112:** Home Nav Phase B closed — `core-session.js`'s private exercise pool (23 objects) removed, consolidated onto the shared database. Two id-collision bugs found and fixed. Private severity threshold replaced with canonical filtering. End-to-end Node smoke-tested.
- **v111:** Multi-condition natural-language messaging, mixed-severity combined narrative, and Severe pain active Rest/Adapt choice with audit trail (`severePainChoices`) — three same-day passes closing out the condition-messaging arc. Real finding: Severe pain had no rest-day override anywhere live before this.
- **v110:** Pain Input Redesign — condition pain input converted from 4-button chips to sliders (`checkin.js` v9, `checkin-mini.js` v4), matching Energy/Mood. New canonical `getPainBand()` in `conditions.js`, replacing a fourth private severity duplicate. New Mild acknowledgment tier, previously totally silent.
- **v109:** On-device testing caught a real bug Phase A missed — `coach-proposal.js` had its own third private severity threshold, still `>=4`. Fixed (v13). Same round: three UI bugs found and fixed (feeling-word chip overflow, bottom-nav overlap on all onboarding screens, "flagged" message too easy to miss). Graeme raised the slider question, logged not yet decided.
- **v108:** Home Nav Phase A closed — `store.js` v12, `conditions.js` v1.3 (single-source-of-truth threshold fix), `Schema.md` v1.11. No view files touched.
- **v107:** Home Nav & Conditions Redesign fully blueprinted, pushed to repo. 5 more decisions resolved (coach-proposal.js reduced not retired; "Your programme" placed inside Cardio/Core/Strength; reps/sets/weights authority rule; threshold fix widened to canonical source; pool consolidation de-risked). NEW-1 (Programme Curation) and NEW-2 (fitness recalibration engine) logged separately, not folded in. Tier-gating build (S4-TG) reconciliation — was live since 03 Aug, not previously reflected here.
- **v106:** All five v2-spec open items resolved with Graeme (severity threshold, fold-in dial mechanics, Conditions Update entry point, goals/milestones). Still planning only.
- **v105:** New design spec added — Home Navigation & Conditions redesign (six-door Home screen, Conditions Update system, shared exercise-pool architecture principle), grounded in direct code tracing.
- **v98, same-day follow-up:** `userTier` bug fixed — `session-builder-ui.js`'s `isPremium()` now reads `store.get("tier")` instead of the never-written `"userTier"`. `session-builder-ui.js` v1→v2, `sw.js` v187→v188.
- **v97, Supabase schema & architecture design (design-only):** New doc `alongside_supabase_schema_design_03aug2026_v1.md`. Frankfurt region recommended; hybrid relational+JSONB table design; RLS via `auth.uid() = user_id` plus one `SECURITY DEFINER` function for Impact Credits aggregates; DPA/TIA documented as a ready 5-item checklist, still gated on BIZ-1.
- **v96, BUILD-4 Appendix A follow-up:** All 18 previously-unclassified schema fields resolved — 11 live, 5 dormant, 2 dead, zero real naming-overlaps. `Schema.md` v1.9→v1.10. Found `proposalBias` (written, never read — still open) alongside the `userTier` bug (fixed above).
- **03 Aug earlier, website session:** WCAG audit closed, `/upgrade` and `/who-its-for/` pages built, footer "Ltd" fixed, cache-busting bug fixed, comparison table ground-truth-corrected against live code (found: no difficulty-based exercise gating exists, no hardcoded programme remains, no generative programme engine exists).


---

## 🔬 PT-W1 — Persona Tracing Wave 1 Outcome, 11 Aug 2026

**Status: 🟢 Trace complete. Findings 🟠 open.** Run same day the brief was written. Executed against a fresh `git clone --depth 1` (public, no token needed) with `js/store.js` loaded standalone under Node via a `localStorage` stub, seeded with backdated three-week state for both personas.

**Method note worth keeping:** persona state was built from **what live onboarding actually writes** — established by reading `thread.js`'s `_writeAnswer()` (lines 1032–1040) against the `storeField` declarations in `onboarding-thread-data.js` — not from the specs. Both criticals below were only visible because of that choice. Building the fixtures from the spec would have hidden them completely.

**Honest caveat on the brief's own design:** the brief was deliberately written for a fresh chat with zero project history, to reduce bias. It was run in the PM chat instead, which has full history. The bias-reduction intent is therefore **partially unmet** — worth repeating properly for Wave 2 if the independence matters.

**Two corrections to the brief itself, found in the code:**
- Brief §6 says "all five focus types" in the Gym Session Builder. `session-builder.js:87` exports **seven** (`glute, upper, lower, full, core, cardio, mobility`).
- Two hypotheses were tested and **disproved** before reaching the report — `gym-programme.js:610` does not render `"3 × undefined"` (`buildSession()` assigns `sets`/`reps` at build time), and free-tier session-type tiles are not silently discarded (they are properly `disabled`). Recorded so neither is re-derived.

**Deliverables, all pushed to `Documents/Admin/`:**
- `alongside_persona-wave1_technical-report_11aug2026_v1.md`
- `alongside_persona-wave1_plain-language-summary_11aug2026_v1.md`
- `alongside_persona-wave1_narrative_11aug2026_v1.md`

**Wave 2 selection criterion, now evidence-based:** the blank-slate persona (2.12) surfaced both criticals first and was decisively more productive than the gym-literate one. Arriving with no data means no other field masks a gap. **Persona 2.5 (sister, post-cardiac, total beginner) is the Wave 2 candidate** — same "does the app actually use what it was told" question, but where the answer is a safety question rather than an engagement one.

---

### PT-W1 findings — new task rows

| ID | Finding | Severity | State | Target |
|----|---------|----------|-------|--------|
| **PT-1** | **Day-one check-in contradicts the user's onboarding disclosure.** `checkin-openings.js` `_resolveDayOne()` matches `onboarding.primaryTerritory` against `pain`/`motivation`/`history`/etc. The live IDs written by `onboarding-thread-data.js:53–61` are `trust-rupture`/`escalation-trap`/`life-interruption`/`wrong-fit`/`invisible-person`/`body-story`/`the-history`. **Zero overlap.** All seven executed — every one returns the `generic` row (`checkin-openings.js:234`): *"This is the first real one. No history yet — just you, now."* A user selecting `the-history` is told they have no history. The correct line (`past-failure`, line 227) exists and has never been shown to anybody. **Affects 100% of users who have completed onboarding.** | 🔴 Critical | 🟠 **Decision-gated, NOT build-ready.** Needs Graeme's content decision on territory→opening mapping before any code. Seven live territories vs. existing DAY_ONE rows — `the-history`→`past-failure` is obvious; `escalation-trap` and `invisible-person` may warrant their own rows. **Do not ship a code-only guess.** | WB 10 Aug — decision first |
| **PT-2** | **`fitnessLevel` has no live writer.** Only writers: `onboarding/lifestyle.js:268` (route retired from `router.js` VIEW_NAMES in v7 — unreachable) and `settings.js:978` (manual). `thread.js` writes `lifestyle.activityLevel` at Step 9 and never mirrors it. `workoutGenerator.js:594` falls back to `"moderate"` for everyone. Downstream confirmed live: `exercises.js:272–273` → `filterByFitnessLevel()`. **Measured against the real 461-exercise DB:** sedentary user gets 329 exercises instead of 253 (76 above his ceiling); active user gets 350 instead of 359 (9 hardest silently withheld). **Also resolves `workoutGenerator.js` v1.8's own open question** — `getSuitableExercises()` *does* use `profile.fitnessLevel`. | 🔴 Critical | 🟠 Build-ready. Recommend `workoutGenerator.js:594` reads `lifestyle.activityLevel` with `fitnessLevel` as override fallback — one source of truth, keeps the Settings override working. **Schema-first: `Schema.md` before code.** Include a `returning` ceiling (5th ACTIVITY_CHIP, currently no key in `ceilings`). | WB 10 Aug |
| **PT-3** | **Progress under-reports minutes.** `progress.js:138`/`:447` sum `durationMins`. Never supplied by `workout.js:507,553` (explicit `null`), `core-session.js:811`, `yoga-session.js:766` (omitted), `morning-session.js:178` (`duration`), `quiet-session.js:931` (`null`). Executed: Persona A's 4 sessions over 21 days → **1** carries a number. `workout` — the coach's default generated type — is worst affected. A product built so nobody feels they're failing tells a man who did four sessions he did one. | 🟠 High | 🟠 Build-ready. Touch-once scope: `workout.js`, `core-session.js`, `yoga-session.js` only. | WB 17 Aug |
| **PT-4** | **No performance/lift capture exists anywhere.** Exhaustive search across `js/`: no `personalBest`, no `oneRepMax`, no weight field, no `type="number"` or `inputmode="numeric"` in any session view. `gym-programme.js:610` displays prescribed `sets × reps`, never captures actual. **Persona-matrix Section 4 decision 2 (PB logging as a Personal-tier feature) is specified and never built** — same "specified but never built" pattern as empathy transfer and `exerciseFeedback`. **Direct consequence for the tier proposition:** everything Personal unlocks is orthogonal to progressive overload. Persona 2.15's matrix open question now answered — the tier isn't the issue, what she wants isn't there at either price. | 🟠 High | 🟠 **Decision-gated.** Beta blocker or post-beta? Affects the Personal value proposition and any pricing copy. Not booked. | Decision needed |
| **PT-5** | **`store.logSession()` is dead code.** Defined `store.js:966`, **zero callers**. `progressLog` written instead by `programmeEngine.js:92,112`; read by `programmeEngine.js:125,232` and `gym-programme.js:288`. `progress.js` never reads `progressLog` at all. Field-name split: `logSession()` writes `durationMinutes`, `logActivity()` writes `durationMins`; `gym-programme.js:820,833` writes both to different logs in one handler. | 🟡 Medium | 🟠 Decision: retire `logSession()`, or wire `progressLog` into Progress. Not both. | Not booked |
| **PT-6** | **Four views bypass `store.logActivity()`** — `morning-session.js:189,226`, `breathing-session.js:253`, `quiet-session.js:934,971`, `activity-log.js:221` — losing the 10-second dedupe guard that exists precisely to prevent the B3-3 duplicate-write bug. `morning-session.js:200–203` documents this as deliberate; the field-naming divergence in PT-3 is the direct result. `morning-session.js:175` also writes `date` as `"YYYY-MM-DD"` with no `completedAt` — tolerated by `today.js:239` and `progress.js:133`, no live break, but fragile. | 🟡 Medium | 🟠 Logged. Fold into PT-3's session if scope allows. | WB 17 Aug |
| **PT-7** | **Three different "locked" treatments, one a dead end.** `lockedFeature()`+`tier-gating.css` (`auth.js:95`, used only by `noticing.js:285`) — opacity 0.55, tappable→`/upgrade`, `tabindex="0"`. `progress.js:247–259` — tappable, keyboard-reachable. `session-builder-ui.js:230–252` — inline `opacity:0.45`, **`disabled`, so no tap-through and removed from tab order entirely.** Its `aria-label="… -- Personal tier"` (line 235) is therefore unreachable by keyboard/SR users. Conversion dead end and an information-parity gap. `tier-gating.css` was built 03 Aug for exactly this and is used once. | 🟡 Medium | 🟠 Build-ready. Swap session-builder tiles onto `lockedFeature()`. **Contrast ratio at 0.45 needs on-device measurement** — disabled controls are exempt from WCAG 2.2 SC 1.4.3 so not a strict failure, but inconsistent with the design system's own 0.55. | WB 17 Aug |
| **PT-8** | **Session duration is a display string, not a number** (`"55–65 mins"`) — nothing downstream can compute against it. Executed all 7 types × 3 presets at 60 min: `glute` 17 ex, `lower` 17, `full` 17, `upper` 11, `core` 8, `mobility` 7, **`cardio` 4** — all labelled "55–65 mins". BUILD-5's logged residual ("short-exercise focus types land under target") resurfacing at long durations where it's far more visible. | 🟡 Medium | 🟠 **Needs on-device confirmation** of actual elapsed time for a 60-min cardio build before scoping. Simulation gives exercise counts, not wall-clock. | Not booked |
| **PT-9** | **`yoga-crescent-lunge` has no `energyRequired`** — 1 of 461. `exercises.js:187` filters `ex.energyRequired <= ceiling`; `undefined <= 8` is `false`, so it is excluded for every user at every ceiling below 10. Unreachable in the live app. | 🟢 Low | 🟠 One-line data fix. Fold into any exercise-data session. | Opportunistic |
| **PT-10** | **Three undeclared store fields** — `totalCredits` (written by 6 views, read `workout-complete.js:18`), `homeEquipment`/`gymEquipment` (written `onboarding/equipment.js:156–157`, read by `settings.js:634–635` and `session-builder-ui.js:338–339,777`). Absent from `getDefaults()`; survive only via the `...saved` spread at `store.js:216`. Invisible to `Schema.md`, and would be silently dropped by any migration rebuilding from defaults. | 🟢 Low | 🟠 **Gates Supabase schema work.** Add to `getDefaults()` and `Schema.md` first. Schema-first rule applies. | Before Supabase session |

---

### PT-W1 — confirmed working, recorded so it isn't re-derived

| Behaviour | Evidence |
|---|---|
| Same-day return gating | `today.js:363–378`. Three scenarios executed (fresh morning / post-session same day / morning-session same day). First door tap of the day gates to `checkin`; later taps route straight through; Home coach line correctly switches to "You moved today — that's done." All correct. |
| `pendingDoorRoute` round-trip | Set `today.js:375`, honoured/cleared `checkin.js:667–669`, `checkin-mini.js:439–441,527–529`. Skip path honours it (v6). No leak. |
| Coach voice Nurturing-only | No picker in `settings.js`; removal documented `settings.js:116–117`; `coachStyle` retained internally only. Matches the standing rule exactly. |
| Per-location equipment in Settings | `settings.js:633–652`. The 10 Aug fix is live and correct. |
| `gym-programme.js` v5 field names | Old names (`setup`/`whyThis`/`videoUrl`) appear **only** in the changelog comment at lines 53–54. Live code reads `instructions`/`why`/`youtube`. v4's fix held through the v5 rebuild. |
| Exercise content coverage | `instructions`, `why`, `coaching`, `youtube` all **461/461 (100%)**. |
| Invalid session type | `buildSession({sessionType:'strength'})` → `null`; `gym-programme.js:516` guards and falls to `renderNoSession()`. Degrades safely. |
| Condition/return-based day-one openings | Unaffected by PT-1. `chronic-condition`, `injury-recovery`, `return-to-fitness`, `feel-good` all still reachable. Damage is confined to the territory and age branches. |

**Still open from PT-W1, not itself a finding:** `gym-programme.js` v5 remains **not on-device confirmed** — unchanged from v145/v146, still the highest-priority test on the board. Code tracing raised no new concerns about it, which is not the same as confirming it.

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
- **Supabase schema & architecture design — 🟢 Closed, 03 Aug.** `alongside_supabase_schema_design_03aug2026_v1.md` live in repo. See this version's substantive changes, above, for headline decisions. Design-only, nothing live, per scope.
- [x] ~~**Tier-gating build (S4-TG)**~~ — 🟢 **Closed, 03 Aug — found live during 04 Aug reconciliation, not previously logged here.** `sw.js` v191 confirms `js/auth.js` built (`getUserTier()`/`isPremium()`/`isAthlete()`/`lockedFeature()`), reading the live `"tier"` field consistently with `settings.js`/`progress.js`/`session-builder-ui.js`/`upgrade.js`/`coach-proposal.js`. New `css/components/tier-gating.css`. `app.js` v7→v8 wires tap-through on locked features straight to `/upgrade`. **This row was stale — the build happened same-day (03 Aug) as this schedule's own v105/v106 writing and wasn't folded in.** Note for the record: `lockedFeature()` itself isn't yet applied to any live feature (infrastructure built and tested, no confirmed real-and-ungated premium feature found to wrap it around). `coach-proposal.js`'s `renderBypassDoor()` was found to have an unused `tier` parameter during this build — original intent unclear, not fixed, superseded by this session's door decisions below anyway.
- **Supabase schema & architecture design — 🟢 blueprint ready, 31 Jul** (`alongside_blueprint_supabase-schema-design_31jul2026_v1.md`). **Design-only, explicitly scoped** — not a live migration session. Two real dependencies confirmed today, not assumed: the DPA request needs BIZ-1 (HMRC) done first; tier gating doesn't exist as a system yet (checked directly — 4 scattered reads of `tier`, zero central gate mechanism anywhere in `js/`). Both logged as separate, not-yet-scoped sessions rather than silently bundled in.
- BUILD-1's remaining sub-question
- BIZ-2, BIZ-3, INF-6, OUT-2, OUT-7
- **Org outreach category decision** (see Alex Meeting Outcomes below) — Graeme's call on whether workplace wellbeing reps and women's health groups join the Tier list, plus the "what's in it for them" messaging pass. Blocks OUT-2–OUT-8.

*Full six-week plan: Task Inventory doc, Section J (v5).*

---

---

## 🌱 Outreach Developments — 03 Aug 2026

**BANDS CIC — a real response, first of four Tier 1 emails.** A meeting is now set with Alfie and his members — the first actual reply out of the original four (ADHD UK, National Autistic Society, ADHD Foundation, BANDS CIC), all emailed with no response until now. **Meeting date: not yet confirmed** — get this from Graeme and update here once known, don't leave it dateless indefinitely.

**Real potential upside if the meeting goes well:** follow-on meetings with BANDS members across **Frome, Bath, Weston, and Trowbridge** — genuine multi-town reach across Somerset/Wiltshire, not a single contact. Worth treating the Alfie meeting itself as the actual priority — the four-town potential is downstream of it going well, not a parallel track to chase independently yet.

**Canopy connection — a personal trainer with neurodivergent clients.** Surfaced through Graeme's separate Canopy course sub-project, not the direct org-outreach list — a different channel entirely (a warm individual connection via an unrelated project, not a cold-outreach org response). Potentially interested in "supporting" — **nature of support not yet clarified** (beta testing? client referrals? something else?). Needs a conversation to actually understand what's being offered before this can be scoped as a task.

---

**Source: Graeme's actual run + library session today** — the first genuine field-conditions test any session view has had (phone locked/pocketed during real use), as opposed to a desk-based device test. Four symptoms reported, traced against live `running-session.js` and confirmed to share one root cause:

**The gap:** the app never calls the Wake Lock API anywhere, and never persists in-progress session state to `store` during a run — only at the very end (`endSession()`) or on a deliberate exit (`savePartialSession()`, called from the exit-guard paths only). Everything else (`elapsed`, `phase`, `paused`, prompt scheduling) lives in plain module-level JS variables, driven by a single `setInterval`.

**How each symptom maps back to it:**
- **Prompts never fired** — every prompt, vibration, and phase transition (warmup→run, cooldown) is driven by that one interval. Mobile browsers throttle or suspend `setInterval` heavily once the screen locks. With the phone pocketed for most of a run, the interval barely ran.
- **Vibration only worked with the screen open** — same interval, same cause. `firePrompt()`'s `navigator.vibrate()` call only ever executes from inside the throttled interval.
- **Pause wouldn't resume** — the pause flag itself is a simple toggle and works fine in isolation, but it depends on that same interval to ever act on it again once the screen locks.
- **Refresh caused a full restart** — different mechanism, same root gap. Nothing checkpoints a running session to `store` mid-run, and nothing on mount checks "was there an interrupted session?" — a refresh just wipes the in-memory state back to defaults.

**Confirmed app-wide, not running-specific:** checked `workout.js` and `yoga-session.js` directly — same gap in both (no Wake Lock, no mid-session checkpoint). Running exposes it hardest since it's the activity most often done with the phone locked away, but this is architectural, not a running-only bug.

**Not yet done → blueprinted → built, all same day, 03 Aug:** solution confirmed with Graeme, blueprint written (`alongside_blueprint_wakelock-resume_03aug2026_v1.md`), then run immediately. `running-session.js` v3→v4: `elapsed` now computed fresh from timestamps every tick instead of incremented; checkpoints written to `store` at session start/pause/resume/each prompt via new `js/session-resume.js`; on cold mount, an interrupted run is offered back via a coach-voiced resume-or-fresh card (reuses `.session-exit-*` CSS as-is); Wake Lock requested on start/resume, released on end/exit, re-requested on `visibilitychange`. The exact-equality interval-prompt bug (Section 3 of the blueprint) fixed in the same pass. All pushed, independently re-confirmed live via fresh fetch, `node --check` clean.

**Still open: on-device confirmation.** No device available this session — this is the one bug in recent memory that was only ever discovered through real use, so code-clean and `node --check`-clean genuinely means less here than usual. The real test: lock the screen mid-run for several minutes and confirm the timer/prompts recover correctly on unlock; force-refresh mid-run and confirm the resume card appears and restores state accurately.

---

## 🌐 Website Session — WCAG Audit + Upgrade Page Build, 03 Aug 2026

Run directly in the PM chat, no separate build-chat brief — repo: `github.com/build-new-habits/website` (separate from `alongside-app`). Token confirmed valid (expires 06 Aug 2026 10:13 UTC). `css/site.css` v7 → v11 across the session.

**Part 1 — WCAG 2.2 AA contrast audit (site.css v7→v8).** The confirmed scroll-arrow issue (1.61:1, needed 3:1) was fixed — `.hero__scroll-signal` switched from `--color-border` at 0.6 opacity to `--color-text-muted` at 0.85 opacity (6.14:1). Tracing `--color-border`'s usage found it measures 1.15–2.36:1 against every background token in the system — it never clears 3:1 anywhere — on 5 more functional-boundary elements (nav layout-toggle, nav hamburger-toggle, `.btn--ghost`, `.form-input`, `.hero__pause`). All six switched to `--color-text-muted` (3.91–8.05:1 across all backgrounds). New finding, not in the original brief: `.badge--live`/`.badge--soon` text-vs-background fell as low as 3.24:1 inside `.card` contexts (Products/Impact pages) — the 15%-alpha tinted background was never verified against a card background. Fixed by making badge backgrounds solid `--color-bg-deep` instead of blended rgba (6.96–10.69:1 everywhere now). Checked, no fix needed: `--color-border-light` (decorative dividers, SC 1.4.11 exempt), focus indicator (already 4.66–9.59:1), disabled `cause-card__vote` inputs (genuinely and permanently disabled in markup, SC 1.4.11 exemption applies).

**Part 2 — Live-screenshot follow-up (site.css v8→v10).** Graeme reviewed the deployed fix and flagged two more things: the scroll-arrow was visually disconnected from the Pause button (position:absolute pinned it to the hero section's bottom, far from Pause's in-flow position on tall viewports) — fixed by making it a normal flex child directly after Pause (v9). Second, the coach-bubble context line (`text-muted` on `bg-card`, 4.67:1 — AA-passing but "close for comfort") was reviewed via a 3-option mockup (grey / teal / gold) — gold was deliberately not chosen since it's the paid-tier marker everywhere else in the system and this is a free/universal element; teal (`--color-primary-light`, 7.00:1) chosen (v10).

**Part 3 — Free vs Premium colour system + `/upgrade` page build (site.css v10→v11).** Graeme asked whether the site could flag free vs premium content with teal/gold consistently. Turned out this system was already a **confirmed, locked design decision** — `alongside_upgrade_page_architecture_09jul2026_v1` specifies gold (`#B8970A`) as the Personal-tier visual signal, with a full locked page copy that had simply never been built (W5 in the old 10 Jul website-stream tracking — never had its own BUILD-x ID here, hence the drop-off). Built `upgrade/index.html` v1 from that locked spec verbatim, plus new `site.css` classes (`.upgrade-hero`, `.upgrade-changes`, `.pricing-cards`, `.btn--gold`). Pricing pulled from the current `alongside_pricing_model_20jun2026_v2` (£7.99/mo, £49.99/yr launch year) — matches the architecture doc's own locked figures, no conflict. **Explicitly not built:** Stripe/Supabase checkout — S-F3 (Supabase auth) and S-F4 (Stripe setup) don't exist yet, so the CTA button is honestly disabled with a note, same pattern as the Community page's mailing-list placeholder. `js/site.js` v4→v5: added Upgrade to `NAV_LINKS` now the page is real.

**The broader ask — flagging every feature/reference site-wide as free vs premium, plus persona-tabbed pages per product — is only partly addressed.** Only Move has a confirmed Free vs Personal split (`alongside_move_overview_and_personas_25jul2026_v2`); Learn's is also documented, but Life, Rest, Love, Lead, Compass, Savvy are all "Proposed — no spec exists yet." A family-wide version of this needs those specs written first. Logged as an open item below, not actioned further this session.

**Real bug found and fixed, unrelated to the above:** `index.html`, `community/index.html`, `impact/index.html`, `products/index.html` were all still requesting `site.css?v=7` after the stylesheet had moved to v10 across this session's earlier edits — meaning browsers/CDN could have kept serving the pre-fix stylesheet indefinitely under the stale query string. All four bumped to `?v=11` (and `site.js?v=5`), version headers bumped to match.

**New compliance finding, not fixed this session (out of scope, flagged only):** `js/site.js`'s shared footer renders "© [year] Build New Habits Ltd. Alongside is a trading name of Build New Habits Ltd." on every page. Build New Habits is an unregistered sole trader (BIZ-1 still open) — per standing rule this must never be described as "Ltd." Live on every page right now.

**Part 4 — Follow-up round (site.css v11→v14, `js/site.js` v5→v6).** Footer "Ltd" fixed (removed site-wide). Gold token lightened `#B8970A` → `#D4AF37` — Graeme flagged the original as "dirty and dark"; every usage (text, `.btn--gold`, comparison-table header) improved in contrast as a side effect (text-inverse on the button: 6.35:1 → 8.49:1). Upgrade page: "Alongside: Move" teal label added (page is Move-specific, will need its own variant once other products get pricing), subscription line split onto its own line, wellbeing note reworded to Graeme's phrasing ("we don't want to restrict how you Move with mental health and wellbeing"). Products page corrected — the generic below-all-cards links section from Part 3 was wrong (that content is Move-specific, not family-wide); replaced with a single gold-button link under the Move card only, pointing to `/who-its-for/`. "Get early access" now opens in a new tab.

**Part 5 — Accessibility audit + comparison table/persona rework (site.css v14→v16).** Graeme asked directly: is the heading structure clean, is the table accessible, is the grey-on-black a clear pass. Real answers: heading structure is clean across all 6 pages (one h1 each, no skipped levels). The comparison table's row labels were plain `<td>` with zero programmatic link to their data cells — converted to `<th scope="row">`, a real accessibility fix. The narrowest-margin contrast pass on the whole site was found: persona-card body text at 5.12:1 on `bg-card` (everywhere else is 7:1+) — moved to full text colour, now 8.40:1. Persona cards restructured with Free/Personal tier tags per line (previously implied everything was free) plus a short "How it felt, over time" narrative per persona. Community page's "Three ways" — flagged by Graeme several messages earlier, not actioned until now — rebuilt from three bare words into real content, with a working copy-link button (`js/community.js`, new) under "Share the impact." Charter reframed as forward-looking, honest that only a mailing list exists today.

**Part 6 — Table polish (site.css v16→v17).** Column headers bigger with a divider, row headers given a distinct colour from data cells, subtle column dividers added alongside row dividers. New "Areas explained" section added before the table (Sessions/Exercise library/Programmes/Progress/Coach behaviour defined in plain language).

**Part 7 — Ground-truth correction against live `alongside-app` code, not specs (`who-its-for/index.html` v5).** Graeme asked pointed factual questions about the table content, which led to actually checking the live files rather than trusting the docs. Findings, checked directly:
- **"Full Body" confirmed correct** — `SESSION_TYPES` in `session-builder.js` (id: `"full"`) is exactly what free tier unlocks in `session-builder-ui.js`. Graeme's naming decision matches reality precisely.
- **Difficulty scale is 1–3 in live data**, not 1–5 as the exercise-database spec claims — checked 90 exercises directly in `js/data/exercises/strength.js`, none tagged above 3. **Graeme has decided: migrate to 1–5.** New build item below, not done this session.
- **No hardcoded programme exists any more** — `gym-programme.js` v3 (31 Jul, the fix from earlier this session) reads exclusively from the session builder. The old Sessions A–C (built around Graeme's own physio programme) are gone from the file.
- **Bigger finding: no difficulty-based gating exists at all.** Checked `selectFromCategories()` in `session-builder.js` directly — it filters by equipment and condition, never by `difficultyLevel` or tier. Free and Personal currently draw from the identical exercise pool. The "Exercise library" and "Programmes" table rows were describing spec'd-but-unbuilt differentiation as if live — corrected to state current reality, with the roadmap items (level-based progression, multi-week generative/periodised programmes — confirmed not built, `alongside_generative_programme_design_note.md` says "Future Build, Target: Phase 4B or Phase 5") marked "Coming soon" instead. Same correction applied to the Jess/Priya/Mark persona-card claims, which had made the same premature assumption.
- **Progress row confirmed accurate** — `tier === 'personal'` checks genuinely gate the 30/90-day tabs in `progress.js`. Free row now says "rolling 7-day" explicitly (confirmed via `_cutoffDate()` — always today-minus-7, never a weekly reset).
- **Not verified either way:** the Coach behaviour row's memory/pattern-noticing claim. Flagged, not guessed at — left as-is pending a separate check.

---



Captured in full in `alongside_alex_meeting_outcomes_29jul2026_v1.md`. Summary folded in here; that document remains the fuller record if detail is needed later.

**Legal — solicitor question refined.** Alex is reaching out to his solicitor contact with a specific framing: *"what's the minimum to be legally responsible?"* — with a working assumption that beta-stage requirements may be lighter than public-launch requirements. When the answer comes back, ask explicitly for the split rather than one combined answer. Relevant to BIZ-5, BIZ-6, BIZ-9 below.

**BIZ-9 (IP/trademark) — deprioritised.** Alex ran a logo unregistered for 20 years with no issue. Working position: don't worry about IP, especially the logo, not yet — if someone registers something similar first, the fallback is simply to change the logo. The product's actual IP (methodology, content, mechanics) is the genuinely distinct part, not the mark. Still worth a mention at the BIZ-5/6 solicitor consultation since it's a small add to an existing conversation, but no longer worth chasing separately.

**U18/safeguarding — genuinely open, not resolved.** Alex suggested "potentially we don't need to worry about U18." Graeme explained the safeguarding responsibility around collecting keywords from the mood meter; Alex understood the concern and will think on it and ask his solicitor. **This is not a decision — do not treat it as one.** Directly touches BUILD-9 (18+ age-gate), BIZ-6 (safeguarding sign-off), and the Crisis & Safeguarding Policy's own open item on parental notification (Section 9.4, unconfirmed as of v7). No schedule change until Alex/solicitor respond. **[v141, 10 Aug] Partly superseded** — the question has now been put directly to a solicitor (Natalie), for both Move and Learn. Alex's "potentially we don't need to worry about U18" remains an untested instinct and should still not be read as a decision. Awaiting Natalie's written response, not Alex's.

**Outreach — new categories suggested, plus a real gap surfaced.** Alex suggested workplaces with wellbeing reps, and women's health groups/communities, as additional outreach targets — he's thinking on this further too. He also raised the sharpest open question in the whole outreach effort: **"why would they do anything?"** — the current outreach messaging doesn't yet spell out the concrete benefit to the organisation itself. Two actions before any new-category outreach goes out: (1) Graeme's decision on whether these join the existing Tier list or run as a separate track, (2) a messaging pass answering "what's in it for them" per org type. This was already logged as "org outreach categories — undecided, blocks OUT-2–OUT-8" — still blocking, now with two named candidates and one clear open question instead of a vague undecided state.

**New task — LinkedIn presence.** Graeme wants a BNH business page and a personal profile, prompted by Alex's suggestion that LinkedIn plus direct email is a good channel for reaching both organisations and named individuals. Not yet scoped — Graeme has said he'll need help designing this properly. New item, no urgency attached yet, ready whenever Graeme wants to start.

**Deadlines — externally confirmed.** Alex agrees on two hard deadlines: **partner group/testing community + beta start, mid-September 2026**, and **public launch, January 2027** — the latter specifically because that's when people are most active in the "new year, new fitness" mindset, a named commercial rationale from Alex rather than just an internal target. This validates the dates already on this schedule; it doesn't resolve the underlying capacity risk (solo build/business load) flagged separately in Graeme's own meeting-prep review — both remain true at once.

---

## ⚖️ Solicitor Consultation — Held 10 Aug 2026

**Who:** Natalie, at the firm Alex introduced. Ben Cross — the named contact in Alex's 24 Jul introduction email — could not attend; Natalie took the meeting in his place. Thirty minutes, introductory.

**How it was run:** deliberately as a qualification call, not an advice call — establishing what the firm can cover, what a proportionate engagement looks like, and what it costs against the £2,000 budget for this phase. Prep brief written the same morning; the six-document pack was *not* walked through in the meeting, by design.

### What was covered

| Area | Covered? | Note |
|---|---|---|
| IP and trade marks (BIZ-9) | ✅ | Covered despite being deprioritised on 29 Jul — small add to an existing conversation, as planned. |
| Safeguarding and under-18s | ✅ | Worked through for **Alongside: Learn** (the three-user family model). |
| Safeguarding — **Move** under-18 position | ✅ | Put directly in the final ten minutes: *"what advice or planning do I need to protect against under-18s using Move when I'm collecting sensitive personal health data."* Asked as a protection question, not a reassurance question. **Preserve this framing in the follow-up.** |
| Data protection, sensitive/special-category health data, ICO process (BIZ-3, BIZ-5) | ✅ | Covered. |
| Collaborator equity | 🟡 | Touched on briefly only. |

### What Natalie holds

- The three dates: beta mid-September 2026, soft launch first week of December 2026, public launch January 2027.
- Graeme's stated inexperience — said openly, so the advice is pitched accordingly.
- The **"minimum needed to be responsible"** framing (Alex's, 29 Jul).

### What she will do

Consult colleagues where needed, then respond officially with **guidance on what to prioritise, and costs**.

### ⚠️ Recording discipline

**No substantive advice was given in this meeting.** Natalie listened and took notes rather than advising on the spot, and Graeme has confirmed there is nothing further worth recording. Nothing in this section should be treated as legal advice received, or used to close any BIZ item. **Do not let a later session infer that a question was answered simply because it was asked.**

### Open follow-up actions

| # | Action | Why it matters |
|---|---|---|
| 1 | **Confirm Natalie has the six-document pack** — Product & Data Overview, covering letter, Privacy Policy draft v3, Terms of Service draft v2, Crisis & Safeguarding Policy v7, Safeguarding one-pager v2. The pack went to Alex on 24 Jul; whether it reached Natalie is unconfirmed. | She cannot write up against documents she hasn't seen. |
| 2 | **Restate the beta-minimum vs launch-minimum split in writing**, as an explicit request for two lists rather than one combined answer. | She holds the framing verbally; the written ask is what makes it a deliverable. |
| 3 | **Ask for a safeguarding reviewer referral** — ideally someone with a named youth-safeguarding credential (PAPYRUS-affiliated). Not raised in the meeting. | BIZ-6's three reviewer roles remain entirely unfilled — the most urgent non-build item on this schedule. |
| 4 | **Confirm whether the Severe-pain Rest/Adapt liability question was raised.** Not mentioned in Graeme's account of the meeting; assume not covered. | Logged 04 Aug as a real legal question, not an assumption. Cheap to add to the follow-up email. |
| 5 | Await her response on **priorities and costs** before instructing anything. | £2,000 budget for the phase; scope needs to fit it. |

### What this does and doesn't unblock

- 🟡 **BIZ-5** (Privacy Policy + ToS review) — moves from "no solicitor identified" to "solicitor engaged, awaiting scope and quote." Not closed.
- 🟠 **BIZ-6** (Safeguarding sign-off) — unchanged. A general solicitor review is not the same as the named youth-safeguarding review; three reviewer roles still unfilled.
- 🟠 **BIZ-3** (ICO registration) — unchanged, still gated on BIZ-1 (HMRC).
- 🟡 **BIZ-9** (IP/trade marks) — raised as planned. No action pending her response.
- 🟡 **BUILD-9** (18+ age-gate) — **still blocked**, but now on Natalie rather than Alex. Hold a little slack in the September plan: an answer requiring age assurance beyond self-declaration would add real build work close to the beta window.
- 🟡 **Collaborator equity (Liam, Dan)** — touched on only. The structural point stands and is worth putting in the follow-up: Build New Habits is an **unincorporated sole trader**, so equity cannot be issued in any conventional sense without incorporating first. The cheaper, more urgent piece is a written collaborator agreement with an IP assignment clause, so contributions are clearly owned by the business regardless of what happens on equity later.

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
| `coach-proposal.js`'s `renderBypassDoor(tier)` | 03 Aug | Receives a `tier` parameter that's never actually used in the function body — dead parameter, not a functional gate. Found while checking tier-gating status. | Not causing any active harm — just unused. Original intent unclear (may have been meant to gate one of the two bypass options for free tier and never finished); needs a product decision, not a guess, before either removing the parameter or actually wiring gating logic to it. |

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

## One-Page Dashboard — 11 Aug 2026

| Stream | Current position | Immediate next action | Blocker? |
|--------|-----------------|----------------------|----------|
| Product — Persona Tracing, Wave 1 (2.12 + 2.15) | 🟢 **Brief ready, 11 Aug** (`alongside_brief_persona-tracing-wave1_11aug2026_v1.md`). Deep, longitudinal trace — three weeks of simulated realistic use, sourced from the existing 17-persona QA matrix, not invented. Deliberately written for a fresh chat with no history of this project, to reduce bias. Three required outputs: file/line-referenced technical report, jargon-free plain summary, grounded persona narrative. Persona B's tier switch traced as one continuous free-to-Personal journey, not two separate tests. | Ready to run in a fresh chat whenever Graeme wants. | None. |
| Product — YouTube search links, all 461 exercises | 🟢 **Fixed, 10 Aug.** Restored per Graeme's direct request ("we get the most up to date versions and avoid any issue with discontinued or old videos"). Previously zero coverage across the entire main database. Content-style traced per file first, not a blind bulk pass — `running.js` (mixed technique drills/paced sessions) got 35 hand-crafted terms. Three quality passes afterward caught real issues each time (roman numerals, duplicated words, one genuine duplicate exercise entry). Confirmed via import test: 461/461, zero remaining issues. `js/data/exercises/*.js` (11 files, 3 bumped, 8 given first-ever version headers). | None — closed. | None. |
| Product — `gym-programme.js` UX rebuild (matches `prescribed-session.js`) | 🟡 **Code complete, 11 Aug, on-device pending.** Graeme's direct screenshot comparison confirmed 10 Aug's fix wasn't enough — content rendered correctly but the screen structure was still a flat scrollable list. Rebuilt to walk one exercise at a time (progress header, timer/reps display, structured guidance, Next/Skip), reusing `prescribed-session.js`/`workout.js`'s exact markup and shared CSS classes. Completion tracking moved from DOM-scanning to a proper Set. Week 6/12 moments, programme progression, A/B alternation, exit-guard all unchanged. `gym-programme.js` v4→v5, `sw.js` v225. | **On-device test — highest priority right now.** This is a structural rebuild of the core session flow, the biggest single UI change since the Home Nav redesign. | Needs a phone. |
| Product — Exercise-detail UI consistency (what/how/why/support) | 🟢 **Fixed in 5 views, 10 Aug** (see row above for `gym-programme.js`'s follow-up rebuild, 11 Aug). The connected finding: all 461 exercises already had `instructions`/`coaching`/`why` at 100% coverage before tonight — "Name, what to do, mark as done" was silent field-name bugs, not missing content. `gym-programme.js` had three mismatches in one block (`setup`/`whyThis`/`videoUrl` → real fields `instructions`/`why`/`youtube`). `core-session.js` and `yoga-session.js` each had a singular/plural `.cue` bug plus missing sections despite full data. `prescribed-session.js` — most safety-relevant, zero guidance ever shown — fixed by reusing its own existing safety-check `EXERCISES` lookup; verified both database-linked and manually-added paths. `workout.js` fixed too (was regenerating a generic query instead of using the tailored term). `walk`/`run`/`swim`/`cycle-session.js` confirmed correctly out of scope — different pattern entirely (continuous activity + coach prompts), traced directly not assumed. | **Not yet on-device confirmed** — this touches 5 core session views, worth a real pass. | Booked, high priority given the file count touched. |
| Product — `yoga-session.js`'s private pose pool needs `why` content | 🔵 **New, 10 Aug, deliberately deferred.** 30 poses have good description/cues (now also youtube) but no rationale field exists in this pool's data structure at all. Genuine content authoring — 30 individually accurate "why this pose helps" writeups — not a mechanical fix. Left undone rather than rushed at the end of a long session. | Needs a dedicated content pass. | Not booked, no urgency. |
| Cleanup — `yoga-session.js`'s private exercise pool (third parallel database) | 🔵 **New, 10 Aug.** Same structural concern as the `exercises.js`/`exercises/index.js` situation found 10 Aug — a third, separate, hand-maintained exercise data source (30 poses), disconnected from the main 461-exercise database. Not fixed or merged tonight — real architectural decision, not a solo call. | Worth folding into the same future consolidation conversation as the other exercise-database duplication. | Not booked, no urgency — no current bug from this, just structural risk. |
| Product — `noticing.js` "Your reflections" field-name bugs | 🟢 **Fixed, 10 Aug, overnight autonomous session.** Two real bugs since the 14 Jul journal privacy rewrite: `entry.createdAt`/`category`/`body` all read undefined fields (real fields are `date`/`tags`/`text`), and `entry.type === "weekly-noticing"` was always false (never written anywhere). Consequence: reflections showed blank date/text, and `getRecentEntries()`'s sort never actually worked (`new Date(undefined)` vs `new Date(undefined)`) — entries were shown in original array order, not by recency. Both fixed; dead "This week" badge removed rather than a working version guessed at. `noticing.js` v4→v5. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Product — `journalEntryType` pre-select | 🔵 **Re-scoped, 10 Aug** — found bigger than previously noted. Not a small missing field-read: `journal-entry.js`'s v3 privacy rewrite dropped the entire pre-selected-screen mechanism, not just this one field. There's currently no branching logic in the file at all — always the single free-text screen. Fixing this properly means designing what a type-specific screen should actually look like. | Needs Graeme's design input — genuinely not a contained code fix. | Not booked. |
| Product — Bodyweight-only lower-body main exercises | 🟢 **Fixed, 10 Aug, overnight session.** Four new exercises added (hip-hinge/single-leg/squat-pattern/leg-isolation), matching existing format and safety conventions exactly. Confirmed via test: no-equipment Lower Body went from 0 main exercises to 4. Full 7-type regression re-run clean. `session-builder.js` v2→v3. | **Not yet on-device confirmed.** | Booked — folds into the general Phase 1 on-device pass. |
| Cleanup — `exercises/index.js` "orphaned duplicate" | 🟡 **Correction, 10 Aug — this note was stale, not acted on.** Direct re-check found it's now genuinely load-bearing: `conditionProgrammes.js`, `core-session.js`, and `prescribed-session.js` all import from it — all three built after the original "orphaned" finding. Diffed against `exercises.js` (workoutGenerator.js's import): currently byte-identical in logic, only import-path depth differs. Real structural risk (two copies needing manual sync forever, or silent drift between `workoutGenerator.js`-generated sessions and everything else) — but not something to merge unilaterally overnight. | Needs a scoped consolidation session — point every import at one canonical file. Real risk if rushed (touches 4+ live features). | Not booked, no urgency — no current behavioural drift, just structural risk. |
| Safety — Severe-pain Rest/Adapt flow | 🟢 **Traced, 10 Aug, no bugs found.** Read closely (`coach-proposal.js`'s severe-choice handling, `store.recordSeverePainChoice()`) — condition-set sorting and matching both correct, `conditionReflections`'s namespace separation from Journal confirmed correctly implemented. One minor, non-urgent note: `severePainChoices` has no cap (unlike `activityLog`'s 200-entry limit). | None needed — this was a confidence-building trace, not a fix. | None. |
| Product — Gym Session Builder — Phase 1 | 🟡 **Code complete, 05 Aug, on-device pending.** `session-builder.js` v3 (now includes tonight's bodyweight content too), `session-builder-ui.js` v4, `library.js` v3, `settings.js` v14, `sw.js` v223. All pushed, confirmed live via fresh fetch. Every blueprint decision built: routing fix (Core/Upper/Lower/Glute/Full now genuinely distinct, "Strength" retired for lacking a real mapping), location step, allocation presets with a structural warmup floor, three build routes mirroring `conditionProgrammes.js`, real cardio-warmup content (bike/treadmill/cross-trainer/rowing machine — previously didn't exist anywhere). Tested extensively via Node smoke tests against real store data (all 7 types, safety floor, equipment gating, the full preselect contract) — caught and fixed one real bug before shipping (an edit had silently deleted Glute Focus's `mainCategories`). Also fixed in passing: `session-builder.js`/`session-builder-ui.js` were never in the precache list at all. | **On-device test, same priority tier as the Wake Lock fix** — this is exactly the category of thing (real flow, equipment-dependent, multi-step) only ever fully proven through actual use. Test all 5 gym cards + both build modes + a real location switch. | Needs a phone. |
| Product — Lower-body main exercises: no bodyweight-only options | 🔵 **New, 05 Aug, found while testing Phase 1.** Confirmed via direct count: every exercise tagged to `squat-pattern`/`hip-hinge`/`single-leg`/`leg-isolation` requires equipment — a user with nothing selected who picks Lower Body currently gets 0 main exercises. Pre-existing content gap, not introduced by Phase 1. | Needs new bodyweight lower-body exercise content — a content task, not a code fix. | Not booked, no urgency — narrow edge case (equipment-free lower body specifically). |
| Product — Gym Session Builder — Phase 2 (smart same-day warmup-skip, deferred) | 🔵 **New, 05 Aug, deliberately deferred.** Graeme's fuller vision includes skipping a warmup for a body area already worked earlier the same day — genuinely can't build yet. Needs two things that don't exist: muscle-group/body-area tagging on exercise data, and per-exercise (not just per-session) completion logging. Real content/data project, not a code tweak. | Scope properly once Phase 1 has shipped and real usage patterns exist to inform it. | Not booked, no urgency — explicitly not blocking Phase 1. |
| Comms — Email systems, welcome pack, taster code comms | 🟢 **Brief ready, 04 Aug** (`alongside_brief_comms-email-taster-codes_04aug2026_v1.md`). Covers COMMS-1 through COMMS-5 plus new social media scope. Flags the Journal Privacy Rule constraint on COMMS-4 explicitly, and reuses already-drafted reversion-prompt copy rather than having it rewritten. | Run as a dedicated content/comms session — needs Graeme's own voice for the founder message and video, not something to fully delegate. | Social media scope (platforms, timing vs. outreach) needs a decision before drafting starts — flagged in the brief itself. |
| Product — Home Navigation & Conditions redesign (spec) | 🟢 **Spec v2 complete, 04 Aug.** Superseded as an open item by the blueprint row below — see that row for current status. | — | — |
| Outreach — BANDS CIC meeting (Alfie + members) | 🟢 **New, 03 Aug.** First real response of 4 Tier 1 org emails sent. Real potential: follow-on meetings across Frome, Bath, Weston, Trowbridge if this goes well. | **Get a confirmed date from Graeme** — currently untracked without one. Prep a meeting brief once date's known, same pattern as the Alex meeting brief. | Meeting date unknown. |
| Outreach — Canopy PT connection (neurodivergent clients) | 🟡 **New, 03 Aug.** Warm connection via the separate Canopy sub-project, not the direct outreach list. Interested in "supporting" — form unclear. | Conversation needed to understand what's actually being offered before this can be scoped. | Nature of support unclarified. |
| Product — Wake Lock / resumable session gap | 🟡 **Code complete, 03 Aug, on-device pending.** `running-session.js` v4, new `session-resume.js`, `sw.js` v189, all pushed and confirmed live via fresh fetch. `node --check` clean. Blueprint's full scope implemented: timestamp-anchored elapsed, checkpoint/resume, coach-voiced resume card, Wake Lock lifecycle, exact-equality prompt-match fix. | **On-device test**: lock screen mid-run, force-refresh mid-run. This bug was only ever found through real use — treat this as the priority on-device test over BUILD-3's, since BUILD-3 is expected to be a formality and this genuinely isn't. | Needs a phone. |
| Product — BUILD-1 (Nav-gap fix) | 🟡 Core mechanism confirmed. Sub-question open. | Quick confirmation. | None. |
| Product — BUILD-2 (Proposal-loop fix) | 🟢 Closed 23 Jul. | — | None. |
| Product — BUILD-3 (Session-view audit) | 🟡 Code confirmed clean twice. Not yet on-device tested. | On-device pass, expected formality. | Needs phone only. |
| Product — BUILD-4 (Schema Reconciliation) | 🟢 **Closed, 30 Jul.** `schema.md` v1.9 live in repo. Two corrections to the 28 Jul note itself found (`todayIntensity` live not dead, `exerciseFeedback` dormant not live). | None — see Appendix A follow-up as a new, separate item. | None. |
| Product — BUILD-5 (available-time bug) | 🟢 Closed, confirmed on-device 24 Jul. Three fixes. | None. | None. |
| Product — BUILD-6 | Confirmed non-crashing. Decision still open, low priority. | Graeme's call. | Not booked. |
| Product — BUILD-9 (18+ age-gate) | Not yet scoped. **U18 safeguarding position genuinely open.** 🟡 **Updated 10 Aug** — the Move-specific question ("what do I need to do to protect against under-18s reaching Move while collecting sensitive health data") was put directly to Natalie at the solicitor consultation. Awaiting her written response. Alex's earlier "potentially we don't need to worry about U18" is still an untested instinct, not a decision. | Hold scoping until Natalie responds. **Keep slack in the September plan** — an answer requiring age assurance beyond self-declared DOB would add real build work close to the beta window. | Waiting on Natalie (was: Alex). |
| Product — Thread scroll-bug audit | 🟢 Closed, 28 Jul. 2 of 3 files already fixed, third checked and cleared. | None. | None. |
| Product — B3-2-Test follow-ups | 2 items remain (chip overflow, reflect.js cache-clear confirmation). | Fold into a future session. | Not booked, low priority. |
| Product — Core Session `currentActivityEntry` data-integrity question | 🟢 **Fully closed, 30 Jul.** Complete on-device test pass across all 7 files — every fix confirmed working, CSS visually confirmed on all 7. Two real bugs found and fixed during testing itself (yoga stuck-screen, dedupe window too wide). `gym-programme.js` found separately broken, own item logged — now code-complete 31 Jul, see BUILD-GP Outcome section, on-device pending. | None — fully closed. | None. |
| Product — BUILD-4 Appendix A follow-up | 🟢 **Closed** (previously mislabeled "blueprint ready" — corrected 04 Aug on direct re-check). `Schema.md` confirmed at v1.16, well past the v1.10 this follow-up would have produced — this genuinely ran. | None. | None. |
| Product/Infra — Supabase schema design | 🟢 **Closed** (previously mislabeled "blueprint ready" — corrected 04 Aug on direct re-check). `alongside_supabase_schema_design_03aug2026_v1.md` confirmed to exist in the repo. | None. | None. |
| Product — Tier gating (isPremium/isAthlete/lockedFeature) | 🟢 **Infrastructure built, 03 Aug.** New `js/auth.js` + `css/components/tier-gating.css`, wired into `app.js` v8. Uses live `tier` field (not the May spec's assumed `userTier`). `progress.js`'s existing working gating deliberately left untouched. Several May-spec audit items confirmed no longer applicable (killed coach-style-variants feature, several never-built features) — see this version's substantive changes for full detail. `node --check` clean, confirmed live via fresh fetch. | **`lockedFeature()` not yet applied to any live feature** — nothing currently ungated-and-real was found to wrap it around. Apply it the next time a genuine premium-only feature is built. | None. |
| Product — `upgrade.js` crash (`store.getUserTier()`) | 🟢 **Fixed, 03 Aug.** `render()` was calling `store.getUserTier()`, which never existed in `store.js`. Fixed to `store.get("tier") \|\| "free"`, matching every other live reader. `upgrade.js` v1→v2, `sw.js` v190. Confirmed live via fresh fetch, `node --check` clean, no other stray calls found anywhere in the app. | None. | None. |
| Website — WCAG 2.2 AA contrast audit | 🟢 **Closed, 03 Aug.** Scroll-arrow + 5 more functional-border elements + badge backgrounds, all fixed and ratio-confirmed. `site.css` v7→v8. | None. | None. |
| Website — `/upgrade` page (W5) | 🟢 **Built and polished, 03 Aug.** Content complete, colour pass done, checked against live code. `upgrade/index.html` v5, `site.css` v17, `js/site.js` v6. | Checkout wiring (Stripe/Supabase) — separate infra session, needs S-F3/S-F4 first. | Blocked on Supabase auth + Stripe setup, not on content. |
| Website — `/who-its-for/` page (persona + comparison) | 🟢 **Built and ground-truth corrected, 03 Aug.** Personas, Free vs Personal comparison, and Areas-explained section all live, checked directly against `alongside-app` code rather than trusted from specs. | None — see the three new build items below for what the table now correctly flags as "Coming soon." | None. |
| Website — free vs premium colour system (broader ask) | 🟡 **Partially actioned, 03 Aug.** `/upgrade` + `/who-its-for/` cover Move. Family-wide version needs Learn/Life/etc. free-vs-premium specs written first — those don't exist yet for most products. | Graeme's call on whether to spec the other products or leave Move-only for now. | Not booked. |
| Website — cache-busting bug (`site.css?v=` stale on 4 pages) | 🟢 **Found and fixed, 03 Aug.** All 4 pages were still requesting `?v=7` after the stylesheet moved to v10 this session. | None — closed. | None. |
| Business — footer said "Build New Habits Ltd" | 🟢 **Found and fixed, 03 Aug.** `js/site.js` v6 — "Ltd" removed site-wide. | None — closed. | None. |
| Product — Exercise difficulty scale: 1–3 live vs 1–5 spec'd | 🔴 **New, 03 Aug, found while ground-truthing the comparison table.** Checked `js/data/exercises/strength.js` directly — 90 exercises, all tagged `difficultyLevel` 1–3, none above 3. The exercise-database spec's claimed 1–5 scale doesn't match live data. **Graeme's decision: migrate to 1–5**, and let users start at any level and progress from there — not just unlock upward from 1. | Needs a blueprint: re-tag the exercise database (~500 exercises across 12 files), design the level-selection + progression UX, decide the 1–3→1–5 mapping. | Not booked. Real scope, not a quick fix. |
| Product — No difficulty-based exercise gating exists at all | 🔴 **New, 03 Aug, found in the same check.** `selectFromCategories()` in `session-builder.js` filters by equipment and condition only — never by `difficultyLevel` or tier. Free and Personal currently draw from the identical exercise pool; the spec's "Free tier limited to difficultyLevel 1" was never built. Same root cause as the difficulty-scale item above — likely one combined build session. | Fold into the difficulty-scale migration blueprint above. | Not booked. |
| Product — Generative/periodised multi-week programme engine | ⚪ **Confirmed not built, 03 Aug** — `alongside_generative_programme_design_note.md` explicitly scopes this to "Future Build, Target: Phase 4B or Phase 5." Website now correctly marks this "Coming soon" rather than presenting it as a live Personal-tier benefit. | No change — already correctly scoped as future work elsewhere. | Not booked, by design. |
| Product — Hardcoded gym programme (Sessions A–C) | ⚪ **Confirmed retired, 03 Aug.** `gym-programme.js` v3 (31 Jul) reads exclusively from the session builder now — no hardcoded PROGRAMME object remains in the file. Was previously built around Graeme's own physio routine; that's gone from the live file already. Informational only — no action needed. | None. | None. |
| Product — Coach-behaviour "remembers across time" claim (Personal tier) | 🟡 **Unverified, 03 Aug.** The website states Personal-tier coaches reference patterns over time (per the locked Phase F design decision, 09 Jul) — not checked against live code this session. Flagged, not guessed at either way. | Quick code check next session — is this actually implemented anywhere, or still just the confirmed design decision? | Not booked, low urgency — website copy isn't wrong, just unconfirmed. |
| **Business/legal — website now states unbuilt features as current claims, by deliberate decision** | 🔴 **New, 03 Aug, explicit instruction from Graeme, not a mistake.** `/who-its-for/`'s comparison table and persona cards state exercise-level progression and periodised multi-week programmes as things Personal tier does — neither is built (see the two rows above from v94). Graeme's stated reasoning: the website becomes the accountability spec for what the app should do; easier to change the site than to have quietly under-scoped the app. **Genuinely fine today** — `/upgrade`'s checkout is still disabled, no money changes hands. **Becomes a real consumer-protection issue the moment Stripe/Supabase checkout goes live** (S-F3/S-F4) with this wording still in place — a paying Personal-tier user told they get feature X that doesn't exist is a legitimate complaint, not a style question. | Add an explicit checkpoint to the BUILD-9/beta-readiness checklist: re-verify every current-tense feature claim on `/who-its-for/` and `/upgrade/` against live code before checkout goes live, either build the gap or soften the claim. | Not booked as a task yet — needs to land on the pre-beta checklist specifically, not get lost as a general "someday" item. |
| Website — Community page charter removed | ⚪ **Decision, 03 Aug.** "What belongs here"/"What doesn't" block removed from `community/index.html` — Graeme flagged it as confusing twice, not doing anything useful yet (there's no live community space for it to describe). Content preserved in the file's own changelog, not lost, in case it's wanted again once a real space exists. | None — informational. | None. |
| Product — `coach-proposal.js` doors 2/3 ("Your programme" / "Something different") permanently disabled | 🟢 **Resolved by design decision, 04 Aug — see Home Nav blueprint.** Superseded, not fixed in place. The six-door Home redesign (Phase C of `alongside_blueprint_home-navigation-conditions_04aug2026_v1.md`) makes the 3-doors-plus-bypass screen unnecessary as a screen: Home's Cardio/Core/Strength, Mobility & Conditioning, and Wellbeing doors directly replace the old bypass row; "Unsure? Coach decides" replaces Door 1. `coach-proposal.js` is kept but reduced — doors UI removed, `buildProposal()`/re-entry/missed-offer/condition-note logic retained as the destination for "Unsure? Coach decides" only. | Ships as part of Home Nav Phase C, not a standalone fix. | Booked — sequenced into the Home Nav blueprint, Phase C. |
| Website — Home/Products/Community/Impact | 🟢 Confirmed clean. | None unless BUILD-9 triggers a copy pass. | None. |
| **Website — Philosophy page** | 🟢 **Built and pushed, 10 Aug.** From `alongside_philosophy_page_architecture_10jul2026_v3` — all seven beats locked since 10 Jul and never built, the same drop-off `/upgrade/` had. Copy verbatim, no additions to the locked text. Pure prose, no bullets, no animation, no conversion CTA, gold deliberately unused (Personal-tier marker only; nothing here is tier-gated). Accessibility: one h1, seven visually-hidden h2s so screen-reader users can navigate beat to beat without adding the visual headings the design explicitly forbids; all `aria-labelledby` verified to resolve; every colour used checked against `bg-deep` (prose 14.48:1, teal 12.07:1). `philosophy/index.html` v1, `css/site.css` v19, `js/site.js` v7, `sitemap.xml` v4, all six existing pages bumped to `?v=19`/`?v=7` with version headers. Push verified by fresh clone, not `raw.githubusercontent.com`. | **Not yet reviewed on a real browser** — static checks only. Real test: read it top to bottom on a phone and confirm the white space between beats actually creates the pause it is designed to, rather than just reading as a gap. | Booked — next website pass. |
| Website — Philosophy h1 wording | 🟡 **Open question, 10 Aug.** The locked architecture specifies no page title; a page needs exactly one h1 for WCAG heading structure. "Philosophy" used as a label rather than inventing evocative copy the document doesn't contain. | Graeme's call — keep the label or write a real h1. Trivial change either way. | Not booked. |
| Website — Beat 4's unintroduced "I" | 🟡 **Open question, 10 Aug.** Beat 4 is first person throughout ("There are three things I believe"), exactly as locked — the design note says "Graeme's voice throughout". The rest of the page is "we". No attribution line was added because none is in the locked document and inventing one would be new copy. As it stands the reader meets an "I" with no idea who is speaking. | Graeme's call — add an attribution, or leave it as a deliberate intimacy. | Not booked. |
| Website — `sitemap.xml` under-listing the live site | 🟢 **Found and fixed, 10 Aug.** `/upgrade/` and `/who-its-for/` both shipped 03 Aug and were never added — the sitemap had been two pages short for a week, despite the file's own instruction to add each page as it ships. Both added with real ship dates, plus Philosophy. `sitemap.xml` v4. | None — closed. Worth treating as a standing step: new page means nav, sitemap, and cache-bust, not just the page file. | None. |
| Website — `/who-its-for/` nav placement | ⚪ **Decision, 10 Aug, Graeme's.** Stays out of `NAV_LINKS`, reachable only via the gold button under the Move card on Products. Reasoning: it is Move-specific and the website covers the whole product family. Recorded so it isn't re-raised as a gap. | None — informational. | None. |
| Website — About page | 🟠 **Specced, unbuilt.** `alongside_about_page_architecture_09jul2026_v1` is complete and locked. Not blocked by anything external — but it is the page about Graeme, and needs his own raw material rather than being assembled from the architecture alone. | Graeme to supply/confirm the personal content, then a build session. | Not booked. |
| Website — Safety & Contact page | 🟠 **Specced, unbuilt, and correctly withheld.** `alongside_safety_page_architecture_09jul2026_v1` is complete and locked. **Must not go live until BIZ-6's three safeguarding reviewer roles are filled** — this is the page that carries crisis routing, and publishing unreviewed crisis information is a real-world risk, not a process formality. Crisis contact details would also need verifying as current at build time, not trusted from a July document. | Blocked on BIZ-6. Can be built ahead of sign-off if Graeme wants it ready, but must stay unlinked from nav and sitemap until reviewed. | Blocked. |
| Outreach — OUT-1 (reshaped) | Brief drafted, not yet run. | Run the session. | Blocks OUT-2–OUT-7. |
| Outreach — org category decision | New, 29 Jul. Alex suggested workplace wellbeing reps and women's health groups; "why would they do anything?" messaging gap identified. | Graeme's decision + messaging pass. | Blocks OUT-2–OUT-8. |
| Business — BIZ-9 (IP/trademark) | Deprioritised 29 Jul per Alex; still deprioritised. 🟡 **Raised at the 10 Aug solicitor consultation as planned** — no advice given yet. | Await Natalie's response. Do not chase separately. | None urgent. |
| Business — BIZ-5 (solicitor: Privacy Policy + ToS) | 🟡 **Solicitor engaged, 10 Aug** — Natalie, 30-minute introductory call, all four areas covered. Moves from "no solicitor identified" to "awaiting scope, priorities and costs." **Not closed — no advice received yet.** See the Solicitor Consultation section above for the full record and the five follow-up actions. | Send/confirm the six-document pack; restate the beta-minimum vs launch-minimum split **in writing** as two lists, not one combined answer; ask for a safeguarding reviewer referral. | Awaiting Natalie's written response. |
| Business — Severe pain Rest/Adapt choice liability question | 🆕 **New, 04 Aug.** Graeme's reasoning for the new Severe-pain choice feature (`coach-proposal.js` v17): an actively-chosen, recorded "rest offered, user chose to continue" pattern may reduce liability if a user is injured after choosing to adapt. The interaction and audit trail are built — whether it actually holds up legally is unverified, flagged in the code comments as a real legal question, not assumed. | 🟠 **Not confirmed raised at the 10 Aug consultation** — not mentioned in Graeme's account of the meeting, so assume not covered. Add it to the follow-up email; it's a cheap addition to an existing thread. | Awaiting Natalie. |
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
| Product — `session-builder-ui.js` reads non-existent `userTier` field, locks Personal-tier options for paying users | 🟢 **Found and fixed, 03 Aug.** `isPremium()` now reads `store.get("tier")` instead of the never-written `"userTier"`. `session-builder-ui.js` v1→v2, `sw.js` v187→v188, pushed and confirmed live via raw GitHub fetch. Changelog updated. | **On-device confirmation** — switch to Personal tier via Settings' dev tier-switcher, confirm session-builder options unlock. No device available this session. | Booked as soon as Graeme can test on-device. |
| Product — `proposalBias` written by `coach-reflection.js`, never read anywhere | 🟠 **New, 03 Aug**, found during BUILD-4 Appendix A follow-up. Reflection logic computes `lighter`/`rest`/`null` bias per reflection type (severe pain, burnout risk, consecutive days, returning after absence) but nothing downstream consumes it — same "specified but never wired up" pattern as `exerciseFeedback`. | Needs a decision: wire it into `coach-proposal.js`'s generation logic (the apparent original intent), or retire the write. Not scoped. | Not booked, no urgency — but a real "coach doesn't actually respond to reflection signals" gap worth being aware of. |
| Cleanup — `gymProgrammeWeek` dormant, no writer | 🟡 **New, 03 Aug**, found during BUILD-4 Appendix A follow-up. Read once in `reflect.js` as a cosmetic rotation seed, always defaults to `1` — real programme-week tracking is `activeProgramme.currentWeek`. | Sign-off only — safe removal candidate. | None, deliberately deferred. |
| Cleanup — `todayEnergy` dead, no writer | 🟡 **New, 03 Aug.** Naming remnant in `intention.js`, superseded by `lastCheckin.energy`. | Sign-off only — safe removal candidate. | None, deliberately deferred. |
| Cleanup — `community.credits` write-only, no reader | 🟡 **New, 03 Aug**, found incidentally while confirming `totalCredits` has no overlap with it (confirmed distinct — Impact Credits mechanism). Awarded via `awardCommunityCredit()` but nothing displays it anywhere. | Needs a decision: build a display (Impact page/Settings) or leave as backend-only for now. | Not booked, no urgency. |
| Cleanup — `workoutHistory` write-only, no reader | 🟡 **New, 03 Aug.** Fourth genuinely distinct history mechanism (alongside `activityLog`/`progressLog`/`activeProgramme.milestones`), appended on every gym-type `workout.js` completion, but nothing displays it. | Needs a decision: build a display or leave as-is. | Not booked, no urgency. |
| Cleanup — `consentGiven`/`consentAt` written, never checked | 🟡 **New, 03 Aug.** Set once in `welcome.js` onboarding, no gate anywhere reads them back. Likely intended as an audit-trail record rather than a live gate — worth Graeme confirming that's the actual intent given consent has legal/ToS weight. | Confirm intent; may be fine as-is (audit trail), may need a real consent gate. | Worth a quick sign-off given legal relevance — not urgent otherwise. |
| Product — Home Nav & Conditions Redesign | 🟡 **Conditions Update screen is live, 04 Aug — Phases A–D-4 all shipped.** New `conditions-update.js`: collapsed condition cards (unambiguous chevron affordance), severity slider, reflection field, felt-sense goal picker with a severity trend from existing `checkinHistory` once a goal's set, one shared "Your programme" section ("Build your own" only — coach-built/coach-recommended deferred to NEW-1, deliberately not shown as "coming soon" tiles), fold-in dial. Reachable from both Home's door and Settings' "Edit conditions," which now points at the real screen instead of the old limited onboarding sheet. `prescribed.js`'s coach voice is origin-aware. `router.js` v12, `today.js` v8, `settings.js` v12, `sw.js` v205. **Not built:** Phase D-5 (fold-in dial's actual generator hook in `workoutGenerator.js` — the setting is stored correctly, just not consumed by session generation yet). | **Not yet on-device confirmed** — needs a full pass: add/expand a condition, severity slider, goal + trend, reflection, "Build your own" coach line, both entry points (Home and Settings). | Booked — Phase D-5 (fold-in generator hook) is the only piece left of the original blueprint. |
| Product — Phase D decision D-1: condition-specific goals | 🟢 **Resolved, 04 Aug.** New field `conditionGoals` — felt-sense, not numeric, matching Graeme's own framing: three options only, "Feel healed" / "Cope better day-to-day" / "Feel stronger, improve," plus optional note, skippable. Offered alongside the existing coach-milestones option, not replacing it. | None. | Ships in Phase D-1. |
| Product — Phase D decision D-2: `prescribed.js` coach voice | 🟢 **Resolved, 04 Aug.** New field `prescribedExercisesOrigin` ('professional'\|'self'\|null). Only 2 of 4 coach-line branches in `buildCoachLine()` actually reference professional origin — those two swap on the flag, everything else (add-exercise form, session flow, credits) untouched. Copy-branching, not a rebuild. | None. | Ships in Phase D-4. |
| Product — Phase D decision D-3: fold-in dial scope confirmation | 🟢 **Resolved, 04 Aug.** Confirmed: fold-in dial touches `workoutGenerator.js` only ("Cardio, Core & Strength" sessions) — `core-session.js` (Phase B's consolidated pool, a different thing despite the similar name) stays untouched. | None. | Ships in Phase D-5. |
| Product — Design Consistency Audit ("clean lines" pass) | 🟡 **Half A complete, 04 Aug** (`alongside_design-audit-half-a-findings_04aug2026_v1.md`). Found and fixed a real bug along the way: `--color-bg-elevated` undefined everywhere, 46+ usages across 14 files, every "elevated surface" app-wide rendering with no background. `variables.css`, `main.css` v14→v15, `sw.js` v220. Also confirmed (flagged, not fixed): five-plus screens each reinvent their own card component rather than sharing a base — real consolidation candidate, needs a decision not a solo call. | **Half B (screenshot review) still needs Graeme** — do it fresh, several screens now look different than when this was scoped this morning. | Not booked. |
| Product — "Add to my programme" button overflow, likely explains a routing report | 🟢 **Fixed, 04 Aug.** Same overflow bug pattern found repeatedly today — `min-width:0` + `white-space:normal` applied. Re-verified the Mobility & Conditioning routing logic itself is correct (only routes to the programme when a condition-tagged entry genuinely exists) — the likely explanation for Graeme's separate report of it routing to Library instead is that this broken button prevented the exercise from actually saving in the first place, not a second bug. | **Retest needed**: add an exercise via "Coach recommends," confirm it saves, then re-check Mobility & Conditioning routes to the programme correctly. | Booked — retest is the gate. |
| Product — Library added as its own Home door | 🟢 **Fixed and confirmed correct behaviour, 04 Aug.** Graeme's follow-up clarified the earlier "still get this" report: Mobility & Conditioning correctly falls back to Library when no condition programme exists — confirmed working as intended, not a bug. Library door itself confirmed live. | None — routing confirmed correct. | Closed. |
| Product — Library page, fully styled | 🟢 **Fixed, 04 Aug** — extended from the landing-screen fix to the whole page, real missing-styles bug throughout, not a redesign. Checked every class `library.js` uses: "Start a session"'s category grid and its per-category session sub-screen had zero CSS too, same bug. "Log what I did" checked and confirmed already styled (reuses `settings-library.css` classes) — left untouched. `library.css` v2, `library.js` v2 (markup restructure only, no behaviour change). | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Product — Force-update button | 🟢 **Built, 04 Aug.** Graeme's phone was stuck on stale, unstyled screens despite his laptop being current. Checked `sw.js` first: pure cache-first fetch strategy — confirmed real, not imagined. New "Update app" button in Settings' About panel goes beyond the existing polite `checkForUpdate()` — clears every cache directly and hard-reloads regardless of service-worker state. `settings.js` v13, `settings.css` v6. | **Not yet on-device confirmed** — this is the one that actually needs the phone test. | Booked — on-device pass is the point of this fix. |
| Product — Conditions Update scroll-jump fixed | 🟢 **Built, 04 Aug.** Every state change was resetting scroll to the top — the container being re-rendered isn't the scrolling element, window is. `window.scrollY` now preserved across every `render()`. `conditions-update.js` v6. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Product — Mobility & Conditioning: real landing page | 🟢 **Built, 04 Aug.** New `mobility-conditioning.js`: Start a Mobility Session (routes to `core-session.js`, already condition-aware), My Conditions Programme (collapsed by default — count + expand, "Not created" links into Conditions Update when empty, grouped-by-condition list plus a "Start this programme" action when expanded), Log an event (Library). Replaces the earlier smart-routing hack entirely. `router.js` v13, `today.js` v12. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Cleanup — `prescribed.js`'s "Back to choices" | 🟢 **Fixed, 04 Aug**, bundled with the landing page build above. Both back buttons now go to Home instead of the confusing `intention` screen — more relevant now that the new landing page is this screen's primary entry point. `prescribed.js` v1.3. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Product — Cross-condition programme integration | 🟢 **Built, 04 Aug.** Recommendation refined once before building — first draft would have duplicated shared exercises across conditions rather than genuinely reusing them (broken completion state, double credits, showing up twice). Rebuilt properly: `prescribedExercises` entries now support `conditionIds` (array) — one exercise entry can genuinely belong to more than one condition. `commitProgramme()` reuses existing entries by `exerciseId` instead of duplicating; both programme-building functions bias toward reuse and the UI shows "Already in your X programme." Backward compatible with old singular-`conditionId` entries, no migration step. Smoke-tested against real overlapping conditions (glutes/hip) before shipping — confirmed genuine reuse, not duplication. `conditionProgrammes.js` v3, `conditions-update.js` v7, `mobility-conditioning.js` v2, `prescribed.js` v1.4, `Schema.md` v1.16. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| **Safety — `prescribed-session.js` contraindication check** | 🟢 **Fixed, 04 Aug.** New `_checkContraindication()` — for exercises with a real `exerciseId` (coach-built/coach-recommended, not manually added ones with no database record to check), compares against `getActiveConditionIds()` for today. Doesn't hide or block, surfaces a flag matching `coach-proposal.css`'s existing constraint styling and lets the person decide. Smoke-tested against real exercise data before shipping — severe pain correctly flags, mild correctly doesn't. `prescribed-session.js` v3, `workout.css` v3. `prescribed.js`'s list view still doesn't show this (only the in-session flow does) — reasonable, contained follow-up if wanted, not done here. | **Not yet on-device confirmed** — worth testing deliberately: build a programme, bump a condition to Severe via Conditions Update, re-open the session, confirm the flag appears on the right exercise. | Booked — on-device pass. |
| Product — `gym-programme.js` lacks a guided walkthrough | 🆕 **New, 04 Aug**, Graeme's direct comparison: `gym-programme.js` is a flat "tick when done" checklist — no timer, no form cues, no video links — while `workout.js` already has the full guided experience (timer, Start/Next/Skip, exercise detail). Real consequence, not just a UX gap: without an active session-flow moment, Empathy Transfer prompts have nothing to attach to in gym-programme sessions. | Needs its own scoped build session — bring `gym-programme.js` up to `workout.js`'s standard. Real size, not a quick fix. | Not booked. |
| Cleanup — `coach-reflection.js` now unreachable | 🆕 **New, 04 Aug**, found while confirming Graeme's "is this obsolete?" question. `checkin.js`'s fallback (the only place that ever routed here) now goes to Home instead — traced first, not assumed dead. File left in place, not deleted in the same pass it was found unreachable. | Worth a proper look before deleting outright — confirm nothing else references it, decide whether any of its logic (activityLog handling, the "pattern reflection" framing in its own name) is worth preserving elsewhere first. | Not booked, no urgency — dead code, not a live bug. |
| Product — Pain Input Redesign + coach messaging (full arc, 04 Aug) | 🟢 **Built and pushed across 4 same-day passes.** (1) Sliders replace chip buttons — `checkin.js` v9, `checkin-mini.js` v4, canonical `conditions.js` `getPainBand()` v1.4, `.ci-pain-chip` removed. (2) Multi-condition natural-language messaging — `coach-proposal.js` v15, `_joinNames()`. (3) Mixed-severity combined narrative (Mild+Moderate+Severe in one message, each by its own state) — `coach-proposal.js` v16. (4) Severe pain active Rest/Adapt choice, with a genuine audit-trail record (`severePainChoices`, `store.js` v13) — `coach-proposal.js` v17. `Schema.md` v1.13, `sw.js` v199. | **Not yet on-device confirmed — one full pass needed, covers all four.** Both sliders + label boundaries; Mild/Moderate/mixed-severity messages read correctly; Severe triggers the choice screen and blocks doors until answered; Rest routes to a gentle no-session screen; same-day re-entry doesn't re-prompt; Adapt proceeds normally. | Booked — on-device test is the only remaining gate before Phase B. |
| **NEW-1 — Condition-specific programme routes** | 🟢 **Built and confirmed on-device, 04 Aug.** All 3 real routes live in `conditions-update.js`: "Coach builds it" (automatic, `js/data/conditionProgrammes.js`, smoke-tested against real data), "Coach recommends, I'll choose" (checkbox selection, now with a one-line rationale per exercise and an Avoid/Less-often dislike signal — see rows below), "Build my own" (`prescribed.js`, condition-tagged). `prescribedExercises` entries carry an optional `conditionId`. All 4 of Graeme's original decisions applied: one-time generation, flat list for now (captured for future progression, not lost), 8 exercises for real substance, check-in gating fixed alongside. Graeme's full on-device pass across today's whole body of work confirmed working. | None — closed. | Shipped, confirmed. |
| Product — Exercise rationale + dislike signal | 🟢 **Built, 04 Aug**, Graeme's two questions, both real, both shipped same day. One-line `why` rationale now shown per candidate — already existed on all 461 exercises, zero new content. "Not keen on this one" applies the already-approved `alongside_exercise_skip_dislike_spec_16may2026_v1.docx` (binary Avoid/Less-often, not a rating) to the candidate list — new `exercisePreferences` field, `conditionProgrammes.js` excludes avoided exercises and de-prioritises "less" ones, smoke-tested before wiring in. | **Not yet on-device confirmed** for this specific addition. | Booked — on-device pass next. |
| Product — Full skip/dislike spec, in-session flow | 🆕 **New, 04 Aug**, explicitly deferred while building the row above. The approved spec also covers skipping *during* an active session (`gym-programme.js`/`prescribed-session.js`/`core-session.js`) with a "not available today" vs "not keen" distinction — genuinely separate, larger scope than the browsing-list version just shipped. | Needs its own scoped build session. | Not booked. |
| Product — Check-in gating made optional | 🟢 **Fixed, 04 Aug.** Graeme: "we should fix this so it's optional not fixed." `today.js` v9 — session-generating doors only force check-in the first time today; once checked in, doors go straight through. `checkin-mini.js` v6 — Skip now honours `pendingDoorRoute` instead of always dumping to `intention`. New voluntary "Update check-in" link on Home replaces "Check in" once already checked in today. Resolves the check-in-mini-every-time complaint below directly — check-in-mini no longer appears automatically for second-or-later sessions at all. | None — closed. | Shipped. |
| Product — check-in-mini's flat page style vs full check-in's conversational thread | 🟡 **Largely resolved as a side effect, 04 Aug.** The check-in-gating fix above means check-in-mini's page-style UI no longer appears automatically for every second session — it's voluntary now, reached only via "Update check-in." Confirmed earlier: full check-in's conversational bubble thread was never touched, still intact. Whether check-in-mini itself should ever get the conversational treatment (for when someone does choose to open it) remains open, but the urgency driving this — being forced into it constantly — is gone. | Graeme's call whether this still needs a redesign, now that it's optional rather than forced. | Not booked, lower urgency than before. |
| **NEW-2 — Coach fitness-level recalibration engine** | 🆕 **New, 04 Aug**, Graeme's question during Home Nav discussion: can the coach notice and correct for a user's starting fitness self-assessment being too optimistic or pessimistic, across all programme tiers? Genuinely open — what data this needs hasn't been decided. Real candidate signals found while grounding the Home Nav blueprint, not yet wired together: dormant `exerciseFeedback` field (never written, but `applyFeedbackWeighting()` already exists and is ready to consume it); completion/skip rates against prescribed reps/sets; `conditionPainScores` trend over time; `fitnessLevel` (elsewhere flagged as inconsistently applied). | Needs a dedicated design conversation — likely sequenced after NEW-1 exists to recalibrate against. | Not booked. |
| Content — `dead-bug`/`bird-dog` contraindications | 🟢 **Resolved, 04 Aug.** Graeme's decision, recommendation offered first: Dead Bug's empty exclusions confirmed correct (standard anti-extension exercise, often used specifically as a safe low-back option). Bird Dog's lower-back/glutes exclusions also confirmed correct, plus a genuine addition — `wrist-elbow-acute`, for the real wrist loading in its hands-and-knees position that nothing previously captured. `strength.js` v3. Smoke-tested against the real safety-check logic before shipping. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| Business — BUILD-3 on-device test | 🟡 **Genuine tracking inconsistency found, 04 Aug.** One section of this document says "all 7 files confirmed... nothing further outstanding" (core-session/yoga-session/workout/running/walk/swim/cycle); BUILD-3's original stated scope was 11 files. `prescribed-session.js` isn't among the confirmed 7 — its exit-guard behaviour has apparently never actually been on-device confirmed, independent of today's work. Checked precisely: today's edit to that file (the safety-check addition) only touched imports and `render()`'s output, not `mountSessionGuard`/`dismountSessionGuard`/`completeExercise`/`cleanupSession`/`savePartialSession` — nothing done today invalidates BUILD-3's prior clean-code checks. | Include `prescribed-session.js` explicitly in the next on-device pass — its exit-guard status is genuinely unconfirmed, not just assumed covered by the "all 7" note. | Booked — folds into the general on-device pass already needed. |
| Product — Mobility & Conditioning door | 🟢 **Wired to the real programme, 04 Aug.** `today.js` v10 — routes to `prescribed.js` when a condition-tagged programme exists, falls back to Library otherwise. Door tile shows a "Your programme" hint so the routing isn't silent. Last open bridge from Phase C's six-door Home now closed. Known small rough edge, not fixed: `prescribed.js`'s Back button returns to the general activity picker rather than Home when reached this way — pre-existing, low-impact. | **Not yet on-device confirmed.** | Booked — on-device pass. |
| **Product — "In Step" (Noticing Hub, Personal tier)** | 🟢 **Built and pushed, 09 Aug.** New feature developed and specced in full in PM chat the same session, then built directly. Four-movement scenario practice (Solo/Partner/Floor/Environment) extending the empathy transfer arc as a self-directed practice space, distinct from the existing stage-prompt system that fires unprompted in-session. One scenario, three lateral unranked options (order shuffled per view), identical acknowledgement regardless of choice, closed-by-default cited "Learn why" (Zhang 2025, Batson 1987, Decety 2011, Plumbly 2024). 3-day cooldown between scenarios per movement, anti-binge by design. Choice data logged to `inStepProgress.choiceLog` — aggregate research signal only, explicitly never read by coach logic or surfaced per-entry to the user; Graeme's stated intent is future cohort-level pattern reporting, not individual profiling. `js/data/in-step-scenarios.js` (new, 4 movements × 4 scenarios), `js/views/in-step.js` (new), `store.js` v17→v18, `router.js` v13→v14, `noticing.js` v3→v4 (card gated via `auth.js` `isPremium()`), `Schema.md` v1.16→v1.17, `sw.js` v221→v222. Ground-truthed against live repo before building (found `noticingProgress`'s territory/series schema already existed dormant, but the eight-territory `noticing.js` rewrite it was built for was never actually shipped — In Step is the first real consumer of that dormant schema shape). Deliberately named "movements," not "territories" — avoids collision with onboarding's unrelated `primaryTerritory` field. Also caught and documented a pre-existing `Schema.md` drift (`exercisePreferences`, `store.js` v17, never logged) while in the file. | **Not yet on-device confirmed** — first real test: complete a Solo scenario, confirm the 3-day lock shows correctly on return, confirm free-tier sees the locked card and taps through to `/upgrade`, confirm Personal-tier sees the real card and completes the full landing→scenario→result flow including Learn Why expand and the journal hand-off. Content depth (4 scenarios/movement) was agreed as v1 proof-of-concept — expansion is a deliberate later pass, not a gap. | Booked — on-device pass next session. Scope for cohort-level `choiceLog` reporting (mentioned above) is a separate future Supabase-era task, not blocking this. |
| Cleanup — `journal-entry.js`/`noticing.js` field-name mismatch | 🆕 **New, 09 Aug**, found while wiring In Step's journal hand-off. `noticing.js`'s "Your reflections" display reads `entry.body`/`entry.createdAt`/`entry.category`; `journal-entry.js` v3 actually writes `entry.text`/`entry.date`/`entry.tags`. Pre-existing, unrelated to In Step — not fixed (out of scope, touch-once). | Needs a proper look — likely means "Your reflections" has been silently rendering blank/undefined fields since v3 (14 Jul). | Not booked. |
| Cleanup — `journalEntryType` set but never read | 🆕 **New, 09 Aug**, same discovery. Both `noticing.js`'s weekly-prompt button and the new In Step "write about it" button set `store.journalEntryType` before navigating to journal-entry, matching the original v2 intent — but `journal-entry.js` v3 never reads that field at all (removed or never carried over during the v3 privacy-rule rewrite). Entries still save fine; they just don't land on the type-appropriate pre-selected screen. | Needs a small fix in `journal-entry.js` to read and act on `journalEntryType` — contained, low-risk. | Not booked. |

*All standing rules, Stream A/C/D/E detail not listed above are unchanged from v71–v78 — see those versions for full detail.*

---

## 🔑 Master Schedule → Repo Workflow — decided 30 Jul 2026

Graeme provided the fine-grained GitHub token directly in the PM chat so schedule updates can be pushed straight to the repo, rather than downloaded and uploaded manually via the GitHub web UI each time. From this version forward: the PM chat, at session close, writes the new version, pushes it to `Documents/Admin/master_schedule.md`, moves the previous version into `Documents/Admin/Past MS/`, and removes the superseded copy from project knowledge search results by uploading the new snapshot over it (the old project-knowledge entries themselves still need manual deletion by Graeme — Claude can't do that directly).

**Security note, worth having on record:** this token now lives in the PM chat's own conversation history, not just a build chat's. That's a wider exposure surface than the original "paste into the build chat that needs it" plan — mitigated by the same short expiry (7 days) already in place. Worth revisiting once the product's past the rapid-build phase, same as the original project-knowledge token storage trade-off already logged.

---

*Build New Habits · Alongside: Move · Master Schedule · 12 Aug 2026 v154*
