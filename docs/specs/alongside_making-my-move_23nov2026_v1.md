# Alongside: Move — Making my Move (P-39) spec
## 23 Nov 2026 v4

v4 - S4 built. **Section 5 as built:** *Which matters most right now?* leads the arc; it does not set it. The arc's own questions stay (strands and what they'd notice: *being asked is the Plan's experience*, ARC-3-SETUP), so the aims that fit what matters most come first on *What do you want to be able to do?*, with one line saying why, and Home offers *Set what you're working towards* under Today once Making my Move is made and no arc is set. An arc already set is never changed by it. The aims for each purpose are in `data/my-move.js` (`AIMS_FOR`; none held). **Section 4 as built:** suggestions only when Home shows *my doors* (the other two choices show no doors, or all four); counted from `activityLog[].door`, wherever the session was started.

v3 - S3 built. One key added to the store (a touch-once exception: S1 did not foresee it): `myMove.day` `{ date, mode }`, today's word from Home (*It's a hard day* / *Show my usual Home*), which wins over the check-in for that day only. On Home, *Making my Move*, *It's a hard day* / *Show my usual Home* and *Change what Alongside is for* sit in one line under Today (`.path-mm`), not counted in the six ways in, as Change today is not. The Calm my mind row shows only when three doors or fewer are shown, so six ways in hold. On a hard day Change today is not shown. True words: the hard day's stretch and walk lines no longer promise ten or fifteen minutes (Home opens the Stretch door and the walk, which ask). *Settings › Your plan › Making my Move* moves to S5 (Home's *Change what Alongside is for* is the way back until then).

v2 - S2 built: its styles went into `css/components/path.css` (v16, beside Home's), not a new file, so no new stylesheet to load; `data/my-move.js` also holds the hard-day and good-day words and the preview sentence. When a movement purpose is ticked while *In Step* is what matters most, the movement purpose takes over (In Step is ticked for everyone).

Build New Habits | Master schedule v684, row P-39. Agreed by Graeme, 22–23 Nov 2026 (*"Those things I think stick now"*; *"Let's start building the 'Creating My Move', or 'Making My Move' experience into the app"*). Tap-through prototype v2: BNH-Files `Apps/Alongside Move/Product/alongside_make-it-yours_prototype_23nov2026_v2.html`. Persona judgement: `Research/alongside_make-it-yours_persona-judgement_22nov2026_v1.md`.

**The Plan only. Free is unchanged by this spec** (P-40 decides Free's shape separately). Rule-based, no AI, nothing leaves the phone.

---

## 1. What it is, in one line

A minute, on a good day, in which the person says what Alongside: Move is for, how much choice they want on a good day, and what would help on a hard day. Home then shows only that.

**Name:** *Making my Move* (glossary). It is step 1 of *Start your Plan* (P-35 is folded in, one route). On Home its way back is *Change what Alongside is for*; in Settings, *Your plan › Making my Move*.

## 2. Screens (as prototype v2)

1. **Making my Move.** What it is; *Start*; *Not sure? Keep it simple* (good day *Just tell me what to do*; hard day the coach's gentle pick; Home at once).
2. **What's it for? (step 1 of 3).** Eight purposes, each a button with `aria-pressed` and **Try it first** (an expanding panel: the stick figure, still under Reduce motion, and one coach line; the voice plays it when the coach's voice is on and the clip exists). Then *Which matters most right now?* (shown when two or more are chosen), which sets the arc's aim (section 5).
3. **On a good day, how much choice? (step 2 of 3).** *Just tell me what to do* · *The coach's pick and my doors* · *Show me everything*.
4. **On a hard day, what would help? (step 3 of 3).** Up to two of six; *Rest, and that's fine* stands alone. The safety line: a sore area at Bad still asks its own choice first.

On steps 1–3 a **live preview** of Home sits above Next, hidden from a screen reader as a picture and spoken instead as one polite line when it changes. There is no summary screen. *That's mine* goes to Home.

| Purpose id | On screen | Where it shows |
|---|---|---|
| `stronger` | Get stronger, standing or sitting | a door |
| `moving` | Keep moving | a door |
| `stretch` | Stretch and loosen up | a door |
| `feel` | Move to feel better | a door |
| `yoga` | Yoga and Pilates | inside Stretch (or its own way in if neither Stretch nor Move to feel better is chosen) |
| `calm` | Calm my mind | a Home row into Wellbeing |
| `trend` | Follow a fitness trend | *Start your Plan* item; inside the doors as now |
| `instep` | Understand other people | *Start your Plan* item; In Step after sessions as now |

**Ticked when the screen first opens** from getting started's answers, and **In Step always** (Graeme, 23 Nov: *"In Step is a default set"*). Nothing is ticked that the person did not say or that is not In Step.

| Hard-day id | On screen |
|---|---|
| `coach` | Let the coach pick something gentle |
| `stretch` | A gentle stretch (ten minutes, sitting) |
| `walk` | A short walk (fifteen minutes) |
| `holds` | A few seated holds (P-38; until its content ships, this choice is not offered) |
| `calm` | Calm my mind |
| `rest` | Rest, and that's fine |

## 3. Home on the Plan

- **Good day.** *Let me choose for you* always. Doors: *Just tell me what to do* none; *my doors* the chosen door purposes in the order above; *everything* all four. *Calm my mind* row when chosen. *Start your Plan* until closed. The Library. **Six ways in at most** (unchanged rule).
- **Hard day.** When today's check-in has energy 3 or lower, or mood at its lowest, or the person taps *It's a hard day* on Home: the note *A hard day. Here's what you chose for days like this.* with *Show my usual Home*, then only the hard-day choices (or the coach's gentle pick if none). Replaces the earlier *keep it to two* rule. **A sore area at Bad keeps its own Rest / Something gentler choice first.**
- **Nothing unasked.** Home never re-adds a door or nudges the person to revisit their choices.

## 4. Learned suggestions

When the person opens *Change what Alongside is for*, and only then: a door not on Home that they have started **five or more times in the last 30 days** from the Library or Today's plan (from `activityLog[].door`) is offered once: *You've used Stretch often lately. Put it on Home?* · *Add it* / *No thanks*. *No thanks* is kept, and that door is never offered again. One offer at a time.

## 5. One "what it's for"

*Which matters most right now?* sets the arc's aim when no arc is set, from the purpose → aim map in `data/aims.js` (held aims A1 and A2 are never chosen until the clinical read). If an arc is already set, the screen says *Change my aim too?* and changes it only on *Yes*.

## 6. Resume, reset, restore, tiers

- Stopping part way keeps what is ticked (`step`); reopening returns there.
- Restore carries `myMove` (the person's own record).
- **Leaving the Plan** (trial end, P-40) keeps `myMove` untouched; Free never reads it. Coming back finds it as it was.
- Delete my health answers does not touch it (it holds no health answer).

## 7. Store (schema first, S1)

`myMove` `{ step, made, purposes, most, goodDay, hardDay, dismissed }`, default `{ step: null, made: null, purposes: [], most: null, goodDay: "few", hardDay: ["coach"], dismissed: [] }`.

| Key | May hold | On load |
|---|---|---|
| `step` | `"intro"`, `"for"`, `"good"`, `"hard"` or `null` | anything else → `null` |
| `made` | an ISO date-time, when *That's mine* was last pressed, or `null` | not a date → `null` |
| `purposes` | purpose ids, each once | unknown ids and repeats dropped |
| `most` | one of `purposes`, or `null` | not in `purposes` → `null` |
| `goodDay` | `"one"`, `"few"`, `"all"` | anything else → `"few"` |
| `hardDay` | up to two hard-day ids; `"rest"` only alone | unknown ids and repeats dropped; more than two → first two; `"rest"` with another → `["rest"]` |
| `dismissed` | door purpose ids (`stronger`, `moving`, `stretch`, `feel`) | unknown ids and repeats dropped |

Written only through `store.setMyMove(patch)` (cleans the same way). Not a health answer. Free never writes it.

## 8. Build sessions

| Session | What | Files (confirm at start) | Gate |
|---|---|---|---|
| **S1 SCHEMA** | `myMove`, its cleaning and `setMyMove` | `store.js`, `Schema.md`, `verify-write1` (dated promise), `glossary.md`; `sw.js` last | `verify-my-move-schema` |
| **S2 SCREENS** ✅ `alongside-v724` | the four screens, live preview, Try it first, resume; `router.js` | new `views/my-move.js`, new `data/my-move.js` (purposes, hard and good words, seeding from getting started, the preview), `css/components/path.css` v16, `router.js` v58 | `verify-my-move-screens` (55; drives the real view; a11y names; Plan only) |
| **S3 HOME** ✅ `alongside-v725` | good-day and hard-day Home, *It's a hard day*, *Calm my mind* row, Making my Move's way in under Today | `plan-home.js` v13, `data/my-move.js` v2, `store.js` v126 (`myMove.day`), `path.css` v17 | `verify-my-move-home` (41; six ways in; Bad still first; Free has none of it) |
| **S4 AIM AND SUGGESTIONS** ✅ `alongside-v726` | *Which matters most* leads the arc's aims; learned suggestions | `data/my-move.js` v3, `views/my-move.js` v2, `views/arc-setup.js` v8, `views/plan-home.js` v14, `path.css` v18 | `verify-my-move-learn` (27) |
| **S5 CLOSE** | *Settings › Your plan › Making my Move*; Help guide, glossary, device checklist sitting, real-browser text-fit and axe; the full *Start your Plan* list | `settings.js`, `guides.js`, checklist | full suite ×3 from a fresh clone |

## 9. Not in this spec

- Free's shape, the 14-day trial and payment (P-40).
- 14 and over (P-41): the three versions are 14–15, 16–17, 18+. Making my Move is the same for all three; the 14–17 differences (no weight features, young people's support) live in P-41.
- The teenage In Step set (P-42).
- The *Try it first* recordings: about eight new clips for Graeme (voice script addendum).

*Build New Habits · Alongside: Move · Making my Move spec · 23 Nov 2026 v4*
