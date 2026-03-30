/**
 * router.js - View navigation
 * Handles routing between different screens
 *
 * Accessibility additions (March 2026):
 *   - VIEW_NAMES map provides human-readable labels for screen reader announcements
 *   - announceNavigation() writes to #sr-announcer after every navigate()
 *   - moveFocusToContent() moves keyboard focus to #main-content after render
 *     so screen reader users land at the top of the new view
 */

import { store } from './store.js';

// Human-readable names announced to screen readers on navigation.
// Keys match the viewName strings passed to router.navigate().
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
};

export const router = {

  currentView: null,
  views: {},

  /**
   * Initialise router — determine starting view
   */
  init() {
    this.setupNavigation();
    this.hideLoading();

    if (store.isOnboardingComplete()) {
      this.navigate('today');
    } else {
      this.navigate('onboarding/welcome');
    }

    console.log('🧭 Router initialised');
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

    // Clear current content
    mainContent.innerHTML = '';
    mainContent.className = 'main-content';

    // Hide/show bottom nav
    const hideNavViews = ['onboarding', 'workout', 'workout-complete', 'checkin'];
    const shouldHideNav = hideNavViews.some(v => viewName.startsWith(v));

    if (shouldHideNav) {
      bottomNav.classList.add('hidden');
    } else {
      bottomNav.classList.remove('hidden');
      this.setActiveNav(viewName);
    }

    // Load and render the view
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

    // ── Accessibility ──────────────────────────────────────────────────────
    // Announce the new view name to screen readers, then move focus to the
    // top of the content area so keyboard/AT users start at the right place.
    this.announceNavigation(viewName);
    this.moveFocusToContent();
    // ──────────────────────────────────────────────────────────────────────
  },

  /**
   * Write the human-readable view name to #sr-announcer.
   *
   * Screen readers (VoiceOver, TalkBack, NVDA) watch this element because
   * it has aria-live="polite" and will read its content aloud.
   *
   * We clear the text first so that navigating to the same view twice
   * still triggers a new announcement (live regions only fire on change).
   *
   * The 50ms delay lets the DOM settle before the announcement fires,
   * preventing it from being swallowed by the render cycle.
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
   * Fallback formatter for views not listed in VIEW_NAMES.
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
   *
   * #main-content has tabindex="-1" in index.html, which means:
   *   - It CAN receive focus programmatically (this call)
   *   - It does NOT appear in the normal Tab key order
   *
   * preventScroll:true stops the browser jumping position — we already
   * handle scrolling with window.scrollTo() above.
   *
   * The 100ms delay gives the view render time to complete so that
   * screen readers read the new content, not the blank state.
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
   * Highlight the active nav item
   */
  setActiveNav(viewName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });
  }
};

// Make router available globally for onclick handlers in view templates
window.router = router;
