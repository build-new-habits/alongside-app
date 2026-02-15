/**
 * exercises.js - Exercise Database
 * Core exercise library for Alongside
 * 
 * Categories: mobility, strength, cardio, recovery
 * Each exercise includes safety filtering data
 */

export const EXERCISES = [
  
  // ============================================
  // MOBILITY EXERCISES
  // ============================================
  
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
      'Arms extended in front, palms together',
      'Keeping lower body still, rotate top arm open',
      'Follow your hand with your eyes, hold briefly, return'
    ],
    coaching: 'Keep your knees stacked and grounded - the rotation comes from your mid-back.',
    why: 'Thoracic mobility helps shoulder health and reduces lower back compensation.',
    credits: 30
  },
  
  // ============================================
  // STRENGTH EXERCISES
  // ============================================
  
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'strength',
    movementPattern: 'hip-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: [],
    energyRequired: 3,
    sets: 3,
    reps: 12,
    rest: 45,
    instructions: [
      'Lie on back, knees bent, feet flat on floor',
      'Push through heels to lift hips toward ceiling',
      'Squeeze glutes at the top, pause briefly',
      'Lower with control, repeat'
    ],
    coaching: 'Don\'t hyperextend your back - stop when your body makes a straight line.',
    why: 'Strengthens glutes which support the hips and lower back.',
    credits: 40
  },
  
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    category: 'strength',
    movementPattern: 'anti-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'lower-back', 'glutes'],
    contraindications: [],
    energyRequired: 3,
    sets: 3,
    reps: 8,
    perSide: true,
    rest: 30,
    instructions: [
      'Start on hands and knees, spine neutral',
      'Extend right arm and left leg simultaneously',
      'Keep hips level - don\'t rotate',
      'Hold 2 seconds, return, alternate sides'
    ],
    coaching: 'Imagine balancing a cup of water on your lower back - no tipping!',
    why: 'Builds core stability while challenging balance and coordination.',
    credits: 40
  },
  
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'lower-back'],
    contraindications: [],
    energyRequired: 4,
    sets: 3,
    reps: 8,
    perSide: true,
    rest: 30,
    instructions: [
      'Lie on back, arms reaching to ceiling',
      'Legs in tabletop position (90° at hips and knees)',
      'Lower opposite arm and leg toward floor',
      'Keep lower back pressed into floor throughout'
    ],
    coaching: 'If your back arches, you\'ve gone too far. Reduce range of motion.',
    why: 'Teaches your core to resist extension - crucial for back health.',
    credits: 45
  },
  
  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    category: 'strength',
    movementPattern: 'squat',
    equipment: ['dumbbells-light'],
    equipmentOptional: ['kettlebell-light'],
    affectsAreas: ['quadriceps', 'glutes', 'core'],
    contraindications: ['knee-acute'],
    energyRequired: 6,
    sets: 3,
    reps: 10,
    rest: 60,
    instructions: [
      'Hold weight at chest height, elbows down',
      'Feet shoulder-width, toes slightly out',
      'Squat down, keeping chest up',
      'Push through heels to stand'
    ],
    coaching: 'The weight helps you stay upright. Go as deep as comfortable.',
    why: 'Builds functional lower body strength with good mechanics.',
    credits: 50
  },
  
  {
    id: 'push-up',
    name: 'Push-Up',
    category: 'strength',
    movementPattern: 'push',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest', 'shoulders', 'triceps', 'core'],
    contraindications: ['shoulder-acute', 'wrist-acute'],
    energyRequired: 5,
    sets: 3,
    reps: 10,
    rest: 60,
    instructions: [
      'Start in plank position, hands slightly wider than shoulders',
      'Lower chest toward floor, elbows at 45°',
      'Push back up to start position',
      'Keep body in straight line throughout'
    ],
    coaching: 'Do knee push-ups if needed - proper form matters more than full push-ups.',
    why: 'Classic upper body exercise that also challenges core stability.',
    credits: 45
  },
  
  {
    id: 'dumbbell-row',
    name: 'Single-Arm Dumbbell Row',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['dumbbells-light'],
    equipmentOptional: ['bench-flat'],
    affectsAreas: ['upper-back', 'lats', 'biceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    sets: 3,
    reps: 10,
    perSide: true,
    rest: 45,
    instructions: [
      'Hinge forward, one hand on bench or knee',
      'Pull dumbbell toward hip, elbow close to body',
      'Squeeze shoulder blade at top',
      'Lower with control, repeat'
    ],
    coaching: 'Don\'t rotate your torso - keep hips and shoulders square.',
    why: 'Strengthens the back muscles that counteract sitting posture.',
    credits: 45
  },
  
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['dumbbells-medium'],
    equipmentOptional: ['barbell'],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: ['lower-back-acute', 'hamstring-acute'],
    energyRequired: 6,
    sets: 3,
    reps: 10,
    rest: 60,
    instructions: [
      'Stand holding weights in front of thighs',
      'Push hips back, lowering weights along legs',
      'Keep slight bend in knees, back flat',
      'Feel stretch in hamstrings, then drive hips forward to stand'
    ],
    coaching: 'This is a hip hinge, not a squat. Think "push hips back" not "bend knees".',
    why: 'Strengthens the posterior chain - crucial for back health and athletic performance.',
    credits: 50
  },
  
  {
    id: 'plank',
    name: 'Plank Hold',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'shoulders'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    duration: 30,
    sets: 3,
    rest: 30,
    instructions: [
      'Forearms on floor, elbows under shoulders',
      'Body in straight line from head to heels',
      'Engage core - think about pulling belly button to spine',
      'Hold position, breathing normally'
    ],
    coaching: 'Quality over time. A 20-second perfect plank beats a 60-second saggy one.',
    why: 'Foundational core stability exercise that protects the spine.',
    credits: 40
  },
  
  {
    id: 'clamshell',
    name: 'Clamshell',
    category: 'strength',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['mini-bands', 'yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: [],
    energyRequired: 2,
    sets: 3,
    reps: 15,
    perSide: true,
    rest: 30,
    instructions: [
      'Lie on side, knees bent at 45°, feet together',
      'Keeping feet touching, lift top knee toward ceiling',
      'Don\'t let hips roll back',
      'Lower with control, repeat'
    ],
    coaching: 'This is a small movement - focus on feeling your glute work.',
    why: 'Activates the glute medius which stabilises the hip and knee.',
    credits: 30
  },
  
  {
    id: 'reverse-lunge',
    name: 'Reverse Lunge',
    category: 'strength',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: ['dumbbells-light'],
    affectsAreas: ['quadriceps', 'glutes', 'hip-flexor'],
    contraindications: ['knee-acute'],
    energyRequired: 5,
    sets: 3,
    reps: 10,
    perSide: true,
    rest: 45,
    instructions: [
      'Stand tall, step one foot backward',
      'Lower until both knees are at 90°',
      'Push through front heel to return to standing',
      'Alternate legs or complete one side first'
    ],
    coaching: 'Reverse lunges are easier on knees than forward lunges.',
    why: 'Builds single-leg strength and balance while stretching hip flexors.',
    credits: 45
  },
  
  // ============================================
  // CARDIO EXERCISES
  // ============================================
  
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'cardio',
    movementPattern: 'full-body',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'ankle-acute'],
    energyRequired: 6,
    duration: 45,
    sets: 3,
    rest: 30,
    instructions: [
      'Stand with feet together, arms at sides',
      'Jump feet apart while raising arms overhead',
      'Jump back to start position',
      'Keep a steady rhythm'
    ],
    coaching: 'Land softly on the balls of your feet. Step instead of jump for lower impact.',
    why: 'Simple cardio that raises heart rate quickly.',
    credits: 35
  },
  
  {
    id: 'high-knees',
    name: 'High Knees',
    category: 'cardio',
    movementPattern: 'running',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip-flexor', 'core', 'cardiovascular'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 7,
    duration: 30,
    sets: 3,
    rest: 30,
    instructions: [
      'Stand tall, run in place',
      'Drive knees up toward chest alternately',
      'Pump arms in running motion',
      'Stay light on your feet'
    ],
    coaching: 'March instead of run for lower intensity. Focus on knee height.',
    why: 'Elevates heart rate while working hip flexors and coordination.',
    credits: 40
  },
  
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'cardio',
    movementPattern: 'full-body',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'shoulders', 'hip-flexor', 'cardiovascular'],
    contraindications: ['shoulder-acute', 'wrist-acute'],
    energyRequired: 7,
    duration: 30,
    sets: 3,
    rest: 30,
    instructions: [
      'Start in push-up position',
      'Drive one knee toward chest',
      'Quickly switch legs, like running in place',
      'Keep hips down, core tight'
    ],
    coaching: 'Slow it down if form breaks. Quality reps > fast sloppy reps.',
    why: 'Combines core work with cardio in one efficient exercise.',
    credits: 45
  },
  
  {
    id: 'burpee',
    name: 'Burpee',
    category: 'cardio',
    movementPattern: 'full-body',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'cardiovascular'],
    contraindications: ['shoulder-acute', 'wrist-acute', 'lower-back-acute'],
    energyRequired: 9,
    reps: 8,
    sets: 3,
    rest: 45,
    instructions: [
      'Stand, then squat down and place hands on floor',
      'Jump or step feet back to plank',
      'Do a push-up (optional)',
      'Jump feet forward, then jump up with arms overhead'
    ],
    coaching: 'Step instead of jump for lower intensity. Skip push-up if needed.',
    why: 'Full-body conditioning that builds strength and cardio together.',
    credits: 60
  },
  
  {
    id: 'squat-jumps',
    name: 'Squat Jumps',
    category: 'cardio',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'cardiovascular'],
    contraindications: ['knee-acute', 'ankle-acute'],
    energyRequired: 8,
    reps: 10,
    sets: 3,
    rest: 45,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Squat down, then explode upward',
      'Land softly, immediately lowering into next squat',
      'Use arms for momentum'
    ],
    coaching: 'Land quietly! If knees hurt, do regular squats instead.',
    why: 'Builds explosive power while elevating heart rate.',
    credits: 50
  },
  
  {
    id: 'skipping-rope',
    name: 'Skipping Rope',
    category: 'cardio',
    movementPattern: 'full-body',
    equipment: ['skipping-rope'],
    equipmentOptional: [],
    affectsAreas: ['calves', 'shoulders', 'cardiovascular'],
    contraindications: ['ankle-acute'],
    energyRequired: 6,
    duration: 60,
    sets: 3,
    rest: 30,
    instructions: [
      'Hold rope handles at hip height',
      'Swing rope overhead and jump as it passes under feet',
      'Stay on balls of feet, small jumps',
      'Keep elbows close to body, wrists do the work'
    ],
    coaching: 'Pretend skip (no rope) if you\'re learning. It\'s all about timing.',
    why: 'Excellent cardio that improves coordination and foot speed.',
    credits: 45
  },
  
  // ============================================
  // RECOVERY EXERCISES
  // ============================================
  
  {
    id: 'childs-pose',
    name: 'Child\'s Pose',
    category: 'recovery',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'hip', 'shoulders'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    instructions: [
      'Kneel on floor, sit back on heels',
      'Fold forward, reaching arms in front',
      'Rest forehead on floor',
      'Breathe deeply into your back'
    ],
    coaching: 'This should feel comfortable. Use a pillow under your forehead if needed.',
    why: 'Gentle stretch that helps calm the nervous system.',
    credits: 20
  },
  
  {
    id: 'supine-twist',
    name: 'Supine Spinal Twist',
    category: 'recovery',
    movementPattern: 'spinal-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'thoracic', 'hip'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie on back, arms out to sides',
      'Bring knees to chest, then drop them to one side',
      'Keep both shoulders on the floor',
      'Hold 30 seconds, then switch sides'
    ],
    coaching: 'Let gravity do the work. Don\'t force the stretch.',
    why: 'Releases tension in the lower back and hips.',
    credits: 25
  },
  
  {
    id: 'foam-roll-upper-back',
    name: 'Foam Roll Upper Back',
    category: 'recovery',
    movementPattern: 'self-massage',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'thoracic'],
    contraindications: [],
    energyRequired: 2,
    duration: 90,
    instructions: [
      'Lie on foam roller positioned under upper back',
      'Support head with hands, lift hips slightly',
      'Roll slowly from mid-back to top of shoulders',
      'Pause on tight spots for 20-30 seconds'
    ],
    coaching: 'Never roll the lower back or neck. Keep core engaged.',
    why: 'Releases tension from sitting and hunching over devices.',
    credits: 30
  },
  
  {
    id: 'foam-roll-quads',
    name: 'Foam Roll Quadriceps',
    category: 'recovery',
    movementPattern: 'self-massage',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'hip-flexor'],
    contraindications: [],
    energyRequired: 3,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie face down with roller under thighs',
      'Support on forearms, roll from hip to just above knee',
      'Turn slightly in/out to hit different areas',
      'Spend extra time on tight spots'
    ],
    coaching: 'This can be intense! Breathe through it and go slowly.',
    why: 'Releases tight quads that pull on the knees and hips.',
    credits: 30
  },
  
  {
    id: 'diaphragmatic-breathing',
    name: 'Diaphragmatic Breathing',
    category: 'recovery',
    movementPattern: 'breath',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 120,
    instructions: [
      'Lie on back, one hand on chest, one on belly',
      'Breathe in through nose - belly rises, chest stays still',
      'Exhale slowly through mouth - belly falls',
      'Aim for 4-count inhale, 6-count exhale'
    ],
    coaching: 'This activates your parasympathetic nervous system - helping you recover.',
    why: 'Deep breathing reduces stress hormones and aids recovery.',
    credits: 25
  },
  
  {
    id: 'leg-up-wall',
    name: 'Legs Up The Wall',
    category: 'recovery',
    movementPattern: 'inversion',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'lower-back', 'nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 180,
    instructions: [
      'Sit sideways against a wall',
      'Swing legs up as you lie back',
      'Scoot hips close to wall, legs resting vertically',
      'Arms relaxed at sides, breathe deeply'
    ],
    coaching: 'Great for after long days on your feet or after exercise.',
    why: 'Gentle inversion that helps fluid return from legs and calms the nervous system.',
    credits: 30
  }
];

/**
 * Get all exercises
 */
export function getAllExercises() {
  return EXERCISES;
}

/**
 * Get exercise by ID
 */
export function getExercise(id) {
  return EXERCISES.find(e => e.id === id);
}

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category) {
  return EXERCISES.filter(e => e.category === category);
}

/**
 * Filter exercises by equipment
 * Only returns exercises where user has all required equipment
 */
export function filterByEquipment(exercises, userEquipment) {
  return exercises.filter(exercise => {
    // If no equipment required, include it
    if (!exercise.equipment || exercise.equipment.length === 0) {
      return true;
    }
    // Check if user has all required equipment
    return exercise.equipment.every(eq => userEquipment.includes(eq));
  });
}

/**
 * Filter exercises by conditions
 * Removes exercises contraindicated for user's conditions
 */
export function filterByConditions(exercises, userConditions) {
  return exercises.filter(exercise => {
    if (!exercise.contraindications || exercise.contraindications.length === 0) {
      return true;
    }
    // Check if any user condition is contraindicated
    return !exercise.contraindications.some(contra => {
      return userConditions.some(cond => cond.includes(contra) || contra.includes(cond));
    });
  });
}

/**
 * Filter exercises by energy level
 * Returns exercises within ±2 of user's energy
 */
export function filterByEnergy(exercises, userEnergy) {
  return exercises.filter(exercise => {
    const diff = Math.abs(exercise.energyRequired - userEnergy);
    return diff <= 3; // Allow some flexibility
  });
}

/**
 * Get suitable exercises based on all user factors
 */
export function getSuitableExercises(userProfile, checkinData) {
  let suitable = [...EXERCISES];
  
  // Filter by equipment
  const equipment = userProfile.equipment || [];
  suitable = filterByEquipment(suitable, equipment);
  
  // Filter by conditions
  const conditions = userProfile.conditions || [];
  suitable = filterByConditions(suitable, conditions);
  
  // Filter by energy (from check-in)
  if (checkinData?.energy) {
    suitable = filterByEnergy(suitable, checkinData.energy);
  }
  
  return suitable;
}
