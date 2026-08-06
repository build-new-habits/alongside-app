# Alongside: Move — Design Consistency Audit: Half A Findings
## 04 Aug 2026 v1

Build New Habits | Structural consistency pass, run solo while Graeme was at the gym — per the blueprint (`alongside_blueprint_design-consistency-audit_04aug2026_v1.md`), this is code-checkable findings only. Half B (screenshot review) still needs Graeme's own time and hasn't started.

---

## 1. The big one — fixed, not just flagged

**`--color-bg-elevated` was referenced 46+ times across 14 CSS files with no definition anywhere in the codebase.** Confirmed exhaustively — not in `variables.css`, not in any media-query override, nowhere. Every "elevated surface" styled with this token — nested cards in Settings, Conditions Update, Mobility & Conditioning, Today's hover states, Progress, Library, journal entries, onboarding, `gym-programme.js` — was rendering with no background at all.

This crossed from "flag for later" into "fix now" per the blueprint's own scope rule (token drift is explicitly in-scope to fix directly, not a design judgment call). Checked a real usage site (`today.css`'s settings-link hover state) to confirm the intended visual role before choosing a value — it's used as hover feedback there, the same role as the already-defined `--color-bg-hover`. Added `--color-bg-elevated: #3E4C63` to `css/base/variables.css`, matching that tier rather than inventing a new shade. Kept as its own token rather than an alias, so it can be differentiated later if a genuinely distinct "elevated, not hover" surface is ever wanted.

**Worth knowing:** this fix is live now, before Half B's screenshot review even happens — meaning several of the screens on Half B's list will look different (better) than they did when this was scoped this morning. Worth a fresh look, not comparing against old screenshots.

---

## 2. Card-pattern reinvention — confirmed, not fixed (design judgment territory)

Checked whether every screen's "card" reuses a shared base component or reinvents its own. **They reinvent, consistently:**

| Screen | Class name | Extends base `.card`? |
|---|---|---|
| `mobility-conditioning.js` | `.mc-card` | No — standalone |
| `conditions-update.js` | `.cu-card` | No — standalone |
| `coach-proposal.js` | `.cp-preview-card` | No — standalone |
| `today.js` | `.today-door` | No — standalone |
| `library.js` | `.library-card`, `.library-category-card`, `.library-session-card` (three variants in one file) | No — all standalone |
| `intention.js` | `.card` | Yes — the only one using the shared base directly |

Each was hand-built with its own padding/radius/background values rather than composing a shared base. Spot-checked the actual values: `--color-bg-card`, `--radius-lg`, and the `--space-*` scale are used consistently across all of them (no drift there), but the *structure* is duplicated five-plus times rather than shared once. This is architectural debt, not a visible bug today — the `--color-bg-elevated` gap above is what happens when this pattern goes wrong. Flagging as a real candidate for consolidation, not fixing now — this is a genuine design/engineering decision (what should the one shared card component's API look like?) that deserves its own conversation, not a solo call.

---

## 3. Micro-spacing gap in the token scale — minor, informational

Three files (`mobility-conditioning.css`, `conditions-update.css`, `library.css`) independently use `gap: 2px` — smaller than the smallest defined `--space-*` token. Worth noting as a *good* sign, not a bug: all three landed on the identical value independently, meaning the need is real and consistent, not random. Candidate for a `--space-0` or similar micro-token if this comes up again. Not urgent.

---

## 4. The originally-flagged Library hierarchy issue — may already be partially resolved

The 30 Jul complaint ("icon+label+description running together, poor visual hierarchy") pointed at Library's "At the gym"-style session lists. Checked the current markup: `library.js` v2's own changelog notes "session cards restructured slightly" — and the current structure does have properly separated `library-session-icon` / `library-session-label` / `library-session-note` spans, not run-together text. **Whether this still looks cramped is a rendering question, not a markup question** — genuinely can't resolve from code alone. Flagging for Half B to re-verify fresh rather than assuming still broken.

---

## 5. What Half B should specifically re-check given the fix in Section 1

Every screen in the blueprint's "never reviewed" list touches at least one `--color-bg-elevated` usage site — the visual baseline for the whole review has shifted since the blueprint was written this morning. Worth doing Half B after this fix, not comparing against a mental image from before it.

---

## 6. Files touched this session

| File | Change |
|---|---|
| `css/base/variables.css` | Added the missing `--color-bg-elevated` token definition |

Nothing else touched — no version bump needed on `css/base/variables.css` itself (it doesn't carry its own version header; confirmed this the same way during the original audit blueprint's file table). `sw.js` cache bump still needed since this is a real visual change shipping to users — see below.

---

*Build New Habits · Alongside: Move · Design Audit — Half A · 04 Aug 2026 v1*
