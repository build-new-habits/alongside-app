/**
 * session-choice.js
 * 06 Sep 2026 v1
 *
 * TWO-ENGINE. What the coach suggests, and why.
 *
 * WHY THIS FILE EXISTS. `buildSession()` needs a `sessionType`. Until
 * now the coach route never chose one -- it called
 * `workoutGenerator.generateDailyOptions()`, which returned three
 * sessions built from a hardcoded list of three focuses and read none of
 * `sessionVariety`, `exercisePreferences` or SECTION-RULES. There was no
 * choice to make because there was nothing to choose between.
 *
 * THE CHAIN, confirmed by Graeme 06 Sep 2026. Each step falls through to
 * the next:
 *
 *   1. THE CLASS YOU ARE IN, if you are in one. `plannedFocusToday()`.
 *      The arc leads when there is one.
 *   2. WHAT THE ARC SAYS IS THIN. The aim's own strands, minus whatever
 *      has come up recently. This is what the arc is FOR.
 *   3. WHAT HAS NOT COME UP LATELY, across all eight types.
 *   4. `full`, which asks least of a person the coach knows nothing about.
 *
 * SEVERE PAIN IS NOT IN THE CHAIN, and that is deliberate rather than an
 * omission. `buildSession()` resolves excluded conditions and then
 * `severeZoneToday()` BEFORE any pool is built, returning Gentle Care
 * regardless of the type it was handed. Adding a severe check here would
 * be a second, weaker copy of a safety rule that already exists -- the
 * DATA-1b failure mode exactly. The gate reversal-proves the bypass
 * still fires through this chain rather than assuming it.
 *
 * ── FAULTLESS ──────────────────────────────────────────────────────────
 *
 * Every step records what it actually consulted, in `inputs`. This is
 * not telemetry. FAULTLESS is defined as: every input the coach implies
 * it used, it demonstrably used. `handlePreviewStart()` has been writing
 * `inputs: option.inputs || {}` since v8 and NEITHER engine has ever
 * produced the field, so the record has been empty on this route for its
 * whole life while the coach line talked about the check-in and the arc.
 *
 * `inputs` therefore carries only what was READ, never what was
 * inferred, and a step that falls through records that it found nothing
 * rather than staying silent. A missing key and a key with no value mean
 * different things and the coach may claim neither.
 *
 * ── WHAT THIS FILE MUST NEVER DO ───────────────────────────────────────
 *
 * It does not read journal content. It does not interpret. It answers
 * "what shape of session came up recently", never "what is this person
 * like". `sessionType` history is a fact about sessions, not a finding
 * about a person.
 */

import { store } from "../store.js";
import { SESSION_TYPES } from "../session-builder.js";
import { plannedFocusToday } from "./programmeEngine.js";
import { strandsForAim, sessionTypesForStrands } from "./aims.js";

/** How many recent sessions count as "lately". */
export const RECENT_WINDOW = 5;

/**
 * `plannedFocusToday()` returns one of three coarse focuses, not one of
 * the eight session types. Cardio and mobility map straight across.
 * "strength" does not: it names five types and picking one at random
 * would make the class look arbitrary to somebody following it.
 *
 * So strength resolves through the arc first (a leg-strength aim gets a
 * leg session) and only then falls to `full`.
 */
const FOCUS_DIRECT = { cardio: "cardio", mobility: "mobility" };
const STRENGTH_TYPES = ["glute", "upper", "lower", "core", "full"];

function validType(id) {
  return SESSION_TYPES.some(t => t.id === id) ? id : null;
}

/**
 * The session types of the last RECENT_WINDOW built sessions, newest
 * first. Entries predating TWO-ENGINE carry no sessionType and are
 * skipped rather than counted as a type -- every existing entry is one
 * of those, so an empty result here is the NORMAL early state.
 */
export function recentSessionTypes(limit = RECENT_WINDOW) {
  const log = store.get("activityLog");
  if (!Array.isArray(log)) return [];
  return log
    .filter(e => e && e.status !== "partial" && validType(e.sessionType))
    .slice(-limit)
    .reverse()
    .map(e => e.sessionType);
}

/** Arc strand types, in the arc's own order. */
export function arcSessionTypes() {
  const arc = store.get("arc");
  if (!arc || !arc.aimId) return [];
  const strands = strandsForAim(arc.aimId);
  if (!strands || !strands.length) return [];
  return sessionTypesForStrands(strands.map(s => (typeof s === "string" ? s : s.id)))
    .filter(validType);
}

/**
 * First candidate not in `recent`. Returns null rather than a fallback,
 * so the caller decides what "nothing left" means -- a helper that
 * silently substituted would make step 2 look like it succeeded when it
 * had not, and `inputs` would then record a consultation that did not
 * happen.
 */
function firstUnused(candidates, recent) {
  for (const c of candidates) if (!recent.includes(c)) return c;
  return null;
}

/**
 * @returns {{ sessionType: string, reason: string, inputs: object }}
 *   `reason` names the step that decided, for the gate and for the
 *   coach line. `inputs` is what was read, and only what was read.
 */
export function chooseSessionType() {
  const inputs = {};
  const recent = recentSessionTypes();
  inputs.recentSessionTypes = recent;

  // ── 1. The class you are in ─────────────────────────────────────────
  const focus = plannedFocusToday();
  inputs.plannedFocus = focus === undefined ? null : focus;

  const arcTypes = arcSessionTypes();
  inputs.arcSessionTypes = arcTypes;

  if (focus) {
    const direct = FOCUS_DIRECT[focus];
    if (direct && validType(direct)) {
      return { sessionType: direct, reason: "programme", inputs };
    }
    // "strength" -- resolve through the arc so a leg-strength aim gets a
    // leg session rather than a coin toss between five.
    const viaArc = arcTypes.find(t => STRENGTH_TYPES.includes(t));
    if (viaArc) return { sessionType: viaArc, reason: "programme-via-arc", inputs };
    return { sessionType: "full", reason: "programme-default", inputs };
  }

  // ── 2. What the arc says is thin ────────────────────────────────────
  if (arcTypes.length) {
    const unused = firstUnused(arcTypes, recent);
    if (unused) return { sessionType: unused, reason: "arc-gap", inputs };
    // Every arc type has come up lately. That is the arc being covered,
    // not the arc failing, so it still leads -- oldest of its types.
    const oldest = arcTypes
      .slice()
      .sort((a, b) => recent.indexOf(b) - recent.indexOf(a))[0];
    if (oldest) return { sessionType: oldest, reason: "arc-rotation", inputs };
  }

  // ── 3. What has not come up lately ──────────────────────────────────
  const allTypes = SESSION_TYPES.map(t => t.id);
  const unusedAny = firstUnused(allTypes, recent);
  if (unusedAny) return { sessionType: unusedAny, reason: "least-recent", inputs };

  // ── 4. Nothing to go on ─────────────────────────────────────────────
  return { sessionType: "full", reason: "default", inputs };
}

/**
 * The keys `inputs` may claim, and what each means when EMPTY rather
 * than absent. The coach line may name a key only when it is present,
 * and may claim it INFORMED the choice only when it is non-empty.
 *
 * Absent  -> not consulted. The coach may not mention it at all.
 * Present but empty -> consulted, nothing there. The coach may say it
 *                      looked, and may not say it found something.
 */
export const INPUT_KEYS = ["recentSessionTypes", "plannedFocus", "arcSessionTypes"];

/** True when `line` names nothing that `inputs` cannot support. */
export function lineIsSupported(line, inputs) {
  const text = String(line || "").toLowerCase();
  if (/\byour (programme|class|course)\b/.test(text) && !inputs.plannedFocus) return false;
  if (/\byour arc\b/.test(text) && !(inputs.arcSessionTypes || []).length) return false;
  if (/\blately\b|\brecently\b/.test(text) && !(inputs.recentSessionTypes || []).length) return false;
  return true;
}
