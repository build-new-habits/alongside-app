/**
 * router.js
 * 02 Oct 2026 v44
 *
 * v44 - W5-16. The phone's Back leaves the app from the under-18 screen, the
 *   age question, getting started and the policy screen when there is
 *   nothing behind them (it pushed a new entry each time, so Back never
 *   left).
 *
 * 02 Oct 2026 v43
 *
 * v43 - W4-22. capture (Make it up as I go) is the Plan's: on Free the route
 *   opens the upgrade page.
 *
 * 02 Oct 2026 v42
 *
 * v42 - W4-18. After mounting, the container takes focus only when the view
 *   has not already put it inside itself (a heading): it overrode the age
 *   question, policy, health consent and under-18 headings.
 *
 * 02 Oct 2026 v41
 *
 * v41 - W4-13. No house button on any screen while the age question, the
 *   first consent or a changed policy is waiting, or for somebody under 18:
 *   from the privacy summary it led straight back (a loop).
 *
 * 02 Oct 2026 v40
 *
 * v40 - W4-1 GATE-OPEN. No house button ("Back to Today") on onboarding,
 *   the age question, the under-18 screen or the policy screen. On a fresh
 *   install it opened the whole app with nothing asked; on the other two it
 *   went nowhere. Leaving those screens is by answering them. The guards in
 *   data/age-check.js and data/consent-version.js now also cover a person
 *   who has agreed to nothing.
 *
 * v39 - CONSENT-VERSION. 'consent-update': somebody who agreed to an older
 *   Privacy Policy and Terms is asked to agree to the current one before
 *   carrying on (Settings and the privacy summary stay open).
 *
 * v38 - AGE-CHECK. 'age-check' and 'under-18', reached only through a guard
 *   that runs first: somebody who said they are under 18 sees only the
 *   under-18 screen (and the privacy summary); an install from before the
 *   check is asked once. See js/data/age-check.js.
 *
 * v37 - PT-2, HEALTH-CONSENT. 'health-consent', reached only through a
 *   guard in navigate(): before the check-in, I know what I want or the
 *   journal, when health consent was never given or was withdrawn.
 *   See js/data/health-consent.js.
 *
 * v36 - P3, FREE-BUILDER-UPGRADE. navigate(view, { replace: true }): the
 *   new view takes the place of the current one instead of stacking on
 *   it. For a view that redirects while mounting -- gym-programme sending
 *   somebody to the upgrade page -- so that Back leaves the redirect
 *   rather than re-entering it and being redirected again, a loop.
 *
 * v35 - P0, SCOPE-MINOR. 'conditions-update' retired: it tracked severity,
 *   set healing goals and built programmes for a condition. Sore areas
 *   are changed in the one sheet (onboarding/conditions).
 *
 * v34 - F8 (found starting a class from a scrolled list). A new screen
 *   could open part-way down. reset.css sets scroll-behavior: smooth, so
 *   scrollTo(0,0) ANIMATED, and focusing <main> straight after cancelled
 *   the animation where it stood: the class player opened 124px down,
 *   the safety screen's heading off the top. The reset is now instant,
 *   and focus no longer scrolls.
 *
 * v33 - SMOOTH-P3c. 'capture' (Make it up as I go) is a session now: the
 *   nav hides while it runs, like the player, and it maps to Home.
 *
 * v32 - SMOOTH-P3b. 'know-what' registered ("I know what I want", Plan
 *   Home's second door), mapped to the Home tab. Not a session, so not
 *   guarded: the guard meets the person when the session they chose
 *   starts.
 *
 * v31 - RED-FLAG. One guard, here, before any exercise route mounts: if
 *   the red-flag screen is due, or an answer stopped exercise and it has
 *   not been cleared, the person goes to 'red-flag' first and on to where
 *   they were going afterwards. Here rather than in fourteen session
 *   views for the reason GATE-ONCE gave: one place to check beats
 *   fourteen places to remember. Lazily imported like the gate. A guard
 *   that throws does NOT block the navigation -- except that it logs, and
 *   the screen's own gate proves it runs.
 *
 * v30 - GATE-ONCE. Reaching a hub screen (Home, Progress, Wellbeing,
 *   Settings, Library) ends the safety note's session, so the next
 *   session is asked again during the taper. Lazily imported and cached,
 *   like the session guard, because this file keeps no static imports.
 *
 * v29 - BLANK-QUESTION. The blank check asks whether the container is
 *   EMPTY, not whether it has text. v27 asked about text immediately;
 *   v28 asked about text 800ms later; check-in writes its markup at
 *   once but its first WORDS arrive up to two and a half seconds in, so
 *   v28 failed too. A bigger number would have been a better guess.
 *   The question was wrong, not the timing.
 *
 * 16 Sep 2026 v28
 *
 * v28 - BLANK-TIMING. v27's empty-render check ran immediately after
 *   mount and broke check-in, which builds its conversation over time.
 *   Deferred, guarded on the view still being current, and recovery
 *   extracted into _recover() so both paths share one routine.
 *
 * 16 Sep 2026 v27
 *
 * v27 - ABYSS. Graeme, on device: "I exited without saving and got stuck
 *   here. Home button doesn't work. There's nothing here. I'm in the
 *   abyss." A blank screen with no way out.
 *
 *   THREE FAULTS, COMPOUNDING. Each is survivable alone.
 *
 *   1. THE GUARD OUTLIVES ITS VIEW. session-guard.js keeps module-level
 *      state and is dismounted by the VIEW that mounted it. A view that
 *      leaves by any path other than its own exit button never
 *      dismounts. The guard then stays "active" forever.
 *
 *      #hidden-nav-home-btn calls requestExit(), which asks the guard
 *      first -- and a stale active guard answers by rendering a confirm
 *      card into a container that has just been wiped. So the home
 *      button was not dead. It was doing something invisible.
 *
 *      navigate() now dismounts the guard on every route change. The
 *      guard belongs to a session, and leaving the view ends it.
 *
 *   2. AN EMPTY RENDER WAS NOT A FAILURE. The catch below only fires if
 *      render() THROWS. A view returning "" -- or mounting nothing --
 *      produced a blank container and no error, which is exactly the
 *      screen Graeme photographed. Emptiness is now checked for and
 *      treated as a failure.
 *
 *   3. THE RECOVERY BUTTON USED AN INLINE onclick REFERENCING App.
 *      Inline handlers are the first thing a Content-Security-Policy
 *      removes, and App is a global set in app.js -- so the one control
 *      on the error screen depended on two things that can be absent
 *      exactly when everything else has gone wrong. Bound properly now.
 *
 *   BREADCRUMB. The last six routes are kept and reported with any
 *   failure, so the next report arrives with its own path rather than
 *   needing somebody to reconstruct three taps from memory.
 *
 * 08 Sep 2026 v26
 *
 * v26 - SAVED-1. 'saved-sessions' registered, mapped back to 'today'
 *   because it is reached from the Your own room on Home -- the same
 *   reason NAV-8 moved the Library there. A tab that disagrees with the
 *   door somebody came through is the fault NAV-8 fixed and TIER-F made
 *   visible the same day.
 *
 * 03 Sep 2026 v25
 *   ARC-3-SETUP. New route 'arc-setup' -> arc-setup.js.
 *
 * 03 Sep 2026 v24
 *   ARC-2. New route 'stretch-arc' -> stretch-arc.js.
 *
 * 31 Aug 2026 v23
 *   BACK-STACK + intention.js retired.
 *
 *   BACK ONLY EVER WORKED ONCE. back() popped an entry and then called
 *   navigate(), which pushed the view being LEFT straight back onto the
 *   stack. The stack never unwound -- it oscillated between the last two
 *   screens -- while the popstate handler kept adding browser entries.
 *   Which press closed the app depended on how far the two had drifted
 *   apart. Reported repeatedly as "back goes back one page, then it
 *   kicks you out", which was an exact description of the mechanism.
 *
 *   navigate() now takes { fromBack }, and a navigation caused by going
 *   back pushes nothing. Each press removes one step. At the bottom the
 *   gesture is allowed through so the app closes from Today rather than
 *   trapping somebody inside it.
 *
 *   The 'intention' route is REMOVED. It duplicated coach-reflection.js,
 *   rendered its own <h1>Today</h1> while not being Today, and was the
 *   landing place for every session exit. Flagged 19 Jul, raised four
 *   more times since. The file is deleted, not orphaned.
 *
 * 22 Aug 2026 v22
 *   THREAD-1a. New 'goal-review' route -- the hard conversation, which
 *   is entered from My Programme rather than opened over it. Back goes
 *   to my-programme, not today.
 *
 * 22 Aug 2026 v21
 *   CHOOSER-1. The 'goal-setup' route now resolves to
 *   views/programme-select.js. The old target,
 *   views/onboarding/goal-setup.js, had NEVER LOADED -- it statically
 *   imported { programmeEngine }, a symbol programmeEngine.js does not
 *   export, so it was a link-time SyntaxError. Five call sites reached
 *   it, including the chapter-end hinge fallback at today.js:734.
 *
 *   The ROUTE KEY IS DELIBERATELY UNCHANGED so those five call sites
 *   need no edit -- one of them is today.js, already scheduled for R2-a,
 *   and touch-once exists to stop two sessions editing one file.
 *   Renaming the key is tracked as CHOOSER-2.
 *
 * 18 Aug 2026 v20
 *   ONUNMOUNT-1. navigate() now calls onUnmount() on the outgoing
 *   view. It never did, despite two view headers saying it does.
 *   quiet-session.js and breathing-session.js both left timers
 *   running against a dead DOM.
 *
 * 18 Aug 2026 v19
 *   PRAC-1. New 'practices' route: the guided practice library. Nav
 *   hidden, mapped to Today because the Library is its door.
 *
 * 16 Aug 2026 v18
 *   BIAS-2. The 'coach-reflection' route and view are removed. Graeme
 *   confirmed the screen obsolete on 04 Aug; the file stayed because it
 *   was the last remaining definition of proposalBias. That logic now
 *   lives in checkin.js as a derived value, so the file has nothing
 *   left to hold.
 *
 * 16 Aug 2026 v17
 *
 * v17 - CHAP-1 step 2. New route 'my-programme' -> my-programme.js
 *   (MyProgrammeView). NOT added to hideNavViews: this is a
 *   where-am-I-going screen, not an activity flow, so the bottom nav
 *   stays visible and somebody can leave it the same way they leave
 *   Progress. NAV_MAP entry 'today', because the only route to it is
 *   the full-width row on Home -- NAV-8's rule, that the tab must agree
 *   with how you got here.
 *
 * 13 Aug 2026 v16
 *
 * v16 - NAV-8. Two NAV_MAP entries pointed at the wrong tab, in
 *   opposite directions.
 *
 *   'library' -> 'noticing' meant opening the exercise Library
 *   highlighted the wellbeing tab. Already odd; TIER-F made it visibly
 *   worse the same day by renaming that tab to "Wellbeing". Now 'today'.
 *
 *   'quiet-session' and 'breathing-session' -> 'today' meant somebody
 *   inside a breathing practice, launched from the Wellbeing hub, was
 *   told they were on Today. Now 'noticing'.
 *
 *   The nav tab is the only persistent "where am I" signal in the
 *   product. When it disagrees with how you got somewhere it is worse
 *   than absent, because it is confidently wrong.
 *
 *   Also closes a flag open since 13 Jun 2026 ("noticing / noticing-hub
 *   possible duplicate VIEW_NAMES entries -- resolve whenever the
 *   Noticing Hub is next in scope"). Verified: there is one entry, not
 *   two. The duplicate was resolved at some point and the flag never was.
 *
 * 11 Aug 2026 v15
 *
 * Navigation audit, 11 Aug 2026. Three routes pointed at view files
 * that had never been written -- about, community-impact and
 * annual-reflection -- so the router believed they existed and anything
 * navigating there failed at import. 'about' removed (settings.js has a
 * working panel); the other two are now built.
 *
 * 09 Aug 2026 v14
 *
 * v14 — New route 'in-step' -> in-step.js (InStepView). Added to
 *   hideNavViews (activity flow, same treatment as journal-entry/
 *   breathing-session) and NAV_MAP (active tab: noticing).
 *
 * 04 Aug 2026 v13
 *
 * v13 — New route 'mobility-conditioning' -> mobility-conditioning.js
 *   (MobilityConditioningView). Replaces the today.js smart-routing
 *   hack (programme-or-Library) with a real landing screen, per
 *   Graeme's design: Start a Mobility Session / My Conditions
 *   Programme / Log an event.
 *
 * 04 Aug 2026 v12
 *
 * v12 — New route 'conditions-update' -> conditions-update.js
 *   (ConditionsUpdateView), Phase D-2/D-3 of the Home Nav & Conditions
 *   Redesign. Not added to hideNavViews — this is a management screen
 *   reached from Home, not a session flow, same treatment as 'settings'.
 *
 * 04 Aug 2026 v11
 *
 * v11 — Phase C, Home Nav & Conditions Redesign. Fixed a real,
 *   previously-undiscovered bug: the 'session-builder' route pointed
 *   at './views/session-builder.js', which does not exist — the real
 *   view file is session-builder-ui.js (js/session-builder.js, no
 *   "-ui" suffix, is a separate data/logic module that view imports
 *   from, not the view itself). import(path) would have thrown before
 *   ever reaching the old/new pattern detection — this route could
 *   never have worked, on any device, until now. Found while wiring
 *   Home's new "Cardio, Core & Strength" door to it.
 *
 * 28 Jul 2026 v10
 *
 * v10 — BUILD-3 follow-on fix, found during on-device back-gesture testing.
 *   _setupPopstate()'s handler ran on EVERY popstate event, including ones
 *   pushed by session-guard.js's mountSessionGuard() (state shape
 *   { sessionGuard: true }, no 'view' key). Because e.state?.view was
 *   undefined for those, this handler silently defaulted to 'today' and
 *   force-navigated there before session-guard.js's own listener (mounted
 *   separately, per session view) could show its confirmation card — so a
 *   real device back-gesture during an active session silently exited to
 *   Today with no card, no choice, and (depending on timing) no partial
 *   save. Fixed with a one-line early return when e.state?.sessionGuard is
 *   true, leaving session-guard.js's own listener to handle that event
 *   exclusively. No other change from v9.
 *
 * v9 — Nav escape-hatch (navfix-proposalloop session). _mountView() now
 *   also toggles #hidden-nav-home-btn's visibility using the exact same
 *   hideNavViews check used for the bottom nav — no new import, no new
 *   dependency. Click handling for the icon lives in app.js v7, not
 *   here, specifically to avoid a circular import (session-guard.js
 *   already imports router.js — router.js importing session-guard.js
 *   back would create a cycle). No other change from v8.
 *
 * v8 — S3 fix. VIEW_NAMES['goal-setup'] pointed to './views/goal-setup.js',
 *   but the actual file's own header confirms it lives at
 *   './views/onboarding/goal-setup.js' — one folder off. This was the
 *   exact 404 in console ("GET .../js/views/goal-setup.js net::ERR_ABORTED
 *   404") triggered by "Choose my programme" / "Change programme" in
 *   Settings. Corrected the path. fn stays 'GoalSetupView' — the actual
 *   file exports render()/onMount() (old pattern), which _mountView()
 *   already falls back to correctly once the import itself succeeds, so
 *   no other change needed here.
 *   Separately noted, not fixed here: console also shows "Router: unknown
 *   view 'onboarding/lifestyle' — falling back to today" — this route was
 *   deliberately retired in v7 (OB-THREAD), so something is still calling
 *   navigate('onboarding/lifestyle') from a stale reference. Harmless
 *   (graceful fallback, no crash) but worth finding the caller in a future
 *   session — not diagnosed yet, don't have the calling file.
 *
 * v7 — OB-THREAD. Added onboarding/thread route. Removed retired onboarding
 *   routes from VIEW_NAMES and hideNavViews: arrival, hard-before, reflection,
 *   complete, frequency, plan-select, welcome, name, about, body, lifestyle,
 *   goal-setup (onboarding variant).
 *   onboarding/goals, conditions, equipment kept — reused as sheet content
 *   by sheet-manager.js (dynamically imported, not router-navigated).
 *   First-route logic updated in app.js v6 — router.js unchanged beyond
 *   the VIEW_NAMES and hideNavViews updates.
 *
 * v6 — Scroll reset on every view mount: window.scrollTo(0,0) called
 *   immediately after container.innerHTML is set, before focus management.
 *
 * v5 — Added onboarding/frequency and onboarding/plan-select routes.
 * v4 — Dual-pattern view support.
 * v3 — 24 Jun 2026. All Phase 5 routes.
 * v2 — 22 May 2026. history.pushState, popstate, all missing routes.
 * v1 — Initial router.
 */

const VIEW_NAMES = {

  // ── Onboarding ─────────────────────────────────────────────────────────────
  // OB-THREAD: single entry point. Replaces all previous onboarding screens.
  'onboarding/thread':  { path: './views/onboarding/thread.js',      fn: 'ThreadView'               },

  // Kept for sheet-manager.js dynamic imports — not router-navigated directly.
  // Do not remove: sheet-manager.js imports these via import() not router.navigate().
  'onboarding/goals':       { path: './views/onboarding/goals.js',       fn: 'GoalsView'        },
  'onboarding/conditions':  { path: './views/onboarding/conditions.js',  fn: 'ConditionsView'   },
  'onboarding/equipment':   { path: './views/onboarding/equipment.js',   fn: 'EquipmentView'    },
  'onboarding/plan-select': { path: './views/onboarding/plan-select.js', fn: 'PlanSelectView'   },

  // ── Core daily flow ────────────────────────────────────────────────────────
  'today':             { path: './views/today.js',            fn: 'TodayView'           },
  'checkin':           { path: './views/checkin.js',          fn: 'CheckinView'         },
  'checkin-mini':      { path: './views/checkin-mini.js',     fn: 'CheckinMiniView'     },
  'coach-proposal':    { path: './views/coach-proposal.js',   fn: 'CoachProposalView'   },
  // PLAYER-1, 08 Sep 2026. The classes existed as data nothing could
  // reach. This is the route.
  // TIMETABLE-1, 08 Sep 2026. The board of classes, and the player.
  'classes':           { path: './views/class-list.js',        fn: 'ClassListView'       },
  'class-player':      { path: './views/class-player.js',      fn: 'ClassPlayerView'     },
  'home-threshold':    { path: './views/home-threshold.js',   fn: 'HomeThresholdView'   },
  'reflect':           { path: './views/reflect.js',          fn: 'ReflectView'         },

  // ── Main views ─────────────────────────────────────────────────────────────
  'progress':          { path: './views/progress.js',         fn: 'ProgressView'        },
  'settings':          { path: './views/settings.js',         fn: 'SettingsView'        },
  'weekly-plan':       { path: './views/weekly-plan.js',      fn: 'WeeklyPlanView'      },
  'noticing':          { path: './views/noticing.js',         fn: 'NoticingView'        },
  'in-step':           { path: './views/in-step.js',          fn: 'InStepView'          },
  'journal-entry':     { path: './views/journal-entry.js',    fn: 'JournalEntryView'    },
  'activity-log':      { path: './views/activity-log.js',     fn: 'ActivityLogView'     },
  'library':           { path: './views/library.js',          fn: 'LibraryView'         },
  // SAVED-1, 08 Sep 2026. The Your own room counted saved sessions and
  // hid all but the newest behind a button that opened the BUILDER --
  // a screen for making a new one, reached by tapping a control that
  // names the ones you already have. There was nowhere else for it to
  // go: no list view existed and no route pointed at one.
  'saved-sessions':    { path: './views/saved-sessions.js',  fn: 'SavedSessionsView'   },
  // CAPTURE-1, 16 Sep 2026. Build as you go, or log what you just did.
  // Reached from the Your own room; not a fifth door on Home -- four
  // card grammars was the CLUB v1 lesson and five rooms would be the
  // same mistake in a different place.
  'capture':           { path: './views/capture.js',         fn: 'CaptureView'         },
  // SMOOTH-P3b. "I know what I want", Plan Home's second door.
  'know-what':         { path: './views/know-what.js',       fn: 'KnowWhatView'        },
  'my-programme':      { path: './views/my-programme.js',     fn: 'MyProgrammeView'     },
  // THREAD-1a. The hard conversation is ENTERED from My Programme's
  // invitation, never opened over the top of it.
  'goal-review':       { path: './views/goal-review-thread.js', fn: 'GoalReviewThreadView' },
  // 'about' removed 11 Aug 2026. It pointed at a view file that had
  // never been written, while settings.js has had a working About panel
  // all along. Two Abouts would be two places to maintain the same
  // information and two chances for them to disagree.
  'privacy':           { path: './views/privacy.js',          fn: 'PrivacyView'         },
  'upgrade':           { path: './views/upgrade.js',          fn: 'UpgradeView'         },
  // Route key retained; implementation replaced. See v21 note above.
  'goal-setup':        { path: './views/programme-select.js', fn: 'ProgrammeSelectView' },
  'community-impact':  { path: './views/community-impact.js', fn: 'CommunityImpactView' },
  // 'annual-reflection' kept, and the view now exists. Graeme: "what if
  // I forget? Is it not worth just having it there from the start?" --
  // and he is right that removing it is a weak plan, because schedules
  // get archived. A broken route was not a reminder either; it did not
  // prompt anybody, it just failed. The view is now built and handles
  // having no year of data gracefully.
  'annual-reflection': { path: './views/annual-reflection.js',fn: 'AnnualReflectionView'},

  // ── Session builder ────────────────────────────────────────────────────────
  // fix, 04 Aug 2026 (Phase C): path pointed at './views/session-builder.js',
  // which does not exist — the real view file is session-builder-ui.js
  // (js/session-builder.js, no "-ui", is a separate data/logic module this
  // view imports from, not the view itself). This route has been broken
  // since whenever it was written; found while wiring Home's new doors to
  // it. import(path) would throw before ever reaching the old/new pattern
  // detection below, so this route could never have worked, on any device.
  'session-builder':   { path: './views/session-builder-ui.js',  fn: 'SessionBuilderView'  },
  'mobility-conditioning': { path: './views/mobility-conditioning.js', fn: 'MobilityConditioningView' },
  'stretch-arc':          { path: './views/stretch-arc.js',           fn: 'StretchArcView'          },
  'arc-setup':            { path: './views/arc-setup.js',             fn: 'ArcSetupView'            },

  // ── Session views ──────────────────────────────────────────────────────────
  'workout':            { path: './views/workout.js',           fn: 'WorkoutView'           },
  'gym-programme':      { path: './views/gym-programme.js',     fn: 'GymProgrammeView'      },
  'morning-session':    { path: './views/morning-session.js',   fn: 'MorningSessionView'    },
  'core-session':       { path: './views/core-session.js',      fn: 'CoreSessionView'       },
  'yoga-session':       { path: './views/yoga-session.js',      fn: 'YogaSessionView'       },
  'walk-session':       { path: './views/walk-session.js',      fn: 'WalkSessionView'       },
  'running-session':    { path: './views/running-session.js',   fn: 'RunningSessionView'    },
  'cycle-session':      { path: './views/cycle-session.js',     fn: 'CycleSessionView'      },
  'swim-session':       { path: './views/swim-session.js',      fn: 'SwimSessionView'       },
  'quiet-session':      { path: './views/quiet-session.js',     fn: 'QuietSessionView'      },
  'breathing-session':  { path: './views/breathing-session.js', fn: 'BreathingSessionView'  },
  'prescribed':         { path: './views/prescribed.js',        fn: 'PrescribedView'        },
  'prescribed-session': { path: './views/prescribed-session.js',fn: 'PrescribedSessionView' },
  'practices':          { path: './views/practices.js',        fn: 'PracticesView'         },
  // RED-FLAG, 28 Sep 2026. Reached only through the guard in navigate().
  'red-flag':           { path: './views/red-flag.js',         fn: 'RedFlagView'           },
  // PT-2, 01 Oct 2026. Reached only through the guard in navigate().
  'health-consent':     { path: './views/health-consent.js',   fn: 'HealthConsentView'     },
  // AGE-CHECK, 01 Oct 2026. Reached only through the guard in navigate().
  'age-check':          { path: './views/age-check.js',        fn: 'AgeCheckView'          },
  'under-18':           { path: './views/under-18.js',         fn: 'Under18View'           },
  // CONSENT-VERSION, 01 Oct 2026. Reached only through the guard.
  'consent-update':     { path: './views/consent-update.js',   fn: 'ConsentUpdateView'     },
};

const hideNavViews = new Set([
  // OB-THREAD and its sheet views
  'onboarding/thread',
  'onboarding/goals', 'onboarding/conditions',
  'onboarding/equipment', 'onboarding/plan-select',
  // Core flow (no nav)
  'home-threshold', 'community-impact', 'annual-reflection',
  'checkin', 'checkin-mini', 'coach-proposal', 'class-player', 'classes',
  'workout', 'gym-programme', 'morning-session', 'core-session',
  'yoga-session', 'walk-session', 'running-session', 'cycle-session',
  'swim-session', 'quiet-session', 'breathing-session',
  'prescribed', 'prescribed-session', 'session-builder',
  'reflect', 'journal-entry', 'privacy', 'upgrade', 'in-step',
  // PRAC-1. A practice is read start to finish; the nav bar is one
  // more thing on the screen while somebody is trying to settle.
  'practices',
  // RED-FLAG. Nothing else on the screen while this is read.
  'red-flag',
  // PT-2. The same: a consent is read, not glanced at.
  'health-consent',
  // AGE-CHECK. Nothing else to go to from either.
  'age-check', 'under-18', 'consent-update',
  // SMOOTH-P3c. A session in progress, with its own Exit and Finish.
  'capture',
]);

// W4-1 GATE-OPEN. Screens left only by answering them: no house button.
const NO_EXIT_VIEWS = new Set(['onboarding/thread', 'age-check', 'under-18', 'consent-update']);

const NAV_MAP = {
  'today': 'today', 'checkin': 'today', 'checkin-mini': 'today',
  'coach-proposal': 'today', 'red-flag': 'today', 'health-consent': 'today', 'age-check': 'today', 'under-18': 'today', 'consent-update': 'today',
  'home-threshold': 'today', 'reflect': 'today',
  'workout': 'today', 'gym-programme': 'today', 'morning-session': 'today',
  'core-session': 'today', 'yoga-session': 'today', 'walk-session': 'today',
  'running-session': 'today', 'cycle-session': 'today', 'swim-session': 'today',
  // NAV-8, 13 Aug 2026. Moved from 'today'. Both are launched from the
  // Wellbeing hub (noticing.js's breathe and mindful-movement cards) and
  // exist nowhere else, so highlighting the Today tab while somebody is
  // inside a breathing practice told them they were somewhere they were
  // not. The nav tab is the only persistent "where am I" signal in the
  // product; when it disagrees with how you got here, it is worse than
  // absent.
  'quiet-session': 'noticing', 'breathing-session': 'noticing',
  'prescribed': 'today', 'prescribed-session': 'today', 'session-builder': 'today',
  'progress': 'progress', 'weekly-plan': 'progress',
  'noticing': 'noticing', 'journal-entry': 'noticing',
  'in-step': 'noticing',
  // NAV-8. 'library' moved from 'noticing' to 'today'. The Library is an
  // exercise surface reached from a Home door -- it holds every session
  // type, prescribed exercises and the programme. Mapping it to the
  // wellbeing tab was already odd; TIER-F made it worse the same day by
  // renaming that tab to "Wellbeing", so opening the exercise Library
  // now visibly highlighted "Wellbeing".
  'library': 'today',
  // SAVED-1. Reached from the Your own room on Home, so it maps to Today
  // for the same reason NAV-8 moved the Library there: the highlighted
  // tab must agree with the door somebody came through.
  'saved-sessions': 'today',
  // SMOOTH-P3b. A Home door, so the Home tab stays lit.
  'know-what': 'today',
  'capture': 'today',
  // PRAC-1. Reached from the Library, which maps to Today. Mapping it
  // to Wellbeing would repeat the NAV-8 fault from the other side --
  // the tab would disagree with the door somebody came through.
  'practices': 'today',
  // CHAP-1 step 2. Reached only from Home's full-width row.
  'my-programme': 'today',
  'goal-review': 'my-programme',
  'settings': 'settings', 'privacy': 'settings',
  'upgrade': 'settings', 'goal-setup': 'settings',
  'community-impact': 'settings', 'annual-reflection': 'settings',
};

// GATE-ONCE. The screens that mean a session is over.
// W5-16. Screens where the phone's Back, with nothing behind, leaves the app.
const BACK_LEAVES = new Set(['under-18', 'age-check', 'onboarding/thread', 'consent-update']);

const GATE_SESSION_ENDS = new Set(['today', 'progress', 'noticing', 'settings', 'library']);

export const router = {

  currentView: null,
  history:     [],
  viewCache:   {},

  init() {
    this._setupPopstate();
    this._setupNavButtons();
  },

  async navigate(viewName, opts = {}) {
    if (!VIEW_NAMES[viewName]) {
      console.warn(`Router: unknown view "${viewName}" — falling back to today`);
      viewName = 'today';
    }

    // AGE-CHECK, 01 Oct 2026. First of all: under 18 sees only the
    // under-18 screen; an install from before the check is asked once.
    try {
      if (!this._ac) this._ac = await import('./data/age-check.js');
      const to = this._ac.guardRoute(viewName);
      if (to) viewName = to;
    } catch (err) {
      console.error('Router: age-check guard failed', err);
    }

    // CONSENT-VERSION, 01 Oct 2026. Agreed to an older version: asked again.
    try {
      if (!this._cv) this._cv = await import('./data/consent-version.js');
      const to = this._cv.guardRoute(viewName);
      if (to) viewName = to;
    } catch (err) {
      console.error('Router: consent-version guard failed', err);
    }

    // W4-22. Make it up as I go is the Plan's (tier table: Free "Not
    // included"); the route opened on Free. Free goes to what the Plan is.
    if (viewName === 'capture') {
      try {
        if (!this._au) this._au = await import('./auth.js');
        if (!this._au.isPremium()) viewName = 'upgrade';
      } catch (err) { console.error('Router: tier check failed', err); }
    }

    // PT-2, 01 Oct 2026. Before a health question, health consent if it
    // was never given or was withdrawn.
    try {
      if (!this._hc) this._hc = await import('./data/health-consent.js');
      const to = this._hc.guardRoute(viewName);
      if (to) viewName = to;
    } catch (err) {
      console.error('Router: health-consent guard failed', err);
    }

    // RED-FLAG, 28 Sep 2026. Before exercise, the screen if it is due,
    // and the stop if one is unresolved. See js/data/red-flag.js.
    try {
      if (!this._rf) this._rf = await import('./data/red-flag.js');
      const to = this._rf.guardRoute(viewName);
      if (to) viewName = to;
    } catch (err) {
      console.error('Router: red-flag guard failed', err);
    }

    // BACK-STACK, 31 Aug 2026. `fromBack` marks a navigation that is
    // itself the result of going back. Such a navigation must not push
    // anything -- not onto the browser stack, not onto ours -- or the
    // act of retreating adds a step, which is why back only ever worked
    // once. See back() below.
    if (opts.replace) {
      history.replaceState({ view: viewName }, '', `#${viewName}`);
    } else if (!opts.fromBack) {
      history.pushState({ view: viewName }, '', `#${viewName}`);
    }

    // ONUNMOUNT-1. Tear the outgoing view down before mounting the next.
    //
    // quiet-session.js's own header has said since 02 Jul that onUnmount
    // is "called by router.navigate() before leaving this view". It was
    // not. Nothing called it, here or anywhere — found 18 Aug while
    // building PRAC-1, by grepping for the caller rather than trusting
    // the comment. quiet-session.js and breathing-session.js both export
    // one and both rely on it to clear a running interval, so leaving
    // either mid-session left a timer ticking against a dead DOM.
    //
    // Guarded and swallowed: a view that throws on the way out must not
    // be able to strand somebody on the screen they are trying to leave.
    if (this.currentView && this.currentView !== viewName) {
      const outgoing = this.viewCache[this.currentView];
      if (outgoing && typeof outgoing.onUnmount === 'function') {
        try { outgoing.onUnmount(); }
        catch (err) { console.warn(`Router: onUnmount failed for "${this.currentView}"`, err); }
      }
    }

    // P3. A replace leaves the view it replaces off the back stack.
    if (!opts.fromBack && !opts.replace && this.currentView && this.currentView !== viewName) {
      this.history.push(this.currentView);
      if (this.history.length > 20) this.history.shift();
    }

    // GATE-ONCE. A hub screen ends the session the safety note was
    // acknowledged for. Never allowed to block a navigation.
    if (GATE_SESSION_ENDS.has(viewName)) {
      try {
        if (!this._gate) this._gate = await import('./safety-gate.js');
        this._gate.endGateSession();
      } catch { /* never block a navigation */ }
    }

    this.currentView = viewName;
    await this._mountView(viewName);
  },

  back() {
    // BACK-STACK, 31 Aug 2026. This popped one entry and then called
    // navigate(), which pushed the view being LEFT straight back on. So
    // the stack never unwound -- it oscillated between the last two
    // screens, and once the browser's own entries ran out the app
    // closed. Reported repeatedly as "back works once, then it kicks you
    // out of the app". That description was exact.
    //
    // Going back is now a navigation that pushes nothing, so each press
    // removes one step and the stack unwinds to the bottom.
    const prev = this.history.pop();
    this.navigate(prev || 'today', { fromBack: true });
  },

  /**
   * True when there is nowhere left to go back to. The app should close
   * from the bottom of the stack rather than trap somebody inside it --
   * a back gesture that never exits is its own bug.
   */
  canGoBack() {
    return this.history.length > 0;
  },

  async _mountView(viewName) {
    const container = document.getElementById('main-content');
    if (!container) return;

    // Nav bar visibility
    const nav = document.getElementById('bottom-nav');
    if (nav) {
      if (hideNavViews.has(viewName)) {
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }
    }

    // Nav escape-hatch icon — shown exactly on the screens where the
    // bottom nav is hidden. No import of session-guard.js here: this is
    // pure visibility toggling, click handling lives in app.js.
    const escapeBtn = document.getElementById('hidden-nav-home-btn');
    // W4-13. While the age question, the first consent or a changed policy
    // is waiting (or somebody said they are under 18), the house would only
    // lead straight back to that screen: from the privacy summary it
    // opens, it looped. No house then.
    let waiting = false;
    try {
      if (!this._ac) this._ac = await import('./data/age-check.js');
      if (!this._cv) this._cv = await import('./data/consent-version.js');
      waiting = this._ac.nothingAnswered() || this._ac.ageNeeded() || this._ac.declaredUnder18() || this._cv.consentWaiting();
    } catch { waiting = false; }
    if (escapeBtn) {
      if (hideNavViews.has(viewName) && !NO_EXIT_VIEWS.has(viewName) && !waiting) {
        escapeBtn.classList.remove('hidden');
      } else {
        escapeBtn.classList.add('hidden');
      }
    }

    this._setActiveNav(viewName);

    // ABYSS 1. The guard belongs to a session; leaving the view ends it.
    // Without this a view that exits by any path other than its own
    // button leaves the guard active forever, and every later press of
    // the home escape hatch renders a confirm card into a wiped
    // container instead of going home.
    // Loaded lazily and cached: session-guard.js imports router.js, so a
    // static import here would close a cycle. This file has no static
    // imports at all for the same family of reasons.
    try {
      if (!this._guard) this._guard = await import('./session-guard.js');
      this._guard.dismountSessionGuard();
    } catch { /* never block a navigation */ }

    // ABYSS breadcrumb. Six is enough to see the path into a failure and
    // short enough to read in a Sentry tag.
    this._trail = (this._trail || []).concat(viewName).slice(-6);

    try {
      if (!this.viewCache[viewName]) {
        const { path } = VIEW_NAMES[viewName];
        this.viewCache[viewName] = await import(path);
      }

      const mod = this.viewCache[viewName];
      const { fn } = VIEW_NAMES[viewName];

      // ── New pattern ───────────────────────────────────────────────────────
      if (typeof mod[fn] === 'function') {
        const view = mod[fn](this);
        container.innerHTML = '';
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        view.mount(container);

      // ── Old pattern ───────────────────────────────────────────────────────
      } else if (typeof mod.render === 'function') {
        container.innerHTML = mod.render();
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (typeof mod.onMount === 'function') {
          mod.onMount();
        }

      } else {
        throw new Error(`View factory for "${viewName}" is not a function`);
      }

      // ABYSS 2. An empty render is a failure, and used to be silence.
      //
      // 🔴 CHECKED LATE, NOT IMMEDIATELY -- and the first version of this
      // got that wrong and broke check-in within a day.
      //
      // check-in builds its conversation over time: the coach's first
      // line arrives after a short delay, the way a real message thread
      // does. So the instant it mounts the container IS empty, and an
      // immediate check declared a working view broken. Graeme, on
      // device: "This is me doing a check in" -- with the recovery
      // screen instead of the coach.
      //
      // The principle was right and the timing was wrong. A blank screen
      // a second after opening is a fault. A blank screen in the same
      // instant is a view that has not spoken yet.
      //
      // So: one frame plus a beat, and if it is still blank THEN report.
      // Deferred rather than thrown, because by the time it fires the
      // try/catch below has long since exited -- it calls the same
      // recovery path directly.
      //
      // 🔴 AND IT ASKS ABOUT MARKUP, NOT TEXT -- the second correction to
      // this check in one day, and the first two were both guesses.
      //
      // v27 asked "is there text" immediately. v28 asked the same
      // question 800ms later. Check-in writes its markup AT ONCE -- 484
      // characters of thread shell -- but the coach's first WORDS arrive
      // between one and two and a half seconds, like a real message. So
      // it still failed, and chasing it with a bigger number would only
      // have been a better guess.
      //
      // The question was wrong. A container holding half a kilobyte of
      // structure is not blank; it is a view mid-render. The failure
      // this check exists for is a container with NOTHING in it, which
      // is what Graeme photographed.
      //
      // So: is the container empty. Text may take as long as it likes.
      const _blankCheckFor = viewName;
      setTimeout(() => {
        // Somebody may have navigated on in the meantime; only judge the
        // view that is still there.
        if (this.currentView !== _blankCheckFor) return;
        const painted = (container.innerHTML || '').trim().length > 0;
        if (!painted) this._recover(container, viewName,
          new Error(`View "${viewName}" rendered nothing`));
      }, 800);

      // W4-18. A view that put focus on its own heading keeps it: the age
      // question, the policy screen, the health consent and the under-18
      // screen each say what they ask first. Only otherwise does the
      // container take focus.
      const active = document.activeElement;
      if (!active || active === document.body || !container.contains(active)) {
        container.setAttribute('tabindex', '-1');
        container.focus({ preventScroll: true });
        setTimeout(() => container.removeAttribute('tabindex'), 100);
      }

    } catch (err) {
      this._recover(container, viewName, err);
    }
  },

  /**
   * ABYSS. The way out, wherever the failure came from.
   *
   * Shared by the mount catch and the deferred blank check, so both
   * produce the same screen with the same working button rather than two
   * recovery paths that can drift.
   */
  _recover(container, viewName, err) {
    {
      console.error(`Router: failed to mount view "${viewName}"`, err);

      // Reported with the path that led here, so the next one arrives
      // with its own evidence.
      try {
        if (window.Sentry) {
          window.Sentry.captureException(err, {
            tags:  { feature: 'router', view: viewName },
            extra: { trail: (this._trail || []).join(' \u2192 ') }
          });
        }
      } catch { /* reporting must not throw */ }

      // ABYSS 3. Built and bound, not an inline onclick referencing a
      // global. This is the one control on the screen and it has to work
      // when everything else has not.
      container.innerHTML = '';
      const wrap = document.createElement('div');
      wrap.className = 'router-error';
      wrap.setAttribute('role', 'alert');

      const p = document.createElement('p');
      p.textContent = 'Something went wrong loading this page.';

      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.type = 'button';
      btn.textContent = 'Go home';
      btn.addEventListener('click', () => {
        try { this._guard?.dismountSessionGuard(); } catch { /* best effort */ }
        this.navigate('today');
      });

      wrap.appendChild(p);
      wrap.appendChild(btn);
      container.appendChild(wrap);
      btn.focus();
    }
  },

  _setupNavButtons() {
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.nav;
        if (target) this.navigate(target);
      });
    });
  },

  _setActiveNav(viewName) {
    const activeTab = NAV_MAP[viewName] || null;
    document.querySelectorAll('[data-nav]').forEach(btn => {
      const isActive = btn.dataset.nav === activeTab;
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
      btn.classList.toggle('active', isActive);
    });
  },

  _setupPopstate() {
    history.pushState({ view: 'today' }, '', '#today');
    window.addEventListener('popstate', e => {
      if (e.state?.sessionGuard) return; // let session-guard.js handle its own state — 28 Jul 2026, fixes router.js silently overriding the back-gesture exit-guard card

      // BACK-STACK. At the bottom of the stack, let the gesture do what
      // the platform expects and leave. Re-pushing here unconditionally
      // is what made the app feel like it closed at random: it kept
      // adding browser entries while our own stack was oscillating, so
      // which press exited depended on how the two had drifted apart.
      if (!this.canGoBack() && this.currentView === 'today') return;
      // W5-16. Nor on a screen with nowhere behind it that the app holds
      // somebody on: under 18, the age question, getting started's first
      // screen, the policy screen. Back there leaves, as on Home.
      if (!this.canGoBack() && BACK_LEAVES.has(this.currentView)) return;

      const view = e.state?.view || 'today';
      history.pushState({ view }, '', `#${view}`);
      this.back();
    });
  },
};
