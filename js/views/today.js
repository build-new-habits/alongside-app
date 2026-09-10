/**
 * today.js
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

import { store }               from '../store.js';
import { aimById, STRANDS }    from '../data/aims.js';
import { noticePlanJump, offerBriefPath } from '../data/pacing.js';
import { isPremium, lockedFeature } from '../auth.js';
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
import { savedSessions, resolveSavedSession, markSavedSessionUsed }
  from '../data/saved-sessions.js';
import { detectBurnout }       from '../data/checkin.js';
import { proposeWeekFocus }    from '../data/week-focus.js';

export function TodayView(router) {

  // ── Home doors (04 Aug 2026, Phase C, now 7 items) ───────────────────────
  // requiresCheckin: true for doors whose whole value depends on knowing
  // today's state (energy, pain, equipment) — these route through
  // check-in (full the first time today, check-in-mini after) before
  // their real destination. Graeme's call, 04 Aug: reaching a session-
  // generating screen without ever having checked in defeats the point
  // of it adapting to "where you are today." Applied to the two doors
  // that actually generate an adaptive session (Cardio/Core/Strength,
  // Unsure? Coach decides) — confirmed by Graeme as the right split.
  //
  // Mobility & Conditioning routes to its own landing screen
  // (mobility-conditioning.js, same day follow-up), which handles the
  // programme-or-not branching internally now — Start a Mobility
  // Session / My Conditions Programme / Log an event. Supersedes the
  // earlier smart-routing hack that lived in attachEvents() below
  // (programme-or-Library), which is now removed.
  //
  // Library added as its own door, same day: once Mobility &
  // Conditioning started smart-routing to the programme instead of
  // Library whenever one exists, Library stopped being reachable from
  // Home at all in that case — a real discoverability regression
  // Graeme caught. Library is broader than mobility/conditioning
  // content anyway (every session type, prescribed exercises, coach
  // recommends), so it earns its own door rather than only being
  // reachable as Mobility & Conditioning's fallback. "Unsure? Coach
  // decides" keeps its existing distinct treatment — spans both grid
  // columns, dashed border, sits visually underneath the rest — not
  // counted as one of the "real" doors, exactly as before.
  // ── THE LOBBY RULE (LOBBY-1a, 03 Sep 2026) ────────────────────────
  //
  // kind: 'session'   opens something you DO. Rendered as a tile.
  // kind: 'reference' something you read, check or change. Rendered as
  //                   a quiet row beneath.
  //
  // Home had seven tiles of equal visual weight, and Graeme could not
  // navigate his own app: "I find the whole app overwhelming for choice
  // and navigation." It got there one reasonable addition at a time,
  // because nothing said what Home was FOR.
  //
  // This is the rule, and it is the answer to every future proposal for
  // a new tile: anything that starts a session is a tile; everything
  // else is a row. A door that cannot say which it is does not belong
  // on Home at all.
  //
  // Wellbeing is a reference row despite opening practices, on the
  // evidence already in this file: the NAV-6 note records that it
  // duplicates the Noticing tab, and a thing reachable from every screen
  // does not need a tile on the one screen where slots are scarce.
  //
  // This is the FIRST HALF of the lobby. The second half -- promoting
  // the coach's suggestion to the top and moving the session tiles
  // behind the check-in -- is not done here, because the suggestion is
  // built by coach-proposal, which requires a check-in. Promoting it
  // onto an ungated Home would mean either gating Home or showing a
  // suggestion built on no data. The split is what makes the promotion
  // possible, and it is a bigger change than this one.
  const HOME_DOORS = [
    { kind: 'session', id: 'cardio-core-strength', label: 'Cardio, Core & Strength', icon: '\uD83D\uDCAA', route: 'session-builder', requiresCheckin: true },
    // R4, 20 Aug 2026. tier: 'personal' REMOVED. Choosing which session
    // you do today is self-direction, and self-direction is an
    // accessibility feature -- charging for it penalised the person who
    // most needs to override the default because the default hurts.
    // Revenue architecture section 3: free is today, the Plan is the arc.
    { kind: 'session', id: 'mobility-conditioning', label: 'Mobility & Conditioning', icon: '\uD83E\uDDD8', route: 'mobility-conditioning', requiresCheckin: false },
    // NAV-3, 12 Aug 2026. Graeme, device pass part 4: "Yoga was not easy
    // to find... Can the yoga/pilates door be offered in multiple places
    // as well?"
    //
    // He looked in Cardio/Core/Strength, then Mobility & Conditioning,
    // then Wellbeing, then Library. Yoga lives inside Mobility &
    // Conditioning, which is a reasonable place for it and not a
    // findable one -- somebody looking for yoga is not looking for
    // "conditioning".
    //
    // A second door is the right answer rather than moving it. The same
    // thing being reachable from more than one place is how people
    // actually navigate; insisting on one true location is a filing
    // system, not a product. Mobility & Conditioning keeps its route in.
    // R4, 20 Aug 2026. tier: 'personal' REMOVED -- same reasoning as the
    // door above. NAV-3's finding stands: yoga was hard to find, and a
    // paywall on top of that was a second wall on the same door.
    { kind: 'session', id: 'yoga', label: 'Yoga & Pilates', icon: '\uD83E\uDDD8\u200D\u2640\uFE0F', route: 'yoga-session', requiresCheckin: false },
    // TIER-F, 13 Aug 2026 -- RESOLVED. The flag below stood since
    // NAV-6. The door and the bottom-nav tab route to the same view;
    // the nav label is now "Wellbeing" too (index.html), so the two
    // entry points finally name one destination. Kept as two entries
    // deliberately: a door on Home and a persistent tab serve different
    // moments.
    //
    // Original NAV-6 note follows.
    // NAV-6, FLAGGED NOT CHANGED. This routes to 'noticing', which is
    // also a bottom-nav destination -- the same duplication as the
    // Progress tile removed below, hidden by a different label.
    //
    // Deliberately left alone, because it is not the same decision.
    // Progress was called Progress in both places, so the tile was plainly
    // redundant. Here the tile says "Wellbeing" and the nav says
    // "Noticing", and somebody looking for the first may not recognise
    // the second -- which is exactly the failure that made Yoga
    // unfindable. Removing it could cost a door rather than tidy one.
    //
    // The real question is whether these should share a name, and that is
    // Graeme's call, not a cleanup.
    { kind: 'reference', id: 'wellbeing', label: 'Wellbeing', icon: '\uD83C\uDF3F', route: 'noticing', requiresCheckin: false },
    { kind: 'reference', id: 'conditions-update', label: 'Conditions Update', icon: '\uD83E\uDE79', route: 'conditions-update', requiresCheckin: false },
    // NAV-6, 12 Aug 2026. Progress tile REMOVED. Graeme: "why do we have
    // a progress tile when we have a tab? You're right about it looking
    // cluttered."
    //
    // It was the only tile duplicating a bottom-nav destination, and the
    // bottom nav is reachable from every screen while Home is not -- so
    // the tile was the weaker of the two routes and cost a slot on the
    // one screen where slots are scarce.
    //
    // Removed rather than moved: NAV-3 added Yoga & Pilates this morning
    // and Home is where things go to become hard to find. A door that
    // already exists somewhere better is not a second door, it is
    // clutter.
    { kind: 'reference', id: 'library', label: 'Library', icon: '\uD83D\uDCDA', route: 'library', requiresCheckin: false },
    { kind: 'session', id: 'unsure', label: 'Unsure? Coach decides', icon: '\uD83C\uDFAF', route: 'coach-proposal', requiresCheckin: true },
  ];

  function mount(container) {
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

    renderHome(container);
  }

  function _resolveState() {
    const today        = _todayString();
    const lastProposal = store.get('lastProposalDate');

    // Session already completed today takes priority — never route to a
    // pending proposal if there's nothing pending.
    if (_sessionCompletedToday()) return 'default';

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
    const activityLog = store.completedSessions(store.get('activityLog'));
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
    const sessionDone   = _sessionCompletedToday();
    // HOME-1, 13 Aug 2026. The denominator only appears if the person
    // actually set one.
    //
    // strategicGoal.weeklySessionTarget defaults to 3 with setAt: null --
    // the field literally records that nobody agreed to it. So Home read
    // "1 of 3 this week" to persona 2.12, whose defining trait is
    // decision paralysis: visibly two short of something he never chose.
    // The count was right (COUNT-1 fixed that); the shortfall was
    // invented.
    //
    // Deliberately NOT removing the target outright. Somebody who sets
    // one wants to see it, and taking that away would be the opposite
    // error. setAt is the honest test of whether it was ever a choice.
    const targetSetAt   = store.get('strategicGoal.setAt');
    const weeklyTarget  = targetSetAt ? (store.get('strategicGoal.weeklySessionTarget') || null) : null;
    const sessionCount  = _sessionsThisWeek();

    // ── TARGET-2 (15 Aug 2026, moment-of-delight audit) ────────────────
    //
    // Hitting the weekly target the person chose at step 12 got exactly
    // the same treatment as missing it: the counter read "2 of 2" and
    // nothing was said. Somebody set a number, reached it, and the app
    // did not notice.
    //
    // The line CLOSES the week rather than opening a demand, which is the
    // whole difference between this and a target mechanic. "That's the
    // two you said you'd aim for" states what happened; "anything else is
    // extra, not expected" removes the obligation that a hit target
    // otherwise creates. Persona 2.5 named 'escalation-trap' — for her,
    // reaching a goal is historically the moment the pressure starts.
    //
    // It also must not stop her doing more. Somebody who hits two on
    // Tuesday should not read this as the week being over, so the
    // invitation stays.
    //
    // No new state and no "fired once" flag: the line describes the true
    // current state of the week, so it is idempotent and P4-safe — the
    // coach displays, it does not interpret. It appears on the days she
    // has moved, and the week resets it.
    // PACE-2. Matrix decision 4: a plan set sharply above recent actual
    // history gets named warmly, once a week at most. Checked before the
    // other lines because it is about the shape of the whole week rather
    // than about today, and because it is the one persona 2.8 needs.
    const planJump = noticePlanJump();

    // QUICK-2. Offered here rather than in the check-in itself: the
    // check-in is the thing she is finding long, and interrupting it to
    // ask about its length would be self-defeating. Home is where she
    // arrives with a moment to read something.
    const briefOffer = planJump ? null : offerBriefPath();

    // CHAP-1 step 2. The row's second line, and it says only what is
    // actually there: the chapter name when one exists, and a plain
    // description of the screen when one does not. It never invents a
    // programme for somebody who has none, and it carries no number --
    // a count on Home's one "where am I going" control would turn a
    // destination into a scoreboard.
    const programmeHint = _programmeHint();

    const targetMet = sessionDone && weeklyTarget && sessionCount >= weeklyTarget;
    const coachLine     = planJump
      ? planJump.body
      : briefOffer
      ? briefOffer.body
      : targetMet
      ? `That's the ${weeklyTarget} you said you'd aim for this week. Anything else is extra, not expected.`
      : sessionDone
      ? "You moved today \u2014 that's done. Tap in below any time if you'd like to do more."
      : _buildCoachLine();

    container.innerHTML = `
      <div class="today-view" role="main" aria-label="Today">

        <header class="today-header">
          <h1 class="today-greeting">${_esc(greeting)}</h1>
          ${coachLine ? `<p class="today-coach-line" role="status">${_esc(coachLine)}</p>` : ''}
        </header>

        <!-- WEEK COUNTER REMOVED, LOBBY-1b, 03 Sep 2026.
             It rendered "3 of 5 this week" on the first screen of the
             app. A count against a target is a scoreboard, and a
             scoreboard is a thing you can be behind on by Wednesday --
             the mechanic the prohibited-patterns list bans and the one
             this product has spent two days removing everywhere else.
             It was live on device.

             Removing it entirely rather than dropping the "of 5": a
             bare count is still a score, and the lobby is where
             somebody arrives, not where they are marked. Session
             history remains in Progress, where looking it up is a
             choice. -->

        ${_hingeCard()}

        <!-- LOBBY-1b. THE ARC IS THE FIRST THING, and it is reachable
             without a check-in. It was three levels deep on device --
             Home, then Mobility & Conditioning, then a card between "My
             Conditions Programme" and "Stretch" -- which is no place for
             the thing the business rests on.

             The panel says what the arc is FOR and what has not come up
             yet. It never says what has been done, and never how much:
             see verify-arc2's assertions on this. -->
        <!-- TIER-HOME, 05 Sep 2026. FREE AND PLAN ARE DIFFERENT VERBS.
             Decided 3 Sep and not built until now: Home looked identical
             on both tiers, which is the one thing this design said it
             must never be.

             Free is "you decide, I'll handle it" -- the question, the
             groups, and a coach-picks fallback. Plan is "I've been
             thinking, here's what I'd do" -- the arc, then the
             invitation.

             This is not one screen with a panel swapped. Free is not
             given a diminished suggestion; it is given something
             complete on its own terms, and that is also the honest
             arrangement -- the coach genuinely knows little about a free
             user between sessions, so a confident suggestion built on
             that would be the same lie the onboarding goals were.

             STRUCTURE IS THE FREE PRODUCT. Nobody holds the thread for a
             free user, so the territory has to be legible to them. That
             is why the taxonomy is visible here and hidden on Plan: the
             "coach weaves body and mind" argument only holds where there
             IS a coach doing the weaving. -->
        ${isPremium() ? arcPanel() : ''}

        <!-- MY PROGRAMME ROW REMOVED, LOBBY-1c, 03 Sep 2026.
             It read "Your goals and where you are up to" and sat
             directly beneath the arc panel, which now says both of
             those things with the actual aim in it. Two rows doing one
             job, on the screen we are trying to simplify.
             My Programme itself is unchanged and still reachable: the
             arc panel routes there. What went is the second door. -->

        <!-- LOBBY-1c. THE SPLIT.
             Session tiles have moved behind the check-in. Home is a
             lobby: the arc, an invitation, and the reference sections.
             Somebody reading progress, browsing the library or changing
             a setting is never asked how their back is on the way.

             WHY THIS IS NOT A LAYOUT CHANGE. coach-proposal builds the
             suggestion and requires a check-in, so the suggestion could
             never be promoted onto an ungated Home -- that would have
             meant gating Home, or suggesting from no data. The split is
             what MAKES the suggestion promotable; the tiles follow it.

             The invitation states the price of entry, so the check-in
             is consented to rather than sprung. -->
        ${isPremium() ? clubRooms() : chooser() + arcPanel()}

        <div class="today-reference" role="group" aria-label="Reference and settings">
          <!-- On free, Wellbeing is promoted into "Settle your mind"
               above, so repeating it here would be the duplication this
               screen exists to remove. On Plan it stays a reference row,
               because Plan's Home has no picker to promote it into. -->
          ${HOME_DOORS.filter(d => d.kind === 'reference' && d.id !== 'wellbeing').map(d => `
            <button class="today-ref-row"
                    data-route="${d.route}"
                    data-door-id="${d.id}"
                    data-requires-checkin="${d.requiresCheckin}"
                    aria-label="${_esc(d.label)}">
              <span class="today-ref-row__icon" aria-hidden="true">${d.icon}</span>
              <span class="today-ref-row__label">${_esc(d.label)}</span>
              <span class="today-ref-row__chevron" aria-hidden="true">\u203A</span>
            </button>
          `).join('')}
        </div>

        <!-- STRAY CHECK-IN LINKS REMOVED, LOBBY-1c, 03 Sep 2026.
             They floated between the reference rows and the nav with
             nothing around them, offering a second unexplained route
             into the same gate the invitation now names properly. Two
             doors to one place, one of them unlabelled.

             "Update check-in" IS RESTORED BELOW, and its removal was a
             real regression rather than a tidy-up. CHAP-2 caught it:
             somebody who checked in this morning and feels worse by
             evening had no way to say so without starting a session.

             It also belongs here by our own rule -- it changes stored
             information rather than starting a session, which makes it
             reference, not a door. -->
        ${_checkedInToday() ? `
          <button class="btn btn-ghost today-checkin-link" data-action="checkin-mini"
                  aria-label="Update your check-in — optional, only if how you're feeling has changed">
            Update check-in
          </button>
        ` : ''}

      </div>
    `;

    attachEvents(container);
  }

  function attachEvents(container) {

    // LOBBY-1c. The one way through to the session space. Routes via
    // the check-in when one is owed and straight through when it is
    // not — a second check-in in a day is a toll, not care.
    // ARC-LED, 06 Sep 2026. Rows open IN PLACE. No rerender: a rerender
    // would rebuild the row under the finger that just tapped it and
    // throw keyboard focus back to the top of the screen.
    //
    // aria-expanded moves with the hidden attribute. One without the
    // other is the state being visible to sighted users and not to
    // anybody else.
    container.querySelectorAll('[data-room-toggle]').forEach(head => {
      head.addEventListener('click', () => {
        const detail = container.querySelector(
          `#club-row-${head.dataset.roomToggle}-detail`);
        if (!detail) return;
        const opening = detail.hasAttribute('hidden');
        if (opening) detail.removeAttribute('hidden');
        else detail.setAttribute('hidden', '');
        head.setAttribute('aria-expanded', String(opening));
      });
    });

    // CLUB-SHELL. The chip IS the answer to Quick build's one question,
    // so it must carry it -- asking again in the builder would tell
    // somebody their first answer was not heard.
    // YOUR-OWN. Ids are resolved against the LIVE library at start, so a
    // saved session picks up safety corrections rather than carrying a
    // frozen copy of the database. An exercise that has since gone is
    // dropped and the session still starts -- refusing to start would
    // punish somebody for a change they did not make.
    container.querySelectorAll('[data-saved-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rec = savedSessions().find(s => s.id === btn.dataset.savedId);
        if (!rec) return;
        const { exercises } = resolveSavedSession(rec);
        if (!exercises.length) return;
        markSavedSessionUsed(rec.id);
        store.set('generatedSession', {
          session: {
            id:          rec.sessionType || 'own',
            title:       rec.name,
            duration:    rec.durationMins ? `${rec.durationMins} mins` : null,
            exercises,
            sessionType: rec.sessionType || null
          },
          builtAt: new Date().toISOString(),
          inputs:  { savedSessionId: rec.id }
        });
        store.set('usingGeneratedSession', true);
        router.navigate('gym-programme');
      });
    });

    container.querySelectorAll('[data-quick-mins]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = Number(btn.dataset.quickMins);
        if (!Number.isFinite(mins) || mins <= 0) return;
        // QUICK-BUILD. mode:'quick' sends the builder to its single
        // scaffold screen rather than the six question phases. Without
        // it the card's "tell me how long and I fill the rest in" is
        // followed immediately by six more questions.
        store.set('sessionBuilderPreselect',
                  { durationMins: mins, mode: 'quick', returnTo: 'today' });
        router.navigate('session-builder');
      });
    });

    container.querySelector('[data-action="start-today"]')
      ?.addEventListener('click', () => {
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

  function _buildCoachLine() {
    // COUNT-1. Same rule -- the coach must not refer back to a session
    // yesterday that was opened and abandoned.
    const activityLog    = store.completedSessions(store.get('activityLog'));
    const checkinHistory = store.get('checkinHistory') || {};
    const yesterday      = _yesterdayString();

    // ── BURN-3, 16 Aug 2026. The graded burnout message, restored. ──
    //
    // It lived in coach-reflection.js, whose route was retired on 04 Aug.
    // Unreachable code says nothing, so this had been said to nobody for
    // twelve days -- and four gates stayed green throughout by reading
    // that file's source text.
    //
    // HOME, not the end of a session. Burnout is a statement about the
    // last week, and it belongs BEFORE somebody chooses what to do, not
    // after they have already done it. Home is also the one surface
    // everybody reaches, which is the whole reason the previous version
    // went unseen.
    //
    // FIRST, above the yesterday line. If somebody has been flat for a
    // week, "you did strength work yesterday" is not the most useful
    // thing the coach can say to them.
    //
    // GRADED, because the session is graded. 'high' narrows the pool and
    // sets recoveryMode; 'moderate' does not. Saying the same sentence
    // for both would tell somebody having a flat week the same thing as
    // somebody a fortnight into exhaustion.
    //
    // P4: it says what it noticed and what it is doing. No diagnosis, no
    // instruction, no "you are burnt out" -- that is a clinical claim
    // this product is not qualified to make, and the word is deliberately
    // absent from what a person sees.
    const burnout = detectBurnout(checkinHistory);
    if (burnout.level === 'high') {
      return "Your energy has been low for a while now, not just today. I'll keep things gentle until it lifts.";
    }
    if (burnout.level === 'moderate') {
      return "It's been a flatter few days than usual. I'll go a bit easier with what I suggest.";
    }

    const yesterdaySessions = activityLog.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts).toISOString().split('T')[0] === yesterday;
    });

    if (yesterdaySessions.length > 0) {
      const type = yesterdaySessions[0].type || 'session';
      const TYPE_LABELS = {
        'workout':         'strength work',
        'morning-session': 'movement',
        'yoga-session':    'yoga',
        'walk-session':    'a walk',
        'running-session': 'a run',
        'cycle-session':   'cycling',
        'swim-session':    'swimming',
        'core-session':    'core work',
        'quiet-session':   'breathing',
        'gym-programme':   'a gym session',
      };
      const label = TYPE_LABELS[type] || 'movement';
      return `You did ${label} yesterday.`;
    }

    const recentCheckins = Object.keys(checkinHistory)
      .filter(d => d >= _daysAgoString(7))
      .length;

    if (recentCheckins >= 5) return "You've been showing up.";

    // ── ORIENT-1, 13 Aug 2026 ────────────────────────────────────────
    //
    // Everything above needs history. For somebody in their first days
    // this function returned null, so Home was a bare greeting and seven
    // doors -- and the first three of those are workouts.
    //
    // THE PERSON THIS IS FOR. Persona 2.11: 76, lifelong overweight,
    // ex-dancer, "doesn't know how to exercise or move confidently",
    // more likely to engage with mindfulness than structured exercise.
    // She tells the app during onboarding that she wants to reduce
    // stress and feel better. Nothing on Home has ever read `goals` --
    // grep returned nothing before this. So the person least likely to
    // want a workout landed on a screen led by workouts, with the thing
    // she came for fourth.
    //
    // The matrix has carried her gap since 05 Jul: "unconfirmed whether
    // the Noticing Hub is reachable as a genuine front door at
    // onboarding". Confirmed 13 Aug: it is not. Every route out of
    // onboarding ends here.
    //
    // WHY NOT REORDER THE DOORS, which was the obvious fix. Persona 2.14
    // is autistic and predictability-seeking; a Home screen that
    // rearranges itself based on what the app thinks you want is
    // precisely aversive to her. Fixing 2.11 by breaking 2.14 is not a
    // fix. The grid stays fixed for everybody and the coach speaks
    // instead -- which is also what P1 asks for: the coach offers.
    //
    // Fires only in the first few sessions. Orientation, not a nudge:
    // somebody who has been here a fortnight has found the doors.
    const sessionsSoFar = activityLog.length;
    if (sessionsSoFar < ORIENTATION_SESSIONS) {
      const goals = store.get('goals') || [];
      if (goals.some(g => WELLBEING_GOALS.has(g))) {
        return "Wellbeing is where the breathing and the quieter practices live \u2014 that might be the door for you.";
      }
      if (goals.length === 0) {
        // Persona 2.12's case: no goal, genuine decision paralysis.
        // Naming the door that decides for you is the whole point of it.
        // DEVICE-1, 06 Sep 2026. Named "Unsure" -- a door that has not
        // existed since CLUB-SHELL. It was "Unsure? Coach decides", then
        // the club renamed it "One to one", and this line never followed.
        //
        // WORST POSSIBLE AUDIENCE FOR A STALE REFERENCE. It shows only to
        // somebody with NO GOAL SET in their first sessions -- the case
        // this line calls genuine decision paralysis. The one person who
        // most needs pointing at a door was being pointed at a door that
        // is not on their screen.
        // DEVICE-2, 06 Sep 2026. DEVICE-1 replaced "Unsure" with "One to
        // one" -- and One to one is a PLAN room. Free's coach route is
        // the "Not sure? I'll pick something" button beneath its tiles.
        // So the fix moved the fault one tier over instead of removing
        // it, within the hour, because it was verified on one fixture.
        //
        // Named per tier now, from the control actually on that screen.
        return isPremium()
          ? "If you'd rather not choose, One to one lets me decide today."
          : "If you'd rather not choose, \u2018Not sure?\u2019 lets me decide today.";
      }

      // ── ORIENT-2 (15 Aug 2026, first-ninety-seconds audit) ──────────
      //
      // ORIENT-1 gave a line to wellbeing-goal users and to users with no
      // goal at all. Everybody else still got null. Checked across the
      // persona set: FIVE of nine were silent here -- 2.6, 2.10, 2.15,
      // 2.16 and 2.4. That includes the 76-year-old and the returning
      // lifter, neither of whom is an edge case.
      //
      // They come out of a twenty-question conversation that ends "I'm
      // glad you're here, [name]. Let's see what we can do." and land on
      // a grid of four unlabelled doors in silence. The product handles
      // its edge cases warmly and says nothing to the middle.
      //
      // Same constraints as ORIENT-1: the grid does NOT reorder, because
      // a Home screen that rearranges itself is aversive to persona 2.14.
      // The coach speaks instead. Orientation, not a nudge -- it names
      // where the thing they asked for lives, once, in the first few
      // sessions, and then stops.
      if (goals.some(g => STRENGTH_GOALS.has(g))) {
        return "Cardio, Core & Strength is the door for what you said you're after.";
      }
      if (goals.some(g => MOVEMENT_GOALS.has(g))) {
        return "Mobility & Conditioning is where the gentler movement lives \u2014 that might be the door for you.";
      }
      // Everything else, including 'build-habit' alone. Says the true
      // thing rather than guessing a door: the smallest session is the
      // one most likely to actually happen.
      return "Any door is a fine place to start. The shortest session counts as much as the longest one.";
    }

    return null;
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

  function _hingeCard() {
    if (!isHingePending()) return '';

    const ap   = store.get('activeProgramme') || {};
    const done = getProgramme(ap.programmeId);
    const next = chapterSuccessor(ap.programmeId);

    // No countdown, no score, no "you completed 100%". It states the
    // fact and asks the question -- COUNTDOWN-1's rule applies here
    // most of all, because this is the moment a chapter could most
    // easily be made to read as an exam result.
    return `
      <section class="today-hinge" aria-label="Your chapter is complete">
        <h2 class="today-hinge__heading">That's ${_esc(done?.name || "your chapter")} done.</h2>
        <p class="today-hinge__body">
          ${_esc(next
            ? `Nothing has to change today. When you're ready, ${next.name} would be my suggestion — or run this one again, or go somewhere different entirely.`
            : "Nothing has to change today. When you're ready, you can run this one again or pick something different.")}
        </p>
        <div class="today-hinge__actions">
          ${next ? `
            <button class="btn btn-primary btn-small" data-hinge="next"
                    aria-label="Start ${_esc(next.name)}">Start ${_esc(next.name)}</button>` : ''}
          <button class="btn btn-ghost btn-small" data-hinge="repeat"
                  aria-label="Run ${_esc(done?.name || "this chapter")} again">Run it again</button>
          <button class="btn btn-ghost btn-small" data-hinge="different"
                  aria-label="Choose something different">Something different</button>
        </div>
        ${_eventPrompt()}
      </section>
    `;
  }

  /**
   * CHAP-1 step 6. The event goal, offered at the FIRST hinge.
   *
   * Blueprint §7: "Offered at the first hinge, not at signup: most
   * people have no event, and asking implies they ought to."
   *
   * That sentence is the whole design. At signup, asking "what are you
   * training for?" tells somebody with no answer that they are missing
   * one. After a finished chapter it is a fair question, because they
   * have just demonstrated they are the kind of person who finishes
   * things.
   *
   * FIRST hinge only, and asked ONCE. programme.hingeOfferedAt records
   * that the question has been put -- it is the field CHAP-1 step 1
   * declared for exactly this ("one offer per hinge") and it is used
   * rather than adding a new one, so no schema change is needed.
   *
   * Not asked at all if they already have a target: somebody who told
   * onboarding about their hike does not need asking again.
   *
   * It does not block the chapter choice. It sits underneath, and doing
   * nothing at all is a complete answer -- there is no "skip" to press,
   * because a skip button makes ignoring it feel like a decision.
   */
  function _eventPrompt() {
    // R2-a. Plan only, and silently -- free is not shown a locked
    // version. Free is complete in itself and limited in horizon; it is
    // never degraded to create pressure, and a teaser on the morning
    // screen would be exactly that.
    if (!isPremium()) return '';

    const alreadyAsked = !!store.get('programme.hingeOfferedAt');
    const hasTarget    = !!(store.get('strategicGoal.targetDate') || store.get('targetDate'));
    const firstHinge   = (store.get('programme.chaptersDone') || []).length <= 1;
    if (alreadyAsked || hasTarget || !firstHinge) return '';

    if (_eventOpen) {
      return `
        <div class="today-hinge__event">
          <label class="today-hinge__label" for="hinge-event-what">
            What is it?
          </label>
          <input class="today-hinge__input" id="hinge-event-what" type="text"
                 placeholder="A hike, a wedding, a park run" maxlength="60">
          <label class="today-hinge__label" for="hinge-event-when">
            When, if you know
          </label>
          <input class="today-hinge__input" id="hinge-event-when" type="date">
          <div class="today-hinge__actions">
            <button class="btn btn-primary btn-small" data-event="save">Save it</button>
            <button class="btn btn-ghost btn-small" data-event="cancel">Never mind</button>
          </div>
        </div>
      `;
    }

    return `
      <p class="today-hinge__aside">
        Is there anything you're working towards? A date in the diary, if you
        have one. I'll keep it in view — and if it starts looking like a harder
        ask than it needs to be, I'll say so.
        <button class="btn btn-ghost btn-small" data-event="open"
                aria-label="Tell me what you are working towards">Tell me</button>
      </p>
    `;
  }

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
  function roomRow({ id, title, what, summary, facts, action }) {
    return `
      <div class="club-row" data-room-id="${id}">
        <!--
          A11Y-HOME, 08 Sep 2026. The h2 wraps the button, which is the
          WAI-ARIA accordion pattern.

          Home had ONE heading for the entire screen -- the greeting --
          so the one page everybody starts on could not be skimmed by
          heading at all. Four rooms, and a screen reader user had no way
          to jump between them. WCAG 2.2 AA 1.3.1: these are the page's
          sections, and they existed in presentation only.

          THE HEADING WRAPS THE BUTTON RATHER THAN SITTING INSIDE IT.
          A heading nested inside an interactive element is not reliably
          exposed, and the alternative -- shrinking the button to just
          the title so the heading could be short -- would take the tap
          target away from the rest of the row, where people already
          press. That removal would be the change, not an improvement.

          It makes the heading text long: "Guided class. A twelve-week
          shape. I fit your sessions to it. Nothing chosen yet." That
          reads as a virtue rather than a cost -- CLUB spec v2 3.1 exists
          because you should not have to OPEN a room to learn what it is,
          and navigating by heading now tells you.
        -->
        <h2 class="club-row__heading">
        <button class="club-row__head"
                type="button"
                aria-expanded="false"
                aria-controls="club-row-${id}-detail"
                data-room-toggle="${id}">
          <span class="club-row__text">
            <span class="club-row__title">${_esc(title)}</span>
            <!-- SLOT 2, AND IT STAYS ON THE CLOSED ROW. The first draft
                 of this layout put "what the room is" inside the
                 expanded detail and showed only state when closed --
                 so you had to open a room to learn what it was. That is
                 the "find out by doing" fault CLUB spec v2 3.1 reversed
                 v1 over, reintroduced by a layout change. verify-
                 clubshell 3b caught it. -->
            <span class="club-row__what">${_esc(what)}</span>
            ${summary ? `<span class="club-row__summary">${_esc(summary)}</span>` : ''}
          </span>
          <span class="club-row__chev" aria-hidden="true">\u25be</span>
        </button>
        </h2>
        <div class="club-row__detail" id="club-row-${id}-detail" hidden>
          ${facts && facts.length ? `
            <ul class="club-row__facts">
              ${facts.map(f => `<li>${_esc(f)}</li>`).join('')}
            </ul>` : ''}
          ${action}
        </div>
      </div>`;
  }

  function clubRooms() {
    const prog     = store.get('activeProgramme') || {};
    const progMeta = prog.programmeId ? getProgramme(prog.programmeId) : null;
    // GUIDED-COPY. plannedFocusToday() is no longer called here. It reads
    // activeProgramme.sessionSequence, which is empty for every
    // programme, so it returned null every time and the only thing it
    // drove was a permanent "Nothing scheduled today".
    //
    // The import stays: session-choice.js's chain still calls it, and it
    // becomes real the moment classes exist.

    // GUIDED-COPY, 06 Sep 2026. THE CARD STOPS PROMISING A COURSE.
    //
    // It said "A set course. Same shape each week." All eight entries in
    // programmes.js have an EMPTY sessionSequence. A programme is four
    // phases each carrying a bias -- intensityBias, focusBias -- plus a
    // label and a coach message. It is a twelve-week TUNING OF THE
    // GENERATOR, not a course. The copy was written against a room
    // nobody had looked inside. Graeme, on device: "There is no Class
    // content to follow. No programme." There is not.
    //
    // "Nothing scheduled today" was the same fault one layer down.
    // plannedFocusToday() reads activeProgramme.sessionSequence, which
    // is empty for EVERY programme, so that line rendered every single
    // day and the card could never be the suggested one. It described
    // an absence as though a schedule existed and today happened to be
    // empty.
    //
    // The facts now come from the phase, which is real data: its label,
    // what it leans towards, how far in you are. Nothing here claims a
    // session exists.
    //
    // THE ROOM KEEPS ITS NAME. Real classes are specified and coming --
    // Documents/Admin/alongside_spec_guided_class_06sep2026_v1.md --
    // and renaming now and back later is churn. What had to stop was
    // the DESCRIPTION promising something behind the door.
    const phase = progMeta ? getPhaseForWeek(progMeta, prog.currentWeek || 1) : null;

    const guided = progMeta
      ? roomRow({
          id: 'guided', title: 'Guided class',
          // The summary is what the row shows CLOSED, so it carries the
          // one fact worth deciding on rather than the room's slogan.
          what: 'A twelve-week shape. I fit your sessions to it.',
          summary: `${progMeta.name} \u00b7 ${prog.currentWeek || 1} week${(prog.currentWeek || 1) === 1 ? '' : 's'} in`,
          facts: [
            phase ? `${phase.label} \u2014 ${phase.description}` : 'A twelve-week shape',
            phase ? `Leaning ${phase.intensityBias}, towards ${_joinPlain(phase.focusBias)}` : '',
            // COUNTDOWN-1: progress made, never distance remaining.
            // "Week 3 of 12" is distance remaining wearing a position's
            // clothes, and the gate caught it within the hour.
            `You are ${prog.currentWeek || 1} week${(prog.currentWeek || 1) === 1 ? '' : 's'} in`
          ].filter(Boolean),
          action: `<button class="btn btn-primary btn-full club-room__go"
                           data-route="my-programme" data-door-id="guided"
                           data-requires-checkin="false">See your shape</button>`
        })
      // EMPTY STATE. An invitation, and it states the cost before it is
      // paid -- CLUB spec v2 3.5.
      : roomRow({
          id: 'guided', title: 'Guided class',
          what: 'A twelve-week shape. I fit your sessions to it.',
          summary: 'Nothing chosen yet',
          facts: ['Twelve weeks', 'It shapes what I suggest, week by week',
                  'You can change or stop at any point'],
          // PLAN-PICKER-TIER, 06 Sep 2026. goal-setup is
          // programme-select.js, the chooser that calls startChapter()
          // properly. plan-select.js wrote six activeProgramme fields
          // directly and is now retired.
          action: `<button class="btn btn-primary btn-full club-room__go"
                           data-route="goal-setup" data-door-id="guided"
                           data-requires-checkin="false">Choose a shape</button>`
        });

    const pt = roomRow({
      id: 'pt', title: 'One to one',
      what: 'I pick it, around how you are today.',
      summary: 'Check in first',
      facts: ['4 questions, about a minute',
              'Then one session, suggested'],
      action: `<button class="btn btn-primary btn-full club-room__go"
                       data-route="coach-proposal" data-door-id="pt"
                       data-requires-checkin="true">Check in</button>`
    });

    // YOUR-OWN, 06 Sep 2026. No longer a shell.
    //
    // ONE on the card, the rest behind a COUNTED button -- "Your other 2
    // sessions", never "More". A count tells you whether it is worth the
    // tap; "More" makes you tap to find out.
    const saved = savedSessions();
    // OWN-1, 08 Sep 2026. Three faults in the facts and the action below.
    //
    // 1. The count was `exerciseIds.length` -- the count SAVED, not the
    //    count that still exists. resolveSavedSession() has always
    //    returned `missing` and this caller dropped it on the floor, so
    //    the card could promise nine movements and hand over seven.
    //
    // 2. "1 movements". Same unguarded interpolation PROPOSAL-1 fixed on
    //    the proposal card the same day, in a second place.
    //
    // 3. A session whose movements have ALL gone offered a Start button
    //    that did nothing: the handler below ends
    //    `if (!exercises.length) return;`, a silent no-op. SAVED-1b fixed
    //    exactly this on the saved-sessions list and left the copy here,
    //    which is the branch-and-a-half pattern GUIDED-COPY and DEVICE-1
    //    are both on record for.
    const top = saved[0] || null;
    const topResolved = top ? resolveSavedSession(top) : { exercises: [], missing: 0 };
    const topCount    = topResolved.exercises.length;
    const topRunnable = topCount > 0;

    const own = saved.length
      ? roomRow({
          id: 'own', title: 'Your own',
          what: 'Sessions you put together yourself.',
          summary: saved[0].name,
          facts: [
            saved[0].durationMins ? `${saved[0].durationMins} minutes` : 'Your own length',
            `${topCount} movement${topCount === 1 ? '' : 's'}`,
            topResolved.missing > 0
              ? `${topResolved.missing} no longer in the library`
              : (saved[0].lastUsedAt ? `Last done ${_daysAgoLabel(saved[0].lastUsedAt)}` : 'Not done yet')
          ],
          action: `${topRunnable ? `
                     <button class="btn btn-primary btn-full club-room__go"
                             data-saved-id="${saved[0].id}">Start ${_esc(saved[0].name)}</button>
                   ` : `
                     <p class="club-room__note" role="status">
                       None of the movements in this one are in the library any
                       more, so there is nothing left to start.
                     </p>
                   `}
                   ${saved.length > 1 ? `
                     <!-- SAVED-1, 08 Sep 2026. Was data-route="session-builder":
                          a button naming sessions you already have, which
                          opened the screen for making a new one. There was
                          nowhere else for it to go until saved-sessions
                          existed. A count is a promise, and this is where it
                          is now kept. -->
                     <button class="btn btn-secondary btn-full club-room__go"
                             data-route="saved-sessions" data-door-id="own"
                             data-requires-checkin="false"
                             aria-label="Your other ${saved.length - 1} saved session${saved.length - 1 === 1 ? '' : 's'}. Opens the full list.">Your other ${saved.length - 1} session${saved.length - 1 === 1 ? '' : 's'}</button>
                   ` : ''}`
        })
      : roomRow({
          id: 'own', title: 'Your own',
          what: 'Sessions you put together yourself.',
          summary: 'Nothing saved yet',
          facts: ['You choose the type, length and kit', 'Save one and it stays here'],
          action: `<button class="btn btn-primary btn-full club-room__go"
                           data-route="session-builder" data-door-id="own"
                           data-requires-checkin="false">Build your first</button>`
        });

    // The assumptions are shown BEFORE the chips, not discovered after.
    const quick = roomRow({
      id: 'quick', title: 'Quick build',
      what: 'Tell me how long. I fill the rest in.',
      summary: 'How long have you got?',
      facts: ['At home, no equipment', 'You can change the place and kit next'],
      action: `
        <div class="club-room__chips" role="group" aria-label="How long have you got?">
          ${[15, 30, 45, 60].map(m => `
            <button class="btn btn-secondary club-room__chip"
                    data-quick-mins="${m}"
                    aria-label="${m} minutes">${m} min</button>`).join('')}
        </div>`
    });

    return `
      <p class="today-chooser-q">What do you want to do today?</p>
      <p class="today-chooser-sub">Four ways in. Open any one to see what it would give you today.</p>
      <div class="club-rooms">${guided}${pt}${own}${quick}</div>
      <p class="today-group-label">Or go straight to</p>
      ${tileGrid()}`;
  }

  function tileGrid() {
    const move = HOME_DOORS.filter(d => d.kind === 'session' && d.id !== 'unsure');
    const mind = HOME_DOORS.filter(d => d.id === 'wellbeing');

    const tile = d => `
      <button class="today-door today-door--pick"
              data-route="${d.route}"
              data-door-id="${d.id}"
              data-requires-checkin="${d.requiresCheckin}"
              aria-label="${_esc(d.label)}">
        <span class="today-door__icon" aria-hidden="true">${d.icon}</span>
        <span class="today-door__label">${_esc(d.label)}</span>
      </button>`;

    return `
      <p class="today-group-label" id="today-group-body">Move your body</p>
      <div class="today-doors" role="group" aria-labelledby="today-group-body">
        ${move.map(tile).join('')}
      </div>

      ${mind.length ? `
        <p class="today-group-label" id="today-group-mind">Settle your mind</p>
        <div class="today-doors" role="group" aria-labelledby="today-group-mind">
          ${mind.map(tile).join('')}
        </div>
      ` : ''}`;
  }

  function chooser() {
    return `
      <p class="today-chooser-q">What do you want to do today?</p>
      ${tileGrid()}

      <button class="btn btn-ghost btn-full today-unsure"
              data-action="start-today"
              aria-label="Not sure \u2014 I'll pick something, going on how you're doing today">
        Not sure? I'll pick something
      </button>
      <p class="today-invite__note">I'll go on how you're doing today</p>`;
  }

  function arcPanel() {
    const arc = store.get('arc') || {};

    // ARC-DOOR, 06 Sep 2026. THE TIER RULE LIVES HERE, NOT AT THE CALL
    // SITES. There were two; only one was gated, and free rendered the
    // full panel through the other. Anything that calls arcPanel() now
    // inherits this, including call sites nobody has written yet.
    //
    // Free gets the invitation and nothing else. "Free is today, the
    // Plan is the arc" -- so the door is honest and the arc is not
    // behind it until there is a Plan. Routed to "upgrade", not
    // "arc-setup": a free user must not be able to build one.
    if (!isPremium()) {
      return `
        <button class="today-arc today-arc--offer"
                data-route="upgrade"
                data-requires-checkin="false"
                aria-label="About the arc, part of the Plan">
          <span class="today-arc__label">Your arc</span>
          <span class="today-arc__offer">
            Tell me what you want to be able to do, and I'll hold it and work
            towards it with you.
          </span>
        </button>`;
    }

    if (!arc.active || !arc.aimId) {
      return `
        <button class="today-arc today-arc--offer"
                data-route="arc-setup"
                data-requires-checkin="false"
                aria-label="Set up your arc">
          <span class="today-arc__label">Your arc</span>
          <span class="today-arc__offer">
            Tell me what you want to be able to do, and I'll hold it and work
            towards it with you.
          </span>
        </button>`;
    }

    const aim     = aimById(arc.aimId);
    const worked  = arc.zonesWorked || {};
    const strands = (arc.strands || []).map(id => ({
      label: (STRANDS[id] || {}).label,
      // A strand counts as touched when any zone it leans on has been
      // worked. A date, never a count -- the strand is either lit or it
      // is not, which is a fact about the plan rather than a score.
      // ARC-COVERAGE, 05 Sep 2026. This counted ANY dated zone, including
      // sessions done before the arc existed. On device a brand-new arc
      // showed "A back that copes" already lit, because a stretch two
      // days earlier had touched lower-back.
      //
      // An arc cannot have covered something before it started. Borrowing
      // history it did not earn is the same dishonesty as the sore-zone
      // marking, and it also robs day one of the thing that makes it
      // worth seeing: everything still ahead.
      lit: ((STRANDS[id] || {}).zones || [])
             .some(z => worked[z] && (!arc.startedAt || worked[z] >= arc.startedAt))
    })).filter(x => x.label);

    const notYet = strands.filter(x => !x.lit).map(x => x.label);

    return `
      <button class="today-arc today-arc--active"
              data-route="stretch-arc"
              data-requires-checkin="false"
              aria-label="Your arc — ${_esc(aim ? aim.label : '')}">
        <span class="today-arc__label">Your arc</span>
        <span class="today-arc__aim">${_esc(aim ? aim.label : '')}</span>
        ${strands.length ? `
          <span class="today-arc__heading">What it's made of</span>
          <span class="today-arc__strands">
            ${strands.map(x => `
              <!-- ARC-PLAIN, 06 Sep 2026. No mark, no "not yet" label.
                   Lit strands are full-strength text, unlit are muted.
                   Graeme's call, and the screen is much quieter for it.

                   WCAG 1.4.1 STILL HOLDS, and not by accident: the note
                   directly below NAMES the strands that have not come up,
                   in every state -- all of them, some of them, none of
                   them. So the information is in text on the same block
                   and colour is not the only means of conveying it.
                   verify-clubshell 10f now asserts that note rather than
                   per-row words, because the note is what is carrying it. -->
              <span class="today-arc__strand ${x.lit ? 'today-arc__strand--lit' : ''}">
                ${_esc(x.label)}
              </span>
            `).join('')}
          </span>` : ''}
        <span class="today-arc__note">${
          notYet.length === strands.length && strands.length
            ? "All of it still ahead of you. That's the whole point of today."
            : notYet.length
            // ARC-LED, 06 Sep 2026. The second sentence is load-bearing.
            // Without it, two of three strands reading "not yet" is read
            // as being BEHIND, whatever the design intends -- and this
            // panel shows coverage, not completion. P4: displays, never
            // interprets. No bar, no percentage, no count, ever.
            ? `${_esc(notYet.join(' and '))} ${notYet.length === 1 ? "hasn't" : "haven't"} come up yet. Nothing is behind \u2014 that's just where the arc is.`
            // DEVICE-1, 06 Sep 2026. This branch is reached when notYet
            // is empty -- INCLUDING when there are no strands at all,
            // because zero of zero is zero. An arc with an aim but no
            // strands therefore announced complete coverage of nothing.
            // Silent instead.
            : strands.length
            ? "Every strand has come up at least once."
            : ""
        }</span>
      </button>`;
  }

  function _programmeHint() {
    const id = store.get('activeProgramme.programmeId');
    if (!id) return "Your goals and where you are up to";
    const p = getProgramme(id);
    return p ? p.name : "Your goals and where you are up to";
  }

  function _timeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  function _sessionsThisWeek() {
    // COUNT-1, 12 Aug 2026. Counted EVERY entry, partials included, so
    // opening a session to look at it and backing out incremented the
    // number on Home. Graeme's read "7 of 3" from two real sessions.
    // Build Your Base said 2, because programmeEngine only counts genuine
    // completions -- and he correctly identified that as the trustworthy
    // one. store.completedSessions() is now the single definition.
    const activityLog = store.completedSessions(store.get('activityLog'));
    const monday      = _mondayString();
    return activityLog.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts).toISOString().split('T')[0] >= monday;
    }).length;
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
