/**
 * today.js
 * 04 Aug 2026 v12
 *
 * v12 — Mobility & Conditioning routes to its own real landing screen
 *   (mobility-conditioning.js) instead of the programme-or-Library
 *   smart-routing hack from v10/v11, which is fully removed. That
 *   screen handles the programme-or-not branching internally now, so
 *   the Home door tile's "Your programme" hint (v10) is also removed —
 *   redundant once the landing page itself shows programme state.
 *
 * 04 Aug 2026 v11
 *
 * v11 — Library added as its own Home door, same day. Graeme: "Don't
 *   we still want a library?" Real gap — once Mobility & Conditioning
 *   started smart-routing to the condition programme instead of
 *   Library whenever one exists, Library became unreachable from Home
 *   in that case. Library is broader than mobility/conditioning
 *   content anyway (every session type, prescribed exercises, coach
 *   recommends), so it gets its own door rather than only surfacing
 *   as a fallback. No CSS changes needed — the 2-column grid and
 *   "Unsure? Coach decides"'s existing full-width/underneath treatment
 *   both accommodate the extra tile automatically.
 *
 * 04 Aug 2026 v10
 *
 * v10 — Mobility & Conditioning door now genuinely pulls in the
 *   Conditions Update programme, per the original spec ("pulls in
 *   whatever the Conditions Update programme has built" / "reachable
 *   as its own programme within that door"). Checks for condition-
 *   tagged prescribedExercises entries specifically; routes to
 *   prescribed.js when one exists, falls back to Library exactly as
 *   before when there's nothing to pull in — no behaviour change for
 *   anyone without a condition programme. Door tile shows a small
 *   "Your programme" hint when this applies, so the routing isn't
 *   silent/surprising. Known small rough edge, not fixed: prescribed.js's
 *   own Back button returns to the general activity picker rather than
 *   Home when reached this way — pre-existing design on that screen,
 *   not introduced here, low-impact enough not to warrant a fix now.
 *
 * 04 Aug 2026 v9
 *
 * v9 — Check-in gating now genuinely optional, not fixed. Graeme:
 *   "today's check-in gating means you now hit check-in-mini every
 *   single time you do a second session in a day - we should fix this
 *   so it's optional not fixed." Session-generating doors now only
 *   force check-in the first time today (nothing to adapt around
 *   without it). Once checked in today, doors go straight to their
 *   destination — check-in-mini is voluntary now, via a new "Update
 *   check-in" link shown in place of the "Check in" link once already
 *   checked in.
 *
 * 04 Aug 2026 v8
 *
 * v8 — Conditions Update door now routes to the real screen
 *   ('conditions-update', Phase D-2/D-3) instead of the interim
 *   openSheet('onboarding/conditions') bridge from the previous
 *   version — that bridge is fully superseded now, removed along with
 *   the now-unused openSheet import.
 *
 * 04 Aug 2026 v7
 *
 * v7 — Real bug found while scoping Phase D, fixed immediately rather
 *   than left broken until Phase D lands. Conditions Update door was
 *   calling router.navigate('onboarding/conditions') directly — the
 *   exact bug settings.js v9 already found and fixed once (its own
 *   changelog documents it): that view is built for onboarding, with
 *   Back/Continue hardcoded to onboarding-sequence destinations, so a
 *   direct navigate() there loses the bottom nav and Back leads
 *   somewhere nonsensical. Same fix as settings.js: openSheet() from
 *   sheet-manager.js instead, which intercepts the hardcoded
 *   navigate() and just closes the sheet. Interim only — Phase D
 *   replaces this bridge with a real Conditions Update screen.
 *
 * 04 Aug 2026 v6
 *
 * v6 — Graeme's on-device pass, same day as Phase C. Session-generating
 *   doors (Cardio/Core/Strength, Unsure? Coach decides) now route
 *   through check-in first — full check-in if not done today, check-in-
 *   mini if already done — before their real destination, via the new
 *   pendingDoorRoute store field. Reaching session-builder or
 *   coach-proposal without ever checking in defeated the whole point
 *   of those doors adapting to "where you are today." The other four
 *   doors (Mobility & Conditioning, Wellbeing, Conditions Update,
 *   Progress) are informational/self-directed, not generative, and
 *   stay ungated — worth Graeme confirming that split is what he meant.
 *
 * 04 Aug 2026 v5 — Phase C, Home Nav & Conditions Redesign (blueprint
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

  // ── Home doors (04 Aug 2026, Phase C, now 7 items) ───────────────────────
  // requiresCheckin: true for doors whose whole value depends on knowing
  // today's state (energy, pain, equipment) — these route through
  // check-in (full the first time today, check-in-mini after) before
  // their real destination. Graeme's call, 04 Aug: reaching a session-
  // generating screen without ever having checked in defeats the point
  // of it adapting to "where you are today." Applied to the two doors
  // that actually generate an adaptive session (Cardio/Core/Strength,
  // Unsure? Coach decides) — confirmed by Graeme as the right split.
  //
  // Mobility & Conditioning routes to its own landing screen
  // (mobility-conditioning.js, same day follow-up), which handles the
  // programme-or-not branching internally now — Start a Mobility
  // Session / My Conditions Programme / Log an event. Supersedes the
  // earlier smart-routing hack that lived in attachEvents() below
  // (programme-or-Library), which is now removed.
  //
  // Library added as its own door, same day: once Mobility &
  // Conditioning started smart-routing to the programme instead of
  // Library whenever one exists, Library stopped being reachable from
  // Home at all in that case — a real discoverability regression
  // Graeme caught. Library is broader than mobility/conditioning
  // content anyway (every session type, prescribed exercises, coach
  // recommends), so it earns its own door rather than only being
  // reachable as Mobility & Conditioning's fallback. "Unsure? Coach
  // decides" keeps its existing distinct treatment — spans both grid
  // columns, dashed border, sits visually underneath the rest — not
  // counted as one of the "real" doors, exactly as before.
  const HOME_DOORS = [
    { id: 'cardio-core-strength', label: 'Cardio, Core & Strength', icon: '\uD83D\uDCAA', route: 'session-builder', requiresCheckin: true },
    { id: 'mobility-conditioning', label: 'Mobility & Conditioning', icon: '\uD83E\uDDD8', route: 'mobility-conditioning', requiresCheckin: false },
    // NAV-3, 12 Aug 2026. Graeme, device pass part 4: "Yoga was not easy
    // to find... Can the yoga/pilates door be offered in multiple places
    // as well?"
    //
    // He looked in Cardio/Core/Strength, then Mobility & Conditioning,
    // then Wellbeing, then Library. Yoga lives inside Mobility &
    // Conditioning, which is a reasonable place for it and not a
    // findable one -- somebody looking for yoga is not looking for
    // "conditioning".
    //
    // A second door is the right answer rather than moving it. The same
    // thing being reachable from more than one place is how people
    // actually navigate; insisting on one true location is a filing
    // system, not a product. Mobility & Conditioning keeps its route in.
    { id: 'yoga', label: 'Yoga & Pilates', icon: '\uD83E\uDDD8\u200D\u2640\uFE0F', route: 'yoga-session', requiresCheckin: false },
    { id: 'wellbeing', label: 'Wellbeing', icon: '\uD83C\uDF3F', route: 'noticing', requiresCheckin: false },
    { id: 'conditions-update', label: 'Conditions Update', icon: '\uD83E\uDE79', route: 'conditions-update', requiresCheckin: false },
    { id: 'progress', label: 'Progress', icon: '\uD83D\uDCCA', route: 'progress', requiresCheckin: false },
    { id: 'library', label: 'Library', icon: '\uD83D\uDCDA', route: 'library', requiresCheckin: false },
    { id: 'unsure', label: 'Unsure? Coach decides', icon: '\uD83C\uDFAF', route: 'coach-proposal', requiresCheckin: true },
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
    // COUNT-1. This drives the greeting -- "You moved today, that's done."
    // Counting partials meant opening a session and backing out told
    // somebody they had moved. That is worse than a wrong number: it is
    // the coach claiming to have seen something that did not happen.
    const today       = _todayString();
    const activityLog = store.completedSessions(store.get('activityLog'));
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
                    data-door-id="${d.id}"
                    data-requires-checkin="${d.requiresCheckin}"
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
        ` : `
          <button class="btn btn-ghost today-checkin-link" data-action="checkin-mini"
                  aria-label="Update your check-in — optional, only if how you're feeling has changed">
            Update check-in
          </button>
        `}

      </div>
    `;

    attachEvents(container);
  }

  function attachEvents(container) {
    container.querySelectorAll('[data-route]').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.dataset.route;
        const requiresCheckin = btn.dataset.requiresCheckin === 'true';

        if (requiresCheckin) {
          // Fix, 04 Aug 2026 — Graeme: "we should fix this so it's
          // optional not fixed." Previously forced check-in-mini every
          // single time for a second-or-later session in a day, even
          // just to update wording. Now: only the day's FIRST check-in
          // is a real gate (that data genuinely doesn't exist yet, so
          // there's nothing to adapt around without it). Once checked
          // in today, doors go straight to their destination using
          // that existing data — check-in-mini becomes something
          // reachable voluntarily (the "Update check-in" link below),
          // not a forced stop between every tap and every session.
          if (_checkedInToday()) {
            router.navigate(route);
          } else {
            store.set('pendingDoorRoute', route);
            router.navigate('checkin');
          }
        } else {
          router.navigate(route);
        }
      });
    });

    const actions = {
      'checkin':      () => router.navigate('checkin'),
      'checkin-mini': () => router.navigate('checkin-mini'),
      'settings':     () => router.navigate('settings'),
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
    // COUNT-1. Same rule -- the coach must not refer back to a session
    // yesterday that was opened and abandoned.
    const activityLog    = store.completedSessions(store.get('activityLog'));
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
    // COUNT-1, 12 Aug 2026. Counted EVERY entry, partials included, so
    // opening a session to look at it and backing out incremented the
    // number on Home. Graeme's read "7 of 3" from two real sessions.
    // Build Your Base said 2, because programmeEngine only counts genuine
    // completions -- and he correctly identified that as the trustworthy
    // one. store.completedSessions() is now the single definition.
    const activityLog = store.completedSessions(store.get('activityLog'));
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
