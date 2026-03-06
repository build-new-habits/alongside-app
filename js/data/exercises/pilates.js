/**
 * data/exercises/pilates.js
 * Pilates — individual moves and full sequences
 * contentType: 'exercise' for individual moves, 'practice' for sequences
 * movementPattern: 'pilates-move' or 'pilates-sequence'
 *
 * Batch 14: 15 individual moves + 2 sequences (17 items)
 */

export const PILATES = [

  // ============================================
  // PILATES MOVES — Individual
  // ============================================

  {
    id: 'pilates-hundred',
    name: 'The Hundred',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 5,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back and bring your knees to tabletop — shins parallel to the floor',
      'Curl your head and shoulders off the mat, reaching arms long by your sides',
      'Pump your arms up and down in small movements — 5 counts up, 5 counts down',
      'Breathe in for 5 pumps, out for 5 pumps',
      'Complete 10 full breath cycles — 100 pumps total',
      'For more challenge, extend legs to 45 degrees'
    ],
    coaching: 'Keep the lower back pressed into the mat. If it arches, bring the knees in closer or bend them more.',
    why: 'The foundational Pilates exercise — warms up the abdominal muscles and trains breath coordination with movement.',
    credits: 50
  },

  {
    id: 'pilates-roll-up',
    name: 'Roll-Up',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'hamstring', 'spine'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie flat, arms extended overhead, legs straight',
      'Inhale: float arms to ceiling',
      'Exhale: curl head, then shoulders, then spine off the mat, reaching toward feet',
      'At the top, fold forward over your legs',
      'Inhale at the top',
      'Exhale: roll back down one vertebra at a time — the reverse of the way up',
      'Complete 5 to 8 reps'
    ],
    coaching: 'The rolling down is harder than rolling up for most people. Slow it down — you are articulating each vertebra.',
    why: 'A spinal articulation and core strengthening exercise. Requires and develops sequential control of each segment of the spine.',
    credits: 50
  },

  {
    id: 'pilates-single-leg-stretch',
    name: 'Single Leg Stretch',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'hip-flexor'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 4,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie on your back, curl head and shoulders off the mat',
      'Draw right knee to chest, hands on shin — left leg extends long at 45 degrees',
      'Switch: left knee in, right leg extends',
      'Keep the lower back pressed to the mat throughout',
      'Move in a smooth, rhythmic pattern',
      'Complete 10 sets (20 total switches)'
    ],
    coaching: 'The lower back staying on the mat is non-negotiable. If it lifts, raise the extended leg higher.',
    why: 'Builds abdominal endurance and hip flexor control — the coordination of opposite limbs trains the core in a functional pattern.',
    credits: 45
  },

  {
    id: 'pilates-double-leg-stretch',
    name: 'Double Leg Stretch',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'hip-flexor'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back, curl head and shoulders up, knees drawn to chest',
      'Inhale: extend both arms overhead and both legs out at 45 degrees simultaneously',
      'Exhale: circle arms around and draw knees back to chest',
      'Keep the curl in the upper body throughout',
      'Complete 8 to 10 reps'
    ],
    coaching: 'If the lower back lifts when legs extend, raise the legs higher. Progress toward a lower angle over weeks.',
    why: 'A more demanding progression from single leg stretch — extends both levers simultaneously, requiring greater core stability.',
    credits: 55
  },

  {
    id: 'pilates-scissors',
    name: 'Scissors',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'hamstring', 'hip-flexor'],
    contraindications: ['lower-back-acute', 'hamstring-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, curl head and shoulders off the mat',
      'Extend both legs to the ceiling',
      'Lower the right leg toward the floor while holding the left',
      'Switch: left leg lowers, right comes up',
      'For more challenge: hold the raised leg with both hands and pulse gently twice before switching',
      'Complete 10 sets'
    ],
    coaching: 'Keep both legs as straight as your hamstrings allow. The movement is controlled and scissor-like — not a swing.',
    why: 'Targets the deep abdominals and hip flexors while stretching the hamstrings — requires precise control of both legs simultaneously.',
    credits: 55
  },

  {
    id: 'pilates-criss-cross',
    name: 'Criss-Cross',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, hands behind head, knees at tabletop',
      'Curl head and shoulders off the mat',
      'Rotate toward the right knee as you extend the left leg out',
      'Switch: rotate to the left, extend the right leg',
      'Move slowly — one breath per rotation',
      'Complete 10 sets'
    ],
    coaching: 'The rotation comes from the waist, not just the elbow. Think of bringing your ribs toward the opposite knee, not your head.',
    why: 'The primary oblique exercise in Pilates. Builds rotational core strength that protects the spine and is essential for all twisting movements.',
    credits: 55
  },

  {
    id: 'pilates-swan',
    name: 'Swan',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'chest-pecs', 'upper-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie face down, hands under shoulders, elbows tucked in',
      'Press through your hands to lift your chest and extend through the upper back',
      'Keep your hips and legs on the floor',
      'Hold for 3 breaths at the top',
      'Lower slowly with control',
      'Complete 5 reps'
    ],
    coaching: 'Unlike Cobra, the Swan in Pilates emphasises extending through the full spine — feel it from the tailbone through the crown of the head.',
    why: 'Strengthens the back extensors and opens the chest — the antidote to forward flexion posture. Used in rehabilitation and performance alike.',
    credits: 35
  },

  {
    id: 'pilates-swimming',
    name: 'Swimming',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'glutes', 'hamstring', 'upper-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 5,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie face down, arms extended overhead',
      'Lift both arms and both legs slightly off the floor',
      'Flutter: alternately raise and lower opposite arm and leg in small, rapid movements',
      'Breathe in for 5 counts, out for 5 counts',
      'Continue for 20 to 30 seconds, then rest',
      'Complete 3 sets'
    ],
    coaching: 'The movement is in the limbs — the torso stays stable. This is not a back extension — the spine stays long and neutral.',
    why: 'Trains the posterior chain — glutes, hamstrings, and back extensors — in a coordinated pattern. Builds the back strength needed for upright posture.',
    credits: 50
  },

  {
    id: 'pilates-side-kick',
    name: 'Side-Lying Kick Series',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hip', 'adductors'],
    contraindications: ['hip-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your side, body in a straight line, head resting on your arm',
      'Kick the top leg forward as far as it will go — pulse twice at the front',
      'Swing the leg back as far as comfortable — pulse once at the back',
      'Keep the pelvis completely still throughout — the movement is only in the hip',
      'Complete 10 reps, then switch sides'
    ],
    coaching: 'The pelvis staying still is the whole challenge. If it rocks, reduce the swing range.',
    why: 'Trains hip mobility and stability simultaneously — the hip moves through a large range while the pelvis and core resist the movement.',
    credits: 40
  },

  {
    id: 'pilates-spine-stretch',
    name: 'Spine Stretch Forward',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['spine', 'hamstring', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit tall with legs extended, feet flexed, slightly wider than hip-width',
      'Arms reach forward at shoulder height',
      'Exhale: round your spine forward, reaching through the space between your feet',
      'Imagine emptying your lungs completely as you round',
      'Inhale: stack the spine back to upright, one vertebra at a time',
      'Complete 8 reps'
    ],
    coaching: 'This is a spinal articulation, not a hamstring stretch. The priority is the C-curve of the spine — not how far forward you reach.',
    why: 'Develops spinal flexion mobility and the ability to decompresses the vertebrae — important for back health and posture.',
    credits: 30
  },

  {
    id: 'pilates-leg-circles',
    name: 'Leg Circles',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip', 'hip-flexor', 'glutes'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, right leg extended to the ceiling, left leg flat on the floor',
      'Anchor your pelvis into the mat — it must not move',
      'Draw 5 circles with the right leg — clockwise',
      'Draw 5 circles anticlockwise',
      'Keep the circles large enough to feel the hip working but small enough to keep the pelvis still',
      'Switch legs and repeat'
    ],
    coaching: 'Start with small circles and increase size only as long as the pelvis stays flat. The challenge is in the stillness, not the movement.',
    why: 'Develops hip joint mobility and the core stability needed to allow movement at the hip without disturbing the spine.',
    credits: 35
  },

  {
    id: 'pilates-teaser-prep',
    name: 'Teaser Preparation',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'hip-flexor'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent at tabletop',
      'Arms extended overhead',
      'Inhale to prepare',
      'Exhale: simultaneously curl your torso up and bring your arms forward — reaching toward your knees',
      'Hold at the top — balance on your tailbone with arms and shins parallel',
      'Inhale to hold',
      'Exhale: lower arms and torso back down with control',
      'Complete 5 reps'
    ],
    coaching: 'The full Teaser straightens the legs — this prep keeps them bent. Master this version before extending the legs.',
    why: 'Develops the deep abdominal strength and spinal control required for the full Teaser — one of the most demanding Pilates exercises.',
    credits: 55
  },

  {
    id: 'pilates-shoulder-bridge',
    name: 'Shoulder Bridge',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'spine', 'abdominals'],
    contraindications: [],
    energyRequired: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet hip-width apart',
      'Exhale: peel the spine off the mat from the tailbone up — one vertebra at a time',
      'Rise to a bridge, hips lifted, forming a straight line from shoulders to knees',
      'Inhale at the top',
      'Exhale: roll back down from the upper back first, finishing with the tailbone',
      'Complete 8 reps'
    ],
    coaching: 'The articulation of the spine on the way up and down is the whole exercise — not just the bridge position. Move like a wave, not a plank.',
    why: 'Develops sequential spinal articulation and posterior chain strength. Superior to a standard glute bridge for spinal mobility.',
    credits: 40
  },

  {
    id: 'pilates-mermaid',
    name: 'Mermaid Stretch',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'adductors', 'hip'],
    contraindications: ['hip-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit with both legs folded to the right — mermaid position',
      'Left hand on the floor beside you for support',
      'Reach your right arm up and over to the left in a side bend',
      'Feel the stretch along the entire right side of the body',
      'Hold for 3 breaths, then return',
      'Complete 5 reps each side'
    ],
    coaching: 'The stretch travels from the outer hip all the way to the fingertips. Breathe into whichever part feels tightest.',
    why: 'Opens the lateral body and hip in a position that also stretches the inner thigh of the folded leg. A classic Pilates side-body release.',
    credits: 25
  },

  {
    id: 'pilates-roll-down-wall',
    name: 'Wall Roll-Down',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['spine', 'hamstring', 'lower-back'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with your back against a wall, feet hip-width apart and about 30 cm from the wall',
      'Press the back of your head, upper back, and tailbone against the wall',
      'Exhale: nod your chin and peel away from the wall, rolling down one vertebra at a time',
      'Roll as far as comfortable, then inhale',
      'Exhale: roll back up — rebuilding contact vertebra by vertebra from the lower back upward',
      'Complete 6 reps'
    ],
    coaching: 'The wall gives honest feedback about which parts of the spine articulate and which do not. Move slowly.',
    why: 'A standing spinal articulation drill that improves segmental mobility and teaches awareness of the spine in a standing, functional position.',
    credits: 30
  },

  // ============================================
  // PILATES SEQUENCES — Full practice
  // ============================================

  {
    id: 'pilates-sequence-beginner',
    name: 'Pilates Beginner Sequence',
    category: 'strength',
    contentType: 'practice',
    movementPattern: 'pilates-sequence',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back', 'glutes', 'spine'],
    contraindications: ['lower-back-acute'],
    energyRequired: 4,
    duration: 1200,
    perSide: false,
    instructions: [
      'Imprinting — lie on back, breathe and settle the spine: 10 breaths',
      'Pelvic Tilts: 10 reps',
      'The Hundred — with bent knees: 50 pumps',
      'Single Leg Stretch: 10 sets',
      'Swan: 5 reps',
      'Cat-Cow from hands and knees: 10 cycles',
      'Shoulder Bridge: 8 reps',
      'Side-Lying Kick Series: 10 reps each side',
      'Spine Stretch Forward: 8 reps',
      'Supine Twist: 5 breaths each side',
      'Savasana: 3 minutes'
    ],
    coaching: 'Quality of movement matters far more than quantity. If you lose form, rest and resume — do not push through with poor technique.',
    why: 'A complete beginner Pilates session that introduces the foundational movements and builds core strength, spinal mobility, and body awareness together.',
    credits: 80
  },

  {
    id: 'pilates-sequence-core',
    name: 'Pilates Core Focus Sequence',
    category: 'strength',
    contentType: 'practice',
    movementPattern: 'pilates-sequence',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back', 'hip-flexor'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 6,
    duration: 1200,
    perSide: false,
    instructions: [
      'The Hundred: 100 pumps',
      'Roll-Up: 6 reps',
      'Single Leg Stretch: 10 sets',
      'Double Leg Stretch: 8 reps',
      'Scissors: 10 sets',
      'Criss-Cross: 10 sets',
      'Teaser Preparation: 5 reps',
      'Swan: 5 reps',
      'Swimming: 3 sets of 20 seconds',
      'Spine Stretch Forward: 8 reps',
      'Savasana: 3 minutes'
    ],
    coaching: 'This is a demanding sequence — rest between exercises as needed. The rest is part of the practice.',
    why: 'A comprehensive core workout using the full Pilates abdominal series. Develops strength, endurance, and coordination throughout the core.',
    credits: 90
  }


  ,

  // PILATES EXPANSION — Final 7 items

  {
    id: 'pilates-roll-down-standing',
    name: 'Standing Roll-Down',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['spine', 'hamstring'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand tall, feet hip-width apart',
      'Nod the chin to chest, then roll down through the spine — one vertebra at a time',
      'Arms hang heavy, knees slightly soft',
      'Once fully down, pause and breathe',
      'Roll back up from the tailbone — sacrum, lumbar, thoracic, cervical, head last',
      'Complete 6 slow roll-downs'
    ],
    coaching: 'The slower you move, the more you feel each vertebral segment. Rushing makes this a forward fold. Slowing makes it a spinal articulation practice.',
    why: 'Develops segmental spinal mobility and body awareness. The standing context makes spinal articulation accessible without requiring floor work.',
    credits: 35
  },

  {
    id: 'pilates-corkscrew',
    name: 'Corkscrew',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'hip', 'spine'],
    contraindications: ['lower-back-acute'],
    energyRequired: 6,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back, legs together pointing to the ceiling',
      'Arms flat at your sides for support',
      'Circle both legs together to the right — lower toward the floor without touching',
      'Continue the circle down and around to the left',
      'Return to centre at the top',
      'Reverse direction',
      'Complete 3 circles each direction'
    ],
    coaching: 'The lower back stays on the mat throughout — as soon as it lifts, the range is too large. Control is more important than size of the circle.',
    why: 'Develops rotational core strength and hip flexor control while maintaining spinal stability — one of the most effective lateral abdominal exercises in Pilates.',
    credits: 70
  },

  {
    id: 'pilates-spine-twist',
    name: 'Spine Twist',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['spine', 'thoracic', 'abdominals'],
    contraindications: ['lower-back-acute', 'lower-back-subacute'],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit tall with legs extended, feet flexed',
      'Arms extended to the sides at shoulder height',
      'Exhale and rotate to the right — two small pulses at the end range',
      'Inhale back to centre',
      'Exhale and rotate left — two pulses',
      'Complete 5 rotations each side'
    ],
    coaching: 'The spine should grow taller with each rotation — not collapse. Think of wringing out a towel — spiralling upward as you twist.',
    why: 'Develops thoracic rotation mobility and oblique strength in the seated position. Directly counteracts the forward rounding and lack of rotation from desk work.',
    credits: 35
  },

  {
    id: 'pilates-long-stretch',
    name: 'Long Stretch — Plank Variation',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'shoulder', 'glutes'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Begin in a high plank position',
      'Shift forward on the toes so the shoulders move in front of the hands',
      'Hold this extended position for 2 seconds',
      'Push back through the hands to return to start position',
      'Maintain a rigid plank throughout — no hips dropping',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'The long stretch is used on the reformer but translates to the floor. The forward shift dramatically increases shoulder and core demand compared to a static plank.',
    why: 'The dynamic plank shift increases the challenge to shoulder girdle stability and anti-extension core strength beyond what a static plank achieves.',
    credits: 55
  },

  {
    id: 'pilates-kneeling-series',
    name: 'Kneeling Side Kick Series',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pilates-move',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hip', 'abdominals'],
    contraindications: ['knee-acute'],
    energyRequired: 5,
    duration: 120,
    perSide: true,
    instructions: [
      'Kneel upright, then shift weight onto the left knee',
      'Extend the right leg out to the side — hip height',
      'Kick the leg forward — pulse twice',
      'Swing back — pulse twice',
      'Keep the torso still and upright throughout',
      'Complete 10 kicks each direction, then switch sides'
    ],
    coaching: 'The kneeling position removes the floor support under the side — the obliques and glute medius work harder to stabilise than in the lying side kick.',
    why: 'The kneeling side kick challenges hip abductor strength and lateral trunk stability in a more demanding position than the lying equivalent.',
    credits: 55
  },

  {
    id: 'pilates-advanced-sequence',
    name: 'Advanced Pilates Sequence — 30 Minutes',
    category: 'strength',
    contentType: 'practice',
    movementPattern: 'pilates-sequence',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['full-body'],
    contraindications: ['lower-back-acute'],
    energyRequired: 7,
    duration: 1800,
    perSide: false,
    instructions: [
      'Hundred — full 100 counts',
      'Roll up × 10',
      'Leg circles both legs × 5 each direction',
      'Rolling like a ball × 10',
      'Series of 5 (all 5 exercises) × 3 rounds',
      'Corkscrew × 5 each direction',
      'Saw × 5 each side',
      'Swan × 5',
      'Swimming × 30 seconds',
      'Teaser × 5',
      'Spine stretch forward × 5',
      'Savasana: 5 minutes'
    ],
    coaching: 'The advanced sequence links exercises with breath and intention — not just with physical execution. Each exercise flows from the last without losing the principles.',
    why: 'A complete advanced Pilates session that challenges deep core stability, spinal articulation, and functional strength across the full Joseph Pilates original sequence.',
    credits: 100
  },

  {
    id: 'pilates-reformer-simulation',
    name: 'Reformer-Style Pilates — Mat Adaptation',
    category: 'strength',
    contentType: 'practice',
    movementPattern: 'pilates-sequence',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 5,
    duration: 1800,
    perSide: false,
    instructions: [
      'Footwork: lie on back, band around feet, legs press out and in × 20',
      'Long spine: band around feet, extend legs overhead while pulling handles × 8',
      'Rowing: seated, band around feet, row sequence × 10 each variation',
      'Long box: lie prone over a bolster, band in hands for lat pulls × 10',
      'Side-lying leg series: band around ankle for resistance — kicks, circles × 10 each',
      'Full plank series without band to close'
    ],
    coaching: 'The reformer uses spring resistance — a band approximates this well enough to capture most of the benefit on a mat. Adjust band tension to match your level.',
    why: 'Reformer Pilates uses resistance that mat Pilates lacks — this adaptation bridges the gap, allowing mat practitioners to experience resistance-based Pilates without the equipment.',
    credits: 80
  }

];
