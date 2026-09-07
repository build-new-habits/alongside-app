/**
 * saved-sessions.js
 * 06 Sep 2026 v1
 *
 * YOUR-OWN. Sessions the person built and kept.
 *
 * WHY A MODULE AND NOT store.set() AT THE CALL SITES. Three rules have
 * to hold on every write and they are easy to forget one at a time: the
 * tier check, the name check, and storing exercise IDS rather than
 * exercise objects. A view that writes the array directly will get one
 * of those right and miss another, which is how exercisePreferences and
 * todayIntensity each ended up with a writer that disagreed with its
 * reader.
 *
 * ── WHAT THIS ROOM IS ──────────────────────────────────────────────────
 *
 * The four rooms sort by how much the coach leads. This is the one where
 * the coach leads least and the person is the author. The case on record
 * is Graeme's daughter, a national-standard sprinter, writing her
 * programme on paper -- SWAP-1 caught the conflation between deleting
 * the flat candidate picker and deleting self-authoring, and this is the
 * part that was kept.
 *
 * SO THE NAME IS NEVER GENERATED. A helpfully auto-named session takes
 * back the one thing this room is for. An empty name is REJECTED, not
 * quietly replaced with "Session 3".
 *
 * ── TIER ───────────────────────────────────────────────────────────────
 *
 * Plan only, checked at BOTH the writer and the reader. Free composes
 * freely -- R4, 20 Aug 2026, reversed TIER-G on exactly that point:
 * composing is how somebody whose body the default does not fit gets a
 * session they can actually do. What the Plan buys is that it is KEPT.
 *
 * ── WHY IDS AND NOT OBJECTS ────────────────────────────────────────────
 *
 * Storing whole exercise objects would freeze a copy of the library
 * inside somebody's saved session. A safety correction, a changed
 * contraindication, a fixed `rest` value -- none would ever reach it. A
 * saved session would become a private fork of the exercise database
 * that no gate can see. Ids are resolved against the live library at
 * start, and an id that has since gone is dropped rather than blocking.
 */

import { store }      from "../store.js";
import { isPremium }  from "../auth.js";
import { EXERCISES }  from "./exercises/index.js";

/** The most a name may be. Long enough for a real sentence, short
 *  enough that the card does not become the list. */
export const NAME_MAX = 60;

function list() {
  const v = store.get("savedSessions");
  return Array.isArray(v) ? v : [];
}

/**
 * @returns {Array} newest FIRST, which is display order. The stored
 *   array is newest LAST -- append order is the person's own order and
 *   the store should not be reordered for a view's convenience.
 */
export function savedSessions() {
  if (!isPremium()) return [];
  return list().slice().reverse();
}

export function savedSessionCount() {
  return savedSessions().length;
}

/**
 * @param {string} name  the person's own words
 * @param {object} built a session from buildSession()
 * @returns {{ok: boolean, reason?: string, saved?: object}}
 *
 * Returns a reason rather than throwing, because every caller is a
 * button and every failure here has something the person should be
 * told.
 */
export function saveSession(name, built) {
  if (!isPremium())  return { ok: false, reason: "tier" };
  if (!built || !Array.isArray(built.exercises) || built.exercises.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const clean = String(name || "").trim().slice(0, NAME_MAX);
  if (!clean) return { ok: false, reason: "name" };

  const record = {
    id:           `own_${new Date().toISOString()}_${Math.random().toString(36).slice(2, 6)}`,
    name:         clean,
    sessionType:  built.id || built.sessionType || null,
    durationMins: Number(built.durationMins) || null,
    equipment:    Array.isArray(store.get("equipment")) ? [...store.get("equipment")] : [],
    exerciseIds:  built.exercises.map(e => e.id).filter(Boolean),
    createdAt:    new Date().toISOString(),
    lastUsedAt:   null
  };

  store.set("savedSessions", [...list(), record]);
  return { ok: true, saved: record };
}

export function deleteSavedSession(id) {
  if (!isPremium()) return false;
  const before = list();
  const after = before.filter(s => s && s.id !== id);
  if (after.length === before.length) return false;
  store.set("savedSessions", after);
  return true;
}

export function markSavedSessionUsed(id) {
  const next = list().map(s =>
    s && s.id === id ? { ...s, lastUsedAt: new Date().toISOString() } : s);
  store.set("savedSessions", next);
}

/**
 * Resolve a saved session's ids against the LIVE library.
 *
 * Ids that no longer exist are dropped and reported rather than
 * silently skipped: a session that quietly comes back four movements
 * shorter than the person wrote is worse than one that says so.
 *
 * @returns {{exercises: Array, missing: number}}
 */
export function resolveSavedSession(saved) {
  if (!saved || !Array.isArray(saved.exerciseIds)) return { exercises: [], missing: 0 };
  const found = saved.exerciseIds
    .map(id => EXERCISES.find(e => e.id === id))
    .filter(Boolean);
  return { exercises: found, missing: saved.exerciseIds.length - found.length };
}
