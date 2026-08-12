/**
 * data/session-rationale.js
 * 11 Aug 2026 v1
 *
 * The coach explaining the session.
 *
 * WHY THIS EXISTS
 *
 * Graeme: "I'd like the coach to consider my goals and in the programme
 * selected be able to explain why this chosen exercises works. I think of a
 * human athletics coach and they would say... 'We are doing these plyos to
 * help with training the body to use all its muscle groups, and these for
 * focused aggression. This helps for training for shot put throws.' There's
 * a set of activities, rationale, long term programme. But it's always
 * explained and connected."
 *
 * That is the whole specification, and it names the three things that were
 * missing. The product could tell you what to do and, since the Exercise
 * Entry Standard, why each individual exercise helps. It could not tell you
 * why THESE exercises, TOGETHER, TODAY, and what they are building towards.
 * A list of well-explained exercises is not a programme, in the same way
 * that a list of well-chosen words is not a sentence.
 *
 * WHAT IT PRODUCES
 *
 * Three connected layers, all optional, all drawn from things the person
 * actually told us:
 *
 *   opening    why this session shape, today, for their stated intent
 *   sections   what each block is for, in one line
 *   arc        what it is building towards, and what has already changed
 *
 * WHAT IT MUST NOT DO
 *
 * Not narrate progress or decline. Not compare sessions. Not praise. P4
 * applies throughout: the coach explains its own reasoning, which is the
 * coach's to explain, and does not interpret the person, which is not.
 *
 * "You have done this three times now, so the shape will be familiar" is
 * an explanation of the programme. "You are getting more consistent" is a
 * verdict on the person. The first is here; the second never will be.
 *
 * No time-stamped horizons -- "in years to come", never "in ten years".
 * See the Exercise Entry Standard v2 for why.
 */

import { store } from "../store.js";

// ── Goal language ────────────────────────────────────────────────────────
//
// What each goal actually asks of a session, in the person's own terms
// rather than in training terms. Keyed to js/data/goals.js ids.
const GOAL_FOCUS = {
  "get-stronger":        { needs: ["strength"],            says: "getting stronger" },
  "build-muscle":        { needs: ["strength"],            says: "building muscle" },
  "tone-up":             { needs: ["strength", "cardio"],  says: "changing how you feel in your clothes" },
  "lose-weight":         { needs: ["cardio", "strength"],  says: "the steady work that shifts weight" },
  "improve-cardio":      { needs: ["cardio"],              says: "your breathing and stamina" },
  "start-running":       { needs: ["cardio"],              says: "getting you running" },
  "run-5k":              { needs: ["cardio"],              says: "your 5k" },
  "run-10k":             { needs: ["cardio"],              says: "your 10k" },
  "cycling":             { needs: ["cardio"],              says: "your riding" },
  "swimming":            { needs: ["cardio"],              says: "your swimming" },
  "flexibility":         { needs: ["mobility"],            says: "how freely you move" },
  "balance":             { needs: ["balance", "mobility"], says: "your balance" },
  "improve-posture":     { needs: ["strength", "mobility"], says: "how you hold yourself" },
  "prevent-injury":      { needs: ["mobility", "strength"], says: "keeping you out of trouble" },
  "reduce-pain":         { needs: ["mobility"],            says: "settling the pain down" },
  "injury-recovery":     { needs: ["rehabilitation"],      says: "rebuilding what you have lost" },
  "return-to-fitness":   { needs: ["cardio", "strength"],  says: "finding your way back" },
  "return-after-illness":{ needs: ["mobility"],            says: "getting back on your feet" },
  "move-more":           { needs: ["cardio"],              says: "simply moving more" },
  "more-energy":         { needs: ["cardio"],              says: "your energy" },
  "feel-better":         { needs: [],                      says: "feeling better in yourself" },
  "reduce-stress":       { needs: ["mobility"],            says: "taking the edge off" },
  "improve-mood":        { needs: [],                      says: "how you feel afterwards" },
  "sleep-better":        { needs: [],                      says: "your sleep" },
  "build-habit":         { needs: [],                      says: "making this a habit" }
};

// What each session block is doing, and why it comes where it does.
const SECTION_PURPOSE = {
  warmup:   "Warming up. Raising your heart rate first, then loosening the joints you are about to ask something of.",
  main:     "The working part. This is where the change happens.",
  cooldown: "Winding down. Lengthening what you have just worked, and letting your breathing settle."
};

/**
 * What a movement pattern is FOR, in plain language.
 *
 * Deliberately about consequence rather than anatomy. Somebody wants to
 * know that a hinge is what lets them pick things up, not that it recruits
 * the posterior chain.
 */
// Two forms, because they do different jobs. `full` explains a single
// pattern in a sentence; `short` is a noun phrase that can sit in a list
// without its own commas turning the sentence to mush. The first version
// used one form for both and produced "Today covers carrying, and the grip
// that goes with it, range, so the next session starts from a better place,
// and your heart and lungs" -- accurate, unreadable.
const PATTERN_PURPOSE = {
  "hinge":                { short: "lifting",        full: "picking things up without your back complaining" },
  "squat":                { short: "getting up and down", full: "getting up and down — chairs, cars, the floor" },
  "lunge":               { short: "single-leg steadiness", full: "steadiness on one leg, which is what walking actually is" },
  "push":                 { short: "pushing",        full: "pushing — doors, prams, yourself up off the floor" },
  "pull":                 { short: "pulling",        full: "pulling, and the upper back that holds your shoulders where they belong" },
  "carry":                { short: "carrying and grip", full: "carrying, and the grip that goes with it" },
  "hip-extension":        { short: "glutes",         full: "the glutes, which protect your lower back" },
  "anti-rotation":        { short: "core control",   full: "staying steady when something tries to twist you" },
  "anti-extension":       { short: "core control",   full: "the middle that stops your back arching under load" },
  "anti-lateral-flexion": { short: "side strength",  full: "staying upright when the weight is all on one side" },
  "balance":              { short: "balance",        full: "balance, which is the thing that stops a stumble becoming a fall" },
  "proprioception":       { short: "body awareness", full: "knowing where your body is without looking" },
  "jump":                 { short: "power",          full: "power, which fades before strength does" },
  "stretch":              { short: "range",          full: "range, so the next session starts from a better place" },
  "locomotion":           { short: "heart and lungs", full: "your heart and lungs" },
  "breath":               { short: "settling down",  full: "settling your nervous system down" },
  "isometric":            { short: "holding strength", full: "the strength to hold a position, not just move through one" },
  "hip-abduction":        { short: "hip stability",  full: "the hips that keep you level when you take a step" },
  "calf-raise":           { short: "calves and ankles", full: "the calves that push you off with every step" },
  "rotation":             { short: "turning",        full: "turning, reaching, and looking behind you" },
  "spinal-rotation":      { short: "spine mobility", full: "a spine that turns freely" },
  "yoga-pose":            { short: "held positions", full: "strength and range held together" }
};

const _short = p => PATTERN_PURPOSE[p]?.short || null;
const _full  = p => PATTERN_PURPOSE[p]?.full  || null;


/**
 * Build the coach's explanation of a session.
 *
 * @param {Object} session       — as returned by buildSession()
 * @param {Object} [opts]
 * @param {string} [opts.excludedReason] — coach-voice line explaining a
 *        deliberate omission, e.g. the pulse-raiser rule's reason
 * @returns {{ opening:string, sections:Object, arc:string|null }}
 */
export function buildRationale(session, opts = {}) {
  const exercises = session?.exercises || [];
  if (exercises.length === 0) return { opening: "", sections: {}, arc: null };

  const intent = store.get("trainingIntent") || "improve";
  const goals  = store.get("goals") || [];

  return {
    opening:  _opening(exercises, intent, goals, opts.excludedReason),
    sections: _sections(exercises),
    arc:      _arc(exercises, intent, goals)
  };
}

// ── Opening ──────────────────────────────────────────────────────────────

function _opening(exercises, intent, goals, excludedReason) {
  const patterns = _distinctPatterns(exercises);
  // Deduplicated: anti-rotation and anti-extension both read "core
  // control", and listing it twice makes the coach sound like it is
  // padding.
  const named = [...new Set(patterns.map(_short).filter(Boolean))].slice(0, 3);

  const parts = [];

  // What this session is, in terms of what it is for.
  if (named.length >= 2) {
    const list = named.length === 3
      ? `${named[0]}, ${named[1]}, and ${named[2]}`
      : `${named[0]} and ${named[1]}`;
    parts.push(`Today covers ${list}.`);
  } else if (named.length === 1) {
    parts.push(`Today is about ${named[0]}.`);
  }

  // How that connects to what they said they wanted. This is the join
  // Graeme was missing -- activities, then rationale, then the thing it
  // is all for.
  const goalLine = _goalConnection(goals, exercises);
  if (goalLine) parts.push(goalLine);

  // Intent shapes the emphasis, and saying so makes the session legible
  // rather than arbitrary.
  if (intent === "maintain") {
    parts.push("The emphasis is on holding onto what you have — grip, balance, and getting up and down, because those are the ones worth keeping.");
  } else if (intent === "recover") {
    parts.push("The emphasis is on rebuilding, so it is deliberately steadier than it might be.");
  }

  // A deliberate omission, explained. Never silent.
  if (excludedReason) parts.push(excludedReason);

  return parts.join(" ");
}

/**
 * What does this session actually deliver?
 *
 * Derived from movementPattern, NOT from e.category. Found in testing:
 * _filterCandidates() overwrites category with the builder's own tag
 * ('squat-pattern', 'hip-hinge'), so the database categories a goal would
 * naturally match against never survive into a built session. Matching on
 * movement is also the more honest test -- what a session gives you is
 * what it makes you do.
 */
const DELIVERS = {
  strength:       ["hinge", "squat", "push", "pull", "carry", "lunge",
                   "hip-extension", "isometric", "hip-abduction", "calf-raise",
                   "anti-rotation", "anti-extension", "anti-lateral-flexion"],
  cardio:         ["locomotion", "jump"],
  mobility:       ["stretch", "spinal-rotation", "spinal-flexion-extension",
                   "hip-rotation", "yoga-pose", "shoulder-rotation"],
  balance:        ["balance", "proprioception"],
  rehabilitation: ["isometric", "proprioception"]
};

function _delivers(exercises) {
  const patterns = new Set(exercises.map(e => e.movementPattern).filter(Boolean));
  const out = new Set();
  for (const [capability, list] of Object.entries(DELIVERS)) {
    if (list.some(p => patterns.has(p))) out.add(capability);
  }
  return out;
}

function _goalConnection(goals, exercises) {
  if (!Array.isArray(goals) || goals.length === 0) return null;

  const present = _delivers(exercises);
  for (const goalId of goals) {
    const g = GOAL_FOCUS[goalId];
    if (!g) continue;
    // Only claim a connection the session actually delivers. Telling
    // somebody a session serves their 5k when it contains no cardio is
    // the kind of small dishonesty that costs trust entirely.
    if (g.needs.length === 0 || g.needs.some(n => present.has(n))) {
      return `That feeds straight into ${g.says}.`;
    }
  }
  return null;
}

// ── Sections ─────────────────────────────────────────────────────────────

function _sections(exercises) {
  const out = {};
  for (const section of ["warmup", "main", "cooldown"]) {
    const inSection = exercises.filter(e => e.section === section);
    if (inSection.length === 0) continue;

    let line = SECTION_PURPOSE[section];
    if (section === "main") {
      // The section line uses the FULL form, because there is room for
      // one proper explanation here and it is the most useful place in
      // the session for it.
      // Stated as its own sentence rather than embedded, because several
      // of the full forms carry an em-dash and reading one mid-clause
      // produced "This is where getting up and down -- chairs, cars, the
      // floor gets built."
      const lead = _distinctPatterns(inSection).map(_full).find(Boolean);
      if (lead) line = `The working part. Today that means ${lead}.`;
    }
    out[section] = line;
  }
  return out;
}

// ── Arc ──────────────────────────────────────────────────────────────────

function _arc(exercises, intent, goals) {
  // Familiarity, stated as a property of the PROGRAMME, never of the
  // person. "You have met these before" describes the session. "You are
  // being consistent" would be a verdict, and is not ours to give.
  const seen = exercises.filter(e => store.exerciseStats(e.id).n >= 2);
  const lines = [];

  if (seen.length >= 3) {
    lines.push(`Most of this you have met before. That is deliberate — the same movements repeated are what actually build strength and confidence in them, and it is why the sessions will start to feel recognisable.`);
  } else if (seen.length >= 1) {
    lines.push(`Some of this you have met before, and you will keep meeting it. Repetition is where the progress lives.`);
  }

  if (intent === "maintain") {
    lines.push("Kept up, this is the work that keeps you doing what you do now, in years to come.");
  } else if (intent === "recover") {
    lines.push("Each session builds on the last, at whatever pace your body sets. There is no schedule to keep up with.");
  } else if (goals.includes("get-stronger") || goals.includes("build-muscle")) {
    // Reworded 11 Aug 2026. The original said the weight "will go up
    // over the coming weeks", which is a promise the coach cannot keep
    // and, worse, a schedule the person is measured against. Graeme:
    // the coach invites, and never moves somebody on before they are
    // ready or in spite of where they are. The arc now describes what
    // meeting the same lifts makes POSSIBLE, and leaves when to a
    // per-session invitation that reads the day.
    lines.push("You will keep meeting these same lifts. When a day suits it, I will suggest adding a bit — but only as a suggestion, and only when it makes sense.");
  }

  return lines.length ? lines.join(" ") : null;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function _distinctPatterns(exercises) {
  const counts = {};
  for (const e of exercises) {
    if (!e.movementPattern) continue;
    counts[e.movementPattern] = (counts[e.movementPattern] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p);
}

// ─────────────────────────────────────────────────────────────────────────
// PROGRESSION INVITATION
//
// Graeme: "when we get there the coach invites the user to increase
// something at a rate they think is right... 'today I want you to try going
// a little further, but nothing extreme'... it's invitational not directed.
// The coach never says 'right, 10kg more today'. This avoids the issue of
// moving on before the user is ready, or in spite of where the user is at."
//
// Three rules follow from that, and all three are load-bearing.
//
// NEVER A NUMBER. The coach does not know what the person has in them
// today, and a prescribed increment is a target to fail. "A little more"
// is answerable honestly by somebody having a good day and somebody
// having a bad one, and both answers are correct.
//
// CONDITIONAL WHEN THE COACH DOES NOT KNOW. "If it feels right", "if you
// can" -- the out is built into the sentence, so declining is not a
// failure but one of the two answers the question invited.
//
// SPECIFIC when it does, but still not directive. Graeme: "there are
// times when the coach will know... Bulgarian Dead Lifts are good for
// your back, but you said they are hurting a little, instead of not
// doing them, maybe take the pressure off a bit."
//
// The distinction that took two passes to get right: what changes with
// knowledge is the SPECIFICITY, not the authority. Hedging something we
// have been told is a coach pretending not to know, so the coach names
// the sore area and says which exercise loads it. But the adjustment
// itself stays an invitation -- "consider taking some weight off", not
// "take some weight off". Graeme, on the first version: "this is then
// optional and invitational."
//
// He is right, and it is the stronger position. The coach is the one
// who knows which exercise works which area; the person is the one who
// knows how it feels today. Naming the first without commanding the
// second is what respects both.
//
// IT READS THE DAY. Graeme again: "It might be more fitting to drop
// weights to protect an injury while in rehab phase, or a mild flare up.
// It might be that to maintain the weight is an achievement given the mood
// and energy." So a flare invites LESS, a low-energy day invites the same,
// and only a settled day on an improve intent invites more.
//
// It also stays quiet. No invitation appears until the person has actually
// met the exercise and left themselves a note, because there is nothing to
// go up from and inventing a starting point is the directive behaviour this
// exists to avoid.
// ─────────────────────────────────────────────────────────────────────────

/**
 * @param {Object} exercise
 * @returns {string|null} one invitational line, or null when the coach
 *          should say nothing at all
 */
export function progressionInvitation(exercise) {
  if (!exercise?.id) return null;

  const stats = store.exerciseStats(exercise.id);
  const last  = store.lastLift ? store.lastLift(exercise.id) : null;

  // Nothing to build on yet. Say so plainly rather than inventing a
  // starting point -- the note is the thing that makes next time useful.
  if (!last) {
    return stats.n >= 1
      ? "Worth noting what you use today. It gives us something to go on next time."
      : null;
  }

  const intent    = store.get("trainingIntent") || "improve";
  const intensity = store.get("todayIntensity") || null;

  // ── HOW MUCH THE COACH KNOWS ──────────────────────────────────────────
  //
  // Graeme, correcting an earlier version of this that hedged everything:
  // "Always conditional -- except not always. We have mood, energy,
  // conditions. There are times when the coach doesn't know. There are
  // times when the coach will know that they shouldn't... but when the
  // user is doing the exercise the coach probably does know. Bulgarian
  // Dead Lifts are good for your back, but you said they are hurting a
  // little, instead of not doing them, maybe take the pressure off a bit."
  //
  // He is right, and the hedge was the mistake. Confidence should scale
  // with information. When somebody has told us a specific area is sore
  // AND this exercise loads that area, the coach knows something real and
  // hedging it into "if it feels right" is a coach pretending not to
  // know. Say it plainly, name why, and still leave the decision theirs.
  //
  // The three levels:
  //   KNOWS SPECIFICALLY  named area sore, this exercise loads it
  //                       -> names what it knows, and still invites
  //   KNOWS GENERALLY     something sore, or a low-energy day
  //                       -> clear steer, no naming
  //   DOES NOT KNOW       nothing reported
  //                       -> conditional, or says nothing
  const conditions = store.get("conditions") || [];
  const scores     = store.get("conditionPainScores") || {};
  const sore       = conditions.filter(id => (scores[id] || 0) >= 4);
  const areas      = exercise.affectsAreas || [];

  // Condition ids and affectsAreas share most of their vocabulary. These
  // are the ones that do not line up by name.
  const AREA_ALIASES = {
    "lower-back":     ["lower-back", "spine"],
    "upper-back":     ["upper-back", "thoracic"],
    "sciatica":       ["lower-back", "glutes", "hamstring", "piriformis"],
    "it-band":        ["hip", "knee"],
    "shin-splints":   ["calves", "ankle-foot"],
    "achilles":       ["calves", "achilles", "ankle-foot"],
    "plantar-fasciitis": ["ankle-foot", "calves"],
    "biceps-triceps": ["triceps-biceps"],
    "wrist-elbow":    ["wrist-elbow"]
  };

  const loadsSoreArea = sore.find(id => {
    const mapped = AREA_ALIASES[id] || [id];
    return mapped.some(a => areas.includes(a));
  });

  if (loadsSoreArea) {
    const name = _conditionLabel(loadsSoreArea);
    // Direct, because we know. Names the reason, so it does not read as
    // arbitrary caution, and keeps the exercise rather than removing it --
    // taking the pressure off is usually better than taking it away.
    return `You said your ${name} is sore today, and this one works it. Consider taking some weight off rather than skipping it — keeping the movement without the load is what helps it settle.`;
  }

  if (sore.length > 0) {
    // Something is sore but not this. A steer rather than a warning.
    return "You are carrying something sore today, so this is probably not the session to push. Matching last time, or a little under, would be a good call.";
  }

  if (intent === "recover") {
    return "Match last time if it feels comfortable, and go lighter if it does not. Rebuilding is not a race, and the pace is yours.";
  }

  if (intensity === "low") {
    return "Matching last time would be a good session today. On a day like this, holding steady is the achievement.";
  }

  if (intent === "maintain") {
    return "Same as last time is exactly right. Keeping hold of this is the whole point.";
  }

  // Settled day, improve intent, and the exercise is familiar enough that
  // adding a little is a reasonable thing to offer.
  if (stats.n >= 3) {
    return "If it feels right today, try a little more than last time. Nothing dramatic -- just enough to notice.";
  }

  return "Match last time, and see how it sits. There is no hurry to add anything yet.";
}

/**
 * Plain-language name for a condition, for use mid-sentence.
 * Lower case and possessive-friendly: "your lower back", "your knee".
 */
function _conditionLabel(id) {
  const LABELS = {
    "lower-back": "lower back", "upper-back": "upper back and neck",
    "ankle-foot": "ankle", "wrist-elbow": "wrist or elbow",
    "biceps-triceps": "arm", "chest-pecs": "chest",
    "shin-splints": "shin", "plantar-fasciitis": "foot",
    "it-band": "IT band", "abdominals": "middle"
  };
  return LABELS[id] || id.replace(/-/g, " ");
}
