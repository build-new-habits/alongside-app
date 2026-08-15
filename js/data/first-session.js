/**
 * first-session.js - Recognising a first session as a first
 * 15 Aug 2026 v1
 *
 * DELIGHT-1, found by the first-ninety-seconds audit rather than by a
 * persona trace.
 *
 * Three waves of tracing produced around thirty findings and every one
 * was a thing that was WRONG. None was a thing that was MISSING, because
 * absence does not throw and reads as correct when you execute it. This
 * is the first fix in the project that came from asking "was that a good
 * thing to happen to a person" rather than "did the code do the right
 * thing".
 *
 * THE GAP
 *
 * renderDone() in core-session.js is identical for session one and
 * session fifty: exercise count, minutes, "Good work.", credits. So
 * persona 2.5 -- three years after a cardiac event, never having
 * exercised in her life -- finishes the hardest thing she has done since
 * the hospital and the app tells her she did eight exercises.
 *
 * The first completed session is the highest-stakes emotional moment in
 * the product and the only one that can never happen again.
 *
 * WHY TERRITORY AND NOT PRAISE
 *
 * "Well done, that's amazing!" would be the obvious fix and it is the
 * wrong one. It is generic, it is evaluative, and this product does not
 * evaluate people. What it has instead is something better: at step 3 of
 * onboarding the person named what has made this hard before, in their
 * own words, from a fixed list. Nothing has ever referred back to it at
 * a moment that mattered.
 *
 * So the line does one thing: it repeats what they told us, and states
 * what just happened. No adjective about them, no claim about what it
 * means, no promise about what comes next.
 *
 * P4 (Locked) holds throughout: the coach DISPLAYS, it does not
 * interpret. "You said X. You just did a session." is display. "You've
 * proved X wrong" is interpretation, and it also would not be true after
 * one session.
 *
 * NO STREAK, NO COMPARISON, NO ESCALATION
 *
 * This fires exactly once, ever. It does not start a counter, it does not
 * say "one down", and it does not mention the next one. A first session
 * that immediately becomes an obligation is the escalation trap the
 * product exists to avoid, and persona 2.5 selected that territory.
 */

/**
 * Recognition lines by the territory named at onboarding step 3.
 *
 * Written to be true after ONE session. Several drafts said things like
 * "you're someone who does this now", which is a claim about identity on
 * the evidence of twenty minutes, and would read as flattery to exactly
 * the people most alert to being flattered.
 */
const TERRITORY_LINES = {
  'trust-rupture': {
    heading: "That was your first one.",
    body: "You told me you'd been let down by this kind of thing before. I'm not going to make you any promises about what happens next. You did a session, and that's the whole of it."
  },
  'escalation-trap': {
    heading: "That was your first one.",
    body: "You told me it always ramps up until it breaks. So I'll say the useful thing: nothing about today obliges you to do more tomorrow. This counted on its own."
  },
  'life-interruption': {
    heading: "That was your first one.",
    body: "You told me life keeps interrupting. It probably will again, and that won't undo this. Today happened."
  },
  'wrong-fit': {
    heading: "That was your first one.",
    body: "You told me none of it was built for someone like you. I can't fix that everywhere. But that session was yours, and you finished it."
  },
  'invisible-person': {
    heading: "That was your first one.",
    body: "You told me you'd never seen yourself in any of this. I noticed you did it. That's all I wanted to say."
  },
  'body-story': {
    heading: "That was your first one.",
    body: "You told me your relationship with your body has made this complicated. I'm not going to pretend one session changes that. You still did it."
  },
  'the-history': {
    heading: "That was your first one.",
    body: "You told me there's history here. I'm not asking about it. I just wanted to mark that today happened."
  },
};

/**
 * The line for somebody who skipped the Hard Before question.
 *
 * Deliberately not a lesser version. Somebody who declined to say what
 * made this hard is not owed less recognition, and reaching for a
 * consolation tone would make the absence of an answer feel like a
 * deficit.
 */
const FALLBACK_LINE = {
  heading: "That was your first one.",
  body: "First sessions are their own thing. Nothing about today obliges you to do more tomorrow — I just wanted to mark that it happened."
};

/**
 * Is this the person's first ever completed session?
 *
 * @param {number} completedCount  completed sessions INCLUDING this one
 * @returns {boolean}
 */
export function isFirstSession(completedCount) {
  return completedCount === 1;
}

/**
 * The recognition block, or null when it does not apply.
 *
 * Returns null rather than a default for any count other than one, so a
 * caller that forgets the guard shows nothing rather than showing this to
 * somebody on their fortieth session.
 *
 * @param {number} completedCount  completed sessions INCLUDING this one
 * @param {string|null} territory  store.get('onboarding.primaryTerritory')
 * @returns {{heading:string, body:string}|null}
 */
export function firstSessionRecognition(completedCount, territory) {
  if (!isFirstSession(completedCount)) return null;
  return TERRITORY_LINES[territory] || FALLBACK_LINE;
}

export const _TERRITORY_LINES = TERRITORY_LINES;
export const _FALLBACK_LINE = FALLBACK_LINE;
