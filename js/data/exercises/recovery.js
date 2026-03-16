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
    why: 'Gives the mind a simple anchor. Particularly useful for anxiety, racing thoughts, or difficulty settling before sleep.',
    credits: 20
  }


  ,

  // ============================================
  // RECOVERY EXPANSION — Final batch (12 items)
  // ============================================

  {
    id: 'cold-shower-protocol',
    name: 'Cold Shower — Recovery Protocol',
    category: 'recovery',
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
    coaching: 'The breathing is the practice. The cold is just the trigger. Controlling the breath under cold stress trains the nervous system to regulate under other forms of stress too.',
    why: 'Cold water immersion activates the sympathetic system and then the parasympathetic rebound. Regular practice builds cold tolerance, reduces muscle soreness, and improves mood via norepinephrine release.',
    credits: 20
  },

  {
    id: 'contrast-therapy',
    name: 'Contrast Therapy',
    category: 'recovery',
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
    coaching: 'The alternating temperatures create a pumping effect on circulation — hot dilates blood vessels, cold constricts them. This mechanical action clears metabolic waste from muscle tissue.',
    why: 'Contrast therapy accelerates recovery by increasing tissue blood flow via vascular oscillation. Used by professional teams post-match to reduce delayed onset muscle soreness.',
    credits: 25
  },

  {
    id: 'napping-protocol',
    name: 'Recovery Nap Protocol',
    category: 'recovery',
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
    coaching: 'A 20-minute nap does not cause sleep inertia. A 30-minute nap often does. Keep it short — the science on this is clear.',
    why: 'A 20-minute nap improves alertness, reaction time, and mood for 2 to 3 hours. Used deliberately by elite athletes and military. NASA studies show 26 minutes as optimal.',
    credits: 20
  },

  {
    id: 'hydration-protocol',
    name: 'Hydration Protocol',
    category: 'recovery',
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
    coaching: 'Even mild dehydration of 2% body weight reduces performance by up to 20%. Most people train and compete dehydrated without knowing it.',
    why: 'Adequate hydration is one of the highest-return recovery and performance interventions available. The evidence base is unambiguous and the application is straightforward.',
    credits: 15
  },

  {
    id: 'nutrition-timing',
    name: 'Post-Exercise Nutrition Window',
    category: 'recovery',
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
    credits: 15
  },

  {
    id: 'trigger-point-release-ball',
    name: 'Trigger Point Release — Ball',
    category: 'recovery',
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
    coaching: 'The pressure should produce a "good pain" — uncomfortable but clearly beneficial. Avoid directly on bones or joints.',
    why: 'Trigger point therapy releases myofascial adhesions that restrict movement and cause referred pain. A ball allows deeper pressure and more precision than a foam roller.',
    credits: 25
  },

  {
    id: 'elevation-recovery',
    name: 'Leg Elevation Recovery',
    category: 'recovery',
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
    coaching: 'Legs up the wall is one of the simplest and most effective recovery positions. It works purely through gravity and requires nothing.',
    why: 'Elevating the legs above the heart reverses the pooling of blood and lymphatic fluid that accumulates from standing and training. Reduces swelling and accelerates clearance of metabolic waste.',
    credits: 15
  },


  {
    id: 'mindful-walk',
    name: 'Mindful Walk',
    category: 'recovery',
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
      'No distance, no time target — 10 minutes is enough',
      'Let your eyes move: notice three things you can see',
      'Notice the ground beneath your feet with each step',
      'If pain increases, slow down or stop — this is not pushing through',
      'Pause whenever you want. Look around. Breathe.',
      'Return home before you feel tired — not after'
    ],
    coaching: 'This is not exercise. It is movement as medicine — gentle circulation, fresh air, and a reminder that your body still works, even on hard days. The goal is simply to have gone.',
    why: 'Gentle walking maintains circulation and joint mobility without loading the structures that are hurting. The mindfulness element activates the parasympathetic nervous system, which supports the body natural repair processes.',
    credits: 30,
    coachNote: 'severe-pain-appropriate',
  },

  {
    id: 'active-recovery-walk',
    name: 'Active Recovery Walk',
    category: 'recovery',
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
    coaching: 'An active recovery walk the day after hard training reduces soreness more effectively than complete rest — the gentle movement promotes circulation without adding stress.',
    why: 'Active recovery increases blood flow to muscle tissue, accelerating the removal of metabolic by-products. The gentle locomotion also maintains movement patterns without adding training load.',
    credits: 20
  },

  {
    id: 'sleep-position-optimisation',
    name: 'Sleep Position Optimisation',
    category: 'recovery',
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
    coaching: 'Many chronic back and neck problems are significantly influenced by sleeping position. This is a free intervention with potentially major impact.',
    why: 'Spinal alignment during 7 to 9 hours of sleep significantly influences musculoskeletal health. Poor sleep position creates cumulative joint stress that compounds over years.',
    credits: 15
  },

  {
    id: 'meditation-sleep-onset',
    name: 'Sleep Onset Meditation',
    category: 'recovery',
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
    why: 'The progressive relaxation approach to sleep onset reduces sleep latency (time to fall asleep) by activating the parasympathetic system and reducing physical tension that prevents sleep.',
    credits: 20
  },

  {
    id: 'breathing-478',
    name: '4-7-8 Breathing',
    category: 'recovery',
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
      'Sit or lie comfortably',
      'Exhale completely through the mouth',
      'Close the mouth and inhale through the nose for 4 counts',
      'Hold the breath for 7 counts',
      'Exhale completely through the mouth for 8 counts',
      'This is one cycle — repeat 4 times',
      'Practice twice daily for best results'
    ],
    coaching: 'The extended breath hold may feel uncomfortable at first. Reduce the counts proportionally if needed — the 1:1.75:2 ratio is what matters, not the absolute numbers.',
    why: 'Developed by Dr Andrew Weil, 4-7-8 breathing produces rapid parasympathetic activation through the prolonged exhale and breath hold. Demonstrated to reduce anxiety and aid sleep onset.',
    credits: 20
  },

  {
    id: 'sauna-protocol',
    name: 'Sauna Recovery Protocol',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
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
    why: "Regular sauna use has strong evidence for cardiovascular health, growth hormone release, heat shock protein production, and mood improvement. Dr Rhonda Patrick's research is particularly comprehensive on this.",
    credits: 30
  }

];
