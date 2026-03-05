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
  },

  // ============================================
  // MOBILITY EXPANSION — Batch 9 (15 items)
  // Dynamic warm-up, static stretching, CARs
  // ============================================

  {
    id: 'leg-swing-forward',
    name: 'Leg Swing — Forward and Back',
    category: 'mobility',
    movementPattern: 'hip-flexion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip', 'hamstring', 'hip-flexor'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand beside a wall, right hand on wall for balance',
      'Shift weight onto your right foot',
      'Swing your left leg forward and back in a relaxed arc',
      'Let momentum build gradually — do not force the range',
      'Complete 15 swings, then turn and swing the other leg'
    ],
    coaching: 'This is a dynamic movement — loose and rhythmic, not forced. Think of a pendulum, not a stretch.',
    why: 'Warms up the hip joint through its sagittal plane range before exercise — reduces injury risk and improves stride length.',
    credits: 25
  },

  {
    id: 'leg-swing-lateral',
    name: 'Leg Swing — Lateral',
    category: 'mobility',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip', 'glutes', 'adductors'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand facing a wall, both hands on wall for balance',
      'Shift weight onto your right foot',
      'Swing your left leg out to the side, then across your body in front',
      'Let the swing build naturally over several repetitions',
      'Complete 15 swings each side'
    ],
    coaching: 'The leg crossing in front gives you the adductor stretch — the side swing gives you the abductor. Both happen in one movement.',
    why: 'Warms up the hip in the frontal plane — the direction of movement in lateral sports and change of direction.',
    credits: 25
  },

  {
    id: 'inchworm',
    name: 'Inchworm',
    category: 'mobility',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'hip-flexor', 'shoulder', 'lower-back'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart',
      'Hinge forward and place hands on the floor',
      'Walk your hands forward until you are in a plank position',
      'Hold for 1 second',
      'Walk your feet toward your hands — knees can bend slightly',
      'Stand up and repeat',
      'Complete 8 reps'
    ],
    coaching: 'Move slowly and feel each position. The hamstring stretch is in the walk-in, the hip flexor stretch is in the plank hold.',
    why: 'A full-body dynamic warm-up in one exercise — hamstrings, hip flexors, shoulders and core all in sequence.',
    credits: 40
  },

  {
    id: 'lateral-lunge-reach',
    name: 'Lateral Lunge with Reach',
    category: 'mobility',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['adductors', 'hip', 'quadriceps'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand with feet together',
      'Step your right foot wide to the side, pushing your hips back and down into the right side',
      'Keep your left leg straight, right knee bending over the right toes',
      'Reach both hands toward your right foot',
      'Push back to the centre and repeat on the left',
      'Complete 10 reps each side'
    ],
    coaching: 'Most people barely feel lateral lunges until they really sit into them. Push the hips back — not just down.',
    why: 'Opens the inner thighs and hip in the frontal plane — a range that standard squats and lunges completely miss.',
    credits: 40
  },

  {
    id: 'hip-cars',
    name: 'Hip CARs',
    category: 'mobility',
    movementPattern: 'hip-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand tall, hands on hips or light touch on wall',
      'Lift your right knee to hip height in front of you',
      'Slowly arc the knee out to the side, keeping it at hip height',
      'Continue the arc behind you as far as you can',
      'Return the same way — or continue the full circle',
      'Move as slowly as possible, maintaining active tension throughout',
      'Complete 5 circles each direction each side'
    ],
    coaching: 'The slower the better. You are exploring the edge of your hip\'s available range while keeping the muscles engaged throughout.',
    why: 'Controlled articular rotations maintain joint cartilage health and build active range of motion — more valuable than passive stretching for long-term hip health.',
    credits: 35
  },

  {
    id: 'ankle-circles',
    name: 'Ankle Circles',
    category: 'mobility',
    movementPattern: 'ankle-mobility',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['ankle-foot', 'calves'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit or stand, right foot lifted slightly off the floor',
      'Draw large circles with your toes — as big a circle as the ankle allows',
      'Move slowly and with intention through the full range',
      'Complete 10 circles clockwise and 10 anticlockwise each ankle'
    ],
    coaching: 'Especially useful first thing in the morning or before any lower body exercise. 2 minutes total.',
    why: 'Warms up the ankle joint, increases synovial fluid circulation, and maintains ankle range of motion — often neglected until an injury occurs.',
    credits: 15
  },

  {
    id: 'deep-squat-hold',
    name: 'Deep Squat Hold',
    category: 'mobility',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip', 'ankle-foot', 'lower-back'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 3,
    duration: 120,
    perSide: false,
    instructions: [
      'Stand with feet slightly wider than hip-width, toes turned out 30 to 45°',
      'Lower into a deep squat — as low as you can go while keeping heels on the floor',
      'Hold your heels together with both hands to help stay upright',
      'Hold for 30 to 60 seconds, breathing deeply',
      'Stand slowly'
    ],
    coaching: 'If your heels lift, place a rolled-up towel or small plates under them. The goal is heels flat over time, not immediately.',
    why: 'The deep squat is the most fundamental human resting position and a reliable indicator of lower body mobility. Building it reduces hip, knee, and ankle restriction.',
    credits: 30
  },

  {
    id: 'couch-stretch',
    name: 'Couch Stretch',
    category: 'mobility',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip-flexor', 'quadriceps'],
    contraindications: ['knee-acute'],
    energyRequired: 3,
    duration: 120,
    perSide: true,
    instructions: [
      'Kneel facing away from a wall or sofa',
      'Place your right shin up against the wall or sofa, foot pointing up',
      'Step your left foot forward into a lunge position',
      'Keep your torso upright — do not lean forward',
      'Hold for 60 to 90 seconds, then switch sides'
    ],
    coaching: 'This is intense for most people. Start with just a few seconds if needed and build from there.',
    why: 'One of the most effective hip flexor and quad stretches available. Addresses the tightness caused by prolonged sitting better than most alternatives.',
    credits: 35
  },

  {
    id: 'pigeon-pose',
    name: 'Pigeon Pose',
    category: 'mobility',
    movementPattern: 'hip-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hip', 'piriformis'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 2,
    duration: 120,
    perSide: true,
    instructions: [
      'Start from a hands and knees position',
      'Bring your right knee forward toward your right wrist',
      'Angle the shin so the right foot is near your left wrist — more angle means deeper stretch',
      'Extend your left leg straight behind you',
      'Lower your torso down over your front shin, resting on forearms or the floor',
      'Hold for 60 to 90 seconds each side'
    ],
    coaching: 'If the hip on the bent leg does not touch the floor, place a folded blanket or cushion under it for support.',
    why: 'The most effective stretch for the piriformis and deep hip rotators — tight in almost everyone who sits. Also directly addresses sciatic nerve tension.',
    credits: 35
  },

  {
    id: 'thread-the-needle',
    name: 'Thread the Needle',
    category: 'mobility',
    movementPattern: 'spinal-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['thoracic', 'upper-back', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Start on hands and knees',
      'Slide your right arm along the floor under your body to the left',
      'Let your right shoulder and cheek rest on the floor',
      'Your left arm can stay extended or press into the floor for a deeper stretch',
      'Hold for 30 seconds, then repeat on the other side'
    ],
    coaching: 'Breathe into the stretch. Each exhale can take you a little further into rotation.',
    why: 'Opens thoracic rotation in a supported position — excellent for upper back tightness, neck tension, and shoulder mobility.',
    credits: 30
  },

  {
    id: 'standing-quad-stretch',
    name: 'Standing Quad Stretch',
    category: 'mobility',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'hip-flexor', 'knee'],
    contraindications: ['knee-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand on your left leg, right hand on a wall for balance',
      'Bend your right knee and hold your right ankle with your right hand',
      'Keep your right knee pointing down — not out to the side',
      'Stand tall, pushing the right hip forward slightly to deepen the stretch',
      'Hold for 30 seconds each side, repeat twice'
    ],
    coaching: 'Knees together is the cue — when the right knee drifts out, the stretch shifts from quad to hip. Both are fine, but know which you are doing.',
    why: 'Maintains quadriceps length — important for knee health, running efficiency, and reducing anterior knee pain.',
    credits: 20
  },

  {
    id: 'upper-trap-stretch',
    name: 'Upper Trapezius Stretch',
    category: 'mobility',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit or stand, right arm relaxed at your side',
      'Gently tilt your left ear toward your left shoulder',
      'Place your left hand lightly on your head — do not pull, just rest',
      'Feel the stretch along the right side of the neck and top of the shoulder',
      'Hold for 30 seconds, then switch sides',
      'Repeat 3 times each side'
    ],
    coaching: 'The hand on the head is there for weight only, not traction. Pulling causes injury — just let gravity and the weight of the hand do the work.',
    why: 'The upper trapezius is the most tension-holding muscle in the body for most people — stretched by almost every desk worker and driver daily.',
    credits: 20
  },

  {
    id: 'chest-opener-arms-back',
    name: 'Chest Opener — Arms Behind',
    category: 'mobility',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'shoulder', 'thoracic'],
    contraindications: ['shoulder-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand tall, clasp hands behind your back',
      'Squeeze your shoulder blades together and lift your chest',
      'Straighten your arms downward as you lift the chest up',
      'Hold for 20 to 30 seconds',
      'Release and repeat 3 times'
    ],
    coaching: 'Think tall through the crown of the head as you open. Slumping forward defeats the purpose.',
    why: 'Counteracts the forward shoulder posture from screens, driving, and prolonged sitting. Simple and can be done anywhere throughout the day.',
    credits: 20
  },

  {
    id: 'adductor-stretch-standing',
    name: 'Standing Adductor Stretch',
    category: 'mobility',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['adductors', 'hip'],
    contraindications: ['hip-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand with feet wide apart',
      'Shift your weight to the right, bending the right knee and keeping the left leg straight',
      'Keep both feet flat on the floor, toes pointing forward',
      'Feel the stretch along the inner left thigh',
      'Hold for 30 seconds each side, repeat 3 times'
    ],
    coaching: 'The further apart your feet, the deeper the stretch. Start conservative and widen over time.',
    why: 'Tight adductors contribute to groin strain, hip impingement, and movement restriction. Important for running, lateral movement, and hip health.',
    credits: 20
  },

  {
    id: 'spinal-flexion-extension-standing',
    name: 'Standing Spinal Wave',
    category: 'mobility',
    movementPattern: 'spinal-flexion-extension',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['lower-back', 'upper-back', 'spine'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart, knees slightly bent',
      'Let your chin drop to your chest, then round your upper back',
      'Continue the wave down — rounding through the mid-back and then the lower back',
      'Reverse: let the lower back gently arch, then the mid-back, then lift the chest and head',
      'Move slowly through the full spinal wave — 10 seconds each direction',
      'Complete 5 full waves'
    ],
    coaching: 'This is exploration, not performance. Move within a range that feels comfortable. Any section that does not move is telling you something.',
    why: 'Moves every segment of the spine through flexion and extension sequentially — maintaining segmental mobility that is rapidly lost with inactivity.',
    credits: 25
  }

];
