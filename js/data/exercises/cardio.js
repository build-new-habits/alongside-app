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
  },

  // ============================================
  // CARDIO EXPANSION — Batch 10 (10 items)
  // Low-impact options, steady state, intervals
  // ============================================

  {
    id: 'marching-on-spot',
    name: 'Marching on the Spot',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip-flexor', 'quadriceps'],
    contraindications: [],
    energyRequired: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Stand tall, feet hip-width apart',
      'Lift your right knee to hip height, swinging the left arm forward',
      'Lower and lift the left knee, right arm swinging',
      'Keep a steady rhythm — aim for about 90 steps per minute',
      'Continue for 3 to 5 minutes'
    ],
    coaching: 'This counts. Any movement that elevates your heart rate is cardio. Start here on low energy days.',
    why: 'Low-impact cardio that can be done anywhere and suits any fitness level. Elevates heart rate with minimal joint stress.',
    credits: 30
  },

  {
    id: 'step-touch',
    name: 'Step Touch',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip', 'quadriceps', 'calves'],
    contraindications: [],
    energyRequired: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Stand with feet together',
      'Step your right foot out to the side, bring the left to meet it',
      'Step your left foot out to the left, bring the right to meet it',
      'Add arm movements to increase intensity — reach side to side or overhead',
      'Keep a steady rhythm for 3 to 5 minutes'
    ],
    coaching: 'A classic low-impact aerobic movement. Increase the step width and arm reach to raise intensity without impact.',
    why: 'Gentle lateral movement that warms up the hips and gets the heart rate up without any jumping or impact.',
    credits: 30
  },

  {
    id: 'stair-climbing',
    name: 'Stair Climbing',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'calves'],
    contraindications: ['knee-acute'],
    energyRequired: 5,
    duration: 600,
    perSide: false,
    instructions: [
      'Find a staircase — even a single flight will do',
      'Walk up at a pace that elevates your heart rate',
      'Walk down slowly and carefully — the descent is harder on the knees',
      'Turn and go up again',
      'Continue for 10 minutes, or set a target number of flights'
    ],
    coaching: 'Stairs are surprisingly effective — even at a walking pace they demand more from the heart and legs than flat walking.',
    why: 'Combines cardio with lower body strengthening. One of the most accessible forms of moderate-intensity exercise.',
    credits: 55
  },

  {
    id: 'shadow-boxing',
    name: 'Shadow Boxing',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 6,
    duration: 180,
    perSide: false,
    instructions: [
      'Stand with feet shoulder-width apart, slight bend in the knees',
      'Throw alternating punches — jabs, crosses, hooks — at the air in front of you',
      'Move your feet, shift your weight, and add body movement between combinations',
      'Work in 1-minute rounds with 30 seconds rest',
      'Complete 3 rounds'
    ],
    coaching: 'There are no wrong combinations. The goal is to keep moving and enjoy it. Throw harder punches to raise the intensity.',
    why: 'Full-body cardio that also improves coordination and releases tension. High enjoyment factor for people who find traditional cardio boring.',
    credits: 65
  },

  {
    id: 'cycling-steady',
    name: 'Steady Cycling',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: ['bicycle'],
    equipmentOptional: ['exercise-bike'],
    affectsAreas: ['quadriceps', 'glutes', 'calves'],
    contraindications: [],
    energyRequired: 5,
    duration: 1800,
    perSide: false,
    instructions: [
      'Set up on your bike — seat height so the knee is slightly bent at the bottom of the pedal stroke',
      'Pedal at a conversational pace — you should be able to speak in short sentences',
      'Aim for a cadence of 80 to 100 revolutions per minute',
      'Ride for 30 minutes at this steady pace',
      'Cool down with 5 minutes at easy pace'
    ],
    coaching: 'Steady cycling is genuinely restorative — it builds aerobic base without taxing the nervous system the way intervals do.',
    why: 'Low-impact cardiovascular exercise that builds aerobic base. Particularly good for people with lower limb conditions who cannot run.',
    credits: 80
  },

  {
    id: 'brisk-walk',
    name: 'Brisk Walk',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 3,
    duration: 1800,
    perSide: false,
    instructions: [
      'Head out for a 20 to 30 minute walk',
      'Aim for a pace where you are slightly breathless but can still hold a conversation',
      'Swing your arms, keep your chin up and chest open',
      'If you have hills available, use them',
      'Return feeling energised, not exhausted'
    ],
    coaching: 'Walking is underrated. A brisk 30-minute walk provides meaningful cardiovascular benefit and is sustainable for almost anyone.',
    why: 'Moderate-intensity walking reduces cardiovascular risk, improves mood, and supports metabolic health. The most evidence-backed low-barrier exercise there is.',
    credits: 35
  },

  {
    id: 'dance-freestyle',
    name: 'Freestyle Dance',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 5,
    duration: 600,
    perSide: false,
    instructions: [
      'Put on music you enjoy',
      'Move to it — whatever feels natural',
      'Allow yourself to be silly, expressive, or contained — whatever suits the moment',
      'Keep moving for at least 10 minutes',
      'The only rule is to keep moving'
    ],
    coaching: 'This absolutely counts as exercise. Research shows dance has equivalent cardiovascular and mental health benefits to structured cardio.',
    why: 'Cardiovascular exercise disguised as fun. Improves coordination, mood, and heart health — and has a high adherence rate because people actually enjoy it.',
    credits: 55
  },

  {
    id: 'hiit-30-30',
    name: 'HIIT — 30:30 Intervals',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'lower-back-acute'],
    energyRequired: 8,
    duration: 900,
    perSide: false,
    instructions: [
      'Choose 4 to 6 exercises: e.g. squat jumps, burpees, high knees, mountain climbers',
      'Work as hard as possible for 30 seconds on the first exercise',
      'Rest for 30 seconds completely',
      'Move to the next exercise and repeat',
      'Complete 3 to 4 rounds of the full circuit',
      'Rest 2 minutes between rounds'
    ],
    coaching: 'The 30 seconds of rest is mandatory — not optional. HIIT only works if you genuinely push during the work periods, and that requires real recovery between them.',
    why: 'High-intensity interval training produces significant cardiovascular and metabolic adaptation in a shorter time than steady-state cardio.',
    credits: 100
  },

  {
    id: 'rowing-machine',
    name: 'Rowing Machine — Steady State',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: ['rowing-machine'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'upper-back', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 6,
    duration: 1200,
    perSide: false,
    instructions: [
      'Set the damper to 4 to 6 — not maximum',
      'Drive through the legs first, then lean back, then draw the handle to your lower ribs',
      'Return in reverse: arms away, lean forward, bend knees',
      'Row at a pace of 22 to 26 strokes per minute',
      'Continue for 20 minutes'
    ],
    coaching: 'The legs do 60% of the work, the back 30%, the arms 10%. Most beginners reverse this and wonder why their back hurts.',
    why: 'The rowing machine is one of the most complete cardiovascular exercises — the only machine that works both the upper and lower body through a full range.',
    credits: 80
  },

  {
    id: 'walk-run-intervals',
    name: 'Walk-Run Intervals',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'hamstring-acute'],
    energyRequired: 5,
    duration: 1800,
    perSide: false,
    instructions: [
      'Warm up with 5 minutes of easy walking',
      'Run for 1 minute at a comfortable pace — not a sprint',
      'Walk for 2 minutes',
      'Repeat the run-walk cycle 6 to 8 times',
      'Cool down with 5 minutes of walking'
    ],
    coaching: 'The walking intervals are not failure — they are the whole point. This method builds running fitness while managing load on the joints.',
    why: 'The walk-run method is the safest and most evidence-backed approach for building running fitness from scratch or returning after a break.',
    credits: 60
  }

];
