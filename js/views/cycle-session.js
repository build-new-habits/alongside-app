/**
 * cycle-session.js - Guided Cycle Session
 *
 * 23 Jul 2026 v3
 *
 * CHANGELOG
 * 23 Jul 2026 v3 - BUILD-3 exit-guard audit fix. onExit (mountSessionGuard)
 *   was navigating to reflect.js without ever calling savePartialSession()
 *   first - the on-screen Exit button (showExitConfirm) called it
 *   correctly, but the device back-gesture path silently dropped partial
 *   progress. Fixed to match yoga-session.js v4's confirmed-working
 *   pattern exactly. Bundled while the file was open: endSession() and
 *   savePartialSession() migrated from direct activityLog writes to
 *   store.logActivity() (dedupe-guarded shared path, store.js v10).
 * 19 May 2026 v2 - prior version.
 *
 * Ride type selector, session type, 4 durations.
 * Effort zone prompts. Condition-aware cadence and posture cues.
 *
 * Ride types: road | indoor | turbo
 * Types: steady | intervals | ftp-builder
 * Durations: 20 / 30 / 45 / 60 minutes
 *
 * Route: cycle-session
 * Nav: hidden (session view)
 * Credits: 50 base + 10 per prompt dismissed
 */

import { store } from "../store.js";
import { renderLogBlock, attachLogEvents } from "../session-log.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
let phase          = "ride-type";  // + overview
let selectedRide   = null;
let selectedType   = null;
let selectedMins   = null;
let sessionTimer   = null;
let elapsed        = 0;
let paused         = false;
let sessionStarted = false;
let promptIndex    = 0;
let activePrompt   = null;
let creditsEarned  = 0;

const RIDE_TYPES = [
  { id: "road",    label: "Road ride",     icon: "\uD83D\uDEB4", description: "Outdoors. Real terrain and conditions." },
  { id: "indoor",  label: "Indoor bike",   icon: "\uD83C\uDFCB", description: "Spin bike or exercise bike at the gym or studio." },
  { id: "turbo",   label: "Turbo trainer", icon: "\u26A1",        description: "Your own bike on a turbo trainer at home." },
];

const SESSION_TYPES = [
  { id: "steady",      label: "Steady ride",   icon: "\uD83C\uDF0A",  description: "Zone 2 effort — aerobic base building" },
  { id: "intervals",   label: "Intervals",     icon: "\u26A1",         description: "Hard efforts with recovery between" },
  { id: "ftp-builder", label: "Tempo",         icon: "\uD83D\uDD25",   description: "Sustained moderate-high effort" },
];

const DURATIONS = [
  { mins: 20, label: "20 min" },
  { mins: 30, label: "30 min" },
  { mins: 45, label: "45 min" },
  { mins: 60, label: "60 min" },
];

const PROMPTS = {
  steady: [
    { text: "Zone 2 effort — you should be able to hold a conversation. If not, drop the intensity.", action: "Dropping slightly" },
    { text: "Cadence check. Aim for 85-95 RPM. High cadence protects the knees and improves efficiency.", action: "Adjusting" },
    { text: "Core engaged lightly. Your upper body should not be rocking side to side.", action: "Stabilised" },
    { text: "Relax your grip on the bars. Tension there wastes energy.", action: "Relaxed" },
    { text: "Zone 2 is where your aerobic base is built. This pays dividends over weeks.", action: "Keep going" },
    { text: "Halfway. Maintain your cadence and effort level.", action: "Holding it" },
    { text: "Breathing should be controlled and rhythmic.", action: "Breathing well" },
  ],
  intervals: [
    { text: "Build to your hard effort now. About 80-85% of maximum — uncomfortable but sustainable.", action: "Working" },
    { text: "Recovery phase. Drop right down. Zone 1 — easy spinning.", action: "Recovering" },
    { text: "Next effort. Get back to 80% within 30 seconds.", action: "Building up" },
    { text: "Recover again. Use this fully.", action: "Recovering" },
    { text: "Halfway through the intervals. Your form matters more as you fatigue.", action: "Staying tight" },
    { text: "Final efforts coming. Give what you have left.", action: "Final push" },
    { text: "Easy spin to the finish. Legs out, heart rate down.", action: "Easing in" },
  ],
  "ftp-builder": [
    { text: "Settle into your tempo effort. You should feel this but be able to sustain it.", action: "Settled" },
    { text: "Cadence at 80-90 RPM. Power through the pedal stroke, not just the down phase.", action: "Adjusting" },
    { text: "This is threshold work. It builds your ability to sustain higher efforts for longer.", action: "Keep going" },
    { text: "Halfway. The second half of a tempo effort is where mental resilience is trained.", action: "Holding it" },
    { text: "Breathing controlled. In through the nose, out through the mouth if possible.", action: "Breathing" },
    { text: "Final minutes. Maintain the effort — do not ease off yet.", action: "Holding" },
  ]
};

function formatMMSS(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildConditionNote() {
  const conditions = store.get("conditions")          || [];
  const painScores = store.get("conditionPainScores") || {};
  const notes = [];
  conditions.forEach(id => {
    const pain = painScores[id] || 0;
    if (pain < 3) return;
    if (id.includes("knee"))      notes.push("With your knee, keep cadence high (90+ RPM) and resistance lower. High resistance and low cadence increases knee stress.");
    if (id.includes("lower-back")) notes.push("Your lower back may benefit from a more upright position today. Avoid aggressive forward lean.");
    if (id.includes("hamstring"))  notes.push("With your hamstring, avoid big gear heavy efforts. Keep cadence up and effort moderate.");
    if (id.includes("achilles"))   notes.push("Achilles can be aggravated by poor cleat position. If using clip-ins, check your float is set correctly.");
  });
  return notes.length > 0 ? notes.join(" ") : null;
}

export function render() {
  if (phase === "ride-type") return renderRideTypeSelector();
  if (phase === "type")      return renderSessionTypeSelector();
  if (phase === "duration")  return renderDurationSelector();
  if (phase === "overview")  return renderCycleOverview();
  if (phase === "cycling")   return renderCycling();
  if (phase === "done")      return renderDone();
  return renderRideTypeSelector();
}

function renderRideTypeSelector() {
  const name = store.get("name") || "";
  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Exit">Exit</button>
        <span class="workout-header-title">Cycle</span>
      </div>
      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${name ? name + ". " : ""}Where are you riding today?</p>
      </div>
      <div class="ws-type-grid" role="group" aria-label="Choose ride type">
        ${RIDE_TYPES.map(r => `
          <button class="ws-type-card" data-ride="${r.id}" aria-label="${r.label}: ${r.description}">
            <span class="ws-type-icon" aria-hidden="true">${r.icon}</span>
            <span class="ws-type-label">${r.label}</span>
            <span class="ws-type-desc">${r.description}</span>
          </button>
        `).join("")}
      </div>
    </div>`;
}

function renderSessionTypeSelector() {
  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Back">Back</button>
        <span class="workout-header-title">Cycle</span>
      </div>
      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">What kind of session?</p>
      </div>
      <div class="ws-type-grid" role="group" aria-label="Choose session type">
        ${SESSION_TYPES.map(t => `
          <button class="ws-type-card" data-session-type="${t.id}" aria-label="${t.label}: ${t.description}">
            <span class="ws-type-icon" aria-hidden="true">${t.icon}</span>
            <span class="ws-type-label">${t.label}</span>
            <span class="ws-type-desc">${t.description}</span>
          </button>
        `).join("")}
      </div>
    </div>`;
}

function renderDurationSelector() {
  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Back">Back</button>
        <span class="workout-header-title">Cycle</span>
      </div>
      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">How long today?</p>
      </div>
      <div class="ws-duration-grid" role="group" aria-label="Choose duration">
        ${DURATIONS.map(d => `
          <button class="ws-duration-card" data-mins="${d.mins}" aria-label="${d.label}">
            <span class="ws-duration-label">${d.label}</span>
          </button>
        `).join("")}
      </div>
    </div>`;
}

function renderCycleOverview() {
  const ride   = RIDE_TYPES.find(r => r.id === selectedRide);
  const stype  = SESSION_TYPES.find(t => t.id === selectedType);
  const prompts = PROMPTS[selectedType] || PROMPTS.steady;
  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Back">\u2190 Back</button>
        <span class="workout-header-title">${ride?.label || "Cycle"} \u2014 ${selectedMins} min</span>
      </div>
      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${stype?.label || "Ride"} session. ${selectedMins} minutes. I will check in with prompts as you ride.</p>
        <p class="text-sm text-muted" style="margin-top: var(--space-2);">
          ${prompts.length} prompts during your session.
        </p>
      </div>
      <div class="card" style="padding: var(--space-4);">
        <h3 style="font-size: var(--text-sm); color: var(--color-primary); margin-bottom: var(--space-3);">What I will prompt you with</h3>
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${prompts.slice(0, 4).map(p => `
            <div style="border-left: 2px solid var(--color-border); padding-left: var(--space-3);">
              <p class="text-sm text-secondary">${p.text}</p>
            </div>
          `).join("")}
        </div>
      </div>
      <button class="btn btn-primary btn-large btn-full" id="cs-start-ride-btn" style="margin-top: var(--space-6);">Let\u2019s go</button>
    </div>
  `;
}

function renderCycling() {
  const totalSecs = selectedMins * 60;
  const remaining = Math.max(0, totalSecs - elapsed);
  const pct       = Math.round((elapsed / totalSecs) * 100);
  const ride      = RIDE_TYPES.find(r => r.id === selectedRide);
  const stype     = SESSION_TYPES.find(t => t.id === selectedType);
  const condNote  = buildConditionNote();

  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-exit-btn" aria-label="End session">Exit</button>
        <span class="workout-header-title">${ride?.label || "Ride"} \u2014 ${stype?.label || ""}</span>
      </div>
      <div class="workout-progress-bar" role="progressbar"
           aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <div class="workout-progress-fill" style="width: ${pct}%"></div>
      </div>
      <div class="ws-timer-block">
        <div class="ws-timer-value" id="cy-timer-display">${formatMMSS(remaining)}</div>
        <div class="ws-timer-label">remaining</div>
      </div>
      ${activePrompt ? `
        <div class="card ws-prompt-card" role="status" aria-live="polite">
          <p class="ws-prompt-text">${activePrompt.text}</p>
          <button class="btn btn-ghost btn-sm ws-prompt-dismiss" id="cs-prompt-dismiss"
                  aria-label="Acknowledge">
            ${activePrompt.action || "Got it"}
          </button>
        </div>
      ` : `
        <div class="card ws-active-card">
          <p class="text-secondary text-sm" style="text-align: center; padding: var(--space-2) 0;">
            ${!sessionStarted
              ? (condNote || "I\u2019ll check in with prompts as you ride.")
              : "Keep pedalling. I\u2019ll check in along the way."}
          </p>
        </div>
      `}
      <div class="ws-controls">
        ${!sessionStarted
          ? `<button class="btn btn-primary btn-large btn-full" id="cs-start-btn">Start ride</button>`
          : `<button class="btn ${paused ? "btn-primary" : "btn-secondary"} btn-large btn-full"
                     id="cs-pause-btn" aria-label="${paused ? "Resume" : "Pause"}">
               ${paused ? "Resume" : "Pause"}
             </button>`}
      </div>
    </div>`;
}

// LOG-4. These views log against the ACTIVITY, not an exercise -- there is
// no exercise object here and store.logLift() is keyed by id. A stable
// synthetic id per activity type means "last time" is a real comparable
// note rather than one orphaned entry per session.
const LOG_SUBJECT = { id: "activity-cycle", name: "Cycle", equipment: [] };

function renderDone() {
  const name = store.get("name") || "";
  const mins = Math.floor(elapsed / 60);
  const stype = SESSION_TYPES.find(t => t.id === selectedType);
  return `
    <div class="view walk-session-view" style="text-align: center;">
      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h2 style="color: var(--color-primary); margin-bottom: var(--space-2);">Ride done.</h2>
          <p class="coach-message-text">
            ${name ? name + " \u2014 " : ""}${mins} minutes. ${stype?.id === "intervals" ? "Interval sessions improve cycling economy faster than any other training method. Good work." : "Cycling is one of the lowest-impact ways to build cardiovascular fitness. That session counts."}
          </p>
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">+${creditsEarned} credits earned</p>
        </div>
      </div>
      ${renderLogBlock(LOG_SUBJECT, "cycle-log", "distance")}

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);">
        <button class="btn btn-primary btn-full" id="cs-reflect-btn">How did that feel?</button>
        <button class="btn btn-ghost btn-full" id="cs-home-btn">Back to today</button>
      </div>
    </div>`;
}

function startSession() {
  sessionStarted = true;
  paused         = false;
  creditsEarned  = 50;
  const totalSecs = selectedMins * 60;
  const freqSecs  = selectedType === "intervals" ? 5 * 60 : selectedType === "ftp-builder" ? 6 * 60 : 8 * 60;
  let nextPromptAt = freqSecs;

  sessionTimer = setInterval(() => {
    if (paused) return;
    elapsed++;
    const remaining = Math.max(0, totalSecs - elapsed);
    const timerEl = document.getElementById("cy-timer-display");
    if (timerEl) timerEl.textContent = formatMMSS(remaining);
    const bar = document.querySelector(".workout-progress-fill");
    if (bar) bar.style.width = `${Math.min(100, Math.round((elapsed / totalSecs) * 100))}%`;

    if (elapsed >= nextPromptAt && !activePrompt && elapsed < totalSecs - 120) {
      const pool = PROMPTS[selectedType] || PROMPTS.steady;
      activePrompt = pool[promptIndex % pool.length];
      promptIndex++;
      nextPromptAt += freqSecs;
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      rerender();
    }
    if (elapsed >= totalSecs) endSession();
  }, 1000);
  rerender();
}

function endSession() {
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }

  // 23 Jul 2026 v3 (BUILD-3): migrated to store.logActivity(), matching
  // yoga-session.js v4's confirmed-working pattern.
  const pending = store.get("currentActivityEntry");
  const nowIso  = new Date().toISOString();

  const activityEntry = store.logActivity({
    ...(pending || { type: "cycle", source: "self-directed" }),
    type:          "cycle",
    sessionEnd:    nowIso,
    completedAt:   nowIso,
    status:        "completed",
    durationMins:  Math.floor(elapsed / 60),
    creditsEarned
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }

  store.set("totalCredits",       (store.get("totalCredits") || 0) + creditsEarned);
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    "Cycle");
  phase = "done";
  rerender();
}

function resetSession() {
  dismountSessionGuard();
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }
  phase = "ride-type"; selectedRide = null; selectedType = null;
  selectedMins = null; elapsed = 0; paused = false;
  sessionStarted = false; promptIndex = 0; activePrompt = null; creditsEarned = 0;
}

// ── Exit confirmation overlay ──────────────────────────────────────────────
// Shown when user taps Exit during an active session.
// Replaces browser confirm() with a coach-voiced in-app card.

function showExitConfirm() {
  // Pause any running timer
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }

  const overlay = document.createElement("div");
  overlay.className = "session-exit-overlay";
  overlay.id        = "session-exit-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Exit session confirmation");
  overlay.innerHTML = `
    <div class="session-exit-card">
      <div class="session-exit-coach-row">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="session-exit-coach-text">
          Hold on — if you leave now this ride won’t be saved. Are you sure?
        </p>
      </div>
      <div class="session-exit-actions">
        <button class="btn btn-primary btn-full" id="exit-confirm-stay"
                aria-label="Stay in session">
          Stay in session
        </button>
        <button class="btn btn-ghost btn-full" id="exit-confirm-leave"
                aria-label="Exit and save progress so far">
          Exit and save progress
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Stay — remove overlay and resume
  document.getElementById("exit-confirm-stay").addEventListener("click", () => {
    overlay.remove();
  });

  // Leave — save partial entry and navigate to reflect
  document.getElementById("exit-confirm-leave").addEventListener("click", () => {
    overlay.remove();
    savePartialSession();
    resetSession();
    router.navigate("reflect");
  });
}

// 23 Jul 2026 v3 (BUILD-3): migrated to store.logActivity(), matching
// yoga-session.js v4's confirmed-working pattern. `elapsed` is a genuine
// running counter in this file (unlike core-session.js/yoga-session.js),
// so durationMins is computed for real, not left null.
function savePartialSession() {
  const pending = store.get("currentActivityEntry");
  const nowIso  = new Date().toISOString();

  const activityEntry = store.logActivity({
    ...(pending || { type: "cycle", source: "self-directed" }),
    type:          "cycle",
    sessionEnd:    nowIso,
    completedAt:   nowIso,
    status:        "partial",
    durationMins:  Math.floor(elapsed / 60),
    creditsEarned: typeof creditsEarned !== "undefined" ? creditsEarned : 0
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }
}


function rerender() {
  const main = document.getElementById("main-content");
  if (main) { main.innerHTML = render(); onMount(); }
}

export function onMount() {
  // LOG-4. Only present on the done screen; attachLogEvents() no-ops when
  // the block is absent and guards double-binding when it is not.
  attachLogEvents(LOG_SUBJECT, "cycle-log");

  mountSessionGuard({
    isActive: () => phase === "cycling" && sessionStarted,
    label:    "cycle session",
    onExit:   () => { savePartialSession(); resetSession(); router.navigate("reflect"); }
  });
  document.getElementById("cs-back-btn")?.addEventListener("click", () => {
    if (phase === "ride-type") { resetSession(); router.navigate("intention"); }
    else if (phase === "type")     { phase = "ride-type"; rerender(); }
    else if (phase === "duration") { phase = "type";      rerender(); }
    else if (phase === "overview") { phase = "duration";  rerender(); }
  });
  document.getElementById("cs-exit-btn")?.addEventListener("click", showExitConfirm);
  document.querySelectorAll("[data-ride]").forEach(btn => {
    btn.addEventListener("click", () => { selectedRide = btn.dataset.ride; phase = "type"; rerender(); });
  });
  document.querySelectorAll("[data-session-type]").forEach(btn => {
    btn.addEventListener("click", () => { selectedType = btn.dataset.sessionType; phase = "duration"; rerender(); });
  });
  document.querySelectorAll(".ws-duration-card").forEach(btn => {
    btn.addEventListener("click", () => { selectedMins = parseInt(btn.dataset.mins); phase = "overview"; rerender(); });
  });
  document.getElementById("cs-start-btn")?.addEventListener("click", startSession);
  document.getElementById("cs-start-ride-btn")?.addEventListener("click", () => { phase = "cycling"; rerender(); });
  document.getElementById("cs-pause-btn")?.addEventListener("click", () => { paused = !paused; rerender(); });
  document.getElementById("cs-prompt-dismiss")?.addEventListener("click", () => {
    creditsEarned += 10; activePrompt = null; rerender();
  });
  document.getElementById("cs-reflect-btn")?.addEventListener("click", () => { resetSession(); router.navigate("reflect"); });
  document.getElementById("cs-home-btn")?.addEventListener("click", () => { resetSession(); router.navigate("intention"); });
}
