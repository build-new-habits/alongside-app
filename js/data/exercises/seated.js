/**
 * data/exercises/seated.js
 * 11 Aug 2026 v1
 *
 * CAP-4 — the seated and supported library. Fourteenth discipline file.
 *
 * WHY THIS EXISTS
 *
 * The capability screen asks whether somebody can rise from a chair, and
 * Graeme's correction made "No" a real answer rather than forcing a
 * wheelchair user into "not easily" — because a yes/no pair is a lie that
 * also erases them.
 *
 * Making that answer honest meant it had to lead somewhere. It did not.
 * The database held 29 seated entries, and they were almost entirely
 * rehabilitation drills, mobility work and four gym machines. A wheelchair
 * user answering the questions truthfully received a four-exercise session:
 * correct, respectful of what they had told us, and not a programme.
 *
 * Asking somebody four careful questions and then handing them four
 * exercises is better than handing them squats. It is still not enough.
 *
 * WHAT IS HERE
 *
 * Seated cardio, seated strength for the upper body and trunk, seated core,
 * seated lower-body work for people who have leg function but cannot stand
 * safely, and chair-supported standing work for people who can stand with
 * something to hold.
 *
 * Those last two groups matter: "seated" is not one population. A wheelchair
 * user with full upper-body strength, someone recovering from a hip
 * replacement, and an eighty-year-old who gets breathless standing all need
 * seated work for entirely different reasons, and a library that treats them
 * as one group serves none of them.
 *
 * WRITING NOTE
 *
 * Nothing here is framed as a lesser version of a standing exercise. No entry
 * says "if you can't do X, do this instead". They are exercises, written the
 * way every other exercise in the database is written, because that is what
 * they are. Where a movement genuinely has a standing equivalent, the `why`
 * explains what this version does — not what it substitutes for.
 *
 * Every entry meets the Exercise Entry Standard, including watchOut, effort-
 * relative load, and the position/impact/balanceDemand tags added in CAP-2.
 */

export const SEATED = [

  // ══════════════════════════════════════════════════════════════════════
  // SEATED CARDIO
  // ══════════════════════════════════════════════════════════════════════

  {
    id: 'seated-arm-cycling',
    name: 'Seated Arm Cycling',
    youtube: 'seated arm cycling cardio workout',
    category: 'cardio',
    movementPattern: 'locomotion',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'upper-back', 'triceps-biceps', 'chest-pecs'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 300,
    perSide: false,
    sets: 1,
    tempo: 'Steady, continuous',
    rest: '0s',
    instructions: [
      'Sit tall with your back supported and your shoulders relaxed down',
      'Bring both hands up in front of your chest, elbows bent',
      'Cycle your arms forwards in large, smooth circles, as though pedalling with your hands',
      'After a minute, reverse the direction',
      'Keep going for five minutes, alternating direction every minute'
    ],
    coaching: 'Make the circles as big as your shoulders comfortably allow. Small circles are easy to keep going and do very little; big ones are the whole point.',
    why: 'Raises your heart rate using the upper body alone, which warms the shoulders at the same time. Five minutes of this leaves you genuinely ready to work rather than starting cold.',
    watchOut: [
      'Circles shrinking as you tire, which is the moment to slow down rather than carry on smaller',
      'Shoulders creeping up towards your ears — reset them down every so often',
      'Holding your breath; breathe steadily throughout'
    ],
    load: 'No weight. Steady enough that you could hold a conversation the whole five minutes.',
    credits: 40
  },

  {
    id: 'seated-punches',
    name: 'Seated Punches',
    youtube: 'seated boxing punches chair cardio',
    category: 'cardio',
    movementPattern: 'push',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['shoulder', 'chest-pecs', 'triceps-biceps', 'abdominals'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 240,
    perSide: false,
    sets: 4,
    reps: '30 seconds',
    rest: '30s',
    instructions: [
      'Sit tall, away from the back of the chair if you can do so comfortably',
      'Bring both fists up in front of your chin, elbows tucked in',
      'Punch one arm straight forward, then bring it back as the other goes out',
      'Build to a steady, quick rhythm and keep going for thirty seconds',
      'Rest for thirty, then repeat — four rounds in total'
    ],
    coaching: 'Turn your ribs slightly into each punch rather than only moving the arm. That is what turns it from an arm exercise into a whole-trunk one.',
    why: 'Raises your heart rate quickly and works the shoulders, chest and trunk together. It is also one of the few things that feels genuinely energetic while seated.',
    watchOut: [
      'Locking the elbow at the end of the punch — stop just short of straight',
      'Punching from the shoulder only, with the trunk staying completely still',
      'Speeding up until the punches stop reaching full extension'
    ],
    load: 'Bodyweight to start. Light dumbbells only once four rounds feel comfortable, and expect to need considerably lighter than you would guess.',
    credits: 45
  },

  {
    id: 'seated-marching-cardio',
    name: 'Seated Marching',
    youtube: 'seated marching chair exercise cardio',
    category: 'cardio',
    movementPattern: 'locomotion',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip-flexor', 'quadriceps', 'abdominals'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 240,
    perSide: false,
    sets: 1,
    tempo: 'Steady',
    rest: '0s',
    instructions: [
      'Sit tall with both feet flat on the floor',
      'Lift one knee as high as is comfortable, then lower it under control',
      'Lift the other, building a steady marching rhythm',
      'Let your arms swing naturally in opposition as you go',
      'Continue for four minutes'
    ],
    coaching: 'Sit away from the chair back if you can. Doing this unsupported means your stomach is working the whole time as well as your hips.',
    why: 'Warms the hips and raises the pulse gently, and the hip flexors are among the first things to tighten in anyone who sits for long periods.',
    watchOut: [
      'Leaning back to get the knee higher, which takes the work out of it',
      'Rounding through the lower back as you tire — sit tall and lift less high instead',
      'Rushing until the movement becomes a shuffle'
    ],
    load: 'No weight. Steady and conversational.',
    credits: 35
  },

  // ══════════════════════════════════════════════════════════════════════
  // SEATED STRENGTH — UPPER BODY
  // ══════════════════════════════════════════════════════════════════════

  {
    id: 'seated-shoulder-press',
    name: 'Seated Shoulder Press',
    youtube: 'seated dumbbell shoulder press form',
    category: 'strength',
    movementPattern: 'push',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: ['dumbbell'],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['shoulder', 'triceps-biceps', 'upper-back'],
    contraindications: ['shoulder-acute', 'lower-back-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '10',
    rest: '60s',
    tempo: '2-1-3',
    instructions: [
      'Sit tall with a dumbbell in each hand, held just above shoulder height',
      'Turn your palms to face forwards, elbows below your wrists',
      'Brace your stomach so your ribs stay down',
      'Press both weights up until your arms are almost straight',
      'Lower slowly over three counts until your hands return to shoulder height'
    ],
    coaching: 'Keep your ribs down as you press. If your lower back arches away from the chair, the weight is too heavy and your spine has started doing the shoulders\' job.',
    why: 'Overhead strength is what lets you reach a high shelf, lift something into a cupboard, or push yourself up. Pressing while seated means your trunk is supported and the shoulders do the work.',
    watchOut: [
      'Lower back arching away from the chair back as you press',
      'Weights drifting forwards in front of your face rather than travelling straight up',
      'Any pinching at the top: reduce how far you press and lighten the weight'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your ribs stay down throughout.',
    credits: 50
  },

  {
    id: 'seated-band-row',
    name: 'Seated Band Row',
    youtube: 'seated resistance band row technique',
    category: 'strength',
    movementPattern: 'pull',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Anchor a band at chest height in front of you, or loop it around your feet if you can reach them',
      'Sit tall and take an end in each hand, arms straight out in front',
      'Pull both hands back towards your lower ribs, driving your elbows behind you',
      'Squeeze your shoulder blades together and hold for a second',
      'Let your hands travel forward slowly over three counts'
    ],
    coaching: 'Lead with your elbows, not your hands. Think about putting your elbows in your back pockets and the right muscles do the work without you having to find them.',
    why: 'Strengthens the muscles across the upper back that hold your shoulders where they belong. If you spend a lot of the day seated, this is the single most useful thing you can do for how your upper body feels.',
    watchOut: [
      'Leaning back to start the pull rather than keeping the trunk still',
      'Shrugging the shoulders up towards the ears instead of drawing the blades together',
      'Letting the band snap your arms forward at the end of each rep'
    ],
    load: 'Enough tension that the last two reps are hard, light enough that you sit tall throughout.',
    credits: 45
  },

  {
    id: 'seated-band-chest-press',
    name: 'Seated Band Chest Press',
    youtube: 'seated resistance band chest press',
    category: 'strength',
    movementPattern: 'push',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'chest-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Pass a band around the back of your chair at chest height, or anchor it behind you',
      'Sit tall and hold an end in each hand, level with your chest',
      'Press both hands forward until your arms are almost straight',
      'Stop just short of locking your elbows',
      'Return slowly over three counts until your hands are back beside your chest'
    ],
    coaching: 'Keep your shoulders down and back throughout. If they roll forward as you press, the shoulder joint takes work the chest should be doing.',
    why: 'Pressing strength is what you use to push a heavy door, get up from a chair arm, or move yourself in a bed. The band keeps tension on through the whole movement.',
    watchOut: [
      'Shoulders rolling forward at the end of the press',
      'Elbows flaring straight out to the sides rather than at forty-five degrees',
      'Band anchored somewhere that could give way — check it before the first rep'
    ],
    load: 'Enough tension that the last two reps are hard, light enough that your shoulders stay set.',
    credits: 45
  },

  {
    id: 'seated-lateral-raise',
    name: 'Seated Lateral Raise',
    youtube: 'seated dumbbell lateral raise form',
    category: 'strength',
    movementPattern: 'push',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: ['dumbbell'],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['shoulder'],
    contraindications: ['shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Sit tall with a light dumbbell in each hand, arms relaxed at your sides',
      'Keep a soft bend in both elbows',
      'Raise both arms out to the sides until they reach shoulder height',
      'Pause briefly at the top',
      'Lower slowly over three counts'
    ],
    coaching: 'Lead with your elbows rather than your hands, and stop at shoulder height. Going higher brings the neck in and gives the shoulder nothing extra.',
    why: 'Builds the muscle across the top of the shoulder, which is what gives the upper body shape and what does the work every time you reach out sideways.',
    watchOut: [
      'Swinging the weights up with a rock of the body',
      'Raising above shoulder height, which recruits the neck',
      'Shrugging as you lift — keep the shoulders down and away from the ears'
    ],
    load: 'Lighter than you think. These respond to control, not weight, and almost everyone goes too heavy.',
    credits: 35
  },

  {
    id: 'seated-bicep-curl',
    name: 'Seated Bicep Curl',
    youtube: 'seated dumbbell bicep curl technique',
    category: 'strength',
    movementPattern: 'pull',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: ['dumbbell'],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['triceps-biceps'],
    contraindications: ['wrist-elbow-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Sit tall with a dumbbell in each hand, arms hanging at your sides, palms facing forwards',
      'Keep your elbows tucked against your ribs',
      'Curl both weights up towards your shoulders',
      'Squeeze briefly at the top',
      'Lower slowly over three counts until your arms are straight again'
    ],
    coaching: 'Your elbows should not move at all. If they swing forward, the weight is too heavy and your shoulders have started helping.',
    why: 'Curling strength is what you use to lift a kettle, a shopping bag or a grandchild. It is also the movement most people notice improving first, which is worth something.',
    watchOut: [
      'Elbows swinging forward away from your sides',
      'Leaning back to help the weight up',
      'Dropping the weight quickly on the way down, which is where most of the work is'
    ],
    load: 'Light enough that your elbows stay pinned to your sides for every rep.',
    credits: 35
  },

  {
    id: 'seated-tricep-extension',
    name: 'Seated Overhead Tricep Extension',
    youtube: 'seated overhead tricep extension form',
    category: 'strength',
    movementPattern: 'push',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: ['dumbbell'],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 3,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Sit tall holding one dumbbell in both hands, gripping around one end',
      'Raise it overhead until your arms are straight',
      'Keeping your elbows pointing forwards, lower the weight behind your head',
      'Go only as far as feels comfortable in the shoulder',
      'Press back up until your arms are straight, without locking the elbows hard'
    ],
    coaching: 'Elbows stay pointing forwards and close together. Once they flare out to the sides the triceps stop doing most of the work.',
    why: 'The back of the upper arm does most of the work in any pushing movement, including pushing yourself up out of a chair. It is also what gives the arm its shape.',
    watchOut: [
      'Elbows flaring wide as you lower',
      'Arching the lower back as the weight goes behind your head — brace your stomach first',
      'Going heavy on a movement where the shoulder is in a long position; this one rewards restraint'
    ],
    load: 'Lighter than you would use for most exercises. Control matters more than weight here.',
    credits: 35
  },

  // ══════════════════════════════════════════════════════════════════════
  // SEATED CORE
  // ══════════════════════════════════════════════════════════════════════

  {
    id: 'seated-pallof-press',
    name: 'Seated Pallof Press',
    youtube: 'seated pallof press band anti rotation',
    category: 'strength',
    movementPattern: 'anti-rotation',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'core', 'shoulder'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 240,
    perSide: true,
    sets: 3,
    reps: '10 each side',
    rest: '45s',
    tempo: '2-2-2',
    instructions: [
      'Anchor a band at chest height to one side of you',
      'Sit tall, side-on to the anchor, holding the band in both hands at the centre of your chest',
      'Brace your stomach so your ribs sit over your hips',
      'Press both hands straight out in front of you until your arms are almost straight',
      'Hold for two seconds while the band tries to turn you, then bring your hands back in'
    ],
    coaching: 'Nothing moves except your arms. The band is trying to rotate you the whole time, and the whole exercise is your middle quietly refusing to let it.',
    why: 'Trains your trunk to resist being turned, which is what it does every time you reach sideways for something, push a door, or steady yourself. It is the seated version of the most useful core exercise there is.',
    watchOut: [
      'Your body turning towards the anchor as you press out, which means the band is too strong',
      'Shoulders rotating while the hips stay square, or the other way about',
      'Holding your breath during the two-second hold, which is the most common habit on this one'
    ],
    load: 'Light enough that you stay completely square for all ten reps. Rotating is the band telling you it is too strong.',
    credits: 45
  },

  {
    id: 'seated-torso-rotation',
    name: 'Seated Torso Rotation',
    youtube: 'seated torso rotation core exercise',
    category: 'strength',
    movementPattern: 'rotation',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: ['medicine-ball', 'dumbbell'],
    affectsAreas: ['abdominals', 'core', 'spine'],
    contraindications: ['lower-back-acute', 'spine-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 180,
    perSide: true,
    sets: 3,
    reps: '10 each side',
    rest: '45s',
    tempo: '2-1-2',
    instructions: [
      'Sit tall, away from the chair back if you can, feet flat on the floor',
      'Hold your hands together in front of your chest, elbows out',
      'Turn your ribs slowly to one side, keeping your hips facing forward',
      'Pause briefly at the end of the turn',
      'Return to the middle under control, then turn to the other side'
    ],
    coaching: 'Turn from the ribs, not the arms. If your hands travel a long way and your chest barely moves, the arms are doing something the trunk should be.',
    why: 'Rotation is what you use to reach behind you, look over your shoulder, or move something from one side to the other. Sitting still all day is what takes it away.',
    watchOut: [
      'Hips turning with the ribs rather than staying square',
      'Bouncing at the end of the turn rather than pausing',
      'Turning further than feels comfortable in the back; range comes with repetition, not force'
    ],
    load: 'Bodyweight to begin. Add a light weight held at the chest only once ten controlled reps each side feel easy.',
    credits: 40
  },

  {
    id: 'seated-knee-lift',
    name: 'Seated Knee Lift',
    youtube: 'seated knee lift core chair exercise',
    category: 'strength',
    movementPattern: 'anti-extension',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'hip-flexor', 'core'],
    contraindications: ['lower-back-acute', 'hip-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 180,
    perSide: true,
    sets: 3,
    reps: '10 each side',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Sit tall with both feet flat and your hands resting lightly on the chair either side of you',
      'Brace your stomach as though bracing for a gentle prod',
      'Lift one knee slowly towards your chest, as high as is comfortable',
      'Hold for a second at the top without leaning back',
      'Lower slowly over three counts, then repeat on the other side'
    ],
    coaching: 'The test is whether you can keep sitting tall the whole time. The moment you lean back to lift higher, the exercise has moved from your stomach to your back.',
    why: 'Strengthens the muscles that hold you upright in a chair and that lift your legs when you move — the same ones you use to get a foot into a car or over the edge of a bath.',
    watchOut: [
      'Leaning back as the knee comes up',
      'Rounding through the lower back',
      'Pulling on the chair with your hands to help; they are there for steadiness only'
    ],
    load: 'Bodyweight. Progress by holding longer at the top rather than lifting higher.',
    credits: 40
  },

  {
    id: 'seated-side-bend',
    name: 'Seated Side Bend',
    youtube: 'seated side bend oblique exercise',
    category: 'strength',
    movementPattern: 'anti-lateral-flexion',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['abdominals', 'core', 'spine'],
    contraindications: ['lower-back-acute', 'spine-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 180,
    perSide: true,
    sets: 3,
    reps: '10 each side',
    rest: '45s',
    tempo: '2-1-2',
    instructions: [
      'Sit tall with both feet flat and your hands resting on your thighs',
      'Keeping both hips firmly on the seat, lean slowly to one side',
      'Go only as far as you can while both hips stay down',
      'Pause, then use your side to pull yourself back upright',
      'Repeat to the other side'
    ],
    coaching: 'Coming back up is the exercise. Going down is just gravity — the work is in the side you are pulling with to return.',
    why: 'The muscles down the sides of your trunk are what stop you toppling sideways and what steady you when you carry something in one hand. They get very little use sitting still.',
    watchOut: [
      'One hip lifting off the seat, which means you have gone too far',
      'Leaning forward or back rather than directly sideways',
      'Dropping quickly and using momentum to bounce back up'
    ],
    load: 'Bodyweight. A light weight in the hand on the side you are leaving only once the movement is comfortable.',
    credits: 35
  }

];

// ══════════════════════════════════════════════════════════════════════
// SEATED LOWER BODY — for people with leg function who cannot stand
// safely or for long. A different group again from wheelchair users
// with no leg function, and the library must serve both.
// ══════════════════════════════════════════════════════════════════════

SEATED.push(
  {
    id: 'seated-leg-extension',
    name: 'Seated Leg Extension',
    youtube: 'seated leg extension chair exercise',
    category: 'strength',
    movementPattern: 'squat',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['quadriceps', 'knee'],
    contraindications: ['knee-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 180,
    perSide: true,
    sets: 3,
    reps: '12 each side',
    rest: '45s',
    tempo: '2-2-3',
    instructions: [
      'Sit tall with both feet flat on the floor and your knees bent to roughly ninety degrees',
      'Straighten one leg out in front of you until it is level with your hip',
      'Hold it straight for two seconds and squeeze the front of your thigh',
      'Lower slowly over three counts until your foot is back on the floor',
      'Complete all reps on one leg before changing'
    ],
    coaching: 'The two-second hold at the top is where this works. Swinging the leg up and letting it drop is a different exercise, and a much easier one.',
    why: 'The muscle at the front of the thigh is what straightens your knee and what holds you steady in standing. It is the first thing lost when someone stops walking much, and among the quickest to come back.',
    watchOut: [
      'Leaning back as the leg comes up, which usually means reaching for height you do not have yet',
      'Letting the leg drop rather than lowering it',
      'Any sharp pain at the front of the knee: reduce the range rather than pushing through'
    ],
    load: 'Bodyweight to begin. Add a light band around the ankles only once three sets feel comfortable.',
    credits: 40
  },

  {
    id: 'seated-hip-abduction-band',
    name: 'Seated Hip Abduction',
    youtube: 'seated banded hip abduction chair',
    category: 'strength',
    movementPattern: 'hip-abduction',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '15',
    rest: '45s',
    tempo: '2-1-2',
    instructions: [
      'Sit tall with a looped band around both legs, just above the knees',
      'Place both feet flat on the floor, roughly hip-width apart',
      'Press both knees outwards against the band as far as is comfortable',
      'Hold for a second at the widest point',
      'Return slowly, keeping tension on the band throughout'
    ],
    coaching: 'Keep both feet flat as the knees travel out. If the feet roll onto their outside edges, the ankles have started doing the hips\' work.',
    why: 'The muscles on the outside of the hip are what stabilise you sideways and what stop the knee falling inwards. They are among the most useful and least trained muscles in the body.',
    watchOut: [
      'Feet rolling outwards as the knees open',
      'Leaning back into the chair as you press',
      'A band strong enough that the movement becomes a strain rather than a squeeze'
    ],
    load: 'Enough tension to feel the outside of the hips working, light enough that your feet stay flat.',
    credits: 35
  },

  {
    id: 'seated-heel-toe-raise',
    name: 'Seated Heel and Toe Raise',
    youtube: 'seated heel toe raise circulation exercise',
    category: 'rehabilitation',
    movementPattern: 'calf-raise',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'ankle-foot'],
    contraindications: ['ankle-foot-acute'],
    energyRequired: 2,
    difficultyLevel: 1,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '20',
    rest: '30s',
    tempo: '2-1-2',
    instructions: [
      'Sit tall with both feet flat on the floor',
      'Lift both heels as high as you can, keeping the toes down',
      'Hold for a second, then lower',
      'Now lift both sets of toes, keeping the heels down',
      'Alternate between the two for twenty repetitions'
    ],
    coaching: 'Take it slowly enough to feel the calf working on the heel lift and the shin working on the toe lift. Rushed, this becomes fidgeting.',
    why: 'The calf is what pumps blood back up from the legs when you are sitting, so this helps with swelling and heaviness as well as strength. The shin half is what lifts your toes clear when you walk.',
    watchOut: [
      'Rushing until it becomes a jiggle rather than a movement',
      'Only doing the heel half, which is the easier and more familiar one',
      'Cramping in the calf: stop, stretch gently, and do fewer next time'
    ],
    load: 'Bodyweight. Progress by holding each lift longer.',
    credits: 30
  },

  {
    id: 'seated-hamstring-curl-band',
    name: 'Seated Hamstring Curl',
    youtube: 'seated banded hamstring curl chair',
    category: 'strength',
    movementPattern: 'hinge',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    equipment: ['resistance-band'],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'calves'],
    contraindications: ['hamstring-acute', 'knee-acute'],
    energyRequired: 3,
    difficultyLevel: 2,
    duration: 180,
    perSide: true,
    sets: 3,
    reps: '12 each side',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Anchor a band in front of you at floor level and loop the other end around one ankle',
      'Sit tall with that leg extended forward, foot off the floor',
      'Pull your heel back towards the chair by bending the knee',
      'Hold for a second at the back',
      'Let the band draw your leg forward slowly over three counts'
    ],
    coaching: 'Point your toes up towards your shin as you pull. It takes the calf out of the movement and puts the work squarely in the back of the thigh.',
    why: 'Hamstrings are the most commonly under-trained muscle in the leg, and they protect the knee. Working them seated means the back is fully supported while you do it.',
    watchOut: [
      'The whole leg lifting rather than the knee bending',
      'Letting the band snap the leg straight at the end of each rep',
      'Any pulling sensation high in the back of the thigh: reduce the range'
    ],
    load: 'Light tension. Hamstrings respond well to control and badly to being rushed.',
    credits: 40
  }
);

// ══════════════════════════════════════════════════════════════════════
// CHAIR-SUPPORTED STANDING — for people who can stand with something to
// hold. Tagged position 'standing' honestly, because they are standing
// exercises. They belong in this file because they are the bridge, and
// because somebody who answers "not easily" to the chair question needs
// them to exist.
// ══════════════════════════════════════════════════════════════════════

SEATED.push(
  {
    id: 'sit-to-stand',
    name: 'Sit to Stand',
    youtube: 'sit to stand exercise technique chair',
    category: 'strength',
    movementPattern: 'squat',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'hamstring', 'abdominals'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '8',
    rest: '60s',
    tempo: '3-1-3',
    instructions: [
      'Sit towards the front of a sturdy chair with both feet flat and slightly behind your knees',
      'Fold your arms across your chest if you can, or rest your hands lightly on your thighs',
      'Lean your chest forward over your knees, then push down through your heels to stand',
      'Stand fully upright and pause',
      'Lower yourself back down over three counts rather than dropping into the seat'
    ],
    coaching: 'Nose over toes before you stand. Almost everyone tries to stand while still leaning back, which is what makes it feel impossible, and the lean forward is what makes it work.',
    why: 'This is the single movement that decides most about staying independent. Every time you get out of a chair, a car, or a bath you are doing it, and it is trainable at any age. Keeping hold of it keeps a great deal else available to you in years to come.',
    watchOut: [
      'Trying to stand while still leaning back into the chair',
      'Dropping down into the seat rather than lowering under control -- the lowering is the half that builds the strength',
      'Using a chair with wheels or one that could slide',
      'Knees falling inwards as you rise'
    ],
    load: 'Bodyweight. Progress first by using your hands less, then by lowering more slowly, then by using a lower seat.',
    credits: 50
  },

  {
    id: 'chair-supported-calf-raise',
    name: 'Supported Calf Raise',
    youtube: 'supported calf raise chair technique',
    category: 'strength',
    movementPattern: 'calf-raise',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['calves', 'ankle-foot'],
    contraindications: ['ankle-foot-acute', 'achilles-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '15',
    rest: '45s',
    tempo: '2-2-3',
    instructions: [
      'Stand behind a sturdy chair with both hands resting on the back of it',
      'Place your feet hip-width apart, weight even across both',
      'Rise up onto the balls of your feet as high as you comfortably can',
      'Hold at the top for two seconds',
      'Lower slowly over three counts until your heels touch the floor'
    ],
    coaching: 'Let your hands steady you rather than hold you up. If you are pushing down through your arms, the calves are getting less than they should.',
    why: 'Calf strength is what pushes you off with each step and what stops a stumble becoming a fall. It is also what pumps blood back up from your feet.',
    watchOut: [
      'Leaning heavily on the chair and taking the weight off your legs',
      'Bouncing at the bottom rather than lowering under control',
      'Rolling out onto the little-toe side of the foot as you rise'
    ],
    load: 'Bodyweight. Progress by holding longer at the top before adding anything.',
    credits: 35
  },

  {
    id: 'chair-supported-hip-abduction',
    name: 'Supported Standing Hip Abduction',
    youtube: 'standing hip abduction chair support',
    category: 'strength',
    movementPattern: 'hip-abduction',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: ['resistance-band'],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute'],
    energyRequired: 3,
    difficultyLevel: 1,
    duration: 180,
    perSide: true,
    sets: 3,
    reps: '12 each side',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Stand behind a sturdy chair with both hands resting on the back',
      'Stand tall with your weight on one leg',
      'Lift the other leg out to the side, keeping it straight and the toes pointing forward',
      'Go only as far as you can without leaning away',
      'Lower slowly over three counts, then complete all reps before changing sides'
    ],
    coaching: 'Keep your toes pointing forward, not up towards the ceiling. Rolling the leg outward lets the hip flexor take over and the muscle you are after stops working.',
    why: 'The muscles on the outside of the hip are what keep you level when you take a step. Weakness here shows up as a sway in walking long before it shows up as anything else.',
    watchOut: [
      'Leaning away from the working leg to lift it higher',
      'The toes turning outwards as the leg rises',
      'Gripping the chair hard, which usually means the leg has gone too high'
    ],
    load: 'Bodyweight. A light band above the knees only once twelve controlled reps each side feel easy.',
    credits: 35
  },

  {
    id: 'chair-supported-march',
    name: 'Supported Standing March',
    youtube: 'supported standing march chair exercise',
    category: 'cardio',
    movementPattern: 'locomotion',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    equipment: [],
    equipmentOptional: [],
    affectsAreas: ['hip-flexor', 'quadriceps', 'glutes', 'abdominals'],
    contraindications: ['hip-acute'],
    energyRequired: 4,
    difficultyLevel: 1,
    duration: 240,
    perSide: false,
    sets: 1,
    tempo: 'Steady',
    rest: '0s',
    instructions: [
      'Stand behind a sturdy chair with one or both hands resting on the back',
      'Stand tall with your feet hip-width apart',
      'Lift one knee to a comfortable height, then place the foot back down',
      'Lift the other, building a steady, even rhythm',
      'Continue for four minutes'
    ],
    coaching: 'Try using one hand rather than two once you feel steady. Reducing the support gradually is how this becomes balance training as well as cardio.',
    why: 'Raises the heart rate while standing, which is a different demand from doing it seated, and it rehearses the weight shift that walking is built on.',
    watchOut: [
      'Leaning on the chair rather than resting hands on it',
      'Rushing until the feet barely leave the floor',
      'Any dizziness on standing: sit down, and try the seated version instead'
    ],
    load: 'Bodyweight. Steady enough to hold a conversation.',
    credits: 40
  }
);
