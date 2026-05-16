/**
 * running-session.js - Guided Running Session
 *
 * 16 May 2026 v1
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

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
let phase          = "type";
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
  if (phase === "duration") return renderDurationSelector();
  if (phase === "running")  return renderRunning();
  if (phase === "done")     return renderDone();
  return renderTypeSelector();
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

  const totalSecs = selectedMins * 60;
  const rt        = RUN_TYPES.find(t => t.id === selectedType);
  const freqSecs  = (rt?.promptFreq || 7) * 60;
  let   nextPromptAt = freqSecs;

  // Show warmup card immediately
  activePrompt = WARMUP_PROMPT;
  rerender();

  sessionTimer = setInterval(() => {
    if (paused) return;
    elapsed++;

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
    if (selectedType === "intervals") {
      const structure = INTERVAL_STRUCTURE[selectedMins] || INTERVAL_STRUCTURE[30];
      const upcoming  = structure.find(s => s.at === elapsed);
      if (upcoming && !inWarmup && !inCooldown) {
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

function firePrompt(prompt) {
  activePrompt = prompt;
  if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
  rerender();
}

function dismissPrompt() {
  if (activePrompt && !activePrompt.isCooldown && !activePrompt.isWarmup) {
    creditsEarned += 10;
  }
  activePrompt = null;
  rerender();
}

function pauseSession() {
  paused = !paused;
  rerender();
}

function endSession() {
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }

  const log   = store.get("activityLog") || [];
  const entry = store.get("currentActivityEntry");
  if (entry) {
    entry.sessionEnd    = new Date().toISOString();
    entry.status        = "completed";
    entry.durationMins  = Math.floor(elapsed / 60);
    entry.creditsEarned = creditsEarned;
    store.set("activityLog", [...log, entry]);
  }

  store.set("totalCredits",       (store.get("totalCredits") || 0) + creditsEarned);
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    "Run");
  phase = "done";
  rerender();
}

function resetSession() {
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }
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
}

function formatMMSS(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) { main.innerHTML = render(); onMount(); }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  document.getElementById("rs-back-btn")?.addEventListener("click", () => {
    if (phase === "type")     { resetSession(); router.navigate("intention"); }
    else if (phase === "duration") { phase = "type"; rerender(); }
  });

  document.getElementById("rs-exit-btn")?.addEventListener("click", () => {
    if (confirm("End this run? Time so far will be saved.")) endSession();
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
      phase        = "running";
      rerender();
    });
  });

  document.getElementById("rs-start-btn")?.addEventListener("click", startSession);

  document.getElementById("rs-pause-btn")?.addEventListener("click", pauseSession);

  document.getElementById("rs-prompt-dismiss")?.addEventListener("click", dismissPrompt);

  document.getElementById("rs-reflect-btn")?.addEventListener("click", () => {
    resetSession();
    router.navigate("reflect");
  });

  document.getElementById("rs-home-btn")?.addEventListener("click", () => {
    resetSession();
    router.navigate("intention");
  });
}
