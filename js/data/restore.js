/**
 * js/data/restore.js
 * 01 Oct 2026 v1
 *
 * RESTORE. Bring a person's history to a new device from the file
 * Settings › Download your data saved. Nothing goes through a server:
 * the person carries the file themselves (email, AirDrop, a cable).
 * Graeme, 01 Oct: "most users who change phones will want to continue the
 * progress they've started".
 *
 * RULES, each tested in tools/verify-restore.mjs:
 *   1. ONLY A FILE ALONGSIDE WROTE. It must parse, carry the "about" line
 *      downloadData() writes, and hold a store object. Anything else is
 *      refused with a plain reason; nothing on the device changes.
 *   2. ONLY FIELDS ALONGSIDE KNOWS. Top-level store fields not in
 *      getDefaults() or KNOWN_OUTSIDE_DEFAULTS are dropped. Display keys are kept only if they start
 *      'alongside' (not the store's own key) and are short strings.
 *   3. NO MARKUP. A file whose text contains anything that looks like an
 *      HTML tag is refused, so a crafted file cannot put working code into
 *      the app's screens.
 *   4. THIS DEVICE'S AGREEMENTS STAY. The age answer, the policy and terms
 *      agreement and the health consent are this device's, given here. The
 *      file's are ignored, so a file can never carry a "yes" across.
 *      (Settings only offers restore once the health consent is given.)
 *   5. REPLACE, NEVER MERGE. Everything Alongside has stored on this device
 *      is replaced by the file, then run through mergeWithDefaults() like
 *      any older saved data, so a file from an earlier version still loads.
 *
 * The Plan's payment status will not come from this file once payments
 * exist: that is Stripe's record. During the beta the Plan is free.
 */
import { store } from "../store.js";

export const MAX_BYTES = 10 * 1024 * 1024;
const ABOUT_PREFIX = "Everything Alongside: Move keeps about you";
const MARKUP = /<\s*[a-zA-Z!\/?]/;
const MAX_DISPLAY_VALUE = 2000;

/**
 * Live fields that are written without being in getDefaults() (Schema.md,
 * "first write defines it"), and are the person's history or settings, so
 * a restore must carry them. Routing flags (quietMode, todayPurpose and
 * the like) are left out on purpose: they belong to a moment, not to a
 * person. Legacy consentGiven is left out: agreements are this device's.
 */
export const KNOWN_OUTSIDE_DEFAULTS = [
  "gymEquipment", "homeEquipment", "totalCredits", "availableTime",
  "workoutHistory", "workoutProgress", "morningProgrammeWeek",
  "prescribedSessionProgress", "lastWorkoutName", "lastWorkoutCredits",
  "lastMilestone",
];

function _hasMarkup(v) {
  if (typeof v === "string") return MARKUP.test(v);
  if (Array.isArray(v)) return v.some(_hasMarkup);
  if (v && typeof v === "object") return Object.keys(v).some(k => MARKUP.test(k) || _hasMarkup(v[k]));
  return false;
}

const NOT_OURS = "This file wasn't saved by Alongside's Download your data, so nothing has been changed.";

/**
 * Read a file's text. Returns { ok: false, reason } or
 * { ok: true, data, summary: { exportedAt, sessions, journal } }.
 * Changes nothing.
 */
export function readRestoreFile(text) {
  if (typeof text !== "string" || !text.trim()) return { ok: false, reason: NOT_OURS };
  if (text.length > MAX_BYTES) return { ok: false, reason: "This file is too large to be one Alongside saved, so nothing has been changed." };
  let parsed;
  try { parsed = JSON.parse(text); } catch { return { ok: false, reason: NOT_OURS }; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { ok: false, reason: NOT_OURS };
  if (typeof parsed.about !== "string" || !parsed.about.startsWith(ABOUT_PREFIX)) return { ok: false, reason: NOT_OURS };
  const s = parsed.store;
  if (!s || typeof s !== "object" || Array.isArray(s)) return { ok: false, reason: NOT_OURS };
  if (_hasMarkup(s) || _hasMarkup(parsed.display)) {
    return { ok: false, reason: "This file contains something Alongside would not have written, so nothing has been changed." };
  }
  return {
    ok: true,
    data: parsed,
    summary: {
      exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : null,
      sessions: Array.isArray(s.activityLog) ? s.activityLog.length : 0,
      journal: Array.isArray(s.journalEntries) ? s.journalEntries.length : 0,
    },
  };
}

/** Replace everything Alongside has stored on this device with the file's. */
export function applyRestore(data) {
  const known = new Set([...Object.keys(store.getDefaults()), ...KNOWN_OUTSIDE_DEFAULTS]);
  const incoming = data.store || {};
  const picked = {};
  for (const k of Object.keys(incoming)) if (known.has(k)) picked[k] = incoming[k];
  // Rule 4: this device's agreements, never the file's.
  picked.consent = JSON.parse(JSON.stringify(store.data?.consent || store.get("consent") || {}));

  // Rule 5: replace. Every other 'alongside' key goes first.
  try {
    const old = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("alongside") && k !== store.STORAGE_KEY) old.push(k);
    }
    old.forEach(k => localStorage.removeItem(k));
    const display = data.display && typeof data.display === "object" ? data.display : {};
    for (const [k, v] of Object.entries(display)) {
      if (k.startsWith("alongside") && k !== store.STORAGE_KEY && typeof v === "string" && v.length <= MAX_DISPLAY_VALUE) {
        localStorage.setItem(k, v);
      }
    }
    localStorage.setItem(store.STORAGE_KEY, JSON.stringify(picked));
  } catch { /* storage unavailable: init below falls back */ }
  store.init();
  store.save();
}

/** "1 October 2026", or null. */
export function describeDate(iso) {
  const d = iso ? new Date(iso) : null;
  if (!d || isNaN(d)) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
