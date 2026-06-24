/**
 * goals.js
 * 23 Jun 2026 v2
 *
 * Expanded goal list for onboarding and programme matching.
 * v2 replaces the original flat array with a categorised structure that:
 *   - Drives the onboarding chip grid (goals.js view)
 *   - Maps goals to suitable programmes (getProgrammesForGoals in programmes.js)
 *   - Informs coach engine about what the person is trying to achieve
 *   - Supports target capture for goals that have measurable outcomes
 *
 * Eight primary goals for programme matching (as specified in Technical Blueprint):
 *   feel-good, build-muscle, weight-loss, improve-cardio,
 *   flexibility, balance, injury-recovery, return-to-fitness
 *
 * Additional goals surface in onboarding but map to these eight for engine purposes.
 * See engineGoalId on each goal — this is what programmes.suitableFor uses.
 *
 * Used by:
 *   onboarding/goals.js   — chip grid display, multi-select, writes to store.goals[]
 *   programmes.js         — getProgrammesForGoals() matching
 *   workoutGenerator.js   — goal-connection rationale line
 *   coach-proposal.js     — door framing goal reference
 *   progress.js           — goal display in progress view
 *
 * WCAG 2.2 AA:
 *   All chip rendering in goals.js view must use aria-pressed for toggle state.
 *   Minimum touch target 44px. Keyboard navigable. Category headings use <h3>.
 *   Icon is decorative — aria-hidden="true" on icon span.
 */

// ─── Primary engine goal IDs ───────────────────────────────────────────────────
// These are the eight goals the programme engine understands.
// All other goal IDs map to one of these via engineGoalId.

export const ENGINE_GOALS = [
  'feel-good',
  'build-muscle',
  'weight-loss',
  'improve-cardio',
  'flexibility',
  'balance',
  'injury-recovery',
  'return-to-fitness',
];

// ─── Goal categories ──────────────────────────────────────────────────────────
// Displayed in this order in the onboarding chip grid.
// Each goal: { id, label, icon, engineGoalId, hasTarget?, targetType? }

export const GOAL_CATEGORIES = [
  {
    id: 'feel-and-energy',
    label: 'Feel good and have energy',
    goals: [
      {
        id: 'feel-better',
        label: 'Feel better day to day',
        icon: '✨',
        engineGoalId: 'feel-good',
      },
      {
        id: 'more-energy',
        label: 'Have more energy',
        icon: '⚡',
        engineGoalId: 'feel-good',
      },
      {
        id: 'reduce-stress',
        label: 'Reduce stress',
        icon: '😌',
        engineGoalId: 'feel-good',
      },
      {
        id: 'improve-mood',
        label: 'Improve my mood',
        icon: '🌤️',
        engineGoalId: 'feel-good',
      },
      {
        id: 'sleep-better',
        label: 'Sleep better',
        icon: '😴',
        engineGoalId: 'feel-good',
      },
      {
        id: 'build-habit',
        label: 'Build a consistent routine',
        icon: '📅',
        engineGoalId: 'feel-good',
      },
    ],
  },

  {
    id: 'strength-fitness',
    label: 'Strength and fitness',
    goals: [
      {
        id: 'build-muscle',
        label: 'Build muscle',
        icon: '💪',
        engineGoalId: 'build-muscle',
      },
      {
        id: 'get-stronger',
        label: 'Get stronger',
        icon: '🏋️',
        engineGoalId: 'build-muscle',
      },
      {
        id: 'improve-cardio',
        label: 'Improve cardiovascular fitness',
        icon: '❤️',
        engineGoalId: 'improve-cardio',
      },
      {
        id: 'lose-weight',
        label: 'Lose weight',
        icon: '⚖️',
        engineGoalId: 'weight-loss',
        hasTarget: true,
        targetType: 'weight',
      },
      {
        id: 'tone-up',
        label: 'Tone up',
        icon: '📊',
        engineGoalId: 'build-muscle',
      },
    ],
  },

  {
    id: 'running-cardio',
    label: 'Running and cardio goals',
    goals: [
      {
        id: 'start-running',
        label: 'Start running (Couch to 5K)',
        icon: '🏃',
        engineGoalId: 'improve-cardio',
        hasTarget: true,
        targetType: 'programme',
      },
      {
        id: 'run-5k',
        label: 'Run a 5K',
        icon: '🏃',
        engineGoalId: 'improve-cardio',
        hasTarget: true,
        targetType: 'distance',
      },
      {
        id: 'run-10k',
        label: 'Run a 10K',
        icon: '🏃',
        engineGoalId: 'improve-cardio',
        hasTarget: true,
        targetType: 'distance',
      },
      {
        id: 'cycling',
        label: 'Improve cycling',
        icon: '🚴',
        engineGoalId: 'improve-cardio',
      },
      {
        id: 'swimming',
        label: 'Improve swimming',
        icon: '🏊',
        engineGoalId: 'improve-cardio',
      },
    ],
  },

  {
    id: 'mobility-recovery',
    label: 'Mobility, flexibility and recovery',
    goals: [
      {
        id: 'flexibility',
        label: 'Improve flexibility',
        icon: '🧘',
        engineGoalId: 'flexibility',
      },
      {
        id: 'balance',
        label: 'Improve balance and coordination',
        icon: '🎯',
        engineGoalId: 'balance',
      },
      {
        id: 'reduce-pain',
        label: 'Reduce pain',
        icon: '🩹',
        engineGoalId: 'injury-recovery',
      },
      {
        id: 'injury-recovery',
        label: 'Recover from an injury',
        icon: '🏥',
        engineGoalId: 'injury-recovery',
      },
      {
        id: 'prevent-injury',
        label: 'Prevent future injuries',
        icon: '🛡️',
        engineGoalId: 'flexibility',
      },
      {
        id: 'improve-posture',
        label: 'Improve posture',
        icon: '🧍',
        engineGoalId: 'flexibility',
      },
    ],
  },

  {
    id: 'returning',
    label: 'Getting back to it',
    goals: [
      {
        id: 'return-to-fitness',
        label: 'Return to fitness after a break',
        icon: '🌱',
        engineGoalId: 'return-to-fitness',
      },
      {
        id: 'return-after-illness',
        label: 'Return after illness or health issues',
        icon: '💚',
        engineGoalId: 'return-to-fitness',
      },
      {
        id: 'move-more',
        label: 'Just move more',
        icon: '🚶',
        engineGoalId: 'feel-good',
      },
      {
        id: 'enjoy-exercise',
        label: 'Actually enjoy exercise',
        icon: '😄',
        engineGoalId: 'feel-good',
      },
    ],
  },
];

// ─── Flat goal list (for direct ID lookup) ────────────────────────────────────
// See backward-compatible GOALS export at end of file.

// ─── Utility functions ────────────────────────────────────────────────────────

/**
 * Get a goal definition by ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getGoal(id) {
  return GOALS.find(g => g.id === id) || null;
}

/**
 * Get the engine goal ID for a given goal ID.
 * Used by programme matching and workout generator.
 * @param {string} goalId — onboarding goal ID
 * @returns {string} engine goal ID, defaults to 'feel-good'
 */
export function getEngineGoalId(goalId) {
  const goal = getGoal(goalId);
  return goal?.engineGoalId || 'feel-good';
}

/**
 * Convert an array of onboarding goal IDs to engine goal IDs.
 * Deduplicates — multiple surface goals may map to the same engine goal.
 * Used by programmes.js getProgrammesForGoals() and workoutGenerator.js.
 * @param {string[]} goalIds — array from store.goals
 * @returns {string[]} unique engine goal IDs
 */
export function toEngineGoals(goalIds = []) {
  const engineIds = goalIds.map(id => getEngineGoalId(id));
  return [...new Set(engineIds)];
}

/**
 * Get a human-readable label for a goal ID.
 * Safe to call with unknown IDs — returns the ID itself as fallback.
 * @param {string} goalId
 * @returns {string}
 */
export function getGoalLabel(goalId) {
  return getGoal(goalId)?.label || goalId;
}

/**
 * Get the primary display goal for the coach.
 * When a user has multiple goals, returns the most specific one
 * (injury-recovery > return-to-fitness > weight-loss > build-muscle >
 *  improve-cardio > flexibility > balance > feel-good).
 * Used by coach-proposal.js and home-threshold.js for the goal-connection line.
 * @param {string[]} goalIds — from store.goals
 * @returns {string} single engine goal ID
 */
export function getPrimaryEngineGoal(goalIds = []) {
  const engineGoals = toEngineGoals(goalIds);
  const priority = [
    'injury-recovery',
    'return-to-fitness',
    'weight-loss',
    'build-muscle',
    'improve-cardio',
    'flexibility',
    'balance',
    'feel-good',
  ];
  for (const p of priority) {
    if (engineGoals.includes(p)) return p;
  }
  return 'feel-good';
}

/**
 * Whether a goal ID requires target capture in onboarding.
 * @param {string} goalId
 * @returns {boolean}
 */
export function goalHasTarget(goalId) {
  return getGoal(goalId)?.hasTarget === true;
}

/**
 * Get the target type for a goal (if any).
 * @param {string} goalId
 * @returns {string|null} 'weight' | 'distance' | 'pace' | 'programme' | null
 */
export function getGoalTargetType(goalId) {
  return getGoal(goalId)?.targetType || null;
}

// ─── Backward-compatible exports ──────────────────────────────────────────────
// The existing js/views/goal-setup.js imports { GOALS } as a flat array.
// My v2 restructured this into GOAL_CATEGORIES. Export flat GOALS array
// so existing views continue to work without modification.

// Flat array matching the original structure
export const GOALS = GOAL_CATEGORIES.flatMap(cat =>
  cat.goals.map(g => ({
    id:          g.id,
    label:       g.label,
    icon:        g.icon,
    engineGoalId: g.engineGoalId,
    // Legacy fields some views may read
    name:        g.label,
    category:    cat.id,
  }))
);

// Legacy getProgrammesForGoals using flat goal IDs (not engine IDs)
// Kept for any view that calls it with raw goal IDs from store.goals[]
export { getProgrammesForGoals } from './programmes.js';
