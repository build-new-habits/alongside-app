/**
 * yoga-session.js - Guided Yoga and Pilates Session
 *
 * v1.0 (S4-2, April 2026)
 *
 * Flow:
 *   1. Focus selector (Morning / Evening / Strength / Flexibility / Back care / Pilates)
 *   2. Duration selector (20 / 30 / 45 mins)
 *   3. Coach intro — what this session is for, one tap to begin
 *   4. Session execution — one pose at a time with hold timer
 *   5. Completion — coach close, credits, return to choices
 *
 * Timer pattern: renders directly to content div during active timer.
 * Never calls full onMount during an active hold — same fix as quiet-session.js.
 *
 * Route: yoga-session
 * Nav: shown (this is a Tier 1 guided session, not a workout-mode session)
 */

import { store } from "../store.js";
import { YOGA } from "../data/exercises/yoga.js";
import { PILATES } from "../data/exercises/pilates.js";

export const centered = false;

// ── Session blueprints ────────────────────────────────────────────────────────
// Each focus maps to curated sequences of exercise IDs.
// Short (20 min) / Medium (30 min) / Long (45 min) sets.

const SESSIONS = {
  morning: {
    label: "Morning Wake-Up",
    icon: "\uD83C\uDF05",
    coachIntro: "A gentle sequence to wake the body and clear the mind before your day. Nothing demanding. We are just asking everything to switch on.",
    sequences: {
      20: ["yoga-cat-cow-flow", "yoga-downward-dog", "yoga-warrior-1", "yoga-warrior-2", "yoga-cobra", "yoga-corpse-pose"],
      30: ["yoga-cat-cow-flow", "yoga-downward-dog", "yoga-crescent-lunge", "yoga-warrior-1", "yoga-warrior-2", "yoga-triangle", "yoga-cobra", "yoga-bridge-pose", "yoga-supine-twist", "yoga-corpse-pose"],
      45: ["yoga-cat-cow-flow", "yoga-sun-salutation-b", "yoga-warrior-1", "yoga-warrior-2", "yoga-warrior-3", "yoga-triangle", "yoga-half-moon", "yoga-crescent-lunge", "yoga-cobra", "yoga-bridge-pose", "yoga-seated-forward-fold", "yoga-supine-twist", "yoga-legs-up-wall", "yoga-corpse-pose"]
    }
  },
  evening: {
    label: "Evening Wind-Down",
    icon: "\uD83C\uDF19",
    coachIntro: "A restorative sequence to release the day and prepare your nervous system for rest. Longer holds, slower breath, nothing rushed.",
    sequences: {
      20: ["yoga-cat-cow-flow", "yoga-pigeon-pose", "yoga-seated-forward-fold", "yoga-supine-twist", "yoga-legs-up-wall", "yoga-corpse-pose"],
      30: ["yoga-cat-cow-flow", "yoga-downward-dog", "yoga-pigeon-pose", "yoga-yin-hip-sequence", "yoga-seated-forward-fold", "yoga-supine-twist", "yoga-legs-up-wall", "yoga-restorative-sequence", "yoga-corpse-pose"],
      45: ["yoga-cat-cow-flow", "yoga-downward-dog", "yoga-crescent-lunge", "yoga-pigeon-pose", "yoga-yin-hip-sequence", "yoga-seated-forward-fold", "yoga-forward-fold-series", "yoga-supine-twist", "yoga-legs-up-wall", "yoga-restorative-sequence", "yoga-pranayama", "yoga-corpse-pose"]
    }
  },
  strength: {
    label: "Strength",
    icon: "\uD83D\uDCAA",
    coachIntro: "Yoga builds functional strength differently to the gym. You are working against your own bodyweight through ranges of motion that loaded exercises rarely access. Expect to feel muscles working that you did not expect.",
    sequences: {
      20: ["yoga-chair-pose", "yoga-warrior-1", "yoga-warrior-3", "yoga-boat-pose", "yoga-bridge-pose", "yoga-cobra", "yoga-corpse-pose"],
      30: ["yoga-sun-salutation-b", "yoga-chair-pose", "yoga-warrior-2", "yoga-warrior-3", "yoga-half-moon", "yoga-boat-pose", "yoga-bridge-pose", "yoga-power-flow", "yoga-cobra", "yoga-corpse-pose"],
      45: ["yoga-sun-salutation-b", "yoga-chair-pose", "yoga-warrior-1", "yoga-warrior-2", "yoga-warrior-3", "yoga-half-moon", "yoga-balance-series", "yoga-boat-pose", "yoga-bridge-pose", "yoga-hip-strength", "yoga-power-flow", "yoga-cobra", "yoga-supine-twist", "yoga-corpse-pose"]
    }
  },
  flexibility: {
    label: "Flexibility",
    icon: "\uD83E\uDD38",
    coachIntro: "Flexibility is not about forcing range. It is about creating the conditions for release. We move slowly into each shape and let the nervous system allow the change. No pushing. No bouncing. Just breath and patience.",
    sequences: {
      20: ["yoga-downward-dog", "yoga-pigeon-pose", "yoga-seated-forward-fold", "yoga-triangle", "yoga-supine-twist", "yoga-corpse-pose"],
      30: ["yoga-downward-dog", "yoga-crescent-lunge", "yoga-pigeon-pose", "yoga-yin-hip-sequence", "yoga-seated-forward-fold", "yoga-forward-fold-series", "yoga-triangle", "yoga-supine-twist", "yoga-corpse-pose"],
      45: ["yoga-cat-cow-flow", "yoga-downward-dog", "yoga-crescent-lunge", "yoga-pigeon-pose", "yoga-yin-hip-sequence", "yoga-seated-forward-fold", "yoga-forward-fold-series", "yoga-triangle", "yoga-half-moon", "yoga-backbend-series", "yoga-supine-twist", "yoga-legs-up-wall", "yoga-corpse-pose"]
    }
  },
  back: {
    label: "Back Care",
    icon: "\uD83E\uDDB4",
    coachIntro: "This session is designed around the spine. We work to release compression, restore mobility, and build the support muscles that protect the back. If anything produces sharp pain, come out of it and rest. This is not a session where pushing through is appropriate.",
    sequences: {
      20: ["yoga-cat-cow-flow", "yoga-cobra", "yoga-bridge-pose", "yoga-supine-twist", "yoga-seated-forward-fold", "yoga-corpse-pose"],
      30: ["yoga-cat-cow-flow", "yoga-downward-dog", "yoga-cobra", "yoga-bridge-pose", "yoga-hip-strength", "yoga-supine-twist", "yoga-seated-forward-fold", "yoga-legs-up-wall", "yoga-corpse-pose"],
      45: ["yoga-cat-cow-flow", "yoga-downward-dog", "yoga-crescent-lunge", "yoga-cobra", "yoga-backbend-series", "yoga-bridge-pose", "yoga-hip-strength", "yoga-pigeon-pose", "yoga-supine-twist", "yoga-seated-forward-fold", "yoga-legs-up-wall", "yoga-restorative-sequence", "yoga-corpse-pose"]
    }
  },
  pilates: {
    label: "Pilates",
    icon: "\uD83D\uDC83",
    coachIntro: "Pilates works from the inside out. The movements are small but the demand on the deep stabilisers is significant. Precision matters more than effort. If you cannot maintain control, reduce the range rather than muscle through.",
    sequences: {
      20: ["pilates-hundred", "pilates-roll-up", "pilates-single-leg-stretch", "pilates-double-leg-stretch", "pilates-spine-stretch", "pilates-roll-down-standing"],
      30: ["pilates-hundred", "pilates-roll-up", "pilates-single-leg-stretch", "pilates-double-leg-stretch", "pilates-scissors", "pilates-criss-cross", "pilates-spine-stretch", "pilates-swan", "pilates-child-pose", "pilates-roll-down-standing"],
      45: ["pilates-hundred", "pilates-roll-up", "pilates-single-leg-stretch", "pilates-double-leg-stretch", "pilates-scissors", "pilates-criss-cross", "pilates-teaser", "pilates-swan", "pilates-swimming", "pilates-side-kick", "pilates-spine-stretch", "pilates-mermaid", "pilates-child-pose", "pilates-roll-down-standing"]
    }
  }
};

// ── Build exercise lookup ─────────────────────────────────────────────────────

const ALL_EXERCISES = [...(YOGA || []), ...(PILATES || [])];

function getExercise(id) {
  return ALL_EXERCISES.find(e => e.id === id) || null;
}

// ── State ─────────────────────────────────────────────────────────────────────

let focusId      = null;   // session focus key
let durationMins = 20;     // 20 | 30 | 45
let phase        = "focus"; // "focus" | "duration" | "intro" | "session" | "done"
let stepIndex    = 0;      // current pose index
let holdTimer    = null;   // setInterval handle
let holdRemaining = 0;     // seconds left in hold
let timerStarted  = false;

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (phase === "focus")    return renderFocusSelector();
  if (phase === "duration") return renderDurationSelector();
  if (phase === "intro")    return renderIntro();
  if (phase === "session")  return renderSession();
  if (phase === "done")     return renderDone();
  return renderFocusSelector();
}

// ── Phase: Focus selector ─────────────────────────────────────────────────────

function renderFocusSelector() {
  return `
    <div class="view yoga-view">
      <div class="view-header">
        <h1>Yoga &amp; Pilates</h1>
      </div>

      <div class="card card-coach yoga-coach-card">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p>What kind of session feels right today?</p>
      </div>

      <div class="yoga-focus-grid" role="group" aria-label="Session focus">
        ${Object.entries(SESSIONS).map(([id, session]) => `
          <button class="yoga-focus-card ${focusId === id ? "selected" : ""}"
                  data-focus="${id}"
                  aria-pressed="${focusId === id}">
            <span class="yoga-focus-icon" aria-hidden="true">${session.icon}</span>
            <span class="yoga-focus-label">${session.label}</span>
          </button>
        `).join("")}
      </div>

      ${focusId ? `
        <button class="btn btn-primary btn-large btn-full yoga-continue-btn"
                id="yoga-to-duration"
                style="margin-top:var(--space-5);">
          Continue &rarr;
        </button>
      ` : ""}
    </div>
  `;
}

// ── Phase: Duration selector ──────────────────────────────────────────────────

function renderDurationSelector() {
  const session = SESSIONS[focusId];
  return `
    <div class="view yoga-view">
      <div class="view-header">
        <h1>${session.icon} ${session.label}</h1>
      </div>

      <div class="card card-coach yoga-coach-card">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p>How much time do you have?</p>
      </div>

      <div class="yoga-duration-grid" role="group" aria-label="Session length">
        ${[20, 30, 45].map(mins => {
          const poseCount = session.sequences[mins]?.length || 0;
          return `
            <button class="yoga-duration-card ${durationMins === mins ? "selected" : ""}"
                    data-duration="${mins}"
                    aria-pressed="${durationMins === mins}">
              <span class="yoga-duration-num">${mins}</span>
              <span class="yoga-duration-unit">mins</span>
              <span class="yoga-duration-poses">${poseCount} poses</span>
            </button>
          `;
        }).join("")}
      </div>

      <button class="btn btn-primary btn-large btn-full"
              id="yoga-to-intro"
              style="margin-top:var(--space-5);">
        See session &rarr;
      </button>

      <button class="btn btn-ghost btn-full"
              id="yoga-back-focus"
              style="margin-top:var(--space-3);">
        &larr; Change focus
      </button>
    </div>
  `;
}

// ── Phase: Intro ──────────────────────────────────────────────────────────────

function renderIntro() {
  const session   = SESSIONS[focusId];
  const sequence  = session.sequences[durationMins] || [];
  const exercises = sequence.map(id => getExercise(id)).filter(Boolean);

  return `
    <div class="view yoga-view">
      <div class="view-header">
        <h1>${session.icon} ${session.label}</h1>
        <p class="text-secondary">${durationMins} minutes &middot; ${exercises.length} poses</p>
      </div>

      <div class="card card-coach yoga-coach-card">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p>${session.coachIntro}</p>
      </div>

      <div class="card yoga-sequence-preview">
        <h3>What we are doing</h3>
        <ol class="yoga-pose-list">
          ${exercises.map(ex => `
            <li>${ex.name}
              ${ex.duration ? `<span class="yoga-pose-time">${Math.round(ex.duration / 60)} min</span>` : ""}
            </li>
          `).join("")}
        </ol>
      </div>

      <button class="btn btn-primary btn-large btn-full"
              id="yoga-begin-btn"
              style="margin-top:var(--space-5);">
        Begin session
      </button>

      <button class="btn btn-ghost btn-full"
              id="yoga-back-duration"
              style="margin-top:var(--space-3);">
        &larr; Change duration
      </button>
    </div>
  `;
}

// ── Phase: Session execution ──────────────────────────────────────────────────

function renderSession() {
  const session   = SESSIONS[focusId];
  const sequence  = session.sequences[durationMins] || [];
  const exercises = sequence.map(id => getExercise(id)).filter(Boolean);
  const ex        = exercises[stepIndex];

  if (!ex) {
    // All done
    phase = "done";
    logSession();
    return renderDone();
  }

  const total    = exercises.length;
  const progress = Math.round((stepIndex / total) * 100);
  const holdSecs = holdRemaining > 0 ? holdRemaining : (ex.duration || 60);
  const isLast   = stepIndex >= total - 1;

  return `
    <div class="view yoga-view" id="yoga-session-view">
      <div class="yoga-session-progress">
        <span class="yoga-session-step">${stepIndex + 1} of ${total}</span>
        <div class="yoga-progress-bar" role="progressbar"
             aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
          <div class="yoga-progress-fill" style="width:${progress}%"></div>
        </div>
      </div>

      <div class="yoga-pose-card card">
        <h2 class="yoga-pose-name">${ex.name}</h2>

        ${ex.coaching ? `
          <p class="yoga-pose-coaching">${ex.coaching}</p>
        ` : ""}

        <!-- Timer -->
        <div class="yoga-timer-block" id="yoga-timer-block">
          <div class="yoga-timer-circle" style="--phase-colour: var(--color-primary);">
            <div class="yoga-timer-label" id="yoga-timer-label">
              ${timerStarted ? "Hold" : "Tap to start"}
            </div>
            <div class="yoga-timer-seconds" id="yoga-timer-display">
              ${formatTime(holdSecs)}
            </div>
          </div>
          <button class="btn btn-primary btn-full yoga-timer-btn"
                  id="yoga-timer-btn"
                  style="margin-top:var(--space-4);">
            ${!timerStarted ? "Start timer" : holdTimer ? "Pause" : "Resume"}
          </button>
        </div>

        <!-- Instructions -->
        ${ex.instructions?.length ? `
          <details class="yoga-instructions" style="margin-top:var(--space-4);">
            <summary class="yoga-instructions-summary">How to do it</summary>
            <ol class="yoga-instructions-list">
              ${ex.instructions.map(step => `<li>${step}</li>`).join("")}
            </ol>
          </details>
        ` : ""}
      </div>

      <div class="yoga-session-actions">
        <button class="btn btn-primary btn-large btn-full"
                id="yoga-next-btn"
                style="margin-top:var(--space-4);">
          ${isLast ? "Finish session" : "Done \u2014 Next \u2192"}
        </button>
        <button class="btn btn-ghost btn-small"
                id="yoga-skip-btn"
                style="margin-top:var(--space-2);">
          Skip this pose
        </button>
      </div>
    </div>
  `;
}

// ── Phase: Done ───────────────────────────────────────────────────────────────

function renderDone() {
  const session = SESSIONS[focusId] || {};
  return `
    <div class="view yoga-view">
      <div class="card card-coach yoga-coach-card" style="margin-top:var(--space-8);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h3>Session complete.</h3>
          <p>You gave yourself ${durationMins} minutes for ${session.label || "yoga"}. Notice what feels different from when you started. That is not nothing.</p>
        </div>
      </div>
      <button class="btn btn-primary btn-full"
              id="yoga-done-btn"
              style="margin-top:var(--space-5);">
        Done
      </button>
    </div>
  `;
}

// ── Timer logic ───────────────────────────────────────────────────────────────

function startHoldTimer(duration) {
  if (holdTimer) clearInterval(holdTimer);
  if (!holdRemaining) holdRemaining = duration;
  timerStarted = true;

  holdTimer = setInterval(() => {
    holdRemaining--;
    const el = document.getElementById("yoga-timer-display");
    if (el) el.textContent = formatTime(holdRemaining);

    if (holdRemaining <= 0) {
      clearInterval(holdTimer);
      holdTimer = null;
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
      const label = document.getElementById("yoga-timer-label");
      const btn   = document.getElementById("yoga-timer-btn");
      if (label) label.textContent = "Done";
      if (btn)   btn.textContent   = "Time is up";
    }
  }, 1000);
}

function pauseHoldTimer() {
  if (holdTimer) { clearInterval(holdTimer); holdTimer = null; }
}

function stopTimer() {
  if (holdTimer) clearInterval(holdTimer);
  holdTimer     = null;
  holdRemaining = 0;
  timerStarted  = false;
}

function formatTime(secs) {
  const m = Math.floor(Math.abs(secs) / 60);
  const s = Math.abs(secs) % 60;
  return m + ":" + String(s).padStart(2, "0");
}

// ── Session logging ───────────────────────────────────────────────────────────

function logSession() {
  const session = SESSIONS[focusId];
  const log     = store.get("activityLog") || [];
  log.push({
    id:       "yoga-" + Date.now(),
    type:     "yoga",
    name:     (session?.label || "Yoga") + " \u2014 " + durationMins + " mins",
    source:   "yoga-session",
    duration: durationMins,
    credits:  35,
    loggedAt: new Date().toISOString()
  });
  store.set("activityLog", log);
  store.set("totalCredits", (store.get("totalCredits") || 0) + 35);
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // Focus selector
  document.querySelectorAll("[data-focus]").forEach(btn => {
    btn.addEventListener("click", () => {
      focusId = btn.dataset.focus;
      document.querySelectorAll("[data-focus]").forEach(b => {
        b.classList.toggle("selected", b === btn);
        b.setAttribute("aria-pressed", b === btn);
      });
      // Show continue button
      const continueBtn = document.getElementById("yoga-to-duration");
      if (!continueBtn) rerender();
    });
  });

  document.getElementById("yoga-to-duration")?.addEventListener("click", () => {
    phase = "duration";
    rerender();
  });

  // Duration selector
  document.querySelectorAll("[data-duration]").forEach(btn => {
    btn.addEventListener("click", () => {
      durationMins = parseInt(btn.dataset.duration);
      document.querySelectorAll("[data-duration]").forEach(b => {
        b.classList.toggle("selected", b === btn);
        b.setAttribute("aria-pressed", b === btn);
      });
    });
  });

  document.getElementById("yoga-to-intro")?.addEventListener("click", () => {
    phase = "intro";
    rerender();
  });

  document.getElementById("yoga-back-focus")?.addEventListener("click", () => {
    phase = "focus";
    rerender();
  });

  // Intro
  document.getElementById("yoga-begin-btn")?.addEventListener("click", () => {
    phase     = "session";
    stepIndex = 0;
    stopTimer();
    rerender();
  });

  document.getElementById("yoga-back-duration")?.addEventListener("click", () => {
    phase = "duration";
    rerender();
  });

  // Session — timer
  document.getElementById("yoga-timer-btn")?.addEventListener("click", () => {
    const session   = SESSIONS[focusId];
    const sequence  = session.sequences[durationMins] || [];
    const exercises = sequence.map(id => getExercise(id)).filter(Boolean);
    const ex        = exercises[stepIndex];
    if (!ex) return;

    if (!timerStarted) {
      // Start — render directly without full rerender to preserve timer
      const label = document.getElementById("yoga-timer-label");
      const btn   = document.getElementById("yoga-timer-btn");
      if (label) label.textContent = "Hold";
      if (btn)   btn.textContent   = "Pause";
      startHoldTimer(ex.duration || 60);
    } else if (holdTimer) {
      // Pause
      pauseHoldTimer();
      const btn = document.getElementById("yoga-timer-btn");
      if (btn) btn.textContent = "Resume";
    } else {
      // Resume
      startHoldTimer(ex.duration || 60);
      const btn = document.getElementById("yoga-timer-btn");
      if (btn) btn.textContent = "Pause";
    }
  });

  // Session — next / skip
  function advanceStep() {
    const session   = SESSIONS[focusId];
    const sequence  = session.sequences[durationMins] || [];
    const exercises = sequence.map(id => getExercise(id)).filter(Boolean);

    stopTimer();
    stepIndex++;

    if (stepIndex >= exercises.length) {
      phase = "done";
      logSession();
    }
    rerender();
  }

  document.getElementById("yoga-next-btn")?.addEventListener("click", advanceStep);
  document.getElementById("yoga-skip-btn")?.addEventListener("click", advanceStep);

  // Done
  document.getElementById("yoga-done-btn")?.addEventListener("click", () => {
    // Reset state
    phase     = "focus";
    stepIndex = 0;
    focusId   = null;
    stopTimer();
    router.navigate("intention");
  });
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
    main.scrollTop = 0;
    window.scrollTo(0, 0);
  }
}
