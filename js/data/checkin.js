/**
 * checkin.js
 * 23 Jun 2026 v2
 *
 * Check-in data layer. Feeling word bank with depth progression,
 * quadrant logic, and check-in utility functions.
 *
 * This is the DATA FILE — it exports word banks and utility functions.
 * The check-in VIEW (checkin.js in views/) is a separate file that
 * is rewritten in Build Step 8 (content gate: D2 partial).
 *
 * Feeling word depth levels (1-5):
 *   Depth 1 — universal, simple, accessible to all users from session one.
 *             Nobody is excluded by vocabulary.
 *   Depth 2 — slightly more specific. Available from session 3.
 *   Depth 3 — emotionally precise. Available from session 8.
 *   Depth 4 — nuanced, somatic, or psychological language.
 *             Available from session 16.
 *   Depth 5 — granular emotional vocabulary. High emotional literacy.
 *             Available from session 30.
 *
 * Depth progression follows mindfulPromptDepth in store (shared depth counter).
 * In practice, most beta users will operate at depth 1-2 for their first weeks.
 *
 * Quadrant labels (Mood Meter model — Brackett / Yale RULER):
 *   high-energy-pleasant   — high energy + high mood (6+/6+)
 *   high-energy-unpleasant — high energy + low mood (6+/5-)
 *   low-energy-pleasant    — low energy + high mood (5-/6+)
 *   low-energy-unpleasant  — low energy + low mood (5-/5-)
 *
 * Threshold: energy ≤ 5 = low. energy ≥ 6 = high.
 *            mood ≤ 5 = low (unpleasant). mood ≥ 6 = high (pleasant).
 *
 * Used by:
 *   js/views/checkin.js      — word chip rendering (Step 8 rewrite)
 *   js/views/checkin-mini.js — subset for quick check-in
 *   coach-voice.js           — coach responds to the word, not the number
 *   coach-proposal.js        — proposal weaves feeling word into framing
 *   js/views/reflect.js      — post-session reflection references word
 *
 * WCAG 2.2 AA:
 *   Word chips are a radiogroup. aria-pressed on each chip.
 *   "Can't find a word today" is a visible button, equal visual weight.
 *   Quadrant is never communicated by colour alone — label text always present.
 *   Touch targets 44px minimum. "More words" is a disclosure button with
 *   aria-expanded="false/true".
 */

// ─── Quadrant derivation ──────────────────────────────────────────────────────

/**
 * Derive the feeling word quadrant from energy and mood scores.
 * Threshold: 5 and below = low. 6 and above = high.
 *
 * @param {number} energy — 1-10 from check-in slider
 * @param {number} mood   — 1-10 from check-in slider
 * @returns {string} quadrant ID
 */
export function getQuadrant(energy, mood) {
  const highEnergy  = energy >= 6;
  const highMood    = mood   >= 6;

  if (highEnergy  && highMood)  return 'high-energy-pleasant';
  if (highEnergy  && !highMood) return 'high-energy-unpleasant';
  if (!highEnergy && highMood)  return 'low-energy-pleasant';
  return 'low-energy-unpleasant';
}

// ─── Feeling word bank ────────────────────────────────────────────────────────
// Each word: { word, quadrant, depth, coreWord? }
// coreWord: true = always shown. false/absent = in "More words" expansion.
// Ordered within each quadrant by depth, then by how commonly the word is used.
//
// Language sources: RULER programme (Brackett), somatic and body-based vocabulary,
// neurodivergent community language, plain English equivalents throughout.
// No clinical terms without a plain English word at a lower depth.

export const FEELING_WORDS = [

  // ── High energy, pleasant ─────────────────────────────────────────────────
  // High energy + high mood: motivated, excited, capable. Full programme.

  { word: 'ready',       quadrant: 'high-energy-pleasant', depth: 1, coreWord: true  },
  { word: 'good',        quadrant: 'high-energy-pleasant', depth: 1, coreWord: true  },
  { word: 'motivated',   quadrant: 'high-energy-pleasant', depth: 1, coreWord: true  },
  { word: 'excited',     quadrant: 'high-energy-pleasant', depth: 1, coreWord: true  },
  { word: 'happy',       quadrant: 'high-energy-pleasant', depth: 1, coreWord: true  },
  { word: 'energised',   quadrant: 'high-energy-pleasant', depth: 1, coreWord: false },
  { word: 'confident',   quadrant: 'high-energy-pleasant', depth: 2, coreWord: false },
  { word: 'strong',      quadrant: 'high-energy-pleasant', depth: 2, coreWord: false },
  { word: 'alive',       quadrant: 'high-energy-pleasant', depth: 2, coreWord: false },
  { word: 'focused',     quadrant: 'high-energy-pleasant', depth: 2, coreWord: false },
  { word: 'capable',     quadrant: 'high-energy-pleasant', depth: 2, coreWord: false },
  { word: 'optimistic',  quadrant: 'high-energy-pleasant', depth: 3, coreWord: false },
  { word: 'enthusiastic',quadrant: 'high-energy-pleasant', depth: 3, coreWord: false },
  { word: 'determined',  quadrant: 'high-energy-pleasant', depth: 3, coreWord: false },
  { word: 'inspired',    quadrant: 'high-energy-pleasant', depth: 3, coreWord: false },
  { word: 'purposeful',  quadrant: 'high-energy-pleasant', depth: 4, coreWord: false },
  { word: 'vibrant',     quadrant: 'high-energy-pleasant', depth: 4, coreWord: false },
  { word: 'expansive',   quadrant: 'high-energy-pleasant', depth: 5, coreWord: false },
  { word: 'joyful',      quadrant: 'high-energy-pleasant', depth: 5, coreWord: false },

  // ── High energy, unpleasant ───────────────────────────────────────────────
  // High energy + low mood: wired, tense, anxious. Stress-relief movement.

  { word: 'anxious',     quadrant: 'high-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'stressed',    quadrant: 'high-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'tense',       quadrant: 'high-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'frustrated',  quadrant: 'high-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'wired',       quadrant: 'high-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'restless',    quadrant: 'high-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'irritable',   quadrant: 'high-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'overwhelmed', quadrant: 'high-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'agitated',    quadrant: 'high-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'on edge',     quadrant: 'high-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'rushed',      quadrant: 'high-energy-unpleasant', depth: 3, coreWord: false },
  { word: 'scattered',   quadrant: 'high-energy-unpleasant', depth: 3, coreWord: false },
  { word: 'dysregulated',quadrant: 'high-energy-unpleasant', depth: 3, coreWord: false }, // neurodivergent community
  { word: 'panicked',    quadrant: 'high-energy-unpleasant', depth: 3, coreWord: false },
  { word: 'unsettled',   quadrant: 'high-energy-unpleasant', depth: 4, coreWord: false },
  { word: 'hypervigilant',quadrant:'high-energy-unpleasant', depth: 4, coreWord: false },
  { word: 'perseverating',quadrant:'high-energy-unpleasant', depth: 5, coreWord: false }, // ADHD community
  { word: 'activated',   quadrant: 'high-energy-unpleasant', depth: 5, coreWord: false },

  // ── Low energy, pleasant ──────────────────────────────────────────────────
  // Low energy + high mood: calm, content, restored. Light, enjoyable movement.

  { word: 'calm',        quadrant: 'low-energy-pleasant', depth: 1, coreWord: true  },
  { word: 'okay',        quadrant: 'low-energy-pleasant', depth: 1, coreWord: true  },
  { word: 'peaceful',    quadrant: 'low-energy-pleasant', depth: 1, coreWord: true  },
  { word: 'content',     quadrant: 'low-energy-pleasant', depth: 1, coreWord: true  },
  { word: 'settled',     quadrant: 'low-energy-pleasant', depth: 1, coreWord: true  },
  { word: 'relaxed',     quadrant: 'low-energy-pleasant', depth: 2, coreWord: false },
  { word: 'gentle',      quadrant: 'low-energy-pleasant', depth: 2, coreWord: false },
  { word: 'grateful',    quadrant: 'low-energy-pleasant', depth: 2, coreWord: false },
  { word: 'soft',        quadrant: 'low-energy-pleasant', depth: 2, coreWord: false },
  { word: 'at ease',     quadrant: 'low-energy-pleasant', depth: 3, coreWord: false },
  { word: 'restored',    quadrant: 'low-energy-pleasant', depth: 3, coreWord: false },
  { word: 'receptive',   quadrant: 'low-energy-pleasant', depth: 3, coreWord: false },
  { word: 'present',     quadrant: 'low-energy-pleasant', depth: 3, coreWord: false },
  { word: 'grounded',    quadrant: 'low-energy-pleasant', depth: 4, coreWord: false },
  { word: 'contemplative',quadrant:'low-energy-pleasant', depth: 4, coreWord: false },
  { word: 'tender',      quadrant: 'low-energy-pleasant', depth: 4, coreWord: false },
  { word: 'spacious',    quadrant: 'low-energy-pleasant', depth: 5, coreWord: false },
  { word: 'equanimous',  quadrant: 'low-energy-pleasant', depth: 5, coreWord: false },

  // ── Low energy, unpleasant ────────────────────────────────────────────────
  // Low energy + low mood: drained, heavy, flat. Breathing, light mobility.
  // Coach language explicitly validates this state.

  { word: 'tired',       quadrant: 'low-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'flat',        quadrant: 'low-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'heavy',       quadrant: 'low-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'drained',     quadrant: 'low-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'sad',         quadrant: 'low-energy-unpleasant', depth: 1, coreWord: true  },
  { word: 'foggy',       quadrant: 'low-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'low',         quadrant: 'low-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'exhausted',   quadrant: 'low-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'empty',       quadrant: 'low-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'lonely',      quadrant: 'low-energy-unpleasant', depth: 2, coreWord: false },
  { word: 'defeated',    quadrant: 'low-energy-unpleasant', depth: 3, coreWord: false },
  { word: 'disconnected',quadrant: 'low-energy-unpleasant', depth: 3, coreWord: false },
  { word: 'numb',        quadrant: 'low-energy-unpleasant', depth: 3, coreWord: false }, // also in safeguarding — handled by signal-words.js
  { word: 'depleted',    quadrant: 'low-energy-unpleasant', depth: 3, coreWord: false },
  { word: 'withdrawn',   quadrant: 'low-energy-unpleasant', depth: 3, coreWord: false },
  { word: 'despondent',  quadrant: 'low-energy-unpleasant', depth: 4, coreWord: false },
  { word: 'collapsed',   quadrant: 'low-energy-unpleasant', depth: 4, coreWord: false }, // somatic/burnout language
  { word: 'dissociated', quadrant: 'low-energy-unpleasant', depth: 4, coreWord: false }, // neurodivergent community
  { word: 'hopeless',    quadrant: 'low-energy-unpleasant', depth: 4, coreWord: false }, // safeguarding trigger — see signal-words.js
  { word: 'bereft',      quadrant: 'low-energy-unpleasant', depth: 5, coreWord: false },
  { word: 'leaden',      quadrant: 'low-energy-unpleasant', depth: 5, coreWord: false }, // somatic fatigue vocabulary
];

// ─── Word access functions ────────────────────────────────────────────────────

/**
 * Get feeling words for a quadrant, filtered by the user's current depth level.
 * Returns core words plus any non-core words up to the depth ceiling.
 *
 * @param {string} quadrant   — from getQuadrant()
 * @param {number} depthLevel — 1-5, from store.mindfulPromptDepth
 * @returns {{ core: Object[], expanded: Object[] }}
 *   core    — always shown (coreWord: true, depth ≤ depthLevel)
 *   expanded — shown in "More words" disclosure (coreWord: false, depth ≤ depthLevel)
 */
export function getWordsForQuadrant(quadrant, depthLevel = 1) {
  const available = FEELING_WORDS.filter(
    w => w.quadrant === quadrant && w.depth <= depthLevel
  );

  return {
    core:     available.filter(w => w.coreWord),
    expanded: available.filter(w => !w.coreWord),
  };
}

/**
 * Get a single word object by word string (case-insensitive).
 * @param {string} word
 * @returns {Object|null}
 */
export function getWordObject(word) {
  if (!word) return null;
  return FEELING_WORDS.find(
    w => w.word.toLowerCase() === word.toLowerCase()
  ) || null;
}

/**
 * Get the quadrant for a specific feeling word.
 * Used by coach-proposal.js when reading feelingWord from store.
 * @param {string} word
 * @returns {string|null} quadrant ID or null if word not found
 */
export function getQuadrantForWord(word) {
  return getWordObject(word)?.quadrant || null;
}

// ─── Check-in session utilities ───────────────────────────────────────────────

/**
 * Get the coach's posture for a given quadrant.
 * Used by coach-proposal.js and checkin.js to select appropriate
 * coaching language and session intensity.
 *
 * @param {string} quadrant
 * @returns {Object} { intensity, focus[], coachPosture }
 */
export function getCoachPostureForQuadrant(quadrant) {
  const postures = {
    'high-energy-pleasant': {
      intensity:    'full',
      focus:        ['strength', 'cardio', 'sport'],
      coachPosture: 'Full programme appropriate. The only state in which higher intensity is right. Celebrate the energy.',
    },
    'high-energy-unpleasant': {
      intensity:    'moderate',
      focus:        ['cardio', 'rhythmic', 'breathwork'],
      coachPosture: 'Stress-relief movement. Cardio and rhythmic exercise that processes the state through the body. Acknowledge the tension.',
    },
    'low-energy-pleasant': {
      intensity:    'light',
      focus:        ['mobility', 'yoga', 'breathwork', 'walking'],
      coachPosture: 'Light, enjoyable activity. Short duration, pleasurable movement. Match the calm.',
    },
    'low-energy-unpleasant': {
      intensity:    'gentle',
      focus:        ['breathing', 'mobility', 'restoration'],
      coachPosture: 'Breathing, light mobility only. Coach language explicitly validates the state. No pushing. Presence over performance.',
    },
  };

  return postures[quadrant] || postures['low-energy-unpleasant'];
}

/**
 * Determine the opening mode for the check-in conversation engine.
 * Six modes — selected by check-in opening engine in checkin.js (Step 8).
 * Returns the mode string for use in checkin.openingModeHistory.
 *
 * Modes (defined here for reference — logic lives in checkin.js view):
 *   standard     — default; coach opens with energy question
 *   reflection   — opens with reference to last session; uses activityLog
 *   milestone    — opens acknowledging a milestone; uses activeProgramme.milestones
 *   return       — opens warmly after a gap; uses checkinHistory date delta
 *   progress     — opens referencing recent progress signal; uses journalEntries
 *   care         — opens gently after low scores; uses checkinHistory recent mood
 *
 * @returns {string[]} all valid opening mode IDs
 */
export function getOpeningModes() {
  return ['standard', 'reflection', 'milestone', 'return', 'progress', 'care'];
}

// ─── Burnout detection ────────────────────────────────────────────────────────

/**
 * Detect burnout pattern from check-in history.
 * Called by coach-proposal.js buildProposal().
 * Burnout = energy average ≤ 4 across last 5 check-ins with 3+ available.
 *
 * @param {Object} checkinHistory — from store.checkinHistory
 * @returns {boolean}
 */
export function detectBurnout(checkinHistory) {
  if (!checkinHistory || typeof checkinHistory !== 'object') return false;

  const dates = Object.keys(checkinHistory).sort().slice(-7); // last 7 days
  if (dates.length < 3) return false;

  const last5 = dates.slice(-5);
  const energyValues = last5
    .map(d => checkinHistory[d]?.energy)
    .filter(v => typeof v === 'number');

  if (energyValues.length < 3) return false;

  const avg = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
  return avg <= 4;
}

// Compatibility export — expected by js/views/checkin.js
// Maps to the new named exports
export const checkinData = {
  FEELING_WORDS,
  getQuadrant,
  getWordsForQuadrant,
  getWordObject,
  getQuadrantForWord,
  getCoachPostureForQuadrant,
  getOpeningModes,
  detectBurnout,
};
