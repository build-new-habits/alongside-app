/**
 * js/data/aims.js
 * 03 Sep 2026 v2
 *
 * v2 - SITUATIONS. Rewritten after device testing.
 *
 *   v1 showed the SAME FIFTEEN AIMS TO EVERYBODY. A ninety-year-old and
 *   a competitive sprinter got an identical menu including "reach the
 *   top shelf without it being a whole thing". That is the goals fault
 *   repeating one level up: an unactionable list replaced with an
 *   unresponsive one.
 *
 *   Worse, and this is what exposed it -- GRAEME WAS NOT IN HIS OWN
 *   VOCABULARY. Persona 2.1: 46, trains, herniated disc and hamstring,
 *   wants strength and core so football and tennis stop hurting. The
 *   closest v1 offered was "carry the shopping without my back going".
 *   Too long AND missing real people is the worst combination, and it
 *   happened because v1 was written from four personas out of seventeen.
 *
 *   v2 is written against the whole persona matrix (05 Jul 2026 v2) and
 *   both 76-year-olds, the national-standard sprinter, the post-cardiac
 *   beginner, the ADHD and autistic adults, the time-poor parent, and
 *   the blank-slate 30-year-old with nothing to personalise against.
 *
 *   FILTERING, NOT JUST RANKING. Graeme, 3 Sep: "if you're asking more
 *   than ten questions to anybody you're asking too many". Ranking
 *   thirty-four aims still shows thirty-four. So each aim declares the
 *   SITUATIONS it suits, situations are derived from data the app
 *   already holds, and a person sees the ones that fit -- capped, with
 *   "show me all of them" always available.
 *
 *   WHAT FILTERING MUST NEVER DO. It must never remove an aim because
 *   of somebody's age or condition. That is the app deciding what a
 *   person is allowed to want, and this audience gets that judgement
 *   everywhere else already. Everything stays reachable one tap away,
 *   and verify-aims asserts it.
 *
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
  "trusting-body":    { label: "Trusting your body again",             kind: "mind", movements: ["solo", "floor"] },
  "not-overdoing":    { label: "Knowing when to stop",                 kind: "mind", movements: ["solo"] },
  "showing-up":       { label: "Showing up when you don't feel like it", kind: "mind", movements: ["solo"] },
  "at-home-in-body":  { label: "Feeling at home in your body",         kind: "mind", movements: ["solo", "environment"] },

  // ── Body, added in v2 for the personas v1 missed ─────────────────
  "power":            { label: "Power and speed",          kind: "body", zones: [],                              sessionTypes: ["lower", "full", "cardio"] },
  "sport-specific":   { label: "Staying match-fit",        kind: "body", zones: ["hips", "hamstrings"],           sessionTypes: ["full", "cardio", "lower"] },
  "load-tolerance":   { label: "Handling more load",       kind: "body", zones: [],                              sessionTypes: ["lower", "upper", "full"] },
  "back-resilience":  { label: "A back that copes",        kind: "body", zones: ["lower-back", "hips"],           sessionTypes: ["core", "mobility"] },
  "shoulder-health":  { label: "Shoulders that behave",    kind: "body", zones: ["neck-shoulders", "upper-back"], sessionTypes: ["upper", "mobility"] },
  "keep-walking":     { label: "Keeping walking",          kind: "body", zones: ["calves-ankles", "hips"],        sessionTypes: ["cardio", "mobility"] },
  "gentle-capacity":  { label: "A bit more in the tank",   kind: "body", zones: [],                              sessionTypes: ["cardio", "mobility"] },
};

/**
 * SITUATIONS. Derived from what the app already knows -- never asked
 * again, because asking for something already stored is how a nine-step
 * onboarding happens.
 *
 * "everyday" is on most aims deliberately: it is the fallback that stops
 * anybody being shown an empty list, and the reason no aim is unreachable.
 */
export const SITUATIONS = [
  "starting",    // little or no current activity, no athletic past
  "returning",   // coming back after injury, illness, burnout or a long gap
  "managing",    // living with a condition
  "training",    // already active, wants more capacity
  "sport",       // plays something, or wants to again
  "later-life",  // 55+, where balance, bone health and staying mobile lead
  "desk",        // sedentary working day
  "everyday",    // available to anybody
];

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

  // ORDER IS LOAD-BEARING. Ties are broken by position, and with one
  // situation matching there are more ties than slots -- "fit something
  // in on the days I only have twenty minutes" sat 25th and therefore
  // never appeared for anybody, despite being persona 2.16's own aim.
  // Within each group, the most broadly useful aim comes first.
  list: [
    // ── Getting back to something ────────────────────────────────
    {
      id: "sport-without-flaring",
      label: "Get back to my sport without my back flaring up",
      // PERSONA 2.1, and the aim v1 did not have. Graeme, 3 Sep: "get a
      // little bit stronger so they can cope with the demands of playing
      // football or tennis, develop their core." The mind strand is
      // second because trusting the back again is usually what actually
      // stops people, not the back itself.
      // NOT tagged "managing" alone: a post-cardiac beginner was being
      // offered this because she has a condition. It is for people who
      // play something, or want to again.
      situations: ["returning", "sport", "training"],
      strands: ["back-resilience", "trusting-body", "trunk-strength", "leg-strength", "sport-specific"],
    },
    {
      id: "back-to-it",
      label: "Get back to moving after a long gap",
      situations: ["returning", "starting", "everyday"],
      strands: ["getting-going", "self-kindness", "pacing", "hip-range"],
    },
    {
      id: "after-illness",
      label: "Build back gently after being ill",
      // Persona 2.5, post-cardiac. "Gently" is in the label because the
      // fear of overdoing it is the barrier, not the exercise.
      situations: ["returning", "managing", "starting"],
      strands: ["gentle-capacity", "not-overdoing", "pacing", "keep-walking"],
    },
    {
      id: "injury-confidence",
      label: "Move without worrying I'll set something off",
      situations: ["returning", "managing"],
      strands: ["trusting-body", "not-overdoing", "getting-going", "back-resilience"],
    },

    // ── Starting, with nothing to build on ───────────────────────
    {
      id: "just-start",
      label: "Start something, and actually keep going",
      // Persona 2.12, the blank slate: no injury, no history, no goal.
      // The hardest case, because nothing else personalises for them.
      situations: ["starting", "everyday"],
      strands: ["showing-up", "getting-going", "gentle-capacity", "self-kindness"],
    },
    {
      id: "feel-at-home",
      label: "Feel more at home in my own body",
      // Persona 2.11: doesn't know how to exercise, comes through
      // mindfulness rather than the generator. A mind strand leads.
      situations: ["starting", "later-life", "everyday"],
      strands: ["at-home-in-body", "being-outside", "getting-going", "winding-down"],
    },

    // ── Daily life ───────────────────────────────────────────────
    {
      id: "floor-unaided",
      label: "Get off the floor without using my hands",
      situations: ["later-life", "starting", "everyday"],
      strands: ["hip-range", "confidence-floor", "leg-strength", "ankle-range"],
    },
    {
      id: "play-with-kids",
      label: "Get down on the floor and play, and get back up",
      situations: ["everyday", "returning"],
      strands: ["hip-range", "confidence-floor", "leg-strength", "self-kindness"],
    },
    {
      id: "stairs-easier",
      label: "Get up the stairs without stopping halfway",
      situations: ["starting", "later-life", "returning"],
      strands: ["leg-strength", "gentle-capacity", "pacing", "hip-range"],
    },
    {
      id: "carry-shopping",
      label: "Carry the shopping without my back going",
      situations: ["managing", "everyday", "later-life"],
      strands: ["hip-hinge", "trunk-strength", "back-resilience", "not-overdoing", "leg-strength"],
    },
    {
      id: "lift-grandchild",
      label: "Pick up somebody I love without worrying about it",
      situations: ["later-life", "managing", "everyday"],
      strands: ["hip-hinge", "leg-strength", "confidence-floor", "trunk-strength"],
    },
    {
      id: "reach-overhead",
      label: "Reach the top shelf without it being a whole thing",
      situations: ["later-life", "managing", "everyday"],
      strands: ["upper-back-range", "shoulder-health", "upper-strength", "self-kindness"],
    },

    // ── Desk life ────────────────────────────────────────────────
    {
      id: "desk-comfort",
      label: "Get through a day at a desk without seizing up",
      situations: ["desk", "everyday", "starting"],
      strands: ["upper-back-range", "neck-shoulders", "winding-down", "hip-range"],
    },
    {
      id: "neck-shoulders-ease",
      label: "Stop carrying my day in my shoulders",
      situations: ["desk", "everyday"],
      strands: ["neck-shoulders", "winding-down", "shoulder-health", "upper-back-range"],
    },

    // ── Later life ───────────────────────────────────────────────
    {
      id: "keep-walking-far",
      label: "Keep walking as far as I do now",
      // Persona 2.10: frail, walks, not otherwise engaged. The aim is
      // to KEEP something, not gain it -- which is what he actually
      // wants and what almost no fitness app offers.
      // Also "starting": somebody frail and lightly active IS starting,
      // and tagging only later-life left persona 2.10 ranked below eight
      // aims that matched two situations — including getting off the
      // floor unaided, which is not what he asked for.
      situations: ["later-life", "starting", "managing", "everyday"],
      strands: ["keep-walking", "balance", "leg-strength", "being-outside"],
    },
    {
      id: "steady-on-feet",
      label: "Feel steadier on my feet",
      situations: ["later-life", "managing", "returning"],
      strands: ["balance", "ankle-range", "confidence-floor", "leg-strength"],
    },
    {
      id: "stay-independent",
      label: "Keep doing things for myself",
      situations: ["later-life", "managing"],
      strands: ["leg-strength", "balance", "confidence-floor", "trusting-body"],
    },

    // ── Already training ─────────────────────────────────────────
    {
      id: "fit-it-in",
      label: "Fit something in on the days I only have twenty minutes",
      // Persona 2.16: time-poor parent, not injured, not interested in
      // mindfulness, just starved of time.
      situations: ["training", "desk", "everyday"],
      strands: ["showing-up", "pacing", "aerobic-base", "getting-going"],
    },
    {
      id: "lift-heavier",
      label: "Lift heavier than I can now",
      // Persona 2.15: gym-literate, wants numbers to move. Named plainly
      // because dressing it up would read as evasive to her.
      situations: ["training", "sport"],
      strands: ["load-tolerance", "leg-strength", "not-overdoing", "upper-strength", "trunk-strength"],
    },
    {
      id: "run-5k-nonstop",
      label: "Run 5K without stopping",
      situations: ["training", "sport", "returning"],
      strands: ["aerobic-base", "ankle-range", "pacing", "hamstring-range"],
    },
    {
      id: "run-further",
      label: "Run further than I do now, comfortably",
      situations: ["training", "sport"],
      strands: ["aerobic-base", "hamstring-range", "pacing", "ankle-range"],
    },
    {
      id: "faster",
      label: "Get faster",
      // Persona 2.3 and 2.9: national-standard sprinter, academy
      // footballer. They exist, they are in the family, and v1 offered
      // them nothing at all.
      situations: ["training", "sport"],
      strands: ["power", "leg-strength", "hip-range", "not-overdoing"],
    },
    {
      id: "match-fit",
      label: "Stay fit enough for my sport all season",
      situations: ["sport", "training"],
      strands: ["sport-specific", "aerobic-base", "not-overdoing", "load-tolerance"],
    },
    {
      id: "stronger-core",
      label: "Build a core that actually holds me up",
      situations: ["training", "managing", "sport", "desk"],
      strands: ["trunk-strength", "back-resilience", "trusting-body", "hip-hinge", "leg-strength"],
    },
    {
      id: "injury-proof",
      label: "Stop picking up the same injuries",
      situations: ["sport", "training", "managing"],
      strands: ["not-overdoing", "hip-range", "hamstring-range", "load-tolerance"],
    },

    // ── Time, energy, life ───────────────────────────────────────
    {
      id: "energy-through-day",
      label: "Have something left by the evening",
      situations: ["desk", "starting", "everyday"],
      strands: ["gentle-capacity", "winding-down", "pacing", "being-outside"],
    },
    {
      id: "sleep-better",
      label: "Wind down properly at the end of a day",
      situations: ["everyday", "desk", "managing"],
      strands: ["winding-down", "neck-shoulders", "being-outside", "self-kindness"],
    },
    {
      id: "walk-further",
      label: "Walk further than I can now",
      situations: ["starting", "later-life", "returning", "everyday"],
      strands: ["keep-walking", "being-outside", "ankle-range", "pacing"],
    },

    // ── Mind-led ─────────────────────────────────────────────────
    {
      id: "outdoors-more",
      label: "Spend more of my life outdoors",
      situations: ["everyday", "starting", "later-life"],
      strands: ["being-outside", "gentle-capacity", "ankle-range", "steadiness"],
    },
    {
      id: "meet-people-better",
      label: "Be better with the people around me",
      situations: ["everyday"],
      strands: ["meeting-people", "being-outside", "winding-down", "getting-going"],
    },
    {
      id: "steadier-in-myself",
      label: "Be steadier in myself when things shift",
      situations: ["everyday", "managing", "returning"],
      strands: ["steadiness", "self-kindness", "winding-down", "being-outside"],
    },
    {
      id: "kinder-to-myself",
      label: "Stop being so hard on myself about all this",
      // Persona 2.8: burns hot and cold, unrealistic expectations. And
      // Jess, whose documented barrier is shame mechanics rather than
      // motivation. Naming it as an aim is the product's whole thesis.
      situations: ["everyday", "starting", "returning"],
      strands: ["self-kindness", "not-overdoing", "showing-up", "pacing"],
    },
    {
      id: "flexible-again",
      label: "Feel less stiff than I do",
      situations: ["everyday", "desk", "later-life", "starting"],
      strands: ["hip-range", "hamstring-range", "at-home-in-body", "upper-back-range", "neck-shoulders"],
    },
  ],
};

/**
 * The situations a person is in, from what is already stored. Nothing
 * here is asked -- asking again for something the app holds is how a
 * nine-step flow happens.
 */
export function situationsFor(store) {
  const out      = new Set(["everyday"]);
  const level    = store.get("fitnessLevel") || store.get("lifestyle.activityLevel") || null;
  const band     = store.get("ageBand");
  const conds    = store.get("conditions") || [];
  const returning = store.get("lifestyle.returningAfter");

  if (returning)                                   out.add("returning");
  if (conds.length)                                out.add("managing");
  if (["sedentary", "light"].includes(level))      out.add("starting");
  if (["active", "very-active", "moderate"].includes(level)) out.add("training");
  if (["55-64", "65-74", "75+"].includes(band))    out.add("later-life");

  // Somebody active with a condition is usually trying to keep doing
  // their thing around it, which is a different situation from either
  // alone -- persona 2.1 sits exactly here.
  if (conds.length && ["active", "very-active", "moderate"].includes(level)) out.add("sport");

  // Desk is not stored anywhere yet. Left derivable rather than guessed:
  // the aims tagged "desk" all also carry "everyday", so nobody loses
  // them, and the tag starts working the day the field exists.
  return [...out];
}

/**
 * Aims to offer, most relevant first, capped.
 *
 * RANKS BY HOW MANY SITUATIONS MATCH, then filters -- so an aim written
 * for exactly this person's circumstances leads, and a universal one
 * fills behind it. Nothing is ever removed for age or condition: the
 * full list is one tap away and verify-aims asserts every aim stays
 * reachable.
 */
export function aimsFor(situations, limit = 8) {
  const set = new Set(situations && situations.length ? situations : ["everyday"]);

  // "everyday" DOES NOT SCORE. Counting it as a match made it worth the
  // same as "training", so a gym-four-times-a-week 25-year-old was
  // offered "carry the shopping without my back going" while "lift
  // heavier" and "get faster" never appeared at all -- they matched one
  // situation each, the same as every universal aim, and lost on list
  // order. A fallback that ranks is not a fallback.
  const score = a => (a.situations || []).filter(x => x !== "everyday" && set.has(x)).length;

  const scored = AIMS.list.map((a, i) => ({ a, i, n: score(a) }));
  const specific = scored.filter(x => x.n > 0)
                         .sort((x, y) => (y.n - x.n) || (x.i - y.i));

  // Universal aims fill any remaining slots, in list order, so somebody
  // whose situations are thin still sees a full and sensible screen
  // rather than three options and a gap.
  const filler = scored.filter(x => x.n === 0 && (x.a.situations || []).includes("everyday"));

  return [...specific, ...filler].slice(0, limit).map(x => x.a);
}

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
