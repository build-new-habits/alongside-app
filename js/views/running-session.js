/**
 * running-session.js - Guided Running Session
 *
 * 03 Aug 2026 v4
 *
 * CHANGELOG
 * 03 Aug 2026 v4 - Wake Lock + resumable session pilot (blueprint
 *   alongside_blueprint_wakelock-resume_03aug2026_v1.md). Root cause
 *   from real on-device use: elapsed time was tick-counted, not
 *   wall-clock-anchored, so screen-lock/backgrounding throttled the
 *   setInterval and silently broke prompts, vibration, pause/resume,
 *   and a refresh lost all progress. Fixed: elapsed is now computed
 *   fresh from timestamps every tick via session-resume.js's
 *   computeElapsedSeconds(). Session state checkpointed to store at
 *   start/pause/resume/prompt via checkpointSession(); on cold mount,
 *   getResumableSession() offers a coach-voiced resume-or-fresh choice
 *   if an interrupted run is found (reuses .session-exit-* CSS as-is,
 *   no new styles needed). Wake Lock requested on start/resume,
 *   released on end/exit, re-requested on visibilitychange (best-effort
 *   layer, not a substitute for the above - confirmed broken in
 *   installed iOS PWAs until iOS 18.4, and dropped instantly on any
 *   backgrounding regardless). Also fixed: interval-structure work/
 *   recovery cues matched on exact equality (elapsed === at), fragile
 *   even without backgrounding - now a >= check against
 *   firedStructureIndices so a missed tick can't silently skip a cue.
 * 23 Jul 2026 v3 - BUILD-3 exit-guard audit fix. onExit (mountSessionGuard)
 *   was navigating to reflect.js without ever calling savePartialSession()
 *   first - the on-screen Exit button (showExitConfirm) called it
 *   correctly, but the device back-gesture path silently dropped partial
 *   progress. Fixed to match yoga-session.js v4's confirmed-working
 *   pattern exactly. Bundled while the file was open: endSession() and
 *   savePartialSession() migrated from direct activityLog writes to
 *   store.logActivity() (dedupe-guarded shared path, store.js v10).
 *
 * v1.1 (16 May 2026):
 *   - Warmup end → running transition card added (replaces "Keep going.")
 *   - Zone-awareness prompt tier added (heart rate / talk test prompts)
 *   - Phase transition cards for warmup→run, run→cooldown
 *   - "Keep going." default card replaced with contextual coach message
 *   - reflect.js after session routes to Progress not Today
 *
 * Three run types, four durations. Condition-aware pacing cues.
 * Vibration API prompts at timed intervals during the run.
 * Timed session with coach prompts appearing mid-run.
 *
 * Run types:
 *   easy       — conversational pace, recovery-friendly
 *   intervals  — work/rest alternating, effort-based
 *   long       — steady long slow distance, endurance focus
 *
 * Durations: 20 / 30 / 45 / 60 minutes
 *
 * Session flow:
 *   1. Run type selector
 *   2. Duration selector
 *   3. Condition note + warmup prompt (2 min walk)
 *   4. Active run — large timer, coach prompts at intervals
 *   5. Cooldown prompt (final 3 min)
 *   6. Completion screen
 *
 * Route: running-session
 * Nav: hidden (session view)
 * Credits: 50 base + 10 per prompt dismissed
 */

import { store } from "../store.js";
import { renderLogBlock, attachLogEvents } from "../session-log.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
import { checkpointSession, getResumableSession, clearCheckpoint, computeElapsedSeconds } from "../session-resume.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
let phase          = "type";  // "type" | "resume" | "duration" | "overview" | "running" | "done"
let selectedType   = null;
let selectedMins   = null;
let sessionTimer   = null;
let elapsed        = 0;
let paused         = false;
let sessionStarted = false;
let promptIndex    = 0;
let activePrompt   = null;
let creditsEarned  = 0;
let inWarmup       = true;   // first 2 min = warmup walk
let inCooldown     = false;  // last 3 min = cooldown walk

// 03 Aug 2026 v4 - Wake Lock + resumable session state
let sessionStartedAt        = null;        // epoch ms, wall-clock anchor for elapsed calc
let totalPausedMs           = 0;
let pausedAt                = null;        // epoch ms, set while paused
let firedStructureIndices   = new Set();   // interval-structure cue indices already fired
let wakeLockSentinel        = null;
let visibilityListenerAdded = false;
let resumeCheckDone         = false;
let pendingResume           = null;        // checkpoint object while resume-prompt is showing

const WARMUP_SECS  = 120;
const COOLDOWN_SECS = 180;

// ── Run type definitions ──────────────────────────────────────────────────────

const RUN_TYPES = [
  {
    id:            "easy",
    label:         "Easy run",
    icon:          "\uD83D\uDEB6",
    description:   "Conversational pace. You should be able to speak a sentence comfortably.",
    coachOpening:  "Easy runs are not junk miles. They build your aerobic base, aid recovery, and should make up the majority of your running. Conversational pace — if you cannot speak a sentence, slow down.",
    promptFreq:    7,
  },
  {
    id:            "intervals",
    label:         "Intervals",
    icon:          "\u26A1",
    description:   "Work hard, recover, repeat. Effort-based — use your perceived exertion.",
    coachOpening:  "Intervals improve your cardiovascular fitness and running economy more efficiently than steady running. The recovery periods are part of the session, not a rest from it. Effort on the hard sections, genuine recovery on the easy.",
    promptFreq:    5,
  },
  {
    id:            "long",
    label:         "Long run",
    icon:          "\uD83C\uDFD5\uFE0F",
    description:   "Slow and steady. Building endurance and mental resilience.",
    coachOpening:  "Long runs are where endurance is built. The pace should feel almost too slow — that is correct. Your body is adapting at the cellular level on long easy runs in a way that faster running cannot replicate.",
    promptFreq:    10,
  }
];

const DURATIONS = [
  { mins: 20, label: "20 min", description: "Short session" },
  { mins: 30, label: "30 min", description: "Standard run"  },
  { mins: 45, label: "45 min", description: "Longer run"    },
  { mins: 60, label: "60 min", description: "Long run"      },
];

// ── Prompt libraries ──────────────────────────────────────────────────────────

const PROMPTS = {
  easy: [
    { text: "Check your pace. Can you hold a conversation? If yes, you are running correctly.", action: "On it" },
    { text: "Zone 2 check — if you are breathing hard enough that talking is difficult, you have crossed into a zone where this run has a time limit. Slow down and you can run much longer, and get better results from it.", action: "Slowing slightly" },
    { text: "Relax your shoulders. Drop them away from your ears. Unclench your hands.", action: "Relaxed" },
    { text: "Notice your breathing. It should be rhythmic and controlled — not gasping.", action: "Breathing well" },
    { text: "How do your feet feel on the ground? Light and quick, not heavy and plodding.", action: "Light feet" },
    { text: "You are building your aerobic base right now. This work compounds over weeks and months.", action: "Keep going" },
    { text: "Head up. Eyes on the horizon, not the ground.", action: "Head up" },
    { text: "Arms at 90 degrees, driving forward and back — not crossing the midline.", action: "Arms right" },
    { text: "You are more than halfway. Maintain your pace.", action: "Holding it" },
  ],
  intervals: [
    { text: "Work phase coming up in 30 seconds. Build to about 80% effort — hard but sustainable.", action: "Ready" },
    { text: "The effort you just pushed through is zone 4 — uncomfortable and intentionally limited. Now recover fully. Partial recovery defeats the purpose of intervals.", action: "Recovering fully" },
    { text: "Recovery now. Slow right down. This is active recovery, not rest.", action: "Recovering" },
    { text: "Next effort in 30 seconds. Controlled breathing during the recovery.", action: "Ready" },
    { text: "Push the effort now. 80-85% — uncomfortable but not maximal.", action: "Working" },
    { text: "Recovery. Drop the pace completely. Let the heart rate come down.", action: "Recovering" },
    { text: "Halfway through the intervals. Your form matters more when you are tired.", action: "Keep form" },
    { text: "Last effort coming. Give it what you have left.", action: "Final push" },
    { text: "All done. Easy to the finish from here.", action: "Easing in" },
  ],
  long: [
    { text: "The pace should feel almost embarrassingly slow. That is correct. Trust the process.", action: "Trusting it" },
    { text: "Zone check: long runs only work if they stay easy. If you have drifted into breathing harder than a sentence at a time, the adaptation you are after is not happening. Drop the pace.", action: "Dropping pace" },
    { text: "Long runs teach your body to use fat as fuel. This cannot happen if you go too fast.", action: "Keep easy" },
    { text: "Check in with how you feel. Not the time, not the distance — how do you feel?", action: "I noticed" },
    { text: "Relax everything above the waist. Tension there costs energy.", action: "Relaxed" },
    { text: "You are building something real today. Adaptations that will serve you for months.", action: "Keep going" },
    { text: "Halfway. The second half is where long runs are actually run. Settle in.", action: "Settled" },
    { text: "What are you noticing around you? A long run is also time outside.", action: "Noticing" },
    { text: "Three miles to go. Your legs know how to do this. Let them.", action: "Trusting it" },
  ]
};

const WARMUP_PROMPT = {
  text: "Start with 2 minutes of brisk walking to warm up the legs and raise your heart rate gently before running.",
  action: "Walking now",
  isWarmup: true
};

const COOLDOWN_PROMPT = {
  text: "Three minutes to go. Start easing down to a walk. Let your heart rate settle before you stop completely.",
  action: "Cooling down",
  isCooldown: true
};

const INTERVAL_STRUCTURE = {
  20: [ // 20 min: 5 min easy + 4 x (2 min hard / 1.5 min easy) + 4 min easy
    { at: 300,  type: "work",     text: "Start your first effort. 80% effort." },
    { at: 420,  type: "recover",  text: "Recover. Walk or very easy jog." },
    { at: 510,  type: "work",     text: "Second effort. Build to 80% again." },
    { at: 630,  type: "recover",  text: "Recover." },
    { at: 720,  type: "work",     text: "Third effort." },
    { at: 840,  type: "recover",  text: "Recover." },
    { at: 930,  type: "work",     text: "Last effort. Give it what you have." },
    { at: 1050, type: "easy",     text: "Easy to the finish from here." },
  ],
  30: [ // 30 min: 5 min easy + 5 x (2 min hard / 2 min easy) + 5 min easy
    { at: 300,  type: "work",    text: "First effort. 80% — hard but controlled." },
    { at: 420,  type: "recover", text: "Recover. Walk or very easy jog." },
    { at: 540,  type: "work",    text: "Second effort." },
    { at: 660,  type: "recover", text: "Recover. Let the heart rate come down." },
    { at: 780,  type: "work",    text: "Third effort. Stay controlled." },
    { at: 900,  type: "recover", text: "Recover." },
    { at: 1020, type: "work",    text: "Fourth effort." },
    { at: 1140, type: "recover", text: "Recover." },
    { at: 1260, type: "work",    text: "Last one. Everything you have left." },
    { at: 1380, type: "easy",    text: "Easy to the finish." },
  ],
};

// ── Condition notes ───────────────────────────────────────────────────────────

function buildConditionNote() {
  const conditions = store.get("conditions")          || [];
  const painScores = store.get("conditionPainScores") || {};

  const notes = [];
  conditions.forEach(id => {
    const pain = painScores[id] || 0;
    if (pain < 3) return;
    if (id.includes("knee")) {
      notes.push(pain >= 7
        ? "Your knee is flagging high pain. Today we avoid any interval efforts and keep pace fully conversational."
        : "Your knee has some discomfort. Avoid downhill sections and keep pace easy throughout.");
    }
    if (id.includes("achilles") || id.includes("shin")) {
      notes.push("With your lower leg, land with a midfoot strike rather than heel-striking. Shorten your stride slightly.");
    }
    if (id.includes("hamstring")) {
      notes.push("Your hamstring needs attention. No interval efforts today. Keep the pace easy and stop if you feel any pull.");
    }
    if (id.includes("plantar")) {
      notes.push("Plantar fasciitis benefits from a slower warm-up walk. Take an extra two minutes before running.");
    }
    if (id.includes("lower-back")) {
      notes.push("Your lower back is flagging. Engage your core lightly throughout and avoid leaning forward.");
    }
  });

  return notes.length > 0 ? notes.join(" ") : null;
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (phase === "type")     return renderTypeSelector();
  if (phase === "resume")   return renderResumePrompt();
  if (phase === "duration") return renderDurationSelector();
  if (phase === "overview") return renderRunOverview();
  if (phase === "running")  return renderRunning();
  if (phase === "done")     return renderDone();
  return renderTypeSelector();
}

// 03 Aug 2026 v4 - coach-voiced resume-or-fresh choice, shown on cold mount
// when session-resume.js finds an interrupted run. Reuses .session-exit-*
// CSS as-is (session-guard.css v2) - same visual language as the exit
// confirmation card, no new styles needed.
function renderResumePrompt() {
  return `
    <div class="view walk-session-view">
      <div class="session-exit-overlay" role="dialog" aria-modal="true"
           aria-label="Resume interrupted run">
        <div class="session-exit-card">
          <div class="session-exit-coach-row">
            <img src="assets/images/logo-icon-192.png" alt=""
                 class="coach-icon-small" aria-hidden="true">
            <p class="session-exit-coach-text">
              Looks like your run got interrupted. Want to pick up where you left off, or start fresh?
            </p>
          </div>
          <div class="session-exit-actions">
            <button class="btn btn-primary btn-full" id="rs-resume-btn"
                    aria-label="Resume your run">
              Resume run
            </button>
            <button class="btn btn-ghost btn-full" id="rs-start-fresh-btn"
                    aria-label="Start a fresh run">
              Start fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTypeSelector() {
  const name = store.get("name") || "";
  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="rs-back-btn" aria-label="Exit">Exit</button>
        <span class="workout-header-title">Run</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt=""
             class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          ${name ? name + ". " : ""}What kind of run today?
        </p>
      </div>

      <div class="ws-type-grid" role="group" aria-label="Choose run type">
        ${RUN_TYPES.map(t => `
          <button class="ws-type-card" data-type="${t.id}"
                  aria-label="${t.label}: ${t.description}">
            <span class="ws-type-icon" aria-hidden="true">${t.icon}</span>
            <span class="ws-type-label">${t.label}</span>
            <span class="ws-type-desc">${t.description}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

// ── Run overview ──────────────────────────────────────────────────────────────

function renderRunOverview() {
  const rt      = RUN_TYPES.find(t => t.id === selectedType);
  const prompts = PROMPTS[selectedType] || PROMPTS.easy;

  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="rs-back-btn" aria-label="Back">\u2190 Back</button>
        <span class="workout-header-title">${rt?.label || "Run"} \u2014 ${selectedMins} min</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${rt?.coachOpening || "Your run is ready."}</p>
        <p class="text-sm text-muted" style="margin-top: var(--space-2);">
          2-minute warm-up walk to start. I will prompt you ${prompts.length} times during the run.
          Cooldown walk in the final 3 minutes.
        </p>
      </div>

      <div class="card" style="padding: var(--space-4);">
        <h3 style="font-size: var(--text-sm); color: var(--color-primary); margin-bottom: var(--space-3);">
          What I will prompt you with
        </h3>
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${prompts.slice(0, 4).map(p => `
            <div style="border-left: 2px solid var(--color-border); padding-left: var(--space-3);">
              <p class="text-sm text-secondary">${p.text}</p>
            </div>
          `).join("")}
          ${prompts.length > 4 ? `
            <p class="text-xs text-muted">+ ${prompts.length - 4} more prompts during your run</p>
          ` : ""}
        </div>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="rs-start-btn"
              style="margin-top: var(--space-6);">
        Let\u2019s go
      </button>
    </div>
  `;
}

function renderDurationSelector() {
  const rt = RUN_TYPES.find(t => t.id === selectedType);
  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="rs-back-btn" aria-label="Back">Back</button>
        <span class="workout-header-title">${rt?.label || "Run"}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt=""
             class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">How long today?</p>
      </div>

      <div class="ws-duration-grid" role="group" aria-label="Choose run duration">
        ${DURATIONS.map(d => `
          <button class="ws-duration-card" data-mins="${d.mins}"
                  aria-label="${d.label}: ${d.description}">
            <span class="ws-duration-label">${d.label}</span>
            <span class="ws-duration-desc">${d.description}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderRunning() {
  const rt          = RUN_TYPES.find(t => t.id === selectedType);
  const totalSecs   = selectedMins * 60;
  const remaining   = Math.max(0, totalSecs - elapsed);
  const pct         = Math.round((elapsed / totalSecs) * 100);
  const condNote    = buildConditionNote();

  const phaseLabel  = inWarmup   ? "Warm-up walk"
                    : inCooldown ? "Cooling down"
                    : rt?.label  || "Running";

  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="rs-exit-btn" aria-label="End run">Exit</button>
        <span class="workout-header-title">${phaseLabel}</span>
      </div>

      <div class="workout-progress-bar" role="progressbar"
           aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Run progress ${pct}%">
        <div class="workout-progress-fill" style="width: ${pct}%"></div>
      </div>

      <div class="ws-timer-block" aria-live="polite" aria-atomic="true"
           aria-label="${formatMMSS(remaining)} remaining">
        <div class="ws-timer-value" id="rs-timer-display">
          ${formatMMSS(remaining)}
        </div>
        <div class="ws-timer-label">remaining</div>
      </div>

      ${activePrompt ? `
        <div class="card ws-prompt-card ${activePrompt.isCooldown ? "ws-prompt-card--cooldown" : ""} ${activePrompt.isWarmup ? "ws-prompt-card--warmup" : ""}"
             role="status" aria-live="polite">
          <p class="ws-prompt-text">${activePrompt.text}</p>
          <button class="btn btn-ghost btn-sm ws-prompt-dismiss"
                  id="rs-prompt-dismiss"
                  aria-label="Acknowledge prompt">
            ${activePrompt.action || "Got it"}
          </button>
        </div>
      ` : `
        <div class="card ws-active-card">
          ${!sessionStarted ? `
            <div>
              <p class="coach-message-text">${rt?.coachOpening || ""}</p>
              ${condNote ? `<p class="text-sm text-muted" style="margin-top: var(--space-3);">${condNote}</p>` : ""}
            </div>
          ` : inWarmup ? `
            <div>
              <p class="coach-message-text" style="font-weight: var(--font-semibold);">
                Warm-up walk
              </p>
              <p class="text-secondary text-sm" style="margin-top: var(--space-2);">
                Walk briskly for 2 minutes. Let the legs wake up and the heart rate rise gently before you run. The first two minutes of running always feel harder than the rest — a proper warm-up changes that.
              </p>
            </div>
          ` : inCooldown ? `
            <div>
              <p class="coach-message-text" style="font-weight: var(--font-semibold);">
                Cooling down
              </p>
              <p class="text-secondary text-sm" style="margin-top: var(--space-2);">
                Ease down to a walk now. Let the heart rate settle gradually before you stop completely. Do not just halt — the cool-down walk is part of the session.
              </p>
            </div>
          ` : `
            <div>
              <p class="coach-message-text" style="font-weight: var(--font-semibold);">
                Running now
              </p>
              <p class="text-secondary text-sm" style="margin-top: var(--space-2);">
                You have ${formatMMSS(Math.max(0, selectedMins * 60 - elapsed))} left. Settle into your pace. I will check in with you as you go.
                ${selectedType === "easy" ? " Conversational pace — if talking is hard, slow down." : ""}
                ${selectedType === "long" ? " Almost embarrassingly slow is exactly right." : ""}
              </p>
            </div>
          `}
        </div>
      `}

      <div class="ws-controls">
        ${!sessionStarted ? `
          <button class="btn btn-primary btn-large btn-full" id="rs-start-btn">
            Start run
          </button>
        ` : `
          <button class="btn ${paused ? "btn-primary" : "btn-secondary"} btn-large btn-full"
                  id="rs-pause-btn"
                  aria-label="${paused ? "Resume run" : "Pause run"}">
            ${paused ? "Resume" : "Pause"}
          </button>
        `}
      </div>
    </div>
  `;
}

// LOG-4. These views log against the ACTIVITY, not an exercise -- there is
// no exercise object here and store.logLift() is keyed by id. A stable
// synthetic id per activity type means "last time" is a real comparable
// note rather than one orphaned entry per session.
const LOG_SUBJECT = { id: "activity-run", name: "Run", equipment: [] };

function renderDone() {
  const name = store.get("name") || "";
  const rt   = RUN_TYPES.find(t => t.id === selectedType);
  const mins = Math.floor(elapsed / 60);

  const completions = {
    easy:      "An easy run done. You have trained your aerobic system today. That work is in the bank.",
    intervals: "Intervals complete. The discomfort you just pushed through is exactly where fitness is built.",
    long:      "Long run done. That is the kind of session that compounds over months. Well run."
  };

  return `
    <div class="view walk-session-view" style="text-align: center;">
      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-192.png" alt=""
             class="coach-icon-small" aria-hidden="true">
        <div>
          <h2 style="color: var(--color-primary); margin-bottom: var(--space-2);">
            Run done.
          </h2>
          <p class="coach-message-text">
            ${name ? name + " \u2014 " : ""}${mins} minutes. ${completions[selectedType] || "Well done."}
          </p>
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">
            +${creditsEarned} credits earned
          </p>
        </div>
      </div>

      ${renderLogBlock(LOG_SUBJECT, "run-log", "distance")}

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);">
        <button class="btn btn-primary btn-full" id="rs-reflect-btn">
          How did that feel?
        </button>
        <button class="btn btn-ghost btn-full" id="rs-home-btn">
          Back to today
        </button>
      </div>
    </div>
  `;
}

// ── Session engine ────────────────────────────────────────────────────────────

function startSession() {
  sessionStarted = true;
  paused         = false;
  creditsEarned  = 50;
  inWarmup       = true;
  inCooldown     = false;
  elapsed        = 0;

  // 03 Aug 2026 v4 - wall-clock anchor, not tick-counted
  sessionStartedAt      = Date.now();
  totalPausedMs         = 0;
  pausedAt              = null;
  promptIndex           = 0;
  firedStructureIndices = new Set();

  checkpointSession("run", {
    selectedType,
    selectedMins,
    startedAt:              new Date(sessionStartedAt).toISOString(),
    totalPausedMs:          0,
    promptIndex:            0,
    firedStructureIndices:  [],
    creditsEarned
  });

  requestWakeLock();

  // Show warmup card immediately
  activePrompt = WARMUP_PROMPT;
  rerender();

  runTimer();
}

// 03 Aug 2026 v4 - extracted from startSession() so resumeSession() can
// restart the interval without duplicating the tick logic. elapsed is
// recomputed from timestamps every tick (session-resume.js), not
// incremented - so a throttled/delayed tick can never drift: whenever
// the next tick does fire, it immediately shows the true elapsed time.
function runTimer() {
  const totalSecs = selectedMins * 60;
  const rt        = RUN_TYPES.find(t => t.id === selectedType);
  const freqSecs  = (rt?.promptFreq || 7) * 60;

  // On a fresh start, elapsed is 0, so this is just freqSecs. On resume,
  // jump to the next upcoming threshold from *now* - don't replay any
  // prompts that would have fired during the gap.
  let nextPromptAt = elapsed > 0
    ? (Math.floor(elapsed / freqSecs) + 1) * freqSecs
    : freqSecs;

  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }

  sessionTimer = setInterval(() => {
    if (paused) return;

    elapsed = computeElapsedSeconds(
      { startedAt: new Date(sessionStartedAt).toISOString(), totalPausedMs },
      null
    );

    // Update timer display without full rerender
    const timerEl = document.getElementById("rs-timer-display");
    const remaining = Math.max(0, totalSecs - elapsed);
    if (timerEl) timerEl.textContent = formatMMSS(remaining);

    // Update progress bar
    const bar = document.querySelector(".workout-progress-fill");
    if (bar) {
      const pct = Math.min(100, Math.round((elapsed / totalSecs) * 100));
      bar.style.width = `${pct}%`;
    }

    // Warmup ends at WARMUP_SECS — show transition prompt
    if (inWarmup && elapsed >= WARMUP_SECS) {
      inWarmup = false;
      firePrompt({
        text: "Time to run. " + (selectedType === "easy"
          ? "Easy pace — you should be able to speak a sentence without gasping. If you cannot, slow down. You have " + formatMMSS(selectedMins * 60 - elapsed) + " ahead of you."
          : selectedType === "long"
          ? "Long run pace now — almost too slow feels about right. You have " + formatMMSS(selectedMins * 60 - elapsed) + " ahead. Settle in."
          : "First effort coming in 5 minutes. For now, settle into an easy jog."),
        action: "Running now"
      });
    }

    // Cooldown triggers at COOLDOWN_SECS before end
    if (!inCooldown && elapsed >= totalSecs - COOLDOWN_SECS) {
      inCooldown = true;
      firePrompt(COOLDOWN_PROMPT);
    }

    // Interval structure prompts (if interval run)
    // 03 Aug 2026 v4 - was exact-equality (elapsed === s.at), fragile even
    // without backgrounding since a single missed/delayed tick skipped a
    // cue silently. Now >= against a fired-index set, so a late tick still
    // catches up correctly instead of dropping the cue.
    if (selectedType === "intervals") {
      const structure = INTERVAL_STRUCTURE[selectedMins] || INTERVAL_STRUCTURE[30];
      let upcomingIdx = -1;
      for (let i = 0; i < structure.length; i++) {
        if (elapsed >= structure[i].at && !firedStructureIndices.has(i)) { upcomingIdx = i; break; }
      }
      if (upcomingIdx !== -1 && !inWarmup && !inCooldown) {
        firedStructureIndices.add(upcomingIdx);
        const upcoming = structure[upcomingIdx];
        firePrompt({ text: upcoming.text, action: upcoming.type === "work" ? "Working" : "Recovering" });
      }
    } else if (elapsed >= nextPromptAt && elapsed < totalSecs - COOLDOWN_SECS && !activePrompt) {
      // Regular prompts for easy and long runs
      const pool   = PROMPTS[selectedType] || PROMPTS.easy;
      const prompt = pool[promptIndex % pool.length];
      promptIndex++;
      nextPromptAt += freqSecs;
      firePrompt(prompt);
    }

    // Session complete
    if (elapsed >= totalSecs) {
      endSession();
    }
  }, 1000);
}

// 03 Aug 2026 v4 - now checkpoints on every prompt fire, so a resume
// picks up from the correct promptIndex/firedStructureIndices rather
// than replaying from the start.
function firePrompt(prompt) {
  activePrompt = prompt;
  if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
  checkpointSession("run", {
    selectedType,
    selectedMins,
    startedAt:              new Date(sessionStartedAt).toISOString(),
    totalPausedMs,
    promptIndex,
    firedStructureIndices:  Array.from(firedStructureIndices),
    creditsEarned
  });
  rerender();
}

// ── Wake Lock (03 Aug 2026 v4) ───────────────────────────────────────────────
// Best-effort layer, not a substitute for the resumable-session fix above:
// the lock is dropped instantly on backgrounding/screen-lock by the OS, and
// was broken entirely in installed iOS PWAs until iOS 18.4. Feature-detected
// and wrapped in try/catch - a refusal (low battery, user preference, older
// browser) is silent by design, the resumable state protects the user either way.

async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return;
  try {
    wakeLockSentinel = await navigator.wakeLock.request("screen");
  } catch (err) {
    wakeLockSentinel = null;
  }
}

function releaseWakeLock() {
  if (wakeLockSentinel) {
    wakeLockSentinel.release().catch(() => {});
    wakeLockSentinel = null;
  }
}

// Browser drops the lock on backgrounding and won't restore it on its own -
// re-request when the tab regains focus, if a run is still actively going.
function handleVisibilityChange() {
  if (document.visibilityState === "visible" && phase === "running" && !paused) {
    requestWakeLock();
  }
}

function dismissPrompt() {
  if (activePrompt && !activePrompt.isCooldown && !activePrompt.isWarmup) {
    creditsEarned += 10;
  }
  activePrompt = null;
  rerender();
}

// 03 Aug 2026 v4 - tracks real pause duration (totalPausedMs) so elapsed
// stays accurate against wall-clock time, and re-checkpoints + re-requests
// Wake Lock on resume (both may have been dropped while paused/backgrounded).
function pauseSession() {
  paused = !paused;
  if (paused) {
    pausedAt = Date.now();
  } else {
    if (pausedAt) {
      totalPausedMs += Date.now() - pausedAt;
      pausedAt = null;
    }
    checkpointSession("run", {
      selectedType,
      selectedMins,
      startedAt:              new Date(sessionStartedAt).toISOString(),
      totalPausedMs,
      promptIndex,
      firedStructureIndices:  Array.from(firedStructureIndices),
      creditsEarned
    });
    requestWakeLock();
  }
  rerender();
}

function endSession() {
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }
  releaseWakeLock();

  // 23 Jul 2026 v3 (BUILD-3): migrated to store.logActivity(), matching
  // yoga-session.js v4's confirmed-working pattern.
  const pending = store.get("currentActivityEntry");
  const nowIso  = new Date().toISOString();

  const activityEntry = store.logActivity({
    ...(pending || { type: "run", source: "self-directed" }),
    type:          "run",
    sessionEnd:    nowIso,
    completedAt:   nowIso,
    status:        "completed",
    durationMins:  Math.floor(elapsed / 60),
    creditsEarned
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }

  // 03 Aug 2026 v4 - genuine completion, nothing left to resume
  clearCheckpoint();

  store.set("totalCredits",       (store.get("totalCredits") || 0) + creditsEarned);
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    "Run");
  phase = "done";
  rerender();
}

function resetSession() {
  dismountSessionGuard();
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }
  releaseWakeLock();
  if (visibilityListenerAdded) {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    visibilityListenerAdded = false;
  }
  phase          = "type";
  selectedType   = null;
  selectedMins   = null;
  elapsed        = 0;
  paused         = false;
  sessionStarted = false;
  promptIndex    = 0;
  activePrompt   = null;
  creditsEarned  = 0;
  inWarmup       = true;
  inCooldown     = false;
  // 03 Aug 2026 v4
  sessionStartedAt      = null;
  totalPausedMs         = 0;
  pausedAt              = null;
  firedStructureIndices = new Set();
  resumeCheckDone       = false;
  pendingResume         = null;
}

function formatMMSS(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
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
          Hold on — if you leave now this run won’t be saved. Are you sure?
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

  // EXIT-1. Discard: leave WITHOUT writing a partial entry. The whole
  // point is that opening a session to look at it must not record one.
  document.getElementById("exit-confirm-discard")?.addEventListener("click", () => {
    overlay.remove();
    dismountSessionGuard();
    resetSession();
    router.navigate("today");
  });
}

// 23 Jul 2026 v3 (BUILD-3): migrated to store.logActivity(), matching
// yoga-session.js v4's confirmed-working pattern. `elapsed` is a genuine
// running counter in this file, so durationMins is computed for real.
function savePartialSession() {
  const pending = store.get("currentActivityEntry");
  const nowIso  = new Date().toISOString();

  const activityEntry = store.logActivity({
    ...(pending || { type: "run", source: "self-directed" }),
    type:          "run",
    sessionEnd:    nowIso,
    completedAt:   nowIso,
    status:        "partial",
    durationMins:  Math.floor(elapsed / 60),
    creditsEarned: typeof creditsEarned !== "undefined" ? creditsEarned : 0
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }

  // 03 Aug 2026 v4 - deliberate exit-and-save; progress is already in
  // activityLog, nothing left to offer resuming. resetSession() (always
  // called right after this) handles releasing the Wake Lock.
  clearCheckpoint();
}


function rerender() {
  const main = document.getElementById("main-content");
  if (main) { main.innerHTML = render(); onMount(); }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // LOG-4. Only present on the done screen; attachLogEvents() no-ops when
  // the block is absent and guards double-binding when it is not.
  attachLogEvents(LOG_SUBJECT, "run-log");

  // 03 Aug 2026 v4 - visibilitychange listener persists across rerenders
  // within this view's lifecycle; guard so it's only added once, since
  // onMount() runs on every rerender (pause, prompt, etc), not just cold
  // mount.
  if (!visibilityListenerAdded) {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    visibilityListenerAdded = true;
  }

  // 03 Aug 2026 v4 - on cold mount only (not sub-sequent rerenders),
  // check for an interrupted run before showing the normal picker.
  if (phase === "type" && !sessionStarted && !resumeCheckDone) {
    resumeCheckDone = true;
    const resumable = getResumableSession("run");
    if (resumable) {
      pendingResume = resumable;
      phase = "resume";
      rerender();
      return;
    }
  }

  mountSessionGuard({
    isActive: () => phase === "running",
    label:    "run",
    onExit:   () => { savePartialSession(); resetSession(); router.navigate("reflect"); }
  });
  document.getElementById("rs-back-btn")?.addEventListener("click", () => {
    if (phase === "type")     { resetSession(); router.navigate("today"); }
    else if (phase === "duration") { phase = "type";     rerender(); }
    else if (phase === "overview") { phase = "duration"; rerender(); }
  });

  document.getElementById("rs-exit-btn")?.addEventListener("click", () => {
    showExitConfirm();
  });

  document.querySelectorAll(".ws-type-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedType = btn.dataset.type;
      phase        = "duration";
      rerender();
    });
  });

  document.querySelectorAll(".ws-duration-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMins = parseInt(btn.dataset.mins);
      phase        = "overview";
      rerender();
    });
  });

  document.getElementById("rs-start-btn")?.addEventListener("click", () => {
    if (phase === "overview") { phase = "running"; rerender(); }
    else startSession();
  });

  document.getElementById("rs-pause-btn")?.addEventListener("click", pauseSession);

  document.getElementById("rs-prompt-dismiss")?.addEventListener("click", dismissPrompt);

  document.getElementById("rs-reflect-btn")?.addEventListener("click", () => {
    resetSession();
    router.navigate("reflect");
  });

  document.getElementById("rs-home-btn")?.addEventListener("click", () => {
    resetSession();
    router.navigate("today");
  });

  document.getElementById("rs-resume-btn")?.addEventListener("click", resumeSession);
  document.getElementById("rs-start-fresh-btn")?.addEventListener("click", startFreshFromResume);
}

// 03 Aug 2026 v4 - restores full session state from a checkpoint and
// resumes the timer. elapsed is computed fresh from the checkpoint's
// timestamps, not trusted from any stored "elapsed" value (there isn't
// one) - this is the same computation runTimer()'s ticks use throughout.
function resumeSession() {
  const cp = pendingResume;
  if (!cp) { phase = "type"; rerender(); return; }

  selectedType           = cp.selectedType;
  selectedMins            = cp.selectedMins;
  sessionStartedAt        = new Date(cp.startedAt).getTime();
  totalPausedMs           = cp.totalPausedMs || 0;
  pausedAt                = null;
  promptIndex             = cp.promptIndex || 0;
  firedStructureIndices   = new Set(cp.firedStructureIndices || []);
  creditsEarned           = typeof cp.creditsEarned === "number" ? cp.creditsEarned : 50;
  sessionStarted          = true;
  paused                  = false;
  activePrompt            = null;
  pendingResume           = null;

  elapsed = computeElapsedSeconds(
    { startedAt: cp.startedAt, totalPausedMs },
    null
  );

  const totalSecs = selectedMins * 60;
  inWarmup   = elapsed < WARMUP_SECS;
  inCooldown = elapsed >= totalSecs - COOLDOWN_SECS;

  phase = "running";
  requestWakeLock();
  rerender();
  runTimer();
}

function startFreshFromResume() {
  clearCheckpoint();
  pendingResume = null;
  phase = "type";
  rerender();
}
