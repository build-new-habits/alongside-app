/**
 * data/exercises/recovery.js
 * Recovery exercises — yoga poses, self-massage, restorative movement
 * Breathwork — all breathwork practices (Component F, Batch 1)
 * These are the primary content served in Recovery Mode (burnout / energy ≤ 4)
 */

export const RECOVERY = [

  // ============================================
  // RECOVERY — YOGA & RESTORATIVE
  // ============================================

  {
    id: 'childs-pose',
    name: 'Child\'s Pose',
    category: 'recovery',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'hip', 'shoulder'],
    contraindications: ['knee-acute'],
    energyRequired: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Kneel on the floor, big toes touching, knees wide apart',
      'Sit back toward your heels',
      'Walk your hands forward and rest your forehead on the floor',
      'Let your arms rest extended or alongside your body',
      'Breathe deeply and hold for 1-3 minutes'
    ],
    coaching: 'Place a folded blanket between your thighs and calves if kneeling is uncomfortable.',
    why: 'A deeply restorative pose that releases the lower back, hips, and shoulders gently.',
    credits: 30
  },

  {
    id: 'supine-twist',
    name: 'Supine Spinal Twist',
    category: 'recovery',
    movementPattern: 'spinal-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'spine', 'glutes'],
    contraindications: [],
    energyRequired: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back with knees bent',
      'Drop both knees to the right side',
      'Extend arms out to either side in a T shape',
      'Turn your head to the left if comfortable',
      'Hold for 1 minute, then switch sides'
    ],
    coaching: 'Keep both shoulders on the floor — the knees don\'t need to reach the ground.',
    why: 'Releases tension along the entire spine and outer hips.',
    credits: 30
  },

  {
    id: 'foam-roll-upper-back',
    name: 'Foam Roll — Upper Back',
    category: 'recovery',
    movementPattern: 'self-massage',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'thoracic'],
    contraindications: [],
    energyRequired: 2,
    duration: 120,
    perSide: false,
    instructions: [
      'Place the foam roller horizontally under your upper back, just below shoulder blades',
      'Cross your arms over your chest or support your head with hands',
      'Use your feet to slowly roll up and down the upper back',
      'Pause on any tight spots for 20-30 seconds',
      'Keep rolling gentle — avoid rolling directly on the neck or lower back'
    ],
    coaching: 'Let gravity do the work. You shouldn\'t be forcing the roller — just resting into it.',
    why: 'Releases upper back tension that accumulates from sitting, screens, and stress.',
    credits: 35
  },

  {
    id: 'foam-roll-quads',
    name: 'Foam Roll — Quads',
    category: 'recovery',
    movementPattern: 'self-massage',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps'],
    contraindications: ['knee-acute'],
    energyRequired: 3,
    duration: 120,
    perSide: true,
    instructions: [
      'Lie face down, foam roller under your right thigh',
      'Support yourself on your forearms',
      'Slowly roll from just above the knee to the hip',
      'Pause on any tight or tender spots for 20-30 seconds',
      'Roll for 60 seconds per leg'
    ],
    coaching: 'Roll slowly — about 1 inch per second. Fast rolling doesn\'t release the muscle.',
    why: 'Reduces quad tightness that can contribute to knee pain and limited hip mobility.',
    credits: 35
  },

  {
    id: 'diaphragmatic-breathing',
    name: 'Diaphragmatic Breathing',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet flat',
      'Place one hand on your chest, one on your belly',
      'Breathe in slowly through your nose — feel your belly rise',
      'Your chest should stay relatively still',
      'Breathe out slowly through pursed lips',
      'Continue for 5 minutes'
    ],
    coaching: 'This is harder than it sounds at first — most of us breathe too shallow. Stick with it.',
    why: 'Activates the body\'s natural relaxation response and improves oxygen efficiency.',
    credits: 20
  },

  {
    id: 'leg-up-wall',
    name: 'Legs Up the Wall',
    category: 'recovery',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'lower-back', 'nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit sideways against a wall',
      'Swing legs up as you lie back',
      'Scoot hips close to wall, legs resting vertically',
      'Arms relaxed at sides, breathe deeply'
    ],
    coaching: 'Great for after long days on your feet or after exercise.',
    why: 'Gentle inversion that helps fluid return from legs and calms the nervous system.',
    credits: 30
  },

  // ============================================
  // BREATHWORK — Batch 1 (12 practices)
  // Primary Recovery Mode content — energy ≤ 4 or burnout detected
  // contentType: 'practice' — duration-based, no reps
  // ============================================

  {
    id: 'box-breathing',
    name: 'Box Breathing',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit comfortably or lie down — whichever feels right',
      'Breathe out fully to start',
      'Breathe in through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Breathe out through your mouth for 4 counts',
      'Hold empty for 4 counts',
      'Repeat for 5 minutes or until you feel calmer'
    ],
    coaching: 'If 4 counts feels too long, try 3. There is no wrong way to do this.',
    why: 'Box breathing slows your heart rate and tells your nervous system it is safe to relax.',
    credits: 20
  },

  {
    id: 'four-seven-eight-breathing',
    name: '4-7-8 Breathing',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 240,
    perSide: false,
    instructions: [
      'Sit or lie in a comfortable position',
      'Rest the tip of your tongue behind your upper front teeth',
      'Breathe out completely through your mouth',
      'Close your mouth and breathe in through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Breathe out through your mouth for 8 counts — this is one cycle',
      'Repeat for 4 cycles to start, building to 8 over time'
    ],
    coaching: 'The long exhale is what makes this work. If 7 and 8 feel too long, halve all the numbers.',
    why: 'The extended exhale activates the rest-and-digest system, reducing anxiety and helping with sleep.',
    credits: 20
  },

  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Breathe in through your nose as fully as you can',
      'At the top of that breath, take one more short sharp sniff in',
      'Now breathe out slowly through your mouth — as long as possible',
      'Feel your shoulders drop as you exhale',
      'Repeat 3 to 5 times',
      'Return to normal breathing'
    ],
    coaching: 'This is the fastest known way to reduce stress. One or two sighs can shift your state in under a minute.',
    why: 'The double inhale fully inflates the lungs. The long exhale dumps carbon dioxide and quickly calms the body.',
    credits: 20
  },

  {
    id: 'belly-breathing',
    name: 'Belly Breathing',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Lie on your back or sit comfortably',
      'Place one hand on your chest and one on your belly',
      'Breathe in slowly through your nose — let your belly rise, not your chest',
      'The hand on your chest should barely move',
      'Breathe out slowly — feel your belly fall',
      'Continue for 5 minutes, keeping each breath slow and full'
    ],
    coaching: 'Most of us breathe too shallow without realising. This practice resets that habit.',
    why: 'Diaphragmatic breathing reduces stress hormones and increases oxygen flow around the body.',
    credits: 20
  },

  {
    id: 'extended-exhale-breathing',
    name: 'Extended Exhale Breathing',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit comfortably with your spine upright',
      'Breathe in through your nose for 4 counts',
      'Breathe out through your nose or mouth for 8 counts — twice as long as the in-breath',
      'Do not hold your breath — just focus on that longer exhale',
      'Continue for 5 minutes',
      'If 4 and 8 feel too long, try 3 and 6'
    ],
    coaching: 'The ratio matters more than the exact count. Any exhale that is longer than the inhale will calm you down.',
    why: 'Longer exhales activate the parasympathetic nervous system — the body\'s built-in calming mechanism.',
    credits: 20
  },

  {
    id: 'alternate-nostril-breathing',
    name: 'Alternate Nostril Breathing',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit comfortably with your spine tall',
      'Rest your left hand on your knee',
      'Bring your right hand to your face — index and middle fingers resting between your eyebrows',
      'Close your right nostril with your thumb — breathe in through your left nostril for 4 counts',
      'Close both nostrils — hold for 4 counts',
      'Open your right nostril — breathe out for 4 counts',
      'Breathe in through the right nostril for 4 counts, then switch — this is one cycle',
      'Continue for 5 minutes'
    ],
    coaching: 'This can feel awkward at first — that is completely normal. Focus on the breathing, not the hand position.',
    why: 'Balances the nervous system and improves focus. Used in yoga for thousands of years as a calming practice.',
    credits: 20
  },

  {
    id: 'pursed-lip-breathing',
    name: 'Pursed Lip Breathing',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 180,
    perSide: false,
    instructions: [
      'Sit comfortably and relax your shoulders',
      'Breathe in slowly through your nose for 2 counts',
      'Pucker your lips as if you are about to whistle or blow out a candle',
      'Breathe out slowly through your pursed lips for 4 counts',
      'The exhale should be gentle and controlled — not forced',
      'Repeat for 3 minutes'
    ],
    coaching: 'This is especially useful if you feel short of breath or anxious. It gives you control over your breathing rate.',
    why: 'Pursed lip breathing slows breathing, keeps airways open longer, and is clinically used for breathing conditions including asthma.',
    credits: 20
  },

  {
    id: 'coherent-breathing',
    name: 'Coherent Breathing',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Sit or lie comfortably',
      'Breathe in slowly and evenly through your nose for 5 counts',
      'Breathe out slowly and evenly through your nose for 5 counts',
      'Keep the pace consistent — there is no pause or hold',
      'This works out to about 6 breaths per minute',
      'Continue for 10 minutes — a timer can help you stay relaxed'
    ],
    coaching: 'This breathing rate has been shown to produce the greatest calming effect. It takes a few minutes to settle into.',
    why: 'Six breaths per minute synchronises your heart rate, blood pressure, and nervous system — a state called heart rate variability coherence.',
    credits: 20
  },

  {
    id: 'humming-bee-breath',
    name: 'Humming Bee Breath',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit comfortably with your eyes closed',
      'Breathe in fully through your nose',
      'As you breathe out, make a steady humming sound — like a bee',
      'Feel the vibration in your lips, face, and chest',
      'Keep the hum going for your whole exhale',
      'Breathe in again and repeat',
      'Continue for 5 minutes'
    ],
    coaching: 'There is no need to hum loudly. Even a very quiet hum works. It can feel a little silly at first.',
    why: 'Vibration from humming activates the vagus nerve — a direct pathway to the calming part of your nervous system.',
    credits: 20
  },

  {
    id: 'energising-breath',
    name: 'Energising Breath',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 2,
    duration: 120,
    perSide: false,
    instructions: [
      'Sit upright with your spine tall',
      'Take a slow, full breath in through your nose',
      'Breathe out quickly and forcefully through your nose',
      'Let the inhale happen naturally — do not force it',
      'Start slow — about one exhale per second — then speed up if comfortable',
      'Do 20 pumps, then take a full deep breath and hold for 5 seconds',
      'Breathe out slowly — this is one round',
      'Do 2 to 3 rounds'
    ],
    coaching: 'Stop immediately if you feel dizzy. This is not suitable if you are pregnant or have heart or breathing conditions.',
    why: 'The rapid breathing increases oxygen and wakes up the body — good for low-energy moments when you need a gentle boost.',
    credits: 20
  },

  {
    id: 'three-part-breath',
    name: 'Three-Part Breath',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Lie on your back or sit tall',
      'Place one hand on your belly, one on your ribs, one on your chest — or just notice each area',
      'Breathe in: fill your belly first, then your ribs, then your chest — like filling a glass from the bottom up',
      'Breathe out: release your chest first, then ribs, then belly — emptying from top to bottom',
      'Keep each breath smooth and connected — no jerks or pauses',
      'Continue for 5 minutes'
    ],
    coaching: 'This takes practice. Do not worry if it feels mechanical at first — that feeling goes away.',
    why: 'Full three-part breathing maximises your lung capacity and produces a strong calming effect.',
    credits: 20
  },

  {
    id: 'breath-counting',
    name: 'Breath Counting',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit comfortably and close your eyes',
      'Breathe naturally — do not try to control it',
      'On each exhale, count silently: 1, 2, 3... up to 10',
      'When you reach 10, start again at 1',
      'If you lose count or your mind wanders, just return to 1 without judgement',
      'Continue for 5 minutes'
    ],
    coaching: 'Losing count is not failing — noticing that you lost count is the practice. Each time you return to 1 is a small win.',
    why: 'Gives the mind a simple anchor. Particularly useful for anxiety, racing thoughts, or difficulty settling before sleep.',
    credits: 20
  }

];
