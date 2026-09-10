/**
 * data/classes/class-out-006.js
 *
 * 08 Sep 2026 v2
 *
 * v2 - PACING-1. Section durations rebalanced so each one holds its own
 *   content: tight sections grew, sections with slack gave the time back,
 *   and the CLASS TOTAL is unchanged. Nothing a person reads moved.
 *
 * 08 Sep 2026 v1
 *
 * CLASS-5. Class 006, "Out", as data. The first class that leaves the
 * room.
 *
 * Transcribed from
 * Documents/Admin/alongside_class_006_out_08sep2026_v1_DRAFT.md, which
 * stays the authored source. Where the two disagree the document is
 * right and this file is wrong.
 *
 * Serves `being-outside`, chosen over the two strands tied with it on 8
 * aims and NOT by count: `hip-range` duplicates what Ground and the
 * builder already do, and `not-overdoing` is already touched by Stopping
 * Early — two classes that feel like each other is worse than one strand
 * waiting. `being-outside` is untouched, and it is the one place a class
 * beats a built session outright: the builder can tell you to go for a
 * walk, it cannot go with you.
 *
 * ── THIS FILE LOOKS UNFINISHED AND IS NOT ────────────────────────────
 *
 * 🔴 THERE IS NO `screen` ON ANY BEAT. That is deliberate. The phone is
 * in a pocket and the person is watching traffic; screen text here would
 * be written for nobody. `screen` is optional in the contract, so
 * nothing enforces this either way — which is exactly why it is said
 * here in full, because the first reviewer will otherwise assume it was
 * never written.
 *
 * 🔴 THERE ARE NO `movement` BEATS. Also deliberate: the walk is the
 * movement and it has no start, no reps and no stop cue. The consequence
 * is that classSafety() cannot see this class at all — it judges
 * exercise ids, and there are none, so this passes for everybody in
 * every condition. CLASS-3 added the rule that a class in that position
 * must declare its own flags, which is why the flags below are longer
 * than any other class's and name things no exercise library holds:
 * weather, light, traffic, going out alone.
 *
 * 🔴 THE TIMINGS MEAN SOMETHING WEAKER HERE. Indoors, thirty seconds of
 * silence is thirty seconds of the exercise. Out here it might be a road
 * crossing, a neighbour or a dog. The numbers still shape the pacing and
 * nothing in the contract records the difference — the third appearance
 * of the distinction that split holdSeconds from speechSeconds, and
 * still an open question on the document.
 *
 * ⚫ Three questions stay open and are transcribed as drafted: whether
 * "Out" is too bare a name, whether going out alone needs saying, and
 * whether the class should have a view on weather.
 */

export const CLASS_OUT_006 = {
  id:            'class-out-006',
  title:         'Out',

  serves:        'being-outside',
  touches:       ['winding-down', 'at-home-in-body'],

  formats:       ['mindfulness'],
  intensityBias: 'gentle',
  durationMins:  15,

  // CLASS-3 added this value for this class. `standing` was technically
  // true of a walk and useless to somebody deciding whether they can do
  // it today.
  position:      'walking',

  equipment:     [],

  // Longer than any other class's, and required: nothing here is visible
  // to the safety filter, so these flags are the only warning that
  // reaches the person from any direction.
  flags:         ['outdoors', 'going-alone', 'uneven-ground', 'weather-and-light'],

  // The two that come out are the two that ask the person to DO
  // something. What remains is: put your coat on, be outside, come back.
  // The noticing is the part that can wait; the being outside is the
  // part that cannot.
  //
  // ⚫ OPEN ON THE DOCUMENT: somebody who cannot leave the house at all
  // is not served by a shorter walk, and this class has no answer for
  // them. That may well be correct — a class about being outside cannot
  // be done inside — but it should be a decision, not an omission.
  lighter: {
    omitSections: ['far-away', 'underfoot']
  },

  sections: [
    {
      id: 'before', title: 'Before you go out', durationSeconds: 120,
      beats: [
        {
          kind: 'arriving',
          voice: 'This one happens outside, so before you set off — coat, shoes, whatever the weather is doing.',
          speechSeconds: 20
        },
        {
          kind: 'arriving',
          voice: "Anywhere will do. It doesn't have to be nice. A pavement is completely fine.",
          speechSeconds: 20
        },
        {
          // 🔴 The load-bearing line of this class. Nothing here can be
          // timed against what the person is actually doing, so saying so
          // at the start is what stops them feeling they have fallen
          // behind a script they cannot keep up with.
          kind: 'arriving',
          voice: "I'll say something every few minutes and be quiet in between. If you need to stop, or turn back, or take your headphones out at a road — do that. The class survives being interrupted. It isn't a set of instructions you can get out of step with.",
          speechSeconds: 25
        },
        { kind: 'arriving', voice: 'Off you go.' }
      ]
    },

    {
      id: 'first-bit', title: 'The first bit', durationSeconds: 170,
      note: 'The longest near-silence in any class. Indoors, silence is something to justify; out here it is the default and the talking is the interruption.',
      beats: [
        {
          kind: 'rest',
          voice: 'No particular pace. Whatever your legs are doing is the right speed.',
          speechSeconds: 60
        },
        {
          kind: 'rest',
          voice: "You don't have to look at anything yet. Just walking.",
          speechSeconds: 90
        }
      ]
    },

    {
      id: 'far-away', title: 'Something far away', durationSeconds: 163,
      beats: [
        {
          kind: 'reflect',
          voice: 'Find something a long way off. A building, a tree, the end of the road. Anything further away than you have looked all day.',
          speechSeconds: 40,
          practiceId: 'mindful-walk'
        },
        {
          kind: 'reflect',
          voice: 'Most of today has probably happened within about a metre of your face. Screens, worktops, the inside of a car.',
          speechSeconds: 45
        },
        {
          kind: 'reflect',
          voice: 'Let your eyes be somewhere else for a bit.',
          speechSeconds: 45
        }
      ]
    },

    {
      id: 'underfoot', title: 'Something under your feet', durationSeconds: 162,
      beats: [
        {
          kind: 'reflect',
          voice: 'Notice what you\u2019re walking on. Not how it feels about you — just what it is. Pavement, grass, gravel, mud.',
          speechSeconds: 45
        },
        {
          kind: 'reflect',
          voice: "It changes more than you'd think on a short walk. Most people stop noticing that somewhere around the age of eight.",
          speechSeconds: 50
        },
        {
          // The external alternative, offered BEFORE it is needed. Third
          // class to carry it, which makes it a house rule rather than a
          // per-class decision.
          kind: 'reflect',
          voice: "If noticing your feet isn't where you want to be today, listen for the furthest-away sound instead. Same thing.",
          speechSeconds: 30
        }
      ]
    },

    {
      id: 'the-air', title: 'The air', durationSeconds: 115,
      beats: [
        {
          kind: 'reflect',
          voice: 'Notice the air on the bit of you that\u2019s uncovered. Face, usually. Hands.',
          speechSeconds: 40
        },
        {
          // 🔴 Same instruction as Ground's "where, not how it feels",
          // and it matters more outdoors because British weather invites
          // a verdict. The class is not asking anybody to enjoy the rain.
          // It asks them to notice they are in it, which is a different
          // and much easier thing.
          kind: 'reflect',
          voice: 'Cold, warm, damp, still. Not whether you like it. Just what it is.',
          speechSeconds: 50
        }
      ]
    },

    {
      id: 'heading-back', title: 'Heading back', durationSeconds: 115,
      beats: [
        {
          kind: 'rest',
          voice: "Start heading back whenever suits. There's no distance you were supposed to reach.",
          speechSeconds: 45
        },
        {
          kind: 'rest',
          voice: "You've been outside for about a quarter of an hour. That's the whole thing — there wasn't a second part.",
          lighterVoice: "You've been outside for about ten minutes. That's the whole thing — there wasn't a second part.",
          speechSeconds: 45
        }
      ]
    },

    {
      id: 'back', title: 'Back', durationSeconds: 55,
      beats: [
        {
          kind: 'closing',
          voice: 'Whenever you get in — no rush, and no need to finish this bit outside.',
          speechSeconds: 20
        },
        {
          // 🔴 The same shape as Ground's "your body did all of it": a
          // statement of what happened, meaning left to the person. NOT
          // "well done for getting out", which would make going outside
          // an achievement — and this strand belongs to people for whom
          // it is supposed to become ordinary.
          kind: 'closing',
          voice: "That's it. You went outside on purpose.",
          speechSeconds: 10
        },
        { kind: 'closing', voice: 'See you next time.' }
      ]
    }
  ]
};
