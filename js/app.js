/**
 * app.js - Application entry point
 * 03 Aug 2026 v8
 *
 * v8 — Tier-gating build (S4-TG, 9 May scope, implemented 03 Aug). New
 *   import initPaywallListener from auth.js, called once in init() —
 *   wires the single delegated click/keyboard listener every
 *   .locked-feature-wrap on the page needs. No other changes.
 *
 * v7 — Nav escape-hatch (navfix-proposalloop session). Imports
 *   requestExit from session-guard.js and wires it to the persistent
 *   #hidden-nav-home-btn icon (markup in index.html v2, visibility
 *   toggled by router.js v9). requestExit() shows the same
 *   exit-confirmation guard as the back-gesture/Exit button during an
 *   active session, or navigates straight to Today otherwise. No
 *   circular import risk: session-guard.js does not import app.js.
 *
 * v6 — OB-THREAD. First-route logic updated: new users route to
 *   onboarding/thread instead of welcome. The welcome, name, about, body,
 *   and lifestyle onboarding screens are retired. Existing users (hasName or
 *   onboardingComplete) still route to today unchanged.
 *   No other changes from v5.
 *
 * v5 — Critical fix: window.router and window.store set at module level,
 *   immediately after import, before DOMContentLoaded fires.
 * v4 — Nav visibility fix.
 * v3 — Explicit first navigate + loading screen dismiss.
 * v2 — 15 Jun 2026. APP_VERSION bumped.
 * v1 — Initial.
 */

import { store }              from './store.js';
import { router }             from './router.js';
import { requestExit }        from './session-guard.js';
import { initPaywallListener } from './auth.js';

// ── Globals — set immediately, before anything else runs ──────────────────────
window.router = router;
window.store  = store;

// ─────────────────────────────────────────────────────────────────────────────

const APP_VERSION = "03 Aug 2026 v8";

const NAV_VIEWS = new Set([
  'today', 'progress', 'noticing', 'settings', 'weekly-plan',
  'activity-log', 'library', 'upgrade', 'privacy',
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
    registerServiceWorker();

    // Nav escape-hatch icon — single click handler, wired once.
    document.getElementById('hidden-nav-home-btn')?.addEventListener('click', () => {
      requestExit();
    });

    // Tier-gating (S4-TG, 03 Aug 2026) — single delegated listener for
    // every .locked-feature-wrap on the page, present or future.
    initPaywallListener();

    console.log("Alongside ready");

    // Routing logic:
    //   Existing user (onboardingComplete OR has a name stored): → today
    //   New install: → onboarding/thread
    //
    // The hasName check handles the edge case where a user completed the old
    // multi-screen onboarding but onboardingComplete was reset by a schema
    // migration. They should not see the thread again.
    const isOnboarded    = store.get('onboardingComplete') === true;
    const hasName        = !!(store.get('name'));
    const isExistingUser = isOnboarded || hasName;
    const firstView      = isExistingUser ? 'today' : 'onboarding/thread';

    await router.navigate(firstView);

    // Dismiss loading screen
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';

    // Show nav bar for nav views
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
