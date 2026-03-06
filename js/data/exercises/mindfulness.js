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


  ,

  // ============================================
  // SLEEP PREPARATION & EXTENDED PRACTICES — Batch 12
  // Long-form body scan, sleep prep, extended visualisation
  // ============================================

  {
    id: 'sleep-body-scan',
    name: 'Sleep Body Scan',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 2,
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
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'visualisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
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


  ,

  // ============================================
  // MINDFULNESS EXPANSION — Batch 19 (20 items)
  // Movement-based, somatic, extended practices
  // ============================================

  {
    id: 'somatic-shaking',
    name: 'Somatic Shaking',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 2,
    duration: 300,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart, knees slightly bent',
      'Begin to bounce gently — let the knees flex and extend in a small rhythm',
      'Allow the shaking to travel up through the body — hips, belly, chest, shoulders',
      'Gradually let the shaking become more involuntary — less controlled',
      'Stay with it for 3 to 5 minutes',
      'Stop and stand still — notice what has changed in the body'
    ],
    coaching: 'Animals shake naturally after threat or stress to discharge nervous system activation. Humans have learned to suppress this. Let it happen.',
    why: 'Trauma-informed somatic practice used to discharge stored tension and nervous system activation. Developed by Dr Peter Levine and used in trauma therapy worldwide.',
    credits: 20
  },

  {
    id: 'tapping-eft',
    name: 'EFT Tapping — Basic Sequence',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Name what you are feeling — a worry, a tension, a frustration',
      'Rate its intensity from 0 to 10',
      'Tap firmly with two fingers on each point in sequence: top of head, eyebrow, side of eye, under eye, under nose, chin, collarbone, under arm',
      'While tapping each point, repeat a simple phrase about what you are feeling',
      'Complete 3 full rounds of the sequence',
      'Re-rate the intensity — note what has shifted'
    ],
    coaching: 'EFT looks unusual. Do it anyway — the evidence base is strong and it works for many people who do not expect it to.',
    why: 'Emotional Freedom Technique uses acupressure points combined with cognitive processing to reduce anxiety and stress. Evidence base growing across multiple studies.',
    credits: 20
  },

  {
    id: 'cold-water-mindfulness',
    name: 'Cold Water Face Immersion',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Fill a bowl or sink with cold water — as cold as possible, ice if available',
      'Take a breath and submerge your face for 15 to 30 seconds',
      'Keep your eyes closed and remain as still as possible',
      'Remove your face and breathe normally',
      'Notice the shift in your nervous system state',
      'Repeat 2 to 3 times if you want to deepen the effect'
    ],
    coaching: 'The diving reflex is one of the most powerful parasympathetic activators available. It overrides even acute anxiety within seconds.',
    why: 'Cold water face immersion activates the mammalian diving reflex — a rapid parasympathetic response that slows heart rate by up to 25%. Used clinically for panic and acute distress.',
    credits: 15
  },

  {
    id: 'humming-vagus-nerve',
    name: 'Humming — Vagus Nerve Activation',
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
      'Sit comfortably with eyes closed',
      'Take a full breath in through the nose',
      'On the exhale, hum continuously until the breath is gone',
      'Feel the vibration in the chest and throat',
      'Take the next breath in slowly and hum again',
      'Continue for 5 minutes'
    ],
    coaching: 'The specific pitch of the hum does not matter. What matters is the vibration — low, resonant humming is most effective.',
    why: 'Humming stimulates the vagus nerve directly through the vibration of the larynx, activating the parasympathetic system and reducing stress and inflammation.',
    credits: 20
  },

  {
    id: 'mindful-eating',
    name: 'Mindful Eating Practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Choose one item of food — a single piece of fruit, a square of chocolate, whatever is at hand',
      'Before eating, look at it for 30 seconds — notice colour, texture, shape',
      'Smell it for 30 seconds',
      'Take one very small bite and hold it in your mouth for 10 seconds before chewing',
      'Eat the rest slowly — putting it down between bites',
      'Notice all sensations: taste, texture, temperature, the moment of swallowing'
    ],
    coaching: 'This is not about food restriction or control — it is about presence. Even a single mindful meal per week changes the relationship with eating.',
    why: 'Mindful eating slows consumption, improves satiety signalling, and reduces emotional eating. Particularly relevant for people whose eating is driven by stress or habit.',
    credits: 20
  },

  {
    id: 'heartmath-coherence',
    name: 'Heart Coherence Breathing',
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
      'Sit comfortably, one hand on the chest',
      'Breathe in slowly for 5 counts through the nose, feeling the chest rise',
      'Breathe out slowly for 5 counts through the mouth',
      'While breathing, focus attention on the area around the heart',
      'Bring to mind a genuine feeling of appreciation or care for someone or something',
      'Hold that feeling while continuing the 5-5 breathing pattern',
      'Continue for 10 minutes'
    ],
    coaching: 'The combination of rhythmic breathing and positive emotion is what creates coherence — not just the breathing alone.',
    why: 'Heart coherence, developed by the HeartMath Institute, synchronises heart rate variability with breathing. Reduces cortisol, improves cognitive function, and builds emotional resilience.',
    credits: 20
  },

  {
    id: 'mindful-stretching',
    name: 'Mindful Stretching',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system', 'full-body'],
    contraindications: [],
    energyRequired: 2,
    duration: 900,
    perSide: false,
    instructions: [
      'Begin in any comfortable position and take 5 slow breaths',
      'Let your body guide you to whatever stretch it most wants — not a prescribed sequence',
      'Move into the stretch slowly, noticing sensation rather than pursuing range',
      'Breathe into tight areas — on each exhale, allow a little more release',
      'Stay in each position for 5 to 10 breaths',
      'Let the body lead the sequence for 15 minutes — no plan required'
    ],
    coaching: 'This is the opposite of a structured flexibility session. The body usually knows what it needs — learning to listen to it is the practice.',
    why: 'Mindful movement reconnects attention to physical sensation, reduces stress, and builds interoceptive awareness. Differs from standard stretching in its intentional quality of attention.',
    credits: 30
  },

  {
    id: 'sound-bath-self',
    name: 'Self-Guided Sound Awareness',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Sit or lie comfortably in whatever environment you are in',
      'Close your eyes and simply listen to all the sounds around you',
      'Distant sounds, nearby sounds, sounds inside the building',
      'Do not label or judge the sounds — just hear them',
      'When the mind wanders to thoughts, return to pure listening',
      'Continue for 10 minutes'
    ],
    coaching: 'Most people find this easier than breath-focused meditation because the sounds provide a continuous, changing anchor for attention.',
    why: 'Sound awareness meditation activates the default mode network less than thought-based practices, making it particularly accessible for people with busy minds.',
    credits: 20
  },

  {
    id: 'yoga-nidra-short',
    name: 'Yoga Nidra — Short',
    category: 'recovery',
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
      'Lie on your back in savasana — completely comfortable, eyes closed',
      'Set an intention for the practice — a single word or short phrase',
      'Rotate attention rapidly through the body: right thumb, index finger, middle finger, ring finger, little finger, back of hand, palm, wrist, forearm, elbow, upper arm, shoulder, armpit, right side of chest, right side of waist, right hip, right thigh, kneecap, calf, ankle, heel, sole, right big toe — continuing through the left side, then the back, face, and head',
      'Move as quickly as possible — a few seconds per body part',
      'When complete, rest in awareness for 3 minutes',
      'Return the intention to mind before opening eyes'
    ],
    coaching: 'Yoga Nidra is sometimes called yogic sleep — the goal is the hypnagogic state between waking and sleeping. If you fall asleep, that is fine.',
    why: 'Yoga Nidra produces a state of deep relaxation with maintained awareness. 30 minutes is said to equal 3 to 4 hours of sleep in restorative effect. Strong evidence for PTSD and insomnia.',
    credits: 25
  },

  {
    id: 'values-reflection',
    name: 'Values Reflection',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Find a quiet moment and ask yourself: what matters most to me?',
      'Let 3 to 5 values come to mind — honesty, connection, creativity, health, freedom',
      'For each value, ask: am I living in line with this value right now?',
      'Notice where there is alignment — and where there is a gap',
      'Choose one small action this week that would close one gap',
      'Sit with the reflection for a moment before returning to your day'
    ],
    coaching: 'Values clarification is not about guilt — it is about direction. The gap between values and behaviour is information, not failure.',
    why: 'Values-based living is the core of Acceptance and Commitment Therapy (ACT). Regular values reflection reduces psychological inflexibility and increases life satisfaction.',
    credits: 20
  },

  {
    id: 'acceptance-practice',
    name: 'Acceptance Practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Bring to mind something currently difficult — an emotion, a situation, a physical sensation',
      'Notice where you feel it in the body — tightness, weight, heat',
      'Instead of trying to change or remove it, say internally: "I notice that I am feeling..."',
      'Then: "And I allow this feeling to be here for now"',
      'Breathe into it — not to make it go away, but to give it room',
      'Stay with this for 10 minutes, returning to the phrase when resistance arises'
    ],
    coaching: 'Acceptance is not liking or wanting the experience — it is simply stopping the fight with it. Paradoxically, what we stop fighting often loses its grip.',
    why: 'Acceptance of difficult experiences (rather than suppression or avoidance) is the primary mechanism of change in ACT therapy. Reduces suffering without requiring the difficulty to disappear.',
    credits: 20
  },

  {
    id: 'defusion-practice',
    name: 'Cognitive Defusion Practice',
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
      'Identify a thought that has been troubling you — a worry, a self-criticism, a fear',
      'Notice it as a thought: "I am having the thought that..."',
      'Then distance further: "I notice that my mind is telling me..."',
      'Imagine the thought on a leaf floating down a stream, or on a billboard passing from view',
      'You do not have to believe or act on every thought your mind produces',
      'Stay with this for 5 minutes'
    ],
    coaching: 'Defusion does not make thoughts go away — it changes your relationship to them. You become the observer of the thought, not the thinker lost inside it.',
    why: 'Cognitive defusion is an ACT technique that reduces the literal believability of thoughts — particularly useful for self-critical thinking, anxiety, and rumination.',
    credits: 20
  },

  {
    id: 'emotion-regulation-surf',
    name: 'Urge Surfing',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Notice an urge — to eat, to check your phone, to avoid something, to react',
      'Instead of acting on it, pause and observe it',
      'Notice where it is in the body — chest tightness, restlessness, an itch',
      'Track it like a wave: it builds, it peaks, it subsides',
      'Watch it without acting on it for 5 minutes — notice it diminish',
      'Then choose consciously whether to act or not'
    ],
    coaching: 'Every urge peaks within 20 minutes and then decreases. Urge surfing builds the evidence that impulses can be observed without being obeyed.',
    why: 'Urge surfing, developed by Dr Alan Marlatt, is used in addiction recovery and impulse management. Builds the pause between stimulus and response — the space where choice lives.',
    credits: 20
  },

  {
    id: 'movement-meditation',
    name: 'Walking Meditation — Slow',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Find a space where you can walk 10 to 20 paces back and forth',
      'Walk at about half your normal pace',
      'Bring full attention to the physical sensations of walking: the lift of the foot, the movement through the air, the contact with the floor',
      'Feel the weight shift from foot to foot',
      'When the mind wanders, return to the sensation of the next step',
      'Continue for 10 minutes'
    ],
    coaching: 'Slow walking meditation is not about reaching anywhere. The turning at the end of each 20-pace section is done with equal mindful attention — notice the intention to turn, and the turning.',
    why: 'Formal walking meditation develops present-moment awareness in a moving context — particularly accessible for people who struggle with stillness or have high physical energy.',
    credits: 20
  },

  {
    id: 'tension-release-breath',
    name: 'Tension Release Breathing',
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
      'Lie on your back or sit comfortably',
      'Take a deep breath in and tense every muscle in your body simultaneously — hold for 5 seconds',
      'Release the breath and the tension simultaneously — completely',
      'Let the body feel the contrast — the release is the practice',
      'Rest for 10 seconds in complete softness',
      'Repeat 5 times'
    ],
    coaching: 'The whole-body tension is total — face, hands, feet, everything. The contrast between maximum tension and complete release trains the nervous system to recognise and produce relaxation.',
    why: 'An accelerated version of progressive muscle relaxation — the simultaneous whole-body release produces a more profound and immediate parasympathetic response.',
    credits: 20
  },

  {
    id: 'journalling-practice',
    name: 'Free Writing — Stream of Consciousness',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Find pen and paper or an open text document',
      'Set a timer for 10 minutes',
      'Write continuously — do not stop, do not edit, do not re-read',
      'Write whatever comes: thoughts, worries, sensations, memories, nonsense',
      'If you run out of things to write, write "I have nothing to write" until something comes',
      'When the timer ends, put it away — do not re-read immediately'
    ],
    coaching: 'The no-editing rule is the whole practice. The inner critic that normally controls output is bypassed by the speed and the permission to write anything.',
    why: 'Free writing (as developed by Julia Cameron and studied by Dr James Pennebaker) externalises internal noise, reduces rumination, and has measurable effects on immune function and wellbeing.',
    credits: 20
  },

  {
    id: 'compassion-break',
    name: 'Self-Compassion Break',
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
      'Pause in the middle of difficulty and say to yourself: "This is a moment of suffering"',
      'Then: "Suffering is part of being human — I am not alone in this"',
      'Then place a hand on your chest and say: "May I be kind to myself in this moment"',
      'Take three slow breaths',
      'Return to what you were doing'
    ],
    coaching: 'This 3-minute practice by Dr Kristin Neff is one of the most researched mindfulness interventions for self-compassion. Do it when things feel hard, not just when you have planned time.',
    why: 'The self-compassion break activates the care-giving system in the brain — reducing threat activation and increasing the felt sense of safety and worthiness.',
    credits: 15
  },

  {
    id: 'breath-count-advanced',
    name: 'Breath Counting — Advanced',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 1200,
    perSide: false,
    instructions: [
      'Sit comfortably, eyes closed',
      'Count each exhale: 1, 2, 3... up to 10, then start again from 1',
      'If you lose count or reach 11, start again at 1 — without self-criticism',
      'Do not control the breath — just observe and count',
      'Continue for 20 minutes',
      'Notice how many times you lose count without judgment — just restart'
    ],
    coaching: 'Losing count is not failure — it is the data. Each time you notice you have lost count and start again, that is one repetition of the mindfulness muscle.',
    why: 'Breath counting is a more advanced practice than breath awareness — the counting provides a clear test of attentional stability. Used in Zen tradition and modern mindfulness research.',
    credits: 25
  },

  {
    id: 'anchoring-practice',
    name: 'Anchoring — Resource State',
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
      'Recall a time when you felt genuinely confident, calm, or resourceful',
      'Relive it in as much sensory detail as possible — what you saw, heard, felt',
      'As the feeling builds to its peak, create a physical anchor: press finger and thumb together',
      'Hold the anchor at the peak, then release',
      'Repeat 5 times, each time rebuilding the feeling before pressing the anchor',
      'Test the anchor: press finger and thumb together and notice what arises'
    ],
    coaching: 'Anchoring comes from NLP and is used by athletes and performers. It creates a physical trigger for a mental state. The more vivid the memory, the stronger the anchor.',
    why: 'Builds a reliable tool for accessing resourceful states on demand — useful before competitions, presentations, or any high-stakes situation.',
    credits: 20
  },

  {
    id: 'extended-body-scan',
    name: 'Extended Body Scan — 20 Minutes',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 1200,
    perSide: false,
    instructions: [
      'Lie on your back in a completely comfortable position',
      'Close your eyes and take 10 slow breaths to settle',
      'Begin at the toes of the right foot — spend 30 seconds just noticing every sensation there',
      'Move to the right sole, right heel, right ankle',
      'Continue up the right leg: calf, shin, knee, thigh, groin',
      'Move to the left leg in the same way',
      'Then pelvis, lower back, belly, chest, upper back, shoulders',
      'Arms: upper arm, elbow, forearm, wrist, hand, each finger',
      'Then neck, jaw, mouth, nose, eyes, forehead, crown of head',
      'Rest in whole-body awareness for 3 minutes'
    ],
    coaching: 'The extended body scan is a clinical MBSR (Mindfulness-Based Stress Reduction) practice. The longer duration allows deeper settling than the short version.',
    why: "The extended body scan is the central practice of MBSR — Jon Kabat-Zinn's clinically validated stress reduction programme. Reduces pain, anxiety, and cortisol with consistent practice.",
    credits: 25
  }


  ,

  // ============================================
  // MINDFULNESS — FINAL 20 ITEMS — Batch 23
  // Sleep hygiene, trauma-informed, creative, ADHD-specific
  // ============================================

  {
    id: 'sleep-hygiene-wind-down',
    name: 'Sleep Hygiene Wind-Down Routine',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 1800,
    perSide: false,
    instructions: [
      '90 minutes before bed: turn off overhead lights, switch to lamps',
      '60 minutes before: no screens — use this time for reading, light conversation, or gentle movement',
      '30 minutes before: write tomorrow\'s to-do list — brain dump everything',
      '20 minutes before: warm shower or bath if possible',
      '10 minutes before: light stretching or legs-up-wall',
      'In bed: use the sleep body scan or progressive relaxation if sleep does not come within 20 minutes'
    ],
    coaching: 'This is a system, not a single technique. Most sleep interventions fail because people try one thing in isolation. The routine works as a whole.',
    why: 'Sleep hygiene protocols backed by decades of sleep science. Consistent pre-sleep routines signal the brain to begin melatonin production and reduce cortisol.',
    credits: 25
  },

  {
    id: 'adhd-anchor-practice',
    name: 'ADHD Anchor Practice',
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
      'Notice you have drifted — from a task, from presence, from intention',
      'Without self-criticism, name it: "I drifted"',
      'Take one conscious breath',
      'Feel both feet on the floor for 5 seconds',
      'State your intention: "I am going to..."',
      'Begin again',
      'This takes 2 minutes. It can be done dozens of times per day.'
    ],
    coaching: 'The ADHD brain drifts. That is not a character flaw — it is a neurological difference. The practice is not staying on task. It is the returning. Every return counts.',
    why: 'Designed specifically for ADHD. Short, sensory-anchored, free of shame, and repeatable. Builds the returning habit rather than demanding sustained attention.',
    credits: 15
  },

  {
    id: 'sensory-grounding-extended',
    name: 'Extended Sensory Grounding',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Sit or stand wherever you are',
      'Name 5 things you can see — slowly, one at a time',
      'Name 4 things you can physically feel — the chair, the floor, the temperature',
      'Name 3 things you can currently hear',
      'Name 2 things you can smell — even faint smells',
      'Name 1 thing you can taste',
      'Then breathe slowly for 2 minutes',
      'Repeat the sequence if distress has not reduced'
    ],
    coaching: 'The 5-4-3-2-1 technique is used in clinical settings for panic, dissociation, and acute anxiety. It works because sensory attention competes with anxious thought.',
    why: 'Extended sensory grounding gives the nervous system time to fully shift from sympathetic activation to present-moment sensory awareness. Clinically validated for trauma and anxiety.',
    credits: 20
  },

  {
    id: 'mindful-movement-break',
    name: 'Mindful Movement Break',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system', 'full-body'],
    contraindications: [],
    energyRequired: 2,
    duration: 300,
    perSide: false,
    instructions: [
      'Stop whatever you are doing and stand up',
      'Shake your hands loosely for 30 seconds',
      'Roll the shoulders forward and back 10 times each',
      'Turn your head slowly left and right 5 times each',
      'Take 5 slow, deep breaths while standing',
      'Notice your feet on the floor for 30 seconds',
      'Return to what you were doing'
    ],
    coaching: 'This is a 5-minute break that actually works. Designed for desk workers, hyperfocused people, and anyone who sits for more than 90 minutes at a stretch.',
    why: 'A structured micro-break combining movement, breath, and grounding. Evidence shows 5-minute movement breaks every 90 minutes significantly improve focus, mood, and physical health markers.',
    credits: 15
  },

  {
    id: 'autogenic-training',
    name: 'Autogenic Training',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 900,
    perSide: false,
    instructions: [
      'Lie down or sit comfortably, eyes closed',
      'Repeat to yourself slowly: "My right arm is heavy and warm"',
      'Feel the weight and warmth as genuinely as possible — do not just say the words',
      'Repeat for the left arm, then both legs, then the torso',
      'Then: "My heartbeat is calm and regular"',
      'Then: "My breathing is slow and effortless"',
      'Then: "My forehead is cool"',
      'Rest in this state for 3 minutes'
    ],
    coaching: 'Autogenic training takes several weeks of regular practice before the sensations become fully reliable. Patience with the practice is part of the practice.',
    why: 'Developed by Dr Johannes Schultz in the 1930s, autogenic training is one of the oldest evidence-based relaxation techniques. Produces measurable decreases in cortisol and heart rate.',
    credits: 25
  },

  {
    id: 'visualisation-performance',
    name: 'Performance Visualisation',
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
      'Sit or lie quietly, eyes closed',
      'Bring to mind an upcoming performance — sport, presentation, difficult conversation',
      'Visualise yourself performing well — in specific, sensory detail',
      'See the environment, hear the sounds, feel the movement',
      'Include a moment of difficulty and see yourself responding calmly and effectively',
      'End with the successful outcome — hold the feeling of it for 30 seconds',
      'Open your eyes slowly'
    ],
    coaching: 'Effective visualisation is not vague positivity — it is detailed, sensory, and includes difficulty. The brain responds to specificity.',
    why: 'Mental rehearsal activates the same neural pathways as physical practice. Imagery training has strong evidence across sport, rehabilitation, and performance contexts.',
    credits: 20
  },

  {
    id: 'trauma-informed-breath',
    name: 'Trauma-Informed Breath Practice',
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
      'Begin by noticing the room around you — look at 3 things and name them',
      'Feel your feet on the floor or your body in the chair',
      'Let your breathing settle at its own rate — do not control it',
      'Simply observe the breath for 2 to 3 minutes without guidance',
      'If any moment feels unsafe, open your eyes and return to the room',
      'When ready, allow the exhale to be slightly longer than the inhale — gently, not forcibly'
    ],
    coaching: 'For some people, directed breath work increases rather than decreases anxiety. This practice offers a gentler, choice-based entry to breath awareness with clear off-ramps.',
    why: 'Trauma-informed breathwork prioritises safety and choice over technique. Designed for people for whom standard breath control practices feel triggering or overwhelming.',
    credits: 20
  },

  {
    id: 'present-moment-anchor',
    name: 'Present Moment Anchor',
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
      'Choose one small object near you — a cup, a stone, a pen',
      'Hold it in your hand',
      'Give it your full attention for 2 minutes',
      'Notice its weight, temperature, texture, colour, any smell',
      'When the mind drifts, return to the object',
      'The object is your anchor — specific, concrete, present'
    ],
    coaching: 'This is mindfulness for people who struggle with abstract concepts. The object is real. The attention to it is the practice.',
    why: 'Object-focused mindfulness is particularly accessible for neurodivergent adults — the concrete, sensory focus provides a clear and specific anchor rather than an abstract concept.',
    credits: 15
  },

  {
    id: 'expressive-movement',
    name: 'Expressive Movement Practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 3,
    duration: 600,
    perSide: false,
    instructions: [
      'Find a private space where you will not be observed',
      'Put on music that matches your current emotional state — not what you wish you felt',
      'Simply move to the music — no choreography, no performance',
      'Let your body respond honestly to what it hears',
      'When the emotional state shifts, the movement will shift',
      'Continue for 10 minutes'
    ],
    coaching: 'Expressive movement is not dance performance. It is the body expressing what words cannot. Looking ridiculous is part of how it works.',
    why: 'Somatic movement practice has strong clinical support for emotional regulation and trauma processing. Movement bypasses the verbal processing that often blocks emotional release.',
    credits: 20
  },

  {
    id: 'metta-extended',
    name: 'Loving-Kindness — Extended',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'visualisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 1200,
    perSide: false,
    instructions: [
      'Sit comfortably, eyes closed',
      'Begin with yourself: "May I be happy. May I be safe. May I be healthy. May I live with ease."',
      'Hold the feeling for 2 minutes',
      'Bring to mind someone you love easily: repeat the phrases for them',
      'Bring to mind a neutral person — someone you neither like nor dislike: repeat',
      'Bring to mind a difficult person — someone with whom there is friction: repeat',
      'Finally, extend to all beings everywhere: "May all beings be happy. May all beings be safe."',
      'Rest in the openness this creates for 2 minutes'
    ],
    coaching: 'The difficult person stage feels fake. That is normal. The practice is not requiring genuine warmth — just the willingness to wish them well.',
    why: 'Extended metta practice produces measurable increases in positive emotion, compassion, and life satisfaction. The full sequence including difficult people is where the deepest benefit occurs.',
    credits: 25
  },

  {
    id: 'curiosity-practice',
    name: 'Curiosity Practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Choose any ordinary thing in your environment — a leaf, a wall, a piece of food',
      'Examine it as if you have never seen anything like it before',
      'Ask questions: what is it made of? How did it come to exist here? What is happening at the molecular level?',
      'Notice your judgements — is it beautiful? Ugly? Boring?',
      'Set the judgements aside and return to pure observation',
      'Continue for 10 minutes'
    ],
    coaching: 'Curiosity is incompatible with anxiety. The two states cannot coexist in the brain simultaneously. Practicing curiosity is practicing the antidote to worry.',
    why: 'Curiosity activates the reward and exploration systems in the brain, reducing threat activation. Research shows curious people have lower anxiety, better relationships, and greater wellbeing.',
    credits: 20
  },

  {
    id: 'positive-data-log',
    name: 'Positive Data Log',
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
      'At the end of the day, write down 3 things that went well — however small',
      'For each one, write one sentence about why it happened',
      'The why matters: "Because I made a good decision" or "Because my friend was kind"',
      'Read all three before closing',
      'Keep the log somewhere visible — the accumulation over weeks matters'
    ],
    coaching: 'This is not toxic positivity — it is correcting the negativity bias, not pretending everything is fine. The brain attends to threats 4 to 5 times more than positives by default.',
    why: 'Research by Martin Seligman shows that writing what went well and why for 3 weeks produces measurable improvements in wellbeing that persist for months. One of the most replicated positive psychology interventions.',
    credits: 15
  },

  {
    id: 'mindful-rest',
    name: 'Mindful Rest — Doing Nothing',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Lie down or sit comfortably — no phone, no reading, no podcast',
      'Do nothing for 10 minutes',
      'When the urge to reach for a device arises, notice it and set it aside',
      'You do not need to meditate — just rest',
      'Let the mind wander freely if it wants to',
      'The only instruction is: no inputs'
    ],
    coaching: 'Doing nothing is a skill in the modern world. The discomfort of the first few minutes is itself important information about how much stimulation has become the baseline.',
    why: 'The default mode network — activated during rest — is essential for memory consolidation, creativity, and emotional processing. It requires genuine rest, not passive entertainment.',
    credits: 20
  },

  {
    id: 'compassionate-limit-setting',
    name: 'Compassionate Limit Setting',
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
      'Bring to mind a situation where you have said yes when you meant no',
      'Notice what motivated it — fear of disapproval, guilt, habit',
      'Practice the phrase: "I appreciate you asking, but I\'m not available for that"',
      'Notice the resistance to saying it — where is it in the body?',
      'Breathe into the resistance',
      'Repeat the phrase until it feels less threatening'
    ],
    coaching: 'Limit setting is a learnable skill, not a character trait. The resistance to saying no is not weakness — it is often a deeply learned survival response.',
    why: 'Chronic overcommitment is a primary driver of burnout, particularly for people-pleasers and those with anxiety. Practising limit-setting language reduces the physiological cost of boundary situations.',
    credits: 20
  },

  {
    id: 'energy-check-in',
    name: 'Energy Check-In Practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Pause before starting any significant activity',
      'Ask: what is my current physical energy — 1 to 10?',
      'Ask: what is my current emotional energy — 1 to 10?',
      'Ask: what do I actually need right now?',
      'Then choose your next action accordingly — not from obligation or habit',
      'Do this once in the morning and once after lunch as a minimum'
    ],
    coaching: 'Most people operate entirely from external demand — what is on the list, what someone else needs. The energy check-in inserts internal need into that equation.',
    why: 'Regular energy self-assessment is the foundational skill of sustainable performance and burnout prevention. Particularly important for neurodivergent adults who often mask their true energy state.',
    credits: 15
  },

  {
    id: 'mindful-transition',
    name: 'Mindful Transition Practice',
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
      'Notice that you are about to change activity — work ending, a meeting beginning, arriving home',
      'Pause for 2 minutes before the transition',
      'Take 3 deep breaths',
      'Let go of the previous context: "That is complete for now"',
      'Set an intention for the next activity: "I am about to..."',
      'Then begin the new activity fresh'
    ],
    coaching: 'Most context-switching anxiety happens because we carry the previous context into the new one. The transition practice creates a psychological gap between them.',
    why: 'Mindful transitions reduce cognitive carryover between activities — particularly valuable for neurodivergent adults who find switching between contexts cognitively expensive.',
    credits: 15
  },

  {
    id: 'pain-awareness-practice',
    name: 'Mindful Awareness of Pain',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'body-scan',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Turn attention toward a region of physical discomfort — not to judge or fix it',
      'Notice the quality of the sensation: sharp, dull, pulsing, burning',
      'Notice its edges — where does it begin and end?',
      'Notice whether it is constant or fluctuating',
      'Breathe into the region — not to make it go away but to observe it',
      'Notice the difference between the sensation itself and the story about it'
    ],
    coaching: "Pain and suffering are not the same thing. Pain is a signal. Suffering is often the mind's response to the signal. This practice addresses the suffering without denying the pain.",
    why: 'Mindfulness-based pain management (MBPM) has strong evidence for reducing the psychological suffering associated with chronic pain, independent of the physical sensation itself.',
    credits: 20
  },

  {
    id: 'nature-sounds-practice',
    name: 'Nature Sounds Immersion',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Find a natural environment if possible — a garden, park, or window with a view of sky or trees',
      'If not, use high-quality nature sound recordings',
      'Close your eyes and listen exclusively to the natural sounds for 10 minutes',
      'Let the sounds exist without labelling them',
      'Notice the depth of the soundscape — near, far, high, low'
    ],
    coaching: 'Research on attention restoration theory shows nature sounds reduce cognitive fatigue more effectively than any other audio stimulus. This is not just pleasant — it is physiologically restorative.',
    why: 'Natural soundscapes activate the parasympathetic nervous system and restore directed attentional capacity. Particularly effective after sustained cognitive work.',
    credits: 15
  },

  {
    id: 'self-inquiry-practice',
    name: 'Self-Inquiry Practice',
    category: 'mindfulness',
    contentType: 'practice',
    movementPattern: 'grounding',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['nervous-system'],
    contraindications: [],
    energyRequired: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Sit quietly and ask: "What am I feeling right now?"',
      'Do not answer intellectually — wait for a felt sense to emerge',
      'When something arises, ask: "Where do I feel this in my body?"',
      'Then ask: "What does this feeling need?"',
      'Stay with the question — do not rush to an answer',
      'If an answer comes, sit with it for a full minute before acting'
    ],
    coaching: 'Self-inquiry is not problem-solving. It is listening. The difference is that listening waits for what arises — problem-solving projects an answer onto the question.',
    why: 'Internal Family Systems and somatic therapy both use variations of this approach. Building the habit of turning toward inner experience — rather than away — is foundational to emotional health.',
    credits: 20
  },

  {
    id: 'celebration-practice',
    name: 'Achievement Celebration Practice',
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
      'At the end of any workout or completed activity, pause before moving on',
      'Acknowledge what you just did: "I showed up. I did that."',
      'Let the feeling of completion actually land — do not immediately move to the next thing',
      'Place a hand on your chest and say internally: "That counts."',
      'Stay with the positive feeling for at least 30 seconds'
    ],
    coaching: 'Most people dismiss their achievements instantly and move on. The celebration practice is the antidote — it trains the brain to register positive experiences, not just negative ones.',
    why: 'Positive experiences need 20 to 30 seconds of sustained attention to move from short-term to long-term memory. Rushing past achievements means they leave no lasting trace. This practice changes that.',
    credits: 15
  }

];
