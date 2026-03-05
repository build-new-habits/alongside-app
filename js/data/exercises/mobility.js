/**
 * data/exercises/mobility.js
 * Mobility exercises — stretching, joint prep, dynamic warm-up
 */

export const MOBILITY = [

  {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    category: 'mobility',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip', 'hip-flexor', 'quadriceps'],
    contraindications: ['knee-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Kneel on your right knee, left foot forward',
      'Keep your torso upright, core engaged',
      'Gently push hips forward until you feel a stretch',
      'Hold for 30 seconds, then switch sides'
    ],
    coaching: 'Keep your back straight - don\'t lean forward. The stretch should be in the front of your hip.',
    why: 'Tight hip flexors from sitting contribute to back pain and limit mobility.',
    credits: 30
  },

  {
    id: 'cat-cow',
    name: 'Cat-Cow Stretch',
    category: 'mobility',
    movementPattern: 'spinal-flexion-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['spine', 'lower-back', 'upper-back'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Start on hands and knees, wrists under shoulders',
      'Inhale: Drop belly, lift chest and tailbone (Cow)',
      'Exhale: Round spine, tuck chin and tailbone (Cat)',
      'Move slowly with your breath for 10 cycles'
    ],
    coaching: 'Move smoothly - this is about mobilising your spine, not stretching hard.',
    why: 'Gentle spinal movement reduces stiffness and warms up the back.',
    credits: 30
  },

  {
    id: 'world-greatest-stretch',
    name: 'World\'s Greatest Stretch',
    category: 'mobility',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip', 'hip-flexor', 'thoracic', 'hamstring'],
    contraindications: ['knee-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Step into a deep lunge, right foot forward',
      'Place left hand on floor inside right foot',
      'Rotate torso, reaching right arm to ceiling',
      'Hold 3 breaths, then switch sides'
    ],
    coaching: 'Keep your back knee off the ground for more intensity, or rest it down for easier version.',
    why: 'This single movement opens hips, thoracic spine, and hip flexors efficiently.',
    credits: 40
  },

  {
    id: '90-90-hip-stretch',
    name: '90-90 Hip Stretch',
    category: 'mobility',
    movementPattern: 'hip-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip', 'glutes', 'piriformis'],
    contraindications: ['hip-acute', 'knee-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Sit with front leg bent 90° in front, back leg 90° behind',
      'Keep both knees at right angles',
      'Sit tall, then gently lean forward over front shin',
      'Hold 45 seconds each side'
    ],
    coaching: 'If this is too intense, sit on a cushion to elevate your hips.',
    why: 'Opens internal and external hip rotation - essential for healthy hips.',
    credits: 35
  },

  {
    id: 'thoracic-rotation',
    name: 'Thoracic Rotation',
    category: 'mobility',
    movementPattern: 'spinal-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['thoracic', 'upper-back'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie on your side, knees bent at 90°',
      'Extend arms in front, palms together',
      'Keeping hips still, rotate top arm open to the other side',
      'Follow your hand with your eyes',
      'Hold 2 seconds, return, repeat 10 times each side'
    ],
    coaching: 'Keep your knees stacked and hips from rolling back - the movement is just in your upper back.',
    why: 'Thoracic mobility reduces neck and shoulder tension and improves posture.',
    credits: 30
  }

];
