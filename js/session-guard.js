/**
 * js/session-guard.js - Session Back Gesture Guard
 *
 * 21 Jul 2026 v2
 *
 * CHANGELOG
 * 21 Jul 2026 v2 — Added isGuardActive() and requestExit(), exported for
 *                  external callers (specifically the new persistent nav
 *                  escape-hatch icon, app.js v7) that need to leave a
 *                  hidden-nav screen. requestExit() reuses the exact same
 *                  _showCard()/_onExit contract the back-gesture guard
 *                  already uses, so behaviour is identical regardless of
 *                  which exit path the user takes. If no session is
 *                  actively running (guard not mounted, or isActive()
 *                  false), navigates straight to Today — nothing to
 *                  protect. No changes to existing back-gesture or
 *                  showExitCard() behaviour.
 * 21 May 2026 v1 — Added third exit option: "Exit without saving".
 *                  Cleans up currentActivityEntry from store without
 *                  writing to activityLog. No reflect screen. Clean exit.
 *                  WCAG: all three options meet 44px minimum touch target.
 * 20 May 2026 v1 — Initial implementation. mountSessionGuard(),
 *                  dismountSessionGuard(). Shared across all 7 session views.
 *                  role=dialog, aria-modal=true, focus management, Escape key.
 *
 * USAGE (in any session view)
 *
 *   import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
 *
 *   // In onMount():
 *   mountSessionGuard({
 *     isActive: () => phase === "session" || phase === "rest",
 *     onExit:   saveAndExit,   // called when user chooses "Exit and save progress"
 *     label:    "gym session", // used in coach copy
 *   });
 *
 *   // In resetSession():
 *   dismountSessionGuard();
 *
 * The onExit callback is responsible for writing a partial activityLog
 * entry and then navigating to reflect.js. session-guard.js does not
 * navigate — it hands control back to the session view.
 *
 * IMPORTANT — onExit contract (flagged 21 Jul 2026): onExit MUST write
 * the partial activityLog entry before navigating. yoga-session.js v3's
 * onExit did not do this (fixed in yoga-session.js v4, same session).
 * Any other session view wiring mountSessionGuard() should be checked
 * against this same contract — not yet verified across all 11 session
 * view files.
 */

import { store }  from "./store.js";
import { router } from "./router.js";

// ── Internal state ─────────────────────────────────────────────────────────────

let _isActive      = null;  // () => boolean — true when session is in progress
let _onExit        = null;  // () => void    — called on "Exit and save progress"
let _label         = "";    // human-readable session label for ARIA
let _popHandler    = null;  // reference to the popstate listener for cleanup
let _keyHandler    = null;  // reference to the keydown listener for cleanup
let _guardActive   = false; // prevents double-mounting

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Mount the session guard. Call in onMount() of the session view.
 *
 * @param {object} opts
 * @param {function} opts.isActive - Returns true when session is running
 * @param {function} opts.onExit   - Called when user chooses "Exit and save progress"
 * @param {string}  [opts.label]  - Human label for ARIA e.g. "gym session"
 */
export function mountSessionGuard({ isActive, onExit, label = "session" }) {
  if (_guardActive) dismountSessionGuard();

  _isActive    = isActive;
  _onExit      = onExit;
  _label       = label;
  _guardActive = true;

  // Push a history entry so we have something to intercept.
  // The router already pushed one when navigating here.
  // We push a second so popstate fires once before leaving the session.
  history.pushState({ sessionGuard: true }, "");

  _popHandler = (e) => {
    if (!_isActive || !_isActive()) return; // session not running — let it pass
    // Re-push so the guard stays in place until user makes a choice
    history.pushState({ sessionGuard: true }, "");
    _showCard();
  };

  _keyHandler = (e) => {
    if (e.key === "Escape") _hideCard();
  };

  window.addEventListener("popstate",  _popHandler);
  window.addEventListener("keydown",   _keyHandler);
}

/**
 * Dismount the session guard. Call in resetSession() of the session view.
 * Also call when session completes normally (no guard needed after finish).
 */
export function dismountSessionGuard() {
  if (_popHandler) window.removeEventListener("popstate",  _popHandler);
  if (_keyHandler) window.removeEventListener("keydown",   _keyHandler);
  _hideCard();
  _isActive    = null;
  _onExit      = null;
  _label       = "";
  _popHandler  = null;
  _keyHandler  = null;
  _guardActive = false;
}

/**
 * Returns true only when a session view has the guard mounted AND
 * currently reports itself as mid-session (isActive() true). Used by
 * external callers — e.g. the persistent Home icon — to decide whether
 * a confirmation is needed before leaving.
 */
export function isGuardActive() {
  return _guardActive && typeof _isActive === "function" && !!_isActive();
}

/**
 * External exit request. Call from any UI element outside the session
 * view itself — currently: the persistent nav escape-hatch icon
 * (app.js v7) — that wants to leave the current screen.
 *
 * If a session is actively running, shows the exact same confirmation
 * card the back-gesture guard shows, and reuses the same per-view
 * onExit callback — so behaviour is identical to the existing Exit
 * button and back-gesture, whichever session type is active.
 *
 * If no session is running (guard not mounted, or mounted but not
 * mid-session — e.g. still on a focus/duration picker screen), there is
 * nothing to protect: navigates straight to Today.
 */
export function requestExit() {
  if (isGuardActive()) {
    _showCard();
  } else {
    router.navigate("today");
  }
}

// ── Card rendering ─────────────────────────────────────────────────────────────

function _showCard() {
  if (document.getElementById("session-guard-card")) return; // already shown

  // Backdrop
  const backdrop = document.createElement("div");
  backdrop.id = "session-guard-backdrop";
  backdrop.className = "sg-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.addEventListener("click", _hideCard);

  // Card
  const card = document.createElement("div");
  card.id = "session-guard-card";
  card.className = "sg-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-label", `Leave ${_label}?`);
  card.setAttribute("aria-describedby", "sg-coach-text");

  card.innerHTML = `
    <div class="sg-coach-row">
      <img
        src="assets/images/logo-icon-128.png"
        alt=""
        class="sg-coach-icon"
        aria-hidden="true"
        width="36"
        height="36"
      >
      <p id="sg-coach-text" class="sg-coach-text">
        Hold on &mdash; if you leave now this session won&rsquo;t be saved. Are you sure?
      </p>
    </div>
    <button id="sg-stay-btn" class="btn btn-primary btn-large btn-full sg-btn">
      Stay in session
    </button>
    <button id="sg-exit-save-btn" class="btn btn-ghost btn-large btn-full sg-btn sg-exit-save">
      Exit and save progress
    </button>
    <button id="sg-exit-discard-btn" class="btn btn-ghost btn-large btn-full sg-btn sg-exit-discard">
      Exit without saving
    </button>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(card);

  // Wire buttons
  document.getElementById("sg-stay-btn").addEventListener("click", _hideCard);
  document.getElementById("sg-exit-save-btn").addEventListener("click", _handleExitSave);
  document.getElementById("sg-exit-discard-btn").addEventListener("click", _handleExitDiscard);

  // Move focus to Stay button (keeps user in session by default)
  requestAnimationFrame(() => {
    const stayBtn = document.getElementById("sg-stay-btn");
    if (stayBtn) stayBtn.focus();
  });
}

function _hideCard() {
  const backdrop = document.getElementById("session-guard-backdrop");
  const card     = document.getElementById("session-guard-card");
  if (backdrop) backdrop.remove();
  if (card)     card.remove();
  // Re-arm the guard: push a fresh history entry so the next
  // back gesture is intercepted again. Without this, "Stay"
  // consumes the guard entry and the next gesture falls through.
  if (_guardActive) {
    history.pushState({ sessionGuard: true }, "");
  }
}

function _handleExitSave() {
  _hideCard();
  dismountSessionGuard();
  // onExit is responsible for writing partial activityLog entry + navigating to reflect
  if (_onExit) _onExit();
}

function _handleExitDiscard() {
  _hideCard();
  dismountSessionGuard();

  // Discard: remove currentActivityEntry from store without writing to activityLog.
  // The entry was written to activityLog optimistically when the session started
  // (in intention.js). We need to remove it.
  const log   = store.get("activityLog") || [];
  const entry = store.get("currentActivityEntry");

  if (entry && log.length > 0) {
    // Remove the entry if it has no completedAt (i.e. session was never finished)
    const cleaned = log.filter(e => !(e.id === entry.id && !e.completedAt));
    store.set("activityLog", cleaned);
  }

  store.set("currentActivityEntry", null);

  // Navigate back to today without triggering reflect
  router.navigate("today");
}

// ── showExitCard — shared function for tap-based exit buttons ─────────────────
//
// Call this from any session view's "Exit" or "Back" button tap handler
// INSTEAD of confirm() or a custom inline card.
//
// Usage:
//   import { showExitCard } from "../session-guard.js";
//
//   document.getElementById("ps-exit-btn")?.addEventListener("click", () => {
//     showExitCard({
//       onSave:    () => { savePartial(); router.navigate("reflect"); },
//       onDiscard: () => { cleanupSession(); router.navigate("today"); },
//     });
//   });
//
// @param {object} opts
// @param {function} opts.onSave    - Called on "Exit and save progress"
// @param {function} opts.onDiscard - Called on "Exit without saving"
// @param {string} [opts.label]     - Optional label override for ARIA

export function showExitCard({ onSave, onDiscard, label = "session" }) {
  // If the gesture guard's card is already visible, don't double-show
  if (document.getElementById("session-guard-card")) return;

  const backdrop = document.createElement("div");
  backdrop.id = "session-guard-backdrop";
  backdrop.className = "sg-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const card = document.createElement("div");
  card.id = "session-guard-card";
  card.className = "sg-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-label", `Leave ${label}?`);
  card.setAttribute("aria-describedby", "sg-coach-text");

  card.innerHTML = `
    <div class="sg-coach-row">
      <img
        src="assets/images/logo-icon-128.png"
        alt=""
        class="sg-coach-icon"
        aria-hidden="true"
        width="36"
        height="36"
      >
      <p id="sg-coach-text" class="sg-coach-text">
        Hold on &mdash; if you leave now this session won&rsquo;t be saved. Are you sure?
      </p>
    </div>
    <button id="sg-stay-btn" class="btn btn-primary btn-large btn-full sg-btn">
      Stay in session
    </button>
    <button id="sg-exit-save-btn" class="btn btn-ghost btn-large btn-full sg-btn sg-exit-save">
      Exit and save progress
    </button>
    <button id="sg-exit-discard-btn" class="btn btn-ghost btn-large btn-full sg-btn sg-exit-discard">
      Exit without saving
    </button>
  `;

  function dismiss() {
    backdrop.remove();
    card.remove();
  }

  backdrop.addEventListener("click", dismiss);

  document.getElementById && (() => {})(); // flush before appending
  document.body.appendChild(backdrop);
  document.body.appendChild(card);

  card.querySelector("#sg-stay-btn").addEventListener("click", dismiss);

  card.querySelector("#sg-exit-save-btn").addEventListener("click", () => {
    dismiss();
    if (onSave) onSave();
  });

  card.querySelector("#sg-exit-discard-btn").addEventListener("click", () => {
    dismiss();
    // Clean up ghost activityLog entry
    const log   = store.get("activityLog") || [];
    const entry = store.get("currentActivityEntry");
    if (entry) {
      const cleaned = log.filter(e => !(e.id === entry.id && !e.completedAt));
      store.set("activityLog", cleaned);
      store.set("currentActivityEntry", null);
    }
    if (onDiscard) onDiscard();
  });

  // Escape key dismisses
  function onKey(e) {
    if (e.key === "Escape") { dismiss(); document.removeEventListener("keydown", onKey); }
  }
  document.addEventListener("keydown", onKey);

  // Focus Stay button
  requestAnimationFrame(() => card.querySelector("#sg-stay-btn")?.focus());
}

// ── rearmGuard — call after every rerender() inside a session view ────────────
//
// Each rerender() replaces the DOM and re-calls onMount(), which re-calls
// mountSessionGuard(). But if the guard is already active, mountSessionGuard()
// calls dismountSessionGuard() first, resetting the history stack to one entry.
// Call rearmGuard() at the END of every rerender() to keep the stack topped up.
//
// Usage: import { rearmGuard } from "../session-guard.js";
//        Call at the end of every rerender() function in session views.

export function rearmGuard() {
  if (_guardActive) {
    history.pushState({ sessionGuard: true }, "");
  }
}
