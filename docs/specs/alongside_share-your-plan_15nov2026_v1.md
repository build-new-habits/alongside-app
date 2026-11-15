# Alongside: Move — Share your plan (P-33)

## 15 Nov 2026 v1

Build New Habits | Alongside: Move | The Plan only (Free unchanged) | Ships as `alongside-v717`. No store or schema change.

---

## 0. Where this came from

Graeme, 15 Nov: *"I'd like to download my plan. That's the arc, the my week plan, the exercises, the morning and evening routines, any exercises that fit with my arc and intentions ... to share and refine with a physio or PT."* Nothing did this before: Settings' Download is a full backup for Restore, and Share your progress (D-11) reports what was done, not what is planned.

**Decisions, Graeme, 15 Nov:**

- *What works towards your arc* is in, by the arc's own rule; anything sore and notes only when switched on, with the health consent ("I approve the two recommendations").
- Mock-up v2 (`BNH-Files Product/alongside_share_plan_mockup_15nov2026_v2.html`), after a review against Stage AWARD: "That looks better".
- **A PDF made on the phone** is the file that Share… sends ("Yes").

---

## 1. Rules (each a check in `tools/verify-p33-plan-share.mjs`)

1. **Never in it**, whatever is switched on: the journal, check-in answers, weight.
2. **Off unless switched on:** the last 30 days, anything sore, notes on exercises, the name. Anything sore and notes also need the health consent; without it their switches are disabled and say why.
3. **What works towards it** labels the person's own exercises only, by the arc's own rule (an exercise's library areas → arc zones, `zonesForAreas`, against each strand's zones). It never suggests an exercise. Parts of the arc with no body areas (for example *Staying-power*) are not matched. The page says: "From what each exercise works, in the app's library. If one looks wrong, say so: it's a simple rule, not a judgement."
4. **Round trip.** The text is written the way *Add a plan you already have* reads it (`Day:`, `name | 3 x 10`, `On Home: mornings`). Read back, every exercise comes back ticked with its amount, and each list's On Home choice.
5. **Made on the phone.** Nothing is sent by the app; Share… hands the PDF to the phone's own share sheet.
6. **Rules only, no AI. No store field:** the choices live on the screen.

---

## 2. What the person sees

**Progress**, on the Plan, under *Share your progress*: **Share your plan** — "Your arc, your week and your lists, for a physio or trainer".

**Share your plan** (`plan-share`):

1. Heading, and one line: "For a physio or trainer to look over. Their changes can come back in." If something is missing: "There's no arc and no week yet, so they aren't in the page. Set them up and they'll be in it next time."
2. **Share…** (the PDF to the phone's share sheet), **Save as a file** (the PDF), **Copy as text** (if copying is not allowed, the text is shown and selected).
3. **Change what's in it** (closed): the eight choices above, as checkboxes.
4. "Your journal, check-in answers and weight are never in it. Nothing leaves this phone until you choose where it goes."
5. **Preview**: the page as it will be shared.

*Change from mock-up v2:* the actions come before the preview, because the preview is long on a phone and the buttons were a long scroll away (A-4).

**The page** (preview and PDF, from one list of blocks): My plan and the date; *My plan* (or *Sam's plan* with the name on) *in Alongside: Move, to look over with a physio or trainer*; **My arc** (aim, in my words, started and week); **What works towards it** (by part, then *Not linked to the arc*, and the rule's line); **My week**; **My exercises** (each list, *on Home, mornings*, a table of exercise and amount, and a note column when notes are on); **Saved sessions**; **What I've done, last 30 days** ("A record, not a score: nothing here is marked as behind."); **Sore today**; **Notes from my physio or trainer** (ruled lines); the scope statement.

**Nothing at all** (no arc, week, lists or saved sessions): "There's nothing to share yet …", with *Set up your week* and *My exercises*.

---

## 3. The PDF (`js/data/pdf-lite.js`)

A small PDF maker written for the app (no third-party library: jsPDF is about 400 KB). A4, the PDF's own Helvetica (real, selectable text), Windows-1252 so dashes, quotes and × print; *Page n of N*; the title (`My plan, 15 November 2026`) shown by the reader; language `en-GB`; the notes and the footer kept together on one page. It is not a tagged PDF, so a screen reader reads it less well than the page in the app, which stays the accessible version.

---

## 4. Coming back in (`plan-reader.js` v2, `plan-import.js` v3)

- A library name with a dash ("Romanian Deadlift — Light Load") is matched whole before the dash is read as a note. A name that is not a library name exactly reads as before ("Goblet squat — slow on the way down": the note).
- `On Home: mornings` / `evenings` / `any time` under a day is that day's On Home; Plan import says "On Home, mornings, as the plan says." and, on adding, puts the list On Home (P-31).

---

## 5. Files

| File | Change |
| --- | --- |
| `js/data/plan-share.js` v1 (new) | The model, the blocks, the page, the text, the PDF |
| `js/data/pdf-lite.js` v1 (new) | The PDF maker |
| `js/views/plan-share.js` v1 (new) | The screen |
| `js/views/progress.js` v35 | The row |
| `js/router.js` v56 | Route `plan-share`, tab Progress |
| `js/data/plan-reader.js` v2, `js/views/plan-import.js` v3 | Dash names; On Home lines |
| `css/components/progress-share.css` v2 | The page's parts |
| `docs/glossary.md` v7 | Share your plan, What works towards it |
| `tools/verify-p33-plan-share.mjs` v1 (new) | 42 checks |
| `sw.js` v717 | Three new files precached; last, alone |

---

## 6. Accessibility (WCAG 2.2 AA)

One h1 that takes focus; real buttons; the choices are checkboxes in a fieldset; a change keeps focus and is said in a status line; the preview is an article with headings and tables (`th` with `scope`); the ruled lines are named "Space to write"; the white page keeps its contrast in every look; nothing relies on colour.

---

## 7. Not in this release

- A tagged (accessible) PDF.
- The sore area and notes in the text are not read back in (the reader takes in movement only, H1).
