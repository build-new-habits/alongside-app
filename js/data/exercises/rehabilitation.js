/**
 * data/exercises/rehabilitation.js
 * Rehabilitation and activation exercises — condition-specific, physio-informed
 * contentType: 'rehabilitation' or 'activation'
 * rehabPhase: 'acute' | 'subacute' | 'maintenance'
 *
 * Batch 2: Glute activation and rehabilitation (16 items)
 * Addresses missing 'glutes' condition from conditions.js
 */

export const REHABILITATION = [

  // ============================================
  // GLUTE ACTIVATION — Batch 2
  // Low energyRequired (1–3), safe for most conditions
  // Used as session warm-up prepended by coach
  // ============================================

  {
    id: 'clamshell-activation',
    name: 'Clamshell — Glute Activation',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute'],
    energyRequired: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your side with hips stacked and knees bent at about 45°',
      'Keep your feet together throughout the movement',
      'Slowly rotate your top knee open toward the ceiling',
      'Stop when your hip starts to roll back — the range is small',
      'Pause for 1 second at the top, then lower with control',
      'Complete 15 reps, then turn over and repeat on the other side'
    ],
    coaching: 'Small and controlled beats big and sloppy every time. If you feel it burning in the side of your hip, it is working.',
    why: 'Activates gluteus medius — the hip stabiliser that protects your knees and lower back in every movement.',
    credits: 25
  },

  {
    id: 'clamshell-banded',
    name: 'Banded Clamshell',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: ['resistance-band'],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Loop a resistance band just above your knees',
      'Lie on your side, hips stacked, knees bent at 45°',
      'Press against the band as you open your top knee toward the ceiling',
      'Keep your feet together and hips from rolling',
      'Lower slowly — do not let the band snap back',
      'Complete 15 reps each side'
    ],
    coaching: 'Choose a band that makes the last 3 reps feel genuinely hard. Too easy means too light a band.',
    why: 'The resistance band increases gluteus medius activation compared to bodyweight alone — more effective for rehab and strength building.',
    credits: 30
  },

  {
    id: 'glute-bridge-activation',
    name: 'Glute Bridge — Activation',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet flat on the floor hip-width apart',
      'Arms relaxed at your sides',
      'Squeeze your glutes, then press through your feet to lift your hips',
      'Drive hips up until your body forms a straight line from shoulders to knees',
      'Hold for 2 seconds at the top — really squeeze',
      'Lower slowly and repeat for 15 reps'
    ],
    coaching: 'The squeeze at the top is the whole point. If you rush past it, you are losing half the benefit.',
    why: 'Glute bridge directly activates the glutes and teaches the brain to use them — essential before any lower body workout.',
    credits: 25
  },

  {
    id: 'glute-bridge-single-leg',
    name: 'Single-Leg Glute Bridge',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'glutes',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, knees bent, feet flat',
      'Lift your right foot off the floor, extending that leg straight',
      'Press through your left foot and squeeze your left glute to lift your hips',
      'Keep your hips level — do not let the unsupported side drop',
      'Hold for 2 seconds, lower with control',
      'Complete 10 reps, then switch legs'
    ],
    coaching: 'Hips staying level is the challenge. If they drop, go back to the two-legged version and build more strength first.',
    why: 'Single-leg work reveals and corrects side-to-side glute strength imbalances — important for runners and anyone with hip or knee pain.',
    credits: 40
  },

  {
    id: 'donkey-kick',
    name: 'Donkey Kick',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-extension',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Start on hands and knees, wrists under shoulders, knees under hips',
      'Keep your right knee bent at 90° throughout',
      'Lift your right leg, driving the heel toward the ceiling',
      'Stop when your hip is fully extended — do not arch your lower back',
      'Lower slowly and repeat',
      'Complete 15 reps each side'
    ],
    coaching: 'Think about pressing the ceiling with your heel, not just swinging the leg up. Your back should stay flat.',
    why: 'Isolates glute max with minimal load on other structures — ideal for glute rehab and activation.',
    credits: 25
  },

  {
    id: 'fire-hydrant',
    name: 'Fire Hydrant',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['wrist-elbow-acute', 'hip-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Start on hands and knees, wrists under shoulders, knees under hips',
      'Keeping your knee bent, lift your right leg out to the side',
      'Raise until your thigh is parallel to the floor — like a dog at a fire hydrant',
      'Keep your hips level and core engaged throughout',
      'Lower slowly and repeat',
      'Complete 15 reps each side'
    ],
    coaching: 'Keep your weight even through both hands. It wants to shift — resist it.',
    why: 'Works the gluteus medius from a different angle than clamshells — together they give full hip stabiliser coverage.',
    credits: 25
  },

  {
    id: 'side-lying-hip-abduction',
    name: 'Side-Lying Hip Abduction',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute'],
    energyRequired: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your side, body in a straight line, head resting on your arm',
      'Keep your top leg straight and foot flexed',
      'Lift your top leg to about 45° — no higher',
      'Hold for 1 second at the top',
      'Lower slowly — do not let it drop',
      'Complete 15 reps, then switch sides'
    ],
    coaching: 'Toes pointing slightly down works the glutes harder. Toes up shifts more load to the hip flexors.',
    why: 'Directly targets the gluteus medius and minimus — essential for hip stability and IT band health.',
    credits: 25
  },

  {
    id: 'resistance-band-walk-lateral',
    name: 'Resistance Band Walk — Lateral',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hip', 'quadriceps'],
    contraindications: ['knee-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Loop a resistance band just above your knees',
      'Stand with feet hip-width apart, slight squat position',
      'Step your right foot out to the side, then follow with your left',
      'Keep constant tension on the band — feet never come together',
      'Take 10 steps right, then 10 steps left — that is one set',
      'Complete 3 sets'
    ],
    coaching: 'Stay low throughout. Standing up straight makes it too easy and loses the glute engagement.',
    why: 'One of the most effective glute med exercises. Used in knee rehab, hip rehab, and as a warm-up before running and jumping.',
    credits: 35
  },

  {
    id: 'monster-walk',
    name: 'Monster Walk',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hip', 'quadriceps'],
    contraindications: ['knee-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Loop a resistance band just above your knees or ankles',
      'Stand in a quarter-squat, feet shoulder-width apart',
      'Walk forward, stepping each foot out and forward at 45°',
      'Keep your knees tracking over your toes and pushing out against the band',
      'Walk 10 steps forward, then 10 steps back',
      'Complete 3 sets'
    ],
    coaching: 'This looks a bit silly but it is highly effective. The diagonal step pattern works the glutes from hip flexion and abduction together.',
    why: 'Trains the glutes to stabilise the hip and knee during walking and running movements — exactly what they need to do in sport.',
    credits: 35
  },

  {
    id: 'hip-thrust-bodyweight',
    name: 'Hip Thrust — Bodyweight',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'glutes',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring'],
    contraindications: [],
    energyRequired: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Sit on the floor with your upper back resting against a sofa or bench',
      'Feet flat on the floor, knees bent at about 90°',
      'Squeeze your glutes and drive your hips up toward the ceiling',
      'At the top, your torso should be parallel to the floor',
      'Hold for 2 seconds, squeezing hard',
      'Lower slowly and repeat for 12 reps, 3 sets'
    ],
    coaching: 'The range of motion is bigger than a glute bridge because your shoulders are elevated. You will feel the difference.',
    why: 'The hip thrust produces the highest glute activation of any exercise — it is the gold standard for glute development and rehab.',
    credits: 40
  },

  {
    id: 'glute-bridge-march',
    name: 'Glute Bridge March',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'glutes',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'core', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back and set up in a standard glute bridge position',
      'Push up into bridge and hold — hips up, body straight',
      'Slowly lift your right foot a few inches off the floor',
      'Hold for 2 seconds without letting the hips drop or rotate',
      'Return and repeat on the left side',
      'That is one rep — complete 10 reps total, 3 sets'
    ],
    coaching: 'Hips staying perfectly still is the whole challenge. Start with tiny lifts and build range over time.',
    why: 'Combines glute strength with the core stability needed to keep hips level during single-leg movements — bridges the gap between activation and functional strength.',
    credits: 40
  },

  {
    id: 'step-up-glute-focus',
    name: 'Step-Up — Glute Focus',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['glutes', 'quadriceps', 'hamstring'],
    contraindications: ['knee-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand in front of a step or sturdy box — about knee height',
      'Place your right foot fully on the step',
      'Press through your right heel to stand up on the step',
      'Focus on driving through the heel — not pushing off the back foot',
      'Step down slowly with control',
      'Complete 10 reps on the right, then 10 on the left'
    ],
    coaching: 'The heel drive is the key — it shifts the work from quads to glutes. If your back foot pushes off, you are cheating the glutes.',
    why: 'A functional glute strengthener that directly transfers to climbing stairs, hills, and daily movement.',
    credits: 45
  },

  {
    id: 'reverse-lunge-glute-focus',
    name: 'Reverse Lunge — Glute Focus',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: ['dumbbell', 'yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'quadriceps'],
    contraindications: ['knee-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand tall, feet together',
      'Step your right foot straight back, lowering the back knee toward the floor',
      'Keep your front shin vertical — knee stays over ankle',
      'At the bottom, consciously squeeze your front glute',
      'Drive through the front heel to return to standing',
      'Complete 10 reps each leg, 3 sets'
    ],
    coaching: 'Thinking about the front glute changes where you feel the exercise. Most people feel lunges in the quads — this cue shifts it to the glutes.',
    why: 'Reverse lunges load the glutes more than forward lunges and are gentler on the knee — good for glute rehab at any stage.',
    credits: 45
  },

  {
    id: 'standing-hip-abduction',
    name: 'Standing Hip Abduction',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: [],
    energyRequired: 3,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand next to a wall or chair for balance if needed',
      'Stand on your left leg, slight bend in the knee',
      'Lift your right leg out to the side — keep it straight',
      'Lead with your heel, not your toes',
      'Raise to about 30-45° — no higher',
      'Lower slowly and repeat',
      'Complete 15 reps each side'
    ],
    coaching: 'This can be done anywhere — a great one for office breaks or waiting for the kettle. Even small reps add up.',
    why: 'Strengthens the hip abductors in a functional standing position — directly relevant to walking, running, and balance.',
    credits: 25
  },

  {
    id: 'glute-squeeze-isometric',
    name: 'Glute Squeeze — Isometric',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'acute',
    activationTarget: 'glutes',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit or lie in any comfortable position',
      'Squeeze both glutes as hard as you can — like you are trying to hold a coin between them',
      'Hold for 5 seconds',
      'Release fully and rest for 2 seconds',
      'Repeat for 15 reps'
    ],
    coaching: 'This is the simplest glute activation there is. It can be done sitting at a desk, lying in bed, or standing at a bus stop.',
    why: 'Isometric contractions re-establish the brain-to-muscle connection — especially useful after injury or long periods of inactivity.',
    credits: 15
  },

  {
    id: 'prone-hip-extension',
    name: 'Prone Hip Extension',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'acute',
    activationTarget: 'glutes',
    movementPattern: 'hip-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie face down, forehead resting on your hands',
      'Keep your legs straight',
      'Squeeze your right glute and lift that leg just a few inches off the floor',
      'Hold for 2 seconds',
      'Lower slowly — do not let it drop',
      'Complete 15 reps each side'
    ],
    coaching: 'The lift only needs to be a few inches. Squeezing the glute before you lift means the glute does the work, not the lower back.',
    why: 'A safe starting point for glute activation after injury — minimal load, no compression on the spine.',
    credits: 20
  }

];
