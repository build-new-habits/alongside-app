/**
 * today.js - Today View
 * Shows check-in prompt or generated workout options
 *
 * v1.6 — Prescribed exercises moved to dedicated prescribed.js view (S3-6).
 *   Removed renderPrescribedSection() and mountPrescribedSection().
 *   Users reach prescribed exercises via the intention screen or the
 *   check-in shortcut button, both of which navigate to prescribed.js.
 *
 * v1.5 — Moderate pain zone messaging:
 *   renderModerateZoneMessage() added alongside renderSevereZoneMessage().
 *   When any body zone is Moderate (pain 4-6), a coach banner explains why
 *   the exercise pool is smaller. Previously silent — user saw fewer options
 *   with no explanation. Rendered between phase banner and coach card.
 *   Uses warning colour token (amber) to distinguish from severe (danger/red).
 *   Both functions share the same zone/condition read from store.
 *
 * v1.4 — prescribedExercises Level 1 display (see session 2 handoff)
 *
 * v1.3 — Two fixes:
 *
 *   (1) Per-exercise prescription display corrected.
 *       Previously showed raw duration field only (e.g. "1m 30s"), which
 *       did not match what calculateDuration() counts in the header total.
 *       Now shows the full prescription that the total is based on:
 *         - perSide exercises: "1m 30s - each side"
 *         - sets > 1: "3 x 1m 30s"
 *         - both: "3 x 1m 30s - each side"
 *         - reps-based: "3 x 10 reps" (unchanged)
 *       The header total and the per-exercise lines now count the same thing.
 *
 *   (2) availableTime quick-change strip added to the check-in summary card.
 *       Users can update their available time mid-day without re-doing the
 *       full check-in. Tapping a chip writes the new value to the store,
 *       clears the workout cache, and regenerates workouts immediately.
 *       The strip also shows the current selection so the user knows what
 *       the generator is using.
 *
 * v1.2 — Programme phase banner:
 *   When a programme is active, a soft teal banner is shown between the
 *   check-in summary and workout options. It shows the current phase name
 *   and the phase coaching message from the programme template.
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
  const coachMsg = getCheckinPromptVariant();

  return `
    <div class="view">
      <div class="view-header">
        <h1>${greeting}, ${name}</h1>
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
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div class="coach-prompt-content">
          <p>${coachMsg}</p>
        </div>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="start-checkin-btn"
              style="margin-top: var(--space-4);" aria-label="Start your daily check-in">
        Start Check-In
      </button>

      ${renderRecentHistory()}
    </div>
  `;
}

/**
 * Returns one of 5 pre-check-in coach messages based on time of day
 * and a rotation seed so the same line doesn't appear on consecutive days.
 * Seed: (dayOfYear + totalSessions) % 5
 */
function getCheckinPromptVariant() {
  const hour         = new Date().getHours();
  const totalSessions = (store.get("progressLog") || []).length;
  const now           = new Date();
  const start         = new Date(now.getFullYear(), 0, 0);
  const dayOfYear     = Math.floor((now - start) / 86400000);
  const idx           = (dayOfYear + totalSessions) % 5;

  const morning = [
    "Before I put your session together, I'd like to know how you're feeling. A quick check-in takes less than a minute and makes everything I suggest much more useful.",
    "Good morning. A quick check-in helps me understand where you are today — it makes everything I suggest much more relevant. Ready when you are.",
    "How's the body today? A minute with me now means a session that actually fits you later. Let's do this properly.",
    "I've been thinking about what to suggest for you today, but I need a little information first. How are you feeling?",
    "You showed up — that already matters. Tell me how you're doing and I'll make sure today's session is worth your time."
  ];

  const afternoon = [
    "Take a moment to check in with me and I'll put together something that matches where you are right now.",
    "Good afternoon. Midday can go any number of ways — tell me how yours has been and I'll suggest something that fits.",
    "Before I plan anything for you, I want to know how you're feeling. It only takes a moment and it makes a real difference.",
    "The best sessions are the ones that meet you where you are. Check in and I'll make sure that's what you get.",
    "Whatever today has thrown at you so far, I can work with it. Just tell me where you're at."
  ];

  const evening = [
    "Even a short session can make a difference at this time of day. Tell me how you're feeling and I'll find the right fit.",
    "I know the end of the day can be complicated — energy, time, motivation. Tell me what you've got and I'll work with it.",
    "There's still time to move today if you'd like to. Check in with me and we'll see what feels right.",
    "How's the day been? Sometimes that tells me more than anything else. Check in and I'll take it from there.",
    "No pressure — check in and see what I suggest. You can always decide it's a rest day. That's a valid choice too."
  ];

  if (hour < 12) return morning[idx];
  if (hour < 17) return afternoon[idx];
  return evening[idx];
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
          <div class="time-strip-chips" id="time-strip-chips" role="group" aria-label="Change available workout time" style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
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
            ? `<p class="available-time-note">Not set — using your energy level to decide workout length.</p>`
            : ""
          }
        </div>
      </div>

      <!-- ── Programme phase banner ─────────────────────────────────────── -->
      ${renderPhaseBanner()}
      ${renderSevereZoneMessage()}
      ${renderModerateZoneMessage()}
      ${renderGymConditionCard()}

      <!-- ── Coach recommendation ───────────────────────────────────────── -->
      <div class="card card-coach">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div class="recommendation-content">
          <div class="intensity-badge ${intensity}" aria-label="Today's intensity: ${display.label}">
            ${getIntensityIcon(intensity)} ${display.label}
          </div>
          <p>${display.message}</p>
          ${burnout.level !== "none" ? `
            <p class="text-sm text-muted">${burnout.reasons.join(". ")}.</p>
          ` : ""}
        </div>
      </div>

      <!-- ── Workout options ────────────────────────────────────────────── -->
      <div class="workout-options" id="workout-options">
        <h2>Today's Options</h2>
        <p class="text-secondary">Choose what feels right:</p>

        ${workouts.map((workout, index) => renderWorkoutCard(workout, index)).join("")}
      </div>

    </div>
  `;
}

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

      <div class="exercise-full-list" aria-label="Exercise list"
           style="display:flex;flex-direction:column;gap:var(--space-2);margin:var(--space-4) 0;">
        ${workout.exercises.map(e => `
          <div class="exercise-list-row"
               style="display:flex;justify-content:space-between;align-items:baseline;padding:var(--space-1) 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span class="exercise-list-name">${e.name}</span>
            <span class="exercise-list-prescription" style="color:var(--color-text-secondary);font-size:var(--text-sm);flex-shrink:0;margin-left:var(--space-3);">${formatPrescription(e)}</span>
          </div>
        `).join("")}
      </div>

      <button class="btn btn-primary btn-full workout-start-btn" data-workout-index="${index}"
              aria-label="Start ${workout.name}">
        Start Workout
      </button>
    </div>
  `;
}

/**
 * Format the exercise prescription shown in the workout card list.
 * Must reflect exactly what calculateDuration() counts so the per-exercise
 * display and the header total agree.
 *
 * Duration-based exercises:
 *   sets=1, perSide=false  -> "1m 30s"
 *   sets=1, perSide=true   -> "1m 30s - each side"
 *   sets=3, perSide=false  -> "3 x 1m 30s"
 *   sets=3, perSide=true   -> "3 x 1m 30s - each side"
 *
 * Reps-based exercises:
 *   "3 x 10 reps"  (unchanged from v1.2)
 */
function formatPrescription(exercise) {
  if (exercise.duration) {
    const sets     = exercise.sets || 1;
    const timeStr  = formatExerciseDuration(exercise.duration);
    const setsStr  = sets > 1 ? `${sets} x ` : "";
    const sideStr  = exercise.perSide ? " - each side" : "";
    return `${setsStr}${timeStr}${sideStr}`;
  }

  // Reps-based
  const sets = exercise.sets || 3;
  const reps = exercise.reps || 10;
  return `${sets} x ${reps} reps`;
}

/**
 * Format exercise duration for display.
 * < 60s  -> "45s"
 * 60s    -> "1 min"
 * 90s    -> "1m 30s"
 * 120s   -> "2 mins"
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
 * Gym condition awareness card.
 *
 * Appears on Today view when the user has an active musculoskeletal
 * condition affecting a gym-relevant zone AND today's pain score for
 * that zone is 3 or above (mild to severe).
 *
 * Design intent: "Behaviour is communication." The card notices and names
 * what the body is reporting. It does not prohibit — it invites awareness.
 * Warm, specific, non-alarming. Renders above workout options.
 *
 * Gym-relevant zones and their condition IDs:
 *   lower-limb: knees, hips, ankles, calves, hamstrings, quads
 *   spine:      lower-back, upper-back, neck
 *   upper-limb: shoulders, rotator-cuff, elbows, wrists
 */
function renderGymConditionCard() {
  const conditions = store.get("conditions") || [];
  const painScores = store.get("conditionPainScores") || {};

  // Gym-relevant condition IDs mapped to zone and display name
  const GYM_CONDITIONS = {
    "knee-pain":        { zone: "lower-limb", label: "knees",          guidance: "Avoid deep knee flexion and heavy leg press. Box squats and leg extensions at partial range are usually fine. Notice any sharp pain and stop if it arrives." },
    "hip-pain":         { zone: "lower-limb", label: "hips",           guidance: "Favour unilateral work with controlled range. Hip hinges are often manageable -- monitor how your hip responds in the first set and adjust from there." },
    "hamstring":        { zone: "lower-limb", label: "hamstrings",      guidance: "Avoid maximal loaded lengthening today. Romanian deadlifts at reduced range and load are an option. Warm up slowly and notice any pulling sensation." },
    "lower-back":       { zone: "spine",      label: "lower back",      guidance: "Avoid loading your spine under fatigue — heavy squats and deadlifts (exercises where weight presses down through your spine) carry more risk today. Upper body work, machines, and exercises where you can sit or lie down are safer choices." },
    "upper-back":       { zone: "spine",      label: "upper back",      guidance: "Rows and pulling movements may aggravate this. Pressing from a supported position is usually fine. Notice any increase in stiffness between sets." },
    "shoulder-pain":    { zone: "upper-limb", label: "shoulders",       guidance: "Overhead pressing is higher risk today. Horizontal pressing at reduced load and cables in pain-free range are reasonable. Stop if you feel impingement." },
    "rotator-cuff":     { zone: "upper-limb", label: "rotator cuff",    guidance: "Internal rotation under load is the main thing to watch. Avoid behind-the-neck movements entirely. Cables and light isolation work in supported range are safer." },
    "elbow-pain":       { zone: "upper-limb", label: "elbows",          guidance: "Gripping under load may aggravate this. Bicep curls and tricep extensions often irritate elbow issues -- lighter load and fewer reps than usual today." },
    "wrist-pain":       { zone: "upper-limb", label: "wrists",          guidance: "Avoid wrist extension under load. Push-up variations and barbell pressing carry more risk. Dumbbells with neutral grip and machine work are preferable today." },
    "neck-pain":        { zone: "spine",      label: "neck",            guidance: "Avoid any exercise that requires bracing your neck against resistance. Upper traps, shrugs, and overhead work may aggravate this. Keep your head in a neutral position throughout." }
  };

  // Find flagged conditions: active + pain score >= 3
  const flagged = conditions
    .filter(id => GYM_CONDITIONS[id] && (painScores[id] || 0) >= 3)
    .map(id => ({ id, ...GYM_CONDITIONS[id], score: painScores[id] || 0 }));

  if (flagged.length === 0) return "";

  // Severity label for the score
  function severityLabel(score) {
    if (score >= 7) return "high";
    if (score >= 4) return "moderate";
    if (score >= 1) return "mild";
    return "low";
  }

  const items = flagged.map(f => `
    <div class="gym-condition-item" style="margin-bottom: var(--space-4); padding-bottom: var(--space-4); border-bottom: 1px solid rgba(255,255,255,0.06);">
      <p class="gym-condition-flag" style="margin-bottom: var(--space-2);">
        <strong>${f.label.charAt(0).toUpperCase() + f.label.slice(1)}</strong>
        is flagged at ${severityLabel(f.score)} today.
      </p>
      <p class="gym-condition-guidance text-sm">${f.guidance}</p>
    </div>
  `).join("");

  const zoneCount  = new Set(flagged.map(f => f.zone)).size;
  const headingText = flagged.length === 1
    ? "One thing to be aware of in your session today"
    : zoneCount > 1
      ? "A few things to be aware of across your session today"
      : "A couple of things to be aware of today";

  return `
    <div class="card gym-condition-card" role="note" aria-label="Gym session awareness">
      <div class="card-coach">
        <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div class="gym-condition-content">
          <h3>${headingText}</h3>
          ${items}
          <p class="gym-condition-footer text-sm text-muted">
            These are observations, not rules. You know your body.
            Notice how it responds and adjust as you go.
          </p>
        </div>
      </div>
    </div>
  `;
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

/**
 * Render a coach message when a body zone is at moderate pain level (4-6).
 * Explains WHY the exercise pool is smaller -- previously silent shrinkage.
 * Uses warning (amber) styling to distinguish from severe (danger/red).
 * Only shown when no severe zone is active for the same zone -- severe takes priority.
 */
function renderModerateZoneMessage() {
  const conditions = store.get("conditions") || [];
  const painScores = store.get("conditionPainScores") || {};
  const zoneStatus = getZoneStatus(conditions, painScores);

  const messages = {
    "lower-limb": {
      icon:  "🦵",
      label: "Lower body needs some care today",
      text:  "Your legs or hips are reporting some pain, so I have removed exercises that could aggravate them. You will see fewer lower body options than usual -- that is intentional. Everything shown is safe to try."
    },
    "spine": {
      icon:  "🔙",
      label: "Back or neck -- I have adapted your options",
      text:  "With some back or neck pain today, I have taken the higher-load spinal exercises out of your options. What remains is still effective -- just kinder on your spine right now."
    },
    "upper-limb": {
      icon:  "💪",
      label: "Arms or shoulders -- options adjusted",
      text:  "There is some pain in your arms or shoulders today, so I have reduced the upper body load in your options. Lower body, core, and cardio are all still available to you."
    },
    "systemic": {
      icon:  "💙",
      label: "Keeping things manageable today",
      text:  "Your body is working through something today, so I have kept the intensity lower across all your options. Everything here is chosen to support you rather than push you."
    }
  };

  const parts = [];

  for (const [zone, severity] of Object.entries(zoneStatus)) {
    if (zone === "combinedSevere") continue;
    // Only show moderate banner -- severe zones have their own banner above
    if (severity !== "moderate") continue;
    const msg = messages[zone];
    if (!msg) continue;
    parts.push(`
      <div class="moderate-zone-banner" role="note" aria-label="${msg.label}"
           style="margin-bottom: var(--space-4);">
        <span class="moderate-zone-icon" aria-hidden="true">${msg.icon}</span>
        <div class="moderate-zone-body">
          <span class="moderate-zone-label">${msg.label}</span>
          <p class="moderate-zone-message">${msg.text}</p>
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

/**
 * Update availableTime from the Today view strip.
 * Writes to store, clears the workout cache, then triggers re-render
 * by navigating to the same view (router re-renders on navigate).
 */
function setAvailableTimeFromStrip(value) {
  store.set("availableTime", value);
  store.set("workoutsGeneratedAt", null); // bust cache -> regenerate
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

    const value = chip.dataset.time;
    const currentValue = store.get("availableTime");

    // Tapping an already-selected chip clears it
    if (value === currentValue) {
      clearAvailableTimeFromStrip();
    } else {
      setAvailableTimeFromStrip(value);
    }
  });

  document.getElementById("time-strip-clear")?.addEventListener("click", clearAvailableTimeFromStrip);

  // ── Workout start buttons ─────────────────────────────────────────────────
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
