/**
 * js/data/general-routine.js
 * 02 Oct 2026 v1
 *
 * v1 - W5-8 DECLINE-DOORS (Wave 5 persona trace: 2.14, 2.4). Decided by
 *   Graeme, 02 Oct 2026: "Second chance, then one routine". Somebody who
 *   says no to keeping health answers, twice, gets one gentle full-body
 *   routine that changes day to day, with no health questions and nothing
 *   tailored. Without the answers the app knows nothing about their body,
 *   so the routine assumes nothing: all of it sitting in a chair, no floor,
 *   no impact, no balance, no squat or lunge, difficulty 1, no equipment.
 *
 *   Three routines, one a day in turn (the local day, so the same all day).
 *   Each works the whole body: a warm-up, the legs, the upper body, the
 *   trunk, a stretch. Picked by id; an id the library no longer has is
 *   left out rather than replaced with something unchecked.
 */
import { store }     from "../store.js";
import { EXERCISES } from "./exercises/index.js";

export const GENERAL_ROUTINES = Object.freeze([
  ["seated-shoulder-rolls-warmup", "seated-marching-cardio", "seated-scapular-retraction",
   "seated-heel-toe-raise", "seated-side-bend", "seated-lat-side-stretch"],
  ["seated-arm-cycling", "thoracic-rotation-seated", "seated-isometric-press",
   "seated-dead-bug-arms", "ankle-mobility-circles", "seated-chest-doorway-stretch"],
  ["seated-shoulder-rolls-warmup", "seated-marching-cardio", "seated-spinal-decompression",
   "seated-scapular-retraction", "seated-heel-toe-raise", "seated-neck-side-stretch"],
]);

export const GENERAL_ROUTINE_LINE =
  "Without your health answers I can't shape a session to you, so this is the same gentle routine " +
  "for anyone, all of it sitting in a chair. It changes from day to day. Stop if anything hurts.";

const _dayIndex = now => {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(d.getTime() / 86400000);
};

/** Today's routine (a session the player can play). */
export function generalRoutine(now = new Date()) {
  const ids = GENERAL_ROUTINES[((_dayIndex(now) % 3) + 3) % 3];
  const exercises = ids
    .map(id => EXERCISES.find(e => e.id === id))
    .filter(Boolean)
    .map((e, i) => ({ ...e, section: i === 0 ? "warmup" : i === ids.length - 1 ? "cooldown" : "main" }));
  return {
    id: "general-routine",
    title: "A gentle full-body routine",
    subtitle: "",
    duration: 20,
    general: true,
    coachLine: GENERAL_ROUTINE_LINE,
    exercises,
    rationale: []
  };
}

/** Stores today's routine as the session the player plays. */
export function startGeneralRoutine(now = new Date()) {
  const session = generalRoutine(now);
  store.set("generatedSession", {
    session,
    builtAt: now.toISOString(),
    inputs: { sessionType: "general-routine", general: true }
  });
  store.set("usingGeneratedSession", true);
  return session;
}
