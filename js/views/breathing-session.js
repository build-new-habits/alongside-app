/**
 * js/views/breathing-session.js - Guided Breathing Session
 *
 * 23 Jul 2026 v2
 *
 * CHANGELOG
 * 23 Jul 2026 v2 - BUILD-3 Section 4. This file never imported
 *   session-guard.js, so the device back gesture during an active
 *   session bypassed the on-screen Exit button's existing partial-save
 *   logic (elapsed >= 30s -> logSession()) entirely - no warning, no
 *   save. Wired mountSessionGuard() to reuse that same threshold and
 *   function on the back-gesture path. On-screen button behaviour
 *   (instant exit, no confirmation card) is unchanged by design - only
 *   the back gesture, the previously-unprotected path, now shows a
 *   confirmation.
 * 21 May 2026 v1 - prior version.
 *
 * Five breathing types. All durations (1, 2, 3, 5, 10 minutes).
 * Guided visual + timer. Vibration API pulse on phase transitions.
 *
 * Breathing types:
 *   1. Box breathing       — 4s in / 4s hold / 4s out / 4s hold
 *   2. 4-7-8               — 4s in / 7s hold / 8s out
 *   3. Physiological sigh  — 2x in (nose) / long out (mouth)
 *   4. Resonance           — 5.5s in / 5.5s out (HRV optimised)
 *   5. Extended exhale     — 4s in / 6s out
 *
 * Route: "breathing-session"
 * Nav: hidden (session view)
 * Credits: 10 per minute completed
 */

import { store }  from "../store.js";
import { router } from "../router.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
let phase          = "picker";    // "picker" | "duration" | "session" | "done"
let selectedType   = null;
let selectedMins   = null;
let sessionInterval = null;
let phaseInterval  = null;
let elapsed        = 0;           // total seconds elapsed
let totalSeconds   = 0;
let currentPhase   = null;        // current breath phase label
let phaseRemaining = 0;           // seconds left in current breath phase
let phaseIndex     = 0;           // index within breath cycle
let creditsEarned  = 0;

// ── Breathing type definitions ────────────────────────────────────────────────

const TYPES = [
  {
    id:          "box",
    label:       "Box breathing",
    icon:        "◻",
    tagline:     "Calm the nervous system",
    description: "Equal counts of inhale, hold, exhale, hold. Used by military and athletes for focus under pressure.",
    coachIntro:  "Box breathing gives your nervous system a pattern to follow. Breathe in for 4, hold for 4, out for 4, hold for 4. The box is steady. So will you be.",
    cycle: [
      { label: "Breathe in",  seconds: 4, cue: "Inhale slowly through your nose" },
      { label: "Hold",        seconds: 4, cue: "Chest open, shoulders down" },
      { label: "Breathe out", seconds: 4, cue: "Exhale fully and steadily" },
      { label: "Hold",        seconds: 4, cue: "Pause before the next breath" }
    ]
  },
  {
    id:          "478",
    label:       "4-7-8",
    icon:        "✦",
    tagline:     "Deep relaxation",
    description: "Dr Andrew Weil's technique. A longer hold and extended exhale activate the parasympathetic system.",
    coachIntro:  "The 4-7-8 breath is intentionally slower than it feels comfortable at first. 4 in, 7 hold, 8 out. The long exhale is where the release happens — let it be slow.",
    cycle: [
      { label: "Breathe in",  seconds: 4,  cue: "In through your nose, quietly" },
      { label: "Hold",        seconds: 7,  cue: "Hold gently — do not strain" },
      { label: "Breathe out", seconds: 8,  cue: "Out through your mouth, like a slow sigh" }
    ]
  },
  {
    id:          "sigh",
    label:       "Physiological sigh",
    icon:        "∿",
    tagline:     "Instant stress release",
    description: "Researched at Stanford. A double inhale through the nose fully inflates the lungs, then a long exhale deflates the air sacs and resets CO2 levels.",
    coachIntro:  "The physiological sigh is the fastest known way to reduce stress in real time. Two short inhales through the nose — the second tops up the lungs — then a long exhale. Your body already knows how to do this.",
    cycle: [
      { label: "Inhale",        seconds: 2, cue: "In through your nose" },
      { label: "Top up",        seconds: 1, cue: "One more short inhale — fill the lungs" },
      { label: "Long exhale",   seconds: 6, cue: "Out slowly — let everything go" },
      { label: "Rest",          seconds: 2, cue: "Natural pause before the next breath" }
    ]
  },
  {
    id:          "resonance",
    label:       "Resonance breathing",
    icon:        "≋",
    tagline:     "Optimise heart rate variability",
    description: "5.5 second inhale, 5.5 second exhale. Matches the body's natural resonance frequency, improving HRV.",
    coachIntro:  "Resonance breathing is the rhythm your heart rate variability responds to most. 5.5 seconds in, 5.5 seconds out. Let it feel like a wave — rising and falling without effort.",
    cycle: [
      { label: "Breathe in",  seconds: 5.5, cue: "In through your nose, smooth and steady" },
      { label: "Breathe out", seconds: 5.5, cue: "Out through your nose or mouth, equally steady" }
    ]
  },
  {
    id:          "exhale",
    label:       "Extended exhale",
    icon:        "⟶",
    tagline:     "Activate the rest response",
    description: "Inhale slightly shorter than exhale. The exhale activates the vagus nerve and slows the heart.",
    coachIntro:  "The exhale is where the calm lives. Four seconds in, six seconds out. The longer exhale signals safety to your nervous system. Let the out-breath lead.",
    cycle: [
      { label: "Breathe in",  seconds: 4, cue: "In through your nose" },
      { label: "Breathe out", seconds: 6, cue: "Out slowly — longer than the in-breath" }
    ]
  }
];

const DURATIONS = [
  { mins: 1,  label: "1 min",  desc: "Quick reset" },
  { mins: 2,  label: "2 min",  desc: "Short practice" },
  { mins: 3,  label: "3 min",  desc: "A real session" },
  { mins: 5,  label: "5 min",  desc: "Recommended" },
  { mins: 10, label: "10 min", desc: "Deep practice" }
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function vibrate(pattern) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

// ── Session engine ────────────────────────────────────────────────────────────

function startSession() {
  const type = TYPES.find(t => t.id === selectedType);
  if (!type) return;

  elapsed        = 0;
  totalSeconds   = selectedMins * 60;
  phaseIndex     = 0;
  creditsEarned  = 0;
  phaseRemaining = type.cycle[0].seconds;
  currentPhase   = type.cycle[0];

  // Master clock — ticks every second
  sessionInterval = setInterval(() => {
    elapsed++;

    // Update overall progress bar
    const pct = Math.min(100, Math.round((elapsed / totalSeconds) * 100));
    const bar = document.getElementById("bs-progress-fill");
    if (bar) bar.style.width = pct + "%";

    // Update time remaining
    const remaining = Math.max(0, totalSeconds - elapsed);
    const el = document.getElementById("bs-time-remaining");
    if (el) el.textContent = formatTime(remaining);

    // Credits: 10 per minute
    creditsEarned = Math.floor(elapsed / 60) * 10;

    if (elapsed >= totalSeconds) {
      clearInterval(sessionInterval);
      clearInterval(phaseInterval);
      sessionInterval = null;
      phaseInterval   = null;
      logSession();
      phase = "done";
      rerender();
      vibrate([200, 100, 200, 100, 200]);
    }
  }, 1000);

  // Phase clock — advances breath cycle
  startPhase(type);
}

function startPhase(type) {
  const cycle = type.cycle;

  function tick() {
    const duration = cycle[phaseIndex].seconds;
    phaseRemaining = duration;
    currentPhase   = cycle[phaseIndex];

    // Announce phase to screen reader
    const phaseEl = document.getElementById("bs-phase-label");
    if (phaseEl) phaseEl.textContent = currentPhase.label;
    const cueEl = document.getElementById("bs-phase-cue");
    if (cueEl) cueEl.textContent = currentPhase.cue;

    // Animate the breath circle
    updateBreathCircle(currentPhase.label, duration);

    vibrate(50);

    phaseInterval = setInterval(() => {
      phaseRemaining--;
      const phasePct = Math.max(0, Math.round((phaseRemaining / duration) * 100));
      const fill = document.getElementById("bs-phase-fill");
      if (fill) fill.style.height = phasePct + "%";

      if (phaseRemaining <= 0) {
        clearInterval(phaseInterval);
        phaseIndex = (phaseIndex + 1) % cycle.length;
        tick();
      }
    }, 1000);
  }

  tick();
}

function updateBreathCircle(phaseLabel, duration) {
  const circle = document.getElementById("bs-breath-circle");
  if (!circle) return;
  const label = phaseLabel.toLowerCase();
  if (label.includes("in") || label.includes("inhale") || label.includes("top")) {
    circle.style.transform = "scale(1.35)";
    circle.style.transition = `transform ${duration}s ease-in-out`;
  } else if (label.includes("out") || label.includes("exhale")) {
    circle.style.transform = "scale(0.75)";
    circle.style.transition = `transform ${duration}s ease-in-out`;
  } else {
    // Hold / rest — stay at current size
    circle.style.transition = "none";
  }
}

function logSession() {
  const log   = store.get("activityLog") || [];
  const today = new Date().toISOString().split("T")[0];
  log.push({
    id:          today + "-breathing-" + Math.random().toString(36).slice(2, 6),
    date:        today,
    type:        "mindfulness",
    name:        `${TYPES.find(t => t.id === selectedType)?.label || "Breathing"} — ${selectedMins} min`,
    durationMins: selectedMins,
    creditsEarned,
    source:      "self-directed",
    completedAt: new Date().toISOString()
  });
  store.set("activityLog", log);

  const total = (store.get("totalCredits") || 0) + creditsEarned;
  store.set("totalCredits", total);
}

function resetSession() {
  dismountSessionGuard();
  if (sessionInterval) { clearInterval(sessionInterval); sessionInterval = null; }
  if (phaseInterval)   { clearInterval(phaseInterval);   phaseInterval   = null; }
  phase        = "picker";
  selectedType = null;
  selectedMins = null;
  elapsed      = 0;
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (phase === "picker")   return renderPicker();
  if (phase === "duration") return renderDuration();
  if (phase === "session")  return renderSession();
  if (phase === "done")     return renderDone();
  return renderPicker();
}

function renderPicker() {
  return `
    <div class="view breathing-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="bs-back-btn" aria-label="Back to Noticing">
          ← Back
        </button>
        <span class="workout-header-title">Breathing</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          Choose a breathing practice. All of them work — the best one is the one you'll actually do.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        ${TYPES.map(t => `
          <button class="card bs-type-card" data-type="${t.id}"
                  style="display: flex; align-items: flex-start; gap: var(--space-4); text-align: left; width: 100%; cursor: pointer; background: var(--color-surface);"
                  aria-label="${t.label}: ${t.tagline}">
            <span style="font-size: 1.75rem; flex-shrink: 0; line-height: 1.2; margin-top: 2px;" aria-hidden="true">${t.icon}</span>
            <div style="flex: 1; min-width: 0;">
              <p style="font-size: var(--text-base); font-weight: var(--font-semibold); margin-bottom: var(--space-1);">${t.label}</p>
              <p class="text-secondary" style="font-size: var(--text-sm); margin-bottom: var(--space-1);">${t.tagline}</p>
              <p class="text-muted" style="font-size: var(--text-xs);">${t.description}</p>
            </div>
            <span style="color: var(--color-primary); font-size: 1.25rem; flex-shrink: 0; margin-top: 2px;" aria-hidden="true">›</span>
          </button>
        `).join("")}
      </div>

    </div>
  `;
}

function renderDuration() {
  const type = TYPES.find(t => t.id === selectedType);
  return `
    <div class="view breathing-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="bs-back-btn" aria-label="Back to type picker">
          ← Back
        </button>
        <span class="workout-header-title">${type?.label || "Breathing"}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${type?.coachIntro || ""}</p>
      </div>

      <p class="text-secondary text-sm" style="margin-bottom: var(--space-3);">
        How long would you like to practice?
      </p>

      <div style="display: flex; flex-direction: column; gap: var(--space-3);"
           role="group" aria-label="Choose duration">
        ${DURATIONS.map(d => `
          <button class="card bs-duration-btn" data-mins="${d.mins}"
                  style="display: flex; align-items: center; justify-content: space-between; text-align: left; width: 100%; cursor: pointer;"
                  aria-label="${d.label}: ${d.desc}">
            <div>
              <span style="font-size: var(--text-lg); font-weight: var(--font-semibold);">${d.label}</span>
              <span class="text-secondary" style="font-size: var(--text-sm); margin-left: var(--space-2);">${d.desc}</span>
            </div>
            ${d.mins === 5 ? '<span style="font-size: var(--text-xs); color: var(--color-primary);">Recommended</span>' : ""}
          </button>
        `).join("")}
      </div>

    </div>
  `;
}

function renderSession() {
  const type = TYPES.find(t => t.id === selectedType);
  const firstPhase = type?.cycle[0];
  return `
    <div class="view breathing-view breathing-view--session">

      <!-- Progress bar across top -->
      <div class="bs-top-progress" role="progressbar"
           aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
           aria-label="Breathing session progress">
        <div class="bs-progress-fill" id="bs-progress-fill" style="width: 0%"></div>
      </div>

      <div class="bs-session-header">
        <button class="btn btn-ghost btn-small" id="bs-exit-btn" aria-label="Exit breathing session">
          Exit
        </button>
        <span class="text-sm text-muted" id="bs-time-remaining" aria-live="polite">
          ${formatTime(selectedMins * 60)}
        </span>
      </div>

      <!-- Breath circle -->
      <div class="bs-circle-container" aria-hidden="true">
        <div class="bs-breath-circle" id="bs-breath-circle"></div>
      </div>

      <!-- Phase label and cue -->
      <div class="bs-phase-info" aria-live="polite" aria-atomic="true">
        <p class="bs-phase-label" id="bs-phase-label">
          ${firstPhase?.label || "Breathe in"}
        </p>
        <p class="bs-phase-cue text-sm text-muted" id="bs-phase-cue">
          ${firstPhase?.cue || ""}
        </p>
      </div>

      <!-- Session type label -->
      <p class="text-xs text-muted" style="text-align: center; margin-top: var(--space-4);">
        ${type?.label || ""}
      </p>

    </div>
  `;
}

function renderDone() {
  const type = TYPES.find(t => t.id === selectedType);
  const name = store.get("name") || "";
  return `
    <div class="view breathing-view" style="text-align: center;">

      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">
            ${name ? name + " — " : ""}${selectedMins} ${selectedMins === 1 ? "minute" : "minutes"} of ${type?.label?.toLowerCase() || "breathing"}.
            That is ${selectedMins} minutes your nervous system will remember.
          </p>
          ${creditsEarned > 0
            ? `<p class="text-sm text-muted" style="margin-top: var(--space-2);">+${creditsEarned} credits</p>`
            : ""}
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);">
        <button class="btn btn-primary btn-full" id="bs-again-btn">
          Another session
        </button>
        <button class="btn btn-ghost btn-full" id="bs-home-btn">
          Back to Noticing
        </button>
      </div>

    </div>
  `;
}

// ── Rerender ──────────────────────────────────────────────────────────────────

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // 23 Jul 2026 v2 (BUILD-3 Section 4): this file never imported
  // session-guard.js, so the device back gesture during an active session
  // bypassed the on-screen Exit button's existing partial-save logic
  // (elapsed >= 30s -> logSession()) entirely - no warning, no save.
  // Wired here to reuse that same threshold and function on the
  // back-gesture path. On-screen Exit button behaviour (instant exit, no
  // confirmation card) is unchanged by design - only the back gesture,
  // the previously-unprotected path, now shows a confirmation.
  mountSessionGuard({
    isActive: () => phase === "session",
    label:    "breathing session",
    onExit:   () => {
      if (elapsed >= 30) logSession();
      resetSession();
      router.navigate("noticing");
    }
  });

  // Back button
  document.getElementById("bs-back-btn")?.addEventListener("click", () => {
    if (phase === "picker") {
      router.navigate("noticing");
    } else {
      phase = phase === "duration" ? "picker" : "picker";
      rerender();
    }
  });

  // Type selection
  document.querySelectorAll(".bs-type-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedType = btn.dataset.type;
      phase        = "duration";
      rerender();
    });
  });

  // Duration selection — start session
  document.querySelectorAll(".bs-duration-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMins = parseInt(btn.dataset.mins);
      phase        = "session";
      rerender();
      // Start after render so DOM is ready
      requestAnimationFrame(() => startSession());
    });
  });

  // Exit during session
  document.getElementById("bs-exit-btn")?.addEventListener("click", () => {
    if (sessionInterval) clearInterval(sessionInterval);
    if (phaseInterval)   clearInterval(phaseInterval);
    sessionInterval = null;
    phaseInterval   = null;
    // Log partial if >30 seconds elapsed
    if (elapsed >= 30) logSession();
    resetSession();
    router.navigate("noticing");
  });

  // Done screen
  document.getElementById("bs-again-btn")?.addEventListener("click", () => {
    resetSession();
    rerender();
  });

  document.getElementById("bs-home-btn")?.addEventListener("click", () => {
    resetSession();
    router.navigate("noticing");
  });
}

// Called by router.navigate() before leaving this view — stops active timers
export function onUnmount() {
  if (sessionInterval) { clearInterval(sessionInterval); sessionInterval = null; }
  if (phaseInterval)   { clearInterval(phaseInterval);   phaseInterval   = null; }
}
