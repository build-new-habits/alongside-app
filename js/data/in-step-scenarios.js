/**
 * js/data/in-step-scenarios.js
 * 09 Aug 2026 v1
 *
 * "In Step" — Noticing Hub feature, Personal tier.
 *
 * Content spec agreed in PM chat, 09 Aug 2026 (session: In Step concept
 * development). Practice-based extension of the empathy transfer arc —
 * where the existing five-stage prompt library (js/data/ empathy transfer,
 * see reflect.js) fires unprompted during the session flow, In Step is
 * the place a person visits on their own terms.
 *
 * FOUR MOVEMENTS (deliberately not "territories" — that word is already
 * used by onboarding's primaryTerritory/hardBeforeSelections concept,
 * which is unrelated. Keeping these namespaces visibly distinct):
 *   solo        — inward, the person's own patterns
 *   partner     — close relationships, people nearest to them
 *   floor       — strangers, the wider crowd
 *   environment — the uncontrollable world: weather, chance, circumstance
 *
 * MECHANIC (per spec, non-negotiable):
 *   - One scenario, three lateral response options. Never ranked. Order
 *     rotated at render time (see in-step.js), not fixed here.
 *   - No "correct" option. All three are philosophically valid; which
 *     one a person reaches for is allowed to shift over time without
 *     the product ever scoring, ranking, or naming that shift back to
 *     them. See choiceLog handling in in-step.js / store.js — aggregate
 *     research signal only, never surfaced, never read by coach logic.
 *   - Acknowledgement line is identical regardless of which option was
 *     picked. Evaluating the choice, even gently, reintroduces the
 *     comparison risk this feature was explicitly redesigned to avoid.
 *   - "Learn why" is closed by default, cites real research, and stays
 *     general — it explains the idea behind the movement, never comments
 *     on the specific option chosen.
 *
 * Each option carries a `tag` — a single-word aggregate-only label
 * (e.g. "recognise-self", "recognise-other", "release") used solely for
 * later cohort-level pattern reporting (PM chat, 09 Aug 2026: "proof of
 * concept... aggregate, never individual, never fed back to the coach").
 * Never render `tag` in any UI. Never let it change what a user is
 * offered next.
 */

export const MOVEMENTS = [
  {
    id: "solo",
    name: "Solo",
    icon: "🪞",
    tagline: "Your own patterns.",
    acknowledgement:
      "However that landed, this is the whole of the practice — noticing was the point, not getting somewhere.",
    learnWhy:
      "Zhang et al. (2025) found that self-compassion — meeting yourself with the same warmth you'd offer someone else — predicts stronger intrinsic motivation than self-criticism does. Noticing without judging isn't a soft option. It's the mechanism.",
    scenarios: [
      {
        id: "solo-1",
        text: "You skipped the session you'd planned today. Not because anything went wrong — you just didn't feel like it.",
        options: [
          { id: "a", label: "Notice it, and leave it there.", tag: "accept" },
          { id: "b", label: "Get curious about what actually got in the way.", tag: "curious" },
          { id: "c", label: "Do something small instead, just to keep the thread going.", tag: "act" }
        ]
      },
      {
        id: "solo-2",
        text: "You caught yourself being harsher with yourself today than you'd ever be with someone else.",
        options: [
          { id: "a", label: "Notice the double standard, nothing more.", tag: "notice" },
          { id: "b", label: "Ask what you'd actually say to a friend in this spot.", tag: "reframe" },
          { id: "c", label: "Let the moment pass without dwelling on it.", tag: "release" }
        ]
      },
      {
        id: "solo-3",
        text: "Today went well, and for a second you felt proud — then you talked yourself out of it.",
        options: [
          { id: "a", label: "Let the pride sit a moment longer, even if it's uncomfortable.", tag: "hold" },
          { id: "b", label: "Name specifically what you did that earned it.", tag: "specify" },
          { id: "c", label: "Move on. The moment's already passed.", tag: "release" }
        ]
      },
      {
        id: "solo-4",
        text: "You had every reason to stop today, and you didn't. Nobody saw it happen.",
        options: [
          { id: "a", label: "Notice the decision, quietly.", tag: "notice" },
          { id: "b", label: "Think about what made the difference today versus other days.", tag: "examine" },
          { id: "c", label: "Let it be ordinary. Not everything needs marking.", tag: "normalise" }
        ]
      }
    ]
  },
  {
    id: "partner",
    name: "Partner",
    icon: "🤝",
    tagline: "The people nearest to you.",
    acknowledgement:
      "There's no better answer here. Different ways of meeting someone else's moment, that's all.",
    learnWhy:
      "Batson's empathy-altruism research (1987) found that deliberately imagining another person's perspective increases genuine concern for them more reliably than simply imagining how you'd feel in their position. The distinction between \"what would I feel\" and \"what might they be feeling\" is doing real work.",
    scenarios: [
      {
        id: "partner-1",
        text: "A friend cancels on you last-minute, again. You can feel the day quietly reorganising itself in your head.",
        options: [
          { id: "a", label: "Let it go, no comment.", tag: "release" },
          { id: "b", label: "Notice what might actually be going on for them.", tag: "recognise-other" },
          { id: "c", label: "Notice what you're feeling before you decide how to respond.", tag: "recognise-self" }
        ]
      },
      {
        id: "partner-2",
        text: "Someone close to you is short with you, for no obvious reason.",
        options: [
          { id: "a", label: "Take it at face value and move on.", tag: "release" },
          { id: "b", label: "Wonder what might be sitting underneath it for them.", tag: "recognise-other" },
          { id: "c", label: "Ask them directly what's going on.", tag: "engage" }
        ]
      },
      {
        id: "partner-3",
        text: "A family member brings up the same worry again — you've heard this one a few times now.",
        options: [
          { id: "a", label: "Answer it the way you have before.", tag: "consistent" },
          { id: "b", label: "Notice that repetition is often what worry sounds like.", tag: "recognise-other" },
          { id: "c", label: "Say plainly that you've noticed they're carrying this.", tag: "name-it" }
        ]
      },
      {
        id: "partner-4",
        text: "Someone you care about achieves something you've wanted for yourself.",
        options: [
          { id: "a", label: "Notice the mixed feeling honestly, without judging it.", tag: "recognise-self" },
          { id: "b", label: "Focus on what this means for them, not you.", tag: "recognise-other" },
          { id: "c", label: "Let both feelings exist at once.", tag: "hold-both" }
        ]
      }
    ]
  },
  {
    id: "floor",
    name: "Floor",
    icon: "🏙️",
    tagline: "Strangers. The wider crowd.",
    acknowledgement:
      "All three are real responses. What matters is noticing there was a choice at all.",
    learnWhy:
      "Decety's neuroimaging research (2011) found that empathy for people outside our immediate circle draws on the same neural systems as empathy for people we already know — a capacity that generalises, not a separate skill reserved for strangers. Practising it in small, low-stakes moments is how it extends.",
    scenarios: [
      {
        id: "floor-1",
        text: "Someone snaps at a shop worker in the queue ahead of you.",
        options: [
          { id: "a", label: "Notice your own reaction to watching it.", tag: "recognise-self" },
          { id: "b", label: "Wonder what kind of day led to that.", tag: "recognise-other" },
          { id: "c", label: "Let it pass. No read needed.", tag: "release" }
        ]
      },
      {
        id: "floor-2",
        text: "Someone cuts in ahead of you in traffic, badly.",
        options: [
          { id: "a", label: "Feel the flash of annoyance, and let it be brief.", tag: "recognise-self" },
          { id: "b", label: "Consider they might not have seen you, or might be having a rough day.", tag: "recognise-other" },
          { id: "c", label: "Let it go entirely. No story attached.", tag: "release" }
        ]
      },
      {
        id: "floor-3",
        text: "A stranger online says something you disagree with, sharply.",
        options: [
          { id: "a", label: "Notice your own charge before responding.", tag: "recognise-self" },
          { id: "b", label: "Consider what experience might sit behind their certainty.", tag: "recognise-other" },
          { id: "c", label: "Scroll on. Not every charge needs closing.", tag: "release" }
        ]
      },
      {
        id: "floor-4",
        text: "You see someone struggling to carry something heavy, and you're not sure if they want help.",
        options: [
          { id: "a", label: "Offer, and let them decide.", tag: "engage" },
          { id: "b", label: "Notice the hesitation in yourself before deciding.", tag: "recognise-self" },
          { id: "c", label: "Walk on. Not every moment is yours to enter.", tag: "release" }
        ]
      }
    ]
  },
  {
    id: "environment",
    name: "Environment",
    icon: "🌦️",
    tagline: "The world that doesn't consult you.",
    acknowledgement:
      "None of these is the right one. Learning you have options, even here, is what this is for.",
    learnWhy:
      "Plumbly's work (2024) on nervous system regulation describes adapting to what's outside your control as a trainable state, not a fixed trait. Practising flexibility with small disruptions — weather, timing, plans changing without your consent — builds the same capacity larger disruptions ask for.",
    scenarios: [
      {
        id: "environment-1",
        text: "The forecast turns and the plan you'd built your day around isn't happening.",
        options: [
          { id: "a", label: "Notice it as one more thing not going your way.", tag: "resist" },
          { id: "b", label: "Notice how fast you can actually adjust when it's not your choice.", tag: "adapt" },
          { id: "c", label: "Look for what the change makes possible instead.", tag: "reframe" }
        ]
      },
      {
        id: "environment-2",
        text: "You're outside and the weather turns rough before you're ready for it.",
        options: [
          { id: "a", label: "Push through it as planned.", tag: "persist" },
          { id: "b", label: "Let the plan change with the conditions.", tag: "adapt" },
          { id: "c", label: "Notice what your body actually needs right now.", tag: "recognise-self" }
        ]
      },
      {
        id: "environment-3",
        text: "The season is shifting and your energy has changed with it, without your permission.",
        options: [
          { id: "a", label: "Resist it and expect the old rhythm back.", tag: "resist" },
          { id: "b", label: "Let the new rhythm be information, not a problem.", tag: "adapt" },
          { id: "c", label: "Notice what this season has always asked of you before.", tag: "reflect" }
        ]
      },
      {
        id: "environment-4",
        text: "Something outside your control disrupts a plan you'd been looking forward to for a while.",
        options: [
          { id: "a", label: "Feel the disappointment fully before moving on.", tag: "recognise-self" },
          { id: "b", label: "Look for the version of today that's still available.", tag: "reframe" },
          { id: "c", label: "Let it be simply disappointing. Nothing here needs fixing.", tag: "accept" }
        ]
      }
    ]
  }
];

/**
 * Returns the movement object for a given id, or null.
 */
export function getMovement(movementId) {
  return MOVEMENTS.find(m => m.id === movementId) || null;
}

/**
 * Returns the next scenario for a movement, cycling through its pool.
 * `index` is the movement's current position (inStepProgress.scenarioIndex),
 * wrapped with modulo so v1's four-scenario pool repeats rather than
 * running out — content depth is a deliberate later expansion, not a bug.
 */
export function getScenario(movementId, index) {
  const movement = getMovement(movementId);
  if (!movement) return null;
  const i = ((index % movement.scenarios.length) + movement.scenarios.length) % movement.scenarios.length;
  return movement.scenarios[i];
}
