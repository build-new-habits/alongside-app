/**
 * prescribed-session.js - Prescribed Exercise Session View
 *
 * 11 Aug 2026 v5
 *
 * v5 - CON-3b. Renders watchOut ("What to watch for") and load ("How
 *   heavy") from the linked database entry, completing the guidance
 *   block that v4 introduced. Same fullEx lookup, same structure,
 *   nothing new fetched.
 *
 * 10 Aug 2026 v4
 *
 * CHANGELOG
 * 10 Aug 2026 v4 - Added full exercise guidance (exercise-detail
 *   consistency audit, Graeme's direct request — this was the most
 *   concerning file found, showing name + sets/reps + notes only for
 *   every prescribed exercise, nothing else, ever). Reuses the exact
 *   EXERCISES lookup pattern _checkContraindication() already used:
 *   for exercises linked to the shared database via exerciseId, now
 *   shows instructions/coaching/why plus a tailored YouTube link, all
 *   at 100% data coverage already — this was purely a display gap, not
 *   missing content. Manually-added prescribed exercises (no
 *   exerciseId) correctly continue showing notes only, since there's
 *   genuinely nothing else to show for those. Verified both paths with
 *   a direct test before shipping.
 *
 * 04 Aug 2026 v3 - Real safety gap found and fixed. This file read
 *   zero condition/pain data — unlike every other session type in the
 *   app (core-session.js, workoutGenerator.js both check
 *   contraindications live at generation time), a prescribed programme
 *   was static once built, with no check against today's state at all.
 *   A flare-up after the programme was built could mean walking
 *   through now-contraindicated exercises with nothing flagging it.
 *   New _checkContraindication(): for exercises with a real exerciseId
 *   (coach-built/coach-recommended, not manually added ones with no
 *   database record to check), compares that exercise's
 *   contraindications against getActiveConditionIds() for today.
 *   Doesn't silently hide or block — surfaces a clear flag above the
 *   exercise and lets the person decide, same "behaviour is
 *   communication" pattern as coach-proposal.css's .cp-constraint,
 *   reused visually rather than reinvented. Smoke-tested against real
 *   exercise data before shipping: severe pain correctly flags,
 *   mild pain correctly doesn't.
 *
 * 23 Jul 2026 v2 - BUILD-3 Section 4. This file had no partial-save
 *   behaviour at all - exiting mid-session logged nothing to activityLog,
 *   by explicit design (exit confirm read "Progress on this session will
 *   be lost"), even though individual completed exercises were already
 *   durably marked in the store. Graeme's decision: add partial-save
 *   tracking, matching Gym/Core Session. Added savePartialSession(),
 *   using store.logActivity() (this file had no prior direct-write
 *   convention to stay consistent with). Wired mountSessionGuard() for
 *   back-gesture protection, which this file never had. On-screen Exit
 *   button updated to save partial progress before exiting, confirm text
 *   updated to match.
 *
 * 12 Jun 2026 v1 (S4-4 P3) - Back button pass:
 *   completeSession() now navigates to "reflect" instead of
 *   "workout-complete", matching gym-programme.js, morning-session.js,
 *   and workout.js - every session ends with a reflection step before
 *   landing on progress. Back/Exit already used router.back() correctly
 *   and are unchanged.
 *
 * Walks through prescribed exercises one by one, matching the workout
 * execution pattern. Supports timer-based exercises (hold durations)
 * using the same timer logic as workout.js.
 *
 * Credit award: 35 credits per exercise, capped at 150 total.
 * On completion: writes to totalCredits, sets lastWorkoutCredits and
 * lastWorkoutName for the reflection / completion screens to read.
 *
 * Route: "prescribed-session"
 * Nav: hidden (same as workout view)
 */

import { store } from "../store.js";
import { renderFeedbackControl, attachFeedbackEvents } from "../exercise-feedback.js";
import { bodyCaution } from "../data/session-rationale.js";
import { renderLogBlock, attachLogEvents } from "../session-log.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
import { getActiveConditionIds, getConditionName } from "../data/conditions.js";
import { EXERCISES } from "../data/exercises/index.js";

export const centered = false;

// -- Credit constants ----------------------------------------------------------
const CREDITS_PER_EXERCISE = 35;
const CREDITS_MAX          = 150;

// -- Session state ---------------------------------------------------------------
// PT-3 / PRESC-1, 12 Aug 2026. This view had no session clock, so it
// could not report elapsed time even once it started logging completions.
// Same pattern as workout.js:186 and core-session.js -- GUARDED SET,
// because onMount() re-fires on every router.navigate back into this
// view and an unguarded assignment would restart the clock each time.
let sessionStartTime = null;

function elapsedMins() {
  if (!sessionStartTime) return null;
  return Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
}

let currentIndex  = 0;
let timerInterval = null;
let timeRemaining = 0;
let timerStarted  = false;

// -- Real-time safety check ------------------------------------------------------
// Real gap found and fixed 04 Aug 2026: this file previously read zero
// condition/pain data, unlike every other session type in the app
// (core-session.js, workoutGenerator.js both check contraindications
// live). A programme built while a condition was Moderate could walk
// someone through now-contraindicated exercises after a flare, with
// nothing flagging it. This doesn't silently hide or block the
// exercise — matches the app's "behaviour is communication" pattern,
// same as the flagged constraint message in coach-proposal.js — it
// surfaces the concern and lets the person decide, with a clear
// "Skip this one" already on hand. Only checks exercises with a real
// exerciseId (coach-built or coach-recommended entries); manually
// added ones via "Build my own" have no database record to check
// against and are correctly left alone, not false-flagged.
function _checkContraindication(ex) {
  if (!ex.exerciseId) return null;
  const fullEx = EXERCISES.find(e => e.id === ex.exerciseId);
  if (!fullEx || !fullEx.contraindications?.length) return null;

  const conditions   = store.get("conditions") || [];
  const painScores    = store.get("conditionPainScores") || {};
  const activeIds     = getActiveConditionIds(conditions, painScores);

  const hit = fullEx.contraindications.find(c => activeIds.includes(c));
  if (!hit) return null;

  const baseConditionId = hit.replace(/-acute$|-subacute$/, "");
  return { conditionName: getConditionName(baseConditionId) };
}

export function render() {
  const exercises = store.get("prescribedExercises") || [];
  const active    = exercises.filter(e => !e.completedToday);

  if (active.length === 0) {
    return renderAlreadyDone();
  }

  const ex           = active[currentIndex];
  const isLast       = currentIndex >= active.length - 1;
  const progress     = (currentIndex / active.length) * 100;
  const holdSecs     = parseHoldSeconds(ex.reps);
  const hasTimer     = holdSecs !== null;
  const contraFlag   = _checkContraindication(ex);

  return `
    <div class="view workout-view">

      <!-- Header -->
      <div class="workout-header">
        <button class="btn btn-ghost" id="ps-exit-btn" aria-label="Exit prescribed session">
          \u2715 Exit
        </button>
        <div class="workout-progress-info" aria-label="Exercise ${currentIndex + 1} of ${active.length}">
          <span>${currentIndex + 1} of ${active.length}</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="workout-progress-bar" role="progressbar"
           aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Session progress">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>

      <!-- Exercise display -->
      <div class="exercise-display">
        <div class="exercise-role-badge main" aria-label="Prescribed exercise">
          \uD83E\uDE7A Prescribed
        </div>

        <h1 class="exercise-name">${ex.name}</h1>

        ${contraFlag ? `
          <div class="ps-contra-flag" role="status" aria-live="polite">
            <span class="ps-contra-flag__icon" aria-hidden="true">\uD83C\uDF31</span>
            <p>${contraFlag.conditionName} is flagged today \u2014 this one's usually best approached carefully, or skipped, when that's the case.</p>
          </div>
        ` : ""}

        <div class="exercise-meta">
          ${ex.sets ? `<span class="meta-tag">${ex.sets} sets</span>` : ""}
          ${ex.reps ? `<span class="meta-tag">${ex.reps}</span>` : ""}
          <span class="meta-tag">+${creditsForIndex(currentIndex, active.length)} \u2B50</span>
        </div>

        <!-- Timer (hold-based exercises only) -->
        ${hasTimer ? `
          <div class="exercise-target">
            <div class="timer-display">
              <div class="timer-circle">
                <span class="timer-value" id="ps-timer-display">${formatTime(timeRemaining || holdSecs)}</span>
                <span class="timer-label">${ex.sets > 1 ? "Set 1 of " + ex.sets : "Hold"}</span>
              </div>
            </div>
          </div>
        ` : ex.reps ? `
          <div class="exercise-target">
            <div class="reps-display">
              <div class="reps-info">
                <span class="reps-value">${ex.sets || 3} \u00D7 ${ex.reps}</span>
                <span class="reps-label">sets \u00D7 reps</span>
              </div>
            </div>
          </div>
        ` : ""}

        <!-- Full guidance (only when this prescribed exercise is linked to
             the shared database via exerciseId — manually-added exercises
             have no instructions/coaching/why/youtube to show, correctly
             show notes only). Same lookup _checkContraindication() already
             uses, same three-section structure workout.js uses. Found 10
             Aug: this screen previously showed name + sets/reps + notes
             only, nothing else, for every prescribed exercise regardless
             of whether the linked database entry had full guidance
             available — it did, at 100% coverage, just never displayed. -->
        ${(() => {
          const fullEx = ex.exerciseId ? EXERCISES.find(e => e.id === ex.exerciseId) : null;
          if (!fullEx) return "";
          return `
            <div class="exercise-instructions card" role="region" aria-label="Exercise guidance for ${ex.name}">
              ${fullEx.instructions && fullEx.instructions.length > 0 ? `
                <span class="exercise-section-label" id="ps-section-setup">How to get there</span>
                <ul class="exercise-section-list" aria-labelledby="ps-section-setup">
                  ${fullEx.instructions.map(inst => `<li>${inst}</li>`).join("")}
                </ul>
              ` : ""}
              ${fullEx.coaching ? `
                <hr class="exercise-section-divider" aria-hidden="true">
                <span class="exercise-section-label" id="ps-section-focus">What to focus on</span>
                <div class="coaching-tip" aria-labelledby="ps-section-focus">
                  <span class="tip-icon" aria-hidden="true">\uD83D\uDCA1</span>
                  <p>${fullEx.coaching}</p>
                </div>
              ` : ""}
              ${fullEx.why ? `
                <hr class="exercise-section-divider" aria-hidden="true">
                <span class="exercise-section-label" id="ps-section-why">Why this helps</span>
                <p class="exercise-why-text" aria-labelledby="ps-section-why">${fullEx.why}</p>
              ` : ""}
            </div>
            ${fullEx.load ? `
              <div class="exercise-load" role="region" aria-label="How heavy for ${ex.name}">
                <span class="exercise-section-label" id="ps-section-load">How heavy</span>
                <p class="exercise-load-text" aria-labelledby="ps-section-load">${fullEx.load}</p>
              </div>
            ` : ""}
            ${(() => {
              // CORE-1. Fires when this exercise loads an area flagged sore today
              // and is NOT contraindicated -- contraindicated ones never reach a
              // card. Names the area, per P7: a coach told something specific that
              // then hedges is pretending not to know. Invitation, not instruction.
              const _c = bodyCaution(fullEx);
              return _c ? `<p class="exercise-caution" role="note">${_c}</p>` : "";
            })()}

            <!-- FEED-1. Two buttons, no "about right" -- silence already means
                 that, and a third option turns an optional aside into a
                 question on every exercise. Not a rating: no stars, no scale.
                 Two of the last five are needed before selection moves
                 anything, and nothing is ever displayed back. -->
            ${renderFeedbackControl(fullEx)}

            ${fullEx.watchOut && fullEx.watchOut.length > 0 ? `
              <div class="exercise-watchout" role="region" aria-label="What to watch for with ${ex.name}">
                <span class="exercise-section-label" id="ps-section-watchout">What to watch for</span>
                <ul class="exercise-watchout-list" aria-labelledby="ps-section-watchout">
                  ${fullEx.watchOut.map(item => `<li>${item}</li>`).join("")}
                </ul>
              </div>
            ` : ""}
            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(fullEx.youtube || (ex.name + " exercise form"))}"
               target="_blank"
               rel="noopener noreferrer"
               class="youtube-link"
               aria-label="Watch how to do ${ex.name} on YouTube (opens in new tab)">
              <span class="youtube-icon" aria-hidden="true">\u25B6\uFE0F</span>
              Watch how to do this
            </a>
          `;
        })()}

        <!-- LOG-3. Physio-prescribed work is exactly where a note matters
             most: "3kg felt fine, 4kg pulled" is the thing somebody needs
             at their next appointment and cannot reconstruct afterwards. -->
        ${renderLogBlock(ex, `ps-log-${currentIndex}`)}

        <!-- Notes -->
        ${ex.notes ? `
          <div class="exercise-instructions card">
            <h3>Notes from your physio</h3>
            <p>${ex.notes}</p>
          </div>
        ` : ""}
      </div>

      <!-- Actions -->
      <div class="workout-actions">
        ${hasTimer ? `
          <button class="btn btn-large btn-full ${timerStarted ? "btn-secondary" : "btn-accent"}"
                  id="ps-timer-btn" aria-live="polite">
            ${!timerStarted ? "\u25B6 Start Timer" : (timerInterval ? "\u23F8 Pause" : "\u25B6 Resume")}
          </button>
        ` : ""}

        <button class="btn btn-primary btn-large btn-full" id="ps-complete-btn">
          ${isLast ? "\uD83C\uDF89 Complete Session" : "Next Exercise \u2192"}
        </button>

        <button class="btn btn-ghost btn-small" id="ps-skip-btn">
          Skip this one
        </button>
      </div>

    </div>
  `;
}

function renderAlreadyDone() {
  return `
    <div class="view">
      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h2>All done!</h2>
          <p>You have already completed all your prescribed exercises today. See you tomorrow.</p>
          <button class="btn btn-primary" id="ps-back-btn" style="margin-top: var(--space-4);">
            Back to choices
          </button>
        </div>
      </div>
    </div>
  `;
}

// -- Helpers -----------------------------------------------------------------------

/**
 * Parse a hold time in seconds from a reps/hold string.
 * Returns null if the string describes reps rather than a hold.
 * Examples:
 *   "30s"    -> 30
 *   "45 sec" -> 45
 *   "2 min"  -> 120
 *   "10"     -> null  (assume reps)
 *   "10 reps"-> null
 */
function parseHoldSeconds(str) {
  if (!str) return null;
  const lower = str.toLowerCase().trim();

  // Match patterns like "30s", "30 sec", "30 seconds"
  const secMatch = lower.match(/^(\d+)\s*s(?:ec(?:onds?)?)?$/);
  if (secMatch) return parseInt(secMatch[1]);

  // Match "2 min", "2 minutes"
  const minMatch = lower.match(/^(\d+)\s*min(?:utes?)?$/);
  if (minMatch) return parseInt(minMatch[1]) * 60;

  return null;
}

/**
 * Credits for completing an exercise at this index.
 * Total for the session: min(count x 35, 150).
 * Split as evenly as possible across exercises.
 */
function creditsForIndex(index, total) {
  const sessionTotal = Math.min(total * CREDITS_PER_EXERCISE, CREDITS_MAX);
  const base         = Math.floor(sessionTotal / total);
  const remainder    = sessionTotal - (base * total);
  // Give the remainder to the last exercise
  return index === total - 1 ? base + remainder : base;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// -- Mount -----------------------------------------------------------------------

export function onMount() {
  const exercises = store.get("prescribedExercises") || [];
  const active    = exercises.filter(e => !e.completedToday);

  // LOG-3. Re-wired per render; attachLogEvents() guards double-binding.
  if (active[currentIndex]) {
    attachLogEvents(active[currentIndex], `ps-log-${currentIndex}`);
    // FEED-1. Self-painting, so no re-render hook is needed.
    attachFeedbackEvents(active[currentIndex]);
  }

  // PT-3. Latch once. onMount() re-fires on every navigate back into this
  // view, so an unguarded assignment would reset the clock and report a
  // forty-minute session as four.
  if (active.length > 0 && sessionStartTime === null) sessionStartTime = Date.now();

  // Already-done state - literal back to wherever the user came from
  document.getElementById("ps-back-btn")?.addEventListener("click", () => {
    router.back();
  });

  if (active.length === 0) return;

  // 23 Jul 2026 v2 (BUILD-3 Section 4): back-gesture protection, added
  // where none existed before. isActive is unconditionally true here
  // because this guard is only ever mounted past the already-done early
  // return above - i.e. only while a real prescribed session is in
  // progress, matching the same "mounted = active" pattern this file
  // already used for its on-screen Exit button.
  mountSessionGuard({
    isActive: () => true,
    label:    "prescribed session",
    onExit:   () => {
      savePartialSession();
      router.back();
    }
  });

  const ex       = active[currentIndex];
  const holdSecs = parseHoldSeconds(ex.reps);

  // Initialise timer display
  if (holdSecs) {
    timeRemaining = timeRemaining || holdSecs;
    updateTimerDisplay();
  }

  // Exit - literal back to wherever the user came from
  // 23 Jul 2026 v2 (BUILD-3 Section 4): now saves partial progress
  // (completed exercises so far) instead of discarding it unconditionally.
  document.getElementById("ps-exit-btn")?.addEventListener("click", () => {
    if (confirm("Exit session? Your progress on completed exercises will be saved.")) {
      savePartialSession();
      dismountSessionGuard();
      router.back();
    }
  });

  // Timer toggle
  document.getElementById("ps-timer-btn")?.addEventListener("click", () => {
    if (!timerStarted) {
      timerStarted = true;
      startTimer();
    } else if (timerInterval) {
      pauseTimer();
    } else {
      startTimer();
    }
    router.navigate("prescribed-session");
  });

  // Complete exercise
  document.getElementById("ps-complete-btn")?.addEventListener("click", () => {
    completeExercise(active);
  });

  // Skip
  document.getElementById("ps-skip-btn")?.addEventListener("click", () => {
    advanceSession(active);
  });
}

// -- Timer -----------------------------------------------------------------------

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
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
  const el = document.getElementById("ps-timer-display");
  if (el) el.textContent = formatTime(timeRemaining);
}

function resetTimer() {
  pauseTimer();
  timeRemaining = 0;
  timerStarted  = false;
}

// -- Exercise flow -----------------------------------------------------------------

function completeExercise(active) {
  const ex      = active[currentIndex];
  const credits = creditsForIndex(currentIndex, active.length);

  // Mark this exercise as completed in the store
  const all = store.get("prescribedExercises") || [];
  const globalIndex = all.findIndex(e => e.id === ex.id);
  if (globalIndex !== -1) {
    all[globalIndex] = {
      ...all[globalIndex],
      completedToday: true,
      completedAt:    new Date().toISOString()
    };
    store.set("prescribedExercises", all);
  }

  // Accumulate credits in session progress
  const progress = store.get("prescribedSessionProgress") || [];
  progress.push({ exerciseId: ex.id, credits });
  store.set("prescribedSessionProgress", progress);

  advanceSession(active);
}

function advanceSession(active) {
  if (currentIndex >= active.length - 1) {
    completeSession(active);
  } else {
    currentIndex++;
    resetTimer();
    router.navigate("prescribed-session");
  }
}

function completeSession(active) {
  const progress     = store.get("prescribedSessionProgress") || [];
  const creditsEarned = Math.min(
    progress.reduce((sum, e) => sum + (e.credits || 0), 0),
    CREDITS_MAX
  );

  // Award credits
  const total = (store.get("totalCredits") || 0) + creditsEarned;
  store.set("totalCredits", total);

  // Stash data for the reflection / completion screens
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    "Prescribed Session");

  // PRESC-1, 12 Aug 2026. This function did not log the session at all.
  // It awarded credits and navigated away, so a FINISHED prescribed
  // session was never recorded -- the only logActivity() call in this
  // file is savePartialSession(), which fires when somebody ABANDONS one.
  //
  // Consequences, all silent: Progress under-counted every completed
  // prescribed session; exerciseHistory never learned any of these
  // exercises, so continuity-aware selection and the drop-in coach
  // question could not see them; and the coach's own condition-specific
  // recommendations were the least-tracked thing in the product.
  //
  // exerciseIds is what store.logActivity() forwards to recordExercises()
  // -- and only when status is not "partial", which is why abandoning
  // one correctly recorded nothing.
  const nowIso = new Date().toISOString();
  store.logActivity({
    type:           "prescribed-session",
    source:         "coach-recommended",
    sessionEnd:     nowIso,
    completedAt:    nowIso,
    status:         "completed",
    durationMins:   elapsedMins(),
    exercisesCount: progress.length,
    exerciseIds:    progress.map(e => e.exerciseId).filter(Boolean),
    creditsEarned
  });

  cleanupSession();
  dismountSessionGuard();
  // Route through reflect.js for post-session reflection, then on to
  // progress - matches gym-programme.js, morning-session.js, workout.js.
  router.navigate("reflect");
}

function cleanupSession() {
  pauseTimer();
  sessionStartTime = null;   // PT-3: reset for the next session
  currentIndex  = 0;
  timeRemaining = 0;
  timerStarted  = false;
  store.set("prescribedSessionProgress", null);
}

/**
 * 23 Jul 2026 v2 (BUILD-3 Section 4): new function. This file previously
 * had no partial-save behaviour at all - exiting mid-session (even after
 * completing several exercises) logged nothing, by explicit design (exit
 * confirm read "Progress on this session will be lost"), even though the
 * individual exercises were already durably marked completedToday in the
 * store. Graeme's decision: add partial-save tracking, matching
 * Gym/Core Session. Unlike morning-session.js, this file had no existing
 * direct activityLog writer to stay consistent with (completeSession()
 * doesn't write activityLog itself - that's left to reflect.js
 * downstream) - so this uses store.logActivity() directly, the current
 * shared convention, rather than a bespoke direct write.
 */
function savePartialSession() {
  const progress = store.get("prescribedSessionProgress") || [];
  if (progress.length === 0) return; // nothing completed yet - nothing to log

  const creditsEarned = Math.min(
    progress.reduce((sum, e) => sum + (e.credits || 0), 0),
    CREDITS_MAX
  );
  const nowIso = new Date().toISOString();

  const activityEntry = store.logActivity({
    type:           "prescribed-session",
    source:         "coach-recommended",
    sessionEnd:     nowIso,
    completedAt:    nowIso,
    status:         "partial",
    exercisesCount: progress.length,
    // CONT-3. Supplied here too, though store.logActivity() deliberately
    // ignores it for partial entries -- an abandoned session should not
    // make its exercises "familiar". Present so the two call sites do not
    // diverge if that guard is ever revisited.
    exerciseIds:    progress.map(e => e.exerciseId).filter(Boolean),
    creditsEarned
  });

  if (activityEntry) {
    store.set("totalCredits", (store.get("totalCredits") || 0) + creditsEarned);
    store.set("lastWorkoutCredits", creditsEarned);
    store.set("lastWorkoutName",    "Prescribed Session");
    store.set("currentActivityEntry", activityEntry);
  }

  cleanupSession();
}
