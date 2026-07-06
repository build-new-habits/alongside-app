/**
 * sw.js - Alongside Service Worker
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
 *   ALSO FOUND, NOT YET FIXED — flagging for the next session before
 *   any movementIdentity wiring work continues:
 *     1. coach-proposal.js calls workoutGenerator.generateDailyOptions()
 *        with a parameter object (energy/burnout/intensityBias/etc.) —
 *        but the real function takes zero parameters and reads
 *        everything itself from store/checkinData. The object is
 *        silently discarded. Practical effect: the re-entry
 *        gentler-start intensity override computed in coach-proposal.js
 *        never reaches the generator — the coach's text says "starting
 *        gently" while the actual generated session is unaffected.
 *     2. coach-proposal.js's _routeForOption() routes by option.type —
 *        but workoutGenerator's real output only has option.focus
 *        (strength/mobility/cardio), never type. Type-based routing
 *        (yoga-session, walk-session, running-session, etc.) only ever
 *        fires on the _getFallbackOptions() path, i.e. when the real
 *        generator is unavailable. For real generated sessions, every
 *        door currently routes to the generic 'workout' view regardless
 *        of the door's actual framing. This is Critical severity —
 *        it undermines the three-doors concept itself, not just
 *        movementIdentity.
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
 *   time this file is in scope.
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

const CACHE_NAME = "alongside-v163";

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
