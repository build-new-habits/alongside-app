/**
 * app.js - Application entry point
 *
 * v1.2 — Service worker update detection (S3-6):
 *   When a new service worker is found (i.e. a new version has been deployed
 *   to GitHub), the app shows a non-intrusive update banner at the top of
 *   the screen. The user taps "Update now" to reload and get the new version.
 *
 *   Why we tell the user:
 *   Alongside is a PWA. Unlike the App Store, users do not see a version
 *   history or release notes. Without this banner, they would never know
 *   new features had arrived. The banner is honest about what is happening
 *   and gives the user control over when to reload.
 *
 *   The banner is dismissible. If the user is mid-session we do not force
 *   anything. The update applies automatically on their next app open anyway
 *   because skipWaiting() is called in sw.js.
 *
 *   Manual check: window.App.checkForUpdate() is exposed globally so the
 *   Settings "Check for updates" button can trigger it on demand.
 *
 * v1.1 — SW registration added (Phase 3)
 */

import { store } from './store.js';
import { router } from './router.js';

// ── App version string ────────────────────────────────────────────────────────
// Update this string with each deployment so the Settings screen can display it.
// Format: YYYY-MM-DD or a short human label.
const APP_VERSION = "11 Apr 2026";

// ── SW registration and update detection ──────────────────────────────────────

let _swRegistration = null;

/**
 * Register the service worker and wire up update detection.
 *
 * Update flow:
 *   1. Browser finds a new sw.js on GitHub (CACHE_NAME has changed).
 *   2. "updatefound" fires on the registration object.
 *   3. The new SW enters "installing" state.
 *   4. When it reaches "installed" (waiting to activate), we show the banner.
 *   5. User taps "Update now" -> we post "SKIP_WAITING" to the SW.
 *   6. SW calls skipWaiting(), activates, claims all clients.
 *   7. We reload the page -> user is now on the new version.
 *
 * If the user dismisses the banner, the update still applies on next open
 * because sw.js calls skipWaiting() on install regardless.
 */
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register("/alongside-app/sw.js", {
      scope: "/alongside-app/"
    });

    _swRegistration = reg;
    console.log("SW registered, scope:", reg.scope);

    // ── Detect updates on this page load ─────────────────────────────────────
    // "updatefound" fires when the browser finds a new SW version.
    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        // "installed" + an existing active SW = update waiting to activate
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateBanner();
        }
      });
    });

    // ── Detect if we just reloaded after an update ────────────────────────────
    // If the SW controller changed (new SW took over), the page will have
    // reloaded. Nothing needed here — the new code is already running.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // SW took over — safe to reload to pick up new cached files
      window.location.reload();
    });

  } catch (err) {
    console.error("SW registration failed:", err);
  }
}

/**
 * Manually trigger a SW update check.
 * Called by the Settings "Check for updates" button.
 * Also exposed as window.App.checkForUpdate() for debugging.
 *
 * @returns {Promise<"updated"|"current"|"unavailable">}
 */
async function checkForUpdate() {
  if (!("serviceWorker" in navigator)) return "unavailable";

  try {
    // Use the stored registration first.
    // Fall back to getRegistration() with no argument — matches the current page scope.
    // Do NOT use a hardcoded path like "/alongside-app/" — this fails on installed PWA
    // on mobile where the scope resolution differs from desktop browser context.
    let reg = _swRegistration;

    if (!reg) {
      reg = await navigator.serviceWorker.getRegistration();
    }

    if (!reg) {
      // Last resort: grab any registration for this origin
      const regs = await navigator.serviceWorker.getRegistrations();
      reg = regs?.[0] || null;
    }

    if (!reg) return "unavailable";

    await reg.update();

    // After update(), if a new SW is waiting, show the banner
    if (reg.waiting) {
      showUpdateBanner();
      return "updated";
    }

    return "current";
  } catch (err) {
    console.error("SW update check failed:", err);
    return "unavailable";
  }
}

/**
 * Tell the waiting service worker to activate immediately.
 * Called when the user taps "Update now" in the banner.
 */
function applyUpdate() {
  const reg = _swRegistration;
  if (reg?.waiting) {
    // Post message to SW — sw.js listens for this and calls skipWaiting()
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
  } else {
    // No waiting SW — just reload to pick up cached changes
    window.location.reload();
  }
}

// ── Update banner ─────────────────────────────────────────────────────────────

/**
 * Show a non-intrusive update banner at the top of the app.
 *
 * Design intent:
 *   - Informative, not alarming. The user is not doing anything wrong.
 *   - Gives the user control. "Update now" or dismiss.
 *   - Accessible: role="alert" so screen readers announce it immediately.
 *   - Does not interrupt mid-session. The banner floats above content.
 *
 * The banner inserts itself above #main-content and removes itself on
 * dismiss or after applying the update.
 */
function showUpdateBanner() {
  // Only show once
  if (document.getElementById("update-banner")) return;

  const banner = document.createElement("div");
  banner.id        = "update-banner";
  banner.className = "update-banner";
  banner.setAttribute("role", "alert");
  banner.setAttribute("aria-live", "polite");

  banner.innerHTML = `
    <div class="update-banner-content">
      <span class="update-banner-icon" aria-hidden="true">&#10024;</span>
      <p class="update-banner-text">
        A new version of Alongside is ready. Update to get the latest features.
      </p>
    </div>
    <div class="update-banner-actions">
      <button class="btn btn-primary btn-small" id="update-apply-btn">
        Update now
      </button>
      <button class="btn btn-ghost btn-small" id="update-dismiss-btn"
              aria-label="Dismiss update notification">
        Later
      </button>
    </div>
  `;

  // Insert before main content
  const app = document.getElementById("app");
  const main = document.getElementById("main-content");
  if (app && main) {
    app.insertBefore(banner, main);
  } else {
    document.body.insertBefore(banner, document.body.firstChild);
  }

  document.getElementById("update-apply-btn")?.addEventListener("click", () => {
    banner.remove();
    applyUpdate();
  });

  document.getElementById("update-dismiss-btn")?.addEventListener("click", () => {
    banner.remove();
  });
}

/**
 * Show the result of a manual update check in the Settings view.
 * Called by the Settings button after checkForUpdate() resolves.
 *
 * @param {"updated"|"current"|"unavailable"} result
 */
function showUpdateCheckResult(result) {
  const statusEl = document.getElementById("update-check-status");
  if (!statusEl) return;

  const messages = {
    updated:     "A new version is ready. Tap \"Update now\" in the banner above.",
    current:     "You are on the latest version.",
    unavailable: "Could not check for updates. Try closing and reopening the app, then check again."
  };

  statusEl.textContent = messages[result] || "";
  statusEl.className   = "update-check-status update-check-status--" + result;
}

// ── App ───────────────────────────────────────────────────────────────────────

const App = {
  store,
  router,
  version: APP_VERSION,

  init() {
    console.log("Alongside starting...");
    store.init();
    router.init();
    registerServiceWorker();
    console.log("Alongside ready");
  },

  // Exposed globally for Settings button and debugging
  checkForUpdate,
  showUpdateCheckResult,
  applyUpdate,
  showUpdateBanner
};

// Make App available globally
window.App = App;

// Start when DOM is ready
document.addEventListener("DOMContentLoaded", () => App.init());
