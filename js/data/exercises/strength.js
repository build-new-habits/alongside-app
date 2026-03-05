/**
 * data/exercises/strength.js
 * Strength exercises — bodyweight, dumbbell, kettlebell, core
 */

export const STRENGTH = [

  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: [],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet flat on floor hip-width apart',
      'Press feet into floor and squeeze glutes',
      'Lift hips until body forms a straight line from shoulders to knees',
      'Hold 2 seconds at top, then lower slowly',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'Squeeze your glutes at the top - don\'t just push with your heels.',
    why: 'Activates and strengthens glutes, which support the lower back and improve movement.',
    credits: 45
  },

  {
    id: 'bird-dog',
    name: 'Bird Dog',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'lower-back', 'glutes'],
    contraindications: [],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Start on hands and knees, wrists under shoulders, knees under hips',
      'Engage your core gently - spine neutral',
      'Slowly extend right arm forward and left leg back simultaneously',
      'Hold 3 seconds, keeping hips level',
      'Return to start and switch sides',
      'Complete 10 reps each side'
    ],
    coaching: 'Imagine a glass of water on your lower back - don\'t spill it.',
    why: 'Builds core stability and coordination without loading the spine.',
    credits: 45
  },

  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'abdominals'],
    contraindications: [],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, arms pointing to ceiling, knees bent at 90° in the air',
      'Press your lower back firmly into the floor - keep it there',
      'Slowly lower your right arm and left leg toward the floor simultaneously',
      'Stop just before your back lifts off the floor',
      'Return to start and switch sides',
      'Complete 8 reps each side'
    ],
    coaching: 'The lower back must stay flat. Smaller movement is better than losing that contact.',
    why: 'Trains deep core stability - the foundation for all other movements.',
    credits: 50
  },

  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    category: 'strength',
    movementPattern: 'squat',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['quadriceps', 'glutes', 'hip-flexor'],
    contraindications: ['knee-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Hold a dumbbell vertically at your chest with both hands',
      'Stand feet shoulder-width apart, toes turned out slightly',
      'Push your knees out as you sit down into a squat',
      'Keep your chest tall and elbows inside your knees at the bottom',
      'Drive through your heels to stand',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'The weight at your chest helps you stay upright - use it.',
    why: 'The goblet position naturally teaches good squat form and builds leg strength.',
    credits: 60
  },

  {
    id: 'push-up',
    name: 'Press-Up',
    category: 'strength',
    movementPattern: 'push',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Start in a plank: hands slightly wider than shoulders, body in a straight line',
      'Lower your chest to the floor, keeping elbows at about 45° from your body',
      'Keep your core tight and hips level throughout',
      'Push back up to the start position',
      'For an easier option, drop to your knees',
      'Complete 3 sets of 8-12 reps'
    ],
    coaching: 'Elbows at 45° protects your shoulders - not flared out wide.',
    why: 'Builds chest, shoulder and tricep strength using just your bodyweight.',
    credits: 60
  },

  {
    id: 'dumbbell-row',
    name: 'Dumbbell Row',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'biceps-triceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Place your right hand and knee on a bench or chair for support',
      'Hold a dumbbell in your left hand, arm hanging down',
      'Pull the dumbbell up toward your hip, leading with your elbow',
      'Keep your back flat and parallel to the floor',
      'Lower slowly and repeat',
      'Complete 3 sets of 10 reps each side'
    ],
    coaching: 'Think about driving your elbow to the ceiling, not curling the weight up.',
    why: 'Builds upper back strength which counteracts the forward posture from sitting.',
    credits: 60
  },

  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 6,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart, holding dumbbells in front of your thighs',
      'Hinge at your hips, pushing them back as you lower the weights',
      'Keep your back flat and the weights close to your legs',
      'Lower until you feel a stretch in your hamstrings - usually mid-shin',
      'Drive hips forward to return to standing',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'This is a hip hinge, not a squat - your knees stay almost straight.',
    why: 'Strengthens the posterior chain - hamstrings, glutes and back - all in one movement.',
    credits: 65
  },

  {
    id: 'plank',
    name: 'Plank',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'abdominals', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 4,
    duration: 60,
    perSide: false,
    instructions: [
      'Place forearms on the floor, elbows under shoulders',
      'Extend legs back, toes on floor',
      'Lift hips to form a straight line from head to heels',
      'Engage your core, squeeze your glutes',
      'Hold for 20-30 seconds to start, building over time',
      'Lower with control'
    ],
    coaching: 'Don\'t let your hips sag or pike up - a straight line is the goal.',
    why: 'The foundation of core stability - protects the spine in all other movements.',
    credits: 45
  },

  {
    id: 'clamshell',
    name: 'Clamshell',
    category: 'strength',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie on your side, hips stacked, knees bent at 45°',
      'Keep your feet together throughout',
      'Rotate your top knee open toward the ceiling, like a clamshell opening',
      'Keep your hips from rolling back',
      'Lower slowly and repeat',
      'Complete 15 reps each side'
    ],
    coaching: 'The movement is small - quality matters more than range. If you feel it in your hip, you\'re doing it right.',
    why: 'Activates the gluteus medius - essential for knee and hip stability.',
    credits: 35
  },

  {
    id: 'reverse-lunge',
    name: 'Reverse Lunge',
    category: 'strength',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['quadriceps', 'glutes', 'hamstring'],
    contraindications: ['knee-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand tall, feet together',
      'Step your right foot straight back, lowering your back knee toward the floor',
      'Keep your front shin vertical and torso upright',
      'Push through your front heel to return to standing',
      'Alternate legs or complete all reps on one side before switching',
      'Complete 3 sets of 10 reps each leg'
    ],
    coaching: 'Stepping back is gentler on the knee than stepping forward - good for most knee conditions.',
    why: 'Builds single-leg strength and balance with less knee stress than a forward lunge.',
    credits: 55
  }

];
