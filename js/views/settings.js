/**
 * settings.js
 * 01 Oct 2026 v55
 *
 * v55 - B5 EVIDENCE. A research message holds its question in place: the
 *   survey's two questions, or Share my figures' exact figures, the line
 *   that it cannot be found again once sent, and Send. Nothing is sent
 *   before Send; a failed send keeps nothing and says so (evidence.js).
 *
 * v55 - B4 MESSAGES. Settings › Messages: the page's first row ("New" in words
 *   when there is one not yet seen), a screen listing them, newest first,
 *   each with Dismiss, and the News from Build New Habits switch (off).
 *   Opening the screen marks them seen, which clears the dot on the tab.
 *   Rules and fetching live in js/data/messages.js.
 *
 * v55 - B2 RESTORE-LOCK. Download your data opens a short dialog: an
 *   optional password, typed twice, with the warning that a forgotten
 *   password means nobody can open the file. With one, the file is locked
 *   on this device (js/data/file-lock.js) and named -locked. Restore from a
 *   file asks for the password of a locked file before anything else; a
 *   wrong one changes nothing. The password is never kept.
 *
 * 01 Oct 2026 v54
 *
 * v54 - BUNDLE-TRUE. With the health consent withdrawn, Your profile offers
 *   no weight entry and a weight is not saved (the Your weight row was
 *   already hidden; the profile panel's copy was not). Found by the
 *   independent check of the Foot Anstey bundle.
 *
 *
 * v53 - RESTORE. Restore from a file brings a person's history to a new
 *   device from the file Download your data saved (js/data/restore.js).
 *   It replaces what is on this device after a confirmation that says what
 *   the file holds; this device's age answer and agreements stay. Offered
 *   only once the health consent is given here. Download your data now
 *   says the file is readable by anyone who has it.
 *
 * v52 - LEGAL-TRUE 2. Delete my health answers' confirmation names a target
 *   weight, which it now deletes.
 *
 * v51 - LEGAL-TRUE. Reset all data clears every key the app keeps on this
 *   phone. Delete my health answers' confirmation names everything it
 *   deletes, now including what you told the app about your body. What
 *   your body can do asks for the health consent first, while it is needed.
 *
 * v50 - PT-3 TRUE-PRIVACY-WORDS. The Reminders group and panel are gone:
 *   nothing ever sent a reminder. How your data is kept says how (this
 *   phone, Sentry, download, delete). Display no longer says "your
 *   account" -- there are no accounts.
 *
 * v49 - PT-2 HEALTH-CONSENT. Your plan and your data gains Delete my health
 *   answers (store.deleteHealthAnswers(): check-ins, sore areas and scores,
 *   weight, journal, session notes; consent withdrawn, asked again before
 *   the next health question). While health consent is not given, Add or
 *   change areas asks for it first, and the weight rows are not offered.
 *
 * v48 - W3-17 MAINTAIN-INTENT (persona Wave 3, 2.4). "What are we aiming
 *   at?" was asked once, at sign-up, and nothing changed it. "What you're
 *   aiming at" is on the page, beside how sessions change, with the same
 *   three answers onboarding offers (INTENT_CHIPS), and saves as it
 *   changes.
 *
 * v47 - W3-8 CYCLE-CLAIM (persona Wave 3, 2.4). Settings offered
 *   "Cycle-aware coaching - Adapts sessions to your hormonal cycle" in two
 *   places; nothing outside the store read the field, so it was a claim
 *   the app could not back. Both switches are gone; the stored field stays
 *   so existing data still loads.
 *
 * v46 - P24, LENGTH (persona finding W2-20). Nothing asked how long a
 *   session somebody has: the plan assumed 30 minutes and its Length
 *   control cycles through six values. "How long you usually have", a
 *   real choice beside "How much sessions change"; it writes availableTime,
 *   the value the plan starts from; the plan's Length writes the same
 *   value, and the hint says so. Onboarding is not made longer for it.
 *
 * v45 - P19, "MOSTLY THE SAME". The option's hint said "About two thirds of
 *   a session repeats from the last one"; the setting now holds the warm-
 *   up, sections and doses and repeats about nine tenths, measured over
 *   ten sessions. It says so: "Most of each session repeats from the last
 *   one, and it starts the same way. A move changes now and then."
 *
 * v44 - P14. The check-in no longer asks how much sessions should change;
 *   this row is the one place it is set. Its hint said "The coach also
 *   asks this before a session" and now says what is true.
 *
 * v43 - P11. Activity level is one answer. Onboarding writes
 *   lifestyle.activityLevel; this screen showed and wrote only
 *   fitnessLevel, so it said "Not set" after it was answered, and its
 *   list lacked "Coming back after a break". It now shows the value the
 *   coach reads (fitnessLevel, else lifestyle.activityLevel), in the words
 *   it was chosen in (ACTIVITY_CHIPS), and a change writes both.
 *   verify-onboarding-echoes.
 *
 * v42 - P0, SCOPE-MINOR. "Sore or injured areas" (was Conditions and injuries), with the scope statement; Add or change opens the sore-areas sheet (Conditions Update is retired).
 *
 * 28 Sep 2026 v41
 *
 * v41 - F7 LANDMARK. role="main" (and its label) removed from the view's
 *   wrapper: index.html's <main> is the one main landmark; a second,
 *   nested inside it, is announced twice and fails landmark rules.
 *
 * v40 - F6, REDUCE-MOTION-ROW. Display › Reduce motion: off follows the
 *   device (as the app always has), on reduces motion here too.
 *
 * 28 Sep 2026 v39
 *
 * v39 - SMOOTH-P5. Your plan shows the one table (tier-table.js) for
 *   both tiers instead of its own paragraphs about the Plan.
 *
 * v38 - SMOOTH-P4c. Settings is one page. Spec 4.10.
 *
 *   "Changes save as you make them." Eight groups -- You, Goals and your
 *   week, How the coach works, Reminders, Optional tracking, Display,
 *   Your plan and your data, About -- and every row shows its current
 *   value. Switches work in place. Tapping a row opens its own screen,
 *   where the existing explanatory copy now lives. TWO LEVELS AT MOST, NO
 *   TABS, NO SAVE BUTTONS: the six Save buttons are gone and every
 *   control writes the moment it changes, announced as "Saved" in a
 *   polite live region. NAV-5's sections and NAV-7's sub-tabs are
 *   retired with it; their panel renderers are the row screens.
 *
 *   NOTHING DROPPED. tools/fixtures/settings-inventory-v553.json lists
 *   every control the v553 Settings rendered, captured by rendering it;
 *   verify-settings-inventory requires each one within two taps of this
 *   page, except the six Save buttons, which it requires to be GONE.
 *
 *   NEW: Download your data -- a file of everything the app keeps,
 *   journal included, built on the device and saved there. Graeme, 28
 *   Sep: "I don't want to have to do this manually through email. I'm a
 *   sole trader." Shown (LEGAL-AS-APPROVED); its wording goes into the
 *   privacy policy for the solicitor (12g).
 *
 *   NEW: It's better now / It's back, per condition (conditionsResolved,
 *   store.js v78): the person's call, never the app's.
 *
 *   Goals: "Tone up" is no longer offered; "Lose weight" only with weight
 *   tracking on (offeredGoals()). Goals already chosen stay.
 *
 * v37 - Smooth Path P0, C2 and C3.
 *   C2 PLAN-CLAIM. About > Plan said the Plan opens "the long practices
 *   in Wellbeing" -- withdrawn from the upgrade page on 13 Aug because it
 *   is not true (upgrade.js, the WITHDRAWN note). Settings kept it for six
 *   weeks. The block now makes only claims upgrade.js has verified.
 *   C3 VERSION. With no controlling service worker (first open, private
 *   browsing, a blocked worker) the label read "vunknown". It now falls
 *   back to reading CACHE_NAME from sw.js itself, and says "Version not
 *   available" rather than inventing a string, if even that fails.
 *   See tools/verify-plan-claims.mjs.
 *   SMOOTH-P1 (same version, same day). "How much should the coach ask
 *   before a session?" is removed: every check-in is now the short one
 *   (three questions), so there is nothing left to choose. sessionPace
 *   stays in the store for one release and is no longer read.
 *
 * v36 - TIER-VISIBLE. The tier a device is in was displayed in exactly
 *   one place: inside the developer panel, which is hidden behind an
 *   undocumented triple-tap. So a device could sit in the Plan with no
 *   visible sign anywhere, and the person using it had no way to know.
 *
 *   That is how Graeme came to ask why free was showing him the arc on
 *   06 Sep. It was not: his handset was on "personal" and nothing said
 *   so. The arc is correctly gated at today.js:690.
 *
 *   The cost is not confusion, it is CONTAMINATED EVIDENCE. A beta
 *   tester who switches once and forgets will report on "free" while
 *   being shown the Plan, and their feedback will read as valid. The
 *   same applies to every on-device judgement made so far.
 *
 *   FIX: show it. Knowing which plan you are on is legitimate product
 *   for a paying user, not a debug affordance -- so this ships to
 *   everyone rather than hiding behind the same flag it is meant to
 *   compensate for.
 *
 *   It reads isPremium(), the SAME predicate that gates the arc, rather
 *   than store.get("tier") directly. A second reading of the raw field
 *   could drift from what the app actually gates on; this cannot.
 *
 *   Deliberately NOT done: flipping DEV_PANEL_ENABLED. That would freeze
 *   every device in whatever tier it is already wrongly in, fix nothing,
 *   and contradict the 13 Aug decision that testers need the switcher
 *   during beta. The flip condition stays what A1 set it to: public
 *   launch, January 2027.
 *
 * v35 - CARD-1. "Always show full instructions" added to the Display
 *   panel. Overrides every collapse in the exercise card. Sits with the
 *   other access preferences and, per the P3 note in display-prefs.js,
 *   is never offered on a timer or in onboarding.
 *
 * 22 Aug 2026 v34
 *
 * v34 - WEIGHT-1b (Settings half). Weight tracking, off by default,
 *   Plan only.
 *
 *   THE FIRST TIER GATE IN THIS FILE. settings.js has never imported
 *   isPremium or lockedFeature -- the two prior mentions were comments.
 *   So this is a precedent, not a line: the pattern followed is
 *   library.js:144 and my-programme.js:99.
 *
 *   Free sees NOTHING of it. Not a locked row, not a greyed switch.
 *   Somebody who cannot use a feature does not need to be shown the
 *   shape of it every time they open their profile.
 *
 *   The toggle is the CONSENT. Turning it on is what lets the coach
 *   speak to a weight target at all -- goal-review.js reads
 *   weightTracking and will not raise a weight target without it.
 *
 *   Weight is stored in CANONICAL KILOGRAMS always; weightUnit is a
 *   display preference only. Somebody working in stone and pounds
 *   enters and sees 12 st 4 lb and the stored number is kg. The bands
 *   compare a rate against a threshold, so a value that is sometimes 80
 *   and sometimes 176 would let any consumer that forgot to convert
 *   compare the wrong quantities -- and the 3 lb/week refusal is the
 *   one place here where being wrong by a factor of 2.2 is
 *   unacceptable.
 *
 *   NO WEIGH-IN PROMPT ANYWHERE. Not here, not as a reminder, not as a
 *   badge, not as an empty state that reads as an unfinished task.
 *   Frequent weighing is itself a risk behaviour, so the entry point is
 *   passive: a control that is there when looked for, and silent
 *   otherwise.
 *
 * 20 Aug 2026 v33
 *
 * v33 - PLAIN-1. THREE LIVE FALSEHOODS REMOVED from the "What the Plan
 *   adds" block, all on a page asking somebody to buy:
 *
 *   1. "Sessions become yours -- the kind, the length, and how the time
 *      is spent." R4 moved all three to FREE the same morning.
 *   2. "And the longer practices open up." This is the exact statement
 *      WITHDRAWN from upgrade.js v6 on 13 Aug for being untrue. It was
 *      removed from that page and left standing here -- which is how a
 *      correction becomes half a correction.
 *   3. "The yearly rate holds until the end of November 2026." PRICE-2
 *      retired that on 18 Aug. A deadline already passed.
 *
 *   Replacements each name the file that makes them true. The 30-day
 *   trial replaces the dead deadline.
 *
 * 18 Aug 2026 v32
 *
 * v32 - ATHLETE-RETIRE. Dev tier switcher loses its Athlete button.
 *
 *
 * v31 - COACH-TILE. New "Your Coaching" row on the Settings landing,
 *   holding capability, the two preference controls and the
 *   reflection -- all three lifted out of Profile unchanged. The
 *   landing had three rows and a screen of empty space while the
 *   controls that decide what the coach puts in front of somebody sat
 *   below their name and age band.
 *
 *   PRICE-2 follow-up: the annual price now reads the constant rather
 *   than repeating the number in prose. Logged as 🟠 in v30 and done
 *   here rather than left -- a price that exists twice is a price
 *   that goes wrong in one place, which is exactly how v30 happened.
 *
 *
 * v30 - PRICE-2. The annual price said £49.99. Found by the new
 *   verify-price.mjs sweep on the day it was written, not by anybody
 *   looking -- this file publishes the price in prose, a second copy
 *   of a number upgrade.js holds in a constant precisely so it exists
 *   in one place. The duplication is the fault; the wrong figure was
 *   only its symptom. 🟠 Logged: this should read the constant.
 *
 *
 * v29 - NAME-1. The paid tier is "the Plan", not "Personal".
 *   Graeme's decision, 18 Aug. Copy only -- no logic, no gating
 *   and no tier boundary moved. Reasoning in js/auth.js v2.
 *
 * 16 Aug 2026 v28
 *   COUNTDOWN-1. The programme card said "Week 9 of 12". Second instance
 *   of the same fault as progress.js, found by making the gate
 *   product-wide instead of scoping it to the screen being built.
 *
 * 15 Aug 2026 v27
 *
 * v27 - PB-1. "Show your best" toggle, off by default and separate from
 *   session notes. Bests are recorded either way; this governs display.
 *
 * 15 Aug 2026 v26
 *
 * v26 - QUICK-1. sessionPace control in "How you like things". The
 *   short check-in asks energy and mood only; the pain question stays
 *   at either setting.
 *
 * 14 Aug 2026 v25
 *
 * v25 - D-3 / W2-7. "How you like things": the sessionVariety control and
 *   a reviewable, reversible list of exercises the person has asked to
 *   see less of or not at all. Deliberately not a "neurodivergent mode",
 *   and autism/ADHD deliberately not added to CONDITIONS -- see the note
 *   above renderPreferencesSection().
 *
 * 14 Aug 2026 v24
 *
 * v24 - AGE-1. The age select wrote its LABELS as values. Saving your age
 *   here stored 'Under 20' or '70+', which matched nothing anywhere, and
 *   dropped you out of the capability age trigger. Now imports AGE_CHIPS.
 *
 * 14 Aug 2026 v23
 *
 * v23 - W3-A2. Capability editor. Onboarding steps 9a-9d are forward-only,
 *   so before this a mis-tap on the chair question left somebody
 *   permanently restricted with no route back -- and capability is not
 *   static anyway. All four questions are editable here, including the two
 *   onboarding asks conditionally, because Settings is somewhere the
 *   person chose to go. "Not answered" is selectable on each, and blanking
 *   everything clears askedAt so the profile returns to its never-asked
 *   path rather than sitting at asked=true with all-null answers.
 *
 * 13 Aug 2026 v22
 *
 * v22 - A1 + A3, from the 13 Aug persona trace (blueprint
 *   alongside_blueprint_trust-tier-voice_13aug2026_v1.md).
 *
 *   A1 - DEV_PANEL_ENABLED. The developer tier switcher is fine and stays;
 *   what was not fine is that upgrade.js printed the gesture to open it in
 *   user-facing copy ("triple-tap the version number at the bottom of
 *   Settings"), on the one screen every locked feature routes to. That is
 *   how a bypass becomes a feature. The instruction is gone with the
 *   upgrade stub; the flag here is the mechanism, because a rule that
 *   lives only in a document is exactly what failed. Wrapping the LISTENER
 *   as well as the markup is the point -- hiding the panel while leaving
 *   the gesture live would leave a dead tap sequence that still fires.
 *
 *   A3 - about-plan panel. Traced across three weeks: a free user meets
 *   Personal ONLY as a padlock on something already denied. Never once as
 *   a description of what it is. For persona 2.12, whose defining trait is
 *   decision paralysis, a padlock is not information -- it is a closed
 *   door with no sign on it. The hook already existed: the About group's
 *   subtitle has read "...policies and your plan" since NAV-5 with
 *   nothing behind the last three words.
 *
 *   Deliberately the ONLY new proactive surface. P1 says the coach never
 *   sells and P3 forbids interruption on a timer. A panel somebody chooses
 *   to open breaches neither. Home, check-in and reflect would all convert
 *   better and all cost more than they are worth.
 *
 * v21 - NAV-5. Seven horizontal tabs replaced by three sections, using
 *   Graeme's own grouping: App Controls, Settings, About. Two of the
 *   three things he could not find anywhere in the app were in here, both
 *   in the fourth tab of a strip that scrolled with the scrollbar hidden.
 *   Session notes separated from Equipment -- it is a behaviour toggle,
 *   not a fact about what you own, and it was filed there because
 *   Equipment happened to be the smallest panel.
 *
 * 12 Aug 2026 v20
 *
 * v20 - VER-1. The About screen's version was hardcoded to '115' while
 *   the live cache was at v293. 178 versions of drift, on the ONLY
 *   surface that tells anybody which build their phone is running -- so
 *   every "are you on the latest?" check during device testing has been
 *   meaningless. This file's own v86 note describes exactly that
 *   confusion happening. Now read from the running service worker's
 *   cache name, and shows "unknown" rather than a confident wrong number
 *   if it cannot be read.
 *
 * 12 Aug 2026 v19
 *
 * v19 - SCHEME-1. Colour scheme control in Settings > Display: dark
 *   (default), light, high contrast. Dark is the product; the other two
 *   are adaptations somebody chooses. Uses role="radiogroup" with
 *   aria-checked rather than the [data-toggle] switch pattern, because
 *   this is one-of-three rather than on/off.
 *
 * 12 Aug 2026 v18
 *
 * v18 - LOG-1. "Weight notes" renamed "Session notes", and its copy now
 *   describes what the feature has actually recorded since 11 Aug: nine
 *   metrics, chosen per equipment. Graeme: "Weight notes should be on.
 *   But not just weight. Time, tension, elevation etc." Those already
 *   worked; the setting was describing a narrower feature than existed.
 *   Panel also no longer says "For gym sessions", because as of
 *   workout.js v11 it is not.
 *
 * 12 Aug 2026 v17
 *
 * v17 - DISP-1. New "Display" tab: text size, line spacing, letter
 *   spacing, underline links, enhanced focus outlines.
 *
 *   Pattern came from The Learning Studio via DPC Hub, which Graeme
 *   supplied. The LOGIC transferred; none of the markup or CSS did, and
 *   that was deliberate -- that codebase has its own class names,
 *   palette and type scale, so a port would have imported a second
 *   design system. This uses the existing .settings-section /
 *   .settings-field / .settings-toggle conventions so the tab reads as
 *   the seventh peer of six, not a bolt-on.
 *
 *   What was worth keeping from the source: localStorage-only with a
 *   try/catch, aria-pressed on choices, a role="status" live region on
 *   change, reset-to-defaults, and above all text size as a SCALE FACTOR
 *   on the design tokens rather than a body font-size override. That
 *   last point matters more here than it did there -- 514 font-size
 *   declarations in this codebase read a --text-* token, and a body
 *   override would have reached almost none of them.
 *
 *   NOT stored in store.js, deliberately: these must be readable before
 *   first paint by the inline script in index.html, they are
 *   device-level rather than person-level, and they should survive a
 *   store reset. See js/display-prefs.js for the full reasoning. The
 *   generic [data-toggle] handler below writes to store, so these use
 *   their own [data-disp-toggle] handler rather than being forced
 *   through it.
 *
 *   Ranges are conservative at the bottom (text 90%-160%): nothing here
 *   should let somebody shrink the app past the point where they can
 *   find the control that fixes it.
 *
 *   P3 -- offered at Settings, never in onboarding and never on a timer.
 *   Somebody eleven questions into setup does not yet know they want
 *   wider letter spacing.
 *
 * 11 Aug 2026 v16
 *
 * v16 - About panel now says why the product exists, condensed from
 *   Graeme's own words on the website rather than paraphrased. It
 *   previously showed a tier and a version number, which answers a
 *   different question from the one somebody opening About is asking.
 *
 * 11 Aug 2026 v15
 *
 * v15 — PT-4. New "Weight notes" panel, appended to the Equipment tab
 *   rather than given its own (it is gym context, and someone with no gym
 *   kit never opens that tab). Off by default; uses the existing generic
 *   [data-toggle] handler so no new wiring. Copy describes it as a note to
 *   yourself, never as tracking, progress, or personal bests — locked
 *   principle P4.
 *
 * 05 Aug 2026 v14
 *
 * v14 — Equipment panel now shows a saved-equipment summary (Home: N
 *   items / Gym: N items), split by scope. Previously just a bare
 *   "Edit equipment" button with no way to glance at what was saved.
 *   Found while investigating the gym-session location bug (05 Aug) --
 *   directly useful for confirming onboarding wasn't rushed through
 *   without redoing the whole edit flow.
 *
 * 04 Aug 2026 v13
 *
 * v13 — New "Update app" button in the About panel. Graeme: laptop was
 *   on the latest version, phone was still showing old, unstyled
 *   screens — real cache-staleness, not imagined. Checked sw.js's
 *   fetch handler before building anything: pure cache-first, a stale
 *   cached file is served without even checking the network until a
 *   new service worker fully takes over. This button goes further than
 *   the existing checkForUpdate()/applyUpdate() (app.js) — those only
 *   politely ask the current SW registration to check; this also
 *   clears every cache directly and hard-reloads regardless of SW
 *   state, so it works even if the SW itself is what's stuck.
 *
 * 04 Aug 2026 v12
 *
 * Settings view. User controls for profile, programme, goals, and preferences.
 *
 * v12 — "Edit conditions" now routes to the real Conditions Update
 *   screen (conditions-update.js, Phase D-2) instead of the limited
 *   openSheet('onboarding/conditions') bridge from v9 — that bridge
 *   only ever let you toggle which conditions exist, nothing about
 *   severity, goals, or a programme. Matches the original spec:
 *   Settings' panel is a shortcut into the same destination Home's
 *   Conditions Update door uses. "Edit equipment" untouched, still
 *   uses openSheet() as v9 fixed it.
 *
 * 05 Jul 2026 v11
 *
 * v11 — My Movement rebuild (agreed 13 May, never built — ground-truthed
 *   05 Jul: the selector was absent from the live UI entirely, not merely
 *   single-select as the old note implied). Schema-first: store.js v8
 *   changed movementIdentity from string|null to string[]. Added a "How
 *   you move" section to the Profile panel (own heading, own Save button,
 *   same pattern as Programme panel's per-subsection saves) — six chips
 *   (gym/yoga/running/walking/swimming/classes) as true multi-select,
 *   plus a separate "A mix of things" chip that's mutually exclusive with
 *   the six: choosing it clears and disables the others (with
 *   aria-disabled kept in sync), choosing any of the six clears it. Read
 *   from and written to movementIdentity as an array. Placed after "Save
 *   changes" and before the reflection section — distinct concept from
 *   name/age/gender, deserves its own save action rather than being
 *   bundled into the general profile save.
 *
 * v10 — Functional QA fix (My Week). Ground-truthed against router.js v8 and
 *   weekly-plan.js v2: the "weekly-plan" route and its view file were both
 *   intact and schema-correct — the ONLY thing missing was a way in. The
 *   14 Jun (S4-WP) "simple entry card" that used to live in this file's My
 *   Week tab was dropped somewhere across the v4–v9 Programme-panel rewrites,
 *   not deliberately, and never replaced. Restored as a "Your week" section
 *   in the Programme panel — placed directly after the weekly session target
 *   field, since both concern the shape of the week rather than the
 *   programme itself. Deliberately not styled as a bare utility link: reads
 *   store.weeklyPlan.updatedAt and speaks to what's actually true right now
 *   ("You haven't shaped a week yet" vs "Last shaped <date>"), consistent
 *   with the rest of this panel's voice (Conditions/Equipment sections do
 *   the same). No schema change — weeklyPlan already exists per schema.md
 *   v1.6+. No changes to router.js or weekly-plan.js; both were already
 *   correct.
 *
 * v9 — Back-navigation bug fix. "Edit conditions"/"Edit equipment" were
 *   calling router.navigate('onboarding/conditions' / 'onboarding/equipment')
 *   directly — a real navigation into a view built for onboarding, whose
 *   Back/Done buttons are hardcoded to onboarding-sequence destinations
 *   (conditions.js's Back button literally calls
 *   router.navigate('onboarding/goals')). That's why Back landed on
 *   onboarding goals instead of returning to Settings, and why the
 *   bottom nav vanished and onboarding progress dots appeared in its
 *   place — the view was mounting as a full onboarding page, not an
 *   "edit" screen.
 *   Fix: both actions now call openSheet() from
 *   js/views/onboarding/sheet-manager.js — the exact mechanism OB-THREAD
 *   already uses to mount these same view files inside onboarding.
 *   sheet-manager.js temporarily intercepts the bare global
 *   router.navigate() while a sheet is open, so conditions.js's hardcoded
 *   Back call just closes the sheet instead of leaking through as a real
 *   navigation. equipment.js already exports mountContainer()/
 *   setSheetDoneCallback() for this exact purpose. No changes needed to
 *   conditions.js, equipment.js, or sheet-manager.js — only the call site
 *   here. onDone callback re-renders Settings so any conditions/equipment
 *   changes made in the sheet show immediately. Nav bar now stays visible
 *   throughout, since the route never actually changes from 'settings'.
 *
 * v8 — S1/S3 fixes (second round, same day).
 *   S1: age band options were out of date. Settings still had the
 *   pre-OB-THREAD bands (Under 18/18–24/25–34/35–44/45–54/55–64/65+).
 *   Onboarding moved to Under 20/20s/30s/40s/50s/60s/70+ as part of the
 *   28 Jun OB-THREAD rewrite (confirmed against
 *   alongside_onboarding_conversation_script_28jun2026_v3). Settings
 *   never followed — a saved ageBand from onboarding wouldn't even
 *   match an option here. Updated to the current bands.
 *   S3: "Your goals" was flattening GOAL_CATEGORIES with flatMap,
 *   throwing away the category grouping onboarding uses (see
 *   screenshot: "Feel good and have energy" / "Strength and fitness" /
 *   "Running and cardio goals" etc.). Now renders one
 *   .settings-goals-category block per category with its own label,
 *   matching onboarding's presentation. Assumes cat.label exists on
 *   GOAL_CATEGORIES entries (consistent with the .label pattern used
 *   elsewhere in this file's own TABS array) — not confirmed against
 *   goals.js directly, flag if it renders blank.
 *
 * v7 — S1 fix. Coach style is Nurturing only, permanently — no other
 *   styles are planned, not just "locked for beta". Removed the
 *   Steady/Energetic/Minimal radiogroup and all "After beta" locked-
 *   option UI entirely. Replaced with a single static line. store's
 *   coachStyle field is untouched (still defaults to 'nurturing', still
 *   read elsewhere for voice logic) — this is a UI-only removal, no
 *   schema change. Removed the now-dead [data-coach-style] event
 *   listener block. Flagged separately (not done here, out of scope
 *   for Settings): audit website copy, marketing, and other Alongside
 *   product docs for any remaining "choose your coach style" language.
 *
 * v6 — OB-THREAD. New "Your reflection" section added to the Profile panel.
 *   Displays the Beat 3 reflection generated at onboarding, report-style —
 *   all five parts rendered as continuous text, no staged reveal, no
 *   Continue taps (those belong to the conversational moment in thread.js;
 *   here it's a reference document, read top to bottom like a report).
 *   Reads store.onboarding.primaryTerritory and calls getBeat3Script() live
 *   — no new schema field, no duplicated content, single source of truth
 *   stays in beat3-scripts.js.
 *   Section does not render at all if primaryTerritory is null (user chose
 *   "I'd rather not say" at Hard Before — there is nothing to reflect back).
 *   Collapsed by default behind a single "Read your reflection" button,
 *   consistent with the existing edit-conditions / edit-equipment pattern
 *   on this page. No read/unread state — it isn't a notification.
 *
 * v5 — Phase 5 (P5-ST-1, P5-ST-2, P5-ST-3):
 *   - Programme change: user can change active programme from Settings
 *   - Programme reset: user can reset current week / restart programme
 *   - Goal change: goals editable after onboarding (was missing entirely)
 *   - Activity level update: fitnessLevel updatable as user improves
 *   - Developer bypass panel: triple-tap version label → tier switcher
 *   - Coach style selector: visible but Nurturing locked in beta (note shown)
 *
 * v4 — Tier gating audit. store.isPremium() calls. Paywall toast wiring.
 *
 * Existing tabs preserved:
 *   Profile, Conditions, Equipment, Notifications, Library, Privacy
 *
 * Developer bypass panel:
 *   Triple-tap on the version label in the About section.
 *   Shows tier switcher: Free / Personal / Athlete.
 *   Writes store.tier directly. Toast confirms.
 *   No visual indicator in production — purely for development and testing.
 *   Not mentioned in any user-facing copy.
 *
 * WCAG 2.2 AA:
 *   Tab strip: role="tablist", tabs role="tab", aria-selected, aria-controls.
 *   Panels: role="tabpanel", aria-labelledby.
 *   All form controls: associated <label> via for/id or aria-label.
 *   Destructive actions (reset programme): confirmation dialog before execution.
 *   Dialog: role="dialog", aria-modal="true", aria-labelledby on heading,
 *   focus trapped within dialog, Escape closes, focus returns to trigger.
 *   Touch targets: minimum 44px.
 *   Select elements: custom styled but native semantics preserved.
 *   Reflection block (v6): collapsible region uses aria-expanded on the
 *   trigger button and aria-hidden on the content when collapsed.
 *   Weekly plan section (v10): plain button + descriptive aria-label,
 *   same pattern as Conditions/Equipment sections — no new interaction
 *   pattern introduced.
 *   Movement chips (v11): role="checkbox" with aria-checked for the six
 *   multi-select chips, disabled + aria-disabled kept in sync when
 *   "mixed" is active. Divider between the two groups uses
 *   role="separator". All chips minimum 44px touch target.
 */

import { AVAILABLE_TIME_WINDOW_MINUTES } from '../data/time-windows.js';
import { INTENT_CHIPS }   from '../data/onboarding-thread-data.js';   // W3-17
import { store }          from '../store.js';
import { isPremium }      from '../auth.js';
import { toKg, fromKg } from '../data/weight-targets.js';
import { PRICE_MONTHLY, PRICE_ANNUAL } from "../data/pricing.js";
import { offeredGoals, getGoalLabel } from '../data/goals.js';
import { tierTableHtml } from '../data/tier-table.js';
import { getProgramme, PROGRAMMES }      from '../data/programmes.js';
import { getProgressStats }              from '../data/programmeEngine.js';
import { getBeat3Script }                from '../data/beat3-scripts.js';
import {
  DISPLAY_RANGES, SCHEMES, getDisplayPref, setDisplayPref,
  resetDisplayPrefs, formatDisplayValue
} from '../display-prefs.js';
import { openSheet }                     from './onboarding/sheet-manager.js';
// W3-A2. Imported, never redefined. A second copy of these option lists
// is exactly how vocabulary drift happens, and capability answers are the
// most consequential strings in the product.
// W2-7. Names for the preference list. Reading the id back to the person
// ("bodyweight-nordic-curl-progression") would be useless and slightly
// insulting; the list has to say what they actually skipped.
import { EXERCISES } from '../data/exercises/index.js';
import { CONDITIONS } from '../data/conditions.js';
import { scopeStatementHTML } from '../data/scope-statement.js';
import { aimById } from '../data/aims.js';
import { healthAllowed, healthConsentNeeded, setPendingRoute } from '../data/health-consent.js';
import { readRestoreFile, applyRestore, describeDate } from '../data/restore.js';
import { lockText, unlockText, isLocked, passwordProblem, lockAvailable } from '../data/file-lock.js';
import { visibleMessages, hasUnread, markAllRead, dismissMessage, updateNavDot } from '../data/messages.js';
import { SURVEY, CANT_FIND, NOT_SENT, figuresPayload, surveyPayload, sendEvidence } from '../data/evidence.js';
import { conditionReadback, shortDate } from '../data/arc-readback.js';

import {
  AGE_CHIPS,
  ACTIVITY_CHIPS,
  BALANCE_CHIPS,
  CHAIR_RISE_CHIPS,
  FLOOR_ACCESS_CHIPS,
  LEG_POWER_CHIPS,
} from '../data/onboarding-thread-data.js';

// ─── View registration ────────────────────────────────────────────────────────

// P11. Activity level: the value the coach reads, in onboarding's words.
// "Very active" is not an onboarding answer but can be set here or by the
// assessment, so it stays on the list.
const ACTIVITY_LEVELS = [...ACTIVITY_CHIPS, { id: 'very-active', label: 'Very active, training most days' }];
function _activityLevel() {
  return store.get('fitnessLevel') || (store.get('lifestyle') || {}).activityLevel || null;
}

export function SettingsView(router) {

  // A1, 13 Aug 2026. The tier switcher is a developer tool. It stays
  // reachable during beta because Graeme and testers genuinely need it,
  // and it is never advertised anywhere in user-facing copy. Flip to
  // false before public launch (January 2027). Pattern copied from
  // AGE_GATE_ENABLED in views/onboarding/thread.js -- a named const with
  // the flip condition stated, not a magic boolean.
  const DEV_PANEL_ENABLED = true;

  let devTapCount       = 0;
  let devTapTimer       = null;
  let reflectionExpanded = false;

  // NAV-5 (three sections) and NAV-7 (sub-tabs inside them) are retired
  // by SMOOTH-P4c: one page, two levels, no tabs. The reasoning they
  // recorded -- nothing may scroll out of sight, session notes and
  // equipment must be findable by name -- is kept on the page itself and
  // asserted by verify-nav5 v2 and verify-settings-inventory.

  // SMOOTH-P4c. null = the one page; otherwise the row screen open.
  let activeScreen = null;
  let focusAfter   = null;    // selector to focus after the next render

  // v11 — My Movement rebuild. Matches store.js's movementIdentity
  // string[] values. "mixed" is handled separately, below, since it's
  // mutually exclusive with these six rather than a seventh peer option.
  const MOVEMENT_IDENTITIES = [
    { id: 'gym',      label: 'Gym',      icon: '●' },
    { id: 'yoga',     label: 'Yoga',     icon: '◌' },
    { id: 'running',  label: 'Running',  icon: '→' },
    { id: 'walking',  label: 'Walking',  icon: '↝' },
    { id: 'swimming', label: 'Swimming', icon: '≈' },
    { id: 'classes',  label: 'Classes',  icon: '◆' },
  ];

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    render(container);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    const screen = activeScreen && SCREENS[activeScreen] ? SCREENS[activeScreen] : null;
    container.innerHTML = `
      <div class="settings-view">
        ${screen ? `
          <div class="settings-section-header">
            <button class="btn btn-ghost" id="settings-back-btn" aria-label="Back to Settings">&larr; Settings</button>
          </div>
          <h1 class="settings-title" tabindex="-1">${_esc(screen.title)}</h1>
          <div class="settings-screen">${_withoutRepeatedTitle(screen.render(), screen.title)}</div>
        ` : `
          <h1 class="settings-title" tabindex="-1">Settings</h1>
          <p class="settings-lede">Changes save as you make them.</p>
          ${renderPage()}
        `}
        <p class="sr-only" id="settings-saved" role="status" aria-live="polite"></p>
      </div>
    `;
    attachEvents(container);
    if (focusAfter) {
      const sel = focusAfter; focusAfter = null;
      container.querySelector(sel)?.focus();
    }
  }

  // ── SMOOTH-P4c. The one page ──────────────────────────────────────────────

  /**
   * A panel opened as a screen starts with its own h2, which repeats the
   * screen's h1 word for word ("Your plan" / "Your plan"). Said twice to
   * a screen reader and seen twice on the page; the repeat is dropped.
   */
  function _withoutRepeatedTitle(html, title) {
    return html.replace(new RegExp(`\\s*<h2 class="settings-section__heading">\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</h2>`), '');
  }

  /** Row screens: an existing panel each, or one part of one. */
  const SCREENS = {
    messages:     { title: 'Messages',                render: () => renderMessagesScreen() },
    profile:      { title: 'Your profile',            render: () => renderProfilePanel() },
    movement:     { title: 'How you move',            render: () => `<div class="settings-section">${renderMovementSection()}</div>` },
    conditions:   { title: 'Sore or injured areas', render: () => renderConditionsPanel() },
    equipment:    { title: 'Equipment',               render: () => renderEquipmentPanel() },
    capability:   { title: 'What your body can do',   render: () => `<div class="settings-section">${renderCapabilitySection()}</div>` },
    preferences:  { title: 'How sessions are built',  render: () => `<div class="settings-section">${renderPreferencesSection()}</div>` },
    reflection:   { title: 'Your reflection',         render: () => `<div class="settings-section">${renderReflectionSection()}</div>` },
    programme:    { title: 'Goals and your week',     render: () => renderProgrammePanel() },
    notes:        { title: 'Session notes',           render: () => renderLiftLogPanel() },
    weight:       { title: 'Your weight',             render: () => `<div class="settings-section">${_weightSection(store.get('weightTracking') === true, store.get('weightUnit') || 'kg', store.get('weight'))}</div>` },
    display:      { title: 'Display',                 render: () => renderDisplayPanel() },
    'about-plan': { title: 'Your plan',               render: () => renderPanel('about-plan') },
    'about-story':{ title: 'Why Alongside exists',    render: () => renderPanel('about-story') },
    'about-app':  { title: 'The app',                 render: () => renderPanel('about-app') },
    'about-data': { title: 'How your data is kept',   render: () => renderPanel('about-data') },
  };

  const _label = (list, id, fallback) => (list.find(x => x.id === id) || {}).label || fallback;

  function _row({ label, value = '', open, go, action, focus, sub = '' }) {
    const attrs = open ? `data-open="${open}"${focus ? ` data-focus="${_esc(focus)}"` : ''}`
                : go   ? `data-go="${go}"`
                :        `data-action="${action}"`;
    return `
      <li>
        <button class="settings-row" ${attrs}>
          <span class="settings-row__text">
            <span class="settings-row__label">${_esc(label)}</span>
            ${sub ? `<span class="settings-row__sub">${_esc(sub)}</span>` : ''}
          </span>
          ${value !== '' ? `<span class="settings-row__value">${_esc(value)}</span>` : ''}
          <span class="settings-row__chevron" aria-hidden="true">&rsaquo;</span>
        </button>
      </li>`;
  }

  /** A switch that works in place. `disp` writes a display preference. */
  function _rowSwitch({ id, label, sub = '', field, disp }) {
    const on = disp ? getDisplayPref(disp) === 'on' : store.get(field) === true;
    return `
      <li class="settings-row settings-row--switch">
        <label class="settings-row__text" for="${id}">
          <span class="settings-row__label">${_esc(label)}</span>
          ${sub ? `<span class="settings-row__sub">${_esc(sub)}</span>` : ''}
        </label>
        <button class="settings-toggle ${on ? 'settings-toggle--on' : ''}" id="${id}" role="switch"
                aria-checked="${on ? 'true' : 'false'}"
                ${disp ? `data-disp-toggle="${disp}"` : `data-toggle="${field}"`}
                aria-label="${_esc(label)} ${on ? 'on' : 'off'}">
          <span class="settings-toggle__track" aria-hidden="true"></span>
        </button>
      </li>`;
  }

  function _group(title, rows) {
    const id = 'sg-' + title.toLowerCase().replace(/[^a-z]+/g, '-');
    return `
      <section class="settings-group" aria-labelledby="${id}">
        <h2 class="settings-group__title" id="${id}">${_esc(title)}</h2>
        <ul class="settings-rows">${rows.filter(Boolean).join('')}</ul>
      </section>`;
  }

  function renderPage() {
    const premium  = isPremium();
    const gym      = (store.get('gymEquipment')  || []).length;
    const home     = (store.get('homeEquipment') || []).length;
    const conds    = store.get('conditions') || [];
    const moves    = store.get('movementIdentity') || [];
    const cap      = store.get('capability') || {};
    const arc      = store.get('arc') || {};
    const aim      = arc.active && arc.aimId ? aimById(arc.aimId) : null;
    const goals    = store.get('goals') || [];
    const target   = store.get('strategicGoal.setAt') ? store.get('strategicGoal.weeklySessionTarget') : null;
    const prog     = store.get('activeProgramme') || {};
    const progMeta = prog.programmeId ? getProgramme(prog.programmeId) : null;
    const prefs    = Object.keys(store.get('exercisePreferences') || {}).length;
    const VARIETY  = [{ id: 'familiar', label: 'Mostly the same' }, { id: 'balanced', label: 'A bit of both' }, { id: 'varied', label: 'Something different' }];
    const scheme   = getDisplayPref('scheme') || 'dark';
    const ageLbl   = _label(AGE_CHIPS, store.get('ageBand'), 'Not set');
    const GENDERS  = [{ id: 'female', label: 'Female' }, { id: 'male', label: 'Male' }, { id: 'non-binary', label: 'Non-binary' }, { id: 'other', label: 'Other' }];
    const level    = _activityLevel();

    return `
      ${_group('You', [
        _row({ label: 'Messages', value: hasUnread() ? 'New' : 'Nothing new', open: 'messages' }),
        _row({ label: 'Name', value: store.get('name') || 'Not set', open: 'profile', focus: '#settings-name' }),
        _row({ label: 'Age range', value: ageLbl, open: 'profile', focus: '#settings-agebandsel' }),
        _row({ label: 'Gender', value: _label(GENDERS, store.get('gender'), 'Prefer not to say'), open: 'profile', focus: '#settings-gender' }),
        _row({ label: 'How you move', value: moves.length ? moves.map(m => _label(MOVEMENT_IDENTITIES, m, m === 'mixed' ? 'A mix' : m)).join(', ') : 'Not set', open: 'movement' }),
        _row({ label: 'Sore or injured areas', value: conds.length ? `${conds.length} listed` : 'None', open: 'conditions' }),
        _row({ label: 'Equipment', value: `Gym ${gym} · Home ${home}`, open: 'equipment' }),
        // LEGAL-TRUE. What your body can do is a health answer: without the
        // health consent the row asks for it first, like Sore or injured areas.
        healthAllowed()
          ? _row({ label: 'What your body can do', value: cap.askedAt ? 'Answered' : 'Not answered', open: 'capability' })
          : _row({ label: 'What your body can do', value: 'Not answered', action: 'health-capability' }),
      ])}

      ${_group('Goals and your week', [
        premium ? _row({ label: 'Your arc', value: aim ? aim.label : 'Not set', go: aim ? 'stretch-arc' : 'arc-setup' }) : '',
        _row({ label: 'Goals', value: goals.length ? `${goals.length} chosen` : 'None', open: 'programme', focus: '.settings-goal-chip' }),
        _row({ label: 'Sessions per week', value: target ? String(target) : 'Not set', open: 'programme', focus: '#settings-weekly-target' }),
        _row({ label: 'Your week', action: 'open-weekly-plan' }),
        _row({ label: 'Activity level', value: level ? _label(ACTIVITY_LEVELS, level, level) : 'Not set', open: 'programme', focus: '#settings-fitness-level' }),
        _row({ label: 'Programme', value: progMeta ? progMeta.name : 'None', open: 'programme' }),
      ])}

      ${_group('How the coach works', [
        _row({ label: 'What you\u2019re aiming at', value: (INTENT_CHIPS.find(c => c.id === (store.get('trainingIntent') || 'improve')) || INTENT_CHIPS[0]).label, open: 'preferences', focus: '#settings-intent' }),
        _row({ label: 'How much sessions change', value: _label(VARIETY, store.get('sessionVariety') || 'balanced', 'A bit of both'), open: 'preferences', focus: '#settings-pref-variety' }),
        _row({ label: 'How long you usually have', value: `${AVAILABLE_TIME_WINDOW_MINUTES[store.get('availableTime')] ?? 30} minutes`, open: 'preferences', focus: '#settings-usual-length' }),
        _row({ label: 'Exercises you asked to change', value: prefs ? String(prefs) : 'None', open: 'preferences' }),
        _rowSwitch({ id: 'settings-lift-log', label: 'Session notes', sub: 'Note what you did on each exercise.', field: 'liftLogEnabled' }),
        _rowSwitch({ id: 'settings-pb', label: 'Show your best', sub: 'Beside your last note. Off unless you want it.', field: 'showPersonalBests' }),
        _row({ label: 'About session notes', open: 'notes' }),
        renderReflectionSection() ? _row({ label: 'Your reflection', open: 'reflection' }) : '',
      ])}

      ${_group('Optional tracking', [
        premium ? _rowSwitch({ id: 'settings-weight-tracking', label: 'Weight tracking', sub: 'Off unless you turn it on. Only you see it, and I will never ask you to weigh yourself.', field: 'weightTracking' }) : '',
        premium && store.get('weightTracking') === true && healthAllowed() ? _row({ label: 'Your weight and units', open: 'weight' }) : '',
      ])}

      ${_group('Display', [
        _row({ label: 'Colour scheme', value: (s => s.charAt(0).toUpperCase() + s.slice(1))(scheme.replace(/-/g, ' ')), open: 'display' }),
        _row({ label: 'Text size', value: formatDisplayValue('textScale', getDisplayPref('textScale')), open: 'display', focus: '#disp-text-scale' }),
        _row({ label: 'Line and letter spacing', open: 'display', focus: '#disp-leading-scale' }),
        _rowSwitch({ id: 'disp-underline', label: 'Underline links', disp: 'underline' }),
        _rowSwitch({ id: 'disp-focus', label: 'Stronger focus outlines', disp: 'focus' }),
        _rowSwitch({ id: 'disp-full-instructions', label: 'Always show full instructions', disp: 'fullInstructions' }),
        // F6. Off follows the device, which the app always has.
        _rowSwitch({ id: 'disp-reduce-motion', label: 'Reduce motion', disp: 'reduceMotion' }),
      ])}

      ${_group('Your plan and your data', [
        _row({ label: 'Your plan', value: premium ? 'The Plan' : 'Free', open: 'about-plan' }),
        _row({ label: 'Your impact', sub: 'Where the 5% goes.', action: 'nav-impact' }),
        _row({ label: 'Activity log', action: 'nav-activity-log' }),
        _row({ label: 'Download your data', sub: 'A file of everything the app keeps about you, your journal included. Saved on this device. Anyone who has the file can read it, unless you add a password.', action: 'download-data' }),
        _row({ label: 'Restore from a file', sub: 'Bring your history across from a file saved with Download your data. It replaces what is on this device.', action: 'restore-data' }),
        _row({ label: 'Delete my health answers', sub: 'Check-ins, sore areas, what you told me about your body, weight, journal and notes. Your sessions and lifts stay.', action: 'delete-health' }),
        _row({ label: 'How your data is kept', open: 'about-data' }),
        _row({ label: 'Privacy policy', action: 'nav-privacy' }),
        _row({ label: 'Reset all data', action: 'reset-data' }),
      ])}

      ${_group('About', [
        _row({ label: 'Why Alongside exists', open: 'about-story' }),
        _row({ label: 'App version', value: swVersion ? 'v' + swVersion : 'Checking…', open: 'about-app' }),
      ])}`;
  }

  /** Announce a save. Polite, once. */
  function _saved(container, msg = 'Saved') {
    const el = container.querySelector('#settings-saved');
    if (!el) return;
    el.textContent = '';
    setTimeout(() => { el.textContent = msg; }, 20);
  }

  /** Everything the app keeps, as a file, built and saved on this device. */
  function downloadData(container, password = '') {
    const data = {
      exportedAt: new Date().toISOString(),
      about: 'Everything Alongside: Move keeps about you on this device, including your journal. Nothing here was sent anywhere to make this file.',
      store: JSON.parse(localStorage.getItem('alongside_user') || '{}'),
      display: (() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k !== 'alongside_user' && /^alongside/i.test(k)) o[k] = localStorage.getItem(k); } return o; })(),
    };
    const text = JSON.stringify(data, null, 2);
    if (password) return _saveLocked(container, text, password);
    const name = `alongside-data-${new Date().toISOString().slice(0, 10)}.json`;
    try {
      const blob = new Blob([text], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; a.hidden = true;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      _saved(container, `Your file, ${name}, is downloading to this device. It holds your health answers and journal, and anyone who has the file can read it, so keep it somewhere private.`);
    } catch (err) {
      _saved(container, 'The file could not be made on this device.');
    }
    return { name, text };
  }

  /** B5. The research question, in the message, with exactly what Send sends. */
  function _researchForm(m) {
    const err = `<p class="settings-dialog__error" id="ev-${m.action}-error" role="alert"></p>`;
    const send = `<button class="btn btn-primary btn-small" data-ev-send="${m.action}" data-msg="${_esc(m.id)}">Send</button>`;
    if (m.action === 'survey') {
      const q = (name, s) => `
        <fieldset class="settings-research__q">
          <legend class="settings-label">${_esc(s.legend)}</legend>
          ${s.options.map(([v, l]) => `<label class="settings-research__opt"><input type="radio" name="ev-${name}" value="${v}"> ${_esc(l)}</label>`).join('')}
        </fieldset>`;
      return `${q('move', SURVEY.move)}${q('used', SURVEY.usedFor)}
        <p class="settings-message__body">What is sent: your two answers, whether you are on the free tier or the Plan, this month, and the app’s version. Nothing that says who you are.</p>
        <p class="settings-message__body">${_esc(CANT_FIND)}</p>${err}${send}`;
    }
    const f = figuresPayload();
    const band = f.plan_band === 'none' ? 'None (free tier)' : 'Not known yet';
    const rows = [
      ['Free tier or the Plan', f.tier !== 'free' ? 'The Plan' : 'Free tier'],
      ['Time on the Plan', band],
      ['Sessions a week, your first four weeks', String(f.first_weeks)],
      ['Sessions a week, your latest four weeks', String(f.latest_weeks)],
      ['Kinds of session, your latest four weeks', f.kinds.length ? f.kinds.join(', ') : 'None'],
      ['This month', f.month],
      ['The app’s version', 'Added when you press Send'],
    ];
    return `<p class="settings-message__body">Exactly what would be sent:</p>
      <dl class="settings-research__figures">${rows.map(([k, v]) => `<div><dt>${_esc(k)}</dt><dd>${_esc(v)}</dd></div>`).join('')}</dl>
      <p class="settings-message__body">${_esc(CANT_FIND)}</p>${err}${send}`;
  }

  /** B4. Settings › Messages: what is published, newest first, and the News switch. */
  function renderMessagesScreen() {
    const list = visibleMessages();
    const items = list.map(m => `
        <li class="settings-message" id="msg-${_esc(m.id)}">
          <h2 class="settings-message__title">${_esc(m.title)}</h2>
          <p class="settings-message__date">${_esc(describeDate(m.publishedAt + 'T12:00:00Z') || '')}</p>
          <p class="settings-message__body">${_esc(m.body)}</p>
          ${m.link ? `<p><a class="settings-message__link" href="${_esc(m.link.href)}" target="_blank" rel="noopener noreferrer">${_esc(m.link.text)}<span class="sr-only"> (opens in a new tab)</span></a></p>` : ''}
          ${m.kind === 'research' ? `<div class="settings-message__research" data-research="${_esc(m.action)}" data-msg="${_esc(m.id)}">${_researchForm(m)}</div>` : ''}
          <button class="btn btn-ghost btn-small" data-dismiss-msg="${_esc(m.id)}" aria-label="Dismiss: ${_esc(m.title)}">Dismiss</button>
        </li>`).join('');
    return `
      <div class="settings-section">
        <p class="settings-data-about">Short messages from Build New Habits: about the app, and now and then a question for you. They never contain safety or medical information, and nothing about you is sent to fetch them.</p>
        ${list.length ? `<ul class="settings-messages">${items}</ul>` : `<p class="settings-message__none">No messages at the moment.</p>`}
        <ul class="settings-rows">
          ${_rowSwitch({ id: 'settings-news', label: 'News from Build New Habits', sub: 'News about the app and the causes the community supports. Off unless you turn it on.', field: 'messages.newsOn' })}
        </ul>
      </div>`;
  }

  /** B2. The file, locked with the password, saved on this device. */
  async function _saveLocked(container, text, password) {
    const name = `alongside-data-${new Date().toISOString().slice(0, 10)}-locked.json`;
    try {
      const locked = await lockText(text, password);
      const blob = new Blob([locked], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; a.hidden = true;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      _saved(container, `Your file, ${name}, is downloading to this device. It is locked, and only your password opens it.`);
      return { name, text: locked };
    } catch (err) {
      _saved(container, 'The file could not be made on this device.');
      return null;
    }
  }

  /**
   * B2. A small form dialog: focus starts in it, Tab stays in it, Escape
   * closes it, and focus goes back to what opened it.
   */
  function _formDialog(id, titleId, inner) {
    document.getElementById(id)?.remove();
    const opener = document.activeElement;
    const dialog = document.createElement('div');
    dialog.id = id;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', titleId);
    dialog.className = 'settings-dialog';
    dialog.innerHTML = `<div class="settings-dialog__backdrop"></div><div class="settings-dialog__content">${inner}</div>`;
    document.body.appendChild(dialog);
    const close = () => { dialog.remove(); if (opener && opener.focus) opener.focus(); };
    dialog.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      const f = [...dialog.querySelectorAll('input, button')].filter(el => !el.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    (dialog.querySelector('input') || dialog.querySelector('button'))?.focus();
    return { dialog, close };
  }

  /** B2. Download your data: an optional password first, then the file. */
  function _openDownloadDialog(container) {
    const canLock = lockAvailable();
    const { dialog, close } = _formDialog('settings-download-dialog', 'download-dialog-title', `
      <h2 class="settings-dialog__title" id="download-dialog-title">Download your data</h2>
      <p class="settings-dialog__message">The file holds everything Alongside keeps about you on this device, your journal included. It is saved on this device; nothing is sent anywhere.</p>
      ${canLock ? `
      <div class="settings-field">
        <label class="settings-label" for="download-pw">Password (optional)</label>
        <input class="settings-input" id="download-pw" type="password" autocomplete="new-password" aria-describedby="download-pw-note">
      </div>
      <div class="settings-field">
        <label class="settings-label" for="download-pw2">Type the password again</label>
        <input class="settings-input" id="download-pw2" type="password" autocomplete="new-password">
      </div>
      <p class="settings-dialog__message" id="download-pw-note">With a password, the file is locked on this device and opens only with it. If you forget this password, nobody can open this file, including us. Write it down and keep it where you can find it. Without a password, anyone who has the file can read it, so keep it somewhere private.</p>
      <p class="settings-dialog__error" id="download-pw-error" role="alert"></p>` : `
      <p class="settings-dialog__message">This browser can’t add a password to the file. Without a password, anyone who has the file can read it, so keep it somewhere private.</p>`}
      <div class="settings-dialog__actions">
        <button class="btn btn-ghost" id="download-cancel">Cancel</button>
        <button class="btn btn-primary" id="download-save">Save the file</button>
      </div>`);
    dialog.querySelector('#download-cancel').addEventListener('click', close);
    dialog.querySelector('#download-save').addEventListener('click', () => {
      const pw  = dialog.querySelector('#download-pw')?.value || '';
      const pw2 = dialog.querySelector('#download-pw2')?.value || '';
      const problem = passwordProblem(pw, pw2);
      if (problem) {
        const err = dialog.querySelector('#download-pw-error');
        err.textContent = '';
        setTimeout(() => { err.textContent = problem; }, 20);
        return;
      }
      close();
      downloadData(container, pw);
    });
  }

  /** B2. A locked file: its password first; then the usual confirmation. */
  function _askUnlock(text, container) {
    const { dialog, close } = _formDialog('settings-unlock-dialog', 'unlock-dialog-title', `
      <h2 class="settings-dialog__title" id="unlock-dialog-title">This file is locked</h2>
      <p class="settings-dialog__message">It was saved with a password. Nothing changes on this device until it is opened and you have said yes.</p>
      <div class="settings-field">
        <label class="settings-label" for="unlock-pw">Password for this file</label>
        <input class="settings-input" id="unlock-pw" type="password" autocomplete="current-password">
      </div>
      <p class="settings-dialog__error" id="unlock-error" role="alert"></p>
      <div class="settings-dialog__actions">
        <button class="btn btn-ghost" id="unlock-cancel">Cancel</button>
        <button class="btn btn-primary" id="unlock-open">Open the file</button>
      </div>`);
    dialog.querySelector('#unlock-cancel').addEventListener('click', close);
    const open = dialog.querySelector('#unlock-open');
    open.addEventListener('click', async () => {
      open.disabled = true;
      const res = await unlockText(text, dialog.querySelector('#unlock-pw')?.value || '');
      open.disabled = false;
      if (!res.ok) {
        const err = dialog.querySelector('#unlock-error');
        err.textContent = '';
        setTimeout(() => { err.textContent = res.reason; }, 20);
        return;
      }
      dialog.remove();
      _offerRestore(res.text, container);
    });
  }

  // ── Panel router ───────────────────────────────────────────────────────────

  function renderPanel(tabId) {
    switch (tabId) {
      case 'profile':    return renderProfilePanel();
      case 'coaching':   return renderCoachingPanel();
      case 'programme':  return renderProgrammePanel();
      case 'conditions': return renderConditionsPanel();
      // NAV-5. Session notes is its own panel now, not a lodger in
      // Equipment. It is a behaviour toggle; Equipment is a fact about
      // what you own. Filing them together is what made it unfindable.
      case 'equipment':  return renderEquipmentPanel();
      case 'liftlog':    return renderLiftLogPanel();
      case 'display':    return renderDisplayPanel();
      // 'about' removed with NAV-7: the section now references the three
      // split ids, so a bare 'about' case is unreachable. The gate caught
      // it, which is the gate doing exactly its job.
      case 'about-plan':   return renderPlanPanel();
      case 'about-story':  return renderAboutPanel("story");
      case 'about-app':    return renderAboutPanel("app");
      case 'about-data':   return renderAboutPanel("data");
      default:           return '';
    }
  }

  // ── Profile panel ──────────────────────────────────────────────────────────

  function renderProfilePanel() {
    const name         = store.get('name') || '';
    const ageBand      = store.get('ageBand') || '';
    const gender       = store.get('gender') || '';
    const weightTracking   = store.get('weightTracking') === true;
    const weightUnit       = store.get('weightUnit') || 'kg';
    const weightKg         = store.get('weight');

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Your profile</h2>

        <!-- TIER-VISIBLE, 06 Sep 2026. One sentence, not a label/value
             pair: a screen reader announces "Your plan: Free" as a single
             statement, where a fake <label> with no control would be
             announced as an orphaned form field. -->
        <div class="settings-field">
          <p class="settings-section__sub" id="settings-plan-line">
            Your plan: <strong>${isPremium() ? "the Plan" : "Free"}</strong>
          </p>
        </div>

        <div class="settings-field">
          <label class="settings-label" for="settings-name">Name</label>
          <input class="settings-input"
                 id="settings-name"
                 type="text"
                 value="${_esc(name)}"
                 autocomplete="given-name"
                 data-field="name"
                 aria-label="Your name">
        </div>

        <div class="settings-field">
          <label class="settings-label" for="settings-agebandsel">Age range</label>
          <select class="settings-select"
                  id="settings-agebandsel"
                  data-field="ageBand"
                  aria-label="Your age range">
            <!-- AGE-1, 14 Aug 2026. This list was hardcoded LABELS used as
                 VALUES, so saving here wrote 'Under 20' or '70+' into
                 ageBand -- matching neither the onboarding chips nor the
                 contract, and silently dropping the person out of the
                 capability age trigger. Now the same AGE_CHIPS the thread
                 uses, ids as values. -->
            ${AGE_CHIPS.map(b => `
              <option value="${b.id}" ${ageBand === b.id ? 'selected' : ''}>${_esc(b.label)}</option>
            `).join('')}
          </select>
        </div>

        <div class="settings-field">
          <label class="settings-label" for="settings-gender">Gender</label>
          <select class="settings-select"
                  id="settings-gender"
                  data-field="gender"
                  aria-label="Your gender">
            <option value="">Prefer not to say</option>
            <option value="female"   ${gender === 'female'    ? 'selected' : ''}>Female</option>
            <option value="male"     ${gender === 'male'      ? 'selected' : ''}>Male</option>
            <option value="non-binary" ${gender === 'non-binary' ? 'selected' : ''}>Non-binary</option>
            <option value="other"    ${gender === 'other'     ? 'selected' : ''}>Other / self-describe</option>
          </select>
        </div>

        <!-- W3-8: the cycle-aware switch that was here is gone; nothing read it. -->

        ${_weightSection(weightTracking, weightUnit, weightKg)}

        <!-- SMOOTH-P4c: the Save button that was here is gone; this saves as it changes. -->

        ${renderMovementSection()}
      </div>
    `;
  }

  /**
   * Weight tracking. Off by default, Plan only, and invisible on free.
   *
   * Free gets no locked row and no greyed switch. Showing somebody the
   * shape of a feature they cannot use, on a screen they open to change
   * their name, is pressure dressed as information.
   */
  function _weightSection(on, unit, kg) {
    // BUNDLE-TRUE: weight is a health answer; no entry without the consent.
    if (!isPremium() || !healthAllowed()) return '';

    const units = [
      { id: 'kg', label: 'kg' },
      { id: 'lb', label: 'lb' },
      { id: 'st', label: 'st & lb' }
    ];

    return `
      <div class="settings-field settings-field--toggle">
        <label class="settings-label" for="settings-weight-tracking">
          Weight tracking
          <span class="settings-label__sub">Off unless you want it. Turn it on to record your weight and set a target, and I'll take it into account. I'll never ask you to weigh yourself.</span>
        </label>
        <button
          class="settings-toggle ${on ? 'settings-toggle--on' : ''}"
          id="settings-weight-tracking"
          role="switch"
          aria-checked="${on ? 'true' : 'false'}"
          data-toggle="weightTracking"
          aria-label="Weight tracking ${on ? 'on' : 'off'}">
          <span class="settings-toggle__track" aria-hidden="true"></span>
        </button>
      </div>

      ${on ? `
        <div class="settings-field" role="group" aria-label="How weights are shown">
          <span class="settings-label" id="settings-weight-unit-label">Show weights in</span>
          <div class="settings-unit-picker">
            ${units.map(u => `
              <button type="button"
                      class="settings-unit ${unit === u.id ? 'settings-unit--on' : ''}"
                      data-weight-unit="${u.id}"
                      role="radio"
                      aria-checked="${unit === u.id ? 'true' : 'false'}"
                      aria-labelledby="settings-weight-unit-label">${u.label}</button>
            `).join('')}
          </div>
        </div>

        <div class="settings-field">
          <label class="settings-label" for="settings-weight-now">
            Your weight now
            <span class="settings-label__sub">Only if you want to. Nothing here will ask you again.</span>
          </label>
          ${unit === 'st'
            ? `<div class="settings-weight-stone">
                 <input class="settings-input settings-input--short" id="settings-weight-now"
                        type="number" inputmode="numeric" min="0" max="60"
                        value="${kg != null ? fromKg(kg, 'st').st : ''}"
                        aria-label="Stone">
                 <span class="settings-weight-stone__unit">st</span>
                 <input class="settings-input settings-input--short" id="settings-weight-now-lb"
                        type="number" inputmode="numeric" min="0" max="13"
                        value="${kg != null ? fromKg(kg, 'st').lb : ''}"
                        aria-label="Pounds">
                 <span class="settings-weight-stone__unit">lb</span>
               </div>`
            : `<input class="settings-input" id="settings-weight-now"
                      type="number" inputmode="decimal" min="0" step="0.1"
                      value="${kg != null ? Math.round(fromKg(kg, unit) * 10) / 10 : ''}"
                      aria-label="Your weight in ${unit === 'lb' ? 'pounds' : 'kilograms'}">`}
        </div>
      ` : ''}
    `;
  }

  // ── Your Coaching panel (COACH-TILE, 18 Aug 2026) ──────────────────────────
  //
  // Three sections lifted out of Profile unchanged. Not rewritten, not
  // re-ordered, not restyled -- the copy in each was reviewed and this
  // move is about WHERE they live, not what they say. Movement identity
  // stays in Profile: it is a fact about you, like your age band, not a
  // dial the coach reads before building a session.
  //
  // The save handlers are delegated on the container and keyed on
  // data-action, so they follow the markup without change -- confirmed
  // by reading the handler switch, not assumed.
  function renderCoachingPanel() {
    return `
      <div class="settings-section">
        ${renderCapabilitySection()}

        ${renderPreferencesSection()}

        ${renderReflectionSection()}
      </div>
    `;
  }

  // ── How you like things (D-3 / W2-7, 14 Aug 2026) ───────────────────────
  //
  // Graeme's position, 14 Aug: the app is built with neurodiversity
  // understood from the start, so the coach should need no adapting --
  // but Settings should let people shape the experience.
  //
  // Deliberately NOT a "neurodivergent mode", and autism and ADHD are
  // deliberately NOT in CONDITIONS. That list drives exercise
  // contraindication filtering; neurodivergence is not a movement
  // contraindication, and putting it there would make the engine treat it
  // as a limitation -- the opposite of building it in from the start. It
  // would also be a label that filtered nothing, which is the same fault
  // the conditions question had before CARDIAC-1.
  //
  // So these are preferences anybody might hold, named by what they do.
  // Persona 2.14 wants the first one; persona 2.13 wants its opposite;
  // neither has to identify as anything to get it.

  // Built lazily and once: EXERCISES is 545 entries and this runs on
  // every Settings render.
  let _exNameCache = null;
  function getExerciseName(id) {
    if (!_exNameCache) _exNameCache = new Map(EXERCISES.map(e => [e.id, e.name]));
    // An id with no entry means the library changed under a stored
    // preference. Show the id rather than dropping the row, so the person
    // can still clear it.
    return _exNameCache.get(id) || id;
  }

  function renderPreferencesSection() {
    const variety = store.get('sessionVariety') || 'balanced';
    const prefs   = store.get('exercisePreferences') || {};
    const entries = Object.entries(prefs)
      .map(([id, v]) => ({ id, ...v, name: getExerciseName(id) }))
      .sort((a, b) => (b.setAt || '').localeCompare(a.setAt || ''));

    const VARIETY_OPTIONS = [
      { id: 'familiar', label: 'Mostly the same each time',
        hint: 'Most of each session repeats from the last one, and it starts the same way. A move changes now and then.' },
      { id: 'balanced', label: 'A bit of both',
        hint: 'Some familiar work, some new. This is the default.' },
      { id: 'varied',   label: 'Something different each time',
        hint: 'Sessions rotate widely across the library.' },
    ];

    return `
      <div class="settings-preferences">
        <h2 class="settings-section__heading">How you like things</h2>
        <p class="settings-section__sub">
          None of this is about what you can do — it is about what you
          would rather the coach did. Change it whenever you like.
        </p>

        <!-- W3-17. The same three answers onboarding offers. -->
        <div class="settings-field">
          <label class="settings-label" for="settings-intent">What you\u2019re aiming at</label>
          <p class="settings-section__sub" id="intent-hint">
            This shapes most of what the coach suggests. There is no better answer.
          </p>
          <select class="settings-select" id="settings-intent" data-field="trainingIntent"
                  aria-describedby="intent-hint">
            ${INTENT_CHIPS.map(c => `
              <option value="${c.id}"${(store.get('trainingIntent') || 'improve') === c.id ? ' selected' : ''}>${_esc(c.label)}</option>
            `).join('')}
          </select>
        </div>

        <fieldset class="settings-field settings-capability__group">
          <legend class="settings-label">How much should sessions change?</legend>
          <p class="settings-section__sub" id="pref-variety-hint">
            The sessions the coach builds start from what you choose
            here. Change it whenever you like.
          </p>
          <select class="settings-select"
                  id="settings-pref-variety"
                  data-field="sessionVariety"
                  aria-describedby="pref-variety-hint">
            ${VARIETY_OPTIONS.map(o => `
              <option value="${o.id}"${variety === o.id ? ' selected' : ''}>${_esc(o.label)}</option>
            `).join('')}
          </select>
          <p class="settings-section__sub">
            ${_esc(VARIETY_OPTIONS.find(o => o.id === variety)?.hint || '')}
          </p>
        </fieldset>

        <!-- P24. The length the coach's plan starts from. -->
        <div class="settings-field">
          <label class="settings-label" for="settings-usual-length">How long you usually have</label>
          <p class="settings-section__sub" id="usual-length-hint">
            The coach's plan starts from this. Changing Length on the plan changes it here too.
          </p>
          <select class="settings-select" id="settings-usual-length" data-field="availableTime"
                  aria-describedby="usual-length-hint">
            ${Object.entries(AVAILABLE_TIME_WINDOW_MINUTES).map(([id, mins]) => `
              <option value="${id}"${(store.get('availableTime') || 'short') === id ? ' selected' : ''}>${mins} minutes</option>
            `).join('')}
          </select>
        </div>

        <div class="settings-field">
          <h3 class="settings-label">Exercises you have asked me to change</h3>
          ${entries.length === 0 ? `
            <p class="settings-section__sub">
              Nothing yet. When you skip something during a session, the
              coach offers to see it less often — or not at all.
            </p>
          ` : `
            <ul class="settings-preflist">
              ${entries.map(e => `
                <li class="settings-preflist__item">
                  <span class="settings-preflist__name">${_esc(e.name)}</span>
                  <span class="settings-preflist__tag">
                    ${e.preference === 'avoid' ? 'Not again' : 'Less often'}
                  </span>
                  <button class="btn btn-ghost btn-small"
                          data-clear-pref="${_esc(e.id)}"
                          aria-label="Undo — start offering ${_esc(e.name)} normally again">
                    Undo
                  </button>
                </li>
              `).join('')}
            </ul>
          `}
        </div>

        <!-- SMOOTH-P4c: the Save button that was here is gone; this saves as it changes. -->
      </div>
    `;
  }

  // ── Capability section (W3-A2, 14 Aug 2026) ─────────────────────────────
  //
  // Onboarding steps 9a-9d are a forward-only thread: once a chip is
  // tapped there is no way back. Before this section existed, a mis-tap on
  // the chair question left somebody permanently restricted with no route
  // to correct it -- and capability answers are not static anyway. Bodies
  // change over months, which is the whole premise of the product.
  //
  // store.js's own CAP-1 note worried about somebody being "behind on a
  // question they can no longer see or change". This is that route.
  //
  // Two deliberate choices:
  //
  // 1. ALL FOUR are shown here, including chairRise and floorAccess, even
  //    though onboarding asks those two conditionally. The reason they are
  //    conditional there is that they can land as insulting when pushed at
  //    somebody unprompted. Settings is not unprompted -- the person came
  //    looking. Withholding them here would mean a 30-year-old who develops
  //    a knee problem has no way to say so.
  //
  // 2. "Not answered" is a real, selectable option on every question.
  //    capabilityProfile() treats null as cautious-but-unrestricted, so
  //    clearing an answer is meaningful and must be possible. A person who
  //    said "no" during a bad flare must be able to take it back.

  function renderCapabilitySection() {
    const cap = store.get('capability') || {};

    const group = (field, legend, hint, chips) => `
      <fieldset class="settings-field settings-capability__group">
        <legend class="settings-label">${legend}</legend>
        <p class="settings-section__sub" id="cap-${field}-hint">${hint}</p>
        <select class="settings-select"
                id="settings-cap-${field}"
                data-field="capability.${field}"
                aria-describedby="cap-${field}-hint">
          <option value=""${!cap[field] ? ' selected' : ''}>Not answered</option>
          ${chips.map(c => `
            <option value="${c.id}"${cap[field] === c.id ? ' selected' : ''}>${_esc(c.label)}</option>
          `).join('')}
        </select>
      </fieldset>
    `;

    return `
      <div class="settings-capability">
        <h2 class="settings-section__heading">What your body can do today</h2>
        <p class="settings-section__sub">
          These change what the coach puts in front of you. Nothing here is
          a verdict — change them whenever they stop being true, and leave
          anything blank that you would rather not answer.
        </p>

        ${group('balanceWorry', 'Do you ever worry about losing your balance?',
                'Removes exercises that demand balance. Not a statement about strength.',
                BALANCE_CHIPS)}

        ${group('chairRise', 'Can you get up from a chair without pushing off with your hands?',
                'Tells the coach what your legs are ready for.',
                CHAIR_RISE_CHIPS)}

        ${group('legPower', 'Can you take your weight through your legs?',
                'Some exercises ask your legs to carry your weight.',
                LEG_POWER_CHIPS.filter(c => c.id !== 'skip'))}

        ${group('floorAccess', 'Can you get down to the floor and back up on your own?',
                'If the floor is not somewhere you want to be, the coach builds around it.',
                FLOOR_ACCESS_CHIPS)}

        <!-- SMOOTH-P4c: the Save button that was here is gone; this saves as it changes. -->
      </div>
    `;
  }

  // ── Movement section (v11) ──────────────────────────────────────────────
  // How you move — multi-select identity chips + mutually-exclusive
  // "mixed" fallback. Reads/writes movementIdentity as string[].

  function renderMovementSection() {
    const movementIdentity = store.get('movementIdentity') || [];
    const isMixed = movementIdentity.includes('mixed');

    return `
      <h2 class="settings-section__heading">How you move</h2>
      <p class="settings-section__sub">
        Pick everything that's part of your movement life — the coach
        rotates suggestions toward whichever you've done least recently.
        Or, if you'd rather not pick, tell it you do a mix of things.
      </p>
      <div class="settings-movement-chips" role="group" aria-label="Your movement identities">
        ${MOVEMENT_IDENTITIES.map(m => `
          <button
            class="settings-movement-chip ${movementIdentity.includes(m.id) ? 'settings-movement-chip--selected' : ''}"
            data-movement="${m.id}"
            role="checkbox"
            aria-checked="${movementIdentity.includes(m.id) ? 'true' : 'false'}"
            aria-label="${m.label}"
            ${isMixed ? 'disabled aria-disabled="true"' : ''}>
            <span aria-hidden="true">${m.icon}</span>
            ${m.label}
          </button>
        `).join('')}
      </div>
      <div class="settings-movement-divider" role="separator" aria-hidden="true">or</div>
      <button
        class="settings-movement-chip settings-movement-chip--mixed ${isMixed ? 'settings-movement-chip--selected' : ''}"
        data-movement="mixed"
        role="checkbox"
        aria-checked="${isMixed ? 'true' : 'false'}"
        aria-label="A mix of things — don't ask me to pick">
        A mix of things
      </button>
        <!-- SMOOTH-P4c: the Save button that was here is gone; this saves as it changes. -->
    `;
  }

  // ── Reflection section ──────────────────────────────────────────────────
  // Collapsible block. Reads primaryTerritory live, no stored read/unread
  // state, no new schema. Renders nothing if the user has no territory set.

  function renderReflectionSection() {
    const territory = store.get('onboarding.primaryTerritory');
    if (!territory) return '';

    const script = getBeat3Script([territory]);
    if (!script) return '';

    return `
      <div class="settings-reflection">
        <h2 class="settings-section__heading">Your reflection</h2>
        <p class="settings-section__sub">
          What we shared with you when you first joined, about why
          Alongside: Move works differently for you.
        </p>

        <button class="btn btn-secondary"
                id="settings-reflection-toggle"
                data-action="toggle-reflection"
                aria-expanded="${reflectionExpanded ? 'true' : 'false'}"
                aria-controls="settings-reflection-content"
                aria-label="${reflectionExpanded ? 'Hide your reflection' : 'Read your reflection'}">
          ${reflectionExpanded ? 'Hide reflection' : 'Read your reflection'}
        </button>

        <div class="settings-reflection__content"
             id="settings-reflection-content"
             ${reflectionExpanded ? '' : 'hidden'}
             aria-hidden="${reflectionExpanded ? 'false' : 'true'}">
          ${script.parts.map(part => `<p class="settings-reflection__para">${_esc(part)}</p>`).join('')}
        </div>
      </div>
    `;
  }

  // ── Programme panel ────────────────────────────────────────────────────────

  function renderProgrammePanel() {
    const stats        = getProgressStats();
    const goals        = store.get('goals') || [];
    const fitnessLevel = _activityLevel() || 'moderate';
    const weeklyTarget = store.get('strategicGoal.weeklySessionTarget') || 3;
    const tier         = store.get('tier') || 'free';

    return `
      <div class="settings-section">

        <!-- Active programme -->
        <h2 class="settings-section__heading">Your programme</h2>

        ${stats.hasActiveProgramme ? `
          <div class="settings-programme-card">
            <p class="settings-programme-card__name">${stats.programmeName}</p>
            <p class="settings-programme-card__week">${stats.weeksIn === 0
              ? "Just started"
              : `${stats.weeksIn} ${stats.weeksIn === 1 ? "week" : "weeks"} in`}</p>
            <p class="settings-programme-card__phase">${stats.phaseName}</p>
          </div>

          <div class="settings-actions">
            <button class="btn btn-secondary"
                    data-action="change-programme"
                    aria-label="Change your programme">
              Change programme
            </button>
            <button class="btn btn-ghost settings-btn--destructive"
                    data-action="reset-programme"
                    aria-label="Reset programme — restart from week one">
              Reset programme
            </button>
          </div>
        ` : `
          <p class="settings-empty">No active programme. Choose one from the library to get started.</p>
          <button class="btn btn-primary"
                  data-action="choose-programme"
                  aria-label="Choose a programme">
            Choose a programme
          </button>
        `}

        <!-- Weekly session target -->
        <div class="settings-field">
          <label class="settings-label" for="settings-weekly-target">
            Sessions per week
            <span class="settings-label__sub">How many sessions you're aiming for</span>
          </label>
          <select class="settings-select"
                  id="settings-weekly-target"
                  data-field="strategicGoal.weeklySessionTarget"
                  aria-label="Target sessions per week">
            ${[2, 3, 4, 5].map(n => `
              <option value="${n}" ${weeklyTarget === n ? 'selected' : ''}>${n} per week</option>
            `).join('')}
          </select>
        </div>

        <!-- Your week (v10 — restored entry point into weekly-plan.js) -->
        <h2 class="settings-section__heading">Your week</h2>
        <p class="settings-section__sub">
          ${renderWeeklyPlanSummary()}
        </p>
        <button class="btn btn-secondary"
                data-action="open-weekly-plan"
                aria-label="Plan your week — set an intent for each day">
          Plan my week
        </button>

        <!-- Goals -->
        <h2 class="settings-section__heading">Your goals</h2>
        <p class="settings-section__sub">
          Tap to change what you're working towards.
          Your programme won't be affected until you next review it.
        </p>
        <div class="settings-goals-groups" role="group" aria-label="Select your goals">
          ${offeredGoals({ weightTracking: store.get('weightTracking') === true, selected: goals }).map(cat => `
            <div class="settings-goals-category">
              <p class="settings-goals-category__label">${_esc(cat.label)}</p>
              <div class="settings-goals-grid">
                ${cat.goals.map(goal => `
                  <button
                    class="settings-goal-chip ${goals.includes(goal.id) ? 'settings-goal-chip--selected' : ''}"
                    data-goal="${goal.id}"
                    role="checkbox"
                    aria-checked="${goals.includes(goal.id) ? 'true' : 'false'}"
                    aria-label="${goal.label}">
                    <span aria-hidden="true">${goal.icon}</span>
                    ${goal.label}
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <!-- SMOOTH-P4c: the Save button that was here is gone; this saves as it changes. -->

        <!-- Activity level -->
        <h2 class="settings-section__heading">Activity level</h2>
        <p class="settings-section__sub">
          Update this as you get fitter — it affects the intensity ceiling for your sessions.
        </p>
        <div class="settings-field">
          <label class="settings-label" for="settings-fitness-level">Current activity level</label>
          <select class="settings-select"
                  id="settings-fitness-level"
                  data-field="fitnessLevel"
                  aria-label="Your current activity level">
            ${ACTIVITY_LEVELS.map(c => `<option value="${c.id}" ${fitnessLevel === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
          </select>
        </div>
        <!-- SMOOTH-P4c: the Save button that was here is gone; this saves as it changes. -->

        <!-- Coach (S1 — Nurturing only, permanently. No picker.) -->
        <h2 class="settings-section__heading">Your coach</h2>
        <p class="settings-section__sub">
          Every session is guided in a warm, nurturing style — gentle,
          emotionally attuned, and always on your side.
        </p>

      </div>
    `;
  }

  // ── Weekly plan summary line ────────────────────────────────────────────
  // Reads weeklyPlan.updatedAt live — no new schema field. Speaks to what's
  // actually true right now rather than a generic label, consistent with
  // the voice used elsewhere on this panel (Conditions/Equipment sections).

  function renderWeeklyPlanSummary() {
    const updatedAt = store.get('weeklyPlan.updatedAt');
    if (!updatedAt) {
      return `You haven't shaped a week yet — the coach will ask each day instead. Set one up and it'll use that as your starting point.`;
    }
    const formatted = new Date(updatedAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    return `Last shaped ${_esc(formatted)}. The coach uses this as its starting point each day — you can still adjust on the day itself.`;
  }

  // ── Conditions panel ───────────────────────────────────────────────────────

  function renderConditionsPanel() {
    const conditions = store.get('conditions') || [];
    const resolved   = store.get('conditionsResolved') || [];
    const meta       = store.get('conditionMeta') || {};
    const history    = store.get('checkinHistory') || {};
    const nameOf = id => (CONDITIONS.find(c => c.id === id) || {}).name || id;
    const latest = id => {
      const r = conditionReadback(id, { history, meta });
      return r.lastMentioned ? `Last mentioned at check-in ${shortDate(`${r.lastMentioned}T12:00:00`)}` : 'Not mentioned at a check-in yet';
    };
    return `
      <div class="settings-section">
        <p class="settings-section__sub">
          The coach leaves out movements likely to load what's listed here.
          When something is better, say so and I'll stop planning around it.
          If it comes back, add it again.
        </p>
        ${scopeStatementHTML({ heading: 'h2', id: 'settings-scope' })}
        ${conditions.length ? `
          <ul class="settings-conds" aria-label="Your sore or injured areas">
            ${conditions.map(id => `
              <li class="settings-cond">
                <span class="settings-cond__text">
                  <span class="settings-cond__name">${_esc(nameOf(id))}</span>
                  <span class="settings-cond__meta">${meta[id]?.addedAt ? `Since ${_esc(shortDate(`${meta[id].addedAt}T12:00:00`))} · ` : ''}${_esc(latest(id))}</span>
                </span>
                <button class="btn btn-secondary settings-cond__btn" data-resolve="${_esc(id)}"
                        aria-label="${_esc(nameOf(id))}: it's better now">It's better now</button>
              </li>`).join('')}
          </ul>
        ` : `<p class="settings-empty">Nothing listed.</p>`}
        ${resolved.length ? `
          <h2 class="settings-section__heading">Better now</h2>
          <ul class="settings-conds" aria-label="Areas you've said are better">
            ${resolved.map(r => `
              <li class="settings-cond">
                <span class="settings-cond__text">
                  <span class="settings-cond__name">${_esc(nameOf(r.id))}</span>
                  <span class="settings-cond__meta">Better since ${_esc(shortDate(r.resolvedAt))}</span>
                </span>
                <button class="btn btn-ghost settings-cond__btn" data-reopen="${_esc(r.id)}"
                        aria-label="${_esc(nameOf(r.id))}: it's back">It's back</button>
              </li>`).join('')}
          </ul>` : ''}
        <button class="btn btn-primary"
                data-action="edit-conditions"
                aria-label="Add or change your sore or injured areas">
          Add or change areas
        </button>
      </div>
    `;
  }

  // ── Equipment panel ────────────────────────────────────────────────────────

  // 05 Aug 2026 -- summary of what's actually saved, split by scope. Found
  // while investigating the gym-session location bug: this panel showed
  // nothing but a bare "Edit equipment" button, no way to glance at what
  // was saved without stepping through the whole edit flow again. Small,
  // low-risk, directly useful for verifying onboarding wasn't rushed
  // through without redoing it.
  function _equipmentSummaryLine(scope, list) {
    if (!list || list.length === 0) {
      return `<p class="text-sm text-muted">${scope}: nothing saved &mdash; bodyweight only</p>`;
    }
    const label = list.length === 1 ? "1 item" : `${list.length} items`;
    return `<p class="text-sm text-muted">${scope}: ${label} saved</p>`;
  }

  // ── Lift note panel (11 Aug 2026, PT-4) ────────────────────────────────────
  // Off by default. Someone who turns this on has asked for it, which is a
  // different thing from being given it. Copy deliberately describes it as a
  // note to yourself, never as tracking, progress, or personal bests —
  // locked principle P4. Uses the existing generic [data-toggle] handler
  // (attachEvents, ~line 805), so no new wiring.
  // LOG-1, 12 Aug 2026. Renamed from "Weight notes". The store has
  // recorded nine metrics since 11 Aug -- weight, reps, speed, incline,
  // level, distance, duration, band tension, free note -- and the fields
  // offered already adapt to the equipment. Only this panel still said
  // "what you lifted", which is very likely why the feature read as
  // weight-only. A feature that describes itself wrongly is one people
  // correctly believe does not do the thing.
  //
  // "Session notes" rather than anything with "performance", "progress"
  // or "personal best" in it: those words carry a verdict, and P4 says
  // the app may display and never interpret. The function name is left
  // as-is; the store field liftLogEnabled is untouched, since renaming a
  // live field for tidiness is a migration, not a rename.
  function renderLiftLogPanel() {
    const on = store.get('liftLogEnabled') === true;
    // PB-1. Bests are RECORDED regardless; this governs whether they are
    // shown. Turning it on later reveals everything already logged
    // rather than starting from nothing.
    const pbOn = store.get('showPersonalBests') === true;

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Session notes</h2>
        <p class="settings-section__sub">
          Jot down what you did &mdash; weight, time, level, incline, band,
          whatever that exercise actually gives you &mdash; so you are not
          guessing next time.
        </p>

        <div class="settings-field settings-field--toggle">
          <label class="settings-label" for="settings-pb">
            Show your best
            <span class="settings-label__sub">The highest you have logged for an exercise, alongside your last note. Off unless you want it.</span>
          </label>
          <button
            class="settings-toggle ${pbOn ? 'settings-toggle--on' : ''}"
            id="settings-pb-note"
            data-toggle="showPersonalBests"
            role="switch"
            aria-checked="${pbOn ? 'true' : 'false'}"
            aria-label="Show your best ${pbOn ? 'on' : 'off'}">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

        <div class="settings-field settings-field--toggle">
          <label class="settings-label" for="settings-lift-log">
            Keep session notes
            <span class="settings-label__sub">Shows what you noted last time, and somewhere to add today's</span>
          </label>
          <button
            class="settings-toggle ${on ? 'settings-toggle--on' : ''}"
            id="settings-lift-log"
            role="switch"
            aria-checked="${on ? 'true' : 'false'}"
            data-toggle="liftLogEnabled"
            aria-label="Session notes ${on ? 'on' : 'off'}">
            <span class="settings-toggle__track" aria-hidden="true"></span>
          </button>
        </div>

        <p class="text-sm text-muted" style="margin-top: var(--space-3);">
          Just what you wrote, kept for you. No streaks, no targets, and
          nothing said about whether it went up or down.
        </p>
      </div>
    `;
  }

  // ── Display panel (DISP-1) ────────────────────────────────────────

  function _dispSlider(name, id, label, hint, opts = {}) {
    const r     = DISPLAY_RANGES[name];
    const value = getDisplayPref(name);
    const anchors = opts.anchors || null;

    return `
      <div class="disp-field">
        <label class="disp-field__label" for="${id}">${label}</label>
        <span class="disp-field__hint" id="${id}-hint">${hint}</span>
        <div class="disp-slider-row">
          ${anchors ? `<span class="disp-anchor disp-anchor--small" aria-hidden="true">${anchors[0]}</span>` : ""}
          <input
            type="range"
            class="disp-slider"
            id="${id}"
            data-disp="${name}"
            min="${r.min}" max="${r.max}" step="${r.step}"
            value="${value}"
            aria-describedby="${id}-hint"
            aria-valuetext="${formatDisplayValue(name, value)}">
          ${anchors ? `<span class="disp-anchor disp-anchor--large" aria-hidden="true">${anchors[1]}</span>` : ""}
          <span class="disp-value" id="${id}-value">${formatDisplayValue(name, value)}</span>
        </div>
      </div>
    `;
  }

  function _dispToggle(name, id, label, sub) {
    const on = getDisplayPref(name) === "on";
    return `
      <div class="settings-field settings-field--toggle">
        <label class="settings-label" for="${id}">
          ${label}
          <span class="settings-label__sub">${sub}</span>
        </label>
        <button
          class="settings-toggle ${on ? "settings-toggle--on" : ""}"
          id="${id}"
          role="switch"
          aria-checked="${on ? "true" : "false"}"
          data-disp-toggle="${name}"
          aria-label="${label} ${on ? "on" : "off"}">
          <span class="settings-toggle__track" aria-hidden="true"></span>
        </button>
      </div>
    `;
  }

  function renderDisplayPanel() {
    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Display</h2>
        <p class="settings-section__sub">
          Change how the app looks to suit your eyes. Everything here is kept on
          this phone only \u2014 it is never sent anywhere.
        </p>

        <p id="disp-status" class="visually-hidden" role="status" aria-live="polite"></p>

        <div class="disp-field">
          <span class="disp-field__label" id="disp-scheme-label">Colour scheme</span>
          <span class="disp-field__hint" id="disp-scheme-hint">
            Dark is how the app is designed. The other two are here because eyes differ.
          </span>
          <div class="disp-schemes" role="radiogroup"
               aria-labelledby="disp-scheme-label" aria-describedby="disp-scheme-hint">
            ${SCHEMES.map(s => {
              const on = getDisplayPref("scheme") === s.value;
              return `
                <button type="button" class="disp-scheme ${on ? "disp-scheme--on" : ""}"
                        role="radio" aria-checked="${on}" data-scheme="${s.value}">
                  <span class="disp-scheme__label">${s.label}</span>
                  <span class="disp-scheme__sub">${s.sub}</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>

        ${_dispSlider("textScale", "disp-text-scale", "Text size",
          "Makes every piece of text in the app larger or smaller.",
          { anchors: ["A", "A"] })}

        ${_dispSlider("leadingScale", "disp-leading-scale", "Line spacing",
          "More space between lines of text. Often easier to read a long paragraph without losing your place.")}

        ${_dispSlider("letterSpacing", "disp-letter-spacing", "Letter spacing",
          "More space between individual letters. Some people find this makes words easier to separate.")}

        <div class="disp-sample" aria-hidden="true">
          <span class="disp-sample__caption">Preview</span>
          <p class="disp-sample__body">
            Some days ask for less, and that is still a session. Take what you need
            from today, and we will pick it up again tomorrow.
          </p>
        </div>

        ${_dispToggle("underline", "disp-underline", "Underline links",
          "Adds a line under every link, so colour is not the only thing marking it")}

        ${_dispToggle("focus", "disp-focus", "Stronger focus outlines",
          "A thicker, brighter ring around whatever you have selected with a keyboard")}

        ${_dispToggle("fullInstructions", "disp-full-instructions", "Always show full instructions",
          "Exercise cards normally open the parts you need and tuck the rest away. Turn this on to see everything, every time")}

        ${_dispToggle("reduceMotion", "disp-reduce-motion", "Reduce motion",
          "The app already follows your device's setting. Turn this on to keep movement on screen to a minimum here as well: no sliding, fading or typing dots")}

        <button class="btn btn-secondary" id="disp-reset" type="button"
                style="margin-top: var(--space-4);">
          Reset display to defaults
        </button>
      </div>
    `;
  }

  function renderEquipmentPanel() {
    const homeEquip = store.get('homeEquipment') || [];
    const gymEquip   = store.get('gymEquipment')  || [];

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Equipment</h2>
        <p class="settings-section__sub">
          The coach only suggests exercises that match what you have available.
        </p>
        <div style="margin-bottom: var(--space-3);">
          ${_equipmentSummaryLine("Home", homeEquip)}
          ${_equipmentSummaryLine("Gym", gymEquip)}
        </div>
        <button class="btn btn-primary"
                data-action="edit-equipment"
                aria-label="Edit your equipment">
          Edit equipment
        </button>
      </div>
    `;
  }

  // PT-3, 01 Oct 2026. The Reminders panel is gone: nothing ever sent a
  // reminder. checkInNotification and waterReminderEnabled stay in the
  // store, unwritten, for when notifications are built.

  // ── About panel (with developer bypass) ───────────────────────────────────

  // VER-1. Cache name from the running service worker, so the About
  // screen cannot drift from the build the phone is actually on.
  let swVersion = null;

  // C3, 28 Sep 2026. No controlling worker: read the cache name from the
  // file that defines it rather than show "vunknown". Same single source.
  async function _readVersionFromFile() {
    try {
      const res = await fetch('./sw.js', { cache: 'no-store' });
      if (!res.ok) return null;
      const m = (await res.text()).match(/CACHE_NAME\s*=\s*["']alongside-(v\d+)["']/);
      return m ? m[1] : null;
    } catch { return null; }
  }

  async function _readSwVersion() {
    // VER-2, 12 Aug 2026. ASK THE CONTROLLING WORKER, do not infer.
    //
    // This previously read caches.keys() and took the first alongside-v
    // entry. That answers "which caches exist", not "which one is serving
    // this page" -- and during an update both exist. Graeme saw v303 here
    // while Settings was still rendering v302's tab strip.
    //
    // A number that is confidently wrong only during an update is wrong
    // at exactly the moment somebody checks it.
    try {
      const sw = navigator.serviceWorker?.controller;
      if (!sw) return await _readVersionFromFile();
      return await new Promise(resolve => {
        const timer = setTimeout(() => resolve(null), 1200);
        const onMessage = e => {
          if (e.data?.type !== 'VERSION') return;
          clearTimeout(timer);
          navigator.serviceWorker.removeEventListener('message', onMessage);
          resolve(e.data.version || null);
        };
        navigator.serviceWorker.addEventListener('message', onMessage);
        sw.postMessage({ type: 'GET_VERSION' });
      });
    } catch { return null; }
  }

  /**
   * NAV-7. About was one 24,000-character panel; it is now three tabs.
   *
   * Parameterised rather than split into three functions: the markup
   * stays in one place where its nesting is visible, and the version
   * lookup and tier read stay single. Three copies of that preamble is
   * how they drift.
   */
  /**
   * A3, 13 Aug 2026 — "Your plan".
   *
   * The whole reason this exists: before it, the ONLY way anybody on the
   * free tier learned that Personal exists was by tapping something they
   * had just been refused. Six locked session types, three locked
   * durations, the 90-day tab, the export block, the In Step door. Every
   * one of those describes Personal in the negative -- here is a thing you
   * cannot have -- and none of them ever says what it is.
   *
   * Register matters here more than usual. This is the helper layer, not
   * the coach (P2), so it does not speak in the coach's voice and does not
   * sit in a card-coach block. It states what is true, plainly, and stops.
   * No urgency, no badge, no "most popular", nothing that reads as a
   * pitch -- the whole product's credibility rests on the coach never
   * selling, and a settings panel that starts persuading is the first
   * crack in that.
   *
   * Symmetrical by design: a Personal user opening this sees what they
   * have, not an upsell to something else. A panel that only ever exists
   * to sell becomes a panel people learn not to open.
   *
   * Price is stated here as well as on the upgrade page. Somebody deciding
   * whether to look should not have to visit the sales screen to find out
   * the number.
   *
   * PRICE-3, 18 Aug 2026: it is now IMPORTED from js/data/pricing.js, not
   * typed. It used to be typed, and on 18 Aug it still said £49.99 three
   * hours after the annual price changed. Nothing here is time-limited
   * any more -- Year 2 pricing is deferred to Year 2, so there is no
   * expiry to state.
   */
  function renderPlanPanel() {
    const tier      = store.get('tier') || 'free';
    const isPaid    = tier !== 'free';
    const tierLabel = isPaid ? 'Plan' : 'Free';

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">Your plan</h2>

        <div class="settings-plan-current">
          <p class="settings-plan-current__label">You are on</p>
          <p class="settings-plan-current__tier">${_esc(tierLabel)}</p>
        </div>

        <!-- SMOOTH-P5. The one table (js/data/tier-table.js), not a
             second description of it. C2 was a claim corrected on one page
             and left standing on this one; now there is only the table. -->
        ${tierTableHtml(_esc)}

        ${isPaid ? `
          <div class="settings-plan-block">
            <p>Five percent of what you pay goes to causes this community
               chooses.</p>
          </div>

          <div class="settings-plan-block">
            <p class="text-sm text-muted">
              Payment and renewals aren't live yet. When they are, you'll
              manage them from here.
            </p>
          </div>
        ` : `
          <div class="settings-plan-block">
            <p class="settings-plan-price">${PRICE_MONTHLY} a month, or ${PRICE_ANNUAL} for the year.</p>
            <p class="text-sm text-muted">
              Thirty days before you pay anything, and no contract either way.
              Nothing is lost if you change your mind — your data stays yours
              whatever you decide.
            </p>
          </div>

          <div class="settings-actions">
            <button class="btn btn-primary"
                    data-action="nav-upgrade"
                    aria-label="Read more about the Plan">
              Have a look
            </button>
          </div>
        `}

      </div>
    `;
  }

  function renderAboutPanel(part = "story") {
    const tier = store.get('tier') || 'free';

    // VER-1, 12 Aug 2026. This was hardcoded to '115' while the live
    // cache was at v293 -- 178 versions of drift. It is the ONLY way
    // anybody can tell which build their phone is running, and it has
    // been wrong for weeks, which makes every "are you on the latest?"
    // check during device testing meaningless. The v86 note in this
    // file's own header describes exactly that confusion happening.
    //
    // Read from the service worker instead of restating it. The registered
    // SW's script URL is not enough (it does not carry the cache name), so
    // this asks the active worker directly and falls back to the build
    // date if it cannot answer -- an honest "unknown" rather than a
    // confident wrong number.
    const APP_VERSION = swVersion || 'checking\u2026';

    return `
      <div class="settings-section">
        <h2 class="settings-section__heading">About</h2>

        <!-- WHY IT EXISTS (11 Aug 2026).
             The About panel showed a tier and a version number, which is
             a diagnostics readout rather than an About. Somebody opening
             About is usually asking "can I trust this?", and a build
             number does not answer that.
             Condensed from Graeme's own words on buildnewhabits.co.uk/about
             rather than paraphrased -- the voice is the point, and a
             summary written by anyone else would lose it. Kept short
             deliberately: this is an overview with a route to the full
             piece, not a copy of it. -->
        ${part !== "story" ? "" : `
        <div class="settings-about-story">
          <p>I built Alongside because I needed it and it didn't exist.</p>
          <p>
            I was injured, and nothing I found could adapt with me. Apps kept
            telling me to push. AI gave me generic answers. I couldn't afford
            a physio. I just needed something that understood where I was, and
            could work around what I could give rather than demand something
            I couldn't.
          </p>
          <p>
            That is where every decision in this product comes from. No
            streaks. No punishment for absence. No comparison to who you were
            last week. A coach that speaks to you first, before it asks
            anything of you &mdash; and that changes what it offers when
            you're struggling, because it noticed rather than because you
            asked.
          </p>
          <p>
            It rejects the idea of &lsquo;normal&rsquo;. We're all normal
            &mdash; perfectly, differently, normal.
          </p>
          <p class="settings-about-signoff">Graeme</p>
          <a class="btn btn-ghost btn-full"
             href="https://buildnewhabits.co.uk/about/"
             target="_blank" rel="noopener"
             aria-label="Read the full story on our website, opens in a new tab">
            Read the full story
          </a>
        </div>
        `}

        ${part !== "app" ? "" : `
        <div class="settings-about-block">
          <p>Alongside: Move</p>
          <p class="settings-version"
             id="settings-version"
             aria-label="App version ${APP_VERSION}"
             tabindex="0">
            v${APP_VERSION}
          </p>
          <p>by Build New Habits</p>
          <p>buildnewhabits.co.uk</p>
        </div>

        <div class="settings-update-block">
          <button class="btn btn-primary" id="settings-force-update-btn"
                  aria-label="Force update — clears cache and reloads the latest version">
            Update app
          </button>
          <p class="settings-update-status" id="settings-update-status" aria-live="polite"></p>
        </div>
        `}

        ${part !== "data" ? "" : `
        <div class="settings-data-about">
          <p>Everything you tell Alongside is kept on this phone, in the app\u2019s own storage. There is no account and no copy on a server.</p>
          <p>If something in the app breaks, a short error report goes to Sentry, the service we use to fix faults, in Frankfurt. It says what broke and on which screen, never what you told me.</p>
          <p><strong>Download your data</strong> makes a file of all of it, your journal included, on this phone; you can lock it with a password that only you know. <strong>Delete my health answers</strong> removes check-ins, sore areas, what you told me about your body and how you\u2019ve been, weight, journal and session notes. <strong>Reset all data</strong> removes everything. <strong>Restore from a file</strong> brings your history to a new device from a file you downloaded; nothing goes through us.</p>
        </div>
        <div class="settings-about-links">
          <button class="btn btn-ghost"
                  data-action="nav-impact"
                  aria-label="See your credits and where they go">
            Your impact
          </button>
          <button class="btn btn-ghost"
                  data-action="nav-activity-log"
                  aria-label="View your full activity log">
            Activity log
          </button>
          <button class="btn btn-ghost"
                  data-action="nav-privacy"
                  aria-label="View privacy policy">
            Privacy policy
          </button>
          <button class="btn btn-ghost"
                  data-action="reset-data"
                  aria-label="Reset all app data — this cannot be undone">
            Reset all data
          </button>
        </div>
        `}

        <!-- Developer bypass panel. Hidden until a deliberate triple-tap on
             the version label. A1: the gesture is never documented in
             user-facing copy anywhere in the product. -->
        ${!DEV_PANEL_ENABLED ? "" : `
        <div class="settings-dev-panel" id="settings-dev-panel" hidden aria-hidden="true">
          <h3 class="settings-dev-panel__heading">Developer panel</h3>
          <p class="settings-dev-panel__tier">Current tier: <strong id="dev-current-tier">${tier}</strong></p>
          <div class="settings-dev-panel__buttons"
               role="group"
               aria-label="Switch tier for testing">
            <button class="btn btn-secondary btn-sm"
                    data-dev-tier="free"
                    aria-label="Switch to Free tier">Free</button>
            <button class="btn btn-secondary btn-sm"
                    data-dev-tier="personal"
                    aria-label="Switch to the Plan">Plan</button>
            <!-- ATHLETE-RETIRE, 18 Aug 2026. The Athlete switcher is gone.
                 It was the only way into that tier and the tier granted
                 nothing, so this button's entire function was to put a
                 device into a state indistinguishable from Personal. -->
          </div>
        </div>
        `}

      </div>
    `;
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container) {
    // W2-7. Undo a stored preference. Immediate rather than batched under
    // Save: the row disappears, which is its own confirmation, and a
    // person undoing something should not have to also remember to save.
    container.querySelectorAll('[data-clear-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        store.setExercisePreference(btn.dataset.clearPref, null);
        render(container);
        attachEvents(container);
        _showToast('Back to normal — I will offer it again', container);
      });
    });

    // VER-1. Read the real cache name once, then repaint the label in
    // place. Deliberately not blocking the render: the About panel should
    // appear immediately and fill this in a moment later, rather than
    // holding the whole screen for a cache lookup.
    if (swVersion === null && (activeScreen === null || activeScreen === 'about-app')) {
      _readSwVersion().then(v => {
        // VER-1b. The cache name is "alongside-v294", so stripping the
        // prefix leaves "v294" -- already carrying its own v. The
        // template adds another, which shipped as "vv294". Strip it here
        // so the ONE place that formats a version does it once.
        swVersion = v ? v.replace(/^v/, '') : null;
        const row = container.querySelector('[data-open="about-app"] .settings-row__value');
        if (row) row.textContent = swVersion ? 'v' + swVersion : 'Not available';
        const el = container.querySelector('#settings-version');
        if (el) {
          el.textContent = swVersion ? 'v' + swVersion : 'Version not available';
          el.setAttribute('aria-label', swVersion ? 'App version ' + swVersion : 'App version not available');
        }
      });
    }

    // SMOOTH-P4c. It's better now / It's back. The person's call.
    container.querySelectorAll('[data-resolve]').forEach(btn => btn.addEventListener('click', () => {
      const name = (CONDITIONS.find(c => c.id === btn.dataset.resolve) || {}).name || btn.dataset.resolve;
      store.resolveCondition(btn.dataset.resolve);
      focusAfter = `[data-reopen="${btn.dataset.resolve}"]`;
      render(container);
      _saved(container, `${name} moved to Better now. I'll stop planning around it.`);
    }));
    container.querySelectorAll('[data-reopen]').forEach(btn => btn.addEventListener('click', () => {
      const name = (CONDITIONS.find(c => c.id === btn.dataset.reopen) || {}).name || btn.dataset.reopen;
      store.reopenCondition(btn.dataset.reopen);
      focusAfter = `[data-resolve="${btn.dataset.reopen}"]`;
      render(container);
      _saved(container, `${name} is back on your list.`);
    }));

    // SMOOTH-P4c. Page -> row screen, and back. Two levels, no more.
    container.querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeScreen = btn.dataset.open;
        focusAfter = btn.dataset.focus || '.settings-title';
        render(container);
        // B4. Seen once the screen is open: the dot goes.
        if (activeScreen === 'messages') markAllRead();
      });
    });
    // B5. Send: only now is anything sent, and only what the screen showed.
    container.querySelectorAll('[data-ev-send]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const kind = btn.dataset.evSend;
        const err = container.querySelector(`#ev-${kind}-error`);
        const say = s => { if (err) { err.textContent = ''; setTimeout(() => { err.textContent = s; }, 20); } };
        let payload;
        if (kind === 'survey') {
          const move = container.querySelector('input[name="ev-move"]:checked')?.value;
          const used = container.querySelector('input[name="ev-used"]:checked')?.value;
          payload = surveyPayload(move, used);
          if (!payload) { say('Please answer both questions, or Dismiss this message.'); return; }
        } else {
          payload = figuresPayload();
        }
        btn.disabled = true;
        const sent = await sendEvidence(payload);
        btn.disabled = false;
        if (!sent) { say(NOT_SENT); return; }
        dismissMessage(btn.dataset.msg);
        focusAfter = '.settings-title';
        render(container);
        _saved(container, 'Sent. Thank you.');
      });
    });
    container.querySelectorAll('[data-dismiss-msg]').forEach(btn => {
      btn.addEventListener('click', () => {
        dismissMessage(btn.dataset.dismissMsg);
        focusAfter = '.settings-title';
        render(container);
        _saved(container, 'Dismissed.');
      });
    });
    container.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', () => router.navigate(btn.dataset.go));
    });
    document.getElementById('settings-back-btn')?.addEventListener('click', () => {
      const from = activeScreen;
      activeScreen = null;
      focusAfter = `[data-open="${from}"]`;
      render(container);
    });

    // SMOOTH-P4c. Every field saves the moment it changes -- no Save.
    // Text saves as it is typed too, so leaving never loses a word.
    container.querySelectorAll('[data-field]').forEach(el => {
      const save = () => {
        const field = el.dataset.field;
        if (field.startsWith('capability.')) { _saveCapability(container); _saved(container); return; }
        const value = el.type === 'checkbox' ? el.checked : el.value;
        store.set(field, el.type === 'number' ? Number(value) : value);
        // P11. One answer: onboarding's field changes with it.
        if (field === 'fitnessLevel') store.set('lifestyle.activityLevel', value);
        _saved(container);
      };
      el.addEventListener('change', save);
      if (el.tagName === 'INPUT' && el.type === 'text') {
        let t = null;
        el.addEventListener('input', () => { clearTimeout(t); t = setTimeout(save, 400); });
      }
    });

    // WEIGHT-1b's conversion, now on change rather than on a Save.
    container.querySelectorAll('#settings-weight-now, #settings-weight-now-lb').forEach(el =>
      el.addEventListener('change', () => { _saveWeight(container); _saved(container); }));

    // Display preferences (DISP-1). Separate from [data-toggle] below
    // because these write to localStorage via display-prefs.js, not to
    // store -- see this file's v17 header note for why.
    const _dispAnnounce = (msg) => {
      const el = container.querySelector('#disp-status');
      if (el) el.textContent = msg;
    };

    container.querySelectorAll('[data-disp]').forEach(input => {
      const name    = input.dataset.disp;
      const readout = container.querySelector(`#${input.id}-value`);
      // 'input' updates live so the preview moves under the finger.
      input.addEventListener('input', () => {
        setDisplayPref(name, input.value);
        const text = formatDisplayValue(name, input.value);
        if (readout) readout.textContent = text;
        input.setAttribute('aria-valuetext', text);
      });
      // 'change' announces once, on release. Announcing on every 'input'
      // would flood a screen reader with a reading per step.
      input.addEventListener('change', () => {
        const label = container.querySelector(`label[for="${input.id}"]`)?.textContent.trim() || name;
        _dispAnnounce(`${label} set to ${formatDisplayValue(name, input.value)}`);
      });
    });

    container.querySelectorAll('[data-scheme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.scheme;
        setDisplayPref('scheme', value);
        container.querySelectorAll('[data-scheme]').forEach(b => {
          const on = b === btn;
          b.setAttribute('aria-checked', on ? 'true' : 'false');
          b.classList.toggle('disp-scheme--on', on);
        });
        const label = btn.querySelector('.disp-scheme__label')?.textContent.trim() || value;
        _dispAnnounce(`Colour scheme set to ${label}`);
      });
    });

    container.querySelectorAll('[data-disp-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.dispToggle;
        const next = getDisplayPref(name) !== 'on';
        setDisplayPref(name, next ? 'on' : 'off');
        btn.setAttribute('aria-checked', next ? 'true' : 'false');
        btn.classList.toggle('settings-toggle--on', next);
        const label = btn.getAttribute('aria-label') || '';
        btn.setAttribute('aria-label', label.replace(next ? 'off' : 'on', next ? 'on' : 'off'));
        _dispAnnounce(label.replace(/\s(on|off)$/, '') + (next ? ' on' : ' off'));
      });
    });

    container.querySelector('#disp-reset')?.addEventListener('click', () => {
      resetDisplayPrefs();
      render(container);
      container.querySelector('#disp-status').textContent = 'Display settings reset to defaults';
      container.querySelector('#disp-reset')?.focus();
    });

    // Toggle switches
    container.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const field   = btn.dataset.toggle;
        const current = store.get(field);
        const next    = !current;
        store.set(field, next);
        btn.setAttribute('aria-checked', next ? 'true' : 'false');
        btn.classList.toggle('settings-toggle--on', next);
        const label = btn.getAttribute('aria-label') || '';
        btn.setAttribute('aria-label', label.replace(next ? 'off' : 'on', next ? 'on' : 'off'));
        _saved(container, `${(btn.getAttribute('aria-label') || '').replace(/\s(on|off)$/, '')} ${next ? 'on' : 'off'}. Saved.`);
        // SMOOTH-P4c. These two reveal a row beneath them (the reminder
        // time; your weight and units), so the screen is drawn again and
        // focus goes back to the switch that was pressed.
        // B4. News shows or hides messages, so the list and the dot change.
        if (field === 'messages.newsOn') {
          updateNavDot();
          if (next) markAllRead();
          focusAfter = `#${btn.id}`;
          render(container);
        }
        if (field === 'weightTracking' || field === 'checkInNotification.enabled') {
          focusAfter = `#${btn.id}`;
          render(container);
        }
      });
    });

    // WEIGHT-1b. Display unit only -- NEVER touches the stored value,
    // which is canonical kilograms. Changing how you read a number must
    // not change the number.
    container.querySelectorAll('[data-weight-unit]').forEach(btn => {
      btn.addEventListener('click', () => {
        store.set('weightUnit', btn.dataset.weightUnit);
        focusAfter = `[data-weight-unit="${btn.dataset.weightUnit}"]`;
        render(container);
        _saved(container);
      });
    });

    // Goal chips
    container.querySelectorAll('[data-goal]').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('settings-goal-chip--selected');
        const checked = btn.classList.contains('settings-goal-chip--selected');
        btn.setAttribute('aria-checked', checked ? 'true' : 'false');
        store.set('goals', [...container.querySelectorAll('[data-goal][aria-checked="true"]')].map(b => b.dataset.goal));
        _saved(container);
      });
    });

    // Movement chips (v11) — six-way multi-select, mutually exclusive
    // with the separate "mixed" option.
    container.querySelectorAll('[data-movement]').forEach(btn => {
      btn.addEventListener('click', () => {
        const isMixedBtn = btn.dataset.movement === 'mixed';

        if (isMixedBtn) {
          const nowSelected = !btn.classList.contains('settings-movement-chip--selected');
          container.querySelectorAll('[data-movement]').forEach(b => {
            b.classList.remove('settings-movement-chip--selected');
            b.setAttribute('aria-checked', 'false');
            if (b.dataset.movement !== 'mixed') {
              b.disabled = nowSelected;
              b.setAttribute('aria-disabled', nowSelected ? 'true' : 'false');
            }
          });
          if (nowSelected) {
            btn.classList.add('settings-movement-chip--selected');
            btn.setAttribute('aria-checked', 'true');
          }
        } else {
          btn.classList.toggle('settings-movement-chip--selected');
          const checked = btn.classList.contains('settings-movement-chip--selected');
          btn.setAttribute('aria-checked', checked ? 'true' : 'false');
          // Selecting any specific identity clears "mixed"
          const mixedBtn = container.querySelector('[data-movement="mixed"]');
          if (mixedBtn) {
            mixedBtn.classList.remove('settings-movement-chip--selected');
            mixedBtn.setAttribute('aria-checked', 'false');
          }
        }
        store.set('movementIdentity', [...container.querySelectorAll('[data-movement][aria-checked="true"]')].map(b => b.dataset.movement));
        _saved(container);
      });
    });

    // Action buttons
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => handleAction(btn.dataset.action, container));
    });

    // Developer bypass: triple-tap version label. A1 -- gated on the same
    // flag as the markup, so flipping it removes the gesture and not just
    // the panel. Hiding one without the other leaves a live tap sequence
    // with nothing to open, which is worse than either.
    const versionEl = DEV_PANEL_ENABLED ? container.querySelector('#settings-version') : null;
    if (versionEl) {
      versionEl.addEventListener('click', () => {
        devTapCount++;
        clearTimeout(devTapTimer);
        devTapTimer = setTimeout(() => { devTapCount = 0; }, 1500);
        if (devTapCount >= 3) {
          devTapCount = 0;
          _toggleDevPanel(container);
        }
      });
    }

    // Force update — Graeme: "It's strange that my laptop is full and
    // latest version, but phone isn't... the Forced Update might need
    // to cut through those issues." sw.js's fetch handler is cache-
    // first (checked before building this, not assumed) — a stale
    // cached file is served immediately, network is never even
    // consulted, until a new service worker fully takes over. The
    // existing checkForUpdate()/applyUpdate() in app.js only handle
    // the polite path (ask the SW registration to check, apply if
    // waiting) — this button goes further: also clears every cache
    // directly and hard-reloads regardless of SW state, so it works
    // even if the SW itself is what's stuck.
    const forceUpdateBtn = container.querySelector('#settings-force-update-btn');
    if (forceUpdateBtn) {
      forceUpdateBtn.addEventListener('click', async () => {
        const statusEl = container.querySelector('#settings-update-status');
        forceUpdateBtn.disabled = true;
        if (statusEl) statusEl.textContent = 'Checking for updates…';

        try {
          if (window.App?.checkForUpdate) {
            await window.App.checkForUpdate();
          }
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
          }
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update();
          }
        } catch (err) {
          console.error('Force update failed:', err);
        }

        if (statusEl) statusEl.textContent = 'Reloading with the latest version…';
        setTimeout(() => window.location.reload(), 400);
      });
    }

    // Developer tier buttons
    container.querySelectorAll('[data-dev-tier]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tier = btn.dataset.devTier;
        store.set('tier', tier);
        const tierLabel = container.querySelector('#dev-current-tier');
        if (tierLabel) tierLabel.textContent = tier;
        // TIER-VISIBLE, 06 Sep 2026. NO SYNC OF #settings-plan-line HERE,
        // ON PURPOSE. The first draft added one. It could never run: the
        // plan line lives on the Profile panel, this switcher lives on
        // About > App, and panels are exclusive -- querySelector returns
        // null every time. Proven under jsdom, not assumed, and the gate
        // asserts the absence so nobody adds it back.
        //
        // The line is correct because it re-reads isPremium() on the next
        // render, which is what happens when the person navigates back to
        // Profile. verify-tier-visible.mjs drives exactly that path.
        _showToast(`Tier set to: ${tier}`, container);
      });
    });
  }

  // ── Action handlers ────────────────────────────────────────────────────────

  // SMOOTH-P4c. What the Save buttons did, now run as each thing changes.

  /** WEIGHT-1b: convert on the way in, always; a cleared field clears it. */
  function _saveWeight(container) {
        if (isPremium() && store.get('weightTracking') === true && healthAllowed()) {
          const unit = store.get('weightUnit') || 'kg';
          const main = container.querySelector('#settings-weight-now');
          if (main) {
            if (unit === 'st') {
              const lbEl = container.querySelector('#settings-weight-now-lb');
              const st = main.value, lb = lbEl?.value;
              if (st === '' && (lb === '' || lb === undefined)) {
                store.set('weight', null);
              } else {
                const kg = toKg({ st: Number(st || 0), lb: Number(lb || 0) }, 'st');
                if (kg !== null && kg > 0) store.set('weight', kg);
              }
            } else if (main.value === '') {
              store.set('weight', null);
            } else {
              const kg = toKg(main.value, unit);
              if (kg !== null && kg > 0) store.set('weight', kg);
            }
          }
        }

  }

  /** W3-A2: "" is stored as null, and askedAt moves both ways. */
  function _saveCapability(container) {
        // W3-A2. Empty string means "Not answered" and must be stored as
        // null, not "". capabilityProfile() tests `c.legPower || default`
        // and `balanceWorry === 'no' || === null`; an empty string is
        // falsy in the first and matches neither branch of the second,
        // which would silently make a person read as restricted.
        const FIELDS = ['balanceWorry', 'chairRise', 'legPower', 'floorAccess'];
        let anyAnswered = false;

        for (const f of FIELDS) {
          const raw = container.querySelector(`[data-field="capability.${f}"]`)?.value;
          const val = raw === '' || raw === undefined ? null : raw;
          store.set(`capability.${f}`, val);
          if (val !== null) anyAnswered = true;
        }

        // askedAt is what capabilityProfile() reads to tell "answered"
        // from "never asked". It has to move BOTH ways.
        //
        // Setting it is obvious. Clearing it is the subtle half: if
        // somebody blanks every answer, leaving askedAt set would keep
        // asked=true with all-null values, and the profile would then
        // apply its answered-path defaults rather than falling back to
        // the never-asked path. Same end state by two routes, and only
        // one of them is honest about what the person told us.
        //
        // bothFeet is deliberately untouched here. It is not asked at
        // onboarding and not editable in this section, so a blanket
        // clear would wipe a value this screen never offered to set.
        if (anyAnswered) {
          if (!store.get('capability.askedAt')) {
            store.set('capability.askedAt', new Date().toISOString());
          }
        } else if (!store.get('capability.bothFeet')) {
          store.set('capability.askedAt', null);
        }

  }

  function handleAction(action, container) {
    switch (action) {

      case 'toggle-reflection': {
        reflectionExpanded = !reflectionExpanded;
        render(container);
        const toggleBtn = container.querySelector('#settings-reflection-toggle');
        if (toggleBtn) toggleBtn.focus();
        break;
      }







      case 'change-programme':
        router.navigate('goal-setup');
        break;

      case 'choose-programme':
        router.navigate('goal-setup');
        break;

      case 'open-weekly-plan':
        router.navigate('weekly-plan');
        break;

      case 'reset-programme':
        _confirmDestructive(
          'Reset programme',
          'This will restart your programme from Week 1. Your session history will be kept. This cannot be undone.',
          () => {
            store.set('activeProgramme.currentWeek',      1);
            store.set('activeProgramme.currentPhase',     'build');
            store.set('activeProgramme.sessionsThisWeek', 0);
            store.set('activeProgramme.totalSessions',    0);
            store.set('activeProgramme.milestones',       []);
            store.set('activeProgramme.missedSessions',   []);
            store.set('activeProgramme.startDate',        new Date().toISOString());
            store.set('activeProgramme.midProgrammeGlanceShown', false);
            store.set('activeProgramme.programmeReflectionShown', false);
            _showToast('Programme reset to Week 1', container);
            render(container);
          },
          container
        );
        break;

      case 'delete-health':
        _confirmDestructive(
          'Delete my health answers',
          'This deletes your check-ins, your sore areas and how sore they were, what you told me about your body and how you have been, your weight and any target weight, your journal, and the notes and mood from your sessions and lifts. Your sessions, lifts and settings stay. Until you tell me again, I will plan as cautiously as I can. It cannot be undone. I will ask before keeping anything like this again.',
          () => {
            store.deleteHealthAnswers();
            render(container);
            _saved(container, 'Your health answers are deleted.');
          },
          container
        );
        break;

      case 'health-capability':
        // LEGAL-TRUE. Only rendered while the health consent is needed.
        setPendingRoute('settings'); router.navigate('health-consent');
        break;

      case 'edit-conditions':
        // PT-2. Sore areas are health answers: ask first if not given.
        if (healthConsentNeeded()) { setPendingRoute('settings'); router.navigate('health-consent'); break; }
        // P0 (29 Sep 2026). The conditions-update screen is retired (it
        // tracked severity, set healing goals and built programmes for a
        // condition). The sore-areas sheet is the one place to change
        // the list, from onboarding and from here.
        openSheet('onboarding/conditions', () => {
          render(container);
        });
        break;

      case 'download-data':
        _openDownloadDialog(container);
        break;

      case 'restore-data':
        // RESTORE. A file holds health answers, so this device's health
        // consent comes first.
        if (healthConsentNeeded()) { setPendingRoute('settings'); router.navigate('health-consent'); break; }
        _pickRestoreFile(container);
        break;

      case 'edit-equipment':
        // Same fix as edit-conditions, above. equipment.js already has
        // mountContainer()/setSheetDoneCallback() exports built for this
        // exact sheet pattern — reused as-is, no changes to that file.
        openSheet('onboarding/equipment', () => {
          render(container);
        });
        break;

      case 'nav-privacy':
        router.navigate('privacy');
        break;

      // Front doors added 11 Aug 2026. Both views existed and nothing
      // navigated to them -- the navigation version of the unreachable
      // content defect found eight times elsewhere today.
      case 'nav-impact':
        router.navigate('community-impact');
        break;

      // A3. The only route to the upgrade page that is not a padlock on
      // something already refused.
      case 'nav-upgrade':
        router.navigate('upgrade');
        break;

      case 'nav-activity-log':
        router.navigate('activity-log');
        break;

      case 'reset-data':
        _confirmDestructive(
          'Reset all data',
          'This will delete everything — your profile, history, and programme. It cannot be undone.',
          () => {
            store.resetEverything();   // LEGAL-TRUE: every key, not only the store
            router.navigate('onboarding/thread');
          },
          container
        );
        break;
    }
  }

  // ── Developer panel toggle ─────────────────────────────────────────────────

  function _toggleDevPanel(container) {
    const panel = container.querySelector('#settings-dev-panel');
    if (!panel) return;
    const isHidden = panel.hasAttribute('hidden');
    if (isHidden) {
      panel.removeAttribute('hidden');
      panel.removeAttribute('aria-hidden');
    } else {
      panel.setAttribute('hidden', '');
      panel.setAttribute('aria-hidden', 'true');
    }
  }

  // ── Confirmation dialog ────────────────────────────────────────────────────

  function _confirmDestructive(title, message, onConfirm, container) {
    const existing = document.getElementById('settings-confirm-dialog');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.id = 'settings-confirm-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'confirm-dialog-title');
    dialog.className = 'settings-dialog';
    dialog.innerHTML = `
      <div class="settings-dialog__backdrop"></div>
      <div class="settings-dialog__content">
        <h2 class="settings-dialog__title" id="confirm-dialog-title">${_esc(title)}</h2>
        <p class="settings-dialog__message">${_esc(message)}</p>
        <div class="settings-dialog__actions">
          <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="confirm-ok">${_esc(title)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Trap focus within dialog
    const focusable = dialog.querySelectorAll('button');
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first.focus();

    dialog.addEventListener('keydown', e => {
      if (e.key === 'Escape') { dialog.remove(); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });

    dialog.querySelector('#confirm-cancel').addEventListener('click', () => dialog.remove());
    dialog.querySelector('#confirm-ok').addEventListener('click', () => {
      dialog.remove();
      onConfirm();
    });
    dialog.querySelector('.settings-dialog__backdrop').addEventListener('click', () => dialog.remove());
  }

  // ── Restore from a file ────────────────────────────────────────────────────

  /** Opens the file picker; reads, checks, confirms, then replaces. */
  function _pickRestoreFile(container) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.hidden = true;
    input.id = 'settings-restore-input';
    document.body.appendChild(input);
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      input.remove();
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => _offerRestore(String(reader.result || ''), container);
      reader.onerror = () => _saved(container, 'That file could not be read, so nothing has been changed.');
      reader.readAsText(file);
    });
    input.click();
  }

  function _offerRestore(text, container) {
    if (isLocked(text)) { _askUnlock(text, container); return; }
    const read = readRestoreFile(text);
    if (!read.ok) { _saved(container, read.reason); return; }
    const { exportedAt, sessions, journal } = read.summary;
    const when = describeDate(exportedAt);
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    _confirmDestructive(
      'Restore from this file',
      `${when ? `This file was saved on ${when}. ` : ''}It holds ${plural(sessions, 'session', 'sessions')} and ${plural(journal, 'journal entry', 'journal entries')}. ` +
      'Restoring replaces everything Alongside has stored on this device with what is in the file. ' +
      'Your answer to the age question and your agreements on this device stay as they are. It cannot be undone.',
      () => {
        applyRestore(read.data);
        render(container);
        _saved(container, 'Restored. Your history from the file is on this device now.');
      },
      container
    );
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  function _showToast(message, container) {
    const existing = container.querySelector('.settings-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'settings-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

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
