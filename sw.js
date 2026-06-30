/**
 * sw.js - Alongside Service Worker
 * 29 Jun 2026 v135
 *
 * alongside-v135 (29 Jun 2026) — Reflection gate revision, post-QA:
 *   js/views/onboarding/thread.js v2 — Step 1 auto-advance fix (name input
 *     was firing before the question rendered); Step 4 reworked from
 *     auto-advancing sequential reveal to an active consent-gated reveal
 *     (Y/N gate, then explicit "Continue" tap between each part — no
 *     timeout, no passive auto-advance); past-step fade applied centrally
 *     at every step transition (Option A from the visual-overwhelm review).
 *   js/data/onboarding-thread-data.js v2 — Step 4 reflection-gate config
 *     (gate copy, decline copy, continue label); Step 3b coach copy updated
 *     to the locked "take your time" wording.
 *   css/components/onboarding-thread.css v2 — header wordmark styles;
 *     reflection gate buttons; Continue-tap button; past-bubble fade.
 *   css/components/settings-reflection.css v1 (new) — report-style
 *     reflection block in settings.js Profile panel.
 *   js/views/settings.js v6 — new "Your reflection" collapsible section;
 *     reads onboarding.primaryTerritory live via getBeat3Script(), no new
 *     schema; reset-data route fixed from retired 'welcome' to
 *     'onboarding/thread'.
 *   css/main.css v8 — added settings-reflection.css import.
 *
 * alongside-v134 (29 Jun 2026) — OB-THREAD build batch:
 *   store.js v7 (three new onboarding fields);
 *   js/data/onboarding-thread-data.js v1 (new — coach lines, step config,
 *     summary generators);
 *   css/components/onboarding-thread.css v1 (new — thread UI);
 *   css/components/sheet-manager.css v1 (new — 95% sheet);
 *   js/views/onboarding/sheet-manager.js v1 (new — sheet engine);
 *   js/views/onboarding/thread.js v1 (new — full 14-step conversation);
 *   js/router.js v7 (onboarding/thread route added, retired routes removed);
 *   app.js v6 (first-route logic: new users → onboarding/thread);
 *   css/main.css v7 (two new CSS imports).
 *   Retired onboarding files removed from SHELL_URLS:
 *     arrival.js, hard-before.js, reflection.js, complete.js, frequency.js,
 *     welcome.js, name.js, about.js (onboarding), body.js, lifestyle.js,
 *     goal-setup.js (onboarding variant).
 *   Retained in SHELL_URLS (reused as sheet content by sheet-manager.js):
 *     goals.js, conditions.js, equipment.js, plan-select.js.
 *
 * alongside-v133 (28 Jun 2026) — arrival.js v2, hard-before.js v2,
 *   reflection.js v2: fix import paths (../../data/ not ../data/).
 *
 * alongside-v132 (28 Jun 2026) — Build Step 7: arrival.js v1,
 *   hard-before.js v1, reflection.js v1, beat3-scripts.js v1,
 *   complete.js v5, onboarding-additions.css v5.
 *
 * alongside-v131 (26 Jun 2026) — Onboarding QA fixes.
 * alongside-v130 (26 Jun 2026) — nav-fix.css v2, css/main.css v6.
 *

 * alongside-v136 (29 Jun 2026) — Two bugs from screenshot review:
 *   js/views/onboarding/thread.js v3 — premature past-fade fixed (was
 *     firing before the user could read their own just-shown coach
 *     response, due to Step 2 calling _runStep internally after showing
 *     its reply); fade call moved into _showCoachBubble at the correct
 *     chokepoint.
 *   css/components/onboarding-thread.css v3 — WCAG AA contrast fix for
 *     the past-step fade; opacity-based dimming measured ~3.9:1 (fails
 *     AA), replaced with solid colour swap measuring 7.59:1.
 *

 * alongside-v137 (29 Jun 2026) — Three fixes from screenshot review:
 *   js/views/onboarding/thread.js v4 — name capitalisation fixed at
 *     point of entry (store.set corrects first-letter case); new Step 2b
 *     pacing beat added to give the past-fade a genuine boundary to land
 *     in, since Step 2 was previously advancing straight into 3a with no
 *     pause at all.
 *   js/data/onboarding-thread-data.js v3 — Step 2b config added
 *     ("Ready to get started?" single-chip step); STEP_ORDER updated;
 *     Step 2's coach message split — settings reassurance line moved to
 *     2b.
 *

 * alongside-v138 (29 Jun 2026) — Critical sheet crash fix + spacing fix:
 *   js/views/onboarding/sheet-manager.js v2 — dual-pattern support added.
 *     conditions.js uses the OLD render()/window-global pattern, not the
 *     { mount } factory pattern v1 assumed without verifying against the
 *     real file — caused a hard crash on the conditions step ("view.mount
 *     is not a function"). Fixed by detecting the pattern at runtime and
 *     temporarily intercepting window.router.navigate for old-pattern
 *     views, restored on every close path.
 *   css/layouts/onboarding-additions.css v6 — goals screen Continue
 *     button was rendering cramped against the last chip row with no
 *     breathing room. Added bottom padding to .goals-categories and a
 *     hairline separator above the action footer, scoped narrowly so no
 *     other onboarding screen sharing the generic footer classes is
 *     affected.
 *

 * alongside-v139 (29 Jun 2026) — Three confirmed fixes from screenshot
 *   review (S4 equipment tap and S5 wrong-screen-after-equipment are
 *   real bugs but NOT included in this batch — root cause needs
 *   equipment.js source confirmed before fixing, to avoid a third round
 *   of guessing at an unseen file's structure):
 *   js/views/onboarding/thread.js v5 — S3: fade trigger rule corrected
 *     again. v3 moved the fade into _showCoachBubble, which still faded
 *     bubbles with no user interaction between them (an acknowledgement
 *     immediately followed by the next question, no click in between).
 *     Removed entirely from _showCoachBubble; now triggered only from
 *     genuine user-interaction handlers throughout the file.
 *   css/layouts/onboarding-additions.css v7 — S1: Continue button
 *     spacing fix that had no visible effect, replaced with bottom
 *     padding directly on the scrollable content instead of spacing on
 *     a likely-sticky footer. S2: conditions.js chips had zero styling
 *     anywhere in the codebase — added full chip styling matching the
 *     existing visual language.
 *

 * alongside-v140 (29 Jun 2026) — S1, S4, S5 root causes confirmed and
 *   fixed against real source files (equipment.js, onboarding.css,
 *   variables.css all read directly — no guessing this round):
 *   js/views/onboarding/equipment.js v4 — the REAL bug behind S4/S5:
 *     this view has its own internal multi-screen state and its own
 *     rerender() function, hardcoded to write to #main-content. Inside
 *     the OB-THREAD sheet, the first internal screen change (tapping
 *     any facility card) escaped the sheet and overwrote the real app
 *     underneath it. Two new optional exports added — mountContainer(el)
 *     and setSheetDoneCallback(fn) — so the view can be told where it
 *     actually lives and given a sheet-aware "finish" action instead of
 *     its old hardcoded navigate to the retired onboarding/frequency
 *     route.
 *   js/views/onboarding/sheet-manager.js v3 — calls the two new hooks
 *     on any loaded module that exports them, gated behind typeof
 *     checks so views without them (conditions.js) are unaffected.
 *   js/views/onboarding/thread.js v6 — Step 11 summary reader was
 *     reading store.sessionLocation, a field equipment.js never writes;
 *     fixed to read only the real combined equipment[] list.
 *   js/data/onboarding-thread-data.js v4 — equipment summary generator
 *     corrected to match — no facility name ever exists to read.
 *   css/layouts/onboarding-additions.css v9 — S1's real cause: the
 *     .onboarding-footer element goals.js renders had NO CSS rule
 *     anywhere in the codebase (confirmed against onboarding.css
 *     directly) — it was never sticky/fixed, contrary to every previous
 *     guess. Given real, direct styling.
 *
 * sw.js must always be the LAST file deployed in any batch.
 */

const CACHE_NAME = "alongside-v140";

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
