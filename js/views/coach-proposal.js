/**
 * coach-proposal.js - Coach Proposal Screen
 *
 * 13 May 2026 v1
 *
 * Fixes:
 *   - S1: renderRevised used p.label/p.description (undefined). Fixed to p.proposal/p.rationale.
 *   - S1: "Something else entirely" now uses location-first branching:
 *         Where are you? (Home/Gym/Outdoors/Pool) -> What do you fancy? -> revised proposal or navigate
 *   - S4: daysSinceLast now reads completedAt||sessionStart||date (not loggedAt which did not exist).
 *         This fixes the coach always thinking gym was recent.
 *   - Burnout thresholds updated: <24h recovery, 24-48h gentle-first, 48-72h normal, 72h+ full.
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

// ── Activity Type Labels ───────────────────────────────────────────────────────
// Authoritative label map — use everywhere activity types are displayed

const ACTIVITY_LABELS = {
  // Gym/strength
  'gym': 'gym session',
  'gym-programme': 'gym session',
  'coach-session': 'gym session',
  'strength': 'strength work',
  
  // Cardio
  'run': 'run',
  'walk': 'walk',
  'swim': 'swim',
  'cycle': 'cycle',
  'cardio': 'cardio session',
  'row': 'rowing session',
  'hiking': 'hike',
  
  // Classes
  'boxing': 'boxing session',
  'spin': 'spin class',
  'hiit': 'HIIT session',
  'body-balance': 'Body Balance class',
  'class': 'class',
  
  // Gentle/mindful
  'yoga': 'yoga session',
  'pilates': 'pilates session',
  'tai-chi': 'tai chi session',
  'stretching': 'stretching session',
  'mobility': 'mobility work',
  'mindful': 'mindful movement',
  
  // Recovery/quiet
  'breathing': 'mindfulness practice',
  'meditation': 'meditation',
  'journal': 'journaling',
  'quiet': 'quiet session',
  'rest': 'rest day',
  'recovery': 'recovery work',
  
  // User-logged
  'prescribed': 'prescribed exercises',
  'custom': 'movement'
};

// ── State ─────────────────────────────────────────────────────────────────────

let proposalState   = "proposal";  // "proposal" | "branching" | "location" | "home-options" | "gym-options" | "outdoor-options" | "revised" | "activity-pick"
let currentProposal = null;        // the active proposal object
let revisedProposal = null;        // the alternative proposal
let branchChoice    = null;        // "mind" | "different" | "shorter" | "quieter"

// ── Proposal engine ───────────────────────────────────────────────────────────

/**
 * Build a proposal object from all available store data.
 *
 * The coach speaks in four parts:
 *   1. Greeting     — time-aware, personal
 *   2. Reflection   — what you have done recently, drawn from activityLog (48h lookback, activity types)
 *   3. Constraint   — if applicable (pain, low energy), state it plainly
 *   4. Proposal     — "So I thought today..." — the actual suggestion
 *
 * Decision logic:
 *   1. Severe override (high pain ≥7) → disable "Let's go", explain why, offer adapted alternatives
 *   2. movementIdentity + activityPreferences weight the options
 *   3. Variety enforcement — avoid repeating yesterday's proposal type
 *   4. Energy-aware routing — low energy steers away from high-intensity
 *   5. Goal-aware routing — weight loss steers toward cardio variety
 *   6. Recent session analysis — avoid repeating same pattern 3+ days
 *   7. No unconditional defaults — gym is not assumed
 *
 * @param {boolean} preferShorter - build a shorter version of the same logic
 * @returns {{ greeting, reflection, constraint, proposal, rationale, duration, target, quietMode, severePainOverride, disabledOption }}
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
  const lastSessionDate = lastSession
    ? new Date(lastSession.completedAt || lastSession.sessionStart || lastSession.date || 0)
    : null;
  const daysSinceLast  = lastSessionDate
    ? Math.floor((Date.now() - lastSessionDate.getTime()) / 86400000)
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
  const settings = store.get("settings") || {};
  const reflectionSettings = settings.reflection || {};
  const lookbackHours = reflectionSettings.lookbackHours || 48;
  const coachPersonality = store.get("coachPersonality") || "steady";
  
  const reflection = buildReflection(activityLog, lookbackHours, coachPersonality);

  // ── Safety layer — severe pain override (must run before preference logic) ─
  // If pain is severe (≥7), disable the "Let's go" option and explain why.
  // This builds psychological safety while maintaining user agency.
  
  const severePainZones = conditions.filter(id => (painScores[id] || 0) >= 7);
  const hasSeverePain = severePainZones.length > 0;
  
  let constraintMessage = null;
  if (hasSeverePain) {
    const worstZoneId = severePainZones[0];
    const painLevel = painScores[worstZoneId] || 7;
    const conditionName = conditions.find(c => c.id || c === worstZoneId)?.name || "this area";
    
    const variants = {
      steady: `Your ${conditionName} is very sore today (pain ${painLevel}/10). High-intensity movement could cause serious injury, so I've adjusted your options to avoid that risk.`,
      energetic: `Your ${conditionName} is very sore today (pain ${painLevel}/10). No intense lower body work today. We need to protect that.`,
      nurturing: `Your ${conditionName} is very sore today. Moving hard could hurt you. I care about your healing more than your consistency.`,
      minimal: `${conditionName} very sore (${painLevel}/10). Can't do high intensity.`
    };
    constraintMessage = variants[coachPersonality] || variants.steady;
  } else if (moderatePain) {
    const modZoneId = conditions.find(id => (painScores[id] || 0) >= 4);
    const painLevel = painScores[modZoneId] || 5;
    const conditionName = conditions.find(c => c.id || c === modZoneId)?.name || "this area";
    
    const variants = {
      steady: `Your ${conditionName} is sore today (pain ${painLevel}/10). I can work around that.`,
      energetic: `Your ${conditionName} is sore today — pain ${painLevel}/10. We need to work around that.`,
      nurturing: `Your ${conditionName} is sore today. I want to help you move in a way that respects that.`,
      minimal: `${conditionName} sore (${painLevel}/10). Need to protect.`
    };
    constraintMessage = variants[coachPersonality] || variants.steady;
  }

  // ── Safety layer — Neurodivergent users may follow the coach as their primary guide ─
  // We have a responsibility to prevent overtraining.
  //
  // Rules:
  //   3+ consecutive training days → coach must suggest rest or quiet today
  //   2 consecutive heavy sessions (gym/run) → suggest lower intensity
  //   7 sessions in 7 days → flag recovery regardless of energy
  //
  // "Training day" = any COMPLETED activityLog entry that is NOT breathing/journal/rest/mindful.
  // Only status:"completed" entries count — "started" entries (from tapping then backing out) do not.
  //
  // Consecutive day logic: group completed training entries by calendar date,
  // then walk backwards from today checking for an unbroken daily chain.
  // A gap of even one day resets the count to zero.

  const isTraining = t => !["breathing", "journal", "rest", "mindful", "quiet"].includes(t);
  const isHeavy    = t => ["gym", "coach-session", "gym-programme", "run", "hiit", "boxing"].includes(t);

  // Filter to completed training entries only — within last 14 days for efficiency
  const cutoff14 = Date.now() - (14 * 86400000);
  const completedTraining = (activityLog || []).filter(e => {
    if (e.status === "started") return false;  // exclude started-only; entries with no status field are legacy completed sessions
    const ts = new Date(e.completedAt || e.sessionStart || e.date || 0).getTime();
    if (ts < cutoff14) return false;
    return isTraining(e.type || e.source || "");
  });

  // Group by calendar date (YYYY-MM-DD)
  const trainingDateSet = new Set(
    completedTraining.map(e =>
      new Date(e.completedAt || e.sessionStart || e.date || 0).toISOString().split("T")[0]
    )
  );

  // Walk backwards from today counting unbroken consecutive training days
  // Stop as soon as we hit a day with no training
  let consecutiveDays = 0;
  const todayStr = new Date().toISOString().split("T")[0];
  for (let d = 0; d <= 14; d++) {
    const checkDate = new Date(Date.now() - d * 86400000).toISOString().split("T")[0];
    if (trainingDateSet.has(checkDate)) {
      consecutiveDays++;
    } else if (d === 0) {
      // No training today yet — that's fine, keep checking yesterday etc.
      // Do not increment but do not break either
    } else {
      // Gap found — chain is broken
      break;
    }
  }

  // Last 2 completed heavy sessions (for heavy session override)
  const last2Heavy = completedTraining.filter(e => isHeavy(e.type || e.source || "")).slice(-2);
  const consecutiveHeavy = last2Heavy.length === 2;

  // Total completed training sessions in last 7 days
  const cutoff7 = Date.now() - (7 * 86400000);
  const totalThisWeek = completedTraining.filter(e => {
    const ts = new Date(e.completedAt || e.sessionStart || e.date || 0).getTime();
    return ts >= cutoff7;
  }).length;

  // Hard override: 3+ consecutive days must rest
  if (consecutiveDays >= 3) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "rest",
      duration: 15,
      reflection,
      constraint: null,
      proposal: "You have trained for " + consecutiveDays + " days in a row. Today needs to be a rest day. This is not optional — it is where adaptation actually happens. Your body builds back stronger during recovery, not during effort.",
      rationale: "Consecutive training days without rest increase injury risk and reduce performance gains. Recovery is part of the programme."
    });
  }

  // Soft flag: 2 consecutive heavy sessions → steer toward lower intensity
  const heavyOverride = consecutiveHeavy && energy < 8;

  // 7 sessions in 7 days — very high volume flag
  if (totalThisWeek >= 6) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "mindful",
      duration: 20,
      reflection,
      constraint: null,
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
/**
 * buildReflection(activityLog, lookbackHours, coachPersonality)
 *
 * 13 May 2026 v1 — Rewritten for natural language
 *
 * Design principles:
 *   1. Time references use human language, not day names when recent.
 *      "yesterday" not "since Tuesday". "earlier this week" not "since Monday".
 *   2. Activity labels are verb-led, not noun-led.
 *      "you trained" / "you went to the gym" not "gym session".
 *   3. Multiple activities are listed naturally.
 *      "you trained and went for a walk" not "gym session and walk since Tuesday".
 *   4. Validation is specific to what happened, not randomly inserted.
 *   5. Single activity = shorter sentence. Multiple = slightly richer.
 *   6. The sentence ends — it does not trail into the proposal.
 */
function buildReflection(activityLog, lookbackHours = 48, coachPersonality = "steady") {
  const cutoffTime = Date.now() - (lookbackHours * 3600000);

  // Only count completed sessions — not just started ones
  const relevantActivities = (activityLog || []).filter(a => {
    if (a.status && a.status !== "completed") return false;
    const ts = new Date(a.completedAt || a.sessionStart || a.date || 0).getTime();
    return ts >= cutoffTime;
  });

  // ── No recent activity ─────────────────────────────────────────────────────
  if (relevantActivities.length === 0) {
    const variants = {
      steady:    "You're here today, and that's what matters.",
      energetic: "You're here. Let's make it count.",
      nurturing: "You're here now. That's enough to start.",
      minimal:   "You're here today."
    };
    return variants[coachPersonality] || variants.steady;
  }

  // ── Build unique activity verb phrases ─────────────────────────────────────
  // Maps activity type → natural verb phrase ("went to the gym", "went for a run")
  const VERB_PHRASES = {
    "gym":             "trained at the gym",
    "gym-programme":   "trained at the gym",
    "coach-session":   "trained",
    "strength":        "did some strength work",
    "home-workout":    "worked out at home",
    "home-mixed":      "worked out at home",
    "home-core":       "did some core work",
    "home-hiit":       "did a HIIT session",
    "home-strength":   "did some strength work",
    "home-cardio":     "got some cardio in",
    "home-mobility":   "worked on your mobility",
    "run":             "went for a run",
    "walk":            "went for a walk",
    "swim":            "went for a swim",
    "cycle":           "went for a ride",
    "row":             "got a rowing session in",
    "hiking":          "went for a hike",
    "boxing":          "did some boxing",
    "spin":            "did a spin class",
    "hiit":            "did a HIIT session",
    "body-balance":    "did Body Balance",
    "class":           "went to a class",
    "yoga":            "did some yoga",
    "pilates":         "did some pilates",
    "yoga-session":    "did some yoga",
    "tai-chi":         "did some tai chi",
    "stretching":      "did some stretching",
    "mobility":        "worked on your mobility",
    "mindful":         "had a mindful movement session",
    "mindfulness":     "had a mindful moment",
    "breathing":       "did some breathing practice",
    "meditation":      "meditated",
    "journal":         "spent time journaling",
    "quiet":           "had some quiet time",
    "rest":            "took a rest day",
    "recovery":        "did some recovery work",
    "prescribed":      "did your prescribed exercises",
    "prescribed-session": "did your prescribed exercises",
    "core":            "did some core work",
    "core-session":    "did some core work",
    "walk-session":    "went for a walk",
  };

  const phraseSet = new Set();
  relevantActivities.forEach(a => {
    const type = a.type || a.source || "movement";
    const phrase = VERB_PHRASES[type] || "moved";
    phraseSet.add(phrase);
  });

  const phrases = Array.from(phraseSet);

  // ── Build time reference — human, not robotic ──────────────────────────────
  // Rules:
  //   activities from today only → "earlier today" or "today"
  //   all within 36 hours but not all today → "yesterday"
  //   within 48-72 hours, mixed → "in the last couple of days"
  //   older → "earlier this week" / "over the past week"

  const now       = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - 86400000;

  const allToday     = relevantActivities.every(a => {
    const ts = new Date(a.completedAt || a.sessionStart || a.date || 0).getTime();
    return ts >= todayStart;
  });
  const anyYesterday = relevantActivities.some(a => {
    const ts = new Date(a.completedAt || a.sessionStart || a.date || 0).getTime();
    return ts >= yesterdayStart && ts < todayStart;
  });
  const oldestTs = Math.min(...relevantActivities.map(a =>
    new Date(a.completedAt || a.sessionStart || a.date || 0).getTime()
  ));
  const oldestDaysAgo = (now - oldestTs) / 86400000;

  let timeRef;
  if (allToday)                             timeRef = "earlier today";
  else if (anyYesterday && oldestDaysAgo < 2) timeRef = "yesterday";
  else if (oldestDaysAgo < 3)               timeRef = "in the last couple of days";
  else if (oldestDaysAgo < 7)               timeRef = "earlier this week";
  else                                       timeRef = "over the past week";

  // ── Compose the sentence ───────────────────────────────────────────────────
  // Pattern: "You [verb phrase] [timeRef]." — then an optional second sentence.

  let activityPart;
  if (phrases.length === 1) {
    activityPart = phrases[0];
  } else if (phrases.length === 2) {
    activityPart = `${phrases[0]} and ${phrases[1]}`;
  } else {
    const allButLast = phrases.slice(0, -1).join(", ");
    activityPart     = `${allButLast}, and ${phrases[phrases.length - 1]}`;
  }

  // Lead sentence
  let sentence = `You ${activityPart} ${timeRef}.`;

  // ── Second sentence — specific, not formulaic ──────────────────────────────
  // Only added when it adds meaning. Varies by what was done and personality.
  // Rules:
  //   Rest day detected → acknowledge it specifically
  //   3+ days consecutive activity → acknowledge the run
  //   Recovery / gentle work → acknowledge that too
  //   Otherwise → add personality-appropriate follow-on sparingly

  const hasRest     = phrases.some(p => p.includes("rest day"));
  const hasRecovery = phrases.some(p => p.includes("recovery") || p.includes("mobility"));
  const hasTraining = phrases.some(p =>
    p.includes("gym") || p.includes("trained") || p.includes("HIIT") || p.includes("strength")
  );

  // Check consecutive days
  const daysWithActivity = new Set(
    relevantActivities.map(a =>
      new Date(a.completedAt || a.sessionStart || a.date || 0).toISOString().split("T")[0]
    )
  );
  const consecutiveDays = daysWithActivity.size;

  if (hasRest && phrases.length === 1) {
    // Rest day is the only thing — validate that specifically
    const restVariants = {
      steady:    "Rest is part of the programme, not a break from it.",
      energetic: "Smart move. Recovery is where gains are made.",
      nurturing: "Your body needed that.",
      minimal:   ""
    };
    const v = restVariants[coachPersonality];
    if (v) sentence += " " + v;

  } else if (consecutiveDays >= 3 && hasTraining) {
    // Three or more training days — acknowledge the consistency
    const streakVariants = {
      steady:    "You have trained for ${consecutiveDays} days running. Today's session will build on that.",
      energetic: "${consecutiveDays} days in a row. Keep that going.",
      nurturing: "${consecutiveDays} days of showing up. That is a practice.",
      minimal:   ""
    };
    const v = (streakVariants[coachPersonality] || "").replace("${consecutiveDays}", consecutiveDays);
    if (v) sentence += " " + v;

  } else if (hasRecovery && hasTraining) {
    // Mixed training and recovery — smart programming
    const recoveryVariants = {
      steady:    "Good balance of effort and recovery.",
      energetic: "Hard work and smart recovery. That is how it is done.",
      nurturing: "You have been taking care of yourself as well as working hard.",
      minimal:   ""
    };
    const v = recoveryVariants[coachPersonality];
    if (v) sentence += " " + v;

  } else if (phrases.length >= 2 && coachPersonality !== "minimal") {
    // Multiple different activities — acknowledge variety naturally
    const varietyVariants = {
      steady:    "Good variety.",
      energetic: "Mixing it up. That is how you build well-rounded fitness.",
      nurturing: "You have been exploring different kinds of movement.",
      minimal:   ""
    };
    const v = varietyVariants[coachPersonality];
    if (v) sentence += " " + v;
  }

  return sentence;
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

function makeProposal({ type, target, quietMode, duration, reflection, constraint, proposal, rationale, severePainOverride = false, disabledOption = null }) {
  return { type, target, quietMode, duration, reflection, constraint, proposal, rationale, severePainOverride, disabledOption };
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
        ${proposalState === "proposal"      ? renderProposal(name)    : ""}
        ${proposalState === "branching"     ? renderBranching()       : ""}
        ${proposalState === "location"      ? renderLocationPicker()  : ""}
        ${proposalState === "home-options"  ? renderHomeOptions()     : ""}
        ${proposalState === "gym-options"   ? renderGymOptions()      : ""}
        ${proposalState === "outdoor-options" ? renderOutdoorOptions() : ""}
        ${proposalState === "revised"       ? renderRevised(name)     : ""}
        ${proposalState === "activity-pick" ? renderActivityPick()    : ""}
      </div>

    </div>
  `;
}

function renderProposal(name) {
  const p = currentProposal;
  const helperText = p.severePainOverride 
    ? "Not available today — protecting your " + (p.affectedZone || "affected area")
    : null;
  
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
          <span class="coach-proposal-duration">⏱ About ${p.duration} minutes</span>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full" 
              id="proposal-accept-btn"
              ${p.severePainOverride ? 'disabled' : ''}
              aria-label="Let's go with your ${p.proposal ? p.proposal.split(' ')[0].toLowerCase() : 'plan'}">
        Let's go with your plan
      </button>
      ${p.severePainOverride && helperText ? `
        <p class="text-xs text-error" style="margin-top: var(--space-2); text-align: center;">
          ${helperText}
        </p>
      ` : ''}
      
      <button class="btn btn-primary btn-large btn-full" 
              id="proposal-adjust-btn"
              style="margin-top: var(--space-3);"
              aria-label="Adjust for today's conditions">
        Adjust for today
      </button>
      
      <button class="btn btn-ghost btn-full" 
              id="proposal-else-btn"
              style="margin-top: var(--space-3);"
              aria-label="Something else entirely">
        Something else entirely
      </button>
    </div>
  `;
}

// ── Location-first "Something else entirely" flow ─────────────────────────────

let selectedLocation = null;

const LOCATIONS = [
  { id: "home",     label: "At home",       icon: "\uD83C\uDFE0" },
  { id: "gym",      label: "At the gym",    icon: "\uD83C\uDFCB" },
  { id: "outdoors", label: "Outdoors",      icon: "\uD83C\uDF33" },
  { id: "pool",     label: "Swimming pool", icon: "\uD83C\uDFCA" },
];

const HOME_OPTIONS = [
  { id: "home-mixed",    label: "Mixed workout", icon: "\u2728",        description: "Coach builds a range of things" },
  { id: "home-core",     label: "Core",          icon: "\uD83E\uDDD8",  description: "Choose intensity below" },
  { id: "home-hiit",     label: "HIIT",          icon: "\u26A1",        description: "Choose intensity below" },
  { id: "home-strength", label: "Strength",      icon: "\uD83D\uDCAA",  description: "Bodyweight or home equipment" },
  { id: "home-cardio",   label: "Cardio",        icon: "\uD83C\uDFC3",  description: "Raise the heart rate" },
  { id: "home-mobility", label: "Mobility",      icon: "\uD83C\uDF3F",  description: "Open and unlock the body" },
];

const GYM_OPTIONS = [
  { id: "gym-programme", label: "My programme",   icon: "\uD83C\uDFCB", target: "gym-programme"  },
  { id: "gym-core",      label: "Core",           icon: "\uD83E\uDDD8", target: "core-session"   },
  { id: "gym-cardio",    label: "Cardio",         icon: "\uD83C\uDFC3", target: "activity-log"   },
  { id: "gym-upper",     label: "Upper body",     icon: "\uD83D\uDCAA", target: "gym-programme"  },
  { id: "gym-lower",     label: "Lower body",     icon: "\uD83E\uDDB5", target: "gym-programme"  },
  { id: "gym-strength",  label: "Strength",       icon: "\uD83D\uDD25", target: "gym-programme"  },
];

const OUTDOOR_OPTIONS = [
  { id: "run",     label: "Run",   icon: "\uD83C\uDFC3", target: "activity-log"  },
  { id: "walk",    label: "Walk",  icon: "\uD83D\uDEB6", target: "walk-session"  },
  { id: "cycle",   label: "Cycle", icon: "\uD83D\uDEB4", target: "activity-log"  },
  { id: "hiking",  label: "Hike",  icon: "\uD83E\uDD7E", target: "activity-log"  },
];

function renderBranching() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div>
        <p>No problem. What would work better?</p>
      </div>
    </div>

    <div class="coach-branch-chips" role="group" aria-label="What would you prefer?">
      <button class="coach-branch-chip" data-branch="location" aria-pressed="false">
        I want something different
      </button>
      <button class="coach-branch-chip" data-branch="shorter" aria-pressed="false">
        Something shorter
      </button>
      <button class="coach-branch-chip" data-branch="quieter" aria-pressed="false">
        Something quieter
      </button>
      <button class="coach-branch-chip" data-branch="mind" aria-pressed="false">
        I had something specific in mind
      </button>
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-proposal-btn"
            style="margin-top: var(--space-4);">
      \u2190 Back to the suggestion
    </button>
  `;
}

function renderLocationPicker() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div><p>Where are you right now?</p></div>
    </div>

    <div class="coach-location-grid" role="group" aria-label="Choose your location">
      ${LOCATIONS.map(loc => `
        <button class="coach-location-btn" data-location="${loc.id}"
                aria-label="${loc.label}">
          <span aria-hidden="true">${loc.icon}</span>
          <span>${loc.label}</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-branching-btn"
            style="margin-top: var(--space-4);">
      \u2190 Back
    </button>
  `;
}

function renderHomeOptions() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div><p>What do you fancy at home?</p></div>
    </div>

    <div class="coach-location-grid" role="group" aria-label="Home workout type">
      ${HOME_OPTIONS.map(opt => `
        <button class="coach-location-btn" data-home-option="${opt.id}"
                aria-label="${opt.label}: ${opt.description}">
          <span aria-hidden="true">${opt.icon}</span>
          <span>${opt.label}</span>
          <span class="coach-location-btn-sub">${opt.description}</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-location-btn"
            style="margin-top: var(--space-4);">
      \u2190 Back
    </button>
  `;
}

function renderGymOptions() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div><p>What are you going to do at the gym?</p></div>
    </div>

    <div class="coach-location-grid" role="group" aria-label="Gym session type">
      ${GYM_OPTIONS.map(opt => `
        <button class="coach-location-btn" data-gym-option="${opt.id}"
                data-target="${opt.target}"
                aria-label="${opt.label}">
          <span aria-hidden="true">${opt.icon}</span>
          <span>${opt.label}</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-location-btn"
            style="margin-top: var(--space-4);">
      \u2190 Back
    </button>
  `;
}

function renderOutdoorOptions() {
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div><p>What do you fancy outdoors?</p></div>
    </div>

    <div class="coach-location-grid" role="group" aria-label="Outdoor activity type">
      ${OUTDOOR_OPTIONS.map(opt => `
        <button class="coach-location-btn" data-target="${opt.target}"
                data-activity="${opt.id}"
                aria-label="${opt.label}">
          <span aria-hidden="true">${opt.icon}</span>
          <span>${opt.label}</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-location-btn"
            style="margin-top: var(--space-4);">
      \u2190 Back
    </button>
  `;
}

function buildHomeProposal(optionId) {
  const energy    = latestCheckin().energy || 5;
  const homeEquip = store.get("homeEquipment") || store.get("equipment") || [];
  const hasWeights = homeEquip.some(e => e.startsWith("dumbbells") || e.startsWith("kettlebell") || e === "barbell");

  const proposals = {
    "home-mixed":    { type: "home-workout", target: "core-session",  duration: 30,
                       proposal: "A mixed home workout \u2014 mobility to open up, a cardio burst, then core to finish. All bodyweight" + (hasWeights ? ", with your home weights available if you want to add load." : "."),
                       rationale: "A varied session keeps things interesting and hits different systems." },
    "home-core":     { type: "core",         target: "core-session",  duration: 20,
                       proposal: "A focused core session. Stability first, then strength, finishing with some breath work.",
                       rationale: "Core work is always available, needs no equipment, and pays off in everything else you do." },
    "home-hiit":     { type: "hiit",         target: "core-session",  duration: energy >= 6 ? 25 : 15,
                       proposal: energy >= 6 ? "A 25-minute HIIT circuit. Work intervals, short rest, high effort. All bodyweight." : "A lighter 15-minute HIIT session \u2014 shorter intervals, more rest. Right for your energy level today.",
                       rationale: energy >= 6 ? "Good energy today \u2014 use it." : "Adapted for your energy level." },
    "home-strength": { type: "strength",     target: "core-session",  duration: 30,
                       proposal: hasWeights ? "A strength session using your home weights. Push, pull, hinge, squat." : "A bodyweight strength session. Harder than it looks when done properly.",
                       rationale: hasWeights ? "You have equipment \u2014 let us use it." : "Bodyweight strength builds genuine functional capacity." },
    "home-cardio":   { type: "cardio",       target: "walk-session",  duration: 20,
                       proposal: "A cardio session at home or around the block. Whatever keeps the heart rate up.",
                       rationale: "Cardiovascular work does not need a gym." },
    "home-mobility": { type: "mobility",     target: "core-session",  duration: 20,
                       proposal: "A mobility session \u2014 hip openers, thoracic rotation, shoulder work. Moving the parts that usually get ignored.",
                       rationale: "Mobility is training. It is not a warmup." }
  };

  const chosen = proposals[optionId] || proposals["home-mixed"];
  return { ...chosen, quietMode: null, reflection: currentProposal?.reflection || "",
           constraint: null, severePainOverride: false, disabledOption: null };
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
          <span aria-hidden="true">${act.icon}</span>
          <span>${act.label}</span>
        </button>
      `).join("")}
    </div>

    <button class="btn btn-ghost btn-full" id="proposal-back-to-branching-btn"
            style="margin-top: var(--space-4);">
      \u2190 Back
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

  // ── Adjust for today ──────────────────────────────────────────────────────
  document.getElementById("proposal-adjust-btn")?.addEventListener("click", () => {
    // For now, load the same proposal but mark that it's adjusted
    // In the future, this will rebuild the proposal constrained by pain/energy
    store.set("proposalAdjusted", true);
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

      if (branchChoice === "location") {
        proposalState = "location";
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

  document.getElementById("proposal-back-to-location-btn")?.addEventListener("click", () => {
    proposalState = "location";
    rerender();
  });

  // ── Location picker ───────────────────────────────────────────────────────
  document.querySelectorAll(".coach-location-btn[data-location]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedLocation = btn.dataset.location;
      if (selectedLocation === "home")     { proposalState = "home-options";    rerender(); return; }
      if (selectedLocation === "gym")      { proposalState = "gym-options";     rerender(); return; }
      if (selectedLocation === "outdoors") { proposalState = "outdoor-options"; rerender(); return; }
      if (selectedLocation === "pool") {
        // Pool — go straight to activity log for swim
        store.set("coachProposalAccepted", { type: "swim", duration: 30, acceptedAt: new Date().toISOString() });
        cleanup();
        router.navigate("activity-log");
      }
    });
  });

  // ── Home options ──────────────────────────────────────────────────────────
  document.querySelectorAll(".coach-location-btn[data-home-option]").forEach(btn => {
    btn.addEventListener("click", () => {
      const optionId  = btn.dataset.homeOption;
      revisedProposal = buildHomeProposal(optionId);
      proposalState   = "revised";
      rerender();
    });
  });

  // ── Gym options ───────────────────────────────────────────────────────────
  document.querySelectorAll(".coach-location-btn[data-gym-option]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      store.set("coachProposalAccepted", { type: btn.dataset.gymOption, duration: 45, acceptedAt: new Date().toISOString() });
      cleanup();
      router.navigate(target);
    });
  });

  // ── Outdoor options ───────────────────────────────────────────────────────
  document.querySelectorAll(".coach-location-btn[data-activity]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target   = btn.dataset.target;
      const activity = btn.dataset.activity;
      store.set("coachProposalAccepted", { type: activity, duration: 30, acceptedAt: new Date().toISOString() });
      cleanup();
      router.navigate(target);
    });
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
  proposalState    = "proposal";
  currentProposal  = null;
  revisedProposal  = null;
  branchChoice     = null;
  selectedLocation = null;
}

function rerender() {
  const body = document.getElementById("proposal-body");
  if (!body) return;
  const name = (store.get("name") || "").split(" ")[0] || "there";
  if (proposalState === "proposal")        body.innerHTML = renderProposal(name);
  if (proposalState === "branching")       body.innerHTML = renderBranching();
  if (proposalState === "location")        body.innerHTML = renderLocationPicker();
  if (proposalState === "home-options")    body.innerHTML = renderHomeOptions();
  if (proposalState === "gym-options")     body.innerHTML = renderGymOptions();
  if (proposalState === "outdoor-options") body.innerHTML = renderOutdoorOptions();
  if (proposalState === "revised")         body.innerHTML = renderRevised(name);
  if (proposalState === "activity-pick")   body.innerHTML = renderActivityPick();
  onMount();
}
