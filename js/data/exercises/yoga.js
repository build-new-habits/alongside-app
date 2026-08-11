/**
 * data/exercises/yoga.js
 * 11 Aug 2026 v2
 *
 * v2 — PT-9 (Persona Tracing Wave 1). yoga-crescent-lunge was the only
 *   one of 461 exercises with no energyRequired. filterByFitnessLevel()
 *   tests `ex.energyRequired <= ceiling`; `undefined <= n` is false, so
 *   the pose was excluded for every user at every ceiling below 10 —
 *   unreachable in the live app. Set to 3: its own coaching note says it
 *   is more accessible than Warrior I, which is 4.
 *
 * 10 Aug 2026 v1
 *
 * v1 — First version header on this file. Added tailored YouTube search
 *   terms to all 30 exercises (previously zero coverage, database-wide
 *   461-exercise pass, Graeme's direct request: "we get the most up to
 *   date versions and avoid any issue with discontinued or old videos"
 *   — search terms, not direct links, matching the reasoning exactly).
 *
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
    youtube: 'downward facing dog yoga pose tutorial',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'calves', 'shoulder', 'upper-back'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute', 'hamstring-acute'],
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
    youtube: 'warrior 1 yoga pose tutorial',
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
    youtube: 'warrior 2 yoga pose tutorial',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['adductors', 'glutes', 'hip', 'shoulder'],
    contraindications: ['knee-acute', 'hip-acute', 'glutes-acute'],
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
    youtube: 'triangle pose yoga tutorial',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'adductors', 'spine', 'shoulder'],
    contraindications: ['lower-back-acute', 'hamstring-acute'],
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
    youtube: 'chair pose yoga tutorial',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['quadriceps', 'glutes', 'lower-back'],
    contraindications: ['knee-acute', 'glutes-acute', 'lower-back-acute'],
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
    youtube: 'tree pose yoga tutorial',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip', 'ankle-foot', 'glutes'],
    contraindications: ['ankle-foot-acute', 'glutes-acute'],
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
    youtube: 'cobra pose yoga tutorial',
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
    youtube: 'seated forward fold yoga pose tutorial',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'lower-back', 'calves'],
    contraindications: ['lower-back-acute', 'hamstring-acute'],
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
    youtube: 'crescent lunge yoga pose tutorial',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip-flexor', 'quadriceps', 'shoulder'],
    contraindications: ['knee-acute', 'hamstring-acute', 'glutes-acute'],
    instructions: [
      'Step your right foot forward between your hands, back knee lowered to the floor',
      'Untuck the back toes and ground the top of the back foot',
      'Rise up, lifting arms overhead',
      'Sink the hips forward and down to deepen the hip flexor stretch',
      'Hold for 5 breaths, then switch sides'
    ],
    coaching: 'The back knee on the floor makes this more accessible than Warrior I. Lower the back knee any time Warrior I becomes too intense.',
    why: 'A deep hip flexor and quad stretch in a stable position. One of the most effective poses for counteracting the effects of prolonged sitting.',
    energyRequired: 3,
    credits: 35
  },

  {
    id: 'yoga-half-moon',
    name: 'Half Moon Pose',
    youtube: 'half moon pose yoga tutorial',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'adductors', 'shoulder'],
    contraindications: ['ankle-foot-acute', 'hip-acute', 'hamstring-acute', 'glutes-acute'],
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
    youtube: 'corpse pose savasana yoga tutorial',
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
    youtube: 'warrior 3 yoga pose tutorial',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back', 'shoulder'],
    contraindications: ['lower-back-acute', 'ankle-foot-acute', 'hamstring-acute', 'glutes-acute'],
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
    youtube: 'boat pose yoga tutorial',
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
    youtube: 'bridge pose yoga tutorial',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'chest-pecs', 'lower-back'],
    contraindications: ['hamstring-acute', 'glutes-acute', 'lower-back-acute'],
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
    youtube: 'pigeon pose yoga tutorial',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hip', 'piriformis'],
    contraindications: ['knee-acute', 'hip-acute'],
    caution: ['glutes-acute'],
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
    youtube: 'supine spinal twist yoga pose tutorial',
    category: 'recovery',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'spine', 'glutes'],
    contraindications: [],
    caution: ['glutes-acute', 'lower-back-acute'],
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
    youtube: 'legs up the wall yoga pose tutorial',
    category: 'recovery',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'lower-back', 'nervous-system'],
    contraindications: [],
    caution: ['hamstring-acute', 'lower-back-acute'],
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
    youtube: 'cat-cow flow yoga pose tutorial',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['spine', 'lower-back', 'upper-back'],
    contraindications: [],
    caution: ['lower-back-acute'],
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
    youtube: 'morning wake-up flow yoga pose tutorial',
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
    youtube: 'evening wind-down flow yoga pose tutorial',
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


  ,

  // YOGA EXPANSION — Final 10 items

  {
    id: 'yoga-sun-salutation-b',
    name: 'Sun Salutation B',
    youtube: 'sun salutation b yoga pose tutorial',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-flow',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['full-body', 'hip-flexor', 'hamstring'],
    contraindications: ['knee-acute', 'lower-back-acute', 'hamstring-acute'],
    energyRequired: 5,
    duration: 180,
    perSide: false,
    instructions: [
      'Mountain pose — inhale into chair pose',
      'Exhale forward fold',
      'Half lift, step back — exhale chaturanga',
      'Inhale upward dog',
      'Exhale downward dog — hold 5 breaths',
      'Step right foot forward — warrior 1, 5 breaths',
      'Back through vinyasa — left warrior 1, 5 breaths',
      'Forward fold — exhale, inhale chair pose',
      'Exhale mountain pose',
      'Complete 3 to 5 rounds'
    ],
    coaching: 'Sun B is more physically demanding than Sun A because of the chair pose and warrior holds. Build to it after Sun A is comfortable.',
    why: 'Sun Salutation B adds standing strength work — chair pose and warrior 1 — making it a more complete strength and mobility sequence than Sun A.',
    credits: 55
  },

  {
    id: 'yoga-yin-hip-sequence',
    name: 'Yin Yoga — Hip Opening Sequence',
    youtube: 'yin yoga - hip opening sequence yoga pose tutorial',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'yoga-flow',
    equipment: [],
    equipmentOptional: ['yoga-mat', 'yoga-blocks'],
    affectsAreas: ['hip', 'glutes', 'adductors'],
    contraindications: ['hip-acute', 'glutes-acute'],
    energyRequired: 1,
    duration: 1800,
    perSide: false,
    instructions: [
      'Butterfly — feet together, letting knees fall open — 3 minutes',
      'Dragon right — deep lunge with back knee down — 3 minutes',
      'Dragon left — 3 minutes',
      'Sleeping swan right (yin pigeon) — 3 minutes',
      'Sleeping swan left — 3 minutes',
      'Wide-knee child pose — 2 minutes',
      'Supine twist right — 2 minutes',
      'Supine twist left — 2 minutes',
      'Savasana — 5 minutes'
    ],
    coaching: 'Yin yoga targets connective tissue — fascia and ligaments — not muscles. The long holds are essential. Do not try to relax into the poses too quickly.',
    why: 'Yin yoga works on connective tissue hydration and flexibility through long static holds — a different physiological mechanism to the dynamic stretching of most exercise.',
    credits: 60
  },

  {
    id: 'yoga-restorative-sequence',
    name: 'Restorative Yoga Sequence',
    youtube: 'restorative yoga sequence yoga pose tutorial',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'yoga-flow',
    equipment: [],
    equipmentOptional: ['yoga-mat', 'yoga-blocks', 'bolster'],
    affectsAreas: ['nervous-system', 'full-body'],
    contraindications: [],
    energyRequired: 1,
    duration: 1800,
    perSide: false,
    instructions: [
      'Supported child pose — 5 minutes',
      'Supported bridge — pelvis on a block, legs extended — 5 minutes',
      'Legs up the wall — 10 minutes',
      'Supine bound angle — feet together, bolster along spine — 5 minutes',
      'Savasana with eye pillow — 10 minutes'
    ],
    coaching: 'Restorative yoga is designed to activate the parasympathetic nervous system. Do not substitute yin for restorative — they are different practices with different aims.',
    why: 'Restorative yoga has strong evidence for reducing cortisol, improving sleep quality, and managing anxiety. The supported positions allow the body to release without effort.',
    credits: 60
  },

  {
    id: 'yoga-balance-series',
    name: 'Balance Challenge Series',
    youtube: 'balance challenge series yoga pose tutorial',
    category: 'strength',
    contentType: 'practice',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['ankle-foot', 'glutes', 'abdominals'],
    contraindications: ['ankle-foot-acute', 'glutes-acute'],
    energyRequired: 5,
    duration: 900,
    perSide: false,
    instructions: [
      'Tree pose right — 60 seconds',
      'Tree pose left — 60 seconds',
      'Warrior 3 right — 45 seconds',
      'Warrior 3 left — 45 seconds',
      'Eagle pose right — 45 seconds',
      'Eagle pose left — 45 seconds',
      'Half moon right — 30 seconds',
      'Half moon left — 30 seconds',
      'Rest in mountain pose for 5 breaths between sides'
    ],
    coaching: 'Focus on a fixed point at eye level — the drishti. A stable gaze creates a stable balance. Wobbling is normal and is not failure.',
    why: 'A progressive balance challenge that develops proprioception, ankle stability, and hip stability simultaneously. Balance deteriorates with age if untrained — this directly addresses that.',
    credits: 65
  },

  {
    id: 'yoga-forward-fold-series',
    name: 'Forward Fold Series',
    youtube: 'forward fold series yoga pose tutorial',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'lower-back', 'calves'],
    contraindications: ['hamstring-acute', 'lower-back-acute'],
    energyRequired: 3,
    duration: 600,
    perSide: false,
    instructions: [
      'Standing forward fold — hold 2 minutes',
      'Pyramid pose right — 90 seconds',
      'Pyramid pose left — 90 seconds',
      'Wide-legged forward fold — 2 minutes',
      'Seated forward fold — 2 minutes',
      'Janu sirsasana right — 90 seconds',
      'Janu sirsasana left — 90 seconds'
    ],
    coaching: 'In every forward fold, the priority is a flat back over reaching the toes. A rounded spine to reach further defeats the purpose.',
    why: 'A dedicated posterior chain flexibility sequence addressing the hamstring, lumbar, and calf tightness that drives lower back pain in most adults.',
    credits: 50
  },

  {
    id: 'yoga-backbend-series',
    name: 'Backbend Opening Series',
    youtube: 'backbend opening series yoga pose tutorial',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['chest-pecs', 'hip-flexor', 'thoracic'],
    contraindications: ['lower-back-acute'],
    energyRequired: 4,
    duration: 600,
    perSide: false,
    instructions: [
      'Cat-cow warm-up — 2 minutes',
      'Sphinx — 2 minutes',
      'Low cobra — 60 seconds',
      'Full cobra — 60 seconds',
      'Locust — 45 seconds, 3 rounds',
      'Bow — 30 seconds, 3 rounds',
      'Camel — 30 seconds, 2 rounds',
      'Child pose to counterpose — 2 minutes'
    ],
    coaching: 'The backbend series should always finish with a counterpose. Child pose or supine twist neutralises the lumbar extension and prevents post-session back tightness.',
    why: 'Backbends develop thoracic extension and hip flexor length — the two most commonly restricted movements in people who sit for long periods.',
    credits: 55
  },

  {
    id: 'yoga-power-flow',
    name: 'Power Yoga Flow — 30 Minutes',
    youtube: 'power yoga flow - 30 minutes yoga pose tutorial',
    category: 'strength',
    contentType: 'practice',
    movementPattern: 'yoga-flow',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['full-body'],
    contraindications: ['shoulder-acute'],
    energyRequired: 7,
    duration: 1800,
    perSide: false,
    instructions: [
      'Sun A × 3 rounds',
      'Sun B × 3 rounds',
      'Warrior series: 1, 2, reverse warrior, side angle',
      'Balance series: warrior 3, half moon',
      'Core: boat, low boat, plank holds',
      'Cool-down: wide-leg fold, seated twist, supine twist',
      'Savasana: 5 minutes'
    ],
    coaching: 'Power yoga is vinyasa at higher intensity — the transitions between poses are fast and the holds are brief. Build heat in the first 10 minutes before the harder sequences.',
    why: 'Power yoga builds functional strength, cardiovascular fitness, and flexibility simultaneously — a genuinely complete workout for people who struggle to fit multiple training types into their week.',
    credits: 90
  },

  {
    id: 'yoga-pranayama',
    name: 'Pranayama Breathing Practice',
    youtube: 'pranayama breathing practice yoga pose tutorial',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 900,
    perSide: false,
    instructions: [
      'Sit with a tall spine, hands on knees',
      'Ujjayi breath: breathe through the nose with a slight throat constriction — creating an ocean sound — 5 minutes',
      'Nadi shodhana (alternate nostril): close right nostril, inhale left, close left, exhale right — switch sides — 5 minutes',
      'Bhramari (humming bee): plug ears with thumbs, hum loudly on exhale — 10 rounds',
      'Rest in natural breath for 2 minutes'
    ],
    coaching: 'Pranayama requires consistent practice to produce its effects. Ten minutes daily is more valuable than an hour once a week.',
    why: 'Pranayama practices directly modulate the autonomic nervous system through breathing mechanics and vagal nerve stimulation — producing measurable reductions in cortisol and anxiety.',
    credits: 35
  },

  {
    id: 'yoga-chair',
    name: 'Chair Yoga — Seated Sequence',
    youtube: 'chair yoga - seated sequence yoga pose tutorial',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['chair'],
    affectsAreas: ['full-body', 'spine'],
    contraindications: [],
    energyRequired: 2,
    duration: 600,
    perSide: false,
    instructions: [
      'Seated cat-cow — 10 rounds',
      'Seated side stretch right and left — 45 seconds each',
      'Seated spinal twist right and left — 45 seconds each',
      'Seated forward fold — 60 seconds',
      'Seated figure-4 right and left — 45 seconds each',
      'Seated mountain — tall spine, feet grounded, 5 deep breaths',
      'Standing if able: mountain pose — 1 minute'
    ],
    coaching: 'Chair yoga is not a compromise. It is a specific practice that makes yoga accessible to everyone regardless of mobility level, injury, or setting.',
    why: 'Chair yoga maintains spinal mobility, hip flexibility, and body awareness for people who cannot access floor-based practice. Evidence shows benefits for older adults and chronic pain populations.',
    credits: 40
  },

  {
    id: 'yoga-hip-strength',
    name: 'Hip Strength and Stability — Yoga',
    youtube: 'hip strength and stability yoga pose tutorial',
    category: 'strength',
    contentType: 'practice',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hip', 'adductors'],
    contraindications: ['hip-acute', 'glutes-acute'],
    energyRequired: 5,
    duration: 900,
    perSide: false,
    instructions: [
      'Warrior 2 right — 90 seconds, holding strong',
      'Goddess pose — 90 seconds, deep and stable',
      'Warrior 2 left — 90 seconds',
      'Chair pose — 60 seconds',
      'Low side lunge right — 60 seconds',
      'Low side lunge left — 60 seconds',
      'High lunge right — 60 seconds',
      'High lunge left — 60 seconds'
    ],
    coaching: 'These are strength poses, not stretches — maintain full muscular engagement throughout. Warrior 2 held for 90 seconds is genuinely demanding.',
    why: 'Hip strength yoga combines the flexibility benefits of yoga with the strength demands of held positions. Develops the hip stability that reduces injury risk in all sports.',
    credits: 65
  }

];
