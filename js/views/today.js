/**
 * today.js
 * 04 Aug 2026 v5
 *
 * v5 — Phase C, Home Nav & Conditions Redesign (blueprint
 *   alongside_blueprint_home-navigation-conditions_04aug2026_v1.md).
 *   Replaced the single "Check in" CTA + gated funnel with six always-
 *   visible doors: Cardio/Core/Strength, Mobility & Conditioning,
 *   Wellbeing, Conditions Update, Progress, Unsure? Coach decides. No
 *   forced check-in gate before doors 1-3 — matches the spec's
 *   "zero-effort path" principle. Settings now reachable directly from
 *   Home (corner affordance), also per spec.
 *
 *   Behaviour change, deliberate: the old 'checked-in' state auto-
 *   redirected away from this screen to coach-reflection whenever a
 *   check-in existed for today — removed. Auto-redirecting away from
 *   Home contradicts "Home IS the doors UI"; the six doors now always
 *   show, with the coach line reflecting check-in/session status
 *   instead of the screen itself changing. The 'proposal-accepted'
 *   10-minute-window state is kept as-is — still needed for the
 *   "just tapped a door, backed out, came back" case.
 *
 *   Door routes, two are honest bridges pending later phases, flagged
 *   here and in the master schedule, not silently treated as final:
 *     - Cardio/Core/Strength -> session-builder (closest existing
 *       match to "coach pulls from full exercise range")
 *     - Mobility & Conditioning -> library (closest existing match;
 *       doesn't yet pull from a Conditions Update programme, since
 *       that's Phase D, not built)
 *     - Conditions Update -> onboarding/conditions (existing conditions
 *       editor) as a bridge until Phase D builds the real dedicated
 *       screen described in the spec
 *     - Wellbeing -> noticing, Progress -> progress, Unsure? Coach
 *       decides -> coach-proposal: all exact matches, no bridging
 *
 *   Real bug found and fixed while wiring Door 1: router.js's
 *   'session-builder' route pointed at a file that doesn't exist
 *   (./views/session-builder.js — the real file is session-builder-
 *   ui.js). That route could never have worked, on any device, until
 *   this fix (router.js, same session).
 *
 * 21 Jul 2026 v4 — Proposal-loop fix (navfix-proposalloop session).
 *   _resolveState() checked 'proposal-accepted' before 'session-done',
 *   so completing a full session within 10 minutes of accepting a
 *   proposal could strand the user on the Coach Proposal/threshold
 *   screen instead of "You moved today," even though the activityLog
 *   entry was correctly saved. Reordered: session-done (a real,
 *   concrete completed-today signal) is now checked first, and always
 *   wins over the 10-minute proposal-accepted window. The genuine
 *   "just accepted, haven't started, backed out within 10 minutes with
 *   nothing completed" case is unaffected — sessionToday is false in
 *   that case, so it still correctly falls through to proposal-accepted.
 *   No other logic in this file changed.
 *
 * v3 (26 Jun 2026): Name capitalisation fix — _cap() helper added.
 *   _buildGreeting() and renderSessionDone() now capitalise stored name.
 *
 * v2 — Phase 5:
 *   - Routes to home-threshold after proposal accepted (not directly to session)
 *   - home-threshold.js is the threshold moment between choosing and beginning
 *   - If home-threshold.js is not yet deployed (content gate D3), routes
 *     directly to the session as before — graceful fallback, no breakage
 *   - Reads lastProposalDate to detect when a proposal has just been accepted
 *   - Reads activityLog to detect if a session was completed today
 *     (second-session path: mini check-in, then coach-reflection)
 *   - Week advance check on mount (Monday detection)
 *
 * v1 behaviour preserved:
 *   - Greeting based on time of day and name
 *   - "Check in" CTA routes to checkin.js
 *   - Already checked in today: routes to coach-reflection (post-check-in hub)
 *   - Session completed today: shows "good work" state with gentle options
 *   - Nav bar visible
 *
 * WCAG 2.2 AA:
 *   Main CTA: minimum 44px touch target, descriptive aria-label.
 *   Greeting is an <h1>. All coach text rendered as <p>.
 *   "Already moved today" state: role="status" on coach acknowledgement.
 *   All states have text — nothing conveyed by colour alone.
 */

import { store }               from '../store.js';
import { advanceWeekIfNeeded } from '../data/programmeEngine.js';

export function TodayView(router) {

  // ── Six Home doors (04 Aug 2026, Phase C) ────────────────────────────────
  const HOME_DOORS = [
    { id: 'cardio-core-strength', label: 'Cardio, Core & Strength', icon: '\uD83D\uDCAA', route: 'session-builder' },
    { id: 'mobility-conditioning', label: 'Mobility & Conditioning', icon: '\uD83E\uDDD8', route: 'library' },
    { id: 'wellbeing', label: 'Wellbeing', icon: '\uD83C\uDF3F', route: 'noticing' },
    { id: 'conditions-update', label: 'Conditions Update', icon: '\uD83E\uDE79', route: 'onboarding/conditions' },
    { id: 'progress', label: 'Progress', icon: '\uD83D\uDCCA', route: 'progress' },
    { id: 'unsure', label: 'Unsure? Coach decides', icon: '\uD83C\uDFAF', route: 'coach-proposal' },
  ];

  function mount(container) {
    advanceWeekIfNeeded();
    const state = _resolveState();

    if (state === 'proposal-accepted') {
      _routeToThreshold();
      return;
    }

    renderHome(container);
  }

  function _resolveState() {
    const today        = _todayString();
    const lastProposal = store.get('lastProposalDate');

    // Session already completed today takes priority — never route to a
    // pending proposal if there's nothing pending.
    if (_sessionCompletedToday()) return 'default';

    if (lastProposal) {
      const proposalDate = new Date(lastProposal);
      const minsAgo      = (Date.now() - proposalDate.getTime()) / 60000;
      if (proposalDate.toISOString().split('T')[0] === today && minsAgo < 10) {
        return 'proposal-accepted';
      }
    }

    return 'default';
  }

  function _sessionCompletedToday() {
    const today       = _todayString();
    const activityLog = store.get('activityLog') || [];
    return activityLog.some(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts).toISOString().split('T')[0] === today;
    });
  }

  function _checkedInToday() {
    const lastCheckin = store.get('lastCheckin.timestamp');
    return !!(lastCheckin && new Date(lastCheckin).toISOString().split('T')[0] === _todayString());
  }

  function _routeToThreshold() {
    const sessionRoute = store.get('lastProposalType')
      ? _doorToRoute(store.get('lastProposalType'))
      : null;
    try {
      router.navigate('home-threshold');
    } catch (e) {
      if (sessionRoute) {
        router.navigate(sessionRoute);
      } else {
        router.navigate('coach-proposal');
      }
    }
  }

  function _doorToRoute(doorKey) {
    const MAP = {
      'bypass-library':    'library',
      'bypass-facilitate': 'session-builder',
    };
    const generated = store.get('generatedSession');
    if (generated?.session?.type) {
      const TYPE_ROUTE = {
        'workout':         'workout',
        'gym-programme':   'gym-programme',
        'morning-session': 'morning-session',
        'yoga-session':    'yoga-session',
        'walk-session':    'walk-session',
        'running-session': 'running-session',
        'cycle-session':   'cycle-session',
        'swim-session':    'swim-session',
        'core-session':    'core-session',
        'quiet-session':   'quiet-session',
      };
      return TYPE_ROUTE[generated.session.type] || 'workout';
    }
    return MAP[doorKey] || 'workout';
  }

  function renderHome(container) {
    const name          = store.get('name') || '';
    const greeting      = _buildGreeting(name);
    const sessionDone   = _sessionCompletedToday();
    const coachLine     = sessionDone
      ? "You moved today \u2014 that's done. Tap in below any time if you'd like to do more."
      : _buildCoachLine();
    const weeklyTarget  = store.get('strategicGoal.weeklySessionTarget') || 3;
    const sessionCount  = _sessionsThisWeek();

    container.innerHTML = `
      <div class="today-view" role="main" aria-label="Today">

        <button class="today-settings-link" data-action="settings"
                aria-label="Settings">
          <span aria-hidden="true">\u2699\uFE0F</span>
        </button>

        <header class="today-header">
          <h1 class="today-greeting">${_esc(greeting)}</h1>
          ${coachLine ? `<p class="today-coach-line" role="status">${_esc(coachLine)}</p>` : ''}
        </header>

        ${sessionCount > 0 ? `
          <div class="today-week-count"
               role="status"
               aria-label="${sessionCount} of ${weeklyTarget} sessions this week">
            <span class="today-week-count__number">${sessionCount}</span>
            <span class="today-week-count__label">of ${weeklyTarget} this week</span>
          </div>
        ` : ''}

        <div class="today-doors" role="group" aria-label="Choose how you want to move today">
          ${HOME_DOORS.map(d => `
            <button class="today-door ${d.id === 'unsure' ? 'today-door--unsure' : ''}"
                    data-route="${d.route}"
                    aria-label="${_esc(d.label)}">
              <span class="today-door__icon" aria-hidden="true">${d.icon}</span>
              <span class="today-door__label">${_esc(d.label)}</span>
            </button>
          `).join('')}
        </div>

        ${!_checkedInToday() ? `
          <button class="btn btn-ghost today-checkin-link" data-action="checkin"
                  aria-label="Check in — helps every door adapt to how you're doing today">
            Check in
          </button>
        ` : ''}

      </div>
    `;

    attachEvents(container);
  }

  function attachEvents(container) {
    container.querySelectorAll('[data-route]').forEach(btn => {
      btn.addEventListener('click', () => router.navigate(btn.dataset.route));
    });

    const actions = {
      'checkin':  () => router.navigate('checkin'),
      'settings': () => router.navigate('settings'),
    };

    container.querySelectorAll('[data-action]').forEach(btn => {
      const action = btn.dataset.action;
      if (actions[action]) {
        btn.addEventListener('click', actions[action]);
      }
    });
  }

  function _buildGreeting(name) {
    const timeGreet = _timeGreeting();
    const capName   = _cap(name);
    return capName ? `${timeGreet}, ${capName}.` : `${timeGreet}.`;
  }

  function _buildCoachLine() {
    const activityLog    = store.get('activityLog') || [];
    const checkinHistory = store.get('checkinHistory') || {};
    const yesterday      = _yesterdayString();

    const yesterdaySessions = activityLog.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts).toISOString().split('T')[0] === yesterday;
    });

    if (yesterdaySessions.length > 0) {
      const type = yesterdaySessions[0].type || 'session';
      const TYPE_LABELS = {
        'workout':         'strength work',
        'morning-session': 'movement',
        'yoga-session':    'yoga',
        'walk-session':    'a walk',
        'running-session': 'a run',
        'cycle-session':   'cycling',
        'swim-session':    'swimming',
        'core-session':    'core work',
        'quiet-session':   'breathing',
        'gym-programme':   'a gym session',
      };
      const label = TYPE_LABELS[type] || 'movement';
      return `You did ${label} yesterday.`;
    }

    const recentCheckins = Object.keys(checkinHistory)
      .filter(d => d >= _daysAgoString(7))
      .length;

    if (recentCheckins >= 5) return "You've been showing up.";

    return null;
  }

  function _timeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  function _sessionsThisWeek() {
    const activityLog = store.get('activityLog') || [];
    const monday      = _mondayString();
    return activityLog.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts).toISOString().split('T')[0] >= monday;
    }).length;
  }

  function _todayString() {
    return new Date().toISOString().split('T')[0];
  }

  function _yesterdayString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  function _daysAgoString(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }

  function _mondayString() {
    const d    = new Date();
    const day  = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  }

  function _cap(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { mount };
}
