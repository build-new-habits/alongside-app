/**
 * js/data/exercises/path_movements.js
 * 28 Oct 2026 v2
 *
 * v2 - STAGE PATH content session. Three Pilates stretches for the Stretch
 *   door's L4 Pilates for legs (stretch draft v2 Part 2b, approved 28 Oct:
 *   "if this is a gap in content, surely we should plug that?"): The Saw,
 *   Side-lying quad stretch, Thigh stretch. Classic Pilates mat exercises,
 *   written new; contraindications are proposals for the clinical reviewer.
 *   Feelings brought in line with content v3's five added programmes.
 *
 * v1 -
 * STAGE PATH P-9 / P-9a (blueprint Session 2). The twenty movements the
 * Move to feel better programmes need that the library did not have: six
 * tai chi, nine qigong, two yoga and three gentle movements. Written to
 * docs/exercise_entry_standard.md from the content Graeme approved on
 * 28 Oct (BNH-Files Product/alongside_content_feel-better-programmes_
 * 28oct2026_v2.md, Part 4).
 *
 * KEPT OUT OF EXERCISES ON PURPOSE. Free is left exactly as it is (Stage
 * PATH rule A1), and the session builder, the yoga player and the
 * practice list all read data/exercises/index.js EXERCISES. These are
 * reached only through the Plan's programmes (data/feel-programmes.js)
 * and the exercise card. tools/verify-path-tags.mjs holds both.
 *
 * Names and sequences. The tai chi movements use traditional, generic
 * names, not any branded programme's sequence. The qigong movements are
 * five of the Baduanjin (Eight Pieces of Brocade), a traditional set in
 * wide public use, by their common English names, plus tapping, pressing
 * the earth, gathering in and a closing breath. No video, script or
 * picture from any published course is copied: the figures are drawn new
 * (data/figures/batch-15.js).
 *
 * Breathing: natural breathing throughout. Nothing here holds or forces
 * the breath.
 *
 * Sources (for Graeme and the clinical reviewer; not shown in the app):
 * Huston and McFarlane, Canadian Family Physician 2016;62(11):881-890
 * (tai chi: adverse events usually minor and musculoskeletal); Zou et
 * al., Evid Based Complement Alternat Med 2017:4548706 (Baduanjin, 19
 * RCTs); Better Health Channel, Victoria State Government, Tai chi:
 * health benefits.
 *
 * Contraindications are proposals for the clinical reviewer (content v2,
 * Part 4), using the library's own ids. There is no neck id, so Looking
 * back uses upper-back-acute, as Seated Neck Side Stretch does.
 */

const SLOW = "Move slowly and only as far as is comfortable. If something hurts, ease off or sit down.";

const base = (o) => ({
  category: "feel-better",
  contentType: "exercise",
  equipment: [],
  impact: false,
  perSide: false,
  caution: [],
  credits: 25,
  doors: ["feel"],
  ...o,
});

export const PATH_MOVEMENTS = [
  // ── Tai chi ────────────────────────────────────────────────────────────
  base({
    id: "tc-opening-stance", name: "Opening stance", style: "taichi", movementPattern: "taichi-form",
    feelings: ["ground", "calm", "sleep"], position: "standing", balanceDemand: false,
    youtube: "tai chi opening movement commencement form beginners",
    affectsAreas: ["shoulder", "full-body"], contraindications: [],
    difficultyLevel: 1, energyRequired: 1, duration: 120,
    instructions: [
      "Stand with your feet hip-width apart, knees soft, arms resting by your sides",
      "Let your shoulders drop and your weight settle evenly through both feet",
      "Breathing naturally, let both arms float forward and up to shoulder height, wrists soft",
      "Let the elbows sink and the hands float slowly back down to your sides",
      "Keep repeating, slowly, letting the movement follow your breath",
    ],
    why: "A slow, simple start that gives you a moment to arrive before the rest. Tai chi's slow, controlled movement asks very little of the joints.",
    coaching: "Let the arms feel as if they are floating up through water rather than being lifted.",
    watchOut: [
      "Shoulders creeping up towards your ears: let them drop and lift the arms only as high as feels easy",
      "Locking the knees straight: keep a small, soft bend",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If standing is too much today, sit towards the front of a chair and float the arms the same way."],
    },
  }),
  base({
    id: "tc-weight-shift", name: "Rooted weight shift", style: "taichi", movementPattern: "taichi-form",
    feelings: ["ground", "calm"], position: "standing", balanceDemand: true,
    youtube: "tai chi weight shifting exercise beginners",
    affectsAreas: ["quadriceps", "ankle-foot", "hip"], contraindications: ["ankle-foot-acute"],
    difficultyLevel: 1, energyRequired: 2, duration: 120,
    instructions: [
      "Stand with your feet a little wider than your hips, knees softly bent, a wall or chair within reach",
      "Slowly let your weight drift towards your right foot until most of it is there",
      "Pause, feeling the floor under that foot",
      "Let the weight drift slowly back through the middle and over to the left foot",
      "Keep both feet on the floor the whole time and keep going side to side",
    ],
    why: "Moving your weight slowly from foot to foot draws your attention down to your feet and the floor, and practising steady weight transfer is part of how tai chi helps balance.",
    coaching: "Move as slowly as you can while it still feels like one smooth movement.",
    watchOut: [
      "Knees drifting in or past your toes as you shift: keep each knee over the middle of its foot",
      "Leaning the upper body sideways instead of moving from the legs: keep your head over your hips",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If you feel wobbly, rest a hand on the wall or the back of a chair and keep the shift small."],
      further: ["When the shift feels steady, stay on each side for three slow breaths."],
    },
  }),
  base({
    id: "tc-wave-hands-clouds", name: "Wave hands like clouds", style: "taichi", movementPattern: "taichi-form",
    feelings: ["ground", "calm", "worn", "sleep"], position: "standing", balanceDemand: true,
    youtube: "tai chi wave hands like clouds beginners",
    affectsAreas: ["shoulder", "spine", "hip"], contraindications: [],
    difficultyLevel: 2, energyRequired: 2, duration: 240,
    instructions: [
      "Stand with your feet a little wider than your hips, knees soft",
      "Raise one hand in front of your face, palm facing you, and the other in front of your belly, palm down",
      "Turn your waist slowly to one side, letting the hands travel with it as your weight shifts to that foot",
      "At the end of the turn, let the hands change places, the top one sinking and the lower one rising",
      "Turn slowly back the other way and keep the hands circling, like clouds passing",
    ],
    why: "The arms move in slow circles as the weight shifts, so your whole body moves together at an unhurried pace. Tai chi's slow, flowing movement suits people of most ages and fitness levels.",
    coaching: "Let the turn come from your waist and hips, and let the arms simply go along with it.",
    watchOut: [
      "Twisting the knees as you turn: keep the knees pointing the way the toes point and turn from the hips",
      "Holding the arms stiffly: let the elbows stay soft and slightly bent",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If standing is too much today, sit towards the front of a chair and move only the arms and upper body."],
      further: ["When the movement flows, take a small side step with each change of the hands."],
    },
  }),
  base({
    id: "tc-brush-knee", name: "Brush knee", style: "taichi", movementPattern: "taichi-form",
    feelings: ["ground", "calm"], position: "standing", balanceDemand: true,
    youtube: "tai chi brush knee push step beginners",
    affectsAreas: ["quadriceps", "hip", "shoulder"], contraindications: ["knee-acute"],
    difficultyLevel: 2, energyRequired: 2, duration: 180, perSide: true,
    instructions: [
      "Stand with your feet hip-width apart, knees soft",
      "Take a small step forward with one foot, heel first, keeping most of your weight on the back foot",
      "As your weight moves slowly onto the front foot, let the hand on that side sweep down and past the front knee",
      "At the same time, let the other palm move gently forward at chest height",
      "Shift back, bring the foot in and repeat on the other side",
    ],
    why: "A small step forward with a sweep of one hand and a press of the other, done slowly, so the legs, hips and arms learn to move together.",
    coaching: "Keep the step small: a short, comfortable step is steadier than a long one.",
    watchOut: [
      "The front knee travelling past the toes: take a shorter step so the knee stays over the foot",
      "Stepping onto a straight leg: land the heel softly with the knee bent",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If stepping feels unsteady, keep both feet in place and do the hand movements with a gentle shift of weight."],
      further: ["When the step feels steady, let the back knee bend a little more as the weight moves forward, never past comfortable."],
    },
  }),
  base({
    id: "tc-push-forward", name: "Pushing forward", style: "taichi", movementPattern: "taichi-form",
    feelings: ["calm"], position: "standing", balanceDemand: false,
    youtube: "tai chi push movement beginners",
    affectsAreas: ["shoulder", "quadriceps"], contraindications: ["shoulder-acute"],
    difficultyLevel: 2, energyRequired: 2, duration: 180,
    instructions: [
      "Stand with one foot a small step ahead of the other, knees soft",
      "Bring both hands up in front of your chest, palms facing forward and elbows low",
      "Shift your weight slowly onto the front foot as the palms press gently forward",
      "Shift your weight back onto the back foot as the hands draw back towards the chest",
      "Keep going forward and back, then change which foot is in front",
    ],
    why: "The push comes from your legs moving your weight, not from the arms, so it feels light while the whole body works together.",
    coaching: "Imagine pushing a door that is already swinging open: no effort in the shoulders at all.",
    watchOut: [
      "Straightening the arms fully: stop with the elbows still a little bent",
      "Leaning forward from the waist: keep your back tall and let the legs carry you",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If standing is too much today, sit tall on a chair and press the palms forward and back with the breath."],
    },
  }),
  base({
    id: "tc-closing", name: "Closing form", style: "taichi", movementPattern: "taichi-form",
    feelings: ["ground", "calm"], position: "standing", balanceDemand: false,
    youtube: "tai chi closing form beginners",
    affectsAreas: ["shoulder", "full-body"], contraindications: [],
    difficultyLevel: 1, energyRequired: 1, duration: 120,
    instructions: [
      "Stand with your feet hip-width apart, knees soft",
      "Let both hands float up in front of you to chest height, palms down",
      "Let the hands sink slowly down in front of your body to your sides",
      "Bring your feet together and stand still for a few natural breaths",
    ],
    why: "A slow ending that brings the movement to rest, so you finish standing still rather than stopping mid-flow.",
    coaching: "Take as long lowering the hands as you did on the whole of the last movement.",
    watchOut: [
      "Rushing to finish: this last part is worth taking slowly",
      "Holding your breath as you stand still: let it come and go on its own",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If standing is too much now, sit down and lower the hands to rest on your thighs."],
    },
  }),

  // ── Qigong ─────────────────────────────────────────────────────────────
  base({
    id: "qg-tapping", name: "Tapping", style: "qigong", movementPattern: "qigong-form",
    feelings: ["wake"], position: "standing", balanceDemand: false,
    youtube: "qigong tapping routine beginners",
    affectsAreas: ["full-body"], contraindications: [],
    difficultyLevel: 1, energyRequired: 2, duration: 90,
    instructions: [
      "Stand with your feet hip-width apart, knees soft, hands loose",
      "With a loose hand, tap lightly down the outside of the other arm and back up the inside",
      "Change hands and tap the other arm",
      "Tap lightly across the top of the chest, then down the outsides of the legs and up the insides",
      "Finish by letting both arms hang and stand still for a breath or two",
    ],
    why: "Light tapping wakes up your attention to your body from head to toe, a simple way to start moving in the morning.",
    coaching: "Keep the wrists loose so the taps bounce off, like rain rather than a knock.",
    watchOut: [
      "Tapping hard: it should feel light and pleasant, never sore",
      "Bending low to reach the ankles: tap only as far down as you can reach with a comfortable bend",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If standing is too much this morning, sit and tap the arms, chest and thighs."],
    },
  }),
  base({
    id: "qg-hold-up-sky", name: "Holding up the sky", style: "qigong", movementPattern: "qigong-form",
    feelings: ["calm", "worn", "wake", "sleep"], position: "standing", balanceDemand: false,
    youtube: "baduanjin holding up the sky beginners",
    affectsAreas: ["shoulder", "spine"], contraindications: ["shoulder-acute"],
    difficultyLevel: 1, energyRequired: 2, duration: 90,
    instructions: [
      "Stand with your feet hip-width apart, knees soft, hands resting on your hips",
      "Bring the hands in front of your belly and interlace the fingers, palms up",
      "Breathing naturally, raise the hands up in front of you and turn the palms to face the sky above your head",
      "Stretch gently up through both arms, then unlace the fingers",
      "Let the arms float down to the sides and the hands come back to the hips",
    ],
    why: "A long, gentle stretch up through the arms and the sides of the body. It is the first of the Eight Pieces of Brocade, a traditional qigong set.",
    coaching: "Reach up only as high as your shoulders allow today; a little bend in the elbows is fine.",
    watchOut: [
      "Arching the lower back as the arms go up: keep the ribs down and the tailbone heavy",
      "Shrugging the shoulders up to the ears: lift the arms and let the shoulders stay low",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If lifting both arms overhead is a lot for your shoulders, raise them only to shoulder height, or sit and do it seated."],
    },
  }),
  base({
    id: "qg-draw-bow", name: "Drawing the bow", style: "qigong", movementPattern: "qigong-form",
    feelings: ["wake"], position: "standing", balanceDemand: false,
    youtube: "baduanjin drawing the bow beginners",
    affectsAreas: ["shoulder", "upper-back", "quadriceps"], contraindications: ["knee-acute", "shoulder-acute"],
    difficultyLevel: 2, energyRequired: 3, duration: 120, perSide: true,
    instructions: [
      "Stand with your feet wide apart and bend your knees only as much as is comfortable",
      "Cross your wrists in front of your chest",
      "Point one hand out to the side, index finger up, and turn your head to look along it",
      "At the same time draw the other elbow back at shoulder height, as if pulling a bow",
      "Bring the hands back to the chest, straighten the legs a little and repeat to the other side",
    ],
    why: "Opening the chest and drawing the shoulder blades together while the legs hold a gentle wide stance. It is the second of the Eight Pieces of Brocade.",
    coaching: "Let the chest open as you draw; the stance can stay shallow.",
    watchOut: [
      "Sinking too low and feeling it in the knees: come up until the knees feel easy, over the middle of the feet",
      "Forcing the head round: turn to look along the hand only as far as is comfortable",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If the wide stance is a lot for your knees, stand with the feet hip-width and keep the knees nearly straight, or sit and do the arms only."],
      further: ["When the stance feels steady, take your feet a little wider."],
    },
  }),
  base({
    id: "qg-separate-heaven-earth", name: "Separating heaven and earth", style: "qigong", movementPattern: "qigong-form",
    feelings: ["wake"], position: "standing", balanceDemand: false,
    youtube: "baduanjin separating heaven and earth beginners",
    affectsAreas: ["shoulder", "spine"], contraindications: ["shoulder-acute"],
    difficultyLevel: 1, energyRequired: 2, duration: 90,
    instructions: [
      "Stand with your feet hip-width apart, knees soft, hands in front of your belly",
      "Raise one hand up past your face and press it towards the sky, palm up",
      "At the same time press the other hand down beside your hip, palm down",
      "Bring both hands back to the belly",
      "Repeat with the other hand going up, and keep changing",
    ],
    why: "One arm reaches up while the other presses down, a stretch along each side of the body in turn. It is the third of the Eight Pieces of Brocade.",
    coaching: "Think of growing taller between the two hands.",
    watchOut: [
      "Leaning to one side: keep your head over your hips and stretch straight up",
      "Locking the raised elbow: keep a small bend",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If reaching overhead is a lot for your shoulder today, raise the top hand to shoulder height, or sit and do it seated."],
    },
  }),
  base({
    id: "qg-look-back", name: "Looking back", style: "qigong", movementPattern: "qigong-form",
    feelings: ["wake"], position: "standing", balanceDemand: false,
    youtube: "baduanjin wise owl gazes backward beginners",
    affectsAreas: ["upper-back", "spine"], contraindications: ["upper-back-acute"],
    difficultyLevel: 1, energyRequired: 1, duration: 60,
    instructions: [
      "Stand with your feet hip-width apart, knees soft, arms by your sides",
      "Turn your palms to face outwards and let the shoulders roll gently back",
      "Slowly turn your head to look over one shoulder, only as far as is comfortable",
      "Turn slowly back to the front, palms relaxing",
      "Repeat to the other side",
    ],
    why: "A slow, small turn of the head with the chest open, the fifth of the Eight Pieces of Brocade, done here as gently as it can be.",
    coaching: "Keep the turn small and slow: comfortable matters more than far.",
    watchOut: [
      "Forcing the turn or tipping the head back: keep the chin level and stop where it is easy",
      "Turning the whole body: keep the hips and chest facing forward",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If turning your head is uncomfortable today, sit and turn only a little, or leave this one out."],
    },
  }),
  base({
    id: "qg-heel-drops", name: "Heel drops", style: "qigong", movementPattern: "qigong-form",
    feelings: ["wake"], position: "standing", balanceDemand: true,
    youtube: "baduanjin bouncing on the toes beginners",
    affectsAreas: ["calves", "ankle-foot"], contraindications: ["ankle-foot-acute", "achilles-acute"],
    difficultyLevel: 1, energyRequired: 2, duration: 60,
    instructions: [
      "Stand with your feet together or hip-width apart, a wall or chair within reach",
      "Rise slowly onto the balls of your feet",
      "Pause for a moment at the top, breathing naturally",
      "Lower your heels softly back to the floor",
      "Repeat, keeping the landing soft",
    ],
    why: "Rising onto the toes and lowering softly is the last of the Eight Pieces of Brocade. It works the calves and gives a light finish to the set.",
    coaching: "Lower the heels as if onto a carpet, not a hard floor.",
    watchOut: [
      "Dropping hard onto the heels: lower them softly, especially if your knees or back are tender",
      "Feeling wobbly at the top: rest a hand on the wall or chair",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If heel drops jar, lift the heels slowly and lower them without dropping."],
    },
  }),
  base({
    id: "qg-pressing-earth", name: "Pressing the earth", style: "qigong", movementPattern: "qigong-form",
    feelings: ["ground"], position: "standing", balanceDemand: false,
    youtube: "qigong pressing down movement beginners",
    affectsAreas: ["quadriceps", "shoulder"], contraindications: ["knee-acute"],
    difficultyLevel: 1, energyRequired: 1, duration: 120,
    instructions: [
      "Stand with your feet hip-width apart, knees soft, hands in front of your chest, palms down",
      "Breathing naturally, let the palms float down in front of you as the knees soften a little",
      "Let the hands float back up to the chest as the legs straighten",
      "Keep repeating, slowly",
    ],
    why: "The palms press down as the knees soften, a slow movement that draws your attention down through the legs to the floor.",
    coaching: "Let the bend in the knees be small: a soft bend is all this needs.",
    watchOut: [
      "Bending the knees deeply: keep it to a small, easy bend",
      "Hunching the shoulders as the hands come down: keep the chest open",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If standing is too much today, sit and let the palms float down to the thighs and up again."],
    },
  }),
  base({
    id: "qg-gathering-in", name: "Gathering in", style: "qigong", movementPattern: "qigong-form",
    feelings: ["calm", "worn", "sleep"], position: "standing", balanceDemand: false,
    youtube: "qigong gathering energy closing beginners",
    affectsAreas: ["shoulder", "full-body"], contraindications: [],
    difficultyLevel: 1, energyRequired: 1, duration: 120,
    instructions: [
      "Stand with your feet hip-width apart, knees soft, arms by your sides",
      "Let both arms float out to the sides and up in a wide circle",
      "Bring the hands in towards each other above your head, then down in front of your face and chest",
      "Let the hands come to rest on your belly",
      "Lower the arms and repeat, slowly",
    ],
    why: "Wide, slow circles of the arms that finish with the hands resting on the belly, an unhurried way to slow down in the evening.",
    coaching: "Make the circles as slow as your breath, and let the hands rest on the belly for a breath each time.",
    watchOut: [
      "Lifting the arms higher than your shoulders allow: make the circle smaller",
      "Hurrying the circle: there is no count to keep up with",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If standing is too much tonight, sit and make the circles from the chair."],
    },
  }),
  base({
    id: "qg-closing-breath", name: "Closing breath", style: "qigong", movementPattern: "qigong-form",
    feelings: ["calm", "worn", "wake", "sleep"], position: "any", balanceDemand: false,
    youtube: "qigong closing breath hands on belly",
    affectsAreas: ["nervous-system"], contraindications: [],
    difficultyLevel: 1, energyRequired: 1, duration: 90,
    instructions: [
      "Stand or sit comfortably, feet flat on the floor",
      "Rest both hands low on your belly, elbows relaxed out to the sides",
      "Breathe naturally, noticing the belly rise and fall under your hands",
      "There is no need to hold or change the breath; simply let it come and go",
      "When you are ready, let the hands rest by your sides",
    ],
    why: "Resting your hands on your belly and noticing your own natural breathing gives a quiet end to the set.",
    coaching: "If your mind wanders, bring your attention back to the hands rising and falling.",
    watchOut: [
      "Trying to breathe deeply or slowly on purpose: let the breath be whatever it is today",
      "Closing your eyes if that feels uncomfortable: keep them open and soften your gaze",
      SLOW,
    ],
    adaptations: {
      easeOff: ["If standing is tiring, sit or lie down for this one."],
    },
  }),

  // ── Yoga ───────────────────────────────────────────────────────────────
  base({
    id: "yoga-mountain-pose", name: "Mountain pose", style: "yoga", movementPattern: "yoga-hold",
    feelings: ["ground", "wake"], position: "standing", balanceDemand: false,
    youtube: "mountain pose tadasana beginners",
    affectsAreas: ["full-body", "ankle-foot"], contraindications: [],
    difficultyLevel: 1, energyRequired: 1, duration: 120,
    instructions: [
      "Stand with your feet hip-width apart or together, whichever is steadier",
      "Spread your toes and feel your weight even between the heels and the balls of the feet",
      "Let your arms hang by your sides, palms facing forward or in",
      "Lengthen up through the top of your head and let your shoulders drop",
      "Stay here, breathing naturally; you can close your eyes if you like, or keep them open",
    ],
    why: "Standing still and tall, with your weight even through both feet, is the starting point for most standing yoga poses and a simple way to notice how you are standing.",
    coaching: "Let your weight settle a little more into the heels than you think you need.",
    watchOut: [
      "Locking the knees back: keep a tiny softness in them",
      "Feeling unsteady with your eyes closed: open them and look at a still point ahead",
      "Holding your breath while you stand still: let it come and go on its own",
    ],
    adaptations: {
      easeOff: ["If you feel wobbly, stand with your back near a wall or a hand on a chair."],
      further: ["When standing still feels steady, raise both arms overhead and reach up for a few breaths."],
    },
  }),
  base({
    id: "yoga-reclined-butterfly", name: "Reclined butterfly", style: "yoga", movementPattern: "yoga-hold",
    feelings: ["sleep"], position: "floor", balanceDemand: false,
    youtube: "reclined butterfly pose supta baddha konasana pillows",
    affectsAreas: ["hip", "adductors"], contraindications: ["hip-acute", "knee-acute"],
    difficultyLevel: 1, energyRequired: 1, duration: 120,
    instructions: [
      "Lie on your back on the floor or the bed, knees bent and feet flat",
      "Bring the soles of your feet together and let the knees fall open to the sides",
      "Slide a pillow or cushion under each knee so the legs are fully supported",
      "Rest your hands on your belly or by your sides",
      "Stay here, breathing naturally",
    ],
    why: "A gentle opening for the hips and inner thighs with the body fully supported, so you can rest rather than hold a stretch.",
    coaching: "Use as many pillows under the knees as it takes for the stretch to feel like nothing at all.",
    watchOut: [
      "A pulling feeling in the knees or groin: bring the feet further from your body or add more pillows",
      "Your lower back arching off the floor: slide the feet further away",
      "Any sharp pain in the hips or knees: straighten your legs and leave this one for tonight",
    ],
    adaptations: {
      easeOff: ["If the butterfly pulls at your hips, put more pillows under your knees, or rest with the knees bent and together."],
    },
  }),

  // ── Gentle movement ────────────────────────────────────────────────────
  base({
    id: "gm-gentle-sway", name: "Gentle sway", style: "gentle", movementPattern: "gentle-flow",
    feelings: ["calm"], position: "standing", balanceDemand: false,
    youtube: "gentle side to side sway relaxation standing",
    affectsAreas: ["full-body", "hip"], contraindications: [],
    difficultyLevel: 1, energyRequired: 1, duration: 120,
    instructions: [
      "Stand with your feet hip-width apart, knees soft, arms loose by your sides",
      "Let your weight sway slowly onto one foot, then over onto the other",
      "Let the arms swing a little with the sway, as loose as they like",
      "Keep both feet on the floor and find a slow, easy rhythm",
    ],
    why: "A slow, rhythmic sway that keeps you moving without asking anything difficult of you.",
    coaching: "Find the rhythm that feels like rocking, then let it slow down a little more.",
    watchOut: [
      "Swaying so far that you wobble: keep the movement small",
      "Stiff arms: let them hang and move on their own",
    ],
    adaptations: {
      easeOff: ["If standing is too much today, sit and sway gently from the hips."],
      further: ["When the sway feels comfortable, let your arms swing slowly with it."],
    },
  }),
  base({
    id: "gm-reach-and-rise", name: "Reach and rise", style: "gentle", movementPattern: "gentle-flow",
    feelings: ["wake"], position: "standing", balanceDemand: true,
    youtube: "standing reach up heel raise morning stretch",
    affectsAreas: ["shoulder", "calves", "spine"], contraindications: ["ankle-foot-acute"],
    difficultyLevel: 1, energyRequired: 2, duration: 60,
    instructions: [
      "Stand with your feet hip-width apart, a chair beside you to hold if you like",
      "Reach both arms up overhead, or one arm if you are holding the chair",
      "As you reach, lift your heels a little off the floor",
      "Lower the heels and the arms together",
      "Repeat at an easy pace",
    ],
    why: "Reaching up while rising onto the toes stretches you out from fingertips to calves, a simple way to feel more awake.",
    coaching: "Reach up first, then let the heels follow.",
    watchOut: [
      "Wobbling as the heels lift: hold the chair and lift the heels only a little",
      "Arching the lower back as you reach: keep the ribs down",
    ],
    adaptations: {
      easeOff: ["If rising onto your toes feels unsteady, keep your heels down and just reach."],
    },
  }),
  base({
    id: "gm-knees-hug", name: "Knees hug", style: "gentle", movementPattern: "gentle-flow",
    feelings: ["worn", "sleep"], position: "floor", balanceDemand: false,
    youtube: "knees to chest gentle rock lying down",
    affectsAreas: ["lower-back", "hip"], contraindications: ["knee-acute"],
    difficultyLevel: 1, energyRequired: 1, duration: 60,
    instructions: [
      "Lie on your back on the floor or the bed",
      "Bring your knees in towards your chest",
      "Hold your shins, or behind your thighs if that is easier on your knees",
      "Rock gently from side to side, or simply rest here",
    ],
    why: "Hugging the knees in lets your lower back round gently against the floor, and many people find it a comfortable way to rest.",
    coaching: "Let the floor take all your weight; the hug is gentle, not a pull.",
    watchOut: [
      "Pulling the knees in hard: a light hold is enough",
      "Discomfort in the knees: hold behind the thighs instead of the shins",
    ],
    adaptations: {
      easeOff: ["If hugging both knees is a lot, hug one knee at a time with the other foot on the floor."],
    },
  }),

  // ── Pilates stretches for the Stretch door (L4) ────────────────────────
  base({
    id: "pilates-saw", name: "The Saw", style: "pilates", movementPattern: "pilates-stretch", category: "stretch-door",
    doors: ["stretch", "feel"], feelings: [], position: "floor", balanceDemand: false,
    youtube: "pilates saw exercise beginner",
    affectsAreas: ["hamstring", "upper-back", "spine"], contraindications: ["lower-back-acute", "hamstring-acute"],
    difficultyLevel: 2, energyRequired: 2, duration: 120,
    instructions: [
      "Sit tall on the floor with your legs straight and wider than your hips, toes pointing up",
      "Reach your arms out to the sides at shoulder height",
      "Turn your upper body towards one leg, keeping both sides of your bottom on the floor",
      "Reach the opposite hand towards the outside of that foot, letting the back arm reach behind you",
      "Sit tall again, turn back to the middle and repeat to the other side",
    ],
    why: "A stretch for the backs of the legs with a turn through the upper back, from the classic Pilates mat sequence.",
    coaching: "Grow tall before you turn; the reach comes after the twist, not instead of it.",
    watchOut: [
      "Rounding into a heavy slump to reach the foot: reach only as far as you can while the back stays long",
      "Lifting one side of your bottom off the floor as you turn: keep both sit bones down and turn a little less",
      "A sharp pull behind the knee: bend the knees and leave the reach shorter today",
    ],
    adaptations: {
      easeOff: ["If the backs of your legs pull, bend your knees, or sit on a folded blanket."],
      further: ["When the turn feels comfortable, take a slow breath out as you reach and let the reach go a little further, never past comfortable."],
    },
  }),
  base({
    id: "pilates-side-lying-quad", name: "Side-lying quad stretch", style: "pilates", movementPattern: "pilates-stretch", category: "stretch-door",
    doors: ["stretch", "feel"], feelings: [], position: "floor", balanceDemand: false, perSide: true,
    youtube: "side lying quad stretch",
    affectsAreas: ["quadriceps", "hip-flexor"], contraindications: ["knee-acute"],
    difficultyLevel: 1, energyRequired: 1, duration: 120,
    instructions: [
      "Lie on one side with your head resting on your lower arm and your knees together",
      "Bend your top knee and hold the top ankle with your top hand",
      "Draw the knee gently back until you feel a stretch down the front of the thigh",
      "Keep your knees close together and your hips stacked, and hold",
      "Let go slowly, then turn over and do the other side",
    ],
    why: "Stretches the front of the thigh lying down, so there is no balancing to think about.",
    coaching: "Tuck your tailbone under a little and the stretch arrives without pulling harder.",
    watchOut: [
      "Arching your lower back to get more stretch: tuck the tailbone and keep the back long",
      "Pain in the knee rather than a stretch in the thigh: ease off and hold a sock or towel round the ankle instead",
      "Pulling the heel hard into your bottom: a gentle hold is enough",
    ],
    adaptations: {
      easeOff: ["If you cannot reach your ankle comfortably, loop a towel or sock round it and hold that."],
    },
  }),
  base({
    id: "pilates-thigh-stretch", name: "Thigh stretch", style: "pilates", movementPattern: "pilates-stretch", category: "stretch-door",
    doors: ["stretch", "feel"], feelings: [], position: "floor", balanceDemand: false,
    youtube: "pilates thigh stretch beginner",
    affectsAreas: ["quadriceps", "abdominals"], contraindications: ["knee-acute", "lower-back-acute"],
    difficultyLevel: 2, energyRequired: 2, duration: 120,
    instructions: [
      "Kneel upright on a mat, knees hip-width apart, with a cushion under the knees if you like",
      "Reach both arms forward at shoulder height",
      "Lean back slowly in one straight line from your knees to the top of your head, only as far as is comfortable",
      "Come back up to kneeling, keeping the same straight line",
      "Repeat slowly",
    ],
    why: "A classic Pilates stretch for the fronts of the thighs, which also asks your middle to hold you in one line.",
    coaching: "Think of tipping back like a door on its hinges at the knees, not bending at the hips.",
    watchOut: [
      "Bending at the hips or arching the back as you lean: lean back less and keep the line from knees to head",
      "Feeling it in the knees rather than the thighs: put a cushion under the knees and lean back only a little",
      "Any sharp pain in the knees or lower back: stop and use the side-lying quad stretch instead",
    ],
    adaptations: {
      easeOff: ["If kneeling is uncomfortable, put a folded blanket under your knees and lean back only a little."],
    },
  }),
];
