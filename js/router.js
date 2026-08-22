/**
 * router.js
 * 22 Aug 2026 v21
 *   CHOOSER-1. The 'goal-setup' route now resolves to
 *   views/programme-select.js. The old target,
 *   views/onboarding/goal-setup.js, had NEVER LOADED -- it statically
 *   imported { programmeEngine }, a symbol programmeEngine.js does not
 *   export, so it was a link-time SyntaxError. Five call sites reached
 *   it, including the chapter-end hinge fallback at today.js:734.
 *
 *   The ROUTE KEY IS DELIBERATELY UNCHANGED so those five call sites
 *   need no edit -- one of them is today.js, already scheduled for R2-a,
 *   and touch-once exists to stop two sessions editing one file.
 *   Renaming the key is tracked as CHOOSER-2.
 *
 * 18 Aug 2026 v20
 *   ONUNMOUNT-1. navigate() now calls onUnmount() on the outgoing
 *   view. It never did, despite two view headers saying it does.
 *   quiet-session.js and breathing-session.js both left timers
 *   running against a dead DOM.
 *
 * 18 Aug 2026 v19
 *   PRAC-1. New 'practices' route: the guided practice library. Nav
 *   hidden, mapped to Today because the Library is its door.
 *
 * 16 Aug 2026 v18
 *   BIAS-2. The 'coach-reflection' route and view are removed. Graeme
 *   confirmed the screen obsolete on 04 Aug; the file stayed because it
 *   was the last remaining definition of proposalBias. That logic now
 *   lives in checkin.js as a derived value, so the file has nothing
 *   left to hold.
 *
 * 16 Aug 2026 v17
 *
 * v17 - CHAP-1 step 2. New route 'my-programme' -> my-programme.js
 *   (MyProgrammeView). NOT added to hideNavViews: this is a
 *   where-am-I-going screen, not an activity flow, so the bottom nav
 *   stays visible and somebody can leave it the same way they leave
 *   Progress. NAV_MAP entry 'today', because the only route to it is
 *   the full-width row on Home -- NAV-8's rule, that the tab must agree
 *   with how you got here.
 *
 * 13 Aug 2026 v16
 *
 * v16 - NAV-8. Two NAV_MAP entries pointed at the wrong tab, in
 *   opposite directions.
 *
 *   'library' -> 'noticing' meant opening the exercise Library
 *   highlighted the wellbeing tab. Already odd; TIER-F made it visibly
 *   worse the same day by renaming that tab to "Wellbeing". Now 'today'.
 *
 *   'quiet-session' and 'breathing-session' -> 'today' meant somebody
 *   inside a breathing practice, launched from the Wellbeing hub, was
 *   told they were on Today. Now 'noticing'.
 *
 *   The nav tab is the only persistent "where am I" signal in the
 *   product. When it disagrees with how you got somewhere it is worse
 *   than absent, because it is confidently wrong.
 *
 *   Also closes a flag open since 13 Jun 2026 ("noticing / noticing-hub
 *   possible duplicate VIEW_NAMES entries -- resolve whenever the
 *   Noticing Hub is next in scope"). Verified: there is one entry, not
 *   two. The duplicate was resolved at some point and the flag never was.
 *
 * 11 Aug 2026 v15
 *
 * Navigation audit, 11 Aug 2026. Three routes pointed at view files
 * that had never been written -- about, community-impact and
 * annual-reflection -- so the router believed they existed and anything
 * navigating there failed at import. 'about' removed (settings.js has a
 * working panel); the other two are now built.
 *
 * 09 Aug 2026 v14
 *
 * v14 — New route 'in-step' -> in-step.js (InStepView). Added to
 *   hideNavViews (activity flow, same treatment as journal-entry/
 *   breathing-session) and NAV_MAP (active tab: noticing).
 *
 * 04 Aug 2026 v13
 *
 * v13 — New route 'mobility-conditioning' -> mobility-conditioning.js
 *   (MobilityConditioningView). Replaces the today.js smart-routing
 *   hack (programme-or-Library) with a real landing screen, per
 *   Graeme's design: Start a Mobility Session / My Conditions
 *   Programme / Log an event.
 *
 * 04 Aug 2026 v12
 *
 * v12 — New route 'conditions-update' -> conditions-update.js
 *   (ConditionsUpdateView), Phase D-2/D-3 of the Home Nav & Conditions
 *   Redesign. Not added to hideNavViews — this is a management screen
 *   reached from Home, not a session flow, same treatment as 'settings'.
 *
 * 04 Aug 2026 v11
 *
 * v11 — Phase C, Home Nav & Conditions Redesign. Fixed a real,
 *   previously-undiscovered bug: the 'session-builder' route pointed
 *   at './views/session-builder.js', which does not exist — the real
 *   view file is session-builder-ui.js (js/session-builder.js, no
 *   "-ui" suffix, is a separate data/logic module that view imports
 *   from, not the view itself). import(path) would have thrown before
 *   ever reaching the old/new pattern detection — this route could
 *   never have worked, on any device, until now. Found while wiring
 *   Home's new "Cardio, Core & Strength" door to it.
 *
 * 28 Jul 2026 v10
 *
 * v10 — BUILD-3 follow-on fix, found during on-device back-gesture testing.
 *   _setupPopstate()'s handler ran on EVERY popstate event, including ones
 *   pushed by session-guard.js's mountSessionGuard() (state shape
 *   { sessionGuard: true }, no 'view' key). Because e.state?.view was
 *   undefined for those, this handler silently defaulted to 'today' and
 *   force-navigated there before session-guard.js's own listener (mounted
 *   separately, per session view) could show its confirmation card — so a
 *   real device back-gesture during an active session silently exited to
 *   Today with no card, no choice, and (depending on timing) no partial
 *   save. Fixed with a one-line early return when e.state?.sessionGuard is
 *   true, leaving session-guard.js's own listener to handle that event
 *   exclusively. No other change from v9.
 *
 * v9 — Nav escape-hatch (navfix-proposalloop session). _mountView() now
 *   also toggles #hidden-nav-home-btn's visibility using the exact same
 *   hideNavViews check used for the bottom nav — no new import, no new
 *   dependency. Click handling for the icon lives in app.js v7, not
 *   here, specifically to avoid a circular import (session-guard.js
 *   already imports router.js — router.js importing session-guard.js
 *   back would create a cycle). No other change from v8.
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
  'coach-proposal':    { path: './views/coach-proposal.js',   fn: 'CoachProposalView'   },
  'home-threshold':    { path: './views/home-threshold.js',   fn: 'HomeThresholdView'   },
  'intention':         { path: './views/intention.js',        fn: 'IntentionView'       },
  'reflect':           { path: './views/reflect.js',          fn: 'ReflectView'         },

  // ── Main views ─────────────────────────────────────────────────────────────
  'progress':          { path: './views/progress.js',         fn: 'ProgressView'        },
  'settings':          { path: './views/settings.js',         fn: 'SettingsView'        },
  'weekly-plan':       { path: './views/weekly-plan.js',      fn: 'WeeklyPlanView'      },
  'noticing':          { path: './views/noticing.js',         fn: 'NoticingView'        },
  'in-step':           { path: './views/in-step.js',          fn: 'InStepView'          },
  'journal-entry':     { path: './views/journal-entry.js',    fn: 'JournalEntryView'    },
  'activity-log':      { path: './views/activity-log.js',     fn: 'ActivityLogView'     },
  'library':           { path: './views/library.js',          fn: 'LibraryView'         },
  'my-programme':      { path: './views/my-programme.js',     fn: 'MyProgrammeView'     },
  // 'about' removed 11 Aug 2026. It pointed at a view file that had
  // never been written, while settings.js has had a working About panel
  // all along. Two Abouts would be two places to maintain the same
  // information and two chances for them to disagree.
  'privacy':           { path: './views/privacy.js',          fn: 'PrivacyView'         },
  'upgrade':           { path: './views/upgrade.js',          fn: 'UpgradeView'         },
  // Route key retained; implementation replaced. See v21 note above.
  'goal-setup':        { path: './views/programme-select.js', fn: 'ProgrammeSelectView' },
  'community-impact':  { path: './views/community-impact.js', fn: 'CommunityImpactView' },
  // 'annual-reflection' kept, and the view now exists. Graeme: "what if
  // I forget? Is it not worth just having it there from the start?" --
  // and he is right that removing it is a weak plan, because schedules
  // get archived. A broken route was not a reminder either; it did not
  // prompt anybody, it just failed. The view is now built and handles
  // having no year of data gracefully.
  'annual-reflection': { path: './views/annual-reflection.js',fn: 'AnnualReflectionView'},

  // ── Session builder ────────────────────────────────────────────────────────
  // fix, 04 Aug 2026 (Phase C): path pointed at './views/session-builder.js',
  // which does not exist — the real view file is session-builder-ui.js
  // (js/session-builder.js, no "-ui", is a separate data/logic module this
  // view imports from, not the view itself). This route has been broken
  // since whenever it was written; found while wiring Home's new doors to
  // it. import(path) would throw before ever reaching the old/new pattern
  // detection below, so this route could never have worked, on any device.
  'session-builder':   { path: './views/session-builder-ui.js',  fn: 'SessionBuilderView'  },
  'conditions-update': { path: './views/conditions-update.js',   fn: 'ConditionsUpdateView' },
  'mobility-conditioning': { path: './views/mobility-conditioning.js', fn: 'MobilityConditioningView' },

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
  'practices':          { path: './views/practices.js',        fn: 'PracticesView'         },
};

const hideNavViews = new Set([
  // OB-THREAD and its sheet views
  'onboarding/thread',
  'onboarding/goals', 'onboarding/conditions',
  'onboarding/equipment', 'onboarding/plan-select',
  // Core flow (no nav)
  'home-threshold', 'community-impact', 'annual-reflection',
  'checkin', 'checkin-mini', 'coach-proposal',
  'workout', 'gym-programme', 'morning-session', 'core-session',
  'yoga-session', 'walk-session', 'running-session', 'cycle-session',
  'swim-session', 'quiet-session', 'breathing-session',
  'prescribed', 'prescribed-session', 'session-builder',
  'reflect', 'journal-entry', 'privacy', 'upgrade', 'in-step',
  // PRAC-1. A practice is read start to finish; the nav bar is one
  // more thing on the screen while somebody is trying to settle.
  'practices',
]);

const NAV_MAP = {
  'today': 'today', 'checkin': 'today', 'checkin-mini': 'today',
  'coach-proposal': 'today',
  'home-threshold': 'today', 'intention': 'today', 'reflect': 'today',
  'workout': 'today', 'gym-programme': 'today', 'morning-session': 'today',
  'core-session': 'today', 'yoga-session': 'today', 'walk-session': 'today',
  'running-session': 'today', 'cycle-session': 'today', 'swim-session': 'today',
  // NAV-8, 13 Aug 2026. Moved from 'today'. Both are launched from the
  // Wellbeing hub (noticing.js's breathe and mindful-movement cards) and
  // exist nowhere else, so highlighting the Today tab while somebody is
  // inside a breathing practice told them they were somewhere they were
  // not. The nav tab is the only persistent "where am I" signal in the
  // product; when it disagrees with how you got here, it is worse than
  // absent.
  'quiet-session': 'noticing', 'breathing-session': 'noticing',
  'prescribed': 'today', 'prescribed-session': 'today', 'session-builder': 'today',
  'progress': 'progress', 'weekly-plan': 'progress',
  'noticing': 'noticing', 'journal-entry': 'noticing',
  'in-step': 'noticing',
  // NAV-8. 'library' moved from 'noticing' to 'today'. The Library is an
  // exercise surface reached from a Home door -- it holds every session
  // type, prescribed exercises and the programme. Mapping it to the
  // wellbeing tab was already odd; TIER-F made it worse the same day by
  // renaming that tab to "Wellbeing", so opening the exercise Library
  // now visibly highlighted "Wellbeing".
  'library': 'today',
  // PRAC-1. Reached from the Library, which maps to Today. Mapping it
  // to Wellbeing would repeat the NAV-8 fault from the other side --
  // the tab would disagree with the door somebody came through.
  'practices': 'today',
  // CHAP-1 step 2. Reached only from Home's full-width row.
  'my-programme': 'today',
  'settings': 'settings', 'privacy': 'settings',
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

    // ONUNMOUNT-1. Tear the outgoing view down before mounting the next.
    //
    // quiet-session.js's own header has said since 02 Jul that onUnmount
    // is "called by router.navigate() before leaving this view". It was
    // not. Nothing called it, here or anywhere — found 18 Aug while
    // building PRAC-1, by grepping for the caller rather than trusting
    // the comment. quiet-session.js and breathing-session.js both export
    // one and both rely on it to clear a running interval, so leaving
    // either mid-session left a timer ticking against a dead DOM.
    //
    // Guarded and swallowed: a view that throws on the way out must not
    // be able to strand somebody on the screen they are trying to leave.
    if (this.currentView && this.currentView !== viewName) {
      const outgoing = this.viewCache[this.currentView];
      if (outgoing && typeof outgoing.onUnmount === 'function') {
        try { outgoing.onUnmount(); }
        catch (err) { console.warn(`Router: onUnmount failed for "${this.currentView}"`, err); }
      }
    }

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

    // Nav escape-hatch icon — shown exactly on the screens where the
    // bottom nav is hidden. No import of session-guard.js here: this is
    // pure visibility toggling, click handling lives in app.js.
    const escapeBtn = document.getElementById('hidden-nav-home-btn');
    if (escapeBtn) {
      if (hideNavViews.has(viewName)) {
        escapeBtn.classList.remove('hidden');
      } else {
        escapeBtn.classList.add('hidden');
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
      if (e.state?.sessionGuard) return; // let session-guard.js handle its own state — 28 Jul 2026, fixes router.js silently overriding the back-gesture exit-guard card
      const view = e.state?.view || 'today';
      history.pushState({ view }, '', `#${view}`);
      this.back();
    });
  },
};
