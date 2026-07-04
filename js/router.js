/**
 * router.js
 * 04 Jul 2026 v8
 *
 * v8 — S3 fix. VIEW_NAMES['goal-setup'] pointed to './views/goal-setup.js',
 *   but the actual file's own header confirms it lives at
 *   './views/onboarding/goal-setup.js' — one folder off. This was the
 *   exact 404 in console ("GET .../js/views/goal-setup.js net::ERR_ABORTED
 *   404") triggered by "Choose my programme" / "Change programme" in
 *   Settings. Corrected the path. fn stays 'GoalSetupView' — the actual
 *   file exports render()/onMount() (old pattern), which _mountView()
 *   already falls back to correctly once the import itself succeeds, so
 *   no other change needed here.
 *   Separately noted, not fixed here: console also shows "Router: unknown
 *   view 'onboarding/lifestyle' — falling back to today" — this route was
 *   deliberately retired in v7 (OB-THREAD), so something is still calling
 *   navigate('onboarding/lifestyle') from a stale reference. Harmless
 *   (graceful fallback, no crash) but worth finding the caller in a future
 *   session — not diagnosed yet, don't have the calling file.
 *
 * v7 — OB-THREAD. Added onboarding/thread route. Removed retired onboarding
 *   routes from VIEW_NAMES and hideNavViews: arrival, hard-before, reflection,
 *   complete, frequency, plan-select, welcome, name, about, body, lifestyle,
 *   goal-setup (onboarding variant).
 *   onboarding/goals, conditions, equipment kept — reused as sheet content
 *   by sheet-manager.js (dynamically imported, not router-navigated).
 *   First-route logic updated in app.js v6 — router.js unchanged beyond
 *   the VIEW_NAMES and hideNavViews updates.
 *
 * v6 — Scroll reset on every view mount: window.scrollTo(0,0) called
 *   immediately after container.innerHTML is set, before focus management.
 *
 * v5 — Added onboarding/frequency and onboarding/plan-select routes.
 * v4 — Dual-pattern view support.
 * v3 — 24 Jun 2026. All Phase 5 routes.
 * v2 — 22 May 2026. history.pushState, popstate, all missing routes.
 * v1 — Initial router.
 */

const VIEW_NAMES = {

  // ── Onboarding ─────────────────────────────────────────────────────────────
  // OB-THREAD: single entry point. Replaces all previous onboarding screens.
  'onboarding/thread':  { path: './views/onboarding/thread.js',      fn: 'ThreadView'               },

  // Kept for sheet-manager.js dynamic imports — not router-navigated directly.
  // Do not remove: sheet-manager.js imports these via import() not router.navigate().
  'onboarding/goals':       { path: './views/onboarding/goals.js',       fn: 'GoalsView'        },
  'onboarding/conditions':  { path: './views/onboarding/conditions.js',  fn: 'ConditionsView'   },
  'onboarding/equipment':   { path: './views/onboarding/equipment.js',   fn: 'EquipmentView'    },
  'onboarding/plan-select': { path: './views/onboarding/plan-select.js', fn: 'PlanSelectView'   },

  // ── Core daily flow ────────────────────────────────────────────────────────
  'today':             { path: './views/today.js',            fn: 'TodayView'           },
  'checkin':           { path: './views/checkin.js',          fn: 'CheckinView'         },
  'checkin-mini':      { path: './views/checkin-mini.js',     fn: 'CheckinMiniView'     },
  'coach-reflection':  { path: './views/coach-reflection.js', fn: 'CoachReflectionView' },
  'coach-proposal':    { path: './views/coach-proposal.js',   fn: 'CoachProposalView'   },
  'home-threshold':    { path: './views/home-threshold.js',   fn: 'HomeThresholdView'   },
  'intention':         { path: './views/intention.js',        fn: 'IntentionView'       },
  'reflect':           { path: './views/reflect.js',          fn: 'ReflectView'         },

  // ── Main views ─────────────────────────────────────────────────────────────
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
  'goal-setup':        { path: './views/onboarding/goal-setup.js', fn: 'GoalSetupView'  },
  'community-impact':  { path: './views/community-impact.js', fn: 'CommunityImpactView' },
  'annual-reflection': { path: './views/annual-reflection.js',fn: 'AnnualReflectionView'},

  // ── Session builder ────────────────────────────────────────────────────────
  'session-builder':   { path: './views/session-builder.js',  fn: 'SessionBuilderView'  },

  // ── Session views ──────────────────────────────────────────────────────────
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
  // OB-THREAD and its sheet views
  'onboarding/thread',
  'onboarding/goals', 'onboarding/conditions',
  'onboarding/equipment', 'onboarding/plan-select',
  // Core flow (no nav)
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
  viewCache:   {},

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
      if (!this.viewCache[viewName]) {
        const { path } = VIEW_NAMES[viewName];
        this.viewCache[viewName] = await import(path);
      }

      const mod = this.viewCache[viewName];
      const { fn } = VIEW_NAMES[viewName];

      // ── New pattern ───────────────────────────────────────────────────────
      if (typeof mod[fn] === 'function') {
        const view = mod[fn](this);
        container.innerHTML = '';
        window.scrollTo(0, 0);
        view.mount(container);

      // ── Old pattern ───────────────────────────────────────────────────────
      } else if (typeof mod.render === 'function') {
        container.innerHTML = mod.render();
        window.scrollTo(0, 0);
        if (typeof mod.onMount === 'function') {
          mod.onMount();
        }

      } else {
        throw new Error(`View factory for "${viewName}" is not a function`);
      }

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
