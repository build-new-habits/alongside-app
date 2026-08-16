/**
 * assessment.js - Calibration, baseline and ongoing
 * 16 Aug 2026 v2
 *
 * v2 - ASSESS-1 step 3. The read stops being a one-off.
 *
 * Steps 1-2 moved the difficulty ceiling once, at the first session,
 * and then never again. Somebody who got stronger over four months was
 * still being served against a read taken on day one -- which is the
 * failure the whole feature existed to fix, deferred rather than
 * solved.
 *
 * TWO TRIGGERS, and the second one is why this is not gated on the
 * hinge alone. The blueprint puts reassessment at the chapter boundary.
 * But programmes are Personal, so gating only on that would build a
 * feature no free user could ever reach, and the chapter-completion
 * signal is written by CHAP-1 step 3, which does not exist yet. A
 * reassessment reachable only through unbuilt code, for paying users
 * only, is the 15 Aug fault with a plan attached.
 *
 * So: TIME is the live trigger, and `chapterEnded` is an argument the
 * hinge will pass when it exists. Reachable today, and the integration
 * point is defined rather than fabricated.
 *
 * 15 Aug 2026 v1
 *
 * ASSESS-1 step 2. The blueprint: "It is a session, not a chore. The
 * worst version is a separate screen of tests before you are allowed to
 * train. The best version is that the first session IS the assessment."
 *
 * So this asks, at the end of a first session, how the movements they
 * just did actually went. Three questions at most, about exercises they
 * have this minute finished, skippable, and the answer moves the
 * difficulty ceiling that has until now been fixed at whatever they said
 * about their own frequency during onboarding.
 *
 * WHY IT ASKS ABOUT WHAT THEY DID, NOT A FIXED BATTERY
 *
 * A fixed set of test movements would mean asking somebody about a squat
 * they were never given. Worse, it would mean building a session around
 * the test rather than around them, which is the "separate chore" the
 * blueprint rules out. The questions are derived from the session's own
 * movement patterns, so a session with no pushing asks nothing about
 * pushing.
 *
 * WHY IT ADJUSTS RATHER THAN REPLACES
 *
 * Three taps is not enough to declare somebody's fitness level from
 * nothing. It IS enough to say "the level you told me looks about one
 * step out". So the read starts from what they said at onboarding and
 * moves at most one step in either direction. That respects the
 * self-report, corrects it where the evidence is clear, and cannot
 * produce a wild answer from a single hard day.
 *
 * WHAT IT IS NOT
 *
 * Not a test. There is no pass, no fail, no score, and nothing is ever
 * compared to another person. The copy says what it is for -- "so I know
 * where to start you" -- and never "let's see how you do". For personas
 * 2.5, 2.8, 2.11 and 2.13 a fitness test is precisely the thing they
 * came here to escape, and this feature is the one most likely to
 * reintroduce it.
 */

import { store } from '../store.js';

/**
 * Movement patterns worth asking about, mapped to the question asked.
 *
 * Patterns verified against the live database, not invented: squat 27,
 * hinge 37, push 31, pull 28, carry 6, locomotion 133. Anything not
 * listed here is deliberately not asked about -- stretches, breathwork
 * and mobility work do not tell you what somebody can load.
 */
const PATTERN_QUESTIONS = [
  { key: 'squat',      patterns: ['squat', 'lunge'],       label: 'the squatting and lunging' },
  { key: 'push',       patterns: ['push'],                 label: 'the pushing' },
  { key: 'pull',       patterns: ['pull'],                 label: 'the pulling' },
  { key: 'hinge',      patterns: ['hinge', 'carry'],       label: 'the hinging and carrying' },
  { key: 'endurance',  patterns: ['locomotion'],           label: 'the continuous movement' },
];

/**
 * Answers. Three, deliberately.
 *
 * Five points would invite people to split hairs about a middle they
 * cannot really distinguish, and would look like a rating scale. These
 * three are about EFFORT, not performance -- none of them is a good or
 * a bad answer, and "not today" is a legitimate thing for a body to say
 * rather than a failure to complete something.
 */
export const EFFORT_CHIPS = [
  { id: 'comfortable', label: 'Comfortable'      },
  { id: 'hard',        label: 'Hard work'        },
  { id: 'too-much',    label: 'Not today'        },
];

const SCORE = { comfortable: 1, hard: 0, 'too-much': -1 };
const LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very-active'];

/** Cap at three. Four questions after a first session is an interview. */
const MAX_QUESTIONS = 3;

/**
 * ASSESS-1 step 3. When the read goes stale.
 *
 * TWELVE WEEKS, matching a chapter, so somebody on a programme and
 * somebody on nothing get asked on the same rhythm. Both numbers below
 * are single-line changes and neither is a clinical or scientific
 * threshold -- they are a judgement about how often it is reasonable to
 * ask somebody the same three questions.
 *
 * Deliberately TIME rather than session count. Somebody training once a
 * week would wait most of a year to reach any sensible session total,
 * and they are exactly the person whose day-one read is least likely to
 * still fit. Counting sessions would make the feature arrive soonest
 * for the people who need it least.
 */
const REASSESS_AFTER_WEEKS = 12;

/**
 * And how long a "no thanks" is respected.
 *
 * A decline must not be permanent here, the way it correctly is for the
 * baseline. Somebody who skipped once in March has not opted out of
 * ever being asked again -- they were mid-session and did not fancy it.
 * But being asked again the following week would turn a polite offer
 * into nagging, which for personas 2.5 and 2.13 is the thing that
 * closes the app for good.
 */
const QUIET_AFTER_DECLINE_WEEKS = 4;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function _weeksSince(iso) {
  if (!iso) return Infinity;
  const then = new Date(iso).getTime();
  if (isNaN(then)) return Infinity;
  return (Date.now() - then) / WEEK_MS;
}

/** The most recent read of any kind, baseline or later. */
function _lastAssessmentAt(a) {
  if (!a || !a.baseline) return null;
  const h = a.history || [];
  return h.length ? h[h.length - 1].at : a.baseline.at;
}

/**
 * Which questions apply to this session?
 *
 * @param {string[]} exerciseIds
 * @param {Map|object} exerciseLookup  id -> exercise
 * @returns {Array<{key,label}>}
 */
export function questionsForSession(exerciseIds, exerciseLookup) {
  const get = exerciseLookup instanceof Map
    ? (id => exerciseLookup.get(id))
    : (id => exerciseLookup[id]);

  const present = new Set();
  for (const id of exerciseIds || []) {
    const p = get(id)?.movementPattern;
    if (p) present.add(p);
  }
  return PATTERN_QUESTIONS
    .filter(q => q.patterns.some(p => present.has(p)))
    .slice(0, MAX_QUESTIONS)
    .map(({ key, label }) => ({ key, label }));
}

/**
 * Should the baseline be offered after this session?
 *
 * Only on a first completed session, only when there is something worth
 * asking about, and never to somebody who has already answered or
 * declined.
 *
 * @param {number} completedCount  sessions completed INCLUDING this one
 * @param {Array} questions
 */
export function shouldOfferBaseline(completedCount, questions) {
  if (completedCount !== 1) return false;
  if (!questions || questions.length === 0) return false;
  const a = store.get('assessment') || {};
  return !a.baseline && !a.declined;
}

/**
 * ASSESS-1 step 3. Should the coach ask again?
 *
 * Returns false until there IS a baseline -- the first read is
 * shouldOfferBaseline()'s job and the two must never both fire.
 *
 * @param {Array} questions            derived from the session just done
 * @param {object} [opts]
 * @param {boolean} [opts.chapterEnded] the hinge will pass this when
 *   CHAP-1 step 3 exists. Until then it is always false, and TIME is
 *   what makes this feature reachable.
 */
export function shouldOfferReassessment(questions, { chapterEnded = false } = {}) {
  if (!questions || questions.length === 0) return false;

  const a = store.get('assessment') || {};
  if (!a.baseline) return false;

  // A decline is respected for a while, then it lapses. Checked BEFORE
  // the due test, so a chapter ending cannot override somebody who said
  // no last week.
  if (a.declined && _weeksSince(a.lastOfferedAt) < QUIET_AFTER_DECLINE_WEEKS) return false;

  if (chapterEnded) return true;
  return _weeksSince(_lastAssessmentAt(a)) >= REASSESS_AFTER_WEEKS;
}

/**
 * Turn the answers into a level, and record it.
 *
 * Starts from what the person said at onboarding and moves at most one
 * step. See the note at the top: three taps can correct a self-report,
 * it cannot replace one.
 *
 * Unanswered questions are ignored rather than counted as anything --
 * somebody who answered two of three has told us about two movements.
 *
 * Named for what it does rather than when it runs. It was
 * recordBaseline() until v2, which stopped being true the moment the
 * same three questions started being asked again at twelve weeks -- and
 * a function whose name says "first time only" is one somebody
 * eventually reads as a guarantee.
 *
 * It works unchanged for both, because it starts from the CURRENT
 * fitnessLevel, which after a baseline is the last measured level. So a
 * reassessment moves at most one step from where the person is now, not
 * from what they said about themselves months ago.
 *
 * @param {object} answers  { squat: 'comfortable', ... }
 * @returns {object|null} the recorded entry
 */
export function recordAssessmentAnswers(answers) {
  const given = Object.values(answers || {}).filter(v => v in SCORE);
  if (given.length === 0) return null;

  const declared = store.get('fitnessLevel')
                || store.get('lifestyle.activityLevel')
                || 'moderate';
  const startIdx = LEVELS.indexOf(declared) >= 0 ? LEVELS.indexOf(declared) : 2;

  const total = given.reduce((s, v) => s + SCORE[v], 0);
  const mean  = total / given.length;

  // Thresholds are deliberately wide. Somebody has to find everything
  // comfortable to move up, and to have stopped on most of it to move
  // down. A single hard day must not reclassify anybody.
  let step = 0;
  if (mean >= 0.99) step = 1;         // every answer 'comfortable'
  else if (mean <= -0.5) step = -1;   // mostly 'not today'

  const idx = Math.max(0, Math.min(LEVELS.length - 1, startIdx + step));
  return store.recordAssessment({ measuredLevel: LEVELS[idx], results: { ...answers } });
}

/**
 * The coach's framing, and the acknowledgement afterwards.
 *
 * The opening line does the most work in this whole feature: it has to
 * make three questions read as calibration rather than examination. It
 * says what the questions are FOR before it asks them, and it gives
 * permission to skip in the same breath.
 */
export function baselineIntro() {
  return {
    heading: "Can I ask about that one?",
    body: "Only so I know where to start you — there's no right answer and nothing here is a test. Skip it if you'd rather; I'll go on what you told me at the start."
  };
}

/**
 * What the coach says once they have answered.
 *
 * Reports what it CHANGED, never a level or a score. "You're active now"
 * would be a label; "I'll aim a bit higher" is a decision the person can
 * see the effect of.
 */
export function baselineAck(change) {
  if (!change || change.direction === 'same')
    return "Thank you. That's about where I'd have started you anyway — good to have it confirmed rather than assumed.";
  if (change.direction === 'up')
    return "Thank you. That's more than I'd have given you, so I'll aim a bit higher from here. You can always tell me it's too much.";
  return "Thank you — that's genuinely useful. I'll ease off a little to start, and we can build from there.";
}

/**
 * The reassessment opening. A different job from the baseline's.
 *
 * The baseline has to make three questions read as calibration rather
 * than examination. This one has a harder problem: somebody who has
 * been training for three months and is asked the same questions again
 * can very easily read it as a re-test they might fail.
 *
 * So it says why it is asking -- that the coach would otherwise be
 * aiming at where they were -- and it does not mention progress,
 * improvement, or how long they have been going. "You've been at this
 * twelve weeks now!" turns a calibration into a milestone, and a
 * milestone invites a verdict.
 */
export function reassessmentIntro() {
  return {
    heading: "Can I ask about those again?",
    body: "It's been a while since I last checked. Same questions, still no right answers — it just stops me aiming at where you were instead of where you are. Skip it if you'd rather."
  };
}

/**
 * And the acknowledgement. Separate from baselineAck() because its
 * 'same' case is a different sentence: "that's about where I'd have
 * started you" makes no sense to somebody three months in.
 *
 * 'down' gets the most care. Somebody reading down after illness, a bad
 * quarter or simply a hard week must not be told they have gone
 * backwards -- the coach reports what it will DO, and the door back is
 * stated in the same breath.
 */
export function reassessmentAck(change) {
  if (!change || change.direction === 'same')
    return "Thank you. That's much where you were, so I'll carry on as I have been.";
  if (change.direction === 'up')
    return "Thank you. That's moved on from last time, so I'll aim a bit higher from here. Tell me if it's too much.";
  return "Thank you — that's genuinely useful. I'll ease off to match where you are now, and we can build again from there.";
}

export const _PATTERN_QUESTIONS = PATTERN_QUESTIONS;
export const _REASSESS_AFTER_WEEKS = REASSESS_AFTER_WEEKS;
export const _QUIET_AFTER_DECLINE_WEEKS = QUIET_AFTER_DECLINE_WEEKS;
export const _SCORE = SCORE;
