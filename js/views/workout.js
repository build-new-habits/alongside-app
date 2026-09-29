/**
 * workout.js - Workout Execution View
 * 29 Sep 2026 v28
 *
 * v28 - P21, PLAYERS (persona finding W2-17). Built and saved sessions now
 *   play here (one card a move), not in the four-page session screen. The
 *   one thing that screen had that this did not came with them: SWAP-0's
 *   "Can't get on this? Swap it" for a busy cardio machine, which swaps in
 *   another machine the person has and keeps the change in the session.
 *
 * v27 - P19, "MOSTLY THE SAME" (persona finding W2-14). A finished
 *   session tells the store which section each move was done in
 *   (exerciseSections), so a familiar move stays in its section.
 *
 * v26 - P18, "NOT AGAIN" (persona finding W2-13). Settings promises: "When
 *   you skip something, the coach offers to see it less often -- or not
 *   at all." This player had a Skip button and nothing after it. Now the
 *   next card asks, by name, "Want me to change how often X comes up?" --
 *   Less often / Not again / Leave it -- the core session's offer, the
 *   same store call (setExercisePreference, source 'skip'). Skipping the
 *   last move asks on a short screen, then finishes. The question is
 *   view state only: it never carries into another session.
 *
 * v25 - P4, FREE-CARRY-ON (persona finding W2-4). Three changes:
 *   - "Carry on later" is offered on the Plan only. Free has no Carry-on
 *     card to come back to (the tier table), so the choice went nowhere.
 *   - On the Plan it says it keeps for 3 hours (session-resume.js
 *     STALE_MS), instead of quietly expiring.
 *   - A session that is not the checkpointed one starts with no progress.
 *     A session left without finishing kept its workoutProgress, and the
 *     next one finished with the old moves counted in ("13 moves" for 10).
 *   verify-free-carry-on.
 *
 * 29 Sep 2026 v24
 *
 * v24 - P2, SESSION-TYPE-ID. The hand-off (lastFinishedSession) is written
 *   BEFORE logActivity(), on both ways of finishing, so the log describes
 *   this session. Written after, it was still there when the NEXT thing
 *   was logged -- a walk, a breathing session -- and lent it this
 *   session's type. store.logActivity() marks it logged once used.
 *
 * 28 Sep 2026 v23
 *
 * v23 - Work list 7, SAVE-HANDOFF. Finishing, or ending part-way and
 *   saving, writes lastFinishedSession before cleanupWorkout() clears
 *   generatedSession -- until now the finish screen could never offer
 *   "Keep this one?" after a coach or builder session. The part-way entry
 *   also records which exercises were done (exerciseIds), so the offer
 *   can tell this session is what just finished (save-block.js v2).
 *
 * v22 - SMOOTH-P3a. Carry on later, and coming back.
 *
 *   The exit sheet gains "Carry on later": the session is kept exactly
 *   where it is and the person goes Home, where a Carry-on card brings
 *   them back to the same exercise and set. The place is checkpointed on
 *   every exercise and set through session-resume.js (the one resumable
 *   slot, 3-hour expiry), so a phone call that kills the app mid-session
 *   comes back to the same place too -- not to the old proposal.
 *   Finishing, ending and leaving without saving all clear it.
 *
 * v21 - SMOOTH-P2e, REST-1. Graeme, 28 Sep: "the suggestion should be
 *   given." After each set but the last, the screen suggests the rest
 *   the exercise carries ("Rest about 60s") with a quiet count that ends
 *   on "Ready when you are." It NEVER moves the person on, never counts
 *   past zero and never records anything: the next set is one tap away
 *   the whole time. The 16 Sep steer holds -- a countdown is one wrong
 *   decision from a shame mechanic -- so this one only ever suggests.
 *   Only the end is announced (polite); a live region that ticks every
 *   second would talk over the person the whole rest.
 *
 * v20 - SMOOTH-P2c. One screen per exercise. Spec 4.4.
 *
 *   Each exercise was four pages (Decide, Watch out, Do, Note): three
 *   taps before the first rep, the full hurt-and-ache text open at the
 *   top of every one, a raw category id ("chest-stretch") and a points
 *   badge under the name. Graeme, 27 Sep: "too many pages before you get
 *   to the exercises... It feels rough."
 *
 *   Now: the section, the name, then WHAT TO DO -- 3 × 10 and "Set 1 of
 *   3", or the clock -- with last time's numbers already in the log. The
 *   card below keeps the safety order on one page (exercise-card.js v12).
 *   A counted exercise is one tap per set; a timed one is Start, and the
 *   clock ends it. When it is done, the same screen offers "How was
 *   that?" and "Next: <name>" -- no page turn.
 *
 *   Taps to the first rep, from the plan: one. Was three.
 *
 *   EXIT is one sheet with three choices, and every one lands on Home or
 *   the finish: Keep going · End it here and save · Leave without
 *   saving. "Carry on later" joins it with Home's Carry-on card in P3 --
 *   offering it before Home can show it would be a promise with nothing
 *   behind it.
 *
 * v19 - TIMER-2. The clock belongs to the exercise, not to lifting.
 *
 *   Lat Pulldown, in Graeme's own gym session on v496: three sets of ten,
 *   and a four-minute countdown labelled "Set 1 of 3". He started it
 *   thinking it timed one set. Nothing advanced that label -- there was no
 *   set two -- and when it ran out the card moved to reflection with two
 *   sets still to do. The sets-and-reps display he should have seen lived
 *   in a branch resolveTiming() made unreachable, so he never saw "10
 *   reps" at all.
 *
 *   Now: a counted exercise shows 3 x 10, the rest between sets, and a set
 *   counter that MOVES on a tap of "Set 1 done". The last set opens
 *   reflection, because that is the end of the exercise. "Set 1 of 3" as a
 *   timer label is gone rather than corrected -- with no clock there is
 *   nothing for it to count. A timed exercise is untouched.
 *
 *   THE LAST SET HAS ITS OWN BUTTON. An earlier draft hid the control once
 *   the final set was reached, so three sets took two taps and the third
 *   ended some other way.
 *
 * v18 - TIMER-1. The one automatic move in a session now says so.
 *   Device pass, task 7.
 *
 *   The countdown reaching zero moves the person from DO to NOTE. CARD-3
 *   calls it "the one automatic forward move; every other transition is a
 *   tap" -- and it announced nothing. Focus did not move, both live
 *   regions on the page it lands on were empty, and the only signal was
 *   navigator.vibrate, which Safari on iOS does not implement. On an
 *   iPhone there was no signal of any kind.
 *
 *   It changes the screen under somebody who, mid-exercise, is by
 *   definition not looking at it. That is what a timer is for.
 *
 *   WCAG 2.2 AA 4.1.3 Status Messages. role="status", and a visible form
 *   in workout.css v13 -- a message only screen readers get is half a
 *   fix, because the person who put the phone on the mat gets nothing
 *   either.
 *
 *   ONLY when the countdown did it. Somebody who tapped Done already
 *   knows the exercise is over, and a live region that fires when nothing
 *   surprising happened trains people to ignore it. Announcing on every
 *   arrival would be worse than the defect, so verify-timer1 test 2
 *   asserts the silence.
 *
 *   cleanupWorkout() clears the flag. The first version did not, and the
 *   gate caught it: finish a countdown, leave, start a NEW session, and
 *   the first note page announced a timer that never ran, about an
 *   exercise from a session already abandoned.
 *
 * 08 Sep 2026 v17
 *
 * v17 - ROLE-1. The badge above the exercise name printed the word
 *   UNDEFINED on every card of every coach-built session.
 *
 *   formatRole() ended `roles[role] || role`, which echoes its own input
 *   when the lookup misses. For an absent role that input is undefined,
 *   and a template literal stringifies it. A fallthrough that returns
 *   what it was given cannot fail safely.
 *
 *   Two changes, and they are not the same change. formatRole() now
 *   returns "" for anything it does not recognise, which is what stops an
 *   internal token -- "cardio-warmup", the shape already sitting in
 *   `category` on these objects -- being uppercased into a badge. And the
 *   badge ELEMENT is not emitted at all when there is no label, because
 *   emptying its text alone would leave a styled pill whose aria-label
 *   reads "Exercise type: ": an announced control with nothing in it,
 *   worse for a screen reader than no badge.
 *
 *   The real fix is the stamp in session-builder.js v47. This is the
 *   floor underneath it, for sessions cached before today and for any
 *   future builder that forgets.
 *
 * 31 Aug 2026 v16
 *
 * v16 - CARD-3. Three pages, not three tabs. This is the view the page
 *   flow was proven on before it spread.
 *
 *   WHAT MOVED. The timer/reps target and the YouTube link came OFF the
 *   top of the view and into DO, so they arrive with the thing they
 *   describe instead of ahead of the decision to attempt it. The log
 *   block, the grounding moment and the feedback control are NOTE, in
 *   that order -- feedback last, as the safety ordering requires.
 *
 *   THE ACTION BAR IS STILL THIS VIEW'S, and every existing id is
 *   unchanged: timer-toggle-btn, complete-exercise-btn,
 *   skip-exercise-btn. What changed is WHICH of them renders on which
 *   page. Skip renders on DECIDE and nowhere else -- you decide before
 *   you start, not halfway through. Two ids are new, wo-begin-btn and
 *   wo-done-btn, because DECIDE and DO each needed a forward control
 *   that did not exist when the whole card was one screen.
 *
 *   LANDING ON DO DOES NOT START THE CLOCK. wo-begin-btn moves the page
 *   and nothing else. Auto-starting would punish reading, which is the
 *   opposite of why the hazards were moved into view.
 *
 *   PAGE STATE IS EPHEMERAL and lives here beside currentExerciseIndex,
 *   never in the store. It resets on every exercise change and on
 *   cleanup, so nobody lands on NOTE for a movement they have not done.
 *
 *   "Hold" IS GONE FROM THE SINGLE-SET LABEL. TIME-2 established that
 *   `duration` means both "hold this long" and "spend about this long
 *   doing reps" -- inchworm carries duration 90 and no reps field at
 *   all. The circle now reads "About this long", which is true of both
 *   until TIME-2 gives us a real held-vs-repped distinction.
 *
 * 31 Aug 2026 v15
 *
 * v15 - CARD-2. Three-layer card. Feedback control, grounding moment and
 *   session notes move into the After layer.
 *
 * 31 Aug 2026 v14
 *
 * v14 - TIME-1. Timing resolves through js/exercise-timing.js rather than
 *   reading exercise.duration directly. No behaviour change here -- this
 *   view was already the one doing it right. It moves onto the shared
 *   resolver so there is one answer to "does this need a clock" rather
 *   than three.
 *
 * 29 Aug 2026 v13
 *
 * v13 - CARD-1. The exercise card moves out of this file and into the
 *   shared renderer, js/exercise-card.js. Two things change with it.
 *
 *   ORDER. bodyCaution rendered below "How heavy" and watchOut rendered
 *   below the feedback control -- the one personalised safety line in
 *   the card sat roughly two screenfuls down, and the hazard list sat
 *   beneath a control most people read as the end of the card. Caution
 *   is now first, hazards precede the explanatory text, feedback is
 *   last.
 *
 *   DENSITY. Sections size themselves by phase and familiarity. Nothing
 *   safety-bearing is ever collapsed, and no history count is ever
 *   rendered (P4). See the header of exercise-card.js.
 *
 *   This file also starts rendering exercise.cues, which it never did --
 *   core-session, yoga-session and morning-session already did, and the
 *   difference was drift, not a decision.
 *
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
import { isCardioMachine, getSwapCandidates } from "../data/exercises/index.js";
import { renderFeedbackControl, attachFeedbackEvents } from "../exercise-feedback.js";
import { renderExerciseCard, attachCardEvents } from "../exercise-card.js";
import { isGateDue, renderSafetyGate, attachSafetyGate } from "../safety-gate.js";
import { resolveTiming, formatTime } from "../exercise-timing.js";
import { renderLogBlock, attachLogEvents, scrollToTop } from "../session-log.js";
import { selectMoment, recordMomentShown, dismissMoment } from "../data/grounding-moments.js";
import { checkinData }   from "../data/checkin.js";
import { recordSession } from "../data/programmeEngine.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
import { checkpointSession, getResumableSession, clearCheckpoint } from "../session-resume.js";
import { isPremium }     from "../auth.js";

export const centered = false;

let currentExerciseIndex = 0;
// P18. The move just skipped, waiting for "how often should it come up?".
// finishAfterOffer: it was the last move, so answering ends the session.
let pendingSkipOffer = null;
let finishAfterOffer = false;
// P21 / SWAP-0. The machine-swap panel on the current card.
let swapPanelOpen = false;
let timerInterval = null;
let timeRemaining = 0;
let timerStarted = false; // Timer doesn't start until user taps Start

// SMOOTH-P2c. Replaces CARD-3's page ("decide" | "watch" | "do" |
// "note"). One screen now; the only state is whether this exercise is
// finished, which decides what the actions offer. Ephemeral, reset on
// every exercise change, never stored -- same reasons as before.
let exerciseDone = false;

// SMOOTH-P2e, REST-1. When the suggested rest ends (ms since epoch), or
// null when no rest is running. Never stored.
let restUntil = null;
let restInterval = null;

function _clearRest() {
  if (restInterval) clearInterval(restInterval);
  restInterval = null;
  restUntil = null;
}

function _restLeft() {
  return restUntil ? Math.max(0, Math.ceil((restUntil - Date.now()) / 1000)) : 0;
}

// SMOOTH-P2c. Move focus to the new exercise's name after a change, so a
// screen reader starts at the top of the new card (2.4.3).
let focusName = false;

// TIMER-2, 12 Sep 2026. Which set the person is on, 1-based. Only ever
// read on a counted exercise -- a stretch has sets in the data too, but
// nobody counts their way through a stretch, so the clock still owns it.
let currentSet = 1;

/**
 * TIMER-1, 08 Sep 2026. True only when the COUNTDOWN moved the person to
 * the note page, never when they tapped Done themselves.
 *
 * The clock running out is the one automatic forward move in the whole
 * session (CARD-3 says so at the call site). It changes the screen under
 * somebody who, mid-exercise, is by definition not looking at it -- and
 * announced nothing. Focus did not move, and the only live regions on
 * the page it lands on are empty. The single signal was
 * navigator.vibrate, which Safari on iOS does not implement at all, so
 * on an iPhone there was no signal of any kind.
 *
 * WCAG 2.2 AA 4.1.3 Status Messages: a change of content that tells the
 * person something, given no focus and no role, cannot be presented by
 * assistive technology.
 *
 * Only when the timer did it. Somebody who tapped "Done" already knows
 * the exercise is over, and announcing it to them would be noise.
 */
let finishedByTimer = false;

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

// SMOOTH-P3a. Checked once per session, on the first render: a matching
// checkpoint puts the person back where they left off.
let _resumeChecked = false;

function _restoreFromCheckpoint(workout) {
  if (_resumeChecked || !workout || !Array.isArray(workout.exercises)) return;
  _resumeChecked = true;
  const cp = getResumableSession("workout");
  // P4. Not the checkpointed session, so a new one: whatever progress an
  // unfinished session left behind is not this session's.
  if (!cp || cp.sessionId !== _sessionKey(workout)) {
    store.set("workoutProgress", null);
    return;
  }
  const i = Number(cp.index);
  if (Number.isInteger(i) && i >= 0 && i < workout.exercises.length) {
    currentExerciseIndex = i;
    currentSet = Math.max(1, Number(cp.set) || 1);
  }
}

/** This session and no other: the id plus when it was built (saved sessions share ids). */
function _sessionKey(workout) {
  return `${workout?.id || workout?.name || "session"}|${store.get("generatedSession")?.builtAt || ""}`;
}

function _checkpoint(workout) {
  if (!workout) return;
  checkpointSession("workout", {
    sessionId: _sessionKey(workout),
    index:     currentExerciseIndex,
    set:       currentSet,
    name:      workout.title || workout.name || "Your session",
  });
}

export function render() {
  const workout = _getWorkout();
  _restoreFromCheckpoint(workout);

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

  // SAFETY-GATE, 15 Sep 2026. Before exercise 1 and nowhere else.
  //
  // It sits ABOVE the card layer on purpose. CARD-5 collapsed the
  // hurt-and-ache text on the cards because forty renders of it in one
  // session had turned it into furniture; this is where it is read open,
  // once per occasion, with the acknowledgement recorded.
  //
  // isGateDue() is false the instant recordAcknowledgement() writes, so
  // no extra view state is needed to stop it reappearing -- the store IS
  // the state, and a second source of truth here is how a gate ends up
  // firing twice or not at all.
  if (currentExerciseIndex === 0 && isGateDue()) {
    return `<div class="view workout-view">${renderSafetyGate()}</div>`;
  }

  // P18. The last move was skipped: ask, then the answer finishes.
  if (finishAfterOffer && pendingSkipOffer) {
    return `
    <div class="view workout-view wo-flow">
      <div class="workout-header">
        <button class="btn btn-ghost" id="exit-workout-btn" aria-label="Exit workout">\u2715 Exit</button>
      </div>
      ${_renderSkipOffer()}
    </div>`;
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

  const next = workout.exercises[currentExerciseIndex + 1] || null;
  const sectionLabel = SECTION_LABELS[exercise.section || exercise.role] || "";
  const timed = !!resolveTiming(exercise).seconds;

  return `
    <div class="view workout-view wo-flow">
      <div class="workout-header">
        <button class="btn btn-ghost" id="exit-workout-btn" aria-label="Exit workout">\u2715 Exit</button>
        <div class="workout-progress-info">
          <span>${currentExerciseIndex + 1} of ${workout.exercises.length}</span>
        </div>
      </div>

      <div class="workout-progress-bar" role="progressbar" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100" aria-label="Workout progress: exercise ${currentExerciseIndex + 1} of ${workout.exercises.length}">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>

      ${_renderSkipOffer()}

      <div class="exercise-display">
        ${sectionLabel ? `<p class="wo-flow__section">${sectionLabel}</p>` : ""}
        <h1 class="exercise-name" id="wo-exercise-name" tabindex="-1">${exercise.name}</h1>

        <div class="exercise-target">
          ${renderExerciseTarget(exercise)}
        </div>

        ${_renderSwapControl(exercise)}

        ${finishedByTimer ? `
          <p class="xcard-timer-done" role="status">That is the time up on ${exercise.name}.</p>
        ` : ""}

        ${restUntil && !exerciseDone ? `
          <div class="wo-rest" role="group" aria-labelledby="wo-rest-label">
            <p class="wo-rest__label" id="wo-rest-label">Rest about ${Number(exercise.rest) || 60}s</p>
            <p class="wo-rest__count" id="wo-rest-count" aria-hidden="true"${_restLeft() === 0 ? " hidden" : ""}>${formatTime(_restLeft())}</p>
            <p class="wo-rest__ready" id="wo-rest-ready" role="status" aria-live="polite">${_restLeft() === 0 ? "Ready when you are." : ""}</p>
          </div>
        ` : ""}

        ${renderLogBlock(exercise, `wo-log-${currentExerciseIndex}`)}

        ${renderExerciseCard(exercise, {
          idPrefix: `wo-${currentExerciseIndex}`,
          layout:   "flow",
          lastTime: "",
          doSlot: `
            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtube || (exercise.name + " exercise form"))}"
               target="_blank"
               rel="noopener noreferrer"
               class="youtube-link"
               aria-label="Watch how to do ${exercise.name} on YouTube (opens in new tab)">
              <span class="youtube-icon" aria-hidden="true">\u25B6\uFE0F</span>
              Watch how to do this
            </a>`
        })}

        ${exerciseDone ? `
          <div class="wo-flow__done" role="group" aria-label="${exercise.name} done">
            ${renderFeedbackControl(exercise)}
            ${groundingMoment ? `
              <aside class="gmoment" aria-label="Something to notice">
                <p class="gmoment__text">${groundingMoment.text}</p>
                <button class="gmoment__dismiss" id="gmoment-dismiss"
                        aria-label="Do not show this one again">Not for me</button>
              </aside>
            ` : ""}
          </div>
        ` : ""}
      </div>

      <!-- SMOOTH-P2c. What the thumb needs, and nothing else. -->
      <div class="workout-actions">
        ${exerciseDone ? `
          <button class="btn btn-primary btn-large btn-full" id="complete-exercise-btn">
            ${isLastExercise ? "Finish the session" : `Next: ${next.name} \u2192`}
          </button>
        ` : `
          ${timed ? `
            <button class="btn btn-large btn-full ${timerStarted ? "btn-secondary" : "btn-accent"}" id="timer-toggle-btn" aria-live="polite">
              ${!timerStarted ? "\u25B6 Start" : (timerInterval ? "\u23F8 Pause" : "\u25B6 Resume")}
            </button>
          ` : ""}
          ${_setsRemaining(exercise) ? `
            <button class="btn btn-accent btn-large btn-full" id="wo-set-done-btn">
              Set ${currentSet} done
            </button>
          ` : ""}
          <!-- Always a way to say "done": a clock that has not finished
               must not trap somebody who has, and neither must a set
               counter. -->
          <button class="btn ${timed || _setsRemaining(exercise) ? "btn-secondary" : "btn-primary btn-large"} btn-full" id="wo-done-btn">
            ${_setsRemaining(exercise) ? "Finish this one" : "Done"}
          </button>
          <button class="btn btn-ghost btn-small" id="skip-exercise-btn">Skip this one</button>
        `}
      </div>
    </div>
  `;
}

/**
 * P21 / SWAP-0, from the session screen. Nothing at all unless this is a
 * cardio machine WITH another machine the person has: an affordance that
 * opens onto an empty list teaches people not to trust the affordances.
 */
function _escSwap(t) {
  return String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function _renderSwapControl(exercise) {
  if (!exercise || !isCardioMachine(exercise)) return "";
  const options = getSwapCandidates(exercise, store.get("equipment") || []);
  if (options.length === 0) return "";
  if (!swapPanelOpen) {
    return `
      <div class="exercise-swap">
        <button type="button" class="btn btn-ghost btn-small exercise-swap__btn" id="wo-swap-btn"
                aria-expanded="false" aria-controls="wo-swap-panel">Can't get on this? Swap it</button>
      </div>`;
  }
  return `
    <div class="exercise-swap">
      <button type="button" class="btn btn-ghost btn-small exercise-swap__btn" id="wo-swap-btn"
              aria-expanded="true" aria-controls="wo-swap-panel">Never mind, keep ${_escSwap(exercise.name)}</button>
      <div class="exercise-swap__panel card" id="wo-swap-panel" role="group"
           aria-label="Choose something else instead of ${_escSwap(exercise.name)}">
        <p class="coach-voice exercise-swap__intro">No problem \u2014 pick whatever's free.</p>
        <ul class="exercise-swap__list">
          ${options.map(opt => `
            <li>
              <button type="button" class="exercise-swap__option" data-swap-to="${_escSwap(opt.id)}">
                <span class="exercise-swap__option-name">${_escSwap(opt.name)}</span>
                <span class="exercise-swap__option-meta text-xs text-muted">${opt.duration ? Math.round(opt.duration / 60) + " min" : ""}</span>
              </button>
            </li>`).join("")}
        </ul>
      </div>
    </div>`;
}

/**
 * The swapped-in machine is the whole library entry (its own coaching,
 * watch-outs and timer); section and reps are carried across, so the
 * session keeps its shape -- the person swapped a machine, not a plan.
 */
function _applySwap(toId) {
  const generated = store.get("generatedSession");
  const list = generated?.session?.exercises;
  if (!Array.isArray(list)) return;
  const current = list[currentExerciseIndex];
  const chosen = getSwapCandidates(current, store.get("equipment") || []).find(o => o.id === toId);
  if (!chosen) return;
  list[currentExerciseIndex] = { ...chosen, section: current.section, reps: current.reps ?? chosen.reps };
  store.set("generatedSession", generated);
  swapPanelOpen = false;
  resetTimer();
  router.navigate("workout");
}

/**
 * P18. The core session's skip offer, in this player: a binary instruction
 * to the app, not a rating (skip/dislike spec section 6). Reversible in
 * Settings ("Exercises you asked to change").
 */
function _renderSkipOffer() {
  if (!pendingSkipOffer) return "";
  const name = String(pendingSkipOffer.name || "that one")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return `
    <div class="cs-skip-offer" role="group" aria-label="Tell the coach about skipping ${name}">
      <p class="cs-skip-offer__line">Want me to change how often ${name} comes up?</p>
      <div class="cs-skip-offer__actions">
        <button class="btn btn-ghost btn-small" data-skip-pref="less" aria-label="Offer ${name} less often">Less often</button>
        <button class="btn btn-ghost btn-small" data-skip-pref="avoid" aria-label="Never offer ${name} again">Not again</button>
        <button class="btn btn-ghost btn-small" data-skip-pref="dismiss" aria-label="Leave it as it is">Leave it</button>
      </div>
    </div>`;
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

/**
 * TIMER-2. Three shapes, and the data already says which.
 *
 * The old first branch showed a countdown for anything with a `duration`,
 * which is everything -- and labelled it "Set 1 of N" when the entry had
 * sets. Nothing advanced that label; there was no set two. Graeme met it
 * on Lat Pulldown: a four-minute clock for three sets of ten, and the
 * reflection page when it ran out.
 *
 * Now: a counted exercise gets its sets and reps and a set counter that
 * MOVES, a timed one gets a clock of the right length, and a distance
 * gets the distance. "Set 1 of 3" is gone rather than made accurate --
 * with no clock there is nothing for it to count down.
 */
/**
 * TIMER-2. True when this exercise counts sets AND there are sets left.
 *
 * Counted only. A stretch carries `sets: 2` in the data too, but nobody
 * taps their way through a stretch -- the clock owns those, exactly as
 * before.
 */
function _setsRemaining(exercise) {
  const t = resolveTiming(exercise);
  if (t.shape !== "counted") return false;
  const sets = exercise.sets || 1;
  // <= and not <: the LAST set gets a "Set 3 done" button too. An earlier
  // draft hid it on the final set, so the person tapped "Set 1 done",
  // "Set 2 done", and then had to work out that the third set ended some
  // other way. Three sets, three taps.
  return sets > 1 && currentSet <= sets;
}

function renderExerciseTarget(exercise) {
  const timing = resolveTiming(exercise);

  if (timing.seconds) {
    const sets = exercise.sets || 1;
    return `
      <div class="timer-display">
        <div class="timer-circle">
          <span class="timer-value" id="timer-display">${formatTime(timeRemaining || timing.seconds)}</span>
          <span class="timer-label">${sets > 1 ? `${sets} sets, this long each` : "About this long"}</span>
        </div>
      </div>
    `;
  } else if (exercise.reps && timing.shape === "distance") {
    const sets = exercise.sets || 1;
    return `
      <div class="reps-display">
        <div class="reps-info">
          <span class="reps-value">${sets} \u00D7 ${exercise.reps}</span>
          <span class="reps-label">sets</span>
        </div>
        ${exercise.rest ? `
          <div class="rest-info">
            <span class="rest-value">${exercise.rest}s</span>
            <span class="rest-label">rest between sets</span>
          </div>
        ` : ""}
      </div>
    `;
  } else if (exercise.reps) {
    // SMOOTH-P2c. One big line -- "3 × 10" -- and the words under it.
    // "3 × 10 each side" wrapped to four lines in a three-column row on a
    // phone; the number is what is read at arm's length, the rest is
    // read once.
    const sets = exercise.sets || 3;
    const reps = String(exercise.reps || 10);
    const m    = reps.match(/^\s*([\d\u2013\-]+)\s*(.*)$/);
    const big  = m ? m[1] : reps;
    const tail = m ? m[2] : "";
    const sub  = [tail, exercise.rest ? `${exercise.rest}s rest between sets` : ""].filter(Boolean).join(" \u00B7 ");
    return `
      <div class="reps-display wo-target">
        <p class="reps-value">${sets} \u00D7 ${big}</p>
        ${sub ? `<p class="reps-label">${sub}</p>` : ""}
        ${sets > 1 ? `
          <p class="set-progress" role="status">
            <span class="set-progress-value">Set ${Math.min(currentSet, sets)} of ${sets}</span>
          </p>
        ` : ""}
      </div>
    `;
  }
  return "<p>Complete this exercise at your own pace.</p>";
}

// TIME-1. formatTime is now js/exercise-timing.js -- there were three
// identical copies, and the shared one also floors null to 0:00 rather
// than rendering "NaN:NaN".

// ROLE-1's formatRole() is retired with the badge (SMOOTH-P2c). Its rule
// survives in SECTION_LABELS: a lookup that misses prints NOTHING, never
// its own input -- verify-role1 tests 3 and 4 hold it.
// SMOOTH-P2c. Plain words, no emoji, no pill: the badge read "COOL
// DOWN" in blue on navy (below 3:1). The section is context, not an
// instruction, so it is a quiet label above the name.
const SECTION_LABELS = { warmup: "Warm up", main: "Main", cooldown: "Cool down",
                         accessory: "Main", finisher: "Main" };

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

  // SAFETY-GATE. Bound before the session controls, and returns early:
  // when the gate is up there is no card, no timer and no log block to
  // wire, and everything below would be binding to elements that are not
  // on the screen.
  if (currentExerciseIndex === 0 && isGateDue()) {
    attachSafetyGate(document.getElementById("app") || document, {
      surface: "workout",
      onAcknowledge: () => router.navigate("workout"),
      onLeave:       () => router.navigate("today"),
    });
    return;
  }

  // Latch the session clock once, on first mount with a real workout.
  if (sessionStartTime === null) sessionStartTime = Date.now();
  // SMOOTH-P3a. Where they are, every time the screen changes.
  _checkpoint(workout);

  // LOG-1. Re-wired on every mount because the view re-renders per
  // exercise; attachLogEvents() guards against double-binding itself.
  // The id prefix carries the exercise index so two cards can never
  // collide, and so the Save handler cannot write one exercise's numbers
  // onto another.
  if (workout?.exercises?.[currentExerciseIndex]) {
    attachLogEvents(workout.exercises[currentExerciseIndex], `wo-log-${currentExerciseIndex}`);
    // FEED-1. Self-painting, so no re-render hook is needed.
    attachFeedbackEvents(workout.exercises[currentExerciseIndex]);
    attachCardEvents(document.getElementById("app") || document);
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

  const _t = resolveTiming(exercise).seconds;
  if (_t) {
    timeRemaining = _t;
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

  // P21 / SWAP-0. Toggle, then the choice.
  document.getElementById("wo-swap-btn")?.addEventListener("click", () => {
    swapPanelOpen = !swapPanelOpen;
    router.navigate("workout");
    // Focus follows what just changed, or a keyboard or screen-reader
    // user is left on a relabelled button with no idea anything opened.
    if (swapPanelOpen) document.querySelector(".exercise-swap__option")?.focus();
    else document.getElementById("wo-swap-btn")?.focus();
  });
  document.querySelectorAll("[data-swap-to]").forEach(btn => {
    btn.addEventListener("click", () => _applySwap(btn.getAttribute("data-swap-to")));
  });

  // P18. The answer to "how often should it come up?".
  document.querySelectorAll("[data-skip-pref]").forEach(btn => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.skipPref;
      const ex = pendingSkipOffer;
      const finish = finishAfterOffer;
      pendingSkipOffer = null; finishAfterOffer = false;
      if (ex && ex.id && (choice === "less" || choice === "avoid")) {
        store.setExercisePreference(ex.id, choice, "skip");
      }
      if (finish) completeWorkout();
      else router.navigate("workout");
    });
  });

  // TIMER-2. Each tap is one set. The last set ends the exercise.
  document.getElementById("wo-set-done-btn")?.addEventListener("click", () => {
    const sets = exercise.sets || 1;
    _clearRest();
    if (currentSet < sets) {
      currentSet++;
      // REST-1. A suggestion, with its own clock -- see the header.
      restUntil = Date.now() + (Number(exercise.rest) || 60) * 1000;
    } else {
      exerciseDone = true;   // the last set IS the end of the exercise
    }
    router.navigate("workout");
  });

  // REST-1. The quiet count. Updates the number only; announces once, at
  // the end, and then stops. Nothing here navigates.
  if (restUntil && !restInterval && document.getElementById("wo-rest-count")) {
    restInterval = setInterval(() => {
      const left  = _restLeft();
      const count = document.getElementById("wo-rest-count");
      const ready = document.getElementById("wo-rest-ready");
      if (!count || !ready) { _clearRest(); return; }
      count.textContent = formatTime(left);
      if (left === 0) {
        clearInterval(restInterval);
        restInterval = null;
        count.hidden = true;
        ready.textContent = "Ready when you are.";
      }
    }, 1000);
  }

  document.getElementById("wo-done-btn")?.addEventListener("click", () => {
    pauseTimer();
    _clearRest();
    exerciseDone = true;
    router.navigate("workout");
  });

  // SMOOTH-P2c. A new exercise starts at its name, for eyes and for
  // screen readers alike.
  if (focusName) {
    focusName = false;
    document.getElementById("wo-exercise-name")?.focus({ preventScroll: true });
  }
}

// ── Exit confirmation overlay ──────────────────────────────────────────────
// Shown when user taps Exit during an active workout. Replaces the old
// browser confirm() with a coach-voiced in-app card, matching
// core-session.js/yoga-session.js's confirmed-working pattern (BUILD-3,
// 23 Jul 2026). Added 30 Jul 2026 as part of the gym exit-guard gap fix.

function showExitConfirm() {
  if (document.getElementById("session-exit-overlay")) return;
  const opener = document.activeElement;
  const overlay = document.createElement("div");
  overlay.className = "session-exit-overlay";
  overlay.id        = "session-exit-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "exit-sheet-title");
  // SMOOTH-P2c / P3a. One sheet, four choices, every one lands somewhere
  // known: back in the session, on the finish screen, or on Home.
  // "Carry on later" joins in P3 with the Home card that makes it true.
  // P4: and only where that card is -- the Plan. It keeps for 3 hours
  // (session-resume.js STALE_MS), and says so.
  //
  // EXIT-1 (12 Aug) still holds: leaving without saving is always
  // offered, at the smallest visual weight -- available, not encouraged.
  overlay.innerHTML = `
    <div class="session-exit-card">
      <h2 class="session-exit-title" id="exit-sheet-title">Leave this session?</h2>
      <div class="session-exit-actions">
        <button class="btn btn-primary btn-full" id="exit-confirm-stay">Keep going</button>
        ${isPremium() ? `<button class="btn btn-secondary btn-full" id="exit-confirm-later" aria-describedby="exit-later-note">Carry on later</button>
        <p class="text-muted text-sm" id="exit-later-note">It keeps for 3 hours.</p>` : ""}
        <button class="btn btn-secondary btn-full" id="exit-confirm-leave">
          End it here and save
        </button>
        <button class="btn btn-ghost btn-full session-exit-discard" id="exit-confirm-discard">
          Leave without saving
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  const stay = document.getElementById("exit-confirm-stay");
  stay?.focus();

  const close = () => { overlay.remove(); opener?.focus?.(); };

  // Focus stays in the sheet (2.1.2 / 2.4.3); Escape is Keep going.
  overlay.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    const f = [...overlay.querySelectorAll("button")];
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });

  stay?.addEventListener("click", close);

  // SMOOTH-P3a. Keep everything, go Home. Nothing is saved as done and
  // nothing is cleared; Home shows the Carry-on card from the checkpoint.
  document.getElementById("exit-confirm-later")?.addEventListener("click", () => {
    overlay.remove();
    pauseTimer();
    _clearRest();
    _checkpoint(_getWorkout());
    dismountSessionGuard();
    router.navigate("today");
  });

  // Saves what was done and goes to the finish screen.
  document.getElementById("exit-confirm-leave")?.addEventListener("click", () => {
    overlay.remove();
    savePartialSession();
    cleanupWorkout();
    router.navigate("reflect");
  });

  // EXIT-1. Discard: leave WITHOUT writing a partial entry. Home records
  // the decline itself (EXIT-HOME), so it does not bounce back here.
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
      timerInterval = null;
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
      // CARD-3. The clock running out IS the end of the exercise, so
      // NOTE is where the person now is. This is the one automatic
      // forward move; every other transition is a tap.
      // TIMER-1. Which is exactly why it has to say so.
      finishedByTimer = true;
      exerciseDone = true;
      router.navigate("workout");
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
  pendingSkipOffer = null;   // P18: not answered is "leave it"
  const exercise = workout.exercises[currentExerciseIndex];

  const completed = store.get("workoutProgress") || [];
  completed.push({
    exerciseId:  exercise.id,
    credits:     exercise.credits,
    // SMOOTH-P2d. What the finish screen counts ("6 sets").
    sets:        Number(exercise.sets) || 1,
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
  const skipped = workout.exercises[currentExerciseIndex] || null;

  if (currentExerciseIndex >= workout.exercises.length - 1) {
    // P18. Ask before finishing; the answer finishes (see onMount).
    if (skipped) {
      pendingSkipOffer = skipped; finishAfterOffer = true;
      pauseTimer();
      router.navigate("workout");
      return;
    }
    completeWorkout();
  } else {
    pendingSkipOffer = skipped;   // P18: asked on the next card
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
  // TIMER-2. A new exercise starts at set one. Without this, set 3 of the
  // last exercise carries in and the counter opens on the final set.
  currentSet    = 1;
  finishedByTimer = false;   // TIMER-1. A new exercise inherits nothing.
  swapPanelOpen   = false;   // P21. Nor an open swap panel.
  // A new exercise starts unfinished, at its name. Both advance paths
  // (complete and skip) come through here.
  exerciseDone = false;
  focusName    = true;
  _clearRest();   // REST-1. A new exercise starts without a rest.
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
/**
 * SMOOTH-P3a. "Finish here" on Home's Carry-on card: save what was done
 * as a part-session, exactly as the exit sheet's "End it here and save"
 * does -- the same two functions, not a copy -- and go to the finish.
 */
export function finishFromHome() {
  const workout = _getWorkout();
  if (!workout) { clearCheckpoint(); router.navigate("today"); return; }
  _restoreFromCheckpoint(workout);
  savePartialSession();
  cleanupWorkout();
  router.navigate("reflect");
}

function savePartialSession() {
  const workout = _getWorkout();
  if (!workout) return;

  const progress       = [...(store.get("workoutProgress") || [])];
  // SMOOTH-P2d. An exercise finished but not yet moved on from counts:
  // the sets were done, the person just had not tapped Next.
  const current = workout.exercises[currentExerciseIndex];
  if (exerciseDone && current && !progress.some(p => p.exerciseId === current.id)) {
    progress.push({ exerciseId: current.id, credits: current.credits, sets: Number(current.sets) || 1 });
  }
  const creditsEarned  = progress.reduce((sum, e) => sum + (e.credits || 0), 0);
  const nowIso         = new Date().toISOString();

  _handOff(nowIso);   // P2: before the log, so the log describes this session
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
    setsDone:       progress.reduce((n, e) => n + (e.sets || 1), 0),
    // SAVE-HANDOFF (work list 7). What was done, so the finish screen can
    // tell this was today's plan and offer to keep it. A partial entry's
    // ids are not routed into exerciseHistory (store.logActivity).
    exerciseIds:    progress.map(p => p.exerciseId).filter(Boolean),
    creditsEarned
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }
}

/**
 * SAVE-HANDOFF, work list 7. The finish screen offers "Keep this one?"
 * from lastFinishedSession, because cleanupWorkout() clears
 * generatedSession before it gets there -- so after a coach or builder
 * session the offer never appeared. Written on both ways of finishing
 * (all done, or ending part-way and saving); never on leaving without
 * saving. The whole plan is what is kept: it is a session to repeat.
 */
function _handOff(atIso) {
  const w = _getWorkout();
  if (w && Array.isArray(w.exercises) && w.exercises.length) {
    store.set("lastFinishedSession", { at: atIso, session: w });
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
  _handOff(nowIso);   // SAVE-HANDOFF, and P2: before the log (see v24)
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
    exerciseIds:  (workout.exercises || []).map(e => e.id).filter(Boolean),
    // P19. Where each was done, so a familiar move keeps its section.
    // Forwarded to exerciseHistory by logActivity(); not stored on the entry.
    exerciseSections: Object.fromEntries((workout.exercises || []).filter(e => e && e.id)
      .map(e => [e.id, e.section || e.role || "main"])),
    // SMOOTH-P2d. For "That's today done": what was actually done.
    exercisesCount: progress.length,
    setsDone:       progress.reduce((n, e) => n + (e.sets || 1), 0)
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
  clearCheckpoint();        // SMOOTH-P3a. Finished, ended or left: nothing to carry on.
  _resumeChecked = false;
  pauseTimer();
  sessionStartTime = null;
  currentExerciseIndex = 0;
  pendingSkipOffer = null; finishAfterOffer = false;   // P18: never carries over
  timeRemaining = 0;
  timerStarted  = false;
  exerciseDone = false;   // Index resets here, so this must too.
  _clearRest();           // REST-1. And nothing keeps counting after they leave.
  // TIMER-1. And so must this. Without it, finishing a countdown, leaving,
  // and starting a NEW session showed "that is the time up on ..." on the
  // first exercise the person reached the note page for -- announcing a
  // timer that never ran, about an exercise from a session they left.
  // Every other piece of ephemeral state on this view is cleared here;
  // adding one and not adding it to this list is how the next one breaks.
  finishedByTimer = false;
  // v3 — clears generatedSession back to its store.js default shape,
  // rather than setting the never-written activeWorkout to null.
  store.set("generatedSession", { session: null, builtAt: null, inputs: {} });
  store.set("workoutProgress", null);
}
