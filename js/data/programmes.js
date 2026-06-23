/**
 * programmes.js
 * 23 Jun 2026 v2
 *
 * Programme template definitions. Static data — one object per 12-week plan.
 * v2 adds five missing templates to the existing three:
 *   NEW: feel-good-foundation, build, move-more, open, ground
 *   EXISTING (unchanged): beginner-fitness, couch-to-cardio, back-to-strength
 *
 * Eight programmes total — one for each engine goal:
 *   feel-good        → Feel Good Foundation
 *   build-muscle     → Build
 *   weight-loss      → Move More
 *   improve-cardio   → Couch to Cardio (existing)
 *   flexibility      → Open
 *   balance          → Ground
 *   injury-recovery  → Back to Strength (existing)
 *   return-to-fitness → Beginner Fitness (existing, reused)
 *
 * Consumed by:
 *   programmeEngine.js  — phase/week logic, re-entry, compress/extend
 *   goal-setup.js       — programme selection UI
 *   workoutGenerator.js — focus bias per phase
 *   coach-proposal.js   — goal-connection line
 *   progress.js         — programme progress display
 *
 * Phase structure (all programmes):
 *   build     — weeks 1-4:  foundation, habit, gentle progression
 *   push      — weeks 5-8:  building challenge, adding load
 *   peak      — weeks 9-10: best effort, highest intensity
 *   recovery  — weeks 11-12: consolidation, sustainable pace
 *
 * WCAG: This file contains no UI. All display of programme names,
 * descriptions, and coach messages must meet WCAG 2.2 AA in the views
 * that render them.
 */

export const PROGRAMMES = [

  // ── EXISTING PROGRAMMES (v1 — unchanged) ────────────────────────────────────

  {
    id: 'beginner-fitness',
    name: 'Build Your Base',
    tagline: 'A gentle 12-week foundation — energy, strength, and habit',
    description: 'Start where you are. No pressure, no shame. This plan builds movement into your life steadily, adapting every day to how you feel.',
    icon: '🌱',
    engineGoals: ['feel-good', 'return-to-fitness'],
    durationWeeks: 12,
    weeklySessions: 3,
    suitableFor: ['lose-weight', 'build-habit', 'more-energy', 'feel-better', 'improve-cardio'],
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
    engineGoals: ['improve-cardio'],
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
    engineGoals: ['injury-recovery'],
    durationWeeks: 12,
    weeklySessions: 3,
    suitableFor: ['reduce-pain', 'build-habit', 'more-energy', 'build-strength', 'feel-better'],
    conditionSafe: 'all',
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
  },

  // ── NEW PROGRAMMES (v2) ──────────────────────────────────────────────────────

  {
    id: 'feel-good-foundation',
    name: 'Feel Good Foundation',
    tagline: 'Mixed movement, better energy, and a habit that lasts',
    description: 'Not about hitting targets. About feeling better day to day — more energy, less stress, more like yourself. Variety every week so nothing gets stale.',
    icon: '✨',
    engineGoals: ['feel-good'],
    durationWeeks: 12,
    weeklySessions: 3,
    suitableFor: ['feel-better', 'more-energy', 'reduce-stress', 'improve-mood',
                  'sleep-better', 'build-habit', 'move-more', 'enjoy-exercise'],
    conditionSafe: 'all',
    phases: [
      {
        name: 'build',
        label: 'Finding Your Rhythm',
        weeks: [1, 2, 3, 4],
        description: 'Mixed movement to find what feels good. Variety, not volume.',
        coachMessage: 'These four weeks are about finding what movement feels like when there\'s no wrong answer. We\'re going to try a few things.',
        intensityBias: 'gentle',
        focusBias: ['mobility', 'mindfulness', 'cardio'],
        milestones: [
          { id: 'first-session',   label: 'First session — it starts here 🎉' },
          { id: 'week-4-complete', label: '4 weeks in — you found your rhythm ✓' }
        ]
      },
      {
        name: 'push',
        label: 'Building the Habit',
        weeks: [5, 6, 7, 8],
        description: 'The habit is forming. Slightly more challenge, still plenty of variety.',
        coachMessage: 'Something is shifting. It might not feel dramatic yet — but the consistency is doing its work.',
        intensityBias: 'moderate',
        focusBias: ['strength', 'cardio', 'mobility'],
        milestones: [
          { id: 'halfway',      label: 'Halfway — the habit is real now 💪' },
          { id: 'ten-sessions', label: '10 sessions — look at that ⭐'       }
        ]
      },
      {
        name: 'peak',
        label: 'Feeling It',
        weeks: [9, 10],
        description: 'These are the weeks you feel the change. Bring what you have.',
        coachMessage: 'You\'re not the same person who started week one. These weeks are about feeling that.',
        intensityBias: 'moderate',
        focusBias: ['cardio', 'strength'],
        milestones: [
          { id: 'twenty-sessions', label: '20 sessions — you built something 🔥' }
        ]
      },
      {
        name: 'recovery',
        label: 'Making It Last',
        weeks: [11, 12],
        description: 'Lighter. Quieter. Cementing what you\'ve built.',
        coachMessage: 'The goal was never 12 weeks. The goal is what comes after.',
        intensityBias: 'gentle',
        focusBias: ['mobility', 'mindfulness'],
        milestones: [
          { id: 'programme-complete', label: 'Feel Good Foundation complete 🏆' }
        ]
      }
    ]
  },

  {
    id: 'build',
    name: 'Build',
    tagline: '12 weeks of progressive strength — at your pace, with your body',
    description: 'A proper strength programme that adapts to how you feel every day. No rigid plans, no shame when life happens. Progressive overload done sensibly.',
    icon: '💪',
    engineGoals: ['build-muscle'],
    durationWeeks: 12,
    weeklySessions: 3,
    suitableFor: ['build-muscle', 'get-stronger', 'tone-up', 'lose-weight', 'functional-strength'],
    conditionSafe: 'all',
    phases: [
      {
        name: 'build',
        label: 'Foundations of Strength',
        weeks: [1, 2, 3, 4],
        description: 'Learning movement patterns. Building the base before adding load.',
        coachMessage: 'Strength takes time to build and time to express. These four weeks are about learning to move well. Everything after this gets easier when we do this right.',
        intensityBias: 'gentle',
        focusBias: ['strength', 'mobility'],
        milestones: [
          { id: 'first-session',   label: 'First strength session done 🎉' },
          { id: 'week-4-complete', label: '4 weeks — movement patterns building ✓' }
        ]
      },
      {
        name: 'push',
        label: 'Adding Load',
        weeks: [5, 6, 7, 8],
        description: 'Progressively harder. Your body has the pattern — now we build on it.',
        coachMessage: 'Your body knows these movements now. Time to ask more of it.',
        intensityBias: 'moderate',
        focusBias: ['strength', 'cardio'],
        milestones: [
          { id: 'halfway',      label: 'Halfway — noticeably stronger 💪' },
          { id: 'ten-sessions', label: '10 sessions of real work ⭐'       }
        ]
      },
      {
        name: 'peak',
        label: 'Peak Load',
        weeks: [9, 10],
        description: 'Your strongest weeks. Full effort where energy allows.',
        coachMessage: 'These two weeks are the payoff. You\'ve built the base. Now we express it.',
        intensityBias: 'challenging',
        focusBias: ['strength'],
        milestones: [
          { id: 'twenty-sessions', label: '20 sessions — real strength built 🔥' }
        ]
      },
      {
        name: 'recovery',
        label: 'Consolidate',
        weeks: [11, 12],
        description: 'Slightly lighter — letting your body lock in the gains.',
        coachMessage: 'Recovery isn\'t slowing down. It\'s how strength becomes permanent.',
        intensityBias: 'moderate',
        focusBias: ['strength', 'mobility'],
        milestones: [
          { id: 'programme-complete', label: 'Build complete — 12 weeks of strength 🏆' }
        ]
      }
    ]
  },

  {
    id: 'move-more',
    name: 'Move More',
    tagline: 'Cardio-led movement with strength for lasting change',
    description: 'Built around increasing movement and energy expenditure — but never about restriction or punishment. Cardio-led, with strength woven in to support you long term.',
    icon: '⚖️',
    engineGoals: ['weight-loss'],
    durationWeeks: 12,
    weeklySessions: 3,
    suitableFor: ['lose-weight', 'improve-cardio', 'more-energy', 'build-habit', 'feel-better'],
    conditionSafe: 'all',
    phases: [
      {
        name: 'build',
        label: 'Moving More',
        weeks: [1, 2, 3, 4],
        description: 'Building the movement habit. Cardio-first, gentle strength support.',
        coachMessage: 'Moving more is the first thing. Not harder — more. These four weeks are just about showing up and moving.',
        intensityBias: 'gentle',
        focusBias: ['cardio', 'mobility'],
        milestones: [
          { id: 'first-session',   label: 'First session — movement started 🎉' },
          { id: 'week-4-complete', label: '4 weeks — the habit is forming ✓'    }
        ]
      },
      {
        name: 'push',
        label: 'Building Capacity',
        weeks: [5, 6, 7, 8],
        description: 'Longer sessions. More variety. Strength added alongside cardio.',
        coachMessage: 'Your body is adapting. Sessions can be longer and stronger now.',
        intensityBias: 'moderate',
        focusBias: ['cardio', 'strength'],
        milestones: [
          { id: 'halfway',      label: 'Halfway — energy levels changing 💪' },
          { id: 'ten-sessions', label: '10 sessions completed ⭐'             }
        ]
      },
      {
        name: 'peak',
        label: 'Peak Movement',
        weeks: [9, 10],
        description: 'Most active weeks. Full capacity, varied sessions.',
        coachMessage: 'These are your most active weeks. Your body is ready for this.',
        intensityBias: 'challenging',
        focusBias: ['cardio', 'strength'],
        milestones: [
          { id: 'twenty-sessions', label: '20 sessions — serious commitment 🔥' }
        ]
      },
      {
        name: 'recovery',
        label: 'Sustainable Pace',
        weeks: [11, 12],
        description: 'Stepping back to a pace you can maintain indefinitely.',
        coachMessage: 'The best plan is the one you can do forever. Let\'s find that pace.',
        intensityBias: 'moderate',
        focusBias: ['cardio', 'mobility'],
        milestones: [
          { id: 'programme-complete', label: 'Move More complete 🏆' }
        ]
      }
    ]
  },

  {
    id: 'open',
    name: 'Open',
    tagline: 'Flexibility, mobility and mindful movement over 12 weeks',
    description: 'Yoga, mobility work, and mindful movement — building range, ease, and body awareness. Gentle enough for any starting point, deep enough to change how you move.',
    icon: '🧘',
    engineGoals: ['flexibility'],
    durationWeeks: 12,
    weeklySessions: 3,
    suitableFor: ['flexibility', 'improve-posture', 'reduce-stress', 'prevent-injury',
                  'improve-mood', 'feel-better', 'more-energy'],
    conditionSafe: 'all',
    phases: [
      {
        name: 'build',
        label: 'Opening Up',
        weeks: [1, 2, 3, 4],
        description: 'Basic mobility work. Finding where you hold tension. Listening before pushing.',
        coachMessage: 'Flexibility isn\'t something you force. These four weeks are about listening to what\'s already there.',
        intensityBias: 'gentle',
        focusBias: ['mobility', 'mindfulness', 'yoga'],
        milestones: [
          { id: 'first-session',   label: 'First mobility session done 🎉' },
          { id: 'week-4-complete', label: '4 weeks — body is starting to open ✓' }
        ]
      },
      {
        name: 'push',
        label: 'Going Deeper',
        weeks: [5, 6, 7, 8],
        description: 'Longer holds. More complex flows. Building genuine range.',
        coachMessage: 'The range you\'ve built in weeks 1-4 is now the foundation. We can go deeper.',
        intensityBias: 'moderate',
        focusBias: ['yoga', 'mobility', 'mindfulness'],
        milestones: [
          { id: 'halfway',      label: 'Halfway — noticeably more mobile 💪' },
          { id: 'ten-sessions', label: '10 sessions — real change building ⭐' }
        ]
      },
      {
        name: 'peak',
        label: 'Full Range',
        weeks: [9, 10],
        description: 'Most demanding practice. Your body has adapted to this.',
        coachMessage: 'You\'ve earned this range. These weeks are about expressing it.',
        intensityBias: 'moderate',
        focusBias: ['yoga', 'mobility'],
        milestones: [
          { id: 'twenty-sessions', label: '20 sessions — transformed range 🔥' }
        ]
      },
      {
        name: 'recovery',
        label: 'Integrating',
        weeks: [11, 12],
        description: 'Restorative practice. Letting the body integrate all it\'s learned.',
        coachMessage: 'Yin practice. The body needs time to absorb change, not just accumulate it.',
        intensityBias: 'gentle',
        focusBias: ['yoga', 'mindfulness', 'mobility'],
        milestones: [
          { id: 'programme-complete', label: 'Open complete — 12 weeks 🏆' }
        ]
      }
    ]
  },

  {
    id: 'ground',
    name: 'Ground',
    tagline: 'Balance, stability, and coordination over 12 weeks',
    description: 'Core strength, proprioception, and body awareness — building the kind of stability that protects you in everyday life and keeps you moving well as you age.',
    icon: '🎯',
    engineGoals: ['balance'],
    durationWeeks: 12,
    weeklySessions: 3,
    suitableFor: ['balance', 'prevent-injury', 'functional-strength', 'improve-posture',
                  'reduce-pain', 'feel-better', 'more-energy'],
    conditionSafe: 'all',
    phases: [
      {
        name: 'build',
        label: 'Finding Stability',
        weeks: [1, 2, 3, 4],
        description: 'Foundation balance and core work. Learning to feel the ground.',
        coachMessage: 'Balance starts with awareness — of where your weight is, where your breath is, where your body is in space. Four weeks of that foundation.',
        intensityBias: 'gentle',
        focusBias: ['mobility', 'strength'],
        milestones: [
          { id: 'first-session',   label: 'First balance session done 🎉'       },
          { id: 'week-4-complete', label: '4 weeks — stability is building ✓'   }
        ]
      },
      {
        name: 'push',
        label: 'Building Control',
        weeks: [5, 6, 7, 8],
        description: 'Progressive balance challenges. Coordination added alongside stability.',
        coachMessage: 'Control is harder than strength. These weeks build the kind of coordination that lasts.',
        intensityBias: 'moderate',
        focusBias: ['strength', 'mobility'],
        milestones: [
          { id: 'halfway',      label: 'Halfway — noticeably more stable 💪' },
          { id: 'ten-sessions', label: '10 sessions of body awareness ⭐'     }
        ]
      },
      {
        name: 'peak',
        label: 'Full Expression',
        weeks: [9, 10],
        description: 'Most complex balance and coordination challenges.',
        coachMessage: 'Your nervous system has adapted. These weeks show you what that means.',
        intensityBias: 'moderate',
        focusBias: ['strength', 'cardio'],
        milestones: [
          { id: 'twenty-sessions', label: '20 sessions — real stability built 🔥' }
        ]
      },
      {
        name: 'recovery',
        label: 'Grounded',
        weeks: [11, 12],
        description: 'Integration and maintenance. The foundation is yours to keep.',
        coachMessage: 'This kind of stability doesn\'t go away. It\'s built into how you move now.',
        intensityBias: 'gentle',
        focusBias: ['mobility', 'mindfulness'],
        milestones: [
          { id: 'programme-complete', label: 'Ground complete — 12 weeks 🏆' }
        ]
      }
    ]
  }

];

// ─── Utility functions ─────────────────────────────────────────────────────────

/**
 * Get a programme by ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getProgramme(id) {
  return PROGRAMMES.find(p => p.id === id) || null;
}

/**
 * Get programmes suitable for a set of engine goal IDs.
 * Uses engineGoals array on each programme (not suitableFor — that's legacy).
 * Falls back to suitableFor check if engineGoals is not present.
 * Returns all programmes if no goals match — never returns empty.
 *
 * @param {string[]} engineGoalIds — from goals.js toEngineGoals()
 * @returns {Object[]}
 */
export function getProgrammesForGoals(engineGoalIds = []) {
  if (!engineGoalIds.length) return PROGRAMMES;

  const matches = PROGRAMMES.filter(p => {
    if (p.engineGoals) {
      return p.engineGoals.some(g => engineGoalIds.includes(g));
    }
    return p.suitableFor.some(g => engineGoalIds.includes(g));
  });

  return matches.length > 0 ? matches : PROGRAMMES;
}

/**
 * Get the phase object for a given week number.
 * @param {Object} programme
 * @param {number} weekNumber
 * @returns {Object|null}
 */
export function getPhaseForWeek(programme, weekNumber) {
  if (!programme) return null;
  return programme.phases.find(ph => ph.weeks.includes(weekNumber)) || programme.phases[0];
}

/**
 * Get all milestones for a programme (flattened, with phase name attached).
 * @param {Object} programme
 * @returns {Object[]}
 */
export function getAllMilestones(programme) {
  if (!programme) return [];
  return programme.phases.flatMap(ph =>
    ph.milestones.map(m => ({ ...m, phase: ph.name }))
  );
}

/**
 * Get the intensity bias string for a given week within a programme.
 * Used by workoutGenerator.js to apply phase bias to exercise selection.
 * @param {Object} programme
 * @param {number} weekNumber
 * @returns {string} 'gentle' | 'moderate' | 'challenging'
 */
export function getIntensityBiasForWeek(programme, weekNumber) {
  const phase = getPhaseForWeek(programme, weekNumber);
  return phase?.intensityBias || 'moderate';
}

/**
 * Get the focus bias array for a given week.
 * Used by workoutGenerator.js to weight exercise categories.
 * @param {Object} programme
 * @param {number} weekNumber
 * @returns {string[]}
 */
export function getFocusBiasForWeek(programme, weekNumber) {
  const phase = getPhaseForWeek(programme, weekNumber);
  return phase?.focusBias || ['strength', 'mobility'];
}
