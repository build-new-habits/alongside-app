/**
 * sw.js - Alongside Service Worker
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
 *   FLAGGED, NOT FIXED: workout.js's completeWorkout() writes to
 *   workoutHistory but not activityLog — today.js's "session done"
 *   detection reads activityLog, so it may still not fire correctly
 *   after a real generated session completes even with this loop fixed.
 *   Worth checking on device once the loop itself is confirmed resolved.
 *
 * ── STILL OUTSTANDING FROM BEFORE THIS SESSION — confirmed undeployed ──
 * Ground-truthed today against Graeme's actual live files: the site was
 * running v163, not v164 — meaning two earlier fixes never went live:
 *   - coach-proposal.css v4 (the full-screen-blocked Critical fix)
 *   - workoutGenerator.js v1.8 (the fitnessLevel/activityLevel fix)
 * Both are included in this deploy batch. Deploy ALL SIX changed files
 * together — cache-busting alone does nothing if the underlying file
 * on GitHub was never actually replaced, which is what happened here.
 *
 * 05 Jul 2026 v164
 * coach-proposal.css v4 — CRITICAL fix, same day as v3 shipped. v3's
 *   .cp-preview-panel set `display: flex` unconditionally, which
 *   overrides the [hidden] attribute's browser-default `display: none`
 *   (an author class selector beats that low-specificity UA rule). The
 *   result: the full-screen, z-index 9999 panel and its dark backdrop
 *   were rendered and capturing every tap from page load — not just
 *   when Door 1 was opened. Nothing on the Today screen was visible or
 *   clickable. Reported by Graeme within minutes of the v163 deploy as
 *   "I can't see or choose anything." Fixed: `display` moved off the
 *   base rule onto `.cp-preview-panel.is-open` only, matching the
 *   already-correct pattern in weekly-plan-v2.css's .wp-config-sheet
 *   (which never fights the hidden attribute in the first place). Same
 *   bug category as this morning's nav-bar z-index collision — flagged
 *   in v3's own changelog as a lesson, then walked into a variant of it
 *   within the same session.
 *
 * 05 Jul 2026 v163
 * coach-proposal.js v8 + coach-proposal.css v3 — Door redesign (Door 1
 *   only, per Graeme's brief this session). Doors now describe
 *   categories honestly rather than pre-committing to a specific
 *   session the generator couldn't actually produce. Door 1 opens a
 *   right-slide preview panel (new .cp-preview-panel, z-index 9999 from
 *   the start) showing the 3 generated options as selectable cards,
 *   top-ranked one gold-marked "Recommended," select-then-"Start
 *   Session" to commit, "Not today" to back out.
 *   REAL BEHAVIOUR CHANGE, flagged not buried: Door 2 ("Your
 *   programme") and Door 3 ("Something different") are deliberately
 *   disabled — reusing the existing disabled-door treatment — since
 *   their new spec needs real new logic (Door 2: an "uninterrupted"
 *   bypass mode in workoutGenerator.js; Door 3: pre-selection support
 *   in walk-session.js/yoga-session.js) that doesn't exist yet. Only
 *   one of three doors is functional until those are built.
 *   Severe-pain handling changed in spirit: no longer disables Door 1
 *   entirely — shows up in which option gets generated instead, since
 *   Door 1 IS the adapted-for-you door now. The old hard-disable
 *   behaviour is Door 2's territory when it's built.
 *   Caught and fixed during this same build, before presenting:
 *   accidentally dropped the _checkSeverePain/_checkModeratePain/
 *   _buildConstraintMessage function definitions while restructuring
 *   (still called by buildProposal() — would have thrown immediately);
 *   and the fallback-options path (used only if workoutGenerator itself
 *   is unavailable) didn't match the shape the new preview cards need
 *   (no id/duration/exerciseCount/rationale) — every fallback card
 *   would have shared the same missing id, breaking selection. Both
 *   fixed before this file was finalised.
 *
 * 05 Jul 2026 v162
 * workout.js v3 — Critical bug fix, this is the "exercise generation —
 *   selection not carrying through" item already logged in the master
 *   schedule (v38) from a separate session. Root cause now confirmed:
 *   coach-proposal.js writes the chosen session to store.generatedSession;
 *   workout.js read from store.activeWorkout, a key nothing ever wrote to.
 *   Every real generated session dead-ended at "No workout selected."
 *   Fixed by reading generatedSession.session throughout, and clearing
 *   generatedSession (to its store.js default shape) in cleanupWorkout()
 *   instead of nulling activeWorkout. Deliberately scoped to the
 *   generic "workout" route only — walk-session.js and yoga-session.js
 *   remain self-contained, not touched. See coach-proposal.js v7
 *   changelog and the master schedule for the fuller architecture
 *   discussion (Option A vs B) this sits inside.
 *
 * 05 Jul 2026 v161
 * workoutGenerator.js v1.8 — confirmed bug fix, found while ground-
 *   truthing this file for the movementIdentity wiring question.
 *   getUserProfile() read store.get("activityLevel") for fitnessLevel —
 *   no such top-level field exists in store.js (the real field is
 *   fitnessLevel; there's also a distinct nested lifestyle.activityLevel,
 *   which made this an easy mix-up). Effect: fitnessLevel in the
 *   generator's profile was always "moderate" — the Activity Level
 *   dropdown in Settings has never changed anything about generated
 *   sessions. Fixed to read the correct key. Already listed in
 *   SHELL_URLS below, cache-busted by this bump alone.
 *
 * 05 Jul 2026 v160
 * coach-proposal.js v7 — confirmed bug fix, found while ground-truthing
 *   this file for the My Movement wiring question (not what I was
 *   looking for, but couldn't ignore it once seen). Two functions were
 *   pulled in via require() inside function bodies — invalid in this
 *   browser ES module environment, no bundler. Both would throw
 *   `require is not defined` at runtime:
 *     - getReEntryIntensity (re-entry gentler-start path)
 *     - applyMissedSessionAdaptation ("Stay in 12 weeks"/"Keep the same
 *       rhythm" buttons)
 *   Fixed by adding both to the file's existing top-level import from
 *   programmeEngine.js. No other changes.
 *
 * 05 Jul 2026 v159
 * settings.js v11 + settings.css v5 — My Movement rebuild (agreed 13 May,
 *   never built). Schema laid in store.js v8 earlier this session
 *   (movementIdentity: string|null -> string[], migration-safe). This
 *   deploy adds the actual UI: a "How you move" section in the Profile
 *   panel, six chips as true multi-select (gym/yoga/running/walking/
 *   swimming/classes), plus a separate "A mix of things" chip that's
 *   mutually exclusive with the six. Reuses the same colour-mix/border
 *   pattern already proven accessible in .settings-goal-chip--selected —
 *   no new contrast combination, no new WebAIM check needed.
 *   NOT done this batch: coach-proposal.js's scoring logic against the
 *   new array shape — not ground-truthed this session, flagged for next
 *   time this file is in scope. (Still not done as of v166 — this is
 *   Session E's scope, sequenced after Session A2.)
 *
 * 05 Jul 2026 v158
 * weekly-plan-v2.css v2 + weekly-plan.js v3 — two fixes found via a
 *   device screenshot of My Week's config sheet:
 *   1. Nav bar covering the Save button. Root cause: .wp-config-sheet
 *      was z-index: 9000, an exact tie with nav-fix.css's #bottom-nav
 *      (z-index: 9000 !important). On a tie between two position:fixed
 *      stacking contexts, later DOM order wins — the nav bar sits after
 *      the router-swapped content in the app shell, so it always won.
 *      Raised .wp-config-sheet to 9999, matching the convention already
 *      used by settings.css's .settings-dialog. No changes to
 *      nav-fix.css.
 *   2. Missing location. store.js has carried
 *      weeklyPlan.days[day].location since 21 May specifically so "the
 *      coach can adapt equipment selection" — but no UI ever collected
 *      it, so a planned gym/recovery day had no way to say home vs gym
 *      vs outside. Added a "Where?" chip row, reusing the existing
 *      .wp-chip styling (no new CSS classes). No schema change needed.
 *   Also flagged, not fixed: weekly-plan.css (30 May v1) appears to be
 *   dead CSS from an earlier table-layout redesign that doesn't match
 *   any class in the current weekly-plan.js — worth removing from
 *   SHELL_URLS in a future cleanup pass.
 *
 * (Earlier history — alongside-v130 through v157 — unchanged, see prior
 * versions of this file for full detail.)
 *
 * sw.js must always be the LAST file deployed in any batch.
 */

const CACHE_NAME = "alongside-v167";

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
  "/alongside-app/js/views/coach-proposal.js",              // v10 — this deploy
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
