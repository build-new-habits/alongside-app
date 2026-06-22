/**
 * coach-proposal.js - Coach Proposal Screen
 *
 * 22 Jun 2026 v5 — Coaching engine wired:
 *   buildProposal() now calls workoutGenerator.generateDailyOptions()
 *   instead of its own manual five-option scoring. This connects the
 *   entire coaching engine to the daily flow in one change:
 *     - availableTime now actually drives session length (was ignored)
 *     - strategicGoal.primaryGoal now drives session type bias
 *     - Programme phase (programmeEngine.getPhaseBias()) drives focus order
 *     - Difficulty floor rises with programme phase (SOLO taxonomy)
 *     - Core guarantee fires on every session silently
 *     - Burnout override (detectBurnout()) takes full control when high
 *     - Cycle phase adaptation active when hormonalTracking is on
 *     - Goal-aware bias (weight loss → cardio first, strength → strength first)
 *   All of this was already built in workoutGenerator.js v1.7 —
 *   it just wasn't being called. This is the wiring session.
 *
 *   Cardio resolution: "run" proposals now route to running-session
 *   instead of activity-log. Walk proposals route to walk-session.
 *   Both views exist and are production-quality. activity-log is
 *   reserved for post-hoc logging only.
 *
 *   proposalFromWorkout() converts a workoutGenerator option into the
 *   proposal shape the rest of this file uses. The three generated
 *   options map to: primary (shown), and two alternatives available
 *   via "Suggest something different" branch.
 *
 * 14 Jun 2026 v4 (S4-WP2) — Weekly plan realigned to schema v1.6.
 * 12 Jun 2026 v1 (S4-4 P2) — sessionLocation wiring.
 * 01 Jun 2026 v1 — Initial build.
 * 22 May 2026 v3 — Weekly plan wiring added.
 * 22 May 2026 v2 — Gym session routes through gym-sub screen.
 */

import { store }            from "../store.js";
import { workoutGenerator } from "../data/workoutGenerator.js";
import { checkinData }      from "../data/checkin.js";

export const centered = false;

// -- Activity Type Labels -----------------------------------------------------

const ACTIVITY_LABELS = {
  "gym": "gym session", "gym-programme": "gym session", "coach-session": "gym session",
  "strength": "strength work",
  "run": "run", "walk": "walk", "swim": "swim", "cycle": "cycle",
  "cardio": "cardio session", "row": "rowing session", "hiking": "hike",
  "boxing": "boxing session", "spin": "spin class", "hiit": "HIIT session",
  "body-balance": "Body Balance class", "class": "class",
  "yoga": "yoga session", "pilates": "pilates session", "tai-chi": "tai chi session",
  "stretching": "stretching session", "mobility": "mobility work",
  "mindful": "mindful movement", "breathing": "mindfulness practice",
  "meditation": "meditation", "journal": "journaling",
  "quiet": "quiet session", "rest": "rest day", "recovery": "recovery work",
  "prescribed": "prescribed exercises", "custom": "movement"
};

const SESSION_TYPE_LABELS = {
  upper: "Upper Body", lower: "Lower Body", full: "Full Body",
  core: "Core & Stability", cardio: "Cardio", hiit: "HIIT", mobility: "Mobility"
};

const LOCATION_LABELS = {
  home: "at home", gym: "at the gym", outside: "outside"
};

// -- State --------------------------------------------------------------------

let proposalState      = "proposal";
let currentProposal    = null;
let revisedProposal    = null;
let generatedOptions   = null;  // all 3 options from workoutGenerator
let branchChoice       = null;
let gymExplainerTarget = null;

// -- Weekly plan helpers ------------------------------------------------------

function getTodayPlan() {
  const weeklyPlan = store.get("weeklyPlan");
  if (!weeklyPlan || !weeklyPlan.updatedAt) return null;
  const day  = new Date().toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase();
  const plan = weeklyPlan.days?.[day];
  if (!plan || !plan.enabled || plan.type === "open") return null;
  return plan;
}

function getWorkoutDayLabel(plan) {
  if (plan.label) return plan.label;
  const parts = [];
  if (plan.sessionType && SESSION_TYPE_LABELS[plan.sessionType]) {
    parts.push(SESSION_TYPE_LABELS[plan.sessionType]);
  }
  (plan.classFocus || []).forEach(id => {
    const focusLabel = SESSION_TYPE_LABELS[id];
    if (focusLabel && !parts.includes(focusLabel)) parts.push(focusLabel);
  });
  return parts.length > 0 ? parts.join(" + ") : "Workout";
}

// -- Workout generator integration -------------------------------------------

/**
 * Convert a workoutGenerator option into the proposal shape used by
 * the rest of this file. Called once per generated option.
 *
 * Focus → route mapping:
 *   strength → gym-sub (uses gym programme / session builder)
 *   cardio   → running-session (real guided session, not activity-log)
 *   mobility → quiet-session in mindful mode
 *
 * The "run" proposal used to route to activity-log — that was wrong.
 * running-session.js is a complete guided session view with timers,
 * coach prompts, and condition-aware pacing cues.
 */
function proposalFromWorkout(workout, reflection) {
  if (!workout) return null;

  const focusToRoute = {
    strength: { target: "gym-sub",         quietMode: null,       type: "gym"      },
    cardio:   { target: "running-session",  quietMode: null,       type: "run"      },
    mobility: { target: "quiet-session",    quietMode: "mindful",  type: "yoga"     }
  };

  const route = focusToRoute[workout.focus] || focusToRoute.mobility;

  // Build a coach proposal text from the workout rationale
  const proposalText = buildProposalText(workout);

  return {
    type:      route.type,
    target:    route.target,
    quietMode: route.quietMode,
    duration:  workout.duration || 30,
    reflection,
    constraint:          null,
    proposal:            proposalText,
    rationale:           workout.rationale || "",
    severePainOverride:  false,
    workout              // keep the full workout object for session views
  };
}

/**
 * Build a natural coach proposal sentence from the generated workout.
 */
function buildProposalText(workout) {
  const name = (store.get("name") || "").split(" ")[0] || "";

  const focusLines = {
    strength: "I thought we'd do some strength work today.",
    cardio:   "I thought a cardio session today. Cardiovascular work at this stage makes a real difference.",
    mobility: "I thought something more restorative today. Mobility work and mindful movement."
  };

  const base = focusLines[workout.focus] || "Here is what I had in mind for today.";

  // Add programme context if active
  const ap = store.get("activeProgramme");
  if (ap?.programmeId && ap.currentWeek) {
    return base + " We are in Week " + ap.currentWeek + " — " + (ap.currentPhase || "building") + " phase.";
  }

  return base;
}

/**
 * Main proposal builder — now delegates to workoutGenerator.
 * Returns a proposal object in the shape used by renderProposal().
 *
 * Safety overrides (consecutive days, high pain, burnout) remain here
 * because they determine whether to show a workout proposal at all,
 * before the generator runs.
 */
function buildProposal(preferShorter = false) {
  const checkin      = latestCheckin();
  const energy       = checkin.energy || 5;
  const conditions   = store.get("conditions")         || [];
  const painScores   = store.get("conditionPainScores") || {};
  const activityLog  = store.get("activityLog")         || [];
  const prescribed   = (store.get("prescribedExercises") || []).filter(e => !e.completedToday);
  const availableTime = store.get("availableTime")      || null;

  const reflection = buildReflection(activityLog, 48, store.get("coachPersonality") || "steady");

  // ── Safety: consecutive days ─────────────────────────────────────────────
  const last7      = activityLog.slice(-7);
  const last7Types = last7.map(e => e.type || e.source || "");
  const isTraining = t => !["breathing", "journal", "rest", "mindful", "quiet"].includes(t);
  const isHeavy    = t => ["gym", "coach-session", "gym-programme", "run", "hiit", "boxing"].includes(t);

  let consecutiveDays = 0;
  for (let i = last7.length - 1; i >= 0; i--) {
    const entry   = last7[i];
    const daysAgo = Math.floor((Date.now() - new Date(entry.loggedAt || entry.sessionStart || Date.now())) / 86400000);
    if (daysAgo <= consecutiveDays + 1 && isTraining(last7Types[i])) { consecutiveDays++; }
    else break;
  }

  if (consecutiveDays >= 3) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "rest", duration: 15, reflection,
      proposal: "You have trained for " + consecutiveDays + " days in a row. Today needs to be a rest day. This is not optional — it is where adaptation actually happens.",
      rationale: "Rest is when your body builds back stronger. This day is as important as any session."
    });
  }

  const totalThisWeek = last7.filter(e => {
    const d = Math.floor((Date.now() - new Date(e.loggedAt || e.sessionStart || Date.now())) / 86400000);
    return d < 7 && isTraining(e.type || e.source || "");
  }).length;

  if (totalThisWeek >= 6) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "mindful", duration: 20, reflection,
      proposal: "You have been very active this week — six or more sessions in seven days. Today I want to suggest something restorative.",
      rationale: "High weekly volume without adequate recovery limits progress."
    });
  }

  // ── Safety: high pain or very low energy ────────────────────────────────
  const highPain = conditions.some(id => (painScores[id] || 0) >= 7);
  if (highPain || energy <= 2) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "breathing",
      duration: Math.min(availableTime ? ({micro:10,quick:20,short:30,standard:40,long:50,open:60}[availableTime] || 15) : 15, 15),
      reflection,
      proposal: "I think today calls for something gentle. A short breathing practice or a few minutes of stillness.",
      rationale: energy <= 2 ? "Your energy is very low. Rest and breath work are the right response." : "Your pain levels are elevated."
    });
  }

  // ── Prescribed exercises ─────────────────────────────────────────────────
  const todayKey    = new Date().toISOString().split("T")[0];
  const lastDate    = store.get("lastProposalDate") || null;
  const isRepeatDay = lastDate === todayKey;

  if (prescribed.length > 0 && energy >= 4 && !isRepeatDay) {
    const moderatePain = conditions.some(id => (painScores[id] || 0) >= 4);
    if (!moderatePain) {
      return makeProposal({
        type: "prescribed", target: "prescribed", quietMode: null,
        duration: 30, reflection,
        proposal: "I thought we could work through your prescribed exercises today. Consistency is what makes them work.",
        rationale: prescribed.length + " prescribed exercise" + (prescribed.length > 1 ? "s" : "") + " outstanding."
      });
    }
  }

  // ── Burnout check — let workoutGenerator handle this but catch ───────────
  // high burnout here to route to a rest proposal before calling generator
  const burnout = checkinData.detectBurnout();
  if (burnout.level === "high" && energy <= 3) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "mindful", duration: 20, reflection,
      proposal: "I have noticed you have been struggling recently. Today is about recovery, not pushing.",
      rationale: "Your body and mind need rest right now. This is the session."
    });
  }

  // ── Generate options via workoutGenerator ────────────────────────────────
  // preferShorter: temporarily reduce availableTime to get shorter options
  if (preferShorter) {
    const currentTime = store.get("availableTime");
    const shorter = { micro: "micro", quick: "micro", short: "quick",
                      standard: "short", long: "standard", open: "long" };
    store.set("availableTime", shorter[currentTime] || "quick");
  }

  try {
    generatedOptions = workoutGenerator.generateDailyOptions();
  } catch (e) {
    console.error("workoutGenerator error:", e);
    generatedOptions = null;
  }

  // Restore availableTime if we changed it
  if (preferShorter) {
    store.set("availableTime", availableTime);
  }

  if (!generatedOptions || generatedOptions.length === 0) {
    // Fallback if generator fails
    return makeProposal({
      type: "gym", target: "gym-sub", quietMode: null, duration: 40, reflection,
      proposal: "I thought a session today. Let's keep building.",
      rationale: "Consistent movement is what produces results."
    });
  }

  // Primary proposal from first generated option
  const primary = proposalFromWorkout(generatedOptions[0], reflection);
  return primary || makeProposal({
    type: "gym", target: "gym-sub", quietMode: null, duration: 40, reflection,
    proposal: "I thought a session today. Let's keep building.",
    rationale: "Consistent movement is what produces results."
  });
}

function buildReflection(activityLog, lookbackHours = 48, coachPersonality = "steady") {
  const cutoffTime         = Date.now() - (lookbackHours * 3600000);
  const relevantActivities = (activityLog || []).filter(a => {
    const completedAt = new Date(a.completedAt || a.loggedAt || a.sessionStart || Date.now()).getTime();
    return completedAt >= cutoffTime;
  });

  if (relevantActivities.length === 0) {
    const variants = {
      steady:    "You're here today, and that's what matters.",
      energetic: "You're here. Let's do this.",
      nurturing: "You're here now. That's enough.",
      minimal:   "You're here today."
    };
    return variants[coachPersonality] || variants.steady;
  }

  const typeSet = new Set();
  relevantActivities.forEach(a => {
    const type = a.type || a.source || "movement";
    typeSet.add(ACTIVITY_LABELS[type] || type);
  });
  const uniqueTypes = Array.from(typeSet);

  const dayAgo   = new Date(Date.now() - 24 * 3600000);
  const dayName  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayAgo.getDay()];
  const timeRef  = lookbackHours === 48 ? "since " + dayName : "recently";

  let sentence = "";
  if (uniqueTypes.length === 1) {
    sentence = "You've shown up for " + uniqueTypes[0] + " " + timeRef + ".";
  } else if (uniqueTypes.length === 2) {
    sentence = "You've shown up for " + uniqueTypes[0] + " and " + uniqueTypes[1] + " " + timeRef + ".";
  } else {
    const allButLast = uniqueTypes.slice(0, -1).join(", ");
    sentence = "You've shown up for " + allButLast + ", and " + uniqueTypes[uniqueTypes.length - 1] + " " + timeRef + ".";
  }
  return sentence;
}

function makeProposal({ type, target, quietMode, duration, reflection, constraint, proposal, rationale, severePainOverride = false }) {
  return { type, target, quietMode, duration, reflection, constraint: constraint || null, proposal, rationale, severePainOverride };
}

/**
 * Build an alternative proposal from the second generated option,
 * or fall back to the old alternative logic.
 */
function buildAlternativeProposal() {
  const current       = currentProposal;
  const availableTime = store.get("availableTime") || null;
  const TIME_MAP_ALT  = { micro: 10, quick: 20, short: 30, standard: 40, long: 50, open: 60 };
  const timeBudget    = availableTime ? (TIME_MAP_ALT[availableTime] || 30) : 30;

  // Use second generated option if available
  if (generatedOptions && generatedOptions.length >= 2) {
    const reflection = current?.reflection || buildReflection(store.get("activityLog") || [], 48);
    const alt = proposalFromWorkout(generatedOptions[1], reflection);
    if (alt) return alt;
  }

  // Fallback alternatives
  const alternatives = {
    "gym":       { type: "quiet",  target: "quiet-session", quietMode: "breathing", duration: 20,
                   proposal: "How about something quieter instead. A breathing practice or a short mindful session.",
                   rationale: "Sometimes contrast is the right choice." },
    "quiet":     { type: "gym",    target: "gym-sub",        quietMode: null,        duration: 35,
                   proposal: "How about a gym session after all.",
                   rationale: "Movement often generates the energy it costs." },
    "yoga":      { type: "gym",    target: "gym-sub",        quietMode: null,        duration: 40,
                   proposal: "How about the gym instead.",
                   rationale: "Strength work supports mobility over time." },
    "run":       { type: "walk",   target: "walk-session",   quietMode: null,        duration: 30,
                   proposal: "How about a walk instead. Same outdoor time, less intensity.",
                   rationale: "Lower-intensity movement has its own benefits." },
    "walk":      { type: "quiet",  target: "quiet-session",  quietMode: "mindful",   duration: 15,
                   proposal: "How about a short mindful session instead.",
                   rationale: "Rest is movement of a different kind." },
    "prescribed":{ type: "gym",    target: "gym-sub",        quietMode: null,        duration: 45,
                   proposal: "How about the full gym session.",
                   rationale: "More complete session, prescribed work included." }
  };

  const alt = alternatives[current?.type] || alternatives["quiet"];
  return { ...alt, duration: Math.min(alt.duration, timeBudget), reflection: current?.reflection };
}

function latestCheckin() {
  // checkinHistory is a plain object keyed by date strings
  const history  = store.get("checkinHistory") || {};
  const d        = new Date();
  const todayKey = d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
  return history[todayKey] || store.get("lastCheckin") || {};
}

// -- Render -------------------------------------------------------------------

export function render() {
  if (store.get("openGymSub")) {
    store.set("openGymSub", false);
    proposalState = "gym-sub";
  }

  if (proposalState === "proposal") {
    const plan = getTodayPlan();
    if (plan) {
      if (plan.type === "workout")  proposalState = "weekly-plan-workout";
      if (plan.type === "rest")     proposalState = "weekly-plan-rest";
      if (plan.type === "recovery") proposalState = "weekly-plan-recovery";
      if (plan.type === "event")    proposalState = "weekly-plan-event";
    }
  }

  if (proposalState === "proposal" && !currentProposal) {
    currentProposal = buildProposal();
  }

  const name = (store.get("name") || "").split(" ")[0] || "there";

  return `
    <div class="view coach-proposal-view">

      <div class="coach-proposal-header">
        <button class="btn btn-ghost btn-small proposal-back-btn"
                id="proposal-back-btn" aria-label="Back">
          &larr; Back
        </button>
        <button class="btn btn-ghost btn-small proposal-library-btn"
                id="proposal-library-btn" aria-label="Go to Library">
          Library &rarr;
        </button>
      </div>

      <div id="proposal-body">
        ${proposalState === "proposal"              ? renderProposal(name)           : ""}
        ${proposalState === "branching"             ? renderBranching()              : ""}
        ${proposalState === "revised"               ? renderRevised(name)            : ""}
        ${proposalState === "activity-pick"         ? renderActivityPick()           : ""}
        ${proposalState === "gym-sub"               ? renderGymSub()                : ""}
        ${proposalState === "gym-explainer"         ? renderGymExplainer()           : ""}
        ${proposalState === "weekly-plan-workout"   ? renderWeeklyPlanWorkout(name)  : ""}
        ${proposalState === "weekly-plan-rest"      ? renderWeeklyPlanRest(name)     : ""}
        ${proposalState === "weekly-plan-recovery"  ? renderWeeklyPlanRecovery(name) : ""}
        ${proposalState === "weekly-plan-event"     ? renderWeeklyPlanEvent(name)    : ""}
      </div>

    </div>
  `;
}

// -- Weekly plan renderers ----------------------------------------------------

function renderWeeklyPlanWorkout(name) {
  const plan  = getTodayPlan() || {};
  const label = getWorkoutDayLabel(plan);
  const locationPhrase = (plan.location && LOCATION_LABELS[plan.location])
    ? " " + LOCATION_LABELS[plan.location]
    : "";

  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-greeting">${getGreeting(name)}.</p>
        <p class="coach-proposal-suggestion">
          Your plan today is ${label}${locationPhrase}. Ready when you are.
        </p>
        <p class="coach-proposal-rationale text-sm text-muted">
          ${plan.durationMins ? "Target: " + plan.durationMins + " minutes." : "Duration is yours to choose today."}
          You can adjust any of this before you start.
        </p>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full" id="weekly-workout-go-btn"
              aria-label="Start ${label}">
        Let's do it
      </button>
      <button class="btn btn-primary btn-large btn-full" id="weekly-workout-adjust-btn"
              style="margin-top:var(--space-3);"
              aria-label="Adjust session for today">
        Adjust for today
      </button>
      <button class="btn btn-ghost btn-full" id="proposal-else-btn"
              style="margin-top:var(--space-3);">
        Something else entirely
      </button>
    </div>
  `;
}

function renderWeeklyPlanRest(name) {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-greeting">${getGreeting(name)}.</p>
        <p class="coach-proposal-suggestion">
          Today is a rest day in your plan. That's intentional — rest is part of the work.
        </p>
        <p class="coach-proposal-rationale text-sm text-muted">
          Adaptation happens during recovery. This day matters as much as any training day.
        </p>
      </div>
    </div>

    <p class="text-sm text-muted" style="margin:var(--space-4) 0 var(--space-2);">
      If you want something gentle:
    </p>
    <div style="display:flex;flex-direction:column;gap:var(--space-2);"
         role="group" aria-label="Gentle rest day options">
      ${[
        { id: "breathing", label: "Breathing practice",  target: "quiet-session", quietMode: "breathing" },
        { id: "journal",   label: "Journaling",          target: "quiet-session", quietMode: "journal"   },
        { id: "noticing",  label: "Noticing Hub",        target: "noticing",      quietMode: null        },
      ].map(opt => `
        <button class="card weekly-plan-option-btn"
                data-target="${opt.target}"
                data-quiet="${opt.quietMode || ""}"
                style="display:flex;align-items:center;justify-content:space-between;
                       padding:var(--space-3) var(--space-4);cursor:pointer;
                       background:var(--color-surface);"
                aria-label="${opt.label}">
          <span style="font-size:var(--text-sm);font-weight:var(--font-semibold);">${opt.label}</span>
          <span style="color:var(--color-primary);" aria-hidden="true">&#8250;</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-else-btn"
            style="margin-top:var(--space-5);">
      I want to move today
    </button>
  `;
}

function renderWeeklyPlanRecovery(name) {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-greeting">${getGreeting(name)}.</p>
        <p class="coach-proposal-suggestion">
          Recovery day. Your body is consolidating the work. Light movement if you want it.
        </p>
        <p class="coach-proposal-rationale text-sm text-muted">
          These sessions count. They are part of your training, not a break from it.
        </p>
      </div>
    </div>

    <p class="text-sm text-muted" style="margin:var(--space-4) 0 var(--space-2);">
      What feels right today?
    </p>
    <div style="display:flex;flex-direction:column;gap:var(--space-2);"
         role="group" aria-label="Recovery day options">
      ${[
        { id: "walk",      label: "Walk",             target: "walk-session",  quietMode: null        },
        { id: "yoga",      label: "Yoga / Pilates",   target: "yoga-session",  quietMode: null        },
        { id: "swim",      label: "Swim",             target: "swim-session",  quietMode: null        },
        { id: "mindful",   label: "Mindful movement", target: "quiet-session", quietMode: "mindful"   },
        { id: "breathing", label: "Breathing",        target: "quiet-session", quietMode: "breathing" },
      ].map(opt => `
        <button class="card weekly-plan-option-btn"
                data-target="${opt.target}"
                data-quiet="${opt.quietMode || ""}"
                style="display:flex;align-items:center;justify-content:space-between;
                       padding:var(--space-3) var(--space-4);cursor:pointer;
                       background:var(--color-surface);"
                aria-label="${opt.label}">
          <span style="font-size:var(--text-sm);font-weight:var(--font-semibold);">${opt.label}</span>
          <span style="color:var(--color-primary);" aria-hidden="true">&#8250;</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-else-btn"
            style="margin-top:var(--space-5);">
      Something else entirely
    </button>
  `;
}

function renderWeeklyPlanEvent(name) {
  const plan         = getTodayPlan() || {};
  const activityName = plan.activityName || plan.label || null;
  const durationPhrase = plan.durationMins ? " for about " + plan.durationMins + " minutes" : "";
  const locationPhrase = (plan.location && LOCATION_LABELS[plan.location])
    ? " " + LOCATION_LABELS[plan.location]
    : "";

  const coachLine = activityName
    ? "You've got " + activityName + " planned today" + locationPhrase + durationPhrase + ". Enjoy it — come back and log it when you're done."
    : "You have something planned today. Come back and log it when you're done.";

  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-greeting">${getGreeting(name)}.</p>
        <p class="coach-proposal-suggestion">${coachLine}</p>
        <p class="coach-proposal-rationale text-sm text-muted">
          When you're done, tap below and I'll log it to your activity history.
        </p>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full" id="weekly-event-log-btn"
              aria-label="Log my activity">
        Log it
      </button>
      <button class="btn btn-ghost btn-full" id="proposal-else-btn"
              style="margin-top:var(--space-3);">
        Something else entirely
      </button>
    </div>
  `;
}

// -- Standard renderers -------------------------------------------------------

function renderProposal(name) {
  const p = currentProposal;
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-greeting">${getGreeting(name)}.</p>
        <p class="coach-proposal-reflection">${p.reflection}</p>
        ${p.constraint ? `<p class="coach-proposal-constraint">${p.constraint}</p>` : ""}
        <p class="coach-proposal-suggestion">${p.proposal}</p>
        <p class="coach-proposal-rationale text-sm text-muted">${p.rationale}</p>
        <div class="coach-proposal-meta">
          <span class="coach-proposal-duration">&#8987; About ${p.duration} minutes</span>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full"
              id="proposal-accept-btn"
              ${p.severePainOverride ? "disabled" : ""}
              aria-label="Accept proposal">
        Let's go with your plan
      </button>
      <button class="btn btn-primary btn-large btn-full"
              id="proposal-adjust-btn"
              style="margin-top:var(--space-3);"
              aria-label="Adjust for today">
        Adjust for today
      </button>
      <button class="btn btn-ghost btn-full"
              id="proposal-else-btn"
              style="margin-top:var(--space-3);"
              aria-label="Something else entirely">
        Something else entirely
      </button>
    </div>
  `;
}

function renderBranching() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div><p>No problem. What would work better?</p></div>
    </div>

    <div class="coach-branch-chips" role="group" aria-label="What would you prefer?">
      <button class="coach-branch-chip" data-branch="mind"      aria-pressed="false">I had something in mind</button>
      <button class="coach-branch-chip" data-branch="different" aria-pressed="false">Suggest something different</button>
      <button class="coach-branch-chip" data-branch="shorter"   aria-pressed="false">Something shorter</button>
      <button class="coach-branch-chip" data-branch="quieter"   aria-pressed="false">Something quieter</button>
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-proposal-btn"
            style="margin-top:var(--space-4);">
      &larr; Back to the suggestion
    </button>
  `;
}

function renderRevised(name) {
  const p = revisedProposal || currentProposal;
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-suggestion">How about this instead.</p>
        <p class="coach-proposal-description">${p.proposal}</p>
        <p class="coach-proposal-rationale text-sm text-muted">${p.rationale}</p>
        <div class="coach-proposal-meta">
          <span class="coach-proposal-duration">&#8987; About ${p.duration} minutes</span>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full" id="proposal-accept-revised-btn"
              aria-label="Accept revised proposal">Let's go</button>
      <button class="btn btn-ghost btn-full" id="proposal-else-btn"
              style="margin-top:var(--space-3);">Still not quite right</button>
    </div>
  `;
}

const ACTIVITY_PICKS = [
  { id: "gym",        label: "Gym session",         target: "gym-sub",        quietMode: null        },
  { id: "run",        label: "Run",                  target: "running-session", quietMode: null       },
  { id: "walk",       label: "Walk",                 target: "walk-session",   quietMode: null        },
  { id: "swim",       label: "Swim",                 target: "swim-session",   quietMode: null        },
  { id: "cycle",      label: "Cycle",                target: "cycle-session",  quietMode: null        },
  { id: "yoga",       label: "Yoga / Pilates",       target: "yoga-session",   quietMode: null        },
  { id: "prescribed", label: "Prescribed exercises", target: "prescribed",     quietMode: null        },
  { id: "breathing",  label: "Breathing practice",   target: "quiet-session",  quietMode: "breathing" },
  { id: "journal",    label: "Journaling",           target: "quiet-session",  quietMode: "journal"   },
  { id: "mindful",    label: "Mindful movement",     target: "quiet-session",  quietMode: "mindful"   },
  { id: "walk",       label: "Walk",                 target: "walk-session",   quietMode: null        },
  { id: "class",      label: "A class",              target: "activity-log",   quietMode: null        },
];

const GYM_OPTIONS = [
  {
    id: "founders-gym", label: "Founder's Gym Programme",
    target: "gym-programme",
    tagline: "Graeme's own rehabilitation and strength programme",
    explainer: "This programme was built for Graeme Wright, founder of Alongside. It started as a post-injury rehabilitation plan and became a strength and conditioning programme built around real conditions, real equipment, and a real training history."
  },
  {
    id: "build-session", label: "Build a session",
    target: "session-builder-ui",
    tagline: "Coach builds a session around your equipment today",
    explainer: null
  },
  {
    id: "founders-cardio", label: "Morning Cardio & Core",
    target: "morning-session",
    tagline: "Graeme's six-week morning programme",
    explainer: "This is the morning programme Graeme built to create a consistent movement habit. Six weeks, three sessions a week: one at home and two at the gym. Cardio, upper body, and core in around 45 minutes."
  }
];

function renderGymSub() {
  const PROGRAMME_BG     = "rgba(20,184,166,0.06)";
  const GENERATE_BG      = "rgba(99,102,241,0.06)";
  const PROGRAMME_BORDER = "rgba(20,184,166,0.3)";
  const GENERATE_BORDER  = "rgba(99,102,241,0.3)";

  function optStyle(opt) {
    const isProgramme = opt.id !== "build-session";
    return {
      bg:     isProgramme ? PROGRAMME_BG     : GENERATE_BG,
      border: isProgramme ? PROGRAMME_BORDER : GENERATE_BORDER,
      tag:    isProgramme ? "Your programme"  : "Build for today",
      tagCol: isProgramme ? "var(--color-primary)" : "#818cf8",
    };
  }

  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div><p>Which kind of gym session?</p></div>
    </div>

    <div style="display:flex;flex-direction:column;gap:var(--space-3);margin-top:var(--space-2);">
      ${GYM_OPTIONS.map(opt => {
        const s = optStyle(opt);
        return `
          <button class="gym-sub-option-btn" data-gym-option="${opt.id}"
                  style="display:flex;align-items:flex-start;gap:var(--space-4);
                         text-align:left;width:100%;cursor:pointer;
                         background:${s.bg};
                         border:1.5px solid ${s.border};
                         border-radius:var(--radius-lg,12px);
                         padding:var(--space-4);"
                  aria-label="${opt.label}">
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1);">
                <p style="font-size:var(--text-base);font-weight:var(--font-semibold);margin:0;">
                  ${opt.label}
                </p>
                <span style="font-size:var(--text-xs);color:${s.tagCol};
                             border:1px solid ${s.tagCol};border-radius:999px;
                             padding:1px 8px;flex-shrink:0;white-space:nowrap;">
                  ${s.tag}
                </span>
              </div>
              <p style="font-size:var(--text-sm);color:var(--color-text-secondary);margin:0;">
                ${opt.tagline}
              </p>
            </div>
            <span style="color:var(--color-primary);font-size:1.25rem;flex-shrink:0;margin-top:2px;"
                  aria-hidden="true">&#8250;</span>
          </button>
        `;
      }).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-pick-btn"
            style="margin-top:var(--space-4);">&larr; Back</button>
  `;
}

function renderGymExplainer() {
  const opt = GYM_OPTIONS.find(o => o.target === gymExplainerTarget);
  if (!opt) return renderGymSub();
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <h3 style="color:var(--color-primary);margin-bottom:var(--space-2);">${opt.label}</h3>
        <p class="coach-message-text">${opt.explainer}</p>
      </div>
    </div>
    <button class="btn btn-primary btn-large btn-full" id="gym-explainer-start-btn"
            data-target="${opt.target}" style="margin-top:var(--space-5);">
      Start session &rarr;
    </button>
    <button class="btn btn-ghost btn-full" id="proposal-back-to-gym-sub-btn"
            style="margin-top:var(--space-3);">&larr; Back</button>
  `;
}

function renderActivityPick() {
  // Deduplicate picks by id
  const seen = new Set();
  const uniquePicks = ACTIVITY_PICKS.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div><p>What did you have in mind?</p></div>
    </div>

    <div class="coach-activity-pick-grid" role="group" aria-label="Choose an activity">
      ${uniquePicks.map(act => `
        <button class="coach-activity-pick-btn"
                data-target="${act.target}"
                data-quiet="${act.quietMode || ""}"
                data-activity="${act.id}"
                aria-label="${act.label}">
          <span>${act.label}</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-branching-btn"
            style="margin-top:var(--space-4);">&larr; Back</button>
  `;
}

// -- Helpers ------------------------------------------------------------------

function getGreeting(name) {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning " + name;
  if (hour < 17) return "Hey " + name;
  return "Evening " + name;
}

function navigateToProposal(proposal) {
  if (!proposal) return;
  if (proposal.quietMode) store.set("quietMode", proposal.quietMode);
  const prefs = store.get("activityPreferences") || {};
  prefs[proposal.type] = (prefs[proposal.type] || 0) + 1;
  store.set("activityPreferences", prefs);
  const todayKey = new Date().toISOString().split("T")[0];
  store.set("lastProposalType", proposal.type);
  store.set("lastProposalDate", todayKey);
  store.set("coachProposalAccepted", {
    type: proposal.type, duration: proposal.duration,
    acceptedAt: new Date().toISOString()
  });
  cleanup();
  router.navigate(proposal.target);
}

// -- Mount --------------------------------------------------------------------

export function onMount() {
  document.getElementById("proposal-back-btn")?.addEventListener("click", () => {
    cleanup(); router.back ? router.back() : router.navigate("coach-reflection");
  });
  document.getElementById("proposal-library-btn")?.addEventListener("click", () => {
    cleanup(); router.navigate("library");
  });

  document.getElementById("proposal-accept-btn")?.addEventListener("click", () => {
    navigateToProposal(currentProposal);
  });
  document.getElementById("proposal-adjust-btn")?.addEventListener("click", () => {
    store.set("proposalAdjusted", true); navigateToProposal(currentProposal);
  });

  document.getElementById("proposal-else-btn")?.addEventListener("click", () => {
    if (currentProposal && proposalState === "proposal") {
      const prefs = store.get("activityPreferences") || {};
      const declineKey = currentProposal.type + "_declined";
      prefs[declineKey] = (prefs[declineKey] || 0) + 1;
      store.set("activityPreferences", prefs);
    }
    if (!currentProposal) currentProposal = buildProposal();
    proposalState = "branching";
    rerender();
  });

  document.querySelectorAll(".coach-branch-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      branchChoice = chip.dataset.branch;
      if (branchChoice === "quieter")   { store.set("quietMode", "mindful"); cleanup(); router.navigate("quiet-session"); return; }
      if (branchChoice === "mind")      { proposalState = "activity-pick"; rerender(); return; }
      if (branchChoice === "shorter")   { revisedProposal = buildProposal(true); proposalState = "revised"; rerender(); return; }
      if (branchChoice === "different") { revisedProposal = buildAlternativeProposal(); proposalState = "revised"; rerender(); return; }
    });
  });

  document.getElementById("proposal-back-to-proposal-btn")?.addEventListener("click", () => {
    const plan = getTodayPlan();
    if (plan) {
      if (plan.type === "workout")       proposalState = "weekly-plan-workout";
      else if (plan.type === "rest")     proposalState = "weekly-plan-rest";
      else if (plan.type === "recovery") proposalState = "weekly-plan-recovery";
      else if (plan.type === "event")    proposalState = "weekly-plan-event";
      else proposalState = "proposal";
    } else {
      proposalState = "proposal";
    }
    rerender();
  });

  document.getElementById("proposal-back-to-branching-btn")?.addEventListener("click", () => {
    proposalState = "branching"; rerender();
  });

  document.getElementById("proposal-accept-revised-btn")?.addEventListener("click", () => {
    navigateToProposal(revisedProposal || currentProposal);
  });

  document.querySelectorAll(".coach-activity-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target    = btn.dataset.target;
      const quietMode = btn.dataset.quiet || null;
      if (target === "gym-sub") { proposalState = "gym-sub"; rerender(); return; }
      if (quietMode) store.set("quietMode", quietMode);
      store.set("coachProposalAccepted", {
        type: btn.dataset.activity, duration: null,
        acceptedAt: new Date().toISOString()
      });
      cleanup(); router.navigate(target);
    });
  });

  document.querySelectorAll(".gym-sub-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const optId = btn.dataset.gymOption;
      const opt   = GYM_OPTIONS.find(o => o.id === optId);
      if (!opt) return;
      if (opt.explainer) { gymExplainerTarget = opt.target; proposalState = "gym-explainer"; rerender(); }
      else { cleanup(); router.navigate(opt.target); }
    });
  });

  document.getElementById("gym-explainer-start-btn")?.addEventListener("click", e => {
    const target = e.currentTarget.dataset.target; cleanup(); router.navigate(target);
  });
  document.getElementById("proposal-back-to-gym-sub-btn")?.addEventListener("click", () => {
    proposalState = "gym-sub"; rerender();
  });
  document.getElementById("proposal-back-to-pick-btn")?.addEventListener("click", () => {
    proposalState = "activity-pick"; rerender();
  });

  document.getElementById("weekly-workout-go-btn")?.addEventListener("click", () => {
    const plan = getTodayPlan() || {};
    if (plan.sessionType)  store.set("weeklyPlanSessionType", plan.sessionType);
    if (plan.durationMins) store.set("weeklyPlanDuration", plan.durationMins);
    if (plan.location)     store.set("weeklyPlanLocation", plan.location);
    if (plan.classFocus && plan.classFocus.length) store.set("weeklyPlanClassFocus", plan.classFocus);
    cleanup();
    store.set("openGymSub", true);
    router.navigate("coach-proposal");
  });
  document.getElementById("weekly-workout-adjust-btn")?.addEventListener("click", () => {
    const plan = getTodayPlan() || {};
    if (plan.sessionType)  store.set("weeklyPlanSessionType", plan.sessionType);
    if (plan.durationMins) store.set("weeklyPlanDuration", plan.durationMins);
    if (plan.location)     store.set("weeklyPlanLocation", plan.location);
    if (plan.classFocus && plan.classFocus.length) store.set("weeklyPlanClassFocus", plan.classFocus);
    cleanup(); router.navigate("session-builder-ui");
  });

  document.getElementById("weekly-event-log-btn")?.addEventListener("click", () => {
    const plan = getTodayPlan() || {};
    store.set("activityLogPrefill", {
      isEvent: true,
      eventName: plan.activityName || plan.label || null,
      type: "class"
    });
    cleanup(); router.navigate("activity-log");
  });

  document.querySelectorAll(".weekly-plan-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target    = btn.dataset.target;
      const quietMode = btn.dataset.quiet || null;
      if (quietMode) store.set("quietMode", quietMode);
      cleanup(); router.navigate(target);
    });
  });
}

export function onUnmount() {
  cleanup();
}

function cleanup() {
  proposalState      = "proposal";
  currentProposal    = null;
  revisedProposal    = null;
  generatedOptions   = null;
  branchChoice       = null;
  gymExplainerTarget = null;
}

function rerender() {
  const body = document.getElementById("proposal-body");
  if (!body) return;
  const name = (store.get("name") || "").split(" ")[0] || "there";
  if (proposalState === "proposal")             body.innerHTML = renderProposal(name);
  if (proposalState === "branching")            body.innerHTML = renderBranching();
  if (proposalState === "revised")              body.innerHTML = renderRevised(name);
  if (proposalState === "activity-pick")        body.innerHTML = renderActivityPick();
  if (proposalState === "gym-sub")              body.innerHTML = renderGymSub();
  if (proposalState === "gym-explainer")        body.innerHTML = renderGymExplainer();
  if (proposalState === "weekly-plan-workout")  body.innerHTML = renderWeeklyPlanWorkout(name);
  if (proposalState === "weekly-plan-rest")     body.innerHTML = renderWeeklyPlanRest(name);
  if (proposalState === "weekly-plan-recovery") body.innerHTML = renderWeeklyPlanRecovery(name);
  if (proposalState === "weekly-plan-event")    body.innerHTML = renderWeeklyPlanEvent(name);
  onMount();
}
