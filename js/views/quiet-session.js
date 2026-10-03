/**
 * quiet-session.js - Something Quieter View
 *
 * 01 Oct 2026 v9 - BUNDLE-TRUE. This route has no journal of its own any more.
 *   Arriving in journal mode (an old link) goes to the real journal
 *   (journal-entry), which asks for the health consent and shows the support
 *   lines; the old prompts, textareas and their save are deleted, so nothing
 *   in this file writes journalEntries.
 *
 * 01 Oct 2026 v8 - PT-4 QUIET-JOURNAL. The Journaling card opens the real
 *   journal (journal-entry). Its own save replaced the journalEntries array
 *   with an object keyed by date, and the next load then emptied every
 *   entry. It was reachable: Library > a quiet practice > Back >
 *   Journaling. saveJournalEntry() now adds to the array, should anything
 *   reach it.
 *
 * 28 Sep 2026 v7 - BREATH-CLAIMS (Smooth Path P0, C1). This file's older
 *   breathing mode carried the same claims as breathing-session.js, some
 *   stronger: a named neuroscientist, "drop your heart rate measurably",
 *   "the braking system of the nervous system", HRV as "a marker of
 *   nervous system health". Rewritten as what to do. Patterns unchanged.
 *
 * 02 Oct 2026 v9
 *
 * v9 - W5-10 MINDFUL-TIMER. Stay in session carries the practice on (it
 *   froze it); a cue at each change and at the end, said in a status line
 *   and with a short vibration (per the Vibration switch); the countdown is
 *   no longer a live region read every second.
 *
 * 02 Oct 2026 v8
 *
 * v8 - W4-20. Mindful awareness, not movement: the practices are sitting and
 *   breathing.
 *
 * 29 Sep 2026 v7
 *
 * v7 - P23. The safety note before mindful practice is worded for a
 *   practice ("Before your practice"), not for an exercise.
 *
 * 15 Aug 2026 v6
 *
 * v6 - SHARED-1. Both completion screens render the end-of-session
 *   moments.
 *
 * 23 Jul 2026 v5
 *
 * CHANGELOG
 * 23 Jul 2026 v5 - BUILD-3 Section 4. The mindful mode (5/10/15/20 min
 *   guided timer) previously had zero exit protection of any kind - no
 *   confirm dialog, no session-guard, no save, on either exit path (the
 *   short breathing/journal exercises elsewhere in this file are
 *   completion-only by design and unaffected). Graeme's decision: full
 *   exit-confirm + partial-save, matching every other session type.
 *   Added logPartialMindfulSession(). Rewrote stopMindful() to show the
 *   shared showExitCard() confirmation instead of stopping instantly -
 *   all three existing button-wiring sites pick this up automatically.
 *   Wired mountSessionGuard() for the back-gesture path, scoped to
 *   mode === "mindful" mid-timer only.
 *
 * 14 Jul 2026 v4 (Session B2 finding)
 *   - Added missing `import { router } from "../router.js";`. This file
 *     is mounted via the router's old render()/onMount() pattern, which
 *     never passes router as an argument — but onMount()'s event
 *     handlers call router.navigate(...) directly in four places (main
 *     back button, breathing-done button, journal-skip button, and the
 *     unconditional path inside the back-button handler). With no
 *     import, every one of those was a live ReferenceError: router is
 *     not defined. Confirmed reachable: noticing.js is the only current
 *     entry point (mindful mode, quietLaunchedDirect: true) — its back
 *     button click would silently crash, leaving the user stuck on the
 *     session screen with no visible error. This is the exact Door-1-
 *     style silent break the B2 audit was built to catch. No other
 *     change in this version — everything else in this file is
 *     unchanged from v3.
 *
 * 21 Jun 2026 v3 (S4-CSS-NOTICING fixes)
 *   - onUnmount() export added: called by router.navigate() before leaving
 *     this view, clears all intervals so device back gesture stops timers.
 *   - Mindful movement: total-session countdown replaces per-exercise
 *     countdown. Timer counts down from the selected duration (5:00, 10:00
 *     etc) across all exercises in sequence — label is a kept promise.
 *   - Progress bar: now based on total elapsed time, not step index, so
 *     it is visible and moving from the first second of the session.
 *   - MINDFUL_SESSIONS durations corrected so each option's exercises
 *     sum exactly to the labelled time:
 *       5 min  = 300s  (180 + 120, unchanged)
 *       10 min = 600s  (360 + 240, was 360+300=660)
 *       15 min = 900s  (540 + 360, new)
 *       20 min = 1200s (600 + 600, was the old "15 min" content)
 *   - Duration selector now offers 5 / 10 / 15 / 20 minutes.
 *   - Design principle: the duration label is a promise. The timer shows
 *     exactly the time selected, nothing more.
 *
 * 15 Jun 2026 v2 (S4-9/10 follow-on fix) - Mindful movement selector bug:
 *   renderMindfulMode() checked `if (!step) return renderMindfulSelector()`,
 *   but step = MINDFUL_SESSIONS[mindfulDuration][mindfulStep] is always
 *   truthy with the default mindfulDuration=10, mindfulStep=0 - so the
 *   duration-selector screen (renderMindfulSelector) was dead code and
 *   mindful mode opened straight into a session view frozen at "0:00"
 *   with no timer running, in every entry path. Fixed with a new
 *   `mindfulStarted` boolean (default false), set true in
 *   startMindfulSession() and reset in stopMindful()/cleanup(). Mindful
 *   mode now correctly shows the duration picker first. No other logic
 *   changed.
 *
 *   This makes mindful movement safe to launch directly from noticing.js
 *   (S4-9/10) via quietMode: "mindful" - the journal-mode path is NOT
 *   used by noticing.js (separate data-shape issue, flagged for S4-13/14)
 *   and breathing now routes to breathing-session.js instead of this
 *   file's breathing mode.
 *
 * 21 May 2026 v1 - Back button reads quietReturnRoute from store.
 *                   quietLaunchedDirect flag skips selector when
 *                   navigated from Noticing or other views directly.
 *
 * v1.0 (S4-1, April 2026)
 *
 * Three modes, selected by quietMode in store before navigation:
 *   "breathing"  - 5 structured breathing exercises with visual phase timers
 *                   (superseded by breathing-session.js, S4-9/10 - not
 *                   routed to from noticing.js or intention.js any more,
 *                   kept here for now, not removed)
 *   "journal"    - coach-selected prompts based on check-in, free text, stored privately
 *                   (NOT routed to from noticing.js - journalEntries shape
 *                   here predates the S4-NH-SCHEMA array shape and would
 *                   corrupt it. S4-13/14 to replace properly. Confirmed
 *                   14 Jul 2026: also not reachable from intention.js's
 *                   quiet options, which all route to reflect.js instead.
 *                   Currently unreachable from any live entry point, but
 *                   the bug in saveJournalEntry() below is NOT fixed —
 *                   flagged only, per Session B2 scope.)
 *   "mindful"    - 5/10/15/20 min guided mindful movement with total countdown
 *   "rest"       - single warm coach acknowledgement, no activity required
 *
 * Route: quiet-session
 * Nav: hidden (session view)
 *
 * Credits: 20 per breathing or mindful exercise completed. Journaling: 15. Rest: 10.
 */

import { store }  from "../store.js";
import { isGateDue, renderSafetyGate, attachSafetyGate } from "../safety-gate.js";
// SHARED-1. See breathing-session.js. Both completion screens in this
// view get the moments; missing one would mean a first journal entry is
// marked and a first breathing practice is not.
import { renderSessionMoments } from "../data/session-moments.js";
import { router } from "../router.js";
import { mountSessionGuard, dismountSessionGuard, showExitCard } from "../session-guard.js";

export const centered = false;

// ── Breathing exercises ───────────────────────────────────────────────────────

const BREATHING_EXERCISES = [
  {
    id: "box",
    name: "Box Breathing",
    icon: "\uD83D\uDFE6",
    coachIntro: "Four seconds each way: in, hold, out, hold. If four feels long, make all four shorter.",
    why: "Four equal sides of four seconds each. In, hold, out, hold. The symmetry itself is the mechanism.",
    phases: [
      { label: "Breathe in", seconds: 4, colour: "var(--color-primary)" },
      { label: "Hold", seconds: 4, colour: "var(--color-warning)" },
      { label: "Breathe out", seconds: 4, colour: "var(--color-text-secondary)" },
      { label: "Hold", seconds: 4, colour: "var(--color-warning)" }
    ],
    rounds: 6,
    credits: 20
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    icon: "\uD83C\uDF19",
    coachIntro: "In for 4, hold for 7, out for 8. It can feel unusual at first. If the hold is too long, shorten it.",
    why: "A longer hold and a long, slow out-breath. Nothing needs to strain.",
    phases: [
      { label: "Breathe in", seconds: 4,  colour: "var(--color-primary)" },
      { label: "Hold", seconds: 7,  colour: "var(--color-warning)" },
      { label: "Breathe out", seconds: 8,  colour: "var(--color-text-secondary)" }
    ],
    rounds: 4,
    credits: 20
  },
  {
    id: "sigh",
    name: "Physiological Sigh",
    icon: "\uD83D\uDCA8",
    coachIntro: "Two short breaths in through the nose, the second topping up the first, then a long slow breath out through the mouth. One to three rounds is enough.",
    why: "Two in, one long out. You do this naturally sometimes without noticing.",
    phases: [
      { label: "First inhale (nose)", seconds: 2, colour: "var(--color-primary)" },
      { label: "Second inhale (nose)", seconds: 1, colour: "var(--color-primary)" },
      { label: "Long exhale (mouth)", seconds: 8, colour: "var(--color-text-secondary)" }
    ],
    rounds: 5,
    credits: 20
  },
  {
    id: "resonance",
    name: "Resonance Breathing",
    icon: "\uD83C\uDF00",
    coachIntro: "About five and a half seconds in and five and a half seconds out. Six breaths a minute is close enough.",
    why: "Slow and even. Let it feel like a wave, rising and falling without effort.",
    phases: [
      { label: "Breathe in", seconds: 5, colour: "var(--color-primary)" },
      { label: "Breathe out", seconds: 6, colour: "var(--color-text-secondary)" }
    ],
    rounds: 10,
    credits: 20
  },
  {
    id: "extended-exhale",
    name: "Extended Exhale",
    icon: "\uD83C\uDF43",
    coachIntro: "The simplest pattern here: breathe out for longer than you breathe in. You can do it anywhere, in a meeting or on a bus.",
    why: "Inhale for four, exhale for eight. The ratio matters more than the exact numbers. Just make the out breath longer than the in breath.",
    phases: [
      { label: "Breathe in", seconds: 4, colour: "var(--color-primary)" },
      { label: "Breathe out slowly", seconds: 8, colour: "var(--color-text-secondary)" }
    ],
    rounds: 8,
    credits: 20
  }
];

// ── Mindfulness sessions ──────────────────────────────────────────────────────
//
// RULE: each option's exercise durations must sum exactly to (mins * 60).
// The label is a promise. Never let actual content exceed or significantly
// undershoot the label — it destroys trust.
//
// 5  min = 300s  (180 + 120)
// 10 min = 600s  (360 + 240)
// 15 min = 900s  (540 + 360)
// 20 min = 1200s (600 + 600)

const MINDFUL_SESSIONS = {
  5: [
    { id: "breath-awareness", name: "Breath Awareness", duration: 180,
      instruction: "Sit comfortably and close your eyes. Simply notice the breath moving in and out. When the mind wanders, return to the breath without judgement. That returning is the practice.",
      coaching: "There is no goal here except to notice. Every time you return to the breath, you have done it right." },
    { id: "body-scan-short", name: "Short Body Scan", duration: 120,
      instruction: "Start at the top of your head and slowly move your attention down through your body. Scalp, forehead, jaw, neck, shoulders, chest, arms, belly, lower back, hips, legs, feet. Notice without trying to change anything.",
      coaching: "Sensation, temperature, tension, ease. Just notice what is there." }
  ],
  10: [
    { id: "breath-awareness-10", name: "Breath Awareness", duration: 360,
      instruction: "Settle into your seat and close your eyes. Place one hand on your chest and one on your belly. Notice which moves more. Let your attention rest on the physical sensation of breath. When thoughts come, acknowledge them and return.",
      coaching: "Each return is a repetition. This is the exercise. There is no such thing as a bad meditation session, only a session." },
    { id: "noting-practice", name: "Noting Practice", duration: 240,
      instruction: "Rest attention on the breath. When something else arises, briefly name it: thinking, sound, feeling. After naming it, return to the breath. Keep the labels simple and non-judgemental.",
      coaching: "Noting creates a tiny gap between experience and reaction. That gap is where calm lives." }
  ],
  15: [
    { id: "breath-awareness-15", name: "Breath Awareness", duration: 540,
      instruction: "Settle in and close your eyes. Let your breathing find its own rhythm — do not try to control it. Rest your attention on the sensation of air moving in and out. When thoughts arise, notice them, let them pass, and return.",
      coaching: "A longer sit gives the mind time to settle. The first few minutes are often busiest. Stay with it." },
    { id: "body-scan-medium", name: "Body Scan", duration: 360,
      instruction: "Begin at the crown of your head and move your attention slowly downward. Spend time in each region — scalp, face, jaw, throat, shoulders, arms, hands, chest, belly, lower back, hips, legs, feet. Notice what is there without trying to change it.",
      coaching: "If you find tension, breathe into it gently. You are not fixing anything. You are noticing." }
  ],
  20: [
    { id: "body-scan-full", name: "Full Body Scan", duration: 600,
      instruction: "Lie down if you can. Begin at the top of your head and move your attention slowly down through the entire body. Spend at least thirty seconds in each region. Scalp, face, jaw, throat, shoulders, upper arms, forearms, hands, chest, upper back, belly, lower back, hips, glutes, thighs, knees, calves, feet, toes. Notice, do not fix.",
      coaching: "If you fall asleep, that was what your body needed. If you stay awake, that is the practice." },
    { id: "open-awareness", name: "Open Awareness", duration: 600,
      instruction: "Sit comfortably and let your attention open outward. Allow sounds, sensations, thoughts, and feelings to arise and pass without following any of them. You are the sky. Everything else is weather.",
      coaching: "If the mind is very active, return to breath awareness first, then expand when it settles." }
  ]
};

// ── View state ────────────────────────────────────────────────────────────────

let mode              = "breathing";   // "breathing" | "journal" | "mindful" | "rest"
let selectedBreathing = null;          // breathing exercise id
let breathingPhase    = 0;             // current phase index
let breathingRound    = 0;             // current round
let breathingInterval = null;          // setInterval handle
let phaseSecondsLeft  = 0;             // seconds remaining in current phase
let breathingComplete  = false;        // finished all rounds

let mindfulDuration    = 10;           // 5 | 10 | 15 | 20
let mindfulStarted     = false;        // gates selector vs session view
let mindfulStep        = 0;            // current exercise index in session
let mindfulTimer       = null;         // setInterval handle
let mindfulTotalSeconds = 0;           // total session duration in seconds
let mindfulElapsed     = 0;            // total seconds elapsed across all exercises
let mindfulStepElapsed = 0;            // seconds elapsed in current exercise
let mindfulComplete    = false;
let mindfulSession     = null;         // W5-10: the steps, so Stay can carry on


// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  mode = store.get("quietMode") || "selector";

  return `
    <div class="view quiet-session-view">
      <div class="quiet-session-header">
        <button class="btn btn-ghost btn-small quiet-back-btn" id="quiet-back-btn"
                aria-label="Back to choices">
          &larr; Back
        </button>
        <h1 class="quiet-session-title">${getModeTitle()}</h1>
      </div>

      <div id="quiet-session-content">
        ${renderMode()}
      </div>
    </div>
  `;
}

function getModeTitle() {
  const titles = {
    selector:  "Something Quieter",
    breathing: "Breathing Practice",
    journal:   "Journal",
    mindful:   "Mindful Movement",
    rest:      "Rest"
  };
  return titles[mode] || "Something Quieter";
}

// ── Mode selector ─────────────────────────────────────────────────────────────

function renderModeSelector() {
  return `
    <div class="card card-coach quiet-coach-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <p>What feels right today? Each of these works differently.
           Take a moment to notice what you actually need.</p>
      </div>
    </div>

    <div class="quiet-mode-menu" role="list">

      <button class="quiet-mode-card" data-mode="breathing" role="listitem"
              aria-label="Breathing practice">
        <div class="quiet-mode-card-left">
          <span class="quiet-mode-icon" aria-hidden="true">\uD83C\uDF2C</span>
          <div>
            <h3>Breathing</h3>
            <p class="text-sm text-muted">Five breathing patterns, with a guided timer.</p>
          </div>
        </div>
        <span class="quiet-mode-arrow" aria-hidden="true">&rsaquo;</span>
      </button>

      <button class="quiet-mode-card" data-mode="mindful" role="listitem"
              aria-label="Mindful awareness">
        <div class="quiet-mode-card-left">
          <span class="quiet-mode-icon" aria-hidden="true">\uD83C\uDF3F</span>
          <div>
            <h3>Mindful Movement</h3>
            <p class="text-sm text-muted">5, 10, 15, or 20 minutes. Guided practice with timer.</p>
          </div>
        </div>
        <span class="quiet-mode-arrow" aria-hidden="true">&rsaquo;</span>
      </button>

      <button class="quiet-mode-card" data-mode="journal" role="listitem"
              aria-label="Journaling">
        <div class="quiet-mode-card-left">
          <span class="quiet-mode-icon" aria-hidden="true">\uD83D\uDCDD</span>
          <div>
            <h3>Journaling</h3>
            <p class="text-sm text-muted">Write anything. Only you can read it.</p>
          </div>
        </div>
        <span class="quiet-mode-arrow" aria-hidden="true">&rsaquo;</span>
      </button>

      <button class="quiet-mode-card" data-mode="rest" role="listitem"
              aria-label="Rest day">
        <div class="quiet-mode-card-left">
          <span class="quiet-mode-icon" aria-hidden="true">\uD83D\uDECC</span>
          <div>
            <h3>Rest</h3>
            <p class="text-sm text-muted">A coach acknowledgement. Nothing more required.</p>
          </div>
        </div>
        <span class="quiet-mode-arrow" aria-hidden="true">&rsaquo;</span>
      </button>

    </div>
  `;
}

function renderMode() {
  if (!mode || mode === "selector") return renderModeSelector();
  if (mode === "journal")    return "";   // BUNDLE-TRUE: onMount sends it to journal-entry
  if (mode === "breathing")  return renderBreathingMode();
  // SAFETY-GATE, GATE-ALL 16 Sep 2026. Mindful mode only, and that is a
  // decision rather than an oversight. The other modes in this route are
  // journalling and short breathing prompts -- reading and typing, with
  // no body in them. Mindful mode is a timed practice somebody holds a
  // position through, which is where hurt-and-ache applies.
  if (mode === "mindful" && isGateDue()) return renderSafetyGate({ practice: true });
  if (mode === "mindful")    return renderMindfulMode();
  if (mode === "rest")       return renderRestMode();
  return renderBreathingMode();
}

// ── Breathing mode ────────────────────────────────────────────────────────────

function renderBreathingMode() {
  if (!selectedBreathing) return renderBreathingSelector();
  const ex = BREATHING_EXERCISES.find(e => e.id === selectedBreathing);
  if (!ex) return renderBreathingSelector();
  if (breathingComplete) return renderBreathingComplete(ex);
  return renderBreathingSession(ex);
}

function renderBreathingSelector() {
  return `
    <div class="card card-coach quiet-coach-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <p>Choose a breathing practice. Each one does something slightly different.
           Start with Box Breathing if you are not sure.</p>
      </div>
    </div>

    <div class="quiet-breathing-list" role="list">
      ${BREATHING_EXERCISES.map(ex => `
        <button class="card quiet-breathing-card" data-breathing-id="${ex.id}"
                role="listitem" aria-label="Start ${ex.name}">
          <div class="quiet-breathing-card-header">
            <span class="quiet-breathing-icon" aria-hidden="true">${ex.icon}</span>
            <div>
              <h3>${ex.name}</h3>
              <p class="text-sm text-muted">${ex.rounds} rounds
                &middot; ${Math.round(ex.phases.reduce((t,p) => t + p.seconds, 0) * ex.rounds / 60)} mins
              </p>
            </div>
          </div>
          <p class="text-sm quiet-breathing-why">${ex.why}</p>
        </button>
      `).join("")}
    </div>
  `;
}

function renderBreathingSession(ex) {
  const roundProgress = Math.round(((breathingRound) / ex.rounds) * 100);
  const phase = ex.phases[breathingPhase];

  return `
    <div class="card card-coach quiet-coach-card" style="margin-bottom:var(--space-4);">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <h3>${ex.name}</h3>
        <p class="text-sm">${ex.coachIntro}</p>
      </div>
    </div>

    <div class="quiet-breathing-session">

      <div class="quiet-round-progress">
        <span class="text-sm text-muted">Round ${breathingRound + 1} of ${ex.rounds}</span>
        <div class="quiet-progress-bar" role="progressbar"
             aria-valuenow="${roundProgress}" aria-valuemin="0" aria-valuemax="100">
          <div class="quiet-progress-fill" style="width:${roundProgress}%"></div>
        </div>
      </div>

      <div class="quiet-timer-wrap">
        <div class="quiet-timer-circle" id="quiet-timer-circle"
             style="--phase-colour: ${phase.colour};"
             aria-live="polite" aria-atomic="true">
          <div class="quiet-timer-phase" id="quiet-phase-label">${phase.label}</div>
          <div class="quiet-timer-seconds" id="quiet-timer-seconds"
               aria-label="${phaseSecondsLeft} seconds">${phaseSecondsLeft}</div>
        </div>
      </div>

      <div class="quiet-phase-dots" aria-hidden="true">
        ${ex.phases.map((p, i) => `
          <div class="quiet-phase-dot ${i === breathingPhase ? "active" : ""}"
               style="${i === breathingPhase ? "--dot-colour:" + p.colour : ""}">
          </div>
        `).join("")}
      </div>

      <button class="btn btn-danger btn-full" id="quiet-stop-breathing-btn"
              style="margin-top:var(--space-6);">
        Stop session
      </button>
    </div>
  `;
}

function renderBreathingComplete(ex) {
  return `
    ${renderSessionMoments({})}
    <div class="card card-coach quiet-coach-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <h3>That is done.</h3>
        <p>You completed ${ex.rounds} rounds of ${ex.name}. Give yourself a moment
           before you move on. Notice how you feel compared to when you started.</p>
      </div>
    </div>

    <div class="quiet-complete-actions">
      <button class="btn btn-ghost btn-full" id="quiet-try-another-btn">
        Try another exercise
      </button>
      <button class="btn btn-primary btn-full" id="quiet-breathing-done-btn"
              style="margin-top:var(--space-3);">
        Done for now
      </button>
    </div>

    <div class="card quiet-difficulty-card" style="margin-top:var(--space-5);">
      <p class="text-sm" style="margin-bottom:var(--space-3);">How did that feel?</p>
      <div class="quiet-difficulty-chips" role="group" aria-label="Difficulty rating">
        ${["Very easy", "Easy", "Manageable", "Challenging", "Very challenging"].map((label, i) => `
          <button class="quiet-difficulty-chip" data-difficulty="${i + 1}"
                  aria-pressed="false" aria-label="${label}">
            ${label}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

// ── Mindful mode ──────────────────────────────────────────────────────────────

function renderMindfulMode() {
  if (!mindfulStarted) return renderMindfulSelector();
  if (mindfulComplete) return renderMindfulComplete();
  const session = MINDFUL_SESSIONS[mindfulDuration];
  const step    = session?.[mindfulStep];
  if (!step) return renderMindfulSelector();
  return renderMindfulSession(step);
}

function renderMindfulSelector() {
  return `
    <div class="card card-coach quiet-coach-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <p>How long do you have? Each session guides you through one or two
           practices with a timer. The time you choose is exactly the time you get.</p>
      </div>
    </div>

    <div class="quiet-duration-selector" role="group" aria-label="Session length">
      ${[5, 10, 15, 20].map(mins => `
        <button class="quiet-duration-btn ${mindfulDuration === mins ? "selected" : ""}"
                data-duration="${mins}"
                aria-pressed="${mindfulDuration === mins}">
          <span class="quiet-duration-mins">${mins}</span>
          <span class="quiet-duration-label">min</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-primary btn-large btn-full" id="quiet-mindful-start-btn"
            style="margin-top:var(--space-5);">
      Begin ${mindfulDuration}-minute session
    </button>
  `;
}

function renderMindfulSession(step) {
  // Progress based on total elapsed time — visible from the first second
  const progressPct = mindfulTotalSeconds > 0
    ? Math.min(100, Math.round((mindfulElapsed / mindfulTotalSeconds) * 100))
    : 0;
  const timeRemaining = Math.max(0, mindfulTotalSeconds - mindfulElapsed);
  const timeDisplay   = formatTime(timeRemaining);

  return `
    <div class="card card-coach quiet-coach-card" style="margin-bottom:var(--space-4);">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <h3>${step.name}</h3>
        <p class="text-sm">${step.instruction}</p>
        ${step.coaching ? `
          <p class="text-sm text-muted" style="margin-top:var(--space-3);">
            ${step.coaching}
          </p>
        ` : ""}
      </div>
    </div>

    <div class="quiet-mindful-timer">
      <!-- W5-10. Not a live region: it was read out every second. Changes
           and the end are said once, in the status line below. -->
      <div class="quiet-mindful-clock">
        <span id="quiet-mindful-time">${timeDisplay}</span>
      </div>
      <p class="text-sm text-muted" style="margin-top:var(--space-2);">remaining</p>
      <p class="text-sm" id="quiet-mindful-cue" role="status"></p>
    </div>

    <div class="quiet-progress-bar" style="margin: var(--space-4) var(--space-4) 0;"
         role="progressbar" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100"
         aria-label="Session progress">
      <div class="quiet-progress-fill" style="width:${progressPct}%"></div>
    </div>

    <div style="padding: 0 var(--space-4);">
      <button class="btn btn-danger btn-full" id="quiet-mindful-stop-btn"
              style="margin-top:var(--space-6);">
        End session early
      </button>
    </div>
  `;
}

function renderMindfulComplete() {
  return `
    <div class="card card-coach quiet-coach-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <h3>Session complete.</h3>
        <p>You gave yourself ${mindfulDuration} minutes. That is not nothing. Notice what
           is different, even slightly, from when you started.</p>
      </div>
    </div>

    <button class="btn btn-primary btn-full quiet-back-btn"
            style="margin-top:var(--space-5); margin-left:var(--space-4); margin-right:var(--space-4);">
      Back to choices
    </button>
  `;
}

// ── Rest mode ─────────────────────────────────────────────────────────────────

function renderRestMode() {
  const checkin = store.get("checkinHistory") || {};
  const todayKey = new Date().toISOString().split("T")[0];
  const today = checkin[todayKey] || {};
  const energy = today.energy || 5;

  let coachLine;
  if (energy <= 3) {
    coachLine = "Your body is asking for rest today. That is not failure. Rest is what makes the training work. You made the right call.";
  } else if (energy <= 6) {
    coachLine = "Rest days are part of the programme, not a break from it. Adaptation happens when you are not training. Enjoy the stillness.";
  } else {
    coachLine = "High energy and choosing rest takes a different kind of discipline. If your body needs it, this is the right choice. If you want to move later, we will be here.";
  }

  return `
    <div class="card card-coach quiet-coach-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <h3>Rest day.</h3>
        <p>${coachLine}</p>
      </div>
    </div>

    <div class="card" style="margin-top:var(--space-5); margin-left:var(--space-4); margin-right:var(--space-4);">
      <p class="text-sm text-muted">
        If you want gentle movement later, breathing practice or a short mindful
        session are always here. No pressure either way.
      </p>
    </div>

    <button class="btn btn-ghost btn-full quiet-back-btn"
            style="margin-top:var(--space-5); margin-left:var(--space-4); margin-right:var(--space-4);">
      Back to choices
    </button>
  `;
}

// ── Timer logic ───────────────────────────────────────────────────────────────

function startBreathing(exerciseId) {
  const ex = BREATHING_EXERCISES.find(e => e.id === exerciseId);
  if (!ex) return;

  selectedBreathing  = exerciseId;
  breathingPhase     = 0;
  breathingRound     = 0;
  breathingComplete  = false;
  phaseSecondsLeft   = ex.phases[0].seconds;

  rerender();

  breathingInterval = setInterval(() => {
    phaseSecondsLeft--;

    const secondsEl = document.getElementById("quiet-timer-seconds");
    const phaseEl   = document.getElementById("quiet-phase-label");
    const circleEl  = document.getElementById("quiet-timer-circle");

    if (secondsEl) secondsEl.textContent = phaseSecondsLeft;

    if (phaseSecondsLeft <= 0) {
      breathingPhase++;

      if (breathingPhase >= ex.phases.length) {
        breathingPhase = 0;
        breathingRound++;
      }

      if (breathingRound >= ex.rounds) {
        clearInterval(breathingInterval);
        breathingInterval = null;
        breathingComplete = true;
        logSession("breathing", ex.name, ex.credits, ex.id);
        rerender();
        return;
      }

      const nextPhase = ex.phases[breathingPhase];
      phaseSecondsLeft = nextPhase.seconds;

      if (phaseEl)   phaseEl.textContent = nextPhase.label;
      if (circleEl)  circleEl.style.setProperty("--phase-colour", nextPhase.colour);
      if (secondsEl) secondsEl.textContent = phaseSecondsLeft;

      document.querySelectorAll(".quiet-phase-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === breathingPhase);
        if (i === breathingPhase) dot.style.setProperty("--dot-colour", nextPhase.colour);
      });

      const roundEl = document.querySelector(".quiet-round-progress .text-sm");
      if (roundEl) roundEl.textContent = "Round " + (breathingRound + 1) + " of " + ex.rounds;
    }
  }, 1000);
}

function stopBreathing() {
  if (breathingInterval) clearInterval(breathingInterval);
  breathingInterval = null;
  selectedBreathing = null;
  breathingComplete = false;
  breathingRound    = 0;
  breathingPhase    = 0;
  rerender();
}

function startMindfulSession() {
  const session = MINDFUL_SESSIONS[mindfulDuration];
  if (!session?.length) return;

  mindfulStarted      = true;
  mindfulStep         = 0;
  mindfulComplete     = false;
  mindfulTotalSeconds = mindfulDuration * 60;
  mindfulElapsed      = 0;
  mindfulStepElapsed  = 0;

  // Render the session view directly — avoids rerender() calling cleanup()
  const content = document.getElementById("quiet-session-content");
  if (content) {
    content.innerHTML = renderMindfulSession(session[0]);
    document.getElementById("quiet-mindful-stop-btn")?.addEventListener("click", stopMindful);
  }

  runMindfulTimer(session);
}

// W5-10. A practice done with the eyes closed needs telling when it moves
// on and when it ends: said in the status line, and a short vibration
// (navigator.vibrate obeys the Vibration switch, display-prefs.js).
function _cue(text, pattern) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  const el = document.getElementById("quiet-mindful-cue");
  if (el) el.textContent = text;
}

function runMindfulTimer(session) {
  if (mindfulTimer) clearInterval(mindfulTimer);
  mindfulSession = session;

  mindfulTimer = setInterval(() => {
    mindfulElapsed++;
    mindfulStepElapsed++;

    // Update the countdown display only — no full rerender
    const timeEl = document.getElementById("quiet-mindful-time");
    if (timeEl) {
      timeEl.textContent = formatTime(Math.max(0, mindfulTotalSeconds - mindfulElapsed));
    }

    // Update progress bar
    const fill = document.querySelector(".quiet-progress-fill");
    if (fill) {
      const pct = Math.min(100, Math.round((mindfulElapsed / mindfulTotalSeconds) * 100));
      fill.style.width = pct + "%";
      fill.closest(".quiet-progress-bar")?.setAttribute("aria-valuenow", pct);
    }

    // Check if current step is done
    const currentStepDuration = session[mindfulStep].duration;
    if (mindfulStepElapsed >= currentStepDuration) {
      mindfulStep++;
      mindfulStepElapsed = 0;

      if (mindfulStep >= session.length) {
        // Session complete
        clearInterval(mindfulTimer);
        mindfulTimer    = null;
        mindfulComplete = true;
        _cue("That\u2019s the end of the practice.", [200, 100, 200]);
        dismountSessionGuard();
        logSession("mindful", mindfulDuration + " min mindful session", 20, session?.[0]?.id);
        rerender();
        return;
      }

      // Advance to next step — render new instruction card only
      const content = document.getElementById("quiet-session-content");
      if (content) {
        content.innerHTML = renderMindfulSession(session[mindfulStep]);
        document.getElementById("quiet-mindful-stop-btn")?.addEventListener("click", stopMindful);
      }
      const mins = Math.round(session[mindfulStep].duration / 60);
      _cue(`Now: ${session[mindfulStep].name}, about ${mins} minute${mins === 1 ? "" : "s"}.`, 200);
    }
  }, 1000);
}

/**
 * 23 Jul 2026 v5 (BUILD-3 Section 4): REWRITTEN. Previously stopped the
 * session immediately with no confirmation and no save at all - the most
 * exposed exit path in the app. Now shows the same coach-voiced
 * confirmation card every other session type uses. Note: matching the
 * existing convention already used by the other on-screen Exit buttons
 * across the app (e.g. cycle-session.js/swim-session.js's own
 * showExitConfirm()), picking "Stay in session" here does not resume the
 * paused timer - this is a pre-existing quirk of the shared card pattern,
 * not something introduced or fixed in this change.
 */
function stopMindful() {
  if (mindfulTimer) clearInterval(mindfulTimer);
  mindfulTimer = null;

  showExitCard({
    label: "mindful session",
    // W5-10. Stay carries on (it froze the practice for good).
    onStay: () => { if (mindfulSession && mindfulStarted && !mindfulComplete) runMindfulTimer(mindfulSession); },
    onSave: () => {
      if (mindfulElapsed >= 10) logPartialMindfulSession();
      resetMindfulState();
      rerender();
    },
    onDiscard: () => {
      resetMindfulState();
      rerender();
    }
  });
}

function resetMindfulState() {
  dismountSessionGuard();
  mindfulStarted     = false;
  mindfulComplete    = false;
  mindfulStep        = 0;
  mindfulElapsed     = 0;
  mindfulStepElapsed = 0;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + ":" + String(s).padStart(2, "0");
}

// ── Session logging ───────────────────────────────────────────────────────────

// QUIET-1, 12 Aug 2026. The breathing patterns and mindful practices in
// this file use short local ids -- "box", "478", "sigh" -- while the
// exercise database uses full ones: box-breathing,
// four-seven-eight-breathing, physiological-sigh. Every one has a
// database equivalent; only the id differs.
//
// The patterns themselves legitimately live here: they are phase timings
// and coach intros, which the database does not hold. What was missing is
// that logSession() supplied no exerciseIds at all, so no breathing or
// mindfulness practice ever became familiar -- the same gap CONT-3 closed
// for core and yoga. "Something like last time" could never offer a
// person the breathing pattern they actually use.
//
// Mapped rather than renamed: renaming the local ids would touch the
// phase data, the rendering and the resume state for a logging fix.
const DB_ID = {
  "box":                 "box-breathing",
  "478":                 "four-seven-eight-breathing",
  "sigh":                "physiological-sigh",
  "extended-exhale":     "extended-exhale-breathing",
  "resonance":           "coherent-breathing",       // database name for the same 5.5-breath pattern
  "breath-awareness":    "breath-awareness-meditation",
  "breath-awareness-10": "breath-awareness-meditation",
  "breath-awareness-15": "breath-awareness-meditation",
  "body-scan-short":     "body-scan-short",
  "body-scan-medium":    "sleep-body-scan",
  "body-scan-full":      "sleep-body-scan",
  "open-awareness":      "open-awareness-meditation",
  "noting-practice":     "noting-practice",
};

function logSession(type, name, credits, localId) {
  // PT-6, 12 Aug 2026. Wrote straight to activityLog, bypassing
  // store.logActivity() and its dedupe, empty-partial and
  // exerciseHistory handling.
  //
  // PT-3 as well, at its source: this wrote `duration` and `loggedAt`
  // where every other view writes `durationMins` and `completedAt`. So
  // progress.js -- which sums durationMins -- counted every mindful and
  // breathing session as zero minutes, and today.js could not see a
  // completedAt. The field names were the bug, not just the write path.
  //
  // `duration: null` is kept as durationMins: null deliberately: a
  // completion's length is always exactly the chosen duration, already
  // in the name. Recorded properly for the partial exit below, where it
  // genuinely varies.
  const nowIso = new Date().toISOString();
  store.logActivity({
    id:           "quiet-" + Date.now(),
    type,
    name,
    source:       "quiet-session",
    status:       "completed",
    creditsEarned: credits,
    durationMins: null,
    // QUIET-1. Database id, so exerciseHistory and continuity can see it.
    // Omitted entirely when unmapped rather than logging a local id that
    // matches nothing -- a phantom entry is worse than none.
    exerciseIds:  DB_ID[localId] ? [DB_ID[localId]] : [],
    completedAt:  nowIso,
    sessionEnd:   nowIso
  });

  const current = store.get("totalCredits") || 0;
  store.set("totalCredits", current + credits);
  store.set("lastWorkoutCredits", credits);
  store.set("lastWorkoutName", name);
}

/**
 * 23 Jul 2026 v5 (BUILD-3 Section 4): new function. The mindful mode
 * (5/10/15/20 min guided timer) previously had zero exit protection of
 * any kind - no confirm dialog, no session-guard, no save, on either
 * exit path. Graeme's decision: full exit-confirm + partial-save,
 * matching every other session type in the app (not just the
 * back-gesture fix pattern used elsewhere - both the on-screen Stop
 * button and the back gesture now show the same coach-voiced
 * confirmation card via showExitCard()/mountSessionGuard()).
 * No credits are banked for a partial exit - unlike a genuine
 * completion (logSession()'s flat 20 credits), nothing is earned until
 * the full session finishes. Unlike logSession(), duration IS recorded
 * here (logSession() deliberately omits it since a completion's length
 * is always exactly mindfulDuration, already implied by name - that
 * doesn't hold for a partial exit, so it's genuinely useful here).
 */
function logPartialMindfulSession() {
  // PT-6 / PT-3. Same migration as logSession() above: shared write path,
  // and durationMins rather than `duration`, which progress.js could not
  // see. store.logActivity()'s empty-partial guard now applies too, so
  // opening this and backing straight out no longer records a session
  // that did not happen.
  const nowIso = new Date().toISOString();
  store.logActivity({
    id:            "quiet-" + Date.now(),
    type:          "mindful",
    name:          mindfulDuration + " min mindful session",
    source:        "quiet-session",
    status:        "partial",
    creditsEarned: 0,
    durationMins:  Math.round(mindfulElapsed / 60),
    completedAt:   nowIso,
    sessionEnd:    nowIso
  });
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  mode = store.get("quietMode") || "selector";

  // BUNDLE-TRUE, 01 Oct 2026. The journal lives in journal-entry, behind the
  // health consent and beside the support lines. An old journal-mode link
  // lands there instead.
  if (mode === "journal") {
    store.set("quietMode", null);
    store.set("journalEntryType", null);
    router.navigate("journal-entry");
    return;
  }

  // 23 Jul 2026 v5 (BUILD-3 Section 4): back-gesture protection for the
  // mindful mode's active timer, added where none existed before. Scoped
  // narrowly to mode === "mindful" mid-timer - the short breathing/
  // journal exercises elsewhere in this same route are unaffected and
  // remain completion-only by design (unchanged).
  // SAFETY-GATE, GATE-ALL. Early return before the guard and the timer.
  if (mode === "mindful" && isGateDue()) {
    attachSafetyGate(document.getElementById("app") || document, {
      surface: "quiet-session",
      onAcknowledge: () => router.navigate("quiet-session"),
      onLeave:       () => router.navigate("today"),
    });
    return;
  }

  mountSessionGuard({
    isActive: () => mode === "mindful" && mindfulStarted && !mindfulComplete,
    label:    "mindful session",
    onExit:   () => {
      if (mindfulTimer) { clearInterval(mindfulTimer); mindfulTimer = null; }
      if (mindfulElapsed >= 10) logPartialMindfulSession();
      resetMindfulState();
      rerender();
    }
  });

  document.querySelectorAll(".quiet-mode-card").forEach(card => {
    card.addEventListener("click", () => {
      // PT-4. The real journal, not this file's old journaling mode.
      if (card.dataset.mode === "journal") {
        cleanup();
        store.set("quietMode", null);
        store.set("journalEntryType", null);
        router.navigate("journal-entry");
        return;
      }
      mode = card.dataset.mode;
      store.set("quietMode", mode);
      rerender();
    });
  });

  document.querySelectorAll(".quiet-back-btn, #quiet-back-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const returnRoute = store.get("quietReturnRoute") || "today";
      if (mode && mode !== "selector") {
        const launchedDirectly = store.get("quietLaunchedDirect") || false;
        if (launchedDirectly) {
          cleanup();
          store.set("quietMode", null);
          store.set("quietReturnRoute", null);
          store.set("quietLaunchedDirect", false);
          router.navigate(returnRoute);
        } else {
          mode = "selector";
          store.set("quietMode", null);
          cleanup();
          rerender();
        }
      } else {
        cleanup();
        store.set("quietMode", null);
        store.set("quietReturnRoute", null);
        store.set("quietLaunchedDirect", false);
        router.navigate(returnRoute);
      }
    });
  });

  document.querySelectorAll(".quiet-breathing-card").forEach(card => {
    card.addEventListener("click", () => {
      startBreathing(card.dataset.breathingId);
    });
  });

  document.getElementById("quiet-stop-breathing-btn")?.addEventListener("click", stopBreathing);

  document.getElementById("quiet-try-another-btn")?.addEventListener("click", () => {
    selectedBreathing = null;
    breathingComplete = false;
    rerender();
  });

  document.getElementById("quiet-breathing-done-btn")?.addEventListener("click", () => {
    const returnRoute = store.get("quietReturnRoute") || "today";
    cleanup();
    store.set("quietMode", null);
    store.set("quietReturnRoute", null);
    store.set("quietLaunchedDirect", false);
    router.navigate(returnRoute);
  });

  document.querySelectorAll(".quiet-difficulty-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".quiet-difficulty-chip").forEach(c => {
        c.classList.toggle("selected", c === chip);
        c.setAttribute("aria-pressed", c === chip);
      });
    });
  });

  document.querySelectorAll(".quiet-duration-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      mindfulDuration = parseInt(btn.dataset.duration);
      document.querySelectorAll(".quiet-duration-btn").forEach(b => {
        b.classList.toggle("selected", b === btn);
        b.setAttribute("aria-pressed", b === btn);
      });
      const startBtn = document.getElementById("quiet-mindful-start-btn");
      if (startBtn) startBtn.textContent = "Begin " + mindfulDuration + "-minute session";
    });
  });

  document.getElementById("quiet-mindful-start-btn")?.addEventListener("click", startMindfulSession);
  document.getElementById("quiet-mindful-stop-btn")?.addEventListener("click", stopMindful);
}

// ── Cleanup / onUnmount ───────────────────────────────────────────────────────

function cleanup() {
  if (breathingInterval) clearInterval(breathingInterval);
  if (mindfulTimer)      clearInterval(mindfulTimer);
  breathingInterval  = null;
  mindfulTimer       = null;
  selectedBreathing  = null;
  breathingComplete  = false;
  mindfulStarted     = false;
  mindfulComplete    = false;
  mindfulStep        = 0;
  mindfulElapsed     = 0;
  mindfulStepElapsed = 0;
}

/**
 * Called by router.navigate() before leaving this view.
 * Stops all active timers so device back gesture cannot leave
 * breathing or mindful intervals running in the background.
 */
export function onUnmount() {
  cleanup();
}

function rerender() {
  const content = document.getElementById("quiet-session-content");
  if (content) {
    content.innerHTML = renderMode();
    onMount();
  }
}
