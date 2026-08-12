/**
 * data/exercises/sport_conditioning.js
 * 11 Aug 2026 v2
 *
 * v2 - CON-9. watchOut and load added to all 43 entries. Written to the Exercise
 *   Entry Standard: name the error AND its correction, describe what it
 *   feels like rather than only what it looks like, no fear language, no
 *   shame, and pain is always a plain stop. Load is effort-relative
 *   throughout, never an absolute weight (Locked Principle P4).
 *
 * 10 Aug 2026 v1
 *
 * v1 — First version header on this file. Added tailored YouTube search
 *   terms to all 50 exercises (previously zero coverage, database-wide
 *   461-exercise pass, Graeme's direct request: "we get the most up to
 *   date versions and avoid any issue with discontinued or old videos"
 *   — search terms, not direct links, matching the reasoning exactly).
 *
 * Sport Conditioning — Component G
 * Agility, SAQ (speed/agility/quickness), sport-specific drills
 * contentType: 'exercise' for drills, 'practice' for full sessions
 * sportRelevance: array of applicable sports
 *
 * Batch 18: Agility drills (8) + SAQ (8) + warm-up/cool-down sessions (6) + sport-specific (8) = 30 items
 */

export const SPORT_CONDITIONING = [

  // ============================================
  // AGILITY DRILLS (8 items)
  // ============================================

  {
    id: 'drill-lateral-shuffle',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Lateral Shuffle',
    youtube: 'lateral shuffle drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'basketball', 'tennis', 'netball', 'hockey', 'badminton'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'adductors', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand in athletic position — knees bent, weight on balls of feet, feet shoulder-width',
      'Step laterally with the lead foot, then bring the trailing foot to meet it',
      'Never cross your feet — maintain the shoulder-width gap throughout',
      'Stay low — the hips should not rise and fall with each step',
      'Shuffle 5 metres to the right, then 5 metres back to the left',
      'Complete 3 sets of 30 seconds'
    ],
    coaching: 'Stay low throughout — the moment the hips rise, speed and reactivity are lost. Think of keeping your head at the same height the whole time.',
    why: 'Lateral shuffling is the primary defensive movement in most court and team sports. Develops the hip abductor and adductor strength needed for lateral speed.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 50
  },

  {
    id: 'drill-t-drill',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'T-Drill',
    youtube: 't-drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'athletics', 'hockey'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['full-body', 'glutes', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Set up 4 cones in a T shape: cone A at the base, cone B 10m ahead, cones C and D 5m either side of B',
      'Sprint from A to B',
      'Shuffle left to C, touch the cone',
      'Shuffle right to D — passing B — touch the cone',
      'Shuffle back to B, touch the cone',
      'Backpedal to A',
      'Rest 90 seconds between attempts',
      'Complete 4 to 6 reps'
    ],
    coaching: 'Never cross your feet during the shuffle sections. Touch the cones with the hand closest to them. Time yourself — this is also a fitness test.',
    why: 'The T-drill tests and develops acceleration, lateral agility, and backpedalling — the three directional changes required in most team sports.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 75
  },

  {
    id: 'drill-5-10-5',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: '5-10-5 Shuttle',
    youtube: '5-10-5 shuttle drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'athletics'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['full-body', 'glutes'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Place 3 cones in a line, 5 metres apart',
      'Start at the middle cone in athletic position',
      'Sprint 5 metres to the right cone, touch it',
      'Sprint 10 metres to the left cone, touch it',
      'Sprint 5 metres back to the middle',
      'Rest 90 seconds between attempts',
      'Complete 4 to 6 reps'
    ],
    coaching: 'The change-of-direction technique matters: plant the outside foot, stay low through the turn, and drive with the opposite leg.',
    why: 'The 5-10-5 is used by every major sport league as a standard combine test. It measures short-area quickness and change-of-direction ability.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 70
  },

  {
    id: 'drill-figure-8-run',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Figure-8 Run',
    youtube: 'figure-8 run drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'tennis', 'hockey', 'basketball'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['full-body', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 300,
    perSide: false,
    instructions: [
      'Place 2 cones 5 metres apart',
      'Run a figure-8 pattern around both cones continuously',
      'Each loop involves leaning into the turn and driving off the outside leg',
      'Alternate the starting direction each rep',
      'Complete 6 figure-8 loops per rep, 4 reps with 30 seconds rest'
    ],
    coaching: 'Lean into the turns rather than slowing down. The centripetal force through the outer leg is the training stimulus.',
    why: 'Develops curved running mechanics and the ability to maintain speed through direction changes — common in team sports and racket sports.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 55
  },

  {
    id: 'drill-defensive-slide',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Defensive Slide',
    youtube: 'defensive slide drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['basketball', 'football', 'netball', 'handball'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'adductors', 'quadriceps'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 120,
    perSide: false,
    instructions: [
      'Adopt a low defensive stance — knees bent, back straight, arms wide',
      'Step laterally with the lead foot, drag the trail foot to maintain stance width',
      'Keep the hips level — no bobbing up and down',
      'Maintain defensive arm position throughout',
      'Slide 10 metres left, touch down, slide 10 metres right',
      'Complete 3 sets of 30 seconds'
    ],
    coaching: 'The defensive slide is slower than a shuffle but lower and wider. The wider base is what makes it effective for mirroring an opponent.',
    why: 'Develops the specific movement pattern used in individual defensive situations — maintaining position relative to an opponent while staying low and reactive.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 55
  },

  {
    id: 'drill-ladder-in-out',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Ladder In-Out',
    youtube: 'ladder in-out drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'athletics', 'tennis'],
    equipment: ['agility-ladder'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'ankle-foot', 'calves'],
    contraindications: ['ankle-foot-acute', 'knee-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    instructions: [
      'Lay the ladder flat on the ground',
      'Stand to the side of the first rung',
      'Step both feet into the first square, then both feet out to the side — in, in, out, out',
      'Move forward with each in-out cycle',
      'Work up to continuous speed along the full ladder',
      'Complete 4 lengths with 30 seconds rest'
    ],
    coaching: 'Accuracy before speed. The ladder drills bad footwork out of existence — rushing too early means no benefit. Slow down until the pattern is grooved.',
    why: 'Develops foot speed, coordination, and rapid ground contact time — the mechanical basis of agility in all sports.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 55
  },

  {
    id: 'drill-ladder-ickey-shuffle',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Ladder Ickey Shuffle',
    youtube: 'ladder ickey shuffle drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics', 'basketball'],
    equipment: ['agility-ladder'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'ankle-foot'],
    contraindications: ['ankle-foot-acute', 'hamstring-acute', 'glutes-acute', 'lower-back-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    instructions: [
      'Start to the right of the ladder facing forward',
      'Step left foot into the square, then right foot into the square',
      'Step left foot out to the left side of the ladder',
      'Move forward to the next square: right foot in, left foot in, right foot out',
      'Continue this three-step pattern along the full ladder',
      'Complete 4 lengths in each direction'
    ],
    coaching: 'The pattern is: in-in-out, then the mirror. Saying "in-in-out" aloud helps the brain pattern it before the feet follow.',
    why: 'One of the most complex ladder drills — develops coordination, rhythm, and the ability to process movement patterns quickly under fatigue.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 60
  },

  {
    id: 'drill-pro-agility',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Pro Agility Drill',
    youtube: 'pro agility drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'athletics'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['full-body', 'glutes'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Place 3 cones in a line, 5 metres apart',
      'Start at the middle cone in a 3-point stance or athletic position',
      'Sprint to the right cone, touch it with your right hand',
      'Sprint to the far left cone — 10 metres — touch it with your left hand',
      'Sprint back through the middle cone',
      'Rest 2 minutes between attempts',
      'Complete 4 to 6 reps'
    ],
    coaching: 'Low centre of gravity through the turns is everything. High hips lose time. The turns should be tight and explosive — not wide arcs.',
    why: 'The pro agility drill is the gold standard change-of-direction test in professional sport. It measures what scouts actually care about: how fast you can move laterally and stop.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 75
  },

  // ============================================
  // SAQ — Speed, Agility, Quickness (8 items)
  // ============================================

  {
    id: 'saq-acceleration-run',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Acceleration Run — 10m',
    youtube: 'acceleration run - 10m drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics', 'cricket', 'hockey'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['full-body', 'glutes', 'calves'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Mark a start line and a line 10 metres ahead',
      'Start from a standing, 2-point or 3-point stance',
      'Drive explosively from the start — lean forward, drive the arms hard',
      'Accelerate maximally over the full 10 metres',
      'Do not decelerate until past the finish line',
      'Walk back to recover — at least 90 seconds',
      'Complete 6 to 8 reps'
    ],
    coaching: 'The first three steps are the most important in acceleration. Drive the knees forward and up, push the ground back. You accelerate by pushing, not by leaning forward.',
    why: 'Short acceleration is the most sport-relevant speed quality — most actions in team sport happen over 10 metres or less.',
        watchOut: [
      'Sprinting without a thorough warm-up, which is how hamstrings get pulled',
      'Straining the face, jaw and shoulders; stay relaxed above the waist',
      'Taking short recoveries, which turns a speed session into a conditioning one'
    ],
    load: 'Maximal effort, full recovery. Speed work needs freshness.',
    credits: 65
  },

  {
    id: 'saq-wall-drive',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Wall Drive — Sprint Mechanics',
    youtube: 'wall drive - sprint mechanics drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip-flexor', 'glutes', 'calves'],
    contraindications: ['glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 120,
    perSide: false,
    instructions: [
      'Stand facing a wall, hands on the wall at shoulder height, body at 45 degrees',
      'Drive one knee up to hip height rapidly — hold for 1 second',
      'Return and drive the opposite knee',
      'Once the pattern is established, alternate rapidly — simulating sprint drive phase',
      'Complete 3 sets of 20 total drives'
    ],
    coaching: 'The wall removes balance demands and lets you focus entirely on the knee drive mechanics. This is the most transferable sprint drill there is.',
    why: 'Develops the drive phase of sprinting — the most mechanically demanding part of acceleration. Used by track athletes before every session.',
        watchOut: [
      'Hips sagging away from the wall',
      'Driving the knee up without the opposite arm following',
      'Rushing so it becomes a jog against a wall'
    ],
    load: 'Bodyweight only. Position first, speed second.',
    credits: 45
  },

  {
    id: 'saq-falling-start',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Falling Start',
    youtube: 'falling start drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics', 'hockey'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'glutes'],
    contraindications: ['hamstring-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 120,
    perSide: false,
    instructions: [
      'Stand tall on both feet',
      'Lean forward — allow gravity to pull you forward past your balance point',
      'At the point where you would fall, take your first explosive step and sprint 10 metres',
      'Walk back and repeat',
      'The fall creates the forward lean naturally — no conscious lean required',
      'Complete 6 to 8 reps'
    ],
    coaching: 'The falling start teaches the forward lean of acceleration without the mechanical error of bending at the waist. Let gravity do the work.',
    why: 'Develops the instinctive forward lean of acceleration and practises explosive first-step response — the reactive sprint start used in sport.',
        watchOut: [
      'Sprinting without a thorough warm-up, which is how hamstrings get pulled',
      'Straining the face, jaw and shoulders; stay relaxed above the waist',
      'Taking short recoveries, which turns a speed session into a conditioning one'
    ],
    load: 'Maximal effort, full recovery. Speed work needs freshness.',
    credits: 55
  },

  {
    id: 'saq-resisted-sprint',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Resisted Sprint — Partner or Sled',
    youtube: 'resisted sprint - partner or sled drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics'],
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'glutes', 'hamstring'],
    contraindications: ['hamstring-acute', 'lower-back-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Attach a resistance band around the waist, partner holds the other end',
      'Sprint forward 15 to 20 metres against the resistance',
      'Maintain sprint mechanics — do not let the resistance pull you upright',
      'Partner provides moderate resistance — enough to feel, not enough to stop you',
      'Walk back to recover — 2 minutes between reps',
      'Complete 6 reps'
    ],
    coaching: 'The resistance should add about 10 to 15% to normal sprint effort. More than that changes the mechanics negatively. Less than that is just a run.',
    why: 'Resisted sprinting overloads the drive phase muscles — increasing sprint power through the principle of specific overload.',
        watchOut: [
      'Sprinting without a thorough warm-up, which is how hamstrings get pulled',
      'Straining the face, jaw and shoulders; stay relaxed above the waist',
      'Taking short recoveries, which turns a speed session into a conditioning one'
    ],
    load: 'Maximal effort, full recovery. Speed work needs freshness.',
    credits: 75
  },

  {
    id: 'saq-cone-weave',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Cone Weave',
    youtube: 'cone weave drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'hockey', 'basketball'],
    equipment: ['agility-cones'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    instructions: [
      'Set up 6 to 8 cones in a straight line, 1 metre apart',
      'Run a weaving path through the cones — curving tightly around each one',
      'Stay as close to each cone as possible without touching it',
      'Drive through the turns with the outside leg',
      'Run back in a straight line to recover',
      'Complete 6 reps'
    ],
    coaching: 'Eyes up, not on the cones. Looking ahead at the next cone allows faster path decisions.',
    why: 'The cone weave develops the curved running mechanics and hip mobility needed to navigate obstacles and opponents at speed.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 55
  },

  {
    id: 'saq-box-drill',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Box Drill',
    youtube: 'box drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'basketball', 'netball', 'hockey'],
    equipment: ['agility-cones'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'glutes', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Set up 4 cones in a 5-metre square',
      'Sprint the first side, shuffle the second side laterally, backpedal the third side, shuffle the fourth',
      'This combines all four movement directions in one drill',
      'Rest 60 seconds between reps',
      'Complete 4 reps in each direction'
    ],
    coaching: 'The transitions between movements are the challenge. The ability to change movement type without losing momentum is agility.',
    why: 'Combines sprinting, lateral movement, and backpedalling in one drill — the complete movement vocabulary of team sport defence.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 65
  },

  {
    id: 'saq-reaction-ball',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Reaction Ball Drill',
    youtube: 'reaction ball drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['cricket', 'tennis', 'badminton', 'football', 'basketball'],
    equipment: ['reaction-ball'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'ankle-foot'],
    contraindications: ['hamstring-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 300,
    perSide: false,
    instructions: [
      'Drop a reaction ball from chest height onto the floor',
      'React to its unpredictable bounce and catch it before the second bounce',
      'Progress to bouncing it off a wall and reacting to the irregular return',
      'Work in 30-second bursts with 30 seconds rest',
      'Complete 6 bursts'
    ],
    coaching: 'The point is the unpredictability. Standard balls are too predictable — the reaction ball is deliberately erratic.',
    why: 'Develops reactive speed — the ability to process visual information and respond with movement instantly. Directly relevant to racket sports and fielding.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 50
  },

  {
    id: 'saq-mirror-drill',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Mirror Drill',
    youtube: 'mirror drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'basketball', 'netball', 'tennis'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['full-body', 'glutes'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Stand facing a partner, about 1.5 metres apart',
      'One person leads — moving laterally, forward, or backward freely',
      'The other mirrors every movement as quickly as possible',
      'The leader should vary tempo — sometimes slow to bait, sometimes fast',
      'Work in 20-second rounds, switch roles',
      'Complete 6 rounds each role'
    ],
    coaching: 'The leader should stay low and use fakes — the mirror must not cross their feet. This is the closest thing to actual defensive situation in training.',
    why: 'Reactive agility training that mirrors the actual demands of individual defensive sport. Cannot be replicated by any cone drill because it involves genuine unpredictability.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 65
  },

  // ============================================
  // PRE-SPORT WARM-UP & COOL-DOWN SESSIONS (6 items)
  // ============================================

  {
    id: 'sport-warmup-general',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'General Pre-Sport Warm-Up',
    youtube: 'general pre-sport warm-up drill technique',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'netball', 'hockey', 'tennis', 'athletics'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'glutes-acute', 'lower-back-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 900,
    perSide: false,
    instructions: [
      'Easy jog: 3 minutes',
      'Leg swings forward and back: 15 each side',
      'Leg swings lateral: 15 each side',
      'Hip circles: 10 each direction each side',
      'Walking lunges with rotation: 10 reps',
      'High knees: 2 × 20 metres',
      'Butt kicks: 2 × 20 metres',
      'A-skips: 2 × 20 metres',
      'Lateral shuffles: 2 × 10 metres each way',
      'Build-up runs: 3 × 40 metres at increasing effort (60%, 75%, 85%)'
    ],
    coaching: 'This warm-up sequence has been developed over decades by athletic trainers. Do not skip any component — the order matters.',
    why: 'A systematic pre-sport warm-up reduces injury risk, improves neuromuscular activation, and prepares the cardiovascular system for competition effort.',
        watchOut: [
      'Moving faster than you can control, which turns mobility work into momentum',
      'Forcing range rather than working to the edge of what is comfortable',
      'Holding the breath during the harder positions',
      'Any sharp or pinching sensation: back off the range rather than pushing through'
    ],
    load: 'Bodyweight. Range comes from repetition over weeks, not from forcing it today.',
    credits: 50
  },

  {
    id: 'sport-warmup-lower-body',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Lower Body Activation Warm-Up',
    youtube: 'lower body activation warm-up drill technique',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics', 'basketball', 'hockey'],
    equipment: [],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['glutes', 'hip', 'quadriceps', 'hamstring'],
    contraindications: ['hamstring-acute', 'glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Glute bridges: 15 reps',
      'Clamshells: 15 each side',
      'Band walks lateral: 2 × 10 metres (if band available)',
      'Single-leg balance: 30 seconds each side',
      'Bodyweight squats: 15 reps with a pause at the bottom',
      'Walking lunges: 10 each side',
      'Single-leg deadlift: 10 each side (bodyweight)',
      'Build-up jog to sprint over 30 metres'
    ],
    coaching: 'This warm-up specifically activates the glutes and hip stabilisers before loading the lower body. Particularly important for runners and footballers.',
    why: 'Glute and hip activation before lower body sport reduces ACL injury risk and improves performance quality by ensuring the primary power muscles are firing correctly.',
        watchOut: [
      'Moving faster than you can control, which turns mobility work into momentum',
      'Forcing range rather than working to the edge of what is comfortable',
      'Holding the breath during the harder positions',
      'Any sharp or pinching sensation: back off the range rather than pushing through'
    ],
    load: 'Bodyweight. Range comes from repetition over weeks, not from forcing it today.',
    credits: 45
  },

  {
    id: 'sport-warmup-upper-body',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Upper Body Activation Warm-Up',
    youtube: 'upper body activation warm-up drill technique',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['tennis', 'badminton', 'swimming', 'cricket', 'rowing'],
    equipment: [],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['shoulder', 'upper-back', 'rotator-cuff'],
    contraindications: [],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Arm circles: 10 forward, 10 back',
      'Shoulder packing: 10 reps',
      'Band pull-apart: 15 reps (if band available)',
      'External rotation: 15 each side',
      'Wall slides: 10 reps',
      'Prone Y-T-W: 8 reps',
      'Thoracic rotation from hands and knees: 10 each side',
      'Light shadow swings or throws: 20 reps at 50%, 10 at 75%'
    ],
    coaching: 'Throwing and striking sports put exceptional demand on the rotator cuff. This warm-up is not optional — it is injury prevention.',
    why: 'Upper body sport creates shoulder impingement risk when the rotator cuff and scapular stabilisers are not activated before loading. This sequence addresses that directly.',
        watchOut: [
      'Moving faster than you can control, which turns mobility work into momentum',
      'Forcing range rather than working to the edge of what is comfortable',
      'Holding the breath during the harder positions',
      'Any sharp or pinching sensation: back off the range rather than pushing through'
    ],
    load: 'Bodyweight. Range comes from repetition over weeks, not from forcing it today.',
    credits: 45
  },

  {
    id: 'sport-cooldown-general',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'General Post-Sport Cool-Down',
    youtube: 'general post-sport cool-down drill technique',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'stretch',
    sportRelevance: ['football', 'rugby', 'basketball', 'netball', 'hockey', 'tennis', 'athletics'],
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'glutes-acute', 'lower-back-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 900,
    perSide: false,
    instructions: [
      'Easy walk or jog: 3 minutes to bring heart rate down',
      'Standing quad stretch: 30 seconds each side',
      'Standing calf stretch: 30 seconds each side',
      'Standing hamstring stretch — forward fold: 45 seconds',
      'Hip flexor lunge stretch: 30 seconds each side',
      'Upper trap stretch: 30 seconds each side',
      'Chest opener arms behind: 30 seconds',
      'Supine twist: 30 seconds each side',
      'Lie flat for 2 minutes — allow heart rate to fully return to resting'
    ],
    coaching: 'The cool-down is not optional and it is not about flexibility. It is about returning the body to homeostasis safely and reducing next-day stiffness.',
    why: 'A structured cool-down reduces post-exercise blood pooling, removes metabolic waste from muscles, and begins the recovery process that enables the next session.',
        watchOut: [
      'Bouncing into the stretch rather than holding it still',
      'Pushing to the point of pain; a stretch should feel like a strong pull, never sharp',
      'Holding your breath, which makes everything tighter',
      'Forcing the range on one side to match the other; sides are rarely equal'
    ],
    load: 'Bodyweight. Progress by holding longer, not by pushing harder.',
    credits: 35
  },

  {
    id: 'sport-cooldown-running',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Post-Run Cool-Down Routine',
    youtube: 'post-run cool-down routine drill technique',
    category: 'recovery',
    contentType: 'practice',
    movementPattern: 'stretch',
    sportRelevance: ['athletics', 'football', 'rugby'],
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'calves', 'hip-flexor', 'lower-back'],
    contraindications: ['hamstring-acute', 'lower-back-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 600,
    perSide: false,
    instructions: [
      'Walk for 3 minutes to cool down',
      'Calf stretch against wall: 30 seconds each side — straight leg, then bent knee',
      'Standing hamstring stretch: 45 seconds',
      'Hip flexor lunge stretch: 30 seconds each side',
      'IT band stretch: 30 seconds each side',
      'Seated glute stretch: 30 seconds each side',
      'Lower back QL stretch: 30 seconds each side',
      'Supine knees to chest: 30 seconds'
    ],
    coaching: 'The legs most need attention after running — these target the exact muscles most stressed. Do not skip the calf and Achilles stretch.',
    why: 'Running creates cumulative tightness in the posterior chain and hip flexors. A targeted post-run stretch routine reduces the risk of overuse injury across training weeks.',
        watchOut: [
      'Bouncing into the stretch rather than holding it still',
      'Pushing to the point of pain; a stretch should feel like a strong pull, never sharp',
      'Holding your breath, which makes everything tighter',
      'Forcing the range on one side to match the other; sides are rarely equal'
    ],
    load: 'Bodyweight. Progress by holding longer, not by pushing harder.',
    credits: 35
  },

  {
    id: 'sport-session-football-conditioning',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Football Conditioning Session',
    youtube: 'football conditioning session drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'hamstring-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 2400,
    perSide: false,
    instructions: [
      'Warm-up: general pre-sport warm-up routine — 10 minutes',
      'Cone weave × 4 reps',
      'Lateral shuffle 5-10-5 × 4 reps',
      'Sprint build-ups 10 metres × 6 reps',
      'Mirror drill × 4 rounds each role (with partner)',
      'Defensive slide × 3 sets of 30 seconds',
      'Acceleration 10m × 6 reps',
      'Cool-down: post-sport cool-down — 10 minutes'
    ],
    coaching: 'This is a conditioning session, not tactical training. Focus on movement quality throughout — fatigue is expected in the later drills.',
    why: 'A complete football-specific conditioning session that develops all the physical qualities the sport demands: speed, agility, lateral movement, and reactive ability.',
        watchOut: [
      'Form degrading in the later rounds to keep pace',
      'Rest periods creeping longer than the session asks',
      'Going maximal in round one, which makes every round after it slower'
    ],
    load: 'Hard but repeatable. The last round should look like the first.',
    credits: 120
  },

  // ============================================
  // SPORT-SPECIFIC DRILLS (8 items)
  // ============================================

  {
    id: 'drill-sprint-build-up',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Sprint Build-Up — Sport Prep',
    youtube: 'sprint build-up - sport prep drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics', 'hockey', 'cricket'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 300,
    perSide: false,
    instructions: [
      'Find 60 metres of flat space',
      'Run the first 20 metres at 60% effort',
      'The next 20 metres at 80% effort',
      'The final 20 metres at 95% effort',
      'Walk back to the start — full recovery, at least 90 seconds',
      'Complete 4 to 6 reps'
    ],
    coaching: 'This is the ideal pre-sport sprint preparation — the body reaches near-maximum velocity by the end without the injury risk of a standing-start sprint.',
    why: 'Prepares the neuromuscular system for maximum velocity running without the explosive start demands that risk hamstring strain when cold.',
        watchOut: [
      'Sprinting without a thorough warm-up, which is how hamstrings get pulled',
      'Straining the face, jaw and shoulders; stay relaxed above the waist',
      'Taking short recoveries, which turns a speed session into a conditioning one'
    ],
    load: 'Maximal effort, full recovery. Speed work needs freshness.',
    credits: 55
  },

  {
    id: 'drill-cutting-movement',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Cutting Drill',
    youtube: 'cutting drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'netball'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['glutes', 'ankle-foot', 'quadriceps'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 300,
    perSide: true,
    instructions: [
      'Sprint forward 5 metres',
      'Plant the outside foot hard — knee bent, body low',
      'Cut sharply 90 degrees and sprint 5 metres in the new direction',
      'The plant foot should not slide — drive off it explosively',
      'Practise cutting left and cutting right equally',
      'Complete 8 reps each direction with full recovery'
    ],
    coaching: 'The quality of the cut is entirely determined by the plant foot. A solid, angled plant at low body height allows maximum force transfer.',
    why: 'Cutting is the most common athletic movement in team sports and one of the most common sites of knee injury. Practising it correctly builds both performance and safety.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 70
  },

  {
    id: 'drill-zig-zag-run',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Zig-Zag Run',
    youtube: 'zig-zag run drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'hockey', 'basketball'],
    equipment: ['agility-cones'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    instructions: [
      'Set up 6 cones in a zig-zag pattern — 2 metres apart and 2 metres offset from each other',
      'Sprint through the zig-zag, cutting tightly around each cone',
      'Stay low through the cuts — do not stand up between cones',
      'Walk back to recover',
      'Complete 6 reps, aiming to beat your time on each rep'
    ],
    coaching: 'Approach each cone from the outside to create room for the cut. Approaching straight gives you no space to plant and turn.',
    why: 'Develops multi-directional speed and the ability to combine acceleration with quick change-of-direction — the fundamental athletic skill of most field sports.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 60
  },

  {
    id: 'drill-backpedal-turn',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Backpedal and Turn Drill',
    youtube: 'backpedal and turn drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'athletics'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['glutes', 'hamstring', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    instructions: [
      'Backpedal for 5 metres — stay low and controlled',
      'At the cone, rotate and sprint forward for 10 metres',
      'The rotation should be a single, explosive plant-and-turn',
      'Alternate turning left and turning right on each rep',
      'Complete 6 reps each direction with 30 seconds rest'
    ],
    coaching: 'The transition from backpedal to forward sprint is where most people lose time. Practice the rotation separately before adding the run.',
    why: 'Develops the backpedal-to-sprint transition — essential in football, rugby, and basketball for defenders tracking through balls or reacting to breaks.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 60
  },

  {
    id: 'drill-dot-drill',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Dot Drill',
    youtube: 'dot drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['basketball', 'badminton', 'tennis', 'netball'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['ankle-foot', 'calves', 'quadriceps'],
    contraindications: ['ankle-foot-acute', 'knee-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    instructions: [
      'Mark 5 spots on the floor in an X pattern — like the 5 on a dice',
      'Jump from spot to spot in the following patterns: forward-back, lateral, X, single-leg',
      'Keep jumps small and quick — this is about foot speed, not height',
      'Complete 1 minute of continuous jumping per pattern',
      'Rest 30 seconds between patterns'
    ],
    coaching: 'Land on the ball of the foot and immediately spring to the next position. Flat-footed landings kill the drill.',
    why: 'Develops foot speed, ankle stability, and the reactive ground contact ability needed for court sports and rapid-change activities.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 55
  },

  {
    id: 'drill-partner-chase',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Partner Chase Drill',
    youtube: 'partner chase drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'athletics'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'knee-acute', 'ankle-foot-acute'],
    energyRequired: 9,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    instructions: [
      'Partner A starts 2 metres ahead of Partner B',
      'On a signal, Partner A sprints — Partner B tries to catch them over 20 metres',
      'Rest 2 minutes',
      'Switch roles and repeat',
      'Complete 4 reps each role'
    ],
    coaching: 'Being chased produces maximum effort that no solo sprint drill can replicate. Competitive sprinting is what actually develops speed.',
    why: 'Competitive chase drills produce maximal sprint effort through the psychological drive of competition — unmatched by any solo drill for developing actual speed.',
        watchOut: [
      'Sprinting without a thorough warm-up, which is how hamstrings get pulled',
      'Straining the face, jaw and shoulders; stay relaxed above the waist',
      'Taking short recoveries, which turns a speed session into a conditioning one'
    ],
    load: 'Maximal effort, full recovery. Speed work needs freshness.',
    credits: 80
  },

  {
    id: 'drill-change-of-pace',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Change of Pace Run',
    youtube: 'change of pace run drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics', 'hockey'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 300,
    perSide: false,
    instructions: [
      'Run at 50% effort — easy jogging pace',
      'Without any outward signal, accelerate suddenly to 90% effort for 10 metres',
      'Drop back to 50% immediately',
      'Vary the timing and duration of each surge — no rhythm, no predictability',
      'Continue for 3 minutes, rest 90 seconds',
      'Complete 4 sets'
    ],
    coaching: 'The surprise in your own body is the point. Training for sudden acceleration without predictable lead-in is how you replicate match demands.',
    why: 'Develops the ability to accelerate at unpredictable moments — the defining physical skill for forwards and wingers in team sports.',
        watchOut: [
      'Sprinting without a thorough warm-up, which is how hamstrings get pulled',
      'Straining the face, jaw and shoulders; stay relaxed above the waist',
      'Taking short recoveries, which turns a speed session into a conditioning one'
    ],
    load: 'Maximal effort, full recovery. Speed work needs freshness.',
    credits: 65
  },

  {
    id: 'drill-defensive-footwork',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Defensive Footwork Circuit',
    youtube: 'defensive footwork circuit drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['basketball', 'netball', 'football', 'tennis'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['glutes', 'adductors', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 600,
    perSide: false,
    instructions: [
      'Defensive slide: 10 metres each way × 3 sets',
      'Drop step and sprint: plant and explode backward × 8 reps',
      'Close-out run: sprint 5 metres to a cone, stop suddenly × 6 reps',
      'Lateral mirror drill with partner: 4 × 20 seconds',
      'Rest 60 seconds between each exercise'
    ],
    coaching: 'Defensive footwork is the most undertrained athletic skill in recreational sport. Most players practise attacking — defenders win games.',
    why: 'A complete defensive footwork session developing the sliding, closing out, and reactive movement that characterises quality individual defence in court sports.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 80
  }


  ,

  // ============================================
  // SPORT CONDITIONING — EXPANSION Batch 24a (20 items)
  // Strength-endurance circuits, power endurance, sport warm-up sequences
  // ============================================

  {
    id: 'circuit-amrap-bodyweight',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'AMRAP Bodyweight Circuit',
    youtube: 'amrap bodyweight circuit drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'general-fitness'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'shoulder-acute', 'hamstring-acute', 'glutes-acute', 'lower-back-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 1200,
    perSide: false,
    instructions: [
      'Set a timer for 20 minutes',
      'Complete as many rounds as possible (AMRAP) of:',
      '10 press-ups',
      '15 bodyweight squats',
      '10 mountain climbers each side',
      '20 jumping jacks',
      'Record total rounds for future comparison',
      'Rest only when absolutely necessary'
    ],
    coaching: 'The AMRAP format is self-regulating — you go as hard as you can sustain for the full time. Pacing is a skill worth developing.',
    why: 'AMRAP circuits develop strength-endurance and cardiovascular fitness simultaneously. The time-based format is highly motivating and provides a measurable benchmark.',
        watchOut: [
      'Form degrading in the later rounds to keep pace',
      'Rest periods creeping longer than the session asks',
      'Going maximal in round one, which makes every round after it slower'
    ],
    load: 'Hard but repeatable. The last round should look like the first.',
    credits: 90
  },

  {
    id: 'circuit-emom-strength',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'EMOM Strength Circuit',
    youtube: 'emom strength circuit drill technique',
    category: 'strength',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['general-fitness', 'football', 'rugby'],
    equipment: [],
    equipmentOptional: ['kettlebell', 'dumbbell'],
    affectsAreas: ['full-body'],
    contraindications: ['lower-back-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 1200,
    perSide: false,
    instructions: [
      'Every Minute On the Minute (EMOM) for 20 minutes:',
      'Minute 1: 10 press-ups',
      'Minute 2: 10 squats',
      'Minute 3: 10 hip hinges or kettlebell swings',
      'Minute 4: 10 rows or pull-ups',
      'The remaining time in each minute is rest',
      'As fitness improves, add reps to reduce rest'
    ],
    coaching: 'EMOM trains you to work and then fully recover within a time constraint — exactly what team sport demands.',
    why: 'EMOM format develops work capacity within defined time windows, building the ability to produce repeated high-quality efforts — a key quality for team sport athletes.',
        watchOut: [
      'Letting form slip in the last rounds to stay on the clock — better to reduce reps and keep the quality',
      'Choosing a rep count that leaves no recovery within the minute',
      'Continuing when the movement quality has clearly gone'
    ],
    load: 'Choose a load you could complete cleanly for two more rounds than the session asks for.',
    credits: 80
  },

  {
    id: 'sport-conditioning-tabata',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Tabata — Sport Conditioning',
    youtube: 'tabata - sport conditioning drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'basketball', 'hockey', 'athletics'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 9,
    difficultyLevel: 3,
    duration: 900,
    perSide: false,
    instructions: [
      'Warm up for 5 minutes',
      'Work: 20 seconds of maximum effort',
      'Rest: 10 seconds',
      'Repeat 8 times — this is one Tabata round (4 minutes total)',
      'Use: sprint, squat jumps, burpees, or bike sprints',
      'Rest 2 minutes between rounds',
      'Complete 2 to 4 rounds depending on fitness level'
    ],
    coaching: 'Genuine Tabata requires genuine maximum effort. The 10-second rest is deliberately insufficient for full recovery — that is the design, not a flaw.',
    why: 'The Tabata protocol, developed by Dr Izumi Tabata, is one of the most researched HIIT formats. Produces VO2 max improvements comparable to far longer moderate-intensity sessions.',
        watchOut: [
      'Form degrading in the later rounds to keep pace',
      'Rest periods creeping longer than the session asks',
      'Going maximal in round one, which makes every round after it slower'
    ],
    load: 'Hard but repeatable. The last round should look like the first.',
    credits: 90
  },

  {
    id: 'power-endurance-circuit',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Power Endurance Circuit',
    youtube: 'power endurance circuit drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['rugby', 'football', 'hockey', 'athletics'],
    equipment: [],
    equipmentOptional: ['medicine-ball'],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'shoulder-acute'],
    energyRequired: 9,
    difficultyLevel: 3,
    duration: 1800,
    perSide: false,
    instructions: [
      'Complete 5 rounds of the following with 90 seconds rest between rounds:',
      '3 × broad jumps',
      '5 × explosive press-ups',
      '3 × box jumps',
      '5 × med ball slams',
      '10 × sprint build-up over 15 metres',
      'Each exercise is performed at maximum power — not endurance pace'
    ],
    coaching: 'Power endurance means maintaining power output over repeated efforts. The goal is that rep 15 looks like rep 1. That is hard to achieve and worth pursuing.',
    why: 'Power endurance is the quality that separates fit athletes from powerful ones — the ability to repeat explosive actions throughout a match, not just in the first 10 minutes.',
        watchOut: [
      'Form degrading in the later rounds to keep pace',
      'Rest periods creeping longer than the session asks',
      'Going maximal in round one, which makes every round after it slower'
    ],
    load: 'Hard but repeatable. The last round should look like the first.',
    credits: 110
  },

  {
    id: 'repeated-sprint-ability',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Repeated Sprint Ability (RSA)',
    youtube: 'repeated sprint ability rsa drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'hockey', 'basketball'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute'],
    energyRequired: 9,
    difficultyLevel: 3,
    duration: 1200,
    perSide: false,
    instructions: [
      'Sprint 30 metres at maximum effort',
      'Walk back to the start — approximately 20 seconds',
      'Sprint again immediately',
      'Repeat 10 times — total of 10 maximum sprints',
      'Record the time of each sprint',
      'The goal is minimal drop-off between sprint 1 and sprint 10'
    ],
    coaching: 'Most people can sprint fast once. RSA tests whether you can do it repeatedly with short recovery. The drop-off between first and last sprint is the measure.',
    why: 'Repeated sprint ability is the defining physical quality of team sport — the ability to maintain near-maximal sprint speed across a full game, not just early on.',
        watchOut: [
      'Form degrading in the later rounds to keep pace',
      'Rest periods creeping longer than the session asks',
      'Going maximal in round one, which makes every round after it slower'
    ],
    load: 'Hard but repeatable. The last round should look like the first.',
    credits: 100
  },

  {
    id: 'conditioning-beep-test',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Beep Test Simulation',
    youtube: 'beep test simulation drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics', 'basketball'],
    equipment: ['agility-cones'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'knee-acute'],
    energyRequired: 9,
    difficultyLevel: 3,
    duration: 1200,
    perSide: false,
    instructions: [
      'Mark two lines 20 metres apart',
      'Run between the lines, arriving before each bleep — start at a slow pace',
      'The pace increases every minute',
      'Continue until you can no longer reach the line before the bleep',
      'Record your level and shuttle number',
      'Use a beep test app for accurate timing'
    ],
    coaching: 'The beep test is a brutal but honest measure of aerobic fitness. The final levels feel impossible — that is by design.',
    why: 'The Multi-Stage Fitness Test (beep test) is the most widely used aerobic fitness assessment in team sport. Provides a reliable VO2 max estimate and a benchmark for training.',
        watchOut: [
      'Setting off far ahead of the beep in the early levels and wasting energy',
      'Attempting a maximal test without a full warm-up',
      'Continuing past the point where turning becomes uncontrolled'
    ],
    load: 'Maximal for the test. Pace the early levels rather than racing them.',
    credits: 100
  },

  {
    id: 'yoyo-intermittent',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Yo-Yo Intermittent Recovery',
    youtube: 'yo-yo intermittent recovery drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'hockey'],
    equipment: ['agility-cones'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'knee-acute'],
    energyRequired: 9,
    difficultyLevel: 3,
    duration: 1200,
    perSide: false,
    instructions: [
      'Mark lines at 0, 5 and 20 metres',
      'Run from 0 to 20 metres and back — following audio signals',
      'After each 40-metre shuttle, walk 5 metres and back (10 metres) during the 10-second recovery',
      'The pace increases progressively',
      'Continue until unable to complete the recovery walk before the next bleep',
      'Record your score'
    ],
    coaching: 'The Yo-Yo IR1 is the most sport-specific aerobic test because the recovery period mirrors the demands of team sport better than a continuous beep test.',
    why: 'Developed by Dr Jens Bangsbo, the Yo-Yo intermittent test specifically assesses the ability to perform repeated high-intensity work with active recovery — directly reflecting team sport physiology.',
        watchOut: [
      'Form degrading in the later rounds to keep pace',
      'Rest periods creeping longer than the session asks',
      'Going maximal in round one, which makes every round after it slower'
    ],
    load: 'Hard but repeatable. The last round should look like the first.',
    credits: 100
  },

  {
    id: 'drill-speed-ladder-advanced',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Speed Ladder — Advanced Patterns',
    youtube: 'speed ladder - advanced patterns drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'basketball', 'athletics', 'tennis'],
    equipment: ['agility-ladder'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'ankle-foot'],
    contraindications: ['ankle-foot-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 900,
    perSide: false,
    instructions: [
      'Complete 3 reps of each pattern with 30 seconds rest:',
      'Single leg — hop through each rung on right foot only, then left',
      'Lateral single leg — sideways through ladder on one foot',
      'Ali shuffle — two feet in, two feet out laterally while moving forward',
      'Crossover — step across the body with alternating feet',
      'Staggered — one foot in each rung but offset, creating a stagger pattern'
    ],
    coaching: 'Advanced ladder patterns require accuracy at speed. Master each pattern slowly before adding pace. Accuracy always precedes speed.',
    why: 'Advanced ladder patterns develop complex coordination, foot speed, and the neuromuscular variety needed for unpredictable sport movements.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 65
  },

  {
    id: 'conditioning-small-sided-game',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Small-Sided Game Conditioning',
    youtube: 'small-sided game conditioning drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'hockey', 'basketball'],
    equipment: ['agility-cones'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 1800,
    perSide: false,
    instructions: [
      'Mark a small playing area — approximately 20 × 30 metres for 3v3',
      'Play 4-minute bouts with 2-minute active rest',
      'Complete 4 to 6 bouts',
      'The small pitch forces constant high-intensity movement',
      'Can be adapted for any team sport — adjust pitch size to player number'
    ],
    coaching: 'Small-sided games produce higher intensity than most formal training drills because competitive instinct drives effort that instruction cannot replicate.',
    why: 'Small-sided games are the most sport-specific conditioning tool available — developing fitness, decision-making, and technical skills simultaneously in realistic conditions.',
        watchOut: [
      'Playing competitively enough that the conditioning intent disappears',
      'Uncontrolled changes of direction as fatigue builds',
      'Playing on a surface that does not suit the footwear'
    ],
    load: 'Effort only. Keep the intensity high and the movements controlled.',
    credits: 100
  },

  {
    id: 'conditioning-max-aerobic-speed',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Max Aerobic Speed Intervals',
    youtube: 'max aerobic speed intervals drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics'],
    equipment: [],
    equipmentOptional: ['agility-cones'],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 2400,
    perSide: false,
    instructions: [
      'Determine your MAS (Maximum Aerobic Speed) — the pace you can maintain for about 6 minutes flat out',
      'Warm up: 10 minutes easy',
      'Run at 100% MAS for 30 seconds',
      'Rest for 30 seconds',
      'Repeat 15 to 20 times',
      'Cool down: 10 minutes easy'
    ],
    coaching: 'MAS training is more sophisticated than simple interval training because it trains at the specific intensity that maximises aerobic adaptation.',
    why: 'MAS interval training is the most research-supported method for rapidly improving VO2 max and running economy in team sport athletes.',
        watchOut: [
      'Form degrading in the later rounds to keep pace',
      'Rest periods creeping longer than the session asks',
      'Going maximal in round one, which makes every round after it slower'
    ],
    load: 'Hard but repeatable. The last round should look like the first.',
    credits: 95
  },

  {
    id: 'sport-warmup-dynamic-full',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dynamic Warm-Up — Full Session',
    youtube: 'dynamic warm-up - full session drill technique',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'athletics', 'basketball', 'hockey'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'glutes-acute', 'lower-back-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 1200,
    perSide: false,
    instructions: [
      '1. Jog easy × 3 minutes',
      '2. High knees × 2 × 20m',
      '3. Butt kicks × 2 × 20m',
      '4. A-skip × 2 × 20m',
      '5. Lateral shuffle × 2 × 10m each way',
      '6. Carioca × 2 × 20m each way',
      '7. Backward jog × 2 × 20m',
      '8. World\'s greatest stretch × 5 each side',
      '9. Leg swings forward/back × 15 each',
      '10. Leg swings lateral × 15 each',
      '11. Build-up runs × 4 × 50m at 60%, 70%, 80%, 90%'
    ],
    coaching: 'This is a 20-minute warm-up used by professional sports teams worldwide. Every minute of it reduces injury risk and improves performance quality.',
    why: 'A complete dynamic warm-up that progressively increases tissue temperature, activates neuromuscular pathways, and rehearses sport-specific movement patterns before loading.',
        watchOut: [
      'Moving faster than you can control, which turns mobility work into momentum',
      'Forcing range rather than working to the edge of what is comfortable',
      'Holding the breath during the harder positions',
      'Any sharp or pinching sensation: back off the range rather than pushing through'
    ],
    load: 'Bodyweight. Range comes from repetition over weeks, not from forcing it today.',
    credits: 55
  },

  {
    id: 'drill-carioca',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Carioca',
    youtube: 'carioca drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'athletics', 'tennis'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip', 'adductors', 'ankle-foot'],
    contraindications: ['ankle-foot-acute', 'knee-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    instructions: [
      'Move sideways to the right — step the left foot in front of the right',
      'Step the right foot to the side',
      'Step the left foot behind the right',
      'Step the right foot to the side',
      'This creates a crossing pattern: in front, side, behind, side',
      'Hips rotate with each crossover step',
      'Complete 4 × 20 metres each direction'
    ],
    coaching: 'The hip rotation through each crossover is the key element. Keeping the hips square defeats the purpose of the drill.',
    why: 'The carioca develops hip rotation speed and lateral coordination — movements fundamental to creating separation from opponents in most team sports.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 50
  },

  {
    id: 'drill-backpedal',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Backpedal',
    youtube: 'backpedal drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball', 'athletics'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hamstring', 'ankle-foot'],
    contraindications: ['achilles-acute', 'knee-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    instructions: [
      'Stand in athletic position facing forward',
      'Step backward with one foot, then the other — in a controlled running motion',
      'Stay low — hips bent, weight on balls of feet',
      'Arms stay relaxed and active',
      'Gradually increase speed',
      'Complete 4 × 20 metres with 30 seconds rest'
    ],
    coaching: 'Most people backpedal with their hips too high. Stay in a partial squat position — it feels awkward but is faster and more reactive.',
    why: 'The backpedal is a specific skill used by defenders in football, rugby, and basketball. Develops the posterior chain in a different movement pattern to forward running.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 45
  },

  {
    id: 'plyometric-med-ball-circuit',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Medicine Ball Power Circuit',
    youtube: 'medicine ball power circuit drill technique',
    category: 'strength',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['rugby', 'football', 'athletics', 'cricket'],
    equipment: ['medicine-ball'],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['shoulder-acute', 'lower-back-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 1200,
    perSide: false,
    instructions: [
      'Complete 3 rounds of the following with 90 seconds rest:',
      'Slam × 10',
      'Chest pass against wall × 10',
      'Rotational throw × 8 each side',
      'Overhead throw forward × 6',
      'Squat and press × 10',
      'Move through each exercise with minimal rest between'
    ],
    coaching: 'Medicine ball work develops rotational and multi-planar power that barbells cannot access. The unpredictable ball rebound also trains reactive catching.',
    why: 'Medicine ball circuits develop total body power across multiple planes — essential for throwing, striking, and contact sports where force is rarely applied in a single direction.',
        watchOut: [
      'Landing or catching with locked joints',
      'Using a ball heavy enough to slow the movements down',
      'Continuing when speed has dropped; this is a power session, not a conditioning one'
    ],
    load: 'Light ball. Speed is the training effect.',
    credits: 100
  },

  {
    id: 'conditioning-10-20-30',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: '10-20-30 Running Protocol',
    youtube: '10-20-30 running protocol drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['athletics', 'football', 'rugby'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 1800,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy running',
      'Run 30 seconds at low pace (50%)',
      'Run 20 seconds at moderate pace (70%)',
      'Run 10 seconds at maximum effort (100%)',
      'This is one block (1 minute total)',
      'Rest 2 minutes after every 5 blocks',
      'Complete 3 to 4 sets of 5 blocks',
      'Cool down: 10 minutes easy'
    ],
    coaching: 'The protocol is named backward — 10 seconds of max effort is the key interval. The preceding 30 and 20 seconds create fatigue that makes the 10-second sprint more effective.',
    why: "The 10-20-30 protocol has strong research support from Bangsbo's group — produces significant VO2 max improvements and running economy gains in a time-efficient format.",
        watchOut: [
      'Form degrading in the later rounds to keep pace',
      'Rest periods creeping longer than the session asks',
      'Going maximal in round one, which makes every round after it slower'
    ],
    load: 'Hard but repeatable. The last round should look like the first.',
    credits: 90
  },

  {
    id: 'strength-endurance-circuit',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Strength-Endurance Circuit',
    youtube: 'strength-endurance circuit drill technique',
    category: 'strength',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['rugby', 'football', 'rowing', 'athletics'],
    equipment: ['dumbbell'],
    equipmentOptional: ['kettlebell'],
    affectsAreas: ['full-body'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 1800,
    perSide: false,
    instructions: [
      'Complete 4 rounds of the following without rest between exercises:',
      '10 dumbbell deadlifts',
      '10 dumbbell push press',
      '10 dumbbell rows each side',
      '10 goblet squats',
      '15 press-ups',
      'Rest 2 minutes between rounds',
      'Use moderate weight — challenging but not grinding'
    ],
    coaching: 'Strength-endurance uses moderate loads at higher volumes. The cardiovascular demand comes from the combination of exercises rather than aerobic pacing.',
    why: 'Strength-endurance is the quality underpinning all contact sport — the ability to maintain force output repeatedly over time. Bridges the gap between pure strength and cardio training.',
        watchOut: [
      'Form degrading in the final rounds',
      'Rest periods creeping longer, which changes what the session trains',
      'Going heavy; this is an endurance circuit and the weight should reflect that'
    ],
    load: 'Considerably lighter than a strength session. You should finish each round tired rather than close to failing.',
    credits: 100
  },

  {
    id: 'sport-specific-speed-ladder',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Sport-Specific Ladder Warm-Up',
    youtube: 'sport-specific ladder warm-up drill technique',
    category: 'mobility',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'basketball', 'tennis', 'athletics'],
    equipment: ['agility-ladder'],
    equipmentOptional: [],
    affectsAreas: ['ankle-foot', 'calves', 'hip'],
    contraindications: ['ankle-foot-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 600,
    perSide: false,
    instructions: [
      'Two feet in each rung — forward: 3 lengths',
      'One foot in each rung: 3 lengths',
      'Lateral shuffle through: 3 lengths each way',
      'In-out (both feet in, both out to side): 2 lengths each way',
      'High knees through: 2 lengths',
      'Single leg through on right: 2 lengths',
      'Single leg through on left: 2 lengths'
    ],
    coaching: 'Use this as a warm-up before any court or field sport session. The variety of patterns activates different movement systems than jogging alone.',
    why: 'A structured ladder warm-up activates fast-twitch fibres, ankle stability mechanisms, and coordination pathways that a standard jog does not reach.',
        watchOut: [
      'Moving faster than you can control, which turns mobility work into momentum',
      'Forcing range rather than working to the edge of what is comfortable',
      'Holding the breath during the harder positions',
      'Any sharp or pinching sensation: back off the range rather than pushing through'
    ],
    load: 'Bodyweight. Range comes from repetition over weeks, not from forcing it today.',
    credits: 45
  },

  {
    id: 'conditioning-vo2-intervals',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'VO2 Max Intervals',
    youtube: 'vo2 max intervals drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['athletics', 'cycling', 'rowing', 'football', 'rugby'],
    equipment: [],
    equipmentOptional: ['exercise-bike', 'rowing-machine'],
    affectsAreas: ['full-body'],
    contraindications: ['heart-condition'],
    energyRequired: 9,
    difficultyLevel: 3,
    duration: 2400,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy with 3 build-ups',
      'Work interval: 4 to 5 minutes at the hardest pace you can sustain for that duration',
      'Recovery: 3 to 4 minutes easy',
      'Repeat 4 to 5 times',
      'Cool down: 10 minutes easy'
    ],
    coaching: 'Genuine VO2 max intervals require sustained discomfort. The final minute of each work interval should feel very hard. If it does not, you are working below the required intensity.',
    why: 'Long intervals at VO2 max intensity produce the greatest aerobic adaptations available. Used by serious athletes across all endurance sports.',
        watchOut: [
      'Form degrading in the later rounds to keep pace',
      'Rest periods creeping longer than the session asks',
      'Going maximal in round one, which makes every round after it slower'
    ],
    load: 'Hard but repeatable. The last round should look like the first.',
    credits: 100
  },

  {
    id: 'drill-drop-step',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Drop Step',
    youtube: 'drop step drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'basketball', 'rugby'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 180,
    perSide: true,
    instructions: [
      'Stand in athletic position facing forward',
      'Step one foot back and to the outside — opening the hip',
      'This drops the body into a position facing diagonally',
      'From there, accelerate in the direction the step opened',
      'The drop step is a pivot and go — not two separate movements',
      'Complete 8 reps each side with full recovery'
    ],
    coaching: 'The drop step should look like one movement, not two. The pivot and the first step into acceleration are simultaneous.',
    why: 'The drop step is the primary first movement for a defender turning to track a player running behind them — fundamental to all chasing and recovery run situations.',
        watchOut: [
      'Planting on a straight leg when changing direction, which is where knees get hurt',
      'Going full speed before the movement pattern is comfortable at half speed',
      'Doing these on a slippery or uneven surface',
      'Continuing when tired; agility work is where fatigue turns into injury'
    ],
    load: 'Bodyweight only. Quality of movement over number of reps.',
    credits: 55
  },

  {
    id: 'conditioning-high-low',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'High-Low Conditioning',
    youtube: 'high-low conditioning drill technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    sportRelevance: ['football', 'rugby', 'basketball'],
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 1800,
    perSide: false,
    instructions: [
      'Alternate between high-intensity (sprint, jumping) and low-intensity (jog, walk) work',
      'Session structure: 3 minutes moderate, 30 seconds maximum effort, 2 minutes easy',
      'Repeat 6 to 8 times',
      'The transition between intensities is deliberately abrupt — like changing pace in a match',
      'Cool down: 10 minutes easy'
    ],
    coaching: 'High-low conditioning trains the ability to recover from a sprint while still moving — a physiological demand that steady-state cardio never addresses.',
    why: 'Replicates the intermittent nature of team sport — sustained periods of moderate activity punctuated by high-intensity bursts. More sport-specific than continuous running.',
        watchOut: [
      'Form degrading in the later rounds to keep pace',
      'Rest periods creeping longer than the session asks',
      'Going maximal in round one, which makes every round after it slower'
    ],
    load: 'Hard but repeatable. The last round should look like the first.',
    credits: 90
  }

];
