/**
 * js/safety-gate.js
 * 16 Sep 2026 v2
 *
 * v2 - GATE-TAPER. Every session for the first five acknowledgements of
 *   the current wording, then every 30 days. See TAPER_SESSIONS for why
 *   it is counted in sessions rather than days, and why only
 *   current-version entries count.
 *
 * 15 Sep 2026 v1
 *
 * SAFETY-GATE. The hurt-and-ache guidance, read once before a session
 * and acknowledged deliberately, instead of pinned open to forty screens.
 *
 * ── WHY THIS EXISTS, AND WHY IT IS NOT A REVERSAL ────────────────────
 *
 * CARD-4 (13 Sep, v505) moved HURT_AND_ACHE into `pinned` so it could not
 * vanish from the page where somebody is actually moving. The reasoning
 * is at exercise-card.js and it was right: the cost of repetition is
 * irritation, the cost of absence is injury.
 *
 * What it could not know is how that reads at 06:58 in a gym. Graeme,
 * 15 Sep, on four device screenshots: "Too many of the same things on
 * one screen." On every one of four pages, for every one of ten
 * exercises, the same two paragraphs sat above the thing he opened the
 * page for. Forty renders of identical text in one session.
 *
 * 🔴 GUIDANCE-1 had already written down what happens next, eight days
 * earlier and about a different line: "repetition without occasion
 * trains people to look past it, and the one time it matters it has
 * already become furniture."
 *
 * So CR-5's guarantee is unchanged -- the guidance is available on every
 * exercise, always. What changes is whether it is open by default. It is
 * read properly once, here, and sits collapsed one tap away on every
 * card after that.
 *
 * ── OCCASIONS, NOT EVERY SESSION ─────────────────────────────────────
 *
 * Graeme's steer was "before exercises start", which read literally is
 * every session. It is not built that way, for the reason this codebase
 * already argues against itself with.
 *
 * A gate that fires every session becomes a reflex tap inside a
 * fortnight. That is worse on both counts that matter: the person is no
 * better informed, and the record is a log of two hundred reflexes
 * rather than a handful of considered acknowledgements. A solicitor
 * reading a per-session log sees habituation. A solicitor reading six
 * dated, version-stamped acknowledgements sees notice.
 *
 * GATE_DAYS is deliberately the same number as GUIDANCE_DAYS, so there
 * is ONE answer in this product to "how often do we say the serious
 * thing", not two competing ones.
 *
 * ⚫ If that call is wrong, it is one constant. GATE_DAYS = 0 makes it
 * every session and nothing else in this file changes.
 *
 * ── WHAT THE RECORD IS, AND WHAT IT IS NOT ───────────────────────────
 *
 * 🔴 It is evidence of notice. It is NOT a waiver. Under the Consumer
 * Rights Act 2015 s.65 no term or notice excludes liability for personal
 * injury caused by negligence, so the acknowledged wording is exactly
 * "I have read this" and never "I accept the risk" or "I confirm I am
 * fit to exercise". Those are unenforceable AND they read worse in front
 * of a court, because they evidence an intention to exclude.
 *
 * `textVersion` is the load-bearing field, not `at`. A timestamp alone
 * does not establish what was on the screen.
 *
 * ── AND IT CLOSES A LIVE CR-5 GAP AS A SIDE EFFECT ───────────────────
 *
 * exercise-card.js v7 logged red, not closed: morning-session.js renders
 * a real do-the-exercise card from its own local renderExerciseCard()
 * with NO caution and NO hurt-and-ache at all. prescribed.js has a local
 * renderer too.
 *
 * This gate sits ABOVE the card layer, so it fires for those two views
 * as well. That is why it is mounted by the views rather than built into
 * the card, and it is the strongest single argument for the design. The
 * local-renderer migration is still owed and stays logged red.
 *
 * Gate: tools/verify-card5.mjs.
 */

import { store } from "./store.js";
import { HURT_AND_ACHE, HURT_AND_ACHE_VERSION } from "./exercise-card.js";

/**
 * GUIDANCE-1's line, hoisted here so there is one copy rather than two.
 *
 * It was a local template string in views/today.js. The gate needs the
 * same sentence and a second copy is how eleven stop lines phrased
 * eleven ways happened. today.js imports it from here; the wording,
 * the thirty-day interval and the reasoning are all unchanged.
 *
 * ⚫ It is NOT in the coach's first person. The coach says "I" all over
 * this app; this is the product speaking about its own limits, which is
 * a different voice on purpose. The clinical wording, near enough verbatim.
 */
export const GUIDANCE_TEXT =
  "The advice in this app is general. Before starting any exercise " +
  "programme it is worth seeking guidance from your GP or an exercise " +
  "professional.";

export const GUIDANCE_DAYS = 30;
export const GATE_DAYS = 30;

/**
 * GATE-TAPER, 16 Sep 2026. Every session for the first five, then 30 days.
 *
 * Graeme: "What if we had the before you start message every time for a
 * week, then the 30 days?" Right, and for a reason the text states about
 * itself -- "especially if this is new to you". Risk is front-loaded:
 * unfamiliar movements, and no calibration yet on what normal aching
 * feels like. A cadence that treats week one like month six ignores what
 * the guidance is already saying.
 *
 * The habituation objection that set GATE_DAYS = 30 holds for an
 * INDEFINITE repeat and does not hold for a bounded one. Five exposures
 * then a monthly refresh is a different thing from two hundred.
 *
 * ⚫ COUNTED IN SESSIONS, NOT DAYS, and that is the change to Graeme's
 * proposal. A week is calendar time; exposure is what matters. Someone
 * who trains twice in their first week would get two readings and then
 * drop to monthly -- a thinner floor than someone training daily, and
 * they are the one who is LESS practised, not more. Sessions give
 * everyone the same floor regardless of how often they train.
 *
 * ⚫ A TEXT CHANGE RESTARTS THE TAPER. New wording is new to them, which
 * is the same argument the taper rests on. Implemented by counting only
 * entries at the CURRENT version, so it needs no extra field and cannot
 * drift out of step with the version stamp.
 */
export const TAPER_SESSIONS = 5;

/** Oldest trimmed first. See Schema.md v1.61 -- the log is not complete. */
const ACK_CAP = 200;

function _daysSince(iso) {
  if (!iso) return Infinity;
  const t = new Date(iso).getTime();
  if (!isFinite(t)) return Infinity;
  return (Date.now() - t) / 86400000;
}

function _log() {
  const l = store.get("safetyAckLog");
  return Array.isArray(l) ? l : [];
}

/** GATE-TAPER. Entries at the current wording only -- see TAPER_SESSIONS. */
function _acknowledgedAtCurrentVersion() {
  return _log().filter(e => e && e.textVersion === HURT_AND_ACHE_VERSION).length;
}

function _newest() {
  const l = _log();
  return l.length ? l[l.length - 1] : null;
}

/**
 * Four triggers. Any one of them fires the gate.
 *
 * The programme trigger resolves defensively: if activeProgramme cannot
 * be read it returns false for THAT trigger rather than firing. A gate
 * that appears spuriously is the fastest possible route back to the
 * reflex tap this design exists to avoid.
 */
export function isGateDue() {
  const last = _newest();
  if (!last) return true;
  if (last.textVersion !== HURT_AND_ACHE_VERSION) return true;

  // GATE-TAPER. Only acknowledgements of the CURRENT wording count, so a
  // text change restarts the taper without a second field to keep in
  // step. Below the floor the other triggers are not consulted at all --
  // during the taper the gate fires whatever the calendar says.
  if (_acknowledgedAtCurrentVersion() < TAPER_SESSIONS) return true;

  if (_daysSince(last.at) > GATE_DAYS) return true;

  try {
    const prog = store.get("activeProgramme");
    const id = prog && prog.id ? String(prog.id) : null;
    if (id && last.programmeId && id !== last.programmeId) return true;
  } catch { /* trigger declines, gate does not fire on this one */ }

  return false;
}

/** Separate field, separate trigger. See Schema.md v1.61. */
export function isGuidanceDue() {
  return _daysSince(store.get("guidanceShownAt")) >= GUIDANCE_DAYS;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * The dialog.
 *
 * Nothing here names a condition or gives a timescale for seeking care.
 * That is the same boundary HURT_AND_ACHE already holds for the same
 * reason: naming a condition is a diagnosis, and urgency tiers belong to
 * the red-flag screen, which is not built.
 *
 * A11Y. The submit button is NEVER disabled. A disabled control with no
 * announced reason is a screen-reader dead end and fails 3.3.1; the
 * error is reported on activation instead, focus moves to the checkbox,
 * and the message goes to a live region. The action row is in normal
 * flow, not a fixed bottom bar -- 2.4.11 Focus Not Obscured, which the
 * session views' own fixed bars are exactly the hazard for.
 *
 * There is no timeout. 2.2.1, and also plain decency.
 */
export function renderSafetyGate() {
  const lines = HURT_AND_ACHE
    .map(s => `<li>${esc(s)}</li>`).join("");

  const guidance = isGuidanceDue()
    ? `<p class="gate-guidance" role="note">${esc(GUIDANCE_TEXT)}</p>`
    : "";

  return `
    <div class="safety-gate" role="dialog" aria-modal="true"
         aria-labelledby="gate-h" data-safety-gate>
      <p class="gate-kicker">Before your first exercise</p>
      <h2 class="gate-title" id="gate-h" tabindex="-1">Before you start</h2>

      <div class="gate-block gate-block--hazard">
        <p class="gate-block-label">If it hurts</p>
        <ul class="gate-lines">${lines}</ul>
      </div>

      ${guidance}

      <label class="gate-ack" for="gate-ack-box">
        <input type="checkbox" id="gate-ack-box" data-gate-ack>
        <span>I have read this.</span>
      </label>

      <p class="gate-error" data-gate-error role="status" aria-live="assertive"></p>

      <button type="button" class="btn-primary gate-start" data-gate-start>
        Start the session
      </button>
      <button type="button" class="btn-quiet gate-leave" data-gate-leave>
        Not now
      </button>
    </div>`;
}

/**
 * Write first, navigate second.
 *
 * If the write throws -- quota, private mode, anything -- the session
 * STILL starts. A storage failure must never stand between somebody and
 * their session. But it is reported, because a silently empty log is the
 * one failure mode that makes this entire feature worthless, and it
 * would look identical to nobody ever having acknowledged anything.
 */
export function recordAcknowledgement(surface) {
  const entry = {
    at: new Date().toISOString(),
    textVersion: HURT_AND_ACHE_VERSION,
    surface: String(surface || "unknown")
  };

  try {
    const prog = store.get("activeProgramme");
    if (prog && prog.id) entry.programmeId = String(prog.id);
  } catch { /* optional */ }

  try {
    const next = _log().concat([entry]);
    while (next.length > ACK_CAP) next.shift();
    store.set("safetyAckLog", next);
  } catch (e) {
    try {
      if (typeof window !== "undefined" && window.Sentry) {
        window.Sentry.captureException(e, {
          tags: { feature: "safety-gate", surface: entry.surface }
        });
      }
    } catch { /* reporting must not throw either */ }
  }

  return entry;
}

/**
 * Focus lands on the heading, not the checkbox. The heading is where the
 * reading starts, and dropping somebody straight onto the control skips
 * the thing they are acknowledging.
 *
 * Escape activates "Not now" rather than dismissing silently. Two
 * documented exits, so 2.1.2 is satisfied without the dialog being
 * escapable in a way that looks like assent.
 */
export function attachSafetyGate(root, opts) {
  opts = opts || {};
  const el = root && root.querySelector("[data-safety-gate]");
  if (!el) return;

  const box   = el.querySelector("[data-gate-ack]");
  const err   = el.querySelector("[data-gate-error]");
  const start = el.querySelector("[data-gate-start]");
  const leave = el.querySelector("[data-gate-leave]");
  const head  = el.querySelector("#gate-h");

  if (head && typeof head.focus === "function") {
    try { head.focus(); } catch { /* non-fatal */ }
  }

  if (el.querySelector(".gate-guidance")) {
    try { store.set("guidanceShownAt", new Date().toISOString()); } catch { /* non-fatal */ }
  }

  function clearError() { if (err) err.textContent = ""; }

  if (box) box.addEventListener("change", clearError);

  if (start) {
    start.addEventListener("click", function () {
      if (!box || !box.checked) {
        if (err) err.textContent = "Confirm you have read this before starting.";
        if (box && typeof box.focus === "function") box.focus();
        return;
      }
      clearError();
      recordAcknowledgement(opts.surface);
      if (typeof opts.onAcknowledge === "function") opts.onAcknowledge();
    });
  }

  function doLeave() {
    if (typeof opts.onLeave === "function") opts.onLeave();
  }

  if (leave) leave.addEventListener("click", doLeave);

  el.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); doLeave(); }
  });
}
