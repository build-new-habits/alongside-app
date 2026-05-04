/**
 * morning-programme.js - Six-Week Beach-Fit Morning Programme Data
 *
 * Three session slots per week:
 *   MON — home session (45 mins, 6:15-7:00am)
 *   WED — gym cardio session (60 mins, 6:30-7:30am)
 *   SAT — gym mid-morning session (45 mins)
 *
 * Each week object contains three sessions: mon, wed, sat.
 * Each session contains: id, slot, title, duration, location,
 *   coachLine, cardioBlock, upperBlock, coreBlock, cooldown.
 *
 * Cardio block is described rather than prescribed as exercises —
 * the coach presents options and the user selects based on pain routing.
 * Pain routing is handled in morning-session.js, not here.
 *
 * Exercise objects: { id, name, sets, reps, rest, duration, coachNote, guide }
 * guide: { description, cues, youtube }
 */

export const MORNING_PROGRAMME = {
  name: "Beach-Fit Morning Programme",
  totalWeeks: 6,
  weeks: [

    // ── WEEK 1 ────────────────────────────────────────────────────────────────
    {
      week: 1,
      phase: "Establish",
      phaseNote: "Build the habit. Caloric deficit plus 2.5L water daily does the visible work this week.",
      sessions: {

        mon: {
          id: "w1-mon",
          slot: "mon",
          title: "Monday — Home",
          duration: "45 mins",
          location: "home",
          coachLine: "First morning session. The goal this week is simply to show up and move. Everything else follows from that. Cardio first, upper body second, core to finish. The core block is non-negotiable — if time gets tight, shorten the cardio, not the core.",
          cardio: {
            duration: "20 mins",
            intensity: "Moderate — you should be able to speak in short sentences",
            options: {
              clear: ["Outdoor run — easy pace, conversational", "Step cardio circuit — 1 min step-ups, 1 min high knees, 1 min jumping jacks, repeat x4"],
              flare: ["Outdoor brisk walk — 30 mins at good pace"],
              fatigue: ["Mindful walk — 25 mins, gentle pace, notice your surroundings"]
            }
          },
          upper: [
            { id: "u1", name: "Dumbbell Floor Press", sets: 3, reps: "12", rest: "45s", coachNote: "Chest focus. Floor stops the shoulder going into a vulnerable range. Full extension, slow return.",
              guide: { description: "Lie on the floor, dumbbells at chest height, elbows at 45 degrees. Press straight up until arms are almost extended. Lower slowly until upper arms touch the floor.", cues: ["Elbows at 45 degrees — not flared wide", "Slow down — 3 counts on the way down", "Floor protects your shoulder at the bottom"], youtube: "dumbbell floor press technique" } },
            { id: "u2", name: "Seated Band Row", sets: 3, reps: "15", rest: "45s", coachNote: "Sit tall throughout. Pull to your lower ribs, squeeze your shoulder blades. Do not lean back to help the movement.",
              guide: { description: "Sit on the floor, legs extended, band looped around both feet. Hold one end in each hand. Pull to your lower chest by driving elbows back.", cues: ["Sit upright — torso stays still", "Lead with elbows, not hands", "Squeeze shoulder blades at the end of the pull"], youtube: "seated band row technique" } },
            { id: "u3", name: "Band Overhead Press", sets: 3, reps: "12", rest: "45s", coachNote: "Stand on the band, hold ends at shoulder height. Brace your core before every rep. Do not let your back arch.",
              guide: { description: "Stand on the middle of the band. Hold the ends at shoulder height, palms forward. Press both arms overhead until straight. Lower with control.", cues: ["Brace core before pressing", "Do not arch your lower back", "Resistance increases as you press — hardest at the top"], youtube: "band overhead press standing" } },
            { id: "u4", name: "Dumbbell Bicep Curl", sets: 3, reps: "12", rest: "30s", coachNote: "Elbows pinned to your sides throughout. Slow on the way down — 3 counts. If elbows swing forward, the weight is too heavy.",
              guide: { description: "Stand, dumbbell in each hand, palms forward. Curl both up to shoulder height. Squeeze at the top, lower slowly.", cues: ["Elbows stay against your sides", "3 counts on the way down", "No swinging — controlled throughout"], youtube: "dumbbell bicep curl proper form" } },
            { id: "u5", name: "Band Tricep Pushdown", sets: 3, reps: "15", rest: "30s", coachNote: "Anchor the band overhead. Elbows pinned to sides, only the forearms move. Full extension at the bottom.",
              guide: { description: "Anchor band at head height or above. Hold both ends, elbows bent at 90 degrees and pinned to your sides. Push both hands down to hips until arms straight. Control the return.", cues: ["Elbows do not move — only forearms", "Full extension every rep", "Slow return — the eccentric is where the work happens"], youtube: "band tricep pushdown technique" } }
          ],
          core: [
            { id: "c1", name: "Dead Bug", sets: 3, reps: "8 each side", rest: "30s", coachNote: "Lower back pressed to floor throughout. If your back arches, make the movement smaller. Quality over range.",
              guide: { description: "Lie on your back. Arms toward ceiling, knees at 90 degrees in the air. Slowly lower opposite arm and leg toward the floor simultaneously. Return and switch.", cues: ["Lower back on the floor — always", "Move slowly — this is not a cardio exercise", "Reduce range of motion if back lifts"], youtube: "dead bug exercise core stability" } },
            { id: "c2", name: "Forearm Plank", sets: 3, reps: "30s hold", rest: "30s", duration: 30, coachNote: "Straight line from head to heel. No hips rising or dropping. Breathe normally — do not hold your breath.",
              guide: { description: "Forearms on the floor, elbows under shoulders, toes on the floor. Body in a straight line. Hold.", cues: ["Squeeze glutes and quads", "Do not hold your breath", "Look at the floor — neutral neck"], youtube: "forearm plank proper form" } },
            { id: "c3", name: "Bear Hold", sets: 3, reps: "20s hold", rest: "30s", duration: 20, coachNote: "Hands under shoulders, knees 2cm off the floor. Spine neutral. Everything is still except your breathing.",
              guide: { description: "Start on hands and knees. Hover your knees 2cm off the ground. Hold this position. Only your breathing moves.", cues: ["Knees just off the floor — not high", "Neutral spine — no arch, no rounding", "The stillness is the exercise"], youtube: "bear hold exercise core" } },
            { id: "c4", name: "Glute Bridge Hold", sets: 3, reps: "45s hold", rest: "30s", duration: 45, coachNote: "Squeeze your glutes hard at the top. This is protecting your back and activating your posterior chain — both things you need.",
              guide: { description: "Lie on back, knees bent, feet flat. Press through heels to lift hips until body is a straight line. Hold and squeeze glutes.", cues: ["Squeeze glutes — not just lift", "Hips level — do not let one side drop", "Breathe normally throughout"], youtube: "glute bridge hold isometric" } }
          ],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch (kneeling)", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "Front foot forward, rear knee down. Shift weight forward until you feel the front of the rear hip. Squeeze the rear glute to deepen it." },
            { id: "cd2", name: "Chest Opener (band or arms)", sets: 1, reps: "45s hold", rest: "-", duration: 45, coachNote: "Clasp hands behind your back, lift your chest, squeeze your shoulder blades. Counteracts the forward posture of rowing movements." },
            { id: "cd3", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "Pure rest. Kneel, sit hips back, reach arms forward. Let your lower back release." }
          ]
        },

        wed: {
          id: "w1-wed",
          slot: "wed",
          title: "Wednesday — Gym Cardio",
          duration: "60 mins",
          location: "gym",
          coachLine: "Longer session today — you have 60 minutes. Cardio takes the bulk of it. Use a machine that lets you push without jarring the joints. Upper body is cable and machine work. Core to finish.",
          cardio: {
            duration: "30 mins",
            intensity: "Moderate — steady state, consistent effort",
            options: {
              clear: ["Treadmill — 5 min walk warm-up then run at 9-10km/h", "Cross trainer — level 12, steady state", "Rowing machine — 500m splits around 2:20"],
              flare: ["Uphill treadmill walk — 6% grade, 5.5km/h", "Bike — level 12 steady"],
              fatigue: ["Cross trainer — level 8, easy pace, 20 mins"]
            }
          },
          upper: [
            { id: "u1", name: "Cable Chest Press", sets: 3, reps: "12", rest: "45s", coachNote: "Mid-height cables. Full extension, slow return. Chest is doing the work — not momentum.",
              guide: { description: "Set cables at mid-chest height. Stand between the cables holding one in each hand. Press forward until arms are extended. Return slowly.", cues: ["Slight forward lean — one foot in front", "Full extension without locking elbows", "Slow return — 3 counts"], youtube: "cable chest press standing technique" } },
            { id: "u2", name: "Seated Cable Row", sets: 3, reps: "12", rest: "45s", coachNote: "Pull to lower chest. Squeeze your shoulder blades together for 1 second at the end. Slow return — do not let the weight drag your arms forward.",
              guide: { description: "Sit at the cable row. Feet on pads, knees slightly bent. Hold the handle and sit tall. Pull to lower chest, squeeze, return slowly.", cues: ["Sit tall — do not lean back to initiate", "Squeeze shoulder blades at the end", "3 second return"], youtube: "seated cable row proper form" } },
            { id: "u3", name: "Dumbbell Lateral Raise", sets: 3, reps: "15", rest: "30s", coachNote: "Light weight. Raise to shoulder height, no higher. Slight bend in elbows. Lead with elbows not hands.",
              guide: { description: "Stand, light dumbbells at sides. With elbows slightly bent, raise arms out to shoulder height. Lower slowly.", cues: ["Go lighter than you think", "Shoulder height only — no shrugging", "3 second lowering"], youtube: "dumbbell lateral raise technique" } },
            { id: "u4", name: "Tricep Rope Pushdown", sets: 3, reps: "15", rest: "30s", coachNote: "Rope splits at the bottom — let it. Full extension every rep. Elbows pinned.",
              guide: { description: "Set cable high with rope attachment. Hold rope, elbows pinned to sides. Push down until arms straight, rope splits. Control the return.", cues: ["Elbows do not move", "Rope splits at the bottom", "Full extension every rep"], youtube: "tricep rope pushdown cable" } },
            { id: "u5", name: "EZ Bar or Cable Curl", sets: 3, reps: "12", rest: "30s", coachNote: "Controlled. 3 second lower. No swinging or leaning back.",
              guide: { description: "Hold EZ bar underhand. Curl to shoulder height. Squeeze, lower slowly.", cues: ["Elbows stay still", "3 second lower", "No body swing"], youtube: "EZ bar curl technique" } }
          ],
          core: [
            { id: "c1", name: "Bird Dog", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Opposite arm and leg. Hips stay square — no twisting to reach further. The small controlled version beats the big wobbly version.",
              guide: { description: "On hands and knees, wrists under shoulders. Extend right arm and left leg simultaneously. Return. Switch.", cues: ["Hips stay level — do not rotate", "Move slowly and with intention", "Reach long, not high"], youtube: "bird dog exercise form" } },
            { id: "c2", name: "Full Plank", sets: 3, reps: "35s hold", rest: "30s", duration: 35, coachNote: "Hands under shoulders. Lock glutes and quads. Breathe.",
              guide: { description: "Hands under shoulders, body in straight line, toes on floor. Hold.", cues: ["Squeeze everything", "Do not hold your breath", "Neutral neck — look at the floor"], youtube: "full plank proper form" } },
            { id: "c3", name: "Pallof Press (cable)", sets: 3, reps: "12 each side", rest: "30s", coachNote: "Set cable at chest height. Stand side-on. Press straight out from your chest and resist the pull to rotate. The resistance is the exercise.",
              guide: { description: "Set cable at chest height. Stand side-on to the machine. Hold handle at chest with both hands. Press straight out, hold 2 seconds, return. Switch sides.", cues: ["Do not let your body rotate toward the machine", "Feet shoulder-width, stance strong", "Press and resist — both parts matter"], youtube: "pallof press anti rotation cable" } },
            { id: "c4", name: "Glute Bridge March", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Hold the bridge position. Lift alternate feet. Pelvis stays absolutely level — that is the whole challenge.",
              guide: { description: "Bridge position — hips lifted. Without letting the hips drop or rotate, lift one foot slightly off the floor. Lower and switch.", cues: ["Hips must stay level throughout", "Small movement is fine", "The pelvis staying still is harder than it looks"], youtube: "glute bridge march core stability" } }
          ],
          cooldown: [
            { id: "cd1", name: "Kneeling Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "Essential after treadmill or cross trainer. Shift weight forward, squeeze rear glute." },
            { id: "cd2", name: "Doorway Chest Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "Forearm on the frame at shoulder height. Step through until you feel it across the chest." },
            { id: "cd3", name: "Supine Hamstring Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "Lie on your back. Lift one leg and hold behind the thigh. Gentle only — no aggressive lengthening." }
          ]
        },

        sat: {
          id: "w1-sat",
          slot: "sat",
          title: "Saturday — Gym Morning",
          duration: "45 mins",
          location: "gym",
          coachLine: "Saturday session. If yoga follows later, keep cardio at moderate intensity — not max effort. Cardio first, always. Upper body is shorter today — four exercises, efficient. Core to finish.",
          cardio: {
            duration: "25 mins",
            intensity: "Moderate — if yoga follows, do not empty the tank",
            options: {
              clear: ["Stair climber — level 10, steady", "Bike — level 14 steady, 25 mins"],
              flare: ["Uphill treadmill walk — 6.5% grade, 5.5km/h", "Cross trainer — level 10 easy"],
              fatigue: ["Bike — level 8, easy spin, 20 mins"]
            }
          },
          upper: [
            { id: "u1", name: "Band Chest Press", sets: 3, reps: "15", rest: "45s", coachNote: "Anchor band behind at chest height. Constant tension — no slack at the top. Full extension.",
              guide: { description: "Anchor resistance band behind you at chest height. Hold one end in each hand, step forward to tension. Press both hands forward to full extension. Return slowly.", cues: ["Constant tension throughout", "Hardest at full extension — that is normal for bands", "Control the return"], youtube: "resistance band chest press" } },
            { id: "u2", name: "Band Row (heavy)", sets: 3, reps: "15", rest: "45s", coachNote: "Heavy band. Full range. Do not pull with your lower back.",
              guide: { description: "Band anchored at chest height in front. Step back to tension. Row both hands to lower chest. Squeeze, return.", cues: ["Stand or sit tall", "Full range — arms extended, then elbows back past body", "Do not lean back"], youtube: "resistance band row" } },
            { id: "u3", name: "Front Raise + Lateral Raise Superset", sets: 3, reps: "10 each", rest: "30s", coachNote: "Light dumbbells. Front raise then lateral raise without rest between. Shoulders will notice.",
              guide: { description: "Front raise: arms straight, raise to shoulder height forward. Without rest, lateral raise: raise out to sides to shoulder height.", cues: ["Light weight — form over load", "No shrugging", "Brief pause at shoulder height before lowering"], youtube: "front raise lateral raise superset" } },
            { id: "u4", name: "Band Bicep Curl", sets: 3, reps: "15", rest: "30s", coachNote: "Stand on the band. Same form rules as dumbbell curl — elbows stay put.",
              guide: { description: "Stand on middle of band, hold ends at sides. Curl both hands to shoulders. Lower slowly.", cues: ["Elbows pinned to sides", "Slow lowering", "Full extension at the bottom"], youtube: "resistance band bicep curl standing" } }
          ],
          core: [
            { id: "c1", name: "Dead Bug", sets: 2, reps: "8 each side", rest: "30s", coachNote: "Quality reps. Lower back on floor." },
            { id: "c2", name: "Pallof Press (band)", sets: 2, reps: "12 each side", rest: "30s", coachNote: "Band anchored at chest height. Press and hold 1 second." },
            { id: "c3", name: "Single-Leg Glute Bridge", sets: 2, reps: "12 each side", rest: "30s", coachNote: "Pelvis level throughout. Both sides, right side first.",
              guide: { description: "Standard glute bridge but extend one leg out. Press through the working heel. Keep pelvis level.", cues: ["Pelvis must stay level", "Right side first", "Controlled throughout"], youtube: "single leg glute bridge technique" } },
            { id: "c4", name: "Side Plank", sets: 2, reps: "25s each side", rest: "20s", duration: 25, coachNote: "Stack or stagger feet. Body in a straight line. No hip dropping.",
              guide: { description: "Lie on your side, forearm on the floor, elbow under shoulder. Lift hips so body is a straight line. Hold.", cues: ["Straight line from head to feet", "Do not let hips drop toward the floor", "Breathe normally"], youtube: "side plank proper form" } }
          ],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "Standard kneeling stretch. Always after cardio." },
            { id: "cd2", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "Let the lower back release. Breathe deeply." }
          ]
        }
      }
    },

    // ── WEEK 2 ────────────────────────────────────────────────────────────────
    {
      week: 2,
      phase: "Establish",
      phaseNote: "Holiday checkpoint at the end of this week. Routine established. Water intake doing its work. Same structure as Week 1, slightly increased focus on cardio pace.",
      sessions: {
        mon: {
          id: "w2-mon", slot: "mon", title: "Monday — Home", duration: "45 mins", location: "home",
          coachLine: "Second week. The habit is starting to form. Same structure as last week. Push the cardio slightly harder — aim for a pace that takes concentration to maintain.",
          cardio: { duration: "22 mins", intensity: "Moderate-high — pace should require concentration", options: { clear: ["Outdoor run — push the pace slightly from last week", "Plyo box step-ups circuit — 30s on, 15s rest, 6 rounds"], flare: ["Outdoor brisk walk — 35 mins, hilly route if possible"], fatigue: ["Mindful walk — 25 mins"] } },
          upper: [
            { id: "u1", name: "Dumbbell Floor Press", sets: 3, reps: "12", rest: "45s", coachNote: "Same weight or slightly heavier than Week 1 if the last 2 reps were comfortable." },
            { id: "u2", name: "Seated Band Row", sets: 3, reps: "15", rest: "45s", coachNote: "Increase band resistance one level if Week 1 felt easy." },
            { id: "u3", name: "Band Overhead Press", sets: 3, reps: "12", rest: "45s", coachNote: "Try heavier band or step further from anchor." },
            { id: "u4", name: "Hammer Curl", sets: 3, reps: "12", rest: "30s", coachNote: "Neutral grip — thumbs up. Hits the brachialis and adds upper arm thickness.",
              guide: { description: "Stand, dumbbells at sides, palms facing in (neutral grip). Curl to shoulder height keeping the neutral grip. Lower slowly.", cues: ["Neutral grip throughout — do not rotate", "Elbows stay still", "Same slow lowering as regular curl"], youtube: "hammer curl technique" } },
            { id: "u5", name: "Band Tricep Pushdown + Band Pull-Apart superset", sets: 3, reps: "15 each", rest: "30s", coachNote: "Pushdown then immediately pull the band apart at chest height. No rest between the two. Pull-apart works rear delts and mid-back." }
          ],
          core: [
            { id: "c1", name: "Dead Bug", sets: 3, reps: "8 each side", rest: "30s", coachNote: "Same as Week 1. Focus on quality." },
            { id: "c2", name: "Forearm Plank", sets: 3, reps: "35s hold", rest: "30s", duration: 35, coachNote: "5 more seconds than Week 1." },
            { id: "c3", name: "Bear Hold", sets: 3, reps: "25s hold", rest: "30s", duration: 25, coachNote: "5 more seconds than Week 1." },
            { id: "c4", name: "Single-Leg Glute Bridge", sets: 3, reps: "12 each side", rest: "30s", coachNote: "Replacing glute bridge hold. Pelvis level throughout." }
          ],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch (kneeling)", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Chest Opener", sets: 1, reps: "45s", rest: "-", duration: 45, coachNote: "" },
            { id: "cd3", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "" }
          ]
        },
        wed: {
          id: "w2-wed", slot: "wed", title: "Wednesday — Gym Cardio", duration: "60 mins", location: "gym",
          coachLine: "Introduce interval work today on the cardio. Warmup 5 minutes, then alternate harder and easier effort. Upper body and core same pattern as last week.",
          cardio: { duration: "30 mins", intensity: "Moderate with intervals", options: { clear: ["Treadmill intervals — 5 min walk, then 5 x (3 min at 10km/h, 1 min walk), 5 min cool-down", "Cross trainer — 5 min easy, alternate 2 min hard (level 16) / 1 min easy (level 10)"], flare: ["Bike — 30 mins steady, level 13"], fatigue: ["Cross trainer — level 8, easy 25 mins"] } },
          upper: [
            { id: "u1", name: "Cable Chest Press", sets: 3, reps: "12", rest: "45s", coachNote: "Slightly heavier cable than Week 1 if control was solid." },
            { id: "u2", name: "Seated Cable Row", sets: 3, reps: "12", rest: "45s", coachNote: "Add a 1-second squeeze at the end of each rep." },
            { id: "u3", name: "Dumbbell Lateral Raise", sets: 3, reps: "15", rest: "30s", coachNote: "Same weight. Focus on the 3 second lowering." },
            { id: "u4", name: "Tricep Rope Pushdown", sets: 3, reps: "15", rest: "30s", coachNote: "Add weight if last week felt easy." },
            { id: "u5", name: "EZ Bar Curl", sets: 3, reps: "12", rest: "30s", coachNote: "Controlled. 3 second lower." }
          ],
          core: [
            { id: "c1", name: "Bird Dog (slow)", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Hold extended position for 2 seconds each rep." },
            { id: "c2", name: "Full Plank", sets: 3, reps: "40s hold", rest: "30s", duration: 40, coachNote: "5 more seconds than Week 1." },
            { id: "c3", name: "Pallof Press (cable)", sets: 3, reps: "12 each side", rest: "30s", coachNote: "Same weight. Better form." },
            { id: "c4", name: "Glute Bridge March", sets: 3, reps: "12 each side", rest: "30s", coachNote: "Hips level. Pelvis does not drop or rotate." }
          ],
          cooldown: [
            { id: "cd1", name: "Kneeling Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Doorway Chest Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd3", name: "Supine Hamstring Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "Gentle only." }
          ]
        },
        sat: {
          id: "w2-sat", slot: "sat", title: "Saturday — Gym Morning", duration: "45 mins", location: "gym",
          coachLine: "Holiday is this week. This is the last session before you go. Make it count — but not at the expense of arriving injured. Moderate cardio, solid upper body, core to finish.",
          cardio: { duration: "25 mins", intensity: "Moderate", options: { clear: ["Stair climber — level 11", "Rowing machine — 5 x 3 min moderate effort with 1 min easy"], flare: ["Uphill treadmill walk — 7% grade", "Bike — level 14"], fatigue: ["Cross trainer — level 10, easy"] } },
          upper: [
            { id: "u1", name: "Band Chest Press", sets: 3, reps: "15", rest: "45s", coachNote: "Heavy band or step further from anchor." },
            { id: "u2", name: "Band Row (heavy)", sets: 3, reps: "15", rest: "45s", coachNote: "Full range, controlled." },
            { id: "u3", name: "Dumbbell Shoulder Press (seated)", sets: 3, reps: "12", rest: "45s", coachNote: "Replacing the superset today. Sit tall, press overhead, elbows slightly in front.",
              guide: { description: "Sit on a bench, dumbbells at shoulder height. Press overhead until arms straight. Lower with control.", cues: ["Do not arch lower back", "Elbows slightly in front of body", "3 second lower"], youtube: "dumbbell shoulder press seated" } },
            { id: "u4", name: "Band Bicep Curl", sets: 3, reps: "15", rest: "30s", coachNote: "Heavy band this week." }
          ],
          core: [
            { id: "c1", name: "Dead Bug", sets: 2, reps: "8 each side", rest: "30s", coachNote: "" },
            { id: "c2", name: "Pallof Press (band)", sets: 2, reps: "12 each side", rest: "30s", coachNote: "" },
            { id: "c3", name: "Single-Leg Glute Bridge", sets: 2, reps: "12 each side", rest: "30s", coachNote: "" },
            { id: "c4", name: "Side Plank", sets: 2, reps: "30s each side", rest: "20s", duration: 30, coachNote: "5 more seconds than Week 1." }
          ],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "" }
          ]
        }
      }
    },

    // ── WEEK 3 ────────────────────────────────────────────────────────────────
    {
      week: 3,
      phase: "Build",
      phaseNote: "Holiday is done. Habit is locked in. Intensity goes up — cardio longer or harder, upper body load increases, core gets more complex.",
      sessions: {
        mon: {
          id: "w3-mon", slot: "mon", title: "Monday — Home", duration: "45-50 mins", location: "home",
          coachLine: "You are back and the routine is yours. This week the cardio gets harder and the upper body load goes up. Push the pace on your run. The plyo box gets used this week for real.",
          cardio: { duration: "25 mins", intensity: "Moderate-high — you should need to concentrate", options: { clear: ["Outdoor run — push the pace, conversational speech should be difficult", "Plyo box circuit — step-ups, lateral overs, box jumps alternating, 30s on 10s rest x8 rounds"], flare: ["Hill walk — 40 mins, good brisk pace"], fatigue: ["Outdoor walk — 30 mins"] } },
          upper: [
            { id: "u1", name: "Dumbbell Floor Press (heavier)", sets: 4, reps: "10", rest: "60s", coachNote: "Add 2-4kg from Week 1-2. 4 sets this week. Last 2 reps should be genuinely challenging." },
            { id: "u2", name: "Seated Band Row (heavy band)", sets: 4, reps: "12", rest: "60s", coachNote: "Heaviest band. Maintain the upright torso — no leaning back to compensate." },
            { id: "u3", name: "Dumbbell Shoulder Press", sets: 3, reps: "12", rest: "45s", coachNote: "Standing or seated. Press overhead, elbows slightly in front of body.",
              guide: { description: "Dumbbells at shoulder height. Press overhead until arms straight. Lower with control.", cues: ["Core braced before every rep", "Do not arch back", "Controlled lowering"], youtube: "dumbbell overhead press" } },
            { id: "u4", name: "Hammer Curl", sets: 3, reps: "12", rest: "30s", coachNote: "Heavier than Week 2 if control was solid." },
            { id: "u5", name: "Tricep Pushdown + Pull-Apart superset", sets: 3, reps: "15 each", rest: "30s", coachNote: "Same superset as Week 2 but try to increase band tension on the pushdown." }
          ],
          core: [
            { id: "c1", name: "Dead Bug (slow — 5s lower)", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Add a 5-second count on lowering the arm and leg. Tempo makes this significantly harder than extra reps." },
            { id: "c2", name: "Plank to Push-Up", sets: 3, reps: "8", rest: "45s", coachNote: "Forearm plank, then push up to full plank one arm at a time, then back down. Keep hips level throughout.",
              guide: { description: "Start in forearm plank. Place one hand flat on the floor and press to full plank. Lower one arm back to forearm. Repeat alternating the leading arm.", cues: ["Hips stay level — no rocking", "Alternate which arm leads", "Controlled throughout"], youtube: "plank to push up exercise" } },
            { id: "c3", name: "Side Plank", sets: 3, reps: "30s each side", rest: "30s", duration: 30, coachNote: "First time in the Monday session. Stack or stagger feet." },
            { id: "c4", name: "Pallof Press (band)", sets: 3, reps: "12 each side", rest: "30s", coachNote: "First time at home. Anchor band at chest height in a doorframe or around something solid." },
            { id: "c5", name: "Single-Leg Glute Bridge", sets: 3, reps: "12 each side", rest: "30s", coachNote: "Pelvis level. Right side first." }
          ],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch (kneeling)", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Chest Opener", sets: 1, reps: "45s", rest: "-", duration: 45, coachNote: "" },
            { id: "cd3", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "" }
          ]
        },
        wed: {
          id: "w3-wed", slot: "wed", title: "Wednesday — Gym Cardio", duration: "60 mins", location: "gym",
          coachLine: "Intervals get harder this week. The main cardio block has a structure — warm up, push, recover, repeat. Upper body adds a set and the incline press comes in.",
          cardio: { duration: "35 mins", intensity: "Interval work — push the hard portions", options: { clear: ["Treadmill intervals — 5 min walk, 6 x (3 min at 10-11km/h, 1.5 min walk), 5 min cool-down walk", "Cross trainer — 5 min easy, then level 16 for 2 min, level 10 for 1 min, repeat x8"], flare: ["Stair climber — 35 mins level 10", "Bike — 35 mins level 14"], fatigue: ["Cross trainer — level 8, 25 mins easy"] } },
          upper: [
            { id: "u1", name: "Incline Dumbbell Press", sets: 4, reps: "10", rest: "60s", coachNote: "Bench at 30-45 degrees. Full range. Upper chest and shoulder emphasis.",
              guide: { description: "Set bench to 30-45 degrees. Dumbbells at shoulder height, elbows at 45 degrees. Press up and slightly together. Lower slowly.", cues: ["Elbows at 45 degrees — not flared", "Full range — touch chest level", "3 second lower"], youtube: "incline dumbbell press technique" } },
            { id: "u2", name: "Cable Lat Pulldown", sets: 4, reps: "10", rest: "60s", coachNote: "Wide grip. Pull to upper chest. Squeeze the lats at the bottom. Do not pull behind the neck.",
              guide: { description: "Sit at the pulldown machine. Take wide grip. Pull the bar to your upper chest by driving elbows down and back. Return slowly.", cues: ["Lean back 10-15 degrees only", "Drive elbows down toward hips", "Control the return"], youtube: "lat pulldown wide grip form" } },
            { id: "u3", name: "Dumbbell Arnold Press", sets: 3, reps: "10", rest: "45s", coachNote: "Start with palms facing you, rotate to palms forward as you press. Hits all three shoulder heads.",
              guide: { description: "Sit with dumbbells at shoulder height, palms facing you. As you press up, rotate palms outward. At the top, palms face forward. Reverse on the way down.", cues: ["Smooth rotation throughout the press", "Do not rush the rotation", "Control the lowering and rotation"], youtube: "arnold press dumbbell shoulder" } },
            { id: "u4", name: "Cable Curl + Tricep Pushdown superset", sets: 3, reps: "12 each", rest: "45s", coachNote: "Curl first, then immediately move to pushdown. No rest between the two. Arms work opposite functions." }
          ],
          core: [
            { id: "c1", name: "Bird Dog (3s hold)", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Hold extended position for 3 seconds. Deliberate and slow." },
            { id: "c2", name: "Plank Shoulder Tap", sets: 3, reps: "10 each side", rest: "45s", coachNote: "Full plank. Tap opposite shoulder. No hip rocking — that is the whole challenge.",
              guide: { description: "Full plank position. Lift one hand and tap the opposite shoulder. Replace, then switch. Hips must not rock.", cues: ["Wider stance makes it easier if needed", "Slow tap and replace", "The rotation resistance is the exercise"], youtube: "plank shoulder tap core" } },
            { id: "c3", name: "Pallof Press (heavier)", sets: 3, reps: "12 each side", rest: "30s", coachNote: "Step back from the anchor to increase resistance." },
            { id: "c4", name: "Side Plank (feet stacked)", sets: 3, reps: "30s each side", rest: "30s", duration: 30, coachNote: "Feet stacked, body in a straight line. Do not let hips sag." }
          ],
          cooldown: [
            { id: "cd1", name: "Kneeling Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Doorway Chest Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd3", name: "Supine Hamstring Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "Gentle only." }
          ]
        },
        sat: {
          id: "w3-sat", slot: "sat", title: "Saturday — Gym Morning", duration: "45 mins", location: "gym",
          coachLine: "Saturday superset format this week. Upper body and core are combined into paired movements with no rest between each pair. More efficient and more demanding.",
          cardio: { duration: "25-30 mins", intensity: "Moderate-hard", options: { clear: ["Stair climber — 30 mins at pace", "Rowing — 2000m time trial then 10 mins easy", "Bike tabata — 8 rounds 20s all-out, 10s easy then 15 mins steady"], flare: ["Uphill treadmill walk — 7% grade", "Cross trainer — level 12"], fatigue: ["Bike — level 8, easy 20 mins"] } },
          upper: [
            { id: "u1", name: "Push-Up + Dead Bug superset", sets: 3, reps: "10 push-ups, 8/side dead bugs", rest: "45s", coachNote: "Push-ups first, then immediately to the floor for dead bugs. No rest between the pair." },
            { id: "u2", name: "Band Row + Pallof Press superset", sets: 3, reps: "12 row, 10/side pallof", rest: "45s", coachNote: "Row first, then step sideways for pallof. Back and anti-rotation in one combined block." },
            { id: "u3", name: "Shoulder Press + Side Plank superset", sets: 3, reps: "10 press, 30s plank/side", rest: "45s", coachNote: "Shoulder press then immediately to the floor for side plank. Each side." }
          ],
          core: [
            { id: "c1", name: "Hollow Body Hold", sets: 3, reps: "20s hold", rest: "30s", duration: 20, coachNote: "New exercise this week. Lower back flat on floor. Legs and shoulders lifted. The full anti-extension challenge.",
              guide: { description: "Lie on your back. Press your lower back into the floor. Lift your legs and shoulders off the floor. Hold this position. Lower back stays flat throughout.", cues: ["Lower back stays on the floor — always", "Arms can be by your sides or extended overhead", "If lower back lifts, bend your knees more"], youtube: "hollow body hold core" } }
          ],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "" }
          ]
        }
      }
    },

    // ── WEEK 4 ────────────────────────────────────────────────────────────────
    {
      week: 4,
      phase: "Build",
      phaseNote: "Consolidate the Week 3 progressions. Same patterns, more load. Cardio intervals push harder.",
      sessions: {
        mon: {
          id: "w4-mon", slot: "mon", title: "Monday — Home", duration: "45-50 mins", location: "home",
          coachLine: "Same structure as Week 3 but the weights go up and the cardio gets longer. If you can run 25 minutes continuously this week, that is progress you can feel.",
          cardio: { duration: "27 mins", intensity: "Push — sustained effort", options: { clear: ["Outdoor run — 25-27 mins, push the pace from Week 3", "Plyo box HIIT — 8 rounds 30s on, 10s rest, harder options (box jumps if glutes clear)"], flare: ["Hill walk — 45 mins"], fatigue: ["Outdoor walk — 30 mins"] } },
          upper: [
            { id: "u1", name: "Dumbbell Floor Press", sets: 4, reps: "10", rest: "60s", coachNote: "Heaviest weight that allows full control." },
            { id: "u2", name: "Dumbbell Renegade Row", sets: 3, reps: "8 each side", rest: "60s", coachNote: "Plank position, dumbbells under shoulders. Row one dumbbell keeping hips square. Core and back together.",
              guide: { description: "Full plank with dumbbells under hands. Row one dumbbell to hip while keeping the other hand and both feet on the floor. Hips stay square.", cues: ["Hips absolutely square — do not rotate", "Plant the supporting hand hard into the floor", "Start lighter than you think"], youtube: "renegade row dumbbell technique" } },
            { id: "u3", name: "Dumbbell Arnold Press", sets: 3, reps: "10", rest: "45s", coachNote: "Heavier than Week 3 if control was solid." },
            { id: "u4", name: "Hammer Curl + Overhead Tricep Extension superset", sets: 3, reps: "12 each", rest: "45s", coachNote: "Curl then immediately overhead extension. Arms work opposite functions — efficient.",
              guide: { description: "Hammer curl: neutral grip dumbbell curl. Then: hold one dumbbell with both hands overhead, lower behind head, extend back up.", cues: ["No rest between the two exercises", "Control both movements", "Same dumbbell if possible"], youtube: "overhead tricep extension dumbbell" } },
            { id: "u5", name: "Band Face Pull", sets: 3, reps: "15", rest: "30s", coachNote: "Anchor band at face height. Pull to ears, elbows high. Rear delt and rotator cuff work — important for shoulder health.",
              guide: { description: "Band anchored at face height. Hold with both hands. Pull hands to ears, elbows high and wide. Return slowly.", cues: ["Elbows high — above the hands at the end", "Squeeze at the top", "Light resistance — this is shoulder health work not strength"], youtube: "face pull band technique" } }
          ],
          core: [
            { id: "c1", name: "Dead Bug (5s lower)", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Same as Week 3. Perfect form beats more reps." },
            { id: "c2", name: "Plank to Push-Up", sets: 3, reps: "10", rest: "45s", coachNote: "2 more than Week 3." },
            { id: "c3", name: "Side Plank", sets: 3, reps: "35s each side", rest: "30s", duration: 35, coachNote: "5 more seconds." },
            { id: "c4", name: "Pallof Press (band)", sets: 3, reps: "12 each side", rest: "30s", coachNote: "Heavier band." },
            { id: "c5", name: "Hollow Body Hold", sets: 2, reps: "20s", rest: "30s", duration: 20, coachNote: "First time in Monday session." }
          ],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch (kneeling)", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Chest Opener", sets: 1, reps: "45s", rest: "-", duration: 45, coachNote: "" },
            { id: "cd3", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "" }
          ]
        },
        wed: {
          id: "w4-wed", slot: "wed", title: "Wednesday — Gym Cardio", duration: "60 mins", location: "gym",
          coachLine: "Interval pace goes up this week. The hard portions should feel genuinely hard. Upper body adds load across the board.",
          cardio: { duration: "35 mins", intensity: "Hard intervals", options: { clear: ["Treadmill — 5 min walk, 6 x (3 min at 11km/h, 1.5 min walk), 5 min cool-down", "Cross trainer — 5 min easy, level 18 for 2 min, level 10 for 1 min, repeat x8"], flare: ["Stair climber — 35 mins level 12", "Bike — level 16 steady"], fatigue: ["Cross trainer — level 9, 25 mins"] } },
          upper: [
            { id: "u1", name: "Incline Dumbbell Press", sets: 4, reps: "10", rest: "60s", coachNote: "Heavier than Week 3. Last 2 reps should be hard." },
            { id: "u2", name: "Cable Lat Pulldown", sets: 4, reps: "10", rest: "60s", coachNote: "Increase the stack." },
            { id: "u3", name: "Dumbbell Arnold Press", sets: 3, reps: "10", rest: "45s", coachNote: "Heavier." },
            { id: "u4", name: "Cable Curl + Tricep Pushdown superset", sets: 3, reps: "12 each", rest: "45s", coachNote: "Heavier on both." }
          ],
          core: [
            { id: "c1", name: "Bird Dog (3s hold)", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Same. Consistent quality." },
            { id: "c2", name: "Plank Shoulder Tap (slow)", sets: 3, reps: "10 each side", rest: "45s", coachNote: "2 more than Week 3." },
            { id: "c3", name: "Pallof Press (heavier)", sets: 3, reps: "12 each side", rest: "30s", coachNote: "Heavier than Week 3." },
            { id: "c4", name: "Side Plank (feet stacked)", sets: 3, reps: "35s each side", rest: "30s", duration: 35, coachNote: "5 more seconds." }
          ],
          cooldown: [
            { id: "cd1", name: "Kneeling Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Doorway Chest Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd3", name: "Supine Hamstring Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" }
          ]
        },
        sat: {
          id: "w4-sat", slot: "sat", title: "Saturday — Gym Morning", duration: "45 mins", location: "gym",
          coachLine: "Superset format again but longer holds and more load. The hollow body hold gets harder this week.",
          cardio: { duration: "25-30 mins", intensity: "Hard", options: { clear: ["Stair climber — 30 mins, level 12", "Rowing — 10 x 250m with 30s rest", "Bike tabata — harder output each round"], flare: ["Uphill treadmill walk — 8% grade", "Cross trainer — level 14"], fatigue: ["Bike — level 10, 20 mins"] } },
          upper: [
            { id: "u1", name: "Push-Up (full, to failure) + Dead Bug superset", sets: 3, reps: "Max push-ups, 10/side dead bugs", rest: "60s", coachNote: "Go to 2 reps shy of failure on push-ups. Then immediately to dead bugs." },
            { id: "u2", name: "Dumbbell Row + Pallof Press superset", sets: 3, reps: "10/side row, 12/side pallof", rest: "45s", coachNote: "Single-arm dumbbell row in plank, then pallof press." },
            { id: "u3", name: "Arnold Press + Side Plank superset", sets: 3, reps: "10 press, 35s plank/side", rest: "45s", coachNote: "Press then plank each side." }
          ],
          core: [
            { id: "c1", name: "Hollow Body Hold", sets: 3, reps: "25s", rest: "30s", duration: 25, coachNote: "5 more seconds than Week 3." }
          ],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "" }
          ]
        }
      }
    },

    // ── WEEK 5 ────────────────────────────────────────────────────────────────
    {
      week: 5,
      phase: "Challenge",
      phaseNote: "Maximum useful intensity. Runs are longer. Upper body at heaviest weights of the programme. Core progressions peak this week.",
      sessions: {
        mon: {
          id: "w5-mon", slot: "mon", title: "Monday — Home", duration: "50-55 mins", location: "home",
          coachLine: "This is the hardest week of the programme. Cardio for 30 minutes. Weights are heavy. Core is demanding. You have earned this.",
          cardio: { duration: "30 mins", intensity: "Hard — sustained effort for 30 minutes", options: { clear: ["Outdoor run — 30 mins continuous at a pace that challenges without destroying", "Plyo box HIIT — 25 mins 30s on 15s rest, alternating box jumps, step-overs, lateral hops, then 5 min walk"], flare: ["Hill walk — 45 mins brisk"], fatigue: ["Outdoor run — 20 mins easy"] } },
          upper: [
            { id: "u1", name: "Push-Up (box or full)", sets: 4, reps: "Max reps", rest: "60s", coachNote: "To 2 reps shy of failure. Box elevated = easier. Full = harder. Choose based on today." },
            { id: "u2", name: "Dumbbell Renegade Row", sets: 3, reps: "8 each side", rest: "60s", coachNote: "Heavier than Week 4. Hips absolutely square." },
            { id: "u3", name: "Dumbbell Arnold Press", sets: 3, reps: "10", rest: "45s", coachNote: "Heaviest yet. Controlled rotation." },
            { id: "u4", name: "Hammer Curl + Overhead Tricep Extension superset", sets: 3, reps: "12 each", rest: "45s", coachNote: "Heavier on both." },
            { id: "u5", name: "Band Face Pull", sets: 3, reps: "15", rest: "30s", coachNote: "Keep resistance light. This is shoulder health, not a strength test." }
          ],
          core: [
            { id: "c1", name: "Dead Bug + Light Dumbbell (2-4kg in extended hand)", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Hold a light dumbbell in the extending hand. Keeps the anti-extension demand high. Do not add weight if form suffers." },
            { id: "c2", name: "Plank Shoulder Tap", sets: 3, reps: "10 each side", rest: "45s", coachNote: "Slow — 2 seconds on shoulder each tap." },
            { id: "c3", name: "Side Plank with Reach", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Side plank position. Thread top arm underneath your body and back. Adds rotation demand.",
              guide: { description: "Side plank. Take your top arm and thread it under your body, rotating your torso. Return to side plank. Repeat.", cues: ["Hips stay lifted throughout", "The thread is slow and controlled", "This is harder than it looks"], youtube: "side plank thread needle" } },
            { id: "c4", name: "Pallof Press + Hold (3s extended)", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Press out and hold for 3 seconds before returning. Hardest version of the pallof in this programme." },
            { id: "c5", name: "Hollow Body Hold", sets: 3, reps: "25s", rest: "30s", duration: 25, coachNote: "Extended arms makes it harder. Try it if last week was manageable." }
          ],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch (kneeling)", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Chest Opener", sets: 1, reps: "45s", rest: "-", duration: 45, coachNote: "" },
            { id: "cd3", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "" }
          ]
        },
        wed: {
          id: "w5-wed", slot: "wed", title: "Wednesday — Gym Cardio", duration: "60 mins", location: "gym",
          coachLine: "Hardest interval session of the programme. The 4-minute blocks should feel genuinely difficult. Heaviest upper body weights. Core at peak.",
          cardio: { duration: "35-40 mins", intensity: "Hard intervals — 4 minute working blocks", options: { clear: ["Treadmill — 5 min warm-up, 5 x (4 min at 11km/h, 1 min walk), 5 min cool-down", "Stair climber — 40 mins at highest comfortable level"], flare: ["Bike — 40 mins level 16", "Cross trainer — level 14 steady 35 mins"], fatigue: ["Cross trainer — level 9, 25 mins"] } },
          upper: [
            { id: "u1", name: "Dumbbell Bench Press (with bench)", sets: 4, reps: "8", rest: "75s", coachNote: "Heaviest upper body lift of the programme. Use the bench this week. Full range, controlled negative.",
              guide: { description: "Lie on flat bench, dumbbells at chest height, elbows at 45 degrees. Press to full extension. Lower slowly to chest.", cues: ["Feet flat on floor", "Elbows at 45 degrees", "4 second lower"], youtube: "dumbbell bench press proper form" } },
            { id: "u2", name: "Seated Cable Row (heavy)", sets: 4, reps: "8", rest: "75s", coachNote: "Heaviest row of the programme. Increase the stack. Hold 1 second at the end of each rep." },
            { id: "u3", name: "Dumbbell Shoulder Press (standing)", sets: 3, reps: "10", rest: "60s", coachNote: "Standing adds core demand. Brace before every rep. Do not lean back." },
            { id: "u4", name: "Tricep Dips (bench) + Cable Curl superset", sets: 3, reps: "10 each", rest: "45s", coachNote: "Bodyweight dips off a bench then straight to cable curls. Arms finish the session.",
              guide: { description: "Hands on bench behind you, feet forward. Lower until elbows at 90 degrees. Press back up.", cues: ["Keep your back close to the bench", "Lower slowly", "Controlled press back up"], youtube: "tricep dip bench bodyweight" } }
          ],
          core: [
            { id: "c1", name: "Bird Dog + Light Dumbbell", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Hold 2kg in extending hand. Anti-extension added to anti-rotation." },
            { id: "c2", name: "Plank Shoulder Tap (3s hold)", sets: 3, reps: "8 each side", rest: "45s", coachNote: "Pause with hand on shoulder for 3 seconds. Maximum rotation resistance." },
            { id: "c3", name: "Pallof Press + Hold 3s", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Same as Monday. Press and hold 3 seconds." },
            { id: "c4", name: "Hollow Body Hold", sets: 3, reps: "25s", rest: "30s", duration: 25, coachNote: "Arms extended overhead if able." }
          ],
          cooldown: [
            { id: "cd1", name: "Kneeling Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Doorway Chest Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd3", name: "Supine Hamstring Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" }
          ]
        },
        sat: {
          id: "w5-sat", slot: "sat", title: "Saturday — Gym Morning", duration: "45 mins", location: "gym",
          coachLine: "Circuit format. Three rounds of four exercises, 90 seconds between rounds. The hardest Saturday of the programme.",
          cardio: { duration: "25 mins", intensity: "Hard", options: { clear: ["Rowing — 10 x 250m, 30s rest between each", "Stair climber — 25 mins highest comfortable level"], flare: ["Uphill treadmill walk — 8% grade, 5.5km/h"], fatigue: ["Bike — level 10, 20 mins"] } },
          upper: [
            { id: "u1", name: "Circuit — 3 rounds, 90s between rounds", sets: 3, reps: "See each exercise", rest: "90s between rounds", coachNote: "Complete all four exercises back to back, then rest 90 seconds. Repeat 3 times total." },
            { id: "u2", name: "Push-Up to failure", sets: 0, reps: "Max reps", rest: "Into next", coachNote: "Full range, controlled. Stop 2 reps before collapse." },
            { id: "u3", name: "Dumbbell Renegade Row", sets: 0, reps: "8 each side", rest: "Into next", coachNote: "Plank position. One arm rows." },
            { id: "u4", name: "Arnold Press", sets: 0, reps: "10 reps", rest: "Into next", coachNote: "Slow and controlled. Full rotation." },
            { id: "u5", name: "Hollow Body Hold", sets: 0, reps: "30s", rest: "90s then repeat circuit", duration: 30, coachNote: "Hard finish. Core does everything. Breathe." }
          ],
          core: [],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "" }
          ]
        }
      }
    },

    // ── WEEK 6 ────────────────────────────────────────────────────────────────
    {
      week: 6,
      phase: "Challenge",
      phaseNote: "Six weeks in. This is what beach fit becoming summer fit looks like. Same peak intensity as Week 5 with small further progressions where possible.",
      sessions: {
        mon: {
          id: "w6-mon", slot: "mon", title: "Monday — Home", duration: "50-55 mins", location: "home",
          coachLine: "Final week of the programme. Same structure as Week 5. If you can push the run further than 30 minutes, do it. The core work should feel significantly easier than it did in Week 1 — that is what six weeks of consistency produces.",
          cardio: { duration: "30-35 mins", intensity: "Hard and sustained", options: { clear: ["Outdoor run — 30-35 mins, push pace", "Plyo box HIIT — 30 mins, no rest between rounds"], flare: ["Hill walk — 50 mins"], fatigue: ["Run — 20 mins easy"] } },
          upper: [
            { id: "u1", name: "Push-Up (full)", sets: 4, reps: "Max reps", rest: "60s", coachNote: "Full push-ups only this week. Max reps to 2 shy of failure." },
            { id: "u2", name: "Dumbbell Renegade Row", sets: 4, reps: "8 each side", rest: "60s", coachNote: "4 sets this week. Heaviest weight that allows square hips." },
            { id: "u3", name: "Dumbbell Arnold Press", sets: 3, reps: "10", rest: "45s", coachNote: "Heaviest weight of the programme." },
            { id: "u4", name: "Hammer Curl + Overhead Tricep Extension superset", sets: 3, reps: "12 each", rest: "45s", coachNote: "Heaviest superset of the programme." },
            { id: "u5", name: "Band Face Pull", sets: 3, reps: "15", rest: "30s", coachNote: "Shoulder health. Light band." }
          ],
          core: [
            { id: "c1", name: "Dead Bug + Dumbbell", sets: 3, reps: "10 each side", rest: "30s", coachNote: "4kg if 2kg was manageable last week." },
            { id: "c2", name: "Plank Shoulder Tap", sets: 3, reps: "12 each side", rest: "45s", coachNote: "2 more than Week 5." },
            { id: "c3", name: "Side Plank with Reach", sets: 3, reps: "12 each side", rest: "30s", coachNote: "More controlled than Week 5." },
            { id: "c4", name: "Pallof Press + Hold 3s", sets: 3, reps: "12 each side", rest: "30s", coachNote: "2 more reps than Week 5." },
            { id: "c5", name: "Hollow Body Hold", sets: 3, reps: "30s", rest: "30s", duration: 30, coachNote: "5 more seconds. Arms overhead." }
          ],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch (kneeling)", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Chest Opener", sets: 1, reps: "45s", rest: "-", duration: 45, coachNote: "" },
            { id: "cd3", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "" }
          ]
        },
        wed: {
          id: "w6-wed", slot: "wed", title: "Wednesday — Gym Cardio", duration: "60 mins", location: "gym",
          coachLine: "Final Wednesday. Push the intervals as hard as Week 5 or harder. Heaviest weights of the entire programme on the upper body work.",
          cardio: { duration: "40 mins", intensity: "Peak intensity", options: { clear: ["Treadmill — 5 min warm-up, 5 x (4 min at 11-12km/h, 1 min walk), 5 min cool-down", "Stair climber — 40 mins at max comfortable level"], flare: ["Bike — 40 mins level 18", "Cross trainer — level 16 steady 35 mins"], fatigue: ["Cross trainer — level 10, 25 mins"] } },
          upper: [
            { id: "u1", name: "Dumbbell Bench Press", sets: 4, reps: "8", rest: "75s", coachNote: "Heaviest set of the programme." },
            { id: "u2", name: "Seated Cable Row (heavy)", sets: 4, reps: "8", rest: "75s", coachNote: "Personal best weight if possible." },
            { id: "u3", name: "Dumbbell Shoulder Press (standing)", sets: 3, reps: "10", rest: "60s", coachNote: "Standing, heavy, braced." },
            { id: "u4", name: "Tricep Dips + Cable Curl superset", sets: 3, reps: "10 each", rest: "45s", coachNote: "Final time. Make it count." }
          ],
          core: [
            { id: "c1", name: "Bird Dog + Dumbbell", sets: 3, reps: "10 each side", rest: "30s", coachNote: "Final progression." },
            { id: "c2", name: "Plank Shoulder Tap (3s hold)", sets: 3, reps: "10 each side", rest: "45s", coachNote: "Same as Week 5. Consistent quality." },
            { id: "c3", name: "Pallof Press + Hold 3s", sets: 3, reps: "12 each side", rest: "30s", coachNote: "2 more reps than Week 5." },
            { id: "c4", name: "Hollow Body Hold", sets: 3, reps: "30s", rest: "30s", duration: 30, coachNote: "Final hold. Arms overhead." }
          ],
          cooldown: [
            { id: "cd1", name: "Kneeling Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Doorway Chest Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd3", name: "Supine Hamstring Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" }
          ]
        },
        sat: {
          id: "w6-sat", slot: "sat", title: "Saturday — Gym Morning", duration: "45 mins", location: "gym",
          coachLine: "Final morning session. Same circuit as Week 5. Push every set harder than you did that day. You have earned this.",
          cardio: { duration: "25 mins", intensity: "Hard — final morning cardio", options: { clear: ["Rowing — 10 x 250m, try to beat Week 5 splits", "Stair climber — 25 mins, one level higher than Week 5"], flare: ["Uphill treadmill walk — 8% grade"], fatigue: ["Bike — level 12, 20 mins"] } },
          upper: [
            { id: "u1", name: "Circuit — 3 rounds, 90s between rounds", sets: 3, reps: "See each exercise", rest: "90s between rounds", coachNote: "Final circuit. Push harder than Week 5." },
            { id: "u2", name: "Push-Up to failure", sets: 0, reps: "Max reps", rest: "Into next", coachNote: "Beat your Week 5 number." },
            { id: "u3", name: "Dumbbell Renegade Row", sets: 0, reps: "8 each side", rest: "Into next", coachNote: "Heavier if possible." },
            { id: "u4", name: "Arnold Press", sets: 0, reps: "10 reps", rest: "Into next", coachNote: "Heaviest yet." },
            { id: "u5", name: "Hollow Body Hold", sets: 0, reps: "30s", rest: "90s then repeat", duration: 30, coachNote: "Arms overhead. Final hold of the programme." }
          ],
          core: [],
          cooldown: [
            { id: "cd1", name: "Hip Flexor Stretch", sets: 1, reps: "45s each side", rest: "-", duration: 45, coachNote: "" },
            { id: "cd2", name: "Child's Pose", sets: 1, reps: "60s", rest: "-", duration: 60, coachNote: "Programme complete." }
          ]
        }
      }
    }

  ]
};

/**
 * Get a session by week number and slot (mon | wed | sat)
 */
export function getMorningSession(week, slot) {
  const w = MORNING_PROGRAMME.weeks.find(w => w.week === week);
  if (!w) return null;
  return w.sessions[slot] || null;
}

/**
 * Get phase info for a given week
 */
export function getMorningPhase(week) {
  const w = MORNING_PROGRAMME.weeks.find(w => w.week === week);
  if (!w) return { phase: "Establish", phaseNote: "" };
  return { phase: w.phase, phaseNote: w.phaseNote };
}

/**
 * Infer the slot from today's day of week.
 * Returns "mon" | "wed" | "sat" | null.
 */
export function getTodaySlot() {
  const day = new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat
  if (day === 1) return "mon";
  if (day === 3) return "wed";
  if (day === 6) return "sat";
  return null;
}
