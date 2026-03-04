/**
 * programmes.js - Programme template definitions
 * Static data — one object per 12-week plan
 *
 * Consumed by:
 *   programmeEngine.js — phase/week logic
 *   goal-setup.js      — programme selection UI
 *   workoutGenerator.js — focus bias per phase
 */

export const PROGRAMMES = [
  {
    id: 'beginner-fitness',
    name: 'Build Your Base',
    tagline: 'A gentle 12-week foundation — energy, strength, and habit',
    description: 'Start where you are. No pressure, no shame. This plan builds movement into your life steadily, adapting every day to how you feel.',
    icon: '🌱',
    durationWeeks: 12,
    weeklySessions: 3,
    // Which onboarding goal IDs this programme suits
    suitableFor: ['lose-weight', 'build-habit', 'more-energy', 'feel-better', 'improve-cardio'],
    // Conditions this is safe for (all = no restrictions)
    conditionSafe: 'all',
    phases: [
      {
        name: 'build',
        label: 'Foundation',
        weeks: [1, 2, 3, 4],
        description: 'Establishing the movement habit. Consistency over intensity.',
        coachMessage: 'The only goal right now is showing up. Four weeks to make this feel normal.',
        intensityBias: 'gentle',
        focusBias: ['mobility', 'strength'],
        milestones: [
          { id: 'first-session',   label: 'First session complete 🎉' },
          { id: 'week-2-complete', label: '3 sessions in Week 2 ✓'   },
          { id: 'week-4-complete', label: 'Foundation phase done 🌱'  }
        ]
      },
      {
        name: 'push',
        label: 'Building',
        weeks: [5, 6, 7, 8],
        description: 'Adding challenge gradually. Your body is ready for more.',
        coachMessage: 'You have the habit. Now we build on it. Still your pace — always.',
        intensityBias: 'moderate',
        focusBias: ['strength', 'cardio'],
        milestones: [
          { id: 'halfway',      label: 'Halfway through — 6 weeks done 💪' },
          { id: 'ten-sessions', label: '10 sessions completed ⭐'           }
        ]
      },
      {
        name: 'peak',
        label: 'Peak',
        weeks: [9, 10],
        description: 'Your strongest weeks. Best effort when energy allows.',
        coachMessage: 'These are your best weeks. Push when it feels good — back off when it doesn\'t.',
        intensityBias: 'moderate',
        focusBias: ['cardio', 'strength'],
        milestones: [
          { id: 'twenty-sessions', label: '20 sessions completed 🔥' }
        ]
      },
      {
        name: 'recovery',
        label: 'Consolidate',
        weeks: [11, 12],
        description: 'Locking in the habit. Lighter, sustainable, lasting.',
        coachMessage: 'The goal now is to make this permanent. Lighter weeks, lasting change.',
        intensityBias: 'gentle',
        focusBias: ['mobility', 'strength'],
        milestones: [
          { id: 'programme-complete', label: 'Programme complete — 12 weeks! 🏆' }
        ]
      }
    ]
  },

  {
    id: 'couch-to-cardio',
    name: 'Couch to Cardio',
    tagline: '12 weeks to sustained cardiovascular fitness',
    description: 'Gradually build your stamina from scratch. No running required until you\'re ready — this is your pace, your way.',
    icon: '❤️',
    durationWeeks: 12,
    weeklySessions: 3,
    suitableFor: ['improve-cardio', 'lose-weight', 'run-5k', 'more-energy'],
    conditionSafe: 'all',
    phases: [
      {
        name: 'build',
        label: 'Getting Started',
        weeks: [1, 2, 3, 4],
        description: 'Low-impact cardio and movement. Building your aerobic base.',
        coachMessage: 'We start slow on purpose. Your cardiovascular system adapts better this way.',
        intensityBias: 'gentle',
        focusBias: ['cardio', 'mobility'],
        milestones: [
          { id: 'first-session',   label: 'First cardio session done 🎉' },
          { id: 'week-4-complete', label: '4 weeks of cardio foundation ✓' }
        ]
      },
      {
        name: 'push',
        label: 'Building Stamina',
        weeks: [5, 6, 7, 8],
        description: 'Longer sessions, more sustained effort.',
        coachMessage: 'You\'re getting fitter. Sessions feel harder because you\'re pushing further.',
        intensityBias: 'moderate',
        focusBias: ['cardio', 'strength'],
        milestones: [
          { id: 'halfway',      label: 'Halfway — stamina is building 💪' },
          { id: 'ten-sessions', label: '10 cardio sessions done ⭐'        }
        ]
      },
      {
        name: 'peak',
        label: 'Peak Effort',
        weeks: [9, 10],
        description: 'Your fittest weeks. Sustained efforts at good intensity.',
        coachMessage: 'These two weeks show how far you\'ve come. Trust the process.',
        intensityBias: 'challenging',
        focusBias: ['cardio', 'strength'],
        milestones: [
          { id: 'twenty-sessions', label: '20 sessions — serious progress 🔥' }
        ]
      },
      {
        name: 'recovery',
        label: 'Lock It In',
        weeks: [11, 12],
        description: 'Consolidating your new fitness level.',
        coachMessage: 'The fitness is yours to keep. We just make sure it sticks.',
        intensityBias: 'moderate',
        focusBias: ['cardio', 'mobility'],
        milestones: [
          { id: 'programme-complete', label: 'Couch to Cardio complete 🏆' }
        ]
      }
    ]
  },

  {
    id: 'back-to-strength',
    name: 'Back to Strength',
    tagline: 'Rebuild confidence and reduce pain over 12 weeks',
    description: 'Designed for people managing pain, injury recovery, or returning after a long break. Every session adapts to your condition report.',
    icon: '🩹',
    durationWeeks: 12,
    weeklySessions: 3,
    suitableFor: ['reduce-pain', 'build-habit', 'more-energy', 'build-strength', 'feel-better'],
    conditionSafe: 'all', // always condition-aware via filter engine
    phases: [
      {
        name: 'build',
        label: 'Gentle Start',
        weeks: [1, 2, 3, 4],
        description: 'Low intensity, high safety. Rebuilding the movement habit without flare-ups.',
        coachMessage: 'We move gently and intentionally. Pain reduction is progress, even on rest days.',
        intensityBias: 'gentle',
        focusBias: ['mobility', 'strength'],
        milestones: [
          { id: 'first-session',   label: 'First session — you showed up 🎉' },
          { id: 'week-4-complete', label: '4 weeks without pushing too hard ✓' }
        ]
      },
      {
        name: 'push',
        label: 'Building Capacity',
        weeks: [5, 6, 7, 8],
        description: 'Gradually increasing strength in safe ranges.',
        coachMessage: 'Building capacity carefully. If something hurts — we back off. Always.',
        intensityBias: 'gentle',
        focusBias: ['strength', 'mobility'],
        milestones: [
          { id: 'halfway',      label: 'Halfway — careful progress 💪' },
          { id: 'ten-sessions', label: '10 sessions — consistency is the win ⭐' }
        ]
      },
      {
        name: 'peak',
        label: 'Finding Strength',
        weeks: [9, 10],
        description: 'Stronger ranges, more confidence in your body.',
        coachMessage: 'You\'ve built something real. These weeks are about feeling what\'s changed.',
        intensityBias: 'moderate',
        focusBias: ['strength', 'cardio'],
        milestones: [
          { id: 'twenty-sessions', label: '20 sessions — real strength building 🔥' }
        ]
      },
      {
        name: 'recovery',
        label: 'Sustainable',
        weeks: [11, 12],
        description: 'Lighter load, lasting change. A sustainable movement practice.',
        coachMessage: 'This is the pace you can keep forever. That\'s the real goal.',
        intensityBias: 'gentle',
        focusBias: ['mobility', 'strength'],
        milestones: [
          { id: 'programme-complete', label: 'Back to Strength complete 🏆' }
        ]
      }
    ]
  }
];

/**
 * Get a programme by ID
 */
export function getProgramme(id) {
  return PROGRAMMES.find(p => p.id === id) || null;
}

/**
 * Get programmes suitable for a set of goal IDs
 * Returns all programmes if no goals match (never returns empty)
 */
export function getProgrammesForGoals(goalIds = []) {
  const matches = PROGRAMMES.filter(p =>
    p.suitableFor.some(g => goalIds.includes(g))
  );
  return matches.length > 0 ? matches : PROGRAMMES;
}

/**
 * Get the phase object for a given week number
 */
export function getPhaseForWeek(programme, weekNumber) {
  if (!programme) return null;
  return programme.phases.find(ph => ph.weeks.includes(weekNumber)) || programme.phases[0];
}

/**
 * Get all milestones for a programme (flattened)
 */
export function getAllMilestones(programme) {
  if (!programme) return [];
  return programme.phases.flatMap(ph =>
    ph.milestones.map(m => ({ ...m, phase: ph.name }))
  );
}
