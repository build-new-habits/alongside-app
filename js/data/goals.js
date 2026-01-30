/**
 * goals.js - Goal options for onboarding
 */

export const GOALS = [
  { id: 'lose-weight', name: 'Lose weight', icon: '⚖️', category: 'body' },
  { id: 'build-strength', name: 'Build strength', icon: '💪', category: 'fitness' },
  { id: 'improve-cardio', name: 'Improve cardio fitness', icon: '❤️', category: 'fitness' },
  { id: 'build-muscle', name: 'Build muscle', icon: '🏋️', category: 'body' },
  { id: 'improve-flexibility', name: 'Improve flexibility', icon: '🧘', category: 'mobility' },
  { id: 'reduce-pain', name: 'Reduce pain / manage injury', icon: '🩹', category: 'recovery' },
  { id: 'more-energy', name: 'Have more energy', icon: '⚡', category: 'wellbeing' },
  { id: 'reduce-stress', name: 'Reduce stress', icon: '😌', category: 'wellbeing' },
  { id: 'sleep-better', name: 'Sleep better', icon: '😴', category: 'wellbeing' },
  { id: 'build-habit', name: 'Build a consistent routine', icon: '📅', category: 'habit' },
  { id: 'run-5k', name: 'Run a 5K', icon: '🏃', category: 'cardio' },
  { id: 'feel-better', name: 'Just feel better in my body', icon: '✨', category: 'wellbeing' }
];

/**
 * Get goal by ID
 */
export function getGoal(id) {
  return GOALS.find(g => g.id === id);
}

/**
 * Get goal name by ID
 */
export function getGoalName(id) {
  const goal = getGoal(id);
  return goal ? goal.name : id;
}
