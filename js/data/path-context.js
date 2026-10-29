/**
 * js/data/path-context.js
 * 29 Oct 2026 v1
 *
 * STAGE PATH Session 5 (P-5). What the person has told the app today, read
 * the one way for every Plan screen that asks the engine (data/path-engine.js):
 * Home (views/plan-home.js), the door routes (views/path.js) and Today's
 * plan (views/coach-proposal.js). It was private to plan-home.js in Session
 * 4; three readers now, so one place.
 *
 * Reads the store; writes nothing. The journal is never read (A5.21).
 *
 * shownAdjustments(): the engine's E4 sentences that are TRUE in the app
 * today. Four are not yet (found in Session 5, before any was on screen):
 *   - "No countdown timers, go at your own pace": the player still offers
 *     its clock on a low-mood day (workout.js, Session 6 can make it so);
 *   - "A quick check halfway: still okay?": the player has no halfway check
 *     (Session 6);
 *   - "Fewer rounds and longer rests": a low-energy day is built shorter,
 *     with more time to settle at the end (session-builder.js), which its own
 *     line already says on the plan;
 *   - "Built from your last three sessions, so it won't repeat": the builder
 *     rotates, but does not promise no repeat.
 * They are left off the screen, never reworded here: the engine's words stay
 * one gate's (verify-path-engine), and what to say instead is Graeme's
 * (schedule P-5). A list with nothing true in it is not drawn.
 */
import { store } from "../store.js";
import { getTodaysCheckin } from "./checkin.js";
import { movementName, adjustmentsFor } from "./path-engine.js";

/** Today's check-in as the engine reads it ({ energy, mood }), or null. */
export function checkinToday() {
  if (!store.checkedInToday()) return null;
  const c = getTodaysCheckin();
  const energy = Number(c?.energy), mood = Number(c?.mood);
  return Number.isFinite(energy) || Number.isFinite(mood)
    ? { energy: Number.isFinite(energy) ? energy : null, mood: Number.isFinite(mood) ? mood : null } : null;
}

/** Areas named sore today: [{ id, score }]. */
export function soreToday() {
  const s = store.get("conditionPainScores") || {};
  return Object.entries(s).filter(([, v]) => Number(v) > 0).map(([id, score]) => ({ id, score: Number(score) }));
}

/** Where they last moved, Home or Gym (Home when nothing says). */
export function lastPlace() {
  const log = store.completedSessions(store.get("activityLog") || []);
  for (let i = log.length - 1; i >= 0; i--) if (log[i].place === "home" || log[i].place === "gym") return log[i].place;
  return "home";
}

/** Liked, less and never, as names, for the engine's sentences. */
export function prefNames() {
  const liked = Object.keys(store.get("likedMovements") || {}).map(movementName).filter(Boolean);
  const prefs = store.get("exercisePreferences") || {};
  const by = want => Object.entries(prefs).filter(([, p]) => (p?.preference || p) === want).map(([id]) => movementName(id)).filter(Boolean);
  return { likedNames: liked, lessNames: by("less"), neverNames: by("avoid") };
}

/** Liked, less and never, as ids, for freshSequence(). */
export function prefIds() {
  const liked = store.get("likedMovements") || {};
  const prefs = store.get("exercisePreferences") || {};
  const by = want => new Set(Object.entries(prefs).filter(([, p]) => (p?.preference || p) === want).map(([id]) => id));
  return { liked, less: by("less"), never: by("avoid") };
}

/** A low mood this morning (Struggling or Low), from the check-in. */
export function lowMood() {
  const m = checkinToday()?.mood;
  return m != null && m <= 3;
}

const NOT_YET = [/^No countdown timers/, /^A quick check halfway/, /^Fewer rounds and longer rests$/, /^Built from your last three sessions/];

/** The engine's adjustments for today that the app really does now. */
export function shownAdjustments() {
  return adjustmentsFor({ checkin: checkinToday(), sore: soreToday(), ...prefNames() })
    .filter(line => !NOT_YET.some(re => re.test(line)));
}
