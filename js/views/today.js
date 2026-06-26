/**
 * today.js
 * 26 Jun 2026 v3
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

  function mount(container) {
    advanceWeekIfNeeded();
    const state = _resolveState();

    switch (state) {
      case 'proposal-accepted':
        _routeToThreshold();
        return;
      case 'session-done':
        renderSessionDone(container);
        break;
      case 'checked-in':
        router.navigate('coach-reflection');
        return;
      default:
        renderDefault(container);
        break;
    }
  }

  function _resolveState() {
    const today        = _todayString();
    const lastProposal = store.get('lastProposalDate');
    const lastCheckin  = store.get('lastCheckin.timestamp');
    const activityLog  = store.get('activityLog') || [];

    if (lastProposal) {
      const proposalDate = new Date(lastProposal);
      const minsAgo      = (Date.now() - proposalDate.getTime()) / 60000;
      if (proposalDate.toISOString().split('T')[0] === today && minsAgo < 10) {
        return 'proposal-accepted';
      }
    }

    const sessionToday = activityLog.some(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts).toISOString().split('T')[0] === today;
    });
    if (sessionToday) return 'session-done';

    if (lastCheckin && new Date(lastCheckin).toISOString().split('T')[0] === today) {
      return 'checked-in';
    }

    return 'default';
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

  function renderDefault(container) {
    const name         = store.get('name') || '';
    const greeting     = _buildGreeting(name);
    const coachLine    = _buildCoachLine();
    const weeklyTarget = store.get('strategicGoal.weeklySessionTarget') || 3;
    const sessionCount = _sessionsThisWeek();

    container.innerHTML = `
      <div class="today-view" role="main" aria-label="Today">

        <header class="today-header">
          <h1 class="today-greeting">${_esc(greeting)}</h1>
          ${coachLine ? `<p class="today-coach-line">${_esc(coachLine)}</p>` : ''}
        </header>

        ${sessionCount > 0 ? `
          <div class="today-week-count"
               role="status"
               aria-label="${sessionCount} of ${weeklyTarget} sessions this week">
            <span class="today-week-count__number">${sessionCount}</span>
            <span class="today-week-count__label">of ${weeklyTarget} this week</span>
          </div>
        ` : ''}

        <div class="today-cta-block">
          <button class="btn btn-primary today-checkin-btn"
                  data-action="checkin"
                  aria-label="Check in and get today's session">
            Check in
          </button>
        </div>

        <div class="today-secondary-actions">
          <button class="btn btn-ghost today-secondary-btn"
                  data-action="noticing"
                  aria-label="Go to the noticing hub">
            Noticing
          </button>
          <button class="btn btn-ghost today-secondary-btn"
                  data-action="library"
                  aria-label="Open the practice library">
            Library
          </button>
        </div>

      </div>
    `;

    attachEvents(container);
  }

  function renderSessionDone(container) {
    const name      = store.get('name') || '';
    const timeGreet = _timeGreeting();

    container.innerHTML = `
      <div class="today-view today-view--done" role="main" aria-label="Today">

        <header class="today-header">
          <h1 class="today-greeting">${_esc(timeGreet)}${name ? ', ' + _esc(_cap(name)) : ''}.</h1>
          <p class="today-coach-line" role="status">
            You moved today. That's done.
          </p>
        </header>

        <div class="today-secondary-actions">
          <button class="btn btn-ghost today-secondary-btn"
                  data-action="noticing"
                  aria-label="Go to the noticing hub">
            Noticing
          </button>
          <button class="btn btn-ghost today-secondary-btn"
                  data-action="library"
                  aria-label="Open the practice library — breathing, meditation">
            Library
          </button>
          <button class="btn btn-ghost today-secondary-btn"
                  data-action="progress"
                  aria-label="See your progress">
            Progress
          </button>
        </div>

        <div class="today-second-session">
          <button class="btn btn-ghost today-second-session-btn"
                  data-action="second-session"
                  aria-label="I want to move again today">
            I want to move again
          </button>
        </div>

      </div>
    `;

    attachEvents(container);
  }

  function attachEvents(container) {
    const actions = {
      'checkin':        () => router.navigate('checkin'),
      'noticing':       () => router.navigate('noticing'),
      'library':        () => router.navigate('library'),
      'progress':       () => router.navigate('progress'),
      'second-session': () => router.navigate('checkin-mini'),
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
