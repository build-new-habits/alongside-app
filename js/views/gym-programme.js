/**
 * gym-programme.js - Gym Programme View
 *
 * v1.1 — Exercise guidance cards, weight logging, coach pain voice.
 *   - Pain reminder moved into coach voice card at session top
 *   - Each exercise expands to show plain-English description,
 *     form cues, and YouTube search link
 *   - Weight and reps per exercise saved to store on blur
 *   - Logged weights show in exercise row as "last logged"
 *
 * v1.0 — Standalone condition-aware gym programme.
 */

import { store }        from "../store.js";
import { getZoneStatus } from "../data/conditions.js";

export const centered = false;

// ── Exercise guidance library ─────────────────────────────────────────────────
// Plain-English descriptions for every exercise in the programme.
// youtubeSearch: terms that find a good demo without brand names.

const EXERCISE_GUIDE = {
  "Cat-cow": {
    description: "Start on hands and knees, wrists under shoulders, knees under hips. Breathe in as you drop your belly toward the floor and lift your head and tailbone (cow). Breathe out as you round your back toward the ceiling and tuck your chin and tailbone (cat). Move slowly between the two.",
    cues: ["Move with your breath — don't rush", "Feel the whole spine moving, not just the neck or lower back", "Keep your arms straight throughout"],
    youtubeSearch: "cat cow stretch for lower back mobility"
  },
  "Glute bridge hold": {
    description: "Lie on your back, knees bent, feet flat on the floor hip-width apart. Press through your heels to lift your hips until your body forms a straight line from shoulders to knees. Hold the position.",
    cues: ["Squeeze your glutes at the top — don't just lift", "Keep your ribs down — don't arch your lower back", "Press through your heels, not your toes"],
    youtubeSearch: "glute bridge hold tutorial form"
  },
  "Single-leg glute bridge \u2014 right side": {
    description: "Set up the same as a glute bridge, but extend your left leg straight out. Press through your right heel only to lift your hips. Keep your pelvis level — don't let the left side drop.",
    cues: ["Right heel drives into the floor", "Keep your hips square — both sides lift equally", "This is your physio exercise — do it exactly as prescribed"],
    youtubeSearch: "single leg glute bridge technique"
  },
  "Hip 90/90 stretch": {
    description: "Sit on the floor with both legs bent at 90 degrees — one leg in front (shin parallel to your body) and one to the side. Sit tall and lean gently forward over the front shin. Switch sides after the hold.",
    cues: ["Sit as tall as you can before leaning forward", "The stretch is in the outer hip and glute of the front leg", "Don't force it — let gravity do the work over time"],
    youtubeSearch: "90 90 hip stretch piriformis"
  },
  "World's greatest stretch": {
    description: "From a lunge position with your right foot forward, place your right hand on the floor beside your foot. Rotate your left arm up toward the ceiling, following it with your eyes. Return and repeat. Alternate sides.",
    cues: ["Keep your back knee off the floor if possible", "Let the rotation come from your mid-back, not just your arm", "Move slowly — this is a warm-up, not a competition"],
    youtubeSearch: "world's greatest stretch full body warm up"
  },
  "Cable pull-through": {
    description: "Set a cable machine to the lowest position with a rope attachment. Stand facing away from the machine, feet shoulder-width apart. Hinge at your hips (like you're bowing) to let the rope pull back between your legs, then drive your hips forward to stand tall. The movement is a hip hinge — your back stays flat throughout.",
    cues: ["Push your hips back, not your knees forward", "Keep your chest up and back flat — no rounding", "The power comes from your glutes driving your hips forward", "Start light until the movement feels natural"],
    youtubeSearch: "cable pull through hip hinge tutorial"
  },
  "Leg press \u2014 feet high and wide": {
    description: "Sit in the leg press machine. Place your feet high on the platform and wider than shoulder-width, toes slightly turned out. Lower the platform slowly toward your chest, then press back to start. High and wide foot position increases glute activation.",
    cues: ["Keep your lower back pressed into the seat throughout", "Don't lock your knees at the top", "Control the lowering — 3 seconds down"],
    youtubeSearch: "leg press high wide feet glute activation"
  },
  "Romanian deadlift (2 x 10kg)": {
    description: "Stand holding a dumbbell in each hand in front of your thighs. With a slight bend in your knees, hinge at your hips and lower the dumbbells down your legs until you feel a strong stretch in your hamstrings. Drive your hips forward to return to standing. Your back stays flat throughout — this is not a squat.",
    cues: ["Push your hips back as if someone has a rope around them", "Keep the dumbbells close to your legs throughout", "Stop when your back starts to round — don't chase the floor", "Feel the hamstring stretch — that is the point"],
    youtubeSearch: "romanian deadlift dumbbell tutorial beginners"
  },
  "Seated cable row": {
    description: "Sit at the cable row machine with feet on the platform, knees slightly bent. Hold the handle and sit tall. Pull the handle to your lower chest, squeezing your shoulder blades together at the end. Return slowly.",
    cues: ["Sit tall — don't lean back to get the weight moving", "Lead with your elbows, not your hands", "Squeeze the shoulder blades at the end of each rep", "Control the return — 2-3 seconds"],
    youtubeSearch: "seated cable row proper form technique"
  },
  "Pallof press \u2014 both sides": {
    description: "Set a cable at chest height. Stand side-on to the machine. Hold the handle at your chest with both hands. Press it straight out in front of you, hold for 2 seconds, then bring it back. The cable is trying to rotate you — your job is to resist it. That's the exercise. Switch sides.",
    cues: ["Stand tall, feet shoulder-width apart", "Don't let your body rotate toward the machine", "The harder you resist the rotation, the more your core works", "Breathe normally — don't hold your breath"],
    youtubeSearch: "pallof press anti rotation core cable"
  },
  "Dead bug": {
    description: "Lie on your back, arms pointing toward the ceiling, knees bent at 90 degrees in the air (like a table-top position). Slowly lower your right arm behind your head and your left leg toward the floor at the same time. Return and repeat on the other side. Your lower back must stay pressed into the floor throughout.",
    cues: ["Your lower back stays flat on the floor — always", "Move slowly — this is about control, not speed", "Breathe out as you lower the arm and leg", "If your back lifts off the floor, reduce your range of motion"],
    youtubeSearch: "dead bug exercise core stability tutorial"
  },
  "Pigeon pose \u2014 right side priority": {
    description: "From a hands-and-knees position, bring your right knee forward toward your right hand and your right foot toward your left hand. Extend your left leg straight behind you. Sink your hips toward the floor and hold. You should feel a deep stretch in your right glute. This is the most important stretch in the programme for your right piriformis.",
    cues: ["Square your hips to the floor as much as possible", "Don't collapse to one side — stay centred", "The deeper you breathe out, the more the hip releases", "Right side gets the longer hold every time"],
    youtubeSearch: "pigeon pose piriformis stretch yoga"
  },
  "Supine hamstring stretch": {
    description: "Lie on your back. Lift one leg and hold behind the thigh or calf (or use a strap/towel). Keep the other leg flat on the floor. Gently straighten the raised leg until you feel a stretch in the back of the thigh. Hold.",
    cues: ["Keep the leg on the floor flat — don't let it lift", "Don't pull aggressively — a gentle sustained stretch is more effective", "Keep your lower back on the floor throughout"],
    youtubeSearch: "supine hamstring stretch lying down strap"
  },
  "Child's pose": {
    description: "Kneel on the floor, sit your hips back toward your heels, and reach your arms forward along the floor. Rest your forehead on the floor or a folded towel. Breathe slowly and let your lower back decompress.",
    cues: ["This is pure rest — let gravity do everything", "Widen your knees if your hips are tight", "Each breath out, let the lower back soften a little more"],
    youtubeSearch: "child's pose yoga lower back relief"
  },
  "Band pull-aparts": {
    description: "Hold a resistance band at chest height with both hands shoulder-width apart, arms straight. Pull the band apart by drawing your hands out to the sides until the band touches your chest. Return slowly.",
    cues: ["Keep your arms straight throughout", "Lead with your thumbs turning outward", "Slow and controlled — this is a warm-up, not a race"],
    youtubeSearch: "band pull aparts shoulder warm up"
  },
  "Thoracic rotation (seated)": {
    description: "Sit on a bench or chair. Cross your arms over your chest. Keeping your hips still, rotate your upper body to one side as far as comfortable, then the other. The movement comes from your mid-back, not your lower back.",
    cues: ["Keep your hips facing forward", "Let your head follow the rotation", "Gentle — this is mobility work, not a competition"],
    youtubeSearch: "seated thoracic rotation mobility exercise"
  },
  "Chest-supported dumbbell row": {
    description: "Set an incline bench to about 45 degrees. Lie face-down on the bench with a dumbbell in each hand, arms hanging toward the floor. Row the dumbbells up toward your hips by driving your elbows back. Your chest stays on the bench the whole time — this is what makes it back-safe.",
    cues: ["Chest on the bench throughout — this is what protects your back", "Drive your elbows back and up, not just up", "Squeeze your shoulder blades together at the top", "Lower slowly — 3 seconds down"],
    youtubeSearch: "chest supported dumbbell row technique"
  },
  "Incline dumbbell press": {
    description: "Set a bench to 30-45 degrees. Lie on the bench with a dumbbell in each hand at shoulder height, elbows at about 45 degrees from your body. Press the dumbbells up and slightly together, then lower slowly.",
    cues: ["Keep your feet flat on the floor", "Don't flare your elbows out wide — 45 degrees is enough", "Control the lowering — 3 seconds down"],
    youtubeSearch: "incline dumbbell press chest technique"
  },
  "Lat pulldown (wide grip)": {
    description: "Sit at the lat pulldown machine with your thighs under the pad. Take a wide grip on the bar, palms facing away. Pull the bar down to your upper chest by driving your elbows down and back. Return slowly.",
    cues: ["Lean back slightly — about 10-15 degrees, no more", "Drive your elbows down toward your hips", "Don't pull the bar behind your neck", "Control the return — feel the lats lengthening"],
    youtubeSearch: "lat pulldown wide grip proper form"
  },
  "Dumbbell lateral raise": {
    description: "Stand holding light dumbbells at your sides. With a slight bend in your elbows, raise both arms out to the sides until they are at shoulder height. Lower slowly.",
    cues: ["Lead with your elbows, not your hands", "Don't shrug your shoulders — keep them down", "Go lighter than you think — this is shoulder stability work", "3 seconds down on every rep"],
    youtubeSearch: "dumbbell lateral raise technique shoulder"
  },
  "Pallof press": {
    description: "Set a cable at chest height. Stand side-on to the machine. Hold the handle at your chest with both hands. Press it straight out in front of you, hold for 2 seconds, then bring it back. The cable is trying to rotate you — your job is to resist it. Switch sides.",
    cues: ["Stand tall, feet shoulder-width apart", "Don't let your body rotate toward the machine", "The harder you resist, the more your core works"],
    youtubeSearch: "pallof press anti rotation core cable"
  },
  "Half-kneeling cable chop": {
    description: "Kneel on one knee beside a cable set to low position. Hold the handle with both hands and pull it diagonally across your body from low to high — like a chopping motion in reverse. Keep your hips square. Switch sides.",
    cues: ["Keep your hips facing forward throughout", "The movement comes from your core, not your arms", "Right knee down = right glute working — notice that connection"],
    youtubeSearch: "half kneeling cable chop core rotation"
  },
  "Doorway chest stretch": {
    description: "Stand in a doorway. Place one forearm on the door frame at shoulder height, elbow at 90 degrees. Step through the doorway until you feel a stretch across your chest. Hold, then switch sides.",
    cues: ["Keep your arm at shoulder height — not above", "Step forward gently — don't force it", "Breathe into the stretch"],
    youtubeSearch: "doorway chest stretch pec flexibility"
  },
  "Thread the needle": {
    description: "Start on hands and knees. Slide one arm under your body along the floor, rotating your upper back and dropping that shoulder toward the floor. Hold the stretch, then return. Repeat on both sides.",
    cues: ["The arm on the floor slides — don't push", "Keep your hips still — the movement is all upper back", "Let your head rest on the floor at the end of the movement"],
    youtubeSearch: "thread the needle thoracic mobility stretch"
  },
  "Glute bridge \u2014 3s hold": {
    description: "Lie on your back, knees bent, feet flat. Press through your heels to lift your hips, hold for 3 full seconds at the top squeezing your glutes, then lower. The hold is what activates the glute most effectively.",
    cues: ["Count the 3 seconds — don't rush it", "Squeeze hard at the top", "Lower under control"],
    youtubeSearch: "glute bridge isometric hold technique"
  },
  "Hip flexor stretch (kneeling)": {
    description: "Kneel on one knee with the other foot forward. Shift your weight forward over your front foot until you feel a stretch in the front of the hip of your rear leg. Keep your torso upright.",
    cues: ["Squeeze the glute of the rear leg to deepen the stretch", "Keep your front knee over your ankle, not past your toes", "Tuck your pelvis slightly to increase the hip flexor stretch"],
    youtubeSearch: "kneeling hip flexor stretch proper technique"
  },
  "Banded clamshell \u2014 right side priority": {
    description: "Place a resistance band just above your knees. Lie on your side with hips stacked, knees bent at about 45 degrees. Keeping your feet together, rotate your top knee up toward the ceiling like a clamshell opening. Lower slowly. Do the right side first and for longer.",
    cues: ["Keep your hips stacked — don't roll back as the knee opens", "The movement comes from the outer hip, not the back", "Go slowly on the way down — the lowering builds strength too"],
    youtubeSearch: "clamshell exercise glute medius resistance band"
  },
  "Goblet squat (12kg)": {
    description: "Hold a dumbbell or kettlebell vertically at your chest with both hands. Stand with feet shoulder-width apart, toes turned out slightly. Squat down as deep as comfortable while keeping your chest up and your heels on the floor. Drive back up through your heels.",
    cues: ["Keep the weight close to your chest throughout", "Elbows inside your knees at the bottom", "Chest up — if you feel your upper back rounding, squat less deep", "Push your knees out over your toes"],
    youtubeSearch: "goblet squat technique dumbbell beginners"
  },
  "Single-leg press \u2014 right leg": {
    description: "Sit in the leg press machine. Place only one foot on the platform, centred. Perform the press with that leg alone. Do all reps on one side before switching. Start lighter than you'd expect.",
    cues: ["Keep your lower back pressed into the seat", "Don't lock the knee at the top", "Right leg will likely feel weaker than left — that is what we are fixing"],
    youtubeSearch: "single leg press technique machine unilateral"
  },
  "Romanian deadlift (2 x 12kg)": {
    description: "Same as the 10kg version — stand holding dumbbells, hinge at the hips with a flat back, lower until you feel a strong hamstring stretch, drive hips forward to return. This week's weight is slightly increased.",
    cues: ["Push your hips back as if someone has a rope around them", "Keep dumbbells close to your legs", "Stop when your back starts to round"],
    youtubeSearch: "romanian deadlift dumbbell tutorial"
  },
  "Bulgarian split squat (bodyweight)": {
    description: "Stand about a metre in front of a bench. Place your rear foot on the bench behind you. Lower your body until your front thigh is roughly parallel to the floor, then drive back up through your front heel. Both legs get worked but your front leg does most of the work.",
    cues: ["Keep your front knee over your ankle", "Your torso can lean slightly forward — that is fine", "Go slowly on the way down — 3 seconds", "Bodyweight only this week — the balance is the challenge"],
    youtubeSearch: "bulgarian split squat tutorial beginners"
  },
  "Cable kickback \u2014 right side": {
    description: "Set a cable to the lowest position with an ankle strap. Attach the strap to your right ankle. Face the machine and hold it for balance. Keeping your right leg straight, drive it back behind you until your glute is fully contracted. Return slowly. Do all reps on the right side.",
    cues: ["Keep your upper body still — hold the machine for balance only", "Squeeze the glute hard at the top of each rep", "Don't swing the leg — controlled movement only", "Right side only for this exercise"],
    youtubeSearch: "cable glute kickback technique ankle strap"
  },
  "Dead bug (progressed)": {
    description: "Same starting position as the basic dead bug. This time, fully extend the opposite arm and leg toward the floor simultaneously — right arm and left leg together, then left arm and right leg. Your lower back must not lift off the floor at any point. If it does, reduce your range of motion.",
    cues: ["Lower back on the floor — always, no exceptions", "Breathe out as you extend", "Pause for 1 second with arm and leg extended before returning"],
    youtubeSearch: "dead bug progression full extension core"
  },
  "Pigeon pose \u2014 right side priority (long)": {
    description: "Same as the standard pigeon pose. Tonight this gets the longest hold of the week — 2 minutes on the right side. This is the most direct release for your right piriformis and the most important recovery work in the whole programme.",
    cues: ["Take your time getting into the position", "2 full minutes on the right side — use a timer", "Each breath out, let the hip sink a little further"],
    youtubeSearch: "pigeon pose piriformis stretch hold"
  },
  "Lying figure-4 stretch": {
    description: "Lie on your back, knees bent. Cross your right ankle over your left thigh just above the knee, creating a figure-4 shape. Either hold there, or lift the left foot off the floor and draw the left thigh toward your chest to deepen the stretch. You will feel this in your right outer hip and glute.",
    cues: ["Keep your lower back on the floor", "If you can't reach your left thigh, just hold the figure-4 position flat", "This stretches the same area as pigeon pose — use whichever feels better today"],
    youtubeSearch: "figure 4 stretch piriformis supine"
  }
};

// ── Programme data ────────────────────────────────────────────────────────────

const PROGRAMME = {
  name: "Core Strength & Posterior Chain Recovery",
  weeks: 6,
  sessions: [
    {
      id: "A",
      title: "Session A",
      subtitle: "Glute Activation & Posterior Chain Foundation",
      duration: "45-50 mins",
      coachLine: "This session is about waking things up, not testing limits. Everything here activates the posterior chain without loading your SI joint asymmetrically. It will feel lighter than you expect — that is correct. One thing before you start: if anything produces sharp or radiating pain during the session, stop that exercise immediately. Dull muscular effort is fine. Sharp or radiating is not. You know the difference.",
      warmup: [
        { name: "Cat-cow", sets: 2, reps: "10 slow", tempo: "Controlled", rest: "-" },
        { name: "Glute bridge hold", sets: 2, reps: "30s hold", tempo: "Static", rest: "30s" },
        { name: "Single-leg glute bridge \u2014 right side", sets: 3, reps: "10", tempo: "2-1-2", rest: "45s", note: "Physio exercise" },
        { name: "Hip 90/90 stretch", sets: 2, reps: "60s each side", tempo: "Hold", rest: "-" },
        { name: "World's greatest stretch", sets: 2, reps: "5 each side", tempo: "Slow", rest: "-" },
      ],
      main: [
        { name: "Cable pull-through", sets: 3, reps: "12", tempo: "3-1-2", rest: "60s", why: "Hip hinge with posterior chain load. No spinal compression.", logWeight: true },
        { name: "Leg press \u2014 feet high and wide", sets: 3, reps: "12", tempo: "3-1-2", rest: "75s", why: "Glute-biased, spinal-neutral, machine-supported.", logWeight: true },
        { name: "Romanian deadlift (2 x 10kg)", sets: 3, reps: "10", tempo: "3-0-2", rest: "75s", why: "Hamstring and glute load. Light weight \u2014 pattern first.", logWeight: true },
        { name: "Seated cable row", sets: 3, reps: "12", tempo: "2-1-2", rest: "60s", why: "Upper back strength. Reduces QL compensation.", logWeight: true },
        { name: "Pallof press \u2014 both sides", sets: 3, reps: "10 each", tempo: "2-2-2", rest: "60s", why: "Anti-rotation core. Best exercise for SI joint stability.", logWeight: true },
        { name: "Dead bug", sets: 3, reps: "8 each side", tempo: "Slow", rest: "45s", why: "Anti-extension core. Protects the lower back." },
      ],
      cooldown: [
        { name: "Pigeon pose \u2014 right side priority", sets: 1, reps: "90s each side", tempo: "Hold", rest: "-", note: "Do not skip this" },
        { name: "Supine hamstring stretch", sets: 1, reps: "60s each side", tempo: "Hold", rest: "-" },
        { name: "Child's pose", sets: 1, reps: "60s", tempo: "Hold", rest: "-" },
      ]
    },
    {
      id: "B",
      title: "Session B",
      subtitle: "Upper Body & Core Integration",
      duration: "45-50 mins",
      coachLine: "Session B gives your lower back and glutes 48 hours of recovery while you keep building. Upper body today. If anything produces sharp pain, stop that exercise immediately. Otherwise, muscular effort and mild discomfort are part of the work.",
      warmup: [
        { name: "Band pull-aparts", sets: 2, reps: "15", tempo: "Controlled", rest: "-" },
        { name: "Thoracic rotation (seated)", sets: 2, reps: "10 each side", tempo: "Slow", rest: "-" },
        { name: "Cat-cow", sets: 1, reps: "8", tempo: "Slow", rest: "-" },
      ],
      main: [
        { name: "Chest-supported dumbbell row", sets: 4, reps: "10", tempo: "2-1-3", rest: "75s", why: "Upper back strength. Zero spinal load.", logWeight: true },
        { name: "Incline dumbbell press", sets: 3, reps: "10", tempo: "3-1-2", rest: "75s", why: "Chest and shoulder in a supported position.", logWeight: true },
        { name: "Lat pulldown (wide grip)", sets: 3, reps: "12", tempo: "2-1-3", rest: "60s", why: "Lats stabilise the lumbar spine.", logWeight: true },
        { name: "Dumbbell lateral raise", sets: 3, reps: "15", tempo: "2-0-3", rest: "45s", why: "Shoulder stability. Light and high-rep.", logWeight: true },
        { name: "Pallof press", sets: 3, reps: "10 each side", tempo: "2-2-2", rest: "60s", why: "Anti-rotation core. Daily need for SI joint stability.", logWeight: true },
        { name: "Half-kneeling cable chop", sets: 3, reps: "10 each side", tempo: "2-1-2", rest: "60s", why: "Oblique strength. Activates right glute on right-knee-down sets.", logWeight: true },
      ],
      cooldown: [
        { name: "Doorway chest stretch", sets: 1, reps: "45s each side", tempo: "Hold", rest: "-" },
        { name: "Thread the needle", sets: 1, reps: "8 each side", tempo: "Slow", rest: "-" },
        { name: "Pigeon pose \u2014 right side priority", sets: 1, reps: "60s each side", tempo: "Hold", rest: "-" },
      ]
    },
    {
      id: "C",
      title: "Session C",
      subtitle: "Lower Body Strength & Single-Leg Progression",
      duration: "50-55 mins",
      coachLine: "The most demanding session of the week. Single-leg work appears here for the first time. If your right glute or SI joint objects to anything, step back to the bilateral version \u2014 that is good listening, not failure. Sharp or radiating pain means stop that exercise. Dull muscular effort means carry on.",
      warmup: [
        { name: "Glute bridge \u2014 3s hold", sets: 2, reps: "10", tempo: "1-3-1", rest: "30s" },
        { name: "Single-leg glute bridge \u2014 right side", sets: 2, reps: "8", tempo: "2-1-2", rest: "45s", note: "Physio exercise \u2014 activation only" },
        { name: "Hip flexor stretch (kneeling)", sets: 2, reps: "45s each side", tempo: "Hold", rest: "-" },
        { name: "Banded clamshell \u2014 right side priority", sets: 2, reps: "15", tempo: "2-1-2", rest: "30s" },
      ],
      main: [
        { name: "Goblet squat (12kg)", sets: 3, reps: "10", tempo: "3-1-2", rest: "75s", why: "Front-loaded. Upright torso. Safe for lower back.", logWeight: true },
        { name: "Single-leg press \u2014 right leg", sets: 3, reps: "10 each side", tempo: "3-1-2", rest: "60s each", why: "Identifies strength discrepancy. Machine removes balance demand.", logWeight: true },
        { name: "Romanian deadlift (2 x 12kg)", sets: 3, reps: "10", tempo: "3-0-2", rest: "75s", why: "Small progression from Session A.", logWeight: true },
        { name: "Bulgarian split squat (bodyweight)", sets: 3, reps: "8 each side", tempo: "3-1-2", rest: "75s", why: "Single-leg strength. Bodyweight only \u2014 the movement is the challenge." },
        { name: "Cable kickback \u2014 right side", sets: 3, reps: "12", tempo: "2-1-2", rest: "45s", why: "Isolated right glute. Rebuilding the connection.", logWeight: true },
        { name: "Dead bug (progressed)", sets: 3, reps: "8 each side", tempo: "Slow", rest: "45s", why: "Full contralateral extension. Highest core demand." },
      ],
      cooldown: [
        { name: "Pigeon pose \u2014 right side priority", sets: 1, reps: "2 mins right / 90s left", tempo: "Hold", rest: "-", note: "Longest pigeon of the week. Take the time." },
        { name: "Lying figure-4 stretch", sets: 1, reps: "60s each side", tempo: "Hold", rest: "-" },
        { name: "Supine hamstring stretch", sets: 1, reps: "90s each side", tempo: "Hold", rest: "-" },
        { name: "Child's pose", sets: 1, reps: "90s", tempo: "Hold", rest: "-" },
      ]
    }
  ]
};

// ── Condition awareness ───────────────────────────────────────────────────────

const ZONE_MESSAGES = {
  "lower-limb": {
    avoid: "Your lower limb is significantly affected today. Avoid single-leg work under load. Use machine-supported bilateral alternatives for everything. The cable kickback and single-leg press are out for today.",
    caution: "Your lower limb is flagging some discomfort. Reduce single-leg work to machine-only and skip Bulgarian split squats. Everything else is available."
  },
  "spine": {
    avoid: "Your lower back is significantly affected today. No loaded hip hinge work \u2014 skip the Romanian deadlift. Reduce the cable pull-through to bodyweight practice only. Pallof press and dead bug remain safe.",
    caution: "Your lower back is present today. Reduce Romanian deadlift weight by 20% and extend your warm-up by 10 minutes. Listen carefully during any hinging movement."
  },
  "upper-limb": {
    avoid: "Upper body is significantly affected. Session B should be skipped or replaced with a second Session A. Lower body and core work in Sessions A and C are unaffected.",
    caution: "Some upper body discomfort today. Reduce pressing weight. Focus on controlled movement over load."
  },
  "systemic": {
    avoid: "Your whole system is under strain. Consider the warm-up and cool-down from Session A only \u2014 the activation and stretching without the main session load. That is enough today.",
    caution: "Energy and systemic sensitivity is elevated. Keep intensity conservative across everything. If something feels like too much, it is too much."
  }
};

function buildConditionCard() {
  const conditions = store.get("conditions")          || [];
  const painScores = store.get("conditionPainScores") || {};
  if (conditions.length === 0) return "";

  const zoneStatus = getZoneStatus(conditions, painScores);
  const messages   = [];

  for (const [zone, severity] of Object.entries(zoneStatus)) {
    if (zone === "combinedSevere" || severity === "none") continue;
    const msg = ZONE_MESSAGES[zone];
    if (!msg) continue;
    const text = (severity === "severe" || severity === "acute") ? msg.avoid : msg.caution;
    messages.push({ severity, text });
  }

  if (messages.length === 0) {
    return `
      <div class="card card-coach gym-condition-card gym-condition--green">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="gym-condition-status">All clear for today</p>
          <p class="text-secondary">Your conditions are not flagging anything that changes today's session. Proceed as planned.</p>
        </div>
      </div>`;
  }

  const hasSevere = messages.some(m => m.severity === "severe" || m.severity === "acute");
  const cardClass = hasSevere ? "gym-condition--red" : "gym-condition--amber";

  return `
    <div class="card card-coach gym-condition-card ${cardClass}" role="note">
      <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="gym-condition-body">
        <p class="gym-condition-status">
          ${hasSevere ? "Some things to avoid today" : "A few things to be mindful of"}
        </p>
        ${messages.map(m => `<p class="gym-condition-message">${m.text}</p>`).join("")}
      </div>
    </div>`;
}

// ── Logged weights helpers ────────────────────────────────────────────────────

function getLogKey(sessionId, exerciseName) {
  return "gymLog_" + sessionId + "_" + exerciseName.replace(/[^a-zA-Z0-9]/g, "_");
}

function getLastLog(sessionId, exerciseName) {
  const key = getLogKey(sessionId, exerciseName);
  return store.get(key) || null;
}

// ── Exercise row renderer ─────────────────────────────────────────────────────

function renderExerciseRow(e, sessionId, idx) {
  const guide   = EXERCISE_GUIDE[e.name];
  const lastLog = e.logWeight ? getLastLog(sessionId, e.name) : null;
  const safeId  = e.name.replace(/[^a-zA-Z0-9]/g, "_") + "_" + sessionId;

  return `
    <div class="gym-exercise-row" data-exercise="${safeId}">

      <!-- ── Summary row (always visible) ─────────────────────── -->
      <div class="gym-exercise-summary">
        <div class="gym-exercise-name-cell">
          <span class="gym-exercise-name">${e.name}</span>
          ${e.note ? `<span class="gym-exercise-note">${e.note}</span>` : ""}
          ${e.why  ? `<span class="gym-exercise-why">${e.why}</span>`  : ""}
          ${lastLog ? `<span class="gym-exercise-lastlog">Last: ${lastLog}</span>` : ""}
        </div>
        <span class="gym-cell">${e.sets}</span>
        <span class="gym-cell">${e.reps}</span>
        <span class="gym-cell gym-tempo">${e.tempo}</span>
        <span class="gym-cell">${e.rest}</span>
      </div>

      <!-- ── Expand row: guide + log ───────────────────────────── -->
      <div class="gym-exercise-actions">
        ${guide ? `
          <button class="gym-guide-btn btn-text"
                  data-target="guide-${safeId}"
                  aria-expanded="false"
                  aria-controls="guide-${safeId}">
            How to do this
          </button>
        ` : ""}
        ${e.logWeight ? `
          <button class="gym-log-btn btn-text"
                  data-target="log-${safeId}"
                  aria-expanded="false"
                  aria-controls="log-${safeId}">
            Log weight
          </button>
        ` : ""}
      </div>

      <!-- ── Guide panel ───────────────────────────────────────── -->
      ${guide ? `
        <div id="guide-${safeId}" class="gym-guide-panel hidden" aria-hidden="true">
          <p class="gym-guide-description">${guide.description}</p>
          <ul class="gym-guide-cues">
            ${guide.cues.map(c => `<li>${c}</li>`).join("")}
          </ul>
          <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(guide.youtubeSearch)}"
             target="_blank"
             rel="noopener noreferrer"
             class="gym-youtube-link"
             aria-label="Watch a video demonstration of ${e.name} on YouTube (opens in new tab)">
            Watch a demonstration on YouTube
          </a>
        </div>
      ` : ""}

      <!-- ── Log panel ─────────────────────────────────────────── -->
      ${e.logWeight ? `
        <div id="log-${safeId}" class="gym-log-panel hidden" aria-hidden="true">
          <label class="gym-log-label" for="log-input-${safeId}">
            What weight / notes for this exercise?
          </label>
          <div class="gym-log-row">
            <input
              type="text"
              id="log-input-${safeId}"
              class="gym-log-input"
              placeholder="e.g. 2 x 10kg, 3 sets done"
              value="${lastLog || ""}"
              data-session="${sessionId}"
              data-exercise="${e.name}"
              aria-label="Log weight or notes for ${e.name}"
            >
            <button class="btn btn-primary btn-sm gym-log-save-btn"
                    data-input="log-input-${safeId}"
                    data-session="${sessionId}"
                    data-exercise="${e.name}"
                    aria-label="Save log for ${e.name}">
              Save
            </button>
          </div>
        </div>
      ` : ""}

    </div>
  `;
}

function renderExerciseTable(exercises, sessionId) {
  return `
    <div class="gym-exercise-table" role="table" aria-label="Exercises">
      <div class="gym-exercise-header" role="row">
        <span role="columnheader">Exercise</span>
        <span role="columnheader">Sets</span>
        <span role="columnheader">Reps</span>
        <span role="columnheader">Tempo</span>
        <span role="columnheader">Rest</span>
      </div>
      ${exercises.map((e, idx) => renderExerciseRow(e, sessionId, idx)).join("")}
    </div>`;
}

function renderSession(session) {
  return `
    <div class="gym-session-block" id="session-${session.id}">
      <div class="gym-session-header">
        <div class="gym-session-title-row">
          <h2 class="gym-session-title">${session.title}</h2>
          <span class="gym-session-duration">${session.duration}</span>
        </div>
        <p class="gym-session-subtitle">${session.subtitle}</p>
      </div>

      <div class="card card-coach gym-coach-line">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${session.coachLine}</p>
      </div>

      <h3 class="gym-block-heading">Warm-up</h3>
      ${renderExerciseTable(session.warmup, session.id)}

      <h3 class="gym-block-heading">Main session</h3>
      ${renderExerciseTable(session.main, session.id)}

      <h3 class="gym-block-heading">Cool-down</h3>
      ${renderExerciseTable(session.cooldown, session.id)}
    </div>
  `;
}

// ── Main render ───────────────────────────────────────────────────────────────

export function render() {
  const activeSession = store.get("gymProgrammeSession") || "A";
  const activeWeek    = store.get("gymProgrammeWeek")    || 1;
  const session = PROGRAMME.sessions.find(s => s.id === activeSession)
    || PROGRAMME.sessions[0];

  return `
    <div class="view gym-programme-view">

      <div class="view-header gym-programme-header">
        <button class="btn btn-ghost" onclick="router.navigate('settings')"
                aria-label="Back to Settings">Back</button>
        <h1>My Programme</h1>
      </div>

      <div class="gym-programme-meta card">
        <div class="gym-meta-row">
          <span class="gym-meta-label">Programme</span>
          <span class="gym-meta-value">${PROGRAMME.name}</span>
        </div>
        <div class="gym-meta-row">
          <span class="gym-meta-label">Week</span>
          <span class="gym-meta-value">${activeWeek} of ${PROGRAMME.weeks}</span>
        </div>
      </div>

      ${buildConditionCard()}

      <div class="gym-session-tabs" role="tablist" aria-label="Session">
        ${PROGRAMME.sessions.map(s => `
          <button
            class="gym-session-tab ${s.id === activeSession ? "active" : ""}"
            role="tab"
            aria-selected="${s.id === activeSession}"
            data-session="${s.id}"
          >${s.title}</button>
        `).join("")}
      </div>

      ${renderSession(session)}

    </div>
  `;
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  const view = document.querySelector(".gym-programme-view");
  if (!view) return;

  // Session tab switching
  view.addEventListener("click", e => {
    const tab = e.target.closest(".gym-session-tab");
    if (tab) {
      const sessionId = tab.dataset.session;
      if (!sessionId) return;
      store.set("gymProgrammeSession", sessionId);
      view.querySelectorAll(".gym-session-tab").forEach(t => {
        const active = t.dataset.session === sessionId;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", active);
      });
      const existing = view.querySelector(".gym-session-block");
      const session  = PROGRAMME.sessions.find(s => s.id === sessionId);
      if (existing && session) {
        existing.outerHTML = renderSession(session);
        wireInteractions(view);
      }
      return;
    }

    // Guide / log expand toggle
    const expandBtn = e.target.closest(".gym-guide-btn, .gym-log-btn");
    if (expandBtn) {
      const targetId = expandBtn.dataset.target;
      const panel    = document.getElementById(targetId);
      if (!panel) return;
      const isHidden = panel.classList.contains("hidden");
      panel.classList.toggle("hidden", !isHidden);
      panel.setAttribute("aria-hidden", !isHidden ? "false" : "true");
      expandBtn.setAttribute("aria-expanded", isHidden ? "true" : "false");
      if (isHidden) {
        expandBtn.textContent = expandBtn.classList.contains("gym-guide-btn")
          ? "Hide guide" : "Hide log";
      } else {
        expandBtn.textContent = expandBtn.classList.contains("gym-guide-btn")
          ? "How to do this" : "Log weight";
      }
      return;
    }

    // Log save
    const saveBtn = e.target.closest(".gym-log-save-btn");
    if (saveBtn) {
      const inputId  = saveBtn.dataset.input;
      const sessionId  = saveBtn.dataset.session;
      const exercise = saveBtn.dataset.exercise;
      const input    = document.getElementById(inputId);
      if (!input || !sessionId || !exercise) return;
      const value = input.value.trim();
      if (!value) return;
      const key = getLogKey(sessionId, exercise);
      store.set(key, value);
      // Update last log display
      const row = saveBtn.closest(".gym-exercise-row");
      const lastLogEl = row?.querySelector(".gym-exercise-lastlog");
      if (lastLogEl) {
        lastLogEl.textContent = "Last: " + value;
      } else {
        const nameCell = row?.querySelector(".gym-exercise-name-cell");
        if (nameCell) {
          const span = document.createElement("span");
          span.className = "gym-exercise-lastlog";
          span.textContent = "Last: " + value;
          nameCell.appendChild(span);
        }
      }
      saveBtn.textContent = "Saved \u2713";
      setTimeout(() => { saveBtn.textContent = "Save"; }, 1500);
    }
  });
}

function wireInteractions(view) {
  // After re-render from tab switch, onMount event delegation still works
  // because we use view.addEventListener — no rewiring needed.
}
