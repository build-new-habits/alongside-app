/**
 * prescribed-session.js - Prescribed Exercise Session View
 *
 * 11 Aug 2026 v5
 *
 * 31 Aug 2026 v9
 *
 * v9 - CARD-3. Three pages, and a live crash fixed on the way through.
 *
 *   THE CRASH. onMount() called parseHoldSeconds(ex.reps) at a line
 *   TIME-1 did not update when it retired the local copy of that
 *   function. Nothing imports it, so the call threw a ReferenceError on
 *   every mount past the already-done early return -- which is every
 *   real prescribed session in v410. render() had been moved onto
 *   resolveTiming(); onMount() had not. Now it is.
 *
 *   THE CONTRAINDICATION FLAG IS NOT PAGE-SCOPED. It is this view's
 *   personalised safety line, the same role bodyCaution plays inside the
 *   card, so it renders on all three pages. Scoping it to DECIDE would
 *   have hidden it from the page where the exercise is actually done.
 *
 *   WHERE THINGS LANDED. DECIDE: the flag, the sets/reps meta, last time
 *   from the card. DO: the flag, the card's hazards and instructions,
 *   the video, then the timer or rep target, then the physio's notes.
 *   NOTE: the flag, the log block, feedback last.
 *
 *   THE CARD IS CONDITIONAL HERE and always was -- it renders only when
 *   ex.exerciseId links to the shared database. Manually-added exercises
 *   have no instructions to show. The page model therefore governs the
 *   VIEW's layout, and the card is one part of it rather than the whole
 *   of it, which is why the timer target and the notes are paged by this
 *   file rather than passed in as a slot.
 *
 *   Ids unchanged: ps-timer-btn, ps-complete-btn, ps-skip-btn,
 *   ps-back-btn, ps-exit-btn. New: ps-begin-btn, ps-done-btn.
 *
 * 31 Aug 2026 v8
 *
 * v8 - CARD-2. Three-layer card. The YouTube link moves into During,
 *   where somebody actually wants it, and the feedback control into
 *   After. Also fixes `running: false`, hardcoded here while this view
 *   has had live timerStarted state all along.
 *
 * 31 Aug 2026 v7
 *
 * v7 - TIME-1. Timer resolves through js/exercise-timing.js. This view
 *   parsed the prescription reps string and never read exercise.duration,
 *   so a database exercise with a duration got no clock here at all. The
 *   local parseHoldSeconds is retired; it had drifted from the one in
 *   gym-programme.js, which handled ranges this one did not.
 *
 * 29 Aug 2026 v6
 *
 * v6 - CARD-1. Card moves to the shared renderer, js/exercise-card.js.
 *   bodyCaution rendered below "How heavy" and watchOut below the
 *   feedback control; both now precede the explanatory text. Also starts
 *   rendering exercise.cues, which this file never did.
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
import { renderExerciseCard, attachCardEvents } from "../exercise-card.js";
import { resolveTiming, formatTime } from "../exercise-timing.js";
import { renderLogBlock, attachLogEvents, scrollToTop, lastLine } from "../session-log.js";
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

// CARD-3. "decide" | "do" | "note". Ephemeral, per exercise, reset on
// every advance. Never stored.
let currentCardPage = "decide";

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
  // TIME-1. Was parseHoldSeconds(ex.reps) only, so an exercise carrying a
  // database `duration` got no clock here while getting one in workout.js.
  const _timing      = resolveTiming(ex, ex.reps);
  const holdSecs     = _timing.seconds;
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

        <!-- CARD-3. One card, three pages, and it renders whether or not
             this prescribed exercise links to the shared database. The
             card itself is conditional -- manually-added exercises have
             no instructions to show -- so the page model governs THIS
             file's layout and the card is one part of it. -->
        ${(() => {
          const fullEx = ex.exerciseId ? EXERCISES.find(e => e.id === ex.exerciseId) : null;
          if (!fullEx) return "";
          return renderExerciseCard(fullEx, {
            idPrefix: `ps-${fullEx.id}`,
            page:     currentCardPage,
            lastTime: lastLine(ex),
            doSlot: `
              <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(fullEx.youtube || (ex.name + " exercise form"))}"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="youtube-link"
                 aria-label="Watch how to do ${ex.name} on YouTube (opens in new tab)">
                <span class="youtube-icon" aria-hidden="true">\u25B6\uFE0F</span>
                Watch how to do this
              </a>`,
            noteSlot: `
              <!-- LOG-3. Physio-prescribed work is exactly where a note
                   matters most: "3kg felt fine, 4kg pulled" is the thing
                   somebody needs at their next appointment and cannot
                   reconstruct afterwards. Feedback stays last. -->
              ${renderLogBlock(ex, `ps-log-${currentIndex}`)}

              ${renderFeedbackControl(fullEx)}`
          });
        })()}

        <!-- The timer target belongs to DO, and it renders AFTER the card
             so the caution keeps its place at the top of the page. -->
        ${currentCardPage === "do" ? `
          ${hasTimer ? `
            <div class="exercise-target">
              <div class="timer-display">
                <div class="timer-circle">
                  <span class="timer-value" id="ps-timer-display">${formatTime(timeRemaining || holdSecs)}</span>
                  <span class="timer-label">${ex.sets > 1 ? "Set 1 of " + ex.sets : "About this long"}</span>
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

          ${ex.notes ? `
            <div class="exercise-instructions card">
              <h3>Notes from your physio</h3>
              <p>${ex.notes}</p>
            </div>
          ` : ""}
        ` : ""}

        <!-- No linked database entry means no card, and therefore no log
             block from the card's NOTE slot. This is the fallback so a
             manually-added exercise is still loggable. -->
        ${(!ex.exerciseId && currentCardPage === "note")
          ? renderLogBlock(ex, `ps-log-${currentIndex}`) : ""}
      </div>

      <!-- Actions. Ids unchanged; WHICH renders is what CARD-3 changed.
           Skip is on DECIDE only. -->
      <div class="workout-actions">
        ${currentCardPage === "decide" ? `
          <button class="btn btn-accent btn-large btn-full" id="ps-begin-btn">
            Start this one \u2192
          </button>

          <button class="btn btn-ghost btn-small" id="ps-skip-btn">
            Skip this one
          </button>
        ` : ""}

        ${currentCardPage === "do" ? `
          ${hasTimer ? `
            <button class="btn btn-large btn-full ${timerStarted ? "btn-secondary" : "btn-accent"}"
                    id="ps-timer-btn" aria-live="polite">
              ${!timerStarted ? "\u25B6 Start Timer" : (timerInterval ? "\u23F8 Pause" : "\u25B6 Resume")}
            </button>
          ` : ""}

          <button class="btn btn-primary btn-large btn-full" id="ps-done-btn">
            Done \u2192
          </button>
        ` : ""}

        ${currentCardPage === "note" ? `
          <button class="btn btn-primary btn-large btn-full" id="ps-complete-btn">
            ${isLast ? "\uD83C\uDF89 Complete Session" : "Next Exercise \u2192"}
          </button>
        ` : ""}
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
// TIME-1. parseHoldSeconds lived here and in gym-programme.js, and the two
// had drifted -- gym-programme's handled ranges like "30-45s" and this one
// did not, so the same prescription timed in one view and not the other.
// Both are now js/exercise-timing.js.

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

// TIME-1. formatTime is now js/exercise-timing.js -- there were three
// identical copies, and the shared one also floors null to 0:00 rather
// than rendering "NaN:NaN".

// -- Mount -----------------------------------------------------------------------

export function onMount() {
  const exercises = store.get("prescribedExercises") || [];
  const active    = exercises.filter(e => !e.completedToday);

  // LOG-3. Re-wired per render; attachLogEvents() guards double-binding.
  if (active[currentIndex]) {
    attachLogEvents(active[currentIndex], `ps-log-${currentIndex}`);
    // FEED-1. Self-painting, so no re-render hook is needed.
    attachFeedbackEvents(active[currentIndex]);
    attachCardEvents(document.getElementById("app") || document);
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
  // TIME-1 retired the local parseHoldSeconds and updated render() but
  // not this line, so onMount threw a ReferenceError on every real
  // prescribed session. Same resolver render() uses.
  const holdSecs = resolveTiming(ex, ex.reps).seconds;

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

  // CARD-3. Forward, and deliberately without touching the clock.
  document.getElementById("ps-begin-btn")?.addEventListener("click", () => {
    currentCardPage = "do";
    scrollToTop();
    router.navigate("prescribed-session");
  });

  document.getElementById("ps-done-btn")?.addEventListener("click", () => {
    currentCardPage = "note";
    scrollToTop();
    router.navigate("prescribed-session");
  });

  // Back is announced by the card; the page number has one owner.
  // Bound once -- onMount re-fires per navigate and #app outlives it.
  const _root = document.getElementById("app") || document;
  if (!_root.__psPageBound) {
    _root.__psPageBound = true;
    _root.addEventListener("xcard:page", ev => {
      // Every view binds this on the shared #app root and none is ever
      // removed, so a handler from a view you visited earlier is still
      // live. Without this prefix check, Back inside one session fires
      // another view's handler and navigates you out of it.
      const _pfx = (ev.detail && ev.detail.prefix) || "";
      if (!_pfx.startsWith("ps-")) return;
      const to = ev.detail && ev.detail.page;
      if (to !== "decide" && to !== "do") return;
      currentCardPage = to;
      scrollToTop();
      router.navigate("prescribed-session");
    });
  }
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
      // CARD-3. The clock running out IS the end of the exercise. The one
      // automatic forward move; everything else is a tap.
      currentCardPage = "note";
      router.navigate("prescribed-session");
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
  // CARD-3. A new exercise always starts on DECIDE. Both advance paths
  // come through here.
  currentCardPage = "decide";
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
  scrollToTop();   // SCROLL-1: a new card starts at the top
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
  currentCardPage = "decide";   // CARD-3. Index resets here, so the page must too.
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
