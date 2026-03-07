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
    caution: ['lower-back-acute'],
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
    caution: ['hamstring-acute'],
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
    contraindications: ['hip-acute', 'knee-acute', 'glutes-acute'],
    caution: [],
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
    contraindications: ['hip-acute', 'hamstring-acute'],
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
    contraindications: ['hip-acute', 'glutes-acute'],
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
    contraindications: ['lower-back-acute', 'shoulder-acute', 'hamstring-acute'],
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
    contraindications: ['knee-acute', 'hip-acute', 'lower-back-acute'],
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
    caution: ['glutes-acute'],
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


  ,

  // ============================================
  // MOBILITY EXPANSION — Batch 22 (18 items)
  // World's greatest stretch series, thoracic, ankle, wrist
  // ============================================

  {
    id: 'worlds-greatest-stretch',
    name: "World's Greatest Stretch",
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'yoga-pose',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip-flexor', 'adductors', 'thoracic', 'shoulder'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Start in a lunge position — right foot forward, left knee on the floor',
      'Place both hands inside the right foot',
      'Rotate the right arm to the ceiling, following it with your eyes',
      'Return the hand to the floor',
      'Push your right knee out with your right elbow',
      'Extend the right leg and reach for the toes',
      'Return to standing and switch sides',
      'Complete 5 full cycles each side'
    ],
    coaching: "This is called the world's greatest stretch because it genuinely hits more tight areas in one movement than almost anything else. Slow down through each transition.",
    why: 'Combines hip flexor stretch, thoracic rotation, groin opening, and hamstring lengthening in one flowing sequence. Used as a warm-up by elite athletes worldwide.',
    credits: 40
  },

  {
    id: 'thoracic-rotation-seated',
    name: 'Seated Thoracic Rotation',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['thoracic', 'spine'],
    contraindications: ['lower-back-acute'],
    caution: ['lower-back-subacute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit cross-legged or on a chair with feet flat',
      'Cross your arms over your chest',
      'Rotate slowly to the right as far as comfortable — do not force it',
      'Hold for 2 seconds at the end range',
      'Return through centre and rotate left',
      'Complete 10 rotations each way'
    ],
    coaching: 'The rotation comes from the mid-back, not the lower back or hips. Keep the hips square and feel the movement in the chest area.',
    why: 'Restores thoracic rotation range of motion — essential for driving, reaching overhead, throwing, and all rotational sport movements.',
    credits: 25
  },

  {
    id: 'thoracic-extension-foam-roll',
    name: 'Thoracic Extension Over Foam Roller',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'extension',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['thoracic', 'chest-pecs', 'upper-back'],
    contraindications: [],
    energyRequired: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Sit on the floor with a foam roller placed horizontally behind you',
      'Lean back until the roller is under the mid-back — thoracic spine area',
      'Support your head with your hands',
      'Let your back extend over the roller, opening the chest upward',
      'Hold for 5 breaths, then roll up one segment and repeat',
      'Work from the mid-back to between the shoulder blades'
    ],
    coaching: 'Only work the thoracic spine — not the lower back. If the roller dips below the ribcage, stop.',
    why: 'Directly restores thoracic extension mobility — the movement most lost from sitting. Essential for shoulder health, overhead movement, and upright posture.',
    credits: 30
  },

  {
    id: 'ankle-mobility-circles',
    name: 'Ankle Circles and CARs',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'joint-rotation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['ankle-foot'],
    contraindications: ['ankle-foot-acute'],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit with one leg crossed over the other, ankle free to move',
      'Draw large, slow circles with the toes — maximising range in every direction',
      'Complete 10 circles clockwise, 10 anticlockwise',
      'Then trace the alphabet with the big toe — A through Z',
      'Switch to the other ankle',
      'Complete daily for best results'
    ],
    coaching: 'The alphabet drill exposes which ankle directions are restricted — letters that feel limited show where to focus. Do it daily, not occasionally.',
    why: 'Ankle dorsiflexion restriction is one of the most common mobility limitations and contributes to knee pain, hip compensation, and running injury. Regular mobilisation prevents this.',
    credits: 15
  },

  {
    id: 'ankle-wall-dorsiflexion',
    name: 'Ankle Dorsiflexion Drill — Wall',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'joint-rotation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['ankle-foot', 'calves'],
    contraindications: ['ankle-foot-acute'],
    energyRequired: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Face a wall, right foot a few centimetres from the wall',
      'Drive the right knee forward toward the wall — keeping the heel on the floor',
      'Touch the knee to the wall while the heel stays down',
      'If easy, move the foot further from the wall and repeat',
      'Find the distance where the heel just barely stays down',
      'Complete 15 reps each side, holding the end range for 1 second'
    ],
    coaching: 'This is a test and a drill. Measure the foot distance from the wall over weeks — improvement here will be noticeable in squat depth and running comfort.',
    why: 'Directly develops ankle dorsiflexion range — the single most impactful mobility improvement for squatting, running, and any standing athletic movement.',
    credits: 20
  },

  {
    id: 'wrist-extension-floor',
    name: 'Wrist Extension on Floor',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'joint-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['wrist-elbow'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Come to hands and knees',
      'Turn your hands so fingers point back toward your knees',
      'Gently rock forward onto the palms — feeling a stretch in the wrists and forearms',
      'Pulse gently in and out of the end range',
      'Complete 2 minutes of gentle movement'
    ],
    coaching: 'Wrist extension is the range most reduced by keyboard use. This simple drill is more effective than any wrist stretch done from a chair.',
    why: 'Restores wrist extension range critical for press-ups, planks, yoga, and all pushing movements. Directly counteracts the wrist flexion position of keyboard and phone use.',
    credits: 20
  },

  {
    id: 'hip-90-90-stretch',
    name: 'Hip 90-90 Stretch',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'hip-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip', 'glutes', 'adductors'],
    contraindications: ['knee-acute', 'hip-acute'],
    caution: ['glutes-acute'],
    energyRequired: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Sit on the floor with both knees bent to 90 degrees — front leg with knee forward, back leg with knee to the side',
      'Both shins are at 90 degrees to your thighs',
      'Sit tall over the front hip — resist the urge to lean away',
      'Hold for 60 to 90 seconds, then switch sides',
      'Gradually work toward sitting upright with no lean'
    ],
    coaching: 'Most people cannot sit upright in 90-90 at first. Use a folded blanket under the front hip if it is raised off the floor.',
    why: 'The 90-90 position simultaneously stretches both internal and external hip rotation — addressing the full range of hip mobility in one position.',
    credits: 30
  },

  {
    id: 'hip-flexor-sofa-stretch',
    name: 'Couch Stretch',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'hip-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip-flexor', 'quadriceps'],
    contraindications: ['knee-acute'],
    energyRequired: 2,
    duration: 120,
    perSide: true,
    instructions: [
      'Kneel facing away from a wall or sofa',
      'Place your right shin up the wall — toes pointing up, heel toward the ceiling',
      'Step your left foot forward so the left knee is at 90 degrees',
      'Keep your torso upright — resist leaning forward',
      'Hold for 60 to 120 seconds each side'
    ],
    coaching: 'This is intense. Work up to the full time gradually. The hip flexor and quad stretch here is deeper than any standing stretch.',
    why: 'The couch stretch is the most effective hip flexor and quad stretch available — directly counteracts the position of prolonged sitting and is used in competitive CrossFit warm-ups.',
    credits: 30
  },

  {
    id: 'shoulder-cars-standing',
    name: 'Shoulder CARs — Standing',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'joint-rotation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand tall, core braced, one arm at your side',
      'Lift the arm forward and upward — as high as it will go',
      'Continue the circle overhead and behind, moving through every plane',
      'Circle down behind the body and back to the start',
      'Move as slowly as possible, maximising range in every direction',
      'Complete 3 circles forward, 3 backward each shoulder'
    ],
    coaching: 'CARs (Controlled Articular Rotations) are done slowly because speed hides range. The slower you go, the more honest the movement.',
    why: 'Shoulder CARs assess and develop full joint range of motion in all directions — the most comprehensive single shoulder mobility drill available.',
    credits: 25
  },

  {
    id: 'spinal-cars',
    name: 'Spinal CARs',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'rotation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['spine', 'lower-back', 'thoracic'],
    contraindications: ['lower-back-acute', 'lower-back-subacute'],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart',
      'Begin to draw a large circle with your head — letting each segment of the spine participate',
      'Head leads, then neck, then thoracic, then lumbar — wave-like motion',
      'The circle is large and three-dimensional — not just rotation',
      'Complete 5 circles each direction, very slowly'
    ],
    coaching: 'Spinal CARs are meditative as well as functional. Done first thing in the morning, they reveal overnight stiffness and work through it.',
    why: 'Develops segmental spinal mobility — each vertebra moving independently. Maintains the distributed movement capacity that keeps the spine healthy long-term.',
    credits: 25
  },

  {
    id: 'frog-stretch',
    name: 'Frog Stretch',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'hip-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['adductors', 'hip'],
    contraindications: ['hip-acute', 'knee-acute'],
    energyRequired: 2,
    duration: 120,
    perSide: false,
    instructions: [
      'Come to hands and knees, then slide both knees out to the sides',
      'Bring the inner edges of both feet to the floor — shins parallel',
      'Lower your hips toward the floor — you will feel an intense inner thigh stretch',
      'Hold for 60 to 90 seconds, breathing into the stretch',
      'Gently rock forward and back to deepen'
    ],
    coaching: 'The frog stretch is demanding. Place folded blankets under the knees if there is knee discomfort. Breathe through the hip tension.',
    why: 'One of the deepest hip adductor and hip flexor stretches available. Develops the inner thigh mobility essential for deep squatting and lateral movement.',
    credits: 25
  },

  {
    id: 'shoulder-dislocates',
    name: 'Shoulder Dislocates — Band',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'joint-rotation',
    equipment: ['resistance-band'],
    equipmentOptional: ['pvc-pipe', 'broomstick'],
    affectsAreas: ['shoulder', 'chest-pecs', 'upper-back'],
    contraindications: ['shoulder-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Hold a resistance band or stick wide — wider than shoulder-width',
      'With straight arms, raise the band from in front of the body over the head',
      'Continue the arc behind the body as far as possible',
      'Return over the head back to the front',
      'Gradually narrow the grip as the range improves',
      'Complete 10 reps each direction'
    ],
    coaching: 'If the arms cannot complete the full circle without bending, widen the grip. Never force range here — the shoulder is sensitive.',
    why: 'Develops full shoulder circumduction range — used by Olympic weightlifters and gymnasts before training to ensure complete overhead mobility.',
    credits: 25
  },

  {
    id: 'neck-mobility',
    name: 'Neck Mobility Routine',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'joint-rotation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder'],
    contraindications: [],
    energyRequired: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Sit tall, shoulders relaxed',
      'Slowly drop the right ear toward the right shoulder — hold 5 seconds',
      'Return through centre and drop left ear — hold 5 seconds',
      'Turn to look over the right shoulder — hold 5 seconds',
      'Turn to look over the left — hold 5 seconds',
      'Chin to chest — hold 5 seconds',
      'Look gently upward — only to comfortable range — hold 5 seconds',
      'Complete 3 full cycles'
    ],
    coaching: 'Move to the edge of comfortable range, not beyond it. The neck is not a joint to force. Particularly important for people who spend long periods at a screen.',
    why: 'Maintains cervical spine range of motion in all planes — preventing the stiffness that leads to headaches, shoulder tension, and restricted movement.',
    credits: 15
  },

  {
    id: 'hip-circles-standing',
    name: 'Standing Hip Circles',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'joint-rotation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand on one leg, lift the other knee to hip height',
      'Draw large circles with the raised knee — clockwise and anticlockwise',
      'Maximise the range in every direction',
      'Keep the standing leg slightly bent and the torso still',
      'Complete 10 circles each direction on each leg'
    ],
    coaching: 'The torso staying still is the key challenge. If the torso rotates with the leg, you are not mobilising the hip — you are mobilising the lumbar spine.',
    why: 'Develops active hip circumduction — the full range of motion needed for kicking, stepping over obstacles, and fluid lower body movement.',
    credits: 20
  },

  {
    id: 'prone-thoracic-rotation',
    name: 'Prone Thoracic Rotation',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['thoracic', 'spine'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your side in the foetal position — knees together at 90 degrees',
      'Extend both arms forward, palms stacked',
      'Take the top arm and open it to the side — rotating the thoracic spine',
      'Let the arm reach behind, looking to follow it',
      'The knees stay together — only the upper body rotates',
      'Return and repeat 10 times each side'
    ],
    coaching: 'Keeping the knees together isolates the rotation to the thoracic spine. The moment the knees separate, the lumbar spine takes over.',
    why: 'A targeted thoracic rotation drill in a position that locks out the lumbar spine — ensuring the rotation happens in the correct area.',
    credits: 25
  },

  {
    id: 'seated-figure-4-stretch',
    name: 'Seated Figure-4 Stretch',
    category: 'mobility',
    contentType: 'exercise',
    movementPattern: 'hip-rotation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hip', 'piriformis'],
    contraindications: ['knee-acute', 'hip-acute'],
    caution: ['glutes-acute'],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit on a chair or the floor',
      'Place the right ankle across the left knee — figure-4 position',
      'Gently press the right knee downward with the right hand',
      'If more stretch is needed, lean the torso forward',
      'Hold for 45 to 60 seconds each side'
    ],
    coaching: 'This can be done on a chair at a desk — completely discreet. Do it at the end of any long sitting period.',
    why: 'The most accessible deep hip rotator stretch — targets the piriformis and gluteus medius. Particularly effective for people with sciatic tension or piriformis syndrome.',
    credits: 20
  },

  {
    id: 'mobility-flow-5min',
    name: 'Five-Minute Morning Mobility Flow',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'yoga-flow',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['full-body', 'spine'],
    contraindications: [],
    energyRequired: 2,
    duration: 300,
    perSide: false,
    instructions: [
      'Cat-cow x 10 breaths from hands and knees',
      "Child's pose: 5 breaths",
      'Downward dog: 5 breaths',
      'Crescent lunge right: 3 breaths',
      'Thoracic rotation in lunge — reach right arm to ceiling: 3 reps',
      'Crescent lunge left: 3 breaths with rotation',
      'Standing forward fold: 5 breaths',
      'Slow roll up to standing'
    ],
    coaching: 'This five-minute flow requires no warm-up and no equipment. It is the minimum effective dose of morning movement. Do it before checking your phone.',
    why: 'A complete morning mobility sequence that addresses spinal stiffness, hip flexor tightness, and thoracic rotation in the minimal time needed to produce real benefit.',
    credits: 30
  },

  {
    id: 'hip-flexor-progressive',
    name: 'Hip Flexor Progressive Series',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'hip-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hip-flexor', 'quadriceps', 'lower-back'],
    contraindications: ['knee-acute', 'lower-back-acute'],
    energyRequired: 3,
    duration: 600,
    perSide: true,
    instructions: [
      'Start in a kneeling lunge — right knee down, left foot forward',
      'Hold for 30 seconds in the basic lunge position',
      'Add a posterior pelvic tilt — tuck the tailbone under — hold 15 seconds more',
      'Reach the right arm overhead — side stretch — 15 seconds',
      'Rotate the torso right, opening the chest — 15 seconds',
      'Lower to the half-kneeling position with foot elevated on a chair behind — 30 seconds',
      'Switch sides and repeat the full sequence'
    ],
    coaching: 'Progress through each phase only when you feel the previous one has fully released. Rushing the sequence means not getting the benefit of any individual position.',
    why: 'A systematic hip flexor sequence that progressively addresses all components — length, rotation, and overhead reach. More effective than any single static stretch.',
    credits: 35
  }

];
