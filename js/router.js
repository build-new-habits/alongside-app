/**
 * router.js
 * 23 Jun 2026 v3
 *
 * Client-side router for Alongside: Move PWA.
 * Vanilla JS, no framework. Manages view loading and history.
 *
 * v3 — Phase 5 final VIEW_NAMES pass (Step 19):
 *   New routes added:
 *     home-threshold      — threshold moment between choosing and beginning
 *     community-impact    — Tesco coins voting UI (content gate D10)
 *     annual-reflection   — nine-chapter annual event (content gate D8)
 *   hideNavViews updated:
 *     home-threshold added (no nav during threshold moment — silence is design)
 *   setActiveNav updated for all new routes.
 *   All Phase 5 view files confirmed in VIEW_NAMES.
 *
 * v2 — 22 May 2026. history.pushState on every navigate().
 *   popstate listener intercepts device back gesture.
 *   All missing routes added (coach-proposal, session-builder, activity-log,
 *   noticing-hub, upgrade, quiet-session, yoga-session, library).
 *   coach-reflection added as post-check-in hub.
 *
 * v1 — Initial router. import() based lazy loading.
 *
 * Architecture:
 *   - Every view is a named JS module in js/views/
 *   - Lazy-loaded on first navigate, cached in viewCache
 *   - Each module exports a function matching its VIEW_NAMES entry
 *   - Function receives (router) and returns { mount(container) }
 *   - Active view mounted into #app-content
 *   - Nav bar visibility controlled by hideNavViews list
 *
 * Back gesture handling:
 *   - history.pushState() called on every navigate()
 *   - popstate listener re-pushes state to prevent stack emptying
 *   - Calls router.back() internally — no app restart on device back
 *
 * WCAG 2.2 AA:
 *   - Focus management: on navigate(), focus moved to #app-content
 *   - #app-content has tabindex="-1" for programmatic focus
 *   - View transitions do not cause focus trap
 *   - Nav buttons: aria-current="page" on active item
 */

// ─── View map ──────────────────────────────────────────────────────────────────
// Key:   route name used in router.navigate()
// Value: { path: module path, fn: exported function name }

const VIEW_NAMES = {

  // ── Onboarding ──────────────────────────────────────────────────────────────
  'welcome':               { path: './views/onboarding/welcome.js',      fn: 'WelcomeView'           },
  'onboarding/name':       { path: './views/onboarding/name.js',         fn: 'NameView'              },
  'onboarding/about':      { path: './views/onboarding/about.js',        fn: 'AboutView'             },
  'onboarding/body':       { path: './views/onboarding/body.js',         fn: 'BodyView'              },
  'onboarding/goals':      { path: './views/onboarding/goals.js',        fn: 'GoalsView'             },
  'onboarding/conditions': { path: './views/onboarding/conditions.js',   fn: 'ConditionsView'        },
  'onboarding/lifestyle':  { path: './views/onboarding/lifestyle.js',    fn: 'LifestyleView'         },
  'onboarding/equipment':  { path: './views/onboarding/equipment.js',    fn: 'EquipmentView'         },
  'onboarding/goal-setup': { path: './views/onboarding/goal-setup.js',   fn: 'GoalSetupView'         },
  'onboarding/complete':   { path: './views/onboarding/complete.js',     fn: 'CompleteView'          },
  // Phase 5 — content gate D6
  'onboarding/arrival':    { path: './views/onboarding/arrival.js',      fn: 'ArrivalView'           },
  'onboarding/hard-before':{ path: './views/onboarding/hard-before.js',  fn: 'HardBeforeView'        },
  'onboarding/reflection': { path: './views/onboarding/reflection.js',   fn: 'OnboardingReflectionView' },

  // ── Core daily flow ─────────────────────────────────────────────────────────
  'today':                 { path: './views/today.js',                   fn: 'TodayView'             },
  'checkin':               { path: './views/checkin.js',                 fn: 'CheckinView'           },
  'checkin-mini':          { path: './views/checkin-mini.js',            fn: 'CheckinMiniView'       },
  'coach-reflection':      { path: './views/coach-reflection.js',        fn: 'CoachReflectionView'   },
  'coach-proposal':        { path: './views/coach-proposal.js',          fn: 'CoachProposalView'     },
  // Phase 5 — content gate D3
  'home-threshold':        { path: './views/home-threshold.js',          fn: 'HomeThresholdView'     },
  'intention':             { path: './views/intention.js',               fn: 'IntentionView'         },
  'reflect':               { path: './views/reflect.js',                 fn: 'ReflectView'           },

  // ── Main views ──────────────────────────────────────────────────────────────
  'progress':              { path: './views/progress.js',                fn: 'ProgressView'          },
  'settings':              { path: './views/settings.js',                fn: 'SettingsView'          },
  'weekly-plan':           { path: './views/weekly-plan.js',             fn: 'WeeklyPlanView'        },
  'noticing':              { path: './views/noticing.js',                fn: 'NoticingView'          },
  'journal-entry':         { path: './views/journal-entry.js',           fn: 'JournalEntryView'      },
  'activity-log':          { path: './views/activity-log.js',            fn: 'ActivityLogView'       },
  'library':               { path: './views/library.js',                 fn: 'LibraryView'           },
  'about':                 { path: './views/about.js',                   fn: 'AboutView'             },
  'privacy':               { path: './views/privacy.js',                 fn: 'PrivacyView'           },
  'upgrade':               { path: './views/upgrade.js',                 fn: 'UpgradeView'           },
  'goal-setup':            { path: './views/goal-setup.js',              fn: 'GoalSetupView'         },
  // Phase 5 — content gate D10
  'community-impact':      { path: './views/community-impact.js',        fn: 'CommunityImpactView'   },
  // Phase 5 — content gate D8
  'annual-reflection':     { path: './views/annual-reflection.js',       fn: 'AnnualReflectionView'  },

  // ── Session builder ─────────────────────────────────────────────────────────
  'session-builder':       { path: './views/session-builder.js',         fn: 'SessionBuilderView'    },

  // ── Session views ───────────────────────────────────────────────────────────
  'workout':               { path: './views/workout.js',                 fn: 'WorkoutView'           },
  'gym-programme':         { path: './views/gym-programme.js',           fn: 'GymProgrammeView'      },
  'morning-session':       { path: './views/morning-session.js',         fn: 'MorningSessionView'    },
  'core-session':          { path: './views/core-session.js',            fn: 'CoreSessionView'       },
  'yoga-session':          { path: './views/yoga-session.js',            fn: 'YogaSessionView'       },
  'walk-session':          { path: './views/walk-session.js',            fn: 'WalkSessionView'       },
  'running-session':       { path: './views/running-session.js',         fn: 'RunningSessionView'    },
  'cycle-session':         { path: './views/cycle-session.js',           fn: 'CycleSessionView'      },
  'swim-session':          { path: './views/swim-session.js',            fn: 'SwimSessionView'       },
  'quiet-session':         { path: './views/quiet-session.js',           fn: 'QuietSessionView'      },
  'breathing-session':     { path: './views/breathing-session.js',       fn: 'BreathingSessionView'  },
  'prescribed':            { path: './views/prescribed.js',              fn: 'PrescribedView'        },
  'prescribed-session':    { path: './views/prescribed-session.js',      fn: 'PrescribedSessionView' },
};

// ─── Views that hide the nav bar ──────────────────────────────────────────────
// Session views, onboarding, and full-screen moments.

const hideNavViews = new Set([
  // Onboarding
  'welcome',
  'onboarding/name',
  'onboarding/about',
  'onboarding/body',
  'onboarding/goals',
  'onboarding/conditions',
  'onboarding/lifestyle',
  'onboarding/equipment',
  'onboarding/goal-setup',
  'onboarding/complete',
  'onboarding/arrival',
  'onboarding/hard-before',
  'onboarding/reflection',
  // Full-screen moments
  'home-threshold',       // silence is design — no nav during threshold
  'community-impact',
  'annual-reflection',
  // Check-in flow
  'checkin',
  'checkin-mini',
  'coach-reflection',
  'coach-proposal',
  // Session views
  'workout',
  'gym-programme',
  'morning-session',
  'core-session',
  'yoga-session',
  'walk-session',
  'running-session',
  'cycle-session',
  'swim-session',
  'quiet-session',
  'breathing-session',
  'prescribed',
  'prescribed-session',
  'session-builder',
  // Post-session
  'reflect',
  // Utility
  'journal-entry',
  'privacy',
  'upgrade',
]);

// ─── Nav tab mapping ───────────────────────────────────────────────────────────
// Maps route names to the nav tab that should be highlighted.

const NAV_MAP = {
  'today':            'today',
  'checkin':          'today',
  'checkin-mini':     'today',
  'coach-reflection': 'today',
  'coach-proposal':   'today',
  'home-threshold':   'today',
  'intention':        'today',
  'reflect':          'today',
  'workout':          'today',
  'gym-programme':    'today',
  'morning-session':  'today',
  'core-session':     'today',
  'yoga-session':     'today',
  'walk-session':     'today',
  'running-session':  'today',
  'cycle-session':    'today',
  'swim-session':     'today',
  'quiet-session':    'today',
  'breathing-session':'today',
  'prescribed':       'today',
  'prescribed-session':'today',
  'session-builder':  'today',
  'progress':         'progress',
  'weekly-plan':      'progress',
  'noticing':         'noticing',
  'journal-entry':    'noticing',
  'library':          'noticing',
  'settings':         'settings',
  'about':            'settings',
  'privacy':          'settings',
  'upgrade':          'settings',
  'weekly-plan':      'settings',
  'goal-setup':       'settings',
  'community-impact': 'settings',
  'annual-reflection':'settings',
};

// ─── Router ────────────────────────────────────────────────────────────────────

export const router = {

  currentView:  null,
  history:      [],
  viewCache:    {},

  init() {
    this._setupPopstate();
    this._setupNavButtons();
  },

  // ── Navigate ───────────────────────────────────────────────────────────────

  async navigate(viewName) {
    if (!VIEW_NAMES[viewName]) {
      console.warn(`Router: unknown view "${viewName}" — falling back to today`);
      viewName = 'today';
    }

    // Push to browser history
    history.pushState({ view: viewName }, '', `#${viewName}`);

    // Track internal history
    if (this.currentView && this.currentView !== viewName) {
      this.history.push(this.currentView);
      if (this.history.length > 20) this.history.shift();
    }

    this.currentView = viewName;
    await this._mountView(viewName);
  },

  // ── Back ───────────────────────────────────────────────────────────────────

  back() {
    const prev = this.history.pop();
    if (prev) {
      this.navigate(prev);
    } else {
      this.navigate('today');
    }
  },

  // ── Mount view ─────────────────────────────────────────────────────────────

  async _mountView(viewName) {
    const container = document.getElementById('app-content');
    if (!container) return;

    // Nav visibility
    const nav = document.getElementById('app-nav');
    if (nav) {
      nav.style.display = hideNavViews.has(viewName) ? 'none' : '';
    }

    // Active nav item
    this._setActiveNav(viewName);

    // Load and mount view
    try {
      if (!this.viewCache[viewName]) {
        const { path, fn } = VIEW_NAMES[viewName];
        const module = await import(path);
        this.viewCache[viewName] = module[fn];
      }

      const ViewFactory = this.viewCache[viewName];
      if (typeof ViewFactory !== 'function') {
        throw new Error(`View factory for "${viewName}" is not a function`);
      }

      const view = ViewFactory(this);
      container.innerHTML = '';
      view.mount(container);

      // Focus management — move focus to content area for screen readers
      container.setAttribute('tabindex', '-1');
      container.focus({ preventScroll: false });
      // Restore natural tab order after focus
      setTimeout(() => container.removeAttribute('tabindex'), 100);

    } catch (err) {
      console.error(`Router: failed to mount view "${viewName}"`, err);
      container.innerHTML = `
        <div class="router-error" role="alert">
          <p>Something went wrong loading this page.</p>
          <button onclick="router.navigate('today')" class="btn btn-primary">
            Go home
          </button>
        </div>
      `;
    }
  },

  // ── Nav button wiring ──────────────────────────────────────────────────────

  _setupNavButtons() {
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.nav;
        if (target) this.navigate(target);
      });
    });
  },

  // ── Active nav ─────────────────────────────────────────────────────────────

  _setActiveNav(viewName) {
    const activeTab = NAV_MAP[viewName] || null;

    document.querySelectorAll('[data-nav]').forEach(btn => {
      const isActive = btn.dataset.nav === activeTab;
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
      btn.classList.toggle('nav-btn--active', isActive);
    });
  },

  // ── Popstate (device back gesture) ────────────────────────────────────────

  _setupPopstate() {
    // Seed initial history entry
    history.pushState({ view: 'today' }, '', '#today');

    window.addEventListener('popstate', e => {
      // Re-push to prevent stack emptying
      const view = e.state?.view || 'today';
      history.pushState({ view }, '', `#${view}`);

      // Navigate internally
      this.back();
    });
  },
};
