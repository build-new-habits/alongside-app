/**
 * gym-programme.js - Gym Programme View
 *
 * v2.0 — Full card redesign.
 *   - No table. Exercises shown as vertical card list.
 *   - Each card: name, sets/reps/tempo/rest, coach weight recommendation,
 *     editable target weight/time, expand for description + cues + YouTube,
 *     timer for timed exercises, Done button per exercise.
 *   - Progress bar across top of session.
 *   - Post-session flow: adaptive intel (3 taps) then wellbeing invitation.
 *   - Condition awareness card above session.
 *   - All logs saved to store keyed by session + exercise name.
 */

import { store }         from "../store.js";
import { getZoneStatus } from "../data/conditions.js";

export const centered = false;

// ── State ─────────────────────────────────────────────────────────────────────
let activeSessionId  = "A";
let completedIds     = new Set();   // exercise safeIds marked done this visit
let expandedId       = null;        // which card is currently expanded
let activeTimerId    = null;        // setInterval reference
let timerExerciseId  = null;        // which exercise the timer belongs to
let timerRemaining   = 0;
let postSessionState = null;        // null | "intel" | "wellbeing" | "done"
let intelAnswers     = {};          // { exerciseName: { feel, pain } }

// ── Exercise guide library ────────────────────────────────────────────────────
const GUIDE = {
  "Cat-cow": {
    description: "Start on hands and knees, wrists under shoulders, knees under hips. Breathe in as you drop your belly toward the floor and lift your head and tailbone. Breathe out as you round your back toward the ceiling and tuck your chin and tailbone.",
    cues: ["Move with your breath — don't rush", "Feel the whole spine moving, not just the neck", "Keep your arms straight throughout"],
    youtube: "cat cow stretch lower back mobility"
  },
  "Glute bridge hold": {
    description: "Lie on your back, knees bent, feet flat. Press through your heels to lift your hips until your body forms a straight line from shoulders to knees. Hold.",
    cues: ["Squeeze your glutes at the top — don't just lift", "Keep your ribs down — don't arch your lower back", "Press through your heels, not your toes"],
    youtube: "glute bridge hold tutorial"
  },
  "Single-leg glute bridge — right side": {
    description: "Same as a glute bridge but extend your left leg straight out. Press through your right heel only. Keep your pelvis level — don't let the left side drop.",
    cues: ["Right heel drives into the floor", "Keep your hips square — both sides lift equally", "This is your physio exercise — do it exactly as prescribed"],
    youtube: "single leg glute bridge technique"
  },
  "Hip 90/90 stretch": {
    description: "Sit with both legs bent at 90 degrees — one leg in front, one to the side. Sit tall and lean gently forward over the front shin. Switch sides.",
    cues: ["Sit as tall as you can before leaning forward", "The stretch is in the outer hip of the front leg", "Let gravity do the work — don't force it"],
    youtube: "90 90 hip stretch piriformis"
  },
  "World's greatest stretch": {
    description: "From a lunge with your right foot forward, place your right hand on the floor beside your foot. Rotate your left arm up toward the ceiling. Return and repeat. Alternate sides.",
    cues: ["Keep your back knee off the floor", "Let the rotation come from your mid-back", "Move slowly — this is a warm-up"],
    youtube: "world's greatest stretch warm up"
  },
  "Cable pull-through": {
    description: "Set a cable to the lowest position with a rope attachment. Stand facing away. Hinge at your hips to let the rope pull back between your legs, then drive your hips forward to stand. Your back stays flat throughout.",
    cues: ["Push your hips back — not your knees forward", "Keep your chest up and back flat", "The power comes from your glutes driving forward", "Start light until the movement feels natural"],
    youtube: "cable pull through hip hinge tutorial"
  },
  "Leg press — feet high and wide": {
    description: "Sit in the leg press machine. Place your feet high on the platform and wider than shoulder-width, toes slightly turned out. Lower slowly, then press back. High and wide foot position increases glute activation.",
    cues: ["Keep your lower back pressed into the seat", "Don't lock your knees at the top", "Control the lowering — 3 seconds down"],
    youtube: "leg press high wide feet glute activation"
  },
  "Romanian deadlift": {
    description: "Stand holding dumbbells in front of your thighs. With a slight bend in your knees, hinge at your hips and lower the dumbbells down your legs until you feel a strong hamstring stretch. Drive your hips forward to return. Back stays flat throughout.",
    cues: ["Push your hips back as if someone has a rope around them", "Keep the dumbbells close to your legs", "Stop when your back starts to round — don't chase the floor", "Feel the hamstring stretch — that is the point"],
    youtube: "romanian deadlift dumbbell tutorial beginners"
  },
  "Seated cable row": {
    description: "Sit at the cable row machine, knees slightly bent. Hold the handle and sit tall. Pull to your lower chest, squeezing your shoulder blades together. Return slowly.",
    cues: ["Sit tall — don't lean back to get the weight moving", "Lead with your elbows, not your hands", "Squeeze the shoulder blades at the end", "Control the return — 2-3 seconds"],
    youtube: "seated cable row proper form"
  },
  "Pallof press": {
    description: "Set a cable at chest height. Stand side-on. Hold the handle at your chest with both hands. Press it straight out, hold 2 seconds, bring it back. The cable tries to rotate you — resist it. Switch sides.",
    cues: ["Stand tall, feet shoulder-width apart", "Don't let your body rotate toward the machine", "The harder you resist, the more your core works"],
    youtube: "pallof press anti rotation core cable"
  },
  "Dead bug": {
    description: "Lie on your back, arms toward the ceiling, knees at 90 degrees in the air. Slowly lower your right arm and left leg toward the floor at the same time. Return and repeat on the other side. Lower back stays pressed to the floor throughout.",
    cues: ["Lower back stays flat on the floor — always", "Move slowly — control over speed", "Breathe out as you lower the arm and leg", "Reduce range of motion if your back lifts"],
    youtube: "dead bug exercise core stability"
  },
  "Dead bug (progressed)": {
    description: "Same as dead bug but fully extend opposite arm and leg toward the floor simultaneously. Lower back must not lift at any point.",
    cues: ["Lower back on the floor — no exceptions", "Breathe out as you extend", "Pause 1 second at full extension before returning"],
    youtube: "dead bug progression full extension core"
  },
  "Pigeon pose — right side priority": {
    description: "From hands and knees, bring your right knee forward toward your right hand, right foot toward your left hand. Extend your left leg behind you. Sink your hips toward the floor. Deep stretch in your right glute.",
    cues: ["Square your hips to the floor", "Don't collapse to one side — stay centred", "Breathe out to release the hip further", "Right side gets the longer hold every time"],
    youtube: "pigeon pose piriformis stretch"
  },
  "Supine hamstring stretch": {
    description: "Lie on your back. Lift one leg and hold behind the thigh or use a strap. Keep the other leg flat. Gently straighten the raised leg until you feel a stretch in the back of the thigh.",
    cues: ["Keep the floor leg flat", "Don't pull aggressively — sustained is more effective", "Keep your lower back on the floor"],
    youtube: "supine hamstring stretch lying down"
  },
  "Child's pose": {
    description: "Kneel, sit your hips back toward your heels, reach your arms forward along the floor. Rest your forehead down. Breathe slowly.",
    cues: ["This is pure rest — let gravity do everything", "Widen your knees if your hips are tight", "Each breath out, let the lower back soften"],
    youtube: "child's pose yoga lower back relief"
  },
  "Band pull-aparts": {
    description: "Hold a resistance band at chest height, arms straight. Pull the band apart by drawing your hands out to the sides until it touches your chest. Return slowly.",
    cues: ["Keep your arms straight", "Lead with your thumbs turning outward", "Slow and controlled"],
    youtube: "band pull aparts shoulder warm up"
  },
  "Thoracic rotation (seated)": {
    description: "Sit on a bench, arms crossed over your chest. Keeping your hips still, rotate your upper body to one side as far as comfortable, then the other. Movement from your mid-back.",
    cues: ["Keep your hips facing forward", "Let your head follow the rotation", "Gentle — this is mobility work"],
    youtube: "seated thoracic rotation mobility"
  },
  "Chest-supported dumbbell row": {
    description: "Set an incline bench to 45 degrees. Lie face-down with dumbbells hanging toward the floor. Row up toward your hips by driving elbows back. Chest stays on the bench — this protects your back.",
    cues: ["Chest on the bench throughout", "Drive your elbows back and up", "Squeeze shoulder blades at the top", "Lower slowly — 3 seconds down"],
    youtube: "chest supported dumbbell row technique"
  },
  "Incline dumbbell press": {
    description: "Set a bench to 30-45 degrees. Lie on it with dumbbells at shoulder height, elbows at 45 degrees. Press up and slightly together, then lower slowly.",
    cues: ["Keep your feet flat on the floor", "Don't flare your elbows wide — 45 degrees is enough", "Control the lowering — 3 seconds down"],
    youtube: "incline dumbbell press chest technique"
  },
  "Lat pulldown (wide grip)": {
    description: "Sit at the lat pulldown machine, thighs under the pad. Take a wide grip. Pull the bar down to your upper chest by driving your elbows down and back. Return slowly.",
    cues: ["Lean back slightly — 10-15 degrees, no more", "Drive your elbows down toward your hips", "Don't pull the bar behind your neck", "Control the return"],
    youtube: "lat pulldown wide grip proper form"
  },
  "Dumbbell lateral raise": {
    description: "Stand with light dumbbells at your sides. With a slight bend in your elbows, raise both arms out to the sides to shoulder height. Lower slowly.",
    cues: ["Lead with your elbows, not your hands", "Don't shrug your shoulders", "Go lighter than you think", "3 seconds down every rep"],
    youtube: "dumbbell lateral raise shoulder technique"
  },
  "Half-kneeling cable chop": {
    description: "Kneel on one knee beside a low cable. Hold with both hands and pull diagonally from low to high across your body. Keep hips square. Switch sides.",
    cues: ["Hips facing forward throughout", "Movement from your core, not your arms", "Right knee down = right glute working"],
    youtube: "half kneeling cable chop core"
  },
  "Doorway chest stretch": {
    description: "Stand in a doorway, one forearm on the frame at shoulder height, elbow at 90 degrees. Step through until you feel a stretch across your chest. Hold, then switch.",
    cues: ["Keep your arm at shoulder height — not above", "Step forward gently", "Breathe into the stretch"],
    youtube: "doorway chest stretch pec flexibility"
  },
  "Thread the needle": {
    description: "Start on hands and knees. Slide one arm under your body along the floor, rotating your upper back and dropping that shoulder. Hold, then return. Both sides.",
    cues: ["The arm slides — don't push", "Keep your hips still", "Let your head rest on the floor"],
    youtube: "thread the needle thoracic stretch"
  },
  "Glute bridge — 3s hold": {
    description: "Same as a glute bridge but hold for 3 full seconds at the top squeezing your glutes hard, then lower. The hold is what activates the glute most.",
    cues: ["Count the 3 seconds — don't rush", "Squeeze hard at the top", "Lower under control"],
    youtube: "glute bridge isometric hold"
  },
  "Hip flexor stretch (kneeling)": {
    description: "Kneel on one knee, other foot forward. Shift your weight forward until you feel a stretch in the front of the rear hip. Torso upright.",
    cues: ["Squeeze the rear glute to deepen the stretch", "Front knee over ankle — not past toes", "Tuck your pelvis slightly"],
    youtube: "kneeling hip flexor stretch technique"
  },
  "Banded clamshell — right side priority": {
    description: "Band just above knees. Lie on your side, knees bent at 45 degrees. Rotate your top knee up like a clamshell opening, keeping feet together. Right side first.",
    cues: ["Keep hips stacked — don't roll back", "Movement from the outer hip, not the back", "Slow on the way down"],
    youtube: "clamshell exercise glute medius band"
  },
  "Goblet squat": {
    description: "Hold a dumbbell or kettlebell vertically at your chest. Feet shoulder-width, toes slightly out. Squat down keeping your chest up and heels on the floor. Drive through your heels to return.",
    cues: ["Keep the weight close to your chest", "Elbows inside your knees at the bottom", "Chest up — if your back rounds, squat less deep", "Push your knees out over your toes"],
    youtube: "goblet squat technique beginners"
  },
  "Single-leg press — right leg": {
    description: "Sit in the leg press machine. Place only one foot on the platform, centred. Press with that leg alone. Do all reps one side then switch. Start lighter than you'd expect.",
    cues: ["Lower back pressed into the seat", "Don't lock the knee at the top", "Right leg will likely feel weaker than left — that is what we are fixing"],
    youtube: "single leg press technique machine"
  },
  "Bulgarian split squat": {
    description: "Stand a metre in front of a bench. Rear foot on the bench. Lower until your front thigh is roughly parallel to the floor, then drive back up through your front heel.",
    cues: ["Front knee over your ankle", "Torso can lean slightly forward", "3 seconds down", "Bodyweight only this week — the balance is the challenge"],
    youtube: "bulgarian split squat tutorial beginners"
  },
  "Cable kickback — right side": {
    description: "Set cable to lowest position with ankle strap on right ankle. Face the machine and hold for balance. Drive your right leg straight back until your glute is fully contracted. Return slowly. Right side only.",
    cues: ["Upper body stays still", "Squeeze the glute hard at the top", "Controlled movement — no swinging", "Right side only for this exercise"],
    youtube: "cable glute kickback ankle strap technique"
  },
  "Lying figure-4 stretch": {
    description: "Lie on your back, knees bent. Cross your right ankle over your left thigh above the knee. Either hold there, or lift the left foot to draw your left thigh toward your chest. You feel this in your right outer hip and glute.",
    cues: ["Lower back on the floor", "Use whichever version feels better today", "Stretches the same area as pigeon pose"],
    youtube: "figure 4 stretch piriformis supine"
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
      coachLine: "This session is about waking things up, not testing limits. Everything here activates the posterior chain without loading your SI joint asymmetrically. It will feel lighter than you expect — that is correct. If anything produces sharp or radiating pain, stop that exercise immediately. Dull muscular effort is fine. Sharp or radiating is not.",
      exercises: [
        { id: "wu1", section: "warmup",  name: "Cat-cow",                               sets: 2, reps: "10 slow",       tempo: "Controlled", rest: "-"   },
        { id: "wu2", section: "warmup",  name: "Glute bridge hold",                     sets: 2, reps: "30s hold",      tempo: "Static",     rest: "30s", duration: 30 },
        { id: "wu3", section: "warmup",  name: "Single-leg glute bridge — right side",  sets: 3, reps: "10",            tempo: "2-1-2",      rest: "45s", note: "Physio exercise" },
        { id: "wu4", section: "warmup",  name: "Hip 90/90 stretch",                     sets: 2, reps: "60s each side", tempo: "Hold",       rest: "-",   duration: 60 },
        { id: "wu5", section: "warmup",  name: "World's greatest stretch",              sets: 2, reps: "5 each side",   tempo: "Slow",       rest: "-"   },
        { id: "m1",  section: "main",    name: "Cable pull-through",                    sets: 3, reps: "12",            tempo: "3-1-2",      rest: "60s", recommended: "Light weight — focus on the hip hinge pattern", logWeight: true },
        { id: "m2",  section: "main",    name: "Leg press — feet high and wide",        sets: 3, reps: "12",            tempo: "3-1-2",      rest: "75s", recommended: "Moderate weight — last 2 reps challenging", logWeight: true },
        { id: "m3",  section: "main",    name: "Romanian deadlift",                     sets: 3, reps: "10",            tempo: "3-0-2",      rest: "75s", recommended: "2 x 10kg", logWeight: true },
        { id: "m4",  section: "main",    name: "Seated cable row",                      sets: 3, reps: "12",            tempo: "2-1-2",      rest: "60s", recommended: "Comfortable weight with full control", logWeight: true },
        { id: "m5",  section: "main",    name: "Pallof press",                          sets: 3, reps: "10 each side",  tempo: "2-2-2",      rest: "60s", recommended: "Light cable — this is core work not arm work", logWeight: true },
        { id: "m6",  section: "main",    name: "Dead bug",                              sets: 3, reps: "8 each side",   tempo: "Slow",       rest: "45s" },
        { id: "cd1", section: "cooldown",name: "Pigeon pose — right side priority",     sets: 1, reps: "90s each side", tempo: "Hold",       rest: "-",   duration: 90, note: "Do not skip this" },
        { id: "cd2", section: "cooldown",name: "Supine hamstring stretch",              sets: 1, reps: "60s each side", tempo: "Hold",       rest: "-",   duration: 60 },
        { id: "cd3", section: "cooldown",name: "Child's pose",                          sets: 1, reps: "60s",           tempo: "Hold",       rest: "-",   duration: 60 },
      ]
    },
    {
      id: "B",
      title: "Session B",
      subtitle: "Upper Body & Core Integration",
      duration: "45-50 mins",
      coachLine: "Session B gives your lower back and glutes 48 hours of recovery while you keep building. Upper body today. If anything produces sharp pain, stop that exercise. Muscular effort and mild discomfort are part of the work.",
      exercises: [
        { id: "wu1", section: "warmup",  name: "Band pull-aparts",                      sets: 2, reps: "15",            tempo: "Controlled", rest: "-"   },
        { id: "wu2", section: "warmup",  name: "Thoracic rotation (seated)",            sets: 2, reps: "10 each side",  tempo: "Slow",       rest: "-"   },
        { id: "wu3", section: "warmup",  name: "Cat-cow",                               sets: 1, reps: "8",             tempo: "Slow",       rest: "-"   },
        { id: "m1",  section: "main",    name: "Chest-supported dumbbell row",          sets: 4, reps: "10",            tempo: "2-1-3",      rest: "75s", recommended: "Moderate dumbbells — last 2 reps should challenge you", logWeight: true },
        { id: "m2",  section: "main",    name: "Incline dumbbell press",                sets: 3, reps: "10",            tempo: "3-1-2",      rest: "75s", recommended: "Light-moderate dumbbells", logWeight: true },
        { id: "m3",  section: "main",    name: "Lat pulldown (wide grip)",              sets: 3, reps: "12",            tempo: "2-1-3",      rest: "60s", recommended: "Comfortable weight with full range", logWeight: true },
        { id: "m4",  section: "main",    name: "Dumbbell lateral raise",               sets: 3, reps: "15",            tempo: "2-0-3",      rest: "45s", recommended: "Light dumbbells — go lighter than you think", logWeight: true },
        { id: "m5",  section: "main",    name: "Pallof press",                          sets: 3, reps: "10 each side",  tempo: "2-2-2",      rest: "60s", recommended: "Light cable", logWeight: true },
        { id: "m6",  section: "main",    name: "Half-kneeling cable chop",              sets: 3, reps: "10 each side",  tempo: "2-1-2",      rest: "60s", recommended: "Light-moderate cable", logWeight: true },
        { id: "cd1", section: "cooldown",name: "Doorway chest stretch",                 sets: 1, reps: "45s each side", tempo: "Hold",       rest: "-",   duration: 45 },
        { id: "cd2", section: "cooldown",name: "Thread the needle",                     sets: 1, reps: "8 each side",   tempo: "Slow",       rest: "-"   },
        { id: "cd3", section: "cooldown",name: "Pigeon pose — right side priority",     sets: 1, reps: "60s each side", tempo: "Hold",       rest: "-",   duration: 60 },
      ]
    },
    {
      id: "C",
      title: "Session C",
      subtitle: "Lower Body Strength & Single-Leg Progression",
      duration: "50-55 mins",
      coachLine: "The most demanding session of the week. Single-leg work appears here for the first time. If your right glute or SI joint objects to anything, step back to the bilateral version — that is good listening, not failure. Sharp or radiating pain means stop. Dull muscular effort means carry on.",
      exercises: [
        { id: "wu1", section: "warmup",  name: "Glute bridge — 3s hold",               sets: 2, reps: "10",            tempo: "1-3-1",      rest: "30s" },
        { id: "wu2", section: "warmup",  name: "Single-leg glute bridge — right side",  sets: 2, reps: "8",             tempo: "2-1-2",      rest: "45s", note: "Physio exercise — activation only" },
        { id: "wu3", section: "warmup",  name: "Hip flexor stretch (kneeling)",         sets: 2, reps: "45s each side", tempo: "Hold",       rest: "-",   duration: 45 },
        { id: "wu4", section: "warmup",  name: "Banded clamshell — right side priority",sets: 2, reps: "15",            tempo: "2-1-2",      rest: "30s" },
        { id: "m1",  section: "main",    name: "Goblet squat",                          sets: 3, reps: "10",            tempo: "3-1-2",      rest: "75s", recommended: "12kg dumbbell or kettlebell", logWeight: true },
        { id: "m2",  section: "main",    name: "Single-leg press — right leg",          sets: 3, reps: "10 each side",  tempo: "3-1-2",      rest: "60s", recommended: "Lighter than your bilateral press — start conservative", logWeight: true },
        { id: "m3",  section: "main",    name: "Romanian deadlift",                     sets: 3, reps: "10",            tempo: "3-0-2",      rest: "75s", recommended: "2 x 12kg (small step up from Session A)", logWeight: true },
        { id: "m4",  section: "main",    name: "Bulgarian split squat",                 sets: 3, reps: "8 each side",   tempo: "3-1-2",      rest: "75s", recommended: "Bodyweight only this week" },
        { id: "m5",  section: "main",    name: "Cable kickback — right side",           sets: 3, reps: "12",            tempo: "2-1-2",      rest: "45s", recommended: "Light cable — feel the glute, not the hip flexor", logWeight: true },
        { id: "m6",  section: "main",    name: "Dead bug (progressed)",                 sets: 3, reps: "8 each side",   tempo: "Slow",       rest: "45s" },
        { id: "cd1", section: "cooldown",name: "Pigeon pose — right side priority",     sets: 1, reps: "2 mins right / 90s left", tempo: "Hold", rest: "-", duration: 120, note: "Longest pigeon of the week" },
        { id: "cd2", section: "cooldown",name: "Lying figure-4 stretch",                sets: 1, reps: "60s each side", tempo: "Hold",       rest: "-",   duration: 60 },
        { id: "cd3", section: "cooldown",name: "Supine hamstring stretch",              sets: 1, reps: "90s each side", tempo: "Hold",       rest: "-",   duration: 90 },
        { id: "cd4", section: "cooldown",name: "Child's pose",                          sets: 1, reps: "90s",           tempo: "Hold",       rest: "-",   duration: 90 },
      ]
    }
  ]
};

// ── Condition awareness ───────────────────────────────────────────────────────

const ZONE_MESSAGES = {
  "lower-limb": {
    avoid:   "Your lower limb is significantly affected today. Avoid single-leg work under load. Use machine-supported bilateral alternatives. Cable kickback and single-leg press are out today.",
    caution: "Your lower limb is flagging some discomfort. Reduce single-leg work to machine-only. Skip Bulgarian split squats. Everything else is available."
  },
  "spine": {
    avoid:   "Your lower back is significantly affected. Skip the Romanian deadlift today. Reduce cable pull-through to bodyweight practice only. Pallof press and dead bug remain safe.",
    caution: "Your lower back is present today. Reduce Romanian deadlift weight by 20% and extend your warm-up. Listen carefully during any hinging movement."
  },
  "upper-limb": {
    avoid:   "Upper body is significantly affected. Session B should be skipped or replaced with Session A. Lower body and core work is unaffected.",
    caution: "Some upper body discomfort today. Reduce pressing weight. Focus on controlled movement over load."
  },
  "systemic": {
    avoid:   "Your whole system is under strain. Consider the warm-up and cool-down from Session A only. That is enough today.",
    caution: "Energy is lower than usual. Keep intensity conservative. If something feels like too much, it is."
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
    messages.push({ severity, text: (severity === "severe" || severity === "acute") ? msg.avoid : msg.caution });
  }
  if (messages.length === 0) return `
    <div class="card card-coach gym-condition-card gym-condition--green">
      <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div><p class="gym-condition-status">All clear for today</p>
      <p class="text-secondary">No condition flags affecting this session. Proceed as planned.</p></div>
    </div>`;
  const hasSevere = messages.some(m => m.severity === "severe" || m.severity === "acute");
  return `
    <div class="card card-coach gym-condition-card ${hasSevere ? "gym-condition--red" : "gym-condition--amber"}" role="note">
      <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
      <div class="gym-condition-body">
        <p class="gym-condition-status">${hasSevere ? "Some things to avoid today" : "A few things to be mindful of"}</p>
        ${messages.map(m => `<p class="gym-condition-message">${m.text}</p>`).join("")}
      </div>
    </div>`;
}

// ── Log helpers ───────────────────────────────────────────────────────────────

function logKey(sessionId, exerciseName) {
  return "gymLog_" + sessionId + "_" + exerciseName.replace(/[^a-zA-Z0-9]/g, "_");
}
function getLog(sessionId, exerciseName) {
  return store.get(logKey(sessionId, exerciseName)) || null;
}
function saveLog(sessionId, exerciseName, value) {
  store.set(logKey(sessionId, exerciseName), value);
}

function intelKey(sessionId, exerciseName) {
  return "gymIntel_" + sessionId + "_" + exerciseName.replace(/[^a-zA-Z0-9]/g, "_");
}
function getLastIntel(sessionId, exerciseName) {
  return store.get(intelKey(sessionId, exerciseName)) || null;
}

// ── Exercise card renderer ────────────────────────────────────────────────────

function renderExerciseCard(ex, sessionId) {
  const guide      = GUIDE[ex.name] || GUIDE[ex.name.replace(/ \(.*\)/, "")] || null;
  const lastLog    = getLog(sessionId, ex.name);
  const isDone     = completedIds.has(ex.id);
  const isExpanded = expandedId === ex.id;
  const safeId     = ex.id + "_" + sessionId;

  const sectionLabel = ex.section === "warmup" ? "Warm-up" :
                       ex.section === "main"    ? "Main"    : "Cool-down";

  return `
    <div class="gym-card ${isDone ? "gym-card--done" : ""} ${isExpanded ? "gym-card--expanded" : ""}"
         data-exercise-id="${ex.id}"
         id="gymcard-${safeId}">

      <!-- ── Tap target: summary row ──────────────────────────── -->
      <button class="gym-card-summary" data-expand="${ex.id}"
              aria-expanded="${isExpanded}"
              aria-label="${ex.name}${isDone ? ", completed" : ""}">

        <div class="gym-card-left">
          <span class="gym-card-section">${sectionLabel}</span>
          <span class="gym-card-name">${ex.name}</span>
          ${ex.note ? `<span class="gym-card-note">${ex.note}</span>` : ""}
          ${lastLog  ? `<span class="gym-card-lastlog">Last: ${lastLog}</span>` : ""}
        </div>

        <div class="gym-card-right">
          <div class="gym-card-stats">
            <span class="gym-stat">${ex.sets} <small>sets</small></span>
            <span class="gym-stat">${ex.reps}</span>
            ${ex.tempo !== "-" ? `<span class="gym-stat gym-stat--tempo">${ex.tempo}</span>` : ""}
            ${ex.rest  !== "-" ? `<span class="gym-stat"><small>rest</small> ${ex.rest}</span>` : ""}
          </div>
          <span class="gym-card-chevron" aria-hidden="true">${isExpanded ? "▲" : "▼"}</span>
          ${isDone ? `<span class="gym-card-done-badge" aria-label="Done">✓</span>` : ""}
        </div>
      </button>

      <!-- ── Expanded panel ────────────────────────────────────── -->
      ${isExpanded ? `
        <div class="gym-card-panel" id="panel-${safeId}">

          <!-- Coach recommendation + editable target -->
          ${ex.recommended ? `
            <div class="gym-card-recommendation">
              <span class="gym-rec-label">I suggest</span>
              <span class="gym-rec-text">${ex.recommended}</span>
            </div>
          ` : ""}

          <!-- Editable target -->
          ${ex.logWeight ? `
            <div class="gym-log-section">
              <label class="gym-log-label" for="log-${safeId}">
                What did you actually use?
              </label>
              <div class="gym-log-row">
                <input type="text" id="log-${safeId}"
                       class="gym-log-input"
                       placeholder="e.g. 2 x 10kg, 3 sets"
                       value="${lastLog || ""}"
                       data-session="${sessionId}"
                       data-exercise="${ex.name}"
                       aria-label="Log weight for ${ex.name}">
                <button class="btn btn-primary btn-sm gym-save-btn"
                        data-input="log-${safeId}"
                        data-session="${sessionId}"
                        data-exercise="${ex.name}">Save</button>
              </div>
            </div>
          ` : ""}

          <!-- Timer for duration-based exercises -->
          ${ex.duration ? `
            <div class="gym-timer-section" id="timer-section-${safeId}">
              <div class="gym-timer-display" id="timer-display-${safeId}" aria-live="polite">
                ${formatTime(ex.duration)}
              </div>
              <button class="btn btn-secondary btn-full gym-timer-btn"
                      data-exercise-id="${ex.id}"
                      data-duration="${ex.duration}"
                      id="timer-btn-${safeId}"
                      aria-label="Start timer for ${ex.name}">
                ▶ Start Timer
              </button>
            </div>
          ` : ""}

          <!-- Guide: description + cues -->
          ${guide ? `
            <div class="gym-guide">
              <p class="gym-guide-description">${guide.description}</p>
              <ul class="gym-guide-cues">
                ${guide.cues.map(c => `<li>${c}</li>`).join("")}
              </ul>
              <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(guide.youtube)}"
                 target="_blank" rel="noopener noreferrer"
                 class="gym-youtube-link"
                 aria-label="Watch ${ex.name} demonstration on YouTube (opens in new tab)">
                ▶ Watch a demonstration
              </a>
            </div>
          ` : ""}

          <!-- Done button -->
          <button class="btn ${isDone ? "btn-secondary" : "btn-primary"} btn-full gym-done-btn"
                  data-exercise-id="${ex.id}"
                  data-session="${sessionId}"
                  data-exercise="${ex.name}">
            ${isDone ? "✓ Marked as done" : "Done — next exercise"}
          </button>

        </div>
      ` : ""}
    </div>
  `;
}

// ── Section group renderer ────────────────────────────────────────────────────

function renderSessionCards(session) {
  const sections = [
    { key: "warmup",   label: "Warm-up"     },
    { key: "main",     label: "Main session" },
    { key: "cooldown", label: "Cool-down"    },
  ];
  const total = session.exercises.length;
  const done  = session.exercises.filter(e => completedIds.has(e.id)).length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return `
    <div class="gym-session-block" id="session-block-${session.id}">

      <div class="gym-session-header">
        <div class="gym-session-title-row">
          <h2 class="gym-session-title">${session.title}</h2>
          <span class="gym-session-duration">${session.duration}</span>
        </div>
        <p class="gym-session-subtitle">${session.subtitle}</p>
      </div>

      <!-- Coach line -->
      <div class="card card-coach gym-coach-line">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${session.coachLine}</p>
      </div>

      <!-- Progress bar -->
      <div class="gym-progress-bar-wrap">
        <div class="gym-progress-bar" role="progressbar"
             aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
             aria-label="${done} of ${total} exercises done">
          <div class="gym-progress-fill" style="width: ${pct}%"></div>
        </div>
        <span class="gym-progress-label">${done} of ${total}</span>
      </div>

      <!-- Exercise cards by section -->
      ${sections.map(sec => {
        const exs = session.exercises.filter(e => e.section === sec.key);
        if (exs.length === 0) return "";
        return `
          <h3 class="gym-block-heading">${sec.label}</h3>
          <div class="gym-cards-group">
            ${exs.map(e => renderExerciseCard(e, session.id)).join("")}
          </div>`;
      }).join("")}

    </div>
  `;
}

// ── Post-session flow ─────────────────────────────────────────────────────────

const WELLBEING_PROMPTS = [
  "How do you feel about yourself after that?",
  "What did you notice about your body today?",
  "What are you taking away from this session?",
  "How does it feel to have shown up today?",
  "Is there anything your body is telling you right now?"
];

function renderPostSession(session) {
  if (postSessionState === "intel") {
    // Show adaptive intel for main exercises only
    const mainExs = session.exercises.filter(e => e.section === "main" && e.logWeight);
    return `
      <div class="gym-post-session" id="gym-post-intel">
        <div class="card card-coach gym-coach-line">
          <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text">Session done. Before you go — how did each exercise feel? This helps me adapt things for next time.</p>
        </div>
        ${mainExs.map(e => `
          <div class="gym-intel-card card">
            <p class="gym-intel-name">${e.name}</p>
            <div class="gym-intel-feel">
              <span class="gym-intel-label">How did it feel?</span>
              <div class="gym-intel-chips" data-exercise="${e.name}" data-type="feel">
                <button class="chip chip--sm gym-intel-chip" data-value="easy" data-exercise="${e.name}" data-type="feel">Too easy</button>
                <button class="chip chip--sm gym-intel-chip" data-value="right" data-exercise="${e.name}" data-type="feel">About right</button>
                <button class="chip chip--sm gym-intel-chip" data-value="hard" data-exercise="${e.name}" data-type="feel">Too hard</button>
              </div>
            </div>
            <div class="gym-intel-pain">
              <span class="gym-intel-label">Any pain during this?</span>
              <div class="gym-intel-chips" data-exercise="${e.name}" data-type="pain">
                <button class="chip chip--sm gym-intel-chip" data-value="none"  data-exercise="${e.name}" data-type="pain">None</button>
                <button class="chip chip--sm gym-intel-chip" data-value="mild"  data-exercise="${e.name}" data-type="pain">Mild</button>
                <button class="chip chip--sm gym-intel-chip" data-value="sharp" data-exercise="${e.name}" data-type="pain">Sharp</button>
              </div>
            </div>
          </div>
        `).join("")}
        <button class="btn btn-primary btn-full" id="gym-intel-done-btn">
          Done — one more thing
        </button>
      </div>`;
  }

  if (postSessionState === "wellbeing") {
    const week  = store.get("gymProgrammeWeek") || 1;
    const dayIdx = new Date().getDay();
    const prompt = WELLBEING_PROMPTS[(week + dayIdx) % WELLBEING_PROMPTS.length];
    return `
      <div class="gym-post-session" id="gym-post-wellbeing">
        <div class="card card-coach gym-coach-line">
          <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text">${prompt}</p>
        </div>
        <div class="card">
          <label class="gym-log-label" for="gym-wellbeing-input">
            You can write anything here, or skip.
          </label>
          <textarea id="gym-wellbeing-input"
                    class="gym-wellbeing-input"
                    placeholder="Whatever comes to mind..."
                    rows="4"
                    aria-label="Your reflection"></textarea>
        </div>
        <button class="btn btn-primary btn-full" id="gym-wellbeing-save-btn">
          Save and finish
        </button>
        <button class="btn btn-ghost btn-full" id="gym-wellbeing-skip-btn"
                style="margin-top: var(--space-2);">
          Skip
        </button>
      </div>`;
  }

  if (postSessionState === "done") {
    return `
      <div class="gym-post-session gym-post-done" id="gym-post-done">
        <div class="card card-coach gym-coach-line">
          <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
          <p class="coach-message-text">That is a session in the books. I will remember what you told me and use it next time. Well done.</p>
        </div>
        <button class="btn btn-secondary btn-full" onclick="router.navigate('settings')">
          Back to Settings
        </button>
      </div>`;
  }

  return "";
}

// ── Main render ───────────────────────────────────────────────────────────────

export function render() {
  activeSessionId = store.get("gymProgrammeSession") || "A";
  const activeWeek = store.get("gymProgrammeWeek") || 1;
  const session = PROGRAMME.sessions.find(s => s.id === activeSessionId)
    || PROGRAMME.sessions[0];

  // Restore completed set from store
  const stored = store.get("gymCompletedExercises_" + activeSessionId);
  if (stored && Array.isArray(stored)) {
    completedIds = new Set(stored);
  }

  const allDone = session.exercises.every(e => completedIds.has(e.id));

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
          <button class="gym-session-tab ${s.id === activeSessionId ? "active" : ""}"
                  role="tab"
                  aria-selected="${s.id === activeSessionId}"
                  data-session="${s.id}">${s.title}</button>
        `).join("")}
      </div>

      ${postSessionState ? renderPostSession(session) : renderSessionCards(session)}

      ${allDone && !postSessionState ? `
        <button class="btn btn-primary btn-full gym-finish-btn"
                style="margin-top: var(--space-4);">
          Finish session
        </button>
      ` : ""}

    </div>
  `;
}

// ── Timer helpers ─────────────────────────────────────────────────────────────

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + ":" + String(s).padStart(2, "0");
}

function startTimer(exerciseId, duration, safeId) {
  if (activeTimerId) clearInterval(activeTimerId);
  timerExerciseId = exerciseId;
  timerRemaining  = duration;

  const display = document.getElementById("timer-display-" + safeId);
  const btn     = document.getElementById("timer-btn-" + safeId);

  activeTimerId = setInterval(() => {
    timerRemaining--;
    if (display) display.textContent = formatTime(timerRemaining);
    if (timerRemaining <= 0) {
      clearInterval(activeTimerId);
      activeTimerId = null;
      if (btn) btn.textContent = "Done";
      if (display) display.textContent = "0:00";
    }
  }, 1000);

  if (btn) btn.textContent = "⏱ " + formatTime(timerRemaining);
}

function rerender() {
  const view = document.querySelector(".gym-programme-view");
  if (!view) return;
  const session = PROGRAMME.sessions.find(s => s.id === activeSessionId);
  if (!session) return;

  // Rebuild just the content inside the view
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    wireEvents();
  }
}

// ── Events ────────────────────────────────────────────────────────────────────

function wireEvents() {
  const view = document.querySelector(".gym-programme-view");
  if (!view) return;

  view.addEventListener("click", e => {

    // ── Session tab ──────────────────────────────────────────
    const tab = e.target.closest(".gym-session-tab");
    if (tab) {
      const sid = tab.dataset.session;
      if (!sid || sid === activeSessionId) return;
      activeSessionId  = sid;
      expandedId       = null;
      postSessionState = null;
      completedIds     = new Set();
      store.set("gymProgrammeSession", sid);
      rerender();
      return;
    }

    // ── Exercise card expand/collapse ─────────────────────────
    const expandBtn = e.target.closest(".gym-card-summary");
    if (expandBtn) {
      const eid = expandBtn.dataset.expand;
      expandedId = expandedId === eid ? null : eid;
      rerender();
      // Scroll to card
      setTimeout(() => {
        const card = document.getElementById("gymcard-" + eid + "_" + activeSessionId);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return;
    }

    // ── Timer button ─────────────────────────────────────────
    const timerBtn = e.target.closest(".gym-timer-btn");
    if (timerBtn) {
      const eid      = timerBtn.dataset.exerciseId;
      const duration = parseInt(timerBtn.dataset.duration);
      const safeId   = eid + "_" + activeSessionId;
      if (activeTimerId && timerExerciseId === eid) {
        clearInterval(activeTimerId);
        activeTimerId = null;
        timerBtn.textContent = "▶ Resume";
      } else {
        startTimer(eid, timerRemaining > 0 && timerExerciseId === eid ? timerRemaining : duration, safeId);
      }
      return;
    }

    // ── Save log button ───────────────────────────────────────
    const saveBtn = e.target.closest(".gym-save-btn");
    if (saveBtn) {
      const inputId  = saveBtn.dataset.input;
      const sid      = saveBtn.dataset.session;
      const exName   = saveBtn.dataset.exercise;
      const input    = document.getElementById(inputId);
      if (!input || !sid || !exName) return;
      const value = input.value.trim();
      if (!value) return;
      saveLog(sid, exName, value);
      saveBtn.textContent = "Saved ✓";
      setTimeout(() => { saveBtn.textContent = "Save"; }, 1500);
      return;
    }

    // ── Done button ───────────────────────────────────────────
    const doneBtn = e.target.closest(".gym-done-btn");
    if (doneBtn) {
      const eid    = doneBtn.dataset.exerciseId;
      const sid    = doneBtn.dataset.session;
      const exName = doneBtn.dataset.exercise;

      // Save log if there's a value in the input
      const safeId = eid + "_" + sid;
      const logInput = document.getElementById("log-" + safeId);
      if (logInput && logInput.value.trim()) {
        saveLog(sid, exName, logInput.value.trim());
      }

      completedIds.add(eid);
      store.set("gymCompletedExercises_" + sid, [...completedIds]);

      // Move to next uncompleted exercise
      const session = PROGRAMME.sessions.find(s => s.id === sid);
      const nextEx  = session?.exercises.find(e => !completedIds.has(e.id));
      expandedId    = nextEx ? nextEx.id : null;

      rerender();
      return;
    }

    // ── Finish session button ─────────────────────────────────
    const finishBtn = e.target.closest(".gym-finish-btn");
    if (finishBtn) {
      if (activeTimerId) clearInterval(activeTimerId);
      postSessionState = "intel";
      intelAnswers     = {};
      rerender();
      return;
    }

    // ── Intel chips ───────────────────────────────────────────
    const intelChip = e.target.closest(".gym-intel-chip");
    if (intelChip) {
      const exName = intelChip.dataset.exercise;
      const type   = intelChip.dataset.type;
      const value  = intelChip.dataset.value;
      if (!intelAnswers[exName]) intelAnswers[exName] = {};
      intelAnswers[exName][type] = value;
      // Toggle chip selected state in place
      const group = intelChip.closest(".gym-intel-chips");
      group?.querySelectorAll(".gym-intel-chip").forEach(c => {
        c.classList.toggle("selected", c.dataset.value === value);
        c.setAttribute("aria-pressed", c.dataset.value === value);
      });
      return;
    }

    // ── Intel done ────────────────────────────────────────────
    const intelDoneBtn = e.target.closest("#gym-intel-done-btn");
    if (intelDoneBtn) {
      // Save intel to store
      Object.entries(intelAnswers).forEach(([exName, answers]) => {
        store.set(intelKey(activeSessionId, exName), JSON.stringify(answers));
      });
      postSessionState = "wellbeing";
      rerender();
      return;
    }

    // ── Wellbeing save ────────────────────────────────────────
    const wellbeingSave = e.target.closest("#gym-wellbeing-save-btn");
    if (wellbeingSave) {
      const textarea = document.getElementById("gym-wellbeing-input");
      const value = textarea?.value.trim();
      if (value) {
        const dateKey = new Date().toISOString().split("T")[0];
        store.set("gymWellbeing_" + dateKey, value);
      }
      completedIds = new Set();
      store.set("gymCompletedExercises_" + activeSessionId, []);
      postSessionState = "done";
      rerender();
      return;
    }

    // ── Wellbeing skip ────────────────────────────────────────
    const wellbeingSkip = e.target.closest("#gym-wellbeing-skip-btn");
    if (wellbeingSkip) {
      completedIds = new Set();
      store.set("gymCompletedExercises_" + activeSessionId, []);
      postSessionState = "done";
      rerender();
      return;
    }
  });
}

export function onMount() {
  postSessionState = null;
  intelAnswers     = {};
  if (activeTimerId) clearInterval(activeTimerId);
  wireEvents();
}
