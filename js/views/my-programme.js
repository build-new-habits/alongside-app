/**
 * my-programme.js - My Programme
 *
 * 17 Aug 2026 v3
 *   CHAP-1 step 4. "This week" arrives, with its editor — v1 withheld
 *   it because nothing wrote weekFocus.key, and said the section would
 *   arrive with its writer. It has.
 *
 * 16 Aug 2026 v2
 *
 * v2 - TIER. Graeme's decision, 16 Aug: My Programme is a Personal
 *   feature, but a free user still has goals and a level, and "whatever
 *   they have available should be there" while still being able to see
 *   what Personal offers.
 *
 *   So the rule is: SHOW EVERYTHING THE PERSON ACTUALLY HAS, whatever
 *   their tier, and add ONE locked preview of what Personal adds. Never
 *   hide a fact somebody owns behind a paywall -- their goals, their
 *   sessions and their own read are theirs, not features.
 *
 *   Gated on DATA FIRST, then tier. A free user with a programme in
 *   their store still sees it; the lock is for what they do not have,
 *   which is what a lock is for. Gating on tier first would have hidden
 *   real data from somebody who had it.
 *
 *   One lock, not three. Locking each absent section separately would
 *   turn a screen about where somebody is going into a page of things
 *   they cannot have, which is the opposite of what it is for. Same
 *   pattern as progress.js's locked window tabs and WOW-4's principle
 *   that nothing is a dead end: the locked block explains itself and
 *   offers a route rather than being absent or inert.
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
 * TIER. See the v2 note above. Data first, then tier; one locked
 * preview, never a locked fact.
 *
 * WCAG 2.2 AA: single h1, h2 per section, role="main" with a label,
 * semantic lists for the arc, no meaning carried by colour alone, the
 * back control is a real button with a visible text label and a 44px
 * target.
 */

import { store }                from '../store.js';
import { isPremium, lockedFeature } from '../auth.js';
import { getProgramme }         from '../data/programmes.js';
import { getGoalLabel }         from '../data/goals.js';
import { advanceWeekIfNeeded }  from '../data/programmeEngine.js';
import { currentWeekFocus, setWeekFocus, focusLine, FOCUS_OPTIONS }
  from '../data/week-focus.js';

export function MyProgrammeView(router) {

  // Whether the picker is open is not a fact about the person, so it
  // lives here and not in the store.
  let _focusEditing = false;

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
      _thisWeeksFocus(),
      _theArc(),
      _whatYoureAimingAt(),
      _whatPersonalAdds()
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

  // ── 1b. This week (CHAP-1 step 4) ───────────────────────────────────

  /**
   * The section v1 deliberately withheld. Its note said "the section
   * arrives with its writer" -- this is that, and the writer now
   * measurably tilts a session rather than only claiming to.
   *
   * ABSENT, never empty. No focus -- no read to propose from, or the
   * person declined one -- and this returns null and the screen says
   * nothing. §6: its absence is never mentioned.
   *
   * NOTHING IS COUNTED. No "2 of 3 focus sessions", no tick, no record
   * of whether it was honoured. A focus reported on at week end is a
   * target wearing a different hat.
   */
  function _thisWeeksFocus() {
    const focus = currentWeekFocus();
    const line  = focusLine();
    if (!focus && !_focusEditing) return null;

    const parts = [];
    if (line) parts.push(`<p class="my-programme-line">${_esc(line)}</p>`);

    if (_focusEditing) {
      parts.push(`
        <ul class="my-programme-focus" aria-label="Choose what I lean towards this week">
          ${FOCUS_OPTIONS.map(o => `
            <li><button class="btn btn-ghost btn-small"
                    data-focus="${_esc(o.key)}"
                    aria-pressed="${focus && focus.key === o.key ? 'true' : 'false'}"
                    >${_esc(_capitalise(o.label))}</button></li>
          `).join('')}
          <li><button class="btn btn-ghost btn-small" data-focus="none">No focus this week</button></li>
        </ul>
      `);
    } else {
      parts.push(`
        <button class="btn btn-ghost btn-small" data-action="edit-focus"
                aria-label="Change what I lean towards this week">Lean towards something else</button>
      `);
    }

    return _section("This week", parts.join(''));
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
      //
      // Personal only, and NOT for the reason a paywall usually is. A
      // free user seeing "Back to Strength would likely come next" and
      // then a locked block explaining that chapters follow on from each
      // other is the screen contradicting itself in two paragraphs --
      // promising the chain above and selling it below. The successor IS
      // the chain, so it belongs on one side of the line or the other.
      // Caught by mounting the free-with-a-programme state and reading
      // it, not by reasoning about it.
      const next = (isPremium() && programme.nextProgrammeId)
        ? getProgramme(programme.nextProgrammeId)
        : null;
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

  // ── What Personal adds ──────────────────────────────────────────────

  /**
   * The one lock on this screen, and it is shown only when there is
   * genuinely something the person does not already have.
   *
   * It describes what Personal ADDS rather than what free withholds,
   * and it names two real things -- chapters that follow on from each
   * other, and a date to work toward -- rather than a generic upsell.
   * A locked control that cannot say what it unlocks is just a wall.
   *
   * It renders LAST, under what the person does have, so the screen
   * still opens on their own goals and their own progress. A paywall at
   * the top would make "where am I going?" answer "nowhere, unless you
   * pay", which is not the product.
   *
   * No countdown and no number in here either. The rules of the screen
   * do not relax because the block is selling something.
   *
   * The wrapper is interactive and routes to upgrade via the delegated
   * listener initPaywallListener() wires once in app.js -- nothing to
   * wire here, which is the whole point of the shared component.
   */
  function _whatPersonalAdds() {
    if (isPremium()) return null;

    // Data first. Somebody who already has these needs no preview of
    // them, whatever their tier says.
    const hasChapter  = !!store.get('activeProgramme.programmeId');
    const hasArc      = (store.get('programme')?.chaptersDone || []).length > 0;
    const hasDate     = !!store.get('strategicGoal.targetDate');
    if (hasChapter && hasArc && hasDate) return null;

    const rows = [];
    if (!hasChapter || !hasArc) {
      rows.push("Chapters that follow on from each other, chosen one at a time rather than fixed in advance.");
    }
    if (!hasDate) {
      rows.push("Something you are working towards, with the date you gave, if you have one.");
    }

    const preview = rows
      .map(r => `<p class="my-programme-line my-programme-line--soft">${_esc(r)}</p>`)
      .join('');

    return _section("What Personal adds",
      lockedFeature(preview, 'personal', "My Programme"));
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

    container.querySelector('[data-action="edit-focus"]')
      ?.addEventListener('click', () => { _focusEditing = true; render(container); });

    container.querySelectorAll('[data-focus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.focus;
        setWeekFocus(k === 'none' ? null : k);
        _focusEditing = false;
        render(container);
      });
    });
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

  // Named _capitalise, not _cap. The first version of this section
  // called _cap(), which exists in today.js and has never existed here
  // -- a ReferenceError that could only fire once somebody opened the
  // picker, so every assertion that merely rendered the view missed it.
  function _capitalise(str) {
    const s = String(str ?? '');
    return s.charAt(0).toUpperCase() + s.slice(1);
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
