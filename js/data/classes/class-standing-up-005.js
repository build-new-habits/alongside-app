/**
 * data/classes/class-standing-up-005.js
 *
 * 08 Sep 2026 v2
 *
 * v2 - PACING-1. Section durations rebalanced so each one holds its own
 *   content: tight sections grew, sections with slack gave the time back,
 *   and the CLASS TOTAL is unchanged. Nothing a person reads moved.
 *
 * 08 Sep 2026 v1
 *
 * CLASS-5. Class 005, "Standing Up", as data.
 *
 * Transcribed from
 * Documents/Admin/alongside_class_005_standing_up_08sep2026_v1_DRAFT.md,
 * which stays the authored source. Where the two disagree the document
 * is right and this file is wrong.
 *
 * Serves `leg-strength` — the next strand in Graeme's own aim beneath
 * the three his card displays, AND the most-wanted unserved strand
 * across all 33 aims at 12, more than double anything else uncovered.
 * Two reasons converging on one strand.
 *
 * 🔴 THIS IS THE STRAND MOST LIKELY TO BE A SESSION RATHER THAN A CLASS,
 * and the class has to earn the difference. The builder does leg
 * strength perfectly well — sets, reps, progression. If this is a worse
 * version of that it should not exist.
 *
 * What it adds is what the twelve aims are actually about: off the
 * floor · up the stairs · carrying the shopping · picking up somebody I
 * love · steadier on my feet · keep doing things for myself. TEN OF THE
 * TWELVE ARE THINGS PEOPLE DO, not numbers they want to hit. Only
 * lift-heavier and get-faster are performance.
 *
 * So it is not leg day. It is four things you already do, done on
 * purpose, named for what they are for.
 *
 * ⚫ IT NEVER SAYS "FUNCTIONAL". That word belongs to the people who
 * write about this, not the people doing it. The class says "this one is
 * stairs" and lets that be the whole explanation.
 *
 * ⚫ THREE QUESTIONS STAY OPEN on the document and are transcribed as
 * drafted: the name, whether needing a wall and a step makes the lighter
 * variant do two jobs at once, and whether "carrying something heavy
 * while you find your keys" is too specific to be everybody's life.
 */

export const CLASS_STANDING_UP_005 = {
  id:            'class-standing-up-005',
  title:         'Standing Up',

  serves:        'leg-strength',
  touches:       ['confidence-floor', 'gentle-capacity'],

  formats:       ['strength'],
  intensityBias: 'gentle',
  durationMins:  15,
  position:      'standing',
  seatedRoute:   false,
  equipment:     [],
  flags:         ['standing-throughout', 'one-held-position', 'needs-a-chair'],

  // The two that come out are the two needing something other than the
  // chair — a step, and a wall to slide down — and they are also the two
  // that load hardest. What remains can be done sitting in one place,
  // and one of the two has a seated route.
  //
  // ⚫ OPEN ON THE DOCUMENT: that makes a lighter day also the version
  // for somebody with neither a step nor a wall, which conflates a bad
  // day with a small flat. Convenient, possibly too convenient.
  lighter: {
    omitSections: ['step-up', 'wall-sit']
  },

  sections: [
    {
      id: 'before', title: 'Before we start', durationSeconds: 73,
      beats: [
        {
          kind: 'arriving',
          screen: "Four things you already do. A chair, and a wall or a bottom step. That's it.",
          voice: "You'll want a chair for this one, and a wall or the bottom step of the stairs.",
          speechSeconds: 10
        },
        {
          // ⚫ The load-bearing sentence of the opening, and the reason
          // this is a class and not a session. Legs get trained; this
          // names what the training is already for, which is what
          // somebody tired of exercising needs to hear first.
          kind: 'arriving',
          voice: 'Four movements, and you already do all four of them. Getting out of a chair. Going up a step. Going up on your toes. Holding still against a wall.',
          lighterVoice: 'Two movements, and you already do both of them. Getting out of a chair. Going up on your toes.',
          speechSeconds: 12
        },
        {
          kind: 'arriving',
          voice: "We're doing them on purpose, that's all. Nothing here is a new skill.",
          speechSeconds: 15
        }
      ]
    },

    {
      id: 'sit-to-stand', title: 'Getting out of a chair', durationSeconds: 172,
      beats: [
        {
          // 🔴 The stop cue for the whole class, doing the same job as
          // Steady Round's smoothness: observable, arriving before
          // anything goes wrong, and NOT requiring the person to judge
          // their own effort — the judgement most likely to be wrong in
          // both directions.
          kind: 'movement',
          screen: 'Sit to stand — no hands if you can, hands if you need them. Stop while the last one still looks like the first.',
          voice: "Sit towards the front of the chair, feet flat. Stand up, and sit back down. Slowly on the way down — that's the half most people give away.",
          speechSeconds: 20,
          exerciseId: 'sit-to-stand',
          sitOut: true,
          stopCue: 'while the last one still looks like the first'
        },
        {
          kind: 'movement',
          voice: "Hands on your knees is completely fine and it isn't cheating. Most people who can do this without hands got there by doing it with hands first.",
          speechSeconds: 30
        },
        {
          kind: 'movement',
          voice: "Keep going for a bit. And here's your stopping point: stop while the last one still looks like the first one did.",
          speechSeconds: 40
        },
        {
          kind: 'movement',
          voice: "This is the one that's getting off the sofa, and out of the car, and off the floor eventually.",
          speechSeconds: 25
        }
      ]
    },

    {
      id: 'what-that-was-like', title: 'What that was like', durationSeconds: 66,
      note: 'A reflect beat that UNDOES the counting rather than gathering it. In a strength class the expected question is how many you managed, and asking it would turn the session into a score.',
      beats: [
        {
          kind: 'reflect',
          screen: "How many was that? You don't have to know. Nobody was counting.",
          voice: "How many was that? You don't have to know — I wasn't counting and neither was the app.",
          speechSeconds: 25
        },
        {
          kind: 'reflect',
          voice: "If you found yourself counting anyway, that's worth noticing. Most of us were taught to.",
          speechSeconds: 20
        }
      ]
    },

    {
      id: 'step-up', title: 'Going up a step', durationSeconds: 167,
      beats: [
        {
          kind: 'movement',
          screen: 'Step-up — bottom step, or a low step, or the kerb outside. Lead with the same leg for a bit, then swap.',
          voice: "Find your step. The bottom stair is ideal. Low is better than high — this isn't about how big the step is.",
          speechSeconds: 20,
          exerciseId: 'step-up-glute-focus',
          sitOut: true,
          stopCue: 'while the last one still looks like the first'
        },
        {
          kind: 'movement',
          voice: 'Step up with one leg, bring the other to meet it, and come back down. Hold the bannister or the wall. Everybody holds something.',
          speechSeconds: 35
        },
        {
          kind: 'movement',
          voice: "Same leg leading for a while, then swap. You'll have a side that's easier. That's normal and it's information, not a fault.",
          speechSeconds: 40
        },
        {
          kind: 'movement',
          voice: "This one is stairs. That's the whole reason it's here.",
          speechSeconds: 25
        }
      ]
    },

    {
      id: 'calf-raise', title: 'Going up on your toes', durationSeconds: 109,
      beats: [
        {
          kind: 'movement',
          screen: 'Calf raise — standing at the chair, or seated. Slow up, slower down.',
          voice: 'Stand behind the chair and hold the back of it. Come up onto your toes, and down slowly.',
          speechSeconds: 20,
          exerciseId: 'chair-supported-calf-raise',
          sitOut: true,
          seatedAlternativeId: 'seated-calf-raise',
          stopCue: 'while the last one still looks like the first'
        },
        {
          kind: 'movement',
          voice: "If standing isn't the thing today, do it sitting down — same movement, and it still counts.",
          speechSeconds: 25
        },
        {
          kind: 'movement',
          voice: "Slow on the way down. That's where this one actually happens.",
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'wall-sit', title: 'Holding still', durationSeconds: 137,
      beats: [
        {
          kind: 'movement',
          screen: 'Wall sit — as low as is comfortable, which may not be very low. Come out of it while it\u2019s still steady.',
          voice: 'Back against the wall, and slide down as far as is comfortable. That might be barely at all, and barely at all is a real wall sit.',
          speechSeconds: 20,
          exerciseId: 'isometric-wall-sit',
          sitOut: true,
          stopCue: "while it's still steady"
        },
        {
          // 🔴 holdSeconds. NEVER scaled by a pacing choice. Second
          // instance in the set after Steady Round's plank, in an
          // unrelated movement in an unrelated class — which makes the
          // field a pattern rather than a special case.
          kind: 'movement',
          voice: "Hold it while it's steady. Come out before the shaking starts — the shaking isn't the good bit, it's the exercise finishing without you noticing.",
          holdSeconds: 30
        },
        {
          kind: 'movement',
          voice: "Stand up when you're ready.",
          speechSeconds: 20
        },
        {
          kind: 'movement',
          voice: "That's the one that's carrying something heavy while you find your keys.",
          speechSeconds: 25
        }
      ]
    },

    {
      id: 'settling', title: 'Settling', durationSeconds: 147,
      beats: [
        {
          kind: 'rest',
          screen: 'Done. Four things you already do, done on purpose.',
          voice: "Sit down. Let your legs be heavy — they've earned it.",
          speechSeconds: 40
        },
        {
          kind: 'rest',
          voice: 'Four movements, and every one of them was something you already do in a normal week. Now they\u2019ve had some attention.',
          lighterVoice: 'Two movements, and both of them are things you already do in a normal week. Now they\u2019ve had some attention.',
          speechSeconds: 45
        },
        {
          // 🔴 Third instance of the same refusal across the set, after
          // Stopping Early's "later in the week — not now" and Bending's
          // "not a today question". The class never claims a result it
          // cannot show you.
          kind: 'rest',
          voice: "Legs get better slowly and quietly. You'll notice it on a staircase in a month, not in this chair now.",
          speechSeconds: 30
        }
      ]
    },

    {
      id: 'leaving', title: 'Leaving', durationSeconds: 29,
      beats: [
        {
          kind: 'closing',
          screen: 'See you next time.',
          voice: "That's it. Nothing dramatic, which is rather the point with legs.",
          speechSeconds: 15
        },
        { kind: 'closing', voice: 'See you next time.' }
      ]
    }
  ]
};
