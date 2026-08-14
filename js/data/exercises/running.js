/**
 * data/exercises/running.js
 * 11 Aug 2026 v2
 *
 * v2 - CON-9. watchOut and load added to all 35 entries including the full C25K programme. Written to the Exercise
 *   Entry Standard: name the error AND its correction, describe what it
 *   feels like rather than only what it looks like, no fear language, no
 *   shame, and pain is always a plain stop. Load is effort-relative
 *   throughout, never an absolute weight (Locked Principle P4).
 *
 * 10 Aug 2026 v1
 *
 * v1 — First version header on this file. Added tailored YouTube search
 *   terms to all 35 exercises (previously zero coverage, database-wide
 *   461-exercise pass, Graeme's direct request: "we get the most up to
 *   date versions and avoid any issue with discontinued or old videos"
 *   — search terms, not direct links, matching the reasoning exactly).
 *
 * Running — C25K programme sessions, 5K performance, 10K/endurance, drills
 * contentType: 'practice' for full sessions, 'exercise' for drills
 *
 * Batch 15: C25K (10) + 5K performance (10) + drills (8) + endurance (8) = 36 items
 */

export const RUNNING = [

  // ============================================
  // C25K — COUCH TO 5K PROGRAMME SESSIONS
  // Phase-structured. Each session is one workout.
  // energyRequired: 4–6. Condition blocks: hamstring-acute, achilles, shin-splints.
  // ============================================

  {
    id: 'c25k-week1',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'C25K — Week 1 Session',
    youtube: 'couch to 5k week 1 running plan',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 1800,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes of brisk walking',
      'Run for 60 seconds at a comfortable jogging pace',
      'Walk for 90 seconds',
      'Repeat the 60s run / 90s walk cycle 8 times',
      'Cool down: 5 minutes of easy walking',
      'Total time: approximately 30 minutes'
    ],
    coaching: 'If you can hold a conversation while running, you are at the right pace. If you cannot, slow down. There is no minimum speed — only forward movement.',
    why: 'The first week of C25K introduces the run-walk pattern at the lowest ratio. Builds aerobic base and running habit without overloading tendons and joints.',
        watchOut: [
      'Running the run portions faster than you can repeat in the later intervals',
      'Skipping ahead a week because one session felt easy; the weeks build tissue tolerance, not just fitness',
      'Running through sharp pain in the shin, knee or Achilles rather than stopping',
      'Doing sessions on back-to-back days rather than leaving a rest day between'
    ],
    load: 'Effort only. The running should be conversational -- if you cannot speak, you are running too fast.',
    credits: 60
  },

  {
    id: 'c25k-week2',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'C25K — Week 2 Session',
    youtube: 'couch to 5k week 2 running plan',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 1800,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes of brisk walking',
      'Run for 90 seconds',
      'Walk for 2 minutes',
      'Repeat 6 times',
      'Cool down: 5 minutes of easy walking',
      'Total time: approximately 30 minutes'
    ],
    coaching: 'Slightly longer run intervals than week 1. Your legs may feel heavier on the second or third run — that is normal and will pass.',
    why: 'Increases run interval duration while keeping total run time manageable. The body begins adapting to the pattern of aerobic stress and recovery.',
        watchOut: [
      'Running the run portions faster than you can repeat in the later intervals',
      'Skipping ahead a week because one session felt easy; the weeks build tissue tolerance, not just fitness',
      'Running through sharp pain in the shin, knee or Achilles rather than stopping',
      'Doing sessions on back-to-back days rather than leaving a rest day between'
    ],
    load: 'Effort only. The running should be conversational -- if you cannot speak, you are running too fast.',
    credits: 60
  },

  {
    id: 'c25k-week3',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'C25K — Week 3 Session',
    youtube: 'couch to 5k week 3 running plan',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 1800,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes of brisk walking',
      'Run 90 seconds, walk 90 seconds',
      'Run 3 minutes, walk 3 minutes',
      'Repeat the full cycle once more',
      'Cool down: 5 minutes of easy walking'
    ],
    coaching: 'The 3-minute run is the first real challenge. Break it into smaller mental chunks — run to that lamppost, then the next. The walk after is earned.',
    why: 'Introduces the first sustained 3-minute run interval — a significant step up from the 60–90 second intervals of weeks 1 and 2.',
        watchOut: [
      'Running the run portions faster than you can repeat in the later intervals',
      'Skipping ahead a week because one session felt easy; the weeks build tissue tolerance, not just fitness',
      'Running through sharp pain in the shin, knee or Achilles rather than stopping',
      'Doing sessions on back-to-back days rather than leaving a rest day between'
    ],
    load: 'Effort only. The running should be conversational -- if you cannot speak, you are running too fast.',
    credits: 65
  },

  {
    id: 'c25k-week4',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'C25K — Week 4 Session',
    youtube: 'couch to 5k week 4 running plan',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 2100,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes of brisk walking',
      'Run 3 minutes, walk 90 seconds',
      'Run 5 minutes, walk 2.5 minutes',
      'Run 3 minutes, walk 90 seconds',
      'Run 5 minutes',
      'Cool down: 5 minutes of easy walking'
    ],
    coaching: 'Week 4 is where many people struggle. If the 5-minute runs feel too much, repeat week 3 — there is no rush and no schedule to keep.',
    why: 'Builds the 5-minute continuous run — a landmark in building aerobic capacity. The body is now adapting significantly to running loads.',
        watchOut: [
      'Running the run portions faster than you can repeat in the later intervals',
      'Skipping ahead a week because one session felt easy; the weeks build tissue tolerance, not just fitness',
      'Running through sharp pain in the shin, knee or Achilles rather than stopping',
      'Doing sessions on back-to-back days rather than leaving a rest day between'
    ],
    load: 'Effort only. The running should be conversational -- if you cannot speak, you are running too fast.',
    credits: 70
  },

  {
    id: 'c25k-week5-day1',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'C25K — Week 5, Session 1',
    youtube: 'couch to 5k week 5 running plan',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 2100,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes of brisk walking',
      'Run 5 minutes, walk 3 minutes',
      'Run 5 minutes, walk 3 minutes',
      'Run 5 minutes',
      'Cool down: 5 minutes of easy walking'
    ],
    coaching: 'Three 5-minute runs with rest. You have already done 5 minutes — now you do it three times with breaks. Trust that.',
    why: 'Consolidates the 5-minute run as a repeatable effort — preparing for the jump to continuous running later in the week.',
        watchOut: [
      'Running the run portions faster than you can repeat in the later intervals',
      'Skipping ahead a week because one session felt easy; the weeks build tissue tolerance, not just fitness',
      'Running through sharp pain in the shin, knee or Achilles rather than stopping',
      'Doing sessions on back-to-back days rather than leaving a rest day between'
    ],
    load: 'Effort only. The running should be conversational -- if you cannot speak, you are running too fast.',
    credits: 70
  },

  {
    id: 'c25k-week5-day3',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'C25K — Week 5, Session 3 (20-Minute Run)',
    youtube: 'couch to 5k week 5 day 3 20 minute run',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 1800,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes of brisk walking',
      'Run continuously for 20 minutes — no walking breaks',
      'Cool down: 5 minutes of easy walking',
      'Do not check the time during the run — trust the effort'
    ],
    coaching: 'This is the biggest psychological leap in C25K. Run slower than you think you need to. You are not racing — you are building the proof that you can do it.',
    why: 'The first continuous 20-minute run. A landmark moment in every runner\'s journey — the aerobic base is now sufficient to sustain effort without walking.',
        watchOut: [
      'Running the run portions faster than you can repeat in the later intervals',
      'Skipping ahead a week because one session felt easy; the weeks build tissue tolerance, not just fitness',
      'Running through sharp pain in the shin, knee or Achilles rather than stopping',
      'Doing sessions on back-to-back days rather than leaving a rest day between'
    ],
    load: 'Effort only. The running should be conversational -- if you cannot speak, you are running too fast.',
    credits: 80
  },

  {
    id: 'c25k-week6',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'C25K — Week 6 Session',
    youtube: 'couch to 5k week 6 running plan',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 2100,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes of brisk walking',
      'Run 10 minutes, walk 3 minutes',
      'Run 10 minutes',
      'Cool down: 5 minutes of easy walking'
    ],
    coaching: 'After the 20-minute run of week 5, this session reintroduces a walk break — use it deliberately as a recovery tool, not a failure.',
    why: 'Builds total running volume while giving the legs a mid-session recovery. Sets up the push toward 25-minute continuous running.',
        watchOut: [
      'Running the run portions faster than you can repeat in the later intervals',
      'Skipping ahead a week because one session felt easy; the weeks build tissue tolerance, not just fitness',
      'Running through sharp pain in the shin, knee or Achilles rather than stopping',
      'Doing sessions on back-to-back days rather than leaving a rest day between'
    ],
    load: 'Effort only. The running should be conversational -- if you cannot speak, you are running too fast.',
    credits: 75
  },

  {
    id: 'c25k-week7',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'C25K — Week 7 Session (25-Minute Run)',
    youtube: 'couch to 5k week 7 running plan',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 2100,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes of brisk walking',
      'Run continuously for 25 minutes',
      'Cool down: 5 minutes of easy walking'
    ],
    coaching: 'You have already run 20 minutes. Five more is very achievable. The first few minutes always feel hardest — get through them and the body settles.',
    why: 'Extends continuous running to 25 minutes — building both aerobic capacity and the mental resilience to sustain sustained effort.',
        watchOut: [
      'Running the run portions faster than you can repeat in the later intervals',
      'Skipping ahead a week because one session felt easy; the weeks build tissue tolerance, not just fitness',
      'Running through sharp pain in the shin, knee or Achilles rather than stopping',
      'Doing sessions on back-to-back days rather than leaving a rest day between'
    ],
    load: 'Effort only. The running should be conversational -- if you cannot speak, you are running too fast.',
    credits: 80
  },

  {
    id: 'c25k-week8',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'C25K — Week 8 Session (28-Minute Run)',
    youtube: 'couch to 5k week 8 running plan',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 2280,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes of brisk walking',
      'Run continuously for 28 minutes',
      'Cool down: 5 minutes of easy walking'
    ],
    coaching: 'Three minutes from a 5K. You are now a runner — this is maintenance, not training.',
    why: 'The final preparation before the 30-minute graduation run. Running 28 minutes demonstrates that the aerobic base is fully established.',
        watchOut: [
      'Running the run portions faster than you can repeat in the later intervals',
      'Skipping ahead a week because one session felt easy; the weeks build tissue tolerance, not just fitness',
      'Running through sharp pain in the shin, knee or Achilles rather than stopping',
      'Doing sessions on back-to-back days rather than leaving a rest day between'
    ],
    load: 'Effort only. The running should be conversational -- if you cannot speak, you are running too fast.',
    credits: 85
  },

  {
    id: 'c25k-week9',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'C25K — Week 9, Graduation Run (30 Minutes)',
    youtube: 'couch to 5k graduation run week 9',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'calves', 'quadriceps'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 2400,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes of brisk walking',
      'Run continuously for 30 minutes',
      'Cool down: 5 minutes of easy walking',
      'You have completed C25K'
    ],
    coaching: 'Whatever pace, whatever distance — 30 continuous minutes of running is the goal and the achievement. You started from the beginning and got here.',
    why: 'The graduation run of C25K. Running 30 minutes continuously is the evidence that a sustainable running habit has been built from scratch.',
        watchOut: [
      'Running the run portions faster than you can repeat in the later intervals',
      'Skipping ahead a week because one session felt easy; the weeks build tissue tolerance, not just fitness',
      'Running through sharp pain in the shin, knee or Achilles rather than stopping',
      'Doing sessions on back-to-back days rather than leaving a rest day between'
    ],
    load: 'Effort only. The running should be conversational -- if you cannot speak, you are running too fast.',
    credits: 100
  },

  // ============================================
  // 5K PERFORMANCE SESSIONS (10 items)
  // For post-C25K runners building pace and efficiency
  // ============================================

  {
    id: 'run-easy-20',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Easy Run — 20 Minutes',
    youtube: 'easy run pace guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 1200,
    perSide: false,
    instructions: [
      'Run for 20 minutes at a fully conversational pace',
      'You should be able to speak in full sentences throughout',
      'If you cannot, slow down',
      'Focus on relaxed running form — soft landing, upright posture',
      'No targets, no pressure — this is recovery running'
    ],
    coaching: 'Easy runs should feel almost too easy. Most runners go too fast on their easy days and too slow on their hard days. Resist the temptation.',
    why: 'Easy running builds aerobic base and promotes recovery without additional stress. About 80% of all running should be at this effort level.',
        watchOut: [
      'Running faster than easy pace, which is the most common training mistake there is',
      'Checking pace constantly rather than running by feel',
      'Skipping the walk at the end and stopping dead'
    ],
    load: 'Easy means you could hold a full conversation. If you could not, it was not easy.',
    credits: 50
  },

  {
    id: 'run-tempo-20',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Tempo Run — 20 Minutes',
    youtube: 'tempo run pacing guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 1800,
    perSide: false,
    instructions: [
      'Warm up: 5 minutes easy running',
      'Run for 20 minutes at tempo pace — comfortably hard',
      'You should be able to speak 3 to 4 words but not hold a conversation',
      'This is about 70 to 80% of maximum effort',
      'Cool down: 5 minutes easy running'
    ],
    coaching: 'Tempo pace is the most misunderstood effort level. Too hard and it becomes an interval session. Too easy and it is just a run. Aim for sustained discomfort, not suffering.',
    why: 'Tempo running raises the lactate threshold — the effort level at which fatigue accumulates. Improves race pace and overall running economy.',
        watchOut: [
      'Starting at 5K pace rather than tempo pace, so the last third falls apart',
      'Skipping the warm-up, which is where tempo sessions go wrong',
      'Pushing through tightening calves'
    ],
    load: 'Comfortably hard. You could speak a short sentence, not a paragraph.',
    credits: 75
  },

  {
    id: 'run-intervals-400m',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: '400m Intervals × 6',
    youtube: '400m interval training technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 2400,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy running',
      'Run 400 metres (one lap of a track, or roughly 2 minutes) at hard effort — about 85 to 90%',
      'Walk or jog slowly for 90 seconds',
      'Repeat 6 times',
      'Cool down: 10 minutes easy running'
    ],
    coaching: 'Start conservatively — if you go too hard on rep 1 you will struggle to finish 6. All 6 reps should feel approximately equal in effort.',
    why: 'Short intervals build speed and VO2 max. 400m is the classic interval distance — short enough to go hard, long enough to build aerobic capacity.',
        watchOut: [
      'Going too fast on the first two and fading badly',
      'Cutting the recovery short to feel tougher',
      'Continuing when your form has clearly deteriorated'
    ],
    load: 'Hard but repeatable. All six should be within a few seconds of each other.',
    credits: 90
  },

  {
    id: 'run-intervals-800m',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: '800m Intervals × 4',
    youtube: '800m interval training technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 2700,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy running',
      'Run 800 metres (two laps, or roughly 4 minutes) at hard but sustained effort — about 80 to 85%',
      'Jog slowly for 2 minutes',
      'Repeat 4 times',
      'Cool down: 10 minutes easy running'
    ],
    coaching: 'Harder to pace than 400s — the temptation is to start like a 400. Hold back in the first half of each rep and let the effort build.',
    why: 'Longer intervals develop sustained speed — the ability to run fast for longer. Directly transfers to 5K and 10K performance.',
        watchOut: [
      'Starting faster than you can hold for the full 800',
      'Standing still during recovery rather than jogging',
      'Adding extra reps because you feel good; save it for next week'
    ],
    load: 'Hard but even. If the last one is much slower, the first was too fast.',
    credits: 90
  },

  {
    id: 'run-fartlek-25',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Fartlek Run — 25 Minutes',
    youtube: 'fartlek training explained',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 1500,
    perSide: false,
    instructions: [
      'Run continuously for 25 minutes',
      'Mix up your effort spontaneously throughout — no set structure',
      'Pick a lamppost and sprint to it, then recover',
      'Run hard up a hill, easy down',
      'Surge for 30 seconds, float for 2 minutes',
      'Play — there is no wrong way to do a fartlek'
    ],
    coaching: 'Fartlek means "speed play" in Swedish. The absence of structure is the point — it trains your body to change gears and makes running fun.',
    why: 'Builds both aerobic base and speed in one session. The unstructured format also improves the ability to respond to race surges and changes of pace.',
        watchOut: [
      'Making every surge maximal, which turns it into an interval session',
      'Not recovering enough between surges',
      'Choosing surges so long the effort collapses'
    ],
    load: 'Vary the effort deliberately. Play is the point.',
    credits: 70
  },

  {
    id: 'run-progression',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Progression Run — 30 Minutes',
    youtube: 'progression run pacing guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 1800,
    perSide: false,
    instructions: [
      'Start at easy conversational pace for the first 10 minutes',
      'Increase to a comfortably hard pace for minutes 10 to 20',
      'Run at near-tempo effort for the final 10 minutes',
      'Each third should feel noticeably harder than the last',
      'Cool down with 5 minutes walking'
    ],
    coaching: 'The key is genuine progression — not just saying you progressed. Each phase should feel like a gear change.',
    why: 'Progression runs teach the body to run efficiently when fatigued. They also build mental resilience by requiring you to push harder when tired.',
        watchOut: [
      'Starting too fast, leaving nowhere to progress to',
      'Making the jumps between sections too large',
      'Finishing flat out; the last section should be strong, not maximal'
    ],
    load: 'Each section a little quicker than the last, finishing strong rather than empty.',
    credits: 70
  },

  {
    id: 'run-hills',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Hill Repeat Session',
    youtube: 'hill repeats running technique',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'glutes', 'calves'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute', 'glutes-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 2400,
    perSide: false,
    instructions: [
      'Find a hill with a 30 to 45 second effort to the top',
      'Warm up: 10 minutes easy running on flat',
      'Run hard to the top — drive the arms, shorten the stride',
      'Walk or jog back to the bottom for recovery',
      'Repeat 8 to 10 times',
      'Cool down: 10 minutes easy running'
    ],
    coaching: 'Hills are speed work in disguise — they force good form and build strength without the impact of flat sprinting. Your legs will know tomorrow.',
    why: 'Hill running builds leg strength, power, and cardiovascular capacity simultaneously. One of the most efficient training sessions available.',
        watchOut: [
      'Sprinting the first repeat and struggling from the second',
      'Running hard down the hill, which is where the impact and the injuries are',
      'Leaning forward from the waist rather than driving from the hips'
    ],
    load: 'Hard on the way up, easy jog or walk on the way down.',
    credits: 90
  },

  {
    id: 'run-strides',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Strides',
    youtube: 'running strides technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 600,
    perSide: false,
    instructions: [
      'After an easy run, or as a standalone warm-up, find a flat 100-metre stretch',
      'Accelerate smoothly over the first 30 metres to about 85 to 90% effort',
      'Hold that effort for 30 metres',
      'Decelerate smoothly over the final 40 metres',
      'Walk back slowly to recover',
      'Repeat 4 to 6 times'
    ],
    coaching: 'Strides are not sprints — they are smooth, controlled accelerations. Focus on form: tall posture, relaxed arms, quick feet.',
    why: 'Strides teach the neuromuscular system to run fast without accumulating fatigue. Used by elite runners as a regular session finisher to maintain speed.',
        watchOut: [
      'Sprinting flat out rather than building smoothly',
      'Tensing the shoulders and jaw at speed',
      'Doing strides cold without a warm-up'
    ],
    load: 'Build to around ninety percent, relaxed rather than straining.',
    credits: 50
  },

  {
    id: 'run-parkrun',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Parkrun Effort — 5K Race Simulation',
    youtube: 'parkrun race pacing guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 1800,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy running plus 2 to 3 strides',
      'Run 5 kilometres at race effort — this should feel genuinely hard',
      'First kilometre: hold back slightly — do not go off too fast',
      'Middle 3K: settle into your sustainable hard effort',
      'Final kilometre: if you have anything left, use it here',
      'Cool down: 10 minutes easy walking or jogging'
    ],
    coaching: 'A parkrun is not a race against others — it is a race against your own best. The community atmosphere makes it easier to push. Use that.',
    why: 'Race simulation trains the specific effort, pacing decisions, and psychological demands of a 5K. Nothing prepares you for racing like practising racing.',
        watchOut: [
      'Setting off in the crowd faster than your own pace',
      'Racing every week rather than a few times a season',
      'Skipping the warm-up because of the start time'
    ],
    load: 'Race effort. Hard, controlled, and ideally even across the distance.',
    credits: 100
  },

  {
    id: 'run-5k-time-trial',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: '5K Time Trial',
    youtube: '5k time trial pacing guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 9,
    difficultyLevel: 3,
    duration: 2100,
    perSide: false,
    instructions: [
      'Warm up: 15 minutes easy running plus 4 strides',
      'Run 5K as fast as you can — ideally on a measured, flat route',
      'Record your time',
      'Do not go out too hard — start 5 to 10 seconds per km slower than target pace',
      'Cool down: 10 minutes easy walking'
    ],
    coaching: 'The time trial is a data point, not a verdict. Run it every 6 to 8 weeks to track progress. Conditions vary — compare similar days.',
    why: 'A solo 5K time trial provides an honest baseline and a motivation anchor. Watching the time come down is one of the most satisfying feedback loops in running.',
        watchOut: [
      'Going out too fast in the first kilometre, which is the classic 5K error',
      'Doing this without a full warm-up',
      'Racing when already tired from the week'
    ],
    load: 'Maximal for the distance, evenly paced.',
    credits: 100
  },

  // ============================================
  // RUNNING DRILLS & TECHNIQUE (8 items)
  // Done before or after easy runs — 10–15 minutes total
  // ============================================

  {
    id: 'run-drill-butt-kicks',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Butt Kicks',
    youtube: 'butt kicks running drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'calves'],
    contraindications: ['hamstring-acute', 'knee-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Run slowly, flicking each heel up toward your glutes with each step',
      'Keep the knees pointing down — not forward',
      'Arms pump normally',
      'The movement is in the lower leg only — the thigh stays vertical',
      'Complete 3 × 20-metre lengths or 3 × 20-second bursts'
    ],
    coaching: 'Most people do butt kicks wrong — they bring the knee forward instead of the heel back. The knee should stay under the hip.',
    why: 'Trains hamstring recovery — the phase of the running stride where the foot travels back toward the glute. Improves stride efficiency.',
        watchOut: [
      'Leaning forward at the waist',
      'Kicking with the lower leg only rather than cycling the whole leg',
      'Heavy landings'
    ],
    load: 'Bodyweight only.',
    credits: 30
  },

  {
    id: 'run-drill-a-skip',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'A-Skip',
    youtube: 'a-skip running drill tutorial',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip-flexor', 'calves', 'glutes'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Skip forward, driving one knee up to hip height with each skip',
      'The skipping action is a single skip (one bounce) between each knee drive',
      'Land on the ball of the foot and drive off immediately',
      'Pump opposite arms to legs',
      'Move forward at a moderate pace',
      'Complete 3 × 20-metre lengths'
    ],
    coaching: 'The A-skip looks simple but requires coordination. Start slow and focus on the knee drive height rather than speed.',
    why: 'The A-skip is the fundamental running drill — it trains the upward drive phase of the running stride in an exaggerated, isolated form.',
        watchOut: [
      'Rushing so the skip becomes a run',
      'Landing flat-footed',
      'Losing the tall posture as you tire'
    ],
    load: 'Bodyweight only.',
    credits: 35
  },

  {
    id: 'run-drill-b-skip',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'B-Skip',
    youtube: 'b-skip running drill tutorial',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'hip-flexor', 'calves'],
    contraindications: ['hamstring-acute', 'knee-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 60,
    perSide: false,
    instructions: [
      'Begin like an A-skip — drive the knee up',
      'At the top of the knee drive, extend the lower leg forward (kick out)',
      'Then drive the foot down and back onto the floor — pawing the ground',
      'This creates a cycle: up, out, down, back',
      'Move forward with single skips between each cycle',
      'Complete 3 × 20-metre lengths'
    ],
    coaching: 'Harder than it looks. Do A-skips until they are comfortable before adding the B-skip extension. The pawing action is the whole point.',
    why: 'Adds the forward extension and backward pawing action to the A-skip — training the complete running stride cycle in an exaggerated, teachable form.',
        watchOut: [
      'Attempting this before the A-skip is comfortable',
      'Reaching the leg out rather than cycling it through',
      'Losing rhythm and turning it into a stumble'
    ],
    load: 'Bodyweight only.',
    credits: 40
  },

  {
    id: 'run-drill-bounding',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Bounding',
    youtube: 'bounding running drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'calves', 'hamstring'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Run with an exaggerated, powerful stride',
      'Drive off each foot with maximum force — aim for height and distance',
      'Float in the air for a moment between ground contacts',
      'Arms pump powerfully in opposition to the legs',
      'Land softly on the ball of the foot and immediately drive into the next bound',
      'Complete 3 × 20-metre lengths with full recovery between'
    ],
    coaching: 'Bounding is plyometric — it is hard on tendons and joints. Only add it when easy running is fully pain-free.',
    why: 'Develops explosive power and elasticity in the running stride. Transfers directly to speed and running economy. Used by all serious runners.',
        watchOut: [
      'Bounding for distance before you can land under control',
      'Landing on a straight leg',
      'Doing these when already tired'
    ],
    load: 'Bodyweight only.',
    credits: 50
  },

  {
    id: 'run-drill-cadence',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Cadence Drill',
    youtube: 'running cadence drill technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 600,
    perSide: false,
    instructions: [
      'Run at easy pace on flat ground',
      'Count how many times your right foot hits the ground in 30 seconds — multiply by 4 for cadence',
      'Optimal cadence is 170 to 180 steps per minute for most runners',
      'If below 160, work on shortening your stride slightly and quickening your turnover',
      'Run for 5 minutes while consciously working on maintaining a faster turnover',
      'Check cadence again at the end'
    ],
    coaching: 'Higher cadence does not mean running faster — it means running more efficiently. Think quick, light feet rather than bigger steps.',
    why: 'Low cadence (slow turnover) is a primary cause of overstriding and running injury. Cadence work is one of the most impactful technique changes available.',
        watchOut: [
      'Shortening the stride so much you stop moving forward',
      'Tensing the upper body to hit the rhythm',
      'Chasing a number rather than a feel'
    ],
    load: 'Effort only.',
    credits: 35
  },

  {
    id: 'run-drill-stride-outs',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Stride-Outs',
    youtube: 'stride outs running technique',
    category: 'cardio',
    contentType: 'exercise',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 600,
    perSide: false,
    instructions: [
      'After an easy warm-up, find 80 to 100 metres of flat space',
      'Accelerate smoothly over the first third — building to 90% effort',
      'Hold that effort through the middle third',
      'Relax and float through the final third',
      'Walk back to the start',
      'Complete 4 to 6 stride-outs, focusing on running tall and smooth'
    ],
    coaching: 'Stride-outs are not about maximum speed — they are about running fast while staying relaxed. If you feel tight, you are trying too hard.',
    why: 'Activates the fast-twitch muscle fibres before a workout or race and reinforces good running mechanics at speed.',
        watchOut: [
      'Accelerating too abruptly rather than building',
      'Straining the face, jaw and shoulders',
      'Doing these without warming up first'
    ],
    load: 'Build to fast and relaxed, not maximal.',
    credits: 45
  },

  // ============================================
  // 10K & ENDURANCE SESSIONS (8 items)
  // ============================================

  {
    id: 'run-easy-30',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Easy Run — 30 Minutes',
    youtube: 'easy run pace guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 1800,
    perSide: false,
    instructions: [
      'Run for 30 minutes at a fully conversational pace',
      'You should feel like you could run for much longer at this effort',
      'Focus on relaxed form throughout — especially in the final 10 minutes when fatigue builds',
      'No targets, no splits — just 30 minutes of easy movement'
    ],
    coaching: 'The 30-minute easy run is the backbone of any running programme. Most training benefits come from easy running — not from pushing every session.',
    why: 'Builds aerobic base, promotes recovery, and develops running economy. The most important session in any runner\'s week.',
        watchOut: [
      'Drifting up to moderate pace without noticing',
      'Running this the day after a hard session without checking how the legs feel',
      'Ignoring a niggle because the pace is gentle'
    ],
    load: 'Easy means conversational throughout.',
    credits: 60
  },

  {
    id: 'run-tempo-30',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Tempo Run — 30 Minutes',
    youtube: 'tempo run pacing guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 2400,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy running',
      'Run for 20 minutes at a comfortably hard, sustained pace',
      'Cool down: 10 minutes easy running'
    ],
    coaching: 'A 20-minute tempo block is demanding. If the pace slips in the last 5 minutes, you started too fast. Aim for even splits or a slight negative split.',
    why: 'A longer tempo block raises the lactate threshold more significantly than shorter efforts — the primary session for improving 10K performance.',
        watchOut: [
      'Running the tempo section too fast and fading',
      'Treating this as a race rather than a controlled effort',
      'Cutting the cool-down short'
    ],
    load: 'Comfortably hard and even. The last five minutes should feel like the first five.',
    credits: 80
  },

  {
    id: 'run-intervals-1k',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: '1K Intervals × 5',
    youtube: '1k interval training guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 8,
    difficultyLevel: 3,
    duration: 3000,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy running',
      'Run 1 kilometre at a hard, controlled effort — roughly 5K race pace',
      'Jog slowly for 2 minutes',
      'Repeat 5 times',
      'Cool down: 10 minutes easy running'
    ],
    coaching: 'The first rep always feels easy. Resist going hard too early — the fourth and fifth reps are where the session is won or lost.',
    why: '1K intervals develop the sustained speed needed for 10K racing. The slightly longer distance compared to 400s builds greater aerobic adaptation.',
        watchOut: [
      'Treating the first rep as a time trial',
      'Shortening the recovery jog',
      'Pushing on when form has gone'
    ],
    load: 'Hard but repeatable across all five.',
    credits: 95
  },

  {
    id: 'run-cruise-intervals',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Cruise Intervals',
    youtube: 'cruise intervals running guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute'],
    energyRequired: 7,
    difficultyLevel: 3,
    duration: 3000,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy running',
      'Run at tempo pace for 5 minutes',
      'Recover with 1 minute of easy jogging',
      'Repeat 4 times — 4 × 5 minutes at tempo with 1 minute recovery',
      'Cool down: 10 minutes easy running'
    ],
    coaching: 'Cruise intervals are tempo broken into chunks — the rest makes each rep slightly faster than a continuous tempo. Used when building toward longer tempo blocks.',
    why: 'Develops lactate threshold with slightly more rest than a continuous tempo — ideal for runners building toward their first 10K or half marathon.',
        watchOut: [
      'Running these at interval pace rather than cruise pace',
      'Taking longer recoveries than the session asks for',
      'Skipping the warm-up'
    ],
    load: 'Comfortably hard, closer to tempo than to sprinting.',
    credits: 85
  },

  {
    id: 'run-marathon-pace',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Marathon Pace Run — 40 Minutes',
    youtube: 'marathon pace training guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 2400,
    perSide: false,
    instructions: [
      'Warm up: 10 minutes easy running',
      'Run for 20 minutes at marathon pace — this should feel sustainable but not easy',
      'Marathon pace is roughly 60 to 70% effort — you can speak a sentence or two',
      'Cool down: 10 minutes easy running'
    ],
    coaching: 'If you do not know your marathon pace, use this rule: it should feel like you could hold it for 3 to 4 hours. Slower than you think.',
    why: 'Builds efficiency at race pace and familiarises the body with the metabolic demands of marathon effort.',
        watchOut: [
      'Running faster than goal pace because it feels easy early',
      'Skipping fuel and fluid on the longer efforts',
      'Ignoring a niggle at this duration'
    ],
    load: 'Steady and repeatable. Marathon pace should feel almost too comfortable at the start.',
    credits: 75
  },

  {
    id: 'run-long-60',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Long Run — 60 Minutes',
    youtube: 'long run pacing guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 3600,
    perSide: false,
    instructions: [
      'Run for 60 minutes at easy, conversational pace',
      'The entire run should be easy enough that you could add 10 minutes if needed',
      'Walk for 30 seconds any time you need to — this is not failure',
      'Hydrate before you start if the weather is warm',
      'Cool down with 5 minutes walking and some light stretching'
    ],
    coaching: 'The long run is about time on feet, not pace. It builds mental endurance as much as physical. Let your mind wander — it is part of the training.',
    why: 'The long run is the foundational session for half marathon and marathon training. Develops fat burning, mental endurance, and musculoskeletal resilience.',
        watchOut: [
      'Running this faster than easy pace',
      'Setting off without water or a plan for the route',
      'Increasing long-run distance by more than about ten percent a week'
    ],
    load: 'Easy and conversational throughout.',
    credits: 100
  },

  {
    id: 'run-long-slow-90',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Long Slow Run — 90 Minutes',
    youtube: 'long slow run pacing guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute'],
    energyRequired: 6,
    difficultyLevel: 2,
    duration: 5400,
    perSide: false,
    instructions: [
      'Run for 90 minutes at the slowest pace that still feels like running',
      'Walk intervals of 1 to 2 minutes are expected and encouraged past 60 minutes',
      'Focus on completing the time — distance is irrelevant',
      'Take nutrition on board after 60 minutes if needed',
      'Allow a full rest day the day after'
    ],
    coaching: 'Very few recreational runners do a 90-minute run. If you do it once every 2 to 3 weeks, you will be better prepared for race day than most people at the start line.',
    why: 'The 90-minute long run is the primary training stimulus for half marathon and marathon endurance. Depletes glycogen stores and forces fat adaptation.',
        watchOut: [
      'Running faster than easy, which turns a long run into a hard session',
      'Going without fuel or fluid',
      'Jumping to this distance without building up to it'
    ],
    load: 'Easy. The distance is the stimulus, not the pace.',
    credits: 120
  },

  {
    id: 'run-back-to-back',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Back-to-Back Run Days',
    youtube: 'back to back running days training guide',
    category: 'cardio',
    contentType: 'practice',
    movementPattern: 'locomotion',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: ['hamstring-acute', 'achilles-acute', 'shin-splints-acute', 'knee-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 2400,
    perSide: false,
    instructions: [
      'Day 1: Run for 40 minutes at easy pace',
      'Day 2 (following day): Run for 30 minutes at easy pace — on tired legs',
      'Day 2 should feel harder than normal even at the same effort level',
      'That difficulty is the training stimulus',
      'Keep both runs fully easy — no tempo or intervals on consecutive days'
    ],
    coaching: 'Running on tired legs is a specific training adaptation. It is uncomfortable and it should be. The discomfort tells you it is working.',
    why: 'Back-to-back runs simulate the fatigue of late-race miles. Used extensively in marathon training to build resilience to accumulated fatigue.',
        watchOut: [
      'Running the second day hard because the first felt fine',
      'Ignoring accumulated soreness',
      'Doing this pattern before your weekly mileage supports it'
    ],
    load: 'Both days easy. The point is time on tired legs, not intensity.',
    credits: 90
  }

];
