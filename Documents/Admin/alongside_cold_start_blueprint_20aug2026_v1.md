# Alongside: Move — Cold Start Blueprint
## 31 Aug 2026 v13

Build New Habits | Everything a chat with no memory needs to pick this up and build confidently.

**Read this first, then `Documents/Admin/master_schedule.md`. Do not start work before both.**

---

## 1. What this is

**Alongside: Move** is a PWA fitness coaching app for people mainstream fitness culture consistently fails — neurodivergent adults, people navigating hormonal change, people in burnout, people with chronic conditions.

**It is a coaching methodology expressed as software, not a fitness app.** The distinction decides most arguments. When a proposal makes sense for a fitness app and not for a coach, it is wrong.

**Founder:** Graeme. Sole trader, **not yet registered with HMRC** — never describe the business as "Ltd".

**North star:** *joy at the gap* — somebody doing something they would not have done without Alongside.

**Beta soft launch December 2026. Public launch 1 January 2027.**

---

## 2. Access — token, repo, verification

**Token:** `/mnt/project/Token_06_08_26_for_rapid_work_to_beta`, first line, strip whitespace. GitHub fine-grained PAT, ~7-day expiry. If pushes 403, it has expired — ask Graeme, do not work around it.

**Repos:** `build-new-habits/alongside-app` (the app) and `build-new-habits/website`. GitHub Pages.

```bash
TOKEN=$(head -1 /mnt/project/Token_06_08_26_for_rapid_work_to_beta | tr -d '\n\r ')
git clone --depth 1 https://x-access-token:$TOKEN@github.com/build-new-habits/alongside-app.git repo
```

**Always a fresh clone.** `raw.githubusercontent.com` has CDN caching lag and will show you stale files. **Verify every push with a second fresh clone**, never by reading your own working tree.

**Gates need jsdom:** `npm install jsdom` in `/home/claude` before running the suite, or 30+ gates fail on a missing dependency and look like regressions.

**Commit messages go in a file** — `git commit -F /tmp/msg.txt`. Never inline with backticks; a force-push incident is on record.

---

## 3. Where everything lives

| Path | What |
|---|---|
| `Documents/Admin/master_schedule.md` | **Canonical plan of record.** Wins over project knowledge on any conflict |
| `Documents/Admin/Past MS/` | Every superseded schedule version |
| `Documents/Live State/Schema.md` | Store fields. **Must match `store.js`** |
| `Documents/Business/` | Governing documents — see below |
| `Documents/Archive/` | Stale, kept not deleted |
| `tools/verify-*.mjs` | 97 gates |
| `js/` | Vanilla ES modules, no framework, no bundler |

**Governing documents, in read order:**

1. `alongside_revenue_architecture_18aug2026_v1.md` **v2** — what people pay for, the R1–R6 build order, the four closed decisions
2. `alongside_tier_boundary_12aug2026_v1.md` **v3** — the track analogy, §4 is the live boundary
3. `alongside_progression_boundary_20aug2026_v1.md` **v2** — goals vs targets, progression without a number, the trial
4. `alongside_gear_change_20aug2026_v1.md` **v1** — how somebody sees they have changed
5. `alongside_destination_architecture_12aug2026_v1.md` — the destination spine

🟠 **Filename date fault:** the revenue architecture is dated 18aug in its filename and was written on the 20th. Referenced by `verify-tier.mjs`, the schedule, the tier document and several commits. **Do not rename casually** — it needs its own scoped task.

---

## 4. Live state, 31 Aug 2026

| | Version |
|---|---|
| `store.js` | v59 |
| `Schema.md` | v1.41 |
| `sw.js` | **v420**, cache `alongside-v420` |
| `router.js` | v22 · `my-programme.js` v8 · `today.js` v24 · `settings.js` v34 · `progress.js` v11 · `onboarding/thread.js` v13 |
| Gates | **97, all green** — and genuinely green from any clone path |

🟢 **This table is now GATED.** `tools/verify-blueprint.mjs` compares every version above against the file that carries it and goes red on any drift, naming the row to change.

**It was written because this table went stale three times on 22 Aug alone** — and staleness here is worse than in an ordinary document, because §"Session Start" tells a new session to *stop and reconcile* when versions do not match. A stale table halts work over a discrepancy that exists only on paper. Three hand-fixes later, the fourth approach was to make drifting impossible.

⚠️ It asserts **agreement, not correctness**: it cannot tell whether the prose below is still true, only that the numbers are. The prose still needs a person.

🟢 **GATE-PATH closed 21 Aug.** v1 of this document claimed 75 green on a fresh clone. That was never true: 14 gates hardcoded `/home/claude/repo`, so a clone elsewhere went red — and if that directory existed from an earlier session they read **that** copy and reported green on code nobody was editing. A clean clone actually ran 63 pass, 14 fail.

All 49 affected files now resolve from `import.meta.url` — 14 for the repo path, 35 for jsdom. **Proven by reversal:** with `/home/claude/repo` removed entirely, a clone at another path runs 78 green; and breaking `store.js` in that local copy turns all 49 store-importing gates red.

⚠️ **Still true:** 5 source-text gates stayed green through that break, because `readFileSync` regexes do not care whether the module loads. That is the 43-of-78 problem in §8, not a path problem.


**Stack:** vanilla JS PWA, ES modules, localStorage (pre-Supabase), WCAG 2.2 AA throughout.

---

## 5. How to work — non-negotiable

### Session start
1. Read this document.
2. Read `Documents/Admin/master_schedule.md` from a **fresh clone**.
3. Confirm live file versions against the schedule. Mismatch → stop and reconcile.
4. List every file you will touch. **Touch-once**: a file appears in one session only.
5. Any new or changed store field → `store.js` **and** `Schema.md` **before** any code reads it.

### Session close
1. Full suite green, from a fresh clone.
2. `sw.js` **last, alone, in its own commit**, with a cache bump.
3. Update the master schedule, archive the old version to `Past MS/`.
4. Verify with a second fresh clone.

### File discipline
- Every file carries `DD Mon YYYY vN`. **Check today's actual date.** Do not copy the date from a prior version or from the conversation — that error was made on 20 Aug and cost a filename.
- Human-readable JS strings use **double quotes**; no apostrophes inside single-quoted strings.
- Python `str.replace` with `assert text.count(old) == 1` before every substitution. It has caught real ambiguity.

### Verification — read this twice
- **`node --check` DOES NOT VALIDATE ES MODULES.** It parses `.js` as a script and will pass a file that throws on load. Use `cp file /tmp/x.mjs && node --check /tmp/x.mjs`.
- **A backtick inside a comment inside a template literal closes the template.** Learned twice in ten minutes.
- **Source-text gates pass while behaviour is broken.** This happened **five times on 20 Aug alone**, most severely in BIAS-3. Gates that matter must **execute**.
- **A gate is not proven until its reversal has been confirmed to fail.** Two of nine reversals were not caught on first writing, and one assertion passed for the wrong reason.
- **Touch-once:** bugs found outside scope are logged, not fixed, unless asked.
- **"Code complete" and "confirmed working on device" are different bars.**

---

## 6. The product — what decides arguments

### The boundary

> **Free is today. The Plan is the arc.**

Graeme's anecdote, and it settles most questions. A Tuesday-night drop-in at his daughter's athletics club gets a real coach, real direction, and on a second visit *"same as last time, or something different?"* What he never gets is somebody holding the arc. His daughter's coach holds her history, her injuries, her goals, and the hard conversations. **Two coaching relationships, neither lesser.**

**Free** — choosing what you do today (self-direction is an **accessibility feature**), a real session adapted to today, recognition between sessions, every safety feature permanently, fourteen days of record, personal bests, data export.

**The Plan** — you name a destination and the coach builds the road; it carries the hard truths; sessions follow on; progress that reads rather than records; impact credits.

**Free has goals. The Plan has targets.** A goal is a direction; a target is a destination with a date.

### Absolute constraints

- **NEVER STREAKS. EVER.** Not a preference. No consecutive counting, no chain, no calendar grid, no run of any length, any tier, any copy, forever.
- **Journal Privacy Rule:** no signal detection on journal content. Ever. No exceptions.
- **Safety is never paywalled.** Care mode, condition-aware exclusion, red-flag escalation, prescribed clinical work.
- **P4:** the coach displays but never interprets. Points at what it noticed; attaches no verdict.
- **Coach voice is nurturing only**, permanently. No picker, no alternatives.
- **Billing never speaks in coach voice.** That is the P2 helper layer.
- **No comparison to other people, anywhere.**

### Principles that decide edge cases

- Behaviour is communication. Variability is information. Curiosity before judgement.
- The kerb-cut principle: design for the most marginalised, benefit everyone.
- "Validates and forwards" — the coach contextualises and opens; never mirrors, never prescribes.
- **A decision that lives only in a conversation has not been taken.** It must reach the repository.
- Free must be **complete in itself and limited in horizon**. Never degraded to create pressure.

---

## 7. Pricing — closed, do not re-litigate

| | |
|---|---|
| Monthly | **£7.99** |
| Annual | **£59.99** from launch (1 Jan 2027) |
| Beta annual | **£44.99**, December 2026, beta cohort only, **locked forever**. Stripe coupon — **never in app code** |
| Trial | **30 days**, card at the **upgrade** point (not app signup), no charge until day 30 |
| Refund | Voluntary **14 days from first payment** — Graeme's policy, granted |
| Rate rises | **Never, for anyone** |

Truth lives in `js/data/pricing.js`. `verify-price.mjs` enforces it.

🔴 **Never write "over double the statutory cancellation period."** CCR cooling-off may run from contract formation and expire on day 14, **inside** the trial. Open with Natalie.

**Break-even:** ~£1,974 startup, ~£802/year running. **64 beta users at £44.99 clears year one.** 19 covers running costs.

🟠 The pricing model (20 Jun v2) has **superseded figures, a one-stage funnel that no longer matches reality, and says "Ltd"**. Do not quote its projections until rerun.

---

## 8. Build order — what to do next

| | Task | State |
|---|---|---|
| **1** | **HMRC sole trader registration** | 🔴 **Graeme's.** Blocks bank account → Stripe → all revenue |
| **2** | **Send the finished physio/clinical pack** | 🔴 Graeme's. It is finished and unsent |
| **3** | **Confirm org outreach categories** | 🔴 Graeme's. Year 1 revenue is org referrals, not freemium |
| **4** | **R1-b — the hard conversation's surface** | 🟡 **R1-a shipped 21 Aug** (detection, dark). R1-b is the three options in `my-programme.js`. Authority: `alongside_r1_r2_amendment_21aug2026_v1.md` |
| **5** | **P-1 + P-3 — load progression with reversal** | 🔵 The Plan cannot deliver its own promise without it |
| **6** | **R2-a — targets become Plan-only** | 🟡 Boundary correction, decided 21 Aug. **Decide before October** — after that it takes something back. R2-b (the demonstration) still needs discovery |
| **7** | Gear change | 🔵 After the above |

**R1-a shipped 21 Aug 2026.** `js/data/goal-review.js` — pure, zero imports — now holds detection, suppression and the trailing rate, with 82 executing checks across `verify-hard1.mjs` and `verify-hard1-store.mjs` and 22 confirmed reversals. **Nothing reads it yet.** `strategicGoal.targetSetAt` is written by nothing until R2-a. Both are deliberate one-session orphans, tracked by the gates.

⚠️ **Read `alongside_r1_r2_amendment_21aug2026_v1.md` before touching R1 or R2.** The 18 Aug spec was wrong in eleven places, all found by opening the files it named. Two changed the product: **weight-based targets are excluded from R1 entirely**, and **a dated target can only be recorded on the Plan.**

**Success for R1-b:** three options always present with "leave it where it is" a real unnagged choice, free never sees it, no banned vocabulary in any branch — and the target display tier-gated in the same visit, because `my-programme.js` gets touched once.

---

## 9. Known open faults

| Fault | Note |
|---|---|
| **Progression does not exist** | For any tier. `session-builder.js` builds week 10 like week 1 |
| **43 of 77 gates are source-text only** | They cannot tell live code from dead |
| ~~14 gates hardcode the clone path~~ | **Closed 21 Aug (GATE-PATH).** |
| ~~1 module does not link~~ | **Closed 22 Aug (CHOOSER-1).** `verify-link.mjs` now reports 0 known-broken and guards the class permanently |
| **Source text can contradict runtime** | `goals.js` declares `hasTarget`/`targetType`; the `flatMap` that builds the export drops them. Grep confirms the opposite of the truth. **Execute** |
| **A gate can pass against defaults** | `verify-hard1-store` first wrote to the wrong localStorage key and every assertion passed, having never loaded its own fixture. Put a positive control first |
| 33 gates hardcode `/home/claude/node_modules/jsdom` | "Green on fresh clone" is only true where jsdom exists there |
| `auth.js` `initPaywallListener()` | Calls bare `router.navigate()`; works only via `window.router` |
| Dead CSS: `.progress-export--locked` | Renderer removed 20 Aug |
| `verify-price.mjs` banner excuse | A document that *discusses* the banner exempts itself, silently |
| Orphan fields | `goalHasTarget`, `targetType`, `chaptersDone.measuredLevelAtEnd`, `exerciseFeedback` — written or declared, read by nobody |
| `checkin.js` orphan exports | `getWordObject`, `getCoachPostureForQuadrant`, `getOpeningModes` — no callers |
| Changelog stale since March | Resume or retire — decision needed |

**The orphan pattern is systematic**, not incidental: fields get written for a feature that is then deferred, and nothing tracks the orphan. **Before building anything, grep for whether it already exists.** On 20 Aug three specs were written against files that had not been opened — one described as unbuilt had shipped eight days earlier.

---

## 10. The narratives — use these, they are the product

### The track (settles tier arguments)

Graeme turns up at his daughter's athletics club on a Tuesday. The coach asks what he wants to do and gives him a real session — properly judged, worth having. He comes back and the coach says *"same as last time, or something different?"* Warm, real coaching, **no arc**. His daughter's coach holds her history, her injuries, her goals, and the hard conversations about moving a date. **Neither is lesser.**

### The injury (what the Plan is for)

*Illustrative. R1-a's detection exists as of 21 Aug; the surface below is R1-b and does not.*

> **March.** I told the coach I wanted to walk up a local hill again by September without stopping. It didn't say *great goal*. It asked what walking had felt like before, and whether anything hurt. I mentioned an old knee problem. It wrote it down.
>
> Through spring the sessions came with reasons attached. *Legs today, because Saturday was long and you said your calves were tight — so this is lighter than it looks.* Some weeks three sessions, some weeks one. It never mentioned that.
>
> **Then I went over on my ankle.**
>
> I logged it. The coach didn't tell me to rest and disappear. It asked what I could still do and built around it — upper body, seated work, things I'd never have chosen.
>
> A few weeks later it said the thing I was avoiding: *You set September. On where we are now, September asks more of that ankle than it can give. We can move it to spring, walk it instead of run it, or leave it and see. Your call.*
>
> I moved it. It didn't congratulate me for being sensible. It rebuilt the road.
>
> **Autumn.** At the end of a chapter: *When we started this you were asking me what you could still do. Lately you've been telling me. That's a different question.*
>
> That's the bit I'd pay for. Not the sessions. Something paying attention across nine months, and telling me the truth in the middle of it.

### The refusals — the marketing asset

**No streaks. No shame. No comparison. No before-and-after photos.** Features are not shareable. Refusals are. *"The fitness app that will never show you a streak"* is a sentence a journalist runs and a link worker repeats.

---

## 11. Working with Graeme

- **Delegates implementation entirely.** Makes product and philosophy calls when framed cleanly.
- **One decision at a time.** Bullet points. ADHD-friendly.
- **Corrects framing when it's wrong** — and is usually right. Take the correction seriously and check it in code before agreeing or disagreeing.
- **Expects professionals to receive something finished** needing validation, not crafting.
- **Wants honesty over reassurance.** Report your own errors plainly. Five were reported on 20 Aug and every one improved the work.
- **Do not flatter.** If a proposal is commercially wrong, say so with evidence — the difficulty-line proposal was rejected on library data, not on principle.

**Key people:** Alex (Somerset Innovation Hub, advisor) · Natalie (solicitor, holds the CCR question) · Dr Claire Plumbly (burnout researcher) · Alfie (BANDS CIC). Sarah Brady is an **informal adviser only** — not a safeguarding reviewer, not legal sign-off.

---

*Build New Habits · Alongside: Move · Cold Start Blueprint · 20 Aug 2026 v1*
