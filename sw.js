/**
 * sw.js - Alongside Service Worker
 *
 * alongside-v133 (28 Jun 2026) — arrival.js v2, hard-before.js v2, reflection.js v2:
 *   fix import paths for coach-voice.js and beat3-scripts.js
 *   (were ../data/ — correct path is ../../data/ from onboarding subdirectory).
 *
 * alongside-v132 (28 Jun 2026) — Build Step 7: arrival.js v1, hard-before.js v1,
 *   reflection.js v1 (three new onboarding files — Beat 1, 2, 3);
 *   beat3-scripts.js v1 (D6 content data file);
 *   complete.js v5 (routes to onboarding/arrival);
 *   onboarding-additions.css v5 (arrival, hard-before, reflection styles).
 *
 * alongside-v131 (26 Jun 2026) — Onboarding QA fixes: equipment.js v3,
 *   frequency.js v1, plan-select.js v1, complete.js v4, router.js v6,
 *   today.js v3, coach-reflection.js v4, intention.js v5,
 *   onboarding-additions.css v4.
 *
 * alongside-v130 (26 Jun 2026) — nav-fix.css v2, css/main.css v6.
 *
 * sw.js must always be the LAST file deployed in any batch.
 */

const CACHE_NAME = "alongside-v133";

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
"/alongside-app/css/components/nav-fix.css",

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
"/alongside-app/js/views/goal-setup.js",
"/alongside-app/js/views/library.js",
"/alongside-app/js/views/noticing.js",
"/alongside-app/js/views/journal-entry.js",
"/alongside-app/js/views/gym-programme.js",
"/alongside-app/js/views/weekly-plan.js",

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

// Views — onboarding
"/alongside-app/js/views/onboarding/welcome.js",
"/alongside-app/js/views/onboarding/name.js",
"/alongside-app/js/views/onboarding/about.js",
"/alongside-app/js/views/onboarding/body.js",
"/alongside-app/js/views/onboarding/goals.js",
"/alongside-app/js/views/onboarding/conditions.js",
"/alongside-app/js/views/onboarding/lifestyle.js",
"/alongside-app/js/views/onboarding/equipment.js",
"/alongside-app/js/views/onboarding/frequency.js",
"/alongside-app/js/views/onboarding/plan-select.js",
"/alongside-app/js/views/onboarding/goal-setup.js",
"/alongside-app/js/views/onboarding/complete.js",
"/alongside-app/js/views/onboarding/arrival.js",
"/alongside-app/js/views/onboarding/hard-before.js",
"/alongside-app/js/views/onboarding/reflection.js",

// Data
"/alongside-app/js/data/beat3-scripts.js",
"/alongside-app/js/data/checkin.js",
"/alongside-app/js/data/conditions.js",
"/alongside-app/js/data/equipment.js",
"/alongside-app/js/data/goals.js",
"/alongside-app/js/data/workoutGenerator.js",
"/alongside-app/js/data/programmeEngine.js",
"/alongside-app/js/data/programmes.js",
"/alongside-app/js/data/signal-words.js",
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
// app.js posts { type: "SKIP_WAITING" } when the user taps "Update now".
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Install — cache the app shell
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
