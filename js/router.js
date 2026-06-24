/**
 * router.js
 * 24 Jun 2026 v4
 *
 * v4 — Dual-pattern view support.
 *   The existing views (checkin.js, coach-proposal.js, intention.js etc.)
 *   use the OLD pattern: export function render() + export function onMount().
 *   The new Phase 5 views use the NEW pattern: export function XxxView(router)
 *   returning { mount(container) }.
 *   v3 only supported the new pattern — breaking every existing view.
 *   v4 detects which pattern each module uses and calls it correctly.
 *   Both patterns coexist indefinitely. Views are migrated to the new
 *   pattern only when they are rewritten for functional reasons.
 *
 *   Old pattern detection: module.render is a function.
 *   New pattern detection: module[fn] is a function.
 *
 *   viewCache now stores the whole module, not just module[fn].
 *
 * v3 — 24 Jun 2026. All Phase 5 routes. main-content ID confirmed.
 * v2 — 22 May 2026. history.pushState, popstate, all missing routes.
 * v1 — Initial router.
 */

const VIEW_NAMES = {

  // Onboarding
  'welcome':                { path: './views/onboarding/welcome.js',      fn: 'WelcomeView'              },
  'onboarding/name':        { path: './views/onboarding/name.js',         fn: 'NameView'                 },
  'onboarding/about':       { path: './views/onboarding/about.js',        fn: 'AboutView'                },
  'onboarding/body':        { path: './views/onboarding/body.js',         fn: 'BodyView'                 },
  'onboarding/goals':       { path: './views/onboarding/goals.js',        fn: 'GoalsView'                },
  'onboarding/conditions':  { path: './views/onboarding/conditions.js',   fn: 'ConditionsView'           },
  'onboarding/lifestyle':   { path: './views/onboarding/lifestyle.js',    fn: 'LifestyleView'            },
  'onboarding/equipment':   { path: './views/onboarding/equipment.js',    fn: 'EquipmentView'            },
  'onboarding/goal-setup':  { path: './views/onboarding/goal-setup.js',   fn: 'GoalSetupView'            },
  'onboarding/complete':    { path: './views/onboarding/complete.js',      fn: 'CompleteView'             },
  'onboarding/arrival':     { path: './views/onboarding/arrival.js',      fn: 'ArrivalView'              },
  'onboarding/hard-before': { path: './views/onboarding/hard-before.js',  fn: 'HardBeforeView'           },
  'onboarding/reflection':  { path: './views/onboarding/reflection.js',   fn: 'OnboardingReflectionView' },

  // Core daily flow
  'today':             { path: './views/today.js',            fn: 'TodayView'           },
  'checkin':           { path: './views/checkin.js',          fn: 'CheckinView'         },
  'checkin-mini':      { path: './views/checkin-mini.js',     fn: 'CheckinMiniView'     },
  'coach-reflection':  { path: './views/coach-reflection.js', fn: 'CoachReflectionView' },
  'coach-proposal':    { path: './views/coach-proposal.js',   fn: 'CoachProposalView'   },
  'home-threshold':    { path: './views/home-threshold.js',   fn: 'HomeThresholdView'   },
  'intention':         { path: './views/intention.js',        fn: 'IntentionView'       },
  'reflect':           { path: './views/reflect.js',          fn: 'ReflectView'         },

  // Main views
  'progress':          { path: './views/progress.js',         fn: 'ProgressView'        },
  'settings':          { path: './views/settings.js',         fn: 'SettingsView'        },
  'weekly-plan':       { path: './views/weekly-plan.js',      fn: 'WeeklyPlanView'      },
  'noticing':          { path: './views/noticing.js',         fn: 'NoticingView'        },
  'journal-entry':     { path: './views/journal-entry.js',    fn: 'JournalEntryView'    },
  'activity-log':      { path: './views/activity-log.js',     fn: 'ActivityLogView'     },
  'library':           { path: './views/library.js',          fn: 'LibraryView'         },
  'about':             { path: './views/about.js',            fn: 'AboutView'           },
  'privacy':           { path: './views/privacy.js',          fn: 'PrivacyView'         },
  'upgrade':           { path: './views/upgrade.js',          fn: 'UpgradeView'         },
  'goal-setup':        { path: './views/goal-setup.js',       fn: 'GoalSetupView'       },
  'community-impact':  { path: './views/community-impact.js', fn: 'CommunityImpactView' },
  'annual-reflection': { path: './views/annual-reflection.js',fn: 'AnnualReflectionView'},

  // Session builder
  'session-builder':   { path: './views/session-builder.js',  fn: 'SessionBuilderView'  },

  // Session views
  'workout':            { path: './views/workout.js',           fn: 'WorkoutView'           },
  'gym-programme':      { path: './views/gym-programme.js',     fn: 'GymProgrammeView'      },
  'morning-session':    { path: './views/morning-session.js',   fn: 'MorningSessionView'    },
  'core-session':       { path: './views/core-session.js',      fn: 'CoreSessionView'       },
  'yoga-session':       { path: './views/yoga-session.js',      fn: 'YogaSessionView'       },
  'walk-session':       { path: './views/walk-session.js',      fn: 'WalkSessionView'       },
  'running-session':    { path: './views/running-session.js',   fn: 'RunningSessionView'    },
  'cycle-session':      { path: './views/cycle-session.js',     fn: 'CycleSessionView'      },
  'swim-session':       { path: './views/swim-session.js',      fn: 'SwimSessionView'       },
  'quiet-session':      { path: './views/quiet-session.js',     fn: 'QuietSessionView'      },
  'breathing-session':  { path: './views/breathing-session.js', fn: 'BreathingSessionView'  },
  'prescribed':         { path: './views/prescribed.js',        fn: 'PrescribedView'        },
  'prescribed-session': { path: './views/prescribed-session.js',fn: 'PrescribedSessionView' },
};

const hideNavViews = new Set([
  'welcome',
  'onboarding/name', 'onboarding/about', 'onboarding/body', 'onboarding/goals',
  'onboarding/conditions', 'onboarding/lifestyle', 'onboarding/equipment',
  'onboarding/goal-setup', 'onboarding/complete',
  'onboarding/arrival', 'onboarding/hard-before', 'onboarding/reflection',
  'home-threshold', 'community-impact', 'annual-reflection',
  'checkin', 'checkin-mini', 'coach-reflection', 'coach-proposal',
  'workout', 'gym-programme', 'morning-session', 'core-session',
  'yoga-session', 'walk-session', 'running-session', 'cycle-session',
  'swim-session', 'quiet-session', 'breathing-session',
  'prescribed', 'prescribed-session', 'session-builder',
  'reflect', 'journal-entry', 'privacy', 'upgrade',
]);

const NAV_MAP = {
  'today': 'today', 'checkin': 'today', 'checkin-mini': 'today',
  'coach-reflection': 'today', 'coach-proposal': 'today',
  'home-threshold': 'today', 'intention': 'today', 'reflect': 'today',
  'workout': 'today', 'gym-programme': 'today', 'morning-session': 'today',
  'core-session': 'today', 'yoga-session': 'today', 'walk-session': 'today',
  'running-session': 'today', 'cycle-session': 'today', 'swim-session': 'today',
  'quiet-session': 'today', 'breathing-session': 'today',
  'prescribed': 'today', 'prescribed-session': 'today', 'session-builder': 'today',
  'progress': 'progress', 'weekly-plan': 'progress',
  'noticing': 'noticing', 'journal-entry': 'noticing', 'library': 'noticing',
  'settings': 'settings', 'about': 'settings', 'privacy': 'settings',
  'upgrade': 'settings', 'goal-setup': 'settings',
  'community-impact': 'settings', 'annual-reflection': 'settings',
};

export const router = {

  currentView: null,
  history:     [],
  viewCache:   {},  // stores whole module, not just named export

  init() {
    this._setupPopstate();
    this._setupNavButtons();
  },

  async navigate(viewName) {
    if (!VIEW_NAMES[viewName]) {
      console.warn(`Router: unknown view "${viewName}" — falling back to today`);
      viewName = 'today';
    }

    history.pushState({ view: viewName }, '', `#${viewName}`);

    if (this.currentView && this.currentView !== viewName) {
      this.history.push(this.currentView);
      if (this.history.length > 20) this.history.shift();
    }

    this.currentView = viewName;
    await this._mountView(viewName);
  },

  back() {
    const prev = this.history.pop();
    this.navigate(prev || 'today');
  },

  async _mountView(viewName) {
    const container = document.getElementById('main-content');
    if (!container) return;

    // Nav bar visibility
    const nav = document.getElementById('bottom-nav');
    if (nav) {
      if (hideNavViews.has(viewName)) {
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }
    }

    this._setActiveNav(viewName);

    try {
      // Load module if not cached
      if (!this.viewCache[viewName]) {
        const { path } = VIEW_NAMES[viewName];
        this.viewCache[viewName] = await import(path);
      }

      const mod = this.viewCache[viewName];
      const { fn } = VIEW_NAMES[viewName];

      // ── New pattern: module exports a named factory function ──────────────
      // e.g. export function TodayView(router) { return { mount(container) {} } }
      if (typeof mod[fn] === 'function') {
        const view = mod[fn](this);
        container.innerHTML = '';
        view.mount(container);

      // ── Old pattern: module exports render() + onMount() ──────────────────
      // e.g. export function render() { return '<html>' }
      //      export function onMount() { /* wire events */ }
      } else if (typeof mod.render === 'function') {
        container.innerHTML = mod.render();
        if (typeof mod.onMount === 'function') {
          mod.onMount();
        }

      } else {
        throw new Error(`View factory for "${viewName}" is not a function`);
      }

      // Focus management for screen readers
      container.setAttribute('tabindex', '-1');
      container.focus({ preventScroll: false });
      setTimeout(() => container.removeAttribute('tabindex'), 100);

    } catch (err) {
      console.error(`Router: failed to mount view "${viewName}"`, err);
      container.innerHTML = `
        <div class="router-error" role="alert">
          <p>Something went wrong loading this page.</p>
          <button onclick="App.router.navigate('today')" class="btn btn-primary">
            Go home
          </button>
        </div>
      `;
    }
  },

  _setupNavButtons() {
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.nav;
        if (target) this.navigate(target);
      });
    });
  },

  _setActiveNav(viewName) {
    const activeTab = NAV_MAP[viewName] || null;
    document.querySelectorAll('[data-nav]').forEach(btn => {
      const isActive = btn.dataset.nav === activeTab;
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
      btn.classList.toggle('active', isActive);
    });
  },

  _setupPopstate() {
    history.pushState({ view: 'today' }, '', '#today');
    window.addEventListener('popstate', e => {
      const view = e.state?.view || 'today';
      history.pushState({ view }, '', `#${view}`);
      this.back();
    });
  },
};
