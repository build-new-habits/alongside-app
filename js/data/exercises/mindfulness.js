/**
 * data/exercises/mindfulness.js
 * 10 Aug 2026 v1
 *
 * v1 — First version header on this file. Added tailored YouTube search
 *   terms to all 20 exercises (previously zero coverage, database-wide
 *   461-exercise pass, Graeme's direct request: "we get the most up to
 *   date versions and avoid any issue with discontinued or old videos"
 *   — search terms, not direct links, matching the reasoning exactly).
 *
 * Mindfulness practices — meditation, body scan, grounding, visualisation
 * contentType: 'practice' throughout — duration-based, no reps
 * energyRequired: 1–2 for all items
 * Surfaced by coach contextually, and in Recovery Mode when burnout detected
 *
 * Batch 10: Meditation and grounding (10 items)
 */

export const MINDFULNESS = [

  // ============================================
  // MEDITATION — Batch 10
  // ============================================

  {
    id: 'breath-awareness-meditation',
    name: 'Breath Awareness Meditation',
    youtube: 'breath awareness meditation guided meditation',
    category: 'mindfulness',
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
      'Sit comfortably — on a chair, cushion, or the floor',
      'Close your eyes or soften your gaze downward',
      'Bring your attention to your breath — just noticing it, not controlling it',
      'Notice the sensation of air entering and leaving',
      'When your mind wanders — and it will — gently return attention to the breath',
      'Continue for 5 minutes'
    ],
    coaching: 'The mind wandering is not failure. Noticing it has wandered and returning is the practice. You can do this thousands of times in one session.',
    why: 'The foundation of mindfulness practice. Trains the attention to return to the present moment — the core skill that reduces anxiety and improves focus.',
    credits: 20
  },

  {
    id: 'body-scan-short',
    name: 'Body Scan — Short',
    youtube: 'body scan - short guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Lie on your back or sit comfortably, eyes closed',
      'Bring attention to the top of your head — just notice any sensation there',
      'Slowly move attention down: face, jaw, neck, shoulders',
      'Continue down through the arms, chest, belly, lower back',
      'Move through the hips, thighs, knees, calves, feet',
      'Notice whatever is there — tension, warmth, numbness, nothing — without trying to change it',
      'Take 10 minutes to move from head to feet'
    ],
    coaching: 'You are not trying to relax — you are just noticing. Relaxation often follows, but it is not the goal. Just observe.',
    why: 'Body scanning builds interoception — awareness of internal body states. Reduces dissociation, improves stress response, and helps identify where tension accumulates.',
    credits: 20
  },

  {
    id: 'loving-kindness-short',
    name: 'Loving-Kindness — Short',
    youtube: 'loving-kindness - short guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'visualisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Sit comfortably with eyes closed',
      'Bring to mind a person or being you find it easy to feel warmth toward',
      'Silently repeat: "May you be happy. May you be healthy. May you be safe."',
      'After 2 minutes, turn the same wishes toward yourself: "May I be happy..."',
      'After 2 minutes, extend to someone neutral — a neighbour, a stranger',
      'After 2 minutes, rest in the feeling that has been cultivated'
    ],
    coaching: 'Directing kindness toward yourself is the hardest part for most people. Do it anyway. Even if it feels hollow at first, it works over time.',
    why: 'Loving-kindness meditation reduces self-criticism, increases compassion, and reduces symptoms of depression and anxiety — well supported by clinical research.',
    credits: 20
  },

  {
    id: 'five-four-three-two-one-grounding',
    name: '5-4-3-2-1 Grounding',
    youtube: '5-4-3-2-1 grounding guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 180,
    perSide: false,
    instructions: [
      'Look around and name 5 things you can see',
      'Notice 4 things you can physically feel — the chair beneath you, air on skin',
      'Listen for 3 things you can hear',
      'Notice 2 things you can smell',
      'Notice 1 thing you can taste',
      'Take a slow breath and notice how you feel now compared to when you started'
    ],
    coaching: 'This takes about 3 minutes and works quickly. Use it when anxiety spikes, when overwhelmed, or when you cannot settle before sleep.',
    why: 'Grounds attention in the present sensory moment — directly interrupts anxiety and rumination by engaging the senses rather than thoughts.',
    credits: 20
  },

  {
    id: 'progressive-muscle-relaxation',
    name: 'Progressive Muscle Relaxation',
    youtube: 'progressive muscle relaxation guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 900,
    perSide: false,
    instructions: [
      'Lie on your back, eyes closed',
      'Starting with your feet: tense the muscles as hard as you can for 5 seconds',
      'Release completely and notice the difference for 10 seconds',
      'Move up to your calves — tense for 5 seconds, release, notice',
      'Continue up through thighs, glutes, belly, fists, arms, shoulders, face',
      'After the face, rest in the whole-body relaxation for 2 minutes'
    ],
    coaching: 'The contrast between tension and release is what trains the nervous system. You are teaching your body what relaxed actually feels like.',
    why: 'PMR is one of the most clinically validated techniques for anxiety, insomnia, and chronic pain. Effective within a single session and builds with practice.',
    credits: 20
  },

  {
    id: 'open-awareness-meditation',
    name: 'Open Awareness Meditation',
    youtube: 'open awareness meditation guided meditation',
    category: 'mindfulness',
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
      'Sit comfortably with eyes gently open or closed',
      'Instead of focusing on the breath, let your attention be open — resting on whatever arises',
      'Sounds, sensations, thoughts — let them come and go without latching onto any of them',
      'If you get pulled into a thought, gently release it and return to open, spacious awareness',
      'Continue for 10 minutes'
    ],
    coaching: 'This is harder than breath focus for most beginners. If the mind is very active, return to breath awareness first.',
    why: 'Open monitoring meditation builds metacognitive awareness — the ability to observe thoughts without being swept up in them. Reduces rumination.',
    credits: 20
  },

  {
    id: 'safe-place-visualisation',
    name: 'Safe Place Visualisation',
    youtube: 'safe place visualisation guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'visualisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Sit or lie comfortably, eyes closed',
      'Bring to mind a place — real or imagined — where you feel completely safe and at ease',
      'Build the detail: what do you see, hear, smell, feel in this place?',
      'Notice the feeling in your body when you are here',
      'Spend 10 minutes exploring and resting in this place',
      'When you return, carry the feeling with you for a moment before opening your eyes'
    ],
    coaching: 'The place can be completely imaginary. It just needs to feel safe to you. There is no wrong answer.',
    why: 'A foundational technique in trauma-informed therapy. Creates a reliable internal resource for self-regulation — particularly useful for anxiety and hyperarousal.',
    credits: 20
  },

  {
    id: 'noting-practice',
    name: 'Noting Practice',
    youtube: 'noting practice guided practice',
    category: 'mindfulness',
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
      'Sit comfortably, eyes closed',
      'Rest attention on the breath',
      'When something else arises — a thought, sound, sensation, emotion — briefly name it: "thinking", "sound", "feeling"',
      'After naming it, return to the breath',
      'Keep the labels simple and non-judgmental — just a quiet internal word',
      'Continue for 10 minutes'
    ],
    coaching: 'Noting creates a tiny gap between experience and reaction. That gap is where freedom lives. The labels help the mind process rather than ruminate.',
    why: 'Noting practice is particularly effective for anxiety and ADHD — it gives the busy mind a job while training present-moment awareness.',
    credits: 20
  },

  {
    id: 'feet-on-floor-grounding',
    name: 'Feet on Floor Grounding',
    youtube: 'feet on floor grounding guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Sit in a chair with both feet flat on the floor',
      'Press your feet gently into the floor — feel the pressure and contact',
      'Notice the specific sensations: the texture of the floor, the weight of your legs',
      'Follow the sensation of groundedness up through your legs, hips, and spine',
      'Rest in the feeling of being supported and connected to the earth',
      'Continue for 2 minutes'
    ],
    coaching: 'This works in meetings, on public transport, or wherever you are. Nobody needs to know you are doing it.',
    why: 'A brief, discreet grounding technique for moments of acute anxiety or dissociation. Works quickly and requires no preparation.',
    credits: 15
  },

  {
    id: 'mindful-observation',
    name: 'Mindful Object Observation',
    youtube: 'mindful object observation guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Pick up any object within reach — a pen, a cup, a stone',
      'Hold it and look at it as if you have never seen it before',
      'Notice its colour, texture, weight, temperature, shape, imperfections',
      'When your mind wanders, return to exploring the object',
      'Continue for 5 minutes with this one object'
    ],
    coaching: 'The exercise is deliberately simple — the simplicity is the point. Ordinary objects become extraordinary when you actually look.',
    why: 'Trains focused present-moment awareness using a concrete anchor. Useful for people who find eyes-closed meditation difficult or anxiety-provoking.',
    credits: 15
  }


  ,

  // ============================================
  // SLEEP PREPARATION & EXTENDED PRACTICES — Batch 12
  // Long-form body scan, sleep prep, extended visualisation
  // ============================================

  {
    id: 'sleep-body-scan',
    name: 'Sleep Body Scan',
    youtube: 'sleep body scan guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 1200,
    perSide: false,
    instructions: [
      'Lie in bed in your sleeping position',
      'Close your eyes and take 3 slow breaths',
      'Bring attention to your feet — not to relax them, just to notice them',
      'Allow your feet to feel heavy and warm',
      'Slowly move attention upward: calves, knees, thighs, hips',
      'Continue through the belly, chest, hands, arms, shoulders, neck, face',
      'At each area, allow heaviness and warmth — let the body sink into the bed',
      'If you reach the top without falling asleep, start again from the feet'
    ],
    coaching: 'If you fall asleep before finishing, that is success. Most people do not reach the top more than once.',
    why: 'The body scan activates the parasympathetic nervous system and reduces the cortisol associated with pre-sleep rumination. Clinically used for insomnia.',
    credits: 20
  },

  {
    id: 'military-sleep-method',
    name: 'Progressive Relaxation for Sleep',
    youtube: 'progressive relaxation for sleep guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Lie on your back in a comfortable position',
      'Relax your face completely — jaw, tongue, eyes, forehead — let everything go',
      'Drop your shoulders as low as they will go, then relax your arms one at a time',
      'Breathe out and relax your chest',
      'Relax your legs from thighs down to feet',
      'Now hold your mind still for 10 seconds — if thoughts come, picture a calm scene',
      'Repeat until sleep comes'
    ],
    coaching: 'This takes practice. Most people who master it report being able to sleep within 2 minutes after a few weeks of daily practice.',
    why: 'A systematic relaxation technique that removes physical and mental tension in sequence. Effective for both falling asleep and returning to sleep after waking.',
    credits: 20
  },

  {
    id: 'worry-time-practice',
    name: 'Worry Time Practice',
    youtube: 'worry time practice guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Sit comfortably with a notebook if you have one',
      'Set a timer for 10 minutes',
      'Give yourself full permission to worry — write down every concern, fear, or anxious thought',
      'Do not try to solve anything — just list them',
      'When the timer goes, close the notebook',
      'For the rest of the day, when worried thoughts arise, remind yourself: they are already written down, they have their time'
    ],
    coaching: 'This feels counterintuitive. But containing worry to a specific time actually reduces it — the brain relaxes when it knows worries will not be forgotten.',
    why: 'Scheduled worry time is a CBT technique shown to reduce generalised anxiety and improve sleep. It externalises the worry and gives the mind permission to rest at other times.',
    credits: 20
  },

  {
    id: 'mindful-walking',
    name: 'Mindful Walking',
    youtube: 'mindful walking guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Begin walking at a natural, comfortable pace',
      'Bring full attention to the physical sensation of walking',
      'Notice the contact of each foot with the floor, the shifting of weight, the swing of the arms',
      'When your mind wanders to thoughts, gently return it to the sensations of walking',
      'You can do this indoors in a small space or outdoors',
      'Continue for 10 minutes'
    ],
    coaching: 'Mindful walking is a great alternative for people who struggle with seated meditation. The movement gives the mind something concrete to anchor to.',
    why: 'Combines the physical benefits of movement with the mental benefits of mindfulness. Particularly effective for restless minds or people with ADHD.',
    credits: 20
  },

  {
    id: 'compassionate-self-talk',
    name: 'Compassionate Self-Talk',
    youtube: 'compassionate self-talk guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'visualisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit quietly and bring to mind something you are struggling with — a difficulty, a mistake, a fear',
      'Notice what you say to yourself about it — often it is harsh',
      'Now ask: what would I say to a close friend who was experiencing exactly this?',
      'Say those words to yourself — either silently or aloud',
      'Place one hand on your chest and notice what shifts',
      'Stay with this for 5 minutes'
    ],
    coaching: 'Self-compassion is not self-indulgence or giving up. Research consistently shows it produces better outcomes than self-criticism — more motivation, more resilience, less burnout.',
    why: 'Self-compassion practice reduces shame, anxiety, and depression while increasing motivation. Based on the work of Dr Kristin Neff. Particularly relevant for neurodivergent adults.',
    credits: 20
  },

  {
    id: 'nature-visualisation',
    name: 'Nature Visualisation',
    youtube: 'nature visualisation guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'visualisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Sit or lie comfortably, eyes closed',
      'Bring to mind a natural setting — a forest, a beach, a mountain, a garden',
      'Build the scene with all senses: what do you see, hear, smell, feel underfoot',
      'Walk through this place slowly in your imagination',
      'Notice the quality of light, the sounds, the temperature',
      'Spend 10 minutes exploring',
      'Return gradually, bringing the calm feeling back with you'
    ],
    coaching: 'Nature visualisation works even without real access to nature. The physiological effects — reduced cortisol, lowered heart rate — are measurable even from imagination alone.',
    why: 'Exposure to natural environments reduces stress hormones and improves mood. When real nature is inaccessible, visualisation produces similar measurable effects.',
    credits: 20
  },

  {
    id: 'morning-intention',
    name: 'Morning Intention Setting',
    youtube: 'morning intention setting guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Before checking your phone or starting the day, sit quietly for 5 minutes',
      'Take 3 slow breaths',
      'Ask yourself: what matters to me today?',
      'Set one intention — not a task or a goal, but a quality of attention: be patient, be present, be curious',
      'Hold the intention in mind for a moment',
      'Begin the day from this place'
    ],
    coaching: 'An intention is different to a to-do list. It is about how you want to show up, not what you want to achieve. It takes less than 5 minutes.',
    why: 'Morning intention setting activates the prefrontal cortex before reactive systems take over. Reduces autopilot behaviour and increases sense of agency throughout the day.',
    credits: 15
  },

  {
    id: 'gratitude-reflection',
    name: 'Gratitude Reflection',
    youtube: 'gratitude reflection guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit quietly, preferably at the end of the day',
      'Bring to mind 3 specific things that happened today that you are grateful for',
      'Be specific — not "my health" but "the warmth of the shower this morning"',
      'For each one, spend a moment actually feeling the appreciation, not just listing it',
      'Notice any resistance — that is normal. Stay with the feeling anyway'
    ],
    coaching: 'The specificity matters. Generic gratitude skims the surface. Specific, sensory details help the brain register the experience as genuinely positive.',
    why: 'Gratitude practice reliably improves sleep quality, reduces symptoms of depression, and increases life satisfaction. Most effective when done consistently over time.',
    credits: 15
  },

  {
    id: 'box-breathing-extended',
    name: 'Box Breathing — Extended Practice',
    youtube: 'box breathing - extended practice guided practice',
    category: 'mindfulness',
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
      'Sit with your spine tall and eyes closed',
      'Begin with a 4-4-4-4 count — in, hold, out, hold',
      'After 5 minutes, increase to 5-5-5-5 if comfortable',
      'Keep the breath smooth and even throughout each count',
      'If the mind wanders, return to counting',
      'Continue for 10 minutes total'
    ],
    coaching: 'The extended version deepens the calming effect. Used by emergency services and military for acute stress regulation. The hold phases are where the nervous system resets.',
    why: 'Extended box breathing reduces cortisol, lowers blood pressure, and improves heart rate variability — all measurable markers of stress reduction. More effective than a shorter session.',
    credits: 20
  },

  {
    id: 'digital-detox-transition',
    name: 'Screen-to-Calm Transition',
    youtube: 'screen-to-calm transition guided practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 180,
    perSide: false,
    instructions: [
      'After finishing work or a long period of screen time, stop completely',
      'Place your device face down or in another room',
      'Sit or stand and look at something in the real environment for 3 minutes — out of a window, at a plant, at a candle',
      'Breathe slowly and let the visual field soften — you are not looking for anything, just resting the eyes',
      'Notice any urges to check your phone — acknowledge them without acting',
      'After 3 minutes, notice the difference in your body'
    ],
    coaching: 'This feels difficult at first precisely because of how over-stimulated the nervous system has become. That difficulty is the signal that it is needed.',
    why: 'Screen time activates the sympathetic nervous system. This transition practice allows the nervous system to downregulate before the next activity — improving focus, mood, and sleep if done before bed.',
    credits: 15
  }

];
