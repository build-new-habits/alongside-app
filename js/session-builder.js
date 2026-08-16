/**
 * js/session-builder.js - Generative Session Engine
 *
 * 16 Aug 2026 v36
 *   SEVERE-1. The Gentle Care bypass, on both entry points. Rollback is
 *   one constant: SEVERE_BYPASS_ENABLED.
 *
 * 15 Aug 2026 v35
 *
 * v35 - PROG-1 attempted, reverted, and MY CONCLUSION ABOUT IT
 *   CORRECTED the same evening. Read this before trying it again.
 *
 *   THE ONE REAL FIX: _difficulty() lifted to module scope. It was
 *   defined inside _filterCandidates(), so selectFromCategories() could
 *   not see it. One definition now. That part stands.
 *
 *   THE GAP, which is real: programme phases declare an intensityBias
 *   ('gentle' | 'moderate' | 'challenging') that climbs across twelve
 *   weeks. It reaches coach-proposal.js and NOT this door, so somebody
 *   on a programme who uses the session-builder gets week 10 built the
 *   same as week 1.
 *
 *   WHAT I ACTUALLY ESTABLISHED, AND WHAT I DID NOT.
 *
 *   I added a phase preference here, measured a 3% difficulty change
 *   across 200 sessions, and concluded that progression cannot be
 *   delivered by preference because 393 of 551 entries sit at difficulty
 *   1-2. I wrote that up as a finding.
 *
 *   It is not a finding. Instrumenting the block showed it executed ZERO
 *   times in that test configuration, so the 3% was run-to-run noise on
 *   unchanged behaviour. The idea was never tested. Whether it works is
 *   still unknown.
 *
 *   I also claimed a ReferenceError thrown in here was swallowed
 *   upstream and produced a fallback session, and logged it as SILENT-1.
 *   Injecting a throw deliberately shows it propagates cleanly.
 *   SILENT-1 DOES NOT EXIST. The claim was wrong.
 *
 *   RESOLVED, 15 Aug evening, and this is the third correction on the
 *   same item. The block was NOT unreachable. Instrumenting the anchor
 *   point directly shows pickFrom()'s body runs nine times per session
 *   and sees warmup, main and cooldown.
 *
 *   My "executed zero times" reading was an artefact of where I put the
 *   probe: immediately AFTER the getPhaseBias() call, so anything going
 *   wrong on that line meant the probe never fired and I read the
 *   silence as the block not running.
 *
 *   So the placement is fine and the idea is still untested. Retrying it
 *   is worthwhile. The thing to verify first is getPhaseBias() resolving
 *   correctly from inside this module -- probe BEFORE it, not after.
 *
 * 14 Aug 2026 v34
 *
 * v34 - W2-7. 'less' no longer behaves identically to 'avoid'.
 *
 *   CORRECTION to my own Wave 2 note, recorded rather than quietly
 *   dropped. I reported that session-builder never read
 *   exercisePreferences. It read BOTH levels already -- 'avoid' at the
 *   candidate filter, 'less' at selection. I had grepped for a store.set
 *   and concluded from the absence of a writer that there was no reader.
 *
 *   The real defect was narrower and more interesting: 'less' was
 *   implemented as "never chosen while something else exists", which in
 *   a pool of fifty is never. Measured: an exercise served 24 times in
 *   60 sessions dropped to 0 under 'less' -- identical to 'avoid'. A
 *   deliberately two-level signal had collapsed to one, and the gentler
 *   option was doing the harsher thing. Now probabilistic: roughly a
 *   fifth of its previous rate, never zero.
 *
 * 14 Aug 2026 v33
 *
 * v33 - CARDIAC-1. exerciseClearance gates LOADED STRENGTH work only.
 *   Persona 2.5 declared a heart condition and the buildable pool changed
 *   by zero exercises. Mobility, walking, breathing and bodyweight stay
 *   open at every value, and null means not-asked, never not-cleared.
 *
 * 14 Aug 2026 v32
 *
 * v32 - W2-6. Section novelty now SCALES with sessionVariety instead of
 *   being added flat on top of it. "Something like last time" was
 *   delivering 40% overlap because the warm-up and cool-down weighting
 *   overrode the person's answer. 'balanced' and 'varied' unchanged.
 *
 * 14 Aug 2026 v31
 *
 * v31 - W2-1. The difficulty ceiling now applies to cooldown as well as
 *   main and warmup, with the same relax-if-empty protection. Persona
 *   trace Wave 2. Rebased onto v30 (CAP-6b) -- different region of the
 *   file, no interaction with _capabilityUnrestricted().
 *
 * 13 Aug 2026 v30
 *
 * v30 - CAP-6b. impactSafe removed from _capabilityUnrestricted().
 *   Found by the Wave-2 verification trace: persona 2.12, a 33-year-old
 *   desk worker who is fully capable but answered "no" to whether both
 *   feet leave the ground. That is a statement about IMPACT, not about
 *   needing a chair -- and it made the person read as restricted, so
 *   adapted content stayed at full weight and he received FOURTEEN
 *   seated or supported items across nine sessions. Now one.
 *
 *   I conflated two separate axes when writing CAP-6. Impact is already
 *   handled properly and separately by the impact gate; somebody who
 *   cannot jump can still stand, hinge, press and pull.
 *
 * 13 Aug 2026 v29
 *
 * v29 - DEDUPE-1. pickFrom() will not select an exercise whose NAME is
 *   already in the session. `chosen` is a Set of IDS, so identity was
 *   checked by id while the person reads the name -- both members of a
 *   same-named pair could land in one session and somebody could read
 *   "Burpee" twice on one screen. Same shape as the 11 Aug duplicate-
 *   OBJECT fix, which was invisible to an identity check; this one was
 *   invisible to an id check.
 *
 * 13 Aug 2026 v28
 *
 * v28 - VOICE-2. Session opening lines become rotating pools of eight
 *   per type, replacing one fixed string each. Free is locked to Full
 *   Body at 30 minutes, so persona 2.12 read a byte-identical sentence
 *   at the top of every session he ever did -- for a product whose whole
 *   differentiator is the coach, the person with the least to
 *   personalise against got the least varied coach. Eight sessions
 *   before a repeat now, from one.
 *
 *   Rotation on completed-session count, never Math.random(): random
 *   will happily hand the same line twice running, which is the exact
 *   complaint. Partials do not advance it, matching COUNT-1.
 *
 *   Lines written and approved by Graeme -- do not paraphrase.
 *
 * 13 Aug 2026 v27
 *
 * v27 - FIX-5. Sport-conditioning content (sled sprints, agility
 *   ladders, reactive change of direction) joins the gym-session
 *   de-prioritisation, tagged discipline: 'sport' at source. It reached
 *   persona 2.15's Lower Body session as category 'cardio',
 *   movementPattern 'locomotion' -- a correct description of a sled
 *   sprint and no help in deciding whether it belongs in a barbell
 *   session. Preference, not exclusion: personas 2.3 and 2.9 exist and
 *   this is exactly their content.
 *
 * 13 Aug 2026 v26
 *
 * v26 - C4 residuals + SEL-1 + FIX-4.
 *
 *   FIX-1 (C4-1) discipline fit. Yoga and Pilates movements sort behind
 *   everything else in a gym-shaped session. Measured by reversal:
 *   12 yoga/pilates entries across 12 Lower Body sessions became 0.
 *   The markers ('yoga-pose', 'pilates-move') already existed and
 *   nothing had ever read them -- the same shape as C2 and C3.
 *
 *   FIX-2 (C4-3) the opening pick. The anchor mechanism was NOT the
 *   fault and was nearly rebuilt on that misreading. SECTION_NOVELTY
 *   .main is 0.0, so a main lift already holds once chosen -- persona
 *   2.15 kept Paused Goblet Squat faithfully for three weeks. The fault
 *   was one line earlier: her FIRST session picked at uniform random
 *   from everything unseen, so a goblet squat and a barbell front squat
 *   were equally likely, and continuity then preserved the coin toss.
 *   A first-ever main pick now prefers the loadable option the person
 *   owns the kit for, when their goal is strength. She now opens with
 *   Barbell Front Squat and it holds.
 *
 *   SEL-1. The reserved cardio-warmup slot now honours 'less'
 *   preferences and discipline fit. Telling the coach "not a fan" and
 *   watching it open every session with that exercise is worse than
 *   never being asked.
 *
 *   Scope trap worth recording: the pulse slot runs ~120 lines BEFORE
 *   pickFrom's locals are declared, so referencing `wantsGymDiscipline`
 *   there threw a temporal-dead-zone error that was invisible in review
 *   and immediate at runtime. CROSS_DISCIPLINE and GYM_SESSION_TYPES
 *   are module scope for that reason.
 *
 * 13 Aug 2026 v25
 *
 * v25 - C2 + sourceLibrary. The rehabilitation library no longer reaches
 *   people with no declared condition; condition work is delivered by
 *   conditionProgrammes.js, which this filter does not touch.
 *
 *   AND THE TRAP IT EXPOSED. The first version of this filter tested
 *   `ex.category === "rehabilitation"`. It ran on every candidate and
 *   excluded NOTHING, because matched.push() overwrites `category` with
 *   the SESSION category ("squat-pattern") before any filter sees it.
 *   It read as correct and did nothing at all. `sourceLibrary` now
 *   preserves the entry's own library. Any future filter reading
 *   ex.category inside _filterCandidates has the same bug waiting.
 *
 * 13 Aug 2026 v24
 *
 * v24 - CAP-6 (C3). Adapted content is de-prioritised for people who do
 *   not need it. The capability screen answers "what CAN this person
 *   do?" and every gate built on it subtracts; nothing ever asked "what
 *   does this person NEED?", so an engine that only subtracts hands
 *   adapted work to everybody able to perform it. Traced 13 Aug,
 *   persona 2.15: Seated Arm Cycling x9 in three weeks against Barbell
 *   Bench Press x5, and three of her last four sessions OPENED with
 *   seated shoulder rolls.
 *
 *   Preference, never exclusion -- same shape as the 'less' rule it
 *   sits beside. If a category has nothing else, adapted comes back, so
 *   no session can be starved and the CAP-4 warm-up floor holds.
 *
 *   AND THE BUG UNDERNEATH IT. The rule went in and persona 2.15 still
 *   opened with Seated Arm Cycling. The reserved cardio-warmup slot
 *   picks at random from its own pool and consults NONE of the
 *   preference rules in pickFrom -- not 'less', not adapted, not
 *   continuity -- while sixteen non-adaptive options sat unreachable.
 *   It also declared `const pickFrom = ...`, SHADOWING the function of
 *   the same name, so at the call site it read exactly as though it
 *   were using the real selector. Three passes over this file missed it
 *   for that reason. Renamed to pulsePool.
 *
 *   STILL OPEN, logged as SEL-1: that slot continues to ignore 'less'
 *   preferences, so somebody can say "not a fan" and keep receiving it
 *   as their opener. Same root cause, wider than this file's scope.
 *
 * 12 Aug 2026 v23
 *
 * v23 - EMP-2. session.rationale.adjusted now records whether the coach
 *   VISIBLY adapted today. Empathy Transfer Stage 2 Prompt B is written
 *   for exactly that moment and its condition was unevaluable, because
 *   nothing anywhere recorded that an adjustment had happened. Written
 *   onto the session rather than as a new store field: generatedSession
 *   is already persisted, and this is a fact about one session, not a
 *   standing property of the person. See the note at the write site.
 *
 * 12 Aug 2026 v22
 *
 * v22 — C2/C3, third-pass persona trace.
 *   C2: contentType 'practice' now excluded from component selection. 140
 *   of 556 entries are complete standalone sessions, and this file had
 *   never read the field — so a 60-minute cardio build returned C25K Week
 *   1 AND Week 2 AND a 20-minute run in one session. CON-6 did not close
 *   this: moving to the shared database is what brought the practices in.
 *   C3: the duration estimate no longer triples duration-based exercises.
 *   `ex.sets || 3` multiplied a 20-minute run by 3; a 60-minute request
 *   was labelled "552–562 mins". Fixed at both parallel call sites.
 *   C4: sessions are now trimmed to the requested duration. Fixing C3
 *   exposed a separate fault it had been masking — EXERCISE_COUNT
 *   allocates a fixed count, and count stops being a proxy for time once
 *   entries range from 1 to 9 minutes each. A 60-minute request was
 *   producing 104 minutes of work and a 30-minute request over 60.
 *   Correctly labelling a 100-minute session as 100 minutes is not a fix
 *   when the person asked for 60. Trims main only, longest first, never
 *   below 3, never warmup or cooldown, never prescribed.
 *   C1 (partial): _loadsLegs() no longer proxies "loads the legs" as "has
 *   equipment or is difficulty 3+". The gate caught Seated Leg Extension
 *   passing that test — bodyweight, low difficulty, and the exact exercise
 *   the CAP-5 note exists to prevent.
 *
 * 11 Aug 2026 v21
 *
 * v21 - Full sweep. Seven new categories wired in, closing an audit
 *   finding that 85 of 544 exercises -- 15.6% of the database -- matched
 *   no category any session type declared. Arm isolation, gentle cardio,
 *   foam rolling, pilates, yoga flows, swimming and rehabilitation
 *   control work were all written, tagged and unreachable.
 *
 * 11 Aug 2026 v20
 *
 * v20 - EQ-1. "balance-work" and "power" wired into Lower, Full, Core,
 *   Cardio and Mobility. Traced a home user's own equipment list and
 *   found his balance board reachable by NO session type at all, and
 *   his jump box and skipping rope reachable only through Cardio.
 *
 * 11 Aug 2026 v19
 *
 * v19 - CAP-5. Leg function gated separately from standing. An 8-week
 *   trace of a wheelchair user found him correctly given seated work
 *   and then handed Seated Leg Extension and Seated Hamstring Curl.
 *   'limited' still allows unloaded leg movement, because keeping what
 *   function exists is worth more than protecting it into disuse.
 *
 * 11 Aug 2026 v18
 *
 * v18 - RAT-1. No category may supply more than a third of a section.
 *   Found in the 8-week persona trace: a 76-year-old's Mobility session
 *   opened with five breathing practices in a row, because Mobility
 *   declares two warm-up categories for five slots and one of them
 *   holds 21 entries.
 *
 * 11 Aug 2026 v17
 *
 * v17 - Every session now carries a rationale. Graeme: "I'd like the
 *   coach to consider my goals and in the programme selected be able to
 *   explain why this chosen exercises works... There's a set of
 *   activities, rationale, long term programme. But it's always
 *   explained and connected." See data/session-rationale.js.
 *
 * 11 Aug 2026 v16
 *
 * v16 - Exercise preferences honoured. conditionProgrammes.js has
 *   applied these since 04 Aug and this file never has, so telling the
 *   coach you were not a fan of something changed your prescribed
 *   programme and did nothing to your generated sessions. 'avoid'
 *   removes; 'less' sorts to the back rather than being removed,
 *   because "not a fan" is not "never again".
 *
 * 11 Aug 2026 v15
 *
 * v15 - CAP-3. trainingIntent tilts main-section selection. "maintain"
 *   prioritises carries, grip, balance, sit-to-stand and floor transfer
 *   -- the capacities that go first and that decide independence --
 *   rather than doing less of everything. "recover" leans on the
 *   rehabilitation library. Prioritised, never exclusive.
 *
 * 11 Aug 2026 v14
 *
 * v14 - CAP-1. Selection now reads store.capabilityProfile(), which
 *   measures what a person CAN do rather than how often they move.
 *   Three gates: impact (both feet leaving the ground), floor access,
 *   and balance confidence -- the last being its own axis, because
 *   Warrior III is low impact and moderate difficulty and completely
 *   wrong for someone worried about falling. The screen can only lower
 *   a ceiling, never raise one.
 *
 * 11 Aug 2026 v13
 *
 * v13 - Persona trace round 2. Four changes,
 *
 *   (impact gate) Raising the ceilings served a frail sedentary
 *   76-year-old Lateral Hops and sprint mechanics. Difficulty and
 *   impact are different axes -- for a conditioned person a jump squat
 *   IS easy, and the risk in a plyometric is landing force and fall
 *   risk, neither of which scales with how hard it feels. Impact is now
 *   gated separately: sedentary, light and returning users get no
 *   jumping, bounding, sprinting or landing work. Gated on capability,
 *   not age, deliberately.
 *
 *   Three further changes, all from executing live
 *   code against the personas rather than reading it.
 *
 *   (2.15, fit mid-20s) Slot-weighted anchoring. CONT-1 anchored every
 *   slot equally and got it exactly backwards: her eight most-repeated
 *   exercises after eight weeks were three cardio warm-ups and five
 *   accessories, not one barbell lift. Pool depth, not intent -- thin
 *   warm-up categories repeat, deep main categories rotate. Main now
 *   anchors hard; warm-ups and cool-downs rotate freely.
 *
 *   (2.15) Difficulty ceilings raised. They topped out at 3 on a 1-10
 *   scale, leaving fourteen exercises unreachable by any user at all --
 *   treadmill intervals, sled push, renegade rows, ab wheel, the
 *   weighted core work written for exactly her.
 *
 *   (2.13/2.14) sessionVariety honoured. Novelty rate now follows the
 *   person's stated preference rather than one default serving the
 *   novelty-seeking and predictability-seeking personas equally badly.
 *
 * 11 Aug 2026 v12
 *
 * v12 - Persona trace findings (2.10 and 2.11). Three defects, all
 *   found by executing live code rather than reading it.
 *
 *   (2.11, duplicates) A session could contain the same exercise twice
 *   -- measured at 12% of all sessions. CON-6's per-category object
 *   spread defeated the identity-based dedupe guard. Now guarded by id
 *   across all three sections.
 *
 *   Two safety gaps, both
 *   found by executing live code rather than reading it.
 *
 *   (2.11, Mum, 76, mindfulness-led) 30 entries carry no
 *   difficultyLevel, and every read was `(ex.difficultyLevel || 1)` --
 *   treating an untagged exercise as the EASIEST possible. Backwards
 *   for safety. She was served Warrior III, a single-leg balance pose
 *   and a real fall risk for her. New _difficulty() falls back to
 *   energyRequired, which is present on all 497.
 *
 *   (2.10, Dad, 76, Dad, 76, frail, sedentary). The
 *   difficulty ceiling applied to "main" only; warmups were exempt.
 *   That was safe while warmups came from a curated 70-entry pool of
 *   hand-written warmups, and stopped being safe at CON-6 when they
 *   began coming from all 497 shared exercises. Traced live: a
 *   sedentary 76-year-old was served "High Knees" as his opening
 *   pulse-raiser. The ceiling now applies to warmups, with the safety
 *   floor protected by relaxing rather than exempting.
 *
 * 11 Aug 2026 v11
 *
 * v11 - CONT-1. Selection is continuity-aware. It was Math.random() over
 *   the candidate pool every session, from 497 exercises, so a person met
 *   a given movement roughly once and then not again for weeks. No
 *   progressive overload, no skill acquisition, no familiarity -- and the
 *   whole watchOut library was decorative, because you cannot correct a
 *   fault you never repeat. Exercises met before and recently are now
 *   strongly preferred, bounded by a 21-day recency window, an 8-session
 *   mastery ceiling and a 25% novelty rate. Depends on store.js v22's
 *   exerciseHistory, which did not exist until today: the product
 *   recorded that a session happened and how many exercises it had, never
 *   which ones.
 *
 * 11 Aug 2026 v10
 *
 * v10 - CON-8. Equipment is now a preference, not only a permission.
 *   Until now nothing ever preferred a barbell when the person was
 *   standing next to one: equipment gated what was ALLOWED, and since
 *   bodyweight is the large majority of the database, random selection
 *   handed gym users sessions they could have done in their living room.
 *   Reported twice by Graeme, and confirmed by trace both times. Within
 *   each category, equipment-using exercises are now picked first when
 *   the person has meaningful kit. Bodyweight fallback unchanged.
 *
 * 11 Aug 2026 v9
 *
 * v9 - CON-6. The private EXERCISE_POOL is gone. _filterCandidates() now
 *   selects from the shared 461-entry database in js/data/exercises/ via
 *   the new js/data/session-categories.js, which maps this file's 39
 *   fine-grained categories ("hip-hinge", "anti-rotation") onto queries
 *   over movementPattern, category and affectsAreas -- rather than
 *   re-tagging 461 entries with a second parallel vocabulary that would
 *   drift from the first.
 *
 *   What this fixes, all at once: 61 pool entries rendered near-blank
 *   because they were in the retired description/cues shape; 139 practice
 *   entries and the whole yoga library were unreachable from the builder;
 *   and every shared fix had to be written twice, with the second write
 *   found only after a live bug (PT-11, CON-2, PT-19 all had this shape).
 *
 *   Section is no longer stored per entry. It was never a property of an
 *   exercise -- a hip mobility drill is a warm-up in a Lower Body session
 *   and main content in a Mobility session -- and storing it is why the
 *   pool duplicated entries. It now comes from which SESSION_TYPES list a
 *   category appeared in, with a difficulty and energy ceiling applied to
 *   warm-ups so nothing strenuous can land there.
 *
 *   Four machine warm-ups the pool had and the database did not were
 *   ported into exercises/cardio.js v2 first. Nothing was deleted before
 *   it existed somewhere better.
 *
 * 11 Aug 2026 v8
 *
 * v8 - All four machine cardio-warmup entries (bike, treadmill, cross
 *   trainer, rower) rewritten to the Exercise Entry Standard. They were
 *   authored 05 Aug with description/cues and rendered as a name and a
 *   duration and nothing else - which is what Graeme saw when a gym
 *   session finally produced a cross trainer warm-up and still gave him
 *   no guidance at all.
 *
 *   SCOPE NOTE, honestly stated: this brings all 9 cardio-warmup entries
 *   to the standard. THE OTHER 61 ENTRIES IN THIS POOL ARE STILL IN THE
 *   LEGACY SHAPE and still render near-blank on this route. That is not
 *   a defect introduced here; it is the pre-existing state of the whole
 *   private pool and the substance of CON-6. It is recorded here rather
 *   than left implicit so nobody has to rediscover it.
 *
 * 11 Aug 2026 v7
 *
 * v7 - The five pulse-raisers added in v6 were authored with
 *   description/cues, the shape the Exercise Entry Standard retired
 *   earlier the same day. They therefore rendered as a name and a set
 *   count and nothing else - the PT-13 failure, self-inflicted, in
 *   content written hours after the standard that forbids it. All five
 *   rewritten in full to the standard: instructions, why, coaching,
 *   watchOut. Recorded rather than quietly corrected, because the cause
 *   was matching the surrounding file's legacy style instead of the
 *   standard, and that will recur until CON-6 retires this pool.
 *
 * 11 Aug 2026 v6
 *
 * v6 - PT-19. Every session now opens with a pulse-raiser unless there is
 *   a named reason it should not, and the reason is spoken. Three
 *   compounding causes found: (1) "cardio-warmup" was listed last of four
 *   categories with three slots available, so the selection loop broke
 *   before reaching it -- no generated session contained one, at home OR
 *   in a fully-equipped gym; (2) all four cardio-warmup entries required a
 *   machine, so the category was structurally empty without one; (3) two
 *   of those four carried equipment tags ("bike", "cross-trainer") absent
 *   from equipment.js's vocabulary, unreachable even in a gym. Fixed with
 *   a reserved first warm-up slot, five tiered bodyweight pulse-raisers,
 *   corrected tags, and a machine preference when one is available.
 *
 * 11 Aug 2026 v5
 *
 * v5 — CON-2. Equipment matching now resolves through equipment-map.js,
 *   the same fix applied to filterByEquipment() in exercises/index.js.
 *   This file's own equipSet was built straight from the user's ticked
 *   ids, so an exercise tagged "dumbbell" never matched a user holding
 *   "dumbbells-medium". Third instance of this file needing a fix that
 *   was already made elsewhere — CON-6 retires its private pool entirely.
 *
 * v4 — PT-11. Difficulty ceiling applied in _filterCandidates(). This
 *   file's private EXERCISE_POOL never filtered on fitness, so the
 *   "Cardio, Core & Strength" door handed a sedentary beginner and a
 *   gym-literate lifter the identical pool — the WOW-2 fix reached
 *   workoutGenerator.js but not here. Uses the existing difficultyLevel
 *   field, which was written on all 65 exercises and read nowhere.
 *   Warmup/cooldown exempt so the warmup safety floor cannot be starved.
 *
 * 10 Aug 2026 v3
 *
 * v3 -- Bodyweight-only lower-body main content added overnight (Claude,
 *   autonomous session, following the on-device Phase 1 finding that a
 *   no-equipment Lower Body session produced 0 main exercises). New
 *   entries: sb-hh-04 (Bodyweight good morning, hip-hinge), sb-sl-03
 *   (Bodyweight reverse lunge, single-leg), sb-sq-03 (Bodyweight squat,
 *   squat-pattern), sb-li-02 (Wall sit, leg-isolation) -- all
 *   equipment: [], matching the existing exercise-entry format and
 *   contraindication conventions exactly. Confirmed via test: Lower
 *   Body with no equipment now returns 4 main exercises, was 0. Full
 *   7-session-type regression re-run clean afterward, no crashes, no
 *   warmup-floor violations. Deliberately scoped narrow -- only the
 *   four categories with a confirmed real gap, not a general content
 *   audit of the whole pool.
 *
 * 05 Aug 2026 v2
 *
 * v2 -- Gym Session Builder Phase 1 (blueprint
 *   alongside_blueprint_gym-session-builder-phase1_05aug2026_v2.md).
 *   Three additions, all built to reuse selectFromCategories()'s
 *   existing filtering (equipment, contraindications) rather than
 *   duplicating it:
 *   1. ALLOCATION_PRESETS -- proportional session control (Graeme:
 *      "how much of my gym session I spent doing the different
 *      elements"). Scales EXERCISE_COUNT per preset, with a hard
 *      floor of 1 on warmup no matter what -- the safety rule (never
 *      skip a warmup) holds structurally, not just by convention.
 *   2. buildCandidatePools() -- exposes the filtered-candidate step
 *      selectFromCategories() already did internally, now callable on
 *      its own, wider than the auto-pick count, each item flagged
 *      recommended:true/false so the UI can pre-check a sensible
 *      starting selection for "coach recommends" mode while "build
 *      your own" shows the identical list unchecked -- one function,
 *      two presentations, not two implementations.
 *   3. buildSessionFromSelection() -- takes exercise IDs a person
 *      actually chose and assembles the same session shape
 *      buildSession() produces, so gym-programme.js renders either
 *      one identically. Same hard warmup floor as above: if a chosen
 *      selection ends up with zero warmup exercises, one is added
 *      automatically rather than allowing a genuinely warmup-free
 *      session to ship.
 *
 * 21 May 2026 v1
 *
 * Builds a bespoke gym session from four inputs:
 *   1. Session type (Glute Focus, Upper Body, Lower Body, Full Body, Core, Cardio, Mobility)
 *   2. Duration (15 / 30 / 45 / 60 minutes)
 *   3. Equipment (from store, overridable per session)
 *   4. Conditions and pain today (from store, current check-in)
 *
 * Returns an object matching PROGRAMME.sessions[0] schema exactly,
 * so gym-programme.js renders it without modification.
 *
 * This is NOT AI generation. It is a structured selection engine.
 * Templates define which exercise categories belong in each section.
 * The engine selects actual exercises from the database at runtime.
 *
 * Spec: alongside_session_builder_spec_17may2026_v1.docx
 */

import { store } from "./store.js";
import { resolveEquipment, exerciseIsAvailable } from "./data/equipment-map.js";
import { EXERCISES, isSessionLength } from "./data/exercises/index.js";
import { matchCategory } from "./data/session-categories.js";
import { buildRationale } from "./data/session-rationale.js";
import { getZoneStatus } from "./data/conditions.js";

// ── Allocation presets (05 Aug 2026) ──────────────────────────────────────────
// Scales EXERCISE_COUNT's warmup/main/cooldown split. Warmup always floors at
// 1 regardless of preset -- this is the safety rule, not a suggestion.
export const ALLOCATION_PRESETS = [
  { id: "balanced", label: "Balanced",        description: "The standard mix.",                     warmupMult: 1,   mainMult: 1,   cooldownMult: 1   },
  { id: "strength", label: "Mostly strength",  description: "Less warm-up and stretching, more work.", warmupMult: 0.6, mainMult: 1.3, cooldownMult: 0.7 },
  { id: "mobility", label: "Mostly mobility",  description: "More warm-up and stretching, less load.", warmupMult: 1.5, mainMult: 0.7, cooldownMult: 1.4 }
];

function _applyPreset(counts, presetId) {
  const preset = ALLOCATION_PRESETS.find(p => p.id === presetId) || ALLOCATION_PRESETS[0];
  return {
    warmup:   Math.max(1, Math.round(counts.warmup   * preset.warmupMult)),
    main:     Math.max(1, Math.round(counts.main     * preset.mainMult)),
    cooldown: Math.max(1, Math.round(counts.cooldown * preset.cooldownMult))
  };
}

// ── Session type definitions ──────────────────────────────────────────────────

export const SESSION_TYPES = [
  {
    id:          "glute",
    label:       "Glute Focus",
    icon:        "🍑",
    description: "Hip hinge, bridges, single-leg work. Built around glute activation.",
    warmupCategories:   ["activation", "hip-mobility", "cardio-warmup"],
    mainCategories:     ["hip-hinge", "bridge", "single-leg", "glute-isolation"],
    cooldownCategories: ["hip-flexor-stretch", "glute-stretch", "child-pose"]
  },
  {
    id:          "upper",
    label:       "Upper Body",
    icon:        "💪",
    description: "Push and pull. Shoulder, chest, back, arms.",
    warmupCategories:   ["thoracic-mobility", "shoulder-warmup", "band-warmup", "cardio-warmup"],
    mainCategories:     ["horizontal-pull", "horizontal-push", "vertical-pull", "shoulder-isolation", "arm-isolation"],
    cooldownCategories: ["chest-stretch", "lat-stretch", "thread-needle"]
  },
  {
    id:          "lower",
    label:       "Lower Body",
    icon:        "🦵",
    description: "Squat, hinge, single-leg. Quads, hamstrings, glutes.",
    warmupCategories:   ["activation", "hip-mobility", "ankle-mobility", "cardio-warmup"],
    mainCategories:     ["squat-pattern", "hip-hinge", "single-leg", "leg-isolation", "loaded-carry", "balance-work", "power"],
    cooldownCategories: ["hip-flexor-stretch", "hamstring-stretch", "figure-4"]
  },
  {
    id:          "full",
    label:       "Full Body",
    icon:        "⚡",
    description: "Push, pull, squat, hinge. Every major pattern in one session.",
    warmupCategories:   ["activation", "hip-mobility", "thoracic-mobility", "cardio-warmup"],
    mainCategories:     ["squat-pattern", "hip-hinge", "horizontal-pull", "horizontal-push", "core-stability", "loaded-carry", "balance-work", "power"],
    cooldownCategories: ["hip-flexor-stretch", "chest-stretch", "child-pose"]
  },
  {
    id:          "core",
    label:       "Core",
    icon:        "🎯",
    description: "Anti-extension, anti-rotation, anti-lateral. Real core work.",
    warmupCategories:   ["cardio-warmup", "breathing-warmup", "cat-cow"],
    mainCategories:     ["anti-extension", "anti-rotation", "anti-lateral", "loaded-carry", "balance-work", "pilates"],
    cooldownCategories: ["child-pose", "supine-rotation"]
  },
  {
    id:          "cardio",
    label:       "Cardio",
    icon:        "🏃",
    description: "Conditioning and cardiovascular work. No heavy loading.",
    warmupCategories:   ["lower-mobility"],
    mainCategories:     ["conditioning", "interval", "power", "easy-cardio", "swim"],
    cooldownCategories: ["static-stretch", "self-massage", "breathing-cool"]
  },
  {
    id:          "mobility",
    label:       "Mobility",
    icon:        "🌿",
    description: "Hip, thoracic, ankle, shoulder. Active range of motion.",
    // Widened 11 Aug 2026 (RAT-1). Two categories for up to five slots is
    // what forced the fill loop to drain whichever was deepest. A Mobility
    // warm-up should open the joints it is about to work.
    warmupCategories:   ["breathing-warmup", "cat-cow", "hip-mobility",
                         "thoracic-mobility", "ankle-mobility"],
    mainCategories:     ["hip-mobility", "thoracic-mobility", "ankle-mobility", "shoulder-mobility", "balance-work", "pilates", "yoga-flow", "rehab-control"],
    cooldownCategories: ["deep-stretch"]
  }
];

// ── Exercise pool by category ─────────────────────────────────────────────────
// Each exercise: { id, name, section, category, sets, reps, tempo, rest,
//                  description, cues, youtube, recommended?, logWeight?,
//                  duration?, equipment[], contraindications[], difficultyLevel }

// ── EXERCISE_POOL — REMOVED 11 Aug 2026 (CON-6) ───────────────────────────────
//
// This file used to carry its own hardcoded pool of 70 exercises. It is gone.
// _filterCandidates() now selects from the shared database in
// js/data/exercises/ via session-categories.js.
//
// Why it had to go, recorded so it does not come back:
//
//   * 61 of the 70 entries were still in the retired description/cues shape
//     and rendered as a name and a set count and nothing else, while the
//     shared database carried instructions, why and coaching at 100%.
//   * 139 practice entries and the entire yoga library were unreachable
//     from the session builder for as long as this pool existed.
//   * Three separate fixes had to be applied twice because of it -- the
//     difficulty ceiling (PT-11), the equipment vocabulary (CON-2) and the
//     cardio-warmup tags (PT-19) -- and each second application was found
//     only after somebody hit the bug in the live product.
//
// The four machine warm-ups this pool held and the database did not
// (stationary bike, treadmill, cross trainer, rower) were ported into
// js/data/exercises/cardio.js v2 first, at the full Exercise Entry Standard.
// Nothing was deleted before it existed somewhere better.

// ── Time-based exercise counts ────────────────────────────────────────────────

const EXERCISE_COUNT = {
  15: { warmup: 2, main: 3,   cooldown: 1 },
  30: { warmup: 3, main: 5,   cooldown: 2 },
  45: { warmup: 4, main: 7,   cooldown: 2 },
  60: { warmup: 5, main: 9,   cooldown: 3 }
};

// ── Coach line templates ───────────────────────────────────────────────────────

/**
 * COACH LINE POOLS — VOICE-2, 13 Aug 2026.
 *
 * Every line written and approved by Graeme (see
 * alongside_coach_voice_drafts_13aug2026_v1.md). Do not paraphrase or
 * "improve" these: the voice is the product, and a build session
 * rewriting them loses the only thing that cannot be rebuilt.
 *
 * WHY POOLS. Until today this was ONE fixed string per session type,
 * varying only by the duration number. Free is locked to Full Body at
 * 30 minutes, so persona 2.12 read a byte-identical sentence at the top
 * of every session he ever did -- seven times across the three weeks
 * traced on 13 Aug, and indefinitely thereafter. For a product whose
 * whole differentiator is the coach, the person with the least to
 * personalise against got the least varied coach.
 *
 * ROTATION, NOT RANDOM. Indexed on the person's completed-session count,
 * so consecutive sessions cannot repeat a line and the whole pool is
 * reached in order. Math.random() cannot promise either -- it will
 * happily hand the same line twice running, which is the exact
 * complaint this fixes. Same reasoning as empathy-transfer.js, and its
 * comments are worth reading before touching this: a stable sort on
 * score alone always returns the lowest index, and a pool that is never
 * reached is worse than the repetition it replaced.
 */
const COACH_LINES = {
  full: [
    d => `Full body in ${d} minutes. I've kept the session broad — every major pattern gets a turn. It's more efficient than it looks.`,
    d => `${d} minutes, all of you. Nothing gets a whole session to itself today, which means nothing gets skipped either.`,
    d => `A bit of everything, in ${d} minutes. Push, pull, squat, hinge, brace. That's most of what a body does.`,
    d => `Full body today. ${d} minutes is enough to touch every pattern once, properly, without rushing any of them.`,
    d => `${d} minutes across the whole body. The order matters more than it looks — bigger movements first, while you've got the most to give them.`,
    d => `Everything gets a look-in today. ${d} minutes, spread evenly, nothing left waiting until next time.`,
    d => `Full body, ${d} minutes. This is the session that works when you don't know what you need — it covers the ground either way.`,
    d => `${d} minutes. One session, all the main patterns. Not the most specialised way to train, and by some distance the most reliable.`
  ],
  lower: [
    d => `${d} minutes of lower body. Squat, hinge, single-leg — each pattern trains something the others don't. Do them in the order shown.`,
    d => `Legs today, ${d} minutes. Heaviest work first while your legs are still honest about what they can do.`,
    d => `${d} minutes below the waist. Two legs, then one leg — the second is where most people find out something.`,
    d => `Lower body. ${d} minutes. Squat and hinge are different jobs and both need doing; that's why they're both here.`,
    d => `${d} minutes of legs. Take the rest between sets seriously — this is the session where cutting it short costs you the most.`,
    d => `Legs, ${d} minutes. Everything here has to hold you up eventually. Might as well train it that way.`,
    d => `${d} minutes. Big movements first, single-leg after, calves last — that order isn't arbitrary.`,
    d => `Lower body today. ${d} minutes. Get the first movement right and the rest of the session tends to follow.`
  ],
  upper: [
    d => `Upper body today. ${d} minutes of push and pull, balanced across all the major patterns. Your shoulder blades do more work than you think.`,
    d => `${d} minutes up top. Push and pull in roughly equal measure — most people's shoulders prefer it that way.`,
    d => `Upper body, ${d} minutes. Pull first if your posture's had a long week. It usually has.`,
    d => `${d} minutes. Chest, back, shoulders, arms — in that rough order, because the small stuff can wait until the big stuff is done.`,
    d => `Upper body today. ${d} minutes. Control the way down as much as the way up; that half is where most of the work hides.`,
    d => `${d} minutes of pushing and pulling. Your back does the quiet half of this. Give it the same attention.`,
    d => `Upper body, ${d} minutes. Nothing here needs to be heavy to be useful.`,
    d => `${d} minutes. Push, pull, repeat. It's a simple session and it doesn't need to be more than that.`
  ],
  core: [
    d => `Core session — ${d} minutes of real anti-movement work. The core's job is to resist, not just crunch. This session reflects that.`,
    d => `${d} minutes of core. Mostly holding still under load, which is harder and more useful than it sounds.`,
    d => `Core today, ${d} minutes. Your midsection's actual job is stopping things moving. That's what's in here.`,
    d => `${d} minutes. Bracing, anti-rotation, anti-extension. Less glamorous than sit-ups and considerably more transferable.`,
    d => `Core, ${d} minutes. Breathe through the holds — the temptation is to hold your breath, and that's the bit to resist.`,
    d => `${d} minutes of core work. If your lower back is talking during these, come out of the position rather than pushing through it.`,
    d => `Core today. ${d} minutes. Quality over duration here — a shaky ten seconds beats a sloppy minute.`,
    d => `${d} minutes. This is the part of you that everything else borrows from.`
  ],
  cardio: [
    d => `${d} minutes of conditioning work. Keep your effort honest — this should feel like sustained work, not sprinting followed by rest.`,
    d => `${d} minutes of conditioning. Find a pace you could hold a broken conversation at, and stay there.`,
    d => `Conditioning today, ${d} minutes. The aim is steady, not spectacular.`,
    d => `${d} minutes. Your breathing is the gauge — working hard, still in control.`,
    d => `Conditioning, ${d} minutes. Starting too fast is the most common way to make this harder than it needs to be.`,
    d => `${d} minutes of steady work. Easier to hold than it is to start.`,
    d => `Conditioning today. ${d} minutes. This is the session that makes everything else feel less like an event.`,
    d => `${d} minutes. Nothing clever here. Just sustained, repeatable effort.`
  ],
  mobility: [
    d => `${d} minutes of mobility. Active range of motion — not passive stretching. Move slowly into restriction and breathe through it.`,
    d => `${d} minutes of mobility. Slow is the point. Rushing this turns it into something else entirely.`,
    d => `Mobility today, ${d} minutes. Looking for range you can control, not range you can reach.`,
    d => `${d} minutes. Move to the edge of the restriction and breathe there. The breathing is doing more than it looks.`,
    d => `Mobility, ${d} minutes. This is the session that pays for the others.`,
    d => `${d} minutes. Nothing here should hurt. Uncomfortable is fine; sharp is not.`,
    d => `Mobility today. ${d} minutes. Your joints will tell you where they want attention if you go slowly enough to hear it.`,
    d => `${d} minutes of range work. Small, controlled, repeated. That's the whole method.`
  ],
  glute: [
    d => `I've built this around ${d} minutes of glute-focused work. Everything here loads the posterior chain progressively — warmup first, then the movements that matter.`,
    d => `${d} minutes of glute work. Hinging, bridging, stepping — three different ways of asking the same muscles the same question.`,
    d => `Glutes today, ${d} minutes. Slow down the top of each rep; that's where the work actually lands.`,
    d => `${d} minutes on the posterior chain. Most people's is underworked. This is the correction.`,
    d => `Glute focus, ${d} minutes. If you feel this mostly in your lower back, shorten the range rather than pushing on.`,
    d => `${d} minutes. Bridges and hinges first, single-leg after — the order stacks the fatigue where it's useful.`,
    d => `Glutes today. ${d} minutes. These are the muscles that make walking upstairs unremarkable.`,
    d => `${d} minutes of glute work. Squeeze at the top, and mean it.`
  ]
};

/**
 * Rotation index. Completed sessions, not activityLog.length: partials
 * must not advance the rotation, for the same reason they do not count
 * anywhere else a person can see (COUNT-1).
 */
function _rotationIndex() {
  try {
    return store.completedSessions(store.get("activityLog") || []).length;
  } catch { return 0; }
}

function generateCoachLine(sessionType, durationMins, conditions, equipment, conditionNote) {
  const type = SESSION_TYPES.find(t => t.id === sessionType);

  const pool = COACH_LINES[sessionType];
  const line0 = pool && pool.length
    ? pool[_rotationIndex() % pool.length](durationMins)
    : `${durationMins}-minute ${type?.label || ""} session, built for you today.`;
  let line = line0;

  if (conditionNote) {
    line += " " + conditionNote;
  }

  return line;
}

// ── Condition filtering ────────────────────────────────────────────────────────

function buildActiveConditionSet() {
  const conditions  = store.get("conditions")          || [];
  const painScores  = store.get("conditionPainScores") || {};
  const active      = new Set();

  conditions.forEach(id => {
    active.add(id);
    const pain = painScores[id] || 0;
    if (pain >= 7)      active.add(`${id}-acute`);
    else if (pain >= 4) active.add(`${id}-subacute`);
  });

  return active;
}

/**
 * PULSE-RAISER RULE (11 Aug 2026, PT-19)
 *
 * Every session opens with something that raises the heart rate, unless
 * there is a specific, nameable reason it should not.
 *
 * This inverts how warm-ups were selected until now. Previously
 * "cardio-warmup" was one category among several in an ordered list, and
 * the selection loop filled its slots in order and stopped. On Full Body it
 * was listed fourth of four with three slots available, so the loop broke
 * before ever reaching it. Traced live on 11 Aug: no generated session
 * contained a pulse-raiser, at home OR in a gym with a treadmill and a bike
 * ticked. Two separate causes compounded it -- all four cardio-warmup
 * entries required a machine, and two of the four carried equipment tags
 * ("bike", "cross-trainer") that do not exist in equipment.js's vocabulary,
 * so they could never match even in a gym.
 *
 * The default is now on. Exclusion requires a reason, and the reason is
 * spoken rather than silently applied -- Locked Principle P1: the coach
 * never withholds what it can see. Someone who notices the warm-up looks
 * different today should be told why, not left to wonder.
 *
 * Exclusions, each deliberate:
 *
 *   Cardio sessions   -- the whole session is a pulse-raiser. Reserving a
 *                        slot for one inside it is redundant.
 *   Mobility sessions -- these open with breathing by design. Range of
 *                        motion work does not need an elevated heart rate,
 *                        and forcing one changes what the session is.
 *   Unwell            -- self-reported. Someone who has said they are
 *                        unwell should not be met with a heart-rate raiser.
 *   Acute pain (>=7)  -- consistent with the existing severe zone override.
 *
 * Note what is NOT an exclusion: having no equipment. That was the original
 * cause of the gap and it is a content problem, not a rule. Five bodyweight
 * pulse-raisers were authored alongside this, tiered by difficultyLevel so
 * the option scales with the person rather than being one intensity.
 *
 * @param {string} sessionType
 * @returns {{ include: boolean, reason: string|null }}
 *   reason is coach-voice text for the session's opening line, or null when
 *   included. Never a bare flag -- an exclusion the person cannot see the
 *   reason for is exactly what this rule exists to prevent.
 */
export function pulseRaiserDecision(sessionType) {
  if (sessionType === "cardio") {
    return { include: false, reason: null };   // the session is the warm-up
  }
  if (sessionType === "mobility") {
    return { include: false, reason: null };   // opens with breathing by design
  }

  const lastCheckin = store.get("lastCheckin") || {};
  if (lastCheckin.unwell === true) {
    return {
      include: false,
      reason: "You told me you are not feeling well, so I have left the heart-rate raiser out of the warm-up today. Move gently and stop whenever you need to."
    };
  }

  const conditions = store.get("conditions")          || [];
  const painScores = store.get("conditionPainScores") || {};
  const acute = conditions.filter(id => (painScores[id] || 0) >= 7);
  if (acute.length > 0) {
    return {
      include: false,
      reason: "With the pain you have flagged today I have started you gently rather than raising your heart rate first. Take the warm-up slowly."
    };
  }

  return { include: true, reason: null };
}

function buildConditionNote(sessionType) {
  const conditions = store.get("conditions")          || [];
  const painScores = store.get("conditionPainScores") || {};

  const relevant = conditions.filter(id => {
    const pain = painScores[id] || 0;
    return pain >= 4;
  });

  if (relevant.length === 0) return null;

  const note = relevant
    .map(id => {
      const pain = painScores[id] || 0;
      if (id.includes("lower-back")) {
        return pain >= 7
          ? "Your lower back is significant today — I've removed everything that loads the spine under flexion."
          : "Your lower back is present — I've kept loading conservative.";
      }
      if (id.includes("knee")) {
        return "With your knee, I've avoided deep single-leg loading. Listen to any sharp signals.";
      }
      if (id.includes("shoulder")) {
        return "Your shoulder is considered — I've reduced overhead and heavy pressing.";
      }
      if (id.includes("hamstring")) {
        return "With your hamstring, I've kept hip extension loading controlled.";
      }
      return null;
    })
    .filter(Boolean)
    .join(" ");

  return note || null;
}

// ── Candidate filtering (05 Aug 2026) ─────────────────────────────────────────
// Extracted from what was previously selectFromCategories()'s inline logic so
// buildCandidatePools() can reuse the exact same equipment/contraindication
// rules without duplicating them -- one filter, two callers.
/**
 * 11 Aug 2026 (PT-11, second persona trace) — difficulty ceiling.
 *
 * Found by re-tracing both personas against the shipped WOW-2 fix: this
 * file has its own EXERCISE_POOL of 65, entirely separate from the
 * 461-exercise database, and it never filtered on fitness at all. So the
 * WOW-2 fix reached coach-proposal sessions (workoutGenerator.js) but NOT
 * the "Cardio, Core & Strength" Home door, which routes here. A sedentary
 * beginner and a gym-literate lifter were handed the identical pool.
 *
 * difficultyLevel (1-3) was already written on all 65 exercises and read
 * nowhere — the same written-never-read pattern as exerciseFeedback and
 * absence.capturedAt. Using the field that already exists rather than
 * adding another.
 *
 * Ceilings mirror filterByFitnessLevel()'s intent on the main database,
 * compressed to this pool's 1-3 scale. "returning" sits below moderate for
 * the same reason it does there: capacity is there, but day one should not
 * meet someone at their old level.
 *
 * NOT a pool merge. That is a real architectural job (this is the fourth
 * parallel exercise pool in the codebase) and is logged, not attempted
 * here — touch-once.
 */
// Raised 11 Aug 2026, persona trace 2.15 (fit mid-20s, gym 4x/week,
// wants numbers to move). The old ceilings topped out at 3 on a 1-10
// scale, so the hardest exercise she could be served in eight weeks was
// a 3 -- and fourteen exercises were unreachable by ANY user, including
// treadmill intervals, sled push, renegade rows, ab wheel rollouts and
// the weighted core work written for exactly her. Same class of defect
// as the equipment vocabulary bug: content existing that nothing could
// ever select.
//
// The lower bands are unchanged in spirit but given room now that all
// 497 entries carry a real difficultyLevel (the 30 untagged yoga entries
// were tagged the same day). Sedentary at 2 still excludes everything
// demanding while allowing gentle floor and standing work.
const DIFFICULTY_CEILINGS = {
  "sedentary":   2,
  "light":       3,
  "returning":   3,
  "moderate":    4,
  "active":      6,
  "very-active": 8
};

function _difficultyCeiling() {
  // CAP-1: the capability screen can only ever LOWER the ceiling. It
  // protects, it does not promote -- somebody answering well does not
  // get handed harder work than their declared activity supports.
  const capProfile = store.capabilityProfile();
  const declared = store.get("fitnessLevel")
                || store.get("lifestyle.activityLevel")
                || "moderate";
  const base = DIFFICULTY_CEILINGS[declared] ?? DIFFICULTY_CEILINGS["moderate"];
  return capProfile.ceilingCap !== null
    ? Math.min(base, capProfile.ceilingCap)
    : base;
}

  // ── TRAINING INTENT (CAP-3) ───────────────────────────────────────────
//
// "maintain" is not a diluted "improve". What is lost first is specific
// and known, so maintenance PRIORITISES those capacities rather than
// doing less of everything:
//
//   power         goes before strength -- fast matters more than heavy
//   balance       goes early, and is the fall risk
//   grip          predicts independence better than almost anything
//   floor transfer decides whether somebody keeps living in their
//                 own home
//
// Prioritised, never exclusive: a maintenance session still contains
// ordinary strength and mobility work. This tilts selection, it does
// not replace the session.
//
// "recover" leans on the rehabilitation library and the phase system
// that already exists in conditionProgrammes.js.

const MAINTAIN_PRIORITY = /carry|grip|hold|balance|single-leg|sit-to-stand|chair|step-up|get ?up|floor|calf raise|power|throw|slam|reach/i;
const RECOVER_PRIORITY  = /rehab|progression|activation|isometric|controlled|range/i;

function intentPriority(ex) {
  const trainingIntent = store.get("trainingIntent") || "improve";
  const s = ex.name + " " + (ex.id || "");
  if (trainingIntent === "maintain") {
    return MAINTAIN_PRIORITY.test(s) ||
           ex.movementPattern === "carry" ||
           ex.movementPattern === "balance" ||
           ex.movementPattern === "proprioception";
  }
  if (trainingIntent === "recover") {
    return RECOVER_PRIORITY.test(s) || ex.category === "rehabilitation";
  }
  return false;
}


// ── C4 (12 Aug 2026, third-pass gate) ───────────────────────────────────────
// EXERCISE_COUNT allocates a fixed count per duration (60 min -> 5 warmup,
// 9 main, 3 cooldown = 17). Count is a proxy for time, and it stops holding
// once entries vary from 1 to 9 minutes each: the gate found a 60-minute
// request producing 104 minutes of work, and a 30-minute request producing
// over 60.
//
// C3 fixed the arithmetic (a 20-minute run was being counted as 60). This is
// the separate fault C3 exposed: the estimate was right and the SESSION was
// too long. Correctly labelling a 100-minute session as 100 minutes is not a
// fix when the person asked for 60.
//
// Trims from the MAIN section only, longest first, never below three main
// exercises, and never touches warmup or cooldown — the warmup floor is a
// safety rule, not a suggestion. Tolerance is 15%: a session should feel
// like the time asked for, not be padded or clipped to the minute.
function _exerciseMins(ex) {
  return ex.duration
    ? (ex.duration * (ex.sets || 1) / 60)
    : ((ex.sets || 3) * 1.5);
}

function _trimToDuration(warmup, prescribed, main, cooldown, targetMins) {
  const MIN_MAIN  = 3;
  const TOLERANCE = 1.15;
  // `prescribed` is COUNTED but never trimmed — see the call site note.
  const total = () => [...warmup, ...prescribed, ...main, ...cooldown]
    .reduce((a, e) => a + _exerciseMins(e), 0);

  const trimmed = [...main];
  while (total() > targetMins * TOLERANCE && trimmed.length > MIN_MAIN) {
    let worstIdx = 0;
    for (let i = 1; i < trimmed.length; i++) {
      if (_exerciseMins(trimmed[i]) > _exerciseMins(trimmed[worstIdx])) worstIdx = i;
    }
    trimmed.splice(worstIdx, 1);
    main.length = 0;
    main.push(...trimmed);
  }
  return main;
}

// FIX-1 (C4-1), 13 Aug 2026. Yoga and Pilates movements are marked in
// the database by movementPattern and nothing had ever read it. Persona
// 2.15 -- barbell, rack, four gym sessions a week -- was served Tree
// Pose and Half Moon Pose in Lower Body, and Tree Pose again in Core.
// They match `balance-work` legitimately; the question nobody asked was
// whether a yoga pose belongs in a barbell session.
//
// Module scope because the reserved cardio-warmup slot needs them as
// well as pickFrom, and those run in that order.
const CROSS_DISCIPLINE  = new Set(["yoga-pose", "pilates-move"]);
const GYM_SESSION_TYPES = new Set(["lower", "upper", "full", "core", "glute"]);

// FIX-5, 13 Aug 2026. Sport-conditioning content -- sled sprints,
// agility ladders, reactive change of direction -- is tagged
// discipline: 'sport' and joins the same de-prioritisation. It reached
// persona 2.15's gym Lower Body session as category 'cardio',
// movementPattern 'locomotion', which is a correct description of a
// sled sprint and no help at all in deciding whether it belongs.
//
// One helper rather than two checks at four call sites: the pulse slot
// and pickFrom must agree, and two lists that must agree is how they
// stop agreeing.
function _offDisciplineForGym(ex) {
  return CROSS_DISCIPLINE.has(ex.movementPattern) || ex.discipline === "sport";
}

/**
 * CAP-6 (C3), 13 Aug 2026. One definition, used by both _filterCandidates
 * and pickFrom. See js/data/exercises/seated.js's header for the full
 * reasoning and the traced evidence.
 */
function _capabilityUnrestricted() {
  const cap = store.capabilityProfile();
  // CAP-6b, 13 Aug 2026. impactSafe REMOVED from this test.
  //
  // Found by tracing persona 2.12: a 33-year-old desk worker, fully
  // capable, who answered "no" to whether both feet leave the ground.
  // That is a statement about IMPACT, not about needing a chair -- and
  // it made capabilityUnrestricted false, so adapted content stayed at
  // full weight and he received fourteen seated or supported items
  // across nine sessions.
  //
  // The two are separate axes and I conflated them when writing this.
  // Impact is already handled properly and separately by the impact
  // gate in _filterCandidates(), which removes jumping outright.
  // Somebody who cannot jump can still stand, hinge, press and pull.
  //
  // The remaining four are the right test: they are all statements
  // about whether the person needs the floor, a chair, or support.
  return cap.asked &&
         !cap.needsSeated &&
         cap.legsLoadable &&
         store.get("capability.floorAccess")  === "yes" &&
         store.get("capability.balanceWorry") === "no";
}

/**
 * How hard is this exercise?
 *
 * PROG-1, 15 Aug 2026: lifted to module scope. It was defined inside
 * _filterCandidates(), so selectFromCategories() could not see it — and
 * a first version of the phase logic below called it from there, threw a
 * ReferenceError, and the throw was SWALLOWED somewhere upstream. The
 * session still generated from a fallback, and a 50-session measurement
 * returned entirely plausible numbers from broken code.
 *
 * Two things follow. One definition, so the two call sites cannot
 * disagree about what "hard" means. And logged separately: a throw
 * inside session generation should not be able to look like a working
 * session.
 *
 * Falls back to energyRequired because it is present on every entry and
 * correlates well; 10 for the unrated, which fails safe by excluding.
 */
function _difficulty(ex) {
  if (typeof ex.difficultyLevel === "number") return ex.difficultyLevel;
  if (typeof ex.energyRequired === "number")  return ex.energyRequired;
  return 10;
}

function _filterCandidates(categories, section, equipSet, conditionSet) {
  const ceiling = _difficultyCeiling();
  const prefs   = store.get("exercisePreferences") || {};

  // CON-6: candidates now come from the shared 461-entry database, not from
  // this file's own EXERCISE_POOL. Section comes from which SESSION_TYPES
  // list the category appeared in, rather than being stored per entry --
  // section was never really a property of an exercise, and storing it was
  // why the pool had to duplicate hip-mobility drills to use them in two
  // places.
  const matched = [];
  const seen = new Set();
  for (const category of categories) {
    for (const ex of matchCategory(EXERCISES, category, section)) {
      if (seen.has(ex.id)) continue;
      seen.add(ex.id);
      // Tag the entry with the category and section it was selected FOR, so
      // the selection loops below can still reason about variety across
      // categories. Non-destructive -- the database entry is not mutated.
      // C2, 13 Aug 2026. `category` here is the SESSION category the
      // exercise was selected for ("squat-pattern"), and it overwrites
      // the entry's own library category ("rehabilitation"). That
      // overwrite is deliberate and load-bearing for variety, but it
      // means any later filter reading ex.category sees the wrong thing
      // -- the first C2 filter was written that way, ran on every
      // candidate, and excluded nothing at all while reading as correct.
      //
      // sourceLibrary preserves the original. Named for what it is
      // rather than "originalCategory", so nobody assumes it is
      // interchangeable with the reassigned field.
      matched.push({ ...ex, sourceLibrary: ex.category, category, section });
    }
  }

  // PERSONA TRACE FINDING (11 Aug 2026, persona 2.10 -- Dad, 76, frail,
  // sedentary). The difficulty ceiling used to apply to "main" only, and
  // warmups were exempt on the reasoning that they are structurally gentle
  // and that capping them could empty the section and break the warmup
  // safety floor.
  //
  // That reasoning held while warmups came from a curated 70-entry pool
  // where every warmup had been hand-written as a warmup. It stopped
  // holding at CON-6, when warmups began coming from all 497 shared
  // exercises. Traced live: a sedentary 76-year-old was served "High
  // Knees" as his opening pulse-raiser -- inside session-categories.js's
  // absolute warmup ceiling (difficulty 4, energy 5), but nowhere near
  // appropriate for him, because that ceiling is fixed rather than
  // relative to the person.
  //
  // The ceiling now applies to warmups too, and the floor is protected by
  // relaxing rather than by exempting: if applying it would leave nothing,
  // the unfiltered set is used, so the warmup safety floor cannot be
  // starved. Cooldowns stay exempt -- they are genuinely low-demand by
  // construction and a stretch has no meaningful difficulty ceiling.
  // PERSONA TRACE FINDING (11 Aug 2026, persona 2.11 -- Mum, 76,
  // mindfulness-led, low confidence). She was served Warrior III, a
  // demanding single-leg balance pose and a genuine fall risk for her.
  //
  // Root cause: 30 entries carry no difficultyLevel at all, and every
  // read in the codebase is `(ex.difficultyLevel || 1)` -- so an
  // untagged exercise is treated as the EASIEST possible. That default
  // is backwards for safety: an unknown difficulty should be assumed
  // demanding until somebody says otherwise, not assumed trivial.
  //
  // _difficulty() inverts it, falling back to energyRequired when
  // difficultyLevel is absent, since energy is present on all 497 and
  // correlates well. Warrior III (energy 6) now reads as difficulty 6
  // rather than 1 and is correctly out of reach for a sedentary user.
  //
  // The 30 untagged entries should still be tagged properly -- this is
  // a safe default, not a substitute for the data.
  // ── IMPACT GATE (11 Aug 2026) ─────────────────────────────────────────
  //
  // Graeme's question: should some exercises be naturally avoided for
  // certain age groups -- his 76-year-old parents are unlikely to do
  // burpees or star jumps.
  //
  // Age is the wrong variable and a worse one. There are 76-year-olds who
  // do burpees and 35-year-olds who cannot squat, so filtering on birth
  // year is wrong in both directions -- and "we have decided what you can
  // do because of your age" is precisely the shame architecture this
  // product refuses. Capability is both more accurate and more dignified.
  //
  // But he was right that something was missing, and raising the
  // difficulty ceilings proved it: at ceiling 2, a frail sedentary
  // 76-year-old was served Lateral Hops and Wall Drive sprint mechanics,
  // and a blank-slate beginner was served Explosive Press-Ups. Twenty-six
  // of the twenty-seven impact-class exercises in the database are tagged
  // difficulty 3 or lower.
  //
  // That is not mis-tagging. For a conditioned person a jump squat IS
  // easy. Difficulty and impact are different axes: the risk in a
  // plyometric is not that it is hard, it is landing force and fall risk,
  // and neither scales with how hard the movement feels.
  //
  // So impact is gated separately from difficulty. Anyone who has told us
  // they are sedentary, lightly active, or returning after a break does
  // not get jumping, bounding, sprinting or landing work -- not because
  // of their age, but because impact loading is the one thing that should
  // be earned rather than defaulted into.
  
  const LOW_IMPACT_ONLY = new Set(["sedentary", "light", "returning"]);
  // Unknown counts as gated, matching the same safe-default reasoning
  // applied to untagged difficulty: someone who has told us nothing has
  // not told us they can absorb landing forces. Persona 2.12 (blank
  // slate, sedentary desk job, nothing to personalise against) was
  // served a Jump Squat in her very first session on the old default.
  const declaredLevel = store.get("fitnessLevel")
                     || store.get("lifestyle.activityLevel")
                     || null;

  // CAP-1. The capability screen measures what a person CAN do; the
  // activity level measures how often they move. They answer different
  // questions and the first one wins where they disagree, because
  // frequency is a poor proxy for capacity -- somebody can garden daily
  // and still not get off the floor unaided.
  const cap = store.capabilityProfile();

  // CAP-6 (C3). See _capabilityUnrestricted() at module scope -- one
  // definition, because _filterCandidates and pickFrom are separate
  // scopes and two copies of a capability rule is how they drift.
  // Kept as a named call rather than inlined so the reasoning below
  // stays attached to it.
  //
  // "Unrestricted" means the person was ASKED and cleared
  // every axis. Deliberately conservative on each count:
  //
  //   asked        -- silence is never read as capability. Somebody who
  //                   never saw the screen keeps the adapted pool at
  //                   full weight, same fail-safe direction as every
  //                   other gate in this file.
  //   impactSafe   -- bothFeet === 'yes' specifically, not merely "not no"
  //   floorSafe    -- note this is true when floorAccess is NULL, so it
  //                   is tested against 'yes' directly here rather than
  //                   trusting the profile's permissive default
  //   balanceSafe  -- same reasoning as floorSafe
  //   legsLoadable -- the axis CAP-5 added; full leg power, not partial
  //
  // Any one of these unmet and the person keeps adapted content weighted
  // normally. The cost of being wrong in that direction is somebody
  // capable seeing a seated warm-up; the cost the other way is somebody
  // who needs it not being offered it. Those are not symmetrical.
  const capabilityUnrestricted = _capabilityUnrestricted();

  const impactGated =
    (cap.asked && !cap.impactSafe) ||
    (!cap.asked && (declaredLevel === null || LOW_IMPACT_ONLY.has(declaredLevel)));

  // Floor access. Without it every supine, prone and kneeling movement
  // is not merely hard but unusable, and being handed them repeatedly is
  // how somebody decides the app is not for them.
  // CAP-2 RESOLVED (11 Aug 2026). These gates read real tags now.
  //
  // They used to match on exercise NAMES, because the database carried
  // no position, impact or balance data and movementPattern could not
  // stand in -- Depth Jump is tagged "squat" and "locomotion" covers
  // both a treadmill walk and carioca. Name matching missed things, and
  // it was verified missing them: a wheelchair user who answered "no"
  // to the chair question was still served McGill Curl-Ups, and a man
  // who cannot jump was still served Drop Steps.
  //
  // All 497 entries now carry position ('floor' | 'standing' | 'seated'
  // | 'any'), impact (boolean) and balanceDemand (boolean). Same lesson
  // as the 30 untagged difficulties: a derived fallback buys time and
  // the data is what actually solves it.
  //
  // 'any' means the exercise imposes no position requirement -- most
  // breathing and meditation practice, and the recovery protocols. It
  // passes every position gate deliberately, because there is nothing
  // to gate.
  const isFloor   = ex => ex.position === "floor";
  // Any exercise whose named effect is in the legs. 'limited' leg power
  // still allows unloaded movement -- ankle circles, gentle range work --
  // because keeping what function exists is worth more than protecting it
  // into disuse. Only loaded leg work is withheld.
  const LEG_AREAS = ["quadriceps", "hamstring", "calves", "glutes",
                     "ankle-foot", "knee", "hip", "adductors", "hip-flexor"];
  const _needsLegs = ex => {
    const areas = ex.affectsAreas || [];
    return LEG_AREAS.some(a => areas.includes(a)) &&
           !areas.includes("full-body");
  };
  // C1 (12 Aug 2026, third-pass gate). This previously proxied "loads the
  // legs" as "has equipment OR is difficulty 3+". The gate caught it:
  // Seated Leg Extension is bodyweight and low-difficulty, so it passed —
  // and it is the exact exercise the CAP-5 note exists to prevent. Loading
  // the quadriceps IS that movement; the proxy measured the wrong thing.
  //
  // A leg pattern is now leg-loading on its own account. Unloaded range
  // work — ankle circles, gentle mobility — still passes, which is the
  // stated intent above: keeping what function exists is worth more than
  // protecting it into disuse.
  const LEG_PATTERNS = ["squat", "hinge", "lunge", "locomotion", "step"];
  /**
   * CARDIAC-1. Is this person waiting on a professional's yes?
   * 'not-sure' is treated as 'not-yet' -- the coach says so out loud in
   * generateClearanceAck(), so this is not a hidden decision.
   */
  const _needsClearance = () => {
    const c = store.get("exerciseClearance");
    return c === "not-yet" || c === "not-sure";
  };

  /**
   * CARDIAC-1. Loaded strength work: external resistance, or a strength
   * movement heavy enough to drive a large blood-pressure response.
   *
   * Bodyweight mobility, seated work and walking are deliberately NOT
   * caught. The line is external load and maximal effort, not "strength".
   */
  const _isLoadedStrength = ex => {
    const equip = ex.equipment || [];
    const LOADED = /barbell|dumbbell|kettlebell|weight|machine|cable|smith|leg-press|plate/i;
    if (equip.some(e => LOADED.test(String(e)))) return true;
    if (ex.category === "strength" && (ex.difficultyLevel ?? 0) >= 4) return true;
    return false;
  };

  const _loadsLegs = ex =>
    _needsLegs(ex) && (
      LEG_PATTERNS.includes(ex.movementPattern) ||
      (ex.equipment || []).length > 0 ||
      (ex.difficultyLevel || 1) >= 3
    );

  const isBalance = ex => ex.balanceDemand === true;
  const isImpact = ex => ex.impact === true;

  const withinCeiling = ex => _difficulty(ex) <= ceiling;
  const warmupPool = section === "warmup" ? matched.filter(withinCeiling) : null;
  const useCeilingOnWarmup = warmupPool !== null && warmupPool.length > 0;

  // ── W2-1 (14 Aug 2026, persona trace Wave 2) ──────────────────────────
  //
  // Cooldown was exempt from the ceiling on the reasoning that "a stretch
  // has no meaningful difficulty ceiling." True while cooldowns came from
  // a curated stretch pool. It stopped being true at CON-6, when every
  // section began drawing from the shared database.
  //
  // Traced live: a sedentary user (ceiling 2) was offered Tree Pose,
  // Chair Pose, Half Moon, Boat Pose and WARRIOR III in cooldown -- the
  // same pose, and the same fall risk, that caused the ceiling to be
  // extended to warmup for persona 2.11 on 11 Aug. That fix closed main
  // and warmup and left the third door open. Reproduced on HEAD f107cfc.
  //
  // Third instance of one pattern: a filter correct against a curated
  // pool, left in place after the pool became the whole database.
  //
  // Protected by relaxing rather than exempting, exactly as warmup is.
  const cooldownPool = section === "cooldown" ? matched.filter(withinCeiling) : null;
  const useCeilingOnCooldown = cooldownPool !== null && cooldownPool.length > 0;

  return matched.filter(ex => {
    // ── C2, 13 Aug 2026 ──────────────────────────────────────────────
    // The rehabilitation library is not general content and was never
    // meant to be. Nothing here read `category`, so every rehab entry
    // tagged movementPattern 'squat' was a valid squat candidate for
    // anybody: 30 of 186 Full Body main candidates (16%) and 31 of 108
    // warm-up candidates (29%). Persona 2.12 -- 33, desk job, no injury,
    // male -- was served "Squat with Pelvic Floor Awareness" four times
    // in seven sessions, and read coaching copy telling him to check
    // with whoever was treating him. Nobody was treating him.
    //
    // A blanket exclusion would over-correct: clamshells, glute bridges,
    // dead bugs, doorway chest stretches and calf stretches all live in
    // this file and are ordinary training. So all 94 were triaged
    // individually and 61 carry generalPurpose: true (approved by
    // Graeme, 13 Aug 2026 -- see alongside_c2_triage_13aug2026_v1.md).
    //
    // ABSENT MEANS FALSE, deliberately. A new rehabilitation entry stays
    // condition-only until somebody decides otherwise, which is the
    // right direction to be wrong in.
    //
    // Condition-specific work is NOT lost by this: it is delivered
    // through conditionProgrammes.js, which selects on the declared
    // condition and its phase. This filter governs the GENERAL session
    // pool only.
    if (ex.sourceLibrary === "rehabilitation" && ex.generalPurpose !== true) return false;

    // EXERCISE PREFERENCES (11 Aug 2026). conditionProgrammes.js has
    // honoured these since 04 Aug; this file never has, so telling the
    // coach you were not a fan of something changed your prescribed
    // programme and did nothing at all to your generated sessions.
    // Same two-places-to-fix pattern the private pool caused.
    //
    // 'avoid' removes the exercise. 'less' leaves it in the pool and is
    // handled as a de-prioritisation at selection, not a removal --
    // "not a fan" is not "never again", and treating it as such would
    // quietly shrink somebody's world every time they were honest.
    // ── C2 (12 Aug 2026, third-pass persona trace) ────────────────────────
    // A practice IS a session, not one of N components inside another one.
    // Traced: a single 60-minute cardio build returned C25K Week 1 AND
    // Week 2 AND a 20-minute easy run — two different weeks of the same
    // couch-to-5K programme, stacked, plus a separate run.
    //
    // 140 of 556 entries carry contentType 'practice' — complete standalone
    // sessions (C25K weeks, 20-minute rows, 30-minute yin yoga sequences,
    // 5-minute breathing practices). Nothing in this file had ever read
    // contentType. Tenth instance of the written-never-read pattern, and the
    // second one CON-6 did not close: moving to the shared database brought
    // the practices in with everything else.
    //
    // These are not lost — practices are the natural content for "Coach
    // decides", the Library and Mobility & Conditioning, where a person
    // picks one whole thing. Confirming those routes reach them is logged.
    //
    // KNOWN, DELIBERATELY NOT FIXED HERE: roughly ten entries are genuinely
    // components mis-tagged as practices (Corpse Pose/Savasana, General
    // Pre-Sport Warm-Up, Post-Run Cool-Down). Excluding them is correct for
    // this mixed builder — a 15-minute warm-up routine is not one of five
    // warmup items — but re-tagging is exercise-data work. Touch-once.
    // DATA-1 / DATA-1b, 12 Aug 2026. Whole sessions are not components.
    //
    // The original rule was `contentType === "practice"` alone, and it
    // FAILED OPEN: 158 of 526 entries carry no contentType at all, so a
    // missing value passed. 28 of those are 10-30 minute pieces of whole
    // content -- Brisk Walk (30 min), Steady Cycling (30), HIIT 30:30
    // (15), swim drill sets -- every one eligible to be picked as ONE OF
    // FIVE components. Eleven more are tagged 'exercise', correctly, and
    // were still wrong, which is why the rule is structural rather than a
    // tagging job.
    //
    // Now shared with workoutGenerator.js via exercises/index.js, which
    // had NO exclusion at all. Two engines, one definition -- a second
    // copy here is how the two would drift, and drift is the fault this
    // whole rule exists to catch.
    if (isSessionLength(ex)) return false;

    if (prefs[ex.id]?.preference === "avoid") return false;
    if (impactGated && isImpact(ex)) return false;
    if (cap.asked && !cap.floorSafe   && isFloor(ex))   return false;
    if (cap.asked && !cap.balanceSafe && isBalance(ex)) return false;
    // CAP-4: somebody who cannot rise from a chair needs seated and
    // supported work, not a gentler standing programme.
    if (cap.asked && cap.needsSeated &&
        ex.position !== "seated" && ex.position !== "any") return false;

    // CAP-5. Legs are a separate axis from standing. An 8-week trace of a
    // wheelchair user found him correctly given seated work and then
    // handed Seated Leg Extension and Seated Hamstring Curl -- because
    // "can you rise from a chair" and "do your legs work" are different
    // questions and only the first was being asked.
    //
    // Derived from affectsAreas rather than a new tag: an exercise that
    // works the quadriceps needs quadriceps, and the data already says so
    // on all 518 entries.
    if (cap.asked && !cap.legsUsable && _needsLegs(ex)) return false;
    if (cap.asked && !cap.legsLoadable && _loadsLegs(ex)) return false;

    // ── CARDIAC-1 (14 Aug 2026) ──────────────────────────────────────
    //
    // Somebody who declared a condition where it matters and has NOT been
    // told by a professional that unsupervised exercise is fine.
    //
    // Withholds loaded strength work and nothing else. Mobility, walking,
    // breathing, seated and bodyweight movement all stay, because the
    // harm of withholding those from somebody frightened of their own
    // heart is real and immediate, and the risk of providing them is not.
    // Persona 2.5 is that person: three years post-cardiac-event, never
    // exercised, and what she needs first is permission to move at all.
    //
    // null is NOT a gate. It means the question was never asked, which is
    // true of everyone who declared no relevant condition. Reading it as
    // 'not-yet' would quietly restrict the whole userbase.
    if (_needsClearance() && _isLoadedStrength(ex)) return false;

    if (section === "main" && !withinCeiling(ex)) return false;
    if (section === "warmup" && useCeilingOnWarmup && !withinCeiling(ex)) return false;
    // W2-1. See the cooldown pool note above.
    if (section === "cooldown" && useCeilingOnCooldown && !withinCeiling(ex)) return false;
    // Equipment check: exercise needs no equipment, or user has it.
    // CON-2: equipSet is now a resolved capability set, not the raw ticks.
    if (!exerciseIsAvailable(ex, equipSet)) return false;
    // Condition check — only filter on acute/subacute pain levels.
    // Base condition IDs (no suffix) do not filter exercises — the user
    // has a condition but may have no pain today. Only pain score >= 4
    // (subacute) or >= 7 (acute) triggers exercise exclusion.
    if (ex.contraindications && ex.contraindications.length > 0) {
      const acuteContraindicated = ex.contraindications.some(c =>
        (c.endsWith("-acute") || c.endsWith("-subacute")) && conditionSet.has(c)
      );
      if (acuteContraindicated) return false;
    }
    return true;
  });
}

/**
 * Wider-than-auto-pick candidate lists per section, for "coach
 * recommends" / "build your own" modes. Each candidate carries
 * recommended:true for the same picks buildSession()'s auto-select
 * would have chosen (one per category first, deterministic order —
 * not the same random pick every call, but a sensible, stable
 * starting selection for the UI to pre-check), recommended:false for
 * the rest of the wider pool. "Coach recommends" pre-checks the
 * recommended:true items; "build your own" shows the identical list
 * with nothing pre-checked — one function, two presentations.
 */
export function buildCandidatePools({ sessionType, durationMins, equipmentOverride, preset }) {
  const type = SESSION_TYPES.find(t => t.id === sessionType);
  if (!type) return null;

  const userEquipment = equipmentOverride || store.get("equipment") || [];
  const equipSet       = resolveEquipment(userEquipment);
  const conditionSet   = buildActiveConditionSet();
  const baseCounts     = EXERCISE_COUNT[durationMins] || EXERCISE_COUNT[30];
  const counts         = _applyPreset(baseCounts, preset);

  function poolFor(categories, section, count) {
    const candidates = _filterCandidates(categories, section, equipSet, conditionSet);
    const recommendedIds = new Set();
    for (const cat of categories) {
      if (recommendedIds.size >= count) break;
      const fromCat = candidates.find(e => e.category === cat && !recommendedIds.has(e.id));
      if (fromCat) recommendedIds.add(fromCat.id);
    }
    // Fill remaining recommended slots deterministically (first match),
    // not randomly — a candidate list should be stable if shown twice.
    for (const ex of candidates) {
      if (recommendedIds.size >= count) break;
      recommendedIds.add(ex.id);
    }
    return candidates.map(ex => ({ ...ex, recommended: recommendedIds.has(ex.id) }));
  }

  return {
    warmup:   poolFor(type.warmupCategories,   "warmup",   counts.warmup),
    main:     poolFor(type.mainCategories,     "main",     counts.main),
    cooldown: poolFor(type.cooldownCategories, "cooldown", counts.cooldown)
  };
}

/**
 * Assembles a session from exercise IDs a person actually chose (from
 * buildCandidatePools()'s lists), in the same shape buildSession()
 * produces, so gym-programme.js renders either identically. Hard
 * safety floor: if the chosen warmup selection is empty, one warmup
 * exercise is added automatically — the safety rule (never skip a
 * warmup) holds even in "build your own" mode, it isn't optional.
 */
export function buildSessionFromSelection({ sessionType, durationMins, selectedIds, equipmentOverride, ignoreSevere }) {
  // SEVERE-1. The self-directed route gets the same answer. Putting the
  // bypass only on buildSession() would have made it a safety rule that
  // one of two entry points honoured -- the exact shape of every
  // reachability fault found this week.
  if (SEVERE_BYPASS_ENABLED && !ignoreSevere) {
    const zone = severeZoneToday();
    if (zone) return gentleCareSession(zone, durationMins);
  }

  const type = SESSION_TYPES.find(t => t.id === sessionType);
  if (!type) return null;

  const userEquipment = equipmentOverride || store.get("equipment") || [];
  const equipSet       = resolveEquipment(userEquipment);
  const conditionSet   = buildActiveConditionSet();
  const idSet          = new Set(selectedIds || []);

  function chosenFrom(categories, section) {
    return _filterCandidates(categories, section, equipSet, conditionSet)
      .filter(ex => idSet.has(ex.id));
  }

  let warmupExercises   = chosenFrom(type.warmupCategories,   "warmup");
  const mainExercises     = chosenFrom(type.mainCategories,     "main");
  const cooldownExercises = chosenFrom(type.cooldownCategories, "cooldown");

  // Safety floor — never ship a session with zero warmup, regardless
  // of what was (or wasn't) selected.
  if (warmupExercises.length === 0) {
    const fallback = _filterCandidates(type.warmupCategories, "warmup", equipSet, conditionSet)[0];
    if (fallback) warmupExercises = [fallback];
  }

  const prescribed = (store.get("prescribedExercises") || [])
    .filter(ex => ex.active !== false)
    .map(ex => ({
      id: ex.id, name: ex.name, section: "main", category: "prescribed",
      sets: ex.sets || 3, reps: ex.reps || ex.hold || "As prescribed",
      tempo: "As prescribed", rest: "As needed",
      description: ex.description || ex.notes || "As prescribed by your specialist.",
      cues: ex.notes ? [ex.notes] : ["Follow your specialist's guidance for this exercise"],
      youtube: null, equipment: [], contraindications: [], difficultyLevel: 1,
      isPrescribed: true, prescribedBy: ex.prescribedBy || null
    }));

  // C4 trim. PRESCRIBED EXERCISES ARE NEVER TRIMMED and are never passed to
  // _trimToDuration() — this file's own rule is that "the engine never
  // removes or overrides prescribed exercises", and a specialist's
  // instruction outranks a time target. They are counted toward the total
  // (so the trim makes room for them by removing engine-chosen work
  // instead), then re-inserted in their original position.
  _trimToDuration(warmupExercises, [...prescribed], mainExercises, cooldownExercises, durationMins);
  const allExercises = [...warmupExercises, ...prescribed, ...mainExercises, ...cooldownExercises];

  const estMins = Math.round(allExercises.reduce((acc, ex) => {
    // C3 (12 Aug 2026) — see the note at the parallel call site below. This
    // is buildSessionFromSelection()'s copy; the two must stay in step.
    const dur = ex.duration
      ? (ex.duration * (ex.sets || 1) / 60)
      : ((ex.sets || 3) * 1.5);
    return acc + dur;
  }, 0));
  const durationStr = `${Math.max(estMins - 5, durationMins - 5)}–${Math.max(estMins + 5, durationMins + 5)} mins`;

  const session = {
    id:       `${sessionType}-${Date.now()}`,
    title:    type.label,
    subtitle: `Built by you today — ${durationMins} mins`,
    duration: durationStr,
    coachLine: "You picked this one yourself — here's what you chose.",
    exercises: allExercises
  };

  store.set("generatedSession", {
    session,
    builtAt: new Date().toISOString(),
    inputs:  { sessionType, durationMins, equipment: userEquipment, selectedIds: Array.from(idSet) }
  });

  return session;
}

/**
 * SEVERE-1, 16 Aug 2026. The Gentle Care bypass.
 *
 * ── ROLLBACK: set this to false. That is the whole switch. ──────────
 *
 * WHY IT EXISTS. workoutGenerator.js v1.3's changelog has claimed since
 * August that "any severe pain zone bypasses the full workout pool and
 * returns a single Gentle Care card", and four files reference Gentle
 * Care in comments. Executed on 16 Aug, it did not: somebody with a
 * knee at 9/10 was built a full nine-exercise session including
 * Single-Leg Glute Bridge, Bear Hug Carry and Inchworm. The severity was
 * detected correctly and then consulted by almost nothing --
 * getZoneStatus() had exactly one caller in the whole app, and it was
 * morning-session.js.
 *
 * WHAT THIS IS NOT. It is not a clinical judgement, and it must not be
 * read as one. No physiotherapist has reviewed it. The threshold is not
 * mine either: it is getZoneStatus()'s own existing definition of a
 * severe zone, which is pain >= 7.
 *
 * A KNOWN INCONSISTENCY, surfaced rather than silently resolved:
 * getPainBand() calls 8+ severe while getZoneStatus() calls 7+ severe.
 * Both are live and they disagree. This uses the zone function, because
 * this is a zone decision -- but the disagreement is real and belongs in
 * the clinical review rather than being quietly picked by me.
 *
 * WHAT IT DOES NOT DO. It does not lock anybody out. It changes what the
 * coach BUILDS, not what the person may reach; the doors on Home are
 * untouched, and `ignoreSevere` exists so a deliberate override can be
 * wired to a control later without touching this logic.
 */
const SEVERE_BYPASS_ENABLED = true;

/**
 * The zone the person has severe pain in, or null.
 * Reads the store so every route through buildSession() gets the same
 * answer -- the alternative is each view deciding for itself, which is
 * how a safety rule ends up living in one view of thirteen.
 */
function severeZoneToday() {
  const ids    = store.get("conditions") || [];
  const scores = store.get("conditionPainScores") || {};
  const status = getZoneStatus(ids, scores);
  const zone = ["lower-limb", "spine", "upper-limb", "systemic"]
    .find(z => status[z] === "severe");
  return zone || null;
}

/**
 * The Gentle Care card itself.
 *
 * Three things, and deliberately not a workout: something to breathe
 * with, something to settle with, and the option of a walk. Chosen by id
 * with a category fallback, so a renamed entry degrades to something
 * sensible rather than to an empty card.
 *
 * A side effect worth naming: all three of these were among the 28
 * exercises the reachability audit found that no session type can
 * serve. This is the route they were always supposed to have.
 *
 * THE COACH DOES NOT DIAGNOSE. It says what it has noticed -- the pain
 * score the person themselves entered -- and what it is doing about it.
 * It does not name a condition, does not say what is wrong, and does not
 * tell anybody to see somebody. That last part is the red-flag screen's
 * job and it is not built yet.
 */
function gentleCareSession(zone, durationMins) {
  const pick = (id, category) =>
    EXERCISES.find(e => e.id === id) ||
    EXERCISES.find(e => e.category === category) ||
    null;

  const items = [
    pick("box-breathing", "recovery"),
    pick("body-scan-short", "mindfulness"),
    pick("mindful-walk", "recovery")
  ].filter(Boolean).map((e, i) => ({
    ...e,
    section: i === 2 ? "main" : "warmup",
    _gentleCare: true
  }));

  return {
    id: "gentle-care",
    title: "Something gentler today",
    subtitle: "",
    duration: durationMins || 20,
    gentleCare: true,
    severeZone: zone,
    coachLine:
      "You've told me the pain is high today, so I'm not going to build you a session. " +
      "Here's something gentler instead — breathing, a few quiet minutes, and a walk " +
      "if you feel like moving at all. None of it is required.",
    exercises: items,
    rationale: []
  };
}

export function buildSession({ sessionType, durationMins, equipmentOverride, preset, ignoreSevere }) {
  // SEVERE-1. Before anything else, and before any pool is built.
  if (SEVERE_BYPASS_ENABLED && !ignoreSevere) {
    const zone = severeZoneToday();
    if (zone) return gentleCareSession(zone, durationMins);
  }

  const type = SESSION_TYPES.find(t => t.id === sessionType);
  if (!type) return null;

  const userEquipment  = equipmentOverride || store.get("equipment") || [];
  const equipSet       = resolveEquipment(userEquipment);
  const conditionSet   = buildActiveConditionSet();
  const counts         = _applyPreset(EXERCISE_COUNT[durationMins] || EXERCISE_COUNT[30], preset);
  const conditionNote  = buildConditionNote(sessionType);

  // ── Prescribed exercises injection ──────────────────────────────────────────
  // Active prescribed exercises are included in every session, regardless of
  // session type. They are placed in the warmup or main section depending on
  // their nature. The coach names them explicitly in the coach line.
  // The engine never removes or overrides prescribed exercises.

  const prescribed = (store.get("prescribedExercises") || [])
    .filter(ex => ex.active !== false)
    .map(ex => ({
      id:          ex.id,
      name:        ex.name,
      section:     "main",    // default; could be made smarter later
      category:    "prescribed",
      sets:        ex.sets        || 3,
      reps:        ex.reps        || ex.hold || "As prescribed",
      tempo:       "As prescribed",
      rest:        "As needed",
      description: ex.description || ex.notes || "As prescribed by your specialist.",
      cues:        ex.notes ? [ex.notes] : ["Follow your specialist's guidance for this exercise"],
      youtube:     null,
      equipment:   [],
      contraindications: [],
      difficultyLevel: 1,
      isPrescribed:    true,
      prescribedBy:    ex.prescribedBy || null
    }));

  const hasPrescribed = prescribed.length > 0;

  // PT-19 — decided once per session, used by selectFromCategories() below
  // and surfaced on the session object so the coach line can say why the
  // warm-up looks different when it does.
  const pulseRaiser = pulseRaiserDecision(sessionType);

  function selectFromCategories(categories, section, count, alreadyChosen) {
    const chosen = alreadyChosen || new Set();
    const prefs  = store.get("exercisePreferences") || {};
    const candidates = _filterCandidates(categories, section, equipSet, conditionSet)
      .filter(ex => !chosen.has(ex.id));

    // Prioritise variety across categories — one from each category first
    const selected = [];
    const usedCategories = new Set();

    // PULSE-RAISER RESERVED SLOT (PT-19). The warm-up's first slot belongs
    // to cardio-warmup unless pulseRaiserDecision() names a reason it
    // should not. Reserved rather than reordered: reordering the category
    // array would only change which category gets dropped when slots run
    // out, and the point is that this one never should. Same shape as the
    // existing warmup floor -- a rule, not a preference.
    if (section === "warmup" && pulseRaiser.include && count > 0) {
      // Must respect `chosen` like every other pick. Found by regression
      // after the duplicate fix: the reserved slot ran before the guard
      // was consulted, so the same machine warm-up could be selected
      // twice within one warm-up section.
      const cardio = candidates.filter(e => e.category === "cardio-warmup" && !chosen.has(e.id));
      if (cardio.length > 0) {
        // Prefer a machine when the person has one. Found in testing: the
        // reserved slot picked at random, so a gym user with a treadmill,
        // a bike and a cross trainer ticked was being handed jumping jacks
        // -- which is exactly the complaint that started this. Bodyweight
        // is right at home and wrong standing next to a cross trainer.
        // Falls back to bodyweight whenever no machine is available.
        const machine = cardio.filter(e => (e.equipment || []).length > 0);
        let pulsePool = machine.length > 0 ? machine : cardio;

        // CAP-6 (C3), 13 Aug 2026. This reserved slot picked at random
        // from its own pool and never consulted a single one of the
        // preference rules in pickFrom() below -- not 'less', not
        // adapted content, not continuity. It is why persona 2.15 kept
        // opening sessions with Seated Arm Cycling even after the
        // adaptive de-prioritisation went in: 16 non-adaptive
        // cardio-warmup options existed and this path could not see them.
        //
        // The local `const pickFrom` also SHADOWED the function of the
        // same name, so the bypass was invisible at the call site and
        // read as though it were using it. Renamed to pulsePool.
        //
        // Logged, not fixed here: 'less' preferences are still ignored
        // by this slot. Same root cause, wider blast radius than C3's
        // file scope -- see the master schedule.
        if (_capabilityUnrestricted()) {
          const notAdapted = pulsePool.filter(e => e.adaptive !== true);
          if (notAdapted.length > 0) pulsePool = notAdapted;
        }

        // SEL-1, 13 Aug 2026. Logged when CAP-6 shipped, fixed here.
        // This slot ignored 'less' preferences entirely, so somebody
        // could tell the coach "not a fan of this" and keep receiving it
        // as the first thing in every session -- the single most
        // prominent position in the whole workout. Telling the coach
        // something and watching nothing change is worse than never
        // being asked.
        const pulseNotLess = pulsePool.filter(
          e => prefs[e.id]?.preference !== "less");
        if (pulseNotLess.length > 0) pulsePool = pulseNotLess;

        // And cross-discipline fit, for the same reason it applies in
        // pickFrom: a yoga pose is a strange way to open a barbell
        // session.
        // GYM_SESSION_TYPES.has(sessionType) inline rather than the
        // `wantsGymDiscipline` local: that local is declared ~120 lines
        // below, and this slot runs first. The temporal-dead-zone error
        // it caused was invisible in review and immediate at runtime.
        if (GYM_SESSION_TYPES.has(sessionType)) {
          const onDiscipline = pulsePool.filter(e => !_offDisciplineForGym(e));
          if (onDiscipline.length > 0) pulsePool = onDiscipline;
        }

        const chosenPulse = pulsePool[Math.floor(Math.random() * pulsePool.length)];
        selected.push(chosenPulse);
        chosen.add(chosenPulse.id);
        usedCategories.add("cardio-warmup");
      }
    }

    // CON-8 — EQUIPMENT PREFERENCE, NOT JUST PERMISSION.
    //
    // Until now equipment was only ever a permission check: an exercise
    // needing a barbell was allowed if you had one, and an exercise needing
    // nothing was allowed always. Nothing ever PREFERRED the barbell when
    // the person was standing next to it. Because bodyweight is the large
    // majority of the database, random selection handed a gym user a
    // session they could have done in their living room -- which is exactly
    // what Graeme reported, twice.
    //
    // When the person has meaningful equipment available, equipment-using
    // exercises are picked first within each category. The bodyweight
    // fallback is untouched: if a category has no equipment option, or the
    // person has no kit, behaviour is identical to before.
    //
    // Deliberately a preference and not a rule. A gym session that refused
    // to include a press-up or a plank because they need no equipment would
    // be worse, not better.
    const preferEquipment = equipSet.size > 2;

    // ── CONT-1: CONTINUITY ────────────────────────────────────────────────
    //
    // Selection used to be Math.random() over the candidate pool, every
    // session, from 497 exercises. A person doing a goblet squat on Monday
    // would very likely not meet it again for weeks.
    //
    // That is what an app does when it has nothing else to offer, and it
    // breaks three things at once. There is no progressive overload,
    // because you cannot get stronger at an exercise you meet once. There
    // is no skill acquisition, because you cannot correct a fault you never
    // repeat -- which made the entire watchOut library decorative. And
    // there is no familiarity, which matters most for exactly the people
    // this product is for: the person who is nervous about the gym needs to
    // recognise the session, and constant novelty is exciting only for the
    // already-confident.
    //
    // A coach does the opposite of variety. They give you the same four
    // movements for several weeks and change what you do with them.
    //
    // So: within a category, an exercise the person has met before and
    // recently is strongly preferred. Three deliberate limits stop that
    // becoming a rut:
    //
    //   RECENCY   Familiarity decays. Past CONTINUITY_WINDOW_DAYS an
    //             exercise is no longer an anchor, so a long absence
    //             produces a fresh start rather than resurrecting a
    //             programme from months ago.
    //
    //   MASTERY   Past MASTERY_THRESHOLD completions an exercise stops
    //             being preferred, mirroring a coach rotating a lift out
    //             after a block rather than running it forever.
    //
    //   NOVELTY   A fixed share of slots ignore history entirely, so the
    //             database does not collapse to the handful of exercises
    //             that happened to be picked in week one.
    const CONTINUITY_WINDOW_DAYS = 21;
    const MASTERY_THRESHOLD      = 8;

    // CONT-2 -- the person's own answer, never inferred from behaviour.
    // W2-6, 14 Aug 2026: familiar 0.10 -> 0.05, alongside SECTION_SCALE
    // below. Measured over 96 session-to-session transitions per setting,
    // 12 independent runs: mean overlap with the previous session went
    // 40% -> 62% for 'familiar', with 'balanced' and 'varied' unmoved at
    // 30% and 16%. The floor still dips on individual transitions, which
    // is inherent to a probabilistic pick and is not worth tuning away --
    // driving it higher starts producing identical sessions, which is a
    // different failure and a worse one.
    const VARIETY_NOVELTY = { familiar: 0.05, balanced: 0.25, varied: 0.55 };
    const variety = store.get("sessionVariety") || "balanced";
    const baseNovelty = VARIETY_NOVELTY[variety] ?? VARIETY_NOVELTY.balanced;

    // SLOT-WEIGHTED ANCHORING (persona trace 2.15).
    //
    // CONT-1 anchored every slot equally, and the result was exactly
    // backwards. Traced over eight weeks of gym training, her top eight
    // most-repeated exercises were three cardio warm-ups and five
    // accessories -- not one barbell lift. Her nine barbell lifts
    // averaged 2.7 exposures in eight weeks, nowhere near enough to
    // progress on anything.
    //
    // The cause is pool depth, not intent: warm-up categories are thin so
    // they repeat, main-lift categories are deep (32 hinge, 21 squat) so
    // they rotate. Uniform anchoring therefore anchors the thing that
    // does not matter and rotates the thing that does.
    //
    // A coach does the opposite. Your squat and your press stay for six
    // weeks; nobody needs to master a hip flexor stretch. So the main
    // section anchors hard and warm-ups and cool-downs rotate freely.
    const SECTION_NOVELTY = { warmup: 0.55, main: 0.0, cooldown: 0.55 };

    // ── W2-6 (14 Aug 2026, persona trace Wave 2) ─────────────────────
    //
    // The section weighting above was a FLAT addition, so it overrode the
    // person's own answer in exactly the section they notice first.
    // Persona 2.14 -- autistic, predictability-seeking -- chose "something
    // like last time" nine sessions running and got a mean 40% overlap
    // with a range of 11-70%. Traced: main anchored at 90% repeat while
    // his warm-up changed almost every session.
    //
    // That is backwards for him and it is the opposite of 2.15's problem.
    // For a lifter the main lift is the thing to hold; for him the OPENING
    // is, because the first two minutes are what tell his nervous system
    // what kind of thing this is going to be. And the variance is worse
    // than the mean: for somebody whose whole ask is the removal of
    // surprise, an unpredictable AMOUNT of surprise is the surprise.
    //
    // So the section weighting now scales with what the person asked for
    // rather than being added on top of it. 'familiar' keeps roughly a
    // third of the section rotation; 'balanced' and 'varied' are
    // unchanged, so 2.15's slot anchoring and 2.13's novelty are both
    // untouched -- she chose neither of those settings.
    const SECTION_SCALE = { familiar: 0.15, balanced: 1.0, varied: 1.0 };
    const sectionScale = SECTION_SCALE[variety] ?? 1.0;
    const noveltyRate = Math.min(
      1,
      baseNovelty + (SECTION_NOVELTY[section] ?? 0) * sectionScale
    );

    // ── FIX-1 (C4-1), 13 Aug 2026: discipline fit ────────────────────
    // Persona 2.15 -- barbell, rack, four gym sessions a week -- was
    // served Tree Pose and Half Moon Pose in a Lower Body session, and
    // Tree Pose again in Core. They arrive legitimately: both are
    // movementPattern 'yoga-pose' with balance in affectsAreas, so
    // `balance-work` matches them, and nothing has ever read the
    // pattern to ask whether a yoga pose belongs in a barbell session.
    //
    // The markers already exist and were simply never used --
    // 'yoga-pose' and 'pilates-move' are distinct patterns in the
    // database. Same finding shape as C2 and C3: the data was right and
    // nothing read it.
    //
    // Preference, not exclusion, for the third time in this file and
    // for the same reason: the Yoga & Pilates door must keep working,
    // thin categories must not starve, and somebody whose only balance
    // option IS a yoga pose should still get one.
    // Declared at module scope (see CROSS_DISCIPLINE above): the
    // reserved cardio-warmup slot runs BEFORE this point and needs them
    // too. Declaring them here threw "Cannot access before
    // initialization" the moment SEL-1 used them -- caught by building a
    // session, not by reading the file.
    const wantsGymDiscipline = GYM_SESSION_TYPES.has(sessionType);

    function isAnchor(ex) {
      const s = store.exerciseStats(ex.id);
      if (!s.seen) return false;
      if (s.n >= MASTERY_THRESHOLD) return false;
      if (s.daysSince !== null && s.daysSince > CONTINUITY_WINDOW_DAYS) return false;
      return true;
    }

    function pickFrom(pool) {
      if (pool.length === 0) return null;

      // ── DEDUPE-1, 13 Aug 2026: no two exercises with the same NAME ──
      //
      // `chosen` is a Set of IDS, so nothing stopped both members of a
      // same-named pair being selected into one session. Somebody could
      // read "Burpee" twice on one screen and reasonably conclude the
      // app was broken.
      //
      // The fourteen duplicate names in the database were cleaned the
      // same day, so this guards nothing today. It stays because the
      // fault was never the specific pairs -- it was that identity was
      // checked by id when the person reads the name. A future import,
      // or a legitimate pair kept apart on purpose (Pigeon Pose and
      // Pigeon Pose — Yoga are deliberately two entries), brings it back.
      //
      // Same shape as the 11 Aug fix for duplicate OBJECTS, which
      // `matched.push({ ...ex })` created by spreading one entry into
      // several per-category copies. That one was invisible to an
      // identity check; this one is invisible to an id check.
      const usedNames = new Set(selected.map(e => e.name));
      const distinct = pool.filter(e => !usedNames.has(e.name));
      if (distinct.length > 0) pool = distinct;

      // Equipment preference (CON-8) decides WHICH pool we choose from,
      // continuity decides which member of it.
      //
      // MIN_CHOICE found by simulation, not assumed: with a hard
      // equipment filter, a category holding a single equipment-using
      // exercise handed the same one every single session -- one
      // exercise appeared in 24 of 24 sessions across a simulated eight
      // weeks. Preference had quietly become compulsion. When the
      // equipment-using pool is too thin to offer real choice, the
      // bodyweight options come back in, which is also what a coach
      // would do rather than repeat one movement forever.
      const MIN_CHOICE = 3;
      let candidates = pool;
      if (preferEquipment) {
        const withKit = pool.filter(e => (e.equipment || []).length > 0);
        if (withKit.length >= MIN_CHOICE) candidates = withKit;
      }

      // Mastery escape: if every candidate here is past the ceiling and
      // wider options exist, widen rather than repeat something the
      // person has already worked through.
      if (candidates !== pool && candidates.every(e => store.exerciseStats(e.id).n >= MASTERY_THRESHOLD)) {
        candidates = pool;
      }

      // ── W2-7 (14 Aug 2026) ───────────────────────────────────────────
      //
      // CORRECTION to my own Wave 2 finding. I reported that
      // session-builder never read exercisePreferences. It did — this
      // rule, right here, has read 'less' since it was written. What it
      // never read was 'avoid', which is handled in _filterCandidates()
      // now. Reading the grep and not the code is exactly the mistake
      // this project keeps paying for.
      //
      // The rule as written was "never chosen while something else
      // exists", and in a pool of fifty that means never. Measured: an
      // exercise served 24 times in 60 sessions dropped to 0 — identical
      // to an avoided one. So a deliberately two-level signal had
      // collapsed to one level, and the gentler option was doing the
      // harsher thing.
      //
      // "Offer this less often" is not "never offer this". Now
      // probabilistic: LESS_SUPPRESSION is the share of picks that step
      // past a 'less' item, so it stays in rotation at roughly a fifth of
      // its previous rate. Somebody who wanted it gone had the other
      // button, and that button now works.
      const LESS_SUPPRESSION = 0.8;
      if (Math.random() < LESS_SUPPRESSION) {
        const notLess = candidates.filter(e => prefs[e.id]?.preference !== "less");
        if (notLess.length > 0) candidates = notLess;
      }

      // ── CAP-6 (C3), 13 Aug 2026 ──────────────────────────────────────
      // Adapted content is de-prioritised for somebody who does not need
      // it. Same shape as the 'less' rule directly above, deliberately:
      // available when a category has nothing else, never chosen while
      // something else exists.
      //
      // THE GENERAL LESSON, because this is a class of bug and not one
      // instance. The capability screen answers "what CAN this person
      // do?" and every gate built on it subtracts. Nothing ever asked
      // "what does this person NEED?" -- so an engine that only
      // subtracts hands adapted work to everybody able to perform it.
      // Seated arm cycling is not unsafe for a powerlifter. It is
      // simply not for her, and receiving it nine times in three weeks
      // is how somebody decides the app has not understood them.
      //
      // Traced 13 Aug, persona 2.15 (capability all yes, full rack,
      // four sessions a week): Seated Arm Cycling x9, Seated Shoulder
      // Rolls x6, Seated Punches x5 -- against Barbell Bench Press x5.
      // Three of her last four sessions opened with shoulder rolls.
      //
      // EXCLUSION WOULD BE WRONG. A hard filter starves thin categories
      // and would break the warm-up floor the CAP-4 work established.
      // This is the same correction CON-8 made for equipment, in the
      // opposite direction: a preference in selection, not a permission.
      //
      // Only applies when the capability screen was actually ANSWERED
      // and cleared. Somebody who was never asked, or who reported any
      // limitation, keeps the adapted pool at full weight -- silence is
      // never read as capability.
      if (_capabilityUnrestricted()) {
        const notAdapted = candidates.filter(e => e.adaptive !== true);
        if (notAdapted.length > 0) candidates = notAdapted;
      }

      // FIX-1. Yoga and Pilates movements sort behind everything else in
      // a gym-shaped session. They remain reachable when nothing else
      // fits the slot.
      if (wantsGymDiscipline) {
        const onDiscipline = candidates.filter(e => !_offDisciplineForGym(e));
        if (onDiscipline.length > 0) candidates = onDiscipline;
      }

      // Intent tilt, applied before continuity so that a maintenance user
      // builds familiarity WITH the capacities that matter to them rather
      // than around them.
      if ((store.get("trainingIntent") || "improve") !== "improve" && section === "main") {
        const priority = candidates.filter(intentPriority);
        if (priority.length >= 2) candidates = priority;
      }

      if (Math.random() >= noveltyRate) {
        const anchors = candidates.filter(isAnchor);
        if (anchors.length > 0) {
          // Among anchors, prefer the one met least often, so a person
          // building familiarity across several movements does not get
          // stuck repeating whichever one came up first.
          const fewest = Math.min(...anchors.map(e => store.exerciseStats(e.id).n));
          const tier = anchors.filter(e => store.exerciseStats(e.id).n === fewest);
          return tier[Math.floor(Math.random() * tier.length)];
        }
      }

      // No anchor available, or this slot is deliberately novel: prefer
      // something never met before over something met and dropped.
      const unseen = candidates.filter(e => !store.exerciseStats(e.id).seen);
      let from = unseen.length > 0 ? unseen : candidates;

      // ── FIX-2 (C4-3), 13 Aug 2026: the opening pick ─────────────────
      // The anchor mechanism is NOT the problem here and was nearly
      // rebuilt on that mistaken reading. SECTION_NOVELTY.main is 0.0,
      // so once a main lift is chosen it holds -- which is exactly
      // right, and it worked: persona 2.15 kept Paused Goblet Squat for
      // three weeks straight.
      //
      // The fault is one line earlier. Her FIRST session picked at
      // uniform random from everything unseen, so a goblet squat and a
      // barbell front squat were equally likely -- and continuity then
      // faithfully preserved the coin toss for three weeks. She has a
      // barbell, a rack, and a goal of getting stronger, and never met
      // a barbell squat once.
      //
      // So: on a first-ever main-slot pick, for somebody whose goal is
      // strength, prefer the option that can actually be loaded and
      // that they own the kit for. Deliberately narrow --
      //   main section only (warm-ups should stay varied),
      //   strength goals only (nobody else asked to add weight),
      //   equipment they have declared,
      //   and only when a real choice exists.
      // Everything after this point is untouched, because everything
      // after this point was already correct.
      if (section === "main" && unseen.length > 0) {
        const goals = store.get("goals") || [];
        const wantsLoad = goals.includes("get-stronger") || goals.includes("build-muscle");
        if (wantsLoad) {
          const loadable = from.filter(e =>
            (e.equipment || []).length > 0 &&
            (e.equipment || []).every(eq => equipSet.has(eq)));
          if (loadable.length > 0) {
            // Heaviest-capable first: a barbell squat over a goblet
            // squat, by difficulty as the available proxy for load.
            const top = Math.max(...loadable.map(e => e.difficultyLevel || 1));
            const heaviest = loadable.filter(e => (e.difficultyLevel || 1) === top);
            from = heaviest;
          }
        }
      }

      return from[Math.floor(Math.random() * from.length)];
    }

    // First pass: one from each category
    for (const cat of categories) {
      if (selected.length >= count) break;
      const fromCat = candidates.filter(e => e.category === cat && !selected.includes(e));
      const pick = pickFrom(fromCat.filter(e => !chosen.has(e.id)));
      if (pick) {
        selected.push(pick);
        chosen.add(pick.id);
        usedCategories.add(cat);
      }
    }

    // Second pass: fill remaining slots.
    //
    // RAT-1 (11 Aug 2026, found in the 8-week persona trace). A
    // 76-year-old's Mobility session opened with FIVE breathing practices
    // in a row -- Extended Exhale, Standing Spinal Wave, Pranayama,
    // Three-Part Breath, Alternate Nostril. Not a session, a queue.
    //
    // Cause: Mobility declares two warm-up categories for up to five
    // slots, and one of them ("breathing-warmup") holds 21 entries. The
    // first pass took one per category, then the fill loop drained the
    // deepest category for everything left.
    //
    // A category may now supply at most a third of a section, rounded up,
    // and always at least two. Deep categories no longer crowd out
    // shallow ones simply for being deep, and the constraint relaxes
    // rather than starving a section when there is genuinely nothing
    // else -- a short session is better than a monotonous one, but an
    // empty one is worse than both.
    const maxPerCategory = Math.max(2, Math.ceil(count / 3));
    const categoryCount = {};
    for (const e of selected) {
      categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
    }

    let remaining = candidates.filter(e => !chosen.has(e.id));
    while (selected.length < count && remaining.length > 0) {
      const under = remaining.filter(
        e => (categoryCount[e.category] || 0) < maxPerCategory
      );
      const pick = pickFrom(under.length > 0 ? under : remaining);
      if (!pick) break;
      selected.push(pick);
      chosen.add(pick.id);
      categoryCount[pick.category] = (categoryCount[pick.category] || 0) + 1;
      remaining = remaining.filter(e => e.id !== pick.id);
    }

    return selected.slice(0, count);
  }

  // Reduce main slot count to make room for prescribed exercises
  const prescribedCount = prescribed.length;
  const adjustedCounts  = {
    warmup:   counts.warmup,
    main:     Math.max(1, counts.main - prescribedCount),
    cooldown: counts.cooldown
  };

  // PERSONA TRACE FINDING (11 Aug 2026, persona 2.11). A session could
  // contain the same exercise twice -- "Standing Spinal Wave" appeared
  // twice in one traced session, and measurement put the rate at 12% of
  // all sessions.
  //
  // Cause, introduced by CON-6: _filterCandidates() tags each match with
  // the category it was selected FOR, via `matched.push({ ...ex, category,
  // section })`. That spread creates a NEW object per category, so an
  // exercise matching two categories (Warrior II matches both hip-mobility
  // and shoulder-mobility) produced two distinct objects, and the
  // `!selected.includes(e)` guard -- which compares object identity --
  // could not see they were the same exercise. The old private pool had
  // one object per entry, so identity comparison happened to work.
  //
  // alreadyChosen carries ids across all three sections, since a duplicate
  // between warmup and main is just as wrong as one within a section.
  const alreadyChosen = new Set(prescribed.map(p => p.exerciseId || p.id).filter(Boolean));

  const warmupExercises   = selectFromCategories(type.warmupCategories,   "warmup",   adjustedCounts.warmup,   alreadyChosen);
  const mainExercises     = [...prescribed, ...selectFromCategories(type.mainCategories, "main", adjustedCounts.main, alreadyChosen)];
  const cooldownExercises = selectFromCategories(type.cooldownCategories, "cooldown", adjustedCounts.cooldown, alreadyChosen);

  // If equipment mismatch is severe, add a coach note
  let equipNote = null;
  if (mainExercises.length < counts.main * 0.6) {
    equipNote = "With your equipment today I've built the best session I can. Some categories have limited options — focus on the movements you have.";
  }

  // Build prescribed note for coach line
  let prescribedNote = null;
  if (hasPrescribed) {
    const prescribers = [...new Set(prescribed.map(p => p.prescribedBy).filter(Boolean))];
    if (prescribers.length > 0) {
      prescribedNote = `I've included your prescribed exercises from ${prescribers.join(" and ")}. Do these as written — they are not mine to change.`;
    } else {
      prescribedNote = `I've included your prescribed exercises at the start of the main session. Do these as written.`;
    }
  }

  const coachLine = generateCoachLine(
    sessionType,
    durationMins,
    Array.from(conditionSet),
    userEquipment,
    [conditionNote, equipNote, prescribedNote].filter(Boolean).join(" ") || null
  );

  // Calculate estimated duration
  _trimToDuration(warmupExercises, [], mainExercises, cooldownExercises, durationMins);
  const allExercises = [...warmupExercises, ...mainExercises, ...cooldownExercises];

  const estMins = Math.round(allExercises.reduce((acc, ex) => {
    // C3 (12 Aug 2026) — a duration-based exercise carries its own TOTAL
    // time. `sets || 3` was tripling it: a 20-minute run counted as 60, a
    // 30-minute C25K session as 90, which is how a 60-minute request came
    // back labelled "552–562 mins". Sets only multiply rep-based work.
    const dur = ex.duration
      ? (ex.duration * (ex.sets || 1) / 60)
      : ((ex.sets || 3) * 1.5);
    return acc + dur;
  }, 0));
  const durationStr = `${Math.max(estMins - 5, durationMins - 5)}–${Math.max(estMins + 5, durationMins + 5)} mins`;

  // PT-19 — when the pulse-raiser is deliberately left out for a reason the
  // person gave us (unwell, acute pain), say so. An exclusion applied
  // silently is exactly what Locked Principle P1 forbids: the coach never
  // withholds what it can see. The structural exemptions (cardio, mobility)
  // carry no reason and add nothing here, correctly.
  const coachLineWithWarmupNote = pulseRaiser.reason
    ? `${coachLine} ${pulseRaiser.reason}`
    : coachLine;

  const session = {
    id:       `${sessionType}-${Date.now()}`,
    title:    `${type.label}`,
    subtitle: `Built for you today — ${durationMins} mins`,
    duration: durationStr,
    coachLine: coachLineWithWarmupNote,
    exercises: allExercises
  };

  // The coach explaining its own reasoning. Attached to the session so the
  // views render it rather than recompute it, and so it is captured with
  // the session it describes.
  session.rationale = buildRationale(session, { excludedReason: pulseRaiser.reason });

  // EMP-2. Did the coach VISIBLY adapt today? Recorded on the session
  // itself rather than as a new top-level store field: generatedSession
  // is already persisted, and this is a fact about one session, not a
  // standing property of the person.
  //
  // Empathy Transfer Stage 2 Prompt B is written for exactly this moment
  // -- "the coach adjusts based on what's actually going on for you, not
  // what should be going on, not what was planned" -- and until now the
  // condition could not be evaluated at all, because nothing recorded
  // that an adjustment had happened.
  //
  // Two triggers, both meaning the person could SEE the adaptation:
  //   1. Something was left out and explained (pulseRaiser.reason is the
  //      coach saying so in its own words).
  //   2. A condition was flagged at 4+ today, which constrains selection
  //      and makes progressionInvitation() speak to the sore area by
  //      name. 4 matches the threshold used there, not a new number.
  //
  // Deliberately NOT counting silent adaptation. A prompt about noticing
  // someone else should only follow a moment the person actually
  // witnessed, or it praises them for something invisible.
  const _adjPain = store.get("conditionPainScores") || {};
  const _adjFlagged = (store.get("conditions") || []).some(id => (_adjPain[id] || 0) >= 4);
  session.rationale.adjusted = Boolean(pulseRaiser.reason) || _adjFlagged;

  // Store in store.js
  store.set("generatedSession", {
    session,
    builtAt: new Date().toISOString(),
    inputs:  { sessionType, durationMins, equipment: userEquipment }
  });

  return session;
}
