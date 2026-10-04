/**
 * progress.js
 * 04 Oct 2026 v26
 *
 * v26 - LOOK-2 PROGRESS-SHAPE (Graeme, 04 Oct: "Progress seems wordy and
 *   lacks graphs ... Too much on one screen"). The overview is two numbers,
 *   the coach's one line, sessions each week (every bar labelled with its
 *   count and week), the kinds of session as one coloured bar with each
 *   name and count beside it (LOOK-3 colours, never colour alone), and the
 *   arc's strands (a date or Not yet, never a count). Lifts, weight, Build
 *   Your Base, Share and Your year are rows one tap away; each but Your year
 *   opens its own page with Back to Progress. The weight note still speaks
 *   on the overview, once. Build Your Base says how many this week, with no
 *   target beside it (Graeme approved dropping "0 of 3 this week", 04 Oct).
 *   Kinds now include classes, yoga, walks and your own sessions, not only
 *   built ones; a built session with no recorded shape is still skipped.
 *
 * 02 Oct 2026 v25
 *
 * v25 - W4-20. Plurals in the shared summary (1 week in, 1 session). The
 *   weekly chart starts the week the person did, not six weeks back.
 *
 * 01 Oct 2026 v24
 *
 * v24 - PT-2 HEALTH-CONSENT. No weight card or entry while health consent
 *   is not given.
 *
 * v23 - W3-20. The shared summary says "1 session", not "1 sessions", and under
 *   90 minutes says minutes, not "about 0 hours".
 *
 * v22 - P25 (persona finding W2-20). Lifts: every one (eight shown, the
 *   rest under "All N lifts"; it stopped at eight), and each day's best
 *   set compared (arc-readback v2) -- "Your best set the first day you
 *   logged it, and on the latest day."
 *
 *
 * v21 - P12, FREE PROGRAMME. The programme block (weeks in, "4 of 3 this
 *   week", milestones, a second session count) is the Plan's. On Free a
 *   programme left over from an old onboarding shaped nothing, yet
 *   Progress scored against it. Free has one count. verify-free-programme.
 *
 * v20 - P7. Types are named by the one label map (data/activity-labels.js):
 *   "mostly gym" and raw type words came from a map keyed on names
 *   nothing writes. Free's "mostly ..." counts by what a person would
 *   call it, so a built lower-body session reads "lower body".
 *   verify-activity-labels.
 *
 * v19 - P0, SCOPE-MINOR. The per-area "What you've told me about" charts
 *   are removed (charting an injury over time is monitoring it). The
 *   professional share is described as plain and structured, not
 *   "clinical-friendly".
 *
 * v18 - F7 LANDMARK. role="main" (and its label) removed from the view's
 *   wrapper: index.html's <main> is the one main landmark; a second,
 *   nested inside it, is announced twice and fails landmark rules.
 *
 * v17 - Work list 9, found by pressing every control. Share your
 *   progress: when copying is not allowed, the fallback was a browser
 *   alert() (the comment said "an accessible dialog"; it was not one):
 *   a box that cannot be selected on most phones, so the text could not
 *   be copied at all. It is now the text itself, in a labelled read-only
 *   field under the buttons, selected and focused. And "Copied" was
 *   announced at the TOP of the page, in the coach's words, while the
 *   person was at the bottom pressing the button; it is now said under
 *   the buttons, in a status line that is always there.
 *
 * v16 - SMOOTH-P4a. Progress reads the arc back. Spec 4.8.
 *
 *   PLAN, top to bottom: Your arc · week n (the aim, one coach sentence);
 *   What you've told me about (each sore-able condition: since when,
 *   mentions at check-in this week and when they started, a six-week
 *   chart, and "This is what you've told me at check-in. It isn't a
 *   diagnosis."); From your logged weights (first → latest, facts only);
 *   What your arc works on (each strand with a DATE, never a count);
 *   Change my arc. Then Everything you've done.
 *
 *   EVERYTHING YOU'VE DONE is one block for both tiers: the coach's line,
 *   the sessions number, a six-week chart. Counts come from
 *   store.completedSessions() only (COUNT-1). Plan switches 30 / 90 days.
 *
 *   FREE sees 30 days, not 14, and nothing locked: the padlocked 30/90
 *   tabs are gone. Its coach line says what was done and the most common
 *   kind ("You've moved 10 times in the last 30 days, mostly strength.").
 *   Last, a quiet card: what the Plan adds here.
 *
 *   The read-back is js/data/arc-readback.js: pure functions over data
 *   already kept. No new tracking. Charts are one hue, a sentence before
 *   each, an accessible name on every bar, and a value on the first and
 *   last bar only.
 *
 * v15 - TARGET-3. The weekly target is shown only if the person SET one.
 *   getProgressStats() returns strategicGoal.weeklySessionTarget or 3
 *   with no check on whether it was ever chosen, so Progress told
 *   somebody who had never set a target that they were "0 of 3 this
 *   week" -- a shortfall against a commitment they never made, on the
 *   screen they open to see how they are doing. today.js has guarded
 *   this since TARGET-2: "setAt is the honest test of whether it was
 *   ever a choice." Also "1 sessions completed".
 *
 * 08 Sep 2026 v14
 *
 * v14 - LOG-CLASS-1. Two echoing fallthroughs and a plural.
 *   _formatType() and _shapeLabel() both ended `|| input`, so a class
 *   logged with a strand id printed "trunk-strength" at somebody. Same
 *   shape as formatRole() in ROLE-1, in two more places. And the
 *   sessions count read "1 sessions" in its accessible name.
 *
 * 08 Sep 2026 v13
 *
 * v13 - PROGRESS-2. "What you have been doing" is an h2, not an h3.
 *
 *   Its three siblings -- Your weight, the programme block, Share your
 *   progress -- are all h2, so the rendered outline read h1 > h3 > h2.
 *   Somebody navigating by heading met the section as a subsection of
 *   nothing, then the next one jumping back UP a level.
 *
 *   WCAG 2.2 AA 1.3.1. The heading level IS the structure for anyone not
 *   seeing the layout, and heading navigation is how a screen-reader user
 *   skims a page they opened in order to look back.
 *
 *   Styling lives on the class, so nothing moves visually.
 *
 *   Device pass, task 8. The rest of this view came back clean: no
 *   undefined, no unnamed controls, the free-tier absence of this section
 *   is deliberate gating, and the two coach lines that appear to run
 *   together are separate paragraphs.
 *
 * 06 Sep 2026 v12
 *
 * v12 - PROGRESS. The shapes of session, counted. CLUB item 9, the last.
 *
 *   renderActivitySummary()'s breakdown counts `e.type` -- the ACTIVITY
 *   type: workout, walk, quiet -- so it read "Workout x 12", which says
 *   almost nothing about what somebody actually did. The SESSION type
 *   has been on every built session since TWO-ENGINE added
 *   activityLog[].sessionType, and until now only chooseSessionType()
 *   read it.
 *
 *   DISPLAYS, NEVER INTERPRETS (P4). It says what happened. It does not
 *   say what that means, what is missing, or what to do about it. No
 *   "you have not done any mobility lately" -- that is the app deciding
 *   a gap is a fault, and a gap is often the most sensible thing
 *   somebody did that month.
 *
 *   NO STREAK, and NO RANKING. Ordered by count because a list needs an
 *   order; nothing is called most, least, top or best. A LIST, NOT A
 *   CHART: a proportional bar invites comparison between the rows and
 *   makes the shortest one look like a failing.
 *
 *   ENTRIES PREDATING TWO-ENGINE carry no sessionType and are SKIPPED,
 *   not bucketed as "Other". A synthetic bucket grows with history the
 *   person cannot see the shape of, and reads as a kind of session
 *   rather than an absence of a record.
 *
 *   SILENT WHEN THERE IS NOTHING. An empty state here would read as an
 *   unfinished task on a screen somebody opened to look back, not to be
 *   given something else to do.
 *
 * v11 - WEIGHT-1b. The weight log, and the sustained-rate note.
 *
 *   PASSIVE ENTRY, ALWAYS. A field that is there when looked for and
 *   silent otherwise. No badge, no reminder, no empty state that reads
 *   as an unfinished task, no "you haven't weighed in for a while".
 *   Frequent weighing is itself a risk behaviour, so the app must never
 *   be the thing that asks.
 *
 *   NO STREAK, and no gap-shaming either. The log shows what was
 *   recorded and says nothing about what was not.
 *
 *   THE SUSTAINED-RATE NOTE. observedRateBreach() had no caller until
 *   now -- the rule was written, gated and unreachable. It fires when
 *   logged loss runs at or above 3 lb a week for three consecutive
 *   weeks, which is the threshold supervised trials intervene at.
 *
 *   It speaks ONCE. weightRateRaisedAt records that it has, because a
 *   note that reappeared on every render would be nagging somebody
 *   about the rate they are losing weight at -- the worst available
 *   version of this feature.
 *
 * 20 Aug 2026 v10
 *
 * v10 - R4 / decision 7.2. EXPORT IS FREE. renderExportLocked() and its
 *   tap handler are removed. UK GDPR gives a right of access and
 *   portability regardless of payment, so the lock never withheld the
 *   DATA -- only the button, converting a self-serve action into a
 *   support email, on a one-person business.
 *
 *   The tier difference survives in the CONTENTS and is emergent: the
 *   export is scoped by activeWindow (14 free, 30/90 paid) and its
 *   programme lines drop out when there is no programme. No conditional
 *   was needed or added.
 *
 *   NOTHING ELSE IN THIS FILE MOVED. The 30/90-day window and the
 *   tiered observation depth stay exactly as they are -- those are the
 *   kind-not-length distinction of section 4.1, and moving them would
 *   collapse the boundary R4 exists to draw.
 *
 *   FLAGGED, NOT FIXED (touch-once): .progress-export--locked and
 *   .progress-export__lock* are now dead CSS. The stylesheet is outside
 *   this session's file list.
 *
 * v9 - ATHLETE-RETIRE. Three tier checks simplified.
 *
 *
 * v8 - NAME-1. The paid tier is "the Plan", not "Personal".
 *   Graeme's decision, 18 Aug. Copy only -- no logic, no gating
 *   and no tier boundary moved. Reasoning in js/auth.js v2.
 *
 * 16 Aug 2026 v7
 *   COUNTDOWN-1. The programme progress bar is gone, with "8 weeks
 *   remaining" and "N% complete" beside it. All three were
 *   distance-remaining measures on a screen every user sees, and the
 *   chapters blueprint rules them out in a line Graeme agreed in full:
 *   keep the milestone, remove the countdown, show progress made and
 *   never distance remaining.
 *
 *   The milestones stay and face backwards instead. "The end is close"
 *   became "10 weeks in"; "halfway through" became "five weeks done".
 *   The evidence for milestones is real — endowed progress, the goal
 *   gradient — so removing them would lose something. What gets removed
 *   is the mechanism that works by amplifying perceived obligation,
 *   which is persona 2.5's declared territory with a bar drawn on it.
 *
 * 13 Aug 2026 v6
 *
 * v6 - E2. The export counted partials while every on-screen count did
 *   not. Last raw activityLog read in the file, now routed through
 *   store.completedSessions() like the rest.
 *
 * 13 Aug 2026 v5
 *
 * v5 - TIER-E. Progress must differ in KIND, not length.
 *
 * Source: Documents/Business/alongside_tier_boundary_12aug2026_v1.md
 * section 4.1, which is blunt about what was wrong here:
 *
 *   "If free is fourteen days and Personal is ninety, we are selling a
 *    bigger number, and bigger numbers are easy to shrug at."
 *
 *   Free RECORDS.  "That's four this fortnight." What you did. True,
 *                  useful, complete.
 *   Personal READS. "You've come in low-energy eleven times. Nine of
 *                  those, you finished. I don't think you know that
 *                  about yourself."
 *
 * That is not more data. It is a different act, and it is only possible
 * when there is a destination to read toward.
 *
 * WHAT CHANGED, AND WHAT I ARGUED WITH.
 *
 * The window drops 30 -> 14 for free. This partly reverses WOW-4
 * (11 Aug), which lifted free from 7 to 30 with a good argument: a
 * 7-day slice showed persona 2.12 a single entry and no shape at all,
 * making free "a different product with the coaching removed". That
 * reasoning was right about 7 and is not right about 14. Danny trains
 * roughly twice a week, so a fortnight holds about four sessions --
 * enough to have a shape. The boundary document is dated one day AFTER
 * WOW-4 and specifies fourteen, and its own copy says "fortnight", so
 * the number is deliberate rather than incidental. WOW-4's principle
 * survives intact; only its number moves.
 *
 * If free were ONLY losing sixteen days this would be a worse product.
 * It isn't: the point of the change is the second half.
 *
 * Free line 1 also loses its appraisals -- "That's a real habit",
 * "That's consistent movement". Those read as verdicts on the person,
 * which P4 forbids ("the coach displays but never interprets"), and
 * they were doing the work that reading should do. A record states the
 * number and stops. Stripping them makes free MORE compliant with the
 * founding principle, not less generous.
 *
 * 11 Aug 2026 v4
 *
 * v4 - "Your year" link added. annual-reflection.js existed as a route
 *   pointing at nothing, and now exists as a view that nothing linked
 *   to. Progress is where somebody looking back would go.
 *
 * 11 Aug 2026 v3
 *
 * v3 — WOW-4 (Persona Tracing Wave 1). Free-tier lookback window lifted
 *   from 7 days to 30. A 7-day window cannot show variability, and
 *   "variability is information" is the product's founding principle — so
 *   the free tier was not a smaller version of the coaching, it was the
 *   coaching removed. Persona 2.12 saw one entry and no shape. 90 days
 *   stays Personal, but is now shown as a visible tappable locked tab
 *   routing to /upgrade rather than being hidden entirely — same "nothing
 *   is a dead end" principle applied to session-builder-ui.js v5.
 *
 * 23 Jun 2026 v2
 *
 * Progress view. Shows what the person has built — not as data, as narrative.
 *
 * v2 — Phase 5 (P5-PG-1, P5-PG-2, P5-PG-3, P5-PG-5):
 *   - 30-day and 90-day lookback views (Personal tier only — 7-day for Free)
 *   - Coach observations as narrative text, not data cards
 *   - Programme progress: missed sessions flagged, pace context, phase position
 *   - Export: three renders — self / friend / professional
 *   - Tier gating: 30/90 day views locked behind Personal; paywall route on tap
 *
 * Philosophy:
 *   Progress is not a dashboard. It is a mirror held at just the right angle.
 *   The coach narrates what the numbers mean — not what they are.
 *   Pattern detection is human-readable text. Never statistics.
 *   Missed sessions are context, not failure. No red indicators.
 *
 * Tier behaviour:
 *   Free:     7-day view only. Coach observation: one line. Export: none.
 *   Personal: 7 / 30 / 90 day views. Coach observations: full narrative.
 *             Export: self / friend / professional.
 *
 * WCAG 2.2 AA:
 *   Tab strip: role="tablist", each tab role="tab", aria-selected, aria-controls.
 *   Selected tab: aria-selected="true". Non-selected: aria-selected="false".
 *   Tab panel: role="tabpanel", aria-labelledby pointing to its tab.
 *   Locked content: aria-disabled="true" on locked tab, role="button" on
 *   paywall prompt, not a disabled button (disabled removes focus).
 *   All coach narrative text rendered as <p> — not aria-hidden.
 *   Export buttons: descriptive aria-label (what the export contains).
 *   No colour-only meaning anywhere. Missed sessions shown with text label,
 *   not red indicator alone.
 *   Touch targets: minimum 44px for all interactive elements.
 */

import { healthAllowed } from '../data/health-consent.js';
import { store }            from '../store.js';
// PROGRESS, 06 Sep 2026. The eight session-type labels come from the
// builder, not a private map here -- a second copy would drift the first
// time one changed, which is what the retired getWorkoutName() did.
import { SESSION_TYPES }    from '../session-builder.js';
import { getProgressStats } from '../data/programmeEngine.js';
import { getGoalLabel }     from '../data/goals.js';
import { toKg, formatWeight, observedRateBreach } from '../data/weight-targets.js';
import { aimById } from '../data/aims.js';
import { EXERCISES } from '../data/exercises/index.js';
import { activityNoun } from '../data/activity-labels.js';
import { liftReadback, strandReadback, arcWeek, sessionsByWeek,
         sessionsInWindow, shortDate } from '../data/arc-readback.js';
import { kindOf } from '../data/kind-colours.js';

// Set by _rateNote when it renders the sustained-rate note, committed by
// _commitRateRaise once the markup is on screen. It is a fact about this
// render, not about the person, so it lives here and not in the store --
// what reaches the store is only the timestamp saying it was said.
let _pendingRateRaise = false;

// ─── View registration ────────────────────────────────────────────────────────

export function ProgressView(router) {

  // TIER-E, 13 Aug 2026. Free is a fortnight; Personal is 30 or 90.
  //
  // WOW-4's reasoning (11 Aug) still holds and is why this is 14 and not
  // 7: "variability is information", and a 7-day window is structurally
  // incapable of showing variability -- persona 2.12 saw one entry and no
  // shape at all. Fourteen days holds about four of his sessions, which
  // has a shape. The difference that matters is not the window; it is
  // what the coach DOES with it (see _buildObservation).
  // SMOOTH-P4a. Free sees 30 days and nothing locked (spec 4.8).
  const FREE_WINDOW = 30;
  const PAID_DEFAULT = 30;

  // Initialised per tier at first render rather than at module load.
  // A single shared default left a Personal user with activeWindow = 14
  // while their tab strip only offered 30 and 90 — so no tab read as
  // selected and aria-selected was false on all of them. Caught by
  // rendering both tiers rather than reading the code.
  let activeWindow = null;
  // LOOK-2. null = the overview; otherwise one detail page.
  let activePage   = null;
  let focusAfter   = null;

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(container) {
    render(container);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render(container) {
    const tier  = store.get('tier') || 'free';
    const premium = tier === 'personal';   // ATHLETE-RETIRE

    if (activeWindow === null) activeWindow = premium ? PAID_DEFAULT : FREE_WINDOW;

    // A user who lapses mid-session would otherwise keep a window they
    // are no longer entitled to. Clamp rather than reset, so somebody
    // upgrading does not lose the view they were looking at.
    if (!premium && activeWindow !== FREE_WINDOW) activeWindow = FREE_WINDOW;
    if (premium && activeWindow === FREE_WINDOW)  activeWindow = PAID_DEFAULT;
    const name  = store.get('name') || '';
    const stats = getProgressStats();

    container.innerHTML = `
      <div class="progress-view">
        ${activePage ? renderPage(activePage, premium, stats) : `
        <header class="progress-header">
          <h1 class="progress-title" tabindex="-1">Progress</h1>
          ${premium ? renderWindowTabs(tier) : ''}
        </header>

        <div class="progress-body">
          ${renderActivitySummary(tier)}
          ${renderCoachNarrative(stats, tier, name)}
          ${renderSessionsChart()}
          ${renderSessionShapes(tier)}
          ${premium ? renderArcReadback() : ''}
          ${_rateNote(premium)}
          ${renderMoreList(premium, stats)}
          ${premium ? '' : renderPlanCard()}
        </div>`}
      </div>
    `;

    attachEvents(container, tier);
    if (focusAfter) {
      const sel = focusAfter; focusAfter = null;
      container.querySelector(sel)?.focus();
    }

    // AFTER the markup exists. See _rateNote.
    _commitRateRaise();
  }

  // ── LOOK-2. The rows one tap away, and their pages ──────────────────────

  const PAGE_ICON = {
    lifts:     '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
    weight:    '<path d="M3 17l5-5 4 4 8-8"/>',
    programme: '<path d="M4 20V10l8-6 8 6v10"/><path d="M10 20v-6h4v6"/>',
    year:      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    share:     '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 13v6h14v-6"/>',
  };
  const PAGE_KIND = { lifts: 'amber', weight: 'blue', programme: 'teal', year: 'violet', share: 'green' };

  function _prRow(key, title, sub, attrs) {
    return `
      <li>
        <button class="pr-row pr-row--${PAGE_KIND[key]}" ${attrs}>
          <span class="pr-tile" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">${PAGE_ICON[key]}</svg></span>
          <span class="pr-row__text">
            <span class="pr-row__title">${_esc(title)}</span>
            ${sub ? `<span class="pr-row__sub">${_esc(sub)}</span>` : ''}
          </span>
          <span class="pr-row__chevron" aria-hidden="true">&rsaquo;</span>
        </button>
      </li>`;
  }

  function renderMoreList(premium, stats) {
    const lifts = premium ? liftReadback(store.get('liftLog') || {}, EXERCISES) : [];
    const weightOn = premium && store.get('weightTracking') === true && healthAllowed();
    const latest = weightOn ? (store.get('weightLog') || []).filter(e => e && typeof e.kg === 'number')
      .slice().sort((a, b) => String(b.at).localeCompare(String(a.at)))[0] : null;
    const rows = [
      lifts.length ? _prRow('lifts', 'Your lifts', `${lifts.length} logged, first to latest`, 'data-pr-page="lifts"') : '',
      weightOn ? _prRow('weight', 'Your weight', latest ? `${formatWeight(latest.kg, store.get('weightUnit') || 'kg')} \u00b7 ${_weightDate(latest.at)}` : 'Nothing logged yet', 'data-pr-page="weight"') : '',
      stats.hasActiveProgramme && premium ? _prRow('programme', stats.programmeName || 'Your programme',
        `${stats.weeksIn === 0 ? 'Just started' : `Week ${stats.weeksIn}`} \u00b7 ${stats.phaseName}`, 'data-pr-page="programme"') : '',
      _prRow('year', 'Your year', 'Every session since you started', 'id="progress-year-btn" aria-label="Your year: look back across your year"'),
      _prRow('share', 'Share your progress', 'For you, a friend or a professional', 'data-pr-page="share"'),
    ].filter(Boolean);
    return `
      <nav class="pr-card pr-more" aria-label="More on your progress">
        <ul class="pr-more__list">${rows.join('')}</ul>
      </nav>`;
  }

  /** A detail page: Back to Progress, one h1, the block. */
  function renderPage(page, premium, stats) {
    const titles = { lifts: 'Your lifts', weight: 'Your weight', programme: stats.programmeName || 'Your programme', share: 'Share your progress' };
    const body = page === 'lifts' ? _liftsPage()
      : page === 'weight' ? _weightLog(premium, false)
      : page === 'programme' ? (stats.hasActiveProgramme && premium ? renderProgrammeProgress(stats, false) : '')
      : page === 'share' ? renderExportBlock(false) : '';
    return `
      <div class="pr-page pr-page--${PAGE_KIND[page] || 'teal'}">
        <button class="btn btn-ghost pr-back" id="pr-back" aria-label="Back to Progress">&larr; Progress</button>
        <div class="pr-page__head">
          <span class="pr-tile pr-tile--lg" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">${PAGE_ICON[page] || ''}</svg></span>
          <h1 class="progress-title" tabindex="-1"${page === 'lifts' ? ' id="pr-lifts-h"' : ''}>${_esc(titles[page] || 'Progress')}</h1>
        </div>
        ${body}
      </div>`;
  }

  /** LOOK-2. Every lift, first to latest, each with its line. */
  function _liftsPage() {
    const rows = liftReadback(store.get('liftLog') || {}, EXERCISES);
    if (!rows.length) return '<p class="pr-note">Lifts appear here once you have logged one on two different days.</p>';
    const KINDS = ['weight', 'reps', 'level', 'durationMins', 'distance'];
    const kindOfRow = r => KINDS.find(k => typeof r.first[k] === 'number' && typeof r.latest[k] === 'number');
    const strength = rows.filter(r => ['weight', 'reps', 'level'].includes(kindOfRow(r)));
    const holds    = rows.filter(r => !strength.includes(r));
    // The line: first to latest, nothing more. No judgement, same colour up or down.
    const spark = r => {
      const k = kindOfRow(r), a = r.first[k], b = r.latest[k];
      const lo = Math.min(a, b), hi = Math.max(a, b), span = hi - lo || 1;
      const y = v => (hi === lo ? 16 : 26 - ((v - lo) / span) * 20).toFixed(1);
      return `<svg class="pr-spark" width="72" height="32" viewBox="0 0 72 32" aria-hidden="true" focusable="false"><line x1="6" y1="${y(a)}" x2="66" y2="${y(b)}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="6" cy="${y(a)}" r="4" fill="currentColor"/><circle cx="66" cy="${y(b)}" r="4" fill="currentColor"/></svg>`;
    };
    const li = r => `
          <li class="pr-lift">
            <span class="pr-lift__body">
              <span class="pr-lift__name">${_esc(r.name)}</span>
              <span class="pr-lift__text">${_esc(r.text)}</span>
            </span>
            ${spark(r)}
          </li>`;
    const group = (title, cls, list, i) => list.length ? `
        <section class="pr-lift-group pr-lift-group--${cls}" aria-labelledby="pr-lg-${i}">
          <h2 class="pr-group-title" id="pr-lg-${i}">${title}</h2>
          <ul class="pr-lifts">${list.map(li).join('')}</ul>
        </section>` : '';
    return `
      <p class="pr-note">Your best set the first day you logged each one, and on the latest day.</p>
      ${group('Strength', 'amber', strength, 0)}
      ${group('Holds and time', 'violet', holds, 1)}`;
  }

  /**
   * The weight log. Plan only, and only where tracking is on.
   *
   * Deliberately plain: a list of what was recorded and a field to add
   * to it. No chart, no trend line, no projection -- a graph of somebody
   * losing weight invites reading a slope, and reading a slope is the
   * arithmetic on the body this product refuses.
   */
  function _weightLog(premium, heading = true) {
    if (!premium || store.get('weightTracking') !== true || !healthAllowed()) return '';

    const unit    = store.get('weightUnit') || 'kg';
    const entries = (store.get('weightLog') || [])
      .filter(e => e && typeof e.kg === 'number')
      .slice()
      .sort((a, b) => String(b.at).localeCompare(String(a.at)))
      .slice(0, 8);

    const stone = unit === 'st';
    const note  = _rateNote(premium);

    return `
      <section class="progress-weight" aria-label="Your weight">
        ${heading ? '<h2 class="progress-weight__heading">Your weight</h2>' : ''}

        ${note}

        ${entries.length ? `
          <ul class="progress-weight__list">
            ${entries.map(e => `
              <li class="progress-weight__row">
                <span class="progress-weight__when">${_esc(_weightDate(e.at))}</span>
                <span class="progress-weight__what">${_esc(formatWeight(e.kg, unit))}</span>
              </li>
            `).join('')}
          </ul>
        ` : ''}

        <label class="progress-weight__label" for="weight-log-input">
          Add a weight, if you want to
        </label>
        ${stone
          ? `<div class="progress-weight__stone">
               <input class="progress-weight__input progress-weight__input--part"
                      id="weight-log-input" type="number" inputmode="numeric" min="0" max="60"
                      aria-label="Stone">
               <span class="progress-weight__unit">st</span>
               <input class="progress-weight__input progress-weight__input--part"
                      id="weight-log-input-lb" type="number" inputmode="numeric" min="0" max="13"
                      aria-label="Pounds">
               <span class="progress-weight__unit">lb</span>
             </div>`
          : `<input class="progress-weight__input" id="weight-log-input"
                    type="number" inputmode="decimal" min="0" step="0.1"
                    aria-label="Your weight in ${unit === 'lb' ? 'pounds' : 'kilograms'}">`}
        <button class="btn btn-secondary btn-small" data-action="log-weight">Save it</button>
      </section>
    `;
  }

  /**
   * The sustained-rate note. Speaks once, then never again.
   *
   * Says what it noticed and points outward. It does NOT state the rate,
   * a projection, or any weight -- the person can read their own log,
   * and the coach putting a number on it turns a concern into a verdict.
   */
  function _rateNote(premium) {
    if (!premium || store.get('weightTracking') !== true || !healthAllowed()) return '';
    if (store.get('weightRateRaisedAt')) return '';

    const weekly = _weeklyRates(store.get('weightLog') || []);
    if (!observedRateBreach(weekly)) return '';

    // Marked here and WRITTEN AFTER the render, not before.
    //
    // The first version set weightRateRaisedAt in the save handler
    // before re-rendering -- which meant this function then saw the flag
    // and returned nothing, so the note would never have appeared at
    // all. A "show once" that writes its own flag too early shows zero
    // times, and nothing would have failed loudly.
    _pendingRateRaise = true;

    return `
      <p class="progress-weight__note" role="status">
        Your weight has been coming down quickly for a few weeks now. That
        can be harder on you than it looks, and it is worth a word with a GP
        or a registered dietitian — not because anything is wrong, but
        because they can see things I cannot.
      </p>
    `;
  }

  /**
   * Weekly loss rates in kg, oldest first, from a log of {at, kg}.
   *
   * Pairs consecutive entries and normalises by the days between them,
   * so an irregular log still yields comparable weekly figures. Gains
   * and flat weeks come through as <= 0 and break the run, which is
   * correct: the rule is about SUSTAINED loss.
   */
  function _weeklyRates(log) {
    const sorted = (log || [])
      .filter(e => e && typeof e.kg === 'number' && e.at)
      .slice()
      .sort((a, b) => String(a.at).localeCompare(String(b.at)));
    const rates = [];
    for (let i = 1; i < sorted.length; i++) {
      const days = (new Date(sorted[i].at) - new Date(sorted[i - 1].at)) / 86400000;
      if (!(days > 0)) continue;
      rates.push((sorted[i - 1].kg - sorted[i].kg) / (days / 7));
    }
    return rates;
  }

  /**
   * Set once the note has actually been drawn. Cleared immediately after
   * the write, so a later render cannot re-trigger it.
   */
  function _commitRateRaise() {
    if (!_pendingRateRaise) return;
    _pendingRateRaise = false;
    store.set('weightRateRaisedAt', new Date().toISOString());
  }

  function _weightDate(at) {
    const d = new Date(at);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function _esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── Window tabs (Personal only) ────────────────────────────────────────────

  function renderWindowTabs(tier) {
    // SMOOTH-P4a. Plan only, 30 or 90. Free sees 30 days and nothing
    // locked -- the padlocked tabs made the free screen a sales page.
    const windows = [30, 90];
    return `
      <div class="progress-tabs progress-tabs--seg" role="tablist" aria-label="How far back">
        ${windows.map(w => `
          <button
            class="progress-tab ${activeWindow === w ? 'progress-tab--active' : ''}"
            role="tab"
            id="tab-${w}"
            aria-selected="${activeWindow === w ? 'true' : 'false'}"
            aria-controls="panel-${w}"
            data-window="${w}">
            ${w} days
          </button>`).join('')}
      </div>
    `;
  }

  // ── Coach narrative ────────────────────────────────────────────────────────

  function renderCoachNarrative(stats, tier, name) {
    // COUNTDOWN-1. Partials excluded here too -- this feeds _buildObservation(),
    // which writes the "N sessions in the last 30 days" coach line. A coach
    // congratulating somebody on sessions they backed out of is worse than
    // a wrong number.
    const activityLog  = store.completedSessions(store.get('activityLog'));
    const checkinHistory = store.get('checkinHistory') || {};
    const goals        = store.get('goals') || [];
    const observation  = _buildObservation(activityLog, checkinHistory, stats, activeWindow, tier, name);

    return `
      <section class="progress-narrative"
               aria-label="Coach observations"
               id="panel-${activeWindow}"
               ${tier === 'free' ? '' : `role="tabpanel" aria-labelledby="tab-${activeWindow}"`}>
        <div class="progress-narrative__text">
          ${observation.lines.slice(0, 1).map(line => `<p>${line}</p>`).join('')}
        </div>
      </section>
    `;
  }

  // ── Activity summary ───────────────────────────────────────────────────────

  function renderActivitySummary(tier) {
    // COUNTDOWN-1. Partials excluded, matching Home and Build Your Base.
    const activityLog = store.completedSessions(store.get('activityLog'));
    const cutoff      = _cutoffDate(activeWindow);
    const recent      = activityLog.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts) >= cutoff;
    });

    const sessionCount  = recent.length;
    const totalMins     = recent.reduce((acc, e) => acc + (e.durationMins || 0), 0);
    return `
      <section class="progress-summary" aria-label="Activity summary for last ${activeWindow} days">
        <div class="progress-summary__stat progress-summary__stat--teal">
          <!-- LOG-CLASS-1, 08 Sep 2026. "1 sessions" in the accessible
               name. The VISIBLE word below is a column heading and is
               right to stay plural; this one is read as a sentence.
               Third instance of this exact fault -- PROPOSAL-1 on the
               proposal card, OWN-1 on the Home card. -->
          <span class="progress-summary__number"
                aria-label="${sessionCount} session${sessionCount === 1 ? '' : 's'}">${sessionCount}</span>
          <span class="progress-summary__label">sessions</span>
        </div>
        <div class="progress-summary__stat progress-summary__stat--blue">
          <span class="progress-summary__number" aria-label="${totalMins} minutes total">${totalMins}</span>
          <span class="progress-summary__label">minutes moving</span>
        </div>
        <!-- LOOK-2. The kinds are drawn below, every one named and counted;
             the chips here repeated three of them. -->
      </section>
    `;
  }

  /**
   * PROGRESS, 06 Sep 2026. The shapes of movement, counted.
   *
   * WHY THIS EXISTS. renderActivitySummary()'s breakdown counts
   * `e.type` -- the ACTIVITY type: workout, walk, quiet. So it reads
   * "Workout x 12", which says almost nothing. The SESSION type -- what
   * shape of session it actually was -- has been recorded on every
   * built session since TWO-ENGINE added activityLog[].sessionType, and
   * until now only chooseSessionType() read it.
   *
   * DISPLAYS, NEVER INTERPRETS. P4. It says what happened. It does not
   * say what that means, what is missing, or what to do about it. There
   * is no "you have not done any mobility lately", because that is the
   * app deciding a gap is a fault -- and a gap is often the most
   * sensible thing somebody did that month.
   *
   * NO STREAK. No consecutive count, no longest run, no "keep it going".
   * Permanent product constraint, not a preference.
   *
   * NO COMPARISON, to other people or to a past self. Ordered by count
   * because a list needs an order, NOT ranked -- there is no "top" and
   * nothing is called most or least.
   *
   * ENTRIES PREDATING TWO-ENGINE carry no sessionType and are skipped
   * rather than bucketed as "other". A synthetic bucket would grow with
   * history the person cannot see the shape of, and would look like a
   * kind of session rather than an absence of a record.
   */
  function renderSessionShapes(tier) {
    if (tier === 'free') return '';

    const completed = store.completedSessions(store.get('activityLog'));
    const cutoff    = _cutoffDate(activeWindow);
    // LOOK-2. Every kind of session, not only built ones: classes, yoga,
    // walks and your own sessions are kinds too. A built session (type
    // workout) with no recorded e.sessionType predates TWO-ENGINE and is
    // still SKIPPED, never bucketed; so is a type nobody can name.
    const recent    = completed.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      if (!(ts && new Date(ts) >= cutoff)) return false;
      if (e.type === 'workout' && !e.sessionType) return false;
      return _kindLabel(e) !== null;
    });

    // Silent when there is nothing to show. An empty state here would
    // read as an unfinished task on a screen somebody opened to look
    // back, not to be given something else to do.
    if (recent.length === 0) return '';

    const counts = new Map();
    for (const e of recent) {
      const label = _kindLabel(e);
      const was = counts.get(label) || { count: 0, kind: kindOf(e) };
      counts.set(label, { count: was.count + 1, kind: was.kind });
    }
    const rows = [...counts.entries()].sort((a, b) => b[1].count - a[1].count);

    return `
      <section class="pr-card progress-shapes" aria-labelledby="pr-kinds-h">
        <!-- PROGRESS-2: h2, a sibling of the other blocks. -->
        <h2 class="pr-card__title progress-shapes__title" id="pr-kinds-h">What kinds of session</h2>
        <!-- Kinds only: the session count is said once, above, and this list
             leaves out sessions with no recorded shape, so a second count
             here would disagree with it. -->
        <p class="pr-card__cap">${rows.length} kind${rows.length === 1 ? '' : 's'} of session.</p>
        <!-- The whole, in parts. Every part is named and counted in the list
             below it, so the bar is never the only carrier (1.4.1). -->
        <div class="pr-kinds" aria-hidden="true">
          ${rows.map(([, r]) => `<span class="pr-kinds__part pr-k--${r.kind}" style="flex-grow:${r.count}"></span>`).join('')}
        </div>
        <ul class="progress-shapes__list">
          ${rows.map(([label, r]) => `
            <li class="progress-shapes__row">
              <span class="pr-dot pr-k--${r.kind}" aria-hidden="true"></span>
              <span class="progress-shapes__name">${_esc(label)}</span>
              <span class="progress-shapes__count">${r.count}</span>
            </li>
          `).join('')}
        </ul>
      </section>
    `;
  }

  /** A kind's name: the built shape from SESSION_TYPES, else the log's own word. */
  function _kindLabel(e) {
    const t = e.sessionType ? SESSION_TYPES.find(x => x.id === e.sessionType) : null;
    if (t) return t.label;
    const noun = activityNoun(e);
    if (!noun || noun === 'other activity') return null;
    return noun.charAt(0).toUpperCase() + noun.slice(1);
  }

  /**
   * The eight SESSION_TYPES labels, resolved from session-builder rather
   * than a private map here. A second copy of these names would drift
   * the first time one changed -- which is exactly what the retired
   * getWorkoutName() did with its three.
   */
  /**
   * LOG-CLASS-1, 08 Sep 2026. Was `t ? t.label : id` -- echoing its own
   * input on a miss, which is the THIRD instance of that shape found
   * today. formatRole() in workout.js printed the word UNDEFINED on
   * every card of every coach-built session (ROLE-1); _formatType() just
   * above printed a raw strand id; and this printed "class".
   *
   * ⚫ The pattern is worth naming: a lookup that ends `|| input` reads
   * as a safe default and is the opposite. It guarantees that the one
   * case nobody thought about is shown to a person verbatim, in
   * developer vocabulary, on a screen about their own life.
   *
   * Falls through to _formatType(), which knows the log's vocabulary and
   * has a readable fallback of its own.
   */
  function _shapeLabel(id) {
    const t = SESSION_TYPES.find(x => x.id === id);
    return t ? t.label : _formatType(id);
  }

  // ── Programme progress ─────────────────────────────────────────────────────

  function renderProgrammeProgress(stats, heading = true) {
    const missedSessions = store.get('activeProgramme.missedSessions') || [];
    const recentMissed   = missedSessions.filter(m => {
      const d = new Date(m.date);
      return d >= _cutoffDate(30);
    });

    return `
      <section class="progress-programme" aria-label="Programme progress">
        ${heading ? `<h2 class="progress-programme__name">${stats.programmeName || 'Your programme'}</h2>` : ''}

        <div class="progress-programme__track">
          <span class="progress-programme__label">
            ${stats.weeksIn === 0
              ? 'Just started'
              : `${stats.weeksIn} ${stats.weeksIn === 1 ? 'week' : 'weeks'} in`} — ${stats.phaseName}
          </span>
        </div>

        <p class="progress-programme__phase-message">${stats.phaseMessage}</p>

        <!--
          TARGET-3, 08 Sep 2026. The weekly target is shown only if the
          person SET one.

          getProgressStats() returns strategicGoal.weeklySessionTarget
          or 3, with no check on whether it was ever chosen.
          (No backticks in this comment: it sits inside a template
          literal, and a stray one closes it. Second time today.) So Progress told somebody who had
          never set a target that they were "0 of 3 this week" — a
          shortfall against a commitment they never made, on the screen
          they open to see how they are doing.

          today.js has guarded this since TARGET-2 and says why:
          "setAt is the honest test of whether it was ever a choice."
          Progress did not. Same rule, same source of truth.

          The count of sessions stays either way. That is a fact about
          what they did; the target is a claim about what they meant to.
        -->
        <div class="progress-programme__stats">
          <span>${stats.totalSessions} session${stats.totalSessions === 1 ? '' : 's'} completed</span>
          <!-- LOOK-2 (Graeme approved, 04 Oct): this week's count with no
               target beside it. "0 of 3 this week" read as a score against
               a target, on the screen opened to look back. The target is
               still kept and shown in Settings › Your plan. -->
          <span>${stats.sessionsThisWeek} this week</span>
        </div>

        ${recentMissed.length > 0 ? `
          <p class="progress-programme__missed">
            ${recentMissed.length} session${recentMissed.length !== 1 ? 's' : ''} not completed
            in the last 30 days — that's normal. The programme adapts.
          </p>` : ''}

        ${stats.milestones.length > 0 ? `
          <div class="progress-programme__milestones" aria-label="Milestones reached">
            <h3 class="progress-programme__milestones-label">Milestones</h3>
            <ul class="progress-programme__milestone-list">
              ${stats.milestones.map(m => `
                <li class="progress-programme__milestone">
                  ${m.label}
                </li>
              `).join('')}
            </ul>
          </div>` : ''}

      </section>
    `;
  }

  // ── Export block ───────────────────────────────────────────────────────────

  // ── SMOOTH-P4a. The arc, read back (Plan) ──────────────────────────────

  /**
   * One bar chart, one hue. A sentence first, so the chart is never the
   * only carrier of the number; every bar has an accessible name; a value
   * is shown on the first and last bar only. `of` draws the whole (all
   * check-ins that week) as an outline behind the filled part.
   */
  function _chart({ id, summary, bars, title }) {
    const max = Math.max(1, ...bars.map(b => Math.max(b.value, b.of || 0)));
    return `
      <figure class="pr-chart" aria-labelledby="${id}-cap">
        <figcaption class="pr-chart__summary" id="${id}-cap">${_esc(summary)}</figcaption>
        <ol class="pr-bars" aria-label="${_esc(title)}">
          ${bars.map((b, i) => {
            // LOOK-2: every bar says its count and its week (at most six).
            const edge = true;
            return `
            <li class="pr-bar" title="${_esc(b.label)}">
              <span class="sr-only">${_esc(b.label)}</span>
              <span class="pr-bar__value" aria-hidden="true">${edge ? _esc(String(b.value)) : ''}</span>
              <span class="pr-bar__track" aria-hidden="true" style="--h:${Math.round(((b.of ?? b.value) / max) * 100)}%">
                <span class="pr-bar__fill" style="--f:${Math.round((b.value / max) * 100)}%"></span>
              </span>
              <span class="pr-bar__week" aria-hidden="true">${edge ? _esc(shortDate(b.start)) : ''}</span>
            </li>`;
          }).join('')}
        </ol>
      </figure>`;
  }

  function renderArcReadback() {
    const arc   = store.get('arc') || {};
    const aim   = arc.active && arc.aimId ? aimById(arc.aimId) : null;
    const now   = new Date();

    if (!aim) {
      return `
        <section class="pr-card pr-block" aria-labelledby="pr-arc-h">
          <h2 class="pr-card__title pr-title" id="pr-arc-h">Your arc</h2>
          <p class="pr-coach">Tell me what you want to be able to do, and this is where it lives — what you’re working towards and what has come up.</p>
          <button class="btn btn-secondary btn-full" data-route="arc-setup">Set up your arc</button>
        </section>`;
    }

    const week    = arcWeek(arc, now);
    const strands = strandReadback(arc, now);

    // LOOK-2. Each strand with a filled mark and when it last came up, or
    // an open mark and Not yet. A date, never a count; the mark is never
    // the only carrier, the words beside it are.
    return `
      <section class="pr-card pr-block" aria-labelledby="pr-arc-h">
        <div class="pr-card__headrow">
          <h2 class="pr-card__title pr-title" id="pr-arc-h">Your arc</h2>
          ${week ? `<span class="pr-card__meta">Week ${week}</span>` : ''}
        </div>
        <p class="pr-aim">“${_esc(aim.label)}”</p>
        ${strands.length ? `
          <h3 class="sr-only" id="pr-strands-h">What your arc works on</h3>
          <ul class="pr-strands" aria-labelledby="pr-strands-h">
            ${strands.map(s => `
              <li class="pr-strand">
                <span class="pr-strand__mark${s.last ? ' pr-strand__mark--on' : ''}" aria-hidden="true"></span>
                <span class="pr-strand__name">${_esc(s.label)}</span>
                <span class="pr-strand__when">${_esc(s.text)}</span>
              </li>`).join('')}
          </ul>
          <p class="pr-note">Nothing is behind. “Not yet” means it hasn’t come up since your arc began.</p>` : ''}
        <button class="btn btn-ghost pr-change" data-route="stretch-arc">Change my arc</button>
      </section>`;
  }

  // P0, SCOPE-MINOR (29 Sep 2026). "What you've told me about" -- a chart
  // per sore area, week by week -- is removed. Charting an injury over
  // time is monitoring it, which is a medical purpose; Alongside only
  // asks what is sore TODAY and leaves out what loads it.

  // LOOK-2. _liftsBlock() is gone: every lift is on its own page (_liftsPage).

  /** Six weeks of completed sessions, both tiers. COUNT-1. */
  function renderSessionsChart() {
    const completed = store.completedSessions(store.get('activityLog'));
    // W4-20. Weeks start when the person did: it showed six weeks, empty
    // ones before they installed, to somebody nine days in.
    const firstDone = completed.map(e => Date.parse(e.completedAt || e.loggedAt || e.date)).filter(Number.isFinite);
    const startMs = Math.min(Date.parse(store.get('createdAt') || '') || Infinity, ...firstDone);
    const weeks = sessionsByWeek(completed, { weeks: 6, since: Number.isFinite(startMs) ? new Date(startMs) : null });
    const total = weeks.reduce((n, w) => n + w.total, 0);
    const over = weeks.length < 6 ? 'since you started' : 'over the last six weeks';
    return `<section class="pr-card" aria-labelledby="pr-weeks-h">
      <h2 class="pr-card__title" id="pr-weeks-h">Sessions each week</h2>
      ${_chart({
      id: 'pr-sessions',
      title: 'Sessions, week by week',
      summary: total
        ? `${total} session${total === 1 ? '' : 's'} ${over}, week by week.`
        : (weeks.length < 6 ? 'No sessions since you started yet.' : 'No sessions in the last six weeks yet.'),
      bars: weeks.map(w => ({ start: w.start, value: w.total,
        label: `Week of ${shortDate(w.start)}: ${w.total} session${w.total === 1 ? '' : 's'}` }))
    })}
    </section>`;
  }

  /** Free: last, quiet. Nothing greyed out, nothing locked. */
  function renderPlanCard() {
    return `
      <section class="pr-card pr-block pr-plan-card" aria-labelledby="pr-plan-h">
        <h2 class="pr-title" id="pr-plan-h">On the Plan</h2>
        <p class="pr-coach">Your goal lives here too: what you’re working towards, what has come up, and what your logged weights show.</p>
        <button class="btn btn-ghost btn-full" data-route="upgrade">What the Plan adds</button>
      </section>`;
  }

  function renderExportBlock(heading = true) {
    return `
      <section class="progress-export" aria-label="Export your progress">
        ${heading ? '<h2 class="progress-export__heading">Share your progress</h2>' : ''}
        <p class="progress-export__intro">Three versions — each written for a different reader.</p>
        <div class="progress-export__buttons">
          <button class="progress-export__btn"
                  data-export="self"
                  aria-label="Export for yourself — your full picture, coach voice">
            For me
          </button>
          <button class="progress-export__btn"
                  data-export="friend"
                  aria-label="Export for a friend — plain English, no jargon">
            For a friend
          </button>
          <button class="progress-export__btn"
                  data-export="professional"
                  aria-label="The version to share with someone who helps you train — plain and structured">
            For a professional
          </button>
        </div>
        <p class="progress-export__status" role="status" aria-live="polite" data-export-status></p>
        <div class="progress-export__fallback" data-export-fallback hidden>
          <label for="progress-export-text" class="progress-export__fallback-label">Copying isn't allowed here, so here is the text. Select it and copy it.</label>
          <textarea id="progress-export-text" class="form-input progress-export__text" readonly rows="8"></textarea>
        </div>
      </section>
    `;
  }

  // R4, 20 Aug 2026. renderExportLocked() is REMOVED, not left unused.
  // A dead paywall renderer is a working example somebody reinstates.
  //
  // FLAGGED, NOT FIXED (touch-once): the CSS classes it used --
  // .progress-export--locked, .progress-export__lock and its two child
  // classes -- are now dead in the stylesheet. Left alone deliberately;
  // the stylesheet is outside this session's file list.

  // ── Events ─────────────────────────────────────────────────────────────────

  function attachEvents(container, tier) {
    // WEIGHT-1b. Logging is user-initiated, always. Nothing here asks.
    container.querySelector('[data-action="log-weight"]')
      ?.addEventListener('click', () => {
        const unit = store.get('weightUnit') || 'kg';
        const main = container.querySelector('#weight-log-input');
        if (!main) return;

        let kg = null;
        if (unit === 'st') {
          const lb = container.querySelector('#weight-log-input-lb')?.value;
          if (main.value !== '' || (lb !== '' && lb !== undefined)) {
            kg = toKg({ st: Number(main.value || 0), lb: Number(lb || 0) }, 'st');
          }
        } else if (main.value !== '') {
          kg = toKg(main.value, unit);
        }
        if (kg === null || !(kg > 0)) return;

        const log = (store.get('weightLog') || []).slice();
        log.push({ at: new Date().toISOString(), kg });
        store.set('weightLog', log);

        // The current weight follows the most recent entry, so the
        // set-time bands judge against something true rather than
        // whatever was typed into Settings months ago.
        store.set('weight', kg);

        render(container);
      });

    // Window tabs
    container.querySelectorAll('[data-window]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeWindow = parseInt(btn.dataset.window);
        render(container);
        // Return focus to active tab after re-render
        const newTab = container.querySelector(`[data-window="${activeWindow}"]`);
        if (newTab) newTab.focus();
      });
    });

    // Export buttons
    container.querySelectorAll('[data-export]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.export;
        _handleExport(type);
      });
    });

    container.querySelector('#progress-year-btn')
      ?.addEventListener('click', () => router.navigate('annual-reflection'));

    // LOOK-2. A row opens its page; Back returns to the overview, on the row.
    container.querySelectorAll('[data-pr-page]').forEach(btn =>
      btn.addEventListener('click', () => {
        activePage = btn.dataset.prPage;
        focusAfter = '.progress-title';
        render(container);
      }));
    container.querySelector('#pr-back')?.addEventListener('click', () => {
      const from = activePage;
      activePage = null;
      focusAfter = `[data-pr-page="${from}"]`;
      render(container);
    });

    // SMOOTH-P4a. Change my arc, Set up your arc, What the Plan adds.
    container.querySelectorAll('[data-route]').forEach(btn =>
      btn.addEventListener('click', () => router.navigate(btn.dataset.route)));
    // R4: the locked-export tap handler is gone with its renderer.
  }

  // ── Coach observation builder ──────────────────────────────────────────────

  /**
   * Build coach narrative lines for the current lookback window.
   * Pattern detection in plain English. Never statistics.
   *
   * Free tier: one observation line.
   * Personal: up to four observations, read as connected paragraphs.
   *
   * @returns {{ lines: string[] }}
   */
  function _buildObservation(activityLog, checkinHistory, stats, windowDays, tier, name) {
    const cutoff  = _cutoffDate(windowDays);
    const recent  = activityLog.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts) >= cutoff;
    });

    const lines = [];
    const count = recent.length;

    // ── Line 1 — the RECORD. What you did, stated plainly.
    //
    // TIER-E. The appraisals that used to hang off these counts --
    // "That's a real habit", "That's consistent movement", "Consistency
    // like that changes things" -- are gone. Two reasons, and the second
    // matters more than the first.
    //
    // P4: the coach displays but never interprets. "That's a real
    // habit" is a verdict on the person, delivered on the strength of a
    // number crossing ten. Somebody who did nine sessions through a
    // hard fortnight got told they were "building something"; somebody
    // who did ten got promoted to a habit. That is exactly the
    // arithmetic this product refuses everywhere else.
    //
    // And they were doing the work that READING should do. If the free
    // record already appraises, there is nothing left for Personal to
    // add but a bigger number -- which is the failure section 4.1
    // names. Stripping them is what makes room for the difference.
    const period = windowDays === 14 ? 'this fortnight'
                 : windowDays === 30 ? 'in the last 30 days'
                 : windowDays === 90 ? 'over the last 90 days'
                 : 'in this window';

    // SMOOTH-P4a. The most common kind, said plainly: a fact, not a verdict.
    // P7: counted by what a person would call it (activity-labels.js).
    const { topKind } = sessionsInWindow(recent, { days: windowDays + 1, kindOf: e => activityNoun(e) });
    // Free only: the Plan's read below already names the lean, in its own words.
    const mostly = tier === 'free' && topKind && count > 1 ? `, mostly ${topKind}` : '';
    if (count === 0) {
      lines.push('Nothing logged in this window. Whenever you\'re ready — the app is here.');
    } else if (count === 1) {
      lines.push(`You\'ve moved once ${period}.`);
    } else {
      lines.push(`You\'ve moved ${count} times ${period}${mostly}.`);
    }

    if (tier === 'free' || !lines.length) return { lines: lines.length ? lines : ['Keep going.'] };

    // ── Everything below is the READ, and Personal only. ──────────────
    //
    // Not more data — a different act. Line R comes first because it is
    // the one that says something a person could not have counted for
    // themselves.
    const showedUpAnyway = _readShowedUpAnyway(checkinHistory, recent, windowDays);
    if (showedUpAnyway) lines.push(showedUpAnyway);

    // Line 2 — energy pattern (Personal only).
    //
    // Suppressed when the read above already fired: that read is
    // ABOUT low energy, so following it with "Energy has been low in
    // this window. The sessions you did were worth more because of
    // that" says the same thing twice and blunts the better line.
    // Mechanical de-duplication only — the existing copy is unchanged.
    const energyPattern = showedUpAnyway ? null : _detectEnergyPattern(checkinHistory, windowDays);
    if (energyPattern) lines.push(energyPattern);

    // Line 3 — activity type pattern (Personal only)
    const typePattern = _detectTypePattern(recent);
    if (typePattern) lines.push(typePattern);

    // Line 4 — programme context (Personal only, if active)
    if (stats.hasActiveProgramme) {
      const programmeObs = _programmeObservation(stats, recent);
      if (programmeObs) lines.push(programmeObs);
    }

    return { lines };
  }

  /**
   * The READ. TIER-E, 13 Aug 2026.
   *
   * The tier boundary document's own example of what Personal does that
   * free cannot:
   *
   *   "You've come in low-energy eleven times. Nine of those, you
   *    finished. I don't think you know that about yourself."
   *
   * Why THIS observation and not another: it is the one a person could
   * not have counted for themselves. Session totals they could tally.
   * The overlap between how they arrived and what they then did is
   * invisible from the inside, and it is the single most useful thing
   * this app knows about somebody -- it is the evidence for the whole
   * premise, that showing up when you feel bad is the actual skill.
   *
   * P4 COMPLIANCE, because this is the line most at risk of breaching
   * it. It points at what was noticed and attaches no verdict. It does
   * not say the person is resilient, disciplined, or doing well. The
   * closing sentence is about what they KNOW, not about their worth,
   * and it is Graeme's own wording from the boundary document.
   *
   * Deliberately silent unless there is something real to say: at least
   * three low-energy arrivals, at least three of them completed, and a
   * majority. A "read" manufactured from two data points is a
   * horoscope, and one that fires when the answer is unflattering would
   * be the coach keeping score.
   *
   * The three-COMPLETED floor was added after rendering it: with only
   * the arrivals floor, Danny's fortnight produced "you've come in low
   * 3 times, 2 of those you moved anyway" — technically true, and it
   * puts "I don't think you know that about yourself" on top of a
   * number that also says he did not, once. The line has to be worth
   * the weight of its closing sentence. It waits until it is.
   */
  function _readShowedUpAnyway(checkinHistory, recent, windowDays) {
    const cutoff = _cutoffDate(windowDays);

    // Low-energy arrivals: energy 4 or below at check-in.
    const lowDays = Object.entries(checkinHistory)
      .filter(([date, v]) =>
        new Date(date) >= cutoff && typeof v?.energy === 'number' && v.energy <= 4)
      .map(([date]) => date);

    if (lowDays.length < 3) return null;

    // Did a session land on that same day? activityLog timestamps are
    // ISO; checkinHistory keys are YYYY-MM-DD, so compare on the date
    // part only. Using the same field precedence the rest of this file
    // uses (completedAt || loggedAt || date) rather than a new one.
    const sessionDays = new Set(
      recent.map(e => {
        const ts = e.completedAt || e.loggedAt || e.date;
        return ts ? new Date(ts).toISOString().split('T')[0] : null;
      }).filter(Boolean)
    );

    const finished = lowDays.filter(d => sessionDays.has(d)).length;
    if (finished < 3) return null;
    if (finished < Math.ceil(lowDays.length / 2)) return null;

    const times = `${lowDays.length} times`;   // floor of 3 above
    const done  = finished === lowDays.length
      ? 'Every one of those'
      : `${finished} of those`;

    return `You've come in low on energy ${times}. ${done}, you moved anyway. ` +
           `I don't think you know that about yourself.`;
  }

  function _detectEnergyPattern(checkinHistory, windowDays) {
    const cutoff = _cutoffDate(windowDays);
    const entries = Object.entries(checkinHistory)
      .filter(([date]) => new Date(date) >= cutoff)
      .map(([, v]) => v);

    if (entries.length < 3) return null;

    const energyValues = entries.map(e => e.energy).filter(v => typeof v === 'number');
    if (energyValues.length < 3) return null;

    const avg = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;

    if (avg >= 7) return 'Your energy scores have been high in this window. That\'s worth noting.';
    if (avg <= 4) return 'Energy has been low in this window. The sessions you did were worth more because of that.';

    // Check for trend
    const first = energyValues.slice(0, Math.floor(energyValues.length / 2));
    const last  = energyValues.slice(Math.floor(energyValues.length / 2));
    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const lastAvg  = last.reduce((a, b) => a + b, 0) / last.length;

    if (lastAvg - firstAvg >= 1.5) return 'Energy has been rising through this window. The movement is doing something.';
    if (firstAvg - lastAvg >= 1.5) return 'Energy has been lower towards the end of this window. Worth paying attention to.';

    return null;
  }

  function _detectTypePattern(recent) {
    if (recent.length < 3) return null;

    const types = _countByType(recent);
    const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);

    if (!sorted.length) return null;

    const [topType, topCount] = sorted[0];
    const fraction = topCount / recent.length;

    if (fraction >= 0.6) {
      return `Most sessions in this window have been ${_formatType(topType)}. A clear lean.`;
    }

    if (sorted.length >= 3) {
      return 'Good variety in this window — different kinds of sessions, different things asked of the body.';
    }

    return null;
  }

  function _programmeObservation(stats, recent) {
    // COUNTDOWN-1. "The end is close" and "halfway through" were both
    // distance-to-the-end statements. Kept as milestones, reworded to
    // face backwards: what has been done, not what is left.
    if (stats.weeksIn >= 10) {
      return `${stats.weeksIn} weeks in. The habit is already built.`;
    }
    if (stats.currentWeek === 6 && !stats.midProgrammeGlanceShown) {
      return 'Five weeks done. That\'s a real marker.';
    }
    if (stats.sessionsThisWeek >= stats.weeklyTarget) {
      return `This week\'s sessions done. The programme is on track.`;
    }
    return null;
  }

  // ── Export handler ─────────────────────────────────────────────────────────

  function _handleExport(type) {
    // E2, 13 Aug 2026. This was the last raw activityLog read in the
    // file. Every count ON SCREEN routes through completedSessions()
    // (:156, :178, and today.js :285/:451/:501) and this one did not --
    // so the document a Personal user copies out, plausibly to show a
    // physio or a GP, reported a HIGHER session count than the screen it
    // came from, by the number of partials in the window.
    //
    // verify-count1.mjs missed it because it asserted `via >= 2` -- that
    // AT LEAST TWO reads are compliant, not that all are. progress.js
    // had three, two compliant, gate green. A threshold gate cannot
    // detect the case it exists for; the gate is corrected alongside this.
    const activityLog    = store.completedSessions(store.get('activityLog'));
    const checkinHistory = store.get('checkinHistory') || {};
    const goals          = store.get('goals') || [];
    const name           = store.get('name') || 'User';
    const stats          = getProgressStats();
    const cutoff         = _cutoffDate(activeWindow);
    const recent         = activityLog.filter(e => {
      const ts = e.completedAt || e.loggedAt || e.date;
      return ts && new Date(ts) >= cutoff;
    });

    const goalLabels = goals.map(g => getGoalLabel(g)).join(', ');
    const text       = _buildExportText(type, name, recent, stats, goalLabels, activeWindow);

    // Write to clipboard — if not allowed, show the text to copy (v17)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        _showExportConfirmation(type);
      }).catch(() => {
        _fallbackExport(text);
      });
    } else {
      _fallbackExport(text);
    }
  }

  function _buildExportText(type, name, recent, stats, goalLabels, windowDays) {
    const date  = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const count = recent.length;
    const mins  = recent.reduce((acc, e) => acc + (e.durationMins || 0), 0);

    if (type === 'self') {
      return [
        `Progress — ${date}`,
        ``,
        `${count} session${count === 1 ? "" : "s"} in the last ${windowDays} days. ${mins} minutes of movement.`,
        stats.hasActiveProgramme
          ? `Programme: ${stats.programmeName} — ${stats.weeksIn} week${stats.weeksIn === 1 ? '' : 's'} in, ${stats.totalSessions} session${stats.totalSessions === 1 ? '' : 's'}.`
          : '',
        goalLabels ? `Working towards: ${goalLabels}.` : '',
        ``,
        `Generated by Alongside.`,
      ].filter(Boolean).join('\n');
    }

    if (type === 'friend') {
      return [
        `Here's what I've been up to with my movement practice:`,
        ``,
        `${count} session${count === 1 ? "" : "s"} over the last ${windowDays} days — ${mins < 90 ? `${mins} minutes` : `about ${Math.round(mins / 60)} hours`} of movement in all.`,
        stats.hasActiveProgramme
          ? `I'm on week ${stats.currentWeek} of a 12-week programme called ${stats.programmeName}.`
          : '',
        ``,
        `Tracking it with an app called Alongside.`,
      ].filter(Boolean).join('\n');
    }

    if (type === 'professional') {
      return [
        `Movement summary for ${name}`,
        `Generated: ${date}`,
        `Period: last ${windowDays} days`,
        ``,
        `Sessions completed: ${count}`,
        `Total duration: ${mins} minutes`,
        stats.hasActiveProgramme
          ? [
              `Active programme: ${stats.programmeName}`,
              `Programme week: ${stats.currentWeek} / 12`,
              // TARGET-3. Same rule: no target named unless one was set.
              store.get('strategicGoal.setAt')
                ? `Sessions this week: ${stats.sessionsThisWeek} (target: ${stats.weeklyTarget})`
                : `Sessions this week: ${stats.sessionsThisWeek}`,
              `Total programme sessions: ${stats.totalSessions}`,
            ].join('\n')
          : 'No active programme.',
        goalLabels ? `Stated goals: ${goalLabels}` : '',
        ``,
        `Data source: Alongside (buildnewhabits.co.uk)`,
        `Note: self-reported data via PWA. No medical device.`,
      ].filter(Boolean).join('\n');
    }

    return '';
  }

  function _showExportConfirmation(type) {
    const labels = { self: 'your version', friend: 'the friend version', professional: 'the professional version' };
    // v17. Said where the button is, in a status line that is always in
    // the page (a live region added at the moment of speaking is often
    // not read). Cleared after a while so the next copy is announced too.
    const status = document.querySelector('[data-export-status]');
    const fb = document.querySelector('[data-export-fallback]');
    if (fb) fb.hidden = true;
    if (status) {
      status.textContent = `Copied ${labels[type] || 'your progress'}. Paste it wherever you like.`;
      clearTimeout(_showExportConfirmation._t);
      _showExportConfirmation._t = setTimeout(() => { status.textContent = ''; }, 6000);
    }
  }

  function _fallbackExport(text) {
    // v17. Was alert(): not selectable on most phones, so nothing could
    // be copied. The text itself, in a labelled read-only field, selected
    // and focused so one Copy finishes the job.
    const fb = document.querySelector('[data-export-fallback]');
    const area = fb?.querySelector('textarea');
    if (!fb || !area) return;
    area.value = text;
    fb.hidden = false;
    const status = document.querySelector('[data-export-status]');
    if (status) status.textContent = '';
    area.focus();
    area.select();
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  function _cutoffDate(windowDays) {
    const d = new Date();
    d.setDate(d.getDate() - windowDays);
    return d;
  }

  function _countByType(entries) {
    return entries.reduce((acc, e) => {
      const t = e.type || e.activityType || 'movement';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
  }

  // P7. The one label map. Was its own, keyed on names nothing writes.
  function _formatType(type) {
    return activityNoun({ type });
  }

  return { mount };
}
