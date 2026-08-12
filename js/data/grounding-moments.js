/**
 * js/data/grounding-moments.js
 * 12 Aug 2026 v1
 *
 * GM-1. Grounding moments: a short invitation to notice something,
 * offered occasionally on an exercise card.
 *
 * FROM GRAEME'S TWO MODELS, 12 Aug 2026.
 *
 * The plank: where your forearms meet the ground, where is it most
 * grounding -- then imagine a field, grass under your hands -- then you
 * are a line held above a meadow growing around you.
 *
 * The run: the sound of your feet, your breathing -- then the air on
 * your skin, birds, wind -- then someone coming home from work, and
 * wondering what their day might have been like.
 *
 * Different exercises, one shape: CONTACT, then PLACE, then BEYOND.
 * Body, then world, then other people. That is also the Empathy Transfer
 * arc compressed into ninety seconds -- his running example ends on what
 * is very nearly a stage 3 prompt. These are that library's practice
 * ground, and the reason it may land for somebody who never reaches
 * session 85.
 *
 * WHY THERE IS NO RESEARCH IN THIS FILE. Graeme, 12 Aug: "We make a
 * claim, state why, and what to look out for. We don't cite research
 * into it." The design was informed by reading; the product does not
 * argue from it. Nothing here promises an outcome, physical or
 * psychological. A moment that promised a return would stop being a
 * moment and become another instruction.
 *
 * PLACEMENT RULE, and the one thing here that is not taste. Attention on
 * your own body competes with attention on the movement. During a heavy
 * or technical lift that competition is not worth having, so moments
 * appear BEFORE a set there, never mid-set. During a hold, steady-state
 * cardio, floor or seated work there is nothing to disrupt, so they may
 * sit with the exercise itself.
 *
 * SAFETY. Every family carries at least one outward-directed moment, so
 * attention can always be sent outward rather than inward -- turning
 * attention inward does not suit everybody, and nobody should be offered
 * only that. Dismissal is permanent and costs nothing. Moments never
 * appear on the severe-pain path, in a first session, or twice running.
 *
 * P4. Nothing here praises, scores, compares or concludes. G-BAL-1 comes
 * nearest to a compliment and is deliberately about the body's own
 * competence rather than the person's effort.
 */

import { store } from "../store.js";

/** Depth. Beyond asks more of somebody than Contact does, so it arrives
 *  later: in week one it reads as instruction, later as invitation. */
export const DEPTH_FLOOR = { contact: 0, place: 8, beyond: 20 };

/** Cadence. Often enough to be part of the product, rare enough to stay
 *  slightly unexpected. At every session these become furniture. */
export const GM_MIN_SESSIONS = 2;   // never in a first session
export const GM_GAP          = 3;   // sessions between moments

export const GROUNDING_MOMENTS = [
  // ── Isometric holds ────────────────────────────────────────────────
  { id: "hold-contact-1", family: "hold", depth: "contact", outward: false,
    text: "Before the shake starts \u2014 where are you actually touching the ground? Forearms, elbows, the heel of your hands. Find the spot taking the most. That one point is doing a lot of quiet work." },
  { id: "hold-contact-2", family: "hold", depth: "contact", outward: true,
    text: "Pick a spot on the floor and stay with it. Not to concentrate. Just somewhere to rest your eyes while the rest of you works." },
  { id: "hold-place-1", family: "hold", depth: "place", outward: true,
    text: "If you were holding this in a field, what would be under your hands? See if you can put grass there. Cool, slightly damp, giving a little." },
  { id: "hold-beyond-1", family: "hold", depth: "beyond", outward: true,
    text: "You are a line held above the ground, and everything around you is growing. Grass, flowers, whatever is in your meadow. You are not separate from it. You are part of it, holding still a moment while it carries on." },

  // ── Outdoor cardio ─────────────────────────────────────────────────
  { id: "outdoor-contact-1", family: "outdoor", depth: "contact", outward: false,
    text: "Listen to your feet. Not the pace of them \u2014 the sound. Then your breathing underneath it. Two rhythms, not quite matching." },
  { id: "outdoor-place-1", family: "outdoor", depth: "place", outward: true,
    text: "What is the air doing to your skin right now? Cold on your face, warm on your arms, moving or still. You are outside, and your body already knows it." },
  { id: "outdoor-place-2", family: "outdoor", depth: "place", outward: true,
    text: "See how far you can hear. Birds, wind, a road somewhere. Something further off than you first noticed." },
  { id: "outdoor-beyond-1", family: "outdoor", depth: "beyond", outward: true,
    text: "Someone is walking home ahead of you. You will never know what kind of day they have had. You do not need to. You can just wish them a good evening and keep going." },
  { id: "outdoor-beyond-2", family: "outdoor", depth: "beyond", outward: true,
    text: "Somebody is out in their garden. Somebody else has just got in from work. All of that carries on around you while you move through it, and none of it is about you. There is something restful in that." },

  // ── Loaded strength. Before the set, never during it. ───────────────
  { id: "loaded-contact-1", family: "loaded", depth: "contact", outward: false,
    text: "Before you start \u2014 feel your feet. All of it. Heels, outside edge, the ball of each foot. The floor will push back exactly as hard as you push down." },
  { id: "loaded-place-1", family: "loaded", depth: "place", outward: true,
    text: "Whatever is under you now, there is ground under that. The same ground either way, holding you up without being asked." },

  // ── Floor work ─────────────────────────────────────────────────────
  { id: "floor-contact-1", family: "floor", depth: "contact", outward: false,
    text: "Let something go heavy. Whatever part of you is touching the floor, stop holding it up. The floor has it." },
  { id: "floor-place-1", family: "floor", depth: "place", outward: true,
    text: "Warm ground after a day of sun. That is what you are lying on. Give it a second and see whether your body half believes it." },

  // ── Seated ─────────────────────────────────────────────────────────
  { id: "seated-contact-1", family: "seated", depth: "contact", outward: false,
    text: "Notice where the chair is holding you. Backs of the legs, base of the spine. You are supported right now without doing anything about it." },
  { id: "seated-place-1", family: "seated", depth: "place", outward: true,
    text: "Find the furthest thing you can see from where you are sitting. A doorway, a tree, a rooftop. Let your eyes go all the way out there for a moment." },

  // ── Balance. Before, not during -- shifting attention mid-balance is
  //    a fall risk, and G-BAL-1 reads better in hindsight anyway. ──────
  { id: "balance-contact-1", family: "balance", depth: "contact", outward: false,
    text: "When you finish this one, notice the small corrections you were making. Those tiny adjustments at your ankle. Nobody taught you those. Your body was doing arithmetic you never learn consciously." },
  // Added after the gate caught that balance had no outward moment: its
  // only entry was inward, and the two "any" moments are self-directed by
  // nature. Somebody for whom inward attention does not suit would have
  // had nothing here. Doubles usefully as the standard balance advice.
  { id: "balance-place-1", family: "balance", depth: "place", outward: true,
    text: "Find something still to look at, roughly eye height, and let your eyes stay there. Balance is easier when they have somewhere to rest." },

  // ── Indoor cardio machines ─────────────────────────────────────────
  { id: "machine-contact-1", family: "machine", depth: "contact", outward: false,
    text: "No weather in here, no view. So: your breath and the machine. See if you can hear one over the other." },
  { id: "machine-place-1", family: "machine", depth: "place", outward: true,
    text: "This is a room built for going nowhere. Somewhere out there it is raining, or it is not. Picture the weather you are missing." },

  // ── Any family. Pointing Beyond at yourself is a real version of it,
  //    not a lesser one -- and the gentlest first Beyond, since it asks
  //    nothing of anybody else. ────────────────────────────────────────
  { id: "self-beyond-1", family: "any", depth: "beyond", outward: false,
    text: "Think of yourself on a harder day than this one. Not to compare. Just to notice that the person who turns up on those days is the same one here now." },
  { id: "self-beyond-2", family: "any", depth: "beyond", outward: false,
    text: "Whatever you would say to somebody else doing this \u2014 try aiming it at yourself for a second." },
];

/**
 * Which family does this exercise belong to?
 *
 * Derived from fields every exercise already carries -- position,
 * category, equipment, balanceDemand, duration -- rather than a new
 * field on 550+ entries. A data migration to support a content feature
 * would be the tail wagging the dog, and the equipment vocabulary work
 * from CON-2 already did the hard part.
 *
 * Returns null when nothing fits, and the caller shows nothing. Silence
 * is a perfectly good outcome here.
 */
export function groundingFamily(exercise) {
  if (!exercise) return null;
  const eq   = exercise.equipment || [];
  const has  = (...ids) => ids.some(id => eq.includes(id));
  const name = (exercise.name || "").toLowerCase();

  // Isometric first, because a hold in any position is a hold. Duration
  // without reps is the structural signal; the name check is a fallback
  // for entries where duration is not set. Word-boundaried, since a bare
  // substring match on "hold" catches names where the word is incidental.
  const isHold = (exercise.duration && !exercise.reps)
    || /\b(plank|isometric|dead hang|wall sit)\b/.test(name)
    || /\bhold\b/.test(name);
  if (isHold) return "hold";
  if (has("treadmill", "exercise-bike", "elliptical", "stair-climber",
          "rowing-machine", "ski-erg")) return "machine";
  if (exercise.category === "cardio") return "outdoor";
  if (exercise.balanceDemand === true) return "balance";
  if (has("dumbbell", "kettlebell", "barbell", "medicine-ball", "cable-machine",
          "leg-press-machine", "leg-curl-machine", "chest-press-machine")) return "loaded";
  if (exercise.position === "floor")  return "floor";
  if (exercise.position === "seated") return "seated";
  return null;
}

/**
 * Should a moment appear at all right now?
 *
 * Deliberately conservative. Every reason below is a reason to stay
 * quiet, and staying quiet costs nothing.
 */
export function shouldOfferMoment(sessionCount, painScores) {
  if (sessionCount < GM_MIN_SESSIONS) return false;

  // Never on the severe-pain path. Somebody at 7+ is being routed to
  // Gentle Care; "notice where your body meets the floor" is the wrong
  // sentence to hand them, and 7 is the threshold the rest of the app
  // already treats as acute.
  const scores = painScores || store.get("conditionPainScores") || {};
  if (Object.values(scores).some(v => (v || 0) >= 7)) return false;

  const g = store.get("grounding") || {};
  if (sessionCount - (g.lastSession || 0) < GM_GAP) return false;

  return true;
}

/**
 * Choose a moment for this exercise, or null.
 *
 * @param {Object} exercise
 * @param {number} sessionCount
 */
export function selectMoment(exercise, sessionCount) {
  const family = groundingFamily(exercise);
  if (!family) return null;
  if (!shouldOfferMoment(sessionCount)) return null;

  const g         = store.get("grounding") || {};
  const dismissed = new Set(g.dismissed || []);
  const shown     = new Set(g.shown || []);

  const eligible = GROUNDING_MOMENTS.filter(m =>
    (m.family === family || m.family === "any") &&
    sessionCount >= DEPTH_FLOOR[m.depth] &&
    !dismissed.has(m.id) &&
    m.id !== g.lastId
  );
  if (eligible.length === 0) return null;

  // Unseen first, so the pool is covered before anything repeats. Only
  // when everything has been seen does it start round again -- the
  // lesson from EMP-1, where scoring alone quietly reduced a pool of
  // four to a pool of two.
  const unseen = eligible.filter(m => !shown.has(m.id));
  const pool   = unseen.length > 0 ? unseen : eligible;

  return pool[sessionCount % pool.length];
}

/** Records that a moment was shown. Called when it renders, not when it
 *  is interacted with -- there is nothing to interact with. */
export function recordMomentShown(moment, sessionCount) {
  if (!moment) return;
  const g = store.get("grounding") || { shown: [], dismissed: [] };
  if (g.lastId === moment.id && g.lastSession === sessionCount) return;  // idempotent across re-renders
  store.set("grounding", {
    ...g,
    lastSession: sessionCount,
    lastId:      moment.id,
    shown:       [...new Set([...(g.shown || []), moment.id])],
  });
}

/** Permanent. Not a skip, never counted as one, never asked about. */
export function dismissMoment(momentId) {
  if (!momentId) return;
  const g = store.get("grounding") || { shown: [], dismissed: [] };
  store.set("grounding", {
    ...g,
    dismissed: [...new Set([...(g.dismissed || []), momentId])],
  });
}
