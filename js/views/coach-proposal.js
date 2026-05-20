/**
 * coach-proposal.js - Coach Proposal Screen
 *
 * 20 May 2026 v1
 *
 * Fixes (20 May 2026):
 *   - recentLog now filters by the last 7 CALENDAR DAYS rather than the last
 *     7 log entries. gymCount/cardioCount/quietCount now reflect genuine recent
 *     activity rather than reading old sessions as if they were recent.
 *   - Yoga scoring: gymCount bonus (+3) now suppressed when daysSinceLast >= 5.
 *     After a 5+ day absence the coach should welcome you back to movement,
 *     not suggest recovery from sessions you did last week.
 *   - Gym/run options: +1 return-to-movement bonus when daysSinceLast >= 5.
 *   - Yoga rationale: now reflects the actual reason for the recommendation
 *     (recent gym volume, low energy, or user preference) not a fixed string.
 *   - renderRevised: fixed p.label / p.description (both undefined on proposal
 *     objects)  replaced with p.proposal which is the correct field.
 *
 * 14 May 2026 v1  routing fixes:
 *   yoga proposal target: quiet-session/mindful -> yoga-session
 *   run proposal target: activity-log -> running-session
 *   walk proposal target: activity-log -> walk-session
 *   yoga alternative target: gym-programme -> yoga-session
 *   run alternative target: activity-log -> walk-session (gentler alternative)
 *   Removed "and that's what matters" from no-activity reflection line
 *
 * 13 May 2026 v1:
 *   - S1: renderRevised used p.label/p.description (undefined). Fixed to p.proposal/p.rationale.
 *   - S1: "Something else entirely" now uses location-first branching.
 *   - S4: daysSinceLast now reads completedAt||sessionStart||date.
 *   - Burnout thresholds updated.
 *
 * v1.0 (S4-1, April 2026)
 */

import { store } from "../store.js";

export const centered = false;

//  Activity Type Labels 

const ACTIVITY_LABELS = {
  'gym': 'gym session',
  'gym-programme': 'gym session',
  'coach-session': 'gym session',
  'strength': 'strength work',
  'run': 'run',
  'walk': 'walk',
  'swim': 'swim',
  'cycle': 'cycle',
  'cardio': 'cardio session',
  'row': 'rowing session',
  'hiking': 'hike',
  'boxing': 'boxing session',
  'spin': 'spin class',
  'hiit': 'HIIT session',
  'body-balance': 'Body Balance class',
  'class': 'class',
  'yoga': 'yoga session',
  'pilates': 'pilates session',
  'tai-chi': 'tai chi session',
  'stretching': 'stretching session',
  'mobility': 'mobility work',
  'mindful': 'mindful movement',
  'breathing': 'mindfulness practice',
  'meditation': 'meditation',
  'journal': 'journaling',
  'quiet': 'quiet session',
  'rest': 'rest day',
  'recovery': 'recovery work',
  'prescribed': 'prescribed exercises',
  'custom': 'movement'
};

//  State 

let proposalState   = "proposal";
let currentProposal = null;
let revisedProposal = null;
let branchChoice    = null;

//  Proposal engine 

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

  const TIME_MAP  = { micro: 15, quick: 20, short: 30, standard: 40, long: 50, open: 60 };
  let timeBudget  = availableTime ? (TIME_MAP[availableTime] || 40) : 40;
  if (preferShorter) timeBudget = Math.max(15, Math.round(timeBudget * 0.6));

  //  Recent activity  filter by last 7 CALENDAR DAYS, not last 7 entries 
  // This ensures gymCount / cardioCount / quietCount reflect genuine recent
  // activity. If the user was away for a week, these counts will be 0 or low,
  // which is the honest picture the coach should be working from.
  const sevenDaysCutoff = Date.now() - (7 * 86400000);
  const recentLog = activityLog.filter(e => {
    const ts = new Date(e.completedAt || e.sessionStart || e.date || 0).getTime();
    return ts >= sevenDaysCutoff;
  });

  const lastSession     = activityLog[activityLog.length - 1] || null;
  const lastSessionDate = lastSession
    ? new Date(lastSession.completedAt || lastSession.sessionStart || lastSession.date || 0)
    : null;
  const daysSinceLast   = lastSessionDate
    ? Math.floor((Date.now() - lastSessionDate.getTime()) / 86400000)
    : 99;

  const recentTypes  = recentLog.map(e => e.type || e.source || "");
  const gymCount     = recentTypes.filter(t => ["gym", "coach-session", "gym-programme"].includes(t)).length;
  const cardioCount  = recentTypes.filter(t => ["run", "cycle", "swim", "cardio", "row"].includes(t)).length;
  const quietCount   = recentTypes.filter(t => ["breathing", "journal", "mindful", "rest"].includes(t)).length;

  const highPain      = conditions.some(id => (painScores[id] || 0) >= 7);
  const moderatePain  = conditions.some(id => (painScores[id] || 0) >= 4);
  const hasPrescribed = prescribed.length > 0;
  const hasGymProg    = !!gymProgramme;

  const todayKey   = new Date().toISOString().split("T")[0];
  const isRepeatDay = lastDate === todayKey;

  // Is the user returning after an absence of 5+ days?
  // When true: suppress recovery/contrast recommendations,
  // add a gentle return-to-movement bias to active options.
  const isReturningAfterAbsence = daysSinceLast >= 5;

  function prefScore(type) {
    const base = prefs[type] || 0;
    const identityBonus = identity === type ? 3 : 0;
    return base + identityBonus;
  }

  const settings           = store.get("settings") || {};
  const reflectionSettings = settings.reflection || {};
  const lookbackHours      = reflectionSettings.lookbackHours || 48;
  const coachPersonality   = store.get("coachPersonality") || "steady";
  const reflection         = buildReflection(activityLog, lookbackHours, coachPersonality);

  //  Severe pain constraint message 
  const severePainZones = conditions.filter(id => (painScores[id] || 0) >= 7);
  const hasSeverePain   = severePainZones.length > 0;

  let constraintMessage = null;
  if (hasSeverePain) {
    const worstZoneId   = severePainZones[0];
    const painLevel     = painScores[worstZoneId] || 7;
    const conditionName = conditions.find(c => c.id || c === worstZoneId)?.name || "this area";
    const variants = {
      steady:    `Your ${conditionName} is very sore today (pain ${painLevel}/10). High-intensity movement could cause serious injury, so I've adjusted your options to avoid that risk.`,
      energetic: `Your ${conditionName} is very sore today (pain ${painLevel}/10). No intense lower body work today. We need to protect that.`,
      nurturing: `Your ${conditionName} is very sore today. Moving hard could hurt you. I care about your healing more than your consistency.`,
      minimal:   `${conditionName} very sore (${painLevel}/10). Can't do high intensity.`
    };
    constraintMessage = variants[coachPersonality] || variants.steady;
  } else if (moderatePain) {
    const modZoneId     = conditions.find(id => (painScores[id] || 0) >= 4);
    const painLevel     = painScores[modZoneId] || 5;
    const conditionName = conditions.find(c => c.id || c === modZoneId)?.name || "this area";
    const variants = {
      steady:    `Your ${conditionName} is sore today (pain ${painLevel}/10). I can work around that.`,
      energetic: `Your ${conditionName} is sore today -- pain ${painLevel}/10. We need to work around that.`,
      nurturing: `Your ${conditionName} is sore today. I want to help you move in a way that respects that.`,
      minimal:   `${conditionName} sore (${painLevel}/10). Need to protect.`
    };
    constraintMessage = variants[coachPersonality] || variants.steady;
  }

  //  Overtraining protection 
  const isTraining = t => !["breathing", "journal", "rest", "mindful", "quiet"].includes(t);
  const isHeavy    = t => ["gym", "coach-session", "gym-programme", "run", "hiit", "boxing"].includes(t);

  const cutoff14 = Date.now() - (14 * 86400000);
  const completedTraining = (activityLog || []).filter(e => {
    if (e.status === "started") return false;
    const ts = new Date(e.completedAt || e.sessionStart || e.date || 0).getTime();
    if (ts < cutoff14) return false;
    return isTraining(e.type || e.source || "");
  });

  const trainingDateSet = new Set(
    completedTraining.map(e =>
      new Date(e.completedAt || e.sessionStart || e.date || 0).toISOString().split("T")[0]
    )
  );

  let consecutiveDays = 0;
  for (let d = 0; d <= 14; d++) {
    const checkDate = new Date(Date.now() - d * 86400000).toISOString().split("T")[0];
    if (trainingDateSet.has(checkDate)) {
      consecutiveDays++;
    } else if (d === 0) {
      // No training today yet  keep checking
    } else {
      break;
    }
  }

  const last2Heavy       = completedTraining.filter(e => isHeavy(e.type || e.source || "")).slice(-2);
  const consecutiveHeavy = last2Heavy.length === 2;

  const cutoff7 = Date.now() - (7 * 86400000);
  const totalThisWeek = completedTraining.filter(e => {
    const ts = new Date(e.completedAt || e.sessionStart || e.date || 0).getTime();
    return ts >= cutoff7;
  }).length;

  if (consecutiveDays >= 3) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "rest",
      duration: 15, reflection, constraint: null,
      proposal: "You have trained for " + consecutiveDays + " days in a row. Today needs to be a rest day. This is not optional -- it is where adaptation actually happens. Your body builds back stronger during recovery, not during effort.",
      rationale: "Consecutive training days without rest increase injury risk and reduce performance gains. Recovery is part of the programme."
    });
  }

  const heavyOverride = consecutiveHeavy && energy < 8;

  if (totalThisWeek >= 6) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "mindful",
      duration: 20, reflection, constraint: null,
      proposal: "You have been very active this week -- six or more sessions in seven days. Today I want to suggest something restorative rather than another training session. Your body needs this.",
      rationale: "High weekly volume without adequate recovery limits progress and increases overuse risk."
    });
  }

  //  Hard overrides 
  if (highPain || energy <= 2) {
    return makeProposal({
      type: "quiet", target: "quiet-session", quietMode: "breathing",
      duration: Math.min(timeBudget, 15), reflection,
      proposal: "I think today calls for something gentle. A short breathing practice or a few minutes of stillness.",
      rationale: energy <= 2
        ? "Your energy is very low. Rest and breath work are the right response."
        : "Your pain levels are elevated. Gentle is the most supportive thing I can offer today."
    });
  }

  // Prescribed exercises
  const prescribedAccepts = prefs["prescribed"] || 0;
  const prescribedRefused = prefs["prescribed_declined"] || 0;
  const prescribedRatio   = prescribedAccepts / Math.max(1, prescribedAccepts + prescribedRefused);
  if (hasPrescribed && energy >= 4 && !moderatePain && prescribedRatio >= 0.3 && !isRepeatDay) {
    return makeProposal({
      type: "prescribed", target: "prescribed", quietMode: null,
      duration: Math.min(timeBudget, 30), reflection,
      proposal: "I thought we could work through your prescribed exercises today. Your physio gave you these for a reason, and consistency is what makes them work.",
      rationale: prescribed.length + " prescribed exercise" + (prescribed.length > 1 ? "s" : "") + " outstanding. Your energy is good enough to do them properly."
    });
  }

  // Very low energy
  if (energy <= 3) {
    const quietPref = prefScore("quiet");
    if (mood <= 3 || sleep <= 5 || quietPref > prefScore("gym")) {
      return makeProposal({
        type: "quiet", target: "quiet-session", quietMode: "mindful",
        duration: Math.min(timeBudget, 20), reflection,
        proposal: "I was thinking something quieter today. A gentle mindful practice, or some breathing work. Something that meets you where you are.",
        rationale: sleep <= 5 ? "Disrupted sleep." : "Lower energy and mood. This is a recovery moment, not a training moment."
      });
    }
  }

  //  Build yoga rationale honestly 
  // The rationale must match the actual reason yoga is being scored highly.
  // It must never claim "recent demanding sessions" when the user has been away.
  function yogaRationale() {
    if (isReturningAfterAbsence) {
      return "You've been away for a few days. Yoga is a good way to ease back in -- it moves the whole body without demanding too much.";
    }
    if (gymCount >= 3) {
      return "You've had several demanding sessions recently. A yoga session gives your body contrast -- movement that restores rather than builds load.";
    }
    if (energy <= 5) {
      return "Your energy is a little lower today. Yoga works well here -- intentional movement without high demand.";
    }
    return "Mobility work complements your other training and tends to be the thing that gets skipped. Today is a good day for it.";
  }

  //  Score all options 
  const options = [
    {
      type: "gym", available: hasGymProg,
      score: prefScore("gym")
        + (gymCount < 3 ? 2 : 0)
        + (energy >= 6 ? 1 : 0)
        + (isReturningAfterAbsence ? 1 : 0)
        - (heavyOverride ? 3 : 0),
      proposal: "I thought we'd continue your gym programme today. Session " + gymSession + " of Week " + gymWeek + ". Your cardio warmup, the main session, and your prescribed work built in.",
      rationale: isReturningAfterAbsence
        ? "You've been away for a few days. Getting back to your programme is the best way to rebuild momentum."
        : (energy >= 7 ? "Your energy is good. Make the most of it." : "Steady progress on the programme is what builds the result."),
      duration: Math.min(timeBudget, 45), target: "gym-programme", quietMode: null
    },
    {
      type: "yoga", available: true,
      // Suppress gymCount bonus when user has been away 5+ days 
      // old gym sessions should not make yoga look like the recovery option
      score: prefScore("yoga")
        + (gymCount >= 3 && !isReturningAfterAbsence ? 3 : 0)
        + (energy <= 5 ? 1 : 0),
      proposal: "I thought a yoga or mobility session would serve you well today. Something that supports recovery while still moving your body intentionally.",
      rationale: yogaRationale(),
      duration: Math.min(timeBudget, 35), target: "yoga-session", quietMode: null
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
      score: prefScore("run")
        + (cardioCount < 1 ? 2 : 0)
        + (isReturningAfterAbsence ? 1 : 0),
      proposal: "I thought a run today. Even a short one. Cardiovascular work at this stage of your goals makes a real difference.",
      rationale: isReturningAfterAbsence
        ? "You've been away for a few days. A run is a good way back -- it resets your rhythm and doesn't need any setup."
        : "No cardio recently. Your goal includes body composition change.",
      duration: Math.min(timeBudget, 35), target: "running-session", quietMode: null
    },
    {
      type: "walk", available: true,
      score: prefScore("walk")
        + (energy <= 4 ? 1 : 0)
        + (daysSinceLast >= 3 ? 1 : 0)
        + (isReturningAfterAbsence ? 1 : 0),
      proposal: "I thought a walk today. Not nothing, but not a demand either. Movement that generates the energy it costs.",
      rationale: isReturningAfterAbsence
        ? "You've been away for a bit. A walk is a gentle way back -- no pressure, just movement."
        : (energy <= 4 ? "Lower energy responds well to gentle sustained movement." : "A good complement to your recent sessions."),
      duration: Math.min(timeBudget, 40), target: "walk-session", quietMode: null
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

  return makeProposal({
    type: chosen.type, target: chosen.target, quietMode: chosen.quietMode,
    duration: chosen.duration, reflection,
    proposal: chosen.proposal, rationale: chosen.rationale
  });
}

/**
 * buildReflection  natural language summary of recent activity
 * 13 May 2026 v1
 */
function buildReflection(activityLog, lookbackHours = 48, coachPersonality = "steady") {
  const cutoffTime = Date.now() - (lookbackHours * 3600000);

  const relevantActivities = (activityLog || []).filter(a => {
    if (a.status && a.status !== "completed") return false;
    const ts = new Date(a.completedAt || a.sessionStart || a.date || 0).getTime();
    return ts >= cutoffTime;
  });

  if (relevantActivities.length === 0) {
    const variants = {
      steady:    "You're here today.",
      energetic: "You're here. Let's make it count.",
      nurturing: "You're here now. That's enough to start.",
      minimal:   "You're here today."
    };
    return variants[coachPersonality] || variants.steady;
  }

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
    const type   = a.type || a.source || "movement";
    const phrase = VERB_PHRASES[type] || "moved";
    phraseSet.add(phrase);
  });

  const phrases = Array.from(phraseSet);

  const now            = Date.now();
  const todayStart     = new Date().setHours(0, 0, 0, 0);
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
  if (allToday)                                timeRef = "earlier today";
  else if (anyYesterday && oldestDaysAgo < 2)  timeRef = "yesterday";
  else if (oldestDaysAgo < 3)                  timeRef = "in the last couple of days";
  else if (oldestDaysAgo < 7)                  timeRef = "earlier this week";
  else                                          timeRef = "over the past week";

  let activityPart;
  if (phrases.length === 1) {
    activityPart = phrases[0];
  } else if (phrases.length === 2) {
    activityPart = `${phrases[0]} and ${phrases[1]}`;
  } else {
    const allButLast = phrases.slice(0, -1).join(", ");
    activityPart     = `${allButLast}, and ${phrases[phrases.length - 1]}`;
  }

  let sentence = `You ${activityPart} ${timeRef}.`;

  const hasRest     = phrases.some(p => p.includes("rest day"));
  const hasRecovery = phrases.some(p => p.includes("recovery") || p.includes("mobility"));
  const hasTraining = phrases.some(p =>
    p.includes("gym") || p.includes("trained") || p.includes("HIIT") || p.includes("strength")
  );

  const daysWithActivity = new Set(
    relevantActivities.map(a =>
      new Date(a.completedAt || a.sessionStart || a.date || 0).toISOString().split("T")[0]
    )
  );
  const consecutiveDays = daysWithActivity.size;

  if (hasRest && phrases.length === 1) {
    const restVariants = {
      steady:    "Rest is part of the programme, not a break from it.",
      energetic: "Smart move. Recovery is where gains are made.",
      nurturing: "Your body needed that.",
      minimal:   ""
    };
    const v = restVariants[coachPersonality];
    if (v) sentence += " " + v;
  } else if (consecutiveDays >= 3 && hasTraining) {
    const streakVariants = {
      steady:    `You have trained for ${consecutiveDays} days running. Today's session will build on that.`,
      energetic: `${consecutiveDays} days in a row. Keep that going.`,
      nurturing: `${consecutiveDays} days of showing up. That is a practice.`,
      minimal:   ""
    };
    const v = streakVariants[coachPersonality] || "";
    if (v) sentence += " " + v;
  } else if (hasRecovery && hasTraining) {
    const recoveryVariants = {
      steady:    "Good balance of effort and recovery.",
      energetic: "Hard work and smart recovery. That is how it is done.",
      nurturing: "You have been taking care of yourself as well as working hard.",
      minimal:   ""
    };
    const v = recoveryVariants[coachPersonality];
    if (v) sentence += " " + v;
  } else if (phrases.length >= 2 && coachPersonality !== "minimal") {
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

function buildAlternativeProposal() {
  const current = currentProposal;

  const alternatives = {
    "gym":        { type: "quiet",  target: "quiet-session",  quietMode: "breathing", duration: 20,
                    proposal: "How about something quieter instead. A breathing practice or a short mindful session.",
                    rationale: "Sometimes contrast is the right choice." },
    "quiet":      { type: "gym",   target: "gym-programme",  quietMode: null,         duration: 35,
                    proposal: "How about continuing your gym programme after all. You might have more in you than you think.",
                    rationale: "Movement often generates the energy it costs." },
    "yoga":       { type: "gym",   target: "gym-programme",  quietMode: null,         duration: 35,
                    proposal: "How about the gym programme instead. A different kind of movement that will complement your recent sessions.",
                    rationale: "Strength work supports mobility over time." },
    "run":        { type: "walk",  target: "walk-session",   quietMode: null,         duration: 30,
                    proposal: "How about a walk instead. Same outdoor time, less intensity, still moving.",
                    rationale: "Lower-intensity movement has its own benefits." },
    "walk":       { type: "quiet", target: "quiet-session",  quietMode: "mindful",    duration: 15,
                    proposal: "How about a short mindful session instead. Fifteen minutes of stillness.",
                    rationale: "Rest is movement of a different kind." },
    "prescribed": { type: "gym",   target: "gym-programme",  quietMode: null,         duration: 45,
                    proposal: "How about the full gym session. Your prescribed work is already built into the warmup.",
                    rationale: "More complete session, same prescribed work included." }
  };

  const alt = alternatives[current.type] || alternatives["quiet"];
  return { ...alt, reflection: current.reflection };
}

function latestCheckin() {
  const history  = store.get("checkinHistory") || {};
  const todayKey = new Date().toISOString().split("T")[0];
  return history[todayKey] || store.get("lastCheckin") || {};
}

//  Render 

export function render() {
  if (!currentProposal) currentProposal = buildProposal();
  const name = (store.get("name") || "").split(" ")[0] || "there";

  return `
    <div class="view coach-proposal-view">

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

      <div id="proposal-body">
        ${proposalState === "proposal"        ? renderProposal(name)      : ""}
        ${proposalState === "branching"       ? renderBranching()         : ""}
        ${proposalState === "location"        ? renderLocationPicker()    : ""}
        ${proposalState === "home-options"    ? renderHomeOptions()       : ""}
        ${proposalState === "gym-options"     ? renderGymOptions()        : ""}
        ${proposalState === "outdoor-options" ? renderOutdoorOptions()    : ""}
        ${proposalState === "revised"         ? renderRevised(name)       : ""}
        ${proposalState === "activity-pick"   ? renderActivityPick()      : ""}
      </div>

    </div>
  `;
}

function renderProposal(name) {
  const p = currentProposal;
  const helperText = p.severePainOverride
    ? "Not available today -- protecting your " + (p.affectedZone || "affected area")
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
          <span class="coach-proposal-duration">About ${p.duration} minutes</span>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full"
              id="proposal-accept-btn"
              ${p.severePainOverride ? "disabled" : ""}
              aria-label="Accept the coach's suggestion">
        Let's go with your plan
      </button>
      ${p.severePainOverride && helperText ? `
        <p class="text-xs text-error" style="margin-top: var(--space-2); text-align: center;">
          ${helperText}
        </p>
      ` : ""}

      <button class="btn btn-primary btn-large btn-full"
              id="proposal-adjust-btn"
              style="margin-top: var(--space-3);"
              aria-label="Adjust today's session">
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

//  Location-first branching 

let selectedLocation = null;

const LOCATIONS = [
  { id: "home",     label: "At home",       icon: "\uD83C\uDFE0" },
  { id: "gym",      label: "At the gym",    icon: "\uD83C\uDFCB" },
  { id: "outdoors", label: "Outdoors",      icon: "\uD83C\uDF33" },
  { id: "pool",     label: "Swimming pool", icon: "\uD83C\uDFCA" },
];

const HOME_OPTIONS = [
  { id: "home-mixed",    label: "Mixed workout", icon: "\u2728",       description: "Coach builds a range of things" },
  { id: "home-core",     label: "Core",          icon: "\uD83E\uDDD8", description: "Choose intensity below" },
  { id: "home-hiit",     label: "HIIT",          icon: "\u26A1",       description: "Choose intensity below" },
  { id: "home-strength", label: "Strength",      icon: "\uD83D\uDCAA", description: "Bodyweight or home equipment" },
  { id: "home-cardio",   label: "Cardio",        icon: "\uD83C\uDFC3", description: "Raise the heart rate" },
  { id: "home-mobility", label: "Mobility",      icon: "\uD83C\uDF3F", description: "Open and unlock the body" },
];

const GYM_OPTIONS = [
  { id: "gym-programme", label: "My programme", icon: "\uD83C\uDFCB", target: "gym-programme" },
  { id: "gym-core",      label: "Core",          icon: "\uD83E\uDDD8", target: "core-session"  },
  { id: "gym-cardio",    label: "Cardio",        icon: "\uD83C\uDFC3", target: "activity-log"  },
  { id: "gym-upper",     label: "Upper body",    icon: "\uD83D\uDCAA", target: "gym-programme" },
  { id: "gym-lower",     label: "Lower body",    icon: "\uD83E\uDDB5", target: "gym-programme" },
  { id: "gym-strength",  label: "Strength",      icon: "\uD83D\uDD25", target: "gym-programme" },
];

const OUTDOOR_OPTIONS = [
  { id: "run",    label: "Run",   icon: "\uD83C\uDFC3", target: "running-session" },
  { id: "walk",   label: "Walk",  icon: "\uD83D\uDEB6", target: "walk-session"    },
  { id: "cycle",  label: "Cycle", icon: "\uD83D\uDEB4", target: "cycle-session"   },
  { id: "hiking", label: "Hike",  icon: "\uD83E\uDD7E", target: "activity-log"    },
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
      &larr; Back to the suggestion
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
      &larr; Back
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
      &larr; Back
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
      &larr; Back
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
      &larr; Back
    </button>
  `;
}

function renderRevised(name) {
  const p = revisedProposal || currentProposal;
  return `
    <div class="card card-coach coach-proposal-card">
      <img src="assets/images/logo-icon-128.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="coach-proposal-content">
        <p class="coach-proposal-suggestion">${p.proposal}</p>
        <p class="coach-proposal-rationale text-sm text-muted">${p.rationale}</p>
        <div class="coach-proposal-meta">
          <span class="coach-proposal-duration">About ${p.duration} minutes</span>
        </div>
      </div>
    </div>

    <div class="coach-proposal-actions">
      <button class="btn btn-primary btn-large btn-full"
              id="proposal-accept-revised-btn"
              aria-label="Accept this suggestion">
        Let's do this
      </button>
      <button class="btn btn-ghost btn-full"
              id="proposal-back-to-branching-btn"
              style="margin-top: var(--space-3);">
        &larr; Back
      </button>
    </div>
  `;
}

function buildHomeProposal(optionId) {
  const energy     = latestCheckin().energy || 5;
  const homeEquip  = store.get("homeEquipment") || store.get("equipment") || [];
  const hasWeights = homeEquip.some(e => e.startsWith("dumbbells") || e.startsWith("kettlebell") || e === "barbell");

  const proposals = {
    "home-mixed":    { type: "home-workout", target: "core-session",  duration: 30,
                       proposal: "A mixed home workout -- mobility to open up, a cardio burst, then core to finish. All bodyweight" + (hasWeights ? ", with your home weights available if you want to add load." : "."),
                       rationale: "A varied session keeps things interesting and hits different systems." },
    "home-core":     { type: "core",         target: "core-session",  duration: 20,
                       proposal: "A focused core session. Stability first, then strength, finishing with some breath work.",
                       rationale: "Core work is always available, needs no equipment, and pays off in everything else you do." },
    "home-hiit":     { type: "hiit",         target: "core-session",  duration: energy >= 6 ? 25 : 15,
                       proposal: energy >= 6 ? "A 25-minute HIIT circuit. Work intervals, short rest, high effort. All bodyweight." : "A lighter 15-minute HIIT session -- shorter intervals, more rest. Right for your energy level today.",
                       rationale: energy >= 6 ? "Good energy today -- use it." : "Adapted for your energy level." },
    "home-strength": { type: "strength",     target: "core-session",  duration: 30,
                       proposal: hasWeights ? "A strength session using your home weights. Push, pull, hinge, squat." : "A bodyweight strength session. Harder than it looks when done properly.",
                       rationale: hasWeights ? "You have equipment -- let us use it." : "Bodyweight strength builds genuine functional capacity." },
    "home-cardio":   { type: "cardio",       target: "walk-session",  duration: 20,
                       proposal: "A cardio session at home or around the block. Whatever keeps the heart rate up.",
                       rationale: "Cardiovascular work does not need a gym." },
    "home-mobility": { type: "mobility",     target: "core-session",  duration: 20,
                       proposal: "A mobility session -- hip openers, thoracic rotation, shoulder work. Moving the parts that usually get ignored.",
                       rationale: "Mobility is training. It is not a warmup." }
  };

  const chosen = proposals[optionId] || proposals["home-mixed"];
  return { ...chosen, quietMode: null, reflection: currentProposal?.reflection || "",
           constraint: null, severePainOverride: false, disabledOption: null };
}

const ACTIVITY_PICKS = [
  { id: "gym",       label: "Gym session",       icon: "\uD83C\uDFCB", target: "gym-programme",  quietMode: null      },
  { id: "run",       label: "Run",               icon: "\uD83C\uDFC3", target: "running-session", quietMode: null     },
  { id: "walk",      label: "Walk",              icon: "\uD83D\uDEB6", target: "walk-session",    quietMode: null     },
  { id: "yoga",      label: "Yoga",              icon: "\uD83E\uDDD8", target: "yoga-session",    quietMode: null     },
  { id: "swim",      label: "Swim",              icon: "\uD83C\uDFCA", target: "activity-log",    quietMode: null     },
  { id: "cycle",     label: "Cycle",             icon: "\uD83D\uDEB4", target: "cycle-session",   quietMode: null     },
  { id: "core",      label: "Core",              icon: "\uD83D\uDCAA", target: "core-session",    quietMode: null     },
  { id: "quiet",     label: "Something quiet",   icon: "\uD83C\uDF19", target: "quiet-session",   quietMode: "mindful"},
  { id: "prescribed",label: "Prescribed exercises",icon: "\uD83D\uDCCB",target: "prescribed",    quietMode: null     },
];

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
      &larr; Back
    </button>
  `;
}

//  Helpers 

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
    type: proposal.type,
    duration: proposal.duration,
    acceptedAt: new Date().toISOString()
  });

  router.navigate(proposal.target);
}

//  Mount 

export function onMount() {
  document.getElementById("proposal-back-btn")?.addEventListener("click", () => {
    cleanup();
    router.navigate("checkin");
  });

  document.getElementById("proposal-library-btn")?.addEventListener("click", () => {
    cleanup();
    store.set("settingsTab", "library");
    router.navigate("settings");
  });

  document.getElementById("proposal-accept-btn")?.addEventListener("click", () => {
    navigateToProposal(currentProposal);
  });

  document.getElementById("proposal-adjust-btn")?.addEventListener("click", () => {
    store.set("proposalAdjusted", true);
    navigateToProposal(currentProposal);
  });

  document.getElementById("proposal-else-btn")?.addEventListener("click", () => {
    const prefs = store.get("activityPreferences") || {};
    const declineKey = (currentProposal?.type || "unknown") + "_declined";
    prefs[declineKey] = (prefs[declineKey] || 0) + 1;
    store.set("activityPreferences", prefs);
    proposalState = "branching";
    rerender();
  });

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
      if (branchChoice === "different" || branchChoice === "location") {
        proposalState = "location";
        rerender();
        return;
      }
    });
  });

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

  document.querySelectorAll(".coach-location-btn[data-location]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedLocation = btn.dataset.location;
      if (selectedLocation === "home")     { proposalState = "home-options";    rerender(); return; }
      if (selectedLocation === "gym")      { proposalState = "gym-options";     rerender(); return; }
      if (selectedLocation === "outdoors") { proposalState = "outdoor-options"; rerender(); return; }
      if (selectedLocation === "pool") {
        store.set("coachProposalAccepted", { type: "swim", duration: 30, acceptedAt: new Date().toISOString() });
        cleanup();
        router.navigate("swim-session");
      }
    });
  });

  document.querySelectorAll(".coach-location-btn[data-home-option]").forEach(btn => {
    btn.addEventListener("click", () => {
      revisedProposal = buildHomeProposal(btn.dataset.homeOption);
      proposalState   = "revised";
      rerender();
    });
  });

  document.querySelectorAll(".coach-location-btn[data-gym-option]").forEach(btn => {
    btn.addEventListener("click", () => {
      store.set("coachProposalAccepted", { type: btn.dataset.gymOption, duration: 45, acceptedAt: new Date().toISOString() });
      cleanup();
      router.navigate(btn.dataset.target);
    });
  });

  document.querySelectorAll(".coach-location-btn[data-activity]").forEach(btn => {
    btn.addEventListener("click", () => {
      store.set("coachProposalAccepted", { type: btn.dataset.activity, duration: 30, acceptedAt: new Date().toISOString() });
      cleanup();
      router.navigate(btn.dataset.target);
    });
  });

  document.getElementById("proposal-accept-revised-btn")?.addEventListener("click", () => {
    navigateToProposal(revisedProposal || currentProposal);
  });

  document.querySelectorAll(".coach-activity-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const quietMode = btn.dataset.quiet || null;
      if (quietMode) store.set("quietMode", quietMode);
      store.set("coachProposalAccepted", {
        type: btn.dataset.activity,
        label: btn.querySelector("span:last-child")?.textContent || "",
        duration: null,
        acceptedAt: new Date().toISOString()
      });
      cleanup();
      router.navigate(btn.dataset.target);
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
