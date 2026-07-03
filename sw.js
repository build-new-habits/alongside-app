/**
 * sw.js - Alongside Service Worker
 *
 * 03 Jul 2026 v149
 * Fix: v148's changelog said js/data/feelings.js was added to SHELL_URLS,
 *   but it was missing from the actual array — comment described an
 *   intention that never made it into the list. Found on ground-truth
 *   review. Added below, in the Data section next to signal-words.js
 *   (which it wraps). Without this, feelings.js would still load fine
 *   over network but wouldn't be precached — would fail if the PWA is
 *   opened offline or from a stale cache.
 *
 * 03 Jul 2026 v148
 * Adding js/data/feelings.js for word selection following mood vs energy
 *
 * 01 Jul 2026 v147
 *
 * alongside-v147 (01 Jul 2026) — Step 8: checkin.js conversational
 *   rewrite (D2 opening narratives + thread UX).
 *   js/data/checkin-openings.js v1 (new) — D2 check-in opening content:
 *     all six modes + Day One exception as structured data, plus
 *     resolveOpening() resolver. Reads from store; returns { b1, b2,
 *     mode, careMode }.
 *   js/views/checkin.js v3 — full rewrite: conversational thread
 *     (CheckinView factory pattern). D2 opening → energy panel → mood
 *     panel → sleep panel → conditions panel (conditional) → time panel
 *     → summary + action buttons. OB-THREAD fade rule preserved: bubble
 *     fade fired only from confirmed user-interaction handlers.
 *   css/components/checkin-conversation.css v1 (new) — thread, bubbles,
 *     typing indicator, bottom-sliding input panels, time grid. Active /
 *     faded bubble colours match Appendix G confirmed values.
 *   css/main.css v9 — D2 @import uncommented.
 *
 * alongside-v142 (29 Jun 2026) — Gemini QA round 1 (C1/C2): fade not
 *   visible. Investigated via direct DevTools breakpoint and
 *   getComputedStyle verification — confirmed every layer of the fade
 *   mechanism (JS call sites, class application, CSS rule, deployment)
 *   was working exactly as built. The actual cause was a design
 *   judgement: the background colour gap between active and faded
 *   bubbles was only 12/765, invisible at a glance despite being
 *   technically correct.
 *   css/components/onboarding-thread.css v4 — widened the gap to
 *     56/765 (#0A1414), reconfirmed WCAG AA text contrast (7.42:1).
 *
 * alongside-v141 (29 Jun 2026) — S1 REAL root cause found, after four
 *   rounds of incorrect fixes targeting the wrong file:
 *   css/components/sheet-manager.css v2 — .sheet-content had zero
 *     bottom padding, designed on the assumption all sheet content uses
 *     .sheet-footer for its action button. It doesn't: goals.js,
 *     conditions.js, and equipment.js each bring their own in-content
 *     button, injected directly into .sheet-content via innerHTML. Every
 *     previous attempt to fix this in onboarding-additions.css was
 *     styling the wrong layer — the views' own padding never mattered
 *     because the outer scroll container had no clearance at all,
 *     regardless of what was added inside it. Fixed at the actual
 *     source this time.
 *
 * alongside-v140 (29 Jun 2026) — S1, S4, S5 root causes confirmed and
 *   fixed against real source files (equipment.js, onboarding.css,
 *   variables.css all read directly — no guessing this round):
 *   js/views/onboarding/equipment.js v4 — the REAL bug behind S4/S5:
 *     this view has its own internal multi-screen state and its own
 *     rerender() function, hardcoded to write to #main-content. Inside
 *     the OB-THREAD sheet, the first internal screen change escaped the
 *     sheet and overwrote the real app underneath it. mountContainer(el)
 *     and setSheetDoneCallback(fn) added as optional exports.
 *   js/views/onboarding/sheet-manager.js v3 — calls the two new hooks
 *     on any loaded module that exports them.
 *   js/views/onboarding/thread.js v6 — Step 11 summary reader fixed.
 *   js/data/onboarding-thread-data.js v4 — equipment summary corrected.
 *   css/layouts/onboarding-additions.css v9 — .onboarding-footer styled.
 *
 * alongside-v139 (29 Jun 2026) — thread.js v5 (fade trigger corrected
 *   again); onboarding-additions.css v7 (Continue button + conditions
 *   chips).
 *
 * alongside-v138 (29 Jun 2026) — sheet-manager.js v2 (dual-pattern
 *   support; conditions.js crash fix); onboarding-additions.css v6
 *   (goals Continue button spacing).
 *
 * alongside-v137 (29 Jun 2026) — thread.js v4 (name capitalisation;
 *   Step 2b pacing beat); onboarding-thread-data.js v3 (Step 2b config).
 *
 * alongside-v136 (29 Jun 2026) — thread.js v3 (premature past-fade
 *   fix); onboarding-thread.css v3 (WCAG AA contrast fix for fade).
 *
 * alongside-v135 (29 Jun 2026) — thread.js v2; onboarding-thread-data
 *   v2; onboarding-thread.css v2; settings-reflection.css v1; settings
 *   v6; main.css v8.
 *
 * alongside-v134 (29 Jun 2026) — OB-THREAD build batch: store.js v7,
 *   onboarding-thread-data.js v1, onboarding-thread.css v1,
 *   sheet-manager.css v1, sheet-manager.js v1, thread.js v1, router.js
 *   v7, app.js v6, main.css v7. Retired onboarding files removed from
 *   SHELL_URLS.
 *
 * alongside-v133 (28 Jun 2026) — arrival/hard-before/reflection import
 *   path fixes.
 *
 * alongside-v132 (28 Jun 2026) — Build Step 7: arrival.js, hard-before,
 *   reflection, beat3-scripts, complete, onboarding-additions.
 *
 * alongside-v131 (26 Jun 2026) — Onboarding QA fixes.
 * alongside-v130 (26 Jun 2026) — nav-fix.css v2, main.css v6.
 *
 * sw.js must always be the LAST file deployed in any batch.
 */

const CACHE_NAME = "alongside-v149";

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
  "/alongside-app/js/views/goal-setup.js",
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
