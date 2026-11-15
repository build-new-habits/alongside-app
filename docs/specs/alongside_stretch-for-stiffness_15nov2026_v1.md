# Alongside: Move — Stretch for stiffness (P-32)

## 15 Nov 2026 v1

Build New Habits | Alongside: Move | The Plan only (Free unchanged) | Ships as `alongside-v716`, after P-31 (`alongside-v715`). No store or schema change.

---

## 0. Where this came from

On 15 Nov Graeme had a stiff shoulder, and a stiff lower back, hip and IT band: *"Instead of not working it, it needs stretching and massaging. I would like the coach to take into consideration that when a user has a sore hip or shoulder or back or muscle anywhere, sometimes stretching it comfortably can be a method to help. Avoiding it does little to help."*

**Decisions, Graeme, 15 Nov:**

- **The person chooses it.** The check-in's sore areas never pick what to stretch (W5-14, 3 Oct, stands: a target taken from a sore area read as treatment).
- **It lives inside Stretch.** No new way in on Home.
- **It asks how stiff.**
- **The full range** of mock-up v2 (`BNH-Files Product/alongside_stretch_stiffness_mockup_15nov2026_v2.html`): all six screens. Graeme checked the approach against the guidance he was given by the clinical reviewer.

---

## 1. The boundary

This is everyday stiffness, which the app's scope ("everyday fitness ... works around minor aches") already covers. It must not drift into treating anything. Each line below is a check in `tools/verify-p32-stretch-stiffness.mjs`:

1. **A sore area never sets anything here.** With areas sore at the check-in, How does it feel today? still starts at *Fine, just a stretch*, and nothing is ticked under Anywhere in particular.
2. **It hurts never leads to a stretch.** Its screen has no routine and no Start; it goes to the check-in, whose sore rules work around the area.
3. **No treatment words.** None of *treat, relieve, fix, cure, heal, recover, rehab, injury, therapy, pain relief* in this feature's words.
4. **Nothing new is kept.** The answers live in the screen and in memory for one finish; no store field, no score, no history.
5. **Rules only, no AI.** Every behaviour below is a plain rule.
6. **Sore rules unchanged.** A routine still leaves out what a sore area rules out (`markSore`), the gentle start included.

---

## 2. What the person sees

### 2.1 The Stretch door, after the area (`path.js` step `routines`)

Above *Can you get down to the floor today?*:

- **How does it feel today?** One choice: **Fine, just a stretch** (chosen to start), **A little stiff**, **Quite stiff**, **Very stiff**.
- **Anywhere in particular?** *(pick any)* Checkboxes, by area (none for Whole body):

| Area | Choices |
| --- | --- |
| Neck and shoulders | Shoulders, Upper back, Chest |
| Back and hips | Lower back, Hips, Glutes, Upper back |
| Legs | Hamstrings, Front of the thigh, Outside of the thigh, Calves |

A routine that works a ticked spot (any of its movements lists one of the spot's library areas) says **Works your hips** (or *the outside of your thigh*, and so on, joined with *and*) and comes first, in the existing order otherwise. **A fresh one for me** reads *Built by the coach for your hips*, and is built with that spot's stretch zones.

At **Quite stiff**: "Take each one slowly, and ease off if it tightens up."

At **Very stiff**: "Very stiff usually eases as you move. Each of these starts with two minutes of gentle movement, and the holds are shorter. It should feel easier as you go, not worse." Each routine's minutes include the two minutes.

Last row: **It hurts, rather than feels stiff**, with "Stretching shouldn't hurt. What to do instead".

### 2.2 It hurts (step `hurts`)

Heading **It hurts**. "Stretching shouldn't hurt. A stiff area usually feels better as you move; one that hurts needs something different." "Tell the check-in how sore it is. The app then leaves out the movements likely to make it worse, and if it's bad, it offers something gentler or a rest." Button **Tell the check-in**; row **Stretch somewhere else**. A note: "If it's getting worse or still there after a few days, or you have numbness, tingling or pain spreading down an arm or leg, stop and speak to a GP, physio or other medical professional. For something sudden or severe, call NHS 111, or 999 in an emergency." (The scope statement's and the Safeguarding Policy's own routes.)

### 2.3 The routine, before Start (step `prog`, Stretch door)

Every Stretch routine: "Ease into each stretch until you feel a gentle pull, about 3 out of 10. Breathe out slowly as you hold. Stop if it pinches, hurts or feels electric."

At **Very stiff** the routine starts with a two-minute gentle movement, standing or seated, for its area, unless it already holds it:

| Area | Gentle start |
| --- | --- |
| Whole body, Legs | Supported Standing March (`chair-supported-march`) |
| Back and hips | Standing Hip Circles (`hip-circles-standing`) |
| Neck and shoulders | Seated Shoulder Rolls (`seated-shoulder-rolls-warmup`) |

and each later step's note says **"Shorter holds: about 20 to 30 seconds, then again"**. The meta line adds "Very stiff: starts gently".

### 2.4 At the end (`plan-finish.js`)

When a Stretch routine was started with a stiffness other than *Fine*: **How do your *area* feel now?** with **Easier**, **About the same**, **Worse** (optional; nothing kept).

- **Easier:** "Glad it helped. A short stretch a few times a day often does more than one long one." and **Put this on Home**: the routine is added to My exercises as a list under its own name (each movement for its seconds, *each side* where it says so) and set to **On Home: Any time** (P-31). If a list of that name is already there, it is put on Home as it is. Then "*Name* is on Home, under Little and often."
- **About the same:** "That's fine. A short one later in the day is another option."
- **Worse:** "Leave stretching that area for today. If it hurts, tell the check-in how sore it is, and the app will work around it."

---

## 3. Files

| File | Change |
| --- | --- |
| `js/data/stretch-stiffness.js` v1 (new) | Levels, spots, the rules (tags and order, the gentle start, the lines), the boundary's words, Put this on Home |
| `js/views/path.js` | The two questions, It hurts, the ease-in line, the Very stiff routine, the hand-over to the finish |
| `js/views/plan-finish.js` v6 | How do your *area* feel now?, Put this on Home |
| `css/components/path.css` v15 | The *Works your* tag, from tokens |
| `docs/glossary.md` v6 | The new words |
| `tools/verify-p32-stretch-stiffness.mjs` v1 (new) | Every rule and every boundary line |
| `sw.js` v716 | The new file precached, hashes; last, alone |

No store field and no schema change: the answers are in the screen and, for one finish, in memory (`router.stretchCheck`).

---

## 4. Accessibility (WCAG 2.2 AA)

- Both questions are fieldsets with legends; the choices are real radio buttons and checkboxes in the existing `.path-seg` style, so they are labelled, keyboard-reachable and not colour alone (a checked choice is filled, bold and announced).
- A change keeps focus on the choice and says the result in the existing live region ("Showing the ones for your hips first.").
- *Works your …* is text inside the row's button, so it is part of its name.
- It hurts is a heading, words and real buttons; the note is text, not colour.
- Targets at least 44 px, the app's tokens in every look.

---

## 5. Not in this release

- **New library moves** for the outside of the thigh (only *After a run or ride* works it) and the neck (no neck area in the library). New moves go to the clinical reviewer.
- The ease-in line inside the player and on the coach's own stretch sessions (coach-proposal).
- Free: unchanged, as Stage AWARD's rule, unless Graeme says otherwise.
