/**
 * swim-session.js - Guided Swim Session
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
 * Stroke selector, session type (steady or intervals), 4 durations.
 * Timed session with timed coaching prompts. Condition-aware.
 *
 * Strokes: freestyle | breaststroke | backstroke | mixed
 * Types: steady | intervals
 * Durations: 20 / 30 / 40 / 60 minutes
 *
 * Route: swim-session
 * Nav: hidden (session view)
 * Credits: 50 base + 10 per prompt dismissed
 */

import { store } from "../store.js";
import { renderLogBlock, attachLogEvents } from "../session-log.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
let phase          = "stroke";  // "stroke" | "type" | "duration" | "overview" | "swimming" | "done"
let selectedStroke = null;
let selectedType   = null;
let selectedMins   = null;
let sessionTimer   = null;
let elapsed        = 0;
let paused         = false;
let sessionStarted = false;
let promptIndex    = 0;
let activePrompt   = null;
let creditsEarned  = 0;

const STROKES = [
  { id: "freestyle",    label: "Freestyle",    icon: "\uD83C\uDFCA", description: "Front crawl — most efficient stroke for fitness" },
  { id: "breaststroke", label: "Breaststroke", icon: "\uD83D\uDC38", description: "Lower intensity, good for technique focus" },
  { id: "backstroke",   label: "Backstroke",   icon: "\u2B07\uFE0F",  description: "Great for posture and upper back" },
  { id: "mixed",        label: "Mixed",        icon: "\uD83C\uDF00",  description: "Rotate strokes each length" },
];

const SESSION_TYPES = [
  { id: "steady",    label: "Steady swim",  icon: "\uD83C\uDF0A", description: "Consistent effort throughout" },
  { id: "intervals", label: "Intervals",   icon: "\u26A1",        description: "Hard lengths, easy lengths alternating" },
];

const DURATIONS = [
  { mins: 20, label: "20 min" },
  { mins: 30, label: "30 min" },
  { mins: 40, label: "40 min" },
  { mins: 60, label: "60 min" },
];

const PROMPTS = {
  steady: [
    { text: "Check your stroke rate. Steady and controlled is better than fast and sloppy.", action: "On it" },
    { text: "Breathe on every two strokes if freestyle. Every three if comfortable.", action: "Breathing" },
    { text: "Reach long on each stroke. Full extension before the pull.", action: "Extending" },
    { text: "Kick from the hip, not the knee. Ankles loose.", action: "Adjusted" },
    { text: "Halfway. Maintain your effort level.", action: "Holding it" },
    { text: "Focus on your turns. A clean turn saves energy.", action: "On it" },
    { text: "You are building cardiovascular fitness and muscular endurance simultaneously.", action: "Keep going" },
  ],
  intervals: [
    { text: "Hard length now. Push the effort to about 80%.", action: "Working" },
    { text: "Easy length. Technical focus only.", action: "Easy now" },
    { text: "Hard again. Maintain your form even when tired.", action: "Pushing" },
    { text: "Easy. Use this to recover fully.", action: "Recovering" },
    { text: "Keep alternating. The contrast between effort and recovery is the training.", action: "On it" },
    { text: "Final hard efforts. Everything you have left.", action: "Final push" },
    { text: "Easy to the finish. Smooth strokes.", action: "Easing in" },
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
    if (id.includes("shoulder")) notes.push("With your shoulder, avoid butterfly and high-intensity freestyle. Breaststroke or backstroke are safer today.");
    if (id.includes("lower-back")) notes.push("Your lower back benefits from swimming. Backstroke in particular decompresses the spine.");
    if (id.includes("knee")) notes.push("Avoid breaststroke kick if your knee is painful \u2014 it places stress on the medial ligament. Freestyle kick is fine.");
  });
  return notes.length > 0 ? notes.join(" ") : null;
}

export function render() {
  if (phase === "stroke")   return renderStrokeSelector();
  if (phase === "type")     return renderTypeSelector();
  if (phase === "duration") return renderDurationSelector();
  if (phase === "overview") return renderSwimOverview();
  if (phase === "swimming") return renderSwimming();
  if (phase === "done")     return renderDone();
  return renderStrokeSelector();
}

function renderStrokeSelector() {
  const name = store.get("name") || "";
  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="ss-back-btn" aria-label="Exit">Exit</button>
        <span class="workout-header-title">Swim</span>
      </div>
      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${name ? name + ". " : ""}What stroke today?</p>
      </div>
      <div class="ws-type-grid" role="group" aria-label="Choose stroke">
        ${STROKES.map(s => `
          <button class="ws-type-card" data-stroke="${s.id}" aria-label="${s.label}: ${s.description}">
            <span class="ws-type-icon" aria-hidden="true">${s.icon}</span>
            <span class="ws-type-label">${s.label}</span>
            <span class="ws-type-desc">${s.description}</span>
          </button>
        `).join("")}
      </div>
    </div>`;
}

function renderTypeSelector() {
  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="ss-back-btn" aria-label="Back">Back</button>
        <span class="workout-header-title">Swim</span>
      </div>
      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">Steady or intervals?</p>
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
        <button class="btn btn-ghost" id="ss-back-btn" aria-label="Back">Back</button>
        <span class="workout-header-title">Swim</span>
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

function renderSwimOverview() {
  const stroke = STROKES.find(s => s.id === selectedStroke);
  const stype  = SESSION_TYPES.find(t => t.id === selectedType);
  const prompts = PROMPTS[selectedType] || PROMPTS.steady;
  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="ss-back-btn" aria-label="Back">\u2190 Back</button>
        <span class="workout-header-title">${stroke?.label || "Swim"} \u2014 ${selectedMins} min</span>
      </div>
      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${stype?.label || "Swim"} session. ${selectedMins} minutes. I will check in with prompts as you swim.</p>
        <p class="text-sm text-muted" style="margin-top: var(--space-2);">
          ${prompts.length} prompts during your session. You can dismiss each one to continue.
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
      <button class="btn btn-primary btn-large btn-full" id="ss-start-swim-btn" style="margin-top: var(--space-6);">Let\u2019s go</button>
    </div>
  `;
}

function renderSwimming() {
  const totalSecs = selectedMins * 60;
  const remaining = Math.max(0, totalSecs - elapsed);
  const pct       = Math.round((elapsed / totalSecs) * 100);
  const stroke    = STROKES.find(s => s.id === selectedStroke);
  const condNote  = buildConditionNote();

  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="ss-exit-btn" aria-label="End session">Exit</button>
        <span class="workout-header-title">${stroke?.label || "Swim"}</span>
      </div>
      <div class="workout-progress-bar" role="progressbar"
           aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <div class="workout-progress-fill" style="width: ${pct}%"></div>
      </div>
      <div class="ws-timer-block">
        <div class="ws-timer-value" id="ss-timer-display">${formatMMSS(remaining)}</div>
        <div class="ws-timer-label">remaining</div>
      </div>
      ${activePrompt ? `
        <div class="card ws-prompt-card" role="status" aria-live="polite">
          <p class="ws-prompt-text">${activePrompt.text}</p>
          <button class="btn btn-ghost btn-sm ws-prompt-dismiss" id="ss-prompt-dismiss"
                  aria-label="Acknowledge">
            ${activePrompt.action || "Got it"}
          </button>
        </div>
      ` : `
        <div class="card ws-active-card">
          <p class="text-secondary text-sm" style="text-align: center; padding: var(--space-2) 0;">
            ${!sessionStarted
              ? (condNote || "I\u2019ll check in with you as you swim.")
              : "Keep going. I\u2019ll check in along the way."}
          </p>
        </div>
      `}
      <div class="ws-controls">
        ${!sessionStarted
          ? `<button class="btn btn-primary btn-large btn-full" id="ss-start-btn">Start swim</button>`
          : `<button class="btn ${paused ? "btn-primary" : "btn-secondary"} btn-large btn-full"
                     id="ss-pause-btn" aria-label="${paused ? "Resume" : "Pause"}">
               ${paused ? "Resume" : "Pause"}
             </button>`}
      </div>
    </div>`;
}

// LOG-4. These views log against the ACTIVITY, not an exercise -- there is
// no exercise object here and store.logLift() is keyed by id. A stable
// synthetic id per activity type means "last time" is a real comparable
// note rather than one orphaned entry per session.
const LOG_SUBJECT = { id: "activity-swim", name: "Swim", equipment: [] };

function renderDone() {
  const name = store.get("name") || "";
  const mins = Math.floor(elapsed / 60);
  return `
    <div class="view walk-session-view" style="text-align: center;">
      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h2 style="color: var(--color-primary); margin-bottom: var(--space-2);">Swim done.</h2>
          <p class="coach-message-text">
            ${name ? name + " \u2014 " : ""}${mins} minutes in the water. Swimming trains the cardiovascular system and the whole body simultaneously. Good session.
          </p>
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">+${creditsEarned} credits earned</p>
        </div>
      </div>
      ${renderLogBlock(LOG_SUBJECT, "swim-log", "lengths")}

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);">
        <button class="btn btn-primary btn-full" id="ss-reflect-btn">How did that feel?</button>
        <button class="btn btn-ghost btn-full" id="ss-home-btn">Back to today</button>
      </div>
    </div>`;
}

function startSession() {
  sessionStarted = true;
  paused         = false;
  creditsEarned  = 50;
  const totalSecs  = selectedMins * 60;
  const freqSecs   = selectedType === "intervals" ? 4 * 60 : 8 * 60;
  let nextPromptAt = freqSecs;

  sessionTimer = setInterval(() => {
    if (paused) return;
    elapsed++;
    const remaining = Math.max(0, totalSecs - elapsed);
    const timerEl = document.getElementById("ss-timer-display");
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
    ...(pending || { type: "swim", source: "self-directed" }),
    type:          "swim",
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
  store.set("lastWorkoutName",    "Swim");
  phase = "done";
  rerender();
}

function resetSession() {
  dismountSessionGuard();
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }
  phase = "stroke"; selectedStroke = null; selectedType = null;
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
          Hold on — if you leave now this swim won’t be saved. Are you sure?
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
// running counter in this file, so durationMins is computed for real.
function savePartialSession() {
  const pending = store.get("currentActivityEntry");
  const nowIso  = new Date().toISOString();

  const activityEntry = store.logActivity({
    ...(pending || { type: "swim", source: "self-directed" }),
    type:          "swim",
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
  attachLogEvents(LOG_SUBJECT, "swim-log");

  mountSessionGuard({
    isActive: () => phase === "swimming" && sessionStarted,
    label:    "swim",
    onExit:   () => { savePartialSession(); resetSession(); router.navigate("reflect"); }
  });
  document.getElementById("ss-back-btn")?.addEventListener("click", () => {
    if (phase === "stroke")   { resetSession(); router.navigate("intention"); }
    else if (phase === "type")     { phase = "stroke";   rerender(); }
    else if (phase === "duration") { phase = "type";     rerender(); }
    else if (phase === "overview") { phase = "duration"; rerender(); }
  });
  document.getElementById("ss-exit-btn")?.addEventListener("click", showExitConfirm);
  document.querySelectorAll("[data-stroke]").forEach(btn => {
    btn.addEventListener("click", () => { selectedStroke = btn.dataset.stroke; phase = "type"; rerender(); });
  });
  document.querySelectorAll("[data-session-type]").forEach(btn => {
    btn.addEventListener("click", () => { selectedType = btn.dataset.sessionType; phase = "duration"; rerender(); });
  });
  document.querySelectorAll(".ws-duration-card").forEach(btn => {
    btn.addEventListener("click", () => { selectedMins = parseInt(btn.dataset.mins); phase = "overview"; rerender(); });
  });
  document.getElementById("ss-start-btn")?.addEventListener("click", startSession);
  document.getElementById("ss-start-swim-btn")?.addEventListener("click", () => { phase = "swimming"; rerender(); });
  document.getElementById("ss-pause-btn")?.addEventListener("click", () => { paused = !paused; rerender(); });
  document.getElementById("ss-prompt-dismiss")?.addEventListener("click", () => {
    creditsEarned += 10; activePrompt = null; rerender();
  });
  document.getElementById("ss-reflect-btn")?.addEventListener("click", () => { resetSession(); router.navigate("reflect"); });
  document.getElementById("ss-home-btn")?.addEventListener("click", () => { resetSession(); router.navigate("intention"); });
}
