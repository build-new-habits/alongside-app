/**
 * app.js - Application entry point
 *
 * 24 Jun 2026 v4
 *
 * v4 — Nav visibility fix. Nav bar now shown based on first view mounted,
 *   not on onboardingComplete flag. This fixes existing users whose
 *   onboardingComplete was false after the v6 store schema migration.
 *   Also: firstView logic simplified — routes to 'today' if onboarded OR
 *   if store has a name (existing user), 'welcome' only for genuinely new
 *   installs with no data at all.
 *
 * v3 — 24 Jun 2026. router.navigate() called explicitly after router.init()
 *   to mount first view and dismiss loading screen.
 *
 * v2 — 15 Jun 2026. APP_VERSION bumped (S4-9/10).
 *
 * v1.3 — Version string format updated (20 May 2026).
 *
 * v1.2 — Service worker update detection (S3-6).
 *
 * v1.1 — SW registration added (Phase 3).
 */

import { store } from './store.js';
import { router } from './router.js';

// App version string — update on every deploy
const APP_VERSION = "24 Jun 2026 v4";

// Views that show the nav bar
const NAV_VIEWS = new Set([
  'today', 'progress', 'noticing', 'settings', 'weekly-plan',
  'activity-log', 'library', 'upgrade', 'about', 'privacy',
  'goal-setup', 'community-impact', 'annual-reflection',
]);

// SW registration and update detection

let _swRegistration = null;

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register("/alongside-app/sw.js", {
      scope: "/alongside-app/"
    });

    _swRegistration = reg;
    console.log("SW registered, scope:", reg.scope);

    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateBanner();
        }
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });

  } catch (err) {
    console.error("SW registration failed:", err);
  }
}

async function checkForUpdate() {
  if (!("serviceWorker" in navigator)) return "unavailable";

  try {
    let reg = _swRegistration;
    if (!reg) reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      const regs = await navigator.serviceWorker.getRegistrations();
      reg = regs?.[0] || null;
    }
    if (!reg) return "unavailable";

    await reg.update();
    if (reg.waiting) { showUpdateBanner(); return "updated"; }
    return "current";
  } catch (err) {
    console.error("SW update check failed:", err);
    return "unavailable";
  }
}

function applyUpdate() {
  const reg = _swRegistration;
  if (reg?.waiting) {
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
  } else {
    window.location.reload();
  }
}

// Update banner

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

function showUpdateCheckResult(result) {
  const statusEl = document.getElementById("update-check-status");
  if (!statusEl) return;

  const messages = {
    updated:     "A new version is ready. Tap \"Update now\" in the banner above.",
    current:     "You are on the latest version.",
    unavailable: "Could not check for updates. Try closing and reopening the app."
  };

  statusEl.textContent = messages[result] || "";
  statusEl.className   = "update-check-status update-check-status--" + result;
}

// App

const App = {
  store,
  router,
  version: APP_VERSION,

  async init() {
    console.log("Alongside starting...");
    store.init();
    router.init();
    registerServiceWorker();
    console.log("Alongside ready");

    // Determine first view.
    // An existing user is anyone with a name in the store — they go to today
    // regardless of onboardingComplete flag (handles schema migration edge case).
    // A genuinely new install (no name, no onboardingComplete) goes to welcome.
    const isOnboarded   = store.get('onboardingComplete') === true;
    const hasName       = !!(store.get('name'));
    const isExistingUser = isOnboarded || hasName;
    const firstView     = isExistingUser ? 'today' : 'welcome';

    await router.navigate(firstView);

    // Dismiss loading screen
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';

    // Show nav bar — based on view being mounted, not onboarding flag
    const nav = document.getElementById('bottom-nav');
    if (nav && NAV_VIEWS.has(firstView)) {
      nav.classList.remove('hidden');
    }
  },

  checkForUpdate,
  showUpdateCheckResult,
  applyUpdate,
  showUpdateBanner
};

window.App = App;

document.addEventListener("DOMContentLoaded", () => App.init());
