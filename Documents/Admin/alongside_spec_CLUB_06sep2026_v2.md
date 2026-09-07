# Alongside: Move — CLUB specification
## 06 Sep 2026 v2

Build New Habits | The Plan is a club, not a coach you surrender to.

Specification only. No code exists. Build order at §9.

**Supersedes v1 of the same date.** v1 is archived, not deleted, because three of its decisions were reversed and the reversals are the useful part of this document. Each is marked 🔴 **REVERSED FROM v1** where it appears.

---

## 1. What this replaces, and what proved it needed replacing

**LOBBY-1c was complete trust taken to its conclusion.** One button, the coach decides. On the handset it produced a screen Graeme could not use and could not leave, and the good engine became unreachable for four days.

The fault was collapsing two questions into one:

| Question | Who answers it |
|---|---|
| Where am I going? | The coach, through the arc |
| What do I fancy today? | **The person** |

*Free is today, the Plan is the arc* already separated them. **"I might have some energy, what do I fancy" is not indecision to be solved. It is the person turning up.**

Graeme, 06 Sep: *"I think the plan was to give complete trust to the coach for arc, but that doesn't fully work. I think Plan is the full club."*

---

## 2. The one design idea

**The rooms sort by how much the coach leads.** Home's eight tiles sort by body part, which is a filing system. A club sorts by what kind of session you want to be in, and that is a relationship, not a muscle group.

| Room | Who holds the shape of the session |
|---|---|
| **Guided class** | The class holds it. Fixed, sequenced, shared |
| **Personal training** | The coach holds it, around how you are today |
| **Your own** | You hold it. Yours, saved, reusable |
| **Quick build** | Nobody yet — assembled to today's constraints |

🔴 **REVERSED FROM v1 — two of the four names have changed.**

**"PT" is now "Personal training".** v1 deferred this to beta testers. That was the wrong call: *personal trainer* already carries fitness-culture baggage for an audience defined by having been failed by fitness culture, and **an abbreviation makes it worse, not lighter**. An unexplained two-letter label is exactly the demand this product should not be making.

**"Freestyle" is now "Your own".** Freestyle is a swimming stroke and a vague promise. *Your own* says whose it is, which is the entire point of the room.

---

## 3. THE CLARITY PRINCIPLES. These govern everything below.

The audience includes neurodivergent adults, people navigating hormonal change, and people with long-term conditions. **v1 was written for a design review and failed all three.** These five principles replace its aesthetic rules.

### 🔴 3.1 Nothing is learned by exploring — REVERSED FROM v1

v1 said: *"No room is ever explained on screen. You learn what a room is by entering it once."*

**That is wrong, and the Disney comparison argues against it.** Disney over-signals. Every ride has a sign, a wait time, a height requirement, and a themed queue that tells you the genre before you commit to anything. **The bins work because the signposting around them is relentless and consistent, not because the park withholds information.** v1 used "granular detail" to justify removing it.

**"Find out by doing" is an implicit demand.** It costs executive function to explore, it is a barrier under demand avoidance, and uncertainty about what is behind a door is a genuine obstacle for autistic users rather than a mild preference.

🟢 **Every room carries a permanent one-line statement of what it is, in a fixed slot, forever.** Not a first-run tooltip. Not dismissible.

### 🔴 3.2 Cut sentences, not facts — REVERSED FROM v1

v1 turned *"very much less words"* into word ceilings: 2 words for a title, 6 for a state line, 12 before an action.

**Wrong metric. Ambiguity costs more than words do.** Six words producing *"Steady Legs"*, when the person needs to know it is 28 minutes, at home, needs nothing, and works legs — that is not brevity, it is withheld information dressed as restraint.

🟢 **The rule is: no sentence does work a fact could do.** Prose is what gets cut. Facts are what stay.

### 🔴 3.3 One grammar, not four — REVERSED FROM v1

v1 gave each room its own internal grammar — sequence, speech, authorship, assembly — and differentiated them by form, density and typographic rhythm.

**That is four things to learn at once, and it relies on implicit cues being picked up.** Differentiating by feel is precisely what fails people who do not read implicit signal.

🟢 **Every room card has the same five slots, in the same order, in the same positions.** Learn it once and it never surprises you. Texture may reinforce inside a room; **it may never be the only signal, and it may never move a slot.**

### 3.4 Two targets, never one

A single tap that launches a session is an accidental-activation risk and a commitment made before you know what you agreed to.

🟢 **A filled button starts it. An outline button opens the detail in place.** In place, so no navigation, so the depth rule holds. **Both are ≥44px (WCAG 2.5.8).**

### 3.5 Every cost is stated before it is paid

No toll appears mid-flow. If the check-in stands between you and a session, the card says so, says how long it takes, and says what you get for it — before you tap.

---

## 4. The depth rule is not broken

> **The depth rule:** from Home, at most one screen before somebody is moving, not counting the check-in. If a choice needs its own screen it belongs in Library. Kills doors-into-doors as a class.

Graeme, 3 Sep: *"I'm worried we might have too many doors going into other doors."*

**A room is not a screen you pass through.** Each card carries today's answer inside it, and the start button starts it. The preview expands **in place**. No room navigates before you are moving.

⚫ **Acceptance test, per room:** if a room's resting state cannot answer *"what would I get right now"* without being asked, that room is a corridor and the count comes down.

---

## 5. The card, slot by slot

Identical on all four rooms. **Slots never move, never reorder, never disappear.**

| # | Slot | Content | Rule |
|---|---|---|---|
| 1 | **Room name** | Guided class · Personal training · Your own · Quick build | Sentence case. Never abbreviated |
| 2 | **What it is** | One line. *"A set course. Same shape each week."* | **Permanent.** Not dismissible |
| 3 | **Today's option** | The actual thing, by its name | The object of the decision |
| 4 | **The facts** | **Stacked, one per line, same four in the same order:** how long · where and what kit · what it works · where you are in it | 🔴 **No middle-dot meta strings.** `28 MIN · 7 EXERCISES` scans as one blob and is a named generic tell |
| 5 | **The action** | Filled button, verb plus the name — *"Start Steady Legs"*. Outline button below where a preview exists | ≥44px each |

### Recommendation

🔴 **REVERSED FROM v1.** v1 removed the recommendation with the gold banner. **The banner was the problem; recommending was not.** A clear recommendation reduces decision load, which is what this audience needs most.

🟢 A quiet accent line — *"Suggested for today"* — plus a 2px accent border. **No caps, no gold band, and it says why in a handful of words.**

### Type and motion

One family, existing `--font-family`, no display face. **No all-caps labels anywhere.** Reduced motion respected via existing handling. **No entry animation on any card** — v1's one orchestrated moment is withdrawn; a screen that assembles itself is a screen you cannot read while it moves.

### 🔴 Colour still carries meaning, not wayfinding

`--color-scale-1..10` is energy. `--color-danger` is a sore zone. `--color-warning` is caution. `#B8970A` is the paid tier. **Somebody learning that amber means "be careful with this movement" must not also learn it means "you are in a room."** Rooms are told apart by name and by slot 2, which is what those slots are for.

---

## 6. The four rooms

### 6.1 Guided class — *"A set course. Same shape each week."*
Today's class, its facts, position in the course. Preview lists the movements.
**Empty state:** the card becomes the chooser, inline, with the class options on the card.
🔴 **The twelve-week programme picker moves here from onboarding** (§7).
Substantially built: `programmes.js`, `programmeEngine.js`, chapters.

### 6.2 Personal training — *"I pick it, around how you are today."*
**Before check-in:** the card names the cost — four questions, about a minute, then a suggestion — and the action is *"Check in"*. **After:** the coach's suggestion with the same four facts and *"Start …"*.
**Location — home, gym, outside — is chosen here**, because it changes what the coach can offer and is the one constraint the coach cannot infer.
🔴 **Requires TWO-ENGINE and cannot ship without it.** `coach-proposal.js` builds through `workoutGenerator.js`, three hardcoded type names, reading none of `sessionVariety`, `exercisePreferences` or SECTION-RULES. **A coach-led room on the weaker engine is the exact fault this work exists to correct.**

### 6.3 Your own — *"Sessions you wrote. Saved, yours to edit."*
Most recent first, one on the card, the rest behind a counted outline button — *"Your other 2 sessions"*, **never "More"**.
**Empty state:** *"Build your first"*, with what that involves in one line.
🔵 **The only genuinely new build.** Established when SWAP-1 caught the conflation between deleting the flat picker and deleting self-authoring; the case on record is Graeme's daughter, a national-standard sprinter, writing her programme on paper.
**New store fields — schema before code.**

### 6.4 Quick build — *"Tell me how long. I'll fill the rest in."*
One question, four time chips. **The assumptions it has already made are visible beneath them** — where, what kit — with *"You can change both next"*. Nobody discovers an assumption after committing to it.

⚫ **Watch: Your own and Quick build sit close together.** Slot 2 separates them — *sessions you wrote* against *tell me how long* — which is a stronger separator than v1's textures were.

---

## 7. Free is unchanged, minus one thing

**Free keeps the screen it has:** the question, the two groups, the eight tiles, the coach-picks fallback. It works, Graeme likes it, and *structure is the free product* because nobody holds the thread for a free user. **Free is the drop-in.**

🔴 **The one removal — PLAN-PICKER-TIER, measured:** `js/views/onboarding/plan-select.js` has no tier check anywhere in the file, and `programmeEngine.js` (49 references) and `workoutGenerator.js` read `activeProgramme` with no tier gate either. Free has had chapter progression, week advancement and phase bias since June. **Same class as DATA-1b: one system gated carefully while its twin sat open.**

🔴 **COMMIT-COPY, fixed by the move rather than by rewording:** *"3 sessions a week"* is a frequency commitment asked of somebody who has not moved once — **streak-shaped, on a product with no streaks** — set when the coach knows least. *"Full commitment — for when you are ready to push"* is off-voice; this product does not push. Both disappear when the picker asks inside Guided class, after there is evidence.

---

## 8. Progress remembers

Choices, preferences and patterns across all four rooms. **Displays, never interprets** — P4 holds. **No streaks, ever.** No comparison to other people.

---

## 9. Build order

| # | Item | Why here |
|---|---|---|
| 1 | **TWO-ENGINE** | Personal training cannot be designed around a generator that knows three session types |
| 2 | **DURATION-STR** | `rest` is a string on 99 of 551 entries; `calculateDuration()` returns NaN and `applyDurationCap()` silently returns untrimmed. **Quick build is a time-driven room and slot 4 leads with "how long"** |
| 3 | **CLUB-SHELL** | The four cards, five slots, both targets. Depth-rule acceptance test applies |
| 4 | **PLAN-PICKER-TIER** | Picker moves into Guided class. Fixes the tier leak and COMMIT-COPY in one change to one screen |
| 5 | **YOUR-OWN** | New store fields; **schema first** |
| 6 | **QUICK-BUILD** | Visible constraints replacing question screens |
| 7 | **CONSTRAINT-CLAIM** | *"I've worked around that"* at pain 6, where nothing is. Belongs with the room where the coach speaks |
| 8 | **HATCH-OVERLAP** | The escape hatch obscures content on the exercise card |
| 9 | **PROGRESS** | Remembering across the rooms |

⚠️ **Outstanding elsewhere, not in this list:** `DEV_PANEL_ENABLED = true` at `settings.js:463`, which must be fixed before any tester install; PAR-Q+ for RED-FLAG (response in hand, held); the clinical pack, unsent; HMRC (approved, paperwork pending); legal policies, Graeme's active workstream.

---

## 10. Reservations

🟢 **Resolved since v1:** the "PT" naming, and whether rooms are explained on screen. Both were deferred in v1 and both were wrong to defer.

🟡 **The screen is taller** — roughly one and a half phone screens. **Accepted deliberately:** a predictable scroll costs less than a hidden room, and slot order means you can scan for the same fact in the same place on every card.

🟡 **Guided class and Personal training could still read as the same thing** to somebody who has used neither. Slot 2 separates them, which is stronger than v1's textures. **Still the assumption most worth testing early on a handset.**
