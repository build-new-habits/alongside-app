/**
 * sw.js - Alongside Service Worker
 *
 * 13 Aug 2026 v330
 * D3. store.js v40 (new field sessionPreset),
 * session-builder-ui.js v9. Nothing new to precache.
 *
 * 13 Aug 2026 v329
 * NAV-8 + upgrade statement withdrawal. router.js v16, upgrade.js v6.
 * Nothing new to precache.
 *
 * 13 Aug 2026 v328
 * DEDUPE-1. Eleven duplicate exercise entries retired (556 -> 545),
 * five renamed, session-builder.js v29 name guard, core-session.js
 * repointed. Nothing new to precache.
 *
 * 13 Aug 2026 v327
 * HOME-1, milestone badges, EMP-4. today.js v14, reflect.js v6,
 * programmes.js v3, store.js v39. Nothing new to precache.
 *
 * 13 Aug 2026 v326
 * VOICE-3 / D2. New js/data/personal-reads.js (precached) —
 * Personal-tier observations, each gated on a real data signal.
 * session-rationale.js v3.
 *
 * 13 Aug 2026 v325
 * VOICE-2. session-builder.js v28, session-rationale.js v2,
 * empathy-transfer.js v5. 108 approved coach lines. Nothing new to precache.
 *
 * 13 Aug 2026 v324
 * E1, E2, E3, FIX-5. progress.js v6, in-step.js, empathy-transfer.js v4,
 * session-builder.js v27, sport_conditioning.js. Nothing new to precache.
 *
 * 13 Aug 2026 v323
 * C4 residuals, SEL-1, FIX-4. session-builder.js v26, gym.js, seated.js.
 * No new files to precache.
 *
 * 13 Aug 2026 v322
 * C2. rehabilitation.js v5, session-builder.js v25, gym.js, seated.js.
 * No new files to precache.
 *
 * 13 Aug 2026 v321
 * CAP-6 (C3). session-builder.js v24, seated.js (38 entries tagged).
 * No new files to precache.
 *
 * 13 Aug 2026 v320
 * C1. rehabilitation.js v4 (94 entries recopied), coach-proposal.js v20.
 * No new files to precache.
 *
 * 13 Aug 2026 v319
 * TIER-E. progress.js v5. No new files to precache.
 *
 * 13 Aug 2026 v318
 * TIER-A/B/C/F. library.js v4, today.js v13, gym-programme.js v5,
 * session-builder-ui.js v8, noticing.js, index.html, upgrade.js v5.
 * No new files to precache.
 *
 * 13 Aug 2026 v317
 * A2. The real upgrade page. upgrade.js v4, new
 * css/components/upgrade-page.css (precached), main.css v22.
 *
 * 13 Aug 2026 v316
 * A1 + A3. settings.js v22, settings.css v7, upgrade.js v3.
 * No new files to precache — both changed files are already listed.
 *
 * 12 Aug 2026 v314
 * LOG-6. The note is readable back before you save it.
 *
 * Graeme: "Can we make that expandable as well so that you can actually
 * see what's written rather than a few characters at a time... you can
 * then read back over what you said before pressing save."
 *
 * TWO limits were in the way and LOG-5 only moved one. The field was also
 * capped at 40 CHARACTERS -- "3kg felt fine, 4kg pulled and the back
 * tightened" is 50, so it was truncated mid-sentence regardless of how
 * wide the box got.
 *
 * Now a textarea that grows with its content, capped at 280. A note is
 * not an essay, but it should hold a thought. It starts at one row rather
 * than three: an empty tall box on every card reads as an expectation to
 * fill it, and this field is optional.
 *
 * A character count appears in the last 60 characters only. A counter
 * from the first keystroke is pressure; one near the ceiling is help --
 * and meeting a 280 limit with no warning is the same failure as the 40
 * one, just later.
 *
 * 12 Aug 2026 v313
 * SCROLL-1 and LOG-5, both from the device pass.
 *
 * SCROLL-1 -- Graeme: "When I click next exercise I'm dropped to the
 * bottom of the screen. Always a new screen should start at the top."
 *
 * router.js resets scroll on every view MOUNT, but advancing between
 * exercises does not navigate -- it re-renders in place, so nothing reset
 * it. You finish a card at the bottom, where Next Exercise lives, the
 * next card renders, and you are still at the bottom: past its name, past
 * the timer, reading watch-outs for something you have not seen yet.
 *
 * Eight advance points across five views. The helper lives in
 * session-log.js, which every card-shaped view already imports, because
 * five copies of a one-line fix is how four of them drift. Instant, not
 * smooth: animating from the bottom of one card to the top of the next
 * reads as a lurch.
 *
 * LOG-5 -- "is like a bigger box for notes to fill the remaining space to
 * the right of it." Every field shared a fixed 5.5rem, which is right for
 * "12.5" and absurd for "felt fine, back was tight". Sizing a note like a
 * number tells somebody not to write much, which is the opposite of the
 * point. The note now takes the remaining width, with min-width:0 so it
 * shrinks rather than pushing Save off a tight row.
 *
 * 12 Aug 2026 v312
 * EQUIP-4 ACTUALLY SHIPPED THIS TIME.
 *
 * The v310 commit did not contain the fix. Testing the new sweep against
 * pre-fix code, I checked session-builder-ui.js out at HEAD~2 and
 * restored it from /tmp afterwards -- but the commit in between captured
 * the reverted file. So v310 and v311 both shipped the OLD duration
 * handler, which pre-seeds equipmentOverride and switches the resolver
 * off.
 *
 * Caught by running the sweep against a FRESH CLONE of the remote rather
 * than the working directory. Locally everything passed; deployed, it
 * failed. That check is the only reason this was not a fifth report from
 * Graeme.
 *
 * Lesson, and it is the same shape as the others: verifying the thing in
 * front of me rather than the thing that shipped. Fresh-clone verification
 * after push is not ceremony.
 *
 * 12 Aug 2026 v311
 * EQUIP-5. Deep sweep of the entire equipment chain.
 *
 * Graeme, after four failed fixes: "I want you to do a deep sweep to
 * guarantee this is right. No more 'I didn't look at that file' or 'I
 * didn't see it'."
 *
 * Fair. Every earlier attempt failed on something unexamined -- wrong
 * diagnosis, wrong layer, wrong catalogue file, then a pre-seed I had not
 * traced. And every gate I wrote tested a fixture I had typed, or
 * REPLICATED logic instead of exercising it.
 *
 * Traced all 42 files touching equipment. Three writes, seventeen reads,
 * every one followed to its consumer. Findings:
 *
 * 1. FOUR ITEMS WERE MISSING FROM THE CATALOGUE. agility-ladder,
 *    agility-cones, reaction-ball and nordic-walking-poles are REQUIRED by
 *    exercises and existed nowhere anybody could tick them -- six
 *    exercises permanently unreachable for every user since the database
 *    was written. Added.
 *
 * 2. Every other link is sound. All 48 exercise tags are now reachable,
 *    all 15 screen options can be ticked by something, and every consumer
 *    (session-builder x3, workoutGenerator via filterByEquipment,
 *    session-builder-ui) resolves before comparing.
 *
 * 3. Round-trip verified on Graeme's real twelve saved ids: first load
 *    ticks Dumbbells, Resistance bands, Bench, Box or step, Foam roller;
 *    unticking sticks; manually ticking unowned kit sticks; the gym
 *    fallback works; an empty list ticks nothing.
 *
 * New tools/verify-equipment-sweep.mjs walks catalogue -> store ->
 * resolver -> screen -> exercise selection on every run, deriving
 * everything from the files. It fails 2 assertions on the pre-fix code.
 *
 * 12 Aug 2026 v310
 * EQUIP-4. MY OWN FIX DISABLED ITSELF.
 *
 * Graeme, fourth report, on confirmed v309 with the new tabs visible:
 * "You can see that we are on the correct version... but the equipment
 * isn't coming across."
 *
 * He was right, and delivery was not the problem this time. EQUIP-3 was
 * live and correct. It was switched off by a line written a week earlier.
 *
 * Choosing a session duration set equipmentOverride to the RAW saved list
 * -- ["adjustable-dumbbells", "band-light", ...] -- BEFORE the person had
 * ticked anything. EQUIP-3 then correctly treated a populated override as
 * "their own deliberate choices" and skipped resolution, so it compared
 * "dumbbells" against a list containing "adjustable-dumbbells" and found
 * nothing.
 *
 * The exemption was written for deliberate ticks and fired before any
 * tick existed. Now null until the person actually touches a checkbox,
 * which is the only state in which resolution runs.
 *
 * Verified against his exact twelve saved ids: ticks Dumbbells,
 * Resistance bands, Bench, Box or step, Foam roller. Nothing he does not
 * own.
 *
 * THE GATE WAS ALSO WRONG, AGAIN. It replicated renderEquipmentCheck's
 * logic rather than exercising it, so it kept passing while the screen
 * took a different path. It now asserts the real function's shape before
 * replicating, and fails if the duration handler pre-seeds.
 *
 * Also: "git stash" to test a gate against pre-fix code stashes THE GATE
 * TOO, so it silently tests the old gate against the old source and
 * reports zero failures. Only the source file may be reverted.
 *
 * 12 Aug 2026 v309
 * NAV-7. Sub-tabs inside each Settings section.
 *
 * Graeme: "Inside the three doors in settings are just long scrollable
 * pages. Can these be sectioned into slideable tabs to keep it clean?"
 *
 * Yes, and safely -- which it would NOT have been before NAV-5. The old
 * strip failed because seven tabs could not fit and scrolled with the
 * scrollbar hidden, so three were invisible. Three and four fit across a
 * phone, and this strip has NO overflow-x: if a label ever outgrows the
 * width the row wraps rather than scrolling. A wrapped tab is ugly; a
 * scrolled one is invisible, and invisible is what made Equipment
 * unfindable.
 *
 * App Controls  Reminders | Notes | Programme
 * Settings      Profile | Conditions | Equipment | Display
 * About         Story | App | Data
 *
 * About was one 24,000-character panel and is now three, split by what
 * the content is rather than by length. Parameterised rather than split
 * into three functions, so the markup stays in one place and the version
 * lookup stays single.
 *
 * A one-panel section renders no tabs at all: one tab is not a choice.
 * Changing section resets to its first tab; in-section actions (Display
 * reset, reminders toggle) keep theirs.
 *
 * 12 Aug 2026 v308
 * SW-2. THE REASON THREE CORRECT FIXES DID NOT REACH THE DEVICE.
 *
 * The install handler used cache.add(url). cache.add fetches through the
 * BROWSER HTTP CACHE. GitHub Pages serves JS with a long max-age, so the
 * browser answered from its own store with a 200, and the worker wrote
 * that STALE FILE into the newly created v307 cache.
 *
 * Every version bump therefore produced a correctly-named cache full of
 * old code. SW-1 scoped lookups to the current cache and could not help,
 * because the current cache WAS the stale one. Graeme saw v307 in About
 * and pre-EQUIP-3 behaviour on screen and was right that patching was not
 * working -- EQUIP-3 is correct and verified against his real saved list;
 * it simply never arrived.
 *
 * It is also why "clear site data" appeared to fix things: that wipes the
 * HTTP cache, so the next install fetched genuine files.
 *
 * Now fetches with cache:"reload", bypassing the HTTP cache entirely.
 *
 * 12 Aug 2026 v307
 * EQUIP-3. The actual cause, after two fixes that were not.
 *
 * Graeme: "If I have stated that I have equipment then it needs to
 * register that I have it. That's simple... This shouldn't be a back and
 * forth problem like this."
 *
 * He was right. EQUIP-1 named the scope in the copy and EQUIP-2 added a
 * fallback between scopes. Neither touched the cause: THREE PARTS OF THE
 * APP USED THREE DIFFERENT NAMES FOR THE SAME OBJECTS.
 *
 *   Settings saves        dumbbells-heavy, kettlebell-light, exercise-bike
 *   Session screen offers dumbbells, kettlebells, bike
 *   Exercise database     dumbbell, kettlebell, exercise-bike
 *
 * Measured: of the 15 options on the session equipment screen, FIVE could
 * ever be ticked from a saved list, and those five matched by coincidence
 * of spelling -- barbell, pull-up-bar, foam-roller, treadmill,
 * rowing-machine. Graeme selected a full gym and saw exactly those.
 *
 * equipment-map.js ALREADY EXISTED and already reconciled two of the
 * three, wired into exercise selection on 11 Aug (CON-2). The session
 * equipment screen simply never asked it. Its own plural vocabulary is
 * now in that same map -- not a new file, because a second map is how a
 * fourth vocabulary starts -- and the screen resolves before comparing.
 *
 * A full gym now ticks 15 of 15.
 *
 * An override stays literal: those ids came from this screen's own
 * checkboxes, and resolving them would re-tick what somebody had just
 * unticked.
 *
 * 12 Aug 2026 v306
 * CONSENT-1. Graeme: "I consented because of the colour change on
 * continue, but the box should show a tick or be fully teal."
 *
 * The consent checkbox was styled with accent-color alone, which on a
 * dark background renders the native box as a hollow teal outline that
 * looks near-identical checked and unchecked. The only reliable signal
 * that consent had registered was the Continue button brightening -- a
 * different element, further down the screen, communicating by colour
 * alone. WCAG 1.4.1, on the one control in this app with legal weight.
 *
 * Now drawn explicitly: bordered empty box, filled with a tick when
 * checked. Three signals -- fill, tick, border -- so it survives
 * greyscale and low vision. The tick is a clip-path, needing no font and
 * no network request, because this screen appears on a first load before
 * anything else has cached.
 *
 * EQUIP-2. "Still not picking up home equipment." EQUIP-1 made the copy
 * honest -- "Here's your home kit" -- and no more useful, because his
 * home list is genuinely empty: he saved Full gym, a gym-scope facility,
 * and the session defaults to the home location. A truthful sentence
 * above an entirely unticked list still reads as the app having
 * forgotten.
 *
 * Now falls back to the other scope when the matching one is empty, and
 * says so. An empty list is not a safer answer than a slightly wrong
 * one: everything here is one tap to untick, while showing nothing costs
 * re-entering a whole gym.
 *
 * 12 Aug 2026 v305
 * SW-1. THE BUG THAT MADE EVERY OTHER FIX UNRELIABLE TODAY.
 *
 * The fetch handler used caches.match(request) -- a GLOBAL lookup across
 * every cache this origin holds, oldest first. So an old alongside-v2xx
 * cache could answer for settings.js while this worker was v304, and the
 * About screen would honestly report v304 while the page ran code from a
 * dozen versions earlier.
 *
 * That is precisely what Graeme reported: v304 in About, the old Settings
 * tab strip on screen, on a genuinely fresh fetch. Both true. The worker
 * answered from a cache the activate handler had not deleted yet, and a
 * hit is a hit.
 *
 * It also explains why "close it fully and reopen, maybe twice" kept
 * being the advice all day. That advice was never reliable: whether a fix
 * appeared depended on which cache answered first.
 *
 * Now scoped to CACHE_NAME, so only the current cache can answer and a
 * miss falls through to the network.
 *
 * 12 Aug 2026 v304
 * VER-2. The version indicator could report a build the page was not
 * running. VER-1 read caches.keys() and took the alongside-v entry, which
 * answers "which caches exist", not "which one is serving this page".
 * During an update both exist -- so Graeme saw v303 in About and the old
 * tab strip in Settings simultaneously. The worker now answers for
 * itself, over the message channel that already existed for SKIP_WAITING.
 *
 * NAV-6. Progress tile removed from Home. Graeme: "why do we have a
 * progress tile when we have a tab? You're right about it looking
 * cluttered." Correct -- it was the only tile duplicating a bottom-nav
 * destination, and Home had grown to eight.
 *
 * 12 Aug 2026 v303
 * NAV-5. Settings: three sections, not seven tabs.
 *
 * Graeme, device pass part 4: "Changing equipment and turning on session
 * notes really hard to find. Like really really hard." TWO of the three
 * things he could not find anywhere in the app were in here, both in the
 * FOURTH tab of a strip that scrolled with the scrollbar hidden -- so
 * Profile, Programme and Conditions sat off-screen with nothing saying
 * they existed.
 *
 * HIS GROUPING: "we divide into app controls, about, and settings." It
 * names a distinction the tabs never made. Programme (how often the coach
 * expects you) and Display (text size) sat adjacent as if they were the
 * same kind of thing. That missing rule is why Session notes ended up
 * appended to Equipment: Equipment was the smallest panel, 855 characters
 * and one control, so a behaviour toggle got filed by convenience. It now
 * has its own panel, in App Controls.
 *
 * WHY A LIST AND NOT HOME TILES, and this was the one place I pushed back
 * on his proposal: Home already carries eight tiles, ten would be a longer
 * list to scan, and About and App Controls are the least-used
 * destinations in the product. The actual failure was content scrolled
 * OUT OF VIEW, not Settings being hard to reach -- it is already one tap
 * from the bottom nav. Three rows, nothing off-screen, nothing can hide.
 *
 * Each row names what is inside, because "App Controls" alone does not
 * tell you session notes is in there, which is the exact problem.
 *
 * New tools/verify-nav5.mjs. settings.js v20 -> v21.
 *
 * 12 Aug 2026 v302
 * Device pass part 5.
 *
 * EQUIP-1 -- Graeme: "Even though in settings my equipment says full gym,
 * in the cardio, core, strength I have to select the equipment."
 *
 * The behaviour was correct and the COPY was not. Equipment is saved per
 * scope -- homeEquipment and gymEquipment are separate lists -- and the
 * session reads the one matching today's location, which defaults to
 * home. He had saved Full gym under the gym scope, so the session showed
 * his home list and looked like it had forgotten everything.
 *
 * "Here's what I think you have access to today" is true of either list
 * and therefore explains neither. Now names it: "Here's your gym kit" /
 * "Here's your home kit", and when the matching list is empty it says the
 * other one may exist rather than implying nothing is saved at all.
 *
 * COUNT-1b -- reflect.js's getSessionCount() counted every activityLog
 * entry, partials included. So a session opened and backed out of moved
 * somebody toward their next empathy prompt AND toward the next stage of
 * the arc. Now uses store.completedSessions(), matching Home, Progress
 * and Build Your Base.
 *
 * Checked and NOT a bug: buildSummary() has its own local sessionCount
 * meaning "this week", which looked like the empathy engine reading a
 * weekly figure. It is a separate variable for the summary line and is
 * never passed to the empathy code. Recorded so it is not re-raised.
 *
 * 12 Aug 2026 v301
 * CSS-2. Graeme, device pass part 4: "I also found lots of bad styling."
 *
 * His screenshots show the Yoga & Pilates practice picker, the Core
 * Session picker and both duration pickers rendering as plain centred
 * text -- no cards, no structure, sentences run together. Same fault as
 * the .ws-* family: valid markup, no rule, renders as a draft.
 *
 * New css/components/session-shared.css covering .cs-* (the pickers),
 * .gym-* (exercise lists) and .workout-header-title -- the last used 41
 * times, the largest single gap in the codebase, and the reason session
 * titles collide with the home icon on several screens. It had no width
 * constraint, so it ran under the fixed icon.
 *
 * verify-css.mjs ratchet tightened 157 -> 131, and both families locked
 * so they cannot regress whatever the budget says. 174 -> 131 across the
 * two passes.
 *
 * 12 Aug 2026 v300
 * Device pass part 4 continued. Three fixes.
 *
 * COUNT-1 -- Graeme: "7 out of 3 sessions registered on both home and
 * progress pages, but not in the 'Build your base' section which is the
 * reliable data. These need to match and I would guess the 'build your
 * base' data collection is correct."
 *
 * Correct diagnosis. Three surfaces, three rules: today.js and
 * progress.js counted EVERY activityLog entry including partials;
 * programmeEngine counted only genuine completions. So the two prominent
 * numbers were inflated by every session opened and abandoned, and the
 * accurate one was buried in a programme card.
 *
 * store.js v38 adds completedSessions() as the single definition, applied
 * at all four reads in today.js and both in progress.js. Two of those
 * matter more than the count: _sessionCompletedToday() drives "You moved
 * today, that's done", and _buildCoachLine() refers back to yesterday --
 * so the coach was claiming to have seen sessions that never happened.
 *
 * Partials stay IN activityLog. A partial is a real record; it is how the
 * app knows you started, and continuity reads it. It is simply not a
 * session you did.
 *
 * NAV-3 -- "Yoga was not easy to find... Can the yoga/pilates door be
 * offered in multiple places as well?" Yes. He searched Cardio/Core/
 * Strength, Mobility & Conditioning, Wellbeing and Library. Yoga lives
 * inside Mobility & Conditioning, which is reasonable and not findable --
 * somebody looking for yoga is not looking for "conditioning". Second
 * door added to Home; the original route stays. The same thing reachable
 * from more than one place is how people navigate.
 *
 * NAV-4 -- "Changing equipment and turning on session notes really hard
 * to find. Like really really hard." Both are in the Equipment tab,
 * FOURTH of seven, in a strip that scrolls with the scrollbar hidden --
 * so Profile, Programme and Conditions sat off-screen with nothing
 * saying so. Scroll-driven fade added at each edge. Does not fix seven
 * tabs, which is NAV-2's job; stops the strip actively hiding them.
 *
 * 12 Aug 2026 v299
 * EXIT-1. Device pass part 4. Graeme: "I started quite a few to see if it
 * was those. When I exited it asked me to save. I need to be able to exit
 * and not save. That's why my sessions have shot up, but I haven't done
 * any."
 *
 * session-guard.js has offered "Exit without saving" since 21 May 2026.
 * NINE views each built their own two-button exit dialog instead, and not
 * one of them included it. So opening a session to see what it was, and
 * backing out, ALWAYS wrote a partial activityLog entry.
 *
 * His Home read "7 of 3 this week" from sessions he had not done. That is
 * not a cosmetic count: exerciseHistory, continuity selection, burnout
 * detection and the weekly plan all read activityLog, so every one of
 * them was being fed sessions that did not happen.
 *
 * Nothing errored. Every dialog did exactly what it said it would.
 *
 * Discard added to all nine, wired to leave WITHOUT writing, and
 * navigating Home rather than to reflect -- there is nothing to reflect
 * on. Styled as the quietest of the three and asserted to stay below
 * "Exit and save progress", so somebody genuinely mid-session does not
 * lose work by reaching for the wrong one.
 *
 * New tools/verify-exit1.mjs.
 *
 * 12 Aug 2026 v298
 * LANG-1b. Graeme: "Do I need to do something with the audit or have you
 * applied the fix to the findings?"
 *
 * Answer was: 6 fixed, 85 left to him. Over-cautious -- the same fault as
 * manufacturing open questions, making work for him that could be done
 * here. Re-examined every instance in context:
 *
 * FIXED NOW: "brace your core" (2) and proprioception (3, glossed on use
 * the way AMRAP already is).
 *
 * FALSE POSITIVES, removed from the audit: AMRAP and EMOM are ALREADY
 * glossed on first use -- "Complete as many rounds as possible (AMRAP)".
 * They are defined terms, not jargon. v1 also counted matches in id, name
 * and youtube fields, which nobody reads as prose.
 *
 * The remaining 92 genuinely need Graeme's voice, and the audit now says
 * WHY per term rather than just listing them -- "eccentric" is not simply
 * "the lowering part" in every context, "bilateral breathing" is the
 * actual name of a swimming technique, and "hip hinge" may be a word his
 * audience already has. A wrong plain-English substitution can change
 * what the exercise asks for.
 *
 * 12 Aug 2026 v297
 * Device pass part 3. Graeme: "Audit for plain language. Standing, 2
 * point, 3 point start is confusing. Also, lack of clarity on
 * instructions for the exercise about sudden changes of pace."
 *
 * LANG-1. Both fixed, and the stance jargon was six instances not one --
 * "athletic position" and "3-point stance" across sport_conditioning.js,
 * an American-football term in a product for people who have been failed
 * by fitness culture. All six now describe the position instead of naming
 * it.
 *
 * Change of Pace Run: the timings were always in `instructions`, which
 * Graeme could not see because the session OVERVIEW shows only a name and
 * a duration. But he found a real gap in them regardless -- the surge
 * timing was "vary the timing, no rhythm", which is deliberate and reads
 * as an omission. Now says so explicitly: "somewhere between 20 and 60
 * seconds in, and it is your call when". His own suggestion, and right:
 * naming the vagueness beats leaving it to look like a gap.
 *
 * 85 further instances across the database are documented in
 * Documents/Admin/alongside_plain_language_audit_12aug2026_v1.md and
 * deliberately NOT auto-fixed -- each needs a replacement in Graeme's
 * voice, and a wrong plain-English substitution can change what the
 * exercise actually asks for.
 *
 * 12 Aug 2026 v296
 * Device pass part 2. Two fixes and a new gate.
 *
 * CSS-1 -- Graeme, on the run type picker: "Image 1 is unstyled. We need
 * to audit all pages. This was a previously known issue in Library."
 *
 * He was right that it is a class of problem rather than one screen.
 * Auditing every class rendered by a view against every class defined in
 * CSS found 174 with NO RULE ANYWHERE -- including the entire .ws-*
 * family, so walk, run, cycle and swim rendered as unstyled text on every
 * screen of all four.
 *
 * Nothing errors. A class with no rule is not a bug to any tool: the
 * markup is valid, the JS runs, the screen appears. It just looks like a
 * draft, and the only detector was somebody opening it.
 *
 * New css/components/single-activity-session.css, precached. Styled to
 * existing patterns rather than a fifth visual language: choice cards
 * follow .ci-choice, the prompt follows .gmoment.
 *
 * DISP-4 -- Graeme: "where I increase text size in settings/display the
 * things like week plan then need to be slideable like the settings
 * tabs." The week strip was grid-template-columns: repeat(7, 1fr), which
 * forces seven days into the viewport whatever the text size, so at 130%
 * Sat and Sun were simply unreachable. A fixed column count and a
 * user-controlled type scale cannot both be satisfied, and it should not
 * be the text size that gives. Now scrolls with snap, exactly as he
 * suggested. At default scale all seven still fit.
 *
 * New tools/verify-css.mjs: a RATCHET, budgeted at the current 157 rather
 * than zero. 174 cannot be fixed in one pass and a gate that fails from
 * day one gets switched off. It can only go down.
 *
 * 12 Aug 2026 v295
 * Device pass, parts 0 and 1. Four fixes.
 *
 * SB-META -- worst of the four, and unflagged. The session overview
 * printed the literal word "undefined": "Fire Hydrant undefined sets
 * 1.5 min undefined". Every field was interpolated unguarded, and not
 * every exercise has sets or a tempo -- a timed hold has a duration and
 * nothing else. The database was honest; the rendering was not. This is
 * the screen where somebody decides whether the coach knows what it is
 * doing.
 *
 * VOICE-2 -- Graeme: "The writing in the red circles, are these the
 * coach? Could they be teal?" Yes. .sb-section-why carries the coach's
 * own section reasoning and was --text-xs in --color-text-secondary --
 * smaller and greyer than the exercise names, the same treatment as the
 * "Warm-up" label above it, which is chrome. So on the one screen where
 * the coach explains itself, it looked like furniture. Now teal at
 * --text-sm. NOT gold: gold is the paid-tier marker family-wide and this
 * is free-tier content, so gold would imply the rationale is something
 * you pay for.
 *
 * CI-SPACE -- Graeme: "a lot of unnecessary dead space in check-in and
 * writing disappears off the page... leave a gap for the slides to pop
 * over the top, but bring the writing down." Cause was block:"start" on
 * every message, added 11 Aug for the opposite complaint. Now decided per
 * message: short ones anchor to the bottom so they sit above the panel,
 * tall ones anchor to the top so nothing is cut off. Trailing space 70vh
 * -> 46vh, which is the panel clearance. The two numbers are gated
 * against each other.
 *
 * VER-1b -- yesterday's version fix shipped as "vv294". The cache name
 * already carries its v; the template added another.
 *
 * 12 Aug 2026 v294
 * VER-1, found while writing the device pass instructions.
 *
 * Step 0 of that document says "check Settings > About shows v293".
 * Checking whether that was possible: the About screen's APP_VERSION was
 * HARDCODED to '115' while the cache was at 293. 178 versions of drift,
 * on the only surface that tells anybody which build their phone is
 * running.
 *
 * So every "are you on the latest?" check during device testing has been
 * meaningless -- and settings.js's own v86 note records exactly that
 * confusion happening ("on the latest version, phone was still showing
 * old, unstyled"). The tool for diagnosing stale builds was itself stale.
 *
 * Now read from the running service worker's cache name rather than
 * restated, and shows "unknown" instead of a confident wrong number if it
 * cannot be read. settings.js v19 -> v20. Cache bump only.
 *
 * 12 Aug 2026 v293
 * FEED-1. The LAST reader-without-a-writer on the board.
 *
 * applyFeedbackWeighting() has read exerciseFeedback since v1.3 and
 * nothing ever wrote it, so the weighting has never once run on real
 * data -- it takes the array, finds it empty, and returns the pool
 * untouched. store.logExerciseFeedback() was even built for it in v20.
 * The response existed; the capture never did. Fifth confirmed instance
 * of the pattern, and the last one open.
 *
 * New js/exercise-feedback.js, precached. Two buttons on the exercise
 * card in workout, core-session, prescribed-session and gym-programme.
 *
 * NOT A RATING. No stars, no scale, no "out of 10" -- the skip/dislike
 * spec section 6 settled that, and "Not a fan of this one" already
 * follows it, so this matches that pattern rather than inventing a
 * second vocabulary for the same card.
 *
 * NO "ABOUT RIGHT" THIRD OPTION: silence already means that, and a third
 * button turns an optional aside into a question on every exercise,
 * which is measurement pressure.
 *
 * store.js v36 -> v37 adds clearExerciseFeedback(), so tapping the
 * button already set undoes it -- the same undo "Not a fan" offers. A
 * signal you cannot withdraw is one people stop giving. It clears ALL
 * entries for that id, since leaving four of five behind would make the
 * undo silently do nothing.
 *
 * The control repaints itself rather than needing a view re-render: only
 * gym-programme has a re-render function of the right shape, and
 * inventing one in three views for a two-button control would be the
 * tail wagging the dog.
 *
 * P4: two of the last five are needed before selection moves anything,
 * so one hard day changes nothing, and nothing is ever displayed back.
 *
 * 12 Aug 2026 v292
 * QUIET-1. quiet-session.js logged no exerciseIds at all, so no breathing
 * pattern or mindfulness practice ever became familiar -- the same gap
 * CONT-3 closed for core and yoga. "Something like last time" could never
 * offer somebody the breathing pattern they actually use.
 *
 * The cause was an id split: this file uses short local ids ("box",
 * "478", "sigh") while the database uses full ones (box-breathing,
 * four-seven-eight-breathing, physiological-sigh). Every one has a
 * database equivalent; only the id differed. Mapped rather than renamed,
 * because renaming the local ids would touch phase data, rendering and
 * resume state for what is a logging fix. Unmapped practices log no id at
 * all rather than a local one that matches nothing.
 *
 * NOT migrated wholesale: the breathing patterns legitimately live in
 * this view -- they are phase timings and coach intros, which the
 * database does not hold -- and unlike yoga-session they carry no
 * contraindications and no watchOut, so there is no safety divergence to
 * fix. Scoped to the actual bug.
 *
 * 12 Aug 2026 v291
 * DATA-1b. v290 fixed ONE OF TWO ENGINES.
 *
 * Graeme asked whether DATA-1 was genuinely fixed. It was not.
 * session-builder.js had the new rule; workoutGenerator.js is a separate
 * engine that draws its pool from getSuitableExercises(), and that had NO
 * exclusion of any kind -- not for practices, not for length. Measured:
 * 340 exercises returned, of which 71 were 10+ minutes and 89 tagged
 * 'practice'. A generated workout could hand somebody a 30-minute Brisk
 * Walk as one of its items.
 *
 * isSessionLength() now lives once in data/exercises/index.js and is
 * applied inside getSuitableExercises() as step 0 -- before equipment and
 * conditions, so every count downstream is honest. session-builder.js
 * imports the same function rather than keeping its own copy, because a
 * second copy is exactly how two engines drift, and drift is the fault
 * this rule exists to catch.
 *
 * After: both pools contain zero long entries and zero practices. The 167
 * standalone entries remain reachable through the Library, Mobility &
 * Conditioning and the single-activity views, which do not come through
 * getSuitableExercises().
 *
 * 12 Aug 2026 v290
 * DATA-1, and it was the opposite of what the schedule said.
 *
 * The entry described contentType as "written on 368 of 556 entries and
 * read by nothing" and called retiring it "a clean standalone task".
 * Both halves were wrong. It is read in two live places -- and the real
 * fault was not dead weight but a rule that FAILS OPEN:
 *
 *   158 of 526 entries carry NO contentType at all, and the exclusion is
 *   `ex.contentType === "practice"`, so a missing value passes.
 *
 * 28 of those are 10-30 minute pieces of whole content: Brisk Walk (30
 * min), Steady Cycling (30), Treadmill Incline Walk (30), Walk-Run
 * Intervals (30), HIIT 30:30 (15), swim drill sets (10-15). Every one was
 * eligible to be picked as ONE OF FIVE components -- so a 20-minute
 * session could be built around a 30-minute walk.
 *
 * ELEVEN OF THE 28 ARE TAGGED `exercise`, CORRECTLY, AND WERE STILL
 * WRONG. That is why this is a structural rule and not more tagging: no
 * amount of correct tagging fixes a rule that fails open.
 *
 * session-builder.js now excludes anything with duration >= 600s from
 * component selection, whatever it is tagged. 600 and not 300, because
 * several legitimate components run to five minutes. 388 timed components
 * remain eligible.
 *
 * New tools/verify-data1.mjs. Cache bump only.
 *
 * 12 Aug 2026 v289
 * BURN-2. The coach and the session no longer disagree.
 *
 * BURN-1 made the recovery path reachable. Verifying it end-to-end turned
 * up the next-order fault: THREE independent definitions of burnout, in
 * three files, all feeding the same decision.
 *   detectBurnout()     data/checkin.js       average energy over 5 days
 *   isBurnoutRisk()     coach-reflection.js   3 of last 4 days low
 *   sustainedDifficulty reflect.js            3 of last 5 low
 *
 * Traced across five scenarios, TWO contradicted: the generator narrowed
 * the exercise pool while coach-reflection returned false, so the session
 * quietly got easier and the coach said nothing. Somebody flat at 4s all
 * week got a shorter, gentler session with no explanation.
 *
 * That is a P4 failure rather than a logic one. Silence on a drop is only
 * credible if there is also silence on a rise -- and here the app was
 * deciding somebody was fragile behind their back.
 *
 * isBurnoutRisk() now defers to detectBurnout() rather than becoming a
 * fourth definition, and speaks at the same threshold that starts
 * changing the session. The message is graded too: 'high' narrows the
 * pool and proposes rest, 'moderate' only steps intensity down, and
 * saying the same thing for both would either overstate a flat week or
 * understate a fortnight of exhaustion.
 *
 * reflect.js's sustainedDifficulty deliberately left alone: it selects an
 * empathy prompt rather than shaping a session. Different question.
 *
 * New tools/verify-burn2.mjs. Cache bump only.
 *
 * 12 Aug 2026 v288
 * BURN-1. Found by tracing the perimenopause persona -- somebody whose
 * whole profile is unpredictable energy, and precisely who burnout
 * detection exists for.
 *
 * TWO FAULTS, STACKED, neither of which errored:
 *   1. workoutGenerator.js:543 called checkinData.detectBurnout() with NO
 *      ARGUMENT. The function returns false on its first line for a
 *      missing history, so it returned false every time, for everybody,
 *      since the day it was written.
 *   2. Seven places in workoutGenerator.js then read burnout.level. On a
 *      boolean that is undefined, so every comparison was false --
 *      including recoveryMode: burnout.level === "high", which is what
 *      gates filterToRecoveryPool() in exercises/index.js:334.
 *
 * The entire recovery path was unreachable. Somebody could report a
 * fortnight of exhaustion and the generator would build as if nothing had
 * been said. The shape mismatch hid the missing argument and the missing
 * argument hid the shape mismatch.
 *
 * detectBurnout() now returns { level: none|moderate|high, avgEnergy },
 * which is the shape its callers were already written for -- they were
 * right and the function was wrong. It also defaults to reading the store
 * when called without an argument, so fault 1 cannot recur silently.
 * coach-proposal.js adapted: it tested truthily, and an object is always
 * truthy. 4 is kept as the outer threshold so nobody who registered
 * before stops registering.
 *
 * New tools/verify-burn1.mjs. Cache bump only.
 *
 * 12 Aug 2026 v287
 * BIAS-1. proposalBias is finally read. coach-reflection.js has computed
 * it since 03 Aug -- 'rest' or 'lighter', from severe pain, burnout risk,
 * consecutive training days and returning after time away -- written it
 * to the store, and nothing consumed it. Nine days.
 *
 * The consequence was not a crash. The coach could privately conclude
 * that today should be lighter because somebody is in a burnout pattern,
 * SAY SO in the reflection, and then hand them exactly the session their
 * energy score alone suggested. It knew, said it, and did not act on it.
 *
 * data/checkin.js gains resolveIntensity(), combining todayIntensity
 * (from energy alone) with the bias. 'lighter' steps ONE notch, so a good
 * day in a burnout pattern becomes moderate rather than being overridden
 * to low -- P7, authority never scales. workoutGenerator.js reads the
 * resolved value. store.js v35 -> v36 declares and validates the field,
 * which had never been in the file at all. Schema.md v1.29 -> v1.30.
 *
 * New tools/verify-bias1.mjs, failing 8 assertions on the pre-fix code.
 *
 * 12 Aug 2026 v286
 * PT-6 / PT-3. Four views wrote straight into activityLog, bypassing
 * store.logActivity() and losing all three of its guards: the 10-second
 * dedupe window built after the B3-3 duplicate-write bug, the
 * empty-partial guard added after Graeme backed out of a session and it
 * saved anyway, and the exerciseHistory write.
 *
 * breathing-session.js, quiet-session.js (x2), activity-log.js,
 * morning-session.js (x2). Single write path restored - reflect.js is
 * the only remaining store.set("activityLog"), and it UPDATES an existing
 * entry rather than creating one, which is correct.
 *
 * PT-3 AT ITS SOURCE. All four also wrote `duration` and `loggedAt` where
 * progress.js reads `durationMins` and `completedAt`, so every mindful,
 * breathing, morning and self-logged session counted as ZERO MINUTES.
 * activity-log.js is the worst of those: it is the screen where somebody
 * manually tells the app about a swim or a long walk they were pleased
 * with, and the app then did not hear it.
 *
 * morning-session.js had a LOCAL function called logActivity(), which
 * shadowed the store method and made the file read as compliant to any
 * grep for the name. Renamed _saveMorningSession(). Its justification
 * comment - "consistent field naming within a single file" - is marked
 * superseded: nothing reads a file, and that was the wrong unit of
 * consistency.
 *
 * New tools/verify-pt6.mjs, which fails 6 assertions on the pre-fix code
 * and specifically checks that no view shadows logActivity() again.
 *
 * 12 Aug 2026 v285
 * VOICE-1. Six therapy/self-help phrases removed from LIVE copy, and a
 * gate added so this stops depending on Graeme spotting them.
 *
 * He flagged "sits with you" in a draft. It was also live -- on the
 * day-one opening shown to somebody who had just chosen "there's a longer
 * history than any of that", which is the most delicate line in the
 * product. Five more alongside it:
 *
 *   "I want you to sit with that"      -> "That is worth stopping on"
 *   "How does that sit with you?"      -> "How do you feel about that?"
 *   "how you're reflecting on that"    -> "how you feel about that"
 *   "needs revisiting / sits with you" -> "needs going into / how you feel"
 *   "showing up for yourself"          -> "you keep coming back"
 *   "the first part of your journey"   -> "the first few weeks"
 *
 * The last is also a copy rule 10.1 breach -- "journey" is on the banned
 * internal-terms list and had been sitting in onboarding's final screen.
 *
 * tools/verify-voice.mjs checks user-facing STRINGS only. Class names,
 * function names and internal tags are not copy, and physical cues are
 * exempt: "Sit with legs extended" is a yoga instruction and "let gravity
 * do the work" is about not forcing a stretch. A gate that flagged those
 * would be switched off within a week.
 *
 * Cache bump only.
 *
 * 12 Aug 2026 v284
 * CORE-1. Graeme's call: allow dead-bug and bird-dog, but say something
 * when a condition is flagged.
 *
 * Built the P7 way rather than the generic way. "Listen to your body" on
 * its own is exactly the hedge P7 warns against -- a coach told a
 * specific area is sore, that knows this exercise loads it, and then says
 * something vague, is pretending not to know.
 *
 * Two levels, matching P7's existing three-level model:
 *   KNOWS SPECIFICALLY  bird-dog works the lower back -> names it
 *   KNOWS GENERALLY     dead-bug works core/abs, not the back -> steers
 *                       without naming, because naming an area this
 *                       exercise does not work would be the coach
 *                       claiming knowledge it does not have
 *   KNOWS NOTHING       silent
 *
 * The first version only did the named level, which left Graeme's exact
 * case -- sore back, doing Dead Bug -- silent.
 *
 * session-rationale.js gains bodyCaution() and soreAreaLoaded(), lifted
 * out of progressionInvitation() which returned early when no previous
 * lift was logged: a first-time exercise, when somebody is least sure,
 * got nothing. Alias table de-duplicated so the two rules cannot drift.
 *
 * Rendered on workout, core-session, prescribed-session and
 * gym-programme, beside watchOut. Styled as a note, never a warning --
 * amber would make an ordinary sore knee look like an injury, and
 * somebody who sees a warning every session stops reading them.
 *
 * New tools/verify-core1.mjs. Cache bump only.
 *
 * 12 Aug 2026 v283
 * YOGA-1 -- a SAFETY fix, found by chasing a stale schedule entry.
 *
 * yoga-session.js carried its own copy of 19 poses including their
 * contraindications, and 16 of the 19 had diverged from the exercise
 * database -- always toward being LESS cautious:
 *
 *   Downward Dog     view: knee, hip
 *                database: shoulder, wrist/elbow, hamstring
 *   Pilates Hundred  view: none at all
 *                database: abdominals, lower back
 *   Warrior 3        view: ankle/foot, knee
 *                database: ankle/foot, glutes, hamstring, lower back
 *
 * Nothing failed. Sessions built, poses rendered, and somebody with an
 * acute wrist injury was quietly offered a full weight-bearing wrist
 * pose, because a fix applied to the database never reached this file.
 * watchOut, present on 19 of 19 since CON-3, reached none of them.
 *
 * Contraindications and watchOut now resolve from the database at build
 * time, BEFORE the safety filter runs. Sequence timing and cues stay in
 * the view, where they belong. yoga-session.js v4 -> v5.
 *
 * verify-decisions.mjs's P5 check was widened first: it matched on
 * equipment + movementPattern, which is what a strength entry looks like,
 * so 30 pose entries walked through the check written that morning to
 * catch them. Now matches on id + name, the weakest shared signal.
 *
 * New tools/verify-yoga1.mjs. Cache bump only.
 *
 * 12 Aug 2026 v282
 * DISP-3 and LOG-4, plus a stop on DATA-1.
 *
 * DISP-3: 19 declarations were below the app's OWN stated minimum.
 * variables.css says "minimum xs 13px for readability on health app" and
 * these ran at 9px, 10px, 11px and 0.6rem -- feel-scale labels, badges,
 * day names, durations. All readable content, none decorative. Raised to
 * var(--text-xs) and gated, so the app's own standard is now enforced
 * rather than merely stated.
 *
 * LOG-4: walk, run, cycle and swim capture distance (lengths for swim)
 * plus a note, on their completion screens. Duration deliberately
 * omitted -- all four run a live clock and write durationMins already,
 * and asking somebody to type a number the app knows is what makes an
 * app feel like paperwork. A stable synthetic id per activity means
 * "last time you walked" is a real comparable note.
 *
 * DATA-1 NOT DONE, and must not be: see the schedule. contentType is
 * read in two live places, so retiring it would make 140 standalone
 * practices selectable as session components.
 *
 * 12 Aug 2026 v281
 * DISP-2. 110 hardcoded font-sizes across 20 stylesheets now respond to
 * the text-size control. Each wrapped as calc(X * var(--user-text-scale,
 * 1)) -- mathematically identity at the default, so nothing changes
 * visually for anybody who never opens the control, and the original
 * value stays legible in the source.
 *
 * DISP-1 shipped with 514 token-based sizes scaling and these 110
 * ignoring the slider. Somebody scaling text up got most of the app
 * larger and a scattering of labels, badges and headings stubbornly
 * unchanged -- which is arguably worse than nothing scaling, because it
 * looks broken rather than unsupported.
 *
 * Gated: verify-disp1.mjs now fails if any hardcoded font-size reappears
 * outside variables.css.
 *
 * SEPARATE FINDING, not fixed here: 20-odd of those declarations are
 * BELOW the app's own --text-xs of 13px -- 9px, 10px, 11px, 0.6rem --
 * mostly in global.css, morning-session.css and weekly-plan-v2.css. They
 * now scale, so somebody can enlarge them, but they are too small by
 * default. Raised as DISP-3.
 *
 * 12 Aug 2026 v280
 * Four items from the verified-open list, all silent failures.
 *
 * PRESC-1 (new, found while doing CONT-3): completeSession() in
 * prescribed-session.js never logged anything. It awarded credits and
 * navigated away, so a FINISHED prescribed session -- the coach's own
 * condition-specific recommendation -- was recorded only if ABANDONED,
 * and then only as partial. Now logs as completed, with a session clock
 * added since the file had none (PT-3's problem, in a file PT-3 never
 * scoped).
 *
 * CONT-3: core-session, yoga-session and prescribed-session logged an
 * exercise COUNT and never the ids, so store.recordExercises() never
 * fired for them and exerciseHistory never learned a single core
 * exercise or yoga pose. Continuity-aware selection and the drop-in
 * coach question's 21-day window could not see any of it.
 *
 * LOG-3: session notes now reach core-session and prescribed-session.
 * Physio-prescribed work is where a note matters most -- "3kg felt fine,
 * 4kg pulled" is exactly what somebody needs at their next appointment
 * and cannot reconstruct afterwards.
 *
 * PT-5: store.logSession() removed. Zero callers. progressLog itself
 * stays, live. store.js v34 -> v35.
 *
 * New tools/verify-cont3.mjs, which fails 8 assertions on the pre-fix
 * code. Cache bump only, no new files.
 *
 * 12 Aug 2026 v279
 * SCHEME-1. Colour scheme control: dark (default), light, high contrast.
 *
 * Dark remains the product and the design intent -- Graeme, 12 Aug: "I
 * must insist on dark mode default with the potential for adaptations by
 * the user." Light and high contrast are adaptations somebody chooses,
 * and nothing changes for anyone who does not.
 *
 * Logic from the DPC Hub settings file he supplied; none of its values,
 * because that product is light-by-default and this one is not -- its
 * "dark theme" is this app's normal state.
 *
 * Light exists because light-on-dark smears for people with astigmatism
 * and light sensitivity runs both ways. For an audience of neurodivergent
 * adults, people navigating hormonal change, and people with chronic
 * conditions, display mode is functional rather than cosmetic.
 *
 * High contrast was previously reachable ONLY via
 * @media (prefers-contrast: high) -- i.e. only if somebody had already
 * found their OS setting. That query is kept; the scheme makes it
 * choosable.
 *
 * variables.css v3 -> v4, display-prefs.js v1 -> v2, settings.js v18 ->
 * v19, display-preferences.css v1 -> v2, index.html pre-paint script
 * extended. tools/contrast-check.mjs v1 -> v2 now runs the full matrix
 * against ALL THREE schemes -- every pairing measured, worst 4.68:1.
 * Cache bump only, no new files.
 *
 * 12 Aug 2026 v278
 * DOOR-1, and a stale-code correction that matters more than the feature.
 *
 * IN STEP WAS GATED BEHIND isPremium() AND SHOULD NOT HAVE BEEN. It was
 * Personal tier in the 9 Aug build; the 12 Aug tier decision made it free
 * (Destination Architecture sections 9 and 18) and the code never
 * followed. So the single best demonstration of what this product is for
 * was invisible to exactly the people it was written for. Ungated.
 *
 * DOOR-1: the offer from Destination Architecture section 9 now exists,
 * verbatim, at the end of an In Step scenario -- "the best door in the
 * product, because someone who has just finished a scenario has FELT the
 * shape of the thing." Helper layer, visibly distinct from the coach
 * (P1/P2), shown to free users only.
 *
 * noticing.js, in-step.js, new css/components/upgrade-door.css,
 * main.css v18 -> v19.
 *
 * 12 Aug 2026 v277
 * GM-1 completion. Grounding moments wired into yoga-session.js v3 -> v4.
 * Yoga is the natural home for these: it is already the frame, and a pose
 * held still is exactly the plank case Graeme described. Cache bump only.
 *
 * Recorded because it caused real friction: three items were re-raised as
 * open questions after Graeme had already settled them -- the 20 texts
 * (approved), In Step's relationship to the free tier (agreed 9 Aug), and
 * yoga (agreed earlier the same day). Restating settled decisions as open
 * ones wastes his time and makes finished work look unfinished. Check the
 * record before asking.
 *
 * 12 Aug 2026 v276
 * GM-1. Grounding moments. New js/data/grounding-moments.js and
 * css/components/grounding-moments.css, both precached. store.js v33 ->
 * v34 and Schema.md v1.28 -> v1.29 add the `grounding` field.
 * workout.js v11 -> v12 renders them. main.css v17 -> v18.
 *
 * Twenty moments across seven movement families, matched from fields
 * every exercise already carries rather than a new field on 550+ entries.
 * No research cited anywhere in the feature, per Graeme 12 Aug: claim,
 * why, and what to look out for -- the product does not argue from
 * papers. Nothing promises an outcome.
 *
 * 12 Aug 2026 v275
 * LOG-2. Session notes on yoga poses, in "gentle" mode -- duration and a
 * free note only, no reps and no level. Graeme, 12 Aug: a pose is not a
 * set, and counting reps there would import the frame the practice exists
 * outside of. session-log.js v1 -> v2 gains the mode; yoga-session.js
 * v2 -> v3 uses it. Cache bump only, no new files.
 *
 * 12 Aug 2026 v274
 * LOG-1. Session notes. Graeme: "Weight notes should be on. But not just
 * weight. Time, tension, elevation etc."
 *
 * The store already did all of it -- store.js v28 generalised logLift()
 * to nine metrics on 11 Aug, and the field set already adapted to the
 * equipment. What was missing was REACH and TRUTH. The block lived inside
 * gym-programme.js, so of eleven session views exactly one offered it;
 * and Settings called it "Weight notes -- jot down what you lifted",
 * describing a narrower feature than existed.
 *
 * New js/session-log.js and css/components/session-log.css, both
 * precached. gym-programme.js v3 -> v4 now imports rather than owns it
 * (its private copies and its .gp-lift CSS removed, not left dead).
 * workout.js v10 -> v11 gains it -- the main coach-built session
 * previously offered no way to write anything down at all. settings.js
 * v17 -> v18 renames it "Session notes" with copy naming the real
 * metrics. main.css v16 -> v17. New tools/verify-log1.mjs.
 *
 * Deliberately NOT added to breathing-session.js or quiet-session.js:
 * those are restoration, and a metrics box on a screen whose purpose is
 * to stop measuring would contradict the product.
 *
 * 12 Aug 2026 v273
 * C1 copy corrected. v272 rendered Graeme's supporting sentence as the
 * question itself; he meant the question as the heading with that
 * sentence beneath. views/onboarding/lifestyle.js v4 -> v5,
 * css/layouts/onboarding-additions.css gains .lifestyle-group__sub.
 * The question copy is now defined once and shared by both render sites
 * rather than duplicated. Cache bump only.
 *
 * 12 Aug 2026 v272
 * C1 second half. The conditional leg question is built and live -- the
 * last outstanding half of the safety fix that has been held since 12 Aug
 * pending sign-off on its wording, because a question about whether
 * somebody's legs work is the most sensitive in the product. Wording
 * agreed with Graeme; optional, with "I'd rather not say".
 * views/onboarding/lifestyle.js v3 -> v4, store.js v32 -> v33,
 * Schema.md v1.27 -> v1.28, new tools/verify-c1.mjs.
 *
 * A REAL HOLE was found while making the question optional, and optional
 * would have opened it: the question fires when chairRise !== 'yes', but
 * the fail-safe only triggered on needsSeated (chairRise === 'no'). So
 * somebody who said getting out of a chair is NOT EASY, then declined the
 * question, fell through to legPower 'full' and fully loaded leg work --
 * the original C1 bug, one answer to the left. The default now covers
 * exactly the people the question is asked of. Cache bump only.
 *
 * 12 Aug 2026 v271
 * EMP-2. Closes the two gaps EMP-1 raised, both of which turned out to be
 * code rather than content -- EMP-1's "needs Graeme, not code" framing was
 * wrong and is corrected in each file's own header.
 * (1) "The coach made visible adjustments" is now evaluable:
 * session-builder.js v22 -> v23 writes session.rationale.adjusted, and
 * reflect.js v4 -> v5 reads it, date-guarded.
 * (2) Stage 5's missing catch-all needed no new prompt. Every stage header
 * in empathy-transfer.js already carried a session range and nothing read
 * them; stage advance counted firings only, so stage 5 was entered around
 * session 77 against a documented 85+ where every prompt gates at 85 or
 * higher. STAGE_SESSION_FLOOR now enforces the file's own ranges.
 * empathy-transfer.js v2 -> v3. Re-simulated over 160 sessions: stage 5
 * entered at 89, zero fallbacks. Cache bump only.
 *
 * 12 Aug 2026 v270
 * INF-CACHE: 25 of 98 JS modules and 15 CSS files were missing from
 * SHELL_URLS, found while adding data/empathy-transfer.js. All added, so
 * SHELL_URLS now covers every js and css file on disk.
 *
 * SEVERITY, stated accurately after checking the fetch handler rather
 * than assumed: this is NOT "offline was broken". The handler is
 * cache-first then network-and-cache, so an unlisted file is fetched and
 * cached the first time it is used online. The real exposure is a route
 * the person has never opened, opened for the first time with no signal
 * -- tapping Upgrade in a basement gym, or a session type never tried
 * before. Precaching makes it guaranteed rather than incidental.
 *
 * Three dead entries removed: swimming-cycling.js and sport-conditioning.js
 * were listed with hyphens where the real files use underscores, so those
 * two exercise categories never cached while appearing to; views/about.js
 * outlived its file. allSettled meant all three failed silently.
 *
 * EMP-1, condition-aware empathy selection. Prompts were chosen by
 * pool[atStage % pool.length] -- rotation -- while reflect.js held, at
 * that exact moment, the person's answers to how the session felt,
 * whether pain was worse, and mood after. It used none of them.
 * data/empathy-transfer.js v1 -> v2 (prompts become objects carrying
 * their own conditions; all 21 strings byte-identical, verified by
 * assertion; new matcher). views/reflect.js v3 -> v4 (context builder;
 * cadence untouched -- this changes WHICH prompt fires, never WHETHER).
 * store.js v31 -> v32 and Schema.md v1.26 -> v1.27 for empathyLastPrompt,
 * without which the repeat cap could never trigger. New
 * tools/verify-empathy.mjs. No new files to cache; both changed modules
 * were already in SHELL_URLS. Cache bump only.
 *
 * 12 Aug 2026 v269
 * DISP-1, display preferences. New Settings > Display tab: text size,
 * line spacing, letter spacing, underline links, stronger focus outlines.
 * New js/display-prefs.js and css/components/display-preferences.css,
 * both added to SHELL_URLS. css/base/variables.css v2 -> v3 (the --text-*
 * and --leading-* tokens now multiply a user scale; the dead
 * @media (prefers-larger-text) block removed - not a real media feature,
 * never matched). css/main.css v15 -> v16. js/views/settings.js v16 -> v17.
 * index.html gains an inline pre-paint script so preferences apply before
 * first paint instead of flashing. css/base/reset.css: .sr-only aliased
 * to .visually-hidden (A11Y-3 - seven elements used a class that was
 * never defined, five of them holding text meant to be heard not seen).
 * New tools/verify-disp1.mjs. Defaults are exactly 1/1/0em, so nothing
 * changes for anyone who never opens the tab.
 *
 * 12 Aug 2026 v268
 * A11Y-2. The html.light-mode block removed from css/base/global.css and
 * archived to Documents/Archive/ with its reasoning. It was unreachable
 * (no JS or HTML ever set the class, no Settings toggle despite the
 * comment claiming one) and would not have worked if it had been:
 * six tokens never overridden, so light text sat on a dark
 * --color-bg-elevated at 1.19-2.06:1 across 56 rules. Also removes
 * --color-bg-surface, a token defined only inside that block and read by
 * nothing. Zero live effect - every rule was scoped under a class that
 * has never been applied. Light mode remains wanted as a scoped beta
 * feature; see the archive note. Cache bump only.
 *
 * 12 Aug 2026 v267
 * A11Y-1. css/base/variables.css v1 -> v2: --color-text-secondary and
 * --color-text-muted lightened so both clear AA on --color-bg-elevated,
 * the lightest surface in the palette. 56 rules set an elevated
 * background and 15 put secondary or muted text on it, measuring 4.30
 * and 3.91 against a 4.5 floor; --color-bg-hover is the same value, so
 * every card hover state was affected too. Fixed at the token, not in 15
 * places. css/components/checkin-conversation.css v8 -> v9: corrects the
 * measurements in its own header, which the token change invalidated.
 * New tools/contrast-check.mjs gates the whole matrix. Cache bump only.
 *
 * 12 Aug 2026 v266
 * The two "logged, not fixed" items from DIC-1, actually fixed. Graeme
 * pushed back on the logging and was right: touch-once means a file
 * appears in one session's scope, not that scope can never grow, and
 * neither store.js nor Schema.md had been opened this session. The rule
 * was being used as a reason rather than applied as one.
 * js/store.js v30 -> v31: set() now lazily inits the way get() already
 * did. Documents/Live State/Schema.md v1.25 -> v1.26: DOC-2, the front
 * page said store.js v30 in the header and v21 four lines later.
 * Cache bump only, no new files.
 *
 * 12 Aug 2026 v265
 * DIC-1, the drop-in coach question. js/views/checkin.js v13 -> v14 (the
 * question, its 21-day gate, and the sessionVariety write - sessionVariety
 * was a reader without a writer, so selection has been running on a default
 * nobody chose). css/components/checkin-conversation.css v7 -> v8 (new
 * .ci-choice buttons; recessed rather than elevated surface, because the
 * nearest existing pattern fails AA on its sub-line). No new files - cache
 * bump only. No store schema change.
 *
 * HEADER GAP, recorded honestly rather than reconstructed: entries below
 * stop at v253 while CACHE_NAME had reached v264. Eleven bumps during the
 * long 12 Aug session (CON/CONT/CAP streams and the third-pass trace fixes)
 * went in without header entries. Those changes are documented in the master
 * schedule at v151; they are simply not itemised here, and inventing eleven
 * entries after the fact would be worse than saying so. The counter is
 * correct again from v265 forward.
 *
 * 11 Aug 2026 v253
 * Three routes pointed at view files that never existed. 'about' removed
 * (Settings already had a panel), community-impact and annual-reflection
 * built, and front doors added for both plus the activity log.
 *
 * 11 Aug 2026 v252
 * Every tickable equipment id now unlocks something. 24 did not - ticking a
 * pull-up bar changed nothing. 12 entries written, the rest mapped to kit that
 * asks the same thing.
 *
 * 11 Aug 2026 v251
 * Full integrity sweep - 85 of 544 exercises were unreachable by any session
 * type, and three safety exclusions named conditions that do not exist so they
 * never fired. Both fixed, plus a permanent audit to catch the next one.
 *
 * 11 Aug 2026 v250
 * EQ-1 - balance boards, jump boxes and skipping ropes now actually appear.
 * New balance-work and power categories, plus nine entries for the home
 * equipment that was one exercise deep.
 *
 * 11 Aug 2026 v249
 * Persona trace fixes - no category may fill more than a third of a section
 * (a Mobility session opened with five breathing practices), leg function is
 * now asked separately from standing, and 17 seated entries added to the
 * categories that had only one candidate.
 *
 * 11 Aug 2026 v248
 * Progression stays invitational even when the coach knows. What changes with
 * knowledge is the specificity, not the authority -- "consider taking some
 * weight off", never "take some weight off".
 *
 * 11 Aug 2026 v247
 * The coach is now direct when it knows: if you have said an area is sore and
 * the exercise loads it, it says so and suggests taking weight off rather than
 * hedging. Plainer arc language.
 *
 * 11 Aug 2026 v246
 * Progression is invited, never directed. The coach offers a little more only
 * when the day suits it, invites less during a flare, and treats holding steady
 * on a low day as the achievement. Never a number.
 *
 * 11 Aug 2026 v245
 * The coach now explains the programme - why these exercises, together, today,
 * how they feed the person's stated goals, and what it is building towards.
 * New js/data/session-rationale.js.
 *
 * 11 Aug 2026 v244
 * Check-in pacing and scroll - the newest coach message can now scroll to the
 * top of the viewport, and the energy and mood panels open on a tap rather
 * than a 400ms timer.
 *
 * 11 Aug 2026 v243
 * In-card performance notes generalised - speed and incline for a treadmill,
 * resistance level for a cross trainer, band colour, duration for a hold.
 * Recording is now on by default.
 *
 * 11 Aug 2026 v242
 * Time question removed from check-in (it was asked twice), and a reversible
 * "Not a fan of this one" control added to the exercise card. Exercise
 * preferences are now honoured by generated sessions, not only prescribed ones.
 *
 * 11 Aug 2026 v241
 * CAP-4 - new seated.js, 21 entries of seated cardio, strength, core, lower
 * body and chair-supported standing. Database 497 -> 518.
 *
 * 11 Aug 2026 v240
 * CAP-1/CAP-2 - capability screen in onboarding, and all 497 exercises tagged
 * with position, impact and balanceDemand so the gates read data rather than
 * matching on exercise names.
 *
 * 11 Aug 2026 v239
 * CAP-3 - training intent (improve/maintain/recover) tilts selection, and all
 * six loaded carries are now reachable (nothing selected them before).
 *
 * 11 Aug 2026 v238
 * Empty-session guard (exiting a session you never started no longer saves it)
 * and CAP-1, a four-question capability screen measuring what a person can do
 * rather than how often they move.
 *
 * 11 Aug 2026 v237
 * Persona trace round 2 - slot-weighted anchoring, difficulty ceilings raised,
 * all 30 untagged yoga entries tagged, a new impact gate (no jumping or
 * sprinting for sedentary/light/returning/unknown), and sessionVariety.
 *
 * 11 Aug 2026 v236
 * Persona trace fixes - duplicate exercises within a session (12% of
 * sessions), warmup difficulty ceiling, and an unsafe difficultyLevel
 * default that treated untagged exercises as the easiest possible.
 *
 * 11 Aug 2026 v235
 * CONT-1 - the app now records WHICH exercises were completed, not only how
 * many, and session selection is continuity-aware. store.js v22 adds
 * exerciseHistory. Sessions now repeat key movements instead of handing out
 * 497 exercises at random.
 *
 * 11 Aug 2026 v234
 * CON-9 complete - watchOut ("What to watch for") and load ("How heavy") now
 * on all 497 exercises. Every exercise the app can hand a person carries full
 * guidance: instructions, why, coaching, what to watch for and how heavy.
 *
 * 11 Aug 2026 v233
 * Cable Pallof Press added; watchOut and load added to both band versions.
 *
 * 11 Aug 2026 v232
 * CON-4/CON-8 - new gym.js (31 entries: machines, conditioning, cable and
 * machine strength, loaded core, med ball, balance, plyo) and equipment is
 * now a preference in selection, not only a permission. Gym sessions went
 * from 0-1 equipment exercises out of 13 to 11 of 13.
 *
 * 11 Aug 2026 v231
 * CON-6 - session-builder's private 70-entry pool retired. The builder now
 * selects from all 465 shared exercises, so every exercise it returns carries
 * full guidance. New js/data/session-categories.js.
 *
 * 11 Aug 2026 v230
 * All 9 cardio-warmup entries rewritten to the Exercise Entry Standard - the
 * four machine ones (bike, treadmill, cross trainer, rower) rendered with no
 * guidance at all.
 *
 * 11 Aug 2026 v229
 * Pulse-raiser entries rewritten to the Exercise Entry Standard (they had no
 * instructions/why/coaching/watchOut and rendered near-blank), and session
 * preview durations now read "5 min" rather than "300s".
 *
 * 11 Aug 2026 v228
 * PT-19 - every generated session now opens with a pulse-raiser unless there
 * is a named, spoken reason it should not. Five bodyweight pulse-raisers
 * added; two unreachable equipment tags corrected.
 *
 * 11 Aug 2026 v227
 * CON-3b - watchOut ("What to watch for") and load ("How heavy") now render
 * on all four exercise card views. Neither field had a renderer anywhere in
 * the product, so content authored to the Exercise Entry Standard would have
 * been invisible.
 *
 * 11 Aug 2026 v226
 * CON-1/CON-2 — one exercise registry (exercises.js is now a shim over
 * exercises/index.js) and a new equipment-map.js resolving granular user
 * equipment ticks to the coarse tags exercises carry. 92 of 124
 * equipment-requiring exercises were previously unreachable for every user.
 *
 * 11 Aug 2026 v225
 * gym-programme.js rebuilt to genuinely match prescribed-session.js and
 * workout.js's UX, per Graeme's direct screenshot comparison: "Screenshot
 * 1 is flat and barely offer any interaction... They all need to be like
 * S2&3." Confirmed precisely why: 10 Aug's fix made the why/instructions/
 * video content actually render, but never touched the structural gap —
 * this file was still showing every exercise as a scrollable list all at
 * once (renderExerciseCard x N, one "Session done" button at the
 * bottom), while prescribed-session.js/workout.js walk through one
 * exercise per screen with a progress header, timer or big reps
 * display, and structured guidance sections. The screens looked
 * completely different in practice, exactly as the screenshots showed.
 *
 * Rebuilt renderSession()/the exercise renderer/event handling to walk
 * one exercise at a time. Reuses the exact shared CSS classes
 * prescribed-session.js and workout.js already use (workout-header,
 * exercise-display, exercise-role-badge, timer-circle, reps-display,
 * exercise-instructions, coaching-tip, youtube-link, workout-actions) —
 * confirmed all already defined and globally loaded via workout.css, no
 * new CSS needed — rather than gym-programme's own bespoke
 * gp-exercise-card__* classes, so this genuinely looks like the same
 * app now, not an approximation. parseHoldSeconds()/formatTime() copied
 * directly from prescribed-session.js's proven implementation.
 *
 * Completion tracking changed from DOM-scanning aria-pressed buttons
 * (only possible when every exercise was visible at once) to a
 * completedExerciseIndices Set, incremented on "Next Exercise"/"Finish
 * Session" (which now double as the completion action, same as
 * prescribed-session.js), not on "Skip this one" — matches
 * prescribed-session.js's skip behaviour exactly.
 *
 * Week 6 glance / Week 12 reflection moments, programme progression
 * logic, A/B session alternation, activityLog/progressLog writes, and
 * exit-guard/partial-save behaviour all unchanged — only the per-
 * exercise walkthrough was rebuilt. gym-programme.js v4→v5.
 *
 * Old gp-exercise-card__* CSS rules now unused by this file, not
 * deleted — the gp-moment glance/reflection styles in the same file are
 * still needed. Cleanup logged as its own decision, not guessed at here.
 *
 * Not yet on-device confirmed.
 *
 * 10 Aug 2026 v224
 * Two connected requests from Graeme, both fully done: (1) restore
 * YouTube search-term links across the exercise database ("so we get
 * the most up to date versions and avoid any issue with discontinued
 * or old videos" — search terms, not direct links); (2) audit every
 * session view for consistent what/how/why/support display, since
 * "some exercises still look like Name, what to do, mark as done."
 *
 * Part 1 — YouTube links. All 461 exercises across the main database
 * (js/data/exercises/*.js, previously zero coverage) now have tailored
 * search-term youtube fields. Not a blind bulk pass: traced content
 * style per file first (running.js mixes real technique drills with
 * paced training sessions — 35 entries hand-crafted, not formula-
 * generated). Three quality passes run afterward, each catching real
 * issues: stray lowercase roman numerals ("warrior i"), duplicated
 * words ("technique technique", "yoga yoga"), one exercise with two
 * near-duplicate database entries (flagged, not merged). Confirmed via
 * a real import test: 461/461 loading correctly, zero gaps, zero
 * remaining quality issues on the final pass.
 *
 * Part 2 — UI consistency audit, the connected finding that mattered
 * most: all 461 exercises already had instructions/coaching/why fields
 * at 100% coverage BEFORE this session — the what/how/why content has
 * been sitting there ready the whole time. The "Name, what to do, mark
 * as done" screens weren't missing content, they had silent field-name
 * bugs in the display code:
 *   - workout.js: regenerated a generic "{name} exercise form" query
 *     instead of using each exercise's own tailored .youtube term.
 *   - gym-programme.js: THREE mismatches in one block — checked
 *     exercise.setup (real field: instructions), exercise.whyThis
 *     (real: why), exercise.videoUrl expecting a direct link (real:
 *     .youtube, a search term — Graeme's exact point about search
 *     terms vs discontinued direct links, playing out as a second bug).
 *   - core-session.js: instructions/coaching/youtube never rendered at
 *     all despite 100% data coverage; separately, exercise.cue
 *     (singular, never existed) should have been exercise.cues
 *     (plural array) in the pre-session overview list.
 *   - prescribed-session.js: the most concerning — zero guidance shown
 *     for ANY prescribed exercise, ever, just name + sets/reps + notes.
 *     Fixed by reusing the exact EXERCISES lookup pattern already used
 *     for its safety check — database-linked exercises now show full
 *     guidance, manually-added ones correctly still show notes only
 *     (verified both paths with a direct test).
 *   - yoga-session.js: its own private 30-pose pool (a third, separate
 *     exercise database, flagged as a real architectural concern, not
 *     fixed tonight) had good description/cues already but zero
 *     youtube coverage — added to all 30, wired up display, same
 *     singular/plural cue bug fixed. A `why` field doesn't exist in
 *     this pool's data at all — genuine content authoring, not a
 *     mechanical fix, deliberately left as a clean follow-up rather
 *     than rushed at the end of a long session.
 *
 * Confirmed correctly OUT of scope: walk/run/swim/cycle-session.js use
 * a continuous-activity + periodic coach-prompt pattern, not itemized
 * exercises — Graeme's complaint doesn't apply to these, verified by
 * tracing their actual render logic rather than assumed.
 *
 * js/data/exercises/*.js (11 files, 3 version-bumped, 8 given their
 * first-ever version header), workout.js v6→v7, gym-programme.js
 * v3→v4, core-session.js v5→v6, prescribed-session.js v3→v4,
 * yoga-session.js v6→v7. Full syntax check clean across all 16 files.
 * Not yet on-device confirmed.
 *
 * 10 Aug 2026 v223
 * Overnight autonomous session (Claude, "make decisions following my
 * previous decision behaviours"). Scoped deliberately narrow: small,
 * well-evidenced, low-risk fixes that reduce untested surface area,
 * not new speculative features piled on an already-large unconfirmed
 * backlog — matching the pattern Graeme has repeatedly favoured
 * (phase, defer, confirm before building more).
 *
 * Two real bugs found and fixed in noticing.js's "Your reflections":
 * since journal-entry.js v3's privacy rewrite (14 Jul), entries have
 * been written as {id, date, text, tags, noWords} — but noticing.js was
 * still reading entry.createdAt/category/body (all undefined since 14
 * Jul) and entry.type === "weekly-noticing" (never written anywhere,
 * always false). Consequence: reflections showed blank date/text for
 * every entry, AND getRecentEntries()'s sort compared new Date(undefined)
 * — NaN vs NaN — meaning entries were never actually sorted by recency
 * at all, just left in original array order. Both fixed to read the
 * real fields; the dead "This week" badge (always-false type check)
 * removed rather than a working version invented. noticing.js v4→v5.
 *
 * journalEntryType pre-select investigated, NOT fixed — found bigger
 * than the master schedule's note suggested: journal-entry.js's v3
 * rewrite dropped the entire pre-selected-screen mechanism, not just
 * the field read. Fixing it means designing what a type-specific
 * screen should look like — a real product decision, left for Graeme.
 *
 * Bodyweight-only lower-body content gap closed: session-builder.js v3,
 * four new exercises (hip-hinge/single-leg/squat-pattern/leg-isolation),
 * matching the exact format and safety conventions of everything
 * already in the pool. Confirmed via test: no-equipment Lower Body went
 * from 0 main exercises to 4. Full 7-type regression re-run clean.
 *
 * Real correction to a stale schedule note, not an execution: the
 * "orphaned duplicate, safe to delete" file (exercises/index.js) is
 * confirmed NOT orphaned — three live features (conditionProgrammes.js,
 * core-session.js, prescribed-session.js) now import from it, all
 * built since the old note was written. Traced precisely: it and
 * exercises.js (workoutGenerator.js's import) are currently
 * byte-identical in logic (diffed directly, only import-path depth
 * differs) — a real structural risk (manual sync required forever, or
 * silent drift) but not something to merge unilaterally overnight.
 * Documented, neither file touched.
 *
 * Safety trace of the Severe-pain Rest/Adapt flow (coach-proposal.js,
 * store.js's recordSeverePainChoice()) — read closely, no bugs found.
 * One minor, non-urgent observation: severePainChoices has no cap
 * (unlike activityLog's 200-entry limit) — not fixed, not urgent.
 *
 * Deliberately not touched, all needing real product judgment rather
 * than a defensible autonomous call: coach-reflection.js deletion,
 * coach-proposal.js's renderBypassDoor() unused parameter, the
 * difficulty-scale migration, gym-programme.js's missing guided
 * walkthrough, NEW-2 (recalibration engine), Wellbeing-first entry.
 *
 * 09 Aug 2026 v222
 * "In Step" (Noticing Hub, Personal tier) — new js/views/in-step.js and
 * js/data/in-step-scenarios.js added to precache, alongside noticing.js.
 * store.js v17->v18, router.js v13->v14, noticing.js v3->v4. See
 * Schema.md v1.17 and master schedule for full detail. Cache bump only.
 *
 * 05 Aug 2026 v221
 * Gym Session Builder Phase 1 (blueprint alongside_blueprint_gym-
 * session-builder-phase1_05aug2026_v2.md), run end to end. Root cause:
 * Library's "At the gym" Core/Upper body/Lower body/Strength cards were
 * confirmed non-functional duplicates -- all navigated to gym-programme
 * with no parameter, and gym-programme.js had no way to receive one.
 * Fixed by routing into the already-working session-builder.js system
 * instead, with Graeme's fuller vision built on top: allocation presets
 * (Balanced/Mostly strength/Mostly mobility, warmup always floors at 1
 * regardless), a location step ("home or gym today", asked once a
 * session type is picked, defaults home, never sticky), and a three-
 * route build-mode step (Coach builds it / Coach recommends, I'll
 * choose / Build my own) mirroring conditionProgrammes.js's
 * architecture, not its persistent-storage model. Also built: real
 * cardio-warmup content (bike/treadmill/cross-trainer/rowing machine),
 * genuinely missing before -- equipment options existed nowhere for
 * this, now do, wired into Upper/Lower/Full/Glute's warmup categories.
 * "Strength" retired from Library (never mapped to a real SESSION_TYPES
 * id) in favour of "Glute Focus" (already existed in the engine, never
 * surfaced). Settings' Equipment panel now shows a saved-equipment
 * summary instead of a bare button.
 *
 * session-builder.js v1->v2, session-builder-ui.js v3->v4, library.js
 * v2->v3, settings.js v13->v14.
 *
 * Real bug caught during testing, not shipped: an earlier edit adding
 * cardio-warmup to Glute Focus's warmup categories accidentally deleted
 * its entire mainCategories line in the same str_replace (old_str
 * included it for match-uniqueness, new_str dropped it). Found by a
 * real smoke test exercising all 7 session types, not by inspection --
 * fixed before commit, confirmed via re-test afterward. All 7 types
 * (including glute) now build correctly with no crashes, and the
 * warmup safety floor confirmed firing correctly even with zero warmup
 * exercises selected.
 *
 * Found, not fixed -- pre-existing content gap: lower-body main
 * exercises (squat-pattern/hip-hinge/single-leg/leg-isolation
 * categories) have no bodyweight-only options in the existing pool --
 * confirmed via direct count, every tagged exercise requires equipment.
 * A user with no equipment selecting Lower Body gets 0 main exercises.
 * Pre-existing, not introduced by this session -- logged, not guessed
 * at with new content.
 *
 * Not yet on-device confirmed -- no device available this session.

Also found and fixed while touching sw.js: js/session-builder.js and
js/views/session-builder-ui.js were never in SHELL_URLS' precache list
at all, despite existing since 21 May -- pre-existing gap, more
consequential now this feature is reachable directly from Library
rather than only a buried bypass door. Added both.
 *
 * 04 Aug 2026 v220
 * Design Consistency Audit, Half A (structural pass, run solo while
 * Graeme was at the gym). Found and fixed: --color-bg-elevated was
 * referenced 46+ times across 14 CSS files with no definition anywhere
 * - every "elevated surface" app-wide (nested cards in Settings,
 * Conditions Update, Mobility & Conditioning, Today, Progress, Library,
 * journal entries, onboarding, gym-programme) was rendering with no
 * background at all. Added to base/variables.css, matched to
 * --color-bg-hover's tier based on a real usage site's confirmed role
 * (hover feedback), not invented arbitrarily. main.css v14->v15. Also
 * confirmed, not fixed (architectural/design decision, not a solo
 * call): five-plus screens each reinvent their own "card" component
 * from scratch rather than sharing one base - no visible bug today,
 * flagged for a real consolidation conversation. Half B (screenshot
 * review) not yet started - needs Graeme, and should happen after this
 * fix since several screens now look different than when the audit was
 * scoped this morning. Full findings:
 * alongside_design-audit-half-a-findings_04aug2026_v1.md.
 *
 * 04 Aug 2026 v219
 * dead-bug/bird-dog contraindications discrepancy resolved — Graeme's
 * content decision. Dead Bug's empty exclusions and Bird Dog's lower-
 * back/glutes exclusions both confirmed correct as written; Bird Dog
 * gets a genuine addition, wrist-elbow-acute, for the real wrist
 * loading in its hands-and-knees position that nothing previously
 * captured. strength.js v2→v3. Smoke-tested against the real
 * contraindication-check logic before shipping. This data now feeds
 * prescribed-session.js's safety check directly, not just descriptive
 * content.
 *
 * 04 Aug 2026 v218
 * Cross-condition exercise reuse — Graeme's recommendation request,
 * refined once before building (first draft would have duplicated
 * shared exercises rather than genuinely reusing them). conditionId
 * (singular) replaced with conditionIds (array) on prescribedExercises
 * entries; one exercise can now serve more than one condition as a
 * single entry — one completion state, one credit award, shown once
 * per condition it belongs to rather than duplicated. New
 * getEntryConditionIds() keeps old singular-shaped entries working
 * with no migration step. commitProgramme() reuses existing entries
 * by exerciseId instead of duplicating; both builder functions bias
 * toward reuse and annotate candidates so the UI can show "Already in
 * your X programme." conditionProgrammes.js v2→v3, conditions-
 * update.js v6→v7, mobility-conditioning.js v1→v2, prescribed.js
 * v1.3→v1.4, conditions-update.css v6→v7. Smoke-tested against real
 * overlapping conditions and backward compatibility before shipping.
 * Schema.md v1.15→v1.16.
 *
 * 04 Aug 2026 v217
 * The most important fix from today's feedback batch — prescribed-
 * session.js v2→v3: real-time contraindication check added. Was
 * reading zero condition/pain data, unlike every other session type.
 * New _checkContraindication() flags (doesn't hide/block) an exercise
 * when its contraindications match today's active conditions, using
 * the exact same visual pattern as coach-proposal.css's existing
 * constraint flag. Smoke-tested against real exercise data before
 * shipping. workout.css v2→v3 for the new .ps-contra-flag styling.
 *
 * 04 Aug 2026 v216
 * Mobility & Conditioning's real landing page, built to Graeme's
 * confirmed design. New js/views/mobility-conditioning.js (router.js
 * v13): three cards — Start a Mobility Session (routes to
 * core-session.js, already condition-aware), My Conditions Programme
 * (collapsed by default, count + expand, "Not created" links straight
 * into Conditions Update when empty), Log an event (Library). Replaces
 * the today.js smart-routing hack entirely — today.js v12, "Your
 * programme" hint removed as redundant. New css/layouts/mobility-
 * conditioning.css, main.css v13→v14. prescribed.js v1.2→v1.3: "Back
 * to choices" no longer hardcoded to the confusing 'intention' screen,
 * goes to Home instead — real fix Graeme flagged, now more relevant
 * given this screen's new primary entry point.
 *
 * 04 Aug 2026 v215
 * Two fixes from the same message. (1) New "Update app" button in
 * Settings' About panel (settings.js v13, settings.css v6) — clears
 * every cache directly and hard-reloads, cutting through staleness
 * regardless of service-worker state, not just the polite existing
 * checkForUpdate() path. (2) conditions-update.js v6 — scroll position
 * preserved across every re-render instead of resetting to top on
 * every selection.
 *
 * 04 Aug 2026 v214
 * Rest of the Library page styled — Graeme: "we need to improve the
 * cosmetics of the library page itself." Checked every class library.js
 * actually uses first: "Start a session"'s category grid and its
 * per-category session sub-screen had zero CSS, same as the landing
 * screen fixed earlier. "Log what I did" confirmed already styled
 * (reuses settings-library.css classes) — left untouched. library.css
 * v1→v2: added page padding, sub-header, category cards, session
 * cards. library.js v1→v2: session-card markup restructured slightly
 * (label+note wrapped in a text span) so the new layout works
 * correctly — no behaviour change.
 *
 * 04 Aug 2026 v213
 * New css/layouts/library.css — the Library landing screen had zero
 * CSS anywhere despite its own file comment describing "two large
 * cards." Real missing-styles bug, not a redesign; fixed as a
 * contained, single-screen polish at Graeme's request now that
 * Library is a first-class Home door. main.css v12→v13.
 *
 * 04 Aug 2026 v212
 * Library added as its own Home door. today.js v10→v11. Real gap
 * Graeme caught: Mobility & Conditioning's smart-routing to the
 * condition programme meant Library had no direct path from Home once
 * a programme existed. No CSS changes needed — grid and "Unsure?"'s
 * layout both already accommodate the extra tile.
 *
 * 04 Aug 2026 v211
 * conditions-update.css v5→v6: "Add N to my programme" was
 * overflowing its pill — same white-space:nowrap + flex:1 min-width
 * bug found repeatedly today. Fixed. Likely also the real cause of a
 * separate report (Mobility & Conditioning routing to Library instead
 * of the programme) — if the button couldn't be tapped cleanly, the
 * exercise may never have saved. Routing logic itself re-verified
 * correct. Flagged for retest, not assumed fixed.
 *
 * 04 Aug 2026 v210
 * Mobility & Conditioning door wired to the real Conditions Programme.
 * today.js v9→v10: routes to prescribed.js when a condition-tagged
 * programme exists, falls back to Library otherwise (no change for
 * anyone without one). Door tile shows a small "Your programme" hint
 * when this applies. today.css v2→v3. Last open bridge from Phase C's
 * six-door Home closed — the other one (Conditions Update) resolved
 * when Phase D shipped.
 *
 * 04 Aug 2026 v209
 * Graeme's two ideas for the condition-programme candidate list, both
 * real, both built. (1) One-line rationale per exercise — the `why`
 * field already existed on all 461 exercises in the database, just
 * surfaced now, no new content. (2) "Not keen on this one" — applies
 * the already-approved alongside_exercise_skip_dislike_spec_16may2026_
 * v1.docx (binary Avoid/Less-often signal, not a rating) to this
 * candidate list specifically. New store.js v17 field
 * exercisePreferences; conditionProgrammes.js v2 excludes 'avoid' and
 * de-prioritises 'less' in both coach-built and coach-recommended
 * results, smoke-tested before wiring into the UI. The full spec's
 * in-session Skip flow across gym-programme.js/prescribed-session.js/
 * core-session.js remains separate, larger future work.
 *
 * 04 Aug 2026 v208
 * Four screenshots, three real fixes and one confirmed-not-guessed
 * finding. (1) checkin-conversation.css v5→v6: feeling-word chips were
 * breaking words across 3 lines — converted to a 2-column grid.
 * (2) js/views/conditions-update.js v3→v4, conditions-update.css
 * v3→v4: the new "coach recommends" checkbox selection had no visible
 * selected state — fixed with accent-color plus a row-level
 * .is-selected style, matching the app's own selection pattern
 * elsewhere. (3) js/views/checkin.js v10→v11: coach-reflection.js's
 * four-option "Your Session" picker confirmed (traced, not assumed)
 * to be unreachable from anywhere except one fallback in this file —
 * now retired, falls back to Home instead, where the same options
 * already live as real doors. (4) Logged, not fixed: a full aesthetics
 * audit is needed for the check-in bottom-sheet panel covering the
 * coach's message at the top of the screen — flagged as its own
 * future session, not patched piecemeal.
 *
 * 04 Aug 2026 v207
 * Four fixes/builds, all from the same conversation. (1) Check-in
 * gating now genuinely optional: today.js v9 only forces check-in the
 * first time today; check-in-mini.js v6's Skip now honours
 * pendingDoorRoute instead of always dumping to 'intention'. Together
 * these mean check-in-mini no longer appears automatically for every
 * second-or-later session in a day — it's reachable voluntarily via a
 * new "Update check-in" link instead. (2) New js/data/
 * conditionProgrammes.js — real, tested exercise-selection logic for
 * condition programmes, built on data that already existed
 * (affectsAreas, rehabPhase, contraindications). (3) store.js v15→v16:
 * prescribedExercises entries can carry an optional conditionId;
 * new single-use prescribedExercisesActiveCondition context flag.
 * (4) conditions-update.js v2→v3: "Your programme" moved into each
 * condition's own card, three real routes (Coach builds it / Coach
 * recommends, I'll choose / Build my own), 8-exercise programmes,
 * one-time generation not auto-regenerating. prescribed.js v1.1→v1.2:
 * tags new entries with conditionId when set, shows a "For:" tag.
 * conditions-update.css v2→v3.
 *
 * 04 Aug 2026 v206
 * Real gap fixed, found by Graeme same day: no way to remove a
 * condition from conditions-update.js. Added an explicit "Remove"
 * action per card, confirm dialog reusing settings.js's existing
 * pattern. conditions-update.js v1→v2, conditions-update.css v1→v2.
 *
 * 04 Aug 2026 v205
 * Phase D-2/D-3/D-4, Conditions Update — the real screen, live. New
 * files: js/views/conditions-update.js, css/layouts/conditions-
 * update.css (registered in main.css v11→v12), both added to
 * SHELL_URLS. Collapsed condition cards with an unambiguous chevron
 * affordance; severity slider reusing check-in's exact pattern;
 * reflection field; felt-sense goal picker (3 options + skip); once a
 * goal's set, a severity trend from checkinHistory (already existed,
 * no new tracking); one shared "Your programme" section ("Build your
 * own" only — coach-built/coach-recommended need real generation logic
 * that doesn't exist yet, deliberately not shown as "coming soon"
 * tiles); fold-in dial once a programme exists. router.js v11→v12: new
 * 'conditions-update' route. today.js v7→v8: door now goes straight
 * there, interim openSheet bridge removed. settings.js v11→v12: "Edit
 * conditions" now goes to the same real screen instead of the old
 * limited onboarding sheet. prescribed.js v1.0→v1.1: coach voice now
 * origin-aware, speaks correctly when reached via "Build your own"
 * rather than a genuine prescription.
 *
 * 04 Aug 2026 v204
 * Phase D-1 (schema), Conditions Update. store.js v14→v15: new fields
 * conditionGoals (felt-sense per-condition goal, Graeme's own framing —
 * "healed"/"cope"/"improve") and prescribedExercisesOrigin (lets
 * prescribed.js's coach voice branch correctly by entry context). Both
 * decisions resolved same day they were logged — see Phase D blueprint
 * v2. Schema.md v1.13→v1.14, also catching up a v14 field
 * (pendingDoorRoute) that was missed in Schema.md when it shipped
 * earlier today.
 *
 * 04 Aug 2026 v203
 * today.js v6→v7 — real bug found while scoping Phase D, fixed
 * immediately: Conditions Update door was navigating directly to
 * 'onboarding/conditions', the exact bottom-nav/Back-button bug
 * settings.js v9 already found and fixed once. Same fix reused —
 * openSheet() instead of a direct navigate(). Interim, Phase D
 * replaces the bridge itself.
 *
 * 04 Aug 2026 v202
 * Graeme's on-device pass on Phase C, same day — 4 real fixes.
 * (1) Real regression, found via screenshot: coach-proposal.js's v18
 * auto-opened session panel (full-screen overlay) was covering the
 * condition/severity constraint message before it could be read.
 * Message now renders inside the panel; auto-open also gated on the
 * re-entry banner and missed-offer being resolved first (same latent
 * bug, not yet triggered but real). coach-proposal.js v18→v19,
 * coach-proposal.css v7→v8.
 * (2) The big one: session-generating Home doors (Cardio/Core/Strength,
 * Unsure? Coach decides) now route through check-in first — full
 * check-in if not done today, check-in-mini if already done — before
 * their real destination, via new store.js field pendingDoorRoute.
 * store.js v13→v14, today.js v5→v6, checkin.js v9→v10, checkin-mini.js
 * v4→v5.
 * (3) session-builder-ui.js v2→v3: equipment step copy now adapts —
 * "tick anything you have" when nothing's saved in settings, instead
 * of "untick" against an empty, all-unticked list.
 * (4) Logged, not built this pass: cosmetic polish needed on the
 * session-builder proposal screen (S3), and gym-programme.js lacks
 * the guided walkthrough (timers, form cues, video links) workout.js
 * already has (S4/S7 comparison) — both flagged on the master schedule
 * as their own future items.
 *
 * 04 Aug 2026 v201
 * Phase C, Home Nav & Conditions Redesign — Home screen and entry-flow
 * rebuild. today.js v4→v5: single "Check in" CTA + gated funnel
 * replaced with six always-visible doors (Cardio/Core/Strength,
 * Mobility & Conditioning, Wellbeing, Conditions Update, Progress,
 * Unsure? Coach decides); Settings now reachable directly from Home.
 * Two door routes are honest bridges pending later phases (Conditions
 * Update -> existing conditions editor until Phase D; Mobility &
 * Conditioning -> library until a real conditions-aware programme
 * exists), flagged not hidden. Real bug found and fixed while wiring
 * Door 1: router.js's 'session-builder' route pointed at a file that
 * doesn't exist — could never have worked, on any device, until this
 * fix (router.js v10→v11). coach-proposal.js v17→v18: the three-doors-
 * plus-bypass UI removed entirely (DOOR_COPY, renderDoorFront(),
 * renderBypassDoor(), handleDoorChoice(), and their now-dead callers/
 * helpers) — this screen is only reached via Home's "Unsure? Coach
 * decides" door now, so the session-options panel opens automatically
 * on mount instead of behind a second tap. today.css v1→v2,
 * coach-proposal.css v6→v7 — dead door/bypass CSS removed alongside.
 *
 * 04 Aug 2026 v200
 * Phase B, Home Nav & Conditions Redesign — core-session.js pool
 * consolidation (blueprint alongside_blueprint_home-navigation-
 * conditions_04aug2026_v1.md). Private, duplicated EXERCISE_POOLS (23
 * exercise objects) removed, replaced with a lightweight id-reference
 * map resolved against the shared exercise database. All 23 confirmed
 * to already exist there; missing fields (sets/reps/holdSeconds/rest/
 * cues/description) migrated onto those shared records additively —
 * strength.js v1→v2, mobility.js v1→v2, rehabilitation.js v1→v2 (all
 * three files' first-ever version headers, added now). Two genuine
 * id-collision bugs found and fixed: core-session.js's "stability"
 * pool had two exercises (Dead Bug, Bird Dog) incorrectly sharing ids
 * with completely different, gentler rehab-pool variants — both now
 * correctly resolved to their own distinct shared records. Private
 * duplicated severity threshold (pain >= 4, the pre-Phase-A value)
 * replaced with conditions.js's canonical getActiveConditionIds()/
 * filterByConditions() — same functions workoutGenerator.js already
 * uses. Selection changed from always-first-N to shuffled. Flagged not
 * fixed: shared dead-bug/bird-dog contraindications differ from what
 * core-session.js previously excluded them for — real content
 * question for Graeme. End-to-end Node smoke-tested before commit,
 * not just syntax-checked. core-session.js v4→v5.
 *
 * 04 Aug 2026 v199
 * Severe pain: active Rest/Adapt choice (coach-proposal.js v17,
 * Graeme's proposal). When Severe pain is present and no choice is
 * recorded yet today for that exact condition set, the whole proposal
 * screen is replaced with the coach's question and two buttons — Rest
 * today / Adapt and continue — nothing else renders until answered.
 * New store.js v13: severePainChoices field + recordSeverePainChoice()
 * — a genuine audit-trail record (date, exact condition set, choice,
 * timestamp), not just a UI state, since that's the actual point of
 * the design. "Rest" routes to a gentle Wellbeing-or-done screen, no
 * session generated. "Adapt" proceeds to the normal proposal as
 * before. Cleanup: _checkSeverePain()/severePainOverride removed —
 * dead placeholder code from a feature that never got built, now
 * genuinely superseded rather than theoretically unused.
 *
 * 04 Aug 2026 v198
 * coach-proposal.js v15→v16 — mixed-severity condition narrative. If
 * conditions span multiple bands the same day (e.g. one Moderate, one
 * Mild), the coach now narrates each by its own state in one combined
 * message, instead of one tier silently winning. Real finding: Severe
 * pain has no rest-day override anywhere live (dead/unused code found)
 * — flagged to Graeme as a separate decision, not built. Verified,
 * unchanged: exercise/recommendation adaptation was already correctly
 * per-condition, not aggregated — only the narrative had the gap.
 *
 * 04 Aug 2026 v197
 * coach-proposal.js v14→v15 — multi-condition message fix, Graeme asked
 * directly whether "Glutes / Buttocks" changes per condition (yes,
 * already dynamic) and how 2+ conditions in the same band would read
 * (previously: silently dropped to just the first one — real gap, now
 * fixed with natural-language joining, "X" / "X and Y" / "X, Y, and Z").
 *
 * 04 Aug 2026 v196
 * Pain Input Redesign — Graeme's own instinct, built same session.
 * Real problem solved at the root, not another patch: today's chip-
 * overflow bug (fixed twice already, v194/v195) was a symptom of a
 * 4-button discrete pain input that was always going to fight long
 * words in a 4-column row. Converted to sliders instead, matching the
 * app's own existing Energy/Mood pattern.
 * - js/data/conditions.js v1.3→v1.4: new getPainBand(score) — one
 *   canonical source for pain-severity display bands app-wide. Dead
 *   getPainContext() removed (a fourth private threshold duplicate,
 *   never called, still carrying the pre-fix >=4 value).
 * - js/views/checkin.js v8→v9, js/views/checkin-mini.js v3→v4 — both
 *   condition-pain inputs converted from button chips to sliders (0-10),
 *   using getPainBand() for the live label. checkin-mini's own private
 *   PAIN_LEVELS/painLevelForScore duplicate retired.
 * - js/views/coach-proposal.js v13→v14 — new Mild acknowledgment tier
 *   (previously totally silent for Mild pain — a real gap, not a
 *   nicety, given "behaviour is communication"). Existing Moderate
 *   message also upgraded to use the condition's real display name.
 * - css/components/checkin-conversation.css v4→v5 — new compact
 *   condition-slider styling; .ci-pain-chip/.ci-pain-chips removed
 *   entirely, confirmed unused, rather than patched a third time.
 * - Documents/Live State/Schema.md v1.11→v1.12.
 *
 * 04 Aug 2026 v195
 * Four fixes from one round of Graeme's on-device screenshots, testing
 * the Home Nav Phase A threshold change:
 * (1) REAL BUG, not cosmetic: coach-proposal.js's _checkModeratePain()
 *   had its own third private copy of the severity threshold (>=4),
 *   never touched by Phase A. This is why Mild still showed "I've
 *   worked around that." Fixed to >=6 && <7, matching the canonical
 *   value in conditions.js. coach-proposal.js v12→v13.
 * (2) checkin-conversation.css v3→v4 — .ci-pain-chip and .ci-quality-chip
 *   overflow-wrap fixes (word-selector chips had the same class of bug
 *   as the pain chips, different root cause — see file changelog).
 * (3) onboarding.css v1→v2 (first version header on this file) —
 *   .onboarding-view's min-height never subtracted --nav-height, so
 *   Continue buttons landed under the fixed bottom nav on every
 *   onboarding screen, not just Conditions. Real root-cause fix, not
 *   a padding patch.
 * (4) coach-proposal.css v5→v6 — .cp-constraint (the "flagged" message)
 *   strengthened; Graeme reported missing it almost every time.
 *
 * 04 Aug 2026 v194
 * checkin-conversation.css v2→v3 — .ci-pain-chip text-overflow fix,
 * found on-device by Graeme while confirming the Phase A threshold fix
 * (screenshot: "Moderate" overflowing into "Severe"'s pill). Classic
 * flexbox min-width:auto issue — added min-width:0 so chips shrink and
 * wrap instead of overflowing. CSS-only, no JS/schema change.
 *
 * 04 Aug 2026 v193
 * Small follow-up to Phase A, same day, on request. checkin-mini.js
 * v2→v3: "Severe" pain chip score corrected 8→9 to match checkin.js's
 * "Severe" exactly — found while checking a report against the Phase A
 * threshold fix. checkin-mini.js had its own private, duplicate
 * PAIN_LEVELS definition (smaller version of the core-session.js
 * private-pool problem). No live behavioural bug — both values already
 * cleared every existing threshold — pure single-source-of-truth
 * cleanup. Out of the original Phase A file list; logged explicitly.
 *
 * 04 Aug 2026 v192
 * Home Nav & Conditions Redesign, Phase A (schema + single-source-of-
 * truth logic fix — blueprint alongside_blueprint_home-navigation-
 * conditions_04aug2026_v1.md). store.js v11→v12: two new fields,
 * conditionReflections and conditionFoldInLevel, both schema-first
 * ahead of any view code that reads them (Phases B-D, not yet built).
 * conditions.js v1.2→v1.3: subacute severity threshold raised from
 * pain >= 4 to pain >= 6 in getActiveConditionIds()/getZoneStatus(),
 * matching checkin.js's existing Moderate boundary — canonical fix,
 * affects every session workoutGenerator.js generates, not just Core
 * Sessions. No view files touched this phase; no user-visible change
 * until Phase B (core-session.js) lands. Schema.md v1.10→v1.11.
 *
 * 03 Aug 2026 v191
 * Tier-gating infrastructure built (S4-TG, scoped 9 May 2026, never
 * implemented until now). New js/auth.js: getUserTier()/isPremium()/
 * isAthlete()/lockedFeature() using the live "tier" field (NOT
 * "userTier" as the May spec assumed — matched what's already live
 * across settings.js/progress.js/session-builder-ui.js/upgrade.js/
 * coach-proposal.js instead of introducing a second field name). New
 * css/components/tier-gating.css for the locked-feature wrapper, every
 * variable confirmed against the current design system before use.
 * app.js v7→v8: single initPaywallListener() call wired in init() -
 * tapping any .locked-feature-wrap navigates straight to /upgrade
 * (built and polished as of earlier today), not a toast - the May
 * spec's toast plan predates that page existing.
 *
 * Deliberately NOT done this session: progress.js's existing working
 * ad-hoc tier gating (30/90-day lock, export lock, tiered observation
 * depth) left untouched - it already works, retrofitting it to route
 * through auth.js would be pure churn. Also not implemented: several
 * May-spec audit-table items that no longer apply - "coach style
 * variants" was explicitly killed (Nurturing only, permanently,
 * settings.js v7); "prescribed exercises Level 2+" - no difficulty-
 * level concept exists anywhere in prescribed.js/prescribed-session.js;
 * "custom programme builder"/"Athlete analytics" - no generative
 * programme engine exists; "mindful audio prompts mid-session" - no
 * such distinct feature found. coach-proposal.js's renderBypassDoor()
 * has an unused `tier` parameter, found while checking - not fixed,
 * original intent unclear, logged on the master schedule instead of
 * guessed at. lockedFeature() itself is not yet applied to any live
 * feature - infrastructure is real and tested (see PR notes) but no
 * current premium feature was confirmed both real AND ungated to wrap
 * it around.
 *
 * 03 Aug 2026 v190
 * upgrade.js v1→v2 — crash fix. render() called store.getUserTier(),
 * which doesn't exist anywhere in store.js (confirmed via grep, same
 * check that found the wider tier-gating gap on 31 Jul). Would have
 * thrown the instant anyone navigated to the upgrade/membership screen.
 * Fixed to store.get("tier") || "free", matching every other live
 * reader (settings.js, progress.js, session-builder-ui.js's isPremium()).
 * Not in SHELL_URLS' precache list either way — pre-existing, separate,
 * out of scope for this fix.
 *
 * 03 Aug 2026 v189
 * running-session.js v4 + new js/session-resume.js — Wake Lock and
 * resumable-session fix (blueprint alongside_blueprint_wakelock-resume_
 * 03aug2026_v1.md), pilot on running-session.js. Root cause, found via
 * real on-device use: elapsed time was tick-counted, not wall-clock-
 * anchored, so screen-lock/backgrounding throttled the setInterval and
 * silently broke prompts, vibration, pause/resume, and a refresh lost
 * all progress. Fixed: elapsed now computed fresh from timestamps every
 * tick; session state checkpointed to store at start/pause/resume/
 * prompt; on cold mount, an interrupted run is offered back to the user
 * via a coach-voiced resume-or-fresh choice (reuses .session-exit-* CSS
 * as-is, no new styles). Wake Lock requested on start/resume, released
 * on end/exit, re-requested on visibilitychange — a genuine but partial
 * improvement, not a substitute for the above (confirmed broken in
 * installed iOS PWAs until iOS 18.4, and dropped instantly on any
 * backgrounding regardless of platform). Also fixed in the same file:
 * interval-structure work/recovery cues matched on exact equality
 * (elapsed === at), fragile even without backgrounding — now a >= check
 * against a fired-index set. New file js/session-resume.js added to
 * SHELL_URLS. Not yet on-device confirmed — no device available this
 * session. Not yet wired into the other 6 session views (workout.js,
 * yoga-session.js, walk-session.js, cycle-session.js, swim-session.js,
 * core-session.js) — pilot only, generalise once proven.
 *
 * 03 Aug 2026 v188
 * session-builder-ui.js v2 cache bump — userTier bug fix
 * (31 Jul blueprint, ground-truthed against live code, same pattern as
 * workout.js v6). Three issues fixed: (1) no exit protection at all,
 * neither on-screen Exit nor back-gesture — mountSessionGuard()/
 * dismountSessionGuard() wired for the first time, on-screen Exit now
 * shows a coach-voiced showExitConfirm() Stay/Exit-and-save overlay
 * instead of navigating instantly; (2) completions only wrote to
 * progressLog, never activityLog, making sessions invisible to
 * today.js's "you moved today" and progress.js's recent-activity
 * observations — fixed additively, store.logActivity() now runs
 * alongside the existing recordSession() call, progressLog write
 * unchanged; (3) reflect.js's save logic is gated on
 * currentActivityEntry, which this file never set — every reflect
 * answer after a gym-programme session was being silently discarded.
 * Fixed: logActivity()'s returned entry now written to
 * currentActivityEntry at both genuine completion and partial-exit.
 * Activity type set to "gym" (not "workout") — matches an existing key
 * in reflect.js's QUESTIONS/FEEL_OPTIONS maps, giving the correctly
 * tailored gym question and feel options instead of a fallback. No
 * schema change, no new file, no CSS change — gym-programme.js and
 * css/components/session-guard.css both already present in SHELL_URLS
 * below.
 *
 * 30 Jul 2026 v186
 * store.js v11 cache bump — logActivity()'s dedupeWindowMs default
 * reduced from 2 minutes to 10 seconds. Found on-device testing (same
 * day): two genuinely different real yoga completions 83 seconds apart
 * were silently rejected as a duplicate. Applies to every activity type
 * uniformly — no caller overrides the default. No schema change, no new
 * file — store.js already present in SHELL_URLS below.
 *
 * 30 Jul 2026 v185
 * yoga-session.js v6 cache bump — on-device testing bug fix. finaliseSession()
 * was missing a rerender() call after phase = "done", leaving the screen
 * stuck on the last pose after a genuine completion. One-line fix. No
 * schema change, no new file — yoga-session.js already present in
 * SHELL_URLS below.
 *
 * 30 Jul 2026 v184
 * workout.js v6 cache bump — gym exit-guard gap fix (Core Session
 * investigation follow-up, same session). mountSessionGuard() wired for
 * the first time, savePartialSession() added, on-screen Exit now uses a
 * coach-voiced showExitConfirm() overlay instead of confirm(). Also:
 * css/components/session-guard.css v2 cache bump — added missing
 * .session-exit-* styles (found unstyled across all 7 files using this
 * local-overlay pattern, fixed for all of them via the shared stylesheet).
 * No schema change, no new files — both already present in SHELL_URLS.
 *
 * 30 Jul 2026 v183
 * yoga-session.js v5 cache bump — same id-reuse fix as core-session.js
 * v4 (this session), applied to yoga-session.js's finaliseSession() and
 * savePartialSession(). No schema change, no new file — yoga-session.js
 * already present in SHELL_URLS below.
 *
 * 30 Jul 2026 v182
 * core-session.js v4 cache bump — Core Session data-integrity
 * investigation. Fixed an id-reuse bug: finaliseSession() and
 * savePartialSession() were spreading a stale currentActivityEntry into
 * new completions, so two back-to-back Core Sessions not separated by an
 * intention.js visit could share one activityLog id. No schema change,
 * no new file — core-session.js already present in SHELL_URLS below.
 *
 * 30 Jul 2026 v181
 * workoutGenerator.js v1.13 cache bump — BUILD-4 dead-code removal
 * (todaysWorkouts/workoutsGeneratedAt writes and the orphaned
 * needsRegeneration()/getTodaysWorkouts() function pair). No behaviour
 * change — file already present in SHELL_URLS below, cache-bust only.
 *
 * 28 Jul 2026 v180
 * router.js v10 cache bump — fixed a popstate listener collision with
 * session-guard.js that silently defeated the back-gesture exit-guard
 * card on every session type (router.js's own listener saw session-guard's
 * pushed history state, found no 'view' key, defaulted to 'today', and
 * force-navigated there before the confirmation card could show or the
 * onExit partial-save could run). Found via real device back-gesture
 * testing during the BUILD-3 on-device test pass. File already present
 * in SHELL_URLS below - no new entries required, this is a cache-bust only.
 *
 * 24 Jul 2026 v179
 * BUILD-5 undershoot fix cache bump for workoutGenerator.js v1.12 —
 * duration-aware main-block fill (was: fixed exercise count regardless of
 * how short individual exercises ran, causing "Quick" sessions to land at
 * 9-19 min against a 20 min target). File already present in SHELL_URLS
 * below - no new entries required, this is a cache-bust only.
 *
 * 24 Jul 2026 v178
 * BUILD-5 follow-up cache bump for workoutGenerator.js v1.11 (exported
 * AVAILABLE_TIME_WINDOW_MINUTES) and coach-proposal.js v12 (fixed
 * _getAvailableTime() root cause — was reading from store fields never
 * written by checkin.js, always fell back to a hardcoded 30, silently
 * clobbering the correct availableTime value on every proposal-screen
 * mount). Both files already present in SHELL_URLS below - no new entries
 * required, this is a cache-bust only.
 *
 * 24 Jul 2026 v177
 * BUILD-5 cache bump for workoutGenerator.js v1.10 (available-time duration
 * cap fix). File already present in SHELL_URLS below - no new entries
 * required, this is a cache-bust only.
 *
 * 23 Jul 2026 v176
 * BUILD-3 Section 4 - the 4 files with no partial-save behaviour at all.
 *   Ground-truthed and, per Graeme's decisions this session, fixed:
 *   breathing-session.js v2 - never imported session-guard.js, so the
 *     back gesture bypassed the on-screen Exit button's existing
 *     partial-save logic (elapsed >= 30s). Wired mountSessionGuard() to
 *     reuse that same threshold. On-screen button behaviour unchanged.
 *   morning-session.js v2 - a genuine 20-40 min, 5-block programme with
 *     zero partial-save by explicit design ("Progress will not be
 *     saved"). Graeme: add partial-save tracking. Added
 *     savePartialSession(), wired mountSessionGuard(), on-screen Exit
 *     button now saves and its confirm text was updated to match.
 *   prescribed-session.js v2 - same all-or-nothing design as
 *     morning-session.js. Same decision, same fix shape - added
 *     savePartialSession() (using store.logActivity(), this file had no
 *     prior direct-write convention to preserve), wired
 *     mountSessionGuard().
 *   quiet-session.js v5 - mindful mode (5-20 min) had zero exit
 *     protection of any kind on either exit path - the most exposed of
 *     the four. Graeme: full exit-confirm + partial-save, matching every
 *     other session type (not just the back-gesture-only fix used
 *     elsewhere). Rewrote stopMindful() to show the shared
 *     showExitCard() confirmation; wired mountSessionGuard() for the
 *     back-gesture path.
 *   quiet-session.js's short breathing/journal exercises are unaffected
 *   by design (completion-only, not a gap).
 *   Cache bump for: breathing-session.js, morning-session.js,
 *   prescribed-session.js, quiet-session.js. All four already present in
 *   SHELL_URLS below - no new entries required.
 *
 * 23 Jul 2026 v175
 * BUILD-3 session-view exit-guard audit fix. The gap found and fixed in
 *   yoga-session.js v4 (21 Jul, see v174 entry below) was confirmed via
 *   static QA to also exist in 5 more session views: core-session.js,
 *   cycle-session.js, running-session.js, swim-session.js, walk-session.js
 *   — each had an onExit (mountSessionGuard) callback that reset the
 *   session and navigated to reflect.js WITHOUT calling
 *   savePartialSession() first, silently dropping partial progress on
 *   the device back-gesture exit path (the on-screen Exit button's own
 *   handler always called it correctly). All 5 fixed to match
 *   yoga-session.js v4's confirmed-working pattern exactly.
 *   Bundled while each file was open (Section 2 Step 5, deliberate not
 *   silent): finaliseSession()/endSession() and savePartialSession() in
 *   all 5 files migrated from direct activityLog writes to
 *   store.logActivity() (dedupe-guarded shared path, store.js v10).
 *   Second bug found in core-session.js: savePartialSession() referenced
 *   an undeclared `elapsed` variable for durationMins — this session
 *   type has no running clock (only per-exercise hold timers), so
 *   durationMins was silently always null. Matched yoga-session.js v4's
 *   same fix: left explicitly null with a comment rather than fabricated.
 *   Third bug found in walk-session.js: endSession() never set
 *   status:"completed" at all (every other session view does) — fixed
 *   as part of the same rewrite.
 *   Cache bump for: core-session.js, cycle-session.js, running-session.js,
 *   swim-session.js, walk-session.js. All five already present in
 *   SHELL_URLS below — no new entries required.
 *   Not yet actioned: the 4 files with no partial-save behaviour at all
 *   (breathing-session.js, morning-session.js, prescribed-session.js,
 *   quiet-session.js) — separate decision conversation, not a code fix,
 *   tracked on the master schedule.
 *
 * 21 Jul 2026 v174
 * navfix-proposalloop session. Two paired fixes deployed together:
 *   (1) Nav escape hatch — a persistent, minimal Home icon now appears
 *   on every hideNavViews screen (intention, coach-proposal,
 *   coach-reflection, all session views, etc), giving a way back to
 *   Today without the full bottom nav reappearing. Markup + inline
 *   styling in index.html v2; visibility toggled by router.js v9's
 *   _mountView() using the existing hideNavViews check; click wired in
 *   app.js v7 to a new requestExit() export from session-guard.js v2.
 *   requestExit() reuses the exact same exit-confirmation card and
 *   per-view onExit contract as the existing back-gesture guard, so an
 *   active session is protected identically regardless of which exit
 *   path the user takes.
 *   (2) Proposal-loop fix — today.js v4's _resolveState() now checks
 *   session-done before proposal-accepted, so completing a session
 *   within 10 minutes of accepting a proposal correctly lands on "You
 *   moved today" instead of stranding the user back on the Coach
 *   Proposal/threshold screen. Confirmed no regression to the genuine
 *   "just accepted, nothing completed yet" case.
 *   Bug found and fixed while ground-truthing (1): yoga-session.js v4 —
 *   the session guard's onExit callback (fired on back-gesture, and now
 *   also the new Home icon) reset the session and navigated to
 *   reflect.js WITHOUT calling savePartialSession() first, silently
 *   dropping partial progress on that exit path since v1. The on-screen
 *   Exit button's own handler always called it correctly — only the
 *   guard path was missing it. Fixed to match.
 *   Not yet verified: whether the other 10 session view files have the
 *   same missing-savePartialSession gap in their own guard onExit
 *   callbacks — flagged for a future session, not checked here.
 *   Cache bump for: index.html, app.js, router.js, session-guard.js,
 *   yoga-session.js, today.js. All six already present in SHELL_URLS
 *   below — no new entries required.
 *
 * 19 Jul 2026 v173
 * S4-B3-3 completion session. Deployed together: intention.js v8 (Yoga
 *   branch — selecting Yoga from the self-directed picker now routes to
 *   yoga-session.js's full guided pose-by-pose experience, matching
 *   coach-proposal.js's Door 1 equivalent path, per Graeme's decision
 *   17 Jul); components/reflect.css (new file — .reflect-textarea and
 *   .reflect-chips had no existing CSS anywhere in the repo, confirmed
 *   via GitHub code search, not an override bug — fixes the contrast/
 *   sizing issue confirmed twice on-device); main.css v10 (adds the
 *   reflect.css import). Added reflect.css to SHELL_URLS below.
 *   Two-screens investigation (also this session) produced no code
 *   change — coach-reflection.js is the real daily-use "Today" screen;
 *   intention.js is live but only reached via session-exit "back"/
 *   "home" buttons (e.g. in yoga-session.js) — findings recorded in
 *   the session handoff, not requiring a cache-relevant file change.
 *   Cache bump only for the three files above; no other files changed
 *   this deploy.
 *
 * 14 Jul 2026 v172
 * journal-entry.js v3, checkin-openings.js v2, quiet-session.js v4 —
 *   Session B2 findings, deployed. journal-entry.js/checkin-openings.js:
 *   Journal Privacy Rule fix (Appendix D) — removed signal detection on
 *   journal text (write side) and the journal-content-derived Mode 5
 *   milestone trigger that read it (read side); the latter was live and
 *   firing in production, not dormant. quiet-session.js: added missing
 *   `router` import — onMount()'s back-button handlers were calling
 *   router.navigate() with no import, a live ReferenceError on the only
 *   entry point to mindful movement (via noticing.js). Cache bump only,
 *   so already-installed clients pick up all three corrected files
 *   rather than continuing to serve the pre-fix cached copies.
 *
 * 14 Jul 2026 v171
 * index.html v1 — Sentry error monitoring loader script added to <head>
 *   (Session A, item 1, DSN received and confirmed working end-to-end:
 *   Sentry Issues showed a live "Error | test-3" event, Unhandled,
 *   after a setTimeout-wrapped throw — confirmed on device). Cache
 *   bump only, so already-installed clients pick up the new index.html
 *   rather than continuing to serve the pre-Sentry cached copy.
 *
 * 14 Jul 2026 v170
 * workout.js v4 — closed the workout.js -> activityLog gap (Session A,
 *   items 2 & 3). completeWorkout() now pushes an activityLog entry
 *   (date/completedAt/type:'workout'/durationMins/moodAfter/isEvent/
 *   eventName) alongside its existing workoutHistory write. today.js's
 *   _resolveState() needed this to detect "session-done" — confirmed
 *   working end-to-end on device this session ("You moved today.
 *   That's done." correctly shown after waiting out the 10-minute
 *   proposal-accepted window). No schema change required — the entry
 *   shape already matched store.js v8's documented activityLog fields.
 *   Deploy-verification habit: live GitHub Pages fetch of workout.js/
 *   today.js/sw.js returned binary/unreadable content this session —
 *   fell back to Graeme pasting full file contents per the Ground
 *   Truth Rule's documented fallback. Cache-bump only otherwise; no
 *   other files changed this deploy.
 *
 * 12 Aug 2026 v264 - C1-C4 third-pass fixes: session-builder.js v22,
 *   store.js v30. legPower fail-safe default, contentType 'practice'
 *   excluded from component selection, duration arithmetic corrected at
 *   both call sites, sessions trimmed to requested duration. Cache bump
 *   only, no new files.
 *
 * 11 Aug 2026 v235 - PT-12: store.js v21, gym-programme.js v7,
 *   journal-entry.js v4, morning-session.js, intention.js. Reader-without-
 *   writer sweep - exerciseFeedback given a writer, journalEntryType given a
 *   reader, checkin.energy/todayEnergy corrected. Cache bump only.
 *
 * 11 Aug 2026 v234 - PT-11: session-builder.js v4. Difficulty ceiling applied
 *   to its private 65-exercise pool, which never filtered on fitness. Cache
 *   bump only.
 *
 * 11 Aug 2026 v233 - PT-4/WOW-6: store.js v20 (liftLog), gym-programme.js v6,
 *   settings.js v15, gym-programme.css v2. Lift notes as a memory aid, off by
 *   default. Cache bump only, no new files.
 *
 * 11 Aug 2026 v232 - PT-1 copy audit: changing-body b2 made self-contained,
 *   escalation-trap tidied. All 19 DAY_ONE rows checked for orphan referents.
 *
 * 11 Aug 2026 v231 - PT-1 follow-up: checkin-openings.js content refinements.
 *   hormonal-change reframed to changing-body (no longer claims a disclosure
 *   that never happened, no longer age-gated to the over-50s).
 *
 * 11 Aug 2026 v230 - PT-1/WOW-3: checkin-openings.js v3. Day-one territory
 *   and age-band trigger maps corrected to the live IDs; five purpose-written
 *   rows added. The coach now reflects back what onboarding was told.
 *
 * 11 Aug 2026 v229 - WOW-4 (PT-7): session-builder-ui.js v5, progress.js v3,
 *   progress.css v3. Locked controls moved onto lockedFeature(); free-tier
 *   Progress window 7 -> 30 days. Cache bump only, no new files.
 *
 * 11 Aug 2026 v228 - WOW-0: store.js v19 (new consent{}), thread.js v8
 *   (consent gate before Step 1), privacy.js v2, onboarding-thread.css v5.
 *   Restores the legal consent record absent since OB-THREAD. No new files
 *   to precache - onboarding-thread.css already listed. Cache bump only.
 *
 * 11 Aug 2026 v227 - WOW-1 (PT-3): workout.js v8, core-session.js v7,
 *   yoga-session.js v8. Session-level clocks added; all six activityLog
 *   write paths now report real elapsed minutes instead of null.
 *
 * 11 Aug 2026 v226 - WOW-2 (PT-2/PT-9): workoutGenerator.js v1.14,
 *   exercises.js + exercises/index.js v1.4, exercises/yoga.js v2.
 *   fitnessLevel now resolves from lifestyle.activityLevel (the field live
 *   onboarding writes); "returning" ceiling added; Crescent Lunge made
 *   reachable. No new files — cache bump only.
 *
 * (Earlier history — alongside-v130 through v169 — unchanged, see prior
 * versions of this file for full detail.)
 *
 * sw.js must always be the LAST file deployed in any batch.
 */

const CACHE_NAME = "alongside-v330";

const SHELL_URLS = [

  // App shell
  "/alongside-app/",
  "/alongside-app/index.html",

  // CSS
  "/alongside-app/css/main.css",
  "/alongside-app/css/layouts/onboarding-additions.css",
  "/alongside-app/css/layouts/today.css",
  "/alongside-app/css/layouts/conditions-update.css",
  "/alongside-app/css/layouts/library.css",
  "/alongside-app/css/layouts/mobility-conditioning.css",
  "/alongside-app/css/layouts/progress.css",
  "/alongside-app/css/components/session-guard.css",
  "/alongside-app/css/components/weekly-plan.css",
  "/alongside-app/css/components/breathing-session.css",
  "/alongside-app/css/components/quiet-session.css",
  "/alongside-app/css/components/noticing.css",
  "/alongside-app/css/components/coach-proposal.css",
  "/alongside-app/css/components/settings.css",
  "/alongside-app/css/components/weekly-plan-v2.css",
  "/alongside-app/css/components/gym-programme.css",
  "/alongside-app/css/components/journal-entry.css",
  "/alongside-app/css/components/reflect.css",
  "/alongside-app/css/components/nav-fix.css",
  "/alongside-app/css/components/onboarding-thread.css",
  "/alongside-app/css/components/sheet-manager.css",
  "/alongside-app/css/components/settings-reflection.css",
  "/alongside-app/css/components/checkin-conversation.css",
  "/alongside-app/css/components/display-preferences.css",
  "/alongside-app/css/components/session-log.css",
  "/alongside-app/css/components/grounding-moments.css",
  "/alongside-app/css/components/single-activity-session.css",
  "/alongside-app/css/components/session-shared.css",
  "/alongside-app/css/components/upgrade-door.css",
  "/alongside-app/css/components/upgrade-page.css",

  // CSS completeness, same pass. main.css @imports these, and an @import
  // from a cached stylesheet is still its own network request.
  "/alongside-app/css/base/global.css",
  "/alongside-app/css/base/reset.css",
  "/alongside-app/css/base/typography.css",
  "/alongside-app/css/base/variables.css",
  "/alongside-app/css/components/buttons.css",
  "/alongside-app/css/components/cards.css",
  "/alongside-app/css/components/checkin.css",
  "/alongside-app/css/components/coach-fix.css",
  "/alongside-app/css/components/equipment-modal.css",
  "/alongside-app/css/components/morning-session.css",
  "/alongside-app/css/components/settings-library.css",
  "/alongside-app/css/components/workout.css",
  "/alongside-app/css/layouts/app-shell.css",
  "/alongside-app/css/layouts/goal-setup.css",
  "/alongside-app/css/layouts/onboarding.css",

  "/alongside-app/css/components/tier-gating.css",

  // Core JS
  "/alongside-app/js/app.js",
  "/alongside-app/js/router.js",
  "/alongside-app/js/store.js",
  "/alongside-app/js/session-log.js",
  "/alongside-app/js/exercise-feedback.js",
  "/alongside-app/js/display-prefs.js",
  "/alongside-app/js/tts.js",
  "/alongside-app/js/session-guard.js",
  "/alongside-app/js/session-resume.js",
  "/alongside-app/js/auth.js",

  // Views — main
  "/alongside-app/js/views/today.js",
  "/alongside-app/js/views/conditions-update.js",
  "/alongside-app/js/views/mobility-conditioning.js",
  "/alongside-app/js/views/checkin.js",
  "/alongside-app/js/views/checkin-mini.js",
  "/alongside-app/js/views/intention.js",
  "/alongside-app/js/views/coach-proposal.js",
  "/alongside-app/js/views/coach-reflection.js",
  "/alongside-app/js/views/workout.js",
  "/alongside-app/js/views/workout-complete.js",
  "/alongside-app/js/views/progress.js",
  "/alongside-app/js/views/settings.js",
  "/alongside-app/js/views/weekly-plan.js",
  "/alongside-app/js/views/reflect.js",

  // ── PRECACHE GAP CLOSED, 12 Aug 2026 (EMP-1 / INF-CACHE) ──────────
  // Three DEAD entries also removed in the same pass, and two of them
  // explain part of the gap: swimming-cycling.js and
  // sport-conditioning.js were listed with HYPHENS while the real files
  // use underscores (swimming_cycling.js, sport_conditioning.js), so
  // those two exercise categories have never once been precached while
  // appearing to be. views/about.js was removed on 12 Aug and its entry
  // outlived it. allSettled meant all three failed silently forever.
  //
  // Found while adding data/empathy-transfer.js: 25 of 98 JS modules
  // were absent from this list, along with 15 CSS files. Among them the
  // whole onboarding flow, four exercise category files from the 12 Aug
  // CON work, session-rationale.js and upgrade.js.
  //
  // Accurate severity, checked rather than assumed: the fetch handler is
  // cache-first then network-and-cache, so an unlisted file caches on
  // first online use. This was never "offline is broken". The exposure is
  // a route opened for the FIRST time with no signal. Precaching makes
  // offline guaranteed instead of dependent on where somebody happened
  // to have browsed. Install uses Promise.allSettled(), so a stale entry
  // degrades rather than breaking install -- which is also exactly why
  // neither the gap nor the three dead entries were ever noticed.
  "/alongside-app/js/data/empathy-transfer.js",
  "/alongside-app/js/data/equipment-map.js",
  "/alongside-app/js/data/exercises.js",
  "/alongside-app/js/data/exercises/gym.js",
  "/alongside-app/js/data/exercises/seated.js",
  "/alongside-app/js/data/exercises/sport_conditioning.js",
  "/alongside-app/js/data/exercises/swimming_cycling.js",
  "/alongside-app/js/data/morning-programme.js",
  "/alongside-app/js/data/session-categories.js",
  "/alongside-app/js/data/session-rationale.js",
  "/alongside-app/js/data/personal-reads.js",
  "/alongside-app/js/views/activity-log.js",
  "/alongside-app/js/views/annual-reflection.js",
  "/alongside-app/js/views/community-impact.js",
  "/alongside-app/js/views/home-threshold.js",
  "/alongside-app/js/views/onboarding/about.js",
  "/alongside-app/js/views/onboarding/arrival.js",
  "/alongside-app/js/views/onboarding/body.js",
  "/alongside-app/js/views/onboarding/complete.js",
  "/alongside-app/js/views/onboarding/frequency.js",
  "/alongside-app/js/views/onboarding/hard-before.js",
  "/alongside-app/js/views/onboarding/lifestyle.js",
  "/alongside-app/js/views/onboarding/name.js",
  "/alongside-app/js/views/onboarding/reflection.js",
  "/alongside-app/js/views/onboarding/welcome.js",
  "/alongside-app/js/views/upgrade.js",

  "/alongside-app/js/views/privacy.js",
  "/alongside-app/js/views/onboarding/goal-setup.js",
  "/alongside-app/js/views/library.js",
  "/alongside-app/js/session-builder.js",
  "/alongside-app/js/views/session-builder-ui.js",
  "/alongside-app/js/views/noticing.js",
  "/alongside-app/js/views/in-step.js",
  "/alongside-app/js/data/in-step-scenarios.js",
  "/alongside-app/js/views/journal-entry.js",
  "/alongside-app/js/views/gym-programme.js",

  // Views — session types
  "/alongside-app/js/views/prescribed.js",
  "/alongside-app/js/views/prescribed-session.js",
  "/alongside-app/js/views/quiet-session.js",
  "/alongside-app/js/views/breathing-session.js",
  "/alongside-app/js/views/morning-session.js",
  "/alongside-app/js/views/core-session.js",
  "/alongside-app/js/views/yoga-session.js",
  "/alongside-app/js/views/walk-session.js",
  "/alongside-app/js/views/running-session.js",
  "/alongside-app/js/views/swim-session.js",
  "/alongside-app/js/views/cycle-session.js",

  // Views — onboarding (OB-THREAD)
  "/alongside-app/js/views/onboarding/thread.js",
  "/alongside-app/js/views/onboarding/sheet-manager.js",
  // Sheet content — reused by sheet-manager.js, not router-navigated directly
  "/alongside-app/js/views/onboarding/goals.js",
  "/alongside-app/js/views/onboarding/conditions.js",
  "/alongside-app/js/views/onboarding/equipment.js",
  "/alongside-app/js/views/onboarding/plan-select.js",

  // Data
  "/alongside-app/js/data/beat3-scripts.js",
  "/alongside-app/js/data/onboarding-thread-data.js",
  "/alongside-app/js/data/checkin.js",
  "/alongside-app/js/data/checkin-openings.js",
  "/alongside-app/js/data/conditions.js",
  "/alongside-app/js/data/conditionProgrammes.js",
  "/alongside-app/js/data/equipment.js",
  "/alongside-app/js/data/goals.js",
  "/alongside-app/js/data/workoutGenerator.js",
  "/alongside-app/js/data/programmeEngine.js",
  "/alongside-app/js/data/programmes.js",
  "/alongside-app/js/data/signal-words.js",
  "/alongside-app/js/data/grounding-moments.js",
  "/alongside-app/js/data/feelings.js",
  "/alongside-app/js/data/coach-voice.js",

  // Exercise database
  "/alongside-app/js/data/exercises/index.js",
  "/alongside-app/js/data/exercises/strength.js",
  "/alongside-app/js/data/exercises/cardio.js",
  "/alongside-app/js/data/exercises/mobility.js",
  "/alongside-app/js/data/exercises/yoga.js",
  "/alongside-app/js/data/exercises/pilates.js",
  "/alongside-app/js/data/exercises/running.js",
  "/alongside-app/js/data/exercises/rehabilitation.js",
  "/alongside-app/js/data/exercises/recovery.js",
  "/alongside-app/js/data/exercises/mindfulness.js",

  // Assets
  "/alongside-app/assets/images/logo-icon-small.png",
  "/alongside-app/assets/images/logo-icon-square.png",
  "/alongside-app/assets/images/logo-icon-128.png",
  "/alongside-app/assets/images/logo-icon-192.png",
  "/alongside-app/assets/images/logo-icon-512.png"

];

// Message handler
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // VER-2, 12 Aug 2026. Report the version THIS worker is serving.
  //
  // VER-1 had the About screen read caches.keys() and pick the entry
  // starting "alongside-v". That answers a different question: which
  // caches EXIST, not which one is serving the page. During an update
  // both exist, so About showed v303 while the page was still running
  // v302's JavaScript -- Graeme saw the new version number and the old
  // Settings screen at the same time.
  //
  // Worse than the original hardcoded 115, in a way: a number that is
  // confidently wrong only during an update is exactly when somebody
  // checks it.
  if (event.data?.type === "GET_VERSION") {
    event.source?.postMessage({ type: "VERSION", version: CACHE_NAME.replace("alongside-", "") });
  }
});

// Install — cache the app shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // SW-2, 12 Aug 2026. THE REASON THREE CORRECT FIXES DID NOT REACH
      // THE DEVICE.
      //
      // This was cache.add(url), which fetches through the BROWSER HTTP
      // CACHE. GitHub Pages serves JS with a long max-age, so the browser
      // answered from its own store with a 200 and the service worker
      // dutifully wrote that STALE FILE into the shiny new v307 cache.
      //
      // So every version bump created a correctly-named cache full of old
      // code. SW-1 scoped lookups to the current cache and could not help,
      // because the current cache was the problem. Graeme saw v307 in
      // About and pre-EQUIP-3 behaviour on screen, for the third time, and
      // was right to say a patch was not working.
      //
      // cache:"reload" forces a network fetch and bypasses the HTTP cache
      // entirely. A Request built this way is what cache.put stores, so
      // the new cache now contains what was actually deployed.
      //
      // This is also why "clear site data" kept appearing to fix it: that
      // wiped the HTTP cache too, so the next install fetched real files.
      return Promise.allSettled(
        SHELL_URLS.map(url =>
          fetch(new Request(url, { cache: "reload" }))
            .then(res => {
              if (!res || res.status !== 200) throw new Error(`bad status ${res && res.status}`);
              return cache.put(url, res);
            })
            .catch(() => {
              console.warn("SW: could not cache", url);
            })
        )
      );
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate — delete old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("SW: deleting old cache", key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch — cache-first for shell, network for everything else
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // SW-1, 12 Aug 2026. THE BUG THAT MADE EVERY OTHER FIX UNRELIABLE.
  //
  // This was caches.match(event.request) -- a GLOBAL lookup across every
  // cache the origin holds, oldest first. So an old alongside-v2xx cache
  // could answer for settings.js while sw.js itself was v304, and the
  // About screen would honestly report v304 while the page ran code from
  // twelve versions ago.
  //
  // That is exactly what Graeme saw: v304 in About, the old Settings tab
  // strip on screen, on what he correctly described as a fresh fetch.
  // It was fresh; the service worker answered from a cache the activate
  // handler had not got round to deleting, and a hit is a hit.
  //
  // It also explains why "close it fully and reopen" kept being the
  // advice all day. Nothing about that was reliable -- whether a fix
  // appeared depended on which cache happened to answer first.
  //
  // Scoped to CACHE_NAME. A miss now falls through to the network, which
  // is correct: the newest cache is the only one that should ever answer,
  // and anything it lacks should be fetched rather than guessed at from
  // history.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          cache.put(event.request, response.clone());
          return response;
        }).catch(() => {
          // Offline navigation: the shell from THIS cache, not any older one.
          if (event.request.mode === "navigate") {
            return cache.match("/alongside-app/index.html");
          }
        });
      })
    )
  );
});
