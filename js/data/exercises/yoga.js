/**
 * data/exercises/yoga.js
 * Yoga — individual poses and full flows
 * contentType: 'exercise' for individual poses, 'practice' for full flows
 * movementPattern: 'yoga-pose' or 'yoga-flow'
 *
 * Batch 13: 18 individual poses + 2 flows (20 items)
 */

export const YOGA = [

  // ============================================
  // YOGA POSES — Individual
  // ============================================

  {
    id: 'yoga-downward-dog',
    name: 'Downward Facing Dog',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'calves', 'shoulder', 'upper-back'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Start on hands and knees, wrists under shoulders',
      'Tuck your toes and press through your hands to lift your hips toward the ceiling',
      'Straighten your legs as much as your hamstrings allow — heels reaching toward the floor',
      'Create a long, straight line from hands to hips',
      'Hold for 5 to 10 breaths, pedalling the heels gently to warm up'
    ],
    coaching: 'Bent knees are fine. The priority is a long, flat back — not straight legs.',
    why: 'A foundational yoga pose that lengthens the entire posterior chain and builds shoulder strength. Used as a rest pose and a transition between sequences.',
    credits: 30
  },

  {
    id: 'yoga-warrior-1',
    name: 'Warrior I',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip-flexor', 'quadriceps', 'shoulder'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 4,
    duration: 60,
    perSide: true,
    instructions: [
      'Step your right foot forward between your hands, left foot back at 45°',
      'Ground the outer edge of the back foot',
      'Bend the front knee to 90° — knee over ankle',
      'Rise up and lift your arms overhead, palms facing in',
      'Square your hips toward the front as much as possible',
      'Hold for 5 breaths, then switch sides'
    ],
    coaching: 'The back hip naturally wants to open out — gently drawing it forward is where the hip flexor stretch lives.',
    why: 'Builds lower body strength and hip flexor length simultaneously. Requires and develops focus and balance.',
    credits: 35
  },

  {
    id: 'yoga-warrior-2',
    name: 'Warrior II',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['adductors', 'glutes', 'hip', 'shoulder'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 4,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand with feet wide — about a leg length apart',
      'Turn your right foot out 90°, left foot in slightly',
      'Bend the right knee over the right ankle',
      'Extend arms out to each side at shoulder height, palms down',
      'Gaze over your right hand',
      'Hold for 5 breaths, then switch sides'
    ],
    coaching: 'The front knee tracks over the little toe — not caving inward. Think of pressing the knee out against an imaginary wall.',
    why: 'Opens the inner thighs, strengthens the legs, and builds shoulder endurance. A pose that demands sustained effort and stillness.',
    credits: 35
  },

  {
    id: 'yoga-triangle',
    name: 'Triangle Pose',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'adductors', 'spine', 'shoulder'],
    contraindications: ['lower-back-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand with feet wide, right foot turned out 90°, left foot slightly in',
      'Reach your right arm forward and hinge at the hip to the right',
      'Lower the right hand to your shin, ankle, or the floor — wherever it lands without strain',
      'Extend the left arm straight up, creating a long line',
      'Turn your gaze upward if your neck allows',
      'Hold for 5 breaths, then switch sides'
    ],
    coaching: 'The hamstring will limit how far you go — that is fine. The spine staying long matters more than how low the hand reaches.',
    why: 'A lateral stretch that lengthens the side body, opens the hamstrings and inner thighs, and builds stability in the supporting leg.',
    credits: 35
  },

  {
    id: 'yoga-chair-pose',
    name: 'Chair Pose',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['quadriceps', 'glutes', 'lower-back'],
    contraindications: ['knee-acute'],
    energyRequired: 5,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with feet together or hip-width apart',
      'Bend your knees and lower your hips as if sitting into a chair',
      'Reach your arms overhead, alongside your ears',
      'Keep your weight in your heels — you should be able to lift your toes',
      'Hold for 5 to 10 breaths'
    ],
    coaching: 'Chest naturally wants to fall forward — keep lifting it. The discomfort in the thighs is exactly the point.',
    why: 'One of yoga\'s primary strength poses. Builds quad and glute endurance that directly transfers to functional daily strength.',
    credits: 40
  },

  {
    id: 'yoga-tree-pose',
    name: 'Tree Pose',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip', 'ankle-foot', 'glutes'],
    contraindications: ['ankle-foot-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand on your right foot, left foot resting on the inner calf or inner thigh — not the knee',
      'Find a fixed point to gaze at',
      'Bring hands to heart, or extend arms overhead',
      'Hold for 5 breaths, then switch sides'
    ],
    coaching: 'Wobbling is normal — it means your stabilisers are working. Holding a wall lightly is completely fine.',
    why: 'Builds single-leg balance and hip stability. The concentrated focus required is itself a mindfulness practice.',
    credits: 30
  },

  {
    id: 'yoga-cobra',
    name: 'Cobra Pose',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'chest-pecs', 'shoulder'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie face down, hands under your shoulders, elbows tucked in',
      'Press gently through your hands to lift your chest',
      'Keep your hips on the floor — this is not a full press-up',
      'Shoulders drawing back and down, away from ears',
      'Hold for 5 breaths, then lower slowly'
    ],
    coaching: 'The height of the lift depends on your back flexibility — even a few centimetres is the full pose. Never force range here.',
    why: 'A gentle backbend that opens the chest and counteracts the rounded posture of sitting. Also used therapeutically for lower back pain.',
    credits: 25
  },

  {
    id: 'yoga-seated-forward-fold',
    name: 'Seated Forward Fold',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'lower-back', 'calves'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Sit on the floor with legs extended straight in front of you',
      'Sit tall — spine upright',
      'Hinge forward from the hips, reaching toward your feet',
      'Go only as far as your hamstrings allow with a flat back',
      'Hold for 5 to 10 breaths',
      'Return to upright slowly'
    ],
    coaching: 'A rounded back stretches the lower back, not the hamstrings. Sit on a folded blanket to tilt the pelvis forward if your lower back rounds immediately.',
    why: 'A deep hamstring and lower back stretch. Regular practice improves posterior chain flexibility essential for most physical activities.',
    credits: 30
  },

  {
    id: 'yoga-crescent-lunge',
    name: 'Crescent Lunge',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip-flexor', 'quadriceps', 'shoulder'],
    contraindications: ['knee-acute'],
    energyRequired: 4,
    duration: 60,
    perSide: true,
    instructions: [
      'Step your right foot forward between your hands, back knee lowered to the floor',
      'Untuck the back toes and ground the top of the back foot',
      'Rise up, lifting arms overhead',
      'Sink the hips forward and down to deepen the hip flexor stretch',
      'Hold for 5 breaths, then switch sides'
    ],
    coaching: 'The back knee on the floor makes this more accessible than Warrior I. Lower the back knee any time Warrior I becomes too intense.',
    why: 'A deep hip flexor and quad stretch in a stable position. One of the most effective poses for counteracting the effects of prolonged sitting.',
    credits: 35
  },

  {
    id: 'yoga-half-moon',
    name: 'Half Moon Pose',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'adductors', 'shoulder'],
    contraindications: ['ankle-foot-acute', 'hip-acute'],
    energyRequired: 5,
    duration: 60,
    perSide: true,
    instructions: [
      'From Triangle Pose on the right side, bend your front knee and step your back foot in',
      'Place your right hand on the floor about 30 cm in front of your right foot',
      'Lift your left leg parallel to the floor',
      'Open your hips, stacking the left hip over the right',
      'Extend the left arm to the ceiling',
      'Hold for 3 to 5 breaths, then switch sides'
    ],
    coaching: 'Use a block or thick book under the lower hand if needed — this is a genuinely hard balance pose. The block is not cheating.',
    why: 'Develops single-leg balance, hip stability, and full-body coordination. A challenging pose that builds focus alongside physical capacity.',
    credits: 45
  },

  {
    id: 'yoga-corpse-pose',
    name: 'Corpse Pose (Savasana)',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Lie on your back, arms slightly away from your sides, palms facing up',
      'Let your feet fall naturally outward',
      'Close your eyes',
      'Do nothing — not even breathwork',
      'Allow the body to be completely passive',
      'Stay for at least 5 minutes'
    ],
    coaching: 'This is the hardest pose for many people precisely because it asks you to do nothing. Resist the urge to move or plan. Just be here.',
    why: 'Savasana integrates the physical work of practice and allows the nervous system to fully downregulate. Skipping it is the most common yoga mistake.',
    credits: 20
  },

  {
    id: 'yoga-warrior-3',
    name: 'Warrior III',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back', 'shoulder'],
    contraindications: ['lower-back-acute', 'ankle-foot-acute'],
    energyRequired: 6,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand on your right foot with a soft bend in the knee',
      'Hinge forward from the hip, extending your left leg behind you',
      'Reach arms forward or out to the sides for balance',
      'Aim for your torso and back leg to be parallel to the floor',
      'Hold for 3 to 5 breaths, then switch sides'
    ],
    coaching: 'The hips want to open — keep them level. A 45-degree lean with level hips is better than a fully horizontal torso with one hip open.',
    why: 'The most demanding of the Warrior poses — builds single-leg strength, glute strength, and balance simultaneously.',
    credits: 50
  },

  {
    id: 'yoga-boat-pose',
    name: 'Boat Pose',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'hip-flexor'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 6,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit with knees bent, feet flat on the floor',
      'Lean back slightly and lift your feet, shins parallel to the floor',
      'Extend your arms forward, parallel to the floor',
      'If possible, straighten your legs — hold at whatever angle maintains a long spine',
      'Hold for 5 breaths, then lower with control'
    ],
    coaching: 'Bent knees are completely fine. The spine staying long is the priority — a round back shifts load from the core to the lower back.',
    why: 'One of yoga\'s primary abdominal strengthening poses. Builds the deep core required for spinal stability.',
    credits: 50
  },

  {
    id: 'yoga-bridge-pose',
    name: 'Bridge Pose',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'chest-pecs', 'lower-back'],
    contraindications: [],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet hip-width apart and flat on the floor',
      'Arms alongside your body, palms down',
      'Press through your feet and shoulders to lift your hips',
      'Optionally, clasp your hands under your back',
      'Hold for 5 to 10 breaths',
      'Lower slowly, one vertebra at a time'
    ],
    coaching: 'Lowering one vertebra at a time on the way down is a spinal mobility exercise in itself — do not drop.',
    why: 'A backbend, a hip opener, and a glute strengthener in one. One of the most complete single poses in yoga.',
    credits: 30
  },

  {
    id: 'yoga-pigeon-pose',
    name: 'Pigeon Pose',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hip', 'piriformis'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 2,
    duration: 120,
    perSide: true,
    instructions: [
      'From hands and knees, bring your right knee toward your right wrist',
      'Angle the shin so the right foot comes toward the left wrist',
      'Extend the left leg straight behind you',
      'Lower your torso over the front shin, resting on forearms or the floor',
      'Hold for 10 breaths — at least 60 seconds each side',
      'Breathe deeply into any tension'
    ],
    coaching: 'Place a folded blanket under the right hip if it does not reach the floor. Forcing the hip down strains the knee.',
    why: 'The deepest hip opener in yoga — targets the glutes and external hip rotators directly. Most effective pose for releasing sciatic tension.',
    credits: 35
  },

  {
    id: 'yoga-supine-twist',
    name: 'Supine Spinal Twist',
    category: 'recovery',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'spine', 'glutes'],
    contraindications: [],
    energyRequired: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, knees bent',
      'Drop both knees to the right',
      'Extend arms out in a T, turning your head gently to the left',
      'Let gravity do the work',
      'Hold for 10 breaths, then switch sides'
    ],
    coaching: 'Both shoulders stay on the floor — the knees do not need to reach the ground. Let them hover if needed.',
    why: 'A restorative twist that releases tension along the entire spine. Suitable at any energy level — often used to close a yoga practice.',
    credits: 25
  },

  {
    id: 'yoga-legs-up-wall',
    name: 'Legs Up the Wall',
    category: 'recovery',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'lower-back', 'nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit sideways against a wall',
      'Swing your legs up as you lie back',
      'Scoot your hips close to the wall, legs resting vertically',
      'Arms relaxed at sides, palms up',
      'Close your eyes and breathe deeply',
      'Stay for 5 to 15 minutes'
    ],
    coaching: 'Slide a folded blanket under your lower back if the position feels uncomfortable. This is meant to be completely effortless.',
    why: 'A passive inversion that reverses the effects of gravity on the legs, calms the nervous system, and is among the most restorative poses in yoga.',
    credits: 25
  },

  {
    id: 'yoga-cat-cow-flow',
    name: 'Cat-Cow Flow',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['spine', 'lower-back', 'upper-back'],
    contraindications: [],
    energyRequired: 2,
    duration: 120,
    perSide: false,
    instructions: [
      'Start on hands and knees, wrists under shoulders, knees under hips',
      'Inhale: drop your belly, lift your chest and tailbone — Cow',
      'Exhale: round your spine, tuck chin and tailbone — Cat',
      'Let the breath lead the movement — one breath, one movement',
      'Continue for 10 to 20 cycles',
      'End in neutral'
    ],
    coaching: 'This is the most fundamental spinal warm-up in yoga. The synchronisation of breath and movement is what makes it more than just stretching.',
    why: 'Mobilises the entire spine, warms up the core, and synchronises breath with movement — the foundational skill of yoga practice.',
    credits: 25
  },

  // ============================================
  // YOGA FLOWS — Full sequences
  // ============================================

  {
    id: 'yoga-flow-morning',
    name: 'Morning Wake-Up Flow',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'yoga-flow',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['full-body', 'spine', 'hip'],
    contraindications: [],
    energyRequired: 3,
    duration: 900,
    perSide: false,
    instructions: [
      'Start lying down — 10 breaths of belly breathing',
      'Cat-Cow x 10 cycles from hands and knees',
      'Downward Facing Dog — hold 5 breaths',
      'Walk feet to hands — hang forward fold — 5 breaths',
      'Slowly roll up to standing',
      'Sun Salutation A x 3: Mountain, Forward Fold, Half-Lift, Plank, Cobra, Downward Dog, step to Front, Forward Fold, Mountain',
      'Warrior I right side — 5 breaths — Warrior I left side',
      'Tree Pose — 5 breaths each side',
      'Seated Forward Fold — 10 breaths',
      'Supine Twist — 5 breaths each side',
      'Savasana — 3 to 5 minutes'
    ],
    coaching: 'Move slowly — this is a wake-up, not a workout. Each pose is an invitation to notice how the body feels today.',
    why: 'A complete morning sequence that activates the body, warms up the joints, and sets a calm, intentional tone for the day.',
    credits: 60
  },

  {
    id: 'yoga-flow-evening',
    name: 'Evening Wind-Down Flow',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'yoga-flow',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['full-body', 'nervous-system', 'hip'],
    contraindications: [],
    energyRequired: 2,
    duration: 900,
    perSide: false,
    instructions: [
      'Begin in Child\'s Pose — 10 breaths',
      'Cat-Cow x 8 cycles',
      'Downward Dog — 5 breaths',
      'Crescent Lunge right — 5 breaths',
      'Pigeon Pose right — 10 breaths',
      'Crescent Lunge left — 5 breaths',
      'Pigeon Pose left — 10 breaths',
      'Seated Forward Fold — 10 breaths',
      'Supine Twist right — 8 breaths',
      'Supine Twist left — 8 breaths',
      'Legs Up the Wall — 5 minutes',
      'Savasana — 5 minutes with extended exhale breathing'
    ],
    coaching: 'The evening flow should feel like releasing the day from the body. No forcing, no performance — just progressively letting go.',
    why: 'A restorative sequence designed to downregulate the nervous system, release hip and lower back tension, and prepare the body and mind for sleep.',
    credits: 60
  }

];
