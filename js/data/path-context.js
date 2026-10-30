/**
 * js/data/path-context.js
 * 29 Oct 2026 v2
 *
 * v2 - STAGE PATH Session 6. The player now does what the last two lines
 *   say (workout.js v36: no countdown on a low-mood day; the halfway check
 *   when something is quite sore), so every E4 line is shown. The lines
 *   left out where a plan already names the area are matched on the area's
 *   own words (the pattern matched "your own pace" too).
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
 * today. Four were not (found in Session 5, before any was on screen).
 * Graeme, 29 Oct: make the first two true in Session 6, and reword the
 * other two to what the app does (path-engine.js v3), so two stay off
 * until Session 6:
 *   - "No countdown timers, go at your own pace": the player still offers
 *     its clock on a low-mood day (workout.js, Session 6 can make it so);
 *   - "A quick check halfway: still okay?": the player has no halfway check
 *     (Session 6);
 *   (reworded in v3: "Fewer rounds and longer rests" is now "Shorter than
 *   usual, with more time to settle at the end"; "Built from your last three
 *   sessions, so it won't repeat" is now "Mixed up from your last few
 *   sessions".)
 * Left off the screen, never reworded here: the engine's words stay one
 * gate's (verify-path-engine). A list with nothing true in it is not drawn.
 */
import { store } from "../store.js";
import { getTodaysCheckin } from "./checkin.js";
import { areaWords } from "./conditions.js";
import { EXERCISES, filterByConditions } from "./exercises/index.js";
import { PATH_MOVEMENTS } from "./exercises/path_movements.js";
import { movementName, adjustmentsFor, freshSequence, recentIds } from "./path-engine.js";

const LIBRARY = [...EXERCISES, ...PATH_MOVEMENTS];
const LIBRARY_BY_ID = new Map(LIBRARY.map(e => [e.id, e]));

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

const NOT_YET = [];   // v2: Session 6 made the last two true (workout.js v36)

/**
 * The engine's adjustments for today that the app really does now.
 * nameArea false leaves out the lines that name a sore area, for a screen
 * that already says it in its own sentence (Today's plan: the area is said
 * once, verify-sore-words 4c).
 */
export function shownAdjustments({ nameArea = true } = {}) {
  const named = soreToday().map(s => ` your ${areaWords(s.id)}`);
  return adjustmentsFor({ checkin: checkinToday(), sore: soreToday(), ...prefNames() })
    .filter(line => !NOT_YET.some(re => re.test(line)))
    .filter(line => nameArea || !named.some(w => line.endsWith(w)));
}

/**
 * A fresh one for me (blueprint E5), from what the person told the app:
 * likes, less and never, the last two sessions, today's sore areas.
 * { practice, fresh: true } shaped as a programme; or, when the pool cannot
 * fill one inside the feeling's limits, { practice: nearest programme, note }.
 */
export function freshPracticeFor({ feeling, minutes = 10 } = {}) {
  const ids = prefIds();
  const r = freshSequence({ feeling, minutes, never: ids.never, liked: ids.liked, less: ids.less,
    recent: recentIds(store.get("activityLog") || []), avoidFor: soreToday().map(s => s.id) });
  if (!r) return null;
  if (r.fallback) return r.programme ? { practice: r.programme, note: r.message } : null;
  const WORD = { arrive: "To arrive", settle: "To settle" };
  return { practice: { id: "fresh", name: "A fresh one for me", minutes: r.minutes, style: null, position: null,
    steps: r.steps.map(s => ({ id: s.id, mins: s.mins, note: WORD[s.role] || "" })) }, fresh: true };
}

/**
 * v2, Session 6 (one proposal shape). What Swap offers for one movement of
 * a programme, a routine or a kept session, before it starts: movements of
 * the same kind for the same purpose, never one the person said Not again
 * to, never one already in it, never a held or forced breath, and never
 * one today's sore areas rule out (the builder's own rule, filterByConditions).
 *   feel:    tagged for Move to feel better and this feeling, same position;
 *   stretch: tagged for Stretch, working any of the same areas, same position
 *            (so a routine without the floor stays without it);
 *   else:    the same movement pattern and category (a kept session).
 */
const HELD_BREATH = new Set(["box-breathing", "box-breathing-extended", "four-seven-eight-breathing", "energising-breath", "alternate-nostril-breathing"]);
export function swapOptionsFor(id, { door = null, feeling = null, exclude = [] } = {}) {
  const me = LIBRARY_BY_ID.get(id);
  if (!me) return [];
  const never = prefIds().never;
  const out = new Set(exclude);
  let pool = LIBRARY.filter(e => e.id !== id && !out.has(e.id) && !never.has(e.id) && !HELD_BREATH.has(e.id));
  if (door === "feel") pool = pool.filter(e => (e.doors || []).includes("feel") && (!feeling || (e.feelings || []).includes(feeling)) && e.position === me.position);
  else if (door === "stretch") pool = pool.filter(e => (e.doors || []).includes("stretch") && e.position === me.position
    && (e.affectsAreas || []).some(a => (me.affectsAreas || []).includes(a)));
  else pool = pool.filter(e => e.movementPattern && e.movementPattern === me.movementPattern && e.category === me.category);
  const sore = soreToday().map(s => s.id);
  if (sore.length) pool = filterByConditions(pool, sore).safe;
  return pool.sort((a, b) => String(a.name).localeCompare(String(b.name)));
}
