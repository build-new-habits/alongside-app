/**
 * sw.js - Alongside Service Worker
 *
 * 13 May 2026 v4
 * Cache version: alongside-v39
 *
 * v39 changes (13 May 2026):
 *   - coach-proposal.js: consecutive days counter fixed
 *     now uses completed-only entries; proper day-by-day chain check
 *     "started" entries (tap and back out) no longer count as training
 *
 * v38 changes (13 May 2026):
 *   - coach-proposal.js: buildReflection() rewritten for natural language
 *     ("you trained yesterday" not "gym session since Tuesday")
 *     activity log now filters on status:"completed" only
 *
 * v37 changes (13 May 2026):
 *   - intention.js: single-tap navigation (no Continue button for most paths)
 *     coach/prescribed navigate immediately; self/quiet navigate on chip tap
 *     class/other still show name field + Continue
 *   - buttons.css: removed ::before hover overlay; replaced with brightness filter
 *     fixes invisible text on mobile touch/hover stuck state
 *   - settings.js: Log an Activity navigates to activity-log view (not inline grid)
 *
 * v36 changes (13 May 2026):
 *   - gym-programme.js: navigate to intention not today after session completes
 *   - buttons.css: initial text visibility fix (superseded by v37)
 *
 * v35 changes (13 May 2026):
 *   - goal-setup.js: navigate to checkin not today after onboarding
 *   - yoga-session.js: moved to js/views/ (was incorrectly in js/data/)
 *     correct import paths for js/views/ location
 *   - onboarding/about.js: age field saves on oninput not just onchange
 *
 * v33–v34 changes (9 May 2026):
 *   - settings.js: Library tab, My Movement, facility presets (correct IDs),
 *     editable profile, conditions add/remove, 10-level voice speed slider,
 *     home vs gym equipment separation
 *   - router.js: check-in as front door; all new session views registered
 *   - intention.js: coach path routes to coach-proposal
 *   - prescribed-session.js: weight history, exercise card redesign
 *   - core-session.js: new guided core session view
 *   - walk-session.js: new coached walk session with noticing prompts
 *   - coach-proposal.js: undefined bug fixed; location-first "something else" flow;
 *     date field fixed (completedAt not loggedAt)
 *
 * Strategy: Cache-first for the app shell (HTML, CSS, JS, assets).
 * All user data lives in localStorage — no network requests for data.
 * App works fully offline after first load.
 *
 * Bumping CACHE_NAME deletes all old caches on activate.
 * skipWaiting() in both install and message handler ensures immediate
 * activation without requiring all tabs to close.
 */

const CACHE_NAME = "alongside-v39";

const SHELL_URLS = [

  // ── App shell ────────────────────────────────────────────────────────────
  "/alongside-app/",
  "/alongside-app/index.html",

  // ── CSS ──────────────────────────────────────────────────────────────────
  "/alongside-app/css/main.css",

  // ── Core JS ──────────────────────────────────────────────────────────────
  "/alongside-app/js/app.js",
  "/alongside-app/js/router.js",
  "/alongside-app/js/store.js",
  "/alongside-app/js/tts.js",

  // ── Views — main ─────────────────────────────────────────────────────────
  "/alongside-app/js/views/today.js",
  "/alongside-app/js/views/checkin.js",
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

  // ── Views — session types ─────────────────────────────────────────────────
  "/alongside-app/js/views/prescribed.js",
  "/alongside-app/js/views/prescribed-session.js",
  "/alongside-app/js/views/gym-programme.js",
  "/alongside-app/js/views/quiet-session.js",
  "/alongside-app/js/views/yoga-session.js",
  "/alongside-app/js/views/core-session.js",
  "/alongside-app/js/views/walk-session.js",
  "/alongside-app/js/views/morning-session.js",

  // ── Views — onboarding ────────────────────────────────────────────────────
  "/alongside-app/js/views/onboarding/welcome.js",
  "/alongside-app/js/views/onboarding/name.js",
  "/alongside-app/js/views/onboarding/about.js",
  "/alongside-app/js/views/onboarding/body.js",
  "/alongside-app/js/views/onboarding/goals.js",
  "/alongside-app/js/views/onboarding/conditions.js",
  "/alongside-app/js/views/onboarding/lifestyle.js",
  "/alongside-app/js/views/onboarding/equipment.js",
  "/alongside-app/js/views/onboarding/complete.js",

  // ── Data ──────────────────────────────────────────────────────────────────
  "/alongside-app/js/data/checkin.js",
  "/alongside-app/js/data/conditions.js",
  "/alongside-app/js/data/equipment.js",
  "/alongside-app/js/data/goals.js",
  "/alongside-app/js/data/workoutGenerator.js",
  "/alongside-app/js/data/programmeEngine.js",

  // ── Exercise database ─────────────────────────────────────────────────────
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

  // ── Assets ────────────────────────────────────────────────────────────────
  "/alongside-app/assets/images/logo-icon-small.png",
  "/alongside-app/assets/images/logo-icon-square.png",
  "/alongside-app/assets/images/logo-icon-128.png",
  "/alongside-app/assets/images/logo-icon-192.png",
  "/alongside-app/assets/images/logo-icon-512.png"
];

// ── Message handler ───────────────────────────────────────────────────────────
// app.js posts { type: "SKIP_WAITING" } when the user taps "Update now".
// Combined with clients.claim() in activate, the new version takes
// effect immediately without the user needing to close the app.

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Install — cache the app shell ─────────────────────────────────────────────

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can — individual 404s do not fail the install
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

// ── Activate — delete old caches ──────────────────────────────────────────────

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

// ── Fetch — cache-first for shell, network for everything else ────────────────

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not in cache — fetch from network and cache for next time
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
        // Offline and not cached — return app shell for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/alongside-app/index.html");
        }
      });
    })
  );
});
