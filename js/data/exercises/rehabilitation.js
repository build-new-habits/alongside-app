/**
 * data/exercises/rehabilitation.js
 * Rehabilitation and activation exercises — condition-specific, physio-informed
 * contentType: 'rehabilitation' or 'activation'
 * rehabPhase: 'acute' | 'subacute' | 'maintenance'
 *
 * Batch 2: Glute activation and rehabilitation (16 items)
 * Batch 3: Hamstring rehabilitation (15 items)
 */

export const REHABILITATION = [

  // ============================================
  // GLUTE ACTIVATION & REHABILITATION — Batch 2
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
      'Raise until your thigh is parallel to the floor',
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
    why: 'Combines glute strength with the core stability needed to keep hips level during single-leg movements.',
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
    coaching: 'The heel drive is the key — it shifts the work from quads to glutes.',
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
    equipmentOptional: ['dumbbell'],
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
    why: 'Reverse lunges load the glutes more than forward lunges and are gentler on the knee.',
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
    coaching: 'This can be done anywhere — a great one for office breaks or waiting for the kettle.',
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
  },

  // ============================================
  // HAMSTRING REHABILITATION — Batch 3
  // Three phases: acute (pain/injury), subacute (rebuilding), maintenance (load)
  // Key safety rule: no running, jumping or high load until pain < 3/10
  // ============================================

  {
    id: 'hamstring-isometric-hold',
    name: 'Hamstring Isometric Hold',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'hamstring',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit on the edge of a chair, right foot flat on the floor',
      'Press your right heel firmly into the floor as if trying to drag it back toward the chair',
      'The foot does not actually move — this is an isometric contraction',
      'Hold for 5 seconds, pressing at about 50% of your maximum effort',
      'Release and rest for 5 seconds',
      'Complete 10 reps, then repeat on the left side'
    ],
    coaching: 'Start gently — 30 to 50% effort. Isometric work is safe in the acute phase because there is no movement through the injured tissue.',
    why: 'Isometric contractions maintain hamstring strength and reduce pain during the acute phase without stressing the injury.',
    credits: 20
  },

  {
    id: 'supine-hamstring-stretch',
    name: 'Supine Hamstring Stretch',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat', 'resistance-band'],
    affectsAreas: ['hamstring'],
    contraindications: [],
    energyRequired: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, both knees bent',
      'Lift your right leg and hold behind the thigh with both hands',
      'Slowly straighten the knee until you feel a gentle stretch — not pain',
      'Hold for 30 seconds, breathing normally',
      'Bend the knee and lower the leg',
      'Repeat 3 times each side'
    ],
    coaching: 'A stretch should feel like a pull, never a sharp pain. If it is sharp, bend the knee more until it is just a gentle tension.',
    why: 'Restores hamstring length gently during the subacute phase — important for returning to normal movement patterns.',
    credits: 25
  },

  {
    id: 'active-straight-leg-raise',
    name: 'Active Straight Leg Raise',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hip-flexion',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'hip-flexor', 'core'],
    contraindications: ['lower-back-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie on your back, left knee bent and foot flat, right leg straight',
      'Flex your right foot — toes toward the ceiling',
      'Tighten your right quad and lift the leg to about 45°',
      'Keep the knee locked straight throughout',
      'Hold for 2 seconds, then lower slowly',
      'Complete 15 reps, then switch legs'
    ],
    coaching: 'The quad staying tight is what protects the hamstring here. If the knee bends, the hamstring is doing more work than it should be at this stage.',
    why: 'Builds hamstring control through a safe range — a standard progression in physiotherapy after hamstring strain.',
    credits: 30
  },

  {
    id: 'prone-hamstring-curl',
    name: 'Prone Hamstring Curl',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['hamstring'],
    contraindications: ['lower-back-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie face down, legs straight, forehead resting on your hands',
      'Slowly bend your right knee, bringing your heel toward your bottom',
      'Move through a comfortable range — stop if you feel sharp pain',
      'Hold at the top for 1 second',
      'Lower slowly — take 3 counts to come down',
      'Complete 12 reps each side, 3 sets'
    ],
    coaching: 'The slow lowering (eccentric phase) is where most of the rehab benefit comes from. Do not rush it.',
    why: 'Rebuilds hamstring strength through active range of motion — the next step after isometric work.',
    credits: 35
  },

  {
    id: 'romanian-deadlift-rehab',
    name: 'Romanian Deadlift — Rehab Load',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: ['lower-back-acute', 'hamstring-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart, holding light dumbbells or no weight',
      'Hinge at your hips, pushing them back as you lower your hands toward the floor',
      'Keep your back flat and knees soft — not locked',
      'Lower only until you feel a gentle stretch in the hamstrings — about mid-shin',
      'Drive hips forward to return to standing',
      'Complete 3 sets of 10 reps at a pace that feels controlled'
    ],
    coaching: 'Use the lightest weight that still feels like work. This is rehab, not a strength session — range and control matter more than load.',
    why: 'Progressive hamstring loading through a lengthened position — one of the most effective exercises for hamstring injury rehabilitation.',
    credits: 40
  },

  {
    id: 'nordic-curl-assisted',
    name: 'Nordic Curl — Assisted',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'hamstring',
    movementPattern: 'eccentric-control',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring'],
    contraindications: ['hamstring-acute', 'hamstring-subacute', 'knee-acute'],
    energyRequired: 5,
    duration: 120,
    perSide: false,
    instructions: [
      'Kneel on a mat with ankles held down by a partner, a heavy sofa, or tucked under a bar',
      'Keeping your body straight from knees to head, slowly lower yourself forward',
      'Use your hands to control the descent — catching yourself in a press-up position',
      'Push back up with your hands to the starting position',
      'Focus on making the lowering phase as slow as possible — aim for 3 to 5 seconds down',
      'Complete 3 sets of 5 reps — quality over quantity'
    ],
    coaching: 'This is a hard exercise even for fit people. The hands are there to help — use them. The eccentric lowering is the goal, not the return.',
    why: 'Nordic curls are the most evidence-backed exercise for hamstring injury prevention and rehabilitation. The eccentric loading rebuilds tendon strength.',
    credits: 60
  },

  {
    id: 'hamstring-bridge-curl',
    name: 'Hamstring Bridge Curl',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'glutes'],
    contraindications: ['hamstring-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back with heels on the seat of a chair or low surface',
      'Press through your heels to lift your hips into a bridge',
      'Hold the bridge position while you slowly slide your heels away from you',
      'Extend as far as you can while keeping your hips up',
      'Curl the heels back in to return',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'This works the hamstrings from a lengthened position — which is where most hamstring injuries happen. Start small with the range.',
    why: 'Trains the hamstrings eccentrically through a functional range, building resilience for running and jumping.',
    credits: 45
  },

  {
    id: 'standing-hamstring-curl-band',
    name: 'Standing Hamstring Curl — Band',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['hamstring'],
    contraindications: ['hamstring-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Anchor a resistance band low to a wall or chair leg',
      'Loop the band around your right ankle and stand facing the anchor',
      'Stand on your left leg, slight bend in the knee',
      'Curl your right heel toward your bottom against the band resistance',
      'Lower slowly — take 3 counts',
      'Complete 12 reps each side, 3 sets'
    ],
    coaching: 'The slow lowering is doing most of the work. A 3-second lowering builds more strength than a fast one.',
    why: 'Builds hamstring strength through functional range in a standing position — closer to how the hamstring works in sport and daily movement.',
    credits: 40
  },

  {
    id: 'single-leg-deadlift-rehab',
    name: 'Single-Leg Deadlift — Rehab',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: ['hamstring-acute', 'lower-back-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on your right leg with a soft bend in the knee',
      'Hinge forward at the hip, extending your left leg behind you for balance',
      'Lower until your torso and left leg are roughly parallel to the floor',
      'Keep your hips square — do not let the left hip rotate open',
      'Drive through the right heel to return to standing',
      'Complete 10 reps each side, 3 sets'
    ],
    coaching: 'Balance is hard at first — holding a wall lightly is fine. Build up to freestanding over time.',
    why: 'Trains single-leg hamstring strength and balance together — essential for returning to running and any sport involving one-leg landing.',
    credits: 50
  },

  {
    id: 'hamstring-90-90-stretch',
    name: 'Hamstring 90-90 Stretch',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'lower-back'],
    contraindications: [],
    energyRequired: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Sit on the floor, right leg straight out in front, left leg bent to the side',
      'Sit tall — do not let your lower back round',
      'Hinge forward at the hip over your straight leg',
      'Reach toward your right foot — only as far as you can with a flat back',
      'Hold for 30 seconds, breathing deeply',
      'Repeat 3 times each side'
    ],
    coaching: 'Round back means you are stretching your lower back, not your hamstring. Sit on a cushion if your back rounds immediately.',
    why: 'Restores hamstring length with the hip in a position that closely mimics running — more functional than a lying hamstring stretch.',
    credits: 25
  },

  {
    id: 'hamstring-neural-floss',
    name: 'Hamstring Neural Flossing',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'sciatic-nerve'],
    contraindications: ['hamstring-acute'],
    energyRequired: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Sit in a chair, right foot flat on the floor',
      'Slowly straighten your right knee until you feel a gentle stretch',
      'At the same time, look up and extend your neck slightly',
      'Hold for just 1 second — this is not a held stretch',
      'Bend the knee back down and drop your chin',
      'Repeat this alternating movement rhythmically for 30 reps, then switch sides'
    ],
    coaching: 'This is a neural mobilisation, not a muscle stretch. The rhythmic movement flushes the sciatic nerve — it should feel releasing, not painful.',
    why: 'Hamstring tightness is often partly neural, not just muscular. Neural flossing addresses both and is particularly useful when the hamstring feels tight but not torn.',
    credits: 25
  },

  {
    id: 'walking-lunge-short-stride',
    name: 'Walking Lunge — Short Stride',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'hamstring',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'glutes', 'quadriceps'],
    contraindications: ['hamstring-acute', 'knee-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand tall, feet together',
      'Take a shorter than normal step forward with your right foot',
      'Lower your back knee toward the floor in a controlled lunge',
      'Push through both feet to bring your back foot forward to the next step',
      'Keep the stride short — longer strides increase hamstring load',
      'Complete 3 sets of 10 reps each leg, rest 60 seconds between sets'
    ],
    coaching: 'Short strides are deliberate here — as the hamstring heals, you can progressively lengthen them over weeks.',
    why: 'Returns the hamstring to functional loading through normal gait patterns — a key step before returning to running.',
    credits: 45
  },

  {
    id: 'copenhagen-adductor',
    name: 'Copenhagen Adductor',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'hamstring',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'adductors', 'hip'],
    contraindications: ['hamstring-acute', 'hip-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your side, top leg resting on a bench or chair at hip height',
      'Keep your top leg straight and supported',
      'Lift your bottom leg up to meet the top leg',
      'Hold for 2 seconds, then lower slowly',
      'Complete 10 reps each side, 3 sets'
    ],
    coaching: 'This is harder than it looks. Start with a lower surface if needed. The adductor and hamstring work together here — both benefit.',
    why: 'Strengthens the inner thigh and hamstring together — clinically used for groin and hamstring injury prevention in sport.',
    credits: 50
  },

  {
    id: 'towel-hamstring-curl',
    name: 'Towel Hamstring Curl',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'glutes'],
    contraindications: ['hamstring-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back on a smooth floor with heels on a folded towel',
      'Lift your hips into a bridge position',
      'Keeping your hips up, slide your heels away from you by straightening your legs',
      'Slide out as far as you can while keeping the hips up',
      'Curl back in by bending the knees',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'The smooth floor lets the towel slide easily. If it sticks, try socks on a wooden floor instead.',
    why: 'A low-equipment eccentric hamstring exercise that builds strength through the lengthened range — the range most prone to injury.',
    credits: 40
  },

  // ============================================
  // CALF & ACHILLES REHABILITATION — Batch 4
  // Addresses: calves, achilles conditions
  // Key rule: eccentric work is the clinical standard for Achilles rehab
  // No jumping or running while Achilles is symptomatic
  // ============================================

  {
    id: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'calves',
    movementPattern: 'calf-raise',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit in a chair with feet flat on the floor, hip-width apart',
      'Slowly raise both heels as high as you can, pressing through the balls of your feet',
      'Hold at the top for 1 second',
      'Lower slowly — take 3 counts to come down',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'The slow lowering is where the healing happens. Do not let the heels drop quickly.',
    why: 'Safe starting point for calf loading after acute injury — seated position removes body weight load while still working the muscle.',
    credits: 20
  },

  {
    id: 'standing-calf-raise-eccentric',
    name: 'Eccentric Heel Drop',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'calf-raise',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'achilles'],
    contraindications: ['calves-acute', 'achilles-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on a step with both feet, heels hanging off the edge',
      'Rise up on both feet to the top position',
      'Shift your weight to your right foot only',
      'Slowly lower your right heel below the step level — take 3 to 4 seconds',
      'Use both feet to rise back up — never lower on both',
      'Complete 3 sets of 15 reps each side'
    ],
    coaching: 'The lowering phase is the entire point. Rising on two feet is just resetting — all the work is in the slow single-leg descent.',
    why: 'Eccentric heel drops are the most evidence-backed treatment for Achilles tendinopathy. The slow lengthening under load remodels and strengthens the tendon.',
    credits: 35
  },

  {
    id: 'single-leg-calf-raise',
    name: 'Single-Leg Calf Raise',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'calves',
    movementPattern: 'calf-raise',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'achilles'],
    contraindications: ['calves-acute', 'achilles-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand near a wall for balance support',
      'Shift your weight onto your right foot, left foot lightly lifted',
      'Slowly rise onto the ball of your right foot as high as you can',
      'Hold for 1 second at the top',
      'Lower slowly — 3 counts down',
      'Complete 3 sets of 12 reps each side'
    ],
    coaching: 'Full range matters — press all the way up, lower all the way down. Half reps build half the strength.',
    why: 'Progresses from eccentric-only to full concentric and eccentric loading — the next step in returning the calf and Achilles to full strength.',
    credits: 35
  },

  {
    id: 'achilles-heel-drop-straight',
    name: 'Achilles Heel Drop — Straight Knee',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'eccentric-control',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['achilles', 'calves'],
    contraindications: ['achilles-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on a step with the ball of your right foot on the edge, heel hanging off',
      'Keep your right knee straight throughout',
      'Slowly lower your heel below the step level over 4 seconds',
      'Use your left foot to help you rise back to the start position',
      'Complete 3 sets of 15 reps each side',
      'This targets the gastrocnemius — the upper calf muscle'
    ],
    coaching: 'Some mild discomfort is expected during Achilles rehab. Sharp pain means stop. Mild ache during and after is normal at this stage.',
    why: 'The straight-knee version targets the gastrocnemius — the larger, outer calf muscle that attaches directly to the Achilles tendon.',
    credits: 35
  },

  {
    id: 'achilles-heel-drop-bent',
    name: 'Achilles Heel Drop — Bent Knee',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'eccentric-control',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['achilles', 'calves'],
    contraindications: ['achilles-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on a step with the ball of your right foot on the edge, heel hanging off',
      'Bend your right knee to about 30° and keep it there throughout',
      'Slowly lower your heel below the step level over 4 seconds',
      'Use your left foot to help you rise back to the start',
      'Complete 3 sets of 15 reps each side',
      'This targets the soleus — the lower, deeper calf muscle'
    ],
    coaching: 'Do both the straight and bent-knee versions — they target different parts of the calf and both connect to the Achilles.',
    why: 'The bent-knee version targets the soleus — the deeper calf muscle whose tendon blends into the Achilles. Essential for complete Achilles rehabilitation.',
    credits: 35
  },

  {
    id: 'standing-calf-stretch-wall',
    name: 'Standing Calf Stretch — Wall',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'achilles'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand facing a wall, hands on the wall for support',
      'Step your right foot back about a metre, keeping it flat on the floor',
      'Keep your back knee straight and press your back heel into the floor',
      'Lean gently toward the wall until you feel a stretch in your right calf',
      'Hold for 30 seconds, then switch sides',
      'Repeat 3 times each side'
    ],
    coaching: 'The heel must stay flat on the floor — that is what gives the stretch. If the heel lifts, step the foot closer.',
    why: 'Maintains calf and Achilles flexibility during rehabilitation — reduced flexibility is a significant risk factor for re-injury.',
    credits: 20
  },

  {
    id: 'soleus-stretch-bent-knee',
    name: 'Soleus Stretch — Bent Knee',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'achilles'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand facing a wall, hands on the wall',
      'Step your right foot back about half a metre',
      'Bend your right knee and sink down gently, keeping the heel flat',
      'You should feel the stretch lower down — in the deeper calf, just above the heel',
      'Hold for 30 seconds, then switch',
      'Repeat 3 times each side'
    ],
    coaching: 'This feels different to the standard calf stretch — lower and tighter. That is the soleus. Both stretches are needed for full Achilles health.',
    why: 'Stretches the soleus, which is commonly neglected. Tight soleus increases Achilles load during walking and running.',
    credits: 20
  },

  {
    id: 'ankle-alphabet',
    name: 'Ankle Alphabet',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'acute',
    activationTarget: 'calves',
    movementPattern: 'ankle-mobility',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['ankle-foot', 'calves'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit in a chair with your right leg extended or crossed over your left knee',
      'Using just your ankle and foot — not your whole leg — trace the letters of the alphabet',
      'Move through the full range each letter allows',
      'Complete the full alphabet on the right, then switch to the left'
    ],
    coaching: 'This looks simple but covers every direction your ankle moves. It is one of the best all-round ankle mobility exercises there is.',
    why: 'Restores ankle range of motion and proprioception after injury — safe in the acute phase because there is no load through the joint.',
    credits: 15
  },

  {
    id: 'banded-ankle-dorsiflexion',
    name: 'Banded Ankle Dorsiflexion',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'ankle-mobility',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['ankle-foot', 'calves', 'achilles'],
    contraindications: ['achilles-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Anchor a resistance band around a table leg or door frame at ankle height',
      'Loop the band around the top of your right foot, just above the toes',
      'Step back so the band pulls your foot forward',
      'Lunge forward slowly, bending your right knee over your right toes',
      'Keep your right heel flat on the floor throughout',
      'Hold for 2 seconds, step back, repeat 15 times each side'
    ],
    coaching: 'The band provides a small distraction to the ankle joint that helps restore range. This is a common physio technique.',
    why: 'Improves ankle dorsiflexion range — limited dorsiflexion is linked to calf tightness, Achilles problems, knee pain, and running injuries.',
    credits: 25
  },

  {
    id: 'calf-foam-roll',
    name: 'Calf Foam Roll',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'self-massage',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['calves'],
    contraindications: ['calves-acute'],
    energyRequired: 2,
    duration: 120,
    perSide: true,
    instructions: [
      'Sit on the floor with your right calf resting on the foam roller',
      'Lift your hips off the floor, supporting yourself on your hands',
      'Slowly roll from just above the ankle to just below the back of the knee',
      'Pause for 20 to 30 seconds on any tight or tender spots',
      'Cross your left ankle over your right to add more pressure if needed',
      'Roll for 60 seconds per leg'
    ],
    coaching: 'Roll slowly — about one inch per second. Tender spots mean the tissue needs more time there, not faster movement.',
    why: 'Reduces calf tension and improves tissue quality — supports Achilles health and reduces injury recurrence risk.',
    credits: 25
  }

];
