/**
 * js/data/exercises/held_movements.js
 * 01 Nov 2026 v1
 *
 * P-20 TRENDS-BUILD, the held entries (master schedule v614). The ten new
 * movements the fitness-trend content needs, written to
 * docs/exercise_entry_standard.md v6 from the drafts Graeme approved on
 * 01 Nov (BNH-Files Product/):
 *   alongside_content_trends-zone2-snacks-cross_01nov2026_v2.md §4a  Uphill walk
 *   alongside_content_trends-hilit_01nov2026_v2.md §5     the three sliders
 *   alongside_content_trends-hybrid_01nov2026_v2.md §5    sled pull, burpee broad
 *                                                         jump, walking lunge with
 *                                                         a load, wall ball
 *   alongside_content_trends-reformer_01nov2026_v2.md §6  footwork, feet in straps
 *
 * HELD UNTIL THE CLINICAL READ (P-18; Graeme, 01 Nov: "Build now, new
 * entries held"). Nothing in the app imports this file: it is not in
 * EXERCISES, not in PATH_MOVEMENTS, not a swap, not a search result, not
 * in any recipe (data/trend-recipes.js HELD keeps their ids out, and each
 * recipe plays its stated substitute instead). Their figures are drawn
 * (data/figures/batch-16.js) so Graeme can look at them on the Figure
 * Review page. tools/verify-held-movements.mjs holds all of this.
 *
 * To release one after the clinical read: move it into its library file
 * (with any changes the read asks for), take its id out of HELD, and the
 * gate's "held" tests will say what else to change.
 *
 * Contraindications and caution follow each entry's nearest existing
 * analogue (named on the entry, `analogue`), as HOME-BANDS did; they are
 * proposals for the clinical read. No adaptations are written (entry
 * standard rule 8: unreviewed proposals do not ship).
 */

export const HELD_MOVEMENTS = Object.freeze([
  // ── Zone 2: a walker's hard day outside (approved 01 Nov) ───────────────
  {
    id: "uphill-walk", name: "Uphill Walk", analogue: "brisk-walk",
    position: "standing", impact: false, balanceDemand: false,
    category: "cardio", movementPattern: "locomotion",
    doors: ["moving"], feelings: [], style: "exercise",
    equipment: [], equipmentOptional: [],
    affectsAreas: ["full-body"], contraindications: [], caution: ["hamstring-acute", "lower-back-acute"],
    energyRequired: 6, difficultyLevel: 2, duration: 1500, perSide: false, credits: 45,
    youtube: "uphill walking technique",
    instructions: [
      "Walk on the flat for five minutes to warm up",
      "Find a hill, a long slope or a set of steps",
      "Walk up at a pace where you can only say a few words at a time",
      "Walk back down slowly, letting your breath settle. Repeat for about fifteen minutes",
      "Finish with five minutes of easy walking on the flat",
    ],
    coaching: "Shorter steps on the way up, and let your arms swing. On the way down, slow is fine.",
    why: "Walking uphill makes you work harder than walking on the flat, so a walker gets a hard day without running.",
    watchOut: [
      "Leaning far forward from the waist instead of from the ankles",
      "Rushing the way down",
      "Holding your breath on the steepest part",
    ],
    load: "Hard on the way up, by the talk test: only a few words at a time.",
  },

  // ── HILIT: the three sliders (approved 01 Nov) ──────────────────────────
  {
    id: "slider-reverse-lunge", name: "Slider Reverse Lunge", analogue: "reverse-lunge",
    position: "standing", impact: false, balanceDemand: false,
    category: "strength", movementPattern: "lunge",
    doors: ["stronger"], feelings: [], style: "exercise",
    equipment: [], equipmentOptional: [],
    affectsAreas: ["quadriceps", "glutes", "hamstring"], contraindications: ["knee-acute", "hamstring-acute", "glutes-acute"], caution: [],
    energyRequired: 5, difficultyLevel: 2, duration: 90, perSide: true, credits: 55,
    youtube: "slider reverse lunge",
    instructions: [
      "Stand with one foot on a towel on a smooth floor, or on a paper plate on carpet",
      "Slide that foot back as you bend both knees into a lunge",
      "Go only as low as is comfortable today",
      "Press through the front foot and slide the back foot in to stand",
      "Do all your reps on one side, then swap",
    ],
    coaching: "Keep most of your weight on the front foot; the sliding foot only glides.",
    why: "The slide keeps the back foot on the floor the whole time, so the lunge works your legs with nothing leaving the ground.",
    watchOut: [
      "The front knee falling inwards",
      "Leaning forward a long way",
      "Letting the towel shoot back fast",
    ],
    load: "Hard by the talk test in a HILIT burst, by moving steadily for the whole time.",
  },
  {
    id: "slider-lateral-lunge", name: "Slider Lateral Lunge", analogue: "lateral-lunge-reach",
    position: "standing", impact: false, balanceDemand: false,
    category: "strength", movementPattern: "lunge",
    doors: ["stronger"], feelings: [], style: "exercise",
    equipment: [], equipmentOptional: [],
    affectsAreas: ["adductors", "hip", "quadriceps"], contraindications: ["knee-acute", "hip-acute"], caution: [],
    energyRequired: 5, difficultyLevel: 2, duration: 90, perSide: true, credits: 55,
    youtube: "slider lateral lunge",
    instructions: [
      "Stand with feet hip-width apart, one foot on the towel or plate",
      "Slide that foot out to the side as you bend the other knee and sit your hips back",
      "Keep the sliding leg straight and go only as far as is comfortable today",
      "Press through the bent leg and slide the foot back in to stand",
      "Do all your reps on one side, then swap",
    ],
    coaching: "Your chest stays up and the bent knee points over your toes.",
    why: "It works your legs side to side, which most leg work doesn't, without stepping or jumping.",
    watchOut: [
      "The bent knee caving in",
      "Rounding your back",
      "Sliding further than you can come back from",
    ],
    load: "Hard by the talk test in a HILIT burst, by moving steadily for the whole time.",
  },
  {
    id: "slider-mountain-climber", name: "Slider Mountain Climber", analogue: "mountain-climbers",
    position: "floor", impact: false, balanceDemand: false,
    category: "cardio", movementPattern: "anti-extension",
    doors: ["moving"], feelings: [], style: "exercise",
    equipment: [], equipmentOptional: ["yoga-mat"],
    affectsAreas: ["core", "shoulder", "hip-flexor"], contraindications: ["shoulder-acute", "wrist-elbow-acute"], caution: [],
    energyRequired: 6, difficultyLevel: 2, duration: 60, perSide: false, credits: 60,
    youtube: "slider mountain climbers",
    instructions: [
      "Start in a high plank with your hands under your shoulders and a towel or plate under each foot",
      "Slide one knee in towards your chest, then slide it back",
      "Swap legs, in a steady rhythm",
      "Keep your hips level with your shoulders",
      "Slow down, or rest your knees on the floor, whenever you need to",
    ],
    coaching: "Steady, not fast; the feet stay on the floor.",
    why: "Like Mountain Climbers, it gets you out of breath and works your middle. The feet glide, so there is no hopping.",
    watchOut: [
      "Hips lifting high",
      "Sagging in the lower back",
      "Wrists aching: rest on your fists or forearms",
    ],
    load: "Hard by the talk test in a HILIT burst, by moving steadily for the whole time.",
  },

  // ── Hybrid training: four stations (approved 01 Nov) ────────────────────
  {
    id: "sled-pull", name: "Sled Pull", analogue: "gym-sled-push",
    position: "standing", impact: false, balanceDemand: false,
    category: "strength", movementPattern: "pull",
    doors: ["stronger"], feelings: [], style: "exercise",
    equipment: ["sled"], equipmentOptional: [],
    affectsAreas: ["upper-back", "shoulder", "biceps-triceps", "glutes", "hamstring"], contraindications: ["shoulder-acute", "lower-back-acute"], caution: ["knee-acute"],
    energyRequired: 8, difficultyLevel: 3, duration: 180, perSide: false, credits: 90,
    sets: 1, reps: "for the station's time", rest: 60,
    youtube: "sled pull rope technique",
    instructions: [
      "Attach a rope or straps to the sled and walk back until the rope is straight",
      "Stand with feet hip-width apart, knees soft, and hold the rope with both hands",
      "Pull the rope in hand over hand, or step backwards pulling with straight arms",
      "Keep your back flat and your chest up the whole time",
      "Walk forward to the sled and repeat until the station's time is up",
    ],
    coaching: "Sit back into your hips and let your legs help the pull.",
    why: "It works your back, arms and legs together, which a row alone doesn't.",
    watchOut: [
      "Rounding your back",
      "Yanking with the arms alone",
      "A load too heavy to move smoothly",
    ],
    load: "Heavy enough that the station feels Hard, light enough to keep it moving.",
  },
  {
    id: "burpee-broad-jump", name: "Burpee Broad Jump", analogue: "burpee",
    position: "floor", impact: true, balanceDemand: false,
    category: "cardio", movementPattern: "jump",
    doors: ["stronger"], feelings: [], style: "exercise",
    equipment: [], equipmentOptional: [],
    affectsAreas: ["full-body"], contraindications: ["knee-acute", "shoulder-acute", "wrist-elbow-acute", "ankle-foot-acute"], caution: ["hamstring-acute", "glutes-acute"],
    energyRequired: 9, difficultyLevel: 4, duration: 180, perSide: false, credits: 80,
    youtube: "burpee broad jump technique",
    instructions: [
      "From standing, squat, put your hands down and step or jump your feet back to a plank",
      "Lower your chest towards the floor, then push back up",
      "Step or jump your feet back towards your hands",
      "Jump forward with both feet, landing softly with your knees bent",
      "Repeat from where you landed",
    ],
    coaching: "A shorter jump you land quietly beats a long one you crash into.",
    why: "It's one of the eight stations, and it trains getting down to the floor and up again quickly.",
    watchOut: [
      "Landing with straight knees",
      "The lower back sagging in the plank",
      "Rushing so the movement gets sloppy",
    ],
    load: "Bodyweight; Hard by the talk test. The no-jump version is offered beside it every time.",
  },
  {
    id: "loaded-walking-lunge", name: "Walking Lunge with a Load", analogue: "dumbbell-reverse-lunge",
    position: "standing", impact: false, balanceDemand: true,
    category: "strength", movementPattern: "lunge",
    doors: ["stronger"], feelings: [], style: "exercise",
    equipment: ["dumbbell"], equipmentOptional: ["sandbag"],
    affectsAreas: ["quadriceps", "glutes", "hamstring", "core"], contraindications: ["knee-acute", "hamstring-acute", "glutes-acute"], caution: ["lower-back-acute"],
    energyRequired: 7, difficultyLevel: 3, duration: 180, perSide: false, credits: 65,
    sets: 1, reps: "for the station's time", rest: 60,
    youtube: "sandbag walking lunge technique",
    instructions: [
      "Hold a sandbag across your shoulders behind your neck, hug it at your chest, or hold a dumbbell in each hand at your sides",
      "Step forward into a lunge, lowering your back knee towards the floor only as far as is comfortable today",
      "Push through the front foot and bring the back foot forward into the next lunge",
      "Keep your chest up and your front knee in line with your toes",
      "Carry on for the station's time; turn round when you run out of room",
    ],
    coaching: "Steady steps, with a short pause at the bottom if that helps your balance.",
    why: "Carrying a weight while you lunge works your legs, and your middle has to hold you steady.",
    watchOut: [
      "The front knee falling inwards",
      "Leaning forward",
      "A load that pulls your posture out of shape",
    ],
    load: "A weight you can lunge with steadily for the whole station.",
  },
  {
    id: "wall-ball", name: "Wall Ball", analogue: "medicine-ball-squat-press",
    position: "standing", impact: false, balanceDemand: false,
    category: "strength", movementPattern: "squat",
    doors: ["stronger"], feelings: [], style: "exercise",
    equipment: ["medicine-ball"], equipmentOptional: [],
    affectsAreas: ["quadriceps", "glutes", "shoulder", "abdominals"], contraindications: ["knee-acute", "shoulder-acute"], caution: ["wrist-elbow-acute"],
    energyRequired: 7, difficultyLevel: 3, duration: 180, perSide: false, credits: 65,
    sets: 1, reps: "for the station's time", rest: 60,
    youtube: "wall ball shot technique",
    instructions: [
      "Stand an arm's length from a solid wall, holding the ball at your chest",
      "Squat down only as far as is comfortable today",
      "Drive up and throw the ball to a spot on the wall above head height",
      "Catch it as it drops, bending straight into the next squat",
      "If catching is hard, let it bounce once and pick it up",
    ],
    coaching: "Use your legs to send the ball; the arms only finish it.",
    why: "A squat and a throw in one, done over and over: it works your legs and shoulders and gets you out of breath.",
    watchOut: [
      "Catching with straight arms",
      "The heels lifting at the bottom",
      "Standing too far from the wall",
    ],
    load: "A ball you can throw and catch with control. Medicine Ball Squat to Press (no throw) is offered beside it every time.",
  },

  // ── Reformer-style: two band movements (approved 01 Nov) ───────────────
  {
    id: "band-footwork", name: "Footwork with a Band", analogue: "glute-bridge",
    position: "floor", impact: false, balanceDemand: false,
    category: "strength", movementPattern: "pilates-move",
    doors: ["stronger", "feel"], feelings: [], style: "pilates",
    equipment: ["resistance-band"], equipmentOptional: ["yoga-mat"],
    affectsAreas: ["quadriceps", "glutes", "hamstring", "calves"], contraindications: ["knee-acute", "hamstring-acute", "glutes-acute"], caution: ["lower-back-acute"],
    energyRequired: 4, difficultyLevel: 2, duration: 180, perSide: false, credits: 40,
    sets: 1, reps: "10 in each foot position", rest: 30,
    youtube: "pilates footwork resistance band",
    instructions: [
      "Lie on your back with your knees bent towards your chest",
      "Put the middle of a long band round the balls of both feet and hold one end in each hand, elbows on the floor",
      "Press your legs out slowly until they are long, but not locked",
      "Bend your knees back in against the band, slowly",
      "Repeat with heels together and toes apart, then with the band under your arches",
    ],
    coaching: "Keep your lower back resting on the floor, and move at the same speed out and in.",
    why: "It is the start of a reformer class: your legs press against resistance while you lie down, so your back is supported.",
    watchOut: [
      "The lower back lifting off the floor",
      "Locking the knees at the end",
      "Letting the band snap the legs back in",
    ],
    load: "A band that makes the last few presses take effort.",
  },
  {
    id: "band-feet-in-straps", name: "Feet in Straps with a Band", analogue: "pilates-leg-circles",
    position: "floor", impact: false, balanceDemand: false,
    category: "strength", movementPattern: "pilates-move",
    doors: ["stronger", "feel"], feelings: [], style: "pilates",
    equipment: ["resistance-band"], equipmentOptional: ["yoga-mat"],
    affectsAreas: ["hip", "adductors", "glutes", "hip-flexor"], contraindications: ["hip-acute", "glutes-acute"], caution: ["lower-back-acute"],
    energyRequired: 4, difficultyLevel: 2, duration: 180, perSide: false, credits: 40,
    sets: 1, reps: "5 of each", rest: 30,
    youtube: "pilates feet in straps resistance band",
    instructions: [
      "Lie on your back with the band round both feet and an end in each hand, legs pointing up",
      "Frogs: heels together, knees open; press your legs out long on a diagonal, then bend back in",
      "Circles: with legs long, draw small circles with both legs together, five each way",
      "Openings: with legs long, open them apart, then press them back together against the band",
      "Keep the circles small enough that your lower back stays on the floor",
    ],
    coaching: "Smaller and smoother is better than bigger.",
    why: "Reformer classes use foot straps to work the hips and inner and outer thighs from lying down, and the band does the same job here.",
    watchOut: [
      "The lower back arching away from the floor",
      "Legs dropping too low",
      "Holding your breath",
    ],
    load: "A light to medium band.",
  },
]);
