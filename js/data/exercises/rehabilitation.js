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
  },

  // ============================================
  // KNEE, IT BAND & SHIN REHABILITATION — Batch 5
  // Addresses: knee, it-band, shin-splints conditions
  // VMO work for knee tracking, IT band protocol, tibialis anterior loading
  // ============================================

  {
    id: 'terminal-knee-extension',
    name: 'Terminal Knee Extension',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'knee',
    movementPattern: 'isometric',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'knee'],
    contraindications: ['knee-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: true,
    instructions: [
      'Anchor a resistance band behind you at knee height',
      'Loop the band around the back of your right knee',
      'Stand on your right leg, knee slightly bent, band pulling it forward',
      'Straighten your knee against the band resistance — squeeze the quad at the end',
      'Hold for 2 seconds, then slowly bend back to the start',
      'Complete 15 reps each side, 3 sets'
    ],
    coaching: 'The squeeze at full extension activates the VMO — the teardrop-shaped muscle on the inner quad that stabilises the kneecap.',
    why: 'Terminal knee extensions specifically target the VMO, which is often weak in knee pain. Strengthening it improves kneecap tracking and reduces pain.',
    credits: 30
  },

  {
    id: 'vmo-squat',
    name: 'VMO Squat',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'knee',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['quadriceps', 'knee', 'glutes'],
    contraindications: ['knee-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet closer than shoulder-width, toes turned out at 45°',
      'Lower into a squat, pushing your knees out over your little toes',
      'Only go as deep as feels comfortable — even a small range is fine',
      'At the bottom, pause for 1 second',
      'Drive through your heels to stand, squeezing the quads hard at the top',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'The wide toe angle and outward knee push shifts load onto the VMO. This is not about depth — it is about the quad squeeze at the top.',
    why: 'The turned-out foot position preferentially loads the VMO over the outer quad, helping to rebalance the forces acting on the kneecap.',
    credits: 35
  },

  {
    id: 'step-down-eccentric',
    name: 'Step-Down — Eccentric',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'knee',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'knee', 'glutes'],
    contraindications: ['knee-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on a step or stair on your right leg',
      'Slowly lower your left foot toward the floor — take 4 seconds',
      'Keep your right knee tracking over your second toe — do not let it cave inward',
      'Touch the floor lightly, do not fully weight it',
      'Drive back up through your right heel to the start',
      'Complete 10 reps each side, 3 sets'
    ],
    coaching: 'Watch your knee in a mirror if possible. It should track straight — not collapsing inward. Slowing down helps keep it honest.',
    why: 'Eccentric step-downs are a benchmark test and treatment for knee pain. The slow lowering builds quad and glute control under load.',
    credits: 40
  },

  {
    id: 'wall-squat-hold',
    name: 'Wall Squat Hold — Isometric',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'knee',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'knee', 'glutes'],
    contraindications: [],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with your back flat against a wall',
      'Walk your feet out and slide down until your knees are at about 90° — or less if that hurts',
      'Keep your back flat against the wall, weight through your heels',
      'Hold the position for 20 to 45 seconds',
      'Stand back up slowly',
      'Complete 3 holds with 30 seconds rest between'
    ],
    coaching: 'Find the angle that produces a muscle burn but no knee pain. That is your working range — stay there.',
    why: 'Isometric quad loading reduces knee pain while building strength — safe in acute and early subacute phases when movement is painful.',
    credits: 30
  },

  {
    id: 'it-band-foam-roll',
    name: 'IT Band Foam Roll',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'it-band',
    movementPattern: 'self-massage',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['it-band', 'quadriceps', 'hip'],
    contraindications: ['it-band-acute'],
    energyRequired: 2,
    duration: 120,
    perSide: true,
    instructions: [
      'Lie on your right side with the foam roller under your outer right thigh',
      'Support yourself on your right forearm, left foot flat on the floor in front',
      'Slowly roll from just below the hip to just above the knee',
      'Pause for 20 to 30 seconds on any tight spots — especially the outer thigh',
      'Avoid rolling directly over the knee joint',
      'Roll for 60 to 90 seconds per side'
    ],
    coaching: 'The IT band itself cannot be stretched — it is a thick band of connective tissue. You are releasing the muscles around it. It will be tender.',
    why: 'Reduces tension in the lateral thigh and TFL muscle, which can reduce pain along the IT band. Most effective when combined with glute strengthening.',
    credits: 30
  },

  {
    id: 'lateral-quad-stretch',
    name: 'Lateral Quad and IT Band Stretch',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'it-band',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['it-band', 'quadriceps', 'hip'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand near a wall for balance',
      'Cross your right foot behind your left',
      'Lean your hips to the left, shifting your weight onto your left foot',
      'You should feel a stretch along the outer right hip and thigh',
      'Hold for 30 seconds, then switch sides',
      'Repeat 3 times each side'
    ],
    coaching: 'The further you lean the hips to the side, the deeper the stretch. Start gentle and increase over time.',
    why: 'One of the few effective stretches for the lateral hip and IT band region. Complements foam rolling well.',
    credits: 20
  },

  {
    id: 'tfl-release-standing',
    name: 'TFL and Hip Flexor Release',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'it-band',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['it-band', 'hip-flexor', 'hip'],
    contraindications: ['knee-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Kneel on your right knee, left foot forward in a lunge position',
      'Shift your hips forward gently until you feel a stretch in the front of the right hip',
      'Now rotate your torso slightly to the right and reach your right arm overhead',
      'You should feel a stretch along the outer hip and side of the thigh',
      'Hold for 30 seconds, then switch sides',
      'Repeat 3 times each side'
    ],
    coaching: 'The rotation is what makes this target the TFL. Without it, it is just a hip flexor stretch.',
    why: 'Releases the TFL — the muscle at the top of the IT band that is often the true source of IT band tension.',
    credits: 25
  },

  {
    id: 'tibialis-anterior-raise',
    name: 'Tibialis Anterior Raise',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'shin-splints',
    movementPattern: 'ankle-mobility',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shin-splints', 'ankle-foot'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit in a chair with feet flat on the floor',
      'Lift both toes and forefeet off the floor, keeping heels down',
      'Hold for 2 seconds at the top',
      'Lower slowly',
      'Complete 3 sets of 20 reps',
      'Progress to standing with back against wall once seated is easy'
    ],
    coaching: 'You will feel this in the muscle running along the outer shin. That is exactly where it should be.',
    why: 'Strengthens the tibialis anterior — the muscle most involved in shin splints. Directly addresses the source of the pain.',
    credits: 20
  },

  {
    id: 'shin-splint-calf-raise-progression',
    name: 'Shin Splint Calf Raise Progression',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shin-splints',
    movementPattern: 'calf-raise',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shin-splints', 'calves'],
    contraindications: ['shin-splints-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand near a wall for balance',
      'Rise up onto your toes — calf raise — for 2 counts',
      'At the top, shift your weight forward and lower back down by pulling your toes up — heel drop',
      'This combines a calf raise with a tibialis raise in one movement',
      'Complete 3 sets of 15 reps',
      'Rest at least 48 hours between sessions while shins are symptomatic'
    ],
    coaching: 'This is a progression — only start it once the tibialis raise is pain-free. Do not push through sharp shin pain.',
    why: 'Balances strength between the calf and tibialis anterior — the imbalance between these two muscles is a primary cause of shin splints.',
    credits: 30
  },

  {
    id: 'balance-single-leg-hold',
    name: 'Single-Leg Balance Hold',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'subacute',
    activationTarget: 'knee',
    movementPattern: 'proprioception',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['knee', 'ankle-foot', 'glutes'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand on your right leg, left foot lightly lifted',
      'Find your balance — a slight bend in the right knee',
      'Hold for 30 seconds without touching down',
      'Increase the challenge by closing your eyes, or standing on a folded towel',
      'Switch legs and repeat',
      'Complete 3 holds each side'
    ],
    coaching: 'Wobbling is the point — it means your stabilisers are working. Only hold a wall if you are about to fall.',
    why: 'Restores proprioception — the body\'s sense of joint position. Lost after any lower limb injury and essential to recover before returning to sport.',
    credits: 25
  },

  {
    id: 'patella-mobilisation',
    name: 'Patella Mobilisation',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'knee',
    movementPattern: 'joint-mobilisation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['knee'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit on the floor with your right leg straight out in front of you',
      'Let the leg fully relax — quad completely soft',
      'Place your thumbs on the top of your kneecap, fingers on the sides',
      'Gently glide the kneecap up, down, left and right — small movements',
      'Spend about 60 seconds on each direction',
      'The kneecap should move freely — if it feels stuck in one direction, spend more time there'
    ],
    coaching: 'This only works when the quad is completely relaxed. If the muscle is on, the kneecap is locked in place.',
    why: 'Maintains kneecap mobility during rehabilitation and recovery from surgery. A stuck kneecap contributes to pain and limits knee flexion.',
    credits: 20
  },

  {
    id: 'y-balance-reach',
    name: 'Y-Balance Reach',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'knee',
    movementPattern: 'proprioception',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['knee', 'ankle-foot', 'glutes', 'hip'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on your right leg, hands on hips',
      'While keeping your balance, reach your left foot forward as far as you can — touch the floor lightly',
      'Return to centre without putting full weight on the left foot',
      'Reach to the side — as far as you can',
      'Return, then reach diagonally behind you',
      'Each of the three directions is one rep — complete 5 full reps each side'
    ],
    coaching: 'Distance matters less than control. A short, controlled reach is better than a long one that makes you hop or twist.',
    why: 'The Y-balance test is used clinically to assess injury risk and rehabilitation progress. As an exercise it builds the full lower limb stability needed to return to sport.',
    credits: 40
  },

  // ============================================
  // SHOULDER, UPPER BACK & WRIST REHABILITATION — Batch 6
  // Addresses: shoulder, upper-back, wrist-elbow, chest-pecs, biceps-triceps
  // Rotator cuff, scapular stability, wrist prep
  // ============================================

  {
    id: 'pendulum-swing',
    name: 'Pendulum Swing',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'shoulder',
    movementPattern: 'joint-mobilisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shoulder'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand next to a table or chair, leaning forward with your left hand on it for support',
      'Let your right arm hang completely loose — no tension',
      'Use your body and legs to gently swing the arm in small circles',
      'Let gravity and momentum do the work — do not use the shoulder muscles',
      'Circle clockwise for 30 seconds, then anticlockwise for 30 seconds',
      'Switch arms and repeat'
    ],
    coaching: 'This is a passive exercise — the arm swings like a pendulum, not an active movement. Any muscular effort defeats the purpose.',
    why: 'Creates gentle traction on the shoulder joint, reducing pain and maintaining range of motion in the acute phase when active movement is too painful.',
    credits: 20
  },

  {
    id: 'external-rotation-band',
    name: 'External Rotation — Band',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'shoulder-rotation',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'rotator-cuff'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Anchor a resistance band at elbow height beside you',
      'Hold the band in your right hand, elbow bent at 90°, upper arm against your side',
      'Keep your elbow tucked in and rotate your forearm away from your body',
      'Move slowly — 2 seconds out, 2 seconds back',
      'Complete 3 sets of 15 reps each side'
    ],
    coaching: 'The elbow stays glued to your side. The moment it lifts, you are using the wrong muscles.',
    why: 'Strengthens the infraspinatus and teres minor — two of the four rotator cuff muscles. Weakness here is the most common cause of shoulder impingement.',
    credits: 30
  },

  {
    id: 'internal-rotation-band',
    name: 'Internal Rotation — Band',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'shoulder-rotation',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'rotator-cuff'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Anchor a resistance band at elbow height on the opposite side to your working arm',
      'Hold the band in your right hand, elbow bent at 90°, upper arm against your side',
      'Rotate your forearm toward your body against the band resistance',
      'Move slowly — 2 seconds in, 2 seconds back',
      'Complete 3 sets of 15 reps each side'
    ],
    coaching: 'Same rule as external rotation — elbow stays against your side. Do both internal and external in every shoulder rehab session.',
    why: 'Strengthens the subscapularis — the rotator cuff muscle on the front of the shoulder. Balance between internal and external rotation is critical for shoulder health.',
    credits: 30
  },

  {
    id: 'wall-slide',
    name: 'Wall Slide',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'scapular-activation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'upper-back', 'rotator-cuff'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with your back flat against a wall, feet slightly out from the wall',
      'Press your arms against the wall, elbows at 90° — like a goalpost position',
      'Slowly slide both arms up the wall as high as you can while keeping contact',
      'Keep your lower back, upper back and arms touching the wall throughout',
      'Slide back down slowly',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'The wall gives you honest feedback — any gap tells you where your mobility and control are limited.',
    why: 'Trains the lower trapezius and serratus anterior together — the muscles that control the shoulder blade and create a stable base for the shoulder joint.',
    credits: 30
  },

  {
    id: 'shoulder-cars',
    name: 'Shoulder CARs',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'shoulder',
    movementPattern: 'joint-mobilisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand tall, core lightly engaged',
      'Lift your right arm forward, then arc it up over your head — keeping the arm as far from your body as possible',
      'Continue the arc behind you, then down and back to the start',
      'Move as slowly as you can, maintaining maximum tension throughout',
      'The entire circle should take 5 to 10 seconds',
      'Complete 5 circles each direction each side'
    ],
    coaching: 'CARs stands for Controlled Articular Rotations. Slower is better — you are exploring and building range at the same time.',
    why: 'Takes the shoulder through its full available range under active muscular control — maintains joint health and builds awareness of limitations.',
    credits: 30
  },

  {
    id: 'prone-ytw',
    name: 'Prone Y-T-W',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'scapular-activation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['upper-back', 'shoulder', 'rotator-cuff'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie face down on a mat, arms at your sides',
      'Y position: Lift both arms diagonally overhead — thumbs up — hold 2 seconds',
      'Lower, then T position: Lift both arms straight out to the sides — hold 2 seconds',
      'Lower, then W position: Bend elbows to 90°, lift upper arms to shoulder height — hold 2 seconds',
      'That is one Y-T-W rep',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'These are small movements with low weight — the difficulty comes from volume and holding position, not from load.',
    why: 'Directly targets the lower and mid trapezius — muscles that are almost always weak in people with shoulder and neck pain from sitting.',
    credits: 35
  },

  {
    id: 'scapular-pushup',
    name: 'Scapular Press-Up',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'scapular-activation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['shoulder', 'upper-back'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Start in a high plank position — arms straight, hands under shoulders',
      'Keep the arms completely straight throughout — no elbow bending',
      'Let your chest drop toward the floor by allowing the shoulder blades to squeeze together',
      'Then push the floor away, spreading the shoulder blades apart',
      'The movement is only in the shoulder blades — about 3 to 5 cm',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'Most people have never felt this movement before. It takes a few reps to find it. If arms are bending, it is a press-up — not a scapular press-up.',
    why: 'Activates the serratus anterior — the muscle that holds the shoulder blade against the ribcage. Weakness here causes winging and shoulder impingement.',
    credits: 25
  },

  {
    id: 'doorway-chest-stretch',
    name: 'Doorway Chest Stretch',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand in a doorway, arms raised to shoulder height, elbows bent at 90°',
      'Place forearms on the door frame',
      'Step one foot forward and lean gently into the doorway',
      'Feel the stretch across the front of the chest and shoulders',
      'Hold for 30 seconds',
      'Repeat 3 times'
    ],
    coaching: 'Lean forward slowly — do not throw yourself into the stretch. A gentle sustained pull works better than a hard fast one.',
    why: 'Releases pec minor tightness that pulls the shoulder blade forward — one of the most common postural problems from sitting and screen use.',
    credits: 20
  },

  {
    id: 'wrist-cars',
    name: 'Wrist CARs',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'acute',
    activationTarget: 'wrist-elbow',
    movementPattern: 'joint-mobilisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['wrist-elbow'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit or stand, right arm extended forward at shoulder height',
      'Make a gentle fist',
      'Slowly circle the wrist through its full range — as big a circle as possible',
      'Move at about 5 seconds per full circle',
      'Complete 5 circles clockwise and 5 anticlockwise each side'
    ],
    coaching: 'This is a daily maintenance exercise — 2 minutes a day prevents most wrist problems from building up.',
    why: 'Maintains wrist joint health and range of motion. Particularly useful for anyone who types, uses a mouse, or does press-ups regularly.',
    credits: 15
  },

  {
    id: 'wrist-extension-stretch',
    name: 'Wrist Extension Stretch',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'wrist-elbow',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['wrist-elbow', 'biceps-triceps'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Extend your right arm in front of you, palm facing down',
      'Use your left hand to gently bend the right wrist upward — fingers pointing to the ceiling',
      'Hold for 20 seconds',
      'Then turn the palm up and gently bend the wrist down — fingers pointing to the floor',
      'Hold for 20 seconds',
      'Switch sides and repeat'
    ],
    coaching: 'Gentle and sustained is the goal. These stretches work best when held for at least 20 seconds.',
    why: 'Maintains wrist flexor and extensor length — important for preventing and managing tennis elbow, golfer\'s elbow and repetitive strain.',
    credits: 15
  },

  {
    id: 'forearm-pronation-supination',
    name: 'Forearm Pronation and Supination',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'wrist-elbow',
    movementPattern: 'joint-mobilisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['wrist-elbow', 'biceps-triceps'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit with your right elbow bent at 90°, upper arm against your side',
      'Hold a light object like a pen or small water bottle',
      'Rotate your palm to face the ceiling — supination',
      'Then rotate your palm to face the floor — pronation',
      'Move slowly through the full range, pausing at each end for 1 second',
      'Complete 15 slow reps each side, 3 sets'
    ],
    coaching: 'The weight of even a light object adds enough load to make this therapeutic. As strength returns, use a slightly heavier object.',
    why: 'Restores forearm rotation — commonly restricted after wrist or elbow injury. Essential for almost every upper body movement.',
    credits: 20
  },

  {
    id: 'grip-strength-towel',
    name: 'Grip Strengthening — Towel Squeeze',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'wrist-elbow',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['wrist-elbow', 'biceps-triceps'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Roll up a small towel or use a soft ball',
      'Hold it in your right hand',
      'Squeeze as firmly as comfortable — not maximum effort',
      'Hold for 5 seconds, then release fully',
      'Rest for 3 seconds between reps',
      'Complete 15 reps each hand, 3 sets'
    ],
    coaching: 'Release completely between reps — full release is as important as the squeeze for building endurance.',
    why: 'Rebuilds grip strength after wrist or elbow injury. Grip strength is also a reliable indicator of overall upper limb health.',
    credits: 20
  },

  // ============================================
  // CORE & LOWER BACK REHABILITATION — Batch 7
  // Addresses: abdominals, sciatica, lower-back conditions
  // Highest safety-critical batch — contraindications carefully set
  // No spinal flexion under load. No sit-ups or crunches here.
  // ============================================

  {
    id: 'pelvic-tilt',
    name: 'Pelvic Tilt',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'lower-back',
    movementPattern: 'spinal-flexion-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'abdominals'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back with knees bent, feet flat on the floor',
      'Notice the small gap between your lower back and the floor',
      'Gently flatten your lower back into the floor by tightening your abs and tilting your pelvis',
      'Hold for 5 seconds — breathe normally, do not hold your breath',
      'Release and let the natural arch return',
      'Complete 15 reps'
    ],
    coaching: 'This is a tiny movement — it should not involve lifting your hips. Just a gentle rocking of the pelvis.',
    why: 'Activates the deep abdominal muscles that support the lumbar spine — the starting point for all lower back rehabilitation.',
    credits: 15
  },

  {
    id: 'diaphragmatic-breathing-core',
    name: 'Diaphragmatic Breathing — Core Activation',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'abdominals',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: [],
    energyRequired: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, one hand on your chest and one on your belly',
      'Breathe in slowly through your nose — let your belly rise, chest stays still',
      'As you breathe out, gently draw your belly button toward your spine',
      'Hold that gentle drawing-in for a moment before the next breath in',
      'This is 360-degree core activation — not sucking in hard, just a gentle engagement',
      'Continue for 2 minutes'
    ],
    coaching: 'The engagement is gentle — about 20% of maximum. If you are holding your breath or gripping hard, you are doing too much.',
    why: 'The deep core — transversus abdominis and pelvic floor — activates with the breath. This re-establishes that connection after injury or inactivity.',
    credits: 20
  },

  {
    id: 'dead-bug-progression-1',
    name: 'Dead Bug — Progression 1',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'abdominals',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, arms pointing to the ceiling, knees bent at 90° lifted in the air',
      'Press your lower back firmly into the floor — keep it there throughout',
      'Slowly lower your right arm toward the floor overhead',
      'Hold for 2 seconds — back stays flat',
      'Return the arm and repeat on the left',
      'Complete 8 reps each side, 3 sets'
    ],
    coaching: 'Arms only to start. The lower back staying flat is everything — reduce the range if it lifts.',
    why: 'Trains the anti-extension function of the core — the most important job the abs do in protecting the spine.',
    credits: 35
  },

  {
    id: 'dead-bug-progression-2',
    name: 'Dead Bug — Progression 2',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'abdominals',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, arms to the ceiling, knees at 90° in the air',
      'Press your lower back into the floor',
      'Slowly extend your right leg out straight — heel hovering above the floor',
      'Hold for 2 seconds',
      'Return and repeat on the left',
      'Complete 8 reps each side, 3 sets'
    ],
    coaching: 'Leg only this time. Harder than it looks — the longer lever of the leg challenges the lower back more than the arm.',
    why: 'Progresses dead bug to leg extension — the pattern used in walking and running where the core must prevent the back from arching.',
    credits: 40
  },

  {
    id: 'dead-bug-progression-3',
    name: 'Dead Bug — Progression 3',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'abdominals',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, arms to the ceiling, knees at 90° in the air',
      'Press your lower back into the floor',
      'Simultaneously lower your right arm overhead and extend your left leg out',
      'Hold for 2 seconds — opposite limbs working together',
      'Return and switch sides',
      'Complete 8 reps each side, 3 sets'
    ],
    coaching: 'The opposite arm and leg combination is the full version. If the lower back lifts at all, go back to progressions 1 or 2.',
    why: 'The full dead bug pattern — opposite limb extension that directly trains the core stability needed for walking, running, and all sport.',
    credits: 45
  },

  {
    id: 'bird-dog-rehab',
    name: 'Bird Dog — Core Rehab',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'lower-back',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'abdominals', 'glutes'],
    contraindications: ['lower-back-acute', 'wrist-elbow-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Start on hands and knees, wrists under shoulders, knees under hips',
      'Engage your core gently — spine neutral, not arched or rounded',
      'Slowly extend your right arm forward and left leg back at the same time',
      'Hips stay level — do not rotate or hike',
      'Hold for 3 seconds, return slowly',
      'Complete 10 reps each side, 3 sets'
    ],
    coaching: 'Imagine a glass of water on your lower back. Do not spill it.',
    why: 'Trains the deep spinal stabilisers in a low-load, safe position. A standard first-line exercise in lower back rehabilitation worldwide.',
    credits: 35
  },

  {
    id: 'mckenzie-extension',
    name: 'McKenzie Press-Up',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'lower-back',
    movementPattern: 'spinal-flexion-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie face down, hands flat on the floor under your shoulders',
      'Keeping your hips on the floor, slowly press your upper body up',
      'Go only as far as feels comfortable — your hips should stay heavy on the floor',
      'Hold for 2 seconds at the top',
      'Lower slowly',
      'Complete 10 reps'
    ],
    coaching: 'This is a directional exercise — it helps some back conditions and not others. If it increases leg pain or makes symptoms worse, stop and see a physio.',
    why: 'McKenzie extension reduces disc pressure and is one of the most evidence-backed treatments for discogenic lower back pain and sciatica.',
    credits: 25
  },

  {
    id: 'sciatic-neural-floss',
    name: 'Sciatic Neural Flossing',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'sciatica',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['sciatica', 'lower-back', 'hamstring'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Sit upright in a chair',
      'Slowly straighten your right knee while simultaneously extending your neck — looking up',
      'Hold for just 1 second — this is not a held stretch',
      'Bend the knee back and drop your chin to your chest',
      'Repeat rhythmically — the movement is like a slow pump',
      'Complete 30 reps each side'
    ],
    coaching: 'Neural flossing should never cause sharp pain down the leg. A gentle pulling sensation is expected. If it causes sharp pain, stop.',
    why: 'Mobilises the sciatic nerve by creating a pumping action that reduces inflammation and adhesions along the nerve path.',
    credits: 25
  },

  {
    id: 'seated-lumbar-rotation',
    name: 'Seated Lumbar Rotation',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'lower-back',
    movementPattern: 'spinal-rotation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['lower-back', 'spine'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit upright in a chair, feet flat on the floor',
      'Cross your arms over your chest',
      'Slowly rotate your upper body to the right — as far as feels comfortable',
      'Hold for 2 seconds',
      'Return to centre and rotate left',
      'Complete 10 reps each side'
    ],
    coaching: 'Move from your mid-back, not just your shoulders. Imagine your spine is the axis of rotation.',
    why: 'Maintains spinal rotation mobility and reduces stiffness — safe in the acute phase because it is unloaded and low range.',
    credits: 15
  },

  {
    id: 'ql-stretch-side-bend',
    name: 'QL Stretch — Side Bend',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'lower-back',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['lower-back'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand with feet hip-width apart',
      'Raise your right arm overhead',
      'Lean slowly to the left, reaching the right arm over in an arc',
      'You should feel a stretch along the right side of your lower back',
      'Hold for 30 seconds, then switch sides',
      'Repeat 3 times each side'
    ],
    coaching: 'Keep your hips level — they want to shift as you lean. Resist that to get the stretch in the right place.',
    why: 'Stretches the quadratus lumborum — the deep lower back muscle that is one of the most common sources of lower back tightness and pain.',
    credits: 20
  },

  {
    id: 'mcgill-curl-up',
    name: 'McGill Curl-Up',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'abdominals',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back, right knee bent and foot flat, left leg straight',
      'Place both hands under your lower back to maintain its natural arch',
      'Lift only your head and shoulders — not a full sit-up, just a few centimetres',
      'Keep your lower back pressed into your hands throughout',
      'Hold for 10 seconds, then lower',
      'Complete 3 sets of 5 reps'
    ],
    coaching: 'The hands under the back are not for comfort — they hold the natural spinal curve that protects the discs. Without them, this becomes a harmful crunch.',
    why: 'Developed by spine researcher Stuart McGill — activates the rectus abdominis while maintaining spinal alignment. Safer than sit-ups or crunches for most back conditions.',
    credits: 30
  },

  {
    id: 'side-plank-modified',
    name: 'Side Plank — Modified',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'abdominals',
    movementPattern: 'anti-lateral-flexion',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back', 'glutes'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute', 'abdominals-acute'],
    energyRequired: 4,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie on your right side, knees bent, elbow under your shoulder',
      'Lift your hips off the floor, forming a straight line from knees to head',
      'Keep your core engaged and hips forward — do not let them roll',
      'Hold for 15 to 20 seconds to start, building over time',
      'Lower and switch sides',
      'Complete 3 holds each side'
    ],
    coaching: 'The modified version from knees is completely valid. Build the hold time before progressing to full side plank from feet.',
    why: 'Trains the lateral core — the quadratus lumborum and obliques — which resist sideways bending forces on the spine. Part of the McGill Big Three for back rehabilitation.',
    credits: 35
  }


  ,

  // ============================================
  // PELVIC FLOOR REHABILITATION — Batch 11a
  // Addresses: pelvic-floor condition
  // Safe for all genders. Full release as important as contraction.
  // ============================================

  {
    id: 'kegel-basic',
    name: 'Pelvic Floor Contraction — Basic',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'pelvic-floor',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['pelvic-floor', 'abdominals'],
    contraindications: [],
    energyRequired: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Sit, stand, or lie comfortably — this works in any position',
      'Imagine you are trying to stop the flow of urine and hold in wind at the same time',
      'Gently squeeze and lift the muscles inward and upward',
      'Hold for 5 seconds — breathe normally, do not hold your breath',
      'Release fully and rest for 5 seconds — the full release matters as much as the squeeze',
      'Repeat 10 times, 3 sets per day'
    ],
    coaching: 'Most people hold their breath or tense their glutes and thighs instead. Check: can you still breathe freely? If not, reduce the effort.',
    why: 'Strengthens the pelvic floor — the hammock of muscles supporting the bladder, bowel, and reproductive organs. Weak pelvic floor contributes to leakage, prolapse risk, and low back instability.',
    credits: 15
  },

  {
    id: 'kegel-quick-flicks',
    name: 'Pelvic Floor Quick Flicks',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'pelvic-floor',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['pelvic-floor'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit or stand comfortably',
      'Perform a quick, sharp contraction of the pelvic floor — squeeze and immediately release',
      'The movement is fast — about 1 second on, 1 second off',
      'Complete 10 quick flicks, then rest for 10 seconds',
      'Repeat 3 times'
    ],
    coaching: 'Quick flicks train the fast-twitch pelvic floor fibres — the ones that respond to a cough, sneeze, or jump. Both slow holds and quick flicks are needed.',
    why: 'The fast-twitch pelvic floor muscles prevent leakage during sudden pressure increases. Slow holds alone do not train this.',
    credits: 15
  },

  {
    id: 'bridge-pelvic-floor',
    name: 'Glute Bridge with Pelvic Floor',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'pelvic-floor',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['pelvic-floor', 'glutes', 'lower-back'],
    contraindications: [],
    energyRequired: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet flat on the floor',
      'On your inhale, prepare',
      'On your exhale, gently engage your pelvic floor as you press through your feet to lift your hips',
      'Hold the bridge at the top for 3 seconds — maintain the pelvic floor engagement',
      'Inhale as you lower back down, releasing the pelvic floor completely',
      'Complete 10 reps, 3 sets'
    ],
    coaching: 'Linking pelvic floor engagement to the exhale and the lift mirrors how the pelvic floor naturally works with breathing and movement.',
    why: 'Integrates pelvic floor activation into a functional movement pattern — a step beyond isolated contractions toward real-world strength.',
    credits: 30
  },

  {
    id: 'squat-pelvic-floor',
    name: 'Squat with Pelvic Floor Awareness',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'pelvic-floor',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['pelvic-floor', 'glutes', 'quadriceps'],
    contraindications: ['knee-acute'],
    energyRequired: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly turned out',
      'As you lower into the squat, allow the pelvic floor to gently lengthen and release',
      'At the bottom, pause for 1 second',
      'As you stand up and exhale, gently engage the pelvic floor — squeeze and lift',
      'At the top, fully release before the next rep',
      'Complete 3 sets of 12 reps, moving slowly'
    ],
    coaching: 'The pelvic floor should lengthen on the way down and lift on the way up — like a lift going down as you descend and up as you rise.',
    why: 'Trains the pelvic floor to work dynamically under load — the functional demand it faces in daily life and sport.',
    credits: 35
  },

  // ============================================
  // HYPERMOBILITY REHABILITATION — Batch 11b
  // Addresses: hypermobility condition (EDS, HSD, generalised hypermobility)
  // CRITICAL: No end-range passive stretching. All items prioritise STABILITY.
  // ============================================

  {
    id: 'hypermobility-joint-awareness',
    name: 'Joint Position Awareness',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'hypermobility',
    movementPattern: 'proprioception',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit or stand in a comfortable, neutral position',
      'Bring attention to your joints one at a time — ankles, knees, hips, spine, shoulders, wrists',
      'For each joint, notice: is it in its neutral, mid-range position?',
      'Gently adjust any joint that has drifted to end range — locked knees, hyperextended elbows',
      'Hold the mid-range position with gentle muscular effort — do not lock out',
      'Spend 5 minutes practising finding and holding neutral alignment'
    ],
    coaching: 'People with hypermobility often unconsciously rest in their ligaments rather than their muscles. This practice builds the habit of active mid-range holding.',
    why: 'Proprioception — the sense of joint position — is often reduced in hypermobility. Training it is the foundation of managing hypermobile joints safely.',
    credits: 20
  },

  {
    id: 'hypermobility-knee-stability',
    name: 'Knee Stability — Soft Knee Hold',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'hypermobility',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['knee', 'quadriceps'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand on your right leg near a wall for balance if needed',
      'Bend the knee to about 10 to 15 degrees — just enough so it is not locked straight',
      'Hold this soft-knee position using your quad muscles — actively, not passively',
      'You should feel a gentle engagement in the front of the thigh',
      'Hold for 20 seconds, then stand normally',
      'Repeat 5 times each side'
    ],
    coaching: 'This tiny bend is doing a lot. Locking the knee out is easy — holding it slightly bent with muscular control takes real work for hypermobile joints.',
    why: 'Trains the quads to actively stabilise the knee rather than relying on the ligaments. Reduces knee hyperextension, pain, and instability.',
    credits: 20
  },

  {
    id: 'hypermobility-shoulder-packing',
    name: 'Shoulder Packing',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'acute',
    activationTarget: 'hypermobility',
    movementPattern: 'scapular-activation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'upper-back'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit or stand with arms relaxed at your sides',
      'Without shrugging, gently draw your shoulder blades down and back — not hard, just engaged',
      'Hold for 5 seconds',
      'Release fully',
      'Repeat 10 times',
      'Begin to notice this position throughout the day and return to it when shoulders drift'
    ],
    coaching: 'Think of your shoulder blades sliding into back pockets. The movement is subtle — not a big retraction.',
    why: 'Creates active shoulder girdle stability — essential for hypermobile shoulders that rely on passive structures and are prone to subluxation and pain.',
    credits: 15
  },

  {
    id: 'hypermobility-hip-stability',
    name: 'Hip Stability in Standing',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hypermobility',
    movementPattern: 'proprioception',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip', 'glutes', 'lower-back'],
    contraindications: [],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on your right leg, left foot just hovering off the floor',
      'Check: is your hip in neutral? Avoid hiking it up or dropping it',
      'Find the position where your pelvis is level and hips directly over the foot',
      'Hold with gentle glute and core activation — not gripping, just engaged',
      'Hold for 30 seconds, switch sides',
      'Complete 3 holds each side'
    ],
    coaching: 'Most hypermobile people stand by hanging into the hip — ligaments taking the load. This builds the muscular alternative.',
    why: 'Single-leg hip stability is essential for every step taken, for stairs, and for any sport. Building it reduces hip pain and the risk of joint damage over time.',
    credits: 25
  }


  ,

  // REHABILITATION EXPANSION — Final 10 items

  {
    id: 'rehab-knee-terminal-extension',
    name: 'Knee Terminal Extension',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'extension',
    rehabPhase: 'subacute',
    activationTarget: 'knee',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'knee'],
    contraindications: ['knee-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: true,
    instructions: [
      'Anchor a resistance band at knee height and loop it behind the knee',
      'Stand with the leg slightly bent — about 15 to 20 degrees',
      'Extend the knee to full straight — squeeze the quad at the end',
      'Return to slight bend slowly',
      'Complete 3 sets of 15 reps each side'
    ],
    coaching: 'Terminal extension specifically targets the VMO — the inner quad muscle most affected by knee injury and most responsible for knee stability.',
    why: 'Knee terminal extension is a core exercise in ACL and patellofemoral rehabilitation — it restores the final degrees of extension strength without loading the joint in vulnerable positions.',
    credits: 35
  },

  {
    id: 'rehab-shoulder-y-t-w',
    name: 'Y-T-W Exercise',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'pull',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    equipment: [],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['upper-back', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie face down on a bench or floor',
      'Y: raise both arms to form a Y — thumbs up — 10 reps',
      'T: raise both arms to form a T — thumbs up — 10 reps',
      'W: bend elbows to 90 degrees and raise, squeezing shoulder blades — 10 reps',
      'Use a very light weight or no weight to start',
      'Complete 3 sets of each'
    ],
    coaching: 'The Y-T-W directly targets the lower and middle trapezius — muscles almost universally undertrained and responsible for shoulder stability.',
    why: 'Y-T-W is a clinical rehabilitation staple for shoulder impingement, rotator cuff issues, and postural dysfunction. Restores scapular control and stability.',
    credits: 40
  },

  {
    id: 'rehab-ankle-proprioception',
    name: 'Ankle Proprioception Progression',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'balance',
    rehabPhase: 'subacute',
    activationTarget: 'ankle-foot',
    equipment: [],
    equipmentOptional: ['balance-board'],
    affectsAreas: ['ankle-foot', 'calves'],
    contraindications: ['ankle-foot-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Level 1: Single-leg stand on flat ground — 60 seconds each side',
      'Level 2: Single-leg stand on a folded towel — 45 seconds',
      'Level 3: Single-leg stand with eyes closed on flat ground — 30 seconds',
      'Level 4: Single-leg stand on a balance board — 45 seconds',
      'Progress levels only when the current level is fully controlled',
      'Complete 3 sets at whatever level is currently appropriate'
    ],
    coaching: 'Ankle sprains damage the proprioceptive nerves as much as the ligaments. Restoring balance and proprioception prevents re-injury more than any other intervention.',
    why: 'Proprioception training is the most important component of ankle sprain rehabilitation — people who skip this step have very high re-injury rates within the first year of return to sport.',
    credits: 40
  },

  {
    id: 'rehab-wrist-flexion-extension',
    name: 'Wrist Flexion-Extension Strengthening',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'joint-rotation',
    rehabPhase: 'subacute',
    activationTarget: 'wrist-elbow',
    equipment: ['dumbbell'],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['wrist-elbow'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Sit with the forearm resting on a table, wrist over the edge',
      'Hold a light dumbbell — 0.5 to 1kg',
      'Flex the wrist upward — palm faces up, lift',
      'Lower with control',
      'Complete 3 sets of 20 reps',
      'Then flip the forearm over for extension: palm down, raise the back of the hand'
    ],
    coaching: 'Start lighter than feels necessary. Wrist tendons are slow to recover and easy to re-injure with too much load too soon.',
    why: "Wrist flexor and extensor strengthening restores the forearm strength balance disrupted by tennis elbow, golfer's elbow, and repetitive strain injuries.",
    credits: 35
  },

  {
    id: 'rehab-cervical-deep-flexors',
    name: 'Deep Cervical Flexor Activation',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'isometric',
    rehabPhase: 'acute',
    activationTarget: 'neck',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder'],
    contraindications: [],
    energyRequired: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back, a small rolled towel under the neck',
      'Gently nod the chin toward the chest — as if squashing a small orange under the chin',
      'The movement is very small — 5 to 10 degrees only',
      'Hold for 10 seconds, breathing normally',
      'Release completely',
      'Repeat 10 times'
    ],
    coaching: 'This is a subtle exercise — not a strong chin tuck. The deep cervical flexors are small and fatigue quickly. Quality of activation is everything.',
    why: 'Deep cervical flexor weakness is present in almost all people with neck pain and headaches. This specific activation exercise is the cornerstone of neck pain rehabilitation.',
    credits: 25
  },

  {
    id: 'rehab-hip-flexor-strengthening',
    name: 'Hip Flexor Strengthening',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'hip-rotation',
    rehabPhase: 'subacute',
    activationTarget: 'hip',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['hip-flexor', 'abdominals'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Loop a resistance band around your ankle and anchor it behind you',
      'Stand on one leg, face away from the anchor',
      'Drive the banded knee up to hip height against the resistance',
      'Lower with control — resist the band pulling the leg back',
      'Complete 3 sets of 15 reps each side'
    ],
    coaching: 'Hip flexor weakness is often overlooked in lower back and hip pain rehabilitation. It is one of the most important muscles for gait, stair climbing, and running.',
    why: 'Hip flexor strength — not just flexibility — is essential for healthy hip mechanics. Weakness leads to compensatory patterns that drive knee, hip, and lower back pain.',
    credits: 40
  },

  {
    id: 'rehab-lateral-hip-strengthening',
    name: 'Lateral Hip Strengthening Progression',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'hip-rotation',
    rehabPhase: 'subacute',
    activationTarget: 'hip',
    equipment: [],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: [],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Clamshells × 20 each side',
      'Side-lying leg raise × 15 each side',
      'Standing hip abduction × 15 each side',
      'Single-leg squat touch-down × 10 each side (touch toe to floor, return)',
      'Progress through phases as each becomes easy',
      'Add a resistance band around the knees for additional load'
    ],
    coaching: 'Lateral hip strength is the foundation of lower limb health — it affects knee alignment, IT band tension, and lower back stability all at once.',
    why: 'Lateral hip weakness is implicated in patellofemoral pain, IT band syndrome, gluteal tendinopathy, and lower back pain. A single rehabilitation series addresses all of these.',
    credits: 50
  },

  {
    id: 'rehab-thoracic-mobility-rehab',
    name: 'Thoracic Mobility — Rehabilitation',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'extension',
    rehabPhase: 'subacute',
    activationTarget: 'thoracic',
    equipment: [],
    equipmentOptional: ['foam-roller', 'yoga-mat'],
    affectsAreas: ['thoracic', 'upper-back'],
    contraindications: [],
    energyRequired: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Foam roller extension: 5 segments × 5 breaths each',
      'Seated rotation: 10 each side',
      'Thread the needle from hands and knees: 10 each side',
      'Wall slides: 10 reps',
      'Open book from side-lying: 10 each side',
      'Complete daily in the early phases of rehabilitation'
    ],
    coaching: 'Thoracic stiffness is a primary contributor to neck pain, shoulder impingement, and lower back pain — often overlooked in rehabilitation programs that treat these in isolation.',
    why: 'Thoracic mobility restoration is foundational for shoulder, neck, and lower back rehabilitation. Improving thoracic movement reduces compensatory demands on adjacent joints.',
    credits: 45
  },

  {
    id: 'rehab-breathing-rehab',
    name: 'Breathing Retraining — Rehabilitation',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'breath-awareness',
    rehabPhase: 'acute',
    activationTarget: 'abdominals',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: [],
    energyRequired: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet flat',
      'Place one hand on the chest, one on the belly',
      'Breathe in — the belly hand should rise, the chest hand should stay still',
      'This is diaphragmatic breathing — belly breathing',
      'If the chest rises first, the breathing pattern is inverted',
      'Practice 10 minutes of belly-only breathing',
      'Once established lying down, practice seated, then standing'
    ],
    coaching: 'Diaphragmatic breathing restores intra-abdominal pressure regulation — the foundation of core stability. Without it, all other core rehabilitation is built on unstable ground.',
    why: 'Altered breathing patterns are found in almost all people with chronic lower back pain and postural dysfunction. Restoring diaphragmatic breathing is the first step in core rehabilitation.',
    credits: 25
  },

  {
    id: 'rehab-neural-flossing',
    name: 'Neural Flossing — Sciatic Nerve',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'extension',
    rehabPhase: 'subacute',
    activationTarget: 'sciatica',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'lower-back'],
    contraindications: ['sciatica-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit upright on the edge of a chair',
      'Extend the right leg straight, simultaneously look up',
      'Return: bend the knee and look down',
      'This creates a pumping action through the sciatic nerve',
      'The movement should feel like a gentle pull — never sharp pain',
      'Complete 10 very slow reps each side'
    ],
    coaching: 'Neural flossing creates movement of the nerve through its pathway — like flossing between teeth. If any movement produces sharp radiating pain, stop immediately.',
    why: 'Neural mobilisation techniques improve nerve mobility and reduce neural tension in sciatica rehabilitation. Evidence shows superior outcomes compared to stretching alone.',
    credits: 30
  }

];
