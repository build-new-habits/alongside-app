# CARD-1 — Exercise Card Progressive Disclosure
## 29 Aug 2026 v1

Build New Habits | Alongside: Move | Build blueprint. Spec stage complete, build not started.

Supersedes the all-sections-visible model in `alongside_exercise_card_complete_spec.md` v1.0 (3 May 2026), which was written against a data shape the database no longer has.

---

## 1. Why this exists

Graeme's observation, 29 Aug: the exercise card carries too much written content. Verified against `js/views/workout.js` v12. Rendered per exercise, in DOM order:

1. Role badge, name, meta tags, timer/reps target, YouTube link
2. **How to get there** — `instructions[]`, typically 4 items
3. **What to focus on** — `coaching`, one sentence
4. **Why this helps** — `why`, one sentence
5. **How heavy** — `load`, one sentence
6. Body caution — `bodyCaution(exercise)`, conditional (CORE-1)
7. Feedback control — two buttons (FEED-1)
8. **What to watch for** — `watchOut[]`, typically 4 items
9. Grounding moment, conditional
10. Session log block, conditional

Roughly fifteen lines of body prose before the optional blocks, on a phone, while holding a position. The observation is correct.

---

## 2. The fault found while speccing — independent of density

**`bodyCaution` renders below "How heavy" and above the feedback control. `watchOut` renders below the feedback control.**

`bodyCaution` is the one genuinely personalised safety line in the card. It fires when the exercise loads an area the person flagged sore *today*. It is currently roughly two screenfuls down, beneath three blocks of static prose, and `watchOut` sits below an interactive control that most people will treat as the end of the card.

This is a fault whether or not the rest of CARD-1 ships. **Safety-relevant content must precede the static explanatory content, not follow it.** Density is itself a safety failure: the more prose above the caution, the less likely it is read.

**Corrected order, non-negotiable in the build:**

1. Name, meta, target
2. `bodyCaution` — if it fires, it is the first thing after the target
3. **How to get there** (Setup)
4. One cue
5. **What to watch for**
6. Everything else, collapsed
7. Feedback control last

---

## 3. Data findings — these change the design

### 3.1 `exerciseHistory` already exists. No new store field for familiarity.

`store.js` v58, added 11 Aug as CONT-1. A map keyed by exercise id:

```
{ [exerciseId]: { n, first, last, best } }
```

`n` is times completed all-time. Absent or `0` means first encounter. All seven session types now route through `store.logActivity()`, which forwards `exerciseIds` to `recordExercises()` — workout, gym-programme, core-session, prescribed-session, quiet-session, practices, breathing-session. Familiarity will not be systematically wrong for someone who lives in one session type.

**P4 CONSTRAINT, LOAD-BEARING.** `store.js` states `exerciseHistory` is per-exercise behavioural data and is never used to comment on a person's consistency or decline. Reading it to decide how much text to render is permitted because nothing is displayed or interpreted. **The card must never say why it got shorter.** No count, no "you know this one", no "you've done this before". It simply stops explaining. Any surfacing of `n` in any form breaches P4 and must fail a gate.

### 3.2 `watchOut` is already segregated. No per-cue safety flag needed.

The 29 Aug teardown note assumed safety-relevant cues would need flagging inside the cue array. They do not. The database already separates:

- `instructions[]` — how to get into position
- `coaching` — one focus sentence
- `cues[]` — form pointers during the movement
- `watchOut[]` — what goes wrong, e.g. *"Pushing to the point of pain; a stretch should feel like a strong pull, never sharp"*
- `load` — effort-relative, never a weight (P4)
- `why` — benefit
- `description` — paragraph

Safety content is `watchOut` plus `bodyCaution`. Nothing else needs flagging.

### 3.3 The pattern already exists in two views. This standardises, it does not invent.

`core-session.js:510` and `yoga-session.js:538` already render `cues[0]` as a single line in the working view, with the full `cues[]` list in the detail view. That is precisely the "one cue during, all cues on request" model. `workout.js` does not render `cues` at all.

### 3.4 Two dormant fields, logged not fixed

- `exercise.cues` — read by `core-session`, `yoga-session`, `morning-session`. **Not read by `workout.js`, `prescribed-session.js`, `gym-programme.js`.**
- `exercise.description` — **no reader anywhere in the codebase.** Present across the database, never displayed.

Touch-once: these are recorded, not fixed here, except that CARD-1 necessarily starts reading `cues` in `workout.js`.

### 3.5 The preference belongs in `display-prefs.js`, not `store.js`

`js/display-prefs.js` v2 holds device-level accessibility preferences outside `store.js` for three stated reasons: readable before first paint, device-level rather than person-level, and surviving a store reset. A "show full instructions always" toggle matches all three — someone who needs full instructions needs them more after a reset, not less.

**Therefore CARD-1 requires no `store.js` change and no `Schema.md` change.** Schema-first does not apply.

`display-prefs.js` has a stated contract: `index.html` duplicates `DISPLAY_KEYS` and `DISPLAY_DEFAULTS` in a pre-paint inline script, and `tools/verify-disp1.mjs` asserts the two copies match. Adding a key means adding it in both places or that gate fails. It will catch the omission.

---

## 4. The model

Disclosure keyed to **phase** and **familiarity**. Nothing is managed by the person.

### Phase

| Moment | Shown |
|---|---|
| Before the timer starts | `bodyCaution` (if firing), Setup expanded, `watchOut` expanded |
| Timer running | `bodyCaution` (if firing), one cue, everything else collapsed |
| Paused | Reverts to the before-start state |

Setup self-collapses when the timer starts. The person does not dismiss it.

### Familiarity

| `exerciseHistory[id].n` | First render state |
|---|---|
| absent or 0 | Full card. Setup, all cues, `watchOut`, `why`, `load` all expanded |
| ≥ 1 | Setup expanded, one cue, `watchOut` expanded, `why` and `load` collapsed |
| ≥ 3 | Setup collapsed, one cue, `watchOut` expanded, `why` and `load` collapsed |

`watchOut` never auto-collapses on familiarity. It collapses only on the phase axis, once the timer is running, and only when `bodyCaution` is not firing for this exercise.

### Never collapses, under any condition

- `bodyCaution` — always visible whenever it fires, in all phases, at all familiarity levels
- `watchOut` — always visible before the timer starts
- Anything at all, if the person has set the full-instructions preference

---

## 5. Accessibility — WCAG 2.2 / 2.1 AA

- Real disclosure pattern. `<button aria-expanded="true|false" aria-controls="…">`, not `display:none` on an unlabelled div.
- Collapsed content stays in the DOM and in the accessibility tree.
- Collapse and expand are not motion-dependent; `prefers-reduced-motion` respected.
- Disclosure buttons ≥ 44×44px, visible focus indicator.
- The label names what is inside and how much — "What to watch for (4)" — so a screen reader user knows the cost of expanding before they do it.
- The full-instructions preference lives in Settings → Display, alongside text size and colour scheme. **Never offered on a timer and never in onboarding**, per the P3 note already in `display-prefs.js`.

---

## 6. Files — touch-once list, complete

Confirm every version header against a fresh clone before opening.

| File | Version at spec time | Action |
|---|---|---|
| `js/display-prefs.js` | 12 Aug 2026 v2 | Add `fullInstructions` key + default |
| `index.html` | confirm | Add same key + default to pre-paint duplicate |
| `js/views/settings.js` | v17+ (confirm) | Toggle in the Display panel |
| `js/views/workout.js` | 22 Aug 2026 v12 | Reorder + disclosure + start rendering `cues` |
| `js/views/prescribed-session.js` | confirm | Same |
| `js/views/gym-programme.js` | confirm | Same |
| `js/views/core-session.js` | confirm | Reorder + align to shared helper |
| `js/views/yoga-session.js` | confirm | `watchOut` ordering only |
| `js/views/practices.js` | confirm | `watchOut` ordering only |
| CSS — card/workout component file | confirm | Disclosure styling |
| `tools/verify-card1.mjs` | new | Gate |
| `sw.js` | confirm | **Last, alone, own commit, cache bump** |

Six views render `watchOut`; four render the full card structure. **Strong recommendation: extract one shared card renderer** rather than making the same edit in six files. Six divergent copies is how `cues` came to be rendered in three views and not the other three.

---

## 7. Gate — `tools/verify-card1.mjs`

Every assertion needs a reversal test that fails before it is trusted. Five gates were found in August that had never failed and therefore proved nothing.

| # | Assertion | Reversal test |
|---|---|---|
| 1 | `bodyCaution` output appears before the Setup section in DOM order | Move it after Setup → must fail |
| 2 | `bodyCaution` renders at every familiarity level and in every phase | Fixture with `n = 99`, timer running → must still render |
| 3 | `watchOut` renders expanded before the timer starts | Fixture pre-start with `n = 99` → must render |
| 4 | No numeric from `exerciseHistory` reaches rendered output (P4) | Inject `n` into the template → must fail |
| 5 | `fullInstructions = true` renders every section expanded | Fixture with preference on, `n = 99`, timer running → all sections expanded |
| 6 | Every disclosure control carries `aria-expanded` and `aria-controls` | Strip one attribute → must fail |

**Fixture fault check for each:** does the fixture actually reach the branch it claims to test? Assertion 4 in particular must reach the render path, not a stub.

No negative distance windows. No `A must not appear within N chars of B` — that pattern went silently green four times in August.

---

## 8. Build order

1. `display-prefs.js` + `index.html` together — `verify-disp1.mjs` must pass before anything else
2. Shared card renderer extracted, `workout.js` moved onto it
3. `verify-card1.mjs` written, all six reversals confirmed failing
4. Remaining five views moved onto the shared renderer
5. `settings.js` toggle
6. CSS
7. Full gate suite — `npm install jsdom` first, or the `verify-*.mjs` gates exit non-zero silently
8. `sw.js` last, alone, cache bump

---

## 9. Open for Graeme

1. **Shared renderer, or six edits?** Recommend shared. It is more work today and less work forever, and it closes the `cues` inconsistency as a side effect.
2. **Familiarity thresholds — 1 and 3.** Placeholder numbers, not evidence-based. Recommend shipping them and revisiting after beta feedback rather than agonising now.
3. **Does `description` get a reader, or get retired?** Out of CARD-1 scope. Logged.

---

## 10. Not in scope

- Bend's per-exercise time adjustment (− 0:30 +) and the coloured-circle illustration system. Both noted in master schedule v234 as folded into CARD-1's scope question; both are **out** of this build. Separate items.
- SENSORY-1a transition control. Separate row, beta scope.

---

*Build New Habits · Alongside: Move · CARD-1 Blueprint · 29 Aug 2026 v1*
