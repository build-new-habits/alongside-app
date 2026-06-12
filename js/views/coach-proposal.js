/**
 * coach-proposal.js - Coach Proposal Screen
 *
 * 12 Jun 2026 v1 (S4-4 P2) -- sessionLocation wiring:
 *   buildProposal() reads store.sessionLocation and applies a scoring
 *   bias to the gym/yoga/quiet/run/walk options: "gym" location boosts
 *   gym, "home" location penalises gym and slightly favours yoga/quiet,
 *   "outside" favours run/walk and penalises gym. Weekly plan branch
 *   (getTodayPlan) is unaffected -- per-day location in weeklyPlan
 *   continues to override sessionLocation as before.
 *
 * 01 June 2026 v1
 *
 * 22 May 2026 v3 --- Weekly plan wiring added (S4-3):
 *   render() reads weeklyPlanEnabled + today's day slot before building proposal.
 *   If plan is enabled and today has a non-open type, branches immediately:
 *     gym      -> renderWeeklyPlanGym()      "Your plan today is [label]."
 *     rest     -> renderWeeklyPlanRest()     "Today is a rest day in your plan."
 *     recovery -> renderWeeklyPlanRecovery() "Recovery day. Light movement if you want it."
 *     class    -> renderWeeklyPlanClass()    "You have [activity] today."
 *   open / toggle off -> existing buildProposal() unchanged.
 *   proposalState "weekly-plan-*" handles rerender correctly.
 *   "Something else entirely" on any plan state falls through to normal branching.
 *
 * 22 May 2026 v2 -- Gym session routes through gym-sub screen.
 *                   openGymSub store flag opens directly in gym-sub state.
 *                   Gym sub wiring complete in onMount().
 *
 * v1.0 (S4-1, April 2026)
 */

import { store } from "../store.js";

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

// -- Session type labels (for weekly plan gym days) ---------------------------

const SESSION_TYPE_LABELS = {
  upper: "Upper Body", lower: "Lower Body", full: "Full Body",
  core: "Core & Stability", cardio: "Cardio", hiit: "HIIT", mobility: "Mobility"
};

// -- State --------------------------------------------------------------------

let proposalState   = "proposal";  // "proposal" | "branching" | "revised" | "activity-pick" | "gym-sub" | "gym-explainer" | "weekly-plan-gym" | "weekly-plan-rest" | "weekly-plan-recovery" | "weekly-plan-class"
let currentProposal = null;
let revisedProposal = null;
let branchChoice    = null;
let gymExplainerTarget = null;

// -- Weekly plan helpers ------------------------------------------------------

function getTodayPlan() {
  const enabled = store.get("weeklyPlanEnabled");
  if (!enabled) return null;
  const day  = new Date().toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase();
  const plan = store.get("weeklyPlan")?.[day];
  if (!plan || plan.type === "open") return null;
  return plan;
}

function getGymDayLabel(plan) {
  if (plan.label) return plan.label;
  if (plan.sessionType && SESSION_TYPE_LABELS[plan.sessionType]) {
    return SESSION_TYPE_LABELS[plan.sessionType];
  }
  return "Gym session";
}

// -- Proposal engine ----------------------------------------------------------

function buildProposal(preferShorter = false) {
  const name           = (store.get("name") || "").split(" ")[0] || "";
  const checkin        = latestCheckin();
  const energy         = checkin.energy || 5;
  const mood           = checkin.mood   || 5;
  const sleep          = checkin.sleep  || 7;
  const conditions     = store.get("conditions")         || [];
  const painScores     = store.get("conditionPainScores") || {};
  const activityLog    = store.get("activityLog")         || [];
  const prescribed     = (store.get("prescribedExercises") || []).filter(e => !e.completedToday);
  const availableTime  = store.get("availableTime")       || null;
  const goal           = store.get("strategicGoal")       || {};
  const gymWeek        = store.get("gymProgrammeWeek")    || 1;
  const gymSession     = store.get("gymProgrammeSession") || "A";
  const prefs          = store.get("activityPreferences") || {};
  const identity       = store.get("movementIdentity")    || null;
  const lastType       = store.get("lastProposalType")    || null;
  const lastDate       = store.get("lastProposalDate")    || null;
  const gymProgramme   = store.get("gymProgrammeWeek");
  const sessionLocation = store.get("sessionLocation")    || null;

  const TIME_MAP  = { micro: 10, quick: 20, short: 30, standard: 40, long: 50, open: 60 };
  let timeBudget  = availableTime ? (TIME_MAP[availableTime] || 40) : 40;
  if (preferShorter) timeBudget = Math.max(15, Math.round(timeBudget * 0.6));

  const recentLog     = activityLog.slice(-7);
  const lastSession   = recentLog[recentLog.length - 1] || null;
  const daysSinceLast = lastSession
    ? Math.floor((Date.now() - new Date(lastSession.loggedAt)) / 86400000)
    : 99;

  const recentTypes  = recentLog.map(e => e.type || e.source || "");
  const gymCount     = recentTypes.filter(t => ["gym", "coach-session", "gym-programme"].includes(t)).length;
  const cardioCount  = recentTypes.filter(t => ["run", "cycle", "swim", "cardio", "row"].includes(t)).length;
  const quietCount   = recentTypes.filter(t => ["breathing", "journal", "mindful", "rest"].includes(t)).length;

  const highPain     = conditions.some(id => (painScores[id] || 0) >= 7);
  const moderatePain = conditions.some(id => (painScores[id] || 0) >= 4);
  const hasPrescribed = prescribed.length > 0;
  const hasGymProg   = !!gymProgramme;

  const todayKey    = new Date().toISOString().split("T")[0];
  const isRepeatDay = lastDate === todayKey;

  function prefScore(type) {
    return (prefs[type] || 0) + (identity === type ? 3 : 0);
  }

  const coachPersonality = store.get("coachPersonality") || "steady";
  const reflection = buildReflection(activityLog, 48, coachPersonality);

  // Safety: consecutive days
  const last7      = activityLog.slice(-7);
  const last7Types = last7.map(e => e.type || e.source || "");
  const isTraining = t => !["breathing", "journal", "rest", "mindful", "quiet"].includes(t);
  const isHeavy    = t => ["gym", "coach-session", "gym-programme", "run", "hiit", "boxing"].includes(t);

  let consecutiveDays = 0;
  for (let i = last7.length - 1; i >= 0; i--) {
    const entry   = last7[i];
    const daysAgo = Math.floor((Date.now() - new Date(entry.loggedAt)) / 86400000);
    if (daysAgo <= consecutiveDays + 1 && isTraining(last7Types[i])) { consecutiveDays++; }
    else break;
  }

  const consecutiveHeavy = last7Types.slice(-2).every(isHeavy);
  const totalThisWeek    = last7.filter(e => {
    const d = Math.floor((Date.now() - new Date(e.loggedAt)) / 86400000);
    return d < 7 && isTraining(e.type || e.source || "");
  }).length;

  if (consecutiveDays >= 3) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "rest", duration: 15, reflection,
      proposal: "You have trained for " + consecutiveDays + " days in a row. Today needs to be a rest day. This is not optional -- it is where adaptation actually happens. Your body builds back stronger during recovery, not during effort.",
      rationale: "Consecutive training days without rest increase injury risk and reduce performance gains."
    });
  }

  const heavyOverride = consecutiveHeavy && energy < 8;

  if (totalThisWeek >= 6) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "mindful", duration: 20, reflection,
      proposal: "You have been very active this week -- six or more sessions in seven days. Today I want to suggest something restorative rather than another training session.",
      rationale: "High weekly volume without adequate recovery limits progress."
    });
  }

  if (highPain || energy <= 2) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "breathing",
      duration: Math.min(timeBudget, 15), reflection,
      proposal: "I think today calls for something gentle. A short breathing practice or a few minutes of stillness.",
      rationale: energy <= 2 ? "Your energy is very low. Rest and breath work are the right response." : "Your pain levels are elevated."
    });
  }

  if (hasPrescribed && energy >= 4 && !moderatePain && !isRepeatDay) {
    return makeProposal({
      type: "prescribed", target: "prescribed", quietMode: null,
      duration: Math.min(timeBudget, 30), reflection,
      proposal: "I thought we could work through your prescribed exercises today. Consistency is what makes them work.",
      rationale: prescribed.length + " prescribed exercise" + (prescribed.length > 1 ? "s" : "") + " outstanding."
    });
  }

  if (energy <= 3) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "mindful",
      duration: Math.min(timeBudget, 20), reflection,
      proposal: "I was thinking something quieter today. Something that meets you where you are.",
      rationale: sleep <= 5 ? "Disrupted sleep." : "Lower energy. This is a recovery moment."
    });
  }

  const locationBias = (type) => {
    if (sessionLocation === "gym") {
      if (type === "gym") return 3;
    } else if (sessionLocation === "home") {
      if (type === "gym") return -3;
      if (type === "yoga" || type === "quiet") return 1;
    } else if (sessionLocation === "outside") {
      if (type === "run" || type === "walk") return 2;
      if (type === "gym") return -2;
    }
    return 0;
  };

  const options = [
    {
      type: "gym", available: hasGymProg,
      score: prefScore("gym") + (gymCount < 3 ? 2 : 0) + (energy >= 6 ? 1 : 0) - (heavyOverride ? 3 : 0) + locationBias("gym"),
      proposal: "I thought we'd continue your gym programme today. Session " + gymSession + " of Week " + gymWeek + ".",
      rationale: energy >= 7 ? "Your energy is good. Make the most of it." : "Steady progress on the programme is what builds the result.",
      duration: Math.min(timeBudget, 45), target: "gym-programme", quietMode: null
    },
    {
      type: "yoga", available: true,
      score: prefScore("yoga") + (gymCount >= 3 ? 3 : 0) + (energy <= 5 ? 1 : 0) + locationBias("yoga"),
      proposal: "I thought a yoga or mobility session would serve you well today.",
      rationale: gymCount >= 3 ? "Several demanding sessions recently. Contrast helps." : "Mobility work complements your other training.",
      duration: Math.min(timeBudget, 35), target: "quiet-session", quietMode: "mindful"
    },
    {
      type: "quiet", available: true,
      score: prefScore("quiet") + (energy <= 4 ? 2 : 0) + (quietCount < 1 ? 1 : 0) + locationBias("quiet"),
      proposal: "I thought something quieter today. Not every day needs to be a training day.",
      rationale: "Balance between effort and recovery is where progress lives.",
      duration: Math.min(timeBudget, 20), target: "quiet-session", quietMode: "breathing"
    },
    {
      type: "run", available: true,
      score: prefScore("run") + (cardioCount < 1 ? 2 : 0) + locationBias("run"),
      proposal: "I thought a run today. Cardiovascular work at this stage of your goals makes a real difference.",
      rationale: "No cardio recently.",
      duration: Math.min(timeBudget, 35), target: "activity-log", quietMode: null
    },
    {
      type: "walk", available: true,
      score: prefScore("walk") + (energy <= 4 ? 1 : 0) + (daysSinceLast >= 3 ? 1 : 0) + locationBias("walk"),
      proposal: "I thought a walk today. Movement that generates the energy it costs.",
      rationale: energy <= 4 ? "Lower energy responds well to gentle sustained movement." : "A good complement to your recent sessions.",
      duration: Math.min(timeBudget, 40), target: "activity-log", quietMode: null
    }
  ];

  const ranked = options
    .filter(o => o.available)
    .map(o => ({ ...o, finalScore: o.score - (o.type === lastType && isRepeatDay ? 5 : 0) }))
    .sort((a, b) => b.finalScore - a.finalScore);

  const chosen = ranked[0];
  return makeProposal({
    type: chosen.type, target: chosen.target, quietMode: chosen.quietMode,
    duration: chosen.duration, reflection,
    proposal: chosen.proposal, rationale: chosen.rationale
  });
}

function buildReflection(activityLog, lookbackHours = 48, coachPersonality = "steady") {
  const cutoffTime         = Date.now() - (lookbackHours * 3600000);
  const relevantActivities = (activityLog || []).filter(a => {
    const completedAt = new Date(a.completedAt || a.loggedAt || Date.now()).getTime();
    return completedAt >= cutoffTime;
  });

  if (relevantActivities.length === 0) {
    const variants = {
      steady: "You're here today, and that's what matters.",
      energetic: "You're here. Let's do this.",
      nurturing: "You're here now. That's enough.",
      minimal: "You're here today."
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

function buildAlternativeProposal() {
  const current       = currentProposal;
  const availableTime = store.get("availableTime") || null;
  const TIME_MAP_ALT  = { micro: 10, quick: 20, short: 30, standard: 40, long: 50, open: 60 };
  const timeBudget    = availableTime ? (TIME_MAP_ALT[availableTime] || 30) : 30;

  const alternatives = {
    "gym":       { type: "quiet",  target: "quiet-session", quietMode: "breathing", duration: 20,
                   proposal: "How about something quieter instead. A breathing practice or a short mindful session.",
                   rationale: "Sometimes contrast is the right choice." },
    "quiet":     { type: "gym",   target: "gym-programme",  quietMode: null, duration: 35,
                   proposal: "How about continuing your gym programme after all.",
                   rationale: "Movement often generates the energy it costs." },
    "yoga":      { type: "gym",   target: "gym-programme",  quietMode: null, duration: 40,
                   proposal: "How about the gym programme instead.",
                   rationale: "Strength work supports mobility over time." },
    "run":       { type: "walk",  target: "activity-log",   quietMode: null, duration: 30,
                   proposal: "How about a walk instead. Same outdoor time, less intensity.",
                   rationale: "Lower-intensity movement has its own benefits." },
    "walk":      { type: "quiet", target: "quiet-session",  quietMode: "mindful", duration: 15,
                   proposal: "How about a short mindful session instead.",
                   rationale: "Rest is movement of a different kind." },
    "prescribed":{ type: "gym",   target: "gym-programme",  quietMode: null, duration: 45,
                   proposal: "How about the full gym session.",
                   rationale: "More complete session, prescribed work included." }
  };

  const alt = alternatives[current.type] || alternatives["quiet"];
  return { ...alt, reflection: current.reflection };
}

function latestCheckin() {
  const history  = store.get("checkinHistory") || {};
  const todayKey = new Date().toISOString().split("T")[0];
  return history[todayKey] || store.get("lastCheckin") || {};
}

// -- Render -------------------------------------------------------------------

export function render() {
  // Gym session from "I know what I'm doing" path
  if (store.get("openGymSub")) {
    store.set("openGymSub", false);
    proposalState = "gym-sub";
  }

  // Weekly plan check --- runs before normal proposal engine
  if (proposalState === "proposal") {
    const plan = getTodayPlan();
    if (plan) {
      if (plan.type === "gym")      proposalState = "weekly-plan-gym";
      if (plan.type === "rest")     proposalState = "weekly-plan-rest";
      if (plan.type === "recovery") proposalState = "weekly-plan-recovery";
      if (plan.type === "class")    proposalState = "weekly-plan-class";
    }
  }

  // Normal proposal --- only build if no plan state active
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
        ${proposalState === "proposal"              ? renderProposal(name)          : ""}
        ${proposalState === "branching"             ? renderBranching()             : ""}
        ${proposalState === "revised"               ? renderRevised(name)           : ""}
        ${proposalState === "activity-pick"         ? renderActivityPick()          : ""}
        ${proposalState === "gym-sub"               ? renderGymSub()               : ""}
        ${proposalState === "gym-explainer"         ? renderGymExplainer()          : ""}
        ${proposalState === "weekly-plan-gym"       ? renderWeeklyPlanGym(name)     : ""}
        ${proposalState === "weekly-plan-rest"      ? renderWeeklyPlanRest(name)    : ""}
        ${proposalState === "weekly-plan-recovery"  ? renderWeeklyPlanRecovery(name): ""}
        ${proposalState === "weekly-plan-class"     ? renderWeeklyPlanClass(name)   : ""}
      </div>

    </div>
  `;
}

// -- Weekly plan renderers ----------------------------------------------------

function renderWeeklyPlanGym(name) {
  const plan  = getTodayPlan() || {};
  const label = getGymDayLabel(plan);
  const dur   = plan.durationMins ? plan.durationMins + " minutes" : "as long as feels right";

  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-greeting">${getGreeting(name)}.</p>
        <p class="coach-proposal-suggestion">
          Your plan today is ${label}. Ready when you are.
        </p>
        <p class="coach-proposal-rationale text-sm text-muted">
          ${plan.durationMins ? "Target: " + plan.durationMins + " minutes." : "Duration is yours to choose today."}
          You can adjust any of this before you start.
        </p>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full" id="weekly-gym-go-btn"
              aria-label="Start ${label}">
        Let's do it
      </button>
      <button class="btn btn-primary btn-large btn-full" id="weekly-gym-adjust-btn"
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
          Today is a rest day in your plan. That's intentional -- rest is part of the work.
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
        { id: "noticing",  label: "Noticing Hub",        target: "noticing-hub",  quietMode: null        },
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
        { id: "walk",      label: "Walk",             target: "activity-log",  quietMode: null            },
        { id: "yoga",      label: "Yoga / Pilates",   target: "quiet-session", quietMode: "mindful"       },
        { id: "swim",      label: "Swim",             target: "activity-log",  quietMode: null            },
        { id: "mindful",   label: "Mindful movement", target: "quiet-session", quietMode: "mindful"       },
        { id: "breathing", label: "Breathing",        target: "quiet-session", quietMode: "breathing"     },
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

function renderWeeklyPlanClass(name) {
  const plan         = getTodayPlan() || {};
  const activityName = plan.activityName || null;
  const coachLine    = activityName
    ? "You have " + activityName + " today. Enjoy it. Come back and log it when you're done."
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
      <button class="btn btn-primary btn-large btn-full" id="weekly-class-log-btn"
              aria-label="Log my class">
        Log my class
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
  { id: "gym",        label: "Gym session",         target: "gym-sub",       quietMode: null         },
  { id: "prescribed", label: "Prescribed exercises", target: "prescribed",    quietMode: null         },
  { id: "yoga",       label: "Yoga / Pilates",       target: "yoga-session",  quietMode: null         },
  { id: "breathing",  label: "Breathing practice",   target: "quiet-session", quietMode: "breathing"  },
  { id: "journal",    label: "Journaling",           target: "quiet-session", quietMode: "journal"    },
  { id: "mindful",    label: "Mindful movement",     target: "quiet-session", quietMode: "mindful"    },
  { id: "walk",       label: "Walk",                 target: "activity-log",  quietMode: null         },
  { id: "run",        label: "Run",                  target: "activity-log",  quietMode: null         },
  { id: "swim",       label: "Swim",                 target: "activity-log",  quietMode: null         },
  { id: "class",      label: "A class",              target: "activity-log",  quietMode: null         },
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
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div><p>What did you have in mind?</p></div>
    </div>

    <div class="coach-activity-pick-grid" role="group" aria-label="Choose an activity">
      ${ACTIVITY_PICKS.map(act => `
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
  // Header
  document.getElementById("proposal-back-btn")?.addEventListener("click", () => {
    cleanup(); router.back();
  });
  document.getElementById("proposal-library-btn")?.addEventListener("click", () => {
    cleanup(); store.set("settingsTab", "library"); router.navigate("settings");
  });

  // Standard proposal
  document.getElementById("proposal-accept-btn")?.addEventListener("click", () => {
    navigateToProposal(currentProposal);
  });
  document.getElementById("proposal-adjust-btn")?.addEventListener("click", () => {
    store.set("proposalAdjusted", true); navigateToProposal(currentProposal);
  });

  // "Something else entirely" --- works from ALL states, always goes to branching
  document.getElementById("proposal-else-btn")?.addEventListener("click", () => {
    // Decline signal for preference learning (standard proposal only)
    if (currentProposal && proposalState === "proposal") {
      const prefs = store.get("activityPreferences") || {};
      const declineKey = currentProposal.type + "_declined";
      prefs[declineKey] = (prefs[declineKey] || 0) + 1;
      store.set("activityPreferences", prefs);
    }
    // For rest days "I want to move today" also lands here
    // Ensure a standard proposal is built so branching has something to offer
    if (!currentProposal) currentProposal = buildProposal();
    proposalState = "branching";
    rerender();
  });

  // Branch chips
  document.querySelectorAll(".coach-branch-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      branchChoice = chip.dataset.branch;
      if (branchChoice === "quieter") {
        store.set("quietMode", "mindful"); cleanup(); router.navigate("quiet-session"); return;
      }
      if (branchChoice === "mind")      { proposalState = "activity-pick"; rerender(); return; }
      if (branchChoice === "shorter")   { revisedProposal = buildProposal(true); proposalState = "revised"; rerender(); return; }
      if (branchChoice === "different") { revisedProposal = buildAlternativeProposal(); proposalState = "revised"; rerender(); return; }
    });
  });

  document.getElementById("proposal-back-to-proposal-btn")?.addEventListener("click", () => {
    // Return to whichever state we came from --- re-read plan
    const plan = getTodayPlan();
    if (plan) {
      if (plan.type === "gym")      proposalState = "weekly-plan-gym";
      else if (plan.type === "rest")     proposalState = "weekly-plan-rest";
      else if (plan.type === "recovery") proposalState = "weekly-plan-recovery";
      else if (plan.type === "class")    proposalState = "weekly-plan-class";
      else proposalState = "proposal";
    } else {
      proposalState = "proposal";
    }
    rerender();
  });

  document.getElementById("proposal-back-to-branching-btn")?.addEventListener("click", () => {
    proposalState = "branching"; rerender();
  });

  // Revised proposal
  document.getElementById("proposal-accept-revised-btn")?.addEventListener("click", () => {
    navigateToProposal(revisedProposal || currentProposal);
  });

  // Activity pick
  document.querySelectorAll(".coach-activity-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target    = btn.dataset.target;
      const quietMode = btn.dataset.quiet || null;
      if (target === "gym-sub") {
        proposalState = "gym-sub"; rerender(); return;
      }
      if (quietMode) store.set("quietMode", quietMode);
      store.set("coachProposalAccepted", {
        type: btn.dataset.activity, duration: null,
        acceptedAt: new Date().toISOString()
      });
      cleanup(); router.navigate(target);
    });
  });

  // Gym sub
  document.querySelectorAll(".gym-sub-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const optId = btn.dataset.gymOption;
      const opt   = GYM_OPTIONS.find(o => o.id === optId);
      if (!opt) return;
      if (opt.explainer) {
        gymExplainerTarget = opt.target;
        proposalState = "gym-explainer"; rerender();
      } else {
        cleanup(); router.navigate(opt.target);
      }
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

  // Weekly plan --- gym day
  document.getElementById("weekly-gym-go-btn")?.addEventListener("click", () => {
    const plan = getTodayPlan() || {};
    if (plan.sessionType) store.set("weeklyPlanSessionType", plan.sessionType);
    if (plan.durationMins) store.set("weeklyPlanDuration", plan.durationMins);
    cleanup(); router.navigate("gym-sub");
    // Immediately open gym sub-screen
    store.set("openGymSub", true); router.navigate("coach-proposal");
  });
  document.getElementById("weekly-gym-adjust-btn")?.addEventListener("click", () => {
    // Go to session builder with pre-filled values from plan
    const plan = getTodayPlan() || {};
    if (plan.sessionType) store.set("weeklyPlanSessionType", plan.sessionType);
    if (plan.durationMins) store.set("weeklyPlanDuration", plan.durationMins);
    cleanup(); router.navigate("session-builder-ui");
  });

  // Weekly plan --- class day
  document.getElementById("weekly-class-log-btn")?.addEventListener("click", () => {
    const plan = getTodayPlan() || {};
    store.set("activityLogPrefill", {
      isEvent: true,
      eventName: plan.activityName || null,
      type: "class"
    });
    cleanup(); router.navigate("activity-log");
  });

  // Weekly plan --- rest/recovery option buttons
  document.querySelectorAll(".weekly-plan-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target    = btn.dataset.target;
      const quietMode = btn.dataset.quiet || null;
      if (quietMode) store.set("quietMode", quietMode);
      cleanup(); router.navigate(target);
    });
  });
}

function cleanup() {
  proposalState      = "proposal";
  currentProposal    = null;
  revisedProposal    = null;
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
  if (proposalState === "weekly-plan-gym")      body.innerHTML = renderWeeklyPlanGym(name);
  if (proposalState === "weekly-plan-rest")     body.innerHTML = renderWeeklyPlanRest(name);
  if (proposalState === "weekly-plan-recovery") body.innerHTML = renderWeeklyPlanRecovery(name);
  if (proposalState === "weekly-plan-class")    body.innerHTML = renderWeeklyPlanClass(name);
  onMount();
}
