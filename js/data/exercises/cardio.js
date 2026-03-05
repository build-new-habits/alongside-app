/**
 * data/exercises/cardio.js
 * Cardio exercises — bodyweight cardio, HIIT, low-impact options
 */

export const CARDIO = [

  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 6,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with feet together, arms at sides',
      'Jump feet out wide while raising arms above your head',
      'Jump back to start position',
      'Keep a soft bend in your knees throughout',
      'Complete 30 seconds on, 15 seconds rest — repeat 3 times'
    ],
    coaching: 'Land softly each time - think quiet feet. Step out instead of jumping if your joints prefer.',
    why: 'A simple full-body warm-up that raises your heart rate quickly.',
    credits: 40
  },

  {
    id: 'high-knees',
    name: 'High Knees',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip-flexor', 'quadriceps', 'core'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 6,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart',
      'Drive your right knee up toward your chest while pushing off your left foot',
      'Quickly alternate legs, pumping your arms as you go',
      'Keep your core tight and chest up',
      'Aim for 30 seconds at a pace that challenges you'
    ],
    coaching: 'Slow it down if needed - marching high knees is just as effective as running them.',
    why: 'Builds cardiovascular fitness and hip flexor strength simultaneously.',
    credits: 45
  },

  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'cardio',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'shoulder', 'hip-flexor'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 7,
    duration: 60,
    perSide: false,
    instructions: [
      'Start in a high plank position, hands under shoulders',
      'Drive your right knee toward your chest',
      'Quickly switch, extending right leg back as left knee comes in',
      'Keep hips low and level — resist letting them rise',
      'Complete 30 seconds on, 15 rest — repeat 3 times'
    ],
    coaching: 'Slow these right down if form breaks — controlled mountain climbers are more effective than fast sloppy ones.',
    why: 'Combines core stability with cardio in one efficient movement.',
    credits: 60
  },

  {
    id: 'burpee',
    name: 'Burpee',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 8,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Squat down and place hands on the floor',
      'Jump or step both feet back to a plank position',
      'Perform a press-up (optional)',
      'Jump or step feet forward to squat position',
      'Jump up with arms overhead',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'Step instead of jump at any stage to reduce impact — a stepped burpee is still a burpee.',
    why: 'A full-body movement that builds strength and fitness at the same time.',
    credits: 80
  },

  {
    id: 'squat-jumps',
    name: 'Squat Jumps',
    category: 'cardio',
    movementPattern: 'jump',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'calves'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 7,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower into a squat, keeping chest up',
      'Drive explosively through your heels to jump off the floor',
      'Land softly, immediately lowering into the next squat',
      'Complete 3 sets of 10 reps with 30 seconds rest between'
    ],
    coaching: 'Soft landings protect your joints — think about absorbing the landing through your whole leg.',
    why: 'Develops explosive leg power and cardiovascular fitness.',
    credits: 65
  },

  {
    id: 'skipping-rope',
    name: 'Skipping',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: ['skipping-rope'],
    equipmentOptional: [],
    affectsAreas: ['calves', 'full-body'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 6,
    duration: 300,
    perSide: false,
    instructions: [
      'Hold one handle in each hand, rope behind you',
      'Swing the rope overhead and jump as it passes under your feet',
      'Land on the balls of your feet with a slight knee bend',
      'Keep your elbows close to your body and wrists doing the work',
      'Start with 30 seconds on, 30 rest — build to longer sets over time'
    ],
    coaching: 'It takes a few sessions to get the rhythm. If you miss, just restart immediately.',
    why: 'One of the most efficient cardio exercises — improves coordination and burns calories quickly.',
    credits: 70
  }

];
