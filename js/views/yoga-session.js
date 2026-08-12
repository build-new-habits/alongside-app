/**
 * yoga-session.js - Guided Yoga and Pilates Session
 * 12 Aug 2026 v4
 *
 * v4 - GM-1. Grounding moments on the pose card. Yoga is the natural
 *   home for these: it is already the frame, and a pose held still is
 *   exactly the plank case Graeme described.
 *
 * 12 Aug 2026 v3
 *
 * v3 - LOG-2. Session notes on the pose card, in "gentle" mode: duration
 *   and a free note only, no reps and no level. Graeme, 12 Aug. A pose is
 *   not a set, and "wobbled on tree pose, right side stiff" is genuinely
 *   useful next week in a way a number is not.
 *
 * 11 Aug 2026 v8
 *
 * v8 — WOW-1 (PT-3, Persona Tracing Wave 1). Added a session-level
 *   clock (sessionStartTime + elapsedMins()) and wired it into every
 *   activityLog write. This view previously reported no duration at all,
 *   so progress.js:138 summed the person's real sessions as 0 minutes —
 *   the app telling someone who showed up that they hadn't. Set once at
 *   genuine session start, cleared on reset/cleanup. Floor of 1 minute so
 *   a real completion never reports zero.
 *
 * 10 Aug 2026 v7
 *
 * v7 — Exercise-detail consistency audit (Graeme's direct request).
 *   This file has its own private 30-object pose pool (a third,
 *   separate exercise database — flagged as a real architectural
 *   concern, not fixed tonight) with genuinely good description/cues
 *   content already, but no youtube field existed anywhere in it. Added
 *   tailored search terms to all 30 entries and wired up display in
 *   both the pre-session overview and the active-session detail view.
 *   Also fixed a second silent field-name bug, same class found
 *   elsewhere this session: pose.cue (singular, never existed) should
 *   have been pose.cues (plural array). NOT added tonight: a `why`
 *   field — this pool has no rationale content at all, and writing 30
 *   genuinely good ones is real content authoring, not a mechanical
 *   fix — deliberately left as a clean, scoped follow-up rather than
 *   rushed.
 *
 * 30 Jul 2026 v6 — On-device testing bug fix (Core Session investigation, same day,
 *   found while Graeme was walking through Step 3 of the on-device test
 *   guide). finaliseSession() set `phase = "done"` but never called
 *   rerender() — so completing a real yoga session via the main "Finish
 *   practice" button (the ys-next-btn path, advancePose() → finaliseSession()
 *   at the last pose) left the screen frozen on the last pose, appearing
 *   stuck. Confirmed via comparison: core-session.js's equivalent
 *   finaliseSession() already ends with `phase = "done"; rerender();` —
 *   yoga-session.js was missing the second line. Practical effect
 *   confirmed on-device: Graeme, seeing no response, tapped "Finish
 *   practice" a second time, which correctly triggered logActivity()'s
 *   dedupe guard (working as designed) rather than writing a duplicate —
 *   but the screen still never advanced. Fixed: one line added,
 *   `rerender();`, after `phase = "done";`. Two other call sites of
 *   finaliseSession() checked and confirmed unaffected: the "Skip" path
 *   (ys-skip-btn handler) already had its own explicit rerender() call
 *   immediately after, and the renderPose() defensive fallback returns
 *   renderDone() HTML directly rather than calling finaliseSession()
 *   mid-render, so neither needed this fix.
 * 30 Jul 2026 v5 — Core Session investigation follow-up (same session, on request).
 *   Same id-reuse bug found in core-session.js also existed here:
 *   finaliseSession()/savePartialSession() spread `pending` unconditionally,
 *   so a stale already-logged currentActivityEntry (left behind when this
 *   file is entered directly from library.js's "Yoga / Pilates" card,
 *   bypassing intention.js) could have its id reused by the next
 *   completion. Unlike core-session, yoga's pending IS sometimes genuine
 *   (via intention.js), so the fix distinguishes rather than always
 *   discarding: a pending entry carrying `status` is stale (every
 *   logActivity()-written entry has one; intention.js's fresh entry never
 *   does) and is now discarded instead of spread. See both functions'
 *   comments for full reasoning.
 * 21 Jul 2026 v4 — Bug fix, discovered while ground-truthing the exit-guard contract
 *   for the nav escape-hatch session (navfix-proposalloop). The onExit
 *   callback passed to mountSessionGuard() (fired on back-gesture exit,
 *   and now also on Home-icon exit via session-guard.js v2's
 *   requestExit()) reset the session and navigated to reflect.js WITHOUT
 *   calling savePartialSession() first — meaning any yoga session exited
 *   via back-gesture (or the new Home icon) since v1 lost its partial
 *   progress silently. The on-screen Exit button's own handler
 *   (showExitConfirm(), unchanged) always called savePartialSession()
 *   correctly — only the guard's onExit path was missing it. Fixed:
 *   onExit now calls savePartialSession() before reset, matching the
 *   Exit button exactly. No other change in this file from v3.
 *   Not yet checked: whether the other 10 session view files have the
 *   same gap in their own mountSessionGuard() onExit callbacks.
 *
 * v3 (S4-B3-3) — Confirmed root-cause fix. finaliseSession() and
 *   savePartialSession() were both taking the entry already sitting in
 *   currentActivityEntry (originally written by coach-reflection.js's
 *   phantom pre-write — see coach-reflection.js v5), mutating it, and
 *   unconditionally APPENDING it to activityLog as a brand new array
 *   element — never checking whether an entry already existed. Since
 *   coach-reflection.js also always pre-wrote that same entry, every
 *   single completed (or partially-exited) yoga session produced TWO
 *   permanent activityLog entries, guaranteed, every time. Confirmed
 *   on-device by reading both files together this session — this was a
 *   same-file duplicate-append, a worse pattern than the cross-file
 *   Gym case (workout.js / coach-reflection.js), which only double-wrote
 *   because two separate files were each unaware of the other.
 *
 *   Fixed at the root: coach-reflection.js no longer pre-writes an entry
 *   at all — currentActivityEntry is pending, in-memory data only until
 *   genuine completion. finaliseSession() and savePartialSession() here
 *   now build the completion fields and call the new shared
 *   store.logActivity(), which creates exactly one entry and also
 *   carries a dedupe guard as a backstop. currentActivityEntry is
 *   re-set to the entry logActivity() returns, so if the user goes on to
 *   tap "How did that feel?" (routing to reflect.js), reflect.js can
 *   find and update this same entry by id, same as every other activity
 *   type.
 *
 *   Also noted, not fixed: savePartialSession() referenced an undeclared
 *   variable `elapsed` for durationMins on a partial exit. This file has
 *   no running elapsed-time tracker at all (only per-pose hold timers),
 *   so durationMins on a partial exit is left explicitly null with a
 *   comment rather than fabricated — building a real elapsed-time
 *   tracker is a separate, larger addition, flagged for a future session
 *   rather than invented here.
 *
 * v1.1 — Correct import paths for js/views/ location:
 *   ../store.js (not ./store.js)
 *   ../data/exercises/yoga.js (not ./data/exercises/yoga.js)
 *   ../data/exercises/pilates.js (not ./data/exercises/pilates.js)
 *
 * v1.0 — Six focus types, three durations.
 *   Focus: flexibility | strength | balance | recovery | mindful | pilates
 *   Durations: 20 / 30 / 45 minutes
 *   Condition-aware — avoids contraindicated poses.
 *   Each pose shown one at a time with hold timer and coaching cues.
 *
 * Route: yoga-session
 * Nav: hidden (session view)
 */

import { store } from "../store.js";
import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
import { renderLogBlock, attachLogEvents } from "../session-log.js";
import { selectMoment, recordMomentShown, dismissMoment } from "../data/grounding-moments.js";

export const centered = false;

// ── Session state ─────────────────────────────────────────────────────────────
let phase         = "focus";    // "focus" | "duration" | "overview" | "session" | "rest" | "done"
let selectedFocus = null;
let selectedMins  = null;
let sessionQueue  = [];
let currentIndex  = 0;
let timerInterval = null;
let timeRemaining = 0;
let timerRunning  = false;
let creditsEarned = 0;
let restInterval  = null;

// 11 Aug 2026 — WOW-1 (PT-3). Session-level elapsed time. This view had
// no session clock at all, so every completion wrote durationMins null/
// absent and progress.js:138 summed it as 0 — a person's real sessions
// read back as zero minutes. Pattern mirrors gym-programme.js:806, which
// already does this correctly. Set once at genuine session start, cleared
// on reset, so rest-timer re-entries into the session phase can't reset it.
let sessionStartTime = null;

function elapsedMins() {
  if (!sessionStartTime) return null;
  return Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
}

let restRemaining = 0;

// ── Focus type definitions ────────────────────────────────────────────────────

const FOCUS_TYPES = [
  {
    id:          "flexibility",
    label:       "Flexibility",
    icon:        "\uD83E\uDD38",
    description: "Lengthen muscles and increase range of motion.",
    coachIntro:  "Flexibility work is slow and intentional. We are not forcing range — we are inviting it. Breathe into restriction and let the body respond in its own time.",
  },
  {
    id:          "strength",
    label:       "Strength",
    icon:        "\uD83D\uDCAA",
    description: "Build strength through sustained holds and active poses.",
    coachIntro:  "Yoga strength is different from gym strength. We are building tension through held positions and controlled transitions. Expect to feel this the next day.",
  },
  {
    id:          "balance",
    label:       "Balance",
    icon:        "\u2696\uFE0F",
    description: "Single-leg standing work, spatial awareness and control.",
    coachIntro:  "Balance work trains the nervous system as much as the body. When you wobble — that is normal and productive. It means you are at the edge of your current ability.",
  },
  {
    id:          "recovery",
    label:       "Recovery",
    icon:        "\uD83C\uDF19",
    description: "Gentle restorative poses. Good for rest days and sore muscles.",
    coachIntro:  "Recovery yoga is passive and warm. We are not trying to achieve anything except letting the body soften. If you fall asleep in Savasana, that is a result, not a failure.",
  },
  {
    id:          "mindful",
    label:       "Mindful flow",
    icon:        "\uD83C\uDF3F",
    description: "Breath-linked movement with noticing prompts.",
    coachIntro:  "Mindful flow connects movement to breath. Every transition happens on an exhale. I will check in with you along the way with something to notice.",
  },
  {
    id:          "pilates",
    label:       "Pilates",
    icon:        "\uD83E\uDDD8",
    description: "Core-centred controlled movement. Mat-based.",
    coachIntro:  "Pilates is precise, controlled, and deceptively demanding. The work comes from maintaining perfect alignment throughout the movement, not from the movement itself.",
  }
];

// ── Duration options ──────────────────────────────────────────────────────────

const DURATIONS = [
  { mins: 20, label: "20 min", description: "Short session"    },
  { mins: 30, label: "30 min", description: "Full practice"    },
  { mins: 45, label: "45 min", description: "Deep session"     }
];

// ── Exercise pools by focus ───────────────────────────────────────────────────
// Each entry: { id, name, holdSeconds, rest, cues, description }
// holdSeconds = duration to hold the pose
// rest = seconds of rest card between poses

const EXERCISE_POOLS = {

  flexibility: [
    { id: "yoga-downward-dog",      name: "Downward Facing Dog", youtube: "downward facing dog yoga pose tutorial",    holdSeconds: 45, rest: 15,
      description: "Press into both hands, lift hips high. Pedal the feet to warm the calves.",
      cues: ["Hands shoulder-width, feet hip-width", "Press away from the floor through your palms", "Let the head drop — no tension in the neck", "Breathe slowly and hold"] },
    { id: "yoga-pigeon-pose",       name: "Pigeon Pose", youtube: "pigeon pose yoga pose tutorial",            holdSeconds: 60, rest: 10,
      description: "From downward dog, bring one shin forward. Square the hips and lower. Repeat both sides.",
      cues: ["Let the hip drop toward the floor — do not force it", "Hips should be as square as possible", "If the hip is very high, place a folded blanket beneath it", "Breathe into the front of the hip"],
      contraindications: ["hip-acute", "knee-acute"] },
    { id: "yoga-seated-forward-fold", name: "Seated Forward Fold", youtube: "seated forward fold yoga pose tutorial", holdSeconds: 45, rest: 15,
      description: "Sit with legs extended. Fold forward from the hips — not the waist. Reach toward your feet.",
      cues: ["Fold from the hip crease, not the lower back", "Soft knees if hamstrings are tight", "Let gravity do the work — no forcing", "Each exhale, soften a little further"],
      contraindications: ["lower-back-acute", "hamstring-acute"] },
    { id: "yoga-crescent-lunge",    name: "Crescent Lunge", youtube: "crescent lunge yoga pose tutorial",         holdSeconds: 40, rest: 15,
      description: "Low lunge with back knee down. Sweep arms overhead. Square the hips and sink forward.",
      cues: ["Front knee stays over the ankle", "Back heel pushes away from you", "Lift the chest, do not let it collapse", "Feel the stretch through the back hip flexor"],
      contraindications: ["knee-acute"] },
    { id: "yoga-cobra",             name: "Cobra Pose", youtube: "cobra pose yoga tutorial",             holdSeconds: 30, rest: 15,
      description: "Lie face down. Press through the hands and lift the chest. Elbows stay slightly soft.",
      cues: ["Press the pubic bone into the mat", "Shoulders away from the ears", "Elbows do not need to be straight", "Breathe into the chest"],
      contraindications: ["lower-back-acute"] },
    { id: "yoga-bridge-pose",       name: "Bridge Pose", youtube: "bridge pose yoga tutorial",            holdSeconds: 40, rest: 15,
      description: "Lie on back, knees bent. Press into both feet and lift the hips. Squeeze the glutes at the top.",
      cues: ["Push through the heels, not the toes", "Knees stay parallel — do not let them fall outward", "Interlace fingers beneath you and press the arms down", "Hold and breathe"],
      contraindications: ["lower-back-acute"] },
    { id: "yoga-corpse-pose",       name: "Savasana", youtube: "savasana corpse pose tutorial",               holdSeconds: 90, rest: 0,
      description: "Lie completely still. Arms by your sides, palms up. Close your eyes.",
      cues: ["Release every muscle deliberately", "Let the floor support you completely", "If thoughts come, let them pass without following them", "Stay here for the full hold"] },
  ],

  strength: [
    { id: "yoga-chair-pose",        name: "Chair Pose", youtube: "chair pose yoga tutorial",             holdSeconds: 45, rest: 20,
      description: "Stand, feet together. Sit back as if into a chair. Sweep arms overhead.",
      cues: ["Weight in the heels — toes should be liftable", "Knees do not travel beyond the toes", "Chest stays lifted", "Breathe and hold — it will burn"],
      contraindications: ["knee-acute"] },
    { id: "yoga-warrior-1",         name: "Warrior I", youtube: "warrior 1 yoga pose tutorial",              holdSeconds: 40, rest: 15,
      description: "Lunge with back foot turned out at 45 degrees. Square the hips to the front. Arms overhead.",
      cues: ["Back foot is the anchor — press it firmly down", "Front knee stays over the ankle", "Hips square to the front", "Lift the chest and breathe"],
      contraindications: ["knee-acute"] },
    { id: "yoga-warrior-2",         name: "Warrior II", youtube: "warrior 2 yoga pose tutorial",             holdSeconds: 40, rest: 15,
      description: "Wide stance, front foot forward, back foot parallel. Bend the front knee. Arms extended.",
      cues: ["Front knee tracks over the second toe", "Back leg is strong and straight", "Arms reach in opposite directions — equal effort", "Gaze over the front hand"],
      contraindications: ["knee-acute"] },
    { id: "yoga-warrior-3",         name: "Warrior III", youtube: "warrior 3 yoga pose tutorial",            holdSeconds: 30, rest: 20,
      description: "Balance on one leg. Tip the body forward until parallel to the floor. Arms extended.",
      cues: ["Engage the standing leg completely — no soft knee", "Hips stay square — do not let one side lift", "Arms can reach forward or back along the body", "Gaze at a fixed point on the floor"],
      contraindications: ["knee-acute", "ankle-foot-acute"] },
    { id: "yoga-boat-pose",         name: "Boat Pose", youtube: "boat pose yoga tutorial",              holdSeconds: 30, rest: 20,
      description: "Sit on the floor. Lift the feet and extend the legs. Balance on the sit bones. Arms forward.",
      cues: ["Spine stays long — do not collapse", "Bend the knees if needed to maintain a straight back", "Engage the core throughout", "Breathe — do not hold your breath"],
      contraindications: ["lower-back-acute"] },
  ],

  balance: [
    { id: "yoga-tree-pose",         name: "Tree Pose", youtube: "tree pose yoga tutorial",              holdSeconds: 45, rest: 15,
      description: "Stand on one leg. Place the other foot on the inner thigh or calf. Hands at heart or overhead.",
      cues: ["Standing foot presses down firmly and evenly", "Do not rest the foot on the knee joint", "Fix the gaze on a point that is not moving", "Each wobble is the balance system learning"],
      contraindications: ["ankle-foot-acute"] },
    { id: "yoga-half-moon",         name: "Half Moon Pose", youtube: "half moon pose yoga tutorial",         holdSeconds: 30, rest: 20,
      description: "From triangle pose, shift weight to the front foot and lift the back leg. Arm reaches to ceiling.",
      cues: ["Use a block under the lower hand if needed", "Lifted leg is parallel to the floor", "Stack the hips", "Fix the gaze on the ceiling hand"],
      contraindications: ["ankle-foot-acute", "lower-back-acute"] },
    { id: "yoga-warrior-3",         name: "Warrior III", youtube: "warrior 3 yoga pose tutorial",            holdSeconds: 30, rest: 20,
      description: "Balance on one leg. Tip forward to parallel. Arms extended or back along the body.",
      cues: ["Standing knee stays soft — not locked, not collapsed", "Drive the back heel away from you", "Keep the hips as square as possible", "Breathe steadily"],
      contraindications: ["knee-acute", "ankle-foot-acute"] },
    { id: "yoga-chair-pose",        name: "Chair Pose", youtube: "chair pose yoga tutorial",             holdSeconds: 40, rest: 15,
      description: "Sit back into an imaginary chair. Arms overhead. Hold with intention.",
      cues: ["Heels down, toes liftable", "Knees together", "Core engaged", "Hold longer than feels comfortable"],
      contraindications: ["knee-acute"] },
  ],

  recovery: [
    { id: "yoga-corpse-pose",       name: "Savasana", youtube: "savasana corpse pose tutorial",               holdSeconds: 120, rest: 0,
      description: "Lie completely still. Systematic relaxation from feet to face.",
      cues: ["Release the feet, then the calves, then the thighs", "Let the belly soften completely", "Face muscles relax last", "No effort — only stillness"] },
    { id: "yoga-bridge-pose",       name: "Gentle Bridge", youtube: "bridge pose yoga tutorial",          holdSeconds: 45, rest: 15,
      description: "Soft bridge — lift the hips gently, no strong squeeze. Just creates space in the lower back.",
      cues: ["This is passive, not powerful", "Let the hips rise naturally from the breath", "No gripping or squeezing", "Lower slowly on the exhale"],
      contraindications: ["lower-back-acute"] },
    { id: "yoga-pigeon-pose",       name: "Supported Pigeon", youtube: "pigeon pose yoga pose tutorial",       holdSeconds: 90, rest: 10,
      description: "Pigeon with the torso resting forward. Full surrender into the pose.",
      cues: ["Use a block or folded blanket under the hip if needed", "Forearms on the floor, forehead resting", "No efforting — this is passive opening", "Breathe slowly and deeply"],
      contraindications: ["hip-acute", "knee-acute"] },
    { id: "yoga-cobra",             name: "Gentle Cobra", youtube: "cobra pose yoga tutorial",           holdSeconds: 30, rest: 15,
      description: "Baby cobra — elbows remain bent, lift is small. Creates gentle opening in the chest.",
      cues: ["The lift is small — just off the mat", "No pressure in the lower back", "Breathe into the chest", "Lower on the exhale"],
      contraindications: ["lower-back-acute"] },
  ],

  mindful: [
    { id: "yoga-downward-dog",      name: "Downward Facing Dog", youtube: "downward facing dog yoga pose tutorial",    holdSeconds: 45, rest: 10,
      description: "Ground through the hands. Notice the length of the spine. Breathe into the back body.",
      cues: ["What do you notice in the back of the legs?", "Is there more tension on one side?", "Let the breath move the body gently", "No fixing — just noticing"] },
    { id: "yoga-warrior-1",         name: "Warrior I", youtube: "warrior 1 yoga pose tutorial",              holdSeconds: 40, rest: 10,
      description: "Strong and grounded. Notice where effort lives in the body right now.",
      cues: ["Where do you feel this working most?", "Is the effort effortful or can it be steady?", "Breathe and observe", "No judgment on what you find"] },
    { id: "yoga-seated-forward-fold", name: "Seated Forward Fold", youtube: "seated forward fold yoga pose tutorial", holdSeconds: 60, rest: 15,
      description: "Fold forward and be still. Notice the difference between where you are and where you think you should be.",
      cues: ["This is not about reaching the feet", "Where does the restriction actually live?", "Breathe into the tightest point", "Can you soften without force?"],
      contraindications: ["lower-back-acute", "hamstring-acute"] },
    { id: "yoga-corpse-pose",       name: "Savasana", youtube: "savasana corpse pose tutorial",               holdSeconds: 90, rest: 0,
      description: "Still. Notice what the body does when effort stops completely.",
      cues: ["Where does the body want to hold on?", "Let the floor receive the weight", "Notice the breath without changing it", "Rest here completely"] },
  ],

  pilates: [
    { id: "pilates-hundred",        name: "Pilates Hundred", youtube: "pilates hundred exercise technique",        holdSeconds: 60, rest: 20,
      description: "Lie on back. Lift legs to tabletop. Lift head and shoulders. Pump the arms vigorously.",
      cues: ["Chin tucked — no neck strain", "Lower back pressed into the mat throughout", "Arms pump from the shoulder, small and controlled", "Count the pumps: 5 in, 5 out"],
      contraindications: ["lower-back-acute", "neck-cervical-acute"] },
    { id: "pilates-roll-up",        name: "Roll Up", youtube: "pilates roll up exercise technique",                holdSeconds: 0,  rest: 20,
      description: "Lie flat. Inhale to prepare. Exhale, peel the spine off the mat vertebra by vertebra.",
      cues: ["Peel slowly — do not jerk up", "Arms reach forward throughout", "Draw the navel to the spine on the exhale", "Roll back down with the same control"],
      contraindications: ["lower-back-acute"] },
    { id: "pilates-single-leg-stretch", name: "Single Leg Stretch", youtube: "pilates single leg stretch technique", holdSeconds: 0, rest: 15,
      description: "Lying on back, alternate pulling one knee to the chest while extending the other leg.",
      cues: ["Head and shoulders stay lifted", "Lower back stays in contact with the mat", "Breathe rhythmically with the movement", "Control the extended leg — do not let it drop"],
      contraindications: ["lower-back-acute"] },
    { id: "pilates-side-kick",      name: "Side Kick", youtube: "pilates side kick exercise technique",              holdSeconds: 0,  rest: 20,
      description: "Side-lying, kick the top leg forward and back in a controlled range.",
      cues: ["Pelvis stays completely still throughout", "The kick is from the hip, not the lower back", "Top hand on the floor in front for support", "Small is controlled, big is not always better"],
      contraindications: ["hip-acute"] },
    { id: "pilates-spine-stretch",  name: "Spine Stretch Forward", youtube: "pilates spine stretch forward technique",  holdSeconds: 40, rest: 15,
      description: "Seated with legs extended. Round the spine forward as if over a ball.",
      cues: ["Sit on the sit bones — not behind them", "Round from the crown of the head", "Reach the hands forward along the floor", "Exhale as you round, inhale to return"],
      contraindications: ["lower-back-acute", "hamstring-acute"] },
    { id: "yoga-bridge-pose",       name: "Pilates Bridge", youtube: "bridge pose yoga tutorial",         holdSeconds: 45, rest: 15,
      description: "Bridge with strong glute engagement. Articulate each vertebra on the way up and down.",
      cues: ["Press through both heels equally", "Peel the spine off the mat vertebra by vertebra", "Squeeze the glutes hard at the top", "Lower slowly — one vertebra at a time"],
      contraindications: ["lower-back-acute"] },
  ]
};

const EXERCISE_COUNT = { 20: 5, 30: 7, 45: 10 };

// ── Session builder ───────────────────────────────────────────────────────────

function buildSession(focusId, durationMins) {
  const pool        = EXERCISE_POOLS[focusId] || [];
  const conditions  = store.get("conditions")          || [];
  const painScores  = store.get("conditionPainScores") || {};
  const targetCount = EXERCISE_COUNT[durationMins]     || 5;

  const activeConditions = new Set();
  conditions.forEach(id => {
    activeConditions.add(id);
    const pain = painScores[id] || 0;
    if (pain >= 7) activeConditions.add(`${id}-acute`);
  });

  const safe = pool.filter(ex => {
    const contra = ex.contraindications || [];
    return !contra.some(c => activeConditions.has(c));
  });

  return safe.slice(0, targetCount);
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render() {
  if (phase === "focus")    return renderFocusSelector();
  if (phase === "duration") return renderDurationSelector();
  if (phase === "overview") return renderSessionOverview();
  if (phase === "session")  return renderPose();
  if (phase === "rest")     return renderRest();
  if (phase === "done")     return renderDone();
  return renderFocusSelector();
}

// ── Focus selector ────────────────────────────────────────────────────────────

function renderFocusSelector() {
  const name = store.get("name") || "";
  return `
    <div class="view core-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="ys-back-btn" aria-label="Exit">Exit</button>
        <span class="workout-header-title">Yoga &amp; Pilates</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-5);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">
          ${name ? name + ". " : ""}What kind of practice today?
        </p>
      </div>

      <div class="cs-focus-grid" role="group" aria-label="Choose your practice focus">
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

// ── Duration selector ─────────────────────────────────────────────────────────

// ── Session overview — all poses visible before starting ─────────────────────

function renderSessionOverview() {
  const focus = FOCUS_TYPES.find(f => f.id === selectedFocus);

  return `
    <div class="view yoga-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="ys-back-btn" aria-label="Back to duration">
          \u2190 Back
        </button>
        <span class="workout-header-title">${focus?.label || "Yoga"} \u2014 ${selectedMins} min</span>
      </div>

      <div class="card card-coach" style="margin-bottom: var(--space-4);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <p class="coach-message-text">${focus?.coachIntro || "Your session is ready."}</p>
        <p class="text-sm text-muted" style="margin-top: var(--space-2);">
          ${sessionQueue.length} poses. Work through them in order, or take your time with any that feel right to linger on.
        </p>
      </div>

      <div class="gym-exercises-list" role="list">
        ${sessionQueue.map((pose, i) => `
          <div class="card gym-exercise-card" role="listitem">
            <button class="gym-exercise-header" data-pose-index="${i}"
                    aria-expanded="false"
                    aria-controls="yoga-pose-detail-${i}"
                    aria-label="${pose.name}: hold ${pose.holdSeconds || 0}s">
              <div class="gym-exercise-header-left">
                <span class="core-overview-badge" aria-hidden="true">${focus?.label || "Yoga"}</span>
                <div class="gym-card-meta-row">
                  ${pose.holdSeconds > 0 ? `<span class="meta-tag">${pose.holdSeconds}s hold</span>` : ""}
                  ${pose.rest > 0 ? `<span class="meta-tag">rest ${pose.rest}s</span>` : ""}
                </div>
                <h3 class="gym-exercise-name">${pose.name}</h3>
              </div>
              <span class="gym-card-chevron" aria-hidden="true">\u25BC</span>
            </button>
            <div class="gym-exercise-detail" id="yoga-pose-detail-${i}" hidden>
              ${pose.description ? `<p class="exercise-cue">${pose.description}</p>` : ""}
              ${pose.cues?.length ? `<p class="exercise-cue">${pose.cues[0]}</p>` : ""}
              <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(pose.youtube || (pose.name + " yoga pose tutorial"))}"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="youtube-link"
                 aria-label="Watch how to do ${pose.name} on YouTube (opens in new tab)">
                <span class="youtube-icon" aria-hidden="true">\u25B6\uFE0F</span>
                Watch how to do this
              </a>
            </div>
          </div>
        `).join("")}
      </div>

      <button class="btn btn-primary btn-large btn-full" id="ys-start-btn"
              style="margin-top: var(--space-6);">
        Let\u2019s go
      </button>
    </div>
  `;
}

function renderDurationSelector() {
  const focus = FOCUS_TYPES.find(f => f.id === selectedFocus);
  return `
    <div class="view core-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="ys-back-btn" aria-label="Back">Back</button>
        <span class="workout-header-title">${focus?.label || "Yoga"}</span>
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
              ${EXERCISE_COUNT[d.mins]} poses
            </span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

// ── Pose view ─────────────────────────────────────────────────────────────────

function renderPose() {
  if (currentIndex >= sessionQueue.length) {
    finaliseSession();
    return renderDone();
  }

  const pose     = sessionQueue[currentIndex];

  // GM-1. Chosen once per render so the card does not shuffle on a timer
  // tick. Yoga is the natural home for these -- it is already the frame,
  // and a pose held still is exactly the plank case.
  const gmSessionCount  = (store.get("activityLog") || []).length;
  const groundingMoment = selectMoment(pose, gmSessionCount);
  const total    = sessionQueue.length;
  const progress = Math.round((currentIndex / total) * 100);
  const isLast   = currentIndex >= total - 1;
  const hasTimer = pose.holdSeconds > 0;
  const focus    = FOCUS_TYPES.find(f => f.id === selectedFocus);

  return `
    <div class="view core-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="ys-exit-btn" aria-label="Exit session">Exit</button>
        <div class="workout-progress-info" aria-label="Pose ${currentIndex + 1} of ${total}">
          <span>${currentIndex + 1} of ${total}</span>
        </div>
      </div>

      <div class="workout-progress-bar" role="progressbar"
           aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Session progress ${progress}%">
        <div class="workout-progress-fill" style="width: ${progress}%"></div>
      </div>

      <div class="card exercise-card">
        <div class="exercise-role-badge main" aria-hidden="true">
          ${focus?.icon || ""} ${focus?.label || "Yoga"}
        </div>

        <h1 class="exercise-name">${pose.name}</h1>

        <div class="exercise-meta">
          ${hasTimer ? `<span class="meta-tag">${pose.holdSeconds}s hold</span>` : `<span class="meta-tag">Flowing</span>`}
          ${pose.rest > 0 ? `<span class="meta-tag">${pose.rest}s rest</span>` : ""}
        </div>

        ${hasTimer ? `
          <div class="exercise-target">
            <div class="timer-display">
              <div class="timer-circle">
                <span class="timer-value" id="ys-timer-display">
                  ${formatTime(timeRemaining || pose.holdSeconds)}
                </span>
                <span class="timer-label">Hold</span>
              </div>
            </div>
          </div>
        ` : ""}

        <p class="exercise-description">${pose.description}</p>

        ${pose.cues?.length ? `
          <ul class="exercise-cues" aria-label="Coaching cues">
            ${pose.cues.map(cue => `<li>${cue}</li>`).join("")}
          </ul>
        ` : ""}

        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(pose.youtube || (pose.name + " yoga pose tutorial"))}"
           target="_blank"
           rel="noopener noreferrer"
           class="youtube-link"
           aria-label="Watch how to do ${pose.name} on YouTube (opens in new tab)">
          <span class="youtube-icon" aria-hidden="true">\u25B6\uFE0F</span>
          Watch how to do this
        </a>

        <!-- LOG-2. Note and duration only ("gentle" mode). A pose is not a
             set: reps and levels would import the frame this practice
             exists outside of. What is worth writing down is how long you
             held it and what you noticed. -->
        ${groundingMoment ? `
          <aside class="gmoment" aria-label="Something to notice">
            <p class="gmoment__text">${groundingMoment.text}</p>
            <button class="gmoment__dismiss" id="gmoment-dismiss"
                    aria-label="Do not show this one again">Not for me</button>
          </aside>
        ` : ""}

        ${renderLogBlock(pose, `ys-log-${currentIndex}`, "gentle")}
      </div>

      <div class="workout-actions">
        ${hasTimer ? `
          <button class="btn btn-large btn-full ${timerRunning ? "btn-secondary" : "btn-accent"}"
                  id="ys-timer-btn"
                  aria-label="${timerRunning ? "Pause hold timer" : "Start hold timer"}">
            ${timerRunning ? "Pause" : (timeRemaining > 0 && timeRemaining < pose.holdSeconds ? "Resume" : "Start hold")}
          </button>
        ` : ""}

        <button class="btn btn-primary btn-large btn-full" id="ys-next-btn"
                style="${hasTimer ? "margin-top: var(--space-2);" : ""}">
          ${isLast ? "Finish practice" : "Done — Next pose"}
        </button>
        <button class="btn btn-ghost btn-small" id="ys-skip-btn">Skip</button>
      </div>
    </div>
  `;
}

// ── Rest card ─────────────────────────────────────────────────────────────────

function renderRest() {
  const nextPose = sessionQueue[currentIndex];
  return `
    <div class="view core-session-view">
      <div class="workout-header">
        <button class="btn btn-ghost" id="ys-exit-btn" aria-label="Exit">Exit</button>
        <span class="workout-header-title">Rest</span>
      </div>

      <div class="card" style="margin-top: var(--space-6); text-align: center; padding: var(--space-8);">
        <div class="timer-display" style="justify-content: center; margin-bottom: var(--space-4);">
          <div class="timer-circle">
            <span class="timer-value" id="ys-rest-display">${formatTime(restRemaining)}</span>
            <span class="timer-label">Rest</span>
          </div>
        </div>
        <p class="text-secondary">
          ${nextPose ? `Up next: ${nextPose.name}` : "Last pose coming up"}
        </p>
      </div>

      <button class="btn btn-primary btn-full" id="ys-rest-skip-btn"
              style="margin-top: var(--space-4);">
        Skip rest
      </button>
    </div>
  `;
}

// ── Done ──────────────────────────────────────────────────────────────────────

function renderDone() {
  const name    = store.get("name") || "";
  const focus   = FOCUS_TYPES.find(f => f.id === selectedFocus);
  const doneMsg = {
    flexibility: "Your body has more range than it did 30 minutes ago. Consistent practice is how that compounds.",
    strength:    "Yoga strength is quiet strength. You have built something real today.",
    balance:     "Balance is a skill and skills improve with practice. You just practised.",
    recovery:    "The body repairs itself. You gave it space to do that today.",
    mindful:     "You moved and you noticed. That combination is rare and valuable.",
    pilates:     "Controlled movement. Precise effort. That is what you just did."
  };

  return `
    <div class="view core-session-view" style="text-align: center;">
      <div class="card card-coach" style="margin-top: var(--space-8);">
        <img src="assets/images/logo-icon-192.png" alt="" class="coach-icon-small" aria-hidden="true">
        <div>
          <h2 style="color: var(--color-primary); margin-bottom: var(--space-2);">
            Practice done.
          </h2>
          <p class="coach-message-text">
            ${name ? name + " \u2014 " : ""}${doneMsg[selectedFocus] || "Well done."}
          </p>
          <p class="text-sm text-muted" style="margin-top: var(--space-3);">
            +${creditsEarned} credits earned
          </p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);">
        <button class="btn btn-primary btn-full" id="ys-reflect-btn">
          How did that feel?
        </button>
        <button class="btn btn-ghost btn-full" id="ys-home-btn">
          Back to today
        </button>
      </div>
    </div>
  `;
}

// ── Timer helpers ─────────────────────────────────────────────────────────────

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function startHoldTimer(holdSecs) {
  if (timerInterval) clearInterval(timerInterval);
  if (!timeRemaining) timeRemaining = holdSecs;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timeRemaining--;
    const el = document.getElementById("ys-timer-display");
    if (el) el.textContent = formatTime(timeRemaining);
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning  = false;
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
      const btn = document.getElementById("ys-timer-btn");
      if (btn) { btn.textContent = "Hold complete"; btn.disabled = true; }
    }
  }, 1000);
}

function pauseHoldTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerRunning = false;
}

function startRestTimer(seconds, onComplete) {
  restRemaining = seconds;
  if (restInterval) clearInterval(restInterval);
  restInterval = setInterval(() => {
    restRemaining--;
    const el = document.getElementById("ys-rest-display");
    if (el) el.textContent = formatTime(restRemaining);
    if (restRemaining <= 0) {
      clearInterval(restInterval);
      restInterval = null;
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      onComplete();
    }
  }, 1000);
}

// ── Session flow ──────────────────────────────────────────────────────────────

function advancePose() {
  creditsEarned += 20;
  const pose = sessionQueue[currentIndex];
  currentIndex++;
  timeRemaining = 0;
  timerRunning  = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  if (currentIndex >= sessionQueue.length) {
    finaliseSession();
    return;
  }

  if (pose.rest > 0) {
    phase         = "rest";
    restRemaining = pose.rest;
    rerender();
    startRestTimer(pose.rest, () => { phase = "session"; rerender(); });
  } else {
    phase = "session";
    rerender();
  }
}

/**
 * v3 (S4-B3-3) — REWRITTEN. Was: took currentActivityEntry (already sitting
 * in activityLog thanks to coach-reflection.js's old phantom pre-write),
 * mutated it, and appended it to activityLog as a NEW element — producing
 * two permanent entries for every single completed yoga session,
 * confirmed on-device. Now: currentActivityEntry is pending-only data
 * (coach-reflection.js v5 no longer pre-writes it). This function builds
 * the completion fields and calls the shared store.logActivity(), which
 * creates exactly one entry. currentActivityEntry is re-set to the
 * logActivity() result so reflect.js can find and update this same entry
 * by id if the user taps "How did that feel?" afterward.
 */
function finaliseSession() {
  store.set("totalCredits",       (store.get("totalCredits") || 0) + creditsEarned);
  store.set("lastWorkoutCredits", creditsEarned);
  store.set("lastWorkoutName",    "Yoga & Pilates");

  // 30 Jul 2026 (Core Session investigation follow-up, logged 30 Jul, fixed
  // same session on request): same id-reuse bug found in core-session.js
  // exists here. Unlike core-session, yoga's `pending` IS sometimes
  // legitimate — reachable via intention.js, which sets a fresh entry
  // (sessionStart/energyBefore/duration/id) before navigating here. But
  // yoga-session.js is ALSO reachable directly from library.js's "Yoga /
  // Pilates" card (navigateToSession(), no intention.js visit), in which
  // case `pending` is whatever THIS file's own previous completion wrote
  // back below — stale. Distinguishing signal: intention.js's entry never
  // sets `status`; every logActivity()-written entry always has one. So a
  // pending entry carrying `status` is a stale leftover, not genuine
  // upstream data — discard it entirely rather than spread it (which
  // would reuse its id and other now-irrelevant fields).
  const rawPending = store.get("currentActivityEntry");
  const pending     = (rawPending && !rawPending.status) ? rawPending : null;
  const nowIso      = new Date().toISOString();

  const activityEntry = store.logActivity({
    ...(pending || { type: "yoga", source: "self-directed" }),
    type:         "yoga",
    sessionEnd:   nowIso,
    completedAt:  nowIso,
    status:       "completed",
    durationMins: elapsedMins(),
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
  sessionStartTime = null;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (restInterval)  { clearInterval(restInterval);  restInterval  = null; }
  phase         = "focus";
  selectedFocus = null;
  selectedMins  = null;
  sessionQueue  = [];
  currentIndex  = 0;
  creditsEarned = 0;
  timeRemaining = 0;
  timerRunning  = false;
  restRemaining = 0;
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
 * v3 (S4-B3-3) — REWRITTEN, same root cause and same fix pattern as
 * finaliseSession() above. Also noted, not fixed: this function
 * previously referenced an undeclared variable `elapsed` for
 * durationMins. This file has no running elapsed-time tracker (only
 * per-pose hold timers) — durationMins is left explicitly null with a
 * comment rather than fabricated. A real elapsed-time tracker would be
 * a separate, larger addition for a future session.
 *
 * 30 Jul 2026 — same stale-pending id-reuse fix as finaliseSession()
 * above; see that function's comment for full reasoning.
 */
function savePartialSession() {
  const rawPending = store.get("currentActivityEntry");
  const pending     = (rawPending && !rawPending.status) ? rawPending : null;
  const nowIso      = new Date().toISOString();

  const activityEntry = store.logActivity({
    ...(pending || { type: "yoga", source: "self-directed" }),
    type:         "yoga",
    sessionEnd:   nowIso,
    completedAt:  nowIso,
    status:       "partial",
    // 11 Aug 2026 (WOW-1): a real session clock now exists in this file,
    // so a partial exit reports genuine elapsed time instead of null.
    durationMins: elapsedMins(),
    creditsEarned: typeof creditsEarned !== "undefined" ? creditsEarned : 0
  });

  if (activityEntry) {
    store.set("currentActivityEntry", activityEntry);
  }
}


function rerender() {
  const main = document.getElementById("main-content");
  if (main) { main.innerHTML = render(); onMount(); }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

export function onMount() {
  mountSessionGuard({
    isActive: () => phase === "session" || phase === "rest",
    label:    "yoga session",
    onExit:   () => { savePartialSession(); resetSession(); router.navigate("reflect"); }
  });
  // LOG-2. Re-wired per render; attachLogEvents() guards double-binding.
  if (phase === "session" && sessionQueue[currentIndex]) {
    attachLogEvents(sessionQueue[currentIndex], `ys-log-${currentIndex}`);

    // GM-1. Recorded on mount, not at render, so one that was built but
    // never reached the screen is not counted as seen.
    const gmEl = document.querySelector(".gmoment");
    if (gmEl) {
      const sc = (store.get("activityLog") || []).length;
      const m  = selectMoment(sessionQueue[currentIndex], sc);
      if (m) recordMomentShown(m, sc);
      document.getElementById("gmoment-dismiss")?.addEventListener("click", () => {
        if (m) dismissMoment(m.id);
        gmEl.remove();
      });
    }
  }

  document.getElementById("ys-back-btn")?.addEventListener("click", () => {
    if (phase === "focus")    { resetSession(); router.navigate("intention"); }
    else if (phase === "duration") { phase = "focus";    rerender(); }
    else if (phase === "overview") { phase = "duration"; rerender(); }
  });

  document.getElementById("ys-exit-btn")?.addEventListener("click", () => {
    showExitConfirm();
  });

  document.querySelectorAll(".cs-focus-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedFocus = btn.dataset.focus;
      phase = "duration";
      rerender();
    });
  });

  // Overview: expand pose cards
  document.querySelectorAll(".gym-exercise-header[data-pose-index]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx    = btn.dataset.poseIndex;
      const detail = document.getElementById(`yoga-pose-detail-${idx}`);
      if (!detail) return;
      const isOpen = !detail.hidden;
      detail.hidden = isOpen;
      btn.setAttribute("aria-expanded", !isOpen);
      const chevron = btn.querySelector(".gym-card-chevron");
      if (chevron) chevron.style.transform = isOpen ? "" : "rotate(180deg)";
    });
  });

  // Overview: start session
  document.getElementById("ys-start-btn")?.addEventListener("click", () => {
    sessionStartTime = Date.now();
    phase = "session";
    rerender();
  });

  document.querySelectorAll(".cs-duration-card").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMins = parseInt(btn.dataset.mins);
      sessionQueue = buildSession(selectedFocus, selectedMins);
      currentIndex = 0;
      creditsEarned = 0;
      timeRemaining = 0;
      phase = "overview";
      rerender();
    });
  });

  document.getElementById("ys-timer-btn")?.addEventListener("click", () => {
    const pose = sessionQueue[currentIndex];
    if (!timerRunning) startHoldTimer(pose?.holdSeconds || 30);
    else pauseHoldTimer();
    const btn = document.getElementById("ys-timer-btn");
    if (btn) {
      btn.textContent = timerRunning ? "Pause" : "Resume";
      btn.setAttribute("aria-label", timerRunning ? "Pause hold timer" : "Resume hold timer");
    }
  });

  document.getElementById("ys-next-btn")?.addEventListener("click", () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerRunning = false;
    advancePose();
  });

  document.getElementById("ys-skip-btn")?.addEventListener("click", () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerRunning  = false;
    timeRemaining = 0;
    currentIndex++;
    if (currentIndex >= sessionQueue.length) { finaliseSession(); rerender(); }
    else { phase = "session"; rerender(); }
  });

  document.getElementById("ys-rest-skip-btn")?.addEventListener("click", () => {
    if (restInterval) { clearInterval(restInterval); restInterval = null; }
    phase = "session";
    rerender();
  });

  document.getElementById("ys-reflect-btn")?.addEventListener("click", () => { resetSession(); router.navigate("reflect"); });
  document.getElementById("ys-home-btn")?.addEventListener("click", () => { resetSession(); router.navigate("intention"); });
}
