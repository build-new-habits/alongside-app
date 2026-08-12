# Light Mode — removed CSS, preserved
## 12 Aug 2026 v1

Build New Habits | Alongside: Move | A11Y-2

Removed from `css/base/global.css` on 12 Aug 2026. Kept here rather than deleted, matching the `Archive/` philosophy: stale and superseded material is retained, not destroyed.

**Nothing about this removal changes the live app.** Every rule below was scoped under `html.light-mode`, and nothing in any JS file or `index.html` has ever added that class. Zero live effect, confirmed before removal.

---

## Why it was removed

### 1. It was unreachable

No `light-mode` class is set anywhere in the codebase. No Settings toggle exists, despite the block's own comment stating *"User toggle in Settings. Default: dark."* The comment described an intention, not a feature.

This is the **P6 defect** — content that exists, is written to a standard, and that nothing in the product can ever select. Ninth instance recorded.

### 2. It would not have worked if switched on

**Six tokens are defined in the dark palette and never overridden here:** `--color-bg-deep`, `--color-bg-elevated`, `--color-bg-hover`, `--color-border-focus`, `--color-border-light`, `--color-text-inverse`.

`--color-bg-elevated` and `--color-bg-hover` are both `#3E4C63` — dark slate. With light-mode text applied on top:

| Light-mode text on `#3E4C63` | Contrast | AA 4.5:1 |
|---|---|---|
| `--color-text` `#0f172a` | 2.06 | ✗ |
| `--color-text-secondary` `#334155` | 1.19 | ✗ |
| `--color-text-muted` `#64748b` | 1.82 | ✗ |

**56 CSS rules set an elevated background.** Every one of them would have rendered near-invisible dark-on-dark text. 1.19:1 is worse than the A11Y-1 failure this was found alongside, by a wide margin.

### 3. It was abandoned mid-build

Thirty-seven lines covering four components — `.card`, `.app-nav`/`.bottom-nav`, `.checkin-slider`, `.settings-field-input` — against 25+ component stylesheets. It also defines `--color-bg-surface`, a token that exists **only inside this block** and is read by nothing anywhere in the app.

### 4. Why not simply fix the six tokens

Because that produces a *reachable* broken light mode instead of an unreachable one, which is strictly worse. Overriding six tokens does not restyle 25 component stylesheets. A working light mode is a real project, not a patch.

---

## The open question this does NOT close

**Light mode is worth having for this product, and that decision stays open.**

Dark-only is a genuine accessibility limitation, not a preference. Light text on dark surfaces produces halation for people with astigmatism — the text appears to smear — and light sensitivity runs in both directions. Alongside: Move is built for neurodivergent adults, people navigating hormonal change, and people with chronic conditions and burnout. This is exactly the audience for whom a display-mode choice is a functional matter rather than a taste one.

**What a real implementation needs, so it is not re-derived:**

1. All eleven surface and text tokens overridden, not five — including the six listed above
2. `tools/contrast-check.mjs` extended to run its full matrix against **both** palettes, gating on both
3. A component sweep: every stylesheet that hardcodes a hex rather than using a token
4. A Settings control, and a persisted store field
5. `prefers-color-scheme` respected as the initial default, with the person's explicit choice overriding it

**Not a bug fix. A scoped feature, with an accessibility rationale strong enough to justify the scope.** Belongs in the beta conversation, not in a cleanup session.

---

## The removed CSS, verbatim

```css
/* ============================================
   LIGHT MODE THEME
   Applied when <html class="light-mode">
   Default: dark. User toggle in Settings.
   ============================================ */

html.light-mode {
  --color-bg:          #f8fafc;
  --color-bg-card:     #ffffff;
  --color-bg-surface:  #f1f5f9;
  --color-border:      #e2e8f0;
  --color-text:        #0f172a;
  --color-text-secondary: #334155;
  --color-text-muted:  #64748b;
  /* Primary teal stays consistent */
  --color-primary:         #0d9488;
  --color-primary-glow:    rgba(13, 148, 136, 0.08);
}

html.light-mode .card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
}

html.light-mode .app-nav,
html.light-mode .bottom-nav {
  background: rgba(255,255,255,0.95);
  border-top-color: #e2e8f0;
}

html.light-mode .checkin-slider {
  background: #e2e8f0;
}

html.light-mode .settings-field-input {
  background: #f8fafc;
  color: #0f172a;
}
```

**Note if this is ever revived:** the light-mode palette above was written against the *pre-A11Y-1* dark palette. `--color-text-secondary` and `--color-text-muted` changed on 12 Aug 2026. Start from the current tokens in `css/base/variables.css` v2, not from this block.

---

*Build New Habits · Alongside: Move · A11Y-2 · 12 Aug 2026 v1*
