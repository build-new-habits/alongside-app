/**
 * prescribed-session.js - My exercises, played
 *
 * 23 Nov 2026 v20
 *
 * v20 - OWN-DONE-TODAY (Graeme, 23 Nov: "It says I did these today but I
 *   didn't"). Done today is read through store.ownDoneToday(): ticked today
 *   only (the flag was never cleared).
 *
 * v19 - P-36 MY-LIST-PLAYER (Graeme, 15-16 Nov, on Little and often: "The
 *   timer is at the bottom. I can't see what exercises are being done in
 *   the programme. I think this is weak. I also want a noise or vibration
 *   when the timer finishes"; mock-up approved 16 Nov: where it applies
 *   "Yes", the chime "On by default", Watch out and Note "Ok"). Both tiers,
 *   every list in My exercises:
 *   - THE LIST FIRST: every exercise with its figure and how much, about how
 *     long, then Start. The safety note comes after Start, before the first.
 *   - ONE SCREEN AN EXERCISE: the name, how much, the timer (or the count)
 *     at the top with Start the timer under it, then the figure, How, Watch
 *     out folded on the same screen, the app's own "If something hurts"
 *     line, and Skip / Done at the foot. The four pages (Start this one,
 *     Watch out, Do, Note) are gone from this player (D-1's four steps stay
 *     everywhere else).
 *   - TIME'S UP: a soft chime (Settings › Display › Timer sound), a longer
 *     buzz (Vibration), a tick, said once to a screen reader; the button
 *     becomes "Next: <name>". It never moves on by itself.
 *   - THE LIST, ANY TIME: "n of N · The list" opens what's done and what's
 *     left; tap one to do it now.
 *   - NOTES AT THE END: each one done gets "Add a note" on the last screen,
 *     then Finish.
 *   Help shows on the list (the session guard is active only once started).
 *
 * 15 Nov 2026 v18
 *
 * v18 - P-31 (review, 15 Nov). _checkContraindication() reads the shared
 *   rule in data/sore-rule.js, so Home's Little and often names the same
 *   sore area this player warns about. Behaviour unchanged.
 *
 * 31 Oct 2026 v17
 *
 * v17 - STAGE PATH Session 9 (CLOSE; P-12 F4, F5; Graeme, 31 Oct: "Exit in a
 *   session", "‹ Back"). On the Plan only: in the session the way out says
 *   Exit (it said "✕ Exit") with no house beside it, the movement's name
 *   as the page heading and Skip this one a button (it was bare words); with all of today's done, "All done" is the page
 *   heading and the way back says "‹ Back" (it said "Back to choices").
 *   Free unchanged.
 *
 * 18 Oct 2026 v16
 *
 * v16 - OLD-CREDITS-TIDY (Graeme, 18 Oct: "You do those things"). The
 *   older per-session credit count is no longer written (totalCredits,
 *   lastWorkoutCredits, lastWorkoutName, an entry's creditsEarned): nothing
 *   read it since August. The social action credits (community.credits,
 *   store.logActivity) are unchanged. As it was: BNH-Files
 *   Archive/DEVICE-662/OLD-CREDITS-TIDY.
 *
 * 17 Oct 2026 v15
 *
 * v15 - D662-10 OLD-STARS (Graeme, 17 Oct: "Remove them"). No "+35 ⭐" on
 *   each move: the older per-move count, which nothing shows or uses (the
 *   social action credits are 1 or 2 a session, Settings › Community
 *   impact). The count itself is still kept, untouched. "1 set", not
 *   "1 sets". As it was: BNH-Files, Archive/DEVICE-662/D662-10 old-stars.
 *
 * 05 Oct 2026 v14
 *
 * v14 - D-7 PLAN-IMPORT. Plays one group of My exercises when one is
 *   chosen (myExercisesGroup: "Session A" from an imported plan), else all
 *   of them, as before. A finished session tells the arc which areas its
 *   exercises worked, for the ones linked to the library (exerciseId):
 *   it was logged with My exercises' own ids, so the arc learned nothing.
 *
 * 01 Oct 2026 v13
 *
 * v13 - BUNDLE-TRUE. The person's own names, doses and notes are escaped where
 *   they are written into the page (independent check of the Foot Anstey
 *   bundle: text from My exercises was written in raw).
 *
 * 30 Sep 2026 v12
 *
 * v12 - W3-3 CLASS-FINISH (Wave 3, persona 2.14). A finished My exercises
 *   session is the finish screen's entry (currentActivityEntry set).
 *
 * v11 - P0, SCOPE-MINOR + P5 PRESCRIBED-CRASH. Plays the person's own
 *   list ("My exercises"): no "Prescribed" badge, no "Notes from your
 *   physio". On a sore day it says which ones load the sore area and
 *   leaves the choice to them (Graeme: "we're not doing that one today
 *   because your back is pretty sore and this one loads it"). Finishing
 *   an exercise no longer skips the next one or crashes at the end.
 *
 * 11 Sep 2026 v10
 *
 * v10 - ADAPT-1. Tells the card this exercise is prescribed, so "Other
 *   ways to do this" does not render here. Prescribed exercises injected
 *   into built sessions carry isPrescribed themselves; this view resolves
 *   the plain library entry by id, so it has to say so.
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
import { planLook } from "../plan-look.js";
import { renderFeedbackControl, attachFeedbackEvents } from "../exercise-feedback.js";
import { renderExerciseCard, attachCardEvents } from "../exercise-card.js";
import { isGateDue, renderSafetyGate, attachSafetyGate } from "../safety-gate.js";
import { resolveTiming, formatTime } from "../exercise-timing.js";
import { renderLogBlock, attachLogEvents, scrollToTop, lastLine } from "../session-log.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
import { playTimerChime, primeTimerSound } from "../display-prefs.js";
import { EXERCISES } from "../data/exercises/index.js";
import { renderFigure } from "../figures.js";
import { soreConditionFor } from "../data/sore-rule.js";

/** BUNDLE-TRUE. Text the person typed (or a file brought) is text, never markup. */
function _esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const centered = false;

// -- Credit constants ----------------------------------------------------------

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

// P-36. "list" (the list first), "go" (one exercise at a time), "end" (notes
// and Finish). Ephemeral, never stored. timerDone: this exercise's timer ran
// out. sheetOpen: the list over the exercise.
let phase     = "list";
let timerDone = false;
let sheetOpen = false;
// The app's own safety line, word for word (Today's plan says it the same).
const HURT_LINE = "If something hurts \u2014 sharp, or building as you go \u2014 stop that one. Aching afterwards is normal.";

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
  // P-31 (15 Nov): the rule now lives in data/sore-rule.js, shared with Home's Little and often.
  return soreConditionFor(ex);
}

/** P-36. The whole list, done or not, in the chosen group if there is one. */
function _wholeList() {
  const group = store.get("myExercisesGroup") || null;
  return (store.get("prescribedExercises") || []).filter(e => !group || e.group === group);
}
const _listName = () => store.get("myExercisesGroup") || "My exercises";
const _amount = ex => {
  const t = resolveTiming(ex, ex.reps);
  const bits = [];
  if (ex.reps) bits.push(String(ex.reps));
  else if (t.seconds) bits.push(formatTime(t.seconds));
  if (Number(ex.sets) > 1) bits.push(`${ex.sets} sets`);
  return bits.join(" \u00b7 ");
};
/** About how long, in minutes: a timed one is its time a set; a counted one about a minute a set. */
function _aboutMins(list) {
  const secs = list.reduce((a, ex) => {
    const t = resolveTiming(ex, ex.reps).seconds;
    const sets = Math.max(1, Number(ex.sets) || 1);
    const each = /each side/i.test(String(ex.reps || "")) ? 2 : 1;
    return a + (t ? t * each * sets + 15 : 60 * sets);
  }, 0);
  return Math.max(1, Math.round(secs / 60));
}
const _fullOf = ex => (ex && ex.exerciseId ? EXERCISES.find(e => e.id === ex.exerciseId) : null);
function _thumb(ex) {
  const f = _fullOf(ex);
  const fig = f ? renderFigure(f) : "";
  return `<span class="ps-thumb" aria-hidden="true">${fig}</span>`;
}

/** D-7. Today's list: not yet done, in the chosen group if there is one. */
function _todaysList() {
  const group = store.get("myExercisesGroup") || null;
  return (store.get("prescribedExercises") || []).filter(e => !store.ownDoneToday(e) && (!group || e.group === group));
}

export function render() {
  const active = _todaysList();
  const whole  = _wholeList();
  // Everything done but not yet finished (left and come back): the end, to finish it.
  if (active.length === 0 && (store.get("prescribedSessionProgress") || []).length) phase = "end";

  if (phase === "end") return renderEnd(whole);
  if (active.length === 0) return renderAlreadyDone();
  if (phase === "list") return renderList(whole, active);

  // SAFETY-GATE, 15 Sep 2026. Before exercise 1 and nowhere else (P-36: after
  // Start, so the list itself is seen first). isGateDue() goes false the
  // moment the acknowledgement is written, so no view-local flag is needed.
  if (currentIndex === 0 && isGateDue() && (store.get("prescribedSessionProgress") || []).length === 0) {
    return `<div class="view prescribed-session-view">${renderSafetyGate()}</div>`;
  }

  // Never read past the list, whatever state a return visit finds.
  if (currentIndex > active.length - 1) currentIndex = active.length - 1;
  return renderExercise(whole, active);
}

/** P-36. The list first: what's in it, about how long, then Start. */
function renderList(whole, active) {
  const left = whole.filter(e => !store.ownDoneToday(e));
  const done = whole.length - left.length;
  return `
    <div class="view workout-view is-plan ps-view">
      <button class="btn btn-ghost plan-back" id="ps-back-btn" aria-label="Back">\u2039 Back</button>
      <h1 tabindex="-1">${_esc(_listName())}</h1>
      <p class="ps-sub">${left.length} exercise${left.length === 1 ? "" : "s"}${done ? ` left, ${done} done today` : ""} \u00b7 about ${_aboutMins(left)} minute${_aboutMins(left) === 1 ? "" : "s"}</p>
      ${_rows(whole, null)}
      <p class="ps-note">Your own exercises, as you wrote them.</p>
      <div class="workout-actions">
        <button class="btn btn-primary btn-large btn-full" id="ps-start-btn" data-guide-target="list-start">${done ? "Carry on" : "Start"}</button>
      </div>
    </div>`;
}

/** The rows of the list: a tick when done, the figure, the name and how much. */
function _rows(whole, current, jump = false) {
  return `<ul class="ps-rows look-card">${whole.map(ex => {
    const isNow = current && ex.id === current.id;
    const tick = `<span class="ps-tick${store.ownDoneToday(ex) ? " ps-tick--on" : ""}" aria-hidden="true">${store.ownDoneToday(ex) ? "\u2713" : ""}</span>`;
    const text = `<span class="ps-row__t"><span class="ps-row__name">${_esc(ex.name)}</span><span class="sr-only">, </span><span class="ps-row__amt">${_esc(_amount(ex))}${store.ownDoneToday(ex) ? " \u00b7 done" : isNow ? " \u00b7 now" : ""}</span></span>`;
    const inner = `${tick}${_thumb(ex)}${text}`;
    return jump && !store.ownDoneToday(ex)
      ? `<li><button type="button" class="ps-row${isNow ? " ps-row--now" : ""}" data-ps-jump="${_esc(ex.id)}"${isNow ? ' aria-current="step"' : ""}>${inner}</button></li>`
      : `<li class="ps-row${isNow ? " ps-row--now" : ""}">${inner}</li>`;
  }).join("")}</ul>`;
}

/** P-36. One screen an exercise: the timer or the count at the top. */
function renderExercise(whole, active) {
  const ex         = active[currentIndex];
  const next       = active[currentIndex + 1] || null;
  const isLast     = active.length === 1 || currentIndex >= active.length - 1;
  const pos        = Math.max(1, whole.findIndex(e => e.id === ex.id) + 1);
  const doneCount  = whole.filter(e => store.ownDoneToday(e)).length;
  const progress   = whole.length ? (doneCount / whole.length) * 100 : 0;
  // TIME-1. The one resolver.
  const holdSecs   = resolveTiming(ex, ex.reps).seconds;
  const hasTimer   = holdSecs !== null;
  const contraFlag = _checkContraindication(ex);
  const fullEx     = _fullOf(ex);
  const left       = timerInterval ? "Running" : timerDone ? "Time\u2019s up" : timerStarted ? "Paused" : "Ready";

  const target = hasTimer ? `
      <div class="ps-target" role="group" aria-label="Timer">
        <div class="timer-circle ps-timer${timerDone ? " ps-timer--done" : ""}">
          <span class="timer-value" id="ps-timer-display" aria-label="${timerDone ? "Time\u2019s up" : left}">${timerDone ? "\u2713" : formatTime(timeRemaining || holdSecs)}</span>
        </div>
        ${timerDone ? `<p class="ps-timesup" role="status">Time\u2019s up.</p>` : `
        <button class="btn btn-large ${timerStarted && timerInterval ? "btn-secondary" : "btn-primary"} ps-timer-btn" id="ps-timer-btn">
          ${!timerStarted ? "Start the timer" : (timerInterval ? "Pause" : "Carry on")}
        </button>`}
      </div>` : ex.reps ? `
      <div class="ps-target ps-count" role="group" aria-label="How many">
        <span class="ps-count__n">${_esc(ex.reps)}</span>
        <span class="ps-count__l">${Number(ex.sets) > 1 ? `${_esc(ex.sets)} sets` : "Count them at your own pace"}</span>
      </div>` : "";

  const card = fullEx ? renderExerciseCard(fullEx, {
    idPrefix: `ps-${fullEx.id}`,
    layout: "compact",
    // ADAPT-1. Someone's own list: no "Other ways to do this" offered over it.
    prescribed: true,
    doSlot: `
      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(fullEx.youtube || (ex.name + " exercise form"))}"
         target="_blank" rel="noopener noreferrer" class="youtube-link"
         aria-label="Watch how to do ${_esc(ex.name)} on YouTube (opens in new tab)">
        <span class="youtube-icon" aria-hidden="true">\u25B6\uFE0F</span>
        Watch how to do this
      </a>`,
  }) : "";

  const nextLabel = isLast ? "Done" : (timerDone && next ? `Next: ${_esc(next.name)}` : "Done, next");

  return `
    <div class="view workout-view is-plan ps-view">
      <div class="workout-header ps-header">
        <button class="btn btn-ghost plan-exit" id="ps-exit-btn" aria-label="Exit my exercises">Exit</button>
        <button type="button" class="ps-listbtn" id="ps-list-btn" aria-haspopup="dialog" aria-expanded="${sheetOpen ? "true" : "false"}">${pos} of ${whole.length} \u00b7 The list</button>
      </div>
      <div class="workout-progress-bar" role="progressbar" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100" aria-label="How much of the list is done">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>

      <h1 class="exercise-name" tabindex="-1">${_esc(ex.name)}</h1>
      <p class="ps-sub">${_esc(_amount(ex))}</p>

      ${contraFlag ? `
        <div class="ps-contra-flag" role="status">
          <p>You said your ${_esc(contraFlag.conditionName.toLowerCase())} is sore, and this one usually loads it. You might leave it today.</p>
        </div>` : ""}

      ${target}

      ${card}

      ${ex.notes ? `
        <div class="exercise-instructions card">
          <h2 class="ps-h2">Your notes</h2>
          <p>${_esc(ex.notes)}</p>
        </div>` : ""}

      <p class="ps-hurt" role="note">${HURT_LINE}</p>

      <div class="workout-actions ps-actions--two">
        <button class="btn btn-secondary btn-large" id="ps-skip-btn">Skip</button>
        <button class="btn btn-primary btn-large" id="ps-complete-btn">${nextLabel}</button>
      </div>
      ${sheetOpen ? renderSheet(whole, ex) : ""}
    </div>`;
}

/** P-36. The list, over the exercise: what's done, what's left; tap one to do it now. */
function renderSheet(whole, current) {
  return `
    <div class="ps-sheet-dim" data-ps-close></div>
    <section class="ps-sheet" role="dialog" aria-modal="true" aria-labelledby="ps-sheet-h">
      <div class="ps-sheet__top">
        <h2 id="ps-sheet-h" tabindex="-1">${_esc(_listName())}</h2>
        <button type="button" class="btn btn-ghost" id="ps-sheet-close">Close</button>
      </div>
      <p class="ps-note">Tap one to do it now. Nothing is skipped until you say so.</p>
      ${_rows(whole, current, true)}
    </section>`;
}

/** P-36. The end: a note on any you did, then Finish. */
function renderEnd(whole) {
  const did = (store.get("prescribedSessionProgress") || []).map(p => whole.find(e => e.id === p.exerciseId)).filter(Boolean);
  return `
    <div class="view workout-view is-plan ps-view">
      <h1 tabindex="-1">${did.length ? "That\u2019s the list" : "Nothing done this time"}</h1>
      ${did.length ? `<p class="ps-sub">Anything to note? Optional.</p>
      <ul class="ps-notes">${did.map((ex, i) => `
        <li><details class="ps-note-item">
          <summary><span class="ps-row__name">${_esc(ex.name)}</span><span class="sr-only">, </span><span class="ps-row__amt">Add a note</span></summary>
          ${renderLogBlock(ex, `ps-log-${ex.id}`)}
          ${_fullOf(ex) ? renderFeedbackControl(_fullOf(ex)) : ""}
        </details></li>`).join("")}</ul>` : `<p class="ps-sub">That\u2019s fine. Your list is here when you want it.</p>`}
      <div class="workout-actions">
        <button class="btn btn-primary btn-large btn-full" id="ps-finish-btn">Finish</button>
      </div>
    </div>`;
}

function renderAlreadyDone() {
  if (planLook()) return `
    <div class="view is-plan">
      <button class="btn btn-ghost plan-back" id="ps-back-btn" aria-label="Back to My exercises">‹ Back</button>
      <h1 tabindex="-1">All done</h1>
      <p>That's all of your exercises done for today.</p>
    </div>
  `;
  return `
    <div class="view">
      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h2>All done!</h2>
          <p>That's all of your exercises done for today.</p>
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


// TIME-1. formatTime is now js/exercise-timing.js -- there were three
// identical copies, and the shared one also floors null to 0:00 rather
// than rendering "NaN:NaN".

// -- Mount -----------------------------------------------------------------------

export function onMount() {
  const active = _todaysList();
  const whole  = _wholeList();
  const go = () => router.navigate("prescribed-session");
  if (active.length === 0 && (store.get("prescribedSessionProgress") || []).length) phase = "end";

  // The list first, and the end: no session guard yet (Help shows on the list).
  if (phase === "list" || active.length === 0 && phase !== "end") {
    document.getElementById("ps-back-btn")?.addEventListener("click", () => { cleanupSession(); router.back(); });
    document.getElementById("ps-start-btn")?.addEventListener("click", () => {
      phase = "go"; currentIndex = 0; resetTimer();
      if (sessionStartTime === null) sessionStartTime = Date.now();
      scrollToTop(); go();
    });
    return;
  }
  if (phase === "end") {
    const did = (store.get("prescribedSessionProgress") || []).map(p => whole.find(e => e.id === p.exerciseId)).filter(Boolean);
    did.forEach((ex, i) => { attachLogEvents(ex, `ps-log-${ex.id}`); attachFeedbackEvents(ex); });
    document.getElementById("ps-finish-btn")?.addEventListener("click", () => completeSession());
    return;
  }

  // SAFETY-GATE. Early return -- nothing below is on screen behind it.
  if (active.length > 0 && currentIndex === 0 && isGateDue() && (store.get("prescribedSessionProgress") || []).length === 0) {
    attachSafetyGate(document.getElementById("app") || document, {
      surface: "prescribed-session",
      onAcknowledge: () => go(),
      onLeave:       () => { phase = "list"; go(); },
    });
    return;
  }

  const ex = active[currentIndex];
  if (ex) {
    // FEED-1. Self-painting, so no re-render hook is needed.
    attachCardEvents(document.getElementById("app") || document);
  }

  // PT-3. Latch once.
  if (sessionStartTime === null) sessionStartTime = Date.now();

  // BUILD-3. Back-gesture protection, once the list has started.
  mountSessionGuard({
    isActive: () => phase === "go",
    label:    "your exercises",
    onExit:   () => { savePartialSession(); router.back(); },
  });

  const holdSecs = resolveTiming(ex, ex.reps).seconds;
  if (holdSecs && !timerDone) { timeRemaining = timeRemaining || holdSecs; updateTimerDisplay(); }

  document.getElementById("ps-exit-btn")?.addEventListener("click", () => {
    if (confirm("Exit session? Your progress on completed exercises will be saved.")) {
      savePartialSession();
      dismountSessionGuard();
      router.back();
    }
  });

  document.getElementById("ps-timer-btn")?.addEventListener("click", () => {
    primeTimerSound();          // a phone allows sound only after a tap
    if (!timerStarted) { timerStarted = true; startTimer(); }
    else if (timerInterval) pauseTimer();
    else startTimer();
    go();
  });

  document.getElementById("ps-complete-btn")?.addEventListener("click", () => completeExercise(active));
  document.getElementById("ps-skip-btn")?.addEventListener("click", () => advanceSession(active));

  // The list over the exercise.
  const openSheet = open => { sheetOpen = open; if (!open) _focusList = true; go(); };
  document.getElementById("ps-list-btn")?.addEventListener("click", () => openSheet(!sheetOpen));
  document.getElementById("ps-sheet-close")?.addEventListener("click", () => { openSheet(false); });
  document.querySelector("[data-ps-close]")?.addEventListener("click", () => openSheet(false));
  document.querySelectorAll("[data-ps-jump]").forEach(b => b.addEventListener("click", () => {
    const i = active.findIndex(e => e.id === b.dataset.psJump);
    sheetOpen = false;
    _focusList = false;
    if (i >= 0 && i !== currentIndex) { currentIndex = i; resetTimer(); scrollToTop(); }
    go();
  }));
  const sheet = document.querySelector(".ps-sheet");
  if (sheet) {
    setTimeout(() => document.getElementById("ps-sheet-h")?.focus(), 0);
    sheet.addEventListener("keydown", e => { if (e.key === "Escape") openSheet(false); });
  } else if (_focusList) {
    _focusList = false;
    setTimeout(() => document.getElementById("ps-list-btn")?.focus(), 0);
  }
}
let _focusList = false;

// P-36. Leaving for another screen any way but Exit (the house, a link)
// ends this visit: the next one starts at the list, with what's done ticked.
// Done exercises stay done; nothing is logged that was not.
if (typeof document !== "undefined") {
  document.addEventListener("alongside:mounted", e => {
    if (e.detail?.view === "prescribed-session" || phase === "list") return;
    pauseTimer();
    phase = "list"; currentIndex = 0; timeRemaining = 0; timerStarted = false; timerDone = false; sheetOpen = false;
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
      // P-36. Time's up: a chime (Timer sound), a longer buzz (Vibration),
      // a tick and the words. It never moves on by itself.
      timerDone = true;
      playTimerChime();
      if ("vibrate" in navigator) navigator.vibrate([300, 120, 300, 120, 500]);
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
  timerDone     = false;
  sheetOpen     = false;
}

// -- Exercise flow -----------------------------------------------------------------

function completeExercise(active) {
  const ex      = active[currentIndex];

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
  progress.push({ exerciseId: ex.id });
  store.set("prescribedSessionProgress", progress);

  // P5 (29 Sep). The finished exercise has just LEFT the active list, so
  // the next one is already at currentIndex. Advancing the index as well
  // skipped every other exercise and then read past the end of the list
  // ("1 of 8, 2 of 7, 3 of 6, 4 of 5", then a crash: persona 2.1).
  resetTimer();
  scrollToTop();
  if (active.length <= 1) phase = "end";
  else if (currentIndex >= active.length - 1) currentIndex = 0;   // the next not done, from the top
  router.navigate("prescribed-session");
}

// Skip leaves the exercise in the active list, so the index moves on.
function advanceSession(active) {
  resetTimer();
  scrollToTop();   // SCROLL-1: a new card starts at the top
  if (currentIndex >= active.length - 1) phase = "end";
  else currentIndex++;
  router.navigate("prescribed-session");
}

function completeSession() {
  const progress     = store.get("prescribedSessionProgress") || [];

  // Stash data for the reflection / completion screens

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
  // D-7. What the arc needs: the library exercises behind the person's own
  // (exerciseId), with the areas they work. Own ones with no link add none.
  const own = store.get("prescribedExercises") || [];
  const worked = progress
    .map(p => own.find(e => e.id === p.exerciseId))
    .map(e => e && e.exerciseId ? EXERCISES.find(x => x.id === e.exerciseId) : null)
    .filter(Boolean)
    .map(x => ({ id: x.id, affectsAreas: x.affectsAreas || [] }));
  // W3-3. The finish screen's entry is this session, not the last one.
  const created = store.logActivity({
    type:           "prescribed-session",
    source:         "own",
    sessionEnd:     nowIso,
    completedAt:    nowIso,
    status:         "completed",
    durationMins:   elapsedMins(),
    exercisesCount: progress.length,
    exerciseIds:    progress.map(e => e.exerciseId).filter(Boolean),
    exercises:      worked,
  });
  store.set("currentActivityEntry", created || null);

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
  timerDone     = false;
  sheetOpen     = false;
  phase         = "list";       // P-36. The next visit starts at the list.
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
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }

  cleanupSession();
}
