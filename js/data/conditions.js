/**
 * conditions.js - Condition options for onboarding
 */

export const CONDITIONS = [
  { id: 'lower-back', name: 'Lower Back', icon: '🔙', area: 'back' },
  { id: 'upper-back', name: 'Upper Back / Neck', icon: '🔙', area: 'back' },
  { id: 'shoulder', name: 'Shoulder', icon: '💪', area: 'upper' },
  { id: 'hip', name: 'Hip', icon: '🦴', area: 'lower' },
  { id: 'knee', name: 'Knee', icon: '🦵', area: 'lower' },
  { id: 'ankle-foot', name: 'Ankle / Foot', icon: '🦶', area: 'lower' },
  { id: 'wrist-elbow', name: 'Wrist / Elbow', icon: '✋', area: 'upper' },
  { id: 'chronic-fatigue', name: 'Chronic fatigue', icon: '😴', area: 'general' },
  { id: 'anxiety', name: 'Anxiety / stress sensitivity', icon: '😰', area: 'general' },
  { id: 'breathing', name: 'Breathing / asthma', icon: '🌬️', area: 'general' },
  { id: 'perimenopause', name: 'Perimenopause symptoms', icon: '🌙', area: 'hormonal' },
  { id: 'menopause', name: 'Menopause symptoms', icon: '🌙', area: 'hormonal' }
];

/**
 * Get condition by ID
 */
export function getCondition(id) {
  return CONDITIONS.find(c => c.id === id);
}

/**
 * Get condition name by ID
 */
export function getConditionName(id) {
  const condition = getCondition(id);
  return condition ? condition.name : id;
}
