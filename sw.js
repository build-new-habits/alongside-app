/**
 * sw.js - Alongside Service Worker
 *
 * alongside-v109 (21 Jun 2026) — router.js v6: checkin-mini added to hideNavViews
 *
 * alongside-v108 (21 Jun 2026) — router.js v5: onUnmount called synchronously in popstate handler; quiet-session.js v3: total countdown, correct durations, 20-min option
 *
 * alongside-v106 (21 Jun 2026, S4-CSS-NOTICING)
 *   - css/components/breathing-session.css added (new)
 *   - css/components/quiet-session.css added (new)
 *   - css/components/noticing.css added (new)
 *   - css/main.css: three new @imports added
 *   - js/router.js v4: onUnmount() hook; breathing-session in hideNavViews
 *   - js/views/breathing-session.js: onUnmount() export added
 *   - js/views/quiet-session.js: onUnmount() export added
 *
 * 15 June 2026 v9
 * Cache version: alongside-v105
 *
 * v105 (15 June 2026, S4-9/10)
 * - Activated the Noticing Hub. noticing.js v2: Breathing card now routes
 *   to breathing-session.js (5 types, all durations) instead of
 *   quiet-session.js's one-dimensional "breathing" mode; new Mindful
 *   Movement card routes to quiet-session.js's "mindful" mode (5/10/15
 *   min); Journal card and "This Week > Reflect on this" both replaced
 *   with warm "on its way" treatments -- both previously routed to a
 *   non-existent "journal-entry" view (dead tap), and quiet-session.js's
 *   journal mode writes journalEntries in a pre-S4-NH-SCHEMA shape that
 *   mergeWithDefaults() would silently discard (data-loss risk), so
 *   neither is wired up until S4-13/14.
 * - quiet-session.js v2: fixed a pre-existing bug where the mindful
 *   movement duration selector was dead code (renderMindfulMode's
 *   `!step` check was always false at the defaults) -- mindful mode
 *   opened straight into a frozen "0:00" session in every entry path.
 *   New `mindfulStarted` flag gates this correctly. This is what makes
 *   the new Mindful Movement card above safe to ship.
 * - intention.js v4: "Something quieter > Breathing practice" now routes
 *   to breathing-session.js instead of reflect.js (previously did
 *   nothing breathing-related). No placeholder activityLog entry is
 *   written for this path -- breathing-session.js logs its own entry.
 * - router.js v3: removed the dead "noticing-hub" VIEW_NAMES entry
 *   (duplicate of "noticing", never navigated to).
 * - app.js v2: APP_VERSION bumped (was stale at "20 May 2026 v1" through
 *   ~10 deploys, v94-v104).
 * - noticing.js and breathing-session.js added to SHELL_URLS (both
 *   existed since 21 May 2026 but were not precached -- worked online via
 *   dynamic import, would have failed offline).
 *
 * v104 (15 June 2026, S4-6)
 * - intention.js v3: game/sport logging flow. Path B (self-directed,
 *   non-gym) now captures a duration (chip picker, default 30 min) and
 *   tags named class/other entries as isEvent/eventName. No schema
 *   changes; reflect.js unchanged (fields pass through saveAndSummarise).
 *   intention.js is in SHELL_URLS so the cache version bumps regardless.
 *
 * v103 (15 June 2026, S4-NH-SCHEMA)
 * - store.js v4: Noticing Hub schema pass. Two new additive objects --
 *   journalSettings (autoTagging, categoryPrefs) and noticingPreferences
 *   (schedule, time) -- ahead of S4-9/10 through S4-15/16. schema.md
 *   bumped to v1.7 (new Section 18). No view files changed; store.js is
 *   in SHELL_URLS so the cache version bumps regardless.
 *
 * v102 (14 June 2026, S4-WP2)
 * - coach-proposal.js realigned to schema v1.6: getTodayPlan() now reads
 *   weeklyPlan.days[day] and gates on weeklyPlan.updatedAt + per-day
 *   enabled (weeklyPlanEnabled removed, never existed in store.js v3);
 *   weekly-plan day types renamed gym->workout, class->event throughout
 *   (renderers, proposalState values, button ids); workout/event
 *   renderers now reflect classFocus/location/durationMins per schema.md
 *   Section 13. No new files -- coach-proposal.js already in SHELL_URLS.
 *
 * v101 (14 June 2026, S4-WP)
 * - weekly-plan.js new view added (My Week day grid + day configuration,
 *   built against schema v1.6 weeklyPlan.days); settings.js My Week tab
 *   simplified to an entry card navigating to the "weekly-plan" route.
 *   weekly-plan.js added to SHELL_URLS.
 *
 * 13 June 2026 v4
 * Cache version: alongside-v100
 *
 * v100 (13 June 2026, S4-WP prep + S4-5)
 * - schema v1.6: weeklyPlan.days per-day type/activityName/label fields
 *   added (store.js v3); reflect.js captures moodAfter (replaces
 *   energyAfter); checkin.js stamps lastCheckin.timestamp at submission
 *   (light-touch fix), intention.js fallback removed.
 *
 * 12 June 2026 v3
 * Cache version: alongside-v99
 *
 * v99 (12 June 2026, S4-4)
 * - checkin-mini.js wired (return-visit trigger, pain chips, location update);
 *   intention.js stamps lastCheckin.timestamp fallback; coach-proposal
 *   sessionLocation bias; back/exit buttons now use router.back() across
 *   workout.js, prescribed-session.js, morning-session.js, gym-programme.js;
 *   goal-setup.js validateWeightTarget() warm timeline check.
 *
 * 01 June 2026 v2
 *
 * v96 onwards (1st June 2026)
 * - fixes to flow of checkin based on videoed experience.
 * Sleep pre-fill in check-in; morning programme auto-detects week and slot on first render
 * reflect.js improved coach acknowledgement; 
 * morning-session routes to reflect, cardio options as visual cards, progress counter enlarged; 
 * coach-proposal gym sub-screen distinguishes programme vs generative routes
 *
 * v93 changes (30 May 2026)
 * - Daily flow redesign: today.js rebuilt as Act 1 greeting screen;
 *   coach-reflection.js new view (post check-in pattern reflection + A/B/C/D);
 *   checkin.js routes to coach-reflection after submit;
 *   router.js updated (nav always visible on today/reflection/proposal,
 *   new VIEW_NAMES, init navigates to today not intention);
 *   coach-reflection.js added to SHELL_URLS
 *
 * v86 changes (23 May 2026)
 * - Cosmetic Fixes
 *
 * v82 changes (22 May 2026)
 * - weekly plan built to support personalised gym sessions
 *
 * v77 changes (22 May 2026)
 * - Gym session opens a three-option sub-screen Founder's Gym Programme; Build a session; Morning Cardio & Core
 *
 * v75 changes (22 May 2026)
 * - Adds knowledge for the coach to understand location and activity type like games.
 *
 * v74 changes (22 May 2026)
 * - Fixes yoga-sessions in Today view
 *
 * v70 changes (22 May 2026)
 * - fixing check-in state to read the correct local date
 *
 * v69 changes (21 May 2026)
 * - Session builder with day saving functions
 *
 * v68 changes (21 May 2026)
 * - rebumped to force name change
 *
 * v67 changes (21 May 2026)
 * - changed the route name in router.js from "session-builder" to "session-builder-ui", and update the two places that navigate to it.
 *
 * v66 changes (21 May 2026)
 * - wiring the session builder end-to-end
 * 
 * v65 changes (21 May 2026)
 * - changes the screen-reader (sr) display
 *
 * v64 changes (21 May 2026)
 * - quiet-session back routing; noticing return route
 *
 * v63 changes (21 May 2026)
 * - router title fix; noticing routing; textarea layout; duration cards
 *
 * v61 changes (21 May 2026)
 * - Noticing Hub; breathing; journal; session builder; store schema
 *
 * alongside-v60 — Exit without saving; Progress ghost entry filter
 *
 * v58 changes (20 May 2026):
 * - session-guard.js: replaced with correct file (patch instructions
 *   file was accidentally uploaded instead)
 * - router.js: _hasCheckedInToday fixed (reads checkinHistory not lastCheckin)
 *
 * v58 fixes gym-programme issues and having to re-check-in each time the user uses the app
 *
 * v57 changes (20 May 2026):
 *   Back gesture and version display fixes:
 *   - app.js: APP_VERSION updated to "20 May 2026 v1"
 *   - router.js: history.pushState wired to navigate(); correct back stack
 *   - coach-proposal.js: yoga scoring fixed (gymCount suppressed after 5+ day
 *     absence); recentLog now filters by 7 calendar days not last-7-entries;
 *     renderRevised fixed (p.label/p.description -> p.proposal/p.rationale)
 *   - session-guard.js: new file -- shared back gesture confirmation utility
 *   - session-guard.css: new file -- styles for confirmation dialog
 *   - index.html: session-guard.css link added
 *   - gym-programme.js: mountSessionGuard() added; showExitConfirm conflict
 *     resolved; savePartialGymSession() removed; _sessionStartTime added
 *   - core-session.js: mountSessionGuard() + dismountSessionGuard() added
 *   - yoga-session.js: mountSessionGuard() + dismountSessionGuard() added
 *   - walk-session.js: mountSessionGuard() + dismountSessionGuard() added
 *   - running-session.js: mountSessionGuard() added; rs-exit-btn confirm()
 *     replaced with showExitConfirm()
 *   - swim-session.js: mountSessionGuard() + dismountSessionGuard() added
 *   - cycle-session.js: mountSessionGuard() + dismountSessionGuard() added
 *
 * v56 changes (19 May 2026):
 *   S2b -- Exit confirmation dialog added to all 7 session views.
 *   Coach-voiced overlay card replaces browser confirm() throughout.
 *   Stay = resumes session. Exit = saves partial entry, routes to reflect.
 *   progress.css: session-exit-overlay styles added
 *
 * v55 changes (19 May 2026):
 *   - yoga-session.js: crash fixed; overview phase added
 *   - router.js: history.pushState on navigate(); popstate listener
 *   - walk/running/swim/cycle-session.js: overview phase added
 *   - core-session.js: overview phase added
 *
 * v54 changes (18 May 2026):
 *   - core-session.js: overview phase added
 *   - progress.css: avg energy/mood day count on own line
 *
 * v53 changes (18 May 2026):
 *   NS-2 -- Library as dedicated page: library.js new view
 *   settings.js: Library tab navigates to library route
 *
 * v52 changes (16 May 2026):
 *   - settings.js: equipment sub-screen fixes; My Movement multi-select fixed
 *   - progress.js: avg energy/mood shows day count
 *
 * v51 changes (16 May 2026):
 *   - settings.js: rerenderEquipment crash fixed
 *   - progress.js: body changes full multi-metric log
 *   - store.js: measurementUnit field added
 *
 * v50 changes (16 May 2026):
 *   - progress.js: renderCheckinDots rewritten; weight log inline form
 *
 * v49 changes (16 May 2026):
 *   NS-1 -- Equipment architecture: store.js fields added; settings.js rebuilt
 *
 * v48 changes (16 May 2026):
 *   - progress.css: three-state check-in dots
 *   - gym-programme.js: Do not skip note amber warning class
 *
 * v47 changes (16 May 2026):
 *   - reflect.js: finish button routes to progress not today
 *
 * v46 changes (16 May 2026):
 *   - running-session.js: warmup/run/cooldown transition cards; zone prompts
 *
 * v43 changes (14 May 2026):
 *   - coach-proposal.js: routing fixes throughout
 *
 * v42 changes (14 May 2026):
 *   NS-3: Return-visit check-in. NS-4: running-session. NS-5: swim/cycle.
 *
 * v41 changes (14 May 2026):
 *   - yoga-session.js, goal-setup.js: new files
 *
 * v33-v40 changes (9-13 May 2026):
 *   - coach-proposal.js, intention.js, settings.js, router.js: multiple fixes
 *   - core-session.js, walk-session.js: new files
 *
 * Strategy: Cache-first for the app shell (HTML, CSS, JS, assets).
 * All user data lives in localStorage -- no network requests for data.
 * App works fully offline after first load.
 *
 * RULE: Bump CACHE_NAME on every deploy that changes any file.
 * Format: alongside-vN where N increases by 1 each time.
 * Add a brief note above describing what changed.
 * sw.js must always be the LAST file deployed in any batch.
 */

const CACHE_NAME = "alongside-v109";

const SHELL_URLS = [

  //  App shell 
  "/alongside-app/",
  "/alongside-app/index.html",

  //  CSS 
  "/alongside-app/css/main.css",
  "/alongside-app/css/components/session-guard.css",
  "/alongside-app/css/components/weekly-plan.css",
  "/alongside-app/css/components/breathing-session.css",
  "/alongside-app/css/components/quiet-session.css",
  "/alongside-app/css/components/noticing.css",

  //  Core JS 
  "/alongside-app/js/app.js",
  "/alongside-app/js/router.js",
  "/alongside-app/js/store.js",
  "/alongside-app/js/tts.js",
  "/alongside-app/js/session-guard.js",

  //  Views -- main 
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
  "/alongside-app/js/views/goal-setup.js",
  "/alongside-app/js/views/library.js",
  "/alongside-app/js/views/noticing.js",

  //  Views -- session types 
  "/alongside-app/js/views/prescribed.js",
  "/alongside-app/js/views/prescribed-session.js",
  "/alongside-app/js/views/gym-programme.js",
  "/alongside-app/js/views/quiet-session.js",
  "/alongside-app/js/views/breathing-session.js",
  "/alongside-app/js/views/morning-session.js",
  "/alongside-app/js/views/core-session.js",
  "/alongside-app/js/views/yoga-session.js",
  "/alongside-app/js/views/walk-session.js",
  "/alongside-app/js/views/running-session.js",
  "/alongside-app/js/views/swim-session.js",
  "/alongside-app/js/views/cycle-session.js",

  //  Views -- onboarding 
  "/alongside-app/js/views/onboarding/welcome.js",
  "/alongside-app/js/views/onboarding/name.js",
  "/alongside-app/js/views/onboarding/about.js",
  "/alongside-app/js/views/onboarding/body.js",
  "/alongside-app/js/views/onboarding/goals.js",
  "/alongside-app/js/views/onboarding/conditions.js",
  "/alongside-app/js/views/onboarding/lifestyle.js",
  "/alongside-app/js/views/onboarding/equipment.js",
  "/alongside-app/js/views/onboarding/complete.js",

  //  Data 
  "/alongside-app/js/data/checkin.js",
  "/alongside-app/js/data/conditions.js",
  "/alongside-app/js/data/equipment.js",
  "/alongside-app/js/data/goals.js",
  "/alongside-app/js/data/workoutGenerator.js",
  "/alongside-app/js/data/programmeEngine.js",

  //  Exercise database 
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

  //  Assets 
  "/alongside-app/assets/images/logo-icon-small.png",
  "/alongside-app/assets/images/logo-icon-square.png",
  "/alongside-app/assets/images/logo-icon-128.png",
  "/alongside-app/assets/images/logo-icon-192.png",
  "/alongside-app/assets/images/logo-icon-512.png"
];

//  Message handler 
// app.js posts { type: "SKIP_WAITING" } when the user taps "Update now".
// Combined with clients.claim() in activate, the new version takes
// effect immediately without the user needing to close the app.

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

//  Install -- cache the app shell 

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can -- individual 404s do not fail the install
      return Promise.allSettled(
        SHELL_URLS.map(url =>
          cache.add(url).catch(() => {
            console.warn("SW: could not cache", url);
          })
        )
      );
    }).then(() => {
      // Take control immediately
      return self.skipWaiting();
    })
  );
});

//  Activate -- delete old caches 

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
      // Claim all open clients so new SW is active without reload
      return self.clients.claim();
    })
  );
});

//  Fetch -- cache-first for shell, network for everything else 

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not in cache -- fetch from network and cache for next time
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
        // Offline and not cached -- return app shell for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/alongside-app/index.html");
        }
      });
    })
  );
});
