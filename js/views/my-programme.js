/**
 * my-programme.js - My Programme
 *
 * 22 Aug 2026 v8
 *
 * v8 - WEIGHT-1b. A weight target, when the person has turned tracking
 *   on. Only then, and never otherwise.
 *
 *   IT IS A MEASUREMENT ON THE EXISTING TARGET, NOT A SECOND TARGET.
 *   strategicGoal.targetValue + targetUnit were already in the schema
 *   with no writer and one reader (goal-review's isWeightTarget), so
 *   the shape was sketched and never wired. Their words and their date
 *   stay exactly as they are; a number attaches to them.
 *
 *   Top-level `targetWeight` is left alone. It now has no reader and no
 *   writer anywhere, and creating a second home for the same fact is
 *   what caused TARGET-3.
 *
 *   THE BANDS RUN AT SET-TIME. A target implying 3 lb a week or more is
 *   declined, with a sustainable date offered instead. Set-time is
 *   planning, so it MAY compute and propose a date -- review-time is
 *   judgement and may not. See weight-targets.js rule 2.
 *
 *   NO PROMPT, EVER. The field is there when looked for and silent
 *   otherwise: no badge, no empty state that reads as an unfinished
 *   task, nothing that asks anybody to weigh themselves.
 *
 * 22 Aug 2026 v7
 *
 * v7 - THREAD-1a. The three options are GONE from this screen. What
 *   remains is a quiet invitation; the conversation itself happens in
 *   views/goal-review-thread.js.
 *
 *   v6 shipped copy that asked "Shall we look at it together?" and then
 *   answered with a date input and a Save button. The mismatch was the
 *   small fault. The real one: the coach speaks in bubbles while getting
 *   to know somebody and handed them a FORM the moment the conversation
 *   turned difficult -- the interaction that most needs to feel like a
 *   person, built most like an admin screen.
 *
 *   The invitation does NOT auto-open. A typing indicator starting while
 *   somebody is mid-scroll on a browsable screen is an ambush, and this
 *   is the one conversation that must never ambush.
 *
 * 22 Aug 2026 v6
 *
 * v6 - R1-b. The hard conversation gets a surface, and the target
 *   display gets the tier gate the boundary always implied.
 *
 *   TWO JOBS IN ONE VISIT, deliberately. Touch-once: this file is wanted
 *   by R1's surface and by R2's boundary correction, so it gets one
 *   edit that does both rather than two that collide.
 *
 *   1. The dated target is now Plan-only. "Free has goals, the Plan has
 *      targets" -- the boundary said so; this screen had drifted,
 *      rendering the date and the countdown to everyone. The GOALS stay
 *      free and untouched: a goal is a direction and it belongs to the
 *      person.
 *
 *   2. If the trailing rate says the date is at risk, the coach opens
 *      the conversation and offers three ways through: move the date,
 *      reshape the target, or leave it exactly where it is.
 *
 *   ALL THREE RESOLVE INLINE. No modal, no navigation. Routing to
 *   today.js's hinge editor would depend on state that has to be
 *   re-established on arrival, which is somewhere it can fail.
 *
 *   "LEAVE IT WHERE IT IS" IS A REAL CHOICE. One tap, never nagged,
 *   not asked again inside the throttle, and styled with the same
 *   weight as the other two. A de-emphasised third option is a nudge
 *   wearing a choice's clothes.
 *
 *   NO ARITHMETIC ON THE BODY, AND NO ARITHMETIC ON THE PERSON. This is
 *   review-time, which is judgement, so nothing here states a rate, a
 *   shortfall, a percentage or a count of missed sessions. The coach
 *   says the date looks like a harder ask than it needs to be. It does
 *   not show its working, because showing the working is the scoreboard
 *   this product refuses to keep.
 *
 * 18 Aug 2026 v5
 *
 * v5 - NAME-1. The paid tier is "the Plan", not "Personal".
 *   Graeme's decision, 18 Aug. Copy only -- no logic, no gating
 *   and no tier boundary moved. Reasoning in js/auth.js v2.
 *
 * 17 Aug 2026 v4
 *   TARGET-3. The event section read strategicGoal.targetDate, which
 *   nothing writes; onboarding writes the TOP-LEVEL targetDate. Reads
 *   both now, preferring the structured one.
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
import { evaluateGoalReview }   from '../data/goal-review.js';
import { toKg, fromKg, validateWeightTarget } from '../data/weight-targets.js';
import { detectBurnout, getTodaysCheckin } from '../data/checkin.js';
import { getZoneStatus }        from '../data/conditions.js';
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
      _whatThePlanAdds()
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
    // TARGET-3, 17 Aug 2026. READS BOTH HOMES, because there are two.
    //
    // `targetDate` and `targetDescription` exist at TOP LEVEL and again
    // inside `strategicGoal`. Onboarding's goal-setup.js writes the
    // top-level pair; this view was reading only the strategicGoal pair,
    // which nothing writes. So somebody who set a target date at
    // onboarding saw nothing here -- the section that exists to show
    // what they are aiming at was silently blind to the only place the
    // answer was stored.
    //
    // Shipped by me yesterday, and exactly the fault this week keeps
    // producing: a reader pointed at a field with no writer, while the
    // real data sat one level away.
    //
    // strategicGoal is preferred because it is the structured, newer
    // home and is where CHAP-1 step 6 will write. The top-level pair is
    // the fallback so existing people see their own date TODAY rather
    // than after a migration. The duplication itself is flagged for
    // resolution -- two fields with one meaning is a bug waiting to
    // happen, and picking one silently would be the wrong kind of tidy.
    const targetText = sg.targetDescription || store.get('targetDescription') || '';
    const targetWhen = sg.targetDate        || store.get('targetDate')        || null;

    // R1-b. THE DATED TARGET IS PLAN-ONLY.
    //
    // "Free has goals, the Plan has targets" -- the boundary document
    // said so from the start and this screen had drifted, rendering the
    // date and the countdown to everyone. The goals above stay free and
    // untouched: a goal is a direction, and it belongs to the person
    // whatever they pay. What the Plan buys is the coach HOLDING a
    // destination -- keeping it in view and telling the truth about it.
    if (isPremium()) {
      if (targetText) {
        parts.push(`<p class="my-programme-line">${_esc(targetText)}</p>`);
      }
      if (targetWhen) {
        const days = _daysUntil(targetWhen);
        parts.push(`<p class="my-programme-line">
          ${_esc(_dayMonth(targetWhen))}${days !== null && days > 0
            ? _esc(` — ${days} ${days === 1 ? "day" : "days"} to go`)
            : ''}
        </p>`);
      }

      // A date with no words. today.js writes the description and the
      // date independently, so skipping the "what" is one tap -- and R1
      // requires the person's own words, because the coach must never
      // invent a phrase for somebody's goal and then quote it back.
      //
      // An invitation, never an error state, and never a badge or a
      // prompt that reads as an unfinished task.
      if (targetWhen && !targetText) {
        parts.push(_describeTargetInvite());
      }

      const weight = _weightTarget(sg);
      if (weight) parts.push(weight);

      const review = _reviewOffer();
      if (review) parts.push(review);
    }

    if (!parts.length) return null;
    return _section("What you are aiming at", parts.join(''));
  }

  // ── The hard conversation ───────────────────────────────────────────

  /**
   * Assemble what goal-review.js needs and ask it.
   *
   * The module is pure and takes everything as arguments, so THIS is the
   * wiring -- and the wiring is where the fault usually is. Every field
   * below is supplied deliberately; goal-review.js treats anything
   * missing or wrong-typed as a reason to stay silent, so a mistake here
   * costs the feature and never the person.
   */
  function _reviewContext() {
    const checkin = getTodaysCheckin() || {};
    const burnout = detectBurnout(store.get('checkinHistory') || {});

    // Pain: the highest score across the person's own conditions today.
    // getZoneStatus() calls 7+ severe and getPainBand() calls 8+; they
    // disagree, deliberately, pending clinical review. R1 takes the
    // LOWER number and does not resolve that question -- see
    // goal-review.js PAIN_SEVERE.
    const painScores = store.get('conditionPainScores') || {};
    const painLevel  = Object.values(painScores)
      .filter(v => typeof v === 'number')
      .reduce((max, v) => v > max ? v : max, 0);

    // Care Mode. checkin.lastOpeningMode records the last opening the
    // coach chose, and 'care' is one of them.
    //
    // IT CARRIES NO DATE -- neither does openingModeHistory, which is a
    // bare array of strings. So a 'care' opening from last week reads as
    // today's. Used anyway, undated, ON PURPOSE: over-suppressing costs
    // a conversation a fortnight later, under-suppressing means saying
    // this to somebody the coach had already decided needed gentleness.
    // Logged as a finding, not worked around.
    const careOpeningToday = store.get('checkin.lastOpeningMode') === 'care';

    return {
      isPremium: isPremium(),
      now: new Date(),
      strategicGoal: store.get('strategicGoal') || {},
      legacyTargetDate: store.get('targetDate') || null,
      targetType: null,
      activityLog: store.get('activityLog') || [],
      painLevel,
      burnoutLevel: burnout && burnout.level ? burnout.level : 'none',
      mood:   typeof checkin.mood   === 'number' ? checkin.mood   : undefined,
      energy: typeof checkin.energy === 'number' ? checkin.energy : undefined,
      careOpeningToday,
      weightTrackingEnabled: store.get('weightTracking') === true
    };
  }

  /**
   * The offer itself.
   *
   * NO ARITHMETIC ON THE PERSON. The coach names what it noticed and
   * offers three ways through. It does not state a rate, a shortfall, a
   * percentage or a count of sessions, because showing the working turns
   * a conversation into a scoreboard -- and P4 says the coach displays,
   * never interprets, which cuts both ways: it may not interpret a
   * person into a number either.
   */
  function _reviewOffer() {
    const r = evaluateGoalReview(_reviewContext());
    if (!r.offer) return null;

    // An invitation, and only an invitation. The conversation lives at
    // the 'goal-review' route. Nothing here opens itself.
    //
    // It says enough to be a real choice -- somebody should know what
    // they are agreeing to talk about before they tap -- and no more,
    // because the whole point is that the coach does not deliver this
    // sideways on a screen the person opened for another reason.
    return `
      <div class="my-programme-review" role="group"
           aria-label="About the date you are working towards">
        <p class="my-programme-review__body">
          I have been looking at ${_esc(r.targetDescription)} and the date you
          set. Nothing has gone wrong — but I think it is worth a conversation
          when you have a minute.
        </p>
        <div class="my-programme-review__actions">
          <button class="btn btn-secondary btn-small" data-review="open">
            Have that conversation
          </button>
        </div>
      </div>
    `;
  }



  /**
   * The weight target. Shown only where the person has turned tracking
   * on -- the toggle in Settings is the consent, and without it this
   * does not exist.
   */
  function _weightTarget(sg) {
    if (store.get('weightTracking') !== true) return '';

    const unit  = store.get('weightUnit') || 'kg';
    const kg    = sg.targetUnit === 'kg' ? sg.targetValue : null;
    const shown = kg != null
      ? (unit === 'st'
          ? `${fromKg(kg, 'st').st} st ${fromKg(kg, 'st').lb} lb`
          : String(Math.round(fromKg(kg, unit) * 10) / 10))
      : '';

    const stone = unit === 'st';
    return `
      <div class="my-programme-weight">
        <label class="my-programme-review__label" for="weight-target">
          A weight you are aiming for, if you want one
        </label>
        ${stone
          ? `<div class="my-programme-weight__stone">
               <input class="my-programme-review__input my-programme-weight__part"
                      id="weight-target" type="number" inputmode="numeric" min="0" max="60"
                      value="${kg != null ? fromKg(kg, 'st').st : ''}" aria-label="Stone">
               <span class="my-programme-weight__unit">st</span>
               <input class="my-programme-review__input my-programme-weight__part"
                      id="weight-target-lb" type="number" inputmode="numeric" min="0" max="13"
                      value="${kg != null ? fromKg(kg, 'st').lb : ''}" aria-label="Pounds">
               <span class="my-programme-weight__unit">lb</span>
             </div>`
          : `<input class="my-programme-review__input" id="weight-target"
                    type="number" inputmode="decimal" min="0" step="0.1"
                    value="${_esc(shown)}"
                    aria-label="Target weight in ${unit === 'lb' ? 'pounds' : 'kilograms'}">`}
        <div class="my-programme-review__actions">
          <button class="btn btn-secondary btn-small" data-review="save-weight">Save it</button>
        </div>
        <p class="my-programme-weight__note" id="weight-target-note" role="status"></p>
      </div>
    `;
  }

  function _describeTargetInvite() {
    return `
      <div class="my-programme-describe">
        <label class="my-programme-review__label" for="target-describe">
          Tell me what this date is for, in your own words
        </label>
        <input class="my-programme-review__input" id="target-describe" type="text"
               maxlength="60">
        <div class="my-programme-review__actions">
          <button class="btn btn-secondary btn-small" data-review="save-describe">
            Save it
          </button>
        </div>
      </div>
    `;
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
  function _whatThePlanAdds() {
    if (isPremium()) return null;

    // Data first. Somebody who already has these needs no preview of
    // them, whatever their tier says.
    const hasChapter  = !!store.get('activeProgramme.programmeId');
    const hasArc      = (store.get('programme')?.chaptersDone || []).length > 0;
    const hasDate     = !!(store.get('strategicGoal.targetDate') || store.get('targetDate'));
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

    return _section("What the Plan adds",
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

    // ── The hard conversation ──────────────────────────────────────
    //
    // One job now: go there. Every branch, every write and the throttle
    // all live in views/goal-review-thread.js, because the conversation
    // is a place you enter rather than a panel that unfolds here.
    container.querySelector('[data-review="open"]')
      ?.addEventListener('click', () => router.navigate('goal-review'));

    // The description invitation stays HERE, not in the thread. It is
    // not part of the conversation: it is somebody filling in their own
    // words, so it records no outcome and never touches the throttle.
    // WEIGHT-1b. The bands run HERE, at set-time.
    //
    // Set-time is planning, so it may compute and propose a DATE -- the
    // person is deciding what to aim at and needs to know what is
    // feasible. Review-time (R1) is judgement and may never state a
    // rate, a projection or a weight. See weight-targets.js rule 2.
    container.querySelector('[data-review="save-weight"]')
      ?.addEventListener('click', () => {
        const unit = store.get('weightUnit') || 'kg';
        const main = container.querySelector('#weight-target');
        const note = container.querySelector('#weight-target-note');
        if (!main) return;

        let targetKg = null;
        if (unit === 'st') {
          const st = main.value;
          const lb = container.querySelector('#weight-target-lb')?.value;
          if (st !== '' || (lb !== '' && lb !== undefined)) {
            targetKg = toKg({ st: Number(st || 0), lb: Number(lb || 0) }, 'st');
          }
        } else if (main.value !== '') {
          targetKg = toKg(main.value, unit);
        }

        // Clearing it removes it. Somebody deleting their target is
        // deleting it, not leaving the old one behind.
        if (targetKg === null || !(targetKg > 0)) {
          store.set('strategicGoal.targetValue', null);
          store.set('strategicGoal.targetUnit', null);
          store.set('strategicGoal.weightTargetBand', null);
          render(container);
          return;
        }

        const sg = store.get('strategicGoal') || {};
        const currentKg = store.get('weight');
        const targetDate = sg.targetDate || store.get('targetDate') || null;

        // Without a current weight or a date there is no rate to judge,
        // so the target is simply held. The coach does not ask for the
        // missing pieces -- asking for a weigh-in is the one thing it
        // never does.
        if (currentKg == null || !targetDate) {
          store.set('strategicGoal.targetValue', targetKg);
          store.set('strategicGoal.targetUnit', 'kg');
          store.set('strategicGoal.weightTargetBand', null);
          render(container);
          return;
        }

        const weeks = Math.max(
          1, Math.round((new Date(targetDate) - Date.now()) / (7 * 86400000))
        );
        const result = validateWeightTarget({
          currentKg, targetKg, weeks,
          now: new Date().toISOString().slice(0, 10),
          trackingEnabled: true
        });

        if (!result.accepted) {
          // Declined. The FIELD is refused, never the person -- the
          // message says so and offers a date that works instead.
          if (note) note.textContent = result.message;
          return;
        }

        store.set('strategicGoal.targetValue', targetKg);
        store.set('strategicGoal.targetUnit', 'kg');
        store.set('strategicGoal.weightTargetBand', result.band);
        if (note && result.message) note.textContent = result.message;
        else render(container);
      });

    container.querySelector('[data-review="save-describe"]')
      ?.addEventListener('click', () => {
        const what = container.querySelector('#target-describe')?.value?.trim();
        if (what) store.set('strategicGoal.targetDescription', what);
        render(container);
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
