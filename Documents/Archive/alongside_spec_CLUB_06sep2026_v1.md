# Alongside: Move — CLUB specification
## 06 Sep 2026 v1

Build New Habits | The Plan is a club, not a coach you surrender to.

Specification only. No code exists. Build order and dependencies at §8.

---

## 1. What this replaces, and what proved it needed replacing

**LOBBY-1c was complete trust taken to its conclusion.** One button, the coach decides. On the handset it produced a screen Graeme could not use and could not leave, and the good engine became unreachable for four days.

The fault was collapsing two questions into one:

| Question | Who answers it |
|---|---|
| Where am I going? | The coach, through the arc |
| What do I fancy today? | **The person** |

The governing sentence already separated them — *free is today, the Plan is the arc*. **"I might have some energy, what do I fancy" is not indecision to be solved. It is the person turning up.**

Graeme, 06 Sep: *"I think the plan was to give complete trust to the coach for arc, but that doesn't fully work. I think Plan is the full club."*

---

## 2. The one design idea

**The rooms sort by how much the coach leads.** Home's eight tiles sort by body part, which is a filing system. A club sorts by what kind of session you want to be in, and that is a relationship, not a muscle group.

| Room | Who holds the shape of the session |
|---|---|
| **Guided class** | The class holds it. Fixed, sequenced, shared |
| **PT** | The coach holds it, with you there |
| **Freestyle** | You hold it. Yours, saved, reusable |
| **Quick build** | Nobody yet — it is assembled to today's constraints |

That is the whole taxonomy. It does not need explaining on screen, which is the test of whether it is right.

---

## 3. THE DEPTH RULE IS NOT BROKEN. This is the load-bearing decision.

> **The depth rule:** from Home, at most one screen before somebody is moving, not counting the check-in. If a choice needs its own screen it belongs in Library. Kills doors-into-doors as a class.

Graeme, 3 Sep: *"I'm worried we might have too many doors going into other doors."*

**Four rooms would break this if a room were a screen you pass through.** It is not.

### 🟢 The card IS the room's front of house

Each room card on Home already carries **today's answer inside it**. Tapping the answer starts the session. You never land on a menu.

```
┌──────────────────────────────────────┐
│  GUIDED CLASS          week 3 of 12  │   ← the room
│  ────────────────────────────────    │
│  Steady Legs                    28m  │   ← today's answer, tappable
└──────────────────────────────────────┘
```

One tap from Home to moving. The rule holds exactly as written.

**This is the Disney point applied literally.** A door in a themed land tells you what is behind it before you open it, and you enter by choosing, not by browsing. A card that says "Guided class →" and lands you on a list is a corridor. A card that says "Steady Legs, 28 minutes" and starts it is a door.

### ⚫ The consequence, accepted deliberately

A room card must be able to answer *"what would I get right now"* without the person asking. Every room therefore needs a **resting state** and an **empty state**, specified per room below. **A room that cannot answer becomes a corridor, and a corridor breaks the rule.** That is the acceptance test for each room.

---

## 4. The granular design system

### 🔴 The rooms do NOT differ by colour, and the reason is the whole point

Colour already carries meaning in this product. `--color-scale-1` to `-10` is energy. `--color-danger` is a sore zone. `--color-warning` is caution. `#B8970A` is the paid tier.

**Spending colour on wayfinding would corrupt a semantic system that safety depends on.** Somebody learning that amber means "be careful with this" must not also learn that amber means "you are in the PT room."

So the palette is unchanged and shared. **The rooms differ by form, density and typographic rhythm.** That is harder and it is correct.

### The four textures

Each room's texture comes from *who holds the session*, which is the same axis the taxonomy uses. Nothing is decorative.

| Room | Texture | Expressed as |
|---|---|---|
| **Guided class** | **Sequence** — you are somewhere in something | Ordinal position always visible (`week 3 of 12`). Left spine rule down the card. Tight leading. The only room where numbers appear as chrome, **because it is the only room where position is real** |
| **PT** | **Speech** — a person is talking to you | No card furniture inside. The coach's line IS the content, in the existing check-in bubble form. One action beneath it. Generous leading, ragged right, no labels |
| **Freestyle** | **Authorship** — this is yours | Your titles at full weight, set as a list not a grid. Notebook rhythm: rule between items, no boxes. Editable affordance visible at rest (a quiet pencil, not a menu) |
| **Quick build** | **Assembly** — parts clicking into place | Chips, not cards. Constraints visible and live (time · place · kit). The frame fills in front of you as you tap. The only room with visible state change before you commit |

### 🔴 Copy budget — non-negotiable, per Graeme's "very much less words"

| Surface | Ceiling |
|---|---|
| Room card title | 2 words |
| Room card state line | 6 words, and it must be **live state**, never a description |
| Inside a room, before an action | 12 words |
| Coach speech in PT | 25 words. **This is the only place in the club with a sentence** |

**No room is ever explained on screen.** You learn what a room is by entering it once. A description under a room name is the tell that the name failed.

⚫ **Existing copy rules still bind:** no internal terms; every offer answers what is it → what would it do for me → how do I get it; read-it-cold. *Arc*, *anchor*, *novelty*, *variety* and *room* are ours and none appears on screen.

### Type and motion

- One family, the existing `--font-family`. **No display face.** A second face here would be the templated move.
- No all-caps labels. The current `HIGHLY RECOMMENDED` gold banner and `33 MIN · 7 EXERCISES` meta strings both go — they are template chrome, and the middle-dot meta string is a named generic tell.
- Numerals appear as chrome in **Guided class only**. Everywhere else they are content.
- **One orchestrated motion moment in the whole club:** Quick build's frame assembling as constraints are tapped. That motion answers an action and shows what changed. Nothing else animates on entry.
- Reduced motion respected throughout; existing `REDUCED_MOTION` handling reused, not reimplemented.

---

## 5. The four rooms in detail

### 5.1 Guided class — the coach leads fully

**Card at rest:** class name, duration, ordinal position.
**Tap:** starts today's class. No intermediate screen.
**Empty state (no programme chosen):** the card becomes the chooser — *"Pick a class"* with the three programme options **inline on the card**, not on a screen behind it.

🔴 **This is where the twelve-week programme picker moves to.** It leaves onboarding entirely (see §6). Chosen when you enter the room, not before you have moved once.

**Inside:** the existing programme session. Substantially built — `programmes.js`, `programmeEngine.js`, chapters, week advance.

### 5.2 PT — the coach guides you, wherever you are

**Card at rest:** the coach's line for today, and one action.
**Tap:** starts the session the coach just described.
**Before check-in:** the card carries the check-in as its action, and says why in ≤6 words. The check-in is the price of entry and is named as one, never sprung.

🔴 **PT requires TWO-ENGINE and cannot ship without it.** `coach-proposal.js` currently builds through `workoutGenerator.js`, whose entire type vocabulary is three hardcoded names and which reads none of `sessionVariety`, `exercisePreferences` or SECTION-RULES. **A coach-led room running the weaker engine is the exact fault this whole piece of work exists to correct.**

**Location is a PT-level choice, not a session-level one** — home, gym, outside. It belongs here because it changes what the coach can offer, and it is the one constraint the coach cannot infer.

### 5.3 Freestyle — you lead

**Card at rest:** your saved routines, by your names. Most recent first, capped at three on the card.
**Tap a routine:** starts it.
**Empty state:** *"Build your first"* — one action, no explanation.

🔵 **The only genuinely new build.** Already established in principle: SWAP-1 recorded self-authoring explicitly when Graeme caught the conflation between deleting the flat candidate picker and deleting build-your-own. The case on record is his daughter, a national-standard sprinter, writing her programme on paper.

**Requires new store fields** — saved routines with names, contents and last-used. **Schema before code.**

### 5.4 Quick build — the coach hands you a frame

**Card at rest:** three time chips.
**Tap a time:** the frame assembles — place and kit prefilled from what it already knows, adjustable, and the session builds from there.

Close to what `session-builder.js` already does. **The change is that the constraints are visible and live rather than a sequence of question screens.**

⚫ **Watch: Freestyle and Quick build sit close together.** Authoring something you keep, versus generating a scaffold for today. The distinction is real and the textures make it legible — a notebook against a set of chips — but it must be felt in a second, not read.

---

## 6. Free is unchanged, minus one thing

**Free keeps the screen it has:** the question, the two groups, the eight tiles, the coach-picks fallback beneath them. It works, Graeme confirmed he likes it, and *structure is the free product* because nobody holds the thread for a free user. **Free is the drop-in.**

**The one removal:** the twelve-week programme picker leaves onboarding. It is the paid product and has been given away since June.

🔴 **PLAN-PICKER-TIER, measured:** `js/views/onboarding/plan-select.js` has no tier check anywhere in the file. `programmeEngine.js` (49 references) and `workoutGenerator.js` read `activeProgramme` with no tier gate either, so free has been getting chapter progression, week advancement and phase bias. **Same class as DATA-1b: one system gated carefully while its twin sat open beside it.**

🔴 **COMMIT-COPY, fixed by the move rather than by rewording:** *"3 sessions a week"* is a frequency commitment asked of somebody who has not yet moved once — **streak-shaped, on a product with no streaks** — and set at the moment the coach knows least. *"Full commitment — for when you are ready to push"* is off-voice; this product does not push. Both disappear when the picker moves into Guided class and asks after there is evidence.

---

## 7. Progress remembers

Choices, preferences and patterns, across all four rooms. **Displays, never interprets** — P4 holds. **No streaks, ever.** No comparison to other people.

Depends on the rooms existing, so it is last.

---

## 8. Build order and dependencies

| # | Item | Why here | Depends on |
|---|---|---|---|
| 1 | **TWO-ENGINE** | PT cannot be designed around a generator that knows three session types. Everything downstream assumes one engine | — |
| 2 | **DURATION-STR** | `rest` is a string on 99 of 551 entries; `calculateDuration()` returns NaN and `applyDurationCap()` silently returns untrimmed. **Quick build is a time-driven room and cannot be built on maths that returns NaN** | — |
| 3 | **CLUB-SHELL** | Home's four cards, the textures, the resting and empty states. The depth-rule acceptance test applies here | 1 |
| 4 | **PLAN-PICKER-TIER** | The picker moves into Guided class. Fixes the tier leak and COMMIT-COPY in one change to one screen, not two | 3 |
| 5 | **FREESTYLE** | New store fields; **schema first** | 3 |
| 6 | **QUICK-BUILD** | Reshapes the existing builder flow into visible constraints | 1, 2, 3 |
| 7 | **CONSTRAINT-CLAIM** | *"I've worked around that"* at pain 6, where nothing is worked around. Belongs with PT, which is where the coach speaks | 1 |
| 8 | **HATCH-OVERLAP** | The escape hatch obscures content on the exercise card | — |
| 9 | **PROGRESS** | Remembering across the rooms | 3–6 |

⚠️ **Not in this list and still outstanding elsewhere:** `DEV_PANEL_ENABLED = true` hardcoded at `settings.js:463`, which must be fixed before any tester install; the PAR-Q+ call for RED-FLAG (Graeme has a response, held pending this work); the clinical pack, unsent; HMRC (approved, paperwork pending); legal policies, now Graeme's active workstream.

---

## 9. Reservations recorded, not resolved

🟡 **"PT" carries gym baggage.** This product serves people failed by fitness culture, and *personal trainer* is a fitness-culture word. It is legible and it is Graeme's naming, so it stands as the working name. **Test it with beta testers rather than resolving it now** — a name argument settled from an armchair is how "Unsure? Coach decides" survived for months.

🟡 **Four cards is at the ceiling for a phone.** The design holds because each card is a door rather than a corridor. **If any room's resting state cannot answer "what would I get right now", that room is a corridor and the count must come down.** Acceptance test, §3.

🟡 **Guided class and PT could read as the same thing** to somebody who has not used either. The textures separate them — sequence against speech — but that is the assumption most worth checking on a handset early.
