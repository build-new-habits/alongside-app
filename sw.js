/**
 * sw.js
 * 26 Jun 2026 v128
 *
 * alongside-v128 (26 Jun 2026) — equipment.js v2: facility cards full card
 *   treatment, equipment sub-screen accordions + wrapping chip layout.
 *   onboarding-additions.css v3: equip-facility-card, accordion, chip-wrap styles.
 * alongside-v127 (26 Jun 2026) — onboarding-additions.css v2: .chip-group/.chip
 *   and .equipment-chip rules; fixes O3/O9 plain-text rendering.
 * alongside-v126 (26 Jun 2026) — nav-fix.css v2: flex layout fix for nav bar.
 * alongside-v125 (26 Jun 2026) — CSS batch: today.css, settings.css,
 *   weekly-plan-v2.css, gym-programme.css, journal-entry.css,
 *   onboarding-additions.css v1.
 * alongside-v124 (25 Jun 2026) — coach-proposal.js v6: routing + availTime fix.
 * alongside-v123 (24 Jun 2026) — checkin.js data v3: backward-compat exports.
 * alongside-v122 (24 Jun 2026) — goals.js v2: GOALS flat array re-export.
 * alongside-v121 (24 Jun 2026) — router.js v4: dual-pattern detection.
 * alongside-v120 (24 Jun 2026) — app.js v5: window.router + window.store globals.
 * alongside-v119 (23 Jun 2026) — Phase 5 sprint: store.js v6, 21 files.
 * alongside-v114 (22 Jun 2026) — store.js v5 checkinHistory bug fixed.
 *
 * Content-gated — add to SHELL_URLS when deployed:
 *   /alongside-app/js/views/home-threshold.js          D3
 *   /alongside-app/js/views/community-impact.js        D10
 *   /alongside-app/js/views/annual-reflection.js       D8
 *   /alongside-app/js/views/onboarding/arrival.js      D6
 *   /alongside-app/js/views/onboarding/hard-before.js  D6
 *   /alongside-app/js/views/onboarding/reflection.js   D6
 *   /alongside-app/js/data/noticing-territories.js     D5
 *   /alongside-app/js/data/mindful-prompts.js          D7
 *   /alongside-app/css/components/checkin-conversation.css  D2
 *   /alongside-app/css/components/home-threshold.css   D3
 *   /alongside-app/css/components/community-impact.css D10
 *   /alongside-app/css/components/annual-reflection.css D8
 *
 * sw.js is always the last file deployed in any batch.
 */

const CACHE_NAME = "alongside-v128";

const SHELL_URLS = [

  // App shell
  "/alongside-app/",
  "/alongside-app/index.html",
  "/alongside-app/manifest.json",

  // CSS: Base
  "/alongside-app/css/main.css",
  "/alongside-app/css/base/variables.css",
  "/alongside-app/css/base/reset.css",
  "/alongside-app/css/base/typography.css",
  "/alongside-app/css/base/global.css",

  // CSS: Layouts
  "/alongside-app/css/layouts/app-shell.css",
  "/alongside-app/css/layouts/onboarding.css",
  "/alongside-app/css/layouts/goal-setup.css",
  "/alongside-app/css/layouts/progress.css",
  "/alongside-app/css/layouts/today.css",
  "/alongside-app/css/layouts/onboarding-additions.css",

  // CSS: Components
  "/alongside-app/css/components/buttons.css",
  "/alongside-app/css/components/cards.css",
  "/alongside-app/css/components/equipment-modal.css",
  "/alongside-app/css/components/checkin.css",
  "/alongside-app/css/components/workout.css",
  "/alongside-app/css/components/coach-fix.css",
  "/alongside-app/css/components/coach-proposal.css",
  "/alongside-app/css/components/morning-session.css",
  "/alongside-app/css/components/session-guard.css",
  "/alongside-app/css/components/settings-library.css",
  "/alongside-app/css/components/weekly-plan.css",
  "/alongside-app/css/components/breathing-session.css",
  "/alongside-app/css/components/quiet-session.css",
  "/alongside-app/css/components/noticing.css",
  "/alongside-app/css/components/settings.css",
  "/alongside-app/css/components/weekly-plan-v2.css",
  "/alongside-app/css/components/gym-programme.css",
  "/alongside-app/css/components/journal-entry.css",
  "/alongside-app/css/components/nav-fix.css",

  // JS: Core
  "/alongside-app/js/app.js",
  "/alongside-app/js/store.js",
  "/alongside-app/js/router.js",
  "/alongside-app/js/tts.js",
  "/alongside-app/js/session-guard.js",
  "/alongside-app/js/session-builder.js",

  // JS: Data
  "/alongside-app/js/data/signal-words.js",
  "/alongside-app/js/data/coach-voice.js",
  "/alongside-app/js/data/goals.js",
  "/alongside-app/js/data/checkin.js",
  "/alongside-app/js/data/programmes.js",
  "/alongside-app/js/data/programmeEngine.js",
  "/alongside-app/js/data/conditions.js",
  "/alongside-app/js/data/equipment.js",
  "/alongside-app/js/data/workoutGenerator.js",
  "/alongside-app/js/data/morning-programme.js",

  // JS: Data — Exercises
  "/alongside-app/js/data/exercises/index.js",
  "/alongside-app/js/data/exercises/cardio.js",
  "/alongside-app/js/data/exercises/mindfulness.js",
  "/alongside-app/js/data/exercises/mobility.js",
  "/alongside-app/js/data/exercises/pilates.js",
  "/alongside-app/js/data/exercises/recovery.js",
  "/alongside-app/js/data/exercises/rehabilitation.js",
  "/alongside-app/js/data/exercises/running.js",
  "/alongside-app/js/data/exercises/sport_conditioning.js",
  "/alongside-app/js/data/exercises/strength.js",
  "/alongside-app/js/data/exercises/swimming_cycling.js",
  "/alongside-app/js/data/exercises/yoga.js",

  // JS: Views — Onboarding
  "/alongside-app/js/views/onboarding/welcome.js",
  "/alongside-app/js/views/onboarding/name.js",
  "/alongside-app/js/views/onboarding/about.js",
  "/alongside-app/js/views/onboarding/body.js",
  "/alongside-app/js/views/onboarding/goals.js",
  "/alongside-app/js/views/onboarding/conditions.js",
  "/alongside-app/js/views/onboarding/lifestyle.js",
  "/alongside-app/js/views/onboarding/equipment.js",
  "/alongside-app/js/views/onboarding/goal-setup.js",
  "/alongside-app/js/views/onboarding/complete.js",

  // JS: Views — Main
  "/alongside-app/js/views/today.js",
  "/alongside-app/js/views/checkin.js",
  "/alongside-app/js/views/checkin-mini.js",
  "/alongside-app/js/views/coach-reflection.js",
  "/alongside-app/js/views/coach-proposal.js",
  "/alongside-app/js/views/intention.js",
  "/alongside-app/js/views/reflect.js",
  "/alongside-app/js/views/progress.js",
  "/alongside-app/js/views/settings.js",
  "/alongside-app/js/views/weekly-plan.js",
  "/alongside-app/js/views/noticing.js",
  "/alongside-app/js/views/journal-entry.js",
  "/alongside-app/js/views/activity-log.js",
  "/alongside-app/js/views/library.js",
  "/alongside-app/js/views/about.js",
  "/alongside-app/js/views/privacy.js",
  "/alongside-app/js/views/upgrade.js",
  "/alongside-app/js/views/goal-setup.js",
  "/alongside-app/js/views/session-builder.js",

  // JS: Views — Session types
  "/alongside-app/js/views/workout.js",
  "/alongside-app/js/views/gym-programme.js",
  "/alongside-app/js/views/morning-session.js",
  "/alongside-app/js/views/core-session.js",
  "/alongside-app/js/views/yoga-session.js",
  "/alongside-app/js/views/walk-session.js",
  "/alongside-app/js/views/running-session.js",
  "/alongside-app/js/views/cycle-session.js",
  "/alongside-app/js/views/swim-session.js",
  "/alongside-app/js/views/quiet-session.js",
  "/alongside-app/js/views/breathing-session.js",
  "/alongside-app/js/views/prescribed.js",
  "/alongside-app/js/views/prescribed-session.js",

  // Assets
  "/alongside-app/assets/images/logo-icon-192.png",
  "/alongside-app/assets/images/logo-icon-180.png",
  "/alongside-app/assets/images/logo-icon-128.png",
  "/alongside-app/assets/images/logo-icon-512.png",
  "/alongside-app/assets/images/logo-icon-small.png",
  "/alongside-app/assets/images/logo-icon-square.png",
  "/alongside-app/assets/images/logo-wordmark.png",
];

// Message handler
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Install — allSettled so individual 404s never block the app loading
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
