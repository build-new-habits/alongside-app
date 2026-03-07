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
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
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
    contraindications: ['knee-acute', 'glutes-acute'],
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
    contraindications: ['glutes-acute'],
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


  ,

  // CARDIO EXPANSION — 10 items

  {
    id: 'cardio-rowing-easy',
    name: 'Easy Row — 20 Minutes',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['rowing-machine'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'upper-back'],
    contraindications: [],
    energyRequired: 4,
    duration: 1200,
    perSide: false,
    instructions: [
      'Set the damper to 3 to 5 — lower than you think',
      'Drive through the legs first — 60% of the power comes from the legs',
      'Body rocks back slightly as the arms pull to the chest',
      'Return: arms extend, body rocks forward, knees bend — in that order',
      'Row for 20 minutes at a conversational pace',
      'Aim for 24 to 26 strokes per minute'
    ],
    coaching: 'Most beginners use too much arm and back and not enough leg. Think of the drive sequence as a leg press — the arms and back finish the stroke.',
    why: 'Rowing is a full-body aerobic exercise that builds both cardiovascular fitness and upper body endurance. Non-impact — excellent for people managing lower body injuries.',
    credits: 50
  },

  {
    id: 'cardio-rowing-intervals',
    name: 'Rowing Intervals — 500m',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['rowing-machine'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['lower-back-acute'],
    energyRequired: 8,
    duration: 1800,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes easy rowing',
      'Row 500 metres at hard effort — note your time',
      'Rest for 2 minutes',
      'Repeat 5 times',
      'Try to maintain consistent splits across all 5 reps',
      'Cool down: 5 minutes easy'
    ],
    coaching: 'The 500m is the classic rowing interval. Going out too hard on rep 1 means fading significantly by rep 4 and 5. Start 5 seconds slower than target pace.',
    why: 'Rowing intervals develop aerobic and anaerobic capacity simultaneously. The 500m distance stresses both energy systems equally.',
    credits: 85
  },

  {
    id: 'cardio-assault-bike',
    name: 'Assault Bike — Interval Session',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['exercise-bike'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['shoulder-acute'],
    energyRequired: 9,
    duration: 1200,
    perSide: false,
    instructions: [
      'Warm up: 3 minutes at easy pace',
      'Sprint at maximum effort for 10 seconds',
      'Pedal easily for 50 seconds',
      'Repeat 10 times',
      'Cool down: 5 minutes easy',
      'Total work time: 10 minutes'
    ],
    coaching: 'The assault bike is one of the most demanding cardio machines because arms and legs work simultaneously. Ten seconds genuinely maximum means you will be breathing hard immediately.',
    why: 'The assault bike uses push-pull arm action alongside leg drive — creating higher cardiovascular demand than a standard bike in less time. Highly time-efficient conditioning.',
    credits: 90
  },

  {
    id: 'cardio-stair-climbing',
    name: 'Stair Climbing',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'quadriceps', 'calves'],
    contraindications: ['knee-acute', 'glutes-acute'],
    energyRequired: 6,
    duration: 1200,
    perSide: false,
    instructions: [
      'Find a staircase of at least 3 flights, or a stair machine',
      'Walk up at a steady pace — do not use the handrail unless needed for safety',
      'Take the stairs down slowly — eccentric load is valuable',
      'Work continuously for 20 minutes',
      'Progress to taking stairs 2 at a time as fitness improves'
    ],
    coaching: 'Stair climbing is harder than walking because of the vertical component. The caloric cost per minute is significantly higher than flat walking.',
    why: 'Stair climbing builds glute and quad strength alongside cardiovascular fitness. Accessible with no equipment and no gym — a hidden training tool available in most buildings.',
    credits: 45
  },

  {
    id: 'cardio-skipping',
    name: 'Jump Rope — Conditioning',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['jump-rope'],
    equipmentOptional: [],
    affectsAreas: ['calves', 'ankle-foot', 'full-body'],
    contraindications: ['ankle-foot-acute', 'knee-acute'],
    energyRequired: 7,
    duration: 900,
    perSide: false,
    instructions: [
      'Warm up: 2 minutes easy bouncing on the spot',
      'Skip continuously for 1 minute',
      'Rest for 30 seconds',
      'Repeat 8 to 10 rounds',
      'Progress to double-unders or crossovers as skill develops'
    ],
    coaching: 'Jump rope requires patience in the learning phase — missing is inevitable at first. A consistent rhythm at slow speed builds the skill that allows faster skipping.',
    why: 'Jump rope develops coordination, calf strength, ankle stability, and cardiovascular fitness simultaneously. Used by boxing coaches as one of the most complete single conditioning tools available.',
    credits: 70
  },

  {
    id: 'cardio-shadow-boxing',
    name: 'Shadow Boxing',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 6,
    duration: 900,
    perSide: false,
    instructions: [
      'Stand in a comfortable fighting stance — non-dominant foot slightly forward',
      'Move around the space continuously — never stand still',
      'Throw punches in combinations: jab, cross, hook, uppercut',
      'Add defensive movements: slip, roll, step back',
      'Work in 3-minute rounds with 1 minute rest between',
      'Complete 3 to 5 rounds'
    ],
    coaching: 'Shadow boxing is harder when you stay moving. The footwork is the conditioning — the punches are the technique. Combine both.',
    why: 'Shadow boxing develops cardiovascular fitness, coordination, and rotational power while also providing an excellent outlet for stress and frustration.',
    credits: 65
  },

  {
    id: 'cardio-dance',
    name: 'Dance Fitness — Freestyle',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 6,
    duration: 1800,
    perSide: false,
    instructions: [
      'Create a playlist of upbeat music — 30 minutes',
      'Move freely to the music — no choreography required',
      'Stay moving throughout — the goal is sustained effort',
      'Let the music set the intensity — fast songs, higher intensity',
      'Allow yourself to look ridiculous'
    ],
    coaching: 'Dance fitness has one significant advantage over all other cardio: people actually enjoy it. Enjoyment drives consistency. Consistency drives outcomes.',
    why: 'Dance provides equivalent cardiovascular benefit to moderate-intensity exercise while producing significantly higher rates of mood improvement and long-term adherence than conventional cardio.',
    credits: 60
  },

  {
    id: 'cardio-circuit-training',
    name: 'Cardio Circuit — No Equipment',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 7,
    duration: 1200,
    perSide: false,
    instructions: [
      'Complete 40 seconds of work, 20 seconds rest for each:',
      'Jumping jacks',
      'Mountain climbers',
      'High knees',
      'Squat jumps',
      'Burpees',
      'Sprint on the spot',
      'Complete the circuit 3 to 4 times with 60 seconds rest between rounds'
    ],
    coaching: 'The 20-second rest is insufficient for full recovery — that is intentional. Work capacity builds when you operate under partial recovery conditions.',
    why: 'A no-equipment circuit that develops cardiovascular fitness and muscular endurance simultaneously. The variety of movements maintains engagement and trains multiple movement patterns.',
    credits: 80
  },

  {
    id: 'cardio-nordic-walking',
    name: 'Nordic Walking',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['nordic-walking-poles'],
    equipmentOptional: ['hiking-poles'],
    affectsAreas: ['full-body', 'upper-back', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    duration: 1800,
    perSide: false,
    instructions: [
      'Hold the poles loosely with the strap supporting the push',
      'Plant the right pole as the left foot steps forward — opposite arm to leg',
      'Push through the pole as you step — extending the arm fully behind',
      'The poles increase the upper body involvement to 90% of all muscles',
      'Walk for 30 minutes at a brisk pace'
    ],
    coaching: 'Nordic walking looks unusual but the evidence is excellent — it burns more calories than regular walking at the same pace and develops upper body strength simultaneously.',
    why: 'Nordic walking engages the upper body through active pole planting, increasing caloric expenditure by 20 to 40% compared to regular walking while reducing knee joint load.',
    credits: 45
  },

  {
    id: 'cardio-hiit-session',
    name: 'HIIT — 20 Minute Session',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 9,
    duration: 1200,
    perSide: false,
    instructions: [
      'Warm up: 3 minutes easy movement',
      'Work: 40 seconds high intensity (sprinting, jump squats, burpees)',
      'Rest: 20 seconds',
      'Repeat 15 rounds — 15 minutes total',
      'Cool down: 2 minutes easy walking',
      'Use a different exercise each round if possible'
    ],
    coaching: 'HIIT only works if the work intervals are genuinely hard. Going at 70% effort during HIIT produces 70% of the benefit — and you might as well do steady-state cardio instead.',
    why: 'HIIT produces cardiovascular adaptations equivalent to much longer steady-state sessions in a fraction of the time. Among the most time-efficient training formats available.',
    credits: 90
  }

];
