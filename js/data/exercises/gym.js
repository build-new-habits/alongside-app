/**
 * data/exercises/gym.js
 * 11 Aug 2026 v2
 *
 * v2 - Cable Pallof Press added at Graeme's request. Two band versions
 *   existed in strength.js and no cable version did, despite the cable
 *   being the most common way it is done in a gym and the version that
 *   lets the resistance be adjusted properly.
 *
 * CON-4 — the gym library. Thirteenth discipline file.
 *
 * WHY THIS EXISTS
 *
 * An audit on 11 Aug 2026 found the product had, across 461 exercises, zero
 * cable exercises, zero lat pulldown, zero leg press, zero machine chest
 * press, no stair climber, no ski erg, no sled, no battle ropes, and no
 * loaded core work at all. One machine exercise existed in total: a rowing
 * machine. Seventy-three percent of the entire database was bodyweight.
 *
 * Meanwhile a person who told the app they were at the gym was handed floor
 * exercises they could have done in their living room. Graeme hit this
 * himself and reported it as a recurring pattern, which it was.
 *
 * Several equipment ids were also tickable but useless: stair-climber,
 * battle-ropes, balance-board, bosu-ball, wobble-cushion, plyo-box and trx
 * all appeared in equipment.js for the user to select, and no exercise
 * anywhere carried those tags. Ticking them did nothing. That is the mirror
 * image of the CON-2 bug — unusable ticks rather than unreachable exercises.
 *
 * SCOPE
 *
 * Machines and cardio sessions, conditioning, cable and machine strength,
 * free-weight compounds, loaded core, medicine ball, balance and plyometrics.
 * Written to satisfy the goals people actually arrive with — feel fitter,
 * tone up, lose weight, feel stronger — rather than to cover a muscle chart.
 *
 * Every entry meets the Exercise Entry Standard
 * (Documents/Live State/exercise_entry_standard.md), including watchOut and
 * effort-relative load. No absolute weights anywhere, per Locked Principle P4.
 *
 * Interval and session structure lives in `instructions` rather than in a
 * separate field, so it renders through the existing card with no renderer
 * change and reads as a coach talking a person through it.
 */

export const GYM = [

  // ══════════════════════════════════════════════════════════════════════
  // MACHINES — CARDIO SESSIONS
  // ══════════════════════════════════════════════════════════════════════

  {
    id: 'gym-treadmill-intervals',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Treadmill Intervals',
    youtube: 'treadmill interval workout beginners',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: ['treadmill'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'quadriceps', 'hamstring', 'calves', 'glutes'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'hip-acute'],
    energyRequired: 7,
    difficultyLevel: 5,
    duration: 1500,
    perSide: false,
    sets: 8,
    reps: '1 minute hard, 90 seconds easy',
    rest: '90s active',
    instructions: [
      'Walk for five minutes to warm up, then bring the belt to an easy jog',
      'Run for one minute at a pace you could hold for about three minutes if you had to',
      'Drop back to a walk or slow jog for ninety seconds — keep moving rather than stopping the belt',
      'Repeat that pair eight times, then walk easy for five minutes to finish',
      'If eight rounds is too many today, do four and finish there. A shorter session you complete beats a longer one you abandon'
    ],
    coaching: 'The recovery ninety seconds is doing as much work as the hard minute. Resist the urge to shorten it — that is what lets you hold the same pace on round eight as on round one.',
    why: 'Intervals raise your fitness faster than steady running for the time spent, and the walking recovery keeps the total impact on your joints lower than a continuous run of the same length.',
    watchOut: [
      'Going too hard on the first two rounds and fading badly by round five — the pace should feel repeatable, not maximal',
      'Holding the handrails during the hard efforts, which takes weight off your legs and changes the whole session',
      'Stopping the belt dead between rounds; keep walking so your heart rate comes down gradually'
    ],
    load: 'Choose a hard pace you could sustain for three minutes if pushed. If you cannot complete the last round at that pace, it was too fast.',
    credits: 80
  },

  {
    id: 'gym-treadmill-incline-walk',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Treadmill Incline Walk',
    youtube: 'incline treadmill walking workout',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: ['treadmill'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hamstring', 'calves', 'quadriceps'],
    contraindications: ['ankle-foot-acute', 'achilles-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 1800,
    perSide: false,
    sets: 1,
    reps: '30 minutes',
    rest: '0s',
    instructions: [
      'Walk flat for three minutes at a comfortable pace to start',
      'Raise the incline to somewhere between eight and twelve percent and settle into a strong walking pace',
      'Hold that for twenty-five minutes, letting your arms swing rather than gripping the rails',
      'Drop the incline back to flat for the last two minutes',
      'You should be breathing hard enough that talking is possible but not comfortable'
    ],
    coaching: 'Let go of the handrails. Holding on can cut the work by a third and puts your spine into a position it was not designed to walk in.',
    why: 'One of the most joint-friendly ways to work hard. The incline recruits your glutes and hamstrings far more than flat walking, and there is almost no impact through the knees.',
    watchOut: [
      'Gripping the rails and leaning back, which is the single most common thing that makes this session ineffective',
      'Incline so steep you end up on your toes — your whole foot should land each step',
      'Any pulling in the calf or Achilles: lower the incline rather than pushing on through it'
    ],
    load: 'Set the incline so your breathing is heavy but your walking still looks normal. If your form changes, it is too steep.',
    credits: 70
  },

  {
    id: 'gym-cross-trainer-intervals',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Cross Trainer Intervals',
    youtube: 'elliptical interval training workout',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: ['elliptical'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'quadriceps', 'glutes', 'shoulder', 'upper-back'],
    contraindications: ['shoulder-acute'],
    energyRequired: 6,
    difficultyLevel: 3,
    duration: 1200,
    perSide: false,
    sets: 6,
    reps: '90 seconds hard, 90 seconds easy',
    rest: '90s active',
    instructions: [
      'Start with three minutes at an easy pace and light resistance to warm up',
      'Raise the resistance and work hard for ninety seconds, driving through the handles as well as the legs',
      'Drop the resistance back down and spin easy for ninety seconds',
      'Repeat six times, then finish with three easy minutes',
      'Keep your stride full throughout, even during the hard efforts'
    ],
    coaching: 'Push and pull the handles rather than just holding them. The cross trainer is one of the few machines that can work your whole body at once, and most people waste half of it.',
    why: 'Gets your heart and lungs working hard with no impact through the joints at all, which makes it a genuinely good option on days when running or jumping does not feel available.',
    watchOut: [
      'Short, choppy strides when the resistance goes up — better to lower the resistance and keep the full range',
      'Letting the arms go passive, so the upper body stops contributing',
      'Leaning your weight onto the fixed centre bars rather than staying upright'
    ],
    load: 'Hard enough that you could not hold a conversation during the ninety seconds, easy enough that you can recover fully in the ninety that follow.',
    credits: 70
  },

  {
    id: 'gym-stair-climber-steady',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Stair Climber — Steady',
    youtube: 'stair climber workout proper form',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: ['stair-climber'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'quadriceps', 'hamstring', 'calves'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 6,
    difficultyLevel: 3,
    duration: 1200,
    perSide: false,
    sets: 1,
    reps: '20 minutes',
    rest: '0s',
    instructions: [
      'Step on and start slowly, finding the rhythm before you speed up',
      'Stand tall with your weight over the middle of your foot, not on your toes',
      'Rest your hands lightly on the rails for balance only, not for support',
      'Build to a pace you can hold for twenty minutes and stay there',
      'Take whole steps rather than short ones — the full step is where the glute work is'
    ],
    coaching: 'Push down through the heel of the standing leg. That one adjustment moves the work from the front of your thigh into your backside, which is where you want it.',
    why: 'Works the glutes harder than almost any cardio machine while keeping impact low. Good for anyone who wants to feel stronger through the hips as well as fitter.',
    watchOut: [
      'Leaning your bodyweight onto the handrails, which takes most of the work out of it',
      'Short, fast, toe-only steps rather than full ones — speed is not the point here',
      'Hunching forward over the console; stand tall and look ahead'
    ],
    load: 'A pace you could hold for the full twenty minutes. If you are slowing down by minute twelve, start slower next time.',
    credits: 75
  },

  {
    id: 'gym-stair-climber-intervals',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Stair Climber Intervals',
    youtube: 'stair climber interval workout',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: ['stair-climber'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'quadriceps', 'hamstring', 'calves'],
    contraindications: ['knee-acute', 'hip-acute', 'ankle-foot-acute'],
    energyRequired: 7,
    difficultyLevel: 5,
    duration: 900,
    perSide: false,
    sets: 6,
    reps: '45 seconds fast, 75 seconds easy',
    rest: '75s active',
    instructions: [
      'Climb easy for three minutes to warm up',
      'Raise the speed and climb hard for forty-five seconds, still taking full steps',
      'Drop the speed right down and climb easy for seventy-five seconds',
      'Repeat six times, then finish with two easy minutes',
      'If your form starts breaking down, cut the session short rather than pushing through'
    ],
    coaching: 'Hands off the rails during the hard efforts if you safely can. That is the difference between a demanding session and an easy one that only looks demanding.',
    why: 'Short, hard and low impact. This raises your fitness quickly and hits the glutes and legs hard without the joint loading of sprinting.',
    watchOut: [
      'Hanging off the rails as you tire, which is the point at which the session stops working',
      'Toe-tapping tiny steps at high speed instead of full steps at a manageable one',
      'Any sharp knee pain: stop the intervals and switch to steady climbing or the bike'
    ],
    load: 'The hard forty-five seconds should feel genuinely hard by round two. If round one already feels desperate, slow it down.',
    credits: 80
  },

  {
    id: 'gym-ski-erg-intervals',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Ski Erg Intervals',
    youtube: 'ski erg technique workout',
    category: 'cardio',
    movementPattern: 'pull',
    equipment: ['ski-erg'],
    equipmentOptional: [],
    affectsAreas: ['full-body', 'upper-back', 'abdominals', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'lower-back-acute'],
    energyRequired: 7,
    difficultyLevel: 5,
    duration: 900,
    perSide: false,
    sets: 8,
    reps: '30 seconds hard, 60 seconds easy',
    rest: '60s active',
    instructions: [
      'Stand facing the machine, feet hip-width apart, and reach up to take a handle in each hand',
      'Pull both handles down past your hips, hinging at the hips and using your stomach as much as your arms',
      'Stand back up and reach overhead again to reset',
      'Work hard for thirty seconds, then pull gently for sixty, and repeat eight times',
      'Finish with two easy minutes'
    ],
    coaching: 'This is a hinge, not an arm exercise. If your arms are burning and your stomach is not, you are pulling with the wrong thing.',
    why: 'One of the few pieces of cardio kit that works the upper body and core hard, which makes it a genuinely useful change if running and cycling are your usual options.',
    watchOut: [
      'Pulling with the arms only and leaving the hips out of it, which tires you quickly and works little',
      'Rounding the lower back at the bottom of the pull — hinge from the hips and keep the chest open',
      'Reaching so high you come up on your toes; stay flat-footed and stable'
    ],
    load: 'Damper around the middle to start. Hard effort should leave you needing most of the sixty seconds to recover.',
    credits: 75
  },

  // ══════════════════════════════════════════════════════════════════════
  // CONDITIONING — SLED, ROPES, CARRIES
  // ══════════════════════════════════════════════════════════════════════

  {
    id: 'gym-sled-push',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Sled Push',
    youtube: 'sled push prowler technique',
    category: 'cardio',
    movementPattern: 'locomotion',
    equipment: ['sled'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'calves', 'abdominals', 'shoulder'],
    contraindications: ['knee-acute', 'lower-back-acute', 'shoulder-acute'],
    energyRequired: 8,
    difficultyLevel: 5,
    duration: 600,
    perSide: false,
    sets: 6,
    reps: '20 metres',
    rest: '60s',
    instructions: [
      'Load the sled, take hold of the high handles, and lean into it with straight arms',
      'Set your body at an angle, chest forward, and drive it with your legs rather than your arms',
      'Take short, powerful steps and keep the sled moving continuously for twenty metres',
      'Walk back to the start as your rest, then go again',
      'Six lengths in total, resting about a minute between each'
    ],
    coaching: 'Short steps beat long ones every time. Long strides feel more powerful and actually stall the sled between each one.',
    why: 'Hard conditioning with no eccentric loading at all, which means it builds work capacity and leg strength while leaving you far less sore than most equivalent sessions.',
    watchOut: [
      'Long, reaching strides that make the sled stop and start rather than glide',
      'Letting the hips drop and the lower back round as you tire',
      'Bent arms taking the strain — arms stay straight and locked, legs do the work'
    ],
    load: 'Heavy enough that twenty metres is a real effort, light enough that the sled never stops moving.',
    credits: 90
  },

  {
    id: 'gym-battle-ropes-waves',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Battle Rope Waves',
    youtube: 'battle rope alternating waves technique',
    category: 'cardio',
    movementPattern: 'isometric',
    equipment: ['battle-ropes'],
    equipmentOptional: [],
    affectsAreas: ['shoulder', 'upper-back', 'abdominals', 'triceps-biceps'],
    contraindications: ['shoulder-acute', 'lower-back-acute'],
    energyRequired: 7,
    difficultyLevel: 4,
    duration: 480,
    perSide: false,
    sets: 6,
    reps: '30 seconds',
    rest: '45s',
    instructions: [
      'Take one rope end in each hand and step back until there is a slight slack',
      'Drop into a quarter squat with your chest up and your stomach braced',
      'Drive one arm down as the other comes up, making fast alternating waves down the rope',
      'Keep going for thirty seconds, rest forty-five, and repeat six times',
      'Aim for waves that reach the anchor point rather than dying halfway'
    ],
    coaching: 'Stay low the whole way through. The moment you stand up straight your stomach stops working and it becomes an arms-only exercise.',
    why: 'Raises your heart rate extremely quickly while working the shoulders and midsection, and there is no impact through the legs at all.',
    watchOut: [
      'Standing tall as you tire, which takes the core out of it entirely',
      'Small waves that stop halfway down the rope, usually a sign of gripping too tight',
      'Holding your breath — breathe steadily through each thirty-second effort'
    ],
    load: 'Effort, not weight: aim for waves that stay big for the full thirty seconds rather than fading after ten.',
    credits: 70
  },

  {
    id: 'gym-kettlebell-suitcase-carry',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Kettlebell Suitcase Carry',
    youtube: 'suitcase carry kettlebell technique',
    category: 'strength',
    movementPattern: 'carry',
    equipment: ['kettlebell'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'upper-back', 'glutes', 'shoulder'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 300,
    perSide: true,
    sets: 4,
    reps: '30 metres each side',
    rest: '60s',
    instructions: [
      'Stand a kettlebell beside one foot and pick it up with a straight back, as though lifting a suitcase',
      'Stand tall with the bell hanging at your side and your shoulders level',
      'Walk thirty metres at a normal pace, resisting the pull to one side',
      'Set it down, swap hands, and walk back',
      'Four lengths in total, two each side'
    ],
    coaching: 'The exercise is the not-leaning. Your stomach is working the entire walk to keep you upright, even though nothing appears to be happening.',
    why: 'This is the strength that shows up in real life — carrying shopping, a toolbox, a child on one hip. It builds a midsection that holds you steady rather than one that just looks a certain way.',
    watchOut: [
      'Leaning away from the weight to counterbalance it, which removes the whole point',
      'The loaded shoulder creeping up towards the ear — keep both shoulders level',
      'Rushing. Walk at a normal pace rather than hurrying to finish'
    ],
    load: 'Heavy enough that staying upright takes real effort, light enough that you never lean. If you lean, go lighter.',
    credits: 55
  },

  {
    id: 'gym-farmers-carry-heavy',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: "Farmer's Carry — Heavy",
    youtube: 'farmers carry technique heavy',
    category: 'strength',
    movementPattern: 'carry',
    equipment: ['kettlebell'],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['abdominals', 'upper-back', 'glutes', 'calves'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 6,
    difficultyLevel: 3,
    duration: 300,
    perSide: false,
    sets: 4,
    reps: '40 metres',
    rest: '75s',
    instructions: [
      'Set a kettlebell either side of you and pick both up with a flat back and braced stomach',
      'Stand tall, shoulders back and down, and let the weights hang',
      'Walk forty metres at a steady pace, breathing normally',
      'Set them down under control rather than dropping them',
      'Four lengths, resting around seventy-five seconds between'
    ],
    coaching: 'Set your shoulders back before you take the first step, and hold that position the whole way. Once they round forward the walk stops being useful.',
    why: 'Builds grip, posture and a genuinely strong midsection all at once, and it transfers directly to carrying anything heavy in daily life.',
    watchOut: [
      'Shoulders rounding forward as the grip tires — that is the point to stop the set',
      'Holding your breath; breathe steadily throughout',
      'Dropping the weights at the end rather than setting them down, which is where backs get hurt'
    ],
    load: 'Heavy enough that your grip is the thing that limits you, not your back or your posture.',
    credits: 60
  }

];

// ══════════════════════════════════════════════════════════════════════
// CABLE AND MACHINE STRENGTH
// ══════════════════════════════════════════════════════════════════════

GYM.push(
  {
    id: 'gym-cable-chest-press',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Cable Chest Press',
    youtube: 'cable chest press standing technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['cable-machine'],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder', 'abdominals'],
    contraindications: ['shoulder-acute', 'chest-pecs-acute'],
    energyRequired: 5,
    difficultyLevel: 3,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Set both cables to chest height and stand between the two towers',
      'Take one handle in each hand, palms facing down',
      'Step one foot forward so you feel stable, leaning very slightly forward',
      'Press both hands forward until your arms are almost straight, without locking your elbows',
      'Return slowly over three counts, letting your hands come back to chest width'
    ],
    coaching: 'The slow return is where the work actually happens. Most people rush it, and it is the half of the movement that builds the strength.',
    why: 'Pressing from a cable keeps tension on the chest through the whole range, and standing to do it means your core is working the entire time without you having to think about it.',
    watchOut: [
      'Shoulders creeping up towards your ears — set them down and back before each set',
      'Letting the weight pull your arms back fast at the end of the rep, which loses most of the benefit',
      'Feeling this at the front of the shoulder rather than across the chest, which usually means the cables are set too high',
      'Any pinching in the shoulder joint: stop, lower the weight, and try a narrower press'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your form does not change.',
    credits: 50
  },

  {
    id: 'gym-seated-cable-row',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Seated Cable Row',
    youtube: 'seated cable row proper form',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['cable-machine'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'triceps-biceps', 'shoulder'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '60s',
    tempo: '2-1-3',
    instructions: [
      'Sit at the machine with your feet on the platform and a slight bend in your knees',
      'Take the handle and sit tall, arms straight, chest lifted',
      'Pull the handle to your lower ribs by driving your elbows back past your body',
      'Squeeze your shoulder blades together for a full second at the end',
      'Let the handle travel back slowly over three counts until your arms are straight again'
    ],
    coaching: 'Lead with the elbows, not the hands. Think about putting your elbows in your back pockets and the right muscles do the work automatically.',
    why: 'Builds the muscles across your upper back that hold your shoulders where they belong, which is why rowing tends to make people feel taller as well as stronger.',
    watchOut: [
      'Leaning back to start the pull, which turns it into a lower-back exercise',
      'Shrugging the shoulders up towards the ears instead of pulling the blades together',
      'Letting the weight drag your arms forward fast at the end of each rep'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that you never lean back to move it.',
    credits: 50
  },

  {
    id: 'gym-lat-pulldown',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Lat Pulldown',
    youtube: 'lat pulldown proper form technique',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['cable-machine'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 3,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '10',
    rest: '60s',
    tempo: '2-1-3',
    instructions: [
      'Set the thigh pad so your legs are held firmly and your feet are flat on the floor',
      'Take the bar slightly wider than shoulder width, palms facing away',
      'Sit tall and lean back just slightly, around ten or fifteen degrees',
      'Pull the bar down to your upper chest by driving your elbows down towards your ribs',
      'Let it rise slowly over three counts until your arms are straight and your shoulders lift a little'
    ],
    coaching: 'Start each rep by pulling your shoulder blades down, before your arms bend at all. That one habit is the difference between feeling this in your back and feeling it only in your arms.',
    why: 'The most approachable way to build genuine pulling strength if a pull-up is not available yet, and it is the direct route towards one.',
    watchOut: [
      'Leaning far back and using bodyweight to swing the bar down',
      'Pulling the bar behind your neck, which puts the shoulder in a vulnerable position for no extra benefit',
      'Letting the bar shoot back up, taking your shoulders with it',
      'Any pinching in the front of the shoulder: narrow your grip and lighten the weight'
    ],
    load: 'Heavy enough that the tenth rep is genuinely difficult, light enough that you are not swinging to move it.',
    credits: 50
  },

  {
    id: 'gym-cable-pull-through',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Cable Pull-Through',
    youtube: 'cable pull through hip hinge technique',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['cable-machine'],
    equipmentOptional: [],
    affectsAreas: ['glutes', 'hamstring', 'lower-back'],
    contraindications: ['lower-back-acute', 'hamstring-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '60s',
    tempo: '3-1-2',
    instructions: [
      'Set a rope attachment at the lowest position on the cable',
      'Face away from the machine, straddle the cable, and take the rope between your legs',
      'Walk forward a couple of steps until there is tension, feet slightly wider than hips',
      'Push your hips back with a flat back, letting the rope travel between your legs',
      'Drive your hips forward and squeeze your backside hard to stand up tall'
    ],
    coaching: 'This is a hip movement, not an arm movement. Your arms are just hooks — the rope should feel like it is being pushed forward by your hips, not pulled by your hands.',
    why: 'The easiest way to learn a hip hinge safely, because the cable pulls you into the right position rather than loading your spine. It is the pattern behind deadlifting and picking anything heavy off the floor.',
    watchOut: [
      'Squatting down rather than pushing the hips back — the knees should stay softly bent and fairly still',
      'Rounding the lower back at the bottom; stop where your back is still flat',
      'Leaning back at the top and over-arching, which is where backs get sore',
      'Pulling with the arms, which usually means the weight is too heavy'
    ],
    load: 'Heavy enough to feel your backside working, light enough that your back stays flat throughout.',
    credits: 50
  },

  {
    id: 'gym-tricep-rope-pushdown',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Tricep Rope Pushdown',
    youtube: 'tricep rope pushdown cable technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['cable-machine'],
    equipmentOptional: [],
    affectsAreas: ['triceps-biceps'],
    contraindications: ['wrist-elbow-acute', 'shoulder-acute'],
    energyRequired: 3,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '15',
    rest: '30s',
    tempo: '2-1-3',
    instructions: [
      'Set the cable high with a rope attachment and take one end in each hand',
      'Stand a step back with a slight forward lean, elbows pinned to your sides',
      'Push both hands down until your arms are straight, letting the rope split apart at the bottom',
      'Hold the bottom for a moment and squeeze',
      'Let your hands rise slowly until your forearms are parallel to the floor'
    ],
    coaching: 'Your elbows should not move at all. If they drift forward or flare out, the weight is too heavy and your shoulders have started helping.',
    why: 'Strengthens the back of the upper arm, which is what actually gives the arm shape and what does most of the work in any pressing movement.',
    watchOut: [
      'Elbows travelling forward as you push, turning it into a shoulder exercise',
      'Leaning your bodyweight over the rope to force it down',
      'Not straightening fully at the bottom, which is where most of the work is'
    ],
    load: 'Lighter than you think. Small muscles respond to control, not weight.',
    credits: 35
  },

  {
    id: 'gym-cable-woodchop',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Cable Woodchop',
    youtube: 'cable woodchop rotation technique',
    category: 'strength',
    movementPattern: 'anti-rotation',
    equipment: ['cable-machine'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'core', 'shoulder', 'glutes'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 5,
    difficultyLevel: 3,
    duration: 240,
    perSide: true,
    sets: 3,
    reps: '12 each side',
    rest: '45s',
    tempo: '2-1-2',
    instructions: [
      'Set the cable high and stand side-on to the machine, feet a little wider than your hips',
      'Take the handle in both hands with your arms fairly straight',
      'Pull it down and across your body towards your opposite hip, turning through the hips rather than the waist',
      'Let your back foot pivot as you turn, the way it would if you were throwing something',
      'Return slowly to the start and repeat, then swap sides'
    ],
    coaching: 'Turn from the hips and let the feet pivot. Twisting through a fixed lower back is what makes rotation work uncomfortable, and it is entirely avoidable.',
    why: 'Almost everything you do in life involves rotating and resisting rotation. This trains it directly, and it strengthens the midsection in a way sit-ups cannot.',
    watchOut: [
      'Keeping the feet planted and twisting through the lower back instead',
      'Bending the arms and turning it into a pulling exercise',
      'Rushing the return; control it back rather than letting the cable snap you round'
    ],
    load: 'Light enough that you can control the return with the same speed as the pull.',
    credits: 45
  },

  {
    id: 'gym-leg-press',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Leg Press',
    youtube: 'leg press machine proper form',
    category: 'strength',
    movementPattern: 'squat',
    equipment: ['leg-press-machine'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'hamstring'],
    contraindications: ['knee-acute', 'lower-back-acute', 'hip-acute'],
    energyRequired: 6,
    difficultyLevel: 3,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '10',
    rest: '90s',
    tempo: '3-1-2',
    instructions: [
      'Sit with your back and hips flat against the pad and your feet shoulder-width on the platform',
      'Release the safety catches and let the platform come towards you slowly',
      'Lower until your knees reach roughly ninety degrees, or sooner if your hips start to lift',
      'Press back up through your whole foot until your legs are almost straight',
      'Stop just short of locking the knees out at the top'
    ],
    coaching: 'Push through your heels and mid-foot rather than your toes. It moves the work into your backside and takes pressure off the front of the knee.',
    why: 'Lets you build real leg strength with your back fully supported, which makes it a good option if squatting is uncomfortable or you are early in your training.',
    watchOut: [
      'Lowering so far that your hips curl up off the pad, which loads the lower back',
      'Locking the knees hard at the top',
      'Knees falling inward as you press; they should track over your middle toes',
      'Any sharp knee pain: reduce the range before reducing anything else'
    ],
    load: 'Challenging by the final rep, but you should never be straining or holding your breath.',
    credits: 55
  },

  {
    id: 'gym-chest-press-machine',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Chest Press Machine',
    youtube: 'chest press machine proper form',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['chest-press-machine'],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'chest-pecs-acute'],
    energyRequired: 5,
    difficultyLevel: 2,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '60s',
    tempo: '2-1-3',
    instructions: [
      'Adjust the seat so the handles sit level with the middle of your chest',
      'Sit back with your shoulders against the pad and your feet flat on the floor',
      'Press the handles forward until your arms are almost straight',
      'Stop just short of locking your elbows',
      'Return slowly over three counts until your hands are back level with your chest'
    ],
    coaching: 'Keep your shoulder blades pinned back against the pad throughout. If they roll forward as you press, the shoulder takes work the chest should be doing.',
    why: 'A good starting point for building pressing strength, because the machine holds the path for you and lets you concentrate on effort rather than balance.',
    watchOut: [
      'Seat too high or too low, so the handles sit at the neck or the stomach rather than mid-chest',
      'Shoulders rolling forward off the pad at the end of each press',
      'Letting the weight stack drop back fast rather than controlling the return'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your shoulders stay set.',
    credits: 50
  },

  {
    id: 'gym-leg-curl',
    position: 'seated',
    impact: false,
    balanceDemand: false,
    name: 'Leg Curl',
    youtube: 'hamstring leg curl machine form',
    category: 'strength',
    movementPattern: 'hinge',
    equipment: ['leg-curl-machine'],
    equipmentOptional: [],
    affectsAreas: ['hamstring', 'calves'],
    contraindications: ['hamstring-acute', 'knee-acute'],
    energyRequired: 4,
    difficultyLevel: 2,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Set the machine so the pad rests just above your heels, not on your calves',
      'Lie or sit with your knees in line with the machine pivot',
      'Curl your heels towards your backside as far as they will comfortably go',
      'Pause for a moment at the top',
      'Lower slowly over three counts until your legs are almost straight'
    ],
    coaching: 'Point your toes towards your shins as you curl. It takes the calves out of it and puts the work squarely in the hamstring.',
    why: 'Hamstrings are the most commonly under-trained muscle in the leg, and strengthening them directly protects the knee and improves almost everything you do standing up.',
    watchOut: [
      'Lifting the hips off the pad to help the weight up',
      'Pad sitting too high on the calf, which is uncomfortable and reduces the range',
      'Dropping the weight quickly at the end of each rep rather than lowering it'
    ],
    load: 'Lighter than you expect. Hamstrings respond well to control and badly to being rushed.',
    credits: 40
  }
);

// ══════════════════════════════════════════════════════════════════════
// FREE WEIGHTS — ported from morning-programme.js (CON-5), rewritten to
// the Exercise Entry Standard. That file's coaching depth was the best in
// the product; its schema (guide{} plus coachNote) was the worst. The
// content is kept, the shape is not.
// ══════════════════════════════════════════════════════════════════════

GYM.push(
  {
    id: 'gym-incline-dumbbell-press',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Incline Dumbbell Press',
    youtube: 'incline dumbbell press technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['dumbbell', 'bench'],
    equipmentOptional: [],
    affectsAreas: ['chest-pecs', 'shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute', 'chest-pecs-acute'],
    energyRequired: 6,
    difficultyLevel: 4,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '10',
    rest: '75s',
    tempo: '3-1-2',
    instructions: [
      'Set an adjustable bench to around forty-five degrees',
      'Sit down with a dumbbell resting on each thigh, then lie back and bring them to shoulder height',
      'Start with your palms facing forward and your elbows at roughly forty-five degrees from your body',
      'Press both dumbbells up and slightly together until your arms are almost straight',
      'Lower slowly over three counts until your upper arms are level with your chest'
    ],
    coaching: 'Elbows at forty-five degrees, not flared straight out to the sides. That single angle is what keeps the shoulder joint comfortable while the chest still does the work.',
    why: 'The incline shifts the work to the upper chest and shoulders, which is the area that most changes how the upper body looks and holds itself. It is also gentler on the shoulder than flat pressing.',
    watchOut: [
      'Elbows flaring straight out to the sides, which is the most common cause of shoulder pain in pressing',
      'Arching the lower back off the bench to move heavier weight',
      'Banging the dumbbells together at the top; bring them near, not into each other',
      'Bench set too steep, above about forty-five degrees, which turns it into a shoulder press'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your elbows stay at forty-five degrees throughout.',
    credits: 55
  },

  {
    id: 'gym-dumbbell-arnold-press',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Arnold Press',
    youtube: 'arnold press dumbbell technique',
    category: 'strength',
    movementPattern: 'push',
    equipment: ['dumbbell'],
    equipmentOptional: ['bench'],
    affectsAreas: ['shoulder', 'triceps-biceps', 'upper-back'],
    contraindications: ['shoulder-acute', 'lower-back-acute'],
    energyRequired: 6,
    difficultyLevel: 4,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '10',
    rest: '75s',
    tempo: '2-1-3',
    instructions: [
      'Sit or stand tall with a dumbbell in each hand held in front of your shoulders, palms facing you',
      'Brace your stomach before you begin',
      'Press upwards while rotating your palms to face forwards, finishing with arms almost straight overhead',
      'Reverse the whole movement slowly, rotating the palms back towards you as you lower',
      'Finish each rep back at the start position before beginning the next'
    ],
    coaching: 'The rotation is the point. Turning as you press takes the shoulder through more of its range than a straight press, which is why it feels harder with less weight.',
    why: 'Works the shoulder through its whole range rather than one line, which builds a shoulder that is strong in the positions life actually asks for.',
    watchOut: [
      'Arching the lower back to get the weight overhead — brace the stomach first and use less weight',
      'Rushing the rotation so it becomes a straight press with a flick at the start',
      'Any pinching at the top of the movement: reduce how far overhead you go'
    ],
    load: 'Noticeably lighter than a straight overhead press. The rotation makes the same weight much harder.',
    credits: 55
  },

  {
    id: 'gym-renegade-row',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Dumbbell Renegade Row',
    youtube: 'renegade row technique form',
    category: 'strength',
    movementPattern: 'anti-rotation',
    equipment: ['dumbbell'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'abdominals', 'shoulder', 'triceps-biceps'],
    contraindications: ['shoulder-acute', 'lower-back-acute', 'wrist-elbow-acute'],
    energyRequired: 7,
    difficultyLevel: 6,
    duration: 240,
    perSide: true,
    sets: 3,
    reps: '8 each side',
    rest: '75s',
    tempo: '2-1-2',
    instructions: [
      'Set two dumbbells on the floor about shoulder-width apart',
      'Take a press-up position gripping the handles, feet wider than usual for stability',
      'Brace your stomach and squeeze your backside so your body is one straight line',
      'Row one dumbbell up to your ribs while keeping your hips completely still',
      'Lower it under control and repeat on the other side'
    ],
    coaching: 'Widen your feet. A narrow stance makes the hips swing, and the whole exercise is about the hips not swinging.',
    why: 'Trains your back and your midsection at the same time, and specifically trains the midsection to stop you twisting — which is what it does all day in real life.',
    watchOut: [
      'Hips rotating as you row, which is the sign to go lighter or widen the feet',
      'Backside lifting into a pike position',
      'Any wrist discomfort from gripping the handles: use hexagonal dumbbells if available, or skip this one today'
    ],
    load: 'Light. Almost everyone goes too heavy here, and the moment the hips move it stops working.',
    credits: 65
  },

);

// ══════════════════════════════════════════════════════════════════════
// LOADED CORE — the database had none. Every core exercise in the product
// was bodyweight, which caps progress for anyone past the first few months.
// ══════════════════════════════════════════════════════════════════════

GYM.push(
  {
    id: 'gym-cable-crunch',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Cable Crunch',
    youtube: 'cable crunch kneeling technique',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: ['cable-machine'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'core'],
    contraindications: ['lower-back-acute', 'lower-back-acute'],
    energyRequired: 5,
    difficultyLevel: 3,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '15',
    rest: '45s',
    tempo: '2-1-3',
    instructions: [
      'Set a rope attachment at the top of the cable and kneel facing the machine',
      'Hold the rope either side of your head with your elbows bent',
      'Keeping your hips still, curl your ribs down towards your hips',
      'Pause at the bottom and breathe out fully',
      'Return slowly until you feel your stomach lengthen, without letting the weight pull you upright fast'
    ],
    coaching: 'Move your ribs, not your hips. If your backside is travelling towards your heels, your hips are doing the work and your stomach is along for the ride.',
    why: 'Lets you add weight to core work, which is the only way to keep making progress once planks and sit-ups have stopped being difficult.',
    watchOut: [
      'Hips sitting back towards the heels, turning it into a hip movement',
      'Pulling with the arms rather than curling the trunk',
      'Yanking the head forward with the rope, which strains the neck'
    ],
    load: 'Light enough that you can pause and breathe out at the bottom of every rep.',
    credits: 45
  },

  {
    id: 'gym-weighted-decline-situp',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Weighted Decline Sit-Up',
    youtube: 'decline sit up weighted technique',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: ['bench', 'medicine-ball'],
    equipmentOptional: ['dumbbell'],
    affectsAreas: ['abdominals', 'core', 'hip-flexor'],
    contraindications: ['lower-back-acute', 'lower-back-acute', 'hip-acute'],
    energyRequired: 6,
    difficultyLevel: 5,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '10',
    rest: '60s',
    tempo: '2-1-3',
    instructions: [
      'Set a decline bench to a shallow angle and hook your feet securely',
      'Hold a medicine ball or dumbbell against your chest with both hands',
      'Lower yourself back slowly over three counts, keeping your chin tucked',
      'Go back only as far as you can control without your lower back arching off the pad',
      'Curl back up, leading with your ribs rather than your head'
    ],
    coaching: 'Start with a shallow decline and no more weight than you can control on the way down. The lowering is the part that builds the strength and the part everyone rushes.',
    why: 'Adding weight is what keeps core training progressing. A hundred unweighted sit-ups builds endurance; ten controlled weighted ones build strength.',
    watchOut: [
      'Lower back arching away from the pad at the bottom — shorten the range',
      'Pulling the head forward with the chin on the chest, which strains the neck',
      'Dropping back quickly and bouncing up off the bottom',
      'Any lower-back discomfort: stop, and use cable crunches or dead bugs instead'
    ],
    load: 'Start with no weight at all and add only once ten slow reps feel controlled.',
    credits: 50
  },

  {
    id: 'gym-ab-wheel-rollout',
    position: 'floor',
    impact: false,
    balanceDemand: false,
    name: 'Ab Wheel Rollout',
    youtube: 'ab wheel rollout beginner technique',
    category: 'strength',
    movementPattern: 'anti-extension',
    equipment: ['ab-wheel'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'core', 'lower-back', 'shoulder'],
    contraindications: ['lower-back-acute', 'shoulder-acute', 'lower-back-acute'],
    energyRequired: 6,
    difficultyLevel: 6,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '8',
    rest: '75s',
    tempo: '3-1-2',
    instructions: [
      'Kneel on a mat with the wheel on the floor directly beneath your shoulders',
      'Squeeze your backside and brace your stomach so your hips and ribs are locked together',
      'Roll the wheel forward slowly, only as far as you can go without your lower back arching',
      'Pause briefly at your furthest controlled point',
      'Pull yourself back by drawing your hips and ribs towards each other'
    ],
    coaching: 'Your range is decided by your back, not your arms. Go only as far as you can keep the lower back flat, even if that is a few inches at first — that is a successful rep.',
    why: 'One of the hardest and most effective core exercises there is, because it trains your midsection to stop your back arching under load, which is exactly what it needs to do when you lift anything.',
    watchOut: [
      'Lower back sagging as you roll out, which is the moment the exercise stops working and starts risking something',
      'Going too far too soon — this is one to build over weeks, not sessions',
      'Pulling back with the arms instead of the stomach'
    ],
    load: 'Bodyweight only. Progress by rolling further, never by adding weight.',
    credits: 55
  }
);

// ══════════════════════════════════════════════════════════════════════
// MEDICINE BALL, BALANCE AND PLYOMETRICS
//
// balance-board, bosu-ball, wobble-cushion, plyo-box and trx were all
// tickable in equipment.js and carried by no exercise anywhere. A person
// could tell the app they owned them and nothing changed.
// ══════════════════════════════════════════════════════════════════════

GYM.push(
  {
    id: 'gym-medicine-ball-rotational-throw',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Medicine Ball Rotational Throw',
    youtube: 'medicine ball rotational throw wall',
    category: 'strength',
    movementPattern: 'rotation',
    equipment: ['medicine-ball'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'core', 'glutes', 'shoulder'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 6,
    difficultyLevel: 4,
    duration: 180,
    perSide: true,
    sets: 3,
    reps: '8 each side',
    rest: '60s',
    tempo: 'Explosive',
    instructions: [
      'Stand side-on to a solid wall, about two feet away, holding the ball at chest height',
      'Turn away from the wall, letting your back foot pivot and your hips rotate',
      'Drive back explosively, turning through the hips and releasing the ball into the wall',
      'Catch the rebound, absorb it by turning back, and go straight into the next throw',
      'Complete all reps on one side before swapping'
    ],
    coaching: 'The power comes from the back foot and the hips, not the arms. If your arms are tired before your midsection, you are throwing with the wrong end of your body.',
    why: 'Trains you to produce force quickly through rotation, which is what almost every sport and a great deal of ordinary movement actually requires.',
    watchOut: [
      'Feet planted and twisting through the lower back rather than pivoting',
      'Throwing with the arms alone, which is both weaker and harder on the shoulder',
      'Standing too close to the wall, so there is no time to catch the rebound safely'
    ],
    load: 'Light. Speed is the point, and a heavy ball slows the throw down to where it stops training power.',
    credits: 55
  },

  {
    id: 'gym-bosu-squat',
    position: 'standing',
    impact: false,
    balanceDemand: true,
    name: 'BOSU Ball Squat',
    youtube: 'bosu ball squat balance technique',
    category: 'strength',
    movementPattern: 'squat',
    equipment: ['bosu-ball'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'ankle-foot', 'core'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 5,
    difficultyLevel: 4,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '10',
    rest: '60s',
    tempo: '3-1-2',
    instructions: [
      'Place the BOSU dome-side down and step onto the flat platform, feet shoulder-width apart',
      'Take a moment to find your balance before starting, arms out in front for counterbalance',
      'Squat slowly, going only as low as you can while staying steady',
      'Pause briefly at the bottom',
      'Press back up through your whole foot without letting the platform tip'
    ],
    coaching: 'Grip the platform with your toes and spread your weight across the whole foot. Balance comes from the foot, not from tensing everything above it.',
    why: 'Trains the small stabilising muscles around the ankle, knee and hip that a stable floor never asks for. That stability is what keeps you upright on uneven ground.',
    watchOut: [
      'Going as deep as a normal squat — depth is not the goal, control is',
      'Arms windmilling to stay balanced, which means it is too advanced today',
      'Any history of ankle instability: start with a two-footed hold before adding the squat'
    ],
    load: 'Bodyweight only until you can complete all ten reps without the platform tipping.',
    credits: 50
  },

  {
    id: 'gym-balance-board-hold',
    generalPurpose: true,   // C2, 13 Aug 2026. Tagged category:
    // 'rehabilitation' but not a rehab protocol -- balance-board work and
    // general seated exercises. Promoted so the C2 filter does not remove
    // them from ordinary sessions. The CATEGORY looks wrong and should be
    // corrected at source; logged rather than changed here, because
    // intentPriority() reads category === 'rehabilitation' for the
    // 'recover' training intent and that wants checking first.
    position: 'standing',
    impact: false,
    balanceDemand: true,
    name: 'Balance Board Hold',
    youtube: 'balance board hold technique beginners',
    category: 'strength',
    movementPattern: 'proprioception',
    equipment: ['balance-board'],
    equipmentOptional: ['wobble-cushion'],
    affectsAreas: ['ankle-foot', 'knee', 'core'],
    contraindications: ['ankle-foot-acute'],
    energyRequired: 3,
    difficultyLevel: 3,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '45 seconds',
    rest: '45s',
    instructions: [
      'Place the board near a wall or something solid you can touch if you need to',
      'Step on with both feet either side of the centre and find level',
      'Hold as still as you can, looking straight ahead rather than down at your feet',
      'Hold for forty-five seconds, rest, and repeat three times',
      'Once that is easy, try it with your eyes closed for a few seconds at a time'
    ],
    coaching: 'Look ahead, not down. Balance is mostly a conversation between your eyes, your inner ear and your feet, and staring at your feet removes one of the three.',
    why: 'Ankle stability is what stops turned ankles and helps the knee track properly. It is quiet, unglamorous work that pays off in everything done on your feet.',
    watchOut: [
      'Gripping with the toes so hard the foot cramps — spread the weight instead',
      'Holding your breath while concentrating',
      'Attempting this without something nearby to steady yourself on'
    ],
    load: 'Bodyweight only. Progress by closing the eyes or standing on one leg, never by adding weight.',
    credits: 35
  },

  {
    id: 'gym-lateral-box-hop',
    position: 'standing',
    impact: true,
    balanceDemand: false,
    name: 'Lateral Box Hop',
    youtube: 'lateral box hop plyometric technique',
    category: 'cardio',
    movementPattern: 'jump',
    equipment: ['plyo-box'],
    equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'calves', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'achilles-acute', 'hip-acute'],
    energyRequired: 7,
    difficultyLevel: 6,
    duration: 180,
    perSide: false,
    sets: 3,
    reps: '20 seconds',
    rest: '60s',
    tempo: 'Quick, light',
    instructions: [
      'Stand beside a low box with your feet together',
      'Hop sideways onto the box, landing softly with both feet',
      'Hop straight down the other side, again landing soft',
      'Continue back and forth for twenty seconds, staying light on your feet',
      'Rest a full minute between sets — this is a power exercise, not a conditioning one'
    ],
    coaching: 'Land quietly. Noise is impact that your joints absorbed instead of your muscles, and quiet landings are the whole skill here.',
    why: 'Trains sideways power and the ability to absorb landing forces, which is what protects knees and ankles during anything unpredictable.',
    watchOut: [
      'Heavy, loud landings, which is the sign to lower the box or stop the set',
      'Knees collapsing inward on landing',
      'Box too high for now — start lower than feels impressive; a low box done well beats a high box done badly',
      'Any knee or ankle pain at all: stop this one and use step-ups instead'
    ],
    load: 'Bodyweight only. Progress by lowering rest or raising the box slightly, never by adding weight.',
    credits: 60
  },

  {
    id: 'gym-trx-row',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'TRX Row',
    youtube: 'trx inverted row suspension technique',
    category: 'strength',
    movementPattern: 'pull',
    equipment: ['trx'],
    equipmentOptional: [],
    affectsAreas: ['upper-back', 'triceps-biceps', 'abdominals', 'shoulder'],
    contraindications: ['shoulder-acute', 'lower-back-acute'],
    energyRequired: 5,
    difficultyLevel: 3,
    duration: 240,
    perSide: false,
    sets: 3,
    reps: '12',
    rest: '60s',
    tempo: '2-1-3',
    instructions: [
      'Take a handle in each hand and walk your feet forward until you are leaning back with arms straight',
      'Squeeze your backside and brace your stomach so your body is one straight line',
      'Pull your chest towards your hands, driving your elbows back past your ribs',
      'Squeeze your shoulder blades together at the top',
      'Lower slowly over three counts until your arms are straight again'
    ],
    coaching: 'Change the difficulty with your feet, not your effort. Walking your feet further forward makes it harder; stepping back makes it easier. That is the whole progression.',
    why: 'Builds pulling strength with your bodyweight, and because your whole body has to stay straight, it trains the midsection at the same time without any separate core work.',
    watchOut: [
      'Hips sagging towards the floor as you tire, which is the point to stop the set',
      'Shrugging the shoulders up rather than pulling the blades together',
      'Pulling only halfway; your chest should reach roughly level with your hands'
    ],
    load: 'Bodyweight. Adjust by walking your feet forward for harder, back for easier.',
    credits: 50
  }
);

// ══════════════════════════════════════════════════════════════════════
// CABLE PALLOF PRESS (11 Aug 2026) — added at Graeme's request. Two band
// versions existed; no cable version did, despite the cable being the
// most common way it is done in a gym and the version that lets you
// change the resistance properly.
// ══════════════════════════════════════════════════════════════════════

GYM.push(
  {
    id: 'gym-cable-pallof-press',
    position: 'standing',
    impact: false,
    balanceDemand: false,
    name: 'Cable Pallof Press',
    youtube: 'cable pallof press anti rotation technique',
    category: 'strength',
    movementPattern: 'anti-rotation',
    equipment: ['cable-machine'],
    equipmentOptional: [],
    affectsAreas: ['abdominals', 'core', 'glutes', 'shoulder'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 4,
    difficultyLevel: 3,
    duration: 240,
    perSide: true,
    sets: 3,
    reps: '10 each side',
    rest: '45s',
    tempo: '2-2-2',
    instructions: [
      'Set the cable to roughly chest height and stand side-on to the machine',
      'Take the handle in both hands and step away until there is real tension, feet shoulder-width apart',
      'Bring your hands to the centre of your chest and brace your stomach',
      'Press both hands straight out in front of you until your arms are almost straight',
      'Hold for two seconds while the cable tries to turn you, then bring your hands back to your chest'
    ],
    coaching: 'Nothing should move except your arms. The cable is trying to rotate you the whole time, and the entire exercise is your midsection quietly refusing to let it.',
    why: 'Trains your core to resist rotation rather than create it, which is what it spends most of its time doing in real life — carrying, reaching, twisting to look behind you. It builds a midsection that holds you steady rather than one that only looks a certain way.',
    watchOut: [
      'Your body turning towards the machine as you press out, which means the weight is too heavy — step in or lighten it',
      'Hips drifting or shoulders rotating; both should stay square to the front throughout',
      'Holding your breath during the two-second hold, which is the most common habit here — breathe steadily',
      'Standing too close to the machine, so there is no tension and nothing to resist'
    ],
    load: 'Light enough that you stay completely square for all ten reps. The moment you start rotating, that is the weight telling you it is too heavy.',
    credits: 50
  }
);

// ══════════════════════════════════════════════════════════════════════
// HOME EQUIPMENT DEPTH (EQ-1, 11 Aug 2026)
//
// Traced a home user's actual kit -- adjustable dumbbells, medicine
// ball, jump box, skipping rope, balance board, bands, mat, steps -- and
// found the balance board reachable by no session type at all, and the
// box, rope and BOSU one exercise deep each. One candidate means it
// appears almost never, which is indistinguishable from not owning it.
//
// Ticking equipment you own should change something.
// ══════════════════════════════════════════════════════════════════════

GYM.push(
  { id: 'balance-board-single-leg', name: 'Balance Board Single-Leg Hold',
    youtube: 'balance board single leg hold progression',
    category: 'strength', movementPattern: 'proprioception',
    position: 'standing', impact: false, balanceDemand: true,
    equipment: ['balance-board'], equipmentOptional: ['bosu-ball'],
    affectsAreas: ['ankle-foot', 'knee', 'hip', 'core'],
    contraindications: ['ankle-foot-acute', 'knee-acute'],
    energyRequired: 3, difficultyLevel: 4, duration: 180,
    perSide: true, sets: 3, reps: '20 seconds each side', rest: '40s',
    instructions: [
      'Set the board near a wall or worktop you can touch if you need to',
      'Step on with both feet and find level first',
      'Shift your weight onto one foot and lift the other just clear of the board',
      'Hold as still as you can for twenty seconds, looking straight ahead',
      'Step down between sides rather than hopping across'
    ],
    coaching: 'Look ahead, not down. Balance is a conversation between your eyes, your inner ear and your feet, and staring at your feet removes one of the three.',
    why: 'Single-leg balance on an unstable surface is the hardest thing you can ask of the ankle, and it is what turns a stumble into a recovery rather than a fall.',
    watchOut: [
      'Gripping with the toes until the foot cramps — spread the weight instead',
      'Attempting this without something within reach to steady yourself on',
      'Holding your breath while concentrating'
    ],
    load: 'Bodyweight only. Progress by holding longer or closing the eyes briefly, never by adding weight.', credits: 40 },

  { id: 'balance-board-squat', name: 'Balance Board Squat',
    youtube: 'balance board squat technique',
    category: 'strength', movementPattern: 'squat',
    position: 'standing', impact: false, balanceDemand: true,
    equipment: ['balance-board'], equipmentOptional: ['bosu-ball'],
    affectsAreas: ['quadriceps', 'glutes', 'ankle-foot', 'core'],
    contraindications: ['knee-acute', 'ankle-foot-acute'],
    energyRequired: 5, difficultyLevel: 4, duration: 180,
    perSide: false, sets: 3, reps: '10', rest: '60s', tempo: '3-1-3',
    instructions: [
      'Step onto the board with your feet about shoulder-width apart',
      'Find level and take a moment before you start',
      'Squat slowly, going only as low as you can while the board stays steady',
      'Pause briefly at the bottom',
      'Press back up through the whole foot without letting the board tip'
    ],
    coaching: 'Depth is not the goal here, control is. A shallow squat that keeps the board level is a better rep than a deep one that does not.',
    why: 'Trains the small muscles around the ankle, knee and hip that a stable floor never asks for. That is what keeps you upright on uneven ground.',
    watchOut: [
      'Going as deep as a normal squat and losing the board',
      'Arms windmilling to stay balanced, which means it is too advanced today',
      'Knees drifting inward as you press up'
    ],
    load: 'Bodyweight until you can do all ten without the board tipping.', credits: 45 },

  { id: 'balance-board-rocking', name: 'Balance Board Controlled Rocking',
    youtube: 'balance board rocking ankle control',
    category: 'strength', movementPattern: 'proprioception',
    position: 'standing', impact: false, balanceDemand: true,
    equipment: ['balance-board'], equipmentOptional: [],
    affectsAreas: ['ankle-foot', 'calves', 'knee'],
    contraindications: ['ankle-foot-acute'],
    energyRequired: 2, difficultyLevel: 3, duration: 180,
    perSide: false, sets: 3, reps: '30 seconds', rest: '30s',
    instructions: [
      'Step onto the board with both feet, something steady within reach',
      'Tip the board slowly forward until the front edge touches down',
      'Bring it slowly back and tip it to the rear edge',
      'Move deliberately rather than letting it drop from one side to the other',
      'After thirty seconds, switch to rocking side to side'
    ],
    coaching: 'Slowly is the exercise. Letting the board fall from edge to edge is easier and trains almost nothing.',
    why: 'Takes the ankle deliberately through the range where it usually gets caught out. Good preparation before single-leg work and useful in its own right after any ankle trouble.',
    watchOut: [
      'Letting the board drop rather than lowering it',
      'Knees locking straight — keep them softly bent',
      'Attempting it with nothing to steady yourself on'
    ],
    load: 'Bodyweight only.', credits: 35 },

  { id: 'box-step-up-weighted', name: 'Weighted Box Step-Up',
    youtube: 'weighted box step up technique',
    category: 'strength', movementPattern: 'lunge',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['plyo-box', 'dumbbell'], equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'hamstring'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 6, difficultyLevel: 3, duration: 240,
    perSide: true, sets: 3, reps: '10 each side', rest: '60s', tempo: '2-1-3',
    instructions: [
      'Stand facing a box at roughly knee height, a dumbbell in each hand',
      'Place your whole right foot on the box, not just the toes',
      'Drive through the right heel to stand up onto the box',
      'Bring the left foot up to meet it, then step back down leading with the left',
      'Complete all reps on one side before changing'
    ],
    coaching: 'Push down through the foot on the box rather than springing off the back foot. If the back foot is doing the work, the box is too high.',
    why: 'Single-leg strength that carries straight over to stairs, kerbs and getting into a car. It also finds side-to-side differences that two-legged work hides.',
    watchOut: [
      'Pushing off the trailing foot to launch yourself up',
      'Box so high the hip has to rotate to get onto it',
      'Dropping down rather than lowering under control'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that you never push off the back foot.', credits: 50 },

  { id: 'box-jump-step-down', name: 'Box Jump with Step-Down',
    youtube: 'box jump step down safe technique',
    category: 'cardio', movementPattern: 'jump',
    position: 'standing', impact: true, balanceDemand: false,
    equipment: ['plyo-box'], equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'calves', 'ankle-foot'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'achilles-acute', 'hip-acute'],
    energyRequired: 7, difficultyLevel: 5, duration: 180,
    perSide: false, sets: 4, reps: '5', rest: '90s', tempo: 'Explosive up, controlled down',
    instructions: [
      'Stand a comfortable stride from a box you are confident you can clear easily',
      'Dip quickly at the hips and knees, swinging your arms back',
      'Jump up and land softly on the box with both feet, knees bent',
      'Stand up fully on the box',
      'STEP down one foot at a time — never jump down'
    ],
    coaching: 'Step down, always. Jumping down is where nearly every box jump injury happens, and it adds nothing at all to the exercise.',
    why: 'Trains power, which fades earlier than strength does and is what lets you react quickly. Landing on a box rather than the floor means far less impact than a jump squat.',
    watchOut: [
      'Jumping down instead of stepping down',
      'A box so high you have to tuck your knees to clear it — lower is better done well',
      'Landing with straight legs or a heavy thud',
      'Doing these when tired, which is when landing form goes'
    ],
    load: 'Bodyweight only. Progress with box height, slowly, and never with weight.', credits: 55 },

  { id: 'skipping-intervals', name: 'Skipping Intervals',
    youtube: 'skipping rope interval workout technique',
    category: 'cardio', movementPattern: 'jump',
    position: 'standing', impact: true, balanceDemand: false,
    equipment: ['skipping-rope'], equipmentOptional: [],
    affectsAreas: ['calves', 'ankle-foot', 'quadriceps', 'shoulder'],
    contraindications: ['knee-acute', 'ankle-foot-acute', 'achilles-acute'],
    energyRequired: 7, difficultyLevel: 4, duration: 480,
    perSide: false, sets: 6, reps: '40 seconds', rest: '40s',
    instructions: [
      'Set the rope length by standing on the middle — the handles should reach your armpits',
      'Keep your elbows close to your ribs and turn the rope with your wrists',
      'Skip for forty seconds, jumping just high enough to clear the rope',
      'Rest forty seconds, shaking the legs out',
      'Repeat six times'
    ],
    coaching: 'Turn the rope with your wrists, not your arms. Big arm circles are tiring, and they are why most people last thirty seconds.',
    why: 'One of the most efficient pieces of cardio there is, and it trains the calves and ankles to absorb landing forces, which protects them everywhere else.',
    watchOut: [
      'Jumping far higher than the rope needs',
      'Landing flat-footed and heavily — stay on the balls of the feet',
      'Big arm circles instead of wrist turns',
      'Any calf or Achilles tightness: stop, and come back to it another day'
    ],
    load: 'Bodyweight only. Build the number of rounds before the length of them.', credits: 60 },

  { id: 'medicine-ball-overhead-throw', name: 'Medicine Ball Overhead Throw',
    youtube: 'medicine ball overhead throw wall power',
    category: 'strength', movementPattern: 'jump',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['medicine-ball'], equipmentOptional: [],
    affectsAreas: ['full-body', 'shoulder', 'abdominals', 'upper-back'],
    contraindications: ['shoulder-acute', 'lower-back-acute'],
    energyRequired: 6, difficultyLevel: 3, duration: 180,
    perSide: false, sets: 4, reps: '6', rest: '60s', tempo: 'Explosive',
    instructions: [
      'Stand a couple of strides from a solid wall, holding the ball in both hands',
      'Take it overhead and slightly behind, letting your ribs stay down',
      'Throw it forward into the wall as hard as you comfortably can',
      'Catch or collect the rebound and reset properly before the next one',
      'Six throws, then rest a full minute'
    ],
    coaching: 'Reset fully between throws. This is a power exercise, and six good throws beat twenty tired ones by a wide margin.',
    why: 'Trains the whole body to produce force quickly, which is the quality that fades first with age and the one almost nobody trains directly.',
    watchOut: [
      'Arching the lower back to get the ball further behind you',
      'Standing so close there is no time to collect the rebound safely',
      'A ball heavy enough to slow the throw down, which stops it training power'
    ],
    load: 'Light. Speed is the training effect, and a heavy ball removes it.', credits: 50 },

  { id: 'medicine-ball-squat-press', name: 'Medicine Ball Squat to Press',
    youtube: 'medicine ball squat press technique',
    category: 'strength', movementPattern: 'squat',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['medicine-ball'], equipmentOptional: [],
    affectsAreas: ['quadriceps', 'glutes', 'shoulder', 'abdominals'],
    contraindications: ['knee-acute', 'shoulder-acute'],
    energyRequired: 6, difficultyLevel: 3, duration: 240,
    perSide: false, sets: 3, reps: '12', rest: '60s', tempo: '2-1-2',
    instructions: [
      'Stand with feet shoulder-width apart, holding the ball at your chest',
      'Squat down as far as is comfortable, keeping your chest up',
      'Drive up through your heels',
      'As you reach standing, press the ball straight overhead',
      'Bring it back to your chest and go straight into the next rep'
    ],
    coaching: 'Let the press flow out of the squat rather than pausing between the two. Done as one movement it becomes conditioning as well as strength.',
    why: 'Squat and press together is about as much of the body as one movement can reach, and it is the pattern behind lifting anything from the floor to a shelf.',
    watchOut: [
      'Pressing before you are fully upright, which loads the lower back',
      'Heels lifting at the bottom of the squat',
      'Ribs flaring as the ball goes overhead'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that the two halves stay one movement.', credits: 50 },

  { id: 'step-platform-lateral-step', name: 'Lateral Step-Over',
    youtube: 'lateral step over platform technique',
    category: 'cardio', movementPattern: 'lunge',
    position: 'standing', impact: false, balanceDemand: true,
    equipment: ['step-platform'], equipmentOptional: ['plyo-box'],
    affectsAreas: ['glutes', 'quadriceps', 'hip', 'ankle-foot'],
    contraindications: ['knee-acute', 'hip-acute'],
    energyRequired: 5, difficultyLevel: 2, duration: 240,
    perSide: false, sets: 3, reps: '45 seconds', rest: '45s',
    instructions: [
      'Stand side-on to a low step with it to your right',
      'Step your right foot up onto it, then bring the left up to meet it',
      'Step down the other side with the right foot, then the left',
      'Reverse direction and come back',
      'Keep moving steadily for forty-five seconds'
    ],
    coaching: 'Sideways is the point. Almost all everyday movement is forwards, so the muscles that move you sideways get very little use and are the ones that steady you.',
    why: 'Works the outside of the hips, which keep you level when you walk, while raising the heart rate with no impact at all.',
    watchOut: [
      'Only the front of the foot landing on the step',
      'Rushing until it becomes a hop',
      'Knee drifting inward as you step up'
    ],
    load: 'Bodyweight. A light weight held at the chest once the pattern is smooth.', credits: 45 }
);

// ══════════════════════════════════════════════════════════════════════
// EQUIPMENT COVERAGE (11 Aug 2026)
//
// The integrity audit found 24 equipment ids that a person could tick
// and that unlocked nothing at all. Ticking a pull-up bar changed
// precisely nothing about what the app offered.
//
// Several were resolved by mapping -- a balance pad, an indo board and a
// slackline all ask the ankle the same question, and writing three
// versions of "stand on something that moves" would be padding. These
// are the ones that genuinely needed their own content.
// ══════════════════════════════════════════════════════════════════════

GYM.push(
  { id: 'pull-up', name: 'Pull-Up',
    youtube: 'pull up technique progression beginners',
    category: 'strength', movementPattern: 'pull',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['pull-up-bar'], equipmentOptional: ['resistance-band'],
    affectsAreas: ['upper-back', 'shoulder', 'triceps-biceps', 'abdominals'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 7, difficultyLevel: 6, duration: 240,
    perSide: false, sets: 3, reps: '5', rest: '90s', tempo: '2-1-3',
    instructions: [
      'Take an overhand grip on the bar, hands a little wider than your shoulders',
      'Hang with your arms straight and your shoulders pulled down away from your ears',
      'Brace your stomach and squeeze your backside so your body stops swinging',
      'Pull until your chin clears the bar, leading with your elbows down towards your ribs',
      'Lower all the way to straight arms over three counts'
    ],
    coaching: 'Start by pulling your shoulder blades down before your arms bend at all. Almost everybody who struggles with pull-ups is skipping that first inch.',
    why: 'The clearest measure of upper-body strength relative to your own weight, and the one that transfers to almost everything you do with your arms.',
    watchOut: [
      'Swinging or kicking to generate momentum',
      'Stopping short of straight arms at the bottom, which quietly removes the hardest part',
      'Shrugging up towards the ears instead of pulling the blades down',
      'Any sharp shoulder pain: come down and use a band or the lat pulldown instead'
    ],
    load: 'Bodyweight. Loop a band under your feet to take some of it off, and use a lighter band as you get stronger.', credits: 60 },

  { id: 'hanging-knee-raise', name: 'Hanging Knee Raise',
    youtube: 'hanging knee raise core technique',
    category: 'strength', movementPattern: 'anti-extension',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['pull-up-bar'], equipmentOptional: [],
    affectsAreas: ['abdominals', 'core', 'hip-flexor', 'shoulder'],
    contraindications: ['shoulder-acute', 'lower-back-acute'],
    energyRequired: 6, difficultyLevel: 4, duration: 180,
    perSide: false, sets: 3, reps: '10', rest: '60s', tempo: '2-1-3',
    instructions: [
      'Hang from the bar with straight arms and your shoulders pulled down',
      'Let your legs settle so you are not swinging',
      'Draw both knees up towards your chest, curling your hips slightly under at the top',
      'Pause for a moment',
      'Lower slowly over three counts until your legs hang straight again'
    ],
    coaching: 'Curl the hips slightly under at the top rather than just lifting the knees. That is the difference between working your stomach and working your hip flexors.',
    why: 'Trains the front of the trunk while your whole body hangs, which also builds grip and shoulder stability at the same time.',
    watchOut: [
      'Swinging between reps rather than starting still',
      'Only lifting the knees without the hips curling, which makes it a hip flexor exercise',
      'Dropping the legs quickly at the end'
    ],
    load: 'Bodyweight. Progress by lowering more slowly before you consider straightening the legs.', credits: 50 },

  { id: 'dips-parallel-bars', name: 'Parallel Bar Dip',
    youtube: 'parallel bar dip technique progression',
    category: 'strength', movementPattern: 'push',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['dip-station'], equipmentOptional: ['resistance-band'],
    affectsAreas: ['chest-pecs', 'triceps-biceps', 'shoulder'],
    contraindications: ['shoulder-acute', 'chest-pecs-acute', 'wrist-elbow-acute'],
    energyRequired: 7, difficultyLevel: 6, duration: 240,
    perSide: false, sets: 3, reps: '6', rest: '90s', tempo: '3-1-2',
    instructions: [
      'Grip the bars and press up until your arms are straight, shoulders down',
      'Lean your chest forward very slightly and bend your knees behind you',
      'Lower yourself over three counts until your upper arms are roughly parallel to the floor',
      'Stop there rather than going as deep as you can',
      'Press back up without locking the elbows hard at the top'
    ],
    coaching: 'Depth is where dips go wrong. Upper arms parallel to the floor is plenty — going deeper puts the shoulder in a position it has no strength in.',
    why: 'One of the strongest upper-body pushing exercises there is, and it builds the chest, shoulders and triceps together.',
    watchOut: [
      'Going too deep, which is the most common cause of shoulder trouble from dips',
      'Shoulders rolling up towards the ears at the bottom',
      'Dropping fast rather than lowering under control',
      'Any pinching at the front of the shoulder: stop and use press-ups instead'
    ],
    load: 'Bodyweight. A band across the bars takes weight off; add weight only when six slow reps are comfortable.', credits: 60 },

  { id: 'stability-ball-hamstring-curl', name: 'Stability Ball Hamstring Curl',
    youtube: 'stability ball hamstring curl technique',
    category: 'strength', movementPattern: 'hinge',
    position: 'floor', impact: false, balanceDemand: false,
    equipment: ['stability-ball'], equipmentOptional: [],
    affectsAreas: ['hamstring', 'glutes', 'core'],
    contraindications: ['hamstring-acute', 'lower-back-acute'],
    energyRequired: 5, difficultyLevel: 4, duration: 180,
    perSide: false, sets: 3, reps: '10', rest: '60s', tempo: '2-1-3',
    instructions: [
      'Lie on your back with both heels on top of the ball, arms out to the sides for stability',
      'Lift your hips so your body makes a straight line from shoulders to heels',
      'Keeping the hips up, bend your knees and draw the ball in towards your backside',
      'Pause, then straighten your legs slowly over three counts',
      'Lower the hips only at the very end of the set'
    ],
    coaching: 'The hips staying up is the whole exercise. The moment they drop, the hamstrings have handed the job to the floor.',
    why: 'One of very few ways to work the hamstrings by bending the knee rather than hinging the hip, and it trains the glutes to hold position while they do it.',
    watchOut: [
      'Hips sagging as the ball comes in',
      'Cramping in the hamstring: point the toes towards your shins and slow down',
      'Ball rolling sideways, which usually means the arms are not helping enough'
    ],
    load: 'Bodyweight. Progress to one leg at a time long before adding anything.', credits: 50 },

  { id: 'stability-ball-deadbug', name: 'Stability Ball Dead Bug',
    youtube: 'stability ball dead bug core technique',
    category: 'strength', movementPattern: 'anti-extension',
    position: 'floor', impact: false, balanceDemand: false,
    equipment: ['stability-ball'], equipmentOptional: [],
    affectsAreas: ['abdominals', 'core'],
    contraindications: ['lower-back-acute'],
    energyRequired: 4, difficultyLevel: 3, duration: 180,
    perSide: true, sets: 3, reps: '8 each side', rest: '45s', tempo: '3-1-3',
    instructions: [
      'Lie on your back and hold the ball up between your hands and knees',
      'Press your hands into the ball and your knees into the ball at the same time',
      'Keeping that pressure, lower your opposite arm and leg slowly towards the floor',
      'Go only as far as your lower back stays flat on the mat',
      'Return and repeat on the other side'
    ],
    coaching: 'Keep pressing into the ball throughout. That pressure is what switches the deep stomach muscles on and makes the whole thing work.',
    why: 'Trains the middle to stay still while the arms and legs move, which is what it does all day and almost never gets asked to do deliberately.',
    watchOut: [
      'Lower back lifting off the floor — reduce the range until it stays down',
      'Losing the pressure into the ball as you reach',
      'Rushing, which lets momentum do the work'
    ],
    load: 'Bodyweight. Progress by reaching further while the back stays flat.', credits: 40 },

  { id: 'heavy-bag-rounds', name: 'Heavy Bag Rounds',
    youtube: 'heavy bag boxing rounds technique beginner',
    category: 'cardio', movementPattern: 'push',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['punching-bag'], equipmentOptional: [],
    affectsAreas: ['full-body', 'shoulder', 'abdominals', 'calves'],
    contraindications: ['shoulder-acute', 'wrist-elbow-acute'],
    energyRequired: 7, difficultyLevel: 4, duration: 600,
    perSide: false, sets: 4, reps: '2 minutes', rest: '60s',
    instructions: [
      'Wrap your hands and put gloves on before you touch the bag',
      'Stand a comfortable arm-length away, hands up by your chin',
      'Work for two minutes: jabs, crosses, and hooks, moving around the bag rather than standing square',
      'Rest a minute between rounds',
      'Four rounds, and keep the hands up even when you are tired'
    ],
    coaching: 'Turn your hips into each punch. Power comes from the ground up, and punching with the arm alone is both weaker and much harder on the shoulder.',
    why: 'Hard cardio that does not feel like cardio, and it works the whole body at once. It is also genuinely good for a bad mood, which is a legitimate reason to do it.',
    watchOut: [
      'Hitting the bag without wraps or gloves — wrists get hurt this way, easily',
      'Locking the elbow at full extension',
      'Standing flat and square rather than moving',
      'Hands dropping as you tire, which is when the shoulders start taking strain'
    ],
    load: 'Effort only. Aim for a pace you can hold for all four rounds.', credits: 70 },

  { id: 'sandbag-clean-press', name: 'Sandbag Clean and Press',
    youtube: 'sandbag clean and press technique',
    category: 'strength', movementPattern: 'hinge',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['sandbag'], equipmentOptional: [],
    affectsAreas: ['full-body', 'glutes', 'hamstring', 'shoulder', 'upper-back'],
    contraindications: ['lower-back-acute', 'shoulder-acute'],
    energyRequired: 8, difficultyLevel: 5, duration: 240,
    perSide: false, sets: 4, reps: '6', rest: '90s', tempo: '2-0-2',
    instructions: [
      'Stand over the bag with your feet hip-width apart',
      'Hinge at the hips with a flat back and take a firm grip of the bag',
      'Drive up through your legs and pull it to your chest in one movement',
      'Press it overhead, then bring it back to your chest',
      'Lower it to the floor under control rather than dropping it'
    ],
    coaching: 'A sandbag shifts as you lift it, and that is the point — it asks your whole body to stabilise something awkward, which is what real life mostly involves.',
    why: 'The closest thing in a gym to lifting something genuinely unwieldy. It builds strength that shows up when you move furniture or lift a child.',
    watchOut: [
      'Rounding the back to reach the bag — hinge, do not stoop',
      'Pressing before you are fully upright',
      'Dropping the bag from the chest rather than lowering it',
      'Going heavy before the movement is smooth; awkward loads punish rushing'
    ],
    load: 'Considerably lighter than a barbell for the same movement. A shifting load feels much heavier than it is.', credits: 65 },

  { id: 'landmine-press', name: 'Landmine Press',
    youtube: 'landmine press single arm technique',
    category: 'strength', movementPattern: 'push',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['landmine'], equipmentOptional: [],
    affectsAreas: ['shoulder', 'chest-pecs', 'abdominals', 'triceps-biceps'],
    contraindications: ['shoulder-acute', 'lower-back-acute'],
    energyRequired: 5, difficultyLevel: 3, duration: 240,
    perSide: true, sets: 3, reps: '10 each side', rest: '60s', tempo: '2-1-3',
    instructions: [
      'Set one end of a barbell in a landmine holder or wedged securely in a corner',
      'Stand facing it and hold the free end at shoulder height in one hand',
      'Brace your stomach and stand with feet hip-width apart',
      'Press the bar up and away at an angle until your arm is almost straight',
      'Lower slowly over three counts, then complete all reps before swapping'
    ],
    coaching: 'The angle is why this exists. Pressing up and forward rather than straight overhead lets people with cranky shoulders press at all.',
    why: 'Overhead pressing strength for anyone whose shoulders do not tolerate a straight overhead press. It also asks the trunk to resist being twisted the whole time.',
    watchOut: [
      'Leaning back to help the bar up',
      'Twisting the hips towards the pressing arm — they stay square',
      'Bar end not secured properly; check it before you load it'
    ],
    load: 'Heavy enough that the last two reps are hard, light enough that your hips stay square.', credits: 50 },

  { id: 'strap-hamstring-stretch', name: 'Strap Hamstring Stretch',
    youtube: 'strap hamstring stretch supine technique',
    category: 'recovery', movementPattern: 'stretch',
    position: 'floor', impact: false, balanceDemand: false,
    equipment: ['stretching-strap'], equipmentOptional: [],
    affectsAreas: ['hamstring', 'calves'],
    contraindications: ['hamstring-acute'],
    energyRequired: 1, difficultyLevel: 1, duration: 120,
    perSide: true, sets: 2, reps: '30 seconds each side', rest: '0s',
    instructions: [
      'Lie on your back with both knees bent and feet flat',
      'Loop a strap around the arch of one foot, holding an end in each hand',
      'Straighten that leg up towards the ceiling as far as is comfortable',
      'Draw gently on the strap until you feel a long pull down the back of the thigh',
      'Hold for thirty seconds, then swap sides'
    ],
    coaching: 'Let the strap do the holding so your shoulders can stay relaxed on the floor. Reaching up with your hands turns a stretch into a sit-up.',
    why: 'The strap lets you reach a proper hamstring stretch without curling your back to get there, which is why this version suits people that a seated forward fold does not.',
    watchOut: [
      'Pulling hard enough that the knee has to bend',
      'The other leg lifting off the floor — keep it flat or bent, but down',
      'Bouncing rather than holding steady'
    ],
    load: 'No weight. A strong pull, never a sharp one.', credits: 25 },

  { id: 'blocks-supported-forward-fold', name: 'Supported Forward Fold',
    youtube: 'yoga block supported forward fold',
    category: 'recovery', movementPattern: 'stretch',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['yoga-blocks'], equipmentOptional: [],
    affectsAreas: ['hamstring', 'lower-back', 'calves'],
    contraindications: ['lower-back-acute', 'hamstring-acute'],
    energyRequired: 1, difficultyLevel: 1, duration: 90,
    perSide: false, sets: 2, reps: '45 seconds', rest: '15s',
    instructions: [
      'Set two blocks on the floor about shoulder-width apart in front of you',
      'Stand with feet hip-width apart and a soft bend in both knees',
      'Hinge forward from the hips and rest both hands on the blocks',
      'Let your head and neck hang heavy',
      'Hold for forty-five seconds, breathing into your back'
    ],
    coaching: 'The blocks bring the floor up to you. That is not a compromise — it is what lets you keep a flat back, which is where the stretch actually is.',
    why: 'A forward fold with the back kept long rather than rounded. For most people that is a better hamstring stretch and a much kinder one on the lower back.',
    watchOut: [
      'Locking the knees straight',
      'Rounding the back to get lower — raise the blocks instead',
      'Coming up quickly at the end; roll up slowly'
    ],
    load: 'No weight.', credits: 25 },

  { id: 'ankle-weight-leg-raises', name: 'Weighted Side-Lying Leg Raise',
    youtube: 'side lying leg raise ankle weight',
    category: 'strength', movementPattern: 'hip-abduction',
    position: 'floor', impact: false, balanceDemand: false,
    equipment: ['ankle-weights'], equipmentOptional: [],
    affectsAreas: ['glutes', 'hip'],
    contraindications: ['hip-acute'],
    energyRequired: 4, difficultyLevel: 2, duration: 180,
    perSide: true, sets: 3, reps: '15 each side', rest: '45s', tempo: '2-1-3',
    instructions: [
      'Fasten the weights around your ankles and lie on your side, legs stacked',
      'Rest your head on your lower arm and place the top hand on the floor for stability',
      'Lift the top leg towards the ceiling, keeping the toes pointing forward',
      'Pause at the top',
      'Lower slowly over three counts, stopping just short of touching down'
    ],
    coaching: 'Toes pointing forward, not up. Rolling the leg open lets the hip flexor take over, and the muscle you are after stops working entirely.',
    why: 'The outside of the hip is what keeps you level on one leg. Ankle weights let you keep loading it once bodyweight has stopped being difficult.',
    watchOut: [
      'The top leg drifting forwards as it rises',
      'Toes rotating up towards the ceiling',
      'Rolling backwards at the hips — stay stacked'
    ],
    load: 'Light. Ankle weights feel small and add up quickly on a long lever.', credits: 40 },

  { id: 'weighted-vest-walk', name: 'Weighted Vest Walk',
    youtube: 'weighted vest walking rucking technique',
    category: 'cardio', movementPattern: 'locomotion',
    position: 'standing', impact: false, balanceDemand: false,
    equipment: ['weighted-vest'], equipmentOptional: [],
    affectsAreas: ['glutes', 'quadriceps', 'calves', 'upper-back', 'abdominals'],
    contraindications: ['lower-back-acute', 'knee-acute'],
    energyRequired: 6, difficultyLevel: 2, duration: 1800,
    perSide: false, sets: 1, reps: '30 minutes', rest: '0s',
    instructions: [
      'Fit the vest snugly so it does not bounce as you walk',
      'Start with a few minutes unloaded or at a very light setting',
      'Walk at a brisk but comfortable pace for around thirty minutes',
      'Stand tall — the temptation is to lean forward under the weight',
      'Take the vest off before you stop and stretch'
    ],
    coaching: 'Stand as tall as you would without it. If the vest is bending you forward it is too heavy, whatever the number on it says.',
    why: 'Adds real load to walking without adding impact. It builds leg and back endurance, and it is one of very few ways to make walking harder without making it faster.',
    watchOut: [
      'A vest heavy enough to change your posture',
      'Adding weight and distance in the same week',
      'Any lower back ache afterwards: reduce the weight rather than the walk'
    ],
    load: 'Start well under what feels necessary. Under ten percent of your bodyweight is plenty to begin.', credits: 65 }
);
