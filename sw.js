/**
 * sw.js - Alongside Service Worker
 *
 * 05 Jul 2026 v157
 * settings.js v10 — Functional QA fix (My Week). Ground-truthed against
 *   router.js v8 and weekly-plan.js v2 at the start of the Functional QA
 *   session: the "weekly-plan" route and its view file were both already
 *   correct — the only thing missing was a way in, dropped somewhere
 *   across the v4–v9 Programme-panel rewrites and never replaced.
 *   Restored as a "Your week" section in the Programme panel, reading
 *   weeklyPlan.updatedAt live to state what's actually true rather than
 *   a generic label. No schema change (weeklyPlan already exists in
 *   store.js v7). No changes to router.js or weekly-plan.js — both
 *   confirmed correct as-is, cache-busted by this CACHE_NAME bump alone
 *   since both were already listed below.
 *   NOT done this batch: My Movement rebuild (multi-select, agreed 13
 *   May, never built) — logged as a build task, not started. S4
 *   (navigation lag) — still waiting on a Network-tab capture, per
 *   Ground Truth Rule.
 *
 * 04 Jul 2026 v156
 * settings.js v9 — Back-navigation bug fix. "Edit conditions"/"Edit
 *   equipment" now open via openSheet() (js/views/onboarding/
 *   sheet-manager.js) instead of a direct router.navigate() into an
 *   onboarding-built view. Root cause: conditions.js's Back button is
 *   hardcoded to router.navigate('onboarding/goals') — fine inside a
 *   sheet, where sheet-manager.js intercepts that call, but a real
 *   navigation when reached directly from Settings, which is why Back
 *   was landing in onboarding goals instead of Settings, and why the
 *   bottom nav and onboarding progress dots were showing. No changes to
 *   conditions.js, equipment.js, or sheet-manager.js — all three already
 *   had the right infrastructure, Settings just wasn't using it. No new
 *   files — sheet-manager.js and its view map were already fully listed
 *   in SHELL_URLS below, cache-busted by this CACHE_NAME bump alone.
 *   NOT done this batch: S4 (navigation lag, reported across multiple
 *   views) — still waiting on a Network-tab capture before touching
 *   that one, per Ground Truth Rule.
 *
 * 04 Jul 2026 v155
 * S1/S3 Settings fixes (second round, same day):
 *   settings.js v8 — S1: age band options updated to match the current
 *     onboarding bands (Under 20/20s/30s/40s/50s/60s/70+). S3: "Your
 *     goals" now renders grouped by category, matching onboarding.
 *   settings.css v4 — added .settings-goals-category / __label styles.
 *
 * 04 Jul 2026 v154
 * router.js v8 — S3 fix. VIEW_NAMES['goal-setup'] path corrected from
 *   './views/goal-setup.js' to './views/onboarding/goal-setup.js'.
 *
 * 04 Jul 2026 v153
 * S1/S2 Settings fixes: settings.js v7 (coach style picker removed,
 *   Nurturing only permanently); settings.css v3 (dropdown option
 *   contrast fixed on all Settings dropdowns).
 *
 * 04 Jul 2026 v152
 * css/components/settings.css v2 — fixed Settings tab strip overlap bug.
 *
 * 04 Jul 2026 v151
 * css/components/nav-fix.css v3 — root cause of the 26 Jun nav truncation
 *   bug found and fixed. CONFIRMED FIXED on device 04 Jul.
 *
 * 03 Jul 2026 v150
 * js/views/onboarding/thread.js v7 — Appendix M scroll fix applied to
 *   onboarding.
 *
 * 03 Jul 2026 v149
 * Fix: v148's changelog said js/data/feelings.js was added to SHELL_URLS,
 *   but it was missing from the actual array.
 *
 * 03 Jul 2026 v148
 * Adding js/data/feelings.js for word selection following mood vs energy
 *
 * 01 Jul 2026 v147
 * alongside-v147 — Step 8: checkin.js conversational rewrite.
 *
 * (Earlier history — alongside-v130 through v142 — unchanged, see prior
 * versions of this file for full detail.)
 *
 * sw.js must always be the LAST file deployed in any batch.
 */

const CACHE_NAME = "alongside-v157";

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
  "/alongside-app/css/components/onboarding-thread.css",
  "/alongside-app/css/components/sheet-manager.css",
  "/alongside-app/css/components/settings-reflection.css",
  "/alongside-app/css/components/checkin-conversation.css",   // Step 8 — new

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
  "/alongside-app/js/data/checkin-openings.js",                // Step 8 — new
  "/alongside-app/js/data/conditions.js",
  "/alongside-app/js/data/equipment.js",
  "/alongside-app/js/data/goals.js",
  "/alongside-app/js/data/workoutGenerator.js",
  "/alongside-app/js/data/programmeEngine.js",
  "/alongside-app/js/data/programmes.js",
  "/alongside-app/js/data/signal-words.js",
  "/alongside-app/js/data/feelings.js",                        // Step 8b — new, was missing from v148
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
