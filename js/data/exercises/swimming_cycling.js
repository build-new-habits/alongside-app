/**
 * data/exercises/swimming_cycling.js
 * 11 Aug 2026 v2
 *
 * v2 - CON-9. watchOut and load added to all 22 entries. Written to the Exercise
 *   Entry Standard: name the error AND its correction, describe what it
 *   feels like rather than only what it looks like, no fear language, no
 *   shame, and pain is always a plain stop. Load is effort-relative
 *   throughout, never an absolute weight (Locked Principle P4).
 *
 * 10 Aug 2026 v1
 *
 * v1 — First version header on this file. Added tailored YouTube search
 *   terms to all 23 exercises (previously zero coverage, database-wide
 *   461-exercise pass, Graeme's direct request: "we get the most up to
 *   date versions and avoid any issue with discontinued or old videos"
 *   — search terms, not direct links, matching the reasoning exactly).
 *
 * Swimming technique drills, sets, full sessions + Cycling sessions
 * contentType: 'exercise' for drills, 'practice' for full sessions
 *
 * Batch 16: Swimming (15) + Cycling (8) = 23 items
 */

export const SWIMMING_CYCLING = [

  // ============================================
  // SWIMMING — Technique drills, sets, sessions
  // ============================================

  {
    id: 'swim-catch-drill',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Freestyle Catch Drill',
    youtube: 'freestyle catch drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 600,
    perSide: false,
    instructions: [
      'Swim freestyle at easy pace',
      'Focus entirely on the entry and catch phase — the moment your hand enters the water',
      'Enter fingertips first, slightly outside shoulder width',
      'As the hand enters, reach forward before pressing down — feel the water load onto your forearm',
      'Avoid slipping the hand straight down — press back, not down',
      'Complete 4 × 50 metres with 20 seconds rest between'
    ],
    coaching: 'The catch is where most freestyle power is lost. A good catch sets up a powerful pull — a missed catch wastes effort regardless of arm speed.',
    why: 'The catch is the most technically important phase of the freestyle stroke. Improving it is the single highest-return technique investment for most swimmers.',
        watchOut: [
      'Rushing the drill so it becomes ordinary swimming again',
      'Holding the breath through the length rather than exhaling steadily into the water',
      'Lifting the head to breathe, which drops the hips and makes everything harder'
    ],
    load: 'Effort only. Technique drills should feel easy; the difficulty is the precision.',
    credits: 40
  },

  {
    id: 'swim-bilateral-breathing',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Bilateral Breathing Drill',
    youtube: 'bilateral breathing drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 600,
    perSide: false,
    instructions: [
      'Swim freestyle, breathing every 3 strokes — alternating left and right sides',
      'Count: stroke, stroke, breathe, stroke, stroke, breathe',
      'The breathing side should alternate each time',
      'If bilateral breathing feels too hard, start with every 2 strokes on your weak side',
      'Complete 4 × 50 metres focusing on symmetry'
    ],
    coaching: 'Bilateral breathing feels awkward on the weak side for most people. That awkwardness is exactly why it is worth practising — it corrects stroke imbalance.',
    why: 'Bilateral breathing develops a balanced stroke, improves body rotation on both sides, and is essential for open water swimming where waves come from either side.',
        watchOut: [
      'Rushing the drill so it becomes ordinary swimming again',
      'Holding the breath through the length rather than exhaling steadily into the water',
      'Lifting the head to breathe, which drops the hips and makes everything harder'
    ],
    load: 'Effort only. Technique drills should feel easy; the difficulty is the precision.',
    credits: 35
  },

  {
    id: 'swim-kick-drill',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kick Set — Board',
    youtube: 'kick set - board technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'swim',
    equipment: ['swimming-pool', 'kickboard'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 600,
    perSide: false,
    instructions: [
      'Hold a kickboard in front of you with both hands',
      'Kick from the hips — not the knees — with straight-ish legs',
      'The kick is small and fast — about 30 to 40 cm amplitude',
      'Feet should be floppy at the ankle — not pointed like a ballet dancer, not flexed like a runner',
      'Complete 4 × 50 metres with 20 seconds rest'
    ],
    coaching: 'Most people kick far too much from the knee. Think of the whole leg as a long flipper — the movement initiates at the hip.',
    why: 'Isolates the kick for focused development and reveals ankle flexibility limitations. A powerful kick reduces drag and helps with body position.',
        watchOut: [
      'Kicking from the knees rather than the hips',
      'Gripping the board so hard the shoulders tense',
      'Kicking so hard the legs are wrecked for the rest of the session'
    ],
    load: 'Effort only. Steady, small, fast kicks beat big slow ones.',
    credits: 40
  },

  {
    id: 'swim-pull-buoy',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Pull Buoy Set',
    youtube: 'pull buoy set technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'swim',
    equipment: ['swimming-pool', 'pull-buoy'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 900,
    perSide: false,
    instructions: [
      'Place a pull buoy between your thighs to support the hips and remove the kick',
      'Swim freestyle using arms only',
      'Focus on the pull phase — the underwater stroke from catch to push',
      'Keep the hips high and body long throughout',
      'Complete 6 × 50 metres with 15 seconds rest'
    ],
    coaching: 'Many swimmers go faster with a pull buoy than without. If this is you, your kick is adding drag — the buoy is telling you where to improve.',
    why: 'Isolates the arm stroke by removing the kick, allowing focused development of pull mechanics and upper body swimming strength.',
        watchOut: [
      'Letting the hips sink because the legs have stopped working',
      'Over-reaching at the front of the stroke',
      'Using the buoy every session, which lets the kick quietly disappear'
    ],
    load: 'Effort only.',
    credits: 45
  },

  {
    id: 'swim-catch-up-drill',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Catch-Up Drill',
    youtube: 'catch-up drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Swim freestyle but wait for one hand to fully extend before the other begins its pull',
      'The reaching hand "catches up" to the leading hand before the pull begins',
      'This exaggerates the reach and extension phase of the stroke',
      'It slows you down — that is intentional',
      'Complete 4 × 50 metres focusing on long, controlled strokes'
    ],
    coaching: 'Catch-up drill teaches the stroke to be long and controlled rather than frantic. Count strokes per length — the goal is fewer, not more.',
    why: 'Develops stroke length and extension — the reach phase that sets up a good catch. Most beginners shorten this phase under fatigue.',
        watchOut: [
      'Rushing the drill so it becomes ordinary swimming again',
      'Holding the breath through the length rather than exhaling steadily into the water',
      'Lifting the head to breathe, which drops the hips and makes everything harder'
    ],
    load: 'Effort only. Technique drills should feel easy; the difficulty is the precision.',
    credits: 35
  },

  {
    id: 'swim-fingertip-drag',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Fingertip Drag Drill',
    youtube: 'fingertip drag drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Swim freestyle, but during the recovery phase drag your fingertips lightly along the water surface',
      'This forces a high elbow recovery — the elbow leads, fingers trail',
      'The sensation of the fingertips dragging provides feedback on elbow height',
      'If the elbow drops, the fingertips will plunge into the water rather than skim',
      'Complete 4 × 50 metres'
    ],
    coaching: 'This drill is entirely about the recovery — the part of the stroke above water. A high elbow recovery sets up a better entry and catch.',
    why: 'Trains the high elbow recovery that prevents shoulder impingement and sets up the forward reach. Particularly useful for swimmers with shoulder issues.',
        watchOut: [
      'Rushing the drill so it becomes ordinary swimming again',
      'Holding the breath through the length rather than exhaling steadily into the water',
      'Lifting the head to breathe, which drops the hips and makes everything harder'
    ],
    load: 'Effort only. Technique drills should feel easy; the difficulty is the precision.',
    credits: 35
  },

  {
    id: 'swim-descending-intervals',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Descending Intervals',
    youtube: 'descending intervals technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['shoulder-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 1800,
    perSide: false,
    instructions: [
      'Warm up: 200 metres easy',
      'Swim 4 × 100 metres on 2-minute intervals — each one faster than the last',
      'Rep 1: easy, Rep 2: comfortable, Rep 3: hard, Rep 4: maximum effort',
      'Rest 30 seconds between reps if needed beyond the interval',
      'Cool down: 200 metres easy'
    ],
    coaching: 'Descending means getting faster each rep. Starting too hard ruins the set — resist the temptation. Rep 4 should be your fastest.',
    why: 'Builds aerobic capacity, pacing awareness, and finishing speed — all essential for race swimming. Also develops the ability to accelerate when fatigued.',
        watchOut: [
      'Setting off faster than you can repeat across the whole set',
      'Shortening the rest to feel tougher, which just makes every effort slower',
      'Losing stroke length as you tire; shorter and faster is not quicker in water'
    ],
    load: 'Hard but repeatable. Every effort should be within a couple of seconds of the last.',
    credits: 70
  },

  {
    id: 'swim-easy-400',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Easy 400 Metres',
    youtube: 'easy 400 metres technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 900,
    perSide: false,
    instructions: [
      'Swim 400 metres continuously at easy, conversational effort',
      'Mix strokes if you like — there is no requirement to swim only freestyle',
      'Focus on relaxed, long strokes rather than speed',
      'Rest at the end of each 100 metres for 10 to 15 seconds if needed'
    ],
    coaching: 'This is the swimming equivalent of an easy run. The goal is to move through the water efficiently and enjoyably — not to work hard.',
    why: 'Builds swimming base fitness and technical consistency without fatigue. The ideal recovery session between harder swim workouts.',
        watchOut: [
      'Swimming faster than easy because it feels too gentle',
      'Skipping the exhale and holding air, which raises the shoulders',
      'Pushing on through shoulder discomfort rather than switching stroke'
    ],
    load: 'Easy and continuous. You should finish able to go again.',
    credits: 50
  },

  {
    id: 'swim-hard-200',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Hard 200 Metres',
    youtube: 'hard 200 metres technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['shoulder-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 600,
    perSide: false,
    instructions: [
      'Warm up: 200 metres easy',
      'Swim 200 metres as hard as you can sustain for the whole distance — not a sprint, but race effort',
      'Record your time',
      'Cool down: 200 metres easy'
    ],
    coaching: 'The 200 metre time trial reveals your current swimming fitness more honestly than a technique drill. It is uncomfortable — that is useful information.',
    why: 'A benchmark swim that tracks progress and builds race-effort tolerance. Comparing times over months is highly motivating.',
        watchOut: [
      'Setting off faster than you can repeat across the whole set',
      'Shortening the rest to feel tougher, which just makes every effort slower',
      'Losing stroke length as you tire; shorter and faster is not quicker in water'
    ],
    load: 'Hard but repeatable. Every effort should be within a couple of seconds of the last.',
    credits: 60
  },

  {
    id: 'swim-sprint-50',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Sprint 50 Metres × 6',
    youtube: 'sprint 50 metres 6 technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['shoulder-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 1200,
    perSide: false,
    instructions: [
      'Warm up: 200 metres easy',
      'Sprint 50 metres as fast as possible',
      'Rest for 60 seconds',
      'Repeat 6 times',
      'Cool down: 200 metres easy'
    ],
    coaching: 'Full rest between reps is essential — this is sprint training, not endurance. Each 50 should be close to maximum effort.',
    why: 'Develops pure swimming speed and explosive power. Builds anaerobic capacity and improves stroke mechanics at high effort.',
        watchOut: [
      'Setting off faster than you can repeat across the whole set',
      'Shortening the rest to feel tougher, which just makes every effort slower',
      'Losing stroke length as you tire; shorter and faster is not quicker in water'
    ],
    load: 'Hard but repeatable. Every effort should be within a couple of seconds of the last.',
    credits: 75
  },

  {
    id: 'swim-medley',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Swim, Pull, Kick Medley',
    youtube: 'swim pull kick medley technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'swim',
    equipment: ['swimming-pool', 'kickboard', 'pull-buoy'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 1800,
    perSide: false,
    instructions: [
      'Swim 200 metres freestyle',
      'Pull 200 metres with pull buoy — arms only',
      'Kick 200 metres with kickboard — legs only',
      'Repeat the cycle once more if time and energy allow',
      'Rest 20 seconds between each 200 metres'
    ],
    coaching: 'The medley format develops all elements of swimming fitness in one session. The kick set will feel hardest — that is normal.',
    why: 'A complete swim session that develops all components: full stroke, arm strength, and kick power. Efficient use of pool time.',
        watchOut: [
      'Setting off faster than you can repeat across the whole set',
      'Shortening the rest to feel tougher, which just makes every effort slower',
      'Losing stroke length as you tire; shorter and faster is not quicker in water'
    ],
    load: 'Hard but repeatable. Every effort should be within a couple of seconds of the last.',
    credits: 70
  },

  {
    id: 'swim-backstroke',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Backstroke Technique',
    youtube: 'backstroke swimming technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 900,
    perSide: false,
    instructions: [
      'Lie on your back, ears in the water, hips high',
      'One arm pulls from the hip, the other recovers straight up over the body',
      'The pulling arm enters the water thumb-first at shoulder width',
      'Rotate the body side to side with each stroke — do not remain flat',
      'Kick continuously from the hip',
      'Complete 4 × 50 metres'
    ],
    coaching: 'Backstroke is kinder on the shoulders than freestyle for many people. Worth adding as a regular component if you have shoulder sensitivity.',
    why: 'Backstroke develops posterior shoulder strength and spinal extension — often the opposite movement to what the body does all day. Great for posture.',
        watchOut: [
      'Rushing the drill so it becomes ordinary swimming again',
      'Holding the breath through the length rather than exhaling steadily into the water',
      'Lifting the head to breathe, which drops the hips and makes everything harder'
    ],
    load: 'Effort only. Technique drills should feel easy; the difficulty is the precision.',
    credits: 40
  },

  {
    id: 'swim-open-water-prep',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Open Water Preparation',
    youtube: 'open water preparation technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 1800,
    perSide: false,
    instructions: [
      'Swim 300 metres continuously without touching the lane rope or stopping',
      'Every 10 strokes, sight: lift your head briefly to look forward, then return to normal position',
      'Practise starting from a treading water position rather than pushing off the wall',
      'Swim without goggles for one 50-metre length if safe and comfortable',
      'Cool down: 200 metres easy'
    ],
    coaching: 'Open water feels completely different to pool swimming — no lane ropes, no walls, no clear visibility. These drills reduce the surprise.',
    why: 'Prepares for the specific challenges of open water swimming: sighting, starts, no walls, and the disorientation of swimming without visible lines.',
        watchOut: [
      'Practising open-water skills alone in open water; always swim with others or in a supervised area',
      'Sighting so often it wrecks the stroke rhythm',
      'Going into cold water without acclimatising gradually'
    ],
    load: 'Easy and steady. Open water is about calm, not speed.',
    credits: 60
  },

  {
    id: 'swim-pool-endurance',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Pool Endurance — 1500 Metres',
    youtube: 'pool endurance - 1500 metres technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['shoulder-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 2400,
    perSide: false,
    instructions: [
      'Swim 1500 metres continuously at steady effort',
      'Rest for 20 seconds every 300 metres',
      'Maintain consistent stroke technique throughout — especially in the final 500 metres',
      'Count your strokes per length in the final 300 — if it increases, you are fatiguing',
      'Record your total time'
    ],
    coaching: '1500 metres is the Olympic distance. Most recreational swimmers can complete it in 30 to 50 minutes. Time is irrelevant — finishing is the achievement.',
    why: 'Builds the endurance base required for triathlon swimming or open water events. Reveals how technique holds up under fatigue.',
        watchOut: [
      'Swimming faster than easy because it feels too gentle',
      'Skipping the exhale and holding air, which raises the shoulders',
      'Pushing on through shoulder discomfort rather than switching stroke'
    ],
    load: 'Easy and continuous. You should finish able to go again.',
    credits: 100
  },

  {
    id: 'swim-breaststroke',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Breaststroke Technique',
    youtube: 'breaststroke swimming technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'swim',
    equipment: ['swimming-pool'],
    equipmentOptional: [],
    affectsAreas: ['adductors', 'hip', 'calves'],
    contraindications: ['knee-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 900,
    perSide: false,
    instructions: [
      'Begin in a streamlined position — arms extended, body flat',
      'Pull: arms sweep outward and inward to the chest in a heart-shape',
      'Kick: while arms pull in, draw the heels toward the glutes, then kick out and round',
      'Glide: after each stroke, hold a streamlined position for 1 to 2 seconds',
      'The glide is where breaststroke is won or lost — do not rush into the next stroke',
      'Complete 4 × 50 metres'
    ],
    coaching: 'Breaststroke is the most technically complex stroke. The pull and kick must be sequenced correctly — simultaneous movement kills efficiency.',
    why: 'The most common recreational stroke. Correct technique dramatically reduces effort and knee stress. The glide phase is essential and most beginners rush it.',
        watchOut: [
      'Rushing the drill so it becomes ordinary swimming again',
      'Holding the breath through the length rather than exhaling steadily into the water',
      'Lifting the head to breathe, which drops the hips and makes everything harder'
    ],
    load: 'Effort only. Technique drills should feel easy; the difficulty is the precision.',
    credits: 40
  },

  // ============================================
  // CYCLING — Road and indoor sessions
  // ============================================

  {
    id: 'cycle-easy-spin',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Easy Spin — 30 Minutes',
    youtube: 'easy spin - 30 minutes technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['bicycle'],
    equipmentOptional: ['exercise-bike'],
    affectsAreas: ['quadriceps', 'glutes', 'calves'],
    contraindications: ['glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 1800,
    perSide: false,
    instructions: [
      'Set up on your bike with the saddle at the correct height — knee slightly bent at the bottom of the pedal stroke',
      'Use a low gear and spin at 90 to 100 RPM — light resistance',
      'Maintain a cadence high enough that the legs feel like they are spinning rather than pushing',
      'This should feel almost effortless',
      'Continue for 30 minutes'
    ],
    coaching: 'An easy spin should feel uncomfortably easy. If you feel like you are working, you are in too high a gear.',
    why: 'Active recovery cycling promotes blood flow to the legs without additional stress. Used by cyclists the day after hard sessions.',
        watchOut: [
      'Riding harder than easy because it feels too gentle',
      'Saddle too low, which crowds the knee',
      'Gripping the bars and tensing the shoulders'
    ],
    load: 'Easy. Conversational the whole way.',
    credits: 35
  },

  {
    id: 'cycle-tempo-45',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Tempo Ride — 45 Minutes',
    youtube: 'tempo ride - 45 minutes technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['bicycle'],
    equipmentOptional: ['exercise-bike'],
    affectsAreas: ['quadriceps', 'glutes', 'calves'],
    contraindications: ['glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 2700,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy spinning',
      'Increase effort to a sustained, comfortably hard pace for 25 minutes',
      'This is approximately 70 to 80% effort — you can speak a few words but not hold a conversation',
      'Maintain as consistent a pace as possible throughout',
      'Cool down: 10 minutes easy spinning'
    ],
    coaching: 'Tempo cycling is harder to judge than running because hills and wind vary effort without changing pace. Focus on sustained effort, not speed.',
    why: 'Builds cycling-specific lactate threshold — the primary physiological adaptation for cycling performance improvement.',
        watchOut: [
      'Starting at interval intensity and fading',
      'Grinding a heavy gear at low cadence, which loads the knees',
      'Skipping the warm-up before the tempo section'
    ],
    load: 'Comfortably hard and even throughout.',
    credits: 75
  },

  {
    id: 'cycle-hill-simulation',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Hill Climb Simulation',
    youtube: 'hill climb simulation technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['bicycle'],
    equipmentOptional: ['exercise-bike'],
    affectsAreas: ['quadriceps', 'glutes', 'calves'],
    contraindications: ['glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 2400,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy spinning',
      'Increase resistance significantly — simulate a steep climb',
      'Stand on the pedals for 30-second efforts, seated for 30 seconds',
      'Maintain this pattern for 5 minutes, then 3 minutes easy recovery',
      'Repeat 4 times',
      'Cool down: 10 minutes easy'
    ],
    coaching: 'When standing, shift your weight forward slightly — too far back and power is lost. Use the handlebars for support, not for pulling.',
    why: 'Hill work builds leg strength, power, and climbing efficiency on the bike — essential skills for road cycling and triathlon.',
        watchOut: [
      'Grinding a gear so heavy the cadence collapses',
      'Rocking the bike side to side',
      'Standing for the whole climb rather than alternating'
    ],
    load: 'Hard but steady. Cadence should stay above about sixty.',
    credits: 85
  },

  {
    id: 'cycle-intervals',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Cycling Interval Session',
    youtube: 'cycling interval session technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['bicycle'],
    equipmentOptional: ['exercise-bike'],
    affectsAreas: ['full-body', 'quadriceps', 'glutes'],
    contraindications: ['glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 2700,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy with 2 to 3 brief surges',
      'Work interval: 30 seconds at maximum effort',
      'Recovery: 90 seconds easy spinning',
      'Repeat 10 times',
      'Cool down: 10 minutes easy spinning'
    ],
    coaching: 'The recovery interval must be truly easy — if you are still breathing hard when the work interval starts, you are going too hard or recovering too short.',
    why: 'High-intensity cycling intervals improve VO2 max and anaerobic capacity. Highly time-efficient — significant cardiovascular adaptation in under 30 minutes.',
        watchOut: [
      'Going maximal on the first interval',
      'Coasting completely during recovery rather than spinning easy',
      'Adding intervals because you feel good'
    ],
    load: 'Hard but repeatable across every interval.',
    credits: 90
  },

  {
    id: 'cycle-cadence-drill',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Cadence Drill — Cycling',
    youtube: 'cadence drill - cycling technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    equipment: ['bicycle'],
    equipmentOptional: ['exercise-bike'],
    affectsAreas: ['quadriceps', 'calves'],
    contraindications: [],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 1200,
    perSide: false,
    instructions: [
      'Ride at easy effort in a light gear',
      'Spin as fast as possible for 30 seconds — above 110 RPM if possible',
      'Recover at normal cadence for 60 seconds',
      'Repeat 6 times',
      'Focus on smooth, circular pedalling — not stomping'
    ],
    coaching: 'High cadence drills feel chaotic at first. The bouncing sensation means your pedal stroke is not yet circular. Over time, it smooths out.',
    why: 'Develops neuromuscular efficiency and smooth pedal stroke — reducing energy waste and knee stress at higher cadences.',
        watchOut: [
      'Bouncing in the saddle at high cadence',
      'Tensing the upper body to hold the rhythm',
      'Chasing a number rather than smoothness'
    ],
    load: 'Light resistance. Smoothness is the point, not effort.',
    credits: 40
  },

  {
    id: 'cycle-sprint-intervals',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Sprint Intervals — Cycling',
    youtube: 'sprint intervals - cycling technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['bicycle'],
    equipmentOptional: ['exercise-bike'],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 9,
    difficultyLevel: 3,
    duration: 2400,
    perSide: false,
    instructions: [
      'Warm up: 15 minutes easy with progressive effort',
      'Sprint for 10 seconds at absolute maximum effort',
      'Recover for 5 minutes at easy spin',
      'Repeat 4 to 5 times',
      'Cool down: 10 minutes easy spinning'
    ],
    coaching: 'Ten-second sprints require complete muscular commitment — not just faster pedalling but driving through the entire pedal stroke. Everything for 10 seconds.',
    why: 'Maximal sprint intervals develop peak cycling power and fast-twitch muscle recruitment. The long rest period ensures each sprint is truly maximal.',
        watchOut: [
      'Sprinting before a full warm-up',
      'Cutting recovery short, which turns a power session into a hard aerobic one',
      'Pulling hard on the bars and straining the back'
    ],
    load: 'Maximal for the sprint, fully recovered before the next.',
    credits: 95
  },

  {
    id: 'cycle-endurance-90',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Endurance Ride — 90 Minutes',
    youtube: 'endurance ride - 90 minutes technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['bicycle'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'quadriceps', 'glutes'],
    contraindications: ['glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 5400,
    perSide: false,
    instructions: [
      'Ride for 90 minutes at a steady, aerobic effort — you should be able to hold a conversation',
      'Include varied terrain if possible — climbs and descents add physiological variety',
      'Maintain a consistent cadence of 80 to 95 RPM throughout',
      'Take on water and food after the first hour',
      'The final 20 minutes should feel harder than the first 20 at the same effort — that is normal'
    ],
    coaching: 'Anything beyond 60 minutes requires nutrition planning. Even if you do not feel hungry, your performance will drop without fuel.',
    why: 'The long ride builds aerobic base, fat-burning capacity, and saddle endurance. The foundational session for road cycling and triathlon.',
        watchOut: [
      'Riding harder than easy pace',
      'Setting off without food, fluid or a repair kit',
      'Jumping to ninety minutes without building up to it'
    ],
    load: 'Easy and conversational for the whole ride.',
    credits: 110
  },

  {
    id: 'cycle-recovery-spin',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Recovery Spin — 20 Minutes',
    youtube: 'recovery spin - 20 minutes technique',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: ['bicycle'],
    equipmentOptional: ['exercise-bike'],
    affectsAreas: ['quadriceps', 'glutes', 'calves'],
    contraindications: ['glutes-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 1200,
    perSide: false,
    instructions: [
      'Ride at the absolute minimum effort — the easiest possible gear',
      'Aim for 90 RPM cadence but zero perceived exertion',
      'This should feel like barely doing anything — that is the point',
      'Continue for 20 minutes'
    ],
    coaching: 'Recovery cycling is a skill. Most people go too hard. If you feel any fatigue during the session, you are doing it wrong.',
    why: 'Gentle cycling flushes metabolic waste from the legs and promotes recovery between hard sessions — significantly better than complete rest for trained athletes.',
        watchOut: [
      'Bouncing into the stretch rather than holding it still',
      'Pushing to the point of pain; a stretch should feel like a strong pull, never sharp',
      'Holding your breath, which makes everything tighter',
      'Forcing the range on one side to match the other; sides are rarely equal'
    ],
    load: 'Bodyweight. Progress by holding longer, not by pushing harder.',
    credits: 25
  }

];
