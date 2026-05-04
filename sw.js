/**
 * sw.js - Alongside Service Worker
 *
 * alongside-v35  (May 2026)
 *
 * What changed from v34:
 *   - css/components/settings-library.css v1.1
 *     Added .btn.btn-primary colour fix — text was
 *     invisible (teal-on-teal) on Start Timer / Pause
 *     buttons due to global.css cascade override.
 *     #0F172A on #2DD4BF = 8.9:1 contrast (WCAG AAA).
 */

const CACHE_NAME = "alongside-v35";

const SHELL_URLS = [

  // ── App shell ──────────────────────────────────────────────────────────────
  "/alongside-app/",
  "/alongside-app/index.html",
  "/alongside-app/manifest.json",

  // ── CSS ────────────────────────────────────────────────────────────────────
  "/alongside-app/css/main.css",
  "/alongside-app/css/base/variables.css",
  "/alongside-app/css/base/reset.css",
  "/alongside-app/css/base/typography.css",
  "/alongside-app/css/base/global.css",
  "/alongside-app/css/layouts/app-shell.css",
  "/alongside-app/css/layouts/onboarding.css",
  "/alongside-app/css/layouts/goal-setup.css",
  "/alongside-app/css/layouts/progress.css",
  "/alongside-app/css/components/buttons.css",
  "/alongside-app/css/components/cards.css",
  "/alongside-app/css/components/equipment-modal.css",
  "/alongside-app/css/components/checkin.css",
  "/alongside-app/css/components/workout.css",
  "/alongside-app/css/components/coach-fix.css",
  "/alongside-app/css/components/settings-library.css",

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

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Install ───────────────────────────────────────────────────────────────────

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
    }).then(() => self.skipWaiting())
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────

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
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────

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
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
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
