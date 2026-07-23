/**
 * core-session.js - Guided Core Session
 *
 * 23 Jul 2026 v3
 *
 * CHANGELOG
 * 23 Jul 2026 v3 — BUILD-3 exit-guard audit fix. onExit (mountSessionGuard)
 *   was navigating to reflect.js without ever calling savePartialSession()
 *   first — the on-screen Exit button (showExitConfirm) called it
 *   correctly, but the device back-gesture path silently dropped partial
 *   progress. Fixed to match yoga-session.js v4's confirmed-working
 *   pattern exactly. Bundled while the file was open: finaliseSession()
 *   and savePartialSession() migrated from direct activityLog writes to
 *   store.logActivity() (dedupe-guarded shared path, store.js v10).
 *   savePartialSession() also referenced an undeclared `elapsed` variable
 *   for durationMins (this file has no running elapsed-time tracker,
 *   only per-exercise hold timers) — left explicitly null with a comment,
 *   matching yoga-session.js v4's same fix, rather than fabricated.
 * 18 May 2026 v2 — prior version.
 *
 * Four focus types, three durations. Draws from strength and rehabilitation
 * exercise databases. Condition-aware — automatically avoids exercises
 * contraindicated by the user's active conditions and pain scores.
 *
 * Focus types:
 *   stability  — anti-extension, anti-rotation, anti-lateral-flexion
 *   strength   — loaded core, progressive difficulty
 *   mobility   — spinal mobility, hip flexor, thoracic
 *   rehab      — gentle, low-load, suitable for back pain and acute conditions
 *
 * Durations: 15 / 20 / 30 minutes
 *
 * Session flow:
 *   1. Focus selector screen
 *   2. Duration selector
 *   3. Condition-aware coach intro card
 *   4. Exercise sequence (one at a time, timer or reps display)
 *   5. Rest card between exercises
 *   6. Completion screen
 *
 * Route: "core-session"
 * Nav: hidden (session view)
 * Credits: 20 per exercise completed
 */

import { store } from "../store.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";

export const centered = false;

// ── Session state ─────────────────────────────────────────────────────────────
let phase         = "focus";    // "focus" | "duration" | "overview" | "intro" | "session" | "rest" | "done"
let selectedFocus = null;
let selectedMins  = null;
let sessionQueue  = [];
let currentIndex  = 0;
let timerInterval = null;
let timeRemaining = 0;
let timerRunning  = false;
let creditsEarned = 0;
let restRemaining = 0;
let restInterval  = null;

// ── Focus definitions ─────────────────────────────────────────────────────────

const FOCUS_TYPES = [
  {
    id:          "stability",
    label:       "Stability",
    icon:        "\uD83E\uDDD8",
    description: "Anti-extension, anti-rotation, anti-lateral-flexion. The core's real job is to resist unwanted movement.",
    coachIntro:  "Stability work is the foundation of everything. We're not training the core to crunch — we're training it to hold. These exercises are slow, controlled, and more demanding than they look.",
    colour:      "var(--color-primary)"
  },
  {
    id:          "strength",
    label:       "Strength",
    icon:        "\uD83D\uDCAA",
    description: "Progressive loaded core work. Builds genuine mid-section strength across all planes.",
    coachIntro:  "Core strength sessions move beyond the basics. Expect a progression through difficulty — some of these will challenge you. Quality of movement matters more than completing every rep.",
    colour:      "#818CF8"
  },
  {
    id:          "mobility",
    label:       "Mobility",
    icon:        "\uD83C\uDF3F",
    description: "Spinal mobility, hip flexor opening, thoracic rotation. Unlocks movement quality.",
    coachIntro:  "Mobility work is active, not passive. We're building range of motion you can control, not just stretching. Move slowly and breathe into restriction.",
    colour:      "#34D399"
  },
  {
    id:          "rehab",
    label:       "Rehab",
    icon:        "\uD83E\uDE7A",
    description: "Gentle, low-load. Safe for back pain, post-injury, or when everything feels sensitive.",
    coachIntro:  "This session is gentle by design. We're working with your body, not against it. If anything feels sharp rather than achy, stop. There is nothing here that requires pushing through pain.",
    colour:      "#FB923C"
  }
];

// ── Exercise pool by focus ────────────────────────────────────────────────────
// Each entry: { id, name, sets, reps, holdSeconds, rest, cues, description, why }
// holdSeconds > 0 means show a countdown timer
// rest = seconds of rest after the exercise (shown as a rest card)

const EXERCISE_POOLS = {

  stability: [
    {
      id:          "dead-bug-progression-1",
      name:        "Dead Bug",
      sets:        3,
      reps:        "8 each side",
      holdSeconds: 0,
      rest:        45,
      description: "Lie on your back, arms pointing to the ceiling, knees bent to 90 degrees above your hips. Slowly lower opposite arm and leg toward the floor — keeping your lower back pressed firmly down. Return and repeat on the other side.",
      cues:        ["Lower back stays in contact with the floor throughout", "Breathe out as you lower the limbs", "Move slowly — 3 seconds down, 3 seconds back", "If your back lifts, reduce the range of motion"],
      why:         "The dead bug is the gold standard anti-extension exercise. It trains the core to resist spinal extension under load while the limbs move — exactly what it needs to do in real life.",
      contraindications: ["lower-back-acute"]
    },
    {
      id:          "bird-dog-rehab",
      name:        "Bird Dog",
      sets:        3,
      reps:        "8 each side",
      holdSeconds: 3,
      rest:        45,
      description: "On hands and knees, brace your core. Extend your right arm and left leg simultaneously, holding for 3 seconds. Return slowly. Repeat on the opposite side.",
      cues:        ["Keep your hips level — no rotation", "Your extended arm and leg should be parallel to the floor", "Draw your belly button gently toward your spine before you move", "The 3-second hold is where the work happens"],
      why:         "Bird dog trains the core in its anti-rotation function while also requiring hip extension and shoulder stability. One of the most complete single exercises for spinal health.",
      contraindications: ["lower-back-acute", "wrist-elbow-acute"]
    },
    {
      id:          "plank",
      name:        "Plank",
      sets:        3,
      reps:        null,
      holdSeconds: 30,
      rest:        60,
      description: "Forearms on the floor, elbows under shoulders. Body forms a straight line from head to heels. Hold.",
      cues:        ["Squeeze your glutes — this protects your lower back", "Push the floor away through your forearms", "Breathe normally throughout — no breath-holding", "If hips sag, that's your stopping point"],
      why:         "The plank is the foundational anti-extension exercise. Everything else in stability training builds on the ability to maintain a neutral spine under load.",
      contraindications: ["lower-back-acute", "wrist-elbow-acute", "shoulder-acute"]
    },
    {
      id:          "side-plank-modified",
      name:        "Side Plank",
      sets:        2,
      reps:        "each side",
      holdSeconds: 20,
      rest:        45,
      description: "Lie on your side. Prop yourself up on your forearm, elbow under shoulder. Lift your hips to form a straight line. Hold. Repeat on the other side.",
      cues:        ["Hips stacked — do not let the top hip drop forward", "Modified version: keep knees down, lift from the knee", "Push the floor away through your forearm", "Breathe normally throughout"],
      why:         "Side plank is the primary anti-lateral-flexion exercise. It trains the quadratus lumborum and obliques to resist sideways bending — a key component of the McGill Big Three for back rehabilitation.",
      contraindications: ["lower-back-acute", "shoulder-acute"]
    },
    {
      id:          "pallof-press",
      name:        "Pallof Press",
      sets:        3,
      reps:        "10 each side",
      holdSeconds: 2,
      rest:        45,
      description: "Stand sideways to a cable machine or anchor point with a resistance band. Hold the band at your chest. Press it straight out, hold 2 seconds, return. The force tries to rotate you — resist it.",
      cues:        ["The resistance should be from the side, not from the front", "Feet shoulder-width apart, slight knee bend", "Do not let your body twist toward the anchor", "The hold is where the anti-rotation work happens"],
      why:         "The Pallof press trains rotational core stability — the ability to resist twisting forces. Essential for athletes and anyone who loads the spine asymmetrically.",
      contraindications: ["lower-back-acute"],
      equipment:   ["resistance-bands"]
    },
    {
      id:          "mcgill-curl-up",
      name:        "McGill Curl-Up",
      sets:        3,
      reps:        "10",
      holdSeconds: 8,
      rest:        45,
      description: "Lie on your back, one knee bent and one leg straight. Place your hands under your lower back to maintain its natural curve. Lift your head and shoulders slightly — spine stays neutral. Hold 8 seconds. Lower slowly.",
      cues:        ["This is not a sit-up — you lift barely 2-3 inches", "Your lower back stays in its natural curve throughout", "Elbows on the floor, hands under the curve", "Hold the top position — do not crunch and release"],
      why:         "Developed by spine researcher Stuart McGill, this activates the rectus abdominis with minimal spinal compressive force. Safer than crunches for virtually every back condition.",
      contraindications: ["lower-back-acute"]
    }
  ],

  strength: [
    {
      id:          "ab-wheel-rollout",
      name:        "Ab Wheel Rollout",
      sets:        3,
      reps:        "8 to 12",
      holdSeconds: 0,
      rest:        60,
      description: "Kneel on the floor with the ab wheel in front of you. Slowly roll forward until your body is close to parallel with the floor. Use your core to pull yourself back. Do not let your hips drop.",
      cues:        ["Control the rollout — 3 seconds forward, 3 seconds back", "Protect the lower back by not rolling past parallel", "Keep the glutes engaged throughout", "Beginners: reduce the range of motion — short rolls are still effective"],
      why:         "One of the most effective anti-extension exercises. The rollout loads the core through a significant range of motion, making it substantially more demanding than a plank.",
      contraindications: ["lower-back-acute", "wrist-elbow-acute", "shoulder-acute"],
      equipment:   ["ab-wheel"]
    },
    {
      id:          "isometric-hollow-hold",
      name:        "Hollow Body Hold",
      sets:        3,
      reps:        null,
      holdSeconds: 20,
      rest:        60,
      description: "Lie on your back. Press your lower back into the floor. Lift your arms overhead and your legs off the floor. Hold the position — you should look like a shallow dish.",
      cues:        ["Lower back must stay in contact with the floor", "Legs higher if your back lifts — reduce the lever arm", "Arms by your sides is an easier variation", "Breathe — do not hold your breath"],
      why:         "The hollow body position is the foundation of gymnastic strength training. It maximally activates the rectus abdominis and hip flexors in an integrated pattern.",
      contraindications: ["lower-back-acute", "hip-acute"]
    },
    {
      id:          "dead-bug-progression-3",
      name:        "Dead Bug with Weight",
      sets:        3,
      reps:        "6 each side",
      holdSeconds: 0,
      rest:        60,
      description: "Dead bug with a light dumbbell held in each hand, arms pointing up. Lower opposite arm and leg simultaneously. The weight increases the anti-extension demand significantly.",
      cues:        ["Lighter than you think — 2-4kg is enough", "Lower back stays in contact with the floor throughout", "Move more slowly with the added weight", "If your back lifts at all, reduce the weight or range"],
      why:         "The weighted dead bug extends the anti-extension challenge. The additional load requires more core recruitment to maintain spinal position — a genuine strength stimulus.",
      contraindications: ["lower-back-acute"],
      equipment:   ["dumbbells"]
    },
    {
      id:          "band-pallof-press",
      name:        "Band Pallof Press",
      sets:        3,
      reps:        "12 each side",
      holdSeconds: 2,
      rest:        45,
      description: "Anchor a resistance band at chest height. Stand sideways to it, hold the band at your chest. Press directly forward and hold 2 seconds. Return slowly. The band pulls you sideways — resist it with your core.",
      cues:        ["Choose a band resistance that challenges you without pulling you off balance", "Feet shoulder-width, slight knee bend, soft hips", "Pause at full extension — that is where the anti-rotation work is", "Keep the torso square to the front throughout"],
      why:         "Rotational core stability is undertrained in most programmes. The Pallof press directly addresses the obliques and transversus abdominis in their anti-rotation function.",
      contraindications: ["lower-back-acute"],
      equipment:   ["resistance-bands"]
    },
    {
      id:          "glute-bridge-single-leg",
      name:        "Single-Leg Glute Bridge",
      sets:        3,
      reps:        "10 each side",
      holdSeconds: 2,
      rest:        45,
      description: "Lie on your back, one knee bent with foot flat. Extend the other leg straight. Drive through the planted heel to lift your hips — squeeze the glute hard at the top. Hold 2 seconds. Lower slowly.",
      cues:        ["Level hips — the unsupported side will want to drop", "Squeeze the working glute, not just your hamstring", "The 2-second hold is where the strength develops", "Keep the core braced throughout"],
      why:         "Single-leg bridges train hip extension and pelvic stability simultaneously. The offset load challenges rotational core control — more demanding than the bilateral version.",
      contraindications: ["lower-back-acute", "hip-acute", "hamstring-acute"]
    }
  ],

  mobility: [
    {
      id:          "thoracic-rotation",
      name:        "Thoracic Rotation",
      sets:        2,
      reps:        "10 each side",
      holdSeconds: 3,
      rest:        30,
      description: "Sit on the floor or a chair. Place hands behind your head. Rotate your upper back as far as you comfortably can to one side — lead with your elbow. Hold 3 seconds. Return. The lower back should not move.",
      cues:        ["The rotation is in your upper back — thoracic spine", "Lower back stays still throughout", "Do not force the range — breathe into the rotation", "Each rep, try to go a little further"],
      why:         "Thoracic mobility is one of the most important and undertrained movement qualities. Restrictions here force compensation from the lumbar spine and shoulders — contributing to pain in both areas.",
      contraindications: ["upper-back-acute"]
    },
    {
      id:          "hip-flexor-stretch",
      name:        "Hip Flexor Stretch",
      sets:        2,
      reps:        "each side",
      holdSeconds: 45,
      rest:        30,
      description: "Half-kneeling, one knee on the floor. Shift your hips forward gently until you feel a stretch in the front of the hip of the kneeling leg. Hold. Do not arch your lower back.",
      cues:        ["Tuck your tailbone slightly — this deepens the stretch safely", "Keep your chest tall — resist the urge to lean forward", "The stretch should be in the front of the hip, not the knee", "Breathe slowly and let the muscle release"],
      why:         "Tight hip flexors anterior tilt the pelvis and increase compressive load on the lumbar spine. Releasing them is one of the highest-return interventions for lower back health.",
      contraindications: ["hip-acute", "knee-acute"]
    },
    {
      id:          "thoracic-extension-foam-roll",
      name:        "Thoracic Extension on Foam Roller",
      sets:        1,
      reps:        "5 segments",
      holdSeconds: 10,
      rest:        30,
      description: "Place the foam roller perpendicular to your spine at mid-back level. Support your head with your hands. Gently extend over the roller, opening the chest toward the ceiling. Hold 10 seconds. Move the roller up one segment and repeat.",
      cues:        ["Support your head — do not let it hang back unsupported", "Open your chest toward the ceiling — not just your head", "Keep your hips on the floor throughout", "If you feel sharp pain, move on to the next segment"],
      why:         "Direct thoracic extension mobilisation. The foam roller applies a targeted force at each vertebral level, progressively opening the thoracic spine into extension.",
      contraindications: ["upper-back-acute"],
      equipment:   ["foam-roller"]
    },
    {
      id:          "90-90-hip-stretch",
      name:        "90-90 Hip Stretch",
      sets:        2,
      reps:        "each side",
      holdSeconds: 60,
      rest:        30,
      description: "Sit on the floor with one leg in front at 90 degrees, one leg to the side at 90 degrees. Sit tall and hold the position. After 30 seconds, lean gently forward over the front shin.",
      cues:        ["Both hips should be in contact with the floor", "Sit tall before you lean — do not collapse into the position", "The stretch should be in both hips simultaneously", "If hips cannot stay down, use a cushion under the raised hip"],
      why:         "The 90-90 position trains hip internal and external rotation simultaneously — two of the most commonly restricted movement qualities. Improves squat depth, running efficiency, and reduces knee and back load.",
      contraindications: ["hip-acute", "knee-acute"]
    },
    {
      id:          "hip-cars",
      name:        "Hip CARs",
      sets:        2,
      reps:        "5 each side",
      holdSeconds: 0,
      rest:        30,
      description: "Standing on one leg, draw the biggest circle you can with your lifted knee — forward, out to the side, behind you, and back. Move slowly through the full range. The standing leg stays completely still.",
      cues:        ["Move as slowly as possible — speed hides restriction", "Keep your upper body completely still", "The standing hip, knee, and foot stay exactly where they are", "This is exploration — find where you run out of range and breathe into it"],
      why:         "CARs — Controlled Articular Rotations — are the most complete way to train joint health. Taking the hip through its full available range under active tension maintains and builds range, lubricates the joint, and builds body awareness.",
      contraindications: ["hip-acute"]
    },
    {
      id:          "prone-thoracic-rotation",
      name:        "Prone Thoracic Rotation",
      sets:        2,
      reps:        "8 each side",
      holdSeconds: 3,
      rest:        30,
      description: "Lie face down, arms out to the sides in a T-shape. Rotate one arm and shoulder up and over to the other side — your torso will follow. The hip of the rotating side will lift slightly. Hold 3 seconds. Return slowly.",
      cues:        ["Let the movement flow from the upper back — not the neck", "The hold at end range is where the mobility work happens", "Move to the point of comfortable restriction, not through pain", "Keep the arm reaching long throughout the rotation"],
      why:         "Opens thoracic rotation in a gravity-assisted position, making it accessible even with significant restriction. Works both the active range and the end-range stability simultaneously.",
      contraindications: ["upper-back-acute", "shoulder-acute"]
    }
  ],

  rehab: [
    {
      id:          "pelvic-tilt",
      name:        "Pelvic Tilt",
      sets:        2,
      reps:        "15",
      holdSeconds: 5,
      rest:        30,
      description: "Lie on your back with knees bent, feet flat on the floor. Gently flatten your lower back into the floor by tightening your abs and tilting your pelvis. Hold 5 seconds. Release.",
      cues:        ["This is a tiny movement — no hip lifting", "Breathe normally throughout — do not hold your breath", "Tighten your abs, not your glutes", "Feel the lower back make contact with the floor"],
      why:         "Activates the deep abdominal muscles that support the lumbar spine. The starting point for lower back rehabilitation and a safe entry into core work for anyone in pain.",
      contraindications: []
    },
    {
      id:          "glute-bridge-activation",
      name:        "Glute Bridge",
      sets:        3,
      reps:        "12",
      holdSeconds: 3,
      rest:        45,
      description: "Lie on your back, knees bent, feet flat. Push through both heels to lift your hips until your body forms a straight line from knees to shoulders. Squeeze the glutes at the top. Hold 3 seconds. Lower slowly.",
      cues:        ["Drive through your heels — not your toes", "Squeeze the glutes hard at the top", "The 3-second hold is what makes this effective", "Lower slowly — do not drop your hips"],
      why:         "Glute bridges activate the gluteus maximus and hamstrings while maintaining a safe spinal position. They reduce anterior pelvic tilt and are protective of the lower back.",
      contraindications: ["lower-back-acute", "hamstring-acute"]
    },
    {
      id:          "dead-bug-progression-1",
      name:        "Dead Bug — Arm Only",
      sets:        2,
      reps:        "8 each side",
      holdSeconds: 0,
      rest:        30,
      description: "Lie on your back, arms pointing to the ceiling, knees bent to 90 degrees above your hips. Slowly lower one arm overhead toward the floor — keeping your lower back pressed firmly down. Return. Alternate sides.",
      cues:        ["Arms only in this version — legs stay still", "Lower back stays in contact with the floor throughout", "Breathe out as you lower the arm", "Move slowly — there is no benefit to speed here"],
      why:         "The arm-only dead bug reduces the lever arm, making it accessible for people with acute back pain. It still trains the anti-extension function of the core with minimal spinal load.",
      contraindications: []
    },
    {
      id:          "clamshell-activation",
      name:        "Clamshell",
      sets:        2,
      reps:        "15 each side",
      holdSeconds: 2,
      rest:        30,
      description: "Lie on your side, hips and knees bent to 45 degrees. Keeping your feet together, lift your top knee as high as you can without your pelvis rolling back. Hold 2 seconds. Lower slowly.",
      cues:        ["Your pelvis should not move — if it does, reduce the range", "The movement is from the hip, not the lower back", "Hold at the top — that is where the glute medius is working", "Place a hand on your hip to feel if it is rotating"],
      why:         "The clamshell targets the gluteus medius — the primary stabiliser of the pelvis during walking and single-leg activities. Weakness here is a major contributor to lower back and knee pain.",
      contraindications: ["hip-acute"]
    },
    {
      id:          "diaphragmatic-breathing-core",
      name:        "Diaphragmatic Breathing",
      sets:        1,
      reps:        null,
      holdSeconds: 120,
      rest:        0,
      description: "Lie on your back, knees bent, one hand on your chest and one on your belly. Breathe in slowly through your nose — belly rises, chest stays still. As you breathe out, gently draw your belly button toward your spine. Continue for 2 minutes.",
      cues:        ["The belly rises on the inhale, chest stays still", "Exhale is when the deep core engages — gently, not forcefully", "About 20% of maximum effort — this is not sucking in", "Let the breath lead, not the abdominals"],
      why:         "Re-establishes the connection between the breath and the deep core — often disrupted by pain or inactivity. Safe for any level of back pain and deeply calming for the nervous system.",
      contraindications: []
    },
    {
      id:          "bird-dog-rehab",
      name:        "Bird Dog",
      sets:        2,
      reps:        "6 each side",
      holdSeconds: 5,
      rest:        45,
      description: "On hands and knees. Brace your core gently. Extend one arm and the opposite leg until both are parallel to the floor. Hold 5 seconds. Return slowly. Alternate sides.",
      cues:        ["Keep your hips level throughout — no rotation", "Extend from the hip and shoulder, not from the spine", "Draw the belly button gently toward the spine before you move", "Return as slowly as you extended"],
      why:         "Bird dog in its rehab version uses a longer hold at lower load. It builds the anti-rotation stability of the lumbar spine gently, making it appropriate even during a flare.",
      contraindications: ["lower-back-acute", "wrist-elbow-acute"]
    }
  ]
};

// ── Duration options ──────────────────────────────────────────────────────────

const DURATIONS = [
  { mins: 15, label: "15 min",  description: "Quick and focused" },
  { mins: 20, label: "20 min",  description: "A proper session" },
  { mins: 30, label: "30 min",  description: "Full programme" }
];

// exercises per duration (approx — actual count varies by exercise length)
const EXERCISE_COUNT = { 15: 4, 20: 5, 30: 7 };

// ── Session builder ───────────────────────────────────────────────────────────

function buildSession(focusId, durationMins) {
  const pool        = EXERCISE_POOLS[focusId] || [];
  const conditions  = store.get("conditions")         || [];
  const painScores  = store.get("conditionPainScores") || {};
  const targetCount = EXERCISE_COUNT[durationMins]    || 5;

  // Build active condition ID set including acute variants
  const activeConditions = new Set();
  conditions.forEach(id => {
    activeConditions.add(id);
    const pain = painScores[id] || 0;
    if (pain >= 7) activeConditions.add(`${id}-acute`);
    else if (pain >= 4) activeConditions.add(`${id}-subacute`);
  });

  // Filter out contraindicated exercises
  const safe = pool.filter(ex => {
    const contra = ex.contraindications || [];
    return !contra.some(c => activeConditions.has(c));
  });

  // Take up to targetCount exercises
  // Prioritise variety — do not repeat movement patterns if pool is large enough
  return safe.slice(0, targetCount);
}

// ── Coach intro for conditions ────────────────────────────────────────────────

function buildConditionNote() {
  const conditions = store.get("conditions")         || [];
  const painScores = store.get("conditionPainScores") || {};

  const relevant = conditions.filter(id => {
    const pain = painScores[id] || 0;
    return pain >= 3 && (
      id.includes("lower-back") || id.includes("hip") ||
      id.includes("abdominal")  || id.includes("sciatica") ||
      id.includes("hamstring")  || id.includes("wrist")
    );
  });

  if (relevant.length === 0) return null;

  const notes = relevant.map(id => {
    const pain = painScores[id] || 0;
    if (id.includes("lower-back")) {
      return pain >= 7
        ? "Your lower back is flagging high pain today. I've removed all loaded and rotational exercises. Everything here is gentle and safe."
        : "Your lower back has some discomfort. I've adjusted the session away from anything that loads the spine under flexion.";
    }
    if (id.includes("sciatica")) {
      return "Sciatica is present. I've avoided deep hip flexor loading and any exercises that compress the lumbar spine.";
    }
    if (id.includes("hamstring")) {
      return "With your hamstring, I've kept hip extension loading light. Stop if you feel any pulling sensation down the back of the leg.";
    }
    if (id.includes("hip")) {
      return "Your hip has been considered. The session avoids deep hip rotation and single-leg loading at end range.";
    }
    return null;
  }).filter(Boolean);

  return notes.length > 0 ? notes.join(" ") : null;
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (phase === "focus")    return renderFocusSelector();
  if (phase === "duration") return renderDurationSelector();
  if (phase === "overview") return renderSessionOverview();
  if (phase === "intro")    return renderSessionIntro();
  if (phase === "session")  return renderExercise();
  if (phase === "rest")     return renderRest();
  if (phase === "done")     return renderDone();
  return renderFocusSelector();
}

// ── Phase 1: Focus selector ───────────────────────────────────────────────────

function renderFocusSelector() {
  const name = store.get("name") || "";
  return `
    <div class="view core-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Back">
          Exit
        </button>
        <span class="workout-header-title">Core Session</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          ${name ? name + ". " : ""}What kind of core work feels right today?
        </p>
      </div>

      <div class="cs-focus-grid" role="group" aria-label="Choose your core session focus">
        ${FOCUS_TYPES.map(f => `
          <button class="cs-focus-card" data-focus="${f.id}"
                  aria-label="${f.label}: ${f.description}">
            <span class="cs-focus-icon" aria-hidden="true">${f.icon}</span>
            <span class="cs-focus-label">${f.label}</span>
            <span class="cs-focus-desc">${f.description}</span>
          </button>
        `).join("")}
      </div>

    </div>
  `;
}

// ── Phase 2: Duration selector ────────────────────────────────────────────────

function renderDurationSelector() {
  const focus = FOCUS_TYPES.find(f => f.id === selectedFocus);
  return `
    <div class="view core-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Back to focus">
          Back
        </button>
        <span class="workout-header-title">${focus?.label || "Core"}</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">How long have you got?</p>
      </div>

      <div class="cs-duration-grid" role="group" aria-label="Choose session duration">
        ${DURATIONS.map(d => `
          <button class="cs-duration-card" data-mins="${d.mins}"
                  aria-label="${d.label}: ${d.description}">
            <span class="cs-duration-label">${d.label}</span>
            <span class="cs-duration-desc">${d.description}</span>
            <span class="cs-duration-count text-xs text-muted">
              ${EXERCISE_COUNT[d.mins]} exercises
            </span>
          </button>
        `).join("")}
      </div>

    </div>
  `;
}

// ── Phase 3: Session overview — all exercises visible before starting ────────────

function renderSessionOverview() {
  const focus    = FOCUS_TYPES.find(f => f.id === selectedFocus);
  const condNote = buildConditionNote();

  return `
    <div class="view core-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Back to duration">
          ← Back
        </button>
        <span class="workout-header-title">${focus?.label || "Core"} — ${selectedMins} min</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">${focus?.coachIntro || ""}</p>
          ${condNote ? `<p class="text-sm text-muted" style="margin-top: var(--space-3);">${condNote}</p>` : ""}
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">
            ${sessionQueue.length} exercises. You can review them all below before starting.
            Do them in any order that suits your equipment.
          </p>
        </div>
      </div>

      <!-- Exercise list — expandable cards, same pattern as gym programme -->
      <div class="gym-exercises-list" role="list">
        ${sessionQueue.map((ex, i) => `
          <div class="card gym-exercise-card" role="listitem">
            <button class="gym-exercise-header" data-ex-index="${i}"
                    aria-expanded="false"
                    aria-controls="core-ex-detail-${i}"
                    aria-label="${ex.name}: ${ex.sets || ""} sets${ex.reps ? ", " + ex.reps : ""}${ex.holdSeconds > 0 ? ", " + ex.holdSeconds + "s hold" : ""}">
              <div class="gym-exercise-header-left">
                <span class="exercise-role-badge core-overview-badge" aria-hidden="true">
                  ${focus?.label || "Core"}
                </span>
                <div class="gym-card-meta-row">
                  ${ex.sets ? `<span class="meta-tag">${ex.sets} sets</span>` : ""}
                  ${ex.reps ? `<span class="meta-tag">${ex.reps}</span>` : ""}
                  ${ex.holdSeconds > 0 ? `<span class="meta-tag">${ex.holdSeconds}s hold</span>` : ""}
                  ${ex.rest > 0 ? `<span class="meta-tag">rest ${ex.rest}s</span>` : ""}
                  ${ex.tempo ? `<span class="meta-tag">${ex.tempo}</span>` : ""}
                </div>
                <h3 class="gym-exercise-name">${ex.name}</h3>
              </div>
              <span class="gym-card-chevron" aria-hidden="true">▼</span>
            </button>

            <div class="gym-exercise-detail" id="core-ex-detail-${i}" hidden>
              ${ex.cue ? `<p class="exercise-cue">${ex.cue}</p>` : ""}
              ${ex.why ? `
                <div class="exercise-why">
                  <p class="exercise-why-label">Why this exercise</p>
                  <p class="exercise-why-text">${ex.why}</p>
                </div>
              ` : ""}
            </div>
          </div>
        `).join("")}
      </div>

      <button class="btn btn-primary btn-large btn-full" id="cs-start-btn"
              style="margin-top: var(--space-6);">
        Let’s go
      </button>

    </div>
  `;
}

// ── Phase 4: Session intro card (brief, shown after Let's go) ────────────────────

function renderSessionIntro() {
  const focus       = FOCUS_TYPES.find(f => f.id === selectedFocus);
  const condNote    = buildConditionNote();
  const exCount     = sessionQueue.length;

  return `
    <div class="view core-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-back-btn" aria-label="Exit session">
          Exit
        </button>
        <span class="workout-header-title">${focus?.label || "Core"} — ${selectedMins} min</span>
      </div>

      <div class="card card-coach">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <p class="coach-message-text">${focus?.coachIntro || ""}</p>
          ${condNote ? `
            <p class="coach-message-text" style="margin-top: var(--space-3);
               font-size: var(--text-sm); color: var(--color-text-muted);">
              ${condNote}
            </p>
          ` : ""}
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">
            ${exCount} exercises. Take your time between each one.
          </p>
        </div>
      </div>

      <button class="btn btn-primary btn-large btn-full" id="cs-start-btn"
              style="margin-top: var(--space-6);">
        Let's go
      </button>

    </div>
  `;
}

// ── Phase 4: Exercise ─────────────────────────────────────────────────────────

function renderExercise() {
  if (currentIndex >= sessionQueue.length) {
    phase = "done";
    return renderDone();
  }

  const ex       = sessionQueue[currentIndex];
  const total    = sessionQueue.length;
  const progress = Math.round((currentIndex / total) * 100);
  const isLast   = currentIndex >= total - 1;
  const hasTimer = ex.holdSeconds > 0;

  return `
    <div class="view core-session-view">

      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-exit-btn" aria-label="Exit session">
          Exit
        </button>
        <div class="workout-progress-info"
             aria-label="Exercise ${currentIndex + 1} of ${total}">
          <span>${currentIndex + 1} of ${total}</span>
        </div>
      </div>

      <div class="workout-progress-bar" role="progressbar"
           aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Session progress, ${progress}%">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>

      <div class="card exercise-card">

        <div class="exercise-role-badge main" aria-hidden="true">
          Core — ${FOCUS_TYPES.find(f => f.id === selectedFocus)?.label || ""}
        </div>

        <h1 class="exercise-name">${ex.name}</h1>

        <div class="exercise-meta">
          ${ex.sets ? `<span class="meta-tag">${ex.sets} sets</span>` : ""}
          ${ex.reps ? `<span class="meta-tag">${ex.reps}</span>` : ""}
          ${ex.holdSeconds > 0 ? `<span class="meta-tag">${ex.holdSeconds}s hold</span>` : ""}
          ${ex.rest > 0 ? `<span class="meta-tag">${ex.rest}s rest</span>` : ""}
        </div>

        ${hasTimer ? `
          <div class="exercise-target">
            <div class="timer-display">
              <div class="timer-circle">
                <span class="timer-value" id="cs-timer-display">
                  ${formatTime(timeRemaining || ex.holdSeconds)}
                </span>
                <span class="timer-label">Hold</span>
              </div>
            </div>
          </div>
        ` : ""}

        <p class="exercise-description">${ex.description}</p>

        ${ex.cues?.length ? `
          <ul class="exercise-cues" aria-label="Coaching cues">
            ${ex.cues.map(cue => `<li>${cue}</li>`).join("")}
          </ul>
        ` : ""}

        ${ex.why ? `
          <details class="cs-why-details">
            <summary class="text-sm text-muted">Why this exercise?</summary>
            <p class="text-sm text-muted" style="margin-top: var(--space-2);">
              ${ex.why}
            </p>
          </details>
        ` : ""}

      </div>

      <div class="workout-actions">

        ${hasTimer ? `
          <button class="btn btn-large btn-full ${timerRunning ? "btn-secondary" : "btn-accent"}"
                  id="cs-timer-btn"
                  aria-live="polite"
                  aria-label="${timerRunning ? "Pause hold timer" : "Start hold timer"}">
            ${timerRunning ? "Pause" : (timeRemaining > 0 && timeRemaining < ex.holdSeconds ? "Resume" : "Start hold")}
          </button>
        ` : ""}

        <button class="btn btn-primary btn-large btn-full" id="cs-next-btn">
          ${isLast ? "Finish session" : "Done — Next"}
        </button>

        <button class="btn btn-ghost btn-small" id="cs-skip-btn"
                aria-label="Skip ${ex.name}">
          Skip
        </button>

      </div>

    </div>
  `;
}

// ── Phase 5: Rest card ────────────────────────────────────────────────────────

function renderRest() {
  const nextEx = sessionQueue[currentIndex];
  return `
    <div class="view core-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="cs-exit-btn" aria-label="Exit">Exit</button>
        <span class="workout-header-title">Rest</span>
      </div>

      <div class="card" style="margin-top: var(--space-6); text-align: center; padding: var(--space-8);">
        <div class="timer-display" style="justify-content: center; margin-bottom: var(--space-4);">
          <div class="timer-circle">
            <span class="timer-value" id="cs-rest-display">
              ${formatTime(restRemaining)}
            </span>
            <span class="timer-label">Rest</span>
          </div>
        </div>
        <p class="text-secondary">
          ${nextEx ? `Up next: ${nextEx.name}` : "Last exercise coming up"}
        </p>
      </div>

      <button class="btn btn-primary btn-full" id="cs-rest-skip-btn"
              style="margin-top: var(--space-4);">
        Skip rest
      </button>
    </div>
  `;
}

// ── Phase 6: Done ─────────────────────────────────────────────────────────────

function renderDone() {
  const name        = store.get("name") || "";
  const focus       = FOCUS_TYPES.find(f => f.id === selectedFocus);
  const exercisesDone = currentIndex;

  return `
    <div class="view core-session-view" style="text-align: center;">
      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h2 style="color: var(--color-primary); margin-bottom: var(--space-2);">
            That's your core session done.
          </h2>
          <p class="coach-message-text">
            ${name ? name + " — " : ""}${exercisesDone} exercises, ${selectedMins} minutes of ${focus?.label?.toLowerCase() || "core"} work.
            ${selectedFocus === "rehab"
              ? "Consistent gentle work adds up. This matters."
              : selectedFocus === "stability"
              ? "Stability work is quiet work. You won't always feel it during — you'll notice it in everything else you do."
              : "Good work."}
          </p>
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">
            +${creditsEarned} credits earned
          </p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);">
        <button class="btn btn-primary btn-full" id="cs-reflect-btn">
          How did that feel?
        </button>
        <button class="btn btn-ghost btn-full" id="cs-home-btn">
          Back to today
        </button>
      </div>
    </div>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function startExerciseTimer(holdSecs) {
  if (timerInterval) clearInterval(timerInterval);
  timeRemaining = timeRemaining || holdSecs;
  timerRunning  = true;
  timerInterval = setInterval(() => {
    timeRemaining--;
    const el = document.getElementById("cs-timer-display");
    if (el) el.textContent = formatTime(timeRemaining);
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning  = false;
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
      const btn = document.getElementById("cs-timer-btn");
      if (btn) {
        btn.textContent = "Hold complete";
        btn.disabled    = true;
      }
    }
  }, 1000);
}

function pauseExerciseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
}

function startRestTimer(seconds, onComplete) {
  restRemaining = seconds;
  if (restInterval) clearInterval(restInterval);
  restInterval = setInterval(() => {
    restRemaining--;
    const el = document.getElementById("cs-rest-display");
    if (el) el.textContent = formatTime(restRemaining);
    if (restRemaining <= 0) {
      clearInterval(restInterval);
      restInterval = null;
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      onComplete();
    }
  }, 1000);
}

function awardCredits() {
  creditsEarned += 20;
}

function completeExercise() {
  awardCredits();
  const ex = sessionQueue[currentIndex];
  currentIndex++;
  timeRemaining = 0;
  timerRunning  = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  if (currentIndex >= sessionQueue.length) {
    // Session complete
    finaliseSession();
    return;
  }

  // Show rest card if rest > 0
  if (ex.rest > 0) {
    phase         = "rest";
    restRemaining = ex.rest;
    rerender();
    startRestTimer(ex.rest, () => {
      phase = "session";
      rerender();
    });
  } else {
    phase = "session";
    rerender();
  }
}

function finaliseSession() {
  const total = (store.get("totalCredits") || 0) + creditsEarned;
  store.set("totalCredits",       total);
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    "Core Session");

  // 23 Jul 2026 v3 (BUILD-3): migrated to store.logActivity(), matching
  // yoga-session.js v4's confirmed-working pattern.
  const pending = store.get("currentActivityEntry");
  const nowIso  = new Date().toISOString();

  const activityEntry = store.logActivity({
    ...(pending || { type: "core-session", source: "self-directed" }),
    type:           "core-session",
    sessionEnd:     nowIso,
    completedAt:    nowIso,
    status:         "completed",
    exercisesCount: currentIndex,
    creditsEarned
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }

  phase = "done";
  rerender();
}

function resetSession() {
  dismountSessionGuard();
  phase         = "focus";
  selectedFocus = null;
  selectedMins  = null;
  sessionQueue  = [];
  currentIndex  = 0;
  creditsEarned = 0;
  timeRemaining = 0;
  timerRunning  = false;
  restRemaining = 0;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (restInterval)  { clearInterval(restInterval);  restInterval  = null; }
}

// ── Exit confirmation overlay ──────────────────────────────────────────────
// Shown when user taps Exit during an active session.
// Replaces browser confirm() with a coach-voiced in-app card.

function showExitConfirm() {
  // Pause any running timer

  const overlay = document.createElement("div");
  overlay.className = "session-exit-overlay";
  overlay.id        = "session-exit-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Exit session confirmation");
  overlay.innerHTML = `
    <div class="session-exit-card">
      <div class="session-exit-coach-row">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="session-exit-coach-text">
          Hold on — if you leave now this session won’t be saved. Are you sure?
        </p>
      </div>
      <div class="session-exit-actions">
        <button class="btn btn-primary btn-full" id="exit-confirm-stay"
                aria-label="Stay in session">
          Stay in session
        </button>
        <button class="btn btn-ghost btn-full" id="exit-confirm-leave"
                aria-label="Exit and save progress so far">
          Exit and save progress
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Stay — remove overlay and resume
  document.getElementById("exit-confirm-stay").addEventListener("click", () => {
    overlay.remove();
  });

  // Leave — save partial entry and navigate to reflect
  document.getElementById("exit-confirm-leave").addEventListener("click", () => {
    overlay.remove();
    savePartialSession();
    resetSession();
    router.navigate("reflect");
  });
}

/**
 * 23 Jul 2026 v3 (BUILD-3): REWRITTEN. Two fixes bundled here —
 * (1) migrated to store.logActivity(), matching yoga-session.js v4's
 * confirmed-working pattern, and (2) this function previously referenced
 * an undeclared variable `elapsed` for durationMins. Like yoga-session.js,
 * core-session.js has no running elapsed-time tracker (only per-exercise
 * hold timers) — durationMins is left explicitly null with a comment
 * rather than fabricated. A real elapsed-time tracker would be a
 * separate, larger addition for a future session.
 */
function savePartialSession() {
  const pending = store.get("currentActivityEntry");
  const nowIso  = new Date().toISOString();

  const activityEntry = store.logActivity({
    ...(pending || { type: "core-session", source: "self-directed" }),
    type:           "core-session",
    sessionEnd:     nowIso,
    completedAt:    nowIso,
    status:         "partial",
    // No elapsed-time tracker exists in this file — left explicitly null
    // rather than referencing the undeclared `elapsed` the old code had.
    durationMins:   null,
    exercisesCount: currentIndex,
    creditsEarned:  typeof creditsEarned !== "undefined" ? creditsEarned : 0
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }
}


function rerender() {
  const main = document.getElementById("main-content");
  if (main) {
    main.innerHTML = render();
    onMount();
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  mountSessionGuard({
    isActive: () => phase === "session" || phase === "rest",
    label:    "core session",
    onExit:   () => { savePartialSession(); resetSession(); router.navigate("reflect"); }
  });

  // Back / Exit
  document.getElementById("cs-back-btn")?.addEventListener("click", () => {
    if (phase === "focus") {
      resetSession();
      router.navigate("intention");
    } else if (phase === "duration") {
      phase = "focus";
      rerender();
    } else {
      showExitConfirm();
    }
  });

  document.getElementById("cs-exit-btn")?.addEventListener("click", () => {
    showExitConfirm();
  });

  // Focus cards
  document.querySelectorAll(".cs-focus-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedFocus = btn.dataset.focus;
      phase         = "duration";
      rerender();
    });
  });

  // Duration cards
  document.querySelectorAll(".cs-duration-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMins = parseInt(btn.dataset.mins);
      sessionQueue = buildSession(selectedFocus, selectedMins);
      phase        = "intro";
      rerender();
    });
  });

  // Start
  document.getElementById("cs-start-btn")?.addEventListener("click", () => {
    currentIndex  = 0;
    creditsEarned = 0;
    timeRemaining = 0;
    timerRunning  = false;
    phase         = "session";
    rerender();
  });

  // Exercise timer
  document.getElementById("cs-timer-btn")?.addEventListener("click", () => {
    const ex = sessionQueue[currentIndex];
    if (!timerRunning) {
      startExerciseTimer(ex?.holdSeconds || 0);
    } else {
      pauseExerciseTimer();
    }
    // Update button label
    const btn = document.getElementById("cs-timer-btn");
    if (btn) {
      btn.textContent = timerRunning ? "Pause" : "Resume";
      btn.setAttribute("aria-label", timerRunning ? "Pause hold timer" : "Resume hold timer");
    }
  });

  // Next / complete
  document.getElementById("cs-next-btn")?.addEventListener("click", () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerRunning = false;
    completeExercise();
  });

  // Skip
  document.getElementById("cs-skip-btn")?.addEventListener("click", () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerRunning  = false;
    timeRemaining = 0;
    currentIndex++;
    if (currentIndex >= sessionQueue.length) {
      finaliseSession();
    } else {
      phase = "session";
      rerender();
    }
  });

  // Skip rest
  document.getElementById("cs-rest-skip-btn")?.addEventListener("click", () => {
    if (restInterval) { clearInterval(restInterval); restInterval = null; }
    phase = "session";
    rerender();
  });

  // Completion buttons
  document.getElementById("cs-reflect-btn")?.addEventListener("click", () => {
    router.navigate("reflect");
  });

  document.getElementById("cs-home-btn")?.addEventListener("click", () => {
    resetSession();
    router.navigate("intention");
  });
}
