/**
 * data/exercises/strength.js
 * 15 Aug 2026 v7
 *
 * v7 - DIFF-1. Six technically demanding lifts re-rated. Power Clean,
 *   Kettlebell Snatch and Turkish Get-Up were all rated 3 -- the same as
 *   a Barbell Hip Thrust -- and light/returning both cap at 3.
 *
 * 11 Aug 2026 v6
 *
 * v6 - CON-9 batch 1. watchOut and load added to all 90 entries in this
 *   file. This was the first file done because it carries the highest
 *   physical risk: 84 of the 90 involve external load, including every
 *   barbell lift in the product.
 *
 *   Written to the Exercise Entry Standard's rules for watchOut -- name
 *   the error AND its correction, describe what it feels like rather than
 *   only what it looks like, no fear language, no shame, and pain is
 *   always a plain stop. Load is effort-relative throughout; no absolute
 *   weight appears anywhere, per Locked Principle P4.
 *
 * 11 Aug 2026 v5
 *
 * v5 - watchOut and load added to both Pallof press entries, at Graeme's
 *   request ("the one I love is a pallof press"). Neither had them, so
 *   the exercise he uses most rendered without the two things he had
 *   asked the product to provide. A cable version was also added in
 *   gym.js -- two band versions existed and no cable one, despite the
 *   cable being how it is usually done in a gym.
 *
 * 10 Aug 2026 v4
 *
 * v4 — Added tailored YouTube search terms to all 90 exercises
 *   (previously zero coverage, database-wide 461-exercise pass,
 *   Graeme's direct request: "we get the most up to date versions and
 *   avoid any issue with discontinued or old videos" — search terms,
 *   not direct links, matching the reasoning exactly).
 *
 * v3 — Content decision, Graeme's call: Dead Bug's empty
 *   contraindications confirmed correct as-is — it's a standard
 *   anti-extension stabilisation exercise, commonly used specifically
 *   as a safe option during low-back issues, not one typically
 *   avoided. Bird Dog's lower-back/glutes exclusions also confirmed
 *   correct as-is (same anti-extension logic), but a real gap found
 *   and fixed: it puts real weight through the wrists (hands-and-knees
 *   position), which nothing previously captured. Added
 *   wrist-elbow-acute. Resolves the dead-bug/bird-dog discrepancy
 *   flagged during Phase B pool consolidation, 04 Aug — this data now
 *   feeds prescribed-session.js's real-time contraindication check,
 *   not just descriptive content.
 *
 * 04 Aug 2026 v2 — Phase B, Home Nav & Conditions Redesign (core-session.js pool
 *   consolidation). Added sets/reps/holdSeconds/rest/cues/description
 *   fields to 7 records (dead-bug, bird-dog, plank, ab-wheel-rollout,
 *   pallof-press, band-pallof-press, isometric-hollow-hold) — additive
 *   only, no existing field changed. These exercises were previously
 *   duplicated in full inside core-session.js's own private pool;
 *   that pool now resolves ids against this file instead. First
 *   version header on this file; added now.
 *
 * Strength exercises — bodyweight, dumbbell, kettlebell, core
 */

export const STRENGTH = [

  {
    id: 'glute-bridge',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Glute Bridge',
    youtube: 'glute bridge exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: ['hamstring-acute', 'glutes-acute', 'lower-back-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
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
        watchOut: [
      'Pushing through the toes rather than the heels, which brings the hamstrings in instead of the glutes',
      'Over-arching at the top rather than finishing level',
      'Hips dropping to one side, which usually means one glute is doing more work'
    ],
    load: 'Bodyweight. Progress by holding longer at the top or moving to single leg.',
    credits: 45
  },

  {
    id: 'bird-dog',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Bird Dog',
    youtube: 'bird dog exercise technique',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'lower-back', 'glutes'],
    contraindications: ['glutes-acute', 'lower-back-acute', 'wrist-elbow-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
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
        watchOut: [
      'Hips rotating as you reach, which is the sign to reach less far',
      'Arching the lower back as the leg extends',
      'Reaching high rather than long; think about length, not height'
    ],
    load: 'Bodyweight. Progress by slowing down, not by adding weight.',
    credits: 45,
    sets: 3,
    reps: "8 each side",
    holdSeconds: 3,
    rest: 45,
    description: "On hands and knees, brace your core. Extend your right arm and left leg simultaneously, holding for 3 seconds. Return slowly. Repeat on the opposite side.",
    cues: [
      "Keep your hips level — no rotation",
      "Your extended arm and leg should be parallel to the floor",
      "Draw your belly button gently toward your spine before you move",
      "The 3-second hold is where the work happens"
    ],
  },

  {
    id: 'dead-bug',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Dead Bug',
    youtube: 'dead bug exercise technique',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'abdominals'],
    contraindications: [],
    energyRequired: 4,
    difficultyLevel: 2,
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
        watchOut: [
      'Lower back lifting off the floor as the limbs extend — reduce the range until it stays down',
      'Holding your breath; breathe out as you extend',
      'Moving quickly, which lets momentum do the work'
    ],
    load: 'Bodyweight. Progress by extending further while the back stays flat.',
    credits: 50,
    sets: 3,
    reps: "8 each side",
    holdSeconds: 0,
    rest: 45,
    description: "Lie on your back, arms pointing to the ceiling, knees bent to 90 degrees above your hips. Slowly lower opposite arm and leg toward the floor — keeping your lower back pressed firmly down. Return and repeat on the other side.",
    cues: [
      "Lower back stays in contact with the floor throughout",
      "Breathe out as you lower the limbs",
      "Move slowly — 3 seconds down, 3 seconds back",
      "If your back lifts, reduce the range of motion"
    ],
  },

  {
    id: 'goblet-squat',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Goblet Squat',
    youtube: 'goblet squat exercise technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['quadriceps', 'glutes', 'hip-flexor'],
    contraindications: ['knee-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
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
        watchOut: [
      'Knees falling inward as you stand up — think about pushing them gently outwards',
      'Heels lifting off the floor at the bottom, which usually means the ankles need more range; go shallower for now',
      'Rounding the lower back at the bottom of the squat, so stop where your back is still flat',
      'Elbows drifting away from your body, which pulls you forward'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your chest stays upright throughout.',
    credits: 60
  },

  {
    id: 'push-up',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Press-Up',
    youtube: 'press-up exercise technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
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
        watchOut: [
      'Hips sagging towards the floor or piking upwards',
      'Elbows flaring straight out to the sides rather than at forty-five degrees',
      'Head dropping forward before the chest does',
      'Only going halfway down; chest to fist height is the target'
    ],
    load: 'Bodyweight. Progress by moving from incline to flat to decline.',
    credits: 60
  },

  {
    id: 'dumbbell-row',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Row',
    youtube: 'dumbbell row exercise technique',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'biceps-triceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
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
        watchOut: [
      'Rounding the lower back — set your back flat before the first rep and hold it',
      'Shrugging the shoulder up towards the ear instead of driving the elbow back',
      'Twisting the torso to help the weight up, which is the sign to go lighter',
      'Rushing the lowering; it should take about twice as long as the pull'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your back stays completely still.',
    credits: 60
  },

  {
    id: 'plank',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Plank',
    youtube: 'plank exercise technique',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['core', 'abdominals', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
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
        watchOut: [
      'Hips creeping upwards, which makes it easier without you noticing',
      'Lower back sagging, which is the point to stop the set',
      'Holding your breath; breathe normally throughout'
    ],
    load: 'Bodyweight. Progress by holding longer, not by adding weight before form is solid.',
    credits: 45,
    sets: 3,
    reps: null,
    holdSeconds: 30,
    rest: 60,
    description: "Forearms on the floor, elbows under shoulders. Body forms a straight line from head to heels. Hold.",
    cues: [
      "Squeeze your glutes — this protects your lower back",
      "Push the floor away through your forearms",
      "Breathe normally throughout — no breath-holding",
      "If hips sag, that's your stopping point"
    ],
  },

  {
    id: 'clamshell',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Clamshell',
    youtube: 'clamshell exercise technique',
    category: 'strength',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute', 'glutes-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
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
        watchOut: [
      'The pelvis rolling backwards as the knee opens; it should stay completely still',
      'Opening further than your hip allows, which just rotates the trunk',
      'Rushing the return'
    ],
    load: 'Bodyweight, or a light band once the movement is clean.',
    credits: 35
  },

  {
    id: 'reverse-lunge',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Reverse Lunge',
    youtube: 'reverse lunge exercise technique',
    category: 'strength',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['quadriceps', 'glutes', 'hamstring'],
    contraindications: ['knee-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
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
        watchOut: [
      'Front knee travelling far past the toes',
      'Landing heavily on the back foot rather than placing it down',
      'Trunk falling forward as you step back'
    ],
    load: 'Bodyweight to start. Add weight only once you can step back and return without wobbling.',
    credits: 55
  },

  // ============================================
  // STRENGTH EXPANSION — Batch 8 (15 items)
  // Bodyweight progressions, dumbbell variations, core strength
  // ============================================

  {
    id: 'press-up-incline',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Incline Press-Up',
    youtube: 'incline press-up exercise technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
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
        watchOut: [
      'Hips sagging even on an incline',
      'Elbows flaring out to the sides',
      'Choosing a surface so high there is almost no resistance'
    ],
    load: 'Bodyweight. Progress by lowering the surface a little at a time.',
    credits: 40
  },

  {
    id: 'press-up-decline',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Decline Press-Up',
    youtube: 'decline press-up exercise technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
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
        watchOut: [
      'Hips piking upwards to reduce the load',
      'Head dropping towards the floor first',
      'Going to decline before flat press-ups are comfortable'
    ],
    load: 'Bodyweight. Progress by raising the feet gradually.',
    credits: 70
  },

  {
    id: 'bulgarian-split-squat',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Bulgarian Split Squat',
    youtube: 'bulgarian split squat exercise technique',
    category: 'strength',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['quadriceps', 'glutes', 'hip-flexor'],
    contraindications: ['knee-acute', 'hip-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
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
        watchOut: [
      'Front knee collapsing inward',
      'Leaning forward, which turns it into a hinge',
      'Back foot placed too close, which crowds the front knee'
    ],
    load: 'Bodyweight until you can complete all reps without wobbling, then add light weight.',
    credits: 75
  },

  {
    id: 'dumbbell-sumo-squat',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Sumo Squat',
    youtube: 'dumbbell sumo squat exercise technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['quadriceps', 'glutes', 'adductors'],
    contraindications: ['knee-acute', 'hip-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
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
        watchOut: [
      'Knees collapsing inward, which is common with a wide stance — push them out over your toes',
      'Leaning forward as you stand, which shifts the work into the lower back',
      'Toes not turned out enough for your hips, causing pinching at the front of the hip'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough to stay upright throughout.',
    credits: 60
  },

  {
    id: 'dumbbell-lateral-raise',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Lateral Raise',
    youtube: 'dumbbell lateral raise exercise technique',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
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
        watchOut: [
      'Swinging the weights up with a bounce from the legs',
      'Raising above shoulder height, which brings the neck and traps in',
      'Shrugging as you lift — keep the shoulders down and lead with the elbows'
    ],
    load: 'Lighter than you think. These respond to control, not weight.',
    credits: 50
  },

  {
    id: 'dumbbell-overhead-press',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Overhead Press',
    youtube: 'dumbbell overhead press exercise technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
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
        watchOut: [
      'Arching the lower back to get the weight up — brace your stomach before every rep',
      'Pressing the weights in front of your face rather than beside your ears',
      'Any pinching at the top: reduce how far overhead you go and lighten the weight'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your back does not arch.',
    credits: 65
  },

  {
    id: 'dumbbell-bicep-curl',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Bicep Curl',
    youtube: 'dumbbell bicep curl exercise technique',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['triceps-biceps'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
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
        watchOut: [
      'Elbows swinging forward, which means the weight is too heavy',
      'Leaning back to help the weight up',
      'Dropping the weight quickly on the way down; the lowering is where the work is'
    ],
    load: 'Light enough that your elbows stay pinned to your sides for every rep.',
    credits: 50
  },

  {
    id: 'dumbbell-tricep-extension',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Overhead Tricep Extension',
    youtube: 'dumbbell overhead tricep extension exercise technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['triceps-biceps'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
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
        watchOut: [
      'Elbows flaring wide, which takes the work off the triceps',
      'Arching the back as the weight goes behind your head',
      'Going too heavy on a movement where the shoulder is in a vulnerable position'
    ],
    load: 'Lighter than you would use for most exercises. This one is about control.',
    credits: 50
  },

  {
    id: 'dumbbell-chest-press-floor',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Floor Press',
    youtube: 'dumbbell floor press exercise technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['dumbbell'],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
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
        watchOut: [
      'Elbows flaring straight out to the sides rather than at forty-five degrees',
      'Bouncing the upper arms off the floor to get the weight moving',
      'Arching the lower back off the floor'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your elbows stay at forty-five degrees.',
    credits: 60
  },

  {
    id: 'inverted-row-table',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Inverted Row — Table',
    youtube: 'inverted row - table exercise technique',
    category: 'strength',
    movementPattern: 'pull',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
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
        watchOut: [
      'Hips sagging towards the floor',
      'Shrugging rather than driving the elbows back',
      'Pulling only halfway; the chest should reach the edge'
    ],
    load: 'Bodyweight. Make it harder by walking the feet further out.',
    credits: 60
  },

  {
    id: 'pallof-press',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Pallof Press',
    youtube: 'pallof press exercise technique',
    category: 'strength',
    movementPattern: 'anti-rotation',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
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
    watchOut: [
      'Your body turning towards the anchor as you press out, which means the band is too strong — step in or use a lighter one',
      'Hips drifting round while the shoulders stay square, or the other way about; both should stay facing forward',
      'Holding your breath during the two-second hold, which is the most common habit on this one',
      'Standing too close to the anchor, so there is no tension and nothing to resist'
    ],
    load: 'Light enough that you stay completely square for every rep. Rotating is the band telling you it is too strong.',
    credits: 50,
    sets: 3,
    reps: "10 each side",
    holdSeconds: 2,
    rest: 45,
    description: "Stand sideways to a cable machine or anchor point with a resistance band. Hold the band at your chest. Press it straight out, hold 2 seconds, return. The force tries to rotate you — resist it.",
    cues: [
      "The resistance should be from the side, not from the front",
      "Feet shoulder-width apart, slight knee bend",
      "Do not let your body twist toward the anchor",
      "The hold is where the anti-rotation work happens"
    ],
  },

  {
    id: 'farmers-carry',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Farmer\'s Carry',
    youtube: 'farmers carry exercise technique',
    category: 'strength',
    movementPattern: 'carry',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['abdominals', 'lower-back', 'shoulder', 'triceps-biceps'],
    contraindications: ['lower-back-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
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
        watchOut: [
      'Shoulders rounding forward as your grip tires — that is the point to stop the set',
      'Holding your breath; breathe steadily throughout',
      'Dropping the weights at the end rather than setting them down, which is where backs get hurt'
    ],
    load: 'Heavy enough that your grip is the limit, not your posture.',
    credits: 60
  },

  {
    id: 'suitcase-carry',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Suitcase Carry — Single Arm',
    youtube: 'suitcase carry - single arm exercise technique',
    category: 'strength',
    movementPattern: 'carry',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['abdominals', 'lower-back', 'glutes'],
    contraindications: ['lower-back-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
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
        watchOut: [
      'Leaning away from the weight to counterbalance it, which removes the whole point',
      'The loaded shoulder creeping up towards the ear',
      'Rushing; walk at a normal pace rather than hurrying to finish'
    ],
    load: 'Heavy enough that staying upright takes real effort, light enough that you never lean.',
    credits: 60
  },

  {
    id: 'hip-hinge-drill',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Hip Hinge Drill — Bodyweight',
    youtube: 'hip hinge drill - bodyweight exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: ['hamstring-acute', 'glutes-acute', 'lower-back-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
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
        watchOut: [
      'Squatting rather than pushing the hips back',
      'Rounding the back at the bottom — stop where it is still flat',
      'Bending the knees more as you go down'
    ],
    load: 'Bodyweight. This is a pattern to learn before it is an exercise to load.',
    credits: 30
  }


  ,

  // ============================================
  // KETTLEBELL EXERCISES — Batch 17a (12 items)
  // ============================================

  {
    id: 'kettlebell-swing',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Swing',
    youtube: 'kettlebell swing exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['kettlebell'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hamstring', 'lower-back', 'shoulder'],
    contraindications: ['lower-back-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet shoulder-width apart, kettlebell on the floor between your feet',
      'Hinge at the hip to grip the bell, then hike it back between your legs like a hike pass in football',
      'Drive through the hips explosively to swing the bell to shoulder height',
      'Let the bell float at the top — do not pull it up with the arms',
      'Hinge again as it descends, absorbing the load with the hips',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'This is a hip hinge, not a squat. The power comes from the hips snapping forward — not from lifting with the arms or rounding the back.',
    why: 'The kettlebell swing builds explosive hip power, posterior chain strength, and cardiovascular capacity simultaneously. One of the most effective single exercises available.',
        watchOut: [
      'Squatting instead of hinging — the hips go back, not down',
      'Lifting the bell with the arms; it should float up from the hip drive alone',
      'Over-arching the back at the top rather than finishing tall and squeezing the backside',
      'Any lower-back pain: stop and go back to hip hinges without weight'
    ],
    load: 'Heavy enough that the hips have to work, light enough that your arms stay relaxed.',
    credits: 80
  },

  {
    id: 'kettlebell-goblet-squat',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Goblet Squat',
    youtube: 'kettlebell goblet squat exercise technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: ['kettlebell'],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['quadriceps', 'glutes', 'adductors'],
    contraindications: ['knee-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Hold a kettlebell by the horns (sides of the handle) at chest height',
      'Stand with feet slightly wider than hip-width, toes turned out 30 degrees',
      'Squat down, driving the knees out over the toes',
      'At the bottom, let the elbows press against the inner knees to open the hips',
      'Drive through the heels to stand',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'The goblet hold keeps the torso upright — the counterbalance of the weight in front naturally prevents forward lean. The best teaching squat there is.',
    why: 'The front-loaded position forces an upright torso and deep hip crease. Improves squat mechanics and builds full lower body strength.',
        watchOut: [
      'Knees falling inward as you stand up',
      'Elbows drifting away from the body, which pulls you forward',
      'Heels lifting at the bottom — squat only as deep as your heels stay down'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough to stay upright.',
    credits: 65
  },

  {
    id: 'kettlebell-clean',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Clean',
    youtube: 'kettlebell clean exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['kettlebell'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'glutes', 'hamstring', 'shoulder'],
    contraindications: ['lower-back-acute', 'wrist-elbow-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 4,   // DIFF-1 15 Aug 2026: was 3. Same rack-catch demand as the snatch, one stage lower.
    duration: 90,
    perSide: true,
    instructions: [
      'Stand with the kettlebell between your feet',
      'Hinge and grip the bell in one hand',
      'Hike it back, then drive the hips forward to generate power',
      'As the bell rises, pull the elbow back and rotate it under the bell',
      'Catch the bell in the rack position — resting on the forearm, close to the body',
      'Lower back to the swing hike position',
      'Complete 5 reps each side, 3 sets'
    ],
    coaching: 'The clean is all about the timing of rotating under the bell. If it bangs your wrist, you are muscling it rather than rotating. Practise the swing first.',
    why: 'The clean is the foundational kettlebell movement — used to get the bell into the rack position for presses and squats. Builds full-body power and coordination.',
        watchOut: [
      'The bell banging down onto the wrist, which means it is looping out rather than travelling close to the body',
      'Gripping too tightly through the catch',
      'Using the arm to lift rather than the hips'
    ],
    load: 'Light while you learn the catch. This is a technique lift before it is a strength lift.',
    credits: 80
  },

  {
    id: 'kettlebell-press',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Press',
    youtube: 'kettlebell press exercise technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['kettlebell'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'triceps-biceps', 'abdominals'],
    contraindications: ['shoulder-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand with the kettlebell in the rack position — resting on the forearm, close to the chest',
      'Brace the core hard',
      'Press the bell straight up to arm extension — the arm finishes alongside the ear',
      'Lower with control back to the rack position',
      'Complete 5 reps each side, 3 sets'
    ],
    coaching: 'The single-arm press challenges core anti-rotation — the whole body must resist the tendency to lean away from the load. Stay tall.',
    why: 'Builds shoulder strength and pressing power with an additional core stability demand that bilateral pressing does not provide.',
        watchOut: [
      'Arching the lower back to get the bell up',
      'The bell drifting in front of your face rather than travelling straight up',
      'Any pinching overhead: reduce the range and lighten the bell'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your ribs stay down.',
    credits: 70
  },

  {
    id: 'kettlebell-turkish-getup',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Turkish Get-Up',
    youtube: 'turkish get-up exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['kettlebell'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'shoulder', 'abdominals', 'hip'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute', 'lower-back-acute'],
    energyRequired: 7,
    difficultyLevel: 4,   // DIFF-1 15 Aug 2026: was 3. Loaded overhead through five positions including a floor transfer.
    duration: 180,
    perSide: true,
    instructions: [
      'Lie on your back, right arm pressing the bell to the ceiling, left arm at 45 degrees',
      'Right leg bent at 90 degrees, left leg straight',
      'Roll to your left elbow, then left hand, as you sit up',
      'Lift your hips off the floor into a bridge',
      'Sweep the left leg back to a lunge position',
      'Stand up from the lunge',
      'Reverse the entire sequence to return to the floor — this is one rep',
      'Complete 3 reps each side'
    ],
    coaching: 'Learn this without a kettlebell first — use a shoe balanced on your fist. Speed is the enemy here. Slow is controlled, controlled is safe.',
    why: 'The Turkish get-up tests and builds shoulder stability, hip mobility, and total body coordination. Called "a full physical assessment in one movement" by strength coaches.',
        watchOut: [
      'Rushing between positions — every stage should be under full control before the next',
      'Eyes leaving the bell during the early stages',
      'Attempting it loaded before you can do the whole sequence with a shoe balanced on your fist'
    ],
    load: 'Start with no weight at all, then a very light bell. This is a skill first.',
    credits: 100
  },

  {
    id: 'kettlebell-deadlift',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Deadlift',
    youtube: 'kettlebell deadlift exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['kettlebell'],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: ['lower-back-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with the kettlebell on the floor between your feet',
      'Hinge at the hip, keeping the back flat, and grip the bell with both hands',
      'Drive through the heels to stand — hips and shoulders rise at the same rate',
      'At the top, stand fully upright — do not hyperextend the lower back',
      'Lower with control, hinging at the hip',
      'Complete 4 sets of 8 reps'
    ],
    coaching: 'The kettlebell deadlift teaches the hip hinge pattern with the load held centrally — ideal for learning the movement before progressing to barbell.',
    why: 'The deadlift is the most fundamental strength movement — picking things up from the floor. The kettlebell version is accessible for beginners.',
        watchOut: [
      'Rounding the back to reach the bell — bring the bell closer or raise it on a block',
      'Squatting down to it rather than hinging back',
      'Yanking it off the floor rather than building tension first'
    ],
    load: 'Heavy enough to feel the backside and hamstrings, light enough that your back stays flat.',
    credits: 65
  },

  {
    id: 'kettlebell-row',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Single-Arm Row',
    youtube: 'kettlebell single-arm row exercise technique',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['kettlebell'],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['upper-back', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'lower-back-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Place your left hand and left knee on a bench or chair for support',
      'Hold the kettlebell in your right hand, arm hanging below the shoulder',
      'Pull the bell to your lower ribs — elbow tracking back and up, not flaring wide',
      'Lower with control',
      'Complete 10 reps each side, 3 sets'
    ],
    coaching: 'The elbow should travel back like a saw, not out like a wing. Keep the shoulder blade moving — not just the arm.',
    why: 'The single-arm row builds back thickness and corrects the imbalances from pressing. Essential counterpart to any horizontal pressing movement.',
        watchOut: [
      'Twisting the torso to help the bell up',
      'Shrugging rather than driving the elbow back',
      'Rounding the lower back as you tire'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your torso stays still.',
    credits: 60
  },

  {
    id: 'kettlebell-snatch',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Snatch',
    youtube: 'kettlebell snatch exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['kettlebell'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'glutes', 'hamstring', 'shoulder'],
    contraindications: ['shoulder-acute', 'lower-back-acute', 'wrist-elbow-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 4,   // DIFF-1 15 Aug 2026: was 3. Overhead ballistic. Mis-timed, the bell lands on the forearm.
    duration: 90,
    perSide: true,
    instructions: [
      'Begin like a swing — hike the bell back between the legs',
      'Drive the hips explosively; as the bell rises, punch the arm straight up',
      'The bell should travel close to the body and land softly overhead with the arm locked out',
      'Rotate the wrist as the bell crests — no bang on the forearm',
      'Lower back to swing position through a clean',
      'Complete 5 reps each side, 3 sets'
    ],
    coaching: 'The snatch is a one-move equivalent of a swing and a press combined. Learn the swing and clean to a high standard before attempting this.',
    why: 'The kettlebell snatch is one of the most demanding single exercises — ballistic power, shoulder stability, and cardiovascular endurance in one movement.',
        watchOut: [
      'The bell flipping over and banging the wrist, which means it is looping rather than travelling close',
      'Attempting this before the swing and the clean are both comfortable',
      'Gripping hard the whole way up rather than letting the handle rotate in the hand'
    ],
    load: 'Light. This is the most technical kettlebell lift and weight should come last.',
    credits: 100
  },

  {
    id: 'kettlebell-halo',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Halo',
    youtube: 'kettlebell halo exercise technique',
    category: 'mobility',
    movementPattern: 'shoulder-rotation',
    equipment: ['kettlebell'],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['shoulder', 'upper-back', 'thoracic'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Hold a kettlebell upside down by the horns at chest height — "bottoms up"',
      'Slowly circle the bell around your head in one direction — as close to the head as comfortable',
      'Keep the core braced and the torso still throughout',
      'Complete 5 circles clockwise, then 5 anticlockwise'
    ],
    coaching: 'Move slowly — the tempo of a halo determines whether it is a warm-up or a shoulder drill. Fast halos are mostly momentum. Slow halos are work.',
    why: 'Improves shoulder girdle mobility and scapular control. Excellent as a warm-up before upper body work or as shoulder rehabilitation.',
        watchOut: [
      'Letting the bell drift far from your head, which strains the shoulders',
      'Ribs flaring and the back arching as the bell passes behind',
      'Rushing — slow circles are the point'
    ],
    load: 'Light. This is a mobility movement with a weight, not a strength lift.',
    credits: 35
  },

  {
    id: 'kettlebell-windmill',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Windmill',
    youtube: 'kettlebell windmill exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['kettlebell'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'abdominals', 'hamstring', 'hip'],
    contraindications: ['shoulder-acute', 'lower-back-acute', 'hamstring-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Press the kettlebell overhead in the right hand, arm locked',
      'Turn both feet 45 degrees to the left',
      'Hinge at the hip to the left, keeping the right arm vertical and your eyes on the bell',
      'Lower the left hand down the left leg toward the floor',
      'Return to standing by driving through the right hip',
      'Complete 5 reps each side, 3 sets'
    ],
    coaching: 'Keep your eye on the bell throughout. The eyes tracking the bell keeps the shoulder packed and safe. The moment you look down, the arm tends to drift.',
    why: 'Develops shoulder stability under load in an unusual position, hip mobility, and lateral core strength — a uniquely effective combination.',
        watchOut: [
      'Bending sideways through the waist rather than hinging at the hip',
      'Eyes leaving the overhead bell',
      'Going heavy before the movement is comfortable unloaded'
    ],
    load: 'Very light, or none at all to begin with.',
    credits: 80
  },

  {
    id: 'kettlebell-figure-8',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Figure-8',
    youtube: 'kettlebell figure-8 exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['kettlebell'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'adductors', 'abdominals'],
    contraindications: ['lower-back-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet wider than shoulder-width, slight hip hinge',
      'Pass the bell between your legs from one hand to the other',
      'The path traces a figure-8 around and between your legs',
      'Keep the back flat and the movement smooth',
      'Complete 10 full figure-8 patterns each direction, 3 sets'
    ],
    coaching: 'The figure-8 exposes hip tightness and coordination limitations immediately. Move slowly at first until the pattern is grooved.',
    why: 'Develops hip mobility, core stability, and hand-eye coordination in a unique multi-planar movement pattern.',
        watchOut: [
      'Rounding the back as you pass the bell through',
      'Standing too upright, which leaves no room for the bell',
      'Passing too fast to keep control of the hand-off'
    ],
    load: 'Light. Control of the hand-off matters more than the weight.',
    credits: 60
  },

  {
    id: 'kettlebell-around-body-pass',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Around the Body Pass',
    youtube: 'around the body pass exercise technique',
    category: 'strength',
    movementPattern: 'anti-rotation',
    equipment: ['kettlebell'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'glutes', 'shoulder'],
    contraindications: ['glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand tall, feet hip-width, holding the kettlebell in both hands in front',
      'Pass the bell to one hand behind your back, then receive it in front with the other hand',
      'Circle the bell around your body continuously',
      'Complete 10 circles in each direction, 3 sets'
    ],
    coaching: 'Keep the hips still — they want to rotate with the bell. The challenge is the anti-rotation demand, not the weight.',
    why: 'Trains the core to resist rotation under a moving load. A relatively gentle way to build rotational core strength.',
        watchOut: [
      'Twisting the hips to follow the bell — they should stay square',
      'Leaning back as the bell passes behind',
      'Rushing the hand-off behind your back'
    ],
    load: 'Light enough that your hips stay completely still.',
    credits: 40
  },

  // ============================================
  // PLYOMETRICS & POWER — Batch 17b (15 items)
  // Component C — high energy, requires solid base
  // All items: contraindications for lower limb acute conditions
  // ============================================

  {
    id: 'plyo-jump-squat',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Jump Squat',
    youtube: 'jump squat exercise technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['quadriceps', 'glutes', 'calves'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'lower-back-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower into a squat to about 90 degrees',
      'Explode upward as fast as possible — leave the ground completely',
      'Land softly with bent knees — absorb the landing through the whole leg',
      'Immediately lower into the next squat',
      'Complete 3 sets of 10 reps with full recovery between sets'
    ],
    coaching: 'The landing is as important as the jump. Soft, controlled landings protect the knees and build eccentric strength. Loud landings mean poor absorption.',
    why: 'Develops lower body power and rate of force development — the explosive quality that translates to sprinting, jumping, and change of direction.',
        watchOut: [
      'Landing heavily; quiet landings are the whole skill',
      'Knees collapsing inward on landing',
      'Doing these when tired, which is when landing form goes'
    ],
    load: 'Bodyweight only.',
    credits: 75
  },

  {
    id: 'plyo-box-jump',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Box Jump',
    youtube: 'box jump exercise technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: ['plyo-box'],
    affectsAreas: ['quadriceps', 'glutes', 'calves'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand in front of a box or step at a height you can clear comfortably',
      'Drop into a quarter-squat and swing the arms back',
      'Explode upward, swinging the arms forward to generate height',
      'Land on top of the box in a soft quarter-squat — both feet simultaneously',
      'Step down one foot at a time — do not jump down',
      'Rest fully between reps — 30 to 45 seconds',
      'Complete 3 sets of 5 reps'
    ],
    coaching: 'Start with a low box. The goal is a safe, confident landing — not maximum height. Always step down, never jump down.',
    why: 'Box jumps develop explosive leg power in a controlled environment. The fixed target also trains spatial awareness and jumping confidence.',
        watchOut: [
      'Choosing a box so high you have to tuck your knees to clear it',
      'Jumping down rather than stepping down, which is where most box-jump injuries happen',
      'Landing with straight legs'
    ],
    load: 'Bodyweight only. Progress with box height, slowly.',
    credits: 80
  },

  {
    id: 'plyo-broad-jump',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Broad Jump',
    youtube: 'broad jump exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hamstring', 'calves', 'quadriceps'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart',
      'Drop into a quarter-squat, swinging arms back',
      'Explode forward and upward — aim for maximum horizontal distance',
      'Land on both feet simultaneously in a soft squat position',
      'Mark your landing and try to beat it next rep',
      'Complete 3 sets of 5 reps with full recovery'
    ],
    coaching: 'The arm swing contributes significantly to distance — practise it. Drive the arms forward and up at take-off, not just up.',
    why: 'The broad jump tests and builds horizontal power — the component most relevant to sprinting speed and athletic performance.',
        watchOut: [
      'Landing stiff-legged rather than absorbing through the hips and knees',
      'Reaching for distance beyond what you can land under control',
      'Knees collapsing inward on landing'
    ],
    load: 'Bodyweight only.',
    credits: 80
  },

  {
    id: 'plyo-explosive-press-up',
    position: 'floor',
    impact: true,
    balanceDemand: false,
    name: 'Explosive Press-Up',
    youtube: 'explosive press-up exercise technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Start in a high plank position',
      'Lower to the floor with control',
      'Press up explosively — fast enough for the hands to briefly leave the floor',
      'Land softly and immediately lower into the next rep',
      'Complete 3 sets of 6 to 8 reps'
    ],
    coaching: 'If the hands do not leave the floor, push faster. The explosive intent — even without actual leave — still trains the neuromuscular system powerfully.',
    why: 'Develops upper body power — the pressing equivalent of the jump squat. Builds the reactive strength needed for throwing, pushing, and striking sports.',
        watchOut: [
      'Hips sagging on landing',
      'Landing on locked-out elbows',
      'Attempting these before standard press-ups are comfortable'
    ],
    load: 'Bodyweight only.',
    credits: 80
  },

  {
    id: 'plyo-depth-jump',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Depth Jump',
    youtube: 'depth jump exercise technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: ['plyo-box'],
    affectsAreas: ['quadriceps', 'glutes', 'calves'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 120,
    perSide: false,
    instructions: [
      'Stand on a box or step',
      'Step off — do not jump off',
      'The instant both feet contact the floor, jump as high as possible immediately',
      'Minimise ground contact time — the quicker the better',
      'Rest fully between reps — 45 to 60 seconds',
      'Complete 3 sets of 5 reps'
    ],
    coaching: 'The depth jump develops the stretch-shortening cycle — the spring-like quality of tendons. Only attempt once standard jump squats are comfortable.',
    why: 'One of the most effective plyometric exercises for reactive strength — the ability to absorb and immediately re-use elastic energy in the tendons.',
        watchOut: [
      'Stepping off from a box that is too high',
      'Spending too long on the ground between landing and jumping',
      'Doing these when tired; this is the most demanding plyometric there is'
    ],
    load: 'Bodyweight only, and only when fresh.',
    credits: 90
  },

  {
    id: 'plyo-lateral-hop',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Lateral Hops',
    youtube: 'lateral hops exercise technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'calves', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand on your right foot',
      'Hop laterally to the left, landing on your left foot',
      'Absorb the landing softly and immediately hop back right',
      'Build a rhythm — right, left, right, left',
      'Complete 3 sets of 20 total hops',
      'Progress to single-leg lateral hops for more challenge'
    ],
    coaching: 'Start with small hops and increase the width as landing control improves. Quiet landings mean good control.',
    why: 'Develops lateral power and single-leg landing stability — essential for court sports, football, and change of direction.',
        watchOut: [
      'Heavy landings',
      'Knees caving inward',
      'Hopping further than you can land under control'
    ],
    load: 'Bodyweight only.',
    credits: 65
  },

  {
    id: 'plyo-skater-jumps',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Skater Jumps',
    youtube: 'skater jumps exercise technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'adductors', 'calves'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand on your right foot in a slight squat',
      'Drive off to the left, landing on the left foot as far to the side as possible',
      'Sweep the right foot behind the left as you land — like a speed skater',
      'Immediately drive back to the right',
      'Complete 3 sets of 12 total jumps'
    ],
    coaching: 'The trailing leg sweep helps with balance and adds hip adductor work. The bigger the lateral distance, the more demanding the single-leg landing.',
    why: 'Develops lateral explosive power and single-leg landing mechanics. One of the best exercises for lateral sport performance.',
        watchOut: [
      'Landing on a straight leg',
      'Trunk collapsing towards the landing side',
      'Going for distance before the landing is stable'
    ],
    load: 'Bodyweight only.',
    credits: 70
  },

  {
    id: 'plyo-tuck-jump',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Tuck Jump',
    youtube: 'tuck jump exercise technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'hip-flexor'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart',
      'Jump upward and drive both knees toward the chest at the peak',
      'Grab the shins briefly if possible',
      'Land softly in a quarter-squat',
      'Immediately jump again',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'The tuck jump requires both height and hip flexor speed. If the knees barely come up, work on jump squats first before adding the tuck.',
    why: 'Develops vertical jump height and hip flexor explosive strength. Used in athletics, gymnastics, and team sport training.',
        watchOut: [
      'Landing heavily with locked knees',
      'Arching the lower back as the knees come up',
      'Doing many reps in a row, which turns a power exercise into a conditioning one'
    ],
    load: 'Bodyweight only. Few reps, full recovery.',
    credits: 80
  },

  {
    id: 'plyo-sprint-build',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Sprint Build-Up',
    youtube: 'sprint build-up exercise technique',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Find 60 to 80 metres of flat space',
      'Begin at jogging pace',
      'Gradually accelerate over the full distance — reaching maximum speed in the final 10 metres',
      'The key is gradual acceleration — not a standing start sprint',
      'Walk back to recover fully — at least 90 seconds',
      'Complete 4 to 6 build-ups'
    ],
    coaching: 'Build-ups are how sprinters warm up and how recreational runners safely explore top speed. The gradual build reduces hamstring strain risk.',
    why: 'Safely introduces maximum velocity running. Progressive acceleration allows the body to reach top speed safely — sudden standing starts are where hamstring injuries happen.',
        watchOut: [
      'Going to full speed from the first stride rather than building into it',
      'Sprinting without a proper warm-up, which is how hamstrings get pulled',
      'Straining the neck and shoulders; stay relaxed above the waist'
    ],
    load: 'Effort only. Build to around eighty percent rather than flat out.',
    credits: 60
  },

  {
    id: 'plyo-med-ball-slam',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Medicine Ball Slam',
    youtube: 'medicine ball slam exercise technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['medicine-ball'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'abdominals', 'shoulder'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with a medicine ball held overhead',
      'Pull the core tight, then slam the ball into the floor as hard as possible',
      'Follow through — hinge at the hip and let the arms travel all the way down',
      'Catch the ball on the bounce and raise it overhead immediately',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'This is a power exercise — and also a stress-release exercise. Both of those are legitimate training goals.',
    why: 'Medicine ball slams develop full-body power, particularly the downward force production used in throwing, tackling, and chopping movements.',
        watchOut: [
      'Rounding the back as you slam down rather than hinging at the hips',
      'Slamming a ball that bounces, which can come back at your face — use a dead-ball if there is any doubt',
      'Reaching so far overhead that the lower back arches'
    ],
    load: 'Light. Speed is the point here, and a heavy ball slows the movement down.',
    credits: 80
  },

  {
    id: 'plyo-med-ball-chest-pass',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Medicine Ball Chest Pass',
    youtube: 'medicine ball chest pass exercise technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['medicine-ball'],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand facing a wall or partner, holding a medicine ball at chest height',
      'Press and throw the ball explosively at the wall — like an aggressive chest pass',
      'Catch the rebound with soft hands and immediately throw again',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'The explosion comes from the chest and arms simultaneously — it is a push, not a throw. Stay close to the wall and work quickly.',
    why: 'Develops upper body pressing power and reactive catching ability. Directly trains the force production pattern used in pushing, blocking, and throwing sports.',
        watchOut: [
      'Standing too close to the wall to catch the rebound safely',
      'Throwing with straight arms rather than pressing from the chest',
      'Catching with locked elbows, which jars the joints'
    ],
    load: 'Light enough that the throw stays fast.',
    credits: 65
  },

  {
    id: 'plyo-single-leg-hop',
    position: 'standing',
    impact: true,
    balanceDemand: true,
    name: 'Single-Leg Hop for Distance',
    youtube: 'single-leg hop for distance exercise technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'calves', 'quadriceps'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on your right foot',
      'Hop forward as far as possible, landing on the right foot',
      'Stick the landing — absorb it fully before the next hop',
      'Complete 5 hops in a row, then rest',
      'Measure total distance or just focus on landing control',
      'Complete 3 sets each side'
    ],
    coaching: 'Single-leg hop testing is used clinically to assess return-to-sport readiness after knee injury. It is also excellent training.',
    why: 'The gold-standard test of single-leg power and landing control. The ability to hop for distance and stick the landing indicates robust lower limb function.',
        watchOut: [
      'Landing on a straight leg',
      'Hopping for distance before you can land and hold it still',
      'Knee collapsing inward on landing'
    ],
    load: 'Bodyweight only. Land and hold before you chase distance.',
    credits: 75
  },

  {
    id: 'plyo-reactive-agility',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Reactive Change of Direction',
    youtube: 'reactive change of direction exercise technique',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'glutes', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Stand in athletic position — knees bent, weight on balls of feet',
      'Have a partner point left, right, or forward randomly',
      'Sprint 3 to 5 metres in the indicated direction, stop, return to centre',
      'Vary the rest between signals — sometimes rapid, sometimes with a pause',
      'Continue for 30 seconds, rest 60 seconds',
      'Complete 5 sets'
    ],
    coaching: 'Without a partner, use a random timer app to determine direction or watch a bouncing ball. The unpredictability is what trains agility — not planned drills.',
    why: 'Reactive agility — responding to unpredictable stimuli — is the actual demand of team sports. Planned agility drills train movement, not agility.',
        watchOut: [
      'Planting on a straight leg when changing direction',
      'Going at full speed before the movement pattern is comfortable',
      'Doing these on a slippery surface'
    ],
    load: 'Bodyweight only.',
    credits: 75
  },

  {
    id: 'plyo-deceleration-run',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Deceleration Run',
    youtube: 'deceleration run exercise technique',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'ankle-foot'],
    contraindications: ['knee-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 300,
    perSide: false,
    instructions: [
      'Sprint at 80 to 90% effort for 15 metres',
      'Stop as quickly as possible in the next 3 metres',
      'The stopping is the training — not the sprint',
      'Walk back, rest 30 seconds',
      'Vary the stop — sometimes stop into a squat, sometimes pivot and change direction',
      'Complete 8 to 10 reps'
    ],
    coaching: 'Most running injuries happen during deceleration, not acceleration. Practising controlled stopping builds the eccentric strength that prevents them.',
    why: 'Deceleration strength is one of the most undertrained qualities in sport. The eccentric quad and glute demand in stopping is greater than in any running stride.',
        watchOut: [
      'Stopping stiff-legged rather than sinking into the hips',
      'Decelerating over too short a distance to start with',
      'Doing these when the legs are already tired'
    ],
    load: 'Bodyweight only. Lengthen the stopping distance if it feels jarring.',
    credits: 65
  }


  ,

  // ============================================
  // BARBELL EXERCISES — Batch 20a (10 items)
  // ============================================

  {
    id: 'barbell-deadlift',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Barbell Deadlift',
    youtube: 'barbell deadlift exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'hinge',
    equipment: ['barbell'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hamstring', 'lower-back', 'upper-back'],
    contraindications: ['lower-back-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 120,
    perSide: false,
    instructions: [
      'Stand with the bar over your mid-foot, feet hip-width apart',
      'Hinge down and grip the bar just outside your legs',
      'Set your back flat, chest up, hips higher than knees',
      'Take a breath into your belly and tighten your middle hard',
      'Drive through the floor — push the earth away rather than pulling the bar up',
      'Hips and shoulders rise at the same rate',
      'At the top, stand fully upright — squeeze the glutes',
      'Lower with control, hinging at the hip',
      'Complete 3 sets of 5 reps'
    ],
    coaching: 'The bar should travel in a straight vertical line — if it swings away from your legs at any point, the weight is too heavy or the setup is off.',
    why: 'The deadlift is the most fundamental human strength movement — picking a heavy load from the floor. No exercise builds posterior chain strength as comprehensively.',
        watchOut: [
      'Back rounding as you set up or as you lift — reset rather than pushing through it',
      'Hips shooting up first, leaving the back to do the work',
      'Bar drifting away from your shins; it should travel almost touching your legs',
      'Any back pain during or after: stop and return to lighter hinge work'
    ],
    load: 'Heavy enough to be demanding, light enough that your back stays flat from first rep to last.',
    credits: 90
  },

  {
    id: 'barbell-squat',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Barbell Back Squat',
    youtube: 'barbell back squat exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'squat',
    equipment: ['barbell', 'squat-rack'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'lower-back', 'hamstring'],
    contraindications: ['knee-acute', 'lower-back-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 120,
    perSide: false,
    instructions: [
      'Set the bar on a rack at upper chest height',
      'Duck under and rest the bar on the upper traps — not the neck',
      'Grip just wider than shoulder-width, elbows pointing back and slightly down',
      'Unrack, step back, feet shoulder-width with toes turned slightly out',
      'Inhale, brace the core, sit back and down — knees tracking over toes',
      'Descend until thighs are parallel to the floor or lower',
      'Drive through the heels to stand',
      'Complete 3 sets of 5 reps'
    ],
    coaching: 'The bar position on the upper traps is critical — too high on the neck creates cervical compression. Too low starts to require significant forward lean.',
    why: 'The back squat is the primary lower body strength exercise in most training programmes. Builds quad, glute, and core strength that transfers to all athletic movement.',
        watchOut: [
      'Knees falling inward as you stand up out of the bottom',
      'Chest dropping forward so it becomes a hinge rather than a squat',
      'Heels lifting off the floor',
      'Squatting without safety bars set at a height that would catch the bar'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your form is identical on rep one and rep ten.',
    credits: 90
  },

  {
    id: 'barbell-bench-press',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Barbell Bench Press',
    youtube: 'barbell bench press exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'push',
    equipment: ['barbell', 'bench'],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 120,
    perSide: false,
    instructions: [
      'Lie on a bench, eyes under the bar',
      'Grip slightly wider than shoulder-width — wrists straight over elbows',
      'Pull the shoulder blades together and down into the bench',
      'Lift the bar from the rack with straight arms',
      'Lower the bar to the lower chest in a slight arc — control the descent',
      'Drive back up — bar path slightly back toward the rack',
      'Complete 3 sets of 5 reps with a spotter for heavy loads'
    ],
    coaching: 'The shoulder blade retraction is the most important setup cue — it creates a stable base and reduces shoulder impingement risk significantly.',
    why: 'The bench press is the primary horizontal pushing strength exercise. Builds chest, shoulder, and tricep strength with a loading capacity unmatched by bodyweight pressing.',
        watchOut: [
      'Bouncing the bar off the chest',
      'Elbows flaring straight out to the sides at ninety degrees',
      'Lifting the hips off the bench to drive the bar up',
      'Benching heavy alone without safety bars or a spotter'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that you could complete one more if you had to.',
    credits: 80
  },

  {
    id: 'barbell-overhead-press',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Barbell Overhead Press',
    youtube: 'barbell overhead press exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'push',
    equipment: ['barbell'],
    equipmentOptional: ['squat-rack'],
    affectsAreas: ['shoulder', 'triceps-biceps', 'upper-back', 'abdominals'],
    contraindications: ['shoulder-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 120,
    perSide: false,
    instructions: [
      'Hold the bar at shoulder height, grip just outside shoulder-width',
      'Elbows slightly in front of the bar — not flared wide',
      'Take a breath and brace the core hard — the spine must not extend',
      'Press the bar straight up, moving your head back slightly to allow the bar to pass the face',
      'Once past the forehead, press straight up and slightly back',
      'Lower with control to shoulder height',
      'Complete 3 sets of 5 reps'
    ],
    coaching: 'The strict press allows no leg drive — if you need to use your legs, the weight is too heavy for a strict press. Move to push press instead.',
    why: 'The overhead press builds shoulder and upper body strength in a standing, loaded position — the most functional upper body strength exercise available.',
        watchOut: [
      'Arching the lower back to get the bar up — brace the stomach and squeeze the backside first',
      'Pressing the bar around your face rather than moving your head back and letting it travel straight',
      'Any pinching overhead: reduce the range and lighten the bar'
    ],
    load: 'Heavy enough to be demanding, light enough that your ribs stay down over your hips.',
    credits: 80
  },

  {
    id: 'barbell-row',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Barbell Bent-Over Row',
    youtube: 'barbell bent-over row exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pull',
    equipment: ['barbell'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'triceps-biceps', 'shoulder', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 120,
    perSide: false,
    instructions: [
      'Stand with the bar on the floor, grip shoulder-width or slightly wider',
      'Hinge to about 45 degrees — back flat, bar hanging below the chest',
      'Pull the bar to the lower ribs — elbows tracking back and up',
      'Squeeze the shoulder blades together at the top',
      'Lower with control — do not let the bar pull the torso forward',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'The lower back must not round under load — if it does, reduce the weight or reduce the forward lean angle.',
    why: 'The barbell row builds upper back thickness and strength — the essential counterpart to any pressing programme and a primary postural strength exercise.',
        watchOut: [
      'Standing up as you pull, so the torso angle changes rep to rep',
      'Rounding the lower back — set the back flat before the first rep and hold it',
      'Bouncing the bar off the thighs or the floor to generate momentum',
      'Shrugging rather than driving the elbows back past your ribs'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your torso angle never changes.',
    credits: 80
  },

  {
    id: 'barbell-rdl',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Barbell Romanian Deadlift',
    youtube: 'romanian deadlift exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'hinge',
    equipment: ['barbell'],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: ['hamstring-acute', 'lower-back-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 120,
    perSide: false,
    instructions: [
      'Stand holding a barbell at hip height, overhand grip, arms straight',
      'Hinge at the hip — push the hips back as the bar descends',
      'Keep the bar close to the legs throughout — it should nearly drag down the shins',
      'Lower until you feel a strong hamstring stretch — usually mid-shin level',
      'Do not round the lower back at the bottom',
      'Drive the hips forward to return to standing',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'The difference between an RDL and a deadlift: the RDL starts from standing and emphasises the eccentric loading of the hamstrings. The stretch at the bottom is the point.',
    why: 'The Romanian deadlift is the primary hamstring strength exercise in most programmes — builds the eccentric hamstring strength that prevents hamstring strains in sport.',
        watchOut: [
      'Your back rounding as you lower — stop where your back is still flat',
      'Feeling this in the lower back rather than the hamstrings, which means the hips are not moving back far enough',
      'Bar drifting away from your legs; it should brush down your thighs',
      'Any sharp back pain: set the bar down and leave this one for today'
    ],
    load: 'Heavy enough that your hamstrings clearly work, light enough that your back never rounds.',
    credits: 80
  },

  {
    id: 'barbell-hip-thrust',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Barbell Hip Thrust',
    youtube: 'barbell hip thrust exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'hinge',
    equipment: ['barbell', 'bench'],
    equipmentOptional: ['barbell-pad'],
    affectsAreas: ['glutes', 'hamstring'],
    contraindications: ['hamstring-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 120,
    perSide: false,
    instructions: [
      'Sit on the floor with your upper back against a bench, barbell across your hips',
      'Use a pad on the bar for comfort',
      'Feet flat on the floor, about hip-width apart',
      'Drive through the heels to lift the hips until the torso is parallel to the floor',
      'Squeeze the glutes hard at the top',
      'Lower with control — hips do not touch the floor between reps',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'Keep the chin tucked at the top — looking up causes the lower back to extend instead of the glutes to contract.',
    why: 'Research by Dr Bret Contreras consistently shows the barbell hip thrust produces greater glute activation than any other exercise. The most direct glute builder available.',
        watchOut: [
      'Over-arching at the top and finishing with the lower back rather than the backside',
      'Feet too close, so the front of the thighs take over',
      'Chin lifting as you drive up; keep looking forward, not at the ceiling',
      'Bar on bare hip bones without a pad, which is simply painful'
    ],
    load: 'Heavy enough that a two-second squeeze at the top is hard to hold.',
    credits: 80
  },

  {
    id: 'barbell-front-squat',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Barbell Front Squat',
    youtube: 'barbell front squat exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'squat',
    equipment: ['barbell', 'squat-rack'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'upper-back', 'abdominals'],
    contraindications: ['knee-acute', 'wrist-elbow-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 120,
    perSide: false,
    instructions: [
      'Set the bar on a rack at chest height',
      'Stand close to the bar, cross your arms and rest the bar on the front deltoids — or use a clean grip',
      'Elbows up high — the bar should not roll forward',
      'Unrack, step back, feet shoulder-width',
      'Squat down with an upright torso — the front load demands vertical trunk position',
      'Drive through the heels to stand',
      'Complete 3 sets of 5 reps'
    ],
    coaching: 'The front squat demands more thoracic mobility and core strength than the back squat. Start lighter than you expect.',
    why: 'The front-loaded position demands greater quad and core strength, greater thoracic mobility, and a more upright torso — developing different qualities than the back squat.',
        watchOut: [
      'Elbows dropping, which pulls the bar and your chest forward',
      'Wrists taking the bar\'s weight; the shoulders should hold it, the hands only steady it',
      'Heels lifting at the bottom',
      'Safety bars not set at a height that would catch the bar'
    ],
    load: 'Lighter than a back squat. The front rack limits you before your legs do, and that is normal.',
    credits: 90
  },

  {
    id: 'barbell-good-morning',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Good Morning',
    youtube: 'good morning exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'hinge',
    equipment: ['barbell'],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'lower-back', 'glutes'],
    contraindications: ['lower-back-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 120,
    perSide: false,
    instructions: [
      'Rest the bar on the upper traps as in a back squat',
      'Feet hip-width, slight knee bend',
      'Hinge at the hip — push the hips back as the torso drops forward',
      'Descend until the torso is roughly parallel to the floor',
      'Keep the back flat and the core braced throughout',
      'Drive through the hips to return to standing',
      'Complete 3 sets of 8 reps — start very light'
    ],
    coaching: 'Use much less weight than you think. The lever arm is long and the lower back load is significant. Technique before load on this one.',
    why: 'Builds posterior chain strength with the bar on the back — teaches the hip hinge pattern under a spinal load, building the back strength needed for heavy deadlifts.',
        watchOut: [
      'Bending the knees more as you go down, which turns it into a squat',
      'Rounding the back at any point — this is the exercise where that matters most',
      'Going heavier than you can control; this one rewards restraint'
    ],
    load: 'Much lighter than a Romanian deadlift. Start with an empty bar.',
    credits: 75
  },

  {
    id: 'barbell-power-clean',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Power Clean',
    youtube: 'power clean exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'hinge',
    equipment: ['barbell'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'glutes', 'hamstring', 'upper-back'],
    contraindications: ['lower-back-acute', 'wrist-elbow-acute', 'shoulder-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 9,
    difficultyLevel: 5,   // DIFF-1 15 Aug 2026: was 3. Olympic lift. Triple extension under a bar, caught in a front rack.
    duration: 120,
    perSide: false,
    instructions: [
      'Set up as for a deadlift — bar over mid-foot, flat back, hips above knees',
      'Pull the bar from the floor, accelerating through the legs',
      'As the bar passes the hip, explosively drive the hips forward and shrug hard',
      'Drop under the bar and catch it in the front rack position — elbows up',
      'Stand to complete the rep',
      'Lower with control and reset',
      'Complete 4 sets of 3 reps — technique work only to start'
    ],
    coaching: 'The power clean is a technical lift — get coaching if possible before loading it. The hip drive and the timing of the catch are skills that need deliberate practice.',
    why: 'The most complete expression of full-body power in a barbell lift. Used across all strength sports and team sport conditioning for developing explosive hip extension.',
        watchOut: [
      'Pulling with the arms early instead of extending the hips first',
      'Catching with straight legs and a jarred spine rather than dipping under the bar',
      'Attempting this before the deadlift and front rack are both comfortable'
    ],
    load: 'Light. This is a speed and technique lift; loading it before the pattern is clean is how people get hurt.',
    credits: 100
  },

  // ============================================
  // RESISTANCE BAND EXERCISES — Batch 20b (12 items)
  // ============================================

  {
    id: 'band-pull-apart',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Pull-Apart',
    youtube: 'band pull-apart exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pull',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'chest-pecs'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Hold a resistance band with both hands at shoulder width, arms extended in front',
      'Pull the band apart, drawing your hands out to your sides',
      'Squeeze the shoulder blades together at the end of the movement',
      'Control the return — do not let the band snap back',
      'Complete 3 sets of 20 reps'
    ],
    coaching: 'Keep the arms straight throughout — bending the elbows turns it into an arm exercise. The movement comes from the shoulder blades.',
    why: 'One of the most effective exercises for rear deltoid and mid-trap strength — the muscles that counteract forward posture and shoulder impingement.',
        watchOut: [
      'Shrugging the shoulders up as you pull',
      'Bending the elbows, which turns it into a row',
      'Rushing the return and letting the band snap your arms together'
    ],
    load: 'Light enough that your shoulders stay down and your arms stay straight.',
    credits: 30
  },

  {
    id: 'band-face-pull',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Face Pull',
    youtube: 'band face pull exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pull',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'rotator-cuff'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Anchor a band at face height — around a door handle or post',
      'Hold the band with both hands, step back until there is tension',
      'Pull the band toward your face, elbows flaring out to the sides at shoulder height',
      'At the end of the pull, externally rotate — thumbs pointing back',
      'Control the return',
      'Complete 3 sets of 20 reps'
    ],
    coaching: 'The external rotation at the end is the key part — it is what makes this a rotator cuff and rear delt exercise rather than just a row.',
    why: 'The face pull is widely considered one of the most important shoulder health exercises — directly targets the posterior rotator cuff and combats the internal rotation dominance of most training.',
        watchOut: [
      'Pulling towards the chest rather than the face',
      'Shrugging as you pull',
      'Letting the band drag your arms forward fast at the end of each rep'
    ],
    load: 'Light. This is a small-muscle exercise and heavy bands recruit the wrong things.',
    credits: 30
  },

  {
    id: 'band-squat',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Squat',
    youtube: 'band squat exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'squat',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'adductors'],
    contraindications: ['knee-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand on the middle of a resistance band, hold the ends at shoulder height',
      'Feet shoulder-width, toes slightly out',
      'Squat down — the band provides resistance that increases as you stand',
      'Drive the knees out against the band on the way up',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'The band provides accommodating resistance — hardest at the top where you are strongest. A different stimulus to free weights.',
    why: 'Resistance bands provide accommodating resistance that matches the strength curve of the squat — developing lockout strength and glute activation at the top of the lift.',
        watchOut: [
      'Knees collapsing inward against the band',
      'Letting the band pull your chest forward',
      'Squatting deeper than you can control with the band tension'
    ],
    load: 'A band that makes the last two reps hard while your knees still track over your toes.',
    credits: 35
  },

  {
    id: 'band-hip-hinge',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Hip Hinge — Deadlift Pattern',
    youtube: 'band hip hinge - deadlift pattern exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'hinge',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: ['lower-back-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand on the middle of a band, hold the ends in each hand',
      'Hinge at the hip — push hips back, back flat, band tight',
      'Drive the hips forward to return to standing — squeeze the glutes at the top',
      'The band should provide meaningful resistance through the full range',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'Ideal for learning the hip hinge pattern before adding barbell load, or for training at home with no heavy equipment.',
    why: 'Teaches and loads the hip hinge pattern with accessible equipment. Builds glute and hamstring strength in the same movement pattern as the deadlift.',
        watchOut: [
      'Squatting rather than pushing the hips back',
      'Rounding the lower back at the bottom',
      'Pulling with the arms; they are only hooks here'
    ],
    load: 'Enough tension to feel the backside working, light enough that your back stays flat.',
    credits: 35
  },

  {
    id: 'band-chest-press',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Chest Press',
    youtube: 'band chest press exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'push',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Anchor the band behind you at chest height',
      'Hold one end in each hand, step forward to create tension',
      'Press both hands forward at chest height until arms are extended',
      'Control the return — do not let the band pull the arms back fast',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'The resistance increases as the arms extend — the hardest part is lockout, where a barbell bench press is actually easiest. Complements free weight pressing well.',
    why: 'Provides a horizontal pressing movement accessible without a barbell or bench. The accommodating resistance is a different stimulus that complements standard pressing.',
        watchOut: [
      'Elbows flaring straight out to the sides',
      'Letting the band snap your hands back rather than controlling the return',
      'Anchor point too high or too low, so the press runs at an awkward angle'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your elbows stay at forty-five degrees.',
    credits: 35
  },

  {
    id: 'band-row-seated',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Seated Band Row',
    youtube: 'seated band row exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pull',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'triceps-biceps', 'shoulder'],
    contraindications: ['lower-back-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit on the floor with legs extended, loop the band around both feet',
      'Hold one end in each hand, sit tall',
      'Pull the band to your lower ribs — elbows travelling back',
      'Squeeze the shoulder blades at the end of the pull',
      'Control the return',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'Keep the torso upright throughout — the temptation is to lean back to help the pull. The movement should come from the arms and shoulder blades only.',
    why: 'A fully accessible rowing exercise requiring only a band and the floor. Builds the upper back strength that counteracts desk posture and shoulder impingement.',
        watchOut: [
      'Leaning back to start the pull',
      'Rounding the back as you return',
      'Shrugging rather than driving the elbows back'
    ],
    load: 'Enough tension that the last two reps are hard, light enough that you sit tall throughout.',
    credits: 35
  },

  {
    id: 'band-lateral-walk',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Lateral Walk',
    youtube: 'band lateral walk exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'squat',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hip', 'adductors'],
    contraindications: ['knee-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Place a band around both legs just above the knees',
      'Stand in a shallow squat position — feet hip-width, slight knee bend',
      'Step sideways to the right, then bring the left foot in — maintaining the gap',
      'Stay in the squat position throughout',
      'Take 10 steps right, then 10 steps left',
      'Complete 3 sets each way'
    ],
    coaching: 'The glutes should be working hard by the third or fourth step. If not, use a heavier band or widen the stance.',
    why: 'Directly activates the glute medius — the hip abductor most responsible for knee stability and lateral movement. Used in ACL prevention protocols worldwide.',
        watchOut: [
      'Standing up tall between steps, which lets the tension off',
      'Feet dragging rather than stepping',
      'Knees caving inward against the band, which is the opposite of what it is for'
    ],
    load: 'A band you can walk against without your knees collapsing inwards.',
    credits: 35
  },

  {
    id: 'band-standing-row',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Standing Single-Arm Row',
    youtube: 'band standing single-arm row exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pull',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'abdominals'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Anchor the band at waist height',
      'Stand sideways to the anchor, hold the band in one hand',
      'Step away until the band is taut',
      'Pull the band to your hip — elbow travelling back',
      'The opposite hand is free — core must resist rotation',
      'Complete 12 reps each side, 3 sets'
    ],
    coaching: 'The anti-rotation demand makes this more effective for core development than a cable or dumbbell row from a supported position.',
    why: 'A single-arm pull against a lateral anchor requires core anti-rotation — combining back strength and core stability in a functional standing pattern.',
        watchOut: [
      'Twisting the torso towards the anchor as you pull',
      'Shrugging the shoulder up',
      'Letting the band drag you forward on the return'
    ],
    load: 'Enough tension to work, light enough that your torso stays square.',
    credits: 40
  },

  {
    id: 'band-bicep-curl',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Bicep Curl',
    youtube: 'band bicep curl exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pull',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['triceps-biceps'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand on the middle of a resistance band',
      'Hold one end in each hand, palms facing forward',
      'Curl both hands toward the shoulders — elbows stay tucked at the sides',
      'Squeeze at the top, lower with control',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'Keep the elbows pinned to the sides throughout — swinging the elbows forward turns it into a shoulder exercise.',
    why: 'A simple, accessible bicep exercise requiring only a band. Builds elbow flexor strength for pulling movements and functional daily tasks.',
        watchOut: [
      'Elbows swinging forward away from your sides',
      'Leaning back as the tension increases',
      'Rushing the lowering, which is where most of the work is'
    ],
    load: 'Light enough that your elbows stay pinned to your sides throughout.',
    credits: 25
  },

  {
    id: 'band-tricep-pushdown',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Tricep Pushdown',
    youtube: 'band tricep pushdown exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'push',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['triceps-biceps'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Anchor the band at head height or above',
      'Hold both ends, elbows bent at 90 degrees, pinned to the sides',
      'Push both hands down toward the hips until the arms are straight',
      'Control the return — elbows stay pinned',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'The elbows must not move — if they drift forward, you are using shoulder flexion rather than tricep extension.',
    why: 'A direct tricep isolation exercise that complements pressing movements and builds elbow extension strength for pushing, throwing, and overhead sport.',
        watchOut: [
      'Elbows travelling forward as you push',
      'Leaning your bodyweight over the band to force it down',
      'Not straightening fully at the bottom, which is where the work is'
    ],
    load: 'Light. Small muscles respond to control, not tension.',
    credits: 25
  },

  {
    id: 'band-overhead-press',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Overhead Press',
    youtube: 'band overhead press exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'push',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'triceps-biceps', 'abdominals'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand on the middle of a band, hold the ends at shoulder height',
      'Press both hands overhead until the arms are straight',
      'Lower with control to shoulder height',
      'Keep the core braced — do not let the lower back arch',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'Accommodating resistance means the band is hardest overhead where you are typically weakest in a barbell press. Develops strength at the top of the pressing range.',
    why: 'A fully accessible overhead pressing movement requiring only a band. Builds shoulder strength and overhead stability without a barbell or machine.',
        watchOut: [
      'Arching the lower back to get the hands overhead',
      'Bands drifting in front of your face rather than pressing straight up',
      'Any pinching overhead: reduce the range'
    ],
    load: 'Enough tension that the last two reps are hard, light enough that your ribs stay down.',
    credits: 35
  },

  {
    id: 'band-pallof-press',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Band Pallof Press',
    youtube: 'band pallof press exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'anti-rotation',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'glutes', 'lower-back'],
    contraindications: ['glutes-acute', 'lower-back-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Anchor a band at chest height',
      'Stand sideways to the anchor, hold the band with both hands at the chest',
      'Press both hands directly forward — arms extending in front of the chest',
      'Hold for 2 seconds, then return to the chest',
      'The band tries to rotate you toward the anchor — resist it completely',
      'Complete 10 reps each side, 3 sets'
    ],
    coaching: 'The anti-rotation demand is highest when the arms are extended. Everything in the body is working to stay square.',
    why: 'The Pallof press is the gold standard anti-rotation core exercise — trains the core in its primary function of resisting unwanted movement rather than creating it.',
    watchOut: [
      'Rotating towards the anchor at the point the arms straighten, which is where it is hardest and where form usually goes',
      'Shoulders creeping up towards the ears as you press',
      'Rushing the two-second hold, which is the part doing most of the work',
      'Feet too close together, which makes staying square harder than it needs to be'
    ],
    load: 'Light enough to stay square throughout. Progress by stepping further from the anchor before reaching for a stronger band.',
    credits: 40,
    sets: 3,
    reps: "12 each side",
    holdSeconds: 2,
    rest: 45,
    description: "Anchor a resistance band at chest height. Stand sideways to it, hold the band at your chest. Press directly forward and hold 2 seconds. Return slowly. The band pulls you sideways — resist it with your core.",
    cues: [
      "Choose a band resistance that challenges you without pulling you off balance",
      "Feet shoulder-width, slight knee bend, soft hips",
      "Pause at full extension — that is where the anti-rotation work is",
      "Keep the torso square to the front throughout"
    ],
  }


  ,

  // ============================================
  // DUMBBELL ISOLATION & FUNCTIONAL — Batch 21 (16 items)
  // Fills the strength gap to ~90 items
  // ============================================

  {
    id: 'dumbbell-romanian-deadlift',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Romanian Deadlift',
    youtube: 'dumbbell romanian deadlift exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'hinge',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: ['hamstring-acute', 'lower-back-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Hold a dumbbell in each hand at hip height, palms facing you',
      'Hinge at the hip — push hips back, weights travel close to the legs',
      'Lower until strong hamstring stretch — usually mid-shin',
      'Keep the back flat throughout',
      'Drive hips forward to return',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'Dumbbells allow a slightly wider or narrower path than a barbell — useful if hip structure makes a barbell RDL awkward.',
    why: 'Builds hamstring and glute strength in the hinge pattern with lighter, more accessible equipment than a barbell.',
        watchOut: [
      'Back rounding as you lower — stop where it is still flat',
      'Feeling this in the lower back rather than the hamstrings',
      'Bending the knees to reach lower; they stay softly bent and still',
      'Any sharp back pain: put the weights down for today'
    ],
    load: 'Heavy enough that your hamstrings clearly work, light enough that your back never rounds.',
    credits: 65
  },

  {
    id: 'dumbbell-step-up',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Step-Up',
    youtube: 'dumbbell step-up exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'squat',
    equipment: ['dumbbell'],
    equipmentOptional: ['step'],
    affectsAreas: ['quadriceps', 'glutes', 'hamstring'],
    contraindications: ['knee-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Hold a dumbbell in each hand, stand in front of a step or box',
      'Step up with the right foot, pressing through the heel to stand fully on top',
      'Bring the left foot up to meet it',
      'Step back down with control — left foot first',
      'Complete all reps on the right before switching to the left',
      '3 sets of 10 each side'
    ],
    coaching: 'Drive through the heel of the working leg — not the toe. If the heel lifts, the step is too high or the weight too heavy.',
    why: 'A unilateral leg exercise that builds quad and glute strength while exposing and correcting strength imbalances between legs.',
        watchOut: [
      'Pushing off the trailing foot to launch yourself up, rather than driving through the foot on the step',
      'Step too high, so the hip has to rotate to get up',
      'Dropping down rather than lowering under control'
    ],
    load: 'Heavy enough to be demanding, light enough that you never push off the back foot.',
    credits: 60
  },

  {
    id: 'dumbbell-reverse-lunge',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Reverse Lunge',
    youtube: 'dumbbell reverse lunge exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'squat',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'hamstring'],
    contraindications: ['knee-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Hold a dumbbell in each hand, stand tall',
      'Step backward with the right foot, lowering the right knee toward the floor',
      'Front knee stays over the front ankle — not caving inward',
      'Drive through the front heel to return to standing',
      'Alternate legs or complete all reps on one side first',
      '3 sets of 10 each side'
    ],
    coaching: 'The reverse lunge is safer on the knee than a forward lunge — the forces are more controllable. A good starting point for people rebuilding knee confidence.',
    why: 'Develops unilateral lower body strength with lower knee shear force than a forward lunge. Excellent for building single-leg stability.',
        watchOut: [
      'Front knee travelling far past the toes',
      'Trunk falling forward as you step back',
      'Landing heavily on the back foot rather than placing it'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough to stay upright and balanced.',
    credits: 55
  },

  {
    id: 'dumbbell-shoulder-y-raise',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Y-Raise',
    youtube: 'dumbbell y-raise exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pull',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie face down on a bench or stand with a slight forward lean',
      'Hold a very light dumbbell in each hand, arms hanging',
      'Raise both arms in a Y shape — at about 30 to 45 degrees from the ears',
      'Thumbs pointing upward at the top',
      'Lower slowly',
      '3 sets of 15 reps — use lighter weight than you expect'
    ],
    coaching: 'Most people use far too much weight for this. Lower trap activation requires a very light load and precise movement — not heavier weight and momentum.',
    why: 'Directly trains the lower trapezius — one of the most underactive muscles in desk workers and a primary cause of shoulder impingement and neck pain.',
        watchOut: [
      'Shrugging as you raise',
      'Arching the back to help the weights up',
      'Going heavy on a small-muscle exercise'
    ],
    load: 'Very light. This one is about position, not load.',
    credits: 35
  },

  {
    id: 'dumbbell-single-leg-deadlift',
    position: 'standing',
    impact: false,
    balanceDemand: true,
    name: 'Single-Leg Dumbbell Deadlift',
    youtube: 'single-leg dumbbell deadlift exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'hinge',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: ['ankle-foot-acute', 'hamstring-acute', 'glutes-acute', 'lower-back-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on your right leg, holding a dumbbell in the left hand',
      'Hinge forward, extending the left leg behind you for counterbalance',
      'Lower the dumbbell toward the floor, keeping the back flat',
      'Drive through the right heel to return to standing',
      'Complete 8 reps each side, 3 sets'
    ],
    coaching: 'The balance challenge makes this harder than the weight suggests. Use a lighter dumbbell than you think and focus on hip hinge quality and balance.',
    why: 'Combines hamstring and glute strength with single-leg balance — develops the hip stability and posterior chain strength needed for running and sport.',
        watchOut: [
      'Hips opening to the side rather than staying square to the floor',
      'Rounding the back to reach lower',
      'Rushing; balance needs a slow tempo'
    ],
    load: 'Light. Balance limits this exercise long before strength does.',
    credits: 65
  },

  {
    id: 'dumbbell-incline-row',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Incline Row',
    youtube: 'dumbbell incline row exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pull',
    equipment: ['dumbbell', 'bench'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Set a bench to 45 degrees incline',
      'Lie face down, one dumbbell in each hand hanging below the bench',
      'Row both dumbbells to your lower ribs simultaneously',
      'Squeeze the shoulder blades at the top',
      'Lower with control',
      '3 sets of 12 reps'
    ],
    coaching: 'The prone position prevents any cheating through body momentum — the upper back does all the work.',
    why: 'A bilateral row that removes all postural cheating — the chest-supported position isolates the upper back muscles completely.',
        watchOut: [
      'Lifting the chest off the bench to help the weights up',
      'Shrugging rather than driving the elbows back',
      'Letting the weights drop fast at the end of each rep'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your chest stays on the bench.',
    credits: 55
  },

  {
    id: 'dumbbell-goblet-squat-pause',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Paused Goblet Squat',
    youtube: 'paused goblet squat exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'squat',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['quadriceps', 'glutes', 'adductors'],
    contraindications: ['knee-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Hold a dumbbell vertically at chest height with both hands',
      'Squat down until thighs are parallel or below',
      'Pause at the bottom for 3 seconds — stay tight, do not relax',
      'Drive through the heels to stand',
      '3 sets of 8 reps'
    ],
    coaching: 'The pause at the bottom eliminates the elastic rebound — every rep starts from a dead stop. Much harder than it sounds.',
    why: 'Pausing removes elastic energy from the squat, requiring pure muscular strength to stand. Develops bottom-position strength and hip mobility simultaneously.',
        watchOut: [
      'Bouncing out of the pause rather than holding it still',
      'Chest dropping forward during the hold',
      'Heels lifting at the bottom'
    ],
    load: 'Lighter than a normal goblet squat. The pause makes the same weight considerably harder.',
    credits: 60
  },

  {
    id: 'dumbbell-floor-fly',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Floor Fly',
    youtube: 'dumbbell floor fly exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'push',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on the floor, one dumbbell in each hand, arms extended over the chest',
      'Lower both arms in an arc — elbows slightly bent — until the upper arms rest on the floor',
      'Press the dumbbells back together in an arc at the top',
      'The floor limits the range of motion — safer on the shoulder than a bench fly',
      '3 sets of 12 reps'
    ],
    coaching: 'Keep a slight bend in the elbows throughout — a straight arm fly puts excessive stress on the bicep tendon at the shoulder.',
    why: 'Develops chest strength through the fly movement pattern — wider range than pressing. The floor acts as a natural range limiter, making it shoulder-friendly.',
        watchOut: [
      'Straightening the arms fully, which strains the elbow',
      'Going too heavy on a movement with a long lever',
      'Bouncing the upper arms off the floor'
    ],
    load: 'Much lighter than a press. Flyes put the shoulder in a long position and reward restraint.',
    credits: 50
  },

  {
    id: 'functional-carry-overhead',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Overhead Carry',
    youtube: 'overhead carry exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'carry',
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['shoulder', 'abdominals', 'upper-back'],
    contraindications: ['shoulder-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Press a dumbbell overhead in one hand, arm locked out',
      'Walk forward for 20 to 30 metres maintaining the arm position',
      'The core must work hard to prevent side-bending',
      'Return and switch arms',
      '3 sets each side'
    ],
    coaching: 'The overhead carry exposes shoulder weakness and core instability immediately. If the arm wavers, the weight is too heavy.',
    why: 'Develops shoulder stability and core anti-lateral-flexion under dynamic load — a uniquely functional combination that transfers to every overhead sport and activity.',
        watchOut: [
      'Ribs flaring and the back arching under the overhead load',
      'The arm drifting forward instead of staying beside the ear',
      'Walking before the shoulder is stable overhead'
    ],
    load: 'Light. Overhead carries are about position, and a heavy one just teaches a bad position.',
    credits: 60
  },

  {
    id: 'functional-sandbag-carry',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Bear Hug Carry',
    youtube: 'bear hug carry exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'carry',
    equipment: [],
    equipmentOptional: ['sandbag', 'dumbbell'],
    affectsAreas: ['full-body', 'abdominals', 'upper-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Pick up a heavy awkward object — a loaded bag, a heavy dumbbell held at the chest, a sandbag',
      'Hug it to the chest and walk forward for 20 to 30 metres',
      'The irregular load demands constant core adjustment',
      'Return and repeat',
      '3 sets'
    ],
    coaching: 'The awkwardness of the load is the point — odd objects demand more from the stabilising system than any perfectly balanced barbell.',
    why: 'Odd-object carrying builds real-world functional strength — the type used in moving house, carrying shopping, or field sport. Develops total body tension and grip endurance.',
        watchOut: [
      'Rounding the back to hold the load against the chest',
      'Leaning back to counterbalance',
      'Holding your breath through the walk'
    ],
    load: 'Heavy enough that holding the position is work, light enough that your back stays flat.',
    credits: 70
  },

  {
    id: 'dumbbell-zottman-curl',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Zottman Curl',
    youtube: 'zottman curl exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pull',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['triceps-biceps'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Hold dumbbells with palms facing up — supinated',
      'Curl both dumbbells to shoulder height',
      'At the top, rotate the wrists so palms face down — pronated',
      'Lower slowly with palms facing down — forearms working hard',
      'At the bottom, rotate palms up again for the next rep',
      '3 sets of 10 reps'
    ],
    coaching: 'The lowering phase with pronated grip develops forearm and brachioradialis strength that standard curls miss entirely.',
    why: 'The Zottman curl trains both the bicep on the way up and the forearm and brachioradialis on the way down — more efficient than any single curl variation.',
        watchOut: [
      'Rushing the rotation at the top',
      'Elbows swinging forward',
      'Going as heavy as a normal curl; the reverse lowering is much harder'
    ],
    load: 'Lighter than a standard curl, because the lowering half decides the weight.',
    credits: 35
  },

  {
    id: 'dumbbell-pullover',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Pullover',
    youtube: 'dumbbell pullover exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'pull',
    equipment: ['dumbbell', 'bench'],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'upper-back', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie across a bench — only the upper back on the bench, feet flat on the floor',
      'Hold a single dumbbell with both hands over the chest, arms slightly bent',
      'Lower the dumbbell in an arc behind the head — feel the chest and lats stretch',
      'Bring it back over the chest in the same arc',
      '3 sets of 12 reps'
    ],
    coaching: 'Keep a slight bend in the elbows throughout. The stretch behind the head should feel like a deep chest and lat opening — not shoulder pain.',
    why: 'A unique exercise that trains both the chest and the lats through a long range of motion — builds thoracic mobility alongside upper body strength.',
        watchOut: [
      'Ribs flaring and the back arching as the weight goes overhead',
      'Straightening the elbows fully under load',
      'Going deeper than your shoulders comfortably allow'
    ],
    load: 'Light. Shoulder position matters far more than weight on this one.',
    credits: 50
  },

  {
    id: 'bodyweight-pistol-squat-progression',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Pistol Squat Progression',
    youtube: 'pistol squat progression exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 4,   // DIFF-1 15 Aug 2026: was 3. Single-leg, full depth, balance-dependent.
    duration: 90,
    perSide: true,
    instructions: [
      'Begin with assisted: hold a pole or doorframe for balance',
      'Stand on one leg, the other leg extended forward',
      'Lower slowly on the standing leg — as deep as possible',
      'Drive through the heel to stand',
      'Progress to unassisted as strength and balance allow',
      '3 sets of 5 each side'
    ],
    coaching: 'The pistol squat demands ankle mobility, hip flexibility, and single-leg strength simultaneously. Progress is slow — that is normal.',
    why: 'One of the most demanding single-leg exercises — requires full range of motion strength through the entire lower body. A legitimate marker of functional lower body fitness.',
        watchOut: [
      'Skipping ahead in the progression before the current stage is comfortable',
      'Knee collapsing inward at the bottom',
      'Rounding the lower back to reach depth'
    ],
    load: 'Bodyweight. This is a progression to work through, not a lift to load.',
    credits: 80
  },

  {
    id: 'bodyweight-nordic-curl-progression',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Nordic Curl — Assisted Progression',
    youtube: 'nordic curl - assisted progression exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring'],
    contraindications: ['hamstring-acute'],
    energyRequired: 7,
    difficultyLevel: 4,   // DIFF-1 15 Aug 2026: was 3. Eccentric hamstring loading. The unassisted version is already d6.
    duration: 90,
    perSide: false,
    instructions: [
      'Kneel on a soft surface, feet anchored under something heavy or held by a partner',
      'Arms crossed or hands ready to catch yourself',
      'Slowly lower your body forward from the knees — maintaining a straight line from knees to head',
      'Use your hands to catch and push back up if needed',
      'Aim for the longest controlled lowering possible before needing the hands',
      '3 sets of 5 reps — full recovery between sets'
    ],
    coaching: 'The Nordic curl is extremely demanding — most people need the hand assist for months before a full unassisted rep is possible. The assisted version still delivers major hamstring gains.',
    why: 'The Nordic curl has the strongest evidence base of any hamstring injury prevention exercise. Eccentric hamstring strength built here directly reduces hamstring strain risk in sport.',
        watchOut: [
      'Falling rather than lowering; you should control every inch',
      'Bending at the hips to make it easier, which removes the point',
      'Attempting the full version before the assisted stages are comfortable'
    ],
    load: 'Bodyweight, heavily assisted. This is one of the hardest movements there is.',
    credits: 80
  },

  {
    id: 'isometric-wall-sit',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Wall Sit',
    youtube: 'wall sit exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes'],
    contraindications: ['knee-acute'],
    caution: ['glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with your back against a wall',
      'Slide down until thighs are parallel to the floor — knees at 90 degrees',
      'Feet flat, knees directly over ankles — not forward',
      'Hold as long as possible',
      'Build toward 60 seconds, then extend further',
      'Complete 3 holds with equal rest'
    ],
    coaching: 'Wall sits are harder than they look after 30 seconds. The quads burn — that is the point. Focus on keeping the back flat on the wall.',
    why: 'Isometric quad strength directly supports knee health and is used in patellofemoral pain rehabilitation. A simple, effective strength and endurance exercise.',
        watchOut: [
      'Sliding down as you tire rather than holding position',
      'Knees drifting past the toes',
      'Holding your breath; breathe steadily throughout'
    ],
    load: 'Bodyweight. Progress by holding longer.',
    credits: 40
  },

  {
    id: 'isometric-hollow-hold',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Hollow Body Hold',
    youtube: 'hollow body hold exercise technique',
    category: 'strength',
    contentType: 'exercise',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'hip-flexor'],
    contraindications: ['lower-back-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back, arms extended overhead',
      'Press the lower back firmly into the floor',
      'Lift shoulders, arms, and legs slightly off the floor — maintaining the lower back contact',
      'The body forms a shallow dish or "hollow" shape',
      'Hold for as long as lower back contact is maintained',
      'Build toward 30 to 60 seconds, 3 sets'
    ],
    coaching: 'The moment the lower back arches off the floor, the position is lost. Lift the legs higher or bend the knees to reduce difficulty and maintain position.',
    why: 'The hollow body hold is the foundation of gymnastics strength training — trains the deep abdominals to maintain spinal position against load, essential for all pressing and pulling movements.',
        watchOut: [
      'Lower back lifting off the floor, which is the point to reduce the range',
      'Holding your breath',
      'Extending the arms and legs further than you can keep the back flat'
    ],
    load: 'Bodyweight. Progress by extending further while the back stays down.',
    credits: 55,
    sets: 3,
    reps: null,
    holdSeconds: 20,
    rest: 60,
    description: "Lie on your back. Press your lower back into the floor. Lift your arms overhead and your legs off the floor. Hold the position — you should look like a shallow dish.",
    cues: [
      "Lower back must stay in contact with the floor",
      "Legs higher if your back lifts — reduce the lever arm",
      "Arms by your sides is an easier variation",
      "Breathe — do not hold your breath"
    ],
  }

];
