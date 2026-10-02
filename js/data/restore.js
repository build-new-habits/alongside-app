/**
 * js/data/restore.js
 * 02 Oct 2026 v3
 *
 * v3 - W4-3 RESTORE-TAKES and W4-6 RESTORE-MOVE (Wave 4 trace, 01 Oct).
 *   Rule 3 now makes text harmless instead of refusing the file: a
 *   journal line holding "<sigh>" or "</3" refused the person's own file,
 *   locked or not. Every "<" becomes "‹" and a "javascript:" loses its
 *   colon (꞉), in text and keys; the words read the same and nothing can
 *   become markup or an address. Rule 4 widened to what is this phone's:
 *   the Plan (tier), Messages and the News switch, and display settings
 *   (text size, Reduce motion and the rest) stay as they are here. Rule 6
 *   new: health answers in a file come in only with this phone's health
 *   consent. The session count is store.completedSessions(), the one
 *   Progress uses.
 *
 * v2 - BUNDLE-TRUE. Rule 3 closed properly. Refusing tag-like text was not
 *   enough: every view writes stored text into double-quoted attributes, so
 *   a name holding a straight quotation mark could close one and add an
 *   event handler (shown working through My exercises by the independent
 *   check of the Foot Anstey bundle). Now (3b) every straight double
 *   quotation mark in a file's text and keys becomes a curly one, which
 *   reads the same and cannot end an attribute; and (3c) text containing a
 *   javascript: address is refused.
 *
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
 *   3. NO MARKUP. Text that could be markup or an address is made
 *      harmless ("<" to "‹", the colon of "javascript:" to "꞉"), never
 *      refused (v3); and every straight double quotation mark in its text
 *      and keys becomes a curly one (3b), so no text from a file can close
 *      an attribute. Together: a crafted file cannot put working code into
 *      the screens, and a person's own words never refuse their file.
 *   4. THIS DEVICE'S AGREEMENTS AND SETTINGS STAY. The age answer, the
 *      policy and terms agreement and the health consent are this device's,
 *      given here; so are the Plan, Messages and the News switch, and the
 *      display settings (v3). The file's are ignored, so a file can never
 *      carry a "yes" across, and never turn a Free phone into a Plan one.
 *   6. HEALTH ANSWERS NEED THIS PHONE'S CONSENT (v3). Without it, the
 *      file's health answers are deleted as Delete my health answers would.
 *   5. REPLACE, NEVER MERGE. Everything Alongside has stored on this device
 *      is replaced by the file, then run through mergeWithDefaults() like
 *      any older saved data, so a file from an earlier version still loads.
 *
 * The Plan's payment status will not come from this file once payments
 * exist: that is Stripe's record. During the beta the Plan is free.
 */
import { store } from "../store.js";
import { DISPLAY_KEYS } from "../display-prefs.js";

// W4-3. Display settings are this phone's, like its agreements.
const THIS_PHONE = new Set(Object.values(DISPLAY_KEYS));

export const MAX_BYTES = 10 * 1024 * 1024;
const ABOUT_PREFIX = "Everything Alongside: Move keeps about you";
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

/**
 * Rule 3 (v3). Text that could be markup or an address is made harmless,
 * never refused: a "<" that could open a tag (before a letter, "/", "!" or
 * "?") becomes "‹" (single angle quotation mark; "<3" stays) and the
 * colon of "javascript:" becomes "꞉" (modifier letter colon). Keys too.
 */
export function harmless(v) {
  if (typeof v === "string") return v.replace(/<(?=\s*[a-zA-Z!\/?])/g, "\u2039").replace(/(javascript\s*):/gi, "$1\uA789");
  if (Array.isArray(v)) return v.map(harmless);
  if (v && typeof v === "object") {
    const out = {};
    for (const k of Object.keys(v)) out[harmless(k)] = harmless(v[k]);
    return out;
  }
  return v;
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
  return {
    ok: true,
    data: parsed,
    summary: {
      exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : null,
      // W4-6. The count Progress uses: a stopped session is not counted.
      sessions: Array.isArray(s.activityLog) ? store.completedSessions(s.activityLog).length : 0,
      journal: Array.isArray(s.journalEntries) ? s.journalEntries.length : 0,
    },
  };
}

/**
 * Rule 3b. Straight double quotation marks, in text and keys, become curly
 * ones: the words read the same, and nothing can end an attribute (every
 * view writes text into double-quoted attributes; none into single-quoted
 * ones). Apostrophes are left alone: exercise names such as "Child's Pose"
 * are lookup keys. Numbers, true/false and null pass unchanged.
 */
export function curlQuotes(v) {
  if (typeof v === "string") {
    return v
      .replace(/(^|[\s(\[{\u2014-])"/g, "$1\u201C").replace(/"/g, "\u201D");
  }
  if (Array.isArray(v)) return v.map(curlQuotes);
  if (v && typeof v === "object") {
    const out = {};
    for (const k of Object.keys(v)) out[curlQuotes(k)] = curlQuotes(v[k]);
    return out;
  }
  return v;
}

/** Replace everything Alongside has stored on this device with the file's. */
export function applyRestore(data) {
  const known = new Set([...Object.keys(store.getDefaults()), ...KNOWN_OUTSIDE_DEFAULTS]);
  const incoming = harmless(curlQuotes(data.store || {}));
  const picked = {};
  for (const k of Object.keys(incoming)) if (known.has(k)) picked[k] = incoming[k];
  // Rule 4: this device's agreements, never the file's.
  const here = store.data || {};
  picked.consent = JSON.parse(JSON.stringify(here.consent || store.get("consent") || {}));
  // Rule 4 (v3, W4-3): and this phone's Plan, Messages and News switch.
  // Payment will be Stripe's record, never a file's; News is a choice
  // about what this phone shows.
  picked.tier = here.tier || "free";
  picked.messages = JSON.parse(JSON.stringify(here.messages || store.getDefaults().messages || {}));
  const healthHere = picked.consent?.health?.given === true;

  // Rule 5: replace. Every other 'alongside' key goes first.
  try {
    const old = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("alongside") && k !== store.STORAGE_KEY && !THIS_PHONE.has(k)) old.push(k);
    }
    old.forEach(k => localStorage.removeItem(k));
    const display = data.display && typeof data.display === "object" ? harmless(curlQuotes(data.display)) : {};
    for (const [k, v] of Object.entries(display)) {
      if (k.startsWith("alongside") && k !== store.STORAGE_KEY && !THIS_PHONE.has(k) && typeof v === "string" && v.length <= MAX_DISPLAY_VALUE) {
        localStorage.setItem(k, v);
      }
    }
    localStorage.setItem(store.STORAGE_KEY, JSON.stringify(picked));
  } catch { /* storage unavailable: init below falls back */ }
  store.init();
  // Rule 6 (W4-3): no health consent on this phone, no health answers from
  // the file. The same deletion as Settings › Delete my health answers,
  // which also plans carefully until the body questions are answered; this
  // phone's consent is put back as it was.
  if (!healthHere) {
    const consent = JSON.parse(JSON.stringify(store.data.consent || {}));
    store.deleteHealthAnswers();
    store.data.consent = consent;
  }
  store.save();
  return { healthCameAcross: healthHere };
}

/**
 * The confirmation's words (W4-3): what comes back, and what stays.
 * healthHere: whether this phone has the health consent.
 */
export function confirmMessage(summary, healthHere) {
  const { exportedAt, sessions, journal } = summary || {};
  const when = describeDate(exportedAt);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  return `${when ? `This file was saved on ${when}. ` : ""}It holds ${plural(sessions || 0, "session", "sessions")} and ${plural(journal || 0, "journal entry", "journal entries")}. ` +
    (healthHere
      ? "Restoring replaces your history, goals and settings on this device with the file's, including your health answers: check-ins, sore areas, what you told me about your body, and your journal. "
      : "Restoring replaces your history, goals and settings on this device with the file's. Your health answers and journal in the file are not brought across, because Alongside does not have your agreement to keep health answers on this phone. ") +
    "These stay as they are on this phone: your plan, Messages and the News switch, display settings, your answer to the age question and your agreements. It cannot be undone.";
}

/** "1 October 2026", or null. */
export function describeDate(iso) {
  const d = iso ? new Date(iso) : null;
  if (!d || isNaN(d)) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
