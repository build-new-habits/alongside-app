/**
 * data/personal-reads.js - Personal-tier observations across time
 * 13 Aug 2026 v1
 *
 * D2 / VOICE-3. The class of line the free tier structurally cannot
 * produce: things only visible with ninety days of history behind them.
 *
 * ── THE RULE THIS FILE EXISTS TO ENFORCE ────────────────────────────
 *
 * Graeme, 13 Aug 2026: "I assumed, because it was so obvious to all
 * other similar types of coach voice, it would be gated in data
 * signals."
 *
 * He was right to assume it and it is the correct standard. EVERY line
 * here makes a factual claim about the person's history -- "you've had
 * a gap", "you've been coming in at a lower energy this fortnight",
 * "two of these have been in your last four sessions". A line like that
 * with no signal behind it is not a stylistic weakness. It is the coach
 * lying, and one caught lie costs more than fifty lines gain.
 *
 * So the shape here is deliberately not a pool of strings. It is a pool
 * of {text, when} pairs where `when` is a predicate over real store
 * data. A line with no predicate cannot be added: buildReads() ignores
 * any entry lacking one, and verify-reads.mjs fails the build.
 *
 * ── WHY THESE SIGNALS AND NOT OTHERS ────────────────────────────────
 *
 * Every threshold below is conservative on purpose. A "read" assembled
 * from two data points is a horoscope, and a coach that guesses is
 * worse than a coach that says nothing. Where a signal could not be
 * computed honestly from data that actually exists, the line is NOT
 * included -- see WITHHELD at the foot of this file. Three of Graeme's
 * twelve drafts are held there with the reason.
 *
 * ── P4 ──────────────────────────────────────────────────────────────
 *
 * Every line describes the PROGRAMME or what happened, never the
 * person. session-rationale.js's _arc() states the rule and it holds
 * here: "Familiarity, stated as a property of the PROGRAMME, never of
 * the person." "Most of this you have met before" is a fact about the
 * session. "You are being consistent" would be a verdict, and is out.
 *
 * Lines written and approved by Graeme. Do not paraphrase.
 */

import { store } from '../store.js';

const DAY = 86400000;

// ── Signal construction ────────────────────────────────────────────────
//
// Computed once per session and handed to every predicate, so a read
// cannot silently disagree with the one above it by recomputing the
// same thing differently.

function _completed() {
  try {
    return store.completedSessions(store.get('activityLog') || []);
  } catch { return []; }
}

function _tsOf(e) {
  const ts = e.completedAt || e.loggedAt || e.date;
  return ts ? new Date(ts).getTime() : null;
}

export function buildSignals(sessionExercises = []) {
  const log = _completed()
    .map(e => ({ ...e, _t: _tsOf(e) }))
    .filter(e => e._t)
    .sort((a, b) => b._t - a._t);

  const now      = Date.now();
  const within   = d => log.filter(e => now - e._t <= d * DAY);
  const last14   = within(14);
  const last30   = within(30);
  const last90   = within(90);

  // ── Repetition. Real, from exerciseHistory, not inferred from the
  // session's own contents.
  const metBefore = sessionExercises.filter(
    e => (store.exerciseStats(e.id)?.n || 0) >= 2).length;
  const mainCount = sessionExercises.filter(e => e.section === 'main').length;

  const inLastFour = (() => {
    const recentIds = new Set();
    log.slice(0, 4).forEach(e => (e.exerciseIds || []).forEach(id => recentIds.add(id)));
    return sessionExercises.filter(e => recentIds.has(e.id)).length;
  })();

  // ── Gap. Days between the two most recent completed sessions.
  const gapDays = log.length >= 2
    ? Math.floor((log[0]._t - log[1]._t) / DAY)
    : null;

  // ── Energy. checkinHistory keys are YYYY-MM-DD.
  const checkins = store.get('checkinHistory') || {};
  const energyIn = days => Object.entries(checkins)
    .filter(([d, v]) => now - new Date(d).getTime() <= days * DAY
                     && typeof v?.energy === 'number')
    .map(([, v]) => v.energy);
  const e14 = energyIn(14);
  const e90 = energyIn(90);
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  const meanE14 = mean(e14);
  const meanE90 = mean(e90);

  // ── Duration trend. Recent fortnight against the ninety-day baseline.
  const mins = arr => arr.map(e => e.durationMins).filter(n => typeof n === 'number');
  const meanRecentMins = mean(mins(last14));
  const meanBaseMins   = mean(mins(last90));

  // ── Session-type lean, across the last thirty days.
  const typeCounts = {};
  last30.forEach(e => { const k = e.type || 'workout'; typeCounts[k] = (typeCounts[k] || 0) + 1; });
  const leadType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0] || null;
  const leanShare = leadType && last30.length ? leadType[1] / last30.length : 0;

  // ── Difficulty ceiling. Highest difficulty met recently against the
  // earlier baseline. Reads exerciseHistory rather than this session, so
  // it describes the arc and not today.
  const diffOf = e => e.difficultyLevel || e.energyRequired || null;
  const sessionTop = Math.max(0, ...sessionExercises.map(e => diffOf(e) || 0));
  const seenTop = (() => {
    const hist = store.get('exerciseHistory') || {};
    const olderIds = Object.entries(hist)
      .filter(([, h]) => h.first && now - new Date(h.first).getTime() > 30 * DAY)
      .map(([id]) => id);
    if (!olderIds.length) return 0;
    // Only the exercises in play today can be compared like-for-like.
    const known = sessionExercises.filter(e => olderIds.includes(e.id));
    return Math.max(0, ...known.map(e => diffOf(e) || 0));
  })();

  return {
    sessions:      log.length,
    sessions14:    last14.length,
    sessions30:    last30.length,
    sessions90:    last90.length,
    metBefore, mainCount, inLastFour,
    gapDays,
    meanE14, meanE90, lowEnergyDays14: e14.filter(v => v <= 4).length,
    meanRecentMins, meanBaseMins,
    leadType: leadType ? leadType[0] : null,
    leanShare,
    sessionTop, seenTop
  };
}

// ── The reads ──────────────────────────────────────────────────────────
//
// Order is not priority: buildReads() returns every line whose signal
// holds and the caller takes one. Rotation lives at the call site so
// two eligible reads alternate rather than the first always winning --
// the exact bug empathy-transfer.js's comments were written about.

export const PERSONAL_READS = [
  {
    id: 'met-before',
    text: "Most of this you've met before. That's deliberate — the point isn't new movements, it's the same ones getting easier to reach.",
    // Majority of the session already familiar, and enough history for
    // "before" to mean something.
    when: s => s.sessions >= 6 && s.mainCount >= 3 && s.metBefore >= Math.ceil(s.mainCount / 2)
  },
  {
    id: 'repetition-is-the-point',
    text: "This session looks like the last few on purpose. Repetition is the mechanism, not a lack of ideas.",
    when: s => s.sessions >= 8 && s.inLastFour >= 3
  },
  {
    id: 'in-last-four',
    text: "Two of these have been in your last four sessions. They stay until they stop being interesting.",
    // Says "two", so it must be exactly two. A line that names a number
    // and is off by one is worse than no line.
    when: s => s.sessions >= 5 && s.inLastFour === 2
  },
  {
    id: 'low-energy-shorter',
    text: "You've been coming in at a lower energy than usual this fortnight, so the sessions have been shorter. That's the plan working, not the plan slipping.",
    // Both halves have to be true: energy genuinely down against the
    // person's OWN baseline, and the sessions genuinely shorter. Claiming
    // the second when it has not happened is the easiest lie in the file.
    when: s => s.meanE14 !== null && s.meanE90 !== null && s.sessions90 >= 8 &&
               s.meanE14 <= s.meanE90 - 1 &&
               s.meanRecentMins !== null && s.meanBaseMins !== null &&
               s.meanRecentMins < s.meanBaseMins * 0.85
  },
  {
    id: 'type-lean',
    text: "The last stretch has leaned towards strength. If that's not where you want it, the balance is yours to move.",
    when: s => s.sessions30 >= 6 && s.leadType === 'workout' && s.leanShare >= 0.6
  },
  {
    id: 'shape-unchanged',
    text: "Nothing has changed in the shape of this for a few weeks. That's usually the point at which something should.",
    // A long run of near-identical sessions. Deliberately high bars on
    // both: this line invites a change, so it must not fire at week one.
    when: s => s.sessions >= 12 && s.sessions30 >= 8 && s.inLastFour >= 4
  },
  {
    id: 'block-progress',
    text: "This is the fourth session in this block. The block is doing what blocks do — the same thing, slightly more of it.",
    when: s => s.sessions14 === 4 && s.inLastFour >= 2
  },
  {
    id: 'after-gap',
    text: "You've had a gap. I've brought the load back a little rather than picking up where it stopped.",
    // Ten days matches RETURNING_GAP_DAYS in reflect.js. One definition
    // of "a gap" across the product, not two.
    when: s => s.gapDays !== null && s.gapDays >= 10
  },
  {
    id: 'ceiling-moved',
    text: "Some of what was hard at the start of this isn't any more. I've moved the ceiling rather than the exercises.",
    when: s => s.sessions >= 15 && s.seenTop > 0 && s.sessionTop > s.seenTop
  }
];

/**
 * Returns every read whose signal genuinely holds. Anything without a
 * `when` is dropped rather than shown -- an ungated line is the one
 * failure this file exists to prevent, and it must fail closed.
 */
export function buildReads(sessionExercises = []) {
  const s = buildSignals(sessionExercises);
  return PERSONAL_READS.filter(r => typeof r.when === 'function' && r.when(s));
}

/*
 * ── WITHHELD ────────────────────────────────────────────────────────
 *
 * Three of Graeme's approved drafts are not here, because there is no
 * honest signal for them yet. Written down rather than quietly dropped,
 * so they can be added the moment the data exists.
 *
 * P6  "Your check-ins and your sessions have been telling slightly
 *      different stories lately. I've been building for the check-ins."
 *      NEEDS: a definition of divergence between reported state and
 *      completed work. Computable in principle -- low energy reported,
 *      sessions completed anyway -- but that is almost exactly the
 *      Progress read (_readShowedUpAnyway), and two lines built on one
 *      signal saying different things is worse than one saying it once.
 *      Decide which surface owns it first.
 *
 * P10 "The sessions that follow a rest day have been the strongest ones.
 *      I've started building around that."
 *      NEEDS: a definition of "strongest". Nothing in the store ranks
 *      session quality, and inventing a ranking would breach P4 -- the
 *      coach would be grading sessions, which is a verdict wearing a
 *      number. If this ships it needs a signal the PERSON supplies,
 *      not one the app infers.
 *
 * P11 "Where you're heading and what you've been doing have been
 *      pointing the same way for a while now."
 *      NEEDS: destinations. The Destination Architecture is settled and
 *      the feature is not built. This is the single strongest Personal
 *      line in the set and it should go in the day destinations land.
 */
