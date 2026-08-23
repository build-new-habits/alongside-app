/**
 * js/data/goal-review-script.js
 * 22 Aug 2026 v1
 *
 * THREAD-1a — the hard conversation, as a script.
 *
 * Data, not rendering. js/views/thread-runner.js carries it, the same
 * way onboarding-thread-data.js is carried by onboarding/thread.js.
 *
 * ── THE RULES THIS COPY IS WRITTEN AGAINST ──────────────────────────
 *
 * 1. NO ARITHMETIC ON THE PERSON. This is review-time, which is
 *    judgement, so nothing here states a rate, a shortfall, a
 *    percentage, or a count of sessions. Showing the working turns a
 *    conversation into a scoreboard. Set-time may propose a date;
 *    review-time may not do arithmetic on anybody. Gated.
 *
 * 2. "LEAVE IT WHERE IT IS" IS A REAL ANSWER. Same chip styling, no
 *    softer wording, no follow-up asking whether they are sure, and not
 *    asked again inside the 28-day throttle. A third option phrased as
 *    a retreat is a nudge wearing a choice's clothes.
 *
 * 3. NOTHING HAS GONE WRONG. The trigger is a rate below a line the
 *    person never agreed to hit. Life is the usual cause, and the copy
 *    says so before it asks anything.
 *
 * 4. SHORT. Three or four beats. Threads suit onboarding partly BECAUSE
 *    onboarding happens once; somebody moving a date by a fortnight
 *    does not want twelve bubbles about it.
 *
 * ── BANNED VOCABULARY ───────────────────────────────────────────────
 *
 * behind · missed · failed · slipping · off track · on track · should ·
 * need to · catch up · fall short. Every one of them makes a date into a
 * verdict on a person. Asserted by tools/verify-thread1.mjs against the
 * rendered text of every branch, not against this source.
 */

export const GOAL_REVIEW_SCRIPT = {

  open: {
    id: 'open',
    type: 'chips',
    coach: ctx =>
      `I have been looking at ${ctx.targetDescription} and the date you set.\n\n` +
      `At the pace things are going, that date is a harder ask than it needs to be. ` +
      `Nothing has gone wrong — life does this.\n\n` +
      `Shall we look at it together?`,
    chips: [
      { id: 'move',    label: 'Move the date' },
      { id: 'reshape', label: 'Reshape the target' },
      { id: 'keep',    label: 'Leave it where it is' }
    ],
    next: a => a.id === 'move' ? 'move'
             : a.id === 'reshape' ? 'reshape-what'
             : 'kept'
  },

  // ── Move ──────────────────────────────────────────────────────────

  move: {
    id: 'move',
    type: 'input',
    coach: 'When would you like to aim for instead?',
    input: ctx => ({
      kind: 'date',
      label: 'A new date to aim for',
      value: ctx.targetDate || '',
      send: 'Save it'
    }),
    next: () => 'moved'
  },

  moved: {
    id: 'moved',
    type: 'end',
    coach: ctx => `Done — ${ctx.targetDescription} it is, with more room around it.`
  },

  // ── Reshape ───────────────────────────────────────────────────────
  //
  // Pre-filled with the person's own words. A blank box would imply the
  // old answer was wrong, and it was not -- the date moved, not the
  // person's judgement about what matters to them.

  'reshape-what': {
    id: 'reshape-what',
    type: 'input',
    coach: 'What are you working towards now?',
    input: ctx => ({
      kind: 'text', maxlength: 60,
      label: 'What you are working towards',
      value: ctx.targetDescription || '',
      send: 'Next'
    }),
    next: () => 'reshape-when'
  },

  'reshape-when': {
    id: 'reshape-when',
    type: 'input',
    coach: 'And by when?',
    input: ctx => ({
      kind: 'date',
      label: 'The date you are aiming for',
      value: ctx.targetDate || '',
      send: 'Save it'
    }),
    next: () => 'reshaped'
  },

  reshaped: {
    id: 'reshaped',
    type: 'end',
    coach: 'Got it. I have it written down the way you just said it.'
  },

  // ── Leave it ──────────────────────────────────────────────────────
  //
  // ONE beat, and it closes. No "are you sure", no restating the risk,
  // no offer to reconsider. Asking twice would make the first answer
  // provisional, which would make it not a choice.

  kept: {
    id: 'kept',
    type: 'end',
    coach: 'Right — we leave it exactly where it is. I will keep working with you either way.'
  }
};

export const GOAL_REVIEW_START = 'open';
