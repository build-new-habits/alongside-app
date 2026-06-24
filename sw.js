/**
 * sw.js
 * 23 Jun 2026 v115
 *
 * Fixing service worker issues v116
 *
 * Phase 5 sprint cache update. All files produced in the 23 Jun 2026
 * build sprint added to SHELL_URLS. Cache bumped from alongside-v114
 * to alongside-v115.
 *
 * New files added this sprint:
 *   JS data: signal-words.js, coach-voice.js (new)
 *   JS data updates: goals.js, checkin.js, programmes.js, programmeEngine.js
 *   JS views: coach-proposal.js, today.js, progress.js, settings.js,
 *             weekly-plan.js, gym-programme.js, journal-entry.js
 *   JS views onboarding: goals.js, lifestyle.js, complete.js
 *   JS core: store.js, router.js
 *   CSS: css/layouts/progress.css, css/components/coach-proposal.css
 *   Root: css/main.css (updated), index.html (updated)
 *
 * Content-gated files (not yet cached — add to SHELL_URLS when deployed):
 *   js/views/home-threshold.js
 *   js/views/checkin.js (rewrite)
 *   js/views/reflect.js (rewrite)
 *   js/views/noticing.js (rewrite)
 *   js/views/community-impact.js
 *   js/views/annual-reflection.js
 *   js/views/onboarding/arrival.js
 *   js/views/onboarding/hard-before.js
 *   js/views/onboarding/reflection.js
 *   js/data/noticing-territories.js
 *   js/data/mindful-prompts.js
 *   css/components/checkin-conversation.css
 *   css/components/home-threshold.css
 *   css/components/community-impact.css
 *   css/components/annual-reflection.css
 */

const CACHE_NAME = 'alongside-v116';

const SHELL_URLS = [

  // ── Root ──────────────────────────────────────────────────────────────────
  '/',
  '/index.html',
  '/manifest.json',

  // ── CSS: Base ─────────────────────────────────────────────────────────────
  '/css/main.css',
  '/css/base/variables.css',
  '/css/base/reset.css',
  '/css/base/typography.css',
  '/css/base/global.css',

  // ── CSS: Layouts ──────────────────────────────────────────────────────────
  '/css/layouts/app-shell.css',
  '/css/layouts/onboarding.css',
  '/css/layouts/goal-setup.css',
  '/css/layouts/progress.css',          // updated v2 this sprint

  // ── CSS: Components ───────────────────────────────────────────────────────
  '/css/components/buttons.css',
  '/css/components/cards.css',
  '/css/components/equipment-modal.css',
  '/css/components/checkin.css',
  '/css/components/workout.css',
  '/css/components/coach-fix.css',
  '/css/components/coach-proposal.css', // updated v2 this sprint
  '/css/components/morning-session.css',
  '/css/components/session-guard.css',
  '/css/components/settings-library.css',
  '/css/components/weekly-plan.css',
  '/css/components/breathing-session.css',
  '/css/components/quiet-session.css',
  '/css/components/noticing.css',

  // ── JS: Core ──────────────────────────────────────────────────────────────
  '/js/app.js',
  '/js/store.js',                        // v6 this sprint
  '/js/router.js',                       // v3 this sprint
  '/js/tts.js',

  // ── JS: Data ──────────────────────────────────────────────────────────────
  '/js/data/signal-words.js',            // NEW this sprint
  '/js/data/coach-voice.js',             // NEW this sprint
  '/js/data/goals.js',                   // updated v2 this sprint
  '/js/data/checkin.js',                 // updated v2 this sprint
  '/js/data/programmes.js',              // updated v2 this sprint
  '/js/data/programmeEngine.js',         // updated v2 this sprint
  '/js/data/conditions.js',
  '/js/data/equipment.js',
  '/js/data/workoutGenerator.js',
  '/js/data/morning-programme.js',

  // ── JS: Data — Exercises ──────────────────────────────────────────────────
  '/js/data/exercises/index.js',
  '/js/data/exercises/cardio.js',
  '/js/data/exercises/mindfulness.js',
  '/js/data/exercises/mobility.js',
  '/js/data/exercises/pilates.js',
  '/js/data/exercises/recovery.js',
  '/js/data/exercises/rehabilitation.js',
  '/js/data/exercises/running.js',
  '/js/data/exercises/sport_conditioning.js',
  '/js/data/exercises/strength.js',
  '/js/data/exercises/swimming_cycling.js',
  '/js/data/exercises/yoga.js',

  // ── JS: Views — Onboarding ────────────────────────────────────────────────
  '/js/views/onboarding/welcome.js',
  '/js/views/onboarding/name.js',
  '/js/views/onboarding/about.js',
  '/js/views/onboarding/body.js',
  '/js/views/onboarding/goals.js',       // rewrite this sprint
  '/js/views/onboarding/conditions.js',
  '/js/views/onboarding/lifestyle.js',   // updated v2 this sprint
  '/js/views/onboarding/equipment.js',
  '/js/views/onboarding/goal-setup.js',
  '/js/views/onboarding/complete.js',    // updated v2 this sprint

  // ── JS: Views — Main ──────────────────────────────────────────────────────
  '/js/views/today.js',                  // updated v2 this sprint
  '/js/views/checkin.js',
  '/js/views/checkin-mini.js',
  '/js/views/coach-reflection.js',
  '/js/views/coach-proposal.js',         // updated v6 this sprint
  '/js/views/intention.js',
  '/js/views/reflect.js',
  '/js/views/progress.js',               // updated v2 this sprint
  '/js/views/settings.js',               // updated v5 this sprint
  '/js/views/weekly-plan.js',            // updated v2 this sprint
  '/js/views/noticing.js',
  '/js/views/journal-entry.js',          // updated v2 this sprint
  '/js/views/activity-log.js',
  '/js/views/library.js',
  '/js/views/about.js',
  '/js/views/privacy.js',
  '/js/views/upgrade.js',
  '/js/views/goal-setup.js',
  '/js/views/session-builder.js',

  // ── JS: Views — Session types ─────────────────────────────────────────────
  '/js/views/workout.js',
  '/js/views/gym-programme.js',          // updated v2 this sprint
  '/js/views/morning-session.js',
  '/js/views/core-session.js',
  '/js/views/yoga-session.js',
  '/js/views/walk-session.js',
  '/js/views/running-session.js',
  '/js/views/cycle-session.js',
  '/js/views/swim-session.js',
  '/js/views/quiet-session.js',
  '/js/views/breathing-session.js',
  '/js/views/prescribed.js',
  '/js/views/prescribed-session.js',

  // ── Assets ────────────────────────────────────────────────────────────────
  '/assets/images/logo-icon-192.png',
  '/assets/images/logo-icon-180.png',
  '/assets/images/logo-icon-128.png',
  '/assets/images/logo-icon-512.png',
  '/assets/images/logo-icon-small.png',
  '/assets/images/logo-icon-square.png',
  '/assets/images/logo-wordmark.png',
];

// ── Install ────────────────────────────────────────────────────────────────────

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(SHELL_URLS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// ── Activate ───────────────────────────────────────────────────────────────────

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────────
// Cache-first for shell URLs. Network-first for everything else.

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (Google Fonts etc.)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache successful responses for shell URLs
        if (response && response.status === 200) {
          const pathname = url.pathname;
          if (SHELL_URLS.some(u => u === pathname || pathname.endsWith(u))) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
