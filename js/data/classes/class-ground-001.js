/**
 * data/classes/class-ground-001.js
 *
 * 08 Sep 2026 v4
 *
 * v4 - PACING-1. Section durations rebalanced so each one holds its own
 *   content: tight sections grew, sections with slack gave the time back,
 *   and the CLASS TOTAL is unchanged. Nothing a person reads moved.
 *
 * 08 Sep 2026 v3
 *
 * v3 - CLASS-2/2b. Lighter variant: drops the two hands-and-knees
 *   movements, keeps the one done lying on the back. Chosen from 38
 *   structurally viable subtractions as the only one leaving a movement
 *   somebody can do without getting onto all fours. The second noticing
 *   gains a lighterVoice: "four minutes ago" is not true on a short day.
 *
 * 08 Sep 2026 v2
 *
 * v2 - CLASS-1. Regrouped into the eight SECTIONS the document is
 *   written in. The beats are unchanged; flat, they lost the stated
 *   durations, which meant nothing could check the card's 15 minutes
 *   against its own content.
 *
 * CLASS-1. Class 001, "Ground", as data.
 *
 * Transcribed from Documents/Admin/alongside_class_001_ground_06sep2026_v1.md,
 * which stays the authored source. Where the two disagree the document is
 * right and this file is wrong.
 *
 * WHAT THIS CLASS IS FOR, kept here because it governs edits: not to
 * stretch anybody. Fifteen minutes of moving and noticing that nothing
 * went wrong, repeated until that stops being a surprise. The class never
 * says "see, that was fine" -- it asks what they noticed and leaves the
 * answer with them.
 *
 * 🔴 TWO LINES ARE LOAD-BEARING AND MUST SURVIVE ANY EDIT.
 *
 * "There might not be" on the second noticing. A question that only
 * accepts "yes, better" teaches people to report improvement, and
 * evidence you have coached is worth nothing.
 *
 * "Your body did all of it" as the closing line. It is a fact, not a
 * compliment: it states what happened and leaves the meaning to the
 * person. Anything warmer -- well done, you should be proud -- takes the
 * conclusion off them, which is the one thing this strand cannot afford.
 *
 * Both are asserted by verify-class-contract, so an edit that softens
 * them fails rather than ships.
 */

export const CLASS_GROUND_001 = {
  id:            'class-ground-001',
  title:         'Ground',

  // ONE strand served, three touched. See class-contract.js: flattening
  // these would offer this class to an at-home-in-body arc as though it
  // were built for it.
  serves:        'trusting-body',
  touches:       ['at-home-in-body', 'self-kindness'],

  formats:       ['stretch', 'mindfulness'],
  intensityBias: 'gentle',
  durationMins:  15,
  position:      'floor',
  seatedRoute:   true,
  equipment:     [],

  // Named on the card so nobody meets them mid-class. Body-focused
  // attention is a real flag, not a formality: after trauma, during a
  // flare, or with some eating-disorder histories, being asked to notice
  // bodily sensation is not neutral. Every noticing beat below offers an
  // external alternative.
  flags:         ['floor-transfer', 'eyes-closed-offered', 'body-focused-attention'],

  /**
   * CLASS-2, 08 Sep 2026. The lighter variant.
   *
   * Drops the two hands-and-knees movements. Cat-Cow and Thread the
   * Needle both need a transfer onto all fours, which is the hardest
   * thing in this class on a bad day; knees-side-to-side is done lying
   * on the back and stays, so the class still has movement in it. A
   * movement class with no movement is not a gentler version of itself.
   *
   * The first noticing goes too, and that is the considered part: with
   * one movement instead of three there is no before-and-after to ask
   * about, and asking twice would be asking about nothing.
   *
   * What stays: arriving, a movement, the second noticing with its
   * "there might not be", the full three minutes of stillness, and the
   * closing line that is the whole class. Ten minutes.
   *
   * Chosen from thirty-eight structurally viable subtractions, on the
   * grounds that it is the only one that keeps a movement the person can
   * do without getting onto all fours.
   */
  lighter: {
    omitSections: ['first-noticing', 'cat-cow', 'thread']
  },

  // The eight sections the class is written in, with the durations it
  // states. They sum to durationMins and the contract asserts it.
  sections: [
    {
      id: 'arriving', title: 'Arriving', durationSeconds: 120,
      beats: [
        {
          kind:   'arriving',
          screen: 'Get comfortable on the floor. Lying on your back, knees bent, feet flat. A chair works just as well.',
          voice:  "Find somewhere to lie down, if that's available today. On your back, knees bent, feet flat on the floor. If the floor isn't happening — and some days it isn't — a chair is completely fine and nothing after this changes.",
          speechSeconds: 8
        },
        {
          // Deliberate: no breath control in the opening. This strand often
          // comes with a history of being told to breathe correctly, and
          // instructing the breath in the first minute makes the body a thing
          // to be managed -- the opposite of this class.
          kind:   'arriving',
          voice:  "Let your hands rest wherever they land. You don't have to do anything with them.",
          speechSeconds: 10
        },
        {
          kind:   'arriving',
          voice:  'No breathing instructions yet. Just let it be whatever it already is.',
          speechSeconds: 15
        }
      ]
    },
    {
      id: 'first-noticing', title: 'The first noticing', durationSeconds: 66,
      beats: [
        {
          // Location, not sensation. "Where" is answerable and has no wrong
          // answer; "how does it feel" is an evaluation, and for somebody
          // whose body has been unpredictable it is the harder question.
          kind:   'reflect',
          screen: 'Where are you touching the floor? Not how it feels. Just where.',
          voice:  "I'd like you to notice where your body is touching the floor. Not whether it feels good or bad. Just where the contact is.",
          speechSeconds: 12,
          practiceId: 'feet-on-floor-grounding'
        },
        {
          kind:   'reflect',
          voice:  'Heels. Maybe your hips. Shoulder blades, the back of your head.',
          speechSeconds: 15
        },
        {
          // The external alternative is offered BEFORE it is needed, not
          // after somebody has already found the question difficult.
          kind:   'reflect',
          voice:  "If noticing your body isn't somewhere you want to go today, listen for the furthest-away sound you can hear instead. That's the same practice."
        }
      ]
    },
    {
      id: 'cat-cow', title: 'Cat-Cow', durationSeconds: 120,
      beats: [
        {
          kind:   'movement',
          screen: 'Cat-Cow — on hands and knees, or seated in a chair. Move slowly. Stop anywhere that says stop.',
          voice:  "Come onto your hands and knees when you're ready. Or stay in the chair and let your spine do the same thing sitting up.",
          speechSeconds: 10,
          exerciseId: 'cat-cow',
          sitOut: true,
          seatedAlternativeId: 'cat-cow',
          stopCue: 'anywhere that says stop'
        },
        {
          kind:   'movement',
          voice:  "Let your back round upward. Slowly. Then let it drop the other way. There's no shape you're trying to reach.",
          speechSeconds: 20
        },
        {
          kind:   'movement',
          voice:  "If anywhere says stop, stop there. That's not you failing the movement — that's the movement telling you where it goes today.",
          speechSeconds: 25
        },
        {
          kind:   'movement',
          voice:  'Six or seven of those. In your own time.'
        }
      ]
    },
    {
      id: 'thread', title: 'Thread the Needle', durationSeconds: 120,
      beats: [
        {
          kind:   'movement',
          screen: 'Thread the Needle — one arm under the other, both sides. Only as far as it goes today.',
          voice:  'From hands and knees, slide one arm underneath the other, and let that shoulder come down towards the floor.',
          speechSeconds: 12,
          exerciseId: 'thread-the-needle',
          sitOut: true,
          seatedAlternativeId: 'thoracic-rotation-seated',
          stopCue: 'as far as it goes today'
        },
        {
          kind:   'movement',
          voice:  "You're not trying to get anywhere. Go until you feel it, and then stay there.",
          speechSeconds: 20
        },
        {
          kind:   'movement',
          voice:  'And back. Other side when you\u2019re ready.',
          speechSeconds: 25
        }
      ]
    },
    {
      id: 'second-noticing', title: 'The second noticing', durationSeconds: 60,
      beats: [
        {
          // 🔴 "There might not be" is load-bearing. See the header.
          kind:   'reflect',
          screen: 'Anything different? There might not be. That\u2019s an answer too.',
          voice:  'Come back to lying, or sitting. Whatever you started in.',
          speechSeconds: 10
        },
        {
          kind:   'reflect',
          voice:  "Is anything different from four minutes ago? It might not be. That's a real answer, not a failed one.",
          // CLASS-2b. On a lighter day two of the three movements are not
          // run, so "four minutes ago" names a stretch of time the person
          // did not have. In a class about whether you can trust what
          // your body reports, telling somebody they did four minutes of
          // something they did not do is the wrong kind of small error.
          // The load-bearing half of the line -- "there might not be" --
          // is untouched.
          lighterVoice: "Is anything different from a couple of minutes ago? There might not be. That's a real answer, not a failed one.",
          speechSeconds: 20
        }
      ]
    },
    {
      id: 'knees', title: 'Knees side to side', durationSeconds: 120,
      beats: [
        {
          kind:   'movement',
          screen: 'Knees side to side — slow, small, both directions. Small is the point, not a compromise.',
          voice:  'On your back, knees bent. Let them fall slowly to one side. Only as far as they want to go.',
          speechSeconds: 15,
          exerciseId: 'thoracic-rotation',
          sitOut: true,
          stopCue: 'only as far as they want to go'
        },
        {
          kind:   'movement',
          voice:  'Back through the middle. And the other side.',
          speechSeconds: 20
        },
        {
          kind:   'movement',
          voice:  "Small is fine. Small is the point. You're not measuring anything.",
          speechSeconds: 25
        }
      ]
    },
    {
      id: 'stillness', title: 'Stillness', durationSeconds: 188,
      beats: [
        {
          // Eyes closed is offered, never instructed. For a lot of people it
          // is the least safe part of a class like this.
          kind:   'rest',
          screen: 'Nothing to do for three minutes. Eyes closed if you want them closed.',
          voice:  "Let your legs go wherever they're comfortable. Arms wherever they land.",
          speechSeconds: 10
        },
        {
          kind:   'rest',
          voice:  "Eyes closed if that's alright. Open is completely fine.",
          speechSeconds: 30
        },
        {
          kind:   'rest',
          voice:  "Nothing to do now. You've done the moving part.",
          speechSeconds: 60
        },
        {
          kind:   'rest',
          voice:  "If your mind's gone somewhere, that's what minds do. You don't have to bring it back.",
          speechSeconds: 60
        }
      ]
    },
    {
      id: 'leaving', title: 'Leaving', durationSeconds: 106,
      beats: [
        {
          kind:   'closing',
          screen: "Take your time getting up. Roll to one side first if that's easier.",
          voice:  "When you're ready — and there's no rush — roll onto one side, and come up from there.",
          speechSeconds: 15
        },
        {
          // 🔴 THE CLOSING LINE IS THE WHOLE CLASS. See the header.
          kind:   'closing',
          voice:  "That's it. Fifteen minutes of moving, and your body did all of it.",
          speechSeconds: 8
        },
        {
          kind:   'closing',
          voice:  'See you next time.'
        }
      ]
    }
  ]
};