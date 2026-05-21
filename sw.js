/**
 * sw.js - Alongside Service Worker
 *
 * 21 May 2026 v10
 * Cache version: alongside-v69
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

const CACHE_NAME = "alongside-v69";

const SHELL_URLS = [

  //  App shell 
  "/alongside-app/",
  "/alongside-app/index.html",

  //  CSS 
  "/alongside-app/css/main.css",
  "/alongside-app/css/components/session-guard.css",

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
  "/alongside-app/js/views/workout.js",
  "/alongside-app/js/views/workout-complete.js",
  "/alongside-app/js/views/progress.js",
  "/alongside-app/js/views/settings.js",
  "/alongside-app/js/views/reflect.js",
  "/alongside-app/js/views/about.js",
  "/alongside-app/js/views/privacy.js",
  "/alongside-app/js/views/goal-setup.js",
  "/alongside-app/js/views/library.js",

  //  Views -- session types 
  "/alongside-app/js/views/prescribed.js",
  "/alongside-app/js/views/prescribed-session.js",
  "/alongside-app/js/views/gym-programme.js",
  "/alongside-app/js/views/quiet-session.js",
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
