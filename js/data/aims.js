/**
 * js/data/aims.js
 * 03 Sep 2026 v1
 *
 * AIM-VOCAB. What somebody can be working towards, and what feeds it.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  WHY A VOCABULARY AND NOT FREE TEXT
 * ─────────────────────────────────────────────────────────────────────
 *
 * If somebody types "get off the floor unaided", nothing here can turn
 * that into hips, ankles and leg strength. So aims are chosen, and each
 * aim carries the strands that feed it. That is also how a coach
 * actually works: they do not invent the strands on the spot, they know
 * what feeds a sprint start and propose from it.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  AN AIM IS A CAPABILITY, NEVER A METRIC, AND NEVER HAS A DATE
 * ─────────────────────────────────────────────────────────────────────
 *
 * "Get off the floor without using my hands." Not "improve mobility",
 * which the coach cannot act on -- and which is exactly why the old
 * onboarding goals did nothing: traced 3 Sep, "get stronger" and
 * "improve flexibility" shared 48% of their exercise pool and the coach
 * spoke identical words for both.
 *
 * There is no "by when" anywhere in this file and there must never be.
 * A date is a thing you fail on a Tuesday.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  A STRAND MAY BE A MIND STRAND OUTRIGHT
 * ─────────────────────────────────────────────────────────────────────
 *
 * Not a hidden layer under a physical strand, not a warm-down garnish.
 * For getting off the floor, fear of falling is frequently the actual
 * limiting factor, and a physiotherapist would say so.
 *
 * The arc spec recorded itself falling into exactly this trap: its
 * worked table listed a mind strand and its illustration then used
 * three physical ones and quietly dropped it. Assertion 4 of
 * verify-aims.mjs exists because of that, and it will fail if mind
 * strands thin out as aims are added.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  PROVISIONAL
 * ─────────────────────────────────────────────────────────────────────
 *
 * Ours, not a clinician's, exactly like stretch-goal-zones.js. Same
 * safety property and it is the reason this is shippable: strands only
 * EMPHASISE. Conditions, soreness, equipment and the difficulty ceiling
 * all filter before any of this is consulted, so a wrong row produces a
 * less useful session, never an unsafe one.
 */

/**
 * STRANDS. Each names what it actually does to a session.
 *
 *   kind: "body" | "mind"
 *   zones:        stretch zones this leans towards (STRETCH_ZONES ids)
 *   sessionTypes: SESSION_TYPES ids this suits
 *   movements:    In Step movements this draws on (in-step-scenarios.js)
 *
 * A mind strand carries `movements` and no zones. A body strand carries
 * zones and/or sessionTypes. Nothing carries both sets, because a strand
 * that did would be two strands.
 */
export const STRANDS = {
  // ── Body ─────────────────────────────────────────────────────────
  "hip-range":        { label: "Hip range",             kind: "body", zones: ["hips", "glutes"],                  sessionTypes: ["mobility", "stretch"] },
  "ankle-range":      { label: "Ankle range",           kind: "body", zones: ["calves-ankles"],                   sessionTypes: ["mobility", "stretch"] },
  "hamstring-range":  { label: "Hamstring range",       kind: "body", zones: ["hamstrings"],                      sessionTypes: ["stretch", "mobility"] },
  "upper-back-range": { label: "Upper back and chest",  kind: "body", zones: ["upper-back", "chest"],             sessionTypes: ["mobility", "stretch"] },
  "neck-shoulders":   { label: "Neck and shoulders",    kind: "body", zones: ["neck-shoulders", "upper-back"],    sessionTypes: ["stretch", "mobility"] },
  "leg-strength":     { label: "Leg strength",          kind: "body", zones: [],                                  sessionTypes: ["lower", "glute", "full"] },
  "upper-strength":   { label: "Upper body strength",   kind: "body", zones: [],                                  sessionTypes: ["upper", "full"] },
  "trunk-strength":   { label: "Trunk strength",        kind: "body", zones: [],                                  sessionTypes: ["core", "full"] },
  "hip-hinge":        { label: "Bending and lifting",   kind: "body", zones: ["hamstrings", "lower-back"],        sessionTypes: ["lower", "core"] },
  "aerobic-base":     { label: "Staying-power",         kind: "body", zones: [],                                  sessionTypes: ["cardio", "full"] },
  "balance":          { label: "Balance",               kind: "body", zones: ["calves-ankles", "hips"],           sessionTypes: ["mobility", "core"] },
  "getting-going":    { label: "Getting going again",   kind: "body", zones: ["hips", "upper-back"],              sessionTypes: ["mobility", "full"] },

  // ── Mind ─────────────────────────────────────────────────────────
  // These are strands in their own right. See the header.
  "confidence-floor": { label: "Confidence about getting down and up", kind: "mind", movements: ["solo", "environment"] },
  "pacing":           { label: "Pacing yourself",                      kind: "mind", movements: ["solo"] },
  "being-outside":    { label: "Being outside more",                   kind: "mind", movements: ["environment"] },
  "winding-down":     { label: "Winding down",                         kind: "mind", movements: ["solo", "environment"] },
  "meeting-people":   { label: "Meeting people as they are",           kind: "mind", movements: ["partner", "floor"] },
  "self-kindness":    { label: "Being fair to yourself",               kind: "mind", movements: ["solo"] },
  "steadiness":       { label: "Staying steady when things shift",     kind: "mind", movements: ["environment", "floor"] },
};

/**
 * AIMS. Each offers its candidate strands; the person chooses up to
 * three. Ordering matters -- it is the order the coach proposes in.
 *
 * EVERY AIM OFFERS AT LEAST ONE MIND STRAND. Not decoration: it is what
 * stops the mind side quietly becoming a garnish as this file grows.
 */
export const AIMS = {
  provisional: true,
  sourcedFrom: "Build New Habits, 03 Sep 2026. Not clinically reviewed.",
  maxStrands: 3,

  list: [
    {
      id: "floor-unaided",
      label: "Get off the floor without using my hands",
      // Graeme's own example. The mind strand is listed SECOND on
      // purpose -- fear of falling is often the real limiter, and
      // burying it fourth would teach people it is an afterthought.
      strands: ["hip-range", "confidence-floor", "leg-strength", "ankle-range"],
    },
    {
      id: "run-5k-nonstop",
      label: "Run 5K without stopping",
      strands: ["aerobic-base", "ankle-range", "pacing", "hamstring-range"],
    },
    {
      id: "carry-shopping",
      label: "Carry the shopping without my back going",
      strands: ["hip-hinge", "trunk-strength", "pacing", "leg-strength"],
    },
    {
      id: "stairs-easier",
      label: "Get up the stairs without stopping halfway",
      strands: ["leg-strength", "aerobic-base", "pacing", "hip-range"],
    },
    {
      id: "play-with-kids",
      label: "Get down on the floor and play, and get back up",
      strands: ["hip-range", "confidence-floor", "leg-strength", "self-kindness"],
    },
    {
      id: "desk-comfort",
      label: "Get through a day at a desk without seizing up",
      strands: ["upper-back-range", "neck-shoulders", "winding-down", "hip-range"],
    },
    {
      id: "walk-further",
      label: "Walk further than I can now",
      strands: ["aerobic-base", "being-outside", "ankle-range", "pacing"],
    },
    {
      id: "sleep-better",
      label: "Wind down properly at the end of a day",
      strands: ["winding-down", "neck-shoulders", "being-outside", "self-kindness"],
    },
    {
      id: "back-to-it",
      label: "Get back to moving after a long gap",
      strands: ["getting-going", "self-kindness", "pacing", "hip-range"],
    },
    {
      id: "steady-on-feet",
      label: "Feel steadier on my feet",
      strands: ["balance", "ankle-range", "confidence-floor", "leg-strength"],
    },
    {
      id: "lift-grandchild",
      label: "Pick up somebody I love without worrying about it",
      strands: ["hip-hinge", "leg-strength", "confidence-floor", "trunk-strength"],
    },
    {
      id: "reach-overhead",
      label: "Reach the top shelf without it being a whole thing",
      strands: ["upper-back-range", "upper-strength", "neck-shoulders", "self-kindness"],
    },
    {
      id: "outdoors-more",
      label: "Spend more of my life outdoors",
      strands: ["being-outside", "aerobic-base", "ankle-range", "steadiness"],
    },
    {
      id: "meet-people-better",
      label: "Be better with the people around me",
      // A wholly mind-led aim, and it belongs here. An athlete works on
      // attitude as well as sprint starts; this is that. It still
      // carries body strands because movement is how it is practised.
      strands: ["meeting-people", "being-outside", "winding-down", "getting-going"],
    },
    {
      id: "steadier-in-myself",
      label: "Be steadier in myself when things shift",
      strands: ["steadiness", "self-kindness", "winding-down", "being-outside"],
    },
  ],
};

/** The aim record, or null. */
export function aimById(id) {
  return AIMS.list.find(a => a.id === id) || null;
}

/** Candidate strand records for an aim, in proposal order. */
export function strandsForAim(id) {
  const aim = aimById(id);
  if (!aim) return [];
  return aim.strands.map(s => ({ id: s, ...STRANDS[s] })).filter(s => s.label);
}

/**
 * The zones a set of chosen strands leans towards, de-duplicated and in
 * the order the strands were chosen. This is what replaces the goal to
 * zone map's job once an arc exists -- same contract, same safety
 * property: it may only emphasise.
 */
export function zonesForStrands(strandIds) {
  const out = [];
  for (const id of strandIds || []) {
    for (const z of (STRANDS[id] || {}).zones || []) {
      if (!out.includes(z)) out.push(z);
    }
  }
  return out;
}

/** Session types the chosen strands suit, same ordering rule. */
export function sessionTypesForStrands(strandIds) {
  const out = [];
  for (const id of strandIds || []) {
    for (const t of (STRANDS[id] || {}).sessionTypes || []) {
      if (!out.includes(t)) out.push(t);
    }
  }
  return out;
}
