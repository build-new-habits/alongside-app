/**
 * coach-proposal.js  —  Coach Proposal Screen
 *
 * v1.1  (S4-2 bug-fix, May 2026)
 *
 * Fixes in this version:
 *   1. NaN days ago  —  date lookup now tries completedAt || loggedAt || date
 *      before falling back to 99. A guard in buildReflection() catches any
 *      residual NaN before it reaches the template string.
 *   2. movementIdentity multi-select  —  identity is now an array.
 *      prefScore() checks Array.isArray and uses .includes() so the coach
 *      engine works whether the store holds a legacy string or the new array.
 *   3. Safety layer first-use path  —  when activityLog is empty the safety
 *      layer is skipped entirely. Previous code still ran the consecutive-day
 *      check on an empty array, which produced unpredictable scores.
 *   4. Reflection copy  —  first-use message is warmer and does not mention
 *      "early session" (shame-adjacent framing).
 *
 * Architecture unchanged from v1.0:
 *   Route: coach-proposal  |  Nav: hidden
 *   Post-checkin home screen. Coach speaks first, proposes a plan.
 *   Two responses: "Let's go" or "Unless you had something else in mind."
 *   Branching: I had something in mind / Suggest something different /
 *              Something shorter / Something quieter.
 */

import { store }  from "../store.js";
import { router } from "../router.js";

// ── Module state ──────────────────────────────────────────────────────────────

let proposalState   = "proposal";   // "proposal" | "branching" | "revised" | "activity-pick"
let currentProposal = null;
let revisedProposal = null;
let branchChoice    = null;

// ── Activity label map ────────────────────────────────────────────────────────

const ACTIVITY_LABELS = {
  "gym":          "gym session",
  "coach-session":"gym session",
  "gym-programme":"gym session",
  "run":          "run",
  "walk":         "walk",
  "swim":         "swim",
  "cycle":        "cycle",
  "row":          "rowing session",
  "yoga":         "yoga session",
  "pilates":      "pilates session",
  "breathing":    "breathing practice",
  "journal":      "journaling session",
  "mindful":      "mindful movement session",
  "rest":         "rest day",
  "class":        "class",
  "boxing":       "boxing session",
  "spin":         "spin class",
  "body-balance": "Body Balance class",
  "hiit":         "HIIT session",
  "prescribed":   "prescribed exercises",
  "quiet":        "quiet session"
};

function activityLabel(type) {
  return ACTIVITY_LABELS[type] || (type || "session").replace(/-/g, " ");
}

// ── Activity picker options (I had something in mind) ─────────────────────────

const ACTIVITY_PICKS = [
  { id: "gym",        label: "Gym session",          icon: "\uD83C\uDFCB", target: "gym-programme",  quietMode: null },
  { id: "prescribed", label: "Prescribed exercises",  icon: "\uD83E\uDE7A", target: "prescribed",     quietMode: null },
  { id: "yoga",       label: "Yoga / Pilates",        icon: "\uD83E\uDDD8", target: "yoga-session",   quietMode: null },
  { id: "breathing",  label: "Breathing practice",    icon: "\uD83C\uDF2C", target: "quiet-session",  quietMode: "breathing" },
  { id: "journal",    label: "Journaling",            icon: "\uD83D\uDCDD", target: "quiet-session",  quietMode: "journal" },
  { id: "mindful",    label: "Mindful movement",      icon: "\uD83C\uDF3F", target: "quiet-session",  quietMode: "mindful" },
  { id: "walk",       label: "Walk",                  icon: "\uD83D\uDEB6", target: "activity-log",   quietMode: null },
  { id: "run",        label: "Run",                   icon: "\uD83C\uDFC3", target: "activity-log",   quietMode: null },
  { id: "swim",       label: "Swim",                  icon: "\uD83C\uDFCA", target: "activity-log",   quietMode: null },
  { id: "class",      label: "A class",               icon: "\uD83C\uDFE5", target: "activity-log",   quietMode: null },
];

// ── Proposal engine ───────────────────────────────────────────────────────────

/**
 * Read the latest check-in for today, falling back to the last stored check-in.
 */
function latestCheckin() {
  const history  = store.get("checkinHistory") || {};
  const todayKey = new Date().toISOString().split("T")[0];
  return history[todayKey] || store.get("lastCheckin") || {};
}

/**
 * Safely read a date field from an activityLog entry.
 * Tries completedAt, loggedAt, date in order. Returns null if none resolves.
 */
function entryDate(entry) {
  if (!entry) return null;
  const raw = entry.completedAt || entry.loggedAt || entry.date || null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Build a reflection sentence from the recent activity log.
 * Uses the 48-hour lookback window by default.
 */
function buildReflection(recentLog, daysSinceLast, goal) {
  // First use — log is empty or has never had a valid session
  if (recentLog.length === 0) {
    return "Good to have you here. Let us make today's session work for you.";
  }

  // Safe day count — guard against residual NaN from malformed log entries
  const safeDays = Number.isFinite(daysSinceLast) ? daysSinceLast : 99;

  if (safeDays >= 5) {
    return "It has been " + safeDays + " days since your last session. Welcome back.";
  }

  if (safeDays === 0) {
    return "You have already been active today. This will build on that.";
  }

  const last      = recentLog[recentLog.length - 1];
  const prev      = recentLog[recentLog.length - 2] || null;
  const lastLabel = activityLabel(last.type || last.source || "");
  const prevLabel = prev ? activityLabel(prev.type || prev.source || "") : null;
  const dayWord   = safeDays === 1 ? "yesterday" : safeDays + " days ago";

  // Vary goal mention by day of week to avoid repetition
  const dayOfWeek  = new Date().getDay();
  const mentionGoal = goal.targetDescription && dayOfWeek % 3 === 1;

  let reflection = "We had a " + lastLabel + " " + dayWord + ".";

  if (prev && (prev.type || prev.source) !== (last.type || last.source)) {
    reflection = "We have had a " + prevLabel + " and a " + lastLabel + " in the last few sessions.";
  }

  if (mentionGoal) {
    reflection += " Keeping your goal in mind \u2014 " + goal.targetDescription + ".";
  }

  return reflection;
}

/**
 * Build the main proposal object from all available store data.
 *
 * Decision order:
 *   1. Empty log  —  skip safety layer, use preferences + identity only
 *   2. Severe pain or very low energy  —  rest / breathing override
 *   3. Consecutive training day safety rule  —  3+ days → mandatory rest
 *   4. Preference and identity scoring
 *   5. Variety enforcement (penalise yesterday's type)
 *
 * @param  {boolean} preferShorter  Build a shorter version of the same logic
 */
function buildProposal(preferShorter = false) {

  // ── Read store ──────────────────────────────────────────────────────────
  const name          = (store.get("name") || "").split(" ")[0] || "";
  const checkin       = latestCheckin();
  const energy        = checkin.energy || 5;
  const mood          = checkin.mood   || 5;
  const conditions    = store.get("conditions")          || [];
  const painScores    = store.get("conditionPainScores") || {};
  const activityLog   = store.get("activityLog")         || [];
  const prescribed    = (store.get("prescribedExercises") || []).filter(e => !e.completedToday);
  const availableTime = store.get("availableTime")        || null;
  const goal          = store.get("strategicGoal")        || {};
  const gymWeek       = store.get("gymProgrammeWeek")     || 1;
  const gymSession    = store.get("gymProgrammeSession")  || "A";
  const gymProgramme  = store.get("gymProgrammeWeek");

  // movementIdentity is an array now; tolerate legacy string values
  const rawIdentity   = store.get("movementIdentity");
  const identityArr   = Array.isArray(rawIdentity)
    ? rawIdentity
    : (rawIdentity ? [rawIdentity] : []);

  const prefs         = store.get("activityPreferences") || {};
  const lastType      = store.get("lastProposalType")    || null;
  const lastDate      = store.get("lastProposalDate")    || null;

  // ── Time budget ─────────────────────────────────────────────────────────
  const TIME_MAP  = { micro: 15, quick: 20, short: 30, standard: 40, long: 50, open: 60 };
  let timeBudget  = availableTime ? (TIME_MAP[availableTime] || 40) : 40;
  if (preferShorter) timeBudget = Math.max(15, Math.round(timeBudget * 0.6));

  // ── Recent activity analysis ────────────────────────────────────────────
  const recentLog     = activityLog.slice(-7);
  const lastSession   = recentLog[recentLog.length - 1] || null;

  // FIX: use safe date extractor — prevents NaN days ago
  const lastDate_d    = entryDate(lastSession);
  const daysSinceLast = lastDate_d
    ? Math.floor((Date.now() - lastDate_d.getTime()) / 86400000)
    : 99;

  const recentTypes   = recentLog.map(e => e.type || e.source || "");
  const gymCount      = recentTypes.filter(t => ["gym", "coach-session", "gym-programme"].includes(t)).length;
  const cardioCount   = recentTypes.filter(t => ["run", "cycle", "swim", "cardio", "row"].includes(t)).length;
  const quietCount    = recentTypes.filter(t => ["breathing", "journal", "mindful", "rest"].includes(t)).length;

  const highPain      = conditions.some(id => (painScores[id] || 0) >= 7);
  const moderatePain  = conditions.some(id => (painScores[id] || 0) >= 4);
  const hasPrescribed = prescribed.length > 0;
  const hasGymProg    = !!gymProgramme;

  const todayKey      = new Date().toISOString().split("T")[0];
  const isRepeatDay   = lastDate === todayKey;

  // ── Build reflection sentence ───────────────────────────────────────────
  const reflection = buildReflection(recentLog, daysSinceLast, goal);

  // ── Preference score helper ─────────────────────────────────────────────
  // FIX: identity is now an array — use .includes() for bonus
  function prefScore(type) {
    const base         = prefs[type] || 0;
    const identityBonus = identityArr.includes(type) ? 3 : 0;
    return base + identityBonus;
  }

  // ── Safety layer — severe override ──────────────────────────────────────
  if (highPain || energy <= 2) {
    return {
      type:       "quiet",
      target:     "quiet-session",
      quietMode:  "breathing",
      duration:   15,
      reflection,
      proposal:   "Your body is asking for something gentle today. I have a short breathing practice ready. Nothing demanding.",
      rationale:  highPain
        ? "A high pain score is a signal worth listening to. Gentle movement protects you."
        : "Very low energy means rest is training too."
    };
  }

  // ── Safety layer — consecutive day override ─────────────────────────────
  // FIX: only run this when the log is non-empty to avoid false positives
  const isTraining = t => !["breathing", "journal", "mindful", "rest"].includes(t);

  if (activityLog.length > 0) {
    const last3Types = recentTypes.slice(-3);
    const allTraining3 = last3Types.length === 3 && last3Types.every(isTraining);
    const last6Types = recentTypes.slice(-6);
    const sessionsIn7 = recentLog.length;
    const heavyOverride = allTraining3 || sessionsIn7 >= 6;

    if (allTraining3) {
      return {
        type:      "quiet",
        target:    "quiet-session",
        quietMode: "rest",
        duration:  20,
        reflection,
        proposal:  "You have trained hard three days in a row. Today I am going to suggest something restorative. Your muscles need contrast to grow.",
        rationale: "Recovery is not optional. It is where the adaptation happens."
      };
    }
  }

  // ── Heavy session penalty ───────────────────────────────────────────────
  const last2Types   = recentTypes.slice(-2);
  const heavyCount   = last2Types.filter(t => ["gym", "coach-session", "gym-programme", "run"].includes(t)).length;
  const heavyPenalty = heavyCount >= 2 ? 3 : 0;

  // ── Score all options ───────────────────────────────────────────────────
  const options = [
    {
      type: "gym",
      available: hasGymProg,
      score: prefScore("gym") + (gymCount < 2 ? 2 : 0) + (energy >= 6 ? 1 : 0) - heavyPenalty,
      proposal: "I thought we would continue your gym programme today. Session " + gymSession + " of Week " + gymWeek + ". Your cardio warmup, the main session, and your prescribed work built in.",
      rationale: energy >= 7
        ? "Your energy is good. Make the most of it."
        : "Steady progress on the programme is what builds the result.",
      duration: Math.min(timeBudget, 45),
      target: "gym-programme",
      quietMode: null
    },
    {
      type: "gym",
      available: !hasGymProg,
      score: prefScore("gym") + (gymCount < 2 ? 2 : 0) + (energy >= 6 ? 1 : 0) - heavyPenalty,
      proposal: "I thought a gym session today. Strength work at this stage of your goals makes a real difference.",
      rationale: energy >= 7 ? "Your energy is good. Use it." : "Consistent strength work compounds over weeks, not days.",
      duration: Math.min(timeBudget, 45),
      target: "gym-programme",
      quietMode: null
    },
    {
      type: "yoga",
      available: true,
      score: prefScore("yoga") + (gymCount >= 2 ? 3 : 0) + (energy <= 5 ? 1 : 0),
      proposal: "I thought a yoga or mobility session would serve you well today. Something that supports recovery while still moving your body intentionally.",
      rationale: gymCount >= 2
        ? "You have had some demanding sessions recently. Contrast helps."
        : "Mobility work complements your other training.",
      duration: Math.min(timeBudget, 35),
      target: "yoga-session",
      quietMode: null
    },
    {
      type: "quiet",
      available: true,
      score: prefScore("quiet") + (energy <= 4 ? 2 : 0) + (quietCount < 1 ? 1 : 0),
      proposal: "I thought something quieter today. A breathing practice or a few minutes of reflection. Not every day needs to be a training day.",
      rationale: "Balance between effort and recovery is where progress lives.",
      duration: Math.min(timeBudget, 20),
      target: "quiet-session",
      quietMode: "breathing"
    },
    {
      type: "run",
      available: true,
      score: prefScore("run") + (cardioCount < 1 ? 2 : 0),
      proposal: "I thought a run today. Even a short one. Cardiovascular work at this stage of your goals makes a real difference.",
      rationale: "No cardio recently. Your goal includes body composition change.",
      duration: Math.min(timeBudget, 35),
      target: "activity-log",
      quietMode: null
    },
    {
      type: "walk",
      available: true,
      score: prefScore("walk") + (energy <= 4 ? 1 : 0) + (daysSinceLast >= 3 ? 1 : 0),
      proposal: "I thought a walk today. Not nothing, but not a demand either. Movement that generates the energy it costs.",
      rationale: energy <= 4
        ? "Lower energy responds well to gentle sustained movement."
        : "A good complement to your recent sessions.",
      duration: Math.min(timeBudget, 40),
      target: "activity-log",
      quietMode: null
    }
  ];

  const ranked = options
    .filter(o => o.available)
    .map(o => ({
      ...o,
      finalScore: o.score - (o.type === lastType && isRepeatDay ? 5 : 0)
    }))
    .sort((a, b) => b.finalScore - a.finalScore);

  const chosen = ranked[0];

  return {
    type:       chosen.type,
    target:     chosen.target,
    quietMode:  chosen.quietMode,
    duration:   chosen.duration,
    reflection,
    proposal:   chosen.proposal,
    rationale:  chosen.rationale
  };
}

/**
 * Build an alternative proposal — genuinely different from the current one.
 */
function buildAlternativeProposal() {
  const current = currentProposal || {};

  const alternatives = {
    "gym":  {
      type: "yoga",    target: "yoga-session",  quietMode: null,        duration: 30,
      proposal: "How about yoga or mobility instead. It supports your gym work and lets you move intentionally without the load.",
      rationale: "Different kind of effort. Same commitment."
    },
    "yoga": {
      type: "gym",     target: "gym-programme", quietMode: null,        duration: 45,
      proposal: "How about the gym programme instead. If the energy is there, it is worth using.",
      rationale: "Strength work at this stage compounds."
    },
    "quiet": {
      type: "walk",    target: "activity-log",  quietMode: null,        duration: 30,
      proposal: "How about a walk instead. Outside, at your own pace. Movement without structure.",
      rationale: "Fresh air and forward motion are underrated."
    },
    "run": {
      type: "gym",     target: "gym-programme", quietMode: null,        duration: 45,
      proposal: "How about the gym instead. Strength work alongside cardio gives you a broader base.",
      rationale: "Balance across movement types."
    },
    "walk": {
      type: "quiet",   target: "quiet-session", quietMode: "mindful",  duration: 15,
      proposal: "How about a short mindful session instead. Fifteen minutes of stillness.",
      rationale: "Rest is movement of a different kind."
    },
    "prescribed": {
      type: "gym",     target: "gym-programme", quietMode: null,        duration: 45,
      proposal: "How about the full gym session. Your prescribed work is already built into the warmup.",
      rationale: "More complete session, same prescribed work included."
    }
  };

  const alt = alternatives[current.type] || alternatives["quiet"];
  return { ...alt, reflection: current.reflection };
}

// ── Greeting ──────────────────────────────────────────────────────────────────

function getGreeting(name) {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning " + name;
  if (hour < 17) return "Hey " + name;
  return "Evening " + name;
}

// ── Navigation ────────────────────────────────────────────────────────────────

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
    type:       proposal.type,
    duration:   proposal.duration,
    acceptedAt: new Date().toISOString()
  });

  cleanup();
  router.navigate(proposal.target);
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (!currentProposal) currentProposal = buildProposal();
  const name = (store.get("name") || "").split(" ")[0] || "there";

  return `
    <div class="view coach-proposal-view">

      <div class="coach-proposal-header">
        <button class="btn btn-ghost btn-small proposal-back-btn"
                id="proposal-back-btn"
                aria-label="Back to check-in">
          &larr; Back
        </button>
        <button class="btn btn-ghost btn-small proposal-library-btn"
                id="proposal-library-btn"
                aria-label="Go to Library">
          Library &rarr;
        </button>
      </div>

      <div id="proposal-body">
        ${renderProposal(name)}
      </div>

    </div>
  `;
}

function renderProposal(name) {
  const p = currentProposal;
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png"
           alt=""
           class="coach-icon-small"
           aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-greeting">${getGreeting(name)}.</p>
        <p class="coach-proposal-reflection">${p.reflection}</p>
        <p class="coach-proposal-suggestion">${p.proposal}</p>
        <p class="coach-proposal-rationale text-sm text-muted"><em>${p.rationale}</em></p>
        <div class="coach-proposal-meta">
          <span class="coach-proposal-duration">&#8987; About ${p.duration} minutes</span>
        </div>
        <div class="coach-tts-row" aria-hidden="true">
          <button class="btn-icon coach-tts-btn" id="proposal-tts-btn"
                  aria-label="Listen to this proposal">
            &#128226;
          </button>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full"
              id="proposal-accept-btn"
              aria-label="Accept this proposal and start session">
        Let's go
      </button>
      <button class="btn btn-ghost btn-full"
              id="proposal-else-btn"
              style="margin-top: var(--space-3);">
        Unless you had something else in mind
      </button>
    </div>
  `;
}

function renderBranching() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png"
           alt=""
           class="coach-icon-small"
           aria-hidden="true">
      <div>
        <p>No problem. What would work better?</p>
      </div>
    </div>

    <div class="coach-branch-chips"
         role="group"
         aria-label="Choose an alternative">
      <button class="coach-branch-chip" data-branch="mind"      aria-pressed="false">I had something in mind</button>
      <button class="coach-branch-chip" data-branch="different" aria-pressed="false">Suggest something different</button>
      <button class="coach-branch-chip" data-branch="shorter"   aria-pressed="false">Something shorter</button>
      <button class="coach-branch-chip" data-branch="quieter"   aria-pressed="false">Something quieter</button>
    </div>

    <button class="btn btn-ghost btn-full"
            id="proposal-back-to-proposal-btn"
            style="margin-top: var(--space-4);">
      &larr; Back to the suggestion
    </button>
  `;
}

function renderRevised() {
  const p = revisedProposal || currentProposal;
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png"
           alt=""
           class="coach-icon-small"
           aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-suggestion">${p.proposal}</p>
        <p class="coach-proposal-rationale text-sm text-muted"><em>${p.rationale}</em></p>
        <div class="coach-proposal-meta">
          <span class="coach-proposal-duration">&#8987; About ${p.duration} minutes</span>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full"
              id="proposal-accept-revised-btn"
              aria-label="Accept this alternative proposal">
        Let's go
      </button>
      <button class="btn btn-ghost btn-full"
              id="proposal-else-btn"
              style="margin-top: var(--space-3);">
        Still not quite right
      </button>
    </div>

    <button class="btn btn-ghost btn-full"
            id="proposal-back-to-branching-btn"
            style="margin-top: var(--space-2);">
      &larr; Back
    </button>
  `;
}

function renderActivityPick() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png"
           alt=""
           class="coach-icon-small"
           aria-hidden="true">
      <div>
        <p>What did you have in mind?</p>
      </div>
    </div>

    <div class="coach-activity-pick-grid"
         role="group"
         aria-label="Choose an activity">
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

    <button class="btn btn-ghost btn-full"
            id="proposal-back-to-branching-btn"
            style="margin-top: var(--space-4);">
      &larr; Back
    </button>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {

  // Header navigation
  document.getElementById("proposal-back-btn")?.addEventListener("click", () => {
    cleanup();
    router.navigate("checkin");
  });

  document.getElementById("proposal-library-btn")?.addEventListener("click", () => {
    cleanup();
    store.set("settingsTab", "library");
    router.navigate("settings");
  });

  // TTS
  document.getElementById("proposal-tts-btn")?.addEventListener("click", () => {
    const p    = currentProposal;
    if (!p) return;
    const text = p.reflection + " " + p.proposal + " " + p.rationale;
    window.tts?.speak(text);
  });

  // Accept primary proposal
  document.getElementById("proposal-accept-btn")?.addEventListener("click", () => {
    navigateToProposal(currentProposal);
  });

  // Something else — record soft decline, show branching
  document.getElementById("proposal-else-btn")?.addEventListener("click", () => {
    const prefs    = store.get("activityPreferences") || {};
    const key      = (currentProposal?.type || "unknown") + "_declined";
    prefs[key]     = (prefs[key] || 0) + 1;
    store.set("activityPreferences", prefs);

    if (proposalState === "revised") {
      proposalState = "branching";
    } else {
      proposalState = "branching";
    }
    rerender();
  });

  // Branch chips
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

  // Back to proposal
  document.getElementById("proposal-back-to-proposal-btn")?.addEventListener("click", () => {
    proposalState = "proposal";
    rerender();
  });

  // Back to branching
  document.getElementById("proposal-back-to-branching-btn")?.addEventListener("click", () => {
    proposalState = "branching";
    rerender();
  });

  // Accept revised proposal
  document.getElementById("proposal-accept-revised-btn")?.addEventListener("click", () => {
    navigateToProposal(revisedProposal || currentProposal);
  });

  // Activity picker
  document.querySelectorAll(".coach-activity-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target    = btn.dataset.target;
      const quietMode = btn.dataset.quiet || null;
      if (quietMode)  store.set("quietMode", quietMode);
      store.set("coachProposalAccepted", {
        type:       btn.dataset.activity,
        label:      btn.querySelector("span:last-child")?.textContent || "",
        duration:   null,
        acceptedAt: new Date().toISOString()
      });
      cleanup();
      router.navigate(target);
    });
  });
}

// ── Cleanup and rerender ──────────────────────────────────────────────────────

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
  if (proposalState === "revised")       body.innerHTML = renderRevised();
  if (proposalState === "activity-pick") body.innerHTML = renderActivityPick();

  onMount();
}
