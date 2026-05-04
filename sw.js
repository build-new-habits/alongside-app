/**
 * sw.js - Alongside Service Worker
 *
 * alongside-v33  (S4-2 bug-fix session, May 2026)
 *
 * What changed:
 *   - coach-proposal.js v1.1  (NaN date fix, movementIdentity array fix, first-use path)
 *   - settings.js v1.6        (My Movement tab, facility presets, multi-select identity)
 *
 * Strategy: Cache-first for the app shell (HTML, CSS, JS, assets).
 * All user data lives in localStorage. The app works fully offline after first load.
 *
 * IMPORTANT — temp-file-then-rename pattern:
 *   Always write sw.js atomically. Non-atomic writes have emptied this file before.
 *   Never stream directly into sw.js in the GitHub web editor — paste the full
 *   content into a scratch file, verify it, then replace.
 *
 * Cache versioning:
 *   Bump CACHE_NAME on every deployment that changes any cached file.
 *   Old caches are deleted on activate. Users get the new shell without
 *   needing to close the app — skipWaiting() is called on install.
 */

const CACHE_NAME = "alongside-v33";

const SHELL_URLS = [

  // ── App shell ──────────────────────────────────────────────────────────────
  "/alongside-app/",
  "/alongside-app/index.html",
  "/alongside-app/manifest.json",

  // ── CSS ────────────────────────────────────────────────────────────────────
  "/alongside-app/css/main.css",

  // ── Core JS ───────────────────────────────────────────────────────────────
  "/alongside-app/js/app.js",
  "/alongside-app/js/router.js",
  "/alongside-app/js/store.js",
  "/alongside-app/js/tts.js",

  // ── Views — main ──────────────────────────────────────────────────────────
  "/alongside-app/js/views/coach-proposal.js",
  "/alongside-app/js/views/checkin.js",
  "/alongside-app/js/views/today.js",
  "/alongside-app/js/views/progress.js",
  "/alongside-app/js/views/settings.js",
  "/alongside-app/js/views/intention.js",
  "/alongside-app/js/views/reflect.js",
  "/alongside-app/js/views/quiet-session.js",
  "/alongside-app/js/views/yoga-session.js",
  "/alongside-app/js/views/activity-log.js",
  "/alongside-app/js/views/gym-programme.js",
  "/alongside-app/js/views/prescribed.js",
  "/alongside-app/js/views/prescribed-session.js",
  "/alongside-app/js/views/workout.js",
  "/alongside-app/js/views/workout-complete.js",
  "/alongside-app/js/views/goal-setup.js",
  "/alongside-app/js/views/about.js",
  "/alongside-app/js/views/privacy.js",

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

  // ── Exercise databases ────────────────────────────────────────────────────
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
  "/alongside-app/assets/images/logo-icon-128.png",
  "/alongside-app/assets/images/logo-icon-192.png",
  "/alongside-app/assets/images/logo-icon-512.png",
  "/alongside-app/assets/images/logo-icon-small.png",
  "/alongside-app/assets/images/logo-icon-square.png"

];

// ── Message handler ───────────────────────────────────────────────────────────
// app.js posts { type: "SKIP_WAITING" } when the user taps "Update now".
// This tells the waiting SW to activate immediately rather than waiting
// for all tabs to close. Combined with clients.claim() in activate,
// the new version takes effect without the user needing to close the app.

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Install — cache the app shell ────────────────────────────────────────────

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can — do not fail install if individual files 404.
      // This is intentional: a missing optional view should not block the SW.
      return Promise.allSettled(
        SHELL_URLS.map(url =>
          cache.add(url).catch(() => {
            console.warn("SW: could not cache", url);
          })
        )
      );
    }).then(() => {
      // Take control immediately — do not wait for the old SW to retire.
      return self.skipWaiting();
    })
  );
});

// ── Activate — delete old caches ─────────────────────────────────────────────

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
      // Claim all open clients so the new SW takes effect without a reload.
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
  // External resources (fonts, analytics) are allowed to fail gracefully
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not in cache — fetch from network and cache the response for next time
      return fetch(event.request).then(response => {
        // Only cache valid same-origin basic responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Offline and not in cache — return the app shell for navigation requests
        // so the SPA router can handle the route client-side
        if (event.request.mode === "navigate") {
          return caches.match("/alongside-app/index.html");
        }
        // For non-navigation requests (JS modules etc) just fail silently
      });
    })
  );
});
