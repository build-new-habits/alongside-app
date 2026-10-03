/**
 * app.js - Application entry point
 * 02 Oct 2026 v12
 *
 * v12 - W5-16. At start-up the bottom nav follows the screen the router
 *   opened, so it stays hidden over the age question and the policy screen.
 *   W5-5: under 18 answered and the app closed before choosing, what the
 *   phone held is deleted at the next start-up.
 *
 * 02 Oct 2026 v11
 *
 * v11 - W4-14 UPDATE-RELOAD (Wave 4 trace, 2.14). The page reloads for a
 *   new version only when the person pressed Update. It used to reload on
 *   every change of service worker, and the worker took over on install,
 *   so a new version reloaded the app mid-session and Later could not
 *   hold. The banner also waits while a session, check-in, journal entry or
 *   getting started is on screen, and shows once they are back.
 *   verify-update-hold.
 *
 * v10 - W4-1 GATE-OPEN. The first screen is Home only once onboarding is
 *   finished. A stored name no longer counts: typing a name at the first
 *   coach question (or in Settings after the house-button bypass) and
 *   closing the app used to skip the rest of onboarding, the age question
 *   and the consents for good. The schema migration the name check covered
 *   (Aug 2026) no longer resets onboardingComplete.
 *
 * v9 - B3 DOMAIN. The service worker is registered relative ("./sw.js",
 *   scope "./"), so the app runs unchanged at either address.
 * v9 - B4 MESSAGES. After the first screen is up, the dot on the Settings
 *   tab is set from the messages already kept, then messages.json is
 *   fetched (relative, nothing about the person sent) and the dot set again.
 *   It never blocks or delays the first screen. B5: evidence.js is loaded so
 *   its two research messages count towards the dot (only while sending is on).
 *
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
import { requestExit, isGuardActive } from './session-guard.js';
import { initPaywallListener } from './auth.js';
import { refreshMessages, updateNavDot } from './data/messages.js';
import { declaredUnder18, heldOnPhone, deleteForUnder18 } from './data/age-check.js';
import './data/evidence.js';   // B5: registers the two research messages (only while sending is on)

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
// W4-14. Set only when this person pressed Update.
let _updateRequested = false;
let _bannerRetry = null;
// Screens where a reload would lose somebody's place or words.
const BUSY_VIEWS = new Set([
  'workout', 'gym-programme', 'morning-session', 'core-session', 'yoga-session',
  'walk-session', 'running-session', 'cycle-session', 'swim-session',
  'quiet-session', 'breathing-session', 'prescribed-session', 'class-player',
  'capture', 'in-step', 'practices', 'checkin', 'checkin-mini', 'journal-entry',
  'reflect', 'onboarding/thread', 'age-check', 'consent-update', 'health-consent',
]);
const BANNER_RETRY_MS = 30000;

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    // B3 DOMAIN. Relative, so the same code works at
    // build-new-habits.github.io/alongside-app/ and at app.buildnewhabits.co.uk.
    const reg = await navigator.serviceWorker.register("./sw.js", {
      scope: "./"
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
      // W4-14. Only the update this person asked for reloads the page.
      if (_updateRequested) App.reload();
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
  _updateRequested = true;
  const reg = _swRegistration;
  if (reg?.waiting) {
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
  } else {
    App.reload();
  }
}

function showUpdateBanner() {
  if (document.getElementById("update-banner")) return;
  // W4-14. Not in the middle of something: try again a little later.
  if (isGuardActive() || BUSY_VIEWS.has(router.currentView)) {
    clearTimeout(_bannerRetry);
    _bannerRetry = setTimeout(showUpdateBanner, BANNER_RETRY_MS);
    return;
  }
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

    // Routing logic (W4-1, 02 Oct 2026): Home once onboarding is finished,
    // otherwise onboarding. The guards in the router send anybody who has not
    // answered the age question or agreed to the policies back to it.
    // W5-5 (safeguarding reviewers to read). Somebody who answered under 18
    // is offered a copy of what the phone held, on the under-18 screen, in
    // the visit they answered. If the app is closed before they chose, it
    // is deleted here, the next time it opens: nothing of theirs outlasts
    // that visit.
    if (declaredUnder18() && heldOnPhone().any) deleteForUnder18();

    const isOnboarded    = store.get('onboardingComplete') === true;
    const firstView      = isOnboarded ? 'today' : 'onboarding/thread';

    await router.navigate(firstView);

    // Dismiss loading screen
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';

    // Show nav bar for nav views. W5-16: by the screen the router opened
    // (the age question or the policy screen in place of Home), not the one
    // asked for: the nav showed over the age question and its tabs only
    // redrew it.
    const nav = document.getElementById('bottom-nav');
    if (nav && NAV_VIEWS.has(router.currentView)) {
      nav.classList.remove('hidden');
    }

    // B4 MESSAGES. Last, and not awaited: it must never hold the app up.
    updateNavDot();
    refreshMessages();
  },

  checkForUpdate,
  showUpdateCheckResult,
  applyUpdate,
  showUpdateBanner,
  reload: () => window.location.reload(),
};

window.App = App;

document.addEventListener("DOMContentLoaded", () => App.init());
