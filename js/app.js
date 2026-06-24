/**
 * app.js - Application entry point
 *
 * 24 Jun 2026 v5
 *
 * v5 — Critical fix: window.router exposed globally.
 *   All existing views (welcome.js, intention.js, checkin.js, coach-proposal.js
 *   and every other view built before Phase 5) call router.navigate() as a
 *   bare global — they do not import router. The old app.js exposed it via
 *   window.router. v3 and v4 removed this, breaking every existing view.
 *   Restored: window.router = router (line near bottom of init).
 *   Also: window.store exposed for parity — some views call store.get() directly.
 *
 * v4 — Nav visibility fix. Nav bar shown based on view mounted, not onboarding flag.
 * v3 — Explicit first navigate + loading screen dismiss.
 * v2 — 15 Jun 2026. APP_VERSION bumped.
 * v1 — Initial.
 */

import { store } from './store.js';
import { router } from './router.js';

const APP_VERSION = "24 Jun 2026 v5";

const NAV_VIEWS = new Set([
  'today', 'progress', 'noticing', 'settings', 'weekly-plan',
  'activity-log', 'library', 'upgrade', 'about', 'privacy',
  'goal-setup', 'community-impact', 'annual-reflection',
]);

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
      <p class="update-banner-text">A new version of Alongside is ready.</p>
    </div>
    <div class="update-banner-actions">
      <button class="btn btn-primary btn-small" id="update-apply-btn">Update now</button>
      <button class="btn btn-ghost btn-small" id="update-dismiss-btn" aria-label="Dismiss">Later</button>
    </div>
  `;
  const app  = document.getElementById("app");
  const main = document.getElementById("main-content");
  if (app && main) app.insertBefore(banner, main);
  else document.body.insertBefore(banner, document.body.firstChild);
  document.getElementById("update-apply-btn")?.addEventListener("click", () => { banner.remove(); applyUpdate(); });
  document.getElementById("update-dismiss-btn")?.addEventListener("click", () => banner.remove());
}

function showUpdateCheckResult(result) {
  const statusEl = document.getElementById("update-check-status");
  if (!statusEl) return;
  const messages = {
    updated:     'A new version is ready. Tap "Update now" in the banner above.',
    current:     "You are on the latest version.",
    unavailable: "Could not check for updates. Try closing and reopening the app."
  };
  statusEl.textContent = messages[result] || "";
  statusEl.className   = "update-check-status update-check-status--" + result;
}

const App = {
  store,
  router,
  version: APP_VERSION,

  async init() {
    console.log("Alongside starting...");
    store.init();
    router.init();

    // ── Expose globals that existing views depend on ──────────────────────────
    // Every view built before Phase 5 calls router.navigate() and store.get()
    // as bare globals. These must be on window before any view mounts.
    window.router = router;
    window.store  = store;

    registerServiceWorker();
    console.log("Alongside ready");

    const isOnboarded    = store.get('onboardingComplete') === true;
    const hasName        = !!(store.get('name'));
    const isExistingUser = isOnboarded || hasName;
    const firstView      = isExistingUser ? 'today' : 'welcome';

    await router.navigate(firstView);

    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';

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
