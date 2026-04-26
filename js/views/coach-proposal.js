/**
 * coach-proposal.js - Coach Proposal Screen
 *
 * v1.0 (S4-1, April 2026)
 *
 * The coach arrives with a plan. Not a menu. Not cards.
 * A single proposal in plain English, with visible reasoning,
 * and two responses: "Let's go" or "Something else."
 *
 * The coach reads:
 *   - Today's energy, mood, sleep from check-in
 *   - Last session from activityLog (type, when, how hard)
 *   - Active conditions and pain scores
 *   - Strategic goal and target date
 *   - Gym programme week and session
 *   - Available time
 *   - Days since last session
 *
 * From this it produces:
 *   - A named plan type (e.g. "gym session", "something quieter", "a walk")
 *   - A plain-English description of why
 *   - A duration estimate
 *   - A navigation target when accepted
 *
 * On "Something else": soft branching chips appear.
 *   - I had something in mind  → shows activity type chips
 *   - Suggest something different → revised proposal
 *   - Something shorter → same plan, shorter duration
 *   - Something quieter → navigates to quiet-session
 *
 * Header:
 *   ← Back          Library →
 *   (returns to     (goes to Library tab
 *    check-in)       in Settings)
 *
 * Route: coach-proposal
 * Nav: hidden (this IS the nav moment)
 */

import { store } from "../store.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────

let proposalState   = "proposal";  // "proposal" | "branching" | "revised" | "activity-pick"
let currentProposal = null;        // the active proposal object
let revisedProposal = null;        // the alternative proposal
let branchChoice    = null;        // "mind" | "different" | "shorter" | "quieter"

// ── Proposal engine ───────────────────────────────────────────────────────────

/**
 * Build a proposal object from all available store data.
 *
 * The coach speaks in four parts:
 *   1. Greeting     — time-aware, personal
 *   2. Reflection   — what you have done recently, drawn from activityLog
 *   3. Goal mention — brief, specific, not repeated every day
 *   4. Proposal     — "So I thought today..." — the actual suggestion
 *   5. Invitation   — "Unless you had something else in mind?"
 *
 * Decision logic:
 *   1. Severe override (high pain or very low energy) → rest/breathing
 *   2. movementIdentity + activityPreferences weight the options
 *   3. Variety enforcement — avoid repeating yesterday's proposal type
 *   4. Energy-aware routing — low energy steers away from high-intensity
 *   5. Goal-aware routing — weight loss steers toward cardio variety
 *   6. Recent session analysis — avoid repeating same pattern 3+ days
 *   7. No unconditional defaults — gym is not assumed
 *
 * @param {boolean} preferShorter - build a shorter version of the same logic
 * @returns {{ greeting, reflection, proposal, rationale, duration, target, quietMode }}
 */
function buildProposal(preferShorter = false) {
  // ── Read all available data ──────────────────────────────────────────────
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
  const gymProgramme   = store.get("gymProgrammeWeek");   // null if not started

  // Time budget
  const TIME_MAP      = { micro: 15, quick: 20, short: 30, standard: 40, long: 50, open: 60 };
  let timeBudget      = availableTime ? (TIME_MAP[availableTime] || 40) : 40;
  if (preferShorter)  timeBudget = Math.max(15, Math.round(timeBudget * 0.6));

  // Recent activity analysis
  const recentLog      = activityLog.slice(-7);
  const lastSession    = recentLog[recentLog.length - 1] || null;
  const daysSinceLast  = lastSession
    ? Math.floor((Date.now() - new Date(lastSession.loggedAt)) / 86400000)
    : 99;

  const recentTypes    = recentLog.map(e => e.type || e.source || "");
  const gymCount       = recentTypes.filter(t => ["gym", "coach-session", "gym-programme"].includes(t)).length;
  const cardioCount    = recentTypes.filter(t => ["run", "cycle", "swim", "cardio", "row"].includes(t)).length;
  const quietCount     = recentTypes.filter(t => ["breathing", "journal", "mindful", "rest"].includes(t)).length;
  const classCount     = recentTypes.filter(t => ["class", "boxing", "spin", "body-balance", "hiit"].includes(t)).length;

  const highPain       = conditions.some(id => (painScores[id] || 0) >= 7);
  const moderatePain   = conditions.some(id => (painScores[id] || 0) >= 4);
  const hasPrescribed  = prescribed.length > 0;
  const hasGymProg     = !!gymProgramme;

  // Is today the same day as the last proposal?
  const todayKey       = new Date().toISOString().split("T")[0];
  const isRepeatDay    = lastDate === todayKey;

  // Preference score helper: how much does the user lean toward a type?
  function prefScore(type) {
    const base = prefs[type] || 0;
    const identityBonus = identity === type ? 3 : 0;
    return base + identityBonus;
  }

  // ── Build the reflection sentence ────────────────────────────────────────
  const reflection = buildReflection(recentLog, daysSinceLast, goal);

  // ── Safety layer — must run before preference logic ─────────────────────
  // Neurodivergent users may follow the coach as their primary guide.
  // We have a responsibility to prevent overtraining.
  //
  // Rules:
  //   3+ consecutive training days → coach must suggest rest or quiet today
  //   2 consecutive heavy sessions (gym/run) → suggest lower intensity
  //   7 sessions in 7 days → flag recovery regardless of energy
  //
  // "Training day" = any activityLog entry that is NOT breathing/journal/rest/mindful.
  const last7        = activityLog.slice(-7);
  const last7Types   = last7.map(e => e.type || e.source || "");
  const isTraining   = t => !["breathing", "journal", "rest", "mindful", "quiet"].includes(t);
  const isHeavy      = t => ["gym", "coach-session", "gym-programme", "run", "hiit", "boxing"].includes(t);

  // Count consecutive training days ending today
  let consecutiveDays = 0;
  for (let i = last7.length - 1; i >= 0; i--) {
    const entry = last7[i];
    const daysAgo = Math.floor((Date.now() - new Date(entry.loggedAt)) / 86400000);
    if (daysAgo <= consecutiveDays + 1 && isTraining(last7Types[i])) {
      consecutiveDays++;
    } else {
      break;
    }
  }

  const consecutiveHeavy = last7Types.slice(-2).every(isHeavy);
  const totalThisWeek    = last7.filter(e => {
    const d = Math.floor((Date.now() - new Date(e.loggedAt)) / 86400000);
    return d < 7 && isTraining(e.type || e.source || "");
  }).length;

  // Hard override: 3+ consecutive days must rest
  if (consecutiveDays >= 3) {
    const reflection = buildReflection(recentLog, daysSinceLast, goal);
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "rest",
      duration: 15,
      reflection,
      proposal: "You have trained for " + consecutiveDays + " days in a row. Today needs to be a rest day. This is not optional — it is where adaptation actually happens. Your body builds back stronger during recovery, not during effort.",
      rationale: "Consecutive training days without rest increase injury risk and reduce performance gains. Recovery is part of the programme."
    });
  }

  // Soft flag: 2 consecutive heavy sessions → steer toward lower intensity
  const heavyOverride = consecutiveHeavy && energy < 8;

  // 7 sessions in 7 days — very high volume flag
  if (totalThisWeek >= 6) {
    const reflection = buildReflection(recentLog, daysSinceLast, goal);
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "mindful",
      duration: 20,
      reflection,
      proposal: "You have been very active this week — six or more sessions in seven days. Today I want to suggest something restorative rather than another training session. Your body needs this.",
      rationale: "High weekly volume without adequate recovery limits progress and increases overuse risk."
    });
  }

  // ── Decision logic continues (preference + variety) ──────────────────────
  if (highPain || energy <= 2) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "breathing",
      duration: Math.min(timeBudget, 15),
      reflection,
      proposal: "I think today calls for something gentle. A short breathing practice or a few minutes of stillness.",
      rationale: energy <= 2
        ? "Your energy is very low. Rest and breath work are the right response."
        : "Your pain levels are elevated. Gentle is the most supportive thing I can offer today."
    });
  }

  // 2. Prescribed exercises — only propose if not repeatedly refusing them
  const prescribedAccepts = prefs["prescribed"] || 0;
  const prescribedRefused = (prefs["prescribed_declined"] || 0);
  const prescribedRatio   = prescribedAccepts / Math.max(1, prescribedAccepts + prescribedRefused);
  if (hasPrescribed && energy >= 4 && !moderatePain && prescribedRatio >= 0.3 && !isRepeatDay) {
    return makeProposal({
      type: "prescribed", target: "prescribed", quietMode: null,
      duration: Math.min(timeBudget, 30),
      reflection,
      proposal: "I thought we could work through your prescribed exercises today. Your physio gave you these for a reason, and consistency is what makes them work.",
      rationale: prescribed.length + " prescribed exercise" + (prescribed.length > 1 ? "s" : "") + " outstanding. Your energy is good enough to do them properly."
    });
  }

  // 3. Very low energy but not severe — quiet or gentle
  if (energy <= 3) {
    const quietPref = prefScore("quiet");
    if (mood <= 3 || sleep <= 5 || quietPref > prefScore("gym")) {
      return makeProposal({
        type: "quiet", target: "quiet-session", quietMode: "mindful",
        duration: Math.min(timeBudget, 20),
        reflection,
        proposal: "I was thinking something quieter today. A gentle mindful practice, or some breathing work. Something that meets you where you are.",
        rationale: sleep <= 5 ? "Disrupted sleep." : "Lower energy and mood. This is a recovery moment, not a training moment."
      });
    }
  }

  // 4. Movement identity + preference weighting
  // Score each option and pick the highest that isn't a repeat
  const options = [
    {
      type: "gym", available: hasGymProg,
      score: prefScore("gym") + (gymCount < 3 ? 2 : 0) + (energy >= 6 ? 1 : 0) - (heavyOverride ? 3 : 0),
      proposal: "I thought we'd continue your gym programme today. Session " + gymSession + " of Week " + gymWeek + ". Your cardio warmup, the main session, and your prescribed work built in.",
      rationale: energy >= 7 ? "Your energy is good. Make the most of it." : "Steady progress on the programme is what builds the result.",
      duration: Math.min(timeBudget, 45), target: "gym-programme", quietMode: null
    },
    {
      type: "yoga", available: true,
      score: prefScore("yoga") + (gymCount >= 3 ? 3 : 0) + (energy <= 5 ? 1 : 0),
      proposal: "I thought a yoga or mobility session would serve you well today. Something that supports recovery while still moving your body intentionally.",
      rationale: gymCount >= 3 ? "You have had several demanding sessions recently. Contrast helps." : "Mobility work complements your other training.",
      duration: Math.min(timeBudget, 35), target: "quiet-session", quietMode: "mindful"
    },
    {
      type: "quiet", available: true,
      score: prefScore("quiet") + (energy <= 4 ? 2 : 0) + (quietCount < 1 ? 1 : 0),
      proposal: "I thought something quieter today. A breathing practice or a few minutes of reflection. Not every day needs to be a training day.",
      rationale: "Balance between effort and recovery is where progress lives.",
      duration: Math.min(timeBudget, 20), target: "quiet-session", quietMode: "breathing"
    },
    {
      type: "run", available: true,
      score: prefScore("run") + (cardioCount < 1 ? 2 : 0),
      proposal: "I thought a run today. Even a short one. Cardiovascular work at this stage of your goals makes a real difference.",
      rationale: "No cardio recently. Your goal includes body composition change.",
      duration: Math.min(timeBudget, 35), target: "activity-log", quietMode: null
    },
    {
      type: "walk", available: true,
      score: prefScore("walk") + (energy <= 4 ? 1 : 0) + (daysSinceLast >= 3 ? 1 : 0),
      proposal: "I thought a walk today. Not nothing, but not a demand either. Movement that generates the energy it costs.",
      rationale: energy <= 4 ? "Lower energy responds well to gentle sustained movement." : "A good complement to your recent sessions.",
      duration: Math.min(timeBudget, 40), target: "activity-log", quietMode: null
    }
  ];

  // Filter available, penalise yesterday's type, sort by score
  const ranked = options
    .filter(o => o.available)
    .map(o => ({
      ...o,
      finalScore: o.score - (o.type === lastType && isRepeatDay ? 5 : 0)
    }))
    .sort((a, b) => b.finalScore - a.finalScore);

  const chosen = ranked[0];

  return makeProposal({
    type: chosen.type, target: chosen.target, quietMode: chosen.quietMode,
    duration: chosen.duration, reflection,
    proposal: chosen.proposal, rationale: chosen.rationale
  });
}

/**
 * Build the reflection sentence from recent activity log.
 * Reads the last 3 entries and constructs a plain-English summary.
 * Varies based on recency and what was done.
 */
function buildReflection(recentLog, daysSinceLast, goal) {
  if (recentLog.length === 0) {
    return "This looks like an early session, so I am working from your goals and how you are feeling today.";
  }

  if (daysSinceLast >= 5) {
    return "It has been " + daysSinceLast + " days since your last session. Welcome back.";
  }

  if (daysSinceLast === 0) {
    return "You have already been active today.";
  }

  // Describe the last 1-3 sessions in plain English
  const last = recentLog[recentLog.length - 1];
  const prev = recentLog[recentLog.length - 2] || null;

  const lastLabel = activityLabel(last.type || last.source || "session");
  const prevLabel = prev ? activityLabel(prev.type || prev.source || "session") : null;

  const dayWord = daysSinceLast === 1 ? "yesterday" : daysSinceLast + " days ago";

  // Goal reference — vary day of week to avoid repetition
  const dayOfWeek = new Date().getDay();
  const mentionGoal = goal.targetDescription && dayOfWeek % 3 === 1;

  let reflection = "We had a " + lastLabel + " " + dayWord + ".";

  if (prev && prev.type !== last.type) {
    reflection = "We have had a " + prevLabel + " and a " + lastLabel + " in the last few sessions.";
  }

  if (mentionGoal) {
    reflection += " Keeping your goal in mind \u2014 " + goal.targetDescription + ".";
  }

  return reflection;
}

function activityLabel(type) {
  const labels = {
    "gym": "gym session", "coach-session": "gym session", "gym-programme": "gym session",
    "run": "run", "walk": "walk", "swim": "swim", "cycle": "cycle",
    "yoga": "yoga session", "pilates": "pilates session",
    "breathing": "breathing practice", "journal": "journaling session",
    "mindful": "mindful movement session", "rest": "rest day",
    "class": "class", "boxing": "boxing session", "spin": "spin class",
    "body-balance": "Body Balance class", "hiit": "HIIT session",
    "prescribed": "prescribed exercises", "quiet": "quiet session"
  };
  return labels[type] || type.replace(/-/g, " ");
}

function makeProposal({ type, target, quietMode, duration, reflection, proposal, rationale }) {
  return { type, target, quietMode, duration, reflection, proposal, rationale };
}

/**
 * Build an alternative proposal — genuinely different from current.
 */
function buildAlternativeProposal() {
  const current    = currentProposal;
  const timeBudget = 30;

  const alternatives = {
    "gym":       { type: "quiet",      target: "quiet-session",  quietMode: "breathing", duration: 20,
                   proposal: "How about something quieter instead. A breathing practice or a short mindful session.",
                   rationale: "Sometimes contrast is the right choice." },
    "quiet":     { type: "gym",        target: "gym-programme",  quietMode: null,         duration: 35,
                   proposal: "How about continuing your gym programme after all. You might have more in you than you think.",
                   rationale: "Movement often generates the energy it costs." },
    "yoga":      { type: "gym",        target: "gym-programme",  quietMode: null,         duration: 40,
                   proposal: "How about the gym programme instead. A different kind of movement that will complement your recent sessions.",
                   rationale: "Strength work supports mobility over time." },
    "run":       { type: "walk",       target: "activity-log",   quietMode: null,         duration: 30,
                   proposal: "How about a walk instead. Same outdoor time, less intensity, still moving.",
                   rationale: "Lower-intensity movement has its own benefits." },
    "walk":      { type: "quiet",      target: "quiet-session",  quietMode: "mindful",   duration: 15,
                   proposal: "How about a short mindful session instead. Fifteen minutes of stillness.",
                   rationale: "Rest is movement of a different kind." },
    "prescribed":{ type: "gym",        target: "gym-programme",  quietMode: null,         duration: 45,
                   proposal: "How about the full gym session. Your prescribed work is already built into the warmup.",
                   rationale: "More complete session, same prescribed work included." }
  };

  const alt = alternatives[current.type] || alternatives["quiet"];
  return {
    ...alt,
    reflection: current.reflection  // keep the same reflection
  };
}

function latestCheckin() {
  const history = store.get("checkinHistory") || {};
  const todayKey = new Date().toISOString().split("T")[0];
  return history[todayKey] || store.get("lastCheckin") || {};
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (!currentProposal) currentProposal = buildProposal();
  const name = (store.get("name") || "").split(" ")[0] || "there";

  return `
    <div class="view coach-proposal-view">

      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <div class="coach-proposal-header">
        <button class="btn btn-ghost btn-small proposal-back-btn"
                id="proposal-back-btn"
                aria-label="Back">
          &larr; Back
        </button>
        <button class="btn btn-ghost btn-small proposal-library-btn"
                id="proposal-library-btn"
                aria-label="Go to Library">
          Library &rarr;
        </button>
      </div>

      <!-- ── Coach proposal ──────────────────────────────────────────────── -->
      <div id="proposal-body">
        ${proposalState === "proposal"   ? renderProposal(name)  : ""}
        ${proposalState === "branching"  ? renderBranching()     : ""}
        ${proposalState === "revised"    ? renderRevised(name)   : ""}
        ${proposalState === "activity-pick" ? renderActivityPick() : ""}
      </div>

    </div>
  `;
}

function renderProposal(name) {
  const p = currentProposal;
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-greeting" style="font-size:1.6rem;line-height:1.2;">${getGreeting(name)}.</p>
        <p class="coach-proposal-reflection">${p.reflection}</p>
        <p class="coach-proposal-suggestion" style="font-size:1.15rem;line-height:1.6;">${p.proposal}</p>
        <p class="coach-proposal-rationale text-sm text-muted">${p.rationale}</p>
        <div class="coach-proposal-meta">
          <span class="coach-proposal-duration">&#8987; About ${p.duration} minutes</span>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full" id="proposal-accept-btn"
              aria-label="Accept proposal and start session">
        Let's go
      </button>
      <button class="btn btn-ghost btn-full" id="proposal-else-btn"
              style="margin-top: var(--space-3);">
        Unless you had something else in mind
      </button>
    </div>
  `;
}

function renderBranching() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <p>No problem. What would work better?</p>
      </div>
    </div>

    <div class="coach-branch-chips" role="group" aria-label="What would you prefer?">
      <button class="coach-branch-chip" data-branch="mind"
              aria-pressed="false">
        I had something in mind
      </button>
      <button class="coach-branch-chip" data-branch="different"
              aria-pressed="false">
        Suggest something different
      </button>
      <button class="coach-branch-chip" data-branch="shorter"
              aria-pressed="false">
        Something shorter
      </button>
      <button class="coach-branch-chip" data-branch="quieter"
              aria-pressed="false">
        Something quieter
      </button>
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-proposal-btn"
            style="margin-top: var(--space-4);">
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
        <p class="coach-proposal-thinking">
          How about this instead &mdash; ${p.label}.
        </p>
        <p class="coach-proposal-description">${p.description}</p>
        <p class="coach-proposal-rationale text-sm text-muted">${p.rationale}</p>
        <div class="coach-proposal-meta">
          <span class="coach-proposal-duration">&#8987; About ${p.duration} minutes</span>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full" id="proposal-accept-revised-btn"
              aria-label="Accept revised proposal">
        Let's go
      </button>
      <button class="btn btn-ghost btn-full" id="proposal-else-btn"
              style="margin-top: var(--space-3);">
        Still not quite right
      </button>
    </div>
  `;
}

const ACTIVITY_PICKS = [
  { id: "gym",         label: "Gym session",         icon: "\uD83C\uDFCB", target: "gym-programme",  quietMode: null },
  { id: "prescribed",  label: "Prescribed exercises", icon: "\uD83E\uDE7A", target: "prescribed",     quietMode: null },
  { id: "yoga",        label: "Yoga / Pilates",       icon: "\uD83E\uDDD8", target: "yoga-session",   quietMode: null },
  { id: "breathing",   label: "Breathing practice",   icon: "\uD83C\uDF2C", target: "quiet-session",  quietMode: "breathing" },
  { id: "journal",     label: "Journaling",           icon: "\uD83D\uDCDD", target: "quiet-session",  quietMode: "journal" },
  { id: "mindful",     label: "Mindful movement",     icon: "\uD83C\uDF3F", target: "quiet-session",  quietMode: "mindful" },
  { id: "walk",        label: "Walk",                 icon: "\uD83D\uDEB6", target: "activity-log",   quietMode: null },
  { id: "run",         label: "Run",                  icon: "\uD83C\uDFC3", target: "activity-log",   quietMode: null },
  { id: "swim",        label: "Swim",                 icon: "\uD83C\uDFCA", target: "activity-log",   quietMode: null },
  { id: "class",       label: "A class",              icon: "\uD83C\uDFE5", target: "activity-log",   quietMode: null },
];

function renderActivityPick() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <p>What did you have in mind?</p>
      </div>
    </div>

    <div class="coach-activity-pick-grid" role="group" aria-label="Choose an activity">
      ${ACTIVITY_PICKS.map(act => `
        <button class="coach-activity-pick-btn"
                data-target="${act.target}"
                data-quiet="${act.quietMode || ""}"
                data-activity="${act.id}"
                aria-label="${act.label}">
          <span aria-hidden="true">${act.icon}</span>
          <span>${act.label}</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-branching-btn"
            style="margin-top: var(--space-4);">
      &larr; Back
    </button>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(name) {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning " + name;
  if (hour < 17) return "Hey " + name;
  return "Evening " + name;
}

function navigateToProposal(proposal) {
  if (proposal.quietMode) store.set("quietMode", proposal.quietMode);

  // Record accepted proposal type for preference learning
  const prefs = store.get("activityPreferences") || {};
  prefs[proposal.type] = (prefs[proposal.type] || 0) + 1;
  store.set("activityPreferences", prefs);

  // Track last proposal type for variety enforcement
  const todayKey = new Date().toISOString().split("T")[0];
  store.set("lastProposalType", proposal.type);
  store.set("lastProposalDate", todayKey);

  store.set("coachProposalAccepted", {
    type: proposal.type,
    duration: proposal.duration,
    acceptedAt: new Date().toISOString()
  });

  router.navigate(proposal.target);
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  // ── Header navigation ─────────────────────────────────────────────────────
  document.getElementById("proposal-back-btn")?.addEventListener("click", () => {
    cleanup();
    router.navigate("checkin");
  });

  document.getElementById("proposal-library-btn")?.addEventListener("click", () => {
    cleanup();
    store.set("settingsTab", "library");
    router.navigate("settings");
  });

  // ── Accept proposal ───────────────────────────────────────────────────────
  document.getElementById("proposal-accept-btn")?.addEventListener("click", () => {
    navigateToProposal(currentProposal);
  });

  // ── Something else ────────────────────────────────────────────────────────
  document.getElementById("proposal-else-btn")?.addEventListener("click", () => {
    // Record that user declined this proposal type — softly reduces its future weight
    const prefs = store.get("activityPreferences") || {};
    const declineKey = (currentProposal?.type || "unknown") + "_declined";
    prefs[declineKey] = (prefs[declineKey] || 0) + 1;
    store.set("activityPreferences", prefs);

    proposalState = "branching";
    rerender();
  });

  // ── Branch chips ──────────────────────────────────────────────────────────
  document.querySelectorAll(".coach-branch-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      branchChoice = chip.dataset.branch;

      if (branchChoice === "quieter") {
        store.set("quietMode", "mindful");
        cleanup();
        router.navigate("quiet-session");
        return;
      }

      if (branchChoice === "mind") {
        proposalState = "activity-pick";
        rerender();
        return;
      }

      if (branchChoice === "shorter") {
        revisedProposal = buildProposal(true);
        proposalState   = "revised";
        rerender();
        return;
      }

      if (branchChoice === "different") {
        revisedProposal = buildAlternativeProposal();
        proposalState   = "revised";
        rerender();
        return;
      }
    });
  });

  // ── Back to proposal ──────────────────────────────────────────────────────
  document.getElementById("proposal-back-to-proposal-btn")?.addEventListener("click", () => {
    proposalState = "proposal";
    rerender();
  });

  document.getElementById("proposal-back-to-branching-btn")?.addEventListener("click", () => {
    proposalState = "branching";
    rerender();
  });

  // ── Accept revised ────────────────────────────────────────────────────────
  document.getElementById("proposal-accept-revised-btn")?.addEventListener("click", () => {
    navigateToProposal(revisedProposal || currentProposal);
  });

  // ── Activity pick ─────────────────────────────────────────────────────────
  document.querySelectorAll(".coach-activity-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target    = btn.dataset.target;
      const quietMode = btn.dataset.quiet || null;
      if (quietMode)  store.set("quietMode", quietMode);
      store.set("coachProposalAccepted", {
        type: btn.dataset.activity,
        label: btn.querySelector("span:last-child")?.textContent || "",
        duration: null,
        acceptedAt: new Date().toISOString()
      });
      cleanup();
      router.navigate(target);
    });
  });
}

function cleanup() {
  proposalState   = "proposal";
  currentProposal = null;
  revisedProposal = null;
  branchChoice    = null;
}

function rerender() {
  const body = document.getElementById("proposal-body");
  if (!body) return;
  const name = (store.get("name") || "").split(" ")[0] || "there";
  if (proposalState === "proposal")      body.innerHTML = renderProposal(name);
  if (proposalState === "branching")     body.innerHTML = renderBranching();
  if (proposalState === "revised")       body.innerHTML = renderRevised(name);
  if (proposalState === "activity-pick") body.innerHTML = renderActivityPick();
  onMount();
}
