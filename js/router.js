/**
 * router.js - View navigation
 *
 * 21 Jun 2026 v4 (S4-CSS-NOTICING):
 *   onUnmount() hook added to navigate(). Before switching views, navigate()
 *   now calls this.views[this.currentView]?.onUnmount?.() if that method
 *   exists on the outgoing view. This stops active session timers when the
 *   device back gesture fires a popstate event — the gesture calls back()
 *   which calls navigate(), which now runs onUnmount() on the view being
 *   left before tearing down its DOM. breathing-session.js and
 *   quiet-session.js each implement onUnmount() to clear their intervals.
 *
 * 30 May 2026 v1 --- Daily flow redesign:
 *   coach-reflection added to VIEW_NAMES.
 *   noticing added to VIEW_NAMES.
 *   intention and coach-proposal removed from hideNavViews (nav always visible).
 *   setActiveNav: coach-reflection maps to Today tab.
 *   init() now navigates to "today" (Act 1 greeting) instead of "intention".
 *
 * 22 May 2026 v2 --- Device back gesture fix (S4-3):
 *   pushState() called on every navigate() so the browser history stack
 *   is never empty. popstate listener intercepts device swipe-back and
 *   Android back button, calls router.back() instead of exiting the app.
 *   Added missing VIEW_NAMES entries for new routes.
 *
 * 22 May 2026 v1 --- Navigation stack added. router.back() replaces all
 *   hardcoded Back destinations.
 *
 * Accessibility additions (March 2026):
 *   - VIEW_NAMES map provides human-readable labels for screen reader announcements
 *   - announceNavigation() writes to #sr-announcer after every navigate()
 *   - moveFocusToContent() moves keyboard focus to #main-content after render
 */

import { store } from "./store.js";
import { tts }   from "./tts.js";

const VIEW_NAMES = {
  "today":                   "Today",
  "coach-reflection":        "Your Session",
  "progress":                "Your Progress",
  "settings":                "Settings",
  "checkin":                 "Daily Check-In",
  "intention":               "What would you like to do today?",
  "coach-proposal":          "Your Coach",
  "workout":                 "Workout",
  "workout-complete":        "Workout Complete",
  "reflect":                 "How was that?",
  "prescribed":              "My Prescribed Exercises",
  "prescribed-session":      "Prescribed Exercises",
  "gym-programme":           "My Gym Programme",
  "morning-session":         "Morning Session",
  "quiet-session":           "Quiet Session",
  "yoga-session":            "Yoga Session",
  "session-builder":         "Build a Session",
  "session-builder-ui":      "Build a Session",
  "library":                 "Library",
  "activity-log":            "Log an Activity",
  "noticing":                "Noticing",
  "noticing-hub":            "Noticing Hub",
  "upgrade":                 "Personal Plan",
  "privacy":                 "Privacy and Terms",
  "checkin-mini":            "Quick Check-In",
  "breathing-session":       "Breathing Practice",
  "onboarding/welcome":      "Welcome to Alongside",
  "onboarding/name":         "Your Name",
  "onboarding/about":        "About You",
  "onboarding/body":         "Body and Targets",
  "onboarding/goals":        "Your Goals",
  "onboarding/conditions":   "Your Conditions",
  "onboarding/lifestyle":    "Your Lifestyle",
  "onboarding/equipment":    "Your Equipment",
  "onboarding/complete":     "Profile Complete",
  "onboarding/goal-setup":   "Build Your Plan",
  "onboarding/privacy":      "Privacy and Terms",
};

export const router = {

  currentView: null,
  views: {},
  _history: [],
  _popstateWired: false,

  back() {
    this._history.pop();
    const previous = this._history.pop();
    this.navigate(previous || "today");
  },

  init() {
    this.setupNavigation();
    this.setupPopstate();
    this.hideLoading();

    if (store.isOnboardingComplete()) {
      this.navigate("today");
    } else {
      this.navigate("onboarding/welcome");
    }

    console.log("Router initialised");
  },

  /**
   * Wire the browser popstate event to router.back().
   * This intercepts device swipe-back (iOS) and Android hardware back button.
   *
   * Strategy: push a dummy state on every navigate() so the browser
   * always has somewhere to "go back" to. When popstate fires, we catch
   * it, re-push the state (so the stack stays non-empty), and call
   * router.back() ourselves.
   *
   * This prevents the PWA from exiting when the user swipes or taps back.
   */
  setupPopstate() {
    if (this._popstateWired) return;
    this._popstateWired = true;

    // Seed the browser history so there is always a state to pop to
    window.history.pushState({ alongside: true }, "", window.location.href);

    window.addEventListener("popstate", () => {
      // Re-push immediately so the stack never empties
      window.history.pushState({ alongside: true }, "", window.location.href);
      // Now handle in-app back navigation
      this.back();
    });
  },

  register(name, viewModule) {
    this.views[name] = viewModule;
  },

  async navigate(viewName) {
    console.log("Navigating to: " + viewName);

    /**
     * onUnmount hook — call cleanup on the outgoing view before switching.
     * This stops active timers (breathing, mindful movement) when the
     * device back gesture fires popstate -> back() -> navigate().
     * Views opt in by exporting an onUnmount() function.
     */
    if (this.currentView && this.views[this.currentView]?.onUnmount) {
      try {
        this.views[this.currentView].onUnmount();
      } catch (e) {
        console.warn("onUnmount error on " + this.currentView, e);
      }
    }

    // Push to in-app navigation stack
    const isOnboarding = viewName.startsWith("onboarding");
    const isDuplicate  = this._history.length > 0 &&
                         this._history[this._history.length - 1] === viewName;
    if (!isOnboarding && !isDuplicate) {
      this._history.push(viewName);
      if (this._history.length > 20) this._history.shift();
    }

    // Push browser history state so popstate can fire on back gesture
    window.history.pushState({ alongside: true, view: viewName }, "", window.location.href);

    const mainContent = document.getElementById("main-content");
    const bottomNav   = document.getElementById("bottom-nav");

    mainContent.innerHTML = "";
    mainContent.className = "main-content";

    // Nav is hidden only during focused flows.
    // intention, coach-proposal, and coach-reflection all show nav now --
    // the user can always reach Progress, Noticing, or Settings.
    const hideNavViews = [
      "onboarding", "workout", "workout-complete", "checkin",
      "prescribed-session", "morning-session", "quiet-session",
      "yoga-session", "breathing-session"
    ];
    const shouldHideNav = hideNavViews.some(v => viewName.startsWith(v));

    if (shouldHideNav) {
      bottomNav.classList.add("hidden");
    } else {
      bottomNav.classList.remove("hidden");
      this.setActiveNav(viewName);
    }

    try {
      const view = await this.loadView(viewName);
      if (view) {
        if (view.centered) mainContent.classList.add("centered");
        mainContent.innerHTML = view.render();
        if (view.onMount) view.onMount();
      }
    } catch (e) {
      console.error("Error loading view: " + viewName, e);
      mainContent.innerHTML = "<div class=\"error\">Error loading view: " + e.message + "</div>";
    }

    this.currentView = viewName;
    window.scrollTo({ top: 0, behavior: "smooth" });

    tts.stop();
    this.announceNavigation(viewName);
    this.moveFocusToContent();
    setTimeout(() => tts.mountButtons(), 150);
  },

  announceNavigation(viewName) {
    const announcer = document.getElementById("sr-announcer");
    if (!announcer) return;
    const label = VIEW_NAMES[viewName] || this.formatViewName(viewName);
    announcer.textContent = "";
    setTimeout(() => { announcer.textContent = label; }, 50);
  },

  formatViewName(viewName) {
    const last = viewName.split("/").pop();
    return last
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },

  moveFocusToContent() {
    setTimeout(() => {
      const mainContent = document.getElementById("main-content");
      if (mainContent) mainContent.focus({ preventScroll: true });
    }, 100);
  },

  async loadView(viewName) {
    if (this.views[viewName]) return this.views[viewName];
    const path = "./views/" + viewName + ".js";
    try {
      const module = await import(path);
      this.views[viewName] = module;
      return module;
    } catch (e) {
      console.error("Failed to load view: " + path, e);
      return null;
    }
  },

  hideLoading() {
    setTimeout(() => {
      const loading = document.getElementById("loading");
      if (loading) {
        loading.style.opacity = "0";
        loading.style.transition = "opacity 0.3s ease-out";
        setTimeout(() => loading.classList.add("hidden"), 300);
      }
    }, 1500);
  },

  setupNavigation() {
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        const view = item.dataset.view;
        if (view) this.navigate(view);
      });
    });
  },

  /**
   * Highlight the active nav item.
   * today, coach-reflection, coach-proposal and intention all map to
   * the Today button (data-view="intention") since they are all part
   * of the Today flow.
   */
  setActiveNav(viewName) {
    const todayViews = ["today", "coach-reflection", "coach-proposal", "intention"];
    const navKey = todayViews.includes(viewName) ? "intention" : viewName;
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.view === navKey);
    });
  }
};

window.router = router;
