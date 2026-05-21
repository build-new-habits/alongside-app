/**
 * session-guard.js - Back gesture confirmation for active sessions
 *
 * 20 May 2026 v1
 *
 * Intercepts the device back gesture (iOS swipe left, Android back button)
 * during active workout sessions. Without this, the user loses session
 * progress silently when they accidentally trigger back.
 *
 * Usage  add one call at the top of onMount() in any session view:
 *
 *   import { mountSessionGuard, dismountSessionGuard } from "../session-guard.js";
 *
 *   export function onMount() {
 *     mountSessionGuard({
 *       isActive: () => !postSessionState,   // true while session is running
 *       onExit:   savePartialAndNavigate,    // called when user confirms exit
 *       label:    "gym session"              // used in coach message
 *     });
 *     // ... rest of onMount
 *   }
 *
 *   // In your cleanup() function:
 *   dismountSessionGuard();
 *
 * How it works:
 *   1. mountSessionGuard() adds a popstate listener.
 *   2. When back is pressed and isActive() is true, it pushes a replacement
 *      history entry (preventing navigation) and shows the confirmation card.
 *   3. "Stay in session" removes the card. Session continues.
 *   4. "Exit and save progress" calls onExit(), which the session file
 *      provides  typically writes a partial activityLog entry then navigates
 *      to reflect.js or intention.
 *   5. If isActive() is false (post-session screens) back proceeds normally.
 *
 * WCAG 2.2 AA:
 *   - Dialog has role="dialog", aria-modal="true", aria-label
 *   - Focus moves to the Stay button on open
 *   - Both buttons are minimum 44px touch target
 *   - Dismissed with either button or Escape key
 */

let _guardHandler  = null;
let _keyHandler    = null;
let _guardOptions  = null;

/**
 * Mount the back gesture guard on a session view.
 *
 * @param {object} options
 * @param {function} options.isActive  - returns true while session is running
 * @param {function} options.onExit    - called when user confirms exit
 * @param {string}   options.label     - human label for coach message e.g. "gym session"
 */
export function mountSessionGuard({ isActive, onExit, label = "session" }) {
  // Clean up any previous guard
  dismountSessionGuard();

  _guardOptions = { isActive, onExit, label };

  _guardHandler = (e) => {
    if (!_guardOptions) return;
    if (!_guardOptions.isActive()) return; // Post-session  allow back normally

    // Prevent navigation by pushing a replacement entry
    history.pushState({ view: "session-guard" }, "", window.location.href);

    // Show confirmation card
    _showGuardCard(_guardOptions.label, _guardOptions.onExit);
  };

  window.addEventListener("popstate", _guardHandler);

  // Escape key dismisses if card is open
  _keyHandler = (e) => {
    if (e.key === "Escape") _dismissGuardCard();
  };
  window.addEventListener("keydown", _keyHandler);
}

/**
 * Dismount  call in session cleanup() to prevent stale listeners.
 */
export function dismountSessionGuard() {
  if (_guardHandler) {
    window.removeEventListener("popstate", _guardHandler);
    _guardHandler = null;
  }
  if (_keyHandler) {
    window.removeEventListener("keydown", _keyHandler);
    _keyHandler = null;
  }
  _guardOptions = null;
  _dismissGuardCard();
}

//  Card rendering 

function _showGuardCard(label, onExit) {
  // Only one card at a time
  if (document.getElementById("session-guard-card")) return;

  const card = document.createElement("div");
  card.id = "session-guard-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-label", "Leave session confirmation");
  card.innerHTML = `
    <div class="session-guard-backdrop" id="session-guard-backdrop"></div>
    <div class="session-guard-dialog">
      <div class="card card-coach session-guard-coach-card">
        <p class="session-guard-message">
          Hold on -- if you leave now, this ${label} won't be saved. Are you sure?
        </p>
      </div>
      <div class="session-guard-actions">
        <button class="btn btn-primary btn-full session-guard-stay"
                id="session-guard-stay"
                aria-label="Stay in session">
          Stay in session
        </button>
        <button class="btn btn-ghost btn-full session-guard-exit"
                id="session-guard-exit"
                style="margin-top: var(--space-3);"
                aria-label="Exit and save progress so far">
          Exit and save progress
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(card);

  // Focus the Stay button  safest default for accessibility
  setTimeout(() => {
    document.getElementById("session-guard-stay")?.focus();
  }, 50);

  document.getElementById("session-guard-stay")?.addEventListener("click", () => {
    _dismissGuardCard();
  });

  document.getElementById("session-guard-exit")?.addEventListener("click", () => {
    _dismissGuardCard();
    dismountSessionGuard();
    if (typeof onExit === "function") onExit();
  });

  document.getElementById("session-guard-backdrop")?.addEventListener("click", () => {
    _dismissGuardCard();
  });
}

function _dismissGuardCard() {
  const card = document.getElementById("session-guard-card");
  if (card) card.remove();
}
