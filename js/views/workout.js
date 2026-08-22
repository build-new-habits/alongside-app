/**
 * workout.js - Workout Execution View
 * 22 Aug 2026 v12
 *
 * v12 - EMPTY-1. A session with exercises: [] crashed this view. The
 *   guard checked that a workout existed and never that it contained
 *   anything, so the next line read .role off undefined.
 *
 *   Not hypothetical: coach-proposal.js _getFallbackOptions() returns
 *   exercises: [] by design, and BIAS-3 meant that fallback served
 *   EVERY user. "Strength session" and "Gentle movement" both carry
 *   type: workout and route here -- the FIRST option on Door 1, in both
 *   energy branches, landed on a blank crash. The other three fallback
 *   types route to views that build their own sessions and were fine.
 *
 *   BIAS-3 closed the path reaching it. The hole stayed open: any
 *   future throw in generateDailyOptions lands here again. A fallback
 *   that crashes is not a fallback.
 *
 * 12 Aug 2026 v12
 *
 * v12 - GM-1. Grounding moments on the exercise card, from Graeme's
 *   plank and running models: contact, then place, then beyond.
 *   Chosen once per render; recorded on mount. Appears rarely on
 *   purpose -- silence is the common case.
 *
 * 12 Aug 2026 v11
 *
 * v11 - LOG-1. Session notes added to the exercise card. Graeme, 12 Aug:
 *   "Weight notes should be on. But not just weight. Time, tension,
 *   elevation etc."
 *
 *   The store already recorded all nine metrics (store.js v28, 11 Aug)
 *   and already chose fields per equipment. What was missing was reach:
 *   the block lived inside gym-programme.js, so this view -- the main
 *   coach-built session player -- offered no way to write anything down
 *   at all. Now shared via js/session-log.js.
 *
 *   The id prefix carries the exercise index, so the Save handler cannot
 *   write one exercise's numbers onto another as the view re-renders.
 *
 * 11 Aug 2026 v10
 *
 * v10 - CONT-1. Completion records which exercises were done. Same
 *   one-field change as gym-programme.js v9; see store.js v22 for why
 *   this absence was the root of there being no progression, no skill
 *   acquisition and no familiarity anywhere in the product.
 *
 * 11 Aug 2026 v9
 *
 * v9 - CON-3b. Renders watchOut ("What to watch for") and load ("How
 *   heavy"), the two fields added to the Exercise Entry Standard on
 *   11 Aug. Applied identically across all four card views in one pass
 *   so the exercise card stays consistent whichever route reaches it.
 *
 * 11 Aug 2026 v8
 *
 * v8 — WOW-1 (PT-3, Persona Tracing Wave 1). Added a session-level
 *   clock (sessionStartTime + elapsedMins()) and wired it into every
 *   activityLog write. This view previously reported no duration at all,
 *   so progress.js:138 summed the person's real sessions as 0 minutes —
 *   the app telling someone who showed up that they hadn't. Set once at
 *   genuine session start, cleared on reset/cleanup. Floor of 1 minute so
 *   a real completion never reports zero.
 *
 * 10 Aug 2026 v7
 *
 * v7 — Fixed the YouTube link to use each exercise's own tailored
 *   .youtube search term (added to all 461 exercises this same
 *   session, none existed before) instead of regenerating a generic
 *   "{name} exercise form" query from scratch. Found while auditing
 *   exercise-detail consistency across every session view, per
 *   Graeme's direct request.
 *
 * 30 Jul 2026 v6 — Gym exit-guard gap fix (Core Session investigation follow-up, same
 *   session). This file had NO back-gesture protection at all — no
 *   confirmation card, no partial save. Confirmed via router.js's default
 *   popstate handler: since this file never called mountSessionGuard(),
 *   there was no `sessionGuard` flag in history state to intercept the
 *   gesture, so router.back() fired instantly on device back-gesture mid-
 *   workout, no warning, workoutProgress left orphaned in store. The
 *   on-screen Exit button's browser confirm() ("Your progress on this
 *   workout will be lost") was an honest, intentional discard-only path —
 *   not itself a bug — but the back-gesture path had nothing at all,
 *   closer to quiet-session.js's pre-fix "most exposed of the four" state
 *   than to the 6 files BUILD-3 fixed (23 Jul), which all showed a
 *   confirmation card, just skipped the actual save.
 *   Fixed to match core-session.js v4/yoga-session.js v5's confirmed
 *   pattern: mountSessionGuard() now protects the back-gesture path
 *   (isActive: () => !!_getWorkout()); added savePartialSession(), built
 *   fresh with no currentActivityEntry spread (same id-reuse-avoidance
 *   discipline as this session's other fixes); added a local
 *   showExitConfirm() coach-voiced overlay for the on-screen Exit button,
 *   replacing the blunt confirm() and offering a genuine "save partial
 *   progress" choice for gym for the first time; cleanupWorkout() now
 *   also calls dismountSessionGuard().
 *   Also found and fixed while here: .session-exit-overlay/.session-exit-
 *   card (the on-screen overlay's CSS, shared with the 6 other files using
 *   this same local-overlay pattern) had no styles anywhere in the repo —
 *   was rendering unstyled. Fixed in css/components/session-guard.css v2.
 *
 * v5 (S4-B3-3) — Two confirmed fixes, same root-cause investigation as
 *   coach-reflection.js v5 and yoga-session.js v3:
 *
 *   1. Duplicate-write fix: completeWorkout() now calls the new shared
 *      store.logActivity() instead of pushing directly to activityLog.
 *      This is the defensive backstop for the Gym duplicate-write bug —
 *      the actual root cause (a phantom entry written on mere activity
 *      selection, before this file ever runs) was fixed in
 *      coach-reflection.js v5, which no longer pre-writes an entry at
 *      all. logActivity()'s dedupe guard is a safety net here, not the
 *      primary fix.
 *
 *   2. Confirmed separate bug, found while tracing the above: this file
 *      never set currentActivityEntry for a completed Gym workout —
 *      only coach-reflection.js's self-directed path did that, for the
 *      other activity types. Practical effect: reflect.js's
 *      saveAndSummarise() looks up store.get("currentActivityEntry") to
 *      find which log entry to update with feel/mood/pain/notes — for
 *      Gym sessions that value was null or stale from a previous
 *      session, so the update-in-place block silently did nothing.
 *      Reflect answers for Gym sessions were never actually being saved.
 *      Fixed: completeWorkout() now sets currentActivityEntry to the
 *      entry logActivity() just created, so reflect.js can find and
 *      update it correctly, same as every other activity type.
 *
 * v4 — Closed the workout.js -> activityLog gap (Session A, item 3).
 *   Confirmed live: completeWorkout() wrote to workoutHistory but never
 *   to activityLog. today.js's _resolveState() reads activityLog and
 *   checks each entry's completedAt/loggedAt/date against today's date
 *   to decide the "session-done" state — with no activityLog entry, a
 *   real completed session never registered as done on Today.
 *   Fixed: completeWorkout() now also pushes an entry to activityLog
 *   matching the shape already documented in store.js's ACTIVITY LOG
 *   comment ({ date, type, durationMins, moodAfter, isEvent, eventName }).
 *   type: 'workout' — matches today.js's existing TYPE_LABELS ('strength
 *   work') and TYPE_ROUTE ('workout') maps, so no schema change was
 *   needed and no new type value was invented.
 *   durationMins left null — this view does not currently track total
 *   elapsed session time; not in scope for this fix.
 *   moodAfter, isEvent, eventName left at their schema defaults
 *   (null/false/null) — this view has no UI to set them.
 *
 * v3 — Confirmed Critical bug fix: this view read store.get("activeWorkout"),
 *   but coach-proposal.js's handleDoorChoice() writes the chosen session to
 *   store.set('generatedSession', { session, builtAt, inputs }) — a
 *   completely different key. Nothing in the codebase ever wrote to
 *   activeWorkout. Practical effect: picking any door for a real generated
 *   session (which, per _routeForOption()'s type/focus mismatch, is every
 *   door — see coach-proposal.js v7 changelog) landed on
 *   renderNoWorkout() — "No workout selected. Go back to choose a workout
 *   option." — every single time. The core daily loop's terminal step was
 *   a dead end, not a wrong-but-functional view.
 *   Fixed by reading store.get('generatedSession')?.session everywhere
 *   this file previously read store.get("activeWorkout"), and by clearing
 *   generatedSession (back to its store.js default shape) in
 *   cleanupWorkout() instead of setting activeWorkout to null.
 *   Scope note: this fixes the "workout" route specifically — the generic
 *   strength/mobility/cardio session player. walk-session.js and
 *   yoga-session.js are separate, self-contained views with their own
 *   type-selection screens; they were never wired to receive
 *   generatedSession and are not touched by this fix. That's a deliberate,
 *   separate architecture decision, not an oversight — see coach-proposal.js
 *   v7 changelog and the master schedule for the fuller discussion.
 *
 * v2 — Fixed programmeEngine import (01 Jul 2026).
 *   programmeEngine.js v2 refactored to individual named exports
 *   (recordSession, getPhaseBias, etc.) — the namespace import
 *   { programmeEngine } was never updated to match, causing a hard
 *   SyntaxError on module load. Fixed:
 *     import { recordSession } from "../data/programmeEngine.js"
 *   Call site corrected: recordSession takes a sessionData object,
 *   returns { milestoneAchieved }. Store.set("lastMilestone") now
 *   receives result.milestoneAchieved rather than the whole result object.
 *
 * v1 — 12 Jun 2026 (S4-4 P3):
 *   Back button uses router.back(). completeWorkout() routes to "reflect".
 *   renderNoWorkout() fallback uses event listener. Double-quoted strings.
 *   Import programmeEngine, call recordSession on completion (t2_5/t2_7).
 */

import { store }         from "../store.js";
import { renderFeedbackControl, attachFeedbackEvents } from "../exercise-feedback.js";
import { bodyCaution } from "../data/session-rationale.js";
import { renderLogBlock, attachLogEvents, scrollToTop } from "../session-log.js";
import { selectMoment, recordMomentShown, dismissMoment } from "../data/grounding-moments.js";
import { checkinData }   from "../data/checkin.js";
import { recordSession } from "../data/programmeEngine.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";

export const centered = false;

let currentExerciseIndex = 0;
let timerInterval = null;
let timeRemaining = 0;
let timerStarted = false; // Timer doesn't start until user taps Start

// 11 Aug 2026 — WOW-1 (PT-3). Session-level elapsed time. This view had no
// session clock, so both logActivity() calls below wrote durationMins null
// explicitly, and progress.js:138 summed them as 0. "workout" is the type
// coach-proposal generates by default, so this was the single largest
// source of under-reported effort. Pattern mirrors gym-programme.js:806.
// GUARDED SET: onMount() re-fires on every router.navigate("workout")
// (the timer toggle does exactly that), so this must only latch once.
let sessionStartTime = null;

function elapsedMins() {
  if (!sessionStartTime) return null;
  return Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
}

// v3 — single helper so every read point stays in sync.
function _getWorkout() {
  return store.get("generatedSession")?.session || null;
}

export function render() {
  const workout = _getWorkout();

  if (!workout) {
    return renderNoWorkout();
  }

  // EMPTY-1, 22 Aug 2026. The guard above checked that a workout EXISTS
  // and never that it contained anything. A session with exercises: []
  // passed it, and the next line read .role off undefined -- a blank
  // crash, mid-journey, with the person having just chosen to train.
  //
  // NOT HYPOTHETICAL. coach-proposal.js's _getFallbackOptions() returns
  // exercises: [] by design, and BIAS-3 meant that fallback was serving
  // EVERY user. Both "Strength session" and "Gentle movement" carry
  // type: 'workout' and route here, so the first option on Door 1 --
  // both branches -- landed on this crash. The other three fallback
  // types route to views that build their own sessions and were fine.
  //
  // BIAS-3 closed the path that was reaching this. The hole stayed
  // open: any future throw in generateDailyOptions falls back here
  // again. A fallback that crashes is not a fallback.
  if (!Array.isArray(workout.exercises) || workout.exercises.length === 0) {
    return renderEmptyWorkout();
  }

  const exercise = workout.exercises[currentExerciseIndex];

  // GM-1. Chosen once per render, so the card does not shuffle moments
  // on a timer tick. Returns null far more often than not: wrong family,
  // too soon, severe pain, already dismissed, or simply not this
  // session. Silence is the common case and costs nothing.
  const sessionCount    = (store.get("activityLog") || []).length;
  const groundingMoment = selectMoment(exercise, sessionCount);

  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;
  const progress = ((currentExerciseIndex) / workout.exercises.length) * 100;

  return `
    <div class="view workout-view">
      <!-- Header with progress -->
      <div class="workout-header">
        <button class="btn btn-ghost" id="exit-workout-btn" aria-label="Exit workout">\u2715 Exit</button>
        <div class="workout-progress-info" aria-label="Exercise ${currentExerciseIndex + 1} of ${workout.exercises.length}">
          <span>${currentExerciseIndex + 1} of ${workout.exercises.length}</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="workout-progress-bar" role="progressbar" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100" aria-label="Workout progress">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>

      <!-- Exercise display -->
      <div class="exercise-display">
        <div class="exercise-role-badge ${exercise.role}" aria-label="Exercise type: ${formatRole(exercise.role)}">${formatRole(exercise.role)}</div>

        <h1 class="exercise-name">${exercise.name}</h1>

        <div class="exercise-meta">
          ${exercise.perSide ? "<span class=\"meta-tag\">Each side</span>" : ""}
          <span class="meta-tag">${exercise.category}</span>
          <span class="meta-tag">+${exercise.credits} \u2B50</span>
        </div>

        <!-- Timer or Reps display -->
        <div class="exercise-target">
          ${renderExerciseTarget(exercise)}
        </div>

        <!-- YouTube Demo Link -->
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtube || (exercise.name + " exercise form"))}"
           target="_blank"
           rel="noopener noreferrer"
           class="youtube-link"
           aria-label="Watch how to do ${exercise.name} on YouTube (opens in new tab)">
          <span class="youtube-icon" aria-hidden="true">\u25B6\uFE0F</span>
          Watch how to do this
        </a>

        <!-- Exercise card - universal three-section structure -->
        <div class="exercise-instructions card" role="region" aria-label="Exercise guidance for ${exercise.name}">

          <!-- Section 1: How to get there -->
          ${exercise.instructions && exercise.instructions.length > 0 ? `
            <span class="exercise-section-label" id="section-setup-${currentExerciseIndex}">
              How to get there
            </span>
            <ul class="exercise-section-list" aria-labelledby="section-setup-${currentExerciseIndex}">
              ${exercise.instructions.map(inst => `<li>${inst}</li>`).join("")}
            </ul>
          ` : ""}

          <!-- Section 2: What to focus on -->
          ${exercise.coaching ? `
            <hr class="exercise-section-divider" aria-hidden="true">
            <span class="exercise-section-label" id="section-focus-${currentExerciseIndex}">
              What to focus on
            </span>
            <div class="coaching-tip" aria-labelledby="section-focus-${currentExerciseIndex}">
              <span class="tip-icon" aria-hidden="true">\uD83D\uDCA1</span>
              <p>${exercise.coaching}</p>
            </div>
          ` : ""}

          <!-- Section 3: Why this helps -->
          ${exercise.why ? `
            <hr class="exercise-section-divider" aria-hidden="true">
            <span class="exercise-section-label" id="section-why-${currentExerciseIndex}">
              Why this helps
            </span>
            <p class="exercise-why-text" aria-labelledby="section-why-${currentExerciseIndex}">
              ${exercise.why}
            </p>
          ` : ""}

        </div>

        <!-- How heavy - effort-relative only, never a weight (P4). -->
        ${exercise.load ? `
          <div class="exercise-load" role="region" aria-label="How heavy for this exercise">
            <span class="exercise-section-label" id="section-load-${currentExerciseIndex}">
              How heavy
            </span>
            <p class="exercise-load-text" aria-labelledby="section-load-${currentExerciseIndex}">
              ${exercise.load}
            </p>
          </div>
        ` : ""}

        <!-- What to watch for. A coach noticing something, not an alert. -->
        ${(() => {
          // CORE-1. Fires when this exercise loads an area flagged sore today
          // and is NOT contraindicated -- contraindicated ones never reach a
          // card. Names the area, per P7: a coach told something specific that
          // then hedges is pretending not to know. Invitation, not instruction.
          const _c = bodyCaution(exercise);
          return _c ? `<p class="exercise-caution" role="note">${_c}</p>` : "";
        })()}

        <!-- FEED-1. Two buttons, no "about right" -- silence already means
             that, and a third option turns an optional aside into a
             question on every exercise. Not a rating: no stars, no scale.
             Two of the last five are needed before selection moves
             anything, and nothing is ever displayed back. -->
        ${renderFeedbackControl(exercise)}

        ${exercise.watchOut && exercise.watchOut.length > 0 ? `
          <div class="exercise-watchout" role="region" aria-label="What to watch for with this exercise">
            <span class="exercise-section-label" id="section-watchout-${currentExerciseIndex}">
              What to watch for
            </span>
            <ul class="exercise-watchout-list" aria-labelledby="section-watchout-${currentExerciseIndex}">
              ${exercise.watchOut.map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>
        ` : ""}

        ${groundingMoment ? `
          <aside class="gmoment" aria-label="Something to notice">
            <p class="gmoment__text">${groundingMoment.text}</p>
            <button class="gmoment__dismiss" id="gmoment-dismiss"
                    aria-label="Do not show this one again">Not for me</button>
          </aside>
        ` : ""}

        <!-- Session notes. LOG-1: this used to exist only in
             gym-programme.js, so a coach-built session offered no way to
             write anything down. Same block, same nine metrics, chosen
             per equipment. Returns "" when switched off. -->
        ${renderLogBlock(exercise, `wo-log-${currentExerciseIndex}`)}
      </div>

      <!-- Action buttons -->
      <div class="workout-actions">
        ${exercise.duration ? `
          <button class="btn btn-large btn-full ${timerStarted ? "btn-secondary" : "btn-accent"}" id="timer-toggle-btn" aria-live="polite">
            ${!timerStarted ? "\u25B6 Start Timer" : (timerInterval ? "\u23F8 Pause" : "\u25B6 Resume")}
          </button>
        ` : ""}

        <button class="btn btn-primary btn-large btn-full" id="complete-exercise-btn">
          ${isLastExercise ? "\uD83C\uDF89 Complete Workout" : "Next Exercise \u2192"}
        </button>

        <button class="btn btn-ghost btn-small" id="skip-exercise-btn">
          Skip this one
        </button>
      </div>
    </div>
  `;
}

// EMPTY-1. Distinct from renderNoWorkout(): that one means "you have
// not chosen anything yet". This means "something went wrong building
// what you chose", which is a different sentence and deserves an honest
// one. It does not apologise at length, does not blame the person, and
// offers the two things that actually work from here.
function renderEmptyWorkout() {
  return `
    <div class="view">
      <div class="card card-coach">
        <h2>I could not build that one</h2>
        <p>
          Something went wrong putting that session together &mdash; that is on
          me, not on you. Let us pick again, and it should come through
          properly this time.
        </p>
        <button class="btn btn-primary" id="no-workout-back-btn">
          Choose again
        </button>
      </div>
    </div>
  `;
}

function renderNoWorkout() {
  return `
    <div class="view">
      <div class="card card-coach">
        <h2>No workout selected</h2>
        <p>Go back to choose a workout option.</p>
        <button class="btn btn-primary" id="no-workout-back-btn">
          Back
        </button>
      </div>
    </div>
  `;
}

function renderExerciseTarget(exercise) {
  if (exercise.duration) {
    const sets = exercise.sets || 1;
    return `
      <div class="timer-display">
        <div class="timer-circle">
          <span class="timer-value" id="timer-display">${formatTime(timeRemaining || exercise.duration)}</span>
          <span class="timer-label">${sets > 1 ? `Set 1 of ${sets}` : "Hold"}</span>
        </div>
      </div>
    `;
  } else if (exercise.reps) {
    const sets = exercise.sets || 3;
    const reps = exercise.reps || 10;
    return `
      <div class="reps-display">
        <div class="reps-info">
          <span class="reps-value">${sets} \u00D7 ${reps}</span>
          <span class="reps-label">sets \u00D7 reps</span>
        </div>
        ${exercise.rest ? `
          <div class="rest-info">
            <span class="rest-value">${exercise.rest}s</span>
            <span class="rest-label">rest between sets</span>
          </div>
        ` : ""}
      </div>
    `;
  }
  return "<p>Complete this exercise at your own pace.</p>";
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatRole(role) {
  const roles = {
    warmup:    "\uD83D\uDD25 Warm Up",
    main:      "\uD83D\uDCAA Main",
    accessory: "\uD83C\uDFAF Accessory",
    finisher:  "\uD83C\uDFC1 Finisher",
    cooldown:  "\uD83E\uDDD8 Cool Down"
  };
  return roles[role] || role;
}

export function onMount() {
  const workout = _getWorkout();

  // EMPTY-1, 22 Aug 2026. The render guard was not enough on its own.
  // onMount runs regardless of what render() returned, and everything
  // below assumes a populated exercise list -- the timer reads
  // .duration off exercises[0] and threw a SECOND time, behind the
  // first fix. Found only by executing the view again after guarding
  // it; the render fix alone looked complete and was not.
  //
  // Bind the one control the empty screen has, then stop.
  const empty = !workout || !Array.isArray(workout.exercises) || workout.exercises.length === 0;

  document.getElementById("no-workout-back-btn")?.addEventListener("click", () => {
    router.back();
  });

  if (empty) return;

  // Latch the session clock once, on first mount with a real workout.
  if (sessionStartTime === null) sessionStartTime = Date.now();

  // LOG-1. Re-wired on every mount because the view re-renders per
  // exercise; attachLogEvents() guards against double-binding itself.
  // The id prefix carries the exercise index so two cards can never
  // collide, and so the Save handler cannot write one exercise's numbers
  // onto another.
  if (workout?.exercises?.[currentExerciseIndex]) {
    attachLogEvents(workout.exercises[currentExerciseIndex], `wo-log-${currentExerciseIndex}`);
    // FEED-1. Self-painting, so no re-render hook is needed.
    attachFeedbackEvents(workout.exercises[currentExerciseIndex]);
  }

  // GM-1. Recorded on mount rather than at render, so a moment that was
  // built but never actually reached the screen is not counted as seen.
  const gmEl = document.querySelector(".gmoment");
  if (gmEl) {
    const sc = (store.get("activityLog") || []).length;
    const ex = workout?.exercises?.[currentExerciseIndex];
    const m  = ex ? selectMoment(ex, sc) : null;
    if (m) recordMomentShown(m, sc);

    document.getElementById("gmoment-dismiss")?.addEventListener("click", () => {
      if (m) dismissMoment(m.id);
      // Goes quietly. No confirmation, no explanation, nothing logged as
      // a skip -- dismissing is an answer, not an avoidance.
      gmEl.remove();
    });
  }

  if (!workout) return;

  const exercise = workout.exercises[currentExerciseIndex];

  if (exercise.duration) {
    timeRemaining = exercise.duration;
    updateTimerDisplay();
  }

  // 30 Jul 2026 — gym exit-guard gap fix (Core Session investigation
  // follow-up). This file previously had NO back-gesture protection at
  // all — no confirmation card, no partial save. The on-screen Exit
  // button used a blunt browser confirm() that explicitly discarded
  // progress ("Your progress on this workout will be lost"), which was
  // an honest design choice for that path, but the back-gesture path had
  // nothing: router.js's default popstate handler navigated away
  // instantly with zero warning. Fixed to match the pattern already
  // confirmed working in core-session.js v4/yoga-session.js v4 (BUILD-3,
  // 23 Jul): mountSessionGuard() protects the back-gesture path (shows
  // session-guard.js's own Stay/Exit-and-save/Exit-without-saving card),
  // and the on-screen Exit button now shows this file's own two-option
  // showExitConfirm() overlay instead of confirm(), offering a genuine
  // "save partial progress" choice for the first time.
  mountSessionGuard({
    isActive: () => !!_getWorkout(),
    onExit:   () => { savePartialSession(); cleanupWorkout(); router.navigate("reflect"); },
    label:    "gym session"
  });

  document.getElementById("exit-workout-btn")?.addEventListener("click", () => {
    showExitConfirm();
  });

  document.getElementById("timer-toggle-btn")?.addEventListener("click", () => {
    if (!timerStarted) {
      timerStarted = true;
      startTimer();
    } else if (timerInterval) {
      pauseTimer();
    } else {
      startTimer();
    }
    router.navigate("workout");
  });

  document.getElementById("complete-exercise-btn")?.addEventListener("click", () => {
    completeExercise();
  });

  document.getElementById("skip-exercise-btn")?.addEventListener("click", () => {
    skipExercise();
  });
}

// ── Exit confirmation overlay ──────────────────────────────────────────────
// Shown when user taps Exit during an active workout. Replaces the old
// browser confirm() with a coach-voiced in-app card, matching
// core-session.js/yoga-session.js's confirmed-working pattern (BUILD-3,
// 23 Jul 2026). Added 30 Jul 2026 as part of the gym exit-guard gap fix.

function showExitConfirm() {
  const overlay = document.createElement("div");
  overlay.className = "session-exit-overlay";
  overlay.id        = "session-exit-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Exit workout confirmation");
  overlay.innerHTML = `
    <div class="session-exit-card">
      <div class="session-exit-coach-row">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="session-exit-coach-text">
          Hold on — if you leave now this session won’t be saved. Are you sure?
        </p>
      </div>
      <div class="session-exit-actions">
        <button class="btn btn-primary btn-full" id="exit-confirm-stay"
                aria-label="Stay in workout">
          Stay in session
        </button>
        <button class="btn btn-ghost btn-full" id="exit-confirm-leave"
                aria-label="Exit and save progress so far">
          Exit and save progress
        </button>
        <!-- EXIT-1, 12 Aug 2026. Graeme, device pass part 4: "I started
             quite a few to see if it was those. When I exited it asked me
             to save. I need to be able to exit and not save. That's why my
             sessions have shot up, but I haven't done any."

             The shared session-guard.js has had this third option since
             21 May. NINE views each built their own two-button dialog
             instead and none of them included it, so opening a session to
             look at it and backing out ALWAYS wrote a partial entry.
             Graeme's own count reached 7 of 3 from sessions he never did.

             Deliberately the smallest visual weight of the three -- the
             option is available, not encouraged -- matching
             .sg-exit-discard's existing treatment rather than inventing
             one. -->
        <button class="btn btn-ghost btn-full session-exit-discard" id="exit-confirm-discard"
                aria-label="Exit without saving this session">
          Exit without saving
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("exit-confirm-stay").addEventListener("click", () => {
    overlay.remove();
  });

  document.getElementById("exit-confirm-leave").addEventListener("click", () => {
    overlay.remove();
    savePartialSession();
    cleanupWorkout();
    router.navigate("reflect");
  });

  // EXIT-1. Discard: leave WITHOUT writing a partial entry.
  document.getElementById("exit-confirm-discard")?.addEventListener("click", () => {
    overlay.remove();
    dismountSessionGuard();
    cleanupWorkout();
    router.navigate("today");
  });
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
    }
  }, 1000);
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const display = document.getElementById("timer-display");
  if (display) display.textContent = formatTime(timeRemaining);
}

function completeExercise() {
  const workout = _getWorkout();
  const exercise = workout.exercises[currentExerciseIndex];

  const completed = store.get("workoutProgress") || [];
  completed.push({
    exerciseId:  exercise.id,
    credits:     exercise.credits,
    completedAt: new Date().toISOString()
  });
  store.set("workoutProgress", completed);

  if (currentExerciseIndex >= workout.exercises.length - 1) {
    completeWorkout();
  } else {
    currentExerciseIndex++;
  scrollToTop();   // SCROLL-1: a new card starts at the top
    resetTimer();
    router.navigate("workout");
  }
}

function skipExercise() {
  const workout = _getWorkout();

  if (currentExerciseIndex >= workout.exercises.length - 1) {
    completeWorkout();
  } else {
    currentExerciseIndex++;
  scrollToTop();   // SCROLL-1: a new card starts at the top
    resetTimer();
    router.navigate("workout");
  }
}

function resetTimer() {
  pauseTimer();
  timeRemaining = 0;
  timerStarted  = false;
}

/**
 * savePartialSession() — added 30 Jul 2026, gym exit-guard gap fix.
 * Same pattern as core-session.js v4/yoga-session.js v5's partial-save
 * functions: builds the entry fresh via store.logActivity(), no spread
 * of a prior currentActivityEntry (avoids the id-reuse bug fixed
 * elsewhere this session). durationMins left null, matching
 * completeWorkout()'s existing convention — this file has no running
 * elapsed-time tracker.
 */
function savePartialSession() {
  const workout = _getWorkout();
  if (!workout) return;

  const progress       = store.get("workoutProgress") || [];
  const creditsEarned  = progress.reduce((sum, e) => sum + (e.credits || 0), 0);
  const nowIso         = new Date().toISOString();

  const activityEntry = store.logActivity({
    type:           "workout",
    date:           nowIso,
    sessionEnd:     nowIso,
    completedAt:    nowIso,
    status:         "partial",
    durationMins:   elapsedMins(),
    moodAfter:      null,
    isEvent:        false,
    eventName:      null,
    exercisesCount: progress.length,
    creditsEarned
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }
}

function completeWorkout() {
  const workout  = _getWorkout();
  const progress = store.get("workoutProgress") || [];
  const nowIso   = new Date().toISOString();

  // Credits
  const creditsEarned = progress.reduce((sum, e) => sum + (e.credits || 0), 0);
  const totalCredits  = (store.get("totalCredits") || 0) + creditsEarned;
  store.set("totalCredits", totalCredits);

  // Workout history
  const history = store.get("workoutHistory") || [];
  history.push({
    workoutId:          workout.id,
    name:               workout.name,
    focus:              workout.focus,
    completedAt:        nowIso,
    exercisesCompleted: progress.length,
    totalExercises:     workout.exercises.length,
    creditsEarned
  });
  store.set("workoutHistory", history);

  // v5 (S4-B3-3) — uses the shared store.logActivity() write path instead
  // of pushing to activityLog directly. Also now sets currentActivityEntry
  // to the entry just written — this was never done for Gym before, which
  // meant reflect.js's find-and-update-by-id logic silently found nothing
  // and never saved feel/mood/pain answers for Gym sessions. Confirmed bug,
  // fixed here. See v5 changelog above for full detail.
  const activityEntry = store.logActivity({
    date:         nowIso,
    completedAt:  nowIso,
    type:         "workout",
    durationMins: elapsedMins(),
    moodAfter:    null,
    isEvent:      false,
    eventName:    null,
    // CONT-1: which exercises, not only how many. Routed into
    // exerciseHistory by logActivity() on completion only.
    exerciseIds:  (workout.exercises || []).map(e => e.id).filter(Boolean)
  });
  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }

  // Record session with programme engine.
  // recordSession() takes a sessionData object and returns { milestoneAchieved }.
  // v1 passed workout.focus directly as the argument (wrong) and imported
  // a non-existent namespace object — both fixed here.
  const result    = recordSession({ focus: workout.focus || null });
  const milestone = result.milestoneAchieved || null;
  store.set("lastMilestone", milestone);

  // Stash data for the completion screen / reflection step
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    workout.name);

  cleanupWorkout();
  // Route through reflect.js for post-session reflection.
  router.navigate("reflect");
}

function cleanupWorkout() {
  dismountSessionGuard();
  pauseTimer();
  sessionStartTime = null;
  currentExerciseIndex = 0;
  timeRemaining = 0;
  timerStarted  = false;
  // v3 — clears generatedSession back to its store.js default shape,
  // rather than setting the never-written activeWorkout to null.
  store.set("generatedSession", { session: null, builtAt: null, inputs: {} });
  store.set("workoutProgress", null);
}
