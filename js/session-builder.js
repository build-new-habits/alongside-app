/**
 * js/session-builder.js - Generative Session Engine
 *
 * 11 Aug 2026 v6
 *
 * v6 - PT-19. Every session now opens with a pulse-raiser unless there is
 *   a named reason it should not, and the reason is spoken. Three
 *   compounding causes found: (1) "cardio-warmup" was listed last of four
 *   categories with three slots available, so the selection loop broke
 *   before reaching it -- no generated session contained one, at home OR
 *   in a fully-equipped gym; (2) all four cardio-warmup entries required a
 *   machine, so the category was structurally empty without one; (3) two
 *   of those four carried equipment tags ("bike", "cross-trainer") absent
 *   from equipment.js's vocabulary, unreachable even in a gym. Fixed with
 *   a reserved first warm-up slot, five tiered bodyweight pulse-raisers,
 *   corrected tags, and a machine preference when one is available.
 *
 * 11 Aug 2026 v5
 *
 * v5 — CON-2. Equipment matching now resolves through equipment-map.js,
 *   the same fix applied to filterByEquipment() in exercises/index.js.
 *   This file's own equipSet was built straight from the user's ticked
 *   ids, so an exercise tagged "dumbbell" never matched a user holding
 *   "dumbbells-medium". Third instance of this file needing a fix that
 *   was already made elsewhere — CON-6 retires its private pool entirely.
 *
 * v4 — PT-11. Difficulty ceiling applied in _filterCandidates(). This
 *   file's private EXERCISE_POOL never filtered on fitness, so the
 *   "Cardio, Core & Strength" door handed a sedentary beginner and a
 *   gym-literate lifter the identical pool — the WOW-2 fix reached
 *   workoutGenerator.js but not here. Uses the existing difficultyLevel
 *   field, which was written on all 65 exercises and read nowhere.
 *   Warmup/cooldown exempt so the warmup safety floor cannot be starved.
 *
 * 10 Aug 2026 v3
 *
 * v3 -- Bodyweight-only lower-body main content added overnight (Claude,
 *   autonomous session, following the on-device Phase 1 finding that a
 *   no-equipment Lower Body session produced 0 main exercises). New
 *   entries: sb-hh-04 (Bodyweight good morning, hip-hinge), sb-sl-03
 *   (Bodyweight reverse lunge, single-leg), sb-sq-03 (Bodyweight squat,
 *   squat-pattern), sb-li-02 (Wall sit, leg-isolation) -- all
 *   equipment: [], matching the existing exercise-entry format and
 *   contraindication conventions exactly. Confirmed via test: Lower
 *   Body with no equipment now returns 4 main exercises, was 0. Full
 *   7-session-type regression re-run clean afterward, no crashes, no
 *   warmup-floor violations. Deliberately scoped narrow -- only the
 *   four categories with a confirmed real gap, not a general content
 *   audit of the whole pool.
 *
 * 05 Aug 2026 v2
 *
 * v2 -- Gym Session Builder Phase 1 (blueprint
 *   alongside_blueprint_gym-session-builder-phase1_05aug2026_v2.md).
 *   Three additions, all built to reuse selectFromCategories()'s
 *   existing filtering (equipment, contraindications) rather than
 *   duplicating it:
 *   1. ALLOCATION_PRESETS -- proportional session control (Graeme:
 *      "how much of my gym session I spent doing the different
 *      elements"). Scales EXERCISE_COUNT per preset, with a hard
 *      floor of 1 on warmup no matter what -- the safety rule (never
 *      skip a warmup) holds structurally, not just by convention.
 *   2. buildCandidatePools() -- exposes the filtered-candidate step
 *      selectFromCategories() already did internally, now callable on
 *      its own, wider than the auto-pick count, each item flagged
 *      recommended:true/false so the UI can pre-check a sensible
 *      starting selection for "coach recommends" mode while "build
 *      your own" shows the identical list unchecked -- one function,
 *      two presentations, not two implementations.
 *   3. buildSessionFromSelection() -- takes exercise IDs a person
 *      actually chose and assembles the same session shape
 *      buildSession() produces, so gym-programme.js renders either
 *      one identically. Same hard warmup floor as above: if a chosen
 *      selection ends up with zero warmup exercises, one is added
 *      automatically rather than allowing a genuinely warmup-free
 *      session to ship.
 *
 * 21 May 2026 v1
 *
 * Builds a bespoke gym session from four inputs:
 *   1. Session type (Glute Focus, Upper Body, Lower Body, Full Body, Core, Cardio, Mobility)
 *   2. Duration (15 / 30 / 45 / 60 minutes)
 *   3. Equipment (from store, overridable per session)
 *   4. Conditions and pain today (from store, current check-in)
 *
 * Returns an object matching PROGRAMME.sessions[0] schema exactly,
 * so gym-programme.js renders it without modification.
 *
 * This is NOT AI generation. It is a structured selection engine.
 * Templates define which exercise categories belong in each section.
 * The engine selects actual exercises from the database at runtime.
 *
 * Spec: alongside_session_builder_spec_17may2026_v1.docx
 */

import { store } from "./store.js";
import { resolveEquipment, exerciseIsAvailable } from "./data/equipment-map.js";

// ── Allocation presets (05 Aug 2026) ──────────────────────────────────────────
// Scales EXERCISE_COUNT's warmup/main/cooldown split. Warmup always floors at
// 1 regardless of preset -- this is the safety rule, not a suggestion.
export const ALLOCATION_PRESETS = [
  { id: "balanced", label: "Balanced",        description: "The standard mix.",                     warmupMult: 1,   mainMult: 1,   cooldownMult: 1   },
  { id: "strength", label: "Mostly strength",  description: "Less warm-up and stretching, more work.", warmupMult: 0.6, mainMult: 1.3, cooldownMult: 0.7 },
  { id: "mobility", label: "Mostly mobility",  description: "More warm-up and stretching, less load.", warmupMult: 1.5, mainMult: 0.7, cooldownMult: 1.4 }
];

function _applyPreset(counts, presetId) {
  const preset = ALLOCATION_PRESETS.find(p => p.id === presetId) || ALLOCATION_PRESETS[0];
  return {
    warmup:   Math.max(1, Math.round(counts.warmup   * preset.warmupMult)),
    main:     Math.max(1, Math.round(counts.main     * preset.mainMult)),
    cooldown: Math.max(1, Math.round(counts.cooldown * preset.cooldownMult))
  };
}

// ── Session type definitions ──────────────────────────────────────────────────

export const SESSION_TYPES = [
  {
    id:          "glute",
    label:       "Glute Focus",
    icon:        "🍑",
    description: "Hip hinge, bridges, single-leg work. Built around glute activation.",
    warmupCategories:   ["activation", "hip-mobility", "cardio-warmup"],
    mainCategories:     ["hip-hinge", "bridge", "single-leg", "glute-isolation"],
    cooldownCategories: ["hip-flexor-stretch", "glute-stretch", "child-pose"]
  },
  {
    id:          "upper",
    label:       "Upper Body",
    icon:        "💪",
    description: "Push and pull. Shoulder, chest, back, arms.",
    warmupCategories:   ["thoracic-mobility", "shoulder-warmup", "band-warmup", "cardio-warmup"],
    mainCategories:     ["horizontal-pull", "horizontal-push", "vertical-pull", "shoulder-isolation"],
    cooldownCategories: ["chest-stretch", "lat-stretch", "thread-needle"]
  },
  {
    id:          "lower",
    label:       "Lower Body",
    icon:        "🦵",
    description: "Squat, hinge, single-leg. Quads, hamstrings, glutes.",
    warmupCategories:   ["activation", "hip-mobility", "ankle-mobility", "cardio-warmup"],
    mainCategories:     ["squat-pattern", "hip-hinge", "single-leg", "leg-isolation"],
    cooldownCategories: ["hip-flexor-stretch", "hamstring-stretch", "figure-4"]
  },
  {
    id:          "full",
    label:       "Full Body",
    icon:        "⚡",
    description: "Push, pull, squat, hinge. Every major pattern in one session.",
    warmupCategories:   ["activation", "hip-mobility", "thoracic-mobility", "cardio-warmup"],
    mainCategories:     ["squat-pattern", "hip-hinge", "horizontal-pull", "horizontal-push", "core-stability"],
    cooldownCategories: ["hip-flexor-stretch", "chest-stretch", "child-pose"]
  },
  {
    id:          "core",
    label:       "Core",
    icon:        "🎯",
    description: "Anti-extension, anti-rotation, anti-lateral. Real core work.",
    warmupCategories:   ["cardio-warmup", "breathing-warmup", "cat-cow"],
    mainCategories:     ["anti-extension", "anti-rotation", "anti-lateral"],
    cooldownCategories: ["child-pose", "supine-rotation"]
  },
  {
    id:          "cardio",
    label:       "Cardio",
    icon:        "🏃",
    description: "Conditioning and cardiovascular work. No heavy loading.",
    warmupCategories:   ["lower-mobility"],
    mainCategories:     ["conditioning", "interval"],
    cooldownCategories: ["static-stretch", "breathing-cool"]
  },
  {
    id:          "mobility",
    label:       "Mobility",
    icon:        "🌿",
    description: "Hip, thoracic, ankle, shoulder. Active range of motion.",
    warmupCategories:   ["breathing-warmup", "cat-cow"],
    mainCategories:     ["hip-mobility", "thoracic-mobility", "ankle-mobility", "shoulder-mobility"],
    cooldownCategories: ["deep-stretch"]
  }
];

// ── Exercise pool by category ─────────────────────────────────────────────────
// Each exercise: { id, name, section, category, sets, reps, tempo, rest,
//                  description, cues, youtube, recommended?, logWeight?,
//                  duration?, equipment[], contraindications[], difficultyLevel }

const EXERCISE_POOL = [

  // CARDIO WARMUP (05 Aug 2026) — real content for the gap Graeme flagged:
  // no cardio-machine warmup option existed anywhere in a gym session.
  // Deliberately gentle/low-intensity — this is a warmup, not the workout.
  { id: "sb-cwu-01", name: "Stationary bike, easy spin", section: "warmup", category: "cardio-warmup",
    sets: 1, tempo: "Easy, conversational pace", rest: "0s", difficultyLevel: 1, duration: 300,
    description: "5 minutes on a stationary bike at an easy, conversational pace — enough to raise your heart rate and warm the joints, not to tire you out before the real work.",
    cues: ["You should be able to talk normally", "Light resistance — this is a warmup, not the session", "Focus on smooth, even pedalling"],
    youtube: "stationary bike warm up before weights",
    equipment: ["exercise-bike"], contraindications: ["knee-acute"] },

  { id: "sb-cwu-02", name: "Treadmill, easy walk", section: "warmup", category: "cardio-warmup",
    sets: 1, tempo: "Brisk walk", rest: "0s", difficultyLevel: 1, duration: 300,
    description: "5 minutes walking at a brisk but comfortable pace, flat or a slight incline — gets blood moving to the legs and hips before loading them.",
    cues: ["Brisk, not a jog", "Arms swinging naturally", "Good posture, not hunched over the console"],
    youtube: "treadmill walk warm up before gym",
    equipment: ["treadmill"], contraindications: [] },

  { id: "sb-cwu-03", name: "Cross trainer, easy pace", section: "warmup", category: "cardio-warmup",
    sets: 1, tempo: "Easy, full range", rest: "0s", difficultyLevel: 1, duration: 300,
    description: "5 minutes on the cross trainer at an easy pace, using the full range of motion — low-impact, warms the whole body including the arms.",
    cues: ["Full, smooth range of motion, not short choppy steps", "Light resistance", "Let the handles move naturally with your stride"],
    youtube: "cross trainer elliptical warm up",
    equipment: ["elliptical"], contraindications: ["shoulder-acute"] },

  // BODYWEIGHT PULSE-RAISERS (11 Aug 2026, PT-19) — the reason no home
  // session ever opened with cardio: all four cardio-warmup entries needed a
  // machine, so the category was structurally empty without a gym.
  //
  // Tiered by difficultyLevel so the pulse-raiser scales with the person
  // rather than being one intensity. A deconditioned beginner marches; a
  // fitter person gets jacks or high knees. Burpees are deliberately NOT a
  // warmup at any tier — they are a main-session conditioning movement, and
  // asking someone to open with them is how a warmup becomes the reason
  // somebody stops coming.

  { id: "sb-cwu-05", name: "Marching on the spot", section: "warmup", category: "cardio-warmup",
    sets: 1, tempo: "Steady, easy", rest: "0s", difficultyLevel: 1, duration: 180,
    description: "Three minutes marching on the spot, lifting each knee to hip height and swinging the arms. The gentlest way to raise your heart rate and warm the hips before anything else.",
    cues: ["Knees to hip height, no higher", "Let your arms swing naturally", "You should be able to hold a conversation"],
    youtube: "marching on the spot warm up beginners",
    equipment: [], contraindications: [] },

  { id: "sb-cwu-06", name: "Jog on the spot", section: "warmup", category: "cardio-warmup",
    sets: 1, tempo: "Easy, conversational", rest: "0s", difficultyLevel: 2, duration: 180,
    description: "Three minutes of light jogging on the spot, landing softly on the balls of your feet. Raises the pulse and wakes up the calves and ankles.",
    cues: ["Land softly — you should barely hear your feet", "Stay light, this is not a sprint", "Breathing faster is fine, gasping is not"],
    youtube: "jog on the spot warm up technique",
    equipment: [], contraindications: ["knee-acute", "ankle-acute"] },

  { id: "sb-cwu-07", name: "Step-ups on a stair", section: "warmup", category: "cardio-warmup",
    sets: 1, tempo: "Steady, controlled", rest: "0s", difficultyLevel: 2, duration: 180,
    description: "Three minutes stepping up and down on the bottom stair or a low step, alternating your leading leg every thirty seconds or so. Low impact, raises the pulse and warms the legs at the same time.",
    cues: ["Whole foot on the step, not just the toes", "Change your leading leg regularly", "Steady rhythm rather than rushing"],
    youtube: "step up warm up stairs low impact",
    equipment: [], contraindications: ["knee-acute"] },

  { id: "sb-cwu-08", name: "Jumping jacks", section: "warmup", category: "cardio-warmup",
    sets: 2, reps: "30 seconds", rest: "30s", tempo: "Steady", difficultyLevel: 3, duration: 120,
    description: "Two rounds of thirty seconds. Jump the feet wide as the arms sweep overhead, then back together. Raises the heart rate quickly and warms the shoulders as well as the legs.",
    cues: ["Land with soft knees, not locked out", "Full arm sweep — all the way overhead", "Step it out instead of jumping if that suits you better today"],
    youtube: "jumping jacks warm up proper form",
    equipment: [], contraindications: ["knee-acute", "ankle-acute", "lower-back-acute", "shoulder-acute"] },

  { id: "sb-cwu-09", name: "High knees", section: "warmup", category: "cardio-warmup",
    sets: 2, reps: "30 seconds", rest: "30s", tempo: "Quick but controlled", difficultyLevel: 4, duration: 120,
    description: "Two rounds of thirty seconds driving the knees up towards hip height at pace, staying tall through the chest. The most demanding of the warm-up options — it raises the pulse fast.",
    cues: ["Stay tall — do not lean back", "Land on the balls of your feet, softly", "Pace it so you could keep going for a third round if asked"],
    youtube: "high knees warm up running drill",
    equipment: [], contraindications: ["knee-acute", "ankle-acute", "hip-acute", "lower-back-acute"] },

  { id: "sb-cwu-04", name: "Rowing machine, easy pace", section: "warmup", category: "cardio-warmup",
    sets: 1, tempo: "Easy, technique-focused", rest: "0s", difficultyLevel: 1, duration: 240,
    description: "4 minutes of easy rowing, focused on technique rather than pace — legs push, then lean back, then pull. Warms the whole posterior chain.",
    cues: ["Legs drive first, arms pull last", "Don't rush the return", "Light resistance, focus on form"],
    youtube: "rowing machine technique warm up",
    equipment: ["rowing-machine"], contraindications: ["lower-back-acute", "shoulder-acute"] },

  // ACTIVATION
  { id: "sb-act-01", name: "Glute bridge", section: "warmup", category: "activation",
    sets: 2, reps: "12", tempo: "2-1-2", rest: "30s", difficultyLevel: 1,
    description: "Lie on your back, knees bent, feet flat. Drive through your heels to lift your hips until your body forms a straight line. Squeeze the glutes at the top.",
    cues: ["Drive through your heels", "Squeeze glutes hard at the top", "Keep your core braced"],
    youtube: "glute bridge activation technique",
    equipment: [], contraindications: ["lower-back-acute", "hamstring-acute"] },

  { id: "sb-act-02", name: "Clamshell", section: "warmup", category: "activation",
    sets: 2, reps: "15 each side", tempo: "2-1-2", rest: "20s", difficultyLevel: 1,
    description: "Lie on your side, knees bent at 45 degrees. Keeping feet together, rotate the top knee upward. Your pelvis should not move.",
    cues: ["Pelvis stays completely still", "Movement from the outer hip only", "Slow on the return"],
    youtube: "clamshell glute medius exercise",
    equipment: [], contraindications: ["hip-acute"] },

  { id: "sb-act-03", name: "Banded monster walk", section: "warmup", category: "activation",
    sets: 2, reps: "20 steps each way", tempo: "Controlled", rest: "30s", difficultyLevel: 1,
    description: "Band just above knees. Slight squat position. Walk sideways, keeping tension in the band and hips level.",
    cues: ["Stay in the squat — do not stand up between steps", "Constant tension in the band", "Toes forward throughout"],
    youtube: "banded monster walk glute activation",
    equipment: ["resistance-bands"], contraindications: ["hip-acute", "knee-acute"] },

  // HIP MOBILITY
  { id: "sb-hip-01", name: "Hip 90/90 stretch", section: "warmup", category: "hip-mobility",
    sets: 2, reps: "60s each side", tempo: "Hold", rest: "15s", difficultyLevel: 1, duration: 60,
    description: "Sit with both legs bent at 90 degrees — one in front, one to the side. Sit tall and lean gently forward over the front shin.",
    cues: ["Sit as tall as you can before leaning", "The stretch is in the outer hip of the front leg", "Let gravity do the work"],
    youtube: "90 90 hip stretch piriformis",
    equipment: [], contraindications: ["hip-acute", "knee-acute"] },

  { id: "sb-hip-02", name: "Hip flexor stretch", section: "warmup", category: "hip-mobility",
    sets: 2, reps: "45s each side", tempo: "Hold", rest: "15s", difficultyLevel: 1, duration: 45,
    description: "Half-kneeling. Rear knee on the floor. Shift weight forward until you feel a stretch in the front of the rear hip.",
    cues: ["Tuck your tailbone slightly", "Chest tall", "Squeeze the rear glute to deepen"],
    youtube: "kneeling hip flexor stretch technique",
    equipment: [], contraindications: ["hip-acute", "knee-acute"] },

  { id: "sb-hip-03", name: "World's greatest stretch", section: "warmup", category: "hip-mobility",
    sets: 2, reps: "5 each side", tempo: "Slow", rest: "15s", difficultyLevel: 2,
    description: "From a lunge with right foot forward, place right hand beside foot. Rotate left arm toward ceiling. Return and repeat.",
    cues: ["Keep the back knee off the floor", "Rotation from the mid-back", "Move slowly — this is warm-up"],
    youtube: "world's greatest stretch warm up",
    equipment: [], contraindications: ["lower-back-acute", "hip-acute"] },

  // THORACIC MOBILITY
  { id: "sb-thor-01", name: "Thoracic rotation", section: "warmup", category: "thoracic-mobility",
    sets: 2, reps: "10 each side", tempo: "Slow", rest: "15s", difficultyLevel: 1,
    description: "Sit tall. Hands behind head. Rotate upper body to one side as far as comfortable. Lower back stays still.",
    cues: ["Movement from upper back only", "Lower back stays forward", "Breathe into the rotation"],
    youtube: "seated thoracic rotation mobility",
    equipment: [], contraindications: ["upper-back-acute"] },

  { id: "sb-thor-02", name: "Cat-cow", section: "warmup", category: "cat-cow",
    sets: 2, reps: "10 slow", tempo: "Breath-led", rest: "15s", difficultyLevel: 1,
    description: "On hands and knees. Breathe in as you drop your belly and lift your head. Breathe out as you round your back and tuck your chin.",
    cues: ["Move with your breath — do not rush", "Feel the whole spine moving", "Arms straight throughout"],
    youtube: "cat cow stretch lower back mobility",
    equipment: [], contraindications: [] },

  // SHOULDER WARMUP
  { id: "sb-sh-01", name: "Band pull-aparts", section: "warmup", category: "shoulder-warmup",
    sets: 2, reps: "15", tempo: "Controlled", rest: "15s", difficultyLevel: 1,
    description: "Hold a resistance band at chest height, arms straight. Pull the band apart by drawing hands outward until it touches your chest.",
    cues: ["Keep arms straight", "Lead with thumbs turning outward", "Slow and controlled"],
    youtube: "band pull aparts shoulder warm up",
    equipment: ["resistance-bands"], contraindications: ["shoulder-acute"] },

  { id: "sb-sh-02", name: "Shoulder circles", section: "warmup", category: "shoulder-warmup",
    sets: 2, reps: "10 each direction", tempo: "Slow", rest: "0s", difficultyLevel: 1,
    description: "Stand or sit tall. Roll both shoulders forward for 10 slow circles, then backward for 10.",
    cues: ["Move at the shoulder, not just the arms", "Keep your neck long", "Full range of motion"],
    youtube: "shoulder circles warm up mobility",
    equipment: [], contraindications: ["shoulder-acute"] },

  // ANKLE MOBILITY
  { id: "sb-ank-01", name: "Ankle circles", section: "warmup", category: "ankle-mobility",
    sets: 2, reps: "10 each direction, each foot", tempo: "Slow", rest: "0s", difficultyLevel: 1,
    description: "Seated or standing on one leg. Draw full circles with your foot — both directions.",
    cues: ["Move at the ankle, not the knee", "Full range of motion", "Slow and deliberate"],
    youtube: "ankle circles mobility warm up",
    equipment: [], contraindications: ["ankle-acute"] },

  { id: "sb-ank-02", name: "Banded ankle dorsiflexion", section: "warmup", category: "ankle-mobility",
    sets: 2, reps: "10 each foot", tempo: "Slow", rest: "0s", difficultyLevel: 1,
    description: "Band anchored low behind you, around your ankle. Step forward. Drive your knee over your toes while keeping your heel down. Resistance improves joint mobility.",
    cues: ["Heel stays on the floor", "Drive the knee directly over the toes", "Feel the stretch at the back of the ankle"],
    youtube: "banded ankle dorsiflexion mobility",
    equipment: ["resistance-bands"], contraindications: ["ankle-acute"] },

  // BREATHING WARMUP
  { id: "sb-br-01", name: "Diaphragmatic breathing", section: "warmup", category: "breathing-warmup",
    sets: 1, reps: null, tempo: "Breath-led", rest: "0s", difficultyLevel: 1, duration: 60,
    description: "Lie on your back, knees bent. One hand on belly, one on chest. Breathe in — belly rises, chest stays still. Breathe out — belly falls.",
    cues: ["Belly moves first, not chest", "Exhale gently — do not force", "About 20% effort — this is not sucking in"],
    youtube: "diaphragmatic breathing core activation",
    equipment: [], contraindications: [] },

  // HIP HINGE (MAIN)
  { id: "sb-hh-01", name: "Romanian deadlift", section: "main", category: "hip-hinge",
    sets: 3, reps: "10", tempo: "3-0-2", rest: "75s", difficultyLevel: 2, logWeight: true,
    recommended: "Start at a weight where you can feel the hamstring stretch on every rep",
    description: "Stand holding dumbbells. With slight knee bend, hinge at hips and lower the weights down your legs until you feel a hamstring stretch. Drive hips forward to return.",
    cues: ["Push your hips back — not down", "Keep the weights close to your legs", "Stop before your back rounds", "Feel the hamstring stretch"],
    youtube: "romanian deadlift dumbbell technique",
    equipment: ["dumbbells"], contraindications: ["lower-back-acute", "hamstring-acute"] },

  { id: "sb-hh-02", name: "Cable pull-through", section: "main", category: "hip-hinge",
    sets: 3, reps: "12", tempo: "3-1-2", rest: "60s", difficultyLevel: 2, logWeight: true,
    recommended: "Light weight — focus on the hip hinge pattern",
    description: "Set cable to lowest position with a rope attachment. Stand facing away. Hinge at hips to let the rope pull back between your legs, then drive hips forward to stand.",
    cues: ["Push hips back — not knees forward", "Back stays flat throughout", "Power from glutes driving forward"],
    youtube: "cable pull through hip hinge tutorial",
    equipment: ["cable-machine"], contraindications: ["lower-back-acute"] },

  { id: "sb-hh-03", name: "Kettlebell swing", section: "main", category: "hip-hinge",
    sets: 3, reps: "15", tempo: "Explosive", rest: "60s", difficultyLevel: 2, logWeight: true,
    recommended: "Moderate weight — the swing is driven by the hips, not the arms",
    description: "Hinge to load the hips, then drive them explosively forward to swing the bell to chest height. It should feel like a hip thrust, not an arm raise.",
    cues: ["Hips drive the bell — arms just hold it", "Snap the hips at the top", "Back flat on the hinge", "Let the bell float at the top"],
    youtube: "kettlebell swing technique russian hip hinge",
    equipment: ["kettlebells"], contraindications: ["lower-back-acute", "hamstring-acute"] },

  // 05 Aug 2026 — bodyweight-only lower-body main content, found missing
  // during Gym Session Builder Phase 1 testing (confirmed: every existing
  // squat-pattern/hip-hinge/single-leg/leg-isolation exercise required
  // equipment; a no-equipment Lower Body session got 0 main exercises).
  { id: "sb-hh-04", name: "Bodyweight good morning", section: "main", category: "hip-hinge",
    sets: 3, reps: "12", tempo: "3-1-2", rest: "60s", difficultyLevel: 1,
    description: "Hands behind your head or crossed at your chest, soft bend in the knees. Hinge forward from the hips, keeping your back flat, until you feel a stretch in your hamstrings. Return by driving your hips forward.",
    cues: ["Hips move back, not down", "Back stays flat throughout — this is not a squat", "Feel it in the hamstrings, not the lower back"],
    youtube: "bodyweight good morning hip hinge",
    equipment: [], contraindications: ["lower-back-acute", "hamstring-acute"] },

  // BRIDGE
  { id: "sb-br-02", name: "Glute bridge — 3s hold", section: "main", category: "bridge",
    sets: 3, reps: "12", tempo: "1-3-1", rest: "45s", difficultyLevel: 1,
    description: "Standard glute bridge with a 3-second hold at the top. The hold is where the glute activation happens.",
    cues: ["Count 3 seconds — do not rush", "Squeeze hard at the top", "Drive through heels, not toes"],
    youtube: "glute bridge isometric hold technique",
    equipment: [], contraindications: ["lower-back-acute", "hamstring-acute"] },

  { id: "sb-br-03", name: "Hip thrust — barbell", section: "main", category: "bridge",
    sets: 3, reps: "10", tempo: "2-1-2", rest: "90s", difficultyLevel: 3, logWeight: true,
    recommended: "Moderate-heavy weight — this is your main glute strength movement",
    description: "Shoulders on a bench, barbell across hips. Drive hips up until your body forms a straight line from knees to shoulders. Squeeze hard at the top.",
    cues: ["Chin tucked — do not hyperextend the neck", "Drive hips straight up", "Squeeze the glutes hard at the top", "Control the lowering"],
    youtube: "barbell hip thrust technique tutorial",
    equipment: ["barbell", "bench"], contraindications: ["lower-back-acute", "hip-acute"] },

  { id: "sb-br-04", name: "Single-leg glute bridge", section: "main", category: "bridge",
    sets: 3, reps: "10 each side", tempo: "2-2-2", rest: "45s", difficultyLevel: 2,
    description: "Lie on your back, one knee bent with foot flat. Extend the other leg straight. Drive through the planted heel to lift hips. Hold 2 seconds.",
    cues: ["Level hips — the unsupported side will want to drop", "Squeeze the working glute", "2-second hold"],
    youtube: "single leg glute bridge technique",
    equipment: [], contraindications: ["lower-back-acute", "hamstring-acute"] },

  // SINGLE-LEG
  { id: "sb-sl-01", name: "Bulgarian split squat", section: "main", category: "single-leg",
    sets: 3, reps: "8 each side", tempo: "3-1-2", rest: "75s", difficultyLevel: 3, logWeight: true,
    recommended: "Bodyweight or light dumbbells — balance is the challenge first",
    description: "Stand a metre in front of a bench. Rear foot on bench. Lower until front thigh is roughly parallel, then drive back up through the front heel.",
    cues: ["Front knee over ankle", "Torso can lean forward slightly", "3 seconds down", "Balance first, then add weight"],
    youtube: "bulgarian split squat technique beginners",
    equipment: ["bench"], contraindications: ["knee-acute", "hip-acute"] },

  { id: "sb-sl-02", name: "Step-up", section: "main", category: "single-leg",
    sets: 3, reps: "10 each side", tempo: "2-1-2", rest: "60s", difficultyLevel: 2, logWeight: true,
    recommended: "Bodyweight or light dumbbells",
    description: "Stand in front of a box or step. Step up with one foot, drive through that heel to bring the other foot up. Step down slowly.",
    cues: ["Drive through the heel of the working leg", "The other leg just follows — do not push off it", "Full control on the step down"],
    youtube: "step up exercise dumbbell technique",
    equipment: ["box-or-step"], contraindications: ["knee-acute", "hip-acute"] },

  { id: "sb-sl-03", name: "Bodyweight reverse lunge", section: "main", category: "single-leg",
    sets: 3, reps: "10 each side", tempo: "2-1-2", rest: "60s", difficultyLevel: 1,
    description: "Step one foot back, lowering your back knee toward the floor. Both knees at roughly 90 degrees at the bottom. Push through your front foot to return to standing.",
    cues: ["Front knee tracks over your foot, not past it", "Torso stays upright", "Push through the whole front foot, not just the toes"],
    youtube: "reverse lunge bodyweight technique",
    equipment: [], contraindications: ["knee-acute", "hip-acute"] },

  // SQUAT PATTERN
  { id: "sb-sq-01", name: "Goblet squat", section: "main", category: "squat-pattern",
    sets: 3, reps: "10", tempo: "3-1-2", rest: "75s", difficultyLevel: 1, logWeight: true,
    recommended: "12-16kg dumbbell or kettlebell — heavier than you think",
    description: "Hold a dumbbell vertically at your chest. Feet shoulder-width, toes slightly out. Squat down keeping chest up and heels on the floor.",
    cues: ["Chest up — if your back rounds, squat less deep", "Elbows inside your knees at the bottom", "Drive through your full foot"],
    youtube: "goblet squat technique beginners",
    equipment: ["dumbbells"], contraindications: ["knee-acute", "lower-back-acute"] },

  { id: "sb-sq-02", name: "Barbell back squat", section: "main", category: "squat-pattern",
    sets: 4, reps: "6-8", tempo: "3-1-2", rest: "120s", difficultyLevel: 3, logWeight: true,
    recommended: "Work up to a challenging but controllable weight",
    description: "Bar on upper back. Feet shoulder-width, toes slightly out. Squat to parallel or below, then drive through your full foot to return.",
    cues: ["Brace your core hard before every rep", "Knees out over toes", "Chest stays up throughout", "Drive the floor away"],
    youtube: "barbell back squat technique tutorial",
    equipment: ["barbell", "squat-rack"], contraindications: ["lower-back-acute", "knee-acute"] },

  { id: "sb-sq-03", name: "Bodyweight squat", section: "main", category: "squat-pattern",
    sets: 3, reps: "15", tempo: "3-1-2", rest: "60s", difficultyLevel: 1,
    description: "Feet shoulder-width, toes slightly out. Squat down keeping chest up and heels on the floor, then drive back up.",
    cues: ["Chest up throughout", "Knees track over your toes", "Full range — go as low as feels controlled"],
    youtube: "bodyweight squat technique",
    equipment: [], contraindications: ["knee-acute", "lower-back-acute"] },

  // HORIZONTAL PULL
  { id: "sb-hp-01", name: "Seated cable row", section: "main", category: "horizontal-pull",
    sets: 3, reps: "12", tempo: "2-1-3", rest: "60s", difficultyLevel: 1, logWeight: true,
    recommended: "Comfortable weight with full control",
    description: "Sit at cable row machine, knees slightly bent. Pull to lower chest, squeezing shoulder blades together. Return slowly.",
    cues: ["Sit tall — do not lean back to get the weight moving", "Lead with elbows, not hands", "Squeeze shoulder blades at the end"],
    youtube: "seated cable row proper form",
    equipment: ["cable-machine"], contraindications: ["shoulder-acute"] },

  { id: "sb-hp-02", name: "Chest-supported dumbbell row", section: "main", category: "horizontal-pull",
    sets: 4, reps: "10", tempo: "2-1-3", rest: "75s", difficultyLevel: 2, logWeight: true,
    recommended: "Challenging weight — the chest support eliminates back cheating",
    description: "Set incline bench to 45 degrees. Lie face-down, dumbbells hanging. Row up toward your hips by driving elbows back. Chest stays on the bench.",
    cues: ["Chest on the bench throughout", "Drive elbows back and up", "Squeeze shoulder blades at the top"],
    youtube: "chest supported dumbbell row technique",
    equipment: ["dumbbells", "bench"], contraindications: ["shoulder-acute"] },

  // HORIZONTAL PUSH
  { id: "sb-hpu-01", name: "Dumbbell bench press", section: "main", category: "horizontal-push",
    sets: 3, reps: "10", tempo: "3-1-2", rest: "75s", difficultyLevel: 2, logWeight: true,
    recommended: "Moderate weight — lower slowly for full stimulus",
    description: "Lie on a bench, dumbbells at shoulder height. Press up and slightly together. Lower slowly.",
    cues: ["Elbows at 45 degrees — not flared wide", "3 seconds down", "Keep feet flat on the floor"],
    youtube: "dumbbell bench press technique",
    equipment: ["dumbbells", "bench"], contraindications: ["shoulder-acute"] },

  { id: "sb-hpu-02", name: "Push-up", section: "main", category: "horizontal-push",
    sets: 3, reps: "As many as possible with good form", tempo: "2-0-2", rest: "60s", difficultyLevel: 1,
    description: "Standard push-up. Hands shoulder-width, body in a straight line from head to heels. Lower chest to floor.",
    cues: ["Body stays in a straight line — no hip sag", "Elbows at 45 degrees", "Lower until chest nearly touches the floor", "Full lock-out at the top"],
    youtube: "perfect push up technique",
    equipment: [], contraindications: ["shoulder-acute", "wrist-elbow-acute"] },

  // VERTICAL PULL
  { id: "sb-vp-01", name: "Lat pulldown", section: "main", category: "vertical-pull",
    sets: 3, reps: "12", tempo: "2-1-3", rest: "60s", difficultyLevel: 1, logWeight: true,
    recommended: "Comfortable weight with full range of motion",
    description: "Sit at the lat pulldown machine, thighs under the pad. Take a wide grip. Pull the bar down to your upper chest by driving elbows down and back.",
    cues: ["Lean back 10-15 degrees — no more", "Drive elbows toward the floor", "Control the return — 3 seconds"],
    youtube: "lat pulldown wide grip proper form",
    equipment: ["cable-machine"], contraindications: ["shoulder-acute"] },

  // SHOULDER ISOLATION
  { id: "sb-si-01", name: "Dumbbell lateral raise", section: "main", category: "shoulder-isolation",
    sets: 3, reps: "15", tempo: "2-0-3", rest: "45s", difficultyLevel: 1, logWeight: true,
    recommended: "Lighter than you think — 3 seconds down every rep",
    description: "Stand with light dumbbells at sides. With slight elbow bend, raise both arms out to sides to shoulder height. Lower slowly.",
    cues: ["Lead with elbows, not hands", "Do not shrug your shoulders", "Go lighter than you expect", "3 seconds down"],
    youtube: "dumbbell lateral raise shoulder technique",
    equipment: ["dumbbells"], contraindications: ["shoulder-acute"] },

  // GLUTE ISOLATION
  { id: "sb-gi-01", name: "Cable kickback", section: "main", category: "glute-isolation",
    sets: 3, reps: "12 each side", tempo: "2-1-2", rest: "45s", difficultyLevel: 1, logWeight: true,
    recommended: "Light cable — feel the glute contract, not the hip flexor",
    description: "Ankle strap on one ankle, facing the cable machine. Drive leg straight back until glute is fully contracted. Upper body stays still.",
    cues: ["Upper body stays still", "Squeeze hard at the top", "Controlled movement — no swinging"],
    youtube: "cable glute kickback ankle strap technique",
    equipment: ["cable-machine"], contraindications: ["hip-acute"] },

  { id: "sb-gi-02", name: "Banded clamshell — loaded", section: "main", category: "glute-isolation",
    sets: 3, reps: "20 each side", tempo: "2-1-2", rest: "30s", difficultyLevel: 2,
    description: "Band just above knees. Lie on side, knees bent at 45 degrees. Rotate top knee up. Hold 1 second. Lower slowly.",
    cues: ["Pelvis stays still", "Movement from the outer hip", "Slow on the way down"],
    youtube: "clamshell exercise glute medius band",
    equipment: ["resistance-bands"], contraindications: ["hip-acute"] },

  // LEG ISOLATION
  { id: "sb-li-01", name: "Leg curl", section: "main", category: "leg-isolation",
    sets: 3, reps: "12", tempo: "2-1-2", rest: "60s", difficultyLevel: 1, logWeight: true,
    recommended: "Moderate weight — squeeze at the end of each rep",
    description: "Lie face down on the leg curl machine. Curl both legs toward your glutes. Lower slowly.",
    cues: ["Hips stay pressed into the bench", "Squeeze hamstrings at the top", "Slow on the lowering"],
    youtube: "lying leg curl machine technique",
    equipment: ["leg-curl-machine"], contraindications: ["hamstring-acute"] },

  { id: "sb-li-02", name: "Wall sit", section: "main", category: "leg-isolation",
    sets: 3, reps: "30-45s", tempo: "Hold", rest: "45s", difficultyLevel: 1, duration: 40,
    description: "Back flat against a wall, slide down until your knees are at roughly 90 degrees, as if sitting in an invisible chair. Hold.",
    cues: ["Knees stay above your ankles, not out past your toes", "Keep your back flat against the wall throughout", "Breathe steadily — don't hold your breath"],
    youtube: "wall sit exercise technique",
    equipment: [], contraindications: ["knee-acute"] },

  // ANTI-EXTENSION
  { id: "sb-ae-01", name: "Dead bug", section: "main", category: "anti-extension",
    sets: 3, reps: "8 each side", tempo: "Slow", rest: "45s", difficultyLevel: 1,
    description: "Lie on your back, arms to ceiling, knees at 90 degrees. Lower opposite arm and leg toward the floor. Lower back stays pressed down throughout.",
    cues: ["Lower back stays in contact with the floor — always", "Move slowly", "Breathe out as you lower", "Reduce range if back lifts"],
    youtube: "dead bug exercise core stability",
    equipment: [], contraindications: ["lower-back-acute"] },

  { id: "sb-ae-02", name: "Plank", section: "main", category: "anti-extension",
    sets: 3, reps: null, tempo: "Hold", rest: "60s", difficultyLevel: 1, duration: 30,
    description: "Forearms on the floor, elbows under shoulders. Body in a straight line from head to heels.",
    cues: ["Squeeze your glutes", "Push the floor away through your forearms", "Breathe normally throughout"],
    youtube: "perfect plank technique",
    equipment: [], contraindications: ["lower-back-acute", "shoulder-acute"] },

  // ANTI-ROTATION
  { id: "sb-ar-01", name: "Pallof press", section: "main", category: "anti-rotation",
    sets: 3, reps: "10 each side", tempo: "2-2-2", rest: "45s", difficultyLevel: 2, logWeight: true,
    recommended: "Light cable — this is core work, not arm work",
    description: "Stand sideways to a cable at chest height. Hold handle at chest. Press straight out, hold 2 seconds, return. Cable tries to rotate you — resist it.",
    cues: ["Stand tall, feet shoulder-width", "Do not let your body rotate", "The hold is where the work happens"],
    youtube: "pallof press anti rotation core cable",
    equipment: ["cable-machine"], contraindications: ["lower-back-acute"] },

  // ANTI-LATERAL
  { id: "sb-al-01", name: "Side plank", section: "main", category: "anti-lateral",
    sets: 2, reps: "each side", tempo: "Hold", rest: "45s", difficultyLevel: 2, duration: 25,
    description: "Lie on your side. Prop yourself on your forearm, elbow under shoulder. Lift your hips to form a straight line. Hold.",
    cues: ["Hips stacked — do not let the top hip fall forward", "Push the floor away through your forearm", "Modified: keep knees down"],
    youtube: "side plank technique form",
    equipment: [], contraindications: ["lower-back-acute", "shoulder-acute"] },

  // CONDITIONING (CARDIO)
  { id: "sb-cd-01", name: "Kettlebell swing", section: "main", category: "conditioning",
    sets: 4, reps: "20", tempo: "Explosive", rest: "60s", difficultyLevel: 2, logWeight: true,
    recommended: "Moderate kettlebell — the swing is driven by the hips",
    description: "Hip hinge to load, explosive hip drive to swing bell to chest height. This is a cardio-strength movement.",
    cues: ["Hip drive is everything", "Arms just hold — they do not lift", "Breathe out on the drive up"],
    youtube: "kettlebell swing cardio conditioning",
    equipment: ["kettlebells"], contraindications: ["lower-back-acute", "hamstring-acute"] },

  { id: "sb-cd-02", name: "Box step-up — alternating", section: "main", category: "conditioning",
    sets: 3, reps: "30 total", tempo: "Steady", rest: "45s", difficultyLevel: 1,
    description: "Step up with one foot, step down, alternate feet. Keep a steady rhythm for the full set.",
    cues: ["Drive through the working heel", "Keep the rhythm consistent", "Arms can pump for balance"],
    youtube: "box step up cardio conditioning",
    equipment: ["box-or-step"], contraindications: ["knee-acute"] },

  // INTERVAL
  { id: "sb-int-01", name: "Burpee — modified", section: "main", category: "interval",
    sets: 4, reps: null, tempo: "Max effort", rest: "60s", difficultyLevel: 2, duration: 30,
    description: "Stand, drop hands to floor, step or jump feet back to plank, step or jump feet forward, stand and jump. Modified: step instead of jump throughout.",
    cues: ["Choose the variation that matches your energy today", "Full plank position — do not let hips sag", "Breathe regularly throughout"],
    youtube: "burpee modified no jump technique",
    equipment: [], contraindications: ["lower-back-acute", "shoulder-acute", "knee-acute"] },

  // HIP MOBILITY (MAIN for Mobility session)
  { id: "sb-hm-01", name: "Hip CARs", section: "main", category: "hip-mobility",
    sets: 2, reps: "5 each side", tempo: "Slow", rest: "30s", difficultyLevel: 2,
    description: "Standing on one leg, draw the biggest circle possible with the lifted knee — forward, out, behind, back. Standing leg stays perfectly still.",
    cues: ["Move as slowly as possible", "Standing hip, knee, and foot stay fixed", "Find where range runs out and breathe into it"],
    youtube: "hip controlled articular rotation CARs",
    equipment: [], contraindications: ["hip-acute"] },

  { id: "sb-hm-02", name: "Deep squat hold", section: "main", category: "hip-mobility",
    sets: 2, reps: null, tempo: "Hold", rest: "30s", difficultyLevel: 1, duration: 60,
    description: "Squat as deep as you can with heels on the floor. Hold onto a support if needed. Relax into the position.",
    cues: ["Heels down is the goal — use support if needed", "Let the hips relax into the position", "Breathe deeply and let the body open"],
    youtube: "deep squat hold mobility hip",
    equipment: [], contraindications: ["knee-acute", "hip-acute"] },

  // THORACIC MOBILITY (MAIN)
  { id: "sb-tm-01", name: "Thread the needle", section: "main", category: "thoracic-mobility",
    sets: 2, reps: "8 each side", tempo: "Slow", rest: "15s", difficultyLevel: 1,
    description: "On hands and knees. Slide one arm under your body along the floor. Your upper back rotates to follow. Hold, then return.",
    cues: ["The arm slides — do not push", "Hips stay still", "Let the head rest on the floor"],
    youtube: "thread the needle thoracic rotation stretch",
    equipment: [], contraindications: ["shoulder-acute"] },

  { id: "sb-tm-02", name: "Foam roller thoracic extension", section: "main", category: "thoracic-mobility",
    sets: 1, reps: "5 segments", tempo: "10s hold", rest: "0s", difficultyLevel: 1, duration: 10,
    description: "Foam roller perpendicular to your spine at mid-back. Support your head. Extend over the roller, opening the chest upward. Hold 10 seconds. Move up one segment. Repeat.",
    cues: ["Support your head throughout", "Open the chest toward the ceiling", "Hips on the floor", "Move to the next segment gradually"],
    youtube: "foam roller thoracic extension mobility",
    equipment: ["foam-roller"], contraindications: ["upper-back-acute"] },

  // SHOULDER MOBILITY (MAIN)
  { id: "sb-sm-01", name: "Doorway chest stretch", section: "main", category: "shoulder-mobility",
    sets: 2, reps: "45s each side", tempo: "Hold", rest: "0s", difficultyLevel: 1, duration: 45,
    description: "Stand in a doorway, forearm on frame at shoulder height. Step through until you feel a stretch across the chest.",
    cues: ["Arm at shoulder height — not above", "Step forward gently", "Breathe into the stretch"],
    youtube: "doorway chest stretch pec flexibility",
    equipment: [], contraindications: ["shoulder-acute"] },

  // COOLDOWN — HIP FLEXOR STRETCH
  { id: "sb-cool-01", name: "Hip flexor stretch", section: "cooldown", category: "hip-flexor-stretch",
    sets: 1, reps: "60s each side", tempo: "Hold", rest: "0s", difficultyLevel: 1, duration: 60,
    description: "Half-kneeling. Rear knee on floor. Shift weight forward until you feel a stretch in the front of the rear hip.",
    cues: ["Tuck your tailbone", "Chest tall", "Squeeze the rear glute to deepen"],
    youtube: "kneeling hip flexor stretch technique",
    equipment: [], contraindications: ["hip-acute", "knee-acute"] },

  // COOLDOWN — GLUTE STRETCH
  { id: "sb-cool-02", name: "Pigeon pose", section: "cooldown", category: "glute-stretch",
    sets: 1, reps: "90s each side", tempo: "Hold", rest: "0s", difficultyLevel: 1, duration: 90,
    description: "From hands and knees, bring right knee forward toward right hand. Extend left leg behind. Sink hips toward floor.",
    cues: ["Square your hips to the floor", "Stay centred — do not collapse to one side", "Breathe out to release further"],
    youtube: "pigeon pose piriformis stretch",
    equipment: [], contraindications: ["hip-acute", "knee-acute"] },

  // COOLDOWN — CHILD'S POSE
  { id: "sb-cool-03", name: "Child's pose", section: "cooldown", category: "child-pose",
    sets: 1, reps: "60s", tempo: "Hold", rest: "0s", difficultyLevel: 1, duration: 60,
    description: "Kneel, sit hips back toward heels, reach arms forward. Forehead down. Breathe slowly.",
    cues: ["This is pure rest — let gravity do everything", "Widen your knees if hips are tight", "Each breath out, let the lower back soften"],
    youtube: "child's pose yoga lower back relief",
    equipment: [], contraindications: [] },

  // COOLDOWN — CHEST STRETCH
  { id: "sb-cool-04", name: "Doorway chest stretch", section: "cooldown", category: "chest-stretch",
    sets: 1, reps: "45s each side", tempo: "Hold", rest: "0s", difficultyLevel: 1, duration: 45,
    description: "Forearm on doorframe at shoulder height. Step through until you feel a stretch across the chest.",
    cues: ["Arm at shoulder height", "Step forward gently", "Breathe into the stretch"],
    youtube: "doorway chest stretch pec flexibility",
    equipment: [], contraindications: ["shoulder-acute"] },

  // COOLDOWN — LAT STRETCH
  { id: "sb-cool-05", name: "Lat stretch — doorway or bar", section: "cooldown", category: "lat-stretch",
    sets: 1, reps: "45s each side", tempo: "Hold", rest: "0s", difficultyLevel: 1, duration: 45,
    description: "Hold a fixed surface at shoulder height with one hand. Turn your body away, letting the lat and shoulder stretch.",
    cues: ["Keep the arm at shoulder height", "Rotate the body away to feel the stretch", "Do not pull — just lean"],
    youtube: "lat stretch doorway cable machine",
    equipment: [], contraindications: ["shoulder-acute"] },

  // COOLDOWN — THREAD THE NEEDLE (cool)
  { id: "sb-cool-06", name: "Thread the needle", section: "cooldown", category: "thread-needle",
    sets: 1, reps: "8 each side", tempo: "Slow", rest: "0s", difficultyLevel: 1,
    description: "On hands and knees. Slide one arm under body along the floor, rotating the upper back. Hold, then return.",
    cues: ["The arm slides — do not push", "Hips stay still", "Rest the head on the floor"],
    youtube: "thread the needle thoracic stretch",
    equipment: [], contraindications: ["shoulder-acute"] },

  // COOLDOWN — HAMSTRING STRETCH
  { id: "sb-cool-07", name: "Supine hamstring stretch", section: "cooldown", category: "hamstring-stretch",
    sets: 1, reps: "60s each side", tempo: "Hold", rest: "0s", difficultyLevel: 1, duration: 60,
    description: "Lie on your back. Lift one leg and hold behind the thigh. Gently straighten the raised leg until you feel a stretch in the back of the thigh.",
    cues: ["Keep the floor leg flat", "Do not pull aggressively — sustained is more effective", "Lower back on the floor"],
    youtube: "supine hamstring stretch lying down",
    equipment: [], contraindications: ["hamstring-acute"] },

  // COOLDOWN — FIGURE-4
  { id: "sb-cool-08", name: "Figure-4 stretch", section: "cooldown", category: "figure-4",
    sets: 1, reps: "60s each side", tempo: "Hold", rest: "0s", difficultyLevel: 1, duration: 60,
    description: "Lie on your back, knees bent. Cross right ankle over left thigh above the knee. Pull the left thigh toward your chest.",
    cues: ["Lower back on the floor", "Stretch is in the right outer hip and glute", "Breathe and release with each exhale"],
    youtube: "figure 4 stretch piriformis supine",
    equipment: [], contraindications: ["hip-acute", "knee-acute"] },

  // COOLDOWN — SUPINE ROTATION
  { id: "sb-cool-09", name: "Supine spinal rotation", section: "cooldown", category: "supine-rotation",
    sets: 1, reps: "8 each side", tempo: "Slow", rest: "0s", difficultyLevel: 1,
    description: "Lie on your back, knees bent together. Let both knees fall slowly to one side as you breathe out. Arms out for balance. Hold 3 breaths, then switch.",
    cues: ["Let the knees fall with gravity — do not force", "Shoulders stay on the floor", "Breathe into the rotation"],
    youtube: "supine spinal rotation twist stretch",
    equipment: [], contraindications: ["lower-back-acute"] },

  // COOLDOWN — STATIC STRETCH (cardio)
  { id: "sb-cool-10", name: "Standing quad stretch", section: "cooldown", category: "static-stretch",
    sets: 1, reps: "45s each side", tempo: "Hold", rest: "0s", difficultyLevel: 1, duration: 45,
    description: "Stand on one leg (hold a wall for balance). Bring the other foot up behind you and hold. Feel the stretch in the front of the thigh.",
    cues: ["Keep the standing knee soft", "Tuck the tailbone slightly", "Knee points down — not out to the side"],
    youtube: "standing quad stretch technique",
    equipment: [], contraindications: ["knee-acute"] },

  // COOLDOWN — BREATHING COOL
  { id: "sb-cool-11", name: "Extended exhale breathing", section: "cooldown", category: "breathing-cool",
    sets: 1, reps: null, tempo: "Breath-led", rest: "0s", difficultyLevel: 1, duration: 90,
    description: "Breathe in for 4 seconds, out for 6 seconds. The longer exhale activates the parasympathetic response — your rest signal.",
    cues: ["Inhale through your nose", "Exhale longer than the inhale", "Let each breath be slower than the last"],
    youtube: "extended exhale breathing relaxation",
    equipment: [], contraindications: [] },

  // COOLDOWN — DEEP STRETCH (mobility)
  { id: "sb-cool-12", name: "90-90 hip stretch", section: "cooldown", category: "deep-stretch",
    sets: 1, reps: "90s each side", tempo: "Hold", rest: "0s", difficultyLevel: 1, duration: 90,
    description: "Sit with both legs bent at 90 degrees — one in front, one to the side. Sit tall and hold. After 45 seconds, lean gently forward over the front shin.",
    cues: ["Both hips in contact with the floor", "Sit tall before leaning", "Breathe out to release"],
    youtube: "90 90 hip stretch piriformis",
    equipment: [], contraindications: ["hip-acute", "knee-acute"] },

  // LOWER MOBILITY (cardio warmup)
  { id: "sb-lm-01", name: "Leg swings", section: "warmup", category: "lower-mobility",
    sets: 2, reps: "15 each direction, each leg", tempo: "Controlled", rest: "0s", difficultyLevel: 1,
    description: "Stand on one leg (hold a wall). Swing the other leg forward and back, then side to side. Controlled range — not a kick.",
    cues: ["Swing from the hip, not the knee", "Standing leg stays still", "Gradually increase range over the set"],
    youtube: "leg swings dynamic warm up hip mobility",
    equipment: [], contraindications: ["hip-acute"] }
];

// ── Time-based exercise counts ────────────────────────────────────────────────

const EXERCISE_COUNT = {
  15: { warmup: 2, main: 3,   cooldown: 1 },
  30: { warmup: 3, main: 5,   cooldown: 2 },
  45: { warmup: 4, main: 7,   cooldown: 2 },
  60: { warmup: 5, main: 9,   cooldown: 3 }
};

// ── Coach line templates ───────────────────────────────────────────────────────

function generateCoachLine(sessionType, durationMins, conditions, equipment, conditionNote) {
  const type = SESSION_TYPES.find(t => t.id === sessionType);
  const name = store.get("name") || "";

  const lines = {
    glute:  `I've built this around ${durationMins} minutes of glute-focused work. Everything here loads the posterior chain progressively — warmup first, then the movements that matter.`,
    upper:  `Upper body today. ${durationMins} minutes of push and pull, balanced across all the major patterns. Your shoulder blades do more work than you think.`,
    lower:  `${durationMins} minutes of lower body. Squat, hinge, single-leg — each pattern trains something the others don't. Do them in the order shown.`,
    full:   `Full body in ${durationMins} minutes. I've kept the session broad — every major pattern gets a turn. It's more efficient than it looks.`,
    core:   `Core session — ${durationMins} minutes of real anti-movement work. The core's job is to resist, not just crunch. This session reflects that.`,
    cardio: `${durationMins} minutes of conditioning work. Keep your effort honest — this should feel like sustained work, not sprinting followed by rest.`,
    mobility: `${durationMins} minutes of mobility. Active range of motion — not passive stretching. Move slowly into restriction and breathe through it.`
  };

  let line = lines[sessionType] || `${durationMins}-minute ${type?.label || ""} session, built for you today.`;

  if (conditionNote) {
    line += " " + conditionNote;
  }

  return line;
}

// ── Condition filtering ────────────────────────────────────────────────────────

function buildActiveConditionSet() {
  const conditions  = store.get("conditions")          || [];
  const painScores  = store.get("conditionPainScores") || {};
  const active      = new Set();

  conditions.forEach(id => {
    active.add(id);
    const pain = painScores[id] || 0;
    if (pain >= 7)      active.add(`${id}-acute`);
    else if (pain >= 4) active.add(`${id}-subacute`);
  });

  return active;
}

/**
 * PULSE-RAISER RULE (11 Aug 2026, PT-19)
 *
 * Every session opens with something that raises the heart rate, unless
 * there is a specific, nameable reason it should not.
 *
 * This inverts how warm-ups were selected until now. Previously
 * "cardio-warmup" was one category among several in an ordered list, and
 * the selection loop filled its slots in order and stopped. On Full Body it
 * was listed fourth of four with three slots available, so the loop broke
 * before ever reaching it. Traced live on 11 Aug: no generated session
 * contained a pulse-raiser, at home OR in a gym with a treadmill and a bike
 * ticked. Two separate causes compounded it -- all four cardio-warmup
 * entries required a machine, and two of the four carried equipment tags
 * ("bike", "cross-trainer") that do not exist in equipment.js's vocabulary,
 * so they could never match even in a gym.
 *
 * The default is now on. Exclusion requires a reason, and the reason is
 * spoken rather than silently applied -- Locked Principle P1: the coach
 * never withholds what it can see. Someone who notices the warm-up looks
 * different today should be told why, not left to wonder.
 *
 * Exclusions, each deliberate:
 *
 *   Cardio sessions   -- the whole session is a pulse-raiser. Reserving a
 *                        slot for one inside it is redundant.
 *   Mobility sessions -- these open with breathing by design. Range of
 *                        motion work does not need an elevated heart rate,
 *                        and forcing one changes what the session is.
 *   Unwell            -- self-reported. Someone who has said they are
 *                        unwell should not be met with a heart-rate raiser.
 *   Acute pain (>=7)  -- consistent with the existing severe zone override.
 *
 * Note what is NOT an exclusion: having no equipment. That was the original
 * cause of the gap and it is a content problem, not a rule. Five bodyweight
 * pulse-raisers were authored alongside this, tiered by difficultyLevel so
 * the option scales with the person rather than being one intensity.
 *
 * @param {string} sessionType
 * @returns {{ include: boolean, reason: string|null }}
 *   reason is coach-voice text for the session's opening line, or null when
 *   included. Never a bare flag -- an exclusion the person cannot see the
 *   reason for is exactly what this rule exists to prevent.
 */
export function pulseRaiserDecision(sessionType) {
  if (sessionType === "cardio") {
    return { include: false, reason: null };   // the session is the warm-up
  }
  if (sessionType === "mobility") {
    return { include: false, reason: null };   // opens with breathing by design
  }

  const lastCheckin = store.get("lastCheckin") || {};
  if (lastCheckin.unwell === true) {
    return {
      include: false,
      reason: "You told me you are not feeling well, so I have left the heart-rate raiser out of the warm-up today. Move gently and stop whenever you need to."
    };
  }

  const conditions = store.get("conditions")          || [];
  const painScores = store.get("conditionPainScores") || {};
  const acute = conditions.filter(id => (painScores[id] || 0) >= 7);
  if (acute.length > 0) {
    return {
      include: false,
      reason: "With the pain you have flagged today I have started you gently rather than raising your heart rate first. Take the warm-up slowly."
    };
  }

  return { include: true, reason: null };
}

function buildConditionNote(sessionType) {
  const conditions = store.get("conditions")          || [];
  const painScores = store.get("conditionPainScores") || {};

  const relevant = conditions.filter(id => {
    const pain = painScores[id] || 0;
    return pain >= 4;
  });

  if (relevant.length === 0) return null;

  const note = relevant
    .map(id => {
      const pain = painScores[id] || 0;
      if (id.includes("lower-back")) {
        return pain >= 7
          ? "Your lower back is significant today — I've removed everything that loads the spine under flexion."
          : "Your lower back is present — I've kept loading conservative.";
      }
      if (id.includes("knee")) {
        return "With your knee, I've avoided deep single-leg loading. Listen to any sharp signals.";
      }
      if (id.includes("shoulder")) {
        return "Your shoulder is considered — I've reduced overhead and heavy pressing.";
      }
      if (id.includes("hamstring")) {
        return "With your hamstring, I've kept hip extension loading controlled.";
      }
      return null;
    })
    .filter(Boolean)
    .join(" ");

  return note || null;
}

// ── Candidate filtering (05 Aug 2026) ─────────────────────────────────────────
// Extracted from what was previously selectFromCategories()'s inline logic so
// buildCandidatePools() can reuse the exact same equipment/contraindication
// rules without duplicating them -- one filter, two callers.
/**
 * 11 Aug 2026 (PT-11, second persona trace) — difficulty ceiling.
 *
 * Found by re-tracing both personas against the shipped WOW-2 fix: this
 * file has its own EXERCISE_POOL of 65, entirely separate from the
 * 461-exercise database, and it never filtered on fitness at all. So the
 * WOW-2 fix reached coach-proposal sessions (workoutGenerator.js) but NOT
 * the "Cardio, Core & Strength" Home door, which routes here. A sedentary
 * beginner and a gym-literate lifter were handed the identical pool.
 *
 * difficultyLevel (1-3) was already written on all 65 exercises and read
 * nowhere — the same written-never-read pattern as exerciseFeedback and
 * absence.capturedAt. Using the field that already exists rather than
 * adding another.
 *
 * Ceilings mirror filterByFitnessLevel()'s intent on the main database,
 * compressed to this pool's 1-3 scale. "returning" sits below moderate for
 * the same reason it does there: capacity is there, but day one should not
 * meet someone at their old level.
 *
 * NOT a pool merge. That is a real architectural job (this is the fourth
 * parallel exercise pool in the codebase) and is logged, not attempted
 * here — touch-once.
 */
const DIFFICULTY_CEILINGS = {
  "sedentary":   1,
  "light":       2,
  "returning":   2,
  "moderate":    2,
  "active":      3,
  "very-active": 3
};

function _difficultyCeiling() {
  const declared = store.get("fitnessLevel")
                || store.get("lifestyle.activityLevel")
                || "moderate";
  return DIFFICULTY_CEILINGS[declared] ?? DIFFICULTY_CEILINGS["moderate"];
}

function _filterCandidates(categories, section, equipSet, conditionSet) {
  const ceiling = _difficultyCeiling();
  return EXERCISE_POOL.filter(ex => {
    if (ex.section !== section) return false;
    if (!categories.includes(ex.category)) return false;
    // Difficulty ceiling. Warmups and cooldowns are exempt: they are
    // structurally gentle already, and capping them can empty a section
    // and break the warmup safety floor.
    if (section === "main" && (ex.difficultyLevel || 1) > ceiling) return false;
    // Equipment check: exercise needs no equipment, or user has it.
    // CON-2: equipSet is now a resolved capability set, not the raw ticks.
    if (!exerciseIsAvailable(ex, equipSet)) return false;
    // Condition check — only filter on acute/subacute pain levels.
    // Base condition IDs (no suffix) do not filter exercises — the user
    // has a condition but may have no pain today. Only pain score >= 4
    // (subacute) or >= 7 (acute) triggers exercise exclusion.
    if (ex.contraindications && ex.contraindications.length > 0) {
      const acuteContraindicated = ex.contraindications.some(c =>
        (c.endsWith("-acute") || c.endsWith("-subacute")) && conditionSet.has(c)
      );
      if (acuteContraindicated) return false;
    }
    return true;
  });
}

/**
 * Wider-than-auto-pick candidate lists per section, for "coach
 * recommends" / "build your own" modes. Each candidate carries
 * recommended:true for the same picks buildSession()'s auto-select
 * would have chosen (one per category first, deterministic order —
 * not the same random pick every call, but a sensible, stable
 * starting selection for the UI to pre-check), recommended:false for
 * the rest of the wider pool. "Coach recommends" pre-checks the
 * recommended:true items; "build your own" shows the identical list
 * with nothing pre-checked — one function, two presentations.
 */
export function buildCandidatePools({ sessionType, durationMins, equipmentOverride, preset }) {
  const type = SESSION_TYPES.find(t => t.id === sessionType);
  if (!type) return null;

  const userEquipment = equipmentOverride || store.get("equipment") || [];
  const equipSet       = resolveEquipment(userEquipment);
  const conditionSet   = buildActiveConditionSet();
  const baseCounts     = EXERCISE_COUNT[durationMins] || EXERCISE_COUNT[30];
  const counts         = _applyPreset(baseCounts, preset);

  function poolFor(categories, section, count) {
    const candidates = _filterCandidates(categories, section, equipSet, conditionSet);
    const recommendedIds = new Set();
    for (const cat of categories) {
      if (recommendedIds.size >= count) break;
      const fromCat = candidates.find(e => e.category === cat && !recommendedIds.has(e.id));
      if (fromCat) recommendedIds.add(fromCat.id);
    }
    // Fill remaining recommended slots deterministically (first match),
    // not randomly — a candidate list should be stable if shown twice.
    for (const ex of candidates) {
      if (recommendedIds.size >= count) break;
      recommendedIds.add(ex.id);
    }
    return candidates.map(ex => ({ ...ex, recommended: recommendedIds.has(ex.id) }));
  }

  return {
    warmup:   poolFor(type.warmupCategories,   "warmup",   counts.warmup),
    main:     poolFor(type.mainCategories,     "main",     counts.main),
    cooldown: poolFor(type.cooldownCategories, "cooldown", counts.cooldown)
  };
}

/**
 * Assembles a session from exercise IDs a person actually chose (from
 * buildCandidatePools()'s lists), in the same shape buildSession()
 * produces, so gym-programme.js renders either identically. Hard
 * safety floor: if the chosen warmup selection is empty, one warmup
 * exercise is added automatically — the safety rule (never skip a
 * warmup) holds even in "build your own" mode, it isn't optional.
 */
export function buildSessionFromSelection({ sessionType, durationMins, selectedIds, equipmentOverride }) {
  const type = SESSION_TYPES.find(t => t.id === sessionType);
  if (!type) return null;

  const userEquipment = equipmentOverride || store.get("equipment") || [];
  const equipSet       = resolveEquipment(userEquipment);
  const conditionSet   = buildActiveConditionSet();
  const idSet          = new Set(selectedIds || []);

  function chosenFrom(categories, section) {
    return _filterCandidates(categories, section, equipSet, conditionSet)
      .filter(ex => idSet.has(ex.id));
  }

  let warmupExercises   = chosenFrom(type.warmupCategories,   "warmup");
  const mainExercises     = chosenFrom(type.mainCategories,     "main");
  const cooldownExercises = chosenFrom(type.cooldownCategories, "cooldown");

  // Safety floor — never ship a session with zero warmup, regardless
  // of what was (or wasn't) selected.
  if (warmupExercises.length === 0) {
    const fallback = _filterCandidates(type.warmupCategories, "warmup", equipSet, conditionSet)[0];
    if (fallback) warmupExercises = [fallback];
  }

  const prescribed = (store.get("prescribedExercises") || [])
    .filter(ex => ex.active !== false)
    .map(ex => ({
      id: ex.id, name: ex.name, section: "main", category: "prescribed",
      sets: ex.sets || 3, reps: ex.reps || ex.hold || "As prescribed",
      tempo: "As prescribed", rest: "As needed",
      description: ex.description || ex.notes || "As prescribed by your specialist.",
      cues: ex.notes ? [ex.notes] : ["Follow your specialist's guidance for this exercise"],
      youtube: null, equipment: [], contraindications: [], difficultyLevel: 1,
      isPrescribed: true, prescribedBy: ex.prescribedBy || null
    }));

  const allExercises = [...warmupExercises, ...prescribed, ...mainExercises, ...cooldownExercises];
  const estMins = Math.round(allExercises.reduce((acc, ex) => {
    const sets = ex.sets || 3;
    const dur  = ex.duration ? (ex.duration * sets / 60) : (sets * 1.5);
    return acc + dur;
  }, 0));
  const durationStr = `${Math.max(estMins - 5, durationMins - 5)}–${Math.max(estMins + 5, durationMins + 5)} mins`;

  const session = {
    id:       `${sessionType}-${Date.now()}`,
    title:    type.label,
    subtitle: `Built by you today — ${durationMins} mins`,
    duration: durationStr,
    coachLine: "You picked this one yourself — here's what you chose.",
    exercises: allExercises
  };

  store.set("generatedSession", {
    session,
    builtAt: new Date().toISOString(),
    inputs:  { sessionType, durationMins, equipment: userEquipment, selectedIds: Array.from(idSet) }
  });

  return session;
}

export function buildSession({ sessionType, durationMins, equipmentOverride, preset }) {
  const type = SESSION_TYPES.find(t => t.id === sessionType);
  if (!type) return null;

  const userEquipment  = equipmentOverride || store.get("equipment") || [];
  const equipSet       = resolveEquipment(userEquipment);
  const conditionSet   = buildActiveConditionSet();
  const counts         = _applyPreset(EXERCISE_COUNT[durationMins] || EXERCISE_COUNT[30], preset);
  const conditionNote  = buildConditionNote(sessionType);

  // ── Prescribed exercises injection ──────────────────────────────────────────
  // Active prescribed exercises are included in every session, regardless of
  // session type. They are placed in the warmup or main section depending on
  // their nature. The coach names them explicitly in the coach line.
  // The engine never removes or overrides prescribed exercises.

  const prescribed = (store.get("prescribedExercises") || [])
    .filter(ex => ex.active !== false)
    .map(ex => ({
      id:          ex.id,
      name:        ex.name,
      section:     "main",    // default; could be made smarter later
      category:    "prescribed",
      sets:        ex.sets        || 3,
      reps:        ex.reps        || ex.hold || "As prescribed",
      tempo:       "As prescribed",
      rest:        "As needed",
      description: ex.description || ex.notes || "As prescribed by your specialist.",
      cues:        ex.notes ? [ex.notes] : ["Follow your specialist's guidance for this exercise"],
      youtube:     null,
      equipment:   [],
      contraindications: [],
      difficultyLevel: 1,
      isPrescribed:    true,
      prescribedBy:    ex.prescribedBy || null
    }));

  const hasPrescribed = prescribed.length > 0;

  // PT-19 — decided once per session, used by selectFromCategories() below
  // and surfaced on the session object so the coach line can say why the
  // warm-up looks different when it does.
  const pulseRaiser = pulseRaiserDecision(sessionType);

  function selectFromCategories(categories, section, count) {
    const candidates = _filterCandidates(categories, section, equipSet, conditionSet);

    // Prioritise variety across categories — one from each category first
    const selected = [];
    const usedCategories = new Set();

    // PULSE-RAISER RESERVED SLOT (PT-19). The warm-up's first slot belongs
    // to cardio-warmup unless pulseRaiserDecision() names a reason it
    // should not. Reserved rather than reordered: reordering the category
    // array would only change which category gets dropped when slots run
    // out, and the point is that this one never should. Same shape as the
    // existing warmup floor -- a rule, not a preference.
    if (section === "warmup" && pulseRaiser.include && count > 0) {
      const cardio = candidates.filter(e => e.category === "cardio-warmup");
      if (cardio.length > 0) {
        // Prefer a machine when the person has one. Found in testing: the
        // reserved slot picked at random, so a gym user with a treadmill,
        // a bike and a cross trainer ticked was being handed jumping jacks
        // -- which is exactly the complaint that started this. Bodyweight
        // is right at home and wrong standing next to a cross trainer.
        // Falls back to bodyweight whenever no machine is available.
        const machine = cardio.filter(e => (e.equipment || []).length > 0);
        const pickFrom = machine.length > 0 ? machine : cardio;
        selected.push(pickFrom[Math.floor(Math.random() * pickFrom.length)]);
        usedCategories.add("cardio-warmup");
      }
    }

    // First pass: one from each category
    for (const cat of categories) {
      if (selected.length >= count) break;
      const fromCat = candidates.filter(e => e.category === cat && !selected.includes(e));
      if (fromCat.length > 0) {
        selected.push(fromCat[Math.floor(Math.random() * fromCat.length)]);
        usedCategories.add(cat);
      }
    }

    // Second pass: fill remaining slots
    const remaining = candidates.filter(e => !selected.includes(e));
    while (selected.length < count && remaining.length > 0) {
      const idx = Math.floor(Math.random() * remaining.length);
      selected.push(remaining.splice(idx, 1)[0]);
    }

    return selected.slice(0, count);
  }

  // Reduce main slot count to make room for prescribed exercises
  const prescribedCount = prescribed.length;
  const adjustedCounts  = {
    warmup:   counts.warmup,
    main:     Math.max(1, counts.main - prescribedCount),
    cooldown: counts.cooldown
  };

  const warmupExercises   = selectFromCategories(type.warmupCategories,   "warmup",   adjustedCounts.warmup);
  const mainExercises     = [...prescribed, ...selectFromCategories(type.mainCategories, "main", adjustedCounts.main)];
  const cooldownExercises = selectFromCategories(type.cooldownCategories, "cooldown", adjustedCounts.cooldown);

  // If equipment mismatch is severe, add a coach note
  let equipNote = null;
  if (mainExercises.length < counts.main * 0.6) {
    equipNote = "With your equipment today I've built the best session I can. Some categories have limited options — focus on the movements you have.";
  }

  // Build prescribed note for coach line
  let prescribedNote = null;
  if (hasPrescribed) {
    const prescribers = [...new Set(prescribed.map(p => p.prescribedBy).filter(Boolean))];
    if (prescribers.length > 0) {
      prescribedNote = `I've included your prescribed exercises from ${prescribers.join(" and ")}. Do these as written — they are not mine to change.`;
    } else {
      prescribedNote = `I've included your prescribed exercises at the start of the main session. Do these as written.`;
    }
  }

  const coachLine = generateCoachLine(
    sessionType,
    durationMins,
    Array.from(conditionSet),
    userEquipment,
    [conditionNote, equipNote, prescribedNote].filter(Boolean).join(" ") || null
  );

  // Calculate estimated duration
  const allExercises = [...warmupExercises, ...mainExercises, ...cooldownExercises];
  const estMins = Math.round(allExercises.reduce((acc, ex) => {
    const sets = ex.sets || 3;
    const reps = typeof ex.reps === "string" ? 1 : (ex.reps || 1);
    const dur  = ex.duration ? (ex.duration * sets / 60) : (sets * 1.5);
    return acc + dur;
  }, 0));
  const durationStr = `${Math.max(estMins - 5, durationMins - 5)}–${Math.max(estMins + 5, durationMins + 5)} mins`;

  // PT-19 — when the pulse-raiser is deliberately left out for a reason the
  // person gave us (unwell, acute pain), say so. An exclusion applied
  // silently is exactly what Locked Principle P1 forbids: the coach never
  // withholds what it can see. The structural exemptions (cardio, mobility)
  // carry no reason and add nothing here, correctly.
  const coachLineWithWarmupNote = pulseRaiser.reason
    ? `${coachLine} ${pulseRaiser.reason}`
    : coachLine;

  const session = {
    id:       `${sessionType}-${Date.now()}`,
    title:    `${type.label}`,
    subtitle: `Built for you today — ${durationMins} mins`,
    duration: durationStr,
    coachLine: coachLineWithWarmupNote,
    exercises: allExercises
  };

  // Store in store.js
  store.set("generatedSession", {
    session,
    builtAt: new Date().toISOString(),
    inputs:  { sessionType, durationMins, equipment: userEquipment }
  });

  return session;
}
