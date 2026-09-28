/**
 * data/classes/class-from-the-feet-010.js
 *
 * 28 Sep 2026 v1
 *
 * F8, CLASS-8. Class 010, "From the Feet", as data. The readable script
 * is rendered from this file (tools/render-class-doc.mjs).
 *
 * Serves `ankle-range` — six aims, none served, and the strand the rest
 * of the set stands on: balance, keep-walking and getting up the stairs
 * all start at the ankle, and nobody looks at theirs until they have to.
 *
 * ── THE PROBLEM THIS CLASS HAS ───────────────────────────────────────
 *
 * 🔴 Ankle work is where one side is very often different from the
 * other, and people read that as something wrong. The class says so
 * before it happens: a difference between sides is information, not a
 * problem, and it is not the class's job to even it out today.
 *
 * And the same refusal as the others: whether it changes how you walk is
 * a question for weeks from now. Protected line in verify-class-contract.
 *
 * ⚫ Mostly seated. The two standing sections hold a wall or a chair, and
 * both have seated routes, so the whole class can be done sitting.
 */

export const CLASS_FROM_THE_FEET_010 = {
  id:            'class-from-the-feet-010',
  title:         'From the Feet',

  serves:        'ankle-range',
  touches:       ['balance', 'keep-walking'],

  formats:       ['stretch', 'strength'],
  intensityBias: 'gentle',
  durationMins:  9,
  position:      'seated',
  seatedRoute:   true,
  equipment:     [],
  flags:         ['mostly-seated', 'standing-with-support', 'no-floor'],

  lighter: {
    omitSections: ['calf-raise', 'wall']
  },

  sections: [
    {
      id: 'before', title: 'Before we start', durationSeconds: 55,
      note: 'Said before the first movement, so a difference between sides arrives as expected rather than as a worry.',
      beats: [
        {
          kind: 'arriving',
          screen: 'Ankles and feet. Sitting down. One side may feel different from the other — that is common.',
          voice: "This one's ankles and feet, and most of it is sitting down. Shoes off if you can.",
          speechSeconds: 8
        },
        {
          kind: 'arriving',
          voice: "One side will probably feel different from the other. That's very common, and it's information, not a problem. We're not trying to make them match today.",
          speechSeconds: 10
        }
      ]
    },

    {
      id: 'circles', title: 'Circles', durationSeconds: 75,
      beats: [
        {
          kind: 'movement',
          screen: 'Ankle circles — one foot off the floor, slow circles each way.',
          voice: 'Lift one foot a little off the floor and draw slow circles with it. One way, then the other.',
          speechSeconds: 15,
          exerciseId: 'ankle-mobility-circles',
          sitOut: true,
          stopCue: 'only as big as moves easily'
        },
        {
          kind: 'movement',
          voice: "Now the other foot. Notice whether it's different. Just notice.",
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'alphabet', title: 'Alphabet', durationSeconds: 80,
      beats: [
        {
          kind: 'movement',
          screen: 'Write letters in the air with your big toe. A few letters, then swap feet.',
          voice: 'Write the letters of your name in the air with your big toe. Movement from the ankle, not the whole leg.',
          speechSeconds: 15,
          exerciseId: 'ankle-alphabet',
          sitOut: true,
          stopCue: 'small letters are fine'
        },
        {
          kind: 'movement',
          voice: 'Swap feet. Small letters are fine. Nobody is marking the handwriting.',
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'heel-toe', title: 'Heels and toes', durationSeconds: 75,
      beats: [
        {
          kind: 'movement',
          screen: 'Feet flat. Lift the heels, lower. Lift the toes, lower. Rock between them.',
          voice: 'Both feet flat. Lift your heels and lower them. Then lift your toes and lower them. Rock slowly between the two.',
          speechSeconds: 15,
          exerciseId: 'seated-heel-toe-raise',
          sitOut: true,
          stopCue: 'a smooth rock, nothing forced'
        },
        {
          kind: 'movement',
          voice: 'Keep rocking at your own pace.',
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'calf-raise', title: 'Up on your toes', durationSeconds: 85,
      beats: [
        {
          kind: 'movement',
          screen: 'Standing, holding the chair: up onto your toes, down slowly. Or stay seated and lift the heels.',
          voice: 'If standing is fine today, hold the back of the chair, rise onto your toes and lower slowly. Or stay sitting and lift your heels as high as they go.',
          speechSeconds: 15,
          exerciseId: 'chair-supported-calf-raise',
          sitOut: true,
          seatedAlternativeId: 'seated-calf-raise',
          stopCue: 'as high as is comfortable'
        },
        {
          kind: 'movement',
          voice: 'A few more. The lowering is the useful half, so take your time on the way down.',
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'wall', title: 'Knee to the wall', durationSeconds: 95,
      beats: [
        {
          kind: 'movement',
          screen: 'Facing a wall, one foot forward: bend the knee towards the wall, heel down. Or seated, slide the foot back under the chair.',
          voice: 'Stand facing a wall, one foot a short way in front of you. Bend that knee towards the wall, keeping the heel on the floor. Or sit, and slide one foot back under the chair until you feel the front of the ankle.',
          speechSeconds: 15,
          exerciseId: 'ankle-wall-dorsiflexion',
          sitOut: true,
          seatedAlternativeId: 'ankle-alphabet',
          stopCue: 'heel stays down'
        },
        {
          kind: 'movement',
          voice: 'Other foot. If one side goes further, that is the information we talked about.',
          speechSeconds: 35
        }
      ]
    },

    {
      id: 'leaving', title: 'Leaving', durationSeconds: 75,
      beats: [
        {
          kind: 'reflect',
          screen: 'Stand or sit with feet flat. Notice the floor under you.',
          voice: 'Feet flat on the floor. Notice where your weight sits — more on the heels, the toes, one side. Nothing to fix.',
          speechSeconds: 20
        },
        {
          kind: 'closing',
          screen: 'Whether this changes how you walk is a question for weeks from now, not today.',
          voice: "Whether any of this changes how you walk is a question for weeks from now, not today. Today your ankles got asked. That's the class.",
          speechSeconds: 12
        }
      ]
    }
  ]
};
