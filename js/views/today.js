/**
 * today.js - Today View
 * Shows check-in prompt or generated workout options
 *
 * v1.6 — Human coach message:
 *   buildCoachMessage() assembles a contextual paragraph from check-in
 *   components: energy acknowledgement, mood (if notable), condition
 *   response (if pain >= 3), adaptation statement, and invitation.
 *   The assembled message sits above the intensity badge, which is
 *   retained as a quick visual summary.
 *   renderModerateZoneMessage() removed — moderate pain is now handled
 *   inside the coach message naturally. Severe zone banner retained for
 *   visual urgency on high-pain days.
 *   workout.js "Why this exercise" section also updated (logo added).
 *
 * v1.5 — Moderate pain zone messaging.
 * v1.4 — prescribedExercises Level 1 display.
 * v1.3 — Two fixes:
 *   (1) Per-exercise prescription display corrected.
 *   (2) availableTime quick-change strip added.
 * v1.2 — Programme phase banner.
 */

import { store }            from "../store.js";
import { checkinData }      from "../data/checkin.js";
import { workoutGenerator } from "../data/workoutGenerator.js";
import { programmeEngine }  from "../data/programmeEngine.js";
import { getZoneStatus }    from "../data/conditions.js";

export const centered = false;

// ── availableTime display config (mirrors checkin view) ───────────────────────
const TIME_OPTIONS = [
  { value: "micro",    label: "Micro",    sub: "10 min" },
  { value: "quick",    label: "Quick",    sub: "20 min" },
  { value: "short",    label: "Short",    sub: "30 min" },
  { value: "standard", label: "Standard", sub: "40 min" },
  { value: "long",     label: "Long",     sub: "50 min" },
  { value: "open",     label: "Open",     sub: "60+ min" }
];

export function render() {
  const name         = store.get("name") || "there";
  const hasCheckedIn = checkinData.hasCheckedInToday();

  if (!hasCheckedIn) {
    return renderCheckinPrompt(name);
  } else {
    return renderTodaysDashboard(name);
  }
}

function renderCheckinPrompt(name) {
  const greeting = getTimeGreeting();
  const burnout  = checkinData.detectBurnout();

  return `
    <div class="view">
      <div class="view-header">
        <h1>${greeting}, ${name} 👋</h1>
        <p class="text-secondary">Let's check in before we plan your session.</p>
      </div>

      ${burnout.level !== "none" ? `
        <div class="card card-warning" role="note">
          <div class="warning-content">
            <span class="warning-icon" aria-hidden="true">💛</span>
            <p>${burnout.message}</p>
          </div>
        </div>
      ` : ""}

      <div class="card card-coach">
        <img src="assets/images/logo-icon-small.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div class="coach-prompt-content">
          <p><strong>Ready to check in?</strong></p>
          <p class="text-secondary">It only takes 30 seconds, and helps me suggest the right session for today.</p>
        </div>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="start-checkin-btn" style="margin-top: var(--space-4);">
        Start Check-In
      </button>

      ${renderRecentHistory()}
    </div>
  `;
}

function renderTodaysDashboard(name) {
  const todaysCheckin    = checkinData.getTodaysCheckin();
  const intensity        = store.get("todayIntensity") || "moderate";
  const burnout          = checkinData.detectBurnout();
  const workouts         = workoutGenerator.getTodaysWorkouts();
  const availableTime    = store.get("availableTime") || null;

  const intensityDisplay = {
    recovery:    { label: "Recovery",    color: "purple", message: "Focus on gentle movement and rest." },
    gentle:      { label: "Gentle",      color: "green",  message: "Light activity without strain." },
    moderate:    { label: "Moderate",    color: "teal",   message: "A solid, balanced session." },
    challenging: { label: "Challenging", color: "orange", message: "Push yourself — you have got the energy!" }
  };

  const display = intensityDisplay[intensity] || intensityDisplay.moderate;

  return `
    <div class="view">

      <div class="view-header">
        <h1>Today's Plan</h1>
        <p class="text-secondary">${formatDate(new Date())}</p>
      </div>

      <!-- ── Coach recommendation — first thing after header ───────────── -->
      <div class="card card-coach">
        <img src="assets/images/logo-icon-small.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div class="recommendation-content">
          ${buildCoachMessage(todaysCheckin, intensity, burnout)}
          <div class="intensity-badge ${intensity}" aria-label="Today's intensity: ${display.label}">
            ${getIntensityIcon(intensity)} ${display.label}
          </div>
        </div>
      </div>

      <!-- ── Check-in summary ───────────────────────────────────────────── -->
      <div class="card checkin-summary-card">
        <div class="checkin-summary-header">
          <h3>Your Check-In</h3>
          <button class="btn btn-ghost btn-small" id="update-checkin-btn" aria-label="Update today's check-in">Update</button>
        </div>
        <div class="checkin-summary-stats">
          <div class="stat">
            <span class="stat-emoji" aria-hidden="true">${checkinData.getEnergyEmoji(todaysCheckin.energy)}</span>
            <span class="stat-label">Energy</span>
            <span class="stat-value">${todaysCheckin.energy}/10</span>
          </div>
          <div class="stat">
            <span class="stat-emoji" aria-hidden="true">${checkinData.getMoodEmoji(todaysCheckin.mood)}</span>
            <span class="stat-label">Mood</span>
            <span class="stat-value">${todaysCheckin.mood}/10</span>
          </div>
          <div class="stat">
            <span class="stat-emoji" aria-hidden="true">😴</span>
            <span class="stat-label">Sleep</span>
            <span class="stat-value">${todaysCheckin.sleepHours}h</span>
          </div>
        </div>

        <!-- ── Available time quick-change ───────────────────────────────── -->
        <div class="available-time-strip" aria-label="Available workout time">
          <div class="available-time-strip-header">
            <span class="available-time-strip-label">Time today</span>
            ${availableTime
              ? `<button class="btn btn-ghost btn-xs time-strip-clear" id="time-strip-clear" aria-label="Clear time selection">Clear</button>`
              : ""
            }
          </div>
          <div class="time-strip-chips" id="time-strip-chips" role="group" aria-label="Change available workout time">
            ${TIME_OPTIONS.map(opt => `
              <button
                type="button"
                class="time-strip-chip ${availableTime === opt.value ? "selected" : ""}"
                data-time="${opt.value}"
                aria-pressed="${availableTime === opt.value}"
              >
                <span class="time-strip-chip-label">${opt.label}</span>
                <span class="time-strip-chip-sub">${opt.sub}</span>
              </button>
            `).join("")}
          </div>
          ${!availableTime
            ? `<p class="available-time-note">Not set — using your energy level to decide session length.</p>`
            : ""
          }
        </div>
      </div>

      <!-- ── Programme phase banner ─────────────────────────────────────── -->
      ${renderPhaseBanner()}
      ${renderSevereZoneMessage()}

      <!-- ── Session options ────────────────────────────────────────────── -->
      <div class="workout-options" id="workout-options">
        <h2>Choose your session</h2>
        <p class="text-secondary">Pick whatever feels right for today:</p>

        ${workouts.map((workout, index) => renderWorkoutCard(workout, index)).join("")}
      </div>

    </div>
  `;
}

/**
 * Assemble a human coach message from check-in components.
 *
 * Structure (all components conditional except energy and invitation):
 *   1. Energy acknowledgement — always present
 *   2. Mood acknowledgement   — only if mood is notable (<=4 or >=9)
 *   3. Condition response     — only if any pain score is 3+
 *   4. Adaptation statement   — always present, based on combined factors
 *   5. Invitation             — always closes with choice framing
 *
 * The assembled message sits above the intensity badge, which is
 * retained as a quick visual summary below.
 *
 * Moderate pain is absorbed here — no separate amber banner.
 * Severe zone still has its own banner above this card.
 *
 * Voice: Steady (default). coachStyle variant wiring is Phase 4.
 */
function buildCoachMessage(checkin, intensity, burnout) {
  const energy     = checkin?.energy     || 5;
  const mood       = checkin?.mood       || 5;
  const conditions = store.get("conditions") || [];
  const painScores = store.get("conditionPainScores") || {};

  const parts = [];

  // ── Component 1: Energy acknowledgement ──────────────────────────────────
  if (energy <= 2) {
    parts.push("You are running very low today.");
  } else if (energy <= 4) {
    parts.push("Energy is a bit down today.");
  } else if (energy <= 6) {
    parts.push("Moderate energy — that is workable.");
  } else if (energy <= 8) {
    parts.push("Good energy today.");
  } else {
    parts.push("You are feeling strong today.");
  }

  // ── Component 2: Mood acknowledgement (only if notable) ──────────────────
  if (mood <= 2) {
    parts.push("I hear that things are tough right now.");
  } else if (mood <= 4) {
    parts.push("Sounds like a harder day emotionally.");
  } else if (mood >= 9) {
    parts.push("Great to hear you are feeling good.");
  }
  // mood 5-8: no comment — neutral or positive but unremarkable

  // ── Component 3: Condition response (if pain is 3+) ──────────────────────
  const highestPain = conditions.reduce((max, id) => {
    return Math.max(max, painScores[id] || 0);
  }, 0);

  if (highestPain >= 7) {
    parts.push("Your condition is significant today — I will be very careful with your options.");
  } else if (highestPain >= 5) {
    parts.push("Your body needs some care today, so I have adjusted your options to protect you.");
  } else if (highestPain >= 3) {
    parts.push("I am keeping an eye on how you are feeling physically.");
  }

  // ── Component 4: Adaptation statement ────────────────────────────────────
  if (burnout.level !== "none") {
    parts.push("You have been running low for a few days. Today is about recovery — not performance. Gentle movement is genuinely enough.");
  } else if (intensity === "recovery") {
    parts.push("Today is a recovery day. Gentle movement and rest is the right call.");
  } else if (energy <= 4 && highestPain >= 5) {
    parts.push("I have kept things light — your energy and your body both need gentle today.");
  } else if (energy <= 4) {
    parts.push("I have kept things gentle to match your energy.");
  } else if (highestPain >= 5) {
    parts.push("I have adapted your options to work around what your body needs right now.");
  } else if (intensity === "challenging") {
    parts.push("You have the energy for something solid today — I have put together options that will work for it.");
  } else {
    parts.push("I have put together some good options for today.");
  }

  // ── Component 5: Invitation ───────────────────────────────────────────────
  parts.push("Take a look below and choose what feels right.");

  // ── Assemble ──────────────────────────────────────────────────────────────
  // Observation lines as one paragraph, invitation as a softer second line.
  const observation = parts.slice(0, -1).join(" ");
  const invitation  = parts[parts.length - 1];

  return `
    <p class="coach-message-observation">${observation}</p>
    <p class="coach-message-invite text-secondary">${invitation}</p>
  `;
}

/**
 * Render a single workout option card.
 *
 * Per-exercise prescription (v1.3):
 * The display now matches what calculateDuration() counted in the header total.
 *   - duration + perSide:              "1m 30s - each side"
 *   - duration + sets > 1:             "3 x 1m 30s"
 *   - duration + sets > 1 + perSide:   "3 x 1m 30s - each side"
 *   - reps-based:                      "3 x 10 reps" (unchanged)
 */
function renderWorkoutCard(workout, index) {
  return `
    <div class="card workout-option-card" data-workout-index="${index}">
      <div class="option-header">
        <span class="option-icon" aria-hidden="true">${workout.icon}</span>
        <div class="option-info">
          <h4>${workout.name}</h4>
          <p class="text-sm text-muted">${workout.duration} mins - ${workout.exerciseCount} exercises</p>
        </div>
        <span class="option-credits" aria-label="${workout.totalCredits} credits">+${workout.totalCredits} ⭐</span>
      </div>

      <p class="workout-rationale">${workout.rationale}</p>

      <div class="exercise-full-list" aria-label="Exercise list">
        ${workout.exercises.map(e => `
          <div class="exercise-list-row">
            <span class="exercise-list-name">${e.name}</span>
            <span class="exercise-list-prescription">${formatPrescription(e)}</span>
          </div>
        `).join("")}
      </div>

      <button class="btn btn-primary btn-full workout-start-btn" data-workout-index="${index}"
              aria-label="Start ${workout.name}">
        Start Session
      </button>
    </div>
  `;
}

/**
 * Format the exercise prescription shown in the workout card list.
 */
function formatPrescription(exercise) {
  if (exercise.duration) {
    const sets    = exercise.sets || 1;
    const timeStr = formatExerciseDuration(exercise.duration);
    const setsStr = sets > 1 ? `${sets} x ` : "";
    const sideStr = exercise.perSide ? " - each side" : "";
    return `${setsStr}${timeStr}${sideStr}`;
  }

  const sets = exercise.sets || 3;
  const reps = exercise.reps || 10;
  return `${sets} x ${reps} reps`;
}

/**
 * Format exercise duration for display.
 */
function formatExerciseDuration(seconds) {
  if (!seconds) return "";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return mins === 1 ? "1 min" : `${mins} mins`;
  return `${mins}m ${secs}s`;
}

/**
 * Phase banner — shown when a programme is active.
 */
function renderPhaseBanner() {
  const ap = store.get("activeProgramme");
  if (!ap?.programmeId || !ap?.currentPhase) return "";

  const stats = programmeEngine.getProgressStats();
  if (!stats) return "";

  const phaseMessage = programmeEngine.getCurrentPhaseMessage?.() || null;
  if (!phaseMessage) return "";

  const phaseIcons = { build: "🌱", push: "💪", peak: "🔥", recovery: "🧘" };
  const icon  = phaseIcons[ap.currentPhase] || "📍";
  const label = `Week ${stats.currentWeek} - ${ap.currentPhase.charAt(0).toUpperCase() + ap.currentPhase.slice(1)} phase`;

  return `
    <div class="phase-banner" role="note" aria-label="${label}: ${phaseMessage}">
      <span class="phase-banner-icon" aria-hidden="true">${icon}</span>
      <div class="phase-banner-body">
        <span class="phase-banner-label">${label}</span>
        <p class="phase-banner-message">${phaseMessage}</p>
      </div>
    </div>
  `;
}

/**
 * Render a coach message when a body zone is severely impacted.
 * Moderate pain is now handled inside buildCoachMessage() above.
 * This function covers severe only — retained for visual urgency.
 */
function renderSevereZoneMessage() {
  const conditions = store.get("conditions") || [];
  const painScores = store.get("conditionPainScores") || {};
  const zoneStatus = getZoneStatus(conditions, painScores);

  const hasSevere = Object.values(zoneStatus).some(v => v === "severe");
  if (!hasSevere) return "";

  if (zoneStatus.combinedSevere) {
    return `
      <div class="severe-zone-banner combined-rest" role="note" aria-label="Rest day recommended">
        <span class="severe-zone-icon" aria-hidden="true">🛌</span>
        <div class="severe-zone-body">
          <span class="severe-zone-label">Rest day recommended</span>
          <p class="severe-zone-message">With both your lower body and spine under significant strain, today is about rest — not exercise. Breathing, mindfulness, and a slow mindful walk if you feel up to it. That is more than enough.</p>
        </div>
      </div>`;
  }

  const messages = {
    "lower-limb": {
      icon:  "🦵",
      label: "Lower body — take it easy today",
      text:  "Your legs and hips need protection right now. Upper body, breathing, and gentle seated work are all still available. A slow mindful walk is an option if it feels right — no targets, no distance."
    },
    "spine": {
      icon:  "🔙",
      label: "Spine — careful movement only",
      text:  "With significant back pain today, we are keeping things very gentle. Upper body work in supported positions, breathing, and mindfulness are your safest options. Listen closely to what your body is telling you."
    },
    "upper-limb": {
      icon:  "💪",
      label: "Upper body — lower body is still yours",
      text:  "Your arms or shoulders need rest today — but your legs, core, and cardiovascular system are all available. Walking, lower body strength, and breathing work are all on the table."
    },
    "systemic": {
      icon:  "💙",
      label: "Go gently with yourself today",
      text:  "When the whole system is under strain, gentle is the only speed. Breathing, mindfulness, and slow movement are genuinely enough. Showing up for a few minutes is a win."
    }
  };

  const parts = [];
  for (const [zone, severity] of Object.entries(zoneStatus)) {
    if (zone === "combinedSevere" || severity !== "severe") continue;
    const msg = messages[zone];
    if (!msg) continue;
    parts.push(`
      <div class="severe-zone-banner" role="note" aria-label="${msg.label}">
        <span class="severe-zone-icon" aria-hidden="true">${msg.icon}</span>
        <div class="severe-zone-body">
          <span class="severe-zone-label">${msg.label}</span>
          <p class="severe-zone-message">${msg.text}</p>
        </div>
      </div>`);
  }

  return parts.join("\n");
}

function renderRecentHistory() {
  const history = checkinData.getHistory(5);

  if (history.length === 0) {
    return `
      <div class="card" style="margin-top: var(--space-6);">
        <h3>Your Recent Check-Ins</h3>
        <p class="text-sm text-muted">No check-ins yet. Start your first one above!</p>
      </div>
    `;
  }

  return `
    <div class="card" style="margin-top: var(--space-6);">
      <h3>Your Recent Check-Ins</h3>
      <div class="history-mini" aria-label="Recent check-in history">
        ${history.map(day => `
          <div class="history-day">
            <span class="history-date">${formatShortDate(day.date)}</span>
            <span class="history-emoji" aria-hidden="true">${checkinData.getEnergyEmoji(day.energy)}</span>
            <span class="history-value" aria-label="Energy ${day.energy}">${day.energy}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day:     "numeric",
    month:   "long"
  });
}

function formatShortDate(dateString) {
  const date      = new Date(dateString);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateString === today.toISOString().split("T")[0])     return "Today";
  if (dateString === yesterday.toISOString().split("T")[0]) return "Yesterday";
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

function getIntensityIcon(intensity) {
  return { recovery: "🧘", gentle: "🌱", moderate: "💪", challenging: "🔥" }[intensity] || "💪";
}

// ── availableTime quick-change logic ──────────────────────────────────────────

function setAvailableTimeFromStrip(value) {
  store.set("availableTime", value);
  store.set("workoutsGeneratedAt", null);
  router.navigate("today");
}

function clearAvailableTimeFromStrip() {
  store.set("availableTime", null);
  store.set("workoutsGeneratedAt", null);
  router.navigate("today");
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  document.getElementById("start-checkin-btn")?.addEventListener("click", () => {
    router.navigate("checkin");
  });

  document.getElementById("update-checkin-btn")?.addEventListener("click", () => {
    router.navigate("checkin");
  });

  // ── Available time strip ──────────────────────────────────────────────────
  document.getElementById("time-strip-chips")?.addEventListener("click", e => {
    const chip = e.target.closest(".time-strip-chip");
    if (!chip?.dataset.time) return;

    const value        = chip.dataset.time;
    const currentValue = store.get("availableTime");

    if (value === currentValue) {
      clearAvailableTimeFromStrip();
    } else {
      setAvailableTimeFromStrip(value);
    }
  });

  document.getElementById("time-strip-clear")?.addEventListener("click", clearAvailableTimeFromStrip);

  // ── Session start buttons ─────────────────────────────────────────────────
  document.querySelectorAll(".workout-start-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const index   = parseInt(e.currentTarget.dataset.workoutIndex);
      const workouts = store.get("todaysWorkouts");
      if (workouts?.[index]) {
        store.set("activeWorkout", workouts[index]);
        router.navigate("workout");
      }
    });
  });
}
