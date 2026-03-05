/**
 * data/exercises/strength.js
 * Strength exercises — bodyweight, dumbbell, kettlebell, core
 */

export const STRENGTH = [

  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: [],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet flat on floor hip-width apart',
      'Press feet into floor and squeeze glutes',
      'Lift hips until body forms a straight line from shoulders to knees',
      'Hold 2 seconds at top, then lower slowly',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'Squeeze your glutes at the top - don\'t just push with your heels.',
    why: 'Activates and strengthens glutes, which support the lower back and improve movement.',
    credits: 45
  },

  {
    id: 'bird-dog',
    name: 'Bird Dog',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'lower-back', 'glutes'],
    contraindications: [],
    energyRequired: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Start on hands and knees, wrists under shoulders, knees under hips',
      'Engage your core gently - spine neutral',
      'Slowly extend right arm forward and left leg back simultaneously',
      'Hold 3 seconds, keeping hips level',
      'Return to start and switch sides',
      'Complete 10 reps each side'
    ],
    coaching: 'Imagine a glass of water on your lower back - don\'t spill it.',
    why: 'Builds core stability and coordination without loading the spine.',
    credits: 45
  },

  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'abdominals'],
    contraindications: [],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, arms pointing to ceiling, knees bent at 90° in the air',
      'Press your lower back firmly into the floor - keep it there',
      'Slowly lower your right arm and left leg toward the floor simultaneously',
      'Stop just before your back lifts off the floor',
      'Return to start and switch sides',
      'Complete 8 reps each side'
    ],
    coaching: 'The lower back must stay flat. Smaller movement is better than losing that contact.',
    why: 'Trains deep core stability - the foundation for all other movements.',
    credits: 50
  },

  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    category: 'strength',
    movementPattern: 'squat',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['quadriceps', 'glutes', 'hip-flexor'],
    contraindications: ['knee-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Hold a dumbbell vertically at your chest with both hands',
      'Stand feet shoulder-width apart, toes turned out slightly',
      'Push your knees out as you sit down into a squat',
      'Keep your chest tall and elbows inside your knees at the bottom',
      'Drive through your heels to stand',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'The weight at your chest helps you stay upright - use it.',
    why: 'The goblet position naturally teaches good squat form and builds leg strength.',
    credits: 60
  },

  {
    id: 'push-up',
    name: 'Press-Up',
    category: 'strength',
    movementPattern: 'push',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Start in a plank: hands slightly wider than shoulders, body in a straight line',
      'Lower your chest to the floor, keeping elbows at about 45° from your body',
      'Keep your core tight and hips level throughout',
      'Push back up to the start position',
      'For an easier option, drop to your knees',
      'Complete 3 sets of 8-12 reps'
    ],
    coaching: 'Elbows at 45° protects your shoulders - not flared out wide.',
    why: 'Builds chest, shoulder and tricep strength using just your bodyweight.',
    credits: 60
  },

  {
    id: 'dumbbell-row',
    name: 'Dumbbell Row',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'biceps-triceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Place your right hand and knee on a bench or chair for support',
      'Hold a dumbbell in your left hand, arm hanging down',
      'Pull the dumbbell up toward your hip, leading with your elbow',
      'Keep your back flat and parallel to the floor',
      'Lower slowly and repeat',
      'Complete 3 sets of 10 reps each side'
    ],
    coaching: 'Think about driving your elbow to the ceiling, not curling the weight up.',
    why: 'Builds upper back strength which counteracts the forward posture from sitting.',
    credits: 60
  },

  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 6,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart, holding dumbbells in front of your thighs',
      'Hinge at your hips, pushing them back as you lower the weights',
      'Keep your back flat and the weights close to your legs',
      'Lower until you feel a stretch in your hamstrings - usually mid-shin',
      'Drive hips forward to return to standing',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'This is a hip hinge, not a squat - your knees stay almost straight.',
    why: 'Strengthens the posterior chain - hamstrings, glutes and back - all in one movement.',
    credits: 65
  },

  {
    id: 'plank',
    name: 'Plank',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'abdominals', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 4,
    duration: 60,
    perSide: false,
    instructions: [
      'Place forearms on the floor, elbows under shoulders',
      'Extend legs back, toes on floor',
      'Lift hips to form a straight line from head to heels',
      'Engage your core, squeeze your glutes',
      'Hold for 20-30 seconds to start, building over time',
      'Lower with control'
    ],
    coaching: 'Don\'t let your hips sag or pike up - a straight line is the goal.',
    why: 'The foundation of core stability - protects the spine in all other movements.',
    credits: 45
  },

  {
    id: 'clamshell',
    name: 'Clamshell',
    category: 'strength',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute'],
    energyRequired: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie on your side, hips stacked, knees bent at 45°',
      'Keep your feet together throughout',
      'Rotate your top knee open toward the ceiling, like a clamshell opening',
      'Keep your hips from rolling back',
      'Lower slowly and repeat',
      'Complete 15 reps each side'
    ],
    coaching: 'The movement is small - quality matters more than range. If you feel it in your hip, you\'re doing it right.',
    why: 'Activates the gluteus medius - essential for knee and hip stability.',
    credits: 35
  },

  {
    id: 'reverse-lunge',
    name: 'Reverse Lunge',
    category: 'strength',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['quadriceps', 'glutes', 'hamstring'],
    contraindications: ['knee-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand tall, feet together',
      'Step your right foot straight back, lowering your back knee toward the floor',
      'Keep your front shin vertical and torso upright',
      'Push through your front heel to return to standing',
      'Alternate legs or complete all reps on one side before switching',
      'Complete 3 sets of 10 reps each leg'
    ],
    coaching: 'Stepping back is gentler on the knee than stepping forward - good for most knee conditions.',
    why: 'Builds single-leg strength and balance with less knee stress than a forward lunge.',
    credits: 55
  },

  // ============================================
  // STRENGTH EXPANSION — Batch 8 (15 items)
  // Bodyweight progressions, dumbbell variations, core strength
  // ============================================

  {
    id: 'press-up-incline',
    name: 'Incline Press-Up',
    category: 'strength',
    movementPattern: 'push',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Place your hands on a wall, counter, or bench — the higher the surface, the easier',
      'Walk your feet back until your body forms a straight line',
      'Lower your chest toward the surface, keeping elbows at 45°',
      'Push back to the start',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'A great stepping stone to floor press-ups. Lower the surface height as you get stronger.',
    why: 'Identical movement to a floor press-up but with less bodyweight load — accessible for beginners or those returning after shoulder issues.',
    credits: 40
  },

  {
    id: 'press-up-decline',
    name: 'Decline Press-Up',
    category: 'strength',
    movementPattern: 'push',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 6,
    duration: 90,
    perSide: false,
    instructions: [
      'Place your feet on a chair or bench behind you, hands on the floor',
      'Body forms a straight inclined line — hips do not pike up',
      'Lower your chest toward the floor, elbows at 45°',
      'Push back up',
      'Complete 3 sets of 8 to 10 reps'
    ],
    coaching: 'The elevated feet shift more load onto the upper chest and shoulders. Harder than a standard press-up.',
    why: 'Increases load on the upper chest and front deltoids — a useful progression once floor press-ups feel manageable.',
    credits: 70
  },

  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    category: 'strength',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['quadriceps', 'glutes', 'hip-flexor'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 7,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand about a metre in front of a chair or bench',
      'Place your right foot behind you on the bench, laces down',
      'Lower your right knee toward the floor in a lunge',
      'Keep your front shin vertical and torso upright',
      'Drive through your front heel to stand',
      'Complete 3 sets of 8 reps each side'
    ],
    coaching: 'Find your foot position before adding weight — too close and the front knee travels far forward, too far and you feel it in the hip flexor.',
    why: 'One of the highest-loading single-leg exercises. Builds quad and glute strength that transfers directly to sport and daily life.',
    credits: 75
  },

  {
    id: 'dumbbell-sumo-squat',
    name: 'Dumbbell Sumo Squat',
    category: 'strength',
    movementPattern: 'squat',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['quadriceps', 'glutes', 'adductors'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet wider than shoulder-width, toes turned out at 45°',
      'Hold one dumbbell vertically with both hands between your legs',
      'Sit down into the squat, keeping your chest tall and knees tracking over toes',
      'Drive through your heels to stand',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'The wider stance loads the inner thigh and glutes differently to a standard squat — a useful variation for full lower body development.',
    why: 'Targets the inner thighs and glutes more than a standard squat. Good for hip stability and for people who struggle with knee tracking.',
    credits: 60
  },

  {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with a dumbbell in each hand, arms at your sides',
      'With a slight bend in the elbows, raise both arms out to the sides',
      'Stop when your arms reach shoulder height — no higher',
      'Lower slowly — take 3 counts',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'Lead with your elbows, not your hands. The slow lowering builds more strength than the raising.',
    why: 'Strengthens the medial deltoid — the middle of the three shoulder muscles — which gives the shoulder its rounded shape and lateral stability.',
    credits: 50
  },

  {
    id: 'dumbbell-overhead-press',
    name: 'Dumbbell Overhead Press',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 6,
    duration: 90,
    perSide: false,
    instructions: [
      'Sit or stand, dumbbells at shoulder height, palms facing forward',
      'Press both dumbbells straight up until arms are nearly straight',
      'Lower back to shoulder height slowly',
      'Keep your core braced — do not arch your lower back',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'Seated removes lower back strain — use seated if you have any lower back sensitivity.',
    why: 'The primary overhead pushing movement. Builds shoulder and tricep strength essential for pushing, reaching, and upper body balance.',
    credits: 65
  },

  {
    id: 'dumbbell-bicep-curl',
    name: 'Dumbbell Bicep Curl',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['triceps-biceps'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 4,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with a dumbbell in each hand, palms facing forward, arms at your sides',
      'Curl both dumbbells up toward your shoulders, keeping your elbows still',
      'Squeeze at the top for 1 second',
      'Lower slowly — 3 counts down',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'Elbows stay against your sides. If they swing forward, the weight is too heavy.',
    why: 'Builds bicep strength and elbow flexion capacity — important for lifting, carrying, and pulling movements.',
    credits: 50
  },

  {
    id: 'dumbbell-tricep-extension',
    name: 'Dumbbell Overhead Tricep Extension',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['triceps-biceps'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 4,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit or stand, holding one dumbbell with both hands overhead',
      'Keep your upper arms close to your head',
      'Bend your elbows to lower the dumbbell behind your head',
      'Extend back up, straightening the arms',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'Upper arms stay still and pointed up — only the forearms move. If your elbows flare wide, the weight is too heavy.',
    why: 'The only exercise that works the long head of the tricep in a stretched position — important for elbow extension strength and upper arm balance.',
    credits: 50
  },

  {
    id: 'dumbbell-chest-press-floor',
    name: 'Dumbbell Floor Press',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['dumbbell'],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on the floor with a dumbbell in each hand at chest height',
      'Press both dumbbells up until arms are almost straight',
      'Lower slowly until your upper arms rest on the floor',
      'Pause for 1 second, then press again',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'The floor limits range of motion and removes shoulder instability — safer than a bench for anyone with shoulder concerns.',
    why: 'A bench press alternative requiring no equipment. The floor stop prevents the shoulder from going into a vulnerable position at the bottom.',
    credits: 60
  },

  {
    id: 'inverted-row-table',
    name: 'Inverted Row — Table',
    category: 'strength',
    movementPattern: 'pull',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie under a sturdy table, gripping the edge with both hands',
      'Extend your legs out straight, heels on the floor',
      'Pull your chest up toward the table edge, squeezing shoulder blades together',
      'Lower slowly back to the start',
      'Make it easier by bending your knees, harder by elevating your feet',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'The table edge must be secure. Test it before loading. A dining table works well.',
    why: 'A bodyweight row that builds upper back and bicep strength with no equipment. The horizontal pull pattern is underused and counteracts the forward posture from sitting.',
    credits: 60
  },

  {
    id: 'ab-wheel-rollout',
    name: 'Ab Wheel Rollout',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: ['ab-wheel'],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back', 'shoulder'],
    contraindications: ['lower-back-acute', 'shoulder-acute', 'wrist-elbow-acute', 'abdominals-acute'],
    energyRequired: 7,
    duration: 90,
    perSide: false,
    instructions: [
      'Kneel on a mat, holding the ab wheel with both hands',
      'Start with the wheel under your shoulders',
      'Brace your core hard and slowly roll the wheel forward',
      'Go only as far as you can without your back arching',
      'Roll back in using your core — not momentum',
      'Complete 3 sets of 6 to 8 reps'
    ],
    coaching: 'Start with a very short range — even 20 to 30 cm forward. The range builds over weeks. Back arching means you have gone too far.',
    why: 'One of the highest-demand anti-extension core exercises. Requires and builds significant core strength and shoulder stability together.',
    credits: 80
  },

  {
    id: 'pallof-press',
    name: 'Pallof Press',
    category: 'strength',
    movementPattern: 'anti-rotation',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: [],
    energyRequired: 4,
    duration: 90,
    perSide: true,
    instructions: [
      'Anchor a resistance band at chest height to a door frame or sturdy anchor',
      'Stand side-on to the anchor, holding the band with both hands at your chest',
      'Step away until the band has tension',
      'Press your hands straight out in front of you — resist the band pulling you sideways',
      'Hold for 2 seconds, return to chest',
      'Complete 12 reps each side, 3 sets'
    ],
    coaching: 'Your body wants to rotate toward the anchor. The whole job of your core is to stop that happening. Stay square.',
    why: 'Trains rotational core stability — the ability to resist twisting forces. Directly relevant to carrying, throwing, and almost all sport.',
    credits: 50
  },

  {
    id: 'farmers-carry',
    name: 'Farmer\'s Carry',
    category: 'strength',
    movementPattern: 'carry',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['abdominals', 'lower-back', 'shoulder', 'triceps-biceps'],
    contraindications: [],
    energyRequired: 5,
    duration: 90,
    perSide: false,
    instructions: [
      'Pick up a dumbbell in each hand — a challenging but manageable weight',
      'Stand tall, shoulders back, core braced',
      'Walk forward with short, controlled steps for 20 metres',
      'Turn and walk back',
      'Rest for 60 seconds and repeat 3 times'
    ],
    coaching: 'Do not let the weight pull your shoulders down or your torso lean. Staying tall is the whole exercise.',
    why: 'One of the most functional strength exercises there is — heavy things need carrying. Builds grip, core, and total body strength simultaneously.',
    credits: 60
  },

  {
    id: 'suitcase-carry',
    name: 'Suitcase Carry — Single Arm',
    category: 'strength',
    movementPattern: 'carry',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['abdominals', 'lower-back', 'glutes'],
    contraindications: ['lower-back-acute'],
    energyRequired: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Hold one dumbbell in your right hand at your side',
      'Walk forward for 20 metres, keeping your torso perfectly upright',
      'The weight will try to pull you sideways — resist it with your core',
      'Walk back, then switch hands',
      'Complete 3 lengths each side'
    ],
    coaching: 'Harder than it looks. If you are leaning toward the weight, go lighter. If you are leaning away, you are compensating — also go lighter.',
    why: 'The single-arm version adds a lateral core challenge that the two-arm carry does not — directly trains the QL and obliques against real-world load.',
    credits: 60
  },

  {
    id: 'hip-hinge-drill',
    name: 'Hip Hinge Drill — Bodyweight',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: [],
    energyRequired: 3,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart, a long stick or broom handle held along your spine',
      'The stick should touch your head, upper back, and tailbone — three points of contact',
      'Push your hips back while keeping all three contact points on the stick',
      'Lower until you feel a stretch in the hamstrings',
      'Drive hips forward to return',
      'Complete 10 slow reps — this is a drill, not a loaded exercise'
    ],
    coaching: 'The stick is your teacher — any gap shows you where control breaks down. Most people have never felt a true hip hinge before this drill.',
    why: 'Teaches the hip hinge pattern needed for deadlifts, Romanian deadlifts and good mornings. Doing these loaded without the pattern first causes back injury.',
    credits: 30
  }

];
