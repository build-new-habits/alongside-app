/**
 * js/session-builder.js - Generative Session Engine
 *
 * 11 Aug 2026 v16
 *
 * v16 - Exercise preferences honoured. conditionProgrammes.js has
 *   applied these since 04 Aug and this file never has, so telling the
 *   coach you were not a fan of something changed your prescribed
 *   programme and did nothing to your generated sessions. 'avoid'
 *   removes; 'less' sorts to the back rather than being removed,
 *   because "not a fan" is not "never again".
 *
 * 11 Aug 2026 v15
 *
 * v15 - CAP-3. trainingIntent tilts main-section selection. "maintain"
 *   prioritises carries, grip, balance, sit-to-stand and floor transfer
 *   -- the capacities that go first and that decide independence --
 *   rather than doing less of everything. "recover" leans on the
 *   rehabilitation library. Prioritised, never exclusive.
 *
 * 11 Aug 2026 v14
 *
 * v14 - CAP-1. Selection now reads store.capabilityProfile(), which
 *   measures what a person CAN do rather than how often they move.
 *   Three gates: impact (both feet leaving the ground), floor access,
 *   and balance confidence -- the last being its own axis, because
 *   Warrior III is low impact and moderate difficulty and completely
 *   wrong for someone worried about falling. The screen can only lower
 *   a ceiling, never raise one.
 *
 * 11 Aug 2026 v13
 *
 * v13 - Persona trace round 2. Four changes,
 *
 *   (impact gate) Raising the ceilings served a frail sedentary
 *   76-year-old Lateral Hops and sprint mechanics. Difficulty and
 *   impact are different axes -- for a conditioned person a jump squat
 *   IS easy, and the risk in a plyometric is landing force and fall
 *   risk, neither of which scales with how hard it feels. Impact is now
 *   gated separately: sedentary, light and returning users get no
 *   jumping, bounding, sprinting or landing work. Gated on capability,
 *   not age, deliberately.
 *
 *   Three further changes, all from executing live
 *   code against the personas rather than reading it.
 *
 *   (2.15, fit mid-20s) Slot-weighted anchoring. CONT-1 anchored every
 *   slot equally and got it exactly backwards: her eight most-repeated
 *   exercises after eight weeks were three cardio warm-ups and five
 *   accessories, not one barbell lift. Pool depth, not intent -- thin
 *   warm-up categories repeat, deep main categories rotate. Main now
 *   anchors hard; warm-ups and cool-downs rotate freely.
 *
 *   (2.15) Difficulty ceilings raised. They topped out at 3 on a 1-10
 *   scale, leaving fourteen exercises unreachable by any user at all --
 *   treadmill intervals, sled push, renegade rows, ab wheel, the
 *   weighted core work written for exactly her.
 *
 *   (2.13/2.14) sessionVariety honoured. Novelty rate now follows the
 *   person's stated preference rather than one default serving the
 *   novelty-seeking and predictability-seeking personas equally badly.
 *
 * 11 Aug 2026 v12
 *
 * v12 - Persona trace findings (2.10 and 2.11). Three defects, all
 *   found by executing live code rather than reading it.
 *
 *   (2.11, duplicates) A session could contain the same exercise twice
 *   -- measured at 12% of all sessions. CON-6's per-category object
 *   spread defeated the identity-based dedupe guard. Now guarded by id
 *   across all three sections.
 *
 *   Two safety gaps, both
 *   found by executing live code rather than reading it.
 *
 *   (2.11, Mum, 76, mindfulness-led) 30 entries carry no
 *   difficultyLevel, and every read was `(ex.difficultyLevel || 1)` --
 *   treating an untagged exercise as the EASIEST possible. Backwards
 *   for safety. She was served Warrior III, a single-leg balance pose
 *   and a real fall risk for her. New _difficulty() falls back to
 *   energyRequired, which is present on all 497.
 *
 *   (2.10, Dad, 76, Dad, 76, frail, sedentary). The
 *   difficulty ceiling applied to "main" only; warmups were exempt.
 *   That was safe while warmups came from a curated 70-entry pool of
 *   hand-written warmups, and stopped being safe at CON-6 when they
 *   began coming from all 497 shared exercises. Traced live: a
 *   sedentary 76-year-old was served "High Knees" as his opening
 *   pulse-raiser. The ceiling now applies to warmups, with the safety
 *   floor protected by relaxing rather than exempting.
 *
 * 11 Aug 2026 v11
 *
 * v11 - CONT-1. Selection is continuity-aware. It was Math.random() over
 *   the candidate pool every session, from 497 exercises, so a person met
 *   a given movement roughly once and then not again for weeks. No
 *   progressive overload, no skill acquisition, no familiarity -- and the
 *   whole watchOut library was decorative, because you cannot correct a
 *   fault you never repeat. Exercises met before and recently are now
 *   strongly preferred, bounded by a 21-day recency window, an 8-session
 *   mastery ceiling and a 25% novelty rate. Depends on store.js v22's
 *   exerciseHistory, which did not exist until today: the product
 *   recorded that a session happened and how many exercises it had, never
 *   which ones.
 *
 * 11 Aug 2026 v10
 *
 * v10 - CON-8. Equipment is now a preference, not only a permission.
 *   Until now nothing ever preferred a barbell when the person was
 *   standing next to one: equipment gated what was ALLOWED, and since
 *   bodyweight is the large majority of the database, random selection
 *   handed gym users sessions they could have done in their living room.
 *   Reported twice by Graeme, and confirmed by trace both times. Within
 *   each category, equipment-using exercises are now picked first when
 *   the person has meaningful kit. Bodyweight fallback unchanged.
 *
 * 11 Aug 2026 v9
 *
 * v9 - CON-6. The private EXERCISE_POOL is gone. _filterCandidates() now
 *   selects from the shared 461-entry database in js/data/exercises/ via
 *   the new js/data/session-categories.js, which maps this file's 39
 *   fine-grained categories ("hip-hinge", "anti-rotation") onto queries
 *   over movementPattern, category and affectsAreas -- rather than
 *   re-tagging 461 entries with a second parallel vocabulary that would
 *   drift from the first.
 *
 *   What this fixes, all at once: 61 pool entries rendered near-blank
 *   because they were in the retired description/cues shape; 139 practice
 *   entries and the whole yoga library were unreachable from the builder;
 *   and every shared fix had to be written twice, with the second write
 *   found only after a live bug (PT-11, CON-2, PT-19 all had this shape).
 *
 *   Section is no longer stored per entry. It was never a property of an
 *   exercise -- a hip mobility drill is a warm-up in a Lower Body session
 *   and main content in a Mobility session -- and storing it is why the
 *   pool duplicated entries. It now comes from which SESSION_TYPES list a
 *   category appeared in, with a difficulty and energy ceiling applied to
 *   warm-ups so nothing strenuous can land there.
 *
 *   Four machine warm-ups the pool had and the database did not were
 *   ported into exercises/cardio.js v2 first. Nothing was deleted before
 *   it existed somewhere better.
 *
 * 11 Aug 2026 v8
 *
 * v8 - All four machine cardio-warmup entries (bike, treadmill, cross
 *   trainer, rower) rewritten to the Exercise Entry Standard. They were
 *   authored 05 Aug with description/cues and rendered as a name and a
 *   duration and nothing else - which is what Graeme saw when a gym
 *   session finally produced a cross trainer warm-up and still gave him
 *   no guidance at all.
 *
 *   SCOPE NOTE, honestly stated: this brings all 9 cardio-warmup entries
 *   to the standard. THE OTHER 61 ENTRIES IN THIS POOL ARE STILL IN THE
 *   LEGACY SHAPE and still render near-blank on this route. That is not
 *   a defect introduced here; it is the pre-existing state of the whole
 *   private pool and the substance of CON-6. It is recorded here rather
 *   than left implicit so nobody has to rediscover it.
 *
 * 11 Aug 2026 v7
 *
 * v7 - The five pulse-raisers added in v6 were authored with
 *   description/cues, the shape the Exercise Entry Standard retired
 *   earlier the same day. They therefore rendered as a name and a set
 *   count and nothing else - the PT-13 failure, self-inflicted, in
 *   content written hours after the standard that forbids it. All five
 *   rewritten in full to the standard: instructions, why, coaching,
 *   watchOut. Recorded rather than quietly corrected, because the cause
 *   was matching the surrounding file's legacy style instead of the
 *   standard, and that will recur until CON-6 retires this pool.
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
import { EXERCISES } from "./data/exercises/index.js";
import { matchCategory } from "./data/session-categories.js";

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
    mainCategories:     ["squat-pattern", "hip-hinge", "single-leg", "leg-isolation", "loaded-carry"],
    cooldownCategories: ["hip-flexor-stretch", "hamstring-stretch", "figure-4"]
  },
  {
    id:          "full",
    label:       "Full Body",
    icon:        "⚡",
    description: "Push, pull, squat, hinge. Every major pattern in one session.",
    warmupCategories:   ["activation", "hip-mobility", "thoracic-mobility", "cardio-warmup"],
    mainCategories:     ["squat-pattern", "hip-hinge", "horizontal-pull", "horizontal-push", "core-stability", "loaded-carry"],
    cooldownCategories: ["hip-flexor-stretch", "chest-stretch", "child-pose"]
  },
  {
    id:          "core",
    label:       "Core",
    icon:        "🎯",
    description: "Anti-extension, anti-rotation, anti-lateral. Real core work.",
    warmupCategories:   ["cardio-warmup", "breathing-warmup", "cat-cow"],
    mainCategories:     ["anti-extension", "anti-rotation", "anti-lateral", "loaded-carry"],
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

// ── EXERCISE_POOL — REMOVED 11 Aug 2026 (CON-6) ───────────────────────────────
//
// This file used to carry its own hardcoded pool of 70 exercises. It is gone.
// _filterCandidates() now selects from the shared database in
// js/data/exercises/ via session-categories.js.
//
// Why it had to go, recorded so it does not come back:
//
//   * 61 of the 70 entries were still in the retired description/cues shape
//     and rendered as a name and a set count and nothing else, while the
//     shared database carried instructions, why and coaching at 100%.
//   * 139 practice entries and the entire yoga library were unreachable
//     from the session builder for as long as this pool existed.
//   * Three separate fixes had to be applied twice because of it -- the
//     difficulty ceiling (PT-11), the equipment vocabulary (CON-2) and the
//     cardio-warmup tags (PT-19) -- and each second application was found
//     only after somebody hit the bug in the live product.
//
// The four machine warm-ups this pool held and the database did not
// (stationary bike, treadmill, cross trainer, rower) were ported into
// js/data/exercises/cardio.js v2 first, at the full Exercise Entry Standard.
// Nothing was deleted before it existed somewhere better.

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
// Raised 11 Aug 2026, persona trace 2.15 (fit mid-20s, gym 4x/week,
// wants numbers to move). The old ceilings topped out at 3 on a 1-10
// scale, so the hardest exercise she could be served in eight weeks was
// a 3 -- and fourteen exercises were unreachable by ANY user, including
// treadmill intervals, sled push, renegade rows, ab wheel rollouts and
// the weighted core work written for exactly her. Same class of defect
// as the equipment vocabulary bug: content existing that nothing could
// ever select.
//
// The lower bands are unchanged in spirit but given room now that all
// 497 entries carry a real difficultyLevel (the 30 untagged yoga entries
// were tagged the same day). Sedentary at 2 still excludes everything
// demanding while allowing gentle floor and standing work.
const DIFFICULTY_CEILINGS = {
  "sedentary":   2,
  "light":       3,
  "returning":   3,
  "moderate":    4,
  "active":      6,
  "very-active": 8
};

function _difficultyCeiling() {
  // CAP-1: the capability screen can only ever LOWER the ceiling. It
  // protects, it does not promote -- somebody answering well does not
  // get handed harder work than their declared activity supports.
  const capProfile = store.capabilityProfile();
  const declared = store.get("fitnessLevel")
                || store.get("lifestyle.activityLevel")
                || "moderate";
  const base = DIFFICULTY_CEILINGS[declared] ?? DIFFICULTY_CEILINGS["moderate"];
  return capProfile.ceilingCap !== null
    ? Math.min(base, capProfile.ceilingCap)
    : base;
}

  // ── TRAINING INTENT (CAP-3) ───────────────────────────────────────────
//
// "maintain" is not a diluted "improve". What is lost first is specific
// and known, so maintenance PRIORITISES those capacities rather than
// doing less of everything:
//
//   power         goes before strength -- fast matters more than heavy
//   balance       goes early, and is the fall risk
//   grip          predicts independence better than almost anything
//   floor transfer decides whether somebody keeps living in their
//                 own home
//
// Prioritised, never exclusive: a maintenance session still contains
// ordinary strength and mobility work. This tilts selection, it does
// not replace the session.
//
// "recover" leans on the rehabilitation library and the phase system
// that already exists in conditionProgrammes.js.

const MAINTAIN_PRIORITY = /carry|grip|hold|balance|single-leg|sit-to-stand|chair|step-up|get ?up|floor|calf raise|power|throw|slam|reach/i;
const RECOVER_PRIORITY  = /rehab|progression|activation|isometric|controlled|range/i;

function intentPriority(ex) {
  const trainingIntent = store.get("trainingIntent") || "improve";
  const s = ex.name + " " + (ex.id || "");
  if (trainingIntent === "maintain") {
    return MAINTAIN_PRIORITY.test(s) ||
           ex.movementPattern === "carry" ||
           ex.movementPattern === "balance" ||
           ex.movementPattern === "proprioception";
  }
  if (trainingIntent === "recover") {
    return RECOVER_PRIORITY.test(s) || ex.category === "rehabilitation";
  }
  return false;
}

function _filterCandidates(categories, section, equipSet, conditionSet) {
  const ceiling = _difficultyCeiling();
  const prefs   = store.get("exercisePreferences") || {};

  // CON-6: candidates now come from the shared 461-entry database, not from
  // this file's own EXERCISE_POOL. Section comes from which SESSION_TYPES
  // list the category appeared in, rather than being stored per entry --
  // section was never really a property of an exercise, and storing it was
  // why the pool had to duplicate hip-mobility drills to use them in two
  // places.
  const matched = [];
  const seen = new Set();
  for (const category of categories) {
    for (const ex of matchCategory(EXERCISES, category, section)) {
      if (seen.has(ex.id)) continue;
      seen.add(ex.id);
      // Tag the entry with the category and section it was selected FOR, so
      // the selection loops below can still reason about variety across
      // categories. Non-destructive -- the database entry is not mutated.
      matched.push({ ...ex, category, section });
    }
  }

  // PERSONA TRACE FINDING (11 Aug 2026, persona 2.10 -- Dad, 76, frail,
  // sedentary). The difficulty ceiling used to apply to "main" only, and
  // warmups were exempt on the reasoning that they are structurally gentle
  // and that capping them could empty the section and break the warmup
  // safety floor.
  //
  // That reasoning held while warmups came from a curated 70-entry pool
  // where every warmup had been hand-written as a warmup. It stopped
  // holding at CON-6, when warmups began coming from all 497 shared
  // exercises. Traced live: a sedentary 76-year-old was served "High
  // Knees" as his opening pulse-raiser -- inside session-categories.js's
  // absolute warmup ceiling (difficulty 4, energy 5), but nowhere near
  // appropriate for him, because that ceiling is fixed rather than
  // relative to the person.
  //
  // The ceiling now applies to warmups too, and the floor is protected by
  // relaxing rather than by exempting: if applying it would leave nothing,
  // the unfiltered set is used, so the warmup safety floor cannot be
  // starved. Cooldowns stay exempt -- they are genuinely low-demand by
  // construction and a stretch has no meaningful difficulty ceiling.
  // PERSONA TRACE FINDING (11 Aug 2026, persona 2.11 -- Mum, 76,
  // mindfulness-led, low confidence). She was served Warrior III, a
  // demanding single-leg balance pose and a genuine fall risk for her.
  //
  // Root cause: 30 entries carry no difficultyLevel at all, and every
  // read in the codebase is `(ex.difficultyLevel || 1)` -- so an
  // untagged exercise is treated as the EASIEST possible. That default
  // is backwards for safety: an unknown difficulty should be assumed
  // demanding until somebody says otherwise, not assumed trivial.
  //
  // _difficulty() inverts it, falling back to energyRequired when
  // difficultyLevel is absent, since energy is present on all 497 and
  // correlates well. Warrior III (energy 6) now reads as difficulty 6
  // rather than 1 and is correctly out of reach for a sedentary user.
  //
  // The 30 untagged entries should still be tagged properly -- this is
  // a safe default, not a substitute for the data.
  // ── IMPACT GATE (11 Aug 2026) ─────────────────────────────────────────
  //
  // Graeme's question: should some exercises be naturally avoided for
  // certain age groups -- his 76-year-old parents are unlikely to do
  // burpees or star jumps.
  //
  // Age is the wrong variable and a worse one. There are 76-year-olds who
  // do burpees and 35-year-olds who cannot squat, so filtering on birth
  // year is wrong in both directions -- and "we have decided what you can
  // do because of your age" is precisely the shame architecture this
  // product refuses. Capability is both more accurate and more dignified.
  //
  // But he was right that something was missing, and raising the
  // difficulty ceilings proved it: at ceiling 2, a frail sedentary
  // 76-year-old was served Lateral Hops and Wall Drive sprint mechanics,
  // and a blank-slate beginner was served Explosive Press-Ups. Twenty-six
  // of the twenty-seven impact-class exercises in the database are tagged
  // difficulty 3 or lower.
  //
  // That is not mis-tagging. For a conditioned person a jump squat IS
  // easy. Difficulty and impact are different axes: the risk in a
  // plyometric is not that it is hard, it is landing force and fall risk,
  // and neither scales with how hard the movement feels.
  //
  // So impact is gated separately from difficulty. Anyone who has told us
  // they are sedentary, lightly active, or returning after a break does
  // not get jumping, bounding, sprinting or landing work -- not because
  // of their age, but because impact loading is the one thing that should
  // be earned rather than defaulted into.
  
  const LOW_IMPACT_ONLY = new Set(["sedentary", "light", "returning"]);
  // Unknown counts as gated, matching the same safe-default reasoning
  // applied to untagged difficulty: someone who has told us nothing has
  // not told us they can absorb landing forces. Persona 2.12 (blank
  // slate, sedentary desk job, nothing to personalise against) was
  // served a Jump Squat in her very first session on the old default.
  const declaredLevel = store.get("fitnessLevel")
                     || store.get("lifestyle.activityLevel")
                     || null;

  // CAP-1. The capability screen measures what a person CAN do; the
  // activity level measures how often they move. They answer different
  // questions and the first one wins where they disagree, because
  // frequency is a poor proxy for capacity -- somebody can garden daily
  // and still not get off the floor unaided.
  const cap = store.capabilityProfile();

  const impactGated =
    (cap.asked && !cap.impactSafe) ||
    (!cap.asked && (declaredLevel === null || LOW_IMPACT_ONLY.has(declaredLevel)));

  // Floor access. Without it every supine, prone and kneeling movement
  // is not merely hard but unusable, and being handed them repeatedly is
  // how somebody decides the app is not for them.
  // CAP-2 RESOLVED (11 Aug 2026). These gates read real tags now.
  //
  // They used to match on exercise NAMES, because the database carried
  // no position, impact or balance data and movementPattern could not
  // stand in -- Depth Jump is tagged "squat" and "locomotion" covers
  // both a treadmill walk and carioca. Name matching missed things, and
  // it was verified missing them: a wheelchair user who answered "no"
  // to the chair question was still served McGill Curl-Ups, and a man
  // who cannot jump was still served Drop Steps.
  //
  // All 497 entries now carry position ('floor' | 'standing' | 'seated'
  // | 'any'), impact (boolean) and balanceDemand (boolean). Same lesson
  // as the 30 untagged difficulties: a derived fallback buys time and
  // the data is what actually solves it.
  //
  // 'any' means the exercise imposes no position requirement -- most
  // breathing and meditation practice, and the recovery protocols. It
  // passes every position gate deliberately, because there is nothing
  // to gate.
  const isFloor   = ex => ex.position === "floor";
  const isBalance = ex => ex.balanceDemand === true;
  const isImpact = ex => ex.impact === true;

  const _difficulty = ex => {
    if (typeof ex.difficultyLevel === "number") return ex.difficultyLevel;
    if (typeof ex.energyRequired === "number")  return ex.energyRequired;
    return 10;
  };
  const withinCeiling = ex => _difficulty(ex) <= ceiling;
  const warmupPool = section === "warmup" ? matched.filter(withinCeiling) : null;
  const useCeilingOnWarmup = warmupPool !== null && warmupPool.length > 0;

  return matched.filter(ex => {
    // EXERCISE PREFERENCES (11 Aug 2026). conditionProgrammes.js has
    // honoured these since 04 Aug; this file never has, so telling the
    // coach you were not a fan of something changed your prescribed
    // programme and did nothing at all to your generated sessions.
    // Same two-places-to-fix pattern the private pool caused.
    //
    // 'avoid' removes the exercise. 'less' leaves it in the pool and is
    // handled as a de-prioritisation at selection, not a removal --
    // "not a fan" is not "never again", and treating it as such would
    // quietly shrink somebody's world every time they were honest.
    if (prefs[ex.id]?.preference === "avoid") return false;
    if (impactGated && isImpact(ex)) return false;
    if (cap.asked && !cap.floorSafe   && isFloor(ex))   return false;
    if (cap.asked && !cap.balanceSafe && isBalance(ex)) return false;
    // CAP-4: somebody who cannot rise from a chair needs seated and
    // supported work, not a gentler standing programme.
    if (cap.asked && cap.needsSeated &&
        ex.position !== "seated" && ex.position !== "any") return false;
    if (section === "main" && !withinCeiling(ex)) return false;
    if (section === "warmup" && useCeilingOnWarmup && !withinCeiling(ex)) return false;
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

  function selectFromCategories(categories, section, count, alreadyChosen) {
    const chosen = alreadyChosen || new Set();
    const prefs  = store.get("exercisePreferences") || {};
    const candidates = _filterCandidates(categories, section, equipSet, conditionSet)
      .filter(ex => !chosen.has(ex.id));

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
      // Must respect `chosen` like every other pick. Found by regression
      // after the duplicate fix: the reserved slot ran before the guard
      // was consulted, so the same machine warm-up could be selected
      // twice within one warm-up section.
      const cardio = candidates.filter(e => e.category === "cardio-warmup" && !chosen.has(e.id));
      if (cardio.length > 0) {
        // Prefer a machine when the person has one. Found in testing: the
        // reserved slot picked at random, so a gym user with a treadmill,
        // a bike and a cross trainer ticked was being handed jumping jacks
        // -- which is exactly the complaint that started this. Bodyweight
        // is right at home and wrong standing next to a cross trainer.
        // Falls back to bodyweight whenever no machine is available.
        const machine = cardio.filter(e => (e.equipment || []).length > 0);
        const pickFrom = machine.length > 0 ? machine : cardio;
        const chosenPulse = pickFrom[Math.floor(Math.random() * pickFrom.length)];
        selected.push(chosenPulse);
        chosen.add(chosenPulse.id);
        usedCategories.add("cardio-warmup");
      }
    }

    // CON-8 — EQUIPMENT PREFERENCE, NOT JUST PERMISSION.
    //
    // Until now equipment was only ever a permission check: an exercise
    // needing a barbell was allowed if you had one, and an exercise needing
    // nothing was allowed always. Nothing ever PREFERRED the barbell when
    // the person was standing next to it. Because bodyweight is the large
    // majority of the database, random selection handed a gym user a
    // session they could have done in their living room -- which is exactly
    // what Graeme reported, twice.
    //
    // When the person has meaningful equipment available, equipment-using
    // exercises are picked first within each category. The bodyweight
    // fallback is untouched: if a category has no equipment option, or the
    // person has no kit, behaviour is identical to before.
    //
    // Deliberately a preference and not a rule. A gym session that refused
    // to include a press-up or a plank because they need no equipment would
    // be worse, not better.
    const preferEquipment = equipSet.size > 2;

    // ── CONT-1: CONTINUITY ────────────────────────────────────────────────
    //
    // Selection used to be Math.random() over the candidate pool, every
    // session, from 497 exercises. A person doing a goblet squat on Monday
    // would very likely not meet it again for weeks.
    //
    // That is what an app does when it has nothing else to offer, and it
    // breaks three things at once. There is no progressive overload,
    // because you cannot get stronger at an exercise you meet once. There
    // is no skill acquisition, because you cannot correct a fault you never
    // repeat -- which made the entire watchOut library decorative. And
    // there is no familiarity, which matters most for exactly the people
    // this product is for: the person who is nervous about the gym needs to
    // recognise the session, and constant novelty is exciting only for the
    // already-confident.
    //
    // A coach does the opposite of variety. They give you the same four
    // movements for several weeks and change what you do with them.
    //
    // So: within a category, an exercise the person has met before and
    // recently is strongly preferred. Three deliberate limits stop that
    // becoming a rut:
    //
    //   RECENCY   Familiarity decays. Past CONTINUITY_WINDOW_DAYS an
    //             exercise is no longer an anchor, so a long absence
    //             produces a fresh start rather than resurrecting a
    //             programme from months ago.
    //
    //   MASTERY   Past MASTERY_THRESHOLD completions an exercise stops
    //             being preferred, mirroring a coach rotating a lift out
    //             after a block rather than running it forever.
    //
    //   NOVELTY   A fixed share of slots ignore history entirely, so the
    //             database does not collapse to the handful of exercises
    //             that happened to be picked in week one.
    const CONTINUITY_WINDOW_DAYS = 21;
    const MASTERY_THRESHOLD      = 8;

    // CONT-2 -- the person's own answer, never inferred from behaviour.
    const VARIETY_NOVELTY = { familiar: 0.10, balanced: 0.25, varied: 0.55 };
    const variety = store.get("sessionVariety") || "balanced";
    const baseNovelty = VARIETY_NOVELTY[variety] ?? VARIETY_NOVELTY.balanced;

    // SLOT-WEIGHTED ANCHORING (persona trace 2.15).
    //
    // CONT-1 anchored every slot equally, and the result was exactly
    // backwards. Traced over eight weeks of gym training, her top eight
    // most-repeated exercises were three cardio warm-ups and five
    // accessories -- not one barbell lift. Her nine barbell lifts
    // averaged 2.7 exposures in eight weeks, nowhere near enough to
    // progress on anything.
    //
    // The cause is pool depth, not intent: warm-up categories are thin so
    // they repeat, main-lift categories are deep (32 hinge, 21 squat) so
    // they rotate. Uniform anchoring therefore anchors the thing that
    // does not matter and rotates the thing that does.
    //
    // A coach does the opposite. Your squat and your press stay for six
    // weeks; nobody needs to master a hip flexor stretch. So the main
    // section anchors hard and warm-ups and cool-downs rotate freely.
    const SECTION_NOVELTY = { warmup: 0.55, main: 0.0, cooldown: 0.55 };
    const noveltyRate = Math.min(
      1,
      baseNovelty + (SECTION_NOVELTY[section] ?? 0)
    );

    function isAnchor(ex) {
      const s = store.exerciseStats(ex.id);
      if (!s.seen) return false;
      if (s.n >= MASTERY_THRESHOLD) return false;
      if (s.daysSince !== null && s.daysSince > CONTINUITY_WINDOW_DAYS) return false;
      return true;
    }

    function pickFrom(pool) {
      if (pool.length === 0) return null;

      // Equipment preference (CON-8) decides WHICH pool we choose from,
      // continuity decides which member of it.
      //
      // MIN_CHOICE found by simulation, not assumed: with a hard
      // equipment filter, a category holding a single equipment-using
      // exercise handed the same one every single session -- one
      // exercise appeared in 24 of 24 sessions across a simulated eight
      // weeks. Preference had quietly become compulsion. When the
      // equipment-using pool is too thin to offer real choice, the
      // bodyweight options come back in, which is also what a coach
      // would do rather than repeat one movement forever.
      const MIN_CHOICE = 3;
      let candidates = pool;
      if (preferEquipment) {
        const withKit = pool.filter(e => (e.equipment || []).length > 0);
        if (withKit.length >= MIN_CHOICE) candidates = withKit;
      }

      // Mastery escape: if every candidate here is past the ceiling and
      // wider options exist, widen rather than repeat something the
      // person has already worked through.
      if (candidates !== pool && candidates.every(e => store.exerciseStats(e.id).n >= MASTERY_THRESHOLD)) {
        candidates = pool;
      }

      // 'less' exercises sort to the back: still available when a category
      // has nothing else, never chosen while something else exists.
      const notLess = candidates.filter(e => prefs[e.id]?.preference !== "less");
      if (notLess.length > 0) candidates = notLess;

      // Intent tilt, applied before continuity so that a maintenance user
      // builds familiarity WITH the capacities that matter to them rather
      // than around them.
      if ((store.get("trainingIntent") || "improve") !== "improve" && section === "main") {
        const priority = candidates.filter(intentPriority);
        if (priority.length >= 2) candidates = priority;
      }

      if (Math.random() >= noveltyRate) {
        const anchors = candidates.filter(isAnchor);
        if (anchors.length > 0) {
          // Among anchors, prefer the one met least often, so a person
          // building familiarity across several movements does not get
          // stuck repeating whichever one came up first.
          const fewest = Math.min(...anchors.map(e => store.exerciseStats(e.id).n));
          const tier = anchors.filter(e => store.exerciseStats(e.id).n === fewest);
          return tier[Math.floor(Math.random() * tier.length)];
        }
      }

      // No anchor available, or this slot is deliberately novel: prefer
      // something never met before over something met and dropped.
      const unseen = candidates.filter(e => !store.exerciseStats(e.id).seen);
      const from = unseen.length > 0 ? unseen : candidates;
      return from[Math.floor(Math.random() * from.length)];
    }

    // First pass: one from each category
    for (const cat of categories) {
      if (selected.length >= count) break;
      const fromCat = candidates.filter(e => e.category === cat && !selected.includes(e));
      const pick = pickFrom(fromCat.filter(e => !chosen.has(e.id)));
      if (pick) {
        selected.push(pick);
        chosen.add(pick.id);
        usedCategories.add(cat);
      }
    }

    // Second pass: fill remaining slots
    let remaining = candidates.filter(e => !chosen.has(e.id));
    while (selected.length < count && remaining.length > 0) {
      const pick = pickFrom(remaining);
      if (!pick) break;
      selected.push(pick);
      chosen.add(pick.id);
      remaining = remaining.filter(e => e.id !== pick.id);
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

  // PERSONA TRACE FINDING (11 Aug 2026, persona 2.11). A session could
  // contain the same exercise twice -- "Standing Spinal Wave" appeared
  // twice in one traced session, and measurement put the rate at 12% of
  // all sessions.
  //
  // Cause, introduced by CON-6: _filterCandidates() tags each match with
  // the category it was selected FOR, via `matched.push({ ...ex, category,
  // section })`. That spread creates a NEW object per category, so an
  // exercise matching two categories (Warrior II matches both hip-mobility
  // and shoulder-mobility) produced two distinct objects, and the
  // `!selected.includes(e)` guard -- which compares object identity --
  // could not see they were the same exercise. The old private pool had
  // one object per entry, so identity comparison happened to work.
  //
  // alreadyChosen carries ids across all three sections, since a duplicate
  // between warmup and main is just as wrong as one within a section.
  const alreadyChosen = new Set(prescribed.map(p => p.exerciseId || p.id).filter(Boolean));

  const warmupExercises   = selectFromCategories(type.warmupCategories,   "warmup",   adjustedCounts.warmup,   alreadyChosen);
  const mainExercises     = [...prescribed, ...selectFromCategories(type.mainCategories, "main", adjustedCounts.main, alreadyChosen)];
  const cooldownExercises = selectFromCategories(type.cooldownCategories, "cooldown", adjustedCounts.cooldown, alreadyChosen);

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
