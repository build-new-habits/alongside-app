/**
 * walk-session.js - Coached Walk Session
 *
 * 19 May 2026 v1
 *
 * A coached walking session with noticing prompts delivered at intervals.
 * Not an exercise sequence — a single timed walk with the coach appearing
 * alongside the user at set moments.
 *
 * Walk types:
 *   gentle    — easy pace, low energy, recovery or rest-day movement
 *   mindful   — noticing prompts every 5 minutes, sensory anchors
 *   brisk     — elevated pace, cardiovascular focus, coach pacing cues
 *   nature    — outdoor-aware prompts, nature noticing, grounding
 *
 * Durations: 15 / 20 / 30 / 45 minutes
 *
 * Session flow:
 *   1. Walk type selector
 *   2. Duration selector
 *   3. Coach opening card + start
 *   4. Active walk — large timer, prompt cards appear at intervals
 *      (Vibration API pulse before each prompt)
 *   5. Cool-down prompt at 2 minutes remaining
 *   6. Completion screen
 *
 * Prompts are delivered via text cards. The Vibration API signals a new
 * prompt is available — the user glances at the screen to read it.
 * This is the PWA ceiling for mid-activity coaching (Phase 5 adds audio).
 *
 * Route: "walk-session"
 * Nav: hidden (session view)
 * Credits: 40 base + 10 per completed prompt interaction
 */

import { store } from "../store.js";

export const centered = false;

// ── Session state ─────────────────────────────────────────────────────────────
let phase          = "type";     // "type" | "duration" | "overview" | "walking" | "done"
let selectedType   = null;
let selectedMins   = null;
let sessionTimer   = null;       // counts total elapsed seconds
let elapsed        = 0;
let promptInterval = null;
let nextPromptAt   = 0;          // seconds elapsed when next prompt fires
let promptIndex    = 0;
let activePrompt   = null;       // currently displayed prompt object
let creditsEarned  = 0;
let sessionStarted = false;
let paused         = false;

// ── Walk type definitions ─────────────────────────────────────────────────────

const WALK_TYPES = [
  {
    id:          "gentle",
    label:       "Gentle walk",
    icon:        "\uD83D\uDEB6",
    description: "Easy pace. Good for low-energy days, recovery, or just getting out.",
    coachOpening: "A gentle walk is never nothing. Movement at any pace still counts — it still matters to your body and your mind. No targets today. Just move.",
    promptFrequency: 8,
    colour:      "var(--color-primary)"
  },
  {
    id:          "mindful",
    label:       "Mindful walk",
    icon:        "\uD83C\uDF43",
    description: "Noticing prompts every few minutes. Walk with your senses open.",
    coachOpening: "This walk is about noticing. Not achieving, not tracking, just noticing what's around you and what's happening inside you. I'll check in every few minutes with something to pay attention to.",
    promptFrequency: 5,
    colour:      "#34D399"
  },
  {
    id:          "brisk",
    label:       "Brisk walk",
    icon:        "\uD83D\uDCAA",
    description: "Elevated pace. Cardiovascular benefit, coach pacing cues.",
    coachOpening: "Brisk walking raises your heart rate, improves cardiovascular fitness, and burns more than you'd think. Aim to feel warm and slightly breathless but still able to speak in short sentences.",
    promptFrequency: 7,
    colour:      "#818CF8"
  },
  {
    id:          "nature",
    label:       "Nature walk",
    icon:        "\uD83C\uDF33",
    description: "Outdoor-aware prompts. Connecting with what's around you.",
    coachOpening: "Being outside has measurable benefits — reduced cortisol, improved mood, lower blood pressure. The research is consistent and the effect is quick. I'll prompt you to notice what's around you as you go.",
    promptFrequency: 6,
    colour:      "#86EFAC"
  }
];

// ── Duration options ──────────────────────────────────────────────────────────

const DURATIONS = [
  { mins: 15, label: "15 min",  description: "Short and sharp"    },
  { mins: 20, label: "20 min",  description: "Standard walk"      },
  { mins: 30, label: "30 min",  description: "Proper session"     },
  { mins: 45, label: "45 min",  description: "Long walk"          }
];

// ── Prompt libraries ──────────────────────────────────────────────────────────

const PROMPTS = {

  gentle: [
    { text: "Notice how your body feels as you walk. Not good or bad — just notice.", action: "Notice" },
    { text: "Let your pace be exactly what it is. There is no right speed today.", action: "Keep going" },
    { text: "Your arms, your legs, the ground beneath you. Just this, right now.", action: "Keep going" },
    { text: "If thoughts come, let them. You don't have to act on them. Just walk.", action: "Keep going" },
    { text: "How does the air feel? Temperature, movement, texture.", action: "Notice" },
    { text: "You are doing something good for yourself. That is worth acknowledging.", action: "Keep going" },
    { text: "Gentle movement like this is genuinely good medicine. You're doing it.", action: "Keep going" },
  ],

  mindful: [
    { text: "What are five things you can see right now? Really look — not just a glance.", action: "I noticed" },
    { text: "What sounds are there? Close ones, distant ones, ones you almost missed.", action: "I heard them" },
    { text: "Feel your feet as they make contact with the ground. The texture, the pressure, the shift of weight.", action: "I felt it" },
    { text: "What can you smell? Even if it's nothing much — the air itself has a quality.", action: "I noticed" },
    { text: "Notice the temperature on your skin. Where do you feel it most?", action: "I noticed" },
    { text: "Watch how you're moving. Arms, hips, stride. Notice without judging.", action: "I noticed" },
    { text: "If your mind has been busy, that's fine. Just bring it back to where you are right now.", action: "I'm back" },
    { text: "What's one thing around you that you haven't looked at properly before?", action: "Found one" },
    { text: "Notice the rhythm of your breathing as you walk. Don't change it — just feel it.", action: "I feel it" },
  ],

  brisk: [
    { text: "Check your pace. You should feel warm, slightly breathless, but able to speak a few words.", action: "On it" },
    { text: "Arms driving — bend them to 90 degrees, let them swing naturally from the shoulder.", action: "Adjusted" },
    { text: "Posture check — head up, shoulders back and relaxed, core gently engaged.", action: "Adjusted" },
    { text: "Heel-to-toe strike. Land on your heel, roll through to push off from the toes.", action: "Got it" },
    { text: "You're building cardiovascular fitness right now. This effort is doing real work.", action: "Keep going" },
    { text: "Step count — try to slightly increase your cadence for the next two minutes.", action: "Picking up" },
    { text: "Breathing — try to breathe in for 3 steps, out for 3 steps. Rhythmic breathing improves endurance.", action: "Trying it" },
    { text: "You're more than halfway. Maintain the pace — don't ease off yet.", action: "Holding it" },
  ],

  nature: [
    { text: "Look up. What's in the sky right now? Cloud shapes, light, movement.", action: "I looked" },
    { text: "Find something alive — a plant, a tree, an animal, a bird. Just notice it exists.", action: "Found one" },
    { text: "What's the light doing right now? Where is it coming from, what does it touch?", action: "I see it" },
    { text: "The ground you're walking on — what's it made of? What's underneath your feet?", action: "I noticed" },
    { text: "Listen for natural sounds — wind, water, birds, rustling. Can you separate them?", action: "Listening" },
    { text: "Notice the scale of what's around you. Something very small. Something very large.", action: "I see them" },
    { text: "Touch something if you can — bark, a leaf, grass. Notice its texture fully.", action: "I did" },
    { text: "What season does this feel like right now? What tells you?", action: "I noticed" },
    { text: "Find a colour you haven't thought about today. Let it land properly.", action: "Found it" },
  ]
};

// Cooldown prompt — appears at 2 minutes remaining for all types
const COOLDOWN_PROMPT = {
  text: "Two minutes left. Start to ease your pace gradually. Let your breathing settle.",
  action: "Easing down",
  isCooldown: true
};

// ── Condition note ────────────────────────────────────────────────────────────

function buildConditionNote() {
  const conditions = store.get("conditions")          || [];
  const painScores = store.get("conditionPainScores")  || {};

  const legPain = ["knee", "ankle-foot", "hamstring", "shin-splints",
                   "achilles", "hip", "plantar-fasciitis", "calves"];
  const affected = conditions.filter(id =>
    legPain.some(c => id.startsWith(c)) && (painScores[id] || 0) >= 3
  );

  if (affected.length === 0) return null;

  const notes = [];
  if (affected.some(id => id.startsWith("knee"))) {
    notes.push("Your knee has some discomfort today. Avoid downhill sections if possible, keep pace gentle.");
  }
  if (affected.some(id => id.startsWith("achilles") || id.startsWith("shin"))) {
    notes.push("With your lower leg, walk on flatter ground today and avoid hard heel strikes.");
  }
  if (affected.some(id => id.startsWith("plantar"))) {
    notes.push("Plantar fasciitis can be aggravated by cold starts. Take 2-3 minutes to warm up slowly before picking up pace.");
  }
  if (affected.some(id => id.startsWith("hamstring"))) {
    notes.push("Your hamstring is flagging some discomfort. Keep the pace easy and avoid any uphill that stretches it.");
  }
  return notes.length > 0 ? notes.join(" ") : null;
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (phase === "type")     return renderTypeSelector();
  if (phase === "duration") return renderDurationSelector();
  if (phase === "overview") return renderWalkOverview();
  if (phase === "walking")  return renderWalking();
  if (phase === "done")     return renderDone();
  return renderTypeSelector();
}

// ── Type selector ─────────────────────────────────────────────────────────────

function renderTypeSelector() {
  const name = store.get("name") || "";
  return `
    <div class="view walk-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="ws-back-btn" aria-label="Exit">
          Exit
        </button>
        <span class="workout-header-title">Walk</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt=""
             class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          ${name ? name + ". " : ""}What kind of walk feels right today?
        </p>
      </div>

      <div class="ws-type-grid" role="group" aria-label="Choose your walk type">
        ${WALK_TYPES.map(t => `
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

// ── Duration selector ─────────────────────────────────────────────────────────

// ── Walk overview ─────────────────────────────────────────────────────────────

function renderWalkOverview() {
  const wt      = WALK_TYPES.find(t => t.id === selectedType);
  const prompts = PROMPTS[selectedType] || PROMPTS.gentle;

  return `
    <div class="view walk-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="ws-back-btn" aria-label="Back">\u2190 Back</button>
        <span class="workout-header-title">${wt?.label || "Walk"} \u2014 ${selectedMins} min</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${wt?.coachOpening || "Your walk is ready."}</p>
        <p class="text-sm text-muted" style="margin-top: var(--space-2);">
          I will check in with ${prompts.length} prompts along the way.
          There is a 2-minute warm-up walk to start and a cooldown in the final 3 minutes.
        </p>
      </div>

      <div class="card" style="padding: var(--space-4);">
        <h3 style="font-size: var(--text-sm); color: var(--color-primary); margin-bottom: var(--space-3);">
          What I will prompt you with
        </h3>
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${prompts.slice(0, 5).map(p => `
            <div style="border-left: 2px solid var(--color-border); padding-left: var(--space-3);">
              <p class="text-sm text-secondary">${p.text}</p>
            </div>
          `).join("")}
          ${prompts.length > 5 ? `
            <p class="text-xs text-muted">+ ${prompts.length - 5} more prompts during your walk</p>
          ` : ""}
        </div>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="ws-start-btn"
              style="margin-top: var(--space-6);">
        Let\u2019s go
      </button>
    </div>
  `;
}

function renderDurationSelector() {
  const wt = WALK_TYPES.find(t => t.id === selectedType);
  return `
    <div class="view walk-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="ws-back-btn" aria-label="Back">
          Back
        </button>
        <span class="workout-header-title">${wt?.label || "Walk"}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt=""
             class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">How long have you got?</p>
      </div>

      <div class="ws-duration-grid" role="group" aria-label="Choose walk duration">
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

// ── Active walking screen ─────────────────────────────────────────────────────

function renderWalking() {
  const wt          = WALK_TYPES.find(t => t.id === selectedType);
  const totalSecs   = selectedMins * 60;
  const remaining   = Math.max(0, totalSecs - elapsed);
  const pct         = Math.round((elapsed / totalSecs) * 100);
  const condNote    = buildConditionNote();

  return `
    <div class="view walk-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="ws-exit-btn" aria-label="Exit session">
          Exit
        </button>
        <span class="workout-header-title">${wt?.label || "Walk"}</span>
      </div>

      <!-- Progress bar -->
      <div class="workout-progress-bar" role="progressbar"
           aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Walk progress, ${pct}%">
        <div class="workout-progress-fill" style="width: ${pct}%"></div>
      </div>

      <!-- Main timer -->
      <div class="ws-timer-block" aria-live="polite" aria-atomic="true"
           aria-label="${formatMMSS(remaining)} remaining">
        <div class="ws-timer-value" id="ws-timer-display">
          ${formatMMSS(remaining)}
        </div>
        <div class="ws-timer-label">remaining</div>
      </div>

      <!-- Active prompt card -->
      ${activePrompt ? `
        <div class="card ws-prompt-card ${activePrompt.isCooldown ? "ws-prompt-card--cooldown" : ""}"
             role="status" aria-live="polite">
          <p class="ws-prompt-text">${activePrompt.text}</p>
          <button class="btn btn-ghost btn-sm ws-prompt-dismiss"
                  id="ws-prompt-dismiss-btn"
                  aria-label="Dismiss prompt">
            ${activePrompt.action || "Got it"}
          </button>
        </div>
      ` : `
        <div class="card ws-active-card">
          <p class="text-secondary text-sm" style="text-align: center; padding: var(--space-2) 0;">
            ${!sessionStarted
              ? (wt?.coachOpening || "")
              : (condNote && elapsed < 10
                  ? condNote
                  : "Keep going. I'll check in with you along the way.")}
          </p>
        </div>
      `}

      <!-- Controls -->
      <div class="ws-controls">
        ${!sessionStarted ? `
          <button class="btn btn-primary btn-large btn-full" id="ws-start-btn">
            Start walk
          </button>
        ` : `
          <button class="btn ${paused ? "btn-primary" : "btn-secondary"} btn-large btn-full"
                  id="ws-pause-btn"
                  aria-label="${paused ? "Resume walk" : "Pause walk"}">
            ${paused ? "Resume" : "Pause"}
          </button>
        `}
      </div>

    </div>
  `;
}

// ── Done screen ───────────────────────────────────────────────────────────────

function renderDone() {
  const name     = store.get("name") || "";
  const wt       = WALK_TYPES.find(t => t.id === selectedType);
  const actualMin = Math.floor(elapsed / 60);

  const completions = {
    gentle: "A gentle walk done. That is real movement and it counts.",
    mindful: "You moved and you noticed. Both matter. The world is still there when you look for it.",
    brisk:  "That was proper cardiovascular work. Your heart rate was up, your lungs were working. Good session.",
    nature: "Time outside. Time noticing what's around you. That does something to the nervous system that nothing else quite does."
  };

  return `
    <div class="view walk-session-view" style="text-align: center;">

      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-192.png" alt=""
             class="coach-icon-small" aria-hidden="true">
        <div>
          <h2 style="color: var(--color-primary); margin-bottom: var(--space-2);">
            Walk done.
          </h2>
          <p class="coach-message-text">
            ${name ? name + " — " : ""}${actualMin} minutes. ${completions[selectedType] || "Well done."}
          </p>
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">
            +${creditsEarned} credits earned
          </p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3);
                  margin-top: var(--space-6);">
        <button class="btn btn-primary btn-full" id="ws-reflect-btn">
          How did that feel?
        </button>
        <button class="btn btn-ghost btn-full" id="ws-home-btn">
          Back to today
        </button>
      </div>

    </div>
  `;
}

// ── Timer and prompt engine ───────────────────────────────────────────────────

function startSession() {
  sessionStarted = true;
  paused         = false;
  creditsEarned  = 40;

  const totalSecs       = selectedMins * 60;
  const wt              = WALK_TYPES.find(t => t.id === selectedType);
  const freqMins        = wt?.promptFrequency || 6;
  nextPromptAt          = freqMins * 60;
  promptIndex           = 0;

  sessionTimer = setInterval(() => {
    if (paused) return;

    elapsed++;

    // Update timer display without full rerender
    const el = document.getElementById("ws-timer-display");
    if (el) {
      const remaining = Math.max(0, totalSecs - elapsed);
      el.textContent  = formatMMSS(remaining);
    }

    // Update progress bar
    const bar = document.querySelector(".workout-progress-fill");
    if (bar) {
      const pct = Math.min(100, Math.round((elapsed / totalSecs) * 100));
      bar.style.width = `${pct}%`;
      bar.closest(".workout-progress-bar")
        ?.setAttribute("aria-valuenow", pct);
    }

    // Cooldown at 2 minutes remaining
    if (elapsed === totalSecs - 120 && !activePrompt) {
      firePrompt(COOLDOWN_PROMPT);
    }

    // Regular prompts
    if (elapsed >= nextPromptAt && elapsed < totalSecs - 120 && !activePrompt) {
      const pool   = PROMPTS[selectedType] || PROMPTS.gentle;
      const prompt = pool[promptIndex % pool.length];
      promptIndex++;
      nextPromptAt += (wt?.promptFrequency || 6) * 60;
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
  // Re-render just the prompt area
  rerenderPromptArea();
}

function dismissPrompt() {
  // Award credits for engaging with a prompt
  if (activePrompt && !activePrompt.isCooldown) {
    creditsEarned += 10;
  }
  activePrompt = null;
  rerenderPromptArea();
}

function rerenderPromptArea() {
  // Replace just the prompt card without killing the timer
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}

function pauseSession() {
  paused = true;
  rerenderPromptArea();
}

function resumeSession() {
  paused = false;
  rerenderPromptArea();
}

function endSession() {
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }

  // Log to activity log
  const log   = store.get("activityLog") || [];
  const entry = store.get("currentActivityEntry");
  if (entry) {
    entry.sessionEnd     = new Date().toISOString();
    entry.durationMins   = Math.floor(elapsed / 60);
    entry.creditsEarned  = creditsEarned;
    store.set("activityLog", [...log, entry]);
  }

  store.set("totalCredits",       (store.get("totalCredits") || 0) + creditsEarned);
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    "Walk Session");

  phase = "done";
  rerenderPromptArea();
}

function resetSession() {
  if (sessionTimer) { clearInterval(sessionTimer); sessionTimer = null; }
  phase          = "type";
  selectedType   = null;
  selectedMins   = null;
  elapsed        = 0;
  promptIndex    = 0;
  nextPromptAt   = 0;
  activePrompt   = null;
  creditsEarned  = 0;
  sessionStarted = false;
  paused         = false;
}

function formatMMSS(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {

  // Back / exit
  document.getElementById("ws-back-btn")?.addEventListener("click", () => {
    if (phase === "type") {
      resetSession();
      router.navigate("intention");
    } else if (phase === "duration") {
      phase = "type";
      rerender();
    }
  });

  document.getElementById("ws-exit-btn")?.addEventListener("click", () => {
    if (confirm("End this walk? Your progress will be saved.")) {
      endSession();
    }
  });

  // Type cards
  document.querySelectorAll(".ws-type-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedType = btn.dataset.type;
      phase        = "duration";
      rerender();
    });
  });

  // Duration cards
  document.querySelectorAll(".ws-duration-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMins = parseInt(btn.dataset.mins);
      phase        = "walking";
      rerender();
    });
  });

  // Start
  document.getElementById("ws-start-btn")?.addEventListener("click", () => {
    startSession();
    rerenderPromptArea();
  });

  // Pause / resume
  document.getElementById("ws-pause-btn")?.addEventListener("click", () => {
    if (paused) resumeSession();
    else pauseSession();
  });

  // Dismiss prompt
  document.getElementById("ws-prompt-dismiss-btn")?.addEventListener("click", () => {
    dismissPrompt();
  });

  // Done screen
  document.getElementById("ws-reflect-btn")?.addEventListener("click", () => {
    resetSession();
    router.navigate("reflect");
  });

  document.getElementById("ws-home-btn")?.addEventListener("click", () => {
    resetSession();
    router.navigate("intention");
  });
}

function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}
