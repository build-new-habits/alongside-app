/**
 * sw.js - Alongside Service Worker
 *
 * 14 Jul 2026 v170
 * workout.js v4 — closed the workout.js -> activityLog gap (Session A,
 *   items 2 & 3). completeWorkout() now pushes an activityLog entry
 *   (date/completedAt/type:'workout'/durationMins/moodAfter/isEvent/
 *   eventName) alongside its existing workoutHistory write. today.js's
 *   _resolveState() needed this to detect "session-done" — confirmed
 *   working end-to-end on device this session ("You moved today.
 *   That's done." correctly shown after waiting out the 10-minute
 *   proposal-accepted window). No schema change required — the entry
 *   shape already matched store.js v8's documented activityLog fields.
 *   Deploy-verification habit: live GitHub Pages fetch of workout.js/
 *   today.js/sw.js returned binary/unreadable content this session —
 *   fell back to Graeme pasting full file contents per the Ground
 *   Truth Rule's documented fallback. Cache-bump only otherwise; no
 *   other files changed this deploy.
 *
 * 13 Jul 2026 v169
 * coach-proposal.css v5 — the file at this path on GitHub contained
 *   coach-proposal.js's content, not CSS (confirmed by Graeme viewing
 *   the raw file on GitHub — its header read "* coach-proposal.js" with
 *   that file's v8 changelog). Every .cp-* class was rendering unstyled
 *   as a result. Restored to the genuine v4 CSS content, bumped to v5.
 *   Not something introduced this session — a pre-existing manual
 *   copy-paste mistake in the repo, only surfaced now because today's
 *   other fixes were the first time anyone reached a real, working
 *   Door 1 session to notice the styling was broken. See
 *   coach-proposal.css v5 changelog for full detail.
 *
 * 13 Jul 2026 v168
 * coach-proposal.js v11 — _buildReflection() fix. ACTIVITY_LABELS had no
 *   entry for "coach-session", so the reflection line leaked the raw
 *   internal type ("Since yesterday, you did coach-session"). Added an
 *   explicit label plus a generic hyphen-to-space fallback for any
 *   future unmapped type. See coach-proposal.js v11 changelog.
 *
 * 13 Jul 2026 v167
 * coach-proposal.js v10 + workoutGenerator.js v1.9 — redeploy of the
 *   Session A2 fix after v166/coach-proposal.js v9 broke the entire
 *   coach-proposal page and was rolled back to v165/v8 earlier today.
 *   Root cause of the outage: workoutGenerator.js has carried a broken
 *   import (`import { programmeEngine } from "./programmeEngine.js"`,
 *   which does not exist as a named export — programmeEngine.js exports
 *   individual named functions only) since at least workoutGenerator.js
 *   v1.1. This was never caught because nothing had ever actually
 *   loaded workoutGenerator.js as a real ES module before v9's static
 *   import forced it to resolve. A second, related bug surfaced at the
 *   same time: generateRationale() called a
 *   programmeEngine.getStrategicRationale() that does not exist
 *   anywhere in programmeEngine.js — would have thrown on every
 *   generated session once the import itself was fixed. Both fixed in
 *   workoutGenerator.js v1.9 (see that file's changelog for full
 *   detail). coach-proposal.js v10 is content-identical to the rolled-
 *   back v9 — the fix was entirely in workoutGenerator.js.
 *   Practical implication worth naming plainly: Door 1 has likely never
 *   once shown a real generated session to a user before this deploy —
 *   the old window._workoutGenerator lookup silently fell through to
 *   fallback options every single time, since nothing ever set that
 *   global. This deploy is the first time the real generator has ever
 *   actually run in production.
 *
 * 13 Jul 2026 v166 — DEPLOYED AND ROLLED BACK SAME DAY. See v167 above.
 * coach-proposal.js v9 — Session A2 fix. _generateOptions() looked up
 *   window._workoutGenerator at runtime and called generateDailyOptions()
 *   with a parameter object (energy/burnout/intensityBias/focusBias/
 *   availableTime) — but nothing in the codebase sets that global, and
 *   even if found, the real function takes zero parameters and always
 *   discarded the object. Of the five values lost, three (energy, burnout,
 *   focus order) were already redundant — generateDailyOptions() re-derives
 *   them itself from store/checkinData/programmeEngine. Two were not:
 *   the re-entry gentler-start intensity override and availableTime.
 *   Fixed: replaced the window global lookup with a direct top-level
 *   import of workoutGenerator.js (no circular dependency exists); the
 *   two values that matter are now written to store immediately before
 *   calling generateDailyOptions(), which already reads them from there.
 *   No change to generateDailyOptions()'s own signature or contract.
 *   ALSO INVESTIGATED, NOT A BUG: _routeForOption() defaulting every real
 *   generated option to the 'workout' route (since real output only has
 *   `focus`, never `type`) is correct, not a defect — the generator only
 *   ever produces workout.js-shaped sessions regardless of focus. No
 *   change made there. Full reasoning in coach-proposal.js v9 header.
 *   workoutGenerator.js unchanged this deploy — the fix is entirely on
 *   the caller side.
 *
 * 10 Jul 2026 v165
 * intention.js v6 + checkin-mini.js v2 + checkin-conversation.css v2 —
 *   fixes for the "I want to move again" infinite loop Graeme reported
 *   (screenshots + live files this session). Root cause: intention.js's
 *   "coach" path wrote a fake activityLog entry and routed to "today"
 *   instead of "coach-proposal" — today.js then saw that fake entry and
 *   reported a session as already done, offering "move again" forever
 *   without ever reaching the actual doors. Fixed: routes to
 *   coach-proposal directly, writes nothing until a real session
 *   happens. Separately: checkin-mini.js's location/pain/slider UI
 *   (the unstyled buttons in Graeme's screenshot) has been rendering
 *   with zero CSS since checkin.js's 01 Jul conversational rewrite —
 *   migrated to reuse checkin-conversation.css's existing .ci-* classes
 *   rather than left on the orphaned .checkin-*/.mini-* naming.
 *   FLAGGED, NOT FIXED — resolved in v170: workout.js's completeWorkout()
 *   wrote to workoutHistory but not activityLog.
 *
 * (Earlier history — alongside-v130 through v164 — unchanged, see prior
 * versions of this file for full detail.)
 *
 * sw.js must always be the LAST file deployed in any batch.
 */

const CACHE_NAME = "alongside-v170";

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
  "/alongside-app/css/components/checkin-conversation.css",

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
  "/alongside-app/js/views/workout.js",              // v4 — this deploy
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
  "/alongside-app/js/data/checkin-openings.js",
  "/alongside-app/js/data/conditions.js",
  "/alongside-app/js/data/equipment.js",
  "/alongside-app/js/data/goals.js",
  "/alongside-app/js/data/workoutGenerator.js",
  "/alongside-app/js/data/programmeEngine.js",
  "/alongside-app/js/data/programmes.js",
  "/alongside-app/js/data/signal-words.js",
  "/alongside-app/js/data/feelings.js",
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
