/**
 * data/exercises/rehabilitation.js
 * 13 Aug 2026 v6
 *
 * v6 - C1b batches 1 and 2. Hamstrings (15) and glutes (17) rewritten
 *   and re-rated. Copy approved by Graeme; do not paraphrase.
 *
 *   TWO BACKFILLS, not one. All 94 entries shared an identical
 *   four-line watchOut AND carried difficultyLevel: 1. The difficulty
 *   is the more serious of the two, because it defeats a safety net
 *   already in the codebase: _difficulty() (11 Aug) falls back to
 *   energyRequired when difficultyLevel is ABSENT, and these are not
 *   absent -- they are present and wrong, so the fallback never fires.
 *   Nordic Curl - Assisted read as difficulty 1 with energyRequired 5.
 *
 *   Difficulty is the capability ceiling: ceilingCap = 2 for somebody
 *   who cannot rise from a chair unaided, and WARMUP_MAX_DIFFICULTY = 4
 *   gates warm-ups. 94 entries claiming to be the easiest thing in the
 *   database, in the library most likely to reach people with the least
 *   capacity.
 *
 *   Copy format is Graeme's: what you might NOTICE, then what to TRY.
 *   A bare list of faults tells somebody what they did wrong; this
 *   tells them what to do about it.
 *
 *   62 entries still on the shared block. Batches 3-8 follow.
 *
 * 13 Aug 2026 v5
 *
 * v5 - C2. 61 of the 94 entries carry generalPurpose: true, approved by
 *   Graeme 13 Aug 2026 (alongside_c2_triage_13aug2026_v1.md). Absent
 *   means false, so a new entry stays condition-only until somebody
 *   decides otherwise.
 *
 *   Three promoted entries renamed to drop a clinical suffix the name no
 *   longer needs to carry -- `category` does the tagging. Bird Dog was
 *   NOT promoted: stripping "— Core Rehab" collided with the existing
 *   general `bird-dog` in strength.js, and that collision is the signal
 *   that the entry is redundant for anybody without a condition.
 *
 * 13 Aug 2026 v4
 *
 * v4 - C1. Three shared copy blocks rewritten across all 94
 *   entries. The old text assumed a clinician exists: "check with
 *   whoever is treating you", and framed everything as "rehabilitation",
 *   which reads as a diagnosis to somebody who has neither. Both were
 *   reaching people with no condition at all (see C2, still open).
 *
 *   External help is now OFFERED, never presumed. The wording has to
 *   work for somebody mid-physio, somebody who has never seen anyone,
 *   and somebody who cannot afford to -- the third is not hypothetical;
 *   it is in Graeme's own About copy, "I couldn't afford a physio".
 *
 *   NOT FIXED HERE, logged as C1b: all 94 entries still share ONE
 *   identical watchOut block. A generic "what to watch for" teaches
 *   nothing and trains people to stop reading the block, which costs
 *   the entries where it is specific. That is a content stream, not a
 *   build session.
 *
 * 10 Aug 2026 v3
 *
 * v3 — Added tailored YouTube search terms to all 94 exercises
 *   (previously zero coverage, database-wide 461-exercise pass,
 *   Graeme's direct request). One redundant term fixed post-insertion
 *   ("y-t-w exercise exercise technique" — name already ended in a
 *   word matching the suffix).
 *
 * v2 — Phase B, Home Nav & Conditions Redesign (core-session.js pool
 *   consolidation). Added sets/reps/holdSeconds/rest/cues/description
 *   fields to 10 records (clamshell-activation, glute-bridge-activation,
 *   glute-bridge-single-leg, pelvic-tilt, diaphragmatic-breathing-core,
 *   dead-bug-progression-3, mcgill-curl-up, side-plank-modified,
 *   dead-bug-progression-1, bird-dog-rehab) — additive only, no
 *   existing field changed. dead-bug-progression-1 and bird-dog-rehab
 *   confirmed as the correct, distinct targets for core-session.js's
 *   gentler rehab-pool variants of Dead Bug/Bird Dog, resolving an
 *   id-collision bug that existed in core-session.js's own private
 *   pool (see that file's v5 changelog for the full explanation).
 *   First version header on this file; added now.
 *
 * Rehabilitation and activation exercises — condition-specific, physio-informed
 * contentType: 'rehabilitation' or 'activation'
 * rehabPhase: 'acute' | 'subacute' | 'maintenance'
 *
 * Batch 2: Glute activation and rehabilitation (16 items)
 * Batch 3: Hamstring rehabilitation (15 items)
 */

export const REHABILITATION = [

  // ============================================
  // GLUTE ACTIVATION & REHABILITATION — Batch 2
  // ============================================

  {
    id: 'clamshell-activation',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Clamshell — Glute Activation',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'clamshell - glute activation exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute'],
    caution: ['glutes-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your side with hips stacked and knees bent at about 45°',
      'Keep your feet together throughout the movement',
      'Slowly rotate your top knee open toward the ceiling',
      'Stop when your hip starts to roll back — the range is small',
      'Pause for 1 second at the top, then lower with control',
      'Complete 15 reps, then turn over and repeat on the other side'
    ],
    coaching: 'Small and controlled beats big and sloppy every time. If you feel it burning in the side of your hip, it is working.',
    why: 'Activates gluteus medius — the hip stabiliser that protects your knees and lower back in every movement.',
        watchOut: [
      "If your top hip rolls backwards as the knee opens, you have gone past your range. Stop where the hips stay stacked — it will be a smaller movement than you expect",
      "If you feel it mostly in the front of your hip, you are lifting rather than rotating. Think about turning the thigh bone in the socket instead",
      "If your feet come apart, press the heels together and start again. The feet staying joined is what makes this work"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25,
    sets: 2,
    reps: "15 each side",
    holdSeconds: 2,
    rest: 30,
    description: "Lie on your side, hips and knees bent to 45 degrees. Keeping your feet together, lift your top knee as high as you can without your pelvis rolling back. Hold 2 seconds. Lower slowly.",
    cues: [
      "Your pelvis should not move — if it does, reduce the range",
      "The movement is from the hip, not the lower back",
      "Hold at the top — that is where the glute medius is working",
      "Place a hand on your hip to feel if it is rotating"
    ],
  },

  {
    id: 'clamshell-banded',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Banded Clamshell',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'banded clamshell exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: ['resistance-band'],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute', 'glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Loop a resistance band just above your knees',
      'Lie on your side, hips stacked, knees bent at 45°',
      'Press against the band as you open your top knee toward the ceiling',
      'Keep your feet together and hips from rolling',
      'Lower slowly — do not let the band snap back',
      'Complete 15 reps each side'
    ],
    coaching: 'Choose a band that makes the last 3 reps feel genuinely hard. Too easy means too light a band.',
    why: 'The resistance band increases gluteus medius activation compared to bodyweight alone — more effective for rehab and strength building.',
        watchOut: [
      "If the band snaps the knee shut on the way back, it is too strong for now. Use a lighter one and control the return",
      "If your hips are rocking to get the knee higher, the band is winning. Lighter band, smaller range",
      "If you feel it in your lower back, you have started using your spine to help. Reset your position and take less range"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'glute-bridge-activation',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Glute Bridge — Activation',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'glute bridge - activation exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: [],
    caution: ['hamstring-acute', 'glutes-acute', 'lower-back-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet flat on the floor hip-width apart',
      'Arms relaxed at your sides',
      'Squeeze your glutes, then press through your feet to lift your hips',
      'Drive hips up until your body forms a straight line from shoulders to knees',
      'Hold for 2 seconds at the top — really squeeze',
      'Lower slowly and repeat for 15 reps'
    ],
    coaching: 'The squeeze at the top is the whole point. If you rush past it, you are losing half the benefit.',
    why: 'Glute bridge directly activates the glutes and teaches the brain to use them — essential before any lower body workout.',
        watchOut: [
      "If you feel this mostly in your hamstrings, walk your feet slightly closer to your bottom and squeeze the glutes before you lift",
      "If your lower back arches at the top, you have lifted too far. Stop where your body makes a straight line from knee to shoulder, not higher",
      "If your feet slide away, you are pushing forward rather than down. Drive straight through the heels"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25,
    sets: 3,
    reps: "12",
    holdSeconds: 3,
    rest: 45,
    description: "Lie on your back, knees bent, feet flat. Push through both heels to lift your hips until your body forms a straight line from knees to shoulders. Squeeze the glutes at the top. Hold 3 seconds. Lower slowly.",
    cues: [
      "Drive through your heels — not your toes",
      "Squeeze the glutes hard at the top",
      "The 3-second hold is what makes this effective",
      "Lower slowly — do not drop your hips"
    ],
  },

  {
    id: 'glute-bridge-single-leg',
    position: 'floor',
    impact: false,
    balanceDemand: true,
    name: 'Single-Leg Glute Bridge',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'single-leg glute bridge exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'glutes',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: ['lower-back-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, knees bent, feet flat',
      'Lift your right foot off the floor, extending that leg straight',
      'Press through your left foot and squeeze your left glute to lift your hips',
      'Keep your hips level — do not let the unsupported side drop',
      'Hold for 2 seconds, lower with control',
      'Complete 10 reps, then switch legs'
    ],
    coaching: 'Hips staying level is the challenge. If they drop, go back to the two-legged version and build more strength first.',
    why: 'Single-leg work reveals and corrects side-to-side glute strength imbalances — important for runners and anyone with hip or knee pain.',
        watchOut: [
      "If the lifted hip drops, you have found the actual limit. Lower and reset rather than finishing the set crooked",
      "If your hamstring cramps, bring the working foot slightly closer in and squeeze the glute before lifting",
      "If you cannot keep the hips level at all yet, go back to the two-foot bridge for a few weeks. This is the harder version, not the next rep"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40,
    sets: 3,
    reps: "10 each side",
    holdSeconds: 2,
    rest: 45,
    description: "Lie on your back, one knee bent with foot flat. Extend the other leg straight. Drive through the planted heel to lift your hips — squeeze the glute hard at the top. Hold 2 seconds. Lower slowly.",
    cues: [
      "Level hips — the unsupported side will want to drop",
      "Squeeze the working glute, not just your hamstring",
      "The 2-second hold is where the strength develops",
      "Keep the core braced throughout"
    ],
  },

  {
    id: 'donkey-kick',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Donkey Kick',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'donkey kick exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-extension',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes'],
    contraindications: ['wrist-elbow-acute', 'glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Start on hands and knees, wrists under shoulders, knees under hips',
      'Keep your right knee bent at 90° throughout',
      'Lift your right leg, driving the heel toward the ceiling',
      'Stop when your hip is fully extended — do not arch your lower back',
      'Lower slowly and repeat',
      'Complete 15 reps each side'
    ],
    coaching: 'Think about pressing the ceiling with your heel, not just swinging the leg up. Your back should stay flat.',
    why: 'Isolates glute max with minimal load on other structures — ideal for glute rehab and activation.',
        watchOut: [
      "If your lower back arches to get the leg higher, stop lower. The range comes from the hip, and it is smaller than it looks",
      "If your hips rotate open, square them to the floor and take less height",
      "If your wrists ache, come down onto your forearms instead. The exercise is unaffected"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'fire-hydrant',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Fire Hydrant',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'fire hydrant exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['wrist-elbow-acute', 'hip-acute', 'glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Start on hands and knees, wrists under shoulders, knees under hips',
      'Keeping your knee bent, lift your right leg out to the side',
      'Raise until your thigh is parallel to the floor',
      'Keep your hips level and core engaged throughout',
      'Lower slowly and repeat',
      'Complete 15 reps each side'
    ],
    coaching: 'Keep your weight even through both hands. It wants to shift — resist it.',
    why: 'Works the gluteus medius from a different angle than clamshells — together they give full hip stabiliser coverage.',
        watchOut: [
      "If you are leaning away to lift higher, keep your weight even and accept a lower leg",
      "If the knee straightens as it rises, hold the 90 degree bend. A straight leg makes it a different exercise",
      "If you feel a pinch at the front of the hip, come down and shorten the range — that pinch is a signal, not something to work through"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'side-lying-hip-abduction',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Side-Lying Hip Abduction',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'side-lying hip abduction exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute', 'glutes-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your side, body in a straight line, head resting on your arm',
      'Keep your top leg straight and foot flexed',
      'Lift your top leg to about 45° — no higher',
      'Hold for 1 second at the top',
      'Lower slowly — do not let it drop',
      'Complete 15 reps, then switch sides'
    ],
    coaching: 'Toes pointing slightly down works the glutes harder. Toes up shifts more load to the hip flexors.',
    why: 'Directly targets the gluteus medius and minimus — essential for hip stability and IT band health.',
        watchOut: [
      "If you go above about 45 degrees, your back starts doing the work. Lower is better here",
      "If your toes are pointing at the ceiling, the leg has rolled. Turn it so the toes point forward, or slightly down",
      "If you feel it at the front of your hip rather than the side or back, roll slightly forward and lift less"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'resistance-band-walk-lateral',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Resistance Band Walk — Lateral',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'resistance band walk - lateral exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hip', 'quadriceps'],
    contraindications: ['knee-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Loop a resistance band just above your knees',
      'Stand with feet hip-width apart, slight squat position',
      'Step your right foot out to the side, then follow with your left',
      'Keep constant tension on the band — feet never come together',
      'Take 10 steps right, then 10 steps left — that is one set',
      'Complete 3 sets'
    ],
    coaching: 'Stay low throughout. Standing up straight makes it too easy and loses the glute engagement.',
    why: 'One of the most effective glute med exercises. Used in knee rehab, hip rehab, and as a warm-up before running and jumping.',
        watchOut: [
      "If your knees fall inward, the band has won. Lighter band, and push the knees out against it as you step",
      "If you have stood up out of the squat, sink back down. Standing tall takes the glutes out of it entirely",
      "If the trailing foot snaps in, slow down. Both feet should move under control, not just the leading one"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'monster-walk',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Monster Walk',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'monster walk exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hip', 'quadriceps'],
    contraindications: ['knee-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Loop a resistance band just above your knees or ankles',
      'Stand in a quarter-squat, feet shoulder-width apart',
      'Walk forward, stepping each foot out and forward at 45°',
      'Keep your knees tracking over your toes and pushing out against the band',
      'Walk 10 steps forward, then 10 steps back',
      'Complete 3 sets'
    ],
    coaching: 'This looks a bit silly but it is highly effective. The diagonal step pattern works the glutes from hip flexion and abduction together.',
    why: 'Trains the glutes to stabilise the hip and knee during walking and running movements — exactly what they need to do in sport.',
        watchOut: [
      "If your knees track inward as you step, lighter band, wider stance",
      "If you are walking normally with a band on, exaggerate the outward angle. The 45 degree step is the whole point of it",
      "If your lower back is working, you have straightened up. Stay in the quarter-squat throughout"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'hip-thrust-bodyweight',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Hip Thrust — Bodyweight',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'hip thrust - bodyweight exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'glutes',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring'],
    contraindications: ['hamstring-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Sit on the floor with your upper back resting against a sofa or bench',
      'Feet flat on the floor, knees bent at about 90°',
      'Squeeze your glutes and drive your hips up toward the ceiling',
      'At the top, your torso should be parallel to the floor',
      'Hold for 2 seconds, squeezing hard',
      'Lower slowly and repeat for 12 reps, 3 sets'
    ],
    coaching: 'The range of motion is bigger than a glute bridge because your shoulders are elevated. You will feel the difference.',
    why: 'The hip thrust produces the highest glute activation of any exercise — it is the gold standard for glute development and rehab.',
        watchOut: [
      "If your ribs flare and your back arches at the top, tuck your chin and think about lifting with the hips only",
      "If it is mostly hamstrings, walk your feet in a little and squeeze at the top for a second",
      "If the bench digs into your back, it is too high or too hard. Just under the shoulder blades, with a cushion if needed"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  {
    id: 'glute-bridge-march',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Glute Bridge March',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'glute bridge march exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'glutes',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'core', 'lower-back'],
    contraindications: ['lower-back-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 4,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back and set up in a standard glute bridge position',
      'Push up into bridge and hold — hips up, body straight',
      'Slowly lift your right foot a few inches off the floor',
      'Hold for 2 seconds without letting the hips drop or rotate',
      'Return and repeat on the left side',
      'That is one rep — complete 10 reps total, 3 sets'
    ],
    coaching: 'Hips staying perfectly still is the whole challenge. Start with tiny lifts and build range over time.',
    why: 'Combines glute strength with the core stability needed to keep hips level during single-leg movements.',
        watchOut: [
      "If your hips drop when a foot comes up, you have found the limit. Hold the bridge and lift the foot less far",
      "If your hips twist as you lift, slow the whole thing down — this is a hold with a small movement, not a march",
      "If you cannot hold the bridge for the full set, do the plain bridge for now and come back to this"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  {
    id: 'step-up-glute-focus',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Step-Up — Glute Focus',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'step-up - glute focus exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['glutes', 'quadriceps', 'hamstring'],
    contraindications: ['knee-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand in front of a step or sturdy box — about knee height',
      'Place your right foot fully on the step',
      'Press through your right heel to stand up on the step',
      'Focus on driving through the heel — not pushing off the back foot',
      'Step down slowly with control',
      'Complete 10 reps on the right, then 10 on the left'
    ],
    coaching: 'The heel drive is the key — it shifts the work from quads to glutes.',
    why: 'A functional glute strengthener that directly transfers to climbing stairs, hills, and daily movement.',
        watchOut: [
      "If you are pushing off the back foot, that leg is doing the work. Let it hang and drive through the heel on the step",
      "If your knee travels inward as you rise, lower the step until it stays over your foot",
      "If you are jumping up rather than pressing, slow it down. Speed hides which muscles are working"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 45
  },

  {
    id: 'reverse-lunge-glute-focus',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Reverse Lunge — Glute Focus',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'reverse lunge - glute focus exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['glutes', 'hamstring', 'quadriceps'],
    contraindications: ['knee-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand tall, feet together',
      'Step your right foot straight back, lowering the back knee toward the floor',
      'Keep your front shin vertical — knee stays over ankle',
      'At the bottom, consciously squeeze your front glute',
      'Drive through the front heel to return to standing',
      'Complete 10 reps each leg, 3 sets'
    ],
    coaching: 'Thinking about the front glute changes where you feel the exercise. Most people feel lunges in the quads — this cue shifts it to the glutes.',
    why: 'Reverse lunges load the glutes more than forward lunges and are gentler on the knee.',
        watchOut: [
      "If your front knee travels past your toes, take a longer step back",
      "If you are wobbling, hold a wall with one hand. Balance is not what this is training",
      "If you feel it mostly in the front of your thigh, lean your torso forward very slightly and squeeze the front glute as you stand up"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 45
  },

  {
    id: 'standing-hip-abduction',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Standing Hip Abduction',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'standing hip abduction exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'glutes',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand next to a wall or chair for balance if needed',
      'Stand on your left leg, slight bend in the knee',
      'Lift your right leg out to the side — keep it straight',
      'Lead with your heel, not your toes',
      'Raise to about 30-45° — no higher',
      'Lower slowly and repeat',
      'Complete 15 reps each side'
    ],
    coaching: 'This can be done anywhere — a great one for office breaks or waiting for the kettle.',
    why: 'Strengthens the hip abductors in a functional standing position — directly relevant to walking, running, and balance.',
        watchOut: [
      "If your body leans away as the leg rises, stand taller and lift less. The lean is your body finding a shortcut",
      "If your toes turn out, lead with the heel instead. Toes-out turns it into a hip flexor movement",
      "If your standing leg is doing all the work, hold onto something. Balance is not the target here"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'glute-squeeze-isometric',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Glute Squeeze — Isometric',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'glute squeeze - isometric exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'acute',
    activationTarget: 'glutes',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['glutes'],
    contraindications: [],
    caution: ['glutes-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit or lie in any comfortable position',
      'Squeeze both glutes as hard as you can — like you are trying to hold a coin between them',
      'Hold for 5 seconds',
      'Release fully and rest for 2 seconds',
      'Repeat for 15 reps'
    ],
    coaching: 'This is the simplest glute activation there is. It can be done sitting at a desk, lying in bed, or standing at a bus stop.',
    why: 'Isometric contractions re-establish the brain-to-muscle connection — especially useful after injury or long periods of inactivity.',
        watchOut: [
      "If you are squeezing your stomach or thighs too, let those go and find the glutes on their own. It takes a few attempts",
      "If you are holding your breath, breathe out through the squeeze",
      "If you cannot feel anything at all, put a hand on each glute so you can feel which side is working. One side is often quieter than the other"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 15
  },

  {
    id: 'prone-hip-extension',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Prone Hip Extension',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'prone hip extension exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'acute',
    activationTarget: 'glutes',
    movementPattern: 'hip-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['glutes', 'hamstring'],
    contraindications: ['lower-back-acute', 'hamstring-acute', 'glutes-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie face down, forehead resting on your hands',
      'Keep your legs straight',
      'Squeeze your right glute and lift that leg just a few inches off the floor',
      'Hold for 2 seconds',
      'Lower slowly — do not let it drop',
      'Complete 15 reps each side'
    ],
    coaching: 'The lift only needs to be a few inches. Squeezing the glute before you lift means the glute does the work, not the lower back.',
    why: 'A safe starting point for glute activation after injury — minimal load, no compression on the spine.',
        watchOut: [
      "If your lower back is arching, you are lifting too high. A few inches is genuinely the whole range",
      "If your pelvis rocks to one side, press both hip bones into the floor and lift less",
      "If you feel it in your back rather than your glute, squeeze the glute first, then lift. The order matters more than the height"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  // ============================================
  // HAMSTRING REHABILITATION — Batch 3
  // Three phases: acute (pain/injury), subacute (rebuilding), maintenance (load)
  // Key safety rule: no running, jumping or high load until pain < 3/10
  // ============================================

  {
    id: 'hamstring-isometric-hold',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Hamstring Isometric Hold',
    youtube: 'hamstring isometric hold exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'hamstring',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring'],
    contraindications: [],
    caution: ['hamstring-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit on the edge of a chair, right foot flat on the floor',
      'Press your right heel firmly into the floor as if trying to drag it back toward the chair',
      'The foot does not actually move — this is an isometric contraction',
      'Hold for 5 seconds, pressing at about 50% of your maximum effort',
      'Release and rest for 5 seconds',
      'Complete 10 reps, then repeat on the left side'
    ],
    coaching: 'Start gently — 30 to 50% effort. Isometric work is safe in the acute phase because there is no movement through the injured tissue.',
    why: 'Isometric contractions maintain hamstring strength and reduce pain during the acute phase without stressing the injury.',
        watchOut: [
      "If your foot slides along the floor, you are pushing harder than you need to. Ease off until the foot stays put — the effort is meant to go nowhere",
      "If you find yourself holding your breath, count the hold out loud. It is hard to hold your breath and speak at the same time",
      "If you are gripping the chair to brace, rest your hands in your lap instead. The leg should be doing this on its own"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'supine-hamstring-stretch',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Supine Hamstring Stretch',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'supine hamstring stretch exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat', 'resistance-band'],
    affectsAreas: ['hamstring'],
    contraindications: [],
    caution: ['hamstring-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, both knees bent',
      'Lift your right leg and hold behind the thigh with both hands',
      'Slowly straighten the knee until you feel a gentle stretch — not pain',
      'Hold for 30 seconds, breathing normally',
      'Bend the knee and lower the leg',
      'Repeat 3 times each side'
    ],
    coaching: 'A stretch should feel like a pull, never a sharp pain. If it is sharp, bend the knee more until it is just a gentle tension.',
    why: 'Restores hamstring length gently during the subacute phase — important for returning to normal movement patterns.',
        watchOut: [
      "If it has started to hurt rather than pull, you have gone past where this works. Bend the knee slightly and stay there",
      "If your other hip is lifting off the floor, you are borrowing range from your back. Keep that hip down and accept a shorter stretch",
      "If you are bouncing at the end, hold still instead. The muscle lets go with time, not with pressure"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'active-straight-leg-raise',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Active Straight Leg Raise',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'active straight leg raise exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hip-flexion',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'hip-flexor', 'core'],
    contraindications: ['lower-back-acute', 'hamstring-acute'],
    energyRequired: 3,
    difficultyLevel: 2,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie on your back, left knee bent and foot flat, right leg straight',
      'Flex your right foot — toes toward the ceiling',
      'Tighten your right quad and lift the leg to about 45°',
      'Keep the knee locked straight throughout',
      'Hold for 2 seconds, then lower slowly',
      'Complete 15 reps, then switch legs'
    ],
    coaching: 'The quad staying tight is what protects the hamstring here. If the knee bends, the hamstring is doing more work than it should be at this stage.',
    why: 'Builds hamstring control through a safe range — a standard progression in physiotherapy after hamstring strain.',
        watchOut: [
      "If the knee bends as the leg rises, lower it until the knee locks again. The straight knee is the exercise; the height is not",
      "If your lower back arches off the floor, press it down before you lift, and stop the leg lower",
      "If the leg drops quickly at the end, slow it down. The way down is half of this"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'prone-hamstring-curl',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Prone Hamstring Curl',
    youtube: 'prone hamstring curl exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['resistance-band', 'yoga-mat'],
    affectsAreas: ['hamstring'],
    contraindications: ['lower-back-acute', 'hamstring-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie face down, legs straight, forehead resting on your hands',
      'Slowly bend your right knee, bringing your heel toward your bottom',
      'Move through a comfortable range — stop if you feel sharp pain',
      'Hold at the top for 1 second',
      'Lower slowly — take 3 counts to come down',
      'Complete 12 reps each side, 3 sets'
    ],
    coaching: 'The slow lowering (eccentric phase) is where most of the rehab benefit comes from. Do not rush it.',
    why: 'Rebuilds hamstring strength through active range of motion — the next step after isometric work.',
        watchOut: [
      "If your hips lift off the floor, you have run out of range and started borrowing. Stop where the hips stay down",
      "If the leg is swinging rather than curling, slow the whole rep down until you can stop it anywhere",
      "If you feel a pulling sensation behind the knee, come back out. That is not the muscle you are after"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'romanian-deadlift-rehab',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Romanian Deadlift — Rehab Load',
    youtube: 'romanian deadlift - rehab load exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: ['lower-back-acute', 'hamstring-acute'],
    caution: ['glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet hip-width apart, holding light dumbbells or no weight',
      'Hinge at your hips, pushing them back as you lower your hands toward the floor',
      'Keep your back flat and knees soft — not locked',
      'Lower only until you feel a gentle stretch in the hamstrings — about mid-shin',
      'Drive hips forward to return to standing',
      'Complete 3 sets of 10 reps at a pace that feels controlled'
    ],
    coaching: 'Use the lightest weight that still feels like work. This is rehab, not a strength session — range and control matter more than load.',
    why: 'Progressive hamstring loading through a lengthened position — one of the most effective exercises for hamstring injury rehabilitation.',
        watchOut: [
      "If your lower back starts to round, that is your stopping point. Come back up. It will move lower over weeks",
      "If it feels like a squat, your knees are bending. Push your hips backwards instead of dropping down",
      "If you are trying to reach the floor, stop. Where you stop is set by your hamstrings, not by how far down your hands get"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  {
    id: 'nordic-curl-assisted',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Nordic Curl — Assisted',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'nordic curl - assisted exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'hamstring',
    movementPattern: 'eccentric-control',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring'],
    contraindications: ['hamstring-acute', 'hamstring-subacute', 'knee-acute'],
    energyRequired: 5,
    difficultyLevel: 6,
    duration: 120,
    perSide: false,
    instructions: [
      'Kneel on a mat with ankles held down by a partner, a heavy sofa, or tucked under a bar',
      'Keeping your body straight from knees to head, slowly lower yourself forward',
      'Use your hands to control the descent — catching yourself in a press-up position',
      'Push back up with your hands to the starting position',
      'Focus on making the lowering phase as slow as possible — aim for 3 to 5 seconds down',
      'Complete 3 sets of 5 reps — quality over quantity'
    ],
    coaching: 'This is a hard exercise even for fit people. The hands are there to help — use them. The eccentric lowering is the goal, not the return.',
    why: 'Nordic curls are the most evidence-backed exercise for hamstring injury prevention and rehabilitation. The eccentric loading rebuilds tendon strength.',
        watchOut: [
      "If you fold at the waist, you are falling from the hips rather than the knees. Squeeze your glutes and keep a straight line from knee to head",
      "If you drop suddenly partway down, you went past what you can hold. Catch yourself earlier next time — earlier is progress, not failure",
      "If your hamstrings are still sore from last time, leave it. This one makes real muscle damage on purpose, and the recovery gap is part of the method"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 60
  },

  {
    id: 'hamstring-bridge-curl',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Hamstring Bridge Curl',
    youtube: 'hamstring bridge curl exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'glutes'],
    contraindications: ['hamstring-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back with heels on the seat of a chair or low surface',
      'Press through your heels to lift your hips into a bridge',
      'Hold the bridge position while you slowly slide your heels away from you',
      'Extend as far as you can while keeping your hips up',
      'Curl the heels back in to return',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'This works the hamstrings from a lengthened position — which is where most hamstring injuries happen. Start small with the range.',
    why: 'Trains the hamstrings eccentrically through a functional range, building resilience for running and jumping.',
        watchOut: [
      "If your hips drop as the heels travel out, you have gone as far as you can hold. Come back in and stop there",
      "If you cannot drag your heels back, you slid out too far. Shorten it",
      "If the hamstring cramps, that usually means the range is longer than it is ready for. Shorten it rather than pushing on"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 45
  },

  {
    id: 'standing-hamstring-curl-band',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Standing Hamstring Curl — Band',
    youtube: 'standing hamstring curl - band exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['hamstring'],
    contraindications: ['hamstring-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 90,
    perSide: true,
    instructions: [
      'Anchor a resistance band low to a wall or chair leg',
      'Loop the band around your right ankle and stand facing the anchor',
      'Stand on your left leg, slight bend in the knee',
      'Curl your right heel toward your bottom against the band resistance',
      'Lower slowly — take 3 counts',
      'Complete 12 reps each side, 3 sets'
    ],
    coaching: 'The slow lowering is doing most of the work. A 3-second lowering builds more strength than a fast one.',
    why: 'Builds hamstring strength through functional range in a standing position — closer to how the hamstring works in sport and daily movement.',
        watchOut: [
      "If your standing hip drifts out sideways, put a hand on a wall and reset. Balance should not be the hard part here",
      "If you are swinging the leg forward first, you are using a run-up. Start each rep from still",
      "If the band pulls your foot back down, you are letting go. Control the way down as much as the way up"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  {
    id: 'single-leg-deadlift-rehab',
    position: 'standing',
    impact: false,
    balanceDemand: true,
    name: 'Single-Leg Deadlift',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'single-leg deadlift - rehab exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['hamstring', 'glutes', 'lower-back'],
    contraindications: ['hamstring-acute', 'lower-back-acute'],
    caution: ['glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on your right leg with a soft bend in the knee',
      'Hinge forward at the hip, extending your left leg behind you for balance',
      'Lower until your torso and left leg are roughly parallel to the floor',
      'Keep your hips square — do not let the left hip rotate open',
      'Drive through the right heel to return to standing',
      'Complete 10 reps each side, 3 sets'
    ],
    coaching: 'Balance is hard at first — holding a wall lightly is fine. Build up to freestanding over time.',
    why: 'Trains single-leg hamstring strength and balance together — essential for returning to running and any sport involving one-leg landing.',
        watchOut: [
      "If the raised hip rolls open toward the ceiling, you have gained range you have not earned. Keep both hips pointing at the floor",
      "If your back rounds to reach lower, stop higher. Depth is not the point",
      "If you are wobbling and rushing, hold a wall or a chair. That is not cheating — it lets you train the hinge instead of fighting the balance"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 50
  },

  {
    id: 'hamstring-90-90-stretch',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Hamstring 90-90 Stretch',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'hamstring 90-90 stretch exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'lower-back'],
    contraindications: [],
    caution: ['hamstring-acute', 'lower-back-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Sit on the floor, right leg straight out in front, left leg bent to the side',
      'Sit tall — do not let your lower back round',
      'Hinge forward at the hip over your straight leg',
      'Reach toward your right foot — only as far as you can with a flat back',
      'Hold for 30 seconds, breathing deeply',
      'Repeat 3 times each side'
    ],
    coaching: 'Round back means you are stretching your lower back, not your hamstring. Sit on a cushion if your back rounds immediately.',
    why: 'Restores hamstring length with the hip in a position that closely mimics running — more functional than a lying hamstring stretch.',
        watchOut: [
      "If your lower back is rounding, sit on a cushion and hinge from the hip instead. Reaching further with a rounded back is not more stretch",
      "If you are reaching with your hands, move your chest toward the leg instead. The hands are along for the ride",
      "If you are locking the knee hard, soften it. A slight bend often puts the stretch where you actually want it"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'hamstring-neural-floss',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Hamstring Neural Flossing',
    youtube: 'hamstring neural flossing exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'sciatic-nerve'],
    contraindications: ['hamstring-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Sit in a chair, right foot flat on the floor',
      'Slowly straighten your right knee until you feel a gentle stretch',
      'At the same time, look up and extend your neck slightly',
      'Hold for just 1 second — this is not a held stretch',
      'Bend the knee back down and drop your chin',
      'Repeat this alternating movement rhythmically for 30 reps, then switch sides'
    ],
    coaching: 'This is a neural mobilisation, not a muscle stretch. The rhythmic movement flushes the sciatic nerve — it should feel releasing, not painful.',
    why: 'Hamstring tightness is often partly neural, not just muscular. Neural flossing addresses both and is particularly useful when the hamstring feels tight but not torn.',
        watchOut: [
      "If you are holding the end position, do not. One second and back — this is a pumping movement, not a stretch",
      "If it reproduces the symptom you are settling, stop for today. Nerve work should ease things, not bring them on",
      "If you are doing more because it feels productive, do less. Little and often does more here than a long session"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'walking-lunge-short-stride',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Walking Lunge — Short Stride',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'walking lunge - short stride exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'hamstring',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'glutes', 'quadriceps'],
    contraindications: ['hamstring-acute', 'knee-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand tall, feet together',
      'Take a shorter than normal step forward with your right foot',
      'Lower your back knee toward the floor in a controlled lunge',
      'Push through both feet to bring your back foot forward to the next step',
      'Keep the stride short — longer strides increase hamstring load',
      'Complete 3 sets of 10 reps each leg, rest 60 seconds between sets'
    ],
    coaching: 'Short strides are deliberate here — as the hamstring heals, you can progressively lengthen them over weeks.',
    why: 'Returns the hamstring to functional loading through normal gait patterns — a key step before returning to running.',
        watchOut: [
      "If the front knee travels inward, slow down and point it over the middle of your foot",
      "If your back knee is touching the floor, stop an inch above it instead",
      "If you have drifted back to a normal-length stride, shorten it again. The short step is the whole adaptation"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 45
  },

  {
    id: 'copenhagen-adductor',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Copenhagen Adductor',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'copenhagen adductor exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'hamstring',
    movementPattern: 'hip-abduction',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'adductors', 'hip'],
    contraindications: ['hamstring-acute', 'hip-acute'],
    energyRequired: 5,
    difficultyLevel: 5,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your side, top leg resting on a bench or chair at hip height',
      'Keep your top leg straight and supported',
      'Lift your bottom leg up to meet the top leg',
      'Hold for 2 seconds, then lower slowly',
      'Complete 10 reps each side, 3 sets'
    ],
    coaching: 'This is harder than it looks. Start with a lower surface if needed. The adductor and hamstring work together here — both benefit.',
    why: 'Strengthens the inner thigh and hamstring together — clinically used for groin and hamstring injury prevention in sport.',
        watchOut: [
      "If your hips roll backwards, you have turned it into a half-lying position. Stack the hips and shorten the range",
      "If you cannot control the lift, move the support closer to your knee. Full length is the last version, not the first",
      "If your groin cramps in the first few sessions, that is common. Shorten the lever rather than pushing through it"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 50
  },

  {
    id: 'towel-hamstring-curl',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Towel Hamstring Curl',
    youtube: 'towel hamstring curl exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hamstring',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['hamstring', 'glutes'],
    contraindications: ['hamstring-acute', 'glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 3,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back on a smooth floor with heels on a folded towel',
      'Lift your hips into a bridge position',
      'Keeping your hips up, slide your heels away from you by straightening your legs',
      'Slide out as far as you can while keeping the hips up',
      'Curl back in by bending the knees',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'The smooth floor lets the towel slide easily. If it sticks, try socks on a wooden floor instead.',
    why: 'A low-equipment eccentric hamstring exercise that builds strength through the lengthened range — the range most prone to injury.',
        watchOut: [
      "If your hips sink as the heels go out, you have reached your limit. Come back in",
      "If you cannot pull your heels back, you went out too far. Take less range next time",
      "If the towel grabs and the movement goes jerky, you are on carpet. A smooth floor makes this work"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  // ============================================
  // CALF & ACHILLES REHABILITATION — Batch 4
  // Addresses: calves, achilles conditions
  // Key rule: eccentric work is the clinical standard for Achilles rehab
  // No jumping or running while Achilles is symptomatic
  // ============================================

  {
    id: 'seated-calf-raise',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Seated Calf Raise',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'seated calf raise exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'calves',
    movementPattern: 'calf-raise',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves'],
    contraindications: [],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit in a chair with feet flat on the floor, hip-width apart',
      'Slowly raise both heels as high as you can, pressing through the balls of your feet',
      'Hold at the top for 1 second',
      'Lower slowly — take 3 counts to come down',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'The slow lowering is where the healing happens. Do not let the heels drop quickly.',
    why: 'Safe starting point for calf loading after acute injury — seated position removes body weight load while still working the muscle.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'standing-calf-raise-eccentric',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Eccentric Heel Drop',
    youtube: 'eccentric heel drop exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'calf-raise',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'achilles'],
    contraindications: ['calves-acute', 'achilles-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on a step with both feet, heels hanging off the edge',
      'Rise up on both feet to the top position',
      'Shift your weight to your right foot only',
      'Slowly lower your right heel below the step level — take 3 to 4 seconds',
      'Use both feet to rise back up — never lower on both',
      'Complete 3 sets of 15 reps each side'
    ],
    coaching: 'The lowering phase is the entire point. Rising on two feet is just resetting — all the work is in the slow single-leg descent.',
    why: 'Eccentric heel drops are the most evidence-backed treatment for Achilles tendinopathy. The slow lengthening under load remodels and strengthens the tendon.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'single-leg-calf-raise',
    position: 'standing',
    impact: false,
    balanceDemand: true,
    name: 'Single-Leg Calf Raise',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'single-leg calf raise exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'calves',
    movementPattern: 'calf-raise',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'achilles'],
    contraindications: ['calves-acute', 'achilles-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand near a wall for balance support',
      'Shift your weight onto your right foot, left foot lightly lifted',
      'Slowly rise onto the ball of your right foot as high as you can',
      'Hold for 1 second at the top',
      'Lower slowly — 3 counts down',
      'Complete 3 sets of 12 reps each side'
    ],
    coaching: 'Full range matters — press all the way up, lower all the way down. Half reps build half the strength.',
    why: 'Progresses from eccentric-only to full concentric and eccentric loading — the next step in returning the calf and Achilles to full strength.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'achilles-heel-drop-straight',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Achilles Heel Drop — Straight Knee',
    youtube: 'achilles heel drop - straight knee exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'eccentric-control',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['achilles', 'calves'],
    contraindications: ['achilles-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on a step with the ball of your right foot on the edge, heel hanging off',
      'Keep your right knee straight throughout',
      'Slowly lower your heel below the step level over 4 seconds',
      'Use your left foot to help you rise back to the start position',
      'Complete 3 sets of 15 reps each side',
      'This targets the gastrocnemius — the upper calf muscle'
    ],
    coaching: 'Some mild discomfort is expected during Achilles rehab. Sharp pain means stop. Mild ache during and after is normal at this stage.',
    why: 'The straight-knee version targets the gastrocnemius — the larger, outer calf muscle that attaches directly to the Achilles tendon.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'achilles-heel-drop-bent',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Achilles Heel Drop — Bent Knee',
    youtube: 'achilles heel drop - bent knee exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'eccentric-control',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['achilles', 'calves'],
    contraindications: ['achilles-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on a step with the ball of your right foot on the edge, heel hanging off',
      'Bend your right knee to about 30° and keep it there throughout',
      'Slowly lower your heel below the step level over 4 seconds',
      'Use your left foot to help you rise back to the start',
      'Complete 3 sets of 15 reps each side',
      'This targets the soleus — the lower, deeper calf muscle'
    ],
    coaching: 'Do both the straight and bent-knee versions — they target different parts of the calf and both connect to the Achilles.',
    why: 'The bent-knee version targets the soleus — the deeper calf muscle whose tendon blends into the Achilles. Essential for complete Achilles rehabilitation.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'standing-calf-stretch-wall',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Standing Calf Stretch — Wall',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'standing calf stretch - wall exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'achilles'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand facing a wall, hands on the wall for support',
      'Step your right foot back about a metre, keeping it flat on the floor',
      'Keep your back knee straight and press your back heel into the floor',
      'Lean gently toward the wall until you feel a stretch in your right calf',
      'Hold for 30 seconds, then switch sides',
      'Repeat 3 times each side'
    ],
    coaching: 'The heel must stay flat on the floor — that is what gives the stretch. If the heel lifts, step the foot closer.',
    why: 'Maintains calf and Achilles flexibility during rehabilitation — reduced flexibility is a significant risk factor for re-injury.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'soleus-stretch-bent-knee',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Soleus Stretch — Bent Knee',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'soleus stretch - bent knee exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'achilles'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand facing a wall, hands on the wall',
      'Step your right foot back about half a metre',
      'Bend your right knee and sink down gently, keeping the heel flat',
      'You should feel the stretch lower down — in the deeper calf, just above the heel',
      'Hold for 30 seconds, then switch',
      'Repeat 3 times each side'
    ],
    coaching: 'This feels different to the standard calf stretch — lower and tighter. That is the soleus. Both stretches are needed for full Achilles health.',
    why: 'Stretches the soleus, which is commonly neglected. Tight soleus increases Achilles load during walking and running.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'ankle-alphabet',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Ankle Alphabet',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'ankle alphabet exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'acute',
    activationTarget: 'calves',
    movementPattern: 'ankle-mobility',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['ankle-foot', 'calves'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit in a chair with your right leg extended or crossed over your left knee',
      'Using just your ankle and foot — not your whole leg — trace the letters of the alphabet',
      'Move through the full range each letter allows',
      'Complete the full alphabet on the right, then switch to the left'
    ],
    coaching: 'This looks simple but covers every direction your ankle moves. It is one of the best all-round ankle mobility exercises there is.',
    why: 'Restores ankle range of motion and proprioception \u2014 your sense of where the joint is \u2014 after injury — safe in the acute phase because there is no load through the joint.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 15
  },

  {
    id: 'banded-ankle-dorsiflexion',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Banded Ankle Dorsiflexion',
    youtube: 'banded ankle dorsiflexion exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'ankle-mobility',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['ankle-foot', 'calves', 'achilles'],
    contraindications: ['achilles-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Anchor a resistance band around a table leg or door frame at ankle height',
      'Loop the band around the top of your right foot, just above the toes',
      'Step back so the band pulls your foot forward',
      'Lunge forward slowly, bending your right knee over your right toes',
      'Keep your right heel flat on the floor throughout',
      'Hold for 2 seconds, step back, repeat 15 times each side'
    ],
    coaching: 'The band provides a small distraction to the ankle joint that helps restore range. This is a common physio technique.',
    why: 'Improves ankle dorsiflexion range — limited dorsiflexion is linked to calf tightness, Achilles problems, knee pain, and running injuries.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'calf-foam-roll',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Calf Foam Roll',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'calf foam roll exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'calves',
    movementPattern: 'self-massage',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['calves'],
    contraindications: ['calves-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 120,
    perSide: true,
    instructions: [
      'Sit on the floor with your right calf resting on the foam roller',
      'Lift your hips off the floor, supporting yourself on your hands',
      'Slowly roll from just above the ankle to just below the back of the knee',
      'Pause for 20 to 30 seconds on any tight or tender spots',
      'Cross your left ankle over your right to add more pressure if needed',
      'Roll for 60 seconds per leg'
    ],
    coaching: 'Roll slowly — about one inch per second. Tender spots mean the tissue needs more time there, not faster movement.',
    why: 'Reduces calf tension and improves tissue quality — supports Achilles health and reduces injury recurrence risk.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  // ============================================
  // KNEE, IT BAND & SHIN REHABILITATION — Batch 5
  // Addresses: knee, it-band, shin-splints conditions
  // VMO work for knee tracking, IT band protocol, tibialis anterior loading
  // ============================================

  {
    id: 'terminal-knee-extension',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Terminal Knee Extension',
    youtube: 'terminal knee extension exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'knee',
    movementPattern: 'isometric',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'knee'],
    contraindications: ['knee-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Anchor a resistance band behind you at knee height',
      'Loop the band around the back of your right knee',
      'Stand on your right leg, knee slightly bent, band pulling it forward',
      'Straighten your knee against the band resistance — squeeze the quad at the end',
      'Hold for 2 seconds, then slowly bend back to the start',
      'Complete 15 reps each side, 3 sets'
    ],
    coaching: 'The squeeze at full extension activates the VMO — the teardrop-shaped muscle on the inner quad that stabilises the kneecap.',
    why: 'Terminal knee extensions specifically target the VMO, which is often weak in knee pain. Strengthening it improves kneecap tracking and reduces pain.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'vmo-squat',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'VMO Squat',
    youtube: 'vmo squat exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'knee',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['quadriceps', 'knee', 'glutes'],
    contraindications: ['knee-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet closer than shoulder-width, toes turned out at 45°',
      'Lower into a squat, pushing your knees out over your little toes',
      'Only go as deep as feels comfortable — even a small range is fine',
      'At the bottom, pause for 1 second',
      'Drive through your heels to stand, squeezing the quads hard at the top',
      'Complete 3 sets of 12 reps'
    ],
    coaching: 'The wide toe angle and outward knee push shifts load onto the VMO. This is not about depth — it is about the quad squeeze at the top.',
    why: 'The turned-out foot position preferentially loads the VMO over the outer quad, helping to rebalance the forces acting on the kneecap.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'step-down-eccentric',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Step-Down — Eccentric',
    youtube: 'step-down - eccentric exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'knee',
    movementPattern: 'lunge',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'knee', 'glutes'],
    contraindications: ['knee-acute', 'glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on a step or stair on your right leg',
      'Slowly lower your left foot toward the floor — take 4 seconds',
      'Keep your right knee tracking over your second toe — do not let it cave inward',
      'Touch the floor lightly, do not fully weight it',
      'Drive back up through your right heel to the start',
      'Complete 10 reps each side, 3 sets'
    ],
    coaching: 'Watch your knee in a mirror if possible. It should track straight — not collapsing inward. Slowing down helps keep it honest.',
    why: 'Eccentric step-downs are a benchmark test and treatment for knee pain. The slow lowering builds quad and glute control under load.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  {
    id: 'wall-squat-hold',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Wall Squat Hold — Isometric',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'wall squat hold - isometric exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'knee',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'knee', 'glutes'],
    contraindications: ['glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with your back flat against a wall',
      'Walk your feet out and slide down until your knees are at about 90° — or less if that hurts',
      'Keep your back flat against the wall, weight through your heels',
      'Hold the position for 20 to 45 seconds',
      'Stand back up slowly',
      'Complete 3 holds with 30 seconds rest between'
    ],
    coaching: 'Find the angle that produces a muscle burn but no knee pain. That is your working range — stay there.',
    why: 'Isometric quad loading reduces knee pain while building strength — safe in acute and early subacute phases when movement is painful.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'it-band-foam-roll',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'IT Band Foam Roll',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'it band foam roll exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'it-band',
    movementPattern: 'self-massage',
    equipment: ['foam-roller'],
    equipmentOptional: [],
    affectsAreas: ['it-band', 'quadriceps', 'hip'],
    contraindications: ['it-band-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 120,
    perSide: true,
    instructions: [
      'Lie on your right side with the foam roller under your outer right thigh',
      'Support yourself on your right forearm, left foot flat on the floor in front',
      'Slowly roll from just below the hip to just above the knee',
      'Pause for 20 to 30 seconds on any tight spots — especially the outer thigh',
      'Avoid rolling directly over the knee joint',
      'Roll for 60 to 90 seconds per side'
    ],
    coaching: 'The IT band itself cannot be stretched — it is a thick band of connective tissue. You are releasing the muscles around it. It will be tender.',
    why: 'Reduces tension in the lateral thigh and TFL muscle, which can reduce pain along the IT band. Most effective when combined with glute strengthening.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'lateral-quad-stretch',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Lateral Quad and IT Band Stretch',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'lateral quad and it band stretch exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'it-band',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['it-band', 'quadriceps', 'hip'],
    contraindications: [],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand near a wall for balance',
      'Cross your right foot behind your left',
      'Lean your hips to the left, shifting your weight onto your left foot',
      'You should feel a stretch along the outer right hip and thigh',
      'Hold for 30 seconds, then switch sides',
      'Repeat 3 times each side'
    ],
    coaching: 'The further you lean the hips to the side, the deeper the stretch. Start gentle and increase over time.',
    why: 'One of the few effective stretches for the lateral hip and IT band region. Complements foam rolling well.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'tfl-release-standing',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'TFL and Hip Flexor Release',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'tfl and hip flexor release exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'it-band',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['it-band', 'hip-flexor', 'hip'],
    contraindications: ['knee-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Kneel on your right knee, left foot forward in a lunge position',
      'Shift your hips forward gently until you feel a stretch in the front of the right hip',
      'Now rotate your torso slightly to the right and reach your right arm overhead',
      'You should feel a stretch along the outer hip and side of the thigh',
      'Hold for 30 seconds, then switch sides',
      'Repeat 3 times each side'
    ],
    coaching: 'The rotation is what makes this target the TFL. Without it, it is just a hip flexor stretch.',
    why: 'Releases the TFL — the muscle at the top of the IT band that is often the true source of IT band tension.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'tibialis-anterior-raise',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Tibialis Anterior Raise',
    youtube: 'tibialis anterior raise exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'shin-splints',
    movementPattern: 'ankle-mobility',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shin-splints', 'ankle-foot'],
    contraindications: [],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit in a chair with feet flat on the floor',
      'Lift both toes and forefeet off the floor, keeping heels down',
      'Hold for 2 seconds at the top',
      'Lower slowly',
      'Complete 3 sets of 20 reps',
      'Progress to standing with back against wall once seated is easy'
    ],
    coaching: 'You will feel this in the muscle running along the outer shin. That is exactly where it should be.',
    why: 'Strengthens the tibialis anterior — the muscle most involved in shin splints. Directly addresses the source of the pain.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'shin-splint-calf-raise-progression',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Shin Splint Calf Raise Progression',
    youtube: 'shin splint calf raise progression exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shin-splints',
    movementPattern: 'calf-raise',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shin-splints', 'calves'],
    contraindications: ['shin-splints-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand near a wall for balance',
      'Rise up onto your toes — calf raise — for 2 counts',
      'At the top, shift your weight forward and lower back down by pulling your toes up — heel drop',
      'This combines a calf raise with a tibialis raise in one movement',
      'Complete 3 sets of 15 reps',
      'Rest at least 48 hours between sessions while shins are symptomatic'
    ],
    coaching: 'This is a progression — only start it once the tibialis raise is pain-free. Do not push through sharp shin pain.',
    why: 'Balances strength between the calf and tibialis anterior — the imbalance between these two muscles is a primary cause of shin splints.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'balance-single-leg-hold',
    position: 'standing',
    impact: false,
    balanceDemand: true,
    name: 'Single-Leg Balance Hold',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'single-leg balance hold exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'subacute',
    activationTarget: 'knee',
    movementPattern: 'proprioception',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['knee', 'ankle-foot', 'glutes'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand on your right leg, left foot lightly lifted',
      'Find your balance — a slight bend in the right knee',
      'Hold for 30 seconds without touching down',
      'Increase the challenge by closing your eyes, or standing on a folded towel',
      'Switch legs and repeat',
      'Complete 3 holds each side'
    ],
    coaching: 'Wobbling is the point — it means your stabilisers are working. Only hold a wall if you are about to fall.',
    why: 'Restores proprioception — the body\'s sense of joint position. Lost after any lower limb injury and essential to recover before returning to sport.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'patella-mobilisation',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Patella Mobilisation',
    youtube: 'patella mobilisation exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'knee',
    movementPattern: 'joint-mobilisation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['knee'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit on the floor with your right leg straight out in front of you',
      'Let the leg fully relax — quad completely soft',
      'Place your thumbs on the top of your kneecap, fingers on the sides',
      'Gently glide the kneecap up, down, left and right — small movements',
      'Spend about 60 seconds on each direction',
      'The kneecap should move freely — if it feels stuck in one direction, spend more time there'
    ],
    coaching: 'This only works when the quad is completely relaxed. If the muscle is on, the kneecap is locked in place.',
    why: 'Maintains kneecap mobility during rehabilitation and recovery from surgery. A stuck kneecap contributes to pain and limits knee flexion.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'y-balance-reach',
    position: 'standing',
    impact: false,
    balanceDemand: true,
    name: 'Y-Balance Reach',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'y-balance reach exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'knee',
    movementPattern: 'proprioception',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['knee', 'ankle-foot', 'glutes', 'hip'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'glutes-acute'],
    energyRequired: 5,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on your right leg, hands on hips',
      'While keeping your balance, reach your left foot forward as far as you can — touch the floor lightly',
      'Return to centre without putting full weight on the left foot',
      'Reach to the side — as far as you can',
      'Return, then reach diagonally behind you',
      'Each of the three directions is one rep — complete 5 full reps each side'
    ],
    coaching: 'Distance matters less than control. A short, controlled reach is better than a long one that makes you hop or twist.',
    why: 'The Y-balance test is used clinically to assess injury risk and rehabilitation progress. As an exercise it builds the full lower limb stability needed to return to sport.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  // ============================================
  // SHOULDER, UPPER BACK & WRIST REHABILITATION — Batch 6
  // Addresses: shoulder, upper-back, wrist-elbow, chest-pecs, biceps-triceps
  // Rotator cuff, scapular stability, wrist prep
  // ============================================

  {
    id: 'pendulum-swing',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Pendulum Swing',
    youtube: 'pendulum swing exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'shoulder',
    movementPattern: 'joint-mobilisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shoulder'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand next to a table or chair, leaning forward with your left hand on it for support',
      'Let your right arm hang completely loose — no tension',
      'Use your body and legs to gently swing the arm in small circles',
      'Let gravity and momentum do the work — do not use the shoulder muscles',
      'Circle clockwise for 30 seconds, then anticlockwise for 30 seconds',
      'Switch arms and repeat'
    ],
    coaching: 'This is a passive exercise — the arm swings like a pendulum, not an active movement. Any muscular effort defeats the purpose.',
    why: 'Creates gentle traction on the shoulder joint, reducing pain and maintaining range of motion in the acute phase when active movement is too painful.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'external-rotation-band',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'External Rotation — Band',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'external rotation - band exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'shoulder-rotation',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'rotator-cuff'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Anchor a resistance band at elbow height beside you',
      'Hold the band in your right hand, elbow bent at 90°, upper arm against your side',
      'Keep your elbow tucked in and rotate your forearm away from your body',
      'Move slowly — 2 seconds out, 2 seconds back',
      'Complete 3 sets of 15 reps each side'
    ],
    coaching: 'The elbow stays glued to your side. The moment it lifts, you are using the wrong muscles.',
    why: 'Strengthens the infraspinatus and teres minor — two of the four rotator cuff muscles. Weakness here is the most common cause of shoulder impingement.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'internal-rotation-band',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Internal Rotation — Band',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'internal rotation - band exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'shoulder-rotation',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'rotator-cuff'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Anchor a resistance band at elbow height on the opposite side to your working arm',
      'Hold the band in your right hand, elbow bent at 90°, upper arm against your side',
      'Rotate your forearm toward your body against the band resistance',
      'Move slowly — 2 seconds in, 2 seconds back',
      'Complete 3 sets of 15 reps each side'
    ],
    coaching: 'Same rule as external rotation — elbow stays against your side. Do both internal and external in every shoulder rehab session.',
    why: 'Strengthens the subscapularis — the rotator cuff muscle on the front of the shoulder. Balance between internal and external rotation is critical for shoulder health.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'wall-slide',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Wall Slide',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'wall slide exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'scapular-activation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'upper-back', 'rotator-cuff'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand with your back flat against a wall, feet slightly out from the wall',
      'Press your arms against the wall, elbows at 90° — like a goalpost position',
      'Slowly slide both arms up the wall as high as you can while keeping contact',
      'Keep your lower back, upper back and arms touching the wall throughout',
      'Slide back down slowly',
      'Complete 3 sets of 10 reps'
    ],
    coaching: 'The wall gives you honest feedback — any gap tells you where your mobility and control are limited.',
    why: 'Trains the lower trapezius and serratus anterior together — the muscles that control the shoulder blade and create a stable base for the shoulder joint.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'shoulder-cars',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Shoulder CARs',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'shoulder cars exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'maintenance',
    activationTarget: 'shoulder',
    movementPattern: 'joint-mobilisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand tall, core lightly engaged',
      'Lift your right arm forward, then arc it up over your head — keeping the arm as far from your body as possible',
      'Continue the arc behind you, then down and back to the start',
      'Move as slowly as you can, maintaining maximum tension throughout',
      'The entire circle should take 5 to 10 seconds',
      'Complete 5 circles each direction each side'
    ],
    coaching: 'CARs stands for Controlled Articular Rotations. Slower is better — you are exploring and building range at the same time.',
    why: 'Takes the shoulder through its full available range under active muscular control — maintains joint health and builds awareness of limitations.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'prone-ytw',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Prone Y-T-W',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'prone y-t-w exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'scapular-activation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['upper-back', 'shoulder', 'rotator-cuff'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie face down on a mat, arms at your sides',
      'Y position: Lift both arms diagonally overhead — thumbs up — hold 2 seconds',
      'Lower, then T position: Lift both arms straight out to the sides — hold 2 seconds',
      'Lower, then W position: Bend elbows to 90°, lift upper arms to shoulder height — hold 2 seconds',
      'That is one Y-T-W rep',
      'Complete 3 sets of 8 reps'
    ],
    coaching: 'These are small movements with low weight — the difficulty comes from volume and holding position, not from load.',
    why: 'Directly targets the lower and mid trapezius — muscles that are almost always weak in people with shoulder and neck pain from sitting.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'scapular-pushup',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Scapular Press-Up',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'scapular press-up exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'scapular-activation',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['shoulder', 'upper-back'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Start in a high plank position — arms straight, hands under shoulders',
      'Keep the arms completely straight throughout — no elbow bending',
      'Let your chest drop toward the floor by allowing the shoulder blades to squeeze together',
      'Then push the floor away, spreading the shoulder blades apart',
      'The movement is only in the shoulder blades — about 3 to 5 cm',
      'Complete 3 sets of 15 reps'
    ],
    coaching: 'Most people have never felt this movement before. It takes a few reps to find it. If arms are bending, it is a press-up — not a scapular press-up.',
    why: 'Activates the serratus anterior — the muscle that holds the shoulder blade against the ribcage. Weakness here causes winging and shoulder impingement.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'doorway-chest-stretch',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Doorway Chest Stretch',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'doorway chest stretch exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Stand in a doorway, arms raised to shoulder height, elbows bent at 90°',
      'Place forearms on the door frame',
      'Step one foot forward and lean gently into the doorway',
      'Feel the stretch across the front of the chest and shoulders',
      'Hold for 30 seconds',
      'Repeat 3 times'
    ],
    coaching: 'Lean forward slowly — do not throw yourself into the stretch. A gentle sustained pull works better than a hard fast one.',
    why: 'Releases pec minor tightness that pulls the shoulder blade forward — one of the most common postural problems from sitting and screen use.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'wrist-cars',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Wrist CARs',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'wrist cars exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'acute',
    activationTarget: 'wrist-elbow',
    movementPattern: 'joint-mobilisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['wrist-elbow'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit or stand, right arm extended forward at shoulder height',
      'Make a gentle fist',
      'Slowly circle the wrist through its full range — as big a circle as possible',
      'Move at about 5 seconds per full circle',
      'Complete 5 circles clockwise and 5 anticlockwise each side'
    ],
    coaching: 'This is a daily maintenance exercise — 2 minutes a day prevents most wrist problems from building up.',
    why: 'Maintains wrist joint health and range of motion. Particularly useful for anyone who types, uses a mouse, or does press-ups regularly.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 15
  },

  {
    id: 'wrist-extension-stretch',
    position: 'any',
    impact: false,
    balanceDemand: false,
    name: 'Wrist Extension Stretch',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'wrist extension stretch exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'wrist-elbow',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['wrist-elbow', 'biceps-triceps'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Extend your right arm in front of you, palm facing down',
      'Use your left hand to gently bend the right wrist upward — fingers pointing to the ceiling',
      'Hold for 20 seconds',
      'Then turn the palm up and gently bend the wrist down — fingers pointing to the floor',
      'Hold for 20 seconds',
      'Switch sides and repeat'
    ],
    coaching: 'Gentle and sustained is the goal. These stretches work best when held for at least 20 seconds.',
    why: 'Maintains wrist flexor and extensor length — important for preventing and managing tennis elbow, golfer\'s elbow and repetitive strain.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 15
  },

  {
    id: 'forearm-pronation-supination',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Forearm Pronation and Supination',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'forearm pronation and supination exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'wrist-elbow',
    movementPattern: 'joint-mobilisation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['wrist-elbow', 'biceps-triceps'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit with your right elbow bent at 90°, upper arm against your side',
      'Hold a light object like a pen or small water bottle',
      'Rotate your palm to face the ceiling — supination',
      'Then rotate your palm to face the floor — pronation',
      'Move slowly through the full range, pausing at each end for 1 second',
      'Complete 15 slow reps each side, 3 sets'
    ],
    coaching: 'The weight of even a light object adds enough load to make this therapeutic. As strength returns, use a slightly heavier object.',
    why: 'Restores forearm rotation — commonly restricted after wrist or elbow injury. Essential for almost every upper body movement.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'grip-strength-towel',
    position: 'any',
    impact: false,
    balanceDemand: false,
    name: 'Grip Strengthening — Towel Squeeze',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'grip strengthening - towel squeeze exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'wrist-elbow',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['wrist-elbow', 'biceps-triceps'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Roll up a small towel or use a soft ball',
      'Hold it in your right hand',
      'Squeeze as firmly as comfortable — not maximum effort',
      'Hold for 5 seconds, then release fully',
      'Rest for 3 seconds between reps',
      'Complete 15 reps each hand, 3 sets'
    ],
    coaching: 'Release completely between reps — full release is as important as the squeeze for building endurance.',
    why: 'Rebuilds grip strength after wrist or elbow injury. Grip strength is also a reliable indicator of overall upper limb health.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  // ============================================
  // CORE & LOWER BACK REHABILITATION — Batch 7
  // Addresses: abdominals, sciatica, lower-back conditions
  // Highest safety-critical batch — contraindications carefully set
  // No spinal flexion under load. No sit-ups or crunches here.
  // ============================================

  {
    id: 'pelvic-tilt',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Pelvic Tilt',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'pelvic tilt exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'lower-back',
    movementPattern: 'spinal-flexion-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'abdominals'],
    contraindications: [],
    caution: ['lower-back-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back with knees bent, feet flat on the floor',
      'Notice the small gap between your lower back and the floor',
      'Gently flatten your lower back into the floor by tightening your abs and tilting your pelvis',
      'Hold for 5 seconds — breathe normally, do not hold your breath',
      'Release and let the natural arch return',
      'Complete 15 reps'
    ],
    coaching: 'This is a tiny movement — it should not involve lifting your hips. Just a gentle rocking of the pelvis.',
    why: 'Activates the deep abdominal muscles that support the lumbar spine — the starting point for all lower back rehabilitation.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 15,
    sets: 2,
    reps: "15",
    holdSeconds: 5,
    rest: 30,
    description: "Lie on your back with knees bent, feet flat on the floor. Gently flatten your lower back into the floor by tightening your abs and tilting your pelvis. Hold 5 seconds. Release.",
    cues: [
      "This is a tiny movement — no hip lifting",
      "Breathe normally throughout — do not hold your breath",
      "Tighten your abs, not your glutes",
      "Feel the lower back make contact with the floor"
    ],
  },

  {
    id: 'diaphragmatic-breathing-core',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Diaphragmatic Breathing — Core Activation',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'diaphragmatic breathing - core activation exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'abdominals',
    movementPattern: 'breath-awareness',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: [],
    caution: ['lower-back-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, one hand on your chest and one on your belly',
      'Breathe in slowly through your nose — let your belly rise, chest stays still',
      'As you breathe out, gently draw your belly button toward your spine',
      'Hold that gentle drawing-in for a moment before the next breath in',
      'This is 360-degree core activation — not sucking in hard, just a gentle engagement',
      'Continue for 2 minutes'
    ],
    coaching: 'The engagement is gentle — about 20% of maximum. If you are holding your breath or gripping hard, you are doing too much.',
    why: 'The deep core — transversus abdominis and pelvic floor — activates with the breath. This re-establishes that connection after injury or inactivity.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20,
    sets: 1,
    reps: null,
    holdSeconds: 120,
    rest: 0,
    description: "Lie on your back, knees bent, one hand on your chest and one on your belly. Breathe in slowly through your nose — belly rises, chest stays still. As you breathe out, gently draw your belly button toward your spine. Continue for 2 minutes.",
    cues: [
      "The belly rises on the inhale, chest stays still",
      "Exhale is when the deep core engages — gently, not forcefully",
      "About 20% of maximum effort — this is not sucking in",
      "Let the breath lead, not the abdominals"
    ],
  },

  {
    id: 'dead-bug-progression-1',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Dead Bug — Progression 1',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'dead bug - progression 1 exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'abdominals',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, arms pointing to the ceiling, knees bent at 90° lifted in the air',
      'Press your lower back firmly into the floor — keep it there throughout',
      'Slowly lower your right arm toward the floor overhead',
      'Hold for 2 seconds — back stays flat',
      'Return the arm and repeat on the left',
      'Complete 8 reps each side, 3 sets'
    ],
    coaching: 'Arms only to start. The lower back staying flat is everything — reduce the range if it lifts.',
    why: 'Trains the anti-extension function of the core — the most important job the abs do in protecting the spine.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35,
    sets: 2,
    reps: "8 each side",
    holdSeconds: 0,
    rest: 30,
    description: "Lie on your back, arms pointing to the ceiling, knees bent to 90 degrees above your hips. Slowly lower one arm overhead toward the floor — keeping your lower back pressed firmly down. Return. Alternate sides.",
    cues: [
      "Arms only in this version — legs stay still",
      "Lower back stays in contact with the floor throughout",
      "Breathe out as you lower the arm",
      "Move slowly — there is no benefit to speed here"
    ],
  },

  {
    id: 'dead-bug-progression-2',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Dead Bug — Progression 2',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'dead bug - progression 2 exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'abdominals',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, arms to the ceiling, knees at 90° in the air',
      'Press your lower back into the floor',
      'Slowly extend your right leg out straight — heel hovering above the floor',
      'Hold for 2 seconds',
      'Return and repeat on the left',
      'Complete 8 reps each side, 3 sets'
    ],
    coaching: 'Leg only this time. Harder than it looks — the longer lever of the leg challenges the lower back more than the arm.',
    why: 'Progresses dead bug to leg extension — the pattern used in walking and running where the core must prevent the back from arching.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  {
    id: 'dead-bug-progression-3',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Dead Bug — Progression 3',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'dead bug - progression 3 exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'abdominals',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 5,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Lie on your back, arms to the ceiling, knees at 90° in the air',
      'Press your lower back into the floor',
      'Simultaneously lower your right arm overhead and extend your left leg out',
      'Hold for 2 seconds — opposite limbs working together',
      'Return and switch sides',
      'Complete 8 reps each side, 3 sets'
    ],
    coaching: 'The opposite arm and leg combination is the full version. If the lower back lifts at all, go back to progressions 1 or 2.',
    why: 'The full dead bug pattern — opposite limb extension that directly trains the core stability needed for walking, running, and all sport.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 45,
    sets: 3,
    reps: "6 each side",
    holdSeconds: 0,
    rest: 60,
    description: "Dead bug with a light dumbbell held in each hand, arms pointing up. Lower opposite arm and leg simultaneously. The weight increases the anti-extension demand significantly.",
    cues: [
      "Lighter than you think — 2-4kg is enough",
      "Lower back stays in contact with the floor throughout",
      "Move more slowly with the added weight",
      "If your back lifts at all, reduce the weight or range"
    ],
  },

  {
    id: 'bird-dog-rehab',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Bird Dog — Core Rehab',
    // NOT generalPurpose. Caught by the rename: stripping "— Core Rehab"
    // collided with the existing general `bird-dog` in strength.js, which
    // is the signal that this entry is redundant for anybody without a
    // condition. Two identically-named exercises in one selection pool is
    // its own bug. Keeps the clinical name, because here the name is
    // doing real work.
    
    youtube: 'bird dog - core rehab exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'lower-back',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back', 'abdominals', 'glutes'],
    contraindications: ['lower-back-acute', 'wrist-elbow-acute'],
    caution: ['glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Start on hands and knees, wrists under shoulders, knees under hips',
      'Engage your core gently — spine neutral, not arched or rounded',
      'Slowly extend your right arm forward and left leg back at the same time',
      'Hips stay level — do not rotate or hike',
      'Hold for 3 seconds, return slowly',
      'Complete 10 reps each side, 3 sets'
    ],
    coaching: 'Imagine a glass of water on your lower back. Do not spill it.',
    why: 'Trains the deep spinal stabilisers in a low-load, safe position. A standard first-line exercise in lower back rehabilitation worldwide.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35,
    sets: 2,
    reps: "6 each side",
    holdSeconds: 5,
    rest: 45,
    description: "On hands and knees. Brace your core gently. Extend one arm and the opposite leg until both are parallel to the floor. Hold 5 seconds. Return slowly. Alternate sides.",
    cues: [
      "Keep your hips level throughout — no rotation",
      "Extend from the hip and shoulder, not from the spine",
      "Draw the belly button gently toward the spine before you move",
      "Return as slowly as you extended"
    ],
  },

  {
    id: 'mckenzie-extension',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'McKenzie Press-Up',
    youtube: 'mckenzie press-up exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'lower-back',
    movementPattern: 'spinal-flexion-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['lower-back'],
    contraindications: ['lower-back-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie face down, hands flat on the floor under your shoulders',
      'Keeping your hips on the floor, slowly press your upper body up',
      'Go only as far as feels comfortable — your hips should stay heavy on the floor',
      'Hold for 2 seconds at the top',
      'Lower slowly',
      'Complete 10 reps'
    ],
    coaching: 'This is a directional exercise — it helps some back conditions and not others. If it increases leg pain or makes symptoms worse, stop and see a physio.',
    why: 'McKenzie extension reduces disc pressure and is one of the most evidence-backed treatments for discogenic lower back pain and sciatica.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'sciatic-neural-floss',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Sciatic Neural Flossing',
    youtube: 'sciatic neural flossing exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'sciatica',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['sciatica', 'lower-back', 'hamstring'],
    contraindications: ['lower-back-acute'],
    caution: ['hamstring-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Sit upright in a chair',
      'Slowly straighten your right knee while simultaneously extending your neck — looking up',
      'Hold for just 1 second — this is not a held stretch',
      'Bend the knee back and drop your chin to your chest',
      'Repeat rhythmically — the movement is like a slow pump',
      'Complete 30 reps each side'
    ],
    coaching: 'Neural flossing should never cause sharp pain down the leg. A gentle pulling sensation is expected. If it causes sharp pain, stop.',
    why: 'Mobilises the sciatic nerve by creating a pumping action that reduces inflammation and adhesions along the nerve path.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'seated-lumbar-rotation',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Seated Lumbar Rotation',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'seated lumbar rotation exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'lower-back',
    movementPattern: 'spinal-rotation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['lower-back', 'spine'],
    contraindications: ['lower-back-acute'],
    caution: ['lower-back-subacute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit upright in a chair, feet flat on the floor',
      'Cross your arms over your chest',
      'Slowly rotate your upper body to the right — as far as feels comfortable',
      'Hold for 2 seconds',
      'Return to centre and rotate left',
      'Complete 10 reps each side'
    ],
    coaching: 'Move from your mid-back, not just your shoulders. Imagine your spine is the axis of rotation.',
    why: 'Maintains spinal rotation mobility and reduces stiffness — safe in the acute phase because it is unloaded and low range.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 15
  },

  {
    id: 'ql-stretch-side-bend',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'QL Stretch — Side Bend',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'ql stretch - side bend exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'lower-back',
    movementPattern: 'stretch',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['lower-back'],
    contraindications: [],
    caution: ['lower-back-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand with feet hip-width apart',
      'Raise your right arm overhead',
      'Lean slowly to the left, reaching the right arm over in an arc',
      'You should feel a stretch along the right side of your lower back',
      'Hold for 30 seconds, then switch sides',
      'Repeat 3 times each side'
    ],
    coaching: 'Keep your hips level — they want to shift as you lean. Resist that to get the stretch in the right place.',
    why: 'Stretches the quadratus lumborum — the deep lower back muscle that is one of the most common sources of lower back tightness and pain.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'mcgill-curl-up',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'McGill Curl-Up',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'mcgill curl-up exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'abdominals',
    movementPattern: 'anti-extension',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals'],
    contraindications: ['lower-back-acute', 'abdominals-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back, right knee bent and foot flat, left leg straight',
      'Place both hands under your lower back to maintain its natural arch',
      'Lift only your head and shoulders — not a full sit-up, just a few centimetres',
      'Keep your lower back pressed into your hands throughout',
      'Hold for 10 seconds, then lower',
      'Complete 3 sets of 5 reps'
    ],
    coaching: 'The hands under the back are not for comfort — they hold the natural spinal curve that protects the discs. Without them, this becomes a harmful crunch.',
    why: 'Developed by spine researcher Stuart McGill — activates the rectus abdominis while maintaining spinal alignment. Safer than sit-ups or crunches for most back conditions.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30,
    sets: 3,
    reps: "10",
    holdSeconds: 8,
    rest: 45,
    description: "Lie on your back, one knee bent and one leg straight. Place your hands under your lower back to maintain its natural curve. Lift your head and shoulders slightly — spine stays neutral. Hold 8 seconds. Lower slowly.",
    cues: [
      "This is not a sit-up — you lift barely 2-3 inches",
      "Your lower back stays in its natural curve throughout",
      "Elbows on the floor, hands under the curve",
      "Hold the top position — do not crunch and release"
    ],
  },

  {
    id: 'side-plank-modified',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Side Plank — Modified',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'side plank - modified exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'abdominals',
    movementPattern: 'anti-lateral-flexion',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['abdominals', 'lower-back', 'glutes'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute', 'abdominals-acute', 'glutes-acute', 'lower-back-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Lie on your right side, knees bent, elbow under your shoulder',
      'Lift your hips off the floor, forming a straight line from knees to head',
      'Keep your core engaged and hips forward — do not let them roll',
      'Hold for 15 to 20 seconds to start, building over time',
      'Lower and switch sides',
      'Complete 3 holds each side'
    ],
    coaching: 'The modified version from knees is completely valid. Build the hold time before progressing to full side plank from feet.',
    why: 'Trains the lateral core — the quadratus lumborum and obliques — which resist sideways bending forces on the spine. Part of the McGill Big Three for back rehabilitation.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35,
    sets: 2,
    reps: "each side",
    holdSeconds: 20,
    rest: 45,
    description: "Lie on your side. Prop yourself up on your forearm, elbow under shoulder. Lift your hips to form a straight line. Hold. Repeat on the other side.",
    cues: [
      "Hips stacked — do not let the top hip drop forward",
      "Modified version: keep knees down, lift from the knee",
      "Push the floor away through your forearm",
      "Breathe normally throughout"
    ],
  }


  ,

  // ============================================
  // PELVIC FLOOR REHABILITATION — Batch 11a
  // Addresses: pelvic-floor condition
  // Safe for all genders. Full release as important as contraction.
  // ============================================

  {
    id: 'kegel-basic',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Pelvic Floor Contraction — Basic',
    youtube: 'pelvic floor contraction - basic exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'pelvic-floor',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['pelvic-floor', 'abdominals'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Sit, stand, or lie comfortably — this works in any position',
      'Imagine you are trying to stop the flow of urine and hold in wind at the same time',
      'Gently squeeze and lift the muscles inward and upward',
      'Hold for 5 seconds — breathe normally, do not hold your breath',
      'Release fully and rest for 5 seconds — the full release matters as much as the squeeze',
      'Repeat 10 times, 3 sets per day'
    ],
    coaching: 'Most people hold their breath or tense their glutes and thighs instead. Check: can you still breathe freely? If not, reduce the effort.',
    why: 'Strengthens the pelvic floor — the hammock of muscles supporting the bladder, bowel, and reproductive organs. Weak pelvic floor contributes to leakage, prolapse risk, and low back instability.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 15
  },

  {
    id: 'kegel-quick-flicks',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Pelvic Floor Quick Flicks',
    youtube: 'pelvic floor quick flicks exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'pelvic-floor',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['pelvic-floor'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit or stand comfortably',
      'Perform a quick, sharp contraction of the pelvic floor — squeeze and immediately release',
      'The movement is fast — about 1 second on, 1 second off',
      'Complete 10 quick flicks, then rest for 10 seconds',
      'Repeat 3 times'
    ],
    coaching: 'Quick flicks train the fast-twitch pelvic floor fibres — the ones that respond to a cough, sneeze, or jump. Both slow holds and quick flicks are needed.',
    why: 'The fast-twitch pelvic floor muscles prevent leakage during sudden pressure increases. Slow holds alone do not train this.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 15
  },

  {
    id: 'bridge-pelvic-floor',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Glute Bridge with Pelvic Floor',
    youtube: 'glute bridge with pelvic floor exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'pelvic-floor',
    movementPattern: 'hinge',
    equipment: [],
    equipmentOptional: ['yoga-mat'],
    affectsAreas: ['pelvic-floor', 'glutes', 'lower-back'],
    contraindications: [],
    caution: ['glutes-acute', 'lower-back-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet flat on the floor',
      'On your inhale, prepare',
      'On your exhale, gently engage your pelvic floor as you press through your feet to lift your hips',
      'Hold the bridge at the top for 3 seconds — maintain the pelvic floor engagement',
      'Inhale as you lower back down, releasing the pelvic floor completely',
      'Complete 10 reps, 3 sets'
    ],
    coaching: 'Linking pelvic floor engagement to the exhale and the lift mirrors how the pelvic floor naturally works with breathing and movement.',
    why: 'Integrates pelvic floor activation into a functional movement pattern — a step beyond isolated contractions toward real-world strength.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  },

  {
    id: 'squat-pelvic-floor',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Squat with Pelvic Floor Awareness',
    youtube: 'squat with pelvic floor awareness exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'maintenance',
    activationTarget: 'pelvic-floor',
    movementPattern: 'squat',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['pelvic-floor', 'glutes', 'quadriceps'],
    contraindications: ['knee-acute'],
    caution: ['glutes-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 90,
    perSide: false,
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly turned out',
      'As you lower into the squat, allow the pelvic floor to gently lengthen and release',
      'At the bottom, pause for 1 second',
      'As you stand up and exhale, gently engage the pelvic floor — squeeze and lift',
      'At the top, fully release before the next rep',
      'Complete 3 sets of 12 reps, moving slowly'
    ],
    coaching: 'The pelvic floor should lengthen on the way down and lift on the way up — like a lift going down as you descend and up as you rise.',
    why: 'Trains the pelvic floor to work dynamically under load — the functional demand it faces in daily life and sport.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  // ============================================
  // HYPERMOBILITY REHABILITATION — Batch 11b
  // Addresses: hypermobility condition (EDS, HSD, generalised hypermobility)
  // CRITICAL: No end-range passive stretching. All items prioritise STABILITY.
  // ============================================

  {
    id: 'hypermobility-joint-awareness',
    position: 'standing',
    impact: false,
    balanceDemand: true,
    name: 'Joint Position Awareness',
    youtube: 'joint position awareness exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'hypermobility',
    movementPattern: 'proprioception',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['full-body'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 300,
    perSide: false,
    instructions: [
      'Sit or stand in a comfortable, neutral position',
      'Bring attention to your joints one at a time — ankles, knees, hips, spine, shoulders, wrists',
      'For each joint, notice: is it in its neutral, mid-range position?',
      'Gently adjust any joint that has drifted to end range — locked knees, hyperextended elbows',
      'Hold the mid-range position with gentle muscular effort — do not lock out',
      'Spend 5 minutes practising finding and holding neutral alignment'
    ],
    coaching: 'People with hypermobility often unconsciously rest in their ligaments rather than their muscles. This practice builds the habit of active mid-range holding.',
    why: 'Proprioception — the sense of joint position — is often reduced in hypermobility. Training it is the foundation of managing hypermobile joints safely.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'hypermobility-knee-stability',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Knee Stability — Soft Knee Hold',
    youtube: 'knee stability - soft knee hold exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'acute',
    activationTarget: 'hypermobility',
    movementPattern: 'isometric',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['knee', 'quadriceps'],
    contraindications: [],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Stand on your right leg near a wall for balance if needed',
      'Bend the knee to about 10 to 15 degrees — just enough so it is not locked straight',
      'Hold this soft-knee position using your quad muscles — actively, not passively',
      'You should feel a gentle engagement in the front of the thigh',
      'Hold for 20 seconds, then stand normally',
      'Repeat 5 times each side'
    ],
    coaching: 'This tiny bend is doing a lot. Locking the knee out is easy — holding it slightly bent with muscular control takes real work for hypermobile joints.',
    why: 'Trains the quads to actively stabilise the knee rather than relying on the ligaments. Reduces knee hyperextension, pain, and instability.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 20
  },

  {
    id: 'hypermobility-shoulder-packing',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Shoulder Packing',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'shoulder packing exercise technique',
    category: 'rehabilitation',
    contentType: 'activation',
    rehabPhase: 'acute',
    activationTarget: 'hypermobility',
    movementPattern: 'scapular-activation',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'upper-back'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Sit or stand with arms relaxed at your sides',
      'Without shrugging, gently draw your shoulder blades down and back — not hard, just engaged',
      'Hold for 5 seconds',
      'Release fully',
      'Repeat 10 times',
      'Begin to notice this position throughout the day and return to it when shoulders drift'
    ],
    coaching: 'Think of your shoulder blades sliding into back pockets. The movement is subtle — not a big retraction.',
    why: 'Creates active shoulder girdle stability — essential for hypermobile shoulders that rely on passive structures and are prone to subluxation and pain.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 15
  },

  {
    id: 'hypermobility-hip-stability',
    position: 'standing',
    impact: false,
    balanceDemand: true,
    name: 'Hip Stability in Standing',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'hip stability in standing exercise technique',
    category: 'rehabilitation',
    contentType: 'rehabilitation',
    rehabPhase: 'subacute',
    activationTarget: 'hypermobility',
    movementPattern: 'proprioception',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip', 'glutes', 'lower-back'],
    contraindications: ['glutes-acute', 'lower-back-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Stand on your right leg, left foot just hovering off the floor',
      'Check: is your hip in neutral? Avoid hiking it up or dropping it',
      'Find the position where your pelvis is level and hips directly over the foot',
      'Hold with gentle glute and core activation — not gripping, just engaged',
      'Hold for 30 seconds, switch sides',
      'Complete 3 holds each side'
    ],
    coaching: 'Most hypermobile people stand by hanging into the hip — ligaments taking the load. This builds the muscular alternative.',
    why: 'Single-leg hip stability is essential for every step taken, for stairs, and for any sport. Building it reduces hip pain and the risk of joint damage over time.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  }


  ,

  // REHABILITATION EXPANSION — Final 10 items

  {
    id: 'rehab-knee-terminal-extension',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Knee Terminal Extension',
    youtube: 'knee terminal extension exercise technique',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'extension',
    rehabPhase: 'subacute',
    activationTarget: 'knee',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'knee'],
    contraindications: ['knee-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Anchor a resistance band at knee height and loop it behind the knee',
      'Stand with the leg slightly bent — about 15 to 20 degrees',
      'Extend the knee to full straight — squeeze the quad at the end',
      'Return to slight bend slowly',
      'Complete 3 sets of 15 reps each side'
    ],
    coaching: 'Terminal extension specifically targets the VMO — the inner quad muscle most affected by knee injury and most responsible for knee stability.',
    why: 'Knee terminal extension is a core exercise in ACL and patellofemoral rehabilitation — it restores the final degrees of extension strength without loading the joint in vulnerable positions.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'rehab-shoulder-y-t-w',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Y-T-W Exercise',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'y-t-w exercise technique',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'pull',
    rehabPhase: 'subacute',
    activationTarget: 'shoulder',
    equipment: [],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['upper-back', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: false,
    instructions: [
      'Lie face down on a bench or floor',
      'Y: raise both arms to form a Y — thumbs up — 10 reps',
      'T: raise both arms to form a T — thumbs up — 10 reps',
      'W: bend elbows to 90 degrees and raise, squeezing shoulder blades — 10 reps',
      'Use a very light weight or no weight to start',
      'Complete 3 sets of each'
    ],
    coaching: 'The Y-T-W directly targets the lower and middle trapezius — muscles almost universally undertrained and responsible for shoulder stability.',
    why: 'Y-T-W is a clinical rehabilitation staple for shoulder impingement, rotator cuff issues, and postural dysfunction. Restores scapular control and stability.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  {
    id: 'rehab-ankle-proprioception',
    position: 'standing',
    impact: false,
    balanceDemand: true,
    name: 'Ankle Proprioception Progression',
    youtube: 'ankle proprioception progression exercise technique',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'balance',
    rehabPhase: 'subacute',
    activationTarget: 'ankle-foot',
    equipment: [],
    equipmentOptional: ['balance-board'],
    affectsAreas: ['ankle-foot', 'calves'],
    contraindications: ['ankle-foot-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Level 1: Single-leg stand on flat ground — 60 seconds each side',
      'Level 2: Single-leg stand on a folded towel — 45 seconds',
      'Level 3: Single-leg stand with eyes closed on flat ground — 30 seconds',
      'Level 4: Single-leg stand on a balance board — 45 seconds',
      'Progress levels only when the current level is fully controlled',
      'Complete 3 sets at whatever level is currently appropriate'
    ],
    coaching: 'Ankle sprains damage the nerves that tell you where your foot is as much as they damage the ligaments. Restoring balance and proprioception prevents re-injury more than any other intervention.',
    why: 'Proprioception training is the most important component of ankle sprain rehabilitation — people who skip this step have very high re-injury rates within the first year of return to sport.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  {
    id: 'rehab-wrist-flexion-extension',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Wrist Flexion-Extension Strengthening',
    youtube: 'wrist flexion-extension strengthening exercise technique',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'joint-rotation',
    rehabPhase: 'subacute',
    activationTarget: 'wrist-elbow',
    equipment: ['dumbbell'],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['wrist-elbow'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Sit with the forearm resting on a table, wrist over the edge',
      'Hold a light dumbbell — 0.5 to 1kg',
      'Flex the wrist upward — palm faces up, lift',
      'Lower with control',
      'Complete 3 sets of 20 reps',
      'Then flip the forearm over for extension: palm down, raise the back of the hand'
    ],
    coaching: 'Start lighter than feels necessary. Wrist tendons are slow to recover and easy to re-injure with too much load too soon.',
    why: "Wrist flexor and extensor strengthening restores the forearm strength balance disrupted by tennis elbow, golfer's elbow, and repetitive strain injuries.",
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 35
  },

  {
    id: 'rehab-cervical-deep-flexors',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Deep Cervical Flexor Activation',
    youtube: 'deep cervical flexor activation exercise technique',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'isometric',
    rehabPhase: 'acute',
    activationTarget: 'neck',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder'],
    contraindications: [],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 60,
    perSide: false,
    instructions: [
      'Lie on your back, a small rolled towel under the neck',
      'Gently nod the chin toward the chest — as if squashing a small orange under the chin',
      'The movement is very small — 5 to 10 degrees only',
      'Hold for 10 seconds, breathing normally',
      'Release completely',
      'Repeat 10 times'
    ],
    coaching: 'This is a subtle exercise — not a strong chin tuck. The deep cervical flexors are small and fatigue quickly. Quality of activation is everything.',
    why: 'Deep cervical flexor weakness is present in almost all people with neck pain and headaches. This specific activation exercise is the cornerstone of neck pain rehabilitation.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'rehab-hip-flexor-strengthening',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Hip Flexor Strengthening',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'hip flexor strengthening exercise technique',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'hip-rotation',
    rehabPhase: 'subacute',
    activationTarget: 'hip',
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['hip-flexor', 'abdominals'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 90,
    perSide: true,
    instructions: [
      'Loop a resistance band around your ankle and anchor it behind you',
      'Stand on one leg, face away from the anchor',
      'Drive the banded knee up to hip height against the resistance',
      'Lower with control — resist the band pulling the leg back',
      'Complete 3 sets of 15 reps each side'
    ],
    coaching: 'Hip flexor weakness is often overlooked in lower back and hip pain rehabilitation. It is one of the most important muscles for gait, stair climbing, and running.',
    why: 'Hip flexor strength — not just flexibility — is essential for healthy hip mechanics. Weakness leads to compensatory patterns that drive knee, hip, and lower back pain.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 40
  },

  {
    id: 'rehab-lateral-hip-strengthening',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Lateral Hip Strengthening Progression',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'lateral hip strengthening progression exercise technique',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'hip-rotation',
    rehabPhase: 'subacute',
    activationTarget: 'hip',
    equipment: [],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: [],
    caution: ['glutes-acute'],
    energyRequired: 3,
    difficultyLevel: 3,
    duration: 90,
    perSide: true,
    instructions: [
      'Clamshells × 20 each side',
      'Side-lying leg raise × 15 each side',
      'Standing hip abduction × 15 each side',
      'Single-leg squat touch-down × 10 each side (touch toe to floor, return)',
      'Progress through phases as each becomes easy',
      'Add a resistance band around the knees for additional load'
    ],
    coaching: 'Lateral hip strength is the foundation of lower limb health — it affects knee alignment, IT band tension, and lower back stability all at once.',
    why: 'Lateral hip weakness is implicated in patellofemoral pain, IT band syndrome, gluteal tendinopathy, and lower back pain. A single rehabilitation series addresses all of these.',
        watchOut: [
      "If your form falls apart partway through, stop there rather than finishing the numbers. The last exercise is the hardest and comes when the others are tired on purpose",
      "If the single-leg touch-down has your knee falling inward, hold a wall and go less deep, or leave that part out until the rest is comfortable",
      "If you are sore for more than two days afterwards, halve the reps next time and build up"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 50
  },

  {
    id: 'rehab-thoracic-mobility-rehab',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Thoracic Mobility',
    generalPurpose: true,   // C2, approved 13 Aug 2026
    youtube: 'thoracic mobility - rehabilitation exercise technique',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'extension',
    rehabPhase: 'subacute',
    activationTarget: 'thoracic',
    equipment: [],
    equipmentOptional: ['foam-roller', 'yoga-mat'],
    affectsAreas: ['thoracic', 'upper-back'],
    contraindications: [],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 90,
    perSide: false,
    instructions: [
      'Foam roller extension: 5 segments × 5 breaths each',
      'Seated rotation: 10 each side',
      'Thread the needle from hands and knees: 10 each side',
      'Wall slides: 10 reps',
      'Open book from side-lying: 10 each side',
      'Complete daily in the early phases of rehabilitation'
    ],
    coaching: 'Thoracic stiffness is a primary contributor to neck pain, shoulder impingement, and lower back pain — often overlooked in rehabilitation programs that treat these in isolation.',
    why: 'Thoracic mobility restoration is foundational for shoulder, neck, and lower back rehabilitation. Improving thoracic movement reduces compensatory demands on adjacent joints.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 45
  },

  {
    id: 'rehab-breathing-rehab',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Breathing Retraining — Rehabilitation',
    youtube: 'breathing retraining - rehabilitation exercise technique',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'breath-awareness',
    rehabPhase: 'acute',
    activationTarget: 'abdominals',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'lower-back'],
    contraindications: [],
    caution: ['lower-back-acute'],
    energyRequired: 1,
    difficultyLevel: 1,
    duration: 120,
    perSide: false,
    instructions: [
      'Lie on your back, knees bent, feet flat',
      'Place one hand on the chest, one on the belly',
      'Breathe in — the belly hand should rise, the chest hand should stay still',
      'This is diaphragmatic breathing — belly breathing',
      'If the chest rises first, the breathing pattern is inverted',
      'Practice 10 minutes of belly-only breathing',
      'Once established lying down, practice seated, then standing'
    ],
    coaching: 'Diaphragmatic breathing restores intra-abdominal pressure regulation — the foundation of core stability. Without it, all other core rehabilitation is built on unstable ground.',
    why: 'Altered breathing patterns are found in almost all people with chronic lower back pain and postural dysfunction. Restoring diaphragmatic breathing is the first step in core rehabilitation.',
        watchOut: [
      'Progressing to the next stage before the current one is comfortable and pain-free',
      'Working into pain rather than up to the edge of it',
      'Doing the exercise once and expecting change; this kind of work does its job through repetition over weeks',
      'If something is worse for more than a day, ease the load right back. If it keeps happening, it is worth getting someone to look at it'
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 25
  },

  {
    id: 'rehab-neural-flossing',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Neural Flossing — Sciatic Nerve',
    youtube: 'neural flossing - sciatic nerve exercise technique',
    category: 'rehabilitation',
    contentType: 'exercise',
    movementPattern: 'extension',
    rehabPhase: 'subacute',
    activationTarget: 'sciatica',
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'lower-back'],
    contraindications: ['sciatica-acute'],
    caution: ['hamstring-acute', 'lower-back-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 60,
    perSide: true,
    instructions: [
      'Sit upright on the edge of a chair',
      'Extend the right leg straight, simultaneously look up',
      'Return: bend the knee and look down',
      'This creates a pumping action through the sciatic nerve',
      'The movement should feel like a gentle pull — never sharp pain',
      'Complete 10 very slow reps each side'
    ],
    coaching: 'Neural flossing creates movement of the nerve through its pathway — like flossing between teeth. If any movement produces sharp radiating pain, stop immediately.',
    why: 'Neural mobilisation techniques improve nerve mobility and reduce neural tension in sciatica rehabilitation. Evidence shows superior outcomes compared to stretching alone.',
        watchOut: [
      "If you are holding at the end, release it. A pump, not a stretch",
      "If pain travels further down the leg, stop. This should ease symptoms, not chase them",
      "If you are going hard and fast, slow right down. Gentle and slow is the entire method"
    ],
    load: 'Light, and only as much as keeps you pain-free. Little and often beats a lot, once.',
    credits: 30
  }

];
