/**
 * sw.js - Alongside Service Worker
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

const CACHE_NAME = "alongside-v175";

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

  // Core JS
  "/alongside-app/js/app.js",
  "/alongside-app/js/router.js",
  "/alongside-app/js/store.js",
  "/alongside-app/js/tts.js",
  "/alongside-app/js/session-guard.js",

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
