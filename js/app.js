/**
 * app.js - Application entry point
 *
 * 15 Jun 2026 v2
 *
 * v2  APP_VERSION bumped (S4-9/10). The header comment says this must be
 *   updated on every deploy; it had stayed at "20 May 2026 v1" through
 *   roughly ten deploys since (sw.js cache alongside-v94 through v104).
 *   No other changes -- bumping now so Settings' build string is
 *   meaningful again going forward. Future sessions: bump this string
 *   alongside the sw.js cache version whenever any file changes.
 *
 * v1.3  Version string format updated (20 May 2026):
 *   APP_VERSION now uses the same DD Mon YYYY vN format as all other files.
 *   Must be updated on every deploy. Settings displays this string so users
 *   and testers can confirm which build they are running.
 *
 * v1.2  Service worker update detection (S3-6):
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
 * v1.1  SW registration added (Phase 3)
 */

import { store } from './store.js';
import { router } from './router.js';

//  App version string 
// MUST be updated on every deploy.
// Format: DD Mon YYYY vN  (e.g. "20 May 2026 v1", "20 May 2026 v2")
// This string is displayed in Settings so users and testers can confirm
// exactly which build they are running.
const APP_VERSION = "15 Jun 2026 v2";

//  SW registration and update detection 

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

    //  Detect updates on this page load 
    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateBanner();
        }
      });
    });

    //  Detect if we just reloaded after an update 
    navigator.serviceWorker.addEventListener("controllerchange", () => {
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
    let reg = _swRegistration;

    if (!reg) {
      reg = await navigator.serviceWorker.getRegistration();
    }

    if (!reg) {
      const regs = await navigator.serviceWorker.getRegistrations();
      reg = regs?.[0] || null;
    }

    if (!reg) return "unavailable";

    await reg.update();

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
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
  } else {
    window.location.reload();
  }
}

//  Update banner 

/**
 * Show a non-intrusive update banner at the top of the app.
 *
 * Design intent:
 *   - Informative, not alarming.
 *   - Gives the user control. "Update now" or dismiss.
 *   - Accessible: role="alert" so screen readers announce it immediately.
 *   - Does not interrupt mid-session. The banner floats above content.
 */
function showUpdateBanner() {
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

  const app  = document.getElementById("app");
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

//  App 

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

  checkForUpdate,
  showUpdateCheckResult,
  applyUpdate,
  showUpdateBanner
};

window.App = App;

document.addEventListener("DOMContentLoaded", () => App.init());
