/**
 * data/exercises/mindfulness.js
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
    category: 'mindfulness',
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'visualisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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
    category: 'mindfulness',
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'visualisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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
    category: 'mindfulness',
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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

];
