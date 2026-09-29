/**
 * coach-proposal.js
 * 29 Sep 2026 v37
 *
 * v37 - P6, DURATION-LABEL. The header added up minutes that had each
 *   been rounded per section, so it could sit more than a minute off the
 *   plan's real length ("About 33" for 31.5). Now the total is rounded
 *   once and the sections are shared out to add up to it exactly (largest
 *   remainder), so the header and the section titles still agree.
 *   verify-duration-label.
 *
 * v36 - P2, SESSION-TYPE-ID. The plan records the TYPE it delivers
 *   (built.sessionType), not the session id. "glute-1791180600000" was
 *   unreadable to the chooser, so every plan was the first type again:
 *   Glute Focus on Free, the arc's first strand on the Plan. Gentle Care
 *   is still recorded as itself. verify-session-type-live.
 *
 * v35 - P0, SCOPE-MINOR. "Let me tell you" opens the sore-areas sheet (Conditions Update is retired) and rebuilds the plan with what they said.
 *
 * 28 Sep 2026 v34
 *
 * v34 - F7 LANDMARK. role="main" (and its label) removed from the view's
 *   wrapper: index.html's <main> is the one main landmark; a second,
 *   nested inside it, is announced twice and fails landmark rules.
 *
 * v33 - FEELINGS-RETIRE. No longer reads lastCheckin.feelingWord (the word
 *   question went in SMOOTH-P1; nothing here used the value anyway).
 *
 * v32 - Work list 2e. AVAILABLE_TIME_WINDOW_MINUTES now comes from
 *   data/time-windows.js; workoutGenerator.js is deleted (same numbers).
 *   Found by re-pointing verify-goal2 at the live path: this route
 *   ignored the goal the person chose as primary (GOAL-2, fixed only in
 *   the dead engine) -- it now leads. And the intro lines said "three
 *   options", which the coach has not offered since SMOOTH-P2a.
 *
 * v31 - SMOOTH-P3b. A request is said back whole: "You asked for
 *   strength, full body, 40 minutes." (spec 4.6), in the words it was
 *   asked in. The one change to this file in P3.
 *
 * v30 - SMOOTH-P2e. Two of Graeme's 28 Sep decisions.
 *
 *   GOOD-DAY: "the offer of suggestion should be there." On a day the
 *   person told us their energy is Good or Full of it, the plan is the
 *   same size and ONE line offers more: "One more set on each" (the same
 *   step as Harder). Offered, never given -- boom-and-bust is the
 *   documented risk for the fatigue and perimenopause personas. Plan only.
 *
 *   WEEK-DOORS: offer both. A day planned as a walk, run, swim, cycle,
 *   yoga or mindfulness leads with that session ("You planned a walk
 *   today" · Start the walk). The coach cannot build those, so it had
 *   been proposing Full Body over the top of their plan. The coach's
 *   session stays underneath as the alternative.
 *
 * v29 - SMOOTH-P2b. The plan's minutes are the builder's: _groupMinutes()
 *   adds session-builder's exerciseSeconds(), the one estimate, instead
 *   of a second sum that disagreed with it. Easier / Harder rescale a
 *   rep-based move's whole-exercise time; a clock-run move's time already
 *   scales with its sets.
 *
 * v28 - SMOOTH-P2a. Today's plan: every exercise, named, before Start.
 *
 *   Graeme, 27 Sep, tracing the Plan route: "I'm not sold on what the
 *   plan is when the coach proposes... too many decisions. It feels
 *   rough." Spec 4.3 (alongside_smooth_path_spec_27sep2026_v2).
 *
 *   Measured on v542: up to three cards -- a name, "25-35 mins",
 *   "7 movements", a sentence -- and Start disabled until a card was
 *   tapped. Nobody could see what they were agreeing to.
 *
 *   Now: one plan, selected on arrival. Every exercise named, grouped
 *   Warm up / Main / Cool down with minutes, sets x reps or a time, and
 *   (Plan) what they logged last time and a swap on every row. Where /
 *   Length / Focus chips; "Something different today" holds Shorter,
 *   Easier, Harder, another kind, another place and a class. The
 *   alternates build and "Or pick your own" are gone -- those choices
 *   live in the sheet now, one tap from the plan rather than a menu in
 *   front of it.
 *
 *   THE SAFETY NOTE STAYS A TICK-BOX. The spec's draft had "Got it --
 *   start" record the acknowledgement. The acknowledgement is the
 *   record that notice was given ("I have read this", with the wording
 *   version), so when the gate is due the full note and the same
 *   tick-box sit in the plan's dock. One tap more on those sessions
 *   only; the player then does not ask again (GATE-ONCE).
 *
 *   Free: the same list, no swaps, no weights, no sheet, no arc line;
 *   "Pick something else" goes Home.
 *
 *   Where: a gym-only person no longer lands on "At home". Start
 *   remembers where they trained.
 *
 * v27 - PROPOSAL-LOC. The two alternate cards were never generated.
 *
 *   A padding loop -- while (options.length < 3) -- filled the empty
 *   slots from _getFallbackOption(index), a FIXED ARRAY of Mobility /
 *   Breathing / Short walk taking nothing but a position. No location,
 *   no energy, no arc, no check-in, and exercises: [] on all three.
 *
 *   TWO-ENGINE (06 Sep) deliberately cut the engine to one built
 *   session and left the loop in place. Its own comment says three was
 *   never a decision, just an artefact of three hardcoded focuses. So
 *   for ten days this screen showed one real proposal and two canned
 *   ones, and the tell was in plain sight: BOTH alternates captioned
 *   "A steady option for today.", the same string literal twice.
 *
 *   Graeme, having said at the gym, 40 minutes: offered a 15-minute
 *   breathing session and a 20-minute walk. "The likely good is I'm at
 *   the gym to work out."
 *
 *   Alternates are now built through buildSession() with the same
 *   location-scoped equipment and duration as the primary, varying only
 *   sessionType, ordered by where the person actually is. WHERE THE
 *   ENGINE CANNOT PRODUCE ONE, THE SLOT IS DROPPED -- one real option
 *   beats one real option and two fictions. A card advertising "3
 *   MOVEMENTS" over an empty exercise list is a claim the coach cannot
 *   meet.
 *
 *   _getFallbackOption() is KEPT and still serves _getFallbackOptions()
 *   on the build-failed path, where a canned suggestion is better than a
 *   blank screen. What it no longer does is pad a successful build.
 *
 * 11 Sep 2026 v26
 *
 * v26 - PROPOSAL-3. The phase bias may no longer overwrite what the
 *   check-in said. On free it is the constant "moderate", so an energy
 *   score of 2 wrote "low" and this screen replaced it seconds later,
 *   before building. The gentler of the two now wins.
 *
 * 08 Sep 2026 v25
 *
 * v25 - LOCATION-1. One to one asked where you are, and let you say.
 *
 *   THE DEFECT. equipmentOverride was null here, which falls back to the
 *   flat `equipment` field -- and onboarding/equipment.js writes that
 *   field as the UNION of home kit and gym kit. So this room built every
 *   session against both lists at once. Measured with a resistance band
 *   at home and a rack at the gym: a BARBELL BACK SQUAT and a BARBELL
 *   DEADLIFT proposed to somebody who might be standing in their
 *   kitchen. The default path, not an edge case.
 *
 *   sessionLocation already existed, already had a writer
 *   (checkin-mini.js Step 4, "Where are you now?"), and was read by
 *   nothing that builds a session. A wire left hanging, not a new field.
 *
 *   THE COMMENT AT _buildCoachSuggestion() has long claimed these
 *   arguments match triggerBuild()'s. They did not: the builder passes a
 *   location-scoped list and this passed null. Closed, not widened.
 *
 *   AND A WAY TO SAY OTHERWISE. Graeme, on a handset: "It works though.
 *   I can't change anything though if I wanted to." Quick build has
 *   shown its assumptions with everything adjustable since QUICK-BUILD;
 *   this room handed over a session and offered no way to alter its
 *   length or where you are. Same row shape as the quick scaffold on
 *   purpose -- it is the same idea, and a second visual language for it
 *   would be a second thing to learn.
 *
 *   Changing one REBUILDS the options, and clears the selection: the new
 *   options are new objects with new ids, so a retained selection would
 *   leave Start enabled pointing at nothing.
 *
 *   h1, not h2. This screen had NO h1 at all -- its outline began at h2.
 *   WCAG 2.2 AA 1.3.1.
 *
 * 08 Sep 2026 v24
 *
 * v24 - PROPOSAL-1/2. Device pass, task 4. Nothing had ever mounted
 *   this view: no gate in the suite imported CoachProposalView, so the
 *   screen that decides what somebody does today had been executed only
 *   by people.
 *
 *   PROPOSAL-1, what the cards said. Two shapes reach
 *   renderPreviewCard(): a generated option carries `duration` as a
 *   range STRING, "25-35 mins", and a fallback carries a bare NUMBER.
 *   Both printed raw, so the column read "25-35 mins", "15", "20" down
 *   the same screen. The movements count was interpolated unguarded, so
 *   the Short walk fallback -- exactly one movement, every time it is
 *   offered -- read "1 movements", in its accessible name as well as on
 *   the card. Normalised in the renderer, not the two builders: one
 *   renderer serving two shapes is where the shapes have to agree, and
 *   fixing the builders leaves the next one free to send a third.
 *
 *   PROPOSAL-2, where Start Session went. closePreviewPanel() navigated
 *   to Home UNCONDITIONALLY and handlePreviewStart() calls it on the way
 *   to STARTING a session, so Start Session fired navigate('today') and
 *   navigate('workout') about a second apart. Home mounted in between,
 *   and "Good. Let's go." was written into a container Home had already
 *   replaced -- the line confirming the choice, never seen by anybody.
 *   The v18 note names the callers that helper was written for: "Not
 *   today", backdrop, close. Escape is the fourth. All four are
 *   DISMISSALS and all four keep the Home navigation exactly where they
 *   already find it; only the start path opts out, because it is going
 *   somewhere itself.
 *
 * 06 Sep 2026 v23
 *
 * v23 - CONSTRAINT-CLAIM. The coach claims only what it did.
 *
 *   The moderate band (6-6.9) said "I've worked around that". Driven at
 *   lower-back 6: getActiveConditionIds() adds `lower-back-subacute`
 *   and getExerciseSafetyTier(cat-cow, ...) returns SAFE. Nothing was
 *   worked around; `caution` only appears at 7.
 *
 *   And session-rationale.js then told the person on the NEXT SCREEN
 *   that the exercise works that area. Two screens, two answers, and
 *   the truthful one looked like the mistake. Graeme met exactly that
 *   on 06 Sep.
 *
 *   The subacute tier applies CARE, not exclusion, and whether it
 *   changes the pool depends on the exercise. So the sentence now
 *   claims the thing that is always true -- the condition was taken
 *   into account -- and hands the judgement back instead of asserting
 *   an outcome the coach cannot see from here.
 *
 *   NOT FIXED BY GOING SILENT AT 6. The person told the coach about it;
 *   silence reads as not having been heard. And NOT by softening
 *   severe: at 7+ the acute tier genuinely excludes, so that claim is
 *   earned, and loosening it would be a clinical decision rather than a
 *   wording one.
 *
 * v22 - TWO-ENGINE. THIS SCREEN NO LONGER RUNS THE OLD BUILDER.
 *
 *   For three months this file imported workoutGenerator.js and called
 *   generateDailyOptions(). That engine's entire type vocabulary is one
 *   line -- { strength: "Strength Focus", mobility: "Mobility &
 *   Recovery", cardio: "Cardio Boost" } -- against session-builder.js's
 *   EIGHT session types, and it read sessionVariety,
 *   exercisePreferences and SECTION-RULES exactly ZERO times.
 *
 *   So every improvement made to selection since June was invisible on
 *   the route Plan users were funnelled through, and STRETCH COULD NOT
 *   BE PRODUCED HERE AT ALL. Graeme, 06 Sep, on device: "I wanted to
 *   stretch but I couldn't find it." He could not.
 *
 *   DATA-1b predicted this in August: "this product has two session
 *   engines and they do not share their filters by default -- any rule
 *   about what may be selected has to be checked in both, or placed
 *   where both must read it." Three-for-three by the time it was found.
 *
 *   ONE SUGGESTION, NOT THREE. The old engine produced three because it
 *   had three focuses hardcoded, not because three was a decision. CLUB
 *   spec v2 6.2 specifies one. _buildCoachSuggestion() still returns an
 *   ARRAY of one, because every consumer here already speaks arrays and
 *   CLUB-SHELL will collapse the presentation -- changing the shape and
 *   the engine together would make an engine fault and a presentation
 *   fault indistinguishable.
 *
 *   WHAT THE COACH SUGGESTS, and why, lives in data/session-choice.js:
 *   the class you are in, then what the arc says is thin, then what has
 *   not come up lately, then `full`. Severe pain is deliberately NOT in
 *   that chain -- buildSession() resolves it before any pool is built,
 *   and a second copy of a safety rule is the DATA-1b shape again.
 *
 *   `inputs` IS FINALLY NON-EMPTY. handlePreviewStart() has read
 *   `option.inputs` since v8 and NEITHER engine ever produced the
 *   field, so the record of what the coach used was {} for this route's
 *   whole life while the coach line talked about the check-in and the
 *   arc. FAULTLESS is "every input the coach implies it used, it
 *   demonstrably used" -- that was unmeetable here until now.
 *
 *   THE NaN MINUTES ARE GONE, and not because DURATION-STR was fixed.
 *   session-builder reports an honest RANGE ("25-35 mins"); the old
 *   engine reported a single number from calculateDuration(), the
 *   function that returns NaN on any of the 99 string-`rest` entries.
 *   The card no longer appends " min", or it would read "25-35 mins
 *   min". DURATION-STR REMAINS OPEN: applyDurationCap() still fails
 *   both its NaN comparisons and returns untrimmed everywhere else.
 *
 *   AVAILABLE_TIME_WINDOW_MINUTES is still imported from
 *   workoutGenerator.js. It is a CONSTANT, not engine behaviour -- the
 *   window the check-in's time answer is interpreted through -- and
 *   verify-twoengine asserts positively that it stays.
 *
 * v21 - REENTRY-2. Three changes, all on the return journey.
 *
 *   1. AN INJURY CHIP. There was none. The return door offered "Life
 *      got full", "Was unwell" and "Finding it harder" -- so somebody
 *      coming back from an injury had no true answer, and none of the
 *      available ones stepped the intensity down.
 *
 *   2. getReEntryIntensity() WAS PASSED A HARDCODED 'illness'
 *      regardless of what the person actually said. It now receives the
 *      real context, so injury steps down too.
 *
 *   3. A GENTLER-START OFFER for life/harder returns. Not applied,
 *      offered -- and the wording states the physiology rather than
 *      implying a judgement: fitness slips whatever the reason, which
 *      is not a comment on the person. Declining is an equal choice and
 *      is never remarked on afterwards.
 *
 *   "Nothing to flag" on the injury question clears the ASK only,
 *   never the step down. Saying nothing hurts is not a claim to be back
 *   to full.
 *
 * 13 Aug 2026 v20
 *
 * v20 - C1. The severe-pain choice line names the limit. It previously
 *   acknowledged the flag and offered two options, never once saying
 *   what the coach cannot do -- which quietly implies it can do
 *   everything on the list. External help is offered, never presumed.
 *   No crisis language: this is a painful joint, not a safeguarding
 *   flag, and reaching for crisis wording here would blunt it where it
 *   is actually needed.
 *
 * 04 Aug 2026 v19
 *
 * v19 — Real regression fix, found via screenshot: the session-options
 *   panel auto-opened by Phase C (v18) is a full-screen fixed overlay
 *   (z-index 9999) — Graeme reached this screen and completely missed
 *   the flagged condition message sitting right behind it, covered
 *   before he could read it. Coach message content (greeting/
 *   reflection/constraint) now renders INSIDE the panel when it's
 *   open, not just underneath it. Same latent bug also existed for
 *   the re-entry banner and missed-session offer — auto-open is now
 *   gated on both being resolved first (mount() no longer opens the
 *   panel while either is pending; handleReturnContext()/
 *   handleMissedAdaptation() open it themselves once resolved,
 *   checking the other banner isn't also still pending).
 *
 * 04 Aug 2026 v18
 *
 * v18 — Phase C, Home Nav & Conditions Redesign (blueprint
 *   alongside_blueprint_home-navigation-conditions_04aug2026_v1.md,
 *   Section 0.1 decision: reduce, don't retire). This screen is now
 *   only reached via Home's "Unsure? Coach decides" door. Removed
 *   entirely: DOOR_COPY, renderDoorFront(), renderBypassDoor(),
 *   handleDoorChoice(), _buildAcknowledgement() (its only caller),
 *   openPreviewPanel() (its only caller was the now-removed door-1
 *   button — panel open is set directly in mount() instead). The
 *   three-doors-plus-bypass markup is gone from render(); the session-
 *   options panel (previously "door-1", opened by a tap) now opens
 *   automatically as part of the first render — no second choice on
 *   top of the choice already made by tapping "Unsure? Coach decides"
 *   from Home. handleReturnContext() updated to do a full re-render
 *   instead of patching the now-gone .cp-doors element.
 *   closePreviewPanel() ("Not today"/backdrop/close) now navigates
 *   back to Home instead of leaving an empty coach message with
 *   nothing actionable underneath — there's no doors screen to fall
 *   back to any more. Unused voice/name/tier variables in render()
 *   removed (dead since the door markup that used them is gone).
 *   coach-proposal.css v6->v7 in the same pass: .cp-door and .cp-bypass
 *   rule sets removed, confirmed unused.
 *
 * 04 Aug 2026 v17
 *
 * v17 — Severe pain: active Rest/Adapt choice, Graeme's proposal
 *   directly. Previously Severe conditions were narrated but the app
 *   silently decided what happened next (same acute-tier filtering as
 *   any other exercise exclusion). Now: when Severe pain is present and
 *   no choice has been recorded yet today for that exact condition set,
 *   the coach asks directly — "I can adapt around it, or we can call
 *   today a rest day — what would you like to do?" — and nothing else
 *   renders (no doors, no options) until the person actively answers.
 *   The choice is recorded via store.recordSeverePainChoice() (new,
 *   store.js v13) — a genuine audit-trail entry, not just a UI state,
 *   which is the actual point: an offered-and-actively-chosen record is
 *   what gives the "we suggested rest" framing real weight, not the
 *   prompt alone. "Rest" routes to a gentle Wellbeing-or-done screen,
 *   no session generated. "Adapt" proceeds to the normal proposal,
 *   still narrating the Severe condition via the existing
 *   _buildConditionNarrative() as confirmation of what was chosen.
 *   Cleanup in the same pass: _checkSeverePain()/severePainOverride
 *   removed entirely — dead weight now genuinely superseded by real
 *   handling, not just theoretically unused as before.
 *   NOTE, not decided by Claude: whether this interaction pattern
 *   actually reduces legal liability is a real legal question, not a
 *   UX one — worth Graeme raising with Alex's solicitor contact
 *   alongside the other BIZ-5/6 items already queued, not assumed
 *   correct just because the pattern feels safer.
 *
 * 04 Aug 2026 v16
 *
 * v16 — Mixed-severity narrative, same day as v15's same-tier fix.
 *   Graeme's real point: the coach needs to narrate each condition by
 *   its OWN state, not an accumulated/single-tier state — if Lower Back
 *   is Moderate and Glutes is Mild on the same day, both need saying,
 *   correctly. Verified first (didn't assume): exercise/recommendation
 *   adaptation already does this correctly per-condition, via
 *   conditions.js's getActiveConditionIds() — not touched, wasn't
 *   broken. The gap was narrative-only. Replaced the old
 *   moderate-or-mild priority chain (_checkMildPain/_checkModeratePain/
 *   _buildMildMessage/_buildConstraintMessage, all removed) with one
 *   _buildConditionNarrative() that groups conditions by band
 *   (severe/moderate/mild) and builds one combined, severity-ordered
 *   message covering all of them. Real finding surfaced while building
 *   this, not silently absorbed: Severe pain has no rest-day override
 *   anywhere live (severePainOverride computed, never used; an old
 *   changelog's "Severe Zone Override" doesn't exist in current
 *   workoutGenerator.js). Severe now gets its own narrative line for
 *   the first time — "I've kept things well clear of that area" —
 *   deliberately NOT "full rest day" wording, since that isn't what
 *   actually happens. Whether it should is flagged to Graeme as a
 *   separate, real decision — not built here.
 *
 * 04 Aug 2026 v15
 *
 * v15 — Multi-condition messaging, prompted by Graeme asking directly:
 *   "Glutes / Buttocks" was already dynamic per condition (getConditionName()),
 *   but with 2+ conditions in the same severity band, both
 *   _buildMildMessage() and _buildConstraintMessage() were silently
 *   using conditions[0] only — real conditions were being dropped from
 *   the message entirely (never from workout filtering, which reads
 *   the full list separately). New shared _joinNames() gives natural
 *   phrasing — "X", "X and Y", "X, Y, and Z" — not a raw list dump.
 *   Moderate message with multiple conditions folds each one's own
 *   score into its name ("X (6/10)") rather than showing one aggregate
 *   number that would misdescribe whichever condition it wasn't
 *   actually about. Single-condition wording unchanged from v14/v13.
 *   Known simplification, not addressed here: if Mild and Moderate
 *   conditions both exist on the same day, only the Moderate message
 *   shows — Mild ones go unmentioned that day. Flagged, not built.
 *
 * 04 Aug 2026 v14
 *
 * v14 — Pain Input Redesign, same day as v13's threshold fix. New Mild
 *   acknowledgment tier: _checkMildPain()/_buildMildMessage(), band 3-5
 *   matching conditions.js's canonical getPainBand(). Wired into
 *   buildProposal() with correct priority — Moderate's existing message
 *   wins if both are present, Mild only shows otherwise. Wording close
 *   to Graeme's own proposal: "I've noted X as Mild today. I haven't
 *   changed anything in the programme, but keep an eye on it — if it
 *   starts feeling worse, please adapt what you're doing, or stop."
 *   Previously Mild pain produced no acknowledgment at all — a real
 *   silent-input gap, not just a missing nicety, since the coach voice
 *   philosophy is "behaviour is communication" and this was one-way.
 *   Also: _buildConstraintMessage() (the existing Moderate message) now
 *   uses getConditionName() for a proper display name ("Glutes /
 *   Buttocks") instead of the raw condition id ("glutes") — small
 *   consistency fix, matches the new Mild message's wording style.
 *
 * 04 Aug 2026 v13
 *
 * Coach proposal view. The hub. Doors that describe categories, not
 * pre-committed choices.
 *
 * v13 — Two fixes, found on-device (Graeme screenshot, testing the Home
 *   Nav Phase A threshold fix). (1) _checkModeratePain() had its own
 *   private, third copy of the severity threshold — >=4 — never touched
 *   by Phase A's fix to js/data/conditions.js. This is why Mild (score
 *   4) was still triggering "I've worked around that": this file never
 *   deferred to the canonical threshold at all. Corrected to >=6 && <7,
 *   matching conditions.js and checkin.js exactly. Not refactored to
 *   import conditions.js's functions this session — kept as a minimal,
 *   safe constant fix; this file is central and already staged for a
 *   bigger rework in Home Nav Phase C, better to consolidate properly
 *   then than mid-fix now. (2) .cp-constraint ("Your check-in flagged
 *   X today...") strengthened — Graeme reported missing it almost every
 *   time. See coach-proposal.css v6 changelog for the visual change;
 *   added a small icon here.
 *
 * v12 — BUILD-5 follow-up (found while testing workoutGenerator.js v1.10 on-
 *   device). _getAvailableTime() read availableTime from two store fields
 *   that are never actually written (history[today].availableTime,
 *   lastCheckin.availableTime) and always fell through to a hardcoded
 *   literal 30 — a number, not one of the six valid category strings
 *   ("micro"|"quick"|"short"|"standard"|"long"|"open"). Worse: that bad
 *   value was then written straight back over the correct availableTime
 *   store value on every mount, via _generateOptions() — so even a value
 *   correctly set by check-in (or manually, for testing) was silently
 *   clobbered before generateDailyOptions() ever ran. Practical effect:
 *   availableTime-driven session length has never worked through the real
 *   check-in → proposal flow, independent of anything in workoutGenerator.js.
 *
 *   Fixed: _getAvailableTime() now reads store.get('availableTime') directly
 *   — the single field checkin.js actually writes, and the same field
 *   workoutGenerator.js reads. Returns null (not a number) when nothing has
 *   been selected, which workoutGenerator.js already treats correctly as
 *   "no time constraint".
 *
 *   _getFallbackOptions() needed the OLD function's numeric-minutes return
 *   value (for its Math.min(x, availMins) calculations) — that was the
 *   actual reason a numeric fallback existed in the first place, overloaded
 *   onto a function whose other call site needed a category string. Split
 *   into a new _getAvailableTimeMinutes(), which converts the category to
 *   minutes using workoutGenerator.js's exported AVAILABLE_TIME_WINDOW_MINUTES
 *   (avoids a second hardcoded copy of those numbers).
 *
 * v11 — Confirmed bug fix. _buildReflection()'s ACTIVITY_LABELS map had
 *   no entry for "coach-session" — an activityLog entry type this map
 *   doesn't otherwise account for (not ground-truthed which file writes
 *   it; flagging rather than tracing it down, since the fix here doesn't
 *   depend on knowing the writer). Effect: the reflection line read
 *   "Since yesterday, you did coach-session" — a raw internal type
 *   string leaking into coach copy. Fixed two ways: (1) added an
 *   explicit "coach-session" → "a coaching session" mapping, and (2)
 *   added a generic fallback humaniser (hyphens → spaces) for ANY future
 *   unmapped type, so this class of bug can't silently recur the same
 *   way for a type nobody's added to the map yet. Not as polished as a
 *   real label for an unknown type, but never leaks raw code again.
 *
 * v10 — v9 was deployed earlier today and immediately rolled back: it
 *   correctly diagnosed that generateDailyOptions() was never receiving
 *   the override values it needed, but switching to a static import of
 *   workoutGenerator.js forced that module to actually load for the
 *   first time — and workoutGenerator.js turned out to have its own
 *   broken import of programmeEngine.js, present since at least
 *   workoutGenerator.js v1.1, never caught because nothing had ever
 *   loaded it as a real ES module before. That broke the entire page
 *   ("Something went wrong loading this page"), not just Door 1.
 *   Content here is otherwise IDENTICAL to v9 — no changes needed on
 *   this file's side. The fix was entirely in workoutGenerator.js
 *   (now v1.9, see that file's changelog). This version exists only to
 *   record that v9 was deployed, rolled back to v8, and this is the
 *   redeploy of the same fix, now safe because its dependency is fixed.
 *   MUST be deployed together with workoutGenerator.js v1.9 — deploying
 *   this file alone, again, would reproduce today's outage.
 *
 * v9 — Confirmed bug fix, Session A2. _generateOptions() looked up
 *   window._workoutGenerator at runtime and, if found, called
 *   generateDailyOptions() with a parameter object (energy/burnout/
 *   intensityBias/focusBias/availableTime). Two problems: (1) nothing in
 *   this codebase actually sets window._workoutGenerator — no global
 *   registration exists for it, so this lookup likely always failed and
 *   silently fell through to _getFallbackOptions(); (2) even if it had
 *   been found, workoutGenerator.generateDailyOptions() takes ZERO
 *   parameters — it reads everything itself from store/checkinData. The
 *   object was always discarded either way.
 *
 *   Ground-truthed against workoutGenerator.js v1.8 before fixing. Of
 *   the five values in the discarded object, three were harmless to
 *   lose — energy, burnout, and phase-bias focus order are already
 *   re-derived independently inside generateDailyOptions() via the same
 *   store/checkinData/programmeEngine calls this file uses. Only two
 *   genuinely had nowhere else to reach the generator: the re-entry
 *   gentler-start intensity override (effectiveIntensity, computed
 *   below in buildProposal() via getReEntryIntensity()), and the
 *   check-in's availableTime. The coach's re-entry text said "starting
 *   gently" while the actual generated session was unaffected by it —
 *   this is now fixed.
 *
 *   Fix: replaced the window._workoutGenerator runtime lookup with a
 *   direct top-level import (no circular dependency — workoutGenerator.js
 *   does not import this file). _generateOptions() now writes the
 *   re-entry-adjusted intensity and availableTime to store immediately
 *   before calling generateDailyOptions(), which picks them up through
 *   its existing store-read path (store.get("todayIntensity") and
 *   store.get("availableTime")) — no change to generateDailyOptions()'s
 *   own contract, no parameters added there. Dropped the now-unused
 *   burnout and phaseBias arguments from _generateOptions()'s signature
 *   and call site — both were already dead even before this fix.
 *
 *   ALSO INVESTIGATED, NOT A BUG: the sw.js v161 changelog flagged
 *   _routeForOption() as routing every real generated option to the
 *   generic 'workout' view regardless of framing, since real output only
 *   has option.focus, never option.type. Confirmed true, but this is
 *   correct behaviour, not a defect — generateWorkout() only ever
 *   produces generic exercise-list sessions shaped for workout.js
 *   (strength/mobility/cardio focus, never a yoga/walk/run session).
 *   Fallback options DO carry type and DO route correctly to their
 *   specialised views already. Giving real options a genuine non-workout
 *   type would require the generator itself to be able to produce those
 *   session shapes — the "Option A vs B" gap already logged in the
 *   master schedule (Appendix Q), not something fixable in
 *   _routeForOption() alone. No change made here.
 *
 *   RESOLVED 16 Sep 2026, INTENSITY-SPACE. The note below stood here
 *   unexamined for eight days and it was pointing at a real fault, in a
 *   different place than it guessed.
 *
 *   schema.md was RIGHT: todayIntensity is "low | moderate | high", and
 *   checkin.js writes that space. The mismatch was downstream, in
 *   workoutGenerator.js's intensityParams table, keyed "recovery |
 *   gentle | moderate | challenging". Only "moderate" existed in both,
 *   so "low" and "high" matched nothing and fell through the
 *   `|| intensityParams.moderate` fallback -- meaning a check-in saying
 *   exhausted and one saying flying produced THE IDENTICAL SESSION.
 *
 *   Fixed by translating at that boundary rather than renaming the keys,
 *   because the keys are also intensityBias's space. See
 *   tools/verify-intensity-space.mjs, which drives the whole chain from
 *   a check-in energy value rather than reading source.
 *
 * v8 — Door redesign (Door 1 only — Graeme's redesign brief, this session).
 *   Root problem being fixed: the old three-doors model computed one
 *   specific session per door and wrote coach lines implying a fully
 *   resolved, specific choice ("this session is built for that") —
 *   but under Option B (see coach-proposal.js v7 / master schedule
 *   Appendix Q), the generator can only ever produce strength/mobility/
 *   cardio sessions, so Door C's "something different" framing in
 *   particular was promising content that could never actually arrive.
 *
 *   New model: doors describe categories honestly. Door 1 ("Today's
 *   session") opens a right-slide preview panel showing the three
 *   generated options as selectable cards — duration, exercise count,
 *   and the existing rationale text as the "why" — with the top-ranked
 *   option (already first in the generator's priority order) marked
 *   "Recommended" in gold. User selects a card, taps "Start Session" to
 *   commit, or "Not today" to back out. This is the same select-then-
 *   commit pattern already used throughout Settings (goal chips + Save,
 *   movement chips + Save) and My Week (day-type chips + Save) — no new
 *   interaction pattern introduced, just a new panel shape.
 *
 *   Door 2 ("Your programme") and Door 3 ("Something different") are
 *   NOT yet built to their new spec — reusing old per-option logic for
 *   them under the new copy would be actively misleading (the old
 *   options don't map onto "programme adherence" or "something
 *   different" as concepts at all). Deliberately set to disabled,
 *   reusing the exact existing disabled-door treatment (aria-disabled,
 *   helper text) already used for the severe-pain override case. Real
 *   behaviour change, flagged explicitly rather than silently shipped:
 *   only one of three doors is functional until Door 2/3 are built in
 *   their own sessions (Door 2 needs a new "uninterrupted" bypass mode
 *   in workoutGenerator.js; Door 3 needs walk-session.js/yoga-session.js
 *   to accept a pre-selected type — neither exists yet).
 *
 *   Severe-pain handling changed in spirit, not mechanism: previously
 *   disabled the whole "Door A" when severe pain was flagged. Under the
 *   new model, Door 1 IS the adapted-for-you door — severe pain should
 *   show up in which of the three options gets generated (the generator
 *   already filters exercises by pain zone), not disable the door
 *   entirely. That old disabling behaviour is Door 2's territory now
 *   ("serious flags" adaptation vs "uninterrupted") — deliberately not
 *   reproduced here.
 *
 *   Removed as dead code: _buildDoors(), _doorALine(), _doorBLine(),
 *   _doorCLine() — the per-door dynamic coach-line logic that assumed
 *   one option per door. _buildAcknowledgement() trimmed to the two
 *   bypass-door cases only, since door-a/b/c keys no longer exist and
 *   the old three-branch version would have thrown if ever hit
 *   (referenced proposal.doors, which no longer exists).
 *
 *   handleDoorChoice() simplified: now only ever called for the bypass
 *   door (Help me build it / Take me to the library) — the generic
 *   "look up proposal.doors.find()" branch for a/b/c routing was
 *   removed as dead code that would have been a real bug if it had
 *   fired (proposal.doors doesn't exist any more).
 *
 * v7 — Confirmed bug fix: this file uses `import` at the top (ES modules,
 *   no bundler) but two functions were being pulled in via `require()`
 *   inside function bodies — `getReEntryIntensity` (in buildProposal(),
 *   re-entry gentler-start path) and `applyMissedSessionAdaptation` (in
 *   handleMissedAdaptation(), the "Stay in 12 weeks"/"Keep the same
 *   rhythm" buttons). `require()` does not exist in this environment —
 *   both would throw `require is not defined` the moment they ran.
 *   Fixed by adding both to the existing top-level import from
 *   programmeEngine.js. No other changes.
 *
 * v6 — Phase 5 door reframe (P5-CP-1, P5-CP-2, P5-CP-3). Superseded by
 *   v8's redesign above — see v6 in prior version history for the
 *   original door-reframe detail if needed for reference.
 *
 * v5 — workoutGenerator wired. run→running-session. walk→walk-session.
 *   availableTime drives session length. Cycle phase adaptation.
 *   Burnout override. Programme phase bias.
 *
 * WCAG 2.2 AA:
 *   Door buttons: aria-label describes the door. Disabled doors:
 *   aria-disabled="true", helper text in aria-describedby.
 *   Preview panel: role="dialog", aria-modal="true", focus trapped,
 *   Escape closes (treated as "Not today"), focus returns to the
 *   triggering door button on close.
 *   Preview cards: role="radio" within role="radiogroup", aria-checked,
 *   "Recommended" conveyed via a text badge (not colour alone) and
 *   echoed in the card's aria-label.
 *   Start Session: disabled (not just visually) until a card is
 *   selected — communicated via the disabled attribute, not opacity
 *   alone.
 *   Bypass door: same touch target (min 44px) and contrast as primary
 *   doors. Post-choice acknowledgement: aria-live="polite" region.
 *   All coach text rendered as <p> — not aria-hidden.
 *   prefers-reduced-motion: panel slide transition removed.
 */

import { store }             from '../store.js';
// ARC-VISIBLE, 16 Sep 2026. Same source today.js reads for "What it's
// made of", so the proposal names the arc in the words the person
// already sees on Home rather than a second vocabulary.
import { aimById, STRANDS } from "../data/aims.js";
// STRETCH-VIA-COACH, 16 Sep 2026. The same target knowledge the stretch
// door uses. See js/stretch-target.js.
import { impliedTarget, sortByTarget, targetById, isStretchLike } from "../stretch-target.js";
// PURPOSE-ASK, 16 Sep 2026. The line now answers "what's today for?"
// rather than always naming the arc.
import { purposeLine, safetyLineFor } from "../data/purpose.js";
import { getActiveVoice, getTimingRules } from '../data/coach-voice.js';
import { getPhaseBias, getReEntryContext, getMissedSessionOffer,
         captureReturnContext, clearReturnContext,
         recordSession, advanceWeekIfNeeded,
         getReEntryIntensity, applyMissedSessionAdaptation }  from '../data/programmeEngine.js';
import { getProgramme }      from '../data/programmes.js';
import { detectBurnout, getTodaysCheckin } from '../data/checkin.js';
import { chosenPrimaryEngineGoal } from '../data/goals.js';
import { getConditionName }  from '../data/conditions.js';
// TWO-ENGINE, 06 Sep 2026. workoutGenerator.js is no longer imported
// here. AVAILABLE_TIME_WINDOW_MINUTES is a CONSTANT, not engine
// behaviour, and stays -- it is the window the check-in's time answer is
// interpreted through and has nothing to do with which builder runs.
// 2e, 28 Sep: it has its own module now, and the old engine is gone.
import { AVAILABLE_TIME_WINDOW_MINUTES } from '../data/time-windows.js';
import { buildSession, buildCandidatePools, equipmentForLocation,
         swapAlternatives, swapExerciseInSession, soreLevelFor,
         soreScoresToday, SESSION_TYPES, exerciseSeconds } from '../session-builder.js';
// SMOOTH-P2a. The plan carries the safety note when it is due.
import { isGateDue, isGuidanceDue, recordAcknowledgement,
         GUIDANCE_TEXT } from '../safety-gate.js';
import { HURT_AND_ACHE }     from '../exercise-card.js';
import { resolveTiming }     from '../exercise-timing.js';
import { isPremium }         from '../auth.js';
import { openSheet }         from './onboarding/sheet-manager.js';
import { chooseSessionType, lineIsSupported } from '../data/session-choice.js';

// DOOR_COPY, renderDoorFront(), renderBypassDoor(), handleDoorChoice(),
// and _buildAcknowledgement() removed 04 Aug 2026 (Phase C, Home Nav &
// Conditions Redesign). This screen is now only reached via Home's
// "Unsure? Coach decides" door — the three-doors-plus-bypass UI those
// functions rendered is fully superseded by Home's six direct doors
// (Cardio/Core/Strength and Mobility & Conditioning replace the bypass
// row; this screen itself replaces door-1). Door-2/door-3 were disabled
// "Being redesigned" placeholders since 23 Jun, never built — genuinely
// retired now, not just hidden.

// ─── View registration ────────────────────────────────────────────────────────

export function CoachProposalView(router) {

  let proposal      = null;
  let choiceMade    = false;
  let reEntryCtx    = null;
  // REENTRY-2, 20 Aug 2026. Whether a person coming back from a
  // non-clinical absence has ACCEPTED the gentler start. Defaults false:
  // the offer is made, nothing changes until they say yes.
  let gentlerAccepted = false;
  let missedOffer   = null;

  // ── Severe pain choice state (new 04 Aug 2026) ───────────────────────────
  // severeChoicePending: { conditionIds, painScores } while awaiting an
  // active Rest/Adapt choice — blocks the normal doors/options entirely
  // until resolved. severeChoiceResolved: 'rest'|'adapt'|null once known
  // for today (either just chosen, or read back from a prior choice
  // already recorded today for this exact severe-condition set).
  let severeChoicePending  = null;
  let severeChoiceResolved = null;

  // ── Door 1 preview panel state (v8) ─────────────────────────────────────
  let previewOpen           = false;
  let currentPreviewOptions = [];
  let selectedOptionId      = null;

  // ── SMOOTH-P2a plan state ────────────────────────────────────────────────
  // swapState[index] = { original, alts, pos }. Built on the first swap of
  // a row, against the ORIGINAL exercise, so cycling is stable.
  let swapState  = {};
  // -1 easier, 0 as built, +1 harder. Sets only (spec 4.3).
  let adjust     = 0;
  let statusMsg  = '';
  let ackTicked  = false;
  let ackError   = '';

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    // Advance week if Monday
    advanceWeekIfNeeded();

    // Check re-entry and missed session contexts
    reEntryCtx  = getReEntryContext();
    missedOffer = getMissedSessionOffer();

    // Severe pain — active choice, not a silent decision either way.
    // Checked before buildProposal() so a pending choice can skip
    // building options entirely (nothing to generate yet).
    const conditions = store.get('conditions') || [];
    const painScores  = store.get('conditionPainScores') || {};
    const severeIds   = conditions.filter(id => (painScores[id] || 0) >= 7);

    if (severeIds.length > 0) {
      const existing = _getTodaySevereChoice(severeIds);
      severeChoiceResolved = existing;
      severeChoicePending  = existing ? null : { conditionIds: severeIds, painScores };
    } else {
      severeChoiceResolved = null;
      severeChoicePending  = null;
    }

    // Build the proposal — skipped while a choice is pending, or if
    // "rest" was chosen (nothing to propose either way).
    proposal = (!severeChoicePending && severeChoiceResolved !== 'rest')
      ? buildProposal()
      : null;

    // Auto-open the session-options panel (Phase C, 04 Aug 2026) — this
    // screen no longer has doors to choose between; reaching it at all
    // (via Home's "Unsure? Coach decides") means showing the
    // recommendation immediately, not gating it behind a second tap.
    // State set before the first render so it opens already-visible,
    // not open-then-flash. Keydown trap + initial focus wired after,
    // same setup openPreviewPanel() used to do for a later door tap —
    // that function is removed now nothing calls it post-render.
    //
    // Fix, same day: does NOT auto-open while a re-entry banner or
    // missed-session offer is still unresolved — the panel is a
    // full-screen overlay (z-index 9999), so auto-opening over an
    // unresolved banner would cover it before the person could answer
    // it, same bug as the constraint message Graeme found by
    // screenshot. Those banners' own handlers (handleReturnContext(),
    // handleMissedAdaptation()) open the panel themselves once resolved.
    const hasBlockingBanner =
      (reEntryCtx && !reEntryCtx.contextCaptured) ||
      (missedOffer && !choiceMade);

    if (proposal && !hasBlockingBanner) {
      currentPreviewOptions = proposal.options;
      selectedOptionId      = proposal.options[0]?.id || null;   // SMOOTH-P2a
      previewOpen           = true;
    }

    render(container);

    if (proposal && !hasBlockingBanner) {
      document.addEventListener('keydown', _previewKeydown);
      _focusFirstInPanel(container);
    }
  }

  // ── Severe pain choice: lookup, render, handling ─────────────────────────

  function _getTodaySevereChoice(severeIds) {
    const today   = new Date().toISOString().slice(0, 10);
    const sorted  = [...severeIds].sort();
    const history = store.get('severePainChoices') || [];
    const match = history.find(entry =>
      entry.date === today &&
      Array.isArray(entry.conditionIds) &&
      entry.conditionIds.length === sorted.length &&
      entry.conditionIds.every((id, i) => id === sorted[i])
    );
    return match ? match.choice : null;
  }

  /**
   * C1, 13 Aug 2026. The honest-limit line.
   *
   * Graeme's own framing, 13 Aug: "I can't give you medical support, but
   * I can adjust your programme for you and give you exercises. If you
   * need more than that I think you should look for external help."
   *
   * WHY IT BELONGS HERE AND ALMOST NOWHERE ELSE. Severe is the one
   * moment the user has explicitly told the coach something is badly
   * wrong. Before this, the coach acknowledged it and offered two
   * options and never once said what it cannot do -- which quietly
   * implies it can do everything on the list. Naming the limit is not a
   * disclaimer; it is the difference between a coach and a claim.
   *
   * THE RULE THIS FIXES, stated so it survives: the product must never
   * ASSUME external help exists. The old rehabilitation copy said
   * "check with whoever is treating you" to 94 exercises' worth of
   * people, most of whom have nobody treating them. Graeme's own About
   * copy says "I couldn't afford a physio". So help is OFFERED, never
   * presumed, and the wording works for somebody mid-physio, somebody
   * who has never seen anyone, and somebody who cannot afford to.
   *
   * DELIBERATELY NOT: no crisis resources, no helpline, no urgency.
   * This is a painful knee, not a safeguarding flag, and the Crisis &
   * Safeguarding Policy governs that path separately. Reaching for
   * crisis language here would both frighten people and blunt it where
   * it is actually needed.
   *
   * Register: invitational, no therapy voice, no verdict. "It's worth"
   * not "you should" -- the one place Graeme's draft says "I think you
   * should" is softened, because every other coach line in the product
   * offers rather than instructs and one exception reads as alarm.
   */
  function _buildSevereChoiceLine(pending) {
    const names  = pending.conditionIds.map(getConditionName);
    const plural = names.length > 1;
    const them   = plural ? 'them' : 'it';

    // 🔴 CLINICAL-REVIEW / CL-1, CL-3, CL-4, 16 Sep 2026. This screen predates
    // the review and was not in her pack, but it falls squarely under her
    // principle.
    //
    // It said "What I can do is work around them", and the Adapt button
    // promised "I'll keep well clear of the affected area". Clinical advice: "A
    // self-reported sore area does not provide enough information to
    // determine what should or should not be loaded", and "avoid
    // wording that says the app is strengthening around a problem or
    // advises users not to work an area directly."
    //
    // ⚫ THE CODE WAS ALREADY DOING THE RIGHT THING; THE WORDS OVERCLAIMED
    // IT. Measured: at a back pain of 8 the ordinary build becomes
    // "Something gentler today" -- three movements, none loading the
    // back, nothing contraindicated. That IS her "lower-intensity session
    // that reduces demand on the area concerned". So the promise now
    // says that, in her words, and no more.
    //
    // It also had half of CL-4 -- a pointer to someone who can look at it
    // -- and never said to stop if it got worse. On the most serious
    // screen in the app that was the half that mattered most.
    return `I can see ${_joinNames(names)} ${plural ? 'are' : 'is'} really difficult today. ` +
           `I can't give you medical support \u2014 that isn't something I can do. ` +
           `What I can do is keep today gentle, or we can call it a rest day. ` +
           safetyLineFor(them);
  }

  function renderSevereChoice() {
    return `
      <div class="cp-missed-offer" role="region" aria-label="Severe pain — choose how to proceed today">
        <div class="cp-missed-offer__choices" role="group" aria-label="Rest or adapt">
          <button class="cp-missed-offer__btn" data-severe-choice="rest"
                  aria-label="Rest today — no session">
            Rest today
            <span class="cp-missed-offer__sub">Nothing pushed today \u2014 the right call some days</span>
          </button>
          <button class="cp-missed-offer__btn" data-severe-choice="adapt"
                  aria-label="Adapt and continue with something gentler">
            Adapt and continue
            <span class="cp-missed-offer__sub">Something gentler, that asks less of the sore area</span>
          </button>
        </div>
      </div>
    `;
  }

  function _buildRestDayLine() {
    return 'Good call. Nothing pushed today \u2014 resting is progress too. If you\'d like something gentle, Wellbeing has breathing and quiet options; otherwise, that\'s it for today.';
  }

  function renderRestDayOptions() {
    return `
      <div class="cp-missed-offer" role="region" aria-label="Rest day options">
        <div class="cp-missed-offer__choices" role="group" aria-label="What next">
          <button class="cp-missed-offer__btn" data-rest-action="noticing"
                  aria-label="Visit Wellbeing for something gentle">
            Visit Wellbeing
            <span class="cp-missed-offer__sub">Breathing, journalling, a moment of quiet</span>
          </button>
          <button class="cp-missed-offer__btn" data-rest-action="home"
                  aria-label="That's it for today, return home">
            That's it for today
          </button>
        </div>
      </div>
    `;
  }

  function handleSevereChoice(choice, container) {
    if (!severeChoicePending) return;
    store.recordSeverePainChoice(severeChoicePending.conditionIds, choice);
    severeChoiceResolved = choice;
    severeChoicePending  = null;
    proposal = (severeChoiceResolved !== 'rest') ? buildProposal() : null;
    render(container);
  }


  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    // Severe pain — awaiting an active choice. No doors, no options yet;
    // nothing to propose until Rest or Adapt is actively chosen.
    if (severeChoicePending) {
      container.innerHTML = `
        <div class="cp-view">
          <div class="cp-coach-block" aria-live="polite">
            <div class="cp-greeting">${_buildSevereChoiceLine(severeChoicePending)}</div>
          </div>
          ${renderSevereChoice()}
        </div>
      `;
      attachSevereChoiceEvents(container);
      return;
    }

    // Severe pain — "rest" was actively chosen (today, this exact set).
    // No session doors; gentle alternatives only.
    if (severeChoiceResolved === 'rest') {
      container.innerHTML = `
        <div class="cp-view">
          <div class="cp-coach-block" aria-live="polite">
            <div class="cp-greeting">${_buildRestDayLine()}</div>
          </div>
          ${renderRestDayOptions()}
        </div>
      `;
      attachRestDayEvents(container);
      return;
    }

    container.innerHTML = `
      <div class="cp-view">

        <!-- Re-entry banner (illness/long gap) -->
        ${reEntryCtx && !reEntryCtx.contextCaptured ? renderReturnDoor() : ''}
        ${reEntryCtx && reEntryCtx.contextCaptured && reEntryCtx.offersGentlerStart && !gentlerAccepted
            ? renderGentlerOffer() : ''}
        ${reEntryCtx && reEntryCtx.asksWhatHurts ? renderWhatHurts() : ''}

        <!-- Compress/extend offer -->
        ${missedOffer && !choiceMade ? renderMissedOffer(missedOffer) : ''}

        <!-- Coach message block — only rendered out here while the panel is
             closed (waiting on re-entry/missed-offer above). Once the panel
             is open this same content renders inside it instead — fix,
             04 Aug 2026: the panel is a full-screen fixed overlay
             (z-index 9999), so when it auto-opens (Phase C) anything
             rendered out here, including the condition/severity
             constraint message, was being covered before the person
             could read it. Found via screenshot — Graeme reached this
             screen and completely missed the flagged condition message
             sitting right behind the modal. -->
        ${!previewOpen ? `
          <div class="cp-coach-block" aria-live="polite">
            <div class="cp-greeting">${proposal.greeting}</div>
            ${proposal.reflection ? `<p class="cp-reflection">${proposal.reflection}</p>` : ''}
            ${proposal.constraint ? `
              <div class="cp-constraint" role="status" aria-live="polite">
                <span class="cp-constraint__icon" aria-hidden="true">🌱</span>
                <p>${proposal.constraint}</p>
              </div>` : ''}
            <p class="cp-proposal-intro">${proposal.intro}</p>
          </div>
        ` : ''}

        <!-- Post-choice acknowledgement (hidden until a session is started) -->
        <div class="cp-acknowledgement"
             id="cp-acknowledgement"
             aria-live="polite"
             role="status"
             style="display:none;">
        </div>

        <!-- Session options — auto-open once there's no blocking banner
             above, no door tap needed (Phase C, 04 Aug 2026) -->
        ${renderPreviewPanel()}

        <!-- SMOOTH-P2a. "Or pick your own" was here (LOBBY-1c). Its
             four doors now live in "Something different today" on the
             plan itself: one tap from the plan, not a menu beside it. -->

      </div>
    `;

    attachEvents(container);
  }

  function attachSevereChoiceEvents(container) {
    container.querySelectorAll('[data-severe-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        handleSevereChoice(btn.dataset.severeChoice, container);
      });
    });
  }

  function attachRestDayEvents(container) {
    container.querySelectorAll('[data-rest-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.restAction;
        if (action === 'noticing') router.navigate('noticing');
        else router.navigate('today');
      });
    });
  }

  // ── Door 1 preview panel (v8) ────────────────────────────────────────────

  function renderPreviewPanel() {
    const option  = currentPreviewOptions[0] || null;
    const premium = isPremium();
    return `
      <div id="cp-preview-panel"
           class="cp-preview-panel ${previewOpen ? 'is-open' : ''}"
           role="dialog"
           aria-modal="true"
           aria-labelledby="cp-preview-title"
           ${previewOpen ? '' : 'hidden'}>
        <div class="cp-preview-panel__backdrop"></div>
        <div class="cp-preview-panel__content">
          <button class="cp-preview-panel__close" id="cp-preview-close" aria-label="Close">✕</button>

          ${proposal ? `
            <div class="cp-coach-block cp-coach-block--in-panel" aria-live="polite">
              <div class="cp-greeting">${proposal.greeting}</div>
              ${proposal.reflection ? `<p class="cp-reflection">${proposal.reflection}</p>` : ''}
              ${proposal.constraint ? `
                <div class="cp-constraint" role="status" aria-live="polite">
                  <span class="cp-constraint__icon" aria-hidden="true">🌱</span>
                  <p>${proposal.constraint}</p>
                </div>` : ''}
            </div>
          ` : ''}

          <!-- LOCATION-1. h1: this screen's top level. WCAG 2.2 AA 1.3.1. -->
          <h1 id="cp-preview-title" class="cp-preview-panel__title">Today’s plan</h1>
          ${premium ? _renderPlanned() : ''}
          ${option ? `<p class="cp-plan__sentence">${_planSentence(option)}</p>` : ''}
          ${premium ? _arcLine() : ''}
          ${premium && option ? _renderGoodDayOffer() : ''}

          <!-- LOCATION-1 / SMOOTH-P2a. What the coach assumed, one tap to
               change each. Focus opens "Something different today". -->
          <ul class="cp-assumptions">
            ${[
              ['Where',  'cp-loc',  _locationLabel(_currentLocation())],
              ['Length', 'cp-time', `${_getAvailableTimeMinutes()} min`],
              ...(premium && option ? [['Focus', 'cp-focus', _focusLabel(option)]] : [])
            ].map(([label, id, value]) => `
              <li class="cp-assumptions__row">
                <span class="cp-assumptions__label">${label}</span>
                <button class="btn btn-secondary cp-assumptions__change" id="${id}"
                        aria-label="${label}: ${value}. Change">
                  ${value}
                </button>
              </li>`).join('')}
          </ul>

          ${option ? _renderPlan(option, premium) : ''}

          <p id="cp-plan-status" class="sr-only" role="status" aria-live="polite">${statusMsg}</p>

          ${premium && option ? _renderDifferent(option) : ''}

          ${_renderDock(premium)}
        </div>
      </div>
    `;
  }

  // ── SMOOTH-P2a. The plan list ─────────────────────────────────────────────

  const SECTION_LABELS = { warmup: 'Warm up', main: 'Main', cooldown: 'Cool down' };

  /**
   * The exercises as they will start: swaps applied, then Easier/Harder.
   *
   * Sets only (spec 4.3). An exercise with no sets in the library is one
   * set to the player (workout.js: `exercise.sets || 1`), so Harder makes
   * it two -- the player already runs "2 sets, this long each". A timed
   * exercise's clock is per set and is NOT stretched; a counted one's
   * `duration` is only an estimate and is scaled so the minutes stay true.
   */
  function _planExercises(option) {
    return (option?.exercises || []).map(ex => {
      if (!adjust || (ex.section || 'main') !== 'main' || ex.isPrescribed) return ex;
      const sets = Number(ex.sets) || 1;
      const next = Math.max(1, sets + adjust);
      if (next === sets) return ex;
      // exerciseSeconds(): with reps, `duration` is the whole exercise, so
      // it scales; without, it is a per-set clock and the sets scale it.
      const dur = Number(ex.duration);
      return { ...ex, sets: next,
               ...(ex.reps != null && dur > 0 ? { duration: Math.round(dur * next / sets) } : {}) };
    });
  }

  /**
   * How much, in the same terms the player will use (resolveTiming, the
   * one timing source): sets x reps when counted, a time when timed.
   * Read aloud as "3 sets of 10" -- a screen reader says "×" as
   * "multiplied by".
   */
  function _dose(ex) {
    const sets = Number(ex.sets) || 1;
    const reps = ex.reps == null ? '' : String(ex.reps).trim();
    const t    = resolveTiming(ex);
    if (!t.seconds && reps) {
      const side = ex.perSide && /^\d+$/.test(reps) ? ' each side' : '';
      return { text: `${sets} \u00D7 ${reps}${side}`,
               spoken: `${sets} ${sets === 1 ? 'set' : 'sets'} of ${reps}${side}` };
    }
    const secs = t.seconds || Number(ex.duration) || 0;
    if (!(secs > 0)) return { text: '', spoken: '' };
    const each   = secs < 90 ? `${Math.round(secs)} sec` : `${Math.round(secs / 60)} min`;
    const spoken = each.replace('sec', 'seconds').replace('min', 'minutes');
    return sets > 1
      ? { text: `${sets} \u00D7 ${each}`, spoken: `${sets} sets of ${spoken}` }
      : { text: each, spoken };
  }

  /**
   * P6. Minutes per section that add up to the rounded total: floor each,
   * then give the spare minutes to the largest remainders. Each section is
   * within a minute of its own time and the header is within half a
   * minute of the plan's.
   */
  function _sectionMinutes(groups) {
    const exact = groups.map(g => g.reduce((n, ex) => n + exerciseSeconds(ex), 0) / 60);
    const total = Math.max(1, Math.round(exact.reduce((a, b) => a + b, 0)));
    const mins  = exact.map(m => Math.max(1, Math.floor(m)));
    let spare   = total - mins.reduce((a, b) => a + b, 0);
    const order = exact.map((m, i) => [m - Math.floor(m), i]).sort((a, b) => b[0] - a[0]);
    for (let k = 0; spare > 0 && k < order.length; k++, spare--) mins[order[k][1]] += 1;
    return { total: mins.reduce((a, b) => a + b, 0), mins };
  }

  /** P4: flat, no verb, no delta. Plan only. */
  function _lastText(ex) {
    const last = store.lastLift(ex.id);
    if (!last || last.weight === undefined) return '';
    return `Last: ${last.weight} ${last.unit || 'kg'}${last.reps !== undefined ? ` · ${last.reps} reps` : ''}`;
  }

  /** Honesty rule: only what they told the app today. */
  function _soreText(ex) {
    const s = soreLevelFor(ex, soreScoresToday());
    if (s.level !== 'marked') return '';
    const names = s.areas.map(a => String(getConditionName(a) || a).toLowerCase());
    return `Works your ${_joinNames(names)}, which you said ${names.length > 1 ? 'are' : 'is'} sore today.`;
  }

  function _renderPlan(option, premium) {
    const list = _planExercises(option);
    const rowsBySection = ['warmup', 'main', 'cooldown']
      .map(sec => ({ sec, items: list.map((ex, i) => ({ ex, i })).filter(r => (r.ex.section || 'main') === sec) }))
      .filter(g => g.items.length);
    const note = _stretchTargetNote(option);
    const split = _sectionMinutes(rowsBySection.map(g => g.items.map(r => r.ex)));

    return `
      <section class="cp-plan" aria-labelledby="cp-plan-title">
        <h2 id="cp-plan-title" class="cp-plan__title" tabindex="-1">${option.name}</h2>
        <p class="cp-plan__meta">${list.length
          // The same minutes the groups below add up to. The builder's own
          // range ("35–45 mins") sat above groups totalling 21 on the first
          // device render -- two numbers for one plan.
          ? `About ${split.total} min · ${_movementsLabel(list.length)}`
          : _durationLabel(option.duration)}</p>
        ${note ? `<p class="cp-plan__target">${note}</p>` : ''}
        ${rowsBySection.map((g, gi) => `
          <h3 class="cp-plan__group-title">${SECTION_LABELS[g.sec]} · ${split.mins[gi]} min</h3>
          <ol class="cp-plan__list">
            ${g.items.map(({ ex, i }) => {
              const dose = _dose(ex);
              const last = premium ? _lastText(ex) : '';
              const sore = _soreText(ex);
              const canSwap = premium && !ex.isPrescribed;
              return `
                <li class="cp-plan__row" data-plan-index="${i}" data-exercise-id="${ex.id}"
                    data-section="${ex.section || 'main'}" data-sets="${Number(ex.sets) || 1}"
                    data-areas="${(ex.affectsAreas || []).join(',')}">
                  <div class="cp-plan__text">
                    <span class="cp-plan__name">${ex.name}</span>
                    <span class="cp-plan__dose"><span aria-hidden="true">${dose.text}</span><span class="sr-only">${dose.spoken}</span></span>
                    ${last ? `<span class="cp-plan__last">${last}</span>` : ''}
                    ${sore ? `<span class="cp-plan__why">${sore}</span>` : ''}
                  </div>
                  ${canSwap ? `<button class="btn btn-ghost cp-plan__swap" data-swap="${i}"
                          aria-label="Swap ${ex.name}">Swap</button>` : ''}
                </li>`;
            }).join('')}
          </ol>`).join('')}
      </section>`;
  }

  /**
   * The session type this plan really is. buildSession() ids are
   * "<type>-<timestamp>" (e.g. "glute-1790576872105"), so option.sessionType
   * holds that id, never a bare type. When the builder swapped in
   * something else (Gentle Care, out of scope), the id no longer starts
   * with the type that was asked for, and this returns null.
   */
  function _deliveredType(option) {
    const t = option?.inputs?.chosenType;
    return t && String(option.id || '').startsWith(`${t}-`) ? t : null;
  }

  function _focusLabel(option) {
    const t = SESSION_TYPES.find(x => x.id === _deliveredType(option));
    return t ? t.label : option.name;
  }

  /**
   * The coach's one sentence. A request made on this screen wins and is
   * said back; otherwise the builder's own line, which is already held to
   * the honesty rule (lineIsSupported, PURPOSE-ASK's banned words).
   */
  // SMOOTH-P3b. The request said back in the words the person chose
  // it in: "strength, full body", not the builder's "Full Body".
  const ASKED_WORDS = {
    full: 'strength, full body', upper: 'strength, upper body', lower: 'strength, lower body',
    glute: 'strength, glutes', core: 'core', cardio: 'cardio', mobility: 'mobility', stretch: 'stretching',
  };
  function _planSentence(option) {
    const req = store.get('requestedSessionType');
    const t   = req ? SESSION_TYPES.find(x => x.id === req) : null;
    if (t && _deliveredType(option) === req) {
      return `You asked for ${ASKED_WORDS[req] || t.label.toLowerCase()}, ${_getAvailableTimeMinutes()} minutes.`;
    }
    return option.rationale || '';
  }

  // ── SMOOTH-P2e. What they planned, and a good day ────────────────────────

  /** Sessions the coach does not build, and where each one lives. */
  const OWN_SESSIONS = {
    walk:        { route: 'walk-session',    noun: 'a walk',         go: 'Start the walk'  },
    run:         { route: 'running-session', noun: 'a run',          go: 'Start the run'   },
    swim:        { route: 'swim-session',    noun: 'a swim',         go: 'Start the swim'  },
    cycle:       { route: 'cycle-session',   noun: 'a ride',         go: 'Start the ride'  },
    yoga:        { route: 'yoga-session',    noun: 'yoga',           go: 'Start yoga'      },
    mindfulness: { route: 'quiet-session',   noun: 'mindfulness',    go: 'Start mindfulness' },
  };

  function _plannedToday() {
    const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const slot = store.get(`weeklyPlan.days.${DAYS[new Date().getDay()]}`) || {};
    if (!slot || slot.type === 'rest' || !OWN_SESSIONS[slot.sessionType]) return null;
    return { id: slot.sessionType, ...OWN_SESSIONS[slot.sessionType] };
  }

  /**
   * WEEK-DOORS. Their plan first, the coach's second. Nothing is claimed
   * beyond what they set: the words are "you planned", from weeklyPlan.
   */
  function _renderPlanned() {
    const p = _plannedToday();
    if (!p) return '';
    return `
      <div class="cp-planned" role="group" aria-labelledby="cp-planned-title">
        <p class="cp-planned__title" id="cp-planned-title">You planned ${p.noun} today.</p>
        <button class="btn btn-primary btn-full" id="cp-planned-start" data-planned-route="${p.route}">${p.go}</button>
        <p class="cp-planned__or">Or the coach\u2019s session instead:</p>
      </div>`;
  }

  /**
   * GOOD-DAY. Only from what they told us this morning (energy Good = 7,
   * Full of it = 9), only while nothing has been added, and never applied
   * without the tap.
   */
  function _renderGoodDayOffer() {
    if (adjust !== 0) return '';
    const c = getTodaysCheckin() || {};
    if (!(Number(c.energy) >= 7)) return '';
    return `
      <div class="cp-offer" role="note">
        <p class="cp-offer__text">You said your energy\u2019s good today. The plan stays as it is \u2014 if you\u2019d like a bit more:</p>
        <button class="btn btn-secondary" id="cp-offer-more">One more set on each</button>
      </div>`;
  }

  // ── SMOOTH-P2a. Something different today ────────────────────────────────
  // Native <details>: the role, expanded state and keyboard come free
  // (4.1.2), and it needs no focus trap of its own inside the panel's.

  function _renderDifferent(option) {
    const here   = _currentLocation();
    const kinds  = SESSION_TYPES.filter(t => t.id !== _deliveredType(option) && (t.id !== 'gym' || here === 'gym'));
    const places = ['home', 'gym', 'outside'].filter(l => l !== here);
    const btn = (attr, label) => `<button class="btn btn-secondary cp-different__btn" ${attr}>${label}</button>`;
    return `
      <details class="cp-different">
        <summary class="cp-different__summary">Something different today</summary>
        <div class="cp-different__body">
          <p class="cp-different__label" id="cp-diff-this">This, but</p>
          <div class="cp-different__row" role="group" aria-labelledby="cp-diff-this">
            ${btn('data-different="shorter"', 'Shorter (20 min)')}
            ${btn(`data-different="easier" aria-pressed="${adjust < 0}"`, 'Easier')}
            ${btn(`data-different="harder" aria-pressed="${adjust > 0}"`, 'Harder')}
          </div>
          <p class="cp-different__label" id="cp-diff-kind">A different kind</p>
          <div class="cp-different__row" role="group" aria-labelledby="cp-diff-kind">
            ${kinds.map(t => btn(`data-different-kind="${t.id}"`, t.label)).join('')}
          </div>
          <p class="cp-different__label" id="cp-diff-where">Somewhere else</p>
          <div class="cp-different__row" role="group" aria-labelledby="cp-diff-where">
            ${places.map(l => btn(`data-different-loc="${l}"`, _locationLabel(l))).join('')}
          </div>
          <div class="cp-different__row">
            ${btn('data-different="class"', 'A class instead')}
          </div>
        </div>
      </details>`;
  }

  // ── SMOOTH-P2a. The dock ─────────────────────────────────────────────────
  // When the gate is due, the same note and the same tick-box the player's
  // gate uses (safety-gate.js), so the record means the same thing
  // wherever it was made. Start is never disabled: an unticked Start says
  // why and moves focus to the box (3.3.1), exactly as the gate does.

  function _renderDock(premium) {
    const due = isGateDue();
    const guidance = due && isGuidanceDue()
      ? `<p class="gate-guidance" role="note">${GUIDANCE_TEXT}</p>` : '';
    return `
      <div class="cp-dock">
        ${due ? `
          <p class="cp-dock__label">Before you start</p>
          <ul class="cp-dock__lines">${HURT_AND_ACHE.map(l => `<li>${l}</li>`).join('')}</ul>
          ${guidance}
          <label class="gate-ack" for="cp-ack-box">
            <input type="checkbox" id="cp-ack-box" ${ackTicked ? 'checked' : ''}>
            <span>I have read this.</span>
          </label>
          <p class="gate-error" id="cp-ack-error" role="status" aria-live="assertive">${ackError}</p>
        ` : `
          <p class="cp-dock__line">If something hurts — sharp, or building as you go — stop that one. Aching afterwards is normal.</p>
        `}
        <div class="cp-preview-panel__actions">
          <button class="btn btn-ghost" id="cp-preview-not-today">
            ${premium ? 'Not today' : 'Pick something else'}
          </button>
          <button class="btn btn-primary" id="cp-preview-start">Start</button>
        </div>
      </div>`;
  }

  /**
   * PROPOSAL-1, 08 Sep 2026. Two shapes reach this card and it printed
   * both raw.
   *
   * A generated option carries `duration` as a RANGE STRING -- "25-35
   * mins" -- built by buildSession(). A fallback option carries
   * `durationMins`, a bare NUMBER, straight from _getFallbackOptions().
   * Both land in `option.duration`, so the screen showed "25-35 mins"
   * on the suggested card and "15" on the two beneath it, in the same
   * column, on the same screen.
   *
   * Normalised HERE rather than in the two builders: one renderer serving
   * two shapes is the place the shapes have to agree, and fixing the
   * builders would leave the next builder free to send a third.
   */
  function _durationLabel(d) {
    if (d === null || d === undefined || d === "") return "";
    if (typeof d === "number") return `${d} mins`;
    const s = String(d).trim();
    // A string that is only digits is a number that has been through a
    // template somewhere. Still a bare count to a reader.
    return /^\d+$/.test(s) ? `${s} mins` : s;
  }

  /**
   * PROPOSAL-1. "1 movements". Visible on the Short walk fallback, which
   * has exactly one, every time it is offered -- and in its accessible
   * name too, because the aria-label was built from the same unguarded
   * interpolation.
   */
  function _movementsLabel(n) {
    const c = Number(n);
    if (!Number.isFinite(c)) return "";
    return `${c} movement${c === 1 ? "" : "s"}`;
  }

  // ── Preview panel close (v8; open handled directly in mount(), 04 Aug 2026) ──

  /**
   * PROPOSAL-2, 08 Sep 2026. This navigated to Home UNCONDITIONALLY,
   * and handlePreviewStart() calls it on the way to STARTING a session.
   *
   * So choosing a session and pressing Start Session fired
   * navigate('today') immediately and navigate('workout') about a second
   * later. Home mounted in between -- a full view, reading the store and
   * rendering every room -- and the acknowledgement "Good. Let's go."
   * was written into a container Home had already replaced, so the one
   * line confirming the choice was never seen by anybody.
   *
   * The v18 note names the callers this was written for: "Not today" /
   * backdrop / close, plus Escape. All four are DISMISSALS, and the
   * comment below says so in its own words -- "closing without a
   * selection". Starting a session is not a dismissal; it was picked up
   * by the shared helper.
   *
   * The Home navigation stays exactly where those four already find it.
   * Only the start path opts out, because it is going somewhere itself.
   */
  function closePreviewPanel(container, { navigateHome = true } = {}) {
    // Phase C, 04 Aug 2026: this panel is now the only content on this
    // screen (no doors underneath to fall back to), so closing without
    // a selection navigates back to Home instead of leaving an empty
    // coach message with nothing actionable. The old #door-1 focus
    // target no longer exists.
    previewOpen      = false;
    selectedOptionId = null;
    document.removeEventListener('keydown', _previewKeydown);
    if (navigateHome) router.navigate('today');
  }

  function _rerenderPanel(container, showPlan = false) {
    const existing = container.querySelector('#cp-preview-panel');
    if (existing) {
      existing.outerHTML = renderPreviewPanel();
      attachPreviewEvents(container);
      // SMOOTH-P2a. "One tap rebuilds the plan AND SHOWS IT": the sheet
      // closes (it re-renders closed) and focus goes to the plan's name.
      if (showPlan) container.querySelector('#cp-plan-title')?.focus();
    }
  }

  /**
   * LOCATION-1, 08 Sep 2026. An assumption changed, so the plan is
   * rebuilt against it. SMOOTH-P2a: the new plan is selected at once --
   * there is one, and Start is never disabled -- and earlier swaps are
   * dropped, because they were swaps of exercises no longer on it.
   */
  function _rebuildAndRerender(container, message = '', showPlan = false) {
    proposal              = buildProposal();
    currentPreviewOptions = proposal.options;
    selectedOptionId      = proposal.options[0]?.id || null;
    swapState             = {};
    statusMsg             = message;
    _rerenderPanel(container, showPlan);
  }

  function _previewKeydown(e) {
    if (e.key !== 'Escape') return;
    const container = document.getElementById('main-content');
    if (container) closePreviewPanel(container);
  }

  function _focusFirstInPanel(container) {
    setTimeout(() => {
      const panel = container.querySelector('#cp-preview-panel');
      const first = panel?.querySelector('button:not([disabled])');
      if (first) first.focus();
    }, 50);
  }

  function attachPreviewEvents(container) {
    const panel = container.querySelector('#cp-preview-panel');
    if (!panel) return;

    panel.querySelector('.cp-preview-panel__backdrop')?.addEventListener('click', () => closePreviewPanel(container));
    panel.querySelector('#cp-preview-close')?.addEventListener('click', () => closePreviewPanel(container));
    panel.querySelector('#cp-preview-not-today')?.addEventListener('click', () => closePreviewPanel(container));

    // LOCATION-1. Changing an assumption REBUILDS the plan, because a
    // plan that no longer matches what it says it was built for is worse
    // than one that never said.
    panel.querySelector('#cp-loc')?.addEventListener('click', () => {
      const order = ['home', 'gym', 'outside'];
      const next  = order[(order.indexOf(_currentLocation()) + 1) % order.length];
      store.set('sessionLocation', next);
      _rebuildAndRerender(container, `Now planned for ${_locationLabel(next).toLowerCase()}.`);
    });

    panel.querySelector('#cp-time')?.addEventListener('click', () => {
      const cats = Object.keys(AVAILABLE_TIME_WINDOW_MINUTES);
      const cur  = store.get('availableTime');
      const i    = cats.indexOf(cur);
      store.set('availableTime', cats[(i + 1) % cats.length]);
      _rebuildAndRerender(container, `Now ${_getAvailableTimeMinutes()} minutes.`);
    });

    // Focus opens the sheet rather than cycling: there are nine kinds,
    // and cycling through nine to reach one is a worse menu than a menu.
    panel.querySelector('#cp-focus')?.addEventListener('click', () => {
      const d = panel.querySelector('details.cp-different');
      if (!d) return;
      d.open = true;
      d.querySelector('[data-different-kind]')?.focus();
    });

    panel.querySelector('#cp-planned-start')?.addEventListener('click', e => {
      closePreviewPanel(container, { navigateHome: false });
      router.navigate(e.currentTarget.dataset.plannedRoute);
    });

    panel.querySelector('#cp-offer-more')?.addEventListener('click', () => {
      adjust = 1;
      statusMsg = 'One more set on each main exercise.';
      _rerenderPanel(container, true);
    });

    panel.querySelectorAll('[data-swap]').forEach(btn => {
      btn.addEventListener('click', () => _swapRow(container, Number(btn.dataset.swap)));
    });

    panel.querySelectorAll('[data-different]').forEach(btn => {
      btn.addEventListener('click', () => {
        const what = btn.dataset.different;
        if (what === 'class') { closePreviewPanel(container, { navigateHome: false }); router.navigate('classes'); return; }
        if (what === 'shorter') {
          store.set('availableTime', 'quick');
          _rebuildAndRerender(container, 'Here’s a 20-minute plan.', true);
          return;
        }
        adjust = what === 'harder' ? Math.min(1, adjust + 1) : Math.max(-1, adjust - 1);
        statusMsg = adjust > 0 ? 'One more set on each main exercise.'
                  : adjust < 0 ? 'One set fewer on each main exercise.'
                  : 'Back to the sets as planned.';
        _rerenderPanel(container, true);
      });
    });

    // ASK-KIND rule: a request spends today differently; the arc is not
    // edited. clearPurpose() clears it at the next check-in.
    panel.querySelectorAll('[data-different-kind]').forEach(btn => {
      btn.addEventListener('click', () => {
        store.set('requestedSessionType', btn.dataset.differentKind);
        _rebuildAndRerender(container, 'Here’s the new plan.', true);
      });
    });

    panel.querySelectorAll('[data-different-loc]').forEach(btn => {
      btn.addEventListener('click', () => {
        store.set('sessionLocation', btn.dataset.differentLoc);
        _rebuildAndRerender(container, 'Here’s the new plan.', true);
      });
    });

    const box = panel.querySelector('#cp-ack-box');
    box?.addEventListener('change', () => {
      ackTicked = box.checked;
      ackError  = '';
      const err = panel.querySelector('#cp-ack-error');
      if (err) err.textContent = '';
    });

    panel.querySelector('#cp-preview-start')?.addEventListener('click', () => {
      const chosen = currentPreviewOptions.find(o => o.id === selectedOptionId) || currentPreviewOptions[0];
      if (!chosen) return;
      // Same rule, same words as safety-gate.js's attachSafetyGate().
      if (panel.querySelector('#cp-ack-box')) {
        if (!ackTicked) {
          ackError = 'Confirm you have read this before starting.';
          const err = panel.querySelector('#cp-ack-error');
          if (err) err.textContent = ackError;
          panel.querySelector('#cp-ack-box')?.focus();
          return;
        }
        if (panel.querySelector('.gate-guidance')) {
          try { store.set('guidanceShownAt', new Date().toISOString()); } catch { /* non-fatal */ }
        }
        recordAcknowledgement('coach-plan');
      }
      handlePreviewStart(chosen, container);
    });

    panel.addEventListener('keydown', _trapFocus);
  }

  /**
   * SMOOTH-P2a. Swap cycles this row's alternatives: same section, same
   * kit (the pool was built with this plan's arguments), the exercise's
   * own swap group first. Anything blocked by today's sore answer is left
   * out, exactly as selection leaves it out. Past the last, the original
   * comes back.
   */
  function _swapRow(container, index) {
    const option = currentPreviewOptions[0];
    if (!option || !option._pools) return;
    const current = option.exercises[index];
    if (!current || current.isPrescribed) return;

    if (!swapState[index]) {
      const scores = soreScoresToday();
      const { groups, leadGroupId } = swapAlternatives({
        pool:         option._pools,
        section:      current.section || 'main',
        current,
        inSessionIds: option.exercises.map(e => e.id)
      });
      const lead = groups.filter(g => g.id === leadGroupId).flatMap(g => g.items);
      const alts = (lead.length ? lead : groups.flatMap(g => g.items))
        .filter(ex => soreLevelFor(ex, scores).level !== 'blocked');
      swapState[index] = { original: current, alts, pos: -1 };
    }

    const st = swapState[index];
    if (!st.alts.length) {
      statusMsg = `Nothing else fits here today, so ${current.name} stays.`;
      _rerenderPanel(container);
      return;
    }
    st.pos = st.pos + 1 >= st.alts.length ? -1 : st.pos + 1;
    const next = st.pos === -1 ? st.original : st.alts[st.pos];
    const swapped = swapExerciseInSession(option, index, next);
    option.exercises = swapped.exercises;
    statusMsg = st.pos === -1 ? `Back to ${next.name}.` : `Swapped to ${next.name}.`;
    _rerenderPanel(container);
    container.querySelector(`[data-swap="${index}"]`)?.focus();
  }

  function handlePreviewStart(option, container) {
    if (choiceMade) return;
    choiceMade = true;

    store.set('lastProposalType', 'door-1');
    store.set('lastProposalDate', new Date().toISOString());

    // PROPOSAL-2. Tear the panel down, but do NOT bounce through Home --
    // this path navigates itself, below, once the acknowledgement has
    // had its moment.
    closePreviewPanel(container, { navigateHome: false });

    const ackEl = container.querySelector('#cp-acknowledgement');
    if (ackEl) {
      ackEl.style.display = '';
      ackEl.textContent = 'Good. Let\u2019s go.';
      ackEl.focus();
    }

    // TWO-ENGINE. inputs is finally non-empty on this route. It carried
    // {} for its whole life -- handlePreviewStart has read
    // `option.inputs` since v8 and NEITHER engine ever produced the
    // field -- while the coach line talked about the check-in and the
    // arc. FAULTLESS: every input the coach implies it used, it
    // demonstrably used.
    //
    // _pools is stripped off the stored session rather than saved with
    // it. It is a build-time artefact the swap sheet reads, not a fact
    // about the session, and persisting it would put a full candidate
    // pool into localStorage on every proposal.
    const { _pools, ...session } = option;
    // SMOOTH-P2a. What starts is what was shown: swaps are already on
    // option.exercises; Easier/Harder are applied here, the same function
    // the list was drawn from.
    session.exercises     = _planExercises(option);
    session.exerciseCount = session.exercises.length;
    // Where they trained becomes the next plan's default (spec 4.3).
    store.set('sessionLocation', _currentLocation());

    store.set('generatedSession', {
      session,
      builtAt:        new Date().toISOString(),
      inputs:         option.inputs || {},
      candidatePools: _pools || null
    });

    const timingRules = getTimingRules({ difficultTopic: false });
    setTimeout(() => {
      if (reEntryCtx) clearReturnContext();
      router.navigate(_routeForOption(option));
    }, timingRules.delayMs + 400);
  }

  function _trapFocus(e) {
    if (e.key !== 'Tab') return;
    const panel = document.getElementById('cp-preview-panel');
    if (!panel) return;
    const focusable = [...panel.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )];
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  // ── Return door renderer ───────────────────────────────────────────────────

  // REENTRY-2, 20 Aug 2026. The OFFER, for life/harder returns.
  //
  // It states the reason plainly rather than implying a judgement.
  // Three weeks away costs fitness whatever the reason -- that is
  // physiology, not a comment on the person -- and saying so is kinder
  // than letting them discover it by failing a session. Declining is a
  // real, equal choice, and the decline is not remarked on afterwards.
  function renderGentlerOffer() {
    const weeks = Math.floor((reEntryCtx?.gapDays || 0) / 7);
    const span  = weeks >= 2 ? `${weeks} weeks` : 'a little while';
    return `
      <div class="cp-return-door" role="region" aria-label="Starting back">
        <p class="cp-return-door__message">
          You have been away ${span}. Fitness slips in that time whatever the
          reason &mdash; it is not a comment on you, it is just what bodies do.
          I can start you a notch gentler today and build back from there.
        </p>
        <div class="cp-return-door__chips" role="group"
             aria-label="How would you like to start back?">
          <button class="cp-chip" data-gentler="yes" aria-pressed="false">
            Yes, ease me back in
          </button>
          <button class="cp-chip" data-gentler="no" aria-pressed="false">
            No, I feel fine &mdash; carry on as before
          </button>
        </div>
      </div>
    `;
  }

  // REENTRY-2. Injury only. ASKS rather than assumes -- the app does not
  // know what is wrong and must not imply it does. This writes nothing
  // to conditions and nothing to prescribedExercises; it routes to the
  // existing pain flow, which is already the place that reasons about
  // what hurts and what to avoid.
  function renderWhatHurts() {
    return `
      <div class="cp-return-door" role="region" aria-label="After an injury">
        <p class="cp-return-door__message">
          Since you were injured &mdash; is anything still sore, or anything you
          would rather I left out today? Tell me where and I will leave out what loads it.
        </p>
        <div class="cp-return-door__chips" role="group"
             aria-label="Anything still sore?">
          <button class="cp-chip" data-hurts="tell" aria-pressed="false">
            Let me tell you
          </button>
          <button class="cp-chip cp-chip--skip" data-hurts="no" aria-pressed="false">
            Nothing to flag
          </button>
        </div>
      </div>
    `;
  }

  function renderReturnDoor() {
    // Sideways door — never "why did you miss sessions?"
    // "Anything you'd like me to know about the last little while?"
    return `
      <div class="cp-return-door" role="region" aria-label="Welcome back">
        <p class="cp-return-door__message">
          It's good to see you. Anything you'd like me to know about the last little while?
          Completely optional — we can also just begin.
        </p>
        <div class="cp-return-door__chips"
             role="group"
             aria-label="What was the last little while like?">
          <button class="cp-chip" data-return-context="life"
                  aria-pressed="false">Life got full</button>
          <button class="cp-chip" data-return-context="illness"
                  aria-pressed="false">Was unwell</button>
          <!-- REENTRY-2, 20 Aug 2026. There was no injury option at all.
               Graeme, 20 Aug. Somebody returning from an injury was
               choosing between "life got full" and "finding it harder",
               neither of which is true and neither of which stepped the
               intensity down. -->
          <button class="cp-chip" data-return-context="injury"
                  aria-pressed="false">Was injured</button>
          <button class="cp-chip" data-return-context="harder"
                  aria-pressed="false">Finding it harder</button>
          <button class="cp-chip cp-chip--skip" data-return-context="skip"
                  aria-pressed="false">Rather not say — let's just begin</button>
        </div>
      </div>
    `;
  }

  // ── Missed session offer renderer ──────────────────────────────────────────

  function renderMissedOffer(offer) {
    return `
      <div class="cp-missed-offer" role="region" aria-label="Session adaptation offer">
        <p class="cp-missed-offer__line">${offer.coachLine}</p>
        <div class="cp-missed-offer__choices"
             role="group"
             aria-label="How would you like to adapt?">
          <button class="cp-missed-offer__btn" data-adapt="compress"
                  aria-label="Stay in 12 weeks — ${offer.compressWeeklySessions} sessions per week">
            Stay in 12 weeks
            <span class="cp-missed-offer__sub">${offer.compressWeeklySessions} sessions a week from here</span>
          </button>
          <button class="cp-missed-offer__btn" data-adapt="extend"
                  aria-label="Keep the same rhythm — extend by ${offer.extendWeeksNeeded} week${offer.extendWeeksNeeded !== 1 ? 's' : ''}">
            Keep the same rhythm
            <span class="cp-missed-offer__sub">Extend by ${offer.extendWeeksNeeded} week${offer.extendWeeksNeeded !== 1 ? 's' : ''}</span>
          </button>
        </div>
      </div>
    `;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container) {
    // Return context chips
    container.querySelectorAll('[data-return-context]').forEach(btn => {
      btn.addEventListener('click', e => {
        const context = btn.dataset.returnContext;
        handleReturnContext(context, container);
      });
    });

    // Missed session adaptation
    container.querySelectorAll('[data-adapt]').forEach(btn => {
      btn.addEventListener('click', e => {
        const choice = btn.dataset.adapt;
        handleMissedAdaptation(choice, container);
      });
    });

    // REENTRY-2, 20 Aug 2026.
    container.querySelectorAll('[data-gentler]').forEach(btn => {
      btn.addEventListener('click', () => {
        gentlerAccepted = btn.dataset.gentler === 'yes';
        // Full re-render, not a patch. Accepting changes
        // effectiveIntensity, which changes the OPTIONS -- so the
        // preview cards have to be rebuilt too. Same reasoning, and the
        // same shape, as handleReturnContext above: that one used to
        // patch .cp-doors and broke when the element stopped existing.
        proposal              = buildProposal();
        currentPreviewOptions = proposal.options;
        selectedOptionId      = proposal.options[0]?.id || null;
        swapState = {};
        render(container);
      });
    });

    container.querySelectorAll('[data-hurts]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.hurts === 'tell') {
          // P0 (29 Sep): the sore-areas sheet, not the retired
          // conditions-update screen. The plan is rebuilt with what they said.
          openSheet('onboarding/conditions', () => {
            reEntryCtx = { ...reEntryCtx, asksWhatHurts: false };
            proposal = buildProposal();
            currentPreviewOptions = proposal.options;
            selectedOptionId = proposal.options[0]?.id || null;
            render(container);
          });
          return;
        }
        // "Nothing to flag" clears only the ASK, never the step down.
        // Saying nothing hurts is not a claim to be back to full, and
        // needsGentlerStart is untouched here deliberately.
        reEntryCtx = { ...reEntryCtx, asksWhatHurts: false };
        render(container);
      });
    });

    // Door 1 preview panel — always present in the DOM (v8)
    attachPreviewEvents(container);
  }

  // ── Return context handler ─────────────────────────────────────────────────

  function handleReturnContext(context, container) {
    if (context !== 'skip') {
      captureReturnContext(context);
    }
    // REENTRY-2. A fresh answer supersedes any earlier offer state.
    gentlerAccepted = false;

    // Dismiss return door and rebuild the proposal with re-entry context
    // applied — full re-render (Phase C, 04 Aug 2026: this used to just
    // patch .cp-doors, which no longer exists; the re-entry context can
    // change effectiveIntensity/options, so the auto-opened panel needs
    // fresh options too, not just the coach message).
    reEntryCtx = getReEntryContext();
    proposal   = buildProposal();

    // Only open now if there isn't also an unresolved missed-offer —
    // same gating mount() applies, in case both banners existed together.
    if (!(missedOffer && !choiceMade)) {
      currentPreviewOptions = proposal.options;
      selectedOptionId      = proposal.options[0]?.id || null;
      swapState = {};
      previewOpen           = true;
    }

    render(container);
  }

  // ── Missed adaptation handler ──────────────────────────────────────────────

  function handleMissedAdaptation(choice, container) {
    applyMissedSessionAdaptation(choice);
    missedOffer = null;

    // Fix, 04 Aug 2026: this used to just hide the offer element in
    // place, leaving the panel closed underneath (auto-open is gated
    // on missedOffer being resolved — see mount()). Now that it's
    // resolved, open the panel the same way mount() would have if
    // there'd been nothing to resolve.
    if (proposal && !(reEntryCtx && !reEntryCtx.contextCaptured)) {
      currentPreviewOptions = proposal.options;
      selectedOptionId      = proposal.options[0]?.id || null;
      swapState = {};
      previewOpen           = true;
    }
    render(container);
  }

  // ── Proposal builder ───────────────────────────────────────────────────────

  /**
   * Build the full proposal object.
   * v8: returns the raw `options` array (for Door 1's preview panel) in
   * addition to everything previous versions returned. `doors` no longer
   * built here — door copy is now static (DOOR_COPY), not derived per
   * option.
   * v17 (04 Aug 2026): only ever called when severe pain is either
   * absent or already actively resolved as "adapt" for today — see
   * mount()'s severeChoicePending gating above. severePainOverride
   * removed from the returned object; it was dead weight (computed,
   * never used by rendering) now that severe pain has real handling
   * upstream instead of a placeholder for a feature that never landed.
   */
  function buildProposal() {
    const voice        = getActiveVoice();
    const name         = store.get('name') || '';
    const energyScore  = _getCheckinEnergy();
    const moodScore    = _getCheckinMood();
    const painScores   = store.get('conditionPainScores') || {};
    const conditions   = store.get('conditions') || [];
    const goals        = store.get('goals') || [];
    const availTime    = _getAvailableTime();
    // BURN-1, 12 Aug 2026. detectBurnout() now returns
    // { level, avgEnergy } rather than a boolean -- workoutGenerator.js
    // had seven reads of burnout.level against a boolean, so the whole
    // recovery path was unreachable. _buildIntro() below tested this
    // truthily, which an object always satisfies, so it is passed the
    // grade instead.
    const burnoutState = detectBurnout(store.get('checkinHistory') || {});
    const burnout      = burnoutState.level !== 'none';
    const phaseBias    = getPhaseBias();
    // 2e / GOAL-2 on the live path. GOAL-2 (17 Aug) made the dead engine
    // honour the goal the person CHOSE as primary; this route never did --
    // it took the first goal in a fixed priority list, so a chosen
    // primary was silently replaced. The chosen one leads when it is
    // still one of their goals.
    const primaryGoal  = chosenPrimaryEngineGoal(goals, store.get('strategicGoal'));

    // Pain override check
    const conditionNarrative = _buildConditionNarrative(conditions, painScores);

    // Re-entry intensity adjustment.
    //
    // REENTRY-2, 20 Aug 2026. Was: illness only, hardcoded 'illness'
    // regardless of what the person actually said. Now passes the real
    // context, so injury steps down too.
    //
    // life/harder are NOT stepped down here. Detraining is real after
    // three weeks away for work -- but so is the insult of being told
    // you have lost ground when you feel fine. Those get an OFFER
    // (renderGentlerOffer below), and the step down is applied only if
    // it is accepted.
    let effectiveIntensity = phaseBias.intensityBias;

    // PROPOSAL-3, 11 Sep 2026. The phase bias may not raise today above
    // what the person just told us.
    //
    // _generateOptions() writes this value to todayIntensity on every
    // mount of this screen. On free, getPhaseBias() is the constant
    // { intensityBias: "moderate" } -- so check-in wrote "low" from an
    // energy score of 2, and this screen overwrote it with "moderate"
    // seconds later, before building. Reproduced on a bare account before
    // the fix: energy 2/10, mood 3/10, and the session offered was Glute
    // Focus, ten movements.
    //
    // The gentler of the two wins. A programme week that says "low" still
    // lowers a good day; a week that says "high" cannot add work to a hard
    // one. Same downward-only rule as WRITE-1 and _applyTodayIntensity().
    const INTENSITY_RANK   = { low: 0, moderate: 1, high: 2 };
    const checkinIntensity = store.get('todayIntensity');
    if (checkinIntensity in INTENSITY_RANK &&
        INTENSITY_RANK[checkinIntensity] < (INTENSITY_RANK[effectiveIntensity] ?? 1)) {
      effectiveIntensity = checkinIntensity;
    }

    if (reEntryCtx?.needsGentlerStart) {
      effectiveIntensity = getReEntryIntensity(reEntryCtx.context, effectiveIntensity);
    } else if (reEntryCtx?.offersGentlerStart && gentlerAccepted) {
      effectiveIntensity = getReEntryIntensity('illness', effectiveIntensity);
    }

    // Generate three options from workout generator — these become
    // Door 1's preview cards (v8), already returned in priority order.
    // v9: effectiveIntensity and availTime are now genuinely applied —
    // see _generateOptions().
    // PROPOSAL-LOC, 16 Sep 2026. THE PADDING LOOP IS GONE.
    //
    // It read: while (options.length < 3) push(_getFallbackOption(n)).
    // _getFallbackOption takes ONE argument, an index, into a fixed array
    // of Mobility / Breathing / Short walk. No location, no energy, no
    // arc, no check-in, and exercises: [] on every one.
    //
    // TWO-ENGINE reduced the engine to a single built session on purpose
    // -- its own comment says three was never a decision, it was an
    // artefact of three hardcoded focuses -- and left this loop behind.
    // So for ten days the screen filled two of its three slots from a
    // hardcoded list. Graeme, after saying "at the gym, 40 minutes":
    // offered a breathing session and a short walk, both captioned "A
    // steady option for today."
    //
    // Alternates are now BUILT, through the same engine, with the same
    // location-scoped equipment and the same duration as the primary.
    // Where the engine cannot produce one, THE SLOT IS DROPPED. One real
    // option beats one real option and two fictions -- a card promising
    // "3 MOVEMENTS" for a session carrying an empty exercise list is a
    // claim the coach cannot meet, and FAULTLESS is the standing rule.
    // SMOOTH-P2a. One plan. The alternates build (PROPOSAL-LOC) is gone:
    // "Something different today" builds another kind on request instead
    // of three being built on every visit and two thrown away.
    const options = _generateOptions(energyScore, effectiveIntensity, availTime);

    // Build greeting
    const greeting = _buildGreeting(name);

    // Build reflection (last 48h activity)
    const reflection = _buildReflection();

    // Build constraint message — one combined, severity-ordered
    // narrative covering every logged condition by its own band
    // (severe/moderate/mild), not just the worst tier with others
    // silently dropped. See _buildConditionNarrative() below.
    const constraint = conditionNarrative;

    // Build intro line
    const intro = _buildIntro(primaryGoal, burnout, reEntryCtx);

    return {
      greeting,
      reflection,
      constraint,
      intro,
      options,
    };
  }

  // ── Greeting ───────────────────────────────────────────────────────────────

  function _buildGreeting(name) {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Morning'
                       : hour < 17 ? 'Afternoon'
                       : 'Evening';
    const displayName = name ? `, ${name}` : '';

    // If re-entry, greeting acknowledges it without making the gap the subject
    if (reEntryCtx && !reEntryCtx.contextCaptured) {
      return `Good to see you${displayName}.`;
    }

    return `${timeGreeting}${displayName}.`;
  }

  // ── Reflection (last 48h activity) ────────────────────────────────────────

  function _buildReflection() {
    const activityLog = store.get('activityLog') || [];
    const cutoff      = Date.now() - (48 * 60 * 60 * 1000);
    const recent      = activityLog.filter(entry => {
      const ts = entry.completedAt || entry.loggedAt || entry.date;
      return ts && new Date(ts).getTime() > cutoff;
    });

    if (recent.length === 0) return null;

    const ACTIVITY_LABELS = {
      'workout':          'strength work',
      'morning-session':  'morning movement',
      'yoga-session':     'yoga',
      'walk-session':     'a walk',
      'running-session':  'a run',
      'cycle-session':    'cycling',
      'swim-session':     'swimming',
      'core-session':     'core work',
      'quiet-session':    'a breathing session',
      'breathing-session':'a breathing session',
      'gym-programme':    'gym work',
      'coach-session':    'a coaching session',   // v11 — was leaking raw as "coach-session"
    };

    // v11: fallback for any type not in the map above — hyphens to spaces
    // rather than leaking the literal raw type string into coach copy.
    function _humanizeActivityType(type) {
      return String(type).replace(/-/g, ' ');
    }

    // Deduplicate by type
    const typesSeen = new Set();
    const uniqueTypes = [];
    recent.forEach(entry => {
      const type = entry.type || entry.activityType || 'movement';
      if (!typesSeen.has(type)) {
        typesSeen.add(type);
        uniqueTypes.push(ACTIVITY_LABELS[type] || _humanizeActivityType(type));
      }
    });

    const voice = getActiveVoice();

    if (uniqueTypes.length === 1) {
      return `Since yesterday, you did ${uniqueTypes[0]}.`;
    }
    if (uniqueTypes.length === 2) {
      return `Since yesterday, you did ${uniqueTypes[0]} and ${uniqueTypes[1]}.`;
    }
    const last = uniqueTypes.pop();
    return `Since yesterday, you did ${uniqueTypes.join(', ')}, and ${last}.`;
  }

  // ── Intro line ─────────────────────────────────────────────────────────────

  function _buildIntro(primaryGoal, burnout, reEntryCtx) {
    // 2e. These said "three options" -- the choice of three went with the
    // old engine; since SMOOTH-P2a the coach offers ONE plan with every
    // exercise named. The burnout line now says what the check-ins said,
    // the same words the builder uses, never "your body".
    if (burnout) {
      return 'Your check-ins this week have mostly been low on energy, so today is a gentler one.';
    }
    if (reEntryCtx?.needsGentlerStart) {
      return 'Welcome back. Starting gently — that\'s the right call after being unwell.';
    }
    if (reEntryCtx && reEntryCtx.gapDays >= 7) {
      return 'Good to have you back. Here\'s what I\'d suggest for today.';
    }

    // Goal-connected intro
    const goalIntros = {
      'feel-good':       'Here\'s something to help you feel it today.',
      'build-muscle':    'Here\'s today. The programme is building.',
      'weight-loss':     'Here\'s today\'s session.',
      'improve-cardio':  'Here\'s today. It moves the cardio work forward.',
      'flexibility':     'Here\'s today, for range and ease.',
      'balance':         'Here\'s today. It builds the stability work.',
      'injury-recovery': 'Here\'s today, adapted to where your body is.',
      'return-to-fitness': 'Here\'s today. All of it counts.',
    };

    return goalIntros[primaryGoal] || 'Here\'s what I\'d suggest for today.';
  }

  // ── Pain checks ────────────────────────────────────────────────────────────
  // Bands match the canonical getPainBand() in conditions.js: mild 3-5,
  // moderate 6-7, severe 8+. Not calling getPainBand() directly here —
  // these three functions need simple filter/find behaviour across a
  // list of conditions, not a single-score classification — but the
  // numeric boundaries themselves are the same source of truth,
  // confirmed against conditions.js when writing this (04 Aug 2026).

  // Natural-language list join for multiple condition names in one
  // message — "X", "X and Y", or "X, Y, and Z" — rather than dumping
  // raw names or only ever mentioning the first match. Added 04 Aug
  // 2026 after Graeme asked directly whether multiple conditions would
  // read naturally; previously _buildMildMessage()/_buildConstraintMessage()
  // silently used conditions[0] only, dropping any others from the
  // message entirely (still correctly excluded from the workout either
  // way — this was a messaging gap, not a safety gap).
  function _joinNames(names) {
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
  }

  /**
   * Combined, severity-ordered narrative covering every logged
   * condition by its own individual band — severe, moderate, and mild
   * can all appear in the same message, each with correct wording and
   * pluralisation, instead of one tier winning and the rest going
   * unmentioned. Added 04 Aug 2026 — replaces the earlier separate
   * _checkMildPain/_checkModeratePain/_buildMildMessage/
   * _buildConstraintMessage functions, which only ever showed one tier.
   *
   * Severe wording is deliberately NOT "full rest day" language —
   * checked, and no such override actually exists live anywhere in the
   * app (severePainOverride is computed but unused; an old changelog
   * reference to a "Severe Zone Override" no longer exists in
   * workoutGenerator.js). Severe conditions get the same "worked
   * around" pattern as Moderate, just named separately — accurate to
   * what the exercise filtering actually does (acute-tier
   * contraindications), not an overclaim. Whether Severe should get a
   * genuine rest-day override is a real, separate product decision,
   * flagged to Graeme, not built here.
   */
  function _buildConditionNarrative(conditions, painScores) {
    const severeIds   = conditions.filter(id => (painScores[id] || 0) >= 7);
    const moderateIds = conditions.filter(id => {
      const p = painScores[id] || 0;
      return p >= 6 && p < 7;
    });
    const mildIds = conditions.filter(id => {
      const p = painScores[id] || 0;
      return p >= 3 && p < 6;
    });

    const sentences = [];

    if (severeIds.length > 0) {
      const parts  = severeIds.map(id => `${getConditionName(id)} (${painScores[id]}/10)`);
      const plural = severeIds.length > 1;
      sentences.push(`Your check-in flagged ${_joinNames(parts)} as Severe today \u2014 I\'ve kept things well clear of ${plural ? 'those areas' : 'that area'}.`);
    }

    if (moderateIds.length > 0) {
      const parts  = moderateIds.map(id => `${getConditionName(id)} (${painScores[id] || 6}/10)`);
      const plural = moderateIds.length > 1;
      // CONSTRAINT-CLAIM, 06 Sep 2026. WAS: "I've worked around that."
      //
      // Driven at lower-back 6: getActiveConditionIds() adds
      // `lower-back-subacute`, and getExerciseSafetyTier(cat-cow, ...)
      // returns SAFE. Nothing was worked around. `caution` only appears
      // at 7. So the coach claimed an adaptation it had not made, and
      // then session-rationale.js:521 correctly told the person on the
      // very next screen that the exercise WORKS that area. Two screens,
      // two answers, and the truthful one looked like the mistake.
      //
      // The subacute tier applies CARE, not exclusion, and whether it
      // changes the pool at all depends on the exercise. So the sentence
      // now claims the thing that is always true -- the condition was
      // taken into account -- and hands the judgement back rather than
      // asserting an outcome the coach cannot see from here.
      //
      // NOT narrowed to 7+ instead. Saying nothing at 6 would be worse:
      // the person told the coach about it, and silence reads as not
      // having been heard.
      //
      // FAULTLESS: every input the coach implies it used, it demonstrably
      // used. "Taken into account" is demonstrable -- the id is in the
      // active list. "Worked around" was not.
      sentences.push(`Your check-in flagged ${_joinNames(parts)} today. I\'ve built this with ${plural ? 'those' : 'that'} in mind \u2014 go by how it feels, and ease off anything that pulls on ${plural ? 'them' : 'it'}.`);
    }

    if (mildIds.length > 0) {
      const names  = mildIds.map(getConditionName);
      const plural = names.length > 1;
      sentences.push(`I\'ve noted ${_joinNames(names)} as Mild \u2014 I haven\'t changed anything there, but keep an eye on ${plural ? 'them' : 'it'}: if ${plural ? 'they start' : 'it starts'} feeling worse, please adapt what you\'re doing, or stop.`);
    }

    return sentences.length > 0 ? sentences.join(' ') : null;
  }

  // ── Option generation ──────────────────────────────────────────────────────

  /**
   * v9 — REWRITTEN. Was: look up window._workoutGenerator at runtime and
   * call it with a parameter object that the real function always
   * discarded (it takes zero parameters). Now: direct top-level import,
   * called with no arguments to match its real signature. The two values
   * that genuinely needed to reach the generator — the re-entry-adjusted
   * intensity and availableTime — are written to store immediately
   * before the call, which is how generateDailyOptions() actually reads
   * its inputs (store.get("todayIntensity"), store.get("availableTime")).
   * energyScore is kept as a parameter here only because _getFallbackOptions()
   * (the error/unavailable path) still needs it — it is not sent to the
   * real generator, which derives energy itself from checkinData.
   */
  function _generateOptions(energyScore, intensity, availTime) {
    try {
      if (intensity) {
        store.set('todayIntensity', intensity);
      }
      if (availTime) {
        store.set('availableTime', availTime);
      }
      return _buildCoachSuggestion();
    } catch (e) {
      console.warn('coach-proposal: session build failed, using fallbacks', e);
      return _getFallbackOptions(energyScore, intensity);
    }
  }

  /**
   * TWO-ENGINE, 06 Sep 2026. ONE suggestion, built by session-builder.js.
   *
   * Returns an array of one because every consumer on this screen -- the
   * panel, the card renderer, the start handler -- already speaks arrays,
   * and CLUB-SHELL will collapse the presentation. Changing the shape and
   * the engine in the same commit would make an engine fault and a
   * presentation fault indistinguishable.
   *
   * THREE OPTIONS WERE NOT KEPT. The old engine produced three because it
   * had exactly three focuses hardcoded, not because three was a decision.
   * CLUB spec v2 6.2 specifies one, so three-option plumbing here would be
   * work with a known death date.
   *
   * candidatePools is built with IDENTICAL arguments to buildSession, the
   * same as triggerBuild() in session-builder-ui.js. verify-swap1 asserts
   * the two never disagree; passing different arguments would leave that
   * gate green while every swap affordance silently vanished.
   */
  function _buildCoachSuggestion() {
    // STRETCH-VIA-COACH. The primary gets the same ordering as the
    // alternates; _applyStretchTarget() is called on `built` below, once
    // it exists. Kept as one call site per path rather than one shared
    // wrapper, because the two paths shape their option objects
    // differently and a wrapper would have to know both.
    // 🔴 ASK-KIND, 16 Sep 2026. THE PERSON GETS TO SAY.
    //
    // Graeme, Monday: "Perhaps asking the kind of session before
    // check-in would be good. The type of session on offer. In the gym I
    // might do core, strength, mobility and stretching."
    //
    // Graeme, Friday, for the third time: "Still only core. How does the
    // coach know I want core and not cardio or strength?"
    //
    // It did not. It inferred from the arc and never asked. When it kept
    // landing on core I fixed the ROTATION -- twice -- which was a real
    // bug and never the thing he was asking for. The rotation also only
    // advances on COMPLETED sessions, so somebody testing, or somebody
    // who opens the app and changes their mind, sees the arc's first
    // type forever.
    //
    // ⚫ A request OVERRIDES the arc rather than arguing with it. The arc
    // still decides when nobody has said otherwise, which is the whole
    // Plan promise. Saying "cardio" today does not edit the arc; it
    // spends one session differently, and tomorrow the arc resumes.
    const requested = store.get('requestedSessionType') || null;
    const chosen = chooseSessionType();
    const sessionType = requested || chosen.sessionType;
    const reason      = requested ? 'asked-for' : chosen.reason;
    const inputs      = { ...chosen.inputs, requestedSessionType: requested };

    // LOCATION-1, 08 Sep 2026. equipmentOverride was null here, which
    // falls back to the flat `equipment` field -- and
    // onboarding/equipment.js writes that field as the UNION of home kit
    // and gym kit. So this room built every session against both lists at
    // once. Measured with a resistance band at home and a rack at the
    // gym: a Barbell Back Squat and a Barbell Deadlift proposed to
    // somebody who might be standing in their kitchen. The default path,
    // not an edge case.
    //
    // The comment below has long said these arguments match
    // triggerBuild()'s. They did not: the builder passes a
    // location-scoped list and this passed null. This closes that gap
    // rather than widening it.
    const args = {
      sessionType,
      durationMins:      _getAvailableTimeMinutes(),
      equipmentOverride: equipmentForLocation(_currentLocation()).list,
      preset:            store.get('sessionPreset') || null
    };

    const built = buildSession(args);
    if (!built) return _getFallbackOptions(5, null);

    // STRETCH-VIA-COACH. Same ordering as the alternates get.
    _applyStretchTarget(built);

    // SEVERE-1 / CR-2. buildSession() may return Gentle Care or an
    // out-of-scope session instead of the type it was handed, and when it
    // does the type the chain chose is no longer what the person is being
    // offered. Recording the requested type as though it were delivered
    // would be the coach claiming a decision it did not get to make.
    // P2: the TYPE, never the id. Gentle Care is not a type anybody
    // chose; it is recorded as itself and the chooser ignores it.
    const delivered = built.gentleCare ? built.id : (built.sessionType || sessionType);

    return [{
      id:            built.id || `coach-${sessionType}`,
      name:          built.title,
      subtitle:      built.subtitle || null,
      duration:      built.duration,          // a RANGE string, see below
      exerciseCount: (built.exercises || []).length,
      exercises:     built.exercises || [],
      rationale:     built.coachLine || built.rationale || '',
      sessionType:   delivered,
      // STRETCH-VIA-COACH. Carried onto the option so the card can say
      // which target was applied. Absent on everything that is not a
      // stretch session, which is what keeps the note silent.
      stretchTarget: built.stretchTarget || null,
      inputs:        { ...inputs, chosenType: sessionType, reason },
      _pools:        buildCandidatePools(args)
    }];
  }

  function _getFallbackOptions(energyScore, intensity) {
    const availMins = _getAvailableTimeMinutes();
    // v8: shape normalised to match real generator output — id, name,
    // duration, exerciseCount, rationale — since these now feed Door 1's
    // preview cards directly, not just old per-door coach lines.
    const raw = (energyScore <= 3 || intensity === 'gentle')
      ? [
          { label: 'Gentle movement',   type: 'workout',       durationMins: Math.min(20, availMins), exerciseCount: 4 },
          { label: 'Breathing session', type: 'quiet-session', durationMins: Math.min(15, availMins), exerciseCount: 3 },
          { label: 'Short walk',        type: 'walk-session',  durationMins: Math.min(20, availMins), exerciseCount: 1 },
        ]
      : [
          { label: 'Strength session',  type: 'workout',       durationMins: Math.min(35, availMins), exerciseCount: 6 },
          { label: 'Mobility work',     type: 'yoga-session',  durationMins: Math.min(25, availMins), exerciseCount: 5 },
          { label: 'Breathing session', type: 'quiet-session', durationMins: Math.min(15, availMins), exerciseCount: 3 },
        ];

    return raw.map((opt, i) => ({
      id:            `fallback-${opt.type}-${Date.now()}-${i}`,
      name:          opt.label,
      type:          opt.type,
      duration:      opt.durationMins,
      exerciseCount: opt.exerciseCount,
      rationale:     'A steady option for today.',
      exercises:     []
    }));
  }

  /**
   * ARC-VISIBLE, 16 Sep 2026. Say that the arc is doing the work.
   *
   * Graeme: "I guess it's using the arc. The coach doesn't explicitly
   * say that it's using the arc, at least not enough to notice. Perhaps
   * a heading or subheading like 'based on your arc'."
   *
   * 🔴 The arc HAS been shaping these proposals since the programme
   * engine landed. Nothing on this screen said so, so the work was
   * invisible -- and invisible work reads as no work. This is the
   * governing sentence, "Free is today, the Plan is the arc", made
   * legible at the one moment it is actually true.
   *
   * ⚫ IT REPORTS, IT DOES NOT PROMISE. The line names the arc and the
   * strand the coach is leaning on ONLY when both are really there.
   * Silent otherwise -- a permanent "based on your arc" caption on a
   * screen the arc did not shape would be the same class of fault as the
   * padding loop in PROPOSAL-LOC: a claim the coach cannot meet.
   *
   * Not in the coach's first person. This is the product naming its own
   * machinery, the same voice the guidance line uses.
   */
  /**
   * STRETCH-VIA-COACH, 16 Sep 2026. A stretch session the coach proposes
   * gets the same ordering as one reached through the stretch door.
   *
   * Graeme: "I never get a chance to state what I want to do with
   * stretching... I didn't get any body part or shape options for
   * stretch."
   *
   * ⚫ ORDERS, DOES NOT ASK. The stretch door asks because it has a
   * screen to ask on; this path has a proposal card, and putting a
   * four-option question on a card somebody is scanning would make the
   * proposal a form. So the check-in's implied target is applied
   * silently, and the card SAYS SO -- see _stretchTargetNote(). The
   * person can still change it once inside.
   *
   * 🔴 SILENT WHEN THERE IS NO SIGNAL. With nothing sore, impliedTarget()
   * returns null and the order is untouched. Reordering around a guess
   * and then captioning it would be the padding-loop mistake again.
   *
   * Mutates the built session in place, which is what the caller expects
   * -- the alternates are built and handed on in the same loop.
   */
  function _applyStretchTarget(built) {
    try {
      if (!built || !isStretchLike(built)) return;
      const id = impliedTarget();
      if (!id) return;
      built.exercises = sortByTarget(built.exercises, id);
      built.stretchTarget = id;
    } catch { /* ordering is an improvement, never a blocker */ }
  }

  /** Says which target was applied, in the words the selector uses. */
  function _stretchTargetNote(option) {
    const t = option && option.stretchTarget ? targetById(option.stretchTarget) : null;
    if (!t) return '';
    return `Ordered around ${t.label.toLowerCase()}, from your check-in.`;
  }

  // ASK-KIND's picker was REMOVED here, 16 Sep 2026, on the day it
  // shipped. Graeme: "the 'something else' is almost invisible and
  // completely the wrong thing."
  //
  // He was right on both counts. It offered a different SHAPE of session
  // when the missing question was WHY somebody was training today, and it
  // hid that behind a collapsed link under the heading. PURPOSE-ASK asks
  // the real question properly, in the check-in, in the coach's voice.
  //
  // Its store field requestedSessionType is KEPT and is now the answer to
  // PURPOSE-ASK's second question. The plumbing was right; the question
  // was wrong.

  /**
   * PURPOSE-ASK, 16 Sep 2026. ONE LINE, FIVE MEANINGS.
   *
   * ARC-VISIBLE made this say "Based on your arc" because the arc WAS
   * always the reason -- it was the only one the coach had. Now the
   * person says why, so the line says what they said.
   *
   * Falls back to the arc line when no purpose was given: free accounts
   * never see the question, and a Plan session started without a
   * check-in still has an arc behind it.
   */
  function _arcLine() {
    const said = purposeLine();
    if (said) return `<p class=\"cp-preview-panel__arc\" role=\"note\">${said}</p>`;

    try {
      const arc = store.get('arc') || {};
      const ids = Array.isArray(arc.strands) ? arc.strands : [];
      if (!ids.length) return '';

      const aim = arc.aimId ? aimById(arc.aimId) : null;
      const strandLabels = ids
        .map(id => (STRANDS[id] || {}).label)
        .filter(Boolean);
      if (!strandLabels.length) return '';

      // 🔴 NAMES THE ARC, NOT A STRAND. The first draft said "leaning on
      // <strandLabels[0]>", which is a claim this screen cannot check:
      // strands[0] is the first in the arc, not the one today's session
      // serves. Naming the wrong strand would be the padding loop from
      // PROPOSAL-LOC in miniature -- plausible text the coach cannot
      // stand behind.
      //
      // The aim label is a full sentence and is already the headline on
      // Today ("Build a core that actually holds me up"), so quoting it
      // here uses the words the person already recognises instead of a
      // second vocabulary. Without an aim, the arc is still named: the
      // arc IS doing the work either way, and that is the whole point.
      const aimName = aim && aim.label ? aim.label : null;

      const text = aimName
        ? `Based on your arc \u2014 \u201c${aimName}\u201d.`
        : `Based on your arc.`;

      return `<p class="cp-preview-panel__arc" role="note">${text}</p>`;
    } catch {
      return '';
    }
  }

  function _routeForOption(option) {
    // v9: confirmed via ground-truthing workoutGenerator.js this session —
    // real generated options never carry `type` (only `focus`), so this
    // always falls through to 'workout' for real options. That is correct:
    // generateWorkout() only ever produces generic exercise-list sessions
    // shaped for workout.js, regardless of focus. Fallback options DO carry
    // type and route correctly already. See v9 changelog note above.
    const TYPE_TO_ROUTE = {
      'workout':          'workout',
      'morning-session':  'morning-session',
      'yoga-session':     'yoga-session',
      'walk-session':     'walk-session',
      'running-session':  'running-session',
      'cycle-session':    'cycle-session',
      'swim-session':     'swim-session',
      'core-session':     'core-session',
      'quiet-session':    'quiet-session',
      'gym-programme':    'gym-programme',
    };
    return TYPE_TO_ROUTE[option.type] || 'workout';
  }

  // ── Store helpers ──────────────────────────────────────────────────────────

  function _getCheckinEnergy() {
    const history = store.get('checkinHistory') || {};
    const today   = new Date().toISOString().split('T')[0];
    return history[today]?.energy || store.get('lastCheckin.energy') || 5;
  }

  function _getCheckinMood() {
    const history = store.get('checkinHistory') || {};
    const today   = new Date().toISOString().split('T')[0];
    return history[today]?.mood || store.get('lastCheckin.mood') || 5;
  }

  function _getAvailableTime() {
    // v12 (24 Jul 2026) — REWRITTEN. Was reading history[today]?.availableTime
    // and store.get('lastCheckin.availableTime') — neither field is ever
    // written. checkin.js's _saveAll() writes availableTime ONLY to the
    // top-level store.availableTime key (checkinData.saveCheckin() does not
    // include it in the checkin object, and it is not one of the fields
    // copied into lastCheckin). So this always fell through to the old
    // hardcoded fallback of 30 — a bare number, not a valid category — which
    // then got written straight back over the correct value by
    // _generateOptions() on every single mount of this screen, before
    // generateDailyOptions() ever ran. Net effect: availableTime-driven
    // session length has never worked via the real check-in → proposal flow.
    // Fix: read the single source of truth directly. null (not a number)
    // when nothing has been selected yet — workoutGenerator.js already
    // treats null as "no time constraint", which is the correct behaviour
    // for that case.
    return store.get('availableTime') || null;
  }

  // v12 (24 Jul 2026) — NEW. _getAvailableTime() is also used by
  // _getFallbackOptions() (below) where a number of minutes is needed, not
  // a category string — that mismatch is what produced the old numeric-30
  // fallback in the first place. Kept as a separate function with its own
  // contract rather than overloading _getAvailableTime()'s return type.
  function _getAvailableTimeMinutes() {
    const category = store.get('availableTime');
    return category ? (AVAILABLE_TIME_WINDOW_MINUTES[category] ?? 30) : 30;
  }

  /**
   * LOCATION-1, 08 Sep 2026. Where the person is for this session.
   *
   * NULL BECOMES HOME, and the direction matters: a session built for
   * home can be done at a gym, and one built for a gym cannot be done at
   * home. Guessing the permissive way is how a barbell ended up being
   * proposed to somebody in a kitchen.
   *
   * `sessionLocation` already existed and already had a writer --
   * checkin-mini.js Step 4, "Where are you now?" -- and was read by
   * nothing that builds a session. This is a wire that was left hanging,
   * not a new field.
   */
  /**
   * LOCATION-1. The words a person uses, not the store's ids.
   * "Outside" carries its consequence in the strip itself -- with nothing
   * to hand -- because outside is the one choice that changes what is
   * possible rather than merely where it happens.
   */
  function _locationLabel(loc) {
    return loc === 'gym'     ? 'At the gym'
         : loc === 'outside' ? 'Outside, with nothing to hand'
         :                     'At home';
  }

  /**
   * SMOOTH-P2a. Where they last trained; with nothing recorded, the gym
   * when their only kit is at a gym, or they told us the gym is how they
   * move. Measured on v542: a person whose only declared kit was a full
   * gym was planned "At home", bodyweight.
   */
  function _currentLocation() {
    const loc = store.get('sessionLocation');
    if (loc === 'gym' || loc === 'outside' || loc === 'home') return loc;
    const gym   = store.get('gymEquipment')  || [];
    const home  = store.get('homeEquipment') || [];
    const ident = store.get('movementIdentity') || [];
    if (gym.length && (!home.length || (Array.isArray(ident) && ident.includes('gym')))) return 'gym';
    return 'home';
  }

  // ── Public interface ───────────────────────────────────────────────────────

  return { mount };
}
