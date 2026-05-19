/**
 * router.js - View navigation
 * Handles routing between different screens
 *
 * 19 May 2026 v1
 *
 * v1.3 — NS-2: library route added
 *
 * v1.2 — Return-visit abbreviated check-in (NS-3):
 *   Second and subsequent visits same day no longer force a full check-in.
 *   Instead the user lands on intention with a soft coach prompt.
 *   The intention screen detects this and shows "anything changed?" UI.
 *   New route: checkin-mini — a 3-question abbreviated check-in
 *   (energy + mood + pain only, no sleep, no conditions).
 *   Store key returnVisit: true signals to intention.js to show the prompt.
 *
 * v1.1 — Check-in as front door (9 May 2026):
 *   On app launch, router checks whether the user has checked in today.
 *   Not checked in today → checkin. Already checked in → intention.
 *
 * v1.0 — Accessibility additions (March 2026)
 */

import { store } from './store.js';
import { tts }   from './tts.js';

// Human-readable names announced to screen readers on navigation.
const VIEW_NAMES = {
  'today':                   'Today',
  'progress':                'Your Progress',
  'settings':                'Settings',
  'checkin':                 'Daily Check-In',
  'workout':                 'Workout',
  'workout-complete':        'Workout Complete',
  'onboarding/welcome':      'Welcome to Alongside',
  'onboarding/name':         'Your Name',
  'onboarding/about':        'About You',
  'onboarding/body':         'Body and Targets',
  'onboarding/goals':        'Your Goals',
  'onboarding/conditions':   'Your Conditions',
  'onboarding/lifestyle':    'Your Lifestyle',
  'onboarding/equipment':    'Your Equipment',
  'onboarding/complete':     'Profile Complete',
  'onboarding/goal-setup':   'Build Your Plan',
  'onboarding/privacy':      'Privacy and Terms',
  'privacy':                 'Privacy and Terms',
  'gym-programme':           'My Gym Programme',
  'intention':               'What would you like to do today?',
  'coach-proposal':          'Your coach has a suggestion',
  'reflect':                 'How was that?',
  'prescribed-session':      'Prescribed Exercises',
  'prescribed':              'My Prescribed Exercises',
  'morning-session':         'Morning Session',
  'quiet-session':           'Quiet Session',
  'yoga-session':            'Yoga and Pilates',
  'core-session':            'Core Session',
  'walk-session':            'Walk Session',
  'library':                 'Library',
  'running-session':         'Running Session',
  'swim-session':            'Swim Session',
  'cycle-session':           'Cycle Session',
  'checkin-mini':            'Quick check-in',
};

export const router = {

  currentView: null,
  views: {},

  /**
   * Initialise router — determine starting view.
   *
   * Flow after onboarding:
   *   1. Has user checked in today?
   *      Yes → intention (they've already shared how they are)
   *      No  → checkin  (coach needs today's data before proposing anything)
   */
  init() {
    this.setupNavigation();
    this.hideLoading();

    if (store.isOnboardingComplete()) {
      const checkedInToday = this._hasCheckedInToday();
      if (!checkedInToday) {
        // First visit today — full check-in required
        store.set('returnVisit', false);
        this.navigate('checkin');
      } else {
        // Return visit same day — go to intention with soft prompt
        // intention.js reads store.get('returnVisit') to show "anything changed?"
        store.set('returnVisit', true);
        this.navigate('intention');
      }
    } else {
      this.navigate('onboarding/welcome');
    }

    // Intercept browser back gesture (device swipe back / hardware back button)
    // Without this, back gesture reloads the app and triggers a full re-checkin
    window.addEventListener("popstate", (e) => {
      // When back is pressed, navigate to previous view if we know it,
      // otherwise go to intention screen (safe fallback)
      const previousView = e.state?.view;
      if (previousView) {
        // Navigate without pushing another history entry
        this._navigateWithoutHistory(previousView);
      } else {
        // Fallback — go to intention or checkin based on check-in state
        const target = this._hasCheckedInToday() ? "intention" : "checkin";
        this._navigateWithoutHistory(target);
      }
    });

    console.log('\uD83E\uDDED Router initialised');
  },

  /**
   * Returns true if the user has a lastCheckin entry dated today.
   * Uses YYYY-MM-DD comparison so "today" is correct regardless of time.
   */
  // Navigate without pushing to history — used by popstate handler
  // Prevents infinite history stack growth on back gesture
  _navigateWithoutHistory(viewName) {
    if (!viewName) return;
    const main = document.getElementById("main-content");
    if (!main) return;
    this.setActiveNav(viewName);
    this._hideNavForViews(viewName);
    import(`./views/${viewName}.js`)
      .then(mod => {
        main.innerHTML = mod.render ? mod.render() : "";
        if (mod.onMount) mod.onMount();
        this.announceNavigation(viewName);
        this.moveFocusToContent();
      })
      .catch(() => {
        // View not found — stay where we are
      });
  },

  _hasCheckedInToday() {
    const lastCheckin = store.get('lastCheckin');
    if (!lastCheckin?.date) return false;
    const today = new Date().toISOString().split('T')[0];
    return lastCheckin.date === today;
  },

  /**
   * Register a view module (for pre-loading, if needed)
   */
  register(name, viewModule) {
    this.views[name] = viewModule;
  },

  /**
   * Navigate to a view by name.
   * After rendering, announces the new view to screen readers
   * and moves keyboard focus to the main content area.
   */
  async navigate(viewName) {
    console.log(`Navigating to: ${viewName}`);

    const mainContent = document.getElementById('main-content');
    const bottomNav   = document.getElementById('bottom-nav');

    mainContent.innerHTML = '';
    mainContent.className = 'main-content';

    // Hide bottom nav during focused flows
    const hideNavViews = [
      'onboarding', 'workout', 'workout-complete',
      'checkin', 'prescribed-session', 'morning-session',
      'quiet-session', 'yoga-session', 'coach-proposal', 'core-session', 'walk-session',
      'running-session', 'swim-session', 'cycle-session', 'checkin-mini'
    ];
    const shouldHideNav = hideNavViews.some(v => viewName.startsWith(v));

    if (shouldHideNav) {
      bottomNav.classList.add('hidden');
    } else {
      bottomNav.classList.remove('hidden');
      this.setActiveNav(viewName);
    }

    try {
      const view = await this.loadView(viewName);

      if (view) {
        if (view.centered) {
          mainContent.classList.add('centered');
        }
        mainContent.innerHTML = view.render();
        if (view.onMount) {
          view.onMount();
        }
      }
    } catch (e) {
      console.error(`Error loading view: ${viewName}`, e);
      mainContent.innerHTML = `<div class="error">Error loading view: ${e.message}</div>`;
    }

    this.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    tts.stop();

    this.announceNavigation(viewName);
    this.moveFocusToContent();

    setTimeout(() => tts.mountButtons(), 150);
  },

  /**
   * Write the human-readable view name to #sr-announcer.
   * Screen readers watch this element (aria-live="polite") and announce it.
   * Text is cleared first so navigating to the same view twice still fires.
   */
  announceNavigation(viewName) {
    const announcer = document.getElementById('sr-announcer');
    if (!announcer) return;
    const label = VIEW_NAMES[viewName] || this.formatViewName(viewName);
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = label;
    }, 50);
  },

  /**
   * Fallback formatter for views not in VIEW_NAMES.
   * 'onboarding/some-view' → 'Some View'
   */
  formatViewName(viewName) {
    const last = viewName.split('/').pop();
    return last
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Move keyboard focus to #main-content after navigation.
   * #main-content has tabindex="-1" — receives focus programmatically
   * but is not in the normal Tab order.
   */
  moveFocusToContent() {
    setTimeout(() => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.focus({ preventScroll: true });
    }, 100);
  },

  /**
   * Dynamically load a view module by name
   */
  async loadView(viewName) {
    if (this.views[viewName]) {
      return this.views[viewName];
    }
    const path = `./views/${viewName}.js`;
    try {
      const module = await import(path);
      this.views[viewName] = module;
      return module;
    } catch (e) {
      console.error(`Failed to load view: ${path}`, e);
      return null;
    }
  },

  /**
   * Hide the loading screen after initial render
   */
  hideLoading() {
    setTimeout(() => {
      const loading = document.getElementById('loading');
      if (loading) {
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => loading.classList.add('hidden'), 300);
      }
    }, 1500);
  },

  /**
   * Wire up bottom navigation click handlers
   */
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) this.navigate(view);
      });
    });
  },

  /**
   * Highlight the active nav item.
   * Both 'intention' and 'checkin' map to the Today nav button.
   * 'today' (coach workout view) also highlights Today.
   */
  setActiveNav(viewName) {
    const todayViews = ['intention', 'today', 'checkin', 'coach-proposal'];
    const navKey = todayViews.includes(viewName) ? 'intention' : viewName;
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === navKey);
    });
  }
};

// Make router available globally for onclick handlers in view templates
window.router = router;
