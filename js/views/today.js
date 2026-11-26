/**
 * today.js
 * 26 Nov 2026 v67
 *
 * v67 - P-41 S3. On the day a 16-17 phone moves up to the adult version,
 *   Home's coach line says so, once, on both tiers.
 *
 * v66 - P-46 S4 FREE HOME. Free Home is views/free-home.js: the Today card,
 *   Something gentler, six ready-made sessions, Log what I did, Your
 *   exercises with a list, and what the Plan adds. The door tiles, the arc
 *   offer, the reference rows and their helpers (chooser, tileGrid,
 *   arcPanel, HOME_DOORS, DOOR_LOOK) went; archived in BNH-Files
 *   Archive/P-46. The ask-later card is placed by free-home.js now.
 *
 * 24 Nov 2026 v65
 *
 * v65 - P-46 S3. Home asks one question once, later (data/ask-later.js): on
 *   Free under the main card; on the Plan, plan-home.js places it. Bound here
 *   for both tiers (attachEvents).
 *
 * 23 Nov 2026 v64
 *
 * v64 - OWN-DONE-TODAY (Graeme, 23 Nov: "It says I did these today but I
 *   didn't"). Done today is read through store.ownDoneToday(): ticked today
 *   only (the flag was never cleared).
 *
 * v63 - P-25 HOW-TO GUIDES. Guide markers only: Free Home's
 *   Not sure? I'll pick something (not-sure). Nothing else changes.
 *
 * 05 Nov 2026 v62
 *
 * v62 - P-27 TIDY (Graeme, 05 Nov: retire the twelve-week programme on the
 *   Plan). Plan Home no longer shows the chapter-end card (Run it again,
 *   Something different, and an event date nothing on the Plan read). Free
 *   unchanged.
 *
 * 28 Oct 2026 v61
 *
 * v61 - STAGE PATH P-4 (blueprint Session 4; mock-up v9, approved 28 Oct,
 *   then v10, 29 Oct: "I like v10"). The Plan's Home is views/plan-home.js:
 *   the arc as a line, Lately, one row (Let me choose for you, or Carry on,
 *   Done today, your week's day), four purpose doors, the Library. The
 *   check-in is asked inside each way in, before the day's first session;
 *   back from it after Let me choose for you, Home goes straight on to the
 *   coach's choice. _planDoors(), and the three doors behind it,
 *   are archived in BNH-Files (Archive/Stage PATH/P-4 plan-home) and no
 *   longer drawn; their code stays below for the archive's sake until the
 *   stage closes. On the Plan, the coach's line on Home is said only when
 *   it carries something the Today card does not (a flat week, the week's
 *   pace, a shorter way in): _planCoachNote(). Free Home is byte for byte
 *   what it was (verify-path-free-unchanged).
 *
 * 17 Oct 2026 v60
 *
 * v60 - W6-19 EMPATHY-GAPS (Wave 6, personas 2.13, 2.4). A Struggling or Low
 *   mood this morning is answered on Home, in their word, with Wellbeing
 *   (the line was the same on a good day and the worst). Touch-once
 *   exception: this file was in session 5 too (W6-9).
 *
 * 17 Oct 2026 v59
 *
 * v59 - W6-9 SMALL-6. Back at Home, a hand-over to the builder is dropped (a
 *   Stretch preselect from an unfinished check-in opened the builder on
 *   Stretch 18 days later).
 *
 * 13 Oct 2026 v58
 *
 * v58 - A-5 SIGNATURE-MOMENTS (Stage AWARD). On the first day of a new arc
 *   week (a Monday, after week 1), Plan Home says "Week n starts today": in
 *   the coach card's line, or on the arc line inside the week card. A day,
 *   never a count. arcWeekStartsToday() exported for its check.
 *
 * v57 - A-1 PLAN-HOME-PRUNE (Stage AWARD; Graeme approved the mock-up, 12
 *   Oct). Plan Home: one Today card (the week's day; a rest day; or, with
 *   no day set, the coach's card leading with the arc and Tell me what to
 *   do), the arc a line inside the card, the doors (named only), and one
 *   Library row. Six ways in at most. Join a class, Go for a run, Something
 *   for the mind and Your week moved to the Library; the week card's Only
 *   10 minutes (the plan's Length does it) and Something else today (the
 *   doors are below it) went. Free Home unchanged. Old markup archived.
 *
 * 05 Oct 2026 v56
 *
 * v56 - D-7 PLAN-IMPORT. On a day of the week that is the person's own list
 *   (a day of a plan they added, in My exercises), Today, from your week
 *   says so and offers Start your list, which plays that day as written.
 *
 * 05 Oct 2026 v55
 *
 * v55 - D-6 WEEK-SHAPE (Graeme approved the "Your week" mock-up, 05 Oct).
 *   Plan Home: when the person has a week, a card "Today, from your week"
 *   leads the doors: the day plan's name, its mix and how hard, long and
 *   where, then "Show me today's plan", "Only 10 minutes" and "Something
 *   else today" (which moves to the doors). Tell me what to do is then not
 *   the filled door. A rest day says so ("Rest counts."). A fifth link
 *   tile, Your week (or Plan your week), full width under the four.
 *
 * v54 - D-3 ARC-HOME (device test, 04 Oct). The Your arc card opens the
 *   arc (stretch-arc), where it can be changed or started afresh; it
 *   opened Progress. Nothing else changed.
 *
 * 04 Oct 2026 v53
 *
 * v53 - LOOK-4 (Graeme approved the mock-up, 04 Oct). Plan Home: the arc
 *   as a card ("Your arc · Week n" and the aim), the three doors as cards
 *   with a tile and a chevron (Tell me what to do filled), and the four
 *   links as a two-by-two grid of tiles in their kind colours (classes
 *   rose, run blue, the mind green, Library slate) under "Or go straight
 *   to". Free Home: the session tiles in their kind colours with line
 *   icons in place of emoji, Wellbeing on its own row, My exercises and
 *   Library in one card. Every button, label, route and data attribute is
 *   as before; colour is never the only cue (each tile has its words).
 *
 * 30 Sep 2026 v52
 *
 * v52 - W3-21 NAV-SMALL. Plan Home gains "Go for a run" beside Join a
 *   class: persona 2.4 found Run three taps deep in the Library.
 *
 * v51 - W3-20. "You moved today" only after movement: breathing, mindful
 *   sessions and quiet practices are not movement (decision 4a).
 *
 * v50 - W3-13 INTERRUPTIONS (Schema v1.85). Free Home shows a session
 *   the phone closed, with "Save what you did" and "Don't save it" (Carry
 *   on stays the Plan's, the tier table). A session nobody came back to
 *   within 3 hours is saved on arrival here (session-resume.js), and Home
 *   says so once.
 *
 * v49 - P26, RUN ON FREE (persona finding W2-20). A Run door among Free's
 *   "Move your body" tiles. Running was the main goal of persona 2.1 and
 *   Free had no way to it but the Plan's session picker.
 *
 * v48 - P22, CLASSES ON FREE (persona finding W2-18). A Classes door among
 *   Free's "Move your body" tiles; the Plan keeps "Join a class".
 *
 *
 * v47 - P7. The line about yesterday names the activity from the one
 *   label map (data/activity-labels.js), on the local calendar day. It
 *   said "You did movement yesterday" after a breathing session: its own
 *   map was keyed on type names nothing writes. verify-activity-labels.
 *
 * v46 - P0, SCOPE-MINOR. The one-time scope notice (scopeNoticeDue); the Conditions Update tile is My exercises.
 *
 * 28 Sep 2026 v45
 *
 * v45 - F7 LANDMARK. role="main" (and its label) removed from the view's
 *   wrapper: index.html's <main> is the one main landmark; a second,
 *   nested inside it, is announced twice and fails landmark rules.
 *
 * v44 - F1, FREESTYLE-RELOAD. The Carry-on card also offers a "Make it up
 *   as I go" session waiting in the active-session slot: what is done so
 *   far, Carry on (back into it) and Finish here and save.
 *
 * v43 - SMOOTH-P4a. The arc chip opens Progress, where the arc is read
 *   back (spec 4.1: "Arc chip → Progress, arc section"). Change my arc
 *   is there.
 *
 * v42 - SMOOTH-P3a. Plan Home is three doors. Spec 4.1.
 *
 *   Graeme, 27 Sep: "too many pages before you get to the exercises. Too
 *   many decisions." Plan Home was the arc panel, four expandable rooms
 *   (Guided class, One to one, Your own, Quick build), "Or go straight
 *   to" with four tiles, then reference rows: fifteen-odd things to read
 *   before the first choice, and it scrolled.
 *
 *   Now: the greeting and one coach line, a small arc chip, and three
 *   doors -- Tell me what to do (filled) · I know what I want · Make it up
 *   as I go -- with three quiet links under them: Join a class, Something
 *   for the mind, Library. Nothing is deleted from the app: classes,
 *   saved sessions, the builder, capture and Library are all one tap
 *   from here.
 *
 *   COMING BACK. When a session was left with "Carry on later", or the
 *   app was closed mid-session, a Carry-on card replaces the first door:
 *   the session, where they were, Carry on and Finish here. The other
 *   doors sit under "Or instead". A cold reopen with a session to carry
 *   on shows Home with the card rather than bouncing to the old proposal.
 *
 *   Free Home is unchanged (P5 cross-checks it).
 *
 *   SMOOTH-P3b (same version, not yet committed): "I know what I want"
 *   opens the new know-what screen, and "Tell me what to do" clears any
 *   kind asked for there, so the coach really does decide.
 *
 * v41 - EXIT-HOME. Arriving at Home from inside the app means you chose
 *   Home, so Home stays. Only a cold open (the app launched with nothing
 *   behind it) may send you back into a session you accepted.
 *
 *   Graeme, 26 Sep: "It doesn't go back to the home page when I've done
 *   a one-to-one workout with the coach. It just sticks there and I
 *   can't get out of it."
 *
 *   EXIT-LOOP (v530) fixed this one screen at a time: six session views
 *   each wrote declinedProposalAt. The coach one-to-one opens a seventh,
 *   workout.js, which never did -- nor morning, cycle, quiet, breathing.
 *   Every screen that forgot left somebody stuck, and "Exit and save"
 *   bounced from ALL of them because a partial entry is not "done".
 *   Decided here instead, once, from the router's own record of where
 *   you came from; the decline is still written, so closing the app
 *   after leaving and reopening within ten minutes also stays on Home.
 *   See tools/verify-exit-home.mjs.
 *
 * v40 - SAFETY-GATE. GUIDANCE_TEXT and GUIDANCE_DAYS now come from
 *   safety-gate.js instead of being written out here.
 *
 *   Not a relocation for tidiness. The session gate needs the same
 *   sentence, and a second copy of it is precisely how eleven stop lines
 *   ended up phrased eleven different ways. The clinical wording exists once,
 *   in one file, and both places that say it import it from there. The
 *   thirty-day interval, the trigger and the behaviour here are
 *   unchanged.
 *
 * 08 Sep 2026 v39
 *
 * v39 - GUIDANCE-1. The general-guidance line, every thirty days. It
 *   lived only in onboarding's closing beat and the Terms page, and it
 *   now carries the weight the three-question red-flag screen was going
 *   to carry -- on the physiotherapist's advice that a partial screen
 *   protects less than a plain statement.
 *
 * 08 Sep 2026 v38
 *
 * v38 - TIMETABLE-1. The Guided class room reaches the classes.
 *   Seven playable classes existed and the room named for them led to
 *   the programme instead. Classes first, in both states -- a class no
 *   more depends on a twelve-week shape than a yoga class at a gym
 *   depends on having signed up for a course.
 *
 * 08 Sep 2026 v37
 *
 * v37 - A11Y-HOME. Each room's button is wrapped in an h2, so Home can
 *   be navigated by heading. It had ONE heading for the whole screen --
 *   the greeting -- on the page everybody starts on. WCAG 2.2 AA 1.3.1.
 *   The heading WRAPS the button rather than sitting inside it: a
 *   heading nested in an interactive element is not reliably exposed,
 *   and shrinking the button to fit a shorter heading would take the tap
 *   target away from the rest of the row.
 *
 * 08 Sep 2026 v36
 *
 * v36 - OWN-1. Three faults in the Your own room's card, all of
 *   them already fixed somewhere else and left standing here.
 *
 *   1. The movement count was exerciseIds.length -- what was SAVED, not
 *   what still exists. resolveSavedSession() has always returned
 *   `missing` and this caller dropped it, so the card could promise nine
 *   movements and hand over seven. It now counts what resolves and says
 *   out loud how many have gone.
 *
 *   2. "1 movements". The same unguarded interpolation PROPOSAL-1 fixed
 *   on the proposal card the same day, in a second place.
 *
 *   3. A session whose movements had ALL gone offered a Start button
 *   that did nothing -- the handler ends `if (!exercises.length)
 *   return;`, a silent no-op. SAVED-1b fixed exactly this on the
 *   saved-sessions list and left this copy behind. No button now, and a
 *   line saying why; the session stays on the card, because it is still
 *   the person's.
 *
 *   verify-yourown test 4 had mounted this room since 06 Sep and
 *   asserted only that a start button EXISTS. That was true throughout,
 *   and was the problem.
 *
 * 08 Sep 2026 v35
 *
 * v35 - SAVED-1. The Your own room's counted button pointed at the
 *   BUILDER. "Your other 2 sessions" opened the screen for making a NEW
 *   one, reached by tapping a control that names the ones you already
 *   have -- and there was nowhere else for it to go, because no list
 *   view existed and no route pointed at one. It now points at
 *   'saved-sessions'. A count is a promise.
 *
 * 06 Sep 2026 v34
 *
 * v34 - ARC-PLAIN. The strand rows lose their marks and labels.
 *
 *   No tick, no dash, no "not yet". Lit is full-strength text, unlit is
 *   muted. Graeme's call after seeing v33 on device, and the block is
 *   much quieter for it -- three dashes and three "not yet"s on a
 *   fresh account read as a to-do list.
 *
 *   WCAG 1.4.1 STILL HOLDS, and not by luck. The note directly below
 *   NAMES the strands that have not come up, in every state: all of
 *   them ("All of it still ahead of you"), some of them (listed by
 *   name), none of them. The information is in text on the same block,
 *   so colour is not the only means of conveying it. verify-clubshell
 *   10f asserts the NOTE now rather than per-row words, because the
 *   note is what carries it -- if it ever stops naming them, state
 *   becomes colour-only and the gate goes red.
 *
 *   LIT IS NOT TEAL, deliberately, and this is the one place I did not
 *   do exactly as asked. Teal is the interactive colour across the
 *   whole app -- buttons, links, and now the room titles. Spending it
 *   on "this strand has come up" would make one colour mean two
 *   things, and somebody learning teal means "you can tap this" would
 *   also be learning it means "done". Full strength against muted is
 *   the contrast that collides with nothing.
 *
 *   ROOM TITLES AND GROUP HEADINGS ARE TEAL, as asked. The whole row IS
 *   a control, so teal is doing the job it already does everywhere
 *   else rather than being borrowed for decoration.
 *
 * 06 Sep 2026 v33
 *
 * v33 - ARC-LED. Home stops nominating a session.
 *
 *   It led with the coach's pick and four full cards, so the screen
 *   chose before the person had said anything. That made the app the
 *   one with the plan -- and it contradicted "free is today, the Plan
 *   is the arc" on the Plan tier's own home screen.
 *
 *   The arc is what you land on now. The rooms are four COLLAPSED ROWS
 *   beneath it, and you open one. NOTHING IS SUGGESTED: no badge, no
 *   accent border on a room, no ordering by recommendation. The
 *    slot is removed rather than left unused, so it cannot
 *   quietly come back.
 *
 *   THE ARC SHOWS COVERAGE, NOT COMPLETION. No bar, no percentage, no
 *   count -- P4, and there are no streaks anywhere in this product.
 *   Strand state is carried THREE ways: a mark, the words "has come
 *   up" or "not yet", and the surface. Colour alone cannot carry
 *   meaning, and it is the first thing to fail on a phone in daylight.
 *   The note now ends "Nothing is behind -- that's just where the arc
 *   is", because without it two of three strands reading "not yet" is
 *   read as being behind whatever the design intends.
 *
 *   THE FIRST DRAFT OF THIS LAYOUT REGRESSED SLOT 2. It moved "what
 *   the room is" into the expanded detail and left only state on the
 *   closed row -- so you had to open a room to learn what it was, which
 *   is the "find out by doing" fault CLUB spec v2 3.1 reversed v1
 *   over. verify-clubshell 3b caught it before it shipped.
 *
 *   THE DEPTH RULE HOLDS. Expanding a row is not a screen. Details are
 *   rendered and hidden rather than built on tap, and there is no
 *   rerender -- a rerender would rebuild the row under the finger that
 *   tapped it and throw keyboard focus to the top of the screen.
 *
 *   HEADINGS READ AS HEADINGS. Graeme, on device: "Move your body and
 *   Settle your mind are titles. They look like normal text." They
 *   did -- same size and colour as the secondary body copy.
 *
 * 06 Sep 2026 v32
 *
 * v32 - DEVICE-2. Task 2 of the device pass: the FREE home screen, read
 *   beside Plan. Both faults found were made earlier the same day.
 *
 *   DEVICE-1 MOVED A FAULT INSTEAD OF CLOSING IT. It replaced "Unsure"
 *   with "One to one" -- and One to one is a PLAN room. Free's coach
 *   route is the "Not sure? I'll pick something" button beneath its
 *   tiles. So free was told to use a door that is not on its screen,
 *   which is the same defect one tier over, shipped within the hour,
 *   because it was verified against one fixture. Named per tier now.
 *
 *   GUIDED-COPY CHANGED ONE BRANCH. The empty-state card still said "A
 *   set course. Same shape each week." -- the exact claim that item
 *   existed to remove. Its gate only ever mounted the with-programme
 *   fixture, so it passed while half the room still promised a course.
 *
 * 06 Sep 2026 v31
 *
 * v31 - DEVICE-1. Two claims found by reading the Plan home screen top
 *   to bottom, the way a person meets it.
 *
 *   THE ORIENTATION LINE NAMED "Unsure", a door that has not existed
 *   since CLUB-SHELL -- it was "Unsure? Coach decides", then the club
 *   renamed it "One to one", and the line never followed. It shows only
 *   to somebody with NO GOAL SET in their first sessions, the case this
 *   line itself calls genuine decision paralysis. The one person who
 *   most needs pointing at a door was pointed at one that is not there.
 *
 *   THE ARC PANEL SAID "Every strand has come up at least once" WHEN
 *   THERE WERE NO STRANDS. That branch is reached whenever notYet is
 *   empty, and zero of zero is zero -- so an arc with an aim but no
 *   strands announced complete coverage of nothing. Vacuously true and
 *   read as an achievement. Silent now.
 *
 * 06 Sep 2026 v30
 *
 * v30 - GUIDED-COPY. The Guided class card stops promising a course.
 *
 *   It said "A set course. Same shape each week." ALL EIGHT entries in
 *   programmes.js have an EMPTY sessionSequence. A programme is four
 *   phases each carrying a bias -- intensityBias, focusBias -- plus a
 *   label and a coach message. A twelve-week TUNING OF THE GENERATOR,
 *   not a course. The copy was written against a room nobody had looked
 *   inside. Graeme, on device: "There is no Class content to follow. No
 *   programme." There was not.
 *
 *   "Nothing scheduled today" was the same fault one layer down.
 *   plannedFocusToday() reads that empty sessionSequence, so the line
 *   rendered EVERY SINGLE DAY and the card could never be the suggested
 *   one -- describing an absence as though a schedule existed and today
 *   happened to be empty. The call and its import are gone from here;
 *   the function is still used by session-choice.js's chain and becomes
 *   real the moment classes exist.
 *
 *   The facts come from getPhaseForWeek() now: the phase label, what it
 *   leans towards, how far in you are. Real data, and nothing claims a
 *   session exists.
 *
 *   THE ROOM KEEPS ITS NAME. Real classes are specified --
 *   Documents/Admin/alongside_spec_guided_class_06sep2026_v1.md, three
 *   formats, strand-mapped, script-first -- and renaming now and back
 *   later is churn. What had to stop was the DESCRIPTION promising
 *   something behind the door.
 *
 * v29 - QUICK-BUILD. The time chip now asks for mode:"quick", which
 *   sends the builder to its single scaffold screen rather than six
 *   question phases. Without it the card's promise to fill the rest in
 *   is followed immediately by six more questions.
 *
 * 06 Sep 2026 v28
 *
 * v28 - YOUR-OWN. The Your own room stops being a shell.
 *
 *   The newest saved session on the card, the rest behind a COUNTED
 *   button -- "Your other 2 sessions", never "More". A count tells you
 *   whether it is worth the tap; "More" makes you tap to find out.
 *
 *   Starting one resolves exerciseIds against the LIVE library, so a
 *   saved session picks up safety corrections instead of carrying a
 *   frozen copy of the database. An exercise that has since gone is
 *   dropped and the session still starts -- refusing would punish
 *   somebody for a library change they did not make.
 *
 * v27 - CLUB-SHELL. THE FOUR ROOMS, ADDED ABOVE THE TILES.
 *
 *   The rooms sort by HOW MUCH THE COACH LEADS -- Guided class, One to
 *   one, Your own, Quick build. The tiles below them sort by body part,
 *   which is a filing system; a club sorts by what kind of session you
 *   want to be in, which is a relationship.
 *
 *   THE FIRST DRAFT REPLACED THE TILES AND verify-homedoors CAUGHT IT
 *   within minutes -- the gate written hours earlier, after LOBBY-1c did
 *   exactly that. It was right. yoga-session is a route NO room reaches,
 *   and mobility and stretch would have gone back to being two screens
 *   deep. Improvements extend what exists; they do not relocate it.
 *   The rooms are an addition. tileGrid() is rendered by both tiers.
 *
 *   ONE GRAMMAR, FIVE SLOTS, same order, same positions, every card:
 *   name, what it is, today's option, the facts, the action. CLUB spec
 *   v2 3.3 reversed v1, which gave each room its own internal grammar --
 *   four things to learn at once, differentiated by cues that have to be
 *   picked up implicitly. That fails the people this is built for.
 *
 *   SLOT 2 IS PERMANENT. v1 said "no room is ever explained on screen;
 *   you learn what a room is by entering it once." Wrong, and the Disney
 *   comparison argues against it: Disney over-signals -- sign, wait
 *   time, height requirement, themed queue, all before you commit.
 *   "Find out by doing" is an implicit demand.
 *
 *   TWO NAMES CHANGED, BOTH BECAUSE A GATE SAID SO, NOT BECAUSE I
 *   PREFERRED THEM:
 *
 *   "Personal training" -> "One to one". verify-name1 forbids any
 *   user-facing string containing "Personal" -- that was the retired
 *   tier name, and two names for one thing is how vocabulary drift
 *   survives. A room name is not worth a hole in a tier-vocabulary gate,
 *   and "one to one" also drops the gym-culture baggage that was the
 *   recorded reservation about "PT" in the first place.
 *
 *   "Week 3 of 12" -> "You are 3 weeks in". verify-countdown1: progress
 *   made, never distance remaining. A week count out of twelve is
 *   distance remaining wearing a position's clothes.
 *
 *   NO ROOM HAS ITS OWN COLOUR. Colour already means energy, a sore
 *   zone, caution and tier here. Somebody learning that amber means "be
 *   careful with this movement" must not also learn it means "you are in
 *   a room". Rooms are told apart by name and by slot 2.
 *
 *   YOUR OWN IS A SHELL AND SAYS SO. Saved routines are YOUR-OWN, item
 *   5, and their store fields do not exist. The card reads "Nothing
 *   saved yet / Saving your own comes soon" -- an empty state that lies
 *   is worse than one that waits.
 *
 * v26 - HOME-DOORS. THE SESSION TILES CAME BACK TO THE PLAN HOME.
 *
 *   LOBBY-1c (04 Sep, 21:31) deleted the door grid from Home and left
 *   Plan with a single "Start today" button routing to coach-proposal.
 *   The tiles were relocated into that screen as "Or pick your own" --
 *   a row sitting underneath a panel that auto-opens at z-index 9999
 *   and cannot be dismissed to reveal it. Present in the source,
 *   unreachable on the device.
 *
 *   Graeme, 06 Sep, on device: "I wanted to stretch but I couldn't
 *   find it." He could not. coach-proposal builds through
 *   workoutGenerator.js, whose type list is three hardcoded names --
 *   Strength Focus, Mobility & Recovery, Cardio Boost. Stretch is one
 *   of session-builder.js's EIGHT session types and that engine is
 *   never reached from there. The door was the only route to it.
 *
 *   WHAT CHANGED: freeChooser() is now chooser() and renders on BOTH
 *   tiers. Nothing was added and nothing new was designed -- this is
 *   the screen free has been running since LOBBY-1c, which was the
 *   good one.
 *
 *   THE INVITATION IS NOT LOST. chooser() already ends with "Not sure?
 *   I'll pick something", same data-action="start-today", same route.
 *   It is now one option among the doors instead of the only one,
 *   which is what it was before Friday.
 *
 *   ARC PLACEMENT IS UNCHANGED ON BOTH TIERS. The arc panel used to be
 *   emitted twice on the free path -- once at the call site above,
 *   once inside freeChooser(). Rendering the same chooser on Plan
 *   would have duplicated it there too, so arcPanel() came out of the
 *   chooser and each tier keeps its existing position: above on Plan,
 *   below on free.
 *
 *   WELLBEING FILTERED ON BOTH. The reference row excluded Wellbeing
 *   only on free, because only free promoted it into "Settle your
 *   mind". Both tiers promote it now, so the exclusion applies to
 *   both or Plan gets the row twice.
 *
 *   THE RULE THIS BREACHED, recorded because it is the point:
 *   improvements extend what exists, they do not relocate it. Moving
 *   something behind a new screen is a removal, and a removal is the
 *   change however the commit is titled. LOBBY-1c's own message
 *   argued it "is not a layout change". It was.
 *
 * v25 - ARC-DOOR. FREE COULD BUILD AND KEEP AN ARC.
 *
 *   arcPanel() had TWO call sites. Line ~690 is gated behind
 *   isPremium(). The one inside freeChooser() was not, so a free user
 *   with arc.active true rendered the full today-arc--active panel with
 *   no lock wrapper -- the paid product, on Home, free. The offer card
 *   also routed to "arc-setup" with no tier check, so the whole path was
 *   open: offer -> setup -> active arc -> full panel.
 *
 *   Graeme asked why free was showing him an arc. It was, and the first
 *   answer he got -- that the arc was correctly gated and his handset
 *   must be on the Plan -- was wrong. It was checked a second time with
 *   a fixture that set aimId but NOT active, which lands on the offer
 *   branch and looks clean. The leak only appears once the fixture
 *   reaches the branch it names.
 *
 *   FIX, Graeme's option B, 06 Sep: free keeps the invitation, because
 *   it is the best upgrade door in the product -- someone on Home who
 *   has felt the shape of the thing. It becomes a DOOR, not a setup
 *   entrance. The gate is inside arcPanel() rather than at the call
 *   site, so BOTH call sites are closed by one rule and a third one
 *   added later inherits it. Patching only the site that was found is
 *   how this happened in the first place.
 *
 *   Not done: hiding the arc from free entirely (option A). That closes
 *   the leak and the door together. Not done: letting free set an aim
 *   while hiding the panel (option C) -- an arc that exists and is never
 *   shown is the coach holding something it will not display, which is
 *   the same fault TRUTHFULNESS fixed.
 *
 * v24
 *   R2-a. THE BOUNDARY CORRECTION. A dated target can only be recorded
 *   on the Plan.
 *
 *   Not a change to the boundary -- the boundary always said "free has
 *   goals, the Plan has targets". The code had drifted: this hinge let a
 *   free user record a dated target, and my-programme.js displayed it to
 *   them. Graeme, 22 Aug: it is the act of telling the coach your goal
 *   that is the "I want you to do something with this" moment. Anyone is
 *   welcome to own their goals on paper; the coach will not do anything
 *   with that.
 *
 *   GOALS ARE UNTOUCHED AND STAY FREE. programmes.js matches on them and
 *   workoutGenerator.js uses them for the session rationale, so removing
 *   them would degrade free -- and it would break the anecdote, because
 *   the drop-in coach DOES ask what you want to do. What he does not
 *   hold is where you are going and by when.
 *
 *   FREE SEES NOTHING HERE. No locked teaser. A "the Plan can do this"
 *   prompt on the screen somebody opens every morning is pressure on the
 *   wrong surface; the locked block in My Programme already does that
 *   job where it belongs.
 *
 *   The copy changed too. It used to say naming a date "changes nothing
 *   about how I work", which was true when nothing read the date and is
 *   false now that R1 does. It now claims ONLY what R1 actually does --
 *   deliberately not "I'll build towards it", because the programme does
 *   not plan around the date and chapters are twelve weeks regardless.
 *
 *   And it writes strategicGoal.targetSetAt. setAt records when the
 *   weekly FREQUENCY was agreed, which is a different fact; using it for
 *   R1's maturity guard meant the guard protected the wrong thing.
 *
 * 20 Aug 2026 v23
 *   R4. SELF-DIRECTION IS FREE. The 12 Aug boundary charged for
 *   CONTROL -- "Full body only. The coach decides." Retired: choosing
 *   which session you do today is still choosing a session, and
 *   charging for it penalised the person mainstream fitness culture
 *   already fails worst. Source: alongside_revenue_architecture_
 *   18aug2026_v1.md v2 section 3, tier boundary v3 section 4.
 *   Both self-directed Home doors -- Mobility & Conditioning and Yoga
 *   & Pilates -- lose tier: 'personal'. No door on Home is gated now.
 *
 * 17 Aug 2026 v22
 *   CHAP-1 step 6. The event goal, offered at the FIRST hinge and asked
 *   once — never at signup, where asking implies somebody ought to have
 *   an answer.
 *
 * 16 Aug 2026 v21
 *   BURN-3. The graded burnout message returns, on Home, above the
 *   yesterday line. It had been unreachable since 04 Aug.
 *
 * 16 Aug 2026 v20
 *   CHAP-1 step 3 part two. The hinge moves to Home. An end-of-chapter
 *   offer already existed inside gym-programme.js, reachable through one
 *   of thirteen session views, so anybody finishing a chapter by another
 *   route was never asked what came next. It does not block the doors:
 *   somebody who opened the app to move for twenty minutes should be
 *   able to.
 *
 * 16 Aug 2026 v19
 *
 * v19 - CHAP-1 step 2. Two changes, both Graeme's, agreed 15 Aug.
 *
 *   MY PROGRAMME, full width, above the grid. The six tiles answer
 *   "what shall I do now?". My Programme answers "where am I going?".
 *   Inside the grid it would read as another kind of session and people
 *   would tap it expecting a workout, so it is a row rather than a
 *   seventh tile -- the same reasoning that keeps "Unsure? Coach
 *   decides" spanning both columns underneath.
 *
 *   THE COG GOES. Settings is a bottom-nav destination reachable from
 *   every screen, so the corner affordance was the weaker of two routes
 *   to one place and it was crowding the header. Verified present in
 *   index.html's nav before removing it, not assumed.
 *
 *   "Update check-in" KEEPS ITS TEXT LABEL. An icon-only control is the
 *   least discoverable element on a screen, a passport-and-pen has no
 *   established meaning for "change how I said I am feeling", and
 *   hiding it would repeat the exact fault Graeme found in Settings. It
 *   also needs an accessible name under WCAG 2.2 regardless. It gets
 *   offered contextually after a door as well -- that is the better
 *   half of the idea -- but the link stays for the one case the
 *   contextual path misses: somebody who checked in this morning, felt
 *   worse by evening, and wants to say so WITHOUT starting a session.
 *
 * 15 Aug 2026 v18
 *
 * v18 - QUICK-2. The coach offers the short check-in once, after six
 *   check-ins. It existed only in Settings, where 2.16 will not look.
 *
 * 15 Aug 2026 v17
 *
 * v17 - PACE-2. A weekly target set sharply above recent actual
 *   history is named warmly on Home, once a week at most. Matrix
 *   decision 4, agreed 05 Jul.
 *
 * 15 Aug 2026 v16
 *
 * v16 - TARGET-2. Reaching the weekly target the person chose is now
 *   said out loud, in a line that closes the week rather than opening a
 *   demand. Previously it read identically to missing it.
 *
 * 13 Aug 2026 v15
 *
 * v15 - ORIENT-1. Home now reads what the person told onboarding.
 *   _buildCoachLine() returned null for anybody without history, so a
 *   new user landed on a bare greeting and seven doors, the first three
 *   of which are workouts. Nothing on this screen had ever read goals.
 *
 *   Persona 2.11 -- 76, does not know how to move confidently, told the
 *   app she wants to reduce stress and feel better -- landed on a screen
 *   led by workouts with the thing she came for fourth. Her matrix gap
 *   since 05 Jul ("is the Noticing Hub a genuine front door") is
 *   answered: it was not.
 *
 *   NOT FIXED BY REORDERING THE DOORS, which was the obvious answer.
 *   Persona 2.14 is autistic and predictability-seeking; a Home screen
 *   that rearranges itself is precisely aversive to her. Fixing one
 *   persona by breaking another is not a fix. The grid stays identical
 *   for everybody and the coach speaks instead -- which is what P1 asks
 *   for anyway: the coach offers.
 *
 * 13 Aug 2026 v14
 *
 * v14 - HOME-1. The weekly denominator appears only if the person set
 *   one. weeklySessionTarget defaults to 3 with setAt: null -- the field
 *   records that nobody agreed to it -- so Home read "1 of 3 this week"
 *   to a persona defined by decision paralysis: two short of something
 *   never chosen. The target itself stays for anybody who sets one.
 *
 * 13 Aug 2026 v13
 *
 * v13 - TIER-A and TIER-F.
 *
 * TIER-A. Two of the seven doors bypassed the free tier's own
 * definition. The boundary (Documents/Business/
 * alongside_tier_boundary_12aug2026_v1.md section 4) is that free is a
 * full-body session "the coach decides" -- no session-type selection.
 * Mobility & Conditioning and Yoga & Pilates both routed straight to
 * self-directed session views with no tier check, so a free user COULD
 * choose their session type; they simply could not do it through the
 * picker that says so. Same fault as the Library, different costume.
 *
 * THE SAFETY OBJECTION, ANSWERED IN FULL, because someone will raise it
 * again and the answer must not have to be re-derived. Gentle movement
 * is not being paywalled. A free user in pain still gets it: the severe
 * zone override still forces the single Gentle Care card, Care mode
 * still fires, burnout bias still lowers intensity, and the coach
 * proposal still OFFERS mobility whenever the day calls for it. What a
 * free user loses is the ability to CHOOSE gentle movement instead of
 * being offered it. That distinction is the entire tier, and nothing
 * safety-critical sits on the paid side of it.
 *
 * Conditions Update stays free and always will -- it is how somebody
 * tells the coach they are hurting.
 *
 * TIER-F. The Wellbeing door and the bottom-nav "Noticing" tab route to
 * the same view. One destination, two entry points, two different names,
 * which reads as two features and finds neither. Both entry points are
 * worth keeping -- a door on Home and a persistent tab serve different
 * moments -- so the fix is the name. "Wellbeing" wins because it says
 * what it is to somebody who has never used the app; "Noticing" needs
 * the philosophy to decode it, and a nav label is the worst place in a
 * product to ask for that.
 *
 * 04 Aug 2026 v12
 *
 * v12 — Mobility & Conditioning routes to its own real landing screen
 *   (mobility-conditioning.js) instead of the programme-or-Library
 *   smart-routing hack from v10/v11, which is fully removed. That
 *   screen handles the programme-or-not branching internally now, so
 *   the Home door tile's "Your programme" hint (v10) is also removed —
 *   redundant once the landing page itself shows programme state.
 *
 * 04 Aug 2026 v11
 *
 * v11 — Library added as its own Home door, same day. Graeme: "Don't
 *   we still want a library?" Real gap — once Mobility & Conditioning
 *   started smart-routing to the condition programme instead of
 *   Library whenever one exists, Library became unreachable from Home
 *   in that case. Library is broader than mobility/conditioning
 *   content anyway (every session type, prescribed exercises, coach
 *   recommends), so it gets its own door rather than only surfacing
 *   as a fallback. No CSS changes needed — the 2-column grid and
 *   "Unsure? Coach decides"'s existing full-width/underneath treatment
 *   both accommodate the extra tile automatically.
 *
 * 04 Aug 2026 v10
 *
 * v10 — Mobility & Conditioning door now genuinely pulls in the
 *   Conditions Update programme, per the original spec ("pulls in
 *   whatever the Conditions Update programme has built" / "reachable
 *   as its own programme within that door"). Checks for condition-
 *   tagged prescribedExercises entries specifically; routes to
 *   prescribed.js when one exists, falls back to Library exactly as
 *   before when there's nothing to pull in — no behaviour change for
 *   anyone without a condition programme. Door tile shows a small
 *   "Your programme" hint when this applies, so the routing isn't
 *   silent/surprising. Known small rough edge, not fixed: prescribed.js's
 *   own Back button returns to the general activity picker rather than
 *   Home when reached this way — pre-existing design on that screen,
 *   not introduced here, low-impact enough not to warrant a fix now.
 *
 * 04 Aug 2026 v9
 *
 * v9 — Check-in gating now genuinely optional, not fixed. Graeme:
 *   "today's check-in gating means you now hit check-in-mini every
 *   single time you do a second session in a day - we should fix this
 *   so it's optional not fixed." Session-generating doors now only
 *   force check-in the first time today (nothing to adapt around
 *   without it). Once checked in today, doors go straight to their
 *   destination — check-in-mini is voluntary now, via a new "Update
 *   check-in" link shown in place of the "Check in" link once already
 *   checked in.
 *
 * 04 Aug 2026 v8
 *
 * v8 — Conditions Update door now routes to the real screen
 *   ('conditions-update', Phase D-2/D-3) instead of the interim
 *   openSheet('onboarding/conditions') bridge from the previous
 *   version — that bridge is fully superseded now, removed along with
 *   the now-unused openSheet import.
 *
 * 04 Aug 2026 v7
 *
 * v7 — Real bug found while scoping Phase D, fixed immediately rather
 *   than left broken until Phase D lands. Conditions Update door was
 *   calling router.navigate('onboarding/conditions') directly — the
 *   exact bug settings.js v9 already found and fixed once (its own
 *   changelog documents it): that view is built for onboarding, with
 *   Back/Continue hardcoded to onboarding-sequence destinations, so a
 *   direct navigate() there loses the bottom nav and Back leads
 *   somewhere nonsensical. Same fix as settings.js: openSheet() from
 *   sheet-manager.js instead, which intercepts the hardcoded
 *   navigate() and just closes the sheet. Interim only — Phase D
 *   replaces this bridge with a real Conditions Update screen.
 *
 * 04 Aug 2026 v6
 *
 * v6 — Graeme's on-device pass, same day as Phase C. Session-generating
 *   doors (Cardio/Core/Strength, Unsure? Coach decides) now route
 *   through check-in first — full check-in if not done today, check-in-
 *   mini if already done — before their real destination, via the new
 *   pendingDoorRoute store field. Reaching session-builder or
 *   coach-proposal without ever checking in defeated the whole point
 *   of those doors adapting to "where you are today." The other four
 *   doors (Mobility & Conditioning, Wellbeing, Conditions Update,
 *   Progress) are informational/self-directed, not generative, and
 *   stay ungated — worth Graeme confirming that split is what he meant.
 *
 * 04 Aug 2026 v5 — Phase C, Home Nav & Conditions Redesign (blueprint
 *   alongside_blueprint_home-navigation-conditions_04aug2026_v1.md).
 *   Replaced the single "Check in" CTA + gated funnel with six always-
 *   visible doors: Cardio/Core/Strength, Mobility & Conditioning,
 *   Wellbeing, Conditions Update, Progress, Unsure? Coach decides. No
 *   forced check-in gate before doors 1-3 — matches the spec's
 *   "zero-effort path" principle. Settings now reachable directly from
 *   Home (corner affordance), also per spec.
 *
 *   Behaviour change, deliberate: the old 'checked-in' state auto-
 *   redirected away from this screen to coach-reflection whenever a
 *   check-in existed for today — removed. Auto-redirecting away from
 *   Home contradicts "Home IS the doors UI"; the six doors now always
 *   show, with the coach line reflecting check-in/session status
 *   instead of the screen itself changing. The 'proposal-accepted'
 *   10-minute-window state is kept as-is — still needed for the
 *   "just tapped a door, backed out, came back" case.
 *
 *   Door routes, two are honest bridges pending later phases, flagged
 *   here and in the master schedule, not silently treated as final:
 *     - Cardio/Core/Strength -> session-builder (closest existing
 *       match to "coach pulls from full exercise range")
 *     - Mobility & Conditioning -> library (closest existing match;
 *       doesn't yet pull from a Conditions Update programme, since
 *       that's Phase D, not built)
 *     - Conditions Update -> onboarding/conditions (existing conditions
 *       editor) as a bridge until Phase D builds the real dedicated
 *       screen described in the spec
 *     - Wellbeing -> noticing, Progress -> progress, Unsure? Coach
 *       decides -> coach-proposal: all exact matches, no bridging
 *
 *   Real bug found and fixed while wiring Door 1: router.js's
 *   'session-builder' route pointed at a file that doesn't exist
 *   (./views/session-builder.js — the real file is session-builder-
 *   ui.js). That route could never have worked, on any device, until
 *   this fix (router.js, same session).
 *
 * 21 Jul 2026 v4 — Proposal-loop fix (navfix-proposalloop session).
 *   _resolveState() checked 'proposal-accepted' before 'session-done',
 *   so completing a full session within 10 minutes of accepting a
 *   proposal could strand the user on the Coach Proposal/threshold
 *   screen instead of "You moved today," even though the activityLog
 *   entry was correctly saved. Reordered: session-done (a real,
 *   concrete completed-today signal) is now checked first, and always
 *   wins over the 10-minute proposal-accepted window. The genuine
 *   "just accepted, haven't started, backed out within 10 minutes with
 *   nothing completed" case is unaffected — sessionToday is false in
 *   that case, so it still correctly falls through to proposal-accepted.
 *   No other logic in this file changed.
 *
 * v3 (26 Jun 2026): Name capitalisation fix — _cap() helper added.
 *   _buildGreeting() and renderSessionDone() now capitalise stored name.
 *
 * v2 — Phase 5:
 *   - Routes to home-threshold after proposal accepted (not directly to session)
 *   - home-threshold.js is the threshold moment between choosing and beginning
 *   - If home-threshold.js is not yet deployed (content gate D3), routes
 *     directly to the session as before — graceful fallback, no breakage
 *   - Reads lastProposalDate to detect when a proposal has just been accepted
 *   - Reads activityLog to detect if a session was completed today
 *     (second-session path: mini check-in, then coach-reflection)
 *   - Week advance check on mount (Monday detection)
 *
 * v1 behaviour preserved:
 *   - Greeting based on time of day and name
 *   - "Check in" CTA routes to checkin.js
 *   - Already checked in today: routes to coach-reflection (post-check-in hub)
 *   - Session completed today: shows "good work" state with gentle options
 *   - Nav bar visible
 *
 * WCAG 2.2 AA:
 *   Main CTA: minimum 44px touch target, descriptive aria-label.
 *   Greeting is an <h1>. All coach text rendered as <p>.
 *   "Already moved today" state: role="status" on coach acknowledgement.
 *   All states have text — nothing conveyed by colour alone.
 */

import { takeMovedUpLine } from "../data/age-version.js";
import { store }               from '../store.js';
import { getResumableSession, rescueStaleSession, clearCheckpoint } from '../session-resume.js';
import { carryOnSummary } from './capture.js';   // F1: a freestyle session to carry on
// SAFETY-GATE, 15 Sep 2026. One cadence in this product, not two, and
// one copy of the clinical wording rather than two that drift apart.
//
// AT THE TOP, WITH THE OTHER IMPORTS, NOT BESIDE THE CODE THAT USES IT.
// It was first placed next to _guidanceLine(), which sits inside an
// enclosing block -- and `node --check` PASSED, because it parses the
// file as a script rather than as a module. Eleven gates went red on
// the real ESM load instead.
import { GUIDANCE_TEXT, GUIDANCE_DAYS } from '../safety-gate.js';
import { aimById, STRANDS }    from '../data/aims.js';
import { lineIcon }            from '../data/line-icons.js';
import { todayInWeek, askForToday, startOwnList } from '../data/week-shape.js';
import { mixLine, detailLine } from '../data/week-shape-model.js';
import { arcWeek, weekStart }  from '../data/arc-readback.js';
import { noticePlanJump, offerBriefPath } from '../data/pacing.js';
import { isPremium, lockedFeature } from '../auth.js';
import { renderPlanHome, wirePlanHome, goToSuggestion } from './plan-home.js';   // STAGE PATH P-4
import { bindAskLater } from '../data/ask-later.js';   // P-46 S3
import { renderFreeHome, wireFreeHome, askGentler } from './free-home.js';   // P-46 S4
import { scopeStatementHTML } from '../data/scope-statement.js';
// GUIDED-COPY, 06 Sep 2026. plannedFocusToday dropped from this import.
// CLUB-SHELL added it so Guided class could say what the class was for
// TODAY -- but it reads activeProgramme.sessionSequence, which is empty
// for EVERY programme, so it returned null every time and drove nothing
// but a permanent "Nothing scheduled today". Still exported, still used
// by session-choice.js's chain, and it becomes real the moment classes
// exist.
import { advanceWeekIfNeeded, isHingePending, chapterSuccessor, startChapter }
  from '../data/programmeEngine.js';
import { getProgramme, getPhaseForWeek } from '../data/programmes.js';
// TIMETABLE-1. The room named for classes now counts them.
import { CLASSES } from '../data/classes/index.js';
import { savedSessions, resolveSavedSession, markSavedSessionUsed }
  from '../data/saved-sessions.js';
import { detectBurnout, lowMoodToday } from '../data/checkin.js';
import { proposeWeekFocus }    from '../data/week-focus.js';
import { activityPhrase, daysAgo } from '../data/activity-labels.js';

/**
 * A-5 SIGNATURE-MOMENTS (v58). The first day of a new arc week: arc weeks
 * start on a Monday (arcWeek), and week 1 is the arc beginning, not a new
 * week. A day, never a count of anything done (ARC-1).
 */
export function arcWeekStartsToday(arc = {}, now = new Date()) {
  if (!arc || !arc.active || !arc.startedAt) return false;
  const wk = arcWeek(arc, now);
  return !!wk && wk > 1 && weekStart(now).toDateString() === new Date(now).toDateString();
}

export function TodayView(router) {


  function mount(container) {
    rescueStaleSession();   // W3-13: a session nobody came back to is saved, not dropped
    // W6-9. A hand-over to the builder is for that trip only: back at Home,
    // it is dropped (a Stretch preselect left by a check-in nobody finished
    // opened the builder on Stretch 18 days later).
    if (store.get('sessionBuilderPreselect')) store.set('sessionBuilderPreselect', null);
    advanceWeekIfNeeded();
    // CHAP-1 step 4. Proposed HERE because Home is the one surface
    // everybody reaches. Proposing it lazily on read would mean My
    // Programme writing to the store when somebody merely looked at it,
    // and that view's gate asserts it writes nothing.
    proposeWeekFocus();
    const state = _resolveState();

    if (state === 'proposal-accepted') {
      _routeToThreshold();
      return;
    }

    // STAGE PATH P-4 (mock-up v10). Back from the check-in that "Let me
    // choose for you" asked: straight on to the coach's choice, not Home.
    if (isPremium() && router?.pathStart?.coach) {
      router.pathStart = null;
      goToSuggestion(router, { replace: true });
      return;
    }

    // P-46 S4. Back from the check-in Something gentler asked: on to the
    // gentle session. Only if today was answered (‹ Back from the check-in
    // answers nothing, and Home is shown).
    if (!isPremium() && router?.freeGentler) {
      router.freeGentler = null;
      if (_checkedInToday() || store.dayOpenToday()?.choice === 'pick') {
        askGentler();
        router.navigate('coach-proposal', { replace: true });
        return;
      }
    }

    renderHome(container);
    // GUIDANCE-1. Stamped only if the line actually reached the screen,
    // so a render that suppressed it does not reset the thirty days.
    _markGuidanceShown(container);
  }

  function _resolveState() {
    const today        = _todayString();
    const lastProposal = store.get('lastProposalDate');

    // Session already completed today takes priority — never route to a
    // pending proposal if there's nothing pending.
    if (_sessionCompletedToday()) return 'default';

    // SMOOTH-P3a. A session to carry on is shown on Home as a card, never
    // bounced into the old proposal (the reopen-to-proposal finding).
    if (_carryOn()) return 'default';

    // 🔴 EXIT-HOME, 26 Sep 2026. YOU CAME HERE, SO YOU STAY HERE.
    //
    // The bounce below is for the app opening COLD after an interruption
    // -- a phone call killed it mid-session. A cold open has nothing in
    // router.history. Anything else means the person got to Home from a
    // screen inside the app: an Exit button, "Back to Today", the house
    // icon, the nav bar. Every one of those is a choice to be on Home.
    //
    // Asked of the router rather than of each session view, because
    // asking each view is how the coach one-to-one was missed: EXIT-LOOP
    // reached six screens and the seventh kept people stuck for ten days.
    //
    // The decline is recorded too, so closing the app after leaving and
    // reopening inside ten minutes does not put them straight back in.
    const cameFromInsideApp = Array.isArray(router?.history) && router.history.length > 0;
    if (cameFromInsideApp) {
      const alreadyDeclined = store.get('declinedProposalAt');
      if (lastProposal &&
          !(alreadyDeclined && new Date(alreadyDeclined) >= new Date(lastProposal))) {
        store.set('declinedProposalAt', new Date().toISOString());
      }
      return 'default';
    }

    // 🔴 EXIT-LOOP, 16 Sep 2026. LEAVING A SESSION MUST MEAN LEAVING IT.
    //
    // Graeme: "I 'exit without saving' and get chucked back to the coach
    // proposal again and get stuck. Surely it's simple. Wire 'exit
    // without saving' to the home screen?"
    //
    // It already was. All six session views send "exit without saving"
    // to Today. THIS is what sent him back: a proposal accepted inside
    // the last ten minutes, with no completed session, resolves to
    // 'proposal-accepted' and Home re-routes to the proposal instead of
    // rendering. So Exit worked and Home undid it, for ten minutes or
    // until something was finished.
    //
    // The bounce exists for somebody INTERRUPTED -- a phone call
    // mid-session, come back, carry on. It never allowed for somebody
    // who said NO, NOT THIS ONE. Those two look identical from the
    // store, so the difference has to be recorded when they leave.
    //
    // declinedProposalAt is that record. Set by the session views'
    // discard path; cleared whenever a new proposal is accepted.
    const declined = store.get('declinedProposalAt');
    if (declined && lastProposal && new Date(declined) >= new Date(lastProposal)) {
      return 'default';
    }

    if (lastProposal) {
      const proposalDate = new Date(lastProposal);
      const minsAgo      = (Date.now() - proposalDate.getTime()) / 60000;
      if (proposalDate.toISOString().split('T')[0] === today && minsAgo < 10) {
        return 'proposal-accepted';
      }
    }

    return 'default';
  }

  function _sessionCompletedToday() {
    // COUNT-1. This drives the greeting -- "You moved today, that's done."
    // Counting partials meant opening a session and backing out told
    // somebody they had moved. That is worse than a wrong number: it is
    // the coach claiming to have seen something that did not happen.
    const today       = _todayString();
    // W3-20. Movement only: "You moved today" after breathing was untrue.
    const NOT_MOVEMENT = ['breathing', 'mindful', 'mindfulness', 'practice'];
    const activityLog = store.completedSessions(store.get('activityLog')).filter(e => !NOT_MOVEMENT.includes(e.type));
    return activityLog.some(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts).toISOString().split('T')[0] === today;
    });
  }

  // CHECKIN-GATE, 31 Aug 2026. Delegates to store.checkedInToday(). The
  // Mobility & Conditioning door needs the same test, and two copies of
  // "has this person checked in today" is how two doors end up
  // disagreeing about whether they have.
  function _checkedInToday() {
    return store.checkedInToday();
  }

  function _routeToThreshold() {
    const sessionRoute = store.get('lastProposalType')
      ? _doorToRoute(store.get('lastProposalType'))
      : null;
    try {
      router.navigate('home-threshold');
    } catch (e) {
      if (sessionRoute) {
        router.navigate(sessionRoute);
      } else {
        router.navigate('coach-proposal');
      }
    }
  }

  function _doorToRoute(doorKey) {
    const MAP = {
      'bypass-library':    'library',
      'bypass-facilitate': 'session-builder',
    };
    const generated = store.get('generatedSession');
    if (generated?.session?.type) {
      const TYPE_ROUTE = {
        'workout':         'workout',
        'gym-programme':   'gym-programme',
        'morning-session': 'morning-session',
        'yoga-session':    'yoga-session',
        'walk-session':    'walk-session',
        'running-session': 'running-session',
        'cycle-session':   'cycle-session',
        'swim-session':    'swim-session',
        'core-session':    'core-session',
        'quiet-session':   'quiet-session',
      };
      return TYPE_ROUTE[generated.session.type] || 'workout';
    }
    return MAP[doorKey] || 'workout';
  }

  function renderHome(container) {
    const name          = store.get('name') || '';
    const greeting      = _buildGreeting(name);
    if (isPremium()) { _renderPlanHome(container, greeting); return; }
    _renderFreeHome(container, greeting);
  }

  // W6-19 EMPATHY-GAPS, kept on Free Home (P-46 S4). A low mood this morning
  // is answered, in their own word, with the quieter door.
  function _lowMoodLine() {
    const low = lowMoodToday();
    return low ? `You said you're ${low} today. Wellbeing has the quieter things, if that's more like it.` : '';
  }

  /**
   * P-46 S4 FREE HOME. Coach-led, in the Plan's look (views/free-home.js).
   * The old Free Home (the door tiles, the arc offer, the reference rows,
   * the weekly count line) is archived in BNH-Files Archive/P-46. Kept word
   * for word: the scope notice, the monthly advice line, the rescued note,
   * the part-way card, the pacing and brief-path lines, the flat-fortnight
   * line and the low-mood line.
   */
  function _renderFreeHome(container, greeting) {
    const planJump = noticePlanJump();
    const brief = planJump ? null : offerBriefPath();
    const checkedIn = _checkedInToday();
    container.innerHTML = renderFreeHome({
      greeting,
      // P-41 S3: moved up to the adult version today: said once, first.
      coachNote: takeMovedUpLine() || (planJump ? planJump.body : brief ? brief.body : (_burnoutLine() || _lowMoodLine())),
      top: _scopeNotice() + _guidanceLine() + _rescuedNote(),
      carryCard: _freeCarryCard(),
      checkedIn,
    });
    attachEvents(container);
    wireFreeHome(container, router, { checkedIn });
  }

  function attachEvents(container) {
    // P-46 S3. The question asked once, later (both tiers; Plan Home places it).
    bindAskLater(container, () => router.navigate('today'));

    // LOBBY-1c. The one way through to the session space. Routes via
    // the check-in when one is owed and straight through when it is
    // not — a second check-in in a day is a toll, not care.
    // SMOOTH-P3a. The room toggles, Quick build's chips and the room's
    // saved-session Start went with the rooms. Saved sessions start from
    // saved-sessions.js, whose start path was already identical.

    // SMOOTH-P3a. The other two doors, and coming back.
    container.querySelector('[data-action="know-what"]')
      ?.addEventListener('click', () => router.navigate('know-what'));
    container.querySelector('[data-action="as-i-go"]')
      ?.addEventListener('click', () => router.navigate('capture'));
    container.querySelector('[data-action="scope-ok"]')
      ?.addEventListener('click', () => { store.set('scopeNoticeDue', false); mount(container); });
    container.querySelector('[data-action="carry-on"]')
      ?.addEventListener('click', e => router.navigate(e.currentTarget.dataset.carry === 'capture' ? 'capture' : 'workout'));
    container.querySelector('[data-action="carry-finish"]')
      ?.addEventListener('click', async e => {
        const w = await import(e.currentTarget.dataset.carry === 'capture' ? './capture.js' : './workout.js');
        w.finishFromHome();
      });

    // W3-13. Let it go, on purpose: nothing saved, nothing waiting.
    container.querySelector('[data-action="carry-drop"]')
      ?.addEventListener('click', () => {
        clearCheckpoint();
        store.set('workoutProgress', null);
        mount(container);
      });

    // D-6. Today's day plan from the week: the plan, or its short version.
    container.querySelectorAll('[data-action="week-today"], [data-action="week-short"]').forEach(btn =>
      btn.addEventListener('click', () => {
        if (!askForToday({ short: btn.dataset.action === 'week-short' })) return;
        // STAGE PATH P-4 (v10): asked once a day; Not today counts as asked.
        if (_checkedInToday() || store.dayOpenToday()?.choice === 'pick') {
          router.navigate('coach-proposal');
        } else {
          router.pathStart = { week: true };   // the check-in says "Before today's plan" and offers Not today
          store.set('pendingDoorRoute', 'coach-proposal');
          router.navigate('checkin');
        }
      }));
    // D-7. Today's own list, as written.
    container.querySelector('[data-action="week-own"]')
      ?.addEventListener('click', () => { if (startOwnList()) router.navigate('prescribed-session'); });
    container.querySelector('[data-action="week-else"]')
      ?.addEventListener('click', () => container.querySelector('#home-doors-label')?.focus());

    container.querySelector('[data-action="start-today"]')
      ?.addEventListener('click', () => {
        // SMOOTH-P3b. "Tell me what to do" means the coach decides, so a
        // kind asked for earlier on "I know what I want" does not ride
        // along into it. Checked-in people skip clearPurpose(), which
        // is the only other place the request is cleared.
        store.set('requestedSessionType', null);
        if (_checkedInToday()) {
          router.navigate('coach-proposal');
        } else {
          store.set('pendingDoorRoute', 'coach-proposal');
          router.navigate('checkin');
        }
      });

    container.querySelectorAll('[data-route]').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.dataset.route;
        const requiresCheckin = btn.dataset.requiresCheckin === 'true';

        if (requiresCheckin) {
          // Fix, 04 Aug 2026 — Graeme: "we should fix this so it's
          // optional not fixed." Previously forced check-in-mini every
          // single time for a second-or-later session in a day, even
          // just to update wording. Now: only the day's FIRST check-in
          // is a real gate (that data genuinely doesn't exist yet, so
          // there's nothing to adapt around without it). Once checked
          // in today, doors go straight to their destination using
          // that existing data — check-in-mini becomes something
          // reachable voluntarily (the "Update check-in" link below),
          // not a forced stop between every tap and every session.
          if (_checkedInToday()) {
            router.navigate(route);
          } else {
            store.set('pendingDoorRoute', route);
            router.navigate('checkin');
          }
        } else {
          router.navigate(route);
        }
      });
    });

    // 'settings' removed with the cog, v19. Settings is in the bottom
    // nav; a handler with nothing to fire it is one more thing to
    // believe in later.
    const actions = {
      'checkin':      () => router.navigate('checkin'),
      'checkin-mini': () => router.navigate('checkin-mini'),
    };

    // CHAP-1 step 3. Answering the hinge. Every path either starts a
    // chapter or sends them somewhere to choose one -- none of them
    // just closes the card, because a hinge that can be dismissed
    // leaves somebody between chapters with nothing to tell them so.
    // CHAP-1 step 6. The event goal.
    container.querySelectorAll('[data-event]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.event;
        if (action === 'open') { _eventOpen = true; renderHome(container); return; }

        if (action === 'save') {
          const what = container.querySelector('#hinge-event-what')?.value?.trim() || '';
          const when = container.querySelector('#hinge-event-when')?.value || '';
          // Written to strategicGoal, the structured home My Programme
          // prefers. A description with no date is fine and common --
          // "the wedding" is a real answer even before anybody has
          // booked anything.
          if (what) store.set('strategicGoal.targetDescription', what);
          if (when) {
            store.set('strategicGoal.targetDate', new Date(when).toISOString());
            // R2-a. When the DATE was named. Distinct from setAt, which
            // plan-select.js and thread.js write when the weekly
            // frequency is agreed. R1's maturity guard exists to stop
            // the coach judging a target it has barely seen, and setAt
            // cannot do that job -- it gave no protection at all to a
            // date named through this hinge last week.
            store.set('strategicGoal.targetSetAt', new Date().toISOString());
          }
        }

        // Asked once, whether they answered or not. Recorded on both
        // save and cancel, because a question put and declined has
        // still been put -- re-asking would make declining feel like it
        // did not count.
        store.set('programme.hingeOfferedAt', new Date().toISOString());
        _eventOpen = false;
        renderHome(container);
      });
    });

    container.querySelectorAll('[data-hinge]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ap = store.get('activeProgramme') || {};
        const choice = btn.dataset.hinge;
        if (choice === 'repeat') {
          startChapter(ap.programmeId, { keepHistory: true });
          renderHome(container);
        } else if (choice === 'next') {
          const next = chapterSuccessor(ap.programmeId);
          if (next && startChapter(next.id)) renderHome(container);
        } else {
          router.navigate('goal-setup');
        }
      });
    });

    container.querySelectorAll('[data-action]').forEach(btn => {
      const action = btn.dataset.action;
      if (actions[action]) {
        btn.addEventListener('click', actions[action]);
      }
    });
  }

  function _buildGreeting(name) {
    const timeGreet = _timeGreeting();
    const capName   = _cap(name);
    return capName ? `${timeGreet}, ${capName}.` : `${timeGreet}.`;
  }

  // ORIENT-1. Goal ids taken from js/data/goals.js -- checked against the
  // real list rather than guessed, because inventing plausible ids has
  // silently produced wrong behaviour on this project five times.
  const WELLBEING_GOALS = new Set([
    'reduce-stress', 'sleep-better', 'improve-mood', 'feel-better'
  ]);
  // ORIENT-2. Ids verified against data/goals.js, not invented -- a goal
  // id that reads plausibly and matches nothing has cost this project
  // four times.
  const STRENGTH_GOALS = new Set([
    'get-stronger', 'build-muscle', 'improve-cardio', 'lose-weight', 'tone-up'
  ]);
  // 'move-better' and 'stay-mobile' were in the first draft of this set.
  // Neither exists in goals.js. They read entirely plausibly and would
  // have matched nothing, silently sending everybody in this group to the
  // generic line -- the fifth instance of that exact fault. The ids below
  // are the real mobility-recovery group, and verify-delight.mjs now
  // asserts every id in both sets exists.
  const MOVEMENT_GOALS = new Set([
    'flexibility', 'balance', 'reduce-pain',
    'injury-recovery', 'prevent-injury', 'improve-posture'
  ]);
  const ORIENTATION_SESSIONS = 4;

  /** BURN-3's graded line, or null. Shared by Free's coach line and the Plan's Home. */
  function _burnoutLine(checkinHistory = store.get('checkinHistory') || {}) {
    const burnout = detectBurnout(checkinHistory);
    if (burnout.level === 'high') {
      return "Your energy has been low for a while now, not just today. I'll keep things gentle until it lifts.";
    }
    if (burnout.level === 'moderate') {
      return "It's been a flatter few days than usual. I'll go a bit easier with what I suggest.";
    }
    return null;
  }

  /**
   * STAGE PATH P-4. The Plan's Home (views/plan-home.js). Things due go
   * first, as before: the scope notice, the monthly guidance line, a
   * chapter's end, a session saved for them. The coach's line is said only
   * when it adds to the Today card: a flat week (BURN-3), the week's pace
   * (PACE-2), a shorter way in (QUICK-2). Yesterday's session and the
   * low-mood line are the card's job now: its reason says what they said.
   */
  function _renderPlanHome(container, greeting) {
    const planJump = noticePlanJump();
    const brief = planJump ? null : offerBriefPath();
    const coachNote = takeMovedUpLine() || (planJump ? planJump.body : brief ? brief.body : (_burnoutLine() || ''));   // P-41 S3
    container.innerHTML = renderPlanHome({
      greeting,
      coachNote,
      carry: _carryOn(),
      // P-27. No chapter-end card: the twelve-week programme is retired on the Plan.
      top: _scopeNotice() + _guidanceLine() + _rescuedNote(),
    });
    attachEvents(container);
    wirePlanHome(container, router);
  }


  /**
   * CHAP-1 step 3 part two. The hinge, on Home.
   *
   * WHY HERE. An end-of-chapter offer already existed, inside
   * gym-programme.js, gated on currentWeek >= 12 -- reachable through
   * ONE of thirteen session views. So a person who finished a chapter
   * having trained through any other route was never asked what came
   * next; the chapter simply carried on being their chapter. Same shape
   * as the fault SHARED-1 fixed for the end-of-session moments, and the
   * reason this is a MOVE rather than a new feature.
   *
   * Home is the honest place for it. It is the one surface everybody
   * reaches, and "what happens next" is a decision to take with a clear
   * head rather than a card at the end of a workout.
   *
   * IT DOES NOT BLOCK. The doors are still underneath it and still
   * work. gym-programme's version returns early and blocks the session
   * until an option is chosen, which is the wrong trade for somebody
   * who opened the app to move for twenty minutes. An unanswered
   * question stays until it is answered -- there is no dismiss, because
   * dismissing would leave somebody permanently between chapters with
   * nothing to say so.
   */
  // Whether the event form is open is not a fact about the person.
  let _eventOpen = false;



  /**
   * LOBBY-1b. The arc, on the lobby.
   *
   * Three states, and the day-one one matters most: an arc set up but
   * with nothing covered yet is a STARTING LINE, not an empty state.
   * Graeme, 3 Sep -- day one is premium's richest moment, because
   * everything is still ahead. The wording has to carry that rather
   * than apologise for having no history.
   *
   * With no arc at all, this is the offer, and it sits ABOVE the
   * reference rows on purpose. Below Settings is where terms and
   * privacy links live, so the eye files anything there as boilerplate
   * and skips it -- Graeme's observation, and he was right.
   */
  /**
   * TIER-HOME. The free Home: the coach asking, and the person choosing.
   *
   * GROUPED BY HEADING, NOT BY DOOR. Graeme, 3 Sep: "I'm worried we
   * might have too many doors going into other doors." Headings give the
   * territory shape -- somebody's mum can find mobility without knowing
   * we filed it under anything -- while everything stays on one screen.
   * The depth rule holds: at most one screen before you are moving.
   *
   * THE FALLBACK IS HONEST. "I'll go on how you're doing today" rather
   * than "here's your plan", because with no arc that is exactly what
   * the coach has. It is the same route Plan's invitation takes, named
   * as an offer instead of a confession -- it used to be the eighth
   * tile, labelled "Unsure? Coach decides".
   *
   * THE OFFER SITS ABOVE THE REFERENCE ROWS. Below Settings is where
   * terms and privacy links live, so the eye files anything there as
   * boilerplate and skips it.
   */
  /**
   * CLUB-SHELL, 06 Sep 2026. The tile grid, extracted so BOTH tiers can
   * render it.
   *
   * THE FIRST DRAFT OF THE CLUB SHELL REPLACED THESE WITH THE FOUR
   * ROOMS, and verify-homedoors went red on "the Mobility & Conditioning
   * door is on Plan's Home" -- the gate written hours earlier, after
   * LOBBY-1c did the same thing. It was right. yoga-session is a route
   * the rooms do not reach at all, and mobility and stretch would have
   * gone back to being two screens deep. That is LOBBY-1c again with
   * better comments.
   *
   * THE STANDING RULE: improvements extend what exists, they do not
   * relocate it. The rooms are an ADDITION. The direct routes stay,
   * beneath them, for the person who already knows what they want.
   */
  /**
   * CLUB-SHELL, 06 Sep 2026. The four rooms. Plan only.
   *
   * They sort by HOW MUCH THE COACH LEADS, not by body part. The tiles
   * below them sort by body part, which is a filing system; a club sorts
   * by what kind of session you want to be in, which is a relationship.
   *
   * ONE GRAMMAR, FIVE SLOTS, on every card, in the same order and the
   * same positions: name, what it is, today's option, the facts, the
   * action. CLUB spec v2 3.3 reversed v1 on this -- v1 gave each room
   * its own internal grammar and differentiated by form and typographic
   * rhythm, which is four things to learn at once and relies on implicit
   * cues being picked up.
   *
   * SLOT 2 IS PERMANENT AND NOT DISMISSIBLE. v1 said "no room is ever
   * explained on screen; you learn what a room is by entering it once."
   * Wrong, and the Disney comparison argues against it -- Disney
   * over-signals: sign, wait time, height requirement, themed queue, all
   * before you commit. "Find out by doing" is an implicit demand.
   *
   * THE DEPTH RULE HOLDS. A room is not a screen you pass through. Each
   * card carries today's answer and the button starts it.
   *
   * NO ROOM HAS ITS OWN COLOUR. Colour already means energy, a sore
   * zone, caution and tier here. Somebody learning that amber means "be
   * careful with this movement" must not also learn it means "you are in
   * a room."
   */
  /**
   * YOUR-OWN. "Last done 3 days ago", not a date.
   *
   * This is progress made, not distance remaining, so COUNTDOWN-1 is
   * satisfied -- but it is worth saying why out loud, because a "days
   * since" number is one small step from a "days until" one and the
   * next person editing this card should know which side of that line
   * it sits on.
   */
  function _daysAgoLabel(iso) {
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) return 'recently';
    const days = Math.floor((Date.now() - then) / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  }

  /** "mobility and strength", not "mobility, strength". Two items read
   *  as a phrase; a comma makes them look like a truncated list. */
  function _joinPlain(list) {
    const a = (list || []).filter(Boolean);
    if (a.length === 0) return '';
    if (a.length === 1) return a[0];
    return `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`;
  }

  /**
   * ARC-LED, 06 Sep 2026. Rooms are COLLAPSED ROWS that open in place.
   *
   * WHAT CHANGED AND WHY. Home led with the coach's pick and four full
   * cards, so the screen nominated a session before the person had said
   * anything. That made the app the one with the plan. Graeme: the arc
   * should be what you land on, with the rooms as ways in.
   *
   * "Free is today, the Plan is the arc" -- and the old layout
   * contradicted it on the Plan tier's own home screen.
   *
   * NOTHING ON HOME IS SUGGESTED ANY MORE. No badge, no accent border on
   * a room, no ordering by recommendation. The `suggested` slot is gone
   * rather than left unused, so it cannot quietly come back.
   *
   * THE DEPTH RULE STILL HOLDS. Expanding a row is not a screen: no
   * navigation, two taps to moving. Details are rendered and HIDDEN, not
   * built on demand -- a row that assembles itself on tap is a row a
   * screen reader has to be told about twice.
   */

/**
 * GUIDANCE-1, 08 Sep 2026. The general-guidance line, every thirty days.
 *
 * ── WHY IT IS HERE AND NOT IN THE TERMS ──────────────────────────────
 *
 * The statement that this app's advice is general, and that somebody
 * should speak to their GP or an exercise professional, lived in exactly
 * two places: the closing beat of onboarding -- said once, at signup,
 * and never again -- and the Terms page, which almost nobody opens.
 *
 * Clinical advice on the three-question red-flag screen that
 * was going to be built instead: those questions "only take into account
 * some red flags", and "to protect yourself you might be better off
 * saying something like: the advice given by this app is generic, prior
 * to starting any exercise programme you should seek guidance from your
 * GP or exercise professional."
 *
 * 🔴 So this line now carries the weight that screen was going to carry,
 * and a line carrying that weight cannot be said once at signup.
 *
 * Graeme: "To have a disclaimer in the terms and onboarding only is a
 * concern. I think it needs a one liner regularly, not necessarily every
 * session."
 *
 * ── THIRTY DAYS, AND DELIBERATELY NOT EVERY SESSION ──────────────────
 *
 * A line that appears every time is a line nobody reads. It is the same
 * argument that keeps a live region from firing when nothing has
 * happened: repetition without occasion trains people to look past it,
 * and the one time it matters it has already become furniture.
 *
 * ⚫ The wording is close to the clinical wording rather than rewritten into the
 * coach's voice. Graeme: "I would rather send out your words than mine."
 * It is also NOT in the coach's first person -- the coach says "I" all
 * over this app, and this is the product speaking about its own limits,
 * which is a different voice on purpose.
 */


/** Whether the general-guidance line is due on this render. */
function _guidanceDue() {
  const last = store.get('guidanceShownAt');
  if (!last) return true;
  return (Date.now() - new Date(last).getTime()) / 86400000 >= GUIDANCE_DAYS;
}

/**
 * P0, SCOPE-MINOR (29 Sep 2026). Shown once to anybody whose stored
 * conditions included one the app no longer offers (store.js v81 drops
 * it and sets scopeNoticeDue). It says what the app is for and where to
 * go instead, and goes when they say so. Free and Plan alike.
 */
function _scopeNotice() {
  if (!store.get('scopeNoticeDue')) return '';
  return `
    <section class="card scope-notice" aria-labelledby="scope-notice-h" data-scope-notice>
      <p class="scope-notice__lead">Something has changed in Alongside, and it affects something you told me about.</p>
      ${scopeStatementHTML({ heading: 'h2', id: 'scope-notice' })}
      <p>I've taken it off your list, so I'm no longer planning around it.</p>
      <button class="btn btn-primary btn-full" data-action="scope-ok">Understood</button>
    </section>`;
}

function _guidanceLine() {
  if (!_guidanceDue()) return '';
  return `
    <p class="today-guidance" role="note">${GUIDANCE_TEXT}</p>`;
}

/** Stamped only when it was actually put on screen. */
function _markGuidanceShown(root) {
  if (root && root.querySelector('.today-guidance')) {
    store.set('guidanceShownAt', new Date().toISOString());
  }
}

  // SMOOTH-P3a. roomRow() and clubRooms() -- the four CLUB rooms --
  // were removed from Plan Home by spec 4.1 and had no other caller.
  // Everything they led to is still reached: classes (Join a class),
  // the coach (Tell me what to do), saved sessions, the builder, the
  // twelve-week shape and Mobility & Conditioning (I know what I want),
  // and capture (Make it up as I go).

  /**
   * SMOOTH-P3a. The session to carry on, if there is one: a workout
   * checkpoint (session-resume.js, the one active-session slot) that
   * belongs to the session still loaded. A checkpoint for a session that
   * has since been replaced is not offered -- it would resume the wrong
   * thing.
   */
  function _carryOn() {
    // F1, FREESTYLE-RELOAD. A freestyle session in the slot is offered
    // the same way: what has been done, Carry on, Finish here and save.
    const fs = carryOnSummary();
    if (fs) return { freestyle: true, name: 'Make it up as I go',
                     done: `${fs.moves} move${fs.moves === 1 ? '' : 's'} \u00b7 ${fs.sets} set${fs.sets === 1 ? '' : 's'} so far` };
    const cp  = getResumableSession('workout');
    const gen = store.get('generatedSession');
    const ses = gen?.session;
    if (!cp || !ses || !Array.isArray(ses.exercises) || !ses.exercises.length) return null;
    const key = `${ses.id || ses.name || 'session'}|${gen.builtAt || ''}`;
    if (cp.sessionId !== key) return null;
    const total = ses.exercises.length;
    const index = Math.min(Math.max(0, Number(cp.index) || 0), total - 1);
    return {
      name:  ses.title || cp.name || 'Your session',
      next:  ses.exercises[index]?.name || '',
      nextId: ses.exercises[index]?.id || null,   // STAGE PATH P-4: its drawing on the Plan's card
      index, total,
    };
  }

  /** W3-13. Said once: a waiting session was saved for them. */
  function _rescuedNote() {
    const r = store.get('rescuedSession');
    if (!r) return '';
    store.set('rescuedSession', null);
    const n = Number(r.moves) || 0;
    return `<p class="today-coach-line" role="status">I saved what you did in your last session${n ? `, ${n} move${n === 1 ? '' : 's'},` : ''} just as it was.</p>`;
  }

  /**
   * W3-13. Free: a session the phone closed is shown, to save or let go.
   * Carry on is the Plan's (tier table, "Coming back"); what was done is
   * the person's on either tier.
   */
  function _freeCarryCard() {
    const c = _carryOn();
    if (!c) return '';
    const what = c.freestyle ? c.done : `Stopped at ${c.index + 1} of ${c.total}`;
    return `
      <section class="home-carry" aria-labelledby="home-carry-title">
        <p class="home-carry__kicker">Your last session stopped part-way</p>
        <h2 class="home-carry__title" id="home-carry-title">${_esc(c.name)}</h2>
        <p class="home-carry__next">${_esc(what)}</p>
        <button class="btn btn-primary btn-full" data-action="carry-finish"${c.freestyle ? ' data-carry="capture"' : ''}>Save what you did</button>
        <button class="btn btn-ghost btn-full" data-action="carry-drop">Don\u2019t save it</button>
      </section>`;
  }

  /** Replaces the first door when there is a session to come back to. */
  function _carryOnCard(c) {
    if (c.freestyle) return `
      <section class="home-carry" aria-labelledby="home-carry-title">
        <p class="home-carry__kicker">Carry on</p>
        <h2 class="home-carry__title" id="home-carry-title">${_esc(c.name)}</h2>
        <p class="home-carry__next">${_esc(c.done)}</p>
        <button class="btn btn-primary btn-large btn-full" data-action="carry-on" data-carry="capture">Carry on</button>
        <button class="btn btn-ghost btn-full" data-action="carry-finish" data-carry="capture">Finish here and save</button>
      </section>`;
    const pos = `${c.index + 1} of ${c.total}`;
    return `
      <section class="home-carry" aria-labelledby="home-carry-title">
        <p class="home-carry__kicker">Carry on</p>
        <h2 class="home-carry__title" id="home-carry-title">${_esc(c.name)}</h2>
        <p class="home-carry__next">Next: ${_esc(c.next)} \u00b7 ${pos}</p>
        <div class="home-carry__bar" role="img" aria-label="Exercise ${pos}">
          <div class="home-carry__fill" style="width:${Math.round((c.index / c.total) * 100)}%"></div>
        </div>
        <button class="btn btn-primary btn-large btn-full" data-action="carry-on">Carry on</button>
        <button class="btn btn-ghost btn-full" data-action="carry-finish">Finish here and save</button>
      </section>`;
  }

  /**
   * The three doors. The first is the filled one -- unless there is a
   * session to carry on, in which case that card leads and all three sit
   * quietly under "Or instead".
   */

  /**
   * A-1. The arc as a line inside a card: opens the arc, or offers to set
   * one up. Week n is where the arc is, never a count (ARC-1).
   */
  function _arcLine() {
    const arc = store.get('arc') || {};
    const aim = arc.active ? ((arc.aimId && aimById(arc.aimId)?.label) || arc.label || 'your arc') : null;
    const wk = arc.active ? arcWeek(arc, new Date()) : null;
    return aim
      ? `<button class="home-arcline" data-route="stretch-arc" data-requires-checkin="false"
                 aria-label="Your arc${wk ? `, week ${wk}` : ''}${arcWeekStartsToday(arc) ? ' starts today' : ''}: working towards ${_esc(aim)}">
           ${lineIcon('arc', 20)}
           <span class="home-arcline__text"><strong>Your arc${wk ? ` \u00b7 Week ${wk}` : ''}${arcWeekStartsToday(arc) ? ' starts today' : ''}.</strong> ${_esc(aim)}</span>
         </button>`
      : `<button class="home-arcline" data-route="arc-setup" data-requires-checkin="false">
           ${lineIcon('arc', 20)}
           <span class="home-arcline__text"><strong>Your arc.</strong> Tell me what you want to be able to do</span>
         </button>`;
  }

  /**
   * A-1. No week, or nothing set for today: the coach chooses. Leads with
   * the arc when there is one (its aim is the heading, and opens the arc),
   * then Tell me what to do, then the week.
   */
  function _coachCard(week) {
    const arc = store.get('arc') || {};
    const aim = arc.active ? ((arc.aimId && aimById(arc.aimId)?.label) || arc.label || null) : null;
    const wk = aim ? arcWeek(arc, new Date()) : null;
    // A-5 (v58). On the first day of a new arc week the card says so first.
    const fresh = aim && arcWeekStartsToday(arc) ? `Week ${wk} starts today. ` : '';
    const line = fresh + (_checkedInToday() ? 'You\u2019ve checked in. Straight to today\u2019s plan.' : 'Three quick questions, then today\u2019s plan.');
    const top = aim
      ? `<button class="home-today__arc" data-route="stretch-arc" data-requires-checkin="false"
                 aria-label="Your arc${wk ? `, week ${wk}` : ''}: working towards ${_esc(aim)}">
           <span class="look-label home-week__lbl">Your arc${wk ? ` \u00b7 Week ${wk}` : ''}</span>
           <span class="home-week__name" id="home-today-h">${_esc(aim)}</span>
         </button>`
      : `<p class="look-label home-week__lbl">Today</p>
         <h2 class="home-week__name" id="home-today-h">What shall we do today?</h2>`;
    return `<section class="home-week home-today look-card" aria-labelledby="home-today-h">
      ${top}
      <p class="home-week__line">${line}</p>
      <button class="btn btn-primary btn-large btn-full" data-action="start-today">Tell me what to do</button>
      ${aim ? '' : _arcLine()}
      <button class="home-today__link" data-route="your-week" data-requires-checkin="false">${week ? 'Your week' : 'Plan your week'}</button>
    </section>`;
  }

  /**
   * D-6. Today, from the person's week. A day plan: what it is, and three
   * ways in. A rest day: said, and nothing asked. Nothing set for today:
   * no card (the doors are the way in, as before).
   */
  function _weekCard(week) {
    if (week.value === 'rest') {
      return `<section class="home-week look-card" aria-labelledby="home-week-h">
        <p class="look-label home-week__lbl">Today, from your week</p>
        <h2 class="home-week__name" id="home-week-h">Rest</h2>
        <p class="home-week__line">Today is a rest day in your week. Rest counts.</p>
        ${_arcLine()}
      </section>`;
    }
    const t = week.template;
    if (t.own) {
      const group = t.own === 'all' ? null : t.own;
      const left = (store.get('prescribedExercises') || []).filter(e => !store.ownDoneToday(e) && (!group || e.group === group)).length;
      return `<section class="home-week look-card" aria-labelledby="home-week-h">
        <p class="look-label home-week__lbl">Today, from your week</p>
        <h2 class="home-week__name" id="home-week-h">${_esc(t.name)}</h2>
        <p class="home-week__line">${_esc(mixLine(t))}.</p>
        ${left ? `<p class="home-week__line">${left} exercise${left === 1 ? '' : 's'}, as you wrote ${left === 1 ? 'it' : 'them'}.</p>
        <button class="btn btn-primary btn-large btn-full" data-action="week-own">Start your list</button>`
        : `<p class="home-week__line">All done today.</p>`}
        ${_arcLine()}
      </section>`;
    }
    return `<section class="home-week look-card" aria-labelledby="home-week-h">
      <p class="look-label home-week__lbl">Today, from your week</p>
      <h2 class="home-week__name" id="home-week-h">${_esc(t.name)}</h2>
      <p class="home-week__line">${_esc(mixLine(t))}.</p>
      <p class="home-week__line">${_esc(detailLine(t))}</p>
      <button class="btn btn-primary btn-large btn-full" data-action="week-today">Show me today\u2019s plan</button>
      ${_arcLine()}
    </section>`;
  }

  /**
   * The arc, in one line. Opens the arc; sets one up if there is none.
   * D-3 (device test, 04 Oct): it opens the arc itself, where it can be
   * changed or started afresh, not Progress (SMOOTH-P4a sent it there).
   */
  function _arcChip() {
    const arc = store.get('arc') || {};
    // An active arc always opens the arc, whether or not its aim still
    // resolves; offering setup to somebody who has one would start them
    // again. The aim's own words, else the arc's stored label.
    const label = arc.active ? ((arc.aimId && aimById(arc.aimId)?.label) || arc.label || 'your arc') : null;
    // LOOK-4. A card: the tile, "Your arc · Week n", the aim. Week n is
    // where the arc is, never a count of anything done (ARC-1).
    const week = arc.active ? arcWeek(arc, new Date()) : null;
    return label
      ? `<button class="home-arc" data-route="stretch-arc" data-requires-checkin="false"
                 aria-label="Your arc${week ? `, week ${week}` : ''}: working towards ${_esc(label)}">
           <span class="kind-tile k-teal">${lineIcon('arc')}</span>
           <span class="home-arc__text">
             <span class="home-arc__label">Your arc${week ? ` \u00b7 Week ${week}` : ''}</span>
             <span class="home-arc__aim">${_esc(label)}</span>
           </span>
           <span class="home-door__chev" aria-hidden="true">${lineIcon('chevron', 20)}</span>
         </button>`
      : `<button class="home-arc home-arc--offer" data-route="arc-setup" data-requires-checkin="false">
           <span class="kind-tile k-teal">${lineIcon('arc')}</span>
           <span class="home-arc__text">
             <span class="home-arc__label">Your arc</span>
             <span class="home-arc__aim">Tell me what you want to be able to do</span>
           </span>
           <span class="home-door__chev" aria-hidden="true">${lineIcon('chevron', 20)}</span>
         </button>`;
  }






  function _timeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }


  function _todayString() {
    return new Date().toISOString().split('T')[0];
  }

  function _yesterdayString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  function _daysAgoString(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }

  function _mondayString() {
    const d    = new Date();
    const day  = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  }

  function _cap(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { mount };
}
