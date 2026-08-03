/**
 * js/session-resume.js - Resumable Session State
 *
 * 03 Aug 2026 v1
 *
 * CHANGELOG
 * 03 Aug 2026 v1 - Initial implementation, pilot on running-session.js
 *   (blueprint alongside_blueprint_wakelock-resume_03aug2026_v1.md).
 *
 * WHY THIS EXISTS
 * Found via real on-device use, 03 Aug 2026: a guided session that tracks
 * elapsed time by incrementing a counter once per setInterval tick loses
 * accuracy the moment the browser throttles or suspends background timers
 * (screen lock, backgrounding, tab switch) - and loses ALL progress on a
 * page refresh, since in-memory state doesn't survive one. This module
 * fixes both by anchoring elapsed time to real timestamps (so it's always
 * correct regardless of how badly ticks were throttled in between) and by
 * persisting a lightweight checkpoint so an interrupted session can be
 * recognised and offered back to the user, coach-voiced, rather than
 * silently forcing a restart.
 *
 * Single active-session slot - only one guided session can realistically
 * be in progress at a time, so no per-type namespacing beyond storing the
 * type as a field for identification.
 *
 * USAGE (in any session view)
 *
 *   import { checkpointSession, getResumableSession, clearCheckpoint,
 *            computeElapsedSeconds } from "../session-resume.js";
 *
 *   // On session start:
 *   checkpointSession("run", { selectedType, selectedMins, promptIndex: 0 });
 *
 *   // On pause/resume/prompt fired - re-checkpoint with updated fields:
 *   checkpointSession("run", { ...current fields... });
 *
 *   // On cold mount, before showing the normal picker:
 *   const resumable = getResumableSession("run");
 *   if (resumable) { ...offer resume-or-fresh... }
 *
 *   // Elapsed time, computed fresh every time - never trust a stored
 *   // "elapsed" value, there isn't one:
 *   const elapsed = computeElapsedSeconds(checkpointOrEquivalent, pausedAtOrNull);
 *
 *   // On genuine completion, or deliberate exit-and-save:
 *   clearCheckpoint();
 *
 * NOT YET WIRED INTO: workout.js, yoga-session.js, walk-session.js,
 * cycle-session.js, swim-session.js, core-session.js. Pilot is
 * running-session.js only - generalise once proven on-device.
 */

import { store } from "./store.js";

const STALE_MS = 3 * 60 * 60 * 1000; // 3 hours - long enough to cover a
                                       // genuine interruption-and-return,
                                       // short enough that a checkpoint
                                       // from yesterday isn't offered as
                                       // if it's still live.

/**
 * Write/update the active session checkpoint.
 * @param {string} sessionType - e.g. "run". Used to confirm a resumable
 *   checkpoint actually matches the session view asking for it.
 * @param {object} fields - session-specific fields to store. `startedAt`
 *   should be included on the very first call (session start); later
 *   calls can omit it and the existing value is preserved.
 */
export function checkpointSession(sessionType, fields) {
  const existing  = store.get("activeSessionCheckpoint") || {};
  const startedAt = fields.startedAt || existing.startedAt || new Date().toISOString();

  store.set("activeSessionCheckpoint", {
    ...existing,
    ...fields,
    sessionType,
    startedAt,
    checkpointedAt: new Date().toISOString()
  });
}

/**
 * Returns the active checkpoint if one exists, matches the requested
 * sessionType, and isn't stale. Returns null otherwise (and clears a
 * stale checkpoint automatically, so it doesn't linger indefinitely).
 */
export function getResumableSession(sessionType) {
  const checkpoint = store.get("activeSessionCheckpoint");
  if (!checkpoint) return null;
  if (checkpoint.sessionType !== sessionType) return null;

  const checkpointedAt = new Date(checkpoint.checkpointedAt).getTime();
  if (isNaN(checkpointedAt) || Date.now() - checkpointedAt > STALE_MS) {
    clearCheckpoint();
    return null;
  }

  return checkpoint;
}

/** Clear the active checkpoint - call on completion, deliberate exit, or "start fresh". */
export function clearCheckpoint() {
  store.set("activeSessionCheckpoint", null);
}

/**
 * Compute true elapsed seconds from a checkpoint's timestamps. Never
 * trust a tick-counted value - always recompute from wall-clock time.
 * @param {object} checkpoint - must have `startedAt` (ISO string) and
 *   `totalPausedMs` (number, accumulated pause duration so far).
 * @param {number|null} pausedAt - epoch ms if currently mid-pause (adds
 *   the in-progress pause duration on top of totalPausedMs), or null.
 */
export function computeElapsedSeconds(checkpoint, pausedAt) {
  const startedAt     = new Date(checkpoint.startedAt).getTime();
  const totalPausedMs = checkpoint.totalPausedMs || 0;
  const extraPause    = pausedAt ? (Date.now() - pausedAt) : 0;
  return Math.max(0, Math.floor((Date.now() - startedAt - totalPausedMs - extraPause) / 1000));
}
