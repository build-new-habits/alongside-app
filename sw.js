/**
 * sw.js - Alongside Service Worker
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
 * (Earlier history — alongside-v130 through v169 — unchanged, see prior
 * versions of this file for full detail.)
 *
 * sw.js must always be the LAST file deployed in any batch.
 */

const CACHE_NAME = "alongside-v195";

const SHELL_URLS = [

  // App shell
  "/alongside-app/",
  "/alongside-app/index.html",

  // CSS
  "/alongside-app/css/main.css",
  "/alongside-app/css/layouts/onboarding-additions.css",
  "/alongside-app/css/layouts/today.css",
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
  "/alongside-app/css/components/tier-gating.css",

  // Core JS
  "/alongside-app/js/app.js",
  "/alongside-app/js/router.js",
  "/alongside-app/js/store.js",
  "/alongside-app/js/tts.js",
  "/alongside-app/js/session-guard.js",
  "/alongside-app/js/session-resume.js",
  "/alongside-app/js/auth.js",

  // Views — main
  "/alongside-app/js/views/today.js",
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
  "/alongside-app/js/views/about.js",
  "/alongside-app/js/views/privacy.js",
  "/alongside-app/js/views/onboarding/goal-setup.js",
  "/alongside-app/js/views/library.js",
  "/alongside-app/js/views/noticing.js",
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
  "/alongside-app/js/data/equipment.js",
  "/alongside-app/js/data/goals.js",
  "/alongside-app/js/data/workoutGenerator.js",
  "/alongside-app/js/data/programmeEngine.js",
  "/alongside-app/js/data/programmes.js",
  "/alongside-app/js/data/signal-words.js",
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
  "/alongside-app/js/data/exercises/swimming-cycling.js",
  "/alongside-app/js/data/exercises/rehabilitation.js",
  "/alongside-app/js/data/exercises/recovery.js",
  "/alongside-app/js/data/exercises/mindfulness.js",
  "/alongside-app/js/data/exercises/sport-conditioning.js",

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
});

// Install — cache the app shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        SHELL_URLS.map(url =>
          cache.add(url).catch(() => {
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

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, toCache);
        });
        return response;
      }).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/alongside-app/index.html");
        }
      });
    })
  );
});
