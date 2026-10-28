/**
 * data/exercises/recovery.js
 * 28 Oct 2026 v5
 * v5 - STAGE PATH P-2 and P-9b (Session 2). Every entry carries doors,
 *   feelings and style (blueprint C5; tools/verify-path-tags.mjs). Why and
 *   coaching lines that were not accurate are corrected, keeping what is
 *   true (Graeme, 28 Oct: "If they are not, then change them"); each change
 *   and its source: BNH-Files Product/alongside_library_accuracy_28oct2026_v1.md.
 *
 * 17 Oct 2026 v4
 *
 * v4 - W6-15 SCOPE-WORDS (Graeme, 17 Oct: "these are fine"). The walk's coaching no longer
 *   calls movement medicine, and its why no longer claims repair.
 *
 * 17 Oct 2026 v3
 *
 * v3 - W6-8 TRUE-WORDS-6. Mindful Walk: the timer is a guide (it said "10
 *   minutes is enough" over a 15:00 card).
 *
 * 29 Sep 2026 v2
 *
 * v2 - P0h. Descriptions say what a movement does, not what it treats:
 *   no rehab, healing, pain relief, recovery phases, named diagnoses
 *   or clinical use. Which exercises exist, and for whom, is
 *   unchanged. Names: Contrast Therapy is Hot and Cold Contrast. verify-scope-minor TEST 7.
 *
 * 10 Aug 2026 v1
 *
 * v1 — First version header on this file. Added tailored YouTube search
 *   terms to all 31 exercises (previously zero coverage, database-wide
 *   461-exercise pass, Graeme's direct request: "we get the most up to
 *   date versions and avoid any issue with discontinued or old videos"
 *   — search terms, not direct links, matching the reasoning exactly).
 *
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
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Child\'s Pose',
    youtube: 'childs pose technique',
    category: 'recovery',
    doors: ['stretch', 'feel'], feelings: ['calm', 'sleep'], style: 'stretch',   // Stage PATH P-2
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'hip', 'shoulder'],
    contraindications: ['knee-acute'],
    caution: ['lower-back-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
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
        watchOut: [
      'Bouncing into the stretch rather than holding it still',
      'Pushing to the point of pain; a stretch should feel like a strong pull, never sharp',
      'Holding your breath, which makes everything tighter',
      'Forcing the range on one side to match the other; sides are rarely equal'
    ],
    load: 'Bodyweight. Progress by holding longer, not by pushing harder.',
    credits: 30
  },

  {
    id: 'supine-twist',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Supine Spinal Twist',
    youtube: 'supine spinal twist technique',
    category: 'recovery',
    doors: ['stretch'], feelings: [], style: 'stretch',   // Stage PATH P-2
    movementPattern: 'spinal-rotation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'spine', 'glutes'],
    contraindications: ['lower-back-acute'],
    caution: ['lower-back-subacute', 'glutes-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
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
        watchOut: [
      'Bouncing into the stretch rather than holding it still',
      'Pushing to the point of pain; a stretch should feel like a strong pull, never sharp',
      'Holding your breath, which makes everything tighter',
      'Forcing the range on one side to match the other; sides are rarely equal'
    ],
    load: 'Bodyweight. Progress by holding longer, not by pushing harder.',
    credits: 30
  },

  {
    id: 'foam-roll-upper-back',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Foam Roll — Upper Back',
    youtube: 'foam roll - upper back technique',
    category: 'recovery',
    doors: ['stretch'], feelings: [], style: 'stretch',   // Stage PATH P-2
    movementPattern: 'self-massage',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'thoracic'],
    contraindications: [],
    energyRequired: 2,
    difficultyLevel: 1,
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
        watchOut: [
      'Rolling directly over a joint or bone rather than the muscle',
      'Pressing so hard you tense up, which stops the muscle releasing',
      'Rushing; slow and steady is what allows anything to change',
      'Rolling an area that is sharply painful rather than tender'
    ],
    load: 'Enough pressure to feel it clearly, light enough that you can still breathe normally.',
    credits: 35
  },

  {
    id: 'foam-roll-quads',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Foam Roll — Quads',
    youtube: 'foam roll - quads technique',
    category: 'recovery',
    doors: ['stretch'], feelings: [], style: 'stretch',   // Stage PATH P-2
    movementPattern: 'self-massage',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps'],
    contraindications: ['knee-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
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
    why: 'Eases tightness through the front of the thigh, which can free up how the knee and hip move.',
        watchOut: [
      'Rolling directly over a joint or bone rather than the muscle',
      'Pressing so hard you tense up, which stops the muscle releasing',
      'Rushing; slow and steady is what allows anything to change',
      'Rolling an area that is sharply painful rather than tender'
    ],
    load: 'Enough pressure to feel it clearly, light enough that you can still breathe normally.',
    credits: 35
  },

  {
    id: 'diaphragmatic-breathing',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Diaphragmatic Breathing',
    youtube: 'diaphragmatic breathing technique',
    category: 'recovery',
    doors: ['feel'], feelings: ['worn', 'sleep'], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    why: 'Slow breathing from the belly can help you feel calmer.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'leg-up-wall',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Legs Up the Wall',
    youtube: 'legs up the wall technique',
    category: 'recovery',
    doors: ['stretch'], feelings: [], style: 'stretch',   // Stage PATH P-2
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'lower-back', 'nervous-system'],
    contraindications: [],
    caution: ['hamstring-acute', 'lower-back-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit sideways against a wall',
      'Swing legs up as you lie back',
      'Scoot hips close to wall, legs resting vertically',
      'Arms relaxed at sides, breathe deeply'
    ],
    coaching: 'Great for after long days on your feet or after exercise.',
    why: 'Gentle inversion that helps fluid return from the legs, and many people find it calming.',
        watchOut: [
      'Bouncing into the stretch rather than holding it still',
      'Pushing to the point of pain; a stretch should feel like a strong pull, never sharp',
      'Holding your breath, which makes everything tighter',
      'Forcing the range on one side to match the other; sides are rarely equal'
    ],
    load: 'Bodyweight. Progress by holding longer, not by pushing harder.',
    credits: 30
  },

  // ============================================
  // BREATHWORK — Batch 1 (12 practices)
  // Primary Recovery Mode content — energy ≤ 4 or burnout detected
  // contentType: 'practice' — duration-based, no reps
  // ============================================

  {
    id: 'box-breathing',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Box Breathing',
    youtube: 'box breathing technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    why: 'Box breathing slows your breathing down, which many people find helps them settle.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'four-seven-eight-breathing',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: '4-7-8 Breathing',
    youtube: '4-7-8 breathing technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    why: 'The long out-breath switches on the body’s rest-and-digest response, which can help you settle and get ready for sleep.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'physiological-sigh',
    position: 'any',
    impact: false,
    balanceDemand: false,
    name: 'Physiological Sigh',
    youtube: 'physiological sigh technique',
    category: 'recovery',
    doors: ['feel'], feelings: ['calm'], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    coaching: 'In a study of healthy adults, five minutes a day of this breathing improved mood more than a breath-watching meditation. One or two sighs can help you feel calmer.',
    why: 'Two breaths in through the nose, then a long breath out. Many people find it slows things down quickly.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'belly-breathing',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Belly Breathing',
    youtube: 'belly breathing technique',
    category: 'recovery',
    doors: ['feel'], feelings: ['worn'], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    why: 'Slow breathing from the belly can help you feel calmer. In a small study, eight weeks of regular practice lowered levels of the stress hormone cortisol.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'extended-exhale-breathing',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Extended Exhale Breathing',
    youtube: 'extended exhale breathing technique',
    category: 'recovery',
    doors: ['feel'], feelings: ['calm', 'sleep'], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    coaching: 'The ratio matters more than the exact count. An out-breath longer than the in-breath helps many people feel calmer.',
    why: 'Longer exhales activate the parasympathetic nervous system — the body\'s built-in calming mechanism.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'alternate-nostril-breathing',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Alternate Nostril Breathing',
    youtube: 'alternate nostril breathing technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    why: 'A slow, rhythmic breathing practice from yoga, used for centuries; many people find it calming and steadying.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'pursed-lip-breathing',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Pursed Lip Breathing',
    youtube: 'pursed lip breathing technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    why: 'Pursed lip breathing slows the out-breath and gives your breathing a steady rhythm. Useful for catching your breath during or after effort.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'coherent-breathing',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Coherent Breathing',
    youtube: 'coherent breathing technique',
    category: 'recovery',
    doors: ['feel'], feelings: ['calm'], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    coaching: 'It takes a few minutes to settle into. If counting feels like effort, let the out-breath be a little longer than the in-breath.',
    why: 'At about six breaths a minute, your heart rate rises and falls in step with your breath and its natural variation is at its largest. Many people find this pace calming.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'humming-bee-breath',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Humming Bee Breath',
    youtube: 'humming bee breath technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    why: 'Humming slows and lengthens the out-breath, and many people find the gentle vibration calming.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'energising-breath',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Energising Breath',
    youtube: 'energising breath technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 2,
    difficultyLevel: 1,
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
    coaching: 'Stop straight away if you feel dizzy. If you are pregnant, or have anything affecting your heart or breathing, speak to a GP or physio before trying this one.',
    why: 'Quick, rhythmic breathing can feel invigorating — good for low-energy moments when you need a gentle boost.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'three-part-breath',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Three-Part Breath',
    youtube: 'three-part breath technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    why: 'Three-part breathing fills the lungs from the belly up to the chest, and many people find it calming.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'breath-counting',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Breath Counting',
    youtube: 'breath counting technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
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
    why: 'Gives the mind a simple anchor. Useful when thoughts are racing or when it is hard to settle before sleep.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  }


  ,

  // ============================================
  // RECOVERY EXPANSION — Final batch (12 items)
  // ============================================

  {
    id: 'cold-shower-protocol',
    position: 'any',
    impact: false,
    balanceDemand: false,
    name: 'Cold Shower — Recovery Protocol',
    youtube: 'cold shower - recovery protocol technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 180,
    perSide: false,
    instructions: [
      'Finish your normal warm shower',
      'Turn the temperature to cold — as cold as possible',
      'Stay under for 30 seconds initially',
      'Build toward 2 to 3 minutes over several weeks',
      'Focus on slow, controlled breathing throughout — do not gasp and tense',
      'Finish cold — do not turn the warm back on'
    ],
    coaching: 'The breathing is the practice. The cold is just the trigger. Keep the breath slow and steady while the cold does its work.',
    why: 'Cold water immersion activates the sympathetic system and then the parasympathetic rebound. With regular practice it feels less of a shock, and cold water after hard exercise can ease muscle soreness a little.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'contrast-therapy',
    position: 'any',
    impact: false,
    balanceDemand: false,
    name: 'Hot and Cold Contrast',
    youtube: 'hot and cold contrast recovery technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['cardiovascular-condition'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Alternate between hot and cold water exposure',
      'Hot: 3 minutes in a warm shower or bath',
      'Cold: 1 minute in cold shower or cold water',
      'Repeat the cycle 3 to 4 times',
      'Always finish with cold',
      'Use after heavy training sessions or competition'
    ],
    coaching: 'Warm opens the blood vessels and cold narrows them, so the blood flow changes as you switch.',
    why: 'Alternating hot and cold changes blood flow through the muscles. Many sports teams use it after matches, and plenty of people find their legs feel fresher afterwards.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 25
  },

  {
    id: 'napping-protocol',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Recovery Nap Protocol',
    youtube: 'recovery nap protocol technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 1200,
    perSide: false,
    instructions: [
      'Find a dark, quiet space in the early afternoon — ideally 1 to 3pm',
      'Set an alarm for 20 to 25 minutes',
      'Lie down and allow sleep to come without forcing it',
      'If sleep does not come, rest with eyes closed — the rest still has benefit',
      'On waking, allow 5 minutes before demanding cognitive work'
    ],
    coaching: 'Naps of 20 minutes or less usually leave little grogginess; longer naps more often do. Keep it short.',
    why: 'A short nap of about 20 minutes can improve alertness and mood for a few hours afterwards. In a NASA study of long-haul pilots, a planned nap of about 26 minutes improved alertness.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'hydration-protocol',
    position: 'any',
    impact: false,
    balanceDemand: false,
    name: 'Hydration Protocol',
    youtube: 'hydration protocol technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Weigh yourself before and after exercise if possible',
      'For every kilogram of body weight lost, drink 1.5 litres of fluid',
      'Include electrolytes in post-exercise hydration — a small amount of salt in water is sufficient',
      'Urine colour is a reliable guide — pale yellow is optimal, dark yellow means dehydration',
      'Drink 500ml in the 2 hours before exercise',
      'Do not wait until you are thirsty during exercise — drink on a schedule'
    ],
    coaching: 'Losing about 2% of your body weight in sweat can start to affect endurance performance. Drinking regularly through the day keeps you well clear of that.',
    why: 'Drinking enough supports how you feel and how you perform, and the habit is simple.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 15
  },

  {
    id: 'nutrition-timing',
    position: 'any',
    impact: false,
    balanceDemand: false,
    name: 'Post-Exercise Nutrition Window',
    youtube: 'post-exercise nutrition window technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Within 30 to 60 minutes of finishing exercise, consume:',
      'Protein: 20 to 40 grams — chicken, eggs, protein shake, Greek yogurt',
      'Carbohydrate: 1 to 1.2 grams per kilogram of body weight — rice, banana, oats',
      'Liquid: at least 500ml water',
      'This window is when muscle protein synthesis is highest',
      'A regular meal within 2 hours also works if the immediate window is missed'
    ],
    coaching: 'The post-exercise nutrition window is most important after hard training sessions. After an easy walk, it matters much less.',
    why: 'Muscle protein synthesis rates are elevated for 24 to 48 hours after resistance training, but peak in the first 2 hours. Post-exercise nutrition directly supports recovery and adaptation.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 15
  },

  {
    id: 'trigger-point-release-ball',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Trigger Point Release — Ball',
    youtube: 'trigger point release - ball technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: ['massage-ball'],
    equipmentOptional: ['tennis-ball'],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Place a massage ball or tennis ball between your body and the floor or wall',
      'Find a tender spot — a knot or area of tightness',
      'Apply pressure by leaning into the ball — stay on the tender spot for 30 to 60 seconds',
      'Add slow movement — small circles or rolling',
      'When the tenderness reduces, move to the next spot',
      'Work: glutes, upper back, calves, and plantar fascia (foot)'
    ],
    coaching: 'The pressure can feel uncomfortable but should never be sharp. Avoid directly on bones or joints.',
    why: 'Pressing into tight spots with a ball lets you work on knots that restrict movement. A ball gives deeper pressure and more precision than a foam roller.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 25
  },

  {
    id: 'elevation-recovery',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Leg Elevation Recovery',
    youtube: 'leg elevation recovery technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'ankle-foot'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Lie on your back and rest both legs up against a wall',
      'Legs are raised above heart level — feet pointing to the ceiling',
      'Remain in this position for 10 minutes',
      'Optional: add ankle circles while elevated'
    ],
    coaching: 'Legs up the wall is one of the simplest recovery positions there is. It works purely through gravity and requires nothing.',
    why: 'Raising the legs above the heart helps fluid drain back from them, which can ease swelling and heaviness after a long time on your feet.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 15
  },


  {
    id: 'mindful-walk',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Mindful Walk',
    youtube: 'mindful walk technique',
    category: 'recovery',
    doors: ['moving'], feelings: [], style: 'exercise',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system', 'full-body'],
    contraindications: ['ankle-foot-acute', 'knee-acute'],
    caution: ['lower-back-acute', 'hamstring-acute', 'glutes-acute', 'hip-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 900,
    perSide: false,
    instructions: [
      'Put your trainers on — that is the only target right now',
      'Step outside and start walking at whatever pace feels right',
      'No distance target. The timer is a guide: stop whenever you like',
      'Let your eyes move: notice three things you can see',
      'Notice the ground beneath your feet with each step',
      'If pain increases, slow down or stop — this is not pushing through',
      'Pause whenever you want. Look around. Breathe.',
      'Return home before you feel tired — not after'
    ],
    coaching: 'This is not exercise. It is gentle movement and fresh air, and a reminder that your body still works, even on hard days. The goal is simply to have gone.',
    why: 'Gentle walking maintains circulation and joint mobility without loading the structures that are hurting. Paying attention as you walk helps many people feel more settled.',
        watchOut: [
      'Bouncing into the stretch rather than holding it still',
      'Pushing to the point of pain; a stretch should feel like a strong pull, never sharp',
      'Holding your breath, which makes everything tighter',
      'Forcing the range on one side to match the other; sides are rarely equal'
    ],
    load: 'Bodyweight. Progress by holding longer, not by pushing harder.',
    credits: 30,
    coachNote: 'severe-pain-appropriate',
  },

  {
    id: 'active-recovery-walk',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Active Recovery Walk',
    youtube: 'active recovery walk technique',
    category: 'recovery',
    doors: ['moving'], feelings: [], style: 'exercise',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 1800,
    perSide: false,
    instructions: [
      'Walk at a genuinely easy pace for 30 minutes',
      'This is not exercise — it is recovery',
      'The pace should be conversational and comfortable',
      'Ideally outdoors in a natural environment',
      'Leave your phone in your pocket or at home if possible'
    ],
    coaching: 'Many people find an easy walk the day after hard training leaves them less stiff than complete rest.',
    why: 'Gentle walking keeps blood moving and the legs ticking over without adding training load.',
        watchOut: [
      'Bouncing into the stretch rather than holding it still',
      'Pushing to the point of pain; a stretch should feel like a strong pull, never sharp',
      'Holding your breath, which makes everything tighter',
      'Forcing the range on one side to match the other; sides are rarely equal'
    ],
    load: 'Bodyweight. Progress by holding longer, not by pushing harder.',
    credits: 20
  },

  {
    id: 'sleep-position-optimisation',
    position: 'any',
    impact: false,
    balanceDemand: false,
    name: 'Sleep Position Optimisation',
    youtube: 'sleep position optimisation technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['spine', 'shoulder', 'hip'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Side sleeping: place a pillow between the knees to align the hips — reduces lower back stress',
      'Back sleeping: place a small pillow under the knees — reduces lumbar extension',
      'Stomach sleeping: place a pillow under the pelvis — reduces lumbar compression (though side or back is preferred)',
      'Neck: the pillow should keep the spine neutral — not pushed up or dropping down',
      'Assess your sleeping position after waking — morning pain indicates alignment issues'
    ],
    coaching: 'A pillow under or between the knees, or a different pillow height, costs nothing to try.',
    why: 'Many people find that how they lie in bed makes a difference to how their back and neck feel in the morning.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 15
  },

  {
    id: 'meditation-sleep-onset',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Sleep Onset Meditation',
    youtube: 'sleep onset meditation technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'In bed, lying on your back, close your eyes',
      'Take 10 very slow breaths — exhale twice as long as inhale',
      'Starting at the feet, consciously relax each body part upward',
      'Let the feet sink heavy into the mattress, then the calves, then the thighs',
      'Allow each area to become warm and heavy',
      'By the time you reach the face, sleep often arrives naturally',
      'If still awake, begin again from the feet'
    ],
    coaching: 'If you are still awake after 20 minutes, get up and do a quiet activity until you feel sleepy — the research on this is clear. Lying awake anxiously trains the brain that bed is a place for wakefulness.',
    why: 'Relaxing each part of the body in turn eases physical tension, and many people find it helps them drift off.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 20
  },

  {
    id: 'sauna-protocol',
    position: 'any',
    impact: false,
    balanceDemand: false,
    name: 'Sauna Recovery Protocol',
    youtube: 'sauna recovery protocol technique',
    category: 'recovery',
    doors: [], feelings: [], style: 'gentle',   // Stage PATH P-2
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: ['sauna'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'cardiovascular'],
    contraindications: ['cardiovascular-condition'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 1200,
    perSide: false,
    instructions: [
      'Enter a sauna at 80 to 100 degrees Celsius',
      'Stay for 15 to 20 minutes — hydrate before entering',
      'Exit and cool down for 10 minutes in cool or cold air',
      'Optional: cold plunge for 1 to 2 minutes between sauna sessions',
      'Repeat 2 to 3 times',
      'Drink 500ml water during and after',
      'Do not use immediately after hard training — allow 30 to 60 minutes'
    ],
    coaching: 'Sauna exposure should feel challenging but safe. Any dizziness, nausea, or excessive discomfort means exit immediately.',
    why: 'Regular sauna use warms the muscles and raises the heart rate gently. Many people find it helps them unwind after training.',
        watchOut: [
      'Forcing the breath rather than letting it lengthen naturally',
      'Lifting the shoulders on the in-breath instead of expanding the ribs',
      'Continuing if you feel light-headed; return to normal breathing and rest'
    ],
    load: 'No load. If any pattern feels uncomfortable, return to your natural breath.',
    credits: 30
  }

];
