/**
 * today.js
 * 16 Aug 2026 v19
 *
 * v19 - CHAP-1 step 2. Two changes, both Graeme's, agreed 15 Aug.
 *
 *   MY PROGRAMME, full width, above the grid. The six tiles answer
 *   "what shall I do now?". My Programme answers "where am I going?".
 *   Inside the grid it would read as another kind of session and people
 *   would tap it expecting a workout, so it is a row rather than a
 *   seventh tile -- the same reasoning that keeps "Unsure? Coach
 *   decides" spanning both columns underneath.
 *
 *   THE COG GOES. Settings is a bottom-nav destination reachable from
 *   every screen, so the corner affordance was the weaker of two routes
 *   to one place and it was crowding the header. Verified present in
 *   index.html's nav before removing it, not assumed.
 *
 *   "Update check-in" KEEPS ITS TEXT LABEL. An icon-only control is the
 *   least discoverable element on a screen, a passport-and-pen has no
 *   established meaning for "change how I said I am feeling", and
 *   hiding it would repeat the exact fault Graeme found in Settings. It
 *   also needs an accessible name under WCAG 2.2 regardless. It gets
 *   offered contextually after a door as well -- that is the better
 *   half of the idea -- but the link stays for the one case the
 *   contextual path misses: somebody who checked in this morning, felt
 *   worse by evening, and wants to say so WITHOUT starting a session.
 *
 * 15 Aug 2026 v18
 *
 * v18 - QUICK-2. The coach offers the short check-in once, after six
 *   check-ins. It existed only in Settings, where 2.16 will not look.
 *
 * 15 Aug 2026 v17
 *
 * v17 - PACE-2. A weekly target set sharply above recent actual
 *   history is named warmly on Home, once a week at most. Matrix
 *   decision 4, agreed 05 Jul.
 *
 * 15 Aug 2026 v16
 *
 * v16 - TARGET-2. Reaching the weekly target the person chose is now
 *   said out loud, in a line that closes the week rather than opening a
 *   demand. Previously it read identically to missing it.
 *
 * 13 Aug 2026 v15
 *
 * v15 - ORIENT-1. Home now reads what the person told onboarding.
 *   _buildCoachLine() returned null for anybody without history, so a
 *   new user landed on a bare greeting and seven doors, the first three
 *   of which are workouts. Nothing on this screen had ever read goals.
 *
 *   Persona 2.11 -- 76, does not know how to move confidently, told the
 *   app she wants to reduce stress and feel better -- landed on a screen
 *   led by workouts with the thing she came for fourth. Her matrix gap
 *   since 05 Jul ("is the Noticing Hub a genuine front door") is
 *   answered: it was not.
 *
 *   NOT FIXED BY REORDERING THE DOORS, which was the obvious answer.
 *   Persona 2.14 is autistic and predictability-seeking; a Home screen
 *   that rearranges itself is precisely aversive to her. Fixing one
 *   persona by breaking another is not a fix. The grid stays identical
 *   for everybody and the coach speaks instead -- which is what P1 asks
 *   for anyway: the coach offers.
 *
 * 13 Aug 2026 v14
 *
 * v14 - HOME-1. The weekly denominator appears only if the person set
 *   one. weeklySessionTarget defaults to 3 with setAt: null -- the field
 *   records that nobody agreed to it -- so Home read "1 of 3 this week"
 *   to a persona defined by decision paralysis: two short of something
 *   never chosen. The target itself stays for anybody who sets one.
 *
 * 13 Aug 2026 v13
 *
 * v13 - TIER-A and TIER-F.
 *
 * TIER-A. Two of the seven doors bypassed the free tier's own
 * definition. The boundary (Documents/Business/
 * alongside_tier_boundary_12aug2026_v1.md section 4) is that free is a
 * full-body session "the coach decides" -- no session-type selection.
 * Mobility & Conditioning and Yoga & Pilates both routed straight to
 * self-directed session views with no tier check, so a free user COULD
 * choose their session type; they simply could not do it through the
 * picker that says so. Same fault as the Library, different costume.
 *
 * THE SAFETY OBJECTION, ANSWERED IN FULL, because someone will raise it
 * again and the answer must not have to be re-derived. Gentle movement
 * is not being paywalled. A free user in pain still gets it: the severe
 * zone override still forces the single Gentle Care card, Care mode
 * still fires, burnout bias still lowers intensity, and the coach
 * proposal still OFFERS mobility whenever the day calls for it. What a
 * free user loses is the ability to CHOOSE gentle movement instead of
 * being offered it. That distinction is the entire tier, and nothing
 * safety-critical sits on the paid side of it.
 *
 * Conditions Update stays free and always will -- it is how somebody
 * tells the coach they are hurting.
 *
 * TIER-F. The Wellbeing door and the bottom-nav "Noticing" tab route to
 * the same view. One destination, two entry points, two different names,
 * which reads as two features and finds neither. Both entry points are
 * worth keeping -- a door on Home and a persistent tab serve different
 * moments -- so the fix is the name. "Wellbeing" wins because it says
 * what it is to somebody who has never used the app; "Noticing" needs
 * the philosophy to decode it, and a nav label is the worst place in a
 * product to ask for that.
 *
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
import { noticePlanJump, offerBriefPath } from '../data/pacing.js';
import { isPremium, lockedFeature } from '../auth.js';
import { advanceWeekIfNeeded } from '../data/programmeEngine.js';
import { getProgramme }        from '../data/programmes.js';

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
    // tier: 'personal' -- self-directed session-type choice. See the header
    // note for why this is not a safety regression.
    { id: 'mobility-conditioning', label: 'Mobility & Conditioning', icon: '\uD83E\uDDD8', route: 'mobility-conditioning', requiresCheckin: false , tier: 'personal' },
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
    // tier: 'personal' -- self-directed session-type choice.
    { id: 'yoga', label: 'Yoga & Pilates', icon: '\uD83E\uDDD8\u200D\u2640\uFE0F', route: 'yoga-session', requiresCheckin: false , tier: 'personal' },
    // TIER-F, 13 Aug 2026 -- RESOLVED. The flag below stood since
    // NAV-6. The door and the bottom-nav tab route to the same view;
    // the nav label is now "Wellbeing" too (index.html), so the two
    // entry points finally name one destination. Kept as two entries
    // deliberately: a door on Home and a persistent tab serve different
    // moments.
    //
    // Original NAV-6 note follows.
    // NAV-6, FLAGGED NOT CHANGED. This routes to 'noticing', which is
    // also a bottom-nav destination -- the same duplication as the
    // Progress tile removed below, hidden by a different label.
    //
    // Deliberately left alone, because it is not the same decision.
    // Progress was called Progress in both places, so the tile was plainly
    // redundant. Here the tile says "Wellbeing" and the nav says
    // "Noticing", and somebody looking for the first may not recognise
    // the second -- which is exactly the failure that made Yoga
    // unfindable. Removing it could cost a door rather than tidy one.
    //
    // The real question is whether these should share a name, and that is
    // Graeme's call, not a cleanup.
    { id: 'wellbeing', label: 'Wellbeing', icon: '\uD83C\uDF3F', route: 'noticing', requiresCheckin: false },
    { id: 'conditions-update', label: 'Conditions Update', icon: '\uD83E\uDE79', route: 'conditions-update', requiresCheckin: false },
    // NAV-6, 12 Aug 2026. Progress tile REMOVED. Graeme: "why do we have
    // a progress tile when we have a tab? You're right about it looking
    // cluttered."
    //
    // It was the only tile duplicating a bottom-nav destination, and the
    // bottom nav is reachable from every screen while Home is not -- so
    // the tile was the weaker of the two routes and cost a slot on the
    // one screen where slots are scarce.
    //
    // Removed rather than moved: NAV-3 added Yoga & Pilates this morning
    // and Home is where things go to become hard to find. A door that
    // already exists somewhere better is not a second door, it is
    // clutter.
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
    // HOME-1, 13 Aug 2026. The denominator only appears if the person
    // actually set one.
    //
    // strategicGoal.weeklySessionTarget defaults to 3 with setAt: null --
    // the field literally records that nobody agreed to it. So Home read
    // "1 of 3 this week" to persona 2.12, whose defining trait is
    // decision paralysis: visibly two short of something he never chose.
    // The count was right (COUNT-1 fixed that); the shortfall was
    // invented.
    //
    // Deliberately NOT removing the target outright. Somebody who sets
    // one wants to see it, and taking that away would be the opposite
    // error. setAt is the honest test of whether it was ever a choice.
    const targetSetAt   = store.get('strategicGoal.setAt');
    const weeklyTarget  = targetSetAt ? (store.get('strategicGoal.weeklySessionTarget') || null) : null;
    const sessionCount  = _sessionsThisWeek();

    // ── TARGET-2 (15 Aug 2026, moment-of-delight audit) ────────────────
    //
    // Hitting the weekly target the person chose at step 12 got exactly
    // the same treatment as missing it: the counter read "2 of 2" and
    // nothing was said. Somebody set a number, reached it, and the app
    // did not notice.
    //
    // The line CLOSES the week rather than opening a demand, which is the
    // whole difference between this and a target mechanic. "That's the
    // two you said you'd aim for" states what happened; "anything else is
    // extra, not expected" removes the obligation that a hit target
    // otherwise creates. Persona 2.5 named 'escalation-trap' — for her,
    // reaching a goal is historically the moment the pressure starts.
    //
    // It also must not stop her doing more. Somebody who hits two on
    // Tuesday should not read this as the week being over, so the
    // invitation stays.
    //
    // No new state and no "fired once" flag: the line describes the true
    // current state of the week, so it is idempotent and P4-safe — the
    // coach displays, it does not interpret. It appears on the days she
    // has moved, and the week resets it.
    // PACE-2. Matrix decision 4: a plan set sharply above recent actual
    // history gets named warmly, once a week at most. Checked before the
    // other lines because it is about the shape of the whole week rather
    // than about today, and because it is the one persona 2.8 needs.
    const planJump = noticePlanJump();

    // QUICK-2. Offered here rather than in the check-in itself: the
    // check-in is the thing she is finding long, and interrupting it to
    // ask about its length would be self-defeating. Home is where she
    // arrives with a moment to read something.
    const briefOffer = planJump ? null : offerBriefPath();

    // CHAP-1 step 2. The row's second line, and it says only what is
    // actually there: the chapter name when one exists, and a plain
    // description of the screen when one does not. It never invents a
    // programme for somebody who has none, and it carries no number --
    // a count on Home's one "where am I going" control would turn a
    // destination into a scoreboard.
    const programmeHint = _programmeHint();

    const targetMet = sessionDone && weeklyTarget && sessionCount >= weeklyTarget;
    const coachLine     = planJump
      ? planJump.body
      : briefOffer
      ? briefOffer.body
      : targetMet
      ? `That's the ${weeklyTarget} you said you'd aim for this week. Anything else is extra, not expected.`
      : sessionDone
      ? "You moved today \u2014 that's done. Tap in below any time if you'd like to do more."
      : _buildCoachLine();

    container.innerHTML = `
      <div class="today-view" role="main" aria-label="Today">

        <header class="today-header">
          <h1 class="today-greeting">${_esc(greeting)}</h1>
          ${coachLine ? `<p class="today-coach-line" role="status">${_esc(coachLine)}</p>` : ''}
        </header>

        ${sessionCount > 0 ? `
          <div class="today-week-count"
               role="status"
               aria-label="${weeklyTarget
                 ? `${sessionCount} of ${weeklyTarget} sessions this week`
                 : `${sessionCount} ${sessionCount === 1 ? 'session' : 'sessions'} this week`}">
            <span class="today-week-count__number">${sessionCount}</span>
            <span class="today-week-count__label">${weeklyTarget
              ? `of ${weeklyTarget} this week`
              : 'this week'}</span>
          </div>
        ` : ''}

        <button class="today-programme-row"
                data-route="my-programme"
                data-requires-checkin="false"
                aria-label="My Programme — where you are going">
          <span class="today-programme-row__text">
            <span class="today-programme-row__label">My Programme</span>
            ${programmeHint ? `<span class="today-programme-row__hint">${_esc(programmeHint)}</span>` : ''}
          </span>
          <span class="today-programme-row__chevron" aria-hidden="true">\u203A</span>
        </button>

        <div class="today-doors" role="group" aria-label="Choose how you want to move today">
          ${HOME_DOORS.map(d => {
            const inner = `
              <span class="today-door__icon" aria-hidden="true">${d.icon}</span>
              <span class="today-door__label">${_esc(d.label)}</span>
            `;

            // TIER-A. A <div> inside, never a <button>: lockedFeature()
            // returns role="button" and nesting one interactive control
            // in another is invalid. Same treatment as the type picker
            // and the Library, deliberately -- a locked thing should
            // look the same everywhere or it reads as a different kind
            // of refusal each time.
            if (d.tier && !isPremium()) {
              return lockedFeature(
                `<div class="today-door">${inner}</div>`,
                d.tier,
                _esc(d.label)
              );
            }

            return `
            <button class="today-door ${d.id === 'unsure' ? 'today-door--unsure' : ''}"
                    data-route="${d.route}"
                    data-door-id="${d.id}"
                    data-requires-checkin="${d.requiresCheckin}"
                    aria-label="${_esc(d.label)}">
              ${inner}
            </button>
          `;
          }).join('')}
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

    // 'settings' removed with the cog, v19. Settings is in the bottom
    // nav; a handler with nothing to fire it is one more thing to
    // believe in later.
    const actions = {
      'checkin':      () => router.navigate('checkin'),
      'checkin-mini': () => router.navigate('checkin-mini'),
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

  // ORIENT-1. Goal ids taken from js/data/goals.js -- checked against the
  // real list rather than guessed, because inventing plausible ids has
  // silently produced wrong behaviour on this project five times.
  const WELLBEING_GOALS = new Set([
    'reduce-stress', 'sleep-better', 'improve-mood', 'feel-better'
  ]);
  // ORIENT-2. Ids verified against data/goals.js, not invented -- a goal
  // id that reads plausibly and matches nothing has cost this project
  // four times.
  const STRENGTH_GOALS = new Set([
    'get-stronger', 'build-muscle', 'improve-cardio', 'lose-weight', 'tone-up'
  ]);
  // 'move-better' and 'stay-mobile' were in the first draft of this set.
  // Neither exists in goals.js. They read entirely plausibly and would
  // have matched nothing, silently sending everybody in this group to the
  // generic line -- the fifth instance of that exact fault. The ids below
  // are the real mobility-recovery group, and verify-delight.mjs now
  // asserts every id in both sets exists.
  const MOVEMENT_GOALS = new Set([
    'flexibility', 'balance', 'reduce-pain',
    'injury-recovery', 'prevent-injury', 'improve-posture'
  ]);
  const ORIENTATION_SESSIONS = 4;

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

    // ── ORIENT-1, 13 Aug 2026 ────────────────────────────────────────
    //
    // Everything above needs history. For somebody in their first days
    // this function returned null, so Home was a bare greeting and seven
    // doors -- and the first three of those are workouts.
    //
    // THE PERSON THIS IS FOR. Persona 2.11: 76, lifelong overweight,
    // ex-dancer, "doesn't know how to exercise or move confidently",
    // more likely to engage with mindfulness than structured exercise.
    // She tells the app during onboarding that she wants to reduce
    // stress and feel better. Nothing on Home has ever read `goals` --
    // grep returned nothing before this. So the person least likely to
    // want a workout landed on a screen led by workouts, with the thing
    // she came for fourth.
    //
    // The matrix has carried her gap since 05 Jul: "unconfirmed whether
    // the Noticing Hub is reachable as a genuine front door at
    // onboarding". Confirmed 13 Aug: it is not. Every route out of
    // onboarding ends here.
    //
    // WHY NOT REORDER THE DOORS, which was the obvious fix. Persona 2.14
    // is autistic and predictability-seeking; a Home screen that
    // rearranges itself based on what the app thinks you want is
    // precisely aversive to her. Fixing 2.11 by breaking 2.14 is not a
    // fix. The grid stays fixed for everybody and the coach speaks
    // instead -- which is also what P1 asks for: the coach offers.
    //
    // Fires only in the first few sessions. Orientation, not a nudge:
    // somebody who has been here a fortnight has found the doors.
    const sessionsSoFar = activityLog.length;
    if (sessionsSoFar < ORIENTATION_SESSIONS) {
      const goals = store.get('goals') || [];
      if (goals.some(g => WELLBEING_GOALS.has(g))) {
        return "Wellbeing is where the breathing and the quieter practices live \u2014 that might be the door for you.";
      }
      if (goals.length === 0) {
        // Persona 2.12's case: no goal, genuine decision paralysis.
        // Naming the door that decides for you is the whole point of it.
        return "If you'd rather not choose, \u201CUnsure\u201D lets me decide today.";
      }

      // ── ORIENT-2 (15 Aug 2026, first-ninety-seconds audit) ──────────
      //
      // ORIENT-1 gave a line to wellbeing-goal users and to users with no
      // goal at all. Everybody else still got null. Checked across the
      // persona set: FIVE of nine were silent here -- 2.6, 2.10, 2.15,
      // 2.16 and 2.4. That includes the 76-year-old and the returning
      // lifter, neither of whom is an edge case.
      //
      // They come out of a twenty-question conversation that ends "I'm
      // glad you're here, [name]. Let's see what we can do." and land on
      // a grid of four unlabelled doors in silence. The product handles
      // its edge cases warmly and says nothing to the middle.
      //
      // Same constraints as ORIENT-1: the grid does NOT reorder, because
      // a Home screen that rearranges itself is aversive to persona 2.14.
      // The coach speaks instead. Orientation, not a nudge -- it names
      // where the thing they asked for lives, once, in the first few
      // sessions, and then stops.
      if (goals.some(g => STRENGTH_GOALS.has(g))) {
        return "Cardio, Core & Strength is the door for what you said you're after.";
      }
      if (goals.some(g => MOVEMENT_GOALS.has(g))) {
        return "Mobility & Conditioning is where the gentler movement lives \u2014 that might be the door for you.";
      }
      // Everything else, including 'build-habit' alone. Says the true
      // thing rather than guessing a door: the smallest session is the
      // one most likely to actually happen.
      return "Any door is a fine place to start. The shortest session counts as much as the longest one.";
    }

    return null;
  }

  function _programmeHint() {
    const id = store.get('activeProgramme.programmeId');
    if (!id) return "Your goals and where you are up to";
    const p = getProgramme(id);
    return p ? p.name : "Your goals and where you are up to";
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
