/**
 * my-programme.js - My Programme
 *
 * 16 Aug 2026 v1
 *
 * CHAP-1 step 2, per alongside_blueprint_chapters_15aug2026_v1.md §8.
 *
 * Graeme's design, and his reasoning was the same as his Settings
 * observation: things exist and nothing shows them. A person has goals,
 * a level, a chapter and a target spread across four screens, and
 * nowhere to see any of it together.
 *
 * READS ONLY. No engine change, no new store field, nothing written.
 * Every number on this screen has a confirmed writer -- checked before
 * it was displayed, not after:
 *
 *   activeProgramme.totalSessions   programmeEngine.js recordSession()
 *   activeProgramme.currentWeek     programmeEngine.js advanceWeekIfNeeded()
 *   assessment                      store.recordAssessment()
 *   goals                           onboarding/thread.js
 *   strategicGoal.weeklySessionTarget  goal-setup.js (setAt guards it)
 *
 * THE RULE THIS WHOLE SCREEN OBEYS (blueprint §3):
 *
 *   Keep the milestone. Remove the countdown. Show progress made,
 *   never distance remaining.
 *
 * So: weeks IN, never weeks left. Sessions done, never sessions short.
 * No percentage, no bar, no "you're 75% of the way there". The
 * goal-gradient effect is real and milestones do motivate, but the
 * standard progress bar works by amplifying perceived obligation, which
 * is persona 2.5's declared territory with a countdown drawn on it.
 *
 * THE ONE EXCEPTION, and it is the reason strategicGoal.targetDate
 * exists: a date the PERSON supplied. A twelve-week bar is a
 * manufactured deadline; a hike on 14 September is a real one, and
 * counting toward it is the app being useful about a fact rather than
 * applying pressure. Countdowns only ever against a date somebody
 * brought. Never against a programme length.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * The weekly focus (blueprint §6) is build step 4 and nothing writes
 * weekFocus.key yet. Rendering a section for it now would put warm,
 * reviewed copy on a screen where no user could ever reach it -- which
 * is the exact fault that shipped eleven times on 15 Aug and cost a day
 * to find. The section arrives with its writer.
 *
 * TIER. Not gated. Programmes are Personal, but a free user still has
 * goals, a level and sessions done, and this screen shows each person
 * what they actually have. Sections with no data are absent rather than
 * locked, and nothing about a programme is invented for somebody who
 * has none. Whether the row should instead be a Personal-tier upsell is
 * a product decision and is flagged for Graeme, not taken here.
 *
 * WCAG 2.2 AA: single h1, h2 per section, role="main" with a label,
 * semantic lists for the arc, no meaning carried by colour alone, the
 * back control is a real button with a visible text label and a 44px
 * target.
 */

import { store }                from '../store.js';
import { getProgramme }         from '../data/programmes.js';
import { getGoalLabel }         from '../data/goals.js';
import { advanceWeekIfNeeded }  from '../data/programmeEngine.js';

export function MyProgrammeView(router) {

  function mount(container) {
    // Idempotent, and it returns early unless a week has genuinely
    // turned. Home calls it too; this screen must not show a staler
    // week than the one the person just came from.
    advanceWeekIfNeeded();
    render(container);
  }

  function render(container) {
    const sections = [
      _whereYouAre(),
      _theArc(),
      _whatYoureAimingAt()
    ].filter(Boolean);

    container.innerHTML = `
      <div class="my-programme-view" role="main" aria-label="My Programme">

        <header class="my-programme-header">
          <h1 class="my-programme-title">My Programme</h1>
        </header>

        <div class="my-programme-body">
          ${sections.length
            ? sections.join('')
            : `<p class="my-programme-empty">
                 There is not much to show here yet. It fills in as we go.
               </p>`}
        </div>

        <button class="btn btn-ghost btn-full my-programme-back"
                data-action="back"
                aria-label="Back to today">
          Back
        </button>

      </div>
    `;

    attachEvents(container);
  }

  // ── 1. Where you are ────────────────────────────────────────────────

  function _whereYouAre() {
    const ap        = store.get('activeProgramme') || {};
    const programme = ap.programmeId ? getProgramme(ap.programmeId) : null;
    const lines     = [];

    if (programme) {
      // The week count leaves the name (blueprint §5). "Back to
      // Strength" is a chapter; "12-Week Back to Strength" is a
      // deadline. The taglines in programmes.js still carry "12-week",
      // which is why none of them is rendered here.
      const weeksIn  = Math.max(0, (ap.currentWeek || 1) - 1);
      const sessions = ap.totalSessions || 0;

      // One flag, two vocabularies -- never two engines. Both count
      // FORWARD from the start; neither can produce a number that
      // shrinks as a deadline approaches.
      const blocks = store.get('programme')?.presentation === 'blocks';

      const progress = weeksIn === 0
        ? "You have just started this one."
        : blocks
        ? `Week ${weeksIn} done.`
        : `${weeksIn} ${weeksIn === 1 ? "week" : "weeks"} in.`;

      const sessionLine = sessions > 0
        ? ` ${sessions} ${sessions === 1 ? "session" : "sessions"} so far.`
        : '';

      lines.push(`<p class="my-programme-chapter">${_esc(programme.name)}</p>`);
      lines.push(`<p class="my-programme-line">${_esc(progress + sessionLine)}</p>`);
    } else {
      const done = store.completedSessions(store.get('activityLog') || []).length;
      lines.push(`<p class="my-programme-line">
        You are not following a chapter at the moment. Each session gets
        chosen for where you are on the day.
      </p>`);
      if (done > 0) {
        lines.push(`<p class="my-programme-line">${done} ${done === 1 ? "session" : "sessions"} so far.</p>`);
      }
    }

    const read = _lastReadLine();
    if (read) lines.push(`<p class="my-programme-line">${_esc(read)}</p>`);

    return _section("Where you are", lines.join(''));
  }

  /**
   * What the last read found -- as what the coach DID with it, never as
   * a level or a score.
   *
   * "You are active now" would be a label pinned on somebody. "I am
   * aiming a bit higher" is a decision they can see the effect of and
   * argue with. Same register as assessment.js's baselineAck(), and the
   * same reason: there is no score in this product and there must never
   * be one, because a number invites comparison and becomes a target.
   *
   * 'down' is a first-class answer here as it is in the store. Somebody
   * returning after illness gets an honest read, and a measure that only
   * ratchets upward becomes one more thing to fall behind.
   */
  function _lastReadLine() {
    const change = store.assessmentChange();
    if (change && change.direction === 'up') {
      return "Your last read moved up, so I am aiming a bit higher than I was.";
    }
    if (change && change.direction === 'down') {
      return "Your last read eased back, so I have eased off to match. We can build again from there.";
    }
    const baseline = store.get('assessment')?.baseline;
    if (baseline) {
      return "I took a read of where you are at your first session, and that is what I am working from.";
    }
    return null;
  }

  // ── 2. The arc ──────────────────────────────────────────────────────

  function _theArc() {
    const ap        = store.get('activeProgramme') || {};
    const programme = ap.programmeId ? getProgramme(ap.programmeId) : null;
    const done      = store.get('programme')?.chaptersDone || [];

    if (!programme && !done.length) return null;

    const parts = [];

    if (done.length) {
      parts.push(`
        <ul class="my-programme-arc" aria-label="Chapters you have finished">
          ${done.map(c => `
            <li class="my-programme-arc__item">
              <span class="my-programme-arc__name">${_esc(c.name || "A chapter")}</span>
              ${c.completedAt
                ? `<span class="my-programme-arc__when">${_esc(_month(c.completedAt))}</span>`
                : ''}
            </li>
          `).join('')}
        </ul>
      `);
    }

    if (programme) {
      parts.push(`<p class="my-programme-line">Now: ${_esc(programme.name)}</p>`);

      // CHAIN-1 gave every programme a successor. The blueprint turns
      // that chain from a rail into a DEFAULT: the next chapter is
      // chosen at the hinge, informed by what the reassessment found,
      // and it is changeable. Graeme: "I might change my priorities, I
      // might develop quicker, or not." So this says what would likely
      // follow and says plainly that it is not settled -- it must not
      // read as a track already laid.
      const next = programme.nextProgrammeId ? getProgramme(programme.nextProgrammeId) : null;
      if (next) {
        parts.push(`<p class="my-programme-line my-programme-line--soft">
          ${_esc(`If things carry on as they are, ${next.name} would likely come next. Nothing is fixed — we will decide when you get there.`)}
        </p>`);
      }
    }

    return _section("The arc", parts.join(''));
  }

  // ── 3. What you are aiming at ───────────────────────────────────────

  function _whatYoureAimingAt() {
    const sg    = store.get('strategicGoal') || {};
    const goals = store.get('goals') || [];
    const parts = [];

    const named = sg.primaryGoal
      ? [getGoalLabel(sg.primaryGoal)]
      : goals.map(g => getGoalLabel(g)).filter(Boolean);

    if (named.length) {
      parts.push(`
        <ul class="my-programme-goals" aria-label="What you told me you are after">
          ${named.map(n => `<li class="my-programme-goals__item">${_esc(n)}</li>`).join('')}
        </ul>
      `);
    }

    // HOME-1's rule, and for the same reason. weeklySessionTarget
    // defaults to 3 with setAt: null -- the field literally records that
    // nobody agreed to it. Showing an unagreed number here would put
    // persona 2.12 two short of something he never chose, on the one
    // screen that is meant to tell him where he stands.
    if (sg.setAt && sg.weeklySessionTarget) {
      parts.push(`<p class="my-programme-line">
        You said you would aim for ${sg.weeklySessionTarget} a week.
      </p>`);
    }

    // The event, and the ONLY countdown in this product.
    //
    // It is honest because the person supplied the date. Nothing here
    // manufactures one, and there is deliberately no branch that counts
    // toward a programme length -- see the gate.
    if (sg.targetDescription) {
      parts.push(`<p class="my-programme-line">${_esc(sg.targetDescription)}</p>`);
    }
    if (sg.targetDate) {
      const days = _daysUntil(sg.targetDate);
      parts.push(`<p class="my-programme-line">
        ${_esc(_dayMonth(sg.targetDate))}${days !== null && days > 0
          ? _esc(` — ${days} ${days === 1 ? "day" : "days"} to go`)
          : ''}
      </p>`);
    }

    if (!parts.length) return null;
    return _section("What you are aiming at", parts.join(''));
  }

  // ── Shared ──────────────────────────────────────────────────────────

  function _section(heading, inner) {
    if (!inner) return null;
    return `
      <section class="my-programme-section" aria-label="${_esc(heading)}">
        <h2 class="my-programme-section__title">${_esc(heading)}</h2>
        ${inner}
      </section>
    `;
  }

  function attachEvents(container) {
    container.querySelector('[data-action="back"]')
      ?.addEventListener('click', () => router.navigate('today'));
  }

  function _daysUntil(iso) {
    const then = new Date(iso);
    if (isNaN(then.getTime())) return null;
    const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = startOfDay(then) - startOfDay(new Date());
    return Math.round(diff / 86400000);
  }

  function _dayMonth(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  }

  function _month(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }

  function _esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { mount };
}
