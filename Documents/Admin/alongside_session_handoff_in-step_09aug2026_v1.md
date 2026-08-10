# Alongside: Move — Session Handoff
## 09 Aug 2026 v1

Build New Habits | "In Step" (Noticing Hub, Personal tier) — concept development + build, full session record

---

## 1. What this session was

Started as a reaction to an "AI friend"'s gamified empathy-transfer suggestion (points/comparison mechanic — correctly identified by Graeme as conflicting with the product's no-gamification, no-comparison rules). Through discussion, reshaped into a genuinely aligned feature: **In Step**, a self-directed scenario-practice space in the Noticing Hub, extending the existing empathy transfer arc rather than duplicating it. Concept was fully talked through, scoped, then built and pushed same session, at Graeme's request ("build this today").

**Status: built, pushed, syntax-clean. Not yet on-device tested — that's the one thing still needed to close it.**

---

## 2. What was decided (concept, in order)

1. **Core mechanic**: one scenario, three lateral response options — never ranked, order rotated per view. No "AI-generated alternative" comparison (the original AI-friend idea) — that reintroduces evaluation. Identical acknowledgement regardless of which option is picked.
2. **Four movements** (not "territories" — that word is already used by onboarding's unrelated `primaryTerritory`): **Solo** (inward), **Partner** (close relationships), **Floor** (strangers/wider crowd), **Environment** (uncontrollable circumstance — explicitly kept tied to the empathy-reflection throughline, not generic resilience content).
3. **Naming**: "In Step" — a real dance/music term, describes the call-and-response mechanic directly.
4. **"Learn why"**: closed by default, cited real research, general to the movement — never comments on the specific option chosen. Citations: Zhang et al. (2025, self-compassion), Batson (1987, perspective-taking), Decety (2011, empathy generalising to strangers), Plumbly (2024, nervous-system flexibility).
5. **Pacing**: 3-day cooldown between scenarios within the same movement — anti-binge, matches the existing empathy-stage-prompt cadence.
6. **Tier**: Personal (Graeme's explicit call).
7. **Data**: choice + tag logged per interaction, aggregate-research-only by design — never read by coach logic, never surfaced back to the individual user, never used to change what's offered next. Graeme's stated intent: future cohort-level "does this shift over time" reporting, not individual profiling. Flagged as needing its own privacy-policy line and Supabase schema treatment later — not built now.
8. **Burnout-detection routing — pushed back on, and revised.** Original idea was to route into In Step during Recovery Mode. Recommended against it: Recovery Mode is deliberately narrow (single restorative option, minimum decision load), and a reflective/cognitive task during active burnout risk works against Plumbly's own rest-first framing. **Agreed instead**: In Step surfaces as the *bridge back* once someone exits Recovery Mode, not during it.
9. **Content scope**: 4 scenarios per movement for v1 ("prove the concept"), expansion is a deliberate later pass.

---

## 3. What was built (all pushed, all `node --check` clean, no stray non-ASCII)

| File | Version | What changed |
|---|---|---|
| `js/data/in-step-scenarios.js` | new, v1 | 4 movements × 4 scenarios, 3 options each, movement-level acknowledgement + cited Learn Why |
| `js/views/in-step.js` | new, v1 | Landing (4 movement cards, lock state) → scenario (call + shuffled 3 options) → result (acknowledgement, Learn Why toggle, journal hand-off) |
| `store.js` | v17 → v18 | New `inStepProgress` field: `unlockedAt`, `scenarioIndex`, `completedCount`, `choiceLog`. Added to `getDefaults()`/`mergeWithDefaults()` |
| `router.js` | v13 → v14 | New route `in-step`, hidden nav (activity-flow treatment), mapped to Noticing tab |
| `noticing.js` | v3 → v4 | New In Step card, gated via `auth.js` `isPremium()` — free tier sees `lockedFeature()` wrapper (existing pattern, tap → `/upgrade`) |
| `Schema.md` | v1.16 → v1.17 | Documented `inStepProgress`. Also caught and fixed a pre-existing drift: `exercisePreferences` (`store.js` v17, 04 Aug) had never been logged here |
| `sw.js` | v221 → v222 | Precached the two new files, cache bump, deployed last as its own commit per standing rule |

**Ground-truthing finding, before any code was written**: `noticingProgress`'s territory/series schema already existed live in `store.js` (dormant) — written for an eight-territory Noticing Hub rewrite that was designed (`alongside_technical_blueprint_23jun2026_v1.docx`) but never actually shipped. `noticing.js` was still the pre-rewrite v3. In Step is the first real consumer of that dormant schema shape, not a slot-in to an existing engine as first assumed.

---

## 4. Repo state

Three commits, in order, all pushed and confirmed via a fresh clone (not just the working copy):

1. Application files (data, view, store, router, noticing, schema doc)
2. `sw.js` — separate commit, last, per standing rule
3. Master schedule v139 → v140

**One process note worth flagging**: the GitHub token pulled from project knowledge this session had been corrupted — a filename from an adjacent search result had concatenated onto the end of the token string with no separator, producing a string that looked plausible but failed auth. Caught via a `curl` check against the GitHub API before assuming the repo itself was the problem. Worth double-checking token strings copied from `project_knowledge_search` output specifically, since chunk boundaries in search results don't reliably preserve whitespace.

**Master schedule**: v139 → v140, one version, correctly archived to `Documents/Admin/Past MS/master_schedule_05aug2026_v139.md`. Canonical copy fully reflects the build above plus the two cleanup findings below.

---

## 5. Deliberately NOT fixed — found incidentally, logged, out of scope

Both found while wiring In Step's optional journal hand-off, unrelated to In Step itself:

1. **`noticing.js`/`journal-entry.js` field-name mismatch.** "Your reflections" reads `entry.body`/`entry.createdAt`/`entry.category`; `journal-entry.js` v3 actually writes `entry.text`/`entry.date`/`entry.tags`. Likely means reflections have rendered blank/undefined fields since `journal-entry.js` v3 (14 Jul).
2. **`journalEntryType` set but never read.** Both the Noticing weekly-prompt button and the new In Step "write about it" button set this flag before navigating, matching original v2 intent — but `journal-entry.js` v3 never reads it. Entries still save fine; they just don't land on a pre-selected screen.

Both logged on the master schedule findings table, not booked yet.

---

## 6. Suggested next steps

1. **On-device test pass** — the only thing standing between "built" and "closed." Specifically: complete a Solo scenario end-to-end; confirm the 3-day lock renders correctly and blocks re-entry; confirm free-tier sees the locked card and reaches `/upgrade`; confirm Personal-tier completes landing → scenario → result including the Learn Why toggle and the journal hand-off.
2. Small fix for `journalEntryType` in `journal-entry.js` — contained, low-risk, whenever there's a session for it.
3. `noticing.js`/`journal-entry.js` field-name mismatch needs a proper look — likely a real, currently-invisible bug in "Your reflections."
4. When Supabase/cohort-reporting work starts, `inStepProgress.choiceLog` is the field to build that reporting against — aggregate-only, per the design decision in Section 2.8.

---

*Build New Habits · Alongside: Move · Session Handoff · 09 Aug 2026 v1*
