/**
 * saved-sessions.js
 * 30 Sep 2026 v4
 *
 * v4 - W3-16 ARC-AND-SAVED (persona Wave 3, 2.15; Schema v1.86). The kind was
 *   stored as the plan's id ("upper-1790..."), so the rebuild could not
 *   match it and started Glute Focus. And only ids were kept, so sections,
 *   order, sets and reps came back as the library's. Now the kind is the
 *   kind, and doses (section, sets, reps, duration per move) are kept
 *   beside the ids and laid over the LIVE library entry when the session
 *   is resolved -- still ids, so library corrections (rest included,
 *   which is not kept) still reach a saved session.
 *
 * v3 - P21, PLAYERS (persona finding W2-17). lastDoneOf(saved): when the
 *   person last FINISHED this session, read from the activity log -- a
 *   finished entry that holds every move the saved session still has.
 *   lastUsedAt was stamped when a saved session was started, finished or
 *   not, and never when one was saved from the finish screen straight
 *   after doing it, so the list said "Not done yet" about something just
 *   done. markSavedSessionUsed() is no longer called; the field is left
 *   as it is on stored records.
 *
 * 08 Sep 2026 v2
 *
 * v2 - SAVED-2. updateSavedSession(). Graeme's decision: saved sessions
 *   should be editable and deletable.
 *
 *   "Iterations", so editing OVERWRITES: no version history, no
 *   "Sunday legs v2". A saved session is one thing that changes over
 *   time, which is exactly what makes deleteSavedSession() the only way
 *   to lose one.
 *
 *   Validates by saveSession()'s rules rather than its own. An edit that
 *   could set a name creation would have rejected is a second set of
 *   rules, and the two would drift the first time either moved. An edit
 *   that empties the movement list is refused too: that is a deletion
 *   wearing an edit's clothes, and it leaves a row whose start button
 *   SAVED-1b already has to suppress.
 *
 *   createdAt is NOT touched. The list orders by it, so stamping it on
 *   every edit would shuffle the session somebody uses most to the top
 *   of their own list for no reason they asked for.
 *
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
const KINDS = ["glute", "upper", "lower", "full", "core", "gym", "cardio", "mobility", "stretch"];
/** W3-16. The session's kind: its sessionType, or its id's type prefix -- never the id. */
function kindOf(built) {
  if (KINDS.includes(built.sessionType)) return built.sessionType;
  const m = String(built.id || "").match(/^([a-z]+)-\d{10,}$/);
  if (m && KINDS.includes(m[1])) return m[1];
  return KINDS.includes(built.id) ? built.id : null;
}
/** W3-16. Each move's section and dose, as built. */
function dosesOf(exercises) {
  const out = {};
  for (const e of exercises || []) {
    if (!e || !e.id) continue;
    const d = { section: e.section || e.role || "main" };
    // Not rest: that is the library's, and a corrected rest must reach
    // a saved session (verify-yourown 1c).
    for (const k of ["sets", "reps", "duration"]) if (e[k] !== undefined && e[k] !== null) d[k] = e[k];
    out[e.id] = d;
  }
  return out;
}

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
    sessionType:  kindOf(built),
    doses:        dosesOf(built.exercises),
    durationMins: Number(built.durationMins) || null,
    equipment:    Array.isArray(store.get("equipment")) ? [...store.get("equipment")] : [],
    exerciseIds:  built.exercises.map(e => e.id).filter(Boolean),
    createdAt:    new Date().toISOString(),
    lastUsedAt:   null
  };

  store.set("savedSessions", [...list(), record]);
  return { ok: true, saved: record };
}

/**
 * SAVED-2, 08 Sep 2026. Write a change back to an existing saved session.
 *
 * Graeme's decision, asked and answered: saved sessions should be
 * editable and deletable. "Iterations" -- so this OVERWRITES. There is no
 * version history and no "Sunday legs v2": a saved session is one thing
 * that changes over time, which is exactly what makes
 * deleteSavedSession() the only way to lose one.
 *
 * Validates by the same rules as saveSession() rather than its own: an
 * edit that could set a name saveSession() would have rejected is a
 * second set of rules, and the two would drift the first time either
 * changed. Empty or whitespace-only names are refused here too, so an
 * edit cannot empty a name that creation required.
 *
 * createdAt is NOT touched. The list orders by it, so stamping it on
 * every edit would shuffle the session somebody uses most to the top of
 * their own list for no reason they asked for.
 *
 * Returns the same { ok, reason } shape as saveSession() so callers do
 * not need to learn a second one.
 */
export function updateSavedSession(id, changes = {}) {
  if (!isPremium()) return { ok: false, reason: "tier" };

  const before = list();
  const idx = before.findIndex(s => s && s.id === id);
  if (idx === -1) return { ok: false, reason: "missing" };

  const next = { ...before[idx] };

  if ("name" in changes) {
    const clean = String(changes.name || "").trim().slice(0, NAME_MAX);
    if (!clean) return { ok: false, reason: "name" };
    next.name = clean;
  }

  if ("exerciseIds" in changes) {
    const ids = Array.isArray(changes.exerciseIds)
      ? changes.exerciseIds.filter(Boolean)
      : null;
    // A session with nothing in it is not an edit, it is a deletion
    // wearing an edit's clothes -- and it would leave a row whose start
    // button SAVED-1b already has to suppress. If somebody wants it gone
    // they can say so.
    if (!ids || ids.length === 0) return { ok: false, reason: "empty" };
    next.exerciseIds = ids;
    // W3-16. Doses follow the moves: a move taken out loses its dose.
    const d = next.doses && typeof next.doses === "object" ? next.doses : {};
    next.doses = Object.fromEntries(ids.filter(i => d[i]).map(i => [i, d[i]]));
  }
  // W3-16. The edited session's own doses, when the editor passes them.
  if (Array.isArray(changes.exercises)) next.doses = dosesOf(changes.exercises);

  if ("durationMins" in changes) {
    next.durationMins = Number(changes.durationMins) || null;
  }

  next.updatedAt = new Date().toISOString();

  const after = [...before];
  after[idx] = next;
  store.set("savedSessions", after);
  return { ok: true, saved: next };
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
 * P21. When this saved session was last finished, from the activity log.
 * A finished entry counts when it holds every move the saved session
 * still has in the library -- which is true whether it was started from
 * the saved list or done first and saved afterwards. Partial sessions do
 * not count: "last done" means done.
 *
 * @returns {string|null} ISO time of the latest such entry
 */
export function lastDoneOf(saved) {
  const ids = resolveSavedSession(saved).exercises.map(e => e.id);
  if (ids.length === 0) return null;
  let latest = null;
  for (const e of (store.get("activityLog") || [])) {
    // The store's own rule (logActivity): anything not partial is finished.
    if (!e || e.status === "partial") continue;
    const done = new Set(Array.isArray(e.exerciseIds) ? e.exerciseIds : []);
    if (!ids.every(id => done.has(id))) continue;
    const t = e.completedAt || e.date;
    if (t && (!latest || t > latest)) latest = t;
  }
  return latest;
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
  // W3-16. The live library entry, with the saved section and dose laid
  // over it: library words and corrections, the person's doses.
  const doses = saved.doses && typeof saved.doses === "object" ? saved.doses : {};
  const found = saved.exerciseIds
    .map(id => { const e = EXERCISES.find(x => x.id === id); return e ? (doses[id] ? { ...e, ...doses[id] } : e) : null; })
    .filter(Boolean);
  return { exercises: found, missing: saved.exerciseIds.length - found.length };
}
