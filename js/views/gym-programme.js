/**
 * gym-programme.js - Gym Programme View
 *
 * v1.0 — Standalone condition-aware gym programme view.
 *   Reads conditions and conditionPainScores from store to surface
 *   a dynamic condition awareness card before showing the session.
 *   Programme content: 6-week Core Strength & Posterior Chain Recovery.
 *   Hardcoded for Phase 3 — will respond to check-in flow in Phase 4.
 *
 *   Accessible from Settings via "My Gym Programme" button.
 */

import { store } from "../store.js";
import { getZoneStatus } from "../data/conditions.js";

export const centered = false;

// ── Programme data ────────────────────────────────────────────────────────────

const PROGRAMME = {
  name: "Core Strength & Posterior Chain Recovery",
  weeks: 6,
  sessions: [
    {
      id: "A",
      title: "Session A",
      subtitle: "Glute Activation & Posterior Chain Foundation",
      duration: "45-50 mins",
      coachLine: "This session is about waking things up, not testing limits. Everything here activates the posterior chain without loading your SI joint asymmetrically under weight. It will feel lighter than expected. That is correct.",
      warmup: [
        { name: "Cat-cow", sets: 2, reps: "10 slow", tempo: "Controlled", rest: "-" },
        { name: "Glute bridge hold", sets: 2, reps: "30s hold", tempo: "Static", rest: "30s" },
        { name: "Single-leg glute bridge \u2014 right side", sets: 3, reps: "10", tempo: "2-1-2", rest: "45s", note: "Physio exercise" },
        { name: "Hip 90/90 stretch", sets: 2, reps: "60s each side", tempo: "Hold", rest: "-" },
        { name: "World's greatest stretch", sets: 2, reps: "5 each side", tempo: "Slow", rest: "-" },
      ],
      main: [
        { name: "Cable pull-through", sets: 3, reps: "12", tempo: "3-1-2", rest: "60s", why: "Hip hinge with posterior chain load. No spinal compression." },
        { name: "Leg press \u2014 feet high and wide", sets: 3, reps: "12", tempo: "3-1-2", rest: "75s", why: "Glute-biased, spinal-neutral, machine-supported." },
        { name: "Romanian deadlift (2 x 10kg)", sets: 3, reps: "10", tempo: "3-0-2", rest: "75s", why: "Hamstring and glute load. Light weight \u2014 pattern first." },
        { name: "Seated cable row", sets: 3, reps: "12", tempo: "2-1-2", rest: "60s", why: "Upper back strength. Reduces QL compensation." },
        { name: "Pallof press \u2014 both sides", sets: 3, reps: "10 each", tempo: "2-2-2", rest: "60s", why: "Anti-rotation core. Best exercise for SI joint stability." },
        { name: "Dead bug", sets: 3, reps: "8 each side", tempo: "Slow", rest: "45s", why: "Anti-extension core. Protects the lower back." },
      ],
      cooldown: [
        { name: "Pigeon pose \u2014 right side priority", sets: 1, reps: "90s each side", tempo: "Hold", rest: "-", note: "Do not skip this" },
        { name: "Supine hamstring stretch", sets: 1, reps: "60s each side", tempo: "Hold", rest: "-" },
        { name: "Child's pose", sets: 1, reps: "60s", tempo: "Hold", rest: "-" },
      ]
    },
    {
      id: "B",
      title: "Session B",
      subtitle: "Upper Body & Core Integration",
      duration: "45-50 mins",
      coachLine: "Session B gives your lower back and glutes 48 hours of recovery while keeping you building. Upper body today \u2014 your posterior chain consolidates Session A while you work.",
      warmup: [
        { name: "Band pull-aparts", sets: 2, reps: "15", tempo: "Controlled", rest: "-" },
        { name: "Thoracic rotation (seated)", sets: 2, reps: "10 each side", tempo: "Slow", rest: "-" },
        { name: "Cat-cow", sets: 1, reps: "8", tempo: "Slow", rest: "-" },
      ],
      main: [
        { name: "Chest-supported dumbbell row", sets: 4, reps: "10", tempo: "2-1-3", rest: "75s", why: "Upper back strength. Zero spinal load \u2014 bench takes your weight." },
        { name: "Incline dumbbell press", sets: 3, reps: "10", tempo: "3-1-2", rest: "75s", why: "Chest and shoulder in a supported position." },
        { name: "Lat pulldown (wide grip)", sets: 3, reps: "12", tempo: "2-1-3", rest: "60s", why: "Lats stabilise the lumbar spine via thoracolumbar fascia." },
        { name: "Dumbbell lateral raise", sets: 3, reps: "15", tempo: "2-0-3", rest: "45s", why: "Shoulder stability. Light and high-rep." },
        { name: "Pallof press", sets: 3, reps: "10 each side", tempo: "2-2-2", rest: "60s", why: "Anti-rotation core. Daily need for SI joint stability." },
        { name: "Half-kneeling cable chop", sets: 3, reps: "10 each side", tempo: "2-1-2", rest: "60s", why: "Oblique strength. Activates right glute on right-knee-down sets." },
      ],
      cooldown: [
        { name: "Doorway chest stretch", sets: 1, reps: "45s each side", tempo: "Hold", rest: "-" },
        { name: "Thread the needle", sets: 1, reps: "8 each side", tempo: "Slow", rest: "-" },
        { name: "Pigeon pose \u2014 right side priority", sets: 1, reps: "60s each side", tempo: "Hold", rest: "-" },
      ]
    },
    {
      id: "C",
      title: "Session C",
      subtitle: "Lower Body Strength & Single-Leg Progression",
      duration: "50-55 mins",
      coachLine: "The most demanding session of the week. Single-leg work appears here for the first time. If your right glute or SI joint objects to anything, step back to the bilateral version. That is not failure \u2014 that is good listening.",
      warmup: [
        { name: "Glute bridge \u2014 3s hold", sets: 2, reps: "10", tempo: "1-3-1", rest: "30s" },
        { name: "Single-leg glute bridge \u2014 right side", sets: 2, reps: "8", tempo: "2-1-2", rest: "45s", note: "Physio exercise \u2014 activation only" },
        { name: "Hip flexor stretch (kneeling)", sets: 2, reps: "45s each side", tempo: "Hold", rest: "-" },
        { name: "Banded clamshell \u2014 right side priority", sets: 2, reps: "15", tempo: "2-1-2", rest: "30s" },
      ],
      main: [
        { name: "Goblet squat (12kg)", sets: 3, reps: "10", tempo: "3-1-2", rest: "75s", why: "Front-loaded. Upright torso. Safe for lower back." },
        { name: "Single-leg press \u2014 right leg", sets: 3, reps: "10 each side", tempo: "3-1-2", rest: "60s each", why: "Identifies strength discrepancy. Machine removes balance demand." },
        { name: "Romanian deadlift (2 x 12kg)", sets: 3, reps: "10", tempo: "3-0-2", rest: "75s", why: "Small progression from Session A." },
        { name: "Bulgarian split squat (bodyweight)", sets: 3, reps: "8 each side", tempo: "3-1-2", rest: "75s", why: "Single-leg strength. Bodyweight only \u2014 the movement is the challenge." },
        { name: "Cable kickback \u2014 right side", sets: 3, reps: "12", tempo: "2-1-2", rest: "45s", why: "Isolated right glute. Rebuilding the connection." },
        { name: "Dead bug (progressed)", sets: 3, reps: "8 each side", tempo: "Slow", rest: "45s", why: "Full contralateral extension. Highest core demand." },
      ],
      cooldown: [
        { name: "Pigeon pose \u2014 right side priority", sets: 1, reps: "2 mins right / 90s left", tempo: "Hold", rest: "-", note: "Longest pigeon of the week. Take the time." },
        { name: "Lying figure-4 stretch", sets: 1, reps: "60s each side", tempo: "Hold", rest: "-" },
        { name: "Supine hamstring stretch", sets: 1, reps: "90s each side", tempo: "Hold", rest: "-" },
        { name: "Child's pose", sets: 1, reps: "90s", tempo: "Hold", rest: "-" },
      ]
    }
  ]
};

// ── Condition awareness ───────────────────────────────────────────────────────

const ZONE_MESSAGES = {
  "lower-limb": {
    avoid: "Avoid heavy bilateral squats, loaded lunges, and anything that loads the lower limb asymmetrically under significant weight. Single-leg work on the machine is fine \u2014 controlled and supported.",
    caution: "Your lower limb is flagging today. Reduce single-leg work to machine-only. Skip Bulgarian split squats. Everything else is available."
  },
  "spine": {
    avoid: "Avoid all loaded spinal flexion and heavy hip hinge work today. No deadlifts, no heavy rows from a compromised position. Pallof press and dead bug are still safe. Core work is anti-extension only.",
    caution: "Your lower back is present today. Reduce RDL weight by 20%. Extend your warm-up by 10 minutes. Listen closely during the cable pull-through."
  },
  "upper-limb": {
    avoid: "Upper body pressing and pulling is affected today. Session B should be modified or skipped. Session A lower body and core work is unaffected.",
    caution: "Some upper body discomfort today. Reduce pressing weight. Focus on controlled movement over load."
  },
  "systemic": {
    avoid: "Your whole system is under strain today. Consider Session A warm-up and cool-down only \u2014 the activation and stretching without the main session load.",
    caution: "Energy and systemic sensitivity is elevated. Keep intensity conservative across everything today."
  }
};

function buildConditionCard() {
  const conditions  = store.get("conditions")       || [];
  const painScores  = store.get("conditionPainScores") || {};

  if (conditions.length === 0) return "";

  const zoneStatus = getZoneStatus(conditions, painScores);
  const messages   = [];

  for (const [zone, severity] of Object.entries(zoneStatus)) {
    if (zone === "combinedSevere" || severity === "none") continue;
    const msg = ZONE_MESSAGES[zone];
    if (!msg) continue;
    const text = severity === "severe" || severity === "acute"
      ? msg.avoid
      : msg.caution;
    messages.push({ severity, text, zone });
  }

  if (messages.length === 0) {
    return `
      <div class="card card-coach gym-condition-card gym-condition--green">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="gym-condition-status">All clear for today</p>
          <p class="text-secondary">Your conditions are not flagging anything that changes today's session. Proceed as planned.</p>
        </div>
      </div>`;
  }

  const hasSevere = messages.some(m => m.severity === "severe" || m.severity === "acute");
  const cardClass = hasSevere ? "gym-condition--red" : "gym-condition--amber";

  return `
    <div class="card card-coach gym-condition-card ${cardClass}" role="note"
         aria-label="Condition awareness for today">
      <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="gym-condition-body">
        <p class="gym-condition-status">
          ${hasSevere ? "Some things to avoid today" : "A few things to be mindful of"}
        </p>
        ${messages.map(m => `
          <p class="gym-condition-message">${m.text}</p>
        `).join("")}
      </div>
    </div>`;
}

// ── Render helpers ────────────────────────────────────────────────────────────

function renderExerciseTable(exercises) {
  return `
    <div class="gym-exercise-table" role="table" aria-label="Exercises">
      <div class="gym-exercise-header" role="row">
        <span role="columnheader">Exercise</span>
        <span role="columnheader">Sets</span>
        <span role="columnheader">Reps</span>
        <span role="columnheader">Tempo</span>
        <span role="columnheader">Rest</span>
      </div>
      ${exercises.map(e => `
        <div class="gym-exercise-row" role="row">
          <div class="gym-exercise-name-cell">
            <span class="gym-exercise-name">${e.name}</span>
            ${e.note ? `<span class="gym-exercise-note">${e.note}</span>` : ""}
            ${e.why  ? `<span class="gym-exercise-why">${e.why}</span>`  : ""}
          </div>
          <span class="gym-cell" role="cell">${e.sets}</span>
          <span class="gym-cell" role="cell">${e.reps}</span>
          <span class="gym-cell gym-tempo" role="cell">${e.tempo}</span>
          <span class="gym-cell" role="cell">${e.rest}</span>
        </div>
      `).join("")}
    </div>`;
}

function renderSession(session) {
  return `
    <div class="gym-session-block" id="session-${session.id}">
      <div class="gym-session-header">
        <div class="gym-session-title-row">
          <h2 class="gym-session-title">${session.title}</h2>
          <span class="gym-session-duration">${session.duration}</span>
        </div>
        <p class="gym-session-subtitle">${session.subtitle}</p>
      </div>

      <div class="card card-coach gym-coach-line">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${session.coachLine}</p>
      </div>

      <h3 class="gym-block-heading">Warm-up</h3>
      ${renderExerciseTable(session.warmup)}

      <h3 class="gym-block-heading">Main session</h3>
      ${renderExerciseTable(session.main)}

      <h3 class="gym-block-heading">Cool-down</h3>
      ${renderExerciseTable(session.cooldown)}
    </div>
  `;
}

// ── Main render ───────────────────────────────────────────────────────────────

export function render() {
  const name       = store.get("name") || "there";
  const activeSession = store.get("gymProgrammeSession") || "A";
  const activeWeek    = store.get("gymProgrammeWeek")   || 1;

  const session = PROGRAMME.sessions.find(s => s.id === activeSession)
    || PROGRAMME.sessions[0];

  return `
    <div class="view gym-programme-view">

      <div class="view-header gym-programme-header">
        <button class="btn btn-ghost" onclick="router.navigate('settings')"
                aria-label="Back to Settings">Back</button>
        <h1>My Programme</h1>
      </div>

      <div class="gym-programme-meta card">
        <div class="gym-meta-row">
          <span class="gym-meta-label">Programme</span>
          <span class="gym-meta-value">${PROGRAMME.name}</span>
        </div>
        <div class="gym-meta-row">
          <span class="gym-meta-label">Week</span>
          <span class="gym-meta-value">${activeWeek} of ${PROGRAMME.weeks}</span>
        </div>
      </div>

      <!-- Condition awareness card — dynamic from today's check-in -->
      ${buildConditionCard()}

      <!-- Session selector -->
      <div class="gym-session-tabs" role="tablist" aria-label="Session">
        ${PROGRAMME.sessions.map(s => `
          <button
            class="gym-session-tab ${s.id === activeSession ? "active" : ""}"
            role="tab"
            aria-selected="${s.id === activeSession}"
            data-session="${s.id}"
            aria-label="${s.title}: ${s.subtitle}"
          >${s.title}</button>
        `).join("")}
      </div>

      <!-- Active session -->
      ${renderSession(session)}

      <!-- Pain response reminder -->
      <div class="card gym-pain-reminder" role="note">
        <p class="gym-pain-heading">If pain increases during the session</p>
        <p class="text-secondary">Sharp or radiating pain \u2014 stop immediately. Dull muscular effort is fine. A 4+ on any area means reduce load or stop the exercise. You know your body.</p>
      </div>

    </div>
  `;
}

export function onMount() {
  // Session tab switching
  document.querySelectorAll(".gym-session-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const sessionId = tab.dataset.session;
      if (!sessionId) return;
      store.set("gymProgrammeSession", sessionId);

      // Update tab state
      document.querySelectorAll(".gym-session-tab").forEach(t => {
        const active = t.dataset.session === sessionId;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", active);
      });

      // Re-render session content only
      const view = document.querySelector(".gym-programme-view");
      if (!view) return;
      const session = PROGRAMME.sessions.find(s => s.id === sessionId);
      if (!session) return;

      const existing = view.querySelector(".gym-session-block");
      if (existing) {
        existing.outerHTML = renderSession(session);
      }
    });
  });
}
