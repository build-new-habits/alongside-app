/**
 * sw.js - Alongside Service Worker
 *
 * Strategy: Cache-first for the app shell (HTML, CSS, JS, fonts, icons).
 * All data lives in localStorage — no network requests for user data.
 * This means the app works fully offline after first load.
 *
 * Cache versioning: bump CACHE_NAME when deploying breaking changes.
 * Old caches are deleted on activate so users always get the latest shell.
 */

const CACHE_NAME = "alongside-v17";

const SHELL_URLS = [
  "/alongside-app/",
  "/alongside-app/index.html",
  "/alongside-app/css/main.css",
  "/alongside-app/js/app.js",
  "/alongside-app/js/router.js",
  "/alongside-app/js/tts.js",
  "/alongside-app/js/store.js",
  "/alongside-app/js/views/today.js",
  "/alongside-app/js/views/checkin.js",
  "/alongside-app/js/views/workout.js",
  "/alongside-app/js/views/progress.js",
  "/alongside-app/js/views/settings.js",
  "/alongside-app/js/views/prescribed-session.js",
  "/alongside-app/js/views/prescribed.js",
  "/alongside-app/js/views/workout-complete.js",
  "/alongside-app/js/views/goal-setup.js",
  "/alongside-app/js/views/about.js",
  "/alongside-app/js/views/onboarding/welcome.js",
  "/alongside-app/js/views/onboarding/name.js",
  "/alongside-app/js/views/onboarding/about.js",
  "/alongside-app/js/views/onboarding/body.js",
  "/alongside-app/js/views/onboarding/goals.js",
  "/alongside-app/js/views/onboarding/conditions.js",
  "/alongside-app/js/views/onboarding/lifestyle.js",
  "/alongside-app/js/views/onboarding/equipment.js",
  "/alongside-app/js/views/onboarding/complete.js",
  "/alongside-app/js/data/checkin.js",
  "/alongside-app/js/data/conditions.js",
  "/alongside-app/js/data/equipment.js",
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
  "/alongside-app/js/data/goals.js",
  "/alongside-app/js/data/workoutGenerator.js",
  "/alongside-app/js/data/programmeEngine.js",
  "/alongside-app/assets/images/logo-icon-small.png",
  "/alongside-app/assets/images/logo-icon-square.png",
  "/alongside-app/assets/images/logo-icon-192.png",
  "/alongside-app/assets/images/logo-icon-512.png"
];

// ── Message handler ───────────────────────────────────────────────────────────
// app.js posts { type: "SKIP_WAITING" } when the user taps "Update now".
// This tells the waiting SW to activate immediately rather than waiting
// for all tabs to close. Combined with clients.claim() in activate,
// the new version takes effect without the user needing to close the app.

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Install — cache the app shell ────────────────────────────────────────────

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can — don't fail install if individual files 404
      return Promise.allSettled(
        SHELL_URLS.map(url => cache.add(url).catch(() => {
          console.warn("SW: could not cache", url);
        }))
      );
    }).then(() => {
      // Take control immediately — don't wait for old SW to retire
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
      // Claim all open clients so new SW takes effect without reload
      return self.clients.claim();
    })
  );
});

// ── Fetch — cache-first for shell, network-first for everything else ──────────

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Only handle same-origin requests (not Google Fonts etc — those are fine to fail)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not in cache — fetch from network and cache the response
      return fetch(event.request).then(response => {
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Offline and not cached — return the app shell for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/alongside-app/index.html");
        }
      });
    })
  );
});
